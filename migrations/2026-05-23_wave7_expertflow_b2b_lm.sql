-- Wave 7 — Expert Flow B2B lead magnetek (LM7, LM8, LM9)
--
-- Ugyanaz a lead_magnet_submissions tábla, csak új slug-okkal a B2B funnel-hez.
-- A page-ek az expertflow-website-v4 repo-ban élnek, de a generation + Hermes
-- review a solobusiness-academy process-pending cron-jában fut (közös Supabase).
--
-- Új slug-ok:
--   operations-erettsegi-audit   (LM7, kockázatcsökkentés — 5 kérdés, 48h)
--   pilot-rendszer-blueprint     (LM8, próba-érték — 8 kérdés, 5 munkanap)
--   operations-diagnozis-hivas   (LM9, bizalom-építés — Cal.com 30p CEO)
--
-- LM9 audit-update: 45p CEO+COO együtt → 30p CEO egyedül (COO opcionális
-- follow-up). Lásd: content/lead-magnets/00-AUDIT-2026-05-23.md, KÖZ 3.

alter table lead_magnet_submissions
  drop constraint if exists lead_magnet_submissions_lead_magnet_slug_check;

alter table lead_magnet_submissions
  add constraint lead_magnet_submissions_lead_magnet_slug_check check (lead_magnet_slug in (
    -- Wave 4 (Solo Business szóló aldim — A):
    'ai-mukodesi-terkep',
    'ai-folyamatvazlat-48h',
    'ugyfelut-audit',
    -- Wave 5 (Solo Business szóló aldim bővítés):
    '48h-ai-gyorsdiagnozis',
    'kockazatmentes-audit',
    'mondd-el-egyszer',
    'ai-rendszer-giveaway-q3',
    'auditprogram-9900',
    -- Wave 6 (Solo Business mini-csapat aldim — B):
    'csapat-szerep-terkep',
    'mini-onboarding-vazlat',
    'sales-pipeline-diagnozis',
    -- Wave 7 (Expert Flow B2B):
    'operations-erettsegi-audit',
    'pilot-rendszer-blueprint',
    'operations-diagnozis-hivas'
  ));

-- B2B-specifikus opcionális mezők — később lehet bővíteni
alter table lead_magnet_submissions
  add column if not exists company_name text,
  add column if not exists company_size text check (company_size is null or company_size in (
    '1', '2-3', '4-9', '10-25', '26-50', '51-100', '100-plus'
  )),
  add column if not exists industry text,
  add column if not exists annual_revenue_band text check (annual_revenue_band is null or annual_revenue_band in (
    'under-50m', '50-200m', '200-500m', '500m-1b', '1b-plus'
  )),
  add column if not exists role text;  -- pl. "CEO", "COO", "operations lead"

create index if not exists lms_b2b_idx
  on lead_magnet_submissions (lead_magnet_slug, company_size, created_at desc)
  where lead_magnet_slug in (
    'operations-erettsegi-audit',
    'pilot-rendszer-blueprint',
    'operations-diagnozis-hivas'
  );

-- Done. Verify:
--   select lead_magnet_slug, count(*) from lead_magnet_submissions group by 1;
--   select * from lead_magnet_submissions where lead_magnet_slug like 'operations-%' or lead_magnet_slug = 'pilot-rendszer-blueprint';
