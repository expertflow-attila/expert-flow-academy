# LM 09 — Decoy: Ajánlati Struktúra (Stratégia, NEM külön lead magnet)

> Hormozi-keret: **decoy** — három árcsomag úgy, hogy a középső legyen a nyilvánvalóan legjobb választás.
>
> Cél: NEM külön lead magnet, hanem **az ajánlati oldal logikája**, ami minden lead magnet utánkövetésénél megjelenik. Ár-érték architektúra.

## 1. Hol jelenik meg

Minden lead magnet (LM1-12) utánkövető emailjében a 7-14. napon az ügyfélnek küldött **ajánlati oldal** (`/ajanlat/?from=<lead-magnet-slug>`) tartalmazza a decoy struktúrát.

Belső admin: nem külön slug, nem külön Supabase tábla. A `/ajanlat/` oldal AI-személyre szabott a `?from=` és (ha van) `?lead_id=` paraméter alapján.

## 2. A 3 csomag (decoy architektúra)

| Csomag | Ár | Mit tartalmaz | Pozíció |
|--------|-----|----------------|----------|
| **A: Akadémia + Skool** | 49 000 Ft | 5 modul / 11 lecke kurzus + Skool közösség 1 év | Az „olcsó" — DIY belépő |
| **B: Mini sprint** *(DECOY)* | 199 000 Ft | 1 folyamat AI-vázlata + 30 perc magyarázat + 14 napos email-támogatás | A „köztes" — limitált értékű |
| **C: Teljes Audit + Rendszerterv** *(WINNER)* | 359 000 Ft | LM8 prémium audit + 30/60/90 naptári terv + 2× 1 órás konzultáció + Notion munkadokumentum + 30 nap kérdés-válasz Telegram-on | A „valódi érték" — a kívánt választás |

Negyedik opció (NEM része a decoy mechanikának, csak komoly ICP-nek): **D: Implementáció — 599 000 Ft**, csak az LM8 vagy LM6 után aktiválódik a CTA.

## 3. Miért működik a decoy itt

**A csomag (49k):** az ügyfél tanulja meg — sok energia. Aki ezt választja, az nem ide jött (ide való: nem akar tanulni, akar rendszert).

**B csomag (199k, decoy):** „csak 1 folyamat" — túl kicsi. 199k-ért csak egy folyamatot kap, miközben a 359k-ért az egész vállalkozás auditot + rendszertervet kap. Ár/érték arány ROSSZABB mint a C — viszont nem manipulatív, mert ha tényleg csak 1 folyamat kell és gyors implementáció, akkor pont ez a jó. A „rossz ár/érték" csak akkor látszik, ha az ügyfél komolyan veszi a vállalkozását, és tervezni akar.

**C csomag (359k, winner):** a középső számítás-szerű győztes. Az ár 80%-kal magasabb a B-nél, de az érték 4-5× nagyobb (1 folyamat vs egész rendszer, sprint vs 90 napos terv, 14 nap támogatás vs 30 nap).

**A → B → C → D** Value Ladder természetes átjárhatóság, NEM kényszer.

## 4. Ajánlati oldal vázlat

```
[Header: Expert Flow]

Üdv [Keresztnév] — itt a 3 lehetőséged

[A te eddigi térképed alapján] (csak ha lead_id paraméter van):
"Ahogy a [LM neve]-ben láttad, [1-2 mondat összefoglaló az eddigi
elemzésből, AI-személyre szabott]."

═══════════════════════════════

┌──────────────────────────────────────────────────────────────────────────┐
│   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│   │   AKADÉMIA         │  │   MINI SPRINT      │  │  TELJES AUDIT      │ │
│   │   + SKOOL          │  │                    │  │  + RENDSZERTERV    │ │
│   │                    │  │                    │  │                    │ │
│   │   49 000 Ft        │  │   199 000 Ft       │  │   359 000 Ft       │ │
│   │                    │  │                    │  │                    │ │
│   │   - 5 modul, 11    │  │   - 1 folyamat AI- │  │   - 8 oldalas      │ │
│   │     lecke kurzus   │  │     vázlata        │  │     audit          │ │
│   │   - Skool közösség │  │   - 30 perc        │  │   - 30/60/90 terv  │ │
│   │     1 év           │  │     magyarázat     │  │   - 2× 1h konz.    │ │
│   │   - DIY tempóban   │  │   - 14 napos email │  │   - Notion munka   │ │
│   │                    │  │     támogatás      │  │   - 30 nap kér.-v. │ │
│   │   Neked való ha:   │  │                    │  │     Telegramon     │ │
│   │   - Tanulni akarsz │  │   Neked való ha:   │  │                    │ │
│   │   - DIY tempó OK   │  │   - 1 folyamat     │  │   Neked való ha:   │ │
│   │                    │  │     elég neked     │  │   - Teljes képet   │ │
│   │                    │  │   - Magad építed   │  │     akarsz látni   │ │
│   │                    │  │     be a sprint    │  │   - Tervezhetően   │ │
│   │                    │  │     után           │  │     akarsz haladni │ │
│   │                    │  │                    │  │   - 9 900 Ft audit │ │
│   │                    │  │                    │  │     beszámít!      │ │
│   │                    │  │                    │  │                    │ │
│   │  [Választom]       │  │  [Választom]       │  │  [Választom]       │ │
│   └────────────────────┘  └────────────────────┘  └────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘

[Ha komoly impl is kell — 599 000 Ft a Teljes Audit után aktiválódik.]

═══════════════════════════════

Melyik az én helyzetemnek a legjobb?

[AI-személyre szabott bekezdés, 3-4 mondat. A lead_id alapján az
ügyfél eddigi adatait használja és KONKRÉT csomagra ajánlik.]

[CTA gomb: "Beszéljünk 20 percet — Cal.com link"]
```

## 5. AI-személyre szabás logika

A `/ajanlat/?from=<slug>&lead_id=<uuid>` oldal Server Component-ként betölti:

```typescript
// app/ajanlat/page.tsx
const submission = await getLeadMagnetSubmission(lead_id);
const recommendation = await recommendPackage(submission);

// recommendPackage:
// - Q1-Q12 válaszok → Claude system prompt
// - Output: { recommended: 'A'|'B'|'C'|'D', reasoning: '...' }
```

**recommendPackage system prompt:**

```
Egy érdeklődő [LM neve] kitöltött. A válaszai itt vannak. Ajánld
melyik csomag a legjobb neki — A (49k Akadémia), B (199k mini sprint),
C (359k teljes audit), D (599k impl).

Döntési szabályok:
- Heti óra <5 + 0 AI-eszköz → A (még nem éri meg neki C)
- Heti óra >10 + AI-eszközhasználat → C (kész auditra)
- Heti óra 5-10 + 1 konkrét fájdalom → B (mini sprint elég)
- Q12 "hajlandó >300k Ft-ot fizetni" + Q11 >10h → C vagy D
- ICP-illeszkedés <50 → A (még nem áll készen komolyabbra)
- Korábbi audit volt (9 900 Ft fizetett) → D vagy C

Output JSON:
{
  "recommended": "A"|"B"|"C"|"D",
  "reasoning": "<3-4 mondat magyarul, build-in-public hang>",
  "highlight_reason": "<1 mondat: miért NEM a többi>"
}
```

## 6. CRM követés

Új mező a `lead_magnet_submissions` táblában:
- `ajanlat_recommended_package` (A|B|C|D)
- `ajanlat_viewed_at` (timestamptz — first view)
- `ajanlat_clicked_package` (A|B|C|D|none — melyikre kattintott)
- `ajanlat_purchased_package` (A|B|C|D|none — végül melyiket vette meg)

Heti monday-review:
- Mennyi ügyfél nézte meg az ajánlati oldalt
- Recommended vs Clicked mismatch (ha az AI A-t ajánl és B-re kattint → tanulság)
- Konverzió per recommended csomag

## 7. Mérőszámok

| Metrika | Cél | Megjegyzés |
|---------|-----|-------------|
| Ajánlati oldal megtekintés (lead/30nap) | ≥30% | UTM-trackelt link |
| Recommended C, click C arány | ≥60% | Ha alacsony, a copy gyenge |
| Decoy hatás mérése | A/B teszt B nélkül | 50% A/B/C, 50% A/C — összevethető |
| 14-napi konverzió bármely csomagra | ≥6% | Egészséges funnel-vég |

**A/B teszt a decoy hatékonyságára (Q3 2027-re tervezve):**
- 50% lát 3 csomagot (decoy struktúra)
- 50% lát 2 csomagot (A + C, mini sprint kihagyva)
- Mérjük melyik konvertál jobban a C-re
- Hipotézis: decoy verzió +15-25% C-konverzió

## 8. Etikus megjegyzés

A decoy NEM manipulatív akkor:
- A B csomag (mini sprint) ténylegesen jó értéket ad ha valakinek tényleg csak 1 folyamat kell és gyors implementáció
- A C csomag ténylegesen olcsóbb / órányi értékben
- Senkit nem kényszerítünk B kihagyására

A decoy manipulatív akkor (NEM csináljuk):
- A B csomagot nem létezőként vagy üresen árazzuk
- A C csomagba kibillentő bonus-okat halmozunk amik nem érnek annyit
- B árát mesterségesen felemeljük csak hogy C jobban nézzen ki

## 9. Mit kell technikailag elkészíteni

- [ ] `app/ajanlat/page.tsx` (Server Component, 3 csomag card, AI-személyre szabott bekezdés)
- [ ] `lib/anthropic.ts` `recommend-package` system prompt
- [ ] SQL migráció: 4 új mező a `lead_magnet_submissions` táblába
- [ ] Stripe Payment Linkek mindhárom csomaghoz (kupon-támogatással a 9 900 Ft beszámításhoz)
- [ ] Lead magnet utánkövető emailek update: a 7-14 napos email az `/ajanlat/?from=<slug>&lead_id=<uuid>` linkre mutat
- [ ] Tracking: viewed → clicked → purchased eseménysor
- [ ] A/B teszt infrastruktúra (LaunchDarkly NEM kell, egyszerű 50/50 random alapján query-string flag)
