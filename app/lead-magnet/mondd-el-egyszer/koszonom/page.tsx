import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Köszönöm — rendszer-térkép készül" };

export default async function LMSayItOnceThankYou({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>;
}) {
  const params = await searchParams;
  const id = params?.id;
  const type = params?.type ?? "text";

  const typeLabel = type === "audio" ? "hangfelvételedet" : type === "loom" ? "videó-linkedet" : "szöveges leírásodat";

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Megkaptam</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Köszi a <em className="italic em-violet">leírást</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Megkaptam a {typeLabel}, 3 munkanapon belül megkapod a strukturált rendszer-térképedet e-mailben. {type === "audio" || type === "loom" ? "Először át kell írni szöveggé, aztán strukturálni." : ""}
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
