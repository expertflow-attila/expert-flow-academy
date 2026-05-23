import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { recommendPackage } from "@/lib/anthropic";

export const metadata = {
  title: "Az ajánlatom — Solo Business",
  description: "3 csomag a saját helyzetedre szabva. Akadémia 49k, mini sprint 199k, teljes audit 359k.",
};

type PkgCode = "A" | "B" | "C" | "D";

const PACKAGES: Record<PkgCode, { title: string; price: string; bullets: string[]; cta: string; href: string }> = {
  A: {
    title: "Akadémia + Skool",
    price: "49 000 Ft",
    bullets: [
      "5 modul, 11 lecke kurzus",
      "Skool közösség 1 év",
      "DIY tempóban — Te tanulod",
    ],
    cta: "Választom — 49 000 Ft",
    href: "/courses/build-in-public-30nap",
  },
  B: {
    title: "Mini sprint",
    price: "199 000 Ft",
    bullets: [
      "1 folyamat AI-vázlata",
      "30 perc magyarázat hívás",
      "14 napos email-támogatás",
    ],
    cta: "Beszéljünk — 199 000 Ft",
    href: "https://cal.com/solobusiness/mini-sprint",
  },
  C: {
    title: "Teljes Audit + Rendszerterv",
    price: "359 000 Ft",
    bullets: [
      "8 oldalas audit (LM8 prémium)",
      "30/60/90 napos terv",
      "2× 1 órás konzultáció",
      "Notion munkadokumentum",
      "30 nap kérdés-válasz Telegramon",
      "9 900 Ft Belépő Audit beszámít!",
    ],
    cta: "Beszéljünk — 359 000 Ft",
    href: "https://cal.com/solobusiness/teljes-audit",
  },
  D: {
    title: "Implementáció",
    price: "599 000 Ft",
    bullets: [
      "Teljes Audit + Rendszerterv eredménye",
      "AI-rendszer felépítése (1 folyamat)",
      "30 nap támogatás",
      "Csak C után aktiválódik",
    ],
    cta: "Beszéljünk — 599 000 Ft",
    href: "https://cal.com/solobusiness/teljes-impl",
  },
};

export default async function AjanlatPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; lead_id?: string; force?: PkgCode }>;
}) {
  const params = await searchParams;
  const fromSlug = params?.from ?? null;
  const leadId = params?.lead_id ?? null;
  const forcePackage = params?.force as PkgCode | undefined;

  // Try to load the submission for personalization
  type SubmissionRow = { id: string; name: string | null; payload: unknown; lead_score: number | null };
  let submission: SubmissionRow | null = null;
  if (leadId) {
    const { data } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .select("id, name, payload, lead_score")
      .eq("id", leadId)
      .maybeSingle();
    submission = (data as unknown as SubmissionRow) ?? null;
  }

  let recommended: PkgCode = forcePackage ?? "A";
  let reasoning = "";
  let highlightReason = "";

  if (submission && !forcePackage) {
    try {
      const result = await recommendPackage({
        slug: (fromSlug ?? "ai-mukodesi-terkep") as "ai-mukodesi-terkep",
        payload: submission.payload as Record<string, unknown>,
        leadScore: submission.lead_score,
      });
      recommended = result.recommended;
      reasoning = result.reasoning;
      highlightReason = result.highlightReason;

      // Track viewing + recommendation
      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({
          ajanlat_recommended_package: recommended,
          ajanlat_viewed_at: new Date().toISOString(),
        })
        .eq("id", submission.id);
    } catch (e) {
      // Ha az AI hibázik, az A csomagot mutatjuk default-ként
      console.error("[ajanlat] recommendPackage failed", e);
      recommended = "A";
    }
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>{submission?.name ? `Üdv, ${submission.name}` : "Üdv"}</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              3 <em className="italic em-violet">lehetőséged</em>.
            </h1>
            {reasoning && (
              <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                {reasoning}
              </p>
            )}
            {!reasoning && (
              <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                A Solo Business / Expert Flow szolgáltatása 3 lépcsős. Az alábbi 3 csomag közül egy nagyon valószínűleg a Te helyzetedre szabott.
              </p>
            )}
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {(["A", "B", "C"] as PkgCode[]).map((code) => (
                <PackageCard
                  key={code}
                  code={code}
                  pkg={PACKAGES[code]}
                  isRecommended={recommended === code}
                  leadId={submission?.id}
                />
              ))}
            </div>

            {recommended === "D" && (
              <div className="mt-12 text-center">
                <p className="font-sans text-base leading-relaxed text-foreground-soft">
                  A válaszaid alapján Te a 599 000 Ft Implementáció felé tartasz (D csomag). Először a Teljes Audit kell — kattints a C csomagra.
                </p>
              </div>
            )}
          </div>
        </section>

        {highlightReason && (
          <section className="border-b border-border py-24 md:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:px-10">
              <SectionLabel>Miért éppen ez</SectionLabel>
              <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">{highlightReason}</p>
            </div>
          </section>
        )}

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Nem most döntesz?</SectionLabel>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              Semmi gond. Iratkozz fel a 41 leveles ingyenes hírlevélre — heti 1-2 e-mail, és pontosan ugyanezt a szemléletet építem fel benne lépésről lépésre. Ha 2-3 hónap múlva újra felmerül, akkor leszek itt.
            </p>
            <div className="mt-10">
              <a
                href="https://solobusiness.hu/hirlevel"
                className="hover-arrow group inline-block border border-border-strong px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:border-foreground hover:text-foreground"
              >
                Iratkozz fel addig <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PackageCard({
  code,
  pkg,
  isRecommended,
  leadId,
}: {
  code: PkgCode;
  pkg: typeof PACKAGES[PkgCode];
  isRecommended: boolean;
  leadId?: string;
}) {
  const href = leadId ? `${pkg.href}?lead_id=${leadId}&package=${code}` : pkg.href;
  return (
    <div
      className={`border p-8 ${
        isRecommended ? "border-foreground bg-surface" : "border-border-strong"
      }`}
    >
      {isRecommended && (
        <div className="mb-4 inline-block bg-foreground px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-background">
          AJÁNLOM NEKED
        </div>
      )}
      <h3 className="font-display text-2xl tracking-tight">{pkg.title}</h3>
      <div className="mt-2 font-mono text-sm uppercase tracking-[0.22em] text-foreground-soft">{pkg.price}</div>

      <ul className="mt-8 space-y-3 font-sans text-sm leading-relaxed text-foreground-soft">
        {pkg.bullets.map((b) => (
          <li key={b}>— {b}</li>
        ))}
      </ul>

      <a
        href={href}
        className={`mt-10 inline-block w-full border px-6 py-4 text-center font-mono text-xs uppercase tracking-[0.22em] transition-colors ${
          isRecommended
            ? "border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground"
            : "border-border-strong text-foreground-soft hover:border-foreground hover:text-foreground"
        }`}
      >
        {pkg.cta} →
      </a>
    </div>
  );
}
