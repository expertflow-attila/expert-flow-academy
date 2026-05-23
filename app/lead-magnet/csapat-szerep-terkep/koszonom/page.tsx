import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Köszönöm — térkép készül" };

export default async function TeamRolesThankYou({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params?.id;

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
            <SectionLabel>Megkaptam</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Köszi a <em className="italic em-violet">3 választ</em>.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              24 órán belül megkapod a csapat-szerep térképet e-mailben. Először az AI rakja össze a vázlatot a 3 válaszotok alapján, aztán én átolvasom és kiküldöm.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Ha 24 óra múlva sem érkezett meg, nézd meg a spam mappát is. Ha ott sincs, írj nekem a hello@solobusiness.hu-ra.
            </p>

            {id && (
              <p className="mt-12 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">
                Submission id: {id.slice(0, 8)}
              </p>
            )}
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Amíg vártok</SectionLabel>
            <h2 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
              Ha a térkép után közös rendszer is kell, a <em className="italic em-sky">199k mini-sprint</em> erre épül.
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-foreground-soft">
              Egy közös ülésen — Te + a csapat 1-2 tagja + én — felépítünk egy konkrét rendszert a térkép alapján. NEM tréning, NEM workshop: konkrét megegyezés és 1 első közös rendszer. Akkor jöjjön szóba, ha a térképet elolvasva érzitek, hogy nem csak tisztázás, hanem közös eszköz/rendszer is kell.
            </p>
            <div className="mt-10">
              <a
                href="/courses/build-in-public-30nap"
                className="hover-arrow group inline-block border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Nézd meg az Akadémiát <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
