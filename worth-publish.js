'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'worth';
const APP_NAME = 'WORTH';
const TAGLINE = 'your money, as a story';

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

// ── Palette ────────────────────────────────────────────────────────────
const P = {
  bg:      '#FAF7F2',
  surface: '#FFFFFF',
  card:    '#F5F0E8',
  text:    '#1A1614',
  textMid: '#5A5350',
  textDim: '#9A918C',
  green:   '#2C6B3F',
  greenLt: '#EBF5EE',
  amber:   '#C47D3A',
  amberLt: '#FDF3E7',
  border:  '#E8E0D4',
};

// ── Generate SVG preview thumbnails from pen screens ──────────────────
function screenToDataUri(screen) {
  const W = 390, H = 844;
  const elemSvg = (screen.elements || []).map(e => {
    if (e.type === 'rect') {
      const rx = e.rx || 0;
      const stroke = e.stroke !== 'none' ? `stroke="${e.stroke}" stroke-width="${e.sw||1}"` : '';
      return `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="${e.fill}" rx="${rx}" opacity="${e.opacity||1}" ${stroke}/>`;
    }
    if (e.type === 'text') {
      const anchor = e.anchor || 'start';
      const fw = e.fw || '400';
      const font = e.font || 'Inter, sans-serif';
      const opacity = e.opacity || 1;
      return `<text x="${e.x}" y="${e.y}" font-size="${e.size}" fill="${e.fill}" font-weight="${fw}" font-family="${font}" text-anchor="${anchor}" opacity="${opacity}" letter-spacing="${e.ls||0}">${e.content}</text>`;
    }
    if (e.type === 'circle') {
      const stroke = e.stroke !== 'none' ? `stroke="${e.stroke}" stroke-width="${e.sw||1}"` : '';
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity||1}" ${stroke}/>`;
    }
    if (e.type === 'line') {
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.sw||1}" opacity="${e.opacity||1}"/>`;
    }
    return '';
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${elemSvg}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const screenUris = pen.screens.map(screenToDataUri);

// ── Hero HTML ──────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      ${P.bg};
    --surface: ${P.surface};
    --card:    ${P.card};
    --text:    ${P.text};
    --mid:     ${P.textMid};
    --dim:     ${P.textDim};
    --green:   ${P.green};
    --greenLt: ${P.greenLt};
    --amber:   ${P.amber};
    --amberLt: ${P.amberLt};
    --border:  ${P.border};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }
  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(250,247,242,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 14px 32px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-brand {
    font-family: 'Instrument Serif', serif;
    font-size: 1.4rem;
    color: var(--green);
    letter-spacing: 2px;
  }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { text-decoration: none; color: var(--mid); font-size: 0.875rem; transition: color 0.2s; }
  .nav-links a:hover { color: var(--green); }
  .nav-cta {
    background: var(--green);
    color: white;
    padding: 9px 22px;
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.2s;
  }
  .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 100px 32px 60px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; top: -200px; right: -200px;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(44,107,63,0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute; bottom: -100px; left: -100px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(196,125,58,0.07) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  .hero-inner {
    max-width: 1100px; width: 100%;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
  }
  .hero-label {
    display: inline-block;
    background: var(--greenLt);
    color: var(--green);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 20px;
  }
  .hero-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(3.2rem, 6vw, 5.2rem);
    line-height: 1.1;
    margin-bottom: 20px;
    color: var(--text);
  }
  .hero-title .accent { color: var(--green); }
  .hero-title em { font-style: italic; }
  .hero-sub {
    font-size: 1.1rem;
    color: var(--mid);
    max-width: 420px;
    margin-bottom: 36px;
    line-height: 1.75;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--green);
    color: white;
    padding: 14px 30px;
    border-radius: 100px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.2s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { opacity: 0.88; transform: translateY(-2px); }
  .btn-outline {
    border: 1.5px solid var(--border);
    color: var(--text);
    background: var(--surface);
    padding: 13px 28px;
    border-radius: 100px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: border-color 0.2s, transform 0.2s;
  }
  .btn-outline:hover { border-color: var(--green); transform: translateY(-2px); }
  .hero-phones {
    position: relative;
    display: flex;
    justify-content: center; align-items: center;
    height: 540px;
  }
  .phone-frame {
    position: absolute;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(26,22,20,0.12), 0 4px 12px rgba(26,22,20,0.08);
    border: 1px solid var(--border);
    background: var(--surface);
  }
  .phone-frame img { display: block; width: 100%; height: auto; }
  .phone-main {
    width: 220px; top: 20px; left: 50%; transform: translateX(-50%);
    z-index: 3;
  }
  .phone-left {
    width: 185px; top: 80px; left: 0;
    transform: rotate(-5deg);
    z-index: 2; opacity: 0.9;
  }
  .phone-right {
    width: 185px; top: 100px; right: 0;
    transform: rotate(5deg);
    z-index: 2; opacity: 0.9;
  }

  /* PROOF BAR */
  .proof-bar {
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 18px 32px;
    display: flex; justify-content: center; gap: 60px; flex-wrap: wrap;
  }
  .proof-item { text-align: center; }
  .proof-num {
    font-family: 'Instrument Serif', serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
  }
  .proof-label { font-size: 0.78rem; color: var(--dim); margin-top: 2px; }

  /* FEATURES BENTO */
  section { padding: 80px 32px; }
  .section-label {
    text-align: center;
    display: inline-block;
    background: var(--card);
    color: var(--mid);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 14px;
  }
  .section-title {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 4vw, 3.2rem);
    text-align: center;
    margin-bottom: 48px;
    color: var(--text);
    max-width: 560px;
    margin-left: auto; margin-right: auto;
  }
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: 16px;
    max-width: 1000px;
    margin: 0 auto;
  }
  .bento-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .bento-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(26,22,20,0.08);
  }
  .bento-card.large { grid-column: span 2; }
  .bento-card.green-bg { background: var(--greenLt); border-color: transparent; }
  .bento-card.amber-bg { background: var(--amberLt); border-color: transparent; }
  .bento-icon { font-size: 1.8rem; margin-bottom: 14px; }
  .bento-card h3 {
    font-family: 'Instrument Serif', serif;
    font-size: 1.25rem;
    margin-bottom: 8px;
    color: var(--text);
  }
  .bento-card p { font-size: 0.875rem; color: var(--mid); line-height: 1.65; }
  .bento-stat {
    font-family: 'Instrument Serif', serif;
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--green);
    margin-top: 12px;
  }
  .bento-sub { font-size: 0.8rem; color: var(--mid); }

  /* SCREENS CAROUSEL */
  .screens-section { background: var(--card); }
  .screens-row {
    display: flex; gap: 20px; overflow-x: auto;
    padding: 20px 0 32px;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .screen-card {
    flex: 0 0 200px;
    scroll-snap-align: start;
    background: var(--surface);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(26,22,20,0.1);
    border: 1px solid var(--border);
    transition: transform 0.25s;
    cursor: pointer;
  }
  .screen-card:hover { transform: translateY(-6px) scale(1.02); }
  .screen-card img { display: block; width: 100%; height: auto; }
  .screen-label {
    padding: 10px 14px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--mid);
    border-top: 1px solid var(--border);
  }

  /* PALETTE */
  .palette-section { text-align: center; }
  .palette-row {
    display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;
    margin-top: 24px;
  }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .swatch-color {
    width: 56px; height: 56px; border-radius: 14px;
    border: 1px solid var(--border);
  }
  .swatch-label { font-size: 0.7rem; color: var(--dim); }
  .swatch-hex { font-size: 0.68rem; color: var(--textDim); font-family: monospace; }

  /* FOOTER */
  footer {
    background: var(--text);
    color: rgba(250,247,242,0.7);
    padding: 40px 32px;
    text-align: center;
  }
  .footer-brand {
    font-family: 'Instrument Serif', serif;
    font-size: 1.8rem;
    color: ${P.bg};
    letter-spacing: 3px;
    margin-bottom: 8px;
  }
  footer a { color: rgba(250,247,242,0.6); text-decoration: none; margin: 0 12px; font-size: 0.85rem; }
  footer a:hover { color: rgba(250,247,242,1); }
  footer .credit { font-size: 0.75rem; margin-top: 20px; color: rgba(250,247,242,0.35); }

  @media (max-width: 768px) {
    .hero-inner { grid-template-columns: 1fr; text-align: center; }
    .hero-phones { display: none; }
    .bento-grid { grid-template-columns: 1fr; }
    .bento-card.large { grid-column: span 1; }
    .proof-bar { gap: 30px; }
    nav .nav-links { display: none; }
  }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-brand">WORTH</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/worth-viewer">Viewer</a>
  </div>
  <a href="https://ram.zenbin.org/worth-mock" class="nav-cta">Interactive Mock ☀◑</a>
</nav>

<!-- HERO -->
<section class="hero" id="hero">
  <div class="hero-inner">
    <div class="hero-copy">
      <span class="hero-label">RAM Design Heartbeat · Apr 2026</span>
      <h1 class="hero-title">
        Your money,<br>
        <em class="accent">as a story</em><br>
        worth telling.
      </h1>
      <p class="hero-sub">
        WORTH transforms dry financial data into an editorial narrative — warm, readable, personal. Know where you stand, and why.
      </p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/worth-viewer" class="btn-primary">View Design ↗</a>
        <a href="https://ram.zenbin.org/worth-mock" class="btn-outline">Interactive Mock ☀◑</a>
      </div>
    </div>
    <div class="hero-phones">
      <div class="phone-frame phone-left">
        <img src="${screenUris[2]}" alt="Spending screen" loading="lazy">
      </div>
      <div class="phone-frame phone-main">
        <img src="${screenUris[0]}" alt="Overview screen" loading="lazy">
      </div>
      <div class="phone-frame phone-right">
        <img src="${screenUris[4]}" alt="Goals screen" loading="lazy">
      </div>
    </div>
  </div>
</section>

<!-- PROOF BAR -->
<div class="proof-bar">
  <div class="proof-item">
    <div class="proof-num">6</div>
    <div class="proof-label">Screens</div>
  </div>
  <div class="proof-item">
    <div class="proof-num">431</div>
    <div class="proof-label">Elements</div>
  </div>
  <div class="proof-item">
    <div class="proof-num">Light</div>
    <div class="proof-label">Theme</div>
  </div>
  <div class="proof-item">
    <div class="proof-num">Cream</div>
    <div class="proof-label">Palette</div>
  </div>
  <div class="proof-item">
    <div class="proof-num">Bento</div>
    <div class="proof-label">Layout</div>
  </div>
</div>

<!-- FEATURES BENTO -->
<section id="features">
  <div style="text-align:center">
    <span class="section-label">Features</span>
    <h2 class="section-title">Finance as editorial, not spreadsheet</h2>
  </div>
  <div class="bento-grid">
    <div class="bento-card large green-bg">
      <div class="bento-icon">📖</div>
      <h3>Your money story, every month</h3>
      <p>WORTH reads your data and writes a brief, plain-language narrative — patterns, risks, wins — so you never have to parse a chart to understand what's happening.</p>
      <div class="bento-stat">+$1,840</div>
      <div class="bento-sub">monthly cashflow — April</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🧩</div>
      <h3>Bento dashboard</h3>
      <p>Inspired by the 2025-2026 dominant grid layout — each tile tells one story at a glance.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🎯</div>
      <h3>Goal tracking</h3>
      <p>Set milestones with deadlines. WORTH shows pace, not just progress, so you know if you're on track before it's too late.</p>
    </div>
    <div class="bento-card amber-bg">
      <div class="bento-icon">📊</div>
      <h3>Spending clarity</h3>
      <p>Six spending categories, visualised as a bento grid with mini progress bars. Patterns emerge immediately.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🌱</div>
      <h3>Investment portfolio</h3>
      <p>Holdings, allocation, daily change — editorial layout, not a Bloomberg terminal.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">⚡</div>
      <h3>Smart insights</h3>
      <p>Patterns, nudges, and actions — surfaced as readable cards, not notification spam.</p>
    </div>
  </div>
</section>

<!-- SCREENS CAROUSEL -->
<section class="screens-section" id="screens">
  <div style="max-width:1000px;margin:0 auto">
    <div style="text-align:center">
      <span class="section-label">All screens</span>
      <h2 class="section-title">6 screens, every flow covered</h2>
    </div>
    <div class="screens-row">
      ${pen.screens.map((sc, i) => `
      <div class="screen-card">
        <img src="${screenUris[i]}" alt="${sc.name}" loading="lazy">
        <div class="screen-label">${sc.name}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section" id="palette">
  <span class="section-label">Palette</span>
  <h2 class="section-title">Warm cream editorial</h2>
  <p style="color:var(--mid);font-size:0.9rem;max-width:420px;margin:0 auto 24px;">
    Inspired by Land-Book's 2026 warm neutral trend: cream backgrounds replacing cold white, forest green for growth, amber warmth for caution.
  </p>
  <div class="palette-row">
    ${[
      {hex:'#FAF7F2', name:'Warm Cream', role:'Background'},
      {hex:'#FFFFFF', name:'White', role:'Surface'},
      {hex:'#F5F0E8', name:'Parchment', role:'Card'},
      {hex:'#2C6B3F', name:'Forest Green', role:'Primary accent'},
      {hex:'#C47D3A', name:'Warm Amber', role:'Secondary accent'},
      {hex:'#1A1614', name:'Warm Black', role:'Text'},
      {hex:'#9A918C', name:'Stone', role:'Muted text'},
      {hex:'#E8E0D4', name:'Linen', role:'Border'},
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-label">${s.name}</div>
      <div class="swatch-hex">${s.hex}</div>
      <div class="swatch-label" style="color:var(--dim);font-size:0.65rem">${s.role}</div>
    </div>`).join('')}
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-brand">WORTH</div>
  <p style="font-size:0.85rem;margin-bottom:12px">${TAGLINE}</p>
  <div>
    <a href="https://ram.zenbin.org/worth-viewer">Design Viewer</a>
    <a href="https://ram.zenbin.org/worth-mock">Interactive Mock</a>
  </div>
  <p class="credit">RAM Design Heartbeat · April 2026 · Inspired by Land-Book warm editorial systems</p>
</footer>

</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

async function main() {
  console.log('Publishing hero page...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0,80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0,80)}`);
}

main().catch(console.error);
