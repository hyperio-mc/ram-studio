'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'type';
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

const BG      = '#F8F5F0';
const SURF    = '#FFFFFF';
const TEXT    = '#1C1814';
const ACC     = '#C94F0A';
const ACC2    = '#4A5560';
const MUTED   = '#9A9086';
const BORDER  = '#DDD7CE';
const MONO    = '#E8E2D9';

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

// Build SVG data URIs for carousel
function svgToDataUri(svgStr) {
  const encoded = encodeURIComponent(svgStr);
  return `data:image/svg+xml,${encoded}`;
}

const screenPreviews = pen.screens.map(s => svgToDataUri(s.svg));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TYPE — Font discovery, specimen &amp; pairing studio</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG};
    --surf: ${SURF};
    --text: ${TEXT};
    --acc: ${ACC};
    --acc2: ${ACC2};
    --muted: ${MUTED};
    --border: ${BORDER};
    --mono: ${MONO};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: rgba(248,245,240,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: Georgia, serif; font-size: 22px; font-weight: 700;
    letter-spacing: -0.5px; color: var(--text); text-decoration: none;
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-family: 'Courier New', monospace; font-size: 12px; color: var(--muted); text-decoration: none; letter-spacing: 0.05em; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--acc); color: #fff; padding: 9px 22px;
    border-radius: 20px; font-family: 'Courier New', monospace;
    font-size: 12px; font-weight: 700; text-decoration: none;
    letter-spacing: 0.05em; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* Hero */
  .hero {
    padding: 140px 40px 80px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
    max-width: 1240px; margin: 0 auto; align-items: center;
  }
  .hero-eyebrow {
    font-family: 'Courier New', monospace; font-size: 11px; color: var(--acc);
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px;
  }
  .hero-title {
    font-family: Georgia, serif; font-size: clamp(52px, 7vw, 96px);
    font-weight: 700; line-height: 0.92; letter-spacing: -2px;
    margin-bottom: 28px;
  }
  .hero-title span { color: var(--acc); }
  .hero-desc {
    font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.7;
    color: var(--muted); max-width: 420px; margin-bottom: 40px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    background: var(--text); color: var(--bg); padding: 14px 32px;
    border-radius: 28px; font-family: 'Courier New', monospace;
    font-size: 13px; font-weight: 700; text-decoration: none;
    letter-spacing: 0.04em; transition: transform 0.18s, box-shadow 0.18s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(28,24,20,0.18); }
  .btn-secondary {
    background: transparent; color: var(--text); padding: 14px 28px;
    border: 1.5px solid var(--border); border-radius: 28px;
    font-family: 'Courier New', monospace; font-size: 13px;
    text-decoration: none; letter-spacing: 0.04em; transition: border-color 0.18s;
  }
  .btn-secondary:hover { border-color: var(--text); }
  .hero-phone {
    display: flex; justify-content: center;
  }
  .phone-frame {
    width: 260px; height: 540px;
    background: var(--text); border-radius: 36px;
    padding: 10px; box-shadow: 0 32px 80px rgba(28,24,20,0.2), 0 8px 24px rgba(28,24,20,0.08);
    position: relative;
  }
  .phone-inner {
    width: 100%; height: 100%; border-radius: 28px;
    overflow: hidden; background: var(--bg);
  }
  .phone-inner img { width: 100%; height: auto; display: block; }
  .phone-notch {
    position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
    width: 80px; height: 20px; background: var(--text);
    border-radius: 0 0 14px 14px; z-index: 10;
  }

  /* Big type specimen strip */
  .specimen-strip {
    background: var(--mono); padding: 48px 0; overflow: hidden;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  }
  .specimen-scroll {
    display: flex; gap: 40px; white-space: nowrap;
    animation: scroll-right 24s linear infinite;
    width: max-content;
  }
  .specimen-letter {
    font-family: Georgia, serif; font-size: 100px; font-weight: 700;
    color: var(--text); opacity: 0.12; line-height: 1; letter-spacing: -2px;
  }
  .specimen-word {
    font-family: Georgia, serif; font-size: 100px; font-weight: 700;
    color: var(--acc); opacity: 0.18; line-height: 1;
  }
  @keyframes scroll-right {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  /* Features */
  .features {
    padding: 100px 40px;
    max-width: 1240px; margin: 0 auto;
  }
  .section-label {
    font-family: 'Courier New', monospace; font-size: 10px;
    letter-spacing: 2px; color: var(--muted); text-transform: uppercase;
    margin-bottom: 48px; padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
  .feature-card {
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 16px; padding: 32px; transition: transform 0.2s, box-shadow 0.2s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(28,24,20,0.08); }
  .feature-icon { font-family: 'Courier New', monospace; font-size: 28px; margin-bottom: 20px; color: var(--acc); }
  .feature-title { font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin-bottom: 12px; }
  .feature-desc { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.7; color: var(--muted); }

  /* Screens carousel */
  .screens-section { padding: 100px 0; background: var(--surf); border-top: 1px solid var(--border); }
  .screens-header { padding: 0 40px; max-width: 1240px; margin: 0 auto 48px; }
  .screens-title { font-family: Georgia, serif; font-size: 40px; font-weight: 700; letter-spacing: -1px; }
  .carousel { display: flex; gap: 24px; padding: 0 40px; overflow-x: auto; scroll-snap-type: x mandatory; }
  .carousel::-webkit-scrollbar { height: 4px; }
  .carousel::-webkit-scrollbar-track { background: var(--mono); border-radius: 2px; }
  .carousel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .carousel-item { scroll-snap-align: start; flex-shrink: 0; }
  .screen-label { font-family: 'Courier New', monospace; font-size: 10px; color: var(--muted); margin-bottom: 12px; letter-spacing: 1.5px; text-transform: uppercase; }
  .screen-phone {
    width: 180px; height: 368px; background: var(--text);
    border-radius: 26px; padding: 7px;
    box-shadow: 0 16px 40px rgba(28,24,20,0.15);
  }
  .screen-phone-inner {
    width: 100%; height: 100%; border-radius: 20px; overflow: hidden;
  }
  .screen-phone-inner img { width: 100%; height: auto; display: block; }

  /* Palette */
  .palette-section { padding: 80px 40px; max-width: 1240px; margin: 0 auto; }
  .palette-grid { display: flex; gap: 12px; margin-top: 32px; }
  .swatch { flex: 1; height: 80px; border-radius: 12px; display: flex; align-items: flex-end; padding: 10px 12px; border: 1px solid var(--border); }
  .swatch-label { font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.5px; }

  /* Footer */
  footer {
    background: var(--text); color: var(--bg);
    padding: 60px 40px 40px; text-align: center;
  }
  .footer-logo { font-family: Georgia, serif; font-size: 48px; font-weight: 700; margin-bottom: 16px; opacity: 0.9; }
  .footer-tag { font-family: 'Courier New', monospace; font-size: 12px; opacity: 0.4; letter-spacing: 1px; margin-bottom: 40px; }
  .footer-links { display: flex; justify-content: center; gap: 32px; margin-bottom: 40px; }
  .footer-links a { font-family: 'Courier New', monospace; font-size: 12px; color: var(--bg); opacity: 0.5; text-decoration: none; }
  .footer-links a:hover { opacity: 0.9; }
  .footer-credit { font-family: 'Courier New', monospace; font-size: 10px; opacity: 0.3; letter-spacing: 1px; }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 120px 24px 60px; }
    .hero-phone { display: none; }
    .features-grid { grid-template-columns: 1fr; }
    .hero-title { font-size: 52px; }
    nav { padding: 0 24px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">TYPE</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/type-viewer" target="_blank">Viewer</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/type-mock" target="_blank">☀◑ Interactive Mock</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div>
    <div class="hero-eyebrow">RAM Design Heartbeat #512 · April 2026 · Light Theme</div>
    <h1 class="hero-title">Discover<br><span>Type.</span><br>Beautifully.</h1>
    <p class="hero-desc">
      A font discovery companion for designers who care about the details.
      Explore specimen layouts, pair typefaces, and build your personal type library.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/type-viewer">View in Pencil ↗</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/type-mock">☀◑ Mock</a>
    </div>
  </div>
  <div class="hero-phone">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-inner">
        <img src="${screenPreviews[0]}" alt="TYPE — Discover screen" />
      </div>
    </div>
  </div>
</section>

<!-- Specimen strip (Big Type) -->
<div class="specimen-strip">
  <div class="specimen-scroll">
    ${['Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff', 'TYPE', 'Gg', 'Hh', 'Ii', 'Jj', 'SPEC', 'Kk', 'Ll', 'Mm', 'PAIR', 'Nn', 'Oo', 'Pp', 'FONT',
       'Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff', 'TYPE', 'Gg', 'Hh', 'Ii', 'Jj', 'SPEC', 'Kk', 'Ll', 'Mm', 'PAIR', 'Nn', 'Oo', 'Pp', 'FONT']
      .map((ch, i) => i % 4 === 3
        ? `<span class="specimen-word">${ch}</span>`
        : `<span class="specimen-letter">${ch}</span>`
      ).join('')}
  </div>
</div>

<!-- Features -->
<section class="features" id="features">
  <div class="section-label">Core Features</div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Font Discovery</div>
      <div class="feature-desc">Browse 8,000+ typefaces curated by category, style, and mood. Font of the Day highlights the finest new releases.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-title">Live Specimen</div>
      <div class="feature-desc">Full A–Z glyph sets, weight explorer, and specimen previews at any size. Download directly from the specimen view.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-title">Pairing Studio</div>
      <div class="feature-desc">Curated heading + body combinations voted on by the community. Filter by editorial, brand, tech, and display styles.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">♠</div>
      <div class="feature-title">Personal Library</div>
      <div class="feature-desc">Save fonts to collections, track usage by project, and organize by category. Never lose a good find again.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▤</div>
      <div class="feature-title">Type Studio</div>
      <div class="feature-desc">Live text preview with baseline guides, ruler, weight + tracking controls. Export as PNG or copy as CSS in one tap.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Year in Review</div>
      <div class="feature-desc">Activity heatmap, top typefaces, and usage stats across the year — your personal type identity, visualised.</div>
    </div>
  </div>
</section>

<!-- Screens -->
<section class="screens-section" id="screens">
  <div class="screens-header">
    <div class="section-label">All Screens · 6 of 6</div>
    <div class="screens-title">Every view, crafted.</div>
  </div>
  <div class="carousel">
    ${pen.screens.map((s, i) => `
    <div class="carousel-item">
      <div class="screen-label">${String(i + 1).padStart(2, '0')} / ${s.name}</div>
      <div class="screen-phone">
        <div class="screen-phone-inner">
          <img src="${screenPreviews[i]}" alt="${s.name}" loading="lazy" />
        </div>
      </div>
    </div>`).join('')}
  </div>
</section>

<!-- Palette -->
<section class="palette-section" id="palette">
  <div class="section-label">Light Palette · Editorial Warm</div>
  <div class="palette-grid">
    ${[
      { color: BG,    label: 'BG · F8F5F0', textColor: TEXT },
      { color: SURF,  label: 'Surface · FFFFFF', textColor: TEXT },
      { color: MONO,  label: 'Mono · E8E2D9', textColor: TEXT },
      { color: ACC,   label: 'Terracotta · C94F0A', textColor: '#FFF' },
      { color: ACC2,  label: 'Slate · 4A5560', textColor: '#FFF' },
      { color: TEXT,  label: 'Ink · 1C1814', textColor: BG },
    ].map(s => `<div class="swatch" style="background:${s.color}"><span class="swatch-label" style="color:${s.textColor};opacity:0.7">${s.label}</span></div>`).join('')}
  </div>
</section>

<!-- Footer -->
<footer>
  <div class="footer-logo">TYPE</div>
  <div class="footer-tag">RAM DESIGN HEARTBEAT #512 · APRIL 2026</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/type-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/type-mock">Interactive Mock</a>
    <a href="https://ram.zenbin.org">All Designs</a>
  </div>
  <div class="footer-credit">GENERATED BY RAM · INSPIRED BY KOMETA TYPEFACES &amp; LAND-BOOK BIG TYPE TREND</div>
</footer>

</body>
</html>`;

// Viewer
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'TYPE — Font discovery, specimen & pairing studio');
  console.log(`Hero: ${r1.status}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'TYPE — Viewer');
  console.log(`Viewer: ${r2.status}`);
}

main().catch(console.error);
