// Vercel Cron — minden percben fut.
// Feldolgozza a pending lead magnet submissionöket:
//   1. Standard text-input LM-ek (ai-mukodesi-terkep, ai-folyamatvazlat-48h,
//      48h-ai-gyorsdiagnozis, kockazatmentes-audit) → Claude → Hermes review
//   2. mondd-el-egyszer audio submissionök → Whisper transcript → Claude → Hermes
//   3. auditprogram-9900 (fizetős) post-questionnaire-completed → Claude (8 oldalas) → Hermes
//   4. ugyfelut-audit too-early → decline email
//   5. ai-rendszer-giveaway-q3 → Claude scoring + Hermes review
//
// Egy futáson MAX 5 submission — Vercel 60s limit.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  generateLeadMagnetReport,
  qualityReviewLive,
  scoreGiveawayApplication,
  type LeadMagnetSlug,
} from "@/lib/anthropic";
import { notifyHermesForReview } from "@/lib/hermes-notifier";
import { sendQualificationDeclined } from "@/lib/lead-magnet-email";
import { enrollNewsletterSubscriber } from "@/lib/mailerlite";
import { transcribeAudio } from "@/lib/whisper";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PER_RUN = 5;

// Standard text-input LM-ek (generálás 1 lépésben)
const STANDARD_SLUGS = [
  "ai-mukodesi-terkep",
  "ai-folyamatvazlat-48h",
  "48h-ai-gyorsdiagnozis",
  "kockazatmentes-audit",
  // Wave 6 mini-csapat aldim:
  "csapat-szerep-terkep",
  "mini-onboarding-vazlat",
  // Wave 7 Expert Flow B2B (LM9 nincs itt — Cal.com kvalifikáció kliensben):
  "operations-erettsegi-audit",
  "pilot-rendszer-blueprint",
] as const;

// Slug-ok, amelyekre a Hermes review-card megy (típus-szűkítő a notifier hívásához)
const HERMES_REVIEW_SLUGS = new Set([
  "ai-mukodesi-terkep",
  "ai-folyamatvazlat-48h",
  "48h-ai-gyorsdiagnozis",
  "kockazatmentes-audit",
  "csapat-szerep-terkep",
  "mini-onboarding-vazlat",
  "operations-erettsegi-audit",
  "pilot-rendszer-blueprint",
]);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: ProcessResult[] = [];

  // 1. STANDARD slug-ok feldolgozása
  await processStandard(results);

  // 2. mondd-el-egyszer: audio/loom transzkripció szükséges, vagy text közvetlenül
  await processSayItOnce(results);

  // 3. auditprogram-9900: csak akkor, ha a kérdőív már ki van töltve
  await processAudit9900(results);

  // 4. Giveaway scoring
  await processGiveaway(results);

  // 5. LM3 too-early decline
  await processTooEarly(results);

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}

type ProcessResult = {
  id: string;
  slug: string;
  ok: boolean;
  hermes_ok?: boolean;
  cost_huf?: number;
  error?: string;
};

// ─── 1. Standard slug-ok ─────────────────────────────────────────────────

async function processStandard(results: ProcessResult[]) {
  const { data: pending } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, lead_magnet_slug, name, email, payload")
    .in("lead_magnet_slug", STANDARD_SLUGS as unknown as string[])
    .eq("attila_review_status", "pending")
    .is("generated_at", null)
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);

  for (const sub of pending ?? []) {
    try {
      const slug = sub.lead_magnet_slug as LeadMagnetSlug;
      const payload = (sub.payload ?? {}) as Record<string, string>;

      const gen = await generateLeadMagnetReport(slug, payload);

      // Quality Review (Haiku, gyors)
      const review = await qualityReviewLive({ slug, payload, generatedMarkdown: gen.markdown }).catch((e) => {
        console.error("[process-pending] qualityReview failed (non-blocking)", e);
        return null;
      });

      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({
          generated_markdown: gen.markdown,
          generated_at: new Date().toISOString(),
          generation_model: gen.model,
          generation_cost_huf: gen.costHuf,
          attila_review_note: review
            ? `Quality: ${review.recommendation}. AI violations: ${review.antiAiViolations.length}. BIP violations: ${review.buildInPublicViolations.length}.`
            : null,
        })
        .eq("id", sub.id);

      // Hermes review-card a HERMES_REVIEW_SLUGS-okra megy.
      // mondd-el-egyszer és auditprogram-9900 külön ágon (processSayItOnce / processAudit9900).
      const hermes = HERMES_REVIEW_SLUGS.has(slug)
        ? await notifyHermesForReview({
            submissionId: sub.id,
            leadMagnetSlug: slug as
              | "ai-mukodesi-terkep"
              | "ai-folyamatvazlat-48h"
              | "48h-ai-gyorsdiagnozis"
              | "kockazatmentes-audit"
              | "csapat-szerep-terkep"
              | "mini-onboarding-vazlat"
              | "operations-erettsegi-audit"
              | "pilot-rendszer-blueprint",
            submitterName: sub.name as string,
            submitterEmail: sub.email as string,
            payload,
            generatedMarkdown: gen.markdown,
          })
        : { ok: false as const, reason: "no-config" as const };

      if (hermes.ok) {
        await supabaseAdmin
          .from("lead_magnet_submissions")
          .update({
            hermes_message_id: hermes.hermesMessageId,
            hermes_chat_id: hermes.hermesChatId,
            hermes_sent_at: new Date().toISOString(),
          })
          .eq("id", sub.id);
      }

      results.push({ id: sub.id, slug, ok: true, hermes_ok: hermes.ok, cost_huf: gen.costHuf });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`[process-pending] standard failure on ${sub.id}`, e);
      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({ attila_review_note: `Generation error: ${errMsg}`.slice(0, 1000) })
        .eq("id", sub.id);
      results.push({ id: sub.id, slug: sub.lead_magnet_slug as string, ok: false, error: errMsg });
    }
  }
}

// ─── 2. mondd-el-egyszer ─────────────────────────────────────────────────

async function processSayItOnce(results: ProcessResult[]) {
  const { data: pending } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name, email, payload, raw_input_type, raw_input_storage_url, raw_input_transcript")
    .eq("lead_magnet_slug", "mondd-el-egyszer")
    .eq("attila_review_status", "pending")
    .is("generated_at", null)
    .order("created_at", { ascending: true })
    .limit(2); // audio feldolgozás lassabb, kevesebbet egyszerre

  for (const sub of pending ?? []) {
    try {
      let transcript = sub.raw_input_transcript ?? "";
      let whisperCostHuf = 0;

      // Whisper transzkripció ha audio
      if (sub.raw_input_type === "audio" && sub.raw_input_storage_url && !transcript) {
        const { data: fileData } = await supabaseAdmin.storage
          .from("lead-magnet-audio")
          .download(sub.raw_input_storage_url as string);

        if (fileData) {
          const buffer = Buffer.from(await fileData.arrayBuffer());
          const ext = (sub.raw_input_storage_url as string).split(".").pop() ?? "webm";
          const mimeType =
            ext === "mp3"
              ? "audio/mpeg"
              : ext === "m4a"
              ? "audio/mp4"
              : ext === "wav"
              ? "audio/wav"
              : "audio/webm";

          const result = await transcribeAudio({
            audio: buffer,
            filename: `audio.${ext}`,
            mimeType,
          });

          transcript = result.text;
          whisperCostHuf = result.costHuf;

          await supabaseAdmin
            .from("lead_magnet_submissions")
            .update({
              raw_input_transcript: transcript,
              whisper_cost_huf: whisperCostHuf,
            })
            .eq("id", sub.id);
        }
      }

      // Loom esetén jelenleg manuális — skipping
      if (sub.raw_input_type === "loom" && !transcript) {
        await supabaseAdmin
          .from("lead_magnet_submissions")
          .update({
            attila_review_note: "Loom URL — manuális transzkripció szükséges a hostinger VPS-en (yt-dlp + Whisper)",
          })
          .eq("id", sub.id);
        results.push({ id: sub.id, slug: "mondd-el-egyszer", ok: false, error: "loom-manual-needed" });
        continue;
      }

      if (!transcript || transcript.length < 100) {
        results.push({ id: sub.id, slug: "mondd-el-egyszer", ok: false, error: "transcript-empty-or-short" });
        continue;
      }

      // Claude generálás
      const gen = await generateLeadMagnetReport("mondd-el-egyszer", {
        name: sub.name as string,
        transcript,
      });

      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({
          generated_markdown: gen.markdown,
          generated_at: new Date().toISOString(),
          generation_model: gen.model,
          generation_cost_huf: gen.costHuf,
        })
        .eq("id", sub.id);

      // Hermes review
      const hermes = await notifyHermesForReview({
        submissionId: sub.id,
        leadMagnetSlug: "mondd-el-egyszer",
        submitterName: sub.name as string,
        submitterEmail: sub.email as string,
        payload: { transcript: transcript.slice(0, 1500) } as Record<string, string>,
        generatedMarkdown: gen.markdown,
      });
      if (hermes.ok) {
        await supabaseAdmin
          .from("lead_magnet_submissions")
          .update({
            hermes_message_id: hermes.hermesMessageId,
            hermes_chat_id: hermes.hermesChatId,
            hermes_sent_at: new Date().toISOString(),
          })
          .eq("id", sub.id);
      }

      results.push({ id: sub.id, slug: "mondd-el-egyszer", ok: true, hermes_ok: hermes.ok, cost_huf: gen.costHuf + whisperCostHuf });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`[process-pending] mondd-el-egyszer failure on ${sub.id}`, e);
      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({ attila_review_note: `Generation error: ${errMsg}`.slice(0, 1000) })
        .eq("id", sub.id);
      results.push({ id: sub.id, slug: "mondd-el-egyszer", ok: false, error: errMsg });
    }
  }
}

// ─── 3. auditprogram-9900 ────────────────────────────────────────────────

async function processAudit9900(results: ProcessResult[]) {
  // Csak akkor generálunk, ha:
  // - paid_at NOT NULL (kifizette)
  // - post_payment_questionnaire_completed_at NOT NULL (kitöltötte a 12 kérdést)
  // - generated_at NULL (még nem generáltunk)
  const { data: pending } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name, email, payload")
    .eq("lead_magnet_slug", "auditprogram-9900")
    .not("paid_at", "is", null)
    .not("post_payment_questionnaire_completed_at", "is", null)
    .is("generated_at", null)
    .limit(2); // hosszabb generálás, kevesebbet egyszerre

  for (const sub of pending ?? []) {
    try {
      const payload = sub.payload as Record<string, string>;
      const gen = await generateLeadMagnetReport("auditprogram-9900", payload);

      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({
          generated_markdown: gen.markdown,
          generated_at: new Date().toISOString(),
          generation_model: gen.model,
          generation_cost_huf: gen.costHuf,
        })
        .eq("id", sub.id);

      // Hermes review KÖTELEZŐ a 9 900 Ft auditra — 💰 prefix-szel jelölve Attilának
      const hermes = await notifyHermesForReview({
        submissionId: sub.id,
        leadMagnetSlug: "auditprogram-9900",
        submitterName: sub.name as string,
        submitterEmail: sub.email as string,
        payload,
        generatedMarkdown: gen.markdown,
      });
      if (hermes.ok) {
        await supabaseAdmin
          .from("lead_magnet_submissions")
          .update({
            hermes_message_id: hermes.hermesMessageId,
            hermes_chat_id: hermes.hermesChatId,
            hermes_sent_at: new Date().toISOString(),
          })
          .eq("id", sub.id);
      }

      results.push({ id: sub.id, slug: "auditprogram-9900", ok: true, hermes_ok: hermes.ok, cost_huf: gen.costHuf });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`[process-pending] audit-9900 failure on ${sub.id}`, e);
      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({ attila_review_note: `Generation error: ${errMsg}`.slice(0, 1000) })
        .eq("id", sub.id);
      results.push({ id: sub.id, slug: "auditprogram-9900", ok: false, error: errMsg });
    }
  }
}

// ─── 4. Giveaway scoring ─────────────────────────────────────────────────

async function processGiveaway(results: ProcessResult[]) {
  const { data: pending } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name, email, payload, giveaway_campaign_slug, lead_magnet_slug")
    .like("lead_magnet_slug", "ai-rendszer-giveaway-%")
    .is("giveaway_total_score", null)
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);

  for (const sub of pending ?? []) {
    try {
      const payload = sub.payload as Record<string, unknown>;
      const score = await scoreGiveawayApplication(payload);

      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({
          giveaway_fit_score: score.fit,
          giveaway_impact_score: score.impact,
          giveaway_feasibility_score: score.feasibility,
          giveaway_pr_value_score: score.prValue,
          giveaway_total_score: score.total,
          giveaway_category: score.category,
          generation_cost_huf: score.costHuf,
          attila_review_note: `${score.reasoning} ${score.winnerPitch ? `WINNER PITCH: ${score.winnerPitch}` : ""}`.slice(0, 1000),
        })
        .eq("id", sub.id);

      results.push({ id: sub.id, slug: sub.lead_magnet_slug as string, ok: true, cost_huf: score.costHuf });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`[process-pending] giveaway scoring failure on ${sub.id}`, e);
      results.push({ id: sub.id, slug: sub.lead_magnet_slug as string, ok: false, error: errMsg });
    }
  }
}

// ─── 5. LM3 too-early decline ────────────────────────────────────────────

async function processTooEarly(results: ProcessResult[]) {
  const { data: tooEarly } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name, email, marketing_consent")
    .eq("lead_magnet_slug", "ugyfelut-audit")
    .eq("qualification_result", "too-early")
    .is("delivered_at", null)
    .limit(MAX_PER_RUN);

  for (const sub of tooEarly ?? []) {
    try {
      const result = await sendQualificationDeclined({
        to: sub.email as string,
        name: sub.name as string,
        reason: "too-early",
      });

      if (sub.marketing_consent) {
        await enrollNewsletterSubscriber({
          email: sub.email as string,
          name: sub.name as string,
          source: "lm-ugyfelut-audit",
        }).catch((e) => console.error(`[process-pending] MailerLite enroll failed for ${sub.id}`, e));
      }

      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({
          delivered_at: new Date().toISOString(),
          delivery_provider: "smtp",
          delivery_message_id: result.messageId,
        })
        .eq("id", sub.id);
      results.push({ id: sub.id, slug: "ugyfelut-audit-too-early", ok: true });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({ delivery_error: errMsg.slice(0, 1000) })
        .eq("id", sub.id);
      results.push({ id: sub.id, slug: "ugyfelut-audit-too-early", ok: false, error: errMsg });
    }
  }
}
