'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG      = 'revel';
const NAME      = 'REVEL';
const TAGLINE   = "Find what's happening around you";
const HEARTBEAT = 394;

// Palette
const BG   = '#FAF6F0';
const ACC  = '#C4511A';
const ACC2 = '#4A7B4A';
const TEXT = '#1C1712';
const LACC = '#F5E6DC';   // light terracotta wash

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

// ── SVG thumbnails from pen screens ──
function screenToSvg(screen, idx) {
  const W = 390, H = 844;
  let svgParts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`];
  (screen.elements || []).forEach(el => {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      svgParts.push(`<rect x="${el.x}" y="${el.y}" width="${el.width||el.w||0}" height="${el.height||el.h||0}" fill="${el.fill}" rx="${rx}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`);
    } else if (el.type === 'text') {
      const family = el.fontFamily||'Inter, sans-serif';
      const weight = el.fontWeight||400;
      const anchor = el.textAnchor||'start';
      const ls = el.letterSpacing||0;
      const opacity = el.opacity!==undefined?el.opacity:1;
      const escaped = String(el.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgParts.push(`<text x="${el.x}" y="${el.y}" font-size="${el.fontSize||12}" fill="${el.fill}" font-family="${family}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}">${escaped}</text>`);
    } else if (el.type === 'circle') {
      svgParts.push(`<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`);
    } else if (el.type === 'line') {
      svgParts.push(`<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity!==undefined?el.opacity:1}"/>`);
    }
  });
  svgParts.push('</svg>');
  return svgParts.join('');
}

const screenSvgs = pen.screens.map((s, i) => ({
  name: s.name,
  svg: screenToSvg(s, i),
}));

const svgDataUris = screenSvgs.map(s =>
  'data:image/svg+xml;base64,' + Buffer.from(s.svg).toString('base64')
);

// ── Hero HTML ──
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG};
    --surf: #FFFFFF;
    --card: #F5EFE6;
    --acc: ${ACC};
    --acc2: ${ACC2};
    --text: ${TEXT};
    --muted: rgba(28,23,18,0.5);
    --divider: rgba(28,23,18,0.10);
  }
  body { background: var(--bg); color: var(--text); font-family: 'Georgia', serif; min-height: 100vh; }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(250,246,240,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--divider);
    padding: 0 24px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: var(--text); }
  .nav-logo span { color: var(--acc); }
  .nav-links { display: flex; gap: 28px; font-family: 'Inter', sans-serif; font-size: 14px; }
  .nav-links a { color: var(--muted); text-decoration: none; font-weight: 500; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--acc); color: #fff; padding: 8px 20px; border-radius: 20px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; }

  /* HERO */
  .hero {
    padding: 120px 24px 80px;
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--card); border: 1px solid var(--divider);
    padding: 6px 14px; border-radius: 20px;
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
    letter-spacing: 1px; color: var(--acc); text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--acc); }
  h1 {
    font-size: clamp(48px, 7vw, 80px);
    line-height: 1.05; letter-spacing: -2px;
    color: var(--text); margin-bottom: 24px;
  }
  h1 em { color: var(--acc); font-style: italic; }
  .hero-sub {
    font-family: 'Inter', sans-serif; font-size: 18px; line-height: 1.6;
    color: var(--muted); max-width: 440px; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .btn-primary {
    background: var(--acc); color: #fff;
    padding: 14px 28px; border-radius: 28px;
    font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600;
    text-decoration: none; display: inline-block;
    box-shadow: 0 4px 20px rgba(196,81,26,0.3);
  }
  .btn-secondary {
    background: var(--card); color: var(--text);
    padding: 14px 28px; border-radius: 28px;
    font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 500;
    text-decoration: none; display: inline-block;
    border: 1px solid var(--divider);
  }
  .hero-credit { margin-top: 32px; display: flex; align-items: center; gap: 10px; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--muted); }
  .hero-credit-dots { display: flex; gap: -6px; }
  .hero-credit-dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--bg); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; margin-left: -8px; }

  /* PHONE MOCKUP */
  .hero-phone { display: flex; justify-content: center; position: relative; }
  .phone-frame {
    width: 260px; height: 562px;
    background: var(--text);
    border-radius: 40px;
    padding: 12px;
    box-shadow: 0 30px 80px rgba(28,23,18,0.25), 0 0 0 1px rgba(28,23,18,0.08);
    position: relative;
  }
  .phone-screen { width: 100%; height: 100%; border-radius: 30px; overflow: hidden; }
  .phone-screen img { width: 100%; height: 100%; object-fit: cover; }
  .phone-notch {
    position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
    width: 80px; height: 26px; background: var(--text); border-radius: 0 0 18px 18px; z-index: 2;
  }

  /* SECTION: WHAT IS IT */
  .section { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
  .section-tag { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--acc); margin-bottom: 16px; }
  h2 { font-size: clamp(32px, 4vw, 52px); letter-spacing: -1px; line-height: 1.1; color: var(--text); margin-bottom: 20px; }
  .section-sub { font-family: 'Inter', sans-serif; font-size: 17px; line-height: 1.7; color: var(--muted); max-width: 540px; }

  /* SCREENS SHOWCASE */
  .screens-section { background: var(--card); padding: 80px 24px; overflow: hidden; }
  .screens-inner { max-width: 1200px; margin: 0 auto; }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(6, 160px);
    gap: 20px;
    margin-top: 48px;
    overflow-x: auto;
    padding-bottom: 16px;
  }
  .screen-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(28,23,18,0.12);
    border: 1px solid var(--divider);
    transition: transform 0.2s;
  }
  .screen-card:hover { transform: translateY(-6px); }
  .screen-card img { width: 100%; display: block; }
  .screen-label {
    padding: 10px 12px;
    font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
    letter-spacing: 0.5px; color: var(--muted); text-align: center;
    text-transform: uppercase;
  }

  /* PALETTE */
  .palette-section { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
  .palette-row { display: flex; gap: 16px; margin-top: 40px; flex-wrap: wrap; }
  .swatch {
    flex: 1; min-width: 120px;
    height: 80px; border-radius: 16px;
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 12px; font-family: 'Inter', sans-serif;
  }
  .swatch-name { font-size: 11px; font-weight: 600; opacity: 0.8; }
  .swatch-hex { font-size: 12px; font-weight: 500; opacity: 0.65; font-family: monospace; }

  /* FEATURES */
  .features-section { padding: 80px 24px; background: var(--surf); }
  .features-inner { max-width: 1200px; margin: 0 auto; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
  .feature-card {
    background: var(--bg); border-radius: 20px; padding: 28px;
    border: 1px solid var(--divider);
  }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 16px;
  }
  .feature-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
  .feature-desc { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; color: var(--muted); }

  /* DESIGN DECISIONS */
  .decisions-section { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
  .decisions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
  .decision-card { background: var(--surf); border-radius: 16px; padding: 28px; border: 1px solid var(--divider); }
  .decision-num { font-size: 48px; font-weight: 700; color: var(--acc); opacity: 0.2; line-height: 1; margin-bottom: 12px; }
  .decision-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .decision-body { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; color: var(--muted); }

  /* FOOTER */
  footer {
    background: ${TEXT}; color: rgba(255,255,255,0.7);
    padding: 40px 24px; text-align: center;
    font-family: 'Inter', sans-serif; font-size: 13px;
  }
  footer a { color: rgba(255,255,255,0.5); text-decoration: none; margin: 0 12px; }
  footer .footer-brand { font-family: 'Georgia', serif; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 16px; }
  footer .footer-sub { margin-bottom: 20px; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 40px; text-align: center; }
    .hero-sub, .hero-actions { margin: 0 auto 24px; justify-content: center; }
    .features-grid, .decisions-grid { grid-template-columns: 1fr; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">R<span>E</span>VEL</div>
  <div class="nav-links">
    <a href="#">Discover</a>
    <a href="#">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">See Interactive Mock →</a>
</nav>

<section class="hero">
  <div class="hero-copy">
    <div class="hero-tag">
      <div class="hero-tag-dot"></div>
      RAM Heartbeat #${HEARTBEAT} · Light Theme
    </div>
    <h1>Find <em>what's</em> happening around you</h1>
    <p class="hero-sub">
      A warm editorial event discovery app that feels like browsing a beautiful city magazine —
      not another dark-mode dashboard. Built on the serif revival trend.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">Try Interactive Mock →</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-viewer">View in Pencil</a>
    </div>
    <div class="hero-credit">
      <div class="hero-credit-dots">
        ${['C4511A','4A7B4A','8B5E3C','D97706'].map((c,i)=>`<div class="hero-credit-dot" style="background:#${c};margin-left:${i===0?0:-8}px;">&nbsp;</div>`).join('')}
      </div>
      Inspired by Lapa Ninja's serif revival + Land-book warm palettes
    </div>
  </div>
  <div class="hero-phone">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <img src="${svgDataUris[0]}" alt="Discover screen" />
      </div>
    </div>
  </div>
</section>

<div class="screens-section">
  <div class="screens-inner">
    <div class="section-tag">6 Screens</div>
    <h2>The full experience</h2>
    <div class="screens-grid">
      ${pen.screens.map((s, i) => `
        <div class="screen-card">
          <img src="${svgDataUris[i]}" alt="${s.name}" />
          <div class="screen-label">${s.name}</div>
        </div>
      `).join('')}
    </div>
  </div>
</div>

<section class="palette-section">
  <div class="section-tag">Palette</div>
  <h2>Warm editorial tones</h2>
  <p class="section-sub">Rooted in 1950s–60s advertising warmth — terracotta, forest green, and cream instead of the ubiquitous dark SaaS gradient.</p>
  <div class="palette-row">
    ${[
      {hex:BG,    name:'Warm Cream',  textColor:TEXT},
      {hex:'#F5EFE6',name:'Linen',   textColor:TEXT},
      {hex:ACC,   name:'Terracotta', textColor:'#fff'},
      {hex:'#LACC'.replace('LACC','F5E6DC'),name:'Rust Wash',textColor:TEXT},
      {hex:ACC2,  name:'Forest',     textColor:'#fff'},
      {hex:TEXT,  name:'Warm Black', textColor:'#fff'},
    ].map(sw=>`
      <div class="swatch" style="background:${sw.hex}; border: 1px solid rgba(28,23,18,0.08);">
        <div class="swatch-name" style="color:${sw.textColor}">${sw.name}</div>
        <div class="swatch-hex" style="color:${sw.textColor}">${sw.hex}</div>
      </div>
    `).join('')}
  </div>
</section>

<div class="features-section">
  <div class="features-inner">
    <div class="section-tag">Features</div>
    <h2>Discovery, redefined</h2>
    <div class="features-grid">
      ${[
        {icon:'♦',bg:LACC,color:ACC,title:'Editorial Browse',desc:'Events presented like pages in a city magazine — serif typography and warm color coding replace the cold dark-mode norm.'},
        {icon:'◎',bg:'#E8F2E8',color:ACC2,title:'Live Map View',desc:'Warm parchment-toned map with handcrafted pin styles. Tap a pin to reveal a bottom sheet with swipeable event cards.'},
        {icon:'○',bg:'#F5EAE2',color:'#8B5E3C',title:'Saved & Sorted',desc:'Events organized chronologically with rich date badges and left-edge color coding for instant category recognition.'},
        {icon:'◈',bg:'#FFFBEB',color:'#D97706',title:'Category Palette',desc:'8 distinct categories each with their own warm accent color — from terracotta music to forest-green food events.'},
        {icon:'▶',bg:'#FEF2F2',color:'#DC2626',title:'Rich Detail View',desc:'Hero imagery replaced with textured color fields. Event info organized in clean infocard blocks with attendee presence.'},
        {icon:'◆',bg:'#F3F0FF',color:'#7C3AED',title:'Personal Profile',desc:'Interests, attendance history, and notification toggles — all styled with consistent toggle and tag components.'},
      ].map(f=>`
        <div class="feature-card">
          <div class="feature-icon" style="background:${f.bg}; color:${f.color}">${f.icon}</div>
          <div class="feature-title">${f.title}</div>
          <p class="feature-desc">${f.desc}</p>
        </div>
      `).join('')}
    </div>
  </div>
</div>

<section class="decisions-section">
  <div class="section-tag">Design Decisions</div>
  <h2>Three choices that matter</h2>
  <div class="decisions-grid">
    <div class="decision-card">
      <div class="decision-num">01</div>
      <div class="decision-title">Georgia serif as the display engine</div>
      <p class="decision-body">Directly inspired by Lapa Ninja's documentation of the Victor Serif + Messina Sans pairing on Future.app. Using Georgia as the serif proxy throughout headings and event titles to push the editorial feel.</p>
    </div>
    <div class="decision-card">
      <div class="decision-num">02</div>
      <div class="decision-title">Left-edge color coding over icon reliance</div>
      <p class="decision-body">Each event card has a 4px left accent bar matching the category color. This creates a music-notation-like reading rhythm — your eye scans the edge colors before reading text.</p>
    </div>
    <div class="decision-card">
      <div class="decision-num">03</div>
      <div class="decision-title">Terracotta hero card over photography</div>
      <p class="decision-body">Featured events use a textured terracotta block with dot-grid patterns rather than hero images. Inspired by Land-book's warm muted advertising palette trend — earthy and distinct without needing real assets.</p>
    </div>
  </div>
</section>

<footer>
  <div class="footer-brand">REVEL</div>
  <div class="footer-sub">${TAGLINE}</div>
  <div>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
  <div style="margin-top:20px;opacity:0.4;">RAM Design Heartbeat #${HEARTBEAT} · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
</footer>

</body>
</html>`;

// ── Viewer HTML ──
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ──
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} — https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status} — https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
