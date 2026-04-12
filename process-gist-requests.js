'use strict';
// process-gist-requests.js
// Scheduled agent script: reads the GitHub Gist queue, generates designs for
// pending submissions, publishes them to ZenBin, and updates the Gist.
//
// Run manually: GITHUB_TOKEN=ghp_xxx node process-gist-requests.js
// Or via scheduled task (see schedule setup in README)
//
// Required env vars:
//   GITHUB_TOKEN   — GitHub PAT with 'gist' scope
//   GIST_ID        — The Gist ID created by gist-init.js (or set below)

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const GITHUB_TOKEN  = process.env.GITHUB_TOKEN  || '';
const GIST_ID       = process.env.GIST_ID       || 'REPLACE_WITH_GIST_ID';
const ZENBIN_BASE   = 'zenbin.org';
const ZENBIN_PATH   = '/v1/pages/';

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function request(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getGist() {
  const res = await request({
    hostname: 'api.github.com',
    path: `/gists/${GIST_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'design-studio-agent/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (res.status !== 200) throw new Error(`Gist GET failed: ${res.status} ${res.body}`);
  return JSON.parse(res.body);
}

async function updateGist(queue) {
  const body = JSON.stringify({
    files: {
      'queue.json': {
        content: JSON.stringify(queue, null, 2),
      },
    },
  });
  const res = await request({
    hostname: 'api.github.com',
    path: `/gists/${GIST_ID}`,
    method: 'PATCH',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'design-studio-agent/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);
  if (res.status !== 200) throw new Error(`Gist PATCH failed: ${res.status} ${res.body}`);
  return JSON.parse(res.body);
}

async function publishToZenBin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  const res = await request({
    hostname: ZENBIN_BASE,
    path: `${ZENBIN_PATH}${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
  return { status: res.status, body: res.body };
}

// ── Design generator ──────────────────────────────────────────────────────────
const { generateDesign, detectArchetype } = require('./community-design-generator');

function penToSVG(doc) {
  // Minimal SVG renderer for heartbeat pages
  // Returns an SVG string that shows all screens as thumbnails
  const screens = doc.children || [];
  if (!screens.length) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>';

  const THUMB_W = 200;
  const THUMB_H = 160;
  const COLS = 5;
  const GAP = 12;
  const totalW = COLS * (THUMB_W + GAP);
  const rows = Math.ceil(screens.length / COLS);
  const totalH = rows * (THUMB_H + GAP);

  const rects = screens.map((s, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const tx = col * (THUMB_W + GAP);
    const ty = row * (THUMB_H + GAP);
    const label = s.fill ? `${s.fill}` : '#111';
    return `
      <rect x="${tx}" y="${ty}" width="${THUMB_W}" height="${THUMB_H}" fill="${s.fill || '#111'}" rx="6"/>
      <text x="${tx + THUMB_W/2}" y="${ty + THUMB_H/2}" fill="#ffffff88" font-size="12"
        font-family="monospace" text-anchor="middle" dominant-baseline="middle"
        >Screen ${i+1}</text>
    `;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">${rects}</svg>`;
}

function buildHeartbeatHTML(sub, doc, meta, penJson) {
  const svgThumb = penToSVG(doc);
  const encoded = Buffer.from(JSON.stringify(penJson)).toString('base64');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.appName} — Community Design</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${meta.palette.bg}; color: ${meta.palette.fg}; font-family: 'SF Mono', 'Fira Code', monospace; min-height: 100vh; }
  .nav { padding: 20px 40px; border-bottom: 1px solid ${meta.palette.accent}22; display: flex; justify-content: space-between; align-items: center; }
  .nav-logo { font-size: 14px; font-weight: 700; letter-spacing: 3px; }
  .nav-meta { font-size: 11px; color: ${meta.palette.accent}; letter-spacing: 1px; }
  .hero { padding: 80px 40px 40px; }
  .hero-tag { font-size: 10px; letter-spacing: 3px; color: ${meta.palette.accent}; margin-bottom: 24px; }
  .hero-title { font-size: clamp(48px, 8vw, 96px); font-weight: 900; letter-spacing: -2px; line-height: 1; margin-bottom: 20px; }
  .hero-sub { font-size: 16px; opacity: 0.5; max-width: 480px; line-height: 1.6; margin-bottom: 40px; }
  .meta-row { display: flex; gap: 32px; margin-bottom: 48px; }
  .meta-item { font-size: 11px; letter-spacing: 1px; }
  .meta-item span { display: block; font-size: 10px; opacity: 0.4; margin-bottom: 4px; }
  .meta-item strong { color: ${meta.palette.accent}; }
  .actions { display: flex; gap: 16px; margin-bottom: 60px; }
  .btn { padding: 14px 28px; border-radius: 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; cursor: pointer; border: none; text-decoration: none; }
  .btn-primary { background: ${meta.palette.accent}; color: ${meta.palette.bg}; }
  .btn-secondary { background: transparent; color: ${meta.palette.fg}; border: 1px solid ${meta.palette.fg}33; }
  .preview { padding: 0 40px 80px; }
  .preview-label { font-size: 10px; letter-spacing: 2px; opacity: 0.4; margin-bottom: 20px; }
  .preview svg { max-width: 100%; border-radius: 8px; }
  .prompt-section { padding: 40px; border-top: 1px solid ${meta.palette.accent}22; }
  .prompt-label { font-size: 10px; letter-spacing: 2px; color: ${meta.palette.accent}; margin-bottom: 12px; }
  .prompt-text { font-size: 18px; opacity: 0.7; font-style: italic; max-width: 600px; line-height: 1.6; }
  footer { padding: 32px 40px; border-top: 1px solid ${meta.palette.accent}11; font-size: 11px; opacity: 0.3; display: flex; justify-content: space-between; }
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-logo">DESIGN STUDIO</div>
  <div class="nav-meta">COMMUNITY REQUEST #${sub.id}</div>
</nav>

<section class="hero">
  <div class="hero-tag">COMMUNITY DESIGN  ·  ${meta.archetype.toUpperCase()}  ·  ${new Date(sub.published_at||Date.now()).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1 class="hero-title">${meta.appName}</h1>
  <p class="hero-sub">${meta.tagline}</p>

  <div class="meta-row">
    <div class="meta-item"><span>ARCHETYPE</span><strong>${meta.archetype.toUpperCase()}</strong></div>
    <div class="meta-item"><span>SCREENS</span><strong>${meta.screens}</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>${meta.palette.bg} + ${meta.palette.accent}</strong></div>
    <div class="meta-item"><span>STATUS</span><strong>PUBLISHED</strong></div>
  </div>

  <div class="actions">
    <button class="btn btn-primary" onclick="openInViewer()">▶ Open in Pen Viewer</button>
    <a class="btn btn-secondary" href="https://zenbin.org/p/design-gallery">← Gallery</a>
    <a class="btn btn-secondary" href="https://zenbin.org/p/design-submit">Submit Idea</a>
  </div>
</section>

<section class="preview">
  <div class="preview-label">SCREEN PREVIEW  ·  5 MOBILE + 5 DESKTOP</div>
  ${svgThumb}
</section>

<section class="prompt-section">
  <div class="prompt-label">ORIGINAL PROMPT</div>
  <p class="prompt-text">"${sub.prompt}"</p>
</section>

<footer>
  <span>Design generated by RAM Design Studio</span>
  <span>zenbin.org/p/community-${sub.id}</span>
</footer>

<script>
const PEN_DATA_B64 = '${encoded}';
function getPenData() {
  try {
    const json = JSON.parse(atob(PEN_DATA_B64));
    return json;
  } catch(e) { return null; }
}
function openInViewer() {
  try {
    const json = getPenData();
    if (!json) { alert('Could not load pen data'); return; }
    localStorage.setItem('pv_pending', JSON.stringify({ json, name: '${meta.appName.toLowerCase()}.pen' }));
    window.open('https://zenbin.org/p/pen-viewer-2', '_blank');
  } catch(e) { alert('Could not open viewer: ' + e.message); }
}
</script>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎨 Design Studio — Community Request Processor');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN env var not set. Exiting.');
    process.exit(1);
  }
  if (GIST_ID === 'REPLACE_WITH_GIST_ID') {
    console.error('❌ GIST_ID not configured. Run gist-init.js first. Exiting.');
    process.exit(1);
  }

  // 1. Fetch queue
  console.log(`📥 Fetching queue from Gist ${GIST_ID}...`);
  const gist = await getGist();
  const queueFile = gist.files['queue.json'];
  if (!queueFile) throw new Error('queue.json not found in Gist');

  const queue = JSON.parse(queueFile.content);
  const pending = (queue.submissions || []).filter(s => s.status === 'pending');

  console.log(`📋 Found ${queue.submissions.length} total, ${pending.length} pending`);
  if (!pending.length) {
    console.log('✅ No pending submissions. Done.');
    return;
  }

  let processed = 0;
  let errors = 0;

  for (const sub of pending) {
    console.log(`\n▶ Processing: [${sub.id}] "${sub.prompt.slice(0,60)}..."`);

    // Mark as processing immediately (prevents double-processing)
    const idx = queue.submissions.findIndex(s => s.id === sub.id);
    queue.submissions[idx].status = 'processing';
    await updateGist(queue);

    try {
      // 2. Generate design
      console.log('  🎨 Generating design...');
      const { doc, meta } = generateDesign({ prompt: sub.prompt });
      console.log(`  ✓ Generated: ${meta.appName} (${meta.archetype}, ${meta.screens} screens)`);

      // 3. Build heartbeat HTML
      const slug = `community-${sub.id}`;
      sub.design_url = `https://zenbin.org/p/${slug}`;
      sub.app_name = meta.appName;
      sub.published_at = new Date().toISOString();

      const html = buildHeartbeatHTML(sub, doc, meta, doc);

      // 4. Publish to ZenBin
      console.log(`  📤 Publishing to zenbin.org/p/${slug}...`);
      const result = await publishToZenBin(slug, `${meta.appName} — Community Design`, html);

      if (result.status === 201 || result.status === 200) {
        console.log(`  ✅ Published: https://zenbin.org/p/${slug}`);
        queue.submissions[idx] = {
          ...sub,
          status: 'done',
        };
        processed++;
      } else if (result.status === 409) {
        // Slug already taken — try with timestamp suffix
        const altSlug = `community-${sub.id}-${Date.now()}`;
        const r2 = await publishToZenBin(altSlug, `${meta.appName} — Community Design`, html);
        if (r2.status === 201) {
          sub.design_url = `https://zenbin.org/p/${altSlug}`;
          queue.submissions[idx] = { ...sub, status: 'done' };
          console.log(`  ✅ Published (alt slug): https://zenbin.org/p/${altSlug}`);
          processed++;
        } else {
          throw new Error(`ZenBin publish failed: ${r2.status}`);
        }
      } else {
        throw new Error(`ZenBin publish failed: ${result.status} ${result.body.slice(0,200)}`);
      }

    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
      queue.submissions[idx] = {
        ...sub,
        status: 'error',
        error: err.message,
        error_at: new Date().toISOString(),
      };
      errors++;
    }

    // Update Gist after each item
    queue.updated_at = new Date().toISOString();
    await updateGist(queue);
    console.log('  📝 Gist updated');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Done: ${processed} published, ${errors} errors`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
