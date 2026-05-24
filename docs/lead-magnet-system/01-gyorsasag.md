# LM 01 — Gyorsaság: „48 órás AI Működési Gyorsdiagnózis"

> Hormozi-keret: **gyorsaság értékvektor** — „mi kellene ahhoz, hogy az ügyfél harmadannyi idő alatt kapja meg az eredményt?"
>
> Cél: az érdeklődő 48 órán belül lássa, hol tudna AI-val rövid idő alatt kézzelfogható javulást elérni a saját vállalkozásában. NEM tanácsot kap, hanem konkrét 7 napos akciótervet, ami már a 8. napra mérhető.

## 1. Név
**48 órás AI Működési Gyorsdiagnózis** — slug: `48h-ai-gyorsdiagnozis`
URL: `/lead-magnet/48h-ai-gyorsdiagnozis`

## 2. Ígéret (egy mondat)
*„48 órán belül megkapod azt az egyetlen automatizálási lépést, amit a 7. napra már mérhetően kevesebb időbe és kevesebb káoszba kerül."*

## 3. Célcsoport
- Magyar szóló / kis létszámú (1-5 fő) szakértő vállalkozó
- Aki tudja hogy van baj a működésével, de túl sok dolga van leülni gondolkodni rajta
- Aki már hallott az AI-ról, de nem akar 3 hetet rászánni a kitalálásra
- ICP: tanácsadó, coach (NEM saját ügyfél, ne ajánljunk!), könyvelő, ügyvéd, kreatív (designer/copywriter), terapeuta, készségfejlesztő, online tanfolyamtulajdonos

## 4. Probléma
- „Tudom hogy mindent én csinálok, és tudom hogy ez nem fenntartható"
- „Megnéztem 4 AI-eszközt és mind másmilyen — fogalmam sincs hol kezdjem"
- „Nem akarok 3 hetet kutatásra szánni, amíg jönnek az ügyfelek"
- Konkrét fájdalom: heti 8-15 óra megy el ismétlődő manuális munkára, amit nem szeretnek csinálni

## 5. Vágyott eredmény
- 7 napon belül legalább 4-6 óra heti felszabadult idő
- Egyetlen kézzelfogható AI-folyamat ami működik (NEM elmélet)
- A „hol kezdjem" kérdés eltűnik

## 6. Adatbekérő űrlap (5 kérdés, max 4 perc)

**Q1.** Mi a fő szolgáltatásod? (1 mondat, max 100 karakter)
*(short text)*

**Q2.** Az elmúlt 7 nap során melyik 3 feladatot csináltad manuálisan, amit nem szerettél? Konkrét feladatnevek.
*(textarea, 3 sor)*

**Q3.** Ha holnap reggel ébredve egy dolog automatikusan megtörténne, mi lenne az ami a legtöbb energiát visszaadná?
*(textarea, 2 sor)*

**Q4.** Mennyi időt töltöttél a múlt héten ismétlődő manuális munkával? (saccolj)
*(radio: <2h / 2-5h / 5-10h / 10-20h / 20h+)*

**Q5.** Most milyen eszközöket használsz? (jelöld be ami van)
*(checkbox: Gmail/Outlook, Google Calendar/Outlook Calendar, Notion/Obsidian, Excel/Sheets, ChatGPT/Claude, Egyéb)*

**Email + név + GDPR consent** mind kötelező.

## 7. AI elemzés logikája

System prompt vázlat (`lib/anthropic.ts`-be `48h-ai-gyorsdiagnozis` slug-ként):

```
Te egy magyar build-in-public vállalkozó vagy a 30. napon. Egy másik szóló
vállalkozó 5 választ adott. A feladatod: készíts neki egy 7 napos akciótervet.

KIMENET SZERKEZET (kötelező):

# 48 órás AI Gyorsdiagnózis — [Keresztnév]

## Amit a válaszaidból látok
3-4 mondat. Konkrét, idézettel. Build-in-public hang.

## Az 1 dolog, ami most a 7. napra mérhető javulást hozna
EGYETLEN folyamat. NEM 3, NEM 5. Az, ami a Q2 + Q3 alapján
- a legtöbb órát adja vissza,
- a legkevesebb új eszközt igényli (Q5-re alapozva),
- 7 napon belül felépíthető.

Részletek:
- Mit csinál (2-3 mondat magyarul, NEM technikai)
- Milyen eszközből épül fel (max 2, lehetőleg amit már használ)
- Mennyi idő alatt áll össze (konkrét óra, max 4)

## A 7 napos akciótervi térkép
Nap 1: mit csinálsz (max 1 mondat)
Nap 2: mit csinálsz
Nap 3: mit csinálsz
Nap 4-5: tesztelés
Nap 6: első mérés
Nap 7: kézzelfogható eredmény (konkrét számmal, pl. „4 óra felszabadult heti")

## Ha ennél tovább mennél
1 bekezdés a Expert Flow Akadémia 49k kurzusról VAGY a 9 900 Ft belépő
auditról — válaszd ki melyik illik jobban (lásd döntési logika lent).

HOSSZ: max 800 szó. Anti-AI szótár tilalom (ld. lib/anthropic.ts).
Hormozi nevet NE említs.
```

**Belső döntési logika a CTA-ra (sales bridge szerep):**
- Ha Q4 >10h/hét → 9 900 Ft audit ajánlás
- Ha Q4 ≤5h/hét → Akadémia 49k ajánlás
- Ha Q5-ben 0 AI-eszköz → Akadémia 49k (még messze van a fizetős impl-tól)
- Ha Q5-ben ≥1 AI-eszköz + Q4 >10h → 199k mini sprint

A döntés a Claude system prompt-jába dinamikusan injektálódik (process-pending route ezt számítja a Claude-hívás előtt).

## 8. Ügyfélnek küldött dokumentum (markdown → branded HTML email)

```
[Expert Flow header — violet logó]

# 48 órás AI Gyorsdiagnózis — [Keresztnév]

[1. szekció: amit látok]
[2. szekció: az 1 dolog]
[3. szekció: 7 napos térkép]
[4. szekció: ha tovább mennél]

---

[Footer: heti 1-2 email a Expert Flow 41-leveles oktató sorozatból
+ Skool free közösség invite + 'válaszolj erre az emailre ha kérdés van']
```

PDF generálása **NEM kell** a 48h verzióhoz — emailben markdown → branded HTML elég. (PDF generálás majd a 9 900 Ft audit kimenetnél, ahol fizetett a vásárló.)

## 9. Belső admin / CRM folyamat

```
Form submit → Supabase pending
    ↓
Cron 1 percenként → Claude generálás (≤10 másodperc)
    ↓
Hermes Telegram review → @hermes_flowbot (Approve/Edit/Reject)
    ↓
APPROVE: email kimegy + MailerLite enroll (41-leveles)
EDIT: Attila átírja Telegram-on → kimegy az átírt verzió
REJECT: NEM küldjük (Attila ad másnap személyes választ)
AUTO-RELEASE 48h: ha Hermes nem válaszolt → kimegy ahogy van
```

Új Supabase enum value: `lead_magnet_slug` check constraint kibővítése `'48h-ai-gyorsdiagnozis'`-zal.
**Migráció:** `migrations/2026-Wave5_lm48h.sql`

## 10. Utánkövető email sorozat (5 email, 14 nap)

| Nap | Tárgysor | Tartalom (1 bekezdés) |
|-----|----------|------------------------|
| 0 | „Itt a gyorsdiagnózisod, [Keresztnév]" | A generált dokumentum |
| +2 | „Beváltottad már az 1. napi lépést?" | Bátorítás + 1 konkrét akadály-elhárító tipp |
| +5 | „Mi történt nálam a 30. napon" | Saját build-in-public sztori arról amit Attila most csinál |
| +9 | „A leggyakoribb 3 hiba az 1. heti bevezetésnél" | Anti-pattern + Akadémia 49k ajánlat (vagy 9 900 audit a Q4 alapján) |
| +14 | „Mi lett a 7. napi eredményed?" | Konkrét kérdés — válasz email-re — kvalifikáció |

A +14 napos email VÁLASZA emberi kéz, NEM auto. Ha az ügyfél válaszol, az automatikus Hermes notifikáció Telegram-on Attilát figyelmezteti.

## 11. Átvezetés fizetős ajánlatba

**A CTA dinamikus a Q4 alapján** (lásd 7. pont döntési logika):

- Q4 >10h → **9 900 Ft Belépő Audit** Stripe Payment Link → 100% beszámít a 359k auditba (LM8 logika)
- Q4 ≤10h → **Expert Flow Akadémia 49 000 Ft** kurzus link
- Q5-ben ≥1 AI-eszköz + Q4 >10h → **Mini sprint 199 000 Ft** közvetlenül

Az ajánlat NEM erőteljes — egy bekezdés a 4. szekcióban + a +9 napi emailben, NEM külön landing redirect.

## 12. Mérőszámok

| Metrika | Cél (3 hónap múlva) | SQL forrás |
|---------|---------------------|-------------|
| Heti submission | 15-25 / hét | `lead_magnet_submissions where slug='48h-ai-gyorsdiagnozis'` |
| Approve rate | ≥85% | `attila_review_status='approved' / count(*)` |
| 0-napi email open | ≥60% | MailerLite |
| +9 napi CTA click | ≥8% | UTM tracking |
| 30-napi fizetős konverzió | 3-5% | Cross-check email × Stripe |
| Átlag idő submit → email | ≤25 perc | `delivered_at - created_at` |

**Sikerkritérium ahhoz, hogy belekerüljön az állandó portfolióba:** 3 hónap után legalább 60 submission és ≥3 fizetős konverzió 199k+ ajánlatból. Ha nem, refaktoráljuk vagy lecseréljük.

## 13. Mit kell technikailag elkészíteni (DoD)

- [ ] SQL migráció: új `lead_magnet_slug` enum value
- [ ] `app/lead-magnet/48h-ai-gyorsdiagnozis/page.tsx` + `koszonom/page.tsx`
- [ ] `lib/anthropic.ts` system prompt blokk (`48h-ai-gyorsdiagnozis`)
- [ ] `lib/anthropic.ts` Q4-alapú sales bridge logika a system prompt-ba
- [ ] Email template addition `lib/lead-magnet-email.ts`
- [ ] MailerLite source string update (`lm-48h-ai-gyorsdiagnozis`)
- [ ] 5 email sequence MailerLite UI-on belül (manuálisan, lásd `docs/LEAD_MAGNETS.md` 7. szekció)
- [ ] Tesztelés staging-en a `docs/LEAD_MAGNETS.md` „Manuális teszt" checklist szerint
