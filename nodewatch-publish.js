'use strict';
// nodewatch-publish.js — hero page + viewer + gallery queue for NODEWATCH

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'nodewatch';
const APP_NAME  = 'NODEWATCH';
const TAGLINE   = 'Real-time intelligence for your autonomous agent network';
const DATE_STR  = 'March 21, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'nodewatch.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:       '#050505',
  surface:  '#0F0F0F',
  surface2: '#161616',
  surface3: '#1F1F1F',
  border:   '#252525',
  border2:  '#333333',
  muted:    '#555555',
  muted2:   '#7A7A7A',
  fg:       '#F4F4F4',
  accent:   '#8B5CF6',
  cyan:     '#22D3EE',
  green:    '#10B981',
  amber:    '#F59E0B',
  red:      '#EF4444',
  pink:     '#EC4899',
};

const SCREEN_NAMES = ['Network Overview', 'Agent Detail', 'Execution Trace', 'Deploy Agent', 'Incident Alert'];

const PROMPT = `Design a dark-mode AI agent command center inspired by:
1. Darknode.io (Awwwards SOTD Mar 21 2026) — pure #050505 black, node-graph animation aesthetic, Outfit/geometric sans, AI automation agency command-center presence
2. Linear.app (darkmodedesign.com gallery) — near-black systematic product UI, minimal status indicators, precision mono-weight typography
3. Midday.ai (godly.website + Dark Mode Design) — "Hedvig Letters Sans" editorial headings, finance clarity dashboard layout, clean SaaS information hierarchy

5 mobile screens (390×844): Network node-graph overview with live agent map, agent detail card with performance metrics, execution trace terminal with color-coded tool calls, deploy agent wizard with model selector and temperature controls, and incident alert with AI-suggested fix and stack trace.`;

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function req(opts, body) {
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

async function createZenBin(slug, title, html, subdomain = '') {
  const body = JSON.stringify({ title, html });
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  };
  if (subdomain) headers['X-Subdomain'] = subdomain;
  return req({ hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST', headers }, body);
}

// ── SVG renderer ───────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#')) return c;
  const m = c.match(/^([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  if (m) return '#' + m[1];
  return c;
}

function rn(node, ox, oy, depth, maxD) {
  if (!node || depth > maxD) return '';
  const x = (node.x || 0) + ox;
  const y = (node.y || 0) + oy;
  const w = node.width  || 10;
  const h = node.height || 10;
  const op = node.opacity !== undefined ? node.opacity : 1;

  if (node.type === 'text') {
    const fill  = sc(node.fill || P.fg);
    const size  = Math.max(node.fontSize || 12, 6);
    const align = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const ax    = align === 'middle' ? x + w/2 : align === 'end' ? x + w : x;
    const lines = String(node.content || '').split('\n');
    const lh    = node.lineHeight ? size * node.lineHeight : size * 1.25;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i * lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${align}" font-weight="${node.fontWeight || 400}">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
    ).join('');
  }
  if (node.type === 'ellipse') {
    const fill   = sc(node.fill || 'transparent');
    const noFill = !node.fill || node.fill === 'transparent';
    const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
    return `<ellipse cx="${(x + w/2).toFixed(1)}" cy="${(y + h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${noFill ? 'none' : fill}" opacity="${op}"${stroke}/>`;
  }
  const fill   = sc(node.fill || P.bg);
  const r      = node.cornerRadius || 0;
  const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
  const clipId = node.clip ? `cp-${node.id || Math.random().toString(36).slice(2)}` : null;
  const kids   = (node.children || []).map(c => rn(c, x, y, depth + 1, maxD)).join('');
  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, thumbW, thumbH, maxD = 5) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${sc(screen.fill || P.bg)}"/>${content}</svg>`;
}

// ── CSS Design tokens ──────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* NODEWATCH Design Tokens */
  /* Inspired by: Darknode.io SOTD · Linear · Midday.ai */

  /* Backgrounds — pure dark node-network system */
  --bg:           ${P.bg};
  --surface:      ${P.surface};
  --surface-2:    ${P.surface2};
  --surface-3:    ${P.surface3};

  /* Borders */
  --border:       ${P.border};
  --border-2:     ${P.border2};

  /* Text */
  --fg:           ${P.fg};
  --muted:        ${P.muted};
  --muted-2:      ${P.muted2};

  /* Brand — Electric Violet (node connection aesthetic) */
  --accent:       ${P.accent};
  --accent-glow:  ${P.accent}40;

  /* Data flow */
  --cyan:         ${P.cyan};

  /* Status system */
  --success:      ${P.green};
  --warning:      ${P.amber};
  --danger:       ${P.red};
  --special:      ${P.pink};

  /* Typography */
  --font-ui:    'Inter Variable', 'Inter', -apple-system, sans-serif;
  --font-mono:  'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
  --font-display: 900 clamp(26px,7vw,96px)/0.92 var(--font-ui);
  --font-heading: 700 14px/1 var(--font-ui);
  --font-body:    400 12px/1.6 var(--font-ui);
  --font-label:   700 9px/1 var(--font-ui);
  --font-trace:   400 10px/1.5 var(--font-mono);

  /* Spacing (4px grid) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px;  --s-4: 16px;
  --s-5: 20px; --s-6: 28px; --s-7: 40px;  --s-8: 60px;

  /* Radius */
  --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-xl: 16px; --r-full: 9999px;

  /* Shadows */
  --shadow-node: 0 0 20px ${P.accent}20;
  --shadow-card: 0 1px 0 ${P.border};
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 175, THUMB_H = 320;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 5)}
    <div style="font-size:8px;color:${P.muted};margin-top:10px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchHTML = [
  { hex: P.bg,      role: 'BG — Node Black'       },
  { hex: P.surface, role: 'SURFACE'                },
  { hex: P.fg,      role: 'FOREGROUND'             },
  { hex: P.accent,  role: 'ACCENT — El. Violet'    },
  { hex: P.cyan,    role: 'FLOW — Data Cyan'        },
  { hex: P.green,   role: 'ONLINE / SUCCESS'        },
  { hex: P.amber,   role: 'DEGRADED / WARN'         },
  { hex: P.red,     role: 'INCIDENT / ERROR'        },
].map(s => `
  <div style="flex:1;min-width:80px;max-width:115px">
    <div style="height:52px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.muted};margin-bottom:3px">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.accent};font-family:'Courier New',monospace">${s.hex}</div>
  </div>`).join('');

// ── Type scale ────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'DISPLAY',   size: '28px', weight: '900', sample: 'NODEWATCH' },
  { label: 'HEADING',   size: '20px', weight: '900', sample: 'AGENT COMMAND CENTER' },
  { label: 'SUBHEAD',   size: '14px', weight: '700', sample: 'CustomerBot-v3 · GPT-4o' },
  { label: 'BODY',      size: '12px', weight: '400', sample: 'Monitor every agent in your network. Debug failures in real time.' },
  { label: 'TRACE',     size: '10px', weight: '400', sample: '09:42:14  TOOL  search_crm(customer_id="CU-4421")' },
  { label: 'LABEL',     size: '9px',  weight: '700', sample: 'EXECUTION TRACE · 1,847 TOKENS · 6.2s' },
].map(t => `
  <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:8px;font-family:'Courier New',monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.15;color:${P.fg};overflow:hidden;white-space:pre;text-overflow:ellipsis">${t.sample}</div>
  </div>`).join('');

const shareText = encodeURIComponent(`NODEWATCH — AI Agent Command Center. Dark-mode monitoring dashboard for autonomous agents. Inspired by Darknode SOTD + Linear. Built by RAM Design Studio.`);

const prd = `
<h3>OVERVIEW</h3>
<p>NODEWATCH is a dark-mode AI agent command center for engineering teams running autonomous agent networks in production. It visualizes the live topology of your agent network, provides deep-dive performance views per agent, surfaces execution traces at the tool-call level, guides deployment of new agents through a model-selection wizard, and delivers incident alerts with AI-suggested fixes. Inspired by Darknode.io's Awwwards SOTD node-graph aesthetic, Linear's systematic near-black UI, and Midday.ai's financial clarity dashboard patterns.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>AI platform engineers</strong> running 10–100+ autonomous agents in production environments (customer support bots, data pipelines, search agents)</li>
<li><strong>ML Ops teams</strong> who need real-time observability into agent health, latency, token consumption, and failure points</li>
<li><strong>AI product leads</strong> who need an at-a-glance command center to understand system-wide agent network status</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Network Graph Overview</strong> — live node-graph showing agent connections (orchestrator, ingestion, reasoning, memory, executor, output nodes), real-time connection status, system health metrics in a 2×2 grid, top agent list with latency indicators</li>
<li><strong>Agent Detail</strong> — individual agent card with total runs, average latency, success rate, memory/CPU/token resource bars, and last output preview with timestamp</li>
<li><strong>Execution Trace Terminal</strong> — terminal-style log with timestamp, type badge (SYS/TOOL/DATA/LLM), and message for every step; real-time recording indicator; color-coded by tool type</li>
<li><strong>Deploy Agent Wizard</strong> — step-by-step deployment: name → model selection (GPT-4o, Claude 3 Opus, Gemini 1.5) → temperature slider → max tokens → system prompt editor → review & deploy</li>
<li><strong>Incident Alert</strong> — severity classification, affected agent identification, error type badge, stack trace viewer, AI-suggested fix panel, one-tap resolve or kill controls</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Darknode node-aesthetic:</strong> #050505 near-pure-black background echoing Darknode.io SOTD, ambient violet/cyan radial glows suggesting a live network pulsing beneath the UI surface</li>
<li><strong>Electric Violet primary (#8B5CF6):</strong> node connection color — used for orchestrator node, active states, primary CTAs, and the node-network glow atmosphere</li>
<li><strong>Data Cyan (#22D3EE):</strong> data flow lines, TOOL call badges, live trace — distinguishes the data pipeline layer from the reasoning layer</li>
<li><strong>Semantic status system:</strong> Green #10B981 (online/healthy), Amber #F59E0B (degraded/warning), Red #EF4444 (incident/critical), Pink #EC4899 (special/output node)</li>
<li><strong>Mono trace typography:</strong> terminal output uses 9-10px monospace at multiple weight levels — timestamps muted, type badges color-coded, messages light — creating a scannable log without visual noise</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>Screen 1 — Network Overview:</strong> Node graph, 2×2 metric grid, agent list with status dots</li>
<li><strong>Screen 2 — Agent Detail:</strong> Agent card, performance charts, resource bars, last output</li>
<li><strong>Screen 3 — Execution Trace:</strong> Terminal header, timestamped tool/LLM log, recording indicator</li>
<li><strong>Screen 4 — Deploy Agent:</strong> Step progress, model selection cards, temperature slider, system prompt</li>
<li><strong>Screen 5 — Incident Alert:</strong> Severity band, error type, stack trace, AI fix suggestion, action buttons</li>
</ul>`;

// ── Build hero HTML ────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — 5-screen mobile design system with CSS tokens. By RAM Design Studio.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  a{color:inherit;text-decoration:none}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}EE;backdrop-filter:blur(16px);z-index:10}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px}
  .nav-id{font-size:10px;color:${P.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:24px;font-weight:700}
  h1{font-size:clamp(56px,11vw,116px);font-weight:900;letter-spacing:-4px;line-height:0.9;margin-bottom:28px}
  .sub{font-size:16px;opacity:.45;max-width:520px;line-height:1.65;margin-bottom:40px}
  .meta{display:flex;gap:40px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.35;letter-spacing:1.5px;margin-bottom:5px}
  .meta-item strong{color:${P.accent};font-size:12px}
  .actions{display:flex;gap:12px;margin-bottom:72px;flex-wrap:wrap}
  .btn{padding:13px 26px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:0.5px;transition:opacity 0.15s,transform 0.1s}
  .btn:hover{opacity:0.85;transform:translateY(-1px)}
  .btn-p{background:${P.accent};color:${P.bg}}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-x{background:#000;color:#fff;border:1px solid #1c1c1c}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${P.border};font-weight:700}
  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:64px 40px;border-top:1px solid ${P.border}}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:700px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${P.fg};opacity:0.65;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.accent}22;border:1px solid ${P.accent}44;color:${P.accent};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${P.border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:14px;font-weight:700}
  .p-text{font-size:17px;opacity:.5;font-style:italic;max-width:620px;line-height:1.68;margin-bottom:20px;white-space:pre-wrap}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:800px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.accent};margin:32px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.6;line-height:1.78;max-width:700px}
  .prd-section ul{padding-left:20px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{opacity:1;color:${P.fg}}
  footer{padding:28px 40px;border-top:1px solid ${P.border};font-size:11px;opacity:.25;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999;pointer-events:none}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">HEARTBEAT · ${DATE_STR.toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">PRODUCTION DESIGN SYSTEM · MOBILE APP · AI TOOLING · ${DATE_STR.toUpperCase()}</div>
  <h1>NODEWATCH</h1>
  <p class="sub">${TAGLINE}. Dark command-center UI inspired by Darknode.io SOTD, Linear, and Midday.ai.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>NODE BLACK + VIOLET</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>DARKNODE SOTD</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">◈ Open in Viewer</a>
    <button class="btn btn-s" onclick="copyPrompt()">⎘ Copy Prompt</button>
    <a class="btn btn-x" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS — 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<div class="brand-section">
  <div style="max-width:960px">
    <div class="section-label">BRAND SPEC</div>
    <div class="brand-grid">
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:700">COLOR PALETTE</div>
        <div class="swatches">${swatchHTML}</div>

        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin:32px 0 16px;font-weight:700">DESIGN PRINCIPLES</div>
        ${[
          ['Node-first hierarchy', 'Network topology drives information architecture — nodes before lists, connections before items.'],
          ['Dark without depth loss', 'Multi-layer surfaces (#050505 → #0F0F0F → #161616 → #1F1F1F) maintain elevation cues in pure black.'],
          ['Color = signal type', 'Violet = agent connections, Cyan = data flow, Green = health, Amber = degraded, Red = incident. Never decorative.'],
          ['Trace-grade typography', 'Terminal output lives at 9-10px mono. UI chrome at 12-14px sans. Display at 22-28px 900w. No middle ground.'],
        ].map(([title, desc]) => `
          <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
            <div style="font-size:11px;font-weight:700;color:${P.fg};margin-bottom:4px">${title}</div>
            <div style="font-size:11px;opacity:.45;line-height:1.55">${desc}</div>
          </div>`).join('')}

        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin:32px 0 16px;font-weight:700">SPACING SCALE</div>
        ${[4,8,12,16,20,28,40,60].map(sp => `
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
            <div style="font-size:9px;opacity:.35;width:30px;flex-shrink:0;font-family:'Courier New',monospace">${sp}px</div>
            <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp * 2}px;opacity:0.65"></div>
          </div>`).join('')}
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:700">TYPE SCALE</div>
        ${typeScaleHTML}
      </div>
    </div>

    <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin:44px 0 16px;font-weight:700">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    </div>
  </div>
</div>

<div class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <div class="p-text">${PROMPT}</div>
</div>

<div class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  ${prd}
</div>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT</span>
  <span>${DATE_STR.toUpperCase()}</span>
  <span>ram.zenbin.org/${SLUG}</span>
</footer>

<script>
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg + ' ✓';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}
function copyTokens() {
  navigator.clipboard.writeText(${JSON.stringify(cssTokens)}).then(() => toast('Tokens copied'));
}
function copyPrompt() {
  navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(() => toast('Prompt copied'));
}
</script>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Push to gallery queue ──────────────────────────────────────────────────────
async function pushGalleryQueue() {
  const entry = {
    slug:         SLUG,
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    submitted_at: new Date().toISOString(),
    credit:       'RAM Heartbeat',
    archetype:    'developer-tools',
    palette: { bg: P.bg, fg: P.fg, accent: P.accent, accent2: P.cyan },
  };

  const getResp = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'RAM-Design-Studio',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const getBody = JSON.parse(getResp.body);
  const existing = JSON.parse(Buffer.from(getBody.content, 'base64').toString('utf8'));
  if (!Array.isArray(existing)) throw new Error('queue.json is not an array');

  existing.push(entry);
  const newContent = Buffer.from(JSON.stringify(existing, null, 2)).toString('base64');

  const putBody = JSON.stringify({
    message: `Add ${SLUG} to design gallery queue`,
    content: newContent,
    sha: getBody.sha,
  });
  const putResp = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'RAM-Design-Studio',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
    },
  }, putBody);
  return putResp.status;
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing NODEWATCH to ZenBin...');

  const heroResp = await createZenBin(SLUG, `${APP_NAME} — ${TAGLINE} · RAM Design Studio`, heroHTML, SUBDOMAIN);
  console.log(`  Hero:   ${heroResp.status} → https://ram.zenbin.org/${SLUG}`);

  const viewResp = await createZenBin(`${SLUG}-viewer`, `${APP_NAME} — Viewer · RAM Design Studio`, viewerHtml, SUBDOMAIN);
  console.log(`  Viewer: ${viewResp.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  try {
    const qStatus = await pushGalleryQueue();
    console.log(`  Queue:  ${qStatus} → ${GITHUB_REPO}/queue.json`);
  } catch (e) {
    console.warn(`  Queue:  WARN — ${e.message}`);
  }

  console.log('\n✓ NODEWATCH published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
