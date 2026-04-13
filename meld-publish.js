'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'meld';
const APP     = 'MELD';
const TAGLINE = 'Privacy-first data pipeline monitor';

// Palette
const BG  = '#060C18';
const ACC = '#3A82FF';
const ACC2= '#22C55E';
const PUR = '#8B5CF6';
const ERR = '#EF4444';
const WARN= '#F59E0B';
const TEXT= '#E0E8F8';
const MUTE= '#5E78A0';

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
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);
const screens = pen.screens;

// ── Build SVG data URIs from element arrays ──────────────────────────────────
function elToSvg(el) {
  if (el.type === 'rect') {
    const fill = el.fill === 'none' ? 'none' : el.fill;
    const op   = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    const rx   = el.rx ? ` rx="${el.rx}"` : '';
    const str  = (el.stroke && el.stroke !== 'none') ? ` stroke="${el.stroke}" stroke-width="${el.sw||1}"` : '';
    return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${fill}"${rx}${str}${op}/>`;
  }
  if (el.type === 'text') {
    const anchor = el.anchor === 'middle' ? 'middle' : el.anchor === 'end' ? 'end' : 'start';
    const op     = el.opacity !== undefined && el.opacity < 1 ? ` opacity="${el.opacity}"` : '';
    const ls     = el.ls ? ` letter-spacing="${el.ls}"` : '';
    const content= String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw||400}" font-family="${el.font||'Inter'},system-ui,sans-serif" text-anchor="${anchor}"${ls}${op}>${content}</text>`;
  }
  if (el.type === 'circle') {
    const op  = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    const str = (el.stroke && el.stroke !== 'none') ? ` stroke="${el.stroke}" stroke-width="${el.sw||1}"` : '';
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${str}${op}/>`;
  }
  if (el.type === 'line') {
    const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw||1}" stroke-linecap="round"${op}/>`;
  }
  return '';
}

function screenToSvgUri(screen) {
  const W = 390, H = 844;
  const inner = screen.elements.map(elToSvg).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${inner}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const svgUris = screens.map(s => ({ name: s.name, uri: screenToSvgUri(s) }));

// ── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${BG};--surf:${ACC}18;--acc:${ACC};--acc2:${ACC2};--pur:${PUR};
  --err:${ERR};--warn:${WARN};--text:${TEXT};--mute:${MUTE};
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;overflow-x:hidden;line-height:1.5}

/* Ambient orb backgrounds */
.orb{position:fixed;border-radius:50%;pointer-events:none;filter:blur(80px);opacity:.18;z-index:0}
.orb-1{width:600px;height:600px;background:var(--acc);top:-100px;right:-150px}
.orb-2{width:400px;height:400px;background:var(--acc2);bottom:200px;left:-100px}
.orb-3{width:300px;height:300px;background:var(--pur);bottom:100px;right:100px}

.wrap{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:0 24px}

/* NAV */
nav{position:sticky;top:0;z-index:100;background:rgba(6,12,24,.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06);padding:16px 0}
nav .inner{display:flex;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto;padding:0 24px}
.logo{font-size:20px;font-weight:800;letter-spacing:.18em;color:var(--text)}
.logo span{color:var(--acc)}
.nav-links{display:flex;gap:32px;align-items:center}
.nav-links a{color:var(--mute);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:rgba(58,130,255,.18);color:var(--acc);border:1px solid rgba(58,130,255,.4);padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;transition:all .2s}
.nav-cta:hover{background:rgba(58,130,255,.3)}

/* HERO */
.hero{padding:96px 0 64px;text-align:center}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(58,130,255,.1);border:1px solid rgba(58,130,255,.25);border-radius:20px;padding:6px 16px;font-size:12px;font-weight:600;color:var(--acc);letter-spacing:.06em;margin-bottom:28px}
.hero-eyebrow::before{content:'';width:6px;height:6px;background:var(--acc2);border-radius:50%;display:inline-block}
h1{font-size:clamp(42px,6vw,80px);font-weight:800;line-height:1.05;letter-spacing:-.03em;margin-bottom:20px}
h1 .grad{background:linear-gradient(135deg,var(--acc) 0%,var(--pur) 60%,var(--acc2) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{font-size:18px;color:var(--mute);max-width:560px;margin:0 auto 40px;line-height:1.6;font-weight:400}
.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
.btn-primary{background:linear-gradient(135deg,var(--acc),#6366f1);color:#fff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 0 30px rgba(58,130,255,.3)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 4px 40px rgba(58,130,255,.45)}
.btn-sec{background:rgba(255,255,255,.06);color:var(--text);border:1px solid rgba(255,255,255,.1);padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;text-decoration:none;transition:all .2s}
.btn-sec:hover{background:rgba(255,255,255,.1)}

/* SCREEN CAROUSEL */
.carousel{display:flex;gap:20px;overflow-x:auto;padding:0 0 20px;scrollbar-width:thin;scrollbar-color:rgba(58,130,255,.3) transparent;margin-bottom:80px}
.carousel::-webkit-scrollbar{height:4px}
.carousel::-webkit-scrollbar-thumb{background:rgba(58,130,255,.35);border-radius:2px}
.screen-card{flex-shrink:0;position:relative}
.screen-label{text-align:center;font-size:11px;font-weight:600;color:var(--mute);letter-spacing:.08em;margin-bottom:10px;text-transform:uppercase}
.phone{width:195px;height:422px;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,.08);box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04);position:relative}
.phone img{width:100%;height:100%;object-fit:cover;display:block}
.phone::after{content:'';position:absolute;inset:0;border-radius:28px;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(0,0,0,.3)}

/* FEATURES */
.features{padding:80px 0}
.section-label{font-size:11px;font-weight:700;letter-spacing:.14em;color:var(--acc);text-transform:uppercase;margin-bottom:16px}
h2{font-size:clamp(28px,4vw,42px);font-weight:700;letter-spacing:-.025em;margin-bottom:16px;line-height:1.15}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:48px}
.feat-card{background:rgba(13,22,37,.8);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:border-color .25s}
.feat-card:hover{border-color:rgba(58,130,255,.3)}
.feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:2px 2px 0 0;opacity:.6}
.feat-card.blue::before{background:var(--acc)}
.feat-card.green::before{background:var(--acc2)}
.feat-card.purple::before{background:var(--pur)}
.feat-card.red::before{background:var(--err)}
.feat-icon{width:40px;height:40px;border-radius:10px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:18px}
.feat-card h3{font-size:17px;font-weight:600;margin-bottom:8px}
.feat-card p{font-size:14px;color:var(--mute);line-height:1.6}

/* STATS */
.stats{padding:64px 0;display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.stat{text-align:center;background:rgba(13,22,37,.6);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:28px 16px}
.stat-val{font-size:36px;font-weight:800;letter-spacing:-.03em;margin-bottom:6px}
.stat-lbl{font-size:13px;color:var(--mute);font-weight:400}

/* PALETTE */
.palette-section{padding:64px 0}
.palette-row{display:flex;gap:12px;margin-top:24px;flex-wrap:wrap}
.swatch{flex:1;min-width:100px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.07)}
.swatch-color{height:64px}
.swatch-info{padding:10px 12px;background:rgba(13,22,37,.8)}
.swatch-info .hex{font-size:11px;font-family:'Inter Mono',monospace;color:var(--text);font-weight:600}
.swatch-info .role{font-size:10px;color:var(--mute);margin-top:2px}

/* LINKS */
.links-section{padding:64px 0;text-align:center}
.link-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:24px}
.link-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;transition:all .2s;border:1px solid}
.link-btn.primary{background:rgba(58,130,255,.15);color:var(--acc);border-color:rgba(58,130,255,.35)}
.link-btn.primary:hover{background:rgba(58,130,255,.25)}
.link-btn.secondary{background:rgba(255,255,255,.05);color:var(--text);border-color:rgba(255,255,255,.1)}
.link-btn.secondary:hover{background:rgba(255,255,255,.1)}

/* FOOTER */
footer{padding:40px 0;border-top:1px solid rgba(255,255,255,.06);text-align:center;color:var(--mute);font-size:13px}
footer span{color:var(--acc)}

@media(max-width:640px){
  .stats{grid-template-columns:repeat(2,1fr)}
  h1{font-size:36px}
  .nav-links{display:none}
}
</style>
</head>
<body>

<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<div class="orb orb-3"></div>

<nav>
  <div class="inner">
    <div class="logo">ME<span>LD</span></div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#screens">Screens</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Interactive Mock ☀◑</a>
    </div>
  </div>
</nav>

<section class="hero">
  <div class="wrap">
    <div class="hero-eyebrow">RAM Design Heartbeat · Dark UI</div>
    <h1>Unified Data<br/><span class="grad">Pipeline Monitor</span></h1>
    <p class="hero-sub">Dark glassmorphism UI for real-time event stream monitoring. Ambient orb backgrounds, bento-grid dashboards, inner-glow interactions.</p>
    <div class="hero-btns">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">☀◑ Interactive Mock</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-sec">Open in Viewer →</a>
    </div>
  </div>

  <!-- Screen carousel -->
  <div class="wrap" id="screens">
    <div class="carousel">
      ${svgUris.map(s => `
      <div class="screen-card">
        <div class="screen-label">${s.name}</div>
        <div class="phone">
          <img src="${s.uri}" alt="${s.name}"/>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="wrap">
    <div class="section-label">Design Decisions</div>
    <h2>Dark Glassmorphism<br/>Built for Data Density</h2>
    <div class="feat-grid">
      <div class="feat-card blue">
        <div class="feat-icon" style="background:rgba(58,130,255,.15)">🌐</div>
        <h3>Ambient Orb Backgrounds</h3>
        <p>Inspired by darkmodedesign.com's Cosmos Studio — layered circles simulate radial gradient orbs without WebGL, creating depth through pure SVG composition.</p>
      </div>
      <div class="feat-card green">
        <div class="feat-icon" style="background:rgba(34,197,94,.15)">⬡</div>
        <h3>Bento-Grid Dashboard</h3>
        <p>From saaspo.com's Betterstack analysis — modular card layout lets data breathe while maintaining hierarchy: hero metric → two-column row → three-column stats → activity feed.</p>
      </div>
      <div class="feat-card purple">
        <div class="feat-icon" style="background:rgba(139,92,246,.15)">✦</div>
        <h3>Inner-Glow Stroke Effects</h3>
        <p>Darkroom's brand alignment principle: light-emitting borders replace drop-shadows. Every interactive element uses an inset glow ring and accent-color top-edge highlight to signal focus.</p>
      </div>
      <div class="feat-card red">
        <div class="feat-icon" style="background:rgba(239,68,68,.15)">⚡</div>
        <h3>Monospace Event Stream</h3>
        <p>The Event Log screen uses Inter Mono throughout — merging developer-tool aesthetic with glassmorphic panels. Log entries get left-edge severity stripes with CRITICAL/WARN/INFO color coding.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="stats">
      <div class="stat">
        <div class="stat-val" style="color:${ACC}">6</div>
        <div class="stat-lbl">Screens</div>
      </div>
      <div class="stat">
        <div class="stat-val" style="color:${ACC2}">793</div>
        <div class="stat-lbl">Elements</div>
      </div>
      <div class="stat">
        <div class="stat-val" style="color:${PUR}">Dark</div>
        <div class="stat-lbl">Theme</div>
      </div>
      <div class="stat">
        <div class="stat-val" style="color:${WARN}">#18</div>
        <div class="stat-lbl">Heartbeat</div>
      </div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="wrap">
    <div class="section-label">Palette</div>
    <h2>Deep Navy Glassmorphism</h2>
    <div class="palette-row">
      ${[
        { hex:BG,   role:'Background — deep navy near-black' },
        { hex:ACC,  role:'Electric Blue — primary accent' },
        { hex:ACC2, role:'Neon Green — success / live states' },
        { hex:PUR,  role:'Purple — secondary accent / depth' },
        { hex:ERR,  role:'Red — critical alerts' },
        { hex:WARN, role:'Amber — warnings' },
        { hex:TEXT, role:'Text — off-white blue-tinted' },
        { hex:MUTE, role:'Muted — navy-tinted secondary' },
      ].map(s=>`<div class="swatch">
        <div class="swatch-color" style="background:${s.hex}"></div>
        <div class="swatch-info">
          <div class="hex">${s.hex}</div>
          <div class="role">${s.role}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="links-section">
  <div class="wrap">
    <div class="section-label">Explore</div>
    <h2>View the Design</h2>
    <div class="link-row">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-btn primary">☀◑ Interactive Mock — light/dark toggle</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-btn secondary">Pencil Viewer</a>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <p>Designed by <span>RAM</span> · Heartbeat #18 · ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
    <p style="margin-top:6px">Inspired by darkmodedesign.com (Qase, Cosmos Studio, Darkroom) + saaspo.com (Betterstack bento grids)</p>
  </div>
</footer>

</body>
</html>`;

// ── Viewer HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status===201?'✓':'— '+r1.body.slice(0,80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status===201?'✓':'— '+r2.body.slice(0,80)}`);
}
main().catch(console.error);
