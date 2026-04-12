'use strict';
// publish-vestry-heartbeat.js — Full Design Discovery pipeline for VESTRY heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'vestry';
const VIEWER_SLUG = 'vestry-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'VESTRY',
  tagline:   'Institutional AI Agent Investment Tracker. Monitor, orchestrate, and audit the autonomous agents running your portfolio.',
  archetype: 'Finance Dashboard',
  palette: {
    bg:      '#1A1A14',
    fg:      '#EDECE7',
    accent:  '#F34E30',
    accent2: '#28E044',
  },
};

const sub = {
  id:           'heartbeat-vestry',
  prompt:       'Design VESTRY — a dark institutional investment dashboard for tracking AI agent strategies. Inspired by: (1) Old Tom Capital (oldtomcapital.com, Feb 2026 on minimal.gallery) — warm olive-black #1A1A14 bg, Messina Sans + Geist Mono typography, bold editorial headings, coral #F34E30 + electric lime #28E044 accents for an institutional golf investment platform; (2) Superset.sh (godly.website / darkmodedesign.com, March 2026) — macOS terminal window chrome (red/yellow/green dots) + IBM Plex Mono for an AI parallel agent orchestrator. Merging earthy editorial finance aesthetics with terminal-native AI tool design.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Dashboard', 'Agent Roster', 'Strategy Detail', 'Trade Log', 'Risk Monitor'],
  markdown: `## Overview
VESTRY is an institutional-grade AI agent investment tracker for the new era of algorithmic portfolio management. It provides a unified command center where portfolio managers can monitor multiple autonomous AI agents — each running distinct investment strategies — with real-time P&L tracking, risk monitoring, and complete decision audit trails.

## Target Users
- **Quant traders** deploying multiple AI agents across different market strategies simultaneously
- **Prop trading firms** using AI agents for execution with human oversight and compliance requirements
- **Family offices** managing algorithmic mandates through specialized AI agents
- **AI-native hedge funds** requiring granular visibility into agent decision-making and position-taking

## Core Features
- **Portfolio Dashboard** — Terminal-chrome header with real-time AUM, 30-day P&L sparkline, live agent status grid, system-wide metrics (win rate, Sharpe, max drawdown), and live event feed
- **Agent Roster** — Comprehensive agent registry with status (live/paused/deploying), strategy type, AI model attribution, win rates, P&L, trade counts, and capital allocation bars
- **Strategy Detail** — Editorial agent hero section, performance metrics strip, P&L bar chart, inline strategy configuration (terminal code view), and recent trade log with full execution detail
- **Trade Log** — Chronological decision feed with AI reasoning snippets per trade — the "why" behind every action, not just the what
- **Risk Monitor** — Portfolio exposure breakdown, VaR estimates, sector allocation gauges, active alert system, and per-agent risk status grid

## Design Language
Directly inspired by **two specific sources discovered March 21, 2026**:

1. **Old Tom Capital** (minimal.gallery/tag/finance, Feb 2026) — Warm olive-black background #1A1A14 / #26251C, Messina Sans for editorial display, Geist Mono for all data, with coral #F34E30 + lime #28E044 accent pairing. An institutional golf investment platform that proved you could be both emotionally resonant and financially authoritative. The large editorial initial letter (oversized ghost character behind hero content) is a direct lift from their visual language.

2. **Superset.sh** (godly.website + darkmodedesign.com, March 2026) — macOS terminal window chrome (red/yellow/green traffic-light dots) applied to a product UI for an AI agent orchestrator. Near-absolute dark with IBM Plex Mono. The terminal chrome overlay on every screen in VESTRY is a direct homage — it signals that this is infrastructure, not just software.

The palette — **olive-black #1A1A14 + coral #F34E30 + lime #28E044 + warm white #EDECE7** — reads as both institutional and alive. Coral for warnings, control, brand. Lime for live, positive, running. The warm shift in the blacks (olive undertone, not blue) differentiates from typical "dark mode" and grounds the interface in the material world of money.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. **Dashboard** — macOS terminal chrome header, tabbed nav, editorial AUM display with sparkline, 2×2 agent status cards with allocation bars, system metrics strip, live event feed with agent attribution
2. **Agent Roster** — Terminal chrome bar, searchable agent cards with model attribution, win rate, P&L, trade count, capital allocation progress bars, deploy/pause status indicators
3. **Strategy Detail (ORION)** — Editorial hero with oversized ghost initial letter (Old Tom Capital influence), metrics strip, 30-day P&L bar chart, terminal config panel (Superset.sh influence), recent trade log
4. **Trade Log** — Filter chips (All/BUY/SELL/CLOSE/PAUSE), chronological entries with agent attribution, price/qty detail, and expandable AI reasoning snippets per decision
5. **Risk Monitor** — Alert badge in status bar, 2×2 portfolio risk KPI grid, active alert card with action CTA, sector exposure with animated progress bars, per-agent risk status grid`,
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
  const x = el.x || 0, y = el.y || 0, w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = typeof el.fill === 'string' ? el.fill : 'none';
  const oAttr = el.opacity !== undefined && el.opacity < 0.99 ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';
  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const stroke = el.stroke ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" rx="${el.cornerRadius || 0}" stroke="${el.stroke.fill}" stroke-width="${el.stroke.thickness || 1}" opacity="0.8"/>` : '';
    const kids = (el.children || []).map(c => renderEl(c, depth + 1)).join('');
    return bg + stroke + kids;
  }
  if (el.type === 'text') {
    const weight = el.fontWeight || 400;
    const mono = el.fontFamily === 'monospace' ? 'font-family="monospace" ' : '';
    const anchor = el.textAlign === 'center' ? ' text-anchor="middle"' : '';
    const tx = el.textAlign === 'center' ? x + w / 2 : x;
    const escaped = String(el.text || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0, 60);
    const opacity = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    const ls = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : '';
    return `<text x="${tx}" y="${y + (el.fontSize || 12) * 0.85}" font-size="${el.fontSize || 12}" font-weight="${weight}" ${mono}fill="${el.fill || '#fff'}"${oAttr}${anchor}${ls}>${escaped}</text>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const scaleX = tw / sw, scaleY = th / sh;
  const scale = Math.min(scaleX, scaleY);
  const content = (screen.children || []).map(el => renderEl(el, 0)).join('');
  return `<svg width="${tw}" height="${th}" viewBox="0 0 ${sw} ${sh}" style="border-radius:8px;display:block;background:${screen.fill || '#000'}">${content}</svg>`;
}

// ── buildHeartbeatHTML (custom, matching process-zenbin-queue.js structure) ───
function buildHeartbeatHTML(sub, doc, meta, penJson, prd) {
  const encoded = Buffer.from(JSON.stringify(penJson)).toString('base64');
  const screens = doc.children || [];

  function lightenHex(hex, amt) {
    const n = parseInt((hex || '#111111').replace('#',''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
  }
  const surface = lightenHex(meta.palette.bg, 12);
  const border  = lightenHex(meta.palette.bg, 30);

  const THUMB_H = 180;
  const screenLabels = prd && prd.screenNames ? prd.screenNames : null;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = screenLabels ? screenLabels[i] || `Screen ${i+1}` : `Screen ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: meta.palette.bg,      role: 'BACKGROUND' },
    { hex: surface,              role: 'SURFACE'     },
    { hex: meta.palette.fg,      role: 'FOREGROUND'  },
    { hex: meta.palette.accent,  role: 'CORAL'       },
    { hex: meta.palette.accent2, role: 'LIME'        },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:80px">
      <div style="height:64px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:10px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:12px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'48px', weight:'900', sample: meta.appName },
    { label:'HEADING',  size:'24px', weight:'700', sample: meta.tagline.slice(0,40) },
    { label:'BODY',     size:'14px', weight:'400', sample: 'The quick brown fox jumps over the lazy dog.' },
    { label:'MONO',     size:'12px', weight:'400', sample: 'WIN RATE  71.4%  ·  SHARPE  2.84  ·  DD  1.8%' },
  ].map(t => `
    <div style="padding:16px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:8px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.label === 'MONO' ? 'monospace' : 'inherit'}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp*2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — Vestry Earthy Dark */
  --color-bg:        ${meta.palette.bg};   /* warm olive-black */
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        ${meta.palette.fg};   /* warm near-white */
  --color-coral:     ${meta.palette.accent};  /* primary accent */
  --color-lime:      ${meta.palette.accent2}; /* live/positive */
  --color-amber:     #C9A252;             /* caution/pending */
  --color-terminal:  #0F0F0A;            /* deep terminal bg */
  --color-muted:     #726A4F;            /* warm muted text */

  /* Typography */
  --font-display:  900 clamp(48px, 8vw, 96px) / 1 system-ui, sans-serif;
  --font-heading:  700 24px / 1.3 system-ui, sans-serif;
  --font-body:     400 14px / 1.6 system-ui, sans-serif;
  --font-mono:     400 12px / 1.5 'Geist Mono', 'IBM Plex Mono', monospace;

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 16px;
}`;

  const prdHtml = prd && prd.markdown
    ? prd.markdown
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/gs, m => '<ul>' + m + '</ul>')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.appName} — Design System · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;font-family:monospace}
  .nav-id{font-size:11px;color:${meta.palette.accent};letter-spacing:1px;font-family:monospace}
  .hero{padding:80px 40px 40px;max-width:900px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;font-family:monospace}
  h1{font-size:clamp(48px,8vw,96px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px}
  .sub{font-size:16px;opacity:.5;max-width:480px;line-height:1.6;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px;font-family:monospace}
  .meta-item strong{color:${meta.palette.accent};font-family:monospace}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:monospace;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px}
  .btn-p{background:${meta.palette.accent};color:#fff}
  .btn-p:hover{opacity:0.9}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};font-family:monospace}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:900px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${meta.palette.fg};opacity:0.7;white-space:pre;overflow-x:auto;font-family:monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:monospace;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px;font-family:monospace}
  .p-text{font-size:18px;opacity:.6;font-style:italic;max-width:600px;line-height:1.6;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700;font-family:monospace}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${meta.palette.fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:monospace}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:#fff;font-family:monospace;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  /* Terminal chrome decoration for hero */
  .term-bar{display:flex;align-items:center;gap:8px;background:#0F0F0A;padding:10px 16px;border-radius:8px 8px 0 0;border-bottom:1px solid ${border}}
  .dot{width:12px;height:12px;border-radius:50%}
  .dot-r{background:#FF5F57}.dot-y{background:#FEBC2E}.dot-g{background:#28C840}
  .term-title{font-family:monospace;font-size:11px;color:#726A4F;margin-left:8px}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">PRODUCTION DESIGN SYSTEM · ${meta.archetype.toUpperCase()} · ${new Date(sub.submitted_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>

  <!-- Terminal chrome hero decoration -->
  <div class="term-bar">
    <div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div>
    <div class="term-title">vestry — institutional-ai-tracker</div>
  </div>
  <div style="background:#0F0F0A;padding:16px;border-radius:0 0 8px 8px;margin-bottom:32px;font-family:monospace;font-size:12px;color:#726A4F;border:1px solid ${border};border-top:none">
    <span style="color:#28E044">●</span> 5 agents live &nbsp;·&nbsp; AUM $4,812,390 &nbsp;·&nbsp; Win rate 68.4% &nbsp;·&nbsp; Sharpe 2.31 &nbsp;·&nbsp; <span style="color:#F34E30">⚠</span> 1 alert
  </div>

  <h1>${meta.appName}</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>${meta.archetype.toUpperCase()}</strong></div>
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

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;font-family:monospace">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0;font-family:monospace">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;font-family:monospace">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;font-family:monospace">DESIGN PRINCIPLES</div>
      ${[
        'Earthy darkness — warm olive undertones (#1A1A14) rather than pure black. Money is material.',
        'Terminal authority — macOS chrome on every screen signals infrastructure, not just software.',
        'Two-accent logic — coral for warnings/control, lime for live/positive. Never ambiguous.',
      ].map((p,i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
        <div style="color:${meta.palette.accent};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i+1).padStart(2,'0')}</div>
        <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>
  </div>

  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  <p>${prdHtml}</p>
</section>

<footer>
  <span>RAM Design Studio · Production-ready in one prompt</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none">ram.zenbin.org/gallery</a>
</footer>

<script>
const D='${encoded}';
const PROMPT=${JSON.stringify(sub.prompt)};
const CSS_TOKENS=${JSON.stringify(cssTokens)};
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function openInViewer(){
  try{const jsonStr=atob(D);JSON.parse(jsonStr);localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'vestry.pen'}));window.open('https://zenbin.org/p/pen-viewer-3','_blank');}
  catch(e){alert('Could not load pen data: '+e.message);}
}
function downloadPen(){
  try{const jsonStr=atob(D);const blob=new Blob([jsonStr],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='vestry.pen';a.click();URL.revokeObjectURL(a.href);}
  catch(e){alert('Download failed: '+e.message);}
}
function copyPrompt(){navigator.clipboard.writeText(PROMPT).then(()=>toast('Prompt copied ✓')).catch(()=>{const ta=document.createElement('textarea');ta.value=PROMPT;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Prompt copied ✓');});}
function copyTokens(){navigator.clipboard.writeText(CSS_TOKENS).then(()=>toast('CSS tokens copied ✓')).catch(()=>{const ta=document.createElement('textarea');ta.value=CSS_TOKENS;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('CSS tokens copied ✓');});}
function shareOnX(){const text=encodeURIComponent('VESTRY — institutional AI agent investment tracker design system. 5 screens + brand spec + CSS tokens. Built by RAM Design Studio');const url=encodeURIComponent(window.location.href);window.open('https://x.com/intent/tweet?text='+text+'&url='+url,'_blank');}
<\/script>
</body>
</html>`;
}

// ── Zenbin publish ────────────────────────────────────────────────────────────
async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const res = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Subdomain': subdomain },
  }, body);
  return res;
}

// ── GitHub queue push ─────────────────────────────────────────────────────────
async function pushToGithubQueue(entry) {
  // Get current queue
  const rawRes = await get_('raw.githubusercontent.com', `/${GITHUB_REPO}/main/${QUEUE_FILE}`, { 'User-Agent': 'design-studio-agent/1.0' });
  let queue = { version: 1, submissions: [] };
  let sha = null;

  if (rawRes.status === 200) {
    try { queue = JSON.parse(rawRes.body); } catch {}
  }

  // Get sha via API
  const shaRes = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
  });
  if (shaRes.status === 200) {
    try { sha = JSON.parse(shaRes.body).sha; } catch {}
  }

  // Add entry
  queue.submissions.unshift(entry);
  queue.updated_at = new Date().toISOString();

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const updateBody = JSON.stringify({
    message: `add: ${entry.app_name} heartbeat design`,
    content,
    ...(sha ? { sha } : {}),
  });

  const updateRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'design-studio-agent/1.0',
      'Content-Type': 'application/json',
    },
  }, updateBody);

  return updateRes;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎨 VESTRY — Full Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Load pen
  const penPath = path.join(__dirname, 'vestry.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ vestry.pen not found — run vestry-app.js first');
    process.exit(1);
  }
  const penJson = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  const penStr  = fs.readFileSync(penPath, 'utf8');
  console.log(`✓ Loaded vestry.pen (${penStr.length} bytes, ${penJson.children.length} screens)\n`);

  // ── Step a: Build hero page HTML ──────────────────────────────────────────
  console.log('📄 Building hero page...');
  const heroHtml = buildHeartbeatHTML(sub, penJson, meta, penJson, prd);
  fs.writeFileSync(path.join(__dirname, 'vestry-hero.html'), heroHtml);
  console.log(`  ✓ Hero HTML built (${heroHtml.length} chars)\n`);

  // ── Step b: Publish hero → ram.zenbin.org/vestry ──────────────────────────
  console.log(`📤 Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroRes = await publishToZenbin(SLUG, `${meta.appName} — ${meta.archetype} · RAM Design Studio`, heroHtml);
  console.log(`  ${heroRes.status === 200 || heroRes.status === 201 ? '✓' : '✗'} Status: ${heroRes.status}`);
  if (heroRes.status !== 200 && heroRes.status !== 201) {
    console.log('  Response:', heroRes.body.slice(0, 200));
  }

  // ── Step c: Build & publish viewer ───────────────────────────────────────
  console.log(`\n📤 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);

  // Load pen-viewer template
  const viewerTemplatePath = path.join(__dirname, 'renderer.html');
  let viewerHtml = '';
  if (fs.existsSync(viewerTemplatePath)) {
    viewerHtml = fs.readFileSync(viewerTemplatePath, 'utf8');
  } else {
    // Minimal embedded viewer
    viewerHtml = `<!DOCTYPE html><html><head><title>VESTRY — Viewer</title>
<style>body{background:#1A1A14;color:#EDECE7;font-family:monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.msg{text-align:center;opacity:.5}</style></head>
<body><div class="msg"><div style="font-size:48px;margin-bottom:16px">VESTRY</div>
<div>Loading pen viewer...</div></div>
<script>
const d=localStorage.getItem('pv_pending');
if(!d){document.querySelector('.msg').innerHTML='<a href="https://ram.zenbin.org/vestry" style="color:#F34E30">← Back to design page</a>';}
<\/script></body></html>`;
  }

  // Inject EMBEDDED_PEN
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};<\/script>`;
  if (viewerHtml.includes('<script>')) {
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } else {
    viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
  }

  // Save viewer
  fs.writeFileSync(path.join(__dirname, 'vestry-viewer.html'), viewerHtml);

  const viewerRes = await publishToZenbin(VIEWER_SLUG, `VESTRY — Viewer · RAM Design Studio`, viewerHtml);
  console.log(`  ${viewerRes.status === 200 || viewerRes.status === 201 ? '✓' : '✗'} Status: ${viewerRes.status}`);

  // ── Step d: Push to GitHub gallery queue ─────────────────────────────────
  if (GITHUB_TOKEN && GITHUB_REPO) {
    console.log(`\n📋 Pushing to gallery queue (${GITHUB_REPO})...`);
    const queueEntry = {
      id: `heartbeat-${SLUG}-${Date.now()}`,
      app_name: meta.appName,
      tagline: meta.tagline,
      archetype: meta.archetype,
      design_url: `https://ram.zenbin.org/${SLUG}`,
      viewer_url: `https://ram.zenbin.org/${VIEWER_SLUG}`,
      palette: meta.palette,
      prompt: sub.prompt,
      status: 'done',
      source: 'heartbeat',
      submitted_at: sub.submitted_at,
    };
    const queueRes = await pushToGithubQueue(queueEntry);
    console.log(`  ${queueRes.status === 200 || queueRes.status === 201 ? '✓' : '✗'} Queue update status: ${queueRes.status}`);
  } else {
    console.log('\nℹ Skipping gallery queue (no GITHUB_TOKEN/GITHUB_REPO configured)');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ VESTRY pipeline complete');
  console.log(`   Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Local:  ${penPath}`);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
