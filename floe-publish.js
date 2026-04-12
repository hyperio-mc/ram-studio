'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'floe';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram'
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);
const P = pen.metadata.palette;

// Palette aliases
const BG      = P.bg;
const SURF    = P.surf;
const CARD    = P.card;
const BORDER  = P.border;
const TEXT    = P.text;
const TEXT2   = P.text2;
const MUTED   = P.muted;
const ACC     = P.accent;
const ACC2    = P.accent2;
const TAG     = P.tag;

// Build SVG thumbnail data URIs
function screenToDataUri(screen) {
  const svgParts = screen.elements.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'text') {
      const content = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'sans-serif'}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity||1}">${content}</text>`;
    } else if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
    }
    return '';
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">${svgParts}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const screenUris = pen.screens.map(s => screenToDataUri(s));
const screenNames = pen.screens.map(s => s.name);

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FLOE — Read Slower. Think Deeper.</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG}; --surf: ${SURF}; --card: ${CARD};
    --border: ${BORDER}; --text: ${TEXT}; --text2: ${TEXT2};
    --muted: ${MUTED}; --acc: ${ACC}; --acc2: ${ACC2}; --tag: ${TAG};
  }
  html { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
  body { min-height: 100vh; overflow-x: hidden; }

  /* Subtle paper texture overlay */
  body::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    opacity: 0.4;
  }

  /* Ruled lines — editorial reference */
  body::after {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: repeating-linear-gradient(
      transparent, transparent 27px,
      rgba(164,154,141,0.06) 27px, rgba(164,154,141,0.06) 28px
    );
  }

  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(250,247,242,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    height: 60px;
  }
  nav .inner {
    max-width: 1100px; margin: 0 auto; padding: 0 24px;
    height: 100%; display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo {
    font-family: 'Lora', serif; font-weight: 700; font-size: 20px;
    color: var(--text); letter-spacing: -0.5px;
  }
  .nav-logo span { color: var(--acc); }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { color: var(--text2); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--acc); }
  .nav-cta {
    background: var(--acc); color: #fff;
    padding: 8px 20px; border-radius: 20px; border: none; cursor: pointer;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* ── HERO ── */
  .hero {
    padding: 140px 0 80px;
    text-align: center;
  }
  .hero-eyebrow {
    display: inline-block;
    font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--acc); background: rgba(58,90,62,0.08);
    padding: 6px 16px; border-radius: 20px; margin-bottom: 28px;
    border: 1px solid rgba(58,90,62,0.15);
  }
  .hero-title {
    font-family: 'Lora', serif; font-size: clamp(48px, 7vw, 88px); font-weight: 700;
    line-height: 1.08; letter-spacing: -2px; color: var(--text);
    margin-bottom: 28px;
  }
  .hero-title em { font-style: italic; color: var(--acc2); }
  .hero-sub {
    font-size: 19px; color: var(--text2); max-width: 540px; margin: 0 auto 44px;
    line-height: 1.65; font-weight: 400; font-family: 'Lora', serif; font-style: italic;
  }
  .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 60px; }
  .btn-primary {
    background: var(--acc); color: #fff;
    padding: 14px 32px; border-radius: 28px; font-size: 15px; font-weight: 600;
    text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(58,90,62,0.25);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(58,90,62,0.3); }
  .btn-secondary {
    background: transparent; color: var(--text); border: 1.5px solid var(--border);
    padding: 14px 32px; border-radius: 28px; font-size: 15px; font-weight: 500;
    text-decoration: none; cursor: pointer; transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: var(--acc); color: var(--acc); }

  /* ── SCREEN CAROUSEL ── */
  .screens-section { padding: 40px 0 80px; }
  .screens-label {
    text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted); margin-bottom: 36px;
  }
  .screens-scroll {
    display: flex; gap: 20px; overflow-x: auto; padding: 16px 24px 32px;
    scroll-snap-type: x mandatory; scrollbar-width: none;
  }
  .screens-scroll::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 auto; scroll-snap-align: center;
    width: 200px;
    border-radius: 24px; overflow: hidden;
    border: 1.5px solid var(--border);
    box-shadow: 0 8px 32px rgba(28,24,21,0.08);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
  }
  .screen-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 48px rgba(28,24,21,0.14); }
  .screen-card img { width: 100%; height: auto; display: block; }
  .screen-label {
    background: var(--surf); padding: 8px 12px;
    font-size: 11px; font-weight: 600; color: var(--text2); letter-spacing: 0.5px;
    border-top: 1px solid var(--border); text-align: center;
  }

  /* ── PITCH SECTION ── */
  .pitch { padding: 80px 0; }
  .pitch-inner {
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  @media (max-width: 700px) { .pitch-inner { grid-template-columns: 1fr; gap: 40px; } }
  .pitch-text .eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--acc2); margin-bottom: 18px;
  }
  .pitch-heading {
    font-family: 'Lora', serif; font-size: 38px; font-weight: 700;
    line-height: 1.2; letter-spacing: -0.8px; color: var(--text); margin-bottom: 20px;
  }
  .pitch-body { font-size: 16px; color: var(--text2); line-height: 1.75; font-family: 'Lora', serif; }
  .pull-quote {
    border-left: 3px solid var(--acc2); padding: 20px 24px;
    background: rgba(193,123,58,0.05); border-radius: 0 12px 12px 0;
    font-family: 'Lora', serif; font-size: 18px; font-style: italic;
    color: var(--text); line-height: 1.6; margin: 32px 0 0;
  }
  .pull-quote cite { display: block; margin-top: 10px; font-size: 12px; font-style: normal; color: var(--muted); }

  /* ── FEATURES ── */
  .features { padding: 80px 0; }
  .features-heading {
    font-family: 'Lora', serif; font-size: 36px; font-weight: 700;
    text-align: center; margin-bottom: 56px; letter-spacing: -0.8px;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }
  .feature-card {
    background: var(--surf); border: 1.5px solid var(--border);
    border-radius: 20px; padding: 32px 28px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .feature-card:hover { border-color: var(--acc); box-shadow: 0 4px 24px rgba(58,90,62,0.08); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(58,90,62,0.1); border: 1px solid rgba(58,90,62,0.18);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 18px;
  }
  .feature-icon.amber { background: rgba(193,123,58,0.1); border-color: rgba(193,123,58,0.2); }
  .feature-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: var(--text2); line-height: 1.65; }

  /* ── PALETTE ── */
  .palette-section { padding: 60px 0; }
  .palette-heading {
    font-family: 'Lora', serif; font-size: 28px; font-weight: 700;
    margin-bottom: 32px; letter-spacing: -0.5px;
  }
  .palette-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .swatch { border-radius: 14px; overflow: hidden; border: 1.5px solid var(--border); }
  .swatch-color { width: 80px; height: 80px; }
  .swatch-label { padding: 8px; background: var(--surf); }
  .swatch-name { font-size: 11px; font-weight: 700; color: var(--text); }
  .swatch-hex { font-size: 10px; color: var(--muted); font-family: monospace; }

  /* ── STATS ── */
  .stats { padding: 60px 0; text-align: center; }
  .stats-row { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-top: 36px; }
  .stat-card {
    background: var(--surf); border: 1.5px solid var(--border); border-radius: 20px;
    padding: 28px 36px; min-width: 160px;
  }
  .stat-val { font-family: 'Lora', serif; font-size: 40px; font-weight: 700; color: var(--acc); }
  .stat-label { font-size: 13px; color: var(--text2); margin-top: 4px; }

  /* ── LINKS ── */
  .links-section {
    padding: 40px 0 48px; border-top: 1px solid var(--border);
    display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
  }
  .links-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); }
  .link-pill {
    background: var(--surf); border: 1.5px solid var(--border);
    color: var(--acc); padding: 8px 18px; border-radius: 20px;
    font-size: 13px; font-weight: 600; text-decoration: none;
    transition: all 0.2s;
  }
  .link-pill:hover { background: var(--acc); color: #fff; border-color: var(--acc); }

  /* ── FOOTER ── */
  footer {
    padding: 32px 0; border-top: 1px solid var(--border);
    text-align: center; color: var(--muted); font-size: 13px;
  }
  footer span { color: var(--acc); }
</style>
</head>
<body>

<nav>
  <div class="inner">
    <div class="nav-logo">FL<span>OE</span></div>
    <div class="nav-links">
      <a href="#screens">Screens</a>
      <a href="#features">Features</a>
      <a href="#palette">Palette</a>
    </div>
    <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-viewer">View Design →</a>
  </div>
</nav>

<div class="hero">
  <div class="container">
    <div class="hero-eyebrow">Design Heartbeat #43 · Light Theme</div>
    <h1 class="hero-title">Read Slower.<br><em>Think Deeper.</em></h1>
    <p class="hero-sub">FLOE is a slow-reading companion app — a focused space to save long reads, enter flow state, and hold onto what matters.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">View in Viewer</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
    </div>
  </div>
</div>

<div id="screens" class="screens-section">
  <div class="screens-label">6 Screens · 500 Elements · Editorial Light Theme</div>
  <div class="screens-scroll">
    ${screenUris.map((uri, i) => `
    <div class="screen-card">
      <img src="${uri}" alt="${screenNames[i]}" loading="lazy">
      <div class="screen-label">${screenNames[i]}</div>
    </div>`).join('')}
  </div>
</div>

<section id="features" class="features">
  <div class="container">
    <h2 class="features-heading">Designed for the long read</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">◎</div>
        <div class="feature-title">Focus Mode</div>
        <div class="feature-desc">A distraction-free reading experience with drop-cap typography, session timer, and margin annotations — the article fills your world.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon amber">✎</div>
        <div class="feature-title">Living Highlights</div>
        <div class="feature-desc">Colour-coded highlights that carry context — tag as insight, question, or memorable. Export to Markdown when you're ready to write.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⌂</div>
        <div class="feature-title">Slow Library</div>
        <div class="feature-desc">Curated saving, not hoarding. FLOE surfaces your most-worth-reading saves, tracks your streak, and gently surfaces what's been waiting too long.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◈</div>
        <div class="feature-title">Note-to-Self</div>
        <div class="feature-desc">Inline notes attached to passages. Not a PKM system — just honest jottings beside the words that moved you.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon amber">◷</div>
        <div class="feature-title">Reading Pulse</div>
        <div class="feature-desc">A minimal stats view showing reading pace, genre balance, and streaks. No gamification — just honest reflection on your reading life.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◎</div>
        <div class="feature-title">Editorial Discover</div>
        <div class="feature-desc">Curated long reads and essays — no social feed. Sourced from the Atlantic, The New Yorker, Aeon, n+1, and 40+ quality publishers.</div>
      </div>
    </div>
  </div>
</section>

<section class="pitch">
  <div class="container">
    <div class="pitch-inner">
      <div class="pitch-text">
        <div class="eyebrow">The Design Thinking</div>
        <h2 class="pitch-heading">Typography IS the interface</h2>
        <p class="pitch-body">
          Inspired by the serif font surge on lapa.ninja — 290+ curated examples showing editorial reading tools adopting large serif displays, generous leading, and ink-on-paper colour palettes. FLOE pushes that aesthetic to its logical conclusion: the reading experience is the product.
        </p>
        <blockquote class="pull-quote">
          "The clay remembers what we have forgotten."
          <cite>— Featured article, The New Yorker</cite>
        </blockquote>
      </div>
      <div>
        ${screenUris[2] ? `<div class="screen-card" style="width:100%;max-width:260px;margin:0 auto;">
          <img src="${screenUris[2]}" alt="Focus Mode">
          <div class="screen-label">Focus Mode</div>
        </div>` : ''}
      </div>
    </div>
  </div>
</section>

<section id="palette" class="palette-section">
  <div class="container">
    <h2 class="palette-heading">Warm Cream Editorial Palette</h2>
    <div class="palette-row">
      ${[
        { color: BG, name: 'Paper', hex: BG },
        { color: SURF, name: 'White Card', hex: SURF },
        { color: CARD, name: 'Warm Card', hex: CARD },
        { color: ACC, name: 'Forest Ink', hex: ACC },
        { color: ACC2, name: 'Amber Bronze', hex: ACC2 },
        { color: BORDER, name: 'Border', hex: BORDER },
        { color: MUTED, name: 'Muted Warm', hex: MUTED },
      ].map(s => `
      <div class="swatch">
        <div class="swatch-color" style="background:${s.color};"></div>
        <div class="swatch-label">
          <div class="swatch-name">${s.name}</div>
          <div class="swatch-hex">${s.hex}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="stats">
  <div class="container">
    <h2 class="features-heading">By the numbers</h2>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-val">6</div><div class="stat-label">Screens</div></div>
      <div class="stat-card"><div class="stat-val">500</div><div class="stat-label">Elements</div></div>
      <div class="stat-card"><div class="stat-val">#43</div><div class="stat-label">Heartbeat</div></div>
      <div class="stat-card"><div class="stat-val">Light</div><div class="stat-label">Theme</div></div>
    </div>
  </div>
</section>

<div class="container">
  <div class="links-section">
    <span class="links-label">Explore →</span>
    <a class="link-pill" href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a>
    <a class="link-pill" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
  </div>
</div>

<footer>
  <p>FLOE · RAM Design Heartbeat #43 · April 2026 · Inspired by <span>lapa.ninja</span> serif editorial trend</p>
</footer>

</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'FLOE — Read Slower. Think Deeper.');
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'FLOE — Pencil Viewer');
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 120)}`);
}

main().catch(console.error);
