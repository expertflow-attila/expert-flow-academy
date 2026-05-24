# Expert Flow — Lead Magnet Rendszer (Hormozi-keret)

> **Cél:** olyan belépési pont-portfólió, ami a hideg / langyos érdeklődőt 3 lépésben átvezeti a fizetős Expert Flow ajánlatba úgy, hogy minden lépésben kézzelfogható értéket kap, és NEM technikai megoldást vesz, hanem üzletfejlesztést.
>
> **Build-in-public KÖTELEZŐ:** semmi „így csináld", semmi „X év tapasztalattal", semmi guru-szófordulat. Lásd `CLAUDE.md` YouTube + lead magnet szekció + `docs/youtube_anti_ai_szotar.md`.
>
> **Hormozi név NEM jelenik meg sehol az ügyfélnek látható copy-ban.** Belső dokumentációban (ez a folder) szerepelhet.

## 1. Meglévő infrastruktúra (Wave 4 — DONE, 2026-05-23)

Erre építünk, NEM újat csinálunk. A 12 lead magnet közül 3 már él, 9 még tervezett, mind ugyanezt a 6 komponenst használja:

| Komponens | Fájl | Mit csinál |
|-----------|------|------------|
| Form route | `app/lead-magnet/<slug>/page.tsx` | React server action, Supabase insert: `pending` |
| Köszönöm oldal | `app/lead-magnet/<slug>/koszonom/page.tsx` | „Email-ben jön 1 munkanapon belül" |
| Process cron | `app/api/lead-magnet/process-pending/route.ts` | 1 percenként max 5 → Claude → Hermes review |
| Hermes review | `app/api/hermes/lead-magnet-review/route.ts` | Telegram callback HMAC-aláírva, APPROVE/EDIT/REJECT |
| Auto-release cron | `app/api/lead-magnet/auto-release/route.ts` | 18h / 40h fallback ha Hermes nem válaszol |
| Cal.com webhook | `app/api/cal/audit-booked/route.ts` | LM3 booking státusz update |
| Claude wrapper | `lib/anthropic.ts` | Sonnet 4.6, anti-AI szótár, build-in-public hang |
| Email küldés | `lib/lead-magnet-email.ts` | Nodemailer + brand-elt template |
| Hermes notify | `lib/hermes-notifier.ts` | `notifyHermesForReview()` + HMAC verify |
| MailerLite enroll | `lib/mailerlite.ts` | 41 leveles newsletter, group `188014583560013564` |
| Supabase tábla | `migrations/2026-05-23_lead_magnet_submissions.sql` | `pending → approved → delivered` |

**Új lead magnet hozzáadása = 3 fájl + 1 enum value:**
1. `app/lead-magnet/<slug>/page.tsx` (form)
2. `app/lead-magnet/<slug>/koszonom/page.tsx`
3. `lib/anthropic.ts` system prompt blokk hozzáadása
4. SQL migráció: `lead_magnet_slug` check constraint kibővítése

Minden más (cron, review gate, email, MailerLite) automatikusan futtatja az új slug-ot.

## 2. 12 lead magnet — Hormozi értékvektor mátrix

| # | Slug | Hormozi keret | Belépő típus | Státusz | Cél (Value Ladder) |
|---|------|----------------|---------------|---------|---------------------|
| 1 | `48h-ai-gyorsdiagnozis` | Gyorsaság | Ingyenes form | Tervezett | → 41-leveles newsletter + 49k Akadémia |
| 2 | `kockazatmentes-audit` | Kockázatcsökkentés | Ingyenes form | Tervezett | → 9 900 Ft fizetős audit (#11) |
| 3 | `mondd-el-egyszer` | Könnyűség | Voice/text input | Tervezett | → 199k mini sprint |
| 4 | `ai-mukodesi-terkep` | Problémafeltáró | Ingyenes form | **ÉL** (LM1) | → 41-leveles newsletter |
| 5 | `ai-folyamatvazlat-48h` | Próba a megoldásból | Ingyenes form | **ÉL** (LM2) | → 49k Akadémia |
| 6 | `ugyfelut-audit` | Egy lépés kiszakítva | Cal.com qualif | **ÉL** (LM3) | → 199k sprint / 359k audit |
| 7 | `ai-rendszer-giveaway-q3` | Giveaway | Quarterly nyereményjáték | Tervezett | → fő nyertes: 599k impl, többi: 9 900 audit |
| 8 | `auditprogram-9900` | Win money back | 9 900 Ft → beszámítás | Tervezett | → 359k audit (100% beszámít) |
| 9 | Decoy struktúra | Decoy | Ár-érték architektúra | Stratégia | Belső: ajánlati oldal logikája |
| 10 | `audit-plusz-vazlat` | Buy X get Y | 9 900 Ft + ingyenes vázlat | Tervezett | → 359k audit |
| 11 | `9900-belepo-audit` | Nagy kedvezmény | 49 000 → 9 900 Ft | Tervezett | → 199k / 359k |
| 12 | Meta szelektor | Valódi érték (audit) | Top 3 a fentiek közül | Stratégia | Mit gyártsunk legközelebb |

**Olvasási sorrend (technikai megvalósításhoz):**
- Először 4/5/6 (ÉL) — `04-problemafeltaro.md`, `05-proba-megoldasbol.md`, `06-kiszakitott-resz.md`
- Aztán 11 → 8 → 10 — fizetős belépő vonal (low-ticket entry)
- Aztán 1, 2, 3 — ingyenes vonal kiegészítése
- Végül 7 (giveaway), 9 (decoy), 12 (meta szelektor)

## 3. Value Ladder és átvezetés-térkép

```
HIDEG / LANGYOS                INGYENES                  9 900 Ft           49 000 Ft        199 000 Ft       359 000 Ft        599 000 Ft
─────────────────              ────────                  ─────────          ─────────        ──────────       ──────────        ──────────
YouTube / Skool free  ──►  LM1 problémafeltáró     ──┐
LinkedIn / cold email ──►  LM2 próba megoldásból   ──┤
Hideg ad             ──►  LM3 ügyfélút audit       ──┼──►  9 900 Ft belépő audit (LM8/10/11)
                            LM4 48h gyorsdiagnózis  ──┤              │
                            LM5 könnyűség           ──┤              │ 100% beszámítás
                            LM6 kockázatmentes      ──┘              ▼
                                                                Akadémia 49k       Mini sprint 199k    Audit + terv 359k     Implementáció 599k
                                                                (Build-in-public    (1 folyamat        (teljes ügyfélút      (kész rendszer
                                                                30 nap kurzus)      AI-vázlat +        térképezés +          átadása + 30 nap
                                                                                    implementáció)     priorizált terv)      támogatás)
```

Minden lead magnet pontosan EGY következő lépésre tereli az érdeklődőt — nem 3 opcióra. Az AI elemzés alapján döntjük el, hogy melyikre.

## 4. AI ügynök architektúra

A teljes rendszer 8 ügynök-szerepen alapul. Részletek: `13-ai-agents.md`. Rövid áttekintés:

```
┌──────────────────────┐
│ 1. Strategist        │  Eldönti melyik Hormozi keret + melyik fájl-szegmens
└──────────┬───────────┘
           ▼
┌──────────────────────┐    ┌─────────────────────┐
│ 2. Audience profiler │ ←─►│ 3. LM architect      │
└──────────┬───────────┘    └──────────┬──────────┘
           ▼                            ▼
┌──────────────────────┐    ┌─────────────────────┐
│ 4. Workflow engineer │    │ 6. Copywriter       │
└──────────┬───────────┘    └──────────┬──────────┘
           ▼                            ▼
┌──────────────────────┐    ┌─────────────────────┐
│ 5. AI analyst        │    │ 7. Sales bridge     │
└──────────┬───────────┘    └──────────┬──────────┘
           ▼                            ▼
              ┌──────────────────────┐
              │ 8. Quality reviewer  │
              └──────────────────────┘
```

A rendszer „live" módban: 1-5 az új lead magnet KIDOLGOZÁSÁNÁL fut (1× / új LM). 5-7 minden submission-nél lefut (élő ügyfél kérése).

## 5. Mérőszámok (rendszer-szintű)

Minden lead magnet ezt a 6 mérőszámot követi (a `lead_magnet_submissions` táblából + MailerLite + Cal.com + Stripe webhook):

| Metrika | SQL forrás | Mit jelez |
|---------|-------------|------------|
| Submission rate / nap | `count() group by lead_magnet_slug, date_trunc('day', created_at)` | Forgalom |
| Hermes approve rate | `count(*) filter (where attila_review_status='approved') / count(*)` | AI minőség |
| Email open rate | MailerLite UI / Brevo webhook | Tárgysor minőség |
| Click-through to next step | UTM trackelés a CTA-n | Sales bridge minőség |
| LM → fizetős konverzió 30 napon belül | Cross-join `lead_magnet_submissions` × `stripe_payments.email` | Funnel egészsége |
| Cost / submission | `sum(generation_cost_huf)` | Üzleti fenntarthatóság |

**Heti monday-review** (Hermes monday-review cron már fut, lásd `memory/project_hermes_multi_agents.md`):
- Heti összesített számok minden lead magnet slug-ra
- Top 3 problémakör az AI-elemzésekből (mit látunk gyakran)
- Konkrét javítási javaslat (űrlapkérdés-átfogalmazás, system prompt-csiszolás)

## 6. Roadmap (prioritás-sorrend)

**Wave 5 — Q3 2026 (most): low-ticket entry**
- [ ] `09-decoy.md` ajánlati struktúra véglegesítése (ár-architektúra)
- [ ] `11-nagy-kedvezmeny.md` LM11 — 9 900 Ft audit Stripe Payment Link
- [ ] `08-win-money-back.md` LM8 — 100% beszámítás logika
- [ ] `10-buy-x-get-y.md` LM10 — 9 900 + ingyenes vázlat bundle
- [ ] Heti monday-review Hermes cron kiegészítése a 4 új mérőszámmal

**Wave 6 — Q4 2026: szélesebb top-of-funnel**
- [ ] `01-gyorsasag.md` LM4 — 48h gyorsdiagnózis (új ingyenes belépő, főleg LinkedIn-re)
- [ ] `02-kockazatcsokkentes.md` LM6 — kockázatmentes audit (kifogás-kezelő, főleg cold ad-re)
- [ ] `03-konnyuseg.md` LM5 — voice/text input (Telegram bot / Hermes integráció)

**Wave 7 — Q1 2027: attention-grabber**
- [ ] `07-giveaway.md` LM7 — Q1 giveaway kampány („nyerj egy AI-rendszert")
- [ ] `12-valodi-ertek.md` — 12 lead magnet utólagos audit + következő 3 prioritás

## 7. Build-in-public szabályok (rendszer-szintű, KÖTELEZŐ)

Minden lead magnet kimenetnek meg kell felelnie ezeknek (ha bármelyik sérül, át kell írni):

1. **„30. napon vagyok" keret** — Attila NEM tanácsadó, NEM „10 év tapasztalattal". Most ezzel kísérletezik.
2. **Anti-AI szótár szűrés** — `lib/anthropic.ts` `ANTI_AI_VOCAB` const minden system promptba bekerül.
3. **Hormozi név TILTOTT a kimenetben** — „egy bevált módszer", „egy tapasztalt megközelítés".
4. **Heti 5/10 kapacitás kommunikálása valós** — ne mondjuk hogy „korlátozott" ha nem az.
5. **Hermes Telegram review gate** — semmi tisztán AI-generált nem megy ki Attila explicit OK-ja nélkül (kivéve auto-release 18h után, ami egy elfogadott trade-off).
6. **Konkrét, NEM általános** — minden elemzésben legyen idézet vagy parafrázis az ügyfél válaszából.

## 8. Hivatkozások

- `docs/LEAD_MAGNETS.md` — telepítési útmutató (Wave 4 live)
- `CLAUDE.md` — projekt kontextus, build-in-public szabály, anti-AI szótár
- `memory/project_solobusiness_brand_pivot.md` — Expert Flow / Expert Flow brand kettősség
- `memory/project_hermes_multi_agents.md` — Hermes architektúra
- `memory/project_security_fixes_20260510.md` — Bearer auth + HMAC szabványok
- `Expert Flow - AI Team/index.md` — LLM wiki agents/apis/libs kategóriák
