// Vercel Cron — 1 óránként fut.
// Auto-release pending submission-eket, ha Attila > 18 órája nem nyúlt hozzá.
// Build-in-public hitelesség: a 24h ígéret nem szakadhat meg.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendLeadMagnetReport } from "@/lib/lead-magnet-email";
import { enrollNewsletterSubscriber } from "@/lib/mailerlite";

export const runtime = "nodejs";
export const maxDuration = 60;

const LM1_AUTO_RELEASE_HOURS = 18;  // 24h ígéret - 6h marginal
const LM2_AUTO_RELEASE_HOURS = 40;  // 48h ígéret - 8h marginal

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const lm1Cutoff = new Date(now.getTime() - LM1_AUTO_RELEASE_HOURS * 60 * 60 * 1000);
  const lm2Cutoff = new Date(now.getTime() - LM2_AUTO_RELEASE_HOURS * 60 * 60 * 1000);

  // LM1 — 18 óra után auto-release
  const { data: lm1Stale } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name, email, generated_markdown, marketing_consent")
    .eq("lead_magnet_slug", "ai-mukodesi-terkep")
    .eq("attila_review_status", "pending")
    .not("generated_markdown", "is", null)
    .lt("created_at", lm1Cutoff.toISOString())
    .limit(5);

  // LM2 — 40 óra után auto-release
  const { data: lm2Stale } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name, email, generated_markdown, marketing_consent")
    .eq("lead_magnet_slug", "ai-folyamatvazlat-48h")
    .eq("attila_review_status", "pending")
    .not("generated_markdown", "is", null)
    .lt("created_at", lm2Cutoff.toISOString())
    .limit(5);

  const results: Array<{ id: string; slug: string; ok: boolean; error?: string }> = [];

  for (const sub of [
    ...(lm1Stale ?? []).map((s) => ({ ...s, slug: "ai-mukodesi-terkep" as const })),
    ...(lm2Stale ?? []).map((s) => ({ ...s, slug: "ai-folyamatvazlat-48h" as const })),
  ]) {
    try {
      const result = await sendLeadMagnetReport({
        to: sub.email as string,
        name: sub.name as string,
        leadMagnetSlug: sub.slug,
        reportMarkdown: sub.generated_markdown as string,
      });

      if (sub.marketing_consent) {
        await enrollNewsletterSubscriber({
          email: sub.email as string,
          name: sub.name as string,
          source: sub.slug === "ai-mukodesi-terkep" ? "lm-ai-mukodesi-terkep" : "lm-ai-folyamatvazlat-48h",
        }).catch((e) => console.error(`[auto-release] MailerLite enroll failed for ${sub.id}`, e));
      }

      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({
          attila_review_status: "auto-released",
          attila_reviewed_at: now.toISOString(),
          attila_review_note: "Auto-released after timeout — Hermes review elmaradt",
          delivered_at: now.toISOString(),
          delivery_provider: "smtp",
          delivery_message_id: result.messageId,
        })
        .eq("id", sub.id);

      results.push({ id: sub.id, slug: sub.slug, ok: true });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`[auto-release] failure on ${sub.id}`, e);
      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({ delivery_error: errMsg.slice(0, 1000) })
        .eq("id", sub.id);
      results.push({ id: sub.id, slug: sub.slug, ok: false, error: errMsg });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: now.toISOString(),
  });
}
