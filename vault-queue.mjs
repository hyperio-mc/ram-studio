import https from 'https';
import fs from 'fs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'vault';
const APP_NAME  = 'VAULT';
const TAGLINE   = 'Your most important thoughts, held in darkness.';
const ARCHETYPE = 'private-archive-dark';
const PROMPT    = 'Design a dark-mode personal private archive app. Pure black canvas #030303, warm paper text #E6E1D6, candlelight yellow accent #FFE566, teal #2DD4BF for security. Inspired by Antinomy Studio (awwwards SOTD) — pure black bg, giant display type as typographic events, live mono clock strip at bottom, asterisk accent. 5 screens: entry list (12 sealed entries as big typographic titles with category tags), open entry (40px display title on black, prose body), write screen (ghost title placeholder, candle cursor, category chips, SEAL button), search (candle-lit match highlights), security (AES-256 status hero, biometric toggles, decoy mode, danger zone).';

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  },
});

const fileData  = JSON.parse(getRes.body);
const currentSha = fileData.sha;
const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

let queue = JSON.parse(currentContent);
if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];

const newEntry = {
  id: `heartbeat-${SLUG}-${Date.now()}`,
  status: 'done',
  app_name: APP_NAME,
  tagline: TAGLINE,
  archetype: ARCHETYPE,
  design_url: `https://zenbin.org/p/${SLUG}`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: PROMPT,
  screens: 5,
  source: 'heartbeat',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody = JSON.stringify({
  message: `add: ${APP_NAME} to gallery (heartbeat)`,
  content: newContent,
  sha: currentSha,
});

const putRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'PUT',
  headers: {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(putBody),
    'Accept': 'application/vnd.github.v3+json',
  },
}, putBody);

console.log('Gallery queue:', putRes.status === 200 ? `OK ✓ (${queue.submissions.length} total)` : putRes.body.slice(0, 120));

try {
  const db = openDB();
  upsertDesign(db, newEntry);
  rebuildEmbeddings(db);
  console.log('Design indexed in DB ✓');
} catch (e) {
  console.log('DB index skipped:', e.message);
}

console.log(`\n✓ VAULT complete`);
console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
console.log(`  Stable:  https://zenbin.org/p/${SLUG}`);
