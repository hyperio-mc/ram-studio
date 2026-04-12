// keel-queue.mjs — Add KEEL to gallery queue and design DB
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const config   = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname),'community-config.json'),'utf8'));
const TOKEN    = config.GITHUB_TOKEN;
const REPO     = config.GITHUB_REPO;

const SLUG      = 'keel';
const APP_NAME  = 'KEEL';
const TAGLINE   = 'Balance your business. Own your runway.';
const ARCHETYPE = 'freelance-finance-os';
const PROMPT    = 'Dark-mode freelance finance OS inspired by Midday.ai (darkmodedesign.com): transaction reconciliation with receipt-matching status badges, time tracking connected to invoicing, AI insight strip. Deep charcoal #0D1017 + electric indigo #4F72FF + warm amber #F5A430. 5 screens: Overview · Pipeline · Time · Cash Flow · Tax Reserve.';

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

// ── Fetch current queue
const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
const putRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'PUT',
  headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
}, putBody);
console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0,120));

// ── Index in design DB
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, newEntry);
  rebuildEmbeddings(db);
  console.log('Indexed in design DB');
} catch(e) {
  console.log('DB index skipped:', e.message);
}
