'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'glare';
const NAME    = 'GLARE';
const TAGLINE = 'Creator intelligence, amplified';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
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
const pen     = JSON.parse(penJson);

// ── Colour palette for hero page ──
const C = {
  bg:   '#050507',
  surf: '#0C0C11',
  card: '#141418',
  acc:  '#CAFF33',
  acc2: '#FF4F6A',
  acc3: '#6366F1',
  text: '#FFFFFF',
  text2:'rgba(255,255,255,0.5)',
};

// ── SVG data URIs for screen thumbnails ──
function screenToDataUri(screen) {
  const els = screen.elements || [];
  let svgInner = '';
  for (const e of els) {
    if (e.type === 'rect') {
      svgInner += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="${e.fill}" rx="${e.rx||0}" opacity="${e.opacity||1}" stroke="${e.stroke||'none'}" stroke-width="${e.sw||0}"/>`;
    } else if (e.type === 'text') {
      svgInner += `<text x="${e.x}" y="${e.y}" font-size="${e.size}" fill="${e.fill}" font-weight="${e.fw||400}" font-family="${e.font||'Inter,sans-serif'}" text-anchor="${e.anchor||'start'}" letter-spacing="${e.ls||0}" opacity="${e.opacity||1}">${String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (e.type === 'circle') {
      svgInner += `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity||1}" stroke="${e.stroke||'none'}" stroke-width="${e.sw||0}"/>`;
    } else if (e.type === 'line') {
      svgInner += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.sw||1}" opacity="${e.opacity||1}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">${svgInner}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ── Hero HTML ─────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${C.bg};--surf:${C.surf};--card:${C.card};
  --acc:${C.acc};--acc2:${C.acc2};--acc3:${C.acc3};
  --text:${C.text};--text2:${C.text2};
  --glow:rgba(202,255,51,0.15);
}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}
/* ── Nav ── */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;background:rgba(5,5,7,0.85);backdrop-filter:blur(16px);border-bottom:1px solid rgba(202,255,51,0.08)}
.nav-logo{font-size:18px;font-weight:800;letter-spacing:4px;color:var(--acc)}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:var(--text2);text-decoration:none;font-size:14px;transition:color .2s}
.nav-links a:hover{color:var(--acc)}
.nav-cta{background:var(--acc);color:#050507;padding:10px 22px;border-radius:100px;font-size:13px;font-weight:700;text-decoration:none;transition:opacity .2s}
.nav-cta:hover{opacity:.85}
/* ── Hero ── */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(202,255,51,0.08) 0%,transparent 70%);pointer-events:none}
.hero-eyebrow{font-size:11px;font-weight:700;letter-spacing:4px;color:var(--acc);text-transform:uppercase;margin-bottom:24px;opacity:.9}
.hero-title{font-size:clamp(52px,9vw,96px);font-weight:900;line-height:1;letter-spacing:-0.04em;margin-bottom:24px;background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.6) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-acc{-webkit-text-fill-color:var(--acc)}
.hero-sub{font-size:clamp(16px,2.5vw,22px);color:var(--text2);max-width:540px;line-height:1.6;margin-bottom:48px}
.hero-btns{display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap}
.btn-primary{background:var(--acc);color:#050507;padding:16px 32px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;transition:opacity .2s,transform .2s}
.btn-primary:hover{opacity:.88;transform:translateY(-2px)}
.btn-ghost{border:1px solid rgba(202,255,51,0.3);color:var(--acc);padding:16px 32px;border-radius:100px;font-size:15px;font-weight:500;text-decoration:none;transition:all .2s}
.btn-ghost:hover{background:rgba(202,255,51,0.08)}
.hero-stat-row{display:flex;gap:48px;margin-top:64px;justify-content:center;flex-wrap:wrap}
.hero-stat{text-align:center}
.hero-stat-val{font-size:28px;font-weight:800;color:var(--acc)}
.hero-stat-lab{font-size:12px;color:var(--text2);margin-top:4px}
/* ── Screens carousel ── */
.screens-section{padding:80px 24px;text-align:center}
.section-label{font-size:11px;font-weight:700;letter-spacing:4px;color:var(--acc);text-transform:uppercase;margin-bottom:16px}
.section-title{font-size:clamp(32px,5vw,52px);font-weight:800;letter-spacing:-0.03em;margin-bottom:48px}
.screens-scroll{display:flex;gap:24px;overflow-x:auto;padding:20px 40px 40px;scroll-snap-type:x mandatory;scrollbar-width:none;max-width:1200px;margin:0 auto}
.screens-scroll::-webkit-scrollbar{display:none}
.screen-card{flex:0 0 195px;scroll-snap-align:start;border-radius:16px;overflow:hidden;border:1px solid rgba(202,255,51,0.12);transition:transform .3s,box-shadow .3s;cursor:pointer;background:var(--card)}
.screen-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 24px 64px rgba(202,255,51,0.15)}
.screen-card img{width:195px;height:422px;object-fit:cover;display:block}
.screen-card-label{padding:12px;font-size:12px;font-weight:600;color:var(--text2);text-align:center;letter-spacing:.5px}
/* ── Features ── */
.features{padding:80px 24px;max-width:1100px;margin:0 auto}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-top:48px}
.feat-card{background:var(--surf);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:32px;transition:border-color .3s}
.feat-card:hover{border-color:rgba(202,255,51,0.2)}
.feat-icon{font-size:28px;margin-bottom:20px}
.feat-title{font-size:18px;font-weight:700;margin-bottom:10px}
.feat-desc{font-size:14px;color:var(--text2);line-height:1.65}
.feat-acc{color:var(--acc)}
/* ── Palette ── */
.palette-section{padding:60px 24px;text-align:center;max-width:800px;margin:0 auto}
.palette-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:32px}
.swatch{width:80px;text-align:center}
.swatch-color{width:80px;height:80px;border-radius:16px;margin-bottom:8px;border:1px solid rgba(255,255,255,0.08)}
.swatch-hex{font-size:11px;color:var(--text2);font-family:monospace}
.swatch-name{font-size:10px;color:var(--text2);margin-top:2px;opacity:.6}
/* ── Links ── */
.links-section{padding:40px 24px 80px;text-align:center}
.links-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:24px}
.link-chip{background:var(--surf);border:1px solid rgba(255,255,255,0.08);padding:12px 24px;border-radius:100px;font-size:14px;text-decoration:none;color:var(--text2);transition:all .3s}
.link-chip:hover{border-color:var(--acc);color:var(--acc)}
/* ── Footer ── */
footer{border-top:1px solid rgba(255,255,255,0.06);padding:32px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:gap;gap:16px}
.footer-logo{font-size:14px;font-weight:800;letter-spacing:3px;color:var(--acc)}
.footer-note{font-size:12px;color:var(--text2)}
/* Glow pulse animation */
@keyframes glowPulse{0%,100%{opacity:.6}50%{opacity:1}}
.glow-dot{animation:glowPulse 2s ease-in-out infinite}
</style>
</head>
<body>
<nav>
  <span class="nav-logo">GLARE</span>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a></li>
    <li><a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a></li>
  </ul>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">Try Mock →</a>
</nav>

<section class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat #474</p>
  <h1 class="hero-title">Know your <span class="hero-acc">reach</span>.<br/>Own your <span class="hero-acc">revenue</span>.</h1>
  <p class="hero-sub">GLARE is the intelligence layer for independent creators — aggregating your cross-platform data into one glowing command centre.</p>
  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive mock →</a>
    <a class="btn-ghost"   href="https://ram.zenbin.org/${SLUG}-viewer">View pen file</a>
  </div>
  <div class="hero-stat-row">
    <div class="hero-stat"><div class="hero-stat-val">1.4M</div><div class="hero-stat-lab">Monthly reach tracked</div></div>
    <div class="hero-stat"><div class="hero-stat-val">$8.2K</div><div class="hero-stat-lab">Revenue surfaced</div></div>
    <div class="hero-stat"><div class="hero-stat-val">6</div><div class="hero-stat-lab">Screens designed</div></div>
    <div class="hero-stat"><div class="hero-stat-val">461</div><div class="hero-stat-lab">Elements crafted</div></div>
  </div>
</section>

<section id="screens" class="screens-section">
  <p class="section-label">All Screens</p>
  <h2 class="section-title">6 screens. One command.</h2>
  <div class="screens-scroll">
    ${pen.screens.map(s => `
    <div class="screen-card">
      <img src="${screenToDataUri(s)}" alt="${s.name}" loading="lazy"/>
      <div class="screen-card-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section id="features" class="features">
  <p class="section-label" style="text-align:center">Design Decisions</p>
  <h2 class="section-title" style="text-align:center">Built from research</h2>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon">⬡</div>
      <h3 class="feat-title">True-black canvas + glow accent</h3>
      <p class="feat-desc">Inspired by <span class="feat-acc">darkmodedesign.com/Neon</span> — data visualisation as the hero element. Electric <span class="feat-acc">#CAFF33</span> chartreuse on <span class="feat-acc">#050507</span> creates a neon-sign intensity without harsh contrast.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◎</div>
      <h3 class="feat-title">50% opacity secondary text</h3>
      <p class="feat-desc">Lifted directly from darkmodedesign.com's own UI — all secondary labels use <span class="feat-acc">rgba(255,255,255,0.5)</span> instead of a gray hex. Softer than a fixed gray, perfectly relative to any background.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◈</div>
      <h3 class="feat-title">Radial glyph chart as identity</h3>
      <p class="feat-desc">The dashboard hero is a multi-ring circle chart — platform breakdown at a glance. Concentric glowing rings replace a donut chart: more spatial, more emotional, more GLARE.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">▤</div>
      <h3 class="feat-title">Progressive glow on recent data</h3>
      <p class="feat-desc">On reach and revenue charts, only the last 5 bars glow at full chartreuse; earlier bars fade to 30% opacity. Directs the eye to what's fresh and relevant without legend clutter.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◉</div>
      <h3 class="feat-title">Signal score as a single number</h3>
      <p class="feat-desc">Borrowing from health apps, a <span class="feat-acc">0–100 Signal Score</span> aggregates platform momentum. One number. A progress bar. Then the raw signals underneath. Complexity hidden, insight surfaced.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⬡</div>
      <h3 class="feat-title">Rank-indexed content list</h3>
      <p class="feat-desc">Content screen uses large two-digit ordinal ranks (<span class="feat-acc">01–05</span>) in electric chartreuse — editorial sports-scoreboard energy — replacing icon thumbnails for clarity at small size.</p>
    </div>
  </div>
</section>

<section class="palette-section">
  <p class="section-label">Colour Palette</p>
  <h2 class="section-title">Dark — neon chartreuse system</h2>
  <div class="palette-row">
    <div class="swatch"><div class="swatch-color" style="background:#050507;border-color:rgba(255,255,255,0.15)"></div><div class="swatch-hex">#050507</div><div class="swatch-name">Near Black</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#0C0C11"></div><div class="swatch-hex">#0C0C11</div><div class="swatch-name">Surface</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#141418"></div><div class="swatch-hex">#141418</div><div class="swatch-name">Card</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#CAFF33"></div><div class="swatch-hex">#CAFF33</div><div class="swatch-name">Chartreuse</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#FF4F6A"></div><div class="swatch-hex">#FF4F6A</div><div class="swatch-name">Coral</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#6366F1"></div><div class="swatch-hex">#6366F1</div><div class="swatch-name">Indigo</div></div>
  </div>
</section>

<section class="links-section">
  <p class="section-label">Explore</p>
  <h2 class="section-title">Take it further</h2>
  <div class="links-row">
    <a class="link-chip" href="https://ram.zenbin.org/${SLUG}-viewer">Pen Viewer</a>
    <a class="link-chip" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span class="footer-logo">GLARE</span>
  <span class="footer-note">RAM Design Heartbeat #474 · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})} · Dark theme · 6 screens · 461 elements</span>
</footer>
</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0,120) : '✓');

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, `${NAME} — Pen Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0,120) : '✓');
}
main().catch(console.error);
