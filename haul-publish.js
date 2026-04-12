'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'haul';
const penJson  = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen      = JSON.parse(penJson);
const screens  = pen.screens;

// ─── Publish helper ────────────────────────────────────────────────────────
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

// ─── Palette ──────────────────────────────────────────────────────────────
const BG    = '#FDF8F3';
const TEXT  = '#111111';
const ACC   = '#FF5C00';
const ACC2  = '#FFE166';
const MUTED = '#666666';
const SURF  = '#FFFFFF';

// ─── SVG thumbnails from screens ─────────────────────────────────────────
function elToSvg(el) {
  if (el.type === 'rect') {
    const fill = el.fill && el.fill !== 'none' ? `fill="${el.fill}"` : 'fill="none"';
    const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
    const rx = el.rx ? `rx="${el.rx}"` : '';
    const op = el.opacity && el.opacity !== 1 ? `opacity="${el.opacity}"` : '';
    return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" ${fill} ${stroke} ${rx} ${op}/>`;
  }
  if (el.type === 'text') {
    const anchor = el.textAnchor || 'start';
    const fw = el.fontWeight || 400;
    const size = el.fontSize || 12;
    const op = el.opacity && el.opacity !== 1 ? `opacity="${el.opacity}"` : '';
    const ls = el.letterSpacing ? `letter-spacing="${el.letterSpacing}"` : '';
    const content = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<text x="${el.x}" y="${el.y}" fill="${el.fill}" font-size="${size}" font-weight="${fw}" text-anchor="${anchor}" font-family="Inter,system-ui,sans-serif" ${ls} ${op}>${content}</text>`;
  }
  if (el.type === 'circle') {
    const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
    const op = el.opacity && el.opacity !== 1 ? `opacity="${el.opacity}"` : '';
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" ${stroke} ${op}/>`;
  }
  if (el.type === 'line') {
    const op = el.opacity && el.opacity !== 1 ? `opacity="${el.opacity}"` : '';
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}" ${op}/>`;
  }
  return '';
}

function screenToSvgDataUri(screen) {
  const svgElems = (screen.elements || []).map(elToSvg).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${svgElems}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const screenImages = screens.map(screenToSvgDataUri);

// ─── Hero HTML ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>HAUL — Freelance Income Tracker</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG};
    --text: ${TEXT};
    --acc: ${ACC};
    --acc2: ${ACC2};
    --muted: ${MUTED};
    --surf: ${SURF};
    --border: ${TEXT};
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.5;
  }

  /* Neubrutalist utility */
  .nb-shadow { box-shadow: 4px 4px 0 var(--border); }
  .nb-border { border: 2px solid var(--border); }
  .nb-block { border: 2px solid var(--border); box-shadow: 4px 4px 0 var(--border); }

  /* ── Hero ── */
  .hero {
    border-bottom: 3px solid var(--border);
    padding: 0;
    overflow: hidden;
  }
  .hero-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 60px;
    padding: 80px 40px;
  }
  .hero-badge {
    display: inline-block;
    background: var(--acc2);
    border: 2px solid var(--border);
    box-shadow: 2px 2px 0 var(--border);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
    padding: 4px 12px;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .hero h1 {
    font-size: clamp(64px, 8vw, 112px);
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -3px;
    margin-bottom: 20px;
  }
  .hero h1 span {
    color: var(--acc);
    display: block;
  }
  .hero-sub {
    font-size: 20px;
    font-weight: 500;
    color: var(--muted);
    max-width: 400px;
    margin-bottom: 40px;
    line-height: 1.5;
  }
  .btn-primary {
    display: inline-block;
    background: var(--acc);
    color: #fff;
    font-weight: 900;
    font-size: 15px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 16px 40px;
    border: 2px solid var(--border);
    box-shadow: 4px 4px 0 var(--border);
    text-decoration: none;
    transition: transform 0.1s, box-shadow 0.1s;
    cursor: pointer;
  }
  .btn-primary:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--border); }
  .btn-secondary {
    display: inline-block;
    background: var(--surf);
    color: var(--text);
    font-weight: 800;
    font-size: 15px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 16px 40px;
    border: 2px solid var(--border);
    box-shadow: 4px 4px 0 var(--border);
    text-decoration: none;
    margin-left: 16px;
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .btn-secondary:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--border); }
  .hero-screens {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }
  .hero-screens .screen-wrap {
    border: 2px solid var(--border);
    box-shadow: 5px 5px 0 var(--border);
    overflow: hidden;
    border-radius: 0;
    flex-shrink: 0;
  }
  .hero-screens .screen-wrap:first-child { width: 160px; }
  .hero-screens .screen-wrap:nth-child(2) { width: 160px; transform: translateY(-20px); }
  .hero-screens .screen-wrap:last-child { width: 120px; opacity: 0.7; }
  .hero-screens img { display: block; width: 100%; height: auto; }

  /* ── Stats bar ── */
  .stats-bar {
    border-top: 3px solid var(--border);
    border-bottom: 3px solid var(--border);
    background: var(--acc);
  }
  .stats-bar-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    padding: 0 40px;
  }
  .stat-item {
    flex: 1;
    padding: 24px 0;
    text-align: center;
    border-right: 2px solid rgba(0,0,0,0.15);
    color: #fff;
  }
  .stat-item:last-child { border-right: none; }
  .stat-num { font-size: 36px; font-weight: 900; display: block; }
  .stat-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; opacity: 0.85; }

  /* ── Screens section ── */
  .screens-section {
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 40px;
  }
  .section-label {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .section-title {
    font-size: 42px;
    font-weight: 900;
    letter-spacing: -1.5px;
    margin-bottom: 48px;
    border-bottom: 3px solid var(--border);
    padding-bottom: 24px;
  }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .screen-card {
    border: 2px solid var(--border);
    box-shadow: 5px 5px 0 var(--border);
    overflow: hidden;
    background: var(--surf);
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .screen-card:hover { transform: translate(2px, 2px); box-shadow: 3px 3px 0 var(--border); }
  .screen-card img { display: block; width: 100%; height: auto; }
  .screen-card-label {
    padding: 12px 16px;
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    border-top: 2px solid var(--border);
    background: var(--bg);
  }

  /* ── Features ── */
  .features-section {
    border-top: 3px solid var(--border);
    border-bottom: 3px solid var(--border);
    background: var(--surf);
    padding: 80px 0;
  }
  .features-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
  }
  .feature-item {
    padding: 40px;
    border-right: 2px solid var(--border);
  }
  .feature-item:last-child { border-right: none; }
  .feature-icon {
    width: 48px;
    height: 48px;
    background: var(--acc2);
    border: 2px solid var(--border);
    box-shadow: 3px 3px 0 var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 20px;
  }
  .feature-title {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.5px;
    margin-bottom: 12px;
  }
  .feature-desc {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.6;
  }

  /* ── Palette ── */
  .palette-section {
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 40px;
  }
  .palette-row {
    display: flex;
    gap: 0;
    border: 2px solid var(--border);
    box-shadow: 5px 5px 0 var(--border);
    overflow: hidden;
  }
  .palette-swatch {
    flex: 1;
    height: 80px;
    display: flex;
    align-items: flex-end;
    padding: 10px;
  }
  .swatch-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    background: rgba(255,255,255,0.85);
    border: 1px solid rgba(0,0,0,0.2);
    padding: 2px 6px;
  }

  /* ── CTA ── */
  .cta-section {
    border-top: 3px solid var(--border);
    background: var(--text);
    padding: 80px 40px;
    text-align: center;
  }
  .cta-title {
    font-size: 56px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -2px;
    margin-bottom: 16px;
  }
  .cta-sub {
    font-size: 18px;
    color: rgba(255,255,255,0.6);
    margin-bottom: 40px;
  }

  /* ── Trend callout ── */
  .trend-callout {
    max-width: 1200px;
    margin: 0 auto 80px;
    padding: 0 40px;
  }
  .callout-box {
    border: 2px solid var(--border);
    box-shadow: 5px 5px 0 var(--border);
    background: var(--acc2);
    padding: 32px 40px;
    display: flex;
    gap: 40px;
    align-items: flex-start;
  }
  .callout-icon { font-size: 40px; flex-shrink: 0; }
  .callout-text h3 { font-size: 20px; font-weight: 900; margin-bottom: 8px; }
  .callout-text p { font-size: 14px; color: #333; line-height: 1.6; }

  /* Footer */
  .footer {
    border-top: 3px solid var(--border);
    padding: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }
  .footer-logo { font-size: 24px; font-weight: 900; letter-spacing: 3px; }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { text-decoration: none; color: var(--text); font-weight: 600; font-size: 13px; letter-spacing: 0.5px; }
  .footer-links a:hover { color: var(--acc); }
  .footer-credit { font-size: 11px; color: var(--muted); }

  @media (max-width: 768px) {
    .hero-inner { grid-template-columns: 1fr; }
    .hero-screens { display: none; }
    .screens-grid { grid-template-columns: repeat(2, 1fr); }
    .features-grid { grid-template-columns: 1fr; }
    .stats-bar-inner { flex-wrap: wrap; }
    .stat-item { flex: 1 1 50%; border-bottom: 1px solid rgba(0,0,0,0.15); }
    .footer { flex-direction: column; gap: 20px; text-align: center; }
    .footer-links { flex-wrap: wrap; justify-content: center; }
  }
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-copy">
      <span class="hero-badge">Heartbeat #43 · Light Theme</span>
      <h1>HAUL<span style="color:${ACC}">WORK</span></h1>
      <p class="hero-sub">Stop guessing what you made. A neubrutalist freelance tracker that shows your income, projects, and billable hours without the enterprise bloat.</p>
      <div>
        <a class="btn-primary" href="https://ram.zenbin.org/haul-viewer">VIEW DESIGN</a>
        <a class="btn-secondary" href="https://ram.zenbin.org/haul-mock">TRY MOCK ☀◑</a>
      </div>
    </div>
    <div class="hero-screens">
      <div class="screen-wrap">
        <img src="${screenImages[0]}" alt="Dashboard" loading="lazy">
      </div>
      <div class="screen-wrap">
        <img src="${screenImages[4]}" alt="Earnings" loading="lazy">
      </div>
      <div class="screen-wrap">
        <img src="${screenImages[2]}" alt="Timer" loading="lazy">
      </div>
    </div>
  </div>
</section>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="stats-bar-inner">
    <div class="stat-item">
      <span class="stat-num">6</span>
      <span class="stat-label">Screens</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">492</span>
      <span class="stat-label">Elements</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">Light</span>
      <span class="stat-label">Theme</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">#43</span>
      <span class="stat-label">Heartbeat</span>
    </div>
  </div>
</div>

<!-- SCREENS -->
<section class="screens-section">
  <p class="section-label">All Screens</p>
  <h2 class="section-title">6 Screens. One Goal: Know Your Numbers.</h2>
  <div class="screens-grid">
    ${screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenImages[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-card-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- TREND CALLOUT -->
<div class="trend-callout">
  <div class="callout-box">
    <div class="callout-icon">⬛</div>
    <div class="callout-text">
      <h3>Inspired by: Neubrutalism + Orange, 2026</h3>
      <p>Research from Land-book (land-book.com) showed neubrutalism — thick black borders, flat fills, offset solid shadows — as a dominant trending aesthetic. Separately, Lapa Ninja and Saaspo both flagged orange as 2026's breakout brand color across SaaS and creator tools. HAUL fuses both: bold neubrutalist structure with a punchy <strong style="color:${ACC}">orange (#FF5C00)</strong> accent and warm cream background — a direct counter to the indigo-gradient-on-void-black AI SaaS aesthetic.</p>
    </div>
  </div>
</div>

<!-- FEATURES -->
<section class="features-section">
  <div class="features-inner">
    <p class="section-label" style="margin-bottom:8px">What's Inside</p>
    <h2 class="section-title">Built for Freelancers Who Invoice, Not Employees Who Clock In</h2>
    <div class="features-grid">
      <div class="feature-item">
        <div class="feature-icon">$</div>
        <h3 class="feature-title">Earnings Dashboard</h3>
        <p class="feature-desc">Month-at-a-glance with inline sparkbar, YTD progress toward your annual goal, and a breakdown by client. No chart library theatrics.</p>
      </div>
      <div class="feature-item">
        <div class="feature-icon">◷</div>
        <h3 class="feature-title">Live Timer</h3>
        <p class="feature-desc">Giant clock on a neubrutalist stage. Start/stop with oversized tap targets. Session log below shows the running total for today at a glance.</p>
      </div>
      <div class="feature-item">
        <div class="feature-icon">◈</div>
        <h3 class="feature-title">Invoice Tracker</h3>
        <p class="feature-desc">Status-coded left accent bars (green = paid, orange = sent, gray = draft). Outstanding vs. paid-MTD summary at the top. One-tap create.</p>
      </div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section">
  <p class="section-label">Color Palette</p>
  <h2 class="section-title" style="margin-bottom:24px">The Neubrutalist Light Stack</h2>
  <div class="palette-row">
    <div class="palette-swatch" style="background:${BG}">
      <span class="swatch-label">BG ${BG}</span>
    </div>
    <div class="palette-swatch" style="background:${SURF}; border-left:2px solid ${TEXT}">
      <span class="swatch-label">Surface ${SURF}</span>
    </div>
    <div class="palette-swatch" style="background:#FFF5E8; border-left:2px solid ${TEXT}">
      <span class="swatch-label">Card #FFF5E8</span>
    </div>
    <div class="palette-swatch" style="background:${ACC}; border-left:2px solid ${TEXT}">
      <span class="swatch-label" style="background:rgba(255,255,255,0.9)">Accent ${ACC}</span>
    </div>
    <div class="palette-swatch" style="background:${ACC2}; border-left:2px solid ${TEXT}">
      <span class="swatch-label">Accent2 ${ACC2}</span>
    </div>
    <div class="palette-swatch" style="background:${TEXT}; border-left:2px solid ${TEXT}">
      <span class="swatch-label" style="background:rgba(255,255,255,0.9)">Text ${TEXT}</span>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2 class="cta-title">Know What You Haul.</h2>
  <p class="cta-sub">Interactive mock with full light/dark toggle.</p>
  <a class="btn-primary" href="https://ram.zenbin.org/haul-mock" style="background:${ACC}">OPEN MOCK ☀◑</a>
  <a class="btn-secondary" href="https://ram.zenbin.org/haul-viewer" style="background:${ACC2}; color:${TEXT}; margin-left:16px">VIEW PROTOTYPE</a>
</section>

<!-- FOOTER -->
<footer style="border-top:3px solid ${TEXT}; padding:40px; display:flex; justify-content:space-between; align-items:center; font-family:Inter,sans-serif;">
  <div class="footer-logo">HAUL</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/haul-viewer">Prototype Viewer</a>
    <a href="https://ram.zenbin.org/haul-mock">Interactive Mock</a>
  </div>
  <div class="footer-credit">RAM Design Heartbeat #43 · April 2026</div>
</footer>

</body>
</html>`;

// ─── Viewer HTML ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'HAUL — Freelance Income Tracker');
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'HAUL — Prototype Viewer');
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
