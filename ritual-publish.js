// ritual-publish.js — Full Design Discovery pipeline for RITUAL heartbeat
const https = require('https');
const fs = require('fs');

const SLUG = 'ritual';
const VIEWER_SLUG = 'ritual-viewer';
const APP_NAME = 'RITUAL';
const TAGLINE = 'where drops meet discipline';
const ARCHETYPE = 'drop-culture-wellness';
const PROMPT = 'Inspired by Deon Libra (land-book.com) drop culture wellness brand + The Lookback SOTD (awwwards.com) bold condensed editorial typography. Dark drop-culture app where daily rituals unlock exclusive sneaker drops.';

function httpsReq(opts, body) {
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

async function publishToZenBin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const r = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': subdomain,
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
  return r;
}

async function fetchViewerTemplate() {
  const r = await httpsReq({ hostname: 'zenbin.org', path: '/p/pen-viewer-3', method: 'GET', headers: { 'User-Agent': 'ram-heartbeat/1.0' } });
  if (r.status !== 200) throw new Error(`Viewer template fetch failed: ${r.status}`);
  return r.body;
}

async function main() {
  console.log('══════════════════════════════════════════════');
  console.log('  RITUAL — Design Discovery Pipeline');
  console.log('  RAM Design Heartbeat · March 27, 2026');
  console.log('══════════════════════════════════════════════\n');

  // 1. Hero page
  console.log(`Publishing hero → ram.zenbin.org/${SLUG} …`);
  const heroHTML = fs.readFileSync('/workspace/group/design-studio/ritual-hero.html', 'utf8');
  const heroRes = await publishToZenBin(SLUG, `RITUAL — where drops meet discipline · RAM`, heroHTML);
  if (heroRes.status !== 200 && heroRes.status !== 201) {
    console.error('Hero publish error:', heroRes.status, heroRes.body.slice(0, 300));
  } else {
    console.log(`✓ Hero live → https://ram.zenbin.org/${SLUG}`);
  }

  // 2. Viewer
  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} …`);
  let viewerHtml = await fetchViewerTemplate();
  const penJson = fs.readFileSync('/workspace/group/design-studio/ritual.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const viewerRes = await publishToZenBin(VIEWER_SLUG, `RITUAL Prototype Viewer · RAM`, viewerHtml);
  if (viewerRes.status !== 200 && viewerRes.status !== 201) {
    console.error('Viewer publish error:', viewerRes.status, viewerRes.body.slice(0, 300));
  } else {
    console.log(`✓ Viewer live → https://ram.zenbin.org/${VIEWER_SLUG}`);
  }

  // 3. GitHub queue
  console.log('\nUpdating gallery queue …');
  const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO = config.GITHUB_REPO;

  const getRes = await httpsReq({
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
  fs.writeFileSync('/workspace/group/design-studio/ritual-queue-entry.json', JSON.stringify(newEntry, null, 2));

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: RITUAL to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha
  });
  const putRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : `ERROR ${putRes.status}: ${putRes.body.slice(0, 100)}`);

  console.log('\n══════════════════════════════════════════════');
  console.log('  RITUAL published');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
  console.log('══════════════════════════════════════════════');
}

main().catch(console.error);
