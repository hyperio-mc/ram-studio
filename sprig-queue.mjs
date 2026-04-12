// SPRIG — GitHub queue + design DB indexing
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config    = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN     = config.GITHUB_TOKEN;
const REPO      = config.GITHUB_REPO;

const SLUG      = 'sprig';
const APP_NAME  = 'SPRIG';
const TAGLINE   = 'Revenue intelligence for indie makers';
const ARCHETYPE = 'analytics-dashboard';
const PROMPT    = 'Light-themed revenue intelligence dashboard for indie SaaS makers. Inspired by Cardless fintech (Land-book) and Minimal Gallery editorial whitespace. Warm off-white palette with forest green accent.';

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

// ─── 1. GITHUB GALLERY QUEUE ────────────────────────────────────────────
console.log('Updating GitHub gallery queue…');

const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  }
});

const fileData = JSON.parse(getRes.body);
const currentSha     = fileData.sha;
const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

let queue = JSON.parse(currentContent);
if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];

const newEntry = {
  id:           `heartbeat-${SLUG}-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      TAGLINE,
  archetype:    ARCHETYPE,
  design_url:   `https://ram.zenbin.org/${SLUG}`,
  viewer_url:   `https://ram.zenbin.org/${SLUG}-viewer`,
  mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       PROMPT,
  screens:      5,
  source:       'heartbeat',
  theme:        'light',
  palette: {
    bg:      '#F8F7F2',
    accent:  '#2D6A4F',
    accent2: '#52B788',
  },
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
  }
}, putBody);

console.log(`  GitHub queue: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 100)}`);

// ─── 2. DESIGN DB INDEX ─────────────────────────────────────────────────
console.log('Indexing in design DB…');
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('  DB: ✓ indexed');
} catch (e) {
  console.log('  DB: skipped (', e.message, ')');
}

console.log('\n✓ SPRIG pipeline complete');
console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
