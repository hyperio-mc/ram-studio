'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'mast';

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
const pen     = JSON.parse(penJson);

// ─── Palette from pen ─────────────────────────────────────────────────────────
const P = pen.metadata.palette;

// ─── Render screen as mini SVG data URI for carousel ─────────────────────────
function screenToDataUri(screen) {
  const W = 390, H = 844;
  const elems = (screen.elements || []).map(el => {
    if (el.type === 'rect') {
      const attrs = [
        `x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"`,
        `fill="${el.fill || 'none'}"`,
        el.rx       !== undefined ? `rx="${el.rx}"`                     : '',
        el.opacity  !== undefined ? `opacity="${el.opacity}"`           : '',
        el.stroke   !== undefined ? `stroke="${el.stroke}"`             : '',
        el.strokeWidth !== undefined ? `stroke-width="${el.strokeWidth}"` : '',
      ].filter(Boolean).join(' ');
      return `<rect ${attrs}/>`;
    }
    if (el.type === 'text') {
      const attrs = [
        `x="${el.x}" y="${el.y}"`,
        `font-size="${el.fontSize}"`,
        `fill="${el.fill}"`,
        el.fontWeight  !== undefined ? `font-weight="${el.fontWeight}"`     : '',
        el.fontFamily  !== undefined ? `font-family="${el.fontFamily}"`     : '',
        el.textAnchor  !== undefined ? `text-anchor="${el.textAnchor}"`     : '',
        el.letterSpacing !== undefined ? `letter-spacing="${el.letterSpacing}"` : '',
        el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
      ].filter(Boolean).join(' ');
      const safe = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text ${attrs}>${safe}</text>`;
    }
    if (el.type === 'circle') {
      const attrs = [
        `cx="${el.cx}" cy="${el.cy}" r="${el.r}"`,
        `fill="${el.fill}"`,
        el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
        el.stroke  !== undefined ? `stroke="${el.stroke}"`  : '',
        el.strokeWidth !== undefined ? `stroke-width="${el.strokeWidth}"` : '',
      ].filter(Boolean).join(' ');
      return `<circle ${attrs}/>`;
    }
    if (el.type === 'line') {
      const attrs = [
        `x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"`,
        `stroke="${el.stroke}"`,
        el.strokeWidth !== undefined ? `stroke-width="${el.strokeWidth}"` : '',
        el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
      ].filter(Boolean).join(' ');
      return `<line ${attrs}/>`;
    }
    return '';
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${elems}</svg>`;
  const b64  = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

const screenUris = pen.screens.map(s => ({
  name:    s.name,
  dataUri: screenToDataUri(s),
}));

// ─── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MAST — Studio OS for creative freelancers</title>
<meta name="description" content="A studio OS for creative freelancers — projects, clients, invoicing in one calm, editorial interface.">
<style>
  :root {
    --bg:      #F8F5F0;
    --surface: #FFFFFF;
    --card:    #EDE9E2;
    --text:    #16120C;
    --mid:     #6B6258;
    --muted:   #A09487;
    --accent:  #1C4ED8;
    --acc2:    #B45309;
    --border:  #D6CFBF;
    --borderl: #E8E3D9;
    --green:   #16A34A;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(248,245,240,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
  }
  .nav-logo { font-size: 13px; font-weight: 700; letter-spacing: 3px; color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { text-decoration: none; color: var(--mid); font-size: 13px; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--text); color: var(--bg);
    border: none; border-radius: 20px; padding: 8px 22px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.8; }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 100px 40px 60px;
    text-align: center;
  }
  .hero-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 3px;
    color: var(--muted); text-transform: uppercase;
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 12px;
  }
  .hero-eyebrow::before, .hero-eyebrow::after {
    content: ''; display: block; width: 40px; height: 1px; background: var(--border);
  }
  h1 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(52px, 8vw, 96px);
    font-weight: 300;
    line-height: 0.95;
    letter-spacing: -1px;
    color: var(--text);
    margin-bottom: 12px;
  }
  h1 em { font-style: italic; color: var(--accent); }
  .hero-sub {
    font-size: clamp(16px, 2vw, 20px);
    color: var(--mid);
    max-width: 500px;
    margin: 24px auto 40px;
    font-weight: 300;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center; }
  .btn-primary {
    background: var(--accent); color: #FFF;
    border: none; border-radius: 24px; padding: 14px 32px;
    font-size: 15px; font-weight: 600; cursor: pointer;
    text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(28,78,216,0.3); }
  .btn-secondary {
    background: none; color: var(--text);
    border: 1.5px solid var(--border); border-radius: 24px; padding: 14px 32px;
    font-size: 15px; font-weight: 500; cursor: pointer;
    text-decoration: none; transition: border-color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--text); }

  /* CAROUSEL */
  .carousel-section {
    padding: 0 0 80px;
    overflow: hidden;
  }
  .carousel-track {
    display: flex; gap: 24px;
    padding: 0 40px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .carousel-track::-webkit-scrollbar { display: none; }
  .carousel-card {
    flex: 0 0 240px;
    scroll-snap-align: start;
    display: flex; flex-direction: column; gap: 12px;
  }
  .carousel-phone {
    width: 240px; height: 520px;
    border-radius: 32px;
    overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 8px 32px rgba(22,18,12,0.08), 0 2px 8px rgba(22,18,12,0.04);
    background: var(--surface);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .carousel-phone:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px rgba(22,18,12,0.12), 0 4px 12px rgba(22,18,12,0.06);
  }
  .carousel-phone img { width: 100%; height: 100%; object-fit: cover; }
  .carousel-label { font-size: 12px; color: var(--muted); text-align: center; letter-spacing: 0.5px; }

  /* TREND CALLOUT */
  .trend-section {
    padding: 80px 40px;
    background: var(--text);
    color: var(--bg);
  }
  .trend-inner { max-width: 900px; margin: 0 auto; }
  .trend-eyebrow {
    font-size: 10px; font-weight: 600; letter-spacing: 3px;
    color: rgba(248,245,240,0.4); text-transform: uppercase;
    margin-bottom: 32px;
  }
  .trend-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 48px; align-items: start;
  }
  .trend-quote {
    font-family: Georgia, serif;
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 300;
    line-height: 1.4;
    color: var(--bg);
  }
  .trend-cite { margin-top: 16px; font-size: 12px; color: rgba(248,245,240,0.5); }
  .trend-sources { display: flex; flex-direction: column; gap: 16px; }
  .trend-source {
    border-top: 1px solid rgba(248,245,240,0.1);
    padding-top: 16px;
    display: flex; gap: 12px; align-items: flex-start;
  }
  .trend-source-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #1C4ED8; flex-shrink: 0; margin-top: 6px;
  }
  .trend-source-text { font-size: 13px; color: rgba(248,245,240,0.7); line-height: 1.5; }
  .trend-source-label { font-weight: 600; color: var(--bg); }

  /* FEATURE GRID */
  .features-section { padding: 80px 40px; max-width: 900px; margin: 0 auto; }
  .section-eyebrow {
    font-size: 10px; font-weight: 600; letter-spacing: 3px;
    color: var(--muted); text-transform: uppercase;
    margin-bottom: 48px;
    display: flex; align-items: center; gap: 16px;
  }
  .section-eyebrow::after { content: ''; flex: 1; height: 1px; background: var(--borderl); }
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    background: var(--borderl);
    border: 1px solid var(--borderl);
    border-radius: 16px; overflow: hidden;
  }
  .feature-cell {
    background: var(--surface);
    padding: 32px 28px;
  }
  .feature-cell.wide { grid-column: span 2; }
  .feature-icon { font-size: 24px; margin-bottom: 16px; }
  .feature-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--mid); line-height: 1.6; }

  /* PALETTE */
  .palette-section { padding: 40px 40px 80px; max-width: 900px; margin: 0 auto; }
  .palette-swatches { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
  .swatch { width: 80px; }
  .swatch-color { width: 80px; height: 56px; border-radius: 10px; margin-bottom: 8px; border: 1px solid var(--borderl); }
  .swatch-hex { font-size: 11px; color: var(--muted); font-family: monospace; }
  .swatch-name { font-size: 10px; color: var(--muted); }

  /* LINKS */
  .links-section {
    background: var(--card);
    border-top: 1px solid var(--border);
    padding: 48px 40px;
    display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
  }
  .link-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--surface); color: var(--text);
    border: 1.5px solid var(--border); border-radius: 12px;
    padding: 12px 24px; text-decoration: none; font-size: 14px; font-weight: 500;
    transition: border-color 0.2s, transform 0.2s;
  }
  .link-btn:hover { border-color: var(--text); transform: translateY(-1px); }
  .link-btn.accent { background: var(--accent); color: #FFF; border-color: transparent; }
  .link-btn.accent:hover { opacity: 0.9; }

  /* FOOTER */
  footer {
    padding: 32px 40px;
    border-top: 1px solid var(--borderl);
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: var(--muted);
  }

  @media (max-width: 640px) {
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    .hero { padding: 80px 24px 40px; }
    .trend-grid { grid-template-columns: 1fr; }
    .feature-grid { grid-template-columns: 1fr 1fr; }
    .feature-cell.wide { grid-column: span 2; }
    .features-section, .palette-section { padding: 40px 24px; }
    footer { flex-direction: column; gap: 12px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">MAST</span>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a href="https://ram.zenbin.org/mast-viewer" class="nav-cta">View Design</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">RAM Design Heartbeat</div>
  <h1>Studio OS for<br><em>creatives</em></h1>
  <p class="hero-sub">
    Projects, clients, and invoicing — unified in a calm, editorial interface
    inspired by the restrained architecture studio aesthetic.
  </p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/mast-viewer" class="btn-primary">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/mast-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<!-- CAROUSEL -->
<section class="carousel-section" id="screens">
  <div class="carousel-track">
    ${screenUris.map(s => `
    <div class="carousel-card">
      <div class="carousel-phone">
        <img src="${s.dataUri}" alt="${s.name}" loading="lazy">
      </div>
      <span class="carousel-label">${s.name}</span>
    </div>`).join('')}
  </div>
</section>

<!-- TREND CALLOUT -->
<section class="trend-section">
  <div class="trend-inner">
    <p class="trend-eyebrow">Research + Inspiration</p>
    <div class="trend-grid">
      <div>
        <p class="trend-quote">
          "Display serif pairing is the primary differentiation move —
          Fraunces or PP Editorial New against Inter body text signals
          editorial sophistication and not just another SaaS."
        </p>
        <p class="trend-cite">— Synthesised from Lapa Ninja & Siteinspire, April 2026</p>
      </div>
      <div class="trend-sources">
        <div class="trend-source">
          <div class="trend-source-dot"></div>
          <div class="trend-source-text">
            <span class="trend-source-label">Siteinspire.com</span> — Architecture studio sites use warm off-white
            backgrounds, restrained single-accent palettes, and photography-dominant layouts with serif headlines.
          </div>
        </div>
        <div class="trend-source">
          <div class="trend-source-dot"></div>
          <div class="trend-source-text">
            <span class="trend-source-label">Land-book.com</span> — Bento-style feature grids of varying card sizes
            replacing uniform alternating layouts — the asymmetric mosaic is now the dominant feature presentation.
          </div>
        </div>
        <div class="trend-source">
          <div class="trend-source-dot"></div>
          <div class="trend-source-text">
            <span class="trend-source-label">Lapa.ninja</span> — "Sustainable brand identity sites" signal values
            through earthy palettes, tactile typography, and unhurried pacing — a deliberate counter to SaaS purple.
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features-section" id="features">
  <p class="section-eyebrow">What's inside</p>
  <div class="feature-grid">
    <div class="feature-cell wide">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Bento project grid</div>
      <div class="feature-desc">
        Projects displayed in an asymmetric mosaic — a large featured card alongside
        medium and small cards, each with a unique colour header. Inspired by Land-book's
        shift from alternating feature sections to mosaic card layouts.
      </div>
    </div>
    <div class="feature-cell">
      <div class="feature-icon">◉</div>
      <div class="feature-title">Editorial invoice</div>
      <div class="feature-desc">Swiss-grid invoice design — dark header band, clean column alignment, and typographic hierarchy that communicates craft.</div>
    </div>
    <div class="feature-cell">
      <div class="feature-icon">⬡</div>
      <div class="feature-title">Warm cream palette</div>
      <div class="feature-desc">F8F5F0 — warm off-white replacing clinical pure white, following Siteinspire's architecture aesthetic.</div>
    </div>
    <div class="feature-cell">
      <div class="feature-icon">◐</div>
      <div class="feature-title">Client relationship view</div>
      <div class="feature-desc">Active status dots, lifetime value, and visual category differentiation per client.</div>
    </div>
    <div class="feature-cell wide">
      <div class="feature-icon">▣</div>
      <div class="feature-title">6 complete screens, 491 elements</div>
      <div class="feature-desc">
        Dashboard, Projects (bento grid), Project Detail, Clients, Invoice creation, and Profile/Portfolio —
        a complete end-to-end workflow for creative freelancers.
      </div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section" id="palette">
  <p class="section-eyebrow">Colour palette</p>
  <div class="palette-swatches">
    ${[
      { hex: '#F8F5F0', name: 'Warm Cream' },
      { hex: '#FFFFFF', name: 'Surface' },
      { hex: '#EDE9E2', name: 'Linen' },
      { hex: '#16120C', name: 'Warm Black' },
      { hex: '#6B6258', name: 'Stone' },
      { hex: '#1C4ED8', name: 'Klein Blue' },
      { hex: '#B45309', name: 'Amber Brown' },
      { hex: '#16A34A', name: 'Paid Green' },
      { hex: '#D6CFBF', name: 'Border' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-hex">${s.hex}</div>
      <div class="swatch-name">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- LINKS -->
<div class="links-section">
  <a href="https://ram.zenbin.org/mast-viewer" class="link-btn accent">☁ Open Viewer</a>
  <a href="https://ram.zenbin.org/mast-mock" class="link-btn">☀◑ Interactive Mock</a>
  <a href="https://ram.zenbin.org/mast" class="link-btn">↩ Hero Page</a>
</div>

<!-- FOOTER -->
<footer>
  <span>MAST — RAM Design Heartbeat · April 2026</span>
  <span>Theme: Light · 6 screens · 491 elements</span>
</footer>

</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'MAST — Studio OS for creative freelancers');
  console.log(`Hero:   ${r1.status}  ${r1.status === 201 ? '✓' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'MAST — Viewer');
  console.log(`Viewer: ${r2.status}  ${r2.status === 201 ? '✓' : r2.body.slice(0, 120)}`);
}
main().catch(console.error);
