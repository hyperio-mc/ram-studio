#!/usr/bin/env node
// publish-strand.js — Run STRAND through the full Design Discovery pipeline.
// Hero page + viewer-only + gallery queue

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || config.GITHUB_TOKEN || '';
const GITHUB_REPO  = config.GITHUB_REPO  || 'hyperio-mc/design-studio-queue';
const QUEUE_FILE   = config.QUEUE_FILE   || 'queue.json';

const SLUG        = 'strand';
const VIEWER_SLUG = 'strand-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const sub = {
  id:           `heartbeat-strand-${Date.now()}`,
  prompt:       'An AI-assisted knowledge threading tool for solo founders — inspired by Midday.ai\'s "one-person company" clarity (darkmodedesign.com), Linear\'s ultra-dark near-black aesthetic (godly.website), and the emerging AI solo workflow tools on lapa.ninja. The tool captures ideas, connects them across "strands," synthesizes patterns with AI, and builds a living knowledge graph. 5 mobile + 5 desktop screens covering Today feed, Strand view, Knowledge Graph, Capture flow, Insights, Dashboard, Editor, Graph, Research Mode, and Landing.',
  app_type:     'productivity',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const meta = {
  appName:   'STRAND',
  tagline:   'Untangle your thinking.',
  archetype: 'productivity',
  screens:   10,
  palette: {
    bg:      '#08090A',   // Linear's exact bg (research: darkmodedesign.com)
    fg:      '#EDEDEA',   // warm near-white
    accent:  '#7C6EFC',   // soft violet
    accent2: '#C3B1FF',   // light lavender
  },
};

const prdMarkdown = `
## Overview

STRAND is an AI-assisted knowledge threading tool designed for solo founders — the growing wave of one-person companies who need enterprise-grade thinking infrastructure at individual scale. It captures ideas, links them across "strands," runs AI synthesis asynchronously, and surfaces a living knowledge graph.

The core insight comes from research: every major PKM tool (Notion, Linear, Coda) is designed for team context sharing. No tool treats the solo founder's asynchronous reasoning chain as a first-class citizen. STRAND fills this gap.

**Design inspiration:**
- Midday.ai (darkmodedesign.com) — "new wave of one-person companies" positioning; serif/sans hybrid (Hedvig Letters Serif + clean sans); financial clarity as UX principle
- Linear.app (godly.website) — ultra-dark near-black #08090A background; Inter Variable editorial weight; ruthlessly functional dark-mode UI
- Relace AI + Sparkles (lapa.ninja) — AI-first async workflow tools; solo developer infrastructure positioning

## Target Users

- **Solo founders** running 1-person companies who juggle research, strategy, and execution simultaneously
- **Indie hackers** who read, listen, and think constantly but lose insights because capture is too slow
- **Early-stage founders** (pre-team) building conviction before their first hire

## Core Features

- **Today feed** — AI daily brief synthesizing cross-strand patterns; active strands overview; quick capture FAB
- **Strand view** — Timeline of knowledge nodes with AI annotation and cross-strand connection detection
- **Knowledge graph** — Visual node network showing how ideas connect across all strands
- **Capture flow** — Text, voice, link, and image capture with AI auto-tagging and connection suggestions
- **AI Insights** — Weekly synthesis cards generated from cross-strand pattern detection
- **Research Mode** — Split view: source list on left, AI synthesis on right — for deep research sessions

## Design Language

**Ultra-dark foundation** — #08090A (Linear's exact background) creates premium, low-fatigue dark mode. Every element earns its luminance.

**Soft violet accent** — #7C6EFC breaks from the green/cyan trope of dev tools. Violet reads as "intelligent" and "thoughtful" — appropriate for a thinking tool.

**Serif × sans hybrid** — Display headings in Georgia (Midday-inspired serif) for emotional resonance; body and UI in Inter for precision. This tension between warmth and function is the brand signature.

**Layered surfaces** — bg (#08090A) → surface (#0E1012) → surface2 (#141619) → surface3 (#1C2026). Four levels of elevation without ever using shadows.

## Screen Architecture

1. **Mobile — Today** · Focus feed with AI brief, active strand cards, capture FAB, bottom nav
2. **Mobile — Strand View** · Timeline of knowledge nodes with AI synthesis banner and connection threading
3. **Mobile — Graph** · Visual knowledge graph with node clusters, filters, selected node panel
4. **Mobile — Capture** · Text/voice/link/image modes with AI auto-tagging and strand assignment
5. **Mobile — Insights** · AI-synthesized weekly insight card (serif heading) + mini insight cards
6. **Desktop — Dashboard** · Sidebar nav, AI brief hero, stat badges, strand grid, recent captures panel
7. **Desktop — Strand Editor** · Full timeline editor with AI synthesis, node detail, connections panel
8. **Desktop — Knowledge Graph** · Wide-format node visualization with filters and detailed right panel
9. **Desktop — Research Mode** · Split view: sources (left) + AI synthesis (right) with action items
10. **Desktop — Landing** · Large serif hero ("Untangle your thinking."), feature pills, UI preview mock
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
  // Default: rectangle
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill || '#08090A'}"/>${kids}</svg>`;
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
  const accent  = meta.palette.accent;
  const accent2 = meta.palette.accent2;
  const surface = lightenHex(bg, 14);
  const border  = lightenHex(bg, 30);
  const muted   = lightenHex(bg, 80);

  // Screen thumbnails
  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || (s.width < 500 ? `MOBILE ${i + 1}` : `DESKTOP ${i - 4}`);
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches — STRAND-specific
  const swatches = [
    { hex: bg,       role: 'BACKGROUND' },
    { hex: surface,  role: 'SURFACE' },
    { hex: fg,       role: 'FOREGROUND' },
    { hex: accent,   role: 'VIOLET' },
    { hex: accent2,  role: 'LAVENDER' },
    { hex: '#F2C84B', role: 'GOLD' },
    { hex: '#4ECDC4', role: 'TEAL' },
    { hex: '#FF6B6B', role: 'CORAL' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:48px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${accent}">${sw.hex}</div>
    </div>`).join('');

  // Type scale
  const typeScaleHTML = [
    { label: 'DISPLAY (SERIF)',  size: '48px', weight: '800', sample: 'Untangle your thinking.', font: 'Georgia, serif' },
    { label: 'HEADING (SANS)',   size: '22px', weight: '700', sample: 'Competitor Landscape Q1' },
    { label: 'BODY',             size: '13px', weight: '400', sample: '12 nodes · 38 connections · Last updated 2h ago' },
    { label: 'CAPTION',          size: '9px',  weight: '700', sample: 'RESEARCH · AI SYNTHESIS · STRAND VIEW' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${fg};font-family:${t.font || "'SF Mono','Fira Code',ui-monospace,monospace"};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  // Spacing
  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  // Design principles
  const principles = [
    'Ultra-dark foundation — #08090A from Linear research creates premium, low-fatigue dark mode. Every element earns its luminance.',
    'Serif × sans hybrid — Georgia for emotional display moments (Midday-inspired); Inter for UI precision. Warmth meets function.',
    'Soft violet over green/cyan — #7C6EFC reads as "intelligent" and "thoughtful" rather than "developer tool."',
    'Layered surfaces over shadows — four levels of elevation (bg → surface → surface2 → surface3) without opacity or shadow hacks.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  // CSS tokens
  const cssTokens = `:root {
  /* Color — STRAND Palette */
  /* Inspired by Linear.app #08090A (godly.website research) */
  --color-bg:        #08090A;   /* Linear's exact near-black */
  --color-surface:   #0E1012;   /* first lift */
  --color-surface-2: #141619;   /* card surface */
  --color-surface-3: #1C2026;   /* elevated/hover */
  --color-border:    #1F2428;   /* hairline */
  --color-border-2:  #2A3038;   /* strong dividers */
  --color-fg:        #EDEDEA;   /* warm near-white */
  --color-fg-2:      #8A9099;   /* muted text */
  --color-fg-3:      #4A5260;   /* very muted */

  /* Accent system */
  --color-accent:     #7C6EFC;   /* soft violet — primary */
  --color-accent-lt:  #C3B1FF;   /* light lavender */
  --color-accent-dim: #7C6EFC22; /* tinted bg */
  --color-accent-brd: #7C6EFC44; /* tinted border */

  /* Semantic */
  --color-gold:   #F2C84B;   /* warm highlight */
  --color-teal:   #4ECDC4;   /* cool tag */
  --color-coral:  #FF6B6B;   /* alert/error */

  /* Typography */
  --font-display: Georgia, 'Times New Roman', serif;   /* emotional headers */
  --font-sans: 'Inter', -apple-system, system-ui, sans-serif;   /* UI + data */
  --font-mono: 'SF Mono', 'Fira Code', ui-monospace, monospace; /* labels */

  --font-display-size:  clamp(48px, 8vw, 96px);
  --font-heading-size:  22px;
  --font-body-size:     13px;
  --font-caption-size:  9px;

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radii */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-full: 9999px;

  /* Strand node left accent */
  --stripe-width: 3px;
}`;

  const shareText = encodeURIComponent(
    `STRAND — AI knowledge threading for solo founders. Ultra-dark #08090A + soft violet palette. 10 screens + brand spec + CSS tokens. Built by RAM Design Studio`
  );

  const prdHtml = mdToHtml(prdMarkdown);
  const dateStr = new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>STRAND — Design System · RAM Design Studio</title>
<meta name="description" content="Untangle your thinking. AI knowledge threading tool for solo founders — 10 screens + brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};color:${fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:700;letter-spacing:4px;color:${accent}}
  .nav-id{font-size:11px;color:${muted};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${accent};margin-bottom:20px}
  h1{font-size:clamp(64px,10vw,120px);font-weight:800;letter-spacing:-2px;line-height:1;margin-bottom:20px;color:${fg};font-family:Georgia,'Times New Roman',serif}
  h1 span{color:${accent}}
  .sub{font-size:18px;opacity:.55;max-width:520px;line-height:1.6;margin-bottom:36px}
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
  <h1>STRAND<br><span>Untangle</span><br>your thinking.</h1>
  <p class="sub">AI knowledge threading for the new wave of one-person companies. Capture faster. Connect deeper. Synthesize while you sleep.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>LINEAR · MIDDAY · RELACE AI</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#08090A + SOFT VIOLET</strong></div>
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
  <div class="section-label">SCREENS · 5 MOBILE (390×844) + 5 DESKTOP (1440×900)</div>
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
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE · SERIF × SANS HYBRID</div>
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
  ${prdHtml}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat · Inspired by Midday.ai, Linear.app, Relace AI</span>
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
    localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'strand.pen'}));
    window.open('https://ram.zenbin.org/pen-viewer','_blank');
  }catch(e){alert('Could not load: '+e.message);}
}
function downloadPen(){
  try{
    const blob=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='strand.pen';a.click();
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
  const text=encodeURIComponent('STRAND — AI knowledge threading for solo founders. Ultra-dark + soft violet palette. 10 screens + brand spec + CSS tokens. Built by RAM Design Studio');
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
    title:       `STRAND — AI Knowledge Threading`,
    description: meta.tagline,
    archetype:   meta.archetype,
    palette:     meta.palette,
    screens:     10,
    submitted_at: sub.submitted_at,
    source:      'heartbeat',
    status:      'done',
  };

  if (!queue.submissions) queue.submissions = [];
  queue.submissions.unshift(entry);

  const updBody = JSON.stringify({
    message: `heartbeat: add STRAND design — ${new Date().toISOString().slice(0, 10)}`,
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
  console.log('STRAND — Full Design Discovery Pipeline\n');
  console.log('Inspiration: Midday.ai (darkmodedesign.com) + Linear.app (godly.website) + Relace AI (lapa.ninja)\n');

  const penPath = path.join(__dirname, 'strand.pen');
  if (!fs.existsSync(penPath)) {
    console.error('strand.pen not found — run: node strand-app.js');
    process.exit(1);
  }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const pen     = JSON.parse(penJson);
  console.log(`✓ Loaded strand.pen (${(penJson.length / 1024).toFixed(0)} KB, ${pen.children.length} screens)`);

  console.log('→ Building hero page HTML...');
  const heroHtml = buildHeroHTML(pen, penJson);
  console.log(`  ${(heroHtml.length / 1024).toFixed(0)} KB`);

  console.log('→ Building viewer HTML...');
  const viewerHtml = buildViewerHTML(penJson);
  console.log(`  ${(viewerHtml.length / 1024).toFixed(0)} KB`);

  console.log(`\n→ Publishing hero   → ram.zenbin.org/${SLUG} ...`);
  const heroRes = await publishZenBin(SLUG, 'STRAND — AI Knowledge Threading · RAM Design Studio', heroHtml);
  const heroOk  = heroRes.status === 200 || heroRes.status === 201;
  console.log(`  HTTP ${heroRes.status} ${heroOk ? '✓' : '✗'}`);

  console.log(`\n→ Publishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewRes = await publishZenBin(VIEWER_SLUG, 'STRAND Viewer · RAM Design Studio', viewerHtml);
  const viewOk  = viewRes.status === 200 || viewRes.status === 201;
  console.log(`  HTTP ${viewRes.status} ${viewOk ? '✓' : '✗'}`);

  console.log('\n→ Pushing to gallery queue...');
  const galleryOk = await pushToGallery();
  console.log(`  ${galleryOk ? '✓ Gallery updated' : '⚠ Gallery update failed (non-fatal)'}`);

  console.log('\n══════════════════════════════════════════════');
  console.log('STRAND — Design Discovery Pipeline Complete');
  if (heroOk)  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  if (viewOk)  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log('  Gallery: https://ram.zenbin.org/gallery');
  console.log('══════════════════════════════════════════════\n');
}

main().catch(err => { console.error('Pipeline failed:', err); process.exit(1); });
