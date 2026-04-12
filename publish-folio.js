#!/usr/bin/env node
// publish-folio.js — Full Design Discovery pipeline for FOLIO (HB#16)
// Pull Request Review UI in warm editorial light mode
// Inspired by Paper.design (#F0EFE4), Runway (#F8F7F5), Raw Materials (#F4E9E1)
// The stretch: code diffs + syntax highlighting done entirely in warm earth tones

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

const sub = {
  id:           'hb-folio-' + Date.now(),
  prompt:       'FOLIO — Code review & PR annotation tool in warm editorial light mode. Developer tools are always dark — FOLIO does code diffs on warm paper (#F0EFE4) with earth-tone syntax highlighting. Forest green keywords, sienna strings, warm-muted comments. No neon. Amber annotations like sticky notes. 9 screens (5 mobile + 4 desktop). HB#16.',
  app_type:     'developer-tools',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

// ── Palette ───────────────────────────────────────────────────────────────────
const BG      = '#F0EFE4';   // warm paper — Paper.design exact
const SURFACE = '#E8E6D8';   // aged paper card
const RAISED  = '#F6F5EC';   // elevated element
const BORDER  = '#C8C4B0';   // warm border
const INK     = '#1C1610';   // dark brown-black ink
const BROWN   = '#3E2510';   // deep walnut heading
const MID     = '#5A3E28';   // medium walnut
const MUTED   = '#7A6E5C';   // warm gray text
const AMBER   = '#C07030';   // golden amber CTA
const SAGE    = '#3A6030';   // warm sage — additions
const ROSE    = '#8A2218';   // warm rose — deletions
const NAVY    = '#2C3A5A';   // deep navy (one cool accent)

const prdMarkdown = `
## Overview

FOLIO is a pull request review and code annotation tool built around a single design constraint: warm paper light mode. Developer tooling lives in two modes — neon-on-black (VS Code dark theme) or sterile white (GitHub, GitLab). FOLIO is neither.

The design premise: code should feel like an annotated manuscript — the kind of marked-up document a thoughtful editor would hand back. Warm paper background, earth-tone syntax highlighting, amber "sticky note" annotations. Nothing that looks like a terminal or a hospital form.

## The Constraint

All syntax highlighting mapped to warm earth tones:
- **Keywords** (const, let, function, return) → forest green \`#3A5520\`
- **Strings** → warm sienna \`#7A3820\`
- **Comments** → warm muted \`#8A7E6C\`
- **Numbers / booleans** → dark brown \`#5A3010\`
- **Types / interfaces** → deep navy \`#2C3A5A\` (the one cool-tone exception)
- **Function names** → olive \`#5A5020\`

## Design Influences

**Paper.design** — A design tool on #F0EFE4 warm paper bg. Proof that technical tools can live on cream. FOLIO's background is Paper.design's exact color.

**Runway.com (runway.com/financial-planning)** — FP&A platform on #F8F7F5 warm off-white with dark brown text rgb(38,27,7). Shows technical SaaS thriving on warm neutral.

**therawmaterials.com** — Design agency on #F4E9E1 warm peach. The most editorial example — generous whitespace, warm shadows, typography-first.

**quinngtl.com** — Tax law firm on #F2EBE3 warm cream. Professional services leading the warm-mode charge.

**Convergence signal:** Land-book.com and godly.website (March 2026) show editorial/professional warm modes proliferating across SaaS, legal, agency, and design tools simultaneously.

## Target Users

Senior engineers and engineering managers at product teams (10–200 engineers) who spend 30–90 min/day doing code review. The warm editorial aesthetic reduces visual fatigue during long review sessions — the same reason physical books use off-white paper.

## Core Features

- **Warm diff view** — earth-tone syntax highlighting in unified diff format
- **Annotation system** — amber sticky-note callouts pinned to diff lines
- **PR timeline** — editorial review flow from open → review → approve → merge
- **Team activity feed** — warm editorial design for async collaboration
- **Review analytics** — velocity charts and reviewer leaderboard

## Design Language

- Surface hierarchy: 5 levels from raised (#F6F5EC) → paper (#F0EFE4) → surface (#E8E6D8) → card (#DEDAD0) → border (#C8C4B0)
- Typography: Inter for UI, JetBrains Mono for code — warm brown weight on cream
- Shadows: warm taupe rgba(90,60,30,0.08) — never neutral gray
- Chips & badges: earthy bgcolors (amber for review, sage for approved, rose for changes)

## Screen Architecture

**Mobile (390×844 — 5 screens):**
1. Dashboard — PR list with warm bento cards, status chips, diff mini-bars
2. PR Detail — Title, description, file list, reviewer status, CI checks
3. Code Diff — Main annotation interface with earth-tone syntax highlighting
4. Comment Thread — Inline review comments with amber sticky note callouts
5. Activity Feed — Team review timeline with editorial spacing

**Desktop (1440×900 — 4 screens):**
1. Dashboard — Two-column table view with sidebar navigation
2. Code Review — Three-panel: file tree + diff + comment sidebar
3. PR Overview — Full PR detail with metadata, checklist, CI status
4. Analytics — Review velocity charts, reviewer leaderboard, code churn
`;

// ── Utilities ──────────────────────────────────────────────────────────────────
function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- \*\*(.+?)\*\*[—:] (.+)$/gm, '<li><strong>$1</strong>: $2</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>');
}

function zenPost(slug, title, html, subdomain) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (subdomain) headers['X-Subdomain'] = subdomain;
    const req = https.request(
      { hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST', headers },
      res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero HTML ──────────────────────────────────────────────────────────────────
function buildHeroHTML(doc) {
  const screens = doc.children || [];
  const THUMB_H = 180;
  const screenLabels = [
    'M · Dashboard', 'M · PR Detail', 'M · Code Diff', 'M · Comments', 'M · Activity',
    'D · Dashboard', 'D · Code Review', 'D · PR Overview', 'D · Analytics',
  ];

  const thumbsHTML = screens.map((s, i) => {
    const sw = s.width, sh = s.height;
    const tw = Math.round(THUMB_H * (sw / sh));
    const isMobile = sw < 500;
    const label = screenLabels[i] || `${isMobile ? 'M' : 'D'} · ${i+1}`;
    const els = (s.children || []).slice(0, 80);
    const rects = els.map(el => {
      if (!el || !el.fill || el.fill === 'transparent') return '';
      const ew = Math.max(0, el.width || 0), eh = Math.max(0, el.height || 0);
      if (ew === 0 || eh === 0) return '';
      const r = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, ew/2, eh/2)}"` : '';
      const op = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
      return `<rect x="${el.x||0}" y="${el.y||0}" width="${ew}" height="${eh}" fill="${el.fill}"${r}${op}/>`;
    }).join('');
    const thumbSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${THUMB_H}" style="display:block;border-radius:8px;flex-shrink:0;box-shadow:0 2px 16px rgba(90,62,32,0.14)"><rect width="${sw}" height="${sh}" fill="${BG}"/>${rects}</svg>`;
    return `<div style="text-align:center;flex-shrink:0">
      ${thumbSvg}
      <div style="font-size:9px;opacity:.45;margin-top:8px;letter-spacing:1px;color:${MID};font-family:monospace;max-width:${tw}px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: BG,      role: 'PAPER' },
    { hex: SURFACE, role: 'SURFACE' },
    { hex: RAISED,  role: 'RAISED' },
    { hex: BORDER,  role: 'BORDER' },
    { hex: AMBER,   role: 'AMBER' },
    { hex: SAGE,    role: 'SAGE' },
    { hex: ROSE,    role: 'ROSE' },
    { hex: NAVY,    role: 'NAVY' },
    { hex: INK,     role: 'INK' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:54px">
      <div style="height:40px;border-radius:6px;background:${sw.hex};border:1.5px solid ${BORDER};margin-bottom:6px"></div>
      <div style="font-size:8px;letter-spacing:1.2px;opacity:.45;margin-bottom:2px;color:${MID}">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${MID};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* FOLIO — Code Review · RAM Heartbeat #16 */

  /* Warm Paper Surface System */
  --bg:        #F0EFE4;   /* warm paper — Paper.design exact */
  --surface:   #E8E6D8;   /* aged paper card */
  --surface-2: #DEDAD0;   /* deeper surface */
  --raised:    #F6F5EC;   /* elevated element */
  --border:    #C8C4B0;   /* warm border */
  --rule:      #D8D4C0;   /* subtle divider rule */

  /* Ink Scale — warm brown, never neutral gray */
  --ink:       #1C1610;   /* dark brown-black ink — body */
  --brown:     #3E2510;   /* deep walnut — headings */
  --mid:       #5A3E28;   /* medium walnut — secondary */
  --muted:     #7A6E5C;   /* warm gray — labels, captions */
  --faint:     #ACA090;   /* very faint — metadata, placeholders */

  /* Functional Colors */
  --amber:     #C07030;   /* CTA, review status, annotations */
  --amber-bg:  #F0DDB0;   /* annotation highlight bg */
  --sage:      #3A6030;   /* additions, approved, success */
  --sage-bg:   #D8E8CC;   /* addition bg */
  --rose:      #8A2218;   /* deletions, changes, danger */
  --rose-bg:   #F0D0CC;   /* deletion bg */
  --navy:      #2C3A5A;   /* types, links — one cool accent */
  --navy-bg:   #D4DCF0;   /* navy bg */

  /* Warm Syntax Highlighting (no neon) */
  --syn-keyword: #3A5520;  /* forest green — const, let, function, return */
  --syn-string:  #7A3820;  /* warm sienna — strings */
  --syn-comment: #8A7E6C;  /* warm muted — // comments */
  --syn-number:  #5A3010;  /* dark brown — numbers, booleans */
  --syn-type:    #2C3A5A;  /* navy — TypeScript types, interfaces */
  --syn-fn:      #5A5020;  /* olive — function names */
  --syn-punct:   #6A5E4C;  /* medium muted — brackets, semicolons */

  /* Shadows — warm taupe, never neutral gray */
  --shadow-sm:   0 1px 3px rgba(90,62,32,0.06);
  --shadow-md:   0 2px 8px rgba(90,62,32,0.09);
  --shadow-lg:   0 4px 20px rgba(90,62,32,0.12);
  --shadow-card: 2px 3px 0 rgba(138,110,80,0.14);

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 32px; --space-6: 48px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --radius-pill: 999px;
}`;

  const prdHtml = mdToHtml(prdMarkdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FOLIO — Code Review · RAM Design Studio</title>
<meta name="description" content="Code review & PR annotation in warm editorial light mode. Earth-tone syntax highlighting on paper. Developer tools, reimagined.">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: ${BG};
    color: ${INK};
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  /* Nav */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: ${BG}dd;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${BORDER};
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 32px;
  }
  .nav-logo {
    font-size: 18px; font-weight: 800; color: ${BROWN}; letter-spacing: -0.5px;
    text-decoration: none;
  }
  .nav-id {
    font-size: 10px; letter-spacing: 1.5px; color: ${MUTED}; text-transform: uppercase;
    font-family: monospace;
  }
  /* Hero */
  .hero {
    padding: 80px 32px 48px;
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
  }
  .hero-eyebrow {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: ${AMBER}; font-weight: 700; margin-bottom: 20px;
  }
  .hero-title {
    font-size: clamp(52px, 8vw, 88px);
    font-weight: 800; color: ${BROWN};
    letter-spacing: -2px; line-height: 1;
    margin-bottom: 24px;
  }
  .hero-tagline {
    font-size: 22px; color: ${MID}; font-weight: 400;
    line-height: 1.45; margin-bottom: 16px;
    max-width: 580px; margin-left: auto; margin-right: auto;
  }
  .hero-prompt {
    font-size: 14px; color: ${MUTED}; font-style: italic;
    max-width: 640px; margin: 0 auto 32px;
    line-height: 1.65;
  }
  /* Buttons */
  .btn-row {
    display: flex; flex-wrap: wrap; gap: 10px;
    justify-content: center; margin-bottom: 12px;
  }
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 8px; font-size: 13px;
    font-weight: 600; text-decoration: none; border: none;
    cursor: pointer; font-family: inherit; transition: opacity .15s;
  }
  .btn:hover { opacity: .8; }
  .btn-p { background: ${AMBER}; color: #fff; }
  .btn-s {
    background: ${SURFACE}; color: ${BROWN};
    border: 1.5px solid ${BORDER};
  }
  /* Screens strip */
  .screens-wrap {
    background: ${SURFACE};
    border-top: 1px solid ${BORDER};
    border-bottom: 1px solid ${BORDER};
    padding: 32px 0; margin: 40px 0;
    overflow-x: auto;
  }
  .screens-strip {
    display: flex; gap: 20px; padding: 0 40px;
    width: max-content;
  }
  /* Brand section */
  .section {
    max-width: 900px; margin: 0 auto; padding: 0 32px 56px;
  }
  .section-label {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: ${AMBER}; font-weight: 700; margin-bottom: 24px;
  }
  /* Palette */
  .palette {
    display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 32px;
  }
  /* CSS Tokens */
  .tokens-wrap {
    position: relative;
    background: ${RAISED};
    border: 1px solid ${BORDER};
    border-radius: 10px;
    overflow: hidden;
  }
  .tokens-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
    background: ${SURFACE};
    border-bottom: 1px solid ${BORDER};
  }
  .tokens-label {
    font-size: 11px; font-weight: 600; color: ${MUTED};
    text-transform: uppercase; letter-spacing: 1px;
  }
  .copy-btn {
    font-size: 11px; font-weight: 700; color: ${AMBER};
    background: ${AMBER}20; border: 1px solid ${AMBER}50;
    border-radius: 6px; padding: 4px 12px; cursor: pointer;
    font-family: inherit; transition: background .15s;
  }
  .copy-btn:hover { background: ${AMBER}30; }
  .tokens-code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; color: ${MID};
    padding: 20px; margin: 0;
    white-space: pre; overflow-x: auto;
    line-height: 1.65;
  }
  /* PRD */
  .prd-body h3 { font-size: 16px; font-weight: 700; color: ${BROWN}; margin: 28px 0 12px; }
  .prd-body p  { font-size: 13px; color: ${MID}; line-height: 1.7; margin-bottom: 12px; }
  .prd-body li { font-size: 13px; color: ${MID}; line-height: 1.6; margin-left: 20px; margin-bottom: 6px; }
  .prd-body code { font-family: monospace; font-size: 12px; color: ${AMBER}; background: ${SURFACE}; padding: 1px 5px; border-radius: 3px; }
  .prd-body strong { color: ${BROWN}; }
  /* Design tokens for inspiration source */
  .inspo-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-top: 16px;
  }
  .inspo-card {
    background: ${RAISED};
    border: 1px solid ${BORDER};
    border-radius: 10px;
    padding: 16px;
  }
  .inspo-url {
    font-size: 10px; font-family: monospace; color: ${AMBER};
    margin-bottom: 8px;
  }
  .inspo-note {
    font-size: 12px; color: ${MID}; line-height: 1.55;
  }
  /* Footer */
  footer {
    border-top: 1px solid ${BORDER};
    padding: 32px;
    text-align: center;
    font-size: 11px;
    color: ${MUTED};
  }
  /* Toast */
  .toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(16px);
    background: ${BROWN}; color: #fff;
    padding: 8px 20px; border-radius: 999px;
    font-size: 12px; font-weight: 600;
    opacity: 0; transition: opacity .2s, transform .2s;
    pointer-events: none; z-index: 999;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  /* Syntax demo */
  .syn-demo {
    display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px;
  }
  .syn-token {
    display: flex; align-items: center; gap: 8px;
    background: ${RAISED}; border: 1px solid ${BORDER};
    border-radius: 6px; padding: 6px 12px;
    font-family: monospace; font-size: 11px;
  }
  .syn-dot {
    width: 10px; height: 10px; border-radius: 50%;
  }
</style>
</head>
<body>

<nav class="nav">
  <a href="https://ram.zenbin.org/" class="nav-logo">RAM</a>
  <div class="nav-id">HB-FOLIO-#16 · ${new Date().toISOString().slice(0,10)}</div>
</nav>

<div class="hero">
  <div class="hero-eyebrow">RAM Design Heartbeat #16 · Developer Tools</div>
  <h1 class="hero-title">FOLIO</h1>
  <p class="hero-tagline">Code review that feels like annotating a manuscript — not staring at a terminal.</p>
  <p class="hero-prompt">"Design FOLIO — a pull request review tool in warm editorial light mode. Inspired by paper.design's #F0EFE4 warm paper, runway.com's warm off-white FP&A aesthetic, and therawmaterials.com's editorial peach. The stretch: earth-tone syntax highlighting. No neon. Code on cream."</p>
  <div class="btn-row">
    <a class="btn btn-p" href="https://ram.zenbin.org/folio-viewer">▶ Open in Viewer</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/folio-pen/raw" download="folio.pen">↓ Download .pen</a>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</div>

<div class="screens-wrap">
  <div class="screens-strip">${thumbsHTML}</div>
</div>

<div class="section">
  <div class="section-label">Brand Palette</div>
  <div class="palette">${swatchHTML}</div>

  <div style="margin-bottom: 12px; font-size: 11px; color: ${MUTED}">
    <strong style="color:${BROWN}">Warm Paper Surface System</strong> — 5 levels of warm paper depth.
    Shadows in warm taupe rgba(90,62,32,0.09), never neutral gray.
    One cool accent (navy) for TypeScript types — everything else stays warm earth.
  </div>

  <div style="margin-bottom: 32px;">
    <div style="font-size: 11px; font-weight: 700; color: ${MUTED}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Warm Syntax Palette</div>
    <div class="syn-demo">
      <div class="syn-token"><div class="syn-dot" style="background:#3A5520"></div><span style="color:#3A5520">keyword</span><span style="color:${MUTED}">#3A5520</span></div>
      <div class="syn-token"><div class="syn-dot" style="background:#7A3820"></div><span style="color:#7A3820">string</span><span style="color:${MUTED}">#7A3820</span></div>
      <div class="syn-token"><div class="syn-dot" style="background:#8A7E6C"></div><span style="color:#8A7E6C">comment</span><span style="color:${MUTED}">#8A7E6C</span></div>
      <div class="syn-token"><div class="syn-dot" style="background:#5A3010"></div><span style="color:#5A3010">number</span><span style="color:${MUTED}">#5A3010</span></div>
      <div class="syn-token"><div class="syn-dot" style="background:#2C3A5A"></div><span style="color:#2C3A5A">type</span><span style="color:${MUTED}">#2C3A5A</span></div>
      <div class="syn-token"><div class="syn-dot" style="background:#5A5020"></div><span style="color:#5A5020">function</span><span style="color:${MUTED}">#5A5020</span></div>
    </div>
  </div>

  <div class="tokens-wrap" style="margin-bottom:40px">
    <div class="tokens-header">
      <span class="tokens-label">CSS Design Tokens</span>
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    </div>
    <pre class="tokens-code" id="tokens">${cssTokens}</pre>
  </div>

  <div class="section-label" style="margin-top:40px">Design Research</div>
  <div class="inspo-grid">
    <div class="inspo-card">
      <div class="inspo-url">paper.design</div>
      <p class="inspo-note">Background color: rgb(240,239,228) = #F0EFE4. A design tool living on warm cream — FOLIO's exact background color. Proved that technical products can be beautiful on paper tones.</p>
    </div>
    <div class="inspo-card">
      <div class="inspo-url">runway.com</div>
      <p class="inspo-note">FP&A platform with bg rgb(248,247,245) and near-black text rgb(38,27,7) — warm brown, not neutral black. Shows financial SaaS thriving on warm off-white with editorial typography.</p>
    </div>
    <div class="inspo-card">
      <div class="inspo-url">therawmaterials.com</div>
      <p class="inspo-note">Design agency on warm peach rgb(244,233,225) = #F4E9E1. The most editorial example — generous white space, warm taupe shadows, no decorative elements. Pure warmth and typography.</p>
    </div>
    <div class="inspo-card">
      <div class="inspo-url">quinngtl.com (siteinspire)</div>
      <p class="inspo-note">International tax law firm on rgb(242,235,227) = #F2EBE3. Professional services leading warm-mode adoption. The convergence: technical → editorial warm is happening across every sector.</p>
    </div>
  </div>

  <div class="section-label" style="margin-top:48px">Full Product Brief</div>
  <div class="prd-body">${prdHtml}</div>
</div>

<footer>
  <div style="margin-bottom:8px">
    <a href="https://ram.zenbin.org/" style="color:inherit;text-decoration:none">ram.zenbin.org</a>
    <span style="margin:0 12px;opacity:.3">·</span>
    <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none">Gallery</a>
    <span style="margin:0 12px;opacity:.3">·</span>
    <span>FOLIO · HB#16 · ${new Date().toISOString().slice(0,10)}</span>
  </div>
  <div style="opacity:.4">RAM Design Studio — Warm editorial light mode · Developer tooling on paper</div>
</footer>

<div class="toast" id="toast">Copied!</div>

<script>
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function copyTokens(){
  const code=document.getElementById('tokens').textContent;
  navigator.clipboard.writeText(code).then(()=>toast('Tokens copied!')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=code;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Tokens copied!');
  });
}
function copyPrompt(){
  const p="Design FOLIO — a pull request review tool in warm editorial light mode. Inspired by paper.design's #F0EFE4 warm paper, runway.com's warm off-white FP&A aesthetic, and therawmaterials.com's editorial peach. The stretch: earth-tone syntax highlighting on warm paper — forest green keywords, sienna strings, warm muted comments. No neon, no dark mode. Amber sticky-note annotations. 9 screens (5 mobile, 4 desktop): PR dashboard, PR detail, code diff view, comment thread, activity feed, desktop dashboard table, desktop 3-panel code review, PR overview, analytics.";
  navigator.clipboard.writeText(p).then(()=>toast('Prompt copied!')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=p;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Prompt copied!');
  });
}
</script>
</body>
</html>`;
}

// ── Viewer HTML ────────────────────────────────────────────────────────────────
function buildViewerHTML(penJsonStr) {
  const minified = JSON.stringify(JSON.parse(penJsonStr));
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let html = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(minified)};<\/script>`;
  return html.replace('<script>', injection + '\n<script>');
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📄  FOLIO — Full Design Discovery Pipeline (HB#16)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const penPath = path.join(__dirname, 'folio.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ folio.pen not found — run: node folio-app.js');
    process.exit(1);
  }
  const penJsonStr = fs.readFileSync(penPath, 'utf8');
  const doc = JSON.parse(penJsonStr);
  const screens = doc.children || [];
  console.log(`✓ Loaded folio.pen — ${screens.length} screens`);
  screens.forEach(s => console.log(`  ${s.name.padEnd(22)} ${s.width}×${s.height}  ${(s.children||[]).length} els`));

  // 1. Raw pen JSON
  console.log('\n📤 Publishing pen JSON → ram.zenbin.org/folio-pen...');
  const minifiedPen = JSON.stringify(JSON.parse(penJsonStr));
  const penKb = (Buffer.byteLength(minifiedPen) / 1024).toFixed(1);
  console.log(`  Pen size: ${penKb}kb`);
  const penRes = await zenPost('folio-pen', 'FOLIO .pen file', minifiedPen, 'ram');
  console.log(`  HTTP ${penRes.status} — ${[200,201].includes(penRes.status) ? '✅ Published' : '❌ Failed'}`);
  if (![200,201].includes(penRes.status)) console.log('  Error:', penRes.body.slice(0,300));

  // 2. Hero page
  console.log('\n📤 Publishing hero → ram.zenbin.org/folio...');
  const heroHtml = buildHeroHTML(doc);
  const heroKb = (Buffer.byteLength(JSON.stringify({ title: 'FOLIO', html: heroHtml })) / 1024).toFixed(1);
  console.log(`  Hero size: ${heroKb}kb`);
  const heroRes = await zenPost('folio', 'FOLIO — Code Review · RAM Design Studio', heroHtml, 'ram');
  console.log(`  HTTP ${heroRes.status} — ${[200,201].includes(heroRes.status) ? '✅ Published' : '❌ Failed'}`);
  if (![200,201].includes(heroRes.status)) console.log('  Error:', heroRes.body.slice(0,300));

  // 3. Viewer
  console.log('\n📤 Publishing viewer → ram.zenbin.org/folio-viewer...');
  const viewerHtml = buildViewerHTML(penJsonStr);
  const viewerKb = (Buffer.byteLength(JSON.stringify({ title: 'FOLIO Viewer', html: viewerHtml })) / 1024).toFixed(1);
  console.log(`  Viewer size: ${viewerKb}kb`);
  if (parseFloat(viewerKb) > 512) {
    console.log(`  ⚠ Viewer too large (${viewerKb}kb > 512kb) — skipping viewer`);
  } else {
    const viewerRes = await zenPost('folio-viewer', 'FOLIO Viewer', viewerHtml, 'ram');
    console.log(`  HTTP ${viewerRes.status} — ${[200,201].includes(viewerRes.status) ? '✅ Published' : '❌ Failed'}`);
    if (![200,201].includes(viewerRes.status)) console.log('  Error:', viewerRes.body.slice(0,300));
  }

  console.log('\n✅ FOLIO live:');
  console.log('   Hero:   https://ram.zenbin.org/folio');
  console.log('   Viewer: https://ram.zenbin.org/folio-viewer');
  console.log('   Pen:    https://ram.zenbin.org/folio-pen/raw');

  // 4. Gallery registry
  const CONFIG_PATH = path.join(__dirname, 'community-config.json');
  let config = {};
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch {}
  const TOKEN = process.env.GITHUB_TOKEN || config.GITHUB_TOKEN || '';
  const REPO  = process.env.GITHUB_REPO  || config.GITHUB_REPO  || '';
  if (TOKEN && REPO) {
    console.log('\n📋 Updating gallery registry...');
    try {
      const getRes = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'api.github.com',
          path: `/repos/${REPO}/contents/queue.json`,
          headers: {
            'Authorization': `token ${TOKEN}`,
            'User-Agent': 'ram-studio/1.0',
            'Accept': 'application/vnd.github.v3+json',
          }
        }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
        req.on('error', reject); req.end();
      });

      if (getRes.status === 200) {
        const fd = JSON.parse(getRes.body);
        const queue = JSON.parse(Buffer.from(fd.content, 'base64').toString('utf8'));
        const entry = {
          id: sub.id,
          prompt: sub.prompt,
          app_type: 'developer-tools',
          credit: 'RAM Studio',
          submitted_at: sub.submitted_at,
          status: 'done',
          app_name: 'FOLIO',
          tagline: 'Code review on warm paper. Earth-tone syntax. No neon.',
          archetype: 'Developer Tools',
          design_url: 'https://ram.zenbin.org/folio',
          viewer_url: 'https://ram.zenbin.org/folio-viewer',
          published_at: new Date().toISOString(),
          source: 'heartbeat',
          palette: { bg: BG, fg: INK, accent: AMBER, accent2: SAGE },
          screens: screens.length,
          tags: ['developer-tools', 'light-mode', 'editorial', 'code-review', 'warm-paper'],
        };
        const existing = (queue.submissions || []).findIndex(s => s.id === sub.id);
        if (existing >= 0) queue.submissions[existing] = entry;
        else (queue.submissions = queue.submissions || []).push(entry);
        queue.updated_at = new Date().toISOString();
        const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
        const putBody = JSON.stringify({
          message: 'add: FOLIO — code review in warm editorial light mode, earth-tone syntax (HB#16)',
          content,
          sha: fd.sha,
        });
        const putRes = await new Promise((resolve, reject) => {
          const req = https.request({
            hostname: 'api.github.com',
            path: `/repos/${REPO}/contents/queue.json`,
            method: 'PUT',
            headers: {
              'Authorization': `token ${TOKEN}`,
              'User-Agent': 'ram-studio/1.0',
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(putBody),
              'Accept': 'application/vnd.github.v3+json',
            }
          }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
          req.on('error', reject); req.write(putBody); req.end();
        });
        console.log(`  Gallery registry: HTTP ${putRes.status} ${putRes.status === 200 ? '✅' : '❌'}`);
      }
    } catch (err) { console.warn(`  ⚠ Gallery skipped: ${err.message}`); }
  } else {
    console.log('\n  (Gallery registry skipped — no GitHub token)');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Done.');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
