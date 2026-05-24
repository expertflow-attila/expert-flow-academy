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
  title: "Q3 AI-Rendszer Pályázat — Expert Flow",
  description:
    "Egy magyar szóló vállalkozó kap a Q3 nyertesként egy teljes AI-rendszert az első ügyfélfolyamatára — 599 000 Ft értékben, 30 napos beépítéssel. A többi pályázó kedvezményes belépő ajánlatot kap. Pályázat, nem nyereményjáték.",
};

const CAMPAIGN_SLUG = "ai-rendszer-giveaway-q3";

const BUSINESS_TYPE_OPTIONS = [
  { value: "tanacsado", label: "Tanácsadó" },
  { value: "kreativ", label: "Kreatív (designer / copywriter / fotós / videós)" },
  { value: "konyveles-jog", label: "Könyvelő / ügyvéd / adótanácsadó" },
  { value: "trener-coach", label: "Tréner (NEM coach — Expert Flow szabály)" },
  { value: "online-tanfolyam", label: "Online tanfolyam-tulajdonos" },
  { value: "egyeb", label: "Egyéb szakértői szolgáltatás" },
];

const MONTHS_OPTIONS = [
  { value: "<6m", label: "Kevesebb mint 6 hónap (sajnos kizáró ok)" },
  { value: "6-12m", label: "6-12 hónap" },
  { value: "1-3y", label: "1-3 év" },
  { value: "3y+", label: "3+ év" },
];

const LEADS_PER_WEEK = [
  { value: "<3", label: "Kevesebb mint 3 (sajnos kizáró ok)" },
  { value: "3-7", label: "3-7" },
  { value: "8-15", label: "8-15" },
  { value: "15+", label: "15+" },
];

const TOOL_OPTIONS = [
  { value: "gmail-outlook", label: "Gmail / Outlook" },
  { value: "calendar", label: "Google / Outlook naptár" },
  { value: "notion-obsidian", label: "Notion / Obsidian" },
  { value: "excel-sheets", label: "Excel / Sheets" },
  { value: "chatgpt-claude", label: "ChatGPT / Claude" },
  { value: "n8n-make-zapier", label: "n8n / Make / Zapier" },
  { value: "crm", label: "CRM rendszer" },
];

const LEAD_SOURCES = [
  { value: "ajanlas", label: "Ajánlás" },
  { value: "google", label: "Google" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook-insta", label: "Facebook / Instagram" },
  { value: "cold", label: "Cold outreach" },
  { value: "egyeb", label: "Egyéb" },
];

const REVENUE_OPTIONS = [
  { value: "<500k", label: "Kevesebb mint 500 000 Ft" },
  { value: "500k-2m", label: "500 000 — 2 000 000 Ft" },
  { value: "2-5m", label: "2 000 000 — 5 000 000 Ft" },
  { value: "5m+", label: "5 000 000 Ft fölött" },
];

export default async function LMGiveawayPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  async function submitForm(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const q1 = String(formData.get("q1") ?? "").trim();
    const q2 = String(formData.get("q2") ?? "").trim();
    const q3 = String(formData.get("q3") ?? "").trim();
    const q4 = String(formData.get("q4") ?? "").trim();
    const q5 = String(formData.get("q5") ?? "").trim();
    const q6Values = formData.getAll("q6").map(String);
    const q7Values = formData.getAll("q7").map(String);
    const q8 = String(formData.get("q8") ?? "").trim();
    const q9 = formData.get("q9") === "on";
    const q10 = String(formData.get("q10") ?? "").trim();
    const marketingConsent = formData.get("marketing_consent") === "on";

    if (!name || name.length < 2) redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=name`);
    if (!email || !email.includes("@")) redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=email`);
    if (!q1) redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=q1`);
    if (!q2) redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=q2`);
    if (!q3) redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=q3`);
    if (q4.length < 30) redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=q4-short`);
    if (q5.length < 20) redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=q5-short`);
    if (!q8) redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=q8`);
    if (q10.length < 20) redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=q10-short`);

    // Eligibility — kizáró okok
    if (q2 === "<6m") redirect(`/lead-magnet/${CAMPAIGN_SLUG}/koszonom?eligible=no&reason=tooyoung`);
    if (q3 === "<3") redirect(`/lead-magnet/${CAMPAIGN_SLUG}/koszonom?eligible=no&reason=lowtraffic`);
    if (q1 === "trener-coach" && q4.toLowerCase().includes("coach")) {
      redirect(`/lead-magnet/${CAMPAIGN_SLUG}/koszonom?eligible=no&reason=nocoach`);
    }

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 2, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 1, 24 * 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=too-many`);
    }

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "ai-rendszer-giveaway-q3",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: true,
        payload: {
          q1,
          q2,
          q3,
          q4,
          q5,
          q6: q6Values.join(", "),
          q7: q7Values.join(", "),
          q8,
          q9: q9 ? "yes" : "no",
          q10,
        },
        attila_review_status: "pending",
        client_ip: ip,
        user_agent: userAgent,
        giveaway_campaign_slug: CAMPAIGN_SLUG,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/giveaway-q3] insert error", dbErr);
      redirect(`/lead-magnet/${CAMPAIGN_SLUG}?error=server`);
    }

    redirect(`/lead-magnet/${CAMPAIGN_SLUG}/koszonom?id=${data.id}&eligible=yes`);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Q3 Pályázat · 8 perc · 599 000 Ft érték</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Az első ügyfélfolyamatod <em className="italic em-violet">AI-rendszerré</em> alakítása.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Egy magyar szóló vállalkozó kap a Q3 nyertesként egy teljes AI-rendszert az első ügyfélfolyamatára — 30 napos beépítéssel, 0 Ft költséggel. A többi pályázó kedvezményes belépő ajánlatot kap.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              <strong className="text-foreground-soft">Ez nem nyereményjáték.</strong> Ez egy szakmai pályázat. 10 kérdés, ICP-szűrés, és nyilvános dokumentáció a nyertes munkájáról (szakmai-leíró).
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ Nyertes: 599 000 Ft értékű AI-rendszer felépítése</li>
              <li>→ Top 20: 30% kedvezmény a Belépő Auditra (6 900 Ft)</li>
              <li>→ Runner-up: 20% kedvezmény az Akadémiára (39 200 Ft)</li>
              <li>→ Pályázás határidő: lásd a kampány landing oldalt</li>
              <li>→ Minimum 6 hónap aktív működés + heti 3 érdeklődő szükséges</li>
            </ul>
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>10 kérdés — pályázás</SectionLabel>

            {error?.startsWith("q") && <ErrorBox>Kérlek tölts ki minden kérdést.</ErrorBox>}
            {error === "name" && <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>}
            {error === "email" && <ErrorBox>Add meg az e-mail címed.</ErrorBox>}
            {error === "too-many" && <ErrorBox>Csak egyszer pályázhatsz / nap.</ErrorBox>}
            {error === "server" && <ErrorBox>Szerver hiba — pár perc múlva próbáld újra.</ErrorBox>}

            <form action={submitForm} className="mt-10 space-y-8">
              <FormField label="Mi a neved?" name="name" type="text" autoComplete="name" required minLength={2} />
              <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

              <FormRadioGroup label="1. Vállalkozásod típusa?" name="q1" options={BUSINESS_TYPE_OPTIONS} required />

              <FormRadioGroup label="2. Hány hónapja működik a vállalkozásod?" name="q2" options={MONTHS_OPTIONS} required />

              <FormRadioGroup label="3. Hány érdeklődőd van heti átlagban?" name="q3" options={LEADS_PER_WEEK} required />

              <FormTextarea
                label="4. Mi a legnagyobb működési problémád most?"
                hint="Konkrétan írd le, 2-4 mondatban. Max 500 karakter."
                name="q4"
                rows={4}
                required
                minLength={30}
                maxLength={500}
              />

              <FormTextarea
                label="5. Melyik egyetlen ügyfélfolyamatot kéred ha nyersz?"
                hint="Pl. ajánlat-utánkövetés, onboarding, dokumentumkezelés. Max 400 karakter."
                name="q5"
                rows={3}
                required
                minLength={20}
                maxLength={400}
              />

              <FormCheckboxGroup label="6. Milyen rendszereket / eszközöket használsz most?" name="q6" options={TOOL_OPTIONS} />

              <FormCheckboxGroup label="7. Honnan jönnek most az érdeklődőid?" name="q7" options={LEAD_SOURCES} />

              <FormRadioGroup
                label="8. Mi a havi árbevételed becsült tartománya? (bizalmas, ICP-szűréshez)"
                name="q8"
                options={REVENUE_OPTIONS}
                required
              />

              <fieldset className="border-t border-border pt-8">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" name="q9" defaultChecked className="mt-1 h-4 w-4" />
                  <span className="font-sans text-sm leading-relaxed text-foreground-soft">
                    9. Vállalom hogy ha nyerek, a folyamat publikusan kísért legyen YouTube-on / LinkedIn-en (anonimizálható). Nem kötelező, de a győztes-választásnál előny.
                  </span>
                </label>
              </fieldset>

              <FormTextarea
                label="10. Egyetlen mondatban: miért te?"
                hint="Max 300 karakter. Egyszer fogom elolvasni — legyen jó."
                name="q10"
                rows={3}
                required
                minLength={20}
                maxLength={300}
              />

              <ConsentFields />
              <SubmitButton label="Pályázom" />
              <GdprFooter />
            </form>
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Pályázati szabályzat</SectionLabel>
            <ul className="mt-8 space-y-4 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Min. 6 hónap működés + heti 3 érdeklődő szükséges (objektív ICP-szűrés)</li>
              <li>— NEM fogadunk coach pályázatokat (Expert Flow szabály)</li>
              <li>— Az AI-előminősítés után Attila kézzel állítja össze a shortlist-et (top 3)</li>
              <li>— A nyertes a kampány végén kerül kiválasztásra</li>
              <li>— A nyertes vállalja a szakmai-leíró dokumentációt</li>
              <li>— Top 20 pályázó 30% kedvezményt kap a Belépő Auditra (7 napos érvényesség)</li>
              <li>— Minden többi runner-up 20% kedvezményt kap az Akadémiára (14 napos érvényesség)</li>
              <li>— A pályázás ingyenes és nem köt semmilyen jogi kötelezettséggel</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
