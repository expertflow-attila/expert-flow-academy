import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Köszönöm — ügyfélút audit" };

export default async function AuditThankYou({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; result?: string }>;
}) {
  const params = await searchParams;
  const result = params?.result;

  if (result === "too-early") {
    return (
      <>
        <Header active="" />
        <main id="main">
          <section className="border-b border-border py-24 md:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:px-10">
              <SectionLabel>Másik javaslat</SectionLabel>
              <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
                Most még az <em className="italic em-violet">ingyenes anyag</em> hasznosabb.
              </h1>
              <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
                A válaszaid alapján úgy érzem, hogy a vállalkozásod most még abban a szakaszban van, ahol nem az érdeklődő-kezelés a fő szűk keresztmetszet, hanem a beáramlás. Az audit hívás akkor működik igazán, ha már havi 3+ érdeklődőd van, és érzed, hogy a kezelésüket lehetne tisztábbra rakni.
              </p>
              <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
                Mit javaslok először:
              </p>
              <ul className="mt-6 space-y-4 font-sans text-base leading-relaxed text-foreground-soft">
                <li>
                  <strong className="text-foreground">1. Iratkozz fel a 41 leveles ingyenes hírlevélre</strong> — heti 1-2 e-mail, fél év alatt minden alappillér.
                </li>
                <li>
                  <strong className="text-foreground">2. Ha 2-3 hónap múlva többen találnak meg, foglalj akkor auditot.</strong> Addig én is fejlődöm ezen a vonalon.
                </li>
              </ul>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="https://expertflow.hu/hirlevel"
                  className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
                >
                  Iratkozz fel a hírlevélre <span className="arrow">→</span>
                </a>
                <a
                  href="/lead-magnet/ai-mukodesi-terkep"
                  className="hover-arrow group inline-block border border-border-strong px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:border-foreground"
                >
                  Vagy: AI-működési térkép <span className="arrow">→</span>
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // qualified — ide csak elvi módon érhet, mert a kvalifikáltakat egyenesen
  // a Cal.com URL-re irányítjuk. De ha mégis ide kerülne (pl. Cal.com leállás),
  // adunk egy fallback üzenetet.
  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Naptár nyitva</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Köszi a <em className="italic em-violet">3 választ</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              A következő lépés: foglalj egy 20 perces időpontot a naptáramban.
            </p>
            <div className="mt-10">
              <a
                href={process.env.CAL_AUDIT_URL ?? "https://cal.com/attila-nagy-8uefco/ugyfelut-audit"}
                className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Naptár <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
