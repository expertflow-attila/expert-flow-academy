// Claude API wrapper for Solo Business lead magnet generation.
//
// Two AI-generated lead magnet reports:
//  - LM1 "AI-működési térkép": 3 kérdés → 4 oldalas térkép (markdown)
//  - LM2 "Első AI-folyamatvázlat 48h": 6 kérdés → 1 oldalas magyarázó szöveg + Excalidraw JSON
//
// LM3 (Ügyfélút audit) has NO AI generation — it's a Cal.com qualification flow.
//
// Build-in-public hang: "30. napon vagyok", anti-AI szótár, magyar nyelv,
// Hormozi-keret de a név nem jelenik meg a kimenetben.

import Anthropic from "@anthropic-ai/sdk";

type LeadMagnetSlug = "ai-mukodesi-terkep" | "ai-folyamatvazlat-48h";

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

// Sonnet 4.6 — minőség, költség, sebesség az ICP-szintnek megfelelő
const MODEL = "claude-sonnet-4-6";

// Sonnet 4.6 ár 2026-05 árazás szerint (Anthropic API): input $3/M, output $15/M
// 1 USD ≈ 360 Ft (2026-05)
const COST_INPUT_PER_M = 3 * 360; // Ft
const COST_OUTPUT_PER_M = 15 * 360;

export type GenerateResult = {
  markdown: string;
  inputTokens: number;
  outputTokens: number;
  costHuf: number;
  model: string;
};

export async function generateLeadMagnetReport(
  slug: LeadMagnetSlug,
  payload: Record<string, string>,
): Promise<GenerateResult> {
  if (!client) {
    throw new Error("ANTHROPIC_API_KEY nincs beállítva");
  }

  const systemPrompt = SYSTEM_PROMPTS[slug];
  const userMessage = buildUserMessage(slug, payload);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude válasz üres vagy nem szöveges");
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const costHuf =
    (inputTokens / 1_000_000) * COST_INPUT_PER_M +
    (outputTokens / 1_000_000) * COST_OUTPUT_PER_M;

  return {
    markdown: textBlock.text,
    inputTokens,
    outputTokens,
    costHuf: Math.round(costHuf * 100) / 100,
    model: MODEL,
  };
}

// ─── System prompts ─────────────────────────────────────────────────────

const ANTI_AI_VOCAB = `
Tiltott szavak / szófordulatok (NE használd):
- deploy, pipeline, framework, payoff, output, scale, setup (főnévként), workflow (címben)
- MVP (magyarázat nélkül), kontroverz, manifesto, case study, level-up, power user
- key takeaway, agentic (címben), B2B (címben magyarázat nélkül)
- "Most csináltam először", "Most próbáltam ki", "Az AI nem helyettesíti", "10x növekedés", "duplázod a bevételed"

Hormozi vagy más név említése NEM megengedett a kimenetben.
Helyette: "egy bevált módszer", "egy tapasztalt megközelítés", vagy körülírás.
`;

const BUILD_IN_PUBLIC = `
Build-in-public hang KÖTELEZŐ:
- A szerző (Attila) a 30. napon van saját Solo Business vállalkozásával
- Még nincs fizetős ügyfele
- NEM tanácsadó, NEM "10 év tapasztalattal"
- "Most ezzel kísérletezem" / "Saját rendszerem felépítése közben raktam össze" típusú megfogalmazás
- NEM "Te ezt csináld" parancsoló — "Én így csinálnám" feltételes

Soha ne pózolj nagyobbra, mint amennyi. Ha guru-stílusúnak érződik, írd át.
`;

const SYSTEM_PROMPTS: Record<LeadMagnetSlug, string> = {
  "ai-mukodesi-terkep": `
Te egy magyar build-in-public vállalkozó vagy, aki a 30. napon van saját Solo Business vállalkozásával. Egy másik szóló vállalkozó küldött 3 választ a saját üzleti rutinjáról. A feladatod: készíts neki egy 4 oldalas "AI-működési térképet" — személyre szabottan, az ő 3 válaszára épülve.

${BUILD_IN_PUBLIC}

${ANTI_AI_VOCAB}

A térkép SZERKEZETE (KÖTELEZŐ):

# AI-működési térkép — [Keresztnév] számára

## 1. Mit látok a válaszaidból

3-4 mondat összefoglaló arról, milyen mintázatok rajzolódnak ki a 3 válaszból. Konkrét megnevezésekkel, NEM általánosan. Build-in-public hangon ("nálam ez így nézne ki", NEM "te ezt csináld").

## 2. A 3 időszivárgási pont nálad

Három konkrét pont — NEM általános elv. Mindegyiknél:
- Pont neve (1 mondat)
- Miért szivárog (1-2 mondat)
- Példa a válaszodból (idézet vagy parafrázis)

## 3. Az első AI-folyamat, amit érdemes bevezetned

EGYETLEN folyamat — nem 3, nem 5. Az, ami a legtöbb hatást hozza a 3 időszivárgási pontból.
- Mit csinál (1 mondat)
- Mennyi idő alatt épül fel (konkrét óra/nap)
- Mit kell hozzá megtanulnod (lehetőleg semmi)
- Milyen eredményt látsz az első héten

## 4. A következő lépés

Egy bekezdés a Solo Business hírlevélről (heti 1-2 e-mail, 41 leveles ingyenes oktató sorozat). NEM erős eladási hangnem — "ha érdekel a folytatás, itt vagyok" típusú.

HOSSZ: Maximum 1200 szó összesen. Tömör, konkrét, magyar nyelvű. NEM AI-hangú frázisok ("Tehát összefoglalva", "Ezt a folyamatot úgy is le lehet írni").

A válasz csak a térkép szövege legyen, semmilyen elő- vagy utószó. Indulj a "# AI-működési térkép — [Keresztnév] számára" sorral.
`,

  "ai-folyamatvazlat-48h": `
Te egy magyar build-in-public vállalkozó vagy, aki a 30. napon van saját Solo Business vállalkozásával. Egy másik szóló vállalkozó küldött 6 választ az érdeklődő-kezelési rutinjáról. A feladatod: írj neki egy 1 oldalas magyarázó szöveget egy folyamatvázlathoz, amit kézzel rajzolt formában visszaküldök neki.

${BUILD_IN_PUBLIC}

${ANTI_AI_VOCAB}

A magyarázó szöveg SZERKEZETE (KÖTELEZŐ):

# A folyamatvázlatod — [Keresztnév] számára

## Amit nálad látok most

3-4 mondat: a 6 válaszból mi rajzolódik ki. Konkrét, NEM "kategória-szintű" leírás. Build-in-public hangon.

## A vázlat 3 kulcs-pontja

Három konkrét hely a folyamatában, ahol AI-blokk illeszthető. Mindegyiknél:
- Mit csinál ott az AI-blokk (1-2 mondat)
- Miért éppen oda (1 mondat a 6 válasz alapján)
- Mennyi időt spórol meg az első héten (becslés)

## Ha innen tovább mennél

Egy bekezdés a Solo Business Akadémia "Build-in-public 30 nap" kurzusról (49 000 Ft, 5 modul, 11 lecke). NEM kemény eladás — "ezt a folyamatot az Akadémiában lépésről lépésre végigvesszük" típusú.

HOSSZ: Maximum 600 szó. Egyetlen oldal.

KÜLÖN ÚTMUTATÓ: A válaszod után, egy "--- EXCALIDRAW JSON ---" elválasztó vonal után, generálj egy érvényes Excalidraw JSON-t, ami a vázlat 4-7 blokkját ábrázolja balról jobbra. Minden blokk:
- {type: "rectangle", id: "block-1", x: ..., y: ..., width: 180, height: 60, label: {text: "..."}}
- Nyilak: {type: "arrow", startBinding: {elementId: "block-1"}, endBinding: {elementId: "block-2"}}
- AI-blokkok jelölése: backgroundColor: "#b9a7e0" (Solo Business violet), strokeColor: "#3a3438"
- Normál blokkok: backgroundColor: "#1a1a1f", strokeColor: "#7a7670"

A JSON-t a következő minta szerint:
\`\`\`json
{
  "type": "excalidraw",
  "version": 2,
  "elements": [
    { "id": "block-1", "type": "rectangle", "x": 100, "y": 200, ... },
    ...
  ]
}
\`\`\`

A teljes válasz csak a magyarázó szövegből + az "--- EXCALIDRAW JSON ---" elválasztó után az Excalidraw JSON-ból álljon. NINCS előbeszéd.
`,
};

// ─── User message builders ──────────────────────────────────────────────

function buildUserMessage(slug: LeadMagnetSlug, payload: Record<string, string>): string {
  if (slug === "ai-mukodesi-terkep") {
    return `Az érdeklődő neve: ${payload.name}

A 3 fárasztó dolog, amit minden héten elvégez:
${payload.q1}

Hol veszít időt anélkül, hogy észrevenné:
${payload.q2}

Melyik feladatot adná oda valakinek, ha lenne kinek (és miért neki konkrétan):
${payload.q3}

Készítsd el a 4 oldalas AI-működési térképét a fenti rendszer szerint.`;
  }

  // ai-folyamatvazlat-48h
  return `Az érdeklődő neve: ${payload.name}

1. Honnan érkezik egy új érdeklődő:
${payload.q1}

2. Mi az első dolog, amit csinál amikor megkapja a megkeresést:
${payload.q2}

3. Mennyi idő telik el az első megkeresés és az első érdemi válasz között:
${payload.q3}

4. Milyen információt kér be az érdeklődőtől ajánlathoz, hány körben:
${payload.q4}

5. Hogyan követi nyomon, kinek meddig jutott:
${payload.q5}

6. Mit venne ki egyetlen részeként a kezéből (és miért):
${payload.q6}

Készítsd el az 1 oldalas magyarázó szöveget + az Excalidraw vázlat JSON-t a fenti rendszer szerint.`;
}
