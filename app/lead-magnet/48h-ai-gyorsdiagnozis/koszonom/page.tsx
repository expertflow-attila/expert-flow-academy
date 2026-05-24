import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Köszönöm — gyorsdiagnózis készül" };

export default async function LM48hThankYou({
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
              Köszi az <em className="italic em-violet">5 választ</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              48 órán belül megkapod a 7 napos akciótervet e-mailben. Először az AI rakja össze a vázlatot a válaszaid alapján, aztán én átolvasom és kiküldöm.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Ha 48 óra múlva sem érkezett meg, nézd meg a spam mappát is. Ha ott sincs, írj a hello@expertflow.hu-ra.
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
              Itt egy <em className="italic em-sky">9 900 Ft belépő audit</em>, ha komolyabbat is akarsz.
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              Ha az 5 válaszodból már látod hogy heti 10+ órát veszítesz, érdemes ránézned a 9 900 Ft-os Belépő Auditra. 8 oldalas dokumentum, 1 órás Loom-magyarázat, Notion munkalap. Ha 7 napon belül továbblépsz a 359 000 Ft-os Teljes Auditra, a 9 900 Ft 100%-ban beszámít.
            </p>
            <div className="mt-10">
              <a
                href="/audit-9900"
                className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Nézd meg a Belépő Auditot <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
