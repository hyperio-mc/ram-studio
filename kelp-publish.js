'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'kelp';
const APP     = 'KELP';
const TAGLINE = 'grow quietly, one habit at a time';

const pen     = JSON.parse(fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8'));
const penJson = JSON.stringify(pen);
const P       = pen.metadata.palette;

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      port:     443,
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers:  {
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

// ── Hero page ───────────────────────────────────────────────────────────────
function svgDataUri(svgContent) {
  const encoded = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

function screenToSvg(screen, W = 390, H = 844) {
  const toSvgEl = el => {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
      const st = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${rx}"${op}${st}/>`;
    }
    if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const fw     = el.fontWeight || 400;
      const font   = el.fontFamily || 'Inter, system-ui, sans-serif';
      const op     = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
      const ls     = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : '';
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" text-anchor="${anchor}" font-weight="${fw}" font-family="${font}"${op}${ls}>${el.content}</text>`;
    }
    if (el.type === 'circle') {
      const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
      const st = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${op}${st}/>`;
    }
    if (el.type === 'line') {
      const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"${op}/>`;
    }
    return '';
  };
  const body = screen.elements.map(toSvgEl).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${body}\n</svg>`;
}

const screens = pen.screens;

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      ${P.bg};
    --surf:    ${P.surf};
    --card:    ${P.card};
    --text:    ${P.text};
    --muted:   ${P.muted};
    --acc:     ${P.acc};
    --acc2:    ${P.acc2};
    --border:  ${P.border};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; }

  /* Hero */
  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 24px 60px;
    position: relative;
    overflow: hidden;
  }
  .hero-grain {
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
  }
  .hero-tag {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--acc);
    background: rgba(27,107,92,0.1);
    border: 1px solid rgba(27,107,92,0.2);
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 28px;
  }
  .hero h1 {
    font-size: clamp(52px, 10vw, 88px);
    font-weight: 800;
    font-family: Georgia, serif;
    letter-spacing: -0.03em;
    line-height: 1.05;
    color: var(--text);
    margin-bottom: 20px;
  }
  .hero h1 span { color: var(--acc); }
  .hero-sub {
    font-size: clamp(16px, 3vw, 20px);
    color: var(--muted);
    max-width: 480px;
    line-height: 1.6;
    margin-bottom: 36px;
  }
  .cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc);
    color: #fff;
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-ghost {
    border: 1px solid var(--border);
    color: var(--text);
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    background: var(--surf);
    transition: background 0.2s;
  }
  .btn-ghost:hover { background: var(--card); }

  /* Screens carousel */
  .screens-section {
    padding: 80px 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--acc);
    margin-bottom: 16px;
  }
  .section-title {
    font-size: clamp(28px, 5vw, 44px);
    font-weight: 800;
    font-family: Georgia, serif;
    letter-spacing: -0.02em;
    margin-bottom: 48px;
    color: var(--text);
  }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  @media (max-width: 768px) {
    .screens-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .screens-grid { grid-template-columns: 1fr; }
  }
  .screen-card {
    background: var(--surf);
    border-radius: 20px;
    border: 1px solid var(--border);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .screen-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.08);
  }
  .screen-name {
    padding: 12px 16px;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
  }
  .screen-card img { width: 100%; display: block; }

  /* Features (bento-style) */
  .features-section {
    padding: 80px 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .bento-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto auto;
    gap: 16px;
  }
  @media (max-width: 640px) {
    .bento-grid { grid-template-columns: 1fr; }
  }
  .bento-card {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
  }
  .bento-card.accent {
    background: var(--acc);
    border-color: var(--acc);
    color: #fff;
  }
  .bento-card.span-2 { grid-column: span 2; }
  @media (max-width: 640px) {
    .bento-card.span-2 { grid-column: span 1; }
  }
  .bento-icon { font-size: 36px; margin-bottom: 16px; }
  .bento-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: inherit; }
  .bento-desc { font-size: 14px; line-height: 1.6; color: var(--muted); }
  .bento-card.accent .bento-desc { color: rgba(255,255,255,0.75); }
  .bento-card.accent .bento-title { color: #fff; }

  /* Palette */
  .palette-section {
    padding: 60px 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .swatches {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 24px;
  }
  .swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .swatch-box {
    width: 64px; height: 64px;
    border-radius: 14px;
    border: 1px solid var(--border);
  }
  .swatch-name { font-size: 10px; color: var(--muted); font-weight: 500; }
  .swatch-hex  { font-size: 10px; color: var(--text);  font-weight: 600; font-family: monospace; }

  /* Footer */
  footer {
    padding: 48px 24px;
    text-align: center;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 13px;
  }
  footer a { color: var(--acc); text-decoration: none; }
</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="hero-grain"></div>
  <div class="hero-tag">✦ RAM Heartbeat #${pen.metadata.heartbeat}</div>
  <h1>${APP}<br><span>quietly</span> growing</h1>
  <p class="hero-sub">${TAGLINE} — a habit tracker that breathes at a human pace, not the feed's</p>
  <div class="cta-row">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View in Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
</section>

<!-- SCREENS -->
<section class="screens-section">
  <div class="section-label">6 screens</div>
  <div class="section-title">Every moment of growth, held</div>
  <div class="screens-grid">
    ${screens.map(s => `
    <div class="screen-card">
      <div class="screen-name">${s.name}</div>
      <img src="${svgDataUri(screenToSvg(s))}" alt="${s.name} screen" loading="lazy">
    </div>`).join('')}
  </div>
</section>

<!-- FEATURES BENTO -->
<section class="features-section">
  <div class="section-label">Design decisions</div>
  <div class="section-title">Why KELP looks the way it looks</div>
  <div class="bento-grid">
    <div class="bento-card accent">
      <div class="bento-icon">⬛</div>
      <div class="bento-title">Bento dashboard, not a list</div>
      <div class="bento-desc">Inspired by the bento grid trend on land-book.com — the Today screen organises habits into asymmetric cards of different sizes, matching visual weight to habit importance.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🍃</div>
      <div class="bento-title">Earth-tone palette</div>
      <div class="bento-desc">Warm linen (#F4F1EC) base with a single deep teal accent — the two-colour restraint from minimal.gallery's top picks.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">📖</div>
      <div class="bento-title">Serif for numbers that matter</div>
      <div class="bento-desc">Georgia is used only on headline stats — streak counts, monthly scores — giving them editorial weight without affecting readability of body copy.</div>
    </div>
    <div class="bento-card span-2">
      <div class="bento-icon">🗓</div>
      <div class="bento-title">Calendar beats ring charts</div>
      <div class="bento-desc">The streak calendar on the detail screen shows the full month's effort as individual days — more honest and motivating than a single percentage. Each completed day becomes a small dot of colour.</div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section">
  <div class="section-label">Colour system</div>
  <div class="section-title">Warm, grounded, legible</div>
  <div class="swatches">
    ${Object.entries(P).map(([name, hex]) => hex.startsWith('#') ? `
    <div class="swatch">
      <div class="swatch-box" style="background:${hex}"></div>
      <div class="swatch-name">${name}</div>
      <div class="swatch-hex">${hex}</div>
    </div>` : '').join('')}
  </div>
</section>

<!-- FOOTER -->
<footer>
  <p>RAM Design Heartbeat #${pen.metadata.heartbeat} · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a> · <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a></p>
  <p style="margin-top:8px; opacity: 0.6">Inspired by bento grid layouts (land-book.com) and earth-tone restraint (minimal.gallery)</p>
</footer>

</body>
</html>`;

// ── Viewer ──────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
