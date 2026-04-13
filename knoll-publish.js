'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'knoll';
const NAME = 'KNOLL';
const TAGLINE = 'Research, connected';

// Warm editorial palette (light)
const BG      = '#F9F6F2';
const ACC     = '#C4522A';
const ACC2    = '#2E4A3A';
const AMBER   = '#E8A838';
const TEXT    = '#1C1917';
const MUTED   = '#7A6E68';
const CARD    = '#F1EDE6';
const SURF    = '#FFFFFF';

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

const penJson  = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen      = JSON.parse(penJson);
const screens  = pen.screens;

// ── SVG thumbnail helper ───────────────────────────────────────────────────
function encodeScreenSVG(screen) {
  const W = 390, H = 844;
  let svgBody = '';
  (screen.elements || []).forEach(el => {
    if (el.type === 'rect') {
      svgBody += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||1}"/>`;
    } else if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const fw = el.fontWeight || 400;
      const ff = el.fontFamily || 'Inter';
      const fs_val = el.fontSize || 14;
      const italic = el.fontStyle === 'italic' ? 'italic' : 'normal';
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      svgBody += `<text x="${el.x}" y="${el.y}" font-size="${fs_val}" fill="${el.fill}" font-weight="${fw}" font-family="${ff}" text-anchor="${anchor}" font-style="${italic}" opacity="${opacity}" letter-spacing="${el.letterSpacing||0}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      svgBody += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||1}"/>`;
    } else if (el.type === 'line') {
      svgBody += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity!==undefined?el.opacity:1}"/>`;
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${svgBody}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const screenDataURIs = screens.map(encodeScreenSVG);

// ── Hero HTML ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG};
    --surf: ${SURF};
    --card: ${CARD};
    --acc: ${ACC};
    --acc2: ${ACC2};
    --amber: ${AMBER};
    --text: ${TEXT};
    --muted: ${MUTED};
    --border: rgba(28,25,23,0.10);
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(249,246,242,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
  }
  .nav-logo { font-family: 'Lora', serif; font-size: 20px; font-weight: 600; color: var(--text); letter-spacing: -0.5px; }
  .nav-logo span { color: var(--acc); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--acc); color: #fff; border: none; border-radius: 20px;
    padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif; transition: opacity 0.2s;
    text-decoration: none;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* ── HERO ── */
  .hero {
    padding: 140px 40px 80px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--card); border: 1px solid var(--border); border-radius: 20px;
    padding: 5px 14px; margin-bottom: 24px;
    font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 0.8px; text-transform: uppercase;
  }
  .hero-eyebrow-dot { width: 6px; height: 6px; background: var(--acc); border-radius: 50%; }
  h1 {
    font-family: 'Lora', serif; font-size: 56px; font-weight: 600; line-height: 1.12;
    color: var(--text); letter-spacing: -1px; margin-bottom: 22px;
  }
  h1 em { font-style: italic; color: var(--acc); }
  .hero-sub {
    font-size: 18px; line-height: 1.65; color: var(--muted); margin-bottom: 36px; max-width: 440px;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; }
  .btn-primary {
    background: var(--acc); color: #fff; border-radius: 24px;
    padding: 12px 28px; font-size: 14px; font-weight: 600;
    text-decoration: none; transition: opacity 0.2s; display: inline-block;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-secondary {
    color: var(--text); font-size: 14px; font-weight: 500; text-decoration: none;
    border: 1px solid var(--border); border-radius: 24px; padding: 12px 24px;
    transition: border-color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--acc); color: var(--acc); }

  /* ── SCREEN CAROUSEL ── */
  .screen-stack {
    position: relative; height: 520px;
  }
  .screen-stack img {
    position: absolute; border-radius: 20px; box-shadow: 0 20px 60px rgba(28,25,23,0.12);
    border: 1px solid var(--border);
  }
  .screen-stack img:nth-child(1) { width: 240px; top: 0; left: 20px; z-index: 3; transform: rotate(-2deg); }
  .screen-stack img:nth-child(2) { width: 220px; top: 40px; left: 160px; z-index: 2; transform: rotate(2.5deg); }
  .screen-stack img:nth-child(3) { width: 200px; top: 80px; left: 80px; z-index: 1; transform: rotate(-1deg); opacity: 0.6; }

  /* ── STATS BAND ── */
  .stats-band {
    background: var(--text); color: #fff;
    padding: 36px 40px;
    display: flex; justify-content: center; gap: 80px;
  }
  .stat { text-align: center; }
  .stat-val { font-family: 'Lora', serif; font-size: 36px; font-weight: 600; color: var(--acc); display: block; }
  .stat-label { font-size: 12px; color: rgba(255,255,255,0.55); letter-spacing: 0.6px; text-transform: uppercase; margin-top: 4px; }

  /* ── FEATURE BENTO ── */
  .section { max-width: 1100px; margin: 0 auto; padding: 80px 40px; }
  .section-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
    color: var(--acc); margin-bottom: 12px;
  }
  .section-title { font-family: 'Lora', serif; font-size: 40px; font-weight: 600; line-height: 1.2; color: var(--text); margin-bottom: 16px; }
  .section-sub { font-size: 16px; color: var(--muted); line-height: 1.65; margin-bottom: 48px; max-width: 520px; }

  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: 16px;
  }
  .bento-card {
    background: var(--surf); border: 1px solid var(--border); border-radius: 16px;
    padding: 28px; transition: transform 0.2s, box-shadow 0.2s;
  }
  .bento-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(28,25,23,0.08); }
  .bento-card.wide  { grid-column: span 2; }
  .bento-card.tall  { grid-row:    span 2; }
  .bento-card.accent-card { background: var(--acc); color: #fff; }
  .bento-card.forest-card { background: var(--acc2); color: #fff; }

  .bento-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--card); display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 20px;
  }
  .bento-card.accent-card .bento-icon { background: rgba(255,255,255,0.18); }
  .bento-card.forest-card .bento-icon { background: rgba(255,255,255,0.18); }
  .bento-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .bento-card.accent-card .bento-label,
  .bento-card.forest-card .bento-label { color: rgba(255,255,255,0.6); }
  .bento-title { font-family: 'Lora', serif; font-size: 20px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
  .bento-card.accent-card .bento-title,
  .bento-card.forest-card .bento-title { color: #fff; }
  .bento-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }
  .bento-card.accent-card .bento-desc,
  .bento-card.forest-card .bento-desc { color: rgba(255,255,255,0.72); }

  .bento-big-val {
    font-family: 'Lora', serif; font-size: 64px; font-weight: 600; color: var(--acc);
    line-height: 1; margin: 16px 0 8px;
  }
  .bento-card.forest-card .bento-big-val { color: #fff; }

  /* ── SCREENS GALLERY ── */
  .screens-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
  .screens-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  }
  .screen-card {
    background: var(--surf); border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .screen-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(28,25,23,0.10); }
  .screen-card img { width: 100%; display: block; }
  .screen-label { padding: 14px 16px; font-size: 12px; font-weight: 500; color: var(--muted); }

  /* ── PALETTE ── */
  .palette-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
  .palette-row { display: flex; gap: 12px; margin-top: 24px; }
  .swatch { flex: 1; height: 80px; border-radius: 12px; position: relative; overflow: hidden; }
  .swatch-label {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 8px 12px; background: rgba(0,0,0,0.15);
    font-size: 10px; color: rgba(255,255,255,0.9); font-weight: 600;
  }
  .swatch-dark .swatch-label { background: rgba(255,255,255,0.2); color: rgba(0,0,0,0.7); }

  /* ── QUOTE ── */
  .quote-section {
    background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 60px 40px; text-align: center;
  }
  .quote-mark { font-family: 'Lora', serif; font-size: 80px; color: var(--acc); opacity: 0.2; line-height: 0.7; margin-bottom: 8px; }
  blockquote { font-family: 'Lora', serif; font-size: 22px; font-style: italic; color: var(--text); max-width: 700px; margin: 0 auto 16px; line-height: 1.6; }
  .quote-attr { font-size: 13px; color: var(--muted); }

  /* ── LINKS SECTION ── */
  .links-section { max-width: 1100px; margin: 0 auto; padding: 60px 40px; }
  .links-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .link-card {
    background: var(--surf); border: 1px solid var(--border); border-radius: 14px;
    padding: 24px; text-decoration: none; transition: transform 0.2s;
  }
  .link-card:hover { transform: translateY(-2px); }
  .link-icon { font-size: 24px; margin-bottom: 12px; display: block; }
  .link-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .link-sub { font-size: 12px; color: var(--muted); }
  .link-url { font-size: 11px; color: var(--acc); margin-top: 10px; }

  /* ── FOOTER ── */
  footer {
    background: var(--text); color: rgba(255,255,255,0.5);
    text-align: center; padding: 32px 40px;
    font-size: 12px; letter-spacing: 0.3px;
  }
  footer a { color: rgba(255,255,255,0.5); text-decoration: none; }
  footer strong { color: rgba(255,255,255,0.8); }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo">K<span>N</span>OLL</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/knoll-viewer">Viewer</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/knoll-mock">Try Mock ☀◑</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow"><span class="hero-eyebrow-dot"></span> RAM Design Heartbeat #469</div>
    <h1>Research,<br><em>connected</em><br>and calm.</h1>
    <p class="hero-sub">
      KNOLL is a personal research workspace built for curious minds —
      where reading, writing, and synthesis finally live in one place,
      with an editorial warmth that respects the depth of your thinking.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/knoll-viewer" class="btn-primary">Open Viewer</a>
      <a href="https://ram.zenbin.org/knoll-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="screen-stack">
    <img src="${screenDataURIs[0]}" alt="Today dashboard" title="Bento dashboard">
    <img src="${screenDataURIs[1]}" alt="Explore screen" title="Editorial research grid">
    <img src="${screenDataURIs[2]}" alt="Write screen" title="Document editor">
  </div>
</section>

<!-- STATS BAND -->
<div class="stats-band">
  <div class="stat"><span class="stat-val">6</span><span class="stat-label">Screens</span></div>
  <div class="stat"><span class="stat-val">515</span><span class="stat-label">Elements</span></div>
  <div class="stat"><span class="stat-val">Light</span><span class="stat-label">Theme</span></div>
  <div class="stat"><span class="stat-val">#469</span><span class="stat-label">Heartbeat</span></div>
</div>

<!-- FEATURES BENTO -->
<section class="section" id="features">
  <div class="section-eyebrow">Concept</div>
  <h2 class="section-title">Designed for depth,<br>not distraction.</h2>
  <p class="section-sub">
    Inspired by the warm editorial aesthetic from lapa.ninja's "Overlay" site
    and the bento grid SaaS trend from saaspo.com — KNOLL brings editorial
    warmth to personal knowledge management.
  </p>
  <div class="bento-grid">
    <div class="bento-card accent-card">
      <div class="bento-icon">◎</div>
      <div class="bento-label">Focus</div>
      <div class="bento-big-val">2h 14m</div>
      <div class="bento-desc">Daily focus tracking with streak heat-maps and velocity charts for your writing sessions.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">⬡</div>
      <div class="bento-label">Research Topics</div>
      <div class="bento-title">Networked thinking</div>
      <div class="bento-desc">Organise research into topic boards with linked notes, saved links, and synthesis docs.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">✎</div>
      <div class="bento-label">Editor</div>
      <div class="bento-title">Write with intention</div>
      <div class="bento-desc">A calm document editor with word-count goals, inline link cards, and daily quote prompts.</div>
    </div>
    <div class="bento-card wide">
      <div class="bento-icon">◈</div>
      <div class="bento-label">Insights</div>
      <div class="bento-title">See your patterns clearly</div>
      <div class="bento-desc">Streak calendars, topic time splits, writing velocity graphs — your intellectual life made visual without gamification pressure.</div>
    </div>
    <div class="bento-card forest-card">
      <div class="bento-icon">⊞</div>
      <div class="bento-label">Library</div>
      <div class="bento-title">Collections</div>
      <div class="bento-desc">Curate topic collections with progress indicators and colour-coded accents per discipline.</div>
    </div>
  </div>
</section>

<!-- SCREENS GALLERY -->
<section class="screens-section" id="screens">
  <div class="section-eyebrow">All Screens</div>
  <h2 class="section-title">Six screens, one coherent world.</h2>
  <p class="section-sub">Warm cream editorial palette with terracotta and forest green accents throughout.</p>
  <div class="screens-grid">
    ${screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenDataURIs[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${String(i + 1).padStart(2, '0')} — ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section" id="palette">
  <div class="section-eyebrow">Colour Palette</div>
  <h2 class="section-title">Warm editorial light.</h2>
  <p class="section-sub">
    Inspired by lapa.ninja's "Overlay" beauty site — muted pinks and cream whites
    reinterpreted as a productive warm cream system with terracotta and forest green.
  </p>
  <div class="palette-row">
    <div class="swatch swatch-dark" style="background:${BG}"><div class="swatch-label">Cream — ${BG}</div></div>
    <div class="swatch swatch-dark" style="background:${SURF}"><div class="swatch-label">White — ${SURF}</div></div>
    <div class="swatch swatch-dark" style="background:${CARD}"><div class="swatch-label">Parchment — ${CARD}</div></div>
    <div class="swatch" style="background:${ACC}"><div class="swatch-label">Terracotta — ${ACC}</div></div>
    <div class="swatch" style="background:${ACC2}"><div class="swatch-label">Forest — ${ACC2}</div></div>
    <div class="swatch" style="background:${AMBER}"><div class="swatch-label">Amber — ${AMBER}</div></div>
  </div>
</section>

<!-- QUOTE -->
<div class="quote-section">
  <div class="quote-mark">"</div>
  <blockquote>The pattern recognition gap between experts and novices is not knowledge — it is the habit of noticing.</blockquote>
  <div class="quote-attr">— David Epstein, Range — KNOLL Daily Brief</div>
</div>

<!-- LINKS -->
<section class="links-section">
  <div class="section-eyebrow">Design Discovery</div>
  <h2 class="section-title">Explore further.</h2>
  <div class="links-grid">
    <a class="link-card" href="https://ram.zenbin.org/knoll-viewer">
      <span class="link-icon">◈</span>
      <div class="link-title">Pencil.dev Viewer</div>
      <div class="link-sub">Browse all 6 screens in the interactive pen viewer</div>
      <div class="link-url">ram.zenbin.org/knoll-viewer →</div>
    </a>
    <a class="link-card" href="https://ram.zenbin.org/knoll-mock">
      <span class="link-icon">☀◑</span>
      <div class="link-title">Interactive Svelte Mock</div>
      <div class="link-sub">Tap through the screens with built-in light/dark toggle</div>
      <div class="link-url">ram.zenbin.org/knoll-mock →</div>
    </a>
    <a class="link-card" href="https://www.lapa.ninja">
      <span class="link-icon">◎</span>
      <div class="link-title">Research: lapa.ninja</div>
      <div class="link-sub">Warm editorial + scattered polaroid layouts that inspired this design</div>
      <div class="link-url">lapa.ninja →</div>
    </a>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <strong>KNOLL</strong> — Research, connected &nbsp;·&nbsp;
  RAM Design Heartbeat #469 &nbsp;·&nbsp;
  <a href="https://ram.zenbin.org">ram.zenbin.org</a> &nbsp;·&nbsp;
  Light theme · ${new Date().toISOString().slice(0,10)}
</footer>

</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

// ── Publish ────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} ${r1.body.slice(0, 80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.body.slice(0, 80)}`);
}
main().catch(console.error);
