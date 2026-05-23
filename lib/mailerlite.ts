// MailerLite Connect API — subscriber enroll a Solo Business 41 leveles
// edu newsletter csoportba. A lead magnet form-ról "marketing_consent: true"
// jelzéssel érkezett ügyfelek ide kerülnek be (status: "unconfirmed", DOI).
//
// A teljes newsletter automation a MailerLite UI-on belül van felépítve
// (lásd memory/project_solo_business_newsletter.md).
//
// Group: "Solo Business — Edu Newsletter", id 188014583560013564

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const NEWSLETTER_GROUP_ID = process.env.MAILERLITE_NEWSLETTER_GROUP_ID ?? "188014583560013564";

export type EnrollResult =
  | { ok: true; subscriberId: string }
  | { ok: false; reason: "no-config" | "http-error"; detail?: string };

export async function enrollNewsletterSubscriber(params: {
  email: string;
  name: string;
  source: "lm-ai-mukodesi-terkep" | "lm-ai-folyamatvazlat-48h" | "lm-ugyfelut-audit";
}): Promise<EnrollResult> {
  if (!MAILERLITE_API_KEY) {
    console.warn("[mailerlite] MAILERLITE_API_KEY nincs — enroll kihagyva");
    return { ok: false, reason: "no-config" };
  }

  // MailerLite Connect API: POST /api/subscribers, status "unconfirmed" → DOI trigger
  try {
    const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email: params.email,
        fields: {
          name: params.name,
          source: params.source,
        },
        groups: [NEWSLETTER_GROUP_ID],
        status: "unconfirmed",
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[mailerlite] HTTP ${response.status} — ${detail}`);
      return { ok: false, reason: "http-error", detail };
    }

    const json = (await response.json()) as { data?: { id?: string } };
    if (!json.data?.id) {
      return { ok: false, reason: "http-error", detail: "Nincs subscriber id a válaszban" };
    }
    return { ok: true, subscriberId: json.data.id };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("[mailerlite] fetch hiba", e);
    return { ok: false, reason: "http-error", detail: errMsg };
  }
}
