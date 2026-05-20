// Egyszerű sliding-window throttling Supabase-ben — nem szükséges Redis.
// Kulcsonként (IP / email) max N esemény egy ablakon belül.
// A `login_attempts` tábla service_role-only RLS-szel védve.

import { supabaseAdmin } from "./supabase-admin";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetIn: number; // másodperc
};

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  const { data: existing } = await supabaseAdmin
    .from("login_attempts")
    .select("count, window_started_at")
    .eq("key", key)
    .maybeSingle();

  if (existing && new Date(existing.window_started_at as string) > windowStart) {
    // még az ablakon belül vagyunk
    const newCount = (existing.count as number) + 1;
    await supabaseAdmin
      .from("login_attempts")
      .update({ count: newCount, last_at: now.toISOString() })
      .eq("key", key);
    const allowed = newCount <= limit;
    const resetIn = Math.max(
      0,
      windowSeconds -
        Math.floor((now.getTime() - new Date(existing.window_started_at as string).getTime()) / 1000),
    );
    return { allowed, remaining: Math.max(0, limit - newCount), resetIn };
  }

  // új ablak nyitása
  await supabaseAdmin
    .from("login_attempts")
    .upsert(
      {
        key,
        count: 1,
        window_started_at: now.toISOString(),
        last_at: now.toISOString(),
      },
      { onConflict: "key" },
    );
  return { allowed: true, remaining: limit - 1, resetIn: windowSeconds };
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
