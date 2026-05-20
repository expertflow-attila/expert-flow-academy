import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { enrollEmailInSequence } from "@/lib/kit";

export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const welcomeSequenceId = process.env.COURSE_WELCOME_SEQUENCE_ID;

export async function POST(req: Request) {
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET nincs beállítva" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Hiányzik a signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verify hiba: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: true, type: event.type });
  }

  const sessionObj = event.data.object as Stripe.Checkout.Session;
  const courseId = (sessionObj.metadata?.course_id as string) ?? null;
  const email = sessionObj.customer_details?.email ?? sessionObj.customer_email ?? null;

  if (!courseId || !email) {
    return NextResponse.json(
      { error: "Hiányzó course_id vagy email a session-ből" },
      { status: 400 },
    );
  }

  // 1. Find or create the user in next_auth schema
  const userId = await findOrCreateUser(email);

  // 2. Insert membership (idempotent on the unique constraint)
  const { error: mErr } = await supabaseAdmin
    .from("memberships")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        stripe_session_id: sessionObj.id,
      },
      { onConflict: "user_id,course_id" },
    );
  if (mErr) {
    return NextResponse.json({ error: `Membership insert hiba: ${mErr.message}` }, { status: 500 });
  }

  // 3. Kit V4 sequence enroll (best effort)
  if (welcomeSequenceId) {
    await enrollEmailInSequence(email, welcomeSequenceId).catch(() => {});
  }

  return NextResponse.json({ ok: true, userId, courseId });
}

async function findOrCreateUser(email: string): Promise<string> {
  const client = supabaseAdmin.schema("next_auth");
  const { data: existing } = await client
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data, error } = await client
    .from("users")
    .insert({ email, emailVerified: new Date().toISOString() })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}
