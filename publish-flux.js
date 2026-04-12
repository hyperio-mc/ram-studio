'use strict';
// publish-flux.js — Run FLUX through the full Design Discovery pipeline.
// Hero page + viewer + GitHub gallery queue.

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = CONFIG.GITHUB_TOKEN || '';
const GITHUB_REPO  = CONFIG.GITHUB_REPO  || '';

// ── Metadata ──────────────────────────────────────────────────────────────────
const sub = {
  id:           'hb-flux-1742302800000',
  prompt:       'A dark-mode Parallel AI Research Workspace inspired by Superset.sh (featured on darkmodedesign.com) and Linear.app\'s refined near-black UI. Users orchestrate multiple concurrent AI research threads in a bento-grid workspace — each thread investigates a different angle. Screens: Landing/hero, Workspace Hub (bento), Thread Deep-dive (source list), Synthesis view (insight cards), Export hub, Desktop command center.',
  app_type:     'productivity',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const meta = {
  appName:   'FLUX',
  tagline:   'Research at parallel speed.',
  archetype: 'productivity',
  screens:   6,
  palette: {
    bg:      '#08090A',   // Linear.app's exact background
    fg:      '#F7F8F8',   // Linear.app's exact foreground
    accent:  '#6E56CF',   // Radix purple — primary brand
    accent2: '#46A758',   // success green — secondary
  },
};

const prdMarkdown = `
## Overview

FLUX is a parallel AI research workspace inspired by two 2026 dark-mode design leaders: **Superset.sh** (an AI agent orchestrator showcasing parallel coding environments) and **Linear.app** (the platonic ideal of a refined dark SaaS product). Where Superset.sh showed that parallel agent workspaces could be a product UI pattern, FLUX applies this to knowledge work — research, not code.

The core insight: complex research questions have many angles. Most tools force you to investigate sequentially. FLUX lets you launch 6 concurrent AI threads, watch them run in parallel, and converge into a single synthesised report. The bento-grid workspace is the UI metaphor for "multiple streams, one destination."

## Target Users

- **Independent researchers and academics** — handling complex multi-angle literature reviews
- **Strategy consultants and analysts** — building comprehensive market or policy briefings
- **Journalists and investigative reporters** — tracking multiple source threads on breaking stories
- **Knowledge workers at AI-native companies** — Perplexity, Anthropic, OpenAI research teams

## Core Features

- **Landing screen** — Editorial large-type hero with brand statement, feature previews, social proof from research institutions
- **Workspace Hub** — Bento grid of up to 6 live research threads, each with ID tag, query, status pill, progress bar, and condensed findings
- **Thread Deep-dive** — Full source list with relevance scoring, inline citation links, section toggle to switch between sources and AI synthesis
- **Synthesis view** — Live convergence panel: consensus, tension, emerging, and gap insight cards auto-generated from all thread findings
- **Export hub** — Format chooser (PDF, Markdown, Slides, Live link), privacy controls, citation toggles, one-click download
- **Desktop command center** — Full 1440px wide layout: sidebar nav, KPI strip, thread table, live synthesis panel, source explorer

## Design Language

**Inspired by Linear.app's dark system** — #08090A near-black (not pure black — it has warmth), F7F8F8 foreground that feels cream not white, ultra-thin borders at #1F2328 that divide without shouting.

**Radix purple (#6E56CF) as the single warm accent** — this is the "thinking" color, the AI color, the action color. It appears on CTAs, active states, progress fills for the synthesis thread, and accent glows.

**Status color system** — green (done), amber (running/in-progress), purple (AI/synthesis), red (paused/error). Each appears as pill background tints (color + 22 alpha) to avoid visual noise.

**Berkeley Mono for thread IDs** — monospace tags on every thread card (fx-001 through fx-006) are styled like a terminal — small, precise, slightly muted. This grounds the AI-generated content in something that feels systematic.

**Bento grid as the core metaphor** — the workspace hub uses variable-height cards in a constrained grid. Some cards span full width (synthesis), others pair side by side. This creates visual hierarchy without a sidebar.

## Screen Architecture

1. **Landing / Hero** — Purple ambient glow, large editorial "Research / at parallel / speed." split across three lines, dual CTA, feature strip with 3 cards
2. **Workspace Hub** — 6 thread bento cards, overall progress bar, live status indicator, synthesis CTA button, bottom tab nav
3. **Thread Deep-dive** — Source list with relevance percentages and colored left-edge bars, section toggle (Sources / AI Synthesis), inline citation highlights
4. **Synthesis view** — 3 insight cards (CONSENSUS / TENSION / EMERGING) with tag+color system, converging progress indicator, export CTA
5. **Export hub** — Summary card, 4 format options (PDF active/highlighted), share link copy, privacy and citation toggles
6. **Desktop command center** — Left sidebar with workspace nav, KPI strip (4 metrics), full thread table with progress bars, live synthesis panel (4 insight cards), source explorer table
`;

// ── SVG renderer ──────────────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';

  if (el.type === 'frame') {
    const bg   = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
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
    return `<rect x="${x}" y="${y+(h-fh)/2}" width="${w}" height="${fh}" fill="${fill}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(s, tw, th) {
  const sw = s.width, sh = s.height;
  const kids = (s.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${s.fill || '#111'}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  return md.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
    if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- '))
        .map(l => `<li>${l.slice(2).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')}</li>`);
      return `<ul>${items.join('')}</ul>`;
    }
    return `<p>${block.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')}</p>`;
  }).join('\n');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const encoded = Buffer.from(JSON.stringify(pen)).toString('base64');
  const screens = pen.children || [];

  function lightenHex(hex, amt) {
    const n = parseInt((hex||'#111111').replace('#',''),16);
    const r = Math.min(255,(n>>16)+amt);
    const g = Math.min(255,((n>>8)&0xff)+amt);
    const b = Math.min(255,(n&0xff)+amt);
    return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
  }

  const { bg, fg, accent, accent2 } = meta.palette;
  const surface = lightenHex(bg, 14);
  const border  = lightenHex(bg, 30);
  const muted   = lightenHex(bg, 90);

  // Thumbnails
  const THUMB_H = 180;
  const thumbsHTML = screens.map((s,i) => {
    const tw = Math.round(THUMB_H * (s.width/s.height));
    const labels = ['LANDING','WORKSPACE HUB','THREAD DEEP-DIVE','SYNTHESIS','EXPORT HUB','DESKTOP CMD'];
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s,tw,THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${labels[i]||'SCREEN '+(i+1)}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: '#08090A', role: 'BACKGROUND' },
    { hex: '#111316', role: 'SURFACE' },
    { hex: '#1A1E24', role: 'ELEVATED' },
    { hex: '#F7F8F8', role: 'FOREGROUND' },
    { hex: '#6E56CF', role: 'ACCENT / AI' },
    { hex: '#8B6CF7', role: 'PURPLE-2' },
    { hex: '#46A758', role: 'SUCCESS' },
    { hex: '#F5A623', role: 'IN-PROGRESS' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${accent}">${sw.hex}</div>
    </div>`).join('');

  // Type scale
  const typeScaleHTML = [
    { label:'DISPLAY',  size:'48px', weight:'900', sample:'FLUX' },
    { label:'HEADING',  size:'22px', weight:'700', sample:'Research at parallel speed.' },
    { label:'BODY',     size:'13px', weight:'400', sample:'6 threads active · 47 sources · ~14 min remaining' },
    { label:'MONO TAG', size:'9px',  weight:'400', sample:'fx-001 · fx-002 · fx-003 · fx-004 · fx-005 · fx-006' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  // Spacing
  const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:4px;border-radius:2px;background:${accent};width:${sp*2}px;opacity:0.7"></div>
    </div>`).join('');

  // Design principles
  const principles = [
    'Purple as the AI color — every action, progress bar, and synthesis element uses #6E56CF. It is the signal for "intelligence at work."',
    'Bento grid as metaphor — variable-height cards in a constrained grid create hierarchy without a sidebar. Full-width for synthesis, half-width for peer threads.',
    'Status tints, not status solids — green/amber/purple/red appear at 13% opacity as backgrounds, full opacity only for dots and labels.',
    'Berkeley Mono for thread IDs — the fx-001 tag grounds AI-generated content in something precise and systematic. It reads as a log entry, not a label.',
    'Near-black, not pure black — #08090A has just enough warmth to feel like a lit screen, not a void.',
  ];
  const principlesHTML = principles.map((p,i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i+1).padStart(2,'0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  // CSS tokens
  const cssTokens = `:root {
  /* ── Color — FLUX Research Palette ──────────────── */
  --color-bg:          #08090A;   /* Linear.app bg — near-black */
  --color-surface:     #111316;   /* card / panel surface */
  --color-surface-2:   #1A1E24;   /* elevated surface / modals */
  --color-border:      #1F2328;   /* subtle divider */
  --color-border-2:    #2A2E35;   /* slightly brighter border */
  --color-fg:          #F7F8F8;   /* primary text */
  --color-muted:       #8B8D98;   /* secondary text / labels */

  /* ── Brand Accent ──────────────────────────────── */
  --color-accent:      #6E56CF;   /* Radix purple — AI / action */
  --color-accent-lo:   #6E56CF22; /* tint: active states */
  --color-accent-mid:  #6E56CF66; /* tint: borders on active */
  --color-accent-2:    #8B6CF7;   /* lighter purple — gradient tip */

  /* ── Status Colors ─────────────────────────────── */
  --color-success:     #46A758;   /* thread done */
  --color-success-lo:  #46A75822;
  --color-warning:     #F5A623;   /* thread running */
  --color-warning-lo:  #F5A62322;
  --color-error:       #E5484D;   /* thread paused/failed */
  --color-error-lo:    #E5484D22;
  --color-mono:        #C8D0D9;   /* monospace tag text */

  /* ── Typography ────────────────────────────────── */
  --font-sans:    'Inter', system-ui, -apple-system, sans-serif;
  --font-mono:    'Berkeley Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 900 clamp(40px,8vw,96px)/1 var(--font-sans);
  --font-heading: 700 22px/1.3 var(--font-sans);
  --font-body:    400 13px/1.6 var(--font-sans);
  --font-tag:     400 9px/1 var(--font-mono);

  /* ── Spacing — 4px base grid ───────────────────── */
  --space-1:  4px;  --space-2:  8px;  --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* ── Radius ─────────────────────────────────────── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:  12px;
  --radius-pill: 9999px;
}`;

  const shareText = encodeURIComponent(
    `FLUX — Parallel AI Research Workspace. Dark-mode design inspired by Superset.sh + Linear.app. 6 screens + brand spec + CSS tokens. Built by RAM Design Studio`
  );

  const prdHtml = mdToHtml(prdMarkdown);
  const dateStr = new Date(sub.submitted_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FLUX — Parallel AI Research Workspace · RAM Design Studio</title>
<meta name="description" content="Research at parallel speed. Dark-mode AI research platform with 6 screens, brand spec &amp; CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};color:${fg};font-family:system-ui,-apple-system,'Segoe UI',sans-serif;min-height:100vh;line-height:1.5}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${fg};font-family:'SF Mono',monospace}
  .nav-id{font-size:11px;color:${accent};letter-spacing:1px;font-family:'SF Mono',monospace}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${accent};margin-bottom:24px;font-family:'SF Mono',monospace}
  h1{font-size:clamp(56px,9vw,108px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px}
  .sub{font-size:16px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:2px;margin-bottom:4px;font-family:'SF Mono',monospace}
  .meta-item strong{color:${accent};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:0.3px;transition:opacity .15s}
  .btn-p{background:${accent};color:#fff}
  .btn-p:hover{opacity:0.85}
  .btn-s{background:transparent;color:${fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${accent}66}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};font-family:'SF Mono',monospace}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px;align-items:flex-start}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${fg};opacity:0.65;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${accent}22;border:1px solid ${accent}44;color:${accent};font-family:'SF Mono',monospace;font-size:9px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${accent};margin-bottom:12px;font-family:'SF Mono',monospace}
  .p-text{font-size:18px;opacity:.55;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:800px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${accent};margin:28px 0 10px;font-weight:700;font-family:'SF Mono',monospace}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.6;line-height:1.75;max-width:700px}
  .prd-section ul{padding-left:20px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{opacity:1;color:${fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:'SF Mono',monospace}
  .toast{position:fixed;bottom:24px;right:24px;background:${accent};color:#fff;font-family:'SF Mono',monospace;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-block{background:${surface};border:1px solid ${border};border-left:3px solid ${accent};border-radius:0 8px 8px 0;padding:20px;margin:0 40px 40px;max-width:880px}
  .inspiration-block p{font-size:13px;opacity:.65;line-height:1.65}
  .inspiration-block strong{color:${accent};opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast"></div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · PRODUCTIVITY · ${dateStr}</div>
  <h1>FLUX</h1>
  <p class="sub">${meta.tagline} Orchestrate parallel AI research threads. Watch them converge.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>6 (5 MOBILE + 1 DESKTOP)</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>LINEAR DARK + RADIX PURPLE</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" onclick="openViewer()">▶ Open in Viewer</a>
    <a class="btn btn-s" onclick="downloadPen()">↓ Download .pen</a>
    <a class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</a>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/flux" target="_blank">Share on ✕</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/design-gallery" target="_blank">← Gallery</a>
  </div>
</section>

<div class="inspiration-block">
  <div class="p-label" style="margin-bottom:10px">DESIGN INSPIRATION</div>
  <p>Directly inspired by <strong>Superset.sh</strong> (featured on <strong>darkmodedesign.com</strong>) — a parallel AI agent code editor with near-black backgrounds, showing concurrent agent workspaces as a product UI pattern. Paired with <strong>Linear.app</strong>'s color system (#08090A bg, F7F8F8 fg, Inter Variable + Berkeley Mono) as the refined dark-SaaS baseline. The bento-grid thread layout and purple AI accent are original to this challenge.</p>
</div>

<section class="preview">
  <div class="section-label">SCREEN ARCHITECTURE</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div class="section-label" style="font-size:8px;margin-bottom:16px">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>

      <div class="section-label" style="font-size:8px;margin-top:40px;margin-bottom:16px">TYPE SCALE</div>
      ${typeScaleHTML}

      <div class="section-label" style="font-size:8px;margin-top:40px;margin-bottom:16px">SPACING SYSTEM · 4PX GRID</div>
      ${spacingHTML}
    </div>
    <div>
      <div class="section-label" style="font-size:8px;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${principlesHTML}

      <div class="section-label" style="font-size:8px;margin-top:40px;margin-bottom:16px">CSS DESIGN TOKENS</div>
      <div class="tokens-block">
        <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
        <pre class="tokens-pre">${cssTokens}</pre>
      </div>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">${sub.prompt}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  ${prdHtml}
</section>

<footer>
  <span>FLUX · RAM DESIGN STUDIO · ${dateStr}</span>
  <span>${sub.id}</span>
</footer>

<script>
const D = ${JSON.stringify(encoded)};
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}
function openViewer() {
  try {
    const jsonStr = atob(D);
    JSON.parse(jsonStr);
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'flux.pen' }));
    window.open('https://ram.zenbin.org/pen-viewer', '_blank');
  } catch(e) { alert('Could not load: '+e.message); }
}
function downloadPen() {
  try {
    const blob = new Blob([atob(D)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'flux.pen'; a.click();
    URL.revokeObjectURL(a.href);
  } catch(e) { alert('Download failed: '+e.message); }
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT)
    .then(()=>toast('Prompt copied ✓'))
    .catch(()=>{ const ta=document.createElement('textarea');ta.value=PROMPT;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Prompt copied ✓'); });
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(()=>toast('CSS tokens copied ✓'))
    .catch(()=>{ const ta=document.createElement('textarea');ta.value=CSS_TOKENS;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('CSS tokens copied ✓'); });
}
<\/script>
</body>
</html>`;
}

// ── HTTP publish to ZenBin ────────────────────────────────────────────────────
function publish(slug, title, html, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── GitHub queue push ─────────────────────────────────────────────────────────
async function pushToGalleryQueue(entry) {
  // 1. Get current queue + SHA
  const shaRes = await new Promise((res, rej) => {
    const r = https.request({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-design-studio/1.0', 'Accept': 'application/vnd.github.v3+json' },
    }, resp => { let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>res({status:resp.statusCode,body:d})); });
    r.on('error', rej); r.end();
  });
  if (shaRes.status !== 200) throw new Error(`Queue fetch failed: ${shaRes.status}`);
  const { sha, content } = JSON.parse(shaRes.body);
  const queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));

  // 2. Push entry
  if (!queue.submissions) queue.submissions = [];
  queue.submissions.push(entry);

  // 3. Write back
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `add: flux heartbeat design — ${entry.design_url}`,
    content: newContent,
    sha,
  });
  const putRes = await new Promise((res, rej) => {
    const r = https.request({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-design-studio/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'Accept': 'application/vnd.github.v3+json' },
    }, resp => { let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>res({status:resp.statusCode,body:d})); });
    r.on('error', rej); r.write(body); r.end();
  });
  return putRes;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎨 FLUX — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Load pen
  const penPath = path.join(__dirname, 'flux.pen');
  if (!fs.existsSync(penPath)) { console.error('flux.pen not found — run: node flux-app.js'); process.exit(1); }
  const pen = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded flux.pen: ${pen.children.length} screens`);

  // Build hero HTML
  console.log('  Building hero HTML...');
  const html = buildHeroHTML(pen);
  console.log(`  Hero size: ${(html.length/1024).toFixed(1)} KB`);

  // Build viewer HTML with embedded pen
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.existsSync(viewerPath) ? fs.readFileSync(viewerPath, 'utf8') : '<html><body>Viewer not found</body></html>';
  const penJson   = fs.readFileSync(penPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  // Publish hero
  console.log('\n  Publishing hero → ram.zenbin.org/flux ...');
  const r1 = await publish('flux', 'FLUX — Parallel AI Research Workspace · RAM Design Studio', html);
  const heroOk = r1.status === 200 || r1.status === 201;
  console.log(`  ${heroOk ? '✓' : '✗'} HTTP ${r1.status}`);
  if (!heroOk) console.log('  ', r1.body.slice(0, 300));

  // Publish viewer
  console.log('  Publishing viewer → ram.zenbin.org/flux-viewer ...');
  const r2 = await publish('flux-viewer', 'FLUX — Viewer · RAM Design Studio', viewerHtml);
  const viewerOk = r2.status === 200 || r2.status === 201;
  console.log(`  ${viewerOk ? '✓' : '✗'} HTTP ${r2.status}`);

  // Push to gallery queue
  console.log('\n  Pushing to gallery queue...');
  try {
    const qr = await pushToGalleryQueue({
      id: sub.id,
      submitted_at: sub.submitted_at,
      design_url: 'https://ram.zenbin.org/flux',
      viewer_url: 'https://ram.zenbin.org/flux-viewer',
      app_name: meta.appName,
      tagline: meta.tagline,
      archetype: meta.archetype,
      credit: sub.credit,
      status: 'done',
    });
    const qOk = qr.status === 200 || qr.status === 201;
    console.log(`  ${qOk ? '✓' : '✗'} Gallery queue updated (HTTP ${qr.status})`);
  } catch (e) {
    console.log(`  ⚠ Gallery queue push failed: ${e.message}`);
  }

  console.log('\n🔗 Live URLs:');
  console.log('   Hero:   https://ram.zenbin.org/flux');
  console.log('   Viewer: https://ram.zenbin.org/flux-viewer');
}

main().catch(console.error);
