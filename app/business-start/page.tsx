import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const metadata: Metadata = {
  title: "Business Start — 7 napos ingyenes mini-kurzus",
  description:
    "Hét nap, hét fázis — naponta egy lépéssel felépíted az első működő, automatizált online vállalkozásod, AI-val. Add meg az emailed, és kezdj bele ma.",
};

// A magic-link belépés UTÁN ide tér vissza, ami beiratkoztat az ingyenes kurzusra.
const ENROLL_CALLBACK = "/api/enroll?course=business-start";

const days = [
  { no: "01", title: "Tiszta alapok", r: "Vállalkozói gondolkodás, célcsoport, egymondatos ajánlat." },
  { no: "02", title: "Digitális jelenlét", r: "Domain, üzleti email, Google ökoszisztéma." },
  { no: "03", title: "Weboldal", r: "Landing oldal AI-val, élesítés, alap SEO." },
  { no: "04", title: "AI eszköztár", r: "Fejlesztői környezet és Claude mint üzleti társ." },
  { no: "05", title: "Üzleti rendszerek", r: "Email, CRM, automata időpontfoglalás." },
  { no: "06", title: "Automatizálás", r: "Az első 3 folyamat, ami magától fut." },
  { no: "07", title: "Indulás", r: "Tesztelés, élesítés, első ügyfelek, heti rutin." },
];

export default async function BusinessStartEnroll({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  async function emailSignIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) return;

    // Rate limit: 5 / 10 perc IP-nként + 3 / 10 perc email-enként (mint a /login)
    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const ipCheck = await checkRateLimit(`ip:${ip}`, 5, 10 * 60);
    const emailCheck = await checkRateLimit(`email:${email}`, 3, 10 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/business-start?error=too-many");
    }

    await signIn("nodemailer", { email, redirectTo: ENROLL_CALLBACK });
  }

  return (
    <>
      <Header active="/business-start" />
      <main id="main">
        {/* ───── HERO + email form ───── */}
        <section className="border-b border-border py-20 md:py-28">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Ingyenes mini-kurzus</SectionLabel>
            <h1 className="mt-8 font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl">
              <em className="italic em-rose">7 nap</em> alatt a teljes online vállalkozásod
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-foreground-soft md:text-lg">
              Naponta egy fázis — a hét végén kész, működő, automatizált rendszered van. Add meg az
              emailed, és küldünk egy belépési linket. Nincs jelszó, nincs ár.
            </p>

            {error === "too-many" && (
              <div className="mx-auto mt-8 max-w-md border border-[var(--color-accent-rose)] bg-surface px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-accent-rose)]">
                Túl sok próbálkozás. Próbáld meg újra 10 perc múlva.
              </div>
            )}

            <form action={emailSignIn} className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="te@vallalkozasod.hu"
                className="w-full border border-border-strong bg-background px-4 py-4 font-sans text-base text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="hover-arrow group shrink-0 border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Kezdés <span className="arrow">→</span>
              </button>
            </form>
            <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-foreground-muted">
              A belépési link 10 percig érvényes · bármikor leiratkozhatsz
            </p>
          </div>
        </section>

        {/* ───── 7 nap áttekintés ───── */}
        <section className="border-b border-border py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Mit építesz fel</SectionLabel>
            <div className="mt-10 space-y-px border border-border-strong">
              {days.map((d) => (
                <div key={d.no} className="flex gap-5 p-5 lg:p-6">
                  <div className="shrink-0 pt-1 font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
                    {d.no}
                  </div>
                  <div>
                    <h3 className="font-display text-xl italic md:text-2xl">{d.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-soft">{d.r}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
