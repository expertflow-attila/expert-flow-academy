-- Wave 6 — Expert Flow mini-csapat lead magnetek (LM4, LM5, LM6)
--
-- Új slug-ok a B aldimenzióhoz (1-3 fős mini-csapat ICP):
--   csapat-szerep-terkep            (LM4, könnyűség — 3 kérdés, 24h email)
--   mini-onboarding-vazlat          (LM5, próba-érték — 6 kérdés, 48h email)
--   sales-pipeline-diagnozis        (LM6, bizalom-építés — Cal.com 30p)
--
-- Ugyanaz a lead_magnet_submissions tábla, csak új slug-okkal.
-- LM4-5 a STANDARD generation flow-ba illeszkedik (Claude → Hermes review → email).
-- LM6 a kvalifikációs flow-ba (mint az ugyfelut-audit): qualification_result + Cal redirect.

alter table lead_magnet_submissions
  drop constraint if exists lead_magnet_submissions_lead_magnet_slug_check;

alter table lead_magnet_submissions
  add constraint lead_magnet_submissions_lead_magnet_slug_check check (lead_magnet_slug in (
    -- Wave 4 (szóló aldim — A):
    'ai-mukodesi-terkep',
    'ai-folyamatvazlat-48h',
    'ugyfelut-audit',
    -- Wave 5 (szóló aldim bővítés):
    '48h-ai-gyorsdiagnozis',
    'kockazatmentes-audit',
    'mondd-el-egyszer',
    'ai-rendszer-giveaway-q3',
    'auditprogram-9900',
    -- Wave 6 (mini-csapat aldim — B):
    'csapat-szerep-terkep',
    'mini-onboarding-vazlat',
    'sales-pipeline-diagnozis'
  ));

-- Done. Verify:
--   select lead_magnet_slug, count(*) from lead_magnet_submissions group by 1;
