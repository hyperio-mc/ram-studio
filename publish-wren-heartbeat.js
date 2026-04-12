'use strict';
// publish-wren-heartbeat.js — Full Design Discovery pipeline for WREN heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'wren';
const VIEWER_SLUG = 'wren-viewer';
const APP_NAME    = 'WREN';

// ── Design metadata ────────────────────────────────────────────────────────────
const meta = {
  appName:   'WREN',
  tagline:   'Minimal API health monitoring. Big numbers, zero noise.',
  archetype: 'productivity',
  palette: {
    bg:      '#080808',
    fg:      '#E4DFD3',
    accent:  '#BFFF00',
    accent2: '#FF3A4E',
    surface: '#111111',
    amber:   '#F09000',
  },
};

const ORIGINAL_PROMPT = `Design WREN — a minimal dark-mode API health and monitoring platform for developer teams. Directly inspired by three sources found in this heartbeat research session:
1. Linear.app (darkmodedesign.com) — functional dark precision, dense data hierarchies with 4px grid discipline, type as primary information vehicle
2. Obsidian (darkmodedesign.com) — near-black minimalism, zero decoration, only data has form
3. land-book.com "Big Type" trend — oversized numerals used as the primary hero element (99.97% uptime IS the UI)
The palette is near-true-black (#080808) with warm cream text (#E4DFD3) and acid yellow-green (#BFFF00) as the sole "up/healthy" signal, vivid red (#FF3A4E) for failures. The challenge: let uptime numbers be the visual hero — design the monitoring dashboard where the data IS the art, no icons or decoration needed. 5 screens: Overview (99.97% uptime hero) · Endpoints (method badges + latency) · Incidents (severity timeline) · Analytics (84ms latency hero + charts) · Alerts (toggle rules + channel config).`;

const sub = {
  id:           `heartbeat-wren-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

const prd = {
  screenNames: ['Overview', 'Endpoints', 'Incidents', 'Analytics', 'Alerts'],
  markdown: `## Overview
WREN (Web Request Event Network) is a minimalist API health monitoring platform for developer teams who want zero-noise uptime visibility. Inspired by the "big type" design trend (land-book, March 2026) and the functional dark interfaces of Linear and Obsidian (darkmodedesign.com), WREN puts numbers at the center of the design — uptime percentage, latency, and error rate are the primary visual elements, not decorations around them.

## Design Philosophy
**Less chrome, more clarity.** Most monitoring tools crowd the screen with icons, gradients, and decorative elements. WREN takes the opposite stance: near-true-black canvas (#080808), warm cream text (#E4DFD3), one healthy color (acid green #BFFF00), one danger color (red #FF3A4E). The 99.97% uptime number is 88px bold — it IS the design.

**Inspired by:**
- Linear.app (darkmodedesign.com) — 4px grid, type-as-hierarchy, no wasted pixels
- Obsidian (darkmodedesign.com) — void-dark, monochromatic until urgency demands color
- land-book "Big Type" trend — oversized data numerals as primary visual element
- minimal.gallery — pure monochrome palettes with restrained single-accent approach

## Target Users
- **Backend/platform engineers** — checking service health, investigating latency spikes
- **DevOps / SRE teams** — managing incident response, configuring alert thresholds
- **Engineering leads** — reviewing weekly uptime reports and SLA adherence
- **Startup CTOs** — quick overview of all services before deploying or presenting to investors

## Core Features
- **Overview** — 90-day uptime percentage in 88px bold as the hero, 30-day sparkline, 4-metric stat grid (incidents / latency / endpoints / checks/min), per-service status list with live latency
- **Endpoints** — Searchable endpoint list with method badges (GET/POST/PUT/DELETE each with distinct color coding), status pills, latency, filter chips for status filtering
- **Incidents** — Active incident card (red left-border accent, full incident details), resolved incident history with severity-coded left borders, MTTR stats
- **Analytics** — p50 latency in 66px bold hero, 7-day request volume bar chart (today highlighted in acid green), error rate / apdex / req-per-sec / success rate summary grid, status code breakdown
- **Alerts** — Alert rule cards with severity pills and toggle switches, notification channel status (PagerDuty / Slack / Email / Webhook), add-new-rule action

## Design Language
The WREN visual system enforces three constraints:
1. **Void canvas** (#080808) — darker than typical "dark mode." True near-black forces all data to pop.
2. **Acid green as the only warm color** (#BFFF00) — used exclusively for UP/healthy/success states. Nothing decorative. The yellow-green wavelength creates maximum contrast on dark backgrounds.
3. **Numbers ARE the design** — 88px uptime, 66px latency. Typography scale jumps aggressively from 8px labels to 88px display. The visual hierarchy is built entirely from size, weight, and color — no icons.

Type system: SF Mono / Fira Code monospace for the data-terminal aesthetic. Everything at 700-900 weight for display, 400-500 for body. Letter-spacing: tight on display (-3px), wide on labels (+1.5px).

## Screen Architecture
1. **Overview** — 88px "99.97" uptime hero + "%" callout, 30-day sparkline bars, 4-card grid (incidents/latency/endpoints/checks), 5-service status list with live dot indicators
2. **Endpoints** — Search + filter bar, method/status filter chips, 10 endpoint rows with GET/POST/PUT/DELETE badges color-coded, latency, status pills
3. **Incidents** — 4-stat header strip (open/week/month/MTTR), active incident card with red left-border, 3 resolved incidents with severity-coded borders and timeline
4. **Analytics** — Time range selector, 66px p50 latency hero with p95/p99 annotation, 7-day volume bar chart, 4-metric summary grid, status code breakdown bar
5. **Alerts** — New rule CTA, 5 alert rule cards with severity + toggle + channel tags, notification channel status list`,
};

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
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

async function get_(host, p) {
  return httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'ram-design/1.0' } });
}

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / screen.width;
  const scaleY = th / screen.height;

  function renderNode(node, depth = 0) {
    if (depth > 8) return '';
    const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');
    const x  = (node.x || 0) * scaleX;
    const y  = (node.y || 0) * scaleY;
    const w  = (node.width  || 0) * scaleX;
    const h  = (node.height || 0) * scaleY;
    const fill = node.fill || 'transparent';
    const op   = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
    const cr   = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX,scaleY)}"` : '';
    const sw   = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX,scaleY) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';

    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w/2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fw = ['700','800','900'].includes(String(node.fontWeight)) ? ' font-weight="bold"' : '';
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill||'#E4DFD3'}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op}${strokeStr}/>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${((x*100+y*10)|0)}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:8px;overflow:hidden;border:1px solid #222">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ──────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens  = penJson.children || [];

  function lightenHex(hex, amt) {
    const n = parseInt((hex||'#111111').replace('#',''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
  }

  const surface = lightenHex(meta.palette.bg, 14);
  const border  = lightenHex(meta.palette.bg, 30);

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = prd.screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: meta.palette.bg,      role: 'VOID BG'      },
    { hex: meta.palette.surface, role: 'SURFACE'      },
    { hex: meta.palette.fg,      role: 'CREAM FG'     },
    { hex: meta.palette.accent,  role: 'ACID GREEN'   },
    { hex: meta.palette.accent2, role: 'FAILURE RED'  },
    { hex: meta.palette.amber,   role: 'WARN AMBER'   },
    { hex: '#5B9CF6',            role: 'REF BLUE'     },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'72px', weight:'900', sample: '99.97' },
    { label:'HERO',     size:'32px', weight:'800', sample: 'WREN — API Health Monitor' },
    { label:'HEADING',  size:'16px', weight:'600', sample: 'webhooks.wren.dev — High Latency' },
    { label:'BODY',     size:'12px', weight:'400', sample: 'p95 latency > 500ms for 3 consecutive checks · Severity HIGH' },
    { label:'LABEL',    size:'8px',  weight:'700', sample: 'UPTIME · LAST 90 DAYS · ACID GREEN = OPERATIONAL' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp*2}px;opacity:0.6"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* WREN — Minimal API Monitoring */
  /* Inspired by Linear + Obsidian (darkmodedesign.com) + land-book big-type trend */

  /* Color — void-dark, two-signal system */
  --color-bg:        ${meta.palette.bg};     /* near-true-black void */
  --color-surface:   ${meta.palette.surface}; /* elevated panel */
  --color-border:    ${border};              /* hairline separator */
  --color-fg:        ${meta.palette.fg};     /* warm cream text */
  --color-up:        ${meta.palette.accent}; /* acid green — all-clear */
  --color-down:      ${meta.palette.accent2}; /* failure red — critical */
  --color-warn:      ${meta.palette.amber};  /* amber — degraded */
  --color-ref:       #5B9CF6;               /* annotation blue */

  /* Typography — monospace terminal system */
  --font-family:     'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:    900 clamp(56px, 12vw, 88px) / 1 var(--font-family);
  --font-heading:    700 16px / 1.3 var(--font-family);
  --font-body:       400 12px / 1.6 var(--font-family);
  --font-label:      700 8px / 1 var(--font-family);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 16px;  --radius-pill: 9999px;
}`;

  const shareText = encodeURIComponent(`WREN — minimal API monitoring UI designed by RAM. Inspired by Linear + Obsidian dark mode and land-book big-type trend. 5 screens, acid green on void black.`);
  const penB64 = Buffer.from(JSON.stringify(penJson)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WREN — Minimal API Monitoring · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${meta.palette.fg}}
  .nav-id{font-size:9px;color:${meta.palette.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:16px}
  h1{font-size:clamp(56px,10vw,96px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${meta.palette.fg}}
  .sub{font-size:15px;opacity:.5;max-width:520px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.bg}}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-c{background:transparent;color:${meta.palette.accent};border:1px solid ${meta.palette.accent}44}
  .btn-mock{background:${meta.palette.accent}18;color:${meta.palette.accent};border:1px solid ${meta.palette.accent}55;font-weight:700}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${meta.palette.fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:10px}
  .p-text{font-size:15px;opacity:.5;font-style:italic;max-width:640px;line-height:1.7;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin:24px 0 8px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;opacity:.6;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${meta.palette.fg}}
  footer{padding:24px 40px;border-top:1px solid ${border};font-size:10px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:${meta.palette.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:5px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
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
  <div class="tag">HEARTBEAT DESIGN · PRODUCTIVITY · MARCH 2026</div>
  <h1>WREN</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>LINEAR + OBSIDIAN</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#BFFF00 + #080808</strong></div>
    <div class="meta-item"><span>TREND</span><strong>BIG TYPE (LAND-BOOK)</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/wren-mock" target="_blank">✦ Try Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-c" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN THUMBNAILS — 5 MOBILE SCREENS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE — VOID-DARK + TWO-SIGNAL SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SCALE — 4PX BASE GRID</div>
        ${spacingHTML}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">TYPE SCALE — MONOSPACE TERMINAL</div>
      ${typeScaleHTML}
    </div>
  </div>

  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:4px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  ${prd.markdown
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h3 style="letter-spacing:1px;font-size:8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/(?<![>])\n/g, ' ')}
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · MARCH 2026</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  const PEN_DATA = "${penB64}";

  function downloadPen() {
    const blob = new Blob([atob(PEN_DATA)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'wren.pen'; a.click();
  }
  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
  }
  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied ✓'));
  }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>WREN Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue update ────────────────────────────────────────────────────────
async function updateGalleryQueue() {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/wren-mock`,
    submitted_at: sub.submitted_at,
    published_at: sub.published_at,
    credit:       sub.credit,
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: WREN to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ WREN Design Discovery Pipeline ══\n');

  // Load pen
  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'wren.pen'), 'utf8'));
  console.log(`✓ Loaded wren.pen (${penJson.children.length} screens)`);

  // Build hero
  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML built (${(heroHTML.length/1024).toFixed(1)}kb)`);

  // Build viewer
  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML built (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  // Publish hero → ram.zenbin.org/wren
  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroResult = await publishToZenbin(SLUG, `WREN — Minimal API Monitoring · RAM Design Studio`, heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) {
    console.log(`  ✓ Live at https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`  Response: ${heroResult.body.slice(0, 200)}`);
  }

  // Publish viewer → ram.zenbin.org/wren-viewer
  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'WREN Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) {
    console.log(`  ✓ Live at https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.log(`  Response: ${viewerResult.body.slice(0, 200)}`);
  }

  // Gallery queue
  console.log('\nUpdating gallery queue...');
  const queueResult = await updateGalleryQueue();
  console.log(`  Status: ${queueResult.status}`);
  if (queueResult.status === 200) {
    console.log('  ✓ Gallery queue updated');
  } else {
    console.log(`  Response: ${queueResult.body.slice(0,200)}`);
  }

  console.log('\n══ Pipeline complete ══');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/wren-mock (build with wren-mock.mjs)`);
})();
