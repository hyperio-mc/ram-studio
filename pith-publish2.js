'use strict';
// pith-publish2.js — Hero + viewer + gallery for PITH

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'pith';
const APP_NAME  = 'PITH';
const TAGLINE   = 'Distilled Insights Reader';
const ARCHETYPE = 'productivity';
const DATE_STR  = 'March 22, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'pith.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.screens || [];

const SCREEN_NAMES = ['Today', 'Reader', 'Saved', 'Topics', 'Weekly'];

const P = {
  bg:      '#F5F0E8',
  bg2:     '#EDE8DE',
  surface: '#FDFAF5',
  border:  '#D8D1C4',
  border2: '#C4BDB2',
  fg:      '#1A1510',
  fg2:     '#3D3530',
  fg3:     '#7A7265',
  muted:   '#A89E94',
  accent:  '#C94B2C',
  accent2: '#4A7C6A',
  accent3: '#B8883A',
};

const PROMPT = `Design PITH — a warm editorial light-mode distilled insights reader, inspired by:
1. minimal.gallery (March 2026) — KOMETA Typefaces and Old Tom Capital entries showing editorial typographic minimalism. Ink-dark text on warm linen backgrounds, generous whitespace, strong typographic hierarchy. Translating this from web to mobile.
2. land-book.com (March 2026) — LangChain landing page showing clean AI tool information architecture with structured content cards and key insight callouts.
3. darkmodedesign.com — Linear's precision data layout (bar charts, metric triads) — reinterpreted in warm linen instead of electric dark.
5 screens: Today (daily digest with top story card and reading list), Reader (clean article view with pull-quote insight block), Saved (highlights and bookmarks archive), Topics (interest categories with colored topic cards), Weekly (reading stats with bar chart, streak, topic breakdown).
Palette: warm linen #F5F0E8, near-white #FDFAF5, rich ink #1A1510, terracotta #C94B2C, sage #4A7C6A, warm amber #B8883A. Editorial restraint over app-chrome excess.`;

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

// SVG renderer
function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#')) return c.length > 7 ? c.slice(0, 7) : c;
  const m = c.match(/^([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  if (m) return '#' + m[1];
  // Handle rgba — extract hex-ish approximation
  if (c.startsWith('rgba') || c.startsWith('rgb')) return P.bg2;
  return c === 'transparent' ? 'none' : P.bg;
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
    const lh    = size * 1.3;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i * lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${align}" font-weight="${node.fontWeight || 400}">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
    ).join('');
  }
  if (node.type === 'ellipse') {
    const fill   = sc(node.fill || 'transparent');
    const noFill = !node.fill || node.fill === 'transparent';
    return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${noFill?'none':fill}" opacity="${op}"/>`;
  }

  const fill   = sc(node.fill || P.bg);
  const noFill = !node.fill || node.fill === 'transparent';
  const r2     = node.cornerRadius || 0;
  const sw     = node.strokeWidth || 1;
  const strokeAttr = node.stroke ? ` stroke="${node.stroke}" stroke-width="${sw}"` : '';
  const clipId = node.clip ? `cp-${node.id}` : null;
  const kids   = (node.children || []).map(c => rn(c, x, y, depth + 1, maxD)).join('');

  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r2}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r2}" fill="${noFill?'none':fill}"${strokeAttr}/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r2}" fill="${noFill?'none':fill}"${strokeAttr} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, tw, th, maxD = 6) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const kids = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${P.bg}"/>${kids}</svg>`;
}

const cssTokens = `:root {
  /* PITH Design Tokens — Distilled Insights Reader */

  /* Backgrounds */
  --bg:           ${P.bg};
  --bg-2:         ${P.bg2};
  --surface:      ${P.surface};
  --border:       ${P.border};
  --border-2:     ${P.border2};

  /* Foreground */
  --fg:           ${P.fg};
  --fg-2:         ${P.fg2};
  --fg-3:         ${P.fg3};
  --muted:        ${P.muted};

  /* Brand — Terracotta + Sage + Amber */
  --accent:       ${P.accent};
  --accent-2:     ${P.accent2};
  --accent-3:     ${P.accent3};

  /* Typography */
  --font-display: 800 clamp(28px,6vw,52px)/1.1 'Georgia', serif;
  --font-heading: 700 16px/1.3 'Inter', system-ui, sans-serif;
  --font-label:   700 9px/1 'Inter', system-ui, sans-serif;
  --font-body:    400 13px/1.65 'Inter', system-ui, sans-serif;

  /* Spacing (4px base) */
  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-5: 24px;  --s-6: 32px;  --s-7: 48px;  --s-8: 64px;

  /* Radius */
  --r-sm: 4px;  --r-md: 8px;  --r-lg: 16px;  --r-pill: 100px;
}`;

const THUMB_W = 175, THUMB_H = 380;

const thumbsHTML = screens.map((sc2, i) =>
  `<div style="text-align:center;flex-shrink:0">
    <div style="border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(26,21,16,0.12),0 0 0 1px ${P.border}">
      ${screenSVG(sc2, THUMB_W, THUMB_H, 6)}
    </div>
    <div style="font-size:8px;color:${P.muted};margin-top:10px;letter-spacing:2px;font-weight:700;font-family:monospace">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

const swatchData = [
  [P.bg,      'LINEN BG',    P.bg     ],
  [P.surface, 'CREAM SURF',  P.surface],
  [P.fg,      'RICH INK',    P.fg     ],
  [P.accent,  'TERRACOTTA',  P.accent ],
  [P.accent2, 'SAGE GREEN',  P.accent2],
  [P.accent3, 'WARM AMBER',  P.accent3],
  [P.bg2,     'LINEN 2',     P.bg2    ],
  [P.muted,   'STONE MUTED', P.muted  ],
];

const swatchHTML = swatchData.map(([color, name, hex]) =>
  `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
    <div style="width:36px;height:36px;border-radius:8px;background:${color};border:1px solid ${P.border};flex-shrink:0"></div>
    <div>
      <div style="font-size:10px;font-weight:700;color:${P.fg};letter-spacing:0.5px">${name}</div>
      <div style="font-size:9px;color:${P.muted};font-family:monospace">${hex}</div>
    </div>
  </div>`
).join('');

const PEN_B64 = Buffer.from(penJson).toString('base64');

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} · RAM Design Studio</title>
<meta name="description" content="${APP_NAME} — ${TAGLINE}. Editorial light-mode insights reader app. Designed by RAM Design AI.">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${P.bg};color:${P.fg};font-family:'Inter','SF Pro Text',system-ui,sans-serif;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.header{padding:18px 40px;border-bottom:1px solid ${P.border};display:flex;align-items:center;justify-content:space-between}
.logo{font-size:12px;font-weight:800;letter-spacing:3px;color:${P.accent};font-family:Georgia,serif}
.header a{font-size:10px;color:${P.muted};text-decoration:none;letter-spacing:0.5px;margin-left:24px}
.header a:hover{color:${P.accent}}

.hero{padding:72px 40px 48px;max-width:900px;margin:0 auto;text-align:center;position:relative}
.hero::before{content:'';position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:700px;height:320px;background:radial-gradient(ellipse,${P.accent}0A 0%,transparent 65%);pointer-events:none}
.hero-tag{display:inline-block;font-size:9px;font-weight:600;letter-spacing:2px;color:${P.accent2};background:${P.accent2}18;border:1px solid ${P.accent2}35;padding:6px 16px;border-radius:4px;margin-bottom:24px;font-family:monospace}
.hero-title{font-size:clamp(52px,10vw,100px);font-weight:800;letter-spacing:-3px;line-height:0.92;color:${P.fg};margin-bottom:18px;font-family:Georgia,serif}
.hero-title em{color:${P.accent};font-style:italic}
.tagline{font-size:16px;color:${P.fg3};max-width:480px;margin:0 auto 14px;line-height:1.6;font-style:italic;font-family:Georgia,serif}
.meta{font-size:9px;color:${P.muted};letter-spacing:2px;font-family:monospace;margin-bottom:36px}

.actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
.btn{padding:10px 22px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.5px;cursor:pointer;border:none;font-family:inherit;text-decoration:none;display:inline-block;transition:all .15s}
.btn-p{background:${P.accent};color:#fff}
.btn-p:hover{opacity:0.88}
.btn-s{background:${P.surface};color:${P.fg2};border:1px solid ${P.border}}
.btn-s:hover{border-color:${P.accent};color:${P.accent}}
.btn-g{background:${P.accent2};color:#fff}
.btn-sm{padding:8px 14px;font-size:10px}

.section-label{font-size:8px;font-weight:700;letter-spacing:2px;color:${P.muted};font-family:monospace;margin-bottom:20px;text-transform:uppercase}

.screens-wrap{padding:0 0 64px;overflow:hidden}
.screens-wrap .section-label{padding:0 40px}
.screens-strip{display:flex;gap:20px;padding:0 40px;overflow-x:auto;scrollbar-width:none}
.screens-strip::-webkit-scrollbar{display:none}

.spec-area{padding:0 40px 64px;max-width:900px;margin:0 auto}
.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
.spec-card{background:${P.surface};border:1px solid ${P.border};border-radius:8px;padding:28px}
.spec-h{font-size:8px;font-weight:700;letter-spacing:2px;color:${P.accent};margin-bottom:20px;font-family:monospace;text-transform:uppercase}

.type-row{display:flex;align-items:baseline;gap:10px;margin-bottom:8px}
.type-key{font-size:8px;color:${P.muted};font-family:monospace;min-width:56px;letter-spacing:1px}

.tokens-block{background:${P.bg};border:1px solid ${P.border};border-radius:8px;padding:20px;overflow-x:auto}
.tokens-block pre{font-size:10px;color:${P.fg2};font-family:'SF Mono',monospace;line-height:1.7;white-space:pre-wrap}

.principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px}
.principle{background:${P.surface};border:1px solid ${P.border};border-radius:8px;padding:20px}
.p-icon{font-size:22px;margin-bottom:8px}
.p-title{font-size:10px;font-weight:700;color:${P.fg};letter-spacing:0.3px;margin-bottom:4px}
.p-desc{font-size:9px;color:${P.muted};line-height:1.5}

.prd-area{padding:0 40px 64px;max-width:900px;margin:0 auto}
.prd-prompt{font-size:13px;font-style:italic;color:${P.fg2};line-height:1.7;border-left:3px solid ${P.accent};padding-left:24px;margin-bottom:40px;font-family:Georgia,serif}
.prd-h{font-size:10px;font-weight:700;letter-spacing:1.5px;color:${P.accent};font-family:monospace;margin-bottom:10px;margin-top:28px;text-transform:uppercase}
.prd-body{font-size:13px;color:${P.fg2};line-height:1.7}
.prd-body ul{padding-left:20px}
.prd-body li{margin-bottom:6px}

footer{border-top:1px solid ${P.border};padding:28px 40px;display:flex;align-items:center;justify-content:space-between}
.f-logo{font-size:10px;font-weight:800;letter-spacing:3px;color:${P.muted};font-family:Georgia,serif}
footer a{font-size:10px;color:${P.muted};text-decoration:none;margin-left:20px;letter-spacing:0.5px}
footer a:hover{color:${P.accent}}

#toast{position:fixed;bottom:28px;right:28px;background:${P.fg};color:${P.bg};padding:10px 16px;border-radius:4px;font-size:10px;font-family:monospace;opacity:0;transform:translateY(8px);transition:all .22s;pointer-events:none;z-index:999}
#toast.on{opacity:1;transform:translateY(0)}
</style>
</head>
<body>

<div class="header">
  <div class="logo">PITH</div>
  <div>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" target="_blank">Interactive Mock</a>
    <a href="https://ram.zenbin.org/gallery">Gallery</a>
  </div>
</div>

<section class="hero">
  <div class="hero-tag">HEARTBEAT · ${DATE_STR} · LIGHT THEME · PENCIL.DEV v2.8</div>
  <h1 class="hero-title">PI<em>TH</em></h1>
  <p class="tagline">${TAGLINE}</p>
  <p class="meta">5 SCREENS · MOBILE 390×844 · TERRACOTTA + SAGE + WARM LINEN</p>
  <div class="actions">
    <button class="btn btn-p" onclick="openViewer()">Open in Viewer</button>
    <a class="btn btn-g" href="https://ram.zenbin.org/${SLUG}-mock" target="_blank">Try Interactive Mock ☀◑</a>
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
      <div class="type-row"><span class="type-key">DISPLAY</span><span style="font-size:28px;font-weight:800;color:${P.fg};letter-spacing:-1px;font-family:Georgia,serif">Pith</span></div>
      <div class="type-row"><span class="type-key">HEADING</span><span style="font-size:18px;font-weight:700;color:${P.fg}">Top Story</span></div>
      <div class="type-row"><span class="type-key">BODY</span><span style="font-size:13px;color:${P.fg2}">Read less. Know more.</span></div>
      <div class="type-row"><span class="type-key">LABEL</span><span style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:${P.muted}">TOP STORY</span></div>
      <div class="type-row"><span class="type-key">ACCENT</span><span style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:${P.accent}">KEY INSIGHT</span></div>
      <div style="margin-top:24px">
        <div class="spec-h">SPACING SYSTEM</div>
        ${[4,8,12,16,24,32,48,64].map(sp => `<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><div style="font-size:9px;color:${P.muted};font-family:monospace;width:28px">${sp}</div><div style="height:7px;border-radius:3px;background:${P.accent};width:${sp * 2}px;opacity:0.6"></div></div>`).join('')}
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
    <div class="principle"><div class="p-icon">✦</div><div class="p-title">Editorial Type Hierarchy</div><div class="p-desc">Inspired by minimal.gallery's KOMETA Typefaces and Old Tom Capital — ink-dark text on warm linen with strong typographic scale. The headline IS the interface.</div></div>
    <div class="principle"><div class="p-icon">◈</div><div class="p-title">Pull-Quote Insight Block</div><div class="p-desc">Every article surfaces its single most important idea in a terracotta-bordered callout block. Inspired by LangChain's key insight cards on land-book.com.</div></div>
    <div class="principle"><div class="p-icon">◷</div><div class="p-title">Reading Cadence Data</div><div class="p-desc">Weekly stats with a 7-bar chart, streak counter, and topic breakdown — Linear's precision data rhythm (darkmodedesign.com) translated to warm linen instead of electric dark.</div></div>
  </div>
</div>

<div class="prd-area">
  <p class="prd-prompt">"${PROMPT}"</p>

  <div class="prd-h">Overview</div>
  <div class="prd-body">PITH is a distilled insights reading app built on the premise that every article has one thing worth knowing — and everything else is noise. Warm linen backgrounds and editorial typography create a reading environment that feels like a considered paper journal. The terracotta "KEY INSIGHT" pull-quote block on every article is the product's core UX innovation.</div>

  <div class="prd-h">Target Users</div>
  <div class="prd-body"><ul>
    <li><strong>Busy knowledge workers</strong> who want to stay current but can't read long-form daily</li>
    <li><strong>Note-takers and highlight collectors</strong> who build personal knowledge bases</li>
    <li><strong>Topic-focused readers</strong> in AI, design, finance who want curated signal</li>
  </ul></div>

  <div class="prd-h">Core Features</div>
  <div class="prd-body"><ul>
    <li><strong>Today</strong> — featured top story with topic chip, three row items below, 7-day reading streak badge</li>
    <li><strong>Reader</strong> — clean article view with terracotta-bordered "KEY INSIGHT" callout and reading progress bar</li>
    <li><strong>Saved</strong> — personal highlights archive with colored left-border pull-quotes and bookmarked articles</li>
    <li><strong>Topics</strong> — colored topic category cards (AI/Design/Finance) with story counts and new item badges</li>
    <li><strong>Weekly</strong> — 7-bar daily reading chart, metric triads, topic breakdown bars, streak counter</li>
  </ul></div>

  <div class="prd-h">Design Decisions</div>
  <div class="prd-body"><ul>
    <li><strong>Warm linen palette</strong> — #F5F0E8 bg, #C94B2C terracotta, #4A7C6A sage. Rebellion against the cool blue/white of typical reading apps (Pocket, Feedly).</li>
    <li><strong>Pull-quote as primary UI pattern</strong> — the bordered insight block is both a reading aid and the save-to-highlights affordance. Function and form unified.</li>
    <li><strong>Editorial label typography</strong> — ALL-CAPS spaced labels ("TOP STORY", "KEY INSIGHT") reference print editorial tradition while providing scannable information hierarchy in mobile context.</li>
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
  a.download='${SLUG}.pen'; a.click();
  toast('Downloaded ${SLUG}.pen');
}
function copyPrompt(){ navigator.clipboard.writeText(PROMPT_TEXT).then(()=>toast('Prompt copied!')); }
function copyTokens(){
  const t = document.getElementById('tokens-pre').textContent;
  navigator.clipboard.writeText(t).then(()=>toast('CSS tokens copied!'));
}
function shareX(){
  const text = 'PITH — Distilled Insights Reader. Warm linen + terracotta editorial reading app. Light-mode done right. Designed by @RAM_design_ai';
  window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent('https://ram.zenbin.org/${SLUG}'),'_blank');
}
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('on');
  setTimeout(()=>t.classList.remove('on'),2500);
}
</script>
</body></html>`;

// Viewer
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// Gallery
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
    archetype: ARCHETYPE,
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

(async () => {
  console.log('\nPITH — Design Discovery Pipeline');
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
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock (building next)`);
})();
