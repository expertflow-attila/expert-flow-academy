-- Wave 4.1 — Lead magnet submissions table for Solo Business funnel
--
-- Stores every lead magnet form submission (LM1 AI-működési térkép, LM2 AI-folyamatvázlat 48h,
-- LM3 Ügyfélút audit kvalifikáció), the AI-generated draft report, Attila's review state,
-- and the delivery state.
--
-- RLS: only service_role can read/write. anon and authenticated are blocked.

create extension if not exists "pgcrypto";

create table if not exists lead_magnet_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_magnet_slug text not null check (lead_magnet_slug in (
    'ai-mukodesi-terkep',
    'ai-folyamatvazlat-48h',
    'ugyfelut-audit'
  )),

  -- Submitter
  name text not null,
  email text not null,
  marketing_consent boolean not null default false,
  share_anonymized boolean not null default true,

  -- Form payload (3 / 6 / 3 question answers)
  payload jsonb not null,

  -- AI-generated draft
  generated_markdown text,
  generated_at timestamptz,
  generation_model text,           -- e.g. 'claude-sonnet-4-6'
  generation_cost_huf numeric(10, 4),

  -- Attila review gate (LM1 + LM2 only; LM3 has no review — qualification only)
  attila_review_status text not null default 'pending'
    check (attila_review_status in ('pending', 'approved', 'rejected', 'auto-released', 'edited', 'not-applicable')),
  attila_reviewed_at timestamptz,
  attila_edits text,               -- if status='edited', the final markdown
  attila_review_note text,         -- internal note

  -- Hermes review gate communication
  hermes_message_id text,          -- Telegram message id (so Hermes can update the message)
  hermes_chat_id text,             -- which chat
  hermes_sent_at timestamptz,

  -- Delivery
  delivered_at timestamptz,
  delivery_provider text,          -- 'brevo' | 'resend' | 'mailerlite' | 'manual'
  delivery_message_id text,        -- provider's message id (for tracking)
  delivery_error text,             -- if delivery failed

  -- LM3 qualification result (only for ugyfelut-audit)
  qualification_result text check (qualification_result in (
    'qualified',       -- redirected to Cal.com
    'too-early',       -- recommended newsletter signup instead
    'no-fit'           -- politely declined
  )),
  cal_booking_id text,             -- once they book, Cal.com webhook fills this

  -- Tracking / fraud-protection
  client_ip text,
  user_agent text,

  created_at timestamptz not null default now()
);

create index if not exists lms_slug_created_idx
  on lead_magnet_submissions (lead_magnet_slug, created_at desc);

create index if not exists lms_email_idx
  on lead_magnet_submissions (email);

create index if not exists lms_review_pending_idx
  on lead_magnet_submissions (attila_review_status, created_at desc)
  where attila_review_status = 'pending';

create index if not exists lms_undelivered_idx
  on lead_magnet_submissions (created_at desc)
  where delivered_at is null and attila_review_status in ('approved', 'auto-released', 'edited');

-- Enable RLS
alter table lead_magnet_submissions enable row level security;

-- Block anon and authenticated entirely
revoke all on lead_magnet_submissions from anon;
revoke all on lead_magnet_submissions from authenticated;

-- Only service_role can do anything
drop policy if exists "service_role_full_access" on lead_magnet_submissions;
create policy "service_role_full_access" on lead_magnet_submissions
  for all
  to service_role
  using (true)
  with check (true);

-- Comment for future humans
comment on table lead_magnet_submissions is
  'Solo Business lead magnet form submissions, AI-generated reports, Attila review state, delivery state. service_role only.';

comment on column lead_magnet_submissions.attila_review_status is
  'pending|approved|rejected|auto-released|edited|not-applicable. LM1+LM2 require approval before delivery. LM3 (ugyfelut-audit) sets not-applicable since it is qualification-only.';

comment on column lead_magnet_submissions.qualification_result is
  'LM3 only. qualified|too-early|no-fit. If qualified, the form redirects to Cal.com.';
