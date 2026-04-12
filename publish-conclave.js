#!/usr/bin/env node
// publish-conclave.js — Run CONCLAVE through the full Design Discovery pipeline.
// Hero page + viewer-only + gallery queue
//
// Inspired by:
//   Atlas Card (godly.website) — luxury dark "impossible access" UX
//   Superset.sh (darkmodedesign.com) — live parallel AI agent terminal UI

'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || config.GITHUB_TOKEN || '';
const GITHUB_REPO  = config.GITHUB_REPO  || 'hyperio-mc/design-studio-queue';
const QUEUE_FILE   = config.QUEUE_FILE   || 'queue.json';

const SLUG        = 'conclave';
const VIEWER_SLUG = 'conclave-viewer';

const P = {
  bg:       '#07060A',
  surface:  '#0F0D15',
  surface2: '#19151F',
  border:   '#2E2838',
  muted:    '#6B6075',
  fg:       '#EDE8E3',
  accent:   '#C8935A',
  gold:     '#F2C84B',
  green:    '#3DFFA0',
  amber:    '#F5A623',
  red:      '#FF4A6A',
};

const sub = {
  id:           `heartbeat-conclave-${Date.now()}`,
  prompt:       'Design a dark-mode AI concierge app for securing impossible reservations — inspired by Atlas Card\'s luxury "impossible access" UX (godly.website) merged with Superset.sh\'s live parallel AI agent terminal aesthetic (darkmodedesign.com). Terminal-style agent status panels in polished dark surfaces: AI working in real-time to secure bookings at Carbone, Aman, Coachella. Ultra-dark #07060A backgrounds, copper/bronze accent (#C8935A), warm cream foreground (#EDE8E3), terminal green (#3DFFA0) for live agent status. 5 mobile + 4 desktop screens.',
  app_type:     'lifestyle',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const meta = {
  appName:   'CONCLAVE',
  tagline:   'Impossible made inevitable.',
  archetype: 'lifestyle',
  screens:   9,
  palette: {
    bg:      P.bg,
    fg:      P.fg,
    accent:  P.accent,
    gold:    P.gold,
    green:   P.green,
  },
};

const prdMarkdown = `
## Overview

CONCLAVE is an invite-only AI concierge that deploys swarms of parallel AI agents to secure impossible reservations — tables at Carbone, suites at Aman, passes to sold-out events — while the member lives their life. The design merges two distinct aesthetics discovered during research: Atlas Card's ultra-dark luxury and Superset.sh's live agent orchestration terminal.

The key insight: premium concierge has always been about invisible labor made visible only when successful. CONCLAVE makes the "invisible labor" visible through a terminal-style agent console that gives members transparency into exactly how their AI concierge is working — then delivers the win with a luxury confirmation experience.

**Design inspiration:**
- Atlas Card (atlascard.com via godly.website) — invite-only luxury; "impossible reservations made easy"; deep black backgrounds with cream text; steel card aesthetic; full-bleed photography
- Superset.sh (superset.sh via darkmodedesign.com) — live parallel AI agent orchestration; terminal green on dark; real-time agent status streams; "11 agents working on your machine"
- Novel combination: luxury concierge UX + agent orchestration terminal aesthetic

## Target Users

- **Ultra-high-net-worth individuals** who value time over effort — they want impossible things done, not to manage the process
- **Power users** who appreciate transparency — they want to see the AI working, not just a black box
- **Invite-only community** of 847 members worldwide who access the service through referral

## Core Features

- **Home/Dashboard** — Status of active agents, recent wins, quick request input, copper glow ambient
- **New Request** — Natural language input parsed by AI with strategy breakdown and agent deployment
- **Agent Monitor** — Live terminal stream showing every agent's real-time status (Superset-inspired)
- **Confirmation** — Luxury celebration of a secured reservation with full details and how it was done
- **My Reservations** — Active, upcoming, and past bookings with live agent status strips
- **Desktop Landing** — Full-width marketing page with live agent widget sidebar
- **Desktop Dashboard** — Request management with agent activity panel and quick request
- **Desktop Agent Console** — Full terminal view of all agents across all active requests
- **Desktop Reservation Detail** — Rich detail view with concierge profile and upcoming bookings

## Design Language

**Ultra-dark warm base** — #07060A with violet-warm tint creates depth distinct from pure black. Luxury dark rooms feel warm, not cold.

**Copper/bronze accent** — #C8935A breaks from the electric blue/green default of AI tools. Copper reads as premium metal, handcrafted, time-tested — appropriate for a concierge brand.

**Terminal green in luxury** — #3DFFA0 (Superset-inspired) used exclusively for live agent status signals. The terminal aesthetic creates legitimacy and transparency — "real work being done right now."

**Warm cream foreground** — #EDE8E3 instead of stark white gives the softness of vellum — appropriate for a brand that evokes handwritten reservation books and steel concierge cards.

**Monospace for agents, serif for brand** — Terminal/monospace type in agent panels, display-weight sans for brand moments. The code aesthetic inside the luxury shell is the design signature.

## Screen Architecture

1. **Mobile — Home** · Copper hero glow, tagline, live agent activity strip, recent win card, quick request input
2. **Mobile — New Request** · NL input, AI interpretation card, agent strategy breakdown, confidence gauge, deploy button
3. **Mobile — Agent Monitor** · Full terminal stream, coverage bar, success probability gauge, accept/keep searching
4. **Mobile — Confirmation** · Gold glow celebration, restaurant card, how-it-was-secured terminal, calendar action
5. **Mobile — Reservations** · Filtered list with status pills, live agent strip, upcoming/past bookings
6. **Desktop — Landing** · Large serif hero, live agent widget sidebar, recent wins, invite CTA
7. **Desktop — Dashboard** · Stat row, active requests table with progress bars, agent activity panel, quick request
8. **Desktop — Agent Console** · Full-width terminal stream with agent IDs and message logs, probability gauge, session stats
9. **Desktop — Reservation Detail** · Hero confirmation card, how-secured terminal, concierge profile, related upcoming
`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

function getJson(hostname, path_, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path: path_, method: 'GET',
      headers: { 'User-Agent': 'design-studio-agent/1.0', ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.end();
  });
}

function put(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';
  if (el.type === 'frame') {
    const bg   = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'ellipse') {
    return `<ellipse cx="${x + w/2}" cy="${y + h/2}" rx="${w/2}" ry="${h/2}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w}" height="${fh}" fill="${fill}"${oAttr} rx="1"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill || P.bg}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  return md.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
    if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
    if (block.startsWith('**')) return `<p><strong>${block.replace(/\*\*([^*]+)\*\*/g, '$1')}</strong></p>`;
    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- ')).map(l =>
        `<li>${l.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`);
      return `<ul>${items.join('')}</ul>`;
    }
    return `<p>${block.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`;
  }).join('\n');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(pen, penJson) {
  const encoded  = Buffer.from(penJson).toString('base64');
  const screens  = pen.children || [];
  const dateStr  = new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  function lightenHex(hex, amt) {
    const n = parseInt((hex || '#111111').replace('#', ''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  const bg      = P.bg;
  const fg      = P.fg;
  const accent  = P.accent;
  const surface = lightenHex(bg, 12);
  const border  = lightenHex(bg, 32);
  const muted   = P.muted;

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || (s.width < 500 ? `MOBILE ${i + 1}` : `DESKTOP ${i - 4}`);
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'VOID BLACK' },
    { hex: P.surface, role: 'SURFACE' },
    { hex: P.fg,      role: 'CREAM' },
    { hex: P.accent,  role: 'COPPER' },
    { hex: P.gold,    role: 'GOLD' },
    { hex: P.green,   role: 'TERMINAL' },
    { hex: P.amber,   role: 'AMBER' },
    { hex: P.red,     role: 'ALERT' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:48px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',   size: '56px', weight: '900', sample: 'Impossible made inevitable.',  font: 'inherit' },
    { label: 'HEADING',   size: '20px', weight: '700', sample: 'Agent Console — Live Stream' },
    { label: 'BODY',      size: '13px', weight: '400', sample: 'Agent #7 on hold: direct line (2:14)...' },
    { label: 'TERMINAL',  size: '10px', weight: '400', sample: '⠿ agent#02  scanning resy.com/carbone-nyc — checking 7:30PM slot...' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${fg};font-family:${t.font||"'SF Mono','Fira Code',ui-monospace,monospace"};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const principles = [
    'Ultra-dark warm void — #07060A with violet-warm tint. Luxury dark rooms feel warm. This is not the cold dark of dev tools.',
    'Copper over blue — #C8935A breaks from electric blue/green AI defaults. Copper reads as premium metal, time-tested, handcrafted.',
    'Terminal inside luxury — #3DFFA0 terminal green exclusively for live agent signals. Code aesthetic inside a concierge shell is the brand signature.',
    'Cream over white — #EDE8E3 foreground evokes vellum and handwritten reservation books. Warm, not clinical.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* ── CONCLAVE Design System ── */
  /* Luxury AI Concierge · Inspired by Atlas Card + Superset.sh */

  /* Color — Base */
  --color-bg:        #07060A;   /* void black — warm violet tint */
  --color-surface:   #0F0D15;   /* dark surface */
  --color-surface-2: #19151F;   /* card surface */
  --color-surface-3: #241E2C;   /* elevated / hover */
  --color-border:    #2E2838;   /* soft purple border */
  --color-muted:     #6B6075;   /* warm purple-grey */

  /* Color — Foreground */
  --color-fg:        #EDE8E3;   /* warm cream (vellum, not white) */
  --color-fg-2:      #A89EA0;   /* secondary text */
  --color-fg-3:      #6B6075;   /* very muted */

  /* Color — Accent system */
  --color-copper:    #C8935A;   /* primary: luxury, premium */
  --color-copper-lt: #D4A574;   /* light copper hover */
  --color-copper-bg: #C8935A18; /* tinted copper background */
  --color-copper-bd: #C8935A44; /* tinted copper border */

  /* Color — Semantic */
  --color-gold:      #F2C84B;   /* success highlight */
  --color-terminal:  #3DFFA0;   /* agent ACTIVE (Superset-inspired) */
  --color-amber:     #F5A623;   /* working / pending */
  --color-alert:     #FF4A6A;   /* error / unavailable */

  /* Typography */
  --font-display: -apple-system, 'SF Pro Display', system-ui, sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', 'Fira Mono', ui-monospace, monospace;

  --text-display: clamp(48px, 8vw, 108px);
  --text-heading: 20px;
  --text-body:    13px;
  --text-caption: 9px;
  --text-terminal: 10px;

  --weight-black:  900;
  --weight-bold:   700;
  --weight-medium: 500;
  --weight-normal: 400;

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;    --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;   --space-6: 48px;  --space-7: 64px;

  /* Radii */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   20px;
  --radius-pill: 9999px;

  /* Agent status: terminal aesthetic within luxury UI */
  --terminal-bg:   rgba(61, 255, 160, 0.04);
  --terminal-border: rgba(61, 255, 160, 0.16);
}`;

  const shareText = encodeURIComponent('CONCLAVE — AI concierge for impossible reservations. Ultra-dark luxury meets terminal agent orchestration. 9 screens + brand spec. Built by RAM Design Studio');
  const prdHtml = mdToHtml(prdMarkdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CONCLAVE — Design System · RAM Design Studio</title>
<meta name="description" content="Impossible made inevitable. AI concierge for impossible reservations — 9 screens + brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};color:${fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;background:${bg}}
  .logo{font-size:13px;font-weight:900;letter-spacing:6px;color:${accent}}
  .nav-id{font-size:11px;color:${muted};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:1000px}
  .tag{font-size:9px;letter-spacing:3px;color:${accent};margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(56px,9vw,112px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px;color:${fg}}
  h1 span{color:${accent}}
  .sub{font-size:17px;opacity:.55;max-width:540px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:2px;margin-bottom:4px}
  .meta-item strong{color:${accent};font-size:12px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:${accent};color:${bg}}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${accent}}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:1000px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:24px;position:relative;overflow:hidden}
  .tokens-pre{font-size:10px;line-height:1.8;color:${fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${accent}22;border:1px solid ${accent}44;color:${accent};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700;transition:background .15s}
  .copy-btn:hover{background:${accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${accent};margin-bottom:12px;font-weight:700}
  .p-text{font-size:18px;opacity:.55;font-style:italic;max-width:680px;line-height:1.6;margin-bottom:20px;font-family:Georgia,serif}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:840px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:720px}
  .prd-section ul{padding-left:18px;margin:8px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{opacity:1;color:${fg};font-weight:600}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${accent};color:${bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999;pointer-events:none}
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
  <div class="tag">HEARTBEAT DESIGN · LIFESTYLE CONCIERGE · ${dateStr}</div>
  <h1>CONCLAVE<br><span>Impossible</span><br>made inevitable.</h1>
  <p class="sub">AI agents working 24/7 to secure tables at Carbone, suites at Aman, passes to Coachella — while you live your life. Luxury concierge meets terminal agent orchestration.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>9 (5 MOBILE + 4 DESKTOP)</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>ATLAS CARD · SUPERSET.SH</strong></div>
    <div class="meta-item"><span>SOURCES</span><strong>GODLY.WEBSITE · DARKMODEDESIGN.COM</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#07060A + COPPER + TERMINAL GREEN</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844) + 4 DESKTOP (1440×900)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · 8 TOKENS</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE · SANS + MONOSPACE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>
  </div>
  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
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
  ${mdToHtml(prdMarkdown)}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat · Inspired by Atlas Card (godly.website) + Superset.sh (darkmodedesign.com)</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = '${encoded}';
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function openInViewer(){
  try{
    const jsonStr=atob(D);JSON.parse(jsonStr);
    localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'conclave.pen'}));
    window.open('https://ram.zenbin.org/${VIEWER_SLUG}','_blank');
  }catch(e){alert('Could not load: '+e.message);}
}
function downloadPen(){
  try{
    const blob=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='conclave.pen';a.click();
    URL.revokeObjectURL(a.href);
  }catch(e){alert('Download failed: '+e.message);}
}
function copyPrompt(){
  navigator.clipboard.writeText(PROMPT).then(()=>toast('Prompt copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=PROMPT;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Prompt copied ✓');
  });
}
function copyTokens(){
  const src=document.getElementById('tokens-pre').textContent;
  navigator.clipboard.writeText(src).then(()=>toast('CSS tokens copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=CSS_TOKENS;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('CSS tokens copied ✓');
  });
}
function shareOnX(){
  const text=encodeURIComponent('CONCLAVE — AI concierge for impossible reservations. Ultra-dark luxury meets terminal agent orchestration. 9 screens + full brand spec. Built by RAM Design Studio');
  const url=encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text='+text+'&url='+url,'_blank');
}
<\/script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  if (!fs.existsSync(viewerPath)) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CONCLAVE Viewer</title></head><body style="background:#07060A;color:#EDE8E3;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center"><div><div style="color:#C8935A;font-size:20px;font-weight:900;letter-spacing:4px;margin-bottom:12px">CONCLAVE</div><div style="opacity:.5">Viewer not available — open <a href="https://ram.zenbin.org/${SLUG}" style="color:#C8935A">ram.zenbin.org/${SLUG}</a></div></div></body></html>`;
  }
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── ZenBin publish ────────────────────────────────────────────────────────────
async function publishZenBin(slug, title, html) {
  const res = await post('zenbin.org', `/v1/pages/${slug}`, JSON.stringify({ title, html }), {
    'X-Subdomain': 'ram',
  });
  return { status: res.status, data: res.body.slice(0, 300) };
}

// ── GitHub gallery queue ──────────────────────────────────────────────────────
async function pushToGallery() {
  const shaRes = await getJson('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  });
  if (shaRes.status !== 200) {
    console.warn(`  ⚠ Could not get queue SHA: ${shaRes.status}`);
    return false;
  }
  const { sha, content } = JSON.parse(shaRes.body);
  let queue;
  try { queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8')); }
  catch { queue = { submissions: [] }; }

  const entry = {
    id:          sub.id,
    design_url:  `https://ram.zenbin.org/${SLUG}`,
    viewer_url:  `https://ram.zenbin.org/${VIEWER_SLUG}`,
    title:       'CONCLAVE — AI Concierge for Impossible Access',
    description: meta.tagline,
    archetype:   meta.archetype,
    palette:     meta.palette,
    screens:     meta.screens,
    submitted_at: sub.submitted_at,
    source:      'heartbeat',
    status:      'done',
  };

  if (!queue.submissions) queue.submissions = [];
  queue.submissions.unshift(entry);

  const updRes = await put('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, JSON.stringify({
    message: `heartbeat: add CONCLAVE design — ${new Date().toISOString().slice(0, 10)}`,
    content: Buffer.from(JSON.stringify(queue, null, 2)).toString('base64'),
    sha,
  }), {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    'Accept': 'application/vnd.github.v3+json',
  });
  return updRes.status === 200 || updRes.status === 201;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('CONCLAVE — Full Design Discovery Pipeline\n');
  console.log('Inspiration:');
  console.log('  · Atlas Card (atlascard.com via godly.website) — luxury dark "impossible access"');
  console.log('  · Superset.sh (superset.sh via darkmodedesign.com) — live AI agent terminal UI\n');

  const penPath = path.join(__dirname, 'conclave.pen');
  if (!fs.existsSync(penPath)) {
    console.error('conclave.pen not found — run: node conclave-app.js');
    process.exit(1);
  }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const pen     = JSON.parse(penJson);
  console.log(`✓ Loaded conclave.pen (${(penJson.length / 1024).toFixed(0)} KB, ${pen.children.length} screens)`);

  console.log('→ Building hero page HTML...');
  const heroHtml = buildHeroHTML(pen, penJson);
  console.log(`  ${(heroHtml.length / 1024).toFixed(0)} KB`);

  console.log('→ Building viewer HTML...');
  const viewerHtml = buildViewerHTML(penJson);
  console.log(`  ${(viewerHtml.length / 1024).toFixed(0)} KB`);

  console.log(`\n→ Publishing hero   → ram.zenbin.org/${SLUG} ...`);
  const heroRes = await publishZenBin(SLUG, 'CONCLAVE — AI Concierge for Impossible Access · RAM Design Studio', heroHtml);
  const heroOk  = heroRes.status === 200 || heroRes.status === 201;
  console.log(`  HTTP ${heroRes.status} ${heroOk ? '✓' : '✗'} ${!heroOk ? heroRes.data : ''}`);

  console.log(`\n→ Publishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewRes = await publishZenBin(VIEWER_SLUG, 'CONCLAVE Viewer · RAM Design Studio', viewerHtml);
  const viewOk  = viewRes.status === 200 || viewRes.status === 201;
  console.log(`  HTTP ${viewRes.status} ${viewOk ? '✓' : '✗'} ${!viewOk ? viewRes.data : ''}`);

  console.log('\n→ Pushing to gallery queue...');
  const galleryOk = await pushToGallery();
  console.log(`  ${galleryOk ? '✓ Gallery updated' : '⚠ Gallery update failed (non-fatal)'}`);

  console.log('\n══════════════════════════════════════════════');
  console.log('CONCLAVE — Design Discovery Pipeline Complete');
  if (heroOk)  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  if (viewOk)  console.log(`  Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log('  Gallery: https://ram.zenbin.org/gallery');
  console.log('══════════════════════════════════════════════\n');
}

main().catch(err => { console.error('Pipeline failed:', err); process.exit(1); });
