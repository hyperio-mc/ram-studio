'use strict';
// publish-dusk-heartbeat.js
// Full Design Discovery pipeline for DUSK
// Design Heartbeat — Mar 21, 2026
// Inspired by:
//   • Fathom Analytics 3D globe on godly.website — "Web analytics in 2026 should look like this"
//   • OWO site on darkmodedesign.com — hot-pink/magenta on pure black, extreme contrast
//   • Flomodia on darkmodedesign.com — oversized condensed numbers, bold condensed display type

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'dusk-heartbeat';
const VIEWER_SLUG = 'dusk-viewer';
const DATE_STR    = 'March 21, 2026';
const APP_NAME    = 'DUSK';
const TAGLINE     = 'Privacy-First Web Analytics';
const ARCHETYPE   = 'productivity';

const ORIGINAL_PROMPT = `Design a dark-glassmorphism web analytics dashboard — directly inspired by Fathom Analytics' 3D globe data visualization featured on godly.website ("Web analytics in 2026 should look like this") and the explosive hot-pink-on-black contrast seen on OWO at darkmodedesign.com. DUSK is a privacy-first analytics platform with a deep violet-black glassmorphism UI (bg: #08000F, surface: rgba glass cards), a neon hot-pink accent (#FF2D78) used sparingly on live metrics and CTAs, and a geographic globe view as its signature screen. Oversized condensed KPI numbers (inspired by Flomodia on darkmodedesign.com) dominate the overview. 5 screens: overview dashboard, traffic sources donut + bars, top pages table with sparklines, geographic globe view with country breakdown, and privacy settings.`;

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#08000F',
  surface:   '#120020',
  surface2:  '#1C0030',
  surface3:  '#260040',
  border:    '#3D0060',
  border2:   '#5C0090',
  accent:    '#FF2D78',
  accentDim: '#4D0020',
  accentHi:  '#FF80AA',
  accent2:   '#9D4EDD',
  accent2Dim:'#2D0050',
  fg:        '#FAFAFA',
  fg2:       '#B0A0C0',
  fg3:       '#604080',
  green:     '#00E5A0',
  amber:     '#FFB930',
  red:       '#FF4D6A',
  blue:      '#4DB8FF',
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
    const bg   = fill !== 'transparent' && fill !== 'none'
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
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w}" height="${fh}" fill="${textFill}"${oAttr} rx="1" opacity="0.55"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:12px;flex-shrink:0;border:1px solid ${P.border}"><rect width="${sw}" height="${sh}" fill="${screen.fill || P.bg}"/>${kids}</svg>`;
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

  const THUMB_H = 200;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || `SCREEN ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,       role: 'VOID' },
    { hex: P.surface,  role: 'GLASS' },
    { hex: P.surface2, role: 'ELEVATED' },
    { hex: P.fg,       role: 'LUMINANCE' },
    { hex: P.fg2,      role: 'MUTED' },
    { hex: P.accent,   role: 'NEON PINK' },
    { hex: P.accent2,  role: 'PURPLE' },
    { hex: P.green,    role: 'MINT' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px;max-width:90px">
      <div style="height:44px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:6px;border-radius:6px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:2px">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accent};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '52px', weight: '900', sample: 'DUSK', extra: 'letter-spacing:-2px' },
    { label: 'KPI NUM',  size: '36px', weight: '800', sample: '48,291', extra: 'font-variant-numeric:tabular-nums' },
    { label: 'HEADING',  size: '18px', weight: '700', sample: 'Privacy-First Web Analytics' },
    { label: 'BODY',     size: '13px', weight: '400', sample: '/blog/2026-design-trends — 3,291 visitors · +12%' },
    { label: 'LABEL',    size: '9px',  weight: '700', sample: 'LIVE NOW · 12 VISITORS · SESSION AVG' },
  ].map(t => `
    <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.35;margin-bottom:5px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};${t.extra || ''};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
      <div style="font-size:9px;opacity:.35;width:30px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:7px;background:linear-gradient(90deg,${P.accent},${P.accent2});width:${sp * 2}px;opacity:0.7;border-radius:2px"></div>
    </div>`).join('');

  const principles = [
    'Hot-pink as the singular live signal — #FF2D78 appears only on live visitor counts, CTAs, and selected states. Never decorative.',
    'Glassmorphism depth over flat dark — violet-tinted surfaces (#08000F → #120020 → #1C0030) create depth without borders dominating.',
    'Geography as hero screen — the globe view is the signature feature, not buried in settings. Privacy analytics must show "where" without "who."',
    'KPI numbers oversized and condensed — visitor/pageview counts render at 36–52px with tabular numerals for instant readability.',
    'Purple gradient pairs with pink — #9D4EDD creates visual balance for the accent, used on secondary data series and chart fills.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-start">
      <div style="color:${P.accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* DUSK Color System — Dark Glassmorphism × Neon Pink */
  /* Inspired by OWO (darkmodedesign.com) + Fathom Analytics (godly.website) */

  --color-bg:          #08000F;   /* deep void — near-black violet */
  --color-surface:     #120020;   /* glass base layer */
  --color-surface-2:   #1C0030;   /* elevated card */
  --color-surface-3:   #260040;   /* highest elevation */
  --color-border:      #3D0060;   /* subtle violet border */
  --color-border-2:    #5C0090;   /* stronger border */

  /* Glassmorphism variant */
  --color-glass:       rgba(255, 255, 255, 0.04);
  --color-glass-border:rgba(255, 45, 120, 0.15);
  --backdrop:          blur(20px) saturate(180%);

  /* Accent — neon hot pink (OWO / darkmodedesign.com) */
  --color-accent:      #FF2D78;
  --color-accent-dim:  #4D0020;
  --color-accent-hi:   #FF80AA;

  /* Secondary — purple gradient pair */
  --color-purple:      #9D4EDD;
  --color-purple-dim:  #2D0050;

  /* Text */
  --color-fg:          #FAFAFA;   /* near-white */
  --color-fg-2:        #B0A0C0;   /* muted lavender-white */
  --color-fg-3:        #604080;   /* very muted */

  /* Semantic */
  --color-success:     #00E5A0;   /* mint green */
  --color-warning:     #FFB930;   /* amber */
  --color-error:       #FF4D6A;   /* coral-red */
  --color-info:        #4DB8FF;   /* sky blue */

  /* Typography */
  --font-ui:   -apple-system, 'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* Font scale */
  --text-display: 900 52px / 0.95 var(--font-ui);
  --text-kpi:     800 36px / 1 var(--font-ui);
  --text-h1:      700 18px / 1.3 var(--font-ui);
  --text-h2:      700 14px / 1.3 var(--font-ui);
  --text-body:    400 13px / 1.6 var(--font-ui);
  --text-small:   400 11px / 1.4 var(--font-ui);
  --text-label:   700 9px / 1 var(--font-ui);

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --space-7: 48px; --space-8: 64px;

  /* Radii */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-pill: 24px;
  --radius-globe:50%;

  /* Borders */
  --border-default: 1px solid var(--color-border);
  --border-glass:   1px solid var(--color-glass-border);
  --border-accent:  1px solid rgba(255, 45, 120, 0.4);

  /* Chart colors (ordered by priority) */
  --chart-1: #FF2D78;  /* accent pink — primary series */
  --chart-2: #9D4EDD;  /* purple — secondary series */
  --chart-3: #4DB8FF;  /* sky blue — tertiary series */
  --chart-4: #FFB930;  /* amber — quaternary */
  --chart-5: #00E5A0;  /* mint — quinary */

  /* Motion */
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --easing-snap:   cubic-bezier(0.16, 1, 0.3, 1);

  /* Globe-specific */
  --globe-base:    #1C0030;
  --globe-land:    #9D4EDD;
  --globe-dot:     #FF2D78;
  --globe-glow:    rgba(255, 45, 120, 0.25);
}`;

  const prdHTML = mdToHtml(`
## Overview

DUSK is a privacy-first web analytics platform built for creators, indie developers, and small businesses who want meaningful traffic insights without compromising their visitors' privacy. No cookies, no fingerprinting, no personal data — just clean, aggregated analytics in a stunning dark-glassmorphism UI.

The signature design feature is the **geographic globe view**: an animated 3D-inspired world map showing where visitors come from as glowing hotspots, directly inspired by Fathom Analytics' stunning globe visualization featured on godly.website in March 2026. This makes geography the hero feature, not a buried report.

The aesthetic challenge was pushing dark-mode design beyond the expected: instead of the typical navy/teal or charcoal/green, DUSK uses a deep violet-black (#08000F) glassmorphism palette with a single explosive hot-pink accent (#FF2D78) — directly referencing the OWO site on darkmodedesign.com's extreme contrast approach.

## Target Users

- **Indie developers and solo creators** who want simple, beautiful analytics for their projects
- **Privacy-conscious businesses** who've moved away from Google Analytics post-GDPR
- **Newsletter writers and bloggers** who care about page performance and source attribution
- **Product teams** who need lightweight analytics without enterprise complexity

## Core Features

- **Overview Dashboard** — real-time visitor counter, today's KPIs (visitors, pageviews, bounce rate, session time) with 24-hour bar chart and top pages preview
- **Traffic Sources** — donut chart + horizontal bar breakdown by channel (direct, organic, social, referral, email, paid)
- **Top Pages** — sortable pages table with mini sparklines, engagement metrics, and expandable row details
- **Geographic Globe View** — signature screen: world map with glowing visitor hotspots and country breakdown list with proportion bars
- **Privacy Settings** — granular data controls, cookie-free confirmation, IP exclusion, data retention settings, and a live Privacy Score card

## Design Language

Deep violet-black glassmorphism: three surface levels create spatial depth without heavy borders. The single hot-pink accent (#FF2D78) is used surgically — live indicators, selected tabs, primary CTAs, and key metric highlights only. The purple (#9D4EDD) serves as the gradient pair for chart fills and secondary data series. KPI numbers render oversized (36–52px) with tabular numerals for instant at-a-glance reading, inspired by Flomodia's bold condensed numeric style on darkmodedesign.com.

## Screen Architecture

1. **Overview** — Today's snapshot with live counter pill, period selector, 2×2 metric grid, 24-hour bar chart, and top pages preview
2. **Sources** — Donut chart for channel breakdown + proportional bar list + top referrers mini-table
3. **Top Pages** — Sortable table with mini bar sparklines, visitors + trend badge per row, expandable detail row
4. **Geography** — Globe visualization with glowing hotspot clusters + country breakdown with proportion bars
5. **Privacy Settings** — Privacy Score card (A+), data collection toggles, retention settings, IP exclusions, integrations, danger zone
`);

  const heroURL   = `https://ram.zenbin.org/${SLUG}`;
  const viewerURL = `https://ram.zenbin.org/${VIEWER_SLUG}`;
  const mockURL   = `https://ram.zenbin.org/dusk-mock`;
  const shareText = encodeURIComponent(`DUSK — Privacy-First Web Analytics. Dark glassmorphism × neon hot-pink. Geographic globe view + 5 screens + CSS tokens. Built by RAM Design Studio`);
  const shareURL  = encodeURIComponent(heroURL);
  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="DUSK: Privacy-first web analytics with dark glassmorphism, neon pink accent, and globe view. #08000F void black, #FF2D78 hot pink.">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:-apple-system,'Inter','Segoe UI',system-ui,sans-serif;line-height:1.6}
  a{color:${P.accentHi};text-decoration:none}
  a:hover{text-decoration:underline}
  .container{max-width:920px;margin:0 auto;padding:0 24px}

  .hero{padding:80px 0 60px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);
    width:800px;height:500px;background:radial-gradient(ellipse at 40% 40%,${P.accent}18 0%,${P.accent2}0C 45%,transparent 70%);pointer-events:none}
  .hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${P.border2},transparent)}
  .hero-tag{display:inline-block;padding:5px 16px;background:${P.accentDim};color:${P.accentHi};
    font-size:10px;font-weight:700;letter-spacing:2px;border-radius:20px;margin-bottom:28px;
    border:1px solid ${P.accent}40}
  .hero-name{font-size:clamp(64px,14vw,120px);font-weight:900;letter-spacing:-4px;line-height:0.9;
    background:linear-gradient(150deg,${P.fg} 0%,${P.accentHi} 45%,${P.accent2} 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    margin-bottom:20px;padding-bottom:8px}
  .hero-tagline{font-size:clamp(14px,2.5vw,18px);color:${P.fg2};margin-bottom:8px;font-weight:300;letter-spacing:1px}
  .hero-date{font-size:11px;color:${P.fg3};letter-spacing:1.5px;margin-bottom:44px;text-transform:uppercase}
  .hero-prompt{font-size:14px;color:${P.fg2};font-style:italic;max-width:680px;margin:0 auto 48px;
    line-height:1.9;padding:28px;background:${P.surface};border-radius:12px;
    border:1px solid ${P.border};border-left:3px solid ${P.accent}}

  .actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:56px}
  .btn{padding:11px 22px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;
    border:none;text-decoration:none;display:inline-flex;align-items:center;gap:8px;
    transition:all .15s;letter-spacing:0.5px}
  .btn:hover{opacity:.85;text-decoration:none;transform:translateY(-1px)}
  .btn-primary{background:linear-gradient(135deg,${P.accent},${P.accentHi});color:${P.bg}}
  .btn-secondary{background:${P.surface2};color:${P.fg};border:1px solid ${P.border2}}
  .btn-outline{background:transparent;color:${P.fg2};border:1px solid ${P.border}}
  .btn-mock{background:linear-gradient(135deg,${P.accent2},#7C3AED);color:#fff}

  .screens-section{margin-bottom:72px}
  .section-label{font-size:9px;font-weight:700;letter-spacing:2.5px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .screens-strip{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px;
    scrollbar-width:thin;scrollbar-color:${P.border2} transparent}
  .screens-strip::-webkit-scrollbar{height:4px}
  .screens-strip::-webkit-scrollbar-track{background:transparent}
  .screens-strip::-webkit-scrollbar-thumb{background:${P.border2};border-radius:2px}

  .spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:72px}
  @media(max-width:600px){.spec-grid{grid-template-columns:1fr}}
  .spec-card{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px}
  .spec-card h3{font-size:9px;font-weight:700;letter-spacing:2px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .palette{display:flex;gap:8px;flex-wrap:wrap}

  .tokens-section{margin-bottom:72px}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:12px;
    padding:24px;position:relative}
  .tokens-block pre{font-family:'SF Mono','Fira Code',monospace;font-size:11px;
    color:${P.fg2};overflow-x:auto;line-height:1.8;white-space:pre}
  .copy-btn{position:absolute;top:16px;right:16px;background:${P.accentDim};color:${P.accentHi};
    border:1px solid ${P.accent}40;border-radius:6px;padding:6px 14px;font-size:10px;font-weight:700;
    letter-spacing:1px;cursor:pointer;transition:all .15s}
  .copy-btn:hover{background:${P.accent};color:${P.bg}}

  .prd-section{margin-bottom:72px}
  .prd-body{color:${P.fg2};font-size:14px;line-height:1.8}
  .prd-body h3{font-size:16px;font-weight:700;color:${P.fg};margin:28px 0 12px}
  .prd-body p{margin-bottom:14px}
  .prd-body ul{padding-left:20px;margin-bottom:14px}
  .prd-body li{margin-bottom:6px}
  .prd-body strong{color:${P.fg}}

  .footer{padding:56px 0;border-top:1px solid ${P.border};text-align:center;
    color:${P.fg3};font-size:12px}
  .footer a{color:${P.fg3}}
  .footer a:hover{color:${P.fg2}}
</style>
</head>
<body>
<div class="container">

  <div class="hero">
    <div class="hero-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
    <div class="hero-name">${APP_NAME}</div>
    <div class="hero-tagline">${TAGLINE}</div>
    <div class="hero-date">Design Heartbeat · Dark Glassmorphism × Neon Pink · Globe View</div>
    <div class="hero-prompt">${ORIGINAL_PROMPT}</div>
    <div class="actions">
      <a href="${viewerURL}" class="btn btn-primary" target="_blank">▶ Open in Viewer</a>
      <a href="${mockURL}" class="btn btn-mock" target="_blank">✦ Try Interactive Mock</a>
      <a href="data:application/json;base64,${penEncoded}" download="dusk.pen" class="btn btn-secondary">↓ Download .pen</a>
      <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.querySelector('.hero-prompt').textContent.trim()).then(()=>this.textContent='✓ Copied!')">⎘ Copy Prompt</button>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}" class="btn btn-outline" target="_blank">𝕏 Share</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">⬡ Gallery</a>
    </div>
  </div>

  <div class="screens-section">
    <div class="section-label">5 Screens — Overview · Sources · Pages · Geography · Privacy</div>
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
  console.log('=== DUSK Design Discovery Pipeline ===\n');

  const penPath = path.join(__dirname, 'dusk.pen');
  const pen     = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded pen: ${pen.children.length} screens`);

  // (a) Hero page
  console.log('\n[1/5] Building hero page…');
  const heroHTML = buildHeroHTML(pen);
  console.log(`  Hero HTML: ${(heroHTML.length / 1024).toFixed(1)} KB`);
  console.log('[2/5] Publishing hero → ram.zenbin.org/' + SLUG);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`  → ${heroRes.status}  ${heroRes.body.slice(0, 120)}`);

  // (b) Viewer
  console.log('\n[3/5] Building + publishing viewer…');
  const viewerHTML = buildViewerHTML(pen);
  console.log(`  Viewer HTML: ${(viewerHTML.length / 1024).toFixed(1)} KB`);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`  → ${viewerRes.status}  ${viewerRes.body.slice(0, 120)}`);

  // (d) Gallery queue
  console.log('\n[4/5] Updating gallery queue…');
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
    id:           `heartbeat-dusk-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     mockURL,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
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
  console.log(`  → Gallery: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 150)}`);

  console.log('\n[5/5] Pipeline complete!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   ${mockURL} (run dusk-mock.mjs)`);
}

const mockURL = `https://ram.zenbin.org/dusk-mock`;
main().catch(console.error);
