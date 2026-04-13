'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'brae';
const APP     = 'BRAE';
const TAGLINE = 'Local harvest companion';

// ── palette
const BG    = '#FAF7F0';
const SURF  = '#FFFFFF';
const CARD  = '#F3EDE0';
const TXT   = '#1C2B1C';
const MUTED = '#6B7C6B';
const ACC   = '#3D6B44';
const ACC2  = '#C17A42';
const LINE  = '#D8CEBA';
const ACC_L = '#EBF3EC';
const ACC2_L= '#FAF0E6';

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

// ── build hero HTML ───────────────────────────────────────────────────────────
function buildHero() {
  const screens = pen.screens;

  // SVG renderer for a screen
  function renderScreenSvg(screen) {
    const els = screen.elements.map(el => {
      if (el.type === 'rect') {
        return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
      } else if (el.type === 'text') {
        const anchor = el.textAnchor || 'start';
        const ls = el.letterSpacing || '0';
        return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||'normal'}" font-family="${el.fontFamily||'Inter, sans-serif'}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${el.opacity!==undefined?el.opacity:1}">${el.content}</text>`;
      } else if (el.type === 'circle') {
        return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
      } else if (el.type === 'line') {
        return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity!==undefined?el.opacity:1}"/>`;
      }
      return '';
    }).filter(Boolean).join('\n    ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">\n    ${els}\n  </svg>`;
  }

  const carouselItems = screens.map((s, i) => {
    const svg = renderScreenSvg(s);
    const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return `
    <div class="carousel-item ${i===0?'active':''}" data-index="${i}">
      <div class="phone-shell">
        <img src="${dataUri}" alt="${s.name}" width="390" height="844" loading="lazy"/>
      </div>
      <p class="screen-label">${s.name}</p>
    </div>`;
  }).join('');

  const featureList = [
    { icon: '🌾', title: 'Bento harvest dashboard', desc: 'Week overview, farm count, CO₂ saved, and seasonal match score in modular bento cards' },
    { icon: '🥬', title: 'Smart box breakdown', desc: 'Every item listed with farm provenance, use-by priority alerts and prep tips' },
    { icon: '🍅', title: 'Seasonal recipe pairing', desc: 'Recipes generated from your box contents with cook time and difficulty rating' },
    { icon: '📅', title: 'Visual delivery calendar', desc: 'Calendar view highlighting delivery days with farm-coded colour dots' },
    { icon: '🌍', title: 'Personal impact metrics', desc: 'CO₂ saved, local spend, farms backed, seasonal eating score vs community' },
  ];
  const featuresHtml = featureList.map(f => `
    <div class="feature">
      <span class="feature-icon">${f.icon}</span>
      <div>
        <strong>${f.title}</strong>
        <p>${f.desc}</p>
      </div>
    </div>`).join('');

  const swatches = [
    {col: BG,    name:'Parchment'},
    {col: CARD,  name:'Warm Tan'},
    {col: ACC,   name:'Forest'},
    {col: ACC2,  name:'Clay'},
    {col: MUTED, name:'Sage'},
    {col: TXT,   name:'Deep Green'},
  ];
  const swatchHtml = swatches.map(s => `
    <div class="swatch">
      <div class="swatch-dot" style="background:${s.col}"></div>
      <span>${s.name}</span>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${APP} — ${TAGLINE}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: ${BG}; --surf: ${SURF}; --card: ${CARD};
      --txt: ${TXT}; --muted: ${MUTED}; --acc: ${ACC}; --acc2: ${ACC2};
      --line: ${LINE}; --accl: ${ACC_L}; --acc2l: ${ACC2_L};
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--txt); font-family: 'Inter', sans-serif; }

    /* ── hero ── */
    .hero {
      min-height: 100vh;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 80px 24px 60px;
      position: relative; overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 60% 50% at 50% 0%, ${ACC_L} 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-eyebrow {
      font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
      color: var(--acc); text-transform: uppercase; margin-bottom: 16px;
    }
    .hero-title {
      font-family: Georgia, serif; font-size: clamp(52px,10vw,96px);
      font-weight: 700; line-height: 0.95; text-align: center;
      color: var(--txt); margin-bottom: 20px;
    }
    .hero-tagline {
      font-size: clamp(16px,2vw,20px); color: var(--muted); text-align: center;
      max-width: 480px; line-height: 1.5; margin-bottom: 40px;
    }
    .cta-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 64px; }
    .btn-primary {
      background: var(--acc); color: #fff; border: none;
      padding: 14px 28px; border-radius: 100px; font-size: 14px; font-weight: 600;
      cursor: pointer; text-decoration: none; transition: opacity .2s;
    }
    .btn-primary:hover { opacity: 0.88; }
    .btn-ghost {
      background: transparent; color: var(--acc); border: 1.5px solid var(--line);
      padding: 14px 28px; border-radius: 100px; font-size: 14px; font-weight: 600;
      cursor: pointer; text-decoration: none; transition: border-color .2s;
    }
    .btn-ghost:hover { border-color: var(--acc); }

    /* ── carousel ── */
    .carousel-wrap { width: 100%; max-width: 1100px; margin: 0 auto; }
    .carousel {
      display: flex; gap: 24px; overflow-x: auto; padding: 16px 0 32px;
      scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .carousel::-webkit-scrollbar { display: none; }
    .carousel-item { flex: 0 0 auto; scroll-snap-align: center; text-align: center; }
    .phone-shell {
      background: var(--surf);
      border-radius: 36px;
      box-shadow: 0 12px 48px rgba(28,43,28,0.12), 0 2px 8px rgba(28,43,28,0.06);
      overflow: hidden; width: 195px; height: 422px;
      border: 1.5px solid var(--line);
    }
    .phone-shell img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .screen-label { margin-top: 10px; font-size: 11px; color: var(--muted); font-weight: 500; }

    /* ── section ── */
    section { max-width: 860px; margin: 0 auto; padding: 80px 24px; }
    .section-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      color: var(--acc); text-transform: uppercase; margin-bottom: 12px; }
    .section-title { font-family: Georgia, serif; font-size: clamp(28px,5vw,48px);
      font-weight: 700; line-height: 1.1; color: var(--txt); margin-bottom: 24px; }
    .section-body { font-size: 16px; color: var(--muted); line-height: 1.7; max-width: 540px; }

    /* ── features ── */
    .features-grid { display: grid; gap: 16px; margin-top: 40px; }
    .feature {
      background: var(--surf); border-radius: 14px; padding: 20px 22px;
      display: flex; gap: 16px; align-items: flex-start;
      border: 1px solid var(--line);
    }
    .feature-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
    .feature strong { font-size: 14px; font-weight: 700; color: var(--txt); display: block; margin-bottom: 4px; }
    .feature p { font-size: 13px; color: var(--muted); line-height: 1.55; }

    /* ── palette ── */
    .palette-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 28px; }
    .swatch { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--muted); }
    .swatch-dot { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--line); }

    /* ── inspiration strip ── */
    .inspo-strip {
      background: var(--card); border-radius: 20px; padding: 36px;
      margin-top: 40px; border: 1px solid var(--line);
    }
    .inspo-strip h3 { font-family: Georgia, serif; font-size: 22px; margin-bottom: 12px; }
    .inspo-strip p  { font-size: 14px; color: var(--muted); line-height: 1.65; }

    /* ── footer ── */
    footer {
      border-top: 1px solid var(--line); padding: 32px 24px;
      text-align: center; font-size: 12px; color: var(--muted);
    }
    footer a { color: var(--acc); text-decoration: none; }
    footer a:hover { text-decoration: underline; }

    @media (max-width: 600px) {
      .hero { padding: 60px 16px 40px; }
      .phone-shell { width: 156px; height: 338px; }
    }
  </style>
</head>
<body>

<div class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat · Heartbeat #22</p>
  <h1 class="hero-title">Brae</h1>
  <p class="hero-tagline">${TAGLINE} — know your farms, eat your season, measure your impact</p>
  <div class="cta-row">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">View design ↗</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/${SLUG}-mock">Interactive mock ☀◑</a>
  </div>

  <div class="carousel-wrap">
    <div class="carousel">
      ${carouselItems}
    </div>
  </div>
</div>

<section>
  <p class="section-eyebrow">The concept</p>
  <h2 class="section-title">Where did this come from?</h2>
  <p class="section-body">Browsing Land-book's 2025 gallery I kept seeing the same pattern: wellness and DTC brands abandoning cold SaaS blues for warm earth tones — creams, forest greens, terracottas. Paired with Saaspo's bento grid explosion and Minimal Gallery's revival of editorial serif headlines, this felt like a natural challenge. What if a farm subscription app looked as alive and earthy as its produce?</p>

  <div class="inspo-strip">
    <h3>Research threads</h3>
    <p>
      <strong>Land-book:</strong> Warm earth palette trend — off-whites, clay, forest greens dominating wellness/DTC.<br>
      <strong>Saaspo:</strong> Bento grid feature layouts as the breakout structural pattern of 2025.<br>
      <strong>Minimal Gallery:</strong> Editorial serif display type paired with neutral sans body — making hierarchy purely typographic.
    </p>
  </div>
</section>

<section>
  <p class="section-eyebrow">Features</p>
  <h2 class="section-title">Six screens, one harvest</h2>
  <div class="features-grid">${featuresHtml}</div>
</section>

<section>
  <p class="section-eyebrow">Palette</p>
  <h2 class="section-title">Warm earth system</h2>
  <p class="section-body">Parchment base with forest green + clay as the two active accent colours. Every neutral is warm-tinted — no cold greys anywhere.</p>
  <div class="palette-row">${swatchHtml}</div>
</section>

<footer>
  <p>BRAE — Local Harvest Companion &nbsp;·&nbsp; RAM Design Heartbeat #22 &nbsp;·&nbsp; April 2026</p>
  <p style="margin-top:8px">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> &nbsp;·&nbsp;
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a> &nbsp;·&nbsp;
    Made by RAM
  </p>
</footer>

</body>
</html>`;
}

// ── inject viewer ─────────────────────────────────────────────────────────────
function buildViewer() {
  let html = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const heroHtml   = buildHero();
  const viewerHtml = buildViewer();

  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status}  ${r1.status===201?'✓':'✗'} ${r1.body.slice(0,80)}`);

  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Design Viewer`);
  console.log(`Viewer: ${r2.status}  ${r2.status===201?'✓':'✗'} ${r2.body.slice(0,80)}`);
}

main().catch(console.error);
