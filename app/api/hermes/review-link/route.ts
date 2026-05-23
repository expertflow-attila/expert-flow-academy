// HMAC-aláírt review link GET handler.
//
// Amikor Attila a Telegram-on rákattint az "Approve" vagy "Reject" gombra,
// a Telegram megnyitja ezt az URL-t a böngészőjében. A token-aláírt query
// alapján verifikáljuk, feldolgozzuk, és visszadirigálunk egy köszönő oldalra.

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendLeadMagnetReport } from "@/lib/lead-magnet-email";
import { enrollNewsletterSubscriber } from "@/lib/mailerlite";

export const runtime = "nodejs";

const HERMES_REVIEW_LINK_SECRET = process.env.HERMES_REVIEW_LINK_SECRET;
const LINK_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 nap

export async function GET(req: Request) {
  if (!HERMES_REVIEW_LINK_SECRET) {
    return new Response("Server config hiányzik", { status: 500 });
  }

  const url = new URL(req.url);
  const submissionId = url.searchParams.get("id");
  const action = url.searchParams.get("action");
  const nonce = url.searchParams.get("n");
  const sig = url.searchParams.get("t");

  if (!submissionId || !action || !nonce || !sig) {
    return errorPage("Hiányzó link-paraméter");
  }
  if (action !== "approve" && action !== "reject") {
    return errorPage(`Érvénytelen művelet: ${action}`);
  }

  // Token verifikáció
  const payload = `${submissionId}.${action}.${nonce}`;
  const expected = createHmac("sha256", HERMES_REVIEW_LINK_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 32);
  if (!constantTimeEqual(expected, sig)) {
    return errorPage("Érvénytelen token");
  }

  // Lejárat
  const nonceTime = parseInt(nonce, 36);
  if (isNaN(nonceTime)) {
    return errorPage("Érvénytelen nonce");
  }
  const ageSeconds = Math.floor(Date.now() / 1000) - nonceTime;
  if (ageSeconds > LINK_MAX_AGE_SECONDS) {
    return errorPage("A link lejárt (7 napos érvényesség)");
  }

  // Submission fetch
  const { data: sub, error: fetchErr } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select(
      "id, lead_magnet_slug, name, email, generated_markdown, attila_review_status, marketing_consent",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (fetchErr || !sub) {
    return errorPage("Submission nem található");
  }
  if (sub.attila_review_status !== "pending") {
    return successPage(
      `Ez a submission már review-elve: ${sub.attila_review_status}.`,
      false,
    );
  }

  if (action === "reject") {
    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        attila_review_status: "rejected",
        attila_reviewed_at: new Date().toISOString(),
        attila_review_note: "Rejected via Telegram URL button",
      })
      .eq("id", submissionId);
    return successPage(`Reject elfogadva — nem küldünk e-mailt ${sub.name as string}-nek.`);
  }

  // Approve
  const slug = sub.lead_magnet_slug as "ai-mukodesi-terkep" | "ai-folyamatvazlat-48h";
  if (slug !== "ai-mukodesi-terkep" && slug !== "ai-folyamatvazlat-48h") {
    return errorPage(`Csak LM1+LM2 review-elhető: ${sub.lead_magnet_slug as string}`);
  }
  const markdown = sub.generated_markdown as string | null;
  if (!markdown) {
    return errorPage("Nincs generált markdown a kiküldéshez");
  }

  try {
    const result = await sendLeadMagnetReport({
      to: sub.email as string,
      name: sub.name as string,
      leadMagnetSlug: slug,
      reportMarkdown: markdown,
    });

    if (sub.marketing_consent) {
      await enrollNewsletterSubscriber({
        email: sub.email as string,
        name: sub.name as string,
        source: slug === "ai-mukodesi-terkep" ? "lm-ai-mukodesi-terkep" : "lm-ai-folyamatvazlat-48h",
      }).catch((e) => console.error("[review-link] MailerLite enroll failed", e));
    }

    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        attila_review_status: "approved",
        attila_reviewed_at: new Date().toISOString(),
        attila_review_note: "Approved via Telegram URL button",
        delivered_at: new Date().toISOString(),
        delivery_provider: "smtp",
        delivery_message_id: result.messageId,
      })
      .eq("id", submissionId);

    return successPage(`Approved — e-mail elment ${sub.email as string}-nek.`);
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        attila_review_status: "approved",
        attila_reviewed_at: new Date().toISOString(),
        delivery_error: errMsg.slice(0, 1000),
      })
      .eq("id", submissionId);
    return errorPage(`Approve regisztrálva, de email-hiba: ${errMsg}`);
  }
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

function successPage(message: string, success = true): Response {
  const color = success ? "#b9a7e0" : "#7e7c74";
  const html = htmlShell(success ? "Kész" : "Már review-elt", message, color);
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function errorPage(message: string): Response {
  const html = htmlShell("Hiba", message, "#d4856e");
  return new Response(html, {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function htmlShell(title: string, message: string, color: string): string {
  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Solo Business — ${title}</title>
  <style>
    body{margin:0;background:#1a1a1f;color:#e2e0d8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{max-width:480px;border:1px solid #303035;background:#1a1a1f;padding:48px 32px;text-align:center}
    .label{font-family:'SF Mono',Menlo,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:#7e7c74;margin-bottom:24px}
    h1{font-family:Georgia,serif;font-style:italic;font-size:28px;margin:0 0 24px 0;color:${color}}
    p{font-size:15px;line-height:1.6;color:#a4a299;margin:0}
    .footer{margin-top:32px;font-family:'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:#7e7c74}
  </style>
</head>
<body>
  <div class="card">
    <div class="label">Solo Business · Hermes Review</div>
    <h1>${title}</h1>
    <p>${escapeHtml(message)}</p>
    <div class="footer">solobusiness.hu</div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
