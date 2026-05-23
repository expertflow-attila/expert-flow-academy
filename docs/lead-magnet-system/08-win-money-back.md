# LM 08 — Win Your Money Back: „9 900 Ft Belépő Audit + 100% Beszámítás"

> Hormozi-keret: **win your money back** — fizetős belépő, de visszanyerhető ha tovább megy az ügyfél a fő ajánlatba.
>
> Cél: a hideg „free-lead" funnel-ből kitörés. Az érdeklődő kis összeggel elköteleződik (Hormozi szerint a komoly lead innen indul), és ha 7 napon belül továbblép a 359k auditba, a 9 900 Ft 100%-ban beszámít.

## 1. Név
**9 900 Ft Belépő Audit — visszanyerhető** — slug: `auditprogram-9900`
URL: `/audit-9900` (NEM `/lead-magnet/...` mert ez fizetős)

## 2. Ígéret (egy mondat)
*„Fizess 9 900 Ft-ot az AI-Működési Auditomért — ha 7 napon belül továbblépsz a teljes rendszertervre, az audit teljes ára beszámít. Nem 50%, nem 80% — 100%."*

## 3. Mire épül (belépő ajánlat)
**Az AI-Működési Audit = LM4 (problémafeltáró) prémium verziója.** Különbség:

| LM4 (ingyenes) | LM8 (9 900 Ft) |
|----------------|------------------|
| 3 kérdéses gyors form | 12 kérdéses mélyfeltáró |
| 4 oldalas térkép | 8 oldalas audit + Excalidraw ábra + 1 órás Loom-magyarázat |
| AI-generált, Hermes-review | AI-generált + Attila 30 perc kézi átnézés + finomítás |
| Email-only delivery | PDF + Loom + Notion munkadokumentum |
| Auto-release fallback | Garantáltan 3 munkanapon belül |
| Heti 50 darab kapacitás | Heti 5 darab kapacitás |

## 4. Beszámítási mechanika (jogilag óvatos)

A landing oldalon és a tranzakciós emailben **egyértelmű**:

> „Ha 7 naptári napon belül az audit átvételétől megrendeled a Teljes Audit + Rendszerterv csomagot (359 000 Ft), a 9 900 Ft 100%-ban beszámít — azaz 349 100 Ft-ot fizetsz, nem 359 000-et.
>
> A beszámítás:
> - csak a 359 000 Ft-os csomagra érvényes (nem a 199 000 Ft mini sprintre)
> - csak az átvételtől számított 7 napon belül indítható
> - egyszer használható fel
> - nem visszafizetendő, ha nem lépsz tovább"

**Stripe Payment Link** — egy konkrét link `auditprogram-9900` campaign tag-gel. Sikeres fizetés után webhook → `lead_magnet_submissions` insert + `paid_at` timestamp.

## 5. Landing oldal szöveg (vázlat)

```
HERO:
[Solo Business header]

A 9 900 Ft AI-Működési Audit
8 oldalas dokumentum + 1 órás Loom-magyarázat + Notion munkalap.
Ha 7 napon belül továbblépsz, a 9 900 Ft 100%-ban beszámít.

[CTA: Megveszem — 9 900 Ft]

═══════════════════════════════

Hogyan működik:
1. Kifizeted a 9 900 Ft-ot a Stripe-on.
2. Email-ben kapsz egy 12 kérdéses kérdőívet — 15 perc kitölteni.
3. Én (Attila) 3 munkanapon belül készítem az auditot:
   - 8 oldalas PDF
   - Excalidraw folyamatábrával
   - 1 órás Loom-magyarázattal
   - Notion munkadokumentumban szerkesztheted
4. Ha 7 napon belül továbblépsz a 359 000 Ft teljes auditra,
   a 9 900 Ft 100%-ban beszámít. Egyszerűen.

═══════════════════════════════

Miért nem ingyenes:

Korábban ingyen csináltam (LM4 — még most is elérhető a /lead-magnet
oldalon). De ami ingyenes, azt nem nézik meg. A 9 900 Ft elköteleződés,
nem ár. És ha tovább mész, visszakapod.

(Build-in-public:)
A 30. napon vagyok saját vállalkozásommal. Most ezzel a low-ticket
belépővel kísérletezem — nézd a YouTube-csatornámon, hogy hogy alakul.

═══════════════════════════════

Mit kapsz pontosan:
[8 oldalas PDF tartalomjegyzék: 1. ICP elemzés, 2. Folyamattérkép,
3. 5 szivárgási pont, 4. AI-illeszthetőség 5 pontra, 5. Prioritized
roadmap 30/60/90 nap, 6. Kockázati térkép, 7. Költség-becslés,
8. Következő lépés]

[Loom 1 órás magyarázat — Attila videós elemzéssel megmutatja konkrétan
a Te dokumentumodat]

[Notion munkalap — együtt szerkeszthető, a 30/60/90 naptári tervhez]

═══════════════════════════════

Mit NEM kapsz:
- Implementáció (az 599 000 Ft)
- Készre épített AI-rendszer (mini sprint 199k vagy impl 599k)
- Élő hívás (audit dokumentum + Loom, nem hívás)

═══════════════════════════════

[Heti kapacitás: 5 audit. Most: 3 hely. Q3 2027 (aktualizált)]

[CTA: Megveszem most — 9 900 Ft]
```

## 6. A 12 kérdéses kérdőív (post-fizetés, email-ben link)

Hossz: 15 perc kitölteni. A kérdések kombinálják az LM1 + LM4 + LM6 mélyebb verzióit:

1. Vállalkozásod típusa, célközönséged egy mondatban
2. Heti érdeklődő-szám átlagosan
3. Hova vezet a fő érdeklődő-becsatornázásod (LinkedIn / Google / ajánlás / egyéb)
4. Mi az első érintkezésed lépése egy új érdeklődővel (részletes)
5. Mennyi időbe telik átlagosan az első érdemi válasz
6. Milyen információt gyűjtesz be ajánlatadáshoz, hány körben
7. Hogyan dokumentálod a kapcsolatot (CRM / Excel / email-mappa / fej)
8. Mit utálsz csinálni a vállalkozásodban a leginkább?
9. Mit szeretsz a leginkább benne?
10. Mit néznél automatizálni elsőként, miért éppen azt?
11. Hány órát töltesz heti átlagban ismétlődő admin-feladattal?
12. Mi az a 359 000 Ft, amit kifizetsz, ha az audit beszámít? (komolytalan kérdés — kvalifikáció)

## 7. AI elemzés — 8 oldalas audit

System prompt (`lib/anthropic.ts` `auditprogram-9900` slug):

```
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy érdeklődő
fizetett 9 900 Ft-ot ezért az auditért. NEM ingyenes lead magnet —
KOMOLY MUNKA várja el tőlünk.

Készíts neki egy 8 oldalas auditot a 12 válasza alapján.

SZERKEZET (kötelező 8 szekció):

# AI-Működési Audit — [Keresztnév], [Cégnév]

## 1. ICP elemzés (1 oldal)
- Kit szolgálsz pontosan
- Mit kínálsz nekik
- Hogyan különbözöl most a piacon

## 2. Folyamattérkép (1 oldal — szövegesen + Excalidraw)
- A jelenlegi érdeklődő → ügyfél út lépésről lépésre
- Pontosan idézetekkel a válaszokból

## 3. Az 5 szivárgási pont (1 oldal)
Pontonként:
- Hol szivárogsz (konkrét hely a folyamatban)
- Mi az oka (a válaszokból)
- Mi a hetente veszteség (becslés óra / Ft)
- Prioritás (1-5)

## 4. AI-illeszthetőség (1 oldal)
Az 5 szivárgási pont közül melyik a 3, ahol AI valódi javulást hoz?
Mindegyiknél:
- Mit csinálna konkrétan (magyarul, nem technikai)
- Mennyi idő alatt épül fel
- Várt eredmény (konkrét számmal)

## 5. Prioritized roadmap (1 oldal)
30 nap: első AI-folyamat építése
60 nap: második folyamat + mérés
90 nap: harmadik + optimalizálás

## 6. Kockázati térkép (1 oldal)
- 3 anti-pattern, amit NE csinálj
- 3 jelzés hogy ha rosszul megy és vissza kell lépni

## 7. Költség-becslés (1 oldal)
- Eszköz-előfizetések (LLM API, Make/n8n alternatíva)
- Beépítési idő (saját vagy delegált)
- ROI becslés (heti felszabadult óra * óradíj)

## 8. Következő lépés (1 oldal)
EGYETLEN ajánlott következő lépés.
A 12. kérdésre („mi az a 359k") visszautalva.
Ha 7 napon belül továbblépsz, 9 900 Ft beszámít.
NEM agresszív — világos, konkrét.

HOSSZ: 8 oldal MS Word-ben, kb. 3500-4500 szó.
Anti-AI szótár tilalom. Hormozi név TILTOTT.
Magyar nyelv, build-in-public hang.
```

## 8. Belső folyamat

```
Stripe fizetés sikeres
    ↓
Webhook /api/stripe/audit-9900-paid
    ↓
Supabase insert: lead_magnet_submissions + paid_at + amount=9900
    ↓
Auto-email: 12 kérdéses kérdőív link
    ↓
Ügyfél kitölti (15 perc)
    ↓
Cron: process-paid-audit (1 percenként)
    ↓
Claude generálja a 8 oldalas auditot
    ↓
Notion API → új page létrehozása az ügyfél nevével + tartalommal
    ↓
Hermes Telegram: Attila kézzel átnézi (30 perc), finomít a Notionban
    ↓
Loom felvétel (1 órás magyarázat)
    ↓
Email: PDF + Notion link + Loom link + beszámítási emlékeztető
    ↓
+7 napi cron: ha nincs továbblépés, „még 0 napod van" reminder
```

Új mezők a Supabase táblába:
- `paid_at`, `payment_amount_huf`, `stripe_payment_id`
- `notion_page_id`
- `loom_video_id`
- `redemption_used` (boolean)
- `redemption_eligible_until` (timestamptz — paid_at + 7 nap)

## 9. Utánkövető email sorozat (audit átvétele után)

| Nap | Tárgysor | Tartalom |
|-----|----------|------------|
| 0 (audit kiküldve) | „Itt az auditod + Loom + Notion" | Mindhárom link |
| +2 | „Néztél valamelyik szivárgási pontba?" | Bátorítás |
| +5 | „Még 2 nap a beszámítási lehetőségre" | Soft reminder |
| +6 (24h előtt) | „Holnap lejár a beszámítás" | Konkrét call |
| +7 | „Ha most továbblépsz — beszéljünk 20 percet" | Cal.com link |
| +14 (ha nem lépett tovább) | „Mit gondolsz az auditról?" | Visszajelzés kérés (NEM eladás) |
| +30 | „Bejöttek a 30 napos lépések?" | Status check |

## 10. Átvezetés fizetős ajánlatba (CSAK 359k auditba számít be!)

**Fontos jogi pont:** a 9 900 Ft csak a **359 000 Ft Teljes Audit + Rendszertervbe** számít be. NEM a 199k mini sprintbe, NEM a 599k impl-ba.

Ennek az oka: a mini sprint és impl már a 359k audit utáni szolgáltatás. Ha valaki közvetlenül implementációba akar menni anélkül hogy auditolnánk, NEM jó ICP — ott visszairányítjuk az auditba.

## 11. Mérőszámok

| Metrika | Cél (3 hónap múlva) |
|---------|----------------------|
| Heti 9 900 Ft eladás | 3-5 / hét (NEM több, kapacitás-szűk) |
| Konverzió a landing oldalon | ≥4% (high-intent ICP) |
| Beszámítás aktiválási arány | ≥25% (top tier — Hormozi szerint a money-back működése) |
| 30-napi 359k konverzió | ≥30% (audit-vásárló komoly) |
| Refund rate | ≤3% (jogilag: 14 nap, 7 nap után nincs beszámítás) |
| Net audit revenue (beszámítás után) | ~6 000 Ft / audit (ha minden beszámít) — ezért a kapacitás 5/hét nem több |

## 12. Mit kell technikailag elkészíteni

- [ ] Stripe Payment Link létrehozása + webhook handler (`app/api/stripe/audit-9900-paid/route.ts`)
- [ ] SQL migráció: új mezők (paid_at, payment_amount_huf, stripe_payment_id, notion_page_id, loom_video_id, redemption_used, redemption_eligible_until)
- [ ] Landing oldal `/audit-9900/page.tsx` (full marketing page)
- [ ] 12 kérdéses kérdőív page `/audit-9900/kerdoiv/[token]/page.tsx` (token-based, post-payment access)
- [ ] System prompt `lib/anthropic.ts` `auditprogram-9900` blokk
- [ ] Notion API integration `lib/notion.ts`
- [ ] Loom upload workflow (Attila kézzel rögzít, link bemásolása admin felületen)
- [ ] Admin page `/admin/audit-9900/[id]` — Attila kézi finomításhoz
- [ ] Beszámítási kupon Stripe-ban (Coupon: ATTILA-AUDIT-9900, 9 900 Ft off, only for 359k product)
- [ ] Jogi szöveg ÁSZF-ben: 14 napos elállás vs 7 napos beszámítás
