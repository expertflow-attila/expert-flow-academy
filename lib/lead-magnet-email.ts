// Brand-elt e-mail sablonok a lead magnet kézbesítéshez.
// Két funkció:
//   1. sendLeadMagnetReport — LM1 (AI-működési térkép) és LM2 (AI-folyamatvázlat 48h) deliverable
//   2. sendQualificationDeclined — LM3 (Ügyfélút audit) "too-early" vagy "no-fit" esetén
//
// A HTML stílusrendszer az auth-email.ts-ből származik (Solo Business dark serif).
// inline-stílus minden — Gmail / Outlook nem tölt be külső CSS-t.

import { createTransport } from "nodemailer";

const EMAIL_SERVER = process.env.EMAIL_SERVER;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "akademia@solobusiness.hu";

type SendResult = { messageId: string };

export type LeadMagnetEmailSlug =
  | "ai-mukodesi-terkep"
  | "ai-folyamatvazlat-48h"
  | "48h-ai-gyorsdiagnozis"
  | "kockazatmentes-audit"
  | "mondd-el-egyszer"
  | "auditprogram-9900"
  | "csapat-szerep-terkep"
  | "mini-onboarding-vazlat";

const EMAIL_META: Record<LeadMagnetEmailSlug, { subject: string; previewLine: string; title: string; lead: string }> = {
  "ai-mukodesi-terkep": {
    subject: "A térképed itt — 3 hely, ahol szivárog az időd",
    previewLine: "Megnéztem a 3 válaszodat, és ez rajzolódik ki belőlük.",
    title: "AI-működési térkép",
    lead: "Itt a térképed. 24 óra alatt kellett ránéznem a 3 válaszodra, és valami megfogott bennük.",
  },
  "ai-folyamatvazlat-48h": {
    subject: "A folyamatvázlatod itt — 1 oldal, kézzel rajzolva",
    previewLine: "Olvastam a 6 válaszodat. Itt van, ahogy én rajzolnám fel.",
    title: "AI-folyamatvázlat",
    lead: "Itt a vázlatod. Pár órát töltöttem vele, mert a 4. válaszod alapján döntöttem el a középső blokkot.",
  },
  "48h-ai-gyorsdiagnozis": {
    subject: "A 7 napos akciótervedezed — kezdjük az 1. lépésével",
    previewLine: "5 válaszodból kirajzolódott az 1 dolog ami a 7. napra mérhető lesz.",
    title: "48 órás AI Gyorsdiagnózis",
    lead: "Itt a 7 napos akciótervd. A 8. napra mérni fogod ami most még csak érzés.",
  },
  "kockazatmentes-audit": {
    subject: "A kockázati térképed — 3 lehetséges első lépés",
    previewLine: "7 válaszodból kirajzolódott a 3 lehetséges első lépés kockázati súlyozással.",
    title: "Kockázati térkép",
    lead: "Itt a kockázati térképed. Nem ijesztgetés — pont az ellenkezője. Mit NE csinálj, és mit IGEN.",
  },
  "mondd-el-egyszer": {
    subject: "A rendszered térképe — ahogy én látom",
    previewLine: "Hallgattam a leírásodat, és 4 dolog rajzolódott ki belőle.",
    title: "Mondd el egyszer — rendszer-térkép",
    lead: "Itt a rendszered térképe. NEM ítélkezés — hallgattam mit mondtál, és átfordítottam strukturált formára.",
  },
  "auditprogram-9900": {
    subject: "Az auditod kész — 8 oldal + Loom + Notion",
    previewLine: "Megérkezett a 9 900 Ft, itt van az audit amit a 12 válaszodra építettem.",
    title: "9 900 Ft Belépő Audit",
    lead: "Itt a teljes 8 oldalas auditod. 7 napod van a beszámításra ha a 359k Teljes Auditra továbblépsz.",
  },
  "csapat-szerep-terkep": {
    subject: "A csapat-szerep térképetek",
    previewLine: "3 válaszotokból kirajzolódott a szerep-mátrix + átfedés-pontok.",
    title: "Csapat-szerep térkép",
    lead: "Itt a csapat-szerep térképetek. Mutassátok meg egymásnak — gyakran az első reakció a leghasznosabb.",
  },
  "mini-onboarding-vazlat": {
    subject: "A mini-onboarding vázlatod",
    previewLine: "6 válaszodból kirajzolódott a hibapont az első 7 napban.",
    title: "Mini-onboarding vázlat",
    lead: "Itt a mini-onboarding vázlatod. A leggyakoribb hibapont a 3. napon van — figyeld!",
  },
};

export async function sendLeadMagnetReport(params: {
  to: string;
  name: string;
  leadMagnetSlug: LeadMagnetEmailSlug;
  reportMarkdown: string;
  pdfAttachment?: { filename: string; content: Buffer };
  excalidrawPngAttachment?: { filename: string; content: Buffer };
}): Promise<SendResult> {
  if (!EMAIL_SERVER) {
    throw new Error("EMAIL_SERVER nincs beállítva");
  }

  const meta = EMAIL_META[params.leadMagnetSlug];
  if (!meta) {
    throw new Error(`Nincs email meta a "${params.leadMagnetSlug}" slug-hoz`);
  }
  const isMap = params.leadMagnetSlug === "ai-mukodesi-terkep";

  const transport = createTransport(parseSmtpUrl(EMAIL_SERVER));

  const attachments = [
    ...(params.pdfAttachment
      ? [{ filename: params.pdfAttachment.filename, content: params.pdfAttachment.content }]
      : []),
    ...(params.excalidrawPngAttachment
      ? [{ filename: params.excalidrawPngAttachment.filename, content: params.excalidrawPngAttachment.content }]
      : []),
  ];

  const result = await transport.sendMail({
    to: params.to,
    from: EMAIL_FROM,
    subject: meta.subject,
    text: textBodyV2({ name: params.name, meta, reportMarkdown: params.reportMarkdown }),
    html: htmlBodyV2({ name: params.name, meta, reportMarkdown: params.reportMarkdown, isMap }),
    attachments,
    headers: {
      "X-Solo-LM-Slug": params.leadMagnetSlug,
    },
  });

  const rejected = (result.rejected ?? []).filter(Boolean);
  if (rejected.length) {
    throw new Error(`Email rejected: ${rejected.join(", ")}`);
  }
  return { messageId: result.messageId };
}

// Új V2 body — minden slug-ra meta-driven
function textBodyV2({
  name,
  meta,
  reportMarkdown,
}: {
  name: string;
  meta: { lead: string; title: string };
  reportMarkdown: string;
}): string {
  return [
    `Szia ${name}!`,
    ``,
    meta.lead,
    ``,
    reportMarkdown,
    ``,
    `──────────`,
    ``,
    `Üdv,`,
    `Attila`,
    ``,
    `solobusiness.hu · A 30. napon · ${meta.title}`,
  ].join("\n");
}

function htmlBodyV2({
  name,
  meta,
  reportMarkdown,
  isMap: _isMap,
}: {
  name: string;
  meta: { title: string; lead: string };
  reportMarkdown: string;
  isMap: boolean;
}): string {
  const palette = brandPalette();
  const reportHtml = renderMarkdownLite(reportMarkdown);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Solo Business — ${meta.title}</title>
</head>
<body style="margin:0;padding:0;background:${palette.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${palette.fg};-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${palette.bg};">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:${palette.bg};border:1px solid ${palette.border};">
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:1px solid ${palette.border};">
              <div style="font-family:Georgia,serif;font-style:italic;font-size:24px;letter-spacing:-0.01em;color:${palette.fg};">Solo Business</div>
              <div style="margin-top:8px;font-family:'SF Mono',Menlo,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:${palette.fgMuted};">Lead Magnet · ${escapeHtml(meta.title)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px 0 32px;">
              <div style="font-family:Georgia,serif;font-size:32px;line-height:1.2;letter-spacing:-0.01em;color:${palette.fg};">Szia <em style="font-style:italic;color:${palette.accentViolet};">${escapeHtml(name)}</em>,</div>
              <p style="margin:24px 0 0 0;font-size:15px;line-height:1.6;color:${palette.fgSoft};">${escapeHtml(meta.lead)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <div style="background:${palette.surface};border-left:3px solid ${palette.accentViolet};padding:24px;font-size:14px;line-height:1.65;color:${palette.fgSoft};">
                ${reportHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:${palette.fgSoft};">Üdv,<br/>Attila</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;text-align:center;background:${palette.surface};border-top:1px solid ${palette.border};">
              <div style="font-family:'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:${palette.fgMuted};">solobusiness.hu · A 30. napon · ${escapeHtml(meta.title)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendQualificationDeclined(params: {
  to: string;
  name: string;
  reason: "too-early" | "no-fit";
}): Promise<SendResult> {
  if (!EMAIL_SERVER) {
    throw new Error("EMAIL_SERVER nincs beállítva");
  }

  const transport = createTransport(parseSmtpUrl(EMAIL_SERVER));

  const subject =
    params.reason === "too-early"
      ? "Az ügyfélút auditról — még egy gondolat előtte"
      : "Köszi a jelentkezést — itt egy másik javaslat";

  const body = params.reason === "too-early" ? earlyText(params.name) : noFitText(params.name);
  const html = params.reason === "too-early" ? earlyHtml(params.name) : noFitHtml(params.name);

  const result = await transport.sendMail({
    to: params.to,
    from: EMAIL_FROM,
    subject,
    text: body,
    html,
  });

  const rejected = (result.rejected ?? []).filter(Boolean);
  if (rejected.length) {
    throw new Error(`Email rejected: ${rejected.join(", ")}`);
  }
  return { messageId: result.messageId };
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function parseSmtpUrl(url: string): import("nodemailer/lib/smtp-transport").Options {
  // Nodemailer accepts a URL string directly, but we wrap it for typing.
  return url as unknown as import("nodemailer/lib/smtp-transport").Options;
}

function textBody({ name, isMap, reportMarkdown }: { name: string; isMap: boolean; reportMarkdown: string }): string {
  const lead = isMap
    ? "Itt a térképed. 24 óra alatt kellett ránéznem a 3 válaszodra, és valami megfogott bennük."
    : "Itt a vázlatod. Pár órát töltöttem vele, mert a 4. válaszod alapján kellett eldöntenem a középső blokkot.";

  return [
    `Szia ${name}!`,
    ``,
    lead,
    ``,
    reportMarkdown,
    ``,
    `──────────`,
    ``,
    `Ha tetszett és érdekel, hogyan rakok össze hasonló kis rendszereket —`,
    `anélkül, hogy meg kéne tanulnod AI-eszközöket — itt vagyok a 41 leveles`,
    `Solo Business hírlevélben. Heti 1-2 e-mail. Ha nem érdekel, ezzel is megvagy.`,
    ``,
    `Iratkozz fel: https://solobusiness.hu/hirlevel`,
    ``,
    `Üdv,`,
    `Attila`,
    ``,
    `P.S. — Ha a térkép alapján van olyan kérdésed, amire 2-3 mondatban tudok`,
    `válaszolni, válaszolj erre az e-mailre. Ha többet kérdezel, az már az Akadémia.`,
  ].join("\n");
}

function htmlBody({
  name,
  isMap,
  previewLine,
  reportMarkdown,
}: {
  name: string;
  isMap: boolean;
  previewLine: string;
  reportMarkdown: string;
}): string {
  const palette = brandPalette();
  const title = isMap ? "AI-működési térkép" : "AI-folyamatvázlat";
  const subTitle = isMap ? "A térképed" : "A vázlatod";

  // Markdown → very simple HTML (paragraphs + headings + lists).
  const reportHtml = renderMarkdownLite(reportMarkdown);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Solo Business — ${title}</title>
  <meta name="description" content="${previewLine}" />
</head>
<body style="margin:0;padding:0;background:${palette.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${palette.fg};-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${palette.bg};">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:${palette.bg};border:1px solid ${palette.border};">
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:1px solid ${palette.border};">
              <div style="font-family:Georgia,serif;font-style:italic;font-size:24px;letter-spacing:-0.01em;color:${palette.fg};">
                Solo Business
              </div>
              <div style="margin-top:8px;font-family:'SF Mono',Menlo,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:${palette.fgMuted};">
                Lead Magnet · ${title}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px 0 32px;">
              <div style="font-family:Georgia,serif;font-size:32px;line-height:1.2;letter-spacing:-0.01em;color:${palette.fg};">
                Szia <em style="font-style:italic;color:${palette.accentViolet};">${name}</em>,
              </div>
              <p style="margin:24px 0 0 0;font-size:15px;line-height:1.6;color:${palette.fgSoft};">
                ${isMap
                  ? "Itt a térképed. 24 óra alatt kellett ránéznem a 3 válaszodra, és valami megfogott bennük."
                  : "Itt a vázlatod. Pár órát töltöttem vele, mert a 4. válaszod alapján döntöttem el a középső blokkot."}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <div style="background:${palette.surface};border-left:3px solid ${palette.accentViolet};padding:24px;font-size:14px;line-height:1.65;color:${palette.fgSoft};">
                ${reportHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:${palette.fgSoft};">
                Ha tetszett és érdekel, hogyan rakok össze hasonló kis rendszereket — anélkül, hogy meg kéne tanulnod AI-eszközöket — itt vagyok a 41 leveles ingyenes hírlevelemben.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:${palette.fg};">
                    <a href="https://solobusiness.hu/hirlevel" target="_blank" style="display:inline-block;padding:14px 24px;font-family:'SF Mono',Menlo,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:${palette.bg};text-decoration:none;">
                      Iratkozz fel a hírlevélre &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:${palette.surface};border-top:1px solid ${palette.border};">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${palette.fgMuted};">
                <strong style="color:${palette.fgSoft};">P.S.</strong> — Ha ${subTitle.toLowerCase()} alapján van olyan kérdésed, amire 2-3 mondatban tudok válaszolni, válaszolj erre az e-mailre. Ha többet kérdezel, az már az Akadémia.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;text-align:center;">
              <div style="font-family:'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:${palette.fgMuted};">
                solobusiness.hu · A 30. napon készült
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function earlyText(name: string): string {
  return [
    `Szia ${name}!`,
    ``,
    `Foglaltál egy ügyfélút auditot, de a válaszaid alapján úgy érzem,`,
    `most még egy ingyenes ráhangolódás többet ér neked, mint egy 20 perces hívás.`,
    ``,
    `Az audit akkor működik igazán, ha már havi 3+ érdeklődőd van, és érzed,`,
    `hogy a kezelésüket lehetne tisztábbra rakni. Ha most még az érdeklődő-szám`,
    `építése a fő feladat, az Akadémia és a hírlevél többet ad.`,
    ``,
    `Mit javaslok először:`,
    ``,
    `1. Iratkozz fel az ingyenes 41 leveles hírlevélre — heti 1-2 e-mail,`,
    `   fél év alatt minden alappillér: solobusiness.hu/hirlevel`,
    ``,
    `2. Ha 2-3 hónap múlva többen találnak meg, foglalj akkor auditot.`,
    `   Addig én is fejlődöm ezen a vonalon.`,
    ``,
    `Üdv,`,
    `Attila`,
  ].join("\n");
}

function noFitText(name: string): string {
  return [
    `Szia ${name}!`,
    ``,
    `Köszi a jelentkezést az ügyfélút auditra. A válaszaid alapján úgy érzem,`,
    `az audit-keret most nem a legjobb illeszkedés — vagy mert a vállalkozásod`,
    `mérete már túlmutat azon, amit én 20 percben hozzá tudok adni, vagy mert`,
    `a fókuszod most másfelé húz.`,
    ``,
    `Két másik dolgot tudok javasolni:`,
    ``,
    `1. Ha érdekel a Solo Business szemlélet — heti 1-2 e-mail a 41 leveles`,
    `   ingyenes hírlevélen: solobusiness.hu/hirlevel`,
    ``,
    `2. Ha komolyabb beavatkozás kell — 14 napos sprint csomag 199-599 ezer`,
    `   Ft-tól: itt foglalhatsz egy felfedező hívást: solobusiness.hu/sprint`,
    ``,
    `Üdv,`,
    `Attila`,
  ].join("\n");
}

function earlyHtml(name: string): string {
  return baseDeclineHtml({
    name,
    title: "Mégegy gondolat az auditról",
    body:
      "Foglaltál egy ügyfélút auditot, de a válaszaid alapján úgy érzem, most még egy ingyenes ráhangolódás többet ér neked. Az audit akkor működik igazán, ha már havi 3+ érdeklődőd van. Ha most még az érdeklődő-szám építése a fő feladat, az Akadémia és a hírlevél többet ad.",
    ctaLabel: "Iratkozz fel a hírlevélre",
    ctaHref: "https://solobusiness.hu/hirlevel",
  });
}

function noFitHtml(name: string): string {
  return baseDeclineHtml({
    name,
    title: "Egy másik irány",
    body:
      "Köszi a jelentkezést. A válaszaid alapján az audit-keret most nem a legjobb illeszkedés. Két másik dolgot tudok javasolni: ha érdekel a Solo Business szemlélet, csatlakozz a hírlevélhez. Ha komolyabb beavatkozás kell, foglalj egy sprint felfedező hívást.",
    ctaLabel: "Foglalj sprint felfedező hívást",
    ctaHref: "https://solobusiness.hu/sprint",
  });
}

function baseDeclineHtml({
  name,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  name: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}): string {
  const p = brandPalette();
  return `<!DOCTYPE html>
<html lang="hu"><head><meta charset="utf-8" /><title>Solo Business — ${title}</title></head>
<body style="margin:0;padding:0;background:${p.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${p.fg};">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${p.bg};">
  <tr><td align="center" style="padding:48px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="max-width:520px;background:${p.bg};border:1px solid ${p.border};">
      <tr><td style="padding:32px;border-bottom:1px solid ${p.border};">
        <div style="font-family:Georgia,serif;font-style:italic;font-size:24px;color:${p.fg};">Solo Business</div>
      </td></tr>
      <tr><td style="padding:32px;">
        <div style="font-family:Georgia,serif;font-size:28px;color:${p.fg};">Szia <em style="color:${p.accentViolet};">${name}</em>,</div>
        <p style="margin:24px 0 0 0;font-size:15px;line-height:1.65;color:${p.fgSoft};">${body}</p>
        <div style="margin-top:32px;background:${p.fg};display:inline-block;">
          <a href="${ctaHref}" target="_blank" style="display:inline-block;padding:14px 24px;font-family:'SF Mono',Menlo,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:${p.bg};text-decoration:none;">${ctaLabel} &rarr;</a>
        </div>
      </td></tr>
      <tr><td style="padding:16px 32px;text-align:center;background:${p.surface};">
        <div style="font-family:'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:${p.fgMuted};">solobusiness.hu · A 30. napon</div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function brandPalette() {
  return {
    bg: "#1a1a1f",
    surface: "#202025",
    fg: "#e2e0d8",
    fgSoft: "#a4a299",
    fgMuted: "#7e7c74",
    border: "#303035",
    accentViolet: "#c8b9e0",
    accentSky: "#b9d7e8",
  };
}

// Minimal markdown renderer for the email body (no external deps).
// Supports: # H1, ## H2, ### H3, paragraphs, **bold**, *italic*, lists, blockquotes.
function renderMarkdownLite(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      out.push(`<h2 style="font-family:Georgia,serif;font-size:20px;color:#e2e0d8;margin:24px 0 12px 0;">${escapeHtml(line.slice(2))}</h2>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      out.push(`<h3 style="font-family:Georgia,serif;font-style:italic;font-size:17px;color:#c8b9e0;margin:20px 0 8px 0;">${escapeHtml(line.slice(3))}</h3>`);
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      out.push(`<h4 style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#a4a299;margin:16px 0 6px 0;">${escapeHtml(line.slice(4))}</h4>`);
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      if (!inList) {
        out.push(`<ul style="margin:8px 0 8px 20px;padding:0;color:#a4a299;font-size:14px;line-height:1.6;">`);
        inList = true;
      }
      out.push(`<li>${inlineFormat(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (line.startsWith("> ")) {
      flushList();
      out.push(`<blockquote style="margin:12px 0;padding:8px 16px;border-left:2px solid #c8b9e0;color:#a4a299;font-style:italic;">${inlineFormat(line.slice(2))}</blockquote>`);
      continue;
    }
    flushList();
    out.push(`<p style="margin:8px 0;color:#a4a299;font-size:14px;line-height:1.65;">${inlineFormat(line)}</p>`);
  }
  flushList();
  return out.join("\n");
}

function inlineFormat(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e2e0d8;">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="font-style:italic;color:#c8b9e0;">$1</em>');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Sequence emails (Wave 5+ utánkövetők) ─────────────────────────────

import { CTA_URLS, getStep, type SequenceSlug } from "./lm-email-sequences";

export async function sendSequenceEmail(params: {
  to: string;
  name: string;
  slug: SequenceSlug;
  step: number;
  ctaUrlWithLead?: string; // ha AJANLAT_URL_WITH_LEAD CTA-t használ, ide jön a lead_id-vel kiegészített link
}): Promise<SendResult> {
  if (!EMAIL_SERVER) throw new Error("EMAIL_SERVER nincs beállítva");

  const step = getStep(params.slug, params.step);
  if (!step) throw new Error(`Nincs ${params.slug} sequence ${params.step}. lépés`);

  // {name} placeholder csere
  const bodyText = step.body.replace(/\{name\}/g, params.name);
  const ctaHref = step.ctaUrlEnv
    ? step.ctaUrlEnv === "AJANLAT_URL_WITH_LEAD" && params.ctaUrlWithLead
      ? params.ctaUrlWithLead
      : CTA_URLS[step.ctaUrlEnv]
    : null;

  const transport = createTransport(parseSmtpUrl(EMAIL_SERVER));

  const result = await transport.sendMail({
    to: params.to,
    from: EMAIL_FROM,
    subject: step.subject,
    text: textForSequence({ bodyText, ctaLabel: step.ctaLabel, ctaHref }),
    html: htmlForSequence({ name: params.name, bodyText, ctaLabel: step.ctaLabel, ctaHref }),
    headers: {
      "X-Solo-Sequence-Slug": params.slug,
      "X-Solo-Sequence-Step": String(params.step),
    },
  });

  const rejected = (result.rejected ?? []).filter(Boolean);
  if (rejected.length) throw new Error(`Email rejected: ${rejected.join(", ")}`);
  return { messageId: result.messageId };
}

function textForSequence({
  bodyText,
  ctaLabel,
  ctaHref,
}: {
  bodyText: string;
  ctaLabel?: string;
  ctaHref: string | null;
}): string {
  const lines = [bodyText.trim(), ""];
  if (ctaLabel && ctaHref) {
    lines.push("");
    lines.push(`${ctaLabel}: ${ctaHref}`);
    lines.push("");
  }
  lines.push("──────────");
  lines.push("solobusiness.hu · A 30. napon · Leiratkozás: hello@solobusiness.hu");
  return lines.join("\n");
}

function htmlForSequence({
  name,
  bodyText,
  ctaLabel,
  ctaHref,
}: {
  name: string;
  bodyText: string;
  ctaLabel?: string;
  ctaHref: string | null;
}): string {
  void name;
  const p = brandPalette();

  // A body sorokra bontjuk, üres sor = bekezdés-tagolás
  const paragraphs: string[] = [];
  let buf: string[] = [];
  for (const raw of bodyText.split(/\r?\n/)) {
    if (!raw.trim()) {
      if (buf.length) {
        paragraphs.push(buf.join(" "));
        buf = [];
      }
    } else {
      buf.push(raw.trim());
    }
  }
  if (buf.length) paragraphs.push(buf.join(" "));

  const paragraphHtml = paragraphs
    .map(
      (par) =>
        `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:${p.fgSoft};">${inlineFormat(par)}</p>`,
    )
    .join("");

  const ctaHtml =
    ctaLabel && ctaHref
      ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;"><tr><td style="background:${p.fg};"><a href="${ctaHref}" target="_blank" style="display:inline-block;padding:14px 24px;font-family:'SF Mono',Menlo,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:${p.bg};text-decoration:none;">${escapeHtml(ctaLabel)} &rarr;</a></td></tr></table>`
      : "";

  return `<!DOCTYPE html>
<html lang="hu"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${p.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${p.fg};-webkit-font-smoothing:antialiased;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${p.bg};">
  <tr><td align="center" style="padding:48px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;background:${p.bg};border:1px solid ${p.border};">
      <tr><td style="padding:32px 32px 24px 32px;border-bottom:1px solid ${p.border};">
        <div style="font-family:Georgia,serif;font-style:italic;font-size:22px;color:${p.fg};">Solo Business</div>
        <div style="margin-top:6px;font-family:'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:${p.fgMuted};">A 30. napon</div>
      </td></tr>
      <tr><td style="padding:32px 32px 16px 32px;">
        ${paragraphHtml}
        ${ctaHtml}
      </td></tr>
      <tr><td style="padding:16px 32px;background:${p.surface};border-top:1px solid ${p.border};">
        <p style="margin:0;font-family:'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:${p.fgMuted};">
          solobusiness.hu · Leiratkozás: <a href="mailto:hello@solobusiness.hu?subject=Leiratkozás" style="color:${p.fgMuted};">hello@solobusiness.hu</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
