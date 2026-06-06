// Business Start — INGYENES 7 napos mini-kurzus seed (lead magnet)
//
// 7 nap = 7 modul, modulonként 1 egyszerű lecke-oldal. Minden leckén:
// cím + alcím + rövid összefoglaló (a nap lépései) + 1 prompt (a bevált
// expert-flow-start-2.0 anyagból). Tudatosan EGYSZERŰ — ez egy ingyenes taster.
//
// Tartalom-válogatás: Anna (Hermes) ajánlása alapján — kihagyva a haladó
// 07 funnel + 11 analitika; 12 jogi csak a 7. nap végén mini-checklistként.
//
// ELŐFELTÉTEL: a 2026-06-06_business_start_lesson_fields.sql migráció lefutott
// (subtitle, summary_points, prompt_intro, prompt_text, downloads, transcript oszlopok).
//
// Futtatás:        node scripts/seed-business-start.mjs
// Dry-run (próba): node scripts/seed-business-start.mjs --dry-run
//
// Idempotens: a business-start kurzus modulokat (cascade: leckéket) törli és újraépíti.
// A courses rekordot upsert-eli (slug=business-start, price_huf=0, published=true).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const DRY = process.argv.includes("--dry-run");
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(file) {
  const txt = readFileSync(resolve(__dirname, "..", file), "utf-8");
  return Object.fromEntries(
    txt
      .split("\n")
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        let v = l.slice(i + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        return [l.slice(0, i), v];
      }),
  );
}

const env = loadEnv(".env.local");
const SUPA_URL = (env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPA_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPA_URL || !SUPA_KEY) {
  console.error("Hiányzik SUPABASE_URL vagy SUPABASE_SERVICE_ROLE_KEY az .env.local-ból.");
  process.exit(1);
}
if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(SUPA_URL)) {
  console.error(`SUPABASE_URL formátum gyanús: "${SUPA_URL}"`);
  process.exit(1);
}

const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" };
async function get(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: H });
  if (!r.ok) throw new Error(`GET ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}
async function del(path) {
  if (DRY) { console.log(`  [DRY] DELETE ${path}`); return; }
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method: "DELETE", headers: H });
  if (!r.ok) throw new Error(`DELETE ${path} ${r.status}: ${await r.text()}`);
}
async function post(path, body) {
  if (DRY) { console.log(`  [DRY] POST ${path} ${JSON.stringify(body).slice(0, 90)}...`); return [{ id: "dry-id" }]; }
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: { ...H, Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}
async function patch(path, body) {
  if (DRY) { console.log(`  [DRY] PATCH ${path} ${JSON.stringify(body).slice(0, 90)}...`); return; }
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method: "PATCH", headers: H, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PATCH ${path} ${r.status}: ${await r.text()}`);
}

const SLUG = "business-start";
const COURSE = {
  slug: SLUG,
  title: "Business Start — 7 napos mini-kurzus",
  subtitle: "Nulláról egy működő, automatizált online vállalkozásig — naponta egy fázis.",
  description:
    "Ingyenes 7 napos mini-kurzus. Naponta egy fázissal felépíted az első működő, automatizált online vállalkozásod, AI-val. Minden naphoz egy kész prompt, amit egyből az AI-nak adhatsz.",
  price_huf: 0,
  published: true,
};

// 7 nap = 7 modul, modulonként 1 lecke. A prompt-szövegek az
// expert-flow-start-2.0 bevált anyagából (01, 04, 05, 08, 10), + 2 egyszerű új (2., 6. nap).
const MODULES = [
  {
    position: 1,
    title: "1. nap — Tiszta alapok",
    lesson: {
      title: "Tiszta alapok",
      subtitle: "Egyetlen mondatban megfogalmazod, mit adsz el és kinek — ez lesz minden további nap alapja.",
      summary_points: [
        "Gondolkodásmódváltás: az alkalmazotti reflexekről a vállalkozói gondolkodásra.",
        "Célcsoport: kinek tudsz a legtöbb értéket adni — egy konkrét ember, nem szegmens.",
        "Ajánlat: egy mondatban megfogalmazott, érthető értékajánlat.",
      ],
      is_preview: true,
      prompt_intro:
        "Akkor használd, amikor a 4 fájdalom-kérdést már papíron végigírtad, és 3 jelölt-problémát kiválasztottál. Az AI nem dönt — kérdez.",
      prompt_text:
        "Most végeztem a 4 fájdalom-kérdéssel papíron. A három jelölt-probléma, amit kiválasztottam:\n\n[1] ...\n[2] ...\n[3] ...\n\nSaját élményem mindegyikkel (1-2 mondat):\n[1] ...\n[2] ...\n[3] ...\n\nTegyél fel 5 olyan kérdést, ami segít eldönteni, melyik az, amiben a legmélyebb személyes érintettségem van, és amelyiknek van magyar piaci kereslete is. NE válassz helyettem. NE adj tanácsot. Csak kérdezz.",
    },
  },
  {
    position: 2,
    title: "2. nap — Digitális jelenlét",
    lesson: {
      title: "Digitális jelenlét",
      subtitle: "Lesz saját domained, professzionális üzleti emailed és rendezett digitális irodád.",
      summary_points: [
        "Domain: kiválasztod és megveszed a vállalkozásodhoz illő nevet.",
        "Üzleti email: professzionális te@teneved.hu címről kommunikálsz.",
        "Google ökoszisztéma: Drive, naptár, névjegyek egy helyen.",
      ],
      prompt_intro:
        "Segít kiválasztani a domain nevet és összeállítani a beállítási checklist-et. Akkor futtasd, amikor megvan az 1. napi egymondatos ajánlatod.",
      prompt_text:
        "Egyéni vállalkozó vagyok. Az ajánlatom 1 mondatban (1. nap): [INPUT]\n\nSegíts beállítani a digitális jelenlétem alapjait, lépésről lépésre:\n\n1. Javasolj 5 domain-nevet, amely rövid, könnyen írható és illik a fenti ajánlathoz. Mindegyiknél 1 mondat, miért jó.\n2. Adj egy egyszerű checklist-et: domain vásárlás → üzleti email (Google Workspace) → Drive/naptár/névjegyek alap-struktúra.\n3. Magyar nyelven, dokumentáló hangon, hype nélkül. NE találj ki árakat — csak a lépéseket sorold.",
    },
  },
  {
    position: 3,
    title: "3. nap — Weboldal",
    lesson: {
      title: "Weboldal",
      subtitle: "Élő, egyoldalas weboldal a saját domaineden — AI-val megépítve, egyetlen célra hangolva.",
      summary_points: [
        "Landing tervezés: a weboldal szövege és felépítése, egyetlen célra hangolva.",
        "Építés Claude-dal: élőben megépíted a saját HTML landing oldaladat.",
        "Élesítés + alap SEO: élő oldal HTTPS-sel, amit a Google megtalál.",
      ],
      prompt_intro:
        "A struktúra előbb, mint a HTML. Ez a prompt megtervezi a 8 szekció tartalmát az 1-2. nap outputjaira építve.",
      prompt_text:
        "Az eddigi output-jaim:\n- Tudásom magja (1 mondat): [1. nap output]\n- Célközönségem (1 mondat): [1. nap output]\n- Ajánlatom (1 mondat) és 3 csomag: [1. nap output]\n\nTervezz meg egy egyoldalas weboldalt 8 szekcióval. Mindegyiknél add meg: a szekció nevét, célját (mit érezzen vagy tegyen a látogató), 3-5 tartalom-bulletet magyarul, és 1 mondatos „mit ér el” célt.\n\nSorrend kötött:\n1. Hero (headline + subheadline + CTA)\n2. Problémák (3 fájdalom a célközönség hangján)\n3. Megoldás (mit csinálsz)\n4. Rólam mini (3-4 mondat)\n5. Outcome-ok (mit kap a vevő)\n6. Garancia\n7. FAQ (5-7 kérdés-válasz)\n8. CTA + footer\n\nMagyar nyelven, zero emoji, zero gradient, dokumentáló hangon.",
    },
  },
  {
    position: 4,
    title: "4. nap — AI eszköztár",
    lesson: {
      title: "AI eszköztár",
      subtitle: "Beállított fejlesztői környezet és egy betanított Claude, ami a napi munkádban a társad lesz.",
      summary_points: [
        "IDE telepítés: fejlesztői környezet, AI-integrációval.",
        "Claude mint üzleti társ: betanítod magadra és a vállalkozásodra.",
      ],
      prompt_intro:
        "Az első beszélgetés a Claude Code-dal — bemutatkozás, hogy megismerjen téged és a vállalkozásodat. Akkor futtasd, miután elindítottad a saját mappádban.",
      prompt_text:
        "Szia Claude. Most kezdek dolgozni veled, és szeretném, ha megismernél, mielőtt bármit kérek tőled.\n\nA vállalkozásom (1 mondat, az 1. napból): [mit csinálsz, kinek]\nAz ügyfeleim (1 mondat): [ki a célközönséged]\n\nFontos szabályok, ahogy velem dolgozol:\n- Mindig magyarul beszélj velem (a technikai nevek lehetnek angolul)\n- Nyugodt, dokumentáló hang — nem coach-szagú, nem hype-os\n- Tiltott szavak: „forradalmi”, „transzformáció”, „mindset”, „shortcut”, „életmódváltás”\n- Ha kódot írsz, magyarázd el 1-2 mondatban, miért azt csináltad\n- Ha valami nem egyértelmű, kérdezz vissza — ne találj ki dolgokat\n\nFoglald össze egy bekezdésben, mit értettél meg rólam és a vállalkozásomról. Aztán kérdezz egy konkrét kérdést, ami segít jobban megérteni a következő munkát.",
    },
  },
  {
    position: 5,
    title: "5. nap — Üzleti rendszerek",
    lesson: {
      title: "Üzleti rendszerek",
      subtitle: "Működő ügyfél-pipeline, rendezett email és automata időpontfoglalás — egy ránézésre átlátható.",
      summary_points: [
        "Email rendszer: rendezett postafiók és kész sablonok.",
        "CRM: működő pipeline az érdeklődőtől a megrendelésig.",
        "Időpontfoglalás: az ügyfeleid maguktól foglalnak, automatikus emlékeztetőkkel.",
      ],
      prompt_intro:
        "Konkrét Google Sheets CRM-struktúra a saját szakmádra szabva — oszlop-fejlécekkel, példa-sorokkal, státusz-mezőkkel. NEM HubSpot, csak egy egyszerű, jól strukturált Sheets.",
      prompt_text:
        "Tervezzünk meg egy Google Sheets CRM-et négy munkalappal. Egyéni vállalkozó vagyok, [konkrét szakma — pl. ügyvéd / könyvelő / fotós]. Évente max 30-50 ügyfelem lesz.\n\nA négy munkalap:\n1. Prospects — minden lehetséges ügyfél\n2. Consultations — lefoglalt 20-30 perces beszélgetések\n3. Proposals — kiküldött ajánlatok\n4. Clients — fizető ügyfelek\n\nMinden munkalaphoz adj meg:\n- A pontos oszlop-fejléceket (max 8-10 oszlop munkalaponként)\n- 2 példa-sort, ami a [szakmám]-hoz illik\n- A státusz-mezőhöz az engedélyezett értékek listáját (data validation-höz)\n\nPlusz: javasolj 1-2 conditional formatting szabályt munkalaponként (pl. zöld ha won, piros ha lost), de ne túl díszesen. A cél: egyetlen ránézésre lássam, mi a helyzet.",
    },
  },
  {
    position: 6,
    title: "6. nap — Automatizálás",
    lesson: {
      title: "Automatizálás",
      subtitle: "Az első 3 folyamat, ami magától fut a háttérben — kevesebb kézi munka, kevesebb elfelejtett lépés.",
      summary_points: [
        "Felismered, mely ismétlődő feladataidat érdemes automatizálni.",
        "Beállítod az első 3 automatizálást.",
        "Az AI rendszerezi a leveleidet és előkészíti a napjaidat.",
      ],
      prompt_intro:
        "Segít kiválasztani az első 3 automatizálandó folyamatot — azt, ami a legtöbb kézi időt spórolja a legkisebb kockázattal.",
      prompt_text:
        "Egyéni vállalkozó vagyok: [1 mondat, mit csinálsz]. Az alábbi ismétlődő feladataim vannak hetente:\n\n- [feladat 1]\n- [feladat 2]\n- [feladat 3]\n- [feladat 4]\n- [feladat 5]\n\nKérlek, segíts kiválasztani az első 3 automatizálandó folyamatot. Mindegyiknél add meg:\n1. Miért ezt érdemes elsőként (idő-megtakarítás vs. kockázat).\n2. A legegyszerűbb megvalósítás 3-4 lépésben (AI + a már meglévő eszközeim: email, naptár, CRM).\n3. Mire figyeljek, hogy ne menjen félre.\n\nNE javasolj bonyolult, külön platformot igénylő megoldást. Maradjunk az egyszerűnél.",
    },
  },
  {
    position: 7,
    title: "7. nap — Indulás",
    lesson: {
      title: "Indulás",
      subtitle: "Éles, tesztelt rendszer és az első konkrét ügyfél-megkeresések — innen már mérsz és fejlesztesz.",
      summary_points: [
        "Tesztelés és élesítés: végigteszteled, majd élesre kapcsolod a teljes rendszert.",
        "Első ügyfelek: elindul az ügyfélszerzés az első konkrét megkeresésekkel.",
        "Mérés és heti rutin: méred a számaidat, és heti rutinnal fejlesztesz.",
        "Jogi minimum (mini-checklist): vállalkozási forma, számlázás, ÁSZF/adatkezelés — a legszükségesebb, nem több.",
        "Hogyan tovább? Tisztán látod, mit értél el, és merre léphetsz a következő szintre.",
      ],
      prompt_intro:
        "A 10 név összeírásához. Nem üres listával ülsz neki, hanem AI-jal beszélgetsz, amíg eszedbe jutnak az emberek.",
      prompt_text:
        "Próbálom összeírni a 10 nevet, akiket az elmúlt 5 évben szakmailag ismertem meg, és valamilyen szinten megbíznak bennem. Nem tudom, hol kezdjem.\n\nA vállalkozásom 1 mondatban: [INPUT]\nA célközönségem: [INPUT]\n\nTegyél fel nekem 6-8 kérdést, ami segít fokozatosan eszembe juttatni a neveket (pl. korábbi kollégák, volt ügyfelek, eventeken megismert emberek, mentorok, vállalkozó ismerősök, online kapcsolatok).\n\nA kérdéseket egyenként tedd fel, ne egyszerre — várd meg a válaszomat. A célom: a végére legyen 10 név, mindegyikhez egy 1 mondatos megjegyzés.\n\nHangulat: ne sürgess, ne motiválj — csak segíts emlékezni.",
    },
  },
];

function validate() {
  const errors = [];
  for (const m of MODULES) {
    const l = m.lesson;
    if (!m.position || !m.title || !l) errors.push(`Modul ${m.position || "?"}: hiányos`);
    if (!l.title) errors.push(`Modul ${m.position}: lecke cím hiányzik`);
    if (!l.subtitle) errors.push(`Modul ${m.position}: alcím hiányzik`);
    if (!l.summary_points?.length) errors.push(`Modul ${m.position}: nincs összefoglaló-pont`);
    if (!l.prompt_text) errors.push(`Modul ${m.position}: PROMPT KÖTELEZŐ, hiányzik`);
  }
  return errors;
}

async function run() {
  console.log(`Business Start mini-kurzus seed ${DRY ? "(DRY-RUN)" : ""}`);
  console.log(`Modulok: ${MODULES.length}, Leckék: ${MODULES.length}`);

  console.log("\n0. Validáció...");
  const errs = validate();
  if (errs.length) {
    console.error("  HIBÁK:");
    for (const e of errs) console.error("   ", e);
    process.exit(1);
  }
  console.log("  OK.");

  console.log("\n1. Kurzus keresése/létrehozása:", SLUG);
  const existing = await get(`courses?slug=eq.${SLUG}&select=id,title`);
  let courseId;
  if (existing.length) {
    courseId = existing[0].id;
    console.log(`  Létezik: ${courseId} — frissítés.`);
    await patch(`courses?slug=eq.${SLUG}`, COURSE);
  } else {
    console.log("  Nincs — létrehozás.");
    const [created] = await post("courses", COURSE);
    courseId = created.id;
    console.log(`  Létrehozva: ${courseId}`);
  }

  console.log("\n2. Régi modulok törlése (cascade: leckék is)...");
  const oldMods =
    DRY && courseId === "dry-id"
      ? []
      : await get(`course_modules?course_id=eq.${courseId}&select=id,position,title&order=position`);
  if (oldMods.length) {
    for (const m of oldMods) console.log(`    - Modul ${m.position}: ${m.title}`);
    await del(`course_modules?course_id=eq.${courseId}`);
    console.log("  Törölve.");
  } else {
    console.log("  Nincs régi modul.");
  }

  console.log("\n3. Új modulok és leckék...");
  let mc = 0, lc = 0;
  for (const m of MODULES) {
    const [mod] = await post("course_modules", {
      course_id: courseId,
      position: m.position,
      title: m.title,
    });
    console.log(`  + Modul ${m.position}: ${m.title}`);
    mc++;
    const l = m.lesson;
    await post("course_lessons", {
      module_id: mod.id,
      position: 1,
      title: l.title,
      subtitle: l.subtitle,
      summary_points: l.summary_points,
      prompt_intro: l.prompt_intro ?? null,
      prompt_text: l.prompt_text,
      downloads: l.downloads ?? [],
      is_preview: l.is_preview ?? false,
    });
    console.log(`      + lecke: ${l.title}${l.is_preview ? "  [PREVIEW]" : ""}`);
    lc++;
  }

  console.log(`\nKész. ${mc} modul / ${lc} lecke ${DRY ? "(dry-run, NEM mentve)" : "beillesztve"}.`);
  console.log(`Zárt felület: /learn/${SLUG}/1`);
}

run().catch((e) => {
  console.error("\nHIBA:", e.message);
  process.exit(1);
});
