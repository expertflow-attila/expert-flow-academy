# Wave 5 Deployment Guide — Lead Magnet Rendszer

> **Mit építettem ki (kódban):** 9 új lead magnet oldal, Stripe-integrált fizetős audit, decoy ajánlati oldal, 8 AI ügynök, Whisper integration, admin felületek.
>
> **Mit kell Neked manuálisan beállítanod** (account-okhoz tartozik): Stripe Product/Price/Coupon, Supabase Storage bucket, OpenAI API key, MailerLite automations, Cal.com event types, Notion/Loom workflow.

## 1. Mit kell előbb futtatni

### 1.1 SQL migráció

```bash
psql $DATABASE_URL -f migrations/2026-05-23_wave5_lead_magnets.sql
```

Vagy Supabase Dashboard → SQL Editor → bemásolás.

**Verifikáció:**
```sql
-- Mind a 8 új slug-nak müködnie kell:
select unnest(string_to_array(
  'ai-mukodesi-terkep,ai-folyamatvazlat-48h,ugyfelut-audit,48h-ai-gyorsdiagnozis,kockazatmentes-audit,mondd-el-egyszer,ai-rendszer-giveaway-q3,auditprogram-9900',
  ','
)) as slug;
select count(*) from audit_9900_questionnaires;
select count(*) from lm_email_sequence_state;
```

### 1.2 Supabase Storage bucket (LM3 audio)

A Supabase Dashboard-on:
1. **Storage → New bucket**
2. Name: `lead-magnet-audio`
3. **Public: NO** (csak service_role olvas/ír)
4. RLS policy: alapértelmezett (csak service_role)
5. Opcionálisan: Lifecycle policy → 30 napos auto-delete (Storage → Configuration)

### 1.3 Stripe Dashboard setup

**Products + Prices** (kézzel létrehozni a Stripe Dashboardon):

| Product név | Price (HUF) | Mode | Metadata |
|-------------|-------------|------|----------|
| 9 900 Ft Belépő Audit | 9 900 | one-time | variant=audit-9900 |
| 9 900 Ft Audit + Bundle | 9 900 | one-time | variant=audit-bundle-9900 |
| Teljes Audit + Rendszerterv | 359 000 | one-time | tier=359k |

**Coupon** (Dashboard → Coupons → New):

- Type: **Fixed amount**
- Amount off: **9 900 HUF**
- Currency: **HUF**
- Duration: **Once**
- Redeem by: nincs (per-promotion-code timestamp van)
- ID-t másold ki → `STRIPE_COUPON_AUDIT_REDEMPTION`

**Webhook** (Dashboard → Developers → Webhooks → New):

- Endpoint URL: `https://akademia.solobusiness.hu/api/stripe/audit-9900-paid`
- Eseménytípusok:
  - ✓ `checkout.session.completed`
  - ✓ `charge.refunded`
- Signing secret másolása → `STRIPE_WEBHOOK_SECRET`

### 1.4 OpenAI Whisper API key (LM3)

1. <https://platform.openai.com/api-keys> → New secret key
2. Másold a `.env` `OPENAI_API_KEY=` változóhoz
3. Költség: Whisper-1 $0.006/perc → heti 10 LM3 esetén ~200 Ft/hét

### 1.5 Env változók (Vercel Settings → Environment Variables)

A `.env.example`-ből minden új változót hozzá kell adni a Vercel projekthez:

```
STRIPE_PRICE_AUDIT_9900=price_...
STRIPE_PRICE_AUDIT_BUNDLE_9900=price_...
STRIPE_PRICE_TELJES_AUDIT_359K=price_...
STRIPE_COUPON_AUDIT_REDEMPTION=coupon_...
OPENAI_API_KEY=sk-...
```

A meglévők változatlanok (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, stb).

## 2. Mit építettem kódszinten (megépített fájlok)

### Új lead magnet oldalak (8)

| Path | Mit csinál |
|------|------------|
| `app/lead-magnet/48h-ai-gyorsdiagnozis/page.tsx` + `koszonom` | LM1 — Gyorsaság |
| `app/lead-magnet/kockazatmentes-audit/page.tsx` + `koszonom` | LM2 — Kockázatcsökkentés (lead score logika) |
| `app/lead-magnet/mondd-el-egyszer/page.tsx` + `koszonom` | LM3 — Voice/text/Loom input |
| `app/lead-magnet/ai-rendszer-giveaway-q3/page.tsx` + `koszonom` | LM7 — Giveaway pályázat (10 kérdés) |
| `app/audit-9900/page.tsx` + `koszonom/page.tsx` + `kerdoiv/[token]/page.tsx` + `dokumentum/[token]/page.tsx` | LM8 — Fizetős belépő |
| `app/audit-bundle-9900/page.tsx` | LM10 — Bundle variáns |
| `app/9900-audit-akcio/page.tsx` | LM11 — 80% kedvezmény variáns |
| `app/ajanlat/page.tsx` | LM9 — Decoy ajánlati oldal AI-személyre szabva |

### Új API route-ok

| Path | Mit csinál |
|------|------------|
| `app/api/stripe/audit-9900-paid/route.ts` | Stripe webhook a fizetésekhez (checkout.session.completed, charge.refunded) |
| `app/api/lead-magnet/process-pending/route.ts` (frissítve) | Cron — 5 új ágban dolgozza fel a slug-okat |

### Új admin oldalak

| Path | Mit csinál |
|------|------------|
| `app/admin/lead-magnets/page.tsx` | Dashboard: minden submission, slug-szűrés, status-szűrés, stats |
| `app/admin/lead-magnets/[id]/page.tsx` | Részlet: Approve / Edit / Reject + Email küldés |
| `app/admin/audit-9900-status/page.tsx` | Fizetős audit pipeline state, bevétel, beszámítások |

### Új lib modulok

| Path | Mit csinál |
|------|------------|
| `lib/anthropic.ts` (átírva) | 6 system prompt + 3 ügynök (recommendPackage, scoreGiveawayApplication, qualityReviewLive) |
| `lib/stripe.ts` (kibővítve) | createAudit9900CheckoutSession + verifyStripeWebhook + generateRedemptionCode |
| `lib/whisper.ts` (új) | OpenAI Whisper transzkripció |
| `lib/pdf.ts` (új) | Markdown → HTML konverzió a `/audit-9900/dokumentum/[token]` oldalhoz |

### Shared form komponensek

| Path | Mit csinál |
|------|------------|
| `app/lead-magnet/_components/lm-form.tsx` | FormField, FormTextarea, FormRadioGroup, FormCheckboxGroup, ConsentFields, SubmitButton, ErrorBox, GdprFooter |

### SQL migráció

| Path | Mit csinál |
|------|------------|
| `migrations/2026-05-23_wave5_lead_magnets.sql` | 8 új slug, 17 új mező, 2 új tábla (audit_9900_questionnaires, lm_email_sequence_state), 5 új index |

## 3. Mit NEM építettem ki (Attila felelőssége)

### 3.1 Loom audio kinyerés

Az LM3-ban ha az ügyfél Loom URL-t ad meg, jelenleg **manuálisan** kell transzkriptet készíteni. A `lib/whisper.ts`-ben a `transcribeLoomUrl()` egy stub.

**V2 megoldás:** a Hostinger VPS-en futó hermes-reception ügynökhöz egy új endpoint (`/transcribe-loom`) ami yt-dlp + Whisper-rel feldolgozza. Attila kézzel kell hozzáadnia.

### 3.2 MailerLite utánkövető automation

Minden új slug-hoz külön email-sorozat kell a MailerLite UI-on belül. A spec-ek a `01-12-*.md` doc-okban vannak a "Utánkövető email sorozat" szekcióban.

A subscriber enrollment kódszinten működik (a `lib/mailerlite.ts` source string-eket fogad — az új slug-okhoz frissíteni kell a `EnrollResult.source` típust).

### 3.3 Cal.com új event type (LM2 qualification call)

Az LM2 (kockázatmentes-audit) az AI-elemzés alapján score >50 esetén Cal.com-ra ajánl továbblépést. A Cal.com `solobusiness/kvalifikacio-20min` event type-ot manuálisan kell létrehozni (lásd `docs/LEAD_MAGNETS.md` 5. szekció a Cal.com setup pattern-jéért).

### 3.4 Hermes review gate bővítése az új slug-okra

A `lib/hermes-notifier.ts` jelenleg csak `ai-mukodesi-terkep` és `ai-folyamatvazlat-48h` slug-okat ismer. Az új slug-okhoz a hermes-notifier-ben:
- Bővíteni a `leadMagnetSlug` típust
- Új title-mapping bejegyzések
- A `formatPayloadSummary` függvénybe új ágak

A Hostinger VPS-en futó hermes-reception ügynöknek viszont **NEM kell** változtatás — az ugyanúgy fogadja a notifikációkat, csak a callback URL-t hívja vissza.

### 3.5 Notion sablonok (LM8 audit)

A 9 900 Ft audit kimenetében szerepel egy Notion munkalap link. Most a `notion_page_id` mező a dokumentum-token-t tárolja (újrahasznosított mező). Ha **valóban Notion-integrációt** akarsz:
1. Hozz létre egy "9 900 Ft Audit Template" Notion oldalt
2. Notion API tokent szerezz: <https://developers.notion.com/>
3. Új lib: `lib/notion.ts` — `duplicateAuditTemplate()` függvény
4. Process-pending-ben hívd meg ezt minden új audit generáláskor
5. A `notion_page_id` mezőbe a valós Notion page ID kerüljön

Most a publikus `/audit-9900/dokumentum/[token]` URL helyettesíti — Attila Print → PDF-fel mentheti a vásárlónak, vagy a vásárló közvetlenül.

### 3.6 Loom video felvétel (LM8 audit)

A 9 900 Ft audit ígéri az 1 órás Loom-magyarázatot. Ezt **Attila kézzel rögzíti** minden vásárlóhoz. A workflow:

1. Az admin `/admin/audit-9900-status` oldalon látod hogy ki vár a Loom-ra
2. A `/admin/lead-magnets/[id]` oldalon megnyitod a vásárló dokumentumát
3. Loom-mal felveszed (max 60 perc Free tier)
4. A Loom share linket bemásolod egy új admin mezőbe (`loom_video_id`) — ezt a logikát ki kell egészíteni az admin részleteslapon, most csak megjelenítő (V2)

### 3.7 Cron amik nem futnak még

Az utánkövető email-sorozat-kron (`lm_email_sequence_state` tábla alapján) **NEM épült meg ebben a Wave-ben**. A schema kész — a cron route és a per-slug email-template gyártás külön Wave-be tartozik.

## 4. Tesztelési ellenőrző lista

### 4.1 Staging tesztelés (lokál)

```bash
cd solobusiness-academy
npm install
npm run dev
```

Aztán nyisd meg:
- `http://localhost:3000/lead-magnet/48h-ai-gyorsdiagnozis` — töltsd ki, küldd el
- `http://localhost:3000/lead-magnet/kockazatmentes-audit` — töltsd ki, lead score számolás megnézés
- `http://localhost:3000/lead-magnet/mondd-el-egyszer` — szöveges válaszzal (audio Vercel-re kell)
- `http://localhost:3000/audit-9900` — Stripe Checkout indítás (test mode)
- `http://localhost:3000/audit-bundle-9900` — bundle variáns
- `http://localhost:3000/9900-audit-akcio` — counter ellenőrzés
- `http://localhost:3000/ajanlat?from=ai-mukodesi-terkep` — decoy oldal
- `http://localhost:3000/admin/lead-magnets` — admin (admin user-ként bejelentkezve)

### 4.2 Cron tesztelés

```bash
# Process-pending — fusson lokál mode-ban
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/lead-magnet/process-pending
```

A response JSON-ban látod hány submission lett feldolgozva, hány hiba.

### 4.3 Stripe webhook tesztelés

```bash
stripe listen --forward-to localhost:3000/api/stripe/audit-9900-paid
# másik terminálban:
stripe trigger checkout.session.completed
```

## 5. Mit állítok be élesedés ELŐTT

- [ ] SQL migráció lefuttatva production Supabase-en
- [ ] Storage bucket létrehozva: `lead-magnet-audio`
- [ ] Stripe Dashboard: 3 Product/Price + 1 Coupon kész
- [ ] Stripe Webhook: endpoint + signing secret konfigurálva
- [ ] OpenAI API key beállítva
- [ ] Minden új env változó megvan Vercel-en
- [ ] Admin email-ek a `ADMIN_EMAILS` környezeti változóban
- [ ] Manuális teszt: 1 submission átment minden új LM-en
- [ ] Stripe test mode: 1 fizetés átment és a webhook triggerelt
- [ ] Whisper teszt: 1 audio file feldolgozott
- [ ] Hermes review gate: 1 értesítés Telegramra ment

## 6. Mit NE csinálj még

- Ne pusholj live Stripe key-eket fejlesztéskor — test mode-ban tesztelj
- Ne tedd publikussá a `lead-magnet-audio` Storage bucket-et — service_role only
- Ne deployolj éles MailerLite automation nélkül — az LM ügyfelek nem kapnák meg a 41 leveles sorozatot
- Ne futtasd a `auto-release` cron-ot az új slug-okra MAGEDLG a Hermes-notifier ki nem bővül — most a 18/40h fallback nem küld emailt az új slug-okhoz
- Ne hagyd Production-ben fejlesztési Anthropic key-t — heti 50+ submission esetén meglepetés-számla

## 7. Költség becslés (heti)

| Tétel | Költség / submission | Heti várt | Heti összesen |
|-------|----------------------|------------|------------------|
| Sonnet 4.6 standard LM (~5K in + 3K out) | ~20 Ft | 50 | 1 000 Ft |
| Sonnet 4.6 audit 9 900 Ft (~5K in + 5K out) | ~30 Ft | 5 | 150 Ft |
| Haiku 4.5 quality review | ~5 Ft | 50 | 250 Ft |
| Haiku 4.5 sales bridge (decoy oldal) | ~3 Ft | 80 | 240 Ft |
| Haiku 4.5 giveaway scoring (kampány alatt) | ~5 Ft | 50 | 250 Ft |
| Whisper transzkripció (LM3 csak) | ~5 Ft | 8 | 40 Ft |
| Stripe fee per audit fizetés | ~270 Ft | 5 | 1 350 Ft |
| **Összesen** | | | **~3 280 Ft / hét** |

**Várt bevétel:** 5 audit × 9 900 = 49 500 Ft / hét. Net: ~46 000 Ft / hét csak az auditokból, mielőtt a 359k konverziók beérnek.

**Break-even point:** kb. 0.3 audit / hét fedezi az AI-költségeket. Bőven fenntartható.

## 8. Heti monday-review (Hermes cron bővítés)

A meglévő Hermes monday-review cron-t (Hostinger VPS) ki kell bővíteni hogy a Wave 5 mérőszámokat is figyelje:

```sql
-- Submission count per slug, utolsó 7 nap
select lead_magnet_slug, count(*)
from lead_magnet_submissions
where created_at > now() - interval '7 days'
group by lead_magnet_slug;

-- 9 900 Ft eladások
select count(*), sum(payment_amount_huf)
from lead_magnet_submissions
where lead_magnet_slug = 'auditprogram-9900' and paid_at > now() - interval '7 days';

-- Beszámítások (redemption_used = true)
select count(*) from lead_magnet_submissions
where redemption_used = true and paid_at > now() - interval '7 days';

-- AI költség per slug
select lead_magnet_slug, sum(generation_cost_huf), sum(whisper_cost_huf)
from lead_magnet_submissions
where created_at > now() - interval '7 days'
group by lead_magnet_slug;
```

A Hostinger VPS-en futó `hermes-personal` ügynök monday-review részében ezeket lekérdezni, és heti összefoglalót Telegramra küldeni.
