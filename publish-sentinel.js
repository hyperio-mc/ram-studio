#!/usr/bin/env node
// publish-sentinel.js — Run SENTINEL through the full Design Discovery pipeline.
// Generates the hero page (brand spec, CSS tokens, PRD, embedded pen, share buttons)
// and publishes to ram.zenbin.org/sentinel

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── SENTINEL metadata ──────────────────────────────────────────────────────────
const sub = {
  id:           'hb-sentinel-' + Date.now(),
  prompt:       'Design a dark-mode enterprise AI agent security & observability console — SENTINEL. Monitor live MCP connections, threat scores, permission matrices, and real-time audit trails. Forest-black background, amber security alerts, safe-green for healthy connections. Inspired by Runlayer (land-book.com — enterprise MCPs/agents) and Superset (darkmodedesign.com — dark AI tools). 4 mobile + 2 desktop screens.',
  app_type:     'security',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const meta = {
  appName:   'SENTINEL',
  tagline:   'Command & Control for AI Agents.',
  archetype: 'security',
  screens:   6,
  palette: {
    bg:      '#080e08',   // deep forest-black
    fg:      '#e4f5e4',   // soft sage-white
    accent:  '#f5a623',   // amber — security orange
    accent2: '#22cc66',   // safe green
  },
};

const prdMarkdown = `
## Overview

SENTINEL is an enterprise AI agent security and observability console. It solves the burning problem of unmanaged AI tool adoption: 10% of MCP servers are malicious, the rest are exploitable, and most enterprise teams have zero visibility into what their AI tools are actually doing.

The core insight comes from Runlayer (featured on land-book.com March 2026): "MCP isn't a distant vision — it's today's standard for AI tools. But unmanaged adoption has created a security crisis." SENTINEL is the command and control plane that brings order to that chaos.

## Target Users

- **Security engineers** managing enterprise AI tool deployment and threat response
- **Platform administrators** controlling which MCPs, Skills, and Agents are approved for use
- **Compliance officers** requiring audit trails and permission documentation
- **DevOps teams** integrating AI tools into production workflows

## Core Features

- **Threat Dashboard** — real-time threat score (0–100), active connection count, alert queue, and timeline showing hourly threat intensity for the past 24 hours
- **Connections Registry** — live list of all MCPs, Skills, and Agents with status (APPROVED / MONITORING / BLOCKED), type, and age
- **Audit Log** — event feed with severity-coded entries (CRITICAL / HIGH / WARN / INFO), searchable and filterable by time window
- **Threat Detail** — deep-dive view with risk analysis rings, attack vector breakdown bars, payload preview, and one-tap BLOCK PERMANENTLY action
- **Command Center** — desktop overview with KPI strip, 24h threat timeline bar chart, top active threats panel, and connection health breakdown
- **Permissions Matrix** — fine-grained permission control table: every connection × every scope (READ, WRITE, DELETE, EXECUTE, NETWORK, BROWSE, WORKFLOW, PAYMENTS)

## Design Language

**Forest-black** (#080e08) — Not pure black but a deep organic darkness with a green undertone. Inspired by Forge (darkmodedesign.com): their #090d06 background gave a military precision feel without being sterile.

**Amber alerts** (#f5a623) — Security urgency doesn't demand red. Amber communicates "pay attention" without triggering panic. Used for all warnings and navigation accents.

**Safe green** (#22cc66) — Healthy connections, approved states, and low threat scores use this as a positive signal. Contrasts memorably against the forest-black background.

**Semantic severity system** — CRITICAL (red #e63946), HIGH (amber #f5a623), WARN (yellow #f4d03f), INFO (blue #4fc3f7), SAFE (green #22cc66). Every data element uses this system consistently.

**Left-stripe threat indicators** — Cards with active threats show a 3–4px colored stripe on the left edge, borrowing from terminal/IDE error conventions. Instant visual triage without reading labels.

## Screen Architecture

1. **Mobile Dashboard** — Threat score hero card with gauge bars, 3 KPI tiles (connections/blocked/alerts), recent alerts feed with severity stripes and badges, bottom tab nav
2. **Mobile Connections** — Filter tabs (ALL/MCP/SKILL/AGENT), search bar, connection rows with type icon, status badge, and age indicator
3. **Mobile Audit Log** — Time filter chips, 4-stat summary strip, scrollable event log with left-edge severity stripes and action/target details
4. **Mobile Threat Detail** — Critical threat card, 4 risk analysis rings (THREAT/CONFIDENCE/TRUST/HISTORY), attack vector bars, blocked payload code preview, BLOCK PERMANENTLY action
5. **Desktop Command Center** — Sidebar nav with status pill, 4-column KPI strip, 24h threat timeline bar chart with severity coloring, top 3 active threats panel, connection health stacked bars
6. **Desktop Permissions Matrix** — Full connection × scope permission table with checkboxes, type and status badges, export CSV, filter toolbar
`;

// ── SVG thumbnail helpers ──────────────────────────────────────────────────────
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
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:4px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill || '#080e08'}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  return md.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
    if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- ')).map(l => `<li>${l.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`);
      return `<ul>${items.join('')}</ul>`;
    }
    return `<p>${block.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`;
  }).join('\n');
}

// ── Build hero HTML ────────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const encoded = Buffer.from(JSON.stringify(pen)).toString('base64');
  const screens = pen.children || [];

  function lightenHex(hex, amt) {
    const n = parseInt((hex || '#080e08').replace('#', ''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  const bg      = meta.palette.bg;
  const fg      = meta.palette.fg;
  const accent  = meta.palette.accent;
  const accent2 = meta.palette.accent2;
  const surface = lightenHex(bg, 12);
  const border  = lightenHex(bg, 28);
  const danger  = '#e63946';
  const warn    = '#f4d03f';
  const blue    = '#4fc3f7';

  // Screen thumbnails
  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(s.name || `SCREEN ${i+1}`).toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: bg,      role: 'BACKGROUND' },
    { hex: surface, role: 'SURFACE'    },
    { hex: fg,      role: 'FOREGROUND' },
    { hex: accent,  role: 'AMBER ALERT'},
    { hex: accent2, role: 'SAFE GREEN' },
    { hex: danger,  role: 'THREAT RED' },
    { hex: warn,    role: 'WARN YELLOW'},
    { hex: blue,    role: 'INFO BLUE'  },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:48px;border-radius:4px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${accent}">${sw.hex}</div>
    </div>`).join('');

  // Type scale
  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '48px', weight: '900', sample: 'SENTINEL' },
    { label: 'HEADING',  size: '22px', weight: '700', sample: 'Command & Control for AI Agents.' },
    { label: 'BODY',     size: '13px', weight: '400', sample: 'THREAT SCORE: 14 · 47 ACTIVE MCPs · 8 PENDING ALERTS' },
    { label: 'CAPTION',  size: '9px',  weight: '400', sample: 'TOOL POISONING · CRITICAL · 09:41:22 · cursor-mcp-server' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${fg};font-family:'SF Mono','Fira Code',monospace;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  // Spacing
  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  // Design principles
  const principles = [
    'Forest-black, not void-black — #080e08 has a green undertone that reads "organic precision" not "infinite void".',
    'Amber over red for primary alerts — security urgency without panic. Red reserved only for CRITICAL threats.',
    'Left-edge stripes for severity — 3px colored stripe on the card left edge; instant visual triage without reading labels.',
    'Semantic severity system throughout — one color language for CRITICAL/HIGH/WARN/INFO/SAFE across all 6 screens.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — SENTINEL Security Palette */
  --color-bg:        #080e08;   /* forest-black */
  --color-surface:   #0e160e;   /* elevated panel */
  --color-surface2:  #141e14;   /* card bg */
  --color-border:    #1e2e1e;   /* panel border */
  --color-fg:        #e4f5e4;   /* sage-white */
  --color-muted:     #5a6e5a;   /* secondary text */

  /* Semantic severity colors */
  --color-critical:  #e63946;   /* blocked / critical threat */
  --color-high:      #f5a623;   /* high severity / amber alert */
  --color-warn:      #f4d03f;   /* warning / rate limit */
  --color-info:      #4fc3f7;   /* informational events */
  --color-safe:      #22cc66;   /* approved / healthy / connected */

  /* Dim variants (bg fills for badges) */
  --color-critical-dim: #2a0a0e;
  --color-high-dim:     #3d2808;
  --color-warn-dim:     #2a2208;
  --color-info-dim:     #082038;
  --color-safe-dim:     #082a18;

  /* Typography */
  --font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  --font-display:  900 clamp(48px, 8vw, 96px) / 1 var(--font-family);
  --font-heading:  700 22px / 1.3 var(--font-family);
  --font-body:     400 13px / 1.6 var(--font-family);
  --font-caption:  600 9px / 1 var(--font-family);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Components */
  --radius-card:   8px;
  --radius-badge:  4px;
  --radius-btn:    6px;
  --severity-stripe: 3px;        /* left-edge severity indicator */
  --border-panel:  1px solid var(--color-border);
}`;

  const shareText = encodeURIComponent(
    `SENTINEL — Enterprise AI Agent Security Console. Dark-mode MCP/agent observability with threat detection, permissions matrix, audit log. 6 screens + brand spec. Built by RAM Design Studio`
  );

  const prdHtml = mdToHtml(prdMarkdown);
  const dateStr = new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SENTINEL — AI Agent Security Console · RAM Design Studio</title>
<meta name="description" content="Command & Control for AI Agents. Enterprise MCP security dashboard with threat detection, permissions matrix, and audit log. 6 screens + brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};color:${fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${fg}}
  .nav-id{font-size:10px;color:${accent};letter-spacing:1px;opacity:.8}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${accent};margin-bottom:20px;opacity:.9}
  h1{font-size:clamp(64px,10vw,120px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:16px;color:${fg}}
  .sub{font-size:18px;opacity:.45;max-width:520px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:28px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:2px;margin-bottom:4px}
  .meta-item strong{color:${accent};font-size:11px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;font-size:10px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:1px;border-radius:6px}
  .btn-p{background:${accent};color:#fff}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${accent}}
  .btn-x{background:#000;color:#fff;border:1px solid #222}
  .preview{padding:0 40px 80px}
  .section-label{font-size:8px;letter-spacing:3px;color:${accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};opacity:.9}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${accent}44}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};padding:20px;margin-top:24px;position:relative;border-radius:6px}
  .tokens-pre{font-size:11px;line-height:1.7;color:${fg};opacity:0.65;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${accent}22;border:1px solid ${accent}44;color:${accent};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 12px;cursor:pointer;font-weight:700;border-radius:4px}
  .copy-btn:hover{background:${accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${accent};margin-bottom:12px;opacity:.9}
  .p-text{font-size:17px;opacity:.5;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:800px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${accent};margin:28px 0 10px;font-weight:700;opacity:.9}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.58;line-height:1.8;max-width:680px}
  .prd-section ul{padding-left:20px;margin:8px 0}
  .prd-section li{margin-bottom:6px}
  .prd-section strong{opacity:1;color:${fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${accent};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999;border-radius:6px}
  .toast.show{transform:translateY(0);opacity:1}
  .threat-badge{display:inline-flex;align-items:center;gap:6px;background:${danger}22;border:1px solid ${danger}44;color:${danger};font-size:9px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:4px;margin-left:12px;vertical-align:middle}
  .safe-badge{display:inline-flex;align-items:center;gap:6px;background:${accent2}22;border:1px solid ${accent2}44;color:${accent2};font-size:9px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:4px;margin-left:12px;vertical-align:middle}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div style="display:flex;align-items:center;gap:16px">
    <span style="width:6px;height:6px;border-radius:50%;background:${accent2};display:inline-block"></span>
    <div class="nav-id">HEARTBEAT #12 · STUDIO ORIGINAL</div>
  </div>
</nav>

<section class="hero">
  <div class="tag">DESIGN SYSTEM · SECURITY · ENTERPRISE AI · ${dateStr}</div>
  <h1>SENTINEL</h1>
  <p class="sub">Command & Control for AI Agents.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>6 (4 MOBILE + 2 DESKTOP)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>ENTERPRISE SECURITY</strong></div>
    <div class="meta-item"><span>AESTHETIC</span><strong>DARK TERMINAL · FOREST-BLACK</strong></div>
    <div class="meta-item"><span>INSPIRATION</span><strong>RUNLAYER · SUPERSET · FORGE</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ OPEN IN VIEWER</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ DOWNLOAD .PEN</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ COPY PROMPT</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 SHARE</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← GALLERY</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/sentinel-viewer">☰ VIEWER ONLY</a>
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
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE · MONOSPACE THROUGHOUT</div>
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
  <span>RAM Design Studio · Heartbeat #12 · Inspired by Runlayer (runlayer.com) + Superset (superset.sh) + Forge (darkmodedesign.com)</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = '${encoded}';
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function openInViewer() {
  try {
    const jsonStr = atob(D);
    JSON.parse(jsonStr);
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'sentinel.pen' }));
    window.open('https://ram.zenbin.org/pen-viewer', '_blank');
  } catch(e) { alert('Could not load: ' + e.message); }
}
function downloadPen() {
  try {
    const blob = new Blob([atob(D)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'sentinel.pen'; a.click();
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
  const text = encodeURIComponent('SENTINEL — Enterprise AI Agent Security Console. Dark-mode MCP/agent observability with threat detection, permissions matrix, audit logs. 6 screens + brand spec. Built by RAM Design Studio');
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
    const r = https.request({
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
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

// ── GitHub queue push ─────────────────────────────────────────────────────────
function githubRequest(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function pushToGalleryQueue(heroUrl) {
  const configPath = path.join(__dirname, 'community-config.json');
  let config = {};
  try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch {}
  const token = process.env.GITHUB_TOKEN || config.GITHUB_TOKEN || '';
  const repo  = config.GITHUB_REPO || 'hyperio-mc/design-studio-queue';
  if (!token) { console.log('  ⚠ No GITHUB_TOKEN — skipping queue push'); return; }

  // Get current queue
  const rawR = await githubRequest({
    hostname: 'raw.githubusercontent.com',
    path: `/${repo}/main/queue.json`,
    method: 'GET',
    headers: { 'User-Agent': 'design-studio-agent/1.0' },
  });
  let queue = { submissions: [] };
  try { queue = JSON.parse(rawR.body); } catch {}

  // Get SHA
  const shaR = await githubRequest({
    hostname: 'api.github.com',
    path: `/repos/${repo}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${token}`, 'User-Agent': 'design-studio-agent/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const sha = JSON.parse(shaR.body).sha;

  // Add entry
  const entry = {
    id: sub.id,
    prompt: sub.prompt,
    app_type: sub.app_type,
    credit: sub.credit,
    status: 'done',
    design_url: heroUrl,
    submitted_at: sub.submitted_at,
    published_at: new Date().toISOString(),
  };
  queue.submissions = queue.submissions || [];
  queue.submissions.push(entry);

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body2 = JSON.stringify({
    message: `heartbeat: SENTINEL design — ${new Date().toISOString()}`,
    content,
    sha,
  });
  const r2 = await githubRequest({
    hostname: 'api.github.com',
    path: `/repos/${repo}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'design-studio-agent/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body2),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body2);
  if (r2.status === 200 || r2.status === 201) {
    console.log('  ✅ Gallery queue updated');
  } else {
    console.log(`  ⚠ Queue push: HTTP ${r2.status}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🛡  SENTINEL — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Load pen
  const penPath = path.join(__dirname, 'sentinel.pen');
  if (!fs.existsSync(penPath)) {
    console.error('sentinel.pen not found — run: node sentinel-app.js');
    process.exit(1);
  }
  const pen = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  const penJson = fs.readFileSync(penPath, 'utf8');
  console.log(`✓ Loaded sentinel.pen: ${pen.children.length} screens`);

  // Build hero HTML
  console.log('  Building hero page...');
  const html = buildHeroHTML(pen);
  console.log(`  HTML size: ${(html.length / 1024).toFixed(1)} KB`);

  // Build viewer-only page
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = '';
  if (fs.existsSync(viewerPath)) {
    viewerHtml = fs.readFileSync(viewerPath, 'utf8');
    const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } else {
    viewerHtml = `<!DOCTYPE html><html><body style="background:#080e08;color:#e4f5e4;font-family:monospace;padding:40px"><h1>SENTINEL Viewer</h1><p>penviewer-app.html not found locally.</p></body></html>`;
  }

  // Publish hero → ram.zenbin.org/sentinel
  console.log('\n  Publishing hero page → ram.zenbin.org/sentinel ...');
  const r1 = await publish('sentinel', 'SENTINEL — AI Agent Security Console · RAM Design Studio', html);
  const heroStatus = r1.status === 201 ? '✓ Created' : r1.status === 200 ? '✓ Updated' : `✗ Error ${r1.status}`;
  console.log(`  ${heroStatus}`);

  // Publish viewer → ram.zenbin.org/sentinel-viewer
  console.log('  Publishing viewer    → ram.zenbin.org/sentinel-viewer ...');
  const r2 = await publish('sentinel-viewer', 'SENTINEL — Viewer · RAM Design Studio', viewerHtml);
  const viewStatus = r2.status === 201 ? '✓ Created' : r2.status === 200 ? '✓ Updated' : `✗ Error ${r2.status}`;
  console.log(`  ${viewStatus}`);

  const heroUrl = 'https://ram.zenbin.org/sentinel';

  // Push to gallery queue
  console.log('\n  Pushing to gallery queue...');
  await pushToGalleryQueue(heroUrl);

  console.log('\n🔗 Live URLs:');
  console.log('   Hero:   https://ram.zenbin.org/sentinel');
  console.log('   Viewer: https://ram.zenbin.org/sentinel-viewer');
}

main().catch(console.error);
