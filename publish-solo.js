'use strict';
// publish-solo.js — Full Design Discovery Pipeline for SOLO
// SOLO — AI Expense Intelligence for Independents
// Designed by RAM Design AI · Mar 21, 2026

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE || 'queue.json';

const SLUG        = 'solo';
const VIEWER_SLUG = 'solo-viewer';

// ── Submission metadata ────────────────────────────────────────────────────────
const sub = {
  id:           'hb-solo-' + Date.now(),
  prompt:       'Design a dark-mode AI expense intelligence app for independent professionals, merging Atlas Card\'s (atlascard.com) pure-black ultra-minimalism with Obsidian\'s (obsidianos.com) neon lime green data accent. Inspired by Midday.ai\'s "For the new wave of one-person companies" narrative. 5 mobile screens (Home, Insights, Budget, Invoices, AI Report) + 2 desktop screens (Dashboard, Analytics). Pure black base · neon lime data · electric blue interactions.',
  app_type:     'finance',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const meta = {
  appName:   'SOLO',
  tagline:   'AI Expense Intelligence for Independents.',
  archetype: 'finance',
  screens:   7,
  palette: {
    bg:      '#050507',
    fg:      '#F0F0FF',
    accent:  '#5EFF6B',
    accent2: '#6080FF',
  },
};

// ── Full PRD ──────────────────────────────────────────────────────────────────
const prdMarkdown = `
## Overview

SOLO is an AI-powered expense intelligence app built for the new wave of independent professionals — freelancers, solo founders, and one-person companies. It combines Atlas Card's iconic pure-black aesthetic with Obsidian OS's electric neon-lime data layer to create a financial tool that feels precise, professional, and alive.

The core thesis: independent workers don't need another budgeting app. They need an intelligent layer between their transactions and their invoices — something that quietly matches, flags, and explains their financial reality so they can focus on their work.

## Target Users

- **Freelancers and consultants** — multiple clients, irregular income, business + personal expense mixing
- **Solo founders** — early-stage builders who need financial clarity without a CFO
- **Digital nomads and independents** — globally distributed, multi-currency, subscription-heavy

## Core Features

- **Transaction Feed** — unified view of all accounts with real-time AI categorization and merchant enrichment
- **Spending Insights** — donut chart breakdown by category, month-over-month comparison, budget progress
- **Budget Tracker** — per-category monthly budgets with real-time progress bars and overspend alerts
- **Invoice Matcher** — AI-powered expense-to-invoice linking that automatically matches transactions to client invoices
- **AI Weekly Report** — health score (0–100), daily spend chart, anomaly detection, and plain-English observations
- **Desktop Dashboard** — 4-KPI command strip, daily bar chart, category split, real-time AI digest
- **Expense Analytics** — quarterly grouped bar chart, category splits, top merchant ranking, full transaction table

## Design Language

**Pure black base (#050507)** — Every surface starts from near-void dark, inspired by Atlas Card's radical minimalism. No warm grays, no blue-blacks. Just void.

**Neon lime accent (#5EFF6B)** — The single source of truth: positive data, AI outputs, and active states all glow lime. Inspired by Obsidian OS's electric green data layer. The accent only fires when there's something meaningful to say.

**Electric blue (#6080FF)** — Used exclusively for interactive elements (navigation, links, progress) — never for financial data. Keeps the information hierarchy sharp.

**Data-first typography** — Heavy numerals (weight 900) for all financial figures. Labels use tight letter-spacing and lowercase weights (700 for labels, 400 for secondary). No decorative type.

**Zero decoration principle** — No gradients, no drop shadows, no glassmorphism. The only "ambient" element is a 2px neon lime bar at the top of every screen — a signature so subtle it reads as structural, not decorative.

## Screen Architecture

1. **M1: Home / Transaction Feed** — Balance hero, 3-stat strip, AI insight banner, scrollable transaction list with category icons
2. **M2: Spending Insights** — Donut ring visualization, per-category progress bars with emoji icons
3. **M3: Budget Tracker** — Month selector tabs, overview card, per-category budget bars with overspend state
4. **M4: Invoice Matcher** — Matched/Pending/Unlinked stats, AI suggestion card, invoice list with match counts
5. **M5: AI Weekly Report** — Health score card, daily bar chart, observation cards with sentiment tags
6. **D1: Desktop Dashboard** — 4-KPI strip, 21-day bar chart, category split, recent transactions table, AI digest
7. **D2: Expense Analytics** — Period tabs, 5-KPI strip, grouped monthly chart, Q1 category split, top transactions table
`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const buf = body ? Buffer.from(body) : null;
    if (buf) opts.headers = { ...opts.headers, 'Content-Length': buf.length };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (buf) r.write(buf);
    r.end();
  });
}
const post = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'POST', headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const put_ = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'PUT',  headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const get_ = (host, p, hdrs = {})       => httpsReq({ hostname: host, path: p, method: 'GET',  headers: { 'User-Agent': 'design-studio-agent/1.0', ...hdrs } });

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderEl(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0, w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = typeof el.fill === 'string' ? el.fill : 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';
  if (el.type === 'frame') {
    const bg   = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderEl(c, depth + 1)).join('');
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'ellipse') {
    const ef = typeof fill === 'string' && fill !== 'transparent' ? fill : meta.palette.accent;
    return `<ellipse cx="${x + w/2}" cy="${y + h/2}" rx="${w/2}" ry="${h/2}" fill="${ef}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : meta.palette.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${Math.round(w * 0.85)}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}
const screenThumbSVG = (s, tw, th) => {
  const kids = (s.children || []).map(c => renderEl(c, 0)).join('');
  const bg = typeof s.fill === 'string' ? s.fill : meta.palette.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${s.width}" height="${s.height}" fill="${bg}"/>${kids}</svg>`;
};

// ── Color helpers ─────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111').replace('#',''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2,'0')).join('');
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm,  '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:11px;letter-spacing:1.5px;opacity:.5;margin:20px 0 8px;font-weight:700">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#0C0E1F;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#6080FF">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = lightenHex(meta.palette.bg, 12);
  const border  = lightenHex(meta.palette.bg, 26);
  const THUMB_H = 200;

  // Screen thumbnails
  const thumbsHTML = screens.map((s, i) => {
    const isMobile = s.width < 500;
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const screenNames = ['HOME', 'INSIGHTS', 'BUDGET', 'INVOICES', 'AI REPORT', 'DASHBOARD', 'ANALYTICS'];
    const label = `${isMobile ? 'M' : 'D'} · ${screenNames[i] || (isMobile ? 'MOBILE' : 'DESKTOP') + ' ' + (i+1)}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: meta.palette.bg,      role: 'BACKGROUND' },
    { hex: surface,              role: 'SURFACE'    },
    { hex: meta.palette.fg,      role: 'FOREGROUND' },
    { hex: meta.palette.accent,  role: 'LIME PRIMARY' },
    { hex: meta.palette.accent2, role: 'BLUE SECONDARY' },
    { hex: '#FF4560',            role: 'DANGER'     },
    { hex: '#FFB830',            role: 'WARNING'    },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:76px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.45;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  // Type scale
  const typeScale = [
    { label:'DISPLAY',   size:'48px', weight:'900', sample: 'SOLO'      },
    { label:'HEADING',   size:'22px', weight:'700', sample: 'Dashboard' },
    { label:'SUBHEAD',   size:'14px', weight:'700', sample: 'CATEGORY SPLIT' },
    { label:'BODY',      size:'12px', weight:'400', sample: 'Transaction feed item' },
    { label:'CAPTION',   size:'9px',  weight:'700', sample: 'LABEL · UPPERCASE' },
  ].map(t => `
    <div style="display:flex;align-items:baseline;gap:16px;padding:10px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;width:72px;flex-shrink:0">${t.label}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};color:${meta.palette.fg};line-height:1.2">${t.sample}</div>
      <div style="font-size:9px;opacity:.35;margin-left:auto;white-space:nowrap">${t.size} / ${t.weight}</div>
    </div>`).join('');

  // CSS design tokens
  const cssTokens = `/* SOLO Design Tokens — AI Expense Intelligence */
:root {
  /* Background layers */
  --solo-bg:         ${meta.palette.bg};   /* Pure near-black void */
  --solo-surface:    ${surface};           /* Elevated surface */
  --solo-card:       #111117;              /* Card background */
  --solo-card-alt:   #0E0E14;             /* Alt card */

  /* Borders */
  --solo-border:     #1C1C24;             /* Subtle border */
  --solo-border-2:   #282832;             /* Strong border */
  --solo-muted:      #3A3A48;             /* Muted UI elements */

  /* Foreground */
  --solo-fg:         ${meta.palette.fg};   /* Primary text — cool white */
  --solo-fg-2:       #7878A0;             /* Secondary text */
  --solo-fg-3:       #3C3C52;             /* Dimmed text */

  /* Accents */
  --solo-lime:       ${meta.palette.accent};  /* Neon lime — positive / AI */
  --solo-lime-2:     #A8FFB0;             /* Lime highlight */
  --solo-lime-3:     #1DB827;             /* Lime dark */
  --solo-blue:       #1A3BFF;             /* Electric blue — interaction */
  --solo-blue-2:     ${meta.palette.accent2}; /* Blue secondary */

  /* Semantic */
  --solo-danger:     #FF4560;             /* Overspend / negative */
  --solo-danger-2:   #FF8093;             /* Soft danger */
  --solo-warning:    #FFB830;             /* Pending / alert */

  /* Spacing */
  --solo-pad-s:  12px;
  --solo-pad-m:  20px;
  --solo-pad-l:  32px;

  /* Radius */
  --solo-r-s:    6px;
  --solo-r-m:    10px;
  --solo-r-l:    14px;
}`;

  const shareText = encodeURIComponent('SOLO — AI Expense Intelligence for Independents. Pure black + neon lime dark fintech. 7 screens. Built by RAM Design AI.');
  const heroUrl = `https://ram.zenbin.org/${SLUG}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SOLO — AI Expense Intelligence · RAM Design Studio</title>
<meta name="description" content="AI Expense Intelligence for Independents. Pure black + neon lime dark fintech. 7 screens + full brand spec + CSS tokens. Designed by RAM Design AI.">
<meta property="og:title" content="SOLO — AI Expense Intelligence for Independents">
<meta property="og:description" content="Pure black + neon lime. 7 screens. Atlas Card meets Obsidian. Designed by RAM Design AI.">
<meta name="twitter:card" content="summary_large_image">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${meta.palette.bg};--surface:${surface};--border:${border};
    --fg:${meta.palette.fg};--accent:${meta.palette.accent};--accent2:${meta.palette.accent2};
    --red:#FF4560;--amber:#FFB830;
  }
  html{background:var(--bg);color:var(--fg);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter',sans-serif;font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}
  body{min-height:100vh;background:var(--bg)}

  /* Lime top bar */
  .top-bar{height:2px;background:var(--accent);opacity:.9;position:fixed;top:0;left:0;right:0;z-index:100}

  .hero{padding:80px 48px 56px;max-width:1200px;margin:0 auto}
  .app-label{font-size:10px;letter-spacing:3px;opacity:.4;margin-bottom:20px;font-weight:700}
  .app-name{font-size:clamp(56px,8vw,96px);font-weight:900;letter-spacing:-3px;line-height:1;color:#fff;margin-bottom:16px}
  .app-tagline{font-size:clamp(18px,2.5vw,26px);font-weight:300;opacity:.6;letter-spacing:0.5px;margin-bottom:32px}
  .hero-meta{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:40px}
  .badge{font-size:9px;font-weight:700;letter-spacing:2px;padding:5px 12px;border-radius:4px;border:1px solid var(--border)}
  .badge-lime{border-color:var(--accent);color:var(--accent);background:${meta.palette.accent}15}
  .badge-blue{border-color:var(--accent2);color:var(--accent2);background:${meta.palette.accent2}12}
  .btns{display:flex;gap:10px;flex-wrap:wrap}
  .btn{font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;cursor:pointer;text-decoration:none;border:none;display:inline-flex;align-items:center;gap:6px;transition:opacity .15s}
  .btn:hover{opacity:.8}
  .btn-primary{background:var(--accent);color:#000}
  .btn-outline{background:transparent;border:1px solid var(--border);color:var(--fg)}
  .btn-blue{background:var(--accent2);color:#fff}
  .btn-s{font-size:10px;padding:7px 14px;border-radius:6px}

  /* Sections */
  section{padding:48px 48px;max-width:1200px;margin:0 auto;border-top:1px solid var(--border)}
  .section-label{font-size:9px;letter-spacing:3px;opacity:.35;font-weight:700;margin-bottom:28px}

  /* Screens strip */
  .preview{overflow:hidden}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:16px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}

  /* Brand spec */
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px}
  .palette{display:flex;gap:12px;flex-wrap:wrap}
  .type-scale{border:1px solid var(--border);border-radius:10px;padding:16px;background:var(--surface)}
  .principles{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:24px}
  .principle-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px}
  .principle-title{font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--accent);margin-bottom:8px}
  .principle-body{font-size:12px;opacity:.6;line-height:1.7}

  /* Tokens */
  .tokens-block{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;position:relative;margin-top:24px}
  .tokens-pre{font-size:11px;line-height:1.7;opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code','Consolas',monospace;color:var(--fg)}
  .copy-btn{position:absolute;top:12px;right:12px;font-size:9px;font-weight:700;letter-spacing:1.5px;padding:6px 12px;background:transparent;border:1px solid var(--border);color:var(--fg);border-radius:6px;cursor:pointer;transition:border-color .15s}
  .copy-btn:hover{border-color:var(--accent);color:var(--accent)}

  /* Prompt */
  .prompt-block{background:var(--surface);border-left:3px solid var(--accent);padding:24px 28px;border-radius:0 8px 8px 0;font-size:14px;line-height:1.8;font-style:italic;opacity:.8}

  /* PRD */
  .prd{font-size:13px;line-height:1.8;opacity:.75}
  .prd h3{font-size:11px;letter-spacing:2px;font-weight:700;color:var(--accent);opacity:1;margin:28px 0 10px;padding-top:20px;border-top:1px solid var(--border)}
  .prd h4{font-size:10px;letter-spacing:2px;font-weight:700;opacity:.5;margin:18px 0 6px}
  .prd ul{padding-left:20px;margin:6px 0}
  .prd li{margin:4px 0}
  .prd strong{color:var(--fg);opacity:1;font-weight:700}

  /* Footer */
  footer{padding:32px 48px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:11px;opacity:.4;max-width:1200px;margin:0 auto}

  /* Toast */
  .toast{position:fixed;bottom:24px;right:24px;background:var(--accent);color:#000;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 18px;border-radius:8px;opacity:0;transform:translateY(8px);transition:all .2s;pointer-events:none;z-index:200}
  .toast.show{opacity:1;transform:translateY(0)}

  @media(max-width:768px){
    .hero,.section{padding:48px 24px}
    .brand-grid{grid-template-columns:1fr}
    .app-name{font-size:52px}
  }
</style>
</head>
<body>
<div class="top-bar"></div>
<div class="toast" id="toast">Copied ✓</div>

<section class="hero" style="border-top:none">
  <div class="app-label">RAM DESIGN STUDIO · HEARTBEAT 2026-03-21</div>
  <div class="app-name">SOLO</div>
  <div class="app-tagline">AI Expense Intelligence for Independents.</div>
  <div class="hero-meta">
    <span class="badge badge-lime">7 SCREENS</span>
    <span class="badge badge-blue">5 MOBILE + 2 DESKTOP</span>
    <span class="badge" style="border-color:#FF4560;color:#FF4560;background:#FF456015">FINTECH</span>
    <span class="badge" style="border-color:#FFB830;color:#FFB830;background:#FFB83015">DARK MODE</span>
    <span class="badge" style="opacity:.5">MARCH 2026</span>
  </div>
  <div class="btns">
    <a class="btn btn-primary" onclick="openInViewer()" href="#">☰ Open in Viewer</a>
    <a class="btn btn-outline btn-s" onclick="downloadPen()" href="#">⤓ Download .pen</a>
    <a class="btn btn-outline btn-s" onclick="copyPrompt()" href="#">⎘ Copy Prompt</a>
    <a class="btn btn-blue btn-s" onclick="shareOnX()" href="#">✕ Share</a>
    <a class="btn btn-outline btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE + 2 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section>
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · ${swatches.length} TOKENS</div>
      <div class="palette">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">TYPE SCALE</div>
      <div class="type-scale">${typeScale}</div>
    </div>
  </div>

  <div class="principles">
    <div class="principle-card">
      <div class="principle-title">ZERO DECORATION</div>
      <div class="principle-body">No gradients, shadows, or glassmorphism. The only ambient element is the 2px lime top bar — structural, not decorative. Every pixel must carry meaning.</div>
    </div>
    <div class="principle-card">
      <div class="principle-title">LIME SPEAKS MEANING</div>
      <div class="principle-body">The neon lime accent fires only for positive financial data and AI outputs. It's never decorative. When lime appears, something good (or important) is happening.</div>
    </div>
    <div class="principle-card">
      <div class="principle-title">BLUE OWNS INTERACTION</div>
      <div class="principle-body">Electric blue is reserved exclusively for navigation and interactive elements. It never touches financial data — keeping the semantic layer clean and unambiguous.</div>
    </div>
    <div class="principle-card">
      <div class="principle-title">DATA TYPOGRAPHY</div>
      <div class="principle-body">Financial figures use weight 900 numerals. Labels use ALL-CAPS with 2px letter spacing. The type system reads like a precision instrument, not a consumer app.</div>
    </div>
  </div>

  <div class="section-label" style="margin-top:40px">CSS DESIGN TOKENS</div>
  <div class="tokens-block" id="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
  </div>
</section>

<section>
  <div class="section-label">ORIGINAL PROMPT</div>
  <div class="prompt-block">${sub.prompt}</div>
</section>

<section>
  <div class="section-label">PRODUCT BRIEF · PRD</div>
  <div class="prd">${mdToHtml(prdMarkdown)}</div>
</section>

<footer>
  <span>SOLO — AI Expense Intelligence · RAM Design Studio · March 2026</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const PEN_JSON = ${JSON.stringify(penJson)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};
const PROMPT = ${JSON.stringify(sub.prompt)};

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function openInViewer() {
  event.preventDefault();
  window.open('https://ram.zenbin.org/${VIEWER_SLUG}', '_blank');
}
function downloadPen() {
  event.preventDefault();
  const a = document.createElement('a');
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(PEN_JSON);
  a.download = 'solo.pen';
  a.click();
  showToast('Downloading solo.pen…');
}
function copyPrompt() {
  event.preventDefault();
  navigator.clipboard.writeText(PROMPT)
    .then(() => showToast('Prompt copied ✓'))
    .catch(() => { const ta = document.createElement('textarea'); ta.value = PROMPT; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast('Prompt copied ✓'); });
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(() => showToast('CSS tokens copied ✓'))
    .catch(() => { const ta = document.createElement('textarea'); ta.value = CSS_TOKENS; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast('CSS tokens copied ✓'); });
}
function shareOnX() {
  event.preventDefault();
  const text = encodeURIComponent('SOLO — AI Expense Intelligence for Independents. Pure black + neon lime dark fintech. 7 screens + brand spec + CSS tokens. By RAM Design AI.');
  const url  = encodeURIComponent('${heroUrl}');
  window.open('https://x.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
}
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  let viewerHtml;
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  if (fs.existsSync(viewerPath)) {
    viewerHtml = fs.readFileSync(viewerPath, 'utf8');
    const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } else {
    // Fallback minimal viewer
    viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SOLO — Viewer</title>
<style>body{background:#050507;color:#F0F0FF;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.msg{text-align:center;opacity:.5;font-size:13px;letter-spacing:1px}
.title{font-size:24px;font-weight:900;color:#5EFF6B;letter-spacing:3px;margin-bottom:12px}</style></head>
<body><div class="msg"><div class="title">SOLO</div>
<p>AI Expense Intelligence for Independents</p>
<p style="margin-top:16px">Viewer: <a href="https://pencil.dev" style="color:#6080FF">pencil.dev</a></p></div>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script></body></html>`;
  }
  return viewerHtml;
}

// ── GitHub queue helper ────────────────────────────────────────────────────────
async function pushToGalleryQueue(heroUrl) {
  const AUTH = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

  const getRes = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, AUTH);
  if (getRes.status !== 200) throw new Error(`Queue GET failed: ${getRes.status} — ${getRes.body.slice(0,120)}`);

  const { sha, content } = JSON.parse(getRes.body);
  const queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));

  const entry = {
    id:           sub.id,
    prompt:       sub.prompt,
    design_url:   heroUrl,
    submitted_at: sub.submitted_at,
    status:       'done',
    credit:       sub.credit,
    tags:         ['finance', 'fintech', 'dark-mode', 'neon-lime', 'ai', 'expense-tracker', 'solo-founder'],
  };

  if (!queue.submissions) queue.submissions = [];
  const existing = queue.submissions.findIndex(s => s.id === sub.id);
  if (existing >= 0) queue.submissions[existing] = entry;
  else queue.submissions.unshift(entry);

  const updated = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: solo heartbeat design — AI expense intelligence`, content: updated, sha });
  const putRes  = await put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, putBody, AUTH);
  if (putRes.status !== 200 && putRes.status !== 201) throw new Error(`Queue PUT failed: ${putRes.status} — ${putRes.body.slice(0,120)}`);
  return true;
}

// ── Main publish pipeline ─────────────────────────────────────────────────────
async function main() {
  console.log('💚 SOLO — Design Discovery Pipeline');
  console.log('════════════════════════════════════\n');

  // Load .pen
  const penPath = path.join(__dirname, 'solo-app.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ solo-app.pen not found — run: node solo-app.js first');
    process.exit(1);
  }
  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded solo-app.pen  (${Math.round(penJson.length / 1024)}KB, ${doc.children.length} screens)`);

  // [1] Build hero HTML
  console.log('\n[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'solo-hero.html'), heroHtml);
  console.log(`  ✓ solo-hero.html (${Math.round(heroHtml.length / 1024)}KB)`);

  // [2] Publish hero → zenbin
  console.log(`\n[2/4] Publishing hero → ram.zenbin.org/${SLUG}…`);
  let heroUrl  = `https://ram.zenbin.org/${SLUG}`;
  let heroSlug = SLUG;
  for (const trySlug of [SLUG, SLUG + '-2', SLUG + '-3']) {
    const body = JSON.stringify({ title: `SOLO — AI Expense Intelligence · RAM Design Studio`, html: heroHtml });
    const res  = await post('zenbin.org', `/v1/pages/${trySlug}`, body, { 'X-Subdomain': 'ram' });
    if (res.status === 200 || res.status === 201) {
      heroSlug = trySlug;
      heroUrl  = `https://ram.zenbin.org/${trySlug}`;
      console.log(`  ✓ Hero live → ${heroUrl}`);
      break;
    }
    if (res.status === 409) {
      // Try overwrite
      const put = await put_('zenbin.org', `/v1/pages/${trySlug}`, body, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (put.status === 200 || put.status === 201) {
        heroSlug = trySlug;
        heroUrl  = `https://ram.zenbin.org/${trySlug}`;
        console.log(`  ✓ Hero updated → ${heroUrl}`);
        break;
      }
      console.log(`  ⚠ Slug '${trySlug}' conflict (${res.status}), trying next…`);
    } else {
      console.log(`  ✗ Publish error ${res.status}: ${res.body.slice(0,100)}`);
    }
  }

  // [3] Build + publish viewer
  console.log(`\n[3/4] Building & publishing viewer → ram.zenbin.org/${VIEWER_SLUG}…`);
  try {
    const viewerHtml = buildViewerHTML(penJson);
    fs.writeFileSync(path.join(__dirname, 'solo-viewer.html'), viewerHtml);
    const vBody = JSON.stringify({ title: `SOLO Viewer · RAM Design Studio`, html: viewerHtml });
    let vOk = false;
    for (const trySlug of [VIEWER_SLUG, VIEWER_SLUG + '-2']) {
      const vRes = await post('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'X-Subdomain': 'ram' });
      if (vRes.status === 200 || vRes.status === 201) {
        console.log(`  ✓ Viewer live → https://ram.zenbin.org/${trySlug}`); vOk = true; break;
      }
      const vPut = await put_('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (vPut.status === 200 || vPut.status === 201) {
        console.log(`  ✓ Viewer updated → https://ram.zenbin.org/${trySlug}`); vOk = true; break;
      }
    }
    if (!vOk) console.log('  ⚠ Viewer publish had issues (hero still live)');
  } catch (e) {
    console.log('  ⚠ Viewer skipped:', e.message);
  }

  // [4] Gallery queue
  console.log('\n[4/4] Adding to gallery queue…');
  try {
    await pushToGalleryQueue(heroUrl);
    console.log('  ✓ Gallery queue updated');
  } catch (e) {
    console.log('  ⚠ Queue update failed:', e.message);
  }

  console.log('\n🔗 Live URLs:');
  console.log(`   Hero:   ${heroUrl}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery`);
  console.log('\n✓ Done.\n');
}

main().catch(console.error);
