'use strict';
// publish-sage-heartbeat.js — Full Design Discovery pipeline for SAGE heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'sage';
const VIEWER_SLUG = 'sage-viewer';
const APP_NAME    = 'SAGE';

// ── Design metadata ────────────────────────────────────────────────────────────
const meta = {
  appName:   'SAGE',
  tagline:   'Research intelligence, distilled.',
  archetype: 'ai-research',
  palette: {
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    fg:      '#1A1916',
    fg2:     '#6B6860',
    border:  '#DDD9CF',
    sage:    '#4B7A5E',
    amber:   '#C4853A',
    blue:    '#3A6FB5',
    red:     '#C54040',
  },
};

const ORIGINAL_PROMPT = `Design SAGE — a light-theme AI research companion that distills web knowledge into structured, sourceable insight threads. Directly inspired by research from this heartbeat session:

1. Land-book.com (Mar 2026): Keytail — "Be the Answer Everywhere People Search"
   Clean AI-search SaaS landing page. Warm neutrals, editorial layout, a single hero search bar as the entire value proposition. The idea: the AI is always ready to answer, not just on one platform.

2. Awwwards nominees (Mar 2026): "Unseen Studio 2025 Wrapped" — data as editorial art.
   Generous whitespace, oversized stat callouts, typographic hierarchy used as the visual system. Big display numbers become the hero of each screen.

3. Godly.website (Mar 2026): Evervault Customers — clean enterprise SaaS grid.
   "Understated authority" — minimal chrome, maximum content density. Trust through restraint.

4. Minimal.gallery AI/Startup category (Mar 2026): Warm cream/parchment backgrounds
   replacing cold clinical white. Natural accent colors (sage green, warm amber) are emerging as the alternative to the blue/purple AI aesthetic.

The challenge: build a light-theme AI research tool that feels like a premium research notebook — warm parchment (#F6F3EE) background, sage green (#4B7A5E) as the single thoughtful accent, editorial oversized type for confidence/insight callouts. 5 mobile screens covering the full research cycle: Discovery → Active Research → Source Explorer → Library → Synthesis.`;

const sub = {
  id:           `heartbeat-sage-${Date.now()}`,
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

const prd = {
  screenNames: ['Discovery', 'Active Research', 'Source Explorer', 'Library', 'Synthesis'],
  markdown: `## Overview
SAGE is an AI research companion for knowledge workers who want sourced, structured intelligence rather than hallucinated summaries. Inspired by Keytail's "answer everywhere" concept from land-book.com and the editorial data-as-art aesthetic of Awwwards' most recent nominees (March 2026). SAGE applies the warm-parchment minimal aesthetic that is rapidly replacing cold white in the AI tools category.

## Design Philosophy
**Warmth as credibility.** The shift from cold white/dark-mode to warm parchment (#F6F3EE) signals thoughtfulness and care — the interface feels like a premium research notebook, not a utility. This directly reflects the trend observed across minimal.gallery's AI/Startup category in March 2026.

**Editorial big-type for confidence.** The "94%" confidence score is rendered at 64px/900 weight — a direct application of the Awwwards editorial big-type trend (Unseen Studio's "2025 Wrapped"). Numbers that matter deserve to be seen.

**Sage green as intention.** Unlike the generic purple/blue AI accent, sage green (#4B7A5E) feels considered and natural. Paired with warm amber (#C4853A) for secondary emphasis, the palette reads "scholarly" rather than "tech startup."

**Inspired directly by:**
- Keytail (land-book.com, Mar 2026) — AI search SaaS, hero search bar as primary affordance
- Unseen Studio 2025 Wrapped (Awwwards nominee, Mar 2026) — big-type editorial data display
- Evervault Customers (godly.website, Mar 2026) — clean grid, understated enterprise authority
- Minimal.gallery AI category (Mar 2026) — warm neutrals trend, natural accent color systems

## Target Users
- **Knowledge workers** — researchers, analysts, consultants who need reliable cited information
- **Journalists and writers** — rapid background research with source verification built in
- **Product managers and strategists** — gathering competitive intelligence with confidence scores
- **Students and academics** — literature review augmented by AI synthesis

## Core Features
- **Discovery** — Hero search bar (Keytail-inspired), topic chips, recent research thread cards with left-border color coding and source counts
- **Active Research** — Live query in progress: 94% confidence at 64px editorial display size, streaming synthesis text card with cursor, source domain grid (4 chips), follow-up suggestion cards
- **Source Explorer** — Filter chips (All/Papers/Docs/Reviews), combined citation stats (14 sources, 5,281 citations), per-source cards with relevance bars and citation counts
- **Library** — Collection overview (2 collections as bento), search bar, full thread list with saved/bookmarked states
- **Synthesis** — Week-in-review editorial layout: "Week / in Review" as 42px dual-line hero, topic breakdown with progress bars, key insight callout card (sage-bordered), most-cited sources list

## Design Language
SAGE uses a constrained 4-level typography system:

1. **Display (42–64px, 900 weight)** — Confidence scores, week-in-review headings. The editorial heartbeat of each screen.
2. **Heading (15–26px, 700–800 weight)** — Screen titles, app wordmark.
3. **Body (10.5–12px, 400–600 weight)** — Research content, source titles, synthesis text.
4. **Label (7–9px, 600–700 weight, 1.5px letter-spacing)** — Section labels, meta data, status indicators.

Color is used with clinical economy: sage (#4B7A5E) for primary actions and active states only; amber (#C4853A) for saved/bookmarked items; blue (#3A6FB5) for source type classification; red (#C54040) reserved for error/critical states. The parchment (#F6F3EE) background creates warmth without being beige-heavy.

## Screen Architecture
1. **Discovery** — Wordmark "SAGE" at 46px display, hero search bar (16px radius, Keytail-inspired), topic pills, 4 thread cards with left-border color coding
2. **Active Research** — Back nav, live status pill, 94% confidence at 64px/900, streaming synthesis card, 4-source grid (arxiv/anthropic/nature/openai), 3 follow-up suggestion cards
3. **Source Explorer** — Filter chips row, stats bento (14 sources / 5,281 citations), 5 source cards with relevance left-bar, type pills, citation counts
4. **Library** — Collections bento (2 collection cards with thread counts), search bar, 4 saved thread cards with bookmark indicators
5. **Synthesis** — "Week / in Review" 42px hero heading (line 2 in sage green), stat trio (56 sources / 4 threads / 2 notes), topic breakdown progress bars, key insight callout (sage-bordered card), 3 most-cited sources`,
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

async function get_(host, p) {
  return httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'ram-design/1.0' } });
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
  const scaleX = tw / screen.width;
  const scaleY = th / screen.height;

  function renderNode(node, depth = 0) {
    if (depth > 8) return '';
    const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');
    const x  = (node.x || 0) * scaleX;
    const y  = (node.y || 0) * scaleY;
    const w  = (node.width  || 0) * scaleX;
    const h  = (node.height || 0) * scaleY;
    const fill = node.fill || 'transparent';
    const op   = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
    const cr   = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX,scaleY)}"` : '';
    const sw   = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX,scaleY) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';

    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w/2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fw = ['700','800','900'].includes(String(node.fontWeight)) ? ' font-weight="bold"' : '';
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill||meta.palette.fg}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}</text>`;
    }
    if (node.type === 'ellipse') {
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op}${strokeStr}/>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${((Math.abs(x*100+y*10))|0)}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:10px;overflow:hidden;border:1px solid ${meta.palette.border}">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ──────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];

  const surface2 = '#EFF0EB';
  const border   = meta.palette.border;
  const fg       = meta.palette.fg;
  const sage     = meta.palette.sage;
  const bg       = meta.palette.bg;

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = prd.screenNames[i] || `Screen ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;color:${meta.palette.fg2};opacity:.6;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: meta.palette.bg,      role: 'PARCHMENT' },
    { hex: meta.palette.surface, role: 'SURFACE'   },
    { hex: surface2,             role: 'SURFACE 2' },
    { hex: meta.palette.sage,    role: 'SAGE GREEN'},
    { hex: meta.palette.amber,   role: 'AMBER'     },
    { hex: meta.palette.blue,    role: 'REFERENCE' },
    { hex: meta.palette.fg,      role: 'INK'       },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;color:${meta.palette.fg2};opacity:.6;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${sage}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'64px', weight:'900', sample: '94%', note: 'Confidence callout — editorial big-type' },
    { label:'HERO',     size:'42px', weight:'900', sample: 'Week in Review', note: 'Screen title hero — Awwwards editorial' },
    { label:'HEADING',  size:'20px', weight:'800', sample: 'Research intelligence, distilled.', note: 'App wordmark / section heading' },
    { label:'BODY',     size:'11px', weight:'400', sample: 'Constitutional AI trains models to be helpful, harmless, and honest through self-critique.', note: 'Synthesis text / source content' },
    { label:'LABEL',    size:'8px',  weight:'700', sample: 'CONFIDENCE · SOURCES · RESEARCH BREAKDOWN · MOST CITED', note: 'Section labels — 1.5px letter-spacing' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;color:${meta.palette.fg2};opacity:.5;margin-bottom:4px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
      <div style="font-size:9px;color:${sage};opacity:.7;margin-top:4px">${t.note}</div>
    </div>`).join('');

  const spacingHTML = [4,8,12,16,24,32,48].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:10px;color:${meta.palette.fg2};opacity:.5;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${sage};width:${sp*2}px;opacity:0.45"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* SAGE — Research Intelligence, Distilled */
  /* Inspired by Keytail (land-book), Awwwards editorial, Evervault (godly) */

  /* Color — warm parchment + sage signal system */
  --color-bg:        ${bg};         /* warm parchment — editorial notebook */
  --color-surface:   #FFFFFF;        /* pure white card surfaces */
  --color-surface-2: #EFF0EB;        /* slightly warm off-white */
  --color-surface-3: #E6E4DC;        /* warm light border fill */
  --color-border:    ${border};      /* warm hairline border */
  --color-fg:        ${fg};          /* near-black warm ink */
  --color-fg-2:      #6B6860;        /* medium warm grey */
  --color-fg-3:      #B8B5AE;        /* light warm grey */
  --color-sage:      ${sage};        /* sage green — primary accent, action, confidence */
  --color-amber:     ${meta.palette.amber};   /* amber — saved/bookmarked, secondary */
  --color-blue:      ${meta.palette.blue};    /* deep blue — source type classification */
  --color-red:       ${meta.palette.red};     /* muted terracotta — error/critical */

  /* Typography — editorial weight contrast system */
  --font-family:     -apple-system, 'SF Pro Display', 'Inter', system-ui, sans-serif;
  --font-display:    900 clamp(42px, 8vw, 64px) / 1 var(--font-family);   /* confidence, week-hero */
  --font-hero:       800 clamp(20px, 4vw, 26px) / 1.2 var(--font-family); /* screen titles */
  --font-heading:    600 15px / 1.4 var(--font-family);
  --font-body:       400 11px / 1.6 var(--font-family);
  --font-label:      700 8px / 1 var(--font-family);                       /* letter-spacing: 1.5px */

  /* Spacing — 8px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 12px;  --radius-lg: 14px;  --radius-pill: 9999px;
}`;

  const shareText = encodeURIComponent(`SAGE — AI research intelligence, distilled. Light-theme parchment + sage green. 5 screens designed by RAM. Inspired by Keytail + Awwwards Mar 2026 editorial trend.`);
  const penB64 = Buffer.from(JSON.stringify(penJson)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SAGE — Research Intelligence · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};color:${fg};font-family:-apple-system,'SF Pro Display','Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${fg}}
  .nav-id{font-size:9px;color:${sage};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${sage};margin-bottom:16px}
  h1{font-size:clamp(64px,12vw,112px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:16px;color:${fg}}
  .sub{font-size:15px;color:${meta.palette.fg2};max-width:540px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${meta.palette.fg2};opacity:.6;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${sage};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px;transition:all .15s}
  .btn-p{background:${sage};color:#fff}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${sage}88}
  .btn-c{background:transparent;color:${sage};border:1px solid ${sage}44}
  .btn-mock{background:${sage}18;color:${sage};border:1px solid ${sage}55;font-weight:700}
  .btn-mock:hover{background:${sage}28}
  .btn-x{background:#000;color:#fff;border:none}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${sage};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${sage}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface2};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${sage}22;border:1px solid ${sage}44;color:${sage};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${sage}33}
  .prompt-section{padding:40px;border-top:1px solid ${border};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${sage};margin-bottom:10px}
  .p-text{font-size:14px;color:${meta.palette.fg2};font-style:italic;max-width:640px;line-height:1.75;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${sage};margin:24px 0 8px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${meta.palette.fg2};line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${fg}}
  footer{padding:24px 40px;border-top:1px solid ${border};font-size:10px;color:${meta.palette.fg2};opacity:.5;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${sage};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · AI-RESEARCH · MARCH 2026 · LIGHT THEME</div>
  <h1>SAGE</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>KEYTAIL — LAND-BOOK.COM</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#4B7A5E + #F6F3EE</strong></div>
    <div class="meta-item"><span>TREND</span><strong>WARM PARCHMENT AI TOOLS</strong></div>
    <div class="meta-item"><span>THEME</span><strong>LIGHT</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/sage-mock" target="_blank">✦ Try Interactive Mock ☀◑</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-c" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN THUMBNAILS — 5 MOBILE SCREENS · WARM PARCHMENT LIGHT THEME</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${meta.palette.fg2};opacity:.6;margin-bottom:16px">COLOR PALETTE — WARM PARCHMENT + SAGE SIGNAL SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;color:${meta.palette.fg2};opacity:.6;margin-bottom:16px">SPACING SCALE — 8PX BASE GRID</div>
        ${spacingHTML}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${meta.palette.fg2};opacity:.6;margin-bottom:16px">TYPE SCALE — EDITORIAL WEIGHT CONTRAST SYSTEM</div>
      ${typeScaleHTML}
    </div>
  </div>

  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;color:${meta.palette.fg2};opacity:.6;margin-bottom:4px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g, '<br>')}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  ${prd.markdown
    .replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h3 style="letter-spacing:1px;font-size:8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/(?<![>])\n/g, ' ')}
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · MARCH 2026</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  const PEN_DATA = "${penB64}";

  function downloadPen() {
    const blob = new Blob([atob(PEN_DATA)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'sage.pen'; a.click();
  }
  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
  }
  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied ✓'));
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
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SAGE Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue update ────────────────────────────────────────────────────────
async function updateGalleryQueue(newEntry) {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ SAGE Design Discovery Pipeline ══\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'sage.pen'), 'utf8'));
  console.log(`✓ Loaded sage.pen (${penJson.children.length} screens)`);

  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML built (${(heroHTML.length/1024).toFixed(1)}kb)`);

  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML built (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroResult = await publishToZenbin(SLUG, `SAGE — Research Intelligence · RAM Design Studio`, heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) {
    console.log(`  ✓ Live at https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`  Response: ${heroResult.body.slice(0, 200)}`);
  }

  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'SAGE Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) {
    console.log(`  ✓ Live at https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.log(`  Response: ${viewerResult.body.slice(0, 200)}`);
  }

  // Gallery queue entry
  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/sage-mock`,
    submitted_at: sub.submitted_at,
    published_at: sub.published_at,
    credit:       sub.credit,
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  console.log('\nUpdating gallery queue...');
  const queueResult = await updateGalleryQueue(newEntry);
  console.log(`  Status: ${queueResult.status}`);
  if (queueResult.status === 200) {
    console.log('  ✓ Gallery queue updated');
  } else {
    console.log(`  Response: ${queueResult.body.slice(0, 200)}`);
  }

  // Write entry to local file for DB indexing
  fs.writeFileSync(path.join(__dirname, 'sage-entry.json'), JSON.stringify(newEntry, null, 2));
  console.log('  ✓ Entry saved to sage-entry.json');

  console.log('\n══ Pipeline complete ══');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/sage-mock`);
})();
