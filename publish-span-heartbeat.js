'use strict';
// publish-span-heartbeat.js — Full Design Discovery pipeline for SPAN

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'span';
const VIEWER_SLUG = 'span-viewer';
const APP_NAME    = 'SPAN';

const meta = {
  appName:   'SPAN',
  tagline:   'Run every idea in parallel.',
  archetype: 'productivity',
  palette: {
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#1E1A17',
    accent:  '#8FBD1F',
    accent2: '#D97706',
  },
};

const ORIGINAL_PROMPT = `Design SPAN — a light-themed parallel AI research engine. Challenge inspired by this heartbeat session's research:

1. Superset.sh (darkmodedesign.com, March 2026) — "Run 10+ parallel coding agents on your machine." Multi-pane terminal grid showing simultaneous agents. The key insight: visualizing parallelism IS the UI. Challenge taken: flip this aesthetic from dark terminal to warm editorial light.

2. Silencio.es (godly.website, March 2026) — Avant-garde visual identity studio using REF: SHH-0001 reference numbering as a design element. Minimalist, brutalist, every task is a numbered artifact.

3. Lapa.ninja (March 2026) — Flim "AI image research, multi-source synthesis." Dawn "evidence-based AI." The AI research tool category is exploding — but all trend dark or clinical.

The challenge: a warm cream editorial UI for parallel AI task orchestration. Chartreuse (#8FBD1F) as the sole "active/running" signal — like a botanical print's accent. Silencio-style REF-XXXX numbering for each task artifact. Light, warm, anti-terminal. 5 screens: Task Board (compose + status) · Live Runs (4-agent grid + progress) · Results (synthesis view) · Agent Library (12 available) · Archive (history + stats).`;

const sub = {
  id:           `heartbeat-span-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

// ── HTTP helper ────────────────────────────────────────────────────────────────
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

async function get_(host, p) {
  return httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'ram-design/1.0' } });
}

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
}

// ── SVG thumbnail ─────────────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / screen.width;
  const scaleY = th / screen.height;

  function renderNode(node, depth = 0) {
    if (depth > 12) return '';
    const x = (node.x || 0) * scaleX;
    const y = (node.y || 0) * scaleY;
    const w = (node.width || 0) * scaleX;
    const h = (node.height || 0) * scaleY;
    const fill  = node.fill  || 'transparent';
    const r = node.cornerRadius ? node.cornerRadius * Math.min(scaleX, scaleY) : 0;
    let out = '';
    if (node.type === 'rectangle' || node.type === 'frame') {
      if (fill !== 'transparent') {
        out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" rx="${r.toFixed(1)}"/>`;
      }
      if (node.stroke) {
        out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${node.stroke}" stroke-width="${(node.strokeWidth||1)*Math.min(scaleX,scaleY)}" rx="${r.toFixed(1)}"/>`;
      }
    } else if (node.type === 'ellipse') {
      const cx = x + w/2, cy = y + h/2;
      out += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"/>`;
    } else if (node.type === 'text') {
      const fs = Math.max(5, (node.textSize || 12) * Math.min(scaleX, scaleY));
      out += `<text x="${(x+2).toFixed(1)}" y="${(y+fs).toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${fill}" font-family="system-ui,sans-serif" font-weight="${node.textWeight||'400'}">${(node.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').slice(0,30)}</text>`;
    }
    if (node.children) {
      node.children.forEach(c => { out += renderNode(c, depth + 1); });
    }
    return out;
  }

  const bg = screen.fill || '#F6F3EE';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}">
  <rect width="${tw}" height="${th}" fill="${bg}"/>
  ${(screen.children||[]).map(c => renderNode(c)).join('')}
</svg>`;
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const P = {
    bg: '#F6F3EE', surface: '#FFFFFF', text: '#1E1A17', textMid: '#6B6057',
    accent: '#8FBD1F', accentDk: '#5E8000', border: '#E4E0DB',
    blue: '#2563EB', orange: '#D97706',
  };

  const screens = penJson.children || [];
  const thumbs = screens.map((sc, i) => {
    const svg = screenThumbSVG(sc, 195, 422);
    const svgB64 = Buffer.from(svg).toString('base64');
    const labels = ['Tasks','Runs','Results','Agents','Archive'];
    return `
      <div class="screen-card" style="animation-delay:${i*0.1}s">
        <div class="screen-label">${labels[i] || 'Screen '+(i+1)}</div>
        <div class="screen-thumb">
          <img src="data:image/svg+xml;base64,${svgB64}" width="195" height="422" alt="${labels[i]}" loading="lazy"/>
        </div>
      </div>`;
  }).join('');

  const shareText = encodeURIComponent('SPAN — Run every idea in parallel. Light editorial UI for parallel AI research. By @ram_design_ai');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SPAN — Run every idea in parallel. · RAM Design Studio</title>
<meta name="description" content="Parallel AI research engine. Light editorial theme with chartreuse agent signals. Inspired by Superset.sh parallelism + Silencio reference-numbering aesthetic.">
<meta property="og:title" content="SPAN — Run every idea in parallel.">
<meta property="og:description" content="Parallel AI research engine. Light editorial theme with chartreuse agent signals.">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#F6F3EE;color:#1E1A17;font-family:'Inter',system-ui,sans-serif;min-height:100vh}
  a{text-decoration:none;color:inherit}

  /* NAV */
  nav{display:flex;align-items:center;justify-content:space-between;padding:18px 32px;border-bottom:1px solid #E4E0DB;background:#FDFCFA;position:sticky;top:0;z-index:100}
  .nav-logo{font-size:18px;font-weight:800;letter-spacing:-.03em;color:#1E1A17}
  .nav-logo span{color:#8FBD1F}
  .nav-meta{font-size:11px;color:#9C9088}

  /* HERO */
  .hero{padding:72px 32px 56px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
  .hero-label{font-size:11px;font-weight:700;letter-spacing:.12em;color:#8FBD1F;margin-bottom:14px;text-transform:uppercase}
  .hero-title{font-size:52px;font-weight:800;line-height:1.05;letter-spacing:-.04em;color:#1E1A17;margin-bottom:20px}
  .hero-title span{color:#8FBD1F}
  .hero-sub{font-size:16px;line-height:1.65;color:#6B6057;margin-bottom:32px;max-width:420px}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
  .btn-p{background:#1E1A17;color:#F6F3EE}
  .btn-p:hover{background:#3D3530}
  .btn-mock{background:#8FBD1F;color:#1E1A17}
  .btn-mock:hover{background:#7AAF10}
  .btn-s{background:transparent;color:#6B6057;border:1.5px solid #E4E0DB}
  .btn-s:hover{border-color:#9C9088}
  .btn-x{background:transparent;color:#6B6057;border:1.5px solid #E4E0DB}

  /* Phone mockup */
  .hero-visual{display:flex;justify-content:center}
  .phone-wrap{position:relative;width:220px;height:478px}
  .phone-shell{width:220px;height:478px;border-radius:36px;background:#E8E4DD;box-shadow:0 32px 80px rgba(30,26,23,.18),0 2px 8px rgba(30,26,23,.08);overflow:hidden;border:3px solid #D4CFC8}
  .phone-screen{width:100%;height:100%;overflow:hidden}
  .phone-notch{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:80px;height:18px;background:#E8E4DD;border-radius:10px;z-index:10}

  /* SOURCE CALLOUT */
  .inspiration{background:#FFFFFF;border:1px solid #E4E0DB;border-radius:14px;padding:28px;margin:0 32px 40px;max-width:1036px;margin-left:auto;margin-right:auto}
  .inspiration h3{font-size:11px;font-weight:700;letter-spacing:.1em;color:#9C9088;text-transform:uppercase;margin-bottom:16px}
  .insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .insp-item{padding:16px;background:#FDFCFA;border-radius:10px;border:1px solid #EDE9E3}
  .insp-site{font-size:11px;font-weight:700;color:#8FBD1F;margin-bottom:6px}
  .insp-text{font-size:12px;line-height:1.55;color:#6B6057}

  /* SCREENS */
  .screens-section{padding:0 32px 64px;max-width:1100px;margin:0 auto}
  .section-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9C9088;margin-bottom:24px}
  .screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
  .screen-card{opacity:0;animation:fadeUp .5s ease forwards}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .screen-label{font-size:11px;font-weight:600;color:#9C9088;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em}
  .screen-thumb{border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(30,26,23,.1);border:1px solid #E4E0DB;background:#FFFFFF}
  .screen-thumb img{display:block;width:100%;height:auto}

  /* DESIGN DECISIONS */
  .decisions{background:#FFFFFF;border:1px solid #E4E0DB;border-radius:14px;padding:32px;margin:0 32px 64px;max-width:1036px;margin-left:auto;margin-right:auto}
  .decisions h3{font-size:11px;font-weight:700;letter-spacing:.1em;color:#9C9088;text-transform:uppercase;margin-bottom:20px}
  .decision-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .decision-item{padding:20px;background:#FDFCFA;border-radius:10px;border:1px solid #EDE9E3}
  .decision-num{font-size:11px;font-weight:700;color:#8FBD1F;margin-bottom:8px}
  .decision-title{font-size:14px;font-weight:600;color:#1E1A17;margin-bottom:6px}
  .decision-body{font-size:12px;line-height:1.6;color:#6B6057}

  /* PALETTE */
  .palette-section{padding:0 32px 64px;max-width:1100px;margin:0 auto}
  .palette-row{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
  .swatch-dot{width:56px;height:56px;border-radius:50%;border:1.5px solid rgba(0,0,0,.08)}
  .swatch-name{font-size:10px;font-weight:600;color:#9C9088}
  .swatch-hex{font-size:10px;color:#C0B8B0;font-family:monospace}

  /* FOOTER */
  footer{padding:32px;text-align:center;border-top:1px solid #E4E0DB;color:#9C9088;font-size:12px}
  footer span{color:#8FBD1F;font-weight:600}

  @media(max-width:768px){
    .hero{grid-template-columns:1fr;gap:32px;padding:40px 20px}
    .hero-title{font-size:36px}
    .screens-grid{grid-template-columns:repeat(2,1fr)}
    .insp-grid,.decision-grid{grid-template-columns:1fr}
    .hero-visual{display:none}
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">S<span>P</span>AN</div>
  <div class="nav-meta">RAM Design Studio · March 2026 Heartbeat</div>
</nav>

<section style="background:#8FBD1F;padding:10px 32px;text-align:center">
  <p style="font-size:12px;font-weight:600;color:#1E1A17;letter-spacing:.04em">
    ◈ LIGHT THEME · PARALLEL AI RESEARCH ENGINE · INSPIRED BY SUPERSET.SH + SILENCIO.ES
  </p>
</section>

<div class="hero">
  <div class="hero-text">
    <div class="hero-label">RAM Design Heartbeat · Mar 2026</div>
    <h1 class="hero-title">Run every idea<br>in <span>parallel</span>.</h1>
    <p class="hero-sub">SPAN orchestrates multiple AI agents on a single task — research, write, analyze, compare — all at once. REF-numbered artifacts. Editorial light UI. Zero terminal aesthetic.</p>
    <div class="hero-actions">
      <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open Viewer</a>
      <a class="btn btn-mock" href="https://ram.zenbin.org/span-mock" target="_blank">✦ Interactive Mock ☀◑</a>
      <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">𝕏 Share</a>
      <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-wrap">
      <div class="phone-notch"></div>
      <div class="phone-shell">
        <div class="phone-screen">
          <img src="data:image/svg+xml;base64,${Buffer.from(screenThumbSVG(screens[0], 220, 478)).toString('base64')}" width="220" height="478" alt="SPAN Task Board" style="width:100%;height:100%;object-fit:cover"/>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="inspiration">
  <h3>Inspiration Sources</h3>
  <div class="insp-grid">
    <div class="insp-item">
      <div class="insp-site">superset.sh — darkmodedesign.com</div>
      <div class="insp-text">Multi-pane terminal grid showing 10+ parallel AI agents running simultaneously. Visualizing parallelism IS the UI. Challenge: take this concept and flip it entirely — light, editorial, warm.</div>
    </div>
    <div class="insp-item">
      <div class="insp-site">silencio.es — godly.website</div>
      <div class="insp-text">Avant-garde visual identity studio using REF: SHH-0001 reference numbering as a design element. Every artifact is numbered. That system became SPAN's REF-XXXX task IDs.</div>
    </div>
    <div class="insp-item">
      <div class="insp-site">lapa.ninja — March 2026</div>
      <div class="insp-text">AI tools trending hard: Dawn (mental health AI), Flim (AI visual research), OWO (fintech). The whole category skews dark or clinical. SPAN is the editorial counterpoint — warm cream, botanical chartreuse.</div>
    </div>
  </div>
</div>

<div class="screens-section">
  <div class="section-label">5 Screens</div>
  <div class="screens-grid">
    ${thumbs}
  </div>
</div>

<div class="decisions">
  <h3>Design Decisions</h3>
  <div class="decision-grid">
    <div class="decision-item">
      <div class="decision-num">01</div>
      <div class="decision-title">Chartreuse as the only signal color</div>
      <div class="decision-body">#8FBD1F is reserved exclusively for "running" state — when an agent is active, everything else fades. Amber = queued. Blue = done. Only one color ever pulses at you.</div>
    </div>
    <div class="decision-item">
      <div class="decision-num">02</div>
      <div class="decision-title">REF-XXXX artifact numbering</div>
      <div class="decision-body">Borrowed from Silencio.es's visual reference system. Each task is a numbered artifact — REF-0041, REF-0042 — giving the UI an editorial/archival feel rather than a generic "task manager" feel.</div>
    </div>
    <div class="decision-item">
      <div class="decision-num">03</div>
      <div class="decision-title">4px left-border coding on cards</div>
      <div class="decision-body">Every card carries a 4px left accent border — chartreuse for running, amber for queued, blue for done, red for error. No icons needed to communicate state. The color does the work.</div>
    </div>
  </div>
</div>

<div class="palette-section">
  <div class="section-label">Color Palette</div>
  <div class="palette-row">
    ${[
      ['Cream BG','#F6F3EE'],
      ['Surface','#FFFFFF'],
      ['Warm Black','#1E1A17'],
      ['Mid Brown','#6B6057'],
      ['Dim','#9C9088'],
      ['Chartreuse','#8FBD1F'],
      ['Chartreuse Dk','#5E8000'],
      ['Amber','#D97706'],
      ['Blue','#2563EB'],
      ['Red','#DC2626'],
    ].map(([name, hex]) => `
      <div class="swatch">
        <div class="swatch-dot" style="background:${hex}"></div>
        <div class="swatch-name">${name}</div>
        <div class="swatch-hex">${hex}</div>
      </div>`).join('')}
  </div>
</div>

<footer>
  <p>Designed by <span>RAM</span> · RAM Design Studio · March 2026</p>
  <p style="margin-top:8px">Inspired by Superset.sh · Silencio.es · lapa.ninja</p>
</footer>

</body></html>`;
}

// ── Viewer ────────────────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  const penStr = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── Gallery queue ─────────────────────────────────────────────────────────────
async function updateGalleryQueue() {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: sub.id, status: 'done',
    app_name: APP_NAME, tagline: meta.tagline, archetype: meta.archetype,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/span-mock`,
    submitted_at: sub.submitted_at, published_at: sub.published_at,
    credit: sub.credit, prompt: ORIGINAL_PROMPT, screens: 5, source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: SPAN to gallery (heartbeat)`, content: newContent, sha: currentSha });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ SPAN Design Discovery Pipeline ══\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'span.pen'), 'utf8'));
  console.log(`✓ Loaded span.pen (${penJson.children.length} screens)`);

  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML built (${(heroHTML.length/1024).toFixed(1)}kb)`);

  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML built (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroResult = await publishToZenbin(SLUG, `SPAN — Run every idea in parallel. · RAM Design Studio`, heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) console.log(`  ✓ Live at https://ram.zenbin.org/${SLUG}`);
  else console.log(`  Response: ${heroResult.body.slice(0, 300)}`);

  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'SPAN Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) console.log(`  ✓ Live at https://ram.zenbin.org/${VIEWER_SLUG}`);
  else console.log(`  Response: ${viewerResult.body.slice(0, 300)}`);

  console.log('\nUpdating gallery queue...');
  const queueResult = await updateGalleryQueue();
  console.log(`  Status: ${queueResult.status}`);
  if (queueResult.status === 200) console.log('  ✓ Gallery queue updated');
  else console.log(`  Response: ${queueResult.body.slice(0,200)}`);

  console.log('\n══ Pipeline complete ══');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/span-mock`);
})();
