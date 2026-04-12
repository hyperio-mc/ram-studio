'use strict';
// TRACT publish script — hero + viewer
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'tract';
const APP_NAME = 'TRACT';
const TAGLINE = 'Finance, in print';

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

// Encode screens as SVG data URIs for hero carousel
const screenPreviews = pen.screens.map((s, i) => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `<div class="screen-slide ${i === 0 ? 'active' : ''}" data-idx="${i}">
    <img src="data:image/svg+xml;base64,${encoded}" alt="${s.name}" />
    <div class="screen-label">${s.name}</div>
  </div>`;
}).join('\n');

// Palette swatches
const palette = pen.metadata.palette;
const swatches = Object.entries(palette).filter(([k]) => k !== 'inspiration').map(([k, v]) => `
  <div class="swatch">
    <div class="swatch-color" style="background:${v}"></div>
    <div class="swatch-name">${k}</div>
    <div class="swatch-hex">${v}</div>
  </div>`).join('');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #FAF7F2;
    --surf: #FFFFFF;
    --card: #F4F0E8;
    --ink: #1A1714;
    --ink2: #4A4540;
    --muted: #9A9390;
    --rule: #DDD9D0;
    --acc: #C45E3A;
    --acc2: #4A7C6B;
    --gold: #B8943F;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--ink);
    min-height: 100vh;
  }

  /* ── Masthead ─────────────────────────────── */
  .masthead {
    border-bottom: 2px solid var(--ink);
    padding: 0 40px;
  }
  .masthead-top {
    border-bottom: 1px solid var(--rule);
    padding: 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
  }
  .masthead-center {
    padding: 24px 0 20px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .masthead-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 80px;
    font-weight: 300;
    letter-spacing: -3px;
    line-height: 1;
    color: var(--ink);
  }
  .masthead-sub {
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--muted);
    text-transform: uppercase;
    text-align: right;
    line-height: 1.8;
  }
  .masthead-sub span {
    display: block;
  }
  .masthead-bottom {
    border-top: 1px solid var(--rule);
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--muted);
  }
  .masthead-tagline {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: 15px;
    color: var(--acc);
    letter-spacing: 0;
  }

  /* ── Hero ─────────────────────────────────── */
  .hero {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 60px;
    padding: 60px 40px;
    border-bottom: 1px solid var(--rule);
    max-width: 1200px;
    margin: 0 auto;
  }

  .hero-copy {}
  .hero-kicker {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--acc);
    margin-bottom: 16px;
    font-weight: 600;
  }
  .hero-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: 58px;
    font-weight: 300;
    line-height: 1.08;
    letter-spacing: -1.5px;
    color: var(--ink);
    margin-bottom: 24px;
  }
  .hero-headline em {
    font-style: italic;
    color: var(--acc);
  }
  .hero-rule {
    width: 48px;
    height: 2px;
    background: var(--acc);
    margin-bottom: 24px;
  }
  .hero-body {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    line-height: 1.7;
    color: var(--ink2);
    margin-bottom: 32px;
    max-width: 520px;
  }
  .hero-links {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-block;
    padding: 12px 28px;
    background: var(--ink);
    color: var(--bg);
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    text-decoration: none;
    font-weight: 600;
    border-radius: 2px;
    transition: background 0.2s;
  }
  .btn-primary:hover { background: var(--acc); }
  .btn-ghost {
    display: inline-block;
    padding: 12px 28px;
    border: 1px solid var(--rule);
    color: var(--ink);
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    text-decoration: none;
    font-weight: 500;
    border-radius: 2px;
  }

  /* ── Screen Carousel ─────────────────────── */
  .hero-carousel {
    position: relative;
  }
  .carousel-phone {
    position: relative;
    width: 340px;
  }
  .screen-slide {
    display: none;
    border: 1px solid var(--rule);
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(26,23,20,0.12), 0 4px 12px rgba(26,23,20,0.06);
  }
  .screen-slide.active { display: block; }
  .screen-slide img {
    width: 100%;
    display: block;
  }
  .screen-label {
    position: absolute;
    bottom: -28px;
    left: 0; right: 0;
    text-align: center;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
  }
  .carousel-dots {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-top: 44px;
  }
  .dot {
    width: 20px; height: 2px;
    background: var(--rule);
    cursor: pointer;
    transition: background 0.2s, width 0.2s;
  }
  .dot.active { background: var(--acc); width: 32px; }

  /* ── Features Grid ───────────────────────── */
  .section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 60px 40px;
    border-bottom: 1px solid var(--rule);
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--ink);
  }
  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    font-weight: 300;
    letter-spacing: -0.5px;
  }
  .section-number {
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
  }
  .feature {
    padding: 32px 32px 32px 0;
    border-right: 1px solid var(--rule);
  }
  .feature:last-child { border-right: none; padding-right: 0; }
  .feature:not(:first-child) { padding-left: 32px; padding-right: 32px; }
  .feature-number {
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px;
    font-weight: 300;
    color: var(--acc);
    letter-spacing: -2px;
    line-height: 1;
    margin-bottom: 16px;
  }
  .feature-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  .feature-body {
    font-size: 13px;
    line-height: 1.7;
    color: var(--ink2);
  }

  /* ── Philosophy Quote ────────────────────── */
  .philosophy {
    background: var(--ink);
    color: var(--bg);
    padding: 80px 40px;
    text-align: center;
  }
  .philosophy-quote {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px;
    font-weight: 300;
    font-style: italic;
    line-height: 1.3;
    letter-spacing: -0.5px;
    max-width: 700px;
    margin: 0 auto 20px;
  }
  .philosophy-attr {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--acc);
  }

  /* ── Palette ─────────────────────────────── */
  .swatches {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 24px;
  }
  .swatch { text-align: center; }
  .swatch-color {
    width: 48px; height: 48px;
    border-radius: 2px;
    border: 1px solid var(--rule);
    margin-bottom: 6px;
  }
  .swatch-name { font-size: 9px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
  .swatch-hex { font-size: 9px; color: var(--ink2); font-family: monospace; }

  /* ── Design Detail ───────────────────────── */
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 32px;
  }
  .detail-item {}
  .detail-label {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--rule);
  }
  .detail-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    color: var(--ink);
  }

  /* ── Footer ──────────────────────────────── */
  .footer {
    border-top: 2px solid var(--ink);
    padding: 24px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted);
    max-width: 100%;
  }
  .footer a { color: var(--acc); text-decoration: none; }
</style>
</head>
<body>

<!-- Masthead -->
<header class="masthead">
  <div class="masthead-top" style="max-width:1200px;margin:0 auto;">
    <span>RAM Design Heartbeat · April 2026</span>
    <span>Issue No. ${pen.metadata.heartbeat?.toUpperCase() || 'TRACT'}</span>
    <span>Personal Finance · Editorial</span>
  </div>
  <div class="masthead-center" style="max-width:1200px;margin:0 auto;">
    <div class="masthead-title">TRACT</div>
    <div class="masthead-sub">
      <span>Finance</span>
      <span>in print</span>
      <span style="color:var(--acc);font-style:italic;font-family:'Cormorant Garamond',serif;font-size:13px;">${TAGLINE}</span>
    </div>
  </div>
  <div class="masthead-bottom" style="max-width:1200px;margin:0 auto;">
    <span>Personal finance tracker · Light theme · 6 screens</span>
    <span class="masthead-tagline">Where your money becomes a narrative</span>
    <span>${pen.metadata.elements} elements · RAM</span>
  </div>
</header>

<!-- Hero -->
<div class="hero">
  <div class="hero-copy">
    <div class="hero-kicker">New from RAM Design Studio</div>
    <h1 class="hero-headline">
      Your finances,<br>
      <em>typeset</em> with<br>
      intention.
    </h1>
    <div class="hero-rule"></div>
    <p class="hero-body">
      TRACT treats your money like an editorial publication — numbers become
      narrative, categories become columns, and your monthly review reads like
      the front page of a beautifully curated financial gazette.
    </p>
    <div class="hero-links">
      <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">Open Viewer</a>
      <a class="btn-ghost" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
    </div>
  </div>

  <div class="hero-carousel">
    <div class="carousel-phone">
      ${screenPreviews}
    </div>
    <div class="carousel-dots">
      ${pen.screens.map((s, i) => `<div class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}" title="${s.name}"></div>`).join('')}
    </div>
  </div>
</div>

<!-- Features -->
<div class="section">
  <div class="section-header">
    <h2 class="section-title">Design Decisions</h2>
    <span class="section-number">Three choices · explained</span>
  </div>
  <div class="features">
    <div class="feature">
      <div class="feature-number">01</div>
      <div class="feature-title">Typography as data visualisation</div>
      <p class="feature-body">
        Inspired by minimal.gallery's "type-driven layouts with no imagery" — the
        balance figure at $24,847 is rendered at 88px in a light-weight serif.
        The number itself is the chart.
      </p>
    </div>
    <div class="feature">
      <div class="feature-number">02</div>
      <div class="feature-title">Masthead navigation pattern</div>
      <p class="feature-body">
        Each screen opens with a double-rule masthead (thick-thin, publication style),
        replacing the conventional coloured header bar. Borrowed from editorial
        magazine layout — every screen feels like a spread.
      </p>
    </div>
    <div class="feature">
      <div class="feature-number">03</div>
      <div class="feature-title">Hairline rules as hierarchy</div>
      <p class="feature-body">
        All visual separation uses 0.5px hairline rules rather than background
        colour changes or drop shadows. Borrowed from print design — maximum
        structure from minimal ink.
      </p>
    </div>
  </div>
</div>

<!-- Philosophy -->
<div class="philosophy">
  <p class="philosophy-quote">
    "Money is a story. Most apps show you the numbers.
    TRACT lets you read them."
  </p>
  <p class="philosophy-attr">RAM Design Studio · April 2026</p>
</div>

<!-- Palette -->
<div class="section">
  <div class="section-header">
    <h2 class="section-title">Colour System</h2>
    <span class="section-number">Warm parchment · editorial ink</span>
  </div>
  <div class="swatches">
    ${swatches}
  </div>
  <div style="margin-top:24px;font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--ink2);line-height:1.7;">
    Palette inspired by Lapa Ninja's warm editorial collections — off-white parchment (#FAF7F2)
    as the base, deep warm ink (#1A1714) for type, terracotta (#C45E3A) as the single accent.
    No blue. No gradients. Pure editorial restraint.
  </div>
</div>

<!-- Design stats -->
<div class="section">
  <div class="section-header">
    <h2 class="section-title">Specification</h2>
    <span class="section-number">Technical notes</span>
  </div>
  <div class="detail-grid">
    <div class="detail-item">
      <div class="detail-label">Format</div>
      <div class="detail-value">Pencil.dev v${pen.version} · Mobile first (390×844)</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Theme</div>
      <div class="detail-value">Light — warm parchment editorial</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Screens</div>
      <div class="detail-value">${pen.screens.length} screens — Overview, Spending, Transactions, Savings, Monthly Review, Add Entry</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Elements</div>
      <div class="detail-value">${pen.metadata.elements} total SVG primitives</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Typography</div>
      <div class="detail-value">Georgia (display) + System UI (interface)</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Inspiration</div>
      <div class="detail-value">minimal.gallery editorial layouts · Lapa Ninja warm palettes</div>
    </div>
  </div>
</div>

<!-- Footer -->
<footer class="footer">
  <span>TRACT · RAM Design Heartbeat</span>
  <span><a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> · <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a></span>
  <span>April 2026 · Issue ${SLUG.toUpperCase()}</span>
</footer>

<script>
const slides = document.querySelectorAll('.screen-slide');
const dots = document.querySelectorAll('.dot');
let current = 0;
let timer;

function goTo(n) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = (n + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
}

dots.forEach((d, i) => d.addEventListener('click', () => { clearInterval(timer); goTo(i); startTimer(); }));

function startTimer() {
  timer = setInterval(() => goTo(current + 1), 3200);
}
startTimer();
</script>
</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`);
  if (r1.status !== 201 && r1.status !== 200) console.log(r1.body.slice(0, 200));

  console.log('Publishing viewer...');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`);
  if (r2.status !== 201 && r2.status !== 200) console.log(r2.body.slice(0, 200));

  console.log(`\nHero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
