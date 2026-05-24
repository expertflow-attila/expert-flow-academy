import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const metadata = {
  title: "Első AI-folyamatvázlat 48 órán belül — Expert Flow",
  description:
    "Küldd el, hogyan kezelsz ma egy új érdeklődőt. 48 óra alatt visszaküldök egy 1 oldalas vizuális vázlatot arról, hogyan rakható ez össze AI-jal.",
};

const WEEKLY_CAP = 10;

export default async function LeadMagnetSketchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  // Heti kapacitás check — hány vázlatot fogadtam el ezen a héten
  const sinceMonday = mondayMidnightISO();
  const { count } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id", { count: "exact", head: true })
    .eq("lead_magnet_slug", "ai-folyamatvazlat-48h")
    .gte("created_at", sinceMonday);

  const weeklyTaken = count ?? 0;
  const weeklyRemaining = Math.max(0, WEEKLY_CAP - weeklyTaken);
  const capReached = weeklyRemaining === 0;

  async function submitSketch(formData: FormData) {
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

    if (!name || name.length < 2) redirect("/lead-magnet/ai-folyamatvazlat-48h?error=name");
    if (!email || !email.includes("@")) redirect("/lead-magnet/ai-folyamatvazlat-48h?error=email");

    const answers = [q1, q2, q3, q4, q5, q6];
    if (answers.some((a) => a.length < 30)) {
      redirect("/lead-magnet/ai-folyamatvazlat-48h?error=short");
    }

    // Recheck heti cap (race condition védelem)
    const sinceMondayInner = mondayMidnightISO();
    const { count: capCount } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .select("id", { count: "exact", head: true })
      .eq("lead_magnet_slug", "ai-folyamatvazlat-48h")
      .gte("created_at", sinceMondayInner);
    if ((capCount ?? 0) >= WEEKLY_CAP) {
      redirect("/lead-magnet/ai-folyamatvazlat-48h?error=full");
    }

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 3, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 2, 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/lead-magnet/ai-folyamatvazlat-48h?error=too-many");
    }

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "ai-folyamatvazlat-48h",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: shareAnonymized,
        payload: { q1, q2, q3, q4, q5, q6 },
        attila_review_status: "pending",
        client_ip: ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/ai-folyamatvazlat-48h] insert error", dbErr);
      redirect("/lead-magnet/ai-folyamatvazlat-48h?error=server");
    }

    redirect(`/lead-magnet/ai-folyamatvazlat-48h/koszonom?id=${data.id}`);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Lead Magnet · 5 perc</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Első AI-<em className="italic em-sky">folyamatvázlat</em>
            </h1>
            <p className="mt-3 font-display text-3xl italic tracking-tight text-foreground-soft md:text-4xl">
              48 órán belül
            </p>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Küldd el, hogyan zajlik ma nálad egy új érdeklődő érkezése — és 48 órán belül visszaküldök egy 1 oldalas vizuális folyamatvázlatot arról, hogyan rakható ez össze AI-jal. Anélkül, hogy meg kéne tanulnod az eszközöket.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Nem elméleti tananyag. Próba abból, milyen velem dolgozni.
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ 6 kérdés, kb. 5 perc kitöltés</li>
              <li>→ 48 órán belül megkapod e-mailben — vizuális vázlat + magyarázó szöveg</li>
              <li>→ Kézzel finomítva, NEM tisztán AI-generált</li>
              <li>→ Akkor is megkapod, ha utána nem iratkozol fel</li>
              <li>→ Heti maximum {WEEKLY_CAP} vázlat — kapacitás miatt</li>
            </ul>

            <div className="mt-12 inline-block border border-border-strong bg-surface px-5 py-4">
              <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">
                Ezen a héten még
              </div>
              <div className="mt-2 font-display text-3xl italic em-sky">
                {weeklyRemaining}{" "}
                <span className="text-foreground-soft not-italic">/ {WEEKLY_CAP}</span>{" "}
                <span className="font-sans text-base not-italic text-foreground-muted">hely</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form vagy "betelt" üzenet */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>{capReached ? "A heti kapacitás betelt" : "Add meg a 6 választ"}</SectionLabel>

            {capReached ? (
              <div className="mt-10 space-y-6">
                <h2 className="font-display text-3xl tracking-tight md:text-4xl">
                  Hétfőn újra <em className="italic em-sky">nyitnak</em> a helyek.
                </h2>
                <p className="font-sans text-base leading-relaxed text-foreground-soft">
                  Heti {WEEKLY_CAP} vázlatot csinálok, egyenként kézzel — most erre a hétre betelt. Hétfő reggel ismét lesz {WEEKLY_CAP} hely. Addig is, ha érdekel:
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <a
                    href="/lead-magnet/ai-mukodesi-terkep"
                    className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                  >
                    Helyette: AI-működési térkép <span className="arrow">→</span>
                  </a>
                  <a
                    href="/courses/expert-flow-akademia"
                    className="hover-arrow group inline-block border border-border-strong px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:border-foreground"
                  >
                    Akadémia kurzus <span className="arrow">→</span>
                  </a>
                </div>
              </div>
            ) : (
              <>
                {error === "name" && <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>}
                {error === "email" && <ErrorBox>Add meg az e-mail címed.</ErrorBox>}
                {error === "short" && (
                  <ErrorBox>Mindegyik válasz legalább 30 karakter legyen. 1-2 mondat is elég, csak konkrét legyen.</ErrorBox>
                )}
                {error === "too-many" && (
                  <ErrorBox>Túl sok kitöltés. Próbáld meg 1 óra múlva.</ErrorBox>
                )}
                {error === "full" && (
                  <ErrorBox>A heti kapacitás épp most telt be. Hétfő reggel újra nyitnak a helyek.</ErrorBox>
                )}
                {error === "server" && (
                  <ErrorBox>Szerver hiba — próbáld újra. Ha továbbra is, írj a hello@expertflow.hu-ra.</ErrorBox>
                )}

                <form action={submitSketch} className="mt-10 space-y-8">
                  <FormField label="Mi a neved?" name="name" type="text" autoComplete="name" required minLength={2} />
                  <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

                  <FormTextarea
                    label="1. kérdés — Az érkezés"
                    hint="Honnan érkezik hozzád egy új érdeklődő? (Honlap-űrlap, e-mail, telefon, ajánlás, Instagram DM, máshonnan.)"
                    name="q1"
                    rows={3}
                    required
                    minLength={30}
                  />
                  <FormTextarea
                    label="2. kérdés — Az első reakció"
                    hint="Mi az első dolog, amit csinálsz, amikor megkapod a megkeresést?"
                    name="q2"
                    rows={3}
                    required
                    minLength={30}
                  />
                  <FormTextarea
                    label="3. kérdés — A válaszidő"
                    hint="Mennyi idő telik el az első megkeresés és a tényleges első érdemi válaszod között? (Becslés elég.)"
                    name="q3"
                    rows={2}
                    required
                    minLength={30}
                  />
                  <FormTextarea
                    label="4. kérdés — A minősítés"
                    hint="Milyen információt kérsz be az érdeklődőtől ahhoz, hogy ajánlatot tudj adni? Hány körben?"
                    name="q4"
                    rows={3}
                    required
                    minLength={30}
                  />
                  <FormTextarea
                    label="5. kérdés — A nyomon követés"
                    hint="Hogyan követed nyomon, kinek meddig jutottál? (Excel, naptár, fejben, Trello, máshogy.)"
                    name="q5"
                    rows={3}
                    required
                    minLength={30}
                  />
                  <FormTextarea
                    label="6. kérdés — A fájdalompont"
                    hint="Ha egyetlen részét tudnád kivenni a kezedből ebben a folyamatban, melyik lenne és miért?"
                    name="q6"
                    rows={3}
                    required
                    minLength={30}
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
                        Iratkozz fel a 41 leveles ingyenes Expert Flow hírlevélre — heti 1-2 e-mail. Bármikor leiratkozhatsz.
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
                        A vázlatodból anonimizálva tanulhatok és megoszthatok mintázatokat a Skool közösségben. Nincs név vagy e-mail az anyagban.
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
                    Az adataidat a vázlat elkészülte UTÁN azonnal töröljük. Anonimizált tanulság megmarad a saját jegyzeteinkben.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>

        {/* Hitelességi blokk */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Hitelesség</SectionLabel>
            <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              Az első hetekben <em className="italic em-sky">semmit</em> nem építettem.
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              Csak vázlatokat rajzoltam. Az Expert Flow módszertanban ezzel a vállalkozással. Az általam készített vázlatok egy részét (név és személyes adat nélkül) megosztom a Skool közösségben és a hírlevélben. Így az általad kapott válasz nem zsákutca — másoknak is segít látni, mi a hatása.
            </p>
          </div>
        </section>

        {/* Anti-guru blokk */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Mit NEM ígérek</SectionLabel>
            <ul className="mt-8 space-y-4 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Nem ígérek &bdquo;kulcsrakész rendszert&rdquo; 48 óra alatt</li>
              <li>— Nem ígérek 10x hatékonyság-növekedést</li>
              <li>— Nem ígérek &bdquo;összeépítjük helyetted&rdquo; csomagot — az az Akadémia, és ott is veled együtt csináljuk</li>
              <li>
                Csak azt ígérem, hogy a vázlat 1 oldalban összesűríti azt, amire egyébként hetekig keresgélnél választ.
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
