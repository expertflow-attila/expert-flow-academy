import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const metadata = {
  title: "Csapat-szerep térkép — Solo Business",
  description:
    "Mini-csapat (2-3 fő)? Töltsd ki 3 kérdést, és 24 órán belül visszaküldök egy térképet a 3 szerep-konfliktusotokról és arról az 1 tisztázásról, amit először érdemes elindítani.",
};

export default async function LeadMagnetTeamRolesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  async function submitTeamRoles(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const teamSize = String(formData.get("team_size") ?? "").trim();
    const q1 = String(formData.get("q1") ?? "").trim();
    const q2 = String(formData.get("q2") ?? "").trim();
    const q3 = String(formData.get("q3") ?? "").trim();
    const marketingConsent = formData.get("marketing_consent") === "on";
    const shareAnonymized = formData.get("share_anonymized") !== "off";

    if (!name || name.length < 2) redirect("/lead-magnet/csapat-szerep-terkep?error=name");
    if (!email || !email.includes("@")) redirect("/lead-magnet/csapat-szerep-terkep?error=email");
    if (!teamSize || !["2", "3"].includes(teamSize)) {
      redirect("/lead-magnet/csapat-szerep-terkep?error=team-size");
    }
    if (q1.length < 20 || q2.length < 20 || q3.length < 20) {
      redirect("/lead-magnet/csapat-szerep-terkep?error=short");
    }

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 3, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 2, 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/lead-magnet/csapat-szerep-terkep?error=too-many");
    }

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "csapat-szerep-terkep",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: shareAnonymized,
        payload: { q1, q2, q3, team_size: teamSize, name },
        attila_review_status: "pending",
        client_ip: ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/csapat-szerep-terkep] insert error", dbErr);
      redirect("/lead-magnet/csapat-szerep-terkep?error=server");
    }

    redirect(`/lead-magnet/csapat-szerep-terkep/koszonom?id=${data.id}`);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Lead Magnet · mini-csapat · 1 perc</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Csapat-szerep <em className="italic em-violet">térkép</em>
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Hárman vagytok? Ketten? 24 órán belül emailben elküldök egy térképet a 3 szerep-konfliktusotokról — és arról az 1 dologról, amit először érdemes közösen tisztázni.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Nem szervezeti ábra. Nem &bdquo;menedzsment-bevezető&rdquo;. 3 kérdés, kb. 1 perc, és kaptok egy 3-4 oldalas térképet rólatok.
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ 3 kérdés, kb. 1 perc kitöltés</li>
              <li>→ 24 órán belül megkapod e-mailben</li>
              <li>→ Személyre szabott — a 3 válaszotokra épül, nem általános</li>
              <li>→ Akkor is megkapod, ha utána nem iratkozol fel</li>
              <li>→ Nem fog rád zúdulni ajánlatkérő hívás</li>
            </ul>
          </div>
        </section>

        {/* Form */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Add meg a 3 választ</SectionLabel>

            {error === "name" && <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>}
            {error === "email" && <ErrorBox>Add meg az e-mail címed.</ErrorBox>}
            {error === "team-size" && <ErrorBox>Válaszd ki: 2 vagy 3 fős a csapat.</ErrorBox>}
            {error === "short" && (
              <ErrorBox>Mindegyik válasz legalább 20 karakter legyen. Egy mondat is elég, de értelmes mondat.</ErrorBox>
            )}
            {error === "too-many" && (
              <ErrorBox>Túl sok kitöltés ugyanarról az IP-ről / e-mailről. Próbáld meg 1 óra múlva.</ErrorBox>
            )}
            {error === "server" && (
              <ErrorBox>Szerver hiba — pár perc múlva próbáld újra. Ha továbbra is, írj a hello@solobusiness.hu-ra.</ErrorBox>
            )}

            <form action={submitTeamRoles} className="mt-10 space-y-8">
              <FormField label="Mi a neved?" name="name" type="text" autoComplete="name" required minLength={2} />
              <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

              <fieldset>
                <legend className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
                  Hány főből áll a csapat?
                </legend>
                <p className="mt-2 font-sans text-sm leading-relaxed text-foreground-muted">
                  Beleszámolva mindenkit: alapítók, alkalmazottak, fix alvállalkozók.
                </p>
                <div className="mt-3 flex gap-3">
                  <label className="flex flex-1 cursor-pointer items-center gap-3 border border-border-strong px-4 py-3">
                    <input type="radio" name="team_size" value="2" required />
                    <span className="font-sans text-base">2 fő</span>
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center gap-3 border border-border-strong px-4 py-3">
                    <input type="radio" name="team_size" value="3" required />
                    <span className="font-sans text-base">3 fő</span>
                  </label>
                </div>
              </fieldset>

              <FormTextarea
                label="1. kérdés"
                hint="Kik vagytok és mit csináltok együtt? Mindenkire 1 mondat: ki ő (szerep) és milyen rendszeres tevékenységet visz (pl. „Anna — operatív, ajánlatkezelés és ügyfél-emailek; Béla — kreatív munka; én — sales és pénzügy)."
                name="q1"
                rows={5}
                required
                minLength={20}
              />

              <FormTextarea
                label="2. kérdés"
                hint="Hol szoktatok elakadni vagy duplikálódni heti szinten? Konkrét friss példa segít — pl. „múlt héten kétszer is válaszoltunk egy ügyfélnek külön, mert nem láttuk egymás email-tárgyát”."
                name="q2"
                rows={5}
                required
                minLength={20}
              />

              <FormTextarea
                label="3. kérdés"
                hint="Melyik szerep vagy felelősség nincs egyértelműen tisztázva köztetek? (Pl. „ki dönti el a végső ajánlati árat”, „ki válaszol a Facebook-üzenetekre”, „ki vezeti a hétfői megbeszélést”.)"
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
                    A térképetekből anonimizálva tanulhatok és megoszthatok mintázatokat. Nincs név vagy e-mail az anyagban. Kikapcsolhatod.
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
                Az adataitokat csak a térkép elkészítéséhez és (ha bejelölted) a hírlevélhez használjuk. 30 napon belül törölhető, írj nekem.
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
              Még nincs fizetős ügyfelem, de van egy működő AI-rendszerem 6 sub-agenttel — én is most rakom össze a saját szerep-térképemet közöttük. A te 2-3 fős csapatodra ugyanezt a kérdés-keretet alkalmazom. Nem szervezetfejlesztő anyag, hanem amit én is végigjárok most.
            </p>
          </div>
        </section>

        {/* Anti-guru blokk */}
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Mit NEM ígérek</SectionLabel>
            <ul className="mt-8 space-y-4 font-sans text-base leading-relaxed text-foreground-soft">
              <li>— Nem ígérek &bdquo;konfliktus-mentes csapatot&rdquo;</li>
              <li>— Nem ígérek HR-átalakítást vagy szervezeti reformot</li>
              <li>— Nem ígérek azt, hogy 1 hét alatt megoldja a feszültségeket</li>
              <li>
                Csak azt ígérem, hogy a 3 válaszotokból kirajzolódik 3 konkrét pont, ahol most duplikálódtok vagy elakadtok — és látsz egy első tisztázást, amit közösen el tudtok indítani.
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
