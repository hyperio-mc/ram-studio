'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'lace';
const APP_NAME = 'LACE';
const TAGLINE  = 'Creative studio operations, elegantly structured';

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
const pen = JSON.parse(penJson);

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:      '#FAF8F4',
  surf:    '#FFFFFF',
  card:    '#F2EEE8',
  border:  '#DDD6CA',
  text:    '#1A1510',
  textSec: '#6B5F55',
  textMut: '#A0948A',
  acc:     '#2A4038',
  acc2:    '#B87333',
  green:   '#4A7C6B',
};

// ── Build hero screen SVGs as data URIs ───────────────────────────────────────
function svgToDataUri(svgStr) {
  const encoded = encodeURIComponent(svgStr).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}

const screenCards = pen.screens.map((sc, i) => {
  const uri = svgToDataUri(sc.svg);
  return `
    <div class="screen-card">
      <div class="screen-wrap">
        <img src="${uri}" alt="${sc.name}" loading="lazy" />
      </div>
      <p class="screen-label">${sc.name}</p>
    </div>`;
}).join('');

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      ${P.bg};
    --surf:    ${P.surf};
    --card:    ${P.card};
    --border:  ${P.border};
    --text:    ${P.text};
    --textSec: ${P.textSec};
    --textMut: ${P.textMut};
    --acc:     ${P.acc};
    --acc2:    ${P.acc2};
    --green:   ${P.green};
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }

  /* NAV */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,248,244,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .nav-logo {
    font-family: Georgia, serif;
    font-size: 1.25rem; font-weight: 700;
    color: var(--acc); letter-spacing: 0.12em;
  }
  .nav-links { display: flex; gap: 2rem; align-items: center; }
  .nav-links a {
    text-decoration: none; color: var(--textSec);
    font-size: 0.875rem; letter-spacing: 0.04em;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--acc); }
  .btn-outline {
    border: 1.5px solid var(--acc);
    color: var(--acc); background: transparent;
    padding: 0.4rem 1.1rem; border-radius: 20px;
    font-size: 0.8rem; font-weight: 600;
    letter-spacing: 0.06em;
    cursor: pointer; text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }
  .btn-outline:hover { background: var(--acc); color: #fff; }
  .btn-solid {
    background: var(--acc); color: #fff;
    padding: 0.4rem 1.3rem; border-radius: 20px;
    font-size: 0.8rem; font-weight: 600;
    letter-spacing: 0.06em; border: none;
    cursor: pointer; text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-solid:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    max-width: 900px; margin: 0 auto;
    padding: 6rem 2rem 4rem;
    text-align: center;
  }
  .hero-kicker {
    display: inline-block;
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.18em; color: var(--acc2);
    text-transform: uppercase;
    background: #FBF3E0; border-radius: 20px;
    padding: 0.3rem 1rem; margin-bottom: 1.5rem;
  }
  .hero h1 {
    font-family: Georgia, serif;
    font-size: clamp(2.8rem, 6vw, 4.5rem);
    font-weight: 700; line-height: 1.1;
    color: var(--text); margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
  }
  .hero h1 em {
    font-style: italic; color: var(--acc);
  }
  .hero p {
    font-size: 1.15rem; color: var(--textSec);
    max-width: 540px; margin: 0 auto 2.5rem;
    line-height: 1.7;
  }
  .hero-ctas {
    display: flex; gap: 1rem; justify-content: center;
    flex-wrap: wrap; margin-bottom: 1rem;
  }
  .hero-ctas .btn-solid { font-size: 0.95rem; padding: 0.7rem 2rem; border-radius: 30px; }
  .hero-ctas .btn-outline { font-size: 0.95rem; padding: 0.7rem 2rem; border-radius: 30px; }
  .hero-social-proof {
    font-size: 0.8rem; color: var(--textMut);
    letter-spacing: 0.04em; margin-top: 0.5rem;
  }

  /* PROOF BAR */
  .proof-bar {
    background: var(--surf);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 1.5rem 2rem;
    display: flex; justify-content: center;
    gap: 3rem; flex-wrap: wrap;
  }
  .proof-stat { text-align: center; }
  .proof-stat strong {
    display: block;
    font-family: Georgia, serif;
    font-size: 1.8rem; font-weight: 700;
    color: var(--acc);
  }
  .proof-stat span {
    font-size: 0.8rem; color: var(--textSec);
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* SCREENS CAROUSEL */
  .screens-section {
    padding: 5rem 1.5rem;
    max-width: 1100px; margin: 0 auto;
  }
  .section-label {
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.18em; color: var(--textMut);
    text-transform: uppercase; margin-bottom: 1rem;
  }
  .section-title {
    font-family: Georgia, serif;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 700; color: var(--text);
    margin-bottom: 0.6rem;
  }
  .section-sub {
    color: var(--textSec); font-size: 1rem;
    max-width: 460px; margin-bottom: 3rem;
  }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
  @media (max-width: 700px) {
    .screens-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 460px) {
    .screens-grid { grid-template-columns: 1fr; }
  }
  .screen-card {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition: box-shadow 0.25s, transform 0.25s;
    cursor: pointer;
  }
  .screen-card:hover {
    box-shadow: 0 12px 32px rgba(42,64,56,0.12);
    transform: translateY(-3px);
  }
  .screen-wrap {
    background: var(--bg);
    padding: 1rem;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .screen-wrap img {
    width: 120px; height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(26,21,16,0.08);
  }
  .screen-label {
    padding: 0.6rem 1rem;
    font-size: 0.82rem; font-weight: 600;
    color: var(--textSec);
    letter-spacing: 0.03em;
    border-top: 1px solid var(--border);
  }

  /* BENTO FEATURES */
  .features-section {
    background: var(--surf);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 5rem 2rem;
  }
  .features-inner {
    max-width: 900px; margin: 0 auto;
  }
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;
    margin-top: 3rem;
  }
  .bento-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 1.5rem;
    transition: box-shadow 0.2s;
  }
  .bento-card:hover { box-shadow: 0 8px 24px rgba(42,64,56,0.08); }
  .bento-card.wide  { grid-column: span 4; }
  .bento-card.narrow { grid-column: span 2; }
  .bento-card.half  { grid-column: span 3; }
  .bento-card.full  { grid-column: span 6; }
  @media (max-width: 680px) {
    .bento-card, .bento-card.wide, .bento-card.narrow, .bento-card.half { grid-column: span 6; }
  }
  .bento-icon {
    width: 40px; height: 40px;
    background: ${P.acc}18;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; margin-bottom: 1rem;
  }
  .bento-card.accent-card { background: var(--acc); border-color: var(--acc); }
  .bento-card.accent-card .bento-icon { background: rgba(255,255,255,0.15); }
  .bento-card.accent-card h3,
  .bento-card.accent-card p { color: #fff; }
  .bento-card.accent-card p { opacity: 0.75; }
  .bento-card h3 {
    font-family: Georgia, serif;
    font-size: 1.05rem; font-weight: 700;
    color: var(--text); margin-bottom: 0.4rem;
  }
  .bento-card p {
    font-size: 0.88rem; color: var(--textSec);
    line-height: 1.55;
  }
  .bento-metric {
    font-family: Georgia, serif;
    font-size: 2.2rem; font-weight: 700;
    color: var(--acc); margin: 0.5rem 0 0.2rem;
  }
  .bento-metric-label {
    font-size: 0.78rem; color: var(--textSec);
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* PALETTE */
  .palette-section {
    padding: 4rem 2rem;
    max-width: 900px; margin: 0 auto;
    text-align: center;
  }
  .swatches {
    display: flex; gap: 0.75rem;
    justify-content: center; flex-wrap: wrap;
    margin-top: 2rem;
  }
  .swatch {
    width: 80px; height: 80px;
    border-radius: 12px;
    border: 1px solid var(--border);
    position: relative;
  }
  .swatch-label {
    position: absolute; bottom: -22px; left: 0; right: 0;
    text-align: center; font-size: 0.72rem; color: var(--textMut);
    font-family: monospace;
  }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border);
    padding: 2.5rem 2rem;
    text-align: center;
    font-size: 0.8rem; color: var(--textMut);
    background: var(--surf);
  }
  footer a { color: var(--acc); text-decoration: none; }
  footer .footer-nav {
    display: flex; gap: 2rem; justify-content: center;
    margin-bottom: 1rem; flex-wrap: wrap;
  }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">LACE</span>
  <div class="nav-links">
    <a href="#screens">Preview</a>
    <a href="#features">Features</a>
    <a href="${SLUG}-viewer" target="_blank" class="btn-outline">Open Viewer</a>
    <a href="${SLUG}-mock" target="_blank" class="btn-solid">Try Mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-kicker">Design Heartbeat #54 · Light Theme</div>
  <h1>Studio operations,<br/><em>elegantly structured</em></h1>
  <p>${TAGLINE}. One calm workspace for projects, clients, team capacity, and studio intelligence.</p>
  <div class="hero-ctas">
    <a href="${SLUG}-mock" class="btn-solid">Explore the Mock →</a>
    <a href="${SLUG}-viewer" class="btn-outline">View in Pencil Viewer</a>
  </div>
  <p class="hero-social-proof">Inspired by bento card layouts (Land-book 2026) · Silent luxury palette (Minimal.gallery)</p>
</section>

<div class="proof-bar">
  <div class="proof-stat"><strong>6</strong><span>Screens</span></div>
  <div class="proof-stat"><strong>${pen.metadata.elements}</strong><span>Elements</span></div>
  <div class="proof-stat"><strong>Light</strong><span>Theme</span></div>
  <div class="proof-stat"><strong>#54</strong><span>Heartbeat</span></div>
</div>

<section class="screens-section" id="screens">
  <p class="section-label">Design Preview</p>
  <h2 class="section-title">Six considered screens</h2>
  <p class="section-sub">From the bento dashboard to client-facing work review — everything a creative studio needs in reach.</p>
  <div class="screens-grid">
    ${screenCards}
  </div>
</section>

<section class="features-section" id="features">
  <div class="features-inner">
    <p class="section-label">What LACE does</p>
    <h2 class="section-title">Designed for how studios actually work</h2>
    <div class="bento-grid">
      <div class="bento-card wide accent-card">
        <div class="bento-icon">⬡</div>
        <h3>Bento Studio Dashboard</h3>
        <p>All critical studio signals in one glanceable layout — active projects, team capacity, revenue momentum, and overdue items. No hunting through lists.</p>
      </div>
      <div class="bento-card narrow">
        <div class="bento-icon">◈</div>
        <div class="bento-metric">12</div>
        <div class="bento-metric-label">Active projects</div>
        <p>Track every brief at a glance, with progress and budget in one view.</p>
      </div>
      <div class="bento-card half">
        <div class="bento-icon">▦</div>
        <h3>Project Command</h3>
        <p>Client name, deadline, budget, and completion — with a colour-coded progress bar for each brief. Filter by status in one tap.</p>
      </div>
      <div class="bento-card half">
        <div class="bento-icon">◯</div>
        <h3>Team Workload Map</h3>
        <p>Day-by-day capacity heatmap for every team member. Over-capacity flags surface before burnout happens, not after.</p>
      </div>
      <div class="bento-card narrow">
        <div class="bento-icon">◉</div>
        <div class="bento-metric">34%</div>
        <div class="bento-metric-label">Avg margin</div>
        <p>Profitability by service type, so you know which work to pitch more of.</p>
      </div>
      <div class="bento-card wide">
        <div class="bento-icon">✦</div>
        <h3>Client-Facing Report View</h3>
        <p>Share a clean milestone tracker directly with clients. Approval requests, comment threads, and palette proofs — all in one sharable screen, no external tools needed.</p>
      </div>
    </div>
  </div>
</section>

<section class="palette-section">
  <p class="section-label">Colour System</p>
  <h2 class="section-title">The Silent Luxury palette</h2>
  <p style="color:var(--textSec);font-size:.95rem;margin-top:.5rem;">Warm parchment, deep forest green, copper amber. Inspired by Minimal.gallery's curated editorial and hospitality sites.</p>
  <div class="swatches">
    <div style="position:relative;margin-bottom:28px">
      <div class="swatch" style="background:${P.bg}"></div>
      <span class="swatch-label">${P.bg}</span>
    </div>
    <div style="position:relative;margin-bottom:28px">
      <div class="swatch" style="background:${P.card}"></div>
      <span class="swatch-label">${P.card}</span>
    </div>
    <div style="position:relative;margin-bottom:28px">
      <div class="swatch" style="background:${P.border}"></div>
      <span class="swatch-label">${P.border}</span>
    </div>
    <div style="position:relative;margin-bottom:28px">
      <div class="swatch" style="background:${P.text}"></div>
      <span class="swatch-label">${P.text}</span>
    </div>
    <div style="position:relative;margin-bottom:28px">
      <div class="swatch" style="background:${P.acc}"></div>
      <span class="swatch-label">${P.acc}</span>
    </div>
    <div style="position:relative;margin-bottom:28px">
      <div class="swatch" style="background:${P.acc2}"></div>
      <span class="swatch-label">${P.acc2}</span>
    </div>
  </div>
</section>

<footer>
  <div class="footer-nav">
    <a href="${SLUG}-viewer">Pencil Viewer</a>
    <a href="${SLUG}-mock">Interactive Mock</a>
    <a href="https://ram.zenbin.org">All Designs</a>
  </div>
  RAM Design Heartbeat #54 · ${new Date().toDateString()} · <a href="https://ram.zenbin.org">ram.zenbin.org</a>
</footer>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero   : ${r1.status}  ${r1.status !== 201 ? r1.body.slice(0,120) : 'OK'}`);

  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer : ${r2.status}  ${r2.status !== 201 ? r2.body.slice(0,120) : 'OK'}`);
}
main().catch(console.error);
