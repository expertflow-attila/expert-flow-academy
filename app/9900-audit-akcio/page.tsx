import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { createAudit9900CheckoutSession } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
  title: "AI Audit 49 000 Ft helyett 9 900 Ft — Solo Business",
  description:
    "Korábban 49 000 Ft. Most az első 30 audit 9 900 Ft. 80% kedvezmény, mert a build-in-public 30. napon vagyok és bizonyítanom kell.",
};

const LAUNCH_DATE = "2026-05-23";
const LIMIT = 30;

export default async function Audit9900AkcioPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; utm_source?: string }>;
}) {
  const params = await searchParams;
  const canceled = params?.canceled === "1";
  const utmSource = params?.utm_source ?? null;

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
    if (isFull) redirect("/audit-9900");
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const utm = String(formData.get("utm_source") ?? "").trim() || undefined;

    const { url } = await createAudit9900CheckoutSession({
      variant: "audit-akcio-9900",
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
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Limitált akció · {sold} / {LIMIT} elkelt</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              AI Audit{" "}
              <span className="font-mono text-3xl line-through text-foreground-muted">49 000 Ft</span>{" "}
              <em className="italic em-violet">9 900 Ft</em>
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              80% kedvezmény az első 30 auditra. Utána visszamegy 49 000 Ft-ra. Még{" "}
              <strong className="text-foreground">{remaining} hely</strong> van.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Miért most ennyivel olcsóbb: a 30. napon vagyok saját Solo Business vállalkozásommal, és bizonyítanom kell. Az első 30 audit a "bizonyítási hely" — ezeknél lesz a YouTube case study (anonimizálva). Utána normál áron megy.
            </p>
            {canceled && (
              <div className="mt-8 border border-border-strong bg-surface px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
                A fizetés megszakadt — ha kérdés, írj a hello@solobusiness.hu-ra.
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Mit jelent az akció</SectionLabel>
            <ul className="mt-10 space-y-6 font-sans text-base leading-relaxed text-foreground-soft">
              <li>
                <strong className="text-foreground">— 80% kedvezmény.</strong> 49 000 Ft helyett 9 900 Ft.
              </li>
              <li>
                <strong className="text-foreground">— Az audit tartalma változatlan.</strong> 8 oldalas dokumentum + Loom + Notion. Ugyanaz mint a teljes áras változat.
              </li>
              <li>
                <strong className="text-foreground">— 100% beszámítás.</strong> Ha 7 napon belül továbblépsz a 359k Teljes Auditra, a 9 900 Ft beszámít.
              </li>
              <li>
                <strong className="text-foreground">— 14 napos pénzvisszafizetési garancia.</strong> Ha nem tetszik, visszakérheted.
              </li>
              <li>
                <strong className="text-foreground">— Lehet hogy YouTube case study leszel.</strong> Anonimizálva, csak engedélyeddel.
              </li>
              <li>
                <strong className="text-foreground">— A 30. ember után nincs többet.</strong> Visszamegyek 49k-ra.
              </li>
            </ul>
          </div>
        </section>

        {!isFull ? (
          <section className="border-b border-border py-24 md:py-32">
            <div className="mx-auto max-w-xl px-6 lg:px-10">
              <SectionLabel>{remaining} hely még · Indítás</SectionLabel>
              <form action={startCheckout} className="mt-10 space-y-6">
                <div>
                  <label htmlFor="name" className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
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
                  <label htmlFor="email" className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
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

                <input type="hidden" name="utm_source" value={utmSource ?? "akcio-landing"} />

                <button
                  type="submit"
                  className="hover-arrow group w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                >
                  Vállalom — 9 900 Ft <span className="arrow">→</span>
                </button>
              </form>
            </div>
          </section>
        ) : (
          <section className="border-b border-border py-24 md:py-32">
            <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
              <SectionLabel>Sajnos elkelt</SectionLabel>
              <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
                Mind a 30 elkelt. <em className="italic em-violet">Köszi mindenkinek.</em>
              </h2>
              <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
                Visszamentem a 49 000 Ft-os árazásra. Itt megnézheted a teljes árú változatot.
              </p>
              <div className="mt-10">
                <a
                  href="/audit-9900"
                  className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                >
                  Teljes árú audit (49 000 Ft) <span className="arrow">→</span>
                </a>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
