'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'kairo';
const APP_NAME = 'KAIRO';
const TAGLINE = 'AI codebase intelligence, distilled';

// Palette
const BG='#080C18', SURF='#0C1220', CARD='#101828', ACC='#3D8EFF', ACC2='#22D3EE';
const GREEN='#10B981', AMBER='#F59E0B', RED='#EF4444';
const TEXT='#E2E8F0', TEXT2='#94A3B8';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ─── Convert elements to SVG string ──────────────────────────────────────────
function elToSvg(el) {
  if (!el) return '';
  switch(el.type) {
    case 'rect':
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    case 'text':
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter'},sans-serif" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity??1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    case 'circle':
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    case 'line':
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity??1}"/>`;
    case 'polyline':
      return `<polyline points="${el.points}" fill="${el.fill||'none'}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1.5}" opacity="${el.opacity??1}"/>`;
    case 'polygon':
      return `<polygon points="${el.points}" fill="${el.fill||'none'}" stroke="${el.stroke||'none'}"/>`;
    default: return '';
  }
}

function screenToSvg(screen, w=390, h=844) {
  const svgEls = (screen.elements||[]).map(elToSvg).join('\n');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="font-family:Inter,sans-serif">${svgEls}</svg>`;
}

// ─── Hero Page ────────────────────────────────────────────────────────────────
function buildHero() {
  const screenSvgs = pen.screens.map((s, i) => screenToSvg(s));
  const screenDataUris = screenSvgs.map(svg =>
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));

  const screenLabels = pen.screens.map(s => s.name);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>KAIRO — AI Codebase Intelligence</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${BG}; --surf:${SURF}; --card:${CARD};
  --acc:${ACC}; --acc2:${ACC2}; --green:${GREEN}; --amber:${AMBER}; --red:${RED};
  --text:${TEXT}; --text2:${TEXT2};
  --border:rgba(61,142,255,0.12);
}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;line-height:1.5;overflow-x:hidden}

/* Nav */
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(8,12,24,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between}
.nav-logo{font-size:15px;font-weight:700;color:var(--acc);letter-spacing:3px}
.nav-links{display:flex;gap:24px;list-style:none}
.nav-links a{color:var(--text2);text-decoration:none;font-size:13px;font-weight:500;transition:.2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--acc);color:#fff;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;transition:.2s}
.nav-cta:hover{background:#5ba3ff;color:#fff}

/* Hero */
.hero{padding:140px 24px 80px;text-align:center;max-width:900px;margin:0 auto;position:relative}
.hero-tag{display:inline-block;background:rgba(61,142,255,0.1);border:1px solid rgba(61,142,255,0.25);color:var(--acc);font-size:11px;font-weight:600;letter-spacing:3px;padding:6px 16px;border-radius:20px;margin-bottom:32px}
.hero h1{font-size:clamp(40px,8vw,72px);font-weight:800;letter-spacing:-2px;line-height:1.05;margin-bottom:20px}
.hero h1 span{background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:18px;color:var(--text2);max-width:520px;margin:0 auto 40px;font-weight:400;line-height:1.7}
.hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:60px}
.btn-primary{background:var(--acc);color:#fff;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;transition:.2s;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{background:#5ba3ff;transform:translateY(-1px);box-shadow:0 8px 32px rgba(61,142,255,0.3)}
.btn-secondary{background:var(--card);color:var(--text);padding:14px 32px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid var(--border);transition:.2s}
.btn-secondary:hover{border-color:var(--acc);color:var(--acc)}

/* Glow orbs */
.hero::before{content:'';position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(61,142,255,0.06) 0%,transparent 70%);top:-100px;left:50%;transform:translateX(-50%);pointer-events:none}

/* Screen carousel */
.carousel-wrap{position:relative;overflow:hidden;padding:20px 0 40px}
.carousel{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;max-width:1200px;margin:0 auto;padding:0 24px}
.screen-card{position:relative;cursor:pointer;transition:.3s}
.screen-card:hover{transform:translateY(-6px)}
.screen-card img{width:195px;height:422px;border-radius:16px;border:1px solid var(--border);box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(61,142,255,0.08);display:block}
.screen-card.featured img{width:240px;height:520px;border:1px solid rgba(61,142,255,0.3);box-shadow:0 30px 80px rgba(0,0,0,0.6),0 0 40px rgba(61,142,255,0.1)}
.screen-label{text-align:center;font-size:11px;color:var(--text2);font-weight:500;margin-top:10px;letter-spacing:0.5px}

/* Stats */
.stats{display:flex;justify-content:center;gap:48px;padding:48px 24px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin:60px 0}
.stat-item{text-align:center}
.stat-val{font-size:36px;font-weight:800;color:var(--text);line-height:1}
.stat-val span{color:var(--acc)}
.stat-label{font-size:12px;color:var(--text2);margin-top:6px;font-weight:500}

/* Features bento */
.features{max-width:960px;margin:0 auto;padding:0 24px 80px;display:grid;grid-template-columns:1fr 1fr;gap:16px}
.feat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px}
.feat-card.wide{grid-column:span 2}
.feat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:16px}
.feat-card h3{font-size:17px;font-weight:700;margin-bottom:8px}
.feat-card p{font-size:13px;color:var(--text2);line-height:1.7}

/* Palette */
.palette-section{max-width:960px;margin:0 auto;padding:0 24px 80px}
.palette-section h2{font-size:24px;font-weight:700;margin-bottom:24px;text-align:center}
.swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.swatch{width:80px;text-align:center}
.swatch-dot{width:56px;height:56px;border-radius:14px;margin:0 auto 8px;border:1px solid rgba(255,255,255,0.08)}
.swatch-hex{font-size:10px;color:var(--text2);font-family:monospace}
.swatch-name{font-size:10px;color:var(--text2);margin-top:2px}

/* Footer */
footer{border-top:1px solid var(--border);padding:40px 24px;text-align:center}
footer p{font-size:12px;color:var(--text2)}
footer a{color:var(--acc);text-decoration:none}
footer .links{display:flex;gap:20px;justify-content:center;margin-bottom:16px}
footer .links a{font-size:13px;color:var(--text2);text-decoration:none;transition:.2s}
footer .links a:hover{color:var(--acc)}

@media(max-width:600px){
  .carousel{flex-direction:row;overflow-x:auto}
  .screen-card img{width:160px;height:346px}
  .features{grid-template-columns:1fr}
  .feat-card.wide{grid-column:span 1}
  .stats{gap:24px;flex-wrap:wrap}
}
</style>
</head>
<body>
<nav>
  <div class="nav-logo">KAIRO</div>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#palette">Palette</a></li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">Open Viewer →</a>
</nav>

<section class="hero">
  <div class="hero-tag">RAM HEARTBEAT #401 · DARK</div>
  <h1>AI Codebase Intelligence,<br><span>Distilled</span></h1>
  <p>Your entire codebase understood at a glance. Health scores, AI-powered review, velocity analytics — and a command palette that answers anything.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">◈ Open in Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<div id="screens" class="carousel-wrap">
  <div class="carousel">
    ${pen.screens.map((s,i) => `
    <div class="screen-card ${i===0?'featured':''}">
      <img src="${screenDataUris[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</div>

<div class="stats">
  <div class="stat-item"><div class="stat-val"><span>${pen.screens.length}</span></div><div class="stat-label">Screens</div></div>
  <div class="stat-item"><div class="stat-val"><span>${pen.metadata.elements}</span></div><div class="stat-label">Elements</div></div>
  <div class="stat-item"><div class="stat-val">Dark</div><div class="stat-label">Theme</div></div>
  <div class="stat-item"><div class="stat-val">#401</div><div class="stat-label">Heartbeat</div></div>
</div>

<div id="features" class="features">
  <div class="feat-card wide">
    <div class="feat-icon" style="background:rgba(61,142,255,0.1);color:${ACC}">⌘K</div>
    <h3>Command Palette — Ask Anything</h3>
    <p>Inspired by Saaspo's analysis of Linear and Vercel's "calm design" philosophy — the command palette replaces complex navigation. Ask natural language questions about your codebase, jump to any repo, surface AI insights instantly.</p>
  </div>
  <div class="feat-card">
    <div class="feat-icon" style="background:rgba(34,211,238,0.1);color:${ACC2}">⬡</div>
    <h3>Bento Grid Dashboard</h3>
    <p>Modular, asymmetric card layouts directly from 2026's dominant pattern — health scores, sparklines, AI signals and recent activity all at once without visual overwhelm.</p>
  </div>
  <div class="feat-card">
    <div class="feat-icon" style="background:rgba(16,185,129,0.1);color:${GREEN}">◈</div>
    <h3>AI Code Review</h3>
    <p>Invisible AI infrastructure — suggestions appear contextually within the diff view, no "AI badge" required. Confidence over complexity.</p>
  </div>
  <div class="feat-card">
    <div class="feat-icon" style="background:rgba(245,158,11,0.1);color:${AMBER}">◎</div>
    <h3>Intelligent Alerts</h3>
    <p>Security CVEs, complexity spikes, dead code detection — severity tiered with red/amber/blue, each with a direct remediation action.</p>
  </div>
  <div class="feat-card">
    <div class="feat-icon" style="background:rgba(239,68,68,0.1);color:${RED}">◧</div>
    <h3>Repo Health Scores</h3>
    <p>Per-repo health scores (0–100) with activity sparklines. Coverage, velocity, and debt surfaced in a single glance — no clicking into sub-pages.</p>
  </div>
</div>

<div id="palette" class="palette-section">
  <h2>Palette</h2>
  <div class="swatches">
    ${[
      {hex:BG,name:'Background'},
      {hex:SURF,name:'Surface'},
      {hex:CARD,name:'Card'},
      {hex:ACC,name:'Accent Blue'},
      {hex:ACC2,name:'Accent Cyan'},
      {hex:GREEN,name:'Success'},
      {hex:AMBER,name:'Warning'},
      {hex:RED,name:'Alert'},
      {hex:TEXT,name:'Text'},
      {hex:TEXT2,name:'Muted'},
    ].map(s=>`<div class="swatch"><div class="swatch-dot" style="background:${s.hex}"></div><div class="swatch-hex">${s.hex}</div><div class="swatch-name">${s.name}</div></div>`).join('')}
  </div>
</div>

<footer>
  <div class="links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
  </div>
  <p>RAM Design Heartbeat #401 · <a href="https://ram.zenbin.org">ram.zenbin.org</a> · ${new Date().toLocaleDateString()}</p>
</footer>
</body>
</html>`;
}

// ─── Viewer page ──────────────────────────────────────────────────────────────
async function main() {
  console.log('Building hero page...');
  const heroHtml = buildHero();

  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status===201?'✓':'→ '+r1.body.slice(0,120)}`);

  // Viewer
  console.log('Building viewer...');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status===201?'✓':'→ '+r2.body.slice(0,120)}`);
}

main().catch(console.error);
