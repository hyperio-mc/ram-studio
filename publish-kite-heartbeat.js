'use strict';
// publish-kite-heartbeat.js — Full Design Discovery pipeline for KITE heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'kite';
const VIEWER_SLUG = 'kite-viewer';
const APP_NAME    = 'KITE';

const meta = {
  appName:   APP_NAME,
  tagline:   'Real-time API health monitoring. Zero blind spots.',
  archetype: 'devtools',
  palette: {
    bg:      '#070709',
    surface: '#0E0E14',
    fg:      '#EEEAE2',
    accent:  '#F97316',
    accent2: '#22C55E',
    muted:   'rgba(238,234,226,0.42)',
  },
  lightPalette: {
    bg:      '#F7F6F4',
    surface: '#FFFFFF',
    text:    '#0F0F11',
    accent:  '#EA6B0E',
    accent2: '#16A34A',
    muted:   'rgba(15,15,17,0.42)',
  },
};

const ORIGINAL_PROMPT = `Design KITE — a real-time API health monitoring tool for dev teams. Inspired by three discoveries from this heartbeat's research:
1. Linear.app (from darkmodedesign.com): Pure near-black (#0D0D0D) background, massive bold rounded grotesque headlines in white, single-accent minimal palette, app mockup embedded in hero. The "for teams and agents" AI-era positioning. Extreme whitespace — few elements per screen, maximum hierarchy.
2. Obsidian.md (darkmodedesign.com): Single purple accent on near-black. Bold heavy type. Zero ornamentation — one CTA button, one accent color. Shows that dark UIs are most powerful with total restraint.
3. Tracebit (land-book.com): Inter + fafafa, but their body copy uses spaced-character letter-spacing on scroll — brutalist typographic technique.

Theme: DARK. Pure near-black #070709, amber/orange terminal accent #F97316 (CRT terminal glow — haven't used this yet), warm off-white text #EEEAE2. New territory: monospace endpoint paths as primary UI data elements, log stream with status code color-coding.

5 screens: Overview (system health score, incident count, 30-day uptime bars) · Endpoints (method badges GET/POST/PUT/DELETE with colored pills, latency inline, monospace paths) · Incident Detail (latency chart, P50/P95/Error%, timeline) · Logs (live request stream, monospace, status code pills, amber for slow requests) · Alert Rules (notification channels, rule toggles with orange active state).`;

const sub = {
  id:           `heartbeat-kite-${Date.now()}`,
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
  screenNames: ['Overview', 'Endpoints', 'Incident', 'Logs', 'Alerts'],
  markdown: `## Overview
KITE is a real-time API health monitoring tool built for dev teams who need zero blind spots. Inspired by Linear's pure-black typographic authority and Obsidian's single-accent restraint — both discovered on darkmodedesign.com — KITE uses a near-black terminal aesthetic with a burnt amber accent (#F97316) that evokes old CRT screens reimagined for the modern era.

## Design Philosophy
**Terminal clarity, not dashboard chaos.** Most monitoring tools overwhelm with gradients and rainbow charts. KITE does the opposite: pure black canvas (#070709), monospace endpoint paths as primary UI data, a single amber accent that means exactly one thing — something needs your attention.

**Inspired by:**
- Linear.app (darkmodedesign.com) — pure near-black, massive grotesque headlines, single accent, zero ornamentation
- Obsidian.md (darkmodedesign.com) — one accent color on total black, maximum hierarchy via type weight alone
- Tracebit (land-book.com) — monospace character spacing trick, Inter on minimal bg, API/security positioning

## Target Users
- **Backend engineers** — monitoring their APIs in production without switching to a browser
- **Platform/SRE teams** — managing latency thresholds and incident response
- **Indie developers** — solo devs who want PagerDuty-level visibility without enterprise pricing
- **API-first startups** — teams where every payment endpoint timeout is a real revenue event

## Core Features
- **Overview** — 98.7% health score (large display numeral), 3-column stat row (47 endpoints, 1 active incident, 142ms P95), recent incident list with pulse dot for active, 30-day uptime sparkline bars (green/amber/red)
- **Endpoints** — Pill filter strip (All/Healthy/Issues), search bar, list of 6 endpoints with colored method badges (GET=green, POST=amber, PUT=yellow, DELETE=red), monospace paths, latency + color-coded status dot
- **Incident Detail** — Orange alert banner card, latency-over-time line chart (spike from ~130ms to 2340ms), P50/P95/Error% metric trio, 4-item chronological timeline with dot+line layout
- **Logs** — Live mode pill (● LIVE in green), status code filter row, 8 real-time log entries with status pills (200/401/204), monospace paths + timestamps, amber highlighting for slow requests
- **Alert Rules** — 3 notification channel cards (Slack/PagerDuty connected, Webhook add), 5 alert rule rows with threshold conditions in monospace, orange toggle for enabled rules

## Design Language
Three constraints drive the KITE visual system:
1. **Near-pure-black** (#070709 bg, #0E0E14 surface) — not "dark gray," actual black. No surface tints, no gradients.
2. **Amber terminal glow** (#F97316) — one accent, used exclusively for: active incidents, slow requests, alert toggles ON, the brand wordmark. Everything amber means: act now.
3. **Monospace as data** — endpoint paths, timestamps, and log lines use monospace typeface. Data is legible before it is beautiful.

Type: Inter 700/800 for headlines, Inter 600 for labels (8-10px, 1.5-2px letter-spacing ALL-CAPS), monospace for data strings. Accent only on numbers that need action.

## Screen Architecture
1. **Overview** — KITE wordmark in amber, health score card with amber border, 3-stat row, incident feed with pulse animation, 30-bar uptime visualization
2. **Endpoints** — filter pills, search input, 6-item list with method badges, monospace paths, latency colored by threshold
3. **Incident** — amber alert banner, line chart with spike visualization, metric trio, 4-step timeline (opened → alerted → assigned → investigating)
4. **Logs** — LIVE indicator, status code filters, 8 log entries in density-optimized rows, amber on slow, color-coded status codes
5. **Alerts** — Channel connection cards, 5 rule rows with monospace conditions, orange toggles`,
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

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / (screen.width  || 390);
  const scaleY = th / (screen.height || 844);

  function renderNode(node, depth = 0) {
    if (depth > 8) return '';
    const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');
    const x  = (node.x || 0) * scaleX;
    const y  = (node.y || 0) * scaleY;
    const w  = (node.width  || 0) * scaleX;
    const h  = (node.height || 0) * scaleY;
    const fill = node.fill || 'transparent';
    const op   = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
    const cr   = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX, scaleY)}"` : '';
    const sw   = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX,scaleY) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';
    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w/2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fw = ['700','800','900'].includes(String(node.fontWeight)) ? ' font-weight="bold"' : '';
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill||'#EEEAE2'}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      const sw2 = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX,scaleY) : 0;
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op} stroke="${node.stroke?.fill||'none'}" stroke-width="${sw2}"/>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${((x*100+y*10)|0)}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:10px;overflow:hidden;border:1px solid rgba(249,115,22,0.2);box-shadow:0 2px 20px rgba(0,0,0,0.6)">
    <rect width="${tw}" height="${th}" fill="#070709"/>
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ──────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];

  const BG      = '#070709';
  const SURFACE = '#0E0E14';
  const FG      = '#EEEAE2';
  const ACCENT  = '#F97316';
  const GREEN   = '#22C55E';
  const BORDER  = 'rgba(238,234,226,0.08)';
  const FG2     = 'rgba(238,234,226,0.65)';
  const FG3     = 'rgba(238,234,226,0.38)';

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * ((s.width||390) / (s.height||844)));
    const label = prd.screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;color:${FG3};margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: BG,       role: 'VOID BG'      },
    { hex: SURFACE,  role: 'SURFACE'      },
    { hex: FG,       role: 'TEXT WARM'    },
    { hex: ACCENT,   role: 'AMBER / ACT'  },
    { hex: GREEN,    role: 'GREEN / OK'   },
    { hex: '#EAB308',role: 'YELLOW / WARN'},
    { hex: '#EF4444',role: 'RED / CRIT'   },
  ];
  const swatchHTML = swatches.map(sw => {
    return `<div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${BORDER};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;color:${FG3};margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${ACCENT};font-family:'SF Mono','Fira Code',monospace">${sw.hex}</div>
    </div>`;
  }).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '56px', weight: '800', sample: '98.7%' },
    { label: 'HERO',     size: '28px', weight: '700', sample: 'KITE — API Health Monitor' },
    { label: 'HEADING',  size: '16px', weight: '700', sample: 'System Health · Active Incident' },
    { label: 'MONO PATH',size: '13px', weight: '600', sample: 'POST /api/v2/payments', mono: true },
    { label: 'LABEL',    size: '9px',  weight: '600', sample: 'SYSTEM HEALTH · ENDPOINTS · P95 LATENCY' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${BORDER}">
      <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${FG};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.mono ? "'SF Mono','Fira Code',monospace" : 'inherit'}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,12,16,24,32,48].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:10px;color:${FG3};width:32px;flex-shrink:0;font-family:'SF Mono',monospace">${sp}px</div>
      <div style="height:8px;border-radius:2px;background:${ACCENT};width:${sp*2}px;opacity:0.5"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* KITE — Real-time API Health Monitoring */
  /* Inspired by Linear + Obsidian dark mode (darkmodedesign.com) */

  /* Color — terminal black + amber glow */
  --color-bg:        #070709;        /* void black */
  --color-surface:   #0E0E14;        /* raised surface */
  --color-surface2:  #141418;        /* alt surface */
  --color-border:    rgba(238,234,226,0.08);  /* hairline warm */
  --color-fg:        #EEEAE2;        /* warm white */
  --color-fg2:       rgba(238,234,226,0.65);
  --color-fg3:       rgba(238,234,226,0.38);  /* muted */
  --color-amber:     #F97316;        /* terminal glow — act now */
  --color-amber-lo:  rgba(249,115,22,0.10);
  --color-amber-mid: rgba(249,115,22,0.20);
  --color-green:     #22C55E;        /* healthy / resolved */
  --color-green-lo:  rgba(34,197,94,0.12);
  --color-yellow:    #EAB308;        /* warning */
  --color-yellow-lo: rgba(234,179,8,0.12);
  --color-red:       #EF4444;        /* critical */
  --color-red-lo:    rgba(239,68,68,0.12);

  /* Typography */
  --font-sans:  'Inter', system-ui, -apple-system, sans-serif;
  --font-mono:  'SF Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* Spacing — 4px grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;

  /* Elevation — glow system */
  --shadow-card:    0 2px 20px rgba(0,0,0,0.5);
  --shadow-amber:   0 0 16px rgba(249,115,22,0.15);

  /* Radius */
  --radius-sm: 6px;  --radius-md: 12px;  --radius-lg: 16px;
}`;

  const shareText = encodeURIComponent(`KITE — API health monitoring with near-black terminal amber aesthetic. Inspired by Linear + Obsidian dark UIs. Made by RAM Design.`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KITE — API Health Monitoring · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${BG};color:${FG};font-family:-apple-system,'Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${BORDER};display:flex;justify-content:space-between;align-items:center;background:${SURFACE}}
  .logo{font-size:12px;font-weight:700;letter-spacing:3px;color:${FG};opacity:0.7}
  .nav-tag{font-size:9px;color:${ACCENT};letter-spacing:1px;background:rgba(249,115,22,0.12);padding:4px 10px;border-radius:20px;font-weight:700;border:1px solid rgba(249,115,22,0.25)}
  .hero{padding:80px 40px 48px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${ACCENT};margin-bottom:14px;font-weight:700}
  h1{font-size:clamp(56px,11vw,104px);font-weight:800;letter-spacing:-3px;line-height:0.9;margin-bottom:20px;color:${FG}}
  .sub{font-size:16px;color:${FG2};max-width:480px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:28px;margin-bottom:36px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:8px;color:${FG3};letter-spacing:1.5px;margin-bottom:4px;font-weight:600}
  .meta-item strong{color:${FG};font-size:13px;font-weight:700;font-family:'SF Mono','Fira Code',monospace}
  .actions{display:flex;gap:10px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${ACCENT};color:#000}
  .btn-p:hover{opacity:.85}
  .btn-s{background:${SURFACE};color:${FG};border:1px solid ${BORDER}}
  .btn-s:hover{border-color:rgba(249,115,22,0.4)}
  .btn-mock{background:rgba(249,115,22,0.12);color:${ACCENT};border:1px solid rgba(249,115,22,0.3);font-weight:700}
  .btn-g{background:rgba(34,197,94,0.1);color:${GREEN};border:1px solid rgba(34,197,94,0.25)}
  .preview{padding:0 40px 80px}
  .section-label{font-size:8px;letter-spacing:3px;color:${FG3};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${BORDER};font-weight:600}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:10px}
  .thumbs::-webkit-scrollbar{height:3px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:rgba(249,115,22,0.3);border-radius:2px}
  .brand-section{padding:64px 40px;border-top:1px solid ${BORDER};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${SURFACE};border:1px solid ${BORDER};border-radius:10px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${FG2};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);color:${ACCENT};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:rgba(249,115,22,0.2)}
  .prompt-section{padding:40px;border-top:1px solid ${BORDER};max-width:760px}
  .p-label{font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:10px;font-weight:600}
  .p-text{font-size:14px;color:${FG2};font-style:italic;max-width:640px;line-height:1.75;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${BORDER};max-width:780px}
  .prd-section h3{font-size:8px;letter-spacing:2px;color:${ACCENT};margin:24px 0 8px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${FG2};line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${FG};font-weight:600}
  footer{padding:24px 40px;border-top:1px solid ${BORDER};font-size:10px;color:${FG3};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;background:${SURFACE};font-family:'SF Mono',monospace}
  .toast{position:fixed;bottom:24px;right:24px;background:${ACCENT};color:#000;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .terminal-note{background:rgba(249,115,22,0.07);border:1px solid rgba(249,115,22,0.2);border-left:3px solid ${ACCENT};border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:36px;max-width:520px}
  .terminal-note .t-label{font-size:8px;color:${ACCENT};font-weight:700;letter-spacing:1.5px;margin-bottom:6px;font-family:'SF Mono',monospace}
  .terminal-note p{font-size:13px;color:${FG};line-height:1.6}
  .live-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:${GREEN};margin-right:6px;animation:pulse-dot 2s ease-in-out infinite}
  @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-tag">▲ Heartbeat Design</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · DEVTOOLS · MARCH 2026</div>
  <h1>KITE</h1>
  <p class="sub">${meta.tagline}</p>

  <div class="terminal-note">
    <div class="t-label">// DESIGN_INSPIRATION</div>
    <p>Inspired by Linear's pure-black grotesque authority and Obsidian's single-accent restraint — both discovered on darkmodedesign.com. New territory: burnt amber (#F97316) as the only action color, monospace endpoint paths as primary data elements.</p>
  </div>

  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>THEME</span><strong>DARK · VOID</strong></div>
    <div class="meta-item"><span>ACCENT</span><strong>#F97316</strong></div>
    <div class="meta-item"><span>BG</span><strong>#070709</strong></div>
    <div class="meta-item"><span>CATEGORY</span><strong>DEVTOOLS</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/kite-mock" target="_blank">✦ Try Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-s" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-g" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label"><span class="live-dot"></span>SCREEN PREVIEWS — 5 MOBILE SCREENS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:16px;font-weight:600">COLOR SYSTEM — TERMINAL + SEMANTIC</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:16px;font-weight:600">SPACING — 4PX GRID</div>
        ${spacingHTML}
      </div>
    </div>
    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:16px;font-weight:600">TYPE SCALE — INTER + MONO</div>
      ${typeScaleHTML}
    </div>
  </div>

  <div style="margin-top:48px">
    <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:4px;font-weight:600">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
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
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · 2026-03-23</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
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
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>KITE Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
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
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });
  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    ...sub,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);
}

// ── Design DB index ────────────────────────────────────────────────────────────
async function indexInDB() {
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, {
      ...sub,
      design_url: `https://ram.zenbin.org/${SLUG}`,
      mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    });
    rebuildEmbeddings(db);
    return true;
  } catch(e) {
    console.warn('  DB index skipped:', e.message);
    return false;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('▲ KITE — Design Discovery Pipeline\n');

  // Load pen
  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'kite.pen'), 'utf8'));
  console.log('Pen loaded:', penJson.screens?.length || 0, 'screens');

  // Build HTML
  const heroHTML = buildHeroHTML(penJson);
  const viewerHTML = await buildViewerHTML(penJson);
  console.log('HTML built — hero:', (heroHTML.length/1024).toFixed(1), 'KB');

  // a) Hero page
  console.log('\nPublishing hero page...');
  const heroResult = await publishToZenbin(SLUG, `KITE — API Health Monitoring · RAM Design Studio`, heroHTML);
  console.log(`  ${SLUG}: HTTP ${heroResult.status}`);
  if (heroResult.status === 200 || heroResult.status === 201) {
    console.log(`  ✓ https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log('  Response:', heroResult.body.slice(0, 200));
  }

  // b) Viewer
  console.log('\nPublishing viewer...');
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'KITE Viewer · RAM Design Studio', viewerHTML);
  console.log(`  ${VIEWER_SLUG}: HTTP ${viewerResult.status}`);
  if (viewerResult.status === 200 || viewerResult.status === 201) {
    console.log(`  ✓ https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.log('  Response:', viewerResult.body.slice(0, 200));
  }

  // c) Gallery queue
  console.log('\nUpdating gallery queue...');
  try {
    const qRes = await updateGalleryQueue();
    console.log(`  HTTP ${qRes.status}`);
    if (qRes.status === 200) console.log('  ✓ Gallery queue updated');
    else console.log('  Body:', qRes.body.slice(0, 200));
  } catch(e) {
    console.warn('  Queue error:', e.message);
  }

  // d) Design DB
  console.log('\nIndexing in design DB...');
  const indexed = await indexInDB();
  if (indexed) console.log('  ✓ Indexed');

  console.log('\n✓ KITE pipeline complete');
  console.log(`  Hero    → https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer  → https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock    → https://ram.zenbin.org/${SLUG}-mock (built separately)`);
}

main().catch(err => { console.error('Pipeline error:', err); process.exit(1); });
