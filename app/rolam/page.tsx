import type { Metadata } from "next";
import Link from "next/link";
import { CTA_URL, Footer, Header, SectionLabel, SectionTitle, YOUTUBE_URL } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Rólam",
  description: "Nagy Attila — AI-vezérelt vállalkozás építése build-in-public keretben. Nulla fizetős ügyfél, dokumentált út.",
};

const values = [
  {
    label: "Klasszikus alapok + AI",
    text:
      "Nem trükkös shortcut-okat tanítok. A klasszikus értékesítés, marketing és ügyfélélmény alapjait használom, csak AI-csapattal felgyorsítva.",
  },
  {
    label: "Build-in-public",
    text:
      "Minden lépést dokumentálok — a hibákat is. Aki velem tart, látja a folyamatot.",
  },
  {
    label: "Fenntartható szemlélet",
    text:
      "Nem akarom megduplázni a bevételem holnap. Olyan rendszereket építek, amelyek 3 év múlva is működnek.",
  },
];

const mentors = [
  { name: "Russell Brunson", area: "DotCom Secrets, funnel-építés" },
  { name: "Alex Hormozi", area: "$100M Offers, ajánlat-csomagolás" },
  { name: "Gary Vaynerchuk", area: "Build-in-public, többcsatornás tartalom" },
  { name: "Kane Kallaway", area: "YouTube hook formula, story struktúra" },
];

export default function Rolam() {
  return (
    <>
      <Header active="/rolam" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <SectionLabel>Rólam</SectionLabel>
            <h1 className="mt-8 font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl">
              Nagy Attila vagyok, és <em className="italic">építek</em> egy AI-vezérelt vállalkozást.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Most tanulom, itt dokumentálom. Hibákkal, eredményekkel, döntésekkel.
            </p>
          </div>
        </section>

        {/* Eredettörténet */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-12 lg:px-10 lg:py-24">
            <div className="md:col-span-4">
              <SectionLabel>Miért építem ezt?</SectionLabel>
            </div>
            <div className="md:col-span-8">
              <p className="font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                Évek óta a klasszikus vállalkozói tanulási úton járok — könyveket olvasok,
                mentorokra hallgatok, próbálkozom.
              </p>
              <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                2026-ban az AI olyan eszközöket adott a kezembe, amelyek 5 évvel ezelőtt egy
                5-fős csapatnak voltak elérhetők. Eldöntöttem, hogy nem csak használom — hanem
                szakemberekkel együtt megépítek egy keretet, ami másnak is működik.
              </p>
            </div>
          </div>
        </section>

        {/* Karakter / Értékek */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <SectionTitle>Karakter</SectionTitle>
            <div className="mt-10 grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-3">
              {values.map((v, i) => (
                <article
                  key={v.label}
                  className="border-b border-r border-border-strong px-6 py-8"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
                      {v.label}
                    </span>
                    <span className="font-mono text-[0.7rem] text-foreground-muted">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="mt-5 font-sans text-sm leading-relaxed text-foreground-soft md:text-[0.95rem]">
                    {v.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Itt tartok most */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
              <div className="md:col-span-4">
                <SectionLabel>Itt tartok most</SectionLabel>
              </div>
              <div className="md:col-span-8">
                <h2 className="font-display text-3xl tracking-tight md:text-4xl lg:text-5xl">
                  Build-in-public, <em className="italic">30. nap</em>
                </h2>
                <p className="mt-6 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                  Nulla fizetős ügyfél. Megvan a komplett tech-stackem (Next.js, Supabase,
                  Anthropic Claude, Stripe), a 6 AI-ügynököm, a YouTube csatornám és az email
                  funnelem.
                </p>
                <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                  Most azon dolgozom, hogy az első ügyfelet megszerezzem — és ezt is nyíltan
                  dokumentálom.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mentorok */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <SectionTitle>Akiktől tanulok</SectionTitle>
            <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Tisztelettel hivatkozott mentorok — az ő keretüket alkalmazom, magyar nyelven,
              az én helyzetemre szabva.
            </p>

            <ul className="mt-10 grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-2">
              {mentors.map((m, i) => (
                <li
                  key={m.name}
                  className="border-b border-r border-border-strong bg-background px-6 py-6"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-xl tracking-tight md:text-2xl">
                      {m.name}
                    </span>
                    <span className="font-mono text-[0.7rem] text-foreground-muted">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
                    {m.area}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:px-10 lg:py-24">
            <h2 className="font-display text-4xl tracking-tight md:text-5xl">
              <em className="italic">Beszéljünk</em>
            </h2>
            <p className="mx-auto mt-6 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Ha érdekel ahogy építek, csatlakozz a build-in-public közösséghez. Ha konkrét
              segítség kell — foglalj egy hívást.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
              <Link
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-foreground-soft px-8 py-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                YouTube csatorna →
              </Link>
              <Link
                href={CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-foreground bg-foreground px-8 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                30 perces hívás →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
