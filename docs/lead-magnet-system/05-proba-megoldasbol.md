# LM 05 — Próba a megoldásból: „Első AI-Folyamatvázlat 48h" (ÉL — LM2)

> Hormozi-keret: **próba a megoldásból** — „adj egy DARABOT a megoldásból, ne csak ígéretet."
>
> **Státusz: ÉL** (Wave 4, 2026-05-23). Slug: `ai-folyamatvazlat-48h`.

## 1. Név (LIVE)
**Első AI-folyamatvázlat 48 óra alatt** — slug: `ai-folyamatvazlat-48h`

## 2. Ígéret (LIVE)
*„Töltsd ki a 6 kérdést az érdeklődő-kezelési rutinodról — 48 órán belül kapsz egy 1 oldalas magyarázót + egy kézi-rajz-stílusú Excalidraw folyamatvázlatot, ami megmutatja melyik 3 ponton illeszthető AI-blokk a folyamatba."*

## 3. Célcsoport (LIVE)
- Aki már túl van LM1-en VAGY direkt LinkedIn-ről jön
- Akit konkrét output érdekel, nem absztrakt térkép
- Akinek van már heti 3+ érdeklődője hogy érdemes legyen ezen gondolkodnia

## 4. Probléma
- „Nem tudom hogyan kapcsolódna össze a folyamatomban AI"
- „Sok eszközről olvastam, de fogalmam sincs hol illeszteném be"
- „Nem tudom megrajzolni a saját folyamatomat, és így nem tudom kiértékelni se"

## 5. Vágyott eredmény
- Egy kézzelfogható vizuális ábra a saját érdeklődő-kezelési folyamatáról
- 3 KONKRÉT pont megnevezve ahol az AI segítene
- „Most már látom hogy néz ki a folyamatom" — meta-élmény

## 6. Adatbekérő űrlap (LIVE — 6 kérdés)

Lásd `app/lead-magnet/ai-folyamatvazlat-48h/page.tsx`:

1. Honnan érkezik egy új érdeklődő
2. Mi az első dolog amit csinálsz amikor megkapod a megkeresést
3. Mennyi idő telik el az első megkeresés és az első érdemi válasz között
4. Milyen információt kérsz be ajánlathoz, hány körben
5. Hogyan követed nyomon kinek meddig jutott
6. Mit vennél ki egyetlen részeként a kezedből (és miért)

## 7. AI elemzés (LIVE)

System prompt: `lib/anthropic.ts` `ai-folyamatvazlat-48h`.

**Két kimenet ugyanabban a Claude hívásban:**
1. Magyarázó szöveg (1 oldal)
2. Excalidraw JSON (4-7 blokk, kézi-rajz-stílus, Solo Business violet)

System prompt-ban a `--- EXCALIDRAW JSON ---` delimiter elválasztja a kettőt. Process-pending cron a delimiterre splitel és külön mezőbe tárolja.

## 8. Kimeneti dokumentum
- Email body: magyarázó szöveg (markdown → HTML)
- Excalidraw JSON: inline PNG render Excalidraw embed-szervere VAGY önhostolt `lib/excalidraw-render.ts`

**A vizuális ábra a kulcs — ez az „aha-pillanat".**

## 9. Belső folyamat (LIVE)

Standard Wave 4 flow + Excalidraw render lépés (PDF-be vagy inline image-be).

## 10. Utánkövető email sorozat

| Nap | Tárgysor | Tartalom |
|-----|----------|------------|
| 0 | „Itt a folyamatvázlatod" | Ábra + magyarázat |
| +2 | „Próbáltál már egy blokkot bevezetni?" | Bátorítás + 1 konkrét first-step |
| +5 | „Mit veszítesz ha nem teszed?" | Költség-becslés a saját adataiból (heti óra * 3000 Ft/óra) |
| +9 | „A Build-in-public 30 nap kurzus" | Akadémia 49k CTA — Akadémia konkrétan ezt tanítja |
| +14 | „Mi lett az ábrával?" | Válasz email kérés |

## 11. Átvezetés fizetős ajánlatba (LIVE)

Cél: **Solo Business Akadémia 49 000 Ft** — „Build-in-public 30 nap" kurzus (5 modul, 11 lecke).

A Claude system prompt-ban a 3. szekció („Ha innen tovább mennél") konkrétan az Akadémiát említi.

## 12. Mérőszámok (LIVE)

- Heti submission: cél 12-18 / hét (LM1-nél magasabb intent → magasabb volumen)
- Excalidraw JSON érvényesség rate: ≥95% (ha alacsonyabb, system prompt javítás)
- 30-napi Akadémia konverzió: cél 3-5%

## V2 fejlesztési javaslatok

1. **„Másik folyamatot is" upsell:** a +9 napi emailben felajánlani egy másik folyamatot (onboarding / ajánlatadás / utánkövetés) ugyanúgy ingyen — a végén Akadémia stratégia
2. **Interaktív Excalidraw editor:** beágyazott Excalidraw a köszönöm oldalon hogy az ügyfél már a generálás előtt látja a saját rajzolatát + a generált AI-version-t össze tudja hasonlítani
3. **„Lead magnet bundle":** ha kitölti LM1+LM2-t mindkettőt, kap egy harmadik dokumentumot: a kettő összefüggéseinek elemzését (cross-LM AI hívás)

## Hivatkozások
- `lib/anthropic.ts` `ai-folyamatvazlat-48h` blokk
- `app/lead-magnet/ai-folyamatvazlat-48h/page.tsx`
- `docs/LEAD_MAGNETS.md`
