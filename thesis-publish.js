'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'thesis';
const APP_NAME = 'THESIS';
const TAGLINE = 'AI Research Assistant';

// Palette
const BG    = '#FAF8F3';
const TEXT  = '#2A1A0E';
const MUTED = '#8A7B6E';
const TERRA = '#B85C38';
const INDIGO= '#4B4BA0';
const SURF  = '#FFFFFF';
const PARCH2= '#F3EFE6';
const BORDER= '#E4DDD4';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);
const screens = pen.screens;

// Build SVG thumbnails for carousel (first 4 screens)
function svgDataUri(screen) {
  const W = 390, H = 844;
  const els = screen.elements || [];
  let svgEls = '';
  els.forEach(el => {
    if (el.type === 'rect') {
      svgEls += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"${el.rx?` rx="${el.rx}"`:''}${el.opacity!==undefined?` opacity="${el.opacity}"`:''}${el.stroke?` stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`:''} />`;
    } else if (el.type === 'text') {
      svgEls += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}"${el.fontWeight?` font-weight="${el.fontWeight}"`:''}${el.textAnchor?` text-anchor="${el.textAnchor}"`:''}${el.opacity!==undefined?` opacity="${el.opacity}"`:''}${el.letterSpacing!==undefined?` letter-spacing="${el.letterSpacing}"`:''}${el.fontFamily?` font-family="${el.fontFamily}"`:''}>${el.content}</text>`;
    } else if (el.type === 'circle') {
      svgEls += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${el.opacity!==undefined?` opacity="${el.opacity}"`:''}${el.stroke?` stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`:''} />`;
    } else if (el.type === 'line') {
      svgEls += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"${el.opacity!==undefined?` opacity="${el.opacity}"`:''}/>`;
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${svgEls}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>THESIS — AI Research Assistant | RAM Design Studio</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG};
    --surf: ${SURF};
    --parch2: ${PARCH2};
    --text: ${TEXT};
    --muted: ${MUTED};
    --terra: ${TERRA};
    --indigo: ${INDIGO};
    --border: ${BORDER};
  }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

  /* ── Nav ── */
  nav { position: sticky; top: 0; z-index: 100; background: var(--bg); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 60px; }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: var(--text); letter-spacing: 0.5px; text-decoration: none; }
  .nav-logo span { color: var(--terra); }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; letter-spacing: 0.5px; transition: color .2s; }
  .nav-links a:hover { color: var(--terra); }
  .nav-cta { background: var(--terra); color: white; padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; transition: opacity .2s; }
  .nav-cta:hover { opacity: 0.88; }

  /* ── Hero ── */
  .hero { padding: 80px 40px 60px; max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .hero-left {}
  .hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--terra); margin-bottom: 20px; text-transform: uppercase; }
  .hero-h1 { font-family: 'Playfair Display', serif; font-size: clamp(40px, 5vw, 64px); font-weight: 400; line-height: 1.1; color: var(--text); margin-bottom: 12px; }
  .hero-h1 em { font-style: italic; color: var(--terra); }
  .hero-sub { font-size: 16px; color: var(--muted); line-height: 1.6; margin-bottom: 32px; max-width: 440px; }
  .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary { background: var(--terra); color: white; padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; transition: opacity .2s; }
  .btn-primary:hover { opacity: 0.88; }
  .btn-ghost { border: 1.5px solid var(--border); color: var(--text); padding: 12px 24px; border-radius: 8px; font-size: 14px; text-decoration: none; transition: border-color .2s; }
  .btn-ghost:hover { border-color: var(--terra); }
  .hero-note { font-size: 11px; color: var(--muted); margin-top: 16px; letter-spacing: 0.3px; }

  /* ── Phone mockup ── */
  .hero-right { display: flex; justify-content: center; }
  .phone-wrap { position: relative; }
  .phone-frame { width: 220px; height: 476px; background: var(--surf); border-radius: 36px; border: 2px solid var(--border); box-shadow: 0 32px 80px rgba(42,26,14,0.12), 0 8px 24px rgba(42,26,14,0.06); overflow: hidden; position: relative; }
  .phone-frame img { width: 100%; height: 100%; object-fit: cover; }
  .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 24px; background: var(--bg); border-radius: 0 0 16px 16px; z-index: 2; }
  .phone-badge { position: absolute; bottom: -12px; right: -12px; background: var(--terra); color: white; padding: 8px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(184,92,56,0.4); }

  /* ── Stats ── */
  .stats-row { background: var(--surf); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 32px 40px; display: flex; justify-content: center; gap: 0; max-width: 1100px; margin: 0 auto; }
  .stat { flex: 1; text-align: center; max-width: 200px; border-right: 1px solid var(--border); padding: 0 32px; }
  .stat:last-child { border-right: none; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 600; color: var(--terra); }
  .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }

  /* ── Screen carousel ── */
  .screens-section { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .section-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--terra); text-transform: uppercase; margin-bottom: 8px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; color: var(--text); margin-bottom: 40px; }
  .carousel { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .screen-card { background: var(--surf); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: box-shadow .2s, transform .2s; }
  .screen-card:hover { box-shadow: 0 12px 40px rgba(42,26,14,0.1); transform: translateY(-2px); }
  .screen-img { width: 100%; aspect-ratio: 390/480; overflow: hidden; background: var(--parch2); }
  .screen-img img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .screen-meta { padding: 16px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .screen-name { font-size: 12px; font-weight: 600; color: var(--text); letter-spacing: 0.5px; }
  .screen-num { font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; }

  /* ── Palette ── */
  .palette-section { background: var(--parch2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 60px 40px; }
  .palette-inner { max-width: 1100px; margin: 0 auto; }
  .swatches { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 32px; }
  .swatch { display: flex; align-items: center; gap: 12px; }
  .swatch-dot { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.06); }
  .swatch-info {}
  .swatch-hex { font-size: 12px; font-weight: 600; color: var(--text); font-family: monospace; }
  .swatch-name { font-size: 11px; color: var(--muted); }

  /* ── Features ── */
  .features-section { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
  .feature-card { padding: 28px; background: var(--surf); border: 1px solid var(--border); border-radius: 12px; border-top: 3px solid var(--terra); }
  .feature-icon { font-size: 20px; margin-bottom: 12px; }
  .feature-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ── Inspiration ── */
  .inspo-section { padding: 60px 40px; max-width: 1100px; margin: 0 auto; border-top: 1px solid var(--border); }
  .inspo-list { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
  .inspo-item { font-size: 13px; color: var(--muted); padding: 16px 20px; background: var(--surf); border-radius: 8px; border-left: 3px solid var(--terra); }
  .inspo-item strong { color: var(--text); }

  /* ── CTA ── */
  .cta-section { background: var(--text); padding: 80px 40px; text-align: center; }
  .cta-section h2 { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 400; color: white; margin-bottom: 12px; }
  .cta-section p { color: rgba(255,255,255,0.6); font-size: 15px; margin-bottom: 32px; }
  .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .cta-btn { background: var(--terra); color: white; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; }
  .cta-viewer { border: 1.5px solid rgba(255,255,255,0.2); color: white; padding: 13px 28px; border-radius: 8px; font-size: 14px; text-decoration: none; }

  /* ── Footer ── */
  footer { background: var(--bg); border-top: 1px solid var(--border); padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--muted); }
  footer a { color: var(--terra); text-decoration: none; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; }
    .hero-right { display: none; }
    .carousel { grid-template-columns: repeat(2, 1fr); }
    .features-grid { grid-template-columns: 1fr; }
    .stats-row { flex-wrap: wrap; }
    .stat { border-right: none; border-bottom: 1px solid var(--border); padding: 20px; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="/"><span>RAM</span> Design Studio</a>
  <div class="nav-links">
    <a href="/gallery">Gallery</a>
    <a href="/thesis-viewer">Pen Viewer</a>
    <a href="/thesis-mock">Interactive Mock</a>
    <a class="nav-cta" href="/thesis-mock">Try Mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">Heartbeat #43 · Light Theme · Research</div>
    <h1 class="hero-h1">Find the research<br>that <em>matters.</em></h1>
    <p class="hero-sub">AI-powered academic research assistant. Synthesize literature across 200M+ papers, build citation-ready reviews, and discover the connections other researchers miss.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="/thesis-mock">Try Interactive Mock →</a>
      <a class="btn-ghost" href="/thesis-viewer">View in Pen Viewer</a>
    </div>
    <p class="hero-note">6 screens · 535 elements · Warm parchment editorial</p>
  </div>
  <div class="hero-right">
    <div class="phone-wrap">
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <img src="${svgDataUri(screens[0])}" alt="THESIS Search Screen" />
      </div>
      <div class="phone-badge">LIGHT THEME</div>
    </div>
  </div>
</section>

<div style="max-width:1100px;margin:0 auto;border-top:1px solid var(--border)"></div>

<div class="stats-row">
  <div class="stat"><div class="stat-val">200M+</div><div class="stat-label">Papers Indexed</div></div>
  <div class="stat"><div class="stat-val">6</div><div class="stat-label">Screens Designed</div></div>
  <div class="stat"><div class="stat-val">535</div><div class="stat-label">UI Elements</div></div>
  <div class="stat"><div class="stat-val">#43</div><div class="stat-label">Heartbeat</div></div>
</div>

<section class="screens-section">
  <div class="section-label">All Screens</div>
  <h2 class="section-title">Six screens, one research workflow</h2>
  <div class="carousel">
    ${screens.map((s, i) => `
    <div class="screen-card">
      <div class="screen-img">
        <img src="${svgDataUri(s)}" alt="${s.name}" />
      </div>
      <div class="screen-meta">
        <span class="screen-name">${s.name.toUpperCase()}</span>
        <span class="screen-num">0${i+1} / 0${screens.length}</span>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="palette-section">
  <div class="palette-inner">
    <div class="section-label">Colour Palette</div>
    <h2 class="section-title" style="margin-bottom:0">Warm parchment · terracotta · indigo</h2>
    <p style="font-size:13px;color:var(--muted);margin:8px 0 0">Inspired by AfterQuery's academic warmth and Stripe Sessions' editorial parchment</p>
    <div class="swatches">
      ${[
        [BG, 'Parchment', 'Background'],
        [SURF, 'White', 'Surface'],
        [PARCH2, 'Parch 2', 'Alt surface'],
        [TEXT, 'Warm Brown', 'Primary text'],
        [MUTED, 'Taupe', 'Secondary text'],
        [TERRA, 'Terracotta', 'Primary accent'],
        [INDIGO, 'Deep Indigo', 'Secondary accent'],
        [BORDER, 'Warm Border', 'Borders'],
      ].map(([hex, name, role]) => `
      <div class="swatch">
        <div class="swatch-dot" style="background:${hex}"></div>
        <div class="swatch-info"><div class="swatch-hex">${hex}</div><div class="swatch-name">${name} · ${role}</div></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="features-section">
  <div class="section-label">Design Highlights</div>
  <h2 class="section-title">What makes THESIS distinct</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">📖</div>
      <div class="feature-title">Editorial Serif Typography</div>
      <div class="feature-desc">Georgia serif used for paper titles and synthesis blocks — simulates the academic paper reading experience, unlike typical app sans-serif lists.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🎨</div>
      <div class="feature-title">Warm Brown Text</div>
      <div class="feature-desc">Primary text at #2A1A0E (deep warm brown), not black. Inspired by Ape AI's RGB(76,49,12) — signals approachability and warmth over cold precision.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🧪</div>
      <div class="feature-title">Colour-Coded Structure</div>
      <div class="feature-desc">Indigo sidebar for introduction, sage green for findings, terracotta for gaps — each synthesis section type gets a distinct left-border signal.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📊</div>
      <div class="feature-title">Match Score Bars</div>
      <div class="feature-desc">Each paper card has a terracotta progress bar across its top edge showing semantic relevance score — a UI pattern adapted from similarity search UIs.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔖</div>
      <div class="feature-title">Reading Progress</div>
      <div class="feature-desc">Library cards show per-paper reading progress as a thin top-edge bar in sage green. Unread papers show a taupe placeholder — clear at a glance.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🗓</div>
      <div class="feature-title">Activity Heatmap</div>
      <div class="feature-desc">GitHub-style reading heatmap on the Profile screen — 12 weeks × 7 days of terracotta intensity blocks tracking research engagement over time.</div>
    </div>
  </div>
</section>

<section class="inspo-section">
  <div class="section-label">Research Sources</div>
  <h2 class="section-title" style="margin-bottom:0">What inspired this</h2>
  <div class="inspo-list">
    ${pen.metadata.inspiration.map(s => `<div class="inspo-item"><strong>${s.split('—')[0].trim()}</strong> —${s.split('—')[1]||''}</div>`).join('')}
  </div>
</section>

<section class="cta-section">
  <h2>See it in motion</h2>
  <p>Fully interactive Svelte mock with light/dark toggle. Every screen, every interaction.</p>
  <div class="cta-actions">
    <a class="cta-btn" href="/thesis-mock">Open Interactive Mock →</a>
    <a class="cta-viewer" href="/thesis-viewer">Pen Viewer</a>
    <a class="cta-viewer" href="/gallery">Browse Gallery</a>
  </div>
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #43 · ${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</span>
  <a href="/gallery">← Back to Gallery</a>
</footer>

</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`);
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Pen Viewer`);
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
