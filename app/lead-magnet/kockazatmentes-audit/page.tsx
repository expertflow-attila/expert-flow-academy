import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  ConsentFields,
  ErrorBox,
  FormCheckboxGroup,
  FormField,
  FormRadioGroup,
  FormTextarea,
  GdprFooter,
  SubmitButton,
} from "../_components/lm-form";

export const metadata = {
  title: "Kockázatmentes AI Audit — Expert Flow",
  description:
    "7 kérdés. 3 lehetséges első lépés kockázati súlyozással. Megnézzük együtt mi a legkisebb kockázatú, de legnagyobb hatású AI-lépésed — anélkül, hogy bármit el kéne köteleződnöd.",
};

const FEAR_OPTIONS = [
  { value: "wasted-money", label: "Kidobott pénz lesz" },
  { value: "wont-work", label: "Nem fog működni / félúton elromlik" },
  { value: "too-complex", label: "Túl bonyolult, nem fogom érteni" },
  { value: "no-time", label: "Nem lesz időm rá hogy belevágjak" },
  { value: "clients-notice", label: "Az ügyfeleim észreveszik hogy AI van mögötte" },
  { value: "other", label: "Egyéb (írd meg a 2. kérdésbe)" },
];

const TOOL_OPTIONS = [
  { value: "gmail-outlook", label: "Gmail / Outlook" },
  { value: "calendar", label: "Google / Outlook naptár" },
  { value: "notion-obsidian", label: "Notion / Obsidian" },
  { value: "excel-sheets", label: "Excel / Sheets" },
  { value: "chatgpt-claude", label: "ChatGPT / Claude / egyéb LLM" },
  { value: "n8n-make-zapier", label: "n8n / Make / Zapier (automation)" },
  { value: "crm", label: "CRM rendszer" },
];

const PAYMENT_OPTIONS = [
  { value: "0", label: "0 Ft, csak ha biztos vagyok benne" },
  { value: "5-15k", label: "5-15 000 Ft, kis kockázat" },
  { value: "30-50k", label: "30-50 000 Ft, ha bizonyítottan működik" },
  { value: "100k+", label: "100k+ Ft, ha érti a problémámat" },
];

const TEAM_OPTIONS = [
  { value: "1", label: "Egyedül" },
  { value: "2-5", label: "2-5 fő" },
  { value: "6-15", label: "6-15 fő" },
  { value: "15+", label: "15+ fő" },
];

export default async function LMRiskFreePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; utm_source?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const utmSource = params?.utm_source;

  async function submitForm(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const q1 = String(formData.get("q1") ?? "").trim();
    const q2 = String(formData.get("q2") ?? "").trim();
    const q3Values = formData.getAll("q3").map(String);
    const q4 = String(formData.get("q4") ?? "").trim();
    const q5Values = formData.getAll("q5").map(String);
    const q6 = String(formData.get("q6") ?? "").trim();
    const q7 = String(formData.get("q7") ?? "").trim();
    const marketingConsent = formData.get("marketing_consent") === "on";
    const shareAnonymized = formData.get("share_anonymized") !== "off";
    const utm = String(formData.get("utm_source") ?? "").trim() || null;

    if (!name || name.length < 2) redirect("/lead-magnet/kockazatmentes-audit?error=name");
    if (!email || !email.includes("@")) redirect("/lead-magnet/kockazatmentes-audit?error=email");
    if (q1.length < 5 || q2.length < 20) redirect("/lead-magnet/kockazatmentes-audit?error=short");
    if (!q3Values.length) redirect("/lead-magnet/kockazatmentes-audit?error=fears");
    if (!q6 || !PAYMENT_OPTIONS.some((p) => p.value === q6)) redirect("/lead-magnet/kockazatmentes-audit?error=payment");
    if (!q7 || !TEAM_OPTIONS.some((t) => t.value === q7)) redirect("/lead-magnet/kockazatmentes-audit?error=team");

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 3, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 2, 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/lead-magnet/kockazatmentes-audit?error=too-many");
    }

    // Lead score calculation
    const paymentScore = q6 === "100k+" ? 100 : q6 === "30-50k" ? 40 : q6 === "5-15k" ? 15 : 0;
    const hasAi = q5Values.some((v) => ["chatgpt-claude", "n8n-make-zapier"].includes(v));
    const isSolo = q7 === "1";
    const hasNoBadExp = q4.length === 0;
    const leadScore = paymentScore + (hasAi ? 20 : 0) + (isSolo ? 15 : 0) + (hasNoBadExp ? 10 : 0);

    let recommendation: string;
    if (leadScore > 50) recommendation = "cal-qualification";
    else if (leadScore >= 20) recommendation = "9.9k-audit";
    else recommendation = "newsletter";

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "kockazatmentes-audit",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: shareAnonymized,
        payload: {
          q1,
          q2,
          q3: q3Values.join(", "),
          q4: q4 || "",
          q5: q5Values.join(", "),
          q6,
          q7,
        },
        attila_review_status: "pending",
        client_ip: ip,
        user_agent: userAgent,
        utm_source: utm,
        lead_score: leadScore,
        recommendation,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/kockazatmentes-audit] insert error", dbErr);
      redirect("/lead-magnet/kockazatmentes-audit?error=server");
    }

    redirect(`/lead-magnet/kockazatmentes-audit/koszonom?id=${data.id}`);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Lead Magnet · 5 perc · 0 Ft</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Kockázatmentes AI <em className="italic em-violet">Audit</em>
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Megnézzük együtt mi a 3 legkisebb kockázatú, de legnagyobb hatású AI-lépésed — anélkül, hogy bármit el kéne köteleződnöd, vagy bármit fizetnél.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Ha már egyszer beleugrottál egy AI-projektbe és csalódtál, ez Neked való. 7 kérdés, kockázati térkép a Te helyzetedre.
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ 7 kérdés, kb. 5 perc</li>
              <li>→ Kockázati térkép a Te helyzetedre (3 lehetséges első lépés)</li>
              <li>→ Mit NE csinálj — kockázati piros zóna</li>
              <li>→ Nincs eladási hívás, nincs nyomás</li>
              <li>→ Ha érdekel, kapsz egy 7 napos garanciás belépő ajánlatot</li>
            </ul>
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Add meg a 7 választ</SectionLabel>

            {error === "name" && <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>}
            {error === "email" && <ErrorBox>Add meg az e-mail címed.</ErrorBox>}
            {error === "short" && <ErrorBox>Néhány válasz túl rövid. Legalább 20 karakter a problémádhoz.</ErrorBox>}
            {error === "fears" && <ErrorBox>Jelölj be legalább egy félelmet.</ErrorBox>}
            {error === "payment" && <ErrorBox>Válassz egy fizetési hajlandóság-opciót.</ErrorBox>}
            {error === "team" && <ErrorBox>Válassz egy csapat-méret opciót.</ErrorBox>}
            {error === "too-many" && <ErrorBox>Túl sok kitöltés. Próbáld meg 1 óra múlva.</ErrorBox>}
            {error === "server" && <ErrorBox>Szerver hiba — pár perc múlva próbáld újra.</ErrorBox>}

            <form action={submitForm} className="mt-10 space-y-8">
              <FormField label="Mi a neved?" name="name" type="text" autoComplete="name" required minLength={2} />
              <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

              <FormTextarea label="1. Milyen szolgáltatást nyújtasz?" name="q1" rows={2} required minLength={5} />

              <FormTextarea
                label="2. Mi most a legnagyobb működési problémád?"
                hint="Konkrétan írd le, max 2-3 mondatban."
                name="q2"
                rows={4}
                required
                minLength={20}
              />

              <FormCheckboxGroup
                label="3. Mitől tartasz a legjobban egy AI-rendszer bevezetésével kapcsolatban? (többet is jelölhetsz)"
                name="q3"
                options={FEAR_OPTIONS}
              />

              <FormTextarea
                label="4. Volt már rossz tapasztalatod automatizálással / marketing-eszközzel / online tanfolyammal?"
                hint="Opcionális. Ha igen, röviden mi történt? (Segít hogy ezt elkerüljük.)"
                name="q4"
                rows={3}
              />

              <FormCheckboxGroup
                label="5. Milyen rendszereket / eszközöket használsz most?"
                name="q5"
                options={TOOL_OPTIONS}
              />

              <FormRadioGroup
                label="6. Mennyit lennél hajlandó fizetni egy első biztonságos AI-lépésért?"
                name="q6"
                options={PAYMENT_OPTIONS}
                required
              />

              <FormRadioGroup label="7. Hányan vagytok a vállalkozásban?" name="q7" options={TEAM_OPTIONS} required />

              <input type="hidden" name="utm_source" value={utmSource ?? ""} />

              <ConsentFields />
              <SubmitButton label="Kérek kockázati térképet" />
              <GdprFooter />
            </form>
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Miért ingyenes</SectionLabel>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              Azért hogy ne kelljen kockáztatnod. Ha utána semmit nem veszel, semmi gond — kapsz egy térképet a Te helyzetedre, és láthatod mi a kockázat-szintje minden lehetőségnek. Ha érdekel a 9 900 Ft belépő audit, az 7 napos pénzvisszafizetési garanciával jön.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
