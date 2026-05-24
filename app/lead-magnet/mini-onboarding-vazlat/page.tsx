import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const metadata = {
  title: "Mini-onboarding vázlat 48 órán belül — Expert Flow",
  description:
    "Mini-csapat? Töltsd ki 6 kérdést, és 48 órán belül emailben kapsz egy 5-6 lépéses vázlatot arra, hogyan vezessétek be új ügyfeleteket VAGY új csapattagotokat egységesen.",
};

export default async function LeadMagnetMiniOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  async function submitMiniOnboarding(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const q1 = String(formData.get("q1") ?? "").trim();
    const q2 = String(formData.get("q2") ?? "").trim();
    const q3 = String(formData.get("q3") ?? "").trim();
    const q4 = String(formData.get("q4") ?? "").trim();
    const q5 = String(formData.get("q5") ?? "").trim();
    const q6 = String(formData.get("q6") ?? "").trim();
    const marketingConsent = formData.get("marketing_consent") === "on";
    const shareAnonymized = formData.get("share_anonymized") !== "off";

    if (!name || name.length < 2) redirect("/lead-magnet/mini-onboarding-vazlat?error=name");
    if (!email || !email.includes("@")) redirect("/lead-magnet/mini-onboarding-vazlat?error=email");
    if (!q1 || !["ugyfel", "csapattag"].includes(q1)) {
      redirect("/lead-magnet/mini-onboarding-vazlat?error=q1");
    }
    if (
      q2.length < 30 ||
      q3.length < 20 ||
      q4.length < 20 ||
      q5.length < 5 ||
      q6.length < 20
    ) {
      redirect("/lead-magnet/mini-onboarding-vazlat?error=short");
    }

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 3, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 2, 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/lead-magnet/mini-onboarding-vazlat?error=too-many");
    }

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "mini-onboarding-vazlat",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: shareAnonymized,
        payload: { q1, q2, q3, q4, q5, q6, name },
        attila_review_status: "pending",
        client_ip: ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/mini-onboarding-vazlat] insert error", dbErr);
      redirect("/lead-magnet/mini-onboarding-vazlat?error=server");
    }

    redirect(`/lead-magnet/mini-onboarding-vazlat/koszonom?id=${data.id}`);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Lead Magnet · mini-csapat · 5 perc</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Mini-onboarding <em className="italic em-violet">vázlat</em> 48 órán belül
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Te döntöd el: új ÜGYFÉL vagy új CSAPATTAG vezetése. 6 kérdés, 5 perc — 48 órán belül emailben kapsz egy 5-6 lépéses vázlatot, amit a 2-3 fős csapatod azonnal tud használni.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Nem általános „onboarding checklist&rdquo;. A te csapatodra és a Q5-ben felsorolt eszközeitekre épül.
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ 6 kérdés, kb. 5 perc kitöltés</li>
              <li>→ 48 órán belül megkapod e-mailben</li>
              <li>→ A te eszközeiddel — nem új SaaS-t árulok</li>
              <li>→ 5-6 lépés, mindegyik a TI csapatotokra címezve</li>
              <li>→ Akkor is megkapod, ha utána nem iratkozol fel</li>
            </ul>
          </div>
        </section>

        {/* Form */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Add meg a 6 választ</SectionLabel>

            {error === "name" && <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>}
            {error === "email" && <ErrorBox>Add meg az e-mail címed.</ErrorBox>}
            {error === "q1" && <ErrorBox>Válaszd ki: új ügyfél VAGY új csapattag vezetése.</ErrorBox>}
            {error === "short" && (
              <ErrorBox>Mindegyik válasz legalább 20 karakter legyen (a 2. kérdés legalább 30). Egy mondat is elég, de értelmes mondat.</ErrorBox>
            )}
            {error === "too-many" && (
              <ErrorBox>Túl sok kitöltés ugyanarról az IP-ről / e-mailről. Próbáld meg 1 óra múlva.</ErrorBox>
            )}
            {error === "server" && (
              <ErrorBox>Szerver hiba — pár perc múlva próbáld újra. Ha továbbra is, írj a hello@expertflow.hu-ra.</ErrorBox>
            )}

            <form action={submitMiniOnboarding} className="mt-10 space-y-8">
              <FormField label="Mi a neved?" name="name" type="text" autoComplete="name" required minLength={2} />
              <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

              <fieldset>
                <legend className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
                  1. kérdés — Melyik vázlatot kéred elsősorban?
                </legend>
                <p className="mt-2 font-sans text-sm leading-relaxed text-foreground-muted">
                  Egyet választhatsz. A vázlat erre fókuszál, de a kettő közti közös pontokat is meg fogod látni.
                </p>
                <div className="mt-3 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 border border-border-strong px-4 py-3">
                    <input type="radio" name="q1" value="ugyfel" required className="mt-1" />
                    <span className="font-sans text-base leading-relaxed">
                      <strong>Új ügyfél bevezetése</strong> — ha egy új ügyfél leszerződ velünk, hogyan vesszük át és vezetjük az első 7 napban
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 border border-border-strong px-4 py-3">
                    <input type="radio" name="q1" value="csapattag" required className="mt-1" />
                    <span className="font-sans text-base leading-relaxed">
                      <strong>Új csapattag bevezetése</strong> — ha új ember (alkalmazott / alvállalkozó) csatlakozik, hogyan vesszük át az első 7 napban
                    </span>
                  </label>
                </div>
              </fieldset>

              <FormTextarea
                label="2. kérdés"
                hint="Hogyan zajlik most ad-hoc? 3-4 mondat — ami most a fejedben/csapatban van, NEM kell rendszerezett választ adnod."
                name="q2"
                rows={5}
                required
                minLength={30}
              />

              <FormTextarea
                label="3. kérdés"
                hint="Mi az első dolog, amit a 2-3 fő közül valaki csinál új belépéskor? (Pl. „Anna küld egy üdvözlő emailt és csatolja az ÁSZF-et”.)"
                name="q3"
                rows={4}
                required
                minLength={20}
              />

              <FormTextarea
                label="4. kérdés"
                hint="Hol szokott elveszni az ügyfél vagy csapattag az első 7 napban? (Ha még nem volt ilyen rossz tapasztalat: hol érzed sebezhetőnek a folyamatot?)"
                name="q4"
                rows={4}
                required
                minLength={20}
              />

              <FormTextarea
                label="5. kérdés"
                hint="Milyen eszközöket használtok közösen (max 5)? Sorold fel: pl. „Gmail, Notion, Cal.com, Slack, Stripe”."
                name="q5"
                rows={2}
                required
                minLength={5}
              />

              <FormTextarea
                label="6. kérdés"
                hint="Mi az a pillanat, ahol a vázlat el szokott szakadni? (Ha eddig nem volt vázlat: hol szokott összezavarodni? Pl. „a 3. napon mindenki feltételezi, hogy a másik küldte az emailt”.)"
                name="q6"
                rows={4}
                required
                minLength={20}
              />

              <fieldset className="space-y-3 border-t border-border pt-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketing_consent"
                    defaultChecked
                    className="mt-1 h-4 w-4 border border-border-strong"
                  />
                  <span className="font-sans text-sm leading-relaxed text-foreground-soft">
                    Iratkozz fel a 41 leveles ingyenes Expert Flow hírlevélre — heti 1-2 e-mail, semmi kemény eladás. Bármikor leiratkozhatsz.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="share_anonymized"
                    defaultChecked
                    className="mt-1 h-4 w-4 border border-border-strong"
                  />
                  <span className="font-sans text-sm leading-relaxed text-foreground-soft">
                    A vázlatotokból anonimizálva tanulhatok és megoszthatok mintázatokat. Nincs név vagy e-mail az anyagban. Kikapcsolhatod.
                  </span>
                </label>
              </fieldset>

              <button
                type="submit"
                className="hover-arrow group w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Kérek vázlatot <span className="arrow">→</span>
              </button>

              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                Az adataitokat csak a vázlat elkészítéséhez és (ha bejelölted) a hírlevélhez használjuk. 30 napon belül törölhető, írj nekem.
              </p>
            </form>
          </div>
        </section>

        {/* Hitelességi blokk */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Hitelesség</SectionLabel>
            <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              Az <em className="italic em-violet">Expert Flow</em> módszertan.
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              , és most rakom össze a Hermes 6 sub-agent + 3 cron rendszerembe a sub-agent-onboardingot. A te 2-3 fős csapatodra ezt a vázolási logikát adaptálom. Nem szervezetfejlesztő-anyag, hanem amit én is most végigjárok.
            </p>
          </div>
        </section>

        {/* Anti-guru blokk */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Mit NEM ígérek</SectionLabel>
            <ul className="mt-8 space-y-4 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Nem ígérek &bdquo;tökéletes onboardingot&rdquo;</li>
              <li>— Nem ígérek új SaaS-eszközt amit meg kell tanulnotok</li>
              <li>— Nem ígérek 100% retention vagy zero churn jellegű számokat</li>
              <li>
                Csak azt ígérem, hogy 48 órán belül kaptok egy konkrét 5-6 lépéses vázlatot, a TI eszközeitekre, amit egy közös 30 perces megbeszélésen el tudtok indítani.
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 border border-[var(--color-accent-rose)] bg-surface px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-accent-rose)]">
      {children}
    </div>
  );
}

function FormField({
  label,
  name,
  type,
  autoComplete,
  required,
  minLength,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft"
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="mt-3 w-full border border-border-strong bg-background px-4 py-4 font-sans text-base text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
      />
    </div>
  );
}

function FormTextarea({
  label,
  hint,
  name,
  rows,
  required,
  minLength,
}: {
  label: string;
  hint: string;
  name: string;
  rows: number;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft"
      >
        {label}
      </label>
      <p className="mt-2 font-sans text-sm leading-relaxed text-foreground-muted">{hint}</p>
      <textarea
        name={name}
        id={name}
        rows={rows}
        required={required}
        minLength={minLength}
        className="mt-3 w-full border border-border-strong bg-background px-4 py-4 font-sans text-base leading-relaxed text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
      />
    </div>
  );
}
