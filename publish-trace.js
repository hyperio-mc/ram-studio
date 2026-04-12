'use strict';
// publish-trace.js — Full Design Discovery pipeline for TRACE heartbeat
// TRACE — AI Observability Platform
// Inspired by: Good Fella Awwwards SOTD Mar 18 2026, Evervault (Godly), Linear (darkmodedesign.com)

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'trace';
const VIEWER_SLUG = 'trace-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'TRACE',
  tagline:   'Full-stack AI observability. Waterfall traces, agent health, and real-time alerts — built for engineers who ship autonomous AI.',
  archetype: 'AI Observability Platform',
  palette: {
    bg:      '#0D0B0A',
    surface: '#1A1513',
    border:  '#2A1F1B',
    fg:      '#F2EDE8',
    accent:  '#FB460D',
    ok:      '#22C55E',
    warn:    '#F59E0B',
    danger:  '#EF4444',
  },
};

const sub = {
  id:           'heartbeat-trace',
  prompt:       'Design TRACE — an AI Observability Platform for engineers monitoring autonomous agents in production. Inspired by Good Fella (Awwwards SOTD Mar 18, 2026 — #FB460D / #141314 two-color extreme minimalism, flat design, WebGL, editorial typography), Evervault Customers on Godly (dark gradient SaaS, Inter + Roobert, clean animation), and Linear on darkmodedesign.com (precision dark UI, monospace data density, hairline dividers). Single violent accent #FB460D does all the work. 6 mobile screens: Traces · Waterfall · Dashboard · Agents · Alert Detail · Settings.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Traces', 'Waterfall', 'Dashboard', 'Agents', 'Alert', 'Settings'],
  markdown: `## Overview

TRACE is an AI Observability Platform — a mobile-first tool for engineers who run autonomous AI agents in production and need to understand exactly what those agents are doing, how long each step takes, and where things break. It surfaces trace timelines, agent health, latency metrics, and real-time alerts in a precision dark interface built for speed and trust.

Discovered during design research on **March 20, 2026** across three key sources: Good Fella agency site (Awwwards SOTD March 18 2026 — extreme two-color minimalism with #FB460D and #141314, flat design philosophy, WebGL/GSAP motion, editorial large numerals), Evervault's customers page on Godly (#960 — dark SaaS with animated gradients, Inter/Roobert typography, professional density), and Linear on darkmodedesign.com (the gold standard for precision dark productivity UI, hairline dividers, semantic status colors).

## Target Users

- **AI engineers** debugging agent runs at 2am: need fast trace lookup, waterfall view, error context
- **Platform / MLOps teams** tracking agent health SLAs, latency budgets, and cost per run
- **Product managers** wanting uptime dashboards and success rate trends without a SQL query
- **On-call engineers** who need to triage critical agent failures from a mobile device

## Core Features

- **Traces** — Master list with editorial metric hero (3 numbers, Good Fella size), filter bar, per-trace cards with status-colored left borders and latency bars
- **Waterfall** — Span-level trace detail with depth-indented timeline bars, color-coded by span type (agent / LLM / tool / HTTP), duration column
- **Dashboard** — 847ms P99 as editorial hero number (Good Fella / SILENCIO principle: the number IS the UI), 3-col mini strip, 2×3 agent health grid
- **Agents** — Registry with 4-stat summary, search/filter, per-agent cards with model, run count, uptime, cost/day
- **Alert Detail** — Full-screen modal with critical header stripe, error message block, stack trace, similar alerts list, resolve/snooze actions
- **Settings** — Account block, API key inputs, notification toggles (Linear-style precision form)

## Design Language

**Single Violent Accent** (from Good Fella, Awwwards SOTD) — Good Fella uses exactly two colors across its entire site: #FB460D and #141314. TRACE takes this principle and applies it to a data-heavy tool. #FB460D appears in: the wordmark, P99 hero, latency bars (high-pct), active nav states, CTA buttons, and the copy-token highlight. Everything else is warm near-blacks and muted grays. The discipline of using one color creates instant hierarchy.

**Status Semantics are NOT Decorative** (from Linear, darkmodedesign.com) — Green/amber/red carry operational meaning. They appear as: left border stripes on cards (status at-a-glance), dot indicators in badges, uptime text, and sparkline fills. Never used for decoration. Engineers read status colors the way pilots read instrument panels.

**Editorial Hero Numbers** (from Good Fella + SILENCIO on Godly) — The Dashboard opens with "847" in 72px/900-weight orange. The Traces hero strip uses 28px/800-weight for 3 key metrics. This is the Good Fella SOTD principle: make the most important data point so large it becomes the art. No charts, no graphs — just the number.

**Warm Dark, Not Cold Dark** (unique to TRACE, diverging from reference) — Most dark UIs use cold blue-blacks. TRACE uses red-black undertones throughout (#0D0B0A, #1A1513, #2A1F1B) to harmonize with the #FB460D accent. The palette feels warm and precise, like a darkroom lit by a single amber safelight.

## Screen Architecture

**Mobile (390×844) — 6 screens:**
1. **Traces** — Status bar → wordmark row → editorial 3-metric hero strip (total/errors/P99) → filter bar → 6 trace cards with status borders and latency bars → bottom nav
2. **Waterfall** — Trace header card (ID, name, status, total duration) → column headers → 8 depth-indented span rows with waterfall bars → span type legend
3. **Dashboard** — 847ms P99 editorial hero → 3-col mini metric strip → "AGENT HEALTH" 2×3 grid with status bars → bottom nav
4. **Agents** — 4-stat summary strip (total/active/paused/error) → search/filter bar → 5 agent cards with model, runs, uptime, cost → VIEW links
5. **Alert Detail** — Full-screen modal: critical stripe → error message block → stack trace → 3 similar alerts → RESOLVE + SNOOZE CTAs
6. **Settings** — Account tile → OpenAI/Anthropic API key inputs → webhook URL → 4 notification toggles → danger zone`,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(body) : null;
    if (bodyBuf) opts.headers = { ...opts.headers, 'Content-Length': bodyBuf.length };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (bodyBuf) r.write(bodyBuf);
    r.end();
  });
}
const post = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'POST', headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const put_ = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'PUT',  headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const get_ = (host, p, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0', ...hdrs } });

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderEl(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0, w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = typeof el.fill === 'string' ? el.fill : 'none';
  const oAttr = el.opacity !== undefined && el.opacity < 0.99 ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';
  if (el.type === 'frame') {
    const bg   = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderEl(c, depth + 1)).join('');
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'ellipse') {
    const sf = typeof el.fill === 'string' ? el.fill : meta.palette.accent;
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : meta.palette.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  if (el.type === 'rectangle') {
    const sf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : meta.palette.border;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${sf}"${rAttr}${oAttr}/>`;
  }
  return '';
}
const screenThumbSVG = (s, tw, th) => {
  const kids = (s.children || []).map(c => renderEl(c, 0)).join('');
  const bg   = typeof s.fill === 'string' ? s.fill : meta.palette.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${s.width}" height="${s.height}" fill="${bg}"/>${kids}</svg>`;
};

// ── Color helpers ─────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111').replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:11px;letter-spacing:1.5px;opacity:.5;margin:20px 0 8px;font-weight:700">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#1a1210;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#FB460D">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = meta.palette.surface;
  const border  = meta.palette.border;
  const acc     = meta.palette.accent;
  const fg      = meta.palette.fg;
  const bg      = meta.palette.bg;
  const THUMB_H = 200;

  const encoded = Buffer.from(penJson).toString('base64');

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = `M · ${prd.screenNames[i] || (i + 1)}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: bg,                  role: 'BACKGROUND'  },
    { hex: surface,             role: 'SURFACE'     },
    { hex: border,              role: 'BORDER'      },
    { hex: fg,                  role: 'FOREGROUND'  },
    { hex: acc,                 role: 'ACCENT/P99'  },
    { hex: meta.palette.ok,     role: 'OK/HEALTHY'  },
    { hex: meta.palette.warn,   role: 'WARN/DEGRAD' },
    { hex: meta.palette.danger, role: 'ERROR/CRIT'  },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:64px;max-width:90px">
      <div style="height:48px;border-radius:4px;background:${sw.hex};border:1px solid ${border};margin-bottom:7px"></div>
      <div style="font-size:7.5px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${acc}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '72px', weight: '900', sample: '847' },
    { label: 'HEADING',  size: '28px', weight: '800', sample: 'Traces' },
    { label: 'BODY',     size: '13px', weight: '400', sample: 'Full-stack AI observability for production agents.' },
    { label: 'LABEL',    size: '9px',  weight: '700', sample: 'TRACES · WATERFALL · DASHBOARD · AGENTS' },
    { label: 'MONO',     size: '10px', weight: '400', sample: 'trc_9f2a · email-drafter · 1,247ms · 14 spans' },
  ].map(t => `
    <div style="padding:12px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:5px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.label === 'MONO' ? "'SF Mono','Fira Code',monospace" : 'inherit'}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
      <div style="font-size:9px;opacity:.35;width:28px;flex-shrink:0">${sp}px</div>
      <div style="height:6px;border-radius:3px;background:${acc};width:${sp * 2.2}px;opacity:.6"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* ── Color — Good Fella SOTD palette (Mar 18, 2026) ─── */
  --color-bg:        ${bg};      /* warm red-black           */
  --color-surface:   ${surface}; /* card surface             */
  --color-border:    ${border};  /* hairline warm border     */
  --color-fg:        ${fg};      /* warm near-white          */
  --color-accent:    ${acc};     /* Good Fella orange-red    */
  --color-ok:        ${meta.palette.ok};    /* healthy / resolved       */
  --color-warning:   ${meta.palette.warn};  /* degraded / warning       */
  --color-danger:    ${meta.palette.danger};/* error / critical         */

  /* ── Status semantics (not decorative) ──────────────── */
  --color-span-agent: ${acc};       /* root agent span          */
  --color-span-llm:   #A78BFA;      /* LLM call spans           */
  --color-span-tool:  #5B8FFF;      /* tool call spans          */
  --color-span-http:  #FFAA80;      /* HTTP spans               */

  /* ── Typography ──────────────────────────────────────── */
  --font-display: 900 clamp(64px, 12vw, 96px) / 1    system-ui, sans-serif;
  --font-heading: 800 28px / 1.3                       system-ui, sans-serif;
  --font-body:    400 13px / 1.65                      system-ui, sans-serif;
  --font-label:   700 9px  / 1     letter-spacing:1.5px system-ui, sans-serif;
  --font-mono:    400 10px / 1.5                       'SF Mono', 'Fira Code', monospace;

  /* ── Spacing (4px base grid) ────────────────────────── */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;

  /* ── Radius ────────────────────────────────────────── */
  --radius-sm: 4px;  --radius-md: 6px;  --radius-full: 9999px;

  /* ── Borders ────────────────────────────────────────── */
  --border: 1px solid var(--color-border);
  --border-accent: 1px solid ${acc}40;
  --border-ok: 1px solid ${meta.palette.ok}40;
  --border-danger: 1px solid ${meta.palette.danger}40;
}`;

  const shareText = encodeURIComponent(
    `TRACE — AI Observability Platform. #FB460D orange-red on warm dark. 6 mobile screens + waterfall trace view + CSS tokens. Built by RAM Design Studio`
  );
  const prdHtml = mdToHtml(prd.markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TRACE — AI Observability Platform · RAM Design Studio</title>
<meta name="description" content="${meta.tagline} Designed by RAM Design AI. 6 mobile screens, waterfall trace view, full brand spec, CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};color:${fg};font-family:system-ui,'Inter','SF Pro Display',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:900;letter-spacing:5px;color:${acc}}
  .nav-id{font-size:10px;color:${acc};letter-spacing:1px;opacity:.7}
  .hero{padding:80px 40px 36px;max-width:960px}
  .tag{font-size:9.5px;letter-spacing:3px;color:${acc};margin-bottom:22px;opacity:.9}
  h1{font-size:clamp(72px,13vw,120px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:20px;color:${fg}}
  h1 span{color:${acc}}
  .sub{font-size:15px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:32px}
  .meta-row{display:flex;gap:28px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.35;letter-spacing:1.2px;margin-bottom:3px}
  .meta-item strong{color:${acc};font-size:12px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:5px;letter-spacing:.5px;transition:opacity .15s}
  .btn-p{background:${acc};color:${bg}}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${acc}55}
  .btn-x{background:#000;color:#fff;border:1px solid #222}
  .preview{padding:0 40px 72px}
  .section-label{font-size:9px;letter-spacing:3px;color:${acc};margin-bottom:22px;padding-bottom:11px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${acc}44;border-radius:2px}
  .brand-section{padding:56px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:52px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:4px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.75;color:${fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${acc}1a;border:1px solid ${acc}44;color:${acc};font-family:inherit;font-size:9.5px;letter-spacing:1.2px;padding:4px 12px;border-radius:3px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${acc}2e}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2.5px;color:${acc};margin-bottom:12px}
  .p-text{font-size:16px;opacity:.55;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:18px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${acc};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13.5px;opacity:.6;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${fg}}
  .inspiration-bar{background:${surface};border-left:3px solid ${acc};padding:16px 20px;border-radius:0 4px 4px 0;margin:0 40px 36px;max-width:700px;font-size:12px;line-height:1.75;opacity:.7}
  .inspiration-bar strong{color:${acc};opacity:1}
  .principle{padding:11px 0;border-bottom:1px solid ${border};font-size:12.5px;opacity:.6;line-height:1.6}
  .principle:last-child{border-bottom:none}
  .principle::before{content:'→ ';color:${acc};font-weight:700;opacity:1}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${acc};color:${bg};font-family:inherit;font-size:11px;font-weight:900;letter-spacing:1px;padding:10px 20px;border-radius:4px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-trace · MARCH 20, 2026</div>
</nav>

<div class="inspiration-bar">
  <strong>Inspired by:</strong> Good Fella (Awwwards SOTD Mar 18, 2026 — #FB460D / #141314 two-color extreme minimalism, flat, WebGL) · Evervault Customers (Godly #960 — dark SaaS gradient, clean animation) · Linear (darkmodedesign.com — precision dark UI, hairline dividers, semantic status colors)
</div>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · AI OBSERVABILITY · MARCH 20, 2026</div>
  <h1>T<span>R</span>ACE</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta-row">
    <div class="meta-item"><span>SCREENS</span><strong>6 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>AI OBSERVABILITY</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>DESIGNED BY</span><strong>RAM · HEARTBEAT</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/${VIEWER_SLUG}">☰ Viewer Only</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 6 MOBILE · TRACES / WATERFALL / DASHBOARD / AGENTS / ALERT / SETTINGS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:14px">COLOR PALETTE · 8 TOKENS · Good Fella SOTD palette extended</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:0">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:14px">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:14px">DESIGN PRINCIPLES</div>
      <div class="principle">Single violent accent — #FB460D does ALL the work. Zero decorative color.</div>
      <div class="principle">Status semantics are never decorative — green/amber/red = healthy/degraded/error.</div>
      <div class="principle">Editorial hero numbers — the metric IS the UI. No charts needed.</div>
      <div class="principle">Warm dark palette — red-black undertones harmonize with the orange-red accent.</div>
      <div class="principle">Hairline dividers — borders are information, not decoration.</div>
    </div>

    <div style="grid-column:1/-1">
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:14px">CSS DESIGN TOKENS</div>
      <div class="tokens-block">
        <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
        <pre class="tokens-pre" id="tokens-pre">${cssTokens}</pre>
      </div>
    </div>

  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  <div>${prdHtml}</div>
</section>

<footer>
  <span>TRACE · RAM Design Studio · March 20, 2026</span>
  <span>Heartbeat #${Date.now().toString(36).toUpperCase()} · pencil.dev v2.8</span>
</footer>

<script>
const PROMPT = ${JSON.stringify(sub.prompt)};
const PEN_B64 = '${encoded}';
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function openInViewer() { window.open('https://ram.zenbin.org/${VIEWER_SLUG}', '_blank'); }
function downloadPen() {
  try {
    const bin = atob(PEN_B64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'trace.pen';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Downloading trace.pen…');
  } catch(e) { alert('Download failed: ' + e.message); }
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT)
    .then(() => toast('Prompt copied ✓'))
    .catch(() => { const ta = document.createElement('textarea'); ta.value = PROMPT; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('Prompt copied ✓'); });
}
function copyTokens() {
  const src = document.getElementById('tokens-pre').textContent;
  navigator.clipboard.writeText(src)
    .then(() => toast('CSS tokens copied ✓'))
    .catch(() => { const ta = document.createElement('textarea'); ta.value = src; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('CSS tokens copied ✓'); });
}
function shareOnX() {
  const text = encodeURIComponent('TRACE — AI Observability Platform. #FB460D orange-red on warm dark. 6 mobile screens + waterfall trace view + CSS tokens. Built by RAM Design Studio');
  const url  = encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
}
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const rawViewer = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  return rawViewer.replace('<script>', injection + '\n<script>');
}

// ── GitHub queue helper ───────────────────────────────────────────────────────
async function pushToGalleryQueue(heroUrl) {
  const AUTH = { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'design-studio-agent/1.0', 'Accept': 'application/vnd.github.v3+json' };
  const getRes = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, AUTH);
  if (getRes.status !== 200) throw new Error(`Queue GET failed: ${getRes.status}`);
  const { sha, content } = JSON.parse(getRes.body);
  const queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));

  const entry = {
    id:           sub.id,
    prompt:       sub.prompt,
    design_url:   heroUrl,
    submitted_at: sub.submitted_at,
    status:       'done',
    credit:       sub.credit,
    tags:         ['ai-observability', 'dark-mode', 'waterfall', 'traces', 'good-fella-palette', 'warm-dark'],
  };

  if (!queue.submissions) queue.submissions = [];
  const existing = queue.submissions.findIndex(s => s.id === sub.id);
  if (existing >= 0) queue.submissions[existing] = entry;
  else queue.submissions.unshift(entry);

  const updated = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: trace heartbeat design`, content: updated, sha });
  const putRes = await put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, putBody, AUTH);
  if (putRes.status !== 200 && putRes.status !== 201) throw new Error(`Queue PUT failed: ${putRes.status} — ${putRes.body}`);
  return true;
}

// ── Main publish ──────────────────────────────────────────────────────────────
async function main() {
  console.log('⚡ TRACE — Design Discovery Pipeline');
  console.log('════════════════════════════════════\n');

  const penPath = path.join(__dirname, 'trace.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ trace.pen not found. Run: node trace-app.js first');
    process.exit(1);
  }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded trace.pen (${Math.round(penJson.length / 1024)}KB, ${doc.children.length} screens)`);

  // Step 1: Build hero HTML
  console.log('\n[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'trace-hero.html'), heroHtml);
  console.log(`  ✓ trace-hero.html (${Math.round(heroHtml.length / 1024)}KB)`);

  // Step 2: Publish hero → zenbin
  console.log('\n[2/4] Publishing hero → ram.zenbin.org/trace…');
  let heroUrl  = `https://ram.zenbin.org/${SLUG}`;
  for (const trySlug of [SLUG, SLUG + '-2', SLUG + '-3']) {
    const body = JSON.stringify({ title: `TRACE — AI Observability Platform · RAM Design Studio`, html: heroHtml });
    const res  = await post('zenbin.org', `/v1/pages/${trySlug}`, body, { 'X-Subdomain': 'ram' });
    if (res.status === 200 || res.status === 201) {
      heroUrl = `https://ram.zenbin.org/${trySlug}`;
      console.log(`  ✓ Hero live → ${heroUrl} (HTTP ${res.status})`);
      break;
    } else if (res.status === 409) {
      const putRes = await put_('zenbin.org', `/v1/pages/${trySlug}`, body, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (putRes.status === 200 || putRes.status === 201) {
        heroUrl = `https://ram.zenbin.org/${trySlug}`;
        console.log(`  ✓ Hero updated → ${heroUrl} (HTTP ${putRes.status})`);
        break;
      }
      console.log(`  ⚠ Slug '${trySlug}' taken, trying next…`);
    } else {
      console.log(`  ✗ Publish error ${res.status}: ${res.body.slice(0, 100)}`);
    }
  }

  // Step 3: Build + publish viewer
  console.log(`\n[3/4] Building & publishing viewer → ram.zenbin.org/${VIEWER_SLUG}…`);
  let viewerOk = false;
  try {
    const viewerHtml = buildViewerHTML(penJson);
    fs.writeFileSync(path.join(__dirname, 'trace-viewer.html'), viewerHtml);
    const vBody = JSON.stringify({ title: `TRACE Viewer · RAM Design Studio`, html: viewerHtml });
    for (const trySlug of [VIEWER_SLUG, VIEWER_SLUG + '-2']) {
      const vRes = await post('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'X-Subdomain': 'ram' });
      if (vRes.status === 200 || vRes.status === 201) {
        console.log(`  ✓ Viewer live → https://ram.zenbin.org/${trySlug} (HTTP ${vRes.status})`);
        viewerOk = true; break;
      }
      const vPut = await put_('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (vPut.status === 200 || vPut.status === 201) {
        console.log(`  ✓ Viewer updated → https://ram.zenbin.org/${trySlug} (HTTP ${vPut.status})`);
        viewerOk = true; break;
      }
    }
    if (!viewerOk) console.log('  ⚠ Viewer publish had issues');
  } catch (e) {
    console.log('  ⚠ Viewer skipped:', e.message);
  }

  // Step 4: Gallery queue
  console.log('\n[4/4] Adding to gallery queue…');
  try {
    await pushToGalleryQueue(heroUrl);
    console.log('  ✓ Gallery queue updated');
  } catch (e) {
    console.log('  ⚠ Queue update failed:', e.message);
  }

  console.log('\n════════════════════════════════════');
  console.log('✓ TRACE published successfully!');
  console.log(`  Hero:    ${heroUrl}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('════════════════════════════════════\n');

  return heroUrl;
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
