import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Kurzusok", robots: { index: false, follow: false } };

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin/courses");
  }
  if (!isAdminEmail(session.user.email)) {
    redirect("/");
  }

  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select("id, slug, title, subtitle, price_huf, published, created_at")
    .order("created_at", { ascending: false });

  async function createCourse(formData: FormData) {
    "use server";
    const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
    const title = String(formData.get("title") ?? "").trim();
    if (!slug || !title) return;
    await supabaseAdmin.from("courses").insert({ slug, title, published: false });
    redirect(`/admin/courses`);
  }

  return (
    <>
      <Header active="/learn" member />
      <main id="main">
        <section className="border-b border-border py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <SectionLabel>Admin · Kurzusok</SectionLabel>
            <h1 className="mt-6 font-display text-4xl tracking-tight md:text-5xl">
              Tartalom <em className="italic em-violet">kezelése</em>
            </h1>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
            <h2 className="font-display text-xl italic">Új kurzus</h2>
            <form action={createCourse} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr_auto]">
              <input
                name="slug"
                required
                pattern="[a-z0-9-]+"
                placeholder="slug (pl. szakmai-leíró-30nap)"
                className="border border-border-strong bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
              />
              <input
                name="title"
                required
                placeholder="Cím"
                className="border border-border-strong bg-background px-4 py-3 font-sans text-base text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Létrehoz →
              </button>
            </form>

            <h2 className="mt-16 font-display text-xl italic">Minden kurzus</h2>
            <div className="mt-6 grid grid-cols-1 border-l border-t border-border-strong">
              {(courses ?? []).map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/courses/${c.id}`}
                  className="hover-arrow group flex items-baseline justify-between gap-4 border-b border-r border-border-strong px-6 py-5 transition-colors hover:bg-surface"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg italic">{c.title}</div>
                    <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                      {c.slug} · {c.price_huf ? `${new Intl.NumberFormat("hu-HU").format(c.price_huf)} Ft` : "—"}
                      {c.published ? null : " · piszkozat"}
                    </div>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft transition-colors group-hover:text-foreground">
                    Szerkesztés <span className="arrow">→</span>
                  </span>
                </Link>
              ))}
              {(!courses || courses.length === 0) && (
                <div className="border-b border-r border-border-strong px-6 py-5 font-sans text-sm text-foreground-soft">
                  Még nincs kurzus.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
