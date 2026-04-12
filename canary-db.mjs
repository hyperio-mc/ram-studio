// canary-db.mjs — gallery queue + design DB indexing for CANARY
import https from 'https';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'canary';
const APP_NAME  = 'CANARY';
const TAGLINE   = "know when they're inside";
const ARCHETYPE = 'deception-security';
const PROMPT    = `Inspired by Tracebit "The answer to Assume Breach" (land-book.com) and Darknode AI automation dark aesthetic (Awwwards). Dark deception security platform: canary token management and network honeypot visualization. Deep navy #070B14 + canary yellow #F5C842. 5 screens: Nest overview, Alert detail with attacker fingerprint, Canary network map, Threat Intel with MITRE ATT&CK coverage, and Deploy new canary token flow.`;

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

// ─── GitHub gallery queue ─────────────────────────────────────────────────────
async function updateGallery() {
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
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
    palette_primary: '#F5C842',
    palette_bg: '#070B14',
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
    note: 'Hero + mock saved locally; ZenBin at 100-page cap (resets 2026-04-23). Viewer live at ram.zenbin.org/canary-viewer.',
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

  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));
  return newEntry;
}

// ─── Design DB ────────────────────────────────────────────────────────────────
async function indexDB(entry) {
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, { ...entry });
    rebuildEmbeddings(db);
    console.log('Design DB: indexed');
  } catch (e) {
    console.log('Design DB: skipped —', e.message.slice(0, 60));
  }
}

const entry = await updateGallery();
await indexDB(entry);
console.log('✓ CANARY pipeline complete');
