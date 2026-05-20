import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { auth } from "@/lib/auth";
import { supabaseAdmin, type Course } from "@/lib/supabase-admin";

export const metadata = { title: "Saját tartalom" };
export const dynamic = "force-dynamic";

export default async function LearnIndex() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/learn");
  }

  const { data, error } = await supabaseAdmin
    .from("memberships")
    .select("course_id, granted_at, courses(*)")
    .eq("user_id", session.user.id);
  if (error) {
    return (
      <>
        <Header active="/learn" member />
        <main id="main" className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Hiba</SectionLabel>
            <p className="mt-6 font-sans text-base text-foreground-soft">
              Nem sikerült betölteni a tartalmadat: {error.message}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const courses = (data ?? [])
    .map((row) => row.courses as unknown as Course)
    .filter(Boolean);

  // Lecke-számok kurzusonként + saját progress
  const courseStats = new Map<string, { total: number; done: number }>();
  if (courses.length > 0) {
    const courseIds = courses.map((c) => c.id);
    const { data: modules } = await supabaseAdmin
      .from("course_modules")
      .select("id, course_id")
      .in("course_id", courseIds);
    const moduleIds = (modules ?? []).map((m) => m.id as string);
    const moduleToCourse = new Map<string, string>(
      (modules ?? []).map((m) => [m.id as string, m.course_id as string]),
    );

    if (moduleIds.length > 0) {
      const { data: lessons } = await supabaseAdmin
        .from("course_lessons")
        .select("id, module_id")
        .in("module_id", moduleIds);
      const lessonToCourse = new Map<string, string>();
      for (const l of lessons ?? []) {
        const cid = moduleToCourse.get(l.module_id as string);
        if (cid) lessonToCourse.set(l.id as string, cid);
      }
      // Init totals
      for (const cid of courseIds) courseStats.set(cid, { total: 0, done: 0 });
      for (const cid of lessonToCourse.values()) {
        const s = courseStats.get(cid)!;
        s.total += 1;
      }
      // Done count
      const { data: progress } = await supabaseAdmin
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", session.user.id);
      for (const p of progress ?? []) {
        const cid = lessonToCourse.get(p.lesson_id as string);
        if (cid) {
          const s = courseStats.get(cid)!;
          s.done += 1;
        }
      }
    }
  }

  return (
    <>
      <Header active="/learn" member />
      <main id="main">
        <section className="border-b border-border py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Saját tartalom</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              {session.user.email}
            </h1>
            <p className="mt-8 font-sans text-base text-foreground-soft md:text-lg">
              {courses.length === 0
                ? "Még nincs aktív kurzusod. Nézd meg a kurzusokat."
                : `Aktív hozzáférések: ${courses.length}.`}
            </p>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            {courses.length === 0 ? (
              <Link
                href="/courses"
                className="hover-arrow group inline-block border border-foreground bg-foreground px-8 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Kurzusok megnyitása <span className="arrow">→</span>
              </Link>
            ) : (
              <div className="grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-2">
                {courses.map((c) => {
                  const s = courseStats.get(c.id) ?? { total: 0, done: 0 };
                  const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
                  return (
                    <Link
                      key={c.id}
                      href={`/learn/${c.slug}/1`}
                      className="hover-arrow group flex flex-col border-b border-r border-border-strong transition-colors hover:bg-surface"
                    >
                      {c.cover_image_url && (
                        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border-strong">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.cover_image_url}
                            alt=""
                            className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-8 lg:p-12">
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
                            Aktív kurzus
                          </div>
                          {s.total > 0 && (
                            <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-accent-mint)]">
                              {s.done} / {s.total} lecke · {pct}%
                            </div>
                          )}
                        </div>
                        <h2 className="mt-6 font-display text-3xl italic tracking-tight md:text-4xl">
                          {c.title}
                        </h2>
                        {c.subtitle && (
                          <p className="mt-5 max-w-prose font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
                            {c.subtitle}
                          </p>
                        )}
                        {/* Progress bar */}
                        {s.total > 0 && (
                          <div className="mt-8 h-px w-full bg-border">
                            <div
                              className="h-px bg-[var(--color-accent-mint)] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                        <div className="mt-auto pt-10 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
                          Folytatás <span className="arrow">→</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
