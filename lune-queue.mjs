import https from 'https';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'lune';
const APP_NAME  = 'Lune';
const TAGLINE   = 'Sleep intelligence, felt not tracked.';
const ARCHETYPE = 'wellness-ai';
const ORIGINAL_PROMPT = 'Light warm humanistic AI sleep intelligence app. Inspired by Dawn (joindawn.com) — warm cream rgb(251,243,235) bg, Source Serif Pro serif typography, earth-tone color palette. Trend: Warm Humanistic AI aesthetic — the antithesis of cold clinical tech UI. Screens: Tonight forecast, Last Night review, 30-day Patterns, AI Insights journal, Wind Down ritual, Onboarding.';

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
  }
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
  viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: ORIGINAL_PROMPT,
  screens: 6,
  source: 'heartbeat',
  theme: 'light',
  palette: '#FAF4ED / #C4622D / #7B9E87 / #9B6B9A',
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

console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 200));

// ─── Index in design DB ────────────────────────────────────────────────────────
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('Indexed in design DB');
} catch (e) {
  console.log('DB index skipped:', e.message);
}
