// Vercel Cron — 1 óránként fut.
// Auto-release pending submission-eket, ha Attila > 18/40 órája nem nyúlt hozzá.
// Build-in-public hitelesség: a 24h / 48h ígéret nem szakadhat meg.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendLeadMagnetReport, type LeadMagnetEmailSlug } from "@/lib/lead-magnet-email";
import { enrollNewsletterSubscriber, type EnrollSource } from "@/lib/mailerlite";
import { startEmailSequence, type SequenceSlug } from "@/lib/lm-email-sequences";

export const runtime = "nodejs";
export const maxDuration = 60;

// Per-slug auto-release timing (24h ígéret → 18h, 48h ígéret → 40h)
const AUTO_RELEASE_HOURS: Record<LeadMagnetEmailSlug, number> = {
  "ai-mukodesi-terkep": 18,
  "ai-folyamatvazlat-48h": 40,
  "48h-ai-gyorsdiagnozis": 40,
  "kockazatmentes-audit": 40,
  "mondd-el-egyszer": 60, // 3 munkanap → 72h - 12h = 60h
  "auditprogram-9900": 60, // 3 munkanap, fizetős, magasabb sürgősség
  "csapat-szerep-terkep": 40,
  "mini-onboarding-vazlat": 40,
};

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: Array<{ id: string; slug: string; ok: boolean; error?: string }> = [];

  for (const [slug, hours] of Object.entries(AUTO_RELEASE_HOURS) as [LeadMagnetEmailSlug, number][]) {
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const { data: stale } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .select("id, name, email, generated_markdown, marketing_consent")
      .eq("lead_magnet_slug", slug)
      .eq("attila_review_status", "pending")
      .not("generated_markdown", "is", null)
      .lt("created_at", cutoff.toISOString())
      .limit(3); // per-slug max 3 / futás

    for (const sub of stale ?? []) {
      try {
        const result = await sendLeadMagnetReport({
          to: sub.email as string,
          name: sub.name as string,
          leadMagnetSlug: slug,
          reportMarkdown: sub.generated_markdown as string,
        });

        if (sub.marketing_consent) {
          await enrollNewsletterSubscriber({
            email: sub.email as string,
            name: sub.name as string,
            source: `lm-${slug}` as EnrollSource,
          }).catch((e) => console.error(`[auto-release] MailerLite enroll failed for ${sub.id}`, e));
        }

        await supabaseAdmin
          .from("lead_magnet_submissions")
          .update({
            attila_review_status: "auto-released",
            attila_reviewed_at: now.toISOString(),
            attila_review_note: `Auto-released after ${hours}h timeout — Hermes review elmaradt`,
            delivered_at: now.toISOString(),
            delivery_provider: "smtp",
            delivery_message_id: result.messageId,
          })
          .eq("id", sub.id);

        // Sequence indítás (idempotens)
        if (sub.marketing_consent) {
          await startEmailSequence(supabaseAdmin, {
            submissionId: sub.id as string,
            slug: slug as SequenceSlug,
            baseDate: now,
          }).catch((e) => console.error(`[auto-release] startEmailSequence failed for ${sub.id}`, e));
        }

        results.push({ id: sub.id as string, slug, ok: true });
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(`[auto-release] failure on ${sub.id}`, e);
        await supabaseAdmin
          .from("lead_magnet_submissions")
          .update({ delivery_error: errMsg.slice(0, 1000) })
          .eq("id", sub.id);
        results.push({ id: sub.id as string, slug, ok: false, error: errMsg });
      }
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: now.toISOString(),
  });
}
