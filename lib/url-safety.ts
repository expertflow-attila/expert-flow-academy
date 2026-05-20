// Open-redirect védelem: csak relatív, same-origin path-okat fogadunk el.
// Bárki user-controlled stringgel jöhet (form mező, querystring) — itt szűrjük.

export function safeInternalPath(input: unknown, fallback = "/learn"): string {
  if (typeof input !== "string") return fallback;
  const v = input.trim();
  if (!v.startsWith("/")) return fallback;       // pl. "https://evil.com" elutasítva
  if (v.startsWith("//")) return fallback;       // protocol-relative URL elutasítva
  if (v.startsWith("/\\")) return fallback;      // backslash kerülő utak
  return v;
}

const ORIGIN_HEADERS = ["origin", "referer"] as const;

export function isSameOriginRequest(req: Request): boolean {
  const expected = process.env.NEXTAUTH_URL;
  if (!expected) return true; // dev — ne blokkoljunk localhoston
  for (const h of ORIGIN_HEADERS) {
    const v = req.headers.get(h);
    if (!v) continue;
    try {
      const url = new URL(v);
      const exp = new URL(expected);
      if (url.origin === exp.origin) return true;
    } catch {
      // bad header — ignore
    }
  }
  return false;
}
