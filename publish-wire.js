'use strict';
// publish-wire.js — Full Design Discovery pipeline for WIRE heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'wire';
const VIEWER_SLUG = 'wire-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'WIRE',
  tagline:   'Connect agents. Route everything.',
  archetype: 'Developer Tools / MCP Infrastructure',
  palette: {
    bg:      '#08090A',
    surface: '#111316',
    text:    '#E8EAED',
    accent:  '#6366F1',
    accent2: '#22D3EE',
  },
};

const sub = {
  id:           'heartbeat-wire',
  prompt:       'Design WIRE — a dark-mode MCP Server Router & AI Agent Orchestration platform. Inspired by land-book.com (March 22, 2026) where MCP/agent infrastructure is an emerging hot category (Runlayer "Enterprise MCPs, Skills & Agents", LangChain, Cerve "Turn trading data into superintelligence"), Linear.app\'s near-black #08090A calmer UI refresh with numbered feature reveals and AI-first framing (darkmodedesign.com), and Atlas Card\'s cinematic pure-black editorial luxury (godly.website). Palette: #08090A near-black bg, #111316 surface, #6366F1 indigo accent, #22D3EE cyan for data flows. 5 screens: Dashboard (system status, live traffic sparkline, active agents), Servers (12 MCP server list with health indicators), Routes (agent pipeline rules), Analytics (request volume chart, latency distribution, error breakdown), API Keys (token management, quota usage).',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Dashboard', 'Servers', 'Routes', 'Analytics', 'API Keys'],
  markdown: `## Overview
WIRE is a dark-mode MCP Server Router and AI Agent Orchestration platform for developers and teams running multi-agent workflows. It provides a unified control plane for managing MCP server connections, routing agent requests, monitoring performance, and managing API access — all in one dense, calm, near-black interface.

## Target Users
- **AI Platform Engineers** managing fleets of MCP servers for multi-agent pipelines
- **Developer teams** using Claude, GPT, Gemini, and open-source agents with tool-use workflows
- **DevOps leads** who need SLA visibility, latency monitoring, and error diagnostics for AI infrastructure
- **Platform architects** building enterprise agent orchestration on top of MCP protocol

## Core Features
- **Connection Dashboard** — Real-time system status: active servers, total monthly requests, P95 latency, error rate. Live sparkline traffic view with per-agent breakdown.
- **MCP Server Registry** — 12 connected servers with health indicators (green/yellow/red), uptime %, request throughput, and p95 latency. Filter by health status.
- **Route Builder** — Define and manage agent pipelines as named routing rules. Visual tag-chain showing tool flow (github-mcp → claude-opus → linear-mcp). Start/pause/edit routes.
- **Analytics Center** — 30-day request volume bar chart, latency distribution (P50/P95/P99), top error codes with counts and percentages.
- **API Key Management** — Create and manage scoped keys (full / read / metrics). Per-key usage quota bars, creation dates, expiry, and one-click copy.

## Design Language
Inspired by three sources discovered on **March 22, 2026**:

1. **Land-book.com** (March 22, 2026) — MCP/agent infrastructure has exploded as a design category. Runlayer ("Enterprise MCPs, Skills & Agents"), LangChain, and Cerve ("Turn trading data into superintelligence") all appeared on land-book's curated feed. This validated the design space: dense developer tooling with information hierarchy as the primary aesthetic.
2. **Linear.app** (via darkmodedesign.com) — The definitive reference: near-black #08090A background, numbered feature tabs (1.1, 1.3, 2.1), "calmer, more consistent interface" as their March 2026 design principle. AI-first framing with changelog as trust signal. Directly inspired the nearly-black bg, subtle surface layering, and the dense but breathable information architecture.
3. **Atlas Card** (via godly.website) — Pure black #000000 with cinematic section-by-section reveals. Premium concierge meets developer tool sensibility. Inspired the pill-style status badges and the overall restraint — only indigo and cyan break the monochrome.

The palette — **near-black #08090A with indigo #6366F1 and cyan #22D3EE** — follows the "tool-first" principle: color is reserved for functional meaning (indigo = primary action, cyan = data flow, green = healthy, amber = warning, red = error). Nothing decorative.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. Dashboard — Status tiles, live traffic sparkline, active agents list
2. Servers — Health-filtered MCP server list with version/uptime/throughput
3. Routes — Named pipeline rules with tag-chain visualization
4. Analytics — Volume chart, latency P50/P95/P99, error breakdown
5. API Keys — Quota bar, key list with scope tags and usage stats`,
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
const get_ = (host, p, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0', ...hdrs } });
const put_ = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'PUT', headers: { 'Content-Type': 'application/json', ...hdrs } }, body);

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderEl(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x || 0, y = el.y || 0,
        w = Math.max(0, el.w || el.width || 0),
        h = Math.max(0, el.h || el.height || 0);
  const fill = typeof el.fill === 'string' ? el.fill : 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.rx ? ` rx="${Math.min(el.rx, w / 2, h / 2)}"` : '';

  if (el.type === 'rect') {
    const kids = (el.children || []).map(c => renderEl(c, depth + 1)).join('');
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'circle') {
    const cx = el.cx || x + w / 2, cy = el.cy || y + h / 2, r = el.r || w / 2;
    const sf = typeof fill === 'string' && fill !== 'none' ? fill : '#6366F1';
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'ellipse') {
    const sf = typeof fill === 'string' && fill !== 'none' ? fill : '#6366F1';
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 12) * 0.65));
    const tf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : '#E8EAED';
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.75}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}

const screenThumbSVG = (s, tw, th) => {
  const kids = (s.elements || s.children || []).map(c => renderEl(c, 0)).join('');
  const bg = s.bg || '#08090A';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="${tw}" height="${th}" style="display:block;border-radius:10px;flex-shrink:0;border:1px solid rgba(255,255,255,0.08)"><rect width="390" height="844" fill="${bg}"/>${kids}</svg>`;
};

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.screens || doc.children || [];
  const bg      = '#08090A';
  const surface = '#111316';
  const border  = 'rgba(255,255,255,0.07)';
  const accent  = '#6366F1';
  const accent2 = '#22D3EE';
  const text    = '#E8EAED';
  const muted   = 'rgba(232,234,237,0.45)';
  const THUMB_H = 180;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (390 / 844));
    const label = (prd.screenNames[i] || `S${i + 1}`);
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${text}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#08090A', role: 'BG' },
    { hex: '#111316', role: 'SURFACE' },
    { hex: '#181B20', role: 'SURFACE 2' },
    { hex: '#E8EAED', role: 'TEXT' },
    { hex: '#6366F1', role: 'INDIGO' },
    { hex: '#22D3EE', role: 'CYAN' },
    { hex: '#22C55E', role: 'SUCCESS' },
    { hex: '#EF4444', role: 'DANGER' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:48px;border-radius:8px;background:${sw.hex};border:1px solid rgba(255,255,255,0.1);margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.4;margin-bottom:4px;color:${text}">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '48px', weight: '700', sample: 'WIRE', color: text },
    { label: 'HEADING',  size: '24px', weight: '700', sample: 'Connect agents. Route everything.', color: text },
    { label: 'BODY',     size: '14px', weight: '400', sample: '12 connected · 11 healthy · 1 warning — P95 latency 38ms', color: 'rgba(232,234,237,0.6)' },
    { label: 'MONO',     size: '11px', weight: '600', sample: 'wir_sk_prod_••••••7f2a · claude-opus-4 → anthropic-mcp', color: accent2 },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px;color:${text}">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${t.color};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.label==='MONO'?'SF Mono,Fira Code,monospace':'inherit'}">${t.sample}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* WIRE — near-black developer tool palette */

  /* Backgrounds */
  --color-bg:       #08090A;
  --color-surface:  #111316;
  --color-surface2: #181B20;
  --color-overlay:  rgba(255,255,255,0.04);

  /* Borders */
  --color-border:   rgba(255,255,255,0.07);
  --color-border-2: rgba(255,255,255,0.12);

  /* Text */
  --color-text:     #E8EAED;
  --color-text-2:   rgba(232,234,237,0.7);
  --color-muted:    rgba(232,234,237,0.4);

  /* Brand accents */
  --color-indigo:       #6366F1;
  --color-indigo-dim:   rgba(99,102,241,0.15);
  --color-cyan:         #22D3EE;
  --color-cyan-dim:     rgba(34,211,238,0.12);

  /* Semantic */
  --color-success:  #22C55E;
  --color-warning:  #F59E0B;
  --color-danger:   #EF4444;
  --color-info:     #38BDF8;

  /* Typography */
  --font-family: 'Inter', 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono:   'SF Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* Spacing (8px base grid) */
  --sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;
  --sp-4: 16px;  --sp-5: 24px;  --sp-6: 32px;  --sp-7: 48px;

  /* Radius */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.4);
  --shadow-md:   0 4px 16px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 16px rgba(99,102,241,0.2);
}`;

  const encoded   = Buffer.from(penJson).toString('base64');
  const shareText = encodeURIComponent(
    `WIRE — MCP server router & AI agent orchestration. Dark-mode developer tool inspired by Linear's calmer #08090A UI and the emerging MCP infra design category. By RAM Design AI:`
  );

  const mdToHtml = (md) => {
    if (!md) return '';
    return md
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^### (.+)$/gm, '<h4 style="font-size:10px;letter-spacing:1.5px;opacity:.4;margin:20px 0 8px;font-weight:700;color:'+text+'">$1</h4>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:'+text+'">$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.12);padding:1px 5px;border-radius:3px;font-family:SF Mono,Fira Code,monospace;font-size:11px;color:'+accent2+'">$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
      .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
      .replace(/\n\n/g, '</p><p>');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WIRE — MCP Router & Agent Orchestration · RAM Design Studio</title>
<meta name="description" content="WIRE — dark-mode MCP server router and AI agent orchestration platform. Complete design system with 5 screens, brand spec & CSS tokens. By RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};color:${text};font-family:'Inter','Geist',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;background:${bg}}
  .logo{font-size:13px;font-weight:700;letter-spacing:5px;color:${text}}
  .nav-id{font-size:11px;color:${muted};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${accent};margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(52px,8vw,96px);font-weight:700;letter-spacing:-2px;line-height:1;margin-bottom:20px;color:${text}}
  .sub{font-size:17px;color:${muted};max-width:540px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;color:${muted};letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${accent}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:${accent};color:#fff}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${text};border:1px solid ${border}}
  .btn-s:hover{border-color:rgba(99,102,241,0.5)}
  .btn-c{background:${accent2};color:#000}
  .btn-x{background:#1a1a1a;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.4);border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:rgba(232,234,237,0.6);white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:${accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:rgba(99,102,241,0.25)}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${accent};margin-bottom:12px;font-weight:700}
  .p-text{font-size:17px;color:${muted};font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;color:${muted};line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${text}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;color:${muted};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${accent};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:4px solid ${accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:680px;font-size:12px;line-height:1.7;color:${muted}}
  .inspiration-bar strong{color:${accent2}}
  .status-grid{display:flex;gap:24px;margin-top:20px;flex-wrap:wrap}
  .status-item{display:flex;align-items:center;gap:8px;font-size:12px;color:${muted}}
  .status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-wire · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">▸  DESIGN HEARTBEAT · DEVELOPER TOOLS / MCP INFRASTRUCTURE · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>WIRE</h1>
  <p class="sub">${meta.tagline}</p>

  <div class="status-grid">
    <div class="status-item"><div class="status-dot" style="background:#22C55E"></div>12 Servers Online</div>
    <div class="status-item"><div class="status-dot" style="background:#6366F1"></div>2.4M Requests / Month</div>
    <div class="status-item"><div class="status-dot" style="background:#22D3EE"></div>38ms P95 Latency</div>
    <div class="status-item"><div class="status-dot" style="background:#22C55E"></div>0.02% Error Rate</div>
  </div>

  <div class="meta" style="margin-top:32px">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>DEVELOPER TOOLS / MCP INFRA</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>NEAR-BLACK DARK · #08090A</strong></div>
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

<div class="inspiration-bar">
  <strong>Research sources (March 22, 2026):</strong> land-book.com — MCP/agent infra is exploding as a design category (Runlayer, LangChain, Cerve all featured) · <strong>Linear.app</strong> (darkmodedesign.com) — near-black #08090A, "calmer, more consistent interface" UI refresh, AI-first framing with 1.1/2.1 numbered tabs · <strong>Atlas Card</strong> (godly.website) — pure black cinematic editorial luxury with restraint
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;color:${muted};margin-bottom:16px">COLOR PALETTE · 8 CORE TONES</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;color:${muted};margin-bottom:0">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;color:${muted};margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${[
        'Color is reserved for function — indigo = primary action, cyan = data flow, green = healthy, amber = warning, red = error. Zero decorative color. A calmer interface earns trust.',
        'Dense but breathable — inspired by Linear\'s "calmer, more consistent interface" refresh. Every pixel of space serves hierarchy. Surface layering (#08090A → #111316 → #181B20) creates depth without borders.',
        'Status is the UI — the primary aesthetic is system state. Health dots, uptime %, latency bars, and error rates are not secondary content. They ARE the design.',
      ].map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
        <div style="color:${accent};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i + 1).padStart(2, '0')}</div>
        <div style="font-size:13px;color:${muted};line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;color:${muted};margin-bottom:16px">SPACING SYSTEM · 8PX BASE GRID</div>
      ${[4, 8, 12, 16, 24, 32, 48].map(sp => `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
          <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;color:${text}">${sp}px</div>
          <div style="height:6px;border-radius:3px;background:${accent};width:${sp * 2.5}px;opacity:0.65"></div>
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
  setTimeout(() => t.classList.remove('show'), 2200);
}
function openInViewer() { window.open('https://ram.zenbin.org/${VIEWER_SLUG}', '_blank'); }
function downloadPen() {
  try {
    const blob = new Blob([atob(D)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'wire.pen'; a.click();
    URL.revokeObjectURL(a.href);
  } catch(e) { alert('Download failed: ' + e.message); }
}
function copyPrompt() { navigator.clipboard.writeText(PROMPT).then(() => toast('Prompt copied ✓')).catch(() => toast('Copy failed')); }
function copyTokens() { navigator.clipboard.writeText(CSS_TOKENS).then(() => toast('Tokens copied ✓')).catch(() => toast('Copy failed')); }
function shareOnX() { window.open('https://twitter.com/intent/tweet?text=${shareText}%20https://ram.zenbin.org/${SLUG}', '_blank'); }
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
function buildViewerHTML(viewerTemplate, penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  return viewerTemplate.replace('<script>', injection + '\n<script>');
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
  let queue = JSON.parse(raw.body);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];
  const sha = await getQueueSha();

  const entry = {
    id:           sub.id,
    status:       'done',
    app_name:     meta.appName,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   heroUrl,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: sub.submitted_at,
    published_at: new Date().toISOString(),
    credit:       sub.credit,
    prompt:       sub.prompt,
    screens:      5,
    source:       'heartbeat',
  };

  const existing = queue.submissions.findIndex(s => s.id === entry.id);
  if (existing >= 0) queue.submissions[existing] = entry;
  else queue.submissions.unshift(entry);
  queue.updated_at = new Date().toISOString();

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `heartbeat: add WIRE to gallery`,
    content, sha,
  });
  return put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, body, {
    Authorization: `token ${GITHUB_TOKEN}`,
    'User-Agent':  'design-studio-agent/1.0',
    Accept:        'application/vnd.github.v3+json',
  });
}

// ── Publish to ZenBin ─────────────────────────────────────────────────────────
async function publishToZenBin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path:     `/v1/pages/${slug}`,
    method:   'POST',
    headers:  { 'Content-Type': 'application/json', 'X-Subdomain': subdomain },
  }, body);
}

// ── Viewer template fetch ─────────────────────────────────────────────────────
async function fetchViewerTemplate() {
  const r = await get_('zenbin.org', '/p/pen-viewer-3');
  if (r.status !== 200) throw new Error(`Viewer template fetch failed: ${r.status}`);
  return r.body;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  WIRE — Design Discovery Pipeline');
  console.log('  RAM Design Heartbeat · March 22, 2026');
  console.log('═══════════════════════════════════════════════\n');

  const penPath = path.join(__dirname, 'wire.pen');
  if (!fs.existsSync(penPath)) throw new Error('wire.pen not found. Run wire-app.js first.');
  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc = JSON.parse(penJson);
  console.log(`✓ Loaded wire.pen (${(doc.screens||[]).length} screens)`);

  const heroHTML = buildHeroHTML(doc, penJson);
  console.log(`✓ Hero HTML built (${(heroHTML.length / 1024).toFixed(1)} KB)`);

  console.log('  Fetching viewer template…');
  const viewerTemplate = await fetchViewerTemplate();
  const viewerHTML = buildViewerHTML(viewerTemplate, penJson);
  console.log(`✓ Viewer HTML built (${(viewerHTML.length / 1024).toFixed(1)} KB)`);

  console.log(`\n  Publishing hero → ram.zenbin.org/${SLUG} …`);
  const heroRes = await publishToZenBin(SLUG, 'WIRE — MCP Router & Agent Orchestration · RAM', heroHTML);
  console.log(`  Status: ${heroRes.status}`);
  if (heroRes.status !== 200 && heroRes.status !== 201) {
    console.error('  Hero publish error:', heroRes.body.slice(0, 300));
  } else {
    console.log(`✓ Hero live → https://ram.zenbin.org/${SLUG}`);
  }

  console.log(`\n  Publishing viewer → ram.zenbin.org/${VIEWER_SLUG} …`);
  const viewerRes = await publishToZenBin(VIEWER_SLUG, 'WIRE Viewer · RAM', viewerHTML);
  console.log(`  Status: ${viewerRes.status}`);
  if (viewerRes.status !== 200 && viewerRes.status !== 201) {
    console.error('  Viewer publish error:', viewerRes.body.slice(0, 300));
  } else {
    console.log(`✓ Viewer live → https://ram.zenbin.org/${VIEWER_SLUG}`);
  }

  console.log(`\n  Adding to gallery queue…`);
  try {
    const qRes = await addToGalleryQueue(`https://ram.zenbin.org/${SLUG}`);
    if (qRes.status === 200 || qRes.status === 201) {
      console.log(`✓ Gallery queue updated`);
    } else {
      console.warn('  Queue update warning:', qRes.status, qRes.body.slice(0, 200));
    }
  } catch (e) {
    console.warn('  Queue update failed (non-fatal):', e.message);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  DONE');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log('═══════════════════════════════════════════════');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
