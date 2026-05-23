# LM 10 — Buy X, Get Y Free: „Audit + Ingyenes Folyamatvázlat"

> Hormozi-keret: **buy X get Y free** — az ingyenes „Y" érződjön értékesebbnek mint az ár, amit X-ért fizet.
>
> Cél: a 9 900 Ft belépő audit (LM8) konverzióját feljavítani azzal hogy ajándékba kap egy LM2-szintű AI-folyamatvázlatot. Az ügyfél azt érzi: ingyen kapja a 49k értékű kurzus első leckéjét + szakmai segítséget.

## 1. Név
**„Audit + Ingyenes Folyamatvázlat" Bundle** — slug: `audit-plusz-vazlat`
URL: `/audit-bundle-9900`

## 2. Ígéret (egy mondat)
*„Vedd meg a 9 900 Ft AI-Működési Auditot, és ajándékba elkészítjük az első érdeklődő-kezelési folyamatvázlatodat — pontosan azt amit a 49 000 Ft-os Akadémia első leckéje tanít, csak Te nem tanulod, mi felépítjük."*

## 3. Mi az X (amit fizet)
**LM8 — 9 900 Ft AI-Működési Audit.** Pontosan ugyanaz: 8 oldalas PDF, Excalidraw, Loom magyarázat, Notion munkalap. Lásd `08-win-money-back.md`.

## 4. Mi az Y (amit ajándékba kap)
**Az első érdeklődő-kezelési folyamatvázlatod** — LM5 (próba a megoldásból) prémium verziója:
- Excalidraw ábra a SAJÁT folyamatáról (NEM general template)
- 1 oldalas magyarázó szöveg
- 3 KONKRÉT AI-blokk illesztési pont
- Mindezt AI generálta a 6 kérdéses LM5 form alapján

**Érzékelt érték (a copy-ban):** „49 000 Ft Akadémia kurzus első nagy leckéjét — ingyen."
**Valós érték (Attila számára):** marginal cost ~25 Ft Claude API + Hermes review idő.

## 5. Miért érzi az ügyfél értékesebbnek mint az árat

| Mit fizet | Mit kap |
|-----------|----------|
| 9 900 Ft | 8 oldalas audit (Y nélkül is megéri — LM8 sztori) |
| | + Excalidraw folyamatvázlat (önállóan LM5 ingyenes — de Te nem találtad meg / nem ismerted) |
| | + 49k Akadémia első lecke „ingyen átadva" (érzékelési érték) |
| | + 100% beszámítás 359k-ba (LM8 mechanika) |

Az ügyfél matematikája: „9 900 Ft-ot fizetek, de kapok 9 900 + 8 000 + 12 000 (Akadémia 1. lecke arányos érték) + beszámítás → 30 000 Ft+ értéket."

## 6. Hogyan készül el az „ingyenes" rész automatikusan

A 9 900 Ft Stripe fizetés után **2 kérdőív** megy ki egymás után:

**Kérdőív 1: 12 kérdéses audit** (LM8 mint korábban, 15 perc)
**Kérdőív 2: 6 kérdéses folyamatvázlat** (LM2 6 kérdése, 5 perc)

A két kérdőív egyetlen oldalon van, progress bar 2 lépéssel. Az ügyfél azt látja: „még 5 perc és kész".

A 2. kérdőív válaszait külön Claude-hívás dolgozza fel (LM2 `ai-folyamatvazlat-48h` system prompt használatával) — pontosan ugyanaz a kimenet mint LM2-ben, csak gyorsabb (heti 5 audit kapacitásban).

## 7. AI ügynök szerepek a Y-elkészítéshez

**1× Claude-hívás az auditra** (`auditprogram-9900` slug, lásd LM8)
**1× Claude-hívás a folyamatvázlatra** (`ai-folyamatvazlat-48h` slug, lásd LM5 — VÁLTOZATLAN existing prompt)

Az X és Y kettőt EGY Hermes review-üzenetbe csomagoljuk. Attila egyszer dönt: APPROVE / EDIT / REJECT — mindkét dokumentumra.

## 8. Üzleti fenntarthatóság (Hormozi-számolás)

**Bevétel per audit:** 9 900 Ft
**Költség per audit:**
- Stripe fee 2.4% + 35 Ft = ~270 Ft
- Audit Claude (Sonnet 4.6, ~10K input + 4K output) = ~110 Ft
- Folyamatvázlat Claude (~5K input + 3K output) = ~70 Ft
- Notion API (free tier)
- Email küldés (free tier MailerLite)
- Attila kézi finomítás 30 perc audit + 5 perc vázlat = 35 perc * 8000 Ft óradíj = 4 670 Ft
- Loom felvétel 60 perc + render = 1× 60 perc = 8000 Ft

**Net per audit (csak audit beszámítás nélkül):** 9 900 - 270 - 180 - 12 670 = **-3 220 Ft veszteség**

**Ezért a beszámítási mechanika kritikus** (LM8): a -3 220 Ft veszteséget kompenzálja, ha 25%+ továbbmegy a 359k auditba (ahol már 359 000 - 9 900 = 349 100 Ft tiszta bevétel + audit költség nagyrésze már elszámolva).

**Az „ingyenes" folyamatvázlat marginal cost:** csak 180 Ft Claude + 5 perc Attila finomítás (~670 Ft) = 850 Ft. Az érzékelési érték 8 000+ Ft. Hormozi szabálya teljesül: az ingyenes rész érződjön nagyobbnak, mint a fizetett rész.

## 9. Landing oldal vázlat

```
HERO:
"Vedd meg a 9 900 Ft AI-Működési Auditot — ajándékba elkészítjük
az érdeklődő-kezelési folyamatvázlatodat is."

(value-stack vizuális)
[ 9 900 Ft fizetsz ]
[ 8 oldalas audit ............. 9 900 Ft kapsz ]
[ + Excalidraw folyamatvázlat .. 8 000 Ft kapsz (ajándék) ]
[ + Loom magyarázat ............ 12 000 Ft kapsz ]
[ + Notion munkalap ............ 3 000 Ft kapsz ]
[ + 100% beszámítás ............ 9 900 Ft visszakapsz ha 7 napon belül továbblépsz ]
[ Összesen ..................... 32 900 Ft érték ]
[ Most fizetsz .................. 9 900 Ft ]

[CTA: Megveszem most]

═══════════════════════════════

Hogyan működik:
1. Fizetés (Stripe, 9 900 Ft)
2. 2 kérdőív (15 + 5 perc, egyetlen oldalon)
3. 3 munkanap múlva:
   - 8 oldalas audit (a Te vállalkozásodra szabva)
   - Excalidraw folyamatvázlat (a Te érdeklődő-kezelésedre szabva)
   - 1 órás Loom magyarázat
4. Ha 7 napon belül továbblépsz a 359 000 Ft teljes auditra, a 9 900 Ft beszámít.

═══════════════════════════════

Heti kapacitás: 5 audit. Most: 3 hely.

[CTA: Megveszem most — 9 900 Ft]
```

## 10. Mérőszámok (LM8 vs LM10 A/B teszt)

**Hipotézis:** A bundle (LM10) +20-40%-kal magasabb landing-konverziót ér el mint a tiszta LM8.

| Metrika | LM8 (csak audit) | LM10 (bundle) target |
|---------|--------------------|------------------------|
| Landing → fizetés konverzió | 4% | 5-6% |
| Cart-abandon rate | ? | ≥10% csökkenés |
| Customer satisfaction (NPS) | ? | ≥10 pont magasabb |
| 30-napi 359k konverzió | 30% | 28-32% (várjuk hogy ne csökkenjen) |

**Mérés:** 4 hétig A/B-teszt: 50% lát LM8 landing, 50% lát LM10 landing. Cookie-based persistence.

## 11. Mit kell technikailag elkészíteni

- [ ] `app/audit-bundle-9900/page.tsx` (landing, value stack vizuális)
- [ ] `app/audit-bundle-9900/kerdoiv/[token]/page.tsx` (2-lépéses progress bar)
- [ ] System prompt változás: a kérdőív válaszait kétfelé bontjuk és külön Claude-hívás
- [ ] Hermes review üzenet template: 2 dokumentum egy üzenetben
- [ ] Email template: bundle delivery (audit + vázlat egy emailben)
- [ ] A/B teszt: routing /audit-9900 50%-a /audit-bundle-9900-re
- [ ] Lead-source tracking: `lead_magnet_submissions.lead_source = 'lm10-bundle'`
