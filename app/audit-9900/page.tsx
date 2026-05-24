import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { createAudit9900CheckoutSession } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
  title: "9 900 Ft Belépő Audit — Expert Flow",
  description:
    "8 oldalas AI-Működési Audit + 1 órás Loom-magyarázat + Notion munkalap. 9 900 Ft. Ha 7 napon belül továbblépsz a 359 000 Ft Teljes Auditra, az ár 100%-ban beszámít.",
};

const LAUNCH_DATE = "2026-05-23"; // a számláló indulása
const LIMIT = 30; // első 30 audit kedvezményes — utána 49 000 Ft

export default async function Audit9900Page({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; utm_source?: string }>;
}) {
  const params = await searchParams;
  const canceled = params?.canceled === "1";
  const utmSource = params?.utm_source ?? null;

  // Real-time counter — hányan vették meg eddig
  const { count: paidCount } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id", { count: "exact", head: true })
    .eq("lead_magnet_slug", "auditprogram-9900")
    .gte("paid_at", LAUNCH_DATE)
    .not("paid_at", "is", null);

  const sold = paidCount ?? 0;
  const remaining = Math.max(0, LIMIT - sold);
  const isFull = remaining === 0;

  async function startCheckout(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const utm = String(formData.get("utm_source") ?? "").trim() || undefined;

    const { url } = await createAudit9900CheckoutSession({
      variant: "audit-9900",
      email: email || undefined,
      name: name || undefined,
      utmSource: utm,
    });

    redirect(url);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Fizetős belépő · 9 900 Ft · {isFull ? "Betelt" : `${remaining} hely még`}</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              A 9 900 Ft <em className="italic em-violet">AI-Működési Audit</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              8 oldalas dokumentum + 1 órás Loom-magyarázat + Notion munkalap. Ha 7 napon belül továbblépsz a 359 000 Ft-os Teljes Auditra, a 9 900 Ft 100%-ban beszámít — egyszerűen.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Korábban 49 000 Ft volt — most az első 30 audit 9 900 Ft, hogy bizonyítani tudjam. Szakmai-leíró 30. nap.
            </p>

            {canceled && (
              <div className="mt-8 border border-border-strong bg-surface px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
                A fizetés megszakadt. Ha bármi gond volt, írj a hello@expertflow.hu-ra.
              </div>
            )}
          </div>
        </section>

        {/* Value stack */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Mit kapsz pontosan</SectionLabel>
            <table className="mt-10 w-full border border-border text-left">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-6 py-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">Tartalom</th>
                  <th className="px-6 py-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">Érték</th>
                </tr>
              </thead>
              <tbody className="font-sans text-sm">
                <tr className="border-b border-border">
                  <td className="px-6 py-4 text-foreground-soft">8 oldalas AI-Működési Audit (személyre szabva)</td>
                  <td className="px-6 py-4 text-foreground">9 900 Ft</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-6 py-4 text-foreground-soft">Excalidraw folyamatábra a Te folyamatodról</td>
                  <td className="px-6 py-4 text-foreground">+ 8 000 Ft</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-6 py-4 text-foreground-soft">1 órás Loom-magyarázat Attilától</td>
                  <td className="px-6 py-4 text-foreground">+ 12 000 Ft</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-6 py-4 text-foreground-soft">Notion munkalap a 30/60/90 napra</td>
                  <td className="px-6 py-4 text-foreground">+ 3 000 Ft</td>
                </tr>
                <tr className="border-b border-border bg-surface">
                  <td className="px-6 py-4 text-foreground-soft">100% beszámítás 7 napon belül a 359 000 Ft auditra</td>
                  <td className="px-6 py-4 text-[var(--color-accent-violet,#c8b9e0)]">+ 9 900 Ft visszanyerhető</td>
                </tr>
                <tr className="bg-foreground text-background">
                  <td className="px-6 py-4 font-mono text-sm uppercase tracking-wider">Te most fizetsz</td>
                  <td className="px-6 py-4 font-mono text-sm uppercase tracking-wider">9 900 Ft</td>
                </tr>
              </tbody>
            </table>

            <p className="mt-8 font-sans text-sm leading-relaxed text-foreground-muted">
              Az érték a piaci szokásos árazás szerint. A 9 900 Ft beszámítás kizárólag a 359 000 Ft Teljes Auditra érvényes, 7 naptári napon belül, egyszer.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Hogyan működik</SectionLabel>
            <ol className="mt-10 space-y-8 font-sans text-base leading-relaxed text-foreground-soft">
              <li>
                <strong className="text-foreground">1.</strong> Kifizeted a 9 900 Ft-ot a Stripe-on. Bankkártyával, magyar SEPA-val, Apple Pay, Google Pay.
              </li>
              <li>
                <strong className="text-foreground">2.</strong> Azonnal kapsz egy linket egy 12 kérdéses kérdőívre. 15 perc kitölteni.
              </li>
              <li>
                <strong className="text-foreground">3.</strong> 3 munkanapon belül megkapod a 8 oldalas auditot + Excalidraw ábrát + 1 órás Loom-magyarázatot + Notion munkalapot.
              </li>
              <li>
                <strong className="text-foreground">4.</strong> Ha 7 napon belül továbblépsz a 359 000 Ft Teljes Auditra, a 9 900 Ft 100%-ban beszámít.
              </li>
            </ol>
          </div>
        </section>

        {/* CTA form */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-xl px-6 lg:px-10">
            <SectionLabel>Indítás</SectionLabel>
            <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              {isFull ? "Az első 30 audit elkelt." : "Heti kapacitás: 5 audit. Most 3 hely."}
            </h2>
            {isFull ? (
              <>
                <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
                  Visszamentem a 49 000 Ft-os árazásra. Ha mégis komolyan érdekel, írj a hello@expertflow.hu-ra és váróhívlistára teszlek.
                </p>
                <div className="mt-10">
                  <a
                    href="/lead-magnet/ai-mukodesi-terkep"
                    className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                  >
                    Az ingyenes térkép addig is <span className="arrow">→</span>
                  </a>
                </div>
              </>
            ) : (
              <form action={startCheckout} className="mt-10 space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft"
                  >
                    Mi a neved?
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    className="mt-3 w-full border border-border-strong bg-background px-4 py-4 font-sans text-base text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft"
                  >
                    E-mail címed
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    required
                    className="mt-3 w-full border border-border-strong bg-background px-4 py-4 font-sans text-base text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>

                <input type="hidden" name="utm_source" value={utmSource ?? ""} />

                <button
                  type="submit"
                  className="hover-arrow group w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                >
                  Megveszem most — 9 900 Ft <span className="arrow">→</span>
                </button>

                <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                  14 napos pénzvisszafizetési garancia. A 7 napos beszámítás külön mechanika — ha továbblépsz a 359k auditra, beszámít.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* Why not free */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Miért nem ingyenes</SectionLabel>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              Korábban ingyen csináltam (a /lead-magnet/ai-mukodesi-terkep oldalon még most is megvan az ingyenes verzió, 4 oldalas térkép). De ami ingyenes, azt nem nézik meg. A 9 900 Ft elköteleződés, nem ár. És ha tovább mész, visszakapod a 100%-át. Ha nem mész tovább, 7 napon belül 14 napos garanciával vissza is kérheted.
            </p>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              Az Expert Flow most indítja ezt a low-ticket Belépő Audit programot, hogy a komolyabb 359k Teljes Auditra való belépést kockázatmentessé tegye. Az első 30 audit kedvezményes — utána normál ár.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
