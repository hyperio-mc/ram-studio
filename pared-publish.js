'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'pared';
const NAME    = 'PARED';
const TAGLINE = 'personal finance, stripped bare';

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
const pen     = JSON.parse(penJson);

// ─── Palette (mirrors generator) ─────────────────────────
const P = {
  bg:      '#F8F6F2',
  surf:    '#FFFFFF',
  card:    '#EEEBe6',
  text:    '#1A1818',
  muted:   '#7A7875',
  dim:     '#B8B5B0',
  accent:  '#AAFB5C',
  accent2: '#3D3B38',
  pos:     '#3DAE7C',
  neg:     '#E05A5A',
};

// ─── SVG screen thumbnails ────────────────────────────────
function screenToSVG(sc, idx) {
  const W = 390, H = 844, scale = 0.36;
  const sw = Math.round(W * scale);
  const sh = Math.round(H * scale);

  const elSVG = sc.elements.map(el => {
    if (el.type === 'rect') {
      const fill = el.fill === 'none' ? 'none' : el.fill;
      const stroke = el.stroke && el.stroke !== 'none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"` : '';
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${fill}" rx="${el.rx||0}" opacity="${el.opacity||1}"${stroke}/>`;
    }
    if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="Inter,sans-serif" text-anchor="${anchor}" opacity="${el.opacity||1}" letter-spacing="${el.letterSpacing||0}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (el.type === 'circle') {
      const stroke = el.stroke && el.stroke !== 'none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"` : '';
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}"${stroke}/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}" stroke-linecap="round"/>`;
    }
    return '';
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${sw}" height="${sh}" style="border-radius:12px;box-shadow:0 4px 32px rgba(26,24,24,0.12);background:${P.bg}">
  ${elSVG}
</svg>`;
}

// ─── Hero HTML ────────────────────────────────────────────
function buildHero() {
  const svgs = pen.screens.map((sc, i) => screenToSVG(sc, i));

  const thumbs = pen.screens.map((sc, i) => `
    <div class="thumb" onclick="showScreen(${i})">
      <div class="thumb-wrap" id="thumb-${i}">${svgs[i]}</div>
      <div class="thumb-label">${sc.name}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:     ${P.bg};
    --surf:   ${P.surf};
    --card:   ${P.card};
    --text:   ${P.text};
    --muted:  ${P.muted};
    --dim:    ${P.dim};
    --accent: ${P.accent};
    --accent2:${P.accent2};
    --pos:    ${P.pos};
    --neg:    ${P.neg};
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.5; }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 56px;
    background: rgba(248,246,242,0.88); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--dim);
  }
  .nav-logo { font-size: 13px; font-weight: 700; letter-spacing: 3px; color: var(--text); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 12px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    font-size: 12px; font-weight: 600; color: var(--text);
    background: var(--accent); border: none;
    padding: 8px 18px; border-radius: 4px; cursor: pointer; text-decoration: none;
    transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    padding: 120px 32px 80px;
    max-width: 900px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-kicker { font-size: 10px; font-weight: 700; letter-spacing: 3px; color: var(--accent2); margin-bottom: 16px; }
  .hero-title { font-size: 52px; font-weight: 700; line-height: 1.05; letter-spacing: -1px; margin-bottom: 8px; }
  .hero-title span { font-weight: 300; }
  .hero-tagline { font-size: 16px; color: var(--muted); font-weight: 400; margin-bottom: 32px; line-height: 1.6; max-width: 380px; }
  .hero-accent-line { width: 60px; height: 3px; background: var(--accent); border-radius: 2px; margin-bottom: 32px; }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    background: var(--text); color: #fff; font-size: 13px; font-weight: 600;
    padding: 12px 28px; border-radius: 4px; text-decoration: none; transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-secondary {
    font-size: 12px; font-weight: 500; color: var(--muted); text-decoration: none;
  }
  .btn-secondary:hover { color: var(--text); }

  /* Hero mock phone */
  .hero-phone {
    display: flex; justify-content: center;
  }
  .hero-phone svg { border-radius: 16px; box-shadow: 0 8px 48px rgba(26,24,24,0.14); }

  /* SCREENS CAROUSEL */
  .screens-section {
    max-width: 1100px; margin: 0 auto; padding: 80px 32px;
    border-top: 1px solid var(--dim);
  }
  .section-kicker { font-size: 10px; font-weight: 700; letter-spacing: 3px; color: var(--muted); margin-bottom: 12px; }
  .section-title { font-size: 28px; font-weight: 700; margin-bottom: 48px; }
  .thumbs { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 16px; }
  .thumbs::-webkit-scrollbar { height: 4px; }
  .thumbs::-webkit-scrollbar-track { background: var(--card); border-radius: 2px; }
  .thumbs::-webkit-scrollbar-thumb { background: var(--dim); border-radius: 2px; }
  .thumb { cursor: pointer; flex-shrink: 0; }
  .thumb-wrap { transition: transform 0.2s; }
  .thumb:hover .thumb-wrap { transform: translateY(-4px); }
  .thumb-label { font-size: 10px; color: var(--muted); text-align: center; margin-top: 10px; font-weight: 500; letter-spacing: 0.5px; }

  /* FEATURES */
  .features { background: var(--surf); border-top: 1px solid var(--dim); border-bottom: 1px solid var(--dim); }
  .features-inner { max-width: 900px; margin: 0 auto; padding: 80px 32px; display: grid; grid-template-columns: repeat(3,1fr); gap: 48px; }
  .feature-num { font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: 2px; margin-bottom: 12px; }
  .feature-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feature-body { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* PALETTE */
  .palette-section { max-width: 900px; margin: 0 auto; padding: 64px 32px; }
  .swatches { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
  .swatch { border-radius: 3px; }
  .swatch-label { font-size: 10px; color: var(--muted); margin-top: 6px; text-align: center; }

  /* LINKS */
  .links-section { max-width: 900px; margin: 0 auto; padding: 0 32px 80px; display: flex; gap: 32px; align-items: center; }
  .link-btn {
    font-size: 12px; font-weight: 600; color: var(--text); text-decoration: none;
    padding: 10px 20px; border-radius: 4px; border: 1px solid var(--dim); transition: all 0.2s;
  }
  .link-btn:hover { border-color: var(--text); }
  .link-btn.accent { background: var(--accent); border-color: var(--accent); }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--dim); padding: 32px;
    max-width: 900px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo { font-size: 11px; font-weight: 700; letter-spacing: 3px; }
  .footer-credit { font-size: 10px; color: var(--muted); }
  .footer-hb { font-size: 10px; color: var(--accent2); font-weight: 600; letter-spacing: 1px; }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">PARED</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/pared-viewer">Viewer</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/pared-mock">Interactive Mock ☀◑</a>
</nav>

<div class="hero">
  <div>
    <div class="hero-kicker">PERSONAL FINANCE · HEARTBEAT #102</div>
    <div class="hero-title">Finance <span>clarity,</span><br>stripped bare.</div>
    <div class="hero-accent-line"></div>
    <div class="hero-tagline">No noise. No gamification. Just your money, laid out with editorial precision and a single chromatic accent.</div>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/pared-mock">Try the mock ☀◑</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/pared-viewer">Open in viewer →</a>
    </div>
  </div>
  <div class="hero-phone">
    ${svgs[0]}
  </div>
</div>

<div class="screens-section" id="screens">
  <div class="section-kicker">SIX SCREENS</div>
  <div class="section-title">Every view, no clutter.</div>
  <div class="thumbs">
    ${thumbs}
  </div>
</div>

<div class="features" id="features">
  <div class="features-inner">
    <div>
      <div class="feature-num">01</div>
      <div class="feature-title">One lime accent, zero decoration</div>
      <div class="feature-body">Inspired by ProtoEditions on Minimal Gallery — a warm off-white canvas with a single vibrant lime as the only chromatic signal. Your eye goes exactly where it needs to.</div>
    </div>
    <div>
      <div class="feature-num">02</div>
      <div class="feature-title">Editorial typographic hierarchy</div>
      <div class="feature-body">Serif revival trend from Lapa Ninja — finance data presented like a quarterly letter, not a trading terminal. Weights and spacing do the work, not color noise.</div>
    </div>
    <div>
      <div class="feature-num">03</div>
      <div class="feature-title">Grid discipline over decoration</div>
      <div class="feature-body">Strict column alignment throughout. Every element earns its space. Inspired by the "barely-there UI" pole identified across Minimal Gallery's most-featured sites.</div>
    </div>
  </div>
</div>

<div class="palette-section">
  <div class="section-kicker">PALETTE</div>
  <div class="section-title" style="font-size:18px;margin-bottom:0">Warm restraint</div>
  <div class="swatches">
    ${[
      {col:P.bg,    label:'Canvas',  size:72},
      {col:P.surf,  label:'Surface', size:72},
      {col:P.card,  label:'Card',    size:72},
      {col:P.text,  label:'Text',    size:72},
      {col:P.muted, label:'Muted',   size:72},
      {col:P.dim,   label:'Dim',     size:72},
      {col:P.accent,label:'Lime ✦',  size:72},
      {col:P.pos,   label:'Gain',    size:72},
      {col:P.neg,   label:'Loss',    size:72},
    ].map(s => `<div><div class="swatch" style="width:${s.size}px;height:${s.size}px;background:${s.col};border:1px solid ${P.dim}"></div><div class="swatch-label">${s.label}<br><span style="font-size:9px;letter-spacing:0">${s.col}</span></div></div>`).join('')}
  </div>
</div>

<div class="links-section">
  <a class="link-btn accent" href="https://ram.zenbin.org/pared-mock">Interactive Mock ☀◑</a>
  <a class="link-btn" href="https://ram.zenbin.org/pared-viewer">Pencil Viewer</a>
  <span style="font-size:11px;color:var(--muted)">409 elements · 6 screens · Light theme</span>
</div>

<footer style="border-top:1px solid var(--dim);padding:32px;display:flex;justify-content:space-between;align-items:center">
  <div class="footer-logo">PARED</div>
  <div class="footer-credit">RAM Design Heartbeat #102 · April 2026</div>
  <div class="footer-hb">ram.zenbin.org/pared</div>
</footer>

</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────
async function main() {
  console.log('Building hero...');
  const heroHtml = buildHero();

  console.log('Building viewer...');
  let viewerHtml = fs.readFileSync(
    path.join(__dirname, 'viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0,120) : '✓');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, `${NAME} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0,120) : '✓');
}

main().catch(console.error);
