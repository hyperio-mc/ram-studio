/**
 * mill-db.mjs — Gallery queue + design DB for MILL
 */
import { createRequire } from 'module';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const require = createRequire(import.meta.url);
const https   = require('https');
const fs      = require('fs');

const config  = JSON.parse(fs.readFileSync('community-config.json', 'utf8'));
const TOKEN   = config.GITHUB_TOKEN;
const REPO    = config.GITHUB_REPO;

const SLUG      = 'mill';
const APP_NAME  = 'MILL';
const TAGLINE   = 'set tasks in motion';
const ARCHETYPE = 'ai-task-orchestrator';
const ORIGINAL_PROMPT = 'Light-theme personal AI task orchestrator. Delegate to agents in natural language. Inspired by JetBrains Air (lapa.ninja, 2026) — light functional agent UI, and Old Tom Capital (minimal.gallery, 2026) — warm paper ledger editorial serif aesthetic. Warm parchment #F5F1EB + forest green #2D6A4F + amber #C4741A. 5 screens: Home dashboard, Tasks board, Agents roster, New task input, Insights analytics.';

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

// ── 1. Gallery queue ───────────────────────────────────────────────────────
console.log('Updating gallery queue…');

const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: {
    'Authorization': `token ${TOKEN}`,
    'User-Agent':    'ram-heartbeat/1.0',
    'Accept':        'application/vnd.github.v3+json',
  },
});

const fileData      = JSON.parse(getRes.body);
const currentSha    = fileData.sha;
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
  mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody    = JSON.stringify({
  message: `add: ${APP_NAME} to gallery (heartbeat)`,
  content: newContent,
  sha:     currentSha,
});

const putRes = await ghReq({
  hostname: 'api.github.com',
  path:     `/repos/${REPO}/contents/queue.json`,
  method:   'PUT',
  headers: {
    'Authorization':  `token ${TOKEN}`,
    'User-Agent':     'ram-heartbeat/1.0',
    'Content-Type':   'application/json',
    'Content-Length': Buffer.byteLength(putBody),
    'Accept':         'application/vnd.github.v3+json',
  },
}, putBody);

console.log('Gallery queue:', putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 100));

// ── 2. Design DB ───────────────────────────────────────────────────────────
console.log('Indexing in design DB…');

const db = openDB();
upsertDesign(db, { ...newEntry });
rebuildEmbeddings(db);
console.log('Design DB: indexed ✓');

console.log('\nAll done for MILL:');
console.log('  Hero    → https://ram.zenbin.org/mill');
console.log('  Viewer  → https://ram.zenbin.org/mill-viewer');
console.log('  Mock    → https://ram.zenbin.org/mill-mock');
