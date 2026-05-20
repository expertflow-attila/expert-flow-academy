-- Solo Business Akadémia — pilot kurzus seed
-- Futtatás: psql "$SUPABASE_DB_URL" -f supabase/seed/pilot.sql
-- A stripe_price_id mezőt később frissítsd a Stripe Dashboard értékével.
-- Egyszeri seed — re-run esetén futtasd újra a clean blokkal.

-- ─── Clean (csak ha újra futtatod) ────────────────────────────────────
-- delete from public.course_lessons l using public.course_modules m, public.courses c
--   where l.module_id = m.id and m.course_id = c.id and c.slug = 'build-in-public-30nap';
-- delete from public.course_modules m using public.courses c
--   where m.course_id = c.id and c.slug = 'build-in-public-30nap';
-- delete from public.courses where slug = 'build-in-public-30nap';

-- ─── Course ───────────────────────────────────────────────────────────
insert into public.courses (slug, title, subtitle, description, price_huf, published, stripe_price_id)
values (
  'build-in-public-30nap',
  'Build-in-public 30 nap',
  'Az első 30 nap a saját Solo Business útvonalon — dokumentálva, hibákkal, valós számokkal.',
  '<p>Ez egy <strong>build-in-public</strong> útikönyv. Nem ígérek titkos formulát — végigviszem mit csináltam az első 30 napban, miközben elindítottam a Solo Business márkát: 0 fizetős ügyféltől az első retainerig.</p><p>Ha hasonló úton indulnál — szolgáltató vállalkozóként szeretnéd láthatóvá és értékesíthetővé tenni a tudásod —, itt nem teóriát kapsz, hanem rendszert, naplót és a valódi döntéseket.</p>',
  49000,
  true,
  null
)
on conflict (slug) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  price_huf = excluded.price_huf,
  published = excluded.published;

-- ─── Modules ──────────────────────────────────────────────────────────
do $$
declare
  c_id uuid;
  m_id uuid;
begin
  select id into c_id from public.courses where slug = 'build-in-public-30nap';

  -- Modul 1
  if not exists (select 1 from public.course_modules where course_id = c_id and position = 1) then
    insert into public.course_modules (course_id, position, title, description) values
      (c_id, 1, 'Alaprajz', 'Mit jelent build-in-public, miért hatékonyabb csendes tanulásnál, és hogyan vágsz bele anélkül hogy gurunak adnád ki magad.');
  end if;
  if not exists (select 1 from public.course_modules where course_id = c_id and position = 2) then
    insert into public.course_modules (course_id, position, title, description) values
      (c_id, 2, 'Ügyfélszerzés', 'A 3 csatorna ami működött nálam az első 30 napban — direkt outbound, YouTube, és a saját webfelület. Miért nem n8n vagy coach.');
  end if;
  if not exists (select 1 from public.course_modules where course_id = c_id and position = 3) then
    insert into public.course_modules (course_id, position, title, description) values
      (c_id, 3, 'Kiszolgálás', 'Onboarding sablon, ügyfélkommunikáció, és a 49k Ft pilot mit takar valójában. Hogyan árazz amikor még nincs portfóliód.');
  end if;
  if not exists (select 1 from public.course_modules where course_id = c_id and position = 4) then
    insert into public.course_modules (course_id, position, title, description) values
      (c_id, 4, 'Háttér + AI rendszer', 'Hogyan használd a Claude/GPT-t úgy hogy ne fals AI-mondatok jöjjenek ki belőle. Anti-AI szótár, magyar nyelvi pass, build-in-public hangütés.');
  end if;
  if not exists (select 1 from public.course_modules where course_id = c_id and position = 5) then
    insert into public.course_modules (course_id, position, title, description) values
      (c_id, 5, 'Mit tanultam', 'A 30. nap valós számai. Mit csinálnék másképp. Mit nem érdemes csinálni soha.');
  end if;

  -- ─── Lessons ─────────────────────────────────────────────────────────
  -- Modul 1
  select id into m_id from public.course_modules where course_id = c_id and position = 1;
  if not exists (select 1 from public.course_lessons where module_id = m_id) then
    insert into public.course_lessons (module_id, position, title, body_html, is_preview) values
      (m_id, 1, 'Miért build-in-public', '<p>A guru-mód kontra a dokumentátor-mód. Miért hitelesebb amikor azt mondod "most csináltam először" mint amikor 5 év tapasztalatra hivatkozol amid nincs.</p>', true),
      (m_id, 2, 'A 30 napos keretrendszer', '<p>5 modul, heti egy darab. Nem 47 lépéses workflow. Lego-elv.</p>', false);
  end if;

  -- Modul 2
  select id into m_id from public.course_modules where course_id = c_id and position = 2;
  if not exists (select 1 from public.course_lessons where module_id = m_id) then
    insert into public.course_lessons (module_id, position, title, body_html, is_preview) values
      (m_id, 1, 'Direkt outbound — mit írok', '<p>Az első 10 outbound üzenet ami az első konzultációhoz vezetett. Konkrét sablon + miért működött.</p>', false),
      (m_id, 2, 'YouTube build-in-public', '<p>A csatorna mit dokumentál, mit nem. A hitelesség brief.</p>', false),
      (m_id, 3, 'Webfelület és a 49k pilot', '<p>Miért pont ez az árazás, és hogyan lett belőle a Stripe Payment Link.</p>', false);
  end if;

  -- Modul 3
  select id into m_id from public.course_modules where course_id = c_id and position = 3;
  if not exists (select 1 from public.course_lessons where module_id = m_id) then
    insert into public.course_lessons (module_id, position, title, body_html, is_preview) values
      (m_id, 1, 'Onboarding sablon',  '<p>Mit kérdezz az első héten. Mit ne.</p>', false),
      (m_id, 2, 'Ügyfélkommunikáció', '<p>Heti ritmus, mit küldj el, mit ne.</p>', false);
  end if;

  -- Modul 4
  select id into m_id from public.course_modules where course_id = c_id and position = 4;
  if not exists (select 1 from public.course_lessons where module_id = m_id) then
    insert into public.course_lessons (module_id, position, title, body_html, is_preview) values
      (m_id, 1, 'Anti-AI szótár', '<p>Magyar szavak amiket az AI mindig odacsap és kiadnak: kontroverz, paradigma, szinergikus stb. Cseréld le.</p>', false),
      (m_id, 2, 'Magyar nyelvi pass', '<p>Külön Opus alügynök ami csak a nyelvi minőséget nézi. Miért kell.</p>', false);
  end if;

  -- Modul 5
  select id into m_id from public.course_modules where course_id = c_id and position = 5;
  if not exists (select 1 from public.course_lessons where module_id = m_id) then
    insert into public.course_lessons (module_id, position, title, body_html, is_preview) values
      (m_id, 1, 'A 30. nap számai', '<p>Valós bevétel. Valós időráfordítás. Valós eredmények.</p>', false),
      (m_id, 2, 'Mit csinálnék másképp', '<p>3 dolog amibe időt veszítettem.</p>', false);
  end if;
end$$;
