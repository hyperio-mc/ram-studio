'use strict';
// publish-prism.js — Full Design Discovery pipeline for PRISM heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'prism-mcp';
const VIEWER_SLUG = 'prism-mcp-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'PRISM',
  tagline:   'The MCP Marketplace & Agent Orchestration Platform. 327 tools. One API. Any LLM.',
  archetype: 'AI Developer Platform',
  palette: {
    bg:      '#0A0B0F',
    fg:      '#E8EAF0',
    accent:  '#00FF87',
    accent2: '#FFD166',
  },
};

const sub = {
  id:           'heartbeat-prism',
  prompt:       'Design PRISM — a dark-mode MCP (Model Context Protocol) marketplace & agent orchestration platform using a bento-grid card system. Inspired by the "Bento grid icons Landing page" trending on Dribbble popular (March 2026), "Enterprise MCPs, Skills & Agents | Runlayer" featured on land-book.com, and the avant-garde enterprise aesthetic from Evervault on godly.website. Palette: deep charcoal #0A0B0F with electric green #00FF87 (terminal authority), warm gold #FFD166, coral #FF6B6B, violet #8B6CFF, sky blue #38BFFF. 10 screens: Mobile Dashboard (bento), Marketplace, MCP Detail, Agent Runs, Settings + Desktop Landing, Bento Dashboard, Marketplace Grid, Run Detail, Developer Console.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Dashboard', 'Marketplace', 'MCP Detail', 'Agent Runs', 'Settings'],
  markdown: `## Overview
PRISM is an AI agent infrastructure platform — a marketplace of MCP (Model Context Protocol) tools that any LLM can use, paired with a full agent orchestration layer. Developers install MCP tools in one click, wire them into agents running Claude, GPT-4, or Gemini, and monitor every run in real-time.

## Target Users
- **AI Engineers** building autonomous agents who need reliable, production-ready tool integrations
- **Product teams** wanting to add LLM-powered automation without building infrastructure
- **Enterprise developers** running high-volume agent pipelines who need observability, cost controls, and SOC2 compliance
- **Indie developers** who want a one-stop-shop: install tool → wire to agent → ship

## Core Features
- **MCP Marketplace** — 327 curated, production-ready tool integrations (web search, databases, code execution, APIs, comms). One-click install. Semantic versioning. Usage stats.
- **Agent Run Monitor** — Real-time execution logs, progress bars, per-tool call tracking, streaming output, cost per run
- **Bento Dashboard** — Metric tiles (active agents, API calls/hr, MCPs installed, cost today) with live activity feed in a varied-size card grid
- **Developer Console** — REST API playground with request/response panel, JSON syntax highlighting, stream preview
- **Analytics** — Per-MCP usage breakdown, cost attribution, rate limit monitoring, AI-generated optimization insights

## Design Language
Directly inspired by trends discovered on **March 19, 2026**:

1. **Bento grid icons Landing page** (Dribbble popular shots, March 2026) — The bento-grid trend is exploding: varied tile sizes create visual rhythm without explicit hierarchy, 3D icon treatments add depth, and the card-as-content-unit pattern makes dense data feel browseable rather than overwhelming.
2. **"Enterprise MCPs, Skills & Agents | Runlayer"** (land-book.com, featured March 2026) — Current landing page for an MCP/agent SaaS. Clean Webflow build, dark mode, technical-yet-approachable copy, developer-first CTA ("View Docs"). Informed the landing page structure and nav pattern.
3. **Evervault Customers** (godly.website via locomotive.ca) — Precision enterprise dark UI with surgical whitespace, minimal decoration, and confidence in negative space. Informed the sidebar and header treatment.
4. **AI Project Management Assistant – SaaS Landing Page** (Dribbble popular web-design) — Split hero with live dashboard preview right, editorial type left, animated status badges. Directly informed the terminal preview panel on the desktop landing page.

The palette — **electric green #00FF87 on deep charcoal #0A0B0F** — evokes a terminal/code aesthetic without being retro. Green = active/live/success across all contexts. Gold = cost/value metrics. Coral = errors/warnings. Violet = secondary features. Sky = data/info.

## Screen Architecture
**Mobile (390×844):**
1. Dashboard — Bento grid of live metrics + active agent progress + MCP tools grid + recent activity feed
2. Marketplace — Category chips, search, MCP card list with rating, installs, one-click install button
3. MCP Detail — Full tool profile: icon, stats, capabilities list, code example, install CTA
4. Agent Runs — Live run banner + filter tabs + chronological run log with status badges
5. Settings / Config — API key management, connected LLM models, usage gauges, plan tier

**Desktop (1440×900):**
6. Landing Page — Editorial hero (72px type, green left-rule accent) + terminal preview panel
7. Bento Dashboard — Full sidebar + 4-metric top row + activity chart + MCP usage list + agent runs table + AI insight tile
8. Marketplace Grid — Categorized card grid with featured large tile + medium and small MCP cards
9. Agent Run Detail — Split view: execution log (terminal) + stats panels (tool calls, cost, MCP breakdown)
10. Developer Console — API playground with request editor + response panel + stream preview`,
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
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : meta.palette.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}
const screenThumbSVG = (s, tw, th) => {
  const kids = (s.children || []).map(c => renderEl(c, 0)).join('');
  const bg = typeof s.fill === 'string' ? s.fill : meta.palette.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${s.width}" height="${s.height}" fill="${bg}"/>${kids}</svg>`;
};

// ── Color helpers ─────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const clean = (hex || '#111').replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map(x => x+x).join('') : clean, 16);
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
    .replace(/`([^`]+)`/g, '<code style="background:#1a2010;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#00FF87">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = lightenHex(meta.palette.bg, 10);
  const border  = lightenHex(meta.palette.bg, 22);
  const THUMB_H = 180;
  const screenLabels = prd.screenNames;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = screenLabels ? `${isMobile ? 'M' : 'D'} · ${screenLabels[i % 5]}` : `${isMobile ? 'MOBILE' : 'DESKTOP'} ${(i % 5) + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#0A0B0F', role: 'BACKGROUND' },
    { hex: '#111318', role: 'SURFACE'    },
    { hex: '#E8EAF0', role: 'FOREGROUND' },
    { hex: '#00FF87', role: 'GREEN (PRIMARY)'  },
    { hex: '#FFD166', role: 'GOLD (VALUE)'     },
    { hex: '#FF6B6B', role: 'CORAL (ALERT)'    },
    { hex: '#8B6CFF', role: 'VIOLET (FEATURE)' },
    { hex: '#38BFFF', role: 'SKY (DATA)'       },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:#00FF87">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '48px', weight: '900', sample: 'PRISM' },
    { label: 'HEADING',  size: '22px', weight: '700', sample: 'The MCP Marketplace for AI Agents' },
    { label: 'BODY',     size: '14px', weight: '400', sample: '327 production-ready tools. Install in one click. Any LLM.' },
    { label: 'CAPTION',  size: '10px', weight: '600', sample: 'MARKETPLACE · AGENT RUNS · MCP DETAIL · CONFIG' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:#E8EAF0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:#00FF87;width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — Semantic terminal palette */
  --color-bg:        #0A0B0F;   /* Deep charcoal */
  --color-surface:   #111318;   /* Card surface  */
  --color-surface-2: #191C23;   /* Elevated      */
  --color-border:    #1E2230;   /* Subtle border  */
  --color-fg:        #E8EAF0;   /* Primary text  */
  --color-fg-2:      #9AA0B0;   /* Secondary text */
  --color-primary:   #00FF87;   /* Electric green */
  --color-gold:      #FFD166;   /* Value / cost  */
  --color-coral:     #FF6B6B;   /* Error / alert  */
  --color-violet:    #8B6CFF;   /* Feature / AI  */
  --color-sky:       #38BFFF;   /* Data / info   */

  /* Typography */
  --font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:  900 clamp(48px, 6vw, 80px) / 1 var(--font-family);
  --font-heading:  700 22px / 1.3 var(--font-family);
  --font-body:     400 14px / 1.6 var(--font-family);
  --font-caption:  600 10px / 1 var(--font-family);

  /* Spacing (8px base grid) */
  --space-1: 4px;   --space-2: 8px;    --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;   --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 14px;  --radius-full: 9999px;

  /* Bento card pattern */
  --bento-gap: 12px;
  --bento-col: minmax(160px, 1fr);
}`;

  const encoded = Buffer.from(JSON.stringify(penJson)).toString('base64');
  const shareText = encodeURIComponent(
    `PRISM — AI agent & MCP marketplace design. Bento-grid dashboard + 10 screens. Built by RAM Design Studio`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PRISM — AI Agent & MCP Marketplace · RAM Design Studio</title>
<meta name="description" content="The MCP Marketplace for AI Agents. 327 tools, bento-grid dashboard, complete design system with 10 screens + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#0A0B0F;color:#E8EAF0;font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:900;letter-spacing:4px;color:#00FF87}
  .nav-id{font-size:11px;color:#00FF87;letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:#00FF87;margin-bottom:20px}
  h1{font-size:clamp(52px,7vw,96px);font-weight:900;letter-spacing:-3px;line-height:0.95;margin-bottom:20px}
  h1 .accent{color:#00FF87}
  .sub{font-size:16px;opacity:.5;max-width:520px;line-height:1.7;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:#00FF87}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px}
  .btn-p{background:#00FF87;color:#0A0B0F}
  .btn-p:hover{opacity:0.9}
  .btn-s{background:transparent;color:#E8EAF0;border:1px solid ${border}}
  .btn-s:hover{border-color:#00FF8766}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:#00FF87;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:#00FF8744;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#E8EAF0;opacity:0.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:#00FF8722;border:1px solid #00FF8744;color:#00FF87;font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:#00FF8733}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:#00FF87;margin-bottom:12px}
  .p-text{font-size:18px;opacity:.55;font-style:italic;max-width:680px;line-height:1.6;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:820px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:#00FF87;margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:700px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#E8EAF0}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:#00FF87;color:#0A0B0F;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">PRISM</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">PRODUCTION DESIGN SYSTEM · AI DEVELOPER PLATFORM · ${new Date(sub.submitted_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>The <span class="accent">MCP</span><br>Marketplace<br>for AI Agents.</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>LAYOUT PATTERN</span><strong>BENTO GRID</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>TREND</span><strong>MCP / AI AGENTS</strong></div>
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
  <div class="section-label">SCREENS · 5 MOBILE + 5 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · SEMANTIC TERMINAL</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE · SF MONO / FIRA CODE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SYSTEM · 8PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${[
        'Bento grid as content system — varied tile sizes create visual rhythm without explicit hierarchy.',
        'Semantic color = semantic meaning — green is always live/success, gold is cost/value, coral is error/alert.',
        'Terminal authority — monospace type and code-line patterns earn developer trust before a word is read.',
      ].map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
        <div style="color:#00FF87;font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i+1).padStart(2,'0')}</div>
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
  <span>RAM Design Studio · heartbeat · March 19, 2026</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = '${encoded}';
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
    const j = atob(D);
    JSON.parse(j);
    localStorage.setItem('pv_pending', JSON.stringify({ json: j, name: 'prism.pen' }));
    window.open('https://zenbin.org/p/pen-viewer-3', '_blank');
  } catch(e) { alert('Error: ' + e.message); }
}
function downloadPen() {
  try {
    const j = atob(D);
    const b = new Blob([j], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'prism.pen';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch(e) { alert('Error: ' + e.message); }
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT).then(() => toast('Prompt copied ✓'));
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS).then(() => toast('CSS tokens copied ✓'));
}
function shareOnX() {
  const text = encodeURIComponent('PRISM — MCP marketplace & AI agent platform. Bento-grid dashboard + 10 screens by RAM Design Studio');
  const url = encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
}
<\/script>
</body>
</html>`;
}

// ── Build viewer HTML ─────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const viewerRes = await get_('zenbin.org', '/p/pen-viewer-3');
  let viewerHtml = viewerRes.body;
  if (!viewerHtml || !viewerHtml.includes('<script>') || viewerHtml.length < 500) {
    viewerHtml = `<!DOCTYPE html><html><head><title>PRISM Viewer</title></head><body><p>Viewer unavailable</p></body></html>`;
    return viewerHtml;
  }
  const penJsonStr = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── GitHub queue helpers ──────────────────────────────────────────────────────
async function getQueueSha() {
  const r = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  });
  if (r.status !== 200) throw new Error(`Queue SHA fetch failed: ${r.status}`);
  return JSON.parse(r.body).sha;
}
async function getQueue() {
  const r = await get_('raw.githubusercontent.com', `/${GITHUB_REPO}/main/${QUEUE_FILE}`, {});
  return JSON.parse(r.body);
}
async function updateQueue(queue, sha) {
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `heartbeat: add prism-mcp to gallery`,
    content,
    sha,
  });
  return put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, body, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    'Accept': 'application/vnd.github.v3+json',
  });
}

// ── Publish to ZenBin (tries slug, then slug + timestamp suffix) ──────────────
async function publishZenBin(slugBase, title, html, subdomain) {
  const payload = JSON.stringify({ title, html });
  const hdrs = { 'Content-Type': 'application/json', ...(subdomain ? { 'X-Subdomain': subdomain } : {}) };
  for (const slug of [slugBase, `${slugBase}-${Date.now().toString(36).slice(-4)}`]) {
    const r = await httpsReq({ hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST', headers: hdrs }, payload);
    if (r.status === 200 || r.status === 201) {
      console.log(`  ✅ Published: https://${subdomain ? subdomain + '.' : ''}zenbin.org/p/${slug}`);
      return slug;
    }
    if (r.status === 409) { console.log(`  ⚠ Slug "${slug}" taken, trying next...`); continue; }
    console.error(`  ❌ ZenBin error ${r.status}: ${r.body.slice(0, 200)}`);
    return null;
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('=== PRISM Design Discovery Pipeline ===\n');

  const penPath = path.join(__dirname, 'prism.pen');
  if (!fs.existsSync(penPath)) {
    console.error('prism.pen not found — run node prism-app.js first');
    process.exit(1);
  }
  const penJson = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded prism.pen — ${penJson.children.length} screens`);

  // a) Build hero HTML
  const heroHtml = buildHeroHTML(penJson, penJson);
  console.log(`✓ Hero HTML built — ${(heroHtml.length / 1024).toFixed(1)} KB`);

  // b) Publish hero to ram.zenbin.org
  console.log('\n📤 Publishing hero page → ram.zenbin.org/${SLUG}...');
  const heroSlug = await publishZenBin(SLUG, 'PRISM — AI Agent & MCP Marketplace · RAM Design Studio', heroHtml, 'ram');

  // c) Build & publish viewer
  console.log('\n📤 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...');
  const viewerHtml = await buildViewerHTML(penJson);
  const viewerSlug = await publishZenBin(VIEWER_SLUG, 'PRISM — Pen Viewer', viewerHtml, 'ram');

  if (heroSlug) {
    const heroUrl = `https://ram.zenbin.org/p/${heroSlug}`;
    const viewerUrl = viewerSlug ? `https://ram.zenbin.org/p/${viewerSlug}` : null;
    console.log('\n🎨 Published URLs:');
    console.log(`   Hero:   ${heroUrl}`);
    if (viewerUrl) console.log(`   Viewer: ${viewerUrl}`);

    // d) Add to gallery queue
    console.log('\n📋 Adding to gallery queue...');
    try {
      const [queue, sha] = await Promise.all([getQueue(), getQueueSha()]);
      if (!queue.submissions) queue.submissions = [];
      queue.submissions.push({
        id:          sub.id,
        status:      'done',
        design_url:  heroUrl,
        viewer_url:  viewerUrl,
        prompt:      sub.prompt,
        credit:      sub.credit,
        submitted_at: sub.submitted_at,
        published_at: new Date().toISOString(),
        archetype:   meta.archetype,
        app_name:    meta.appName,
        tagline:     meta.tagline,
      });
      const r = await updateQueue(queue, sha);
      if (r.status === 200 || r.status === 201) {
        console.log('  ✅ Gallery queue updated');
      } else {
        console.log(`  ⚠ Queue update: ${r.status} — ${r.body.slice(0, 200)}`);
      }
    } catch (e) {
      console.log(`  ⚠ Queue update failed: ${e.message}`);
    }
  }

  console.log('\n✅ Pipeline complete!\n');
})();
