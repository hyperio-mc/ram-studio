/**
 * AURUM — Full Design Discovery Pipeline
 * Hero + Viewer + Gallery queue + DB
 * RAM Design Heartbeat — Mar 28 2026
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'aurum';
const APP       = 'AURUM';
const TAGLINE   = 'Personal Wealth Intelligence';
const ARCHETYPE = 'fintech-premium-light';
const PROMPT    = 'Inspired by Atlas Card on godly.website (ultra-premium invite-only fintech with luxury editorial positioning) and Midday.ai on darkmodedesign.com (structured financial data for founders). LIGHT theme with warm ivory, antique gold, and forest green. 6 screens: splash/welcome, overview dashboard with net worth + allocation, accounts list, money moves + transactions, wealth goals with priority card, AI concierge chat.';

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
  const heroHtml = fs.readFileSync(path.join(__dirname, 'aurum-hero.html'), 'utf8');
  const heroRes = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log('Hero:', heroRes.url || heroRes);

  // 2. Viewer
  console.log('Publishing viewer…');
  const penJson = fs.readFileSync(path.join(__dirname, 'aurum.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AURUM — Design Viewer</title>
<script src="https://cdn.zenbin.org/pencil-viewer.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: #0E0C08; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  #viewer { width:390px; height:844px; border-radius:40px; overflow:hidden; box-shadow: 0 0 80px rgba(155,123,61,0.20), 0 40px 80px rgba(0,0,0,0.7); }
  .back-link { position:fixed; top:20px; left:20px; color: #9B7B3D; font-family:system-ui; font-size:14px; text-decoration:none; background:rgba(14,12,8,0.9); padding:8px 16px; border-radius:20px; border:1px solid rgba(155,123,61,0.25); }
</style>
</head>
<body>
<a class="back-link" href="https://ram.zenbin.org/aurum">← AURUM</a>
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
    screens: 6,
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
