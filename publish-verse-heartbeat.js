'use strict';
// publish-verse-heartbeat.js
// Publishes VERSE — Editorial Dark Journaling for Writers
// Design Heartbeat — Mar 19, 2026
// Inspired by:
//   • Linear "Last Year You Said Next Year" manifesto — godly.website (linear.app/change)
//   • Dark Mode Design nominees (darkmodedesign.com) — Flomodia, Forge, Midday
//   • Awwwards nominees Mar 2026 — "THIBAULT GUIGNAND PORTFOLIO", "Good Fella"
//   • Compound Membership (withcompound.com/membership) — lavender on dark

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

async function getQueueSha() {
  const r = await new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.end();
  });
  if (r.status !== 200) throw new Error('Cannot get SHA: ' + r.status);
  return JSON.parse(r.body).sha;
}

async function pushGalleryEntry(entry) {
  let queue;
  try {
    const raw = await new Promise((resolve) => {
      const opts = {
        hostname: 'raw.githubusercontent.com',
        path: `/${GITHUB_REPO}/main/queue.json`,
        method: 'GET',
        headers: { 'User-Agent': 'design-studio-agent/1.0' },
      };
      const req = https.request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(d));
      });
      req.on('error', () => resolve('{"submissions":[]}'));
      req.end();
    });
    queue = JSON.parse(raw);
  } catch { queue = { submissions: [] }; }

  queue.submissions.push(entry);
  const sha = await getQueueSha();
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `add: verse-heartbeat — editorial journaling app design`,
    content,
    sha,
  });
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

// ── Design constants ──────────────────────────────────────────────────────────
const SLUG     = 'verse-heartbeat';
const APP_NAME = 'VERSE';
const TAGLINE  = 'Editorial dark journaling. Every day deserves a page.';
const DATE_STR = 'March 19, 2026';

const P = {
  bg:       '#0A0A0A',
  surface:  '#131313',
  surface2: '#1A1A1A',
  border:   '#242424',
  border2:  '#2E2E2E',
  muted:    '#404040',
  dim:      '#606060',
  fg:       '#E8E3D8',
  fg2:      '#9A9487',
  amber:    '#C8A96E',
  lavender: '#8B7CF8',
  sage:     '#5B8A6E',
};

// ── Read the .pen file ────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'verse-app.pen'), 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── SVG renderer ──────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || c === 'none') return 'none';
  if (c === '#00000000') return 'none';
  if (c.length === 9) {
    const a = parseInt(c.slice(7, 9), 16) / 255;
    return `rgba(${parseInt(c.slice(1,3),16)},${parseInt(c.slice(3,5),16)},${parseInt(c.slice(5,7),16)},${a.toFixed(2)})`;
  }
  // handle 7-char + 2-char alpha suffix (e.g. #C8A96E12)
  if (c.length === 9 && c[0] === '#') {
    const a = parseInt(c.slice(7, 9), 16) / 255;
    return `rgba(${parseInt(c.slice(1,3),16)},${parseInt(c.slice(3,5),16)},${parseInt(c.slice(5,7),16)},${a.toFixed(2)})`;
  }
  return c;
}

function rn(n, ox, oy) {
  if (!n || typeof n !== 'object') return '';
  const nx = (n.x || 0) + ox, ny = (n.y || 0) + oy;
  const w  = n.width || 0, h = n.height || 0;
  const op = n.opacity !== undefined ? n.opacity : 1;
  const r  = n.cornerRadius || 0;
  let out  = '';

  if (n.type === 'frame' || n.type === 'group') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    const cid = n.clip ? 'cl' + n.id : '';
    if (cid) out += `<defs><clipPath id="${cid}"><rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>`;
    out += `<rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
    const inner = (n.children || []).map(c => rn(c, nx, ny)).join('');
    out += cid ? `<g clip-path="url(#${cid})">${inner}</g>` : inner;
  } else if (n.type === 'rectangle') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    out += `<rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
  } else if (n.type === 'ellipse') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    out += `<ellipse cx="${nx + w/2}" cy="${ny + h/2}" rx="${w/2}" ry="${h/2}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
  } else if (n.type === 'text') {
    const fs = n.fontSize || 12, fw = n.fontWeight || '400';
    const ta = n.textAlign || 'left';
    let ax = nx;
    if (ta === 'center') ax = nx + w / 2;
    else if (ta === 'right') ax = nx + w;
    const anchor = ta === 'center' ? 'middle' : ta === 'right' ? 'end' : 'start';
    const lh = n.lineHeight || (fs * 1.3);
    const ls = n.letterSpacing ? `letter-spacing="${n.letterSpacing}"` : '';
    const fontFamily = fs >= 24 ? "'Georgia','Times New Roman',serif" : "system-ui,-apple-system,sans-serif";
    (n.content || '').split('\n').forEach((line, li) => {
      out += `<text x="${ax}" y="${ny + fs + li * lh}" font-size="${fs}" font-weight="${fw}" font-family="${fontFamily}" fill="${sc(n.fill || P.fg)}" text-anchor="${anchor}" dominant-baseline="auto" opacity="${op}" ${ls}>${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    });
  }
  return out;
}

function screenSVG(screen, thumbW, thumbH) {
  const sw = screen.width || 375, sh = screen.height || 812;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0)).join('');
  const bg = sc(screen.fill || P.bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${bg}"/>${content}</svg>`;
}

// ── Screen names ──────────────────────────────────────────────────────────────
const SCREEN_NAMES = [
  'Manifesto / Onboarding',
  'Today\'s Page',
  'Archive / Entry List',
  'Year in Words',
  'Reading an Entry',
];

const THUMB_W = 160, THUMB_H = 346;

const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H)}
    <div style="font-size:9px;color:${P.muted};margin-top:8px;letter-spacing:1.5px;font-weight:600">${(SCREEN_NAMES[i] || ('SCREEN ' + (i+1))).toUpperCase()}</div>
  </div>`
).join('');

const penEscaped = penJson
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/'/g, '&#39;');

const cssTokens = `:root {
  /* Color — VERSE palette */
  --color-bg:        ${P.bg};
  --color-surface:   ${P.surface};
  --color-surface-2: ${P.surface2};
  --color-border:    ${P.border};
  --color-fg:        ${P.fg};
  --color-fg-2:      ${P.fg2};
  --color-amber:     ${P.amber};
  --color-lavender:  ${P.lavender};
  --color-sage:      ${P.sage};
  --color-muted:     ${P.muted};

  /* Typography */
  --font-display: 900 clamp(36px, 8vw, 80px) / 1 Georgia, 'Times New Roman', serif;
  --font-heading: 700 22px / 1.3 system-ui, -apple-system, sans-serif;
  --font-body:    400 15px / 1.73 system-ui, -apple-system, sans-serif;
  --font-caption: 700 9px / 1 system-ui, -apple-system, sans-serif;

  /* Spacing (4px base) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 32px; --space-6: 48px; --space-7: 64px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;
  --radius-lg: 16px; --radius-full: 9999px;

  /* Writing states */
  --state-flow:  ${P.amber};   /* peak writing session */
  --state-good:  ${P.sage};    /* solid entry */
  --state-empty: ${P.muted};   /* blank day */
}`;

const shareText = encodeURIComponent(
  `VERSE — Editorial dark journaling. "You haven't written today." 5-screen dark app design by RAM Design Studio, inspired by Linear's manifesto aesthetic.`
);

const prd = `
<h3>OVERVIEW</h3>
<p>VERSE is a dark-mode mobile journaling app that treats every day as an editorial page. It confronts writers with their absence through stark manifesto-style copy, provides a minimal writing surface free of distraction, and helps them understand their writing patterns over time through a "Year in Words" pixel-grid visualization.</p>
<p>The design language is a direct response to the editorial manifesto trend popularized by Linear's "Last Year You Said Next Year" campaign (seen on godly.website), translated into a daily writing practice tool.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Journal writers</strong> who start and stop habitually — they need confrontation, not encouragement</li>
<li><strong>Developers and makers</strong> who process their work through writing but lack a dedicated tool</li>
<li><strong>Long-form writers</strong> who want to capture the raw material for essays, posts, and reflections</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Manifesto Onboarding</strong> — a confrontational editorial hero: "You haven't written today." Massive serif type on void black</li>
<li><strong>Today's Page</strong> — the daily blank canvas. Large date header, writing surface, daily AI prompt in soft lavender</li>
<li><strong>Archive</strong> — editorial entry list with word counts, mood indicators (◆ flow / ◇ good / · empty)</li>
<li><strong>Year in Words</strong> — dot-grid year visualization, monthly breakdown bars, AI-generated writing pattern insight</li>
<li><strong>Entry Reading</strong> — typography-first single entry view with pull-quote treatment and editorial dithered header</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Near-void black (#0A0A0A)</strong> — the void that writers face. Premium and honest.</li>
<li><strong>Aged amber (#C8A96E)</strong> — primary accent, warmth of parchment and candlelight. Primary data, today's state, key actions.</li>
<li><strong>Parchment cream (#E8E3D8)</strong> — text color. Like words on an old notebook page.</li>
<li><strong>Soft lavender (#8B7CF8)</strong> — AI / machine insight only. Never used for human content.</li>
<li><strong>Editorial scan-lines</strong> — horizontal dithering on display text headers, a technique borrowed from the Linear "Change" manifesto page.</li>
<li><strong>Serif display type</strong> — Georgia serif at massive scale for manifesto moments. Body uses system sans.</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>Screen 1 — Manifesto:</strong> Confrontational hero with massive "You haven't written today." serif type, scan-line editorial texture, single bold CTA</li>
<li><strong>Screen 2 — Today's Page:</strong> Large editorial date, empty parchment writing surface, lavender AI prompt card, minimal floating toolbar</li>
<li><strong>Screen 3 — Archive:</strong> Entry rows with date, preview, word count, mood indicator; month stats; running streak card</li>
<li><strong>Screen 4 — Year in Words:</strong> 26-week dot grid, month labels, year stats card, monthly breakdown bars, VERSE insight panel, best entry highlight</li>
<li><strong>Screen 5 — Entry View:</strong> Scan-line header texture, editorial date, pull-quote with amber left-rule, entry metadata footer, AI reflection</li>
</ul>
`;

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VERSE — Editorial Journaling · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} Dark editorial journaling app. 5 screens, brand spec &amp; CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
  a{color:inherit;text-decoration:none}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(12px);z-index:100}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${P.fg}}
  .logo span{color:${P.amber}}
  .nav-right{display:flex;gap:12px;align-items:center}
  .nav-tag{font-size:10px;color:${P.amber};letter-spacing:1.5px;font-weight:700}
  .hero{padding:80px 40px 48px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.amber};margin-bottom:24px;font-weight:700}
  h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(48px,8vw,88px);font-weight:900;letter-spacing:-3px;line-height:0.95;margin-bottom:28px;color:${P.fg}}
  h1 span{color:${P.amber}}
  .sub{font-size:16px;color:${P.fg2};max-width:520px;line-height:1.72;margin-bottom:40px}
  .meta{display:flex;gap:36px;margin-bottom:48px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.muted};letter-spacing:1.5px;margin-bottom:4px;font-weight:600}
  .meta-item strong{color:${P.amber};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;transition:opacity .15s}
  .btn-p{background:${P.fg};color:${P.bg}}
  .btn-p:hover{opacity:0.85}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border2}}
  .btn-s:hover{border-color:${P.amber}66}
  .btn-x{background:#000;color:#fff;border:1px solid #222}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.amber};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${P.border};font-weight:700}
  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-thumb{background:${P.amber}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border};max-width:920px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .swatch{flex:1;min-width:70px}
  .swatch-box{height:64px;border-radius:10px;border:1px solid ${P.border};margin-bottom:10px}
  .swatch-role{font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:4px;font-weight:600}
  .swatch-hex{font-size:11px;font-weight:700;color:${P.amber}}
  .type-row{padding:14px 0;border-bottom:1px solid ${P.border}}
  .type-label{font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:8px;font-weight:600}
  .spacing-row{display:flex;align-items:center;gap:14px;margin-bottom:10px}
  .spacing-px{font-size:9px;color:${P.muted};width:32px;flex-shrink:0}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.7;color:${P.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.amber}22;border:1px solid ${P.amber}44;color:${P.amber};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.amber}33}
  .prompt-section{padding:40px;border-top:1px solid ${P.border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.amber};margin-bottom:12px;font-weight:700}
  .p-text{font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${P.fg2};font-style:italic;max-width:600px;line-height:1.6;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:760px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.amber};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${P.fg2};line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${P.fg};font-weight:600}
  footer{padding:28px 40px;border-top:1px solid ${P.border};font-size:11px;color:${P.muted};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.amber};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  /* Editorial manifesto hero block */
  .manifesto-block{padding:0 40px 40px;max-width:720px}
  .manifesto-block .mf-line{font-family:Georgia,'Times New Roman',serif;font-size:clamp(32px,5vw,56px);font-weight:900;letter-spacing:-2px;line-height:1;color:${P.fg};margin-bottom:4px}
  .manifesto-block .mf-line.amber{color:${P.amber}}
  .mf-rule{width:40px;height:2px;background:${P.amber};margin:20px 0}
  .mf-body{font-size:14px;color:${P.fg2};line-height:1.7;max-width:480px}
  /* Scanline effect on header area */
  .scanlines{background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(232,227,216,0.018) 3px,rgba(232,227,216,0.018) 4px);pointer-events:none;position:absolute;inset:0}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM<span>.</span>DESIGN STUDIO</div>
  <div class="nav-right">
    <span class="nav-tag">DESIGN HEARTBEAT · ${DATE_STR.toUpperCase()}</span>
  </div>
</nav>

<!-- Editorial manifesto hero — directly inspired by Linear "Change" page -->
<div style="position:relative;overflow:hidden;border-bottom:1px solid ${P.border}">
  <div class="scanlines"></div>
  <section class="hero" style="position:relative;z-index:1">
    <div class="tag">EDITORIAL JOURNALING · DARK MOBILE APP · 5 SCREENS</div>
    <h1>VER<span>SE</span></h1>
    <p class="sub">${TAGLINE}<br><br>Every day you don't write, a thought disappears forever.</p>
    <div class="meta">
      <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
      <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
      <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
      <div class="meta-item"><span>INSPIRED BY</span><strong>LINEAR MANIFESTO · GODLY</strong></div>
    </div>
    <div class="actions">
      <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">▶ Open in Viewer</a>
      <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
      <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
      <a class="btn btn-x" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank">𝕏 Share</a>
      <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
    </div>
  </section>
</div>

<!-- Manifesto excerpt — editorial quote from Screen 1 -->
<div class="manifesto-block" style="padding-top:60px">
  <div class="mf-line">You haven't</div>
  <div class="mf-line">written</div>
  <div class="mf-line amber">today.</div>
  <div class="mf-rule"></div>
  <p class="mf-body">That thought you had in the shower at 7am? Already gone. VERSE gives every day an empty page. Write anything. The year you keep not writing ends today.</p>
</div>

<section class="preview" style="padding-top:48px">
  <div class="section-label">SCREENS · 5 MOBILE (375 × 812)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:600">COLOR PALETTE</div>
      <div class="swatches">
        ${[
          { hex: P.bg,       role: 'VOID BLACK'  },
          { hex: P.surface,  role: 'SURFACE'     },
          { hex: P.fg,       role: 'PARCHMENT'   },
          { hex: P.amber,    role: 'AMBER / KEY'  },
          { hex: P.lavender, role: 'LAVENDER / AI'},
          { hex: P.sage,     role: 'SAGE / STREAK'},
        ].map(sw => `
          <div class="swatch">
            <div class="swatch-box" style="background:${sw.hex}"></div>
            <div class="swatch-role">${sw.role}</div>
            <div class="swatch-hex">${sw.hex}</div>
          </div>`).join('')}
      </div>
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:0;font-weight:600">TYPE SCALE</div>
      ${[
        { label:'DISPLAY (SERIF)', size:'56px', weight:'900', sample: 'VERSE',         font: "Georgia,'Times New Roman',serif" },
        { label:'HERO (SERIF)',    size:'34px', weight:'900', sample: 'Thursday',       font: "Georgia,'Times New Roman',serif" },
        { label:'BODY',           size:'15px', weight:'400', sample: 'Write anything. One sentence. One paragraph.' },
        { label:'CAPTION',        size:'9px',  weight:'700', sample: 'FLOW · ARCHIVE · YEAR IN WORDS' },
      ].map(t => `
        <div class="type-row">
          <div class="type-label">${t.label} · ${t.size} / ${t.weight}</div>
          <div style="font-size:${t.size};font-weight:${t.weight};color:${P.fg};font-family:${t.font||'inherit'};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
        </div>`).join('')}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:600">SPACING · 4PX BASE GRID</div>
      ${[4,8,16,24,32,48,64].map(sp => `
        <div class="spacing-row">
          <div class="spacing-px">${sp}px</div>
          <div style="height:8px;border-radius:4px;background:${P.amber};width:${sp*2}px;opacity:0.65"></div>
        </div>`).join('')}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:600">DESIGN PRINCIPLES</div>
      ${[
        ['01', 'Editorial confrontation — the manifesto hero doesn\'t encourage, it confronts. Borrowed from Linear\'s "Change" campaign aesthetic.'],
        ['02', 'Color separates human from machine — amber belongs to the writer; lavender belongs to AI. Never mixed.'],
        ['03', 'Typography is the UI — at display scale, Georgia serif replaces any graphic element. The word is the interface.'],
      ].map(([n, p]) => `
        <div style="display:flex;gap:12px;margin-bottom:18px;align-items:flex-start">
          <div style="color:${P.amber};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${n}</div>
          <div style="font-size:13px;color:${P.fg2};line-height:1.6">${p}</div>
        </div>`).join('')}
    </div>

  </div>

  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"Design a dark-mode editorial journaling app inspired by Linear's 'Last Year You Said Next Year' manifesto aesthetic on godly.website — massive serif confrontational copy, scan-line dithering on headers, near-void black background with warm parchment text, amber accent, and a 'Year in Words' pixel-grid view. App name: VERSE."</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${prd}
</section>

<footer>
  <span>RAM Design Studio · Design Heartbeat · ${DATE_STR}</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;opacity:0.6">ram.zenbin.org/gallery</a>
</footer>

<script type="application/json" id="pen-data">${penEscaped}</script>
<script>
function getPen(){return document.getElementById('pen-data').textContent.trim().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'")}
function downloadPen(){const b=new Blob([getPen()],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='verse-app.pen';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}
function copyPrompt(){navigator.clipboard.writeText("Design a dark-mode editorial journaling app inspired by Linear's 'Last Year You Said Next Year' manifesto aesthetic — massive serif confrontational copy, scan-line dithering, near-void black + warm parchment, amber accent, Year in Words pixel grid. App name: VERSE.").then(()=>toast('Prompt Copied ✓'))}
function copyTokens(){navigator.clipboard.writeText(document.getElementById('tokens-pre').textContent).then(()=>toast('Tokens Copied ✓'))}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
</script>
</body>
</html>`;

// ── Build viewer HTML ─────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n── VERSE Heartbeat Publisher ──────────────────');
  console.log(`Hero HTML:   ${(heroHTML.length / 1024).toFixed(1)} KB`);
  console.log(`Viewer HTML: ${(viewerHtml.length / 1024).toFixed(1)} KB`);

  // Hero page
  console.log('\n[1/3] Publishing hero page...');
  let heroSlug = SLUG;
  let r = await post(heroSlug, `VERSE — Editorial Journaling — Design Heartbeat`, heroHTML, 'ram');
  if (r.status === 409) {
    heroSlug = SLUG + '-2';
    r = await post(heroSlug, `VERSE — Editorial Journaling — Design Heartbeat`, heroHTML, 'ram');
  }
  if (r.status === 409) {
    heroSlug = SLUG + '-3';
    r = await post(heroSlug, `VERSE — Editorial Journaling — Design Heartbeat`, heroHTML, 'ram');
  }
  console.log(`  HTTP ${r.status} → https://ram.zenbin.org/${heroSlug}`);
  const heroUrl = `https://ram.zenbin.org/${heroSlug}`;

  // Viewer
  console.log('\n[2/3] Publishing viewer...');
  let viewSlug = SLUG + '-viewer';
  let rv = await post(viewSlug, `VERSE — Viewer`, viewerHtml, 'ram');
  if (rv.status === 409) {
    viewSlug = SLUG + '-viewer-2';
    rv = await post(viewSlug, `VERSE — Viewer`, viewerHtml, 'ram');
  }
  console.log(`  HTTP ${rv.status} → https://ram.zenbin.org/${viewSlug}`);

  // Gallery
  console.log('\n[3/3] Pushing to gallery queue...');
  try {
    const qr = await pushGalleryEntry({
      id: 'heartbeat-' + Date.now(),
      status: 'done',
      submitted_at: new Date().toISOString(),
      prompt: "Design a dark-mode editorial journaling app inspired by Linear's manifesto aesthetic. App name: VERSE.",
      credit: 'RAM Design Studio (Heartbeat)',
      design_url: heroUrl,
      viewer_url: `https://ram.zenbin.org/${viewSlug}`,
      app_name: 'VERSE',
      tagline: TAGLINE,
      archetype: 'dark-mobile-journaling',
      screens: 5,
    });
    console.log(`  HTTP ${qr.status}`);
  } catch (e) {
    console.log('  Gallery push error:', e.message);
  }

  console.log('\n══ Done ══════════════════════════════════════');
  console.log(`Hero:    ${heroUrl}`);
  console.log(`Viewer:  https://ram.zenbin.org/${viewSlug}`);
  console.log(`Gallery: https://ram.zenbin.org/gallery`);
})();
