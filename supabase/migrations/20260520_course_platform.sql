-- Expert Flow Akadémia — kurzusplatform séma
-- Mintaforrás: Visualize Value "Course Platform Without LMS"
-- RLS: csak service_role olvas/ír. Az anon/authenticated BLOKKOLVA.

-- ─── Auth.js adapter tablespace (next-auth/supabase-adapter) ──────────
-- Az adapter a `next_auth` schemát használja. A migrációt a hivatalos
-- adapter doc alapján kell futtatni:
-- https://authjs.dev/getting-started/adapters/supabase

create schema if not exists next_auth;
grant usage on schema next_auth to service_role;
grant all on schema next_auth to postgres, service_role;

create table if not exists next_auth.users (
  id uuid not null default gen_random_uuid() primary key,
  name text,
  email text,
  "emailVerified" timestamptz,
  image text
);
create unique index if not exists users_email_idx on next_auth.users (email);

create table if not exists next_auth.sessions (
  id uuid not null default gen_random_uuid() primary key,
  expires timestamptz not null,
  "sessionToken" text not null,
  "userId" uuid references next_auth.users(id) on delete cascade
);
create unique index if not exists sessions_token_idx on next_auth.sessions ("sessionToken");

create table if not exists next_auth.accounts (
  id uuid not null default gen_random_uuid() primary key,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  oauth_token_secret text,
  oauth_token text,
  "userId" uuid references next_auth.users(id) on delete cascade
);
create unique index if not exists accounts_provider_idx
  on next_auth.accounts (provider, "providerAccountId");

create table if not exists next_auth.verification_tokens (
  identifier text,
  token text primary key,
  expires timestamptz not null
);

-- ─── Public domain tables ─────────────────────────────────────────────
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  cover_image_url text,
  stripe_price_id text,
  price_huf integer,
  published boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  position integer not null,
  title text not null,
  description text
);
create index if not exists course_modules_course_idx
  on public.course_modules (course_id, position);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.course_modules(id) on delete cascade,
  position integer not null,
  title text not null,
  body_html text,
  cloudflare_stream_uid text,
  duration_seconds integer,
  is_preview boolean default false
);
create index if not exists course_lessons_module_idx
  on public.course_lessons (module_id, position);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  course_id uuid references public.courses(id) on delete cascade,
  stripe_session_id text,
  granted_at timestamptz default now(),
  unique(user_id, course_id)
);
create index if not exists memberships_user_idx
  on public.memberships (user_id);

create table if not exists public.lesson_progress (
  user_id uuid not null,
  lesson_id uuid references public.course_lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  primary key (user_id, lesson_id)
);

-- Stripe webhook idempotencia tábla
create table if not exists public.stripe_events (
  event_id text primary key,
  type text not null,
  received_at timestamptz default now()
);

-- Login throttling (IP + email kombináció)
create table if not exists public.login_attempts (
  key text primary key,           -- pl. "ip:1.2.3.4" vagy "email:foo@bar.hu"
  count integer not null default 1,
  window_started_at timestamptz default now(),
  last_at timestamptz default now()
);
create index if not exists login_attempts_window_idx
  on public.login_attempts (window_started_at);

-- ─── RLS — service_role only (a Next.js server-component verifikálja) ─
alter table public.courses        enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.memberships    enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.stripe_events  enable row level security;
alter table public.login_attempts enable row level security;

-- Egyetlen policy minden táblára: csak service_role
-- (anon/authenticated blokkolva — a front a server-component API-n keresztül megy)
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'courses',
      'course_modules',
      'course_lessons',
      'memberships',
      'lesson_progress',
      'stripe_events',
      'login_attempts'
    ])
  loop
    execute format(
      'drop policy if exists "service_role_all" on public.%I;', t
    );
    execute format(
      'create policy "service_role_all" on public.%I
         for all to service_role using (true) with check (true);', t
    );
  end loop;
end$$;
