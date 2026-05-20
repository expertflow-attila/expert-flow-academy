import Link from "next/link";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { auth } from "@/lib/auth";

export const metadata = { title: "Köszönöm" };

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params?.session_id;
  const userSession = await auth();

  return (
    <>
      <Header active="/learn" member={Boolean(userSession?.user)} />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Sikeres vásárlás</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              <em className="italic em-sky">Köszönöm</em>
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              A hozzáférésed aktiválódott. Küldtünk egy belépési linket arra az emailre, amellyel
              vásároltál. Kattints rá és máris belépsz a kurzusba.
            </p>
            {sessionId && (
              <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-foreground-muted">
                Tranzakció: {sessionId}
              </p>
            )}
            <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/learn"
                className="hover-arrow group border border-foreground bg-foreground px-8 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Saját tartalom megnyitása <span className="arrow">→</span>
              </Link>
              <Link
                href="/login"
                className="hover-arrow group font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground"
              >
                Belépés ha még nem vagy bent <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
