/**
 * HAUNT — gallery queue + design DB indexer
 */
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG     = 'haunt';
const APP_NAME = 'HAUNT';
const TAGLINE  = 'Your favourite local haunts, remembered';
const ARCHETYPE = 'dining-journal';

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

// ─── GitHub queue ─────────────────────────────────────────────────────────────
const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
});
const fileData = JSON.parse(getRes.body);
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
  design_url:  `https://ram.zenbin.org/${SLUG}`,
  viewer_url:  `https://ram.zenbin.org/${SLUG}-viewer`,
  mock_url:    `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dining discovery and restaurant journal app. LIGHT theme — warm cream/terracotta palette. Challenge: asymmetric bento grid in mobile context (inspired by land-book.com bento landing pages), Georgia serif + Inter sans pairing (KO Collective, minimal.gallery), organic warmth from Superpower (godly.website). Five screens: Nearby bento, Place Detail, Journal, Lists, Log Visit.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
  palette_primary: '#C4622D',
  palette_bg: '#FAF7F2',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody = JSON.stringify({
  message: `add: HAUNT — Your favourite local haunts, remembered (heartbeat)`,
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

console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : `✗ ${putRes.body.slice(0, 120)}`);

// ─── Design DB ────────────────────────────────────────────────────────────────
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('Design DB: ✓ Indexed');
} catch (e) {
  console.log('Design DB: skipped —', e.message);
}
