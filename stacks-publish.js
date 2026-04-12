'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'stacks';

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

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const CREAM  = '#FAF7F0';
const WHITE  = '#FFFFFF';
const TINT   = '#F4EDE0';
const RULE   = '#E8DFD0';
const INK    = '#1E1A14';
const INK2   = 'rgba(30,26,20,0.55)';
const TERRA  = '#C45D2A';
const SAGE   = '#5A8A7A';
const AMBER  = '#F0A500';

// ─── SCREEN SVG PREVIEWS ─────────────────────────────────────────────────────
function elementToSVG(el) {
  if (!el) return '';
  if (el.type === 'rect') {
    const attrs = [
      `x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}"`,
      `fill="${el.fill}"`,
      el.rx ? `rx="${el.rx}"` : '',
      el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
      el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : '',
    ].filter(Boolean).join(' ');
    return `<rect ${attrs}/>`;
  }
  if (el.type === 'text') {
    const attrs = [
      `x="${el.x}" y="${el.y}"`,
      `font-size="${el.size}"`,
      `fill="${el.fill}"`,
      el.fw ? `font-weight="${el.fw}"` : '',
      el.font ? `font-family="${el.font}"` : '',
      el.anchor ? `text-anchor="${el.anchor}"` : '',
      el.ls ? `letter-spacing="${el.ls}"` : '',
      el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
    ].filter(Boolean).join(' ');
    const safe = String(el.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    return `<text ${attrs}>${safe}</text>`;
  }
  if (el.type === 'circle') {
    const attrs = [
      `cx="${el.cx}" cy="${el.cy}" r="${el.r}"`,
      `fill="${el.fill}"`,
      el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
      el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : '',
    ].filter(Boolean).join(' ');
    return `<circle ${attrs}/>`;
  }
  if (el.type === 'line') {
    const attrs = [
      `x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"`,
      `stroke="${el.stroke}" stroke-width="${el.sw || 1}"`,
      el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
    ].filter(Boolean).join(' ');
    return `<line ${attrs}/>`;
  }
  return '';
}

function screenToSVG(screen) {
  const els = (screen.elements || []).map(elementToSVG).join('\n');
  return `<svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg" style="font-family:Inter,Georgia,sans-serif">${els}</svg>`;
}

const screenSVGs = pen.screens.map(s => screenToSVG(s));
const screenNames = pen.screens.map(s => s.name);

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>STACKS — Read deeply, track beautifully</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream: ${CREAM};
    --white: ${WHITE};
    --tint: ${TINT};
    --rule: ${RULE};
    --ink: ${INK};
    --ink2: rgba(30,26,20,0.55);
    --terra: ${TERRA};
    --sage: ${SAGE};
    --amber: ${AMBER};
  }
  html { font-family: -apple-system, 'Inter', sans-serif; background: var(--cream); color: var(--ink); scroll-behavior: smooth; }
  body { min-height: 100vh; }

  /* HEADER */
  .header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,247,240,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--rule);
    padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .logo { font-family: Georgia, serif; font-size: 18px; font-weight: 700; letter-spacing: 2px; color: var(--ink); }
  .logo span { color: var(--terra); }
  .header-links { display: flex; gap: 24px; }
  .header-links a { font-size: 13px; color: var(--ink2); text-decoration: none; }
  .header-links a:hover { color: var(--terra); }
  .cta-btn {
    background: var(--terra); color: white; border: none;
    padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700;
    cursor: pointer; text-decoration: none;
  }

  /* HERO */
  .hero {
    max-width: 960px; margin: 0 auto;
    padding: 80px 32px 60px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
  }
  .hero-label {
    font-size: 10px; font-weight: 700; letter-spacing: 2px; color: var(--terra);
    text-transform: uppercase; margin-bottom: 16px;
  }
  .hero h1 {
    font-family: Georgia, serif; font-size: 52px; font-weight: 800; line-height: 1.08;
    color: var(--ink); margin-bottom: 20px;
  }
  .hero h1 em { font-style: normal; color: var(--terra); }
  .hero p { font-size: 16px; line-height: 1.7; color: var(--ink2); margin-bottom: 32px; }
  .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--terra); color: white;
    padding: 14px 28px; border-radius: 28px;
    font-size: 14px; font-weight: 700; text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-secondary {
    color: var(--ink2); font-size: 13px; text-decoration: none;
    border: 1px solid var(--rule); padding: 13px 22px; border-radius: 28px;
  }
  .btn-secondary:hover { border-color: var(--terra); color: var(--terra); }

  /* PHONE MOCK */
  .hero-visual {
    display: flex; justify-content: center;
  }
  .phone-frame {
    background: var(--ink); border-radius: 40px; padding: 10px;
    box-shadow: 0 32px 80px rgba(30,26,20,0.18), 0 8px 24px rgba(30,26,20,0.1);
    width: 220px;
    position: relative;
  }
  .phone-frame svg { border-radius: 30px; display: block; width: 200px; height: auto; }
  .phone-notch {
    position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
    width: 60px; height: 6px; background: #111; border-radius: 3px; z-index: 10;
  }

  /* SCREENS CAROUSEL */
  .screens-section {
    background: var(--tint); padding: 80px 0;
    border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  }
  .screens-section h2 {
    font-family: Georgia, serif; font-size: 32px; font-weight: 700;
    text-align: center; margin-bottom: 8px; color: var(--ink);
  }
  .screens-section .sub { text-align: center; color: var(--ink2); font-size: 14px; margin-bottom: 40px; }
  .screens-scroll {
    display: flex; gap: 20px; overflow-x: auto; padding: 0 40px 20px;
    scrollbar-width: none;
  }
  .screens-scroll::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 auto; width: 160px; cursor: pointer;
    transition: transform 0.25s;
  }
  .screen-card:hover { transform: translateY(-6px); }
  .screen-card .screen-wrap {
    background: var(--ink); border-radius: 20px; padding: 5px;
    box-shadow: 0 12px 40px rgba(30,26,20,0.14);
  }
  .screen-card svg { border-radius: 16px; display: block; width: 150px; height: auto; }
  .screen-card .screen-label {
    font-size: 11px; color: var(--ink2); text-align: center; margin-top: 10px; font-weight: 500;
  }

  /* FEATURES */
  .features { max-width: 960px; margin: 0 auto; padding: 80px 32px; }
  .features h2 { font-family: Georgia, serif; font-size: 36px; font-weight: 700; margin-bottom: 12px; }
  .features .sub { color: var(--ink2); font-size: 15px; margin-bottom: 48px; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .feature-item {
    background: var(--white); border: 1px solid var(--rule);
    border-radius: 16px; padding: 28px;
  }
  .feature-item .icon { font-size: 24px; margin-bottom: 16px; }
  .feature-item h3 { font-family: Georgia, serif; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feature-item p { font-size: 13px; color: var(--ink2); line-height: 1.6; }

  /* PALETTE */
  .palette-section { max-width: 960px; margin: 0 auto; padding: 0 32px 80px; }
  .palette-section h2 { font-family: Georgia, serif; font-size: 28px; margin-bottom: 24px; }
  .palette-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .swatch { width: 80px; }
  .swatch .color { height: 60px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); }
  .swatch .label { font-size: 10px; color: var(--ink2); margin-top: 8px; }
  .swatch .hex { font-size: 11px; font-weight: 600; color: var(--ink); font-family: monospace; }

  /* FOOTER */
  .footer {
    border-top: 1px solid var(--rule);
    padding: 32px; text-align: center;
    font-size: 12px; color: var(--ink2);
  }
  .footer a { color: var(--terra); text-decoration: none; }

  @media (max-width: 640px) {
    .hero { grid-template-columns: 1fr; padding: 48px 24px; }
    .hero-visual { order: -1; }
    .feature-grid { grid-template-columns: 1fr; }
    .hero h1 { font-size: 36px; }
  }
</style>
</head>
<body>

<header class="header">
  <div class="logo">S<span>T</span>ACKS</div>
  <nav class="header-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/stacks-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/stacks-mock">Mock ☀◑</a>
  </nav>
  <a href="https://ram.zenbin.org/stacks-mock" class="cta-btn">Try it →</a>
</header>

<section class="hero">
  <div class="hero-text">
    <div class="hero-label">RAM Design Heartbeat · #39 · Light Edition</div>
    <h1>Read deeply,<br>track <em>beautifully.</em></h1>
    <p>STACKS is a personal reading companion that treats your books like a curated collection — not a checklist. Track progress, capture highlights, and discover what to read next.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/stacks-mock" class="btn-primary">Interactive Mock →</a>
      <a href="https://ram.zenbin.org/stacks-viewer" class="btn-secondary">View in Pencil.dev</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      ${screenSVGs[0]}
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <h2>Six screens</h2>
  <p class="sub">From daily reading habit to year in review</p>
  <div class="screens-scroll">
    ${pen.screens.map((s,i) => `
    <div class="screen-card">
      <div class="screen-wrap">${screenSVGs[i]}</div>
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <h2>Designed for readers</h2>
  <p class="sub">Inspired by Litbix and KOMETA Typefaces on minimal.gallery — editorial warmth, serif-forward clarity.</p>
  <div class="feature-grid">
    <div class="feature-item">
      <div class="icon">◉</div>
      <h3>Reading day at a glance</h3>
      <p>Your daily goal, streak, current book progress, and up-next queue — all before you even open a page.</p>
    </div>
    <div class="feature-item">
      <div class="icon">≡</div>
      <h3>Stacks, not shelves</h3>
      <p>Organise your 47 books into fluid reading stacks — active, queued, done — with visual progress baked in.</p>
    </div>
    <div class="feature-item">
      <div class="icon">✦</div>
      <h3>Highlights with context</h3>
      <p>Capture quotes and notes as you read. Color-coded by type. Surfaced by book, chapter, and date.</p>
    </div>
    <div class="feature-item">
      <div class="icon">◈</div>
      <h3>Curated discovery</h3>
      <p>Editor's picks, genre-based browsing, and "because you read X" recommendations that actually land.</p>
    </div>
    <div class="feature-item">
      <div class="icon">🔥</div>
      <h3>Streaks that reward habit</h3>
      <p>21-day streak tracking with daily goal rings — just enough gamification to stay consistent, not addicted.</p>
    </div>
    <div class="feature-item">
      <div class="icon">◎</div>
      <h3>Year in reading</h3>
      <p>31 books, 8,412 pages, top genres, favourite authors. Your reading year, wrapped beautifully.</p>
    </div>
  </div>
</section>

<section class="palette-section">
  <h2>Warm editorial palette</h2>
  <div class="palette-row">
    ${[
      {hex:'#FAF7F0',name:'Parchment'},
      {hex:'#FFFFFF',name:'White'},
      {hex:'#F4EDE0',name:'Tint'},
      {hex:'#1E1A14',name:'Ink'},
      {hex:'#C45D2A',name:'Terracotta'},
      {hex:'#5A8A7A',name:'Sage'},
      {hex:'#F0A500',name:'Amber'},
    ].map(s => `
    <div class="swatch">
      <div class="color" style="background:${s.hex}"></div>
      <div class="hex">${s.hex}</div>
      <div class="label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<footer class="footer">
  <p>STACKS — RAM Design Heartbeat #39 · <a href="https://ram.zenbin.org/stacks-viewer">Pencil.dev viewer</a> · <a href="https://ram.zenbin.org/stacks-mock">Interactive mock ☀◑</a></p>
  <p style="margin-top:8px">Trend research: minimal.gallery — Litbix, KOMETA Typefaces · lapa.ninja · godly.website</p>
</footer>

</body>
</html>`;

// ─── VIEWER ──────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'STACKS — Read deeply, track beautifully');
  console.log(`Hero: ${r1.status} ${r1.status===201?'✓':'— '+r1.body.slice(0,120)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'STACKS — Pencil.dev Viewer');
  console.log(`Viewer: ${r2.status} ${r2.status===201?'✓':'— '+r2.body.slice(0,120)}`);
}
main().catch(console.error);
