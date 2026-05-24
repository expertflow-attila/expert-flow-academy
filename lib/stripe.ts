// Stripe wrapper a Expert Flow fizetős lead magnetekhez (LM8 / LM10 / LM11).
//
// Funkciók:
//  - stripe — singleton client
//  - createAudit9900CheckoutSession — Stripe Checkout session a 9 900 Ft auditra
//  - verifyStripeWebhook — webhook aláírás-ellenőrzés
//
// MEGJEGYZÉS: a Stripe Coupon-t és Product/Price-t kézzel kell létrehozni a Stripe
// Dashboardon — a Product/Price ID-kat az env változókba kell tenni:
//
//   STRIPE_SECRET_KEY=sk_live_...
//   STRIPE_WEBHOOK_SECRET=whsec_...
//   STRIPE_PRICE_AUDIT_9900=price_...          (9 900 Ft, one-time payment)
//   STRIPE_PRICE_AUDIT_BUNDLE_9900=price_...    (LM10 — ugyanaz az ár, más metadata)
//   STRIPE_COUPON_AUDIT_REDEMPTION=coupon_...    (9 900 Ft off, only on 359k product)
//   STRIPE_PRICE_TELJES_AUDIT_359K=price_...     (a beszámítás célja)
//
// A kuponra szigorú feltétel: csak a 359k-os ügyfél tudja használni, és csak
// egyszer. A kupon eligible_until timestamp-ot a Supabase tárolja (NEM a Stripe).

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("STRIPE_SECRET_KEY kötelező");

export const stripe = new Stripe(key, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

const PRICE_AUDIT_9900 = process.env.STRIPE_PRICE_AUDIT_9900;
const PRICE_AUDIT_BUNDLE_9900 = process.env.STRIPE_PRICE_AUDIT_BUNDLE_9900;
const APP_URL = process.env.NEXTAUTH_URL ?? "https://akademia.expertflow.hu";

export type AuditCheckoutVariant = "audit-9900" | "audit-bundle-9900" | "audit-akcio-9900";

export async function createAudit9900CheckoutSession(params: {
  variant: AuditCheckoutVariant;
  email?: string;
  name?: string;
  utmSource?: string;
}): Promise<{ url: string; sessionId: string }> {
  const priceId = params.variant === "audit-bundle-9900" ? PRICE_AUDIT_BUNDLE_9900 : PRICE_AUDIT_9900;
  if (!priceId) {
    throw new Error(
      `Stripe Price ID nincs konfigurálva a "${params.variant}" variánsra (STRIPE_PRICE_AUDIT_9900 vagy STRIPE_PRICE_AUDIT_BUNDLE_9900).`,
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: params.email,
    success_url: `${APP_URL}/audit-9900/koszonom?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/audit-9900?canceled=1`,
    metadata: {
      variant: params.variant,
      name: params.name ?? "",
      utm_source: params.utmSource ?? "",
    },
    payment_intent_data: {
      metadata: {
        variant: params.variant,
      },
    },
    locale: "hu",
    billing_address_collection: "auto",
    allow_promotion_codes: false,
  });

  if (!session.url) throw new Error("Stripe Checkout session URL hiányzik");
  return { url: session.url, sessionId: session.id };
}

// ─── Webhook verifikáció ────────────────────────────────────────────────

export function verifyStripeWebhook(args: { rawBody: string; signature: string }): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET nincs beállítva");
  return stripe.webhooks.constructEvent(args.rawBody, args.signature, secret);
}

// ─── Beszámítási kupon kezelés ──────────────────────────────────────────

// A 359k vásárláshoz a 9 900 Ft beszámításra egy Stripe Promotion Code-ot
// generálunk, ami csak az adott customer-re érvényes és csak egyszer.
export async function generateRedemptionCode(args: {
  submissionId: string;
  customerEmail: string;
  eligibleUntil: Date;
}): Promise<{ code: string }> {
  const couponId = process.env.STRIPE_COUPON_AUDIT_REDEMPTION;
  if (!couponId) {
    throw new Error("STRIPE_COUPON_AUDIT_REDEMPTION nincs beállítva — hozz létre egy 9 900 Ft fix-amount coupont");
  }

  // Egyedi promotion code submission_id-ből
  const code = `AUDIT9900-${args.submissionId.slice(0, 8).toUpperCase()}`;

  await stripe.promotionCodes.create({
    coupon: couponId,
    code,
    max_redemptions: 1,
    expires_at: Math.floor(args.eligibleUntil.getTime() / 1000),
    customer: undefined, // bárki használhatja akinek elküldjük a kódot, de max_redemptions=1
    metadata: {
      submission_id: args.submissionId,
      customer_email: args.customerEmail,
    },
  });

  return { code };
}
