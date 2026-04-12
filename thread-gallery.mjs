// thread-gallery.mjs — add THREAD to gallery queue + design DB
import { createRequire } from 'module';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
const require = createRequire(import.meta.url);
const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'thread';
const APP_NAME  = 'THREAD';
const TAGLINE   = 'Watch every agent think.';
const ARCHETYPE = 'observability';
const PROMPT    = 'AI agent observability platform — light editorial theme inspired by shed.design extreme typography, land-book.com trending agent tools (Runlayer, LangChain), and evervault.com single-accent B2B aesthetic. Warm parchment + electric indigo + acid chartreuse.';

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

// ── GitHub gallery queue ──────────────────────────────────────────────────────
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
  submitted_at:  new Date().toISOString(),
  published_at:  new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:        PROMPT,
  screens:       5,
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
const db = openDB();
upsertDesign(db, { ...newEntry });
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
