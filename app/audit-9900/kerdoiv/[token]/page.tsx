import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { ErrorBox, FormField, FormTextarea, GdprFooter, SubmitButton } from "@/app/lead-magnet/_components/lm-form";

export const metadata = { title: "Audit kérdőív — 12 kérdés" };

export default async function Audit9900QuestionnairePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; field?: string; done?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;

  const { data: q } = await supabaseAdmin
    .from("audit_9900_questionnaires")
    .select("id, submission_id, access_token, completed_at")
    .eq("access_token", token)
    .maybeSingle();

  if (!q) notFound();

  // Find related submission
  const { data: submission } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name, email")
    .eq("id", q.submission_id)
    .maybeSingle();

  if (!submission) notFound();

  if (q.completed_at) {
    return (
      <>
        <Header active="" />
        <main id="main">
          <section className="border-b border-border py-24 md:py-32">
            <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
              <SectionLabel>Már kitöltötted</SectionLabel>
              <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
                Köszi — <em className="italic em-violet">megvan</em>.
              </h1>
              <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                A kérdőívet már kitöltötted. 3 munkanapon belül megkapod az auditot e-mailben.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  async function submitQuestionnaire(formData: FormData) {
    "use server";

    const answers: Record<string, string> = {};
    for (let i = 1; i <= 12; i++) {
      answers[`q${i}`] = String(formData.get(`q${i}`) ?? "").trim();
    }
    const company = String(formData.get("company") ?? "").trim();

    // Minimum 20 chars per textarea
    const minLength: Record<string, number> = {
      q1: 30, q2: 5, q3: 10, q4: 30, q5: 10, q6: 20, q7: 10,
      q8: 30, q9: 30, q10: 30, q11: 10, q12: 5,
    };
    for (const [key, min] of Object.entries(minLength)) {
      if ((answers[key] || "").length < min) {
        redirect(`/audit-9900/kerdoiv/${token}?error=short&field=${key}`);
      }
    }

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const ipCheck = await checkRateLimit(`audit-9900-questionnaire-ip:${ip}`, 5, 60 * 60);
    if (!ipCheck.allowed) {
      redirect(`/audit-9900/kerdoiv/${token}?error=too-many`);
    }

    // Save questionnaire answers
    await supabaseAdmin
      .from("audit_9900_questionnaires")
      .update({
        answers,
        completed_at: new Date().toISOString(),
      })
      .eq("id", q!.id);

    // Update the submission's payload — this triggers the Claude generation on next cron
    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        payload: { ...answers, company, name: submission!.name },
        post_payment_questionnaire_completed_at: new Date().toISOString(),
      })
      .eq("id", submission!.id);

    redirect(`/audit-9900/kerdoiv/${token}?done=1`);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Audit kérdőív · 15 perc · {submission.name}</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              A 12 <em className="italic em-violet">kérdés</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Ezekre a válaszokra fogom építeni a 8 oldalas auditodat. Konkrét válaszokra van szükség — minél részletesebb, annál jobb az audit. Ne általánosítsd.
            </p>
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            {sp?.error === "short" && <ErrorBox>Néhány válasz túl rövid. Olvasd át a kérdéseket, és írj részletes választ.</ErrorBox>}
            {sp?.error === "too-many" && <ErrorBox>Túl sok próbálkozás. Várj 1 órát.</ErrorBox>}
            {sp?.done === "1" && (
              <div className="mb-10 border border-foreground bg-surface px-4 py-6 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground">
                ✓ Kérdőív elküldve. 3 munkanapon belül megkapod az auditot. Ezt az oldalt bezárhatod.
              </div>
            )}

            <form action={submitQuestionnaire} className="space-y-8">
              <FormField label="Cégnév (opcionális)" name="company" type="text" />

              <FormTextarea
                label="1. Vállalkozásod típusa és célközönséged egy mondatban"
                hint="Pl. „Online tanfolyam-tulajdonos vagyok, magyar HR-eseknek tanítok adatelemzést Power BI-jal."
                name="q1"
                rows={3}
                required
                minLength={30}
              />

              <FormTextarea label="2. Heti érdeklődő-szám átlagosan" hint="Pl. 5-7, 10-15, 20+." name="q2" rows={1} required minLength={5} />

              <FormTextarea
                label="3. Hova vezet a fő érdeklődő-becsatornázásod?"
                hint="LinkedIn / Google / ajánlás / YouTube / cold outreach — sorolj fel mindent."
                name="q3"
                rows={2}
                required
                minLength={10}
              />

              <FormTextarea
                label="4. Mi az első érintkezésed lépése egy új érdeklődővel? Részletesen."
                hint="Mit teszel pontosan amikor megkeres valaki? Mit mondasz neki először?"
                name="q4"
                rows={5}
                required
                minLength={30}
              />

              <FormTextarea
                label="5. Mennyi időbe telik átlagosan az első érdemi válaszadás?"
                hint="Pl. 30 perc, 2 óra, 1 nap, 2-3 nap."
                name="q5"
                rows={1}
                required
                minLength={10}
              />

              <FormTextarea
                label="6. Milyen információt gyűjtesz be ajánlatadáshoz, hány körben?"
                hint="Mit kérdezel? Hány e-mail-váltás telik el egy ajánlatig?"
                name="q6"
                rows={4}
                required
                minLength={20}
              />

              <FormTextarea
                label="7. Hogyan dokumentálod a kapcsolatot?"
                hint="CRM / Excel / e-mail-mappa / fej. Konkrétan."
                name="q7"
                rows={2}
                required
                minLength={10}
              />

              <FormTextarea
                label="8. Mit utálsz csinálni a vállalkozásodban a leginkább?"
                hint="Ne szépítsd. Konkrét tevékenység-név."
                name="q8"
                rows={3}
                required
                minLength={30}
              />

              <FormTextarea
                label="9. Mit szeretsz a leginkább benne?"
                hint="Konkrét. Ez fontos a fókusz-megtartáshoz."
                name="q9"
                rows={3}
                required
                minLength={30}
              />

              <FormTextarea
                label="10. Mit néznél automatizálni elsőként, és miért éppen azt?"
                hint="Konkrét folyamat + indoklás."
                name="q10"
                rows={4}
                required
                minLength={30}
              />

              <FormTextarea
                label="11. Hány órát töltesz heti átlagban ismétlődő admin-feladattal?"
                hint="Saccolj. Pl. heti 8 óra."
                name="q11"
                rows={1}
                required
                minLength={10}
              />

              <FormTextarea
                label="12. Komolyság-jelző: a 359 000 Ft Teljes Audit (amibe a 9 900 Ft beszámít) érdekel?"
                hint="Igen / Nem / Talán. 1 mondat válasz elég."
                name="q12"
                rows={2}
                required
                minLength={5}
              />

              <SubmitButton label="Küldöm a 12 választ" />
              <GdprFooter />
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
