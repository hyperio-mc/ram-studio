'use strict';
// publish-sift-heartbeat.js — Full Design Discovery pipeline for SIFT heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'sift';
const VIEWER_SLUG = 'sift-viewer';

// ── Design metadata ────────────────────────────────────────────────────────────
const meta = {
  appName:   'SIFT',
  tagline:   'AI research intelligence that searches, synthesizes, and surfaces evidence your arguments need.',
  archetype: 'productivity',
  palette: {
    bg:      '#F2F1EC',   // warm off-white paper
    fg:      '#111111',   // ink black
    accent:  '#0046D5',   // deep research blue
    accent2: '#7C3AED',   // purple — AI synthesis
  },
};

const ORIGINAL_PROMPT = 'Design SIFT — a LIGHT-MODE editorial AI research intelligence platform. Challenge: Most AI tools are dark-mode. SIFT deliberately goes light — warm off-white editorial paper (#F2F1EC) + ink black (#111111) + single deep-blue accent (#0046D5). Inspired by: (1) Factory.ai (minimal.gallery/tag/ai, March 2026) — "Agent-Native Software Development", off-white bg, Geist font, near-zero decoration — the editorial restraint and agent-native positioning is the design canon; (2) Einride (minimal.gallery, March 2026) — bold confident display typography for an intelligent-systems brand; (3) Forge (darkmodedesign.com, March 2026) — precision developer productivity tool grid structure, inverted into light mode. 5 mobile screens: Landing · Dashboard · Source Review · Evidence · Export.';

const sub = {
  id:           `heartbeat-sift-${Date.now()}`,
  status:       'done',
  app_name:     'SIFT',
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

const prd = {
  screenNames: ['Landing', 'Dashboard', 'Source Review', 'Evidence', 'Export'],
  markdown: `## Overview
SIFT is an AI-powered research intelligence platform that deploys autonomous research agents to scan millions of sources, verify credibility, synthesize evidence, and deliver structured reports. It's built for researchers, analysts, journalists, and knowledge workers who need rigorous, cited evidence fast — not a chatbot that hallucinates.

## Target Users
- **Academic researchers** who need systematic literature reviews across hundreds of papers
- **Journalists and analysts** who need verified, cited evidence for investigative work
- **Consultants and strategists** who need comprehensive competitive and market research
- **Students** writing thesis-level arguments who need primary source backing
- **Policy researchers** tracking regulatory and legislative evidence trails

## Core Features
- **Landing** — Editorial hero with 24M+ indexed source count, search-first entry, social proof from institutions (MIT, Stanford, McKinsey). Minimal, Factory.ai-inspired — the product communicates via restraint.
- **Dashboard** — Active query cards with real-time confidence bars, running/done/queued status, color-coded progress. Clean bento layout — each query tells its full story at a glance.
- **Source Review** — Bibliographic cards for each source: title, author/publisher, type (BOOK/GOV/JOURNAL), relevance score bar, political bias indicator (CENTER/CENTER-L/GOV), SIFT verification badge. The academic librarian view.
- **Evidence** — Structured synthesis view: AI-generated abstract at the top (purple synthesis block), key themes with source counts, confidence breakdown by source type (primary/secondary/expert). The deliverable-in-progress.
- **Export** — Report preview card with table of contents, format chooser (PDF/Markdown/Notion/Docs), share link. The clean, editorial delivery moment.

## Design Language
Directly inspired by three sources discovered March 21, 2026:

1. **Factory.ai** ([minimal.gallery/tag/ai](https://minimal.gallery/tag/ai/)) — "Agent-Native Software Development". Off-white (#EEEEEE) background, Geist font, radically minimal. The product speaks entirely through typography and data — no gradients, glows, or decoration. SIFT adopts this philosophy completely, with a warm paper tone (#F2F1EC) instead of cool gray.

2. **Einride** ([minimal.gallery/tag/ai](https://minimal.gallery/tag/ai/)) — "Intelligent movement." Bold display type (800–900 weight) with confident negative space. Large numbers as editorial flourishes ("24M SOURCES"). The brand communicates scale through restraint.

3. **Forge** ([darkmodedesign.com](https://darkmodedesign.com)) — Precision developer productivity grid. Strong structural rhythm, consistent 4px base grid, tight typographic hierarchy. SIFT takes this structural precision and inverts it into light mode — the grid is the same, only the colors are different.

### What makes SIFT's aesthetic distinctive
- **The only light-mode AI research tool** in a field of dark dashboards
- **Editorial paper tone** (#F2F1EC) that references physical research — notebooks, academic journals, index cards
- **Single accent color** — deep blue (#0046D5) as the only color that matters. Everything else is ink, paper, or muted gray
- **Data as typography** — confidence percentages, source counts, and status indicators are always typographic, never just icons
- **Purple for AI synthesis** (#7C3AED) — the one place AI speaks, distinguished from the human-curated sources

## Screen Architecture
1. **Landing** — Oversized editorial number (24M), bold headline ("Research that finds what you can't"), search preview card with live agent status
2. **Dashboard** — Card list of active queries, running/done/queued states, confidence bars, timestamp metadata
3. **Source Review** — Full bibliographic cards, relevance scoring, bias indicators, verification badges
4. **Evidence** — AI synthesis block, key themes with numbered tags, three-tier confidence breakdown
5. **Export** — Report preview with dark header on white card, format picker, share row`,
};

// ── HTTP helpers ───────────────────────────────────────────────────────────────
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

function get_(host, p) {
  return httpsReq({ hostname: host, path: p, method: 'GET',
    headers: { 'User-Agent': 'ram-heartbeat/1.0' } });
}

// ── Render element as SVG (for thumbnails) ─────────────────────────────────────
function renderEl(el, depth) {
  if (!el || depth > 10) return '';
  const x = el.x || 0, y = el.y || 0, w = el.width || 0, h = el.height || 0;
  let out = '';
  if (el.type === 'frame') {
    const r = el.cornerRadius || 0;
    const fill = el.fill || 'transparent';
    let stroke = '';
    if (el.stroke) stroke = `stroke="${el.stroke.fill}" stroke-width="${el.stroke.thickness || 1}"`;
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${stroke}/>`;
    if (el.clip) {
      const cid = `cl${Math.random().toString(36).slice(2)}`;
      out = `<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`
           + `<g clip-path="url(#${cid})">${out}`;
      (el.children || []).forEach(c => { out += renderEl(c, depth + 1); });
      out += '</g>';
      return out;
    }
    (el.children || []).forEach(c => { out += renderEl(c, depth + 1); });
  } else if (el.type === 'text') {
    const fill = el.fill || '#111';
    const size = Math.max(el.fontSize || 13, 6);
    const weight = el.fontWeight || '400';
    const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
    const tx = el.textAlign === 'center' ? x + w / 2 : el.textAlign === 'right' ? x + w : x;
    const lines = (el.content || '').split('\n');
    const lh = (el.lineHeight || 1.2) * size;
    const ty = y + size * 0.85;
    const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    lines.forEach((line, i) => {
      out += `<text x="${tx}" y="${ty + i * lh}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${op} dominant-baseline="auto">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    });
  } else if (el.type === 'ellipse') {
    const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
    const fill = el.fill || 'transparent';
    const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    let stroke = '';
    if (el.stroke) stroke = `stroke="${el.stroke.fill}" stroke-width="${el.stroke.thickness || 1}"`;
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${op} ${stroke}/>`;
  }
  return out;
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const inner = (screen.children || []).map(c => renderEl(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="border-radius:10px;border:1px solid #D8D7D1;display:block;box-shadow:0 2px 12px rgba(0,0,0,.08)">
    <rect width="${sw}" height="${sh}" fill="${screen.fill || '#F2F1EC'}"/>
    ${inner}
  </svg>`;
}

// ── Colour helpers ─────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111111').replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function darkenHex(hex, amt) {
  const n = parseInt((hex || '#F2F1EC').replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ── Build hero HTML ────────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface  = darkenHex(meta.palette.bg, 8);   // slightly darker than canvas
  const border   = darkenHex(meta.palette.bg, 28);  // warm border
  const THUMB_H  = 200;
  const encoded  = Buffer.from(JSON.stringify(penJson)).toString('base64');

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = `M · ${prd.screenNames[i] || i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${meta.palette.fg}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#F2F1EC', role: 'CANVAS' },
    { hex: '#FAFAF8', role: 'SURFACE' },
    { hex: '#EDEDEA', role: 'SURFACE 2' },
    { hex: '#D8D7D1', role: 'BORDER' },
    { hex: '#111111', role: 'INK' },
    { hex: '#6B6B6B', role: 'MUTED' },
    { hex: '#0046D5', role: 'BLUE' },
    { hex: '#7C3AED', role: 'PURPLE' },
    { hex: '#16A34A', role: 'GREEN' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY', size: '80px', weight: '900', sample: '24M' },
    { label: 'HEADING', size: '32px', weight: '800', sample: 'Research Intelligence' },
    { label: 'BODY',    size: '14px', weight: '400', sample: 'AI agents that scan, synthesize, and surface the exact evidence your argument needs.' },
    { label: 'CAPTION', size: '9px',  weight: '600', sample: 'SOURCES INDEXED · CONFIDENCE · VERIFIED · BIAS INDICATOR' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* SIFT Color System — Editorial Light Mode */
  --sift-canvas:     #F2F1EC;  /* warm off-white paper */
  --sift-surface:    #FAFAF8;  /* card / panel */
  --sift-surface-2:  #EDEDEA;  /* secondary surface */
  --sift-border:     #D8D7D1;  /* warm gray border */
  --sift-border-2:   #C8C7C0;  /* stronger border */
  --sift-ink:        #111111;  /* near-black text */
  --sift-ink-2:      #333333;  /* secondary text */
  --sift-muted:      #8A8A84;  /* muted labels */
  --sift-muted-2:    #6B6B6B;  /* slightly darker muted */
  --sift-blue:       #0046D5;  /* primary accent — deep research blue */
  --sift-blue-lt:    #2563EB;  /* lighter blue */
  --sift-blue-bg:    #EFF4FF;  /* tinted blue surface */
  --sift-purple:     #7C3AED;  /* AI synthesis accent */
  --sift-purple-bg:  #F3EEFF;  /* purple tint */
  --sift-green:      #16A34A;  /* verified / complete */
  --sift-amber:      #D97706;  /* in-progress / caution */
  --sift-red:        #DC2626;  /* error / conflict */

  /* Typography */
  --sift-font:       'Inter', 'SF Pro', system-ui, sans-serif;
  --sift-display:    900 clamp(64px, 12vw, 100px) / 1 var(--sift-font);
  --sift-heading:    800 32px / 1.2 var(--sift-font);
  --sift-body:       400 14px / 1.65 var(--sift-font);
  --sift-caption:    600 9px  / 1  var(--sift-font);
  --sift-mono:       'SF Mono', 'Fira Code', ui-monospace, monospace;

  /* Spacing — 4px base grid */
  --sift-sp-1:   4px;   --sift-sp-2:   8px;   --sift-sp-3:  12px;
  --sift-sp-4:  16px;   --sift-sp-5:  24px;   --sift-sp-6:  32px;
  --sift-sp-7:  48px;   --sift-sp-8:  64px;

  /* Radius */
  --sift-r-sm:  6px;   --sift-r-md: 10px;
  --sift-r-lg: 14px;   --sift-r-xl: 20px;   --sift-r-full: 9999px;

  /* Shadows — light, warm */
  --sift-shadow-card: 0 2px 12px rgba(0,0,0,.06);
  --sift-shadow-lift: 0 8px 32px rgba(0,0,0,.10);
}`;

  const shareText = encodeURIComponent(
    `SIFT — AI Research Intelligence Platform. 5 mobile screens + full brand spec + CSS tokens. Editorial light-mode research tool. Designed by RAM Design AI.`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SIFT — AI Research Intelligence · RAM Design Studio</title>
<meta name="description" content="SIFT — editorial light-mode AI research intelligence platform. 5 mobile screens, brand spec & CSS tokens. Designed by RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:'Inter','SF Pro Display',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;background:${surface}}
  .logo{font-size:12px;font-weight:900;letter-spacing:4px;color:${meta.palette.fg}}
  .nav-id{font-size:11px;color:${meta.palette.accent};letter-spacing:1px;opacity:.8}
  .hero{padding:72px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:16px;font-weight:700}
  .hero-count{font-size:clamp(80px,14vw,140px);font-weight:900;letter-spacing:-5px;line-height:0.9;color:${meta.palette.fg};margin-bottom:8px}
  .hero-count-label{font-size:11px;letter-spacing:3px;color:#8A8A84;margin-bottom:32px;font-weight:600}
  h1{font-size:clamp(36px,6vw,60px);font-weight:900;letter-spacing:-2px;line-height:1.1;margin-bottom:16px;color:${meta.palette.fg};max-width:640px}
  .sub{font-size:15px;color:#6B6B6B;max-width:520px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.45;letter-spacing:1.5px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:all .15s}
  .btn-p{background:${meta.palette.fg};color:${meta.palette.bg}}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}}
  .btn-x{background:#000;color:#fff;border:none}
  .btn-blue{background:${meta.palette.accent};color:#fff}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};font-weight:700}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${border};border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${meta.palette.fg};border:1px solid #333;border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#F2F1EC;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent};border:none;color:#fff;font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{opacity:.85}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px;font-weight:700}
  .p-text{font-size:17px;color:#6B6B6B;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;color:#333;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${meta.palette.fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;color:#8A8A84;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.fg};color:${meta.palette.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:720px;font-size:12px;line-height:1.75;color:#555}
  .inspiration-bar strong{color:${meta.palette.accent}}
  .contrast-note{display:inline-flex;align-items:center;gap:8px;background:${meta.palette.accent + '12'};border:1px solid ${meta.palette.accent + '30'};border-radius:20px;padding:6px 14px;font-size:11px;color:${meta.palette.accent};font-weight:600;margin-bottom:32px}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-sift · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · AI RESEARCH PLATFORM · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>

  <div class="contrast-note">◯ Light-mode editorial — a deliberate departure from dark-mode AI dashboards</div>

  <div class="hero-count">24M</div>
  <div class="hero-count-label">SOURCES INDEXED</div>

  <h1>Research that finds what you can't.</h1>
  <p class="sub">${meta.tagline}</p>

  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>MODE</span><strong>LIGHT / EDITORIAL</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>BY</span><strong>RAM HEARTBEAT</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-blue" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="inspiration-bar">
  <strong>What inspired this:</strong>
  Factory.ai's agent-native off-white aesthetic at <strong>minimal.gallery/tag/ai</strong> (March 2026) → warm paper canvas, near-zero decoration.
  Einride's confident bold display typography at <strong>minimal.gallery/tag/ai</strong> → oversized editorial numbers as flourishes.
  Forge's structural precision grid at <strong>darkmodedesign.com</strong> → the grid logic, inverted into light.
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:#8A8A84;margin-bottom:16px;font-weight:600">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:#8A8A84;margin-bottom:0;font-weight:600">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:#8A8A84;margin-bottom:16px;font-weight:600">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:#8A8A84;margin-bottom:12px;font-weight:600">DESIGN PRINCIPLES</div>
      ${[
        ['Paper over glass', 'Warm #F2F1EC canvas evokes physical research — notebooks, journals, index cards. Grounding in the familiar builds trust with academic users.'],
        ['One accent, maximum signal', 'Deep blue (#0046D5) is the only saturated color. It means "important" — links, active states, verified sources. Nothing else competes.'],
        ['Purple for machine thought', 'AI synthesis blocks use purple (#7C3AED). This one color separation makes it immediately clear: this is the machine\'s voice, not a human source.'],
        ['Editorial numbers as design', 'Large typographic data points ("24M", "91%", "142") are the only ornamentation. Inspired by Factory.ai\'s signal-over-noise restraint.'],
      ].map(([p, d]) => `<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:700;color:${meta.palette.fg};margin-bottom:4px">${p}</div><div style="font-size:12px;color:#6B6B6B;line-height:1.55">${d}</div></div>`).join('')}
    </div>

  </div>

  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;color:#8A8A84;margin-bottom:12px;font-weight:600">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text" id="originalPrompt">"${ORIGINAL_PROMPT}"</p>
</section>

<section class="prd-section">
  <div style="font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:24px;font-weight:700">PRODUCT BRIEF / PRD</div>
  ${prd.markdown
    .split('\n')
    .map(line => {
      if (line.startsWith('## ')) return `<h3>${line.slice(3)}</h3>`;
      if (line.startsWith('### ')) return `<h3 style="font-size:10px">${line.slice(4)}</h3>`;
      if (line.startsWith('- **')) return `<li><strong>${line.slice(3).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</strong></li>`;
      if (line.startsWith('- ')) return `<li>${line.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`;
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) return `<li>${line.slice(3).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`;
      if (line.trim() === '') return '<br>';
      return `<p>${line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\([^)]+\)/g, '<strong>$1</strong>')}</p>`;
    })
    .join('\n')}
</section>

<footer>
  <span>RAM DESIGN STUDIO · ${new Date().getFullYear()}</span>
  <span>SIFT · heartbeat-sift</span>
  <span>ram.zenbin.org/${SLUG}</span>
</footer>

<script>
  const ENCODED = "${encoded}";
  const VIEWER_URL = "https://ram.zenbin.org/${VIEWER_SLUG}";
  const PROMPT = document.getElementById('originalPrompt')?.innerText || '';

  function openInViewer() { window.open(VIEWER_URL, '_blank'); }

  function downloadPen() {
    const bytes = Uint8Array.from(atob(ENCODED), c => c.charCodeAt(0));
    const blob  = new Blob([bytes], { type: 'application/octet-stream' });
    const a     = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'sift.pen' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('Downloaded ✓');
  }

  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
  }

  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied ✓'));
  }

  function shareOnX() {
    window.open('https://x.com/intent/tweet?text=${shareText}&url=' + encodeURIComponent(location.href), '_blank');
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SIFT Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── Zenbin publisher ───────────────────────────────────────────────────────────
async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  const r = await httpsReq({
    hostname: 'zenbin.org',
    path:     `/v1/pages/${slug}`,
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    'ram',
    },
  }, body);
  return r;
}

// ── Gallery queue ──────────────────────────────────────────────────────────────
async function addToGalleryQueue(heroUrl) {
  // 1. Fetch current queue.json from GitHub
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  // 2. Parse — ALWAYS normalize to wrapped format
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  // 3. Build new entry
  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     'SIFT',
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   heroUrl,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  // 4. Append
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  // 5. PUT back
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message:  `add: SIFT to gallery (heartbeat)`,
    content:  newContent,
    sha:      currentSha,
  });
  const putRes = await httpsReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers:  {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':        'application/vnd.github.v3+json',
    },
  }, putBody);
  return putRes;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  SIFT — AI Research Intelligence Platform');
  console.log('  Design Heartbeat · RAM Design Studio');
  console.log('═══════════════════════════════════════════════\n');

  // Load .pen
  const penPath = path.join(__dirname, 'sift.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ sift.pen not found — run: node sift-app.js first');
    process.exit(1);
  }
  const penJson = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded sift.pen (${penJson.children?.length} screens, ${Math.round(fs.statSync(penPath).size / 1024)}KB)`);

  // Build hero HTML
  const heroHTML = buildHeroHTML(penJson, penJson);
  console.log(`✓ Hero HTML built (${Math.round(heroHTML.length / 1024)}KB)`);

  // Save hero locally
  const heroLocalPath = path.join(__dirname, 'sift-hero.html');
  fs.writeFileSync(heroLocalPath, heroHTML);
  console.log(`✓ Saved ${heroLocalPath}`);

  // Build viewer
  console.log('\nFetching viewer template from ram.zenbin.org/viewer...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`✓ Viewer HTML built (${Math.round(viewerHTML.length / 1024)}KB)`);

  const viewerLocalPath = path.join(__dirname, 'sift-viewer.html');
  fs.writeFileSync(viewerLocalPath, viewerHTML);
  console.log(`✓ Saved ${viewerLocalPath}`);

  // Publish hero → ram.zenbin.org/sift
  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroUrl    = `https://ram.zenbin.org/${SLUG}`;
  const heroResult = await publishToZenbin(SLUG, 'SIFT — AI Research Intelligence · RAM Design Studio', heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) {
    console.log(`  ✓ Hero live at ${heroUrl}`);
  } else {
    console.log(`  Response: ${heroResult.body.slice(0, 200)}`);
  }

  // Publish viewer → ram.zenbin.org/sift-viewer
  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'SIFT Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) {
    console.log(`  ✓ Viewer live at https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.log(`  Response: ${viewerResult.body.slice(0, 200)}`);
  }

  // Add to gallery queue
  console.log('\nAdding to gallery queue...');
  try {
    const galleryResult = await addToGalleryQueue(heroUrl);
    if (galleryResult.status === 200) {
      console.log('  ✓ Gallery queue updated');
    } else {
      console.log(`  Gallery queue status: ${galleryResult.status}`);
      console.log(`  ${galleryResult.body.slice(0, 150)}`);
    }
  } catch (e) {
    console.log(`  Gallery queue error: ${e.message}`);
  }

  // Final summary
  console.log('\n═══════════════════════════════════════════════');
  console.log('  SIFT PUBLISHED ✓');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n✗ Fatal error:', err.message);
  process.exit(1);
});
