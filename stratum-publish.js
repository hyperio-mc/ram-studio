'use strict';
// stratum-publish.js — Hero page + viewer + gallery for STRATUM

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'stratum';
const APP_NAME  = 'STRATUM';
const TAGLINE   = 'AI-Powered Design System Intelligence';
const DATE_STR  = 'March 22, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'stratum.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

const SCREEN_NAMES = ['Token Library', 'Component Audit', 'Change History', 'Dep Map', 'AI Insights'];

const P = {
  bg:        '#0F0F12',
  surface:   '#161619',
  surface2:  '#1E1E22',
  surface3:  '#26262B',
  border:    '#2A2A30',
  border2:   '#3A3A42',
  muted:     '#5C5C6E',
  muted2:    '#8A8A9E',
  fg:        '#F0F0F4',
  fg2:       '#B8B8C8',
  accent:    '#B4FF4C',
  accentDim: '#1D2A0A',
  purple:    '#9D7FFF',
  red:       '#FF4C6A',
  amber:     '#FFB84C',
  green:     '#4CFF9D',
};

const PROMPT = `Design STRATUM — an AI-powered design system intelligence platform for design teams, inspired by:
1. Diffusion Studio (minimal.gallery/saas, March 2026): pure minimal B&W palette with single electric accent. "Edit faster than ever, right in your browser." Browser-editor paradigm.
2. Haptic + Twingate (godly.website, March 2026): node/layer UI patterns, enterprise dark SaaS aesthetic.
3. Ape AI + Paperclip (lapa.ninja, March 2026): AI-first bold typography, electric single-color accent approach.
5 screens: Token Library (searchable token catalog), Component Audit (AI health grid), Change History (versioned timeline), Dependency Map (node graph), AI Insights (recommendations).
Palette: deep charcoal #0F0F12 + electric lime #B4FF4C + AI purple #9D7FFF. The lime accent is a deliberate departure from safe blue/purple design-tool defaults.`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function publish(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'X-Subdomain': SUBDOMAIN },
  }, body);
}

// ── SVG renderer ──────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#')) {
    if (c.length > 7) return c.slice(0, 7); // strip alpha
    return c;
  }
  const m = c.match(/^([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  if (m) return '#' + m[1];
  return c;
}

function rn(node, ox, oy, depth, maxD) {
  if (!node || depth > maxD) return '';
  const x  = (node.x || 0) + ox;
  const y  = (node.y || 0) + oy;
  const w  = node.width  || 10;
  const h  = node.height || 10;
  const op = node.opacity !== undefined ? node.opacity : 1;

  if (node.type === 'text') {
    const fill  = sc(node.fill || P.fg);
    const size  = Math.max(node.fontSize || 12, 6);
    const align = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const ax    = align === 'middle' ? x + w / 2 : align === 'end' ? x + w : x;
    const lines = String(node.content || '').split('\n');
    const lh    = node.lineHeight ? size * node.lineHeight : size * 1.25;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i * lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${align}" font-weight="${node.fontWeight || 400}">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
    ).join('');
  }
  if (node.type === 'ellipse') {
    const fill   = sc(node.fill || 'transparent');
    const noFill = !node.fill || node.fill === 'transparent';
    const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
    return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${noFill?'none':fill}" opacity="${op}"${stroke}/>`;
  }
  const fill   = sc(node.fill || P.bg);
  const r      = node.cornerRadius || 0;
  const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
  const clipId = node.clip ? `cp-${node.id}` : null;
  const kids   = (node.children || []).map(c => rn(c, x, y, depth + 1, maxD)).join('');
  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, tw, th, maxD = 5) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${sc(screen.fill || P.bg)}"/>${content}</svg>`;
}

// ── CSS Tokens ────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* STRATUM Design Tokens — AI Design System Intelligence */

  /* Backgrounds */
  --bg:           ${P.bg};
  --surface:      ${P.surface};
  --surface-2:    ${P.surface2};
  --surface-3:    ${P.surface3};
  --border:       ${P.border};
  --border-2:     ${P.border2};
  --muted:        ${P.muted};
  --muted-2:      ${P.muted2};

  /* Foreground */
  --fg:           ${P.fg};
  --fg-2:         ${P.fg2};

  /* Brand — Electric Lime (Diffusion Studio riff) */
  --accent:       ${P.accent};
  --accent-dim:   ${P.accentDim};

  /* AI Agent — Purple */
  --ai:           ${P.purple};

  /* Semantic */
  --success:      ${P.green};
  --warning:      ${P.amber};
  --danger:       ${P.red};

  /* Typography */
  --font-display: 900 clamp(32px,7vw,72px)/0.95 'Inter', system-ui, sans-serif;
  --font-heading: 700 18px/1.1 'Inter', system-ui, sans-serif;
  --font-label:   700 8px/1 'Inter', system-ui, sans-serif;
  --font-body:    400 13px/1.6 'Inter', system-ui, sans-serif;
  --font-mono:    500 10px/1.5 'SF Mono', ui-monospace, monospace;

  /* Spacing (4px base grid) */
  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-5: 24px;  --s-6: 32px;  --s-7: 48px;  --s-8: 64px;

  /* Radius */
  --r-xs: 4px;  --r-sm: 6px;  --r-md: 10px;  --r-lg: 16px;
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 175, THUMB_H = 320;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    <div style="border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 0 1px ${P.border}">
      ${screenSVG(s, THUMB_W, THUMB_H, 5)}
    </div>
    <div style="font-size:8px;color:${P.muted2};margin-top:10px;letter-spacing:2px;font-weight:700;font-family:monospace">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchData = [
  [P.bg,      'BG',        P.bg],
  [P.surface, 'SURFACE',   P.surface],
  [P.fg,      'FG',        P.fg],
  [P.accent,  'LIME',      P.accent],
  [P.purple,  'AI',        P.purple],
  [P.green,   'SUCCESS',   P.green],
  [P.amber,   'WARNING',   P.amber],
  [P.red,     'DANGER',    P.red],
  [P.muted,   'MUTED',     P.muted],
  [P.muted2,  'MUTED 2',   P.muted2],
];

const swatchHTML = swatchData.map(([color, name, hex]) =>
  `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
    <div style="width:36px;height:36px;border-radius:8px;background:${color};border:1px solid ${P.border2};flex-shrink:0"></div>
    <div>
      <div style="font-size:10px;font-weight:700;color:${P.fg};letter-spacing:1px;font-family:monospace">${name}</div>
      <div style="font-size:9px;color:${P.muted};font-family:monospace">${hex}</div>
    </div>
  </div>`
).join('');

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const PEN_B64 = Buffer.from(penJson).toString('base64');

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} · RAM Design Studio</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${P.bg};color:${P.fg};font-family:'Inter','SF Pro Display',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
.header{padding:18px 40px;border-bottom:1px solid ${P.border};display:flex;align-items:center;justify-content:space-between}
.logo{font-size:12px;font-weight:800;letter-spacing:3px;color:${P.fg};font-family:monospace}
.header a{font-size:10px;color:${P.muted2};text-decoration:none;letter-spacing:0.5px;margin-left:24px}
.header a:hover{color:${P.accent}}

.hero{padding:80px 40px 56px;max-width:920px;margin:0 auto;text-align:center;position:relative}
.hero::before{content:'';position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:700px;height:350px;background:radial-gradient(ellipse,${P.accent}12 0%,transparent 68%);pointer-events:none}
.hero-tag{display:inline-block;font-size:9px;font-weight:700;letter-spacing:2px;color:${P.accent};background:${P.accent}18;border:1px solid ${P.accent}35;padding:6px 16px;border-radius:4px;margin-bottom:28px;font-family:monospace}
.hero-title{font-size:clamp(52px,9vw,96px);font-weight:900;letter-spacing:-3px;line-height:0.92;color:${P.fg};margin-bottom:20px}
.hero-title em{color:${P.accent};font-style:normal}
.tagline{font-size:16px;color:${P.muted2};max-width:500px;margin:0 auto 16px;line-height:1.6}
.meta{font-size:9px;color:${P.muted};letter-spacing:2px;font-family:monospace;margin-bottom:40px}

.actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
.btn{padding:10px 22px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:0.7px;cursor:pointer;border:none;font-family:monospace;text-decoration:none;display:inline-block;transition:all .15s}
.btn-p{background:${P.accent};color:#000}
.btn-p:hover{background:#c8ff6e}
.btn-s{background:${P.surface};color:${P.fg2};border:1px solid ${P.border2}}
.btn-s:hover{border-color:${P.accent};color:${P.accent}}
.btn-sm{padding:8px 16px;font-size:10px}

.section-label{font-size:8px;font-weight:700;letter-spacing:2px;color:${P.muted};font-family:monospace;margin-bottom:20px;text-transform:uppercase}

.screens-wrap{padding:0 0 64px;overflow:hidden}
.screens-wrap .section-label{padding:0 40px}
.screens-strip{display:flex;gap:20px;padding:0 40px;overflow-x:auto;scrollbar-width:none}
.screens-strip::-webkit-scrollbar{display:none}

.spec-area{padding:0 40px 64px;max-width:920px;margin:0 auto}
.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
.spec-card{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:28px}
.spec-h{font-size:8px;font-weight:700;letter-spacing:2px;color:${P.accent};margin-bottom:20px;font-family:monospace}

.type-row{display:flex;align-items:baseline;gap:10px;margin-bottom:8px}
.type-key{font-size:8px;color:${P.muted};font-family:monospace;min-width:56px;letter-spacing:1px}

.tokens-block{background:${P.bg};border:1px solid ${P.border};border-radius:10px;padding:20px;overflow-x:auto}
.tokens-block pre{font-size:10px;color:${P.fg2};font-family:'SF Mono',monospace;line-height:1.7;white-space:pre-wrap}

.principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px}
.principle{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:20px}
.p-icon{font-size:20px;margin-bottom:8px}
.p-title{font-size:10px;font-weight:700;color:${P.fg};letter-spacing:0.3px;margin-bottom:4px}
.p-desc{font-size:9px;color:${P.muted2};line-height:1.5}

.prd-area{padding:0 40px 64px;max-width:920px;margin:0 auto}
.prd-prompt{font-size:14px;font-style:italic;color:${P.fg2};line-height:1.7;border-left:3px solid ${P.accent};padding-left:24px;margin-bottom:40px}
.prd-h{font-size:11px;font-weight:700;letter-spacing:1.5px;color:${P.accent};font-family:monospace;margin-bottom:12px;margin-top:32px;text-transform:uppercase}
.prd-body{font-size:13px;color:${P.fg2};line-height:1.7}
.prd-body ul{padding-left:20px}
.prd-body li{margin-bottom:6px}

footer{border-top:1px solid ${P.border};padding:28px 40px;display:flex;align-items:center;justify-content:space-between}
.f-logo{font-size:10px;font-weight:800;letter-spacing:3px;color:${P.muted};font-family:monospace}
footer a{font-size:10px;color:${P.muted};text-decoration:none;margin-left:20px;letter-spacing:0.5px}
footer a:hover{color:${P.accent}}

#toast{position:fixed;bottom:28px;right:28px;background:${P.surface2};border:1px solid ${P.border2};color:${P.fg};padding:11px 18px;border-radius:8px;font-size:10px;font-family:monospace;opacity:0;transform:translateY(8px);transition:all .22s;pointer-events:none;z-index:999}
#toast.on{opacity:1;transform:translateY(0)}
</style>
</head>
<body>

<div class="header">
  <div class="logo">RAM DESIGN</div>
  <div>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" target="_blank">Interactive Mock</a>
    <a href="https://ram.zenbin.org/gallery">Gallery</a>
  </div>
</div>

<section class="hero">
  <div class="hero-tag">HEARTBEAT · ${DATE_STR} · PENCIL.DEV v2.8</div>
  <h1 class="hero-title">STRA<em>TUM</em></h1>
  <p class="tagline">${TAGLINE}</p>
  <p class="meta">5 SCREENS · MOBILE 390×844 · ELECTRIC LIME + DEEP CHARCOAL</p>
  <div class="actions">
    <button class="btn btn-p" onclick="openViewer()">Open in Viewer</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/${SLUG}-mock" target="_blank">Try Interactive Mock ✦</a>
    <button class="btn btn-s" onclick="downloadPen()">Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">Copy Prompt</button>
    <button class="btn btn-s" onclick="shareX()">Share on X</button>
    <a class="btn btn-s btn-sm" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="screens-wrap">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="screens-strip">${thumbsHTML}</div>
</div>

<div class="spec-area">
  <div class="spec-grid">
    <div class="spec-card">
      <div class="spec-h">COLOUR PALETTE</div>
      ${swatchHTML}
    </div>
    <div class="spec-card">
      <div class="spec-h">TYPE SCALE</div>
      <div class="type-row"><span class="type-key">DISPLAY</span><span style="font-size:30px;font-weight:900;color:${P.fg};letter-spacing:-1.5px">STRATUM</span></div>
      <div class="type-row"><span class="type-key">HEADING</span><span style="font-size:18px;font-weight:700;color:${P.fg}">Token Library</span></div>
      <div class="type-row"><span class="type-key">SUBHEAD</span><span style="font-size:13px;font-weight:600;color:${P.fg2}">Component Audit</span></div>
      <div class="type-row"><span class="type-key">BODY</span><span style="font-size:12px;color:${P.fg2}">187 tokens across 8 categories</span></div>
      <div class="type-row"><span class="type-key">LABEL</span><span style="font-size:8px;font-weight:700;letter-spacing:2px;color:${P.muted};font-family:monospace">TOKEN LIBRARY</span></div>
      <div style="margin-top:24px">
        <div class="spec-h">SPACING SYSTEM</div>
        ${[4,8,12,16,24,32,48,64].map(sp => `<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><div style="font-size:9px;color:${P.muted};font-family:monospace;width:28px">${sp}</div><div style="height:7px;border-radius:3px;background:${P.accent};width:${sp * 2}px;opacity:0.7"></div></div>`).join('')}
      </div>
    </div>
  </div>

  <div class="spec-card" style="margin-bottom:24px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="spec-h" style="margin-bottom:0">CSS DESIGN TOKENS</div>
      <button class="btn btn-s btn-sm" onclick="copyTokens()">COPY TOKENS</button>
    </div>
    <div class="tokens-block"><pre id="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></div>
  </div>

  <div class="section-label">DESIGN PRINCIPLES</div>
  <div class="principles-grid">
    <div class="principle"><div class="p-icon">⬡</div><div class="p-title">One Electric Accent</div><div class="p-desc">Electric lime #B4FF4C as the sole brand color — inspired by Diffusion Studio's minimal single-accent approach. No gradients, no competing hues.</div></div>
    <div class="principle"><div class="p-icon">◈</div><div class="p-title">AI as Structure</div><div class="p-desc">Purple #9D7FFF is reserved exclusively for AI elements. Users immediately know what is human-authored vs. machine-generated.</div></div>
    <div class="principle"><div class="p-icon">⋈</div><div class="p-title">Data Density</div><div class="p-desc">Every screen fits maximum actionable information into 390px. Inspired by Linear's information hierarchy — no filler, no chrome.</div></div>
  </div>
</div>

<div class="prd-area">
  <p class="prd-prompt">"${PROMPT}"</p>

  <div class="prd-h">Overview</div>
  <div class="prd-body">STRATUM is an AI-powered design system intelligence platform that gives teams real-time visibility into their component library's health, token consistency, and drift. Inspired by Diffusion Studio's minimal browser-editor precision, STRATUM treats the design system as living infrastructure — auditable, versioned, and continuously improved by an AI layer that runs silently in the background.</div>

  <div class="prd-h">Target Users</div>
  <div class="prd-body"><ul>
    <li><strong>Design System leads</strong> managing token libraries and component audits at scale</li>
    <li><strong>Senior product designers</strong> who need to catch regressions before they reach production</li>
    <li><strong>Engineering–design bridge teams</strong> working on Figma–code token synchronisation</li>
  </ul></div>

  <div class="prd-h">Core Features</div>
  <div class="prd-body"><ul>
    <li><strong>Token Library</strong> — searchable catalog of all design tokens with swatch previews, type tags, and live validity scores</li>
    <li><strong>Component Audit</strong> — AI health grid showing score, usage count, and issue count for every component in the library</li>
    <li><strong>Change History</strong> — semantic versioning timeline with patch/minor/major colour coding and AI-authored changesets</li>
    <li><strong>Dependency Map</strong> — interactive node graph showing which components depend on which tokens, with cycle detection</li>
    <li><strong>AI Insights</strong> — actionable recommendations ranked by impact/effort, auto-applicable quick wins</li>
  </ul></div>

  <div class="prd-h">Design Language</div>
  <div class="prd-body"><ul>
    <li><strong>Palette</strong> — Deep charcoal #0F0F12 inspired by Diffusion Studio's minimal dark foundation. Electric lime #B4FF4C replaces the expected indigo/teal — a deliberate provocation against safe design-tool defaults.</li>
    <li><strong>AI Visual Language</strong> — AI elements use violet #9D7FFF with subtle ambient glow (radial ellipses at 8–12% opacity). Users can distinguish AI recommendations from human-authored data at a glance.</li>
    <li><strong>Component Health Colors</strong> — Healthy: lime (brand). Warning: amber. Critical: red. Deprecated: muted. This creates an intuitive traffic-light system without extra labels.</li>
  </ul></div>

  <div class="prd-h">Screen Architecture</div>
  <div class="prd-body"><ul>
    <li><strong>Token Library</strong> — Search bar + category chips + searchable token rows with colored swatches and type pills</li>
    <li><strong>Component Audit</strong> — Stat strip (healthy/warning/critical/depr) + filter tabs + 2-column component card grid with score rings and health bars</li>
    <li><strong>Change History</strong> — Branch selector + type legend + chronological version rows with author, date, and change summaries</li>
    <li><strong>Dependency Map</strong> — Full-canvas node graph with type-coloured nodes, connection lines, and contextual info panel</li>
    <li><strong>AI Insights</strong> — AI presence indicator + purple summary banner with auto-apply CTA + 6 ranked suggestion cards</li>
  </ul></div>
</div>

<footer>
  <div class="f-logo">RAM DESIGN HEARTBEAT · ${DATE_STR}</div>
  <div>
    <a href="https://ram.zenbin.org/gallery">Gallery</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </div>
</footer>

<div id="toast"></div>

<script>
const PEN_B64 = '${PEN_B64}';
const PROMPT_TEXT = ${JSON.stringify(PROMPT)};

function openViewer(){ window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank'); }
function downloadPen(){
  const blob = new Blob([atob(PEN_B64)],{type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download='stratum.pen'; a.click();
  toast('Downloaded stratum.pen');
}
function copyPrompt(){ navigator.clipboard.writeText(PROMPT_TEXT).then(()=>toast('Prompt copied!')); }
function copyTokens(){
  const t = document.getElementById('tokens-pre').textContent;
  navigator.clipboard.writeText(t).then(()=>toast('CSS tokens copied!'));
}
function shareX(){
  const text = 'STRATUM — AI-Powered Design System Intelligence. Electric lime meets deep charcoal in a dark-mode design token manager. Designed by @RAM_design_ai';
  window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent('https://ram.zenbin.org/${SLUG}'),'_blank');
}
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('on');
  setTimeout(()=>t.classList.remove('on'),2500);
}
</script>
</body></html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Gallery push ──────────────────────────────────────────────────────────────
async function pushToGallery() {
  function ghReq(opts, body) {
    return new Promise((resolve, reject) => {
      const r = https.request(opts, res => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      r.on('error', reject);
      if (body) r.write(body);
      r.end();
    });
  }

  const getRes = await ghReq({
    hostname: 'api.github.com', path: `/repos/${GITHUB_REPO}/contents/queue.json`, method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: 'studio',
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await ghReq({
    hostname: 'api.github.com', path: `/repos/${GITHUB_REPO}/contents/queue.json`, method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);
  return putRes.status;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\nSTRATUM — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const r1 = await publish(SLUG, `${APP_NAME} — ${TAGLINE} · RAM Design Studio`, heroHTML);
  console.log(`  Hero:   ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  const r2 = await publish(`${SLUG}-viewer`, `${APP_NAME} — Viewer`, viewerHtml);
  console.log(`  Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  try {
    const gs = await pushToGallery();
    console.log(`  Queue:  HTTP ${gs}`);
  } catch(e) {
    console.log(`  Queue:  FAILED — ${e.message}`);
  }

  console.log('\n  Links:');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock (next step)`);
})();
