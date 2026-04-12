import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'habitat';
const APP_NAME  = 'HABITAT';
const TAGLINE   = 'deep work, compounded daily';
const ARCHETYPE = 'habit-tracker';
const PROMPT    = 'Light warm-cream habit tracker for deep workers. Bento grid layout + editorial typography inspired by Awwwards nominees (Corentin Bernadou Portfolio, Unseen Studio Wrapped) and Linear\'s clean productivity UI on DarkModeDesign.com. 5 screens: Today, Streaks, Focus Timer, Journal, Weekly Review.';

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

// Fetch current queue
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
  design_url: `https://ram.zenbin.org/${SLUG}`,
  viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
  mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: PROMPT,
  screens: 5,
  theme: 'light',
  palette: { bg: '#F7F4EF', accent: '#E8490A', accent2: '#2A6B8C' },
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

console.log('Gallery queue:', putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 120));

// Index in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
const db = openDB();
upsertDesign(db, newEntry);
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
