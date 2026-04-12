'use strict';
// publish-aegis-heartbeat.js — Full Design Discovery pipeline for AEGIS heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'aegis';
const VIEWER_SLUG = 'aegis-viewer';
const APP_NAME    = 'AEGIS';

// ── Design metadata ────────────────────────────────────────────────────────────
const meta = {
  appName:   'AEGIS',
  tagline:   'Counter-UAV command platform for real-time drone threat detection, intercept coordination, and mission debrief.',
  archetype: 'productivity',
  palette: {
    bg:      '#0E1114',
    fg:      '#D6DDE8',
    accent:  '#F90000',
    accent2: '#00D4FF',
  },
};

const ORIGINAL_PROMPT = 'Design AEGIS — a military-grade counter-drone operations SaaS platform. Directly inspired by the Awwwards Site of the Day, March 21 2026: "Darknode" by Qream (Ukraine\'s 412th Nemesis drone-intercept brigade). Darknode palette: #F90000 blood-red + #14181E near-black, stealth-minimal UI, GSAP scroll animations, Blender 3D aesthetics. AEGIS applies this exact visual language — void dark bg, red-as-danger-and-action, radar-cyan for scan data — to a 5-screen SaaS command center: Command Overview · Radar Map · Fleet Status · Mission Log · After Action Report. Secondary inspiration: Linear.app (AI agent workflow density from darkmodedesign.com) and TRIONN (#121315 dark, Syne font, from darkmodedesign.com). Challenge: translate a single-page award-winning portfolio site\'s aesthetic into a functional multi-screen operations product.';

const sub = {
  id:           `heartbeat-aegis-${Date.now()}`,
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
  screenNames: ['Command Center', 'Radar Map', 'Fleet Status', 'Mission Log', 'After Action Report'],
  markdown: `## Overview
AEGIS is a command-and-control SaaS platform for counter-UAV (unmanned aerial vehicle) operations teams. It provides real-time drone threat detection, intercept coordination, fleet management, and automated mission reporting. Built for municipal defense contractors, critical infrastructure operators, and military-adjacent security teams who need to detect, track, and neutralize hostile drones across a protected airspace sector.

## Design Inspiration
**Primary inspiration: Awwwards Site of the Day, March 21, 2026 — "Darknode" by Qream**
Darknode is the operational website for Ukraine's 412th Nemesis brigade — a real counter-drone unit operating interceptor drones to neutralize enemy UAVs. The site uses #F90000 blood-red and #14181E near-black with stealth-minimal UI, GSAP scroll animations, and Blender-rendered 3D drone elements. AEGIS directly inherits this palette and aesthetic philosophy: blood red means danger/action, darkness means stealth, and everything that isn't data is invisible.

**Secondary inspirations:**
- Linear.app (darkmodedesign.com) — AI agent workflow patterns, dense typographic information hierarchy, precise 4px grid
- TRIONN (darkmodedesign.com) — #121315 ultra-dark surface treatment, Syne geometric font, award-winning agency dark aesthetic

## Target Users
- **Sector operators** — monitoring live drone activity and coordinating intercept missions
- **Fleet commanders** — managing 5–50 interceptor and scout drones across a patrol zone
- **Mission analysts** — reviewing intercept logs and generating after-action briefs
- **Commanders / leadership** — reviewing daily operational summaries and AI threat forecasts

## Core Features
- **Command Center** — Threat level meter (HIGH/MEDIUM/LOW), live threat count, active intercept cards with drone blips, fleet readiness overview
- **Radar Map** — Circular radar scope with actual bearing/range geometry, threat blips color-coded by severity, own-position marker, live sweep animation
- **Fleet Status** — Per-drone cards: type (Interceptor / Scout / Jammer), mission assignment, battery percentage bar, signal strength, speed, altitude
- **Mission Log** — Chronological intercept history with outcome tags (NEUTRALIZED / IN PROGRESS / LOST SIGNAL), duration, interceptor ID, method (Pursuit / Net Capture / Freq Jam)
- **After Action Report** — Daily ops summary, AI-generated recommendations (battery critical alerts, threat forecasting), PDF export, operator sign-off

## Design Language
The AEGIS visual system is built around three constraints borrowed directly from Darknode:
1. **Void-dark canvas** (#0E1114) — every pixel of chrome is invisible; only data has form
2. **Blood-red as the only warm color** (#F90000) — used exclusively for danger, active threats, and primary actions; nothing decorative
3. **Radar-cyan as the information channel** (#00D4FF) — sweep data, scan elements, navigation highlights; the color of information-in-transit

Combined with a military monospace typographic system (SF Mono / Fira Code), grid-dot textures suggesting radar returns, and corner-bracket HUD decorations, AEGIS feels like a real tactical display system rather than a consumer product.

## Screen Architecture
1. **Command Center** — Primary overview: threat level hero, 4-stat grid (threats / drones / intercepts / sector-clear), live threat card list with mini drone icons and threat bars
2. **Radar Map** — Circular sector sweep with concentric range rings, bearing-accurate threat blip placement, sweep line animation, legend, selected-target strip
3. **Fleet Status** — 5 drone cards (ACE-01 through ACE-05), battery and signal bars, per-drone mission assignment, status pills (DEPLOYED / STANDBY / PATROL / CHARGING)
4. **Mission Log** — Filter chips, 5 recent mission cards with outcome color, method tag, interceptor, duration; IN PROGRESS card highlighted in red
5. **After Action Report** — Classification badge, daily metrics table (31 intercepts / 93.5% success), AI recommendation block, operator sign-off action strip`,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Screen thumb SVG renderer ─────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / screen.width;
  const scaleY = th / screen.height;

  function renderNode(node, depth = 0) {
    if (depth > 8) return '';
    const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');

    const x = (node.x || 0) * scaleX;
    const y = (node.y || 0) * scaleY;
    const w = (node.width || 0) * scaleX;
    const h = (node.height || 0) * scaleY;
    const fill = node.fill || 'transparent';
    const op = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
    const cr = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX, scaleY)}"` : '';
    const sw = node.stroke?.thickness ? (node.stroke.thickness * Math.min(scaleX, scaleY)) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';

    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w / 2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fwStr = node.fontWeight === '700' || node.fontWeight === '800' || node.fontWeight === '900' ? ' font-weight="bold"' : '';
      const truncated = (node.content || '').slice(0, 30);
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill || '#D6DDE8'}" text-anchor="${anchor}"${op}${fwStr} clip-path="url(#cp${Math.abs(x*y|0)})">${truncated.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      const rx = w / 2; const ry = h / 2;
      return `<ellipse cx="${(x + rx).toFixed(1)}" cy="${(y + ry).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${fill}"${op}${strokeStr}>${children}</ellipse>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    // frame
    const clipId = `fc${depth}_${(x*100+y*10)|0}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }

  const inner = renderNode(screen);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:8px;overflow:hidden;border:1px solid #1E2730">${inner}</svg>`;
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const doc = penJson;
  const screens = doc.children || [];

  function lightenHex(hex, amt) {
    const n = parseInt((hex || '#111111').replace('#',''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
  }

  const surface = lightenHex(meta.palette.bg, 14);
  const border  = lightenHex(meta.palette.bg, 28);

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
    { hex: meta.palette.bg,      role: 'VOID BG'    },
    { hex: surface,              role: 'SURFACE'    },
    { hex: meta.palette.fg,      role: 'STEEL FG'   },
    { hex: meta.palette.accent,  role: 'BLOOD RED'  },
    { hex: meta.palette.accent2, role: 'RADAR CYAN' },
    { hex: '#FF8C00',            role: 'THREAT AMBER'},
    { hex: '#0DBA74',            role: 'SECURE GREEN'},
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'48px', weight:'900', sample: 'AEGIS' },
    { label:'HEADING',  size:'22px', weight:'700', sample: 'COMMAND CENTER · SECTOR BRAVO-7' },
    { label:'DATA',     size:'14px', weight:'400', sample: 'UAV-441 · BRG 043° · 1.2km · ALT 42m · INTERCEPTING' },
    { label:'LABEL',    size:'9px',  weight:'700', sample: 'ACTIVE THREATS · MISSION LOG · FLEET STATUS' },
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
  /* AEGIS — Counter-UAV Operations Platform */
  /* Inspired by Awwwards SOTD "Darknode" by Qream, Mar 21 2026 */

  /* Color — Darknode palette */
  --color-bg:        ${meta.palette.bg};    /* stealth void */
  --color-surface:   ${surface};    /* elevated surface */
  --color-border:    ${border};    /* subtle border */
  --color-fg:        ${meta.palette.fg};    /* cool slate-white */
  --color-red:       ${meta.palette.accent};    /* Darknode blood-red — danger / action */
  --color-cyan:      ${meta.palette.accent2};    /* radar scan — information-in-transit */
  --color-amber:     #FF8C00;    /* threat level — elevated */
  --color-green:     #0DBA74;    /* secure / nominal */

  /* Typography — military monospace */
  --font-family:    'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:   900 clamp(36px, 6vw, 64px) / 1 var(--font-family);
  --font-heading:   700 16px / 1.3 var(--font-family);
  --font-body:      400 13px / 1.6 var(--font-family);
  --font-label:     700 9px / 1 var(--font-family);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 16px;  --radius-pill: 9999px;
}`;

  const shareText = encodeURIComponent(`AEGIS — Counter-UAV operations platform designed by RAM. Inspired by Awwwards SOTD "Darknode" palette #F90000 + #14181E. 5 screens + full design system.`);
  const penB64 = Buffer.from(JSON.stringify(penJson)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.appName} — Counter-UAV Operations Platform · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${meta.palette.fg}}
  .nav-id{font-size:10px;color:${meta.palette.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:16px}
  h1{font-size:clamp(56px,10vw,100px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${meta.palette.fg}}
  .sub{font-size:15px;opacity:.5;max-width:520px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.bg}}
  .btn-p:hover{opacity:0.85}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-c{background:transparent;color:${meta.palette.accent2};border:1px solid ${meta.palette.accent2}44}
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
  .p-text{font-size:16px;opacity:.55;font-style:italic;max-width:640px;line-height:1.7;margin-bottom:16px}
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
  <div class="tag">HEARTBEAT DESIGN SYSTEM · ${meta.archetype.toUpperCase()} · MARCH 21, 2026</div>
  <h1>${meta.appName}</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>AWWWARDS SOTD</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#F90000 + #0E1114</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">⬡ Open in Viewer</a>
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
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE — DARKNODE-FAITHFUL</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SCALE — 4PX BASE GRID</div>
        ${spacingHTML}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">TYPE SCALE — MILITARY MONOSPACE</div>
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
    .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/(?<![>])\n/g, ' ')}
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · MARCH 21, 2026</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  const PEN_DATA = "${penB64}";

  function downloadPen() {
    const blob = new Blob([atob(PEN_DATA)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'aegis.pen'; a.click();
  }
  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
  }
  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied ✓'));
  }
  function shareOnX() {
    window.open('https://x.com/intent/tweet?text=${shareText}&url=' + encodeURIComponent(location.href), '_blank');
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
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>AEGIS Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── Zenbin publisher ───────────────────────────────────────────────────────────
async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  const r = await httpsReq({
    hostname: 'zenbin.org',
    path:     `/v1/pages/${slug}`,
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    'ram',
    },
  }, body);
  return r;
}

// ── Gallery queue ──────────────────────────────────────────────────────────────
async function addToGalleryQueue(heroUrl) {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });
  const fileData = JSON.parse(getRes.body);
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
    design_url:   heroUrl,
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
  const putBody = JSON.stringify({
    message:  `add: AEGIS to gallery (heartbeat)`,
    content:  newContent,
    sha:      currentSha,
  });
  const putRes = await httpsReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers:  {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':        'application/vnd.github.v3+json',
    },
  }, putBody);
  return putRes;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  AEGIS — DESIGN DISCOVERY PIPELINE');
  console.log('═══════════════════════════════════════════════\n');

  // Load pen file
  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'aegis.pen'), 'utf8'));
  console.log(`✓ Loaded aegis.pen (${penJson.children.length} screens)`);

  // Build HTML pages
  console.log('\nBuilding hero page...');
  const heroHTML   = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML built (${(heroHTML.length/1024).toFixed(1)}kb)`);

  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML built (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  // Publish hero → ram.zenbin.org/aegis
  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroUrl    = `https://ram.zenbin.org/${SLUG}`;
  const heroResult = await publishToZenbin(SLUG, 'AEGIS — Counter-UAV Operations Platform · RAM Design Studio', heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) {
    console.log(`  ✓ Hero live at ${heroUrl}`);
  } else {
    console.log(`  Response: ${heroResult.body.slice(0, 200)}`);
  }

  // Publish viewer → ram.zenbin.org/aegis-viewer
  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'AEGIS Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) {
    console.log(`  ✓ Viewer live at https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.log(`  Response: ${viewerResult.body.slice(0, 200)}`);
  }

  // Add to gallery queue
  console.log('\nAdding to gallery queue...');
  try {
    const galleryResult = await addToGalleryQueue(heroUrl);
    if (galleryResult.status === 200) {
      console.log('  ✓ Gallery queue updated');
    } else {
      console.log(`  Gallery queue status: ${galleryResult.status}`);
      console.log(`  ${galleryResult.body.slice(0, 150)}`);
    }
  } catch (e) {
    console.log(`  Gallery queue error: ${e.message}`);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  AEGIS PUBLISHED ✓');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n✗ Fatal error:', err.message);
  process.exit(1);
});
