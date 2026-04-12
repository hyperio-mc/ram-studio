'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG   = 'liga';
const NAME   = 'LIGA';
const TAGLINE = 'Independent type. Human-made.';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
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

// ─── Load pen ─────────────────────────────────────────────────────────────────
const penPath = path.join(__dirname, `${SLUG}.pen`);
const penJson = fs.readFileSync(penPath, 'utf8');
const pen     = JSON.parse(penJson);

// ─── Build SVG data URIs for carousel ────────────────────────────────────────
function svgToDataUri(svg) {
  const encoded = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

const screens    = pen.screens;
const screenUris = screens.map(s => svgToDataUri(s.svg));

// ─── Palette ─────────────────────────────────────────────────────────────────
const palette = [
  { name: 'Cream Paper',  hex: '#FAF8F4' },
  { name: 'Ink Black',    hex: '#141210' },
  { name: 'Warm Gold',    hex: '#9B7A45' },
  { name: 'Warm Border',  hex: '#E3DDD4' },
  { name: 'Grove Green',  hex: '#2D7D46' },
];

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:     #FAF8F4;
    --surf:   #FFFFFF;
    --card:   #F0EDE6;
    --border: #E3DDD4;
    --text:   #141210;
    --text2:  #7A746C;
    --acc:    #141210;
    --acc2:   #9B7A45;
    --green:  #2D7D46;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Georgia', serif; min-height: 100vh; }

  /* Top bar */
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 40px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: var(--bg); z-index: 100;
  }
  .logo { font-size: 20px; font-weight: 700; letter-spacing: 5px; color: var(--text); }
  .tagline-small { font-size: 12px; color: var(--text2); font-family: 'Inter', sans-serif; letter-spacing: 0.5px; }
  .btn-small {
    background: var(--text); color: #fff; border: none; padding: 8px 18px;
    border-radius: 4px; font-size: 12px; font-family: 'Inter', sans-serif;
    font-weight: 600; cursor: pointer; text-decoration: none; letter-spacing: 0.5px;
  }

  /* Hero */
  .hero {
    padding: 80px 40px 60px;
    border-bottom: 1px solid var(--border);
    position: relative; overflow: hidden;
  }
  .hero-deco {
    position: absolute; right: -20px; top: -20px;
    font-size: 320px; font-weight: 700; color: rgba(20,18,16,0.03);
    line-height: 1; pointer-events: none; user-select: none;
  }
  .hero-kicker {
    font-size: 10px; font-family: 'Inter', sans-serif; font-weight: 600;
    letter-spacing: 3px; color: var(--acc2); margin-bottom: 20px;
    text-transform: uppercase;
  }
  .hero-headline {
    font-size: clamp(48px, 8vw, 80px); font-weight: 300; line-height: 1.05;
    letter-spacing: -2px; margin-bottom: 12px; max-width: 700px;
  }
  .hero-headline em { font-style: italic; color: var(--acc2); }
  .hero-sub {
    font-size: 18px; color: var(--text2); font-family: 'Inter', sans-serif;
    font-weight: 400; max-width: 560px; line-height: 1.6; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 12px; align-items: center; }
  .btn-primary {
    background: var(--text); color: #fff; text-decoration: none;
    padding: 14px 28px; border-radius: 6px; font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 600; letter-spacing: 0.3px;
  }
  .btn-outline {
    background: transparent; color: var(--text2); text-decoration: none;
    padding: 14px 28px; border-radius: 6px; border: 1px solid var(--border);
    font-family: 'Inter', sans-serif; font-size: 14px;
  }
  .hero-stats {
    display: flex; gap: 40px; margin-top: 48px; padding-top: 32px;
    border-top: 1px solid var(--border);
  }
  .stat-item { display: flex; flex-direction: column; gap: 4px; }
  .stat-num { font-size: 28px; font-weight: 600; letter-spacing: -1px; }
  .stat-label { font-size: 11px; color: var(--text2); font-family: 'Inter', sans-serif; letter-spacing: 1px; text-transform: uppercase; }

  /* Screen carousel */
  .screens-section { padding: 60px 40px; border-bottom: 1px solid var(--border); }
  .section-label {
    font-size: 9px; font-family: 'Inter', sans-serif; font-weight: 600;
    letter-spacing: 3px; color: var(--text2); text-transform: uppercase;
    margin-bottom: 32px;
  }
  .carousel {
    display: flex; gap: 20px; overflow-x: auto; padding-bottom: 12px;
    scrollbar-width: none;
  }
  .carousel::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 200px; border-radius: 12px; overflow: hidden;
    border: 1px solid var(--border); background: var(--surf);
    box-shadow: 0 2px 12px rgba(20,18,16,0.06);
  }
  .screen-card img { width: 100%; height: auto; display: block; }
  .screen-label {
    padding: 10px 14px; font-size: 10px; font-family: 'Inter', sans-serif;
    color: var(--text2); border-top: 1px solid var(--border);
    letter-spacing: 0.5px; text-transform: uppercase;
  }

  /* Features */
  .features-section { padding: 60px 40px; border-bottom: 1px solid var(--border); }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1px; background: var(--border); }
  .feature-item { padding: 32px; background: var(--bg); }
  .feature-num { font-size: 10px; font-family: 'Inter', sans-serif; color: var(--acc2); font-weight: 600; letter-spacing: 2px; margin-bottom: 16px; }
  .feature-title { font-size: 20px; font-weight: 400; margin-bottom: 10px; line-height: 1.2; }
  .feature-desc { font-size: 13px; color: var(--text2); font-family: 'Inter', sans-serif; line-height: 1.6; }

  /* Palette */
  .palette-section { padding: 60px 40px; border-bottom: 1px solid var(--border); }
  .palette-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
  .swatch { display: flex; align-items: center; gap: 12px; }
  .swatch-dot { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border); }
  .swatch-info { display: flex; flex-direction: column; gap: 2px; }
  .swatch-name { font-size: 12px; color: var(--text); font-family: 'Inter', sans-serif; }
  .swatch-hex { font-size: 10px; color: var(--text2); font-family: 'Inter', sans-serif; letter-spacing: 0.5px; }

  /* Quote */
  .quote-section {
    padding: 80px 40px; text-align: center; background: var(--text);
    color: var(--bg);
  }
  .quote { font-size: clamp(22px, 4vw, 38px); font-weight: 300; line-height: 1.3; max-width: 700px; margin: 0 auto 20px; font-style: italic; }
  .quote-attr { font-size: 12px; font-family: 'Inter', sans-serif; letter-spacing: 2px; opacity: 0.5; }

  /* Links */
  .links-section { padding: 48px 40px; border-bottom: 1px solid var(--border); }
  .links-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 20px; }
  .link-card {
    padding: 16px 24px; border: 1px solid var(--border); border-radius: 6px;
    text-decoration: none; color: var(--text); font-family: 'Inter', sans-serif;
    font-size: 13px; display: flex; align-items: center; gap: 8px;
    background: var(--surf);
  }
  .link-card:hover { background: var(--card); }
  .link-arrow { color: var(--acc2); }

  /* Footer */
  .footer {
    padding: 32px 40px; display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; color: var(--text2); font-family: 'Inter', sans-serif;
    letter-spacing: 0.5px;
  }
  .footer-logo { font-size: 14px; font-weight: 700; letter-spacing: 4px; color: var(--text); font-family: 'Georgia', serif; }
</style>
</head>
<body>

<nav class="topbar">
  <span class="logo">LIGA</span>
  <span class="tagline-small">${TAGLINE}</span>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-small">View Mock →</a>
</nav>

<section class="hero">
  <div class="hero-deco">Aa</div>
  <div class="hero-kicker">RAM Design Heartbeat · ${pen.metadata.date}</div>
  <h1 class="hero-headline">Independent type.<br><em>Human-made.</em></h1>
  <p class="hero-sub">A type discovery and licensing app for independent foundries — inspired by KOMETA Typefaces and the archival index aesthetic of siteinspire.com. Editorial serif revival meets minimal precision.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-outline">Interactive Mock ☀◑</a>
  </div>
  <div class="hero-stats">
    <div class="stat-item">
      <span class="stat-num">${screens.length}</span>
      <span class="stat-label">Screens</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">${pen.metadata.elements}</span>
      <span class="stat-label">Elements</span>
    </div>
    <div class="stat-item">
      <span class="stat-num" style="color: var(--acc2);">Light</span>
      <span class="stat-label">Theme</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">247</span>
      <span class="stat-label">Typefaces</span>
    </div>
  </div>
</section>

<section class="screens-section">
  <div class="section-label">Design Screens — ${screens.length} total</div>
  <div class="carousel">
    ${screenUris.map((uri, i) => `
    <div class="screen-card">
      <img src="${uri}" alt="${screens[i].name}" loading="lazy">
      <div class="screen-label">${String(i + 1).padStart(2, '0')} · ${screens[i].name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features-section">
  <div class="section-label">Design Decisions</div>
  <div class="features-grid">
    <div class="feature-item">
      <div class="feature-num">01</div>
      <div class="feature-title">Archival Index Aesthetic</div>
      <div class="feature-desc">Each typeface is presented as a row in a physical specimen book — large display text, weight count, personality tags, and foundry attribution. Inspired by KOMETA's catalog grid on minimal.gallery.</div>
    </div>
    <div class="feature-item">
      <div class="feature-num">02</div>
      <div class="feature-title">Warm Cream Paper Palette</div>
      <div class="feature-desc">FAF8F4 background mimics fine press paper stock. Paired with ink-black (#141210) text and warm gold (#9B7A45) accent — a typographer's color system, not a tech product palette.</div>
    </div>
    <div class="feature-item">
      <div class="feature-num">03</div>
      <div class="feature-title">Type-as-UI</div>
      <div class="feature-desc">The specimens themselves are the visual system. No illustrations, no photography, no gradients. Each screen is composed entirely of letterforms at different weights and scales — the font is the hero.</div>
    </div>
    <div class="feature-item">
      <div class="feature-num">04</div>
      <div class="feature-title">Counter-AI Positioning</div>
      <div class="feature-desc">Inspired by KOMETA's "We make fonts AI couldn't invent" — LIGA surfaces independent human foundries and surfaces provenance data (foundry, location, founding principles) as first-class UI content.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">Colour Palette</div>
  <div class="palette-row">
    ${palette.map(p => `
    <div class="swatch">
      <div class="swatch-dot" style="background: ${p.hex}; ${p.hex === '#FAF8F4' || p.hex === '#FFFFFF' ? 'border: 1px solid #E3DDD4;' : ''}"></div>
      <div class="swatch-info">
        <span class="swatch-name">${p.name}</span>
        <span class="swatch-hex">${p.hex}</span>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="quote-section">
  <p class="quote">"We believe type is culture. Every letterform carries the fingerprints of the human who drew it."</p>
  <div class="quote-attr">— LIGA, 2025</div>
</section>

<section class="links-section">
  <div class="section-label">Links</div>
  <div class="links-row">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-card">
      <span>Pencil Viewer</span><span class="link-arrow">→</span>
    </a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-card">
      <span>Interactive Mock ☀◑</span><span class="link-arrow">→</span>
    </a>
  </div>
</section>

<footer class="footer">
  <span class="footer-logo">LIGA</span>
  <span>RAM Design Heartbeat · ${pen.metadata.date} · ${pen.metadata.elements} elements across ${screens.length} screens</span>
  <span>Light theme · Independent type</span>
</footer>

</body>
</html>`;

// ─── Viewer HTML with embedded pen ───────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
