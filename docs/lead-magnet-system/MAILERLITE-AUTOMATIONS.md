# MailerLite automation setup — UI-only feladat

> Az API csak a **csoportokat** tudja létrehozni — a Connect API NEM publikus az
> automations-re. Minden lent levő automation kézzel kell elkészíteni a MailerLite
> UI-on (Automations → New automation). A trigger mindig "Subscriber joined group".

## Létrehozott csoportok (Wave 5 — 2026-05-24)

A 9 új csoport már létrejött az API-val:

| Slug | Group név | Group ID | Cél |
|------|-----------|----------|-----|
| `lm-48h-ai-gyorsdiagnozis` | Solo Business — LM4 48h Gyorsdiagnózis | `188340353953171086` | 5 email, 14 nap |
| `lm-kockazatmentes-audit` | Solo Business — LM5 Kockázatmentes audit | `188340354113603220` | 5 email, 21 nap (lassabb nurture) |
| `lm-mondd-el-egyszer` | Solo Business — LM3 Mondd el egyszer | `188340353787496071` | 4 email, 14 nap |
| `lm-ai-rendszer-giveaway-q3` | Solo Business — LM7 Q3 Giveaway pályázók | `188340354309686946` | szegmentált: 4 különböző sequence |
| `lm-auditprogram-9900` | Solo Business — LM8 9 900 Ft Belépő Audit (PAID) | `188340354477459128` | 5 email, post-delivery follow-up |
| `lm-csapat-szerep-terkep` | Solo Business — Wave6 Csapat-szerep térkép | `188340354636842684` | 3 email, 10 nap |
| `lm-mini-onboarding-vazlat` | Solo Business — Wave6 Mini onboarding vázlat | `188340354800420546` | 3 email, 10 nap |
| `lm-operations-erettsegi-audit` | Expert Flow B2B — Operations érettségi audit | `188340354962949869` | 4 email, B2B nurture |
| `lm-pilot-rendszer-blueprint` | Expert Flow B2B — Pilot rendszer-blueprint | `188340355140159254` | 4 email, B2B nurture |

A `lib/mailerlite.ts` minden enrollment-nél MINDKETTŐbe felveszi a subscribert (a 41-leveles `188014583560013564` + az LM-specifikus).

## Automation sablonok (UI-ban kell felépíteni)

### LM1 — 48h-ai-gyorsdiagnozis (5 email, 14 nap)

| Trigger | Day | Tárgysor | Mit küldjünk |
|---------|-----|----------|--------------|
| Subscriber joined group | 0 | „Itt a gyorsdiagnózisod, [name]" | A generált 7 napos akcióterv (a sablonnak nincs küldve emailben — ezt a sendLeadMagnetReport `lib/lead-magnet-email.ts` küldte) |
| Wait 2 days | +2 | „Beváltottad már az 1. napi lépést?" | 1 bekezdés bátorítás + 1 akadály-elhárító tipp |
| Wait 3 days | +5 | „Mi történt nálam a 30. napon" | Attila személyes build-in-public sztori |
| Wait 4 days | +9 | „A 3 leggyakoribb hiba az 1. heti bevezetésnél" | Anti-pattern + Q4-alapú dinamikus CTA (audit / akadémia) |
| Wait 5 days | +14 | „Mi lett a 7. napi eredményed?" | Konkrét kérdés válaszra (Hermes notifikációt indít válasz esetén) |

### LM2 — kockazatmentes-audit (5 email, 21 nap)

| Day | Tárgysor | Tartalom |
|-----|----------|----------|
| 0 | „Itt a kockázati térképed" | PDF link / dokumentum + személyes Attila-bekezdés |
| +3 | „Az AI-projekteim 90%-a megbukott" | Saját kudarc-sztori |
| +7 | „Mi NEM AI-feladat" | Anti-pattern lista |
| +14 | „Mi történne ha 30 napra elhalasztanád?" | Reverse psychology |
| +21 | „Itt a Solo Business 49k Akadémia — ha készen állsz" | Soft CTA |

**Extra:** A `lead_score > 50` ügyfelek a `+5` napos emailbe egy Cal.com kvalifikáció-linket kapnak. Ezt a Solobusiness-academy /lead-magnet/kockazatmentes-audit/koszonom oldal már mutatja inline — emailbe NEM kell külön szegmentálni.

### LM3 — mondd-el-egyszer (4 email, 14 nap)

| Day | Tárgysor | Tartalom |
|-----|----------|----------|
| 0 | „Itt a rendszered térképe — [name]" | A generált rendszer-térkép |
| +3 | „Beszédelmosó — egy 2 perces hangüzenet tőlem" | Csak top 30% lead-score esetén (high-touch — szegmentáld a MailerLite-on belül egy filter-rel) |
| +7 | „Mit nézel meg ezen az 1 napon" | Konkrét akció |
| +14 | „Készen állsz hogy ne te találd ki tovább?" | 199k mini sprint CTA |

### LM8 — auditprogram-9900 (5 email, audit átvétele után)

| Day | Tárgysor | Tartalom |
|-----|----------|----------|
| 0 | „Itt az auditod + Loom + Notion" | A 3 link (dokumentum-token + Loom + Notion) |
| +2 | „Néztél valamelyik szivárgási pontba?" | Bátorítás |
| +5 | „Még 2 nap a beszámítási lehetőségre" | Soft reminder a 7-napos beszámításra |
| +6 (24h előtt) | „Holnap lejár a beszámítás" | Konkrét call to action |
| +7 | „Ha most továbblépsz — beszéljünk 20 percet" | Cal.com link |
| +14 | „Mit gondolsz az auditról?" | Visszajelzés kérés (NEM eladás) |
| +30 | „Bejöttek a 30 napos lépések?" | Status check |

### LM7 — Giveaway (kampány-jellegű)

A giveaway-pályázók 4 szegmensbe kerülnek a `giveaway_category` mező alapján:
- `winner-candidate` → manuális kézi e-mail Attilától (nincs automation)
- `runner-up-top` → 1 email a 30% kedvezményről (6 900 Ft audit), 7 napos érvényesség
- `runner-up` → 1 email a 20% Akadémia kedvezményről (39 200 Ft), 14 napos érvényesség
- `newsletter-only` → csak a 41-leveles edu sorozat (default newsletter)

A szegmentálást a `lib/mailerlite.ts`-ben NEM kezeljük automatikusan a category alapján. A MailerLite UI-ban kell egy szegmenst létrehozni a `fields.category` mező alapján.

**ALTERNATIVA (V2):** kódban a `process-pending` cron a Giveaway scoring után automatikusan a megfelelő MailerLite csoportba kerül — most ehhez 4 új csoport kellene. Ha a kampány élesedik, érdemes ezt automatizálni.

## Általános ajánlások

- **DOI confirmation:** minden subscriber `unconfirmed` állapotban érkezik. A MailerLite alapértelmezett DOI email küldését hagyd bekapcsolva — a 41-leveles automation csak DOI confirm után indul.
- **Tárgysor A/B teszt:** minden Day 0 emailnél bekapcsolható.
- **Unsubscribe legalább 1 kattintással elérhető:** MailerLite alapból kezeli.
- **GDPR / Adatkezelés:** a `marketing_consent` mező a Supabase-ben jelzi az engedélyt — de a MailerLite-on belüli újra-engedélyezést a DOI biztosítja.

## A kódszintű enrollment hogyan működik

```typescript
// lib/mailerlite.ts
await enrollNewsletterSubscriber({
  email: "user@example.com",
  name: "Kis Béla",
  source: "lm-48h-ai-gyorsdiagnozis", // ezt a slug-prefixet add hozzá
});
```

A függvény:
1. POST `https://connect.mailerlite.com/api/subscribers`
2. Body: `{ email, fields: { name, source }, groups: [NEWSLETTER_GROUP_ID, LM_GROUP_ID], status: "unconfirmed" }`
3. Mindkét csoportba bekerül egyetlen API-hívással
4. Ha a `source` ismeretlen (nincs LM_GROUP_IDS-ben), csak a 41-levelesbe kerül be

A `source` mező a MailerLite-on belül `fields.source` néven elérhető, és segmentation-höz használható ha mégis ide jönnek a sequence-ek (pl. ha az adott LM csoport hatókörben overlap van).
