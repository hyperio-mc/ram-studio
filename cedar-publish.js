'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'cedar';
const APP     = 'Cedar';
const TAGLINE = 'A place for slow reflection';

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

// ── Build SVG data URIs from screen elements ──
function elToSVG(el) {
  switch(el.type) {
    case 'rect':
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    case 'text':
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'serif'}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity||1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    case 'circle':
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    case 'line':
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
    default: return '';
  }
}

function screenToSVG(screen) {
  const svgEls = screen.elements.map(elToSVG).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${svgEls}</svg>`;
}

const svgs = pen.screens.map(screenToSVG);

// ── Palette ──
const P = {
  bg:   '#FAF8F3',
  acc:  '#3D6B4F',
  acc2: '#7FA882',
  acc3: '#D4E8D9',
  text: '#2B2620',
  text2:'#7A6E62',
  warm: '#C8A882',
};

// ── Hero HTML ──
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Cedar — A place for slow reflection</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #FAF8F3; --bg2: #F3F0E8; --bg3: #EAE6D9; --surf: #FFFFFF;
    --text: #2B2620; --text2: #7A6E62; --text3: #B0A899;
    --acc: #3D6B4F; --acc2: #7FA882; --acc3: #D4E8D9;
    --warm: #C8A882; --line: #E0DAD0;
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }

  /* ── NAV ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,248,243,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--line);
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .nav-logo { font-size: 18px; font-weight: 400; letter-spacing: 0.06em; color: var(--acc); }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { font-size: 13px; color: var(--text2); text-decoration: none; letter-spacing: 0.03em; }
  .nav-links a:hover { color: var(--acc); }
  .nav-cta {
    background: var(--acc); color: #fff; border: none;
    padding: 8px 20px; border-radius: 20px;
    font-family: Georgia, serif; font-size: 13px; cursor: pointer;
    letter-spacing: 0.02em;
  }

  /* ── HERO ── */
  .hero {
    min-height: 92vh;
    display: flex; align-items: center;
    padding: 80px 40px;
    gap: 60px;
    max-width: 1200px; margin: 0 auto;
  }
  .hero-text { flex: 1; max-width: 540px; }
  .hero-eyebrow {
    font-size: 11px; letter-spacing: 0.14em; color: var(--acc2);
    text-transform: uppercase; margin-bottom: 24px;
  }
  .hero-title {
    font-size: clamp(48px, 6vw, 80px);
    font-weight: 300; line-height: 1.1;
    letter-spacing: -0.02em; color: var(--text);
    margin-bottom: 24px;
  }
  .hero-title em { color: var(--acc); font-style: normal; }
  .hero-sub {
    font-size: 17px; color: var(--text2);
    line-height: 1.7; margin-bottom: 40px;
    max-width: 440px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: #fff;
    padding: 14px 32px; border-radius: 28px;
    font-family: Georgia, serif; font-size: 15px;
    text-decoration: none; letter-spacing: 0.02em;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-ghost {
    color: var(--acc); font-size: 14px;
    text-decoration: none; letter-spacing: 0.02em;
    display: flex; align-items: center; gap: 6px;
  }
  .hero-note { font-size: 12px; color: var(--text3); margin-top: 20px; }

  /* ── PHONE STACK ── */
  .hero-phones { flex: 0 0 380px; position: relative; }
  .phone-main {
    width: 260px; background: #fff;
    border-radius: 36px; padding: 12px;
    box-shadow: 0 24px 64px rgba(61,107,79,0.12), 0 4px 16px rgba(61,107,79,0.06);
    margin: 0 auto;
  }
  .phone-screen { border-radius: 26px; overflow: hidden; display: block; width: 100%; }
  .phone-back {
    position: absolute; top: 40px; right: -20px;
    width: 230px; background: #fff;
    border-radius: 32px; padding: 10px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.06);
    z-index: -1; opacity: 0.7;
  }

  /* ── BAND ── */
  .proof-band {
    background: var(--bg2); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
    padding: 24px 40px;
    display: flex; align-items: center; justify-content: center;
    gap: 48px; flex-wrap: wrap;
  }
  .proof-item { text-align: center; }
  .proof-num { font-size: 28px; font-weight: 300; color: var(--acc); display: block; }
  .proof-label { font-size: 11px; color: var(--text3); letter-spacing: 0.08em; text-transform: uppercase; }

  /* ── FEATURES ── */
  .features { max-width: 1100px; margin: 0 auto; padding: 100px 40px; }
  .section-eyebrow {
    font-size: 11px; letter-spacing: 0.14em; color: var(--acc2);
    text-transform: uppercase; margin-bottom: 16px;
  }
  .section-title {
    font-size: clamp(32px, 4vw, 52px);
    font-weight: 300; line-height: 1.15;
    letter-spacing: -0.01em; margin-bottom: 64px;
    max-width: 500px;
  }

  /* ── BENTO GRID ── */
  .bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 80px; }
  .bento-card {
    background: var(--surf); border: 1px solid var(--line);
    border-radius: 20px; padding: 28px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .bento-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,107,79,0.08); }
  .bento-card.accent { background: var(--acc); color: #fff; border-color: var(--acc); }
  .bento-card.accent .card-label { color: rgba(255,255,255,0.6); }
  .bento-card.large { grid-column: span 2; }
  .bento-card.warm { background: #F9F3E8; border-color: #E8D8BC; }
  .card-icon { font-size: 24px; margin-bottom: 16px; }
  .card-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text3); margin-bottom: 8px; }
  .card-title { font-size: 20px; font-weight: 400; color: var(--text); margin-bottom: 8px; }
  .bento-card.accent .card-title { color: #fff; }
  .card-body { font-size: 14px; color: var(--text2); line-height: 1.6; }
  .bento-card.accent .card-body { color: rgba(255,255,255,0.75); }

  /* ── SCREENS CAROUSEL ── */
  .screens-section { background: var(--bg2); padding: 80px 40px; }
  .screens-inner { max-width: 1100px; margin: 0 auto; }
  .screens-grid {
    display: flex; gap: 20px; overflow-x: auto;
    padding-bottom: 16px; scrollbar-width: none;
  }
  .screens-grid::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 200px; background: #fff;
    border-radius: 24px; padding: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  }
  .screen-card svg { width: 100%; border-radius: 18px; display: block; }
  .screen-label {
    font-size: 11px; color: var(--text3);
    text-align: center; padding: 8px 0 4px;
    letter-spacing: 0.04em;
  }

  /* ── QUOTE ── */
  .quote-section {
    max-width: 800px; margin: 0 auto;
    padding: 100px 40px; text-align: center;
  }
  .quote-mark { font-size: 64px; color: var(--acc3); line-height: 0.5; margin-bottom: 24px; }
  .quote-text {
    font-size: clamp(22px, 3vw, 36px);
    font-weight: 300; line-height: 1.4;
    letter-spacing: -0.01em; color: var(--text);
    margin-bottom: 24px;
  }
  .quote-source { font-size: 13px; color: var(--text3); letter-spacing: 0.06em; }

  /* ── PALETTE ── */
  .palette-section { padding: 60px 40px; background: var(--bg2); border-top: 1px solid var(--line); }
  .palette-inner { max-width: 800px; margin: 0 auto; }
  .palette-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
  .swatch { width: 64px; text-align: center; }
  .swatch-dot { width: 48px; height: 48px; border-radius: 50%; margin: 0 auto 8px; border: 1px solid var(--line); }
  .swatch-name { font-size: 10px; color: var(--text3); letter-spacing: 0.04em; }
  .swatch-hex { font-size: 10px; color: var(--text2); font-family: monospace; }

  /* ── CTA ── */
  .cta-section {
    max-width: 700px; margin: 0 auto;
    padding: 100px 40px; text-align: center;
  }
  .cta-title { font-size: clamp(32px, 4vw, 52px); font-weight: 300; margin-bottom: 16px; letter-spacing: -0.01em; }
  .cta-sub { font-size: 16px; color: var(--text2); margin-bottom: 40px; }
  .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--line);
    padding: 40px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: var(--text3);
    max-width: 1200px; margin: 0 auto;
  }

  @media (max-width: 768px) {
    .hero { flex-direction: column; padding: 60px 24px; gap: 40px; }
    .hero-phones { width: 100%; }
    .phone-back { display: none; }
    .bento { grid-template-columns: 1fr; }
    .bento-card.large { grid-column: span 1; }
    nav { padding: 0 24px; }
    .nav-links { display: none; }
    .proof-band { gap: 24px; padding: 24px; }
    .features, .quote-section, .cta-section { padding: 60px 24px; }
    footer { flex-direction: column; gap: 16px; padding: 32px 24px; }
  }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">Cedar</span>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#palette">Palette</a></li>
    <li><a href="${SLUG}-viewer" target="_blank">View in Pencil.dev</a></li>
  </ul>
  <button class="nav-cta">Begin your journal</button>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-text">
    <p class="hero-eyebrow">Slow living · Daily journalling</p>
    <h1 class="hero-title">A place for<br/><em>slow reflection</em></h1>
    <p class="hero-sub">Cedar is a mindful journal and life tracker. Log moments, track energy and mood, and discover patterns in how you spend your days. No noise. No metrics theatre. Just your words.</p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Begin your journal →</a>
      <a href="${SLUG}-mock" class="btn-ghost">Try the mock ☀◑</a>
    </div>
    <p class="hero-note">Free forever · No ads · Your words stay private</p>
  </div>
  <div class="hero-phones">
    <div class="phone-main">
      <img class="phone-screen" src="data:image/svg+xml;base64,${Buffer.from(svgs[1]).toString('base64')}" alt="Cedar Today screen" width="236" height="513"/>
    </div>
    <div class="phone-back">
      <img class="phone-screen" src="data:image/svg+xml;base64,${Buffer.from(svgs[0]).toString('base64')}" alt="Cedar Onboarding" width="210" height="455"/>
    </div>
  </div>
</section>

<!-- PROOF BAND -->
<div class="proof-band">
  <div class="proof-item">
    <span class="proof-num">12,400</span>
    <span class="proof-label">Quiet writers</span>
  </div>
  <div class="proof-item">
    <span class="proof-num">2.8M</span>
    <span class="proof-label">Moments logged</span>
  </div>
  <div class="proof-item">
    <span class="proof-num">94%</span>
    <span class="proof-label">Still writing at 90 days</span>
  </div>
  <div class="proof-item">
    <span class="proof-num">7.1</span>
    <span class="proof-label">Avg weekly energy</span>
  </div>
</div>

<!-- FEATURES -->
<section class="features" id="features">
  <p class="section-eyebrow">Designed for depth</p>
  <h2 class="section-title">Not a habit tracker. A place to know yourself.</h2>

  <div class="bento">
    <div class="bento-card accent large">
      <div class="card-icon">◎</div>
      <div class="card-label">Daily overview</div>
      <div class="card-title">The today view</div>
      <div class="card-body">A calm bento grid showing energy, focus, mood, and your log — all in one asymmetric composition. Inspired by the editorial warmth of minimal.gallery.</div>
    </div>
    <div class="bento-card">
      <div class="card-icon">◐</div>
      <div class="card-label">Journalling</div>
      <div class="card-title">Write freely</div>
      <div class="card-body">A distraction-free writing surface with gentle margin marks and mood tagging. Your entries, always private.</div>
    </div>
    <div class="bento-card warm">
      <div class="card-icon">○</div>
      <div class="card-label">Reflection</div>
      <div class="card-title">Weekly patterns</div>
      <div class="card-body">Discover that your best days start early, or that nature entries correlate with high energy weeks.</div>
    </div>
    <div class="bento-card">
      <div class="card-icon">●</div>
      <div class="card-label">Moments</div>
      <div class="card-title">Log in seconds</div>
      <div class="card-body">Quick-capture a moment — what happened, how you felt, what category — without breaking your day's rhythm.</div>
    </div>
    <div class="bento-card">
      <div class="card-icon">◑</div>
      <div class="card-label">Insights</div>
      <div class="card-title">Honest patterns</div>
      <div class="card-body">A single insight each week, written in plain language. Not a dashboard. A letter from your data.</div>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section class="screens-section" id="screens">
  <div class="screens-inner">
    <p class="section-eyebrow">7 screens · Light theme</p>
    <h2 class="section-title">Designed with museum breathing room</h2>
    <div class="screens-grid">
      ${pen.screens.map((s,i) => `
        <div class="screen-card">
          <img src="data:image/svg+xml;base64,${Buffer.from(svgs[i]).toString('base64')}" alt="${s.name}" width="184" height="399" style="width:100%;border-radius:18px;display:block;"/>
          <p class="screen-label">${s.name}</p>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<!-- QUOTE -->
<div class="quote-section">
  <div class="quote-mark">"</div>
  <p class="quote-text">Begin with intention. End with gratitude. Fill the middle with presence.</p>
  <p class="quote-source">Cedar · Morning note · April 12</p>
</div>

<!-- PALETTE -->
<section class="palette-section" id="palette">
  <div class="palette-inner">
    <p class="section-eyebrow">Colour system</p>
    <h3 style="font-size:24px;font-weight:300;margin-bottom:8px;">Warm ivory · Single accent</h3>
    <p style="font-size:13px;color:var(--text2);margin-bottom:24px;">Inspired by minimal.gallery's editorial warmth — ivory, earth tones, one decisive green. No palette noise.</p>
    <div class="palette-grid">
      ${[
        {name:'Background',hex:'#FAF8F3',bg:'#FAF8F3'},
        {name:'Surface',hex:'#FFFFFF',bg:'#FFFFFF'},
        {name:'Bg card',hex:'#EAE6D9',bg:'#EAE6D9'},
        {name:'Forest',hex:'#3D6B4F',bg:'#3D6B4F'},
        {name:'Sage',hex:'#7FA882',bg:'#7FA882'},
        {name:'Pale green',hex:'#D4E8D9',bg:'#D4E8D9'},
        {name:'Warm taupe',hex:'#C8A882',bg:'#C8A882'},
        {name:'Warm text',hex:'#2B2620',bg:'#2B2620'},
        {name:'Mid tone',hex:'#7A6E62',bg:'#7A6E62'},
      ].map(s => `
        <div class="swatch">
          <div class="swatch-dot" style="background:${s.bg};"></div>
          <div class="swatch-name">${s.name}</div>
          <div class="swatch-hex">${s.hex}</div>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2 class="cta-title">Begin your journal today</h2>
  <p class="cta-sub">Free forever. No ads. Your words stay yours.</p>
  <div class="cta-actions">
    <a href="#" class="btn-primary">Start writing →</a>
    <a href="${SLUG}-mock" target="_blank" class="btn-ghost">Try interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <span>Cedar · RAM Design Heartbeat · April 2026</span>
  <span>ram.zenbin.org/${SLUG}</span>
  <span>521 elements · 7 screens · Light theme</span>
</footer>

</body>
</html>`;

// ── Viewer ──
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status===201?'✓':'— '+r1.body.slice(0,80)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status===201?'✓':'— '+r2.body.slice(0,80)}`);
}

main().catch(console.error);
