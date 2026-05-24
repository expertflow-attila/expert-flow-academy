# LM 06 — Egy lépés kiszakítva: „Ügyfélút Audit" (ÉL — LM3)

> Hormozi-keret: **egy lépés a teljes folyamatból** — „ne add el az egészet, csak EGY részt."
>
> **Státusz: ÉL** (Wave 4, 2026-05-23). Slug: `ugyfelut-audit`.

## 1. Név (LIVE)
**20 perces Ügyfélút Audit (Expert Flow)** — slug: `ugyfelut-audit`

A teljes Expert Flow szolgáltatás 8 lépéséből (működés-térképezés / ügyfélút-elemzés / problémák / rendszerterv / workflow / bevezetés / mérés / optimalizálás) csak a **2. lépést — ügyfélút-elemzést** szakítjuk ki belépő-pontnak.

## 2. Ígéret (LIVE)
*„Ha hetente 3-nál több érdeklődő érintkezésed van, 20 percben átnézzük együtt mi történik attól hogy valaki érdeklődik, addig hogy ügyfél lesz. 1 munkanapon belül kapsz egy 1 oldalas írásos összefoglalót. Nem eladási hívás."*

## 3. Célcsoport (LIVE — KVALIFIKÁLT)
- Heti 3+ érdeklődő (Q-szűrés az űrlapon)
- Aki konkrét ügyfélkezelési problémát érez
- Bizalom-szintű intent (már lát értéket bennünk hogy belejön egy 20 perces hívásba)

LM3 az EGYETLEN a portfólióban ami **Cal.com qualification-flow** — nincs AI generálás, csak űrlap-szűrés.

## 4. Probléma
- „Sok érdeklődő van, de nem mind lesz ügyfél, és nem tudom miért nem"
- „Valahol elveszítem őket a folyamatban, de nem tudom hol"
- „Nincs idő végiggondolni külső szemmel"

## 5. Vágyott eredmény
- 1 oldalas írásos audit a saját ügyfélútjáról
- 3 konkrét javítási pont megnevezve
- 20 perc magas-érték konzultáció Attilával

## 6. Adatbekérő űrlap (LIVE — 3 kvalifikáló kérdés)

Lásd `app/lead-magnet/ugyfelut-audit/page.tsx`:

1. Hányan jelentkeznek hozzád egy átlag héten érdeklődőként? *(radio: <3 / 3-7 / 8-15 / 15+)*
2. Most mi a fő probléma az ügyfélkezelésben? *(textarea)*
3. Mit szeretnél javítani konkrétan? *(textarea, ez megy a Cal.com prefilled metadata-ba)*

**Q1 = `<3` → too-early decline:** „még nem éri meg neked, viszont itt a 41 leveles oktató sorozatom és a Skool free közösség."

**Q1 ≥ 3 → qualified:** redirect Cal.com booking URL-re prefilled metadata-val.

## 7. AI elemzés
**NINCS AI generálás a Wave 4 verzióban.** Az audit DOKUMENTUMOT Attila személyesen készíti a 20 perces hívás után.

**V2 javaslat:** a hívás Whisper-transzkriptje → Claude → audit-tervezet → Attila áttekinti → küldés.

## 8. Kimeneti dokumentum

A 20 perces hívás után **1 munkanapon belül** 1 oldalas PDF, ami tartalmazza:
- Jelenlegi ügyfélút (4-6 lépéses ábra)
- 3 konkrét szivárgási pont
- 3 prioritized javítási javaslat (low/mid/high effort, low/mid/high impact mátrix)
- Következő lépés (sprint / audit / akadémia — Attila dönti)

## 9. Belső admin / CRM folyamat (LIVE)

```
Form submit
    ↓
qualification_result kiszámítva Q1 alapján
    ↓
qualified: redirect Cal.com URL prefilled metadata-val
            → Cal.com webhook /api/cal/audit-booked
            → cal_booking_id mentés
            → 24h előtt: confirmation email a 3 kérdéssel (Cal.com Workflow)
            → 1h előtt: reminder
            → hívás után Attila kézzel uploadolja a PDF-et
            → email kimegy

too-early: 41 leveles newsletter + Skool free invite + decline email
            (a process-pending cron csinálja)

no-fit: politely declined email (nincs ennek logikája Q-ban — manuálisan
        állítja Attila ha a hívásra rosszul jött az ICP)
```

## 10. Utánkövető email sorozat

**Qualified, hívás megvolt:**

| Nap | Tárgysor |
|-----|------------|
| 0 (hívás után, +24h) | „Itt az audit dokumentumod" |
| +3 | „Mit gondolsz a 3 javaslatról?" |
| +7 | „Ajánlat — mini sprint vagy teljes audit" |
| +14 | „Csendben? Itt a Skool közösség" |
| +30 | „Hogy ment az 1. javaslat bevezetése?" |

**Too-early:** csak a generikus 41-leveles automation indul.

## 11. Átvezetés fizetős ajánlatba (LIVE — Attila dönt a hívás alapján)

A 20 perces hívás VÉGÉN Attila ajánl konkrét csomagot:

- **199 000 Ft mini sprint** (1 folyamat AI-vázlata + bevezetés) — leggyakoribb
- **359 000 Ft teljes audit + rendszerterv** — ha 5+ folyamat van veszélyben
- **599 000 Ft implementáció** — ha audit már volt és kész impl-t kér

**Az 1 oldalas PDF a +7. napi emailben tartalmazza az ajánlott csomagot — semmi „mindhárom közül választhat" zűrzavar.**

## 12. Mérőszámok (LIVE)

- Heti submission: 5-8 / hét (alacsony volumen, magas intent)
- qualified % (Q1≥3): ≥60%
- Cal.com booking rate (qualified-ből): ≥40%
- Show-up rate (booked-ből): ≥85%
- Audit → fizetős konverzió (hívás után 30 nappal): ≥30%
- Audit dokumentum → email lead time: ≤24h (manuális szűk keresztmetszet)

## V2 fejlesztési javaslatok

1. **Whisper-tervezet:** hívás után automatikus transzkript → Claude → audit-tervezet → Attila csak átnézi (5-10 perc) → küldés. Lead time 24h → 2h.
2. **„Másik partnerrel együtt": share link** — partner is meghívható ugyanarra a Cal.com hívásra
3. **Pre-call kérdőív** — 24h előtt Cal.com Workflow-ban a 3 kérdés („beszéljük át")

## Hivatkozások
- `app/lead-magnet/ugyfelut-audit/page.tsx`
- `app/api/cal/audit-booked/route.ts`
- `docs/LEAD_MAGNETS.md` (Cal.com event type setup)
