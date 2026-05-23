import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const metadata = {
  title: "Ügyfélút audit — 20 perces hívás — Solo Business",
  description:
    "Megnézzük, mi történik attól a pillanattól, hogy valaki érdeklődik nálad, addig, hogy ügyfél lesz belőle. 20 perc beszélgetés, 1 munkanapon belül írásos összefoglaló.",
};

const WEEKLY_CAP = 5;

const CAL_AUDIT_URL = process.env.CAL_AUDIT_URL ?? "https://cal.com/solobusiness/ugyfelut-audit";

export default async function LeadMagnetAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  const sinceMonday = mondayMidnightISO();
  const { count } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id", { count: "exact", head: true })
    .eq("lead_magnet_slug", "ugyfelut-audit")
    .eq("qualification_result", "qualified")
    .gte("created_at", sinceMonday);

  const weeklyTaken = count ?? 0;
  const weeklyRemaining = Math.max(0, WEEKLY_CAP - weeklyTaken);
  const capReached = weeklyRemaining === 0;

  async function submitAudit(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const businessAge = String(formData.get("business_age") ?? "").trim();
    const monthlyLeads = String(formData.get("monthly_leads") ?? "").trim();
    const focus = String(formData.get("focus") ?? "").trim();
    const marketingConsent = formData.get("marketing_consent") === "on";

    if (!name || name.length < 2) redirect("/lead-magnet/ugyfelut-audit?error=name");
    if (!email || !email.includes("@")) redirect("/lead-magnet/ugyfelut-audit?error=email");
    if (!businessAge || !monthlyLeads) redirect("/lead-magnet/ugyfelut-audit?error=fields");
    if (focus.length < 20) redirect("/lead-magnet/ugyfelut-audit?error=focus-short");

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 3, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 2, 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/lead-magnet/ugyfelut-audit?error=too-many");
    }

    // Kvalifikáció logika
    const tooEarly = businessAge === "0-3-honap" && (monthlyLeads === "0-2" || monthlyLeads === "3-5");
    const qualificationResult: "qualified" | "too-early" =
      tooEarly ? "too-early" : "qualified";

    // Recheck heti cap if kvalifikált
    if (qualificationResult === "qualified") {
      const { count: capCount } = await supabaseAdmin
        .from("lead_magnet_submissions")
        .select("id", { count: "exact", head: true })
        .eq("lead_magnet_slug", "ugyfelut-audit")
        .eq("qualification_result", "qualified")
        .gte("created_at", mondayMidnightISO());
      if ((capCount ?? 0) >= WEEKLY_CAP) {
        redirect("/lead-magnet/ugyfelut-audit?error=full");
      }
    }

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "ugyfelut-audit",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: false, // a hívás privát, ezt soha nem osztjuk meg
        payload: { business_age: businessAge, monthly_leads: monthlyLeads, focus },
        attila_review_status: "not-applicable",
        qualification_result: qualificationResult,
        client_ip: ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/ugyfelut-audit] insert error", dbErr);
      redirect("/lead-magnet/ugyfelut-audit?error=server");
    }

    if (qualificationResult === "too-early") {
      // The cron at /api/lead-magnet/process-pending fogja kiküldeni az
      // sendQualificationDeclined emailt — addig is redirect a köszönöm-too-early oldalra.
      redirect(`/lead-magnet/ugyfelut-audit/koszonom?id=${data.id}&result=too-early`);
    }

    // Kvalifikált → Cal.com booking, név+email URL-paraméterben átadva
    const calUrl = new URL(CAL_AUDIT_URL);
    calUrl.searchParams.set("name", name);
    calUrl.searchParams.set("email", email);
    calUrl.searchParams.set("metadata[submission_id]", data.id);
    redirect(calUrl.toString());
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Lead Magnet · 20 perc</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Ügyfélút <em className="italic em-violet">audit</em>
            </h1>
            <p className="mt-3 font-display text-2xl italic tracking-tight text-foreground-soft md:text-3xl">
              20 perces hívás · 1 munkanapon belül összefoglaló
            </p>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Megnézzük, mi történik attól a pillanattól, hogy valaki érdeklődik nálad, addig, hogy ügyfél lesz belőle. 20 perc beszélgetés, 1 munkanapon belül 1 oldalas írásos összefoglaló.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Nem eladási hívás. Szigorúan diagnózis.
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ 20 perc, semmivel se több</li>
              <li>→ 3 kérdés előzetesen, hogy a hívás 80%-a diagnózisra menjen</li>
              <li>→ 1 munkanapon belül 1 oldalas írásos összefoglaló + Notion sablon</li>
              <li>→ Heti max {WEEKLY_CAP} hívás (kapacitás miatt)</li>
              <li>→ Nincs pitch a hívás végén — 3 folytatási opció írásban</li>
            </ul>

            <div className="mt-12 inline-block border border-border-strong bg-surface px-5 py-4">
              <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">
                Ezen a héten még
              </div>
              <div className="mt-2 font-display text-3xl italic em-violet">
                {weeklyRemaining}{" "}
                <span className="text-foreground-soft not-italic">/ {WEEKLY_CAP}</span>{" "}
                <span className="font-sans text-base not-italic text-foreground-muted">hely</span>
              </div>
            </div>
          </div>
        </section>

        {/* Kvalifikáció / form */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>
              {capReached ? "A heti kapacitás betelt" : "Mielőtt naptárt nyitok"}
            </SectionLabel>

            {capReached ? (
              <div className="mt-10 space-y-6">
                <h2 className="font-display text-3xl tracking-tight md:text-4xl">
                  Hétfőn újra <em className="italic em-violet">nyitnak</em> a helyek.
                </h2>
                <p className="font-sans text-base leading-relaxed text-foreground-soft">
                  Heti {WEEKLY_CAP} hívást csinálok, hogy egyenként valódi figyelemmel végig tudjak menni. A hét betelt. Hétfő reggel ismét lesz {WEEKLY_CAP} hely.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <a
                    href="/lead-magnet/ai-mukodesi-terkep"
                    className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                  >
                    Helyette: AI-működési térkép <span className="arrow">→</span>
                  </a>
                  <a
                    href="/lead-magnet/ai-folyamatvazlat-48h"
                    className="hover-arrow group inline-block border border-border-strong px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:border-foreground"
                  >
                    Vagy: AI-folyamatvázlat <span className="arrow">→</span>
                  </a>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
                  3 gyors kérdés. Ezekből derül ki, hogy az audit most a leghasznosabb lépés-e neked, vagy valami más.
                </p>

                {error === "name" && <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>}
                {error === "email" && <ErrorBox>Add meg az e-mail címed.</ErrorBox>}
                {error === "fields" && (
                  <ErrorBox>Válassz mindkét legördülőből.</ErrorBox>
                )}
                {error === "focus-short" && (
                  <ErrorBox>A &bdquo;mit szeretnél javítani&rdquo; mező legalább 20 karakter legyen.</ErrorBox>
                )}
                {error === "too-many" && <ErrorBox>Túl sok kitöltés. Próbáld meg 1 óra múlva.</ErrorBox>}
                {error === "full" && (
                  <ErrorBox>A heti kapacitás épp most telt be. Hétfő reggel újra nyitnak a helyek.</ErrorBox>
                )}
                {error === "server" && (
                  <ErrorBox>Szerver hiba — próbáld újra. Ha továbbra is, írj a hello@solobusiness.hu-ra.</ErrorBox>
                )}

                <form action={submitAudit} className="mt-10 space-y-8">
                  <FormField label="Mi a neved?" name="name" type="text" autoComplete="name" required minLength={2} />
                  <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

                  <FormSelect
                    label="1. kérdés — Mióta működik a vállalkozásod?"
                    name="business_age"
                    options={[
                      { value: "", label: "Válassz…", disabled: true },
                      { value: "0-3-honap", label: "0-3 hónap" },
                      { value: "3-12-honap", label: "3-12 hónap" },
                      { value: "1-3-ev", label: "1-3 év" },
                      { value: "3-plus-ev", label: "3+ év" },
                    ]}
                  />

                  <FormSelect
                    label="2. kérdés — Havi átlagos érdeklődő-szám"
                    name="monthly_leads"
                    options={[
                      { value: "", label: "Válassz…", disabled: true },
                      { value: "0-2", label: "0-2 új érdeklődő havonta" },
                      { value: "3-5", label: "3-5" },
                      { value: "6-15", label: "6-15" },
                      { value: "16-plus", label: "16+" },
                    ]}
                  />

                  <FormTextarea
                    label="3. kérdés — Mit szeretnél javítani konkrétan?"
                    hint="Mit szeretnél hogy javuljon a következő 30 napban? Egy konkrét szám vagy egy konkrét helyzet. Pl. „2 napos válaszidőről 4 órás válaszidőre&rdquo; vagy „elveszett érdeklődők számának csökkentése&rdquo;."
                    name="focus"
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
                        Iratkozz fel a 41 leveles ingyenes Solo Business hírlevélre — heti 1-2 e-mail. Az audit-elemzéseimet rendszeresen megosztom anonimizálva.
                      </span>
                    </label>
                  </fieldset>

                  <button
                    type="submit"
                    className="hover-arrow group w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                  >
                    Tovább a naptárhoz <span className="arrow">→</span>
                  </button>

                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                    Ha a 3 válaszod alapján most még nem ezt javaslom, e-mailben elmagyarázom, mi lenne hasznosabb. Nem foglalsz akkor naptárt.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>

        {/* Kinek ezt javaslom blokk */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Kinek érdemes foglalnia</SectionLabel>
            <ul className="mt-8 space-y-3 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Vállalkozás már 6+ hónapja működik</li>
              <li>— Havi minimum 3 érdeklődő érkezik</li>
              <li>— Érdeklődő-ügyfél átalakulási arány javítható</li>
            </ul>

            <h3 className="mt-12 font-display text-2xl italic tracking-tight text-foreground-soft md:text-3xl">
              Kinek NEM ezt javaslom:
            </h3>
            <ul className="mt-6 space-y-3 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Aki most indul — az ingyenes hírlevél hasznosabb</li>
              <li>— Coachként pozícionál</li>
              <li>— Csak kíváncsi, de nincs valódi szándék</li>
            </ul>
          </div>
        </section>

        {/* Hitelességi blokk */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Hitelesség</SectionLabel>
            <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              Nem konzulens, hanem másik <em className="italic em-violet">szóló vállalkozó</em>.
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              Itt vagyok a 30. napon a saját Solo Business útammal. Az ügyfélút-térképet a saját rendszerem felépítése közben raktam össze, és most ennek egy sűrített 20 perces verzióját adom át. A 49 000 Ft-os Akadémia 1. modulja gyakorlatilag ez — itt ingyen, és ha utána szeretnéd a többi modult is, az teljesen a te döntésed.
            </p>
          </div>
        </section>

        {/* Anti-eladás keret */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Mit NE várj el</SectionLabel>
            <ul className="mt-8 space-y-4 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Nem fogok 10 perc után pitchelni a kurzust</li>
              <li>— Nem fogok &bdquo;kockáztass többet&rdquo; típusú nyomást gyakorolni</li>
              <li>— Nem fogok ajánlókat küldeni a hívás után</li>
              <li>
                A hívás után 1 e-mail jön: a 4-szekciós összefoglalód. A folytatás a te kezedben.
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function mondayMidnightISO(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysSinceMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
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

function FormSelect({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: { value: string; label: string; disabled?: boolean }[];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft"
      >
        {label}
      </label>
      <select
        name={name}
        id={name}
        required
        defaultValue=""
        className="mt-3 w-full border border-border-strong bg-background px-4 py-4 font-sans text-base text-foreground focus:border-foreground focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
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
