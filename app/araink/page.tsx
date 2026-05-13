import type { Metadata } from "next";
import Link from "next/link";
import { CTA_URL, Footer, Header, SectionLabel, SectionTitle } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Áraink",
  description: "Expert Flow AI Operations retainer 3 csomagban — Indító, Növekedési, Skálázó. Havi együttműködés, 3 hónap minimum.",
  alternates: { canonical: "/araink" },
  openGraph: {
    title: "Áraink · Expert Flow",
    description: "AI Operations retainer 3 csomagban — Indító, Növekedési, Skálázó.",
    url: "/araink",
    type: "website",
  },
};

const plans = [
  {
    no: "01",
    name: "Indító",
    price: "120 000 Ft",
    unit: "/ hó",
    tagline: "Egyetlen alapfolyamat automatizálása",
    items: [
      "1 folyamat építése (email funnel VAGY ügyfélkezelő VAGY számlázás)",
      "Heti 30 perc konzultáció (Zoom vagy Cal.com)",
      "Email támogatás (válasz 24 órán belül)",
      "Hozzáférés a build-in-public közösséghez",
    ],
    fit: "Aki most kezd vagy 1 konkrét fájdalompontot akar megoldani.",
    cta: "Indítóra jelentkezem",
    featured: false,
  },
  {
    no: "02",
    name: "Növekedési",
    price: "220 000 Ft",
    unit: "/ hó",
    tagline: "2 folyamat + AI asszisztens",
    items: [
      "2 folyamat építése és optimalizálása",
      "Heti 60 perc konzultáció",
      "AI asszisztens beállítása és tanítása (Claude vagy GPT)",
      "Email + Slack támogatás (válasz 8 órán belül)",
      "Havi review riport",
      "Hozzáférés a build-in-public közösséghez",
    ],
    fit: "Aki 1–3 hónapja vállalkozik és van rendszeres ügyfele.",
    cta: "Növekedési felé indulok",
    featured: true,
  },
  {
    no: "03",
    name: "Skálázó",
    price: "450 000 Ft",
    unit: "/ hó",
    tagline: "Teljes Expert Flow rendszer",
    items: [
      "3 pillér teljes implementációja (ügyfélszerzés + kiszolgálás + háttér)",
      "Heti 2 × 60 perc konzultáció",
      "Saját AI ügynök építése (custom Claude vagy GPT-5)",
      "Prioritásos támogatás (válasz 2 órán belül)",
      "Havi 1 nap személyes munkavégzés (Budapest vagy online)",
      "Hozzáférés a build-in-public közösséghez",
    ],
    fit: "Aki már fix bevétellel rendelkezik és komolyabban skálázna.",
    cta: "Skálázásra állok",
    featured: false,
  },
];

const faqs = [
  {
    q: "Mi NEM része egyik csomagnak sem?",
    a: "Termékfejlesztés, branding, fizetős hirdetés-kezelés. Ezekre külön szakembert ajánlok.",
  },
  {
    q: "Mennyi időre szól a szerződés?",
    a: "3 hónapos minimum, utána havonta felmondható.",
  },
  {
    q: "Mi van ha 2 hónap után úgy érzem ez nem nekem való?",
    a: "A 2. hónap végéig kapsz 50% visszatérítést. Az építés eddig elkészült részei a tieid maradnak.",
  },
  {
    q: "Vállalsz coach-okat / lélekgondozókat / spirituális tanácsadókat?",
    a: "Nem. Kizárólag konkrét szakmai szolgáltatóknak dolgozom (jogász, könyvelő, ingatlanos, orvos, fotós, fejlesztő, mérnök, oktató stb.).",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Expert Flow", item: "https://expertflow-aios.vercel.app/" },
    { "@type": "ListItem", position: 2, name: "Áraink", item: "https://expertflow-aios.vercel.app/araink" },
  ],
};

export default function Araink() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header active="/araink" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <SectionLabel>Áraink</SectionLabel>
            <h1 className="mt-8 font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl">
              Expert Flow <em className="italic">AI Operations</em> retainer
            </h1>
            <p className="mx-auto mt-8 max-w-2xl font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Havi munkafolyamatban dolgozom veled — egy bizonyos számú folyamatot építünk és
              optimalizálunk a 3 pillér mentén.
            </p>
          </div>
        </section>

        {/* 3 packages */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <div className="grid grid-cols-1 border-l border-t border-border-strong md:grid-cols-3">
              {plans.map((p) => (
                <article
                  key={p.no}
                  className={`relative border-b border-r border-border-strong px-6 py-10 lg:px-8 lg:py-12 ${
                    p.featured ? "bg-surface" : "bg-background"
                  }`}
                >
                  {p.featured && (
                    <span className="absolute right-6 top-6 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-foreground">
                      Legnépszerűbb
                    </span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
                      {p.name}
                    </span>
                    <span className="font-mono text-[0.7rem] text-foreground-muted">{p.no}</span>
                  </div>
                  <div className="mt-8">
                    <div className="font-display text-4xl tracking-tight md:text-5xl">
                      {p.price}
                    </div>
                    <div className="mt-1 font-mono text-xs uppercase tracking-[0.22em] text-foreground-muted">
                      {p.unit}
                    </div>
                  </div>
                  <p className="mt-6 font-display italic text-lg text-foreground-soft md:text-xl">
                    {p.tagline}
                  </p>
                  <ul className="mt-8 space-y-3 font-sans text-sm leading-relaxed text-foreground-soft">
                    {p.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 inline-block h-px w-3 shrink-0 bg-foreground-muted" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-t border-border pt-6">
                    <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                      Kinek való
                    </div>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-foreground-soft">
                      {p.fit}
                    </p>
                  </div>
                  <Link
                    href={CTA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-10 block border px-6 py-4 text-center font-mono text-xs uppercase tracking-[0.22em] transition-colors ${
                      p.featured
                        ? "border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground"
                        : "border-foreground-soft text-foreground hover:bg-foreground hover:text-background"
                    }`}
                  >
                    {p.cta} →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <SectionTitle>Mielőtt jelentkeznél</SectionTitle>
            <div className="mt-10 grid grid-cols-1 gap-px border-l border-t border-border-strong md:grid-cols-2">
              {faqs.map((f) => (
                <div
                  key={f.q}
                  className="border-b border-r border-border-strong bg-background p-6 lg:p-8"
                >
                  <h3 className="font-display text-xl italic tracking-tight md:text-2xl">
                    {f.q}
                  </h3>
                  <p className="mt-4 font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:px-10 lg:py-24">
            <h2 className="font-display text-4xl tracking-tight md:text-5xl">
              Még nem tudod <em className="italic">melyik csomag</em> a tied?
            </h2>
            <p className="mx-auto mt-6 max-w-prose font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Foglalj egy 30 perces felmérést — együtt találjuk meg a leginkább illőt.
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
