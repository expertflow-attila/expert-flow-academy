import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = { title: "Köszönöm — kockázati térkép készül" };
export const dynamic = "force-dynamic";

const CAL_QUALIFICATION_URL =
  process.env.CAL_QUALIFICATION_URL ?? "https://cal.com/attila-nagy-8uefco/kvalifikacio-20min";

export default async function LMRiskFreeThankYou({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params?.id;

  // Lead-score lekérdezése — high-score (>50) esetén Cal.com link
  let leadScore: number | null = null;
  if (id) {
    const { data } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .select("lead_score")
      .eq("id", id)
      .maybeSingle();
    leadScore = (data as { lead_score: number | null } | null)?.lead_score ?? null;
  }
  const isHighScore = leadScore != null && leadScore > 50;

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

        {isHighScore && (
          <section className="border-b border-border py-24 md:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:px-10">
              <SectionLabel>A válaszaidból komoly intent látszik</SectionLabel>
              <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
                Beszéljünk <em className="italic em-violet">20 percet</em>?
              </h2>
              <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
                A pontszámod alapján már túl vagy az "olvasgatás" fázison. Ha akarod, közösen átnézzük a térképedet — nem eladási hívás, csak kérdés-válasz. Foglalj egy időpontot.
              </p>
              <div className="mt-10">
                <a
                  href={CAL_QUALIFICATION_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                >
                  20 perc Cal.com foglalás <span className="arrow">→</span>
                </a>
              </div>
              <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                Lead score: {leadScore} / 100
              </p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
