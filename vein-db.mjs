// vein-db.mjs — VEIN gallery queue + design DB indexing

import https from 'https';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'vein';
const APP_NAME  = 'VEIN';
const TAGLINE   = 'Biometric intelligence, alive in the dark';
const ARCHETYPE = 'health-dark';
const PROMPT    = 'Dark biometric intelligence mobile app. Warm obsidian + ember amber glow palette. Inspired by Neon\'s luminous data-bar visualization (darkmodedesign.com) and Superpower\'s premium health-tech warmth (godly.website). First warm-toned dark palette for RAM.';

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ── Step 1: GitHub gallery queue ──────────────────────────────────────────────
console.log('Adding to gallery queue...');
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
  design_url: `https://ram.zenbin.org/${SLUG}`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: PROMPT,
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
  palette: 'warm-obsidian-ember-amber',
  inspiration: 'Neon (darkmodedesign.com), Superpower (godly.website)',
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

console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));

// ── Step 2: Design DB ─────────────────────────────────────────────────────────
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('Indexed in design DB');
} catch(e) {
  console.log('Design DB skipped:', e.message);
}

console.log(`\nVEIN fully published:`);
console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
