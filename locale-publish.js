'use strict';
// locale-publish.js — Full Design Discovery pipeline for LOCALE
// LOCALE — Discover your neighbourhood's hidden gems
// Theme: LIGHT · Slug: locale

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'locale';
const APP_NAME  = 'Locale';
const TAGLINE   = 'Discover your neighbourhood\'s hidden gems.';
const ARCHETYPE = 'community-discovery';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Neighbourhood discovery app — warm artisanal light theme. Inspired by "Idle Hour Matcha" (land-book.com) earthy ecommerce aesthetic, "Good Fella" editorial grid layouts (awwwards.com), and the wave of slow/local-first consumer apps.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);
const penJson = fs.readFileSync(path.join(__dirname, 'locale.pen'), 'utf8');

// ── HTTP util ────────────────────────────────────────────────────────────────
function req(opts, body) {
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

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
}

// ── PALETTE ───────────────────────────────────────────────────────────────────
const P = {
  bg:         '#F5F0E8',
  surface:    '#FFFFFF',
  surfaceWarm:'#FDF8F2',
  border:     'rgba(192,90,40,0.12)',
  borderSub:  'rgba(26,21,16,0.08)',
  text:       '#1A1510',
  textMuted:  'rgba(26,21,16,0.45)',
  textSub:    'rgba(26,21,16,0.62)',
  accent:     '#C05A28',
  accentDim:  'rgba(192,90,40,0.10)',
  accent2:    '#5C7040',
  accent2Dim: 'rgba(92,112,64,0.12)',
  yellow:     '#D4A017',
  tag:        '#E8E2D8',
};

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Locale — ${TAGLINE} | RAM Design Studio</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:-apple-system,'Inter',system-ui,sans-serif}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;
  background:rgba(245,240,232,0.90);
  backdrop-filter:blur(14px);
  border-bottom:1px solid ${P.borderSub};
}
.nav-logo{font-size:14px;font-weight:800;color:${P.accent};letter-spacing:3px;text-decoration:none;text-transform:uppercase}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;transition:color 0.2s}
.nav-links a:hover{color:${P.text}}
.nav-tag{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${P.accent2};background:${P.accent2Dim};border:1px solid rgba(92,112,64,0.25);padding:5px 12px;border-radius:20px}

.hero{
  min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  padding:120px 60px 80px;max-width:1200px;margin:0 auto;
}
.hero-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;color:${P.textMuted};text-transform:uppercase;margin-bottom:28px}
.hero-eyebrow span{color:${P.accent}}
.hero-title{font-size:clamp(64px,10vw,120px);font-weight:900;line-height:0.92;letter-spacing:-3px;color:${P.text};margin-bottom:24px}
.hero-title em{color:${P.accent};font-style:normal;font-family:Georgia,'Times New Roman',serif}
.hero-sub{font-size:18px;color:${P.textSub};max-width:520px;line-height:1.65;margin-bottom:48px}
.hero-actions{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:72px}
.btn-p{background:${P.accent};color:#fff;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;transition:opacity 0.2s;letter-spacing:0.3px}
.btn-p:hover{opacity:0.85}
.btn-s{background:${P.surface};color:${P.text};padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid ${P.borderSub};transition:border-color 0.2s}
.btn-s:hover{border-color:${P.accent}}
.btn-mock{background:${P.accentDim};color:${P.accent};padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;border:1px solid rgba(192,90,40,0.28);transition:opacity 0.2s}
.btn-mock:hover{opacity:0.8}

.meta-row{display:flex;gap:40px;flex-wrap:wrap;border-top:1px solid ${P.borderSub};padding-top:40px}
.meta-item span{display:block;font-size:9px;color:${P.textMuted};letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-weight:600}
.meta-item strong{color:${P.text};font-size:13px;font-weight:700;font-family:'SF Mono','Fira Code',monospace}

section{max-width:1200px;margin:0 auto;padding:80px 60px}
.section-label{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${P.textMuted};margin-bottom:32px;padding-bottom:14px;border-bottom:1px solid ${P.borderSub}}

.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px;margin-bottom:60px}
.screen-card{background:${P.surface};border-radius:16px;overflow:hidden;border:1px solid ${P.borderSub};transition:border-color 0.2s,transform 0.2s;cursor:default}
.screen-card:hover{border-color:${P.accent};transform:translateY(-2px)}
.screen-thumb{height:180px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.screen-name{padding:14px 16px 10px;font-size:10px;font-weight:700;color:${P.text};letter-spacing:1.5px;text-transform:uppercase}
.screen-sub{padding:0 16px 14px;font-size:10px;color:${P.textMuted};line-height:1.5}

.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:60px}
.feature-card{background:${P.surface};border-radius:16px;padding:28px;border:1px solid ${P.borderSub};transition:border-color 0.2s}
.feature-card:hover{border-color:${P.accent}}
.feature-icon{width:40px;height:40px;border-radius:12px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:20px}
.feature-title{font-size:14px;font-weight:700;color:${P.text};margin-bottom:8px}
.feature-desc{font-size:12px;color:${P.textMuted};line-height:1.7}

.palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.swatch{width:48px;height:48px;border-radius:10px;position:relative;cursor:default}
.swatch::after{content:attr(data-name);position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:8px;color:${P.textMuted};white-space:nowrap;font-weight:600;letter-spacing:0.5px}

.tokens-block{background:${P.surface};border:1px solid ${P.borderSub};border-radius:12px;padding:24px;margin-top:32px}
.tokens-label{font-size:8px;font-weight:700;color:${P.textMuted};letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}
.tokens-pre{font-size:10px;line-height:1.9;color:${P.textSub};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
.tokens-pre strong{color:${P.accent}}
.tokens-pre em{color:${P.accent2};font-style:normal}

.bento{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:auto;gap:16px;margin-bottom:60px}
.bento-card{background:${P.surface};border-radius:16px;padding:24px;border:1px solid ${P.borderSub};min-height:120px}
.bento-card.span2{grid-column:span 2}
.bento-card.span3{grid-column:span 3}
.bento-card.tall{grid-row:span 2}
.bento-label{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${P.textMuted};margin-bottom:12px}
.bento-val{font-size:32px;font-weight:800;color:${P.text};line-height:1}
.bento-sub{font-size:11px;color:${P.textMuted};margin-top:4px}
.bento-accent{color:${P.accent}}
.bento-accent2{color:${P.accent2}}

footer{border-top:1px solid ${P.borderSub};padding:40px 60px;max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
footer p{font-size:11px;color:${P.textMuted}}
footer a{color:${P.accent};text-decoration:none}

@media(max-width:768px){
  .hero{padding:100px 24px 60px}
  section{padding:60px 24px}
  footer{padding:32px 24px;flex-direction:column;gap:16px;text-align:center}
  .screens-grid{grid-template-columns:repeat(2,1fr)}
  .feature-grid{grid-template-columns:1fr}
  .bento{grid-template-columns:repeat(2,1fr)}
  .bento-card.span3{grid-column:span 2}
  nav{padding:0 20px}
}
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">Locale</a>
  <ul class="nav-links">
    <li><a href="#">Screens</a></li>
    <li><a href="#">Palette</a></li>
    <li><a href="#">Features</a></li>
    <li><a href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">Open Viewer →</a></li>
  </ul>
  <span class="nav-tag">Light · 5 Screens</span>
</nav>

<div class="hero">
  <p class="hero-eyebrow">RAM Design Studio · <span>Community Discovery</span></p>
  <h1 class="hero-title">
    Your<br><em>neighbourhood,</em><br>explored.
  </h1>
  <p class="hero-sub">${TAGLINE} Artisan cafés, local markets, community events — curated for the curious, slow-living crowd.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-p" target="_blank">Open Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-mock" target="_blank">☀◑ Interactive Mock</a>
    <a href="#screens" class="btn-s">Browse Screens</a>
  </div>
  <div class="meta-row">
    <div class="meta-item"><span>Theme</span><strong>Light · Warm</strong></div>
    <div class="meta-item"><span>Palette</span><strong>Terracotta + Sage</strong></div>
    <div class="meta-item"><span>Screens</span><strong>5 frames</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>Community · Discovery</strong></div>
    <div class="meta-item"><span>Inspired by</span><strong>land-book.com · awwwards</strong></div>
  </div>
</div>

<!-- SCREENS -->
<section id="screens">
  <p class="section-label">Screens · 5 frames</p>
  <div class="screens-grid">
    ${[
      { name: 'Discover', sub: 'Search, category filters, bento spot grid', grad: 'linear-gradient(135deg,#D4A882 0%,#B07850 100%)' },
      { name: 'Nearby', sub: 'Map overview + sortable spot list', grad: 'linear-gradient(135deg,#E8DDCC 0%,#C8B89A 100%)' },
      { name: 'Spot Detail', sub: 'Full info, gallery, hours, directions CTA', grad: 'linear-gradient(135deg,#F0E8DC 0%,#D8C8B0 100%)' },
      { name: 'Events', sub: 'Date strip, category filter, RSVP cards', grad: 'linear-gradient(135deg,#A8C4A0 0%,#789870 100%)' },
      { name: 'Saved', sub: 'Collections, stats, personal reviews', grad: 'linear-gradient(135deg,#F5F0E8 0%,#E0D8CC 100%)' },
    ].map(s => `
    <div class="screen-card">
      <div class="screen-thumb" style="background:${s.grad}"></div>
      <div class="screen-name">${s.name}</div>
      <div class="screen-sub">${s.sub}</div>
    </div>`).join('')}
  </div>
</section>

<!-- BENTO STATS -->
<section>
  <p class="section-label">Design at a glance</p>
  <div class="bento">
    <div class="bento-card span2">
      <div class="bento-label">Screens</div>
      <div class="bento-val bento-accent">5</div>
      <div class="bento-sub">Discover → Nearby → Detail → Events → Saved</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Theme</div>
      <div class="bento-val" style="font-size:20px">☀ Light</div>
      <div class="bento-sub">Warm parchment base</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Accent</div>
      <div class="bento-val bento-accent" style="font-size:20px">Terracotta</div>
      <div class="bento-sub">#C05A28 · Earthy warmth</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Inspiration</div>
      <div class="bento-val" style="font-size:14px;line-height:1.4">Idle Hour Matcha<br><span style="font-size:11px;color:${P.textMuted}">land-book.com</span></div>
    </div>
    <div class="bento-card span2">
      <div class="bento-label">Archetype</div>
      <div class="bento-val" style="font-size:22px">Community Discovery</div>
      <div class="bento-sub">Local-first, slow-living consumer app</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Second accent</div>
      <div class="bento-val bento-accent2" style="font-size:20px">Sage</div>
      <div class="bento-sub">#5C7040 · Nature, calm</div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section>
  <p class="section-label">Colour palette</p>
  <div class="palette-row">
    ${[
      { hex: '#F5F0E8', name: 'Parchment' },
      { hex: '#FFFFFF', name: 'Surface' },
      { hex: '#FDF8F2', name: 'Warm White' },
      { hex: '#C05A28', name: 'Terracotta' },
      { hex: '#5C7040', name: 'Sage' },
      { hex: '#D4A017', name: 'Amber' },
      { hex: '#E8E2D8', name: 'Tag' },
      { hex: '#1A1510', name: 'Ink' },
    ].map(s => `<div class="swatch" data-name="${s.name}" style="background:${s.hex};border:1px solid rgba(26,21,16,0.12)"></div>`).join('')}
  </div>
  <div style="margin-top:48px"></div>
  <div class="tokens-block">
    <div class="tokens-label">Design tokens</div>
    <div class="tokens-pre"><strong>bg</strong>         ${P.bg}          <em>// warm parchment</em>
<strong>surface</strong>    ${P.surface}           <em>// clean white</em>
<strong>text</strong>       ${P.text}         <em>// dark warm ink</em>
<strong>accent</strong>     ${P.accent}         <em>// terracotta / burnt orange</em>
<strong>accent2</strong>    ${P.accent2}         <em>// sage / olive green</em>
<strong>muted</strong>      rgba(26,21,16,0.45) <em>// text muted</em>
<strong>tag</strong>        ${P.tag}           <em>// pill / chip bg</em>
<strong>yellow</strong>     ${P.yellow}         <em>// star / amber</em></div>
  </div>
</section>

<!-- FEATURES -->
<section>
  <p class="section-label">Design decisions</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.accentDim}">🎨</div>
      <div class="feature-title">Editorial warmth</div>
      <div class="feature-desc">Cream/parchment base with terracotta accent mirrors the earthy, artisanal aesthetic of independent local businesses. Serif display type (Georgia) for the hero contrasts with clean system UI — a nod to Awwwards editorial layouts.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.accent2Dim}">◎</div>
      <div class="feature-title">Bento-grid Discover</div>
      <div class="feature-desc">The home screen uses a hero card + 2-column small card grid — the bento pattern popular in 2025–26 SaaS design, adapted for a consumer context. Each card tier signals visual hierarchy through size, not colour.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(212,160,23,0.12)">✦</div>
      <div class="feature-title">Dual-accent semantic system</div>
      <div class="feature-desc">Terracotta (#C05A28) for primary actions and food/café categories. Sage (#5C7040) for market/nature/open-status badges. Yellow (#D4A017) exclusively for ratings. Each accent carries semantic meaning across all 5 screens.</div>
    </div>
  </div>
</section>

<footer>
  <p>Built by <a href="https://ram.zenbin.org">RAM Design Studio</a> · ${new Date().toLocaleDateString('en-GB', { day:'numeric',month:'long',year:'numeric' })}</p>
  <p><a href="https://ram.zenbin.org/${SLUG}-viewer">Open in Pencil Viewer →</a></p>
</footer>

</body>
</html>`;
}

// ── VIEWER PAGE ───────────────────────────────────────────────────────────────
function buildViewer() {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Locale — Pencil Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#F5F0E8;font-family:-apple-system,system-ui,sans-serif}
header{height:48px;background:rgba(245,240,232,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(26,21,16,0.08);display:flex;align-items:center;padding:0 20px;gap:16px;position:fixed;top:0;left:0;right:0;z-index:100}
header h1{font-size:13px;font-weight:700;color:#C05A28;letter-spacing:2px;text-transform:uppercase}
header a{font-size:11px;color:rgba(26,21,16,0.5);text-decoration:none;margin-left:auto}
header a:hover{color:#C05A28}
#viewer{position:fixed;top:48px;left:0;right:0;bottom:0}
#pencil-viewer{width:100%;height:100%;border:none}
</style>
</head>
<body>
<header>
  <h1>Locale</h1>
  <span style="font-size:11px;color:rgba(26,21,16,0.4)">5 screens · Light theme</span>
  <a href="https://ram.zenbin.org/locale">← Hero page</a>
</header>
<div id="viewer">
  <iframe id="pencil-viewer" src="https://pencil.dev/viewer" title="Locale design viewer"></iframe>
</div>
<script>
window.EMBEDDED_PEN = null; // injected below
</script>
<script>
(function(){
  const iframe = document.getElementById('pencil-viewer');
  iframe.addEventListener('load', function() {
    if (window.EMBEDDED_PEN) {
      iframe.contentWindow.postMessage({ type: 'load-pen', pen: window.EMBEDDED_PEN }, '*');
    }
  });
})();
</script>
</body>
</html>`;

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀 Publishing LOCALE — Design Discovery pipeline\n');

  // a) Hero page
  console.log('📄 Publishing hero page…');
  const heroRes = await zenPut(SLUG, `Locale — ${TAGLINE}`, buildHero());
  console.log(`   Hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  // b) Viewer page
  console.log('🔭 Publishing viewer page…');
  const viewerRes = await zenPut(`${SLUG}-viewer`, `Locale — Pencil Viewer`, buildViewer());
  console.log(`   Viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  // c) Gallery queue
  console.log('📋 Updating gallery queue…');
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
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
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`   Queue: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 100)}`);

  // d) Design DB
  console.log('🗄  Indexing in design DB…');
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, newEntry);
    rebuildEmbeddings(db);
    console.log('   DB: ✓ indexed');
  } catch (e) {
    console.log('   DB: skipped —', e.message.split('\n')[0]);
  }

  console.log('\n✅ Done!');
  console.log(`   Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`   Mock   → https://ram.zenbin.org/${SLUG}-mock`);
})();
