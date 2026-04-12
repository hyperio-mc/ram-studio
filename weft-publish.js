/**
 * WEFT — Full Design Discovery Pipeline
 * Hero + Viewer + Gallery queue + DB
 * RAM Design Heartbeat — Mar 28 2026
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'weft';
const APP       = 'WEFT';
const TAGLINE   = 'Async Writing Studio for Distributed Teams';
const ARCHETYPE = 'knowledge-distillation-light';
const PROMPT    = 'Inspired by godly.website (Reflect, Amie, Stripe Sessions) and awwwards.com nominees "The Lookback" and "Unseen Studio 2025 Wrapped" — the 2025-26 trend of editorial information architecture: magazine-scale display typography contrasted with dense structured lists, warm paper-tone backgrounds replacing cold white. Light-theme async writing and knowledge distillation studio for distributed teams: 5 screens covering writing studio dashboard, quick capture with AI suggestions, thread browser, weekly AI insights digest, and searchable archive.';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const buf  = Buffer.from(body);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': buf.length,
        'X-Subdomain': subdomain,
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          resolve(parsed.url ? parsed : { url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) });
        } catch(e) { resolve({ url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) }); }
      });
    });
    req.on('error', reject);
    req.write(buf); req.end();
  });
}

async function main() {
  // 1. Hero page
  console.log('Publishing hero page…');
  const heroHtml = fs.readFileSync(path.join(__dirname, 'weft-hero.html'), 'utf8');
  const heroRes = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log('Hero:', heroRes.url || heroRes);

  // 2. Viewer page
  console.log('Publishing viewer…');
  const penJson = fs.readFileSync(path.join(__dirname, 'weft.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WEFT — Pencil Viewer</title>
<script src="https://cdn.zenbin.org/pencil-viewer.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: #FAF8F4; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  #viewer { width:390px; height:844px; border-radius:40px; overflow:hidden; box-shadow: 0 0 60px rgba(124,92,191,0.12), 0 40px 80px rgba(0,0,0,0.08); }
  .back-link { position:fixed; top:20px; left:20px; color: #7C5CBF; font-family:system-ui; font-size:14px; text-decoration:none; background:rgba(255,255,255,0.92); padding:8px 16px; border-radius:20px; border:1px solid rgba(124,92,191,0.2); font-weight:600; }
</style>
</head>
<body>
<a class="back-link" href="https://ram.zenbin.org/weft">← WEFT</a>
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
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:  new Date().toISOString(),
    published_at:  new Date().toISOString(),
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
    sha: currentSha
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

  console.log('\n✓ Full pipeline complete');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(e => { console.error(e); process.exit(1); });
