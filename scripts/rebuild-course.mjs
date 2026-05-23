// Solo Business Akadémia — kurzus teljes újraépítése.
// A korábbi "build-in-public 30 nap" tartalmát TÖRLI és lecseréli
// egy strukturált 4-lépéses AI Operations progresszióra.
// Futtatás: node scripts/rebuild-course.mjs
// Idempotens: minden cleanup + insert előtt ellenőriz.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8');
const env = Object.fromEntries(envFile.split('\n').filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); let v = l.slice(i+1).trim(); if ((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v = v.slice(1,-1); return [l.slice(0,i), v]; }));

const SUPA_URL = env.SUPABASE_URL.replace(/\/+$/, '');
const SUPA_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' };

async function get(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: H });
  if (!r.ok) throw new Error(`GET ${path}: ${r.status} ${await r.text()}`);
  return r.json();
}
async function del(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method: 'DELETE', headers: H });
  if (!r.ok) throw new Error(`DELETE ${path}: ${r.status} ${await r.text()}`);
}
async function post(path, body) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`POST ${path}: ${r.status} ${await r.text()}`);
  return r.json();
}
async function patch(path, body) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PATCH ${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

const SLUG = 'build-in-public-30nap'; // slug marad: hardcoded a lead-magnet oldalakon
const NEW_TITLE = 'Saját AI Operations rendszer 30 nap alatt';
const NEW_SUBTITLE = 'Magyar szolgáltató egyéni vállalkozóknak — az AI fogalmaktól a saját működő rendszerig, 4 lépésben.';
const NEW_DESCRIPTION = `<p>Ez egy <strong>30 napos bootcamp</strong> magyar szolgáltató egyéni vállalkozóknak — ügyvédeknek, könyvelőknek, ingatlanosoknak, orvosoknak, fotósoknak, fitness edzőknek, fizikoterapeutáknak —, akiknek <em>már van vállalkozása</em> és AI Operations rendszerrel akarják továbbfejleszteni.</p>
<p><strong>A → B:</strong> Most: hallottál az AI-ról, esetleg használtál ChatGPT-t. A 30. napon: van egy saját <strong>AI Operations System</strong>-ed ami lead-eket szűr, ügyfélkommunikációt automatizál, és heti riportot küld.</p>
<p><strong>4 lépésben építjük fel:</strong> AI Agent → Agent Workflow → Multi-Agent rendszer → AI Operations System. Plusz egy modul a fogalmak tisztázására az elején és egy a feedback loop-ra a végén. <strong>6 modul, 24 lecke.</strong></p>
<p><strong>NEM tartalmaz:</strong> pozicionálás, copywriting, landing-szövegezés, funnel-választás — ezek a Solo Business Library és az Agentic Start ingyenes anyagaiban már megvannak. <em>Itt csak az AI rendszer.</em></p>`;

const MODULES = [
  {
    position: 1,
    title: 'AI alapok — mi az és mi nem',
    description: 'Fogalom-tisztázás. A modul végén tudod a különbséget ChatGPT / AI bot / AI agent közt, és pontosan látod a 4 lépéses progressziót amit a kurzus során bejársz.',
    lessons: [
      { position: 1, title: 'ChatGPT, AI bot, AI agent — mi a különbség', is_preview: true,
        body: `<p>A három fogalmat folyton összekeverik. Itt a tiszta szétválasztás:</p>
<ul>
<li><strong>ChatGPT</strong> (vagy Claude.ai, Gemini felület) — egy weboldal ahol beszélgetsz egy modellel. Nem cselekszik a nevedben, nincs memóriája az ügyfeled adatairól, nem indít akciókat.</li>
<li><strong>AI bot / chatbot</strong> — egy modell + egy konkrét felület (pl. weboldali chat widget). Válaszol kérdésekre, de általában nem hoz döntést és nem csinál semmit a beszélgetésen kívül.</li>
<li><strong>AI agent</strong> — egy modell + szerep + eszközök. Tud döntést hozni (pl. "ez a lead komoly, foglalom"), tud akciót indítani (Cal.com foglalás, email küldés), és tud emlékezni (Supabase adatbázis).</li>
</ul>
<p>A különbség nem méret kérdése, hanem hatáskör kérdése. A ChatGPT egy <em>eszköz amit te használsz</em>. Az agent <em>egy szereplő aki helyetted dolgozik egy konkrét folyamatban</em>.</p>
<p>Ennek a kurzusnak a végén nem egy chatbotod lesz — egy működő AI agent rendszered.</p>` },
      { position: 2, title: 'Mire való az AI a saját vállalkozásodban — 3 terület',
        body: `<p>A vállalkozásodban ezer dolog van. Az AI nem mindenhez jó. Ez a 3 terület ami szolgáltatóként VALÓBAN megéri:</p>
<ol>
<li><strong>Lead-szűrés</strong> — egy ember kitölt egy űrlapot vagy chatel veled, az AI eldönti komoly-e, és csak a komolyakat juttatja el hozzád. Időt spórol: nem ülsz le 30 perces meetingre olyannal aki nem akar fizetni.</li>
<li><strong>Ügyfélkommunikáció szűrése</strong> — visszatérő kérdésekre az AI válaszol (árak, folyamat, GYIK). Te csak az egyedi ügyekkel foglalkozol.</li>
<li><strong>Riport és átláthatóság</strong> — heti összefoglaló a számaidról (hány lead, hány foglalás, hány új ügyfél). Az AI begyűjti és összerakja, te csak elolvasod.</li>
</ol>
<p>Ezt a hármat fogjuk felépíteni a kurzus során. Más területeket (pl. szerződéskötés, jogi tanácsadás, kreatív tervezés) szándékosan kihagyunk — ezek nem az AI dolga.</p>` },
      { position: 3, title: 'Mire NEM való az AI — mit ne automatizálj',
        body: `<p>Pont olyan fontos tudni mit NE csinálj AI-jal mint amit igen. Konkrét tilalmak szolgáltatónak:</p>
<ul>
<li><strong>Szerződéskötés, jogi nyilatkozat</strong> — soha. Felelősséget nem vállalhat az AI, a hiba a tied lesz.</li>
<li><strong>Diagnózis, kezelési terv</strong> (orvos / pszichológus / fizikoterapeuta) — az AI csak szűrhet és időpontot foglalhat, döntést nem hozhat.</li>
<li><strong>Konkrét árajánlat egyedi munkára</strong> — ha minden ügyfél más, az ár-meghatározás nálad maradjon. Az AI csak a sávot mondja meg (pl. "120-450 ezer Ft között").</li>
<li><strong>Bizalmi beszélgetés</strong> — ahol az ügyfél kibeszéli magát, az emberi kapcsolat számít, nem a hatékonyság.</li>
<li><strong>Kreatív, egyedi kimenet</strong> ahol a te aláírásod a lényeg (esküvői fotó posztprodukciója, jogi vélemény).</li>
</ul>
<p>Szabály: ha a hiba ára nagyobb mint az időmegtakarítás haszna, ne automatizáld.</p>` },
      { position: 4, title: 'A 4 lépéses progresszió — mit építünk a 30 nap alatt',
        body: `<p>Az AI-rendszered nem egy nap alatt épül fel. 4 szint van, mindegyik a következő alapja:</p>
<ol>
<li><strong>AI Agent</strong> (Modul 2) — egy szerep, egy prompt, egy konkrét feladat. Pl. "GYIK-válaszoló a weboldalamon".</li>
<li><strong>Agent Workflow</strong> (Modul 3) — az agent egy folyamatba kerül: input → szűrés → döntés → akció. Pl. "lead bejön → szűrök → ha komoly, foglalok időpontot".</li>
<li><strong>Multi-Agent rendszer</strong> (Modul 4) — több specializált agent dolgozik együtt, mindegyiknek saját szerepe. Pl. egy lead-szűrő + egy kommunikációs + egy riport-író.</li>
<li><strong>AI Operations System</strong> (Modul 6) — a teljes rendszer egyben, mérőszámokkal, költséggel, monitoringgal. Ez a végcél.</li>
</ol>
<p>Modul 5 közben a feedback loop-pal foglalkozunk: hogyan tanul és fejlődik a rendszer a használatból. Nélküle az agent statikus marad és lassan elavul.</p>
<p>A 30 nap végén a 4. szinten vagy. Onnan a 120/220/450 ezer Ft havi AI Operations retainer a következő lépés — ha azt akarod hogy én karbantartsam helyetted.</p>` },
    ],
  },
  {
    position: 2,
    title: 'Az első AI Agent',
    description: 'Lépésről lépésre felépítesz egy egyetlen szereppel rendelkező AI agent-et a saját vállalkozásodra. A modul végén egy működő agent válaszol a GYIK kérdésekre — teszten, terminálban vagy chat felületen.',
    lessons: [
      { position: 1, title: 'Mi az "single agent" — egy szerep, egy prompt',
        body: `<p>Az első agent legyen egyszerű. Egy szerepe van, egy konkrét területen. Ne akarj mindent megoldó AI-t építeni az első héten.</p>
<p>Egy single agent három részből áll:</p>
<ul>
<li><strong>System prompt</strong> — a szerep és a szabályok. Pl. "Te egy magyar fizikoterapeuta asszisztense vagy, csak árat és időpontot adsz, sohasem diagnózist".</li>
<li><strong>Tudásbázis</strong> — amit ismernie kell. Pl. árak, szolgáltatások, GYIK válaszok.</li>
<li><strong>Lekérdező felület</strong> — ahova az ügyfél kérdést ír. Lehet terminál először, később weboldali chat vagy Telegram.</li>
</ul>
<p>Az agent NEM lesz tökéletes az első körben. A cél most az, hogy <strong>működjön</strong> — válaszoljon a 10 leggyakoribb kérdésre épkézláb módon, anélkül hogy hülyeséget mondana.</p>
<p>A finomítás Modul 5-ben jön (feedback loop). Most csak a működés.</p>` },
      { position: 2, title: 'A system prompt megírása — lépésről lépésre',
        body: `<p>A system prompt a "munkaköri leírás" amit az agent megkap. Itt a 6 elemes sablon amit használunk:</p>
<ol>
<li><strong>Szerep</strong> — ki vagy? Pl. "Te egy magyar könyvelő iroda asszisztense vagy."</li>
<li><strong>Kihez beszélsz</strong> — Pl. "Magyar kisvállalkozóhoz aki első körben tájékozódik."</li>
<li><strong>Mit csinálsz</strong> — Pl. "Válaszolsz az árakkal és a szolgáltatásokkal kapcsolatos kérdésekre, foglalsz konzultációt Cal.com-on."</li>
<li><strong>Mit NEM csinálsz</strong> — Pl. "Nem adsz konkrét adótanácsot, nem véleményezel egyedi ügyet."</li>
<li><strong>Hangütés</strong> — Pl. "Magázódsz, tárgyilagos, rövid mondatok."</li>
<li><strong>Mit teszel ha nem tudod</strong> — Pl. "Ha nem tudod a választ, mondd hogy a könyvelő erre személyesen válaszol, és kínáld a Cal.com linket."</li>
</ol>
<p>Az egész system prompt általában 300-600 szó. Ne legyen hosszabb — minél több utasítás, annál nagyobb az esély hogy az agent kihagy valamit.</p>` },
      { position: 3, title: 'Tesztelés — a saját ügyfeleid kérdéseivel',
        body: `<p>Mielőtt élesítenéd, le kell tesztelni. A módszer:</p>
<ol>
<li><strong>Gyűjts össze 10 valós kérdést</strong> — az utolsó 50 emailedből vagy 20 telefonbeszélgetésedből. Ne találd ki, hanem valós ügyfelek valós szavait használd.</li>
<li><strong>Terminálban tesztelj</strong> először. <code>curl</code>-rel vagy egy 30 soros Node script-tel. NE rakd ki weboldalra amíg a 10 alap kérdést nem tudja jól.</li>
<li><strong>Mindegyikre nézd meg:</strong> A válasz helyes? Magyarul jó? Nem ad olyan tanácsot amit nem szabadna? Nem hivatkozik nem létező árra?</li>
<li><strong>Iterálj a system prompton</strong>: ha valamit rosszul csinál, kiegészíted az utasítást és újra teszteled.</li>
</ol>
<p>Tipikus első kör: 10-ből 6-7 jó, 3-4 elcsúszik. Ne add fel — 2-3 prompt-frissítés után általában 10-ből 9 jó.</p>
<p>Eszközök: Anthropic Workbench (console.anthropic.com) vagy a saját Node terminál script-ed.</p>` },
      { position: 4, title: 'Bevetés — chat widget weboldalra vagy Telegram bot',
        body: `<p>Két opció ahova az első agent élesben kerül:</p>
<ul>
<li><strong>Weboldali chat widget</strong> — egy gomb a jobb alsó sarokban, megnyit egy chat ablakot. A látogatók azonnal kérdezhetnek. Előnye: konverzió nő, hátránya: kódolni kell egy kicsit (Next.js + Tailwind komponens, kész minta a kurzusban).</li>
<li><strong>Telegram bot</strong> — saját bot, az ügyfeleknek megadod (vagy QR-kód a névjegyeden). Előnye: 5 perc alatt él, ingyenes, mobil-első. Hátránya: a látogatóknak Telegram kell.</li>
</ul>
<p>Először vesd be Telegram-on (gyorsabb tanulás, alacsonyabb tét), aztán amikor látod hogy működik, tedd weboldalra. A Telegram bot beállítása BotFather-en: <code>/newbot</code> parancs, név megadás, kapsz egy tokent, és kész.</p>
<p>A backend mindkét esetnél ugyanaz: egy Vercel serverless function ami fogadja az üzenetet, hívja a Claude API-t a system prompttal, és visszaadja a választ.</p>` },
    ],
  },
  {
    position: 3,
    title: 'Agent Workflow — az agent egy folyamatban',
    description: 'A single agent magában nem elég. Itt megtanulod hogyan illeszd egy folyamatba (input → szűrés → döntés → akció). A modul végén a saját üzleti folyamatodra felépítesz egy 4-lépéses workflow-t.',
    lessons: [
      { position: 1, title: 'Mi az "agent workflow" — input → szűrés → döntés → akció',
        body: `<p>A single agent csak válaszol. A workflow ennél több: van neki egy <em>folyamata</em> amit végigvisz.</p>
<p>A 4 alap-lépés:</p>
<ol>
<li><strong>Input</strong> — honnan jön az adat? (űrlap, chat, email)</li>
<li><strong>Szűrés</strong> — releváns-e? (komoly-e a lead, hozzád való-e az ügy)</li>
<li><strong>Döntés</strong> — mit tegyünk? (foglalás, válasz, továbbküldés neked)</li>
<li><strong>Akció</strong> — végrehajtás (Cal.com foglalás, email küldés, riport)</li>
</ol>
<p>Példa egy ingatlanosnál: <strong>Input:</strong> egy érdeklődő beír a weboldalon "kerek 60 milliós lakást Pesten". → <strong>Szűrés:</strong> az AI elolvassa, megnézi a kataszteredet, lát-e ilyet. → <strong>Döntés:</strong> ha van 2-3 találat, jön ajánlat + foglalás. Ha nincs, udvarias "nincs most ilyen, értesítlek ha lesz". → <strong>Akció:</strong> Cal.com link kiküldése VAGY Supabase-be lead-mentés a "no-match" listára.</p>
<p>Az agent <em>nem chatel</em> — egy lineáris folyamatot visz végig minden megkereséssel.</p>` },
      { position: 2, title: 'Példa workflow: lead bejön → AI szűr → foglal → riport',
        body: `<p>Konkrét példa végig, ahogy egy ügyvédi iroda használja:</p>
<p><strong>1. Input:</strong> A weboldali űrlapon valaki kitölt: név, email, telefon, ügytípus, rövid leírás. Webhook a backendnek.</p>
<p><strong>2. Szűrés (AI 1.):</strong> A leírást elolvassa egy Claude Haiku hívás. Megnézi:</p>
<ul>
<li>Az ügy típusa illik-e az iroda profiljához (büntető, munkajogi, családjogi)?</li>
<li>A leírás komoly-e (van-e konkrét helyzet) vagy spam?</li>
<li>A telefonszám valódi-e (formátum check)?</li>
</ul>
<p><strong>3. Döntés:</strong> Score-t ad (1-10). 7 felett "komoly", 5-7 között "talán", 5 alatt "spam".</p>
<p><strong>4. Akció:</strong></p>
<ul>
<li>7+ → automatikus email "Köszönjük, kapja a Cal.com linket", + Telegram értesítés az ügyvédnek.</li>
<li>5-7 → szokásos köszönő email, nincs Cal.com.</li>
<li>5 alatt → semmi, csak Supabase-be logolás.</li>
</ul>
<p><strong>Heti riport:</strong> "12 lead bejött, 8 komoly, 5 foglalt időpontot." Két számjegy. Ezt nézi meg az ügyvéd minden hétfő reggel.</p>` },
      { position: 3, title: 'Eszközök — Supabase, Cal.com, Telegram a workflow-ban',
        body: `<p>A workflow-hoz 3 alapeszköz kell. Mindegyik a kurzus repo-jában készen áll (másold, állítsd be a saját adataidat):</p>
<ul>
<li><strong>Supabase</strong> — adatbázis és memória. Lead-ek táblája (név, email, score, status), beszélgetések logja. Ingyenes Free tier elég kezdetben (500 MB, 50000 monthly active users).</li>
<li><strong>Cal.com</strong> — foglalási rendszer. Saját profilod 1 link, automata Google Meet csatolás, naptár-szinkron. Ingyenes 1 event-type-ra.</li>
<li><strong>Telegram Bot</strong> — értesítési csatorna. Az AI küld neked Telegram üzenetet ha valami fontos történt ("ÚJ KOMOLY LEAD: Kiss Péter, ingatlankereső, 60M, 0630..."). 0 forint, 0 setup overhead.</li>
</ul>
<p>Felépítés: a Vercel serverless function hívja sorban: <code>insert lead → Claude score → if score &gt; 7 → send Telegram + email Cal.com link</code>. Kb. 80 sor JavaScript.</p>
<p>FONTOS: NEM kell n8n-t használni. Az n8n vizuális workflow-t kínál, de Vercel + 80 sor kód olcsóbb, gyorsabb, kódolva van (verzió-kontroll).</p>` },
      { position: 4, title: 'A saját workflow-d felépítése — 4 lépéses sablon a vállalkozásodra',
        body: `<p>Most lerajzolod a saját workflow-d. Sablon:</p>
<p><strong>Lépés 1 — Input.</strong> Honnan jön az ügyfél kérdése/megkeresése? Listázd a 2-3 fő bemeneti csatornát (weboldal űrlap, Instagram DM, email, telefon).</p>
<p><strong>Lépés 2 — Szűrés.</strong> Mi az ami eldönti hogy érdemes-e foglalkozni vele?</p>
<ul>
<li>Mi az "ideális ügyfél" három jellemzője nálad?</li>
<li>Mi az 1-2 azonnali kizáró ok? (pl. más városban van és nem utazol, vagy a költségvetése túl kicsi)</li>
</ul>
<p><strong>Lépés 3 — Döntés.</strong> Score 1-10. Milyen kérdésekre adsz pontot? Pl.:</p>
<ul>
<li>A költségvetése legalább X Ft? (+3)</li>
<li>Konkrét helyzet, nem általános érdeklődés? (+2)</li>
<li>Megfelelő városban van? (+2)</li>
<li>Sürgős (1 hónapon belül)? (+2)</li>
</ul>
<p><strong>Lépés 4 — Akció.</strong> Mit csinálsz 7+ score-nál? Mit 5-7 között? Mit 5 alatt?</p>
<p>Ez az 1-oldalas sablon a hét feladata. Egyszer megírod, és onnantól ezt fogja az agent végrehajtani.</p>` },
    ],
  },
  {
    position: 4,
    title: 'Multi-Agent rendszer',
    description: 'Egy agent nem oldja meg a teljes vállalkozásod. Itt megtanulod hogyan dolgozik együtt 3 specializált agent (Lead-szűrő, Kommunikációs, Riport-író). A modul végén a saját 3-agent rendszered kész.',
    lessons: [
      { position: 1, title: 'Miért nem egy agent csinál mindent — szerepek és felelősség',
        body: `<p>Az első ötlet általában: csináljunk egy nagy agent-et ami mindent megold. Rossz ötlet. Indok:</p>
<ul>
<li><strong>Hosszú system prompt = hibázás.</strong> Egy 2000 szavas prompt ami "ha lead jön akkor szűrd, ha kérdés jön akkor válaszolj, ha vasárnap reggel van akkor riportot küldj" — szét fog esni. A modell hol az egyikre koncentrál, hol a másikra.</li>
<li><strong>Költség.</strong> Egy ilyen agent minden hívásnál drágább modellt használ (mert komplexebb feladatra van tervezve). Pedig a lead-szűréshez Haiku is elég, csak a kommunikációhoz kell Sonnet.</li>
<li><strong>Karbantartás.</strong> Ha valamit változtatsz, mindenre hat. Külön agent-ek esetén csak egyet módosítasz.</li>
</ul>
<p>A jobb megoldás: <strong>3 specializált agent</strong>, mindegyiknek 1 szerep, 1 prompt, 1 feladat. Egymás közt egy közös memóriában (Supabase) beszélnek.</p>
<p>Ez a "team-of-experts" minta. Ugyanaz mint egy kis irodában: nincs egy ember aki mindent csinál — van egy aki szűr, egy aki kommunikál, egy aki riportoz.</p>` },
      { position: 2, title: 'Az Expert Flow 6 agent példa — referencia architektúra',
        body: `<p>A saját rendszerem (Solo Business Hermes) 7 agent-tel működik. Ezt nem kell most lemásolnod, de jó látni hova fut ki a rendszer.</p>
<ul>
<li><strong>Anna (Orchestrator)</strong> — Telegram bot, ide írok én. Eldönti melyik sub-agent-nek kell delegálni.</li>
<li><strong>Security</strong> — kódbázis biztonsági review.</li>
<li><strong>Personal</strong> — naptár, jegyzetek, Drive.</li>
<li><strong>Client</strong> — ügyfélkommunikáció, Cal.com, email.</li>
<li><strong>YouTube</strong> — videó pipeline, transcript, cím-leírás generálás.</li>
<li><strong>Reception</strong> — weboldali voice agent backend, beérkező megkeresések.</li>
<li><strong>Sustainability</strong> — fenntarthatóság-kutatás (saját brand).</li>
</ul>
<p>Mindegyiknek saját Claude session-je, saját rendszer-promptja, saját MCP server-csatlakozása (Google Workspace, Cal.com, Telegram). Anna nevében szólnak vissza emoji-prefixszel (🛡️, 📋, 👋, 📺, 📞, 🌱).</p>
<p>NEKED most nem kell 7. A te első multi-agent rendszered 3 agent-tel indul.</p>` },
      { position: 3, title: 'A saját 3 ügynököd — Lead-szűrő, Kommunikációs, Riport-író',
        body: `<p>A minimum életképes multi-agent rendszer szolgáltatónak:</p>
<p><strong>1. Lead-szűrő agent</strong></p>
<ul>
<li>Bemenet: új űrlap-kitöltés, chat-megkeresés, DM.</li>
<li>Szerep: 1-10 score, "ki vagy mi" rövid összegzés.</li>
<li>Kimenet: Supabase lead tábla + Telegram értesítés ha 7+.</li>
<li>Modell: Haiku (olcsó, gyors, elég jó score-oláshoz).</li>
</ul>
<p><strong>2. Kommunikációs agent</strong></p>
<ul>
<li>Bemenet: élő chat üzenet a weboldalon vagy Telegram-on.</li>
<li>Szerep: GYIK-válasz, foglalás-ajánlat, eskaláció hozzád ha komplex.</li>
<li>Kimenet: válasz a felhasználónak + Cal.com link ha aktuális.</li>
<li>Modell: Sonnet (jobb nyelvtan, hosszabb beszélgetés-emlékezet).</li>
</ul>
<p><strong>3. Riport-író agent</strong></p>
<ul>
<li>Bemenet: heti 1x cron, lekérdezi a Supabase lead + beszélgetés táblákat.</li>
<li>Szerep: 5 mondatos összefoglaló neked. "Múlt héten X lead, Y komoly, Z foglalás. Top téma: ..."</li>
<li>Kimenet: Telegram üzenet vagy email neked, minden hétfő reggel 8-kor.</li>
<li>Modell: Sonnet (összefoglalás minőséghez kell).</li>
</ul>
<p>Ez a hármas a kurzus végére mind futni fog a saját rendszereden.</p>` },
      { position: 4, title: 'Hogyan beszélnek egymással — state, hand-off, kontextus átadás',
        body: `<p>A 3 agent egymással NEM közvetlenül beszél (nincs API hívás agent-ből agent-be). Helyette egy <strong>közös memória</strong> van: Supabase.</p>
<p>Példa flow:</p>
<ol>
<li><strong>Lead-szűrő agent</strong> beír egy új sort a <code>leads</code> táblába: <code>{ name, email, score: 8, status: 'qualified' }</code>.</li>
<li><strong>Kommunikációs agent</strong>, amikor új chat-üzenet jön, mielőtt válaszol, lekéri ugyanennek az email-nek a lead-jét: "Á, ez egy 8-as score-os érdeklődő, ő már látta a Cal.com linket?". Eszerint hangol.</li>
<li><strong>Riport-író agent</strong>, vasárnap este, lekérdezi az egész hét adatait mindkét táblából (<code>leads</code>, <code>chats</code>), és összeáll a heti riport.</li>
</ol>
<p>Ez a <strong>state-pattern</strong>: minden agent ír és olvas ugyanabból a központi DB-ből. Nem kell összetett message-passing protokol — a Supabase a "fekete tábla" amire mindenki felír és olvas.</p>
<p>A hand-off (átadás) is ezen keresztül megy: ha a Kommunikációs agent eldönti hogy ez a beszélgetés komplex és kell rád eskalálni, beír egy sort a <code>escalations</code> táblába → cron lefuttatja a Telegram értesítést neked.</p>` },
    ],
  },
  {
    position: 5,
    title: 'Önfejlesztő agent — feedback loop',
    description: 'Az agent statikusan rohad ha nem tanul. Itt megtanulod hogyan méred, mit logolj, és hogyan frissítsd a prompt-okat heti ritmusban. A modul végén tudod mikor cseréld le a modellt (Haiku → Sonnet → Opus).',
    lessons: [
      { position: 1, title: 'Mit jelent "önfejlesztő" — a feedback loop logikája',
        body: `<p>"Önfejlesztő agent" nem azt jelenti hogy az AI magától okosabb lesz. Azt jelenti hogy van egy <strong>visszacsatolási rendszer</strong> amivel TE rendszeresen javítod a működést.</p>
<p>A loop 4 lépéses:</p>
<ol>
<li><strong>Mérés</strong> — minden agent-hívás logolva van. Mit kérdeztek, mit válaszolt, helyes volt-e (vagy panasz jött rá).</li>
<li><strong>Áttekintés</strong> — hetente 30 perc, átolvasod az utolsó 50-100 beszélgetést. Hol esett szét? Hol mondott rosszat?</li>
<li><strong>Javítás</strong> — a system prompt-ot frissíted az új mintákkal. "Ha ezt kérdezi, ezt válaszold." vagy "Soha ne mondj olyat hogy X."</li>
<li><strong>Új verzió bevetése</strong> — push a Vercel-re, és az új prompt él. A következő hét megint mérés.</li>
</ol>
<p>Ez nem AI-magic — ez ipari mérés-iteráció. Az "önfejlesztés" abból jön hogy a rendszer mindig rögzíti a saját hibáit, és te ezeket havi szinten 20-30%-kal csökkented.</p>
<p>3-4 hónap múlva az agent-ed a saját ügyfeleidre van hangolva. Senki más nem tudja lemásolni.</p>` },
      { position: 2, title: 'Mérés — PostHog event-ek a 3 alapra',
        body: `<p>Mit kell mérni? Ne mindent — pont 3 dolgot, ami megmutatja működik-e a rendszer.</p>
<p><strong>PostHog event-ek (ingyenes 1M event/hó):</strong></p>
<ol>
<li><code>chat_message_sent</code> — valaki beír valamit. Property: <code>{ source: 'web' | 'telegram', user_msg_length }</code>. Megmutatja: mennyien érdeklődnek?</li>
<li><code>lead_qualified</code> — az AI 7+ score-t adott. Property: <code>{ score, lead_id }</code>. Megmutatja: hány komoly?</li>
<li><code>calcom_booked</code> — a Cal.com webhook visszajelez hogy foglalás történt. Property: <code>{ lead_id, slot }</code>. Megmutatja: hány foglalt?</li>
</ol>
<p>Két konverziós arány érdekel:</p>
<ul>
<li><strong>Chat → Qualified</strong> (hány érdeklődőből lesz komoly) — egészséges: 30-50%.</li>
<li><strong>Qualified → Booked</strong> (hány komolyból foglal) — egészséges: 40-60%.</li>
</ul>
<p>Ha az első alacsony: az agent túl szigorú a szűrésben (vagy az ügyfeleid valóban nem komolyak — akkor a marketing baj). Ha a második alacsony: rossz a Cal.com link kommunikációja, vagy a foglalási rendszer.</p>` },
      { position: 3, title: 'Iteráció — heti review és prompt-frissítés',
        body: `<p>Heti rutin (30 perc, péntek vagy hétfő reggel):</p>
<p><strong>1. PostHog dashboard megnyitása.</strong> Megnézed a 2 konverziós arányt. Esett-e múlt héthez képest? Ha igen, miért?</p>
<p><strong>2. Az utolsó 20 chat-beszélgetés átolvasása</strong> (Supabase chat tábla). Keresel:</p>
<ul>
<li>Olyan kérdést amit az agent nem értett meg.</li>
<li>Olyan választ amit kellett volna ESKALÁLNI hozzád, de az agent megválaszolt rosszul.</li>
<li>Visszatérő mintát — pl. "5 ember kérdezett árat csütörtökön és mindegyik elment válasz nélkül".</li>
</ul>
<p><strong>3. System prompt update.</strong> A felfedezett 3-5 hibára kiegészítés. Egy-egy mondat új utasítás. Pl.:</p>
<ul>
<li>"Ha az ügyfél áfás számlát kérdez, mondd hogy én KATA-s vagyok és számlázz.hu-n állítok ki."</li>
<li>"Ha valaki első konzultációt kér de a Cal.com link nem nyílik meg neki, küldd el az emailemet közvetlen."</li>
</ul>
<p><strong>4. Push és élesítés.</strong> 5 perc.</p>
<p>Ez minden héten. Egy év alatt az agent-ed 50-szer fejlődik. Eleinte sok hiba, később alig.</p>` },
      { position: 4, title: 'Modell-választás — Haiku, Sonnet, Opus, mikor melyik',
        body: `<p>Nem ugyanazt a modellt kell használnod minden agent-hez. A három Claude modell ára és sebessége nagyon különbözik:</p>
<ul>
<li><strong>Haiku 4.5</strong> — 0.8 $ / 1M input token. Gyors (~500 ms). Egyszerű döntésekhez, score-oláshoz, kategorizáláshoz. Itt fut a <strong>Lead-szűrő agent</strong>.</li>
<li><strong>Sonnet 4.6</strong> — 3 $ / 1M input token. Jó nyelvtan, hosszú kontextus, jobb döntések. Itt fut a <strong>Kommunikációs agent</strong> és a <strong>Riport-író agent</strong>.</li>
<li><strong>Opus 4.7</strong> — 15 $ / 1M input token. A legjobb, a legdrágább. Csak komplex elemzéshez (jogi vélemény-vázlat, hosszú dokumentum összefoglaló). <strong>Live agent-hez NE használd</strong> — nem éri meg.</li>
</ul>
<p>Trükk: kezdj Haiku-val. Ha az adott agent rendszeresen rosszul dönt, próbáld ki Sonnet-tel ugyanazokkal a teszt-kérdésekkel. Ha látható javulás → cseréld le. Ha nem → maradj Haiku-n.</p>
<p>Költség becslés szolgáltatónál (heti 30-50 érdeklődő): Haiku-val 50-200 Ft / hó. Sonnet-tel 500-2000 Ft / hó. A Cloudflare Stream és a Vercel ingyenes tier elviszi a többit.</p>` },
    ],
  },
  {
    position: 6,
    title: 'AI Operations System — a teljes rendszer',
    description: 'Itt összerakjuk az egészet egy működő rendszerré: 3 pillér × 3 agent, monitoring, költség-tracking. A modul végén tudod mikor érdemes az AI Operations retainerre upgrade-elni — vagy a sajátodat üzemeltetni tovább.',
    lessons: [
      { position: 1, title: 'Az AI Operations System térképe — 3 pillér × 3 agent',
        body: `<p>Az "AI Operations System" nem új technológia — egy szerkezet. 3 pillér, és mindegyik pilléren 1-3 agent dolgozik. Itt a térkép amit a kurzusig felépítettél:</p>
<p><strong>Pillér 1 — Ügyfélszerzés (Lead → Foglalás)</strong></p>
<ul>
<li>Lead-szűrő agent (Modul 2-3-ban épült)</li>
<li>Kommunikációs agent — első ajánlat / Cal.com ajánlás</li>
</ul>
<p><strong>Pillér 2 — Ügyfélkiszolgálás</strong></p>
<ul>
<li>Kommunikációs agent — élő chat GYIK + eskaláció</li>
<li>Email-followup agent (opcionális, később)</li>
</ul>
<p><strong>Pillér 3 — Háttérműködés (Mérés + Riport)</strong></p>
<ul>
<li>Riport-író agent (Modul 4-ben épült)</li>
<li>Költség-tracker (opcionális — havi költségek log)</li>
</ul>
<p>A 3 pillér ugyanazon a Supabase adatbázison osztozik. Egyetlen domain: a saját <code>te-vallakozasod.hu</code> alá kerülnek a /chat és /admin oldalak. A Telegram bot pedig értesít.</p>
<p>Ez most már 3 agent (vagy 4) — egy szolgáltatóhoz éppen elég. A 7. agent (Personal, YouTube stb.) már az én rendszerem — neked nem kell.</p>` },
      { position: 2, title: 'Bevetés élesben — domain, biztonság, monitoring',
        body: `<p>A 30. napon élesíted. Checklist:</p>
<p><strong>Domain</strong></p>
<ul>
<li>Vercel projekt → Custom Domain → <code>te-vallakozasod.hu</code> vagy <code>ai.te-vallakozasod.hu</code>.</li>
<li>DNS A-record vagy CNAME, ahogy a Vercel kéri.</li>
</ul>
<p><strong>Biztonság</strong></p>
<ul>
<li>Az API endpointokra Bearer auth (<code>CRON_SECRET</code> env változó). A chat endpoint hitelesítés nélkül publikus marad, de rate-limit Supabase-ben.</li>
<li>Webhook-okat HMAC-szel írj alá (Cal.com és Telegram is támogatja).</li>
<li>Supabase RLS bekapcsolva, csak <code>service_role</code>-nak van hozzáférés.</li>
<li>Soha NE commitold a <code>.env.local</code>-t a Git-be (gitignore!).</li>
</ul>
<p><strong>Monitoring</strong></p>
<ul>
<li>PostHog dashboard fent leírt 3 event-tel.</li>
<li>Vercel Analytics — havi tabló.</li>
<li>Telegram értesítés ha az agent leáll (cron health-check, ha 24 órán át nincs új lead, küldjön egy "minden rendben?" üzit).</li>
</ul>
<p>Ezt egy estében meg tudod csinálni a meglévő alapok mellett.</p>` },
      { position: 3, title: 'Költségek és mérőszámok — mennyi pénz, mennyi érték',
        body: `<p>A teljes AI Operations System havi költsége egy 1-fős szolgáltatónál:</p>
<ul>
<li>Vercel Hobby plan — 0 Ft</li>
<li>Supabase Free → Pro (ha kell) — 0-7000 Ft</li>
<li>Cal.com Free — 0 Ft</li>
<li>Claude API (Haiku + Sonnet mix) — 200-2000 Ft</li>
<li>PostHog Free — 0 Ft</li>
<li>Domain — 5-15 ezer Ft / év (havi 500-1500 Ft)</li>
</ul>
<p><strong>Összesen: 700-10000 Ft / hó</strong> attól függően mekkora a forgalom. Egy érdeklődőnként durván 5-50 Ft.</p>
<p>Mit jelent ez gyakorlatban? Ha az agent az első hónapban EGY komoly ügyfelet hoz aki 50 ezer Ft-os szolgáltatást fizet, már megtérült 5x-7x. Hatékonyság mérőszámként:</p>
<ul>
<li><strong>Idő-megtakarítás</strong>: heti 3-5 óra (lead-szűrés + GYIK + riport-készítés manuális helyett). Évente ~150-250 óra.</li>
<li><strong>Konverzió-nővekedés</strong>: 24/7 elérhetőség = több lead, gyorsabb válasz = jobb konverzió. Mérhetően általában +15-30% lead-to-booking.</li>
</ul>` },
      { position: 4, title: 'Mikor upgrade-elj — AI Operations retainer vs DIY',
        body: `<p>A 30. nap végén két irány:</p>
<p><strong>Marad DIY (a saját kezedben)</strong></p>
<ul>
<li>Van időd havi 2-4 órát rákölteni karbantartásra.</li>
<li>Kedveled a kódolást, és tovább akarsz fejleszteni.</li>
<li>A költségvetésed feszített, nem fér bele 200k+ Ft havi.</li>
</ul>
<p><strong>Upgrade AI Operations retainer-re</strong></p>
<ul>
<li><strong>120 ezer Ft / hó alapcsomag</strong> — 1 rendszer karbantartása, havi 1 review meeting. Akkor jó ha működik a rendszer és csak figyelni kell.</li>
<li><strong>220 ezer Ft / hó</strong> — 2-3 rendszer, kétheti review, prioritás email-támogatás. Akkor jó ha bővítenéd (új agent, új workflow).</li>
<li><strong>450 ezer Ft / hó</strong> — teljes AI ops, heti meeting, ad hoc support, új features. Akkor jó ha skálázol és ez nem a te szakmád.</li>
</ul>
<p>Egyszerű döntési kérdés: <em>"A havi 2-4 óra karbantartás többet vagy kevesebbet ér mint 120 ezer Ft?"</em> Ha az időd 30 ezer Ft / óra, akkor 4 óra = 120 ezer = pont annyi. Ha az időd 50 ezer Ft / óra, már az alapcsomag is megéri.</p>
<p>Foglalj egy 30 perces díjmentes konzultációt Cal.com-on ha tovább akarsz beszélni róla.</p>` },
    ],
  },
];

// ─── Futtatás ────────────────────────────────────────────────────────
async function run() {
  console.log('Kurzus keresése:', SLUG);
  const courses = await get(`courses?slug=eq.${SLUG}&select=id`);
  if (!courses.length) { console.error('Nincs ilyen kurzus.'); process.exit(1); }
  const courseId = courses[0].id;
  console.log('  Kurzus ID:', courseId);

  // 1. CLEANUP — összes meglévő modul törlése (cascade: lessons + progress is megy)
  console.log('\n1. Régi modulok törlése (cascade-del: leckék, progress is megy)...');
  const existing = await get(`course_modules?course_id=eq.${courseId}&select=id,position`);
  console.log(`   Talált: ${existing.length} modul`);
  if (existing.length) {
    await del(`course_modules?course_id=eq.${courseId}`);
    console.log('   Törölve.');
  }

  // 2. Course frissítés
  console.log('\n2. Course mező-frissítés (title, subtitle, description)...');
  await patch(`courses?slug=eq.${SLUG}`, {
    title: NEW_TITLE,
    subtitle: NEW_SUBTITLE,
    description: NEW_DESCRIPTION,
    published: true,
  });
  console.log('   Frissítve.');

  // 3. Új modulok + leckék
  console.log('\n3. Új modulok és leckék létrehozása...');
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
      console.log(`      + ${m.position}.${l.position} ${l.title}`);
      lc++;
    }
  }
  console.log(`\nKész. ${mc} modul / ${lc} lecke beillesztve.`);
}

run().catch(e => { console.error('HIBA:', e.message); process.exit(1); });
