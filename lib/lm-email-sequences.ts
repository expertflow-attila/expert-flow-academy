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

const APP_URL = process.env.NEXTAUTH_URL ?? "https://solobusiness-academy.vercel.app";

export const CTA_URLS: Record<NonNullable<SequenceStep["ctaUrlEnv"]>, string> = {
  AUDIT_9900_URL: `${APP_URL}/audit-9900`,
  AKADEMIA_URL: `${APP_URL}/courses/build-in-public-30nap`,
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
        "Szia {name}!\n\nÁtküldtem a térképedet 3 napja. Tudtál belenézni?\n\nNem ellenőriznem — csak azért írok, mert pár visszajelzés alapján a 2. szivárgási pont szokott a legjobban megfogni. Az érdekel, hogy Te azt látod-e nálad konkrétan, vagy a 3-ast.\n\nVálaszolj 1 mondatban — érdekel.\n\nÜdv,\nAttila\n\nP.S. — Ha a 41 leveles hírlevél is hasznosnak tűnt, nincs külön regisztráció, már bekerültél.",
    },
    {
      dayOffset: 10,
      subject: "Mit csináltam az elmúlt 30 napon",
      body:
        "Szia {name}!\n\nAmióta az AI-rendszereimet a saját napjaimra építem (30 napja), 3 dolog változott:\n\n1. A reggeli admin-időm fele. Mert egy alapvető feladat (érdeklődő-üzenetek osztályozása) AI-blokk lett.\n\n2. A YouTube-felvételeim 60%-kal gyorsabbak. Mert a script-vázlatot Claude írja, én csak rajzolom rá a build-in-public hangot.\n\n3. Nem keresek 0 Ft fizetős ügyfelet — még nincs. Build-in-public 30. nap. Ha érdekel hogyan rakok össze hasonló kis rendszereket, az Akadémia kurzusban lépésről lépésre.\n\nÜdv,\nAttila",
      ctaLabel: "Solo Business Akadémia (49 000 Ft)",
      ctaUrlEnv: "AKADEMIA_URL",
    },
    {
      dayOffset: 20,
      subject: "A 3. szivárgási pontod",
      body:
        "Szia {name}!\n\nGyors kérdés a múlt heti térképedhez: a 3. szivárgási pontod (amit én jelöltem) tényleg fáj? Vagy a 2-es a komolyabb?\n\nEzeket szoktam látni:\n— 70% jelzi a 2-est komolyabbnak\n— 20% a 3-ast\n— 10% azt mondja: „eddig se vettem észre, most már fáj\"\n\nIde válaszolj — érdekel hogy Nálad melyik.\n\nÜdv,\nAttila",
    },
  ],

  "ai-folyamatvazlat-48h": [
    {
      dayOffset: 3,
      subject: "Megrajzoltad az ábrát másnak is?",
      body:
        "Szia {name}!\n\nKíváncsi vagyok: megmutattad már valakinek a folyamatábrádat a vállalkozásodból? Ügyfél, partner, könyvelő?\n\nA legtöbben azt mondják utólag: „nem is gondoltam hogy így néz ki\". Ez a vázlat-ábra fő szerepe — nem az AI-blokkok ajánlása, hanem hogy lásd kívülről.\n\nHa szeretnél tovább menni, az Akadémia 49k-ban a 2. modulban pont ezt az ábrázolást tanítom 4 másik folyamatra (onboarding, ajánlatadás, utánkövetés, tartalom).\n\nÜdv,\nAttila",
      ctaLabel: "Akadémia — 5 modul",
      ctaUrlEnv: "AKADEMIA_URL",
    },
    {
      dayOffset: 8,
      subject: "Mit veszítesz ha nem teszed",
      body:
        "Szia {name}!\n\nA folyamatvázlatodban a Q3-as válaszod (válaszidő) sokat elárul. Ha az átlag 2-3 nap, az hetente legalább 4-6 érdeklődőt veszítesz (1/3 elveszik mire visszaírnál).\n\n6 érdeklődő × 30%-os konverzió × az ügyfeled átlag ára = a havi „elveszett\" bevételed.\n\nNem ijesztgetlek — mindenki ezzel kezdi. Én is. De a vázlat a 2. blokkjával (automatikus minősítő válasz az érkezéskor) ez 2-3 órára csökkenthető.\n\nÜdv,\nAttila",
      ctaLabel: "Beszéljük át 20 percet",
      ctaUrlEnv: "CAL_QUALIFICATION_URL",
    },
    {
      dayOffset: 14,
      subject: "Bevezetted már a 2. blokkot?",
      body:
        "Szia {name}!\n\n14 napja küldtem a vázlatot. Sikerült beépíteni valami formában?\n\nGyakori akadályok ennél a pontnál:\n— „nem találtam időt rá\"\n— „túl bonyolult elsőre\"\n— „nem tudtam melyik AI-eszközt válasszam\"\n\nMindhárom rendben van — de mindhárom kezelhető. Ha bármelyikben elakadtál, írj egyenesen, 2-3 mondatban próbálok segíteni.\n\nÜdv,\nAttila",
    },
  ],

  "48h-ai-gyorsdiagnozis": [
    {
      dayOffset: 2,
      subject: "Beváltottad már az 1. napi lépést?",
      body:
        "Szia {name}!\n\n48 órája küldtem a 7 napos akciótervet. Ahogy néztem a válaszaidat, a Q3 (mit szeretnél hogy automatikusan megtörténjen) a kulcs.\n\nHa az 1. nap akadt el — gyakori. A nagyobb buktató szokott lenni: NEM az eszközöd kiválasztása, hanem az hogy mit ír majd a default válasz.\n\nTipp: a Q2-ben említett egyik feladatot vedd fel kézzel egyszer, írd át 2x szóban — abból lesz a default. Ezt másold be az AI-blokkba.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 5,
      subject: "Mi történt nálam a 30. napon",
      body:
        "Szia {name}!\n\nÉpp a 30. napom van a Solo Business-szel. Még nincs fizetős ügyfelem, és tudatosan nem rohanok — építem a rendszert. Most ez a 7 napos akcióterv-formátum is még kísérlet.\n\nMit látok 30 nap után:\n— A YouTube-csatorna 60%-kal gyorsabb mert a script első vázlatát Claude írja\n— A admin-idő fele mert pár alapvető folyamat AI-blokk\n— A leglátványosabb hatás NEM az eszközök, hanem a folyamat-tisztaság\n\nHa érdekel a hosszabb sztori, a YouTube-csatornán lépésről lépésre van.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 9,
      subject: "3 leggyakoribb hiba az 1. heti bevezetésnél",
      body:
        "Szia {name}!\n\nA 7 napos akciótervet sokan félreértik az első héten:\n\n1. AZONNAL automatizálni akarják az egészet → ne, csak az 1 dolgot.\n\n2. Túl bonyolult promptot raknak az AI-blokkba → a 3 mondatos prompt 80%-ban jobb mint a 30 mondatos.\n\n3. NEM mérik az eredményt → mérés nélkül nincs javítás. Egy oszlop az Excelben elég.\n\nHa a heti óra >10 a Q4-ben, érdemes ránézned a 9 900 Ft Belépő Auditra — 8 oldalas elemzés a teljes folyamatodról, 100% beszámítás 7 napon belül.\n\nÜdv,\nAttila",
      ctaLabel: "9 900 Ft Belépő Audit",
      ctaUrlEnv: "AUDIT_9900_URL",
    },
    {
      dayOffset: 14,
      subject: "Mi lett a 7. napi eredményed?",
      body:
        "Szia {name}!\n\n2 hete küldtem a tervet. Ha bevezetted az 1. lépést, érdekel hogy mi lett a mérhető különbség.\n\nKonkrét válasz formátum, amit szeretnék:\n— Hány óra szabadult fel hetente?\n— Mit gondolsz, fenntartható?\n— Mit változtatnál vissza?\n\nVálaszolj erre az emailre, és ha tanulságos, anonimizálva felteszem egy YouTube-videóba (csak kérdezni fogok előtte).\n\nÜdv,\nAttila",
    },
  ],

  "kockazatmentes-audit": [
    {
      dayOffset: 3,
      subject: "Az AI-projekteim 90%-a megbukott",
      body:
        "Szia {name}!\n\nMielőtt belevágsz a kockázati térképed 1. lépésébe — egy gondolat:\n\nAz elmúlt 18 hónapban kb. 30 különböző AI-rendszert próbáltam felépíteni magamnak. 27 megbukott. A 3 ami működik, a maradék 90%-ot finanszírozza eredményekben.\n\nMiért buktak meg a 27-en?\n— 10x: túl korán automatizáltam (az ügyfél-folyamat még nem volt stabil)\n— 8x: rossz eszközt választottam (akkor még csak a ChatGPT volt, most már más is van)\n— 6x: a prompt túl bonyolult lett és önreferens hibákba esett\n— 3x: a Mailchimp / Make / Zapier verziók néma elromlása senki nem vette észre\n\nA térképedben a 3. lépés (a piros zóna) pont ezeket kerüli el. Ezért kezdj azzal NEM hogy mit építsz be, hanem hogy mit NE.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 7,
      subject: "Mi NEM AI-feladat",
      body:
        "Szia {name}!\n\nA legfontosabb dolog amit a kockázati térképből ki lehet hozni: nem MINDEN feladat AI-feladat.\n\nNEM AI-feladat:\n— Bizalom-építő telefonhívások\n— Egyedi ügyfél-konfliktus kezelés\n— Tartós kapcsolat-építés (LinkedIn DM, ajánlás-kérés)\n— Stratégiai döntések (árazás, partner-választás)\n— Bármi ahol a hiba ára > 100 000 Ft\n\nAI-feladat:\n— Ismétlődő admin (válaszolgatás, számla, jelentés)\n— Adatgyűjtés és összegzés\n— Sablon-szövegek első vázlata\n— Időpont-koordináció\n— Bármi ahol a hiba ára < 5 000 Ft VAGY visszafordítható\n\nA térképedben a piros zóna lépéseid pont ide tartoznak (NEM AI-zónába).\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 14,
      subject: "Mi történne ha 30 napra elhalasztanád?",
      body:
        "Szia {name}!\n\nFordított gondolat: mi történne ha 30 napra elhalasztanád az AI-bevezetést?\n\nValószínűleg semmi nagyon rossz. A vállalkozásod megy ahogy ment. A heti 5-10 óra ismétlődő munka megmarad. Az érdeklődők egy része elveszik (ahogy eddig is).\n\nDE az is igaz, hogy ha 30 napon belül NEM kezdesz el építeni, a 31. nap is olyan lesz mint az 1. — semmi nem indul magától. Az „egyszer majd\" 6 hónap, 1 év, 2 év.\n\nÉn ezt 60 nappal ezelőtt értettem meg saját magamon. Build-in-public 30. napon vagyok. Ha akarod, lásd hogyan halad lépésről lépésre — az Akadémiában a teljes folyamat 5 modulban dokumentált.\n\nÜdv,\nAttila",
      ctaLabel: "Solo Business Akadémia",
      ctaUrlEnv: "AKADEMIA_URL",
    },
    {
      dayOffset: 21,
      subject: "Készen állsz a 9 900 Ft Belépő Auditra?",
      body:
        "Szia {name}!\n\n3 hete küldtem a kockázati térképedet. Ha azóta volt időd átgondolni, és érzed hogy érdemes mélyebbre menni, itt a Belépő Audit:\n\n— 8 oldalas dokumentum a Te vállalkozásodra szabva\n— 1 órás Loom-magyarázat tőlem\n— Notion munkalap a 30/60/90 napra\n— 9 900 Ft, 14 napos pénzvisszafizetési garancia\n— Ha 7 napon belül továbblépsz a 359k Teljes Auditra, a 9 900 Ft 100%-ban beszámít\n\nNem most kell. De ha érzed hogy közeledik az ideje, itt vagyok.\n\nÜdv,\nAttila",
      ctaLabel: "9 900 Ft Belépő Audit",
      ctaUrlEnv: "AUDIT_9900_URL",
    },
  ],

  "mondd-el-egyszer": [
    {
      dayOffset: 3,
      subject: "Beszédelmosó — egy 2 perces hangüzenet",
      body:
        "Szia {name}!\n\nHallgattam vissza a leírásodat (vagy a hangüzeneted), és néhány gondolat ami megfogott:\n\n— A folyamatod elsősorban azon múlik hogy NEM neked kell tovább találgatnod, hanem valaki más rendezi a struktúrát.\n\nHa szeretnéd, foglalj egy 20 perces beszélgetést, és közösen átnézzük melyik az a 1 dolog ami a legnagyobb gondolkodási terhet veszi le.\n\nÜdv,\nAttila",
      ctaLabel: "20 perc Cal.com hívás",
      ctaUrlEnv: "CAL_QUALIFICATION_URL",
    },
    {
      dayOffset: 7,
      subject: "Mit nézel meg ezen az 1 napon",
      body:
        "Szia {name}!\n\nKonkrét akció ezen a héten: szánj 30 percet és számolj ki egyet:\n\n— Hány érdeklődő-üzenettel foglalkoztál ezen a héten?\n— Hány lett ügyfél belőlük?\n— Mennyi órát fordítottál erre összesen?\n\nÉs aztán nézd meg az óra-érdeklődő arányt. Ha 1+ óra / érdeklődő, az kapacitás-fal. Ha 0.5 óra alatt, akkor még van hely növelni a forgalmat.\n\nEz az 1 szám előbbre visz mint 5 különböző AI-eszköz kipróbálása.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 14,
      subject: "Készen állsz hogy ne te találd ki tovább?",
      body:
        "Szia {name}!\n\n2 hete elmondtad hogyan dolgozol. Ha azóta tovább gondoltál rajta és kezd kirajzolódni hogy egy konkrét folyamatra már most beavatkoznék, itt van a következő szint:\n\nMini sprint (199 000 Ft) — 1 folyamat AI-vázlata + 30 perces magyarázat + 14 napos email-támogatás. NEM kurzus — Te elmondod, mi megépítjük.\n\nVagy ha még messze van — az Akadémia 49 000 Ft első modulja pont ezt tanítja, csak Te csinálod meg.\n\nÜdv,\nAttila",
      ctaLabel: "Mini sprint — 199 000 Ft",
      ctaUrlEnv: "MINI_SPRINT_URL",
    },
  ],

  "auditprogram-9900": [
    {
      dayOffset: 2,
      subject: "Néztél már bele az auditba?",
      body:
        "Szia {name}!\n\nAz audited 2 napja kiment. Tudtál belenézni?\n\nA legfontosabb pont az 5. szekció (Prioritized roadmap) — ott látszik melyik a 30 napos első lépés. Ha bármi nem egyértelmű, írj.\n\nMég 5 napod van a 9 900 Ft 100%-os beszámítására ha a 359 000 Ft Teljes Auditra továbblépsz.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 5,
      subject: "Még 2 nap a beszámításra",
      body:
        "Szia {name}!\n\nGyors emlékeztető: még 2 napod van hogy a 9 900 Ft 100%-ban beszámítson a 359 000 Ft Teljes Auditra.\n\nAmi a Teljes Auditban TÖBB mint a Belépőben:\n— 30/60/90 napos részletes terv (nem csak 90 nap szintézis)\n— 2× 1 órás konzultáció (nem csak 1 Loom)\n— Notion munkadokumentum amit közösen szerkesztünk\n— 30 nap kérdés-válasz Telegramon\n\nHa érdekel, foglaljunk egy 20 perces beszélgetést hogy átnézzük illeszt-e neked.\n\nÜdv,\nAttila",
      ctaLabel: "20 perc Cal.com beszélgetés",
      ctaUrlEnv: "CAL_QUALIFICATION_URL",
    },
    {
      dayOffset: 6,
      subject: "Holnap lejár a beszámítás",
      body:
        "Szia {name}!\n\nHolnap (24 órán belül) lejár a 9 900 Ft beszámítása a Teljes Auditra. Utána már nem érvényes.\n\nNem akarok presszionálni — csak jelezni hogy ha érdekel, ma még benne vagy.\n\nÜdv,\nAttila",
      ctaLabel: "Beszéljünk most",
      ctaUrlEnv: "CAL_QUALIFICATION_URL",
    },
    {
      dayOffset: 14,
      subject: "Mit gondolsz az auditról?",
      body:
        "Szia {name}!\n\n2 hete kaptad az auditodat. Akkor most kérdezem visszafogottan: mit gondoltál róla?\n\nNem értékelés — kíváncsi vagyok, hogy a 8 oldalból melyik szekciót használtad ténylegesen, és melyik volt felesleges. Anonim módon felhasználom a következő verzió javításához.\n\n5 mondat válasz is segít.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 30,
      subject: "Bejöttek a 30 napos lépések?",
      body:
        "Szia {name}!\n\n1 hónapja kaptad meg az auditodat. A 30 napos cselekvési terv bevezetése hogyan ment?\n\nKonkrét kérdés: a Roadmap-ben javasolt 1. lépést sikerült?\n— Ha igen, mi lett a mérhető különbség?\n— Ha nem, mi akadályozta?\n\nVálaszolj nyersen — szeretem a valódi válaszokat.\n\nÜdv,\nAttila",
    },
  ],

  "csapat-szerep-terkep": [
    {
      dayOffset: 3,
      subject: "Megmutattad a csapatnak?",
      body:
        "Szia {name}!\n\nKíváncsi vagyok: megmutattad a térképet a csapatnak? És ha igen, milyen volt a reakció?\n\nGyakran az első reakció: „nem így csinálom én\". Ez NEM hiba — pont ezért érdemes leírni egyszer.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 7,
      subject: "Mit változtatnál a térképen?",
      body:
        "Szia {name}!\n\nEgy hét után, ha kézbe vetted volna a térképet és újraírnád, mit változtatnál?\n\nGyakran a 3 átfedés közül 1 nem igazi átfedés, csak más nyelvet beszél a két szerep. A másik 2 viszont valódi és érdemes kezelni.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 10,
      subject: "Mini sprint — szerep-tisztítás",
      body:
        "Szia {name}!\n\nHa a térkép alapján egy konkrét átfedést / káoszt szeretnél kezelni — mini sprint formátumban átnézzük együtt 14 napos email-támogatással. 199 000 Ft.\n\nÜdv,\nAttila",
      ctaLabel: "Mini sprint",
      ctaUrlEnv: "MINI_SPRINT_URL",
    },
  ],

  "mini-onboarding-vazlat": [
    {
      dayOffset: 3,
      subject: "Bevezetted a vázlat 1. lépését?",
      body:
        "Szia {name}!\n\n3 napja küldtem a mini-onboarding vázlatot. Sikerült bevezetni az 1. lépést?\n\nA leggyakoribb akadály: nincs „ki a felelős a végrehajtásért\". A vázlatban ez a Q4-ből rajzolódott ki — érdemes EGYETLEN személyt megnevezni, akkor is ha az Te vagy.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 7,
      subject: "Az első 7 nap szivárgási pontjai",
      body:
        "Szia {name}!\n\nA Q4-ben (hol veszik el az első 7 napban) leírtad pontosan azt amiről NEM beszélünk általában: az onboarding nem a dokumentum, hanem a kapcsolat.\n\nKonkrét trükk: a 3. napon küldj egy 2 mondatos minden-rendben üzenetet. NEM kérdés - ÁLLÍTÁS hogy figyelsz rá. A retention javul 30%-kal.\n\nÜdv,\nAttila",
    },
    {
      dayOffset: 10,
      subject: "Mini sprint a teljes onboardingra",
      body:
        "Szia {name}!\n\nHa a vázlat csak az eleje volt, és érzed hogy érdemes a teljes onboardingot átépíteni — 14 napos mini sprintben közösen összerakjuk.\n\nÜdv,\nAttila",
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
