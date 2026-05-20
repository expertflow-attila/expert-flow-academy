// Defense-in-depth HTML sanitizálás a CMS-szerű mezőkre (course.description,
// lesson.body_html). A tartalom Attila DB-jéből jön, de pasztolhat AI/Skool
// forrásból — egy <script> elég lenne XSS-hez egy authenticated origin-en.
// Egyszerű allow-list, nincs külső függőség.

const VOID_TAGS = new Set([
  "br", "hr", "img",
]);

const ALLOWED_TAGS = new Set([
  "p", "div", "span", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "em", "b", "i", "u", "s", "code", "pre",
  "blockquote", "ul", "ol", "li",
  "a", "img", "figure", "figcaption",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title"]),
};

const URL_PROTOCOL_ALLOWLIST = ["http:", "https:", "mailto:"];

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  // 1. Vágjuk ki teljesen a script/style/iframe/object/embed/template blokkokat
  let s = input.replace(/<(script|style|iframe|object|embed|template|svg|math)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<(script|style|iframe|object|embed|template|svg|math)[^>]*\/?>/gi, "");

  // 2. javascript:, data:, vbscript: URL-ek kiszedése
  s = s.replace(/\s(href|src)\s*=\s*("|')\s*(javascript|data|vbscript)\s*:[^"']*\2/gi, "");

  // 3. on... event handlerek kiszedése
  s = s.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 4. Tag allow-list — bármi ami nem ALLOWED_TAGS-ben, eltávolítva
  s = s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, tag: string, rest: string) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return "";
    const isClose = full.startsWith("</");
    if (isClose) return `</${t}>`;
    const attrs = sanitizeAttrs(t, rest);
    return VOID_TAGS.has(t) ? `<${t}${attrs}/>` : `<${t}${attrs}>`;
  });

  return s;
}

function sanitizeAttrs(tag: string, raw: string): string {
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed) return "";
  const out: string[] = [];
  const re = /([a-zA-Z\-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const name = m[1].toLowerCase();
    const val = m[3] ?? m[4] ?? "";
    if (!allowed.has(name)) continue;
    if ((name === "href" || name === "src") && !isSafeUrl(val)) continue;
    out.push(`${name}="${val.replace(/"/g, "&quot;")}"`);
  }
  // Force rel="noopener noreferrer" on <a target=_blank>
  if (tag === "a" && /target\s*=/.test(raw)) {
    out.push(`rel="noopener noreferrer nofollow"`);
  }
  return out.length ? " " + out.join(" ") : "";
}

function isSafeUrl(value: string): boolean {
  if (!value) return false;
  if (value.startsWith("/") || value.startsWith("#")) return true;
  try {
    const u = new URL(value);
    return URL_PROTOCOL_ALLOWLIST.includes(u.protocol);
  } catch {
    return false;
  }
}
