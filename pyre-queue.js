#!/usr/bin/env node
// PYRE — Gallery queue + design DB indexing

const https = require('https');
const fs    = require('fs');

const config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

const SLUG      = 'pyre';
const APP_NAME  = 'PYRE';
const TAGLINE   = 'Measure what moves people';
const ARCHETYPE = 'brand-analytics';
const PROMPT    = 'Dark editorial brand analytics platform. Inspired by Format Podcasts (DarkModeDesign.com, Apr 2026) — warm amber photography on near-black #0E0202 with light-weight PS Times serif at 72px font-weight 350, cinematic brand language. Also Cardless (land-book.com) asymmetric layout with H1 occupying only left portion of viewport. Design concept: treat brand analytics with the quiet authority of a documentary film — amber ember palette (#080204 + #D4871C), Playfair Display at weight 300, cinematic ticker strip, editorial asymmetric stats. 6 screens: Pulse (brand health score + signal feed), Signals (top performers ranked), Creative (asset grid), Channels (platform breakdown + Venn overlap), Insights (AI observations with confidence), Report (weekly digest).';

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

(async () => {
  // ─── 1. Fetch current queue ──────────────────────────────────────────────
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

  if (getRes.status !== 200) {
    console.error('Failed to fetch queue:', getRes.status, getRes.body.slice(0,100));
    process.exit(1);
  }

  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  // ─── 2. Build new entry ──────────────────────────────────────────────────
  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      6,
    source:       'heartbeat',
    theme:        'dark',
    palette:      { bg:'#080204', accent:'#D4871C', accent2:'#7B4A2A', text:'#F0E6D3' },
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  // ─── 3. Push updated queue ───────────────────────────────────────────────
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

  console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : putRes.body.slice(0, 100));

  // ─── 4. Save entry locally ───────────────────────────────────────────────
  fs.writeFileSync('pyre-queue-entry.json', JSON.stringify(newEntry, null, 2));
  console.log('✓ pyre-queue-entry.json saved');

  return newEntry;
})().then(entry => {
  // ─── 5. Index in design DB ───────────────────────────────────────────────
  import('./design-db.mjs').then(({ openDB, upsertDesign, rebuildEmbeddings }) => {
    try {
      const db = openDB();
      upsertDesign(db, entry);
      rebuildEmbeddings(db);
      console.log('✓ Indexed in design DB');
    } catch(e) {
      console.log('DB index skipped:', e.message);
    }
  }).catch(e => console.log('DB module not available:', e.message));
}).catch(e => {
  console.error('Queue error:', e.message);
  process.exit(1);
});
