# LM 07 — Giveaway: „Nyerj egy teljes AI-Rendszert"

> Hormozi-keret: **attraction offer / giveaway** — fő nyertes nagy érték, második helyezetteknek kedvezményes ajánlat.
>
> Cél: figyelem és minősített leadek tömeges gyűjtése egy 4-6 hetes kampánnyal negyedévente. NEM nyereményjáték — szakmai pályázat-szerű mechanika.

## 1. Név
**„Az első ügyfélfolyamatod AI-rendszerré alakítása"** — Q3 2027 nyertes-pályázat
Slug: `ai-rendszer-giveaway-q3` (negyedévenként új slug-gal újrafutottatva)

URL: `/lead-magnet/ai-rendszer-giveaway-q3` (időszakos kampány landing, NEM mindig nyitva)

## 2. Ígéret
*„Egy magyar szakértő vállalkozó kap a Q3 nyertesként egy teljes AI-rendszert az első ügyfélfolyamatára — szabad eszközzel, 30 napos beépítéssel, 0 Ft költséggel. Az érték: 599 000 Ft. A többi jelentkezőnek készítünk egy mini-auditot 30%-os kedvezménnyel."*

## 3. Ki jelentkezhet (ICP-szűrés)

A landing oldalon kötelező feltételek:
- Magyar szóló vagy 1-5 fős szakértő vállalkozás
- Min. 6 hónap aktív működés (frisseket NEM fogadunk)
- Min. heti 3 érdeklődő (nem indul a folyamat ha nincs forgalom)
- NEM coach, NEM MLM, NEM affiliate-vállalkozó

Az „aki nem felel meg" üzenet: „még nem áll készen az AI-rendszerre — itt a 41 leveles oktató sorozatunk, indítsd ezzel".

## 4. Mit nyer a győztes (599k Ft értékben)

- **Teljes ügyfélút térképezés** (LM6 mélyebb verzió, 4 órás workshop Attilával)
- **AI-rendszerterv** az ügyfél 1 választott folyamatára (offer-ajánlat / onboarding / utánkövetés / dokumentumkezelés / leadkezelés)
- **30 napos beépítés** — Attila és AI-csapata felépíti
- **30 napos támogatás** — kérdés-válasz Telegram-on / heti checkin

Build-in-public elem: **a teljes folyamat publikusan dokumentálva** YouTube + LinkedIn-en (a nyertes hozzájárulásával). Ez egyszerre marketing-akció és case study.

## 5. Adatbekérő űrlap (10 kérdés, 8 perc)

A jelentkezési form sokkal hosszabb mint a többi LM — mert ez minősített pályázat:

1. Vállalkozásod típusa? *(radio: tanácsadó / kreatív / könyvelő-ügyvéd / tréner-coach / online tanfolyam / egyéb szakértői szolgáltatás)*
2. Hány hónapja működik? *(radio: <6h / 6-12h / 1-3 év / 3+ év)*
3. Hány érdeklődőd van heti átlagban? *(radio: <3 / 3-7 / 8-15 / 15+)*
4. Mi a legnagyobb működési problémád most? *(textarea, max 500 char)*
5. Melyik egyetlen ügyfélfolyamatot kéred ha nyersz? *(textarea, max 400 char)*
6. Milyen rendszereket / eszközöket használsz most? *(checkbox + egyéb)*
7. Honnan jönnek most az érdeklődőid? *(checkbox: ajánlás / Google / LinkedIn / YouTube / FB-Insta / cold outreach / egyéb)*
8. Mi a havi árbevételed becsült tartománya? *(radio: <500k / 500k-2M / 2-5M / 5M+)* — bizalmas, NEM publikált, csak Attila lát rá. ICP-szűrés.
9. Vállalod hogy a folyamat publikus build-in-public YouTube-on/LinkedIn-en kísért? *(checkbox: igen / nem — ha nem, nem zárja ki, de a győztes-választásnál előny)*
10. Egyetlen mondatban: miért te? *(textarea, max 300 char)*

GDPR + nyereményjáték szabályzat-link kötelező.

## 6. AI-alapú előminősítés

System prompt minden jelentkezőnek (post-submission):

```
Egy giveaway-jelentkező 10 kérdést kitöltött. A te feladatod: pontozz
0-100 között 4 dimenzió mentén, és írj 2 mondatos indoklást.

Dimenziók:
1. FIT (mennyire illeszkedik az ICP-hez): Q1, Q2, Q3 alapján
2. IMPACT (mennyire jelentős változás lenne a saját vállalkozásában):
   Q4, Q5 alapján — konkrét fájdalom, kvantitálható
3. FEASIBILITY (megvalósítható-e 30 nap alatt): Q5, Q6 alapján
4. PR-VALUE (build-in-public érték): Q9 + Q1 + Q10 alapján

KIMENET:
{
  "fit_score": 0-100,
  "impact_score": 0-100,
  "feasibility_score": 0-100,
  "pr_value_score": 0-100,
  "total_score": <átlag>,
  "category": "winner-candidate" | "runner-up" | "newsletter-only" | "decline",
  "reasoning": "<2 mondat>",
  "winner_pitch": "<ha winner-candidate: 1 bekezdés copy amiben javasoljuk hogy ő legyen a nyertes>"
}
```

Total score >75 → winner-candidate (top 5-10 a kampány végén)
50-75 → runner-up (mind kap kedvezményes ajánlatot)
25-50 → newsletter-only
<25 → polite decline

## 7. Belső folyamat — 6 hetes kampány

```
Week 1: launch
- Landing oldal go-live
- 1 YouTube videó "indítjuk a Q3 giveaway-t"
- 3 LinkedIn poszt
- 2 email a meglévő newsletter listának

Week 2-4: gyűjtés
- Naponta 1 LinkedIn poszt: "<X> jelentkező eddig, <Y> közülük <típus>"
- Heti 1 YouTube videó: élő stream Q&A-val a jelentkezésről
- Folyamatos AI-pontozás minden submission-re

Week 5: rövid lista
- Top 10 winner-candidate-ből → 3 fős shortlist Attila kézi átnézéssel
- 3 live 30-perces hívás a shortlist-tel
- Győztes kiválasztása

Week 6: kihirdetés
- 1 YouTube videó "ő nyerte" + indoklás
- A nyertes vállalja a build-in-public dokumentumokat
- Runner-up-oknak (50-75 score) auto-email a 30%-os kedvezménnyel
```

## 8. Kommunikáció a nem-nyerteseknek

**„Második helyezett" ajánlat 3 szinttel:**

**Top runner-up (60-75 score, max 20 fő):** 30%-kal olcsóbb 9 900 Ft belépő audit → 6 900 Ft, 7 napos érvényesség. Ez magasan kvalifikált lead, gyors döntésre késztetjük.

**Runner-up (50-60 score):** 20%-kal olcsóbb Akadémia: 49k → 39 200 Ft, 14 napos érvényesség.

**Newsletter-only (25-50):** 41-leveles oktató sorozat, NULLA kedvezmény-ajánlat (még nem áll készen).

## 9. CRM címkék + státuszok

Új mezők a `lead_magnet_submissions` táblába (vagy külön `giveaway_campaigns` tábla):
- `campaign_slug` (q3-2027, q1-2028, ...)
- `total_score` (numeric)
- `category` (winner-candidate / runner-up / runner-up-top / newsletter / decline)
- `winner_pitch` (text, AI-generated)
- `attila_shortlist` (boolean — Attila kézi flag)
- `winner` (boolean)

## 10. Email sorozat

**Submission után (mindenkinek):**
- Day 0: „Megkaptuk a jelentkezésedet — itt a folyamat"
- Day +7 (kampány közben): „Mit látunk eddig a jelentkezőkről" — anonymizált insights
- Day +21 (rövid lista előtt): „Top 10 jelentkező — vagy te?"

**Kihirdetés után:**
- Winner: külön kézzel-írt email + Telegram
- Top runner-up: „Itt a 30% kedvezményed, 7 napod van"
- Runner-up: „Itt a 20% Akadémia kedvezményed, 14 napod van"
- Newsletter-only: „Köszönjük a jelentkezést — itt a heti levelek"
- Decline: „Köszönjük — itt amit én csinálnék először a vállalkozásoddal" (PEM template)

## 11. Hogy lesz ebből nem nyereményjáték, hanem ügyfélszerző kampány

A klasszikus „autót nyersz" típusú giveaway baja: random közönséget hoz, nem ügyfeleket. Ez a kampány hivatalosan **„első ügyfélprojekt-pályázat"**.

- A copy NEM „nyerd meg" — „pályázz az első dokumentált AI-projektünkre"
- A jelentkezés komoly (10 kérdés, 8 perc) — szűr
- A nyertes nyilvánosan dokumentálva — case study, social proof Attila számára
- 80% a jelentkezőknek kedvezményes belépő → mérhető bevétel a kampányból (NEM csak figyelemgyűjtés)

Cél: 1 kampányból (4-6 hét) → ~100-200 minősített jelentkező → 20-30 runner-up bevásárol → 200k-600k Ft direct revenue + 1 case study + brand-pozicionálás.

## 12. Mérőszámok

| Metrika | Cél (Q3 2027 első futás) |
|---------|----------------------------|
| Total jelentkező | 100-200 |
| Winner-candidate (>75) | 5-10 |
| Runner-up-top (60-75) | 15-25 |
| Top runner-up → 6 900 Ft konverzió | ≥50% |
| Runner-up → 39 200 Ft Akadémia konverzió | ≥15% |
| Kampány direct revenue | min. 300 000 Ft |
| Kampány attribuált 30-napi 199k+ konverzió | min. 2 ügyfél |
| YouTube subscriber lift (kampány alatt) | +50-100 |
| Newsletter signup lift | +30-50% normál hét-átlaghoz képest |

## 13. Mit kell technikailag elkészíteni

- [ ] Új tábla: `giveaway_submissions` (vagy `lead_magnet_submissions` kibővítése `campaign_slug`-gal)
- [ ] `app/lead-magnet/ai-rendszer-giveaway-q3/page.tsx` (komolyabb form, 10 kérdés)
- [ ] AI scoring system prompt — `lib/anthropic.ts` `giveaway-scorer` slug
- [ ] Stripe Payment Link-ek a 6 900 Ft és 39 200 Ft kedvezményes ajánlatokhoz (7/14 napos érvényesség, expiry beépítve)
- [ ] Email automation a 4 szegmenshez (MailerLite custom automation)
- [ ] Admin felület: Attila számára shortlist-átnézés (új admin page `/admin/giveaway`)
- [ ] Kihirdetés workflow: nyertes YouTube videó upload + thumbnail + LinkedIn carousel auto-poszt
- [ ] Jogi: nyereményjáték szabályzat („pályázat") — jogász review szükséges

**Felelős a build-in-public szabály betartásáért:** ne pózolj nagyobbra. Az első Q3 kampány **EXPLICIT „first Q3 giveaway"** — nem „a sikeres negyedik kampányunk". Mert ez az első.
