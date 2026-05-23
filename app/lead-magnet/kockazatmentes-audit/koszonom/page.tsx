import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Köszönöm — kockázati térkép készül" };

export default async function LMRiskFreeThankYou({
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
              Köszi a <em className="italic em-violet">7 választ</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              2 munkanapon belül megkapod a kockázati térképedet e-mailben PDF formátumban. 3 lehetséges első lépés kockázati súlyozással, és 2 anti-pattern amit jobb elkerülni.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Ha 2 munkanap múlva sem érkezett meg, nézd meg a spam mappát is.
            </p>

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
