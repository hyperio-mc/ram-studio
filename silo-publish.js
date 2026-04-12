'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'silo';
const APP_NAME = 'SILO';
const TAGLINE  = 'Pantry intelligence. Meals made effortless.';

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
const pen     = JSON.parse(penJson);
const screens = pen.screens;

// ── Palette ──────────────────────────────────────────────────────────────────
const P = pen.metadata.palette;

// ── Screen SVG thumbnails ─────────────────────────────────────────────────────
function screenToDataURI(screen) {
  const svg = screen.svg;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// ── Hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #FAF6F0;
    --surface: #FFFFFF;
    --card: #F5EDE0;
    --border: #E8DDD0;
    --text: #1A1410;
    --text2: #6B5C4E;
    --text3: #A0907E;
    --acc: #C4622A;
    --acc2: #4A7A57;
    --acc3: #2E6B9A;
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    min-height: 100vh;
  }
  a { color: inherit; text-decoration: none; }

  /* ── Nav ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,246,240,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .nav-logo { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: var(--acc); font-family: Georgia, serif; }
  .nav-links { display: flex; gap: 24px; font-size: 13px; color: var(--text2); }
  .nav-cta {
    background: var(--acc); color: #fff; padding: 8px 20px;
    border-radius: 20px; font-size: 13px; font-weight: 600;
    transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── Hero ── */
  .hero {
    padding: 80px 32px 60px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--card); border: 1px solid var(--border);
    padding: 6px 14px; border-radius: 20px; font-size: 12px;
    color: var(--acc); font-weight: 600; margin-bottom: 20px;
  }
  .hero h1 {
    font-family: Georgia, serif;
    font-size: clamp(36px, 5vw, 58px);
    font-weight: 700; line-height: 1.1;
    letter-spacing: -1px; color: var(--text);
    margin-bottom: 8px;
  }
  .hero h1 span { color: var(--acc); }
  .hero-sub {
    font-size: 16px; color: var(--text2); line-height: 1.6;
    max-width: 420px; margin-bottom: 32px;
  }
  .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: #fff;
    padding: 14px 28px; border-radius: 28px; font-weight: 700; font-size: 15px;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 16px rgba(196,98,42,0.35);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(196,98,42,0.45); }
  .btn-secondary {
    border: 1.5px solid var(--border); color: var(--text2);
    padding: 13px 24px; border-radius: 28px; font-weight: 500; font-size: 15px;
  }
  /* Phone mockup */
  .hero-visual { display: flex; justify-content: center; gap: 16px; }
  .phone {
    width: 180px; background: var(--surface);
    border-radius: 28px; overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 8px 40px rgba(0,0,0,0.12);
    transform: rotate(2deg);
    transition: transform 0.3s;
  }
  .phone:first-child { transform: rotate(-2deg); margin-top: 24px; }
  .phone:hover { transform: rotate(0deg) scale(1.03); }
  .phone img { width: 100%; display: block; }

  /* ── OWO pill showcase ── */
  .pill-showcase {
    background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 40px 32px;
    text-align: center;
  }
  .pill-showcase h2 { font-family: Georgia,serif; font-size: 22px; margin-bottom: 6px; }
  .pill-showcase p { color: var(--text2); font-size: 14px; margin-bottom: 24px; }
  .pill-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .pill {
    padding: 8px 16px; border-radius: 20px;
    font-size: 13px; font-weight: 600; cursor: default;
    transition: transform 0.2s;
  }
  .pill:hover { transform: scale(1.05); }

  /* ── Stats ── */
  .stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    max-width: 900px; margin: 0 auto;
    padding: 48px 32px;
    gap: 2px;
  }
  .stat { text-align: center; padding: 20px; }
  .stat-val { font-size: 36px; font-weight: 800; font-family: Georgia,serif; color: var(--acc); }
  .stat-lbl { font-size: 13px; color: var(--text2); margin-top: 4px; }

  /* ── Features ── */
  .features {
    max-width: 1100px; margin: 0 auto; padding: 0 32px 80px;
  }
  .features h2 { font-family: Georgia,serif; font-size: 32px; text-align: center; margin-bottom: 8px; }
  .features-sub { color: var(--text2); text-align: center; font-size: 15px; margin-bottom: 48px; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
  }
  .feature-card .icon { font-size: 28px; margin-bottom: 16px; }
  .feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; font-family: Georgia,serif; }
  .feature-card p { font-size: 13px; color: var(--text2); line-height: 1.6; }
  .feature-accent { border-top: 3px solid var(--acc); }
  .feature-accent2 { border-top: 3px solid var(--acc2); }
  .feature-accent3 { border-top: 3px solid var(--acc3); }

  /* ── Screen gallery ── */
  .gallery {
    background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 60px 32px;
  }
  .gallery h2 { font-family: Georgia,serif; font-size: 32px; text-align: center; margin-bottom: 8px; }
  .gallery-sub { color: var(--text2); text-align: center; font-size: 15px; margin-bottom: 40px; }
  .screen-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 20px; max-width: 1100px; margin: 0 auto;
  }
  .screen-card {
    background: var(--surface); border-radius: 20px; overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .screen-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  }
  .screen-card img { width: 100%; display: block; }
  .screen-label {
    padding: 12px 16px; font-size: 13px; font-weight: 600;
    color: var(--text2); border-top: 1px solid var(--border);
  }

  /* ── Palette section ── */
  .palette-section {
    max-width: 900px; margin: 0 auto; padding: 60px 32px;
  }
  .palette-section h2 { font-family: Georgia,serif; font-size: 24px; margin-bottom: 24px; }
  .swatch-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .swatch { border-radius: 12px; padding: 20px 16px; min-width: 100px; font-size: 11px; font-weight: 600; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px; text-align: center;
    color: var(--text3); font-size: 12px;
  }
  footer a { color: var(--acc); font-weight: 600; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; }
    .hero-visual { display: none; }
    .stats { grid-template-columns: repeat(2,1fr); }
    .feature-grid { grid-template-columns: 1fr; }
    .screen-grid { grid-template-columns: repeat(2,1fr); }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">SILO</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock →</a>
</nav>

<section class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">
      <span>🌿</span> RAM Design Heartbeat #471
    </div>
    <h1>Your kitchen,<br/><span>organised.</span></h1>
    <p class="hero-sub">SILO turns your pantry into a smart kitchen brain — tracking what you have, planning what to cook, and building your shopping list before you even ask.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Interactive Mock ☀◑</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">View in Pencil →</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone">
      <img src="${screenToDataURI(screens[0])}" alt="SILO Home Screen"/>
    </div>
    <div class="phone">
      <img src="${screenToDataURI(screens[2])}" alt="SILO Meal Planner"/>
    </div>
  </div>
</section>

<section class="pill-showcase">
  <h2>The "word-as-object" ingredient system</h2>
  <p>Inspired by OWO's per-word pill typography (lapa.ninja) — every category is its own coloured object, not just a label.</p>
  <div class="pill-row">
    <span class="pill" style="background:#FDE8C8;color:#8B4A10">Grains</span>
    <span class="pill" style="background:#D4ECD8;color:#1E5C2A">Veggies</span>
    <span class="pill" style="background:#D0E4F5;color:#1A4E7A">Dairy</span>
    <span class="pill" style="background:#F5D0D0;color:#7A1E1E">Protein</span>
    <span class="pill" style="background:#EDE0F5;color:#4E1E7A">Pantry</span>
    <span class="pill" style="background:#FDDDD0;color:#8B3A18">Fruit</span>
    <span class="pill" style="background:#FAF0C8;color:#7A6010">Spice</span>
    <span class="pill" style="background:#FDE8C8;color:#8B4A10">Italian</span>
    <span class="pill" style="background:#F5D0D0;color:#7A1E1E">Japanese</span>
    <span class="pill" style="background:#D4ECD8;color:#1E5C2A">Mexican</span>
    <span class="pill" style="background:#FAF0C8;color:#7A6010">Indian</span>
    <span class="pill" style="background:#EDE0F5;color:#4E1E7A">French</span>
    <span class="pill" style="background:#D0E4F5;color:#1A4E7A">Thai</span>
    <span class="pill" style="background:#D4ECD8;color:#1E5C2A">Vegetarian</span>
    <span class="pill" style="background:#FDE8C8;color:#8B4A10">Gluten-free</span>
    <span class="pill" style="background:#D0E4F5;color:#1A4E7A">Dairy-free</span>
  </div>
</section>

<div class="stats">
  <div class="stat"><div class="stat-val">47</div><div class="stat-lbl">Items tracked</div></div>
  <div class="stat"><div class="stat-val">6</div><div class="stat-lbl">Meals planned</div></div>
  <div class="stat"><div class="stat-val">12</div><div class="stat-lbl">Shopping items</div></div>
  <div class="stat"><div class="stat-val">0</div><div class="stat-lbl">Food wasted</div></div>
</div>

<section class="features">
  <h2>Everything your kitchen needs</h2>
  <p class="features-sub">From receipt scan to plate — SILO handles the whole loop.</p>
  <div class="feature-grid">
    <div class="feature-card feature-accent">
      <div class="icon">📦</div>
      <h3>Smart Pantry</h3>
      <p>Scan barcodes or receipts to instantly populate your pantry. Expiry tracking surfaces what needs using first.</p>
    </div>
    <div class="feature-card feature-accent2">
      <div class="icon">🍽</div>
      <h3>Meal Planning</h3>
      <p>Weekly planner with automatic ingredient cross-reference. Knows what you have, suggests what you can make tonight.</p>
    </div>
    <div class="feature-card feature-accent3">
      <div class="icon">🛒</div>
      <h3>Auto Shopping</h3>
      <p>Missing ingredients flow straight to your shopping list, grouped by aisle and sorted by store layout.</p>
    </div>
    <div class="feature-card" style="border-top:3px solid #9B4F9E">
      <div class="icon">🌿</div>
      <h3>Seasonal Eating</h3>
      <p>Discover recipes timed to what's in season locally. Better flavour, better prices, less waste.</p>
    </div>
    <div class="feature-card" style="border-top:3px solid #B89B2A">
      <div class="icon">📊</div>
      <h3>Waste Analytics</h3>
      <p>See exactly what expired, what you over-bought, and how much you saved this month vs. last.</p>
    </div>
    <div class="feature-card" style="border-top:3px solid #C4622A">
      <div class="icon">🤝</div>
      <h3>Household Sync</h3>
      <p>Share a pantry with your household. Real-time updates so nobody buys the milk that's already in the fridge.</p>
    </div>
  </div>
</section>

<section class="gallery" id="screens">
  <h2>All 6 screens</h2>
  <p class="gallery-sub">Mobile-first · 390×844 · Light theme · 516 elements</p>
  <div class="screen-grid">
    ${screens.map(s => `
    <div class="screen-card">
      <img src="${screenToDataURI(s)}" alt="${s.name}"/>
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="palette-section">
  <h2>Palette — Warm Editorial Light</h2>
  <p style="color:var(--text2);font-size:13px;margin-bottom:24px;">Inspired by Overlay's peach-to-white gradients and Molo's earth-tone lifestyle photography (lapa.ninja)</p>
  <div class="swatch-row">
    <div class="swatch" style="background:#FAF6F0;border:1px solid #E8DDD0;color:#6B5C4E">BG<br/>#FAF6F0</div>
    <div class="swatch" style="background:#F5EDE0;border:1px solid #E8DDD0;color:#6B5C4E">Card<br/>#F5EDE0</div>
    <div class="swatch" style="background:#C4622A;color:#fff">Terracotta<br/>#C4622A</div>
    <div class="swatch" style="background:#4A7A57;color:#fff">Forest<br/>#4A7A57</div>
    <div class="swatch" style="background:#2E6B9A;color:#fff">Sky<br/>#2E6B9A</div>
    <div class="swatch" style="background:#9B4F9E;color:#fff">Plum<br/>#9B4F9E</div>
    <div class="swatch" style="background:#B89B2A;color:#fff">Gold<br/>#B89B2A</div>
  </div>
</section>

<footer>
  <p>RAM Design Heartbeat #471 · April 2026 · Light theme</p>
  <p style="margin-top:8px">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a> ·
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </p>
</footer>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`);

  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`);
}

main().catch(console.error);
