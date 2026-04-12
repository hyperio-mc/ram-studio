'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'ridge';
const VOID   = '#030404';
const COAL   = '#111214';
const SLATE  = '#1E2024';
const TEXT   = '#FAFAFA';
const MUTED  = '#888C96';
const BORDER = '#2A2D33';
const RUST   = '#C44B1E';
const EMBER  = '#E8622A';
const SILVER = '#9A9C9F';
const SAND   = '#D4B89A';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'X-Subdomain': 'ram' },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);
const screens = pen.screens;

function svgDataUri(screen) {
  const W = 390, H = 844;
  let svgEls = '';
  (screen.elements || []).forEach(el => {
    if (el.type === 'rect') {
      svgEls += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"${el.rx ? ` rx="${el.rx}"` : ''}${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''} />`;
    } else if (el.type === 'text') {
      const t = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgEls += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}"${el.fontWeight ? ` font-weight="${el.fontWeight}"` : ''}${el.textAnchor ? ` text-anchor="${el.textAnchor}"` : ''}${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}${el.letterSpacing !== undefined ? ` letter-spacing="${el.letterSpacing}"` : ''}>${t}</text>`;
    } else if (el.type === 'circle') {
      svgEls += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''} />`;
    } else if (el.type === 'line') {
      svgEls += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''} />`;
    }
  });
  return 'data:image/svg+xml;base64,' + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${svgEls}</svg>`).toString('base64');
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RIDGE — Trail Running & Mountain Performance | RAM Design Studio</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --void: ${VOID}; --coal: ${COAL}; --slate: ${SLATE};
    --text: ${TEXT}; --muted: ${MUTED}; --border: ${BORDER};
    --rust: ${RUST}; --ember: ${EMBER}; --silver: ${SILVER}; --sand: ${SAND};
  }
  html { scroll-behavior: smooth; }
  body { font-family: -apple-system, 'Inter', sans-serif; background: var(--void); color: var(--text); min-height: 100vh; }

  nav { position: sticky; top: 0; z-index: 100; background: rgba(3,4,4,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 60px; }
  .nav-logo { font-size: 22px; font-weight: 800; letter-spacing: 3px; color: var(--text); text-decoration: none; }
  .nav-logo span { color: var(--rust); }
  .nav-links { display: flex; gap: 28px; align-items: center; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; }
  .nav-links a:hover { color: var(--rust); }
  .nav-cta { background: var(--rust); color: var(--text); padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 700; text-decoration: none; }

  /* ── Hero ── */
  .hero { padding: 80px 40px 0; max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: flex-end; }
  .hero-left { padding-bottom: 60px; }
  .hero-eyebrow { display: flex; gap: 8px; margin-bottom: 24px; }
  .ep { padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
  .ep-rust { background: rgba(196,75,30,0.15); color: var(--rust); border: 1px solid rgba(196,75,30,0.3); }
  .ep-silver { background: rgba(154,156,159,0.1); color: var(--silver); border: 1px solid var(--border); }
  /* Editorial big type (Mertana-inspired) */
  .hero-h1 { font-size: clamp(56px, 8vw, 96px); font-weight: 800; line-height: 0.95; letter-spacing: -2px; text-transform: uppercase; margin-bottom: 8px; }
  .hero-h1 em { color: var(--rust); font-style: normal; }
  .hero-rule { width: 100%; height: 1px; background: var(--border); margin: 20px 0; }
  .hero-sub { font-size: 15px; color: var(--muted); line-height: 1.65; margin-bottom: 32px; max-width: 440px; }
  .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary { background: var(--rust); color: var(--text); padding: 13px 28px; border-radius: 6px; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px; }
  .btn-ghost { border: 1px solid var(--border); color: var(--text); padding: 12px 24px; border-radius: 6px; font-size: 14px; text-decoration: none; }
  .btn-ghost:hover { border-color: var(--rust); }
  .hero-note { font-size: 11px; color: var(--muted); margin-top: 14px; letter-spacing: 0.3px; }

  /* Phone mock */
  .hero-right { display: flex; justify-content: flex-end; align-items: flex-end; }
  .phone-stack { position: relative; }
  .phone-frame { width: 226px; height: 488px; background: var(--coal); border-radius: 38px; border: 1.5px solid var(--border); box-shadow: 0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(196,75,30,0.1); overflow: hidden; }
  .phone-frame img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 110px; height: 24px; background: var(--void); border-radius: 0 0 16px 16px; z-index: 2; }
  .phone-badge { position: absolute; bottom: -14px; right: -14px; background: var(--rust); color: var(--text); padding: 7px 16px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

  /* Stats band */
  .stats-band { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); display: flex; justify-content: center; margin-top: 60px; }
  .stats-inner { max-width: 1100px; width: 100%; display: flex; padding: 0 40px; }
  .stat { flex: 1; padding: 32px 0; text-align: center; border-right: 1px solid var(--border); }
  .stat:last-child { border-right: none; }
  .stat-val { font-size: 40px; font-weight: 800; color: var(--rust); letter-spacing: -1px; }
  .stat-label { font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }

  /* Screens */
  .screens { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .s-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--rust); text-transform: uppercase; margin-bottom: 4px; }
  .s-title { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 40px; }
  .screen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .screen-card { background: var(--coal); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; transition: border-color .2s, transform .2s; }
  .screen-card:hover { border-color: var(--rust); transform: translateY(-2px); }
  .screen-img { width: 100%; aspect-ratio: 390/480; overflow: hidden; background: var(--slate); }
  .screen-img img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .screen-meta { padding: 14px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; }
  .screen-name { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text); }
  .screen-num { font-size: 10px; color: var(--rust); font-variant-numeric: tabular-nums; }

  /* Palette */
  .palette { background: var(--coal); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 60px 40px; }
  .palette-inner { max-width: 1100px; margin: 0 auto; }
  .swatches { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 28px; }
  .swatch { display: flex; align-items: center; gap: 10px; }
  .swatch-dot { width: 40px; height: 40px; border-radius: 6px; border: 1px solid var(--border); }
  .swatch-hex { font-size: 12px; font-weight: 700; font-family: monospace; }
  .swatch-name { font-size: 11px; color: var(--muted); }

  /* Features */
  .features { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
  .feature-card { padding: 28px; background: var(--coal); border: 1px solid var(--border); border-radius: 10px; border-top: 2px solid var(--rust); }
  .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

  /* Inspo */
  .inspo { padding: 60px 40px; max-width: 1100px; margin: 0 auto; border-top: 1px solid var(--border); }
  .inspo-list { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
  .inspo-item { padding: 14px 18px; background: var(--coal); border-radius: 6px; border-left: 2px solid var(--rust); font-size: 13px; color: var(--sand); }

  /* CTA */
  .cta { padding: 80px 40px; text-align: center; border-top: 1px solid var(--border); }
  .cta h2 { font-size: 48px; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; margin-bottom: 12px; }
  .cta p { color: var(--muted); font-size: 15px; margin-bottom: 32px; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

  footer { background: var(--coal); border-top: 1px solid var(--border); padding: 28px 40px; display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }
  footer a { color: var(--rust); text-decoration: none; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; }
    .hero-right { display: none; }
    .screen-grid { grid-template-columns: repeat(2, 1fr); }
    .feature-grid { grid-template-columns: 1fr; }
    .hero-h1 { font-size: 52px; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="/"><span>RIDGE</span></a>
  <div class="nav-links">
    <a href="/gallery">Gallery</a>
    <a href="/ridge-viewer">Pen Viewer</a>
    <a href="/ridge-mock">Interactive Mock</a>
    <a class="nav-cta" href="/ridge-mock">Try Mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">
      <span class="ep ep-rust">Heartbeat #45</span>
      <span class="ep ep-silver">Dark Theme</span>
      <span class="ep ep-rust">Sport</span>
    </div>
    <h1 class="hero-h1">Built for<br>the <em>mountain.</em></h1>
    <div class="hero-rule"></div>
    <p class="hero-sub">Trail running and mountain performance tracker. Route navigation, elevation profiles, gear tracking, and real-time stats — everything an alpinist needs, nothing they don't.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="/ridge-mock">Try Interactive Mock →</a>
      <a class="btn-ghost" href="/ridge-viewer">Pen Viewer</a>
    </div>
    <p class="hero-note">6 screens · 641 elements · Dark editorial sport</p>
  </div>
  <div class="hero-right">
    <div class="phone-stack">
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <img src="${svgDataUri(screens[0])}" alt="RIDGE Today" />
      </div>
      <div class="phone-badge">DARK</div>
    </div>
  </div>
</section>

<div class="stats-band">
  <div class="stats-inner">
    ${[['6','Screens'],['641','Elements'],['#45','Heartbeat'],['DARK','Theme']].map(([v,l])=>`<div class="stat"><div class="stat-val">${v}</div><div class="stat-label">${l}</div></div>`).join('')}
  </div>
</div>

<section class="screens">
  <div class="s-label">All Screens</div>
  <h2 class="s-title">Six screens, one mountain discipline</h2>
  <div class="screen-grid">
    ${screens.map((s,i)=>`
    <div class="screen-card">
      <div class="screen-img"><img src="${svgDataUri(s)}" alt="${s.name}" /></div>
      <div class="screen-meta"><span class="screen-name">${s.name}</span><span class="screen-num">0${i+1}/06</span></div>
    </div>`).join('')}
  </div>
</section>

<section class="palette">
  <div class="palette-inner">
    <div class="s-label">Colour Palette</div>
    <h2 class="s-title" style="margin-bottom:4px">Void black · rust · silver · sand</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:0">Adapted from Mertana's editorial sport palette: deep black void + rust warmth + cool silver — materials-aware, not tech-derived</p>
    <div class="swatches">
      ${[
        [VOID,'Void','Background'],
        [COAL,'Coal','Cards'],
        [SLATE,'Slate','Elevated surfaces'],
        [TEXT,'Near-White','Primary text'],
        [RUST,'Rust','Primary accent'],
        [EMBER,'Ember','Highlight/active'],
        [SILVER,'Silver','Muted elements'],
        [SAND,'Sand','Secondary text'],
        [MUTED,'Cool Gray','Tertiary'],
      ].map(([hex,name,role])=>`
      <div class="swatch">
        <div class="swatch-dot" style="background:${hex}"></div>
        <div><div class="swatch-hex" style="color:${hex}">${hex}</div><div class="swatch-name">${name} · ${role}</div></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="features">
  <div class="s-label">Design Highlights</div>
  <h2 class="s-title">What makes RIDGE distinct</h2>
  <div class="feature-grid">
    ${[
      ['Editorial Full-Viewport Type', 'Screen headers use a large 40px uppercase wordmark (ROUTES, STATS, KIT, YOU) that spans nearly full width — directly applying Mertana\'s "type as image" principle where the headline is the hero visual.'],
      ['Rust Accent Stripe on Cards', 'Every card with important context gets a 3px rust left border — a rapid scan signal. The stripe color shifts to sage for natural/recovery content, ember for critical/warnings. Color coding without badges.'],
      ['Elevation Profile Charts', 'The route detail and today dashboard both show elevation profiles as filled-area charts using rect + line primitives — simulating what GPS watches and Strava use to communicate route character. No icons, just shape.'],
      ['Gear Wear Bars', 'Each shoe shows a progress bar for worn km vs. max lifespan. The bar color shifts dynamically: sage (< 60%) → rust (60–85%) → ember (> 85%). Gear health communicated through the same color language as performance.'],
      ['Void Black, Not Just Dark', 'Background is #030404, not #000000 or #0D0F14. This slight warm tint to near-black gives depth — pure black reads as flat digital, void reads as a physical material (matte rubber, carbon fiber, night sky).'],
      ['Race Calendar with Urgency', 'Profile screen shows race countdown in days. Races within 90 days use ember (urgent warm) vs. sand (distant) for the day count — the designer\'s version of a yellow/red alert system without using those associations.'],
    ].map(([t,d])=>`
    <div class="feature-card">
      <div class="feature-title">${t}</div>
      <div class="feature-desc">${d}</div>
    </div>`).join('')}
  </div>
</section>

<section class="inspo">
  <div class="s-label">Research Sources</div>
  ${pen.metadata.inspiration.map(s=>`<div class="inspo-list"><div class="inspo-item">${s}</div></div>`).join('')}
</section>

<section class="cta">
  <h2><em style="color:var(--rust)">See it</em> live</h2>
  <p>Interactive Svelte mock with light/dark toggle. All six screens.</p>
  <div class="cta-btns">
    <a class="btn-primary" href="/ridge-mock">Open Interactive Mock →</a>
    <a class="btn-ghost" href="/ridge-viewer">Pen Viewer</a>
    <a class="btn-ghost" href="/gallery">Browse Gallery</a>
  </div>
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #45 · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
  <a href="/gallery">← Back to Gallery</a>
</footer>
</body>
</html>`;

let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'RIDGE — Trail Running & Mountain Performance | RAM');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'RIDGE — Pen Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
