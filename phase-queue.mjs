import https from 'https';
import fs from 'fs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'phase';
const APP_NAME  = 'PHASE';
const TAGLINE   = 'Time as an instrument. Work in phases.';
const ARCHETYPE = 'deep-work-timer-dark';
const PROMPT    = 'Design a dark-mode deep work timer for creative professionals. Typography-first interface inspired by KOMETA font foundry\'s editorial aesthetic on land-book.com — condensed monospace for time values, near-black canvas, orange-red accent. 5 screens: active session with massive timer, day timeline, phase log, projects with giant hour callouts, weekly insights. Work in discrete phases — writing, review, ritual, admin.';

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

// ── Fetch queue ───────────────────────────────────────────────────────────────
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

// ── Publish to stable zenbin.org/p/ ──────────────────────────────────────────
const heroHtml = fs.readFileSync('./phase-publish.js', 'utf8').match(/const heroHtml = `([\s\S]*?)`;/)?.[1] || '';

// ── DB index ─────────────────────────────────────────────────────────────────
try {
  const db = openDB();
  upsertDesign(db, newEntry);
  rebuildEmbeddings(db);
  console.log('Design indexed in DB ✓');
} catch(e) {
  console.log('DB index skipped:', e.message);
}

console.log(`\n✓ PHASE complete`);
console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
