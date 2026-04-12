'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG   = 'bento';
const TITLE  = 'BENTO — Feature Command Center';

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

// ── Encode each screen's elements as an inline SVG data URI ─────────────────
function elementsToSVG(elements, w = 390, h = 844) {
  const shapes = elements.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"
        fill="${el.fill}" rx="${el.rx || 0}" opacity="${el.opacity ?? 1}"
        stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}"/>`;
    }
    if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const ls     = el.letterSpacing ?? 0;
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}"
        fill="${el.fill}" font-weight="${el.fontWeight || 400}"
        font-family="${el.fontFamily || 'Inter,sans-serif'}"
        text-anchor="${anchor}" letter-spacing="${ls}"
        opacity="${el.opacity ?? 1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}"
        fill="${el.fill}" opacity="${el.opacity ?? 1}"
        stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}"/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"
        stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"
        opacity="${el.opacity ?? 1}"/>`;
    }
    return '';
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${shapes}</svg>`;
}

const screenSVGs = screens.map(s => elementsToSVG(s.elements));
const svgDataURIs = screenSVGs.map(svg =>
  'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
);

// ── Palette swatches ─────────────────────────────────────────────────────────
const palette = [
  { name: 'BG',      hex: '#09090D' },
  { name: 'Surface', hex: '#0F1018' },
  { name: 'Card',    hex: '#141620' },
  { name: 'Indigo',  hex: '#818CF8' },
  { name: 'Emerald', hex: '#34D399' },
  { name: 'Amber',   hex: '#FB923C' },
];

const swatchHTML = palette.map(p => `
  <div style="text-align:center">
    <div style="width:52px;height:52px;border-radius:12px;background:${p.hex};
      border:1px solid rgba(255,255,255,0.08);margin:0 auto 6px"></div>
    <div style="font-size:11px;color:#94A3B8;font-family:mono">${p.hex}</div>
    <div style="font-size:10px;color:#475569">${p.name}</div>
  </div>`).join('');

// ── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${TITLE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
  :root {
    --bg:    #09090D;
    --surf:  #0F1018;
    --card:  #141620;
    --acc:   #818CF8;
    --acc2:  #34D399;
    --acc3:  #FB923C;
    --txt:   #F1F5F9;
    --sub:   #94A3B8;
    --mut:   #475569;
    --border: rgba(255,255,255,0.07);
  }
  body { background:var(--bg); color:var(--txt); font-family:'Inter',system-ui,sans-serif; min-height:100vh; overflow-x:hidden }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  /* Glow blobs */
  .blob { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0 }
  .blob-1 { width:400px;height:400px;top:-100px;right:-100px;background:rgba(129,140,248,0.08) }
  .blob-2 { width:300px;height:300px;bottom:100px;left:-80px;background:rgba(52,211,153,0.06) }

  .hero {
    position:relative; z-index:1;
    max-width:900px; margin:0 auto; padding:80px 24px 60px;
    text-align:center;
  }
  .badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(129,140,248,0.12); border:1px solid rgba(129,140,248,0.25);
    border-radius:100px; padding:6px 16px; font-size:12px; color:var(--acc);
    font-weight:600; letter-spacing:0.05em; margin-bottom:28px;
  }
  .badge .dot { width:6px;height:6px;background:var(--acc);border-radius:50%;animation:pulse 2s infinite }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  h1 { font-size:clamp(40px,7vw,72px); font-weight:800; letter-spacing:-0.03em; line-height:1.05; margin-bottom:20px }
  h1 .acc { color:var(--acc) }
  .tagline { font-size:clamp(16px,2vw,20px); color:var(--sub); max-width:560px; margin:0 auto 36px; line-height:1.6 }
  .cta-row { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:60px }
  .btn { padding:13px 28px; border-radius:10px; font-size:14px; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:all 0.2s }
  .btn-pri { background:var(--acc); color:#09090D }
  .btn-pri:hover { background:#9BA8FB; transform:translateY(-1px) }
  .btn-sec { background:var(--card); border:1px solid var(--border); color:var(--txt) }
  .btn-sec:hover { border-color:rgba(129,140,248,0.4); transform:translateY(-1px) }

  /* Screen carousel */
  .screens-row {
    display:flex; gap:16px; overflow-x:auto; padding:0 24px 20px;
    scrollbar-width:thin; scrollbar-color:var(--card) transparent;
    justify-content:center; flex-wrap:wrap;
  }
  .screen-card {
    flex:0 0 auto; width:195px; background:var(--card);
    border:1px solid var(--border); border-radius:16px; overflow:hidden;
    transition:transform 0.2s, box-shadow 0.2s; cursor:pointer;
  }
  .screen-card:hover { transform:translateY(-4px); box-shadow:0 0 30px rgba(129,140,248,0.15) }
  .screen-card img { width:100%; display:block }
  .screen-label { padding:8px 12px; font-size:11px; color:var(--sub); font-weight:500; border-top:1px solid var(--border) }

  /* Feature grid (bento) */
  .features { max-width:900px; margin:80px auto 0; padding:0 24px }
  .features h2 { font-size:clamp(22px,3vw,32px); font-weight:700; margin-bottom:8px }
  .features .sub { color:var(--sub); font-size:15px; margin-bottom:36px }
  .bento { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:48px }
  .tile { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:22px; position:relative; overflow:hidden }
  .tile::before { content:''; position:absolute; top:0; left:8px; right:8px; height:1px; background:rgba(255,255,255,0.12) }
  .tile-wide { grid-column:span 2 }
  .tile-icon { font-size:22px; margin-bottom:12px }
  .tile h3 { font-size:14px; font-weight:700; margin-bottom:6px }
  .tile p { font-size:12px; color:var(--sub); line-height:1.6 }
  .tile-acc { color:var(--acc) }
  .tile-acc2 { color:var(--acc2) }
  .tile-acc3 { color:var(--acc3) }

  /* Palette */
  .palette { max-width:900px; margin:0 auto 80px; padding:0 24px }
  .palette h2 { font-size:20px; font-weight:700; margin-bottom:20px }
  .swatches { display:flex; gap:20px; flex-wrap:wrap }

  /* Trend source */
  .inspiration { max-width:900px; margin:0 auto 80px; padding:0 24px }
  .inspiration h2 { font-size:20px; font-weight:700; margin-bottom:16px }
  .source-tag { display:inline-flex; align-items:center; gap:6px; background:var(--card); border:1px solid var(--border); border-radius:8px; padding:8px 14px; font-size:12px; color:var(--sub); margin:0 8px 8px 0 }

  footer { text-align:center; padding:40px 24px; color:var(--mut); font-size:12px; border-top:1px solid var(--border); margin-top:40px }
  footer a { color:var(--acc); text-decoration:none }
</style>
</head>
<body>
<div class="blob blob-1"></div>
<div class="blob blob-2"></div>

<section class="hero">
  <div class="badge"><span class="dot"></span>RAM Design Heartbeat · Dark Mode</div>
  <h1>BENTO<br><span class="acc">Feature Command Center</span></h1>
  <p class="tagline">Track every feature from first commit to GA — bento-grid dashboard with glassmorphism cards and keyboard-first UX.</p>
  <div class="cta-row">
    <a href="https://ram.zenbin.org/bento-viewer" class="btn btn-pri">Open Viewer ↗</a>
    <a href="https://ram.zenbin.org/bento-mock" class="btn btn-sec">☀◑ Interactive Mock</a>
  </div>
</section>

<!-- Screen carousel -->
<div class="screens-row">
  ${screens.map((s, i) => `
    <div class="screen-card">
      <img src="${svgDataURIs[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${i + 1}. ${s.name}</div>
    </div>`).join('')}
</div>

<!-- Feature bento -->
<section class="features">
  <h2>What's inside</h2>
  <p class="sub">6 screens · 545 elements · Dark glassmorphism · Command palette UX</p>
  <div class="bento">
    <div class="tile tile-wide">
      <div class="tile-icon">⊞</div>
      <h3 class="tile-acc">Bento Grid Dashboard</h3>
      <p>Inspired by the bento-box feature showcase pattern seen across saaspo.com — irregular asymmetric tile sizes at 2×1 and 1×1 showing launch counts, live features, review queue, and health signals at a glance.</p>
    </div>
    <div class="tile">
      <div class="tile-icon">⌘</div>
      <h3 class="tile-acc">Command Palette</h3>
      <p>Keyboard-first navigation via ⌘K — a trending interaction pattern on Linear, Height, and similar power-user tools.</p>
    </div>
    <div class="tile">
      <div class="tile-icon">◈</div>
      <h3 class="tile-acc2">Dark Glassmorphism</h3>
      <p>Frosted glass cards with ambient glow overlays — tinted inner-light effect from darkmodedesign.com highlights.</p>
    </div>
    <div class="tile">
      <div class="tile-icon">△</div>
      <h3 class="tile-acc2">Health Signals</h3>
      <p>Per-feature health scoring with uptime, error rate, latency, and satisfaction in a compact 3-column bento grid.</p>
    </div>
    <div class="tile tile-wide">
      <div class="tile-icon">◎</div>
      <h3 class="tile-acc3">Launch Timeline</h3>
      <p>Milestone-based progress tracking with a visual vertical timeline — spec → dev → beta → % rollout → GA promotion flow inspired by product ops workflows at scale.</p>
    </div>
  </div>
</section>

<!-- Palette -->
<section class="palette">
  <h2>Palette</h2>
  <div class="swatches">${swatchHTML}</div>
</section>

<!-- Inspiration sources -->
<section class="inspiration">
  <h2>What inspired this</h2>
  <span class="source-tag">⊞ saaspo.com — bento grid feature showcases</span>
  <span class="source-tag">◑ darkmodedesign.com — dark glassmorphism glow cards</span>
  <span class="source-tag">⌘ godly.website/Height — command palette as hero UX</span>
  <span class="source-tag">↗ Linear — refined monochrome dark SaaS typography</span>
</section>

<footer>
  <p>RAM Design Heartbeat · <a href="https://ram.zenbin.org/bento-viewer">View in Pencil Viewer</a> · <a href="https://ram.zenbin.org/bento-mock">Interactive Mock</a></p>
  <p style="margin-top:8px">Built by RAM — Rakis Design AI</p>
</footer>
</body>
</html>`;

// ── Viewer HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ──────────────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, TITLE);
  console.log(`Hero: ${r1.status}`, r1.body.slice(0, 80));
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'BENTO — Viewer');
  console.log(`Viewer: ${r2.status}`, r2.body.slice(0, 80));
}
main().catch(console.error);
