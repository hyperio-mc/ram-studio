'use strict';
// publish-axon.js — Full Design Discovery pipeline for AXON heartbeat
// AXON — AI Agent Orchestration Studio
// Inspired by: Runlayer (land-book.com), SILENCIO (godly.website #964), Awwwards SOTD 2026-03-20

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'axon';
const VIEWER_SLUG = 'axon-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'AXON',
  tagline:   'Orchestrate your AI agents. Monitor, build, and ship autonomous workflows from a single command centre.',
  archetype: 'AI Agent Orchestration Studio',
  palette: {
    bg:      '#060608',
    fg:      '#ededf5',
    accent:  '#C8FF00',
    accent2: '#22DD88',
    danger:  '#FF4455',
    amber:   '#FFAA00',
  },
};

const sub = {
  id:           'heartbeat-axon',
  prompt:       'Design AXON — an AI Agent Orchestration Studio for teams building with autonomous AI. Inspired by the "Visible Borders" editorial grid trending on land-book.com today (Runlayer — Enterprise MCPs & Agents), SILENCIO\'s large-type long-scroll editorial aesthetic from godly.website (#964), and Awwwards SOTD March 20 2026 "Stuff by Kris Temmerman" — a portfolio/game hybrid with single-color minimalism and WebGL boldness. Palette: near-void black #060608 + electric lime #C8FF00 as the sole accent. Explicit 1px borders throughout (Runlayer grid paper feel). 5 mobile screens: Hub · Fleet · Builder · Console · Alerts.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Hub', 'Fleet', 'Builder', 'Console', 'Alerts'],
  markdown: `## Overview

AXON is an AI Agent Orchestration Studio — a mobile-first command centre for teams running autonomous AI agents in production. It surfaces real-time agent health, enables fast agent creation from templates, streams live console output, and routes critical alerts to the engineers on call.

Discovered during design research on **March 20, 2026** across three sources: Runlayer's enterprise agent platform on land-book.com (visible-border grid aesthetic, info-dense SaaS dark layout), SILENCIO's editorial portfolio on godly.website (Neue Haas Grotesk large type, PT Mono, radical long-scroll), and Awwwards SOTD "Stuff by Kris Temmerman" (minimal single-color palette, game/portfolio hybrid, WebGL boldness).

## Target Users

- **ML/AI engineers** who run multiple autonomous agents against production APIs
- **Platform teams** responsible for agent reliability, cost control, and observability
- **Startup founders** deploying AI automation across sales, research, and customer ops
- **DevOps engineers** who treat agents like services: deploy, monitor, rollback

## Core Features

- **Hub** — System-wide dashboard: running agent count (editorial large display number, SILENCIO-style), 3-column metric strip (tasks/errors/cost), active agent list, quick launch rail, health bars
- **Fleet** — Full agent library with status filtering. 4-stat summary bar, search + filter row, agent rows with color-coded status strips. Template cards for fast deployment.
- **Builder** — 4-section agent configuration: Identity → Model → Tools & Skills → Behavior. Model selector with pricing. Tool chips with active states. Deploy + test run CTAs.
- **Console** — Live streaming run output. Turn counter with progress bar. Per-line log with agent/tool/time columns. Stop/Pause/Export action bar.
- **Alerts** — Prioritized alert queue with severity header strip. Full-detail alert cards with color-coded left borders. Resolve all + configure thresholds actions.

## Design Language

**Visible Borders** (from Runlayer, land-book.com) — Every card and section boundary is an explicit 1px line at \`#1f1f27\`. No shadowboxing, no elevation tricks. The UI reads like a precision instrument with ruled grid paper as its foundation. Dividers are information, not decoration.

**Editorial Type Scale** (from SILENCIO, godly.website) — The Hub screen opens with a massive "12" (running agents) in 80px/900-weight electric lime — SILENCIO's editorial number-as-hero principle. All labels are ALL-CAPS with 1–2px letter-spacing. Monospace soul without monospace fonts.

**Single Violent Accent** (from Awwwards SOTD — Kris Temmerman) — Kris's portfolio uses a single warm color (#ded7d2) against near-white with total confidence. AXON inverts this: near-void black \`#060608\` with a single electric lime \`#C8FF00\`. One color does all the accent work: nav active states, metric highlights, progress bars, CTAs.

**Status Semantics** — Green/amber/red for running/paused/error. Never decorative. Each color carries operational meaning that engineers read instantly.

## Screen Architecture

**Mobile (390×844) — 5 screens:**
1. **Hub** — Status bar → wordmark row → HR → editorial "12 AGENTS RUNNING" hero → metric tile strip → agent list → quick launch → health bars → bottom nav
2. **Fleet** — Summary header (total/running/paused/error) → search/filter row → 6-agent scrollable list → template grid
3. **Builder** — 4 labeled form sections (Identity, Model, Tools, Behavior) → Deploy button → Test Run
4. **Console** — Agent info bar with live timer → turn progress strip → timestamped log lines (100% terminal feel) → Stop/Pause/Export footer
5. **Alerts** — Unread badge → severity summary strip → filter tabs → 4 alert cards (critical/warning/info) → resolve + configure CTAs`,
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
    .replace(/`([^`]+)`/g, '<code style="background:#0d0d18;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#C8FF00">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = lightenHex(meta.palette.bg, 11);
  const border  = lightenHex(meta.palette.bg, 25);
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
    { hex: meta.palette.bg,      role: 'BACKGROUND' },
    { hex: surface,              role: 'SURFACE'     },
    { hex: meta.palette.fg,      role: 'FOREGROUND'  },
    { hex: meta.palette.accent,  role: 'LIME ACCENT' },
    { hex: meta.palette.accent2, role: 'GREEN/RUN'   },
    { hex: meta.palette.amber,   role: 'AMBER/WARN'  },
    { hex: meta.palette.danger,  role: 'RED/ERROR'   },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px;max-width:100px">
      <div style="height:52px;border-radius:4px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8.5px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '80px', weight: '900', sample: 'AXON' },
    { label: 'HEADING',  size: '28px', weight: '700', sample: 'AI Agent Orchestration' },
    { label: 'BODY',     size: '13px', weight: '400', sample: 'Orchestrate autonomous workflows at scale.' },
    { label: 'LABEL',    size: '9px',  weight: '600', sample: 'SYSTEM · AGENT · MONITOR · DEPLOY' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
      <div style="font-size:9px;opacity:.35;width:28px;flex-shrink:0">${sp}px</div>
      <div style="height:7px;border-radius:3px;background:${meta.palette.accent};width:${sp*2.2}px;opacity:.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* ── Color ─────────────────────────────────── */
  --color-bg:        ${meta.palette.bg};    /* near-void black          */
  --color-surface:   ${surface};            /* card surface             */
  --color-border:    ${border};             /* visible border (grid)    */
  --color-fg:        ${meta.palette.fg};    /* primary text             */
  --color-primary:   ${meta.palette.accent};/* electric lime accent     */
  --color-success:   ${meta.palette.accent2};/* running / green         */
  --color-warning:   ${meta.palette.amber}; /* paused / amber           */
  --color-danger:    ${meta.palette.danger};/* error / red              */

  /* ── Typography ─────────────────────────────── */
  --font-display:  900 clamp(56px, 10vw, 96px) / 1   system-ui, sans-serif;
  --font-heading:  700 24px / 1.3   system-ui, sans-serif;
  --font-body:     400 13px / 1.65  system-ui, sans-serif;
  --font-label:    600 9px  / 1     system-ui, sans-serif;
  --font-mono:     500 11px / 1.5   'SF Mono', 'Fira Code', monospace;

  /* ── Spacing (4px base grid) ─────────────────── */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;

  /* ── Radius ──────────────────────────────────── */
  --radius-none: 0;   --radius-sm: 4px;
  --radius-md: 8px;   --radius-full: 9999px;

  /* ── Borders (visible, Runlayer-style) ────────── */
  --border: 1px solid var(--color-border);
  --border-accent: 1px solid ${meta.palette.accent}55;
}`;

  const shareText = encodeURIComponent(
    `AXON — AI Agent Orchestration Studio. Electric lime + void black. 5 screens + brand spec + CSS tokens. Built by RAM Design Studio`
  );
  const prdHtml = mdToHtml(prd.markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AXON — AI Agent Orchestration Studio · RAM Design Studio</title>
<meta name="description" content="${meta.tagline} Designed by RAM Design AI. 5 mobile screens, full brand spec, CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:system-ui,'Inter','SF Pro Display',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:900;letter-spacing:5px;color:${meta.palette.accent}}
  .nav-id{font-size:10px;color:${meta.palette.accent};letter-spacing:1px;opacity:.7}
  .hero{padding:80px 40px 36px;max-width:960px}
  .tag{font-size:9.5px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:22px;opacity:.9}
  h1{font-size:clamp(72px,13vw,120px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:20px;color:${meta.palette.fg}}
  h1 span{color:${meta.palette.accent}}
  .sub{font-size:15px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:32px}
  .meta-row{display:flex;gap:28px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.35;letter-spacing:1.2px;margin-bottom:3px}
  .meta-item strong{color:${meta.palette.accent};font-size:12px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:5px;letter-spacing:.5px;transition:opacity .15s}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.bg}}
  .btn-p:hover{opacity:.9}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-x{background:#000;color:#fff;border:1px solid #222}
  .preview{padding:0 40px 72px}
  .section-label{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:22px;padding-bottom:11px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:56px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:52px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:4px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.75;color:${meta.palette.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}1a;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:9.5px;letter-spacing:1.2px;padding:4px 12px;border-radius:3px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}2e}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2.5px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:16px;opacity:.55;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:18px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13.5px;opacity:.6;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${meta.palette.fg}}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:16px 20px;border-radius:0 4px 4px 0;margin:0 40px 36px;max-width:700px;font-size:12px;line-height:1.75;opacity:.7}
  .inspiration-bar strong{color:${meta.palette.accent};opacity:1}
  .principle{padding:11px 0;border-bottom:1px solid ${border};font-size:12.5px;opacity:.6;line-height:1.6}
  .principle:last-child{border-bottom:none}
  .principle::before{content:'→ ';color:${meta.palette.accent};font-weight:700;opacity:1}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:${meta.palette.bg};font-family:inherit;font-size:11px;font-weight:900;letter-spacing:1px;padding:10px 20px;border-radius:4px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-axon · MARCH 20, 2026</div>
</nav>

<div class="inspiration-bar">
  <strong>Inspired by:</strong> Runlayer (land-book.com, Mar 20 — Enterprise MCPs &amp; Agents) · SILENCIO (godly.website #964 — large type, editorial long-scroll) · Awwwards SOTD Mar 20 "Stuff by Kris Temmerman" (game/portfolio hybrid, single-color confidence)
</div>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · AI AGENT STUDIO · MARCH 20, 2026</div>
  <h1>A<span>X</span>ON</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta-row">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>AI AGENT ORCHESTRATION</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>DESIGNED BY</span><strong>RAM · HEARTBEAT</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/axon-viewer">☰ Viewer Only</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE · HUB / FLEET / BUILDER / CONSOLE / ALERTS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:14px">COLOR PALETTE · 7 TOKENS</div>
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
      ${[
        'Visible borders over shadows — every boundary is a 1px line. The grid is information.',
        'Single violent accent — #C8FF00 electric lime does ALL accent work. No competing colors.',
        'Editorial large type (SILENCIO-style) — metrics as heroes, numbers at 80px/900-weight.',
        'Status semantics — green/amber/red carry operational meaning, never decoration.',
      ].map(p => `<div class="principle">${p}</div>`).join('')}
    </div>

  </div>

  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:14px">CSS DESIGN TOKENS</div>
    <div class="tokens-block" id="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;')}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  <p>${prdHtml}</p>
</section>

<footer>
  <span>RAM Design Studio · Heartbeat · Inspired by Runlayer (land-book.com) + SILENCIO (godly.website) + Awwwards SOTD 2026-03-20</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = '${encoded}';
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
function openInViewer() {
  try {
    const jsonStr = atob(D);
    JSON.parse(jsonStr);
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'axon.pen' }));
    window.open('https://ram.zenbin.org/pen-viewer', '_blank');
  } catch(e) { alert('Could not load: ' + e.message); }
}
function downloadPen() {
  try {
    const blob = new Blob([atob(D)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'axon.pen'; a.click();
    URL.revokeObjectURL(a.href);
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
  const text = encodeURIComponent('AXON — AI Agent Orchestration Studio. Electric lime + void black. 5 screens + CSS tokens. Built by RAM Design Studio');
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
    tags:         ['ai-agents', 'dark-mode', 'orchestration', 'electric-lime', 'visible-borders', 'saas'],
  };

  if (!queue.submissions) queue.submissions = [];
  const existing = queue.submissions.findIndex(s => s.id === sub.id);
  if (existing >= 0) queue.submissions[existing] = entry;
  else queue.submissions.unshift(entry);

  const updated = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: axon heartbeat design`, content: updated, sha });
  const putRes = await put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, putBody, AUTH);
  if (putRes.status !== 200 && putRes.status !== 201) throw new Error(`Queue PUT failed: ${putRes.status} — ${putRes.body}`);
  return true;
}

// ── Main publish ──────────────────────────────────────────────────────────────
async function main() {
  console.log('⚡ AXON — Design Discovery Pipeline');
  console.log('════════════════════════════════════\n');

  const penPath = path.join(__dirname, 'axon.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ axon.pen not found. Run: node axon-app.js first');
    process.exit(1);
  }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded axon.pen (${Math.round(penJson.length / 1024)}KB, ${doc.children.length} screens)`);

  // Step 1: Build hero HTML
  console.log('\n[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'axon-hero.html'), heroHtml);
  console.log(`  ✓ axon-hero.html (${Math.round(heroHtml.length / 1024)}KB)`);

  // Step 2: Publish hero → zenbin
  console.log('\n[2/4] Publishing hero → ram.zenbin.org/axon…');
  let heroUrl  = `https://ram.zenbin.org/${SLUG}`;
  let heroSlug = SLUG;
  for (const trySlug of [SLUG, SLUG + '-2', SLUG + '-3']) {
    const body = JSON.stringify({ title: `AXON — AI Agent Orchestration Studio · RAM Design Studio`, html: heroHtml });
    const res  = await post('zenbin.org', `/v1/pages/${trySlug}`, body, { 'X-Subdomain': 'ram' });
    if (res.status === 200 || res.status === 201) {
      heroSlug = trySlug;
      heroUrl  = `https://ram.zenbin.org/${trySlug}`;
      console.log(`  ✓ Hero live → ${heroUrl} (HTTP ${res.status})`);
      break;
    } else if (res.status === 409) {
      const putRes = await put_('zenbin.org', `/v1/pages/${trySlug}`, body, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (putRes.status === 200 || putRes.status === 201) {
        heroSlug = trySlug;
        heroUrl  = `https://ram.zenbin.org/${trySlug}`;
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
    fs.writeFileSync(path.join(__dirname, 'axon-viewer.html'), viewerHtml);
    const vBody = JSON.stringify({ title: `AXON Viewer · RAM Design Studio`, html: viewerHtml });
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
  console.log('✓ AXON published successfully!');
  console.log(`  Hero:    ${heroUrl}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('════════════════════════════════════\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
