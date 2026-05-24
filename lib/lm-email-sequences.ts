// Lead magnet utánkövető email sorozatok.
//
// Minden új submission delivery-jekor egy sor kerül be a `lm_email_sequence_state`
// táblába (sequence_step=0, next_send_at = delivered_at + első_lépés_napja).
// Az `/api/lead-magnet/sequence-followup` cron óránként fut és:
//   1. Kikeresi az olyan sorokat, ahol next_send_at <= now() és paused=false
//   2. Elküldi az aktuális sequence_step üzenetét
//   3. Beállítja a következő sequence_step + next_send_at értéket
//   4. Ha utolsó lépés volt, paused=true (kész)
//
// Az emaileket NEM a MailerLite küldi — saját SMTP-vel (Resend / Brevo) megyünk,
// hogy a tracking és a hangnem teljesen a kezünkben legyen.

export type SequenceSlug =
  | "ai-mukodesi-terkep"
  | "ai-folyamatvazlat-48h"
  | "48h-ai-gyorsdiagnozis"
  | "kockazatmentes-audit"
  | "mondd-el-egyszer"
  | "auditprogram-9900"
  | "csapat-szerep-terkep"
  | "mini-onboarding-vazlat";

export type SequenceStep = {
  dayOffset: number; // a delivery-től napokban
  subject: string;
  // A body egy template — {name}, {firstStep}, {ctaUrl}, stb. placeholder-eket cseréljük
  body: string;
  ctaLabel?: string;
  ctaUrlEnv?:
    | "AUDIT_9900_URL"
    | "AKADEMIA_URL"
    | "MINI_SPRINT_URL"
    | "CAL_QUALIFICATION_URL"
    | "AJANLAT_URL_WITH_LEAD";
};

const APP_URL = process.env.NEXTAUTH_URL ?? "https://akademia.expertflow.hu";

export const CTA_URLS: Record<NonNullable<SequenceStep["ctaUrlEnv"]>, string> = {
  AUDIT_9900_URL: `${APP_URL}/audit-9900`,
  AKADEMIA_URL: `${APP_URL}/courses/szakmai-leíró-30nap`,
  MINI_SPRINT_URL: process.env.CAL_AUDIT_URL ?? `${APP_URL}/ajanlat`,
  CAL_QUALIFICATION_URL:
    process.env.CAL_QUALIFICATION_URL ?? "https://cal.com/attila-nagy-8uefco/kvalifikacio-20min",
  AJANLAT_URL_WITH_LEAD: `${APP_URL}/ajanlat`,
};

// ─── Sequence definitions ──────────────────────────────────────────────

export const SEQUENCES: Record<SequenceSlug, SequenceStep[]> = {
  "ai-mukodesi-terkep": [
    {
      dayOffset: 3,
      subject: "Megnyitottad a térképet?",
      body:
        "Szia {name}!\n\nA térképedet 3 napja küldtük. Sikerült belenézni?\n\nAz Expert Flow auditok tapasztalata szerint a 2. szivárgási pont szokott a legtöbb embernél a leginkább megfogó lenni. Kíváncsi vagyok: Nálad is a 2. pont a legnyilvánvalóbb, vagy a 3.?\n\nElég 1 mondat válasz.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 10,
      subject: "3 mintázat amit a rendszerépítésnél látunk",
      body:
        "Szia {name}!\n\nAmikor az Expert Flow auditok során a térképekből tanulságot szűrünk le, 3 visszatérő mintázat jön elő:\n\n1. A reggeli admin-idő közel feleződik, ha egyetlen alapvető feladat (érdeklődő-üzenetek osztályozása) AI-blokkba kerül.\n\n2. A tartalom-előkészítés 60%-kal gyorsul, ha az első vázlatot AI írja és csak a hangulatot pontosítjuk rá.\n\n3. A leglátványosabb hatás nem az eszközöktől jön, hanem a folyamat-tisztulástól. Ha a folyamat tiszta, már félig automatizált.\n\nHa szeretnéd lépésről lépésre felépíteni, az Expert Flow Akadémia 5 modulja pont ezt tanítja.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "Expert Flow Akadémia (49 000 Ft)",
      ctaUrlEnv: "AKADEMIA_URL",
    },
    {
      dayOffset: 20,
      subject: "A 3. szivárgási pontod",
      body:
        "Szia {name}!\n\nGyors kérdés a múlt heti térképedhez: a 3. szivárgási pontod (amit jelöltünk) tényleg fáj? Vagy a 2-es a komolyabb?\n\nAmit az Expert Flow auditok adatából látunk:\n— 70% jelzi a 2-est komolyabbnak\n— 20% a 3-ast\n— 10% azt mondja: korábban észre sem vették, most már látható\n\nVálaszolj egy mondatban — érdekel Nálad melyik.\n\nÜdv,\nAttila — Expert Flow",
    },
  ],

  "ai-folyamatvazlat-48h": [
    {
      dayOffset: 3,
      subject: "Megmutattad az ábrát másnak is?",
      body:
        "Szia {name}!\n\nKíváncsi vagyok: megmutattad már valakinek a folyamatábrádat? Ügyfél, partner, könyvelő?\n\nAz Expert Flow auditok tapasztalata: a legtöbben utólag azt mondják, hogy nem is gondolták hogy így néz ki kívülről. Ez a vázlat-ábra fő szerepe — nem az AI-blokkok ajánlása, hanem hogy kívülről lásd.\n\nAz Expert Flow Akadémia 2. modulja pont ezt az ábrázolást tanítja 4 másik folyamatra: onboarding, ajánlatadás, utánkövetés, tartalom.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "Akadémia — 5 modul",
      ctaUrlEnv: "AKADEMIA_URL",
    },
    {
      dayOffset: 8,
      subject: "Mit veszítesz, ha nem teszed",
      body:
        "Szia {name}!\n\nA folyamatvázlatodban a Q3-as válaszod (válaszidő) sokat elárul. Ha az átlag 2-3 nap, az hetente legalább 4-6 érdeklődőt jelent (1/3 elveszik mire visszaírnál).\n\n6 érdeklődő × 30% konverzió × az ügyfél átlag ára = a havi nem-realizált bevétel.\n\nNem ijesztgetés — az Expert Flow rendszerek minden vállalkozásnál ezzel kezdenek. A vázlat 2. blokkjával (automatikus minősítő válasz az érkezéskor) ez 2-3 órára csökkenthető.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "Beszéljük át 20 percet",
      ctaUrlEnv: "CAL_QUALIFICATION_URL",
    },
    {
      dayOffset: 14,
      subject: "Bevezetted már a 2. blokkot?",
      body:
        "Szia {name}!\n\n14 napja küldtük a vázlatot. Sikerült beépíteni valamilyen formában?\n\nAz Expert Flow auditok tapasztalata szerint ezek a leggyakoribb akadályok ennél a pontnál:\n— nem volt idő rászánni\n— túl bonyolultnak tűnt elsőre\n— nem volt eldönthető melyik AI-eszközt válassza\n\nMindhárom kezelhető. Ha bármelyikben elakadtál, írj egyenesen 2-3 mondatban — visszaírunk konkrétan.\n\nÜdv,\nAttila — Expert Flow",
    },
  ],

  "48h-ai-gyorsdiagnozis": [
    {
      dayOffset: 2,
      subject: "Elindítottad már az 1. napi lépést?",
      body:
        "Szia {name}!\n\n48 órája küldtük a 7 napos akciótervedet. A Q3-as válaszodból (mit szeretnél, hogy automatikusan megtörténjen) látszik a legnagyobb hozadékú lépés.\n\nHa az 1. napnál akadtál el — ez gyakori. Az Expert Flow tapasztalata szerint a buktató NEM az eszköz-választás, hanem az hogy mit írjon a default válasz.\n\nTipp: a Q2-ben említett egyik feladatot vedd fel kézzel egyszer, írd át 2x szóban — abból lesz a default. Ezt másold be az AI-blokkba.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 5,
      subject: "3 mintázat amit a rendszerépítéseknél látunk",
      body:
        "Szia {name}!\n\nAmikor az Expert Flow auditok adatát összegezzük, 3 visszatérő mintázatot látunk:\n\n— A tartalom-előkészítés 60%-kal gyorsul, ha a script első vázlatát AI írja.\n— Az admin-idő közel feleződik, ha egy alapvető folyamat AI-blokká válik.\n— A leglátványosabb hatás NEM az eszközöktől jön, hanem a folyamat-tisztulástól.\n\nA Te akciótervedben az 1. lépés pont ennek az induló mintázatnak az alapja.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 9,
      subject: "3 leggyakoribb hiba az 1. heti bevezetésnél",
      body:
        "Szia {name}!\n\nAz Expert Flow auditok során ezek a leggyakoribb hibák az 1. heti bevezetésnél:\n\n1. AZONNAL mindent automatizálni akarni → fókuszálj egyetlen dologra.\n2. Túl bonyolult prompt → a 3 mondatos prompt 80%-ban jobb mint a 30 mondatos.\n3. Nem mérni az eredményt → egy oszlop az Excelben elég.\n\nHa a heti óra >10 (Q4 alapján), érdemes ránézned a 9 900 Ft Belépő Auditra: 8 oldalas elemzés a teljes folyamatodról, 100% beszámítás 7 napon belül.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "9 900 Ft Belépő Audit",
      ctaUrlEnv: "AUDIT_9900_URL",
    },
    {
      dayOffset: 14,
      subject: "Mi lett a 7. napi eredményed?",
      body:
        "Szia {name}!\n\n2 hete küldtük a tervet. Ha bevezetted az 1. lépést, kíváncsi vagyok mi lett a mérhető különbség.\n\nKonkrét válasz amit szívesen olvasunk:\n— Hány óra szabadult fel hetente?\n— Mit gondolsz, fenntartható?\n— Mit változtatnál vissza?\n\nVálaszolj erre az emailre — ha tanulságos, anonim módon felhasználjuk a következő verzió javításához.\n\nÜdv,\nAttila — Expert Flow",
    },
  ],

  "kockazatmentes-audit": [
    {
      dayOffset: 3,
      subject: "Az AI-projektek többsége megbukik — ezért fontos a térkép",
      body:
        "Szia {name}!\n\nAz Expert Flow rendszerépítések tapasztalata: az első próbálkozású AI-projekteknek kb. 90%-a megbukik. NEM mert az AI rossz, hanem mert rossz pontot választanak.\n\nMiért buknak meg leggyakrabban?\n— Túl korán automatizálnak (az ügyfél-folyamat még nem stabil)\n— Rossz eszközt választanak (a hype-ot követve, nem a problémát)\n— Túl bonyolult promptot raknak az AI-blokkba\n— A működésellenőrzés hiányzik (csendes elromlás)\n\nA térképedben a 3. lépés (a piros zóna) pont ezeket kerüli el. Az igazi tanulság: ne azzal kezdj, hogy MIT építsz be — azzal, hogy mit NE.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 7,
      subject: "Mi NEM AI-feladat",
      body:
        "Szia {name}!\n\nA kockázati térkép egyik fő tanulsága: nem MINDEN feladat AI-feladat.\n\nNEM AI-feladat (az Expert Flow tapasztalata szerint):\n— Bizalom-építő telefonhívások\n— Egyedi ügyfél-konfliktus kezelés\n— Tartós kapcsolat-építés (LinkedIn DM, ajánlás-kérés)\n— Stratégiai döntések (árazás, partner-választás)\n— Bármi ahol a hiba ára > 100 000 Ft\n\nAI-feladat:\n— Ismétlődő admin (válaszolgatás, számla, jelentés)\n— Adatgyűjtés és összegzés\n— Sablon-szövegek első vázlata\n— Időpont-koordináció\n— Bármi ahol a hiba ára < 5 000 Ft VAGY visszafordítható\n\nA térképedben a piros zóna ide tartozik — NEM AI-feladat.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 14,
      subject: "Mi történne, ha 30 napra elhalasztanád?",
      body:
        "Szia {name}!\n\nFordított gondolat: mi történne, ha 30 napra elhalasztanád az AI-bevezetést?\n\nValószínűleg semmi nagyon rossz. A vállalkozásod megy ahogy ment. A heti 5-10 óra ismétlődő munka megmarad. Az érdeklődők egy része elveszik (ahogy eddig is).\n\nDE: ha 30 napon belül NEM kezdesz el építeni, a 31. nap is olyan lesz, mint az 1. — semmi nem indul magától. Az „egyszer majd” 6 hónap, 1 év, 2 év.\n\nAz Expert Flow Akadémia 5 modulja lépésről lépésre vezet végig: 1. modul a folyamat-feltárás, 2. az ábrázolás, 3. az AI-blokk-tervezés, 4. a bevezetés, 5. a mérés és optimalizálás.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "Expert Flow Akadémia",
      ctaUrlEnv: "AKADEMIA_URL",
    },
    {
      dayOffset: 21,
      subject: "Készen állsz a 9 900 Ft Belépő Auditra?",
      body:
        "Szia {name}!\n\n3 hete küldtük a kockázati térképedet. Ha azóta volt időd átgondolni, és érzed hogy érdemes mélyebbre menni, itt a Belépő Audit:\n\n— 8 oldalas dokumentum a Te vállalkozásodra szabva\n— 1 órás Loom-magyarázat\n— Notion munkalap a 30/60/90 napos tervhez\n— 9 900 Ft, 14 napos pénzvisszafizetési garancia\n— Ha 7 napon belül továbblépsz a 359 000 Ft Teljes Auditra, a 9 900 Ft 100%-ban beszámít\n\nNem most kell. De ha érzed hogy közeledik az ideje, itt vagyunk.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "9 900 Ft Belépő Audit",
      ctaUrlEnv: "AUDIT_9900_URL",
    },
  ],

  "mondd-el-egyszer": [
    {
      dayOffset: 3,
      subject: "Pár gondolat a leírásodhoz",
      body:
        "Szia {name}!\n\nÁtnéztük a leírásodat (vagy a hangüzenetet). Egy dolog megfogott:\n\nA folyamatod elsősorban azon múlik, hogy NEM Neked kell tovább találgatnod, hanem valaki más rendezi a struktúrát. Ez egy klasszikus „gondolkodási teher” pont — ahol az Expert Flow auditok a legnagyobb hatást szokták hozni.\n\nHa szeretnéd, foglalj egy 20 perces beszélgetést, és közösen átnézzük melyik az az 1 dolog ami a legnagyobb terhet veszi le.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "20 perc Cal.com hívás",
      ctaUrlEnv: "CAL_QUALIFICATION_URL",
    },
    {
      dayOffset: 7,
      subject: "30 perc, 1 szám",
      body:
        "Szia {name}!\n\nKonkrét akció ezen a héten: szánj 30 percet, és számolj ki egyet:\n\n— Hány érdeklődő-üzenettel foglalkoztál ezen a héten?\n— Hány lett ügyfél belőlük?\n— Mennyi órát fordítottál erre összesen?\n\nAz óra/érdeklődő arányt mérd. Ha 1+ óra / érdeklődő, az kapacitás-fal. Ha 0.5 óra alatt, akkor még van hely növelni a forgalmat.\n\nEz az 1 szám többet visz előbbre, mint 5 különböző AI-eszköz kipróbálása.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 14,
      subject: "Készen állsz, hogy ne Neked kelljen kitalálni?",
      body:
        "Szia {name}!\n\n2 hete elmondtad hogyan dolgozol. Ha azóta tovább gondoltad és kezd látszani egy konkrét folyamat, amire most beavatkoznánk, itt a következő szint:\n\nMini sprint (199 000 Ft) — 1 folyamat AI-vázlata + 30 perces magyarázat + 14 napos email-támogatás. NEM kurzus — Te elmondod, mi megépítjük.\n\nVagy ha még messze van — az Expert Flow Akadémia 49 000 Ft első modulja pont ezt tanítja, csak Te csinálod meg.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "Mini sprint — 199 000 Ft",
      ctaUrlEnv: "MINI_SPRINT_URL",
    },
  ],

  "auditprogram-9900": [
    {
      dayOffset: 2,
      subject: "Néztél már bele az auditba?",
      body:
        "Szia {name}!\n\nAz audited 2 napja kiment. Sikerült belenézni?\n\nA legfontosabb pont az 5. szekció (Prioritized roadmap) — ott látszik melyik a 30 napos első lépés. Ha bármi nem egyértelmű, írj.\n\nMég 5 napod van a 9 900 Ft 100%-os beszámítására, ha a 359 000 Ft Teljes Auditra továbblépsz.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 5,
      subject: "Még 2 nap a beszámításra",
      body:
        "Szia {name}!\n\nGyors emlékeztető: még 2 napod van, hogy a 9 900 Ft 100%-ban beszámítson a 359 000 Ft Teljes Auditra.\n\nAmi a Teljes Auditban TÖBB, mint a Belépőben:\n— 30/60/90 napos részletes terv (nem csak 90 nap szintézis)\n— 2× 1 órás konzultáció (nem csak 1 Loom)\n— Notion munkadokumentum, amit közösen szerkesztünk\n— 30 nap kérdés-válasz Telegramon\n\nHa érdekel, foglaljunk egy 20 perces beszélgetést, hogy átnézzük illeszt-e Neked.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "20 perc Cal.com beszélgetés",
      ctaUrlEnv: "CAL_QUALIFICATION_URL",
    },
    {
      dayOffset: 6,
      subject: "Holnap lejár a beszámítás",
      body:
        "Szia {name}!\n\nHolnap (24 órán belül) lejár a 9 900 Ft beszámítása a Teljes Auditra. Utána már nem érvényes.\n\nNem akarunk presszionálni — csak jelezni, hogy ha érdekel, ma még benne vagy.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "Beszéljünk most",
      ctaUrlEnv: "CAL_QUALIFICATION_URL",
    },
    {
      dayOffset: 14,
      subject: "Mit gondolsz az auditról?",
      body:
        "Szia {name}!\n\n2 hete kaptad az auditodat. Mit gondoltál róla?\n\nNem értékelés — kíváncsiak vagyunk, hogy a 8 oldalból melyik szekciót használtad ténylegesen, és melyik volt felesleges. Anonim módon felhasználjuk a következő verzió javításához.\n\n5 mondat válasz is segít.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 30,
      subject: "Bejöttek a 30 napos lépések?",
      body:
        "Szia {name}!\n\n1 hónapja kaptad meg az auditodat. A 30 napos cselekvési terv bevezetése hogyan ment?\n\nKonkrét kérdés: a Roadmap-ben javasolt 1. lépést sikerült?\n— Ha igen, mi lett a mérhető különbség?\n— Ha nem, mi akadályozta?\n\nVálaszolj nyersen — a valódi válaszok segítik az Expert Flow rendszereinek finomítását.\n\nÜdv,\nAttila — Expert Flow",
    },
  ],

  "csapat-szerep-terkep": [
    {
      dayOffset: 3,
      subject: "Megmutattátok egymásnak?",
      body:
        "Szia {name}!\n\nKíváncsiak vagyunk: megmutattátok a térképet egymásnak a csapatban? Milyen volt a reakció?\n\nAz Expert Flow tapasztalata: az első reakció gyakran „nem így csinálom én”. Ez NEM hiba — pont ezért érdemes leírni egyszer.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 7,
      subject: "Mit változtatnátok a térképen?",
      body:
        "Szia {name}!\n\nEgy hét után, ha újraírnátok a térképet, mit változtatnátok?\n\nA tapasztalat: a 3 átfedés közül 1 általában nem igazi — csak két szerep beszél más nyelvet ugyanarra a feladatra. A másik 2 viszont valódi, és érdemes kezelni.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 10,
      subject: "Mini sprint — szerep-tisztítás",
      body:
        "Szia {name}!\n\nHa a térkép alapján egy konkrét átfedést vagy káoszt szeretnétek kezelni — mini sprint formátumban átnézzük együtt, 14 napos email-támogatással. 199 000 Ft.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "Mini sprint",
      ctaUrlEnv: "MINI_SPRINT_URL",
    },
  ],

  "mini-onboarding-vazlat": [
    {
      dayOffset: 3,
      subject: "Bevezettétek a vázlat 1. lépését?",
      body:
        "Szia {name}!\n\n3 napja küldtük a mini-onboarding vázlatot. Sikerült bevezetni az 1. lépést?\n\nAz Expert Flow tapasztalata: a leggyakoribb akadály, hogy nincs felelős a végrehajtásért. A vázlatban ez a Q4-ből rajzolódott ki — érdemes EGYETLEN személyt megnevezni, akkor is, ha az Te vagy.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 7,
      subject: "Az első 7 nap szivárgási pontjai",
      body:
        "Szia {name}!\n\nA Q4-ben (hol veszik el az első 7 napban) leírtad pontosan azt, amiről NEM szoktunk beszélni: az onboarding nem a dokumentum, hanem a kapcsolat.\n\nKonkrét trükk: a 3. napon küldj egy 2 mondatos minden-rendben üzenetet. NEM kérdés — ÁLLÍTÁS, hogy figyelsz rá. Az Expert Flow auditok adatai szerint a retention 30%-kal javul.\n\nÜdv,\nAttila — Expert Flow",
    },
    {
      dayOffset: 10,
      subject: "Mini sprint a teljes onboardingra",
      body:
        "Szia {name}!\n\nHa a vázlat csak az eleje volt, és érzed, hogy érdemes a teljes onboardingot átépíteni — 14 napos mini sprintben közösen összerakjuk.\n\nÜdv,\nAttila — Expert Flow",
      ctaLabel: "Mini sprint",
      ctaUrlEnv: "MINI_SPRINT_URL",
    },
  ],
};

// Az utánkövető cron a legelső dayOffset alapján szerez tudomást
// hogy mikor küldje a következő emailt.
export function getNextSendAt(
  slug: SequenceSlug,
  step: number,
  baseDate: Date,
): { nextSendAt: Date | null; isLast: boolean } {
  const seq = SEQUENCES[slug];
  if (!seq || step >= seq.length) return { nextSendAt: null, isLast: true };
  const next = seq[step];
  const ts = new Date(baseDate.getTime() + next.dayOffset * 24 * 60 * 60 * 1000);
  return { nextSendAt: ts, isLast: step === seq.length - 1 };
}

export function getStep(slug: SequenceSlug, step: number): SequenceStep | null {
  return SEQUENCES[slug]?.[step] ?? null;
}

export function sequenceLength(slug: SequenceSlug): number {
  return SEQUENCES[slug]?.length ?? 0;
}

// ─── Sequence indítás delivery után ─────────────────────────────────────

// Egyetlen helper minden delivery-pontnál: amikor egy LM elment, hívd ezt.
// Idempotens: ha már létezik state sor a submission_id-ra, NEM csinálunk semmit.
//
// A `baseDate` az a referencia-időpont, amelyhez a sequence dayOffset értékek képeznek
// abszolút next_send_at-et. Ez általában a delivered_at (vagy now() ha hiányzik).

import type { SupabaseClient } from "@supabase/supabase-js";

export async function startEmailSequence(
  supabase: SupabaseClient,
  args: {
    submissionId: string;
    slug: SequenceSlug;
    baseDate?: Date;
  },
): Promise<{ started: boolean; reason?: string }> {
  const seq = SEQUENCES[args.slug];
  if (!seq || seq.length === 0) {
    return { started: false, reason: "no-sequence" };
  }

  // Idempotens: ne dupláznunk
  const { data: existing } = await supabase
    .from("lm_email_sequence_state")
    .select("id")
    .eq("submission_id", args.submissionId)
    .maybeSingle();
  if (existing) return { started: false, reason: "already-exists" };

  const baseDate = args.baseDate ?? new Date();
  const firstStep = seq[0];
  const nextSendAt = new Date(baseDate.getTime() + firstStep.dayOffset * 24 * 60 * 60 * 1000);

  const { error } = await supabase.from("lm_email_sequence_state").insert({
    submission_id: args.submissionId,
    lead_magnet_slug: args.slug,
    sequence_step: 0,
    next_send_at: nextSendAt.toISOString(),
    paused: false,
  });

  if (error) {
    console.error("[startEmailSequence] insert failed", error);
    return { started: false, reason: "db-error" };
  }
  return { started: true };
}
