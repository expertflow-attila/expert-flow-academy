# Lead Magnetek — telepítési és üzemeltetési útmutató

> Wave 4 (Next.js kód) az `EXPERT AI TEAM/content/lead-magnets/` markdown-tervek alapján.
> A teljes spec: `EXPERT AI TEAM/content/lead-magnets/00-SPEC.md`.

## Mi épült meg

3 lead magnet (Hormozi keret szerint), mind a `solobusiness-academy` repo-ban él.

| Slug | Cél | Form útvonal | Hova fut |
|------|-----|---------------|----------|
| `ai-mukodesi-terkep` | LM1 — problémafeltáró | `/lead-magnet/ai-mukodesi-terkep` | 41 leveles hírlevél |
| `ai-folyamatvazlat-48h` | LM2 — próba a megoldásból | `/lead-magnet/ai-folyamatvazlat-48h` | Skool free + Akadémia |
| `ugyfelut-audit` | LM3 — egy lépés a teljes folyamatból | `/lead-magnet/ugyfelut-audit` | Cal.com → Akadémia / sprint |

## Architektúra (Wave 7 — Telegram bridge ÉLESBEN)

> A korábbi terv szerint a review gate Hostinger VPS-en futott volna. A jelenlegi élesedés egyszerűbb: a Telegram Bot API DIREKTEN a Vercel function-ből hív (`/api/internal/telegram-bridge`), és a URL-button-ekből visszaérkező GET-eket a `/api/hermes/review-link` HMAC-aláírt token-nel verifikálja.

```
[Form Server Action] ──► [Supabase insert: pending]
                                  │
                                  ▼
                      [Cron: /api/lead-magnet/process-pending]
                       (1 percenként, max 5 / futás)
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [LM1/LM2: Claude API]            [LM3 too-early: decline email]
                  │
                  ▼
       [/api/internal/telegram-bridge POST]
       → Telegram Bot API direkt sendMessage
       → @hermes_flowbot Markdown üzenet 3 URL-button-nel:
         [✅ Approve] [✏️ Edit] [❌ Reject]
                  │
                  ▼
       Attila Telegram-on rákattint
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
   Approve URL  Edit URL   Reject URL
   GET /api/    /admin/    GET /api/
   hermes/      lead-      hermes/
   review-link  magnets/   review-link
   ?action=     [id]       ?action=
   approve      (Server    reject
   &id&n&t      Action)    &id&n&t
       │          │          │
       ▼          ▼          ▼
   HMAC          Approve+   Status:
   verify        Send       rejected
   → email +     button     (nincs email)
   MailerLite    → email +
   enroll        update

       [Cron: /api/lead-magnet/auto-release]
       (1 óránként; 18h vagy 40h után auto-release email kimegy)
```

## Komponensek

### Markdown forrás (EXPERT AI TEAM repo)

- `content/lead-magnets/00-SPEC.md` — keret
- `content/lead-magnets/01-ai-mukodesi-terkep.md`
- `content/lead-magnets/02-ai-folyamatvazlat-48h.md`
- `content/lead-magnets/03-ugyfelut-audit.md`
- `content/lead-magnets/pdf-sources/*.md` — Puppeteer-renderelhető PDF source-ok
- `content/lead-magnets/notion-templates/*.md` — Notion sablon spec-ek

### Lib modulok (solobusiness-academy)

- `lib/anthropic.ts` — Claude Sonnet 4.6 API wrapper, 2 system prompt
- `lib/lead-magnet-email.ts` — brand-elt e-mail templating + Nodemailer
- `lib/hermes-notifier.ts` — Telegram review gate POST + HMAC verifikáció
- `lib/supabase-admin.ts` (meglévő)
- `lib/rate-limit.ts` (meglévő)

### API route-ok

- `app/api/lead-magnet/process-pending/route.ts` — Vercel Cron (1 perc), max 5 / futás
- `app/api/lead-magnet/auto-release/route.ts` — Vercel Cron (1 óra)
- `app/api/hermes/lead-magnet-review/route.ts` — Hermes webhook (HMAC-aláírva)

### Form page-ek

- `app/lead-magnet/ai-mukodesi-terkep/page.tsx` + `/koszonom/page.tsx`
- `app/lead-magnet/ai-folyamatvazlat-48h/page.tsx` + `/koszonom/page.tsx`
- `app/lead-magnet/ugyfelut-audit/page.tsx` + `/koszonom/page.tsx`

### Supabase

- `migrations/2026-05-23_lead_magnet_submissions.sql`

## Telepítési lépések

### 1. Függőség telepítés

```bash
cd solobusiness-academy
npm install
```

Az `@anthropic-ai/sdk` automatikusan települ a `package.json` frissítés alapján.

### 2. Supabase migráció lefuttatása

```bash
psql $DATABASE_URL -f migrations/2026-05-23_lead_magnet_submissions.sql
```

Vagy Supabase Dashboard → SQL Editor → paste content.

Verify:
```sql
select count(*) from lead_magnet_submissions;  -- 0
```

### 3. Env változók (Vercel + lokál)

A `.env.example` minden új env változót tartalmaz. A Vercel project Settings → Environment Variables-ben hozzá kell adni:

| Változó | Érték | Megjegyzés |
|---------|-------|------------|
| `ANTHROPIC_API_KEY` | `sk-ant-…` | Anthropic Console-ban szerezhető be |
| `CRON_SECRET` | `openssl rand -base64 32` | Cron auth |
| `HERMES_NOTIFY_URL` | pl. `http://82.29.178.127:7000/api/notify` | Hermes hostinger VPS endpoint |
| `HERMES_NOTIFY_SECRET` | közös HMAC titok | Mindkét oldalon ugyanaz |
| `CAL_AUDIT_URL` | `https://cal.com/solobusiness/ugyfelut-audit` | Wave 5 kalibráláshoz |

### 4. Hermes oldali integráció (hostinger VPS)

A `hermes-reception` sub-agent-nek hozzá kell adni egy endpoint-ot a notifikáció fogadására és a callback POST-olására. Konkrétan:

- `POST /api/notify` — fogadja a Expert Flow lead magnet review értesítéseket
- A bemenő JSON body szerint Telegram üzenetet küld 3 inline gombbal (Approve / Edit / Reject)
- Attila kattintásra POST visszaküldi a `callback_url`-re HMAC-aláírással

Részletek a `hermes-notifier.ts` `notifyHermesForReview` függvény body-jában.

### 5. Cal.com event type beállítás (Wave 5.3 checklist)

A Cal.com `solobusiness/ugyfelut-audit` event type — Cal.com UI-on, manuálisan kell felépíteni:

#### Event Type létrehozás

1. Cal.com Dashboard → Event Types → **+ New**
2. **Title:** "Ügyfélút audit (Expert Flow)"
3. **URL:** `solobusiness/ugyfelut-audit` — fontos, ez a slug megy a `CAL_AUDIT_URL` env változóba
4. **Description (markdown):**
   ```
   20 perces ügyfélút audit — Expert Flow.
   Megnézzük, mi történik attól a pillanattól, hogy valaki érdeklődik nálad,
   addig, hogy ügyfél lesz belőle. 1 munkanapon belül kapsz egy 1 oldalas
   írásos összefoglalót.

   Nem eladási hívás. Szigorúan diagnózis.
   ```
5. **Length:** 20 minutes
6. **Locations:** Cal Video (Google Meet) + Phone — a foglaló választ
7. **Availability:** hétfő-szerda-péntek 14:00–16:00 CET
8. **Buffer:** 10 perc előtte, 10 perc utána
9. **Limit bookings per day:** max 2
10. **Limit bookings per week:** max 5 (de a Expert Flow form kapacitás-check is védi)
11. **Booking questions:**
    - Submission ID (hidden, prefilled metadata): `submission_id`
    - Mit szeretnél javítani konkrétan? (textarea, prefilled metadata: `focus`)
12. **Confirmation e-mail customization (Workflow):**
    - **Trigger:** "Booking confirmed"
    - **Action:** "Send email to booker"
    - **Subject:** "Holnap találkozunk — itt a 3 kérdés"
    - **Body:** lásd a 03-as brief `### A hívás előtt — 24 órával` szekcióját
    - **Attachment:** `ugyfelut-audit-munkafuzet.pdf` (a Wave 2 PDF source-ból renderelve)
13. **Reminders:** 24 óra előtt + 1 óra előtt

#### Webhook konfigurálás

1. Cal.com Dashboard → Webhooks → **+ New**
2. **Subscriber URL:** `https://akademia.expertflow.hu/api/cal/audit-booked`
3. **Event triggers:**
   - `BOOKING_CREATED` ✅
   - `BOOKING_RESCHEDULED` ✅
   - `BOOKING_CANCELLED` ✅
4. **Secret:** `CAL_WEBHOOK_SECRET` Vercel env-ből — generálj egy 32-byte base64-et
5. **Payload template:** Default Cal.com format (a webhook handler ezt vár)

A részletes spec: `content/lead-magnets/03-ugyfelut-audit.md` — 4.4 Cal.com szekció.

### 6. Expert Flow homepage + Akadémia kurzus oldal — lead magnet linkek

A `app/page.tsx` és `app/courses/[slug]/page.tsx` mostantól tartalmaz "Még nem készen áll?" szekciót a 3 lead magnet-tel:

- Homepage `<LeadMagnets>` szekció a kurzus lista és a FinalCta között
- Kurzus oldal: csak nem-tag user-eknek (`!isMember`), modulok után, footer előtt

Mindkét helyen 3 card: LM1 (violet), LM2 (sky), LM3 (rose).

### 7. MailerLite auto-enroll integráció

A `lib/mailerlite.ts` exportálja az `enrollNewsletterSubscriber`-t, amit 3 helyről hívunk:

- `process-pending` — LM3 too-early submission decline emailhez
- `hermes-review` — approve/edit eseteknél
- `auto-release` — 18h/40h auto-release-nél

Mindenhol `marketing_consent = true` esetén, fire-and-forget módban (Promise catch), a flow blokkolása nélkül.

Konkrét MailerLite group: `188014583560013564` ("Expert Flow — Edu Newsletter").

Status `unconfirmed` — DOI confirmation a meglevő MailerLite UI workflow szerint.

## Üzemeltetési ellenőrző lista

### Manuális teszt — staging

1. Nyisd meg `/lead-magnet/ai-mukodesi-terkep`
2. Töltsd ki és küldd el a 3 kérdést egy teszt e-maillel
3. Várj kb. 60 másodpercet (a cron 1 percenként fut)
4. Ellenőrizd a Supabase `lead_magnet_submissions` táblát:
   - `generated_markdown` kitöltve
   - `attila_review_status = pending`
   - `hermes_message_id` kitöltve (ha Hermes konfigurálva)
5. Telegram-on jönnie kell egy értesítésnek @hermes_flowbot-tól
6. Kattints "Approve" → email megérkezik

### Heti review (Hermes monday-review)

A Hermes monday-review cron már gyűjti a heti statisztikákat. Hozzá kell adni:

- Hány lead magnet submission jött be?
- Hány review-elt (approve/edit/reject)?
- Hány auto-released?
- Mekkora az átlagos Claude API költség?
- Hány konverzió a hírlevélre / Akadémiára / Cal.com-ra?

### Költség becslés

| Item | Cost / submission | Heti várt | Heti cost |
|------|-------------------|-----------|-----------|
| Sonnet 4.6 input ~5K token | ~5 Ft | 30 | 150 Ft |
| Sonnet 4.6 output ~3K token | ~15 Ft | 30 | 450 Ft |
| Vercel function (egyik cron sem hosszú) | ingyenes | — | 0 Ft |
| Brevo transactional e-mail | ingyenes Brevo Free tier alatt | 30 | 0 Ft |
| **Összesen** | **~20 Ft / submission** | **30** | **~600 Ft / hét** |

Heti 30 submission durva felső becslés.

## Mit NEM kell most, de a Wave 5-ben fontos

- Cal.com event type létrehozása + confirmation e-mail testreszabás
- 3 landing page (jelenleg csak `/lead-magnet/<slug>` route-on érhető el, külön landing-ek dedikált hero-val nincsenek)
- E-mail delivery sequence (jelenleg minden ad-hoc; a 41 leveles automation-be belekapcsolódás külön task)
- Distribution posztok (Wave 6)

## Build-in-public hitelesség check

- Anti-AI szótár szűrés a Claude system prompt-okban — KÖTELEZŐ
- "30. napon vagyok" keret — KÖTELEZŐ
- Hormozi név NEM jelenik meg a kimenetben — KÖTELEZŐ
- Heti 5/10 kapacitás kommunikálása valós — KÖTELEZŐ
- Telegram review gate, hogy semmi tisztán AI-generált nem megy ki — KÖTELEZŐ

Ha bármelyik a build-in-public szabály sérül, a deliverable-t át kell írni.

## Kapcsolódó

- `content/lead-magnets/00-SPEC.md` — keret
- `content/lead-magnets/*.md` — 3 lead magnet brief
- `content/lead-magnets/pdf-sources/*` — PDF source-ok (Puppeteer-rel renderelhető)
- `content/lead-magnets/notion-templates/*` — Notion sablon spec-ek
- `memory/project_solobusiness_academy.md` — Akadémia repo memory
- `memory/project_hermes_multi_agents.md` — Hermes architektúra
