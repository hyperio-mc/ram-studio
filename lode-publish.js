'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'lode';
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);

// Palette
const BG    = '#F5F0E8';
const SURF  = '#EDE8DF';
const CARD  = '#E5DED3';
const RULE  = '#C4BAA8';
const TEXT  = '#1A1818';
const MUTED = '#7A7268';
const ACC   = '#B85C38';
const ACC2  = '#4A7C6F';
const WHITE = '#FFFFFF';

// ── Publish helper ────────────────────────────────────────────────────────────
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

// ── Screen thumbnails (SVG data URIs) ─────────────────────────────────────────
const thumbs = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
});

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LODE — Codebase Intelligence</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:    ${BG};
    --surf:  ${SURF};
    --card:  ${CARD};
    --rule:  ${RULE};
    --text:  ${TEXT};
    --muted: ${MUTED};
    --acc:   ${ACC};
    --acc2:  ${ACC2};
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Hairline grid overlay (parchment texture) */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: repeating-linear-gradient(0deg, transparent, transparent 31px, var(--rule) 31px, var(--rule) 32px);
    opacity: 0.18;
    pointer-events: none;
    z-index: 0;
  }

  .page { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 0 24px; }

  /* ── Header */
  header {
    padding: 40px 0 0;
    border-bottom: 1px solid var(--rule);
    margin-bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 16px;
  }
  .logo { display: flex; align-items: baseline; gap: 12px; }
  .logo-name {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 8px;
    color: var(--text);
  }
  .logo-version {
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 2px;
  }
  .header-meta {
    text-align: right;
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 1.5px;
    line-height: 1.8;
  }
  .status-dot {
    display: inline-block;
    width: 7px; height: 7px;
    background: var(--acc2);
    border-radius: 50%;
    margin-right: 5px;
    vertical-align: middle;
  }

  /* ── Hero */
  .hero {
    padding: 56px 0 48px;
    border-bottom: 1px solid var(--rule);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .hero-text {}
  .callout-label {
    font-size: 8px;
    letter-spacing: 2px;
    color: var(--muted);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .callout-label::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 1px;
    background: var(--muted);
    opacity: 0.6;
  }
  .hero-title {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -1px;
    color: var(--text);
    margin-bottom: 20px;
  }
  .hero-title em {
    font-style: normal;
    color: var(--acc);
  }
  .hero-sub {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.7;
    max-width: 380px;
    margin-bottom: 32px;
  }
  .hero-cta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc);
    color: #fff;
    padding: 12px 24px;
    border-radius: 4px;
    font-family: inherit;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-decoration: none;
    transition: opacity .15s;
  }
  .btn-primary:hover { opacity: .85; }
  .btn-secondary {
    border: 1px solid var(--rule);
    color: var(--text);
    padding: 11px 20px;
    border-radius: 4px;
    font-family: inherit;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-decoration: none;
    transition: border-color .15s;
  }
  .btn-secondary:hover { border-color: var(--text); }

  /* Debt score dial */
  .hero-dial {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .dial-ring {
    position: relative;
    width: 180px;
    height: 100px;
    overflow: hidden;
  }
  .dial-ring svg { display: block; }
  .dial-number {
    text-align: center;
    font-size: 48px;
    font-weight: 800;
    color: var(--text);
    line-height: 1;
  }
  .dial-label {
    font-size: 8px;
    letter-spacing: 2.5px;
    color: var(--muted);
  }
  .dial-metrics {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 16px;
    width: 100%;
  }
  .dial-metric {
    text-align: center;
    border-top: 1px solid var(--rule);
    padding-top: 12px;
  }
  .dial-metric-val {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
  }
  .dial-metric-label { font-size: 7px; letter-spacing: 1px; color: var(--muted); margin-top: 4px; }

  /* ── Feature section */
  .section {
    padding: 56px 0;
    border-bottom: 1px solid var(--rule);
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 36px;
  }
  .section-num { font-size: 9px; color: var(--muted); letter-spacing: 2px; }
  .section-title { font-size: 11px; letter-spacing: 2px; color: var(--text); font-weight: 700; }

  /* Screens carousel */
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .screen-thumb {
    background: var(--card);
    border: 1px solid var(--rule);
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 390/844;
    position: relative;
    transition: transform .2s;
    cursor: pointer;
  }
  .screen-thumb:hover { transform: translateY(-3px); border-color: var(--acc); }
  .screen-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .screen-label {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: rgba(245,240,232,0.9);
    font-size: 7px;
    letter-spacing: 1.5px;
    color: var(--muted);
    padding: 6px 8px;
    font-weight: 600;
    border-top: 1px solid var(--rule);
    backdrop-filter: blur(4px);
  }

  /* ── Palette swatches */
  .palette-row {
    display: flex;
    gap: 0;
    border: 1px solid var(--rule);
    border-radius: 6px;
    overflow: hidden;
    height: 56px;
  }
  .swatch { flex: 1; position: relative; cursor: default; transition: flex .2s; }
  .swatch:hover { flex: 2; }
  .swatch-label {
    position: absolute;
    bottom: 6px; left: 8px;
    font-size: 7px;
    letter-spacing: 1px;
    font-weight: 600;
    opacity: 0;
    transition: opacity .2s;
  }
  .swatch:hover .swatch-label { opacity: 1; }

  /* ── Design specs */
  .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--rule); border: 1px solid var(--rule); border-radius: 6px; overflow: hidden; margin-bottom: 24px; }
  .spec { background: var(--surf); padding: 16px 20px; }
  .spec-key { font-size: 7px; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 6px; }
  .spec-val { font-size: 13px; font-weight: 600; color: var(--text); }

  /* ── Philosophy / decisions */
  .decisions-list { list-style: none; display: flex; flex-direction: column; gap: 0; }
  .decision {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid var(--rule);
  }
  .decision-num { font-size: 9px; color: var(--muted); letter-spacing: 1px; padding-top: 2px; }
  .decision-title { font-size: 11px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .decision-body { font-size: 11px; color: var(--muted); line-height: 1.6; }

  /* ── Footer */
  footer {
    padding: 32px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8px;
    color: var(--muted);
    letter-spacing: 1px;
  }
  footer a { color: var(--acc); text-decoration: none; }
  footer a:hover { text-decoration: underline; }

  @media (max-width: 640px) {
    .hero { grid-template-columns: 1fr; }
    .screens-grid { grid-template-columns: repeat(2,1fr); }
    .specs-grid { grid-template-columns: 1fr; }
    .hero-title { font-size: 36px; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- ── Header ── -->
  <header>
    <div class="logo">
      <span class="logo-name">LODE</span>
      <span class="logo-version">v2.4.1</span>
    </div>
    <div class="header-meta">
      <div><span class="status-dot"></span>CODEBASE INTELLIGENCE</div>
      <div>RAM DESIGN HEARTBEAT #43</div>
      <div>10 APR 2026</div>
    </div>
  </header>

  <!-- ── Hero ── -->
  <section class="hero">
    <div class="hero-text">
      <div class="callout-label">01 / SYSTEM OVERVIEW</div>
      <h1 class="hero-title">Know your<br><em>debt.</em><br>Ship better.</h1>
      <p class="hero-sub">
        LODE reads your codebase like a technical manual — scanning security vulnerabilities, dependency rot, and complexity debt with precision instruments, not vague percentages.
      </p>
      <div class="hero-cta">
        <a class="btn-primary" href="https://ram.zenbin.org/lode-viewer">VIEW DESIGN →</a>
        <a class="btn-secondary" href="https://ram.zenbin.org/lode-mock">INTERACTIVE MOCK</a>
      </div>
    </div>
    <div class="hero-dial">
      <!-- Debt score dial SVG -->
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Background circle arc -->
        <circle cx="100" cy="100" r="72" fill="none" stroke="${RULE}" stroke-width="8" stroke-dasharray="${(74/100)*452} 452" stroke-dashoffset="0" transform="rotate(-90 100 100)" opacity="0.3"/>
        <!-- Filled arc -->
        <circle cx="100" cy="100" r="72" fill="none" stroke="${ACC}" stroke-width="8" stroke-dasharray="${(74/100)*452} 452" stroke-dashoffset="0" transform="rotate(-90 100 100)" stroke-linecap="round"/>
        <!-- Score -->
        <text x="100" y="90" text-anchor="middle" font-size="40" font-weight="800" fill="${TEXT}" font-family="monospace">74</text>
        <text x="100" y="108" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="monospace">/100</text>
        <text x="100" y="124" text-anchor="middle" font-size="8" fill="${MUTED}" font-family="monospace" letter-spacing="2">DEBT SCORE</text>
        <!-- Annotation lines -->
        <line x1="28" y1="100" x2="40" y2="100" stroke="${RULE}" stroke-width="1" opacity="0.6"/>
        <text x="22" y="103" text-anchor="middle" font-size="7" fill="${MUTED}" font-family="monospace" opacity="0.6">0</text>
        <line x1="172" y1="100" x2="160" y2="100" stroke="${RULE}" stroke-width="1" opacity="0.6"/>
        <text x="178" y="103" text-anchor="middle" font-size="7" fill="${MUTED}" font-family="monospace" opacity="0.6">100</text>
      </svg>
      <div class="dial-metrics">
        <div class="dial-metric">
          <div class="dial-metric-val" style="color:${ACC2}">87%</div>
          <div class="dial-metric-label">COVERAGE</div>
        </div>
        <div class="dial-metric">
          <div class="dial-metric-val">4.2×</div>
          <div class="dial-metric-label">VELOCITY</div>
        </div>
        <div class="dial-metric">
          <div class="dial-metric-val" style="color:#C0392B">23</div>
          <div class="dial-metric-label">ISSUES</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Screens ── -->
  <section class="section">
    <div class="section-header">
      <span class="section-num">02</span>
      <span class="section-title">SIX SCREENS — DESIGN PROTOTYPE</span>
    </div>
    <div class="screens-grid">
      ${pen.screens.map((s,i) => `
        <div class="screen-thumb">
          <img src="${thumbs[i]}" alt="${s.name}" loading="lazy">
          <div class="screen-label">${String(i+1).padStart(2,'0')} ${s.name.toUpperCase()}</div>
        </div>
      `).join('')}
    </div>
    <div style="text-align:center; margin-top:16px;">
      <a href="https://ram.zenbin.org/lode-viewer" class="btn-primary">OPEN IN VIEWER</a>
    </div>
  </section>

  <!-- ── Palette ── -->
  <section class="section">
    <div class="section-header">
      <span class="section-num">03</span>
      <span class="section-title">COLOUR SYSTEM — WARM PARCHMENT × TERRACOTTA</span>
    </div>
    <div class="palette-row" style="margin-bottom:20px;">
      <div class="swatch" style="background:${BG}"><span class="swatch-label" style="color:${MUTED}">BG ${BG}</span></div>
      <div class="swatch" style="background:${SURF}"><span class="swatch-label" style="color:${MUTED}">SURF ${SURF}</span></div>
      <div class="swatch" style="background:${CARD}"><span class="swatch-label" style="color:${MUTED}">CARD ${CARD}</span></div>
      <div class="swatch" style="background:${RULE}"><span class="swatch-label" style="color:${TEXT}">RULE ${RULE}</span></div>
      <div class="swatch" style="background:${TEXT}"><span class="swatch-label" style="color:#fff">TEXT ${TEXT}</span></div>
      <div class="swatch" style="background:${ACC}"><span class="swatch-label" style="color:#fff">ACC ${ACC}</span></div>
      <div class="swatch" style="background:${ACC2}"><span class="swatch-label" style="color:#fff">ACC2 ${ACC2}</span></div>
    </div>
    <div class="specs-grid">
      <div class="spec"><div class="spec-key">BACKGROUND</div><div class="spec-val">${BG} — Warm Parchment</div></div>
      <div class="spec"><div class="spec-key">ACCENT</div><div class="spec-val">${ACC} — Terracotta</div></div>
      <div class="spec"><div class="spec-key">ACCENT 2</div><div class="spec-val">${ACC2} — Sage</div></div>
      <div class="spec"><div class="spec-key">TYPOGRAPHY</div><div class="spec-val">Monospace throughout</div></div>
      <div class="spec"><div class="spec-key">SCREENS</div><div class="spec-val">6 screens, ${pen.metadata.elements} elements</div></div>
      <div class="spec"><div class="spec-key">CANVAS</div><div class="spec-val">390 × 844 mobile-first</div></div>
    </div>
  </section>

  <!-- ── Design Decisions ── -->
  <section class="section">
    <div class="section-header">
      <span class="section-num">04</span>
      <span class="section-title">THREE DESIGN DECISIONS</span>
    </div>
    <ul class="decisions-list">
      <li class="decision">
        <span class="decision-num">01</span>
        <div>
          <div class="decision-title">Spaceship Manual Aesthetic — Monospace Everywhere</div>
          <div class="decision-body">Inspired directly by Godly.website's "spaceship manual" trend — dense diagrammatic layouts using monospaced fonts, numbered callout labels, and hairline rule dividers. Every screen treats the interface as a technical document, not a consumer app. No rounded hero cards, no illustrated icons — only precision instruments.</div>
        </div>
      </li>
      <li class="decision">
        <span class="decision-num">02</span>
        <div>
          <div class="decision-title">Terracotta Accent — Deliberate Anti-Purple Positioning</div>
          <div class="decision-body">Lapa.ninja research showed purple (#8B5CF6 range) has reached saturation as the de facto AI/SaaS accent colour. Switching to terracotta (#B85C38) with sage green (#4A7C6F) creates immediate differentiation — warm, earthy authority signals instead of "AI startup #437".</div>
        </div>
      </li>
      <li class="decision">
        <span class="decision-num">03</span>
        <div>
          <div class="decision-title">Treemap Heat View — Spatial Debt Density</div>
          <div class="decision-body">The Codebase Map screen uses a hand-laid treemap where card opacity encodes debt level — higher debt = more saturated fill. This gives developers an instant spatial reading of where technical debt is concentrated without a single percentage label on the overview. Adapted from Godly's bento grid asymmetry trend.</div>
        </div>
      </li>
    </ul>
  </section>

  <!-- ── Critique ── -->
  <section class="section" style="padding-bottom:0; border-bottom:none;">
    <div class="section-header">
      <span class="section-num">05</span>
      <span class="section-title">ONE HONEST CRITIQUE</span>
    </div>
    <p style="font-size:12px; color:var(--muted); line-height:1.7; max-width:600px;">
      The Issue Detail screen (Screen 6) is information-dense to the point of crowding — the code snippet, impact table, suggested fix, and action buttons all compete for vertical space. In a real product the code diff and fix suggestion would live in a separate expandable panel, not stacked inline. The current layout works as a prototype but would require refinement for sub-SE44 device heights.
    </p>
  </section>

  <!-- ── Footer ── -->
  <footer>
    <div>RAM DESIGN HEARTBEAT #43 · 10 APR 2026</div>
    <div>
      <a href="https://ram.zenbin.org/lode-viewer">VIEWER</a>
      &nbsp;·&nbsp;
      <a href="https://ram.zenbin.org/lode-mock">MOCK ☀◑</a>
    </div>
  </footer>

</div>
</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'LODE — Codebase Intelligence');
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'LODE — Viewer');
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
