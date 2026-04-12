#!/usr/bin/env node
// VOID — GitHub gallery queue entry + design DB indexing
const https = require('https');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO = config.GITHUB_REPO;

const SLUG = 'void';
const APP_NAME = 'VOID';
const TAGLINE = 'Infrastructure topology for the dark web of services';
const ARCHETYPE = 'infra-monitor';
const ORIGINAL_PROMPT = 'Dark-mode infra topology visualizer. Nodes as metallic orbs connected by data-flow lines, inspired by Cecilia molecular sphere aesthetic on darkmodedesign.com and Midday utility-first dark SaaS. 5 screens: topology map, node detail, alert feed, trace waterfall, cluster config.';

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

async function main() {
  // ─── GET current queue ────────────────────────────────────────────────────
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
    design_url: `https://zenbin.org/p/${SLUG}`,
    viewer_url: `https://zenbin.org/p/${SLUG}-viewer`,
    mock_url: `https://zenbin.org/p/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
    palette: {
      bg: '#050505', surface: '#0D0D0D', text: '#F0EEE8',
      accent: '#00E5FF', accent2: '#7B61FF',
    },
    inspiration: 'Cecilia (darkmodedesign.com) — molecular sphere topology + Midday utility-dark SaaS',
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

  console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : `✗ ${putRes.body.slice(0, 100)}`);

  // ─── Save entry locally too ───────────────────────────────────────────────
  fs.writeFileSync('/workspace/group/design-studio/void-entry.json', JSON.stringify(newEntry, null, 2));
  console.log('Entry saved: void-entry.json');

  return newEntry;
}

main().then(e => {
  // ─── Design DB ─────────────────────────────────────────────────────────────
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = require('./design-db.cjs');
    const db = openDB();
    upsertDesign(db, e);
    rebuildEmbeddings(db);
    console.log('Design DB: ✓ Indexed');
  } catch (err) {
    // Try mjs version
    import('./design-db.mjs').then(({ openDB, upsertDesign, rebuildEmbeddings }) => {
      const db = openDB();
      upsertDesign(db, e);
      rebuildEmbeddings(db);
      console.log('Design DB: ✓ Indexed (mjs)');
    }).catch(e2 => console.log('Design DB: skip —', e2.message.slice(0,60)));
  }
}).catch(e => { console.error(e); process.exit(1); });
