// Vercel Cron — óránként fut.
// A lead magnet utánkövető email sorozat motorja.
//
// A flow:
//   1. Lekérjük a lm_email_sequence_state sorokat ahol:
//      - paused = false
//      - next_send_at <= now()
//   2. Mindegyikhez betöltjük a submission-t (name, email, slug)
//   3. Elküldjük a sequence_step-nek megfelelő emailt
//   4. Léptetjük a sequence_step-et, és kiszámítjuk a következő next_send_at-et
//   5. Ha utolsó lépés volt, paused=true (kész)
//
// Egy futáson max 10 emailt küldünk, hogy ne futtassuk ki a Vercel 60s-es limitet.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendSequenceEmail } from "@/lib/lead-magnet-email";
import {
  getNextSendAt,
  sequenceLength,
  type SequenceSlug,
} from "@/lib/lm-email-sequences";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_PER_RUN = 10;

const KNOWN_SLUGS: SequenceSlug[] = [
  "ai-mukodesi-terkep",
  "ai-folyamatvazlat-48h",
  "48h-ai-gyorsdiagnozis",
  "kockazatmentes-audit",
  "mondd-el-egyszer",
  "auditprogram-9900",
  "csapat-szerep-terkep",
  "mini-onboarding-vazlat",
];

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowIso = new Date().toISOString();

  // Due sequence state rows
  const { data: dueRows } = await supabaseAdmin
    .from("lm_email_sequence_state")
    .select("id, submission_id, lead_magnet_slug, sequence_step, next_send_at")
    .eq("paused", false)
    .not("next_send_at", "is", null)
    .lte("next_send_at", nowIso)
    .order("next_send_at", { ascending: true })
    .limit(MAX_PER_RUN);

  const results: Array<{ id: string; slug: string; step: number; ok: boolean; error?: string }> = [];

  for (const row of dueRows ?? []) {
    const slug = row.lead_magnet_slug as SequenceSlug;

    try {
      // Slug-validáció
      if (!KNOWN_SLUGS.includes(slug)) {
        await supabaseAdmin
          .from("lm_email_sequence_state")
          .update({ paused: true, last_sent_at: nowIso })
          .eq("id", row.id);
        results.push({ id: row.id, slug, step: row.sequence_step, ok: false, error: "unknown-slug" });
        continue;
      }

      // Submission lekérdezése
      const { data: sub } = await supabaseAdmin
        .from("lead_magnet_submissions")
        .select("name, email, marketing_consent")
        .eq("id", row.submission_id)
        .maybeSingle();

      if (!sub || !sub.email || !sub.marketing_consent) {
        // Ha nincs marketing consent, NEM küldünk follow-upot — pause-oljuk
        await supabaseAdmin
          .from("lm_email_sequence_state")
          .update({ paused: true, last_sent_at: nowIso })
          .eq("id", row.id);
        results.push({
          id: row.id,
          slug,
          step: row.sequence_step,
          ok: false,
          error: !sub ? "no-submission" : "no-consent",
        });
        continue;
      }

      // Email küldés
      const sendResult = await sendSequenceEmail({
        to: sub.email as string,
        name: sub.name as string,
        slug,
        step: row.sequence_step,
      });

      // Következő lépés kiszámítása — a delivery alap-időpontját a sequence state
      // első sorának created_at-je adja. De egyszerűbb: a current next_send_at-hez
      // viszonyítva számolunk delta-t a SEQUENCES[slug][step+1].dayOffset - SEQUENCES[slug][step].dayOffset alapján.
      // Mégsem — a tervezett séma: minden következő lépés a DELIVERY datumtól számít, nem az előzőtől.
      // Tehát a "base date" a sequence_state.created_at — azt használjuk.
      const { data: stateRow } = await supabaseAdmin
        .from("lm_email_sequence_state")
        .select("created_at")
        .eq("id", row.id)
        .maybeSingle();
      const baseDate = stateRow?.created_at ? new Date(stateRow.created_at as string) : new Date();

      const nextStep = row.sequence_step + 1;
      const seqLen = sequenceLength(slug);
      const isDone = nextStep >= seqLen;

      const { nextSendAt } = isDone
        ? { nextSendAt: null }
        : getNextSendAt(slug, nextStep, baseDate);

      await supabaseAdmin
        .from("lm_email_sequence_state")
        .update({
          sequence_step: nextStep,
          next_send_at: nextSendAt ? nextSendAt.toISOString() : null,
          last_sent_at: nowIso,
          last_message_id: sendResult.messageId,
          paused: isDone,
        })
        .eq("id", row.id);

      results.push({ id: row.id, slug, step: row.sequence_step, ok: true });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`[sequence-followup] failure on ${row.id}`, e);
      // NEM pauzáljuk azonnal — egyszeri SMTP-hiba lehet. A next_send_at marad,
      // a következő futás megpróbálja újra. 3 sikertelen futás után érdemes
      // pauzálni — V2 feladat.
      results.push({ id: row.id, slug, step: row.sequence_step, ok: false, error: errMsg });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: nowIso,
  });
}
