import Link from "next/link";

export const CTA_URL = "https://cal.com/attila-nagy-8uefco/30min";
export const YOUTUBE_URL = "https://www.youtube.com/@nagyattilaferenc";
export const GITHUB_URL = "https://github.com/expertflow-attila";

type Page = { href: string; label: string; sub: string };

const pages: Page[] = [
  { href: "/", label: "Áttekintés", sub: "Index" },
  { href: "/courses", label: "Kurzusok", sub: "Tartalom" },
  { href: "/learn", label: "Saját tartalom", sub: "Tagoknak" },
  { href: "/login", label: "Belépés", sub: "Email + kód" },
];

export function Header({ active, member }: { active: string; member?: boolean }) {
  return (
    <header className="border-b border-border-strong">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        <div className="flex items-center border-b border-r border-border-strong px-6 py-7 lg:px-10 md:border-b-0">
          <Link
            href="/"
            aria-label="Expert Flow Akadémia — főoldal"
            className="font-display text-2xl italic tracking-tight"
          >
            Expert Flow
          </Link>
        </div>

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

        <Link
          href="/courses"
          className="flex items-center border-r border-border-strong px-6 py-7 transition-colors hover:bg-surface lg:px-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground">
            Kurzusok ↗
          </span>
        </Link>

        <Link
          href={member ? "/learn" : "/login"}
          className="flex items-center px-6 py-7 transition-colors hover:bg-surface lg:px-10"
        >
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:text-foreground">
            {member ? "Saját tartalom ↗" : "Belépés ↗"}
          </span>
        </Link>
      </div>

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
        <div className="font-mono">Expert Flow · Akadémia</div>
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
