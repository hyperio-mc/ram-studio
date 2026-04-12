// sera-queue.mjs — add SÉRA to gallery queue and design DB

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'sera-app';
const APP_NAME  = 'SÉRA';
const TAGLINE   = 'Luxury longevity concierge for modern executives';
const ARCHETYPE = 'wellness-luxury-concierge';
const ORIGINAL_PROMPT = 'Luxury wellness & longevity platform for modern executives — LIGHT editorial theme. Inspired by Atlas Card (godly.website — cinematic section-by-section scroll, each feature owns a full screen, all-caps nav, luxury editorial white space) + Opal Camera (ultra-clean minimal light product UI) + Midday.ai (darkmodedesign.com — feature walkthrough hierarchy, AI-assisted workflows). Warm parchment cream + champagne gold + deep espresso palette. Aesop meets Whoop.';

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

// ── GitHub Queue ──────────────────────────────────────────────────────────────
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
  screens:      10,
  source:       'heartbeat',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody    = JSON.stringify({
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

console.log('Gallery queue updated:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

// ── Design DB ─────────────────────────────────────────────────────────────────
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('Indexed in design DB');
} catch (e) {
  console.log('Design DB skip:', e.message);
}
