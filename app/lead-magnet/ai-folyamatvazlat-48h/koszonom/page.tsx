import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Köszönöm — vázlat készül" };

export default async function SketchThankYou({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params?.id;

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Megkaptam</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Köszi a <em className="italic em-sky">6 választ</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              48 órán belül megkapod a vázlatodat e-mailben. Először az AI rakja össze a struktúrát a válaszaid alapján, aztán én átolvasom, kézzel finomítom a rajzot, és csak utána küldöm ki.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Ha 48 óra múlva sem érkezett meg, nézd meg a spam mappát is. Ha ott sincs, írj nekem a hello@solobusiness.hu-ra.
            </p>

            {id && (
              <p className="mt-12 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">
                Submission id: {id.slice(0, 8)}
              </p>
            )}
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Amíg vársz</SectionLabel>
            <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              Ha tetszett az ötlet — itt a <em className="italic em-sky">teljes Akadémia</em>.
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              A vázlat csak az első lépés. A Solo Business Akadémia &bdquo;Saját AI Operations rendszer 30 nap alatt&rdquo; kurzusában lépésről lépésre felépítjük az alapokat (mit adsz el, kinek, hogyan találnak meg) és a működő AI rendszert. 49 000 Ft, 7 modul, 27 lecke.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/courses/build-in-public-30nap"
                className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Nézd meg a kurzust <span className="arrow">→</span>
              </a>
              <a
                href="/lead-magnet/ugyfelut-audit"
                className="hover-arrow group inline-block border border-border-strong px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:border-foreground"
              >
                Vagy 20 perc hangban <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
