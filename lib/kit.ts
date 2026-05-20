// Kit V4 (ConvertKit) wrapper — minimal: enroll into sequence
// Doc: https://developers.kit.com/v4

const kitKey = process.env.KIT_V4_KEY;
const baseUrl = "https://api.kit.com/v4";

export async function enrollEmailInSequence(
  email: string,
  sequenceId: string | number,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (!kitKey) return { ok: false, error: "KIT_V4_KEY nincs beállítva" };
  if (!sequenceId) return { ok: false, error: "sequenceId hiányzik" };

  const res = await fetch(`${baseUrl}/sequences/${sequenceId}/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": kitKey,
    },
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, error: text };
  }
  return { ok: true, status: res.status };
}
