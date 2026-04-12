// fable-pipeline.js — Full Design Discovery pipeline for FABLE heartbeat
const https = require('https');
const fs = require('fs');

const SLUG        = 'fable';
const VIEWER_SLUG = 'fable-viewer';
const APP_NAME    = 'FABLE';
const TAGLINE     = 'read deeply, not just more';
const ARCHETYPE   = 'reading-wellness-light';
const PROMPT      = 'Light-theme slow-reading & focus companion. Warm cream + terracotta + sage palette. Inspired by Dawn wellness app (Lapa Ninja) and cozy library aesthetic (Land-book). Editorial Playfair Display headings. 5 screens: Today, Library, Focus Session, Insights, Discover.';

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
  const r = await httpsReq({
    hostname: 'zenbin.org',
    path: '/p/pen-viewer-3',
    method: 'GET',
    headers: { 'User-Agent': 'ram-heartbeat/1.0' }
  });
  if (r.status !== 200) throw new Error(`Viewer template fetch failed: ${r.status}`);
  return r.body;
}

async function main() {
  console.log('══════════════════════════════════════════════');
  console.log('  FABLE — Design Discovery Pipeline');
  console.log('  RAM Design Heartbeat · March 27, 2026');
  console.log('══════════════════════════════════════════════\n');

  // 1. Hero
  console.log(`Publishing hero → ram.zenbin.org/${SLUG} …`);
  const heroHTML = fs.readFileSync('/workspace/group/design-studio/fable-hero.html', 'utf8');
  const heroRes = await publishToZenBin(SLUG, `FABLE — ${TAGLINE}`, heroHTML);
  if (heroRes.status !== 200 && heroRes.status !== 201) {
    console.error('Hero publish error:', heroRes.status, heroRes.body.slice(0, 300));
  } else {
    console.log(`✓ Hero live → https://ram.zenbin.org/${SLUG}`);
  }

  // 2. Viewer
  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} …`);
  let viewerHtml;
  try {
    viewerHtml = await fetchViewerTemplate();
  } catch(e) {
    console.warn('Could not fetch viewer template, using fallback:', e.message);
    viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FABLE Viewer</title><script></script></head><body style="margin:0;background:#F7F3ED;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh"><div style="text-align:center;color:#1C1714"><h1 style="font-size:52px;font-weight:900;margin-bottom:8px">fable</h1><p style="opacity:0.55;font-size:16px">${TAGLINE}</p><a href="/fable" style="color:#C4613A;font-size:14px;margin-top:20px;display:block">← Back to overview</a></div></body></html>`;
  }
  const penJson = fs.readFileSync('/workspace/group/design-studio/fable.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const viewerRes = await publishToZenBin(VIEWER_SLUG, `FABLE Prototype Viewer`, viewerHtml);
  if (viewerRes.status !== 200 && viewerRes.status !== 201) {
    console.error('Viewer publish error:', viewerRes.status, viewerRes.body.slice(0, 300));
  } else {
    console.log(`✓ Viewer live → https://ram.zenbin.org/${VIEWER_SLUG}`);
  }

  // 3. GitHub gallery queue
  console.log('\nUpdating gallery queue …');
  const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

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
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
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
  const putBody = JSON.stringify({
    message: `add: FABLE to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha
  });
  const putRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : `ERROR ${putRes.status}: ${putRes.body.slice(0, 150)}`);

  // Save entry for DB indexing
  fs.writeFileSync('/workspace/group/design-studio/fable-queue-entry.json', JSON.stringify(newEntry, null, 2));

  console.log('\n══════════════════════════════════════════════');
  console.log('  FABLE published');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
  console.log('══════════════════════════════════════════════');
}

main().catch(console.error);
