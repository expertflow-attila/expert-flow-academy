import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { safeInternalPath } from "@/lib/url-safety";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { AutoSubmit } from "@/components/auto-submit";

export const metadata = { title: "Belépés" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; email?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = safeInternalPath(params?.callbackUrl, "/learn");
  const error = params?.error;
  // Előtöltött email (pl. business-start landingről átirányítva) — csak ha
  // hibátlan és nincs hiba-állapot, hogy az auto-submit ne pörögjön körbe.
  const rawEmail = (params?.email ?? "").toString().trim().toLowerCase();
  const prefillEmail = !error && rawEmail.includes("@") ? rawEmail : "";

  async function emailSignIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    const target = safeInternalPath(formData.get("callbackUrl"), "/learn");

    // Rate limit: 5 próbálkozás / 10 perc IP-nként + 3 / 10 perc email-enként
    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const ipCheck = await checkRateLimit(`ip:${ip}`, 5, 10 * 60);
    const emailCheck = await checkRateLimit(`email:${email}`, 3, 10 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/login?error=too-many");
    }

    await signIn("nodemailer", { email, redirectTo: target });
  }

  return (
    <>
      <Header active="/login" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-md px-6 lg:px-10">
            <SectionLabel>Belépés</SectionLabel>
            <h1 className="mt-6 font-display text-4xl tracking-tight md:text-5xl">
              Add meg az <em className="italic em-sky">emailed</em>
            </h1>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
              Küldünk egy belépési linket. Nincs jelszó. A link 10 percig érvényes.
            </p>

            {error === "too-many" && (
              <div className="mt-8 border border-[var(--color-accent-rose)] bg-surface px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-accent-rose)]">
                Túl sok próbálkozás. Próbáld meg újra 10 perc múlva.
              </div>
            )}

            <form id="login-form" action={emailSignIn} className="mt-10 space-y-5">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                defaultValue={prefillEmail}
                placeholder="te@vallalkozasod.hu"
                className="w-full border border-border-strong bg-background px-4 py-4 font-sans text-base text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="hover-arrow group w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Belépési link kérése <span className="arrow">→</span>
              </button>
            </form>
            {prefillEmail && <AutoSubmit formId="login-form" />}

            <p className="mt-8 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
              Még nincs hozzáférésed? Nézd meg a{" "}
              <a href="/courses" className="underline transition-colors hover:text-foreground">
                kurzusokat
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
