#!/usr/bin/env node
// publish-grid.js — Run GRID through the full Design Discovery pipeline.
// Generates the hero page (brand spec, CSS tokens, PRD, embedded pen, share buttons)
// and publishes to ram.zenbin.org/grid

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── GRID metadata ──────────────────────────────────────────────────────────────
const sub = {
  id:           'hb-grid-1773963000000',
  prompt:       'A generational wealth management platform for family offices — inspired by the pixel/retro CRT aesthetic of Yamauchi No.10 (y-n10.com). Track portfolio value, asset allocation, family generations, governance events, and legal documents. Dashboard, assets, family tree, documents, desktop portfolio, desktop holdings.',
  app_type:     'finance',
  credit:       'RAM Studio',
  submitted_at: '2026-03-18T14:00:00.000Z',
  status:       'done',
};

const meta = {
  appName:   'GRID',
  tagline:   'Wealth Across Generations.',
  archetype: 'finance',
  screens:   6,
  palette: {
    bg:      '#111116',   // near-black charcoal
    fg:      '#f0eeee',   // soft white
    accent:  '#33ff88',   // phosphor green — CRT glow
    accent2: '#f5c400',   // pixel yellow
  },
};

const prdMarkdown = `
## Overview

GRID is a generational wealth management platform designed for family offices. It combines institutional rigor with an unexpected retro-pixel identity — inspired by Yamauchi No.10, the investment vehicle for Nintendo founder Hiroshi Yamauchi's estate, which uses an 8-bit gaming aesthetic for serious financial management.

The core insight: generational wealth is a *game played across time*. The pixel aesthetic isn't decoration — it's a statement that stewardship is patient, rule-bound, and multigenerational.

## Target Users

- **Generation III trustees** — the current stewards managing day-to-day operations
- **Family council members** — governance participants across all generations
- **Estate attorneys and advisors** — requiring document access and distribution schedules

## Core Features

- **Portfolio dashboard** — total AUM, return metrics, asset allocation with pixel-segmented bars, recent events feed
- **Asset register** — full holdings table with cost basis, gain/loss, yield, and asset class breakdown
- **Family tree** — generational org chart with distribution schedule and governance calendar
- **Document vault** — trust agreements, K-1 statements, succession plans with type-tagged browsing
- **Desktop command center** — wide-format portfolio overview and holdings table for advisor use

## Design Language

**Pixel scatter** — colored 8×12px squares (red, yellow, green, blue) scattered algorithmically across each screen using a deterministic LCG. Same pattern regenerates identically on every build — no randomness between deploys.

**CRT frames** — every data card uses a 1–2px phosphor or muted border with zero border-radius. Creates institutional weight without corporate boredom.

**Phosphor green** (#33ff88) as the single accent — the only warm color. Everything else uses the four pixel colors as semantic status signals only.

**Monospace throughout** — all type is monospace. Every number aligns. Every label tracks. The interface reads as precision instrument, not software product.

## Screen Architecture

1. **Mobile Dashboard** — GRID wordmark in phosphor CRT box, portfolio value hero, pixel sparkline, allocation bars, events list
2. **Mobile Assets** — bento tiles for each asset class, live pixel scatter, data bars
3. **Mobile Family Tree** — Gen I → II-A/II-B → Gen III org chart, distribution schedule, governance event card
4. **Mobile Documents** — type-badged document list (TRUST/TAX/LEGAL/REPORT), CRT filter bar
5. **Desktop Portfolio** — sidebar nav, 4-column KPI strip, pixel bar chart, events + performance panels
6. **Desktop Holdings** — full holdings register table with 8 positions, cost basis, gain/loss, yield, and quick-view actions
`;

// ── SVG thumbnail renderer (from process-zenbin-queue.js) ─────────────────────
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
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w}" height="${fh}" fill="${fill}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw   = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:4px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill || '#111'}"/>${kids}</svg>`;
}

// ── Simple markdown → HTML (headings, lists, paragraphs) ──────────────────────
function mdToHtml(md) {
  return md
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
      if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
      if (block.startsWith('- ') || block.includes('\n- ')) {
        const items = block.split('\n').filter(l => l.startsWith('- ')).map(l => `<li>${l.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`);
        return `<ul>${items.join('')}</ul>`;
      }
      return `<p>${block.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`;
    })
    .join('\n');
}

// ── Build the hero page HTML ───────────────────────────────────────────────────
function buildHeroHTML(sub, pen, meta, prdMarkdown) {
  const encoded = Buffer.from(JSON.stringify(pen)).toString('base64');
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

  // Screen thumbnails
  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || (s.width < 500 ? `MOBILE ${i + 1}` : `DESKTOP ${i - 3}`);
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches — use GRID's actual pixel colors
  const swatches = [
    { hex: bg,       role: 'BACKGROUND' },
    { hex: surface,  role: 'SURFACE' },
    { hex: fg,       role: 'FOREGROUND' },
    { hex: accent,   role: 'PHOSPHOR' },
    { hex: accent2,  role: 'PIXEL YELLOW' },
    { hex: '#cc3322', role: 'PIXEL RED' },
    { hex: '#4499dd', role: 'PIXEL BLUE' },
    { hex: '#22aa44', role: 'PIXEL GREEN' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:48px;border-radius:0;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${accent}">${sw.hex}</div>
    </div>`).join('');

  // Type scale
  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '48px', weight: '900', sample: 'GRID' },
    { label: 'HEADING',  size: '22px', weight: '700', sample: 'Wealth Across Generations.' },
    { label: 'BODY',     size: '13px', weight: '400', sample: '$4,812,650 · GEN III TRUST A · Q1 2026' },
    { label: 'CAPTION',  size: '9px',  weight: '400', sample: 'PORTFOLIO VALUE · ANNUAL RETURN · DISTRIBUTIONS' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${fg};font-family:'SF Mono','Fira Code',monospace;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  // Spacing
  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:8px;background:${accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  // Design principles — GRID-specific
  const principles = [
    'Pixel bars over gradient charts — data should feel precise, not decorative.',
    'CRT zero-radius frames — institutional weight without corporate smoothness.',
    'Monospace throughout — every number aligns, every label tracks, reads as precision instrument.',
    'Phosphor green as the only warm accent — everything else is status signal.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  // CSS design tokens — GRID-specific
  const cssTokens = `:root {
  /* Color — GRID Pixel Palette */
  --color-bg:        #111116;   /* charcoal near-black */
  --color-surface:   #1a1a22;   /* elevated panel */
  --color-panel:     #222230;   /* card surface */
  --color-border:    #333344;   /* panel border */
  --color-fg:        #f0eeee;   /* primary text */
  --color-muted:     #55556a;   /* secondary text */
  --color-phosphor:  #33ff88;   /* CRT green accent */
  --color-scanline:  #0a0a12;   /* CRT scanline strip */

  /* Pixel signal colors */
  --color-pixel-red:    #cc3322;
  --color-pixel-yellow: #f5c400;
  --color-pixel-green:  #22aa44;
  --color-pixel-blue:   #4499dd;
  --color-pixel-amber:  #d4863a;

  /* Typography — monospace throughout */
  --font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  --font-display:  900 clamp(48px, 8vw, 96px) / 1 var(--font-family);
  --font-heading:  700 22px / 1.3 var(--font-family);
  --font-body:     400 13px / 1.6 var(--font-family);
  --font-caption:  400 9px / 1 var(--font-family);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Pixel element sizes */
  --pixel-dot:  8px;    /* standard pixel square */
  --pixel-lg:   12px;   /* large pixel square */
  --pixel-bar:  6px;    /* segmented bar height */
  --pixel-gap:  2px;    /* gap between bar segments */

  /* Borders — zero radius throughout */
  --radius: 0px;
  --border-crt:      1px solid var(--color-phosphor);
  --border-panel:    1px solid var(--color-border);
  --border-muted:    1px solid var(--color-muted);
}`;

  const shareText = encodeURIComponent(
    `GRID — generational wealth platform with retro pixel-CRT aesthetic. 6 screens + brand spec + CSS tokens. Built by RAM Design Studio`
  );

  const prdHtml = mdToHtml(prdMarkdown);
  const dateStr = new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GRID — Design System · RAM Design Studio</title>
<meta name="description" content="Wealth Across Generations. — Generational wealth platform with pixel/CRT aesthetic. 6 screens + brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};color:${fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:700;letter-spacing:4px}
  .nav-id{font-size:11px;color:${accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${accent};margin-bottom:20px}
  h1{font-size:clamp(64px,10vw,120px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:20px;color:${fg}}
  .sub{font-size:18px;opacity:.5;max-width:520px;line-height:1.6;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:2px;margin-bottom:4px}
  .meta-item strong{color:${accent};font-size:12px}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:0;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:1px}
  .btn-p{background:${accent};color:${bg}}
  .btn-p:hover{opacity:0.85}
  .btn-s{background:transparent;color:${fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${accent}}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${accent}44}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${fg};opacity:0.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${accent}22;border:1px solid ${accent}44;color:${accent};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 12px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${accent};margin-bottom:12px}
  .p-text{font-size:18px;opacity:.55;font-style:italic;max-width:640px;line-height:1.6;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:800px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.6;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{opacity:1;color:${fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${accent};color:${bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}

  /* Pixel-dot decorative scatter (CSS version of the JS pixelCloud) */
  .pixel-bg{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;opacity:0.12}
  .pixel-bg span{position:absolute;display:block;background:var(--c)}
  body > *:not(.pixel-bg){position:relative;z-index:1}
</style>
</head>
<body>
<div class="pixel-bg" id="pixelBg"></div>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">HEARTBEAT #11 · STUDIO ORIGINAL</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN SYSTEM · FINANCE · ${dateStr}</div>
  <h1>GRID</h1>
  <p class="sub">Wealth Across Generations.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>6 (4 MOBILE + 2 DESKTOP)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>FINANCE · FAMILY OFFICE</strong></div>
    <div class="meta-item"><span>AESTHETIC</span><strong>PIXEL / RETRO CRT</strong></div>
    <div class="meta-item"><span>INSPIRATION</span><strong>YAMAUCHI NO.10</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>CREDIT</span><strong>RAM STUDIO</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ OPEN IN VIEWER</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ DOWNLOAD .PEN</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ COPY PROMPT</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 SHARE</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← GALLERY</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/grid-viewer">☰ VIEWER ONLY</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 4 MOBILE + 2 DESKTOP</div>
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
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE · MONOSPACE ONLY</div>
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
  ${prdHtml}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #11 · Inspired by Yamauchi No.10 (y-n10.com)</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = '${encoded}';
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

// Pixel scatter (matches the JS pixelCloud pattern)
(function() {
  const bg = document.getElementById('pixelBg');
  const colors = ['#cc3322','#f5c400','#22aa44','#4499dd','#d4863a'];
  let seed = 42;
  const lcg = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('span');
    const sz = lcg() > 0.7 ? 12 : 8;
    s.style.cssText = [
      'left:' + (lcg() * 100) + '%',
      'top:' + (lcg() * 100) + '%',
      'width:' + sz + 'px',
      'height:' + sz + 'px',
      '--c:' + colors[Math.floor(lcg() * colors.length)],
    ].join(';');
    bg.appendChild(s);
  }
})();

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
function openInViewer() {
  try {
    const jsonStr = atob(D);
    JSON.parse(jsonStr);
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'grid.pen' }));
    window.open('https://ram.zenbin.org/pen-viewer', '_blank');
  } catch(e) { alert('Could not load: ' + e.message); }
}
function downloadPen() {
  try {
    const blob = new Blob([atob(D)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'grid.pen'; a.click();
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
  const text = encodeURIComponent('GRID — generational wealth platform with pixel/CRT aesthetic. 6 screens + brand spec + CSS tokens. Built by RAM Design Studio');
  const url  = encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
}
</script>
</body>
</html>`;
}

// ── HTTP publish helper ────────────────────────────────────────────────────────
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
        'Authorization': `Bearer ${process.env.ZENBIN_API_KEY}`,
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

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎨 GRID — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Load pen
  const penPath = path.join(__dirname, 'grid.pen');
  if (!fs.existsSync(penPath)) {
    console.error('grid.pen not found — run: node grid.js');
    process.exit(1);
  }
  const pen = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded grid.pen: ${pen.children.length} screens`);

  // Build hero HTML
  console.log('  Building hero page...');
  const html = buildHeroHTML(sub, pen, meta, prdMarkdown);
  console.log(`  HTML size: ${(html.length / 1024).toFixed(1)} KB`);

  // Also save the viewer-only page to grid-viewer slug
  const viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
  const penJson = fs.readFileSync(penPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  const viewerWithPen = viewerHtml.replace('<script>', injection + '\n<script>');

  // Publish hero page to /grid
  console.log('\n  Publishing hero page → ram.zenbin.org/grid ...');
  const r1 = await publish('grid', 'GRID — Design System · RAM Design Studio', html);
  console.log(`  ${r1.status === 200 ? '✓ Updated' : r1.status === 201 ? '✓ Created' : '✗ Error'} (HTTP ${r1.status})`);

  // Publish viewer-only to /grid-viewer
  console.log('  Publishing viewer    → ram.zenbin.org/grid-viewer ...');
  const r2 = await publish('grid-viewer', 'GRID — Viewer · RAM Design Studio', viewerWithPen);
  console.log(`  ${r2.status === 200 ? '✓ Updated' : r2.status === 201 ? '✓ Created' : '✗ Error'} (HTTP ${r2.status})`);

  console.log('\n🔗 Live URLs:');
  console.log('   Hero:   https://ram.zenbin.org/grid');
  console.log('   Viewer: https://ram.zenbin.org/grid-viewer');
}

main().catch(console.error);
