import type { Metadata } from "next";
import Link from "next/link";
import { CTA_URL, Footer, Header, SectionLabel, SectionTitle } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Szolgáltatás",
  description: "Három pillér: ügyfélszerzés, kiszolgálás, háttérműködés. Sub-features pillérenként + 5 lépéses folyamat.",
};

const detailedPillers = [
  {
    no: "01",
    name: "Ügyfélszerzés",
    headline: "Kiszámítható ügyfélszerzés minden hónapban.",
    intro:
      "A legtöbb szakember azért nem tud továbbnőni, mert a marketinghez nincs sem ideje, sem rendszere. Mi megépítjük helyetted azt a háttér-gépezetet, ami a meglévő ügyfeleid kiszolgálása közben is dolgozik.",
    items: [
      "Lead-magnetek: értékes anyag cserébe e-mail-feliratkozásért",
      "Landing oldal és funnel: külön minden szolgáltatásra",
      "Email automatizáció (Kit V4): 5-leveles bemelegítő sorozat",
      "AI asszisztens: előszűri az érdeklődőket, mielőtt te válaszolnál",
      "Naptári integráció: Cal.com-mal egyetlen kattintásra foglalható",
    ],
    result:
      "1 hónap alatt 20–50 előkvalifikált érdeklődő, akiknek már nem kell magyarázni mit csinálsz.",
  },
  {
    no: "02",
    name: "Kiszolgálás",
    headline: "Átlátható folyamatok meglévő és új ügyfeleidnek.",
    intro:
      "Ha minden ügyfél más folyamaton fut át a fejedben, a 6. ügyfél után már fáradt vagy. Megépítjük a rendszert, ami minden ügyfélnek ugyanazt a magas színvonalat adja.",
    items: [
      "Onboarding-folyamat: űrlap, szerződés, Stripe fizetés",
      "Ügyfélmappa: minden anyag egy helyen, megosztva a kliensszel",
      "Sablon-emailek és státusz-frissítések",
      "Automatikus elégedettség-mérés a projekt végén",
      "Visszatérő ügyfél-flow: hogy a 2. és 3. munkára is visszajöjjön",
    ],
    result:
      "A te időd 30–40%-a felszabadul, miközben a kliens élménye konzisztens.",
  },
  {
    no: "03",
    name: "Háttérműködés",
    headline: "Rendezett háttér, hogy az ügyfeleidre fókuszálhass.",
    intro:
      "A számlázás, könyvelés, fájlrendezés, jelszó-kezelés — egyenként kis feladatok, de hetente több órát visznek el. Automatizáljuk őket.",
    items: [
      "Számlázási automatizmus (Stripe → könyvelő szoftver)",
      "AI-alapú belső tudásbázis: a saját jegyzeteid kereshetők",
      "Heti riport: bevétel, ügyfelek, kapacitás",
      "Több AI-ügynök együttműködése a háttérben",
      "Hibakezelés és értesítések (csak akkor szólnak, ha kell)",
    ],
    result: "Heti 5–10 óra felszabadul, és tudod mi történik a vállalkozásodban.",
  },
];

const process = [
  { no: "01", name: "Felmérés", duration: "1 hét", desc: "Átnézzük mi van most, hol szivárog a tudás és az idő." },
  { no: "02", name: "Stratégia", duration: "1 hét", desc: "Megtervezzük a 3 pillér implementációját, prioritás szerint." },
  { no: "03", name: "Építés", duration: "2–6 hét", desc: "Megépítjük a rendszereket, ügyfelenként testreszabva." },
  { no: "04", name: "Bevezetés", duration: "1 hét", desc: "Élesítjük, betanítjuk a használatát." },
  { no: "05", name: "Optimalizálás", duration: "Folyamatos", desc: "Heti review, A/B tesztek, finomhangolás." },
];

export default function Szolgaltatas() {
  return (
    <>
      <Header active="/szolgaltatas" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <SectionLabel>Szolgáltatás</SectionLabel>
            <h1 className="mt-8 font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl">
              Egy rendszer <em className="italic">három pillérrel</em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              A te szakmai tudásodat tesszük értékesíthetővé — láthatóvá, automatizáltan és
              emberileg fenntartható módon.
            </p>
          </div>
        </section>

        {/* Detailed pillers */}
        {detailedPillers.map((p) => (
          <section key={p.no} className="border-b border-border">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
              <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
                <div className="md:col-span-4">
                  <div className="flex items-baseline justify-between">
                    <SectionLabel>{p.name}</SectionLabel>
                    <span className="font-mono text-xs text-foreground-muted">{p.no}</span>
                  </div>
                  <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl lg:text-5xl">
                    <em className="italic">{p.headline}</em>
                  </h2>
                  <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
                    {p.intro}
                  </p>
                </div>

                <div className="md:col-span-8">
                  <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                    Mit tartalmaz
                  </div>
                  <ul className="mt-6 grid gap-px bg-border-strong">
                    {p.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-4 bg-background p-5 font-sans text-sm text-foreground md:text-base"
                      >
                        <span className="mt-2 inline-block h-px w-4 shrink-0 bg-foreground-muted" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-l-2 border-foreground-dim pl-6 font-sans text-sm italic leading-relaxed text-foreground-soft md:text-base">
                    {p.result}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Folyamat */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <SectionTitle>Folyamat</SectionTitle>
            <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Öt lépésben jutunk a felméréstől az élesben működő rendszerig.
            </p>

            <div className="mt-10 grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-5">
              {process.map((step) => (
                <article
                  key={step.no}
                  className="border-b border-r border-border-strong px-5 py-6"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
                      {step.name}
                    </span>
                    <span className="font-mono text-[0.7rem] text-foreground-muted">
                      {step.no}
                    </span>
                  </div>
                  <div className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                    {step.duration}
                  </div>
                  <p className="mt-5 font-sans text-sm leading-relaxed text-foreground-soft">
                    {step.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:px-10 lg:py-24">
            <h2 className="font-display text-4xl tracking-tight md:text-5xl">
              Készen állsz?
            </h2>
            <p className="mx-auto mt-6 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Foglalj egy 30 perces felmérő hívást — kiderítjük, hogy a 3 pillér közül melyiken
              a legnagyobb a hatás nálad.
            </p>
            <Link
              href={CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-block border border-foreground-soft px-8 py-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              30 perces felmérés foglalása →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
