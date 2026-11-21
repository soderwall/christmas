#!/usr/bin/env node
// Secret Santa draw. Reads participants/*.txt, draws, and bakes the result into index.html.
// Usage: node draw.mjs [year]
//
// Each family gets ONE random cycle through everyone (A->B->C->...->A), built from a
// cryptographically random shuffle. That guarantees nobody draws themselves, everyone
// gives exactly one gift and receives exactly one, and (for 3+ people) nobody gets a
// simple "swap" with the person who gave to them.

import { readFileSync, writeFileSync } from 'node:fs';
import { randomInt, randomBytes, pbkdf2Sync, createCipheriv, createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const year = Number(process.argv[2]) || new Date().getFullYear();

const FAMILIES = [
  { key: 'magnusson', name: 'Familjen Magnusson', budget: 600, file: 'participants/magnusson_participants.txt' },
  { key: 'soderwall', name: 'Familjen Söderwall', budget: 700, file: 'participants/soderwall_participants.txt' },
];

function readNames(file) {
  const names = readFileSync(join(root, file), 'utf8')
    .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length) throw new Error(`Duplicate names in ${file}: ${dupes.join(', ')}`);
  if (names.length < 2) throw new Error(`Need at least 2 names in ${file}`);
  return names;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawFamily(names) {
  const order = shuffle(names);
  const pairs = {};
  order.forEach((giver, i) => { pairs[giver] = order[(i + 1) % order.length]; });
  return pairs;
}

// People who are in more than one family give once per family. Re-draw until nobody
// gives to the same person twice (rejection sampling; the lists are tiny so it's instant).
const nameLists = FAMILIES.map((f) => readNames(f.file));
function sameRecipientTwice(all) {
  const seen = {};
  for (const pairs of all) {
    for (const [giver, receiver] of Object.entries(pairs)) {
      (seen[giver] ??= new Set());
      if (seen[giver].has(receiver)) return true;
      seen[giver].add(receiver);
    }
  }
  return false;
}
let drawn, attempts = 0;
do {
  if (++attempts > 100000) throw new Error('Could not find a valid draw; check the participant lists.');
  drawn = nameLists.map(drawFamily);
} while (sameRecipientTwice(drawn));

const families = {};
FAMILIES.forEach((f, i) => {
  const pairs = drawn[i];
  // sanity checks
  const givers = Object.keys(pairs), receivers = Object.values(pairs);
  if (givers.some((g) => pairs[g] === g)) throw new Error('Someone drew themself!');
  if (new Set(receivers).size !== givers.length) throw new Error('Receivers are not unique!');
  families[f.key] = { name: f.name, budget: f.budget, pairs };
});

// ---- Per-person encryption -------------------------------------------------------------
// Each person's assignment(s) are encrypted with AES-256-GCM, key = PBKDF2(secret code).
// Only someone holding that person's code (sent as a personal link) can read it.
const BASE_URL = process.env.BASE_URL || 'https://soderwall.github.io/christmas/';
const ITER = 250000;
const WORDS = `rudolf tomtemor tomtefar nisse tomtebloss risgrynsgröt pepparkaka glögg lussekatt julgran julstjärna julskinka janssons sill lutfisk
knäckebröd pomerans julafton kanelbulle snögubbe snöboll snöflinga polkagris adventsljus skridsko pulka kalleanka julkort julklapp paketband glitter
julkula lucia saffran mandel marsipan kola toffee choklad julmust julost vörtbröd apelsin klementin fikon dadlar russin kanel kardemumma ingefara
nejlika vanilj hallon lingon tranbär julros mistel tall gran kottar ekorre hare räv varg björn ren isbjörn pingvin vinter december rimfrost istapp
snödroppe vante halsduk mossa tofflor filt kudde brasa kamin ljuslykta lykta ljusstake lucialjus adventsstake julkrubba krubba herdar vise kungar
ängel klockor bjälla bjällra släde julbock halmbock julgalt tomtebod verkstad leksak nalle docka pussel kortspel brädspel godis lakrits gelehallon
skumtomte nougat daim ostkaka prinskorv köttbullar revbensspar rödkål rödbetor potatis brunkål senap doppigrytan äggtoddy snaps nubbe julsång
sångbok piano fiol trumpet orgel stjärnljus tomtebloss bengaler tarta rulltarta lussebullar mjukpepparkaka knäckebröd skinksmörgås risalamande
glasskulor julpynt gransmak julgransfot julgransljus tomtehatt tomteluva tomteskagg skagg röd gröna gyllene silver stjärnhimmel norrsken nordpolen
renskoter slaklapp snöskoter snöman snölykta snöbollskrig pulkabacke skidor skridskobana halka ishall tjockjacka mysbyxor kakao marshmallow
pepparkakshus pepparkaksdeg kakform glasyr strosocker mandelmassa saftsoppa knackebrodsmorgas julbord smörgåsbord glögg2 pastej leverpastej
sillinlagd gravad rökt lax rökelax
tomtebarn tomtekarra tomtegubbe tomtenissen tomtemuggen glittertomte vinterlov julledighet julrus julfrid julglad julstress julkram julklappsrim
julbak julgodis julfika julfest julmys julmarknad julgranskula julkrans dorrkrans adventskalender kalender lucialuvan lussefirande skolavslutning
gran2 granris halmstjärna papperstjärna pappersnisse pysselbord saxar klister karamell kolakaka chokladbit höstkaka jordgubbe kanelstång
rudolf björn julbord tomte ljus snö kyla mys fest dans sång klang hej hurra kram puss pynt band rosett papper tejp bok spel film kalas gåva klapp present paket skor strumpa tupplur lov natt raket glöd ugn deg bulle kaka tarta glass sylt saft kaffe mjölk gröt smör ost skinka korv kål bona hjärta ring hopp kana kalle anka boll hatt rödhatt kulor tomtar lussar stjärna svan ren ros jul
nyårsafton nyårsraket tolvslaget trettondagen knutdag pepparkakshjärta julgransplundring`.split(/\s+/).filter((w) => /^[a-zåäö]+$/.test(w) && w.length <= 7); // short words only
// Words keep their åäö for display; typing is forgiving (björn = bjorn), so the key uses the folded form.
const fold = (s) => s.toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]/g, '');
const UNIQUE_WORDS = [...new Map(WORDS.map((w) => [fold(w), w])).values()];
if (UNIQUE_WORDS.length < 30) throw new Error('word list too short');
// One short Christmas word per person (unique). Not super secret, just enough to stop casual peeking.
const usedCodes = new Set();
const makeCode = () => {
  let w;
  do { w = UNIQUE_WORDS[randomInt(UNIQUE_WORDS.length)]; } while (usedCodes.has(fold(w)));
  usedCodes.add(fold(w));
  return w;
};

// Non-secret lookup tag so the page can pick the right blob from a typed name (must match index.html).
const nameHash = (n) => createHash('sha256').update('santa:' + n.trim().toLowerCase()).digest('hex').slice(0, 12);
const everyone = [...new Set(Object.values(nameLists).flat())];
const links = [];
const blobs = everyone.map((name) => {
  const gifts = FAMILIES.filter((f) => families[f.key].pairs[name]).map((f) => ({
    family: f.name,
    budget: f.budget,
    to: families[f.key].pairs[name],
    pool: Object.keys(families[f.key].pairs).filter((n) => n !== name),
  }));
  const code = makeCode();
  links.push({ name, code });
  const salt = randomBytes(16), iv = randomBytes(12);
  const key = pbkdf2Sync(fold(code), salt, ITER, 32, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify({ name, gifts }), 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return { h: nameHash(name), s: salt.toString('base64'), i: iv.toString('base64'), c: ct.toString('base64') };
});
// shuffle so blob order doesn't reveal who is who
for (let i = blobs.length - 1; i > 0; i--) { const j = randomInt(i + 1); [blobs[i], blobs[j]] = [blobs[j], blobs[i]]; }

const payload = Buffer.from(JSON.stringify({ v: 3, year, iter: ITER, names: [...everyone].sort((a, b) => a.localeCompare(b, 'sv')), blobs }), 'utf8').toString('base64');
writeFileSync(
  join(root, 'links.txt'),
  `# Personliga länkar ${year}. SKICKA VARJE LÄNK PRIVAT TILL RÄTT PERSON. Committa aldrig den här filen.\n` +
    links.map((l) => `${l.name}\t${BASE_URL}#${encodeURIComponent(l.name)}~${l.code}\t(kod: ${l.code})`).join('\n') + '\n',
);
const htmlPath = join(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const re = /\/\*DRAW:START\*\/[\s\S]*?\/\*DRAW:END\*\//;
if (!re.test(html)) throw new Error('DRAW markers not found in index.html');
writeFileSync(htmlPath, html.replace(re, () => `/*DRAW:START*/${payload}/*DRAW:END*/`));

console.log(`🎅 Draw for ${year} baked into index.html`);
console.log(`🔑 Personal links written to links.txt (not committed). Send each one privately.`);
for (const f of FAMILIES) console.log(`   ${f.name}: ${Object.keys(families[f.key].pairs).length} participants`);
