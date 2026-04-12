#!/usr/bin/env node
// publish-pura.js — Full Design Discovery pipeline for PURA
// Heartbeat #12 — warm-minimal skincare ritual tracker
// Inspired by Aevi Skincare (liveaevi.com) editorial aesthetic

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── PURA metadata ─────────────────────────────────────────────────────────────
const sub = {
  id:           'hb-pura-1773970000000',
  prompt:       'A skincare ritual tracker and ingredient analyser — warm off-white editorial aesthetic inspired by Aevi Skincare. Track daily routines (morning + evening), log skin condition, analyse ingredient conflicts, and chart 28-day skin progress. Clean, ultra-light typography, hairline borders, botanical colour accents.',
  app_type:     'health',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const meta = {
  appName:   'PURA',
  tagline:   'Your skin, ritualised.',
  archetype: 'health',
  screens:   10,
  palette: {
    bg:      '#F7F3EE',   // warm off-white (Aevi-inspired)
    fg:      '#1C1917',   // near-black warm
    accent:  '#2A4ABB',   // muted indigo
    accent2: '#7A9B84',   // botanical sage
  },
};

const prdMarkdown = `
## Overview

PURA is a skincare ritual tracker and ingredient analyser for the intentional beauty consumer. It turns a fragmented collection of products into a coherent, evolving routine — tracking adherence, flagging ingredient conflicts, logging skin condition, and building a 28-day visual progress journal.

The design language is directly counter-programmed against the dark, high-contrast tech aesthetic that saturates the design gallery right now. PURA is warm, editorial, and unhurried — drawing from Aevi Skincare's refined off-white surfaces and Canela-Light / Matter-Light typographic restraint.

## Target Users

- **Intentional beauty consumers** — 25–40, already investing in a multi-step routine, want the rigour of tracking without clinical coldness
- **Skincare beginners** — building a first routine, need guidance on ingredient safety and ordering
- **Ingredient-aware shoppers** — want to know what they're applying, whether it conflicts, and what the evidence says

## Core Features

- **Ritual dashboard** — morning/evening progress rings, today's next step, quick condition log, product quick-access
- **Step-by-step ritual flow** — timed step guide with product notes, skip support, and animated timer
- **Skin condition log** — how-does-your-skin-feel selector with face-map concern areas and free-text notes
- **Ingredient analyser** — all ingredients across all products, safety ratings, conflict detection, per-ingredient detail
- **28-day progress** — streak tracking, multi-metric sparklines (hydration, clarity), side-by-side photo diary

## Design Language

**Warm minimal** — background is warm off-white #F7F3EE (not pure white, not grey — the warmth matters). Surfaces use #EDE8DF cream. Rules are hairline at 40% opacity. Nothing is heavy.

**300 weight throughout** — body text, labels, values — all at font-weight 300. The one exception: active states and labels step up to 400–500. This creates a featherlight reading texture that reads as editorial rather than functional.

**Three accent colours, one each** — muted indigo #2A4ABB for primary action and morning data, warm rose #C4907A for evening and concern, botanical sage #7A9B84 for progress and improvement. No colour is used decoratively — each is semantic.

**Progress rings not bars** — circular progress for routine completion creates a more tactile, ritual-feeling metric than a linear bar. The ring at 75% reads as "almost there" in a way a bar doesn't.

## Design Principles

1. Lightness before density — every element earns its weight at 300
2. Warmth is not softness — the off-white palette is calm but the information is precise
3. Ritual implies sequence — every screen honours the order of a routine

## Key Screens

1. **Mobile Home** — daily rings (morning/evening/weekly), next step card, condition quick-log, recent products
2. **Mobile Ritual** — step-by-step routine with timer, progress bar, and active step highlight
3. **Mobile Log** — condition picker, face-map concern areas, free-text notes
4. **Mobile Library** — product catalogue with filter chips and editorial list cards
5. **Mobile Progress** — 4-week adherence chart, streak stats, photo diary strip, improvement pills
6. **Desktop Dashboard** — bento-style overview: stat cards, adherence chart, upcoming ritual card, restock alerts, log summary, photo strip
7. **Desktop Routine Builder** — step list with drag handles + product detail panel
8. **Desktop Ingredient Analysis** — searchable ingredient list with safety ratings + conflict detection panel
9. **Desktop Progress Analytics** — photo timeline, sparkline chart, streak bento, improvement callout row
10. **Desktop Discovery** — personalised product recommendations grid with match scores
`;

// ── Utilities (shared with process-zenbin-queue.js) ───────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';

  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids) return bg;
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w/2, ry = h/2;
    return `<ellipse cx="${x+rx}" cy="${y+ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    return `<rect x="${x}" y="${y + (h-fh)/2}" width="${w}" height="${fh}" fill="${fill}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill||'#F7F3EE'}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- \*\*(.+?)\*\*: (.+)$/gm, '<li><strong>$1</strong>: $2</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/<li>/g, '<ul><li>').replace(/<\/li>\n(?!<li>)/g, '</li></ul>')
    .replace(/<\/li>\n<ul>/g, '</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup])/gm, '<p>').replace(/<p><\/p>/g, '');
}

function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111111').replace('#',''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}

// ── ZenBin publisher ──────────────────────────────────────────────────────────
function zenPost(slug, title, html, subdomain) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (subdomain) headers['X-Subdomain'] = subdomain;
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers,
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero page builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJsonStr) {
  const screens = doc.children || [];
  const surface = '#EDE8DF';
  const border  = '#D8D2C8';
  const muted   = '#7A7068';

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const labels = ['Home', 'Ritual', 'Log', 'Library', 'Progress',
                    'Dashboard', 'Routine', 'Ingredients', 'Analytics', 'Discover'];
    const label = `${isMobile ? 'M' : 'D'} · ${labels[i] || (isMobile ? 'MOBILE' : 'DESKTOP')}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // PURA-specific palette swatches — actual design colors
  const swatches = [
    { hex: '#F7F3EE', role: 'BACKGROUND' },
    { hex: '#EDE8DF', role: 'SURFACE'    },
    { hex: '#1C1917', role: 'INK'        },
    { hex: '#2A4ABB', role: 'INDIGO'     },
    { hex: '#7A9B84', role: 'SAGE'       },
    { hex: '#C4907A', role: 'ROSE'       },
    { hex: '#7A7068', role: 'STONE'      },
    { hex: '#D8D2C8', role: 'RULE'       },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:56px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:600;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* PURA — Warm Minimal Skincare · RAM Heartbeat #12 */

  /* Color — warm editorial palette */
  --color-bg:       #F7F3EE;   /* warm off-white, not pure white */
  --color-surface:  #EDE8DF;   /* card / surface cream */
  --color-rule:     #D8D2C8;   /* hairline border @ 40% opacity */
  --color-ink:      #1C1917;   /* warm near-black */
  --color-stone:    #7A7068;   /* secondary text */
  --color-dust:     #B5AFA7;   /* tertiary / placeholder */
  --color-indigo:   #2A4ABB;   /* primary — morning data & action */
  --color-sage:     #7A9B84;   /* progress & improvement */
  --color-rose:     #C4907A;   /* evening & concern */
  --color-slate:    #8BA5C4;   /* secondary data */

  /* Typography — ultra-light editorial */
  --font-family:  'Matter', 'Inter', system-ui, sans-serif;
  --font-display: 300 clamp(32px, 5vw, 64px) / 1.1 var(--font-family);
  --font-heading: 400 18px / 1.4 var(--font-family);
  --font-body:    300 14px / 1.7 var(--font-family);
  --font-caption: 300 10px / 1   var(--font-family);
  --font-label:   300 9px  / 1   var(--font-family);

  /* Weight scale — minimal range */
  --weight-thin:   300;   /* default — everything */
  --weight-normal: 400;   /* active states */
  --weight-medium: 500;   /* labels, strong emphasis */

  /* Spacing (4px base grid) */
  --space-1: 4px;  --space-2: 8px;   --space-3: 16px;
  --space-4: 24px; --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius — gentle, not pill */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;

  /* Rules — hairline only */
  --rule-width: 1px;
  --rule-color: rgba(216, 210, 200, 0.4);
}`;

  const designPrinciples = [
    'Lightness before density — every element earns its weight at 300. If it can be lighter, it should be.',
    'Warmth is not softness — the off-white palette is calm, but the information is precise. No rounding of reality.',
    'Ritual implies sequence — every screen respects the temporal order of a skincare routine. No jumping ahead.',
    'One colour per signal — indigo for morning, rose for evening, sage for progress. Never decorative.',
  ];

  const encoded = Buffer.from(penJsonStr).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PURA — Skincare Ritual Tracker · RAM Design Studio</title>
<meta name="description" content="Warm-minimal skincare ritual tracker. Your skin, ritualised. 10 screens + brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#F7F3EE;color:#1C1917;font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid #D8D2C8;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .logo{font-size:14px;font-weight:700;letter-spacing:4px;color:#7A7068}
  .nav-right{display:flex;align-items:center;gap:20px}
  .nav-id{font-size:11px;color:#B5AFA7;letter-spacing:1px}
  .hb-badge{font-size:9px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:4px;background:#2A4ABB15;color:#2A4ABB;border:1px solid #2A4ABB33}
  .hero{padding:80px 40px 40px;max-width:900px}
  .tag{font-size:10px;letter-spacing:3px;color:#2A4ABB;margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(48px,8vw,88px);font-weight:300;letter-spacing:-2px;line-height:1.05;margin-bottom:16px;color:#1C1917}
  .sub{font-size:16px;opacity:.55;max-width:440px;line-height:1.7;margin-bottom:32px;font-weight:300}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:#2A4ABB}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px}
  .btn-p{background:#2A4ABB;color:#F7F3EE}
  .btn-p:hover{opacity:0.88}
  .btn-s{background:transparent;color:#1C1917;border:1px solid #D8D2C8}
  .btn-s:hover{border-color:#2A4ABB44}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:#2A4ABB;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid #D8D2C8}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:#2A4ABB33;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid #D8D2C8;max-width:1000px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .type-row{padding:14px 0;border-bottom:1px solid #D8D2C8}
  .tokens-block{background:#EDE8DF;border:1px solid #D8D2C8;border-radius:8px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#1C1917;opacity:0.65;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:#2A4ABB15;border:1px solid #2A4ABB33;color:#2A4ABB;font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .prd-section{padding:40px;border-top:1px solid #D8D2C8;max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:#2A4ABB;margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.6;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#1C1917}
  .insp-section{padding:40px;border-top:1px solid #D8D2C8;max-width:900px}
  .insp-label{font-size:10px;letter-spacing:2px;color:#2A4ABB;margin-bottom:16px}
  .insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .insp-card{background:#EDE8DF;border-radius:8px;padding:16px 20px}
  .insp-site{font-size:9px;letter-spacing:1.5px;color:#B5AFA7;margin-bottom:6px}
  .insp-note{font-size:12px;color:#7A7068;line-height:1.6}
  footer{padding:28px 40px;border-top:1px solid #D8D2C8;font-size:11px;opacity:.4;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:#2A4ABB;color:#F7F3EE;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-right">
    <div class="hb-badge">HEARTBEAT #12 · HEALTH</div>
    <div class="nav-id">${sub.id}</div>
  </div>
</nav>

<section class="hero">
  <div class="tag">WARM MINIMAL · HEALTH · SKINCARE · ${new Date(sub.submitted_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>PURA</h1>
  <p class="sub">${meta.tagline} A skincare ritual tracker with an editorial editorial warmth — ultra-light typography, hairline borders, and a botanical palette for the intentional beauty consumer.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>WEIGHT</span><strong>300 THROUGHOUT</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>HEALTH / WELLNESS</strong></div>
    <div class="meta-item"><span>INSPIRATION</span><strong>AEVI SKINCARE (LAND-BOOK)</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyTokens()">⌘ Copy CSS Tokens</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/feedback?design=pura">↺ Request Refactor</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE + 5 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE — 8 ROLES</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE · 300 WEIGHT DEFAULT</div>
      ${[
        { label:'DISPLAY',  size:'clamp(32px,5vw,64px)', weight:'300', sample:'PURA' },
        { label:'HEADING',  size:'18px',  weight:'400', sample: 'Your skin, ritualised.' },
        { label:'BODY',     size:'14px',  weight:'300', sample: 'Track your morning routine, log your skin condition.' },
        { label:'CAPTION',  size:'10px',  weight:'300', sample: 'MORNING RITUAL · STEP 3 OF 7' },
        { label:'LABEL',    size:'9px',   weight:'300', sample: 'HYDRATION · CONDITION · STREAK' },
      ].map(t => `<div class="type-row">
        <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
        <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:#1C1917;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
      </div>`).join('')}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${designPrinciples.map((p,i) => `<div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start">
        <div style="color:#2A4ABB;font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i+1).padStart(2,'0')}</div>
        <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING · 4PX BASE GRID</div>
      ${[4,8,16,24,32,48,64].map(sp => `<div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
        <div style="font-size:10px;opacity:.35;width:32px;flex-shrink:0">${sp}px</div>
        <div style="height:6px;border-radius:3px;background:#2A4ABB;width:${sp*2}px;opacity:0.5"></div>
      </div>`).join('')}
    </div>

  </div>

  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="insp-section">
  <div class="section-label">RESEARCH SOURCES</div>
  <div class="insp-grid">
    <div class="insp-card">
      <div class="insp-site">LIVEAEVI.COM — LAND-BOOK</div>
      <p class="insp-note">Primary palette reference. Warm off-white #F7F3EE, cool blue #264EBB, ultra-light Matter-Light / Canela-Light at 300 weight. The clearest example of warm-minimal in production.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">GODLY.WEBSITE / SAVOIRFAIRE.NYC</div>
      <p class="insp-note">Counter-reference. Showed what NOT to do — the neon lime + black editorial agency aesthetic is everywhere. PURA deliberately goes the opposite direction: warm, calm, unhurried.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">LAND-BOOK.COM / POLAR.SH</div>
      <p class="insp-note">Bento-grid feature layout for the desktop dashboard. Asymmetric 2×2 / 3×2 card grids are the dominant layout pattern of 2026 — PURA implements this in the dashboard bento layout.</p>
    </div>
  </div>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${mdToHtml(prdMarkdown)}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #12 · Warm Minimal · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
  <a href="https://ram.zenbin.org/" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org</a>
</footer>

<script>
const D=${JSON.stringify(encoded)};
const CSS_TOKENS=${JSON.stringify(cssTokens)};
const PROMPT=${JSON.stringify(sub.prompt)};

function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;
  t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);
}
function openInViewer(){
  try{
    const jsonStr=atob(D);JSON.parse(jsonStr);
    localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'pura.pen'}));
    window.open('https://zenbin.org/p/pen-viewer-3','_blank');
  }catch(e){alert('Could not load pen: '+e.message);}
}
function downloadPen(){
  try{
    const blob=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download='pura.pen';a.click();URL.revokeObjectURL(a.href);
  }catch(e){alert('Download failed: '+e.message);}
}
function copyTokens(){
  navigator.clipboard.writeText(CSS_TOKENS).then(()=>toast('CSS tokens copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=CSS_TOKENS;
    document.body.appendChild(ta);ta.select();document.execCommand('copy');
    document.body.removeChild(ta);toast('CSS tokens copied ✓');
  });
}
<\/script>
</body>
</html>`;
}

// ── Viewer page builder ───────────────────────────────────────────────────────
function buildViewerHTML(penJsonStr) {
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌿 PURA — Full Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const penPath = path.join(__dirname, 'pura.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ pura.pen not found — run pura-app.js first');
    process.exit(1);
  }

  const penJsonStr = fs.readFileSync(penPath, 'utf8');
  const doc        = JSON.parse(penJsonStr);
  console.log(`✓ Loaded pura.pen — ${(doc.children||[]).length} screens`);

  // Hero page
  console.log('\n📤 Publishing hero → ram.zenbin.org/pura...');
  const heroHtml = buildHeroHTML(doc, penJsonStr);
  const heroRes  = await zenPost('pura', 'PURA — Skincare Ritual Tracker · RAM Design Studio', heroHtml, 'ram');
  console.log(`  HTTP ${heroRes.status} — ${heroRes.status === 200 || heroRes.status === 201 ? '✅ Published' : '❌ Failed'}`);
  const heroUrl  = 'https://ram.zenbin.org/pura';

  // Viewer page
  console.log('\n📤 Publishing viewer → ram.zenbin.org/pura-viewer...');
  const viewerHtml = buildViewerHTML(penJsonStr);
  const viewerRes  = await zenPost('pura-viewer', 'PURA Viewer', viewerHtml, 'ram');
  console.log(`  HTTP ${viewerRes.status} — ${viewerRes.status === 200 || viewerRes.status === 201 ? '✅ Published' : '❌ Failed'}`);

  console.log(`\n✅ PURA live:`);
  console.log(`   Hero:   ${heroUrl}`);
  console.log(`   Viewer: https://ram.zenbin.org/pura-viewer`);

  // Push to gallery registry on GitHub
  const CONFIG_PATH = path.join(__dirname, 'community-config.json');
  let config = {};
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch {}
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN || config.GITHUB_TOKEN || '';
  const GITHUB_REPO  = process.env.GITHUB_REPO  || config.GITHUB_REPO  || '';

  if (GITHUB_TOKEN && GITHUB_REPO) {
    console.log('\n📋 Updating gallery registry...');
    try {
      const { https: httpsLib } = require('https');
      const getRes = await new Promise((resolve, reject) => {
        const req = require('https').request({
          hostname: 'api.github.com',
          path: `/repos/${GITHUB_REPO}/contents/queue.json`,
          headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-studio/1.0', 'Accept': 'application/vnd.github.v3+json' },
        }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
        req.on('error', reject); req.end();
      });
      if (getRes.status === 200) {
        const fileData   = JSON.parse(getRes.body);
        const queue      = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
        const puraEntry  = {
          id: sub.id, prompt: sub.prompt, app_type: 'health', credit: 'RAM Studio',
          submitted_at: sub.submitted_at, status: 'done',
          app_name: 'PURA', archetype: 'health',
          design_url: heroUrl, viewer_url: 'https://ram.zenbin.org/pura-viewer',
          published_at: new Date().toISOString(),
        };
        const existing = (queue.submissions||[]).findIndex(s=>s.id===sub.id);
        if (existing >= 0) queue.submissions[existing] = puraEntry;
        else (queue.submissions = queue.submissions || []).push(puraEntry);
        queue.updated_at = new Date().toISOString();

        const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
        const putBody = JSON.stringify({ message: 'heartbeat: PURA — warm minimal skincare', content, sha: fileData.sha });
        const putRes = await new Promise((resolve, reject) => {
          const req = require('https').request({
            hostname: 'api.github.com',
            path: `/repos/${GITHUB_REPO}/contents/queue.json`,
            method: 'PUT',
            headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-studio/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
          }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
          req.on('error', reject); req.write(putBody); req.end();
        });
        console.log(`  Gallery registry: HTTP ${putRes.status} ${putRes.status === 200 ? '✅' : '❌'}`);
      }
    } catch (err) {
      console.warn(`  ⚠ Gallery update skipped: ${err.message}`);
    }
  } else {
    console.log('  (No GitHub token — gallery registry not updated)');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Done.');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
