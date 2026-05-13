import Link from "next/link";

export const CTA_URL = "https://cal.com/attila-nagy-8uefco/30min";
export const YOUTUBE_URL = "https://www.youtube.com/@nagyattilaferenc";
export const GITHUB_URL = "https://github.com/expertflow-attila";

type Page = { href: string; label: string; sub: string };

const pages: Page[] = [
  { href: "/", label: "Áttekintés", sub: "Index" },
  { href: "/szolgaltatas", label: "Szolgáltatás", sub: "Három pillér" },
  { href: "/araink", label: "Áraink", sub: "Havi retainer" },
  { href: "/rolam", label: "Rólam", sub: "Build-in-public" },
];

export function Header({ active }: { active: string }) {
  return (
    <header className="border-b border-border-strong">
      {/* Top row — 4-cell grid (ExpertFlow / Konzultáció / GitHub / Közösség) */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {/* Logo cell */}
        <div className="flex items-center border-b border-r border-border-strong px-6 py-7 lg:px-10 md:border-b-0">
          <Link
            href="/"
            aria-label="Expert Flow — főoldal"
            className="font-display text-2xl italic tracking-tight"
          >
            ExpertFlow
          </Link>
        </div>

        {/* Konzultáció cell */}
        <Link
          href={CTA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center border-b border-border-strong px-6 py-7 transition-colors hover:bg-surface lg:px-10 md:border-b-0 md:border-r"
        >
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground">
            Konzultáció ↗
          </span>
        </Link>

        {/* GitHub cell */}
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center border-r border-border-strong px-6 py-7 transition-colors hover:bg-surface lg:px-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground">
            GitHub ↗
          </span>
        </Link>

        {/* Közösség cell */}
        <div className="flex items-center justify-between gap-4 px-6 py-7 lg:px-10">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-muted">
            Közösség
          </span>
          <div className="flex items-center gap-3">
            <Link
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-foreground-soft transition-colors hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
              </svg>
            </Link>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-foreground-soft transition-colors hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Sub-nav — pages, with short active indicator line above active cell */}
      <nav aria-label="Oldalak" className="border-t border-border-strong">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {pages.map((p, i) => {
            const isActive = active === p.href;
            return (
              <Link
                key={p.href}
                href={p.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative border-border-strong px-6 py-6 transition-colors hover:bg-surface lg:px-10 ${
                  i < pages.length - 1 ? "md:border-r" : ""
                } ${i % 2 === 0 ? "border-r md:border-r" : ""}`}
              >
                {/* Active indicator — short colored line above */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-px h-px bg-[var(--color-accent-violet)]"
                  />
                )}
                <div
                  className={`font-mono text-xs uppercase tracking-[0.22em] ${
                    isActive ? "text-foreground" : "text-foreground-soft"
                  }`}
                >
                  {p.label}
                </div>
                <div className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                  {p.sub}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 text-xs uppercase tracking-[0.22em] text-foreground-muted md:flex-row md:items-center lg:px-10">
        <div className="font-mono">
          <span>Expert Flow</span>
          <span className="mx-3 text-foreground-dim">·</span>
          <span>v0.1.0</span>
        </div>
        <Link
          href="https://expertflow.hu"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono transition-colors hover:text-foreground"
        >
          expertflow.hu ↗
        </Link>
        <div className="font-mono">© 2026 · Nagy Attila e.v.</div>
      </div>
    </footer>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted">
      {children}
    </p>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl italic tracking-tight md:text-3xl">
      {children}
    </h2>
  );
}

export function CodeBlock({ step, code, copyLabel = "Másol" }: { step: string; code: string; copyLabel?: string }) {
  return (
    <div className="border border-border-strong">
      <div className="flex items-center justify-between border-b border-border-strong bg-surface px-4 py-2.5">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-foreground-muted">
          {step}
        </span>
        <button
          type="button"
          className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-foreground-soft transition-colors hover:text-foreground"
        >
          {copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto bg-background px-4 py-3">
        <code className="font-mono text-sm text-foreground">{code}</code>
      </pre>
    </div>
  );
}
