'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'tine';
const NAME    = 'TINE';
const TAGLINE = 'Freelance time, tracked honestly';

// ── Palette (light) ────────────────────────────────────────────────────────
const BG      = '#FAF8F4';
const SURF    = '#FFFFFF';
const CARD    = '#F3EFE9';
const TEXT    = '#1C1916';
const TEXT2   = '#5C5650';
const TEXT3   = '#9C948A';
const ACC     = '#2B5C3A';
const ACC2    = '#8C6515';
const RULE    = '#E8E2D8';

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

// ── Build SVG previews for carousel ───────────────────────────────────────
function elToSvg(el) {
  const safe = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  if (el.type === 'rect') {
    const rx = el.rx || 0;
    return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${rx}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}"/>`;
  }
  if (el.type === 'text') {
    const fw  = el.fw || 400;
    const fam = el.font || 'Inter';
    const anc = el.anchor === 'middle' ? 'middle' : el.anchor === 'end' ? 'end' : 'start';
    const ls  = el.ls || 0;
    return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${fw}" font-family="${fam}" text-anchor="${anc}" letter-spacing="${ls}" opacity="${el.opacity||1}">${safe(el.content)}</text>`;
  }
  if (el.type === 'circle') {
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}"/>`;
  }
  if (el.type === 'line') {
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw||1}" opacity="${el.opacity||1}"/>`;
  }
  return '';
}

function screenToSvg(screen) {
  const W = 390, H = 844;
  const bg = BG;
  const shapes = screen.elements.map(elToSvg).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="${bg}"/>
${shapes}
</svg>`;
}

const svgScreens = pen.screens.map(s => {
  const svg = screenToSvg(s);
  const b64 = Buffer.from(svg).toString('base64');
  return { name: s.name, uri: `data:image/svg+xml;base64,${b64}` };
});

// ── Hero HTML ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG}; --surf: ${SURF}; --card: ${CARD};
    --text: ${TEXT}; --text2: ${TEXT2}; --text3: ${TEXT3};
    --acc: ${ACC}; --acc2: ${ACC2}; --rule: ${RULE};
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
  }

  /* ── Nav ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,248,244,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--rule);
    padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between;
    height: 56px;
  }
  .nav-logo { font-size: 17px; font-weight: 700; letter-spacing: -0.5px; color: var(--text); text-decoration: none; }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { font-size: 13px; color: var(--text2); text-decoration: none; }
  .nav-links a:hover { color: var(--acc); }
  .nav-cta {
    background: var(--acc);
    color: white;
    font-size: 13px; font-weight: 600;
    padding: 8px 18px; border-radius: 8px;
    text-decoration: none;
  }

  /* ── Hero ── */
  .hero {
    max-width: 960px; margin: 0 auto;
    padding: 96px 24px 80px;
    text-align: center;
  }
  .hero-kicker {
    display: inline-block;
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    color: var(--acc);
    background: rgba(43,92,58,0.08);
    padding: 6px 14px; border-radius: 20px;
    margin-bottom: 28px;
    text-transform: uppercase;
  }
  .hero h1 {
    font-size: clamp(38px, 7vw, 72px);
    font-weight: 300;
    line-height: 1.08;
    letter-spacing: -2px;
    color: var(--text);
    margin-bottom: 20px;
  }
  .hero h1 strong { font-weight: 700; }
  .hero p {
    font-size: 18px; color: var(--text2);
    max-width: 520px; margin: 0 auto 40px;
    line-height: 1.7;
    font-weight: 400;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: white;
    font-size: 14px; font-weight: 600;
    padding: 14px 28px; border-radius: 10px;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(43,92,58,0.22); }
  .btn-secondary {
    background: var(--surf); color: var(--text2);
    font-size: 14px; font-weight: 500;
    padding: 14px 28px; border-radius: 10px;
    border: 1px solid var(--rule);
    text-decoration: none;
  }

  /* ── Phone carousel ── */
  .carousel-wrap {
    padding: 64px 24px;
    overflow: hidden;
  }
  .carousel-label {
    text-align: center;
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    color: var(--text3); text-transform: uppercase;
    margin-bottom: 32px;
  }
  .carousel {
    display: flex; gap: 24px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 0 calc(50% - 180px) 20px;
    scrollbar-width: none;
  }
  .carousel::-webkit-scrollbar { display: none; }
  .phone-card {
    flex: 0 0 220px;
    scroll-snap-align: center;
    background: var(--surf);
    border-radius: 28px;
    padding: 12px;
    border: 1px solid var(--rule);
    box-shadow: 0 4px 20px rgba(28,25,22,0.06);
    transition: transform 0.3s;
  }
  .phone-card:hover { transform: translateY(-6px); }
  .phone-card img { width: 100%; border-radius: 20px; display: block; }
  .phone-label {
    text-align: center;
    font-size: 11px; color: var(--text3);
    margin-top: 10px; font-weight: 500;
    letter-spacing: 1px; text-transform: uppercase;
  }

  /* ── Features ── */
  .features {
    max-width: 960px; margin: 0 auto;
    padding: 80px 24px;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
  }
  .feature-card {
    background: var(--surf);
    border: 1px solid var(--rule);
    border-radius: 16px;
    padding: 32px 28px;
  }
  .feature-icon {
    width: 44px; height: 44px;
    background: rgba(43,92,58,0.08);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    margin-bottom: 20px;
  }
  .feature-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
  .feature-card p { font-size: 14px; color: var(--text2); line-height: 1.65; }

  /* ── Palette strip ── */
  .palette-section {
    max-width: 960px; margin: 0 auto;
    padding: 24px 24px 80px;
  }
  .palette-label {
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    color: var(--text3); text-transform: uppercase;
    margin-bottom: 16px;
  }
  .palette-swatches { display: flex; gap: 12px; flex-wrap: wrap; }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .swatch-color {
    width: 52px; height: 52px; border-radius: 12px;
    border: 1px solid var(--rule);
  }
  .swatch span { font-size: 10px; color: var(--text3); font-weight: 500; }

  /* ── Research note ── */
  .research {
    max-width: 960px; margin: 0 auto;
    padding: 0 24px 80px;
    border-top: 1px solid var(--rule);
  }
  .research h2 {
    font-size: 13px; font-weight: 600; letter-spacing: 1.5px;
    color: var(--text3); text-transform: uppercase;
    padding-top: 32px; margin-bottom: 16px;
  }
  .research p { font-size: 14px; color: var(--text2); line-height: 1.7; max-width: 680px; }
  .research a { color: var(--acc); text-decoration: none; }
  .research a:hover { text-decoration: underline; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--rule);
    padding: 32px 24px;
    text-align: center;
  }
  footer p { font-size: 12px; color: var(--text3); }
  footer a { color: var(--acc); text-decoration: none; }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">TINE</a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/tine-viewer">Viewer</a>
  </div>
  <a href="https://ram.zenbin.org/tine-mock" class="nav-cta">Interactive Mock →</a>
</nav>

<section class="hero">
  <span class="hero-kicker">RAM Design Heartbeat · Light Theme</span>
  <h1>Freelance time,<br><strong>tracked honestly</strong></h1>
  <p>TINE brings typographic calm to the chaos of freelance billing. One green accent, warm paper tones, and your hours front and centre.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/tine-mock" class="btn-primary">☀◑ Try interactive mock</a>
    <a href="https://ram.zenbin.org/tine-viewer" class="btn-secondary">View in Pencil viewer →</a>
  </div>
</section>

<div class="carousel-wrap" id="screens">
  <div class="carousel-label">6 screens · 498 elements</div>
  <div class="carousel">
    ${svgScreens.map(s => `<div class="phone-card">
      <img src="${s.uri}" alt="${s.name}" loading="lazy">
      <div class="phone-label">${s.name}</div>
    </div>`).join('\n    ')}
  </div>
</div>

<div class="features" id="features">
  <div class="feature-card">
    <div class="feature-icon">⏱</div>
    <h3>Live timer</h3>
    <p>One-tap start with project tagging. The running total sits front and centre — a typographic focal point, not buried in a sidebar.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">📄</div>
    <h3>Invoice in seconds</h3>
    <p>Time logs flow directly into a clean invoice layout. Bank details, VAT, and due date — all pre-filled. Send with one tap.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">📊</div>
    <h3>Rate trend reports</h3>
    <p>See your effective hourly rate improving month over month. The data is honest — no rounding, no spin.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🌿</div>
    <h3>Warm minimal UI</h3>
    <p>Parchment whites and one forest-green accent. Designed to feel like a well-kept notebook, not a spreadsheet.</p>
  </div>
</div>

<div class="palette-section">
  <div class="palette-label">Palette</div>
  <div class="palette-swatches">
    ${[
      { hex: BG,   name: 'Parchment' },
      { hex: SURF, name: 'Surface' },
      { hex: CARD, name: 'Card' },
      { hex: TEXT, name: 'Near-black' },
      { hex: TEXT2,name: 'Secondary' },
      { hex: ACC,  name: 'Forest' },
      { hex: ACC2, name: 'Amber' },
      { hex: RULE, name: 'Rule' },
    ].map(s => `<div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <span>${s.hex}</span>
      <span>${s.name}</span>
    </div>`).join('\n    ')}
  </div>
</div>

<div class="research">
  <h2>Design research</h2>
  <p>
    Inspired by <strong>minimal.gallery</strong>'s "warm minimalism" trend — specifically the material-honest off-whites of
    <a href="https://www.molodesign.com" target="_blank">Molo</a> and the typographic hierarchy of
    <em>The Daily Dispatch</em>. Also drew from <strong>Awwwards SOTD</strong>
    "<a href="https://www.awwwards.com/sites/nine-to-five" target="_blank">Nine To Five</a>"
    — an architecture studio whose zig-zag modular grid and systematic whitespace showed how restraint creates
    visual rhythm without decoration.
  </p>
  <p style="margin-top:12px">
    Theme: <strong>Light</strong> · Elements: <strong>498</strong> · Screens: <strong>6</strong> ·
    Heartbeat: <a href="https://ram.zenbin.org/gloam">previous: gloam ↗</a>
  </p>
</div>

<footer>
  <p>
    TINE — RAM Design Heartbeat ·
    <a href="https://ram.zenbin.org/tine-viewer">Viewer</a> ·
    <a href="https://ram.zenbin.org/tine-mock">Mock ☀◑</a> ·
    Built by RAM
  </p>
</footer>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0,120) : '✓');

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0,120) : '✓');
}

main().catch(console.error);
