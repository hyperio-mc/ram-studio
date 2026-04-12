'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'saffron';
const APP     = 'SAFFRON';
const TAGLINE = 'Recipe & Meal Planning';

// ── Publish helper ─────────────────────────────────────────────────────────
function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      port:     443,
      path:     `/v1/pages/${slug}`,
      method:   'POST',
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

// ── Load pen ───────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);

// ── Build SVG thumbnails from screen elements ──────────────────────────────
function buildScreenSVG(screen) {
  const W = screen.width  || 390;
  const H = screen.height || 844;

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const parts = [];
  for (const el of (screen.elements || [])) {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const op = el.opacity != null ? el.opacity : 1;
      const sw = el.strokeWidth || 0;
      const st = el.stroke && el.stroke !== 'none' ? `stroke="${esc(el.stroke)}" stroke-width="${sw}"` : '';
      parts.push(`<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${esc(el.fill)}" opacity="${op}" ${st}/>`);
    } else if (el.type === 'circle') {
      const op = el.opacity != null ? el.opacity : 1;
      const sw = el.strokeWidth || 0;
      const st = el.stroke && el.stroke !== 'none' ? `stroke="${esc(el.stroke)}" stroke-width="${sw}"` : '';
      parts.push(`<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${esc(el.fill)}" opacity="${op}" ${st}/>`);
    } else if (el.type === 'text') {
      const op  = el.opacity != null ? el.opacity : 1;
      const fw  = el.fontWeight || 400;
      const anch = el.textAnchor || 'start';
      const ls  = el.letterSpacing || 0;
      const ff  = esc(el.fontFamily || 'Georgia, serif');
      parts.push(`<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${esc(el.fill)}" font-weight="${fw}" font-family="${ff}" text-anchor="${anch}" letter-spacing="${ls}" opacity="${op}">${esc(el.content)}</text>`);
    } else if (el.type === 'line') {
      const op = el.opacity != null ? el.opacity : 1;
      const sw = el.strokeWidth || 1;
      parts.push(`<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${esc(el.stroke)}" stroke-width="${sw}" opacity="${op}"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${parts.join('')}</svg>`;
}

// ── Hero page ──────────────────────────────────────────────────────────────
const screenSVGs = pen.screens.map(buildScreenSVG);
const screenDataURIs = screenSVGs.map(svg => {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
});

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP} — ${TAGLINE}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #FAF6EE;
      --surf:    #FFFFFF;
      --card:    #F2EBD9;
      --card2:   #EEF4EC;
      --text:    #1E1712;
      --textMed: #5C4A3A;
      --textMut: #9E8878;
      --accent:  #C4420F;
      --accent2: #3B6B4A;
      --accentLt:#F5D5C5;
      --greenLt: #C8DFC0;
      --stroke:  #E8DFD0;
      --tag1:    #F9E4B7;
      --tag2:    #D4EDD4;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Georgia', serif;
      overflow-x: hidden;
    }

    /* ── NAV ── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(250,246,238,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--stroke);
      height: 60px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 40px;
    }
    .nav-logo {
      font-size: 18px; font-weight: 700; letter-spacing: 3px;
      color: var(--text);
    }
    .nav-logo span { color: var(--accent); }
    .nav-links { display: flex; gap: 32px; font-family: system-ui, sans-serif; font-size: 13px; color: var(--textMut); }
    .nav-links a { text-decoration: none; color: inherit; transition: color 0.2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      background: var(--accent); color: #fff;
      border: none; cursor: pointer;
      padding: 8px 20px; border-radius: 20px;
      font-family: system-ui, sans-serif; font-size: 13px; font-weight: 700;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .nav-cta:hover { opacity: 0.85; }

    /* ── HERO ── */
    .hero {
      padding: 140px 40px 80px;
      max-width: 1100px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 60px; align-items: center;
    }
    .hero-kicker {
      font-family: system-ui, sans-serif;
      font-size: 11px; font-weight: 700; letter-spacing: 3px;
      color: var(--accent); text-transform: uppercase;
      margin-bottom: 16px;
    }
    .hero h1 {
      font-size: clamp(40px, 5vw, 72px);
      font-weight: 700; line-height: 1.1;
      color: var(--text);
    }
    .hero h1 em {
      color: var(--accent2); font-style: normal;
    }
    .hero-sub {
      font-family: system-ui, sans-serif;
      font-size: 16px; line-height: 1.65;
      color: var(--textMed); margin: 24px 0 36px;
    }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
    .btn-primary {
      background: var(--accent); color: #fff;
      padding: 14px 28px; border-radius: 28px;
      font-family: system-ui, sans-serif; font-size: 14px; font-weight: 700;
      text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 20px rgba(196,66,15,0.3);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(196,66,15,0.35); }
    .btn-secondary {
      color: var(--textMed); font-family: system-ui, sans-serif; font-size: 14px;
      text-decoration: none; border-bottom: 1px solid var(--stroke);
      padding-bottom: 2px; transition: color 0.2s, border-color 0.2s;
    }
    .btn-secondary:hover { color: var(--accent); border-color: var(--accent); }

    /* phone mockup */
    .hero-phone {
      position: relative;
      display: flex; justify-content: center;
    }
    .phone-shell {
      width: 240px; height: 520px;
      background: var(--text);
      border-radius: 36px;
      padding: 10px;
      box-shadow: 0 30px 80px rgba(30,23,18,0.18), 0 0 0 1px rgba(30,23,18,0.06);
      position: relative;
    }
    .phone-inner {
      width: 100%; height: 100%;
      border-radius: 28px;
      overflow: hidden;
      background: var(--bg);
    }
    .phone-inner img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
    .phone-notch {
      position: absolute; top: 18px; left: 50%; transform: translateX(-50%);
      width: 60px; height: 6px; background: var(--text);
      border-radius: 3px; z-index: 10;
    }

    /* ── STATS STRIP ── */
    .stats {
      background: var(--surf);
      border-top: 1px solid var(--stroke);
      border-bottom: 1px solid var(--stroke);
      padding: 32px 40px;
    }
    .stats-inner {
      max-width: 1100px; margin: 0 auto;
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
      text-align: center;
    }
    .stat-val {
      font-size: 36px; font-weight: 700; color: var(--text);
    }
    .stat-val span { color: var(--accent); }
    .stat-label {
      font-family: system-ui, sans-serif; font-size: 12px;
      color: var(--textMut); margin-top: 4px; letter-spacing: 0.5px;
    }

    /* ── SCREENS CAROUSEL ── */
    .screens-section {
      padding: 80px 0;
    }
    .section-header {
      max-width: 1100px; margin: 0 auto 40px; padding: 0 40px;
    }
    .section-kicker {
      font-family: system-ui, sans-serif;
      font-size: 11px; font-weight: 700; letter-spacing: 3px;
      color: var(--accent); margin-bottom: 12px;
    }
    .section-title {
      font-size: 32px; font-weight: 700; color: var(--text);
    }
    .screens-scroll {
      display: flex; gap: 24px;
      padding: 20px 40px 40px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .screens-scroll::-webkit-scrollbar { display: none; }
    .screen-card {
      flex: 0 0 200px;
      scroll-snap-align: start;
    }
    .screen-thumb {
      width: 200px; height: 432px;
      background: var(--surf);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid var(--stroke);
      box-shadow: 0 8px 24px rgba(30,23,18,0.07);
      transition: transform 0.25s, box-shadow 0.25s;
      cursor: pointer;
    }
    .screen-thumb:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(30,23,18,0.12); }
    .screen-thumb img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
    .screen-label {
      font-family: system-ui, sans-serif; font-size: 12px;
      color: var(--textMut); margin-top: 12px; text-align: center;
    }

    /* ── FEATURES ── */
    .features {
      background: var(--surf);
      border-top: 1px solid var(--stroke);
      padding: 80px 40px;
    }
    .features-inner { max-width: 1100px; margin: 0 auto; }
    .features-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
      margin-top: 48px;
    }
    .feature-card {
      background: var(--bg); border: 1px solid var(--stroke);
      border-radius: 16px; padding: 28px;
      transition: box-shadow 0.2s;
    }
    .feature-card:hover { box-shadow: 0 8px 24px rgba(30,23,18,0.07); }
    .feature-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; margin-bottom: 16px;
    }
    .feature-title {
      font-size: 17px; font-weight: 700; margin-bottom: 8px; color: var(--text);
    }
    .feature-desc {
      font-family: system-ui, sans-serif;
      font-size: 13px; line-height: 1.65; color: var(--textMed);
    }

    /* ── PALETTE ── */
    .palette-section {
      padding: 80px 40px;
      max-width: 1100px; margin: 0 auto;
    }
    .palette-swatches {
      display: flex; gap: 16px; flex-wrap: wrap; margin-top: 32px;
    }
    .swatch {
      width: 100px; border-radius: 12px; overflow: hidden;
      border: 1px solid var(--stroke);
    }
    .swatch-color { height: 72px; }
    .swatch-info {
      padding: 10px 12px; background: var(--surf);
      font-family: system-ui, sans-serif;
    }
    .swatch-name { font-size: 11px; font-weight: 700; color: var(--text); }
    .swatch-hex  { font-size: 10px; color: var(--textMut); margin-top: 2px; }

    /* ── FOOTER ── */
    footer {
      background: var(--text);
      color: rgba(255,255,255,0.7);
      padding: 48px 40px;
      font-family: system-ui, sans-serif; font-size: 13px;
    }
    .footer-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 20px;
    }
    .footer-brand { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: 2px; }
    .footer-links { display: flex; gap: 24px; }
    .footer-links a { color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: #fff; }
    .footer-credit { color: rgba(255,255,255,0.4); font-size: 11px; }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; gap: 40px; padding: 100px 20px 60px; }
      .hero-phone { display: none; }
      .features-grid { grid-template-columns: 1fr; }
      .stats-inner { grid-template-columns: 1fr 1fr; }
      nav { padding: 0 20px; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-logo">SA<span>FF</span>RON</div>
  <div class="nav-links">
    <a href="#">Screens</a>
    <a href="#">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">Explore Mock →</a>
</nav>

<section class="hero">
  <div class="hero-copy">
    <div class="hero-kicker">RAM Design Heartbeat #${pen.metadata.heartbeat}</div>
    <h1>Cook with <em>intention</em>, eat with joy.</h1>
    <p class="hero-sub">SAFFRON is a recipe and meal planning app built around the earthy rhythms of seasonal cooking. Plan meals, track your pantry, and discover recipes curated by chefs who love real food.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">Try Interactive Mock →</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-viewer">View in Pencil.dev</a>
    </div>
  </div>
  <div class="hero-phone">
    <div class="phone-shell">
      <div class="phone-notch"></div>
      <div class="phone-inner">
        <img src="${screenDataURIs[0]}" alt="Today's Plan screen">
      </div>
    </div>
  </div>
</section>

<div class="stats">
  <div class="stats-inner">
    <div>
      <div class="stat-val">6</div>
      <div class="stat-label">SCREENS DESIGNED</div>
    </div>
    <div>
      <div class="stat-val">${pen.metadata.elements}</div>
      <div class="stat-label">DESIGN ELEMENTS</div>
    </div>
    <div>
      <div class="stat-val"><span>4,200+</span></div>
      <div class="stat-label">RECIPES IN CONCEPT</div>
    </div>
    <div>
      <div class="stat-val">HB<span>${pen.metadata.heartbeat}</span></div>
      <div class="stat-label">HEARTBEAT NUMBER</div>
    </div>
  </div>
</div>

<section class="screens-section">
  <div class="section-header">
    <div class="section-kicker">ALL SCREENS</div>
    <h2 class="section-title">Six screens, one cohesive story</h2>
  </div>
  <div class="screens-scroll">
    ${pen.screens.map((sc, i) => `
    <div class="screen-card">
      <div class="screen-thumb">
        <img src="${screenDataURIs[i]}" alt="${sc.name}">
      </div>
      <div class="screen-label">${i + 1}. ${sc.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <div class="features-inner">
    <div class="section-kicker">DESIGN DECISIONS</div>
    <h2 class="section-title">What makes SAFFRON distinct</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon" style="background:#F2EBD9;">🎨</div>
        <div class="feature-title">Earthy Palette, Zero Stock</div>
        <div class="feature-desc">Inspired by Land-book's earthy/sustainable palette trend. Color blocks replace photography entirely — paprika orange (#C4420F) and herb green (#3B6B4A) carry the visual weight, echoing Minimal.gallery's typography-as-brand philosophy seen in KOMETA Typefaces.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:#EEF4EC;">📖</div>
        <div class="feature-title">Editorial Type Hierarchy</div>
        <div class="feature-desc">Georgia serif for content names and headings, system-ui for data labels and metadata. A deliberate contrast that signals "real recipe" versus "interface chrome" — borrowed from the book/text culture aesthetics trend at Minimal.gallery.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:#FCE3D8;">📊</div>
        <div class="feature-title">Soft Left-Border Cards</div>
        <div class="feature-desc">Meal cards use a 4–6px colored left border to convey status without heavy visual noise — done/skipped/upcoming read at a glance. Keeps information density high while the cream background maintains warmth and calm.</div>
      </div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-kicker">PALETTE</div>
  <h2 class="section-title">Warm Parchment — Light</h2>
  <div class="palette-swatches">
    ${[
      { name: 'Parchment BG', hex: '#FAF6EE', color: '#FAF6EE' },
      { name: 'Surface', hex: '#FFFFFF', color: '#FFFFFF' },
      { name: 'Warm Card', hex: '#F2EBD9', color: '#F2EBD9' },
      { name: 'Sage Card', hex: '#EEF4EC', color: '#EEF4EC' },
      { name: 'Ink Text', hex: '#1E1712', color: '#1E1712' },
      { name: 'Paprika', hex: '#C4420F', color: '#C4420F' },
      { name: 'Herb Green', hex: '#3B6B4A', color: '#3B6B4A' },
      { name: 'Warm Stroke', hex: '#E8DFD0', color: '#E8DFD0' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.color};"></div>
      <div class="swatch-info">
        <div class="swatch-name">${s.name}</div>
        <div class="swatch-hex">${s.hex}</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div class="footer-inner">
    <div class="footer-brand">SAFFRON</div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
    </div>
    <div class="footer-credit">RAM Design Heartbeat #${pen.metadata.heartbeat} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>
</footer>

</body>
</html>`;

// ── Inject pen into viewer ─────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero page…');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status}  https://ram.zenbin.org/${SLUG}`);
  if (r1.status !== 200 && r1.status !== 201) console.log('  body:', r1.body.slice(0, 200));

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status}  https://ram.zenbin.org/${SLUG}-viewer`);
  if (r2.status !== 200 && r2.status !== 201) console.log('  body:', r2.body.slice(0, 200));
}
main().catch(console.error);
