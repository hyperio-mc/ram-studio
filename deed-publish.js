'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'deed';

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

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:     '#F8F6F2',
  surf:   '#FFFFFF',
  card:   '#EEE9E2',
  border: '#DDD7CE',
  text:   '#1A1714',
  text2:  '#5C5550',
  text3:  '#9B928B',
  navy:   '#1D3557',
  green:  '#2D7D52',
  amber:  '#B45309',
  red:    '#B91C1C',
};

// ── Build SVG data URIs from pen screens ─────────────────────────────────────
const screenSvgs = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
});

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DEED — Contract Intelligence</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg};
    --surf: ${P.surf};
    --card: ${P.card};
    --border: ${P.border};
    --text: ${P.text};
    --text2: ${P.text2};
    --text3: ${P.text3};
    --navy: ${P.navy};
    --green: ${P.green};
    --amber: ${P.amber};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    min-height: 100vh;
  }

  /* ── Nav ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(248,246,242,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .nav-logo {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 20px; font-weight: 700;
    color: var(--navy); letter-spacing: -0.3px;
  }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a {
    text-decoration: none; color: var(--text2);
    font-size: 14px; transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--navy); }
  .nav-cta {
    background: var(--navy); color: white !important;
    padding: 8px 20px; border-radius: 20px; font-weight: 600 !important;
  }
  .nav-cta:hover { background: #264a73 !important; color: white !important; }

  /* ── Hero ── */
  .hero {
    max-width: 1200px; margin: 0 auto;
    padding: 96px 40px 80px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 64px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: #EDF1F7; color: var(--navy);
    padding: 6px 14px; border-radius: 20px;
    font-size: 12px; font-weight: 600; letter-spacing: 0.8px;
    text-transform: uppercase; margin-bottom: 24px;
  }
  .hero-eyebrow span { width: 6px; height: 6px; border-radius: 50%; background: var(--navy); }
  h1 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(40px, 5vw, 60px);
    font-weight: 700; line-height: 1.1;
    color: var(--text); letter-spacing: -1px;
    margin-bottom: 24px;
  }
  h1 em { font-style: normal; color: var(--navy); }
  .hero-sub {
    font-size: 18px; color: var(--text2); line-height: 1.6;
    margin-bottom: 40px; max-width: 440px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--navy); color: white;
    padding: 14px 28px; border-radius: 30px;
    font-weight: 600; font-size: 15px;
    text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(29,53,87,0.25); }
  .btn-secondary {
    color: var(--navy); font-weight: 500; font-size: 15px;
    text-decoration: none; display: flex; align-items: center; gap: 8px;
  }
  .hero-stats {
    display: flex; gap: 32px; margin-top: 48px;
    padding-top: 32px; border-top: 1px solid var(--border);
  }
  .stat-item { }
  .stat-num {
    font-family: Georgia, serif; font-size: 26px;
    font-weight: 700; color: var(--navy); display: block;
  }
  .stat-lbl { font-size: 12px; color: var(--text3); font-weight: 500; }

  /* ── Screen showcase ── */
  .hero-screens {
    position: relative; display: flex; gap: 16px;
    justify-content: flex-end; align-items: flex-start;
  }
  .screen-card {
    width: 195px; flex-shrink: 0;
    border-radius: 24px; overflow: hidden;
    box-shadow: 0 20px 60px rgba(29,53,87,0.15), 0 4px 12px rgba(29,53,87,0.08);
    border: 1px solid var(--border);
    transition: transform 0.3s;
  }
  .screen-card:hover { transform: translateY(-6px); }
  .screen-card:nth-child(2) { margin-top: 32px; }
  .screen-card:nth-child(3) { margin-top: 16px; }
  .screen-card img { width: 100%; display: block; }

  /* ── Features ── */
  .features {
    background: var(--surf);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 80px 40px;
  }
  .features-inner { max-width: 1200px; margin: 0 auto; }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--navy);
    margin-bottom: 16px;
  }
  .features-title {
    font-family: Georgia, serif; font-size: clamp(28px, 4vw, 44px);
    font-weight: 700; color: var(--text); line-height: 1.15;
    margin-bottom: 64px; max-width: 540px; letter-spacing: -0.5px;
  }
  /* Bento grid inspired by Saaspo trend */
  .bento {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 16px;
  }
  .bento-card {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 16px; padding: 32px;
    transition: box-shadow 0.2s;
  }
  .bento-card:hover { box-shadow: 0 8px 30px rgba(29,53,87,0.08); }
  .bento-card.wide { grid-column: span 2; }
  .bento-card.tall { grid-row: span 2; }
  .bento-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: #EDF1F7; display: flex; align-items: center;
    justify-content: center; font-size: 20px; margin-bottom: 20px;
  }
  .bento-card h3 {
    font-family: Georgia, serif; font-size: 18px; font-weight: 700;
    color: var(--text); margin-bottom: 10px; letter-spacing: -0.2px;
  }
  .bento-card p { font-size: 14px; color: var(--text2); line-height: 1.6; }
  .bento-accent {
    background: var(--navy) !important;
    border-color: var(--navy) !important;
  }
  .bento-accent h3, .bento-accent p { color: white !important; }
  .bento-accent .bento-icon { background: rgba(255,255,255,0.15) !important; }

  /* ── Screens gallery ── */
  .screens-section {
    padding: 80px 40px;
    max-width: 1200px; margin: 0 auto;
  }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px; margin-top: 48px;
  }
  .screen-thumb {
    border-radius: 20px; overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 4px 16px rgba(29,53,87,0.06);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .screen-thumb:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(29,53,87,0.12);
  }
  .screen-thumb img { width: 100%; display: block; }
  .screen-label {
    padding: 12px 16px; font-size: 13px;
    font-weight: 600; color: var(--text2);
    background: var(--surf); border-top: 1px solid var(--border);
  }

  /* ── Palette ── */
  .palette-section {
    background: var(--surf);
    border-top: 1px solid var(--border);
    padding: 60px 40px;
  }
  .palette-inner { max-width: 1200px; margin: 0 auto; }
  .swatches { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
  .swatch {
    display: flex; align-items: center; gap: 12px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 18px;
  }
  .swatch-dot { width: 32px; height: 32px; border-radius: 8px; }
  .swatch-info { }
  .swatch-hex { font-size: 12px; font-weight: 700; color: var(--text); font-family: monospace; }
  .swatch-name { font-size: 11px; color: var(--text3); }

  /* ── CTA footer ── */
  .cta-section {
    padding: 80px 40px;
    text-align: center;
    max-width: 680px; margin: 0 auto;
  }
  .cta-section h2 {
    font-family: Georgia, serif; font-size: 38px;
    font-weight: 700; letter-spacing: -0.5px; margin-bottom: 20px;
  }
  .cta-section p { font-size: 17px; color: var(--text2); margin-bottom: 36px; }
  .cta-links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  footer {
    border-top: 1px solid var(--border);
    padding: 32px 40px;
    text-align: center;
    font-size: 13px; color: var(--text3);
  }
  footer a { color: var(--navy); text-decoration: none; }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 48px; }
    .hero-screens { justify-content: center; }
    .bento { grid-template-columns: 1fr 1fr; }
    .bento-card.wide { grid-column: span 2; }
    .screens-grid { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 0 20px; }
    .hero, .features-inner, .screens-section, .palette-inner { padding-left: 20px; padding-right: 20px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">DEED</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/deed-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/deed-mock" class="nav-cta">Try Mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-copy">
    <div class="hero-eyebrow"><span></span>Contract Intelligence</div>
    <h1>Legal work,<br><em>beautifully</em><br>resolved.</h1>
    <p class="hero-sub">DEED brings clarity to contract management — draft, sign, track, and analyse every agreement with confidence.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/deed-mock" class="btn-primary">Explore Mock →</a>
      <a href="https://ram.zenbin.org/deed-viewer" class="btn-secondary">View in Pencil ↗</a>
    </div>
    <div class="hero-stats">
      <div class="stat-item">
        <span class="stat-num">6</span>
        <span class="stat-lbl">Screens</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">510</span>
        <span class="stat-lbl">Elements</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">Light</span>
        <span class="stat-lbl">Theme</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">#18</span>
        <span class="stat-lbl">Heartbeat</span>
      </div>
    </div>
  </div>
  <div class="hero-screens">
    ${screenSvgs.slice(0, 3).map((svg, i) => `
    <div class="screen-card" style="width:${i === 1 ? 200 : 180}px">
      <img src="${svg}" alt="Screen ${i+1}" loading="lazy">
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <div class="features-inner">
    <p class="section-label">Core Features</p>
    <h2 class="features-title">Everything a contract needs, nothing it doesn't.</h2>
    <div class="bento">
      <div class="bento-card bento-accent tall">
        <div class="bento-icon">📋</div>
        <h3>Smart Dashboard</h3>
        <p>Surface active, pending, and expiring contracts at a glance. Serif typography makes key numbers legible and trustworthy at any size.</p>
      </div>
      <div class="bento-card">
        <div class="bento-icon">✍️</div>
        <h3>E-Signature Flow</h3>
        <p>Multi-party signing with identity verification, progress steps, and real-time status.</p>
      </div>
      <div class="bento-card">
        <div class="bento-icon">🔍</div>
        <h3>Document Review</h3>
        <p>Inline annotations, comment threads, and clause highlighting on every document.</p>
      </div>
      <div class="bento-card wide">
        <div class="bento-icon">📊</div>
        <h3>Insights & Audit Trail</h3>
        <p>Monthly signing trends, average turnaround time, and a full timestamped audit trail for every contract event. Legal-grade accountability, beautiful presentation.</p>
      </div>
      <div class="bento-card">
        <div class="bento-icon">📁</div>
        <h3>Template Library</h3>
        <p>Bento-grid template browser with usage counts and one-tap deployment.</p>
      </div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <p class="section-label">Design Preview</p>
  <h2 class="features-title">6 screens, end-to-end.</h2>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => `
    <div class="screen-thumb">
      <img src="${screenSvgs[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="palette-section">
  <div class="palette-inner">
    <p class="section-label">Design Palette</p>
    <h2 class="features-title" style="margin-bottom:0">Warm neutral + deep navy.</h2>
    <div class="swatches">
      ${[
        { hex: '#F8F6F2', name: 'Background' },
        { hex: '#FFFFFF', name: 'Surface' },
        { hex: '#EEE9E2', name: 'Card' },
        { hex: '#DDD7CE', name: 'Border' },
        { hex: '#1D3557', name: 'Navy (Accent)' },
        { hex: '#2D7D52', name: 'Green (Signed)' },
        { hex: '#B45309', name: 'Amber (Pending)' },
        { hex: '#1A1714', name: 'Text' },
      ].map(s => `
      <div class="swatch">
        <div class="swatch-dot" style="background:${s.hex};${s.hex === '#FFFFFF' ? 'border:1px solid #DDD7CE;' : ''}"></div>
        <div class="swatch-info">
          <div class="swatch-hex">${s.hex}</div>
          <div class="swatch-name">${s.name}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<div class="cta-section">
  <h2>Try it yourself.</h2>
  <p>Explore DEED as an interactive Svelte mock with full light/dark toggle — or open the raw prototype in the Pencil viewer.</p>
  <div class="cta-links">
    <a href="https://ram.zenbin.org/deed-mock" class="btn-primary">Interactive Mock ☀◑</a>
    <a href="https://ram.zenbin.org/deed-viewer" class="btn-secondary" style="color:var(--navy);text-decoration:none;font-weight:500">Pencil Viewer ↗</a>
  </div>
</div>

<footer>
  <p>DEED — Heartbeat #18 · RAM Design AI · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:8px;font-size:12px">Inspired by Land-Book's "Stripe style" + Lapa Ninja serif renaissance + Minimal Gallery purposeful asymmetry</p>
</footer>

</body>
</html>`;

// ── Viewer injection ──────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'DEED — Contract Intelligence');
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 120) : 'OK');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'DEED — Pencil Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 120) : 'OK');
}
main().catch(console.error);
