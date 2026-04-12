'use strict';
// delta-publish.js — DELTA hero + viewer + gallery update

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG     = 'delta';
const APP_NAME = 'DELTA';
const TAGLINE  = 'Ship winning experiments, not hunches.';
const ARCHETYPE= 'growth-experimentation';

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
    console.error('Publish failed (' + res.status + '):', res.body.slice(0, 200));
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

  // Hero
  console.log('\n-- Step 1: Hero page');
  const heroHtml = sanitize(fs.readFileSync(path.join(__dirname, 'delta-hero.html'), 'utf8'));
  const heroUrl = await publish(SLUG, heroHtml, APP_NAME + ' -- ' + TAGLINE);

  await new Promise(r => setTimeout(r, 4000));

  // Viewer
  console.log('\n-- Step 2: Viewer');
  const penJson = fs.readFileSync(path.join(__dirname, 'delta.pen'), 'utf8');
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DELTA -- Prototype Viewer</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:#06070C;font-family:Inter,sans-serif;color:#E6E8F6}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:56px;background:rgba(8,9,15,0.95);border-bottom:1px solid #1E2235}
  .logo{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:#7C5CF4;letter-spacing:0.12em}
  .tagline{font-size:12px;color:rgba(230,232,246,0.4)}
  .hero-btn{font-size:12px;font-weight:600;padding:7px 16px;background:#7C5CF4;color:#fff;border-radius:7px;text-decoration:none}
  .viewer{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 56px);padding:32px}
  #pencil-viewer{width:100%;max-width:1200px;height:70vh;border-radius:16px;border:1px solid #1E2235;background:#0E1018}
</style>
</head>
<body>
<div class="nav">
  <span class="logo">DELTA</span>
  <span class="tagline">A/B Experimentation Intelligence</span>
  <a class="hero-btn" href="https://ram.zenbin.org/delta">See landing page</a>
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

  fs.writeFileSync(path.join(__dirname, 'delta-viewer.html'), viewerHtml);
  const viewerUrl = await publish(SLUG + '-viewer', viewerHtml, APP_NAME + ' -- Prototype Viewer');

  await new Promise(r => setTimeout(r, 4000));

  // Gallery queue
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
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
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
    mock_url: 'https://ram.zenbin.org/' + SLUG + '-mock',
    submitted_at: now,
    published_at: now,
    credit: 'RAM Design Heartbeat',
    prompt: 'Inspired by Land-book "Codegen | The OS for Code Agents" (treats workflows as intelligent systems) + Linear (darkmodedesign.com) dark minimal SaaS aesthetic + Awwwards bento-grid layouts seen in SaaS nominees Mar 2026. New pattern: bento grid dashboard with asymmetric 2-col varied-height cards. Dark theme: near-black #08090F + electric violet #7C5CF4 + cyan win-state #22D3EE. 5 screens: bento dashboard, experiments list, experiment detail, create form, insights.',
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const encoded = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: 'add: DELTA to gallery (heartbeat)',
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
  console.log('  Mock:   https://ram.zenbin.org/' + SLUG + '-mock');
  console.log('  Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
})();
