import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Köszönöm — sales-pipeline diagnózis" };

export default async function SalesPipelineThankYou({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; result?: string }>;
}) {
  const params = await searchParams;
  const id = params?.id;
  const result = params?.result;

  if (result === "too-early") {
    return <TooEarlyView id={id} />;
  }
  if (result === "no-fit") {
    return <NoFitView id={id} />;
  }
  return <QualifiedView id={id} />;
}

function QualifiedView({ id }: { id?: string }) {
  // Ennek a view-nak ritkán kell megjelennie — a kvalifikált felhasználó
  // azonnal a Cal.com-ra van átirányítva. Csak fallback ha visszanavigál ide.
  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Naptár nyitva</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Foglalj <em className="italic em-violet">időt</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Ha a Cal.com nem nyílt meg automatikusan, használd ezt a linket:
            </p>
            <div className="mt-8">
              <a
                href={process.env.CAL_SALES_PIPELINE_URL ?? "https://cal.com/solobusiness/sales-pipeline-diagnozis"}
                className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Időpontválasztás <span className="arrow">→</span>
              </a>
            </div>
            {id && (
              <p className="mt-12 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">
                Submission id: {id.slice(0, 8)}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function TooEarlyView({ id }: { id?: string }) {
  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Köszönöm a 4 választ</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Most még nem ezt <em className="italic em-violet">javaslom</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              A válaszaitok alapján a közös sales-pipeline diagnózis még korai. 24 órán belül e-mailben elmagyarázom konkrétan, mit látok és mi lenne most hasznosabb. Általában: vagy a Csapat-szerep térkép (ha még nincs összehangolt szerepek), vagy a Mini-onboarding vázlat (ha az ügyfelek átvétele a gyenge pont), vagy a 41 leveles hírlevél (ha még nem rendszeres a sales).
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="/lead-magnet/csapat-szerep-terkep"
                className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Csapat-szerep térkép <span className="arrow">→</span>
              </a>
              <a
                href="/lead-magnet/mini-onboarding-vazlat"
                className="hover-arrow group inline-block border border-border-strong px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:border-foreground"
              >
                Mini-onboarding vázlat <span className="arrow">→</span>
              </a>
            </div>

            {id && (
              <p className="mt-12 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">
                Submission id: {id.slice(0, 8)}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function NoFitView({ id }: { id?: string }) {
  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Köszönöm a 4 választ</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Ehhez egy <em className="italic em-violet">másik termék</em> illik nektek.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              4+ fős cég vagytok — ezt a hívást szándékosan a 2-3 fős mini-csapatokra szabtam, mert egy másfajta dinamika kell hozzá. A ti méretetekben az Expert Flow oldalon érdemes nézegetni az AI Operations csomagokat — komolyabb, structuráltabb folyamat.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="https://expertflow.hu"
                className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Expert Flow oldal <span className="arrow">→</span>
              </a>
            </div>

            {id && (
              <p className="mt-12 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">
                Submission id: {id.slice(0, 8)}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
