// Claude API wrapper a Solo Business lead magnet rendszerhez.
//
// Élő (live mód) Claude-hívások:
//   - generateLeadMagnetReport(slug, payload) — minden LM dokumentum-generálás
//   - recommendPackage(submission) — Sales Bridge ügynök, decoy ajánlat
//   - scoreGiveawayApplication(payload) — LM7 előminősítés
//   - qualityReviewLive(slug, payload, generated) — Quality Reviewer szűrő
//   - transcribeRawInput(...) — LM3 voice/text feldolgozás (külön lib/whisper.ts)
//
// Build-in-public hang KÖTELEZŐ: "30. napon vagyok", anti-AI szótár,
// magyar nyelv, Hormozi-keret de a név NEM jelenik meg a kimenetben.

import Anthropic from "@anthropic-ai/sdk";

export type LeadMagnetSlug =
  | "ai-mukodesi-terkep"
  | "ai-folyamatvazlat-48h"
  | "48h-ai-gyorsdiagnozis"
  | "kockazatmentes-audit"
  | "mondd-el-egyszer"
  | "auditprogram-9900"
  | "csapat-szerep-terkep"
  | "mini-onboarding-vazlat"
  | "operations-erettsegi-audit"
  | "pilot-rendszer-blueprint";

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

const MODEL = "claude-sonnet-4-6";
const MODEL_HAIKU = "claude-haiku-4-5-20251001"; // gyors / olcsó: scoring + quality review

// Sonnet 4.6 ár 2026-05-23 (Anthropic API): input $3/M, output $15/M
// Haiku 4.5: input $0.80/M, output $4/M
// 1 USD ≈ 360 Ft (2026-05)
const COST = {
  sonnet: { input: 3 * 360, output: 15 * 360 },
  haiku: { input: 0.8 * 360, output: 4 * 360 },
} as const;

export type GenerateResult = {
  markdown: string;
  inputTokens: number;
  outputTokens: number;
  costHuf: number;
  model: string;
};

// ─── 1. Lead magnet riport generálás (live mód, AI Analyst) ─────────────

export async function generateLeadMagnetReport(
  slug: LeadMagnetSlug,
  payload: Record<string, string>,
): Promise<GenerateResult> {
  if (!client) throw new Error("ANTHROPIC_API_KEY nincs beállítva");

  const systemPrompt = SYSTEM_PROMPTS[slug];
  if (!systemPrompt) throw new Error(`Nincs system prompt a "${slug}" slug-hoz`);

  const userMessage = buildUserMessage(slug, payload);
  // Hosszabb kimenetek: auditprogram-9900 (8 oldal), pilot-rendszer-blueprint (5-7 oldal)
  const maxTokens =
    slug === "auditprogram-9900"
      ? 8000
      : slug === "pilot-rendszer-blueprint"
      ? 6000
      : 4096;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
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
    (inputTokens / 1_000_000) * COST.sonnet.input +
    (outputTokens / 1_000_000) * COST.sonnet.output;

  return {
    markdown: textBlock.text,
    inputTokens,
    outputTokens,
    costHuf: Math.round(costHuf * 100) / 100,
    model: MODEL,
  };
}

// ─── 2. Sales Bridge ügynök — decoy ajánlás ──────────────────────────────

export type RecommendationResult = {
  recommended: "A" | "B" | "C" | "D";
  reasoning: string;
  highlightReason: string;
  costHuf: number;
};

export async function recommendPackage(submission: {
  slug: LeadMagnetSlug | "ugyfelut-audit";
  payload: Record<string, unknown>;
  leadScore?: number | null;
}): Promise<RecommendationResult> {
  if (!client) throw new Error("ANTHROPIC_API_KEY nincs beállítva");

  const userMessage = `Egy "${submission.slug}" érdeklődő kitöltötte a lead magnet űrlapot.

Válaszai (JSON):
${JSON.stringify(submission.payload, null, 2)}

${submission.leadScore != null ? `Lead score: ${submission.leadScore}/100` : ""}

Ajánld a 4 csomag közül a legjobbat:
- A: Akadémia + Skool — 49 000 Ft (DIY belépő, kurzus)
- B: Mini sprint — 199 000 Ft (1 folyamat AI-vázlat + bevezetés, decoy)
- C: Teljes Audit + Rendszerterv — 359 000 Ft (8 oldalas audit + 30/60/90 terv)
- D: Implementáció — 599 000 Ft (csak C után)

Szabályok:
- Heti óra <5 + 0 AI-eszköz → A
- Heti óra >10 + AI-eszközhasználat → C
- Heti óra 5-10 + 1 konkrét fájdalom → B
- Q-ban "300k+ Ft hajlandóság" + Q "10h+" → C vagy D
- ICP-illeszkedés <50 → A
- Korábbi 9 900 Ft audit fizetett → D vagy C

VÁLASZ formátum (CSAK JSON, semmi más):
{"recommended":"A","reasoning":"<3-4 mondat magyarul, build-in-public hang>","highlightReason":"<1 mondat: miért NEM a többi>"}`;

  const response = await client.messages.create({
    model: MODEL_HAIKU,
    max_tokens: 800,
    system: `Te a Solo Business sales bridge ügynöke vagy. Egyetlen feladatod: válassz a 4 csomag közül egyet, magyarázd el miért. Build-in-public hangon. CSAK JSON kimenet, semmilyen szöveg előtte vagy utána.`,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = extractText(response);
  const parsed = parseJsonFromText(text) as {
    recommended?: string;
    reasoning?: string;
    highlightReason?: string;
  };

  const costHuf =
    (response.usage.input_tokens / 1_000_000) * COST.haiku.input +
    (response.usage.output_tokens / 1_000_000) * COST.haiku.output;

  return {
    recommended: (parsed.recommended as "A" | "B" | "C" | "D") ?? "A",
    reasoning: parsed.reasoning ?? "",
    highlightReason: parsed.highlightReason ?? "",
    costHuf: Math.round(costHuf * 100) / 100,
  };
}

// ─── 3. Giveaway scorer (LM7) ────────────────────────────────────────────

export type GiveawayScore = {
  fit: number;
  impact: number;
  feasibility: number;
  prValue: number;
  total: number;
  category: "winner-candidate" | "runner-up-top" | "runner-up" | "newsletter-only" | "decline";
  reasoning: string;
  winnerPitch: string;
  costHuf: number;
};

export async function scoreGiveawayApplication(payload: Record<string, unknown>): Promise<GiveawayScore> {
  if (!client) throw new Error("ANTHROPIC_API_KEY nincs beállítva");

  const response = await client.messages.create({
    model: MODEL_HAIKU,
    max_tokens: 1200,
    system: `Te a Solo Business Q3 giveaway-pályázat előminősítő ügynöke vagy.
Egy szóló vállalkozó 10 kérdést kitöltött. Pontozz 0-100-ig 4 dimenzió mentén,
és írj 2 mondat indoklást + (ha winner-candidate) 1 bekezdés winner pitch-et.

Dimenziók:
1. FIT (ICP-illeszkedés) — Q1, Q2, Q3 alapján
2. IMPACT (változás-mérték) — Q4, Q5 alapján
3. FEASIBILITY (30 nap alatt megvalósítható) — Q5, Q6 alapján
4. PR-VALUE (build-in-public érték) — Q9, Q1, Q10 alapján

Category küszöbök:
- total >75 → winner-candidate (top 5-10)
- 60-75 → runner-up-top
- 50-60 → runner-up
- 25-50 → newsletter-only
- <25 → decline

CSAK JSON formátum:
{"fit":N,"impact":N,"feasibility":N,"prValue":N,"total":N,"category":"...","reasoning":"...","winnerPitch":"..."}`,
    messages: [
      {
        role: "user",
        content: `Pályázó válaszai:\n${JSON.stringify(payload, null, 2)}\n\nPontozd.`,
      },
    ],
  });

  const text = extractText(response);
  const parsed = parseJsonFromText(text) as Partial<GiveawayScore>;

  const total =
    typeof parsed.total === "number"
      ? parsed.total
      : Math.round(((parsed.fit ?? 0) + (parsed.impact ?? 0) + (parsed.feasibility ?? 0) + (parsed.prValue ?? 0)) / 4);

  const costHuf =
    (response.usage.input_tokens / 1_000_000) * COST.haiku.input +
    (response.usage.output_tokens / 1_000_000) * COST.haiku.output;

  return {
    fit: parsed.fit ?? 0,
    impact: parsed.impact ?? 0,
    feasibility: parsed.feasibility ?? 0,
    prValue: parsed.prValue ?? 0,
    total,
    category: parsed.category ?? "newsletter-only",
    reasoning: parsed.reasoning ?? "",
    winnerPitch: parsed.winnerPitch ?? "",
    costHuf: Math.round(costHuf * 100) / 100,
  };
}

// ─── 4. Quality Reviewer (live) ──────────────────────────────────────────

export type QualityReviewResult = {
  passed: boolean;
  antiAiViolations: string[];
  buildInPublicViolations: string[];
  factualConcerns: string[];
  lengthCheck: "ok" | "too-long" | "too-short";
  recommendation: "send-to-hermes" | "regenerate" | "hermes-with-warning";
  costHuf: number;
};

export async function qualityReviewLive(args: {
  slug: LeadMagnetSlug;
  payload: Record<string, unknown>;
  generatedMarkdown: string;
}): Promise<QualityReviewResult> {
  if (!client) throw new Error("ANTHROPIC_API_KEY nincs beállítva");

  const response = await client.messages.create({
    model: MODEL_HAIKU,
    max_tokens: 800,
    system: `Te a Solo Business Quality Reviewer ügynöke vagy. Egy AI-generált
lead magnet riportot ellenőrzöl 4 dimenzió mentén:

1. ANTI-AI szótár — TILTOTT: deploy, pipeline, framework, payoff, output,
   scale, setup (főnév), workflow (címben), MVP, kontroverz, manifesto,
   case study, level-up, power user, key takeaway, agentic, B2B (címben),
   "10x növekedés", "duplázod a bevételed", "Az AI nem helyettesíti", "Most próbáltam ki"
2. BUILD-IN-PUBLIC — guru-szófordulat-tilalom: "Így csináld", "X év tapasztalattal",
   "Az én ügyfeleim", "Bevált módszerem" — helyette feltételes, "nálam így néz ki"
3. FAKTUM-ellenőrzés — idézet vagy parafrázis kell az ügyfél válaszaiból
4. HOSSZ — slug-szerinti limit túllépés

Hormozi név említése AUTOMATIKUS BUKÁS — regenerate.

CSAK JSON kimenet:
{"passed":bool,"antiAiViolations":[...],"buildInPublicViolations":[...],"factualConcerns":[...],"lengthCheck":"ok|too-long|too-short","recommendation":"send-to-hermes|regenerate|hermes-with-warning"}`,
    messages: [
      {
        role: "user",
        content: `Slug: ${args.slug}\n\nPayload:\n${JSON.stringify(args.payload, null, 2)}\n\nGenerált riport:\n${args.generatedMarkdown.slice(0, 8000)}`,
      },
    ],
  });

  const parsed = parseJsonFromText(extractText(response)) as Partial<QualityReviewResult>;

  const costHuf =
    (response.usage.input_tokens / 1_000_000) * COST.haiku.input +
    (response.usage.output_tokens / 1_000_000) * COST.haiku.output;

  return {
    passed: parsed.passed ?? false,
    antiAiViolations: parsed.antiAiViolations ?? [],
    buildInPublicViolations: parsed.buildInPublicViolations ?? [],
    factualConcerns: parsed.factualConcerns ?? [],
    lengthCheck: parsed.lengthCheck ?? "ok",
    recommendation: parsed.recommendation ?? "hermes-with-warning",
    costHuf: Math.round(costHuf * 100) / 100,
  };
}

// ─── Build-in-public + Anti-AI szótár (minden system prompt-ba kerül) ───

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

// ─── System prompts ────────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<LeadMagnetSlug, string> = {
  "ai-mukodesi-terkep": `
Te egy magyar build-in-public vállalkozó vagy, aki a 30. napon van saját Solo Business vállalkozásával. Egy másik szóló vállalkozó küldött 3 választ a saját üzleti rutinjáról. A feladatod: készíts neki egy 4 oldalas "AI-működési térképet" — személyre szabottan, az ő 3 válaszára épülve.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

A térkép SZERKEZETE (KÖTELEZŐ):

# AI-működési térkép — [Keresztnév] számára

## 1. Mit látok a válaszaidból
3-4 mondat összefoglaló. Konkrét megnevezésekkel, NEM általánosan. Build-in-public hangon ("nálam ez így nézne ki").

## 2. A 3 időszivárgási pont nálad
Három konkrét pont. Mindegyiknél:
- Pont neve (1 mondat)
- Miért szivárog (1-2 mondat)
- Példa a válaszodból (idézet vagy parafrázis)

## 3. Az első AI-folyamat, amit érdemes bevezetned
EGYETLEN folyamat. Részletek: mit csinál, milyen eszközből épül, mennyi idő alatt áll össze, milyen eredményt látsz az első héten.

## 4. A következő lépés
Egy bekezdés a Solo Business hírlevélről. NEM erős eladási hangnem.

HOSSZ: max 1200 szó. A válasz csak a térkép szövege, semmi elő- vagy utószó. Indulj a "# AI-működési térkép — [Keresztnév] számára" sorral.
`,

  "ai-folyamatvazlat-48h": `
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy másik szóló vállalkozó küldött 6 választ az érdeklődő-kezelési rutinjáról. Írj neki 1 oldalas magyarázó szöveget + egy Excalidraw JSON-t.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

# A folyamatvázlatod — [Keresztnév] számára

## Amit nálad látok most
3-4 mondat. Konkrét, NEM kategória-szintű. Build-in-public hangon.

## A vázlat 3 kulcs-pontja
Három konkrét hely a folyamatában, ahol AI-blokk illeszthető:
- Mit csinál az AI-blokk (1-2 mondat)
- Miért éppen oda (1 mondat a 6 válasz alapján)
- Mennyi időt spórol meg az első héten

## Ha innen tovább mennél
Egy bekezdés a Solo Business Akadémia "Build-in-public 30 nap" kurzusról (49 000 Ft, 5 modul, 11 lecke).

HOSSZ: max 600 szó.

A válasz után "--- EXCALIDRAW JSON ---" elválasztó, majd egy érvényes Excalidraw JSON 4-7 blokkal balról jobbra. AI-blokkok: backgroundColor "#b9a7e0". Normál blokkok: backgroundColor "#1a1a1f", strokeColor "#7a7670".

\`\`\`json
{ "type": "excalidraw", "version": 2, "elements": [...] }
\`\`\`
`,

  "48h-ai-gyorsdiagnozis": `
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy másik szóló vállalkozó 5 választ adott. Készíts neki 7 napos akciótervet, amit a 8. napra már mérni tud.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

KIMENET SZERKEZET (kötelező):

# 48 órás AI Gyorsdiagnózis — [Keresztnév]

## Amit a válaszaidból látok
3-4 mondat. Konkrét, idézettel. Build-in-public hang.

## Az 1 dolog, ami a 7. napra mérhető javulást hozna
EGYETLEN folyamat — NEM 3, NEM 5. Az amelyik a Q2 + Q3 alapján:
- a legtöbb órát adja vissza,
- a legkevesebb új eszközt igényli (Q5),
- 7 nap alatt felépíthető.

Részletek:
- Mit csinál (2-3 mondat, NEM technikai)
- Milyen eszközből épül (max 2, amit már használ)
- Mennyi idő alatt áll össze (max 4 óra)

## A 7 napos akcióterv
Nap 1: ... (max 1 mondat)
Nap 2: ...
Nap 3: ...
Nap 4-5: tesztelés
Nap 6: első mérés
Nap 7: kézzelfogható eredmény (konkrét számmal, pl. "4 óra felszabadult heti")

## Ha ennél tovább mennél
1 bekezdés — ha Q4 >10h, ajánld a 9 900 Ft belépő auditot; ha Q4 ≤5h, ajánld az Akadémia 49k kurzust; ha Q4 5-10h + Q5-ben van AI-eszköz, ajánld a 199k mini sprintet.

HOSSZ: max 800 szó. A válasz csak a riport szövege, semmi elő- vagy utószó.
`,

  "kockazatmentes-audit": `
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy érdeklődő 7 választ adott a saját félelmeiről és helyzetéről. Készíts neki egy KOCKÁZATI TÉRKÉPET, ami csökkenti a döntési kockázatot.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

KIMENET SZERKEZET:

# Kockázati térkép — [Keresztnév]

## Amit a válaszaidból látok
3-4 mondat. Q2 és Q4 idézettel. Konkrét.

## A 3 lehetséges első lépés — kockázati súlyozással

### 1. lépés [név]
- Mit csinál: [1-2 mondat magyarul, nem technikai]
- Kockázat: alacsony / közepes / magas
- Miért éppen ez a kockázati szint: [1 mondat]
- Idő: [hány óra/nap]
- Költség: [Ft]
- Mit kapnál vissza: [konkrét eredmény + becslés]

### 2. lépés [név] — UGYANEZ
### 3. lépés [név] — UGYANEZ

## Az ajánlott első lépés (és miért)
A 3 közül 1 — NEM a legdrágább, NEM a legolcsóbb, hanem amelyik a Q3 félelmeket leginkább kezeli. 3-4 mondat indoklás.

## Amit NE csinálj első lépésnek (kockázati piros zóna)
2 anti-pattern. Konkrét.

## Ha tovább mennél biztonságosan
1 bekezdés — Q6 alapján: "0 Ft, csak ha biztos vagyok" → 41 leveles newsletter; egyébként 9 900 Ft belépő audit + 7 napos garancia.

HOSSZ: max 900 szó.
`,

  "mondd-el-egyszer": `
Egy szóló vállalkozó elmondta szabad szöveggel hogyan dolgozik most. A te feladatod: HALLGASD MEG (NEM ítéld meg), és alakítsd át a kaotikus elbeszélést 4 strukturált kimenetté.

A bemenet rendetlen, ismétlődő, oda-vissza ugrál. Ez NORMÁLIS — a Te dolgod hogy rendet csinálj benne.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

KIMENET SZERKEZET:

# A rendszered, ahogy én látom — [Keresztnév]

## Így működsz most
Strukturált szöveg, NEM ábra:
ÉRDEKLŐDŐ → [hogyan jön] → [Te mit csinálsz] → [következő lépés] → [ajánlat] → [döntés] → [ügyfél lesz vagy nem]
Minden lépést 1-2 mondattal. NEM technikai szavakkal.

## Itt nehéz most neked
3 pont, KONKRÉT idézetekkel. Mindegyik:
- mi a fájdalom (1 mondat)
- mit mondtál róla (idézet/parafrázis)
- mi a következménye (1 mondat)

## Ezeket lehetne egyszerűsíteni
2-3 konkrét egyszerűsítés. Mindegyik:
- mit csinál (ZERO technikai szó)
- mennyi terhet vesz le

## Az első javasolt lépés
EGYETLEN dolog. Az amelyik:
- a legkisebb energiát igényli (te elmondod ÉS kész)
- a legtöbb gondolkodási terhet veszi le
- 7-14 nap alatt felépíthető
3-4 mondat magyarázat, "nálam ez így nézne ki" hangon.

## Ha tovább mennél
Egy bekezdés a 199k mini sprintről VAGY a 49k Akadémiáról (a 6. szivárgási pont súlyosságától függően).

HOSSZ: max 700 szó. NULLA AI/tech kifejezés. Tilos: workflow, framework, pipeline, deploy, scale, automation, integration. Helyette: "rendszer", "folyamat", "automatikus".
`,

  "csapat-szerep-terkep": `
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy 2-3 fős mini-csapat alapítója küldött 3 választ arról, hogy hárman hogyan dolgoznak és hol akadnak el. A feladatod: készíts neki egy 3-4 oldalas "Csapat-szerep térképet" — személyre szabottan, az ő 3 válaszára épülve.

A te referenciád: a saját Hermes 6 sub-agent + 3 cron architektúrádon te is most rakod össze a szerep-térképedet — ez build-in-public mini-csapat-analógia, NEM tanácsadói referencia.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

KIMENET SZERKEZET:

# Csapat-szerep térkép — [Keresztnév] csapata számára

## 1. Mit látok a válaszaidból
3-4 mondat. Konkrét megnevezésekkel — kik a tagok, mit csinálnak. "Nálatok ez így néz ki" hangon. Idézet a Q1-ből.

## 2. A 3 szerep-konfliktus / vakfolt
Három konkrét hely. Mindegyiknél:
- Mi az ütközés vagy vakfolt (1 mondat)
- Mi az oka a 3 válasz alapján (1-2 mondat)
- Mi a következménye hétről hétre (1 mondat, konkrétan — pl. "kétszer válaszoljátok meg ugyanazt az ügyfelet")

## 3. Az 1 szerep-tisztázás, amit először érdemes megcsinálni
EGYETLEN tisztázás. NEM 3, NEM 5. Az amelyik:
- a legtöbb feszültséget veszi le (Q2 alapján)
- a legkönnyebben kommunikálható a csapaton belül (NEM hierarchia-átalakítás)
- 1 hét alatt megbeszélhető és bevezethető

Részletek:
- Mit jelent konkrétan (2-3 mondat magyarul, nem szakzsargon)
- Ki vállalja (név vagy szerep)
- Hogyan tudjátok mérni 1 hét után, hogy működik (1 konkrét jelzés)

## 4. A 2 csapat-anti-pattern, amit NE csináljatok
Két konkrét tévút, amibe könnyű belesétálni 2-3 fő mellett. Konkrét.

## 5. A következő lépés
Egy bekezdés a Solo Business hírlevélről VAGY az Akadémiáról. NEM erős eladás. Csak akkor említsd az Akadémiát, ha a Q3 alapján egy közös rendszerre van szükségük (nem csak szerepekre).

HOSSZ: max 1100 szó. A válasz csak a térkép szövege, semmi elő- vagy utószó. Indulj a "# Csapat-szerep térkép" sorral.
`,

  "mini-onboarding-vazlat": `
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy 2-3 fős mini-csapat alapítója küldött 6 választ arról, hogy hogyan vezetnek be új ÜGYFELET VAGY új CSAPATTAGOT. A Q1-ben jelölte, hogy melyik forgatókönyvre kéri a vázlatot. A feladatod: készíts neki egy 5-6 lépéses mini-onboarding vázlatot — személyre szabottan, az ő 6 válaszára épülve.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

KIMENET SZERKEZET:

# Mini-onboarding vázlat — [Keresztnév] csapata számára

## Amit nálatok látok most
3-4 mondat. A jelenlegi ad-hoc rutin parafrázisa a Q2-Q4-ből. NEM ítélkező — leíró.

## A vázlat 5-6 lépésben
Mindegyik lépés:
- **[N. nap]** — Lépés címe (max 4-5 szó)
- Ki csinálja (név vagy szerep a csapatból, a Q5 alapján)
- Mit csinál konkrétan (2-3 mondat magyarul)
- Mit kap az ügyfél/csapattag a végén (1 mondat — konkrét eredmény, NEM "élmény")

A 6 lépés ívben épüljön: 1. nap (érkezés) → 2-3. nap (orientáció) → 4-5. nap (első valódi munka/szolgáltatás) → 7. nap (első mérés/visszajelzés).

## A 2 vakfolt, ahol a vázlat el szokott szakadni
Két konkrét hely a Q6 ("hol szakad el") alapján. Mindegyiknél:
- Miért szakad el ott (1-2 mondat)
- Hogyan védhető (1 mondat — konkrét gyakorlat, nem absztrakt elv)

## Az 1 dolog, ami a vázlatot stabillá teszi
EGYETLEN szabály vagy szokás. Az amelyik:
- nem igényel új eszközt (csak a Q5-ben felsoroltakat)
- a csapaton belül 1 megbeszélésen bevezethető
- a Q6 vakfoltot kezelő hatású

## Ha ennél tovább mennél
Egy bekezdés. Q1 alapján:
- Ha "új ügyfél" volt a választás: Solo Business Akadémia 49 000 Ft (Build-in-public 30 nap, 5 modul, 11 lecke) — ott egy egész szekciónak az ügyfél-onboarding rendszerről szól.
- Ha "új csapattag" volt a választás: 199 000 Ft mini-sprint csomag — közös ülésen építünk neked egy specifikus csapat-onboardingot.

HOSSZ: max 900 szó. A válasz csak a vázlat szövege, semmi elő- vagy utószó.
`,

  "operations-erettsegi-audit": `
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy 10-50 fős B2B cég operatív vezetője (CEO/COO) küldött 5 választ az operatív rendszereiről. A feladatod: készíts neki egy 2 oldalas Operations érettségi riportot — 5 érettségi szintre kalibrálva, az ő 5 válaszára épülve.

Iparági fókusz: cleantech, megújuló energia, energiahatékonyság, napelem, hőszigetelés, kazáncsere — magyar piac.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

KIMENET SZERKEZET:

# Operations érettségi riport — [Cégnév vagy Keresztnév]

## 1. Mit látok a válaszaitokból
3-4 mondat. Konkrét — iparág + cégméret + a Q3 friss példa idézettel. NEM ítélkező — leíró.

## 2. Operations érettségi szint — 5 fokozaton

Az 5 érettségi szint:
- **1. Ad-hoc** — minden kézzel, eseti, fejben
- **2. Dokumentált** — leírva van, de nem mindig követve
- **3. Konzisztens** — mindig ugyanúgy fut, de manuálisan
- **4. Mérve** — adatra alapozott, mutató van rajta
- **5. Optimalizált** — automatizált alaprészek, kontrollált eltérés

A 3 fő operatív területre adj egy-egy szintet a Q1-Q4 alapján:
- **Ajánlatkérés-kezelés:** [szint]/5 — [1-2 mondat indoklás]
- **Projekttervezés + státusz:** [szint]/5 — [1-2 mondat indoklás]
- **Jelentés-készítés + ügyfélkövetés:** [szint]/5 — [1-2 mondat indoklás]

## 3. A 2 legfontosabb operatív szivárgási pont
Kettő — NEM 5. Mindegyiknél:
- Hol a szivárgás (1 mondat, konkrét)
- Becsült heti veszteség (idő vagy ügyfél, az iparág + Q4 alapján)
- Miért éppen most kritikus (1-2 mondat — pl. szezonalitás, kapacitás-növekedés)

## 4. A Q5 priorizált operatív rendszer — érettségi térkép
A Q5-ben megnevezett 1 rendszerre konkrétan:
- Jelenlegi szint becslése
- Reális következő szint 30 napon belül
- Mi kell ahhoz: eszköz vagy szabály vagy szerep-tisztázás (NEM AI, alaprendszer)
- Mit ad vissza: 2 konkrét mérhető eredmény

## 5. Hol illeszthető AI-blokk (kockázatmentesen)
Maximum 1-2 hely, AHOL az operatív alap MÁR megvan. NE javasolj AI-bevezetést olyan szintre, ahol az érettségi 1-2. Ha sehol nincs 3+ szint, mondd ki: "először az alaprendszer kell, AI csak 60-90 nap múlva."

## 6. Következő lépés
EGY ajánlott következő lépés. Az érettségi szintek alapján:
- Ha mindenhol 1-2: Sprint Lean 49 000 Ft 7 napos pilot egy alap-folyamatra
- Ha 2-3 között van: Sprint Standard 199 000 Ft - 1-2 folyamat egyszerre
- Ha 3+ mindenhol: Sprint Premium 599 000 Ft + AI Operations retainer kezdeményezés

NEM agresszív — világos. Maximum 1 ajánlat.

HOSSZ: max 1400 szó. A válasz csak a riport szövege, semmi elő- vagy utószó.
`,

  "pilot-rendszer-blueprint": `
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy 10-50 fős B2B cég operatív vezetője 8 választ adott egy 5 munkanapon belüli pilot blueprint-hez. A blueprint a Sprint Lean (49 000 Ft) 7 napos pilot 1. napjának előzetese — gyakorlati terv, NEM marketing-anyag.

Iparági fókusz: cleantech, megújuló energia, energiahatékonyság — magyar piac.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

KIMENET SZERKEZET (8 szekció, 5-7 oldal):

# Pilot rendszer-blueprint — [Cégnév vagy Keresztnév]

## 1. Mit látunk az intake-ből (~250 szó)
Strukturált összegzés: cég profilja (Q1 fájdalom + Q5 admin-óra + iparág + méret), célzott eredmény (Q2), a TI eszközeitekre (Q3) korlátozva, ki az operatív tulajdonos (Q4). Konkrét, parafrázis a 8 válaszból. Build-in-public hangon ("látom, hogy ti…", "nálatok ez az iparágban szokásos…").

## 2. Az 1 folyamat, amit a Sprint Lean 7 napjában felépítenénk (~350 szó)
EGYETLEN folyamat — NEM 3, NEM 5. A Q1+Q2+Q5 alapján az amelyik:
- a legtöbb admin-órát ad vissza (Q5 + Q1)
- a Q2 mérhető eredményéhez közvetlenül vezet
- a Q3 eszközeitekkel megvalósítható (NEM új SaaS bevezetése)

Mit csinál: 3-4 mondat, magyarul, NEM technikai zsargon. Build-in-public ("nálam is hasonló logikán épült fel a Hermes ajánlatkezelő sub-agentje").

## 3. Eszköz-architektúra (~400 szó)
A Q3-ban felsorolt eszközökre épülő konkrét architektúra. Diagram-szerű felsorolás:

ÉRDEKLŐDŐ INPUT (forrás)
  → Eszköz_1 (mit csinál benne)
    → Eszköz_2 (átvétel, validáció)
      → Mérőszám-rétegezés
        → Output: a 8. kérdés mérőszámai

Konkrét — NEVEN nevezed a Q3 eszközöket. Ha valami hiányzik (pl. nincs CRM), írd: "ezt az iterációban hozzáadnánk, max 1 új eszközzel".

## 4. A 7 nap napi bontásban (~500 szó)
**1. nap (előkészület — még pilot előtt):** [konkrét feladat]
**2. nap:** intake + architektúra validáció a Q4 operatív tulajdonossal
**3. nap:** első konfiguráció, eszköz-integráció
**4. nap:** első teszt-futás 2-3 valós ügyfél/projekt esetén
**5. nap:** finomhangolás, hibakeresés
**6. nap:** automatikus mérőszám-rétegezés
**7. nap:** átadás + 1.5h közös zárás Q4-tulajdonossal + jelentés-template

Mindegyik napra 2-3 mondat KONKRÉT outcome. Reális — pl. "nem ígérek 7 nap alatt 100%-os adatmigrációt".

## 5. Mérőszámok — a 8. kérdésetekre (~250 szó)
A Q8-ban megnevezett 2 mérőszámot konkrétan operationalizálva:
- Mérőszám neve (a Q8-ból)
- Hogyan mérjük (forrás + frissítési gyakoriság)
- Várható kiindulási érték (becslés Q4 + Q5 alapján)
- Reális 30 napos cél (NEM "5x növekedés" — konkrét deltával, pl. "8 óra → 4 óra")

## 6. Kockázati térkép (~400 szó)
3 reális kockázat + védekezés:
1. **Q4 operatív tulajdonos nincs jelen** → mit csinálunk (pl. "1 nap eltolódás max, COO beleegyezés kérése")
2. **Q7-ben jelzett korábbi rossz tapasztalat ismétlődése** → konkrét eltérő megközelítés
3. **Adatkezelési érzékenység (Q6)** → mit NE érintünk, hogyan rétegezzük

Ha a Q6-ban GDPR vagy NDA-érzékeny adat van: explicit korlátozás dokumentálva.

## 7. NDA / adatkezelés rétegezés (~250 szó)
Konkrét — a Q6 alapján:
- Mit látunk (operatív folyamat, nem üzleti adat)
- Mit NEM látunk (ügyfélnév, pénzügy, kontrakt)
- 30 napos törlés ütemterv
- NDA opciók (kétoldalú vagy egyéni adatkezelő-megbízási szerződés)

## 8. Mit jelent a Sprint Standard / Premium ha tovább mennétek (~400 szó)
- **Sprint Lean (49 000 Ft, 7 nap):** csak ez az 1 folyamat, alap-architektúra
- **Sprint Standard (199 000 Ft, 3 hét):** ez + 1 további folyamat + integráció
- **Sprint Premium (599 000 Ft, 6 hét):** komplex 3-folyamatos rendszer, mérőszám-dashboard, kétfős átadás
- **AI Operations retainer (120-450k Ft/hó):** ha hosszú távon belső kapacitás-pótlás kell, ezt a Sprint sikere után érdemes átbeszélni

NEM agresszív — világos, konkrét. A blueprint záró-bekezdése: "ha most úgy döntesz, hogy nem indítasz pilot-ot, az is válasz — a blueprint a te asztalodon marad ahogy van".

HOSSZ: 2500-3500 szó. A válasz csak a blueprint szövege, semmi elő- vagy utószó. Indulj a "# Pilot rendszer-blueprint" sorral.
`,

  "auditprogram-9900": `
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy érdeklődő fizetett 9 900 Ft-ot ezért az auditért. NEM ingyenes lead magnet — KOMOLY MUNKA várja el tőlünk.

Készíts neki egy 8 oldalas auditot a 12 válasza alapján.

${BUILD_IN_PUBLIC}
${ANTI_AI_VOCAB}

SZERKEZET (kötelező 8 szekció):

# AI-Működési Audit — [Keresztnév], [Cégnév]

## 1. ICP elemzés (1 oldal, ~400 szó)
- Kit szolgálsz pontosan
- Mit kínálsz nekik
- Hogyan különbözöl most a piacon

## 2. Folyamattérkép (1 oldal, ~400 szó)
A jelenlegi érdeklődő → ügyfél út lépésről lépésre. Idézetekkel a válaszokból.

## 3. Az 5 szivárgási pont (1 oldal, ~500 szó)
Pontonként:
- Hol szivárogsz (konkrét hely)
- Mi az oka (a válaszokból)
- Mi a hetente veszteség (becslés óra / Ft)
- Prioritás (1-5)

## 4. AI-illeszthetőség (1 oldal, ~500 szó)
A 3 legjobb AI-blokk, mindegyiknél:
- Mit csinálna konkrétan (magyarul, nem technikai)
- Mennyi idő alatt épül fel
- Várt eredmény (konkrét számmal)

## 5. Prioritized roadmap (1 oldal, ~400 szó)
30 nap: első AI-folyamat
60 nap: második + mérés
90 nap: harmadik + optimalizálás

## 6. Kockázati térkép (1 oldal, ~400 szó)
- 3 anti-pattern, amit NE csinálj
- 3 jelzés ha rosszul megy

## 7. Költség-becslés (1 oldal, ~400 szó)
- Eszköz-előfizetések
- Beépítési idő
- ROI becslés (heti óra * 8 000 Ft)

## 8. Következő lépés (1 oldal, ~500 szó)
EGYETLEN ajánlott következő lépés.
A 12. kérdésre ("mi az a 359k") visszautalva.
Ha 7 napon belül továbblépsz, 9 900 Ft beszámít.
NEM agresszív — világos, konkrét.

HOSSZ: 3500-4500 szó. A válasz csak az audit szövege, semmi elő- vagy utószó.
`,
};

// ─── User message builders ──────────────────────────────────────────────

function buildUserMessage(slug: LeadMagnetSlug, payload: Record<string, string>): string {
  switch (slug) {
    case "ai-mukodesi-terkep":
      return `Az érdeklődő neve: ${payload.name}

A 3 fárasztó dolog, amit minden héten elvégez:
${payload.q1}

Hol veszít időt anélkül, hogy észrevenné:
${payload.q2}

Melyik feladatot adná oda valakinek, ha lenne kinek (és miért neki konkrétan):
${payload.q3}

Készítsd el a 4 oldalas AI-működési térképét a fenti rendszer szerint.`;

    case "ai-folyamatvazlat-48h":
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

Készítsd el az 1 oldalas magyarázó szöveget + az Excalidraw vázlat JSON-t.`;

    case "48h-ai-gyorsdiagnozis":
      return `Az érdeklődő neve: ${payload.name}

1. Fő szolgáltatása: ${payload.q1}
2. 3 manuális feladat amit nem szeretett az elmúlt 7 napban: ${payload.q2}
3. Mit szeretne hogy automatikusan megtörténjen: ${payload.q3}
4. Heti manuális munkaidő: ${payload.q4}
5. Használt eszközök: ${payload.q5}

Készítsd el a 7 napos akciótervet.`;

    case "kockazatmentes-audit":
      return `Az érdeklődő neve: ${payload.name}

1. Szolgáltatása: ${payload.q1}
2. Legnagyobb működési problémája: ${payload.q2}
3. Félelmek (jelölte): ${payload.q3}
4. Korábbi rossz tapasztalat: ${payload.q4 || "(nem írt)"}
5. Jelenlegi eszközök: ${payload.q5}
6. Fizetési hajlandóság: ${payload.q6}
7. Csapat-méret: ${payload.q7}

Készítsd el a kockázati térképét.`;

    case "mondd-el-egyszer":
      return `Az érdeklődő neve: ${payload.name}

Szabad szöveges leírása ARRÓL hogyan dolgozik most (lehet rendetlen, ismétlődő — ez normális):

${payload.transcript || payload.q1}

Alakítsd át a 4 strukturált szekciójú dokumentummá.`;

    case "csapat-szerep-terkep":
      return `A mini-csapat alapítója: ${payload.name}
Csapat-méret: ${payload.team_size || "(nem írt)"}

1. Kik vagytok és mit csináltok együtt (szerep + tevékenység, mindenkire):
${payload.q1}

2. Hol szoktatok elakadni vagy duplikálódni heti szinten (konkrét példa):
${payload.q2}

3. Melyik szerep / felelősség nincs egyértelműen tisztázva köztetek:
${payload.q3}

Készítsd el a csapat-szerep térképét a fenti rendszer szerint.`;

    case "mini-onboarding-vazlat":
      return `A mini-csapat alapítója: ${payload.name}

1. Új ügyfelet VAGY új csapattagot vezetnétek be elsősorban (válasszon): ${payload.q1}

2. Hogyan zajlik most ad-hoc (3-4 mondat amit elmondtatok):
${payload.q2}

3. Mi az első dolog, amit a 2-3 fő közül valaki csinál egy új belépéskor:
${payload.q3}

4. Hol szokott elveszni az ügyfél / csapattag az első 7 napban (ha tudjátok):
${payload.q4}

5. Milyen eszközöket használtok közösen (max 5):
${payload.q5}

6. Mi az a pillanat, ahol a vázlat el szokott szakadni (ha eddig nem volt vázlat: ahol összezavarodott):
${payload.q6}

Készítsd el az 5-6 lépéses mini-onboarding vázlatot.`;

    case "operations-erettsegi-audit":
      return `Cég vezetője: ${payload.name}
Cégnév: ${payload.company_name || "(nem adta meg)"}
Cégméret: ${payload.company_size || "(nem adta meg)"}
Szerep: ${payload.role || "(nem adta meg)"}

1. Iparág + tevékenység:
${payload.q1}

2. Hogyan kerül be most egy új ajánlatkérés a rendszerbe:
${payload.q2}

3. Hol van most a legnagyobb operatív szivárgás (friss példa):
${payload.q3}

4. Heti jelentés-készítés + projekt-státusz koordináció (becsült óra):
${payload.q4}

5. Az 1 operatív rendszer, amit ha stabilizálnánk, a legnagyobb megkönnyebbülést hozná:
${payload.q5}

Készítsd el a 2 oldalas Operations érettségi riportot a fenti rendszer szerint.`;

    case "pilot-rendszer-blueprint":
      return `Cég vezetője: ${payload.name}
Cégnév: ${payload.company_name || "(nem adta meg)"}
Cégméret: ${payload.company_size || "(nem adta meg)"}
Iparág: ${payload.industry || "(nem adta meg)"}
Szerep: ${payload.role || "(nem adta meg)"}

1. Fő működési fájdalom:
${payload.q1}

2. Mi legyen 7 nap után konkrétan más:
${payload.q2}

3. Használt eszközök (max 6):
${payload.q3}

4. Pilot operatív tulajdonosa (név/szerep + heti elérhető óra):
${payload.q4}

5. Heti admin + jelentés-óra becslés:
${payload.q5}

6. Adatkezelési érzékenység (GDPR / NDA):
${payload.q6}

7. Korábbi automatizációs próbálkozás (mi sikerült / NEM):
${payload.q7}

8. 2 mérőszám amit a pilot után konkrétan figyelnének:
${payload.q8}

Készítsd el a 8 szekciós (5-7 oldal) pilot rendszer-blueprint-et a fenti rendszer szerint. A blueprint a Sprint Lean 1. napjának előzetese — gyakorlati, NEM marketing.`;

    case "auditprogram-9900":
      return `Fizetett ügyfél neve: ${payload.name}
Cégnév: ${payload.company || "(nem írt)"}

1. Vállalkozás típusa + ICP: ${payload.q1}
2. Heti érdeklődő-szám: ${payload.q2}
3. Becsatornázási források: ${payload.q3}
4. Első érintkezés lépése: ${payload.q4}
5. Első érdemi válaszidő: ${payload.q5}
6. Ajánlat-ütemtervi körök: ${payload.q6}
7. Kapcsolat-dokumentáció: ${payload.q7}
8. Mit utál csinálni: ${payload.q8}
9. Mit szeret: ${payload.q9}
10. Mit automatizálna először + miért: ${payload.q10}
11. Heti admin-óra: ${payload.q11}
12. 359k hajlandóság (komolyság-jelző): ${payload.q12}

Készítsd el a 8 oldalas auditot a fenti rendszer szerint.`;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────

function extractText(response: Anthropic.Messages.Message): string {
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return "";
  return block.text;
}

function parseJsonFromText(text: string): unknown {
  // Try direct JSON parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try to find a JSON block in the text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return {};
      }
    }
    return {};
  }
}
