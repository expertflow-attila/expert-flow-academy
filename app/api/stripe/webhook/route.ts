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

  // Idempotencia — Stripe ugyanazt az event-et ~3 napig retry-olja
  const { error: dedupErr } = await supabaseAdmin
    .from("stripe_events")
    .insert({ event_id: event.id, type: event.type });
  if (dedupErr) {
    // unique constraint violation = már feldolgoztuk → 200 OK no-op
    if ((dedupErr as { code?: string }).code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json(
      { error: `Event dedup hiba: ${dedupErr.message}` },
      { status: 500 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: true, type: event.type });
  }

  const sessionObj = event.data.object as Stripe.Checkout.Session;
  const courseId = (sessionObj.metadata?.course_id as string) ?? null;
  const userIdFromRef =
    (sessionObj.client_reference_id as string | null) ??
    ((sessionObj.metadata?.user_id as string | undefined) ?? null);
  const email = sessionObj.customer_details?.email ?? sessionObj.customer_email ?? null;

  if (!courseId) {
    return NextResponse.json({ error: "Hiányzó course_id" }, { status: 400 });
  }
  if (!userIdFromRef && !email) {
    return NextResponse.json({ error: "Hiányzó user_id és email" }, { status: 400 });
  }

  // Re-verify a course létezik és published — ne fogadjunk el forge-olt course_id-t
  const { data: course, error: cErr } = await supabaseAdmin
    .from("courses")
    .select("id, published")
    .eq("id", courseId)
    .maybeSingle();
  if (cErr || !course || !course.published) {
    return NextResponse.json({ error: "Kurzus nem található vagy nem publikus" }, { status: 404 });
  }

  // User: ha jött client_reference_id, használjuk azt. Különben email-alapú lookup/create.
  const userId = userIdFromRef ?? (email ? await findOrCreateUserByEmail(email) : null);
  if (!userId) {
    return NextResponse.json({ error: "User feloldás sikertelen" }, { status: 500 });
  }

  const { error: mErr } = await supabaseAdmin
    .from("memberships")
    .upsert(
      {
        user_id: userId,
        course_id: course.id,
        stripe_session_id: sessionObj.id,
      },
      { onConflict: "user_id,course_id" },
    );
  if (mErr) {
    return NextResponse.json({ error: `Membership insert hiba: ${mErr.message}` }, { status: 500 });
  }

  if (welcomeSequenceId && email) {
    await enrollEmailInSequence(email, welcomeSequenceId).catch(() => {});
  }

  return NextResponse.json({ ok: true, userId, courseId: course.id });
}

async function findOrCreateUserByEmail(email: string): Promise<string | null> {
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
  if (error) return null;
  return (data.id as string) ?? null;
}
