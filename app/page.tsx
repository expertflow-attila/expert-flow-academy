import Image from "next/image";
import Link from "next/link";
import { CTA_URL, Footer, Header, SectionLabel, SectionTitle } from "@/components/site-chrome";

/* ─────────────────────────────────────────────────────────────────── */
/*  HERO                                                                */
/* ─────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="border-b border-border py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
        <p className="animate-fade-in font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
          <span>Expert Flow</span>
          <span className="mx-3 text-foreground-dim">●</span>
          <span>AI rendszerek</span>
          <span className="mx-3 text-foreground-dim">●</span>
          <span>v2.0</span>
        </p>

        <h1 className="animate-fade-in-up delay-100 mt-10 font-display text-5xl leading-[1.05] text-balance tracking-tight md:text-6xl lg:text-7xl">
          AI-alapú <em className="italic em-sky">rendszerek</em>{" "}
          <em className="italic em-violet">szolgáltató</em> vállalkozóknak
        </h1>

        <p className="animate-fade-in-up delay-200 mx-auto mt-8 max-w-2xl font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
          Szolgáltatási rendszert hozunk létre vállalkozásod köré, amely láthatóvá és értékesíthetővé
          teszi a szakmai tudásodat.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  TWO LARGE CARDS — Válassz                                           */
/* ─────────────────────────────────────────────────────────────────── */

function TwoChoice() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <SectionTitle>Válassz</SectionTitle>

        <div className="mt-10 grid grid-cols-1 gap-px bg-border-strong md:grid-cols-2">
          <Link
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-arrow group flex flex-col bg-background p-8 transition-colors hover:bg-surface lg:p-12"
          >
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
              01 · Konzultáció
            </div>
            <h3 className="mt-8 font-display text-5xl tracking-tight md:text-6xl">
              30 perces <em className="italic em-rose">felmérés</em>
            </h3>
            <p className="mt-6 max-w-prose font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
              Átbeszéljük hol a legnagyobb fájdalompont — a 3 pillér közül melyiken kell először
              dolgozni nálad. Cal.com-on át, 30 perc, ingyenes.
            </p>
            <div className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
              Hívás foglalása <span className="arrow">→</span>
            </div>
          </Link>

          <Link
            href="/araink"
            className="hover-arrow group flex flex-col bg-background p-8 transition-colors hover:bg-surface lg:p-12"
          >
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
              02 · Havi együttműködés
            </div>
            <h3 className="mt-8 font-display text-5xl tracking-tight md:text-6xl">
              Retainer <em className="italic em-sky">csomagok</em>
            </h3>
            <p className="mt-6 max-w-prose font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
              Indító (120k Ft), Növekedési (220k Ft), Skálázó (450k Ft). Havi együttműködés,
              3 hónap minimum, részletfizetés.
            </p>
            <div className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
              Áraink megnyitása <span className="arrow">→</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  3 PILLER (services preview)                                         */
/* ─────────────────────────────────────────────────────────────────── */

const pillers = [
  {
    no: "01",
    name: "Ügyfélszerzés",
    em: "em-rose",
    title: "Leegyszerűsítjük az ügyfélszerzés folyamatát.",
    text: "Olyan rendszert építünk, ami a háttérben dolgozik — így a meglévő ügyfeleid kiszolgálására fordíthatod az energiád.",
  },
  {
    no: "02",
    name: "Kiszolgálás",
    em: "em-violet",
    title: "Professzionális szintre emeljük az ügyfeleid kiszolgálását.",
    text: "Egységes folyamatokat alakítunk ki, hogy minden kliensed ugyanazt a magas színvonalú élményt kapja.",
  },
  {
    no: "03",
    name: "Háttérműködés",
    em: "em-sky",
    title: "Fókuszálttá tesszük a vállalkozásod működését.",
    text: "Automatizáljuk az ismétlődő háttérfeladataidat — te pedig a szakmai fejlődésedre és az ügyfeleidre koncentrálhatsz.",
  },
];

function ThreePillers() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <SectionTitle>Három pillér</SectionTitle>
        <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
          A három legnagyobb kihívásodra fókuszálunk — mert tudjuk, ezek viszik el a legtöbb
          energiádat.
        </p>

        <div className="mt-10 grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-3">
          {pillers.map((p) => (
            <article
              key={p.no}
              className="hover-arrow border-b border-r border-border-strong px-6 py-8 transition-colors hover:bg-surface"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
                  {p.name}
                </span>
                <span className="font-mono text-[0.7rem] text-foreground-muted">{p.no}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl italic leading-snug md:text-3xl">
                <span className={p.em}>{p.title}</span>
              </h3>
              <p className="mt-5 font-sans text-sm leading-relaxed text-foreground-soft md:text-[0.95rem]">
                {p.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/szolgaltatas"
            className="hover-arrow group font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground"
          >
            Szolgáltatás részletek <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  KÜLÖNBSÉG — 6 card grid                                             */
/* ─────────────────────────────────────────────────────────────────── */

const differences = [
  {
    label: "Szolgáltatói fókusz",
    text: "Kizárólag szolgáltató vállalkozók számára kínálunk személyre szabott megoldásokat, amelyek igazodnak a célközönség igényeihez.",
  },
  {
    label: "Teljes körű megoldások",
    text: "Nem különálló automatizációkat építünk, hanem egy rendszert, ami összeköti a marketinged, az ügyfélkezelésed és a napi működésed.",
  },
  {
    label: "Fenntartható szemlélet",
    text: "Nem hiszünk a végtelen növekedésben. Az AI-t arra használjuk, hogy a vállalkozásod stabil, egyszerű és fenntartható legyen.",
  },
  {
    label: "Magyar nyelv natív",
    text: "Tegező operátor-hang, nem fordított ChatGPT-szöveg. Beszélj velünk az anyanyelveden.",
  },
  {
    label: "Build-in-public",
    text: "Minden lépést dokumentálok — a hibákat is. Aki velem tart, látja a folyamatot, nem csak az eredményt.",
  },
  {
    label: "Lego-elv",
    text: "Kis, cserélhető darabok — nem egyetlen 47-lépéses workflow. Heti egy darab épül, használat által nő a rendszer.",
  },
];

function SixCardGrid() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <SectionTitle>Miben vagyunk mások?</SectionTitle>

        <div className="mt-10 grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-3">
          {differences.map((d) => (
            <article
              key={d.label}
              className="border-b border-r border-border-strong px-6 py-8 transition-colors hover:bg-surface"
            >
              <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
                {d.label}
              </h3>
              <p className="mt-5 font-sans text-sm leading-relaxed text-foreground-soft md:text-[0.95rem]">
                {d.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  PRICING PILLARS — like Webflow original, dark-styled                */
/* ─────────────────────────────────────────────────────────────────── */

const pricingPillars = [
  {
    no: "01",
    name: "Ügyfélszerzés",
    em: "em-rose",
    headline: "Kiszámítható ügyfélszerzés minden hónapban.",
    items: [
      "Hatékony értékesítési rendszerek",
      "AI asszisztens az érdeklődők előszűrésére",
      "Automatizált email marketing és utánkövetés",
    ],
  },
  {
    no: "02",
    name: "Kiszolgálás",
    em: "em-violet",
    headline: "Átlátható folyamatok meglévő és új ügyfeleidnek.",
    items: [
      "Professzionális onboarding minden ügyfélnek",
      "Személyre szabott ügyfélkezelő rendszer",
      "Automatikus visszajelzés és elégedettség-mérés",
    ],
  },
  {
    no: "03",
    name: "Háttérműködés",
    em: "em-sky",
    headline: "Rendezett háttér, hogy az ügyfeleidre fókuszálhass.",
    items: [
      "Automatizált számlázás és adminisztráció",
      "AI-alapú belső tudásbázis és döntéstámogatás",
      "Digitális csapatod munkájának összehangolása",
    ],
  },
];

function PricingPillars() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Egyéni szolgáltatásunk</SectionLabel>
          <h2 className="mt-6 font-display text-4xl tracking-tight text-balance md:text-5xl lg:text-6xl">
            Három <em className="italic em-sky">alappillér</em>
          </h2>
          <p className="mx-auto mt-6 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
            Az eszközök és platformok változásától függetlenül mindig ezek határozzák meg
            egy vállalkozás sikerét.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-3">
          {pricingPillars.map((p) => (
            <article
              key={p.no}
              className="border-b border-r border-border-strong px-6 py-10 lg:px-8 lg:py-12"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
                  {p.name}
                </span>
                <span className="font-mono text-[0.7rem] text-foreground-muted">{p.no}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl italic leading-snug md:text-3xl">
                <span className={p.em}>{p.headline}</span>
              </h3>
              <ul className="mt-8 space-y-3 font-sans text-sm leading-relaxed text-foreground-soft md:text-[0.95rem]">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-px w-3 shrink-0 bg-foreground-muted" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/araink"
            className="hover-arrow group font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground"
          >
            Áraink megnyitása <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  RÓLAM intro                                                         */
/* ─────────────────────────────────────────────────────────────────── */

function RolamIntro() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="bg-glow-violet relative aspect-square overflow-hidden border border-border-strong">
              <Image
                src="/images/attila.jpg"
                alt="Nagy Attila"
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover opacity-95"
                priority
              />
              <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between text-background">
                <span className="rounded-sm bg-background/55 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground backdrop-blur-sm">
                  Nagy Attila
                </span>
                <span className="rounded-sm bg-background/55 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground backdrop-blur-sm">
                  Founder
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 md:pt-8">
            <SectionLabel>Rólam</SectionLabel>
            <h3 className="mt-6 font-display text-3xl tracking-tight md:text-4xl lg:text-5xl">
              Üdvözöllek az <em className="italic em-rose">oldalamon!</em>
            </h3>
            <p className="mt-6 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Nagy Attilának hívnak, és célom azoknak a vállalkozóknak a támogatása, akik hozzám
              hasonlóan szeretnék a legtöbbet kihozni hivatásukból, miközben másokat támogatnak a
              megszerzett tudásukkal.
            </p>
            <p className="mt-4 max-w-prose font-sans text-sm leading-relaxed text-foreground-muted md:text-base">
              Most a build-in-public útvonalon dokumentálom az utam — nulla fizetős ügyféltől
              az első retainerig.
            </p>
            <Link
              href="/rolam"
              className="hover-arrow group mt-10 inline-block font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground"
            >
              Ismerj meg jobban <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  SHOWCASE — terminal mockup + giant E letter (like "Az út")          */
/* ─────────────────────────────────────────────────────────────────── */

function Showcase() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <SectionTitle>Hogyan néz ki</SectionTitle>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2">
          {/* Terminal-style code block */}
          <div className="border border-border-strong bg-background p-5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground-dim" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground-dim" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground-dim" />
              <span className="ml-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                expert-flow · áttekintés
              </span>
            </div>
            <pre className="mt-8 overflow-x-auto font-mono text-xs leading-relaxed text-foreground-soft">
              <code>{`› git clone expertflow-ai-team && cd expertflow
/bevezetes                # felmérés, 3 pillér priorizálása
  → kontext/ ügyfél-profil generálva
  → ajánlat / icp kész

› cd ev-aios && cp ../kontext/* context/
/attekintes               # heti audit
  → pillér: ügyfélszerzés
  → napló: decisions/naplo.md

› hetente: /fejlesztes    # 3Ms interjú
  Mindset → Method → Machine
  → 1 automatizálási darab kész

Done. AIOS működik. Heti egy darab épül.`}</code>
            </pre>
          </div>

          {/* Giant E with glow */}
          <div className="bg-glow-rose relative flex aspect-auto items-center justify-center overflow-hidden border-y border-r border-border-strong lg:border-l-0">
            <div className="absolute inset-x-6 top-6 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
              Expert Flow
            </div>
            <span className="animate-pulse-glow select-none font-display text-[20rem] italic leading-none text-foreground opacity-30">
              E
            </span>
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between font-mono text-[0.65rem] uppercase tracking-[0.22em]">
              <span className="text-foreground-muted">3 pillér</span>
              <span className="text-foreground-muted">Egy rendszer</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  CTA                                                                 */
/* ─────────────────────────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10 lg:py-32">
        <h2 className="font-display text-4xl tracking-tight text-balance md:text-5xl lg:text-6xl">
          Készen állsz <em className="italic em-sky">elindulni?</em>
        </h2>
        <p className="mx-auto mt-6 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
          Foglalj egy 30 perces felmérést. Kiderítjük melyik pilléren a legnagyobb a hatás nálad —
          és építünk egy konkrét tervet.
        </p>
        <Link
          href={CTA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-arrow group mt-12 inline-block border border-foreground bg-foreground px-10 py-5 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
        >
          30 perces felmérés foglalása <span className="arrow">→</span>
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <Header active="/" />
      <main id="main">
        <Hero />
        <TwoChoice />
        <ThreePillers />
        <SixCardGrid />
        <PricingPillars />
        <RolamIntro />
        <Showcase />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
