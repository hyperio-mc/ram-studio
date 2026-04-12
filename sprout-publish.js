'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'sprout';
const APP_NAME = 'SPROUT';
const TAGLINE = 'Your herbs, thriving';

// Palette
const C = {
  bg: '#080C07', surf: '#0F1510', card: '#172016', card2: '#1E2A1B',
  accent: '#5EC945', accent2: '#D4A94A', accent3: '#4FA8D4',
  text: '#E2DFCF', textDim: '#9A9884', border: '#2A3426',
};

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
const pen = JSON.parse(penJson);

// ── Build screen SVG previews ──────────────────────────────────────
function buildScreenSvg(screen) {
  const W = 390, H = 844;
  const elements = screen.elements || [];
  const svgParts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`];

  elements.forEach(el => {
    if (el.type === 'rect') {
      svgParts.push(`<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`);
    } else if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const fw = el.fontWeight || 400;
      svgParts.push(`<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${fw}" font-family="${el.fontFamily||'Inter,sans-serif'}" text-anchor="${anchor}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity||1}">${el.content}</text>`);
    } else if (el.type === 'circle') {
      svgParts.push(`<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`);
    } else if (el.type === 'line') {
      svgParts.push(`<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`);
    } else if (el.type === 'ellipse') {
      svgParts.push(`<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}" fill="${el.fill}" opacity="${el.opacity||1}" transform="${el.transform||''}"/>`);
    } else if (el.type === 'polygon') {
      svgParts.push(`<polygon points="${el.points}" fill="${el.fill}" opacity="${el.opacity||1}"/>`);
    }
  });

  svgParts.push('</svg>');
  return svgParts.join('');
}

// ── Hero page ────────────────────────────────────────────────────
const screenSvgs = pen.screens.map(s => buildScreenSvg(s));
const svgDataUris = screenSvgs.map(svg => 'data:image/svg+xml,' + encodeURIComponent(svg));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${C.bg}; --surf: ${C.surf}; --card: ${C.card}; --card2: ${C.card2};
    --accent: ${C.accent}; --accent2: ${C.accent2}; --accent3: ${C.accent3};
    --text: ${C.text}; --dim: ${C.textDim}; --border: ${C.border};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; }
  a { color: var(--accent); text-decoration: none; }

  /* ─ Nav ─ */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 64px;
    background: rgba(8,12,7,0.85); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: var(--text); }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { font-size: 13px; color: var(--dim); transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: var(--bg) !important; padding: 8px 18px; border-radius: 20px; font-weight: 600; font-size: 13px; }
  .nav-cta:hover { opacity: 0.9; }

  /* ─ Hero ─ */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 120px 24px 80px; text-align: center; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(94,201,69,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(94,201,69,0.1); border: 1px solid rgba(94,201,69,0.25);
    color: var(--accent); font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
    padding: 6px 14px; border-radius: 20px; margin-bottom: 28px; text-transform: uppercase;
  }
  .hero-tag::before { content: '⬡'; font-size: 10px; }
  h1 {
    font-size: clamp(52px, 8vw, 88px); font-weight: 800;
    letter-spacing: -3px; line-height: 1.0; margin-bottom: 16px;
  }
  h1 span { color: var(--accent); }
  .hero-sub {
    font-size: 18px; color: var(--dim); max-width: 480px; margin: 0 auto 40px;
    font-weight: 400; line-height: 1.65;
  }
  .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: var(--bg); border: none; cursor: pointer;
    padding: 14px 28px; border-radius: 24px; font-size: 14px; font-weight: 700;
    letter-spacing: -0.2px; transition: all 0.2s;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(94,201,69,0.3); }
  .btn-secondary {
    background: var(--card); color: var(--text); border: 1px solid var(--border);
    padding: 14px 28px; border-radius: 24px; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* ─ Screen carousel ─ */
  .carousel-section { padding: 80px 0 60px; position: relative; }
  .carousel-label {
    text-align: center; font-size: 12px; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--dim); margin-bottom: 48px;
  }
  .carousel {
    display: flex; gap: 20px; overflow-x: auto; padding: 0 40px 24px;
    scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .carousel::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 220px; scroll-snap-align: center;
    background: var(--card); border-radius: 24px; overflow: hidden;
    border: 1px solid var(--border); transition: all 0.3s; cursor: pointer;
  }
  .screen-card:hover { transform: translateY(-6px); border-color: rgba(94,201,69,0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
  .screen-card img { width: 100%; height: auto; display: block; }
  .screen-label { padding: 12px 14px; font-size: 11px; font-weight: 600; color: var(--dim); letter-spacing: 0.5px; }

  /* ─ Features ─ */
  .features { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
  .section-tag {
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; color: var(--accent2); margin-bottom: 16px;
  }
  .section-title { font-size: clamp(32px, 4vw, 48px); font-weight: 800; letter-spacing: -1.5px; margin-bottom: 52px; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .feature-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 20px;
    padding: 28px; transition: border-color 0.2s;
  }
  .feature-card:hover { border-color: rgba(94,201,69,0.3); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 16px;
  }
  .feature-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.3px; }
  .feature-card p { font-size: 13px; color: var(--dim); line-height: 1.6; }

  /* ─ Palette ─ */
  .palette-section { padding: 60px 24px; max-width: 1100px; margin: 0 auto; }
  .swatches { display: flex; gap: 12px; flex-wrap: wrap; }
  .swatch { border-radius: 12px; height: 64px; flex: 1 1 80px; position: relative; overflow: hidden; }
  .swatch-label {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 6px 10px; background: rgba(0,0,0,0.4);
    font-size: 9px; font-weight: 600; letter-spacing: 0.5px; color: #fff;
    text-transform: uppercase;
  }

  /* ─ Links ─ */
  .links-section {
    padding: 60px 24px; max-width: 700px; margin: 0 auto; text-align: center;
  }
  .links-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 28px; }
  .link-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--card); border: 1px solid var(--border);
    color: var(--text); padding: 10px 20px; border-radius: 20px;
    font-size: 13px; font-weight: 500; transition: all 0.2s;
  }
  .link-pill:hover { border-color: var(--accent); color: var(--accent); }

  /* ─ Footer ─ */
  footer {
    text-align: center; padding: 32px 24px;
    border-top: 1px solid var(--border);
    font-size: 12px; color: var(--dim);
  }

  @media (max-width: 600px) {
    .nav-links { display: none; }
    .hero { padding: 100px 20px 60px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">SPR<span>OUT</span></div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-links nav-cta">Try mock →</a>
</nav>

<section class="hero">
  <div class="hero-tag">RAM Heartbeat #464 · Dark Theme</div>
  <h1><span>SPROUT</span></h1>
  <p class="hero-sub">Your herbs, thriving. A warm-dark tracker for home herb gardens — log growth, build watering habits, and harvest more.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View in Pencil →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive mock</a>
  </div>
</section>

<section class="carousel-section" id="screens">
  <p class="carousel-label">6 screens · 581 elements</p>
  <div class="carousel">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${svgDataUris[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${String(i+1).padStart(2,'0')} — ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <p class="section-tag">Features</p>
  <h2 class="section-title">Everything your herbs need</h2>
  <div class="features-grid">
    ${[
      { icon: '⬡', col: C.accent,  bg: 'rgba(94,201,69,0.1)',  title: 'Garden Dashboard',   desc: 'Bento-style overview of all your plants — health scores, watering status, and today\'s task list at a glance.' },
      { icon: '💧', col: C.accent3, bg: 'rgba(79,168,212,0.1)', title: 'Watering Log',        desc: '11-day streak tracking, weekly calendar view, and per-plant ml logging with optional photo attachments.' },
      { icon: '📖', col: C.accent2, bg: 'rgba(212,169,74,0.1)', title: 'Grow Journal',        desc: 'Timestamped observations per plant with tags (Growth, Concern, Harvest, Repotted) and photo entries.' },
      { icon: '✦',  col: C.accent,  bg: 'rgba(94,201,69,0.1)',  title: 'Harvest Tracker',    desc: 'Season totals, upcoming harvest predictions, and a full history of yields with how you used each batch.' },
      { icon: '◈',  col: C.accent3, bg: 'rgba(79,168,212,0.1)', title: 'Plant Detail',        desc: 'Per-plant care status with water/light/nutrient/humidity gauges, next actions timeline, and journal preview.' },
      { icon: '🌸', col: C.accent2, bg: 'rgba(212,169,74,0.1)', title: 'Seasonal Discovery', desc: 'Contextual planting guides — which herbs to sow now, germination timelines, and growing tips.' },
    ].map(f => `
    <div class="feature-card">
      <div class="feature-icon" style="background:${f.bg}; color:${f.col};">${f.icon}</div>
      <h3>${f.title}</h3>
      <p>${f.desc}</p>
    </div>`).join('')}
  </div>
</section>

<section class="palette-section" id="palette">
  <p class="section-tag">Palette</p>
  <h2 class="section-title" style="margin-bottom:28px;">Warm dark botanical</h2>
  <p style="color:var(--dim); font-size:14px; margin-bottom:28px;">Inspired by DarkModeDesign.com: warm dark palettes differentiating from cold-tech dark — earthy green meets harvest amber on a near-black forest floor.</p>
  <div class="swatches">
    ${[
      { hex: C.bg,      name: 'Forest Floor' },
      { hex: C.surf,    name: 'Undergrowth' },
      { hex: C.card,    name: 'Bark' },
      { hex: C.accent,  name: 'Herb Green' },
      { hex: C.accent2, name: 'Harvest Amber' },
      { hex: C.accent3, name: 'Morning Dew' },
      { hex: C.text,    name: 'Warm Cream' },
    ].map(s => `
    <div class="swatch" style="background:${s.hex}; border: 1px solid var(--border);">
      <div class="swatch-label">${s.hex}<br>${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="links-section">
  <h2 style="font-size:24px; font-weight:700; margin-bottom:8px;">Explore SPROUT</h2>
  <p style="color:var(--dim); font-size:14px;">Browse every screen or interact with the live mock</p>
  <div class="links-row">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-pill">📐 Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-pill">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <p>RAM Design Heartbeat #464 · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:6px; opacity:0.5;">Inspired by DarkModeDesign.com warm dark palette trends + analog creative hobby app niche</p>
</footer>

</body>
</html>`;

// ── Viewer ─────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const penJsonStr = JSON.stringify(penJson);
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${penJsonStr};</script>\n<script>`);

// ── Publish both ───────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 80) : '✓');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 80) : '✓');
}
main().catch(console.error);
