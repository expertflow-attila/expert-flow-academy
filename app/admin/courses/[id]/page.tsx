import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Kurzus szerkesztés", robots: { index: false, follow: false } };

type Params = { id: string };

export default async function AdminCourseEdit({ params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login?callbackUrl=/admin/courses");
  if (!isAdminEmail(session.user.email)) redirect("/");

  const { id } = await params;
  const { data: course } = await supabaseAdmin
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!course) notFound();

  const { data: modules } = await supabaseAdmin
    .from("course_modules")
    .select("id, position, title, description")
    .eq("course_id", id)
    .order("position");

  const moduleIds = (modules ?? []).map((m) => m.id);
  const { data: lessons } = moduleIds.length
    ? await supabaseAdmin
        .from("course_lessons")
        .select("id, module_id, position, title, is_preview, cloudflare_stream_uid")
        .in("module_id", moduleIds)
        .order("position")
    : { data: [] };

  async function updateCourse(formData: FormData) {
    "use server";
    const adminSession = await auth();
    if (!adminSession?.user?.email || !isAdminEmail(adminSession.user.email)) {
      throw new Error("Admin szükséges");
    }
    const patch = {
      title: String(formData.get("title") ?? "").trim(),
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      cover_image_url: String(formData.get("cover_image_url") ?? "").trim() || null,
      price_huf: formData.get("price_huf") ? Number(formData.get("price_huf")) : null,
      stripe_price_id: String(formData.get("stripe_price_id") ?? "").trim() || null,
      published: formData.get("published") === "on",
    };
    await supabaseAdmin.from("courses").update(patch).eq("id", id);
    redirect(`/admin/courses/${id}`);
  }

  async function addModule(formData: FormData) {
    "use server";
    const adminSession = await auth();
    if (!adminSession?.user?.email || !isAdminEmail(adminSession.user.email)) {
      throw new Error("Admin szükséges");
    }
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    const { data: maxRow } = await supabaseAdmin
      .from("course_modules")
      .select("position")
      .eq("course_id", id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPos = ((maxRow?.position as number | undefined) ?? 0) + 1;
    await supabaseAdmin.from("course_modules").insert({
      course_id: id,
      position: nextPos,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
    });
    redirect(`/admin/courses/${id}`);
  }

  async function addLesson(formData: FormData) {
    "use server";
    const adminSession = await auth();
    if (!adminSession?.user?.email || !isAdminEmail(adminSession.user.email)) {
      throw new Error("Admin szükséges");
    }
    const moduleId = String(formData.get("module_id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    if (!moduleId || !title) return;
    const { data: maxRow } = await supabaseAdmin
      .from("course_lessons")
      .select("position")
      .eq("module_id", moduleId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPos = ((maxRow?.position as number | undefined) ?? 0) + 1;
    await supabaseAdmin.from("course_lessons").insert({
      module_id: moduleId,
      position: nextPos,
      title,
      body_html: String(formData.get("body_html") ?? "").trim() || null,
      cloudflare_stream_uid: String(formData.get("cloudflare_stream_uid") ?? "").trim() || null,
      is_preview: formData.get("is_preview") === "on",
    });
    redirect(`/admin/courses/${id}`);
  }

  return (
    <>
      <Header active="/learn" member />
      <main id="main">
        <section className="border-b border-border py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <Link href="/admin/courses" className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft hover:text-foreground">
              ← Vissza
            </Link>
            <SectionLabel>Admin · {course.slug}</SectionLabel>
            <h1 className="mt-4 font-display text-3xl italic tracking-tight md:text-4xl">{course.title}</h1>
          </div>
        </section>

        {/* Course meta form */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
            <h2 className="font-display text-xl italic">Kurzus adatok</h2>
            <form action={updateCourse} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Cím" name="title" defaultValue={course.title ?? ""} />
              <Field label="Alcím" name="subtitle" defaultValue={course.subtitle ?? ""} />
              <Field label="Ár (HUF)" name="price_huf" type="number" defaultValue={course.price_huf ?? ""} />
              <Field label="Stripe price_id" name="stripe_price_id" defaultValue={course.stripe_price_id ?? ""} />
              <Field label="Cover image URL" name="cover_image_url" defaultValue={course.cover_image_url ?? ""} className="md:col-span-2" />
              <FieldArea label="Description (HTML, sanitized)" name="description" defaultValue={course.description ?? ""} className="md:col-span-2" />
              <label className="flex items-center gap-3 md:col-span-2">
                <input type="checkbox" name="published" defaultChecked={course.published} className="size-4" />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft">Published</span>
              </label>
              <div className="md:col-span-2">
                <button type="submit" className="border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground">
                  Mentés →
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Modules + lessons */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
            <h2 className="font-display text-xl italic">Modulok és leckék</h2>
            <ol className="mt-6 space-y-6">
              {(modules ?? []).map((m) => {
                const moduleLessons = (lessons ?? []).filter((l) => l.module_id === m.id);
                return (
                  <li key={m.id} className="border border-border-strong p-5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-display text-lg italic">{m.position}. {m.title}</h3>
                      <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
                        {moduleLessons.length} lecke
                      </span>
                    </div>
                    {m.description && (
                      <p className="mt-2 font-sans text-sm text-foreground-soft">{m.description}</p>
                    )}
                    <ol className="mt-4 space-y-2">
                      {moduleLessons.map((l) => (
                        <li key={l.id} className="flex items-baseline gap-3 font-sans text-sm text-foreground-soft">
                          <span className="font-mono text-[0.6rem] text-foreground-muted">{String(l.position).padStart(2, "0")}</span>
                          <span className="flex-1">{l.title}</span>
                          {l.is_preview && <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-[var(--color-accent-sky)]">preview</span>}
                          {l.cloudflare_stream_uid && <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-[var(--color-accent-mint)]">video</span>}
                        </li>
                      ))}
                    </ol>
                    <details className="mt-4 group">
                      <summary className="cursor-pointer font-mono text-[0.6rem] uppercase tracking-[0.22em] text-foreground-soft hover:text-foreground">+ új lecke</summary>
                      <form action={addLesson} className="mt-4 grid grid-cols-1 gap-3">
                        <input type="hidden" name="module_id" value={m.id} />
                        <Field label="Cím" name="title" />
                        <Field label="Cloudflare Stream UID (opcionális)" name="cloudflare_stream_uid" />
                        <FieldArea label="body_html" name="body_html" />
                        <label className="flex items-center gap-3">
                          <input type="checkbox" name="is_preview" className="size-4" />
                          <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft">Preview (ingyenes minta)</span>
                        </label>
                        <button type="submit" className="self-start border border-foreground-soft px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft transition-colors hover:bg-foreground hover:text-background">
                          Hozzáad →
                        </button>
                      </form>
                    </details>
                  </li>
                );
              })}
            </ol>

            <details className="mt-8">
              <summary className="cursor-pointer font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft hover:text-foreground">+ új modul</summary>
              <form action={addModule} className="mt-4 grid grid-cols-1 gap-3 max-w-lg">
                <Field label="Cím" name="title" />
                <FieldArea label="Leírás" name="description" />
                <button type="submit" className="self-start border border-foreground bg-foreground px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground">
                  Modul hozzáadása →
                </button>
              </form>
            </details>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label, name, type = "text", defaultValue = "", className = "",
}: { label: string; name: string; type?: string; defaultValue?: string | number; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-foreground-muted">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full border border-border-strong bg-background px-3 py-2 font-sans text-sm text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

function FieldArea({
  label, name, defaultValue = "", className = "",
}: { label: string; name: string; defaultValue?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-foreground-muted">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        className="mt-1 w-full border border-border-strong bg-background px-3 py-2 font-sans text-sm text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
      />
    </label>
  );
}
