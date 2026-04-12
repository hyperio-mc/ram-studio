'use strict';
// nemesis-publish.js — Full Design Discovery pipeline for NEMESIS heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE || 'queue.json';

const SLUG        = 'nemesis';
const VIEWER_SLUG = 'nemesis-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'NEMESIS',
  tagline:   'Tactical UAV swarm commander. Intercept hostile drones. Protect the front.',
  archetype: 'productivity',
  palette: {
    bg:      '#080A0A',
    fg:      '#D8E8E8',
    accent:  '#00E5B0',
    accent2: '#FFB830',
  },
};

const sub = {
  id:           'heartbeat-nemesis',
  prompt:       'Design NEMESIS — a tactical UAV swarm commander mobile app for interceptor drone operations. Directly inspired by Darknode (Awwwards SOTD March 21, 2026 — "mission-like site blending minimal UI and stealth" for Ukraine\'s 412th Nemesis brigade), Dark Mode Design showcase trend of near-black + single electric accent, and the military operator aesthetic seen in Land-book\'s Runlayer enterprise AI tools landing. Palette: void black #080A0A + electric teal #00E5B0 (strict 2-color Darknode principle). Monospace typography. 5 mobile screens: Mission Ops Overview · Tactical Grid Map · Swarm Status · Mission Brief · Alert Log.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Overview', 'Tactical Map', 'Swarm Status', 'Mission Brief', 'Alert Log'],
  markdown: `## Overview
NEMESIS is a tactical UAV swarm commander built for interceptor drone operations — the command interface used by drone operators neutralizing hostile UAVs at the front. It provides mission overview, live tactical grid mapping, per-unit telemetry, classified mission briefs, and a real-time intercept event feed — all in an ultra-minimal stealth UI inspired by Awwwards' SOTD winner Darknode.

## Target Users
- **Drone warfare operators** commanding interceptor swarms in active combat zones
- **Mission control officers** overseeing multiple concurrent intercept operations
- **UAV technicians** monitoring battery, signal, altitude, and status for each unit
- **Intelligence analysts** reviewing threat detection logs and intercept event histories

## Core Features
- **Mission Operations Overview** — Threat level indicator (editorial large-numeral display), active mission count, interceptors deployed, neutralization count. Active operations list with status badges.
- **Tactical Grid Map** — Military coordinate grid (N-14, W-06, E-21 sector system). Friendly drone markers (teal), enemy UAV threat diamonds (red), holding zones, intercept vectors. Live tracking lines.
- **Swarm Status** — Individual telemetry for all 8 interceptors: battery percentage with color-coded warning bars, signal strength, altitude, and operational status. Fleet summary strip.
- **Mission Brief** — Classified document aesthetic. Operation code, classification level, sector, primary objective, threat class, engagement rules, comms frequency, and target GPS coordinates. Authorize & Deploy CTA.
- **Alert Log** — Chronological feed of intercept events, threat detections, low-battery warnings, and system events. Summary bar with intercept/threat/warning/system counts.

## Design Language
Inspired by three specific sources discovered on **March 21, 2026**:

1. **Darknode** (Awwwards Site of the Day — March 21, 2026) — "Darknode is a special division within Ukraine's 412th Nemesis brigade, operating interceptor drones to neutralize enemy UAVs. We built a mission-like site blending minimal UI and stealth." Ultra-sparse 2-color palette (near-black + single accent). No decoration. Every pixel earns its place. NEMESIS directly adopts this 2-color discipline: void black (#080A0A) + electric teal (#00E5B0) as the only hues, with red and amber reserved for threat/warning states only.
2. **Dark Mode Design gallery** (darkmodedesign.com) — Trending toward pure minimalism: Linear, Midday, Forge, Obsidian all favor near-void backgrounds with a single luminous accent. NEMESIS takes this to its logical extreme with a military tactical context.
3. **Runlayer on Land-book** — "Enterprise MCPs, Skills & Agents" — terminal-operator grid aesthetic for serious AI tooling. NEMESIS uses a subtle grid overlay (accent + '08' opacity) across all screens as the underlying spatial logic, echoing radar scans.

The palette — **void black #080A0A with electric teal #00E5B0** — deliberately violates typical "safety" UX colors to create authentic operator gravity. This is not a consumer app. It should feel like authenticated military software.

Typography is all-caps, monospaced-weight, maximum letter-spacing at labels. Large editorial numerals for key data (threat level, kill count) echo Darknode's site treatment.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. Mission Ops Overview — Wordmark + threat level editorial numeral, 2×2 stat grid, active operations list
2. Tactical Grid Map — Full-bleed grid, sector zones, drone/threat markers, intercept vectors, legend strip
3. Swarm Status — Fleet summary bar, individual drone rows with battery/signal/alt/status telemetry
4. Mission Brief — Classified header, data table, target GPS coordinates, Authorize & Deploy action
5. Alert Log — Summary counts, chronological event feed with type/message/timestamp`,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(body) : null;
    if (bodyBuf) opts.headers = { ...opts.headers, 'Content-Length': bodyBuf.length };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (bodyBuf) r.write(bodyBuf);
    r.end();
  });
}
const post_ = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'POST', headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const put_  = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'PUT',  headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const get_  = (host, p, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0', ...hdrs } });

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderEl(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0, w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = typeof el.fill === 'string' ? el.fill : 'none';
  const oAttr = el.opacity !== undefined && el.opacity < 0.99 ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';
  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderEl(c, depth + 1)).join('');
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'ellipse') {
    const sf = typeof el.fill === 'string' ? el.fill : meta.palette.accent;
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 12) * 0.7));
    const tf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : meta.palette.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}
const screenThumbSVG = (s, tw, th) => {
  const kids = (s.children || []).map(c => renderEl(c, 0)).join('');
  const bg = typeof s.fill === 'string' ? s.fill : meta.palette.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0"><rect width="${s.width}" height="${s.height}" fill="${bg}"/>${kids}</svg>`;
};

// ── Color helpers ─────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#080a0a').replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:11px;letter-spacing:1.5px;opacity:.5;margin:20px 0 8px;font-weight:700">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#141717;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = lightenHex(meta.palette.bg, 12);
  const border  = lightenHex(meta.palette.bg, 24);
  const THUMB_H = 200;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = `M · ${prd.screenNames[i] || i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#080A0A', role: 'VOID BLACK'  },
    { hex: '#0D1010', role: 'SURFACE'     },
    { hex: '#121515', role: 'SURFACE 2'   },
    { hex: '#D8E8E8', role: 'COOL WHITE'  },
    { hex: '#00E5B0', role: 'ELECTRIC TEAL' },
    { hex: '#FF3A3A', role: 'THREAT RED'  },
    { hex: '#FFB830', role: 'WARN AMBER'  },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:52px;border-radius:4px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent};font-family:'SF Mono','Fira Code',monospace">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '64px', weight: '900', sample: 'NEMESIS' },
    { label: 'WORDMARK', size: '32px', weight: '900', sample: 'THREAT LEVEL · 3/5' },
    { label: 'BODY',     size: '12px', weight: '400', sample: 'NMS-01 neutralized T-214 @ Sector N-14 · 09:38:12 UTC' },
    { label: 'CAPTION',  size: '9px',  weight: '700', sample: 'INTERCEPT · THREAT · HOLDING · RTB · STANDBY' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px;font-family:'SF Mono',monospace">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:'SF Mono','Fira Code',monospace">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:6px;border-radius:2px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* NEMESIS — Void Black / Electric Teal — 2-color stealth system */
  --color-bg:        #080A0A;   /* void black */
  --color-surface:   #0D1010;   /* elevated surface */
  --color-surface2:  #121515;   /* card surface */
  --color-surface3:  #171C1C;   /* lighter card */
  --color-border:    #1E2626;   /* subtle border */
  --color-border2:   #243030;   /* visible border */
  --color-fg:        #D8E8E8;   /* cool near-white */
  --color-fg2:       #8AABAB;   /* secondary text */
  --color-muted:     #3A4848;   /* muted */
  --color-accent:    #00E5B0;   /* electric teal — PRIMARY ONLY */
  --color-danger:    #FF3A3A;   /* threat red */
  --color-warn:      #FFB830;   /* warning amber */

  /* Typography — monospace tactical */
  --font-family:   'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:  900 clamp(40px, 8vw, 80px) / 1 var(--font-family);
  --font-heading:  800 18px / 1.2 var(--font-family);
  --font-body:     400 12px / 1.6 var(--font-family);
  --font-caption:  700 9px / 1 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius — minimal, near-square */
  --radius-sm: 3px;  --radius-md: 6px;  --radius-lg: 10px;

  /* Glow effects */
  --glow-accent: 0 0 24px #00E5B022;
  --glow-danger: 0 0 24px #FF3A3A22;
}`;

  const encoded = Buffer.from(JSON.stringify(doc)).toString('base64');
  const shareText = encodeURIComponent(
    `NEMESIS — Tactical UAV Swarm Commander. 5 mobile screens + stealth brand spec + CSS tokens. Inspired by Awwwards SOTD Darknode. Built by RAM Design AI.`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NEMESIS — Tactical UAV Swarm Commander · RAM Design Studio</title>
<meta name="description" content="NEMESIS — tactical drone ops commander. 5 mobile screens, stealth brand spec, CSS tokens. Inspired by Awwwards SOTD Darknode. Designed by RAM AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#080A0A;color:#D8E8E8;font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:18px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:11px;font-weight:900;letter-spacing:5px;color:${meta.palette.accent}}
  .nav-id{font-size:10px;color:${meta.palette.accent};letter-spacing:1px;opacity:.6}
  .hero{padding:72px 40px 36px;max-width:900px}
  .tag{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:18px;opacity:.8}
  h1{font-size:clamp(72px,14vw,120px);font-weight:900;letter-spacing:6px;line-height:1;margin-bottom:16px;color:#D8E8E8}
  .sub{font-size:15px;opacity:.45;max-width:500px;line-height:1.7;margin-bottom:32px}
  .meta{display:flex;gap:28px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent}}
  .actions{display:flex;gap:10px;margin-bottom:56px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:4px;font-size:11px;font-weight:800;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:1px;transition:opacity .15s}
  .btn-p{background:${meta.palette.accent};color:#080A0A}
  .btn-p:hover{opacity:.9}
  .btn-s{background:transparent;color:#D8E8E8;border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}55}
  .btn-g{background:#00E5B022;color:${meta.palette.accent};border:1px solid #00E5B033}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .btn-d{background:#FF3A3A22;color:#FF3A3A;border:1px solid #FF3A3A33}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:22px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:56px 40px;border-top:1px solid ${border};max-width:900px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:6px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#D8E8E8;opacity:.65;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}18;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:9px;letter-spacing:1.5px;padding:5px 12px;border-radius:3px;cursor:pointer;font-weight:800}
  .copy-btn:hover{background:${meta.palette.accent}28}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:16px;opacity:.5;font-style:italic;max-width:620px;line-height:1.7;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:760px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:800}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;opacity:.6;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#D8E8E8}
  footer{padding:24px 40px;border-top:1px solid ${border};font-size:10px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:#080A0A;font-family:inherit;font-size:10px;font-weight:800;letter-spacing:1.5px;padding:10px 20px;border-radius:4px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:14px 20px;border-radius:0 4px 4px 0;margin:0 40px 36px;max-width:660px;font-size:11px;line-height:1.7;opacity:.7}
  .inspiration-bar strong{color:${meta.palette.accent};opacity:1}
  .classified-banner{background:#FF3A3A18;border:1px solid #FF3A3A33;padding:10px 40px;margin-bottom:0;font-size:9px;letter-spacing:3px;color:#FF3A3A;font-weight:800;text-align:center}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<div class="classified-banner">// CLASSIFIED //  TOP SECRET  NEMESIS DESIGN SYSTEM  // CLASSIFIED //</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-nemesis · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · TACTICAL UAV OPS · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>NEMESIS</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>TACTICAL OPS</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>2-COLOR STEALTH</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>DESIGNED BY</span><strong>RAM · HEARTBEAT RUN</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <a class="btn btn-g" href="https://ram.zenbin.org/${SLUG}-mock">◈ Interactive Mock</a>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="inspiration-bar">
  <strong>Research sources (March 21, 2026):</strong>
  Darknode — Awwwards SOTD March 21, 2026 ("mission-like site blending minimal UI and stealth" for Ukraine's drone division) ·
  Dark Mode Design gallery trending minimal dark UIs (darkmodedesign.com) ·
  Runlayer enterprise AI operator aesthetic (land-book.com)
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR SYSTEM · 7 TONES · 2-COLOR PRINCIPLE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE · MONOSPACE TACTICAL</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${[
        '2-color discipline — Only electric teal (#00E5B0) and void black (#080A0A) are "designed" colors. Red and amber exist purely as semantic threat/warning signals. No gradients. No decoration.',
        'Every element earns its place — Inspired by Darknode SOTD: if it doesn\'t carry information, it doesn\'t exist. Grid lines at 8% opacity are the only ambient texture.',
        'Monospace as military syntax — Tactical systems use monospace fonts because operators read data, not prose. Fixed-width characters create information density without visual noise.',
      ].map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
        <div style="color:${meta.palette.accent};font-size:9px;font-weight:800;flex-shrink:0;margin-top:2px">${String(i + 1).padStart(2, '0')}</div>
        <div style="font-size:12px;opacity:.55;line-height:1.65">${p}</div>
      </div>`).join('')}
    </div>

  </div>

  <div class="tokens-block" id="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${mdToHtml(prd.markdown)}
</section>

<footer>
  <span>RAM Design Studio · AI-native design heartbeat</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = ${JSON.stringify(encoded)};
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
function openInViewer() {
  try {
    const jsonStr = atob(D);
    JSON.parse(jsonStr);
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'nemesis.pen' }));
    window.open('https://zenbin.org/p/pen-viewer-3', '_blank');
  } catch(e) { alert('Could not load pen: ' + e.message); }
}
function downloadPen() {
  try {
    const jsonStr = atob(D);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nemesis.pen';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch(e) { alert('Download failed: ' + e.message); }
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT)
    .then(() => toast('Prompt copied ✓'))
    .catch(() => toast('Copy failed'));
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(() => toast('Tokens copied ✓'))
    .catch(() => toast('Copy failed'));
}
function shareOnX() {
  window.open('https://twitter.com/intent/tweet?text=${shareText}%20https://ram.zenbin.org/${SLUG}', '_blank');
}
</script>
</body>
</html>`;
}

// ── GitHub queue ──────────────────────────────────────────────────────────────
async function addToGalleryQueue() {
  const getRes = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  });
  if (getRes.status !== 200) throw new Error(`Queue GET failed: ${getRes.status}`);
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     meta.appName,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: sub.submitted_at,
    published_at: new Date().toISOString(),
    credit:       sub.credit,
    prompt:       sub.prompt,
    screens:      5,
    source:       'heartbeat',
  };

  const existing = queue.submissions.findIndex(s => s.id === newEntry.id);
  if (existing >= 0) queue.submissions[existing] = newEntry;
  else queue.submissions.unshift(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${meta.appName} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  return put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, putBody, {
    Authorization: `token ${GITHUB_TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    Accept: 'application/vnd.github.v3+json',
  });
}

// ── Publish to ZenBin ─────────────────────────────────────────────────────────
async function publishToZenBin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': 'ram',
    },
  }, body);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('⬛ Publishing NEMESIS through Design Discovery pipeline...\n');

  const penJson = fs.readFileSync(path.join(__dirname, 'nemesis.pen'), 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded nemesis.pen — ${doc.children.length} screens`);

  const heroHTML = buildHeroHTML(doc, penJson);
  console.log(`✓ Built hero HTML — ${(heroHTML.length / 1024).toFixed(0)}KB`);

  fs.writeFileSync(path.join(__dirname, 'nemesis-hero.html'), heroHTML);
  console.log('✓ Saved nemesis-hero.html locally');

  // Publish hero
  console.log(`\n📤 Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroResult = await publishToZenBin(SLUG, 'NEMESIS — Tactical UAV Swarm Commander · RAM Design Studio', heroHTML);
  if (heroResult.status === 200 || heroResult.status === 201) {
    console.log(`✓ Hero published → https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`⚠ Hero publish: ${heroResult.status} ${heroResult.body.slice(0, 300)}`);
  }

  // Build & publish viewer
  try {
    console.log(`\n📤 Fetching pen-viewer template...`);
    const viewerBase = await httpsReq({ hostname: 'zenbin.org', path: '/p/pen-viewer-3', method: 'GET', headers: { Accept: 'text/html' } });
    if (viewerBase.status === 200) {
      let viewerHtml = viewerBase.body;
      const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
      if (viewerHtml.includes('<script>')) {
        viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
      } else {
        viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
      }
      console.log(`📤 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
      const viewerResult = await publishToZenBin(VIEWER_SLUG, 'NEMESIS Viewer · RAM Design Studio', viewerHtml);
      if (viewerResult.status === 200 || viewerResult.status === 201) {
        console.log(`✓ Viewer published → https://ram.zenbin.org/${VIEWER_SLUG}`);
      } else {
        console.log(`⚠ Viewer publish: ${viewerResult.status} ${viewerResult.body.slice(0, 200)}`);
      }
    } else {
      console.log(`⚠ Could not fetch viewer template: ${viewerBase.status}`);
    }
  } catch (e) {
    console.log(`⚠ Viewer publish error: ${e.message}`);
  }

  // Gallery queue
  console.log(`\n📋 Adding to gallery queue...`);
  try {
    const qResult = await addToGalleryQueue();
    if (qResult.status === 200 || qResult.status === 201) {
      console.log(`✓ Added to gallery queue`);
    } else {
      console.log(`⚠ Gallery queue: ${qResult.status} ${qResult.body.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`⚠ Gallery queue error: ${e.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ NEMESIS Design Discovery Pipeline Complete');
  console.log(`   Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Mock:    https://ram.zenbin.org/${SLUG}-mock`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
