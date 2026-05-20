import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { auth } from "@/lib/auth";
import {
  getCourseBySlug,
  getCourseModulesWithLessons,
  getLessonByPosition,
  userHasMembership,
} from "@/lib/courses";
import { signStreamToken, streamIframeUrl } from "@/lib/cloudflare-stream";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sanitizeHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

type Params = { course: string; position: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { course, position } = await params;
  const found = await getLessonByPosition(course, Number(position));
  if (!found) return {};
  return { title: `${found.lesson.title} · ${found.course.title}` };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { course: courseSlug, position: positionRaw } = await params;
  const position = Number(positionRaw);
  if (!Number.isFinite(position) || position < 1) notFound();

  const session = await auth();
  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  const found = await getLessonByPosition(courseSlug, position);
  if (!found) notFound();
  const { lesson } = found;

  const isMember = Boolean(
    session?.user?.id && (await userHasMembership(session.user.id, course.id)),
  );
  if (!isMember && !lesson.is_preview) {
    redirect(`/courses/${courseSlug}`);
  }

  const modules = await getCourseModulesWithLessons(course.id);
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ moduleTitle: m.title, lesson: l })),
  );
  const totalLessons = allLessons.length;
  const prev = position > 1 ? position - 1 : null;
  const next = position < totalLessons ? position + 1 : null;

  // Cloudflare Stream signed URL (only if there is a video)
  let videoIframeSrc: string | null = null;
  if (lesson.cloudflare_stream_uid) {
    try {
      const token = await signStreamToken({ videoUid: lesson.cloudflare_stream_uid });
      videoIframeSrc = streamIframeUrl(token);
    } catch {
      videoIframeSrc = null;
    }
  }

  // Completed lessons for sidebar checkmarks
  let completed = new Set<string>();
  if (session?.user?.id) {
    const { data: progress } = await supabaseAdmin
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", session.user.id);
    completed = new Set((progress ?? []).map((p) => p.lesson_id as string));
  }

  return (
    <>
      <Header active="/learn" member={Boolean(session?.user)} />
      <main id="main" className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar — mobile: <details> drawer, desktop: sticky */}
          <aside className="border-b border-border-strong px-6 py-4 lg:border-b-0 lg:border-r lg:py-12 lg:pl-10 lg:pr-6">
            <details open className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground lg:hidden">
                <span>Tartalomjegyzék · {totalLessons} lecke</span>
                <span className="font-display text-base text-foreground-muted transition-transform group-open:rotate-180">▾</span>
              </summary>
            <div className="sticky top-6 mt-4 lg:mt-0">
              <SectionLabel>{course.title}</SectionLabel>
              <ol className="mt-6 space-y-6 font-sans text-sm">
                {modules.map((m, midx) => (
                  <li key={m.id}>
                    <div className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-foreground-muted">
                      {String(midx + 1).padStart(2, "0")} · {m.title}
                    </div>
                    <ul className="mt-3 space-y-2">
                      {m.lessons.map((l) => {
                        const flatIdx = allLessons.findIndex((x) => x.lesson.id === l.id) + 1;
                        const isActive = flatIdx === position;
                        const isDone = completed.has(l.id);
                        const isLocked = !isMember && !l.is_preview;
                        const cls = `block border-l-2 pl-3 transition-colors ${
                          isActive
                            ? "border-[var(--color-accent-violet)] text-foreground"
                            : isLocked
                              ? "border-transparent text-foreground-dim cursor-not-allowed"
                              : "border-transparent text-foreground-soft hover:text-foreground"
                        }`;
                        const inner = (
                          <>
                            <span className="font-mono text-[0.65rem] text-foreground-muted">
                              {String(flatIdx).padStart(2, "0")}
                            </span>{" "}
                            {l.title}
                            {isDone && (
                              <span className="ml-2 text-[var(--color-accent-mint)]">✓</span>
                            )}
                            {isLocked && (
                              <span className="ml-2 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-dim">
                                zárt
                              </span>
                            )}
                            {!isMember && l.is_preview && (
                              <span className="ml-2 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-[var(--color-accent-sky)]">
                                ingyenes
                              </span>
                            )}
                          </>
                        );
                        return (
                          <li key={l.id}>
                            {isLocked ? (
                              <span className={cls} aria-disabled="true">{inner}</span>
                            ) : (
                              <Link href={`/learn/${course.slug}/${flatIdx}`} className={cls}>
                                {inner}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
            </details>
          </aside>

          {/* Main content */}
          <article className="px-6 py-12 lg:px-12 lg:py-16">
            {!isMember && lesson.is_preview && (
              <div className="mb-10 flex flex-col gap-4 border border-border-strong bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--color-accent-sky)]">
                    Ingyenes minta lecke
                  </div>
                  <div className="mt-2 font-sans text-sm text-foreground-soft">
                    A többi lecke a teljes hozzáférés megvásárlása után érhető el.
                  </div>
                </div>
                <Link
                  href={`/courses/${course.slug}`}
                  className="hover-arrow group whitespace-nowrap border border-foreground bg-foreground px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                >
                  Teljes hozzáférés <span className="arrow">→</span>
                </Link>
              </div>
            )}
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
              Lecke {String(position).padStart(2, "0")} / {String(totalLessons).padStart(2, "0")}
            </div>
            <h1 className="mt-4 font-display text-4xl italic tracking-tight md:text-5xl">
              {lesson.title}
            </h1>

            {videoIframeSrc && (
              <div className="mt-10 aspect-video w-full overflow-hidden border border-border-strong bg-background">
                <iframe
                  src={videoIframeSrc}
                  loading="lazy"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  className="h-full w-full"
                  title={lesson.title}
                />
              </div>
            )}

            {lesson.body_html && (
              <div
                className="prose mt-10 max-w-prose font-sans text-base leading-relaxed text-foreground-soft"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.body_html) }}
              />
            )}

            {/* Footer nav + progress */}
            <div className="mt-16 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                {prev ? (
                  <Link
                    href={`/learn/${course.slug}/${prev}`}
                    className="hover-arrow group font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground"
                  >
                    ← Előző
                  </Link>
                ) : null}
                {next ? (
                  <Link
                    href={`/learn/${course.slug}/${next}`}
                    className="hover-arrow group font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground"
                  >
                    Következő <span className="arrow">→</span>
                  </Link>
                ) : null}
              </div>

              {isMember && (
                <form action="/api/progress" method="post">
                  <input type="hidden" name="lesson_id" value={lesson.id} />
                  <input type="hidden" name="redirect_to" value={`/learn/${course.slug}/${next ?? position}`} />
                  <button
                    type="submit"
                    className="hover-arrow group border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                  >
                    Kész vagyok <span className="arrow">→</span>
                  </button>
                </form>
              )}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
