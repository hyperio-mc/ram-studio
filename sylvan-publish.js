'use strict';
// sylvan-publish.js — Hero + viewer + gallery for SYLVAN

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'sylvan';
const APP_NAME  = 'SYLVAN';
const TAGLINE   = 'Slow Living, Daily Reflection';
const ARCHETYPE = 'wellness';
const DATE_STR  = 'March 22, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'sylvan.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.screens || [];

const SCREEN_NAMES = ['Today', 'Journal', 'Habits', 'Garden', 'Insights'];

const P = {
  bg:      '#FAF8F3',
  bg2:     '#F3EFE6',
  bg3:     '#EDE7D9',
  surface: '#FFFFFF',
  border:  '#E0D9CC',
  border2: '#CEC5B3',
  fg:      '#1C1917',
  fg2:     '#3D3530',
  fg3:     '#7A6E64',
  muted:   '#A89E94',
  accent:  '#C8614A',
  accent2: '#8FAF78',
  accent3: '#D4A84B',
};

const PROMPT = `Design SYLVAN — a warm artisanal light-mode daily reflection and habit tracker, inspired by:
1. Idle Hour Matcha (Lapa.ninja, March 2026 featured) — earthy editorial aesthetic, cream/terracotta palette. The trend of "slow brands" moving into digital products.
2. Emergence Magazine (Siteinspire + Lapa.ninja) — typographic editorial layouts, serif headlines mixed with clean grotesque body text, vast breathing whitespace.
3. Mike Matas Portfolio (Godly #959) — minimal clean interactive layouts, Lab Grotesque typography, strong use of negative space.
4. Typographic category on Siteinspire (2,052 sites!) — type-led design where the headline IS the hero.
5 screens: Today (morning intentions + mood), Journal (reflection entries), Habits (ritual tracker), Garden (28-day visual blooms), Insights (mood patterns + AI observations).
Palette: warm ivory #FAF8F3, terracotta #C8614A, sage green #8FAF78, amber gold #D4A84B. Explicit rebellion against blue/purple wellness app clichés.`;

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
  const screenChildren = screen.children || [];
  // Each screen has one top-level frame child
  const content = screenChildren.map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${P.bg}"/>${content}</svg>`;
}

const cssTokens = `:root {
  /* SYLVAN Design Tokens — Slow Living, Daily Reflection */

  /* Backgrounds */
  --bg:           ${P.bg};
  --bg-2:         ${P.bg2};
  --bg-3:         ${P.bg3};
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
  --font-display: 700 clamp(28px,6vw,52px)/1.1 'Georgia', 'Playfair Display', serif;
  --font-heading: 600 18px/1.2 'Inter', system-ui, sans-serif;
  --font-label:   600 10px/1 'Inter', system-ui, sans-serif;
  --font-body:    400 14px/1.65 'Inter', system-ui, sans-serif;

  /* Spacing (4px base) */
  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-5: 24px;  --s-6: 32px;  --s-7: 48px;  --s-8: 64px;

  /* Radius */
  --r-sm: 8px;  --r-md: 12px;  --r-lg: 16px;  --r-pill: 100px;
}`;

const THUMB_W = 175, THUMB_H = 380;

const thumbsHTML = screens.map((sc2, i) =>
  `<div style="text-align:center;flex-shrink:0">
    <div style="border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(28,25,23,0.12),0 0 0 1px ${P.border}">
      ${screenSVG(sc2, THUMB_W, THUMB_H, 6)}
    </div>
    <div style="font-size:8px;color:${P.muted};margin-top:10px;letter-spacing:2px;font-weight:700;font-family:monospace">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

const swatchData = [
  [P.bg,      'IVORY BG',    P.bg     ],
  [P.surface, 'SURFACE',     P.surface],
  [P.fg,      'CHARCOAL',    P.fg     ],
  [P.accent,  'TERRACOTTA',  P.accent ],
  [P.accent2, 'SAGE GREEN',  P.accent2],
  [P.accent3, 'AMBER GOLD',  P.accent3],
  [P.bg3,     'LINEN',       P.bg3    ],
  [P.muted,   'MUTED',       P.muted  ],
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
<meta name="description" content="${APP_NAME} — ${TAGLINE}. A warm artisanal light-mode mindfulness app. Designed by RAM Design AI.">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${P.bg};color:${P.fg};font-family:'Inter','SF Pro Text',system-ui,sans-serif;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.header{padding:18px 40px;border-bottom:1px solid ${P.border};display:flex;align-items:center;justify-content:space-between}
.logo{font-size:12px;font-weight:800;letter-spacing:3px;color:${P.accent};font-family:monospace}
.header a{font-size:10px;color:${P.muted};text-decoration:none;letter-spacing:0.5px;margin-left:24px}
.header a:hover{color:${P.accent}}

.hero{padding:72px 40px 48px;max-width:900px;margin:0 auto;text-align:center;position:relative}
.hero::before{content:'';position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:700px;height:320px;background:radial-gradient(ellipse,${P.accent}0A 0%,transparent 65%);pointer-events:none}
.hero-tag{display:inline-block;font-size:9px;font-weight:600;letter-spacing:2px;color:${P.accent2};background:${P.accent2}18;border:1px solid ${P.accent2}35;padding:6px 16px;border-radius:4px;margin-bottom:24px;font-family:monospace}
.hero-title{font-size:clamp(52px,10vw,100px);font-weight:700;letter-spacing:-3px;line-height:0.92;color:${P.fg};margin-bottom:18px;font-family:Georgia,serif}
.hero-title em{color:${P.accent};font-style:italic}
.tagline{font-size:16px;color:${P.fg3};max-width:480px;margin:0 auto 14px;line-height:1.6}
.meta{font-size:9px;color:${P.muted};letter-spacing:2px;font-family:monospace;margin-bottom:36px}

.actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
.btn{padding:10px 22px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:0.5px;cursor:pointer;border:none;font-family:inherit;text-decoration:none;display:inline-block;transition:all .15s}
.btn-p{background:${P.accent};color:#fff}
.btn-p:hover{background:#b5533e}
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
.spec-card{background:${P.surface};border:1px solid ${P.border};border-radius:14px;padding:28px}
.spec-h{font-size:8px;font-weight:700;letter-spacing:2px;color:${P.accent};margin-bottom:20px;font-family:monospace}

.type-row{display:flex;align-items:baseline;gap:10px;margin-bottom:8px}
.type-key{font-size:8px;color:${P.muted};font-family:monospace;min-width:56px;letter-spacing:1px}

.tokens-block{background:${P.bg};border:1px solid ${P.border};border-radius:10px;padding:20px;overflow-x:auto}
.tokens-block pre{font-size:10px;color:${P.fg2};font-family:'SF Mono',monospace;line-height:1.7;white-space:pre-wrap}

.principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px}
.principle{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:20px}
.p-icon{font-size:22px;margin-bottom:8px}
.p-title{font-size:10px;font-weight:700;color:${P.fg};letter-spacing:0.3px;margin-bottom:4px}
.p-desc{font-size:9px;color:${P.muted};line-height:1.5}

.prd-area{padding:0 40px 64px;max-width:900px;margin:0 auto}
.prd-prompt{font-size:13px;font-style:italic;color:${P.fg2};line-height:1.7;border-left:3px solid ${P.accent};padding-left:24px;margin-bottom:40px}
.prd-h{font-size:10px;font-weight:700;letter-spacing:1.5px;color:${P.accent};font-family:monospace;margin-bottom:10px;margin-top:28px;text-transform:uppercase}
.prd-body{font-size:13px;color:${P.fg2};line-height:1.7}
.prd-body ul{padding-left:20px}
.prd-body li{margin-bottom:6px}

footer{border-top:1px solid ${P.border};padding:28px 40px;display:flex;align-items:center;justify-content:space-between}
.f-logo{font-size:10px;font-weight:800;letter-spacing:3px;color:${P.muted};font-family:monospace}
footer a{font-size:10px;color:${P.muted};text-decoration:none;margin-left:20px;letter-spacing:0.5px}
footer a:hover{color:${P.accent}}

#toast{position:fixed;bottom:28px;right:28px;background:${P.fg};color:${P.bg};padding:10px 16px;border-radius:8px;font-size:10px;font-family:monospace;opacity:0;transform:translateY(8px);transition:all .22s;pointer-events:none;z-index:999}
#toast.on{opacity:1;transform:translateY(0)}
</style>
</head>
<body>

<div class="header">
  <div class="logo">RAM · SYLVAN</div>
  <div>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" target="_blank">Interactive Mock</a>
    <a href="https://ram.zenbin.org/gallery">Gallery</a>
  </div>
</div>

<section class="hero">
  <div class="hero-tag">HEARTBEAT · ${DATE_STR} · LIGHT THEME · PENCIL.DEV v2.8</div>
  <h1 class="hero-title">SYL<em>VAN</em></h1>
  <p class="tagline">${TAGLINE}</p>
  <p class="meta">5 SCREENS · MOBILE 390×844 · TERRACOTTA + SAGE + WARM IVORY</p>
  <div class="actions">
    <button class="btn btn-p" onclick="openViewer()">Open in Viewer</button>
    <a class="btn btn-g" href="https://ram.zenbin.org/${SLUG}-mock" target="_blank">Try Interactive Mock ❧</a>
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
      <div class="type-row"><span class="type-key">DISPLAY</span><span style="font-size:28px;font-weight:700;color:${P.fg};letter-spacing:-1px;font-family:Georgia,serif;font-style:italic">Sylvan</span></div>
      <div class="type-row"><span class="type-key">HEADING</span><span style="font-size:18px;font-weight:600;color:${P.fg}">Morning Intentions</span></div>
      <div class="type-row"><span class="type-key">BODY</span><span style="font-size:14px;color:${P.fg2}">How are you feeling today?</span></div>
      <div class="type-row"><span class="type-key">LABEL</span><span style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:${P.muted}">TODAY'S INTENTIONS</span></div>
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
    <div class="principle"><div class="p-icon">🌿</div><div class="p-title">Slow Brand Aesthetic</div><div class="p-desc">Inspired by Idle Hour Matcha on Lapa.ninja — warm cream and terracotta replace the sterile whites of typical wellness apps. Warmth is intentional, not accidental.</div></div>
    <div class="principle"><div class="p-icon">✦</div><div class="p-title">Type as Hero</div><div class="p-desc">Siteinspire's #2 category is "Typographic" (2,052 sites). The greeting headline IS the first interaction — no hero image needed. Inspired by Emergence Magazine's editorial rhythm.</div></div>
    <div class="principle"><div class="p-icon">❧</div><div class="p-title">Garden Metaphor</div><div class="p-desc">Habit completion visualised as an organic bloom calendar — 28 glowing dots that fill with color as you build streaks. Growth made tangible without gamification gimmicks.</div></div>
  </div>
</div>

<div class="prd-area">
  <p class="prd-prompt">"${PROMPT}"</p>

  <div class="prd-h">Overview</div>
  <div class="prd-body">SYLVAN is a daily reflection and habit tracker built around the "slow living" movement — where the digital product itself feels as considered and unhurried as a hand-thrown ceramic mug. Warm ivory backgrounds, terracotta accents, and organic blob decorations create an environment that feels like a paper journal, not a productivity dashboard.</div>

  <div class="prd-h">Target Users</div>
  <div class="prd-body"><ul>
    <li><strong>Intentional living practitioners</strong> — people actively trying to disconnect from screen addiction</li>
    <li><strong>Journaling enthusiasts</strong> who want a digital supplement, not a replacement for their paper practice</li>
    <li><strong>Habit formation beginners</strong> — the gentle "garden" metaphor makes tracking feel nurturing vs. punishing</li>
  </ul></div>

  <div class="prd-h">Core Features</div>
  <div class="prd-body"><ul>
    <li><strong>Today</strong> — mood emoji check-in, 4 daily intentions with completion toggles, a daily quote, and two quick-log widgets (water, breathwork)</li>
    <li><strong>Journal</strong> — 14-day streak tracker, week dot strip, and scrolling entry cards with mood tag and category pill</li>
    <li><strong>Habits</strong> — ritual list with emoji icons, streak counts, and satisfying round check completion buttons</li>
    <li><strong>Garden</strong> — 28-day bloom calendar where each day glows proportionally to habit completion — the product's signature visual</li>
    <li><strong>Insights</strong> — weekly mood bar chart + three AI-observed pattern cards (best day, correlations, hydration)</li>
  </ul></div>

  <div class="prd-h">Design Decisions</div>
  <div class="prd-body"><ul>
    <li><strong>No blue/purple</strong> — terracotta #C8614A, sage #8FAF78, amber #D4A84B. A deliberate palette rebellion against wellness app defaults.</li>
    <li><strong>Organic blob decorations</strong> — overlapping ellipses at 5-10% opacity create warmth without hard gradients. Echoes the hand-crafted ceramic brand aesthetic.</li>
    <li><strong>Editorial serif in headlines</strong> — "Good morning, Rakis." is set in a bold serif weight, referencing Emergence Magazine's typographic authority.</li>
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
  const text = 'SYLVAN — Slow Living, Daily Reflection. Warm ivory + terracotta + sage green wellness app. Light-mode done right. Designed by @RAM_design_ai';
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
  console.log('\nSYLVAN — Design Discovery Pipeline');
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
