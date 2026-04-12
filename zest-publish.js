'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'zest';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
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

// Build SVG previews for each screen
function svgFromScreen(screen, idx) {
  const W = 390, H = 844;
  let shapes = '';
  for (const el of screen.elements) {
    if (!el) continue;
    if (el.type === 'rect') {
      shapes += `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}"/>`;
    } else if (el.type === 'text') {
      const anchor = el.anchor||'start';
      shapes += `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw||400}" font-family="${el.font||'Inter,sans-serif'}" text-anchor="${anchor}" opacity="${el.opacity||1}" letter-spacing="${el.ls||0}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      shapes += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}"/>`;
    } else if (el.type === 'line') {
      shapes += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw||1}" opacity="${el.opacity||1}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${shapes}</svg>`;
}

const C = { bg:'#080A0F', surf:'#0F1219', card:'#161C28', border:'#2A3347',
  text:'#E2E8F0', muted:'#64748B', amber:'#F59E0B', blue:'#3B82F6', green:'#10B981' };

const svgs = pen.screens.map((sc, i) => svgFromScreen(sc, i));
const svgDataUris = svgs.map(s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ZEST — AI Pipeline Intelligence</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${C.bg};color:${C.text};font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
.noise{position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:1;opacity:0.4}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 60px;text-align:center;position:relative}
.hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(ellipse at 50% 0%,rgba(245,158,11,0.12) 0%,transparent 70%);pointer-events:none}
.eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:100px;padding:6px 16px;font-size:11px;font-weight:600;color:${C.amber};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:28px}
.eyebrow::before{content:'✦';font-size:10px}
h1{font-size:clamp(48px,8vw,84px);font-weight:900;line-height:1.05;letter-spacing:-2px;margin-bottom:20px;background:linear-gradient(135deg,${C.text} 0%,rgba(226,232,240,0.7) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
h1 span{background:linear-gradient(135deg,${C.amber},#FCD34D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{font-size:18px;color:${C.muted};max-width:520px;line-height:1.6;margin:0 auto 40px}
.cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:16px}
.btn-primary{background:${C.amber};color:#09080C;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.3px;transition:opacity 0.2s}
.btn-primary:hover{opacity:0.9}
.btn-secondary{background:rgba(255,255,255,0.06);border:1px solid ${C.border};color:${C.text};padding:14px 28px;border-radius:12px;font-size:14px;font-weight:500;text-decoration:none;transition:background 0.2s}
.btn-secondary:hover{background:rgba(255,255,255,0.1)}
.hint{font-size:11px;color:${C.muted};opacity:0.6}

/* screens carousel */
.screens-section{padding:80px 24px;max-width:1200px;margin:0 auto}
.screens-label{text-align:center;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.amber};margin-bottom:40px}
.screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}
.screen-card{background:${C.surf};border:1px solid ${C.border};border-radius:20px;overflow:hidden;transition:transform 0.2s,border-color 0.2s;cursor:pointer}
.screen-card:hover{transform:translateY(-4px);border-color:rgba(245,158,11,0.4)}
.screen-card img{width:100%;display:block}
.screen-name{padding:12px 16px;font-size:12px;font-weight:600;color:${C.muted}}

/* features */
.features{padding:80px 24px;max-width:1000px;margin:0 auto}
.feat-label{text-align:center;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.muted};margin-bottom:12px}
.feat-title{text-align:center;font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-1px;margin-bottom:48px}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.feat-card{background:${C.surf};border:1px solid ${C.border};border-radius:20px;padding:28px}
.feat-icon{font-size:28px;margin-bottom:16px}
.feat-card h3{font-size:16px;font-weight:700;margin-bottom:8px}
.feat-card p{font-size:14px;color:${C.muted};line-height:1.6}

/* palette */
.palette-section{padding:60px 24px;max-width:600px;margin:0 auto;text-align:center}
.palette-label{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.muted};margin-bottom:24px}
.swatches{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.swatch{width:56px;height:56px;border-radius:12px;border:1px solid ${C.border}}
.swatch-label{font-size:10px;color:${C.muted};margin-top:6px}

/* stats */
.stats{display:flex;gap:40px;justify-content:center;padding:40px 24px 80px;flex-wrap:wrap}
.stat{text-align:center}
.stat-val{font-size:32px;font-weight:800;color:${C.amber}}
.stat-label{font-size:12px;color:${C.muted};margin-top:4px}

/* footer */
footer{border-top:1px solid ${C.border};padding:32px 24px;text-align:center;font-size:12px;color:${C.muted}}
footer a{color:${C.amber};text-decoration:none}
</style>
</head>
<body>
<div class="noise"></div>

<section class="hero">
  <div class="eyebrow">RAM Design Heartbeat · Apr 2026</div>
  <h1>Pipeline<br>intelligence,<br><span>powered by AI</span></h1>
  <p class="sub">ZEST gives revenue teams instant clarity on every deal, risk signal, and forecast scenario — so you close faster and miss nothing.</p>
  <div class="cta-row">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View Design →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
  <p class="hint">6 screens · 583 elements · Dark theme</p>
</section>

<section class="screens-section">
  <div class="screens-label">All screens</div>
  <div class="screens-grid">
    ${pen.screens.map((sc, i) => `
    <div class="screen-card">
      <img src="${svgDataUris[i]}" alt="${sc.name}" loading="lazy">
      <div class="screen-name">${sc.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <div class="feat-label">What's inside</div>
  <h2 class="feat-title">Built for revenue<br>teams that move fast</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">🎯</div>
      <h3>Pipeline Command</h3>
      <p>Total pipeline value at a glance, broken down by stage with visual progress bars and deal velocity signals.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">✦</div>
      <h3>AI Signal Detection</h3>
      <p>Surface hot deals before they go cold. Email opens, meeting frequency, and doc views translated into close probability.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📊</div>
      <h3>Revenue Forecast</h3>
      <p>Committed vs best-case scenarios, monthly actuals vs targets, and per-rep quota attainment — all in one view.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⚡</div>
      <h3>Activity Feed</h3>
      <p>Real-time deal events with AI-flagged signals. Know the moment a prospect re-engages or goes dark.</p>
    </div>
  </div>
</section>

<div class="palette-section">
  <div class="palette-label">Design palette</div>
  <div class="swatches">
    ${[
      {col:'#080A0F',name:'Cinema'},
      {col:'#0F1219',name:'Surface'},
      {col:'#161C28',name:'Card'},
      {col:'#F59E0B',name:'Amber'},
      {col:'#3B82F6',name:'Blue'},
      {col:'#10B981',name:'Green'},
      {col:'#A78BFA',name:'Purple'},
      {col:'#64748B',name:'Muted'},
    ].map(s => `<div><div class="swatch" style="background:${s.col}"></div><div class="swatch-label">${s.name}</div></div>`).join('')}
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="stat-val">6</div><div class="stat-label">Screens</div></div>
  <div class="stat"><div class="stat-val">583</div><div class="stat-label">Elements</div></div>
  <div class="stat"><div class="stat-val">42</div><div class="stat-label">Heartbeat</div></div>
  <div class="stat"><div class="stat-val">Dark</div><div class="stat-label">Theme</div></div>
</div>

<footer>
  Designed by RAM · Inspired by saaspo.com (Attio, Clay AI-native CRM) ·
  <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> ·
  <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
</footer>
</body>
</html>`;

// Viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'ZEST — AI Pipeline Intelligence');
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0,120) : '✓');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'ZEST — Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0,120) : '✓');
}
main().catch(console.error);
