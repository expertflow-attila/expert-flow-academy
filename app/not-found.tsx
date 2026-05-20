import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "404 — Az oldal nem található",
  description: "Az oldal amit kerestél nem létezik. Térj vissza a főoldalra vagy nézd meg a kurzusokat.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header active="/" />
      <main id="main">
        <section className="border-b border-border py-20 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <SectionLabel>404</SectionLabel>
            <h1 className="mt-8 font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl">
              Ez az oldal <em className="italic text-[var(--color-accent-rose)]">eltévedt</em>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-foreground-soft leading-relaxed">
              Lehet hogy elgépelted az URL-t. Az alábbiakból folytasd:
            </p>
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/"
                className="border border-border-strong px-6 py-5 text-left transition-colors hover:bg-surface"
              >
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-foreground-muted">
                  Főoldal
                </div>
                <div className="mt-2 font-display text-lg italic">Áttekintés</div>
              </Link>
              <Link
                href="/courses"
                className="border border-border-strong px-6 py-5 text-left transition-colors hover:bg-surface"
              >
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-foreground-muted">
                  Kurzusok
                </div>
                <div className="mt-2 font-display text-lg italic">Tartalom</div>
              </Link>
              <Link
                href="/learn"
                className="border border-border-strong px-6 py-5 text-left transition-colors hover:bg-surface"
              >
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-foreground-muted">
                  Saját tartalom
                </div>
                <div className="mt-2 font-display text-lg italic">Tagoknak</div>
              </Link>
              <Link
                href="/login"
                className="border border-border-strong px-6 py-5 text-left transition-colors hover:bg-surface"
              >
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-foreground-muted">
                  Belépés
                </div>
                <div className="mt-2 font-display text-lg italic">Email + kód</div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
