import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = { title: "Köszönöm — kezdődik az audit" };

export default async function Audit9900ThankYou({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  if (!sessionId) {
    redirect("/audit-9900");
  }

  // Verify the session is paid (defense in depth — the webhook is the source of truth)
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e) {
    console.error("[audit-9900/koszonom] cannot retrieve session", e);
    redirect("/audit-9900?canceled=1");
  }

  if (session.payment_status !== "paid") {
    // A webhook lehet hogy még nem érkezett meg — várjon
    return (
      <>
        <Header active="" />
        <main id="main">
          <section className="border-b border-border py-24 md:py-32">
            <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
              <SectionLabel>Fizetés feldolgozás alatt</SectionLabel>
              <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
                Egy <em className="italic em-violet">pillanat…</em>
              </h1>
              <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                A Stripe még feldolgozza a fizetést — kb. 10-30 másodperc. Frissítsd az oldalt 1 perc múlva, vagy kérlek nézd meg az e-mail postád: ha sikeresen ment, ott lesz a kérdőív link.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // Find the submission via stripe_checkout_session_id (mentett a webhook által)
  const { data: submission } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  const { data: questionnaire } = submission
    ? await supabaseAdmin
        .from("audit_9900_questionnaires")
        .select("access_token, completed_at")
        .eq("submission_id", submission.id)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Megérkezett a fizetés</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Köszi a <em className="italic em-violet">9 900 Ft-ot</em>, {submission?.name ?? "barátom"}.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Most kell egy 12 kérdéses kérdőívet kitöltened — kb. 15 perc. Ezután 3 munkanapon belül megkapod a 8 oldalas auditot + Loom magyarázatot.
            </p>

            {questionnaire && !questionnaire.completed_at && (
              <div className="mt-10">
                <a
                  href={`/audit-9900/kerdoiv/${questionnaire.access_token}`}
                  className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                >
                  Kérdőív kitöltése (15 perc) <span className="arrow">→</span>
                </a>
              </div>
            )}

            {questionnaire?.completed_at && (
              <p className="mt-10 font-sans text-base leading-relaxed text-foreground-soft">
                A kérdőívet már kitöltötted. 3 munkanapon belül megkapod az auditot.
              </p>
            )}

            {!questionnaire && (
              <p className="mt-10 font-sans text-sm leading-relaxed text-foreground-muted">
                A kérdőív linket e-mailben is kiküldjük — nézd meg a fiókodat 1-2 percen belül.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
