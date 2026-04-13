'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'graze';
const APP_NAME = 'GRAZE';
const TAGLINE = 'Eat with intention';

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

// Extract screens for carousel
const screens = pen.screens;
const palette = pen.metadata.palette;

// Build SVG data URIs for carousel
function svgToDataUri(svg) {
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

// ── Hero HTML ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #FAF7F2;
    --bg-deep: #F2EDE3;
    --card: #FFFFFF;
    --text: #1A1818;
    --text-mid: #5C5550;
    --text-mute: #9E978F;
    --accent: #C4714F;
    --accent2: #7B9B6B;
    --border: #E8E0D5;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Georgia', serif;
    min-height: 100vh;
  }

  /* Nav */
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 48px;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    background: rgba(250,247,242,0.92);
    backdrop-filter: blur(12px);
    z-index: 100;
  }

  .nav-logo {
    font-family: 'Georgia', serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 4px;
    color: var(--text);
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: 32px;
    list-style: none;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: var(--text-mid);
  }

  .nav-cta {
    background: var(--accent);
    color: white;
    padding: 10px 24px;
    border-radius: 24px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .nav-cta:hover { opacity: 0.88; }

  /* Hero */
  .hero {
    max-width: 1200px;
    margin: 0 auto;
    padding: 80px 48px 60px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .hero-text {}

  .hero-eyebrow {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .hero-title {
    font-family: 'Georgia', serif;
    font-size: clamp(52px, 6vw, 80px);
    font-weight: 700;
    line-height: 1.05;
    color: var(--text);
    margin-bottom: 24px;
  }

  .hero-title em {
    color: var(--accent);
    font-style: normal;
  }

  .hero-sub {
    font-family: 'Inter', sans-serif;
    font-size: 17px;
    color: var(--text-mid);
    line-height: 1.65;
    margin-bottom: 40px;
    max-width: 440px;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  .btn-primary {
    background: var(--accent);
    color: white;
    padding: 14px 32px;
    border-radius: 32px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.15s;
  }

  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

  .btn-secondary {
    color: var(--text-mid);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--border);
    padding: 13px 24px;
    border-radius: 32px;
    transition: border-color 0.2s;
  }

  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* Phone mockup carousel */
  .hero-screens {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: center;
  }

  .phone-wrap {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 36px;
    padding: 8px;
    box-shadow: 0 8px 40px rgba(26,24,24,0.08);
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  .phone-wrap:hover { transform: translateY(-4px); }

  .phone-wrap.main { width: 200px; }
  .phone-wrap.peek { width: 160px; margin-top: 30px; opacity: 0.7; }

  .phone-wrap img {
    width: 100%;
    border-radius: 30px;
    display: block;
  }

  /* Palette section */
  .palette-strip {
    background: var(--bg-deep);
    padding: 60px 48px;
    text-align: center;
  }

  .palette-strip h2 {
    font-family: 'Georgia', serif;
    font-size: 28px;
    margin-bottom: 8px;
  }

  .palette-strip p {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: var(--text-mid);
    margin-bottom: 32px;
  }

  .swatches {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .swatch-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid var(--border);
  }

  .swatch-label {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: var(--text-mute);
    text-align: center;
  }

  /* Features section */
  .features {
    max-width: 1100px;
    margin: 0 auto;
    padding: 80px 48px;
  }

  .features-header {
    text-align: center;
    margin-bottom: 56px;
  }

  .features-header h2 {
    font-family: 'Georgia', serif;
    font-size: 40px;
    margin-bottom: 12px;
  }

  .features-header p {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: var(--text-mid);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .feature-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px 28px;
  }

  .feature-icon {
    font-size: 32px;
    margin-bottom: 16px;
  }

  .feature-card h3 {
    font-family: 'Georgia', serif;
    font-size: 19px;
    margin-bottom: 10px;
  }

  .feature-card p {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: var(--text-mid);
    line-height: 1.6;
  }

  /* Screen gallery */
  .screens-gallery {
    background: var(--bg-deep);
    padding: 80px 48px;
  }

  .screens-gallery h2 {
    font-family: 'Georgia', serif;
    font-size: 36px;
    text-align: center;
    margin-bottom: 40px;
  }

  .screens-row {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    justify-content: center;
    padding-bottom: 12px;
  }

  .screen-card {
    flex-shrink: 0;
    width: 175px;
  }

  .screen-card img {
    width: 175px;
    border-radius: 24px;
    border: 1px solid var(--border);
    box-shadow: 0 4px 20px rgba(26,24,24,0.07);
    display: block;
  }

  .screen-label {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: var(--text-mute);
    text-align: center;
    margin-top: 10px;
  }

  /* CTA band */
  .cta-band {
    max-width: 700px;
    margin: 0 auto;
    padding: 80px 48px;
    text-align: center;
  }

  .cta-band h2 {
    font-family: 'Georgia', serif;
    font-size: 42px;
    margin-bottom: 16px;
  }

  .cta-band h2 em { color: var(--accent); font-style: normal; }

  .cta-band p {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: var(--text-mid);
    margin-bottom: 36px;
  }

  /* Footer */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: var(--text-mute);
  }

  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 768px) {
    nav { padding: 16px 24px; }
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 48px 24px 40px; }
    .features-grid { grid-template-columns: 1fr; }
    .features, .cta-band { padding: 48px 24px; }
    .screens-gallery { padding: 48px 24px; }
    .palette-strip { padding: 48px 24px; }
    footer { padding: 24px; flex-direction: column; gap: 12px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">GRAZE</a>
  <ul class="nav-links">
    <li>Discover</li>
    <li>Plan</li>
    <li>Cookbook</li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">View mock →</a>
</nav>

<section class="hero">
  <div class="hero-text">
    <div class="hero-eyebrow">🌿 RAM Design Heartbeat #481</div>
    <h1 class="hero-title">
      Eat with<br><em>intention.</em>
    </h1>
    <p class="hero-sub">
      Season-led meal discovery, effortless planning, and a grocery list that builds itself. Designed in the warm editorial style of minimal.gallery's 2026 trend report.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
    </div>
  </div>

  <div class="hero-screens">
    <div class="phone-wrap main">
      <img src="${svgToDataUri(screens[0].svg)}" alt="Discover screen">
    </div>
    <div class="phone-wrap peek">
      <img src="${svgToDataUri(screens[2].svg)}" alt="Meal Plan screen">
    </div>
  </div>
</section>

<div class="palette-strip">
  <h2>Warm Editorial Palette</h2>
  <p>Inspired by minimal.gallery's shift from clinical white to warm linen neutrals</p>
  <div class="swatches">
    <div class="swatch">
      <div class="swatch-circle" style="background:#FAF7F2"></div>
      <div class="swatch-label">Linen BG<br>#FAF7F2</div>
    </div>
    <div class="swatch">
      <div class="swatch-circle" style="background:#F2EDE3"></div>
      <div class="swatch-label">Sand<br>#F2EDE3</div>
    </div>
    <div class="swatch">
      <div class="swatch-circle" style="background:#FFFFFF;"></div>
      <div class="swatch-label">White Card<br>#FFFFFF</div>
    </div>
    <div class="swatch">
      <div class="swatch-circle" style="background:#1A1818"></div>
      <div class="swatch-label">Near-Black<br>#1A1818</div>
    </div>
    <div class="swatch">
      <div class="swatch-circle" style="background:#C4714F"></div>
      <div class="swatch-label">Terracotta<br>#C4714F</div>
    </div>
    <div class="swatch">
      <div class="swatch-circle" style="background:#7B9B6B"></div>
      <div class="swatch-label">Sage<br>#7B9B6B</div>
    </div>
    <div class="swatch">
      <div class="swatch-circle" style="background:#E8E0D5"></div>
      <div class="swatch-label">Warm Border<br>#E8E0D5</div>
    </div>
  </div>
</div>

<section class="features">
  <div class="features-header">
    <h2>Designed for how people actually cook</h2>
    <p>Every screen informed by real meal planning behaviour</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">🌿</div>
      <h3>Type-first Discovery</h3>
      <p>Oversized editorial serif headlines borrowed from minimal.gallery's 2026 showcase — the recipe name is the design. No hero imagery needed.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▦</div>
      <h3>Bento Meal Planning</h3>
      <p>Asymmetric bento grid for the discover screen, straight from land-book's most-featured layout pattern. Large + small tiles create rhythm without chaos.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✓</div>
      <h3>Smart Grocery List</h3>
      <p>Categorised by aisle (Produce, Protein, Pantry) with a progress indicator — because 57% checked off still feels like momentum.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">♥</div>
      <h3>Personal Cookbook</h3>
      <p>Collections, search, filter chips — your saved recipes curated with the same warm restraint as a physical recipe book.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🍋</div>
      <h3>Seasonal Nudges</h3>
      <p>In-season ingredient tags on the profile screen keep the cooking calendar honest. Spring calls for asparagus and wild garlic.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◑</div>
      <h3>Light / Dark Toggle</h3>
      <p>Full light and dark palette in the Svelte mock. Terracotta and sage hold their warmth in both modes.</p>
    </div>
  </div>
</section>

<section class="screens-gallery">
  <h2>All 6 Screens</h2>
  <div class="screens-row">
    ${screens.map(s => `
    <div class="screen-card">
      <img src="${svgToDataUri(s.svg)}" alt="${s.name}">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<div class="cta-band">
  <h2>Cook with <em>purpose.</em></h2>
  <p>Explore the full interactive prototype with light and dark mode support.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</div>

<footer>
  <div>GRAZE — RAM Design Heartbeat #481 · April 2026</div>
  <div>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> ·
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </div>
</footer>

</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 120) : 'OK');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 120) : 'OK');
}

main().catch(console.error);
