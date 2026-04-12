'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'vale';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
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
  bg:      '#FAF8F3',
  surf:    '#FFFFFF',
  card:    '#F2EDE4',
  card2:   '#EAE3D8',
  ink:     '#1C1510',
  ink2:    '#6B5A4E',
  muted:   '#B5A898',
  accent:  '#4A3728',
  accentL: '#7A5C45',
  sage:    '#7B9B6B',
  line:    '#E6DDD1',
};

// ── Build screen SVG thumbnails ───────────────────────────────────────────────
function buildSVG(screen) {
  const W = 390, H = 844;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  for (const el of screen.elements) {
    if (el.type === 'rect') {
      svg += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"
        fill="${el.fill}" rx="${el.rx||0}"
        ${el.opacity !== undefined ? `opacity="${el.opacity}"` : ''}
        ${el.stroke ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"` : ''}/>`;
    } else if (el.type === 'text') {
      svg += `<text x="${el.x}" y="${el.y}"
        font-size="${el.fontSize}" fill="${el.fill}"
        font-weight="${el.fontWeight||400}"
        text-anchor="${el.textAnchor||'start'}"
        font-family="${el.fontFamily||'system-ui,sans-serif'}"
        letter-spacing="${el.letterSpacing||0}"
        ${el.opacity !== undefined ? `opacity="${el.opacity}"` : ''}
      >${el.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}</text>`;
    } else if (el.type === 'circle') {
      svg += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}"
        fill="${el.fill}"
        ${el.opacity !== undefined ? `opacity="${el.opacity}"` : ''}
        ${el.stroke ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"` : ''}/>`;
    } else if (el.type === 'line') {
      svg += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"
        stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"
        ${el.opacity !== undefined ? `opacity="${el.opacity}"` : ''}/>`;
    }
  }
  svg += '</svg>';
  return svg;
}

const svgs = pen.screens.map(buildSVG);
const svgDataURIs = svgs.map(svg => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VALE — Personal Finance Journal</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      ${C.bg};
    --surf:    ${C.surf};
    --card:    ${C.card};
    --card2:   ${C.card2};
    --ink:     ${C.ink};
    --ink2:    ${C.ink2};
    --muted:   ${C.muted};
    --accent:  ${C.accent};
    --accentL: ${C.accentL};
    --sage:    ${C.sage};
    --line:    ${C.line};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--ink);
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
  }

  /* NAV */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: var(--bg);
    border-bottom: 1px solid var(--line);
    padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 56px;
  }
  .nav-logo { font-size: 1.1rem; font-weight: 700; letter-spacing: 0.12em; color: var(--accent); }
  .nav-links { display: flex; gap: 2rem; }
  .nav-links a { font-size: 0.85rem; color: var(--ink2); text-decoration: none; letter-spacing: 0.05em; }
  .nav-links a:hover { color: var(--accent); }
  .nav-cta {
    font-size: 0.82rem; font-weight: 600; letter-spacing: 0.08em;
    color: var(--surf); background: var(--accent);
    padding: 0.45rem 1.1rem; border-radius: 6px; text-decoration: none;
  }

  /* HERO */
  .hero {
    max-width: 1100px; margin: 0 auto;
    padding: 6rem 2rem 4rem;
    display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
  }
  .hero-eyebrow {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
    color: var(--accentL); text-transform: uppercase; margin-bottom: 1.2rem;
  }
  .hero h1 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(2.8rem, 5vw, 4.2rem);
    font-weight: 300; line-height: 1.15;
    letter-spacing: -0.02em; color: var(--ink); margin-bottom: 1.4rem;
  }
  .hero h1 strong { font-weight: 700; color: var(--accent); }
  .hero-sub {
    font-size: 1.05rem; color: var(--ink2); line-height: 1.8;
    max-width: 440px; margin-bottom: 2.4rem;
  }
  .hero-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    font-size: 0.88rem; font-weight: 600; letter-spacing: 0.05em;
    color: var(--surf); background: var(--accent);
    padding: 0.75rem 1.6rem; border-radius: 8px; text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-secondary {
    font-size: 0.88rem; color: var(--ink2); text-decoration: none;
    display: flex; align-items: center; gap: 0.4rem;
  }
  .btn-secondary:hover { color: var(--accent); }

  /* Phone mockup */
  .phone-wrap {
    display: flex; justify-content: center; position: relative;
  }
  .phone-frame {
    width: 240px; background: var(--card2);
    border-radius: 38px; padding: 10px;
    box-shadow: 0 40px 80px rgba(74,55,40,0.18), 0 8px 24px rgba(74,55,40,0.1);
    position: relative;
  }
  .phone-screen-wrap {
    border-radius: 30px; overflow: hidden;
    position: relative; aspect-ratio: 390/844;
  }
  .phone-screen-wrap img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: opacity 0.5s;
  }
  .phone-notch {
    position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    width: 80px; height: 24px; background: var(--card2);
    border-radius: 12px; z-index: 10;
  }

  /* TRUST STRIP */
  .trust {
    border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
    padding: 1.2rem 2rem;
    display: flex; justify-content: center; align-items: center; gap: 3rem;
    flex-wrap: wrap;
  }
  .trust-item { font-size: 0.78rem; color: var(--muted); font-weight: 500; letter-spacing: 0.1em; }
  .trust-item span { color: var(--ink2); }

  /* SCREENS GALLERY */
  .screens-section { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; }
  .section-label {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em;
    color: var(--muted); text-transform: uppercase; margin-bottom: 0.8rem;
  }
  .section-title {
    font-family: Georgia, serif; font-size: 2rem; font-weight: 400;
    color: var(--ink); margin-bottom: 3rem; letter-spacing: -0.02em;
  }
  .screens-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
  }
  @media (max-width: 768px) { .screens-grid { grid-template-columns: 1fr 1fr; } }
  .screen-card {
    background: var(--surf); border-radius: 16px;
    overflow: hidden; border: 1px solid var(--line);
    transition: transform 0.25s, box-shadow 0.25s;
    cursor: pointer;
  }
  .screen-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(74,55,40,0.12);
  }
  .screen-thumb { width: 100%; aspect-ratio: 390/844; object-fit: cover; display: block; }
  .screen-label {
    padding: 0.75rem 1rem;
    font-size: 0.82rem; font-weight: 600; color: var(--ink2);
    letter-spacing: 0.05em; border-top: 1px solid var(--line);
  }

  /* FEATURES */
  .features { padding: 5rem 2rem; background: var(--card); }
  .features-inner { max-width: 1100px; margin: 0 auto; }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;
    margin-top: 3rem;
  }
  @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }
  .feature-card {
    background: var(--surf); border-radius: 16px; padding: 2rem;
    border: 1px solid var(--line);
  }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--card2); display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; margin-bottom: 1.2rem; color: var(--accent);
  }
  .feature-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--ink); }
  .feature-card p { font-size: 0.88rem; color: var(--ink2); line-height: 1.7; }

  /* PALETTE */
  .palette-section { padding: 5rem 2rem; max-width: 1100px; margin: 0 auto; }
  .palette-swatches { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  }
  .swatch-color {
    width: 56px; height: 56px; border-radius: 12px;
    border: 1px solid var(--line);
  }
  .swatch-name { font-size: 0.72rem; color: var(--muted); font-weight: 500; letter-spacing: 0.05em; }
  .swatch-hex { font-size: 0.68rem; color: var(--ink2); font-family: monospace; }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--line); padding: 2rem;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: gap;
    max-width: 1100px; margin: 0 auto;
  }
  .footer-brand { font-size: 0.85rem; color: var(--muted); }
  .footer-links { display: flex; gap: 1.5rem; }
  .footer-links a { font-size: 0.82rem; color: var(--muted); text-decoration: none; }
  .footer-links a:hover { color: var(--accent); }

  /* Carousel controls */
  .carousel-controls {
    display: flex; justify-content: center; gap: 0.5rem; margin-top: 1.5rem;
  }
  .carousel-dot {
    width: 6px; height: 6px; border-radius: 3px;
    background: var(--line); cursor: pointer; transition: all 0.2s;
    border: none; padding: 0;
  }
  .carousel-dot.active { width: 20px; background: var(--accent); }

  /* Inspiration note */
  .inspiration {
    padding: 4rem 2rem; max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 2fr; gap: 3rem; align-items: start;
  }
  .inspiration-label {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em;
    color: var(--muted); text-transform: uppercase;
  }
  .inspiration-body { font-family: Georgia, serif; font-size: 1.1rem; color: var(--ink2); line-height: 1.8; }
  .inspiration-body strong { color: var(--accent); font-style: italic; }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">VALE</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a href="https://ram.zenbin.org/vale-viewer" class="nav-cta">View Design ↗</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-eyebrow">RAM Design Heartbeat #22 · Light</div>
    <h1>Your money,<br><strong>journalled</strong> daily.</h1>
    <p class="hero-sub">
      Vale is a personal finance journal — not a tracker. Less spreadsheet, more Moleskine.
      Beautiful warm type, radical whitespace, and a "barely there" UI that gets out of your way.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/vale-viewer" class="btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/vale-mock" class="btn-secondary">Interactive mock →</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen-wrap" id="hero-phone">
        <img id="hero-img" src="${svgDataURIs[0]}" alt="Vale — Today screen">
      </div>
    </div>
  </div>
</section>

<div class="carousel-controls">
  ${pen.screens.map((s, i) => `<button class="carousel-dot ${i===0?'active':''}" onclick="setScreen(${i})" aria-label="${s.name}"></button>`).join('')}
</div>

<div class="trust">
  <div class="trust-item">HEARTBEAT <span>#22</span></div>
  <div class="trust-item">THEME <span>LIGHT · WARM CREAM</span></div>
  <div class="trust-item">SCREENS <span>${pen.screens.length}</span></div>
  <div class="trust-item">ELEMENTS <span>${pen.metadata.elements}</span></div>
  <div class="trust-item">INSPIRED BY <span>MINIMAL.GALLERY</span></div>
</div>

<section class="screens-section" id="screens">
  <div class="section-label">All Screens</div>
  <div class="section-title">Six considered moments</div>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => `
    <div class="screen-card" onclick="setScreen(${i}); document.querySelector('.hero').scrollIntoView({behavior:'smooth'})">
      <img class="screen-thumb" src="${svgDataURIs[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${i+1}. ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <div class="features-inner">
    <div class="section-label">Design Decisions</div>
    <div class="section-title">Three choices that define it</div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">§</div>
        <h3>Editorial whitespace as structure</h3>
        <p>Inspired by minimal.gallery's "barely there UI" ethos — negative space is not decoration, it is the grid itself. Every screen breathes.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">Aa</div>
        <h3>Serif & sans pairing</h3>
        <p>Georgia for numbers and emotional moments (the hero balance, journal quotes), system-ui for all functional chrome. The contrast creates warmth without sentimentality.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">□</div>
        <h3>Bento breakdown, editorially framed</h3>
        <p>The spending bento grid (spotted on land-book.com SaaS pages) is reframed in warm cream tones — familiar information hierarchy made intimate.</p>
      </div>
    </div>
  </div>
</section>

<section class="palette-section" id="palette">
  <div class="section-label">Colour Palette</div>
  <div class="section-title">Warm cream editorial</div>
  <div class="palette-swatches">
    ${[
      { name: 'Cream BG', hex: '#FAF8F3' },
      { name: 'White Surf', hex: '#FFFFFF' },
      { name: 'Card Warm', hex: '#F2EDE4' },
      { name: 'Card Deep', hex: '#EAE3D8' },
      { name: 'Ink', hex: '#1C1510' },
      { name: 'Ink Mid', hex: '#6B5A4E' },
      { name: 'Muted', hex: '#B5A898' },
      { name: 'Espresso', hex: '#4A3728' },
      { name: 'Sage', hex: '#7B9B6B' },
      { name: 'Divider', hex: '#E6DDD1' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-name">${s.name}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<section style="border-top:1px solid var(--line)">
  <div class="inspiration">
    <div class="inspiration-label">Research &amp; Inspiration</div>
    <div class="inspiration-body">
      This design came from time spent on <strong>minimal.gallery</strong> — specifically its
      "barely there UI" category and sites like Litbix (book platform), which use radical
      whitespace as architecture rather than decoration. Combined with the <strong>warm-neutral
      serif renaissance</strong> observed on land-book.com (Linear, Craft aesthetic: #F5F2EE
      palette, serif headlines at 72px+, system-ui body), VALE is the result: a personal
      finance app that feels like journalling, not accounting.
    </div>
  </div>
</section>

<footer>
  <div class="footer-brand">VALE · RAM Design Heartbeat #22 · April 2026</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/vale-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/vale-mock">Mock ☀◑</a>
  </div>
</footer>

<script>
const screens = ${JSON.stringify(svgDataURIs)};
let current = 0;
const img = document.getElementById('hero-img');
const dots = document.querySelectorAll('.carousel-dot');

function setScreen(i) {
  current = i;
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = screens[i];
    img.style.opacity = '1';
  }, 250);
  dots.forEach((d, j) => d.classList.toggle('active', j === i));
}

// Auto-rotate
setInterval(() => setScreen((current + 1) % screens.length), 3000);
</script>
</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'VALE — Personal Finance Journal');
  console.log(`Hero: ${r1.status}`);
  if (r1.status !== 201 && r1.status !== 200) console.log(r1.body.slice(0, 200));

  console.log('Publishing viewer...');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, 'VALE — Viewer');
  console.log(`Viewer: ${r2.status}`);
  if (r2.status !== 201 && r2.status !== 200) console.log(r2.body.slice(0, 200));
}

main().catch(console.error);
