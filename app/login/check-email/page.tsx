import { Footer, Header, SectionLabel } from "@/components/site-chrome";

export const metadata = { title: "Ellenőrizd az emailed" };

export default function CheckEmailPage() {
  return (
    <>
      <Header active="/login" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-md px-6 text-center lg:px-10">
            <SectionLabel>Email elküldve</SectionLabel>
            <h1 className="mt-6 font-display text-4xl tracking-tight md:text-5xl">
              Ellenőrizd a <em className="italic em-violet">postafiókod</em>
            </h1>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-soft md:text-base">
              Küldtünk egy linket. Kattints rá, és a felület automatikusan beengedi.
              A link 10 percig érvényes — ha lejár, kérj újat.
            </p>
            <p className="mt-10 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
              Nem jött meg? Nézd meg a spam-mappát is.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
