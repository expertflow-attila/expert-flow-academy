import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const metadata = {
  title: "Sales-pipeline közös diagnózis — 30 perc 2 főre — Solo Business",
  description:
    "Mini-csapat 2-3 fővel? 30 perces közös hívás (alapító + 1 csapattag), 1 munkanapon belül írásos összefoglaló a sales-pipeline 3 szivárgási pontjáról. Heti 3 hívás.",
};

const WEEKLY_CAP = 3;

const CAL_PIPELINE_URL =
  process.env.CAL_SALES_PIPELINE_URL ??
  "https://cal.com/solobusiness/sales-pipeline-diagnozis";

export default async function LeadMagnetSalesPipelinePage({
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
    .eq("lead_magnet_slug", "sales-pipeline-diagnozis")
    .eq("qualification_result", "qualified")
    .gte("created_at", sinceMonday);

  const weeklyTaken = count ?? 0;
  const weeklyRemaining = Math.max(0, WEEKLY_CAP - weeklyTaken);
  const capReached = weeklyRemaining === 0;

  async function submitPipelineDiagnosis(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const teamSize = String(formData.get("team_size") ?? "").trim();
    const monthlyLeads = String(formData.get("monthly_leads") ?? "").trim();
    const pipelineStage = String(formData.get("pipeline_stage") ?? "").trim();
    const focus = String(formData.get("focus") ?? "").trim();
    const secondPersonName = String(formData.get("second_person_name") ?? "").trim();
    const marketingConsent = formData.get("marketing_consent") === "on";

    if (!name || name.length < 2) redirect("/lead-magnet/sales-pipeline-diagnozis?error=name");
    if (!email || !email.includes("@")) redirect("/lead-magnet/sales-pipeline-diagnozis?error=email");
    if (!teamSize || !["1", "2", "3", "4-plus"].includes(teamSize)) {
      redirect("/lead-magnet/sales-pipeline-diagnozis?error=fields");
    }
    if (!monthlyLeads || !pipelineStage) {
      redirect("/lead-magnet/sales-pipeline-diagnozis?error=fields");
    }
    if (focus.length < 20) {
      redirect("/lead-magnet/sales-pipeline-diagnozis?error=focus-short");
    }

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 3, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 2, 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/lead-magnet/sales-pipeline-diagnozis?error=too-many");
    }

    // Kvalifikációs logika
    // too-early: 1 fős (szóló) → LM3-at ajánljuk; 4+ fős → kívül az ICP-n;
    //            0-2 lead/hó → nincs elég pipeline ehhez; "nincs-pipeline" stage → hírlevél javasolt
    const noFit = teamSize === "4-plus";
    const tooEarly =
      !noFit &&
      (teamSize === "1" ||
        monthlyLeads === "0-2" ||
        pipelineStage === "nincs-pipeline");
    const qualificationResult: "qualified" | "too-early" | "no-fit" = noFit
      ? "no-fit"
      : tooEarly
      ? "too-early"
      : "qualified";

    if (qualificationResult === "qualified") {
      const { count: capCount } = await supabaseAdmin
        .from("lead_magnet_submissions")
        .select("id", { count: "exact", head: true })
        .eq("lead_magnet_slug", "sales-pipeline-diagnozis")
        .eq("qualification_result", "qualified")
        .gte("created_at", mondayMidnightISO());
      if ((capCount ?? 0) >= WEEKLY_CAP) {
        redirect("/lead-magnet/sales-pipeline-diagnozis?error=full");
      }
    }

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "sales-pipeline-diagnozis",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: false,
        payload: {
          team_size: teamSize,
          monthly_leads: monthlyLeads,
          pipeline_stage: pipelineStage,
          focus,
          second_person_name: secondPersonName || null,
        },
        attila_review_status: "not-applicable",
        qualification_result: qualificationResult,
        client_ip: ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/sales-pipeline-diagnozis] insert error", dbErr);
      redirect("/lead-magnet/sales-pipeline-diagnozis?error=server");
    }

    if (qualificationResult === "too-early") {
      redirect(
        `/lead-magnet/sales-pipeline-diagnozis/koszonom?id=${data.id}&result=too-early`,
      );
    }
    if (qualificationResult === "no-fit") {
      redirect(
        `/lead-magnet/sales-pipeline-diagnozis/koszonom?id=${data.id}&result=no-fit`,
      );
    }

    // Kvalifikált → Cal.com booking, 30 perc közös hívásra
    const calUrl = new URL(CAL_PIPELINE_URL);
    calUrl.searchParams.set("name", name);
    calUrl.searchParams.set("email", email);
    calUrl.searchParams.set("metadata[submission_id]", data.id);
    if (secondPersonName) {
      calUrl.searchParams.set("metadata[second_person]", secondPersonName);
    }
    redirect(calUrl.toString());
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Lead Magnet · mini-csapat · 30 perc</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Sales-pipeline közös <em className="italic em-violet">diagnózis</em>
            </h1>
            <p className="mt-3 font-display text-2xl italic tracking-tight text-foreground-soft md:text-3xl">
              30 perces hívás 2 főre · 1 munkanapon belül összefoglaló
            </p>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Te + a csapatod 1 tagja (általában az, aki a sales-pipeline-ban a leginkább benne van). 30 perc közös beszélgetés, 1 munkanapon belül 1 oldalas írásos összefoglaló a 3 szivárgási pontotokról.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Nem eladási hívás. Szigorúan közös diagnózis a 2-3 fős csapatotokon belül.
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ 30 perc, semmivel se több</li>
              <li>→ Te + 1 csapattag — közös perspektíva, NEM &bdquo;csak az alapító&rdquo;</li>
              <li>→ 4 előzetes kérdés, hogy a hívás 80%-a diagnózisra menjen</li>
              <li>→ 1 munkanapon belül 1 oldalas írásos összefoglaló</li>
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
                  Heti {WEEKLY_CAP} közös hívást csinálok, hogy egyenként valódi figyelemmel végig tudjak menni a 2 emberrel. A hét betelt. Hétfő reggel ismét lesz {WEEKLY_CAP} hely.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <a
                    href="/lead-magnet/csapat-szerep-terkep"
                    className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                  >
                    Helyette: Csapat-szerep térkép <span className="arrow">→</span>
                  </a>
                  <a
                    href="/lead-magnet/mini-onboarding-vazlat"
                    className="hover-arrow group inline-block border border-border-strong px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:border-foreground"
                  >
                    Vagy: Mini-onboarding vázlat <span className="arrow">→</span>
                  </a>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
                  4 gyors kérdés. Ezekből derül ki, hogy a közös diagnózis most a leghasznosabb lépés-e nektek, vagy valami más.
                </p>

                {error === "name" && <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>}
                {error === "email" && <ErrorBox>Add meg az e-mail címed.</ErrorBox>}
                {error === "fields" && <ErrorBox>Válassz mindegyik legördülőből.</ErrorBox>}
                {error === "focus-short" && (
                  <ErrorBox>A &bdquo;mit szeretnétek javítani&rdquo; mező legalább 20 karakter legyen.</ErrorBox>
                )}
                {error === "too-many" && <ErrorBox>Túl sok kitöltés. Próbáld meg 1 óra múlva.</ErrorBox>}
                {error === "full" && (
                  <ErrorBox>A heti kapacitás épp most telt be. Hétfő reggel újra nyitnak a helyek.</ErrorBox>
                )}
                {error === "server" && (
                  <ErrorBox>Szerver hiba — próbáld újra. Ha továbbra is, írj a hello@solobusiness.hu-ra.</ErrorBox>
                )}

                <form action={submitPipelineDiagnosis} className="mt-10 space-y-8">
                  <FormField label="Mi a neved? (te vagy az alapító)" name="name" type="text" autoComplete="name" required minLength={2} />
                  <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

                  <FormField
                    label="Ki jön veled a hívásra? (név, opcionális — de ajánlott)"
                    name="second_person_name"
                    type="text"
                  />

                  <FormSelect
                    label="1. kérdés — Hány főből áll a csapat (téged beleszámolva)?"
                    name="team_size"
                    options={[
                      { value: "", label: "Válassz…", disabled: true },
                      { value: "1", label: "1 fő (csak én — szóló)" },
                      { value: "2", label: "2 fő" },
                      { value: "3", label: "3 fő" },
                      { value: "4-plus", label: "4 vagy több fő" },
                    ]}
                  />

                  <FormSelect
                    label="2. kérdés — Havi átlagos érdeklődő-szám (sales-pipeline-be belépő)"
                    name="monthly_leads"
                    options={[
                      { value: "", label: "Válassz…", disabled: true },
                      { value: "0-2", label: "0-2 új érdeklődő havonta" },
                      { value: "3-7", label: "3-7" },
                      { value: "8-20", label: "8-20" },
                      { value: "20-plus", label: "20+" },
                    ]}
                  />

                  <FormSelect
                    label="3. kérdés — Milyen a sales-pipeline állapota most?"
                    name="pipeline_stage"
                    options={[
                      { value: "", label: "Válassz…", disabled: true },
                      { value: "nincs-pipeline", label: "Nincs igazi pipeline, ad-hoc kezeljük" },
                      { value: "fejben", label: "Fejben + emailben van, nincs közös eszköz" },
                      { value: "kozos-eszkozben", label: "Van közös eszköz (Notion/Trello/Sheets), de nem konzisztens" },
                      { value: "crm", label: "CRM-ben van, mindenki használja" },
                    ]}
                  />

                  <FormTextarea
                    label="4. kérdés — Mit szeretnétek konkrétan javítani?"
                    hint="Mit szeretnétek hogy javuljon a következő 30 napban? Egy konkrét szám vagy konkrét helyzet. Pl. „elveszett érdeklődők számának csökkentése&rdquo;, „2 napos válaszidőről 4 órás válaszidőre&rdquo;, vagy „mindenki látja kinek meddig jutott&rdquo;."
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
                        Iratkozz fel a 41 leveles ingyenes Solo Business hírlevélre — heti 1-2 e-mail. A diagnózisaim anonimizált tanulságait rendszeresen megosztom.
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
                    Ha a 4 válaszotok alapján most még nem ezt javaslom, e-mailben elmagyarázom, mi lenne hasznosabb. Nem foglaltok akkor naptárt.
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
              <li>— 2-3 fős mini-csapat (alapító + 1-2 fő)</li>
              <li>— Havi minimum 3 érdeklődő a sales-pipeline-ba</li>
              <li>— Van valami, ami nem egyértelmű köztetek a pipeline-ban</li>
              <li>— A csapat egy másik tagja is be tud jönni 30 percre</li>
            </ul>

            <h3 className="mt-12 font-display text-2xl italic tracking-tight text-foreground-soft md:text-3xl">
              Kinek NEM ezt javaslom:
            </h3>
            <ul className="mt-6 space-y-3 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Szóló vállalkozónak (1 fős) — neki az Ügyfélút audit jobb</li>
              <li>— 4+ fős cégnek — nekik az Expert Flow konzultáció</li>
              <li>— Aki most kezdi (0-2 érdeklődő/hó) — hírlevél hasznosabb</li>
              <li>— Aki egyedül akar bejönni — a közös perspektíva a hívás lényege</li>
            </ul>
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
              Még nincs fizetős ügyfelem. Saját AI-csapatommal (Hermes 6 sub-agent + 3 cron) dolgozom mini-csapat-analógiában — az ott szerzett tapasztalatomat alkalmazom a TI 2-3 fős sales-pipeline-otokra. Nem tanácsadói anyag, hanem egy diagnosztikus perspektíva amit közösen építünk ki 30 perc alatt.
            </p>
          </div>
        </section>

        {/* Anti-eladás keret */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Mit NE várjatok</SectionLabel>
            <ul className="mt-8 space-y-4 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Nem fogok 10 perc után pitchelni a mini-sprintet</li>
              <li>— Nem fogok &bdquo;dolgozzatok többet&rdquo; típusú nyomást gyakorolni</li>
              <li>— Nem fogok ajánlókat küldeni a hívás után</li>
              <li>
                A hívás után 1 e-mail jön: a 4-szekciós közös összefoglalótok. A folytatás a ti kezetekben.
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
