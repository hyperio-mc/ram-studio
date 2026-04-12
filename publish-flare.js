'use strict';
// publish-flare.js — Full Design Discovery pipeline for FLARE heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'flare';
const VIEWER_SLUG = 'flare-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'FLARE',
  tagline:   'Observe, trace, and debug your AI agent pipelines in real time. A midnight-dark observability platform for teams shipping reliable agents.',
  archetype: 'AI Agent Observability Platform',
  palette: {
    bg:      '#030710',
    fg:      '#CCE9FF',
    accent:  '#7FC8FF',
    accent2: '#4ADE80',
  },
};

const sub = {
  id:           'heartbeat-flare',
  prompt:       'Design FLARE — an AI Agent Trace & Observability Platform. Inspired by LangChain\'s midnight navy palette (#030710, #7FC8FF, #CCE9FF) spotted on land-book.com and godly.website (March 2026), combined with Linear\'s razor-precision UI language (darkmodedesign.com). The product category: real-time trace waterfall charts, LLM call latency breakdowns, token usage analytics, and error drill-downs for AI agent pipelines. Palette: midnight navy #030710 · electric blue #7FC8FF · cream text #CCE9FF · CTA white #E5F4FF. 5 mobile screens: Agent Fleet Overview · Trace Waterfall · LLM Call Detail · Error Analysis · Alert Configuration.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Overview', 'Trace', 'LLM Call', 'Errors', 'Alerts'],
  markdown: `## Overview
FLARE is an AI agent observability platform for engineering teams shipping production-grade LLM pipelines. It surfaces the invisible — trace waterfalls, LLM call latencies, token burn rates, error categorization, and alerting — in a focused mobile-first interface that works in your pocket during on-call shifts or end-of-sprint reviews.

The name "FLARE" references both the visual metaphor of a signal flare (visibility in darkness) and the classic debugging pattern of surfacing hidden state.

## Target Users
- **ML Engineers** running Claude, GPT-4o, or Gemini agents in production who need trace-level visibility into multi-step pipelines
- **Platform / DevOps teams** responsible for AI infrastructure reliability (SLAs, error budgets, cost control)
- **Product engineers** at early-stage AI startups shipping agentic features who need simple but powerful observability
- **On-call responders** who receive alerts at 2am and need to diagnose root cause on a phone screen

## Core Features
- **Agent Fleet Overview** — Real-time status board for all agents: run count, P50/P99 latency, success rate, live/idle/error state. Recent runs feed with quick-tap trace navigation.
- **Trace Waterfall** — Step-by-step horizontal bar chart showing each LLM call, tool invocation, and planner step with exact timing, color-coded by call type (violet = LLM, teal = tool, blue = synthesizer). Token totals and cost summary at top.
- **LLM Call Detail** — Zoom into a single LLM call: model name, TTFT/decode/network latency breakdown, token input/output bars, prompt preview, response preview, and a replay button.
- **Error Analysis** — 24-hour error rate sparkline, error type breakdown with percentage bars, most-affected agent highlight, and a recent failures list with one-tap drill-down.
- **Alert Configuration** — Toggle alert rules, set numeric thresholds via visual sliders (error rate %, P99 latency, daily token budget), and configure notification channels (Slack, PagerDuty, Email, Webhook).

## Design Language
Inspired by three specific sources discovered on **March 21, 2026**:

1. **LangChain** (https://www.langchain.com — featured on land-book.com & godly.website) — Deep midnight navy #030710 background, electric blue #7FC8FF accents, cream body text #CCE9FF, near-white CTA #E5F4FF. Custom "Twklausanne" font at non-standard weights. "Ship agents that work" — the exact problem FLARE solves. The palette is practically a direct lift: LangChain's colors work perfectly for an AI observability product.

2. **Linear** (https://linear.app — darkmodedesign.com) — Near-black #08090A, Inter Variable weight 510 (between regular and medium), 64px hero, precision engineering aesthetic. "The product development system for teams and agents" — Linear's own pivot toward agent-native tooling signals where the market is heading. FLARE borrows this typography philosophy: information density with breathing room, monospace numbers in a proportional UI.

3. **Haptic & Twingate** (godly.website) — Ultra-minimal dark SaaS products with single accent color. Twingate in particular: clean card-based agent/node displays with subtle glow on the active state. Haptic: monospace metrics woven into prose-weight body text. Both validate the design direction: midnight + single electric accent = premium AI tooling aesthetic.

**Trend: "Midnight AI"** — In March 2026, the most respected AI/dev tools (LangChain, Linear, Evervault, Twingate, Warden) are converging on backgrounds in the #010310–#08090A range with a single electric accent (blue, violet, or green). This is the new "dark mode for serious tools" — more intentional than arbitrary dark mode, signal of engineering precision.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. **Agent Fleet Overview** — Brand header "FLARE" + LIVE badge, 4-stat strip (agents/runs/P50 lat/err rate), 4 agent rows with status dots + metrics, recent runs mini-feed
2. **Trace Waterfall** — Run ID header, summary chips (duration/status/tokens/cost), timeline header with millisecond markers, 6 waterfall bars color-coded by type, token breakdown bars, model info card
3. **LLM Call Detail** — 4-metric strip (latency/input tok/output tok/cost), model badge, latency breakdown (TTFT/decode/network) with visual bars, prompt preview with collapse, response preview with collapse, action buttons
4. **Error Analysis** — Error rate sparkline (20 data points), 4 error-type breakdown cards with percentage fills, most-affected agent alert card, 4 recent failures in feed
5. **Alert Configuration** — 4 alert rule toggles with color-coded status, 3 threshold sliders with visual fill + draggable knob, 4 notification channel cards, save CTA button`,
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
    .replace(/`([^`]+)`/g, '<code style="background:#0B1525;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
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
    { hex: '#030710', role: 'MIDNIGHT'   },
    { hex: '#0B1525', role: 'SURFACE'    },
    { hex: '#122038', role: 'SURFACE 2'  },
    { hex: '#CCE9FF', role: 'BODY TEXT'  },
    { hex: '#7FC8FF', role: 'ELECTRIC'   },
    { hex: '#E5F4FF', role: 'HIGH EMPH'  },
    { hex: '#4ADE80', role: 'SUCCESS'    },
    { hex: '#FF6B6B', role: 'ERROR'      },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:64px">
      <div style="height:48px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '64px', weight: '900', sample: 'FLARE' },
    { label: 'HEADING',  size: '20px', weight: '700', sample: 'AI Agent Observability Platform' },
    { label: 'BODY',     size: '13px', weight: '400', sample: 'Trace every LLM call, tool invocation, and agent step in real time.' },
    { label: 'MONO',     size: '11px', weight: '600', sample: '847 RUNS/HR · P50 1.4s · ERR 0.3%' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.label === 'MONO' ? 'monospace' : 'inherit'}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* ── FLARE Color Tokens — Midnight AI palette (LangChain-inspired) ── */
  --color-bg:          #030710;  /* midnight navy */
  --color-surface:     #0B1525;  /* elevated surface */
  --color-surface-2:   #122038;  /* card surface */
  --color-surface-3:   #1A2E4A;  /* lighter card */
  --color-border:      #1E3A5C;  /* subtle border */
  --color-border-2:    #2A4E72;  /* visible border */
  --color-fg:          #CCE9FF;  /* body text */
  --color-fg-2:        #8BBCD9;  /* secondary text */
  --color-muted:       #4A8BBE;  /* muted blue */
  --color-accent:      #7FC8FF;  /* electric blue */
  --color-cta:         #E5F4FF;  /* high emphasis / CTA */
  --color-green:       #4ADE80;  /* success */
  --color-red:         #FF6B6B;  /* error */
  --color-amber:       #F59E0B;  /* warning */
  --color-violet:      #A78BFA;  /* llm call */
  --color-teal:        #2DD4BF;  /* tool call */

  /* ── Typography ── */
  --font-family:       'Inter Variable', 'SF Pro Display', system-ui, sans-serif;
  --font-mono:         'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
  --font-display:      900 clamp(48px, 8vw, 96px) / 1 var(--font-family);
  --font-heading:      700 20px / 1.3 var(--font-family);
  --font-body:         400 13px / 1.6 var(--font-family);
  --font-mono-data:    600 11px / 1 var(--font-mono);
  --font-label:        700 9px / 1 var(--font-family);  /* letter-spacing: 1.5–2px */

  /* ── Spacing (4px base grid) ── */
  --space-1:  4px;   --space-2:  8px;   --space-3:  12px;
  --space-4:  16px;  --space-5:  24px;  --space-6:  32px;
  --space-7:  48px;  --space-8:  64px;

  /* ── Radius ── */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   14px;
  --radius-pill: 9999px;

  /* ── Glows ── */
  --glow-accent:  0 0 40px #7FC8FF1A;
  --glow-green:   0 0 30px #4ADE8014;
  --glow-red:     0 0 30px #FF6B6B14;
  --shadow-card:  0 4px 24px #03071088;
}`;

  const shareText = encodeURIComponent(
    `FLARE — AI Agent Trace & Observability Platform. 5 mobile screens + full brand spec + CSS tokens. Midnight navy + electric blue dark-mode UI designed by RAM Design AI. Check it out:`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FLARE — AI Agent Observability · RAM Design Studio</title>
<meta name="description" content="FLARE — midnight dark-mode AI observability platform. Trace waterfall, LLM call detail, error analysis. 5 mobile screens + full brand spec. Designed by RAM.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#030710;color:#CCE9FF;font-family:'Inter','SF Pro Display',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:900;letter-spacing:5px;color:${meta.palette.accent}}
  .nav-id{font-size:11px;color:${meta.palette.accent};letter-spacing:1px;opacity:.7}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;opacity:.8}
  h1{font-size:clamp(72px,12vw,120px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:20px;color:#E5F4FF}
  .sub{font-size:16px;opacity:.5;max-width:560px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:#E5F4FF;color:#030710}
  .btn-p:hover{opacity:.9}
  .btn-s{background:transparent;color:#CCE9FF;border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}55}
  .btn-g{background:#4ADE80;color:#030710}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#CCE9FF;opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:17px;opacity:.55;font-style:italic;max-width:680px;line-height:1.7;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:800px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:700px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#CCE9FF}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:#030710;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:720px;font-size:12px;line-height:1.7;opacity:.75}
  .inspiration-bar strong{color:${meta.palette.accent};opacity:1}
  .inspiration-bar a{color:${meta.palette.accent};opacity:.8}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-flare · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · AI OBSERVABILITY · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>FLARE</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>AI OBSERVABILITY</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>MIDNIGHT NAVY + ELECTRIC BLUE</strong></div>
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

<div class="inspiration-bar">
  <strong>Research sources (March 21, 2026):</strong>
  LangChain landing page (midnight navy #030710, electric blue #7FC8FF) spotted on
  <a href="https://land-book.com" target="_blank">land-book.com</a> &amp;
  <a href="https://godly.website" target="_blank">godly.website</a> ·
  Linear's razor-precision dark UI on <a href="https://www.darkmodedesign.com" target="_blank">darkmodedesign.com</a> ·
  Haptic &amp; Twingate minimal dark SaaS on <a href="https://godly.website" target="_blank">godly.website</a>
  — all pointing to the "Midnight AI" trend.
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · 8 TONES</div>
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
        'Midnight navy, not void black — #030710 reads as deep space, not flat dark. It has depth and direction (slightly cool-toned blue), which signals precision over minimalism.',
        'Monospace for trust, proportional for narrative — all metric values (latency, token counts, run IDs) use monospace. All explanatory text uses proportional. Never mix within a single context.',
        'Single accent, semantic secondaries — #7FC8FF is the only brand accent. Color is used semantically elsewhere: violet = LLM calls, teal = tool calls, green = success, red = error. Structure, not decoration.',
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
  <span>Built autonomously by RAM Design AI · <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a></span>
  <span>March 21, 2026 · Heartbeat #${Math.floor(Date.now() / 1000 % 10000)}</span>
</footer>

<script>
const PEN_B64 = ${JSON.stringify(Buffer.from(JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname, 'flare.pen'), 'utf8')))).toString('base64'))};
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
function openInViewer() {
  window.open('https://ram.zenbin.org/${VIEWER_SLUG}', '_blank');
}
function downloadPen() {
  try {
    const jsonStr = atob(PEN_B64);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'flare.pen';
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
  const sha   = await getQueueSha();

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
    message: `heartbeat: add flare to gallery`,
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
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': subdomain,
    },
  }, body);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('⚡ Publishing FLARE through Design Discovery pipeline...\n');

  const penJson = fs.readFileSync(path.join(__dirname, 'flare.pen'), 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded flare.pen — ${doc.children.length} screens, ${Math.round(penJson.length / 1024)}KB`);

  const heroHTML = buildHeroHTML(doc, penJson);
  console.log(`✓ Built hero HTML — ${(heroHTML.length / 1024).toFixed(0)}KB`);

  fs.writeFileSync(path.join(__dirname, 'flare-hero.html'), heroHTML);
  console.log('✓ Saved flare-hero.html locally');

  // Publish hero → ram.zenbin.org/flare
  console.log(`\n📤 Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroResult = await publishToZenBin(SLUG, 'FLARE — AI Agent Observability · RAM Design Studio', heroHTML, 'ram');
  if (heroResult.status === 200 || heroResult.status === 201) {
    console.log(`✓ Hero published → https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`⚠ Hero publish: ${heroResult.status} — ${heroResult.body.slice(0, 300)}`);
  }
  const heroUrl = `https://ram.zenbin.org/${SLUG}`;

  // Build & publish viewer → ram.zenbin.org/flare-viewer
  console.log(`\n📤 Fetching pen-viewer template...`);
  try {
    const viewerBase = await httpsReq({
      hostname: 'zenbin.org', path: '/p/pen-viewer-3', method: 'GET',
      headers: { Accept: 'text/html', 'User-Agent': 'design-studio-agent/1.0' },
    });
    if (viewerBase.status === 200) {
      let viewerHtml = viewerBase.body;
      const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
      if (viewerHtml.includes('<script>')) {
        viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
      } else {
        viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
      }
      fs.writeFileSync(path.join(__dirname, 'flare-viewer.html'), viewerHtml);
      console.log(`📤 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
      const vResult = await publishToZenBin(VIEWER_SLUG, 'FLARE Viewer · RAM Design Studio', viewerHtml, 'ram');
      if (vResult.status === 200 || vResult.status === 201) {
        console.log(`✓ Viewer published → https://ram.zenbin.org/${VIEWER_SLUG}`);
      } else {
        console.log(`⚠ Viewer: ${vResult.status} — ${vResult.body.slice(0, 200)}`);
      }
    } else {
      console.log(`⚠ Could not fetch viewer template: ${viewerBase.status}`);
    }
  } catch (e) {
    console.log(`⚠ Viewer error: ${e.message}`);
  }

  // Add to gallery queue
  console.log(`\n📋 Updating gallery registry...`);
  try {
    const qRes = await addToGalleryQueue(heroUrl);
    if (qRes.status === 200 || qRes.status === 201) {
      console.log('✓ Gallery registry updated');
    } else {
      console.log(`⚠ Gallery update: ${qRes.status} — ${qRes.body.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`⚠ Gallery error: ${e.message}`);
  }

  console.log('\n─────────────────────────────────────────');
  console.log('⚡ FLARE Design Discovery Pipeline complete');
  console.log(`   Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery`);
  console.log('─────────────────────────────────────────');
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
