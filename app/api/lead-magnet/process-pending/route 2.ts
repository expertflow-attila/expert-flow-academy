// Vercel Cron — minden percben fut.
// Feladata: kiszedi a "pending" állapotú lead magnet submission-eket, és:
//   1. LM1 + LM2 esetén Claude API hívással generál térképet / vázlatot
//   2. Hermes Telegram review gate-re küldi
//   3. Frissíti a submission-t a generation állapotával
//
// Egy futáson MAX 5 submission-t dolgoz fel — Vercel function 60s limit miatt.
//
// Az LM3 (ugyfelut-audit) "too-early" submission-eket szintén innen dolgozzuk fel:
// sendQualificationDeclined hívással.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateLeadMagnetReport } from "@/lib/anthropic";
import { notifyHermesForReview } from "@/lib/hermes-notifier";
import { sendQualificationDeclined } from "@/lib/lead-magnet-email";
import { enrollNewsletterSubscriber } from "@/lib/mailerlite";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PER_RUN = 5;

export async function GET(req: Request) {
  // Vercel Cron auth — automatikusan beszúrja a "Authorization: Bearer <CRON_SECRET>" header-t
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: ProcessResult[] = [];

  // 1. LM1 + LM2 pending generation
  const { data: pending } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, lead_magnet_slug, name, email, payload")
    .in("lead_magnet_slug", ["ai-mukodesi-terkep", "ai-folyamatvazlat-48h"])
    .eq("attila_review_status", "pending")
    .is("generated_at", null)
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);

  for (const sub of pending ?? []) {
    try {
      const slug = sub.lead_magnet_slug as "ai-mukodesi-terkep" | "ai-folyamatvazlat-48h";
      const payload = (sub.payload ?? {}) as Record<string, string>;

      // Claude API generálás
      const gen = await generateLeadMagnetReport(slug, payload);

      // Mentés
      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({
          generated_markdown: gen.markdown,
          generated_at: new Date().toISOString(),
          generation_model: gen.model,
          generation_cost_huf: gen.costHuf,
        })
        .eq("id", sub.id);

      // Hermes review gate
      const hermes = await notifyHermesForReview({
        submissionId: sub.id,
        leadMagnetSlug: slug,
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

      results.push({
        id: sub.id,
        slug,
        ok: true,
        hermes_ok: hermes.ok,
        cost_huf: gen.costHuf,
      });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`[process-pending] failure on ${sub.id}`, e);
      await supabaseAdmin
        .from("lead_magnet_submissions")
        .update({ attila_review_note: `Generation error: ${errMsg}`.slice(0, 1000) })
        .eq("id", sub.id);
      results.push({ id: sub.id, slug: sub.lead_magnet_slug as string, ok: false, error: errMsg });
    }
  }

  // 2. LM3 "too-early" submission-ek decline email + MailerLite enroll (ha consent)
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

      // Enroll a 41 leveles hírlevélbe — nem kritikus path, hiba esetén csak log
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
          delivery_provider: parseProviderFromMessageId(result.messageId),
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

function parseProviderFromMessageId(messageId: string): string {
  if (messageId.includes("brevo")) return "brevo";
  if (messageId.includes("resend")) return "resend";
  if (messageId.includes("mailerlite")) return "mailerlite";
  return "smtp";
}
