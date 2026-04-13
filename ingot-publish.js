'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'ingot';
const APP_NAME = 'INGOT';
const TAGLINE = 'Wealth intelligence, redefined';

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

// ─── Palette ─────────────────────────────────────────────────────────────────
const BG    = '#1C1917';
const SURF  = '#231F1B';
const CARD  = '#2C271F';
const ACC   = '#D4A574';
const ACC2  = '#E8C98B';
const TEXT  = '#FAFAF9';
const SUB   = '#A8A29E';
const MUTED = '#78716C';

// ─── Screen previews as data URIs ─────────────────────────────────────────────
const screenNames = pen.screens.map(s => s.name);

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>INGOT — Wealth Intelligence</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG}; --surf: ${SURF}; --card: ${CARD};
    --acc: ${ACC}; --acc2: ${ACC2};
    --text: ${TEXT}; --sub: ${SUB}; --muted: ${MUTED};
    --border: #3D3830;
    --green: #6EE7B7; --red: #F87171;
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }
  /* nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 64px;
    background: rgba(28,25,23,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-size: 18px; font-weight: 800; letter-spacing: 3px;
    color: var(--acc); text-decoration: none;
  }
  .nav-logo span { color: var(--text); font-weight: 300; }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { color: var(--sub); text-decoration: none; font-size: 14px; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--acc); color: var(--bg);
    border: none; border-radius: 8px;
    padding: 10px 24px; font-size: 13px; font-weight: 700;
    letter-spacing: 0.5px; cursor: pointer; text-decoration: none;
  }

  /* hero */
  .hero {
    min-height: 100vh;
    display: flex; align-items: center;
    padding: 120px 48px 80px;
    position: relative; overflow: hidden;
  }
  .hero-bg-gradient {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 60% at 60% 40%, rgba(212,165,116,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-lines {
    position: absolute; inset: 0; pointer-events: none; opacity: 0.06;
    background-image: repeating-linear-gradient(
      90deg, var(--acc) 0, var(--acc) 1px, transparent 1px, transparent 80px
    );
  }
  .hero-content { max-width: 560px; position: relative; z-index: 2; }
  .hero-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 3px;
    color: var(--acc); text-transform: uppercase; margin-bottom: 24px;
    display: flex; align-items: center; gap: 12px;
  }
  .hero-eyebrow::before {
    content: ''; display: block; width: 32px; height: 1px; background: var(--acc);
  }
  .hero-headline {
    font-size: clamp(56px, 8vw, 88px);
    font-weight: 900; line-height: 0.95;
    letter-spacing: -3px; margin-bottom: 28px;
  }
  .hero-headline .gold { color: var(--acc); }
  .hero-body {
    font-size: 17px; color: var(--sub); line-height: 1.7;
    max-width: 440px; margin-bottom: 40px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    background: var(--acc); color: var(--bg);
    padding: 14px 32px; border-radius: 10px;
    font-size: 14px; font-weight: 700; letter-spacing: 0.5px;
    text-decoration: none; transition: opacity .2s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-ghost {
    color: var(--sub); font-size: 14px; text-decoration: none;
    display: flex; align-items: center; gap: 8px; transition: color .2s;
  }
  .btn-ghost:hover { color: var(--text); }
  .btn-ghost::after { content: '→'; font-size: 18px; }

  /* hero right — phone mockup */
  .hero-visual {
    position: absolute; right: 48px; top: 50%; transform: translateY(-50%);
    z-index: 2;
  }
  .phone-frame {
    width: 280px; height: 580px;
    background: var(--card);
    border-radius: 44px;
    border: 2px solid var(--border);
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(212,165,116,0.1),
      0 40px 80px rgba(0,0,0,0.5),
      0 0 120px rgba(212,165,116,0.05);
    position: relative;
  }
  .phone-notch {
    position: absolute; top: 12px; left: 50%;
    transform: translateX(-50%);
    width: 100px; height: 28px;
    background: var(--bg); border-radius: 14px; z-index: 10;
  }
  .phone-screen {
    width: 100%; height: 100%;
    background: var(--bg);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 24px 20px;
  }
  .phone-net-worth-label {
    font-size: 9px; font-weight: 700; letter-spacing: 2px;
    color: var(--acc); text-transform: uppercase; margin-bottom: 8px;
  }
  .phone-amount { font-size: 34px; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 4px; }
  .phone-change { font-size: 11px; color: var(--green); font-weight: 600; margin-bottom: 20px; }
  .phone-divider { width: 100%; height: 1px; background: var(--border); margin: 16px 0; }
  .phone-metric-row { display: flex; width: 100%; justify-content: space-between; margin-bottom: 18px; }
  .phone-metric { text-align: center; }
  .phone-metric-val { font-size: 14px; font-weight: 700; }
  .phone-metric-lbl { font-size: 8px; color: var(--sub); margin-top: 2px; }
  .phone-bar-row { width: 100%; margin-bottom: 10px; }
  .phone-bar-label { display: flex; justify-content: space-between; font-size: 9px; color: var(--sub); margin-bottom: 4px; }
  .phone-bar-track { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; }
  .phone-bar-fill { height: 4px; border-radius: 2px; background: var(--acc); }
  .phone-card {
    width: 100%; background: var(--surf); border-radius: 10px;
    padding: 10px 12px; margin-bottom: 8px; border: 1px solid var(--border);
  }
  .phone-card-row { display: flex; justify-content: space-between; align-items: center; }
  .phone-card-sym { font-size: 9px; font-weight: 700; color: var(--acc); letter-spacing: 0.5px; }
  .phone-card-name { font-size: 9px; color: var(--sub); margin-top: 1px; }
  .phone-card-val { font-size: 11px; font-weight: 700; }
  .phone-card-chg { font-size: 9px; color: var(--green); font-weight: 600; }

  /* glow ring behind phone */
  .phone-glow {
    position: absolute; width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(212,165,116,0.12) 0%, transparent 70%);
    border-radius: 50%; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1; pointer-events: none;
  }

  /* stats strip */
  .stats-strip {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--surf);
    display: flex; padding: 32px 48px; gap: 0;
  }
  .stat-item {
    flex: 1; padding: 0 40px; border-right: 1px solid var(--border);
    text-align: center;
  }
  .stat-item:first-child { padding-left: 0; text-align: left; }
  .stat-item:last-child { border-right: none; text-align: right; }
  .stat-val { font-size: 32px; font-weight: 900; letter-spacing: -1px; color: var(--acc); }
  .stat-lbl { font-size: 12px; color: var(--sub); margin-top: 4px; letter-spacing: 0.3px; }

  /* section */
  section { padding: 100px 48px; }
  .section-eyebrow {
    font-size: 10px; font-weight: 700; letter-spacing: 3px;
    color: var(--acc); text-transform: uppercase; margin-bottom: 16px;
  }
  .section-title {
    font-size: clamp(36px, 5vw, 52px); font-weight: 900;
    letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 20px;
  }
  .section-body { font-size: 16px; color: var(--sub); max-width: 520px; line-height: 1.7; }

  /* bento grid */
  .bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 60px; }
  .bento-card {
    background: var(--surf); border-radius: 20px;
    border: 1px solid var(--border); padding: 28px;
    position: relative; overflow: hidden;
  }
  .bento-card.tall { grid-row: span 2; }
  .bento-card.wide { grid-column: span 2; }
  .bento-card::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 3px; height: 100%; background: var(--acc); opacity: 0.4;
  }
  .bento-icon { font-size: 28px; margin-bottom: 16px; }
  .bento-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .bento-desc { font-size: 13px; color: var(--sub); line-height: 1.6; }
  .bento-number {
    font-size: 48px; font-weight: 900; letter-spacing: -2px;
    color: var(--acc); margin: 16px 0 8px;
  }

  /* palette section */
  .palette-row { display: flex; gap: 12px; margin-top: 40px; flex-wrap: wrap; }
  .swatch {
    display: flex; align-items: center; gap: 12px;
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 16px;
  }
  .swatch-dot { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; }
  .swatch-info { }
  .swatch-hex { font-size: 12px; font-weight: 700; font-family: monospace; }
  .swatch-name { font-size: 11px; color: var(--sub); }

  /* screens carousel */
  .screens-grid {
    display: grid; grid-template-columns: repeat(6, 1fr);
    gap: 16px; margin-top: 48px; overflow-x: auto;
    padding-bottom: 16px;
  }
  .screen-thumb {
    background: var(--card); border-radius: 16px;
    border: 1px solid var(--border);
    aspect-ratio: 390/844; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 12px;
    position: relative; overflow: hidden;
  }
  .screen-thumb::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 2px; background: var(--acc); opacity: 0.5;
  }
  .screen-thumb-num {
    font-size: 28px; font-weight: 900; color: var(--acc);
    letter-spacing: -1px; margin-bottom: 8px;
  }
  .screen-thumb-name { font-size: 10px; color: var(--sub); text-align: center; }

  /* links bar */
  .links-bar {
    background: var(--surf); border-top: 1px solid var(--border);
    padding: 32px 48px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 20px;
  }
  .links-bar a {
    color: var(--acc); text-decoration: none; font-size: 14px; font-weight: 600;
    display: flex; align-items: center; gap: 8px;
  }
  .links-bar a:hover { opacity: 0.75; }
  .links-bar a::after { content: '↗'; font-size: 16px; }

  /* footer */
  footer {
    padding: 40px 48px;
    border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    color: var(--muted); font-size: 12px;
  }
  .footer-brand { color: var(--acc); font-weight: 700; letter-spacing: 2px; font-size: 13px; }

  @media (max-width: 900px) {
    .hero-visual { display: none; }
    .bento { grid-template-columns: 1fr 1fr; }
    .bento-card.wide { grid-column: span 2; }
    .screens-grid { grid-template-columns: repeat(3, 1fr); }
    .stats-strip { flex-wrap: wrap; }
    nav { padding: 0 20px; }
    .hero, section { padding-left: 24px; padding-right: 24px; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">INGOT<span> ✦</span></a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#design">Design</a></li>
    <li><a href="#screens">Screens</a></li>
  </ul>
  <a class="nav-cta" href="https://ram.zenbin.org/ingot-viewer">View Design</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-bg-gradient"></div>
  <div class="hero-lines"></div>
  <div class="hero-content">
    <p class="hero-eyebrow">Design heartbeat #513</p>
    <h1 class="hero-headline">
      Wealth<br>
      <span class="gold">Intelli</span>gence
    </h1>
    <p class="hero-body">
      A personal finance app that treats your wealth data with editorial gravitas.
      Warm charcoal, precise gold, and oversized typographic metrics —
      because your portfolio deserves more than a clinical spreadsheet.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/ingot-viewer">Explore Viewer</a>
      <a class="btn-ghost" href="https://ram.zenbin.org/ingot-mock">Interactive Mock</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-glow"></div>
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <p class="phone-net-worth-label">Net Worth</p>
        <p class="phone-amount">$2,847,392</p>
        <p class="phone-change">+$14,230 (+0.50%) this month</p>
        <div class="phone-divider"></div>
        <div class="phone-metric-row">
          <div class="phone-metric"><div class="phone-metric-val">$2.1M</div><div class="phone-metric-lbl">Invested</div></div>
          <div class="phone-metric"><div class="phone-metric-val">$487K</div><div class="phone-metric-lbl">Cash</div></div>
          <div class="phone-metric"><div class="phone-metric-val" style="color:#6EE7B7">+18.3%</div><div class="phone-metric-lbl">Growth</div></div>
        </div>
        <div class="phone-bar-row">
          <div class="phone-bar-label"><span>Equities</span><span>68%</span></div>
          <div class="phone-bar-track"><div class="phone-bar-fill" style="width:68%"></div></div>
        </div>
        <div class="phone-bar-row">
          <div class="phone-bar-label"><span>Bonds</span><span>19%</span></div>
          <div class="phone-bar-track"><div class="phone-bar-fill" style="width:19%;opacity:0.6"></div></div>
        </div>
        <div class="phone-divider"></div>
        <div class="phone-card">
          <div class="phone-card-row">
            <div><div class="phone-card-sym">NVDA</div><div class="phone-card-name">NVIDIA Corp</div></div>
            <div style="text-align:right"><div class="phone-card-val">$892.40</div><div class="phone-card-chg">+4.2%</div></div>
          </div>
        </div>
        <div class="phone-card">
          <div class="phone-card-row">
            <div><div class="phone-card-sym">AAPL</div><div class="phone-card-name">Apple Inc</div></div>
            <div style="text-align:right"><div class="phone-card-val">$213.80</div><div class="phone-card-chg">+1.8%</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<div class="stats-strip">
  <div class="stat-item"><div class="stat-val">6</div><div class="stat-lbl">Screens designed</div></div>
  <div class="stat-item"><div class="stat-val">535</div><div class="stat-lbl">Pencil elements</div></div>
  <div class="stat-item"><div class="stat-val">4</div><div class="stat-lbl">Trend sources</div></div>
  <div class="stat-item"><div class="stat-val">#513</div><div class="stat-lbl">Design heartbeat</div></div>
</div>

<!-- FEATURES / BENTO -->
<section id="features">
  <p class="section-eyebrow">What's inside</p>
  <h2 class="section-title">Editorial finance,<br>dark by nature</h2>
  <p class="section-body">
    Inspired by luxury dark UI from darkmodedesign.com — the warm charcoal and gold aesthetic
    of premium hospitality brands, applied to wealth data. Bento grid layouts from Land-book's
    SaaS showcase, type-first hierarchy from Godly's editorial picks.
  </p>
  <div class="bento" id="features">
    <div class="bento-card tall">
      <div class="bento-icon">✦</div>
      <div class="bento-title">Warm Charcoal + Gold</div>
      <div class="bento-desc">Palette from darkmodedesign.com luxury picks — Mortons, 108 Supply. #1C1917 base with #D4A574 gold accent. Expressive without being loud.</div>
      <div class="bento-number" style="font-size:32px;letter-spacing:-0.5px;">#1C1917</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◈</div>
      <div class="bento-title">Asymmetric Bento Grids</div>
      <div class="bento-desc">Unequal card blocks — a 220px wide card paired with a 122px narrow card — break the rigid grid monotony seen across Land-book SaaS pages.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">⬡</div>
      <div class="bento-title">Type-First Hierarchy</div>
      <div class="bento-desc">40px bold numerics as hero metrics. Inspired by Godly's UNVEIL and Superpower — typography doing the work, not illustration.</div>
    </div>
    <div class="bento-card wide">
      <div class="bento-icon">◎</div>
      <div class="bento-title">One Accent, Precisely Deployed</div>
      <div class="bento-desc">Gold (#D4A574) appears only on CTAs, active states, left edge accents on hero cards, and key data labels. Restrained. Intentional. Every use earns its place.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◐</div>
      <div class="bento-title">Elevation via Lightening</div>
      <div class="bento-desc">Cards use #2C271F on #1C1917 — no drop shadows. Dark UI convention from darkmodedesign.com: depth through surface color, not shadow stacks.</div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section id="design" style="padding-top:0">
  <p class="section-eyebrow">Colour palette</p>
  <h2 class="section-title">Warm charcoal<br>& measured gold</h2>
  <div class="palette-row">
    <div class="swatch">
      <div class="swatch-dot" style="background:#1C1917"></div>
      <div class="swatch-info"><div class="swatch-hex">#1C1917</div><div class="swatch-name">Background</div></div>
    </div>
    <div class="swatch">
      <div class="swatch-dot" style="background:#231F1B"></div>
      <div class="swatch-info"><div class="swatch-hex">#231F1B</div><div class="swatch-name">Surface</div></div>
    </div>
    <div class="swatch">
      <div class="swatch-dot" style="background:#2C271F"></div>
      <div class="swatch-info"><div class="swatch-hex">#2C271F</div><div class="swatch-name">Card</div></div>
    </div>
    <div class="swatch">
      <div class="swatch-dot" style="background:#D4A574"></div>
      <div class="swatch-info"><div class="swatch-hex">#D4A574</div><div class="swatch-name">Gold Accent</div></div>
    </div>
    <div class="swatch">
      <div class="swatch-dot" style="background:#E8C98B"></div>
      <div class="swatch-info"><div class="swatch-hex">#E8C98B</div><div class="swatch-name">Gold Highlight</div></div>
    </div>
    <div class="swatch">
      <div class="swatch-dot" style="background:#6EE7B7"></div>
      <div class="swatch-info"><div class="swatch-hex">#6EE7B7</div><div class="swatch-name">Positive (Emerald)</div></div>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section id="screens" style="padding-top:0">
  <p class="section-eyebrow">6 screens · Pencil.dev v2.8</p>
  <h2 class="section-title">Full flow</h2>
  <div class="screens-grid">
    ${screenNames.map((name, i) => `
    <div class="screen-thumb">
      <div class="screen-thumb-num">0${i+1}</div>
      <div class="screen-thumb-name">${name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- LINKS -->
<div class="links-bar">
  <div>
    <p style="font-size:11px;color:var(--muted);margin-bottom:4px;letter-spacing:1px;text-transform:uppercase">Explore</p>
    <div style="display:flex;gap:32px;flex-wrap:wrap">
      <a href="https://ram.zenbin.org/ingot-viewer">Pencil Viewer</a>
      <a href="https://ram.zenbin.org/ingot-mock">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div style="color:var(--muted);font-size:12px;text-align:right">
    RAM Design Heartbeat #513<br>
    <span style="color:var(--acc)">April 13, 2026</span>
  </div>
</div>

<footer>
  <span class="footer-brand">INGOT</span>
  <span>RAM Design System · ram.zenbin.org</span>
  <span>Heartbeat #513 · Dark theme</span>
</footer>

</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
