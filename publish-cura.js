'use strict';
// publish-cura.js — hero + viewer + gallery queue for CURA

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'cura';
const APP_NAME  = 'CURA';
const TAGLINE   = 'Your longevity OS, distilled';
const DATE_STR  = 'March 25, 2026';
const SUBDOMAIN = 'ram';
const ARCHETYPE = 'health-longevity';
const PROMPT    = 'Design a dark personal longevity OS for health-obsessed founders and creators. Inspired by Superpower\'s "A new era of personal health" (godly.website), SIRNIK\'s Swiss editorial confidence (land-book.com), and Echelon\'s dark left-rule accent pattern (land-book.com). 5 screens: Today overview, Body metrics, Mind/sleep, Nutrition, Goals. Warm dark editorial — near-black with warm undertone, amber accent, zero health-app clichés.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'cura.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.screens || [];

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:         '#0F0E0C',
  surface:    '#1C1A17',
  surfaceAlt: '#252219',
  text:       '#F5F0E8',
  textSub:    '#A89E8C',
  textFaint:  '#5C5448',
  accent:     '#E8821A',
  accentSoft: '#2A1E0F',
  green:      '#4ADE80',
  red:        '#EF4444',
  blue:       '#60A5FA',
  purple:     '#A78BFA',
  border:     '#2A2620',
};

const SCREEN_NAMES = ['Today', 'Body', 'Mind', 'Nourish', 'Goals'];

// ── SVG renderer ──────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#')) return c;
  if (c.startsWith('rgba') || c.startsWith('rgb')) return c;
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
    const fill  = sc(node.fill || P.text);
    const size  = Math.max(node.fontSize || 12, 5);
    const halign = node.textAlignHorizontal || node.textAlign || 'left';
    const anchor = halign === 'center' ? 'middle' : halign === 'right' ? 'end' : 'start';
    const ax    = anchor === 'middle' ? x + w/2 : anchor === 'end' ? x + w : x;
    const lines = String(node.content || '').split('\n');
    const lh    = size * 1.3;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i*lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${anchor}" font-weight="${node.fontWeight || 400}" font-family="Inter,-apple-system,sans-serif">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}</text>`
    ).join('');
  }

  if (node.type === 'ellipse') {
    const fill   = sc(node.fill || 'transparent');
    const isTrans = !node.fill || node.fill === 'transparent';
    const stroke  = node.strokeColor
      ? ` stroke="${sc(node.strokeColor)}" stroke-width="${node.strokeWidth||1}"`
      : '';
    return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${isTrans?'none':fill}" opacity="${op}"${stroke}/>`;
  }

  // rectangle / frame
  const fill  = sc(node.fill || P.bg);
  const r     = node.cornerRadius || 0;
  const stroke = node.strokeColor
    ? ` stroke="${sc(node.strokeColor)}" stroke-width="${node.strokeWidth||1}"`
    : '';
  const kids  = (node.children || []).map(c => rn(c, x, y, depth+1, maxD)).join('');

  const clipId = (node.type === 'frame') ? `mc-${Math.random().toString(36).slice(2,7)}` : null;
  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, thumbW, thumbH, maxD=5) {
  const sw = screen.width  || 390;
  const sh = screen.height || 844;
  const sx = screen.x || 0;
  const bg = sc(screen.fill || P.bg);
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${bg}"/>${content}</svg>`;
}

// ── CSS tokens ────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* CURA — Longevity OS Design Tokens */

  /* Backgrounds — warm dark editorial */
  --bg:          ${P.bg};
  --surface:     ${P.surface};
  --surface-alt: ${P.surfaceAlt};
  --border:      ${P.border};

  /* Text */
  --text:        ${P.text};
  --text-sub:    ${P.textSub};
  --text-faint:  ${P.textFaint};

  /* Accent — amber/terracotta */
  --accent:      ${P.accent};
  --accent-soft: ${P.accentSoft};

  /* Semantic signals */
  --green:       ${P.green};   /* recovery / good */
  --red:         ${P.red};     /* alert / risk */
  --blue:        ${P.blue};    /* cognitive / sleep */
  --purple:      ${P.purple};  /* mind / REM */

  /* Typography */
  --font-ui:     'Inter', -apple-system, sans-serif;
  --font-display: 700 clamp(42px,9vw,90px)/0.92 var(--font-ui);
  --font-heading: 600 13px/1.4 var(--font-ui);
  --font-body:    400 12px/1.6 var(--font-ui);
  --font-label:   700 8px/1 var(--font-ui);

  /* Spacing (4px base grid) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 14px; --s-4: 20px;
  --s-5: 28px; --s-6: 40px; --s-7: 56px; --s-8: 80px;

  /* Radius */
  --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-full: 9999px;
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 160, THUMB_H = 290;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 5)}
    <div style="font-size:8px;color:${P.textFaint};margin-top:10px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i]||'SCREEN '+(i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchHTML = [
  { hex: P.bg,       role: 'BG — Warm Dark' },
  { hex: P.surface,  role: 'SURFACE' },
  { hex: P.text,     role: 'FOREGROUND' },
  { hex: P.accent,   role: 'ACCENT — Amber' },
  { hex: P.green,    role: 'RECOVERY — Green' },
  { hex: P.blue,     role: 'COGNITIVE — Blue' },
  { hex: P.purple,   role: 'MIND — Purple' },
  { hex: P.red,      role: 'ALERT — Red' },
].map(s => `
  <div style="flex:1;min-width:80px;max-width:120px">
    <div style="height:52px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.textFaint};margin-bottom:3px">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.accent};font-family:'Courier New',monospace">${s.hex}</div>
  </div>`).join('');

// ── Type scale ────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'DISPLAY',  size: '52px', weight: '700', sample: 'CURA' },
  { label: 'HEADING',  size: '22px', weight: '700', sample: 'Your vitals.' },
  { label: 'SUBHEAD',  size: '13px', weight: '600', sample: 'Recovery Score · 92% · Green Zone' },
  { label: 'BODY',     size: '11px', weight: '400', sample: 'Your HRV is 12% above baseline — ideal for high-intensity.' },
  { label: 'LABEL',    size: '8px',  weight: '700', sample: 'TODAY\'S METRICS · LONGEVITY PROTOCOL', mono: true },
].map(t => `
  <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.textFaint};margin-bottom:8px;font-family:'Courier New',monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.text};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;${t.mono?'font-family:Courier New,monospace':'font-family:Inter,-apple-system,sans-serif'}">${t.sample}</div>
  </div>`).join('');

// ── Principles ────────────────────────────────────────────────────────────────
const principlesHTML = [
  { title: 'Warm dark, not cold dark', desc: 'BG is #0F0E0C — near-black with a warm undertone. Not clinical tech-black. Feels like a well-lit room, not a void.' },
  { title: 'Echelon left-rule pattern', desc: '2px left accent-rule per metric row. Borrowed from Echelon® portfolio grid on land-book. Creates vertical rhythm without table grids.' },
  { title: 'Editorial weight contrast', desc: 'Heavy numerics (700) beside ultra-light labels (400). Type contrast alone builds hierarchy — zero background decorations needed.' },
].map((p, i) => `
  <div style="padding:16px;background:${P.surface};border-radius:10px;border:1px solid ${P.border}">
    <div style="font-size:10px;color:${P.accent};font-weight:700;margin-bottom:6px;font-family:'Courier New',monospace">${String(i+1).padStart(2,'0')}</div>
    <div style="font-size:11px;color:${P.text};font-weight:700;margin-bottom:6px">${p.title}</div>
    <div style="font-size:11px;color:${P.textSub};line-height:1.6">${p.desc}</div>
  </div>`).join('');

// ── PRD ───────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>CURA is a dark-mode personal longevity OS for health-obsessed founders and creators who treat their biology with the same rigour they apply to their products. Inspired by Superpower's editorial approach to personal health ("A new era of personal health" — godly.website, Mar 25), SIRNIK's Swiss editorial design confidence (land-book.com), and Echelon's dark project-grid left-rule pattern. Zero health-app clichés: no pill icons, no activity-ring animations, no lime-green gradients.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Founders & creators</strong> who quantify their biology with the same rigour as their metrics dashboards</li>
<li><strong>Longevity-oriented professionals</strong> — biohackers, endurance athletes, high-performance coaches</li>
<li><strong>The "serious health" demographic</strong> that finds Apple Health too casual and medical apps too clinical</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Today:</strong> Health score ring, AI insight strip (CURA Insight), and 5 key metric rows with Echelon left-rule pattern</li>
<li><strong>Body:</strong> HR + HRV side-by-side cards, recovery banner, 5 activity metrics</li>
<li><strong>Mind:</strong> Focus score + mood card, sleep architecture by stage (bars), mental wellness metrics including streak</li>
<li><strong>Nourish:</strong> Calorie summary ring, 4-macro progress bars, recent meals with protein callouts</li>
<li><strong>Goals:</strong> Week progress banner, 4 longevity goals with left-rule pattern, progress bars + status badges</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Warm Dark (#0F0E0C):</strong> Near-black with warm brown undertone — feels editorial, not sterile. Inspired by Superpower's photography-over-dark aesthetic</li>
<li><strong>Amber Accent (#E8821A):</strong> Terracotta-amber — warm, organic, confident. Not the cold blues of fitness apps</li>
<li><strong>Echelon Left-Rule:</strong> 2px colored left-edge rectangle per metric row — creates structured rhythm borrowed from dark creative portfolio design</li>
<li><strong>Swiss Weight Contrast:</strong> Bold numerics beside quiet labels. The SIRNIK approach: "design as balance between structure and emotion"</li>
<li><strong>Section Labels:</strong> All-caps, 8px, heavy letter-spacing — editorial magazine-style section breaks</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>S1 — Today:</strong> Morning greeting, health score donut, AI insight strip, 5 metric rows</li>
<li><strong>S2 — Body:</strong> HR + HRV cards with pulse bars, recovery banner, 5 activity metrics</li>
<li><strong>S3 — Mind:</strong> Focus score + mood card, sleep stage bars (4 stages), 4 mental wellness rows</li>
<li><strong>S4 — Nourish:</strong> Calorie ring, 4 macro progress bars, 3 recent meal cards</li>
<li><strong>S5 — Goals:</strong> Week summary banner, 4 longevity goals with left-rule + progress bars</li>
</ul>
`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(hostname, urlPath, headers, body) {
  return new Promise((res, rej) => {
    const buf = Buffer.from(body);
    const r = https.request({ hostname, path: urlPath, method: 'POST',
      headers: { ...headers, 'Content-Length': buf.length } }, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    });
    r.on('error', rej);
    r.write(buf);
    r.end();
  });
}

function httpGet(hostname, urlPath, headers = {}) {
  return new Promise((res, rej) => {
    https.get({ hostname, path: urlPath, headers }, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    }).on('error', rej);
  });
}

function zenBinPut(slug, title, html, subdomain) {
  const body = JSON.stringify({ title, html });
  return post('zenbin.org', `/v1/pages/${slug}`, {
    'Content-Type': 'application/json',
    ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
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
<title>CURA — Your Longevity OS · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — 5-screen dark mobile design system with brand spec &amp; CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.text};font-family:'Inter','SF Pro Display',-apple-system,sans-serif;min-height:100vh;line-height:1.5}
  a{color:inherit;text-decoration:none}

  nav{padding:16px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(20px);z-index:100}
  .logo{font-size:11px;font-weight:900;letter-spacing:5px;color:${P.text}}
  .logo span{color:${P.accent}}
  .nav-tag{font-size:9px;color:${P.textFaint};letter-spacing:1.5px;font-weight:700;border:1px solid ${P.border};padding:4px 12px;border-radius:4px}

  .hero{padding:80px 40px 56px;max-width:1100px;margin:0 auto}
  .eyebrow{font-size:9px;letter-spacing:3.5px;color:${P.accent};margin-bottom:24px;font-weight:700;font-family:'Courier New',monospace}
  h1{font-size:clamp(60px,12vw,120px);font-weight:900;letter-spacing:-4px;line-height:0.88;margin-bottom:28px}
  h1 em{color:${P.accent};font-style:normal}
  .tagline{font-size:18px;color:${P.textSub};max-width:520px;line-height:1.7;margin-bottom:44px}

  .meta-strip{display:flex;gap:48px;margin-bottom:52px;flex-wrap:wrap;padding-bottom:40px;border-bottom:1px solid ${P.border}}
  .meta-item .label{font-size:8px;color:${P.textFaint};letter-spacing:2px;margin-bottom:6px;font-weight:700;font-family:'Courier New',monospace}
  .meta-item .val{color:${P.text};font-size:13px;font-weight:700}
  .meta-item .val em{color:${P.accent};font-style:normal}

  .actions{display:flex;gap:10px;margin-bottom:80px;flex-wrap:wrap}
  .btn{padding:11px 24px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;border:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:1px;transition:opacity .15s;text-transform:uppercase}
  .btn:hover{opacity:.85}
  .btn-p{background:${P.accent};color:#fff}
  .btn-s{background:transparent;color:${P.text};border:1px solid ${P.border}}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .btn-g{background:${P.surface};color:${P.textSub};border:1px solid ${P.border}}

  section{padding:56px 40px;max-width:1100px;margin:0 auto}
  section+section{border-top:1px solid ${P.border}}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.textFaint};font-weight:700;margin-bottom:24px;font-family:'Courier New',monospace}

  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:20px;-webkit-overflow-scrolling:touch}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-thumb{background:${P.border}}

  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px}
  @media(max-width:700px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
  .principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px}
  @media(max-width:600px){.principles-grid{grid-template-columns:1fr}}

  .tokens-pre{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:24px;font-family:'Courier New',monospace;font-size:11px;line-height:1.75;color:${P.textSub};overflow-x:auto;white-space:pre;margin-top:16px}
  .copy-btn{margin-top:14px;background:${P.surface};border:1px solid ${P.border};color:${P.text};padding:8px 20px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;letter-spacing:1.5px;font-family:inherit;transition:border-color .15s,color .15s;text-transform:uppercase}
  .copy-btn:hover{border-color:${P.accent};color:${P.accent}}

  .prompt-text{font-size:17px;font-style:italic;color:${P.textSub};max-width:720px;line-height:1.8;border-left:3px solid ${P.accent};padding-left:24px;margin-top:16px}

  .prd h3{font-size:10px;letter-spacing:2px;color:${P.accent};margin-bottom:10px;margin-top:32px;font-weight:800;font-family:'Courier New',monospace}
  .prd h3:first-child{margin-top:0}
  .prd p,.prd li{font-size:13px;color:${P.textSub};line-height:1.7;margin-bottom:6px}
  .prd ul{padding-left:20px}
  .prd strong{color:${P.text}}

  footer{padding:28px 40px;border-top:1px solid ${P.border};display:flex;justify-content:space-between;font-size:10px;color:${P.textFaint};letter-spacing:1px;flex-wrap:wrap;gap:10px}

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
  <div class="eyebrow">PRODUCTION DESIGN SYSTEM · HEALTH / LONGEVITY · ${DATE_STR.toUpperCase()}</div>
  <h1>CU<em>RA</em></h1>
  <p class="tagline">${TAGLINE}</p>
  <div class="meta-strip">
    <div class="meta-item"><div class="label">SCREENS</div><div class="val"><em>5 MOBILE</em></div></div>
    <div class="meta-item"><div class="label">INSPIRED BY</div><div class="val">Superpower · SIRNIK · Echelon®</div></div>
    <div class="meta-item"><div class="label">BRAND SPEC</div><div class="val"><em>✓ INCLUDED</em></div></div>
    <div class="meta-item"><div class="label">CSS TOKENS</div><div class="val"><em>✓ COPY-READY</em></div></div>
    <div class="meta-item"><div class="label">THEME</div><div class="val">Dark · Warm Editorial · Amber</div></div>
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
      <div style="font-size:9px;letter-spacing:2px;color:${P.textFaint};margin-bottom:14px;font-family:'Courier New',monospace">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textFaint};margin-bottom:0;font-family:'Courier New',monospace">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textFaint};margin-bottom:14px;font-family:'Courier New',monospace">SPACING · 4PX BASE GRID</div>
      ${[4,8,14,20,28,40,56,80].map(sp => `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
          <div style="font-size:9px;color:${P.textFaint};width:30px;flex-shrink:0;font-family:'Courier New',monospace">${sp}</div>
          <div style="height:7px;border-radius:4px;background:${P.accent};width:${sp*1.5}px;opacity:.7"></div>
        </div>`).join('')}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textFaint};margin-bottom:14px;font-family:'Courier New',monospace">DESIGN PRINCIPLES</div>
      <div class="principles-grid">${principlesHTML}</div>
    </div>
  </div>
  <div style="margin-top:40px">
    <div style="font-size:9px;letter-spacing:2px;color:${P.textFaint};font-family:'Courier New',monospace;margin-bottom:0">CSS DESIGN TOKENS</div>
    <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
  </div>
</section>

<section>
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

function toast(m){const t=document.getElementById('toast');t.textContent=m+'  ✓';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}

function openViewer(){
  try{
    const j=atob(D);JSON.parse(j);
    localStorage.setItem('pv_pending',JSON.stringify({json:j,name:'cura.pen'}));
    window.open('https://zenbin.org/p/pen-viewer-3','_blank');
  }catch(e){window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank')}
}
function downloadPen(){
  try{
    const b=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='cura.pen';a.click();URL.revokeObjectURL(a.href);
    toast('Downloaded cura.pen');
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
  const t=encodeURIComponent('CURA — Longevity OS. Warm dark editorial + amber. 5 screens by RAM Design Studio');
  const u=encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text='+t+'&url='+u,'_blank');
}
<\/script>
</body>
</html>`;
}

// ── Viewer HTML ───────────────────────────────────────────────────────────────
async function buildViewerHTML() {
  const resp = await httpGet('zenbin.org', '/p/pen-viewer-3');
  if (resp.status !== 200) throw new Error('Could not fetch pen-viewer-3: ' + resp.status);
  let html = resp.body;
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue push ─────────────────────────────────────────────────────────
async function pushToGallery(heroUrl) {
  const rawResp = await httpGet(
    'raw.githubusercontent.com',
    `/${GITHUB_REPO}/main/queue.json`,
    { 'User-Agent': 'RAM-Design-Studio' }
  );
  let queue = { version: 1, submissions: [], updated_at: '' };
  if (rawResp.status === 200) {
    try { queue = JSON.parse(rawResp.body); } catch {}
  }
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const shaResp = await new Promise((res, rej) => {
    https.get({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      headers: { 'User-Agent': 'RAM-Design-Studio', 'Authorization': 'token ' + GITHUB_TOKEN },
    }, resp => {
      let d = ''; resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    }).on('error', rej);
  });
  let sha = null;
  if (shaResp.status === 200) { try { sha = JSON.parse(shaResp.body).sha; } catch {} }

  const entry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    slug:         SLUG,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   heroUrl,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    viewer_url:   `https://ram.zenbin.org/${SLUG}-viewer`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      SCREEN_NAMES.length,
    source:       'heartbeat',
    palette: { bg: P.bg, fg: P.text, accent: P.accent, accent2: P.green },
  };

  queue.submissions.unshift(entry);
  queue.updated_at = new Date().toISOString();

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `heartbeat: add ${SLUG} design`,
    content,
    ...(sha ? { sha } : {}),
  });

  return post('api.github.com', `/repos/${GITHUB_REPO}/contents/queue.json`, {
    'Content-Type': 'application/json',
    'User-Agent': 'RAM-Design-Studio',
    'Authorization': 'token ' + GITHUB_TOKEN,
  }, putBody);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌿 CURA — Publishing to ZenBin\n' + '─'.repeat(50));

  // 1. Hero
  console.log('1/3  Building hero page…');
  const heroHTML = buildHeroHTML();
  const heroResp = await zenBinPut(SLUG, `CURA — Your Longevity OS · RAM`, heroHTML, SUBDOMAIN);
  const heroUrl  = `https://ram.zenbin.org/${SLUG}`;
  console.log(`     → ${heroResp.status === 200 ? '✓' : '✗ HTTP '+heroResp.status}  ${heroUrl}`);

  // 2. Viewer
  console.log('2/3  Building viewer page…');
  try {
    const viewerHTML = await buildViewerHTML();
    const viewerResp = await zenBinPut(SLUG+'-viewer', `CURA Viewer · RAM`, viewerHTML, SUBDOMAIN);
    const viewerUrl  = `https://ram.zenbin.org/${SLUG}-viewer`;
    console.log(`     → ${viewerResp.status === 200 ? '✓' : '✗ HTTP '+viewerResp.status}  ${viewerUrl}`);
  } catch(e) {
    console.log('     ✗ Viewer failed:', e.message);
  }

  // 3. Gallery queue
  console.log('3/3  Pushing to gallery queue…');
  try {
    const qResp = await pushToGallery(heroUrl);
    console.log(`     → ${(qResp.status === 200 || qResp.status === 201) ? '✓' : '✗ HTTP '+qResp.status}`);
  } catch(e) {
    console.log('     ✗ Gallery push failed:', e.message);
  }

  console.log('\n✅  CURA published');
  console.log(`    Hero:   ${heroUrl}`);
  console.log(`    Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`    Gallery: https://ram.zenbin.org/gallery\n`);
}

main().catch(console.error);
