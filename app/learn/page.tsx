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
                {courses.map((c) => (
                  <Link
                    key={c.id}
                    href={`/learn/${c.slug}/1`}
                    className="hover-arrow group border-b border-r border-border-strong p-8 transition-colors hover:bg-surface lg:p-12"
                  >
                    <div className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
                      Aktív kurzus
                    </div>
                    <h2 className="mt-6 font-display text-3xl italic tracking-tight md:text-4xl">
                      {c.title}
                    </h2>
                    {c.subtitle && (
                      <p className="mt-5 max-w-prose font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
                        {c.subtitle}
                      </p>
                    )}
                    <div className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
                      Folytatás <span className="arrow">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
