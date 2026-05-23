// Hermes review webhook.
//
// A Hermes (hostinger VPS) ezt hívja meg, amikor Attila a Telegram-on
// approve / edit / reject gombra kattint a lead magnet review értesítésnél.
//
// Auth: HMAC-SHA256 a `HERMES_NOTIFY_SECRET`-tel a raw body-n, header: x-hermes-signature.
//
// Body schema:
//   {
//     submission_id: string,
//     action: "approve" | "edit" | "reject",
//     edited_markdown?: string,   // only when action === "edit"
//     note?: string                // optional admin note
//   }
//
// Approve / edit esetén közvetlenül kiküldjük az emailt (Brevo / Resend / MailerLite).

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyHermesSignature } from "@/lib/hermes-notifier";
import { sendLeadMagnetReport } from "@/lib/lead-magnet-email";
import { enrollNewsletterSubscriber } from "@/lib/mailerlite";

export const runtime = "nodejs";

type ReviewBody = {
  submission_id: string;
  action: "approve" | "edit" | "reject";
  edited_markdown?: string;
  note?: string;
};

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-hermes-signature");
  if (!verifyHermesSignature(raw, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: ReviewBody;
  try {
    body = JSON.parse(raw) as ReviewBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.submission_id || !body.action) {
    return NextResponse.json({ error: "submission_id és action kötelező" }, { status: 400 });
  }
  if (!["approve", "edit", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data: sub, error: fetchErr } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, lead_magnet_slug, name, email, generated_markdown, attila_review_status, marketing_consent")
    .eq("id", body.submission_id)
    .maybeSingle();

  if (fetchErr || !sub) {
    return NextResponse.json({ error: "Submission nem található" }, { status: 404 });
  }

  if (sub.attila_review_status !== "pending") {
    return NextResponse.json(
      { error: `Submission már review-elve: ${sub.attila_review_status}` },
      { status: 409 },
    );
  }

  if (body.action === "reject") {
    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        attila_review_status: "rejected",
        attila_reviewed_at: new Date().toISOString(),
        attila_review_note: body.note ?? null,
      })
      .eq("id", body.submission_id);
    return NextResponse.json({ ok: true, action: "rejected" });
  }

  // approve / edit → kiküldjük az emailt
  const slug = sub.lead_magnet_slug as "ai-mukodesi-terkep" | "ai-folyamatvazlat-48h";
  if (slug !== "ai-mukodesi-terkep" && slug !== "ai-folyamatvazlat-48h") {
    return NextResponse.json(
      { error: "Csak LM1 és LM2 submission-eket lehet review-elni" },
      { status: 400 },
    );
  }

  const finalMarkdown =
    body.action === "edit" && body.edited_markdown ? body.edited_markdown : (sub.generated_markdown as string);

  if (!finalMarkdown) {
    return NextResponse.json({ error: "Nincs markdown a kiküldéshez" }, { status: 400 });
  }

  try {
    const result = await sendLeadMagnetReport({
      to: sub.email as string,
      name: sub.name as string,
      leadMagnetSlug: slug,
      reportMarkdown: finalMarkdown,
    });

    // Enroll a 41 leveles hírlevélbe ha consent — nem kritikus path
    if (sub.marketing_consent) {
      await enrollNewsletterSubscriber({
        email: sub.email as string,
        name: sub.name as string,
        source: slug === "ai-mukodesi-terkep" ? "lm-ai-mukodesi-terkep" : "lm-ai-folyamatvazlat-48h",
      }).catch((e) => console.error(`[hermes-review] MailerLite enroll failed for ${sub.id}`, e));
    }

    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        attila_review_status: body.action === "edit" ? "edited" : "approved",
        attila_reviewed_at: new Date().toISOString(),
        attila_edits: body.action === "edit" ? finalMarkdown : null,
        attila_review_note: body.note ?? null,
        delivered_at: new Date().toISOString(),
        delivery_provider: "smtp",
        delivery_message_id: result.messageId,
      })
      .eq("id", body.submission_id);

    return NextResponse.json({ ok: true, action: body.action, messageId: result.messageId });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        attila_review_status: body.action === "edit" ? "edited" : "approved",
        attila_reviewed_at: new Date().toISOString(),
        attila_edits: body.action === "edit" ? finalMarkdown : null,
        delivery_error: errMsg.slice(0, 1000),
      })
      .eq("id", body.submission_id);

    return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
  }
}
