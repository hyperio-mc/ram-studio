'use strict';
// larder-publish.js — LARDER hero + viewer + gallery update

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'axon';
const APP_NAME  = 'LARDER';
const TAGLINE   = 'Know every ingredient, from soil to plate.';
const ARCHETYPE = 'food-provenance-intelligence';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function publish(slug, html, title) {
  const body = JSON.stringify({ title, html });
  const res = await request({
    hostname: 'zenbin.org',
    path: '/v1/pages/' + slug + '?overwrite=true',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram'
    }
  }, body);
  if (res.status === 200 || res.status === 201) {
    const result = JSON.parse(res.body);
    console.log('OK  Published:', result.url || ('https://ram.zenbin.org/' + slug));
    return result.url || ('https://ram.zenbin.org/' + slug);
  } else {
    console.error('Publish failed (' + res.status + '):', res.body.slice(0, 300));
    return null;
  }
}

function sanitize(html) {
  return html.replace(/[^\x00-\x7F]/g, ' ');
}

(async () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN  = config.GITHUB_TOKEN;
  const REPO   = config.GITHUB_REPO;

  // ── Step 1: Hero ──────────────────────────────────────────────────────────
  console.log('\n-- Step 1: Hero page');
  const heroHtml = sanitize(fs.readFileSync(path.join(__dirname, 'larder-hero.html'), 'utf8'));
  const heroUrl  = await publish(SLUG, heroHtml, APP_NAME + ' -- ' + TAGLINE);

  await new Promise(r => setTimeout(r, 4000));

  // ── Step 2: Viewer ────────────────────────────────────────────────────────
  console.log('\n-- Step 2: Viewer');
  const penJson = fs.readFileSync(path.join(__dirname, 'larder.pen'), 'utf8');

  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LARDER -- Prototype Viewer</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:#F4EFE6;font-family:Inter,sans-serif;color:#1A1410}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:56px;background:rgba(244,239,230,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(26,20,16,0.10)}
  .logo{font-size:16px;font-weight:700;letter-spacing:0.15em;color:#1A1410}
  .logo span{color:#C84831}
  .tagline{font-size:12px;color:rgba(26,20,16,0.45)}
  .hero-btn{font-size:12px;font-weight:600;padding:7px 16px;background:#C84831;color:#FDFCFA;border-radius:7px;text-decoration:none}
  .viewer{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 56px);padding:32px;background:#EDE7DA}
  #pencil-viewer{width:100%;max-width:1200px;height:72vh;border-radius:20px;border:1px solid rgba(26,20,16,0.10);background:#FAFAF7}
</style>
</head>
<body>
<div class="nav">
  <span class="logo">LARD<span>E</span>R</span>
  <span class="tagline">Ingredient Provenance Intelligence</span>
  <a class="hero-btn" href="https://ram.zenbin.org/larder">See landing page</a>
</div>
<div class="viewer">
  <div id="pencil-viewer">Loading prototype viewer...</div>
</div>
<script>window.PEN_PLACEHOLDER=1;</script>
</body>
</html>`;

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>window.PEN_PLACEHOLDER=1;</script>', injection + '\n<script>window.PEN_PLACEHOLDER=1;</script>');
  viewerHtml = sanitize(viewerHtml);

  fs.writeFileSync(path.join(__dirname, 'axon-viewer.html'), viewerHtml);
  const viewerUrl = await publish(SLUG + '-viewer', viewerHtml, APP_NAME + ' -- Prototype Viewer');

  await new Promise(r => setTimeout(r, 4000));

  // ── Step 3: Gallery queue ────────────────────────────────────────────────
  console.log('\n-- Step 3: Gallery queue');
  const ghHeaders = {
    'Authorization': 'token ' + TOKEN,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };
  const getRes = await request({
    hostname: 'api.github.com',
    path: '/repos/' + REPO + '/contents/queue.json',
    method: 'GET',
    headers: ghHeaders
  });
  const fileData    = JSON.parse(getRes.body);
  const currentSha  = fileData.sha;
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const now = new Date().toISOString();
  const newEntry = {
    id: 'heartbeat-' + SLUG + '-' + Date.now(),
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: 'https://ram.zenbin.org/' + SLUG,
    mock_url:   'https://ram.zenbin.org/' + SLUG + '-mock',
    submitted_at: now,
    published_at: now,
    credit: 'RAM Design Heartbeat',
    prompt: 'Inspired by Lucci Lambrusco (siteinspire.com) warm cream + terracotta editorial style with marquee ticker strip; KOMETA Typefaces (minimal.gallery) clean white + bold accent block; Isa de Burgh (lapa.ninja) editorial whitespace and minimal label system. LIGHT theme. Farm-to-table provenance platform for premium kitchens. 5 screens: dashboard+ticker, supplier directory, ingredient detail+provenance chain, seasonal calendar with bar chart, orders & procurement. New pattern: time-column layout on list items, editorial color-block hero cards.',
    screens: 5,
    source: 'heartbeat',
    theme: 'light',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const encoded = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: 'add: LARDER to gallery (heartbeat)',
    content: encoded,
    sha: currentSha
  });
  const putRes = await request({
    hostname: 'api.github.com',
    path: '/repos/' + REPO + '/contents/queue.json',
    method: 'PUT',
    headers: { ...ghHeaders, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody) }
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('OK  Gallery queue updated -- total entries:', queue.submissions.length);
  } else {
    console.error('Gallery queue update failed:', putRes.status, putRes.body.slice(0, 100));
  }

  console.log('\nAll done!');
  console.log('  Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
  console.log('  Mock:   https://ram.zenbin.org/' + SLUG + '-mock');
})();
