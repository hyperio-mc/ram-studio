/**
 * SPAN — Full Design Discovery Pipeline
 * Hero + Viewer + Gallery queue + DB
 * RAM Design Heartbeat — Mar 28 2026
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'span';
const APP       = 'SPAN';
const TAGLINE   = 'Distributed Trace & API Intelligence';
const ARCHETYPE = 'developer-tools-dark';
const PROMPT    = 'Inspired by darkmodedesign.com featuring Linear and Midday — the 2025-26 trend of deep space navy (#040612) + indigo+cyan dual-accent developer tool SaaS UIs. Dark API observability dashboard: 5 screens covering health overview, live request feed, waterfall trace view, anomaly alerts, and settings/API key management.';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch(e) { resolve({ url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) }); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function main() {
  // 1. Hero page
  console.log('Publishing hero page…');
  const heroHtml = fs.readFileSync(path.join(__dirname, 'span-hero.html'), 'utf8');
  const heroRes = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log('Hero:', heroRes.url || heroRes);

  // 2. Viewer page
  console.log('Publishing viewer…');
  const penJson = fs.readFileSync(path.join(__dirname, 'span.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SPAN — Viewer</title>
<script src="https://cdn.zenbin.org/pencil-viewer.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: #040612; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  #viewer { width:390px; height:844px; border-radius:40px; overflow:hidden; box-shadow: 0 0 80px rgba(99,102,241,0.25), 0 40px 80px rgba(0,0,0,0.6); }
  .back-link { position:fixed; top:20px; left:20px; color: #6366F1; font-family:system-ui; font-size:14px; text-decoration:none; background:rgba(11,17,32,0.9); padding:8px 16px; border-radius:20px; border:1px solid rgba(99,102,241,0.3); }
</style>
</head>
<body>
<a class="back-link" href="https://ram.zenbin.org/span">← SPAN</a>
<div id="viewer"></div>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#viewer', window.EMBEDDED_PEN);
    }
  });
</script>
</body>
</html>`;

  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Design Viewer`);
  console.log('Viewer:', viewerRes.url || viewerRes);

  // 3. Gallery queue
  console.log('Updating gallery queue…');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

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
    app_name: APP,
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
  const putBody = JSON.stringify({
    message: `add: ${APP} to gallery (heartbeat)`,
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
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

  console.log('\n✓ Pipeline complete');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
  return newEntry;
}

main().catch(console.error);
