// Cal.com webhook receiver — Ügyfélút audit foglalás.
//
// A Cal.com a "BOOKING_CREATED" / "BOOKING_CANCELLED" / "BOOKING_RESCHEDULED"
// event-eket POST-olja ide HMAC-aláírással (X-Cal-Signature-256).
//
// A foglalás `metadata.submission_id` field-jét a `/lead-magnet/ugyfelut-audit`
// form rakta bele, amikor átirányította a usert a Cal.com URL-re.
//
// Feladat:
//   1. HMAC verifikáció
//   2. submission_id alapján megkeressük a Supabase-ben a kvalifikált sort
//   3. cal_booking_id kitöltjük + Hermes Telegram értesítés Attilának
//   4. CANCELLATION esetén: clear cal_booking_id, és releasel-jük a heti slot-ot

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type CalBookingPayload = {
  triggerEvent: "BOOKING_CREATED" | "BOOKING_CANCELLED" | "BOOKING_RESCHEDULED";
  payload: {
    uid: string;
    title: string;
    startTime: string;
    endTime: string;
    attendees: Array<{ email: string; name: string; timeZone?: string }>;
    metadata?: Record<string, string>;
    organizer?: { email: string; name: string };
  };
};

const CAL_WEBHOOK_SECRET = process.env.CAL_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-cal-signature-256");

  if (!verifyCalSignature(raw, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: CalBookingPayload;
  try {
    body = JSON.parse(raw) as CalBookingPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const submissionId = body.payload.metadata?.submission_id;
  if (!submissionId) {
    // Nincs hozzákötött submission — figyelmen kívül hagyjuk, nem hiba
    return NextResponse.json({ ok: true, note: "no submission_id, skipped" });
  }

  if (body.triggerEvent === "BOOKING_CREATED" || body.triggerEvent === "BOOKING_RESCHEDULED") {
    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        cal_booking_id: body.payload.uid,
        attila_review_note: `Cal.com ${body.triggerEvent}: ${body.payload.startTime}`,
      })
      .eq("id", submissionId)
      .eq("lead_magnet_slug", "ugyfelut-audit");

    // Hermes notify a foglalásról (fire-and-forget)
    notifyHermesAuditBooking({
      submissionId,
      bookingId: body.payload.uid,
      startTime: body.payload.startTime,
      attendeeName: body.payload.attendees[0]?.name ?? "ismeretlen",
      attendeeEmail: body.payload.attendees[0]?.email ?? "",
      eventType: body.triggerEvent,
    }).catch((e) => console.error("[cal-webhook] Hermes notify failed", e));

    return NextResponse.json({ ok: true, action: body.triggerEvent });
  }

  if (body.triggerEvent === "BOOKING_CANCELLED") {
    // A heti slot felszabadul — a `qualification_result`-et átírjuk
    // "cancelled"-re, hogy a heti cap számolás ne tartalmazza
    await supabaseAdmin
      .from("lead_magnet_submissions")
      .update({
        qualification_result: "no-fit",
        cal_booking_id: null,
        attila_review_note: `Cal.com lemondás: ${body.payload.startTime}`,
      })
      .eq("id", submissionId)
      .eq("lead_magnet_slug", "ugyfelut-audit");

    return NextResponse.json({ ok: true, action: "cancelled" });
  }

  return NextResponse.json({ ok: true, note: "unknown event, skipped" });
}

function verifyCalSignature(raw: string, sig: string | null): boolean {
  if (!CAL_WEBHOOK_SECRET || !sig) return false;
  const expected = createHmac("sha256", CAL_WEBHOOK_SECRET).update(raw).digest("hex");
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}

async function notifyHermesAuditBooking(params: {
  submissionId: string;
  bookingId: string;
  startTime: string;
  attendeeName: string;
  attendeeEmail: string;
  eventType: string;
}): Promise<void> {
  const HERMES_NOTIFY_URL = process.env.HERMES_NOTIFY_URL;
  const HERMES_NOTIFY_SECRET = process.env.HERMES_NOTIFY_SECRET;
  if (!HERMES_NOTIFY_URL || !HERMES_NOTIFY_SECRET) return;

  const message = [
    `📞 *Új ügyfélút audit foglalás*`,
    ``,
    `*Név:* ${params.attendeeName}`,
    `*Email:* ${params.attendeeEmail}`,
    `*Időpont:* ${new Date(params.startTime).toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })}`,
    `*Esemény:* ${params.eventType}`,
    `*Booking id:* ${params.bookingId}`,
  ].join("\n");

  await fetch(HERMES_NOTIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HERMES_NOTIFY_SECRET}`,
    },
    body: JSON.stringify({
      agent: "reception",
      topic: "audit-booking",
      submission_id: params.submissionId,
      title: "Új ügyfélút audit foglalás",
      message,
      parse_mode: "Markdown",
      actions: [],
    }),
  });
}
