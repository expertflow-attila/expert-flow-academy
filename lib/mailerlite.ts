// MailerLite Connect API — subscriber enroll a Solo Business 41 leveles
// edu newsletter csoportba + per-LM csoportba (Wave 5+ kiterjesztés).
//
// Wave 4: csak a 41-leveles newsletter csoport (188014583560013564).
// Wave 5+: minden LM-nek saját csoport, és az ügyfél MINDKETTŐBE bekerül.
// Ez azért fontos, mert a 41-leveles edukáció független az LM-specifikus
// utánkövetéstől.
//
// Status: "unconfirmed" → DOI confirmation a meglevő MailerLite UI workflow szerint.

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const NEWSLETTER_GROUP_ID = process.env.MAILERLITE_NEWSLETTER_GROUP_ID ?? "188014583560013564";

// Per-LM group ID-k (létrehozva 2026-05-24 MailerLite Connect API-val)
const LM_GROUP_IDS: Record<EnrollSource, string | null> = {
  "lm-ai-mukodesi-terkep": "188278631494059233",
  "lm-ai-folyamatvazlat-48h": "188278631752009015",
  "lm-ugyfelut-audit": null, // LM3 too-early → csak a 41-leveles
  "lm-48h-ai-gyorsdiagnozis": "188340353953171086",
  "lm-kockazatmentes-audit": "188340354113603220",
  "lm-mondd-el-egyszer": "188340353787496071",
  "lm-ai-rendszer-giveaway-q3": "188340354309686946",
  "lm-auditprogram-9900": "188340354477459128",
  "lm-csapat-szerep-terkep": "188340354636842684",
  "lm-mini-onboarding-vazlat": "188340354800420546",
  "lm-operations-erettsegi-audit": "188340354962949869",
  "lm-pilot-rendszer-blueprint": "188340355140159254",
};

export type EnrollSource =
  | "lm-ai-mukodesi-terkep"
  | "lm-ai-folyamatvazlat-48h"
  | "lm-ugyfelut-audit"
  | "lm-48h-ai-gyorsdiagnozis"
  | "lm-kockazatmentes-audit"
  | "lm-mondd-el-egyszer"
  | "lm-ai-rendszer-giveaway-q3"
  | "lm-auditprogram-9900"
  | "lm-csapat-szerep-terkep"
  | "lm-mini-onboarding-vazlat"
  | "lm-operations-erettsegi-audit"
  | "lm-pilot-rendszer-blueprint";

export type EnrollResult =
  | { ok: true; subscriberId: string; groups: string[] }
  | { ok: false; reason: "no-config" | "http-error"; detail?: string };

export async function enrollNewsletterSubscriber(params: {
  email: string;
  name: string;
  source: EnrollSource;
}): Promise<EnrollResult> {
  if (!MAILERLITE_API_KEY) {
    console.warn("[mailerlite] MAILERLITE_API_KEY nincs — enroll kihagyva");
    return { ok: false, reason: "no-config" };
  }

  // Az ügyfél MINDIG bekerül a 41-leveles newsletterbe + ha van LM-specifikus csoport, abba is.
  const lmGroupId = LM_GROUP_IDS[params.source] ?? null;
  const groups = lmGroupId ? [NEWSLETTER_GROUP_ID, lmGroupId] : [NEWSLETTER_GROUP_ID];

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
        groups,
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
    return { ok: true, subscriberId: json.data.id, groups };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("[mailerlite] fetch hiba", e);
    return { ok: false, reason: "http-error", detail: errMsg };
  }
}
