'use strict';
// publish-dwell-heartbeat.js — Full Design Discovery pipeline for DWELL
// LIGHT THEME — Inspired by:
//   Land-book.com (March 2026): warm parchment bg, teal accent #017C6E, creamy minimal landing pages
//   Linear + darkmodedesign.com: AI-at-core positioning adapted for light mode
//   Lapa.ninja: JetBrains Air premium airy tool aesthetic

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG     = 'dwell';
const APP_NAME = 'DWELL';

const P = {
  bg:        '#F4F1EC',
  surface:   '#FFFFFF',
  surface2:  '#F9F7F4',
  border:    'rgba(26,23,20,0.10)',
  borderMid: 'rgba(26,23,20,0.15)',
  text:      '#1A1714',
  textMid:   '#6B5E52',
  textMuted: '#A8968A',
  accent:    '#0E7A6C',
  accentBg:  'rgba(14,122,108,0.10)',
  accent2:   '#C4713A',
  accent2Bg: 'rgba(196,113,58,0.12)',
  purple:    '#6E5FC4',
  purpleBg:  'rgba(110,95,196,0.10)',
  nav:       '#FFFFFF',
};

const meta = {
  appName:   'DWELL',
  tagline:   'Your deep work, made visible.',
  archetype: 'productivity-wellness',
  theme:     'light',
  palette:   P,
};

const ORIGINAL_PROMPT = `Design DWELL — a personal deep work / focus analytics app in a warm light theme. Directly inspired by:

1. Land-book.com (March 2026) — Curated landing pages with a warm parchment background (#F7F6F5), teal accent (#017C6E), and creamy minimal card surfaces. The palette felt grounded, premium, and human — ideal for a personal productivity tool that competes on warmth rather than chrome.

2. Linear (darkmodedesign.com, March 2026) — "The product development system for teams AND agents." Linear's AI-at-core positioning and ultra-clean information hierarchy inspired adapting the same density and clarity to a light context. The insight that great dark UI discipline transfers cleanly to light surfaces.

3. Lapa.ninja trending (March 2026) — JetBrains Air + Interfere in the top spots: premium tool design with generous whitespace, purposeful typography scale, and data-forward layouts. The "airy" aesthetic informed the generous padding and breathing room between components.

Challenge: Design a personal focus analytics app that feels like a premium wellness tool — warm enough to feel personal, precise enough to be trusted. 5 screens:
- Today: focus ring hero, active session card, upcoming schedule
- Sessions: chronological deep work blocks with quality scores and category bars
- Patterns: weekly bar chart + peak hour heatmap + streak tracker
- Insights: AI-generated weekly patterns, metric cards, actionable recommendations
- Focus: full-screen ambient session timer with quality ring

Warm parchment (#F4F1EC) canvas with forest teal (#0E7A6C) as accent, copper amber (#C4713A) for secondary, soft lavender (#6E5FC4) for AI insights. No pure white or pure black. Every surface feels like paper.`;

const sub = {
  id:           `heartbeat-dwell-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

// ── HTTP helper ────────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
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

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const srcW = 390, srcH = 844;
  const scaleX = tw / srcW;
  const scaleY = th / srcH;

  function renderEl(el) {
    if (!el || !el.type) return '';
    const sx = (el.x || 0) * scaleX;
    const sy = (el.y || 0) * scaleY;

    if (el.type === 'RECTANGLE') {
      const sw = Math.max(0, (el.width  || 0) * scaleX);
      const sh = Math.max(0, (el.height || 0) * scaleY);
      const cr = el.cornerRadius ? ` rx="${(el.cornerRadius * Math.min(scaleX, scaleY)).toFixed(1)}"` : '';
      const stroke = el.strokeColor ? ` stroke="${el.strokeColor}" stroke-width="${((el.strokeWidth||1)*Math.min(scaleX,scaleY)).toFixed(1)}"` : '';
      return `<rect x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" fill="${el.fill || 'transparent'}"${cr}${stroke}/>`;
    }
    if (el.type === 'TEXT') {
      const fs = Math.max(1, (el.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
      const fw = el.fontWeight || 400;
      const fill = el.fill || P.text;
      return `<text x="${sx.toFixed(1)}" y="${(sy + fs).toFixed(1)}" font-size="${fs.toFixed(1)}" font-weight="${fw}" fill="${fill}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${String(el.text || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0, 40)}</text>`;
    }
    if (el.type === 'LINE') {
      return `<line x1="${((el.x1||0)*scaleX).toFixed(1)}" y1="${((el.y1||0)*scaleY).toFixed(1)}" x2="${((el.x2||0)*scaleX).toFixed(1)}" y2="${((el.y2||0)*scaleY).toFixed(1)}" stroke="${el.strokeColor||P.border}" stroke-width="${((el.strokeWidth||1)*Math.min(scaleX,scaleY)).toFixed(1)}"/>`;
    }
    if (el.type === 'ELLIPSE') {
      const ry2 = el.ry || el.rx || 10;
      const cx2 = (el.cx || 0) * scaleX;
      const cy2 = (el.cy || 0) * scaleY;
      const rx2 = (el.rx || 10) * Math.min(scaleX, scaleY);
      const ryS = ry2 * Math.min(scaleX, scaleY);
      const stroke = el.strokeColor ? ` stroke="${el.strokeColor}" stroke-width="${((el.strokeWidth||1)*Math.min(scaleX,scaleY)).toFixed(1)}"` : '';
      const da = el.strokeDasharray ? ` stroke-dasharray="${el.strokeDasharray}"` : '';
      const tf = el.transform ? ` transform="${el.transform}"` : '';
      return `<ellipse cx="${cx2.toFixed(1)}" cy="${cy2.toFixed(1)}" rx="${rx2.toFixed(1)}" ry="${ryS.toFixed(1)}" fill="${el.fill || 'transparent'}"${stroke}${da}${tf}/>`;
    }
    return '';
  }

  const svgEls = (screen.elements || []).map(renderEl).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:12px;overflow:hidden;border:1px solid ${P.borderMid};box-shadow:0 4px 20px rgba(0,0,0,0.08)">
  ${svgEls}
</svg>`;
}

// ── Hero HTML ──────────────────────────────────────────────────────────────────
function buildHeroHTML(penData) {
  const THUMB_H = 220;
  const thumbsHTML = penData.screens.map((sc, i) => {
    const tw = Math.round(THUMB_H * (390 / 844));
    const svg = screenThumbSVG(sc, tw, THUMB_H);
    return `<div style="text-align:center;flex-shrink:0">
      <div style="margin-bottom:8px">${svg}</div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textMuted};font-weight:600">${sc.label?.toUpperCase() || `SCREEN ${i+1}`}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'PARCHMENT' },
    { hex: P.surface, role: 'SURFACE'   },
    { hex: P.text,    role: 'INK'       },
    { hex: P.accent,  role: 'TEAL'      },
    { hex: P.accent2, role: 'COPPER'    },
    { hex: P.purple,  role: 'LAVENDER'  },
    { hex: P.textMid, role: 'CLAY'      },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:64px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${P.borderMid};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;color:${P.textMuted};margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',   size: '64px', weight: '700', family: 'system-ui', sample: 'DWELL' },
    { label: 'HEADING',   size: '20px', weight: '700', family: 'system-ui', sample: 'Deep Work Today' },
    { label: 'SUBHEAD',   size: '14px', weight: '600', family: 'system-ui', sample: 'API Architecture · 1h 42m · Quality 92' },
    { label: 'BODY',      size: '12px', weight: '400', family: 'system-ui', sample: 'Morning sessions before 11am produce 34% better output.' },
    { label: 'LABEL',     size: '9px',  weight: '700', family: 'system-ui', sample: 'DEEP WORK RATIO  ·  FOCUS GOAL  ·  PEAK HOURS' },
  ].map(t => `
    <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:8px;letter-spacing:2px;color:${P.textMuted};margin-bottom:6px">${t.label} · ${t.size}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};font-family:${t.family};line-height:1.3;color:${P.text};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* DWELL — Personal Deep Work Analytics */
  /* Inspired by Land-book warm palette + Linear AI hierarchy — March 2026 */

  /* Light/warm palette — parchment to teal */
  --color-bg:         ${P.bg};         /* warm parchment */
  --color-surface:    ${P.surface};    /* pure card white */
  --color-surface-2:  ${P.surface2};   /* elevated surface */
  --color-border:     ${P.border};
  --color-text:       ${P.text};       /* warm dark ink */
  --color-text-mid:   ${P.textMid};    /* clay mid-tone */
  --color-text-muted: ${P.textMuted};  /* dusty placeholder */
  --color-accent:     ${P.accent};     /* forest teal */
  --color-accent-bg:  ${P.accentBg};   /* teal wash */
  --color-accent-2:   ${P.accent2};    /* warm copper */
  --color-purple:     ${P.purple};     /* AI lavender */

  /* Typography — system UI, warm scale */
  --font-display: 700 clamp(32px,10vw,64px)/1 system-ui, sans-serif;
  --font-ui:      system-ui, -apple-system, 'Helvetica Neue', sans-serif;

  /* Spacing — 8px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;

  /* Radius — organic corners */
  --radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 16px;  --radius-xl: 20px;

  /* Shadows — warm, soft */
  --shadow-card:  0 2px 12px rgba(26,23,20,0.08);
  --shadow-float: 0 8px 32px rgba(26,23,20,0.12);
}`;

  const shareText = encodeURIComponent(`DWELL — a warm-light focus analytics app designed by RAM. Parchment + teal + copper. Inspired by Land-book & Linear. 5 screens.`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DWELL — Deep Work Analytics · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<meta property="og:title" content="DWELL — Your deep work, made visible.">
<meta property="og:description" content="Warm-light focus analytics app. 5 screens. Parchment + teal + copper palette.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.text};font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;background:${P.surface};backdrop-filter:blur(12px)}
  .logo{font-size:11px;font-weight:700;letter-spacing:4px;color:${P.textMid}}
  .nav-id{font-size:9px;color:${P.textMuted};letter-spacing:1px}
  .hero{padding:80px 40px 48px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:16px;font-weight:700}
  h1{font-size:clamp(72px,16vw,120px);font-weight:700;letter-spacing:-4px;line-height:1;margin-bottom:16px;color:${P.text}}
  .sub{font-size:17px;color:${P.textMid};max-width:540px;line-height:1.65;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.textMuted};letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${P.accent};font-size:13px;font-weight:700}
  .actions{display:flex;gap:10px;margin-bottom:72px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${P.accent};color:#FFF;box-shadow:0 4px 16px ${P.accent}40}
  .btn-p:hover{opacity:.88}
  .btn-mock{background:${P.accent2};color:#FFF;box-shadow:0 4px 16px ${P.accent2}40}
  .btn-mock:hover{opacity:.88}
  .btn-s{background:${P.surface};color:${P.text};border:1px solid ${P.borderMid}}
  .btn-s:hover{border-color:${P.accent}66}
  .btn-c{background:transparent;color:${P.accent};border:1px solid ${P.accent}44}
  .btn-x{background:${P.text};color:${P.bg}}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${P.border};font-weight:700}
  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px;margin-top:20px;position:relative;box-shadow:0 2px 12px rgba(26,23,20,0.06)}
  .tokens-pre{font-size:10px;line-height:1.8;color:${P.textMid};white-space:pre;overflow-x:auto;font-family:'JetBrains Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:14px;right:14px;background:${P.accentBg};border:1px solid ${P.accent}44;color:${P.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.accent}20}
  .prompt-section{padding:40px;border-top:1px solid ${P.border};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:10px;font-weight:700}
  .p-text{font-size:14px;color:${P.textMid};max-width:640px;line-height:1.8;margin-bottom:16px}
  footer{padding:24px 40px;border-top:1px solid ${P.border};font-size:10px;color:${P.textMuted};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;background:${P.surface}}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:#FFF;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .focus-dot{width:8px;height:8px;border-radius:50%;background:${P.accent};display:inline-block;margin-right:6px;animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.2)}}
  .spacer-line{height:1px;background:${P.border};margin:40px 0}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · LIGHT THEME · MARCH 2026</div>
  <h1>DWELL</h1>
  <p class="sub"><span class="focus-dot"></span>${meta.tagline} Inspired by Land-book's warm parchment palette, Linear's AI-at-core hierarchy, and the airy premium tool aesthetic trending on Lapa.ninja.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>LAND-BOOK + LINEAR + LAPA.NINJA</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#F4F1EC + #0E7A6C + #C4713A</strong></div>
    <div class="meta-item"><span>THEME</span><strong>LIGHT / WARM PARCHMENT</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/dwell-viewer" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/dwell-mock" target="_blank">☀ Try Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-c" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/dwell" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN THUMBNAILS — 5 MOBILE SCREENS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textMuted};margin-bottom:16px">COLOR PALETTE — WARM PAPER SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;color:${P.textMuted};margin-bottom:16px">SPACING SCALE — 8PX BASE GRID</div>
        ${[4,8,12,16,24,32,48].map(sp => `<div style="display:flex;align-items:center;gap:16px;margin-bottom:8px"><div style="font-size:10px;color:${P.textMuted};width:32px;flex-shrink:0">${sp}px</div><div style="height:6px;border-radius:3px;background:${P.accent};width:${sp*2}px;opacity:0.6"></div></div>`).join('')}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textMuted};margin-bottom:16px">TYPE SCALE — SYSTEM UI, WARM HIERARCHY</div>
      ${typeScaleHTML}
    </div>
  </div>
  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;color:${P.textMuted};margin-bottom:4px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT.replace(/\n/g,'<br>')}</p>
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · MARCH 2026</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  function copyPrompt(){navigator.clipboard.writeText(PROMPT).then(()=>showToast('Prompt copied ✓'))}
  function copyTokens(){const t=document.getElementById('cssTokens')?.innerText||'';navigator.clipboard.writeText(t).then(()=>showToast('Tokens copied ✓'))}
  function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}
</script>
</body>
</html>`;
}

// ── Viewer HTML ────────────────────────────────────────────────────────────────
async function buildViewerHTML(penData) {
  // Try to fetch viewer shell from zenbin
  let html = '';
  try {
    const r = await httpsReq({ hostname: 'ram.zenbin.org', path: '/viewer', method: 'GET', headers: { 'User-Agent': 'ram-design/1.0' } });
    if (r.status === 200) html = r.body;
  } catch (e) {}

  if (!html) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DWELL Viewer</title></head><body style="background:${P.bg};display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui"><p style="color:${P.textMid}">Viewer loading…</p><script>/* viewer */\u003c/script></body></html>`;
  }

  const penStr    = JSON.stringify(penData);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── Gallery queue ──────────────────────────────────────────────────────────────
async function updateGalleryQueue() {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });

  const fileData   = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const rawContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(rawContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    ...sub,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    prompt:     ORIGINAL_PROMPT,
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });

  return httpsReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ DWELL Design Discovery Pipeline ══\n');

  // 1. Load pen (already generated by dwell-app.js)
  console.log('Loading pen...');
  const penData = JSON.parse(fs.readFileSync(path.join(__dirname, 'dwell.pen'), 'utf8'));
  console.log(`  ✓ dwell.pen loaded (${penData.screens.length} screens, ${penData.screens.reduce((a,s)=>a+s.elements.length,0)} elements)`);

  // 2. Build hero
  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penData);
  console.log(`  ✓ Hero HTML (${(heroHTML.length / 1024).toFixed(1)}kb)`);

  // 3. Build viewer
  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penData);
  console.log(`  ✓ Viewer HTML (${(viewerHTML.length / 1024).toFixed(1)}kb)`);

  // 4. Publish hero
  console.log('\nPublishing hero → ram.zenbin.org/dwell ...');
  const heroResult = await publishToZenbin('dwell', 'DWELL — Deep Work Analytics · RAM Design Studio', heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) console.log('  ✓ Live at https://ram.zenbin.org/dwell');
  else console.log(`  Response: ${heroResult.body.slice(0, 200)}`);

  // 5. Publish viewer
  console.log('\nPublishing viewer → ram.zenbin.org/dwell-viewer ...');
  const viewerResult = await publishToZenbin('dwell-viewer', 'DWELL Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) console.log('  ✓ Live at https://ram.zenbin.org/dwell-viewer');
  else console.log(`  Response: ${viewerResult.body.slice(0, 200)}`);

  // 6. Gallery queue
  console.log('\nUpdating gallery queue...');
  const queueResult = await updateGalleryQueue();
  console.log(`  Status: ${queueResult.status}`);
  if (queueResult.status === 200 || queueResult.status === 201) {
    console.log('  ✓ Gallery queue updated');
  } else {
    console.log(`  Response: ${queueResult.body.slice(0, 200)}`);
  }

  console.log('\n══ Pipeline complete ══');
  console.log('  Hero:   https://ram.zenbin.org/dwell');
  console.log('  Viewer: https://ram.zenbin.org/dwell-viewer');
  console.log('  → Run dwell-mock.mjs next for interactive Svelte mock');
})().catch(console.error);
