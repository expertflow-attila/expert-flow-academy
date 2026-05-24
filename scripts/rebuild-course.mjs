// Expert Flow Akadémia — kurzus újraépítése (v2)
// Az alapokra építve (Business Start kurzus 12 modulja), az AI mindenbe beleszőve,
// a végcél az AI Operations System.
//
// Futtatás:           node scripts/rebuild-course.mjs
// Dry-run (próba):    node scripts/rebuild-course.mjs --dry-run
//
// Idempotens: minden futtatás előtt törli a meglévő modulokat (cascade-del a leckéket is)
// és nullról építi újra. A `courses` rekord marad (slug + ID).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DRY = process.argv.includes('--dry-run');

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv(file) {
  const txt = readFileSync(resolve(__dirname, '..', file), 'utf-8');
  return Object.fromEntries(txt.split('\n').filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => {
    const i = l.indexOf('=');
    const k = l.slice(0, i);
    let v = l.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    return [k, v];
  }));
}

const env = loadEnv('.env.local');
const SUPA_URL = (env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPA_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPA_URL || !SUPA_KEY) {
  console.error('Hiányzik SUPABASE_URL vagy SUPABASE_SERVICE_ROLE_KEY az .env.local-ból.');
  process.exit(1);
}
if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(SUPA_URL)) {
  console.error(`SUPABASE_URL formátum gyanús: "${SUPA_URL}"`);
  process.exit(1);
}

const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' };

async function get(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: H });
  if (!r.ok) throw new Error(`GET ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}
async function del(path) {
  if (DRY) { console.log(`  [DRY] DELETE ${path}`); return; }
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method: 'DELETE', headers: H });
  if (!r.ok) throw new Error(`DELETE ${path} ${r.status}: ${await r.text()}`);
}
async function post(path, body) {
  if (DRY) { console.log(`  [DRY] POST ${path} ${JSON.stringify(body).slice(0, 80)}...`); return [{ id: 'dry-id' }]; }
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`POST ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}
async function patch(path, body) {
  if (DRY) { console.log(`  [DRY] PATCH ${path} ${JSON.stringify(body).slice(0, 80)}...`); return [{}]; }
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PATCH ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}

// ─── A kurzus konfiguráció ────────────────────────────────────────────
const SLUG = 'build-in-public-30nap'; // slug megmarad — 3 lead-magnet oldal hardcoded
const NEW_TITLE = 'Saját AI Operations rendszer 5 nap alatt';
const NEW_SUBTITLE = '5 nap alatt felépítjük az AI Operations rendszered — a kurzus minden napja egy konkrét rendszerelem.';
const NEW_DESCRIPTION = `<p>Modul 1-5: a vállalkozás-építés alapjai — pozícionálás, ajánlat, weboldal, ügyfélszerzés, mérés.<br/>Modul 6-7: saját 3-agentes AI rendszer — lead-szűrő, kommunikációs, riport-író.</p>
<p>5 napos struktúra. Pontosan azt írom le amit én magam csináltam — beleértve a hibákat — az Expert Flow vállalkozáson.</p>
<p>27 lecke. 49 000 Ft, egyszer.</p>`;

const MODULES = [
  // ═══════════════════════════════════════════════════════════════════
  // MODUL 1 — MIT ADSZ EL ÉS KINEK (BS 1-3 sűrítve)
  // ═══════════════════════════════════════════════════════════════════
  {
    position: 1,
    title: 'Mit adsz el és kinek',
    description: 'Az alap. Mielőtt egy sort is írnál a weboldaladra vagy AI-t építenél, tisztáznod kell: mit adsz, kinek, és milyen árcsomagokban. Modul végén: 1 mondatos pozíció + 1 oldalas vevőavatár + 3 csomag-szintes ajánlat.',
    lessons: [
      { position: 1, title: 'A tudásod magja — a 4 fájdalom-kérdés', is_preview: true,
        body: `<p>Nem a szenvedélyedből indulunk, hanem abból amiben évek óta kerestél megoldást — magadnak vagy a környezetednek. A 4 fájdalom-kérdés:</p>
<ol>
<li><strong>Mit kerestél megoldani magadnak az utóbbi 5 évben?</strong> Konkrét helyzeteket írj le.</li>
<li><strong>Mit szoktál ingyen megoldani a környezetednek?</strong> Amit annyira jól csinálsz hogy észre sem veszed.</li>
<li><strong>Mi az amit más nem ért, de te igen?</strong> A te szempontodból teljesen logikus dolog ami másoknak rejtély.</li>
<li><strong>Mi az amit megfizetnél valakitől hogy elvégezze helyetted, ha lenne ilyen szolgáltatás?</strong> Ez gyakran a saját jövőbeli ügyfeled.</li>
</ol>
<p>A 4 válasz egymást fedi. Ahol mind a 4 metszi egymást, ott van a tudásod magja. Egy mondatban: "Segítek [kinek] hogy [mit] elérje, mert [miért én]."</p>
<p>Ezt papíron írd, ne fejben. Egy A4. Egy mondat. Ha nem megy egy mondatba, még nincs kész — de nem ezért nem indulunk. A pozíció minden hónapban finomodik, csak a mostani legjobb verziód kell.</p>` },
      { position: 2, title: 'Az ideális vevőd — egy konkrét ember, nem szegmens',
        body: `<p>"Magyar kis-és középvállalkozás" — ez nem avatár, hanem demográfiai adat. Az igazi avatár <strong>egy konkrét ember</strong>, akiről tudod mit csinál este 10-kor.</p>
<p>Válassz ki most egy valódi embert a környezetedből aki illik a profilodra. Töltsd ki róla:</p>
<ul>
<li>Keresztnév + életkor</li>
<li>Foglalkozás (egy mondat)</li>
<li>Családi állapot + hol lakik</li>
<li>3 mondat amit valóban tudsz róla (nem találgatva — amit beszéltetek)</li>
</ul>
<p>Ezt követően írj 10-12 kérdést neki — különösen a frusztrációkról, pénzköltési szokásokról, döntési mintáiról. Tedd fel ezeket — vagy neki, vagy az emlékezetedből írd le a válaszait. <strong>Tíz valódi beszélgetés</strong> kell, nem képzelgés.</p>
<p>A modul végén egy 1 oldalas avatár-portré, akinek a hangját MÁR HALLOTTAD. Nem szegmens, hanem ember.</p>
<p>AI tipp: ha a 10-12 kérdés megvan, Claude-ot kérdezd hogy "mi az amit a kérdéseimből még nem tudok róla — segíts kérdezni az utolsó 3-at". <em>Nem helyettem dönt, csak kérdez tovább.</em></p>` },
      { position: 3, title: 'Az ajánlatod és 3 csomag-szint',
        body: `<p>5 elemes ajánlat-modell. Ezt töltöd ki:</p>
<ol>
<li><strong>Vágyott eredmény</strong> — SZÁMSZERŰ ígéret. "Heti 5 óra megtakarítás" vagy "30 napon belül 3 új ügyfél" — nem "jobb hatékonyság".</li>
<li><strong>Időkeret</strong> — rövid (7-30 nap), közepes (30-90 nap) vagy hosszú (3-12 hónap)?</li>
<li><strong>Kockázat-visszafordítás / garancia</strong> — amit te valóban tartani tudsz.</li>
<li><strong>Látható érték-stack</strong> — 5-8 elem, mindegyikhez becsült Ft-érték (mit fizetne külön-külön).</li>
<li><strong>Egy mondat</strong> — a 4 fenti összegyúrva. Ezt írod a weboldaladra hero-headline-nak.</li>
</ol>
<p>Csomag-szintek (3 db, anchor-logikával):</p>
<ul>
<li><strong>Belépő</strong> — alacsony elköteleződés, alacsony ár (pl. 49 000 Ft pilot, 1 hét, 1 konkrét probléma).</li>
<li><strong>Komplett</strong> — a fő ajánlat, a célár. Itt vásárol a vevők 60%-a.</li>
<li><strong>Premium</strong> — extra ár, extra szolgáltatás (esetleg személyes elérhetőség). Anchor — ettől tűnik kedvezőbbnek a Komplett.</li>
</ul>
<p>A három csomag mindig ugyanazt a problémát oldja meg, csak különböző mélységben. Sose csinálj "alap" és "haladó" csomagot ahol a két célközönség más.</p>` },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MODUL 2 — ONLINE JELENLÉT ÉS COPY (BS 5-6 sűrítve + AI)
  // ═══════════════════════════════════════════════════════════════════
  {
    position: 2,
    title: 'Online jelenlét és copy',
    description: 'Saját domaineden élesben egy 8-szekciós weboldal + egy szolgáltatás-specifikus landing. Modul végén: nyilvánosan létezel az interneten, és a copy nem leírja hanem ÉRTI a vevődet.',
    lessons: [
      { position: 1, title: 'A 8-szekciós weboldal — szerkezet',
        body: `<p>A klasszikus 8 szekció, ami magyar szolgáltatóra mindig működik:</p>
<ol>
<li><strong>Hero</strong> — egy mondat (a modul 1.3-ban megírt összegzés) + egy CTA gomb.</li>
<li><strong>Probléma</strong> — a vevőd hangján: "Ha az X-szel küzdesz..." Ne lista legyen, hanem konkrét helyzet.</li>
<li><strong>Megoldás</strong> — a te módszered, lépésekben.</li>
<li><strong>Csomagok</strong> — a 3 csomag-szint az 1.3-ból, anchor-logikával.</li>
<li><strong>Bizonyíték</strong> — ügyfélvélemény, számok, esettanulmány. Build-in-public fázisban a saját 30 napos naplód.</li>
<li><strong>GYIK</strong> — 5-8 valós kérdés, valós választ. NEM "Mennyibe kerül?" — hanem "Mi van ha még csak most indítok?".</li>
<li><strong>Garancia</strong> — az 1.3-ban megírt garancia, kiemelve.</li>
<li><strong>CTA</strong> — a végén megint a foglalási link, megerősítéssel ("30 perces díjmentes beszélgetés").</li>
</ol>
<p>Eszközök: HTML + Tailwind + Vercel élesben, vagy Webflow / Carrd / Framer. Ne kódolj nulla tudásból — Claude Code-dal beszélgetve generálsz egy alapot, majd a saját adataidat behelyettesíted.</p>` },
      { position: 2, title: 'Hero-headline 10 variációban + sales-szerkezet',
        body: `<p>A hero-headline a legfontosabb mondat a weboldalon. Tipikusan 7-15 szó. Egy módszer 10 variáció generálására Claude-dal:</p>
<p><strong>Prompt-sablon:</strong></p>
<pre>Szolgáltatás: [1 mondat amit eladsz]
Célközönség: [1 mondat avatár az 1.2-ből]
Vágyott eredmény: [SZÁMSZERŰ ígéret az 1.3-ból]

Adj 10 hero-headline variációt, amelyek:
- Maximum 15 szóból állnak
- Konkrét és SZÁMSZERŰ ígéret szerepel bennük
- Magyar nyelv, nem fordításízű
- Nincs benne anti-AI szótár szó (a 4. leckében részletezve)

Mindegyiknél írd le 1 mondatban hogy MIÉRT működne — kihez szól, milyen érzelmi triggert üt meg.</pre>
<p>A 10-ből 2-3-at szóban olvasol fel hangosan, és kérdezd meg magadtól: mintha valaki más mondaná, beleülne-e a hatása? A nyertes amelyik az olvasó hangján szól, nem a szerző hangján.</p>
<p>A sales-szerkezet 7 eleme: Hook → Probléma → Megoldás → Hitelesség → Ajánlat → Garancia → CTA. Minden landing oldal ezt követi — csak a méretek változnak.</p>` },
      { position: 3, title: 'Szolgáltatás-specifikus landing oldal',
        body: `<p>A főoldal mellett minden egyedi szolgáltatáshoz külön landing oldal kell. Ez konkrétabb és konvertál jobban.</p>
<p>Példa egy könyvelő irodánál:</p>
<ul>
<li>Főoldal: "Számvitel és könyvelés Budapesten — kisvállalkozásoknak."</li>
<li>Landing 1: <code>/kata-konyveles</code> — KATA-s vállalkozóknak szóló külön oldal, KATA-specifikus GYIK-kel.</li>
<li>Landing 2: <code>/ev-bevallasok</code> — egyéni vállalkozók év végi bevallása.</li>
<li>Landing 3: <code>/cegalapitas</code> — új céget alapítóknak.</li>
</ul>
<p>Mindegyik ugyanazt a 7-elemes sales-szerkezetet követi, csak az adott szolgáltatásra szabva. Egy landing oldalt 2-3 óra megírni Claude-dal, és onnantól évekig dolgozik neked.</p>
<p>Konverziós alapszabály: minél szűkebb a landing témája, annál magasabb a konverziós arány. Egy "általános könyvelő iroda" landing 2-3%-on konvertál; egy "KATA-konyveles-bp" landing 8-12%-on.</p>` },
      { position: 4, title: 'AI a copy-finomításhoz — prompt-könyvtár',
        body: `<p>Az AI itt még NEM saját agent — csak egy intelligens segédeszköz a copy-finomításhoz. 5 prompt amit ki kell próbálnod erre a modulra:</p>
<ol>
<li><strong>Hero-variáció generálás</strong> (fent a 2.2 leckében részletezve).</li>
<li><strong>Vevő-hang ellenőrzés</strong>: "Itt a hero-headline-em: [...] — egy [avatár az 1.2-ből] olvassa. Mit gondolna? 3 verzióban: pozitív, semleges, elutasító reakciót."</li>
<li><strong>GYIK generálás</strong>: "Itt a szolgáltatásom: [...]. Mi az a 8 leggyakoribb kérdés amit egy [avatár] tényleg feltenne? NE általános marketing-kérdéseket adj, hanem konkrét aggályokat."</li>
<li><strong>Anti-AI szótár pass</strong>: "Itt egy weboldal-szöveg: [...]. Cseréld ki az AI-stílusú szavakat (a teljes lista a kurzus repo-jában: <code>docs/anti-ai-szotar.md</code>) magyar megfelelőre — az AI-fordítás-szerű kifejezéseket konkrét, hétköznapi magyarra."</li>
<li><strong>Garancia-megfogalmazás</strong>: "A vágyott eredményem: [SZÁM]. Az időkeretem: [...]. Adj 3 olyan garancia-szöveget amit reálisan tarthatok és nem érzem rizikónak."</li>
</ol>
<p>Az AI itt asszisztens — te döntesz mindenről. A 10 variációból 1-et választasz, a 8 GYIK-ből 5-öt használsz, és a 3 garancia-szövegből 1-et finomítasz tovább.</p>` },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MODUL 3 — ÜGYFÉLSZERZÉS (BS 8-9 sűrítve + első AI agent)
  // ═══════════════════════════════════════════════════════════════════
  {
    position: 3,
    title: 'Ügyfélszerzés — első ügyfelek és lista-építés',
    description: 'Az első ügyfelek nem hirdetésből jönnek. 10 ember a környezetedből + egy lead magnet + automata email sorozat. Modul végén: 3 üzenet kiment, lead magnet él, email lista nő — és az AI szűri a feliratkozók komolyságát.',
    lessons: [
      { position: 1, title: 'Az ismerős-lista — első 10 név',
        body: `<p>Nem hirdetés, nem cold outreach. Tíz ember a környezetedből, akik:</p>
<ul>
<li>Ismernek téged emberileg (nem csak LinkedIn-en).</li>
<li>Olyan helyzetben vannak vagy voltak, hogy a szolgáltatásod releváns nekik.</li>
<li>Vagy ismernek olyan embert akinek releváns.</li>
</ul>
<p>Excel táblázat 4 oszloppal: Név | Hogyan ismerlek | Mi a helyzete most | Mit írok neki?</p>
<p>Az üzenet sablon (NEM marketingüzenet, hanem személyes):</p>
<pre>Szia [Név],

A [konkrét emlék közöttetek] óta nem nagyon beszéltünk.
Most elindítottam valamit: [1 mondat amit eladsz].

Nem rád akarom rátukmálni — egyszerűen csak végigveszem
azokat akiket ismerek hátha aktuális.

Ha bárkit ismersz aki [konkrét helyzetben van], és azt
gondolod hasznos lenne neki, jelezz egyet és írok neki.
Vagy ha te magad gondolkozol rajta, akkor is jelezz.

[Te keresztneved]</pre>
<p>3 üzenetnek menjen ki az első héten. Várj 5 napot. Mérd: hányan válaszolnak? Mit válaszolnak? Onnan iterálsz.</p>` },
      { position: 2, title: 'Lead magnet — 5-10 oldalas PDF',
        body: `<p>A lead magnet egy hasznos PDF amit a látogató ingyen letölt cserébe az emailjéért. NEM marketinganyag — valódi érték.</p>
<p>4 típus szolgáltatóknak ami működik:</p>
<ol>
<li><strong>Checklist</strong> — pl. "10 pontos KATA-átállás checklist" könyvelőtől.</li>
<li><strong>Sablonok</strong> — pl. "5 email-sablon első ügyfélhez" coach-tól (de coach NE — nálad más).</li>
<li><strong>Esettanulmány</strong> — pl. "Hogyan dolgozott meg egy ügyvédi iroda 30 nap alatt egy peres ügyet" — anonimizálva.</li>
<li><strong>Mini-audit</strong> — egy GYIK-stílusú dokumentum ami megmutatja milyen problémákra szokott megoldást adni.</li>
</ol>
<p>5-10 oldal Markdown-ban megírva, Claude-dal csiszolva. Aztán Pandoc vagy egy ingyenes online MD→PDF konverterrel PDF-be exportálva. Brand: csak a saját logód + színek a fejlécben — semmi sablon-design.</p>
<p>FONTOS: NE legyen áthúzott eladás a PDF-ben. A PDF maga ÉRTÉK. A pozícionálás a végén egy "ha tovább szeretnél beszélgetni, itt a Cal.com link" — egyetlen sor.</p>` },
      { position: 3, title: 'Email lista — 5-emailes welcome sorozat Kit-tel',
        body: `<p>A feliratkozó form a lead magnet alatt. Eszköz: <strong>Kit (volt ConvertKit)</strong> ingyenes terv (1000 feliratkozó).</p>
<p>A welcome sorozat 5 levél, az első 14 napban:</p>
<ol>
<li><strong>0. nap (azonnal)</strong> — köszöntés + PDF linkje. 50 szó.</li>
<li><strong>1. nap</strong> — Egy konkrét történet rólad / az ügyfeledről. 150 szó. Nem eladás.</li>
<li><strong>3. nap</strong> — Egy gyakori hiba amibe a célközönséged beleesik (és hogyan kerülöd el). 200 szó.</li>
<li><strong>7. nap</strong> — Egy esettanulmány. 250 szó. Itt jöhet egy soft CTA: "ha hasonló helyzetben vagy, foglalj 30 percet".</li>
<li><strong>14. nap</strong> — Visszatekintés és kérés: "milyen téma érdekelne legjobban?". Ez VÁLASZ-üzenetet generál — ami brand-építés.</li>
</ol>
<p>A leveleket Markdown-ban írod meg, Claude-dal csiszolod (anti-AI szótár pass!), és Kit-be másolod. 1-2 óra megírni, és 1-2 évig dolgozik neked.</p>
<p>Mérőszám: open rate 35%+ az első levélnél, 25%+ a 5.-nél. Click rate 5%+. Ha alacsonyabb — a tárgy gyenge vagy a vevő-hang nem stimmel.</p>` },
      { position: 4, title: 'Első AI érintés — Claude szűri a feliratkozókat',
        body: `<p>Itt jön az első saját AI-elemed. Még nem agent, csak egy automatikus szűrő.</p>
<p>Mit csinál: amikor valaki feliratkozik a lead magnet-re, a Kit webhook elküldi a feliratkozó adatait egy Vercel serverless function-nak. A function lehívja a Claude API-t egy rövid prompttal:</p>
<pre>Új feliratkozó: [email], opcionálisan [név].
A lead magnet: [PDF cím].

Adj 1-10 score-t:
- A személyes email cím (gmail/yahoo)? +1
- Cég-domain (pl. @ugyvediroda.hu)? +3
- Magyar név? +1
- Megadott név egyáltalán? +1

Egy mondat: ki lehet ez a feliratkozó valószínűleg?</pre>
<p>A score Supabase-be kerül. Ha 5 felett: Telegram értesítés neked ("új komoly feliratkozó: Kovács István, könyvelőiroda"). 5 alatt: csak logolás.</p>
<p>Costkalkuláció: 1 hívás Claude Haiku-val ~0.5 Ft. 1000 feliratkozó ~500 Ft. Elenyésző.</p>
<p>Ezzel az első AI-elem MÁR DOLGOZIK a vállalkozásodban. A 6. modulig építjük tovább.</p>` },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MODUL 4 — KONZULTÁCIÓ ÉS ÉRTÉKESÍTÉS (BS 7 + AI bot)
  // ═══════════════════════════════════════════════════════════════════
  {
    position: 4,
    title: 'Konzultáció és értékesítés',
    description: 'A funnel utolsó szakasza: a feliratkozó / érdeklődő lefoglal egy 30 perces díjmentes beszélgetést, és onnan vagy ajánlat-küldés, vagy elválás. Modul végén: Cal.com él, 4 automata email küldve, Stripe Payment Link kész — és AI bot foglal helyetted weboldalon.',
    lessons: [
      { position: 1, title: 'Cal.com beállítás + 4 automata email',
        body: `<p>A Cal.com az ingyenes alternatíva a Calendly-nak. Setup:</p>
<ol>
<li>Regisztráció <code>cal.com</code>-on, Google Calendar bekötés.</li>
<li>Új event-type: "30 perces díjmentes beszélgetés". URL: <code>cal.com/teneved/30perc</code>.</li>
<li>Időpont-sávok beállítása (pl. munkanapokon 9-11 és 14-16).</li>
<li>Automata Google Meet link generálás (Cal.com beállításai közt).</li>
<li>Foglalási kérdések: 3-5 kérdés (pl. "milyen helyzetben vagy?", "mit szeretnél elérni a beszélgetésen?").</li>
</ol>
<p>4 automata email az ügyfélnek a Cal.com-on keresztül:</p>
<ul>
<li><strong>Foglalás után azonnal</strong>: visszaigazolás + Google Meet link + felkészülési útmutató (3 kérdés amit átgondolhat).</li>
<li><strong>24 órával előtte</strong>: emlékeztető + Google Meet link megint.</li>
<li><strong>1 órával előtte</strong>: röpke "találkozunk 1 óra múlva".</li>
<li><strong>Beszélgetés után 2 órával</strong>: köszönő email + "itt egy 1 oldalas összefoglaló amit ígértem" — itt küldöd az ajánlatot.</li>
</ul>
<p>A 4. email kulcsfontosságú: NE a beszélgetésen küldj ajánlatot, hanem utána emailben. Ez tisztábbá teszi a döntést a vevőnek.</p>` },
      { position: 2, title: 'A 30 perces discovery call — kérdéssor',
        body: `<p>A 30 perces beszélgetés struktúrája (NEM értékesítés — diagnózis):</p>
<p><strong>1. Bemelegítés (3 perc)</strong>: "Hogyan találtál meg? Mi indított hogy lefoglald?"</p>
<p><strong>2. Helyzet (10 perc)</strong>: mi a jelenlegi állapot?</p>
<ul>
<li>"Pontosan mit csinálsz most?"</li>
<li>"Mikor jelentett ez először problémát?"</li>
<li>"Mit próbáltál eddig?"</li>
<li>"Mi nem működött, és miért gondolod hogy nem?"</li>
</ul>
<p><strong>3. Cél (5 perc)</strong>: hova akarsz eljutni?</p>
<ul>
<li>"3 hónap múlva mire szeretnél visszanézhetni?"</li>
<li>"Ha ez bejön, mit változtat ez a hétköznapjaidon?"</li>
<li>"Mi van ha NEM oldódik meg?"</li>
</ul>
<p><strong>4. Útkép (10 perc)</strong>: itt mondod el a megoldást nagyvonalakban.</p>
<ul>
<li>NE add el — magyarázd el a saját szavaiddal hogy te hogyan oldod meg.</li>
<li>Mondj egy konkrét példát egy hasonló ügyfélről.</li>
<li>Bemutatod a 3 csomag-szintet (modul 1.3), de NEM dönt el most.</li>
</ul>
<p><strong>5. Zárás (2 perc)</strong>: "Küldök 1 oldalas összefoglalót emailben, abban benne lesz az ajánlat. Olvasd át, és ha kérdés van válaszolj rá, vagy ha mehet a következő lépés, írd vissza."</p>
<p>SOHA NE zárj a meetingen. Egy nap kell a vevőnek hogy átgondolja.</p>` },
      { position: 3, title: 'Stripe Payment Link + magyar számlázás',
        body: `<p>Az ajánlat-email tartalma:</p>
<ul>
<li>1 oldal: a beszélgetés összefoglalója (probléma → cél → megoldás).</li>
<li>3 csomag-szint árral (anchor-logikával).</li>
<li>Stripe Payment Link-ek mind a 3 csomaghoz (egy-egy kattintás = fizetés).</li>
<li>"Ha kérdés van, válaszolj erre az emailre. Ha mehet, kattintsd a csomagot."</li>
</ul>
<p><strong>Stripe Payment Link készítés:</strong></p>
<ol>
<li>Stripe Dashboard → Payment Links → Create.</li>
<li>Termék: pl. "Pilot csomag — 49 000 Ft", áfa 0% (KATA esetén).</li>
<li>Sikeres fizetés után redirect: <code>te-vallakozasod.hu/koszonom</code>.</li>
<li>Másold ki a link-et, és emailben küldd.</li>
</ol>
<p><strong>Magyar számlázás:</strong> a Stripe NEM állít ki magyar áfás számlát. KATA-s vállalkozóként Számlázz.hu-n vagy Billingo-n kell utólag manuálisan kiállítani. A Stripe webhook (<code>checkout.session.completed</code>) értesít egy emailben hogy fizetés érkezett — onnan 5 perc a számla.</p>
<p>Automatizálás később: webhook → automata Számlázz.hu számla. De az első 5-10 ügyfélnél kézzel csináld, hogy megérezd a folyamatot.</p>` },
      { position: 4, title: 'AI bot foglal Cal.com-on — kommunikációs agent indítása',
        body: `<p>Eddig az AI passzív volt (szűrés a háttérben). Most aktív: chat widget a weboldaladon, ami beszélget a látogatóval és FOGLALÁST kínál.</p>
<p>A bot 3 feladata:</p>
<ol>
<li>Válaszol a 8-10 leggyakoribb kérdésre (árak, folyamat, idősávok).</li>
<li>Ha az ügy komolynak tűnik, kínálja a Cal.com link-et és proaktívan kéri foglalni.</li>
<li>Ha az ügy komplex (nem tudja eldönteni), mondja: "ezt személyesen érdemes átbeszélni" + link.</li>
</ol>
<p><strong>Architektúra:</strong></p>
<ul>
<li>Frontend: 50 soros Next.js chat widget komponens (kész minta a kurzus repo-ban).</li>
<li>Backend: Vercel serverless function ami fogadja az üzenetet, hívja Claude API-t a system prompttal (modul 6.2-ben írod meg részletesen), visszaadja a választ.</li>
<li>Memória: a beszélgetés Supabase-be naplózva.</li>
</ul>
<p>Itt még a system prompt csak a 8-10 GYIK-et és a Cal.com link-et tartalmazza. A "komoly-szűrés" még nem itt fut — az a feliratkozóknál fut (3.4).</p>
<p>Modell-választás: <strong>Claude Haiku</strong> a chat-hez. Olcsó (0.8$/1M token), gyors (~500 ms), elég jó GYIK-válaszhoz. Sonnet-re csak akkor cseréled le ha a tesztelés (modul 6.3) megmutatja hogy szükséges.</p>` },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MODUL 5 — HÁTTÉR ÉS MÉRÉS (BS 10-11 + AI riport)
  // ═══════════════════════════════════════════════════════════════════
  {
    position: 5,
    title: 'Háttér és mérés',
    description: 'A láthatatlan rész: CRM, dokumentum-rendszer, mérőszámok. Nélküle a 3-4. modulból káosz lesz. Modul végén: Google Sheets CRM él, Gmail label-rendszer beállítva, GA4 mér, és az AI heti riportot küld neked.',
    lessons: [
      { position: 1, title: 'Google Sheets CRM — 4 munkalap',
        body: `<p>Drága CRM-szoftvert NE vegyél az első évben. Google Sheets bőven elég.</p>
<p>A 4 munkalap (egy fájlban):</p>
<ul>
<li><strong>Lead-ek</strong> — minden érdeklődő: dátum, név, email, telefon, forrás (lead magnet / közvetlen / ajánlás), állapot (új / beszélgetés foglalva / ajánlat küldve / ügyfél / nem érdekel).</li>
<li><strong>Ügyfelek</strong> — minden fizetős: dátum, név, csomag, ár, számla-azonosító, projektállapot.</li>
<li><strong>Beszélgetések</strong> — Cal.com foglalások: dátum, ügyfél, témakör, eredmény (ajánlat / nem-fit / utánkövetés).</li>
<li><strong>Számlák</strong> — Számlázz.hu-ból manuálisan átírva: dátum, számlaszám, ügyfél, összeg, fizetve-e.</li>
</ul>
<p>Mind a 4 munkalap egy oszloppal kezdődik: <code>Hash</code> (rövid azonosító, pl. <code>L-2026-001</code>). Ezzel hivatkozol rájuk a többi munkalapról.</p>
<p>Apps Script automatizáció (a 4-es leckében bővebben): a Cal.com webhook ír egy új sort a Lead-ek munkalapba. A Stripe webhook ír egy új sort az Ügyfelek munkalapba. Nem kell kézzel.</p>` },
      { position: 2, title: 'Gmail label-struktúra és Drive rendszer',
        body: `<p>A Gmail-ed 200 emailes spam-káosz egy hónap alatt — ha nem rendszerezed. Egyszer beállítod, és onnantól mindig rendben van.</p>
<p><strong>Gmail label-ek (5 db elég):</strong></p>
<ul>
<li><code>01-Aktív-ügyfél</code> — minden aktív projekttel kapcsolatos email.</li>
<li><code>02-Lead</code> — érdeklődők, akik még nem ügyfelek.</li>
<li><code>03-Számla</code> — kimenő és bejövő számlák.</li>
<li><code>04-Operációs</code> — Vercel, Supabase, Stripe értesítések.</li>
<li><code>05-Tanulás</code> — newsletter, podcast email.</li>
</ul>
<p>Szűrők (filter-ek): minden Stripe email automatikusan <code>03-Számla</code>, minden Cal.com email automatikusan <code>02-Lead</code>. Egyszer beállítod, és Gmail rendezi neked.</p>
<p><strong>Google Drive mappa-rendszer:</strong></p>
<pre>/Vallalkozas
  /01-Ugyfelek
    /[Ev]-[Ugyfel-nev]
      /szerzodes.pdf
      /atado-anyagok/
      /szamlak/
  /02-Marketing
    /weboldal-tartalmak/
    /lead-magnetek/
  /03-Penzugy
    /[Ev]/szamlak/
  /04-Mukodes
    /jegyzetek/</pre>
<p>3 hónap után már nem keresgéled a szerződéseket — minden a helyén van.</p>` },
      { position: 3, title: 'Mérés — GA4 + PostHog: 5 alap esemény',
        body: `<p>A mérés ott kezdődik ahol forgalom van. Az első 30 napban CSAK 5 eseményt mérsz, nem 50-et.</p>
<p><strong>Google Analytics 4 (GA4)</strong> a weboldali forgalomhoz:</p>
<ol>
<li><code>page_view</code> — automata, minden oldallátogatás.</li>
<li><code>lead_magnet_download</code> — PDF letöltés (kattintás-tracking a letöltés-gombon).</li>
<li><code>calcom_click</code> — Cal.com link megnyomása.</li>
<li><code>calcom_booked</code> — Cal.com webhook hívja a backendet, az pedig elküldi GA4-nek.</li>
<li><code>stripe_purchase</code> — fizetés sikerült, ár átadva.</li>
</ol>
<p><strong>PostHog</strong> ugyanezt méri, de gazdagabb funkcionalitással (heatmap, recording, funnel-elemzés). Free tier 1M event/hó — bőven elég.</p>
<p>Heti riport (manuálisan vagy automata): hány page_view, hány letöltés, hány Cal.com foglalás, hány vásárlás. Két konverziós arány:</p>
<ul>
<li><strong>Látogató → letöltés</strong>: egészséges 5-10%.</li>
<li><strong>Letöltés → vásárlás</strong>: egészséges 3-8% (long tail).</li>
</ul>
<p>NE optimalizálj amíg legalább 100 page_view-d van — az alacsony minta-szám téves következtetéshez vezet.</p>` },
      { position: 4, title: 'AI heti riport — riport-író agent',
        body: `<p>Eddig manuálisan kellett összerakni a heti számokat. Most az AI csinálja.</p>
<p>A riport-író agent felépítése:</p>
<ul>
<li><strong>Trigger</strong>: cron job minden hétfő reggel 8-kor.</li>
<li><strong>Bemenet</strong>: SQL-lekérdezések Supabase-ből és PostHog-ból az elmúlt 7 napról.</li>
<li><strong>Feldolgozás</strong>: Claude Sonnet hívás egy prompttal: "Itt az elmúlt heti adat: [...]. Adj egy 5 mondatos összefoglalót: hány érdeklődő, hány komoly, hány foglalás, hány vásárlás. Mit jelent ez a múlt héthez képest? Mi a legfontosabb dolog ami történt?"</li>
<li><strong>Kimenet</strong>: Telegram értesítés neked / vagy email.</li>
</ul>
<p>Példa riport (5 mondat):</p>
<blockquote>
"<em>Múlt héten 47 új látogató, 8 lead magnet letöltés, 3 Cal.com foglalás, 1 vásárlás (49k Ft pilot). A múlt heti 32 látogatóhoz képest +47% forgalom — valószínűleg a YouTube videó hozta. A 3 Cal.com foglalásból 2 még előtted áll. Legfontosabb dolog: az új ügyféled, Kovács István, könyvelő, érdekelt a komplettre is — utánkövetésre érdemes.</em>"
</blockquote>
<p>Az AI itt összegez és kiemel — TE döntöd el mit csinálsz az információval. Költség: heti 1 hívás Sonnet-tel ~5 Ft.</p>` },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MODUL 6 — AI AGENT ÉPÍTÉSE (dedikált AI modul)
  // ═══════════════════════════════════════════════════════════════════
  {
    position: 6,
    title: 'Saját AI agent építése — az első éles agent',
    description: 'Eddig az AI passzív volt (szűrés, riport). Most aktívan beszélget az ügyfeleiddel. Modul végén: van egy működő AI agent a weboldaladon vagy Telegram bot-on, ami a saját ügyfeleid kérdéseire válaszol — és tudja mikor kell téged hívni.',
    lessons: [
      { position: 1, title: 'Mit jelent egy AI agent — vs ChatGPT, vs chatbot',
        body: `<p>Tisztázzuk a fogalmakat mielőtt építünk:</p>
<ul>
<li><strong>ChatGPT / Claude.ai</strong> — egy weboldal ahol beszélgetsz egy modellel. Te használod, nem cselekszik a nevedben, nincs memóriája az ügyfeled adatairól.</li>
<li><strong>Chatbot</strong> — egy modell + egy konkrét felület (pl. weboldali chat). Válaszol kérdésekre, de általában nem hoz döntést, nem indít akciókat a beszélgetésen kívül.</li>
<li><strong>AI agent</strong> — egy modell + szerep (system prompt) + eszközök. Tud döntést hozni ("ez a lead komoly, foglalom"), tud akciót indítani (Cal.com foglalás, email küldés), és tud emlékezni (Supabase adatbázis).</li>
</ul>
<p>A különbség nem méret kérdése — hatáskör kérdése. Egy chatbot csak válaszol. Egy agent EGY szereplő aki helyetted dolgozik egy folyamatban.</p>
<p>Ebben a modulban egy <strong>single agent</strong>-et építünk: 1 szerep, 1 prompt, 1 feladat. A 7. modulban összerakjuk őt a 3.4 (lead-szűrő) és 5.4 (riport-író) agentekkel egy rendszerré.</p>` },
      { position: 2, title: 'A system prompt megírása — 6 elemes sablon',
        body: `<p>A system prompt a "munkaköri leírás" amit az agent megkap minden hívásnál. Itt a 6 elemes sablon:</p>
<ol>
<li><strong>Szerep</strong> — Pl. "Te egy magyar [foglalkozás] iroda asszisztense vagy."</li>
<li><strong>Kihez beszélsz</strong> — Pl. "Magyar [avatár az 1.2-ből] aki első körben tájékozódik."</li>
<li><strong>Mit csinálsz</strong> — Pl. "Válaszolsz az [3 leggyakoribb téma] kérdésekre, foglalsz konzultációt Cal.com-on."</li>
<li><strong>Mit NEM csinálsz</strong> — Pl. "Nem adsz [konkrét szakmai tanácsot — pl. jogi vélemény, diagnózis]. Ha ilyet kérdeznek, mondd hogy a [foglalkozás] erre személyesen válaszol."</li>
<li><strong>Hangütés</strong> — Pl. "Magázódsz, tárgyilagos, rövid mondatok. SOHA ne használj anti-AI szótár szót (lista: <code>docs/anti-ai-szotar.md</code>)."</li>
<li><strong>Mit teszel ha nem tudod</strong> — Pl. "Ha nem tudod a választ, mondd hogy [név] erre személyesen válaszol, és kínáld a Cal.com link-et: cal.com/teneved/30perc."</li>
</ol>
<p>Hossz: 300-600 szó. Ne legyen hosszabb — minél több utasítás, annál nagyobb az esély hogy az agent kihagy valamit.</p>
<p>FONTOS sablon-szabály: minden szabály ELEJÉN konkrét példa legyen. NE "általában magázódsz" — hanem "ha az ügyfél tegez, te akkor is magázol. Példa: 'Igen, Önnek érdemes lenne...' nem 'Igen, neked érdemes...'".</p>` },
      { position: 3, title: 'Tesztelés a saját ügyfeleid kérdéseivel',
        body: `<p>Mielőtt élesítenéd, le kell tesztelni. Módszer:</p>
<ol>
<li><strong>Gyűjts össze 10 valós kérdést</strong> — az utolsó 50 emailedből vagy 20 telefonbeszélgetésedből. NE találd ki — valós ügyfelek valós szavait használd.</li>
<li><strong>Terminálban tesztelj</strong> először, NE weboldalon. Egy 30 soros Node script ami kéri a Claude API-t a system prompttal és a kérdéssel.</li>
<li><strong>Mindegyikre nézd meg:</strong>
   <ul>
   <li>A válasz helyes? (tényszerűen)</li>
   <li>Magyarul jó? (nem-fordításízű, anti-AI szótár oké)</li>
   <li>Nem ad olyan tanácsot amit nem szabadna? (jogi / diagnózis)</li>
   <li>Nem hivatkozik nem létező árra vagy szolgáltatásra?</li>
   </ul>
</li>
<li><strong>Iterálj a system prompton</strong>: ha valamit rosszul csinál, kiegészíted az utasítást és újra teszteled.</li>
</ol>
<p>Tipikus első kör: 10-ből 6-7 jó, 3-4 elcsúszik. Ne add fel — 2-3 prompt-frissítés után általában 10-ből 9 jó.</p>
<p>Eszközök: Anthropic Workbench (<code>console.anthropic.com</code>) vagy a saját Node terminál-script-ed (kész minta a kurzus repo-ban).</p>` },
      { position: 4, title: 'Bevetés — chat widget weboldalra vagy Telegram bot',
        body: `<p>Két opció ahova az első agent élesben kerül. Mindkettő 1-2 óra setup.</p>
<p><strong>Opció A — Weboldali chat widget</strong></p>
<ul>
<li>Egy 50 soros Next.js komponens (kész minta a kurzus repo-ban): jobb alsó sarokban egy ikon, megnyit egy chat ablakot.</li>
<li>Backend: egy Vercel serverless function (<code>/api/chat</code>) ami fogadja az üzenetet, hívja Claude API-t, visszaadja.</li>
<li>Előnye: minden látogató látja, magas konverziós potenciál.</li>
<li>Hátránya: kódolni kell (másold a sablont, állítsd be a saját adataidat).</li>
</ul>
<p><strong>Opció B — Telegram bot</strong></p>
<ul>
<li>BotFather-en regisztrálsz egy bot-ot: <code>/newbot</code> parancs, név megadás, token-t kapsz.</li>
<li>Webhook konfigurálva a saját Vercel function-odra.</li>
<li>Előnye: 30 perc setup, ingyenes, mobil-első.</li>
<li>Hátránya: az ügyfeleidnek Telegram-ot kell használniuk (nem mindenki).</li>
</ul>
<p><strong>Javaslat</strong>: kezdj Telegram bot-tal (alacsony tét, gyors tanulás), aztán amikor látod hogy működik, tedd weboldali widget-be is.</p>
<p>FONTOS: az első éles használat HETEKIG nem lesz tökéletes. Heti review (5.4 és 7.3) közben javítod a system prompt-ot. Az agent <strong>tanul a saját ügyfeleidből</strong> — ezt nem tudja egy SaaS megadni neked.</p>` },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MODUL 7 — AI OPERATIONS SYSTEM (a végcél)
  // ═══════════════════════════════════════════════════════════════════
  {
    position: 7,
    title: 'AI Operations System — a 3 agent együtt',
    description: 'A kurzus végpontja. Az eddigi 3 AI-elemed (lead-szűrő a 3.4-ből, kommunikációs a 6.4-ből, riport-író a 5.4-ből) most ÖSSZEÁLL egy rendszerré. Modul végén: működő AI Operations System, monitoringgal, költség-trackinggel.',
    lessons: [
      { position: 1, title: 'A 3 pillér × 3 agent térkép',
        body: `<p>Az AI Operations System nem új technológia — egy <strong>szerkezet</strong>. 3 pillér, mindegyiken 1 agent dolgozik. Itt a térkép amit a kurzus során felépítettél:</p>
<p><strong>Pillér 1 — Ügyfélszerzés</strong></p>
<ul>
<li><strong>Lead-szűrő agent</strong> (3.4 lecke): minden új feliratkozót pontoz.</li>
<li>Modell: Haiku, költség ~0.5 Ft / feliratkozó.</li>
</ul>
<p><strong>Pillér 2 — Ügyfélkommunikáció</strong></p>
<ul>
<li><strong>Kommunikációs agent</strong> (6. modul egésze): élő chat a weboldalon vagy Telegram-on.</li>
<li>Modell: Haiku alapból (Sonnet-re válthatsz ha a tesztelés megmutatja hogy szükséges).</li>
</ul>
<p><strong>Pillér 3 — Háttér és riport</strong></p>
<ul>
<li><strong>Riport-író agent</strong> (5.4 lecke): heti összefoglaló neked.</li>
<li>Modell: Sonnet, költség ~5 Ft / hét.</li>
</ul>
<p>A 3 agent ugyanazon a <strong>Supabase</strong> adatbázison osztozik (közös memória). Egyetlen domain alá kerülnek (<code>te-vallakozasod.hu/chat</code>, <code>/admin</code>). A Telegram bot az értesítési csatorna neked.</p>
<p>Ez a teljes rendszer. NEM kell 7 agent mint nálam — neked 3 elég, és 5-10 ezer Ft havi költségből működik.</p>` },
      { position: 2, title: 'Multi-agent koordináció — Supabase mint blackboard',
        body: `<p>A 3 agent egymással NEM közvetlenül beszél (nincs API-hívás agent-ből agent-be). Helyette egy <strong>közös memória</strong> van: Supabase.</p>
<p>Példa flow:</p>
<ol>
<li>Valaki feliratkozik a lead magnet-re. A <strong>Lead-szűrő agent</strong> beír egy új sort a <code>leads</code> táblába: <code>{ email, name, score: 8, status: 'qualified' }</code>.</li>
<li>Másnap ugyanaz az ember chat-el a weboldaladon. A <strong>Kommunikációs agent</strong>, mielőtt válaszol, lekéri a <code>leads</code> tábláról ennek az e-mailnek a score-ját: "Aha, 8-as score, qualified — kínáljam azonnal a Cal.com linket".</li>
<li>Vasárnap este a <strong>Riport-író agent</strong> lekérdezi az egész hét <code>leads</code> + <code>chats</code> + <code>bookings</code> adatait, és összerakja az összefoglalót neked.</li>
</ol>
<p>Ez a <strong>blackboard pattern</strong>: minden agent ír és olvas ugyanabból a központi DB-ből. Nem kell összetett message-passing — a Supabase a "fekete tábla" amire mindenki felír és olvas.</p>
<p>Hand-off (átadás) is ezen keresztül megy: ha a Kommunikációs agent eldönti hogy ez a beszélgetés komplex és kell rád eskalálni, beír egy sort a <code>escalations</code> táblába → cron lefuttatja a Telegram értesítést neked.</p>` },
      { position: 3, title: 'Élesítés — domain, biztonság, költség-tracking',
        body: `<p>Production-ready checklist a 30. napra:</p>
<p><strong>Domain</strong></p>
<ul>
<li>Vercel projekt → Custom Domain → <code>te-vallakozasod.hu</code> vagy aldomain.</li>
<li>DNS A-record vagy CNAME (Vercel megadja a pontos beállítást).</li>
</ul>
<p><strong>Biztonság</strong></p>
<ul>
<li>API endpoint-okra Bearer auth: <code>CRON_SECRET</code> env változó, csak a webhook-ok és cron-ok használhatják.</li>
<li>Webhook-ok HMAC-szel aláírva (Cal.com <code>X-Cal-Signature-256</code>, Stripe <code>Stripe-Signature</code>).</li>
<li>Supabase RLS bekapcsolva, csak <code>service_role</code>-nak van hozzáférés.</li>
<li><code>.env.local</code> SOHA git-be (gitignore!).</li>
</ul>
<p><strong>Monitoring</strong></p>
<ul>
<li>Vercel Analytics — automata.</li>
<li>PostHog dashboard — az 5.3-ban beállított 5 esemény.</li>
<li>Health-check cron: ha 24 órán át nincs Claude API-hívás, küldjön Telegram "minden rendben?" üzit.</li>
</ul>
<p><strong>Költség-tracking</strong></p>
<ul>
<li>Anthropic Console → Usage. Heti egyszer megnézed mennyit költöttél.</li>
<li>Supabase Free tier alatt nincs költség. Ha Pro-ra váltasz: ~7000 Ft / hó.</li>
<li>Vercel Hobby: 0 Ft. Stripe: ~1.5% + 30 Ft / tranzakció.</li>
</ul>
<p>Várt összköltség egy 1-fős szolgáltatónál: <strong>2-10 ezer Ft / hó</strong> attól függően mekkora a forgalom.</p>` },
      { position: 4, title: 'Mikor upgrade-elj — AI Operations retainer vs DIY',
        body: `<p>A 30. nap végén két irány lehet a tied:</p>
<p><strong>Maradsz DIY (a saját kezedben)</strong></p>
<ul>
<li>Heti 2-4 órát rákölthetsz karbantartásra.</li>
<li>Kedveled a kódolást, és tovább akarsz fejleszteni (új agent, új workflow).</li>
<li>A költségvetésed feszített, nem fér bele 120 ezer Ft+ havi.</li>
<li>A vállalkozásod kis-méretű és nem kell skálázni.</li>
</ul>
<p><strong>Upgrade — Expert Flow AI Operations retainer</strong></p>
<ul>
<li><strong>120 ezer Ft / hó alap</strong> — 1 rendszer karbantartása, havi 1 review meeting. Akkor jó ha működik a rendszer és csak figyelni kell.</li>
<li><strong>220 ezer Ft / hó</strong> — 2-3 rendszer, kétheti review, prioritás email-támogatás. Akkor jó ha bővítenéd (új agent, új workflow).</li>
<li><strong>450 ezer Ft / hó</strong> — teljes AI ops, heti meeting, ad hoc support, új features. Akkor jó ha skálázol és ez nem a te szakmád.</li>
</ul>
<p><strong>Döntési képlet</strong>: <em>"A havi 2-4 óra karbantartás többet vagy kevesebbet ér mint 120 ezer Ft?"</em></p>
<ul>
<li>Ha az időd 30 ezer Ft / óra: 4 óra = 120 ezer = pont annyi.</li>
<li>Ha az időd 50+ ezer Ft / óra: már az alapcsomag is megéri.</li>
</ul>
<p>Foglalj egy 30 perces díjmentes konzultációt: <code>cal.com/expertflow/30perc</code> — végigvesszük melyik csomag illene rád, és NEM próbálok rád tukmálni semmit.</p>
<p>Vagy maradsz DIY — ugyanúgy jó döntés. A rendszer a tied. Hetente 30 perc karbantartás és működik.</p>` },
    ],
  },
];

// ─── Validation a futtatás előtt ─────────────────────────────────────
function validate() {
  const errors = [];
  for (const m of MODULES) {
    if (!m.position || !m.title || !m.lessons?.length) errors.push(`Modul ${m.position || '?'}: hiányos`);
    if (!m.description) errors.push(`Modul ${m.position}: nincs description`);
    for (const l of m.lessons) {
      if (!l.position || !l.title || !l.body) errors.push(`Lecke ${m.position}.${l.position || '?'}: hiányos`);
      if (l.body.length < 200) errors.push(`Lecke ${m.position}.${l.position}: body túl rövid (${l.body.length} char)`);
      // anti-AI szótár check
      const banned = ['kontroverz', 'paradigma', 'szinergikus', 'szinergia', 'holisztikus', 'exponenciálisan', 'transzformatív', 'autentikus', 'transzparens'];
      for (const w of banned) {
        if (l.body.toLowerCase().includes(w)) {
          errors.push(`Lecke ${m.position}.${l.position}: tiltott szó "${w}"`);
        }
      }
    }
  }
  return errors;
}

// ─── Futtatás ────────────────────────────────────────────────────────
async function run() {
  console.log(`Expert Flow Akadémia kurzus-rebuild ${DRY ? '(DRY-RUN)' : ''}`);
  console.log(`Modulok: ${MODULES.length}, Leckék: ${MODULES.reduce((a, m) => a + m.lessons.length, 0)}`);

  console.log('\n0. Validáció...');
  const errs = validate();
  if (errs.length) {
    console.error('  HIBÁK:');
    for (const e of errs) console.error('   ', e);
    process.exit(1);
  }
  console.log('  OK — minden modul és lecke érvényes.');

  console.log('\n1. Kurzus keresése:', SLUG);
  const courses = await get(`courses?slug=eq.${SLUG}&select=id,title,price_huf`);
  if (!courses.length) { console.error('  Nincs ilyen kurzus.'); process.exit(1); }
  const courseId = courses[0].id;
  console.log(`  Kurzus ID: ${courseId} ("${courses[0].title}", ${courses[0].price_huf} Ft)`);

  console.log('\n2. Régi modulok törlése (cascade: leckék is)...');
  const existing = await get(`course_modules?course_id=eq.${courseId}&select=id,position,title&order=position`);
  console.log(`  Talált: ${existing.length} modul`);
  if (existing.length) {
    for (const m of existing) console.log(`    - Modul ${m.position}: ${m.title}`);
    await del(`course_modules?course_id=eq.${courseId}`);
    console.log('  Törölve.');
  }

  console.log('\n3. Course mező-frissítés...');
  await patch(`courses?slug=eq.${SLUG}`, {
    title: NEW_TITLE, subtitle: NEW_SUBTITLE, description: NEW_DESCRIPTION, published: true,
  });
  console.log('  Frissítve.');

  console.log('\n4. Új modulok és leckék létrehozása...');
  let mc = 0, lc = 0;
  for (const m of MODULES) {
    const [mod] = await post('course_modules', {
      course_id: courseId, position: m.position, title: m.title, description: m.description,
    });
    console.log(`  + Modul ${m.position}: ${m.title}`);
    mc++;
    for (const l of m.lessons) {
      await post('course_lessons', {
        module_id: mod.id, position: l.position, title: l.title, body_html: l.body, is_preview: l.is_preview ?? false,
      });
      console.log(`      + ${m.position}.${l.position} ${l.title}${l.is_preview ? '  [PREVIEW]' : ''}`);
      lc++;
    }
  }

  console.log(`\nKész. ${mc} modul / ${lc} lecke ${DRY ? '(dry-run, NEM lett mentve)' : 'beillesztve'}.`);
}

run().catch(e => { console.error('\nHIBA:', e.message); process.exit(1); });
