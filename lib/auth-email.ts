// Brand-elt magic link email — Auth.js sendVerificationRequest override.
// A default Nodemailer template phishing-szerű kék gombbal; itt Solo Business
// dark serif esztétika, ami egyezik az oldalal.

import { createTransport } from "nodemailer";

// Az Auth.js NodemailerConfig.sendVerificationRequest signature-ját követjük.
export async function sendBrandedVerificationRequest(params: {
  identifier: string;
  url: string;
  provider: { server?: unknown; from?: string };
}): Promise<void> {
  const { identifier, url, provider } = params;
  if (!provider.server) {
    throw new Error("EMAIL_SERVER nincs beállítva");
  }
  const { host } = new URL(url);
  const transport = createTransport(provider.server as never);
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: `Belépés a Solo Business Akadémiára`,
    text: textBody({ url, host }),
    html: htmlBody({ url, host }),
  });
  const failed = (result.rejected ?? []).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email rejected: ${failed.join(", ")}`);
  }
}

function textBody({ url, host }: { url: string; host: string }) {
  return [
    `Solo Business Akadémia`,
    ``,
    `Belépéshez kattints a linkre (10 percig érvényes):`,
    url,
    ``,
    `Ha nem te kérted, nyugodtan hagyd figyelmen kívül ezt az emailt.`,
    ``,
    `— ${host}`,
  ].join("\n");
}

// Inline-stílusú HTML — az email kliensek (Gmail, Outlook) nem tölthetnek
// be external CSS-t. oklch nem támogatott emailben, így hex átírások.
function htmlBody({ url, host }: { url: string; host: string }) {
  // Solo Business dark palette — hex átírás
  const bg = "#1a1a1f";              // background (oklch 0.13)
  const surface = "#202025";         // surface
  const fg = "#e2e0d8";              // foreground (oklch 0.90)
  const fgSoft = "#a4a299";          // foreground-soft
  const fgMuted = "#7e7c74";         // foreground-muted
  const border = "#303035";          // border-strong
  const accentSky = "#b9d7e8";       // em-sky
  const accentViolet = "#c8b9e0";    // em-violet

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Solo Business Akadémia — Belépés</title>
</head>
<body style="margin:0;padding:0;background:${bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${fg};-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${bg};">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="max-width:520px;background:${bg};border:1px solid ${border};">
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:1px solid ${border};">
              <div style="font-family:Georgia,serif;font-style:italic;font-size:24px;letter-spacing:-0.01em;color:${fg};">
                Solo Business
              </div>
              <div style="margin-top:8px;font-family:'SF Mono',Menlo,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:${fgMuted};">
                Akadémia · Belépés
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px 16px 32px;">
              <div style="font-family:Georgia,serif;font-size:32px;line-height:1.2;letter-spacing:-0.01em;color:${fg};">
                Ez a te <em style="font-style:italic;color:${accentSky};">belépési linked</em>
              </div>
              <p style="margin:24px 0 0 0;font-size:15px;line-height:1.6;color:${fgSoft};">
                Kattints a lenti gombra és belépsz az akadémiára. A link 10 percig érvényes.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 24px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:${fg};">
                    <a href="${url}" target="_blank" style="display:inline-block;padding:16px 28px;font-family:'SF Mono',Menlo,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:${bg};text-decoration:none;">
                      Belépés &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0 0;font-size:12px;line-height:1.6;color:${fgMuted};word-break:break-all;">
                Ha a gomb nem működik, másold a böngészőbe:<br/>
                <a href="${url}" target="_blank" style="color:${accentViolet};text-decoration:underline;">${url}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:${surface};border-top:1px solid ${border};">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${fgMuted};">
                Ha nem te kérted ezt a linket, nyugodtan hagyd figyelmen kívül — semmi nem történik.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;text-align:center;">
              <div style="font-family:'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:${fgMuted};">
                ${host}
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
