import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminSession } from "@/lib/admin";
import { sendLeadMagnetReport } from "@/lib/lead-magnet-email";
import { enrollNewsletterSubscriber } from "@/lib/mailerlite";

export const metadata = { title: "Admin — Lead magnet részletek" };
export const dynamic = "force-dynamic";

export default async function AdminLeadMagnetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    redirect("/login?next=/admin/lead-magnets");
  }

  const { id } = await params;

  const { data: sub } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!sub) notFound();

  async function approve(formData: FormData) {
    "use server";
    if (!(await isAdminSession())) throw new Error("admin only");

    const edited = String(formData.get("edited_markdown") ?? "").trim();
    const useEdit = formData.get("use_edit") === "on";

    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        attila_review_status: useEdit ? "edited" : "approved",
        attila_edits: useEdit ? edited : null,
        attila_reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Email kiküldés
    const finalMarkdown = useEdit ? edited : (sub!.generated_markdown as string);
    const slug = sub!.lead_magnet_slug as string;

    // A meglévő sendLeadMagnetReport csak LM1+LM2 slug-okat ismer.
    // Új slug-okra ki kell bővíteni — most a generic "ai-mukodesi-terkep" fallback-et használjuk.
    try {
      const result = await sendLeadMagnetReport({
        to: sub!.email as string,
        name: sub!.name as string,
        leadMagnetSlug: (slug === "ai-folyamatvazlat-48h" ? "ai-folyamatvazlat-48h" : "ai-mukodesi-terkep") as
          | "ai-mukodesi-terkep"
          | "ai-folyamatvazlat-48h",
        reportMarkdown: finalMarkdown,
      });

      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({
          delivered_at: new Date().toISOString(),
          delivery_message_id: result.messageId,
          delivery_provider: "smtp",
        })
        .eq("id", id);

      if (sub!.marketing_consent) {
        await enrollNewsletterSubscriber({
          email: sub!.email as string,
          name: sub!.name as string,
          source: `lm-${slug}` as never,
        }).catch((e) => console.error("[admin/lead-magnets] mailerlite enroll failed", e));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({ delivery_error: msg.slice(0, 1000) })
        .eq("id", id);
    }

    redirect(`/admin/lead-magnets/${id}`);
  }

  async function reject(_formData: FormData) {
    "use server";
    if (!(await isAdminSession())) throw new Error("admin only");
    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        attila_review_status: "rejected",
        attila_reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    redirect(`/admin/lead-magnets/${id}`);
  }

  return (
    <>
      <Header active="" />
      <main id="main" className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <SectionLabel>Admin · {sub.lead_magnet_slug}</SectionLabel>
          <h1 className="mt-6 font-display text-3xl tracking-tight">{sub.name} &lt;{sub.email}&gt;</h1>

          <div className="mt-6 grid grid-cols-2 gap-4 font-mono text-xs uppercase tracking-[0.18em] text-foreground-soft">
            <div>Slug: <span className="text-foreground">{sub.lead_magnet_slug}</span></div>
            <div>Status: <span className="text-foreground">{sub.attila_review_status}</span></div>
            <div>Created: <span className="text-foreground">{sub.created_at}</span></div>
            <div>Delivered: <span className="text-foreground">{sub.delivered_at ?? "—"}</span></div>
            {sub.paid_at && <div>Paid: <span className="text-foreground">{sub.paid_at}</span></div>}
            {sub.payment_amount_huf && <div>Amount: <span className="text-foreground">{sub.payment_amount_huf} Ft</span></div>}
            {sub.lead_score !== null && <div>Score: <span className="text-foreground">{sub.lead_score}</span></div>}
            {sub.recommendation && <div>Reco: <span className="text-foreground">{sub.recommendation}</span></div>}
            {sub.giveaway_total_score !== null && (
              <div>Giveaway: <span className="text-foreground">{sub.giveaway_total_score} / {sub.giveaway_category}</span></div>
            )}
          </div>

          <section className="mt-10">
            <h2 className="font-display text-xl">Payload (válaszok)</h2>
            <pre className="mt-3 border border-border bg-surface p-4 text-xs text-foreground-soft overflow-auto">
              {JSON.stringify(sub.payload, null, 2)}
            </pre>
          </section>

          {sub.raw_input_transcript && (
            <section className="mt-10">
              <h2 className="font-display text-xl">Whisper transzkript</h2>
              <pre className="mt-3 max-h-72 overflow-auto border border-border bg-surface p-4 text-xs text-foreground-soft whitespace-pre-wrap">
                {sub.raw_input_transcript}
              </pre>
            </section>
          )}

          {sub.generated_markdown && (
            <section className="mt-10">
              <h2 className="font-display text-xl">AI-generált tervezet</h2>
              <pre className="mt-3 max-h-96 overflow-auto border border-border bg-surface p-4 text-xs text-foreground-soft whitespace-pre-wrap">
                {sub.generated_markdown}
              </pre>
            </section>
          )}

          {sub.attila_review_note && (
            <section className="mt-10">
              <h2 className="font-display text-xl">Quality Reviewer megjegyzés</h2>
              <p className="mt-3 border border-border bg-surface p-4 text-sm text-foreground-soft">{sub.attila_review_note}</p>
            </section>
          )}

          {sub.attila_review_status === "pending" && sub.generated_markdown && (
            <section className="mt-10 border-t border-border pt-10">
              <h2 className="font-display text-xl">Approve / Edit / Reject</h2>
              <form action={approve} className="mt-6 space-y-4">
                <label className="block">
                  <span className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
                    Szerkesztett markdown (opcionális — ha üres, a generált marad)
                  </span>
                  <textarea
                    name="edited_markdown"
                    rows={20}
                    defaultValue={sub.generated_markdown}
                    className="mt-3 w-full border border-border-strong bg-background px-4 py-4 font-mono text-xs text-foreground"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" name="use_edit" defaultChecked={false} className="h-4 w-4" />
                  <span className="font-sans text-sm text-foreground-soft">Az szerkesztett verziót küldjem (különben az AI-generált megy)</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-background hover:bg-transparent hover:text-foreground"
                  >
                    Approve + Send email →
                  </button>
                </div>
              </form>
              <form action={reject} className="mt-4">
                <button
                  type="submit"
                  className="border border-border-strong px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-foreground-soft hover:border-[var(--color-accent-rose,#e8a4b5)] hover:text-[var(--color-accent-rose,#e8a4b5)]"
                >
                  Reject (nem küldjük)
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
