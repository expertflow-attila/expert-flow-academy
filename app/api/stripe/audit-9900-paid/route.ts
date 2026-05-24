// Stripe webhook handler a 9 900 Ft Belépő Audit fizetésekhez (LM8 / LM10 / LM11).
//
// Trigger: Stripe Dashboard → Webhooks → /api/stripe/audit-9900-paid
// Event-ek amikre figyelünk:
//   - checkout.session.completed → fizetés sikeres, létrehozzuk a submission-t
//   - charge.refunded → ha visszafizettünk, megjelöljük
//
// A Stripe Dashboard-on KÉZZEL kell létrehozni:
//   - Product: "9 900 Ft Belépő Audit" → Price 9900 HUF one-time
//   - Product: "9 900 Ft Audit + Bundle" → Price 9900 HUF one-time (LM10 variáns)
//   - Coupon: "AUDIT9900-REDEMPTION" → 9 900 Ft fix-amount off, currency HUF
//   - Az ID-kat .env-be: STRIPE_PRICE_AUDIT_9900, STRIPE_PRICE_AUDIT_BUNDLE_9900,
//     STRIPE_COUPON_AUDIT_REDEMPTION
//   - Webhook endpoint: this route, signing secret → STRIPE_WEBHOOK_SECRET

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { verifyStripeWebhook } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = verifyStripeWebhook({ rawBody, signature });
  } catch (e) {
    console.error("[stripe-webhook/audit-9900] verify failed", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      default:
        // Egyéb eventek: csak loggoljuk, nem hiba
        console.log(`[stripe-webhook/audit-9900] unhandled event ${event.type}`);
    }
  } catch (e) {
    console.error(`[stripe-webhook/audit-9900] handler error for ${event.type}`, e);
    return NextResponse.json({ error: "handler-failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;

  const email = (session.customer_email ?? session.customer_details?.email ?? "").toLowerCase();
  const name =
    String(session.metadata?.name ?? "") ||
    session.customer_details?.name ||
    (email ? email.split("@")[0] : "Ügyfél");
  const variant = (session.metadata?.variant ?? "audit-9900") as
    | "audit-9900"
    | "audit-bundle-9900"
    | "audit-akcio-9900";
  const utmSource = session.metadata?.utm_source ?? null;

  // Idempotencia: ha már létezik a session.id-vel sor, ne dupláznunk be
  const { data: existing } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existing) {
    console.log(`[stripe-webhook/audit-9900] session ${session.id} already processed`);
    return;
  }

  // Insert submission with paid state
  const paidAt = new Date();
  const redemptionEligibleUntil = new Date(paidAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: submission, error: insErr } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .insert({
      lead_magnet_slug: "auditprogram-9900",
      name,
      email,
      marketing_consent: true,
      share_anonymized: true,
      payload: {}, // a payload majd a kérdőív kitöltésekor töltődik
      attila_review_status: "pending",
      paid_at: paidAt.toISOString(),
      payment_amount_huf: session.amount_total ?? 9900,
      stripe_payment_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      stripe_checkout_session_id: session.id,
      redemption_eligible_until: redemptionEligibleUntil.toISOString(),
      utm_source: utmSource,
      lead_source: variant,
    })
    .select("id")
    .single();

  if (insErr || !submission) {
    console.error("[stripe-webhook/audit-9900] insert failed", insErr);
    throw new Error("submission insert failed");
  }

  // Generate a unique access token for the questionnaire
  const accessToken = randomBytes(24).toString("base64url");

  await supabaseAdmin.from("audit_9900_questionnaires").insert({
    submission_id: submission.id,
    access_token: accessToken,
  });

  // Email kiküldése a kérdőív linkkel — a process-pending cron fogja ezt megcsinálni,
  // vagy inline (de itt synchronous, hogy a vásárló azonnal kapjon emailt).
  // Megjegyzés: a koszonom oldal is mutatja a linket. A háttéremail csak biztonsági backup.
  try {
    await sendQuestionnaireLinkEmail({
      to: email,
      name,
      accessToken,
    });
  } catch (e) {
    // Nem blokkoló — a koszonom oldal mutatja a linket
    console.error("[stripe-webhook/audit-9900] questionnaire email send failed", e);
  }

  console.log(`[stripe-webhook/audit-9900] submission created: ${submission.id} for ${email}`);
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!paymentIntentId) return;

  await supabaseAdmin
    .from("lead_magnet_submissions")
    .update({
      attila_review_status: "rejected",
      attila_review_note: `Stripe refund processed at ${new Date().toISOString()} — charge ${charge.id}`,
    })
    .eq("stripe_payment_id", paymentIntentId);

  console.log(`[stripe-webhook/audit-9900] refund processed for payment_intent ${paymentIntentId}`);
}

// ─── Email a kérdőív linkkel ─────────────────────────────────────────────

async function sendQuestionnaireLinkEmail(params: { to: string; name: string; accessToken: string }) {
  const { createTransport } = await import("nodemailer");
  const EMAIL_SERVER = process.env.EMAIL_SERVER;
  const EMAIL_FROM = process.env.EMAIL_FROM ?? "akademia@expertflow.hu";
  if (!EMAIL_SERVER) throw new Error("EMAIL_SERVER nincs beállítva");

  const APP_URL = process.env.NEXTAUTH_URL ?? "https://akademia.expertflow.hu";
  const link = `${APP_URL}/audit-9900/kerdoiv/${params.accessToken}`;

  const transport = createTransport(EMAIL_SERVER as unknown as import("nodemailer/lib/smtp-transport").Options);

  await transport.sendMail({
    to: params.to,
    from: EMAIL_FROM,
    subject: "9 900 Ft fizetve — itt a 12 kérdéses kérdőív",
    text: [
      `Szia ${params.name}!`,
      ``,
      `Megérkezett a 9 900 Ft, köszi.`,
      ``,
      `Most kell kitöltened egy 12 kérdéses kérdőívet — kb. 15 perc.`,
      `Erre építem a 8 oldalas auditodat:`,
      ``,
      link,
      ``,
      `3 munkanapon belül kapod meg a teljes anyagot.`,
      ``,
      `Üdv,`,
      `Attila`,
    ].join("\n"),
    html: `<p>Szia ${params.name}!</p>
<p>Megérkezett a 9 900 Ft, köszi.</p>
<p>Most kell kitöltened egy 12 kérdéses kérdőívet — kb. 15 perc. Erre építem a 8 oldalas auditodat:</p>
<p><a href="${link}" style="display:inline-block;padding:14px 24px;background:#e2e0d8;color:#1a1a1f;text-decoration:none;font-family:monospace;text-transform:uppercase;letter-spacing:0.22em;font-size:11px;">Kérdőív kitöltése →</a></p>
<p>3 munkanapon belül kapod meg a teljes anyagot.</p>
<p>Üdv,<br/>Attila</p>`,
  });
}
