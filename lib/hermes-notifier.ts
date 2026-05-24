// Hermes Telegram review gate kommunikáció.
//
// A flow:
//   1. Lead magnet submission → AI generates draft markdown
//   2. POST Hermes (hostinger VPS) → @hermes_flowbot Telegram-on értesít Attilát
//      3 inline gombbal: APPROVE / EDIT / REJECT
//   3. Attila kattint a gombra
//   4. Hermes POST visszaküldi a /api/hermes/lead-magnet-review endpoint-ra
//      (HMAC-aláírva a HERMES_REVIEW_SECRET-tel)
//   5. akademia.expertflow.hu frissíti a submission státuszát
//   6. APPROVED → email kimegy
//
// Ha a Hermes nem elérhető (HERMES_NOTIFY_URL hiányzik vagy 500), a submission
// pending státuszban marad — egy 18 órás cron auto-release-ben szabadítja fel.

const HERMES_NOTIFY_URL = process.env.HERMES_NOTIFY_URL;
const HERMES_NOTIFY_SECRET = process.env.HERMES_NOTIFY_SECRET;
const CALLBACK_BASE_URL = process.env.NEXTAUTH_URL ?? "https://akademia.expertflow.hu";

export type HermesNotifyResult =
  | { ok: true; hermesMessageId: string; hermesChatId: string }
  | { ok: false; reason: "no-config" | "http-error" | "rejected"; detail?: string };

export type HermesReviewSlug =
  | "ai-mukodesi-terkep"
  | "ai-folyamatvazlat-48h"
  | "48h-ai-gyorsdiagnozis"
  | "kockazatmentes-audit"
  | "mondd-el-egyszer"
  | "auditprogram-9900"
  | "csapat-szerep-terkep"
  | "mini-onboarding-vazlat"
  | "operations-erettsegi-audit"
  | "pilot-rendszer-blueprint";

export async function notifyHermesForReview(params: {
  submissionId: string;
  leadMagnetSlug: HermesReviewSlug;
  submitterName: string;
  submitterEmail: string;
  payload: Record<string, string>;
  generatedMarkdown: string;
}): Promise<HermesNotifyResult> {
  if (!HERMES_NOTIFY_URL || !HERMES_NOTIFY_SECRET) {
    console.warn("[hermes-notifier] HERMES_NOTIFY_URL vagy SECRET nincs — review gate kihagyva, auto-released az autocron-ban");
    return { ok: false, reason: "no-config" };
  }

  const payloadSummary = formatPayloadSummary(params.leadMagnetSlug, params.payload);
  const titleByMagnet: Record<HermesReviewSlug, string> = {
    "ai-mukodesi-terkep": "AI-működési térkép",
    "ai-folyamatvazlat-48h": "AI-folyamatvázlat 48h",
    "48h-ai-gyorsdiagnozis": "48h AI Gyorsdiagnózis",
    "kockazatmentes-audit": "Kockázatmentes audit",
    "mondd-el-egyszer": "Mondd el egyszer — rendszer-térkép",
    "auditprogram-9900": "💰 9 900 Ft Belépő Audit (FIZETETT)",
    "csapat-szerep-terkep": "Csapat-szerep térkép (mini-csapat)",
    "mini-onboarding-vazlat": "Mini-onboarding vázlat 48h",
    "operations-erettsegi-audit": "🏢 EF B2B — Operations érettségi audit",
    "pilot-rendszer-blueprint": "🏢 EF B2B — Pilot rendszer-blueprint",
  };

  const message = [
    `🟪 *Új lead magnet review*`,
    ``,
    `*Sablon:* ${titleByMagnet[params.leadMagnetSlug]}`,
    `*Név:* ${params.submitterName}`,
    `*Email:* ${params.submitterEmail}`,
    ``,
    `*A válaszai:*`,
    payloadSummary,
    ``,
    `*Generált térkép / vázlat (vágott):*`,
    truncate(params.generatedMarkdown, 1800),
    ``,
    `Approve → kimegy ahogy van`,
    `Edit → válaszolj ide a végleges szöveggel`,
    `Reject → nem megy ki`,
  ].join("\n");

  const body = {
    agent: "reception",
    topic: "lead-magnet-review",
    submission_id: params.submissionId,
    title: `Lead magnet review — ${titleByMagnet[params.leadMagnetSlug]}`,
    message,
    parse_mode: "Markdown",
    actions: [
      { id: "approve", label: "Approve", style: "primary" },
      { id: "edit", label: "Edit", style: "default" },
      { id: "reject", label: "Reject", style: "destructive" },
    ],
    callback_url: `${CALLBACK_BASE_URL}/api/hermes/lead-magnet-review`,
    callback_secret_header: "x-hermes-signature",
  };

  try {
    const response = await fetch(HERMES_NOTIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HERMES_NOTIFY_SECRET}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[hermes-notifier] HTTP ${response.status} — ${detail}`);
      return { ok: false, reason: "http-error", detail };
    }

    const json = (await response.json()) as { message_id?: string; chat_id?: string };
    if (!json.message_id || !json.chat_id) {
      return { ok: false, reason: "rejected", detail: "Hermes nem adott vissza message_id-t" };
    }

    return {
      ok: true,
      hermesMessageId: json.message_id,
      hermesChatId: json.chat_id,
    };
  } catch (e) {
    console.error("[hermes-notifier] fetch hiba", e);
    return { ok: false, reason: "http-error", detail: e instanceof Error ? e.message : String(e) };
  }
}

// ─── HMAC verifikáció a Hermes → Expert Flow callback-on ─────

import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyHermesSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!HERMES_NOTIFY_SECRET || !signatureHeader) return false;
  const expected = createHmac("sha256", HERMES_NOTIFY_SECRET).update(rawBody).digest("hex");
  // signatureHeader format: "sha256=<hex>"
  const received = signatureHeader.startsWith("sha256=") ? signatureHeader.slice(7) : signatureHeader;

  // Constant-time compare
  if (expected.length !== received.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return false;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function formatPayloadSummary(
  slug: HermesReviewSlug,
  payload: Record<string, string>,
): string {
  if (slug === "ai-mukodesi-terkep") {
    return [
      `1. 3 fárasztó dolog: ${truncate(payload.q1 ?? "", 180)}`,
      `2. Észrevétlen szivárgás: ${truncate(payload.q2 ?? "", 180)}`,
      `3. Mit adna oda: ${truncate(payload.q3 ?? "", 180)}`,
    ].join("\n");
  }
  if (slug === "ai-folyamatvazlat-48h") {
    return [
      `1. Honnan érkezik: ${truncate(payload.q1 ?? "", 120)}`,
      `2. Első reakció: ${truncate(payload.q2 ?? "", 120)}`,
      `3. Válaszidő: ${truncate(payload.q3 ?? "", 80)}`,
      `4. Minősítés: ${truncate(payload.q4 ?? "", 120)}`,
      `5. Nyomon követés: ${truncate(payload.q5 ?? "", 120)}`,
      `6. Fájdalompont: ${truncate(payload.q6 ?? "", 120)}`,
    ].join("\n");
  }
  if (slug === "48h-ai-gyorsdiagnozis") {
    return [
      `1. Szolgáltatás: ${truncate(payload.q1 ?? "", 100)}`,
      `2. 3 manuális feladat: ${truncate(payload.q2 ?? "", 160)}`,
      `3. Automatizálandó: ${truncate(payload.q3 ?? "", 140)}`,
      `4. Heti óra: ${truncate(payload.q4 ?? "", 30)}`,
      `5. Eszközök: ${truncate(payload.q5 ?? "", 140)}`,
    ].join("\n");
  }
  if (slug === "kockazatmentes-audit") {
    return [
      `1. Szolgáltatás: ${truncate(payload.q1 ?? "", 100)}`,
      `2. Probléma: ${truncate(payload.q2 ?? "", 160)}`,
      `3. Félelmek: ${truncate(payload.q3 ?? "", 140)}`,
      `4. Korábbi rossz tapasztalat: ${truncate(payload.q4 ?? "—", 140)}`,
      `5. Eszközök: ${truncate(payload.q5 ?? "", 140)}`,
      `6. Fizetési hajlandóság: ${truncate(payload.q6 ?? "", 30)}`,
      `7. Csapat: ${truncate(payload.q7 ?? "", 30)}`,
    ].join("\n");
  }
  if (slug === "mondd-el-egyszer") {
    return [
      `Szabad-szöveg / Whisper-transzkript:`,
      truncate(payload.transcript ?? payload.q1 ?? "", 800),
    ].join("\n");
  }
  if (slug === "auditprogram-9900") {
    return [
      `*9 900 Ft FIZETETT* — komoly munka.`,
      `1. ICP: ${truncate(payload.q1 ?? "", 140)}`,
      `2. Heti érdeklődő: ${truncate(payload.q2 ?? "", 40)}`,
      `4. Első reakció: ${truncate(payload.q4 ?? "", 140)}`,
      `5. Válaszidő: ${truncate(payload.q5 ?? "", 40)}`,
      `8. Utál: ${truncate(payload.q8 ?? "", 120)}`,
      `10. Automatizálna elsőként: ${truncate(payload.q10 ?? "", 140)}`,
      `11. Heti admin: ${truncate(payload.q11 ?? "", 40)}`,
      `12. 359k hajlandóság: ${truncate(payload.q12 ?? "", 60)}`,
    ].join("\n");
  }
  if (slug === "csapat-szerep-terkep") {
    return [
      `Csapat-méret: ${payload.team_size ?? "(nem írt)"}`,
      `1. Szerepek + tevékenység: ${truncate(payload.q1 ?? "", 200)}`,
      `2. Hol akadtok el / duplikálódtok: ${truncate(payload.q2 ?? "", 200)}`,
      `3. Mi nincs tisztázva köztetek: ${truncate(payload.q3 ?? "", 180)}`,
    ].join("\n");
  }
  if (slug === "mini-onboarding-vazlat") {
    return [
      `1. Ügyfél VAGY csapattag: ${truncate(payload.q1 ?? "", 60)}`,
      `2. Hogyan zajlik ad-hoc: ${truncate(payload.q2 ?? "", 150)}`,
      `3. Első dolog amit valaki csinál: ${truncate(payload.q3 ?? "", 150)}`,
      `4. Hol veszik el az első 7 napban: ${truncate(payload.q4 ?? "", 150)}`,
      `5. Közös eszközök: ${truncate(payload.q5 ?? "", 120)}`,
      `6. Hol szakad el a vázlat: ${truncate(payload.q6 ?? "", 150)}`,
    ].join("\n");
  }
  if (slug === "operations-erettsegi-audit") {
    return [
      `Cégnév: ${payload.company_name ?? "(nincs)"} · Méret: ${payload.company_size ?? "?"} · Szerep: ${payload.role ?? "?"}`,
      `1. Iparág: ${truncate(payload.q1 ?? "", 160)}`,
      `2. Ajánlatkérés flow: ${truncate(payload.q2 ?? "", 160)}`,
      `3. Operatív szivárgás: ${truncate(payload.q3 ?? "", 200)}`,
      `4. Heti admin/jelentés óra: ${truncate(payload.q4 ?? "", 100)}`,
      `5. Q5 priorizált rendszer: ${truncate(payload.q5 ?? "", 160)}`,
    ].join("\n");
  }
  // pilot-rendszer-blueprint
  return [
    `Cégnév: ${payload.company_name ?? "(nincs)"} · Méret: ${payload.company_size ?? "?"} · Iparág: ${payload.industry ?? "?"}`,
    `1. Fő fájdalom: ${truncate(payload.q1 ?? "", 160)}`,
    `2. 7 nap után más legyen: ${truncate(payload.q2 ?? "", 140)}`,
    `3. Eszközök: ${truncate(payload.q3 ?? "", 140)}`,
    `4. Q4 ops tulajdonos: ${truncate(payload.q4 ?? "", 120)}`,
    `5. Heti admin óra: ${truncate(payload.q5 ?? "", 100)}`,
    `6. Adatkezelés érzékenység: ${truncate(payload.q6 ?? "", 140)}`,
    `7. Korábbi auto-próba: ${truncate(payload.q7 ?? "", 160)}`,
    `8. 2 mérőszám: ${truncate(payload.q8 ?? "", 140)}`,
  ].join("\n");
}

function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + "...";
}
