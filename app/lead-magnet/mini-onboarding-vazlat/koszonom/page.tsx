import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Köszönöm — vázlat készül" };

export default async function MiniOnboardingThankYou({
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
              Köszi a <em className="italic em-violet">6 választ</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              48 órán belül megkapod az 5-6 lépéses vázlatot e-mailben. Először az AI rakja össze a 6 válaszotok alapján, aztán én átolvasom (kb. 30 perc minden vázlatra) és kiküldöm.
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
            <SectionLabel>Amíg vártok</SectionLabel>
            <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              Az <em className="italic em-sky">Akadémián</em> egy egész szekció szól a 2-3 fős csapatok rendszer-építéséről.
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              A „Build-in-public 30 nap&rdquo; kurzus 5. modulja arról szól, hogyan adsz át egy folyamatot úgy, hogy a 2-3 fős csapatban senki ne legyen elveszve. 49 000 Ft, 27 lecke. Akkor jöjjön szóba, ha érzitek, hogy a vázlaton túl a rendszer is hiányzik.
            </p>
            <div className="mt-10">
              <a
                href="/courses/build-in-public-30nap"
                className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Nézd meg a kurzust <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
