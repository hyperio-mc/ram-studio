'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG    = 'wick';
const NAME    = 'WICK';
const TAGLINE = 'read the market, feel the move';

// Palette
const BG   = '#0B0A07';
const ACC  = '#F59E0B';
const SURF = '#141209';
const TEXT = '#F5F0E8';
const GREEN= '#22C55E';
const RED  = '#EF4444';

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

// ── Hero Page ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:    ${BG};
    --surf:  ${SURF};
    --card:  #1E1A10;
    --card2: #252015;
    --acc:   ${ACC};
    --green: ${GREEN};
    --red:   ${RED};
    --text:  ${TEXT};
    --muted: rgba(245,240,232,0.45);
    --dim:   rgba(245,240,232,0.1);
    --glow:  rgba(245,158,11,0.18);
  }

  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(11,10,7,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--dim);
  }
  .nav-logo {
    font-size: 20px; font-weight: 800; letter-spacing: 0.14em;
    color: var(--acc);
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--acc); color: var(--bg);
    padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700;
    text-decoration: none; letter-spacing: 0.02em;
    box-shadow: 0 0 20px rgba(245,158,11,0.35);
    transition: box-shadow 0.2s;
  }
  .nav-cta:hover { box-shadow: 0 0 32px rgba(245,158,11,0.55); }

  /* ── Hero ── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 40px 80px;
    position: relative;
    overflow: hidden;
  }
  .hero-glow {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 0.18em;
    color: var(--acc); text-transform: uppercase;
    padding: 6px 16px; border: 1px solid rgba(245,158,11,0.3);
    border-radius: 20px; display: inline-block; margin-bottom: 32px;
    background: rgba(245,158,11,0.08);
  }
  .hero h1 {
    font-size: clamp(56px, 10vw, 120px);
    font-weight: 900; letter-spacing: -0.03em;
    line-height: 0.92;
    background: linear-gradient(135deg, var(--text) 40%, var(--acc) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 24px;
  }
  .hero-tagline {
    font-size: 18px; font-weight: 400; color: var(--muted);
    max-width: 420px; line-height: 1.6; margin-bottom: 48px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    background: var(--acc); color: var(--bg);
    padding: 14px 32px; border-radius: 28px; font-size: 15px; font-weight: 700;
    text-decoration: none; letter-spacing: 0.02em;
    box-shadow: 0 0 40px rgba(245,158,11,0.4), 0 4px 24px rgba(245,158,11,0.2);
    transition: all 0.25s;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 60px rgba(245,158,11,0.6), 0 8px 32px rgba(245,158,11,0.3);
  }
  .btn-ghost {
    color: var(--muted); padding: 14px 24px; font-size: 15px;
    text-decoration: none; border: 1px solid var(--dim);
    border-radius: 28px; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: var(--acc); color: var(--acc); }

  /* ── Stats bar ── */
  .stats-bar {
    display: flex; gap: 0; margin-top: 72px;
    border: 1px solid var(--dim); border-radius: 16px; overflow: hidden;
    background: var(--surf);
  }
  .stat-item {
    padding: 20px 36px; text-align: center;
    border-right: 1px solid var(--dim);
    flex: 1;
  }
  .stat-item:last-child { border-right: none; }
  .stat-val { font-size: 28px; font-weight: 700; color: var(--acc); letter-spacing: -0.02em; }
  .stat-lbl { font-size: 11px; color: var(--muted); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }

  /* ── Screens carousel ── */
  .screens-section {
    padding: 100px 0; position: relative;
  }
  .screens-section h2 {
    text-align: center; font-size: 42px; font-weight: 800;
    letter-spacing: -0.02em; margin-bottom: 16px;
  }
  .screens-section p {
    text-align: center; color: var(--muted); font-size: 16px;
    margin-bottom: 60px;
  }
  .screens-track {
    display: flex; gap: 24px;
    padding: 0 40px 32px;
    overflow-x: auto;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
  }
  .screens-track::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 240px;
    scroll-snap-align: start;
    background: var(--surf);
    border-radius: 20px;
    border: 1px solid var(--dim);
    overflow: hidden;
    transition: all 0.3s;
  }
  .screen-card:hover {
    border-color: rgba(245,158,11,0.4);
    transform: translateY(-6px);
    box-shadow: 0 20px 60px rgba(245,158,11,0.15);
  }
  .screen-card img { width: 100%; display: block; }
  .screen-card-label {
    padding: 12px 16px;
    font-size: 12px; font-weight: 600; color: var(--muted);
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* Pen SVG previews */
  .screen-preview {
    width: 240px; height: 519px;
    background: ${BG};
    position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  .screen-preview svg { width: 100%; height: 100%; }

  /* ── Features ── */
  .features {
    padding: 100px 40px;
    max-width: 1100px; margin: 0 auto;
  }
  .features-header {
    text-align: center; margin-bottom: 64px;
  }
  .features-header h2 { font-size: 42px; font-weight: 800; letter-spacing: -0.02em; }
  .features-header p { color: var(--muted); margin-top: 16px; font-size: 16px; }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  .feature-card {
    background: var(--surf); border: 1px solid var(--dim);
    border-radius: 20px; padding: 32px;
    transition: all 0.3s;
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--acc), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .feature-card:hover::before { opacity: 1; }
  .feature-card:hover {
    border-color: rgba(245,158,11,0.25);
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(245,158,11,0.1);
  }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 20px;
  }
  .feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
  .feature-card p { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* ── Palette ── */
  .palette-section {
    padding: 80px 40px;
    max-width: 900px; margin: 0 auto; text-align: center;
  }
  .palette-section h2 { font-size: 32px; font-weight: 800; margin-bottom: 12px; }
  .palette-section p { color: var(--muted); margin-bottom: 48px; }
  .swatches {
    display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
  }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .swatch-color {
    width: 72px; height: 72px; border-radius: 16px;
    border: 1px solid var(--dim);
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .swatch-hex { font-size: 11px; color: var(--muted); font-family: monospace; }
  .swatch-name { font-size: 12px; color: var(--text); font-weight: 600; margin-top: 2px; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--dim);
    padding: 40px; text-align: center;
    color: var(--muted); font-size: 13px;
  }
  footer a { color: var(--acc); text-decoration: none; }

  @media (max-width: 768px) {
    .features-grid { grid-template-columns: 1fr; }
    .stats-bar { flex-direction: column; }
    .stat-item { border-right: none; border-bottom: 1px solid var(--dim); }
    .nav-links { display: none; }
    .hero h1 { font-size: 64px; }
  }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">WICK</span>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">View Mock ☀◑</a>
</nav>

<!-- ── Hero ── -->
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-eyebrow">RAM Design Heartbeat · Dark Mode · Mobile</div>
  <h1>WICK</h1>
  <p class="hero-tagline">${TAGLINE}</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
  <div class="stats-bar">
    <div class="stat-item">
      <div class="stat-val">6</div>
      <div class="stat-lbl">Screens</div>
    </div>
    <div class="stat-item">
      <div class="stat-val">${pen.metadata.elements}</div>
      <div class="stat-lbl">Elements</div>
    </div>
    <div class="stat-item">
      <div class="stat-val">Dark</div>
      <div class="stat-lbl">Theme</div>
    </div>
    <div class="stat-item">
      <div class="stat-val">#${pen.metadata.heartbeat}</div>
      <div class="stat-lbl">Heartbeat</div>
    </div>
  </div>
</section>

<!-- ── Screens ── -->
<section class="screens-section" id="screens">
  <h2>6 Screens</h2>
  <p>Candlestick trading companion — crafted for dark environments</p>
  <div class="screens-track">
    ${pen.screens.map((sc, i) => `
    <div class="screen-card">
      <div class="screen-preview">
        <svg viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
          ${sc.elements.map(el => {
            if (el.type === 'rect') {
              return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity!==undefined?el.opacity:1}" ${el.stroke?`stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`:''}/>`;
            } else if (el.type === 'text') {
              return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||'400'}" font-family="${el.fontFamily||'system-ui'}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity!==undefined?el.opacity:1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
            } else if (el.type === 'circle') {
              return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity!==undefined?el.opacity:1}" ${el.stroke?`stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`:''}/>`;
            } else if (el.type === 'line') {
              return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity!==undefined?el.opacity:1}"/>`;
            } else if (el.type === 'polygon') {
              return `<polygon points="${el.points}" fill="${el.fill}" opacity="${el.opacity!==undefined?el.opacity:1}"/>`;
            }
            return '';
          }).join('\n          ')}
        </svg>
      </div>
      <div class="screen-card-label">${i + 1}. ${sc.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- ── Features ── -->
<section class="features" id="features">
  <div class="features-header">
    <h2>Built for serious traders</h2>
    <p>Dark-first interface designed to cut through noise and highlight signal</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <h3>Live Candlestick Charts</h3>
      <p>Full OHLC candlestick view with volume bars, price targets, and real-time glow on the current price line.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <h3>Smart Price Alerts</h3>
      <p>Range, breakout, and threshold alerts with distance-to-trigger indicators. Know before the market moves.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▲</div>
      <h3>One-tap Trading</h3>
      <p>Market, limit, stop, and OCO orders with in-line summary and amber glow confirmation on every action.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◫</div>
      <h3>Portfolio Allocation</h3>
      <p>Visual donut breakdown with per-holding P&amp;L, allocation bars, and deposit/withdraw in one tap.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊙</div>
      <h3>Top Movers Feed</h3>
      <p>7-day sparklines for every asset — scan the market at a glance with colour-coded gain/loss indicators.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⇄</div>
      <h3>Amber Accent System</h3>
      <p>Warm near-black palette with amber and green/red polarity — inspired by candlestick wick colour conventions.</p>
    </div>
  </div>
</section>

<!-- ── Palette ── -->
<section class="palette-section" id="palette">
  <h2>Colour Story</h2>
  <p>Inspired by the dark mode discipline seen on darkmodedesign.com — one warm accent, strict monochromatic control</p>
  <div class="swatches">
    ${[
      { hex: BG,      name: 'Pitch',   lbl: 'Background' },
      { hex: SURF,    name: 'Coal',    lbl: 'Surface' },
      { hex: '#1E1A10', name: 'Ember', lbl: 'Card' },
      { hex: ACC,     name: 'Amber',   lbl: 'Accent' },
      { hex: GREEN,   name: 'Gain',    lbl: 'Positive' },
      { hex: RED,     name: 'Loss',    lbl: 'Negative' },
      { hex: TEXT,    name: 'Cream',   lbl: 'Text' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-hex">${s.hex}</div>
      <div class="swatch-name">${s.name}</div>
      <div class="swatch-hex" style="opacity:0.6">${s.lbl}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <p>WICK — RAM Design Heartbeat #42 · <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> · <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a></p>
  <p style="margin-top:8px; opacity:0.5">Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
</footer>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 120) : 'OK');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 120) : 'OK');
}
main().catch(console.error);
