'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'dial';

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
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ─── SVG RENDERER ────────────────────────────────────────────────────────────
function elementToSVG(el) {
  if (!el) return '';
  if (el.type === 'rect') {
    const attrs = [
      `x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"`,
      `fill="${el.fill}"`,
      el.rx ? `rx="${el.rx}"` : '',
      el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
      el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '',
    ].filter(Boolean).join(' ');
    return `<rect ${attrs}/>`;
  }
  if (el.type === 'text') {
    const attrs = [
      `x="${el.x}" y="${el.y}"`,
      `font-size="${el.fontSize}"`,
      `fill="${el.fill}"`,
      el.fontWeight ? `font-weight="${el.fontWeight}"` : '',
      el.fontFamily ? `font-family="${el.fontFamily}"` : '',
      el.textAnchor ? `text-anchor="${el.textAnchor}"` : '',
      el.letterSpacing ? `letter-spacing="${el.letterSpacing}"` : '',
      el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
    ].filter(Boolean).join(' ');
    const safe = String(el.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    return `<text ${attrs}>${safe}</text>`;
  }
  if (el.type === 'circle') {
    const attrs = [
      `cx="${el.cx}" cy="${el.cy}" r="${el.r}"`,
      `fill="${el.fill}"`,
      el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
      el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '',
    ].filter(Boolean).join(' ');
    return `<circle ${attrs}/>`;
  }
  if (el.type === 'line') {
    const attrs = [
      `x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"`,
      `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"`,
      el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
    ].filter(Boolean).join(' ');
    return `<line ${attrs}/>`;
  }
  return '';
}

function screenToSVG(screen) {
  const els = (screen.elements || []).map(elementToSVG).join('\n');
  return `<svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg" style="font-family:Inter,sans-serif">${els}</svg>`;
}

const screenSVGs = pen.screens.map(s => screenToSVG(s));

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DIAL — Market Intelligence Terminal</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07090F;
    --surf: #0D101A;
    --card: #111827;
    --card2: #1A2235;
    --acc: #00D4FF;
    --acc-d: rgba(0,212,255,0.14);
    --acc2: #10D988;
    --bear: #FF4D6D;
    --purp: #A78BFA;
    --warn: #F59E0B;
    --border: rgba(0,212,255,0.13);
    --bhard: rgba(0,212,255,0.30);
    --text: #E2E8F0;
    --text2: rgba(148,163,184,0.78);
    --text3: rgba(100,116,139,0.56);
  }
  html { font-family: -apple-system, 'Inter', sans-serif; background: var(--bg); color: var(--text); scroll-behavior: smooth; }
  body { min-height: 100vh; }

  /* HEADER */
  .header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(7,9,15,0.92); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .logo {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 16px; font-weight: 800; letter-spacing: 4px; color: var(--acc);
  }
  .logo-sub { font-size: 10px; letter-spacing: 2px; color: var(--text3); margin-left: 10px; font-weight: 400; }
  .live-dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    background: var(--acc2); margin-right: 6px;
    box-shadow: 0 0 8px var(--acc2);
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .header-links { display: flex; gap: 24px; }
  .header-links a { font-size: 12px; color: var(--text3); text-decoration: none; font-family: monospace; letter-spacing: 1px; }
  .header-links a:hover { color: var(--acc); }
  .cta-btn {
    background: var(--acc); color: var(--bg); border: none;
    padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700;
    cursor: pointer; text-decoration: none; font-family: monospace; letter-spacing: 1px;
  }
  .cta-btn:hover { opacity: 0.88; }

  /* HERO */
  .hero {
    max-width: 1040px; margin: 0 auto;
    padding: 88px 32px 72px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
  }
  .hero-label {
    font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
    color: var(--acc); text-transform: uppercase; margin-bottom: 20px;
    font-family: 'JetBrains Mono', monospace;
    display: flex; align-items: center; gap: 8px;
  }
  .hero h1 {
    font-size: 58px; font-weight: 800; line-height: 1.05;
    color: var(--text); margin-bottom: 24px; letter-spacing: -1px;
  }
  .hero h1 em { font-style: normal; color: var(--acc); }
  .hero p { font-size: 16px; line-height: 1.75; color: var(--text2); margin-bottom: 36px; }
  .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: var(--bg);
    padding: 14px 28px; border-radius: 28px;
    font-size: 13px; font-weight: 800; text-decoration: none;
    font-family: monospace; letter-spacing: 1.5px;
    transition: opacity 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 20px rgba(0,212,255,0.25);
  }
  .btn-primary:hover { opacity: 0.9; box-shadow: 0 0 32px rgba(0,212,255,0.4); }
  .btn-secondary {
    color: var(--text3); font-size: 12px; text-decoration: none;
    border: 1px solid var(--border); padding: 13px 22px; border-radius: 28px;
    font-family: monospace; letter-spacing: 1px;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--acc); color: var(--acc); }

  /* PHONE MOCK */
  .hero-visual { display: flex; justify-content: center; position: relative; }
  .phone-glow {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    width: 280px; height: 420px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0,212,255,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .phone-frame {
    background: #0A0C15; border-radius: 44px; padding: 10px;
    box-shadow: 0 0 0 1px var(--bhard), 0 40px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,212,255,0.08);
    width: 230px; position: relative; z-index: 1;
  }
  .phone-frame svg { border-radius: 34px; display: block; width: 210px; height: auto; }
  .phone-notch {
    position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
    width: 60px; height: 6px; background: #030507; border-radius: 3px; z-index: 10;
  }

  /* STATS BAR */
  .stats-bar {
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    background: var(--surf); padding: 28px 32px;
    display: flex; justify-content: center; gap: 0;
  }
  .stat-item {
    text-align: center; padding: 0 48px;
    border-right: 1px solid var(--border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-val { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700; color: var(--acc); }
  .stat-label { font-size: 11px; color: var(--text3); margin-top: 4px; letter-spacing: 1px; font-family: monospace; }

  /* SCREENS */
  .screens-section {
    background: var(--surf); padding: 80px 0;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  }
  .screens-section h2 {
    font-size: 34px; font-weight: 700; text-align: center;
    margin-bottom: 8px; color: var(--text);
  }
  .screens-section h2 span { color: var(--acc); }
  .screens-section .sub { text-align: center; color: var(--text3); font-size: 13px; margin-bottom: 44px; font-family: monospace; letter-spacing: 0.5px; }
  .screens-scroll {
    display: flex; gap: 20px; overflow-x: auto; padding: 0 48px 20px;
    scrollbar-width: none;
  }
  .screens-scroll::-webkit-scrollbar { display: none; }
  .screen-card { flex: 0 0 auto; width: 170px; cursor: pointer; transition: transform 0.25s; }
  .screen-card:hover { transform: translateY(-8px); }
  .screen-card .screen-wrap {
    background: #0A0C15; border-radius: 22px; padding: 6px;
    box-shadow: 0 0 0 1px var(--border), 0 16px 48px rgba(0,0,0,0.6), 0 4px 16px rgba(0,212,255,0.06);
  }
  .screen-card svg { border-radius: 16px; display: block; width: 158px; height: auto; }
  .screen-card .screen-label { font-size: 10px; color: var(--text3); text-align: center; margin-top: 10px; font-weight: 600; font-family: monospace; letter-spacing: 1px; }

  /* FEATURES */
  .features { max-width: 1040px; margin: 0 auto; padding: 88px 32px; }
  .features h2 { font-size: 38px; font-weight: 700; margin-bottom: 12px; }
  .features h2 span { color: var(--acc); }
  .features .sub { color: var(--text3); font-size: 14px; margin-bottom: 52px; font-family: monospace; letter-spacing: 0.5px; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feature-item {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px; transition: border-color 0.25s;
  }
  .feature-item:hover { border-color: var(--bhard); }
  .feature-item .icon { font-size: 22px; margin-bottom: 16px; }
  .feature-item h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
  .feature-item p { font-size: 13px; color: var(--text2); line-height: 1.65; }

  /* PALETTE */
  .palette-section { max-width: 1040px; margin: 0 auto; padding: 0 32px 88px; }
  .palette-section h2 { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
  .palette-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .swatch { width: 88px; }
  .swatch .color { height: 64px; border-radius: 14px; border: 1px solid var(--border); }
  .swatch .label { font-size: 10px; color: var(--text3); margin-top: 8px; font-family: monospace; }
  .swatch .hex { font-size: 11px; font-weight: 600; color: var(--text); font-family: monospace; }

  /* FOOTER */
  .footer {
    border-top: 1px solid var(--border); background: var(--surf);
    padding: 40px 32px; text-align: center;
    font-size: 12px; color: var(--text3); font-family: monospace;
  }
  .footer a { color: var(--acc); text-decoration: none; }
  .footer p + p { margin-top: 8px; }

  @media (max-width: 720px) {
    .hero { grid-template-columns: 1fr; padding: 48px 20px; gap: 40px; }
    .hero-visual { order: -1; }
    .feature-grid { grid-template-columns: 1fr; }
    .hero h1 { font-size: 40px; }
    .stats-bar { flex-wrap: wrap; }
    .stat-item { padding: 12px 24px; border-right: none; border-bottom: 1px solid var(--border); width: 50%; }
  }
</style>
</head>
<body>

<header class="header">
  <div style="display:flex;align-items:center">
    <div class="logo">DIAL</div>
    <div class="logo-sub">TERMINAL</div>
  </div>
  <nav class="header-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/dial-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/dial-mock">Mock ☀◑</a>
  </nav>
  <a href="https://ram.zenbin.org/dial-mock" class="cta-btn">LAUNCH →</a>
</header>

<section class="hero">
  <div class="hero-text">
    <div class="hero-label"><span class="live-dot"></span>RAM Design Heartbeat · #40 · Dark Edition</div>
    <h1>Market<br>intelligence,<br><em>terminal-grade.</em></h1>
    <p>DIAL is a real-time AI market intelligence app built around the Bloomberg Terminal aesthetic — bento grids, monospace data, electric cyan glow, and an AI signal engine that tells you when to act.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/dial-mock" class="btn-primary">INTERACTIVE MOCK →</a>
      <a href="https://ram.zenbin.org/dial-viewer" class="btn-secondary">Pencil.dev viewer</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-glow"></div>
    <div class="phone-frame">
      <div class="phone-notch"></div>
      ${screenSVGs[0]}
    </div>
  </div>
</section>

<div class="stats-bar">
  <div class="stat-item"><div class="stat-val">6</div><div class="stat-label">SCREENS</div></div>
  <div class="stat-item"><div class="stat-val">2028</div><div class="stat-label">ELEMENTS</div></div>
  <div class="stat-item"><div class="stat-val">24</div><div class="stat-label">SYMBOLS TRACKED</div></div>
  <div class="stat-item"><div class="stat-val">94.2%</div><div class="stat-label">AI ACCURACY</div></div>
</div>

<section class="screens-section" id="screens">
  <h2>Six <span>screens</span></h2>
  <p class="sub">Markets → Signals → Portfolio → Watchlist → Feed → Data Sources</p>
  <div class="screens-scroll">
    ${pen.screens.map((s,i) => `
    <div class="screen-card">
      <div class="screen-wrap">${screenSVGs[i]}</div>
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <h2>Built for the <span>edge</span></h2>
  <p class="sub">Inspired by godly.website (sci-fi terminal) + saaspo.com (AI SaaS glow bento) + darkmodedesign.com</p>
  <div class="feature-grid">
    <div class="feature-item">
      <div class="icon">◉</div>
      <h3>Bento market grid</h3>
      <p>Index cards, sector heatmaps, and live tickers arranged in a modular bento layout — dense data, clean hierarchy.</p>
    </div>
    <div class="feature-item">
      <div class="icon">✦</div>
      <h3>DIAL-α AI signals</h3>
      <p>Transformer-based pattern recognition generates confidence-scored trade signals with entry, target, and stop levels.</p>
    </div>
    <div class="feature-item">
      <div class="icon">◈</div>
      <h3>Glow-enhanced dark UI</h3>
      <p>Electric cyan glow on CTAs and live indicators, off-black surfaces, and monospace type — dark mode as a parallel design system.</p>
    </div>
    <div class="feature-item">
      <div class="icon">▲</div>
      <h3>Real-time watchlist</h3>
      <p>24 symbols with embedded 7-day sparklines, live price feeds, and percentage change — all in a compact terminal-style list.</p>
    </div>
    <div class="feature-item">
      <div class="icon">⬡</div>
      <h3>Smart alert feed</h3>
      <p>Signal alerts, price triggers, and news events in a single unified feed — filtered by type and prioritised by urgency.</p>
    </div>
    <div class="feature-item">
      <div class="icon">◎</div>
      <h3>8 live data sources</h3>
      <p>Polygon.io, Coinbase Pro, Bloomberg API, FRED, Dark Pool Feed — all visible with live latency monitoring.</p>
    </div>
  </div>
</section>

<section class="palette-section">
  <h2>Terminal palette</h2>
  <div class="palette-row">
    ${[
      {hex:'#07090F',name:'Abyss'},
      {hex:'#0D101A',name:'Navy Surf'},
      {hex:'#111827',name:'Card'},
      {hex:'#E2E8F0',name:'Primary Text'},
      {hex:'#00D4FF',name:'Electric Cyan'},
      {hex:'#10D988',name:'Mint Bull'},
      {hex:'#FF4D6D',name:'Rose Bear'},
      {hex:'#A78BFA',name:'Signal Violet'},
      {hex:'#F59E0B',name:'Amber'},
    ].map(s => `
    <div class="swatch">
      <div class="color" style="background:${s.hex}"></div>
      <div class="hex">${s.hex}</div>
      <div class="label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<footer class="footer">
  <p>DIAL — RAM Design Heartbeat #40 · <a href="https://ram.zenbin.org/dial-viewer">Pencil.dev viewer</a> · <a href="https://ram.zenbin.org/dial-mock">Interactive mock ☀◑</a></p>
  <p>Trend research: godly.website (sci-fi terminal aesthetic) · saaspo.com (AI SaaS glow + bento grids) · darkmodedesign.com (parallel dark systems)</p>
</footer>

</body>
</html>`;

// ─── VIEWER ──────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'DIAL — Market Intelligence Terminal');
  console.log(`Hero: ${r1.status} ${r1.status===201?'✓':'— '+r1.body.slice(0,120)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'DIAL — Pencil.dev Viewer');
  console.log(`Viewer: ${r2.status} ${r2.status===201?'✓':'— '+r2.body.slice(0,120)}`);
}
main().catch(console.error);
