'use strict';
// publish-lucid-heartbeat.js
// Full Design Discovery pipeline for LUCID
// Design Heartbeat — March 21, 2026
// Inspired by:
//   • Glassmorphism style on Saaspo (saaspo.com/style/glassmorphism) — frosted glass panels over deep gradient BGs
//   • AI SaaS vertical on Saaspo (219+ entries) — bento grid feature sections, deep space palettes
//   • Dark Mode Design gallery (darkmodedesign.com) — Linear, Midday.ai aesthetic, electric violet on near-black
//   • Godly.website — Inter typeface, tight -0.02em letter-spacing, frosted overlay cards

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'lucid-heartbeat';
const VIEWER_SLUG = 'lucid-viewer';
const DATE_STR    = 'March 21, 2026';
const APP_NAME    = 'LUCID';
const TAGLINE     = 'AI Research Workspace';
const ARCHETYPE   = 'productivity';

const ORIGINAL_PROMPT = `Design a dark-mode AI research workspace app — directly inspired by the glassmorphism style category on Saaspo (saaspo.com/style/glassmorphism), the dominant AI SaaS bento grid aesthetic (219+ AI SaaS entries on Saaspo), and the deep space dark palette of Linear and Midday.ai featured on Dark Mode Design. LUCID is an AI-powered research companion that aggregates academic sources, synthesizes findings with AI, and organizes knowledge into threaded collections. Palette: deep violet-black cosmos (bg: #06041C) + electric indigo accent (#7C6FF7) + sky-blue cyan (#38D9F5). Frosted glass depth layers for cards. Bento grid dashboard as the hub screen. Inter typeface with tight -0.02em tracking throughout. 5 screens: Research Hub (bento grid), Thread View (AI synthesis), Ask Mode (AI chat), Source Explorer, Library (collections).`;

// ── Palette (matches lucid-app.js exactly) ───────────────────────────────────
const P = {
  bg:        '#06041C',
  surface:   '#0D0928',
  surface2:  '#14103A',
  surface3:  '#1C1750',
  border:    '#252060',
  border2:   '#3530A0',
  muted:     '#5C5490',
  muted2:    '#8070C0',
  fg:        '#EDE8FF',
  fg2:       '#B8ADE8',
  accent:    '#7C6FF7',
  accentDim: '#1A1660',
  accentHi:  '#A89BF9',
  accent2:   '#38D9F5',
  accent2Dim:'#0A3040',
  accent2Hi: '#7EE8F7',
  green:     '#3DFFA0',
  amber:     '#FFD060',
  red:       '#FF6B8A',
  violet:    '#C084FC',
  dim:       '#040310',
};

const mockURL   = 'https://ram.zenbin.org/lucid-mock';
const shareURL  = 'https://ram.zenbin.org/' + SLUG;
const shareText = encodeURIComponent(`${APP_NAME} — ${TAGLINE}. Dark glassmorphism × bento grid × AI. 5 screens + brand spec + CSS tokens. Built by RAM Design Studio`);

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 300) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

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

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';

  if (el.type === 'frame') {
    const bg = fill !== 'transparent' && fill !== 'none'
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`
      : '';
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids && !bg) return '';
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, 8));
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w}" height="${fh}" fill="${el.fill || P.fg}"${oAttr} rx="1" opacity="0.55"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:14px;flex-shrink:0;box-shadow:0 8px 32px ${P.accent}22"><rect width="${sw}" height="${sh}" fill="${screen.fill || P.bg}"/>${kids}</svg>`;
}

// ── Build hero HTML ───────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const screens = pen.children || [];
  const THUMB_H = 220;
  const screenNames = ['Research Hub', 'Thread View', 'Ask Mode', 'Source Explorer', 'Library'];

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:10px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${P.fg}">${(screenNames[i] || 'Screen ' + (i + 1)).toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,       role: 'COSMOS' },
    { hex: P.surface2, role: 'GLASS' },
    { hex: P.surface3, role: 'ELEVATED' },
    { hex: P.fg,       role: 'LUMINANCE' },
    { hex: P.accent,   role: 'INDIGO' },
    { hex: P.accent2,  role: 'CYAN' },
    { hex: P.violet,   role: 'VIOLET' },
    { hex: P.green,    role: 'CONFIRM' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px;max-width:90px">
      <div style="height:48px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:8px;border-radius:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px;color:${P.fg2}">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accentHi};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '52px', weight: '900', sample: 'LUCID', extra: 'letter-spacing:-2px' },
    { label: 'HEADING',  size: '20px', weight: '700', sample: 'AI Research Workspace', extra: 'letter-spacing:-0.4px' },
    { label: 'BODY',     size: '13px', weight: '400', sample: 'Constitutional AI shows promise for scalable oversight beyond human ratings' },
    { label: 'CAPTION',  size: '9px',  weight: '700', sample: 'AI SYNTHESIS · LIVE · HIGH CONFIDENCE', extra: 'letter-spacing:1.5px' },
  ].map(t => `
    <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.35;margin-bottom:5px;color:${P.fg2}">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};${t.extra || ''};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
      <div style="font-size:9px;opacity:.35;width:30px;flex-shrink:0;font-family:monospace;color:${P.fg2}">${sp}px</div>
      <div style="height:7px;background:linear-gradient(90deg,${P.accent},${P.accent2});width:${sp * 2}px;opacity:0.75;border-radius:2px"></div>
    </div>`).join('');

  const principles = [
    'Glass cards as knowledge artifacts — each content card is a frosted glass panel floating in deep space, creating depth through transparent surfaces rather than shadows.',
    'Bento grid as spatial information architecture — the Hub screen uses variable-size tiles to communicate information hierarchy through layout density, not just type size.',
    'AI synthesis gets the accent panel — the AI summary card is the only element that breaks the dark glass motif, using an indigo-tinted glow to signal it is the "source of truth."',
    'Confidence scores as visual metadata — every AI finding includes a progress bar confidence indicator (78–94%) so users can calibrate trust without reading fine print.',
    'Tight negative tracking as texture — all headings use letter-spacing: -0.02em, inspired by the typography signatures found on Godly.website from the Inter-dominant design era.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:14px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${P.accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:3px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;color:${P.fg2};line-height:1.7">${p}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* LUCID Color System — Dark Glassmorphism × AI Research */
  --color-cosmos:    ${P.bg};
  --color-surface:   ${P.surface};
  --color-glass:     ${P.surface2};
  --color-elevated:  ${P.surface3};
  --color-border:    ${P.border};
  --color-border-hi: ${P.border2};
  --color-fg:        ${P.fg};
  --color-fg2:       ${P.fg2};
  --color-muted:     ${P.muted};
  --color-muted2:    ${P.muted2};
  --color-indigo:    ${P.accent};
  --color-indigo-hi: ${P.accentHi};
  --color-indigo-dim:${P.accentDim};
  --color-cyan:      ${P.accent2};
  --color-cyan-hi:   ${P.accent2Hi};
  --color-violet:    ${P.violet};
  --color-green:     ${P.green};
  --color-amber:     ${P.amber};
  --color-red:       ${P.red};

  /* Typography — Inter with tight tracking */
  --font: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
  --tracking-tight:  -0.02em;
  --tracking-label:  0.1em;
  --font-display:    900 clamp(40px, 8vw, 80px) / 1 var(--font);
  --font-heading:    700 20px / 1.3 var(--font);
  --font-body:       400 13px / 1.6 var(--font);
  --font-caption:    700 9px / 1 var(--font);

  /* Spacing (4px base grid) */
  --sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;
  --sp-5: 24px;  --sp-6: 32px;  --sp-7: 48px;  --sp-8: 64px;

  /* Radius */
  --r-sm:   8px;   --r-md:  12px;  --r-lg:  16px;
  --r-xl:   20px;  --r-full: 9999px;

  /* Glass card */
  --glass-bg:     var(--color-glass);
  --glass-border: 1px solid var(--color-border);
  --glass-top:    2px solid ${P.accent}30;
}`;

  const prdHTML = `
<h3>Overview</h3>
<p><strong>LUCID</strong> is a dark-mode AI research workspace designed for knowledge workers, researchers, and analysts who need to synthesize large volumes of academic and professional sources. It combines a spatial knowledge graph with AI-powered synthesis to surface insights, not just information.</p>

<h3>The Design Problem</h3>
<p>Research tools today are either powerful but ugly (citation managers, reference tools) or beautiful but shallow (Notion-style note-takers). LUCID bridges this gap with a dark glassmorphism aesthetic that signals depth and intelligence while keeping the interaction model focused on synthesis over accumulation.</p>

<h3>Target Users</h3>
<ul>
  <li><strong>Graduate researchers</strong> tracking literature across multiple papers and experiments</li>
  <li><strong>AI/ML practitioners</strong> keeping up with rapid publication velocity in their domain</li>
  <li><strong>Strategy analysts</strong> synthesizing industry reports, competitor intelligence, and primary research</li>
  <li><strong>Technical writers</strong> building knowledge bases from heterogeneous sources</li>
</ul>

<h3>Core Features</h3>
<ul>
  <li><strong>Research Hub:</strong> Bento grid dashboard — Today's Digest (AI summary), active thread count, live AI synthesis panel, quick-access recent threads</li>
  <li><strong>Thread View:</strong> Each research thread surfaces AI key findings with confidence scores, source attribution, and the full synthesis pipeline visible</li>
  <li><strong>Ask Mode:</strong> Conversational AI interface scoped to the current thread context — ask questions, get answers grounded in your own sources</li>
  <li><strong>Source Explorer:</strong> Search, filter, and manage 800+ indexed sources with relevance scoring and thread cross-reference counts</li>
  <li><strong>Library:</strong> Collections management — organize threads into projects, track update velocity, quick-access stats</li>
</ul>

<h3>Design Language</h3>
<ul>
  <li><strong>Glassmorphism depth layers:</strong> Three surface levels (#06041C → #14103A → #1C1750) create depth through transparency rather than shadows</li>
  <li><strong>Bento grid layout:</strong> Variable-tile dashboard inspired by the bento grid trend documented on Saaspo's AI SaaS category</li>
  <li><strong>Inter + tight tracking:</strong> All headings at -0.02em letter-spacing, matching the precision micro-typography trend on Godly.website</li>
  <li><strong>Dual accent system:</strong> Indigo (#7C6FF7) for AI-generated content, Cyan (#38D9F5) for sourced/factual content</li>
  <li><strong>Oversized KPI numbers:</strong> Thread counts, source counts, and collection stats rendered at 36–40px for instant dashboard readability</li>
</ul>

<h3>Screen Architecture</h3>
<ul>
  <li><strong>Screen 1 — Research Hub:</strong> Bento grid with Today's Digest (wide card), Active Threads counter, live AI Synthesis panel, Sources/Collections mini stats, Recent Threads list</li>
  <li><strong>Screen 2 — Thread View:</strong> AI synthesis panel (indigo glass), Key Findings with confidence bars, Top Sources with type badges (PAPER/DOC/BOOK)</li>
  <li><strong>Screen 3 — Ask Mode:</strong> Context-scoped AI chat, source citation count per message, typing indicator, full-width input bar</li>
  <li><strong>Screen 4 — Source Explorer:</strong> Search + filter chips, type-color-coded source cards with relevance scores and thread cross-ref counts</li>
  <li><strong>Screen 5 — Library:</strong> Stats bento (collections/sources/AI summaries), collection list with color-coded left accents and update timestamps</li>
</ul>`;

  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  background:${P.bg};
  color:${P.fg};
  font-family:'Inter','SF Pro Display',system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;
  line-height:1.6;
  min-height:100vh;
}

.container{max-width:1120px;margin:0 auto;padding:0 32px}

/* Hero */
.hero{
  padding:100px 0 72px;
  border-bottom:1px solid ${P.border};
  position:relative;
  overflow:hidden;
}
.hero::before{
  content:'';
  position:absolute;
  top:-200px; left:50%;
  transform:translateX(-50%);
  width:800px; height:600px;
  background:radial-gradient(ellipse at center, ${P.accent}12 0%, transparent 70%);
  pointer-events:none;
}
.hero::after{
  content:'';
  position:absolute;
  bottom:-100px; right:-100px;
  width:400px; height:400px;
  background:radial-gradient(ellipse at center, ${P.accent2}0A 0%, transparent 70%);
  pointer-events:none;
}
.hero-tag{
  display:inline-block;
  font-size:9px;font-weight:700;letter-spacing:2.5px;
  color:${P.accent};
  border:1px solid ${P.accent}55;
  background:${P.accent}11;
  padding:6px 14px;border-radius:99px;
  margin-bottom:28px;
}
.hero-name{
  font-size:clamp(64px,10vw,120px);
  font-weight:900;
  letter-spacing:-3px;
  line-height:0.9;
  color:${P.fg};
  margin-bottom:20px;
}
.hero-name span{color:${P.accent}}
.hero-tagline{
  font-size:clamp(18px,3vw,28px);
  font-weight:300;
  letter-spacing:-0.5px;
  color:${P.fg2};
  margin-bottom:16px;
}
.hero-meta{
  font-size:11px;font-weight:500;letter-spacing:1.5px;
  color:${P.muted2};
  margin-bottom:32px;
  text-transform:uppercase;
}
.hero-prompt{
  font-size:14px;font-style:italic;
  color:${P.fg2};
  border-left:3px solid ${P.accent}66;
  padding:16px 20px;
  background:${P.surface2}66;
  border-radius:0 8px 8px 0;
  max-width:780px;
  margin-bottom:40px;
  line-height:1.7;
}

/* Action buttons */
.actions{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:0}
.btn{
  display:inline-flex;align-items:center;gap:7px;
  padding:10px 20px;border-radius:8px;
  font-size:11px;font-weight:700;letter-spacing:0.5px;
  text-decoration:none;cursor:pointer;
  transition:all .15s;border:none;
  white-space:nowrap;
}
.btn-primary{background:${P.accent};color:${P.bg}}
.btn-primary:hover{background:${P.accentHi};transform:translateY(-1px)}
.btn-mock{background:${P.accent2}22;color:${P.accent2Hi};border:1px solid ${P.accent2}55}
.btn-mock:hover{background:${P.accent2}33;transform:translateY(-1px)}
.btn-secondary{background:${P.surface2};color:${P.fg2};border:1px solid ${P.border}}
.btn-secondary:hover{background:${P.surface3}}
.btn-outline{background:transparent;color:${P.muted2};border:1px solid ${P.border}}
.btn-outline:hover{color:${P.fg};border-color:${P.border2}}

/* Section label */
.section-label{
  font-size:9px;font-weight:700;letter-spacing:2px;
  color:${P.muted};text-transform:uppercase;
  margin-bottom:20px;
  padding-top:64px;
}

/* Screens strip */
.screens-strip{
  display:flex;gap:20px;overflow-x:auto;
  padding-bottom:16px;
  margin-bottom:0;
}
.screens-strip::-webkit-scrollbar{height:4px}
.screens-strip::-webkit-scrollbar-track{background:transparent}
.screens-strip::-webkit-scrollbar-thumb{background:${P.border2};border-radius:2px}

/* Spec grid */
.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:72px}
@media(max-width:600px){.spec-grid{grid-template-columns:1fr}}
.spec-card{background:${P.surface2};border:1px solid ${P.border};border-radius:14px;padding:28px}
.spec-card h3{font-size:9px;font-weight:700;letter-spacing:2px;color:${P.muted};
  text-transform:uppercase;margin-bottom:20px}
.palette{display:flex;gap:10px;flex-wrap:wrap}

/* Tokens */
.tokens-section{margin-bottom:72px}
.tokens-block{background:${P.surface2};border:1px solid ${P.border};border-radius:14px;
  padding:28px;position:relative}
.tokens-block pre{font-family:'SF Mono','Fira Code',monospace;font-size:11px;
  color:${P.fg2};overflow-x:auto;line-height:1.85;white-space:pre}
.copy-btn{position:absolute;top:16px;right:16px;background:${P.accentDim};color:${P.accentHi};
  border:1px solid ${P.accent}44;border-radius:6px;padding:6px 14px;font-size:10px;font-weight:700;
  letter-spacing:1px;cursor:pointer;transition:all .15s}
.copy-btn:hover{background:${P.accent};color:${P.bg}}

/* PRD */
.prd-section{margin-bottom:72px}
.prd-body{color:${P.fg2};font-size:14px;line-height:1.8}
.prd-body h3{font-size:15px;font-weight:700;color:${P.fg};margin:28px 0 10px;letter-spacing:-0.3px}
.prd-body p{margin-bottom:14px}
.prd-body ul{padding-left:20px;margin-bottom:14px}
.prd-body li{margin-bottom:7px}
.prd-body strong{color:${P.fg}}

/* Footer */
.footer{padding:56px 0;border-top:1px solid ${P.border};text-align:center;
  color:${P.muted};font-size:12px}
.footer a{color:${P.muted};text-decoration:none}
.footer a:hover{color:${P.fg2}}
</style>
</head>
<body>
<div class="container">

  <div class="hero">
    <div class="hero-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
    <div class="hero-name"><span>L</span>UCID</div>
    <div class="hero-tagline">${TAGLINE}</div>
    <div class="hero-meta">Dark Glassmorphism · Bento Grid · AI Synthesis · Inter Typeface · 5 Screens</div>
    <div class="hero-prompt">${ORIGINAL_PROMPT}</div>
    <div class="actions">
      <a href="https://ram.zenbin.org/${VIEWER_SLUG}" class="btn btn-primary" target="_blank">▶ Open in Viewer</a>
      <a href="${mockURL}" class="btn btn-mock" target="_blank">✦ Try Interactive Mock</a>
      <a href="data:application/json;base64,${penEncoded}" download="lucid.pen" class="btn btn-secondary">↓ Download .pen</a>
      <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.querySelector('.hero-prompt').textContent.trim()).then(()=>{this.textContent='✓ Copied!';setTimeout(()=>this.textContent='⎘ Copy Prompt',2000)})">⎘ Copy Prompt</button>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}" class="btn btn-outline" target="_blank">𝕏 Share</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">⬡ Gallery</a>
    </div>
  </div>

  <div class="section-label">5 Screens — Hub · Thread · Ask · Sources · Library</div>
  <div class="screens-strip">${thumbsHTML}</div>

  <div class="spec-grid" style="margin-top:56px">
    <div class="spec-card">
      <h3>Color Palette</h3>
      <div class="palette">${swatchHTML}</div>
    </div>
    <div class="spec-card">
      <h3>Type Scale</h3>
      ${typeScaleHTML}
    </div>
    <div class="spec-card">
      <h3>Spacing System</h3>
      ${spacingHTML}
    </div>
    <div class="spec-card">
      <h3>Design Principles</h3>
      ${principlesHTML}
    </div>
  </div>

  <div class="tokens-section">
    <div class="section-label">CSS Design Tokens</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.querySelector('.tokens-block pre').textContent).then(()=>{this.textContent='✓ Copied!';setTimeout(()=>this.textContent='COPY TOKENS',2000)})">COPY TOKENS</button>
      <pre>${cssTokens}</pre>
    </div>
  </div>

  <div class="prd-section">
    <div class="section-label">Product Brief / PRD</div>
    <div class="spec-card">
      <div class="prd-body">${prdHTML}</div>
    </div>
  </div>

  <div class="footer">
    <p>Built by <strong style="color:${P.fg2}">RAM Design Studio</strong> · Design Heartbeat ${DATE_STR}</p>
    <p style="margin-top:8px">
      <a href="https://ram.zenbin.org/gallery">← Gallery</a> ·
      <a href="https://ram.zenbin.org/${VIEWER_SLUG}">Viewer →</a> ·
      <a href="${mockURL}">Interactive Mock →</a>
    </p>
  </div>

</div>
</body>
</html>`;
}

// ── Build viewer HTML ─────────────────────────────────────────────────────────
function buildViewerHTML(pen) {
  const penJson = JSON.stringify(pen);
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'axon-viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== LUCID Design Discovery Pipeline ===\n');

  const penPath = path.join(__dirname, 'lucid.pen');
  const pen     = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded pen: ${pen.children.length} screens`);

  // [1] Hero page
  console.log('\n[1/4] Building + publishing hero page...');
  const heroHTML = buildHeroHTML(pen);
  console.log(`  Hero HTML: ${(heroHTML.length / 1024).toFixed(1)} KB`);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`  → ${heroRes.status}  ${heroRes.body.slice(0, 120)}`);

  // [2] Viewer
  console.log('\n[2/4] Building + publishing viewer...');
  const viewerHTML = buildViewerHTML(pen);
  console.log(`  Viewer HTML: ${(viewerHTML.length / 1024).toFixed(1)} KB`);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`  → ${viewerRes.status}  ${viewerRes.body.slice(0, 120)}`);

  // [3] Gallery queue
  console.log('\n[3/4] Updating gallery queue...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-lucid-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     mockURL,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });
  const putRes = await ghReq({
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
  console.log(`  → Gallery: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 200)}`);

  console.log('\n[4/4] Pipeline complete!');
  console.log(`  Hero:     https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:   https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:     ${mockURL}  (run lucid-mock.mjs)`);
  console.log(`  Gallery:  https://ram.zenbin.org/gallery`);
}

main().catch(console.error);
