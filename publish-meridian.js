'use strict';
// publish-meridian.js — hero + viewer + gallery queue for MERIDIAN

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG        = 'meridian';
const APP_NAME    = 'MERIDIAN';
const TAGLINE     = 'AI Agent Treasury Dashboard for Agentic Commerce';
const DATE_STR    = 'March 19, 2026';
const SUBDOMAIN   = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'meridian.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:       '#05050A',
  surface:  '#0D0D1A',
  surface2: '#141428',
  surface3: '#1A1A30',
  border:   '#1E1E36',
  border2:  '#2A2A4A',
  muted:    '#4A4A7A',
  mid:      '#7A7AAA',
  fg:       '#E8E8FF',
  accent:   '#7C6EFA',
  accentDim:'#2A1F6E',
  green:    '#00D084',
  red:      '#FF4B6A',
  amber:    '#FFB547',
  cyan:     '#00C9FF',
};

const SCREEN_NAMES = [
  'Treasury Overview',
  'Agent Spending',
  'Live TX Feed',
  'TX Route Detail',
  'Budget Config',
];

const PROMPT = `Design a dark-mode AI agent treasury dashboard inspired by Tempo.xyz's agentic commerce stablecoin payments (minimal.gallery/finance), Midday.ai's dark solo-founder finance aesthetic (darkmodedesign.com), and Linear's systematic precision dark UI. 5 mobile screens: treasury overview with multi-chain balances + agent spend summary, per-agent spending monitor with budget progress bars, live USDC transaction feed with routing paths, single-TX route detail with numbered node diagram, and budget config with trust posture selector + policy toggles.`;

// ── SVG renderer ──────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#')) return c;
  const m = c.match(/^([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  if (m) return '#' + m[1];
  return c;
}

function rn(node, ox, oy, depth, maxD) {
  if (!node || depth > maxD) return '';
  const x  = (node.x || 0) + ox;
  const y  = (node.y || 0) + oy;
  const w  = Math.max(node.width  || 0, 1);
  const h  = Math.max(node.height || 0, 1);
  const op = node.opacity !== undefined ? node.opacity : 1;

  if (node.type === 'text') {
    const fill  = sc(node.fill || P.fg);
    const size  = Math.max(node.fontSize || 12, 5);
    const align = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const ax    = align === 'middle' ? x + w/2 : align === 'end' ? x + w : x;
    const lines = String(node.content || '').split('\n');
    const lh    = node.lineHeight ? size * node.lineHeight : size * 1.3;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i*lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${align}" font-weight="${node.fontWeight || 400}">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
    ).join('');
  }

  if (node.type === 'ellipse') {
    const fill    = sc(node.fill || 'transparent');
    const isTrans = !node.fill || node.fill === 'transparent';
    const stroke  = node.strokeColor ? ` stroke="${sc(node.strokeColor)}" stroke-width="${node.strokeWidth || 1}"` : '';
    return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${isTrans?'none':fill}" opacity="${op}"${stroke}/>`;
  }

  // rectangle / frame
  const fill   = sc(node.fill || P.bg);
  const r      = node.cornerRadius || 0;
  const stroke = node.strokeColor ? ` stroke="${sc(node.strokeColor)}" stroke-width="${node.strokeWidth || 1}"` : '';
  const clipId = (node.clip && node.type === 'frame') ? `mc-${Math.random().toString(36).slice(2,7)}` : null;
  const kids   = (node.children || []).map(c => rn(c, x, y, depth+1, maxD)).join('');

  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, thumbW, thumbH, maxD=5) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const bg = sc(screen.fill || P.bg);
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${bg}"/>${content}</svg>`;
}

// ── CSS tokens ────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* MERIDIAN — AI Agent Treasury Design Tokens */

  /* Backgrounds (void space — deeper than Midday) */
  --bg:          ${P.bg};
  --surface:     ${P.surface};
  --surface-2:   ${P.surface2};
  --surface-3:   ${P.surface3};
  --border:      ${P.border};
  --border-2:    ${P.border2};

  /* Text */
  --fg:          ${P.fg};
  --mid:         ${P.mid};
  --muted:       ${P.muted};

  /* Primary: Electric Indigo-Violet (stablecoin brand) */
  --accent:      ${P.accent};
  --accent-dim:  ${P.accentDim};

  /* Semantic: Treasury signals */
  --green:       ${P.green};   /* incoming / positive */
  --red:         ${P.red};     /* outgoing / risk */
  --amber:       ${P.amber};   /* USDC / stablecoin gold */
  --cyan:        ${P.cyan};    /* agent activity / live data */

  /* Typography */
  --font-ui:     'Inter', -apple-system, sans-serif;
  --font-mono:   'JetBrains Mono', 'Courier New', monospace;
  --font-display: 800 clamp(48px,10vw,100px)/0.92 var(--font-ui);
  --font-heading: 700 14px/1.3 var(--font-ui);
  --font-body:    400 12px/1.6 var(--font-ui);
  --font-mono-sm: 400 10px/1 var(--font-mono);

  /* Spacing (4px base grid) */
  --s-1: 4px;  --s-2: 8px;   --s-3: 14px;  --s-4: 20px;
  --s-5: 28px; --s-6: 40px;  --s-7: 56px;  --s-8: 80px;

  /* Radius */
  --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-xl: 20px; --r-full: 9999px;
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 160, THUMB_H = 290;
const thumbsHTML = screens.map((s,i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 5)}
    <div style="font-size:8px;color:${P.muted};margin-top:10px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i]||'SCREEN '+(i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchHTML = [
  {hex:P.bg,      role:'BG — Void'},
  {hex:P.surface, role:'SURFACE'},
  {hex:P.fg,      role:'FOREGROUND'},
  {hex:P.accent,  role:'ACCENT — Indigo Violet'},
  {hex:P.green,   role:'USDC IN — Green'},
  {hex:P.amber,   role:'STABLECOIN — Amber'},
  {hex:P.cyan,    role:'AGENT — Cyan'},
  {hex:P.red,     role:'RISK — Red'},
].map(s => `
  <div style="flex:1;min-width:80px;max-width:120px">
    <div style="height:52px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.muted};margin-bottom:3px">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.accent};font-family:'Courier New',monospace">${s.hex}</div>
  </div>`).join('');

// ── Type scale ────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  {label:'DISPLAY',  size:'52px', weight:'800', sample:'MERIDIAN'},
  {label:'HEADING',  size:'22px', weight:'700', sample:'AI Agent Treasury'},
  {label:'SUBHEAD',  size:'14px', weight:'700', sample:'Live Transaction Feed · 247 today'},
  {label:'BODY',     size:'12px', weight:'400', sample:'Every stablecoin payment your AI agents execute, unified.'},
  {label:'MONO',     size:'10px', weight:'700', sample:'0xA3f1...c8d2 · $142.00 USDC · 342ms', mono:true},
].map(t => `
  <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:8px;font-family:'Courier New',monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;${t.mono?'font-family:Courier New,monospace':'font-family:Inter,-apple-system,sans-serif'}">${t.sample}</div>
  </div>`).join('');

// ── Principles ────────────────────────────────────────────────────────────────
const principlesHTML = [
  {title:'Signal over noise', desc:'Treasury data is high-stakes. Every element must earn its place — 0 decorative items.'},
  {title:'Monospace for money', desc:'TX IDs, amounts, chain addresses use JetBrains Mono. Numbers feel reliable when monospaced.'},
  {title:'Semantic color only', desc:'4 colors: green=in, red=out/risk, amber=USDC, cyan=live agent. No arbitrary color use.'},
].map((p,i) => `
  <div style="padding:16px;background:${P.surface};border-radius:10px;border:1px solid ${P.border}">
    <div style="font-size:10px;color:${P.accent};font-weight:700;margin-bottom:6px;font-family:'Courier New',monospace">${String(i+1).padStart(2,'0')}</div>
    <div style="font-size:11px;color:${P.fg};font-weight:700;margin-bottom:6px">${p.title}</div>
    <div style="font-size:11px;color:${P.muted};line-height:1.6">${p.desc}</div>
  </div>`).join('');

// ── Share text ────────────────────────────────────────────────────────────────
const shareText = encodeURIComponent(
  `MERIDIAN — AI Agent Treasury Dashboard. Dark void space, stablecoin purple, 5 mobile screens. Design by RAM Design Studio.`
);

// ── PRD ───────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>MERIDIAN is a dark-mode mobile treasury dashboard for engineering teams deploying AI agents that autonomously execute stablecoin payments. As agentic commerce matures — agents paying APIs, spinning up compute, routing micro-transactions sub-cent across chains — teams need a financial command center as precise as the agents themselves. Inspired by Tempo.xyz's "agentic commerce" stablecoin use case, Midday.ai's dark finance clarity for lean teams, and Linear's systematic UI discipline.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Platform engineers</strong> managing multi-agent deployments that spend real money autonomously</li>
<li><strong>Finance leads at AI-first startups</strong> needing real-time USDC treasury visibility across chains</li>
<li><strong>Solo founders running agent fleets</strong> — the "one-person company" audience Midday.ai identified</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Treasury Overview:</strong> Multi-chain USDC balance (ETH/SOL/BASE) with sparkline, per-agent spend summary cards, live transaction stream — the "all your transactions, unified" Midday moment</li>
<li><strong>Agent Spending Monitor:</strong> Per-agent budget cards with progress bars, risk badges, spend velocity — flag agents approaching limits before they breach</li>
<li><strong>Live TX Feed:</strong> Real-time stablecoin payment stream with routing paths (agent → chain → payee), status badges (confirmed/pending/failed), and filter tabs</li>
<li><strong>TX Route Detail:</strong> Tempo-inspired numbered payment routing diagram (01→02→03) showing agent → bridge → destination, with block confirmation, latency, and agent policy context</li>
<li><strong>Budget Config:</strong> Trust posture selector (Conservative/Balanced/Autonomous), per-agent daily caps, 6 policy toggles (kill switch, MFA thresholds, auto-approve rules)</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Void (#05050A):</strong> Deeper than Midday's dark, approaching pure space — signals premium precision, not consumer finance</li>
<li><strong>Indigo-Violet (#7C6EFA):</strong> The stablecoin purple — between crypto's blue and DeFi's purple, feels technically trustworthy</li>
<li><strong>4-signal semantic palette:</strong> green=in, red=risk/out, amber=USDC stablecoin, cyan=live agent activity — learned instantly, no legend needed</li>
<li><strong>Monospace for financial data:</strong> JetBrains Mono for all TX IDs, amounts, chain hashes — trustworthy precision aesthetic from Linear's design DNA</li>
<li><strong>Tempo's numbered architecture:</strong> 01/02/03 node routing diagram on S4 directly inspired by Tempo's numbered payment flow sections</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>S1 — Treasury Overview:</strong> Multi-chain balance hero, 3-agent spend cards, 4-item live TX stream, bottom nav</li>
<li><strong>S2 — Agent Spending:</strong> Status summary strip, 5 agent budget cards with progress bars and risk badges</li>
<li><strong>S3 — Live TX Feed:</strong> Filter tabs, 6 live transactions with routing labels and status badges</li>
<li><strong>S4 — TX Route Detail:</strong> Confirmed hero, 3-node routing diagram (Tempo-style), agent context card, action buttons</li>
<li><strong>S5 — Budget Config:</strong> Trust posture selector (3 options), per-agent limit slider, 6 policy toggles</li>
</ul>
`;

// ── HTTP helper ───────────────────────────────────────────────────────────────
function post(hostname, path, headers, body) {
  return new Promise((res, rej) => {
    const buf = Buffer.from(body);
    const r = https.request({ hostname, path, method:'POST',
      headers:{ ...headers, 'Content-Length':buf.length } }, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status:resp.statusCode, body:d }));
    });
    r.on('error', rej);
    r.write(buf);
    r.end();
  });
}
function get(hostname, path, headers={}) {
  return new Promise((res,rej) => {
    https.get({ hostname, path, headers }, resp => {
      let d='';
      resp.on('data',c=>d+=c);
      resp.on('end',()=>res({status:resp.statusCode,body:d}));
    }).on('error',rej);
  });
}

async function publishZenBin(slug, title, html, subdomain) {
  const body = JSON.stringify({ title, html });
  return post('zenbin.org', `/v1/pages/${slug}`, {
    'Content-Type': 'application/json',
    ...(subdomain ? {'X-Subdomain': subdomain} : {}),
  }, body);
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML() {
  const encoded = Buffer.from(penJson).toString('base64');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MERIDIAN — AI Agent Treasury · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — 5-screen mobile design system with brand spec &amp; CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'Inter','SF Pro Display',-apple-system,sans-serif;min-height:100vh;line-height:1.5}
  a{color:inherit;text-decoration:none}

  nav{padding:16px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(20px);z-index:100}
  .logo{font-size:11px;font-weight:900;letter-spacing:5px;color:${P.fg}}
  .logo span{color:${P.accent}}
  .nav-tag{font-size:9px;color:${P.muted};letter-spacing:1.5px;font-weight:700;border:1px solid ${P.border};padding:4px 12px;border-radius:4px}

  .hero{padding:80px 40px 56px;max-width:1100px;margin:0 auto}
  .eyebrow{font-size:9px;letter-spacing:3.5px;color:${P.accent};margin-bottom:24px;font-weight:700;font-family:'Courier New',monospace}
  h1{font-size:clamp(52px,10vw,108px);font-weight:900;letter-spacing:-4px;line-height:0.9;margin-bottom:28px}
  h1 em{color:${P.accent};font-style:normal}
  .tagline{font-size:18px;color:${P.mid};max-width:560px;line-height:1.7;margin-bottom:44px}

  .meta-strip{display:flex;gap:48px;margin-bottom:52px;flex-wrap:wrap;padding-bottom:40px;border-bottom:1px solid ${P.border}}
  .meta-item .label{font-size:8px;color:${P.muted};letter-spacing:2px;margin-bottom:6px;font-weight:700;font-family:'Courier New',monospace}
  .meta-item .val{color:${P.fg};font-size:13px;font-weight:700}
  .meta-item .val em{color:${P.accent};font-style:normal}

  .actions{display:flex;gap:10px;margin-bottom:80px;flex-wrap:wrap}
  .btn{padding:11px 24px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;border:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:1px;transition:opacity .15s;text-transform:uppercase}
  .btn:hover{opacity:.85}
  .btn-p{background:${P.accent};color:#fff}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .btn-g{background:${P.surface2};color:${P.mid};border:1px solid ${P.border}}

  section{padding:56px 40px;max-width:1100px;margin:0 auto}
  section + section{border-top:1px solid ${P.border}}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.muted};font-weight:700;margin-bottom:24px;font-family:'Courier New',monospace}

  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:20px;-webkit-overflow-scrolling:touch}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-thumb{background:${P.border}}

  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:0}
  @media(max-width:700px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
  .principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px}
  @media(max-width:600px){.principles-grid{grid-template-columns:1fr}}

  .tokens-pre{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:24px;font-family:'Courier New',monospace;font-size:11px;line-height:1.75;color:${P.mid};overflow-x:auto;white-space:pre;margin-top:16px}
  .copy-btn{margin-top:14px;background:${P.surface};border:1px solid ${P.border};color:${P.fg};padding:8px 20px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;letter-spacing:1.5px;font-family:inherit;transition:border-color .15s,color .15s;text-transform:uppercase}
  .copy-btn:hover{border-color:${P.accent};color:${P.accent}}

  .prompt-text{font-size:17px;font-style:italic;color:${P.mid};max-width:720px;line-height:1.8;border-left:3px solid ${P.accent};padding-left:24px;margin-top:16px}

  .prd h3{font-size:10px;letter-spacing:2px;color:${P.accent};margin-bottom:10px;margin-top:32px;font-weight:800;font-family:'Courier New',monospace}
  .prd h3:first-child{margin-top:0}
  .prd p,.prd li{font-size:13px;color:${P.mid};line-height:1.7;margin-bottom:6px}
  .prd ul{padding-left:20px}
  .prd strong{color:${P.fg}}

  footer{padding:28px 40px;border-top:1px solid ${P.border};display:flex;justify-content:space-between;font-size:10px;color:${P.muted};letter-spacing:1px;flex-wrap:wrap;gap:10px}

  #toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:${P.green};color:${P.bg};padding:10px 24px;border-radius:24px;font-size:11px;font-weight:800;letter-spacing:1px;opacity:0;transition:all .25s;pointer-events:none;z-index:999}
  #toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
</style>
</head>
<body>
<div id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM<span> ◆ </span>DESIGN</div>
  <div class="nav-tag">heartbeat · ${DATE_STR.toUpperCase()}</div>
</nav>

<section class="hero" style="border-bottom:1px solid ${P.border}">
  <div class="eyebrow">PRODUCTION DESIGN SYSTEM · FINTECH / AGENTIC · ${DATE_STR.toUpperCase()}</div>
  <h1>MERI<em>DIAN</em></h1>
  <p class="tagline">${TAGLINE}</p>
  <div class="meta-strip">
    <div class="meta-item"><div class="label">SCREENS</div><div class="val"><em>5 MOBILE</em></div></div>
    <div class="meta-item"><div class="label">INSPIRED BY</div><div class="val">Tempo.xyz · Midday.ai · Linear</div></div>
    <div class="meta-item"><div class="label">BRAND SPEC</div><div class="val"><em>✓ INCLUDED</em></div></div>
    <div class="meta-item"><div class="label">CSS TOKENS</div><div class="val"><em>✓ COPY-READY</em></div></div>
    <div class="meta-item"><div class="label">THEME</div><div class="val">Dark · Void Space · Monospace</div></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareX()">𝕏 Share</button>
    <a class="btn btn-g" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section>
  <div class="section-label">SCREENS · 5 MOBILE · 390 × 844</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section>
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:14px;font-family:'Courier New',monospace">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:0;font-family:'Courier New',monospace">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:14px;font-family:'Courier New',monospace">SPACING · 4PX BASE GRID</div>
      ${[4,8,14,20,28,40,56,80].map(sp=>`
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
          <div style="font-size:9px;color:${P.muted};width:30px;flex-shrink:0;font-family:'Courier New',monospace">${sp}</div>
          <div style="height:7px;border-radius:4px;background:${P.accent};width:${sp*1.5}px;opacity:.7"></div>
        </div>`).join('')}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:14px;font-family:'Courier New',monospace">DESIGN PRINCIPLES</div>
      <div class="principles-grid">${principlesHTML}</div>
    </div>
  </div>
  <div style="margin-top:40px">
    <div style="font-size:9px;letter-spacing:2px;color:${P.muted};font-family:'Courier New',monospace;margin-bottom:0">CSS DESIGN TOKENS</div>
    <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
  </div>
</section>

<section class="prompt-text-wrap">
  <div class="section-label">ORIGINAL PROMPT</div>
  <p class="prompt-text">"${PROMPT}"</p>
</section>

<section class="prd">
  <div class="section-label">PRODUCT BRIEF</div>
  ${prd}
</section>

<footer>
  <span>RAM Design Studio · heartbeat · ${DATE_STR}</span>
  <a href="https://ram.zenbin.org/gallery">ram.zenbin.org/gallery</a>
</footer>

<script>
const D='${encoded}';
const PROMPT_STR=${JSON.stringify(PROMPT)};
const TOKENS=${JSON.stringify(cssTokens)};
const VIEWER_SLUG='meridian-viewer';

function toast(m){const t=document.getElementById('toast');t.textContent=m+'  ✓';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}

function openViewer(){
  try{
    const j=atob(D);
    JSON.parse(j);
    localStorage.setItem('pv_pending',JSON.stringify({json:j,name:'meridian.pen'}));
    window.open('https://zenbin.org/p/pen-viewer-3','_blank');
  }catch(e){window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank')}
}
function downloadPen(){
  try{
    const b=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='meridian.pen';a.click();URL.revokeObjectURL(a.href);
    toast('Downloaded meridian.pen');
  }catch(e){alert('Download failed: '+e.message)}
}
function copyPrompt(){
  navigator.clipboard.writeText(PROMPT_STR).then(()=>toast('Prompt copied')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=PROMPT_STR;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Prompt copied');
  });
}
function copyTokens(){
  navigator.clipboard.writeText(TOKENS).then(()=>toast('CSS tokens copied')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=TOKENS;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('CSS tokens copied');
  });
}
function shareX(){
  const t=encodeURIComponent('MERIDIAN — AI Agent Treasury Dashboard. Dark void space + stablecoin purple. 5 screens by RAM Design Studio');
  const u=encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text='+t+'&url='+u,'_blank');
}
<\/script>
</body>
</html>`;
}

// ── Viewer HTML ───────────────────────────────────────────────────────────────
async function buildViewerHTML() {
  const resp = await get('zenbin.org', '/p/pen-viewer-3');
  if (resp.status !== 200) throw new Error('Could not fetch pen-viewer-3: '+resp.status);
  let html = resp.body;
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue push ─────────────────────────────────────────────────────────
async function pushToGallery(heroUrl) {
  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/queue.json`;
  const apiBase = `https://api.github.com`;

  // Get current queue
  const rawResp = await get('raw.githubusercontent.com', `/${GITHUB_REPO}/main/queue.json`);
  let queue = { version:1, submissions:[], updated_at:'' };
  if (rawResp.status === 200) {
    try { queue = JSON.parse(rawResp.body); } catch {}
  }

  // Get SHA for update
  const shaResp = await new Promise((res,rej) => {
    https.get({
      hostname:'api.github.com',
      path:`/repos/${GITHUB_REPO}/contents/queue.json`,
      headers:{'User-Agent':'RAM-Design-Studio','Authorization':'token '+GITHUB_TOKEN}
    }, resp => {
      let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>res({status:resp.statusCode,body:d}));
    }).on('error',rej);
  });
  let sha = null;
  if (shaResp.status === 200) {
    try { sha = JSON.parse(shaResp.body).sha; } catch {}
  }

  const entry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    slug: SLUG,
    app_name: APP_NAME,
    tagline: TAGLINE,
    design_url: heroUrl,
    viewer_url: heroUrl.replace(SLUG, SLUG+'-viewer'),
    submitted_at: new Date().toISOString(),
    credit: 'RAM',
    prompt: PROMPT,
    palette: { bg:P.bg, fg:P.fg, accent:P.accent, accent2:P.green },
    archetype: 'fintech-dark',
    source: 'heartbeat',
    screens: SCREEN_NAMES,
  };

  queue.submissions.unshift(entry);
  queue.updated_at = new Date().toISOString();

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const updateBody = JSON.stringify({
    message: `heartbeat: add ${SLUG} design`,
    content,
    ...(sha ? { sha } : {}),
  });

  const updateResp = await post('api.github.com',
    `/repos/${GITHUB_REPO}/contents/queue.json`,
    {
      'Content-Type': 'application/json',
      'User-Agent': 'RAM-Design-Studio',
      'Authorization': 'token ' + GITHUB_TOKEN,
    },
    updateBody
  );
  return updateResp;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌐 MERIDIAN — Publishing to ZenBin\n' + '─'.repeat(50));

  // 1. Hero page
  console.log('1/4  Building hero page…');
  const heroHTML = buildHeroHTML();
  const heroResp = await publishZenBin(SLUG, `MERIDIAN — AI Agent Treasury · RAM`, heroHTML, SUBDOMAIN);
  const heroUrl  = `https://ram.zenbin.org/${SLUG}`;
  console.log(`     → ${heroResp.status === 200 ? '✓' : '✗ HTTP '+heroResp.status}  ${heroUrl}`);

  // 2. Viewer page
  console.log('2/4  Building viewer page…');
  try {
    const viewerHTML = await buildViewerHTML();
    const viewerResp = await publishZenBin(SLUG+'-viewer', `MERIDIAN Viewer · RAM`, viewerHTML, SUBDOMAIN);
    const viewerUrl  = `https://ram.zenbin.org/${SLUG}-viewer`;
    console.log(`     → ${viewerResp.status === 200 ? '✓' : '✗ HTTP '+viewerResp.status}  ${viewerUrl}`);
  } catch(e) {
    console.log('     ✗ Viewer build failed:', e.message);
  }

  // 3. Gallery queue
  console.log('3/4  Pushing to gallery queue…');
  try {
    const qResp = await pushToGallery(heroUrl);
    console.log(`     → ${qResp.status === 200 || qResp.status === 201 ? '✓' : '✗ HTTP '+qResp.status}  hyperio-mc/design-studio-queue`);
  } catch(e) {
    console.log('     ✗ Gallery push failed:', e.message);
  }

  // 4. Done
  console.log('\n✅  MERIDIAN published');
  console.log(`    Hero:   ${heroUrl}`);
  console.log(`    Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`    Gallery: https://ram.zenbin.org/gallery\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
