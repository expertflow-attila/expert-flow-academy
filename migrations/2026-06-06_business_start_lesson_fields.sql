-- Business Start mini-kurzus — lecke-oldal sablon új mezői
--
-- A zárt felület lecke-oldala (app/learn/[course]/[position]/page.tsx) egyszerűsített
-- sablont kap: cím → alcím → videó → rövid összefoglaló → eszköztár (prompt[kötelező] +
-- letölthető[0-2] + transcript). Ehhez a course_lessons táblát bővítjük.
--
-- MIND nullable / default → non-breaking. A meglévő (fizetős) kurzusok leckéi
-- változatlanul működnek; az új mezők NULL/üres értéken maradnak.
--
-- RLS: a course_lessons már service_role-only (20260520_course_platform.sql),
-- új oszlopokra nem kell külön policy.

alter table public.course_lessons
  add column if not exists subtitle text,                       -- alcím: 1-2 mondat, miről szól
  add column if not exists summary_points jsonb default '[]'::jsonb,  -- ["pont 1", "pont 2", ...] rövid összefoglaló
  add column if not exists prompt_intro text,                   -- a prompt rövid leírása
  add column if not exists prompt_text text,                    -- a másolható prompt (AI-nak odaadható)
  add column if not exists downloads jsonb default '[]'::jsonb, -- [{ "label": "...", "url": "..." }] max 0-2
  add column if not exists transcript text;                     -- opcionális: a videó leirata (később)
