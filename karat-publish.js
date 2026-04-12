'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'karat';
const APP     = 'KARAT';
const TAGLINE = 'Wealth Intelligence Dashboard';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
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

// ─── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:    '#0C0A1A',
  surf:  '#12102A',
  card:  '#1A1833',
  acc:   '#7454FA',
  acc2:  '#B28A4E',
  text:  '#F1EFF9',
  sub:   '#A09CC0',
  muted: '#5E5A7A',
};

// ─── Extract SVG screens ───────────────────────────────────────────────────────
const screens = pen.screens.map(sc => {
  const svgB64 = Buffer.from(sc.svg).toString('base64');
  return { name: sc.name, dataUri: `data:image/svg+xml;base64,${svgB64}` };
});

// ─── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:    ${P.bg};
    --surf:  ${P.surf};
    --card:  ${P.card};
    --acc:   ${P.acc};
    --acc2:  ${P.acc2};
    --text:  ${P.text};
    --sub:   ${P.sub};
    --muted: ${P.muted};
  }

  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* Ambient blobs */
  body::before {
    content: '';
    position: fixed; top: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(116,84,250,0.15) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  body::after {
    content: '';
    position: fixed; bottom: -200px; left: -200px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(178,138,78,0.12) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* Nav */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(12, 10, 26, 0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(116, 84, 250, 0.12);
  }
  .nav-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .nav-logo { font-size: 18px; font-weight: 800; letter-spacing: 3px; color: var(--text); }
  .nav-logo span { color: var(--acc2); }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { text-decoration: none; color: var(--sub); font-size: 13px; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--acc); color: #fff;
    border: none; border-radius: 8px; padding: 8px 20px;
    font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none;
    transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* Hero */
  .hero {
    padding: 100px 0 80px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(178,138,78,0.12); border: 1px solid rgba(178,138,78,0.25);
    color: var(--acc2); font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; padding: 5px 12px; border-radius: 20px;
    margin-bottom: 24px; text-transform: uppercase;
  }
  h1 {
    font-size: 64px; font-weight: 800; line-height: 1.05;
    letter-spacing: -2px; margin-bottom: 20px;
  }
  h1 .acc { color: var(--acc); }
  h1 .gold { color: var(--acc2); }
  .hero-sub {
    font-size: 17px; color: var(--sub); line-height: 1.7;
    max-width: 440px; margin-bottom: 36px;
  }
  .btn-row { display: flex; gap: 14px; align-items: center; }
  .btn-primary {
    background: var(--acc); color: #fff;
    padding: 14px 28px; border-radius: 12px;
    font-size: 14px; font-weight: 700; text-decoration: none;
    transition: transform 0.2s, opacity 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); opacity: 0.9; }
  .btn-secondary {
    color: var(--sub); font-size: 14px; text-decoration: none;
    border: 1px solid rgba(160,156,192,0.25); border-radius: 12px;
    padding: 14px 28px; transition: color 0.2s, border-color 0.2s;
  }
  .btn-secondary:hover { color: var(--text); border-color: rgba(160,156,192,0.5); }

  /* Hero phone mockup */
  .hero-visual {
    position: relative; display: flex; justify-content: center;
  }
  .phone-frame {
    width: 260px; height: 560px;
    background: var(--surf);
    border-radius: 38px;
    border: 2px solid rgba(116,84,250,0.3);
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.5),
      0 40px 80px rgba(0,0,0,0.6),
      0 0 60px rgba(116,84,250,0.15);
    position: relative; z-index: 2;
  }
  .phone-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .phone-frame-notch {
    position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
    width: 80px; height: 6px; background: var(--bg); border-radius: 3px; z-index: 10;
  }
  .phone-glow {
    position: absolute; inset: -30px;
    background: radial-gradient(ellipse at center, rgba(116,84,250,0.2) 0%, transparent 70%);
    z-index: 1; border-radius: 60px;
  }
  .float-stat {
    position: absolute; background: var(--card);
    border: 1px solid rgba(116,84,250,0.2);
    border-radius: 12px; padding: 10px 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    z-index: 3;
  }
  .float-stat .fs-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .float-stat .fs-val { font-size: 18px; font-weight: 700; color: var(--text); }
  .float-stat .fs-sub { font-size: 10px; }
  .float-stat.left { left: -30px; top: 120px; }
  .float-stat.right { right: -30px; top: 280px; }
  .pos { color: #4ECBB2; }
  .neg { color: #F47070; }
  .gold-text { color: var(--acc2); }

  /* Stats bar */
  .stats-bar {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px; background: rgba(116,84,250,0.1);
    border: 1px solid rgba(116,84,250,0.12);
    border-radius: 16px; overflow: hidden;
    margin: 0 0 100px;
  }
  .stat-cell {
    background: var(--surf); padding: 28px 24px;
    text-align: center;
  }
  .stat-cell .sv { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
  .stat-cell .sl { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }

  /* Features / Bento Grid */
  .section-header { text-align: center; margin-bottom: 56px; }
  .section-tag {
    display: inline-block; background: rgba(116,84,250,0.12);
    color: var(--acc); border: 1px solid rgba(116,84,250,0.25);
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    padding: 4px 12px; border-radius: 20px; margin-bottom: 16px;
    text-transform: uppercase;
  }
  h2 { font-size: 40px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
  .section-sub { font-size: 15px; color: var(--sub); max-width: 500px; margin: 0 auto; }

  /* Bento grid */
  .bento {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto;
    gap: 16px;
    margin-bottom: 100px;
  }
  .bento-card {
    background: var(--card);
    border: 1px solid rgba(116,84,250,0.08);
    border-radius: 20px; padding: 28px;
    position: relative; overflow: hidden;
    transition: border-color 0.3s, transform 0.3s;
  }
  .bento-card:hover { border-color: rgba(116,84,250,0.25); transform: translateY(-3px); }
  .bento-card::before {
    content: ''; position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    background: radial-gradient(circle, var(--glow-color, rgba(116,84,250,0.15)) 0%, transparent 70%);
    pointer-events: none;
  }
  .bc-1  { grid-column: span 7; }
  .bc-2  { grid-column: span 5; }
  .bc-3  { grid-column: span 4; }
  .bc-4  { grid-column: span 4; }
  .bc-5  { grid-column: span 4; }
  .bc-6  { grid-column: span 12; }

  .bento-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 20px;
  }
  .bento-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .bento-card p { font-size: 13px; color: var(--sub); line-height: 1.6; }
  .bento-large-stat { font-size: 44px; font-weight: 800; letter-spacing: -2px; margin: 12px 0 8px; }
  .bento-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; }
  .bento-badge {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(78,203,178,0.12); color: #4ECBB2;
    font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    margin-top: 8px;
  }

  /* Mini allocation bars */
  .alloc-row { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
  .alloc-item { display: flex; align-items: center; gap: 10px; }
  .alloc-label { font-size: 11px; color: var(--sub); width: 80px; flex-shrink: 0; }
  .alloc-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; }
  .alloc-fill { height: 100%; border-radius: 3px; }
  .alloc-pct { font-size: 11px; color: var(--text); font-weight: 600; width: 36px; text-align: right; }

  /* Screens carousel */
  .screens-section { margin-bottom: 100px; }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .screen-card {
    background: var(--surf);
    border: 1px solid rgba(116,84,250,0.1);
    border-radius: 20px; overflow: hidden;
    transition: border-color 0.3s, transform 0.3s;
  }
  .screen-card:hover { border-color: rgba(116,84,250,0.3); transform: translateY(-4px); }
  .screen-card img { width: 100%; display: block; }
  .screen-label {
    padding: 14px 16px;
    font-size: 11px; font-weight: 700;
    color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px;
  }

  /* Palette */
  .palette-section { margin-bottom: 100px; }
  .palette-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
  .swatch {
    width: 80px; text-align: center;
  }
  .swatch-color { width: 80px; height: 80px; border-radius: 14px; margin-bottom: 8px; }
  .swatch-hex { font-size: 10px; color: var(--muted); font-family: monospace; }
  .swatch-name { font-size: 10px; color: var(--sub); margin-top: 2px; }

  /* CTA section */
  .cta-section {
    text-align: center; padding: 80px 0 100px;
    border-top: 1px solid rgba(116,84,250,0.1);
  }
  .cta-section h2 { font-size: 36px; font-weight: 800; margin-bottom: 16px; }
  .cta-section p { color: var(--sub); margin-bottom: 32px; }

  /* Footer */
  footer {
    border-top: 1px solid rgba(116,84,250,0.08);
    padding: 32px 0;
  }
  .footer-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 24px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo { font-size: 14px; font-weight: 800; letter-spacing: 2px; }
  .footer-logo span { color: var(--acc2); }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; }
  .footer-links a:hover { color: var(--sub); }
  .footer-credit { font-size: 11px; color: var(--muted); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 48px; padding: 60px 0 40px; }
    h1 { font-size: 40px; }
    .stats-bar { grid-template-columns: repeat(2, 1fr); }
    .bento { grid-template-columns: 1fr; }
    .bc-1, .bc-2, .bc-3, .bc-4, .bc-5, .bc-6 { grid-column: span 1; }
    .screens-grid { grid-template-columns: 1fr; }
    .nav-links { display: none; }
    .float-stat.left, .float-stat.right { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-inner">
    <div class="nav-logo">KAR<span>AT</span></div>
    <ul class="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#screens">Screens</a></li>
      <li><a href="#palette">Palette</a></li>
    </ul>
    <a class="nav-cta" href="https://ram.zenbin.org/karat-viewer">View Design</a>
  </div>
</nav>

<div class="container">
  <!-- Hero -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-tag">✦ RAM Design Heartbeat #12</div>
      <h1>Know your <span class="gold">wealth.</span><br>Own your <span class="acc">future.</span></h1>
      <p class="hero-sub">
        KARAT is a dark fintech wealth intelligence dashboard — built around the premium violet × gold palette
        and bento-grid layouts trending on Land-book's FinTech SaaS category.
      </p>
      <div class="btn-row">
        <a class="btn-primary" href="https://ram.zenbin.org/karat-viewer">Open Viewer</a>
        <a class="btn-secondary" href="https://ram.zenbin.org/karat-mock">Interactive Mock ☀◑</a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="phone-glow"></div>
      <div class="float-stat left">
        <div class="fs-label">Net Worth</div>
        <div class="fs-val">$284,720</div>
        <div class="fs-sub pos">+$3,210 this month</div>
      </div>
      <div class="phone-frame">
        <div class="phone-frame-notch"></div>
        <img src="${screens[0].dataUri}" alt="Portfolio Overview" loading="lazy">
      </div>
      <div class="float-stat right">
        <div class="fs-label">Wealth Score</div>
        <div class="fs-val gold-text">86/100</div>
        <div class="fs-sub pos">Top 12%</div>
      </div>
    </div>
  </section>

  <!-- Stats bar -->
  <div class="stats-bar">
    <div class="stat-cell">
      <div class="sv" style="color:${P.acc2}">6</div>
      <div class="sl">Screens</div>
    </div>
    <div class="stat-cell">
      <div class="sv" style="color:${P.acc}">556</div>
      <div class="sl">Elements</div>
    </div>
    <div class="stat-cell">
      <div class="sv pos">Dark</div>
      <div class="sl">Theme</div>
    </div>
    <div class="stat-cell">
      <div class="sv" style="color:${P.acc2}">#12</div>
      <div class="sl">Heartbeat</div>
    </div>
  </div>

  <!-- Bento Features -->
  <section id="features">
    <div class="section-header">
      <div class="section-tag">Features</div>
      <h2>Everything you need to track wealth</h2>
      <p class="section-sub">Six thoughtfully designed screens covering every angle of personal finance intelligence.</p>
    </div>
    <div class="bento">
      <!-- Large: Portfolio -->
      <div class="bento-card bc-1" style="--glow-color: rgba(116,84,250,0.15)">
        <div class="bento-icon" style="background:rgba(116,84,250,0.15)">◈</div>
        <h3>Portfolio Overview</h3>
        <p>Net worth at a glance with sparkline momentum, bento allocation grid, and live market ticker strip.</p>
        <div class="bento-large-stat" style="color:${P.acc}">$284K</div>
        <div class="bento-label">Net Worth</div>
        <div class="bento-badge">↑ +14.2% YTD</div>
        <div class="alloc-row">
          <div class="alloc-item">
            <span class="alloc-label">Equities</span>
            <div class="alloc-track"><div class="alloc-fill" style="width:70%;background:${P.acc}"></div></div>
            <span class="alloc-pct">70%</span>
          </div>
          <div class="alloc-item">
            <span class="alloc-label">Cash</span>
            <div class="alloc-track"><div class="alloc-fill" style="width:15%;background:${P.acc2}"></div></div>
            <span class="alloc-pct">15%</span>
          </div>
          <div class="alloc-item">
            <span class="alloc-label">Real Estate</span>
            <div class="alloc-track"><div class="alloc-fill" style="width:13%;background:#4ECBB2"></div></div>
            <span class="alloc-pct">13%</span>
          </div>
        </div>
      </div>
      <!-- Small: AI Insights -->
      <div class="bento-card bc-2" style="--glow-color: rgba(178,138,78,0.15)">
        <div class="bento-icon" style="background:rgba(178,138,78,0.15)">✦</div>
        <h3>AI Insights</h3>
        <p>4 actionable wealth nudges — rebalancing signals, tax-loss harvest windows, and concentration risk alerts.</p>
        <div class="bento-large-stat" style="color:${P.acc2}">86</div>
        <div class="bento-label">Wealth Score</div>
        <div class="bento-badge">Top 12% of users</div>
      </div>
      <!-- 3 equal cards -->
      <div class="bento-card bc-3">
        <div class="bento-icon" style="background:rgba(78,203,178,0.12)">▦</div>
        <h3>Holdings</h3>
        <p>12 positions with allocation bars, filter pills, and per-asset P&L.</p>
      </div>
      <div class="bento-card bc-4">
        <div class="bento-icon" style="background:rgba(116,84,250,0.12)">⟳</div>
        <h3>Cash Flow</h3>
        <p>Income vs expenses breakdown with a 36.8% savings rate highlight.</p>
      </div>
      <div class="bento-card bc-5">
        <div class="bento-icon" style="background:rgba(178,138,78,0.12)">◎</div>
        <h3>Goals</h3>
        <p>Milestone tracker for 4 active goals — house, retirement, travel and more.</p>
      </div>
      <!-- Wide: Performance -->
      <div class="bento-card bc-6" style="--glow-color: rgba(116,84,250,0.1)">
        <div class="bento-icon" style="background:rgba(116,84,250,0.12)">⟋</div>
        <h3>Performance</h3>
        <p>YTD vs S&P 500 chart, top performer breakdown, and 4 risk metrics (Sharpe, Beta, Max Drawdown, Volatility) in a scannable grid. Outperforming the benchmark by <strong style="color:${P.acc2}">+5.1%</strong>.</p>
      </div>
    </div>
  </section>

  <!-- Screens -->
  <section id="screens" class="screens-section">
    <div class="section-header">
      <div class="section-tag">Screens</div>
      <h2>6 screens, one system</h2>
      <p class="section-sub">Mobile-first, 390×844 canvas — every screen detailed with real financial data.</p>
    </div>
    <div class="screens-grid">
      ${screens.map(sc => `
      <div class="screen-card">
        <img src="${sc.dataUri}" alt="${sc.name}" loading="lazy">
        <div class="screen-label">${sc.name}</div>
      </div>`).join('')}
    </div>
  </section>

  <!-- Palette -->
  <section id="palette" class="palette-section">
    <div class="section-header">
      <div class="section-tag">Palette</div>
      <h2>Violet × Gold authority</h2>
      <p class="section-sub">Inspired by the FinTech SaaS hero patterns on Land-book — deep violet signals precision, warm gold signals wealth.</p>
    </div>
    <div class="palette-grid">
      ${[
        { hex: '#0C0A1A', name: 'Background' },
        { hex: '#12102A', name: 'Surface' },
        { hex: '#1A1833', name: 'Card' },
        { hex: '#7454FA', name: 'Violet Acc' },
        { hex: '#B28A4E', name: 'Gold Acc' },
        { hex: '#4ECBB2', name: 'Teal Pos' },
        { hex: '#F1EFF9', name: 'Text' },
        { hex: '#A09CC0', name: 'Subtext' },
      ].map(s => `
      <div class="swatch">
        <div class="swatch-color" style="background:${s.hex};border:1px solid rgba(255,255,255,0.06)"></div>
        <div class="swatch-hex">${s.hex}</div>
        <div class="swatch-name">${s.name}</div>
      </div>`).join('')}
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <h2>Explore the full design</h2>
    <p>View in the interactive viewer or explore the Svelte mock with light/dark toggle.</p>
    <div class="btn-row" style="justify-content:center">
      <a class="btn-primary" href="https://ram.zenbin.org/karat-viewer">Open Viewer</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/karat-mock">Interactive Mock ☀◑</a>
    </div>
  </section>
</div>

<footer>
  <div class="footer-inner">
    <div class="footer-logo">KAR<span>AT</span></div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/karat-viewer">Viewer</a>
      <a href="https://ram.zenbin.org/karat-mock">Mock</a>
    </div>
    <div class="footer-credit">RAM Design Heartbeat #12 · ${new Date().toISOString().split('T')[0]}</div>
  </div>
</footer>

</body>
</html>`;

// ─── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero   [${SLUG}]: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 80)}`);

  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Design Viewer`);
  console.log(`Viewer [${SLUG}-viewer]: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 80)}`);
}

main().catch(console.error);
