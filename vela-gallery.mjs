import https from 'https';
import fs from 'fs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const SLUG      = 'vela';
const APP_NAME  = 'VELA';
const TAGLINE   = 'work in rhythm, not in rows';
const ARCHETYPE = 'creative-sprint-rhythm';
const PROMPT    = 'Creative sprint rhythm app inspired by Interval for macOS (Land-book) "time as an instrument" philosophy. Light cream/paper palette with forest green + clay accents. 5 screens: Active Sprint timer, Flow Map, Projects, Rhythm Report, New Sprint setup.';

const config = JSON.parse(fs.readFileSync('community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

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

// ── GitHub queue ──────────────────────────────────────────────────────────────
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

console.log('Gallery queue:', putRes.status === 200 ? '✓ pushed' : putRes.body.slice(0, 100));

// ── Design DB ─────────────────────────────────────────────────────────────────
try {
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('Design DB: ✓ indexed');
} catch (e) {
  console.log('Design DB skipped:', e.message?.slice(0, 60));
}

console.log('\n✓ All done!');
console.log('  Hero:   https://ram.zenbin.org/vela');
console.log('  Viewer: https://ram.zenbin.org/vela-viewer');
console.log('  Mock:   https://ram.zenbin.org/vela-mock (pending rate limit reset)');
