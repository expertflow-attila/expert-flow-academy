-- Wave 5 — Lead Magnet rendszer bővítése (9 új lead magnet + fizetős audit + decoy)
--
-- Új slug-ok:
--   48h-ai-gyorsdiagnozis            (LM1, gyorsaság)
--   kockazatmentes-audit             (LM2, kockázatcsökkentés)
--   mondd-el-egyszer                 (LM3, könnyűség — voice/text)
--   ai-rendszer-giveaway-q3          (LM7, giveaway pályázat)
--   auditprogram-9900                (LM8/10/11 — fizetős belépő audit)
--
-- Új mezők: lead_score, paid_at, payment_amount_huf, stripe_payment_id, raw_input_*,
--          notion_page_id, loom_video_id, redemption_used, redemption_eligible_until,
--          utm_source, recommendation, giveaway_*

-- 1. lead_magnet_slug check constraint frissítése
alter table lead_magnet_submissions
  drop constraint if exists lead_magnet_submissions_lead_magnet_slug_check;

alter table lead_magnet_submissions
  add constraint lead_magnet_submissions_lead_magnet_slug_check check (lead_magnet_slug in (
    'ai-mukodesi-terkep',
    'ai-folyamatvazlat-48h',
    'ugyfelut-audit',
    '48h-ai-gyorsdiagnozis',
    'kockazatmentes-audit',
    'mondd-el-egyszer',
    'ai-rendszer-giveaway-q3',
    'auditprogram-9900'
  ));

-- 2. ICP / lead scoring
alter table lead_magnet_submissions
  add column if not exists lead_score integer,
  add column if not exists recommendation text check (recommendation in (
    'newsletter', '9.9k-audit', '49k-academy', '199k-sprint',
    '359k-audit', '599k-impl', 'cal-qualification', 'too-early', 'no-fit'
  ));

-- 3. Fizetős audit (LM8/10/11)
alter table lead_magnet_submissions
  add column if not exists paid_at timestamptz,
  add column if not exists payment_amount_huf integer,
  add column if not exists stripe_payment_id text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists notion_page_id text,
  add column if not exists loom_video_id text,
  add column if not exists redemption_used boolean default false,
  add column if not exists redemption_eligible_until timestamptz,
  add column if not exists post_payment_questionnaire_completed_at timestamptz;

-- 4. LM3 — voice/text/loom input
alter table lead_magnet_submissions
  add column if not exists raw_input_type text check (raw_input_type in ('audio', 'text', 'loom')),
  add column if not exists raw_input_storage_url text,
  add column if not exists raw_input_transcript text,
  add column if not exists whisper_cost_huf numeric(10, 4);

-- 5. Tracking / attribution
alter table lead_magnet_submissions
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists lead_source text;

-- 6. Giveaway-specifikus mezők (LM7)
alter table lead_magnet_submissions
  add column if not exists giveaway_campaign_slug text,
  add column if not exists giveaway_total_score numeric(5, 2),
  add column if not exists giveaway_fit_score integer,
  add column if not exists giveaway_impact_score integer,
  add column if not exists giveaway_feasibility_score integer,
  add column if not exists giveaway_pr_value_score integer,
  add column if not exists giveaway_category text check (giveaway_category in (
    'winner-candidate', 'runner-up-top', 'runner-up', 'newsletter-only', 'decline', 'winner'
  )),
  add column if not exists giveaway_attila_shortlist boolean default false,
  add column if not exists giveaway_is_winner boolean default false;

-- 7. Decoy ajánlat tracking (LM9)
alter table lead_magnet_submissions
  add column if not exists ajanlat_recommended_package text check (ajanlat_recommended_package in ('A', 'B', 'C', 'D')),
  add column if not exists ajanlat_viewed_at timestamptz,
  add column if not exists ajanlat_clicked_package text check (ajanlat_clicked_package in ('A', 'B', 'C', 'D')),
  add column if not exists ajanlat_purchased_package text check (ajanlat_purchased_package in ('A', 'B', 'C', 'D'));

-- 8. qualification_result enum kibővítése
alter table lead_magnet_submissions
  drop constraint if exists lead_magnet_submissions_qualification_result_check;

alter table lead_magnet_submissions
  add constraint lead_magnet_submissions_qualification_result_check check (qualification_result is null or qualification_result in (
    'qualified', 'too-early', 'no-fit',
    'qualified-9.9k', 'qualified-49k', 'qualified-199k', 'qualified-359k', 'qualified-cal'
  ));

-- 9. Indexek a gyakori query-khez
create index if not exists lms_paid_undelivered_idx
  on lead_magnet_submissions (paid_at)
  where paid_at is not null and delivered_at is null;

create index if not exists lms_giveaway_idx
  on lead_magnet_submissions (giveaway_campaign_slug, giveaway_total_score desc nulls last)
  where giveaway_campaign_slug is not null;

create index if not exists lms_redemption_idx
  on lead_magnet_submissions (redemption_eligible_until)
  where redemption_used = false and redemption_eligible_until is not null;

-- 10. Új tábla: audit_9900_questionnaire — 12 kérdéses post-payment kérdőív válaszai
-- Külön tábla, mert a lead_magnet_submissions.payload-on már túl nehéz lenne strukturálni
create table if not exists audit_9900_questionnaires (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references lead_magnet_submissions(id) on delete cascade,
  access_token text not null unique,
  answers jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists audit_9900_questionnaires_token_idx on audit_9900_questionnaires (access_token);
create index if not exists audit_9900_questionnaires_submission_idx on audit_9900_questionnaires (submission_id);

alter table audit_9900_questionnaires enable row level security;
revoke all on audit_9900_questionnaires from anon;
revoke all on audit_9900_questionnaires from authenticated;

drop policy if exists "service_role_full_access" on audit_9900_questionnaires;
create policy "service_role_full_access" on audit_9900_questionnaires
  for all to service_role using (true) with check (true);

-- 11. Új tábla: lm_email_sequence_state — utánkövető email sorozat állapota
-- Egy sor / submission / sequence — az utánkövető cron innen tudja melyik nap-i emailt kell küldeni
create table if not exists lm_email_sequence_state (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references lead_magnet_submissions(id) on delete cascade,
  lead_magnet_slug text not null,
  sequence_step integer not null default 0,
  next_send_at timestamptz,
  last_sent_at timestamptz,
  last_message_id text,
  paused boolean default false,
  created_at timestamptz not null default now()
);

create unique index if not exists lm_email_sequence_submission_idx on lm_email_sequence_state (submission_id);
create index if not exists lm_email_sequence_due_idx on lm_email_sequence_state (next_send_at) where paused = false and next_send_at is not null;

alter table lm_email_sequence_state enable row level security;
revoke all on lm_email_sequence_state from anon;
revoke all on lm_email_sequence_state from authenticated;

drop policy if exists "service_role_full_access" on lm_email_sequence_state;
create policy "service_role_full_access" on lm_email_sequence_state
  for all to service_role using (true) with check (true);

-- Done. Verify:
--   select count(*) from lead_magnet_submissions;
--   select count(*) from audit_9900_questionnaires;
--   select count(*) from lm_email_sequence_state;
