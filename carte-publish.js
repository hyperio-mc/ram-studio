'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'carte';
const APP_NAME = 'CARTE';
const TAGLINE  = 'Think in layers';

// ─── Publish helper ─────────────────────────────────────────────────────────
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

// ─── Load pen ───────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// Screen SVG data URIs for carousel
const svgUris = pen.screens.map(s =>
  'data:image/svg+xml;base64,' + Buffer.from(s.svg).toString('base64')
);

// ─── HERO HTML ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #FBF8F3;
    --surface: #FFFFFF;
    --card:    #F5F0E8;
    --border:  #E4DDD0;
    --text:    #1C1714;
    --mid:     rgba(28,23,20,0.55);
    --low:     rgba(28,23,20,0.35);
    --accent:  #B85C38;
    --accent2: #4E7C3A;
    --gold:    #C49A3C;
    --ink:     #1C1714;
    --serif:   Georgia, 'Times New Roman', serif;
    --sans:    system-ui, -apple-system, sans-serif;
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    min-height: 100vh;
  }

  /* NAV */
  nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 60px;
    background: rgba(251,248,243,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-family: var(--serif); font-weight: 700; font-size: 20px; letter-spacing: -0.01em; color: var(--text); }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { font-size: 13px; color: var(--mid); text-decoration: none; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--accent); }
  .nav-cta { background: var(--ink); color: #fff; font-size: 13px; font-weight: 600; padding: 9px 20px; border-radius: 8px; text-decoration: none; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    max-width: 1200px; margin: 0 auto; padding: 100px 32px 80px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    color: var(--accent); text-transform: uppercase; margin-bottom: 24px;
  }
  .hero-eyebrow::before { content: '✦'; }
  h1 {
    font-family: var(--serif);
    font-size: clamp(42px, 5vw, 68px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-bottom: 24px;
  }
  h1 em { font-style: italic; color: var(--accent); }
  .hero-sub {
    font-size: 18px; line-height: 1.6; color: var(--mid);
    max-width: 440px; margin-bottom: 40px;
  }
  .hero-actions { display: flex; gap: 12px; align-items: center; }
  .btn-primary {
    background: var(--ink); color: #fff; font-size: 15px; font-weight: 600;
    padding: 14px 28px; border-radius: 10px; text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-ghost {
    color: var(--text); font-size: 14px; font-weight: 500; text-decoration: none;
    display: flex; align-items: center; gap: 6px; opacity: 0.7; transition: opacity 0.2s;
  }
  .btn-ghost:hover { opacity: 1; }

  /* DEVICE CAROUSEL */
  .device-wrap { display: flex; justify-content: center; }
  .device {
    width: 260px; height: 560px;
    background: var(--surface);
    border-radius: 40px;
    border: 1px solid var(--border);
    box-shadow: 0 24px 80px rgba(28,23,20,0.10), 0 4px 16px rgba(28,23,20,0.06);
    overflow: hidden;
    position: relative;
  }
  .device-screen {
    width: 100%; height: 100%;
    transition: opacity 0.5s;
  }
  .device-screen img { width: 100%; height: 100%; object-fit: cover; }
  .device-dots {
    position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 6px;
  }
  .device-dots span {
    width: 6px; height: 6px; border-radius: 3px; background: var(--border);
    transition: width 0.3s, background 0.3s; cursor: pointer;
  }
  .device-dots span.active { width: 20px; background: var(--accent); }

  /* DIVIDER */
  .ornament {
    max-width: 1200px; margin: 0 auto; padding: 0 32px 60px;
    display: flex; align-items: center; gap: 16px;
  }
  .ornament-line { flex: 1; height: 1px; background: var(--border); }
  .ornament-mark { font-size: 16px; color: var(--gold); }

  /* FEATURES BENTO */
  .bento-section { max-width: 1200px; margin: 0 auto; padding: 0 32px 100px; }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 12px;
  }
  .section-title {
    font-family: var(--serif); font-size: 40px; font-weight: 700;
    line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 52px;
    max-width: 560px; color: var(--text);
  }
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: 16px;
  }
  .bento-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    padding: 28px; transition: transform 0.2s, box-shadow 0.2s;
  }
  .bento-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(28,23,20,0.08); }
  .bento-card.wide  { grid-column: span 2; }
  .bento-card.tall  { grid-row: span 2; }
  .bento-card.accent { background: var(--ink); border-color: var(--ink); }
  .bento-card.accent .card-title,
  .bento-card.accent .card-body { color: rgba(255,255,255,0.9); }
  .bento-card.accent .card-icon { color: var(--accent); }
  .card-icon { font-size: 22px; margin-bottom: 16px; display: block; }
  .card-title { font-family: var(--serif); font-size: 20px; font-weight: 600; margin-bottom: 10px; letter-spacing: -0.01em; }
  .card-body { font-size: 14px; line-height: 1.6; color: var(--mid); }

  /* PALETTE SECTION */
  .palette-section { max-width: 1200px; margin: 0 auto; padding: 0 32px 80px; }
  .swatches { display: flex; gap: 16px; flex-wrap: wrap; }
  .swatch { width: 100px; }
  .swatch-color { height: 56px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 8px; }
  .swatch-name { font-size: 11px; font-weight: 600; color: var(--text); }
  .swatch-hex  { font-size: 10px; color: var(--low); font-family: monospace; }

  /* SCREENS GALLERY */
  .gallery-section { max-width: 1200px; margin: 0 auto; padding: 0 32px 80px; }
  .gallery-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  }
  .gallery-item { border-radius: 16px; overflow: hidden; border: 1px solid var(--border);
    box-shadow: 0 4px 20px rgba(28,23,20,0.07); }
  .gallery-item img { width: 100%; display: block; }
  .gallery-caption { padding: 12px 16px; background: var(--surface); font-size: 12px; color: var(--mid); font-weight: 500; }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border); padding: 40px 32px;
    display: flex; justify-content: space-between; align-items: center;
    max-width: 1200px; margin: 0 auto; color: var(--low); font-size: 12px;
  }
  footer a { color: var(--accent); text-decoration: none; font-weight: 500; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 60px 20px; }
    .bento-grid { grid-template-columns: 1fr; }
    .bento-card.wide { grid-column: span 1; }
    .gallery-grid { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">CAR<span>T</span>E</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/carte-viewer">Viewer</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/carte-mock">Try Mock →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div>
    <div class="hero-eyebrow">RAM Heartbeat #330 · Light Theme</div>
    <h1>Think in<br><em>layers.</em></h1>
    <p class="hero-sub">
      CARTE is an AI editorial research notebook — capture fragments,
      build threads, and let AI synthesize patterns you hadn't noticed.
      Inspired by the serif revival and warm-cream editorial aesthetic
      emerging across minimal.gallery curation.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/carte-mock">Explore the mock</a>
      <a class="btn-ghost" href="https://ram.zenbin.org/carte-viewer">View in Pencil ↗</a>
    </div>
  </div>
  <div class="device-wrap">
    <div class="device">
      <div class="device-screen" id="carousel-screen">
        ${svgUris.map((uri, i) => `<img src="${uri}" alt="Screen ${i+1}" id="slide-${i}" style="display:${i===0?'block':'none'};width:100%;height:100%;object-fit:cover;">`).join('')}
      </div>
      <div class="device-dots">
        ${svgUris.map((_, i) => `<span class="${i===0?'active':''}" onclick="goSlide(${i})"></span>`).join('')}
      </div>
    </div>
  </div>
</section>

<div class="ornament">
  <div class="ornament-line"></div>
  <div class="ornament-mark">✦</div>
  <div class="ornament-line"></div>
</div>

<!-- BENTO FEATURES -->
<section class="bento-section" id="features">
  <div class="section-label">✦ Core Features</div>
  <h2 class="section-title">Research the way you actually think</h2>
  <div class="bento-grid">
    <div class="bento-card wide">
      <span class="card-icon">📖</span>
      <div class="card-title">Editorial journaling with AI presence</div>
      <div class="card-body">Write in a distraction-free environment that feels like a premium notebook. CARTE nudges you with prompts, remembers your themes, and learns your intellectual interests — without ever interrupting your flow.</div>
    </div>
    <div class="bento-card">
      <span class="card-icon">🧵</span>
      <div class="card-title">Research Threads</div>
      <div class="card-body">Link notes, sources, and syntheses into a living timeline of an idea. Watch arguments develop across days and weeks.</div>
    </div>
    <div class="bento-card accent">
      <span class="card-icon">✦</span>
      <div class="card-title">CARTE Synthesis</div>
      <div class="card-body">Surface patterns across your notes that you hadn't seen. Cite-aware, context-grounded, never hallucinated.</div>
    </div>
    <div class="bento-card">
      <span class="card-icon">📚</span>
      <div class="card-title">Source Library</div>
      <div class="card-body">Books, papers, links, and PDFs — annotated and cross-referenced. Every citation traceable back to your notes.</div>
    </div>
    <div class="bento-card">
      <span class="card-icon">📤</span>
      <div class="card-title">One-tap Export</div>
      <div class="card-body">Your research journal as a print-ready PDF, Markdown, or Notion import. With proper citations and structure.</div>
    </div>
    <div class="bento-card">
      <span class="card-icon">🔗</span>
      <div class="card-title">Idea Linking</div>
      <div class="card-body">Bi-directional links between entries. Discover which ideas keep appearing together in your thinking.</div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section" id="palette">
  <div class="section-label">✦ Design Palette</div>
  <h2 class="section-title">Warm cream editorial</h2>
  <div class="swatches">
    ${[
      { name: 'BG Cream', hex: '#FBF8F3' },
      { name: 'Surface', hex: '#FFFFFF' },
      { name: 'Card', hex: '#F5F0E8' },
      { name: 'Terracotta', hex: '#B85C38' },
      { name: 'Sage', hex: '#4E7C3A' },
      { name: 'Gold', hex: '#C49A3C' },
      { name: 'Ink', hex: '#1C1714' },
      { name: 'Border', hex: '#E4DDD0' },
    ].map(s => `<div class="swatch">
      <div class="swatch-color" style="background:${s.hex};"></div>
      <div class="swatch-name">${s.name}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<!-- SCREENS GALLERY -->
<section class="gallery-section" id="screens">
  <div class="section-label">✦ All Screens</div>
  <h2 class="section-title">6 screens · 598 elements</h2>
  <div class="gallery-grid">
    ${pen.screens.map((s, i) => `<div class="gallery-item">
      <img src="${svgUris[i]}" alt="${s.name}">
      <div class="gallery-caption">${i+1}. ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div>
    <strong>CARTE</strong> — RAM Design Heartbeat #330 · April 8, 2026<br>
    Inspired by serif revival trends on <a href="https://minimal.gallery">minimal.gallery</a>
    and AI-native product designs on <a href="https://land-book.com">land-book.com</a>
  </div>
  <div style="text-align:right;">
    <a href="https://ram.zenbin.org/carte-viewer">Pencil Viewer →</a><br>
    <a href="https://ram.zenbin.org/carte-mock">Interactive Mock →</a>
  </div>
</footer>

<script>
  let current = 0;
  const slides = ${JSON.stringify(Array.from({length: pen.screens.length}, (_, i) => i))};
  const dots   = document.querySelectorAll('.device-dots span');

  function goSlide(n) {
    document.getElementById('slide-' + current).style.display = 'none';
    dots[current].classList.remove('active');
    current = n;
    document.getElementById('slide-' + current).style.display = 'block';
    dots[current].classList.add('active');
  }

  setInterval(() => goSlide((current + 1) % slides.length), 2800);
</script>
</body>
</html>`;

// ─── VIEWER HTML ─────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(
  path.join(__dirname, 'viewer.html'), 'utf8'
);
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
