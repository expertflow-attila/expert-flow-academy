# Expert Flow Akadémia

Zárt kurzusplatform szolgáltató vállalkozóknak. Visualize Value [Course Platform Without LMS](https://visualizevalue.com/workflows/course-platform-without-lms) mintára: Next.js + Supabase + Stripe + Cloudflare Stream, ~$5/hó működési költség.

**Brand:** Expert Flow — design rendszer ugyanaz mint az [ev-landings.vercel.app/aios](https://ev-landings.vercel.app/aios). Dark, Instrument Serif italic, oklch színek, rose/violet/sky accentek, zero emoji, zero gradient.

## Stack

| Réteg | Választás |
|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind v4 |
| Auth | [Auth.js (NextAuth v5)](https://authjs.dev) + [`@auth/supabase-adapter`](https://authjs.dev/getting-started/adapters/supabase) — passwordless magic link |
| Email | SMTP (Brevo / Resend / Postmark) |
| DB | Supabase Postgres (Pro) — `next_auth` séma + `public` (courses/modules/lessons/memberships/progress) |
| Payment | Stripe Checkout Session (one-time per kurzus) + webhook |
| Video | Cloudflare Stream (signed JWT, HLS) |
| Email automation | Kit V4 sequence enroll vásárlás után |
| Deploy | Vercel |

## Quick start

```bash
cp .env.example .env.local
# Töltsd ki a kulcsokat
npm install
npm run dev
```

## Adatbázis migráció

```bash
# A Supabase CLI-vel:
supabase db push   # vagy:
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260520_course_platform.sql

# Seed a pilothoz:
psql "$SUPABASE_DB_URL" -f supabase/seed/pilot.sql
```

Megj.: az Auth.js Supabase adapter sémát a hivatalos doc szerint kell beállítani — a migrációs fájl tartalmazza a `next_auth` schemát és a 4 táblát, ami a [https://authjs.dev/getting-started/adapters/supabase](https://authjs.dev/getting-started/adapters/supabase) szerint kell.

## Stripe webhook lokálisan

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# A whsec_... értéket másold a STRIPE_WEBHOOK_SECRET env-be
```

Teszt vásárlás: `4242 4242 4242 4242` bármilyen érvényes lejárattal + CVC-vel.

## Útvonalak

| Útvonal | Cél | Hozzáférés |
|---|---|---|
| `/` | Marketing landing | publikus |
| `/courses` | Kurzusok listája | publikus |
| `/courses/[slug]` | Kurzus részletek + Megveszem | publikus |
| `/login` | Magic link kérés | publikus |
| `/login/check-email` | "Ellenőrizd az emailed" | publikus |
| `/learn` | Member dashboard (saját kurzusok) | member |
| `/learn/[course]/[position]` | Lecke (sidebar TOC + video + progress) | member vagy preview |
| `/learn/welcome` | Stripe success landing | publikus (post-checkout) |
| `/api/auth/[...nextauth]` | Auth.js | — |
| `/api/checkout` | Stripe Checkout Session (POST) | publikus |
| `/api/stripe/webhook` | Stripe events (signature verify) | webhook |
| `/api/video/sign` | Cloudflare Stream signed token | member vagy preview |
| `/api/progress` | Lecke "kész" jelölés | member |

## Költség

| Tétel | $/hó |
|---|---|
| Vercel Hobby | 0 |
| Supabase Pro | (meglévő) |
| Cloudflare Stream | ~2-5 |
| Stripe | tranzakció % |
| Kit V4 | (meglévő) |

**Inkrementális: ~$2-5/hó.**

## Forrás

- Plan fájl: `~/.claude/plans/ezen-oldal-alapj-n-async-piglet.md`
- Memory: `memory/project_solobusiness_academy.md` (ez a projekt)
