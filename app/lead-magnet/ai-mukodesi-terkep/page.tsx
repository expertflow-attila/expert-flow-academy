import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const metadata = {
  title: "AI-működési térkép — Solo Business",
  description:
    "Küldd el a 3 legfárasztóbb feladatodat, és 24 órán belül visszaküldök egy 4 oldalas térképet arról, hol veszíted a legtöbb időt — és melyik egyetlen folyamatot érdemes először AI-jal megtámogatnod.",
};

export default async function LeadMagnetMapPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  async function submitMap(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const q1 = String(formData.get("q1") ?? "").trim();
    const q2 = String(formData.get("q2") ?? "").trim();
    const q3 = String(formData.get("q3") ?? "").trim();
    const marketingConsent = formData.get("marketing_consent") === "on";
    const shareAnonymized = formData.get("share_anonymized") !== "off"; // default true

    if (!name || name.length < 2) redirect("/lead-magnet/ai-mukodesi-terkep?error=name");
    if (!email || !email.includes("@")) redirect("/lead-magnet/ai-mukodesi-terkep?error=email");
    if (q1.length < 20 || q2.length < 20 || q3.length < 20) {
      redirect("/lead-magnet/ai-mukodesi-terkep?error=short");
    }

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    // Rate limit: 3 / hour per IP, 2 / hour per email
    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 3, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 2, 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/lead-magnet/ai-mukodesi-terkep?error=too-many");
    }

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "ai-mukodesi-terkep",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: shareAnonymized,
        payload: { q1, q2, q3 },
        attila_review_status: "pending",
        client_ip: ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/ai-mukodesi-terkep] insert error", dbErr);
      redirect("/lead-magnet/ai-mukodesi-terkep?error=server");
    }

    // The Vercel Cron at /api/lead-magnet/process-pending picks this up
    // within 60 seconds, calls Claude API, then notifies Hermes for review.
    redirect(`/lead-magnet/ai-mukodesi-terkep/koszonom?id=${data.id}`);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Lead Magnet · 1 perc</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              AI-működési <em className="italic em-violet">térkép</em>
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              24 órán belül emailben elküldöm, hogy a TE vállalkozásodban hol szivárog a legtöbb idő — és melyik egyetlen AI-folyamatot érdemes először felépítened.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Nem 10 tippes PDF. Nem &bdquo;AI-bevezető&rdquo;. 3 kérdés, 1 perc, és kapsz egy 4 oldalas térképet rólad.
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ 3 kérdés, kb. 1 perc kitöltés</li>
              <li>→ 24 órán belül megkapod e-mailben</li>
              <li>→ Personalizált — a 3 válaszodra épül, nem általános</li>
              <li>→ Akkor is megkapod, ha utána nem iratkozol fel</li>
              <li>→ Nem fog rád zúdulni ajánlatkérő hívás</li>
            </ul>
          </div>
        </section>

        {/* Form */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Add meg a 3 választ</SectionLabel>

            {error === "name" && (
              <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>
            )}
            {error === "email" && (
              <ErrorBox>Add meg az e-mail címed.</ErrorBox>
            )}
            {error === "short" && (
              <ErrorBox>Mindegyik válasz legalább 20 karakter legyen. Egy mondat is elég, de értelmes mondat.</ErrorBox>
            )}
            {error === "too-many" && (
              <ErrorBox>Túl sok kitöltés ugyanarról az IP-ről / e-mailről. Próbáld meg 1 óra múlva.</ErrorBox>
            )}
            {error === "server" && (
              <ErrorBox>Szerver hiba — pár perc múlva próbáld újra. Ha továbbra is, írj a hello@solobusiness.hu-ra.</ErrorBox>
            )}

            <form action={submitMap} className="mt-10 space-y-8">
              <FormField label="Mi a neved?" name="name" type="text" autoComplete="name" required minLength={2} />
              <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

              <FormTextarea
                label="1. kérdés"
                hint="Melyik az a 3 dolog, amit minden héten elvégzel, és mindig fárasztóbb mint amilyennek látszik?"
                name="q1"
                rows={4}
                required
                minLength={20}
              />

              <FormTextarea
                label="2. kérdés"
                hint="Hol veszítesz időt anélkül, hogy észrevennéd? (Pl. e-mail-keresés, naptár-koordináció, ajánlatírás, adminisztráció, követés.)"
                name="q2"
                rows={4}
                required
                minLength={20}
              />

              <FormTextarea
                label="3. kérdés"
                hint="Melyik feladatot adnád oda valakinek, ha lenne kinek? És miért neki konkrétan?"
                name="q3"
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
                    Iratkozz fel a 41 leveles ingyenes Solo Business hírlevélre — heti 1-2 e-mail, semmi kemény eladás. Bármikor leiratkozhatsz.
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
                    A térképedből anonimizálva tanulhatok és megoszthatok mintázatokat. Nincs név vagy e-mail az anyagban. Kikapcsolhatod.
                  </span>
                </label>
              </fieldset>

              <button
                type="submit"
                className="hover-arrow group w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Kérek térképet <span className="arrow">→</span>
              </button>

              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                Az adataidat csak a térkép elkészítéséhez és (ha bejelölted) a hírlevélhez használjuk. 30 napon belül törölhető, írj nekem.
              </p>
            </form>
          </div>
        </section>

        {/* Hitelességi blokk */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Hitelesség</SectionLabel>
            <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              Itt vagyok a 30. <em className="italic em-violet">napon</em>.
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              Még nincs fizetős ügyfelem, de van egy működő AI-rendszerem, amit a saját napjaimra építettem fel. Ezt a térképet a saját rendszerem felépítése előtti gondolkodás-vázból raktam össze. Nem tanácsadói anyag, hanem amit én is kitettem magamnak az asztalra.
            </p>
          </div>
        </section>

        {/* Anti-guru blokk */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Mit NEM ígérek</SectionLabel>
            <ul className="mt-8 space-y-4 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Nem ígérek bevétel-megduplázást</li>
              <li>— Nem ígérek &bdquo;10x növekedést&rdquo;</li>
              <li>— Nem ígérek 7 napos csodát</li>
              <li>
                Csak azt ígérem, hogy a 3 válaszodból kirajzolódik egy mintázat, amit eddig nem láttál tisztán.
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
