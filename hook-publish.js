'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'hook';

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
const INK    = '#0E1015';
const SURF   = '#151921';
const CARD   = '#1C2130';
const TEXT   = '#E8EAEF';
const INDIGO = '#5E6AD2';
const TEAL   = '#14B69C';
const RED    = '#E5484D';
const AMBER  = '#F0A020';
const CYAN   = '#00C9D4';
const MUTED  = 'rgba(232,234,239,0.45)';

// ─── SVG THUMBNAIL ───────────────────────────────────────────────────────────
function screenSvg(screen) {
  const w = 390, h = 844;
  const els = screen.elements || [];
  let out = '';
  for (const e of els) {
    if (e.type === 'rect') {
      const rx = e.rx||0, op = e.opacity!==undefined?e.opacity:1;
      const sk = e.stroke&&e.stroke!=='none'?`stroke="${e.stroke}" stroke-width="${e.sw||1}"`:'';
      out += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${rx}" fill="${e.fill}" opacity="${op}" ${sk}/>`;
    } else if (e.type === 'text') {
      const op = e.opacity!==undefined?e.opacity:1;
      const ls = e.ls?`letter-spacing="${e.ls}"`:'';
      const safe = String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      out += `<text x="${e.x}" y="${e.y}" font-size="${e.size}" fill="${e.fill}" font-weight="${e.fw||400}" text-anchor="${e.anchor||'start'}" opacity="${op}" ${ls}>${safe}</text>`;
    } else if (e.type === 'circle') {
      const op = e.opacity!==undefined?e.opacity:1;
      const sk = e.stroke&&e.stroke!=='none'?`stroke="${e.stroke}" stroke-width="${e.sw||1}"`:'';
      out += `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${op}" ${sk}/>`;
    } else if (e.type === 'line') {
      const op = e.opacity!==undefined?e.opacity:1;
      out += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.sw||1}" opacity="${op}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${out}</svg>`;
}

const svgUris = pen.screens.map(s => 'data:image/svg+xml;base64,' + Buffer.from(screenSvg(s)).toString('base64'));

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>HOOK — Webhook Inspector & Debugger</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --ink:${INK};--surf:${SURF};--text:${TEXT};
    --indigo:${INDIGO};--teal:${TEAL};--red:${RED};--amber:${AMBER};--cyan:${CYAN};
    --muted:${MUTED};--card:#1C2130;
  }
  body{background:var(--ink);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* HERO */
  .hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;
    padding:80px 56px;position:relative;overflow:hidden}
  /* Dot grid background — Linear-inspired */
  .hero::before{content:'';position:absolute;inset:0;
    background-image:radial-gradient(rgba(94,106,210,0.25) 1px,transparent 1px);
    background-size:32px 32px;pointer-events:none;opacity:0.4}
  .hero::after{content:'';position:absolute;top:0;right:0;width:600px;height:600px;
    background:radial-gradient(circle at 70% 30%,rgba(94,106,210,0.12) 0%,transparent 60%);
    pointer-events:none}
  .hero-tag{display:inline-flex;align-items:center;gap:8px;
    background:rgba(94,106,210,0.12);border:1px solid rgba(94,106,210,0.3);
    border-radius:100px;padding:6px 16px;font-size:11px;font-weight:600;
    color:var(--indigo);letter-spacing:.1em;text-transform:uppercase;margin-bottom:28px;width:fit-content;
    font-family:'JetBrains Mono',monospace}
  .live-dot{width:6px;height:6px;background:var(--teal);border-radius:50%;
    animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
  h1{font-size:clamp(64px,9vw,108px);font-weight:900;line-height:.91;letter-spacing:-.03em;
    margin-bottom:24px;position:relative;z-index:1}
  h1 .mono{font-family:'JetBrains Mono',monospace;color:var(--indigo)}
  .hero-sub{font-size:18px;line-height:1.65;color:var(--muted);max-width:540px;margin-bottom:40px}
  .ctas{display:flex;gap:14px;flex-wrap:wrap}
  .btn-p{background:var(--indigo);color:#fff;padding:13px 28px;border-radius:8px;
    font-size:14px;font-weight:600;text-decoration:none;letter-spacing:.01em;
    transition:opacity .15s,transform .15s}
  .btn-p:hover{opacity:.85;transform:translateY(-1px)}
  .btn-s{background:rgba(232,234,239,0.07);border:1px solid rgba(232,234,239,0.12);
    color:var(--text);padding:13px 28px;border-radius:8px;font-size:14px;font-weight:500;
    text-decoration:none;transition:border-color .15s}
  .btn-s:hover{border-color:rgba(94,106,210,0.5)}
  .hero-metrics{display:flex;gap:40px;margin-top:52px;padding-top:36px;
    border-top:1px solid rgba(232,234,239,0.08)}
  .metric-val{font-size:24px;font-weight:700;font-family:'JetBrains Mono',monospace}
  .metric-lab{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:3px}

  /* TICKER */
  .ticker{background:rgba(94,106,210,0.1);border-top:1px solid rgba(94,106,210,0.15);
    border-bottom:1px solid rgba(94,106,210,0.15);padding:9px 0;overflow:hidden;white-space:nowrap}
  .ticker-inner{display:inline-flex;animation:tick 30s linear infinite}
  .ti{font-size:10px;font-weight:600;font-family:'JetBrains Mono',monospace;
    color:rgba(94,106,210,0.8);padding:0 28px;letter-spacing:.1em;text-transform:uppercase}
  .td{color:rgba(94,106,210,0.35)}
  @keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

  /* SCREENS */
  .screens{padding:80px 56px}
  .section-eyebrow{font-size:10px;font-weight:600;color:var(--indigo);letter-spacing:.14em;
    text-transform:uppercase;font-family:'JetBrains Mono',monospace;margin-bottom:10px}
  .section-title{font-size:clamp(26px,3.5vw,44px);font-weight:700;margin-bottom:48px}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;
    max-width:1280px;margin:0 auto}
  .scard{background:var(--surf);border-radius:16px;overflow:hidden;
    border:1px solid rgba(232,234,239,0.06);transition:transform .2s,box-shadow .2s}
  .scard:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,0.4)}
  .scard img{width:100%;display:block}
  .scard-label{padding:10px 14px;font-size:11px;font-weight:600;color:var(--text);
    font-family:'JetBrains Mono',monospace;border-top:1px solid rgba(232,234,239,0.06)}

  /* FEATURES */
  .features{padding:80px 56px;background:var(--surf)}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;
    max-width:1100px;margin:40px auto 0}
  .feat{background:var(--card);border-radius:14px;padding:26px;
    border:1px solid rgba(232,234,239,0.06)}
  .feat-icon{width:36px;height:36px;border-radius:8px;background:rgba(94,106,210,0.12);
    display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:14px;
    font-family:'JetBrains Mono',monospace;color:var(--indigo)}
  .feat-title{font-size:14px;font-weight:600;margin-bottom:6px}
  .feat-desc{font-size:12px;color:var(--muted);line-height:1.65}

  /* STATUS CODES */
  .status-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
  .code-pill{padding:6px 14px;border-radius:6px;font-family:'JetBrains Mono',monospace;
    font-size:12px;font-weight:600}

  /* PALETTE */
  .palette{padding:60px 56px}
  .swatches{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
  .sw{flex:1;min-width:72px;height:64px;border-radius:10px;
    display:flex;flex-direction:column;justify-content:flex-end;padding:8px 10px}
  .sw-name{font-size:8px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:1px}
  .sw-hex{font-size:8px;opacity:.6;font-family:'JetBrains Mono',monospace}

  /* FOOTER */
  footer{background:#090C10;text-align:center;padding:40px 24px;
    font-size:11px;font-family:'JetBrains Mono',monospace;color:rgba(232,234,239,0.35)}
  footer a{color:var(--indigo);text-decoration:none}

  @media(max-width:640px){
    .hero,.screens,.features,.palette{padding:80px 24px 48px}
    .hero-metrics{gap:20px;flex-wrap:wrap}
  }
</style>
</head>
<body>

<section class="hero">
  <div class="hero-tag"><span class="live-dot"></span>Heartbeat #47 · Dark · Developer Tools</div>
  <h1>HOOK<br><span class="mono">Webhook</span><br>Inspector</h1>
  <p class="hero-sub">Real-time webhook delivery monitoring, request inspection, payload diffing, and retry orchestration — built for developers who need to trust their integrations.</p>
  <div class="ctas">
    <a href="https://ram.zenbin.org/hook-viewer" class="btn-p">Open in Pencil.dev →</a>
    <a href="https://ram.zenbin.org/hook-mock" class="btn-s">Interactive Mock ☀◑</a>
  </div>
  <div class="hero-metrics">
    <div><div class="metric-val" style="color:${TEAL}">99.8%</div><div class="metric-lab">Success rate</div></div>
    <div><div class="metric-val" style="color:${CYAN}">23ms</div><div class="metric-lab">P95 latency</div></div>
    <div><div class="metric-val">6</div><div class="metric-lab">Screens</div></div>
    <div><div class="metric-val">502</div><div class="metric-lab">Elements</div></div>
  </div>
</section>

<div class="ticker"><div class="ticker-inner">
${['LIVE','EVENTS','200 OK','500 ERR','REPLAY','INSPECT','LATENCY','P95','RETRY','BACKOFF','HMAC','SIGNING',
   'STRIPE','GITHUB','SHOPIFY','SENDGRID','LINEAR','PAGERDUTY','WEBHOOK','ENDPOINTS','ALERTS','LOGS'].map(t =>
  `<span class="ti">${t} <span class="td">·</span></span>`).join('').repeat(2)}
</div></div>

<section class="screens">
  <div class="section-eyebrow">6 screens · 502 elements</div>
  <div class="section-title">Inspect Every Delivery</div>
  <div class="screens-grid">
    ${pen.screens.map((s,i) => `
    <div class="scard">
      <img src="${svgUris[i]}" alt="${s.name}" loading="lazy">
      <div class="scard-label">${['01','02','03','04','05','06'][i]} ${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <div class="section-eyebrow">Design System</div>
  <div class="section-title">What Powers HOOK</div>
  <div class="features-grid">
    <div class="feat">
      <div class="feat-icon">◉</div>
      <div class="feat-title">Spatial Elevation (No Shadows)</div>
      <div class="feat-desc">Cards and surfaces use luminance for depth — ${SURF} on ${INK}, ${CARD} on ${SURF} — following Linear's elevation model. No drop shadows, no blur; just progressively lighter fills.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(20,182,156,0.12);color:${TEAL}">⊟</div>
      <div class="feat-title">Semantic Status System</div>
      <div class="feat-desc">Teal = 2xx success, Amber = 429/timeout/slow, Red = 5xx failure. Applied consistently across status dots, left-border stripes, code badges, and chart bars — one visual language system-wide.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(0,201,212,0.12);color:${CYAN}">◈</div>
      <div class="feat-title">Monospace + Sans Two-Font System</div>
      <div class="feat-desc">Inter for UI labels and navigation, JetBrains Mono for all data — status codes, latency values, paths, payloads. Inspired by Darknode's typography discipline and Linear's developer aesthetic.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(240,160,32,0.12);color:${AMBER}">◇</div>
      <div class="feat-title">Dot Grid Background</div>
      <div class="feat-desc">Radial CSS dot grid at 32px spacing, 40% opacity — borrowed from Awwwards SOTD winner Darknode and Linear's animated background. Creates spatial depth without competing with content.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">≡</div>
      <div class="feat-title">JSON Syntax Highlighting</div>
      <div class="feat-desc">Request Inspector renders payloads with field-level color coding: neutral for structure, amber for warning values, red for error fields. Mimics a real debugger, not a JSON viewer.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(229,72,77,0.12);color:${RED}">⊕</div>
      <div class="feat-title">Delivery Timeline</div>
      <div class="feat-desc">Per-request timing trace — received → auth → handler → failure — mapped as a horizontal timeline with node dots color-coded by outcome. Surfaces exactly where in the stack a delivery failed.</div>
    </div>
  </div>

  <div style="margin-top:40px;max-width:1100px;margin-left:auto;margin-right:auto">
    <div class="section-eyebrow">Status code palette</div>
    <div class="status-row">
      <span class="code-pill" style="background:rgba(20,182,156,0.12);color:${TEAL}">200 OK</span>
      <span class="code-pill" style="background:rgba(20,182,156,0.12);color:${TEAL}">201 Created</span>
      <span class="code-pill" style="background:rgba(240,160,32,0.12);color:${AMBER}">429 Too Many</span>
      <span class="code-pill" style="background:rgba(229,72,77,0.12);color:${RED}">500 Error</span>
      <span class="code-pill" style="background:rgba(229,72,77,0.12);color:${RED}">503 Unavailable</span>
    </div>
  </div>
</section>

<section class="palette">
  <div class="section-eyebrow">Palette</div>
  <div class="section-title">Linear-Inspired Dark System</div>
  <div class="swatches">
    ${[
      {col:INK,   name:'Ink',    light:true },
      {col:SURF,  name:'Surface',light:true },
      {col:'#1C2130',name:'Card',light:true },
      {col:TEXT,  name:'Text',   light:false},
      {col:INDIGO,name:'Indigo', light:true },
      {col:TEAL,  name:'Teal',   light:false},
      {col:AMBER, name:'Amber',  light:false},
      {col:RED,   name:'Red',    light:true },
      {col:CYAN,  name:'Cyan',   light:false},
    ].map(s=>`<div class="sw" style="background:${s.col}">
      <div class="sw-name" style="color:${s.light?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.7)'}">${s.name}</div>
      <div class="sw-hex" style="color:${s.light?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'}">${s.col}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  HOOK · Heartbeat #47 · RAM Design Studio · <a href="https://ram.zenbin.org">ram.zenbin.org</a><br>
  <span style="margin-top:6px;display:inline-block;opacity:.6">Inspired by Linear's elevation model · Awwwards SOTD Darknode · Orbit ML monitoring aesthetic</span>
</footer>

</body>
</html>`;

// ─── VIEWER ───────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'HOOK — Webhook Inspector & Debugger');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'HOOK — Pencil.dev Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
