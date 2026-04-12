'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'campo';

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
const BG    = '#F6F2EB';
const SURF  = '#FFFFFF';
const TEXT  = '#1C160C';
const EARTH = '#8B5E3C';
const SAGE  = '#4D7A56';
const AMBER = '#D97C2A';
const MUTED = 'rgba(28,22,12,0.45)';

// ─── SVG THUMBNAILS ───────────────────────────────────────────────────────────
function screenSvg(screen) {
  const w = 390, h = 844;
  const els = screen.elements || [];
  let svgEls = '';
  for (const e of els) {
    if (e.type === 'rect') {
      const rx = e.rx || 0;
      const op = e.opacity !== undefined ? e.opacity : 1;
      const stroke = e.stroke && e.stroke !== 'none' ? `stroke="${e.stroke}" stroke-width="${e.sw||1}"` : '';
      svgEls += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${rx}" fill="${e.fill}" opacity="${op}" ${stroke}/>`;
    } else if (e.type === 'text') {
      const anchor = e.anchor || 'start';
      const fw = e.fw || 400;
      const op = e.opacity !== undefined ? e.opacity : 1;
      const ls = e.ls ? `letter-spacing="${e.ls}"` : '';
      const escaped = String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgEls += `<text x="${e.x}" y="${e.y}" font-size="${e.size}" fill="${e.fill}" font-weight="${fw}" text-anchor="${anchor}" opacity="${op}" ${ls}>${escaped}</text>`;
    } else if (e.type === 'circle') {
      const op = e.opacity !== undefined ? e.opacity : 1;
      const stroke = e.stroke && e.stroke !== 'none' ? `stroke="${e.stroke}" stroke-width="${e.sw||1}"` : '';
      svgEls += `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${op}" ${stroke}/>`;
    } else if (e.type === 'line') {
      const op = e.opacity !== undefined ? e.opacity : 1;
      svgEls += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.sw||1}" opacity="${op}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${svgEls}</svg>`;
}

function toDataUri(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const svgUris = pen.screens.map(s => toDataUri(screenSvg(s)));

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CAMPO — Seasonal Food & Local Farm Discovery</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${BG};--surf:${SURF};--text:${TEXT};
    --earth:${EARTH};--sage:${SAGE};--amber:${AMBER};
    --muted:${MUTED};--card:#F0EBE0;
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* HERO */
  .hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:80px 48px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-120px;right:-80px;width:520px;height:520px;
    background:radial-gradient(circle,rgba(77,122,86,0.15) 0%,transparent 70%);border-radius:50%;pointer-events:none}
  .hero::after{content:'';position:absolute;bottom:-80px;left:-60px;width:400px;height:400px;
    background:radial-gradient(circle,rgba(217,124,42,0.12) 0%,transparent 70%);border-radius:50%;pointer-events:none}
  .hero-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(77,122,86,0.12);
    border:1px solid rgba(77,122,86,0.25);border-radius:100px;padding:6px 16px;
    font-size:11px;font-weight:600;color:var(--sage);letter-spacing:.1em;text-transform:uppercase;margin-bottom:32px;width:fit-content}
  .hero-tag span{width:6px;height:6px;background:var(--sage);border-radius:50%;display:inline-block}
  .hero-title{font-size:clamp(72px,10vw,120px);font-weight:900;line-height:.92;letter-spacing:-.03em;
    color:var(--text);margin-bottom:24px;position:relative;z-index:1}
  .hero-title em{color:var(--earth);font-style:normal}
  .hero-sub{font-size:18px;font-weight:400;color:var(--muted);line-height:1.6;max-width:520px;margin-bottom:40px}
  .hero-ctas{display:flex;gap:16px;flex-wrap:wrap}
  .btn-primary{background:var(--earth);color:#fff;padding:14px 32px;border-radius:100px;
    font-size:14px;font-weight:600;text-decoration:none;letter-spacing:.02em;
    transition:transform .15s,box-shadow .15s}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(139,94,60,0.3)}
  .btn-secondary{background:transparent;border:1.5px solid rgba(28,22,12,0.2);color:var(--text);
    padding:14px 32px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;
    transition:border-color .15s}
  .btn-secondary:hover{border-color:var(--earth)}
  .hero-stats{display:flex;gap:48px;margin-top:56px;padding-top:40px;border-top:1px solid rgba(28,22,12,0.1)}
  .stat-val{font-size:28px;font-weight:700;color:var(--earth)}
  .stat-lab{font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:2px}

  /* TICKER */
  .ticker-wrap{background:var(--earth);padding:10px 0;overflow:hidden;white-space:nowrap}
  .ticker-inner{display:inline-flex;animation:ticker 28s linear infinite}
  .ticker-item{font-size:11px;font-weight:600;color:rgba(255,255,255,0.85);
    padding:0 32px;letter-spacing:.12em;text-transform:uppercase}
  .ticker-dot{color:rgba(255,255,255,0.45)}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

  /* SCREENS */
  .screens-section{padding:80px 48px;background:var(--bg)}
  .section-label{font-size:11px;font-weight:600;color:var(--sage);letter-spacing:.12em;
    text-transform:uppercase;margin-bottom:12px}
  .section-title{font-size:clamp(28px,4vw,48px);font-weight:700;color:var(--text);margin-bottom:48px}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;
    max-width:1280px;margin:0 auto}
  .screen-card{background:var(--surf);border-radius:20px;overflow:hidden;
    border:1px solid rgba(28,22,12,0.08);transition:transform .2s,box-shadow .2s;cursor:pointer}
  .screen-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(28,22,12,0.1)}
  .screen-card img{width:100%;display:block}
  .screen-label{padding:12px 16px;font-size:12px;font-weight:600;color:var(--text)}

  /* FEATURES */
  .features{padding:80px 48px;background:var(--card)}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;max-width:1100px;margin:40px auto 0}
  .feat{background:var(--surf);border-radius:16px;padding:28px;border:1px solid rgba(28,22,12,0.07)}
  .feat-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;
    font-size:18px;margin-bottom:16px}
  .feat-title{font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px}
  .feat-desc{font-size:13px;color:var(--muted);line-height:1.6}

  /* PALETTE */
  .palette{padding:60px 48px}
  .palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
  .swatch{border-radius:12px;flex:1;min-width:80px;height:72px;display:flex;flex-direction:column;
    justify-content:flex-end;padding:10px 12px}
  .swatch-name{font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
  .swatch-hex{font-size:9px;font-weight:400;opacity:.7}

  /* FOOTER */
  .footer{background:var(--text);color:rgba(250,248,245,0.7);text-align:center;padding:40px 24px;font-size:12px}
  .footer a{color:rgba(217,124,42,0.9);text-decoration:none}

  @media(max-width:640px){
    .hero{padding:80px 24px 48px}
    .hero-stats{gap:24px;flex-wrap:wrap}
    .screens-section,.features,.palette{padding:60px 24px}
  }
</style>
</head>
<body>

<section class="hero">
  <div class="hero-tag"><span></span>Heartbeat #46 · Light Theme</div>
  <h1 class="hero-title">CAMPO<br><em>Eat Local,</em><br>Know Your Farm</h1>
  <p class="hero-sub">Discover what's in season, find your nearest farmers market, track local food purchases, and support the farms behind your meals.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/campo-viewer" class="btn-primary">View in Pencil.dev →</a>
    <a href="https://ram.zenbin.org/campo-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
  <div class="hero-stats">
    <div><div class="stat-val">6</div><div class="stat-lab">Screens</div></div>
    <div><div class="stat-val">508</div><div class="stat-lab">Elements</div></div>
    <div><div class="stat-val">Light</div><div class="stat-lab">Theme</div></div>
    <div><div class="stat-val">#46</div><div class="stat-lab">Heartbeat</div></div>
  </div>
</section>

<div class="ticker-wrap"><div class="ticker-inner">
${['TODAY','MARKETS','FARM DETAIL','SEASON CALENDAR','PANTRY','PROFILE','LOCAL FOOD','SEASONAL SOURCING',
   'FARM DISCOVERY','ORGANIC','BIODYNAMIC','CHAMONIX','ALPINE PRODUCE','ZERO WASTE','CAMPO'].map(t =>
   `<span class="ticker-item">${t} <span class="ticker-dot">·</span></span>`).join('').repeat(2)}
</div></div>

<section class="screens-section">
  <div class="section-label">6 screens</div>
  <div class="section-title">Farm-to-Table, Designed</div>
  <div class="screens-grid">
    ${pen.screens.map((s,i) => `
    <div class="screen-card">
      <img src="${svgUris[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <div class="section-label">Design System</div>
  <div class="section-title">What Makes CAMPO</div>
  <div class="features-grid">
    <div class="feat">
      <div class="feat-icon" style="background:rgba(77,122,86,0.12)">🌱</div>
      <div class="feat-title">Warm Earth Palette</div>
      <div class="feat-desc">Cream BG #F6F2EB, deep earth #8B5E3C, sage green #4D7A56 — inspired by Oryzo AI's human-first warm palette and land-book's 2026 earth neutral trend.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(217,124,42,0.12)">◉</div>
      <div class="feat-title">Organic Blob Accents</div>
      <div class="feat-desc">Soft radial circles replace hard geometric shapes — ambient, non-intrusive depth that echoes the organic nature of farm produce and seasonal rhythms.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(139,94,60,0.12)">⊟</div>
      <div class="feat-title">Colour-Coded Freshness</div>
      <div class="feat-desc">Sage left-border = peak season. Amber = recently harvested. Blush = selling out soon. A single visual language communicates urgency without text clutter.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(77,122,86,0.12)">◈</div>
      <div class="feat-title">Season Availability Chart</div>
      <div class="feat-desc">Horizontal bar chart with three-state fills (peak / available / end of season) and a 12-month month picker — calendar and supply chain in a single glance.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(217,124,42,0.12)">◇</div>
      <div class="feat-title">Pantry + Shopping List</div>
      <div class="feat-desc">Dual-section pantry screen: a living shopping list with urgency flags (earth-filled checkbox = "get today") and an in-stock tracker with farm provenance.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(139,94,60,0.12)">◎</div>
      <div class="feat-title">Impact Dashboard</div>
      <div class="feat-desc">Profile tracks local-food impact metrics — CO₂ saved, farms supported, local spend — turning purchasing choices into a visible environmental story.</div>
    </div>
  </div>
</section>

<section class="palette">
  <div class="section-label">Palette</div>
  <div class="section-title">Warm Earth Spectrum</div>
  <div class="palette-row">
    ${[
      {col:'#F6F2EB',name:'Cream',   light:false},
      {col:'#FFFFFF', name:'Surface', light:false},
      {col:'#F0EBE0', name:'Card',    light:false},
      {col:'#1C160C', name:'Text',    light:true },
      {col:'#8B5E3C', name:'Earth',   light:true },
      {col:'#4D7A56', name:'Sage',    light:true },
      {col:'#D97C2A', name:'Amber',   light:true },
      {col:'#C97B5A', name:'Blush',   light:true },
    ].map(s => `<div class="swatch" style="background:${s.col}">
      <div class="swatch-name" style="color:${s.light?'rgba(255,255,255,0.85)':'rgba(28,22,12,0.7)'}">${s.name}</div>
      <div class="swatch-hex" style="color:${s.light?'rgba(255,255,255,0.6)':'rgba(28,22,12,0.5)'}">${s.col}</div>
    </div>`).join('')}
  </div>
</section>

<footer class="footer">
  <p>CAMPO · Heartbeat #46 · RAM Design Studio · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:8px">Inspired by Oryzo AI warm palette · land-book organic shapes · Siteinspire earth neutral trend 2026</p>
</footer>

</body>
</html>`;

// ─── VIEWER ───────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'CAMPO — Seasonal Food & Local Farm Discovery');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'CAMPO — Pencil.dev Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
