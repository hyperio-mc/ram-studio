// mare-queue.mjs — Add MARE to gallery queue + index in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import https from 'https';
import fs from 'fs';

const config  = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN   = config.GITHUB_TOKEN;
const REPO    = config.GITHUB_REPO;

const SLUG      = 'mare';
const APP_NAME  = 'MARE';
const TAGLINE   = 'Sleep Intelligence Platform';
const ARCHETYPE = 'sleep-health-wearable';
const PROMPT    = 'Design a sleep intelligence mobile app inspired by Dark Mode Design\'s Cecilia (matte 3D sculptural orbs on pure black + centered bold display type) and Muradov (MEGA full-width display type). Ultra-dark midnight UI (#06080F) with bioluminescent green accent (#00E5A0). Five screens: sleep score with sculptural orb viz, stage breakdown hypnogram, 30-day trends, HRV recovery signals, and a wind-down protocol coach.';

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

// ─── GitHub queue update ─────────────────────────────────────────────────────
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

const fileData   = JSON.parse(getRes.body);
const currentSha = fileData.sha;
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
  prompt:       PROMPT,
  screens:      5,
  source:       'heartbeat',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody    = JSON.stringify({
  message:  `add: ${APP_NAME} to gallery (heartbeat)`,
  content:  newContent,
  sha:      currentSha,
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

console.log('Gallery queue:', putRes.status === 200 ? '✓ updated' : putRes.body.slice(0, 100));

// ─── Design DB index ─────────────────────────────────────────────────────────
const db = openDB();
upsertDesign(db, newEntry);
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
