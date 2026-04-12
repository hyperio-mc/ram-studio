'use strict';
// publish-orbit.js — Full Design Discovery pipeline for ORBIT heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE || 'queue.json';

const SLUG        = 'orbit';
const VIEWER_SLUG = 'orbit-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'ORBIT',
  tagline:   'AI model performance observatory. Monitor, compare, and route across LLM providers in real time — on a cosmic void dashboard.',
  archetype: 'AI Model Orchestration Dashboard',
  palette: {
    bg:      '#080B14',
    fg:      '#EEF0FA',
    accent:  '#5B5EF4',
    cyan:    '#06B6D4',
    amber:   '#F59E0B',
    green:   '#10B981',
    danger:  '#EF4444',
  },
};

const ORIGINAL_PROMPT = 'Design ORBIT — a dark-mode AI model performance observatory for engineering teams routing across LLM providers. Inspired by Linear\'s ultra-clean near-black UI and OWO\'s radial orbital layout (darkmodedesign.com), Evervault Customers\' concentric glow halos with cosmic void backgrounds (godly.website), and Locomotive.ca\'s immersive editorial dark aesthetic (godly.website). Trend: AI DevOps SaaS embracing radial/orbital data visualizations on deep cosmic backgrounds, moving away from rectangular bar charts. Palette: void #080B14 · electric indigo #5B5EF4 · cyan #06B6D4 · amber #F59E0B. 5 mobile screens: Constellation Dashboard · Model Probe · Routing Policy · Model Compare · Degradation Alert.';

const sub = {
  id:           'heartbeat-orbit-' + Date.now(),
  prompt:       ORIGINAL_PROMPT,
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Constellation', 'Probe', 'Route', 'Compare', 'Alert'],
  markdown: `## Overview
ORBIT is a mobile-first AI model orchestration dashboard for engineering teams running multi-provider LLM stacks. It replaces ad-hoc latency spreadsheets and manual failover scripts with a single observatory that tracks real-time performance, enables intelligent routing policies, and triggers automated failover when any model degrades. The design language emerged directly from a research session on darkmodedesign.com and godly.website in March 2026 — where the orbital/radial visualization trend was impossible to ignore.

## Target Users
- **ML engineers** managing multi-model pipelines (GPT-4o + Claude + Gemini simultaneously)
- **Platform teams** who need p99 latency tracking and automatic failover across LLM providers
- **CTO/Engineering Leads** comparing cost-per-token vs quality tradeoffs across providers
- **AI product teams** who ship latency-sensitive features and need to catch degradation fast
- **DevOps engineers** integrating LLM reliability into their existing observability stack

## Core Features
- **Constellation Dashboard** — Orbital ring visualization where each model appears as a concentric health ring at its own radius. Ring saturation = health percentage. Central hub shows active model count. Bottom strip shows global P50/P99 and requests-per-minute.
- **Model Probe** — Deep dive into a single model: latency sparkline over 24hrs, percentile breakdown (P50/P75/P90/P99) as bar rows, and quality signal tiles (success rate, avg tokens, error rate).
- **Routing Policy** — Visual flow diagram showing the REQUEST → SMART ROUTER → [Model Endpoints] graph. Policy selector below: Lowest Latency, Lowest Cost, Load Balance, Fallback Chain. One-tap active policy switching.
- **Model Compare** — Side-by-side benchmark table across GPT-4o / Claude 3.5 / Gemini Pro. 7 metrics: latency, cost/1k, success rate, context window, P99, req/min, error rate. Winner highlighted per row.
- **Degradation Alert** — Emergency screen with amber orbital pulse rings expanding outward from center. Affected endpoints list, +773% latency spike call-out, 1-tap failover CTA, notify team and investigate secondaries.

## Design Language
Discovered during research on **March 21, 2026** across four sources:

1. **Linear** (darkmodedesign.com) — Ultra-clean near-black (#0A0A0F) with crisp cool-white type and razor-thin border lines. The gold standard for dark SaaS: no noise, pure information density on void. ORBIT adopts this discipline with #080B14 void — information without decoration.

2. **OWO** (darkmodedesign.com) — Radial orbital layout with circular progress rings. The UI doesn't just display data, it orbits it. This was the direct inspiration for ORBIT's Constellation screen — each LLM model appearing as a concentric ring at its own orbital radius, health percentage controlling arc saturation.

3. **Evervault Customers** (godly.website) — Concentric glow halos, glassmorphism card panels. The ambient background glow using layered semi-transparent ellipses creates cosmic depth without heavy assets. ORBIT uses the same 4-layer glow primitive (OrbGlow) throughout all screens.

4. **Locomotive.ca** (godly.website) — Immersive full-bleed dark editorial design. Bold typographic hierarchy that breathes. ORBIT's screen headers use the same weight-contrast approach: 900-weight display names with 400-weight supporting text at 0.5 opacity.

The orbital ring visualization is the key design innovation: rather than bar charts (overused in dashboards), circular progress arcs at different radii create a spatial language where distance = model identity and saturation = health. You can read the constellation at a glance.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. Constellation — 3 orbital rings (GPT-4o/Claude/Gemini), ambient glow halos, central ORBIT hub, model labels at ring positions, bottom global metrics strip
2. Model Probe — Model identity card with icon, 24hr latency sparkline, P50/P75/P90/P99 bar rows, quality signal tiles (success/tokens/error)
3. Routing Policy — Active policy banner, REQUEST→ROUTER→ENDPOINTS flow diagram with branch lines, 4 policy options with radio-style selection
4. Model Compare — Column header row with color coding, 7 metric rows with winner highlighting, winner summary card at bottom
5. Degradation Alert — Expanding amber orbital pulse rings, +773% spike label, 3 affected endpoint cards, failover CTA button, alert timeline`,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(body) : null;
    if (bodyBuf) opts.headers = { ...opts.headers, 'Content-Length': bodyBuf.length };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (bodyBuf) r.write(bodyBuf);
    r.end();
  });
}
const postZ = (p, body) => httpsReq({
  hostname: 'zenbin.org', path: p, method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' }
}, body);
const putZ  = (p, body) => httpsReq({
  hostname: 'zenbin.org', path: p, method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' }
}, body);
const ghGet = (p) => httpsReq({
  hostname: 'api.github.com', path: p, method: 'GET',
  headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
});
const ghPut = (p, body) => httpsReq({
  hostname: 'api.github.com', path: p, method: 'PUT',
  headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' }
}, body);

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderEl(el, depth) {
  if (!el || depth > 6) return '';
  const x=el.x||0, y=el.y||0, w=Math.max(0,el.width||0), h=Math.max(0,el.height||0);
  const fill = typeof el.fill==='string' ? el.fill : 'none';
  const oAttr = el.opacity!==undefined && el.opacity<0.99 ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius,w/2,h/2)}"` : '';
  if (el.type==='frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children||[]).map(c=>renderEl(c,depth+1)).join('');
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type==='ellipse') {
    const sf = typeof el.fill==='string' ? el.fill : meta.palette.accent;
    return `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type==='text') {
    const fh = Math.max(1,Math.min(h,(el.fontSize||13)*0.7));
    const tf = typeof fill==='string'&&fill!=='none'&&fill!=='transparent' ? fill : meta.palette.fg;
    return `<rect x="${x}" y="${y+(h-fh)/2}" width="${w*0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}
const screenThumbSVG = (s, tw, th) => {
  const kids = (s.children||[]).map(c=>renderEl(c,0)).join('');
  const bg = typeof s.fill==='string' ? s.fill : meta.palette.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${s.width}" height="${s.height}" fill="${bg}"/>${kids}</svg>`;
};

function lightenHex(hex, amt) {
  const n = parseInt((hex||'#111').replace('#',''),16);
  const r=Math.min(255,(n>>16)+amt), g=Math.min(255,((n>>8)&0xff)+amt), b=Math.min(255,(n&0xff)+amt);
  return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm,'<h3>$1</h3>')
    .replace(/^### (.+)$/gm,'<h4 style="font-size:11px;letter-spacing:1.5px;opacity:.5;margin:20px 0 8px;font-weight:700">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code style="background:#0C0E1F;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#7C86F4">$1</code>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/<li>/g,'<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g,'</li></ul>')
    .replace(/\n\n/g,'</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const encoded = Buffer.from(penJson).toString('base64');
  const screens = doc.children||[];
  const surface = lightenHex(meta.palette.bg, 12);
  const border  = lightenHex(meta.palette.bg, 26);
  const THUMB_H = 200;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width/s.height));
    const label = `M · ${prd.screenNames[i]||i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex:'#080B14', role:'VOID BG'   },
    { hex:'#0E1120', role:'SURFACE'   },
    { hex:'#141728', role:'SURFACE 2' },
    { hex:'#EEF0FA', role:'FOREGROUND'},
    { hex:'#9BA3C4', role:'FG MUTED'  },
    { hex:'#5B5EF4', role:'INDIGO'    },
    { hex:'#06B6D4', role:'CYAN'      },
    { hex:'#F59E0B', role:'AMBER'     },
  ];
  const swatchHTML = swatches.map(sw=>`
    <div style="flex:1;min-width:70px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'64px', weight:'900', sample:'ORBIT', mono:false },
    { label:'HEADING',  size:'22px', weight:'700', sample:'AI Model Performance Observatory', mono:false },
    { label:'MONO',     size:'13px', weight:'500', sample:'P99 · 487ms · Claude 3.5 · $0.008/k', mono:true },
    { label:'CAPTION',  size:'10px', weight:'700', sample:'AVG LATENCY · REQ/MIN · SUCCESS RATE · ERROR RATE', mono:false },
  ].map(t=>`
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.mono?"'SF Mono','Fira Code',monospace":'inherit'}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,16,24,32,48,64].map(sp=>`
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp*2}px;opacity:0.7"></div>
    </div>`).join('');

  const principles = [
    'Orbital before rectangular — circular rings encode health faster than bar charts',
    'Cosmic depth through layered glow halos, not textures or gradients',
    'Monospace for numbers, sans-serif for labels — the data types read differently',
    'Color = model identity — indigo/cyan/amber are each model\'s persistent signal',
    'Alert escalation through ring expansion, not just color change',
  ];

  const cssTokens = `:root {
  /* Color — ORBIT Cosmic Void palette */
  --color-bg:        #080B14;
  --color-surface:   #0E1120;
  --color-surface-2: #141728;
  --color-surface-3: #1B1F30;
  --color-border:    #1E2338;
  --color-border-2:  #2A2F4A;
  --color-muted:     #4A506E;
  --color-fg:        #EEF0FA;
  --color-fg-2:      #9BA3C4;

  /* Brand accents */
  --color-accent:    #5B5EF4;  /* electric indigo — primary */
  --color-cyan:      #06B6D4;  /* cyan — secondary */
  --color-amber:     #F59E0B;  /* amber — warning/alert */
  --color-green:     #10B981;  /* emerald — success */
  --color-danger:    #EF4444;  /* red — critical */

  /* Typography */
  --font-sans:  -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  --font-mono:  'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  --text-xs:    10px;
  --text-sm:    12px;
  --text-base:  14px;
  --text-lg:    17px;
  --text-xl:    22px;
  --text-2xl:   28px;
  --text-hero:  64px;

  /* Spacing — 4px base grid */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm:  8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 999px;

  /* Glow utility */
  --glow-accent: 0 0 40px rgba(91,94,244,.18), 0 0 80px rgba(91,94,244,.08);
  --glow-cyan:   0 0 40px rgba(6,182,212,.18),  0 0 80px rgba(6,182,212,.08);
  --glow-amber:  0 0 40px rgba(245,158,11,.18), 0 0 80px rgba(245,158,11,.08);
}`;

  const shareText = encodeURIComponent(`ORBIT — AI Model Performance Observatory\nDesigned by RAM Design AI · orbital rings, cosmic void, dark SaaS done right\n`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ORBIT — AI Model Observatory · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<meta property="og:title" content="ORBIT — AI Model Observatory">
<meta property="og:description" content="${meta.tagline}">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-bottom:1px solid ${border};position:sticky;top:0;background:${meta.palette.bg}cc;backdrop-filter:blur(12px);z-index:10}
  .logo{font-size:11px;font-weight:800;letter-spacing:3px;opacity:.5}
  .nav-id{font-size:10px;opacity:.3;letter-spacing:1px}
  .hero{padding:80px 40px 60px;max-width:800px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;opacity:.8}
  h1{font-size:clamp(52px,8vw,88px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:20px;background:linear-gradient(135deg,${meta.palette.fg} 60%,${meta.palette.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .sub{font-size:18px;opacity:.55;max-width:580px;line-height:1.65;margin-bottom:32px}
  .meta{display:flex;flex-wrap:wrap;gap:24px;margin-bottom:36px;padding:20px 0;border-top:1px solid ${border};border-bottom:1px solid ${border}}
  .meta-item{display:flex;flex-direction:column;gap:4px}
  .meta-item span{font-size:9px;letter-spacing:2px;opacity:.4;font-weight:600}
  .meta-item strong{font-size:12px;font-weight:700;letter-spacing:.5px}
  .actions{display:flex;flex-wrap:wrap;gap:10px}
  .btn{padding:10px 20px;border-radius:8px;font-family:inherit;font-size:12px;font-weight:700;letter-spacing:.5px;cursor:pointer;border:none;transition:opacity .15s}
  .btn-p{background:${meta.palette.accent};color:#fff}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border};cursor:pointer}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-x{background:#000;color:#fff;border:1px solid #333;cursor:pointer}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${meta.palette.fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:17px;opacity:.6;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${meta.palette.fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:720px;font-size:12px;line-height:1.7;opacity:.75}
  .inspiration-bar strong{color:${meta.palette.accent};opacity:1}
  .principle{padding:12px 0;border-bottom:1px solid ${border};font-size:13px;opacity:.65;line-height:1.6}
  .principle:last-child{border-bottom:none}
  .principle::before{content:'→ ';color:${meta.palette.accent};font-weight:700;opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-orbit · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · AI OBSERVATORY · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>ORBIT</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>AI ORCHESTRATION</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>DESIGNED BY</span><strong>RAM · HEARTBEAT</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="inspiration-bar">
  <strong>Research sources (March 21, 2026):</strong>
  Linear — ultra-clean near-black void UI (darkmodedesign.com) ·
  OWO — radial orbital layout with circular progress rings (darkmodedesign.com) ·
  Evervault Customers — concentric glow halos, glassmorphism (godly.website) ·
  Locomotive.ca — immersive editorial dark, bold type hierarchy (godly.website)
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · 8 TONES</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${principles.map(p=>`<div class="principle">${p}</div>`).join('')}
    </div>

  </div>

  <div style="margin-top:60px">
    <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">${sub.prompt}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  <div>${mdToHtml(prd.markdown)}</div>
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT · ${new Date().getFullYear()}</span>
  <span>Built autonomously by RAM Design AI · <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a></span>
</footer>

<script>
const ENCODED = '${encoded}';
const PROMPT  = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg||'Copied ✓';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function openInViewer(){window.open('https://ram.zenbin.org/${VIEWER_SLUG}','_blank')}
function downloadPen(){try{const data=JSON.parse(atob(ENCODED));const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='orbit.pen';a.click()}catch(e){alert('Download error: '+e.message)}}
function copyPrompt(){navigator.clipboard.writeText(PROMPT).then(()=>showToast('Prompt copied ✓'))}
function copyTokens(){navigator.clipboard.writeText(CSS_TOKENS).then(()=>showToast('CSS Tokens copied ✓'))}
function shareOnX(){const url=encodeURIComponent(window.location.href);window.open('https://twitter.com/intent/tweet?text=${shareText}&url='+url,'_blank')}
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const viewerPath = path.join(__dirname, 'pen-viewer.html');
  if (!fs.existsSync(viewerPath)) throw new Error('pen-viewer.html not found');
  let html = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── Gallery queue push ────────────────────────────────────────────────────────
async function pushToGalleryQueue(heroUrl) {
  const qPath = `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`;
  const getRes = await ghGet(qPath);
  if (getRes.status !== 200) throw new Error(`Queue GET failed: ${getRes.status}`);
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content,'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) {
    queue = { version:1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     'ORBIT',
    tagline:      meta.tagline,
    archetype:    'productivity',
    design_url:   heroUrl,
    submitted_at: sub.submitted_at,
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       sub.prompt,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ORBIT to gallery (heartbeat)`,
    content:  newContent,
    sha:      currentSha,
  });
  const putRes = await ghPut(qPath, putBody);
  if (putRes.status !== 200 && putRes.status !== 201) throw new Error(`Queue PUT failed: ${putRes.status} — ${putRes.body.slice(0,200)}`);
  return true;
}

// ── Publish to zenbin ─────────────────────────────────────────────────────────
async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  for (const method of ['POST', 'PUT']) {
    const r = await httpsReq({
      hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method,
      headers: { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' }
    }, body);
    if (r.status === 200 || r.status === 201) return { ok: true, url: `https://ram.zenbin.org/${slug}` };
    if (r.status === 409 && method === 'POST') continue; // try PUT
    console.log(`  [${method}] ${slug} → ${r.status}: ${r.body.slice(0,80)}`);
  }
  return { ok: false };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('◎ ORBIT — Design Discovery Pipeline');
  console.log('═══════════════════════════════════\n');

  const penPath = path.join(__dirname, 'orbit.pen');
  if (!fs.existsSync(penPath)) { console.error('✗ orbit.pen not found. Run: node orbit-app.js'); process.exit(1); }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded orbit.pen (${Math.round(penJson.length/1024)}KB, ${doc.children.length} screens)\n`);

  // Step 1: Hero
  console.log('[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'orbit-hero.html'), heroHtml);
  console.log(`  ✓ orbit-hero.html (${Math.round(heroHtml.length/1024)}KB)`);

  // Step 2: Publish hero
  console.log('\n[2/4] Publishing hero → ram.zenbin.org/orbit…');
  const heroResult = await publishToZenbin(SLUG, 'ORBIT — AI Model Observatory · RAM Design Studio', heroHtml);
  const heroUrl = heroResult.ok ? heroResult.url : `https://ram.zenbin.org/${SLUG}`;
  console.log(heroResult.ok ? `  ✓ Hero live → ${heroUrl}` : '  ⚠ Hero publish had issues');

  // Step 3: Viewer
  console.log(`\n[3/4] Building & publishing viewer → ram.zenbin.org/${VIEWER_SLUG}…`);
  try {
    const viewerHtml = buildViewerHTML(penJson);
    fs.writeFileSync(path.join(__dirname, 'orbit-viewer.html'), viewerHtml);
    const vResult = await publishToZenbin(VIEWER_SLUG, 'ORBIT Viewer · RAM Design Studio', viewerHtml);
    console.log(vResult.ok ? `  ✓ Viewer live → ${vResult.url}` : '  ⚠ Viewer publish had issues');
  } catch(e) {
    console.log('  ⚠ Viewer skipped:', e.message);
  }

  // Step 4: Gallery queue
  console.log('\n[4/4] Adding to gallery queue…');
  try {
    await pushToGalleryQueue(heroUrl);
    console.log('  ✓ Gallery queue updated');
  } catch(e) {
    console.log('  ⚠ Gallery queue failed:', e.message);
  }

  console.log('\n═══════════════════════════════════');
  console.log('✓ ORBIT published!');
  console.log(`  Hero:    ${heroUrl}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('═══════════════════════════════════\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
