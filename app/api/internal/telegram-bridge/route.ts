// Telegram review gate bridge.
//
// A `lib/hermes-notifier.ts` ide POST-ol (a HERMES_NOTIFY_URL env változó
// ennek a route-nak a teljes URL-jét tartalmazza).
//
// Itt direkt Telegram Bot API hívás:
//   1. sendMessage @hermes_flowbot bot-tal Attila admin chat-jébe
//   2. Inline URL-buttons: Approve / Edit / Reject — mindegyik HMAC-aláírt
//      linkkel az /api/hermes/review-link GET endpoint-ra
//
// NEM kell Hostinger Python service. A teljes review-gate a Vercel-en él.

import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";

export const runtime = "nodejs";

const HERMES_NOTIFY_SECRET = process.env.HERMES_NOTIFY_SECRET;
const HERMES_TELEGRAM_BOT_TOKEN = process.env.HERMES_TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID;
const HERMES_REVIEW_LINK_SECRET = process.env.HERMES_REVIEW_LINK_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "https://solobusiness-academy.vercel.app";

type IncomingPayload = {
  agent?: string;
  topic?: string;
  submission_id: string;
  title?: string;
  message: string;
  parse_mode?: string;
  actions?: Array<{ id: string; label: string; style?: string }>;
  callback_url?: string;
  callback_secret_header?: string;
};

export async function POST(req: Request) {
  // Bearer auth a HERMES_NOTIFY_SECRET-tel
  const auth = req.headers.get("authorization");
  if (!HERMES_NOTIFY_SECRET || auth !== `Bearer ${HERMES_NOTIFY_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!HERMES_TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_ID || !HERMES_REVIEW_LINK_SECRET) {
    return NextResponse.json(
      { error: "Telegram bridge nincs konfigurálva", reason: "missing-env" },
      { status: 503 },
    );
  }

  let body: IncomingPayload;
  try {
    body = (await req.json()) as IncomingPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.submission_id || !body.message) {
    return NextResponse.json({ error: "submission_id és message kötelező" }, { status: 400 });
  }

  // HMAC-aláírt review URL-ek
  const approveUrl = makeReviewLink(body.submission_id, "approve");
  const rejectUrl = makeReviewLink(body.submission_id, "reject");
  const editUrl = `${NEXTAUTH_URL}/admin/lead-magnets/${encodeURIComponent(body.submission_id)}`;

  // Telegram sendMessage hívás
  const telegramResp = await fetch(
    `https://api.telegram.org/bot${HERMES_TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_ID,
        text: body.message,
        parse_mode: body.parse_mode ?? "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Approve", url: approveUrl },
              { text: "✏️ Edit", url: editUrl },
              { text: "❌ Reject", url: rejectUrl },
            ],
          ],
        },
        disable_web_page_preview: true,
      }),
    },
  );

  if (!telegramResp.ok) {
    const detail = await telegramResp.text().catch(() => "");
    console.error(`[telegram-bridge] HTTP ${telegramResp.status} — ${detail}`);
    return NextResponse.json(
      { error: "Telegram sendMessage failed", detail, status: telegramResp.status },
      { status: 502 },
    );
  }

  const json = (await telegramResp.json()) as {
    ok: boolean;
    result?: { message_id: number; chat: { id: number } };
  };

  if (!json.ok || !json.result) {
    return NextResponse.json(
      { error: "Telegram response not ok", json },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message_id: String(json.result.message_id),
    chat_id: String(json.result.chat.id),
  });
}

function makeReviewLink(submissionId: string, action: "approve" | "reject"): string {
  const nonce = Math.floor(Date.now() / 1000).toString(36);
  const payload = `${submissionId}.${action}.${nonce}`;
  const signature = createHmac("sha256", HERMES_REVIEW_LINK_SECRET!)
    .update(payload)
    .digest("hex")
    .slice(0, 32);
  const params = new URLSearchParams({
    id: submissionId,
    action,
    n: nonce,
    t: signature,
  });
  return `${NEXTAUTH_URL}/api/hermes/review-link?${params.toString()}`;
}
