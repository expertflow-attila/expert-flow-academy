# LM 11 — Nagy Kedvezmény Kiszakított Részre: „9 900 Ft Belépő Audit (50k → 9 900)"

> Hormozi-keret: **80-90% kedvezmény kiszakított részre** — nem az egész szolgáltatást olcsóbban, hanem egy értékes részét nagyon kedvezményesen.
>
> **Megjegyzés:** Ez ugyanaz mint LM8 árazási szempontból. A különbség: LM8 = win-your-money-back mechanika (beszámítás). LM11 = pricing mechanika (80% kedvezmény kommunikáció). A két lead magnet KOMBINÁLHATÓ — és ténylegesen kombinálni IS érdemes: az LM10/LM11 landing fő üzenete = „80% kedvezmény + beszámítás".

## 1. Név
**„Korábban 49 000 Ft, most 9 900 Ft — limitált belépő audit"** — slug: `9900-belepo-audit` (de gyakorlatilag = LM8 / LM10 landing variáns)
URL variánsok:
- `/9900-audit-akcio` (kedvezményre fókuszáló copy)
- `/audit-9900` (LM8 — beszámításra fókuszáló copy)
- `/audit-bundle-9900` (LM10 — bundle-re fókuszáló copy)

## 2. Ígéret (egy mondat)
*„Az AI-Működési Auditomat korábban 49 000 Ft-ért árultam — most az első 30 audit 9 900 Ft. 80% kedvezmény, mert a build-in-public 30. napon vagyok és bizonyítanom kell."*

## 3. Mi az „eredeti ár" és miért hiteles a kedvezmény

**A 49 000 Ft NEM kitalált.** A Solo Business Akadémia 49 000 Ft-os kurzus a forrás-anyag az audit építéséhez. A logika:

- Akadémia (49k) = TE TANULOD MEG hogyan kell auditolni magad
- Belépő audit (9 900) = ÉN CSINÁLOM HELYETTED ugyanezzel a módszerrel

A 9 900 Ft tehát a saját Akadémia tartalom „felhasználási" jellegű árazása. NEM marketing-trükk.

**Build-in-public kommunikáció:**

> „Most a 30. napon vagyok. Még nincs 0 fizetős auditom. Az első 30 audit 9 900 Ft — utána visszamegyek 49 000 Ft-ra. Ha most fizetsz, három dolgot kapsz:
> 1. Az auditot 80% kedvezménnyel
> 2. Beszámítást a 359 000 Ft Teljes Auditba (lásd lent)
> 3. A bizonyítványt hogy Te voltál az egyik első 30 emberé akit auditoltam — anonymizált formában lehet hogy bekerülsz egy YouTube case study-ba"

## 4. A „limitált" elem hitelessége (KÖTELEZŐ build-in-public)

A „heti 5 audit" + „első 30 darab" SZIGORÚAN VALÓS. Nem „limitált a marketing kedvéért" — Attila tényleg ennyit tud csinálni heti 30 perc kézi finomítással + 1 óra Loom-felvétellel.

**Egy számláló a landing oldalon:**

```sql
select count(*) from lead_magnet_submissions
where lead_magnet_slug like '%9900%'
  and paid_at is not null
  and paid_at >= '2026-05-23';  -- launch dátum
```

Output: „22 / 30 audit elkelt" formátum, valós időben.

Ha a 30 elkelt → 49 000 Ft-ra emelkedik az ár, automatikusan. NEM marketing-trükk a fals scarcity.

## 5. Miért fontos NEM a teljes szolgáltatás olcsón

Hormozi pontosan ezt mondja: a kedvezmény NE az egész szolgáltatásra menjen. Itt:

- ✅ Belépő Audit 49 000 → 9 900 Ft (80% kedvezmény = kiszakított rész)
- ❌ NE: Teljes Audit 359 000 → 79 000 Ft (78% kedvezmény = teljes szolgáltatás)

Miért: ha a teljes szolgáltatást olcsón adjuk, a komoly ügyfelek elveszítik a hitét hogy értékes. A belépő-rész kedvezménye viszont „bizonyítási költség" — érthető, indokolt.

## 6. Mit tartalmaz pontosan (LM8-cal megegyező)

8 oldalas audit + Excalidraw + Loom magyarázat + Notion munkalap + 100% beszámítás.

Lásd `08-win-money-back.md` 7. szekció a részletes szerkezetért.

**Az LM11 nem új termék — az LM8 árazási kommunikációja, NEM tartalmi különbség.**

## 7. Kombinációs lehetőségek (LM8 + LM10 + LM11)

Mind a 3 lead magnet ugyanazt a 9 900 Ft auditot árulja, csak más copy-vel:

| Variáns | Fő üzenet | Mikor használjuk |
|---------|-----------|--------------------|
| LM8 (`/audit-9900`) | „Beszámítás 7 napon belül" | Mainstream — 41 leveles newsletter +9 napi emailből |
| LM10 (`/audit-bundle-9900`) | „Bundle — audit + vázlat ingyen" | LM2 (`ai-folyamatvazlat-48h`) ügyfelek upsell |
| LM11 (`/9900-audit-akcio`) | „80% kedvezmény, csak 30 darab" | Cold ad-re (LinkedIn / Meta) — sürgető elem |

A 3 variáns ugyanazt a `auditprogram-9900` slug-ot használja a backend-en. Csak a landing copy + UTM source különbözik.

## 8. UTM tracking

```
/9900-audit-akcio?utm_source=linkedin-ad-q3-2027
/audit-9900?utm_source=newsletter-day9-lm1
/audit-bundle-9900?utm_source=lm2-followup-day14
```

Heti monday-review egyik mérőszám: melyik variáns + utm_source hozza a legtöbb 9 900 Ft fizetést + a legjobb 30-napi 359k konverziót.

## 9. Etikus megjegyzés a „korábbi 49 000 Ft" árazásra

A 49 000 Ft akkor hiteles eredeti ár, ha:
- VOLT olyan szolgáltatás amit 49 000 Ft-ért árultunk (Akadémia kurzus)
- A 9 900 Ft termék érdemben hasonló értékű mint a 49 000 Ft termék (mindkettő = audit-szerű módszer)

Ami NEM etikus (és NEM csináljuk):
- A 49 000 Ft-ot kitaláljuk és sosem árultuk
- A 9 900 Ft termék 10× silányabb mint a „49 000 Ft eredeti"

Itt mindkét feltétel teljesül.

## 10. Mérőszámok

| Metrika | Cél | Megjegyzés |
|---------|-----|-------------|
| Konverzió `/9900-audit-akcio` (cold ad) | ≥2% | Cold traffic — alacsonyabb mint warm |
| Konverzió `/audit-9900` (warm newsletter) | ≥6% | Warm traffic |
| Konverzió `/audit-bundle-9900` (LM2 upsell) | ≥10% | Pre-qualified |
| Átlag CAC (Customer Acquisition Cost) | ≤2 500 Ft | Cold ad-ből — ha magasabb, kampány nem fenntartható |
| 30-napi 359k attribuált | ≥25% | A teljes mechanika sikerét ez méri |

## 11. Mit kell technikailag elkészíteni

- [ ] `app/9900-audit-akcio/page.tsx` (új variáns, „80% kedvezmény + first 30" copy)
- [ ] Real-time számláló komponens: `select count(*) from lead_magnet_submissions where paid_at is not null and lead_magnet_slug like '%9900%'`
- [ ] Auto-emelés mechanika: ha count >= 30, Stripe Payment Link automatikusan deaktiválódik és a landing átáll a „49 000 Ft" verzióra
- [ ] UTM source tracking: `lead_magnet_submissions.utm_source` mező
- [ ] Admin felület: a 30 darab progress monitoring (`/admin/audit-9900-status`)
- [ ] Email template: variánsonként más confirmation (LM11 esetén: „Te vagy a 22. a 30-ból" üzenet)
