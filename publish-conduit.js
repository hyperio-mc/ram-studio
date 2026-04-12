#!/usr/bin/env node
// publish-conduit.js — Run CONDUIT through the full Design Discovery pipeline.
// Hero page + viewer-only + gallery queue
//
// Inspired by:
//   - Superset (land-book.com) — terminal dark code editor for AI agents
//   - Runlayer (land-book.com) — dark MCP/Skills/Agents diagram, deep black + violet
//   - Urbane (darkmodedesign.com) — dark teal #0A2B2A palette, boutique agency dark
//   - Antonio Scirica (darkmodedesign.com) — rotating circular badge CTA micro-interaction

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || config.GITHUB_TOKEN || '';
const GITHUB_REPO  = config.GITHUB_REPO  || 'hyperio-mc/design-studio-queue';
const QUEUE_FILE   = config.QUEUE_FILE   || 'queue.json';

const SLUG        = 'conduit';
const VIEWER_SLUG = 'conduit-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const sub = {
  id:           `heartbeat-conduit-${Date.now()}`,
  prompt:       'Design a dark-mode AI Agent Orchestration platform landing page + dashboard — inspired by Superset\'s terminal-style dark code editor for AI agents (land-book.com), Runlayer\'s deep black + violet MCP diagram approach (land-book.com), Urbane\'s boutique dark teal palette (darkmodedesign.com), and Antonio Scirica\'s rotating circular badge micro-interaction (darkmodedesign.com). 6 screens: landing page with hero orchestration diagram, agent builder with YAML editor + graph preview, live run monitor with bento metrics, pricing with 3 tiers, mobile dashboard, mobile agent feed.',
  app_type:     'developer-tools',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const meta = {
  appName:   'CONDUIT',
  tagline:   'Orchestrate Intelligence.',
  archetype: 'developer-tools',
  screens:   6,
  palette: {
    bg:      '#060B0A',   // deep teal-black (Urbane-inspired)
    fg:      '#EEF2F0',   // cool near-white
    accent:  '#00E5B0',   // electric mint — primary
    accent2: '#7B4FFF',   // violet — AI secondary
  },
};

const prdMarkdown = `
## Overview

CONDUIT is an AI agent orchestration platform for teams shipping production-grade AI workflows. It lets developers define multi-agent pipelines in YAML, monitor live runs with real-time telemetry, and iterate on agent configs without boilerplate infrastructure.

The core insight: orchestrating multiple AI agents (researcher → summarizer → validator) is fundamentally a dev-ops problem, and existing tools treat it as a chat-first UX problem. CONDUIT treats it as a systems engineering discipline — with YAML configs, bento-grid dashboards, terminal log streams, and live dependency graphs.

**Design inspiration:**
- Superset (land-book.com) — "The Code Editor for AI Agents. Orchestrate swarms of Claude Code, Codex, etc. in parallel." Terminal dark UI, monospace type, GitHub CTA. The defining reference for the terminal-native aesthetic.
- Runlayer (land-book.com) — "The Simpler, Safer Way to Connect Skills" — deep black with purple MCP diagram nodes, showing orchestration as a visible graph.
- Urbane (darkmodedesign.com) — dark teal background (#0A2B2A), yellow-orange accent, boutique agency sensibility applied to a technical product. Drove the decision to use teal-undertone black rather than pure #000.
- Antonio Scirica (darkmodedesign.com) — rotating circular "BOOK A CALL · GET IN TOUCH" badge on a personal portfolio. Adapted as the "BOOK A DEMO · GET ACCESS ·" badge on the landing page hero.

## Target Users

- **Backend engineers** building production AI workflows who want YAML-defined agent configs
- **AI/ML teams** running multi-agent research, content, or data-extraction pipelines
- **Founding engineers** at AI startups who need orchestration infra before they can hire a DevOps team

## Core Features

- **Landing page** — editorial serif hero ("Orchestrate Intelligence.") + live orchestration diagram with terminal log tail
- **Agent Builder** — YAML config editor (left pane) + graph preview (right pane) + properties panel; real-time validation
- **Live Run Monitor** — bento-grid metrics (runs, duration, success rate, cost) + active runs table + live log stream
- **Pricing** — 3 tiers (Starter free, Pro $49/mo, Enterprise custom) with toggle; clear token/run positioning
- **Mobile Dashboard** — greeting, quick stats, active run cards with progress bars, bottom nav
- **Mobile Agent Feed** — per-run view with agent status cards and live log tail

## Design Language

**Deep teal-black foundation** — #060B0A (Urbane-inspired teal undertone) rather than pure black. Creates warmth against the electric mint accent. Four elevation layers without shadow.

**Electric mint primary** — #00E5B0 breaks the purple/violet trope common in AI tools (Runlayer, Typeform). Mint reads as "precision" and "real-time" — apt for a monitoring tool. Strong contrast against the dark teal base.

**Violet secondary** — #7B4FFF for LLM-agent nodes and code-level elements. Creates a "model layer" vs "platform layer" distinction.

**SF Mono / monospace throughout UI data** — Terminal IDs, log lines, token counts, run IDs all use monospace. Inspired by Superset's terminal aesthetic. Reinforces that CONDUIT is a developer-grade tool, not a no-code wrapper.

**Bento grid metrics** — The Live Run Monitor uses 4 equal metric cards (runs, duration, success rate, cost) as a bento-style information architecture, directly referencing the bento grid trend dominant on godly.website and Awwwards nominees.

## Screen Architecture

1. **Landing** (desktop 1440×900) · Editorial serif hero, live orchestration diagram, rotating badge CTA
2. **Agent Builder** (desktop 1440×900) · Sidebar + YAML editor + graph preview + properties panel
3. **Live Run Monitor** (desktop 1440×900) · Sidebar + bento metrics + runs table + log stream
4. **Pricing** (desktop 1440×900) · Centered 3-tier cards + annual/monthly toggle
5. **Mobile Dashboard** (390×844) · Stats strip + active run cards + bottom nav
6. **Mobile Agent Feed** (390×844) · Per-run detail with agent cards + live log
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
    if (!kids) return bg;
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill || '#060B0A'}"/>${kids}</svg>`;
}

// ── Simple markdown → HTML ────────────────────────────────────────────────────
function mdToHtml(md) {
  return md.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
    if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
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
  const encoded = Buffer.from(penJson).toString('base64');
  const screens = pen.children || [];

  function lightenHex(hex, amt) {
    const n = parseInt((hex || '#111111').replace('#', ''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  const bg      = meta.palette.bg;
  const fg      = meta.palette.fg;
  const accent  = meta.palette.accent;   // mint
  const accent2 = meta.palette.accent2;  // violet
  const surface = lightenHex(bg, 12);
  const border  = lightenHex(bg, 28);
  const muted   = lightenHex(bg, 70);

  // Screen thumbnails
  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || (s.width < 500 ? `MOBILE ${i + 1}` : `DESKTOP ${i + 1}`);
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: bg,       role: 'BACKGROUND' },
    { hex: surface,  role: 'SURFACE' },
    { hex: fg,       role: 'FOREGROUND' },
    { hex: accent,   role: 'MINT' },
    { hex: accent2,  role: 'VIOLET' },
    { hex: '#39FF7A', role: 'TERM-GREEN' },
    { hex: '#F5A623', role: 'AMBER' },
    { hex: '#FF5C5C', role: 'CORAL' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:48px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${accent}">${sw.hex}</div>
    </div>`).join('');

  // Type scale
  const typeScaleHTML = [
    { label: 'DISPLAY (SERIF)', size: '58px', weight: '800', sample: 'Orchestrate Intelligence.', font: 'Georgia, serif' },
    { label: 'HEADING (SANS)',  size: '22px', weight: '700', sample: 'Live Run Monitor' },
    { label: 'BODY',            size: '13px', weight: '400', sample: '3 runs active · 2 pipelines pending' },
    { label: 'MONO / TERMINAL', size: '10px', weight: '400', sample: '09:42:07  INFO  researcher: 7 results fetched ✓', font: 'SF Mono, Fira Code, monospace' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${fg};font-family:${t.font || "'Inter', sans-serif"};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  // Spacing
  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  // Design principles
  const principles = [
    'Deep teal-black #060B0A (Urbane-inspired) — a teal undertone on the black base avoids the flat coldness of #000. Electric mint reads brighter against it.',
    'Electric mint #00E5B0 over violet — breaks the purple-AI-tool trope. Mint signals precision and real-time monitoring, not just "intelligence."',
    'Monospace throughout data — run IDs, log lines, token counts, durations in SF Mono. Treats CONDUIT as a dev-ops tool, not a no-code wrapper.',
    'Bento-grid metrics — four equal cards (runs, duration, success rate, cost) for at-a-glance system health. Directly from bento trend on godly.website.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  // CSS tokens
  const cssTokens = `:root {
  /* Color — CONDUIT Palette */
  /* Inspired by Superset terminal + Urbane teal-black (darkmodedesign.com) */
  --color-bg:        #060B0A;   /* deep teal-black base */
  --color-surface:   #0C1412;   /* first lift */
  --color-surface-2: #121C1A;   /* card surface */
  --color-surface-3: #192624;   /* elevated/hover */
  --color-border:    #1E2E2C;   /* hairline */
  --color-border-2:  #28403C;   /* strong dividers */
  --color-fg:        #EEF2F0;   /* cool near-white */
  --color-fg-2:      #7A9490;   /* muted teal-gray */
  --color-fg-3:      #3D5550;   /* very muted */

  /* Accent system */
  --color-mint:        #00E5B0;   /* electric mint — primary */
  --color-mint-dim:    #00E5B011; /* tinted bg */
  --color-mint-brd:    #00E5B033; /* tinted border */
  --color-violet:      #7B4FFF;   /* violet — AI secondary */
  --color-violet-dim:  #7B4FFF22;
  --color-violet-brd:  #7B4FFF44;

  /* Semantic */
  --color-term-green: #39FF7A;   /* terminal active status */
  --color-amber:      #F5A623;   /* warning / rate limit */
  --color-coral:      #FF5C5C;   /* error */

  /* Typography */
  --font-display: Georgia, 'Times New Roman', serif;  /* editorial hero */
  --font-sans:    'Inter', -apple-system, system-ui, sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', ui-monospace, monospace; /* terminal data */

  --font-display-size: clamp(42px, 7vw, 90px);
  --font-heading-size: 22px;
  --font-body-size:    13px;
  --font-mono-size:    10px;

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-5: 24px;  --space-6: 32px;  --space-7: 48px;  --space-8: 64px;

  /* Radii */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-full: 9999px;

  /* Agent node accent stripe */
  --stripe-width: 3px;

  /* Bento grid */
  --bento-cols: repeat(4, 1fr);
  --bento-gap:  16px;
}`;

  const prdHtml = mdToHtml(prdMarkdown);
  const dateStr = new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CONDUIT — AI Agent Orchestration · RAM Design Studio</title>
<meta name="description" content="Orchestrate Intelligence. Dark-mode AI agent orchestration platform — 6 screens + brand spec + CSS tokens. Built by RAM Design Studio.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};color:${fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:700;letter-spacing:4px;color:${accent}}
  .nav-id{font-size:11px;color:${muted};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${accent};margin-bottom:20px}
  h1{font-size:clamp(60px,9vw,110px);font-weight:800;letter-spacing:-2px;line-height:1;margin-bottom:20px;color:${fg};font-family:Georgia,'Times New Roman',serif}
  h1 span{color:${accent}}
  .sub{font-size:18px;opacity:.55;max-width:540px;line-height:1.6;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:2px;margin-bottom:4px}
  .meta-item strong{color:${accent};font-size:12px}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px}
  .btn-p{background:${accent};color:${bg}}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${accent}}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${fg};opacity:0.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${accent}22;border:1px solid ${accent}44;color:${accent};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${accent};margin-bottom:12px}
  .p-text{font-size:18px;opacity:.55;font-style:italic;max-width:640px;line-height:1.6;margin-bottom:20px;font-family:Georgia,serif}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:800px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${accent};color:${bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
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
  <div class="tag">HEARTBEAT DESIGN · ${meta.archetype.toUpperCase()} · ${dateStr}</div>
  <h1>CONDUIT<br><span>Orchestrate</span><br>Intelligence.</h1>
  <p class="sub">Run fleets of AI agents in parallel. Define pipelines in YAML, monitor runs in real-time, chain models like code. Dark-mode developer tool for the AI-native era.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>6 (4 DESKTOP + 2 MOBILE)</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>SUPERSET · RUNLAYER · URBANE</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#060B0A + ELECTRIC MINT</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
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
  <div class="section-label">SCREENS · 4 DESKTOP (1440×900) + 2 MOBILE (390×844)</div>
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
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE · SERIF × SANS × MONO</div>
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
      <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${prdHtml}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat · Inspired by Superset, Runlayer (land-book.com) · Urbane, Antonio Scirica (darkmodedesign.com)</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = '${encoded}';
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function openInViewer(){
  try{
    const jsonStr=atob(D);JSON.parse(jsonStr);
    localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'conduit.pen'}));
    window.open('https://ram.zenbin.org/pen-viewer','_blank');
  }catch(e){alert('Could not load: '+e.message);}
}
function downloadPen(){
  try{
    const blob=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='conduit.pen';a.click();
    URL.revokeObjectURL(a.href);
  }catch(e){alert('Download failed: '+e.message);}
}
function copyPrompt(){
  navigator.clipboard.writeText(PROMPT).then(()=>toast('Prompt copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=PROMPT;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Prompt copied ✓');
  });
}
function copyTokens(){
  navigator.clipboard.writeText(CSS_TOKENS).then(()=>toast('CSS tokens copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=CSS_TOKENS;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('CSS tokens copied ✓');
  });
}
function shareOnX(){
  const text=encodeURIComponent('CONDUIT — AI Agent Orchestration Platform. Deep teal-black + electric mint palette. 6 screens with terminal-style dark UI, bento metrics, YAML editor. Built by RAM Design Studio');
  const url=encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text='+text+'&url='+url,'_blank');
}
<\/script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Publish to ZenBin ─────────────────────────────────────────────────────────
async function publishZenBin(slug, title, html) {
  const res = await post('zenbin.org', `/v1/pages/${slug}`, JSON.stringify({ title, html }), {
    'X-Subdomain': 'ram',
  });
  return { status: res.status, data: res.body.slice(0, 200) };
}

// ── Gallery queue update ──────────────────────────────────────────────────────
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
  try {
    queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
  } catch {
    queue = { submissions: [] };
  }

  const entry = {
    id:          sub.id,
    design_url:  `https://ram.zenbin.org/${SLUG}`,
    viewer_url:  `https://ram.zenbin.org/${VIEWER_SLUG}`,
    title:       `CONDUIT — AI Agent Orchestration`,
    description: meta.tagline,
    archetype:   meta.archetype,
    palette:     meta.palette,
    screens:     6,
    submitted_at: sub.submitted_at,
    source:      'heartbeat',
    status:      'done',
  };

  if (!queue.submissions) queue.submissions = [];
  queue.submissions.unshift(entry);

  const updBody = JSON.stringify({
    message: `heartbeat: add CONDUIT design — ${new Date().toISOString().slice(0, 10)}`,
    content: Buffer.from(JSON.stringify(queue, null, 2)).toString('base64'),
    sha,
  });

  const updRes = await put('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, updBody, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    'Accept': 'application/vnd.github.v3+json',
  });
  return updRes.status === 200 || updRes.status === 201;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('CONDUIT — Full Design Discovery Pipeline\n');
  console.log('Inspiration: Superset + Runlayer (land-book.com) · Urbane + Antonio Scirica (darkmodedesign.com)\n');

  const penPath = path.join(__dirname, 'conduit.pen');
  if (!fs.existsSync(penPath)) {
    console.error('conduit.pen not found — run: node conduit-app.js');
    process.exit(1);
  }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const pen     = JSON.parse(penJson);
  console.log(`✓ Loaded conduit.pen (${(penJson.length / 1024).toFixed(0)} KB, ${pen.children.length} screens)`);

  console.log('→ Building hero page HTML...');
  const heroHtml = buildHeroHTML(pen, penJson);
  console.log(`  ${(heroHtml.length / 1024).toFixed(0)} KB`);

  console.log('→ Building viewer HTML...');
  const viewerHtml = buildViewerHTML(penJson);
  console.log(`  ${(viewerHtml.length / 1024).toFixed(0)} KB`);

  console.log(`\n→ Publishing hero   → ram.zenbin.org/${SLUG} ...`);
  const heroRes = await publishZenBin(SLUG, 'CONDUIT — AI Agent Orchestration · RAM Design Studio', heroHtml);
  const heroOk  = heroRes.status === 200 || heroRes.status === 201;
  console.log(`  HTTP ${heroRes.status} ${heroOk ? '✓' : '✗'} ${heroRes.data.slice(0, 80)}`);

  console.log(`\n→ Publishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewRes = await publishZenBin(VIEWER_SLUG, 'CONDUIT Viewer · RAM Design Studio', viewerHtml);
  const viewOk  = viewRes.status === 200 || viewRes.status === 201;
  console.log(`  HTTP ${viewRes.status} ${viewOk ? '✓' : '✗'}`);

  console.log('\n→ Pushing to gallery queue...');
  const galleryOk = await pushToGallery();
  console.log(`  ${galleryOk ? '✓ Gallery updated' : '⚠ Gallery update failed (non-fatal)'}`);

  console.log('\n══════════════════════════════════════════════');
  console.log('CONDUIT — Design Discovery Pipeline Complete');
  if (heroOk)  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  if (viewOk)  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log('  Gallery: https://ram.zenbin.org/gallery');
  console.log('══════════════════════════════════════════════\n');
}

main().catch(err => { console.error('Pipeline failed:', err); process.exit(1); });
