import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { auth } from "@/lib/auth";
import { getCourseBySlug, getCourseModulesWithLessons, userHasMembership } from "@/lib/courses";
import { sanitizeHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return { title: course.title, description: course.subtitle ?? undefined };
}

export default async function CourseDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const modules = await getCourseModulesWithLessons(course.id);
  const session = await auth();
  const isMember = Boolean(
    session?.user?.id && (await userHasMembership(session.user.id, course.id)),
  );

  return (
    <>
      <Header active="/courses" member={Boolean(session?.user)} />
      <main id="main">
        <section className="border-b border-border py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>
              Kurzus · {course.price_huf
                ? `${new Intl.NumberFormat("hu-HU").format(course.price_huf)} Ft`
                : "Hamarosan"}
            </SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight text-balance md:text-6xl lg:text-7xl">
              <em className="italic em-rose">{course.title}</em>
            </h1>
            {course.subtitle && (
              <p className="mt-8 max-w-prose font-sans text-lg leading-relaxed text-foreground-soft md:text-xl">
                {course.subtitle}
              </p>
            )}
            {course.description && (
              <div
                className="mt-8 max-w-prose font-sans text-base leading-relaxed text-foreground-soft"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.description) }}
              />
            )}

            <div className="mt-10">
              {isMember ? (
                <Link
                  href={`/learn/${course.slug}/1`}
                  className="hover-arrow group inline-block border border-foreground bg-foreground px-8 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                >
                  Indítás <span className="arrow">→</span>
                </Link>
              ) : session?.user?.id ? (
                <form action="/api/checkout" method="post">
                  <input type="hidden" name="course_id" value={course.id} />
                  <button
                    type="submit"
                    className="hover-arrow group inline-block border border-foreground bg-foreground px-8 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                  >
                    Megveszem · {course.price_huf
                      ? `${new Intl.NumberFormat("hu-HU").format(course.price_huf)} Ft`
                      : "Hamarosan"} <span className="arrow">→</span>
                  </button>
                </form>
              ) : (
                <Link
                  href={`/login?callbackUrl=/courses/${course.slug}`}
                  className="hover-arrow group inline-block border border-foreground bg-foreground px-8 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                >
                  Belépés a vásárláshoz <span className="arrow">→</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-20">
            <SectionLabel>Tartalom</SectionLabel>
            <h2 className="mt-6 font-display text-3xl italic tracking-tight md:text-4xl">
              Modulok és leckék
            </h2>

            {modules.length === 0 ? (
              <p className="mt-8 font-sans text-base text-foreground-soft">
                A tartalom betöltés alatt.
              </p>
            ) : (
              <ol className="mt-10 space-y-10">
                {modules.map((m, idx) => (
                  <li key={m.id}>
                    <div className="flex items-baseline justify-between border-b border-border pb-3">
                      <h3 className="font-display text-xl italic">{m.title}</h3>
                      <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                        {String(idx + 1).padStart(2, "0")} · {m.lessons.length} lecke
                      </span>
                    </div>
                    {m.description && (
                      <p className="mt-4 max-w-prose font-sans text-sm text-foreground-soft">
                        {m.description}
                      </p>
                    )}
                    <ol className="mt-5 space-y-3">
                      {m.lessons.map((l, lessonIdx) => (
                        <li
                          key={l.id}
                          className="flex items-start justify-between gap-4 font-sans text-sm"
                        >
                          <span className="text-foreground-soft">
                            <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                              {String(lessonIdx + 1).padStart(2, "0")}
                            </span>{" "}
                            {l.title}
                          </span>
                          {l.is_preview && (
                            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--color-accent-sky)]">
                              Ingyenes
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
