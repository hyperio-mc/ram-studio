'use strict';
// VELO — Publish hero + viewer
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'velo';
const APP_NAME = 'VELO';
const TAGLINE  = 'Your ride. Perfected.';

// Palette
const BG   = '#F8F5F0';
const SURF = '#FFFFFF';
const CARD = '#F2EDE6';
const TEXT = '#1A1510';
const TEXT2 = '#5C5248';
const ACC   = '#2E5E3E';
const ACC2  = '#C17A2E';

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

// ── Hero Page ─────────────────────────────────────────────────────────────────
const screens = pen.screens || [];

function screenPreview(screen, idx) {
  const w = 390, h = 844;
  // Build SVG from elements
  let svgInner = '';
  for (const el of (screen.elements || [])) {
    if (el.type === 'rect') {
      svgInner += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const fw = el.fontWeight || 400;
      const ff = el.fontFamily || 'Inter, sans-serif';
      const ls = el.letterSpacing || 0;
      const op = el.opacity ?? 1;
      svgInner += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${fw}" font-family="${ff}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${op}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      svgInner += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'line') {
      svgInner += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity??1}"/>`;
    }
  }
  const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${svgInner}</svg>`;
  const encoded = Buffer.from(svgData).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

const screenPreviews = screens.map((s, i) => screenPreview(s, i));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG};
    --surf: ${SURF};
    --card: ${CARD};
    --text: ${TEXT};
    --text2: ${TEXT2};
    --acc: ${ACC};
    --acc2: ${ACC2};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
  }
  a { color: inherit; text-decoration: none; }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 40px;
    background: ${BG}ee;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(26,21,16,0.06);
  }
  .logo { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: var(--acc); }
  .nav-links { display: flex; gap: 32px; font-size: 14px; color: var(--text2); }
  .nav-cta {
    background: var(--acc); color: #fff;
    padding: 9px 22px; border-radius: 20px;
    font-size: 13px; font-weight: 600;
  }

  /* Hero */
  .hero {
    padding: 160px 40px 80px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-label {
    font-size: 10px; font-weight: 700; letter-spacing: 3px;
    color: var(--acc); text-transform: uppercase; margin-bottom: 20px;
  }
  .hero h1 {
    font-size: clamp(48px, 6vw, 80px);
    font-family: Georgia, serif;
    font-weight: 700; line-height: 1.05;
    letter-spacing: -2px; color: var(--text);
    margin-bottom: 24px;
  }
  .hero h1 span { color: var(--acc); }
  .hero p {
    font-size: 18px; color: var(--text2);
    line-height: 1.7; margin-bottom: 40px; max-width: 420px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: #fff;
    padding: 14px 32px; border-radius: 28px;
    font-size: 15px; font-weight: 600;
  }
  .btn-secondary {
    color: var(--acc); font-size: 14px; font-weight: 500;
    border-bottom: 1px solid var(--acc); padding-bottom: 2px;
  }

  /* Phone stack */
  .phone-stack {
    position: relative; height: 600px;
    display: flex; align-items: flex-end; justify-content: center;
  }
  .phone-frame {
    position: absolute;
    width: 195px;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(46,94,62,0.15), 0 4px 16px rgba(26,21,16,0.08);
  }
  .phone-frame img { width: 100%; height: auto; display: block; }
  .phone-1 { bottom: 0; left: 50%; transform: translateX(-80%); z-index: 3; }
  .phone-2 { bottom: 40px; left: 50%; transform: translateX(0%); z-index: 2; width: 175px; opacity: 0.8; }
  .phone-3 { bottom: 80px; left: 50%; transform: translateX(-170%); z-index: 1; width: 155px; opacity: 0.5; }

  /* Divider */
  .section-divider {
    border: none; border-top: 1px solid rgba(26,21,16,0.08);
    margin: 0 40px;
  }

  /* Stats bar */
  .stats-bar {
    padding: 48px 40px;
    max-width: 1100px; margin: 0 auto;
    display: flex; justify-content: space-around; flex-wrap: wrap; gap: 24px;
  }
  .stat { text-align: center; }
  .stat-val { font-family: Georgia, serif; font-size: 40px; font-weight: 700; color: var(--acc); }
  .stat-lbl { font-size: 12px; color: var(--text2); letter-spacing: 1px; margin-top: 4px; }

  /* Screen carousel */
  .screens-section { padding: 80px 40px; background: var(--surf); }
  .screens-section h2 {
    font-family: Georgia, serif; font-size: 40px; font-weight: 700;
    margin-bottom: 48px; text-align: center;
    letter-spacing: -1px;
  }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px; max-width: 1100px; margin: 0 auto;
  }
  .screen-card {
    border-radius: 20px; overflow: hidden;
    border: 1px solid rgba(26,21,16,0.06);
    box-shadow: 0 8px 32px rgba(26,21,16,0.06);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .screen-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(46,94,62,0.12); }
  .screen-card img { width: 100%; height: auto; display: block; }
  .screen-label {
    padding: 14px 20px; background: var(--surf);
    font-size: 12px; font-weight: 600; color: var(--text2); letter-spacing: 1px;
    text-transform: uppercase; border-top: 1px solid rgba(26,21,16,0.06);
  }

  /* Features */
  .features { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .features h2 {
    font-family: Georgia, serif; font-size: 36px; font-weight: 700;
    margin-bottom: 48px; letter-spacing: -1px;
  }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .feature-card {
    background: var(--surf); border-radius: 16px; padding: 32px;
    border: 1px solid rgba(26,21,16,0.06);
  }
  .feature-icon { font-size: 28px; margin-bottom: 16px; }
  .feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feature-card p { font-size: 14px; color: var(--text2); line-height: 1.6; }

  /* Palette */
  .palette-section { padding: 60px 40px; background: var(--card); }
  .palette-section h2 { font-size: 13px; font-weight: 700; letter-spacing: 3px; color: var(--text2); text-transform: uppercase; margin-bottom: 24px; }
  .swatches { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
  .swatch {
    width: 56px; height: 56px; border-radius: 12px;
    border: 1px solid rgba(26,21,16,0.06);
    display: flex; align-items: flex-end; padding: 6px;
    font-size: 8px; font-weight: 700; letter-spacing: 0.5px;
  }

  /* Links */
  .links-section { padding: 60px 40px; text-align: center; }
  .links-section h2 { font-family: Georgia, serif; font-size: 32px; margin-bottom: 32px; }
  .links-row { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
  .link-card {
    background: var(--surf); padding: 20px 32px; border-radius: 14px;
    border: 1px solid rgba(26,21,16,0.08); font-size: 15px; font-weight: 600;
    transition: border-color 0.2s;
  }
  .link-card:hover { border-color: var(--acc); }
  .link-card span { display: block; font-size: 11px; font-weight: 400; color: var(--text2); margin-top: 4px; }

  /* Footer */
  footer {
    border-top: 1px solid rgba(26,21,16,0.08);
    padding: 32px 40px; text-align: center;
    font-size: 12px; color: var(--text2);
  }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 48px; padding: 120px 24px 48px; }
    .phone-stack { height: 400px; }
    .screens-grid { grid-template-columns: 1fr 1fr; }
    .feature-grid { grid-template-columns: 1fr; }
    nav { padding: 16px 24px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">VELO</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#viewer">Viewer</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">Open Viewer</a>
</nav>

<section class="hero">
  <div class="hero-copy">
    <div class="hero-label">RAM Design Heartbeat #400</div>
    <h1>Your ride.<br><span>Perfected.</span></h1>
    <p>A premium cycling companion that makes performance data feel like reading a great magazine — editorial, warm, and utterly clear.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="phone-stack">
    ${screenPreviews[0] ? `<div class="phone-frame phone-1"><img src="${screenPreviews[0]}" alt="Dashboard"></div>` : ''}
    ${screenPreviews[2] ? `<div class="phone-frame phone-2"><img src="${screenPreviews[2]}" alt="Training"></div>` : ''}
    ${screenPreviews[3] ? `<div class="phone-frame phone-3"><img src="${screenPreviews[3]}" alt="Stats"></div>` : ''}
  </div>
</section>

<hr class="section-divider">

<div class="stats-bar">
  <div class="stat"><div class="stat-val">6</div><div class="stat-lbl">Screens</div></div>
  <div class="stat"><div class="stat-val">438</div><div class="stat-lbl">Elements</div></div>
  <div class="stat"><div class="stat-val">#400</div><div class="stat-lbl">Heartbeat</div></div>
  <div class="stat"><div class="stat-val">Light</div><div class="stat-lbl">Theme</div></div>
</div>

<hr class="section-divider">

<section class="screens-section" id="screens">
  <h2>Six screens. One story.</h2>
  <div class="screens-grid">
    ${screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenPreviews[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <h2>Designed for<br>the serious rider.</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <h3>Editorial Dashboard</h3>
      <p>Your weekly data presented with the restraint of a great magazine — big numbers, clean hierarchy, nothing wasted.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <h3>Training Architecture</h3>
      <p>20-week periodization plans with TSS-based load management, session type coding, and visual intensity at a glance.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⛰</div>
      <h3>Power Curve Tracking</h3>
      <p>Your personal power curve updated after every ride. See FTP progress, W/kg ratios, and 12-week trends in real time.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◇</div>
      <h3>Live Ride Tracking</h3>
      <p>Topographic map, elevation profile, and six live metrics — speed, power, cadence, HR, elevation gain, distance.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <h3>Goal Architecture</h3>
      <p>Build toward your A-race with readiness scoring, milestone tracking, and countdown logic tied to your training load.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▲</div>
      <h3>Strava Connected</h3>
      <p>Automatic sync, achievement import, and social segment context — your full ride history in one warm, readable place.</p>
    </div>
  </div>
</section>

<section class="palette-section">
  <h2>Colour palette</h2>
  <div class="swatches">
    <div class="swatch" style="background:${BG}; color: ${TEXT2};">BG</div>
    <div class="swatch" style="background:${SURF}; color: ${TEXT2}; border:1px solid rgba(26,21,16,0.12);">SURF</div>
    <div class="swatch" style="background:${CARD}; color: ${TEXT2};">CARD</div>
    <div class="swatch" style="background:${TEXT}; color: #F8F5F0;">TEXT</div>
    <div class="swatch" style="background:${ACC}; color: #fff;">ACC</div>
    <div class="swatch" style="background:${ACC2}; color: #fff;">ACC2</div>
  </div>
  <p style="margin-top:20px; font-size:12px; color:var(--text2);">
    Warm paper (#F8F5F0) · Forest green (#2E5E3E) · Amber gold (#C17A2E) · Near-black (#1A1510)
  </p>
</section>

<section class="links-section" id="viewer">
  <h2>Explore the design</h2>
  <div class="links-row">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-card">
      Pencil Viewer<span>Full interactive prototype</span>
    </a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-card">
      Interactive Mock ☀◑<span>Svelte 5 with light/dark toggle</span>
    </a>
  </div>
</section>

<footer>
  RAM Design Heartbeat #400 · April 2026 · Inspired by minimal.gallery editorial restraint + Saaspo component-grid collage trend
</footer>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 80)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 80)}`);
}

main().catch(console.error);
