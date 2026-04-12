'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'quire';

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
const C = {
  bg: '#FAF8F3', surf: '#FFFFFF', card: '#F2EDE3', card2: '#EDE6D8',
  ink: '#1C1917', inkMid: '#44403C', inkFaint: '#78716C',
  brick: '#B91C1C', brickBg: '#FEE2E2',
  cobalt: '#1D4ED8', cobaltBg: '#EEF2FF',
  green: '#2D6A4F', greenBg: '#EAF4EE',
  amber: '#B45309', amberBg: '#FEF3C7',
  plum: '#7C3AED', plumBg: '#EDE9FE',
};

// ── Build SVG data URIs from screens ─────────────────────────────────────────
const screenPreviews = pen.screens.map((sc, i) => {
  const svgEncoded = encodeURIComponent(sc.svg);
  return `
    <div class="screen-card" style="flex-shrink:0;width:200px;margin-right:16px;">
      <div style="background:${C.surf};border-radius:16px;overflow:hidden;border:1px solid rgba(28,25,23,0.08);box-shadow:0 4px 20px rgba(28,25,23,0.08);">
        <img src="data:image/svg+xml,${svgEncoded}" width="200" alt="${sc.name}"
          style="display:block;width:200px;height:auto;" />
      </div>
      <p style="margin:8px 0 0;font-size:11px;color:${C.inkFaint};text-align:center;font-family:system-ui,sans-serif;">${sc.name}</p>
    </div>`;
}).join('');

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Quire — Read what matters</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${C.bg}; --surf: ${C.surf}; --card: ${C.card}; --card2: ${C.card2};
    --ink: ${C.ink}; --inkMid: ${C.inkMid}; --inkFaint: ${C.inkFaint};
    --brick: ${C.brick}; --cobalt: ${C.cobalt}; --green: ${C.green}; --amber: ${C.amber}; --plum: ${C.plum};
  }
  body { background: var(--bg); color: var(--ink); font-family: 'Georgia', serif; line-height: 1.6; }
  .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }

  /* Nav */
  nav {
    position: sticky; top: 0; z-index: 10;
    background: rgba(250,248,243,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(28,25,23,0.08);
    padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo { font-size: 16px; font-weight: 700; letter-spacing: 4px; font-family: system-ui, sans-serif; color: var(--ink); }
  .nav-links { display: flex; gap: 24px; font-family: system-ui, sans-serif; font-size: 13px; color: var(--inkFaint); }
  .nav-cta {
    background: var(--ink); color: #fff; border: none; border-radius: 20px;
    padding: 8px 20px; font-size: 13px; font-family: system-ui, sans-serif;
    cursor: pointer; font-weight: 600; text-decoration: none;
  }

  /* Hero */
  .hero { padding: 80px 24px 60px; max-width: 900px; margin: 0 auto; }
  .hero-eyebrow {
    font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 3px; color: var(--brick); text-transform: uppercase;
    margin-bottom: 20px;
  }
  .hero-headline {
    font-size: clamp(48px, 8vw, 88px); font-weight: 700; line-height: 1.0;
    letter-spacing: -2px; color: var(--ink); margin-bottom: 28px;
  }
  .hero-headline em { font-style: italic; color: var(--inkMid); }
  .hero-deck {
    font-size: 18px; color: var(--inkMid); max-width: 480px; margin-bottom: 36px; font-family: Georgia, serif;
  }
  .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--ink); color: #fff; border: none; border-radius: 24px;
    padding: 14px 28px; font-size: 15px; font-weight: 600; font-family: system-ui, sans-serif;
    cursor: pointer; text-decoration: none; display: inline-block;
  }
  .btn-secondary {
    background: transparent; color: var(--inkMid); border: 1.5px solid rgba(28,25,23,0.2);
    border-radius: 24px; padding: 13px 24px; font-size: 15px; font-family: system-ui, sans-serif;
    cursor: pointer; text-decoration: none; display: inline-block;
  }

  /* Screens carousel */
  .carousel-section { padding: 0 0 64px; overflow: hidden; }
  .carousel-label { font-family: system-ui, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: var(--inkFaint); margin-bottom: 20px; text-transform: uppercase; padding-left: 24px; }
  .carousel { display: flex; padding: 8px 24px 24px; overflow-x: auto; gap: 0; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .carousel::-webkit-scrollbar { height: 4px; }
  .carousel::-webkit-scrollbar-track { background: var(--card); border-radius: 2px; }
  .carousel::-webkit-scrollbar-thumb { background: rgba(28,25,23,0.2); border-radius: 2px; }

  /* Features */
  .features { padding: 64px 0; border-top: 1px solid rgba(28,25,23,0.08); }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 40px; }
  .feature-card { background: var(--surf); border-radius: 12px; padding: 24px; border: 1px solid rgba(28,25,23,0.06); }
  .feature-icon { font-size: 24px; margin-bottom: 12px; }
  .feature-title { font-weight: 700; font-size: 15px; margin-bottom: 8px; font-family: Georgia, serif; }
  .feature-desc { font-size: 13px; color: var(--inkFaint); font-family: system-ui, sans-serif; line-height: 1.5; }

  /* Topics palette */
  .topics-section { padding: 64px 0; border-top: 1px solid rgba(28,25,23,0.08); }
  .section-label { font-family: system-ui, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: var(--inkFaint); margin-bottom: 32px; text-transform: uppercase; }
  .topics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
  .topic-chip {
    border-radius: 8px; padding: 16px 18px; display: flex; align-items: center; gap: 10px;
    font-family: system-ui, sans-serif; font-weight: 600; font-size: 14px;
  }
  .topic-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* Palette swatches */
  .palette-section { padding: 64px 0; border-top: 1px solid rgba(28,25,23,0.08); }
  .swatches { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 24px; }
  .swatch { width: 48px; height: 48px; border-radius: 8px; border: 1px solid rgba(28,25,23,0.1); }
  .swatch-info { margin-top: 6px; font-family: system-ui, sans-serif; font-size: 10px; color: var(--inkFaint); text-align: center; width: 48px; }

  /* Pull quote */
  .pullquote {
    border-left: 4px solid var(--brick); padding: 24px 28px;
    background: var(--card); border-radius: 0 8px 8px 0;
    margin: 48px 0; font-size: 20px; font-style: italic; color: var(--ink);
  }

  /* Links */
  .links-section { padding: 48px 0; display: flex; gap: 16px; flex-wrap: wrap; }
  .link-btn {
    background: var(--surf); border: 1px solid rgba(28,25,23,0.12);
    border-radius: 20px; padding: 10px 20px;
    font-size: 13px; font-family: system-ui, sans-serif; color: var(--ink);
    text-decoration: none; font-weight: 500;
  }
  .link-btn:hover { background: var(--card); }

  /* Footer */
  footer { border-top: 1px solid rgba(28,25,23,0.08); padding: 32px 24px; text-align: center; font-family: system-ui, sans-serif; font-size: 12px; color: var(--inkFaint); }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">QUIRE</span>
  <div class="nav-links">
    <span>Editorial</span>
    <span>Topics</span>
    <span>Writers</span>
  </div>
  <a href="https://ram.zenbin.org/quire-viewer" class="nav-cta">Open in Viewer</a>
</nav>

<div class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat #${pen.metadata.heartbeat}</p>
  <h1 class="hero-headline">Read<br><em>what matters.</em></h1>
  <p class="hero-deck">A curated editorial reading app where every topic tells its story through its own visual language. Big type, warm paper, and colour that shifts with your interests.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/quire-viewer" class="btn-primary">Open Viewer</a>
    <a href="https://ram.zenbin.org/quire-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</div>

<div class="carousel-section">
  <p class="carousel-label">6 Screens — scroll to explore</p>
  <div class="carousel">
    ${screenPreviews}
  </div>
</div>

<div class="container">

  <blockquote class="pullquote">
    "Colour is not decoration — it's the editorial voice of each topic."
  </blockquote>

  <div class="features">
    <p class="section-label">Design Features</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">◉</div>
        <div class="feature-title">Contextual Palette</div>
        <div class="feature-desc">Each topic — Culture, Tech, Environment — has its own accent colour, shifting the feel of the app as you read.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">Aa</div>
        <div class="feature-title">Big Type Editorial</div>
        <div class="feature-desc">Headlines at 28–30px act as primary graphic elements, not just labels. Inspired by Siteinspire's "Big Type" curatorial category.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◈</div>
        <div class="feature-title">Warm Paper Palette</div>
        <div class="feature-desc">Cream (#FAF8F3) and parchment (#EDE6D8) base palette evokes physical reading without skeuomorphism.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">▣</div>
        <div class="feature-title">Pull Quote Architecture</div>
        <div class="feature-desc">Accent-coloured left border quotes break the reading flow, creating visual rhythm in long-form articles.</div>
      </div>
    </div>
  </div>

  <div class="topics-section">
    <p class="section-label">Topic Colour System</p>
    <div class="topics-grid">
      <div class="topic-chip" style="background:${C.brickBg}">
        <div class="topic-dot" style="background:${C.brick}"></div>
        <span style="color:${C.brick}">Culture</span>
      </div>
      <div class="topic-chip" style="background:${C.cobaltBg}">
        <div class="topic-dot" style="background:${C.cobalt}"></div>
        <span style="color:${C.cobalt}">Technology</span>
      </div>
      <div class="topic-chip" style="background:${C.greenBg}">
        <div class="topic-dot" style="background:${C.green}"></div>
        <span style="color:${C.green}">Environment</span>
      </div>
      <div class="topic-chip" style="background:${C.amberBg}">
        <div class="topic-dot" style="background:${C.amber}"></div>
        <span style="color:${C.amber}">Science</span>
      </div>
      <div class="topic-chip" style="background:${C.plumBg}">
        <div class="topic-dot" style="background:${C.plum}"></div>
        <span style="color:${C.plum}">Society</span>
      </div>
    </div>
  </div>

  <div class="palette-section">
    <p class="section-label">Base Palette</p>
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;">
      ${[
        { color: C.bg, name: 'Cream BG' },
        { color: C.surf, name: 'Surface' },
        { color: C.card, name: 'Parchment' },
        { color: C.card2, name: 'Deep Parch.' },
        { color: C.ink, name: 'Ink' },
        { color: C.inkMid, name: 'Ink Mid' },
        { color: C.inkFaint, name: 'Ink Faint' },
        { color: C.brick, name: 'Brick' },
        { color: C.cobalt, name: 'Cobalt' },
        { color: C.green, name: 'Leaf' },
        { color: C.amber, name: 'Amber' },
        { color: C.plum, name: 'Plum' },
      ].map(s => `
        <div>
          <div class="swatch" style="background:${s.color}"></div>
          <div class="swatch-info">${s.name}</div>
        </div>`).join('')}
    </div>
  </div>

  <div class="links-section">
    <a href="https://ram.zenbin.org/quire-viewer" class="link-btn">📐 Open Viewer</a>
    <a href="https://ram.zenbin.org/quire-mock" class="link-btn">☀◑ Interactive Mock</a>
    <span class="link-btn" style="color:var(--inkFaint)">Design Heartbeat #${pen.metadata.heartbeat}</span>
    <span class="link-btn" style="color:var(--inkFaint)">${pen.screens.length} screens · ${pen.metadata.elements} elements · Light theme</span>
  </div>

</div>

<footer>
  <p>Quire — RAM Design Heartbeat #${pen.metadata.heartbeat} · ${pen.metadata.date} · Light theme</p>
  <p style="margin-top:6px;">Inspired by Deem Journal (Siteinspire) and KOMETA Typefaces (minimal.gallery)</p>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'Quire — Read what matters');
  console.log(`Hero: ${r1.status}`);
  if (r1.status !== 201) console.log('Hero body:', r1.body.slice(0, 200));

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'Quire — Viewer');
  console.log(`Viewer: ${r2.status}`);
  if (r2.status !== 201) console.log('Viewer body:', r2.body.slice(0, 200));
}

main().catch(console.error);
