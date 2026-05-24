import Link from "next/link";
import { CTA_URL, Footer, Header, SectionLabel, SectionTitle } from "@/components/site-chrome";
import { getPublishedCourses } from "@/lib/courses";

export const dynamic = "force-dynamic";

function Hero() {
  return (
    <section className="border-b border-border py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
        <p className="animate-fade-in font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
          <span>Expert Flow</span>
          <span aria-hidden="true" className="mx-3 text-foreground-dim">●</span>
          <span>Akadémia</span>
          <span aria-hidden="true" className="mx-3 text-foreground-dim">●</span>
          <span>Szakmai-leíró</span>
        </p>

        <h1 className="animate-fade-in-up delay-100 mt-10 font-display text-5xl leading-[1.05] text-balance tracking-tight md:text-6xl lg:text-7xl">
          Kurzusok <em className="italic em-sky">szolgáltató</em>{" "}
          <em className="italic em-violet">vállalkozóknak</em>
        </h1>

        <p className="animate-fade-in-up delay-200 mx-auto mt-8 max-w-2xl font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
          Zárt, low-cost kurzusplatform. Szakmai-leíró útvonal — minden anyag a saját
          gyakorlatomból, dokumentálva, nem absztrakt elmélet.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/courses"
            className="hover-arrow group inline-block border border-foreground bg-foreground px-8 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            Kurzusok megnyitása <span className="arrow">→</span>
          </Link>
          <Link
            href="/login"
            className="hover-arrow group font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground"
          >
            Már van hozzáférésed? Belépés <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

async function CourseList() {
  const courses = await getPublishedCourses();

  if (courses.length === 0) {
    return (
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <SectionTitle>Hamarosan</SectionTitle>
          <p className="mt-6 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
            Az első pilot kurzus betöltés alatt. Jelentkezz be email címeddel, hogy értesüljünk
            indulásnál.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <SectionTitle>Elérhető kurzusok</SectionTitle>
        <div className="mt-10 grid grid-cols-1 gap-px bg-border-strong md:grid-cols-2">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="hover-arrow group flex flex-col bg-background transition-colors hover:bg-surface"
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
              <div className="flex flex-col p-8 lg:p-12">
                <div className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
                  {c.price_huf
                    ? `${new Intl.NumberFormat("hu-HU").format(c.price_huf)} Ft`
                    : "Hamarosan"}
                </div>
                <h3 className="mt-8 font-display text-3xl tracking-tight md:text-4xl">
                  <em className="italic em-rose">{c.title}</em>
                </h3>
                {c.subtitle && (
                  <p className="mt-6 max-w-prose font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
                    {c.subtitle}
                  </p>
                )}
                <div className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
                  Részletek <span className="arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadMagnets() {
  const magnets = [
    {
      slug: "ai-mukodesi-terkep",
      label: "1 perc · 24 órán belül",
      title: "AI-működési térkép",
      subtitle:
        "3 kérdés a vállalkozásodról — 24 órán belül kapsz egy 4 oldalas térképet, hol szivárog a legtöbb időd és melyik egyetlen AI-folyamatot építsd elsőként.",
      accent: "em-violet" as const,
    },
    {
      slug: "ai-folyamatvazlat-48h",
      label: "5 perc · 48 órán belül",
      title: "Első AI-folyamatvázlat 48h",
      subtitle:
        "Küldd el hogyan kezelsz ma egy új érdeklődőt — 48 óra alatt visszaküldök egy 1 oldalas vizuális vázlatot arról, hogyan rakható ez össze AI-jal.",
      accent: "em-sky" as const,
    },
    {
      slug: "ugyfelut-audit",
      label: "20 perc hangban · heti 5 hely",
      title: "Ügyfélút audit",
      subtitle:
        "20 perces Cal.com hívás. Átnézzük, mi történik attól a pillanattól, hogy valaki érdeklődik nálad, addig, hogy ügyfél lesz belőle. 1 munkanapon belül írásos összefoglaló.",
      accent: "em-rose" as const,
    },
  ];

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <SectionLabel>Még nem készen áll a kurzusra?</SectionLabel>
        <h2 className="mt-6 max-w-2xl font-display text-4xl tracking-tight md:text-5xl">
          Próbáld ki <em className="italic em-sky">ingyen</em>, milyen velem dolgozni.
        </h2>
        <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-foreground-soft">
          Három ingyenes belépő, három különböző elköteleződési szintre. Egyik sem zsákutca — mindegyik konkrét érték, kockázat és pitch nélkül.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-px bg-border-strong md:grid-cols-3">
          {magnets.map((m) => (
            <Link
              key={m.slug}
              href={`/lead-magnet/${m.slug}`}
              className="hover-arrow group flex flex-col bg-background p-8 transition-colors hover:bg-surface lg:p-10"
            >
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                {m.label}
              </div>
              <h3 className="mt-8 font-display text-2xl tracking-tight md:text-3xl">
                <em className={`italic ${m.accent}`}>{m.title}</em>
              </h3>
              <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-soft">
                {m.subtitle}
              </p>
              <div className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
                Kipróbálom <span className="arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10 lg:py-32">
        <h2 className="font-display text-4xl tracking-tight text-balance md:text-5xl lg:text-6xl">
          Még tájékozódsz? <em className="italic em-violet">20 perc</em> hangban.
        </h2>
        <p className="mx-auto mt-6 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
          Ha nem tudod biztosan melyik kurzus illik hozzád, foglalj egy 20 perces ügyfélút auditot — átbeszéljük a folyamatodat, és 1 munkanapon belül kapsz egy írásos összefoglalót.
        </p>
        <Link
          href="/lead-magnet/ugyfelut-audit"
          className="hover-arrow group mt-12 inline-block border border-foreground bg-foreground px-10 py-5 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
        >
          Foglalok 20 percet <span className="arrow">→</span>
        </Link>
        <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
          Nem eladási hívás. Heti max 5 hely.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Header active="/" />
      <main id="main">
        <Hero />
        <CourseList />
        <LeadMagnets />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
