#!/usr/bin/env node
// publish-mnemo.js — Full Design Discovery pipeline for MNEMO
// Hero page → ram.zenbin.org/mnemo
// Viewer     → ram.zenbin.org/mnemo-viewer
// Gallery    → GitHub queue

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Metadata ──────────────────────────────────────────────────────────────────
const sub = {
  id:           'hb-mnemo-1742299200000',
  prompt:       'Design a dark-mode AI memory & knowledge vault app called MNEMO — inspired by Linear\'s bento grid dark mode (godly.website FT.870), Midday.ai\'s "one-person company" dark dashboard aesthetic (darkmodedesign.com), and the emerging AI productivity tool trend on land-book.com. Deep violet-space palette (#07060E base, #7C5CFF electric violet accent), bento grid dashboard, neural connection UI. 5 screens: Hero/Landing, Dashboard (bento grid with activity heatmap), Memory Feed, Memory Detail (AI connections panel), Desktop Command Center (3-column split).',
  app_type:     'productivity',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const meta = {
  appName:   'MNEMO',
  tagline:   'Capture. Connect. Remember.',
  archetype: 'productivity',
  screens:   5,
  palette: {
    bg:       '#07060E',
    surface:  '#0F0D1A',
    surface2: '#16132A',
    surface3: '#1E1B35',
    border:   '#2A2545',
    border2:  '#3D3766',
    fg:       '#EDE8FF',
    muted:    '#6B6490',
    accent:   '#7C5CFF',
    accent2:  '#FF5CA8',
    teal:     '#22D3A4',
    amber:    '#FFAB3E',
  },
};

const prdMarkdown = `
## Overview

MNEMO (from Mnemosyne, the Greek goddess of memory) is an AI-powered personal knowledge management app for knowledge workers, researchers, and founders. It captures everything you read, think, and discuss — then surfaces connections you'd never find alone.

Unlike rigid note-taking apps, MNEMO treats knowledge as a living network. Every capture is automatically enriched with AI summaries, linked to related memories, and organized by semantic proximity rather than folders.

Inspired aesthetically by Linear's cinematic bento grid dark mode (as curated on godly.website FT.870) and Midday.ai's "new wave of one-person companies" dark dashboard ethos (darkmodedesign.com). The deep violet-space palette deliberately breaks from the sea of electric-blue SaaS tools.

## Target Users

- **Researchers & academics** — capturing papers, insights, and cross-disciplinary connections
- **Solo founders & knowledge workers** — building a personal operating system for ideas
- **Journalists & writers** — managing sources, notes, and narrative threads across projects
- **Engineers & designers** — tracking technical insights, UI patterns, and inspiration

## Core Features

- **Universal capture** — text, links, audio recordings, screenshots — all indexed in one place
- **AI enrichment** — automatic summaries, tag suggestions, and connection discovery
- **Connection graph** — visual neural network showing how memories relate to each other
- **Activity heatmap** — GitHub-style capture streak tracker for habit building
- **Quick capture** — floating hotkey-triggered modal for zero-friction capture
- **Collections** — thematic groupings of memories for projects or areas of interest
- **Daily AI digest** — morning briefing of new connections found overnight

## Design Language

**Deep violet-space aesthetic** — background #07060E is near-black with a violet undertone, evoking deep space. Card surfaces at #0F0D1A and #16132A create a layered depth hierarchy without flat greys.

**Electric violet accent** — #7C5CFF breaks from the common electric blue of developer tools. Violet signals intelligence, intuition, and neural connection — semantically appropriate for a memory/AI product.

**Bento grid dashboard** — directly inspired by Linear's bento grid (godly.website FT.870). Tiles of varying widths create visual hierarchy from information density alone. The dashboard reads as a "mission control" for your knowledge.

**Neural glow decoration** — layered concentric ellipse glows simulate the brain's associative network. Glows appear behind high-value UI moments: AI insights, connection counts, capture CTAs.

**GitHub-style heatmap** — the activity tracker uses an 84-cell grid (12 weeks × 7 days) with four intensity levels, giving users a "streak" motivation mechanic without gamification bloat.

**Dot cluster pattern** — the hero screen uses scattered circles of varying sizes as a decorative "neural network" motif — abstract, not literal, but immediately readable as "connection."

## Screen Architecture

1. **Hero / Landing** — violet glow behind display type, floating app preview card showing live memory rows, dual CTA, trust tagline
2. **Dashboard** — bento grid: unified count tile (3 mini-stats), quick capture tile, AI insight tile, activity heatmap (84 cells), category breakdown tiles
3. **Memory Feed** — search bar, horizontal filter pills, 5-item memory list with left accent bars, AI summary previews, tag pills
4. **Memory Detail** — memory content card, AI connections panel with 4 match results, tag cloud, action bar (View / Add to Collection / Open Source)
5. **Desktop Command Center** — left sidebar (nav + legend + capture CTA), center memory list (8 items with active state), right detail panel (memory card + AI connections + actions)
`;

// ── SVG renderer for thumbnails ────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, Math.min(w, h) / 2)}"` : '';
  if (el.type === 'frame') {
    const bg   = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids) return bg;
    return `${bg}<g>${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h * 0.6, (el.fontSize || 13) * 0.55));
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${Math.min(w, w * 0.9)}" height="${fh}" fill="${fill}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  const bg = screen.fill || '#07060E';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:10px;flex-shrink:0;box-shadow:0 4px 24px #7C5CFF18"><rect width="${sw}" height="${sh}" fill="${bg}"/>${kids}</svg>`;
}

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

// ── Build hero HTML ────────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const encoded  = Buffer.from(JSON.stringify(pen)).toString('base64');
  const screens  = pen.children || [];
  const P        = meta.palette;
  const dateStr  = new Date().toLocaleDateString('en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  // Thumbnails
  const THUMB_H = 200;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || `Screen ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.35;margin-top:10px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:monospace">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: P.bg,      role: 'VOID BG'   },
    { hex: P.surface, role: 'SURFACE'   },
    { hex: P.surface2,role: 'ELEVATED'  },
    { hex: P.surface3,role: 'ACTIVE'    },
    { hex: P.border,  role: 'BORDER'    },
    { hex: P.fg,      role: 'FOREGROUND'},
    { hex: P.muted,   role: 'MUTED'     },
    { hex: P.accent,  role: 'VIOLET'    },
    { hex: P.accent2, role: 'PINK'      },
    { hex: P.teal,    role: 'TEAL'      },
    { hex: P.amber,   role: 'AMBER'     },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:56px;max-width:76px">
      <div style="height:44px;border-radius:8px;background:${sw.hex};border:1px solid ${P.accent}22;margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1px;opacity:.4;margin-bottom:3px;font-family:monospace">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accent};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  // Type scale
  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '52px', weight: '800', sample: 'MNEMO', mono: false },
    { label: 'HEADLINE', size: '22px', weight: '800', sample: 'Capture. Connect. Remember.', mono: false },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'Your AI second brain surfaces connections you\'d never find alone.', mono: false, lh: '1.6' },
    { label: 'MONO/TAG', size: '9px',  weight: '700', sample: 'AI LINKED · RESEARCH · 2 MIN AGO', mono: true, ls: '2px' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${P.accent}18">
      <div style="font-size:8px;letter-spacing:2px;opacity:.35;margin-bottom:8px;font-family:monospace">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:${t.lh || '1.2'};color:${P.fg};font-family:${t.mono ? 'monospace' : 'system-ui,-apple-system,sans-serif'};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;letter-spacing:${t.ls || 'normal'}">${t.sample}</div>
    </div>`).join('');

  // Spacing
  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:9px;opacity:.35;width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp * 2.2}px;opacity:.65"></div>
    </div>`).join('');

  // Design principles
  const principles = [
    'Deep violet-space palette — #07060E is not pure black. The violet undertone makes darkness feel intelligent rather than empty.',
    'Bento asymmetry inspired by Linear — tiles of varying dimensions create information hierarchy from density alone. No decorative dividers needed.',
    'Neural glow decoration — layered concentric ellipses simulate associative connection, appearing at UI moments of maximum meaning (AI insights, capture CTAs, count displays).',
    'Electric violet breaks the sea of blue — #7C5CFF signals neural intelligence, intuition, and memory rather than "developer tool" or "fintech."',
    'GitHub heatmap for habit building — the 84-cell activity grid provides streak motivation without gamification. Seeing your capture history makes the invisible habit visible.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:14px;margin-bottom:18px;align-items:flex-start">
      <div style="color:${P.accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:3px;font-family:monospace;opacity:.6">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.55;line-height:1.7">${p}</div>
    </div>`).join('');

  // CSS tokens
  const cssTokens = `:root {
  /* MNEMO — Design Tokens · March 2026 */

  /* Background layers */
  --color-bg:         #07060E;   /* deep space void — near-black with violet undertone */
  --color-surface:    #0F0D1A;   /* card surface */
  --color-surface-2:  #16132A;   /* elevated / hover state */
  --color-surface-3:  #1E1B35;   /* active / selected */

  /* Borders */
  --color-border:     #2A2545;   /* hairline */
  --color-border-2:   #3D3766;   /* brighter edge / accent border */

  /* Text */
  --color-fg:         #EDE8FF;   /* lavender-white foreground */
  --color-muted:      #6B6490;   /* secondary text */

  /* Brand accents */
  --color-accent:     #7C5CFF;   /* electric violet — primary */
  --color-accent-dim: #7C5CFF22; /* glow fill */
  --color-pink:       #FF5CA8;   /* hot pink — connections / secondary */
  --color-pink-dim:   #FF5CA822;

  /* Semantic */
  --color-teal:       #22D3A4;   /* captured / success */
  --color-amber:      #FFAB3E;   /* needs review */

  /* Typography */
  --font-sans:   system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono:   'SF Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  --text-display: 800 clamp(36px, 5vw, 52px) / 1.0 var(--font-sans);
  --text-heading: 800 22px / 1.2 var(--font-sans);
  --text-subhead: 600 16px / 1.4 var(--font-sans);
  --text-body:    400 14px / 1.6 var(--font-sans);
  --text-label:   700 9px  / 1.0 var(--font-sans);
  --text-mono:    400 11px / 1.0 var(--font-mono);

  /* Spacing */
  --space-1: 4px;    --space-2: 8px;    --space-3: 12px;
  --space-4: 16px;   --space-5: 24px;   --space-6: 32px;
  --space-7: 48px;   --space-8: 64px;

  /* Radii */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-pill: 9999px;

  /* Elevation */
  --shadow-card:  0 1px 3px #00000066, inset 0 1px 0 #ffffff06;
  --shadow-glow:  0 0 48px #7C5CFF1A;
  --shadow-pink:  0 0 32px #FF5CA81A;
}`;

  const shareText = encodeURIComponent(
    'MNEMO — AI memory & knowledge vault. Deep violet-space palette + bento grid + neural connection UI. 5 screens + brand spec + CSS tokens. By RAM Design Studio'
  );
  const prdHtml = mdToHtml(prdMarkdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MNEMO — AI Memory Vault · RAM Design Studio</title>
<meta name="description" content="Capture. Connect. Remember. — AI-powered personal knowledge vault. Violet-space palette, bento grid, neural connection UI. 5 screens + full brand spec.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:${P.bg};color:${P.fg};font-family:system-ui,-apple-system,'Segoe UI',sans-serif;min-height:100vh;overflow-x:hidden}
  /* Ambient glow bg */
  .amb{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
  .amb::before{content:'';position:absolute;top:-15%;right:-5%;width:700px;height:700px;background:radial-gradient(circle,${P.accent}0C 0%,transparent 65%);border-radius:50%}
  .amb::after{content:'';position:absolute;bottom:-15%;left:-5%;width:500px;height:500px;background:radial-gradient(circle,${P.accent2}08 0%,transparent 65%);border-radius:50%}
  body>*:not(.amb){position:relative;z-index:1}
  /* Nav */
  nav{padding:18px 40px;border-bottom:1px solid ${P.accent}18;display:flex;justify-content:space-between;align-items:center}
  .logo{display:flex;align-items:center;gap:12px}
  .logo-mark{width:28px;height:28px;background:${P.accent};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff}
  .logo-name{font-size:14px;font-weight:800;letter-spacing:2px;color:${P.fg}}
  .nav-tag{font-size:10px;color:${P.muted};letter-spacing:1px;font-family:monospace}
  /* Hero */
  .hero{padding:80px 40px 48px;max-width:1040px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:24px;font-family:monospace;font-weight:700}
  h1{font-size:clamp(72px,12vw,128px);font-weight:800;letter-spacing:-4px;line-height:0.92;margin-bottom:20px}
  h1 .dot{color:${P.accent}}
  h1 .sub-word{color:${P.accent2}}
  .sub{font-size:20px;opacity:.45;max-width:480px;line-height:1.55;margin-bottom:36px}
  /* Meta grid */
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:8px;opacity:.35;letter-spacing:2.5px;margin-bottom:5px;font-family:monospace}
  .meta-item strong{color:${P.accent};font-size:11px;font-family:monospace;letter-spacing:.5px}
  /* Buttons */
  .actions{display:flex;gap:10px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:24px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:.6px;transition:transform .15s,opacity .15s}
  .btn:hover{transform:translateY(-1px);opacity:.9}
  .btn-p{background:${P.accent};color:#fff}
  .btn-s{background:${P.accent}18;color:${P.fg};border:1px solid ${P.accent}44}
  .btn-x{background:rgba(255,255,255,.04);color:${P.fg};border:1px solid ${P.accent}22}
  /* Sections */
  .section{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:24px;padding-bottom:14px;border-bottom:1px solid ${P.accent}18;font-family:monospace;font-weight:700}
  /* Thumbs */
  .thumbs{display:flex;gap:24px;overflow-x:auto;padding-bottom:14px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  /* Brand section */
  .brand{padding:60px 40px;border-top:1px solid ${P.accent}18;max-width:1040px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px}
  @media(max-width:680px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  /* Tokens */
  .tokens-wrap{margin-top:40px}
  .tokens-box{background:${P.surface};border:1px solid ${P.accent}22;border-radius:14px;padding:20px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.9;color:#9E8ECC;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:14px;right:14px;background:${P.accent}22;border:1px solid ${P.accent}44;color:${P.accent};font-family:monospace;font-size:9px;letter-spacing:1.5px;padding:7px 16px;cursor:pointer;font-weight:800;border-radius:10px;transition:background .15s}
  .copy-btn:hover{background:${P.accent}33}
  /* Prompt */
  .prompt-sec{padding:40px;border-top:1px solid ${P.accent}18}
  .p-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:16px;font-family:monospace;font-weight:700}
  .p-text{font-size:17px;opacity:.45;font-style:italic;max-width:700px;line-height:1.75}
  /* PRD */
  .prd-sec{padding:40px;border-top:1px solid ${P.accent}18;max-width:800px}
  .prd-sec h3{font-size:9px;letter-spacing:2.5px;color:${P.accent};margin:32px 0 12px;font-weight:800;font-family:monospace}
  .prd-sec h3:first-child{margin-top:0}
  .prd-sec p,.prd-sec li{font-size:14px;opacity:.55;line-height:1.85;max-width:700px}
  .prd-sec ul{padding-left:20px;margin:10px 0}
  .prd-sec li{margin-bottom:8px}
  .prd-sec strong{opacity:1;color:${P.fg};font-weight:600}
  /* Footer */
  footer{padding:28px 40px;border-top:1px solid ${P.accent}18;font-size:11px;opacity:.25;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:monospace}
  /* Toast */
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:#fff;font-family:monospace;font-size:11px;font-weight:800;letter-spacing:1px;padding:10px 22px;border-radius:22px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="amb"></div>
<div class="toast" id="toast"></div>

<nav>
  <div class="logo">
    <div class="logo-mark">M</div>
    <div class="logo-name">MNEMO</div>
  </div>
  <div class="nav-tag">RAM DESIGN STUDIO · HEARTBEAT · ${dateStr}</div>
</nav>

<section class="hero">
  <div class="tag">AI PRODUCTIVITY · DARK MODE · KNOWLEDGE VAULT · ${dateStr}</div>
  <h1>MNEMO<span class="dot">.</span></h1>
  <p class="sub">Capture. Connect. Remember.<br>Your AI second brain, built for the new wave of knowledge workers.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 (4 MOBILE + 1 DESKTOP)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>AI PRODUCTIVITY · PKM</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>VIOLET-SPACE · NEURAL GLOW</strong></div>
    <div class="meta-item"><span>LAYOUT</span><strong>BENTO GRID · HEATMAP</strong></div>
    <div class="meta-item"><span>INSPIRATION</span><strong>LINEAR + MIDDAY.AI</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <a class="btn btn-x" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
  </div>
</section>

<section class="section">
  <div class="section-label">SCREEN THUMBNAILS · 4 MOBILE + 1 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div class="section-label" style="margin-bottom:18px">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>

      <div class="section-label" style="margin-top:44px;margin-bottom:18px">SPACING SYSTEM</div>
      ${spacingHTML}
    </div>
    <div>
      <div class="section-label" style="margin-bottom:18px">TYPE SCALE</div>
      ${typeScaleHTML}

      <div class="section-label" style="margin-top:44px;margin-bottom:18px">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>
  </div>

  <div class="tokens-wrap">
    <div class="section-label">CSS DESIGN TOKENS</div>
    <div class="tokens-box">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-sec">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-sec">
  <div class="p-label">PRODUCT BRIEF / PRD</div>
  ${prdHtml}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat · Inspired by Linear (godly.website) + Midday.ai (darkmodedesign.com) + land-book.com</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = '${encoded}';
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function openInViewer() {
  try {
    const jsonStr = atob(D); JSON.parse(jsonStr);
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'mnemo.pen' }));
    window.open('https://ram.zenbin.org/mnemo-viewer', '_blank');
  } catch(e) { alert('Could not load: ' + e.message); }
}
function downloadPen() {
  try {
    const blob = new Blob([atob(D)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'mnemo.pen'; a.click();
    URL.revokeObjectURL(a.href);
  } catch(e) { alert('Download failed: ' + e.message); }
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT)
    .then(() => toast('Prompt copied ✓'))
    .catch(() => { const ta = document.createElement('textarea'); ta.value = PROMPT; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('Prompt copied ✓'); });
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(() => toast('CSS tokens copied ✓'))
    .catch(() => { const ta = document.createElement('textarea'); ta.value = CSS_TOKENS; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('CSS tokens copied ✓'); });
}
function shareOnX() {
  const text = encodeURIComponent('MNEMO — AI memory & knowledge vault. Deep violet-space palette + bento grid + neural connection UI. 5 screens + full brand spec. By RAM Design Studio');
  const url = encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
}
</script>
</body>
</html>`;
}

// ── HTTPS helper ───────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Zenbin publisher ───────────────────────────────────────────────────────────
async function publish(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'Content-Length':  Buffer.byteLength(body),
      'X-Subdomain':     'ram',
    },
  }, body);
}

// ── GitHub queue helpers ───────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN || '';
const GITHUB_REPO  = config.GITHUB_REPO  || '';
const QUEUE_FILE   = config.QUEUE_FILE   || 'queue.json';

async function getQueue() {
  const r = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent':    'RAM-Design-Studio',
      'Accept':        'application/vnd.github.v3+json',
    },
  });
  const json = JSON.parse(r.body);
  return {
    queue: JSON.parse(Buffer.from(json.content, 'base64').toString('utf8')),
    sha:   json.sha,
  };
}

async function updateQueue(queue, sha) {
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body    = JSON.stringify({ message: 'heartbeat: mnemo published', content, sha });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent':    'RAM-Design-Studio',
      'Content-Type':  'application/json',
      'Accept':        'application/vnd.github.v3+json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🧠 MNEMO — Full Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Load pen
  const penPath = path.join(__dirname, 'mnemo.pen');
  if (!fs.existsSync(penPath)) {
    console.error('❌ mnemo.pen not found — run: node mnemo-app.js');
    process.exit(1);
  }
  const pen    = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  const penRaw = fs.readFileSync(penPath, 'utf8');
  console.log(`✓ Loaded mnemo.pen — ${pen.children.length} screens`);

  // Build hero
  const heroHTML = buildHeroHTML(pen);
  console.log(`✓ Hero HTML — ${(heroHTML.length / 1024).toFixed(1)} KB`);

  // Build viewer with embedded pen
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml;
  if (fs.existsSync(viewerPath)) {
    viewerHtml = fs.readFileSync(viewerPath, 'utf8');
    const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penRaw)};<\/script>`;
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
    console.log(`✓ Viewer built — ${(viewerHtml.length / 1024).toFixed(1)} KB`);
  } else {
    console.warn('⚠ penviewer-app.html not found — building minimal viewer stub');
    viewerHtml = `<!DOCTYPE html><html><head><title>MNEMO Viewer</title></head><body>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penRaw)};<\/script>
<script>document.body.innerHTML='<p style="font:14px monospace;padding:24px;color:#EDE8FF;background:#07060E;min-height:100vh">MNEMO.pen embedded. Open ram.zenbin.org/mnemo to view the full design page.</p>'<\/script>
</body></html>`;
  }

  // ── Publish hero ──────────────────────────────────────────────────────────
  console.log('\n  Publishing hero   → ram.zenbin.org/mnemo ...');
  const r1 = await publish('mnemo', 'MNEMO — AI Memory Vault · RAM Design Studio', heroHTML);
  const heroOk = r1.status === 200 || r1.status === 201;
  console.log(`  ${heroOk ? '✓' : '✗'} HTTP ${r1.status} ${!heroOk ? r1.body.slice(0,120) : ''}`);

  // ── Publish viewer ────────────────────────────────────────────────────────
  console.log('  Publishing viewer → ram.zenbin.org/mnemo-viewer ...');
  const r2 = await publish('mnemo-viewer', 'MNEMO — Viewer · RAM Design Studio', viewerHtml);
  const viewerOk = r2.status === 200 || r2.status === 201;
  console.log(`  ${viewerOk ? '✓' : '✗'} HTTP ${r2.status} ${!viewerOk ? r2.body.slice(0,120) : ''}`);

  // ── Gallery queue ─────────────────────────────────────────────────────────
  if (GITHUB_TOKEN && GITHUB_REPO) {
    console.log('\n  Updating gallery queue (GitHub)...');
    try {
      const { queue, sha } = await getQueue();
      const entry = {
        ...sub,
        design_url: 'https://ram.zenbin.org/mnemo',
        app_name:   meta.appName,
        archetype:  meta.archetype,
        app_type:   sub.app_type,
      };
      if (!queue.submissions) queue.submissions = [];
      const idx = queue.submissions.findIndex(s => s.id === sub.id);
      if (idx >= 0) queue.submissions[idx] = entry;
      else queue.submissions.push(entry);
      queue.updated_at = new Date().toISOString();

      const gr = await updateQueue(queue, sha);
      console.log(`  ${gr.status === 200 ? '✓ Gallery updated' : `✗ Error: HTTP ${gr.status}`}`);
    } catch(e) {
      console.warn(`  ⚠ Gallery update failed: ${e.message}`);
    }
  }

  console.log('\n🔗 Live URLs:');
  console.log('   Hero:   https://ram.zenbin.org/mnemo');
  console.log('   Viewer: https://ram.zenbin.org/mnemo-viewer');
  console.log('   Gallery: https://ram.zenbin.org/gallery');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
