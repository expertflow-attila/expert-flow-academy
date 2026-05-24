# 13 — AI Ügynök Architektúra: 8 szerep a Lead Magnet Rendszerben

> Az egész lead magnet rendszer 8 elkülönített AI ügynök-szerepre van bontva. Mindegyiknek **saját system prompt** + **input** + **output schema** + **mikor fut**.
>
> 2 használati mód:
> - **„Design mód"** — új lead magnet KIDOLGOZÁSÁNÁL fut a teljes lánc (1× / új LM)
> - **„Live mód"** — élő submission feldolgozásakor csak 5-7 fut (3-4 másodperc / ügyfél)

## Áttekintő ábra

```
┌──────────────────────────────────────────────────────────────┐
│                      DESIGN MÓD (új LM tervezésnél)            │
│                                                                │
│  [User input: "új LM ötlet, pl. retention térkép"]            │
│         ▼                                                       │
│  ┌──────────────────┐                                          │
│  │ 1. Strategist     │  ← válaszol: melyik Hormozi-keret       │
│  └──────┬───────────┘                                          │
│         ▼                                                       │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ 2. ICP profiler   │ ←─►│ 3. LM architect  │                 │
│  └──────┬───────────┘    └──────┬───────────┘                  │
│         ▼                          ▼                            │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ 4. Workflow eng.  │    │ 6. Copywriter    │                 │
│  └──────┬───────────┘    └──────┬───────────┘                  │
│         ▼                          ▼                            │
│        ▼  ▼  ▼  ▼          ▼  ▼  ▼                            │
│         ┌──────────────────┐                                    │
│         │ 8. Q-reviewer    │                                    │
│         └──────────────────┘                                    │
│                                                                │
│  Output: új `docs/lead-magnet-system/XX-newlm.md`              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      LIVE MÓD (élő submission)                 │
│                                                                │
│  [Form submit → Supabase pending]                              │
│         ▼                                                       │
│  ┌──────────────────┐                                          │
│  │ 5. AI analyst     │  ← elkészíti a dokumentumot             │
│  └──────┬───────────┘                                          │
│         ▼                                                       │
│  ┌──────────────────┐                                          │
│  │ 7. Sales bridge   │  ← dinamikusan dönti a CTA-t            │
│  └──────┬───────────┘                                          │
│         ▼                                                       │
│  [Hermes review → email]                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. Strategist (Stratégiai ajánlatépítő ügynök)

**Mit csinál:** Új LM ötlet bemenetére visszaadja, melyik Hormozi értékvektor a fő keret, és melyik 2-3 másodlagos vektor jön számításba.

**Mikor fut:** Egyszer minden új LM design fázis elején (Design mód).

**Bemenet:**
```json
{
  "idea": "string — pl. 'ügyfél-retention térkép'",
  "current_lm_portfolio": ["lm1", "lm2", ...],
  "icp": "magyar szóló szakértő vállalkozó",
  "value_ladder": ["49k akadémia", "199k sprint", "359k audit", "599k impl"]
}
```

**Kimenet:**
```json
{
  "primary_frame": "speed|risk-reduction|ease|problem-discovery|sample|carved-step|giveaway|win-money-back|decoy|buy-x-get-y|deep-discount|true-value",
  "secondary_frames": ["string"],
  "rationale": "<3-4 mondat magyarul, why ez a keret>",
  "estimated_value_ladder_step": "free|9.9k|49k|199k|359k|599k",
  "overlap_warning": "<ha túl közeli egy meglévő LM-hez>"
}
```

**Hol van implementálva:** `lib/anthropic.ts` — `strategist` slug (új system prompt blokk hozzáadandó).

**Példa hívás:**
```typescript
const result = await callStrategist({
  idea: "retention térkép — meglévő ügyfeleim hogyan ne morzsolódjanak le",
  ...
});
// → { primary_frame: "problem-discovery", ... }
```

---

## 2. ICP Profiler (Célcsoport- és problémafeltáró ügynök)

**Mit csinál:** A Strategist outputja alapján részletezi az ICP-t — pontos megnevezések, fájdalom-jellemzők, eddigi tapasztalat AI-val, költési hajlandóság.

**Mikor fut:** Strategist után (Design mód).

**Bemenet:** Strategist output + Expert Flow + Expert Flow ICP-adatok (`memory/project_anna_business_audit.md`, ICP-félelem mátrix).

**Kimenet:**
```json
{
  "primary_personas": [
    {
      "name": "Tanácsadó-Tibor",
      "demographic": "...",
      "current_situation": "...",
      "pain_points": ["..."],
      "fear_points": ["..."],
      "previous_ai_experience": "none|tried-and-failed|chatgpt-only|...",
      "spending_willingness_huf": "0|0-10k|10-50k|50-200k|200k+"
    }
  ],
  "icp_score_signals": {
    "qualified": "<mit látunk a válaszaiban>",
    "disqualified": "<mit látunk a válaszaiban>"
  }
}
```

---

## 3. Lead Magnet Architect

**Mit csinál:** A Strategist + ICP Profiler alapján megtervezi a LEAD MAGNET TELJES MŰKÖDÉSÉT az első kattintástól a fizetős ajánlatig.

**Mikor fut:** Strategist + ICP Profiler után. Design mód.

**Bemenet:** előbbi 2 ügynök output + a 12-szekciós sablon (`01-gyorsasag.md`).

**Kimenet:** strukturált markdown-tervezet az új LM doc-ra (12 szekcióval: név, ígéret, célcsoport, ... mérőszámok).

**Output formátum:** ugyanaz a 13 szekciós sablon mint a `01-12` doc-okban. Új `docs/lead-magnet-system/<XX>-newlm.md` tervezet.

---

## 4. Workflow Engineer (Automatizációs ügynök)

**Mit csinál:** Az LM Architect tervéből technikai workflow-t épít: űrlap-mezők, Supabase migráció, Claude system prompt vázlat, MailerLite source string, Cal.com event type (ha kell), Stripe Payment Link (ha fizetős).

**Mikor fut:** LM Architect után. Design mód.

**Bemenet:** LM Architect output.

**Kimenet:**
```json
{
  "supabase_migration_sql": "<full SQL>",
  "page_routes_to_create": ["/lead-magnet/<slug>/page.tsx", "/lead-magnet/<slug>/koszonom/page.tsx"],
  "claude_system_prompt": "<full system prompt for lib/anthropic.ts>",
  "claude_slug_to_add": "<slug>",
  "mailerlite_source_string": "lm-<slug>",
  "cal_event_type_needed": false,
  "stripe_payment_link_needed": false,
  "estimated_dev_hours": 4,
  "Did_you_check_the_existing_libs": true
}
```

**Az utolsó `Did_you_check_the_existing_libs` mező a CLAUDE.md kötelező szabálya:** ne hozz létre új libet ha meglévő van. Ha `false`, a workflow engineer rossz munkát végzett.

---

## 5. AI Analyst (élő submission elemző)

**Mit csinál:** Live mód. Az ügyfél válaszait fogadja és lefuttatja a Claude system prompt-ot.

**Mikor fut:** Minden submission-nél (live).

**Bemenet:** payload (ügyfél válaszai) + slug → meghatározza melyik system promptot használja.

**Kimenet:** generált markdown (vagy markdown + Excalidraw JSON LM5-nél).

**Hol van:** `lib/anthropic.ts` `generateLeadMagnetReport(slug, payload)` — már implementálva LM1+LM2-re. Új LM-ek esetén csak új slug + system prompt-blokk hozzáadása.

---

## 6. Copywriter (Landing + emailek szövegezője)

**Mit csinál:** Az LM Architect tervéből landing page copy, email subject + body, CTA-kat ír. Magyar, build-in-public hangon, anti-AI szótár szűréssel.

**Mikor fut:** Design mód. LM Architect után, párhuzamosan a Workflow Engineer-rel.

**Bemenet:** LM Architect output + Expert Flow brand-hang (`docs/youtube_anti_ai_szotar.md`, `memory/feedback_youtube_build_in_public.md`).

**Kimenet:**
```json
{
  "landing_page_copy": {
    "hero_h1": "string",
    "hero_subtitle": "string",
    "value_stack": ["string"],
    "how_it_works": [{"step": 1, "text": "string"}],
    "cta_primary": "string",
    "cta_secondary": "string",
    "fine_print": "string"
  },
  "thank_you_page_copy": {
    "h1": "string",
    "body": "string",
    "next_steps": ["string"]
  },
  "email_sequence": [
    {"day": 0, "subject": "string", "body": "string"},
    {"day": 3, ...}
  ]
}
```

**Validáció:** az output egy második Claude-hívással megy át az anti-AI szótár szűrőn (`AntiAIScreener` skill — már él).

---

## 7. Sales Bridge (átvezető ügynök)

**Mit csinál:** Live mód. A submission válaszai + AI Analyst output alapján dinamikusan dönti melyik fizetős ajánlatra mutasson a CTA.

**Mikor fut:** Minden submission-nél, az AI Analyst után, a Hermes review előtt.

**Bemenet:** payload + AI Analyst output + ICP signal-ek (lead score).

**Kimenet:**
```json
{
  "recommended_next_step": "newsletter|9.9k-audit|49k-academy|199k-sprint|359k-audit|599k-impl|cal-qualification",
  "reasoning": "<1 mondat>",
  "cta_copy_override": "<opcionális — ha az AI Analyst doc-jából a CTA-szöveget felülírjuk>",
  "urgency_signal": "none|deadline|kapacitás|kombinált",
  "cross_lm_upsell": "<opcionális — ha másik LM-et is ajánljunk>"
}
```

**Példa logika (LM1 — 48h Gyorsdiagnózis):**
- Q4 >10h/hét → `9.9k-audit`
- Q4 ≤5h/hét → `49k-academy`
- Q5-ben ≥1 AI-eszköz + Q4 >10h → `199k-sprint`

Lásd `01-gyorsasag.md` 7. szekció.

---

## 8. Quality Reviewer

**Mit csinál:** Két szinten értékel:

**Design mód:** új LM design doc minőségi ellenőrzése — 6 dimenzió, 7.5/10 küszöb (lásd `12-valodi-ertek.md`).

**Live mód:** minden Claude-output ellenőrzése Hermes review előtt — ANTI-AI szótár, build-in-public hang, idézet-jelenlét, hosszkorlát.

**Mikor fut:**
- Design mód: minden új LM design végén (1×)
- Live mód: minden submission-nél, AI Analyst után, Hermes review ELŐTT

**Bemenet (live):** AI Analyst output + slug + payload.

**Kimenet (live):**
```json
{
  "passed": true|false,
  "anti_ai_violations": ["string"],
  "build_in_public_violations": ["string"],
  "factual_concerns": ["string"],
  "length_check": "ok|too-long|too-short",
  "auto_fix_attempted": false,
  "auto_fix_output": null,
  "recommendation": "send-to-hermes|regenerate|hermes-with-warning"
}
```

**Recommendation logika:**
- `send-to-hermes` — minden rendben
- `regenerate` — kritikus hiba, újra-Claude-hívás (max 1× retry)
- `hermes-with-warning` — apró ügyek, de Attila döntse el (a Hermes üzenetben kiemeljük a problémát)

**Hol van implementálva:** `lib/anthropic.ts` `quality-reviewer-live` és `quality-reviewer-design` slug-ok (új).

---

## 9. Ügynökök handoff protokoll (Design mód)

Az 1-4 + 6 + 8 sorba kapcsolódik. Bemenet → Strategist → ICP Profiler → LM Architect → (Workflow Engineer + Copywriter párhuzamos) → Quality Reviewer → output.

**Implementáció:** egyetlen TypeScript orchestrator `lib/lm-designer.ts`:

```typescript
export async function designNewLeadMagnet(idea: string): Promise<LMDesignResult> {
  const strategist = await callStrategist({ idea, ... });
  const icp = await callIcpProfiler({ idea, strategist });
  const architect = await callArchitect({ idea, strategist, icp });

  const [workflow, copy] = await Promise.all([
    callWorkflowEngineer({ architect }),
    callCopywriter({ architect, icp }),
  ]);

  const review = await callQualityReviewerDesign({ architect, workflow, copy });

  if (review.score < 7.5) {
    // 2. iteráció — manuálisan vagy auto-retry-vel
    throw new Error(`Quality Reviewer below threshold: ${review.score}`);
  }

  return { strategist, icp, architect, workflow, copy, review };
}
```

A teljes Design mód futás: kb. **30-60 másodperc Claude-idő + 0.5-1.0 USD költség** új LM-enként. Egy új LM bevezetése Wave-en belül: 30 perc design + 4-8 óra Workflow Engineer manuális implementáció.

## 10. Ügynökök költség és sebesség (live mód)

| Ügynök | Input token | Output token | Idő | Költség (Sonnet 4.6) |
|--------|-------------|----------------|-----|------------------------|
| 5. AI Analyst | ~3-5K | ~2-4K | 3-8s | ~15-25 Ft |
| 7. Sales Bridge | ~1K | ~300 | 1-2s | ~3 Ft |
| 8. Quality Reviewer (live) | ~3-4K | ~500 | 2-3s | ~4 Ft |
| **Összesen / submission** | | | **~6-13s** | **~22-32 Ft** |

Beépítve a Hermes review gate-be: a process-pending cron 1 percenként fut, max 5 submission / futás, így a teljes pipeline maximum 1-2 perc submit-tól Hermes-értesítésig.

## 11. Future: új ügynökök amik még nincsenek

**A 6-os Web Researcher** — opcionálisan: az ICP Profiler kiegészítője, aki webesen kutat (PostHog data, public ICP-adatok). Most a CLAUDE.md tiltja a chrome-devtools használatát, ezért kihagytuk. Ha valaha létrejön, ez lenne.

**A 8-as Performance Auditor** — havonta egyszer fut: végignézi az összes LM mérőszámát, és Quality Reviewer szempontjából javaslatot tesz mit kell refaktorálni. Wave 6-ra tervezve.

## 12. Hivatkozások

- `lib/anthropic.ts` — minden ügynök system prompt-jának helye
- `docs/LEAD_MAGNETS.md` — Wave 4 implementáció (5. + 7. ügynök él, ki van fejtve)
- `00-MASTER.md` — rendszer áttekintés
- `12-valodi-ertek.md` — Quality Reviewer 6 dimenziós scoring
- `memory/project_hermes_multi_agents.md` — Hermes 7-ügynök architektúra (külön rendszer, NE keverd össze ezzel az LM 8-ügynök architektúrával — más célra)
