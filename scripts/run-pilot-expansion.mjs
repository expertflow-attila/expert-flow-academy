// Expert Flow Akadémia — pilot kurzus bővítése Node-ból.
// Futtatás: node scripts/run-pilot-expansion.mjs
// Az .env.local-ból olvassa a SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY-t.
// Idempotens: minden insert előtt ellenőrzi hogy létezik-e.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local kézi betöltés
const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      const k = l.slice(0, idx);
      let v = l.slice(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      return [k, v];
    })
);

const SUPA_URL = env.SUPABASE_URL?.replace(/\/+$/, '');
const SUPA_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPA_URL || !SUPA_KEY) {
  console.error('Hiányzik SUPABASE_URL vagy SUPABASE_SERVICE_ROLE_KEY a .env.local-ból');
  process.exit(1);
}

const HEADERS = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
};

async function sbSelect(table, query) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${query}`, { headers: HEADERS });
  if (!r.ok) throw new Error(`SELECT ${table} ${r.status}: ${await r.text()}`);
  return r.json();
}
async function sbInsert(table, row) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...HEADERS, Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`INSERT ${table} ${r.status}: ${await r.text()}`);
  return r.json();
}
async function sbUpdate(table, query, patch) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: { ...HEADERS, Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`UPDATE ${table} ${r.status}: ${await r.text()}`);
  return r.json();
}

// ─── Adatok ─────────────────────────────────────────────────────────
const COURSE_SLUG = 'build-in-public-30nap';

const NEW_MODULES = [
  { position: 6, title: 'Az AI agent stack', description: 'A Hermes 7 ügynök architektúra — Anna mint Telegram-orchestrator, 6 sub-agent emoji-prefixszel. Mit építettem 30 nap alatt, hogy ne kelljen mindent magamnak csinálni.' },
  { position: 7, title: 'Hogyan készült az Akadémia', description: 'Meta-modul: maga ez a kurzusplatform LMS nélkül, Next.js 16 + Auth.js + Supabase + Cloudflare Stream alapon, Visualize Value "Course Platform Without LMS" mintára.' },
  { position: 8, title: 'Tartalom-gyár', description: 'Mit tanultam meg a YouTube cut pipeline-ról: OBS, FFmpeg, Whisper, Kallaway-addiktív story, dopamine ladder long-form. Mit használnék újra, mit dobnék el.' },
];

// modulonkénti lecke-térkép: { modulePosition: [{position, title, body_html, is_preview}, ...] }
const NEW_LESSONS = {
  1: [
    { position: 3, title: 'A Expert Flow value ladder', body_html: `<p>Négy szint, egymásra építve. Nem terv, hanem ami valóban kialakult az első 30 napban:</p>
<ol>
<li><strong>Ingyenes tartalom</strong> — YouTube videók + 41 leveles edu email sorozat. Itt minden hozzáférhető, nincs gating.</li>
<li><strong>Közösség</strong> — Skool free plan, ahova az emailes nurturolás futtat. Itt valódi beszélgetés, nem csak "iratkozz fel".</li>
<li><strong>49k Ft pilot</strong> — ez a kurzus, build-in-public dokumentáció, 30 nap rendszerszintű naplója.</li>
<li><strong>120 / 220 / 450k Ft retainer</strong> — Expert Flow AI Operations csomagok, már ügyfélkapcsolatra.</li>
</ol>
<p>A kulcs: a fizetős termék NEM a tartalom — a tartalom ingyen van. A fizetős termék a <em>rendszer</em>, a <em>folyamat</em> és a <em>személyes elérhetőség</em>.</p>`, is_preview: false },
    { position: 4, title: 'Hormozi × Kallaway — a két keret kombinációja', body_html: `<p>Nem találtam ki semmit. Két meglévő keretet kombinálok:</p>
<ul>
<li><strong>Kane Kallaway — addiktív storytelling</strong>. A 4-lépéses loop: stakes → big question → head fake → rehook. Ez adja a videók <em>struktúráját</em>.</li>
<li><strong>Alex Hormozi — Grand Slam Offer + vizuális dinamika</strong>. Gyors jump cut, beégetett feliratok, value-egyenlet. Ez adja a <em>felszínt</em> és az <em>ajánlatot</em>.</li>
</ul>
<p>Mindkettő működik külön is, de együtt erősebb: a Kallaway-loop megtart, a Hormozi-vágás eladja. A két keret közös pontja, hogy <strong>egyik sem rejtett tudás</strong> — bárki letöltheti, leírja és alkalmazza. A különbség a végrehajtásban van.</p>`, is_preview: false },
    { position: 5, title: 'Miért rebrandeltem Expert Flow-ról Expert Flow-re', body_html: `<p>2026-05-16-án váltottam brandet. Konkrét okok:</p>
<ul>
<li>Az "Expert Flow" túl B2B-s volt — cleantech ügynökség-hangzású. A publikus tartalmamat szóló vállalkozóknak csinálom, akik a saját üzletüket építik.</li>
<li>A "Expert Flow" pontosan ezt mondja ki: egy ember + AI rendszer + fizetős szolgáltatás.</li>
<li>A design rendszer (dark, Instrument Serif italic, oklch színek, rose/violet/sky) változatlan maradt — csak a név változott.</li>
</ul>
<p>Az <code>expertflow.hu</code> NEM tűnt el — az maradt háttér B2B outbound brandnek a cleantech ICP-hez. A <code>expertflow.hu</code> a publikus B2C felület. Kettős stratégia, de egyetlen tartalom-műhely.</p>`, is_preview: false },
  ],
  2: [
    { position: 4, title: 'Landing oldal AIDA — Amy Porterfield 5 szekció', body_html: `<p>A landing oldalakat egy fix szerkezet alapján írom, nem ad hoc:</p>
<ol>
<li><strong>Attention</strong> — Hero. Egy mondat amitől megáll a görgetés.</li>
<li><strong>Interest</strong> — A probléma kibontva, a célközönség nyelvén.</li>
<li><strong>Desire</strong> — Mi a megoldás, és miért az enyém más mint a többi.</li>
<li><strong>Action</strong> — Az ajánlat, ár, garancia.</li>
<li><strong>Bizonyíték</strong> — Esettanulmány, számok, screenshot. Build-in-public fázisban ez a 30 nap valós dokumentációja.</li>
</ol>
<p>Amy Porterfield 5-szekciós keretét párosítom a Hormozi value-egyenlettel: az ajánlatban mindig benne van mi az álom-kimenet, mennyi a kockázat csökkentés, az időkeret és az erőfeszítés szintje.</p>`, is_preview: false },
    { position: 5, title: '41 leveles edu email sorozat', body_html: `<p>A Expert Flow newsletter szerkezete:</p>
<ul>
<li><strong>1 welcome levél</strong> — bemutatkozás, várakozás kezelése.</li>
<li><strong>40 oktató levél</strong> — heti 2-3 darab, mind a Expert Flow útvonal egy-egy szeletéről.</li>
</ul>
<p>A MailerLite group ID <code>188014583560013564</code> alatt fut, double opt-in subscribe endpoint él a <code>solo-business-newsletter.vercel.app</code>-en. Mind a 41 kampány DRAFT-ként előre megírva, az automation workflow MailerLite UI-on lett összerakva (API nem támogatja a workflow-create-et).</p>
<p>Miért 40 + 1: a Justin Welsh-féle "Saturday Solopreneur" minta szerint a heti edu levél bizalmat épít fizetős termék felé, nem közvetlen eladásra megy. A levelek 90%-a tartalom, 10%-a CTA.</p>`, is_preview: false },
    { position: 6, title: 'Cal.com konzultáció workflow', body_html: `<p>A landing oldalon ingyenes 30 perces konzultációt ajánlok. A workflow:</p>
<ol>
<li>Cal.com-on időpontfoglalás, automata Google Meet link.</li>
<li>Webhook (HMAC ellenőrzéssel, <code>X-Cal-Signature-256</code>) a Expert Flow backendnek.</li>
<li>A webhook elindítja a recepciós voice agent ágat: Annának értesítés Telegramon, hogy új meeting van.</li>
<li>A meeting után automatikus followup email — még aznap, nem 3 nap múlva.</li>
</ol>
<p>A konzultációs script egy A/B kérdéssor: az első 10 percben felmérem a helyzetet, a 10-25. percben javaslok 1-3 utat, az utolsó 5 percben tisztázzuk a következő lépést. Soha nem zárok ott a meetingen — mindig "küldök egy email-összefoglalót" zárás.</p>`, is_preview: false },
    { position: 7, title: 'Typeform szűrő — lead minősítés', body_html: `<p>A Cal.com konzultáció elé Typeform szűrő van kötve. Ez nem fal — szűrő.</p>
<p>A kérdések:</p>
<ul>
<li>Mit csinálsz most? (egysoros válasz)</li>
<li>Mi a fő blokkold? (3 opció + szabad szöveg)</li>
<li>Mekkora a havi marketing/automatizációs költségvetésed? (három sáv)</li>
<li>Mikor szeretnél kezdeni? (most / 1-3 hónap / csak nézelődöm)</li>
</ul>
<p>A webhook ellenőrzött HMAC-szel (<code>Typeform-Signature</code> header) a backenden landolnak. Ha "csak nézelődöm" + nincs költségvetés, akkor automatikus köszönő-email + edu sorozatba terelés. Ha komoly + van költségvetés, akkor a Cal.com link megy ki. Ezzel a konzultációs idő 60-70%-át megspóroltam.</p>`, is_preview: false },
  ],
  3: [
    { position: 3, title: 'Stripe Payment Link + KATA számlázás', body_html: `<p>A fizetés Stripe Payment Linkkel megy, nem saját Checkout integrációval. Miért:</p>
<ul>
<li>0 fejlesztési idő — 5 perc alatt kész link.</li>
<li>Magyar bankkártya elfogadás, SEPA, Apple Pay.</li>
<li>Webhook a backendnek — vásárlás után automatikus Kit V4 sequence enroll + Supabase membership létrehozás.</li>
</ul>
<p>KATA-s vállalkozóként az áfa-mentesség külön elszámolást igényel: a Stripe pénznem HUF, áfa 0% beállítva, a havi 18M Ft KATA-határ alatt vagyunk a pilot fázisban. A számlát Számlázz.hu-val állítom ki manuálisan, amíg automatizálni nem éri meg.</p>
<p>Tévedés: <strong>nem kell saját Checkout flow</strong> az induláshoz. A Payment Link teljes értékű, és átállni rá később 1 nap meló.</p>`, is_preview: false },
    { position: 4, title: '120 / 220 / 450 / 599k Ft retainer csomagok', body_html: `<p>A pilot kurzus utáni upsell a Expert Flow AI Operations retainer. Négy szintes:</p>
<ul>
<li><strong>49k Ft pilot</strong> — első közös sprint, 2 hét, egy konkrét workflow automatizálása.</li>
<li><strong>199k Ft / hó</strong> — 1 AI rendszer karbantartása, havi 1 review meeting.</li>
<li><strong>359k Ft / hó</strong> — 2-3 rendszer, kétheti review, prioritás email-támogatás.</li>
<li><strong>599k Ft / hó</strong> — teljes AI ops, heti meeting, ad hoc support.</li>
</ul>
<p>A Stripe Payment Linkek mind a négy szintre élnek. A 49k pilot belépő ajtó — a célközönség 80%-a itt marad, 20% lép feljebb az első 60 napban. Ez a build-in-public fázis valós konverziós aránya, nem optimalizált projekció.</p>`, is_preview: false },
    { position: 5, title: 'Followup és retention', body_html: `<p>Az első 90 nap kritikus. Mit csinálok pénteken minden ügyféllel:</p>
<ol>
<li>Heti review email — mi készült, mi a következő, mi a blokkoló. Maximum 6 mondat.</li>
<li>Havi 30 perces meeting — nem státusz-meeting, hanem stratégia. Mi nem stimmel, mit változtatnánk.</li>
<li>Negyedéves árajánlat-felülvizsgálat — nem áremelés, hanem átláthatóság.</li>
</ol>
<p>Amit NEM csinálok: nem küldök hosszú riportokat, nem dashboardot, nem Notion-oldalt. Mindenki túlságosan elfoglalt az ilyenekhez. A heti email + havi meeting elég.</p>
<p>Retention KPI: a 90. napi megmaradási arány. Build-in-public fázisban ez az egyetlen szám amit havonta kiteszek a YouTube-ra.</p>`, is_preview: false },
  ],
  4: [
    { position: 3, title: 'LLM Wiki mint AI agent memória', body_html: `<p>Karpathy-stílusú Obsidian vault, amiben minden tudás <em>linkelt</em> és <em>indexelt</em>:</p>
<ul>
<li><code>concepts/</code> — módszertanok (build-in-public, Hormozi, Kallaway, value ladder).</li>
<li><code>workflows/</code> — végrehajtható folyamatok lépésről lépésre.</li>
<li><code>skills/</code> — 70+ Claude Code skill katalogizálva.</li>
<li><code>funnel/</code> — a 11 lépéses ügyfél-funnel mindegyik szakasza külön oldal.</li>
</ul>
<p>Miért fontos: amikor új AI session indul, a wiki-t használom memóriaként. Az ügynök átolvassa az <code>overview.md</code>-t és az adott témához tartozó oldalt, és <em>azonnal</em> kontextusban van — nem kell elmondanom mit csinálok. Ez heti 10-15 órát spórol.</p>
<p>A wiki most 239+ oldal. Naponta 1-3-mal nő. Minden új tudás bekerülésekor a wiki-t is frissítjük, nem csak a kódot.</p>`, is_preview: false },
    { position: 4, title: 'Multi-model routing — mikor Claude / GPT / Gemini', body_html: `<p>Nem egy modellt használok mindenre. Routing szabályok:</p>
<ul>
<li><strong>Claude (Opus / Sonnet)</strong> — fő munka: kódolás, hosszú elemzés, magyar nyelvi pass, agent orchestráció.</li>
<li><strong>GPT-5 (Codex provider OAuth-szal)</strong> — alternatív kódoló véleményezés, rescue szerep, ha Claude elakad.</li>
<li><strong>Gemini Flash / Pro</strong> — vision feladatok, web crawl alapú elemzés (lead analysis skill), audio Live.</li>
</ul>
<p>A routing nem a "melyik a legjobb" alapján megy, hanem költség + sebesség + képesség kombinációja alapján. A Hermes ügynökök gpt-5.3-codex modellt használnak ChatGPT-előfizetésen, ami 0 API-költséget jelent. Ez tudatos választás, nem utólagos megtakarítás.</p>`, is_preview: false },
  ],
  6: [
    { position: 1, title: 'Hermes 7 ügynök — Anna mint Telegram-orchestrator', body_html: `<p>Egy orchestrator + 6 sub-agent. Én CSAK Annával beszélek, ő delegál.</p>
<ul>
<li><strong>Anna</strong> (@hermes_flowbot) — Telegram-orchestrator, a többi ügynököt invoke-olja.</li>
<li>🛡️ <strong>Security</strong> — kódbázis biztonsági review.</li>
<li>📋 <strong>Personal</strong> — naptár, jegyzetek, Drive.</li>
<li>👋 <strong>Client</strong> — ügyfélkommunikáció, Cal.com, email.</li>
<li>📺 <strong>YouTube</strong> — videó pipeline, transcript, cím-leírás generálás.</li>
<li>📞 <strong>Reception</strong> — voice agent backend, beérkező hívások.</li>
<li>🌱 <strong>Sustainability</strong> — fenntarthatóság-pillér, cleantech kutatás.</li>
</ul>
<p>Mindegyik sub-agent saját rendszerével, de a válasz emoji-prefixszel megy vissza Annán keresztül. A felhasználó (én) csak egy chatablakot lát, mintha egy emberrel beszélne.</p>`, is_preview: false },
    { position: 2, title: 'Shared OAuth — egy Google fiók, 6 ügynök', body_html: `<p>Az <code>expertflow-gmail</code> GCP projekt egy közös OAuth credentials-ja az összes Hermes ügynöknek. 8 scope élesben:</p>
<ul>
<li>Gmail readonly + send</li>
<li>Drive readonly + create</li>
<li>Calendar readonly + create</li>
<li>Docs + Sheets readonly</li>
<li>Contacts readonly</li>
</ul>
<p>A token <code>/root/.hermes/google_token.json</code>-ban él, a sub-agentekhez symlink. Egyetlen consent flow, minden ügynök használhatja. Kritikus tanulság: <strong>NEM kell minden ügynöknek saját OAuth flow</strong> — egy közös elég, sőt biztonságosabb (egy helyen lehet visszavonni).</p>`, is_preview: false },
    { position: 3, title: 'Codex provider OAuth-szal — 0 OpenAI API-költség', body_html: `<p>2026-05-20-tól a Hermes ügynökök Codex CLI-n keresztül használják a GPT modellt, nem direkt API hívással. Mit jelent:</p>
<ul>
<li><code>provider: openai-codex</code> a Hermes konfigban.</li>
<li><code>gpt-5.3-codex</code> modell, ChatGPT-előfizetésen keresztül OAuth-szal authentikálva.</li>
<li><strong>0 OpenAI API-költség</strong> — minden a ChatGPT Plus / Pro fiókba van számolva.</li>
</ul>
<p>Re-auth: <code>hermes auth add openai-codex --no-browser</code>. Korábbi iterációk: OpenRouter (kivezetve), OpenAI API direkt (kivezetve). A Codex-provider stabil 2026-05-23 óta.</p>
<p>Tévedés amibe beleestem: <strong>nem "openai" provider neve, hanem "openai-codex"</strong>. A custom-providerrel próbálkozni 3 napot vesztett.</p>`, is_preview: false },
    { position: 4, title: 'Sub-agent design pattern', body_html: `<p>Mikor kell sub-agent és mikor nem? Szabály:</p>
<ul>
<li><strong>Saját kontextus kell</strong> — a sub-agent nem látja az orchestrator beszélgetését, csak amit átadsz.</li>
<li><strong>Független végrehajtás</strong> — párhuzamosan tud futni más sub-agentekkel.</li>
<li><strong>Specializált tool-készlet</strong> — pl. csak Bash + Read, vagy csak WebSearch.</li>
</ul>
<p>Mikor NEM kell:</p>
<ul>
<li>Ha gyors keresés vagy fájl-olvasás kell — azt a fő ügynök tegye meg.</li>
<li>Ha a feladat 1-3 toolcall — overhead nagyobb mint a haszon.</li>
</ul>
<p>A Hermes 6 sub-agent mindegyike saját rendszer-promptot kapott, saját scope-pal és saját MCP server-csatlakozással. Ez a "team-of-experts" minta, ami működik — egyetlen mindentudó ügynök nem.</p>`, is_preview: false },
  ],
  7: [
    { position: 1, title: 'Visualize Value "Course Platform Without LMS" minta', body_html: `<p>Nem Teachable, nem Kajabi, nem Skool premium. Visualize Value workflow alapján saját platform:</p>
<ul>
<li>Next.js 16 + Tailwind v4</li>
<li>Supabase (auth + DB)</li>
<li>Stripe Checkout (one-time fizetés per kurzus)</li>
<li>Cloudflare Stream (signed JWT HLS videó)</li>
<li>Vercel deploy (Hobby plan)</li>
</ul>
<p><strong>Költség ~$5/hó</strong> a Teachable $99/hó + 5% tranzakció helyett. Plusz: minden komponens cserélhető, nincs vendor lock-in, a design 100%-ig saját.</p>
<p>Trade-off: nincs előre kész LMS-funkció (kvízek, certifikátok, drip kurzus). Build-in-public fázisban ez nem kell — egyszerűbb lecke + videó + progress, és kész. Később elég nehéz lesz hozzáadni? Lehet — de először lássuk hányan veszik meg.</p>`, is_preview: false },
    { position: 2, title: 'Next.js 16 + Auth.js v5 magic link + Supabase', body_html: `<p>Az auth stack:</p>
<ul>
<li><strong>Auth.js v5 (NextAuth)</strong> + <code>@auth/supabase-adapter</code></li>
<li><strong>Passwordless magic link</strong> — nincs jelszó, csak email + 1-kattintásos link.</li>
<li><strong>Supabase Postgres</strong> — <code>next_auth</code> séma + <code>public</code> (courses, modules, lessons, memberships, progress).</li>
</ul>
<p>Miért magic link: a célközönség (szóló vállalkozók) nem akar újabb jelszót. A magic link konverziós arány 80%+ az első próbálkozásra, jelszóval 45-55%. Mérve, nem becsülve.</p>
<p>Az Auth.js v5 Supabase-adapter dokumentációja kötelező olvasmány — a <code>next_auth</code> séma migrációs SQL-jét pontosan onnan vettem. Beágyazott migration fájl: <code>supabase/migrations/20260520_course_platform.sql</code>.</p>`, is_preview: false },
    { position: 3, title: 'Cloudflare Stream signed JWT — fizetős videó-hozzáférés', body_html: `<p>A videók NEM publikus URL-eken vannak. A fizetős <code>/learn/[course]/[position]</code> oldal kér egy aláírt JWT-t a <code>/api/video/sign</code> endpointól, ami csak akkor adja vissza, ha a felhasználónak van membership-je az adott kurzushoz.</p>
<p>A JWT tartalmazza:</p>
<ul>
<li>Cloudflare Stream video ID</li>
<li>Lejárati idő (1 óra)</li>
<li>Felhasználó ID (audit log)</li>
</ul>
<p>A lejárati idő miatt link-megosztás 1 órás ablakra korlátozott — utána újra kell kérni. Build-in-public fázisban ez bőven elég pirat-védelemnek.</p>
<p>Cloudflare Stream díja: $1 / 1000 percnyi tárolás + $1 / 1000 percnyi delivery. ~1000 perc tartalommal és 100 nézővel ~$3/hó.</p>`, is_preview: false },
    { position: 4, title: 'Resend + Kit V4 — branded magic link + sequence enroll', body_html: `<p>Két külön email rendszer, két célra:</p>
<ul>
<li><strong>Resend</strong> (vagy Brevo / Postmark) — tranzakciós, magic link küldés. Branded HTML, Expert Flow design, Instrument Serif italic.</li>
<li><strong>Kit V4 (ConvertKit)</strong> — marketing automation. Vásárlás után automatikus sequence enroll: 7+1 napos Justin Welsh-stílusú onboarding.</li>
</ul>
<p>A Stripe webhook (<code>checkout.session.completed</code>) elindítja mind a kettőt:</p>
<ol>
<li>Membership létrehozása Supabase-ben.</li>
<li>Welcome email Resend-en keresztül a magic link első küldéséhez.</li>
<li>Kit V4 API hívás: tag hozzáadás + sequence indítás.</li>
</ol>
<p>Tévedés: <strong>NEM kell a transactional és a marketing email egy rendszerben</strong>. Két specializált eszköz erősebb mint egy "all-in-one".</p>`, is_preview: false },
  ],
  8: [
    { position: 1, title: 'OBS raw → FFmpeg CRF 17 → Whisper transcript', body_html: `<p>A YouTube videók pipeline-ja:</p>
<ol>
<li><strong>OBS Studio</strong> 1080p felvétel, CRF 17, NO Source Record (encoder túlterhelést okoz). Egyszerre csak főfelvétel.</li>
<li><strong>FFmpeg</strong> async 1, NO <code>-c copy</code> — a vágáshoz keyframe-re kell igazítani, copy-val csúszás lesz.</li>
<li><strong>Whisper transcript</strong> — magyar nyelv, large-v3 modell, <code>whisper_merged.json</code> kimenettel.</li>
<li><strong>Töltelékszó-detektálás</strong> — szóköz-elemzés (umm, izé, hát szóval) Python scriptből.</li>
<li><strong>Webes review UI</strong> — vágáspontok jóváhagyása mielőtt FFmpeg ténylegesen vág.</li>
</ol>
<p>Tanulság a 04-27-i tönkrement live után: <strong>OBS soha ne fusson Source Record live alatt</strong>. Encoder-túlterhelés tönkretette a teljes 90 perces felvételt.</p>`, is_preview: false },
    { position: 2, title: 'Kallaway 4-lépéses addiktív loop', body_html: `<p>Kane Kallaway "Addictive Storytelling" módszertan, 4 lépés:</p>
<ol>
<li><strong>Stakes</strong> — mi forog kockán? Konkrét, érzelmi.</li>
<li><strong>Big Question</strong> — egy kérdés ami nem ad nyugtot.</li>
<li><strong>Head Fake</strong> — látszólag elcsúszunk, valójában a kérdés mélyebbre vág.</li>
<li><strong>Rehook</strong> — új kérdés, új ciklus indul.</li>
</ol>
<p>Egy 15 perces videóban 3-4 ilyen loop van, egymásra rakva. A néző nem tudja mikor lett vége a videónak, mert minden rehook új ígéretet ad.</p>
<p>10 formátum amibe ezt becsomagoljuk: build-in-public napló, esettanulmány, módszertani breakdown, közvélemény-szembesítés, hibanapló, eszközösszehasonlítás, stb. A <code>kallaway-addictive-storytelling</code> skill mind a 10-et tudja generálni egy téma + 3 mondat input alapján.</p>`, is_preview: false },
    { position: 3, title: 'Dopamine Ladder long-form', body_html: `<p>Kallaway második keret: 6 szintes "dopamine ladder" a 15-30 perces long-form videókhoz. A nézőt pavlovi reflex szintjén tartja végig:</p>
<ol>
<li><strong>Stimulation</strong> — gyors vágás, vizuális inger.</li>
<li><strong>Captivation</strong> — egy érdekes elem ami megtartja a figyelmet.</li>
<li><strong>Anticipation</strong> — előrejelzés, mi jön.</li>
<li><strong>Validation</strong> — az ígéret beváltása, "ahogy mondtam".</li>
<li><strong>Affection</strong> — érzelmi pillanat, emberi sebezhetőség.</li>
<li><strong>Revelation</strong> — váratlan tanulság, ami másnap is megmarad.</li>
</ol>
<p>A 6 szint egymásba is fűzhető — egy 25 perces videóban 2-3 teljes ciklus, vagy egy nagy ív 6 szakasszal.</p>
<p>A build-in-public videók többségében az 1-2-3 szint adja a struktúrát, a 4-5-6 a tanulság-szakaszt. A skill <code>kallaway-dopamine-ladder</code> ezt egy script-vázzá fordítja le.</p>`, is_preview: false },
  ],
};

const COURSE_DESCRIPTION_NEW = '<p>Ez egy <strong>build-in-public</strong> útikönyv. Nem ígérek titkos formulát — végigviszem mit csináltam az első 30 napban, miközben elindítottam a Expert Flow márkát: 0 fizetős ügyféltől az első retainerig.</p><p>8 modul, 34 lecke. A modul 1-5 a marketing és kiszolgálás folyamatát járja végig, a modul 6-8 a háttér-rendszereket: AI agent stack, hogyan készült ez a platform, és a YouTube cut pipeline.</p><p>Ha hasonló úton indulnál — szolgáltató vállalkozóként szeretnéd láthatóvá és értékesíthetővé tenni a tudásod —, itt nem teóriát kapsz, hanem rendszert, naplót és a valódi döntéseket.</p>';

// ─── Futtatás ────────────────────────────────────────────────────────
async function run() {
  console.log(`Kurzus keresése: ${COURSE_SLUG}`);
  const courses = await sbSelect('courses', `slug=eq.${COURSE_SLUG}&select=id`);
  if (!courses.length) {
    console.error('pilot.sql még nem futott le, vagy a kurzus nem található.');
    process.exit(1);
  }
  const courseId = courses[0].id;
  console.log(`  Kurzus ID: ${courseId}`);

  // Új modulok
  let createdModules = 0;
  for (const m of NEW_MODULES) {
    const existing = await sbSelect('course_modules', `course_id=eq.${courseId}&position=eq.${m.position}&select=id`);
    if (existing.length) { console.log(`  Modul ${m.position} már létezik — kihagyom`); continue; }
    await sbInsert('course_modules', {
      course_id: courseId, position: m.position, title: m.title, description: m.description,
    });
    console.log(`  + Modul ${m.position} létrehozva: ${m.title}`);
    createdModules++;
  }

  // Új leckék modulonként
  let createdLessons = 0;
  for (const [modPosStr, lessons] of Object.entries(NEW_LESSONS)) {
    const modPos = Number(modPosStr);
    const mods = await sbSelect('course_modules', `course_id=eq.${courseId}&position=eq.${modPos}&select=id`);
    if (!mods.length) { console.warn(`Modul ${modPos} nem található — kihagyom`); continue; }
    const modId = mods[0].id;

    for (const l of lessons) {
      const existing = await sbSelect('course_lessons', `module_id=eq.${modId}&position=eq.${l.position}&select=id`);
      if (existing.length) { console.log(`    Lecke ${modPos}.${l.position} már létezik — kihagyom`); continue; }
      await sbInsert('course_lessons', {
        module_id: modId, position: l.position, title: l.title, body_html: l.body_html, is_preview: l.is_preview,
      });
      console.log(`    + Lecke ${modPos}.${l.position} létrehozva: ${l.title}`);
      createdLessons++;
    }
  }

  // Course leírás frissítés
  await sbUpdate('courses', `slug=eq.${COURSE_SLUG}`, { description: COURSE_DESCRIPTION_NEW, published: true });
  console.log('  Course leírás frissítve (8 modul / 34 lecke)');

  console.log(`\nKész. Új modul: ${createdModules}, új lecke: ${createdLessons}.`);
}

run().catch(e => { console.error(e); process.exit(1); });
