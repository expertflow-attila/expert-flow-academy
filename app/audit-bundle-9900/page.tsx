import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { createAudit9900CheckoutSession } from "@/lib/stripe";

export const metadata = {
  title: "9 900 Ft Audit + Folyamatvázlat Bundle — Expert Flow",
  description:
    "Vedd meg a 9 900 Ft AI-Működési Auditot, és ajándékba elkészítjük az érdeklődő-kezelési folyamatvázlatodat is — pontosan azt amit a 49 000 Ft Akadémia első leckéje tanít.",
};

export default async function AuditBundlePage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; utm_source?: string }>;
}) {
  const params = await searchParams;
  const canceled = params?.canceled === "1";
  const utmSource = params?.utm_source ?? null;

  async function startCheckout(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const utm = String(formData.get("utm_source") ?? "").trim() || undefined;

    const { url } = await createAudit9900CheckoutSession({
      variant: "audit-bundle-9900",
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
            <SectionLabel>Fizetős belépő · 9 900 Ft · Bundle</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Audit + <em className="italic em-violet">ingyenes folyamatvázlat</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Vedd meg a 9 900 Ft AI-Működési Auditot, és ajándékba elkészítjük az érdeklődő-kezelési folyamatvázlatodat is — pontosan azt amit a 49 000 Ft Akadémia első leckéje tanít, csak Te nem tanulod, mi felépítjük.
            </p>
            {canceled && (
              <div className="mt-8 border border-border-strong bg-surface px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
                A fizetés megszakadt. Ha bármi gond volt, írj a hello@expertflow.hu-ra.
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Value stack</SectionLabel>
            <table className="mt-10 w-full border border-border text-left">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-6 py-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">Mit kapsz</th>
                  <th className="px-6 py-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">Érték</th>
                </tr>
              </thead>
              <tbody className="font-sans text-sm">
                <tr className="border-b border-border">
                  <td className="px-6 py-4 text-foreground-soft">8 oldalas AI-Működési Audit</td>
                  <td className="px-6 py-4 text-foreground">9 900 Ft</td>
                </tr>
                <tr className="border-b border-border bg-surface">
                  <td className="px-6 py-4 text-[var(--color-accent-violet,#c8b9e0)]">+ Excalidraw folyamatvázlat (BUNDLE)</td>
                  <td className="px-6 py-4 text-[var(--color-accent-violet,#c8b9e0)]">+ 8 000 Ft (ingyen)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-6 py-4 text-foreground-soft">1 órás Loom magyarázat</td>
                  <td className="px-6 py-4 text-foreground">+ 12 000 Ft</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-6 py-4 text-foreground-soft">Notion munkalap</td>
                  <td className="px-6 py-4 text-foreground">+ 3 000 Ft</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-6 py-4 text-foreground-soft">100% beszámítás 7 napon belül a 359k-ba</td>
                  <td className="px-6 py-4 text-[var(--color-accent-violet,#c8b9e0)]">+ 9 900 Ft visszanyerhető</td>
                </tr>
                <tr className="bg-foreground text-background">
                  <td className="px-6 py-4 font-mono text-sm uppercase tracking-wider">Te most fizetsz</td>
                  <td className="px-6 py-4 font-mono text-sm uppercase tracking-wider">9 900 Ft</td>
                </tr>
              </tbody>
            </table>

            <p className="mt-8 font-sans text-sm leading-relaxed text-foreground-muted">
              Bundle összérték: 32 900 Ft. Most fizetsz: 9 900 Ft. 80% kedvezmény a teljes csomagra — az Expert Flow most indítja a Belépő Audit programot — limitált hely.
            </p>
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-xl px-6 lg:px-10">
            <SectionLabel>Indítás</SectionLabel>
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

              <input type="hidden" name="utm_source" value={utmSource ?? ""} />

              <button
                type="submit"
                className="hover-arrow group w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Megveszem a bundle-t — 9 900 Ft <span className="arrow">→</span>
              </button>

              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                14 napos pénzvisszafizetési garancia. A folyamatvázlat 5 perc extra kérdőívvel készül.
              </p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
