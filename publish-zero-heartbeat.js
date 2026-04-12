'use strict';
// publish-zero-heartbeat.js — Full Design Discovery pipeline for ZERO heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'zero';
const VIEWER_SLUG = 'zero-viewer';
const APP_NAME    = 'ZERO';

// ── Design metadata ────────────────────────────────────────────────────────────
const meta = {
  appName:   'ZERO',
  tagline:   'Autonomous drone fleet intelligence. Minimal UI, maximum situational awareness.',
  archetype: 'productivity',
  palette: {
    bg:      '#080810',
    surface: '#0F0F1C',
    fg:      '#C2C4D8',
    accent:  '#00FFAA',
    red:     '#FF3158',
    amber:   '#FFB930',
    dim:     '#1A1A30',
  },
};

const ORIGINAL_PROMPT = `Design ZERO — a dark-mode autonomous drone fleet intelligence platform for tactical operations. Directly inspired by research from this heartbeat session:

1. DARKNODE (Awwwards SOTD March 21, 2026) — "mission-like site blending minimal UI and stealth" for Ukraine's 412th Nemesis interceptor drone brigade. Only a 2-color palette, hero video, 3D animation, extreme restraint. The site IS the mission brief.

2. Linear.app (darkmodedesign.com) — "The product development system for teams and agents / Designed for the AI era." Functional dark precision, dense data hierarchies, sidebar navigation done right.

3. Evervault (godly.website featured, March 2026) — Clean, authoritative security-product dark UI. "Leading companies build on Evervault." Understated trust through design restraint.

The challenge: apply the Darknode stealth aesthetic to a real operational tool. Near-void-black (#080810) canvas, neon mint (#00FFAA) as the sole "nominal/active" signal color — like a phosphor HUD screen — and alert red (#FF3158) reserved only for threats. Military time, coordinate displays, tactical left-border coding on cards. 5 screens covering the full ops cycle: Mission Control (fleet hero stat) · Fleet Status (drone cards) · Active Mission (waypoint timeline) · Alerts Feed (threat severity stream) · Operator Profile.`;

const sub = {
  id:           `heartbeat-zero-${Date.now()}`,
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
  screenNames: ['Mission Control', 'Fleet Status', 'Active Mission', 'Alerts', 'Operator'],
  markdown: `## Overview
ZERO is a tactical operations dashboard for managing autonomous drone fleets in real time. It was directly inspired by DARKNODE — the Awwwards Site of the Day for March 21, 2026 — a site built for Ukraine's 412th Nemesis interceptor drone unit that uses "minimal UI and stealth" as its design mandate. ZERO takes that aesthetic from the landing page layer and applies it to the operational product layer: what would the operators actually see on their screens?

## Design Philosophy
**Zero noise, zero tolerance for decoration.** The interface is a tool, not a brand exercise. Near-void-black (#080810) is darker than typical "dark mode" — it creates a genuine sense of low-light operational context. Neon mint (#00FFAA) functions like phosphor on a CRT HUD — it means exactly one thing: nominal, active, operational. Red means threat. Everything else is structural muted grey.

**Inspired directly by:**
- DARKNODE (awwwards.com SOTD 3/21/26) — stealth minimal UI, 2-color palette, mission-brief aesthetic
- Linear.app (darkmodedesign.com) — functional dark precision, dense data hierarchies, sidebar nav
- Evervault (godly.website) — authoritative dark security product UI, design restraint as credibility signal
- Midday.ai (darkmodedesign.com) — "one-person company" tools ethos — a single operator needs full fleet awareness

## Target Users
- **Tactical drone operators** — monitoring active fleet missions in real time
- **Mission commanders** — overview of all active, standby, and returning units
- **Incident response teams** — rapid threat assessment and intercept authorization
- **Fleet maintenance supervisors** — battery, signal, and altitude status at a glance

## Core Features
- **Mission Control** — Hero stat ("12 ACTIVE DRONES" at 80px bold), fleet status strip (AIRBORNE/STANDBY/RTB), active mission bento grid (4 cards with threat-coded left borders), alert banner for active intercepts, quick intel strip
- **Fleet Status** — Searchable unit list, 5 drone cards with battery bars, signal strength dots, GPS coordinates, status pills and altitude data
- **Active Mission** — Large mission ID header, mission timer/altitude/velocity stat strip, progress bar, 5-waypoint timeline with completion states and active step highlighted in red
- **Alerts Feed** — Real-time threat stream, severity filter chips (ALL/CRITICAL/HIGH/INFO), 6 alert cards with color-coded left borders and threat classification badges
- **Operator Profile** — Avatar + clearance level pill, 4-metric performance grid, recent mission history with severity coding, sign-out action

## Design Language
ZERO enforces a strict 3-constraint visual system:

1. **Void canvas (#080810)** — True near-black, not "comfortable dark mode." Forces every data element to claim its own presence.
2. **Phosphor accent (#00FFAA)** — Used exclusively for operational/nominal/active states. The eye learns immediately: mint = all clear. Not decorative.
3. **Red only for threats (#FF3158)** — Battery critical, hostile UAV intercept, CRITICAL alerts. Color earns meaning through scarcity.

Typography: System sans-serif at extreme weight contrasts — 900 for display numbers, 700 for headings, 400 for body. Large display numbers (80px for fleet count, 38px for mission IDs) are the primary visual anchors. Coordinate data uses monospace-style letter-spacing for HUD authenticity.

## Screen Architecture
1. **Mission Control** — 80px "12" fleet count hero, airborne/standby/RTB strip, 2×2 mission bento grid, red alert banner (active intercept), quick intel strip (2847 flight hrs / 7 missions)
2. **Fleet Status** — Search bar, column headers, 5 drone rows each with: unit ID, status pill, GPS coordinates, battery % + progress bar, 4-dot signal strength, altitude
3. **Active Mission** — "MSN-0441" at 38px, elapsed/altitude/velocity strip, 40% progress bar, 5-waypoint vertical timeline with ✓ done / ● active / ○ pending states
4. **Alerts** — Filter chips row, 6 alert cards from CRITICAL down to INFO — left border color + severity pill + type label + message body + timestamp
5. **Operator Profile** — Avatar ring + name + clearance pill, 2×2 stats grid (312 missions / 847 hrs / 99.4% success / 28 intercepts), 5-item recent mission list, sign out`,
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
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill||meta.palette.fg}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;
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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:8px;overflow:hidden;border:1px solid #1E1E38">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ──────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];

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
    { hex: meta.palette.surface, role: 'SURFACE'       },
    { hex: meta.palette.fg,      role: 'COOL WHITE'    },
    { hex: meta.palette.accent,  role: 'MINT HUD'      },
    { hex: meta.palette.red,     role: 'THREAT RED'    },
    { hex: meta.palette.amber,   role: 'WARN AMBER'    },
    { hex: meta.palette.dim,     role: 'DIM FILL'      },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'72px', weight:'900', sample: '12' },
    { label:'HERO',     size:'38px', weight:'900', sample: 'MSN-0441' },
    { label:'HEADING',  size:'16px', weight:'700', sample: 'ZERO — Drone Fleet Intelligence' },
    { label:'BODY',     size:'12px', weight:'400', sample: 'ZR-003 battery at 18%. Return to base recommended immediately.' },
    { label:'LABEL',    size:'8px',  weight:'700', sample: 'AIRBORNE · MINT = NOMINAL · RED = THREAT · STANDBY = WHITE' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,12,16,24,32,48].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp*2}px;opacity:0.5"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* ZERO — Autonomous Drone Fleet Intelligence */
  /* Inspired by DARKNODE Awwwards SOTD 3/21/26 + Linear + Evervault */

  /* Color — void-dark, phosphor-signal system */
  --color-bg:        ${meta.palette.bg};       /* near-void black — operational context */
  --color-surface:   ${meta.palette.surface};   /* elevated panel */
  --color-dim:       ${meta.palette.dim};        /* dim fill */
  --color-border:    ${border};                  /* hairline tactical border */
  --color-fg:        ${meta.palette.fg};         /* cool-white HUD text */
  --color-nominal:   ${meta.palette.accent};     /* mint phosphor — AIRBORNE / ACTIVE / OK */
  --color-threat:    ${meta.palette.red};        /* alert red — CRITICAL / INTERCEPT */
  --color-warning:   ${meta.palette.amber};      /* amber — LOW BATTERY / RTB */
  --color-muted:     #44445E;                    /* muted structural grey */

  /* Typography — high-contrast weight system */
  --font-family:     -apple-system, 'SF Pro Display', 'Inter', system-ui, sans-serif;
  --font-display:    900 clamp(48px, 10vw, 80px) / 1 var(--font-family);
  --font-mission-id: 900 38px / 1 var(--font-family);
  --font-heading:    700 16px / 1.3 var(--font-family);
  --font-body:       400 12px / 1.6 var(--font-family);
  --font-label:      700 8px / 1 var(--font-family);
  --font-coord:      600 9px / 1 var(--font-family);

  /* Spacing — 8px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 10px;  --radius-lg: 12px;  --radius-pill: 9999px;

  /* Opacity system for severity coding */
  --opacity-critical: 0.9;  /* left border — THREAT color */
  --opacity-active:   0.85; /* left border — NOMINAL color */
  --opacity-standby:  0.35; /* left border — muted */
}`;

  const shareText = encodeURIComponent(`ZERO — autonomous drone fleet intelligence UI designed by RAM. Inspired by DARKNODE Awwwards SOTD (3/21/26). Void black + neon mint. 5 screens of tactical ops.`);
  const penB64 = Buffer.from(JSON.stringify(penJson)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ZERO — Drone Fleet Intelligence · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:-apple-system,'SF Pro Display','Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${meta.palette.fg}}
  .nav-id{font-size:9px;color:${meta.palette.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:16px}
  h1{font-size:clamp(64px,12vw,112px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:16px;color:${meta.palette.fg}}
  .sub{font-size:15px;opacity:.5;max-width:540px;line-height:1.6;margin-bottom:32px}
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
  .tokens-pre{font-size:10px;line-height:1.8;color:${meta.palette.fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
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
  <h1>ZERO</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>DARKNODE SOTD 3/21/26</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#00FFAA + #080810</strong></div>
    <div class="meta-item"><span>TREND</span><strong>STEALTH MINIMAL UI</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/zero-mock" target="_blank">✦ Try Interactive Mock</a>
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
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE — VOID-DARK + PHOSPHOR-SIGNAL SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SCALE — 8PX BASE GRID</div>
        ${spacingHTML}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">TYPE SCALE — HIGH-CONTRAST WEIGHT SYSTEM</div>
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
  <p class="p-text">${ORIGINAL_PROMPT.replace(/\n/g, '<br>')}</p>
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
    a.download = 'zero.pen'; a.click();
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
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ZERO Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
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
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
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
    mock_url:     `https://ram.zenbin.org/zero-mock`,
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
    message: `add: ZERO to gallery (heartbeat)`,
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
  console.log('══ ZERO Design Discovery Pipeline ══\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'zero.pen'), 'utf8'));
  console.log(`✓ Loaded zero.pen (${penJson.children.length} screens)`);

  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML built (${(heroHTML.length/1024).toFixed(1)}kb)`);

  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML built (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroResult = await publishToZenbin(SLUG, `ZERO — Drone Fleet Intelligence · RAM Design Studio`, heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) {
    console.log(`  ✓ Live at https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`  Response: ${heroResult.body.slice(0, 200)}`);
  }

  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'ZERO Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) {
    console.log(`  ✓ Live at https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.log(`  Response: ${viewerResult.body.slice(0, 200)}`);
  }

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
  console.log(`  Mock:   https://ram.zenbin.org/zero-mock (build with zero-mock.mjs)`);
})();
