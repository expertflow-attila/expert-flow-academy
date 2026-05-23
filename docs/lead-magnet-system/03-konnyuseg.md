# LM 03 — Könnyűség: „Mondd el egyszer, mi történik nálad"

> Hormozi-keret: **könnyűség értékvektor** — „milyen energia kell az ügyféltől, hogy eljusson az eredményig?"
>
> Cél: az érdeklődő legalsó energia-küszöbön tudjon belépni. Nem űrlap, nem PDF, nem strukturált gondolkodás — csak elmondja egyszer (szöveg vagy hangüzenet), MI lefordítjuk.

## 1. Név
**Mondd el egyszer, mi történik nálad — mi rendszerré alakítjuk** — slug: `mondd-el-egyszer`
URL: `/lead-magnet/mondd-el-egyszer`

## 2. Ígéret (egy mondat)
*„Mondd el egyszer hangban vagy szövegben, hogyan működik most a vállalkozásod — visszakapsz egy egyszerű, magyarul leírt rendszer-térképet azzal, hogy hol érdemes először AI-folyamatot bevezetned."*

## 3. Célcsoport
- A „nincs időm gondolkodni" típus — vezető tanácsadó, ügyvéd, kreatív
- Aki utál űrlapokat tölteni (Q4 a 02-es LM-ből: „nincs időm bevágni 7 kérdést")
- Aki szóban jobban kifejezi magát mint írásban — terapeuta, coach (NEM ügyfél), tanár

## 4. Probléma — „a gondolkodási teher"
- „Tudom hogy automatizálnom kellene, de nincs energiám kitalálni mit"
- „Mindenhol kérdőívek meg űrlapok — nem akarom kifesteni a folyamatomat"
- „Inkább mondanám szóban, de senki nem hallgat meg AI-fejjel"
- Pszichológiai blokk: az „üzleti folyamat" szótól már fáj a feje

## 5. Vágyott eredmény
- „Csak elmondtam egyszer, és ők lefordították egy térképre — én nem dolgoztam érte"
- „Most már látom hogyan néz ki kívülről a működésem"
- „Tudom mi az első lépés, és nem kellett nekem kitalálnom"

## 6. Bekérő folyamat (a lehető legkisebb erőfeszítés)

**3 input opció a landing oldalon — ügyfél választ:**

### Opció A: 3 perc hangüzenet (preferált, legkisebb energia)
- Beágyazott audio recorder a böngészőben (MediaRecorder API + base64 upload)
- Egyszerű prompt feljön a felvétel előtt:
  > „Mesélj el 3 percben hogyan dolgozol most. Honnan jönnek az ügyfeleid? Mit csinálsz amikor egy új érdeklődő jelentkezik? Mit utálsz benne? — Nincs rossz válasz, csak mesélj."
- Backend: Whisper-1 (vagy magyar Whisper-large-v3) transzkript → markdown szöveg

### Opció B: 5-10 mondatos szöveg
- Egyetlen nagy textarea
- Ugyanaz a prompt
- Min. 200 karakter, max 4000

### Opció C: Loom / video link
- Ha valaki már felvett egy bemutatkozó videót — bedobja a linket
- Backend: yt-dlp / Loom API → audio → Whisper

**Mindegyik output ugyanaz: nyers szöveges leírás → Claude bemenete.**

Kötelező mezők: név + email + GDPR. **Ennyi.**

## 7. AI elemzés — folyamatábra + problémalista + javaslat

System prompt (`lib/anthropic.ts` `mondd-el-egyszer` slug):

```
Egy szóló vállalkozó elmondta szabad szöveggel hogyan dolgozik most. A
te feladatod: HALLGASD MEG (NEM ítéld meg), és alakítsd át a kaotikus
elbeszélést 4 strukturált kimenetté.

A bemenet rendetlen, ismétlődő, lehet hogy oda-vissza ugrál a témák
között. Ez NORMÁLIS — a Te dolgod hogy rendet csinálj benne.

KIMENET SZERKEZET:

# A rendszered, ahogy én látom — [Keresztnév]

## Így működsz most
Folyamatábra-szerű leírás. NEM diagram, csak strukturált szöveg:

  ÉRDEKLŐDŐ → [hogyan jön] → [Te mit csinálsz] → [következő lépés]
  → [ajánlat] → [döntés] → [ügyfél lesz vagy nem]

Minden lépést 1-2 mondattal. NEM technikai szavakkal.

## Itt nehéz most neked
3 pont, KONKRÉT idézetekkel a hangüzenetből/szövegből. Mindegyik:
- mi a fájdalom (1 mondat)
- mit mondtál róla (parafrázis vagy idézet)
- mi a következménye (1 mondat)

## Ezeket lehetne egyszerűsíteni
2-3 konkrét egyszerűsítés. Mindegyik:
- mit csinál (1-2 mondat, ZERO technikai szó)
- mennyi terhet vesz le rólad (becslés)

## Az első javasolt lépés
EGYETLEN dolog. Az amelyik:
- a legkisebb energiát igényli tőled (te elmondod ÉS kész)
- a legtöbb gondolkodási terhet veszi le
- 7-14 napon belül felépíthető

3-4 mondat magyarázat, hangon: „nálam ez így nézne ki".

## Ha tovább mennél
Egy bekezdés a 199k mini sprintről VAGY a 49k Akadémiáról.
Hangsúly: te NEM tanulsz semmit, mi felépítjük.

HOSSZ: max 700 szó. NULLA AI/tech kifejezés.
Tilos: workflow, framework, pipeline, deploy, scale, automation,
integration. Helyette: „rendszer", „folyamat", „automatikus".
```

## 8. Kimeneti dokumentum

Vizuális PDF az alábbi struktúrával:

```
┌────────────────────────────────────────────────────────┐
│  [Solo Business header]                                 │
│                                                          │
│  A rendszered, ahogy én látom — [Keresztnév]            │
│                                                          │
│  ▼ Így működsz most (folyamatábra blokkokkal)           │
│                                                          │
│  ┌────┐    ┌────┐    ┌────┐    ┌────┐                  │
│  │ 1  │ ─► │ 2  │ ─► │ 3  │ ─► │ 4  │                  │
│  └────┘    └────┘    └────┘    └────┘                  │
│                                                          │
│  ▼ Itt nehéz most neked (3 piros pont, listával)        │
│  ▼ Ezeket lehetne egyszerűsíteni (zöld pontok)          │
│  ▼ Az első javasolt lépés (kiemelve)                    │
│  ▼ Ha tovább mennél (CTA)                               │
└────────────────────────────────────────────────────────┘
```

Az „Így működsz most" blokk Excalidraw-ban generálva (mint LM2-ben), inline kép PDF-ben.

## 9. Belső admin / CRM folyamat

```
Input (audio/text/link)
    ↓
Whisper transzkript (audio esetén)
    ↓
Supabase pending + raw_input mező
    ↓
Cron → Claude
    ↓
Hermes review (KÖTELEZŐ — nehéz LM, könnyű félreérteni)
    ↓
APPROVE → PDF + email + MailerLite
```

Új mezők a táblába:
- `raw_input_type` (audio / text / loom)
- `raw_input_storage_url` (Supabase Storage publikus, anonymized 30 nap után)
- `whisper_cost_huf` (transzkripciós költség)

## 10. Utánkövető email sorozat (4 email, 14 nap)

| Nap | Tárgysor | Tartalom |
|-----|----------|------------|
| 0 | „Itt a rendszered térképe — [Keresztnév]" | PDF + személyes Attila-bekezdés |
| +3 | „Beszédelmosó — egy 2 perces hangüzenet tőlem" | Attila személyesen válaszol hangüzenettel arra amit hallott (csak top 30%-nak — high-touch) |
| +7 | „Mit nézel meg ezen az 1 napon" | Konkrét akció: kezdj el számolni a Q1-ben említett feladat időigényét |
| +14 | „Készen állsz hogy ne te találd ki tovább?" | 199k mini sprint CTA / 49k Akadémia másodlagos |

A +3 napi „Attila hangüzenete" csak az élő top 30%-nak megy — manuális, Hermes Telegram értesít Attilát a +2. napon: „X embernek küldj 2 perces hangüzenetet". Lead score alapú szűrés (lásd LM2 logika).

## 11. Átvezetés fizetős ajánlatba

Cél ajánlat: **199 000 Ft mini sprint** (1 folyamat AI-vázlat + bevezetés).

Miért az: ez az LM olyan ügyfelet vonz aki NEM akar gondolkodni — ezt az ajánlat is tükrözze. NEM Akadémia (mert ott neki kell tanulnia), hanem teljesen done-for-you mini sprint.

Másodlagos CTA: 49k Akadémia (azoknak, akik a `+7` napi emailre sem reagálnak).

## 12. Mérőszámok

| Metrika | Cél | Megjegyzés |
|---------|-----|-------------|
| Hangüzenet vs szöveg vs loom arány | 60/30/10% | Validálja a hipotézist hogy hang a legalacsonyabb energia |
| Heti submission | 8-12 / hét | Kisebb volumen, magasabb intent |
| Approve rate | ≥90% | A „könnyűség"-hez nagyon jó output kell |
| +3 napi hangüzenet open / reply | ≥40% open, ≥10% reply | High-touch hatás mérése |
| 30-napi 199k konverzió | ≥6% | Magasabb mint LM2 mert az ICP komolyabb |
| Whisper átlagköltség | ≤80 Ft / submission | Költségkontroll |

## 13. Mit kell technikailag elkészíteni

- [ ] Audio recorder komponens (MediaRecorder API, Next.js client component)
- [ ] Supabase Storage bucket `lead-magnet-audio` (30 napos retention policy)
- [ ] Whisper integráció (`lib/whisper.ts` — OpenAI Whisper-1 vagy önhostolt magyar-Whisper-large-v3)
- [ ] yt-dlp / Loom API integráció (`lib/loom-extract.ts`)
- [ ] Excalidraw render (`lib/excalidraw-render.ts` — már él más helyen, lásd `Expert Flow - AI Team/libs/`)
- [ ] PDF render Puppeteer-rel inline képpel
- [ ] Új lead_magnet_slug enum value
- [ ] Hermes notifier: a review üzenethez audio link is csatolva
- [ ] Cost tracking: Whisper + Claude külön sorként a `generation_cost_huf`-ban
