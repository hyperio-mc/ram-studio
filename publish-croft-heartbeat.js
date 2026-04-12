'use strict';
// publish-croft-heartbeat.js
// Full Design Discovery pipeline for CROFT
// Design Heartbeat — Mar 23, 2026
// Inspired by:
//   • Searchable.com warm off-white (#FDFBF9) + rust/terracotta (#C15F3C) accent palette
//   • Span.app bento metrics card layout
//   • Cadmus.io warm academic/editorial cream palette (#FCF7EF) with dark maroon accents
//   • OWO word-block pill typography
//   • Scroll storytelling with sharp section contrast transitions

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'croft';
const VIEWER_SLUG = 'croft-viewer';
const DATE_STR    = 'March 23, 2026';
const APP_NAME    = 'Croft';
const TAGLINE     = 'Your reading life, beautifully kept';
const ARCHETYPE   = 'personal-productivity';

const ORIGINAL_PROMPT = `Inspired by Searchable.com warm rust palette + Span.app bento metrics + Cadmus editorial cream — a personal reading tracker with word-block hero and bento stats grid`;

// ── Palette (Light — primary) ─────────────────────────────────────────────────
const P = {
  bg:        '#F8F4EE',
  surface:   '#FFFFFF',
  surface2:  '#F0EBE3',
  surface3:  '#E8DDD2',
  border:    'rgba(26,15,9,0.10)',
  border2:   'rgba(26,15,9,0.18)',
  accent:    '#C15F3C',
  accentDim: '#F5E8E0',
  accentHi:  '#E8965A',
  accent2:   '#8B4513',
  fg:        '#1A0F09',
  fg2:       '#5C3D2A',
  fg3:       '#9C7A68',
  green:     '#4A8C5C',
  amber:     '#D4962A',
  cream:     '#FCF7EF',
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 300) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';

  if (el.type === 'frame') {
    const bg   = fill !== 'transparent' && fill !== 'none' && !fill.startsWith('rgba')
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`
      : '';
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids && !bg) return '';
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, 8));
    const textFill = el.fill || P.fg;
    if (textFill.startsWith('rgba')) return '';
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w}" height="${fh}" fill="${textFill}"${oAttr} rx="1" opacity="0.55"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:12px;flex-shrink:0;border:1px solid rgba(193,95,60,0.2)"><rect width="${sw}" height="${sh}" fill="${screen.fill || P.bg}"/>${kids}</svg>`;
}

// ── Markdown → HTML ───────────────────────────────────────────────────────────
function mdToHtml(md) {
  return md.trim().split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
    if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- '))
        .map(l => `<li>${l.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`);
      return `<ul>${items.join('')}</ul>`;
    }
    return `<p>${block.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`;
  }).join('\n');
}

// ── Build hero HTML ───────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const screens = pen.children || [];

  const THUMB_H = 220;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || `SCREEN ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.45;margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${P.fg3}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,       role: 'CREAM BG' },
    { hex: P.surface,  role: 'SURFACE' },
    { hex: P.surface2, role: 'WARM CARD' },
    { hex: P.fg,       role: 'DARK TEXT' },
    { hex: P.fg3,      role: 'MUTED' },
    { hex: P.accent,   role: 'RUST' },
    { hex: P.accentHi, role: 'AMBER' },
    { hex: P.green,    role: 'FOREST' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px;max-width:90px">
      <div style="height:44px;background:${sw.hex};border:1px solid ${P.border2};margin-bottom:6px;border-radius:6px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.45;margin-bottom:2px;color:${P.fg3}">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accent};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '52px', weight: '800', sample: 'Croft', extra: 'letter-spacing:-2px' },
    { label: 'HERO NUM', size: '36px', weight: '700', sample: '47 books', extra: 'font-variant-numeric:tabular-nums' },
    { label: 'HEADING',  size: '20px', weight: '600', sample: 'Your reading life' },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'The Dispossessed · Ursula K. Le Guin · 80% done' },
    { label: 'CAPTION',  size: '11px', weight: '500', sample: 'MAR 21 · 45 MIN · P.302–341' },
  ].map(t => `
    <div style="padding:12px 0;border-bottom:1px solid rgba(26,15,9,0.08)">
      <div style="font-size:8px;letter-spacing:2px;opacity:.35;margin-bottom:5px;color:${P.fg3}">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};${t.extra || ''};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
      <div style="font-size:9px;opacity:.35;width:30px;flex-shrink:0;font-family:monospace;color:${P.fg3}">${sp}px</div>
      <div style="height:7px;background:linear-gradient(90deg,${P.accent},${P.accentHi});width:${sp * 2}px;opacity:0.7;border-radius:2px"></div>
    </div>`).join('');

  const principles = [
    'Warm cream as the canvas — #F8F4EE (Searchable.com) and #FCF7EF (Cadmus) layered for depth. The page never feels cold or clinical.',
    'Rust/terracotta as the single accent — #C15F3C used for CTAs, progress fills, and reading metrics. Warm but purposeful.',
    'Word-block pill typography — "CROFT" and key labels rendered as rounded-corner color blocks in the OWO tradition. Headlines have weight.',
    'Bento metrics grid — Span.app\'s "make big things feel small" philosophy applied to reading stats. 3-cell rows, no wasted space.',
    'Book covers as warm placeholders — rust/cream tinted cover art ensures visual consistency even before real cover images load.',
  ];
  const principlesHTML = principles.map((pr, i) => `
    <div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-start">
      <div style="color:${P.accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.65;line-height:1.6;color:${P.fg2}">${pr}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* CROFT Color System — Warm Cream × Rust Terracotta */
  /* Inspired by Searchable.com (rust) + Cadmus.io (editorial cream) */

  /* Backgrounds */
  --color-bg:          #F8F4EE;   /* warm cream — Searchable.com palette */
  --color-cream:       #FCF7EF;   /* editorial cream — Cadmus.io */
  --color-surface:     #FFFFFF;   /* pure white card surface */
  --color-surface-2:   #F0EBE3;   /* warm card — slightly deeper */
  --color-surface-3:   #E8DDD2;   /* warm tan — deepest card */

  /* Borders */
  --color-border:      rgba(26,15,9,0.10);
  --color-border-2:    rgba(26,15,9,0.18);

  /* Accent — rust/terracotta (Searchable.com) */
  --color-accent:      #C15F3C;
  --color-accent-dim:  #F5E8E0;   /* tinted accent bg */
  --color-accent-hi:   #E8965A;   /* lighter amber accent */
  --color-sienna:      #8B4513;   /* dark sienna — Cadmus maroon */

  /* Text */
  --color-text:        #1A0F09;   /* near-black warm dark */
  --color-text-2:      #5C3D2A;   /* warm mid-brown */
  --color-text-3:      #9C7A68;   /* warm muted */

  /* Semantic */
  --color-success:     #4A8C5C;   /* warm forest green */
  --color-warning:     #D4962A;   /* warm amber */

  /* Typography */
  --font-ui:    -apple-system, 'Inter', 'Georgia', system-ui, serif;
  --font-serif: 'Georgia', 'Palatino', ui-serif, serif;
  --font-mono:  'SF Mono', 'Fira Code', ui-monospace, monospace;

  /* Font scale */
  --text-display: 800 52px / 0.95 var(--font-ui);
  --text-h1:      700 24px / 1.3 var(--font-ui);
  --text-h2:      600 18px / 1.4 var(--font-ui);
  --text-h3:      600 15px / 1.4 var(--font-ui);
  --text-body:    400 14px / 1.6 var(--font-ui);
  --text-small:   400 12px / 1.4 var(--font-ui);
  --text-caption: 500 11px / 1 var(--font-ui);
  --text-label:   700 9px / 1 var(--font-ui);

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 24px;  --space-6: 32px;
  --space-7: 48px; --space-8: 64px;

  /* Radii */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-pill: 24px;

  /* Shadows */
  --shadow-card: 0 1px 4px rgba(26,15,9,0.06), 0 4px 16px rgba(26,15,9,0.04);
  --shadow-elevated: 0 2px 8px rgba(26,15,9,0.08), 0 8px 24px rgba(26,15,9,0.06);

  /* Progress/charts */
  --chart-1: #C15F3C;  /* rust — primary */
  --chart-2: #E8965A;  /* amber — secondary */
  --chart-3: #4A8C5C;  /* forest green */
  --chart-4: #D4962A;  /* warm amber */

  /* Motion */
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --easing-warm:   cubic-bezier(0.25, 0.46, 0.45, 0.94);
}`;

  const prdHTML = mdToHtml(`
## Overview

Croft is a personal reading tracker designed for dedicated readers who care about their reading life as much as what they read. It combines warm editorial aesthetics — inspired by the cream-and-rust palette of Searchable.com and Cadmus.io — with the data-dense bento layout style of Span.app, creating a reading companion that feels both beautiful and genuinely useful.

The design philosophy borrows from Cadmus's academic warmth: this is software that belongs on a reading desk, not a Silicon Valley dashboard. Every screen uses warm cream backgrounds (#F8F4EE), white surface cards, and rust terracotta (#C15F3C) as the single accent — a palette that feels like well-worn books and good coffee.

## Target Users

- **Voracious readers** tracking 20+ books per year who want more than Goodreads' social noise
- **Goal-oriented readers** setting annual targets who want clear progress visibility
- **Note-takers and highlighters** who want their reading journal alongside their book log
- **Personal analytics fans** who want to understand their reading patterns over time

## Core Screens

- **Library** — Bento grid with hero "Books Read" metric card, 3-cell stats row (Pages/Streak/Rating), current books list with progress bars, and monthly goal tracker
- **Book Detail** — Book hero card with cover/title/progress, session stats bento row, dual progress bars (reading + pace), session log, and genre tags
- **Add Book** — Search UI with warm result cards, filter pills (All/Fiction/Non-fiction/Classics), and "Add to shelf" sheet
- **Insights** — Annual reading hero metric with sparkline, Fiction/Non-fiction split bar, genre breakdown with progress bars, monthly highlights, and reading pattern analysis
- **Journal** — Reading notes and highlights feed with quote cards, themes tags, and reflection text
- **Discover** — Recommendations based on reading history with match percentage badges and taste profile tags

## Design Language

Warm cream canvas (#F8F4EE) with pure white surface cards — every card floats slightly above the cream background using subtle warm shadows. Rust/terracotta (#C15F3C) is the sole accent: it appears on progress fills, CTAs, key metrics, and word-block pill components. The OWO-inspired word-block pill places "CROFT" in a rust rectangle with cream text — marking the app name as a design element rather than just typography. Bento grid layout from Span.app ensures reading stats feel digestible and spatial rather than list-heavy.
`);

  const heroURL   = `https://ram.zenbin.org/${SLUG}`;
  const viewerURL = `https://ram.zenbin.org/${VIEWER_SLUG}`;
  const mockURL   = `https://ram.zenbin.org/croft-mock`;
  const shareText = encodeURIComponent(`Croft — Your reading life, beautifully kept. Warm cream × rust terracotta. Bento reading stats + 6 screens. Built by RAM Design Studio`);
  const shareURL  = encodeURIComponent(heroURL);
  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="Croft: Personal reading tracker with warm cream editorial aesthetic, rust accent, bento stats grid, and 6 beautifully designed screens.">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:-apple-system,'Inter','Segoe UI',system-ui,sans-serif;line-height:1.6}
  a{color:${P.accent};text-decoration:none}
  a:hover{text-decoration:underline;color:${P.accent2}}
  .container{max-width:960px;margin:0 auto;padding:0 24px}

  .hero{padding:80px 0 60px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);
    width:900px;height:500px;background:radial-gradient(ellipse at 45% 40%,${P.accent}12 0%,${P.accentHi}0A 50%,transparent 75%);pointer-events:none}
  .hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${P.border2},transparent)}

  .hero-tag{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;
    background:${P.accentDim};color:${P.accent};
    font-size:10px;font-weight:700;letter-spacing:2px;border-radius:20px;margin-bottom:28px;
    border:1px solid rgba(193,95,60,0.25)}

  /* OWO-style word-block headline */
  .hero-name-row{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:18px;flex-wrap:wrap}
  .word-block{display:inline-block;padding:10px 22px;border-radius:12px;font-size:clamp(52px,11vw,96px);
    font-weight:800;line-height:1;letter-spacing:-2px}
  .word-block-accent{background:${P.accent};color:#FFFFFF}
  .word-block-text{background:${P.surface2};color:${P.fg}}

  .hero-tagline{font-size:clamp(15px,2.5vw,20px);color:${P.fg2};margin-bottom:8px;font-weight:300;letter-spacing:0.5px}
  .hero-date{font-size:11px;color:${P.fg3};letter-spacing:1.5px;margin-bottom:44px;text-transform:uppercase}
  .hero-prompt{font-size:14px;color:${P.fg2};font-style:italic;max-width:700px;margin:0 auto 48px;
    line-height:1.9;padding:28px;background:${P.surface};border-radius:14px;
    border:1px solid rgba(193,95,60,0.15);border-left:3px solid ${P.accent};
    box-shadow:0 2px 12px rgba(26,15,9,0.05)}

  .actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:56px}
  .btn{padding:11px 22px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;
    border:none;text-decoration:none;display:inline-flex;align-items:center;gap:8px;
    transition:all .15s;letter-spacing:0.5px}
  .btn:hover{opacity:.88;text-decoration:none;transform:translateY(-1px)}
  .btn-primary{background:${P.accent};color:#FFFFFF}
  .btn-secondary{background:${P.surface};color:${P.fg};border:1px solid rgba(26,15,9,0.14)}
  .btn-outline{background:transparent;color:${P.fg2};border:1px solid rgba(26,15,9,0.14)}
  .btn-mock{background:linear-gradient(135deg,${P.accent},${P.accent2});color:#fff}

  .screens-section{margin-bottom:72px}
  .section-label{font-size:9px;font-weight:700;letter-spacing:2.5px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .screens-strip{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px;
    scrollbar-width:thin;scrollbar-color:rgba(193,95,60,0.3) transparent}
  .screens-strip::-webkit-scrollbar{height:4px}
  .screens-strip::-webkit-scrollbar-track{background:transparent}
  .screens-strip::-webkit-scrollbar-thumb{background:rgba(193,95,60,0.3);border-radius:2px}

  .spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:72px}
  @media(max-width:600px){.spec-grid{grid-template-columns:1fr}}
  .spec-card{background:${P.surface};border:1px solid rgba(26,15,9,0.08);border-radius:14px;padding:24px;
    box-shadow:0 1px 4px rgba(26,15,9,0.04)}
  .spec-card h3{font-size:9px;font-weight:700;letter-spacing:2px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .palette{display:flex;gap:8px;flex-wrap:wrap}

  .tokens-section{margin-bottom:72px}
  .tokens-block{background:${P.surface};border:1px solid rgba(26,15,9,0.08);border-radius:14px;
    padding:24px;position:relative;box-shadow:0 1px 4px rgba(26,15,9,0.04)}
  .tokens-block pre{font-family:'SF Mono','Fira Code',monospace;font-size:11px;
    color:${P.fg2};overflow-x:auto;line-height:1.8;white-space:pre}
  .copy-btn{position:absolute;top:16px;right:16px;background:${P.accentDim};color:${P.accent};
    border:1px solid rgba(193,95,60,0.25);border-radius:6px;padding:6px 14px;font-size:10px;font-weight:700;
    letter-spacing:1px;cursor:pointer;transition:all .15s}
  .copy-btn:hover{background:${P.accent};color:#fff}

  .prd-section{margin-bottom:72px}
  .prd-body{color:${P.fg2};font-size:14px;line-height:1.8}
  .prd-body h3{font-size:17px;font-weight:700;color:${P.fg};margin:28px 0 12px}
  .prd-body p{margin-bottom:14px}
  .prd-body ul{padding-left:20px;margin-bottom:14px}
  .prd-body li{margin-bottom:6px}
  .prd-body strong{color:${P.fg}}

  .footer{padding:56px 0;border-top:1px solid rgba(26,15,9,0.08);text-align:center;
    color:${P.fg3};font-size:12px}
  .footer a{color:${P.fg3}}
  .footer a:hover{color:${P.fg2}}
</style>
</head>
<body>
<div class="container">

  <div class="hero">
    <div class="hero-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
    <div class="hero-name-row">
      <span class="word-block word-block-accent">${APP_NAME}</span>
    </div>
    <div class="hero-tagline">${TAGLINE}</div>
    <div class="hero-date">Design Heartbeat · Warm Cream × Rust Terracotta · 6 Screens</div>
    <div class="hero-prompt">${ORIGINAL_PROMPT}</div>
    <div class="actions">
      <a href="${viewerURL}" class="btn btn-primary" target="_blank">▶ Open in Viewer</a>
      <a href="${mockURL}" class="btn btn-mock" target="_blank">✦ Try Interactive Mock</a>
      <a href="data:application/json;base64,${penEncoded}" download="croft.pen" class="btn btn-secondary">↓ Download .pen</a>
      <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.querySelector('.hero-prompt').textContent.trim()).then(()=>this.textContent='✓ Copied!')">⎘ Copy Prompt</button>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}" class="btn btn-outline" target="_blank">𝕏 Share</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">⬡ Gallery</a>
    </div>
  </div>

  <div class="screens-section">
    <div class="section-label">6 Screens — Library · Book Detail · Add Book · Insights · Journal · Discover</div>
    <div class="screens-strip">${thumbsHTML}</div>
  </div>

  <div class="spec-grid">
    <div class="spec-card">
      <h3>Color Palette</h3>
      <div class="palette">${swatchHTML}</div>
    </div>
    <div class="spec-card">
      <h3>Type Scale</h3>
      ${typeScaleHTML}
    </div>
    <div class="spec-card">
      <h3>Spacing System</h3>
      ${spacingHTML}
    </div>
    <div class="spec-card">
      <h3>Design Principles</h3>
      ${principlesHTML}
    </div>
  </div>

  <div class="tokens-section">
    <div class="section-label">CSS Design Tokens</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.querySelector('.tokens-block pre').textContent).then(()=>this.textContent='✓ Copied!')">COPY TOKENS</button>
      <pre>${cssTokens}</pre>
    </div>
  </div>

  <div class="prd-section">
    <div class="section-label">Product Brief / PRD</div>
    <div class="spec-card">
      <div class="prd-body">${prdHTML}</div>
    </div>
  </div>

  <div class="footer">
    <p>Built by <strong style="color:${P.fg2}">RAM Design Studio</strong> · Heartbeat ${DATE_STR}</p>
    <p style="margin-top:8px">
      <a href="https://ram.zenbin.org/gallery">← Gallery</a> ·
      <a href="${viewerURL}">Viewer →</a> ·
      <a href="${mockURL}">Interactive Mock →</a>
    </p>
  </div>

</div>
</body>
</html>`;
}

// ── Build viewer HTML ─────────────────────────────────────────────────────────
function buildViewerHTML(pen) {
  const penJson = JSON.stringify(pen);
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'axon-viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Croft Design Discovery Pipeline ===\n');

  const penPath = path.join(__dirname, 'croft.pen');
  const pen     = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`Loaded pen: ${pen.children.length} screens`);

  // (a) Hero page
  console.log('\n[1/5] Building hero page...');
  const heroHTML = buildHeroHTML(pen);
  console.log(`  Hero HTML: ${(heroHTML.length / 1024).toFixed(1)} KB`);
  console.log('[2/5] Publishing hero → ram.zenbin.org/' + SLUG);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`  -> ${heroRes.status}  ${heroRes.body.slice(0, 120)}`);

  // (b) Viewer
  console.log('\n[3/5] Building + publishing viewer...');
  const viewerHTML = buildViewerHTML(pen);
  console.log(`  Viewer HTML: ${(viewerHTML.length / 1024).toFixed(1)} KB`);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`  -> ${viewerRes.status}  ${viewerRes.body.slice(0, 120)}`);

  // (c) Gallery queue
  console.log('\n[4/5] Updating gallery queue...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-croft-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     MOCK_URL,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      6,
    source:       'heartbeat',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    }
  }, putBody);
  console.log(`  -> Gallery: ${putRes.status === 200 ? 'OK' : putRes.body.slice(0, 150)}`);

  console.log('\n[5/5] Pipeline complete!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   ${MOCK_URL} (run croft-mock.mjs)`);
}

const MOCK_URL = `https://ram.zenbin.org/croft-mock`;
main().catch(console.error);
