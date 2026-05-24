import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Köszönöm — pályázat fogadva" };

export default async function LMGiveawayThankYou({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; eligible?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const id = params?.id;
  const eligible = params?.eligible !== "no";
  const reason = params?.reason;

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>{eligible ? "Megkaptam" : "Sajnos kizáró ok"}</SectionLabel>

            {eligible ? (
              <>
                <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
                  Köszi a <em className="italic em-violet">pályázatot</em>.
                </h1>
                <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                  Minden pályázat AI-előminősítésen megy át először, majd én is átnézem személyesen. A kampány végén értesítlek arról hogy hova kerültél (winner-candidate / runner-up / newsletter-only).
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
                  Még nem áll <em className="italic em-violet">készen</em>.
                </h1>
                <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                  {reason === "tooyoung" && "A vállalkozásod még 6 hónap alatti — szeretném ha a Q4-es vagy Q1-es kampányra már 1+ éves műkkdéssel jelentkezhetnél, mert a 30 napos AI-bevezetésnek stabil ICP-re van szüksége."}
                  {reason === "lowtraffic" && "Heti 3-nál kevesebb érdeklődővel egy AI-rendszer felépítése nem éri meg neked — előbb a forgalom-építést érdemes erősíteni. Itt a 41 leveles ingyenes hírlevél, ami pontosan ezt tanítja."}
                  {reason === "nocoach" && "Sajnos coach pályázatokat nem fogadunk — Expert Flow szakmai-leíró szabály. Ha más szakértői szolgáltatás is, jelentkezz újra a megfelelő kategóriában."}
                </p>
                <div className="mt-10">
                  <a
                    href="https://expertflow.hu/hirlevel"
                    className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                  >
                    Iratkozz fel a hírlevélre <span className="arrow">→</span>
                  </a>
                </div>
              </>
            )}

            {id && eligible && (
              <p className="mt-12 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">
                Pályázati id: {id.slice(0, 8)}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
