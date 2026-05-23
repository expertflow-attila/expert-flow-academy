// PDF / dokumentum rendering a Solo Business audit kézbesítéshez.
//
// Megközelítés: NEM Puppeteer (Vercel-en bonyolult), HANEM tokenes nyilvános
// "dokumentum-oldal" — `/audit-9900/dokumentum/[token]` — amelyet a vásárló
// a böngészőjével megnyit és Print-to-PDF-fel mentheti.
//
// Az email tartalmaz egy linket erre az oldalra + opcionálisan egy egyszerű
// HTML attachment-et is, amit a vásárló közvetlenül letölthet.
//
// Ha valóban szerver-oldali PDF render kell, két opció:
//   a) @react-pdf/renderer hozzáadása (package.json függőség, ~3MB bundle)
//   b) Hostinger VPS endpoint (Puppeteer + chromium ott natív)
//
// Most az "a" opció helyett a tokenes közvetítő oldal-megközelítést használjuk,
// mert sokkal gyorsabb implementálni, és a vásárló a saját böngészőjével dönt
// a formátumról.

import { supabaseAdmin } from "./supabase-admin";
import { randomBytes } from "node:crypto";

export type DocumentToken = {
  token: string;
  url: string;
  expiresAt: Date;
};

// Generál egy tokent egy submission-höz, hogy a vásárló a publikus
// `/audit-9900/dokumentum/[token]` URL-en megnyithassa az auditját.
export async function createDocumentToken(submissionId: string, validityDays = 365): Promise<DocumentToken> {
  const token = randomBytes(20).toString("base64url");
  const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

  // A token-t a submission egy mezőjébe mentjük — a `notion_page_id` mezőt
  // újrahasznosítva (NEM Notion-hez használjuk most), VAGY létrehozhatunk
  // egy külön táblát is. A migrációhoz: a `notion_page_id` mező megfelelő.
  await supabaseAdmin
    .from("lead_magnet_submissions")
    .update({ notion_page_id: `doc-token:${token}` })
    .eq("id", submissionId);

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://akademia.solobusiness.hu";
  const url = `${baseUrl}/audit-9900/dokumentum/${token}`;

  return { token, url, expiresAt };
}

// Markdown → branded HTML konverzió a dokumentum-oldalhoz.
// Ezt a komponensben (`app/audit-9900/dokumentum/[token]/page.tsx`) használjuk,
// ide csak az inline-rendering segéd kerül.
export function markdownToInlineHtml(md: string): string {
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
      out.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      out.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      out.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineFormat(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (line.startsWith("> ")) {
      flushList();
      out.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
      continue;
    }
    flushList();
    out.push(`<p>${inlineFormat(line)}</p>`);
  }
  flushList();
  return out.join("\n");
}

function inlineFormat(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
