import { signIn } from "@/lib/auth";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { safeInternalPath } from "@/lib/url-safety";

export const metadata = { title: "Belépés" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = safeInternalPath(params?.callbackUrl, "/learn");

  async function emailSignIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return;
    const target = safeInternalPath(formData.get("callbackUrl"), "/learn");
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

            <form action={emailSignIn} className="mt-10 space-y-5">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
                className="hover-arrow group w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Belépési link kérése <span className="arrow">→</span>
              </button>
            </form>

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
