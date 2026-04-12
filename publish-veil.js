'use strict';
// publish-veil.js — Full Design Discovery pipeline for VEIL heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'veil';
const VIEWER_SLUG = 'veil-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'VEIL',
  tagline:   'Zero-trust compliance for AI agents. Monitor permissions, detect anomalies, and enforce data access policies — in real time.',
  archetype: 'AI Agent Compliance Platform',
  palette: {
    bg:      '#010314',
    fg:      '#DFE1F4',
    accent:  '#6633EE',
    accent2: '#9B6DFF',
    surface: '#0D0F24',
    s2:      '#12142D',
    border:  '#1E2048',
    success: '#22D3A0',
    warn:    '#F59E0B',
    danger:  '#F43F5E',
    muted:   '#8B8DB8',
  },
};

const sub = {
  id:           'heartbeat-veil',
  prompt:       "Design VEIL — a zero-trust AI agent compliance and monitoring platform. Inspired by Evervault's customer page aesthetic (via godly.website) — ultra-dark cosmic navy #010314, electric violet #6633EE, lavender-white #DFE1F4, and Roobert's clean typographic authority. Also references Linear (darkmodedesign.com) for structured product-management UI conventions. Challenge: bring security-meets-elegance to an AI-era compliance dashboard. 5 mobile screens: Command Center · Agent Detail · Data Vault · Alert Feed · Policy Builder.",
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Command', 'Agent Detail', 'Vault', 'Alerts', 'Policy'],
  markdown: `## Overview
VEIL is a zero-trust compliance platform for teams deploying AI agents. As autonomous agents proliferate across production systems, they accumulate data access permissions that drift beyond their original scope — reading PII they shouldn't, calling APIs at anomalous rates, operating outside sanctioned hours. VEIL gives security and platform teams a single pane of glass to monitor, audit, and enforce agent behavior in real time.

## Target Users
- **Platform engineers** at companies with 5+ AI agents in production
- **Security / compliance teams** operating under SOC 2, GDPR, HIPAA, or ISO 27001
- **AI product leads** who want governance guardrails before agents touch sensitive data
- **CTOs / VPs Engineering** seeking auditability for board-level AI risk reporting

## Core Features
- **Command Center** — Portfolio view of all active agents with compliance score, risk ratings, API call volumes, and a real-time activity sparkline per agent. Quick-action buttons: Run Scan, View Policy, Alerts.
- **Agent Detail** — Deep-dive on a single agent. Risk score ring, behavioral summary, permission matrix showing each scope with granted/revoked status and risk tier. Call-rate histogram. Block/investigate actions.
- **Data Vault** — Sensitive asset register mapping every data store (PII, financial, internal docs, ML data) to the agents accessing it. Risk classification, size metadata, and per-asset access heatmaps.
- **Alert Feed** — Real-time anomaly detection stream. Severity-filtered (Critical / Warning / Info / Resolved). Each alert shows the triggering agent, incident description, and timestamp. Tap to investigate.
- **Policy Builder** — Visual access rule editor. Create, toggle, and audit policies per scope/environment. Compliance framework badges (SOC 2, GDPR, HIPAA, ISO 27001). One-tap save with instant propagation.

## Design Language
Inspired by three specific research sources found on **March 20, 2026**:

1. **Evervault Customers page** (evervault.com/customers via godly.website) — The definitive reference. Deep cosmic navy background (#010314), electric violet accent (#6633EE), soft lavender text (#DFE1F4), and Roobert sans-serif. Evervault treats security as something beautiful — not scary. VEIL adopts this exact palette philosophy: darkness as premium, not as warning.

2. **Linear** (linear.app via darkmodedesign.com) — "The system for product development… designed for the AI era." Inter Variable, disciplined grid, structured sidebar-style navigation, clean product management UI conventions adapted for mobile. VEIL borrows Linear's confidence in density: lots of information, but never cluttered.

3. **Dark Mode Design gallery** (darkmodedesign.com) — Featured sites in March 2026 show a clear trend: deep void/navy backgrounds with a single electric accent color creating focal glow. No gradients, no glass morphism theatrics — just electric precision. VEIL is peak this aesthetic applied to enterprise compliance.

**The key design tension**: compliance tools are typically utilitarian and gray. VEIL rejects this — security software should feel as premium as the data it protects.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. **Command Center** — Compliance score (editorial large number), 4 agent rows with risk scores and sparklines, 3 metric tiles, quick actions
2. **Agent Detail** — Risk ring (67/100 warning), permission matrix with 5 scope rows, call-rate histogram, block/investigate actions
3. **Data Vault** — 5 asset register rows (PII, financial, internal, system, ML), access heatmaps per row, summary stat tiles
4. **Alert Feed** — 5 alerts (Critical/Warning/Warning/Info/Resolved), severity filter chips, incident descriptions with agent attribution
5. **Policy Builder** — 4 policy rules with scope/env/toggle/risk metadata, compliance framework badges, save action`,
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
const post = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'POST', headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const put_ = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'PUT',  headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const get_ = (host, p, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0', ...hdrs } });

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderEl(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = typeof el.fill === 'string' ? el.fill : 'none';
  const oAttr = el.opacity !== undefined && el.opacity < 0.99 ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';
  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderEl(c, depth + 1)).join('');
    if (el.stroke && el.stroke.fill) {
      const sw = el.stroke.thickness || 1;
      const strokeRect = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${el.stroke.fill}" stroke-width="${sw}"${rAttr}${oAttr}/>`;
      return kids ? `${bg}${strokeRect}<g transform="translate(${x},${y})">${kids}</g>` : `${bg}${strokeRect}`;
    }
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'ellipse') {
    const sf = typeof el.fill === 'string' ? el.fill : meta.palette.accent;
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : meta.palette.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.8}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}
const screenThumbSVG = (s, tw, th) => {
  const kids = (s.children || []).map(c => renderEl(c, 0)).join('');
  const bg = typeof s.fill === 'string' ? s.fill : meta.palette.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${s.width}" height="${s.height}" fill="${bg}"/>${kids}</svg>`;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111').replace('#', ''), 16);
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
    .replace(/`([^`]+)`/g, '<code style="background:#0D0F24;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = lightenHex(meta.palette.bg, 14);
  const border  = lightenHex(meta.palette.bg, 30);
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
    { hex: '#010314', role: 'BACKGROUND'      },
    { hex: '#0D0F24', role: 'SURFACE'         },
    { hex: '#12142D', role: 'SURFACE 2'       },
    { hex: '#DFE1F4', role: 'FOREGROUND'      },
    { hex: '#6633EE', role: 'VIOLET'          },
    { hex: '#9B6DFF', role: 'VIOLET LIGHT'    },
    { hex: '#22D3A0', role: 'SUCCESS'         },
    { hex: '#F59E0B', role: 'WARNING'         },
    { hex: '#F43F5E', role: 'DANGER'          },
  ];

  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '72px', weight: '900', sample: 'VEIL' },
    { label: 'HEADING',  size: '22px', weight: '800', sample: 'Zero-Trust AI Agent Compliance' },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'Monitor permissions, detect anomalies, and enforce data access policies in real time.' },
    { label: 'CAPTION',  size: '9px',  weight: '700', sample: 'AGENT · SCOPE · ENVIRONMENT · RISK LEVEL · POLICY ID' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — VEIL Cosmic Navy palette (Evervault-derived) */
  --color-bg:        #010314;   /* Evervault deep navy — exact match */
  --color-surface:   #0D0F24;   /* elevated surface */
  --color-surface2:  #12142D;   /* card surface */
  --color-surface3:  #181A36;   /* lighter card */
  --color-border:    #1E2048;   /* subtle border */
  --color-border2:   #2A2C5A;   /* medium border */
  --color-fg:        #DFE1F4;   /* Evervault lavender-white — exact match */
  --color-muted:     #8B8DB8;   /* muted lavender */
  --color-dim:       #3B3D68;   /* very dim */
  --color-violet:    #6633EE;   /* Evervault electric violet — exact match */
  --color-violet-lt: #9B6DFF;   /* lighter violet glow */
  --color-success:   #22D3A0;   /* emerald green */
  --color-warn:      #F59E0B;   /* amber */
  --color-danger:    #F43F5E;   /* rose red */

  /* Glow utilities */
  --glow-violet: 0 0 40px #6633EE26;
  --glow-violet-strong: 0 0 80px #6633EE40;
  --glow-danger: 0 0 40px #F43F5E20;

  /* Typography — Roobert / Inter Variable */
  --font-family: 'Roobert', 'Inter Variable', 'Inter', system-ui, sans-serif;
  --font-display: 900 clamp(56px,10vw,96px)/1 var(--font-family);
  --font-heading: 800 22px/1.3 var(--font-family);
  --font-ui:      700  13px/1.4 var(--font-family);
  --font-body:    400  13px/1.6 var(--font-family);
  --font-caption: 700   9px/1   var(--font-family);
  --font-mono:    'SF Mono','Fira Code',ui-monospace,monospace;

  /* Spacing (4px base grid) */
  --space-1:  4px;   --space-2:  8px;   --space-3: 12px;
  --space-4: 16px;   --space-5: 24px;   --space-6: 32px;
  --space-7: 48px;   --space-8: 64px;

  /* Radius */
  --radius-sm:   6px;
  --radius-md:  10px;
  --radius-lg:  14px;
  --radius-xl:  20px;
  --radius-full: 9999px;

  /* Animation */
  --transition-fast:  150ms ease;
  --transition-base:  250ms ease;
  --transition-slow:  400ms ease;
}`;

  const encoded = Buffer.from(JSON.stringify(doc)).toString('base64');
  const shareText = encodeURIComponent(
    `VEIL — Zero-Trust AI Agent Compliance Platform. 5 mobile screens + brand spec + CSS tokens. Deep navy × electric violet design by RAM Design AI. Check it out:`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VEIL — AI Agent Compliance Platform · RAM Design Studio</title>
<meta name="description" content="VEIL — zero-trust AI agent monitoring & compliance platform. 5 mobile screens, full brand spec, CSS tokens. Evervault-inspired cosmic navy + electric violet. By RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#010314;color:#DFE1F4;font-family:'Roobert','Inter Variable','Inter',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:900;letter-spacing:5px;color:${meta.palette.accent}}
  .nav-id{font-size:11px;color:${meta.palette.accent2};letter-spacing:1px;opacity:.7}
  .hero{padding:80px 40px 40px;max-width:940px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;opacity:.9}
  h1{font-size:clamp(72px,12vw,112px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:20px;color:#DFE1F4}
  .sub{font-size:16px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent2}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:${meta.palette.accent};color:#DFE1F4}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:#DFE1F4;border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-x{background:#000;color:#fff;border:1px solid #222}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:940px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#DFE1F4;opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:17px;opacity:.6;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#DFE1F4}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:#DFE1F4;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspo-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:700px;font-size:12px;line-height:1.7;opacity:.75}
  .inspo-bar strong{color:${meta.palette.accent2};opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-veil · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · AI COMPLIANCE PLATFORM · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>VEIL</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>AI COMPLIANCE / SECURITY</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>EVERVAULT COSMIC NAVY</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="inspo-bar">
  <strong>Research (March 20, 2026):</strong>
  Evervault customers page (evervault.com/customers via godly.website) — deep navy #010314, electric violet #6633EE ·
  Linear (linear.app via darkmodedesign.com) — AI-era product system UI, Inter Variable ·
  Dark Mode Design gallery trend: single electric accent glow on deep void backgrounds
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · 9 TONES</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${[
        'Security is premium, not scary — deep cosmic navy signals authority and calm. Darkness = trust, not warning.',
        'Electric violet as the single source of focus — one accent color, used sparingly, creates maximum visual hierarchy without noise.',
        'Typography does the heavy lifting — oversized numbers (compliance score, risk rating) communicate state before the user reads a word.',
      ].map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
        <div style="color:${meta.palette.accent};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i + 1).padStart(2, '0')}</div>
        <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
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
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'veil.pen' }));
    window.open('https://zenbin.org/p/pen-viewer-3', '_blank');
  } catch(e) { alert('Could not load pen: ' + e.message); }
}
function downloadPen() {
  try {
    const jsonStr = atob(D);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'veil.pen';
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
  window.open('https://twitter.com/intent/tweet?text=${shareText}%20https://ram.zenbin.org/veil', '_blank');
}
<\/script>
</body>
</html>`;
}

// ── GitHub queue helper ───────────────────────────────────────────────────────
async function getQueueSha() {
  const r = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  });
  if (r.status !== 200) throw new Error(`Queue SHA fetch failed: ${r.status}`);
  return JSON.parse(r.body).sha;
}

async function addToGalleryQueue(heroUrl) {
  const raw = await get_('raw.githubusercontent.com', `/${GITHUB_REPO}/main/${QUEUE_FILE}`, {});
  if (raw.status !== 200) throw new Error(`Queue fetch failed: ${raw.status}`);
  const queue = JSON.parse(raw.body);
  const sha = await getQueueSha();

  const entry = {
    id:           sub.id,
    status:       'done',
    prompt:       sub.prompt,
    submitted_at: sub.submitted_at,
    credit:       sub.credit,
    design_url:   heroUrl,
    archetype:    meta.archetype,
    appName:      meta.appName,
    tagline:      meta.tagline,
  };

  if (!queue.submissions) queue.submissions = [];
  const existing = queue.submissions.findIndex(s => s.id === entry.id);
  if (existing >= 0) queue.submissions[existing] = entry;
  else queue.submissions.unshift(entry);

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `heartbeat: add veil to gallery`,
    content,
    sha,
  });
  return put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, body, {
    Authorization: `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    Accept: 'application/vnd.github.v3+json',
  });
}

// ── Publish to ZenBin ─────────────────────────────────────────────────────────
async function publishToZenBin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const r = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': subdomain,
    },
  }, body);
  return r;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('⬡ Publishing VEIL through Design Discovery pipeline...\n');

  const penJson = fs.readFileSync(path.join(__dirname, 'veil.pen'), 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded veil.pen — ${doc.children.length} screens`);

  const heroHTML = buildHeroHTML(doc, penJson);
  console.log(`✓ Built hero HTML — ${(heroHTML.length / 1024).toFixed(0)}KB`);

  fs.writeFileSync(path.join(__dirname, 'veil-hero.html'), heroHTML);
  console.log('✓ Saved veil-hero.html locally');

  // Publish hero → ram.zenbin.org/veil
  console.log(`\n📤 Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroResult = await publishToZenBin(SLUG, 'VEIL — AI Agent Compliance Platform · RAM Design Studio', heroHTML, 'ram');
  if (heroResult.status === 200 || heroResult.status === 201) {
    console.log(`✓ Hero published → https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`⚠ Hero publish: ${heroResult.status} ${heroResult.body.slice(0, 300)}`);
  }

  // Build & publish viewer
  let viewerResult = { status: 0 };
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
      viewerResult = await publishToZenBin(VIEWER_SLUG, 'VEIL Viewer · RAM Design Studio', viewerHtml, 'ram');
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

  // Add to gallery queue
  console.log(`\n📋 Adding to gallery queue...`);
  try {
    const heroUrl = `https://ram.zenbin.org/${SLUG}`;
    const qResult = await addToGalleryQueue(heroUrl);
    if (qResult.status === 200 || qResult.status === 201) {
      console.log(`✓ Added to gallery queue → hyperio-mc/design-studio-queue`);
    } else {
      console.log(`⚠ Gallery queue: ${qResult.status} ${qResult.body.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`⚠ Gallery queue error: ${e.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ VEIL Design Discovery Pipeline Complete');
  console.log(`   Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
