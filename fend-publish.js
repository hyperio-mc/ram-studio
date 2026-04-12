'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'fend';

// Palette
const BG    = '#080B10';
const SURF  = '#0E1219';
const CARD  = '#141A25';
const TEXT  = '#E2E8F4';
const MUTED = 'rgba(226,232,244,0.55)';
const ACC   = '#F97316';
const ACC2  = '#38BDF8';
const GREEN = '#22C55E';
const RED   = '#EF4444';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
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
const screens = pen.screens;

// Build SVG data URIs for carousel
function svgDataUri(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// ─── Hero Page ────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FEND — Threat Intelligence Platform</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:    ${BG};
    --surf:  ${SURF};
    --card:  ${CARD};
    --text:  ${TEXT};
    --muted: ${MUTED};
    --acc:   ${ACC};
    --acc2:  ${ACC2};
    --green: ${GREEN};
    --red:   ${RED};
    --border: rgba(226,232,244,0.08);
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.6;
  }

  /* Subtle grain overlay (godly.website — cinematic dark) */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.35;
    z-index: 0;
  }

  .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* NAV */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
    background: rgba(8,11,16,0.88);
    backdrop-filter: blur(12px);
  }
  .nav-logo {
    font-size: 18px; font-weight: 700; letter-spacing: 3px;
    color: var(--text);
  }
  .nav-logo span { color: var(--acc); }
  .live-dot {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
    color: var(--red);
  }
  .live-dot::before {
    content: '';
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--red);
    animation: pulse 1.4s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

  .nav-actions { display: flex; gap: 12px; align-items: center; }
  .btn-ghost {
    font-size: 13px; color: var(--muted); background: none; border: none; cursor: pointer;
    padding: 8px 16px; border-radius: 6px;
  }
  .btn-primary {
    font-size: 13px; font-weight: 600; color: #000;
    background: var(--acc);
    border: none; cursor: pointer;
    padding: 9px 20px; border-radius: 8px;
    text-decoration: none;
  }

  /* HERO */
  .hero {
    padding: 100px 40px 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero-glow {
    position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
    color: var(--red);
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    padding: 6px 14px; border-radius: 20px;
    margin-bottom: 32px;
  }
  /* OVERSIZED STAT (land-book pattern) */
  .hero-stat {
    font-size: clamp(72px, 14vw, 140px);
    font-weight: 700;
    letter-spacing: -4px;
    line-height: 1;
    color: var(--text);
    margin-bottom: 4px;
  }
  .hero-stat-label {
    font-size: 18px; color: var(--muted); margin-bottom: 48px;
    font-weight: 400; letter-spacing: 0;
  }
  .hero-delta {
    display: inline-flex; gap: 16px; align-items: center;
    font-size: 13px; color: var(--muted);
    margin-bottom: 48px;
  }
  .hero-delta .up { color: var(--red); font-weight: 600; }

  .hero-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 80px; }
  .cta-link {
    display: inline-block;
    font-size: 14px; font-weight: 600; color: #000;
    background: var(--acc);
    padding: 13px 28px; border-radius: 10px;
    text-decoration: none;
  }
  .cta-ghost {
    display: inline-block;
    font-size: 14px; font-weight: 500; color: var(--text);
    background: var(--card);
    border: 1px solid var(--border);
    padding: 13px 28px; border-radius: 10px;
    text-decoration: none;
  }

  /* BENTO GRID (saaspo pattern) */
  .bento {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 12px;
    margin: 0 40px 60px;
  }
  .bento-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }
  .bento-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    border-radius: 14px 14px 0 0;
  }
  .bc-critical::before { background: var(--red); }
  .bc-high::before     { background: var(--acc); }
  .bc-medium::before   { background: #FBBF24; }
  .bc-low::before      { background: var(--acc2); }
  .bc-resolved::before { background: var(--green); }
  .bc-span2 { grid-column: span 2; }

  .bento-card .bc-count {
    font-size: 48px; font-weight: 700; line-height: 1;
    margin-bottom: 6px;
  }
  .bc-critical .bc-count { color: var(--red); }
  .bc-high .bc-count     { color: var(--acc); }
  .bc-medium .bc-count   { color: #FBBF24; }
  .bc-low .bc-count      { color: var(--acc2); }
  .bc-resolved .bc-count { color: var(--green); }
  .bc-label { font-size: 13px; color: var(--muted); }
  .bc-sublabel { font-size: 11px; color: rgba(226,232,244,0.25); margin-top: 4px; }

  /* SCREENS CAROUSEL */
  .screens-section { padding: 80px 40px; border-top: 1px solid var(--border); }
  .section-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--acc); text-transform: uppercase; margin-bottom: 12px; }
  .section-title { font-size: 32px; font-weight: 700; margin-bottom: 48px; }

  .carousel-wrap { position: relative; }
  .screens-track {
    display: flex; gap: 24px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 20px;
    scrollbar-width: thin;
    scrollbar-color: var(--card) transparent;
  }
  .screen-card {
    flex: 0 0 240px; scroll-snap-align: start;
    cursor: pointer;
    transition: transform 0.2s;
  }
  .screen-card:hover { transform: translateY(-4px); }
  .screen-card img {
    width: 240px; height: 520px;
    object-fit: cover; object-position: top;
    border-radius: 16px;
    border: 1px solid var(--border);
    display: block;
  }
  .screen-name {
    font-size: 12px; font-weight: 600; color: var(--muted);
    margin-top: 10px; text-align: center;
    letter-spacing: 0.5px;
  }

  /* FEATURES */
  .features { padding: 80px 40px; border-top: 1px solid var(--border); }
  .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 48px; }
  .feat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
  }
  .feat-icon { font-size: 24px; margin-bottom: 14px; }
  .feat-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
  .feat-body { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* PALETTE */
  .palette-section { padding: 60px 40px; border-top: 1px solid var(--border); }
  .swatches { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
  .swatch { width: 56px; height: 56px; border-radius: 10px; position: relative; }
  .swatch-label { font-size: 10px; color: var(--muted); margin-top: 6px; text-align: center; font-family: monospace; }

  /* FOOTER */
  footer {
    padding: 40px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: var(--muted);
  }
  footer a { color: var(--acc); text-decoration: none; }

  @media (max-width: 768px) {
    nav { padding: 16px 20px; }
    .hero, .bento, .screens-section, .features, .palette-section { padding-left: 20px; padding-right: 20px; }
    .bento { grid-template-columns: 1fr 1fr; margin: 0 20px 40px; }
    .bc-span2 { grid-column: span 1; }
    .features-grid { grid-template-columns: 1fr; }
    footer { flex-direction: column; gap: 12px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">FEND<span>.</span></div>
  <div class="live-dot">LIVE THREAT MONITOR</div>
  <div class="nav-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-ghost">View Design</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Try Mock →</a>
  </div>
</nav>

<div class="hero">
  <div class="hero-glow"></div>
  <div class="hero-tag">⬤ THREAT INTELLIGENCE PLATFORM</div>
  <!-- OVERSIZED STAT — land-book hero pattern -->
  <div class="hero-stat">2,847</div>
  <div class="hero-stat-label">threats detected today</div>
  <div class="hero-delta">
    <span class="up">▲ 14%</span>
    <span>vs. yesterday</span>
    <span>·</span>
    <span style="color:var(--red)">38 critical open</span>
  </div>
  <div class="hero-cta">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="cta-link">Explore Mock →</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="cta-ghost">View in Pencil.dev</a>
  </div>
</div>

<!-- BENTO GRID — saaspo pattern -->
<div class="bento">
  <div class="bento-card bc-critical bc-span2">
    <div class="bc-count">38</div>
    <div class="bc-label">Critical incidents</div>
    <div class="bc-sublabel">SQL injection · Privilege escalation · Active blockers</div>
  </div>
  <div class="bento-card bc-high">
    <div class="bc-count">217</div>
    <div class="bc-label">High severity</div>
    <div class="bc-sublabel">Alerting now</div>
  </div>
  <div class="bento-card bc-medium">
    <div class="bc-count">891</div>
    <div class="bc-label">Medium</div>
    <div class="bc-sublabel">Under review</div>
  </div>
  <div class="bento-card bc-low">
    <div class="bc-count">1.7K</div>
    <div class="bc-label">Low severity</div>
    <div class="bc-sublabel">Logged</div>
  </div>
  <div class="bento-card bc-resolved">
    <div class="bc-count">8.2K</div>
    <div class="bc-label">Resolved</div>
    <div class="bc-sublabel">This week</div>
  </div>
</div>

<!-- SCREENS CAROUSEL -->
<div class="screens-section">
  <div class="section-eyebrow">Design Preview</div>
  <div class="section-title">6 Screens · Dark Mode</div>
  <div class="carousel-wrap">
    <div class="screens-track">
      ${screens.map((sc, i) => `
      <div class="screen-card">
        <img src="${svgDataUri(sc.svg)}" alt="${sc.name}" loading="lazy">
        <div class="screen-name">${i + 1}. ${sc.name}</div>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- FEATURES -->
<div class="features">
  <div class="section-eyebrow">Platform Overview</div>
  <div class="section-title">Intelligence at every layer</div>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon">◉</div>
      <div class="feat-title">Real-Time Threat Feed</div>
      <div class="feat-body">Stream of every blocked, alerted, and logged event — severity-coded, filterable by rule, source, or category. Zero latency from detection to screen.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⊞</div>
      <div class="feat-title">Bento Dashboard</div>
      <div class="feat-body">Critical, high, medium, and low incident counts visible at a glance. Oversized hero stat shows today's detection volume — your day's pulse in a single number.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◈</div>
      <div class="feat-title">Rules Engine</div>
      <div class="feat-body">342 active detection rules. Stage, enable, disable, and monitor hit rates in real time. Build custom rules with a structured pattern language, no YAML required.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◑</div>
      <div class="feat-title">Team Response Hub</div>
      <div class="feat-body">On-shift responder roster with live availability, case count, and MTTD (mean time to detect) scoring. War room mode for coordinated critical incident response.</div>
    </div>
  </div>
</div>

<!-- PALETTE -->
<div class="palette-section">
  <div class="section-eyebrow">Design System</div>
  <div class="section-title">Developer-minimal dark palette</div>
  <div class="swatches">
    ${[
      { c: BG,      l: '#080B10' },
      { c: SURF,    l: '#0E1219' },
      { c: CARD,    l: '#141A25' },
      { c: TEXT,    l: '#E2E8F4' },
      { c: ACC,     l: '#F97316' },
      { c: ACC2,    l: '#38BDF8' },
      { c: GREEN,   l: '#22C55E' },
      { c: RED,     l: '#EF4444' },
    ].map(s => `
    <div>
      <div class="swatch" style="background:${s.c};border:1px solid rgba(226,232,244,0.1)"></div>
      <div class="swatch-label">${s.l}</div>
    </div>`).join('')}
  </div>
</div>

<footer>
  <div>FEND · RAM Design Heartbeat · ${new Date().toISOString().slice(0,10)}</div>
  <div>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil.dev viewer</a> ·
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive mock ☀◑</a>
  </div>
</footer>

</body>
</html>`;

// ─── Viewer ───────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'FEND — Threat Intelligence Platform');
  console.log(`Hero:   ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'FEND — Pencil.dev Viewer');
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
