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
  title: "48 órás AI Gyorsdiagnózis — Expert Flow",
  description:
    "Tölts ki 5 kérdést, és 48 órán belül kapsz egy 7 napos akciótervet azzal hogy a 8. napra mit építs fel automatizálva. Konkrét, nem általános.",
};

const TOOL_OPTIONS = [
  { value: "gmail-outlook", label: "Gmail / Outlook" },
  { value: "calendar", label: "Google / Outlook naptár" },
  { value: "notion-obsidian", label: "Notion / Obsidian" },
  { value: "excel-sheets", label: "Excel / Sheets" },
  { value: "chatgpt-claude", label: "ChatGPT / Claude" },
  { value: "crm", label: "CRM (HubSpot, Pipedrive, Airtable...)" },
];

const TIME_OPTIONS = [
  { value: "<2h", label: "Kevesebb mint 2 óra / hét" },
  { value: "2-5h", label: "2-5 óra / hét" },
  { value: "5-10h", label: "5-10 óra / hét" },
  { value: "10-20h", label: "10-20 óra / hét" },
  { value: "20h+", label: "20+ óra / hét" },
];

export default async function LM48hPage({
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
    const q3 = String(formData.get("q3") ?? "").trim();
    const q4 = String(formData.get("q4") ?? "").trim();
    const q5Values = formData.getAll("q5").map(String);
    const marketingConsent = formData.get("marketing_consent") === "on";
    const shareAnonymized = formData.get("share_anonymized") !== "off";
    const utm = String(formData.get("utm_source") ?? "").trim() || null;

    if (!name || name.length < 2) redirect("/lead-magnet/48h-ai-gyorsdiagnozis?error=name");
    if (!email || !email.includes("@")) redirect("/lead-magnet/48h-ai-gyorsdiagnozis?error=email");
    if (q1.length < 10 || q2.length < 20 || q3.length < 20) {
      redirect("/lead-magnet/48h-ai-gyorsdiagnozis?error=short");
    }
    if (!q4 || !TIME_OPTIONS.some((t) => t.value === q4)) {
      redirect("/lead-magnet/48h-ai-gyorsdiagnozis?error=time");
    }

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 3, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 2, 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/lead-magnet/48h-ai-gyorsdiagnozis?error=too-many");
    }

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "48h-ai-gyorsdiagnozis",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: shareAnonymized,
        payload: { q1, q2, q3, q4, q5: q5Values.join(", ") },
        attila_review_status: "pending",
        client_ip: ip,
        user_agent: userAgent,
        utm_source: utm,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/48h-ai-gyorsdiagnozis] insert error", dbErr);
      redirect("/lead-magnet/48h-ai-gyorsdiagnozis?error=server");
    }

    redirect(`/lead-magnet/48h-ai-gyorsdiagnozis/koszonom?id=${data.id}`);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Lead Magnet · 4 perc</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              48 órás AI <em className="italic em-violet">Gyorsdiagnózis</em>
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              48 órán belül megkapod azt az egyetlen automatizálási lépést, amit a 7. napra már mérhetően kevesebb időbe és kevesebb káoszba kerül. Nem 3, nem 5 — egyetlenegy lépés.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Nem 10 tippes PDF. Nem AI-bevezető. 5 kérdés, 4 perc, és kapsz egy 7 napos akciótervet a Te válaszaidra szabva.
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ 5 kérdés, kb. 4 perc kitöltés</li>
              <li>→ 48 órán belül megkapod e-mailben</li>
              <li>→ Konkrét napokra bontott 7 napos terv</li>
              <li>→ A Te válaszaidra szabva, nem általános</li>
              <li>→ Akkor is megkapod, ha utána nem iratkozol fel</li>
            </ul>
          </div>
        </section>

        {/* Form */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Add meg az 5 választ</SectionLabel>

            {error === "name" && <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>}
            {error === "email" && <ErrorBox>Add meg az e-mail címed.</ErrorBox>}
            {error === "short" && <ErrorBox>Néhány válasz túl rövid. Egy mondat is elég, de értelmes mondat.</ErrorBox>}
            {error === "time" && <ErrorBox>Válassz egy időtartomány-opciót a 4. kérdéshez.</ErrorBox>}
            {error === "too-many" && <ErrorBox>Túl sok kitöltés. Próbáld meg 1 óra múlva.</ErrorBox>}
            {error === "server" && (
              <ErrorBox>Szerver hiba — pár perc múlva próbáld újra. Vagy írj a hello@expertflow.hu-ra.</ErrorBox>
            )}

            <form action={submitForm} className="mt-10 space-y-8">
              <FormField label="Mi a neved?" name="name" type="text" autoComplete="name" required minLength={2} />
              <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

              <FormTextarea
                label="1. Mi a fő szolgáltatásod?"
                hint="1 mondat, max 100 karakter."
                name="q1"
                rows={2}
                required
                minLength={10}
                maxLength={120}
              />

              <FormTextarea
                label="2. Melyik 3 feladatot csináltad manuálisan az elmúlt 7 napban, amit nem szerettél?"
                hint="Konkrét feladatnevek. (Pl. ajánlatkérőkre válaszolgatás, számlák lefűzése, naptár-koordináció.)"
                name="q2"
                rows={4}
                required
                minLength={20}
              />

              <FormTextarea
                label="3. Ha holnap reggel egy dolog automatikusan megtörténne, mi lenne az ami a legtöbb energiát visszaadná?"
                hint="Egyetlen konkrét dolog. Legyen ambiciózus, de elképzelhető."
                name="q3"
                rows={3}
                required
                minLength={20}
              />

              <FormRadioGroup
                label="4. Mennyi időt töltöttél az elmúlt héten ismétlődő manuális munkával? (saccolj)"
                name="q4"
                options={TIME_OPTIONS}
                required
              />

              <FormCheckboxGroup
                label="5. Milyen eszközöket használsz most? (jelöld az aktívakat)"
                name="q5"
                options={TOOL_OPTIONS}
              />

              <input type="hidden" name="utm_source" value={utmSource ?? ""} />

              <ConsentFields />
              <SubmitButton label="Kérek 48h gyorsdiagnózist" />
              <GdprFooter />
            </form>
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
                Csak azt ígérem, hogy egyetlen konkrét lépést megnevezek a Te válaszaidból, és lépésről lépésre megmutatom hogyan bontható szét 7 napra.
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
