# LM 02 — Kockázatcsökkentés: „Kockázatmentes AI-Folyamat Audit"

> Hormozi-keret: **kockázatcsökkentés értékvektor** — „mit takarítok el az ügyfél útjából, hogy ne féljen belépni?"
>
> Cél: a langyos érdeklődő, aki már látta a többi lead magnetet de „még nem áll készen", lépjen be úgy hogy semmit nem kockáztat. Minősítő űrlap, kockázati térkép, biztonságos első lépés.

## 1. Név
**Kockázatmentes AI-Folyamat Audit** — slug: `kockazatmentes-audit`
URL: `/lead-magnet/kockazatmentes-audit`

## 2. Ígéret (egy mondat)
*„Megnézzük együtt mi a 3 legkisebb kockázatú, de legnagyobb hatású AI-lépésed — anélkül, hogy bármit el kéne köteleződnöd, vagy bármit fizetnél."*

## 3. Célcsoport
- Aki már 2-3 hete olvassa a Expert Flow newslettert vagy követi a YouTube-csatornát, de még nem lépett
- Aki egyszer beleugrott egy „AI-projektbe" és csalódott (n8n flow ami leállt, ChatGPT-promptok amik nem skálázódtak)
- Aki tudja hogy automatizálnia kellene, de fél a következőtől:
  - kidobott idő/pénz lesz
  - túl bonyolult lesz neki
  - „nem AI-fej" és úgy érzi nem fog érteni belőle semmit
  - lesz egy AI-rendszer ami félúton elromlik és karban kell tartania

## 4. A 3 fő félelem, amit a lead magnet kezel

A 11 azonosított félelemből (lásd `memory/project_anna_business_audit.md` ICP-félelem mátrix) ez a 3 a fő:

| Félelem | Hogy kezeljük a lead magnetben |
|---------|--------------------------------|
| **„Kidobott pénz lesz"** | Az audit teljesen ingyenes, semmi fizetés, semmi card-on-file. A kimenet konkrét érték (térkép + 3 javaslat) — kézzelfogható, NEM elv. |
| **„Túl bonyolult lesz nekem, nem AI-fej vagyok"** | A térkép magyar, NEM technikai szavakkal. „AI-folyamat" helyett „automatikus emlékeztető", „adatbejegyzés helyetted". Hangsúly: TE NEM tanulsz AI-t, MI lefordítjuk. |
| **„Nem látom előre mit kapok"** | A landing oldalon konkrét minta-PDF (anonymizált, korábbi ügyfélé) letölthető. Pontosan tudja mit kap mielőtt megadja az adatait. |

## 5. Vágyott eredmény
- „Tudom hogy mi a következő lépésem, és tudom hogy biztonságos"
- „Nem kell semmit kötelezően megvennem, hogy hasznos legyen"
- „Megtudtam mit NE csináljak elsőre — ez egy elkerülhető pofáraesés"

## 6. Adatbekérő űrlap (7 kérdés, 5 perc)

**Q1.** Milyen szolgáltatást nyújtasz? *(short text)*

**Q2.** Mi most a legnagyobb működési problémád? *(textarea, 2 sor)*

**Q3.** Mitől tartasz a legjobban egy AI-rendszer bevezetésével kapcsolatban? *(checkbox, többet is jelölhet)*
- [ ] Kidobott pénz lesz
- [ ] Nem fog működni / félúton elromlik
- [ ] Túl bonyolult, nem fogom érteni
- [ ] Nem lesz időm rá hogy belevágjak
- [ ] Az ügyfeleim észreveszik hogy AI van mögötte és nem fog tetszeni
- [ ] Egyéb: _________

**Q4.** Volt már rossz tapasztalatod automatizálással / marketing-eszközzel / online tanfolyammal? Ha igen, röviden mi történt? *(textarea, opcionális)*

**Q5.** Milyen rendszereket / eszközöket használsz most? *(checkbox lista, multi-select)*

**Q6.** Mennyit hajlandó vagy fizetni egy első biztonságos AI-lépésért a vállalkozásodban? *(radio)*
- [ ] 0 Ft, csak ha biztos vagyok benne
- [ ] 5-15 000 Ft, kis kockázat
- [ ] 30-50 000 Ft, ha bizonyítottan működik
- [ ] 100k+ Ft, ha látom hogy érti a problémámat

**Q7.** Hányan vagytok a vállalkozásban? *(radio: 1 / 2-5 / 6-15 / 15+)*

**Q6 az ICP-szűrésre szolgál.** A „0 Ft, csak ha biztos vagyok benne" választ adóknak ingyenes audit + 41-leveles newsletter, NEM kemény eladás. A „100k+ Ft" választ adóknak Cal.com direkt.

## 7. AI elemzés — Kockázati térkép

System prompt (`lib/anthropic.ts` `kockazatmentes-audit` slug):

```
KIMENET SZERKEZET:

# Kockázati térkép — [Keresztnév]

## Amit a válaszaidból látok
3-4 mondat, konkrét. Q2 és Q4 idézet/parafrázis.

## A 3 lehetséges első lépés — kockázati súlyozással
Három KONKRÉT első lépés, mindegyikhez:

### 1. lépés [név]
- Mit csinál: [1-2 mondat magyarul, nem technikai]
- Kockázat: [alacsony / közepes / magas]
- Miért éppen ez a kockázati szint: [1 mondat]
- Idő: [hány óra/nap]
- Költség: [Ft]
- Mit kapnál vissza: [konkrét eredmény + becslés]

### 2. lépés [név] — UGYANEZ
### 3. lépés [név] — UGYANEZ

## Az ajánlott első lépés (és miért)
A 3 közül 1-et ajánlunk. NEM a legdrágábbat, NEM a legolcsóbbat —
azt, ami a Q3 félelmeket leginkább kezeli.

3-4 mondat indoklás. Konkrét kockázatcsökkentő elemek:
- Mit garantálunk
- Mikor lépsz vissza ha nem tetszik
- Mit kapnál ha közben elromlik valami

## Amit NE csinálj első lépésnek (kockázati piros zóna)
2 anti-pattern. Konkrét. Pl. „NE az érdeklődő-szűrést automatizáld
elsőre, mert ha rosszul minősít, elveszítheted az ügyfeleid 20%-át."

## Ha tovább mennél biztonságosan
1 bekezdés — vagy ingyenes 41-leveles newsletter (Q6=0 esetén)
vagy 9 900 Ft belépő audit (Q6>0 esetén).

HOSSZ: max 900 szó.
```

## 8. Ügyfélnek küldött dokumentum

PDF formátum (Puppeteer-rel renderelt branded HTML). A „kockázati térkép" vizuálisan is ábrázolva — egy táblázat ahol a 3 lépés sorai kockázat-szintenként vannak színkódolva (zöld/sárga/piros háttér).

## 9. Belső admin / CRM folyamat

```
Form submit → Supabase pending + qualification_result kiszámítása Q6 alapján
    ↓
Cron → Claude generálás
    ↓
Hermes Telegram review (KÖTELEZŐ ennél — a kockázati térkép „bizonyítvány")
    ↓
APPROVE → PDF render (puppeteer) → email + MailerLite + lead score
EDIT → Attila átírja → PDF render → email
REJECT → személyes email Attilától (nem AI-generált) másnap reggel
```

**Lead score** (új mező a `lead_magnet_submissions` táblába):
- Q6 érték * 10 = base score (0/15/40/100)
- + 20 pont ha Q5-ben már van AI-eszköz
- + 15 pont ha Q7=1 (sólo, nem alkalmazottal vesződik)
- + 10 pont ha Q4 üres (nincs rossz tapasztalat — könnyebb meggyőzni)

Score >50: Cal.com link a +5 napos emailben.
Score 20-50: 9 900 Ft audit ajánlás.
Score <20: 41-leveles newsletter only, kemény eladás semmilyen formában.

## 10. Utánkövető email sorozat (5 email, 21 nap — lassabb mert kifogás-kezelő LM)

| Nap | Tárgysor | Tartalom |
|-----|----------|------------|
| 0 | „Itt a kockázati térképed" | A generált PDF + 1 bekezdés Attilától személyes hangon |
| +3 | „Az AI-projekteim 90%-a megbukott" | Saját build-in-public sztori — kudarcok, mit tanult |
| +7 | „Mi NEM AI-feladat" | Lista az anti-pattern-ekről, kockázatcsökkentő hangulat |
| +14 | „Mi történne ha 30 napra elhalasztanád?" | Reverse psychology: NEM ajánljuk most a vásárlást |
| +21 | „Itt a Expert Flow 49k Akadémia — ha készen állsz" | CTA, de soft |

Score >50 ügyfeleknek **+5 napos email** beszúrva: „Beszéljünk 20 percet — itt a Cal.com link, semmi eladás, csak megnézzük együtt."

## 11. Átvezetés fizetős ajánlatba

Lead score alapján:
- **Score >50:** Cal.com 20 perc qualification call (NEM eladási hívás) → ha jó fit → 9 900 Ft audit közvetlenül
- **Score 20-50:** 9 900 Ft Belépő Audit (LM8 logika) link a +14. napos emailben
- **Score <20:** 41-leveles newsletter + Skool free, semmi fizetős érintés

**Kockázatcsökkentő elemek a 9 900 Ft auditnál (LM8/11 részletes):**
- 100% beszámítás a 359k auditba
- 7 napos pénzvisszafizetési garancia
- „Nem fizetsz semmit a hangulatért — csak ha hasznos volt"
- Részletes minta-PDF a landing oldalon

## 12. Mérőszámok

| Metrika | Cél | Megjegyzés |
|---------|-----|-------------|
| Heti submission | 10-15 / hét | Lassabb mint LM1 — kvalifikáció |
| Score distribution | 30% high (>50), 50% mid (20-50), 20% low | Egészséges funnel |
| Cal.com booking rate (score >50) | ≥40% | Score modell minősége |
| 30-napi 9 900 Ft konverzió (score 20-50) | ≥10% | Sales bridge minősége |
| Cancellation/refund rate az audit után | ≤5% | Kockázatcsökkentés ténylegesen működik-e |

## 13. Mit kell technikailag elkészíteni

- [ ] SQL migráció: `lead_magnet_slug` enum + új `lead_score` integer + `qualification_result` enum kibővítése
- [ ] `app/lead-magnet/kockazatmentes-audit/page.tsx` + `koszonom`
- [ ] `lib/anthropic.ts` system prompt + lead score számítási logika
- [ ] PDF render endpoint: `app/api/lead-magnet/render-pdf/route.ts` (Puppeteer Vercel)
- [ ] Email template kockázati térkép-szerkezettel (color-coded táblázat)
- [ ] Cal.com új event type: `solobusiness/kvalifikacio-20min` (NEM audit, csak qualif)
- [ ] Lead score → Cal.com link dinamikus injektálás az emailbe
- [ ] Minta PDF (anonymizált) feltöltése publikus `/static/sample-kockazati-terkep.pdf`-be
