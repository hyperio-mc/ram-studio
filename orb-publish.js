'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'orb';

// Palette
const BG      = '#0D1117';
const SURF    = '#141920';
const CARD    = '#1A2130';
const CARD2   = '#1E2840';
const ACC     = '#E8B999';
const ACC2    = '#4BADA9';
const ACC3    = '#A78BFA';
const TEXT    = '#E8EDF5';
const MUTED   = 'rgba(232,237,245,0.45)';

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

// Generate screen SVGs from pen data for preview
function renderElementsToSvg(elements, w, h) {
  const shapes = elements.map(el => {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"` : '';
      const fill = el.fill && el.fill !== 'none' ? `fill="${el.fill}"` : 'fill="none"';
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" rx="${rx}" ${fill} ${stroke} opacity="${opacity}"/>`;
    }
    if (el.type === 'circle') {
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"` : '';
      const fill = el.fill && el.fill !== 'none' ? `fill="${el.fill}"` : 'fill="none"';
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" ${fill} ${stroke} opacity="${opacity}"/>`;
    }
    if (el.type === 'line') {
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${opacity}"/>`;
    }
    if (el.type === 'text') {
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      const fw = el.fontWeight || '400';
      const fs = el.fontSize || 12;
      const anchor = el.textAnchor || 'start';
      const ls = el.letterSpacing ? `letter-spacing="${el.letterSpacing}"` : '';
      const safe = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      return `<text x="${el.x}" y="${el.y}" font-size="${fs}" font-weight="${fw}" fill="${el.fill}" text-anchor="${anchor}" ${ls} opacity="${opacity}" font-family="Inter,system-ui,sans-serif">${safe}</text>`;
    }
    return '';
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${shapes}</svg>`;
}

const screens = pen.screens;
const svgPreviews = screens.map(s => renderElementsToSvg(s.elements, 390, 844));
const svgDataUris = svgPreviews.map(svg => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);

// ─── Hero Page ──────────────────────────────────────────────────────────────

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ORB — AI Media Intelligence</title>
<meta name="description" content="Track, understand, and act on your content performance with AI-powered signals.">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG}; --surf: ${SURF}; --card: ${CARD}; --card2: ${CARD2};
    --acc: ${ACC}; --acc2: ${ACC2}; --acc3: ${ACC3};
    --text: ${TEXT}; --muted: rgba(232,237,245,0.45); --dimmed: rgba(232,237,245,0.10);
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; min-height:100vh; overflow-x:hidden; }

  /* Ambient orbs */
  .orb { position:fixed; border-radius:50%; pointer-events:none; z-index:0; filter:blur(80px); }
  .orb-1 { width:600px; height:600px; background:radial-gradient(circle, rgba(232,185,153,0.18) 0%, transparent 70%); top:-100px; right:-100px; }
  .orb-2 { width:500px; height:500px; background:radial-gradient(circle, rgba(75,173,169,0.14) 0%, transparent 70%); bottom:200px; left:-150px; }
  .orb-3 { width:400px; height:400px; background:radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%); top:40%; left:40%; }

  /* Nav */
  nav { position:fixed; top:0; left:0; right:0; z-index:100; backdrop-filter:blur(20px); background:rgba(13,17,23,0.85); border-bottom:1px solid var(--dimmed); padding:0 24px; height:56px; display:flex; align-items:center; justify-content:space-between; }
  .nav-logo { font-size:18px; font-weight:800; color:var(--acc); letter-spacing:3px; }
  .nav-logo span { color:var(--text); font-weight:300; font-size:12px; letter-spacing:1px; margin-left:8px; opacity:0.6; }
  .nav-links { display:flex; gap:28px; align-items:center; }
  .nav-links a { color:var(--muted); text-decoration:none; font-size:13px; transition:color .2s; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta { background:var(--acc); color:${BG}; border:none; padding:8px 18px; border-radius:20px; font-size:12px; font-weight:700; cursor:pointer; }

  /* Hero */
  .hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:80px 24px 60px; position:relative; z-index:1; }
  .hero-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(167,139,250,0.12); border:1px solid rgba(167,139,250,0.3); border-radius:20px; padding:6px 16px; font-size:11px; font-weight:600; color:var(--acc3); margin-bottom:28px; letter-spacing:0.5px; }
  .hero-tag::before { content:'⚡'; }
  .hero-title { font-size:clamp(42px,8vw,84px); font-weight:900; line-height:1.05; letter-spacing:-2px; max-width:800px; }
  .hero-title .acc { color:var(--acc); }
  .hero-title .acc2 { color:var(--acc2); }
  .hero-sub { font-size:clamp(16px,2.5vw,20px); color:var(--muted); margin-top:20px; max-width:520px; line-height:1.6; }
  .hero-ctas { display:flex; gap:14px; margin-top:36px; flex-wrap:wrap; justify-content:center; }
  .btn-primary { background:var(--acc); color:${BG}; padding:14px 28px; border-radius:24px; font-weight:700; font-size:14px; text-decoration:none; transition:transform .2s, box-shadow .2s; }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(232,185,153,0.35); }
  .btn-secondary { background:rgba(255,255,255,0.06); color:var(--text); padding:14px 28px; border-radius:24px; font-weight:600; font-size:14px; text-decoration:none; border:1px solid var(--dimmed); transition:background .2s; }
  .btn-secondary:hover { background:rgba(255,255,255,0.1); }
  .hero-stats { display:flex; gap:40px; margin-top:48px; flex-wrap:wrap; justify-content:center; }
  .hero-stat { text-align:center; }
  .hero-stat .val { font-size:28px; font-weight:800; color:var(--text); }
  .hero-stat .lbl { font-size:11px; color:var(--muted); margin-top:2px; }

  /* Screen carousel */
  .screens-section { padding:80px 24px; position:relative; z-index:1; }
  .screens-section h2 { text-align:center; font-size:32px; font-weight:800; margin-bottom:8px; }
  .screens-section p { text-align:center; color:var(--muted); font-size:14px; margin-bottom:40px; }
  .carousel { display:flex; gap:20px; overflow-x:auto; padding:20px 0 28px; scroll-snap-type:x mandatory; scrollbar-width:none; }
  .carousel::-webkit-scrollbar { display:none; }
  .carousel-card { flex:0 0 220px; scroll-snap-align:start; }
  .carousel-card img { width:220px; height:477px; border-radius:20px; border:1px solid rgba(255,255,255,0.06); object-fit:cover; display:block; transition:transform .3s, box-shadow .3s; }
  .carousel-card img:hover { transform:translateY(-6px) scale(1.02); box-shadow:0 24px 60px rgba(0,0,0,0.5); }
  .carousel-card p { text-align:center; font-size:11px; color:var(--muted); margin-top:10px; font-weight:500; }

  /* Bento features */
  .features { padding:60px 24px 80px; position:relative; z-index:1; max-width:900px; margin:0 auto; }
  .features h2 { text-align:center; font-size:32px; font-weight:800; margin-bottom:8px; }
  .features p.sub { text-align:center; color:var(--muted); font-size:14px; margin-bottom:44px; }
  .bento { display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:auto auto auto; gap:16px; }
  .bento-cell { background:var(--card); border:1px solid rgba(255,255,255,0.06); border-radius:18px; padding:24px; position:relative; overflow:hidden; transition:border-color .2s; }
  .bento-cell:hover { border-color:rgba(255,255,255,0.12); }
  .bento-wide { grid-column:span 2; }
  .bento-tall { grid-row:span 2; }
  .bento-cell .icon { font-size:24px; margin-bottom:12px; }
  .bento-cell h3 { font-size:15px; font-weight:700; margin-bottom:8px; }
  .bento-cell p { font-size:12px; color:var(--muted); line-height:1.6; }
  .bento-cell .glow { position:absolute; bottom:-30px; right:-30px; width:100px; height:100px; border-radius:50%; filter:blur(40px); pointer-events:none; }
  .glow-amber { background:rgba(232,185,153,0.25); }
  .glow-teal  { background:rgba(75,173,169,0.25); }
  .glow-viol  { background:rgba(167,139,250,0.25); }
  .metric-preview { margin-top:16px; }
  .metric-num { font-size:36px; font-weight:900; color:var(--acc); }
  .metric-lbl { font-size:11px; color:var(--muted); margin-top:2px; }
  .metric-delta { font-size:11px; color:#4ADE80; margin-top:4px; font-weight:600; }

  /* Mini bar chart in bento */
  .mini-bars { display:flex; gap:3px; align-items:flex-end; height:40px; margin-top:14px; }
  .mini-bar { flex:1; border-radius:3px 3px 0 0; }

  /* Palette strip */
  .palette-section { padding:60px 24px; position:relative; z-index:1; max-width:700px; margin:0 auto; text-align:center; }
  .palette-section h2 { font-size:24px; font-weight:800; margin-bottom:8px; }
  .palette-section p { color:var(--muted); font-size:13px; margin-bottom:28px; }
  .swatches { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  .swatch { display:flex; flex-direction:column; align-items:center; gap:6px; }
  .swatch-color { width:56px; height:56px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); }
  .swatch-label { font-size:10px; color:var(--muted); font-weight:500; }
  .swatch-hex { font-size:9px; color:rgba(232,237,245,0.3); }

  /* Footer */
  footer { text-align:center; padding:40px 24px; color:var(--muted); font-size:12px; border-top:1px solid var(--dimmed); position:relative; z-index:1; }
  footer a { color:var(--acc); text-decoration:none; }
  footer .links { display:flex; gap:20px; justify-content:center; margin-top:12px; }

  @media (max-width:640px) {
    .bento { grid-template-columns:1fr 1fr; }
    .bento-wide { grid-column:span 2; }
    .nav-links { display:none; }
    .hero-stats { gap:24px; }
  }
</style>
</head>
<body>
<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<div class="orb orb-3"></div>

<nav>
  <div class="nav-logo">ORB<span>· Intelligence</span></div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/orb-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/orb-mock">Mock ☀◑</a>
  </div>
  <button class="nav-cta">Get Early Access</button>
</nav>

<section class="hero">
  <div class="hero-tag">AI Media Intelligence · Heartbeat #499</div>
  <h1 class="hero-title">
    Know what your<br>
    <span class="acc">content</span> is doing.<br>
    <span class="acc2">Act</span> on it.
  </h1>
  <p class="hero-sub">ORB watches every article, video, and podcast you publish — and surfaces the signals that actually matter.</p>
  <div class="hero-ctas">
    <a class="btn-primary" href="https://ram.zenbin.org/orb-viewer">View in Pencil.dev →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/orb-mock">Interactive Mock ☀◑</a>
  </div>
  <div class="hero-stats">
    <div class="hero-stat"><div class="val">6</div><div class="lbl">Screens</div></div>
    <div class="hero-stat"><div class="val">670</div><div class="lbl">Elements</div></div>
    <div class="hero-stat"><div class="val">#499</div><div class="lbl">Heartbeat</div></div>
    <div class="hero-stat"><div class="val">Dark</div><div class="lbl">Theme</div></div>
  </div>
</section>

<section class="screens-section" id="screens">
  <h2>6 Screens</h2>
  <p>Dashboard · Content · Audience · AI Signals · Distribute · Settings</p>
  <div class="carousel">
    ${svgDataUris.map((uri, i) => `
    <div class="carousel-card">
      <img src="${uri}" alt="${pen.screens[i].name}" loading="lazy">
      <p>${pen.screens[i].name}</p>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <h2>Built for media teams</h2>
  <p class="sub">Inspired by saaspo.com's bento grid trend in AI-native SaaS — modular, scannable, dense with meaning.</p>
  <div class="bento">
    <div class="bento-cell bento-wide">
      <div class="icon">◉</div>
      <h3>Bento Dashboard</h3>
      <p>The whole picture at once. Reach, engagement, top content, and AI signals — arranged in a modular bento grid that scales from mobile to large display.</p>
      <div class="mini-bars">
        ${[45,62,58,71,55,80,75,90,84,95].map((v,i) => `<div class="mini-bar" style="height:${v*0.4}px;background:${i===9?'#E8B999':'rgba(232,185,153,0.3)'}"></div>`).join('')}
      </div>
      <div class="glow glow-amber"></div>
    </div>
    <div class="bento-cell">
      <div class="icon">⚡</div>
      <h3>AI Signals</h3>
      <p>ORB Intelligence detects trends, risks, and opportunities before your team does — with confidence scores and recommended actions.</p>
      <div class="glow glow-viol"></div>
    </div>
    <div class="bento-cell bento-tall">
      <div class="icon">◎</div>
      <h3>Audience Intelligence</h3>
      <p>Age distribution, peak reading times, top locations, device split — all surfaced without installing a single pixel or script.</p>
      <div class="metric-preview">
        <div class="metric-num">2.4M</div>
        <div class="metric-lbl">Total Reach</div>
        <div class="metric-delta">▲ +12.3% this month</div>
      </div>
      <div class="glow glow-teal"></div>
    </div>
    <div class="bento-cell">
      <div class="icon">▦</div>
      <h3>Content Feed</h3>
      <p>Every piece of content with live sparklines, channel tags, and performance status — trending, growing, stable, or at risk.</p>
      <div class="glow glow-amber"></div>
    </div>
    <div class="bento-cell">
      <div class="icon">↗</div>
      <h3>Distribution Calendar</h3>
      <p>Schedule across Newsletter, Blog, YouTube, and Podcast from one calendar. Track send status and channel health scores in real time.</p>
      <div class="glow glow-teal"></div>
    </div>
    <div class="bento-cell bento-wide">
      <div class="icon">🔮</div>
      <h3>Glassmorphism UI System</h3>
      <p>Frosted glass cards with ambient gradient orbs inspired by darkmodedesign.com's Analytics SaaS palette — warm amber (#E8B999) and teal (#4BADA9) on near-black (#0D1117). Every card is tactile and layered.</p>
      <div class="glow glow-viol"></div>
    </div>
  </div>
</section>

<section class="palette-section">
  <h2>Palette</h2>
  <p>Inspired by darkmodedesign.com's Analytics SaaS palette — warm amber meets teal on near-black with a violet glow accent.</p>
  <div class="swatches">
    ${[
      {hex:BG, label:'BG'},
      {hex:SURF, label:'Surface'},
      {hex:CARD, label:'Card'},
      {hex:ACC, label:'Amber'},
      {hex:ACC2, label:'Teal'},
      {hex:ACC3, label:'Violet'},
      {hex:TEXT, label:'Text'},
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-label">${s.label}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div>RAM Design Heartbeat #499 · April 12, 2026</div>
  <div class="links">
    <a href="https://ram.zenbin.org/orb">Hero</a>
    <a href="https://ram.zenbin.org/orb-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/orb-mock">Interactive Mock</a>
  </div>
  <div style="margin-top:10px;opacity:0.4">Inspired by darkmodedesign.com · saaspo.com</div>
</footer>
</body>
</html>`;

// ─── Viewer ──────────────────────────────────────────────────────────────────

let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ─────────────────────────────────────────────────────────────────

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'ORB — AI Media Intelligence');
  console.log(`Hero:   ${r1.status}  https://ram.zenbin.org/${SLUG}`);

  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'ORB — Viewer');
  console.log(`Viewer: ${r2.status}  https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
