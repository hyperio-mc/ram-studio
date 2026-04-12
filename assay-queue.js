// assay-queue.js — push ASSAY to gallery queue + index in DB

import https from 'https';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'assay';
const APP_NAME  = 'ASSAY';
const TAGLINE   = 'precision biomedical research platform';
const ARCHETYPE = 'healthtech-research';
const PROMPT    = 'Inspired by ZettaJoule (Awwwards HM Mar 2026) — ice-blue palette #D3E7FF, 3D schematic precision, industrial technical aesthetic; Mixpanel (Godly.website featured Mar 2026) — AI-first analytics, numbered 01-05 step progression, clean light SaaS UI. Light theme. Biomedical research tracking platform. Ice-blue #EBF3FF background, white surfaces, deep navy #0A1628 text, electric blue #1155EE accent, clinical teal #00B8A0 secondary. Numbered navigation (01–05: Overview, Trials, Markers, Analysis, Team). DM Serif Display + DM Mono + DM Sans. ZettaJoule-style diagram grid lines in hero. Confidence scoring bars on AI insights screen. Sparkline biomarker trends. 5 screens: Overview (study metrics + active studies list + AI strip + weekly bars), Trials (phase filter + 3 trial cards with stage dot timeline + enrollment progress), Biomarkers (4 markers with sparklines: IL-6/CRP/TNF-α/CD4), AI Analysis (dark hero card + confidence bars + pattern detection list), Team (4 members with status + activity feed).';

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

// ─── Gallery queue ──────────────────────────────────────────────────────────
console.log('📚 Updating gallery queue...');
const headers = {
  'Authorization': `token ${TOKEN}`,
  'User-Agent': 'ram-heartbeat/1.0',
  'Accept': 'application/vnd.github.v3+json'
};

const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET', headers
});
const fileData = JSON.parse(getRes.body);
const sha = fileData.sha;
const current = Buffer.from(fileData.content, 'base64').toString('utf8');

let queue = JSON.parse(current);
if (Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at:new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];

// Remove any existing assay entry
queue.submissions = queue.submissions.filter(s => s.id && !s.id.includes('assay'));

const now = new Date().toISOString();
const newEntry = {
  id: `heartbeat-${SLUG}-${Date.now()}`,
  status: 'done',
  app_name: APP_NAME,
  tagline: TAGLINE,
  archetype: ARCHETYPE,
  design_url: `https://zenbin.org/p/${SLUG}`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: now,
  published_at: now,
  credit: 'RAM Design Heartbeat',
  prompt: PROMPT,
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
};

queue.submissions.push(newEntry);
queue.updated_at = now;

const encoded = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody = JSON.stringify({
  message: `feat: add ${APP_NAME} to gallery (heartbeat)`,
  content: encoded,
  sha
});
const putBuf = Buffer.from(putBody);
const putRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'PUT',
  headers: { ...headers, 'Content-Type':'application/json', 'Content-Length': putBuf.length }
}, putBuf);
console.log(`✓ Gallery queue updated: ${putRes.status===200||putRes.status===201?'OK':putRes.body.slice(0,100)}`);
console.log(`  Total entries: ${queue.submissions.length}`);

// ─── Save entry JSON ────────────────────────────────────────────────────────
fs.writeFileSync('assay-entry.json', JSON.stringify(newEntry, null, 2));
console.log('✓ Saved assay-entry.json');
