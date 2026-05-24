# LM 04 — Problémafeltáró: „AI-Működési Térkép" (ÉL — LM1)

> Hormozi-keret: **problémafeltáró lead magnet** — „mit érez az ügyfél, amit még nem lát tisztán?"
>
> **Státusz: ÉL** (Wave 4, 2026-05-23). Slug: `ai-mukodesi-terkep`.
>
> Ez a doc az implementált verziót dokumentálja + tartalmaz V2 fejlesztési javaslatokat.

## 1. Név (LIVE)
**AI-Működési Térkép** — slug: `ai-mukodesi-terkep`
URL: `https://akademia.expertflow.hu/lead-magnet/ai-mukodesi-terkep`

## 2. Ígéret (LIVE)
*„Tölts ki 3 kérdést — küldök egy 4 oldalas térképet azzal hogy nálad melyik a 3 időszivárgási pont, és melyik egyetlen AI-folyamat hozná a legtöbb javulást."*

## 3. Célcsoport (LIVE)
- Magyar szóló szakértő vállalkozó
- Aki YouTube / 41 leveles newsletter olvasásból érkezik
- Hideg / langyos intent, alacsony elköteleződési hajlandóság
- Lásd `app/lead-magnet/ai-mukodesi-terkep/page.tsx` aktuális copy

## 4. Probléma — szivárgási pontok
Az LM azt tárja fel amit az ügyfél érez de nem lát:
- „Sok minden történik a héten de nem tudom mire ment el az idő"
- „Az érdeklődők egy része eltűnik, de nem tudom hol"
- „Egyik feladat fárasztóbb mint kéne — de nem tudom miért az"

## 5. Vágyott eredmény
- 3 konkrét névvel ellátott szivárgási pont, példákkal a saját válaszaiból
- 1 javasolt AI-folyamat amit első hétben kipróbálhat
- Az „aha-pillanat": ezt eddig nem láttam így

## 6. Adatbekérő űrlap (LIVE — 3 kérdés)

Lásd `app/lead-magnet/ai-mukodesi-terkep/page.tsx`:

- **Q1.** A 3 fárasztó dolog, amit minden héten elvégzel: *(textarea)*
- **Q2.** Hol veszítesz időt anélkül hogy észrevennéd: *(textarea)*
- **Q3.** Melyik feladatot adnád oda valakinek, ha lenne kinek (és miért neki konkrétan): *(textarea)*

## 7. AI elemzés (LIVE)

System prompt: `lib/anthropic.ts` `ai-mukodesi-terkep` slug.

Kimenet (4 oldalas térkép) struktúra:
1. „Mit látok a válaszaidból" (3-4 mondat)
2. „A 3 időszivárgási pont nálad" (idézetekkel)
3. „Az első AI-folyamat amit érdemes bevezetned" (1 konkrét lépés)
4. „A következő lépés" — Expert Flow hírlevél

## 8. Kimeneti dokumentum
Markdown → branded HTML email (NEM PDF a jelenlegi verzióban).

## 9. Belső folyamat (LIVE)
Standard Wave 4 flow: pending → Claude → Hermes review → email + MailerLite enroll.

## 10. Utánkövető email sorozat
Jelenleg: a 41-leveles newsletter automation MailerLite-ban, source = `lm-ai-mukodesi-terkep`. Külön LM-specifikus sequence NINCS, csak generikus hírlevél.

**V2 javaslat:** dedikált 5-email sequence az LM utánkövetéshez (lásd LM1/02 sablonjait).

## 11. Átvezetés fizetős ajánlatba (LIVE)
Newsletter → 41 héten át edu tartalom → Akadémia 49k CTA a 8. emailtől
Nem közvetlen sales — LM1 a leghidegebb belépő, hosszú nurture szükséges.

## 12. Mérőszámok (LIVE)

Heti monday-review Hermes cron-ban követendő:
- Heti submission count
- Hermes approve rate (jelenleg cél: ≥85%)
- Email open rate (MailerLite)
- 30-napi Akadémia konverzió (még nincs adat — 2026-05-23 launch)

## V2 fejlesztési javaslatok (nem implementálva)

1. **Q4 hozzáadása:** „Hányan vagytok a vállalkozásban?" — szegmentációhoz, mert a sólo vs 5-fős nagyon más ICP
2. **Sales bridge dinamizálása:** ha az AI-elemzésből kiderül hogy az ügyfél már >10h/hét veszít → 9 900 Ft audit CTA közvetlenül a 4. szekcióban, NEM csak newsletter
3. **PDF verzió** — opcionális, csak ha az ügyfél explicit kéri (kattintható link az emailben)
4. **„Olvasd át a kollégámmal" share-link** — anonymizált térkép-link amit megoszthat partnerrel (viral)

## Hivatkozások
- `lib/anthropic.ts` (jelenlegi system prompt)
- `app/lead-magnet/ai-mukodesi-terkep/page.tsx` (form)
- `docs/LEAD_MAGNETS.md` (deployment + ops)
