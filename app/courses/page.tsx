import Link from "next/link";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { getPublishedCourses } from "@/lib/courses";

export const metadata = { title: "Kurzusok" };
export const dynamic = "force-dynamic";

export default async function CoursesIndex() {
  const courses = await getPublishedCourses();

  return (
    <>
      <Header active="/courses" />
      <main id="main">
        <section className="border-b border-border py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Kurzusok</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight text-balance md:text-6xl lg:text-7xl">
              Minden <em className="italic em-violet">kurzus</em>
            </h1>
            <p className="mt-8 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Saját gyakorlatból dokumentált anyagok. Vásárlás után azonnal a postafiókodban a
              belépési link.
            </p>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            {courses.length === 0 ? (
              <p className="font-sans text-base text-foreground-soft">
                Hamarosan elérhető. Az első pilot betöltés alatt.
              </p>
            ) : (
              <div className="grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-2">
                {courses.map((c) => (
                  <Link
                    key={c.id}
                    href={`/courses/${c.slug}`}
                    className="hover-arrow group border-b border-r border-border-strong p-8 transition-colors hover:bg-surface lg:p-12"
                  >
                    <div className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
                      {c.price_huf
                        ? `${new Intl.NumberFormat("hu-HU").format(c.price_huf)} Ft`
                        : "Hamarosan"}
                    </div>
                    <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
                      <em className="italic em-rose">{c.title}</em>
                    </h2>
                    {c.subtitle && (
                      <p className="mt-5 max-w-prose font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
                        {c.subtitle}
                      </p>
                    )}
                    <div className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
                      Megnyitás <span className="arrow">→</span>
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
