import Link from "next/link";

const CTA_URL = "https://cal.com/attila-nagy-8uefco/30min";
const YOUTUBE_URL = "https://www.youtube.com/@nagyattilaferenc";
const GITHUB_URL = "https://github.com/expertflow-attila";

/* ─────────────────────────────────────────────────────────────────── */
/*  HEADER (top nav + product sub-nav)                                  */
/* ─────────────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="border-b border-border">
      {/* Top row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link
          href="/"
          aria-label="Expert Flow — főoldal"
          className="font-display text-2xl italic tracking-tight"
        >
          Expert Flow
        </Link>

        <nav aria-label="Külső linkek" className="flex items-center gap-8">
          <Link
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground"
          >
            Konzultáció ↗
          </Link>
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground"
          >
            GitHub ↗
          </Link>
          <div className="hidden items-center gap-3 border-l border-border-strong pl-8 md:flex">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
              Közösség
            </span>
            <Link
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-foreground-soft transition-colors hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
              </svg>
            </Link>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-foreground-soft transition-colors hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
              </svg>
            </Link>
          </div>
        </nav>
      </div>

      {/* Sub-nav: 3 tabs */}
      <nav
        aria-label="Termékek"
        className="border-t border-border bg-background"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-3 px-6 lg:px-10">
          <Link
            href="/"
            className="border-r border-border py-6 transition-colors hover:bg-surface"
            aria-current="page"
          >
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
              Áttekintés
            </div>
            <div className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
              Index
            </div>
          </Link>
          <Link
            href="/alap"
            className="border-r border-border py-6 transition-colors hover:bg-surface"
          >
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft">
              EV-Alap
            </div>
            <div className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
              Kiindulópont
            </div>
          </Link>
          <Link
            href="/aios"
            className="py-6 transition-colors hover:bg-surface"
          >
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft">
              EV-AIOS
            </div>
            <div className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
              AI Operációs Rendszer
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  HERO                                                                */
/* ─────────────────────────────────────────────────────────────────── */

function CodeBlock({ step, code, copyLabel = "Másol" }: { step: string; code: string; copyLabel?: string }) {
  return (
    <div className="border border-border-strong">
      <div className="flex items-center justify-between border-b border-border-strong bg-surface px-4 py-2.5">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-foreground-muted">
          {step}
        </span>
        <button
          type="button"
          className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-foreground-soft transition-colors hover:text-foreground"
        >
          {copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto bg-background px-4 py-3">
        <code className="font-mono text-sm text-foreground">{code}</code>
      </pre>
    </div>
  );
}

function Hero() {
  return (
    <section className="border-b border-border py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
        {/* Breadcrumb label */}
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
          <span>Expert Flow</span>
          <span className="mx-3 text-foreground-dim">●</span>
          <span>Áttekintés</span>
          <span className="mx-3 text-foreground-dim">●</span>
          <span>AI rendszerek egyéni vállalkozóknak</span>
        </p>

        {/* Headline */}
        <h1 className="mt-10 font-display text-5xl leading-[1.05] text-balance tracking-tight md:text-6xl lg:text-7xl">
          Az AI <em className="italic text-foreground">operációs rendszered</em>
          <br className="hidden md:block" /> — egyéni vállalkozónak.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-8 max-w-2xl font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
          Három skill, három pillér, két keretrendszer. Minimális, használat által bővülő rendszer
          ami nem a 47-lépéses workflow-kban hisz — hanem a Lego-elvben: kis, cserélhető darabok.
        </p>

        {/* Two code blocks */}
        <div className="mx-auto mt-14 max-w-xl space-y-5 text-left">
          <CodeBlock
            step="1. Foglalj 30 perces konzultációt"
            code={CTA_URL}
          />
          <CodeBlock
            step="2. Indítsd a bemelegítő kérdőívet"
            code="Olvasd el a CLAUDE.md-t és kezdj el dokumentálni — ev-intake.md"
          />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  DEMO SECTION ("Lásd működés közben")                                */
/* ─────────────────────────────────────────────────────────────────── */

function DemoSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <h2 className="font-display text-2xl italic tracking-tight md:text-3xl">
          Lásd működés közben
        </h2>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2">
          {/* Left: mockup card */}
          <div className="aspect-[4/3] border border-border-strong bg-background p-5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground-dim" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground-dim" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground-dim" />
              <span className="ml-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                expert-flow
              </span>
            </div>
            <div className="mt-8 space-y-4">
              <div className="font-mono text-xs text-foreground-soft">
                <span className="text-foreground-dim">$</span> /attekintes
              </div>
              <div className="space-y-2 font-mono text-xs text-foreground-muted">
                <div>→ Heti audit indítása…</div>
                <div>→ pillér: ügyfélszerzés</div>
                <div>→ napló: decisions/naplo.md</div>
                <div>→ commit: 2026-05-13 23:47</div>
              </div>
            </div>
          </div>

          {/* Right: large stylized letter */}
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-y border-r border-border-strong bg-background lg:border-l-0">
            <span className="select-none font-display text-[18rem] italic leading-none text-foreground-soft opacity-70">
              E
            </span>
            <div className="absolute inset-x-5 bottom-4 flex items-center justify-between">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                Expert Flow
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                AIOS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  FEATURES (6-card grid)                                              */
/* ─────────────────────────────────────────────────────────────────── */

const features = [
  {
    label: "Három skill",
    text: "/bevezetes (setup), /attekintes (heti audit), /fejlesztes (heti 3Ms interjú). Több nem kell — bővítsd használat által.",
  },
  {
    label: "Három pillér",
    text: "Ügyfélszerzés, ügyfélkezelés, háttérműködés — minden hét egy pillér, egy darab.",
  },
  {
    label: "3Ms keretrendszer",
    text: "Mindset → Method → Machine — soha nem ugorható át. A Machine-re menés Mindset nélkül = hype.",
  },
  {
    label: "Lego-elv",
    text: "Kis, cserélhető darabok — nem egyetlen 47-lépéses workflow. A cserélhetőség = túlélés.",
  },
  {
    label: "Append-only napló",
    text: "decisions/naplo.md — mit döntöttél, miért. Nem felejt. A /attekintes és /fejlesztes ide ír.",
  },
  {
    label: "Magyar nyelv natív",
    text: "Tegező operátor-hang, nem fordított ChatGPT-szöveg. A CLAUDE.md fix válaszsztenderdet ad.",
  },
];

function Features() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <h2 className="font-display text-2xl italic tracking-tight md:text-3xl">Funkciók</h2>

        <div className="mt-10 grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.label}
              className="border-b border-r border-border-strong px-6 py-8 transition-colors hover:bg-surface"
            >
              <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
                {feature.label}
              </h3>
              <p className="mt-5 font-sans text-sm leading-relaxed text-foreground-soft md:text-[0.95rem]">
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  TWO-CARD CTA                                                        */
/* ─────────────────────────────────────────────────────────────────── */

function TwoCardCta() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <h2 className="font-display text-2xl italic tracking-tight md:text-3xl">
          Még nem volt felmérő hívásod?
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-px bg-border-strong md:grid-cols-2">
          <Link
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-background p-8 transition-colors hover:bg-surface lg:p-12"
          >
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
              Először ez kell
            </div>
            <h3 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              Először a <em className="italic">felmérés</em>
            </h3>
            <p className="mt-5 font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
              Ha még nem tudod pontosan kit szolgálsz és mit ajánlasz, az AIOS context fájljai
              homályosak maradnak. Egy 30 perces hívás tisztázza az alapot.
            </p>
            <div className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
              Hívás foglalása →
            </div>
          </Link>

          <Link
            href="/aios"
            className="group block bg-background p-8 transition-colors hover:bg-surface lg:p-12"
          >
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
              Áttekintés
            </div>
            <h3 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              Miért így <em className="italic">épül</em>
            </h3>
            <p className="mt-5 font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
              Két repó, egy út. Az áttekintés megmutatja a teljes folyamatot a kezdéstől a heti
              automatizálási ritmusig — Lego-elv szerint.
            </p>
            <div className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
              Áttekintés megnyitása →
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  FOOTER                                                              */
/* ─────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 text-xs uppercase tracking-[0.22em] text-foreground-muted md:flex-row md:items-center lg:px-10">
        <div className="font-mono">
          <span>Expert Flow</span>
          <span className="mx-3 text-foreground-dim">·</span>
          <span>v0.1.0</span>
        </div>
        <Link
          href="https://expertflow.hu"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono transition-colors hover:text-foreground"
        >
          expertflow.hu ↗
        </Link>
        <div className="font-mono">© 2026 · Nagy Attila e.v.</div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  PAGE                                                                */
/* ─────────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <DemoSection />
        <Features />
        <TwoCardCta />
      </main>
      <Footer />
    </>
  );
}
