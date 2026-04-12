'use strict';
// synapse-publish.js — hero page + viewer + gallery queue for SYNAPSE

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'synapse';
const APP_NAME  = 'SYNAPSE';
const TAGLINE   = 'AI Agent Workflow Orchestration Platform';
const DATE_STR  = 'March 20, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'synapse.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:       '#08090A',
  surface:  '#111214',
  surface2: '#18191C',
  border:   '#25262B',
  border2:  '#2E3038',
  muted:    '#4A4D57',
  muted2:   '#6B6E7C',
  fg:       '#F7F8F8',
  accent:   '#5E6AD2',
  green:    '#4CC38A',
  amber:    '#E9A23B',
  red:      '#EF5656',
  violet:   '#9C6FE4',
  cyan:     '#2ABFDA',
};

const SCREEN_NAMES = ['Dashboard', 'Workflow Builder', 'Live Monitor', 'Agent Library', 'Run History'];
const PROMPT = `Design a dark-mode AI Agent Workflow Orchestration platform inspired by:
1. Linear.app (darkmodedesign.com) — near-black bg #08090A, indigo accent #5E6AD2, systematic product-dev UI
2. Locomotive.ca (godly.website) — oversized editorial wordmarks at 70px, tight tracking, bold typographic hierarchy  
3. LangChain landing (land-book.com) — AI agent pipeline visualization, observability framing, "connect your AI agents" mental model.

5 mobile screens: bento-grid dashboard overview, node-based workflow pipeline builder, real-time execution trace monitor, agent library with toggle controls, and run history with weekly analytics.`;

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

// ── Design tokens ──────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* SYNAPSE Design Tokens — Linear-inspired dark system */

  /* Backgrounds */
  --bg:           ${P.bg};
  --surface:      ${P.surface};
  --surface-2:    ${P.surface2};
  --border:       ${P.border};
  --border-2:     ${P.border2};
  --muted:        ${P.muted};
  --muted-2:      ${P.muted2};

  /* Foreground */
  --fg:           ${P.fg};

  /* Brand — Electric Indigo (Linear-inspired) */
  --accent:       ${P.accent};
  --accent-hover: #7C83DD;

  /* Status system */
  --success:      ${P.green};
  --warning:      ${P.amber};
  --danger:       ${P.red};

  /* AI Model indicators */
  --violet:       ${P.violet};
  --cyan:         ${P.cyan};

  /* Typography */
  --font-ui:    'Inter Variable', 'Inter', -apple-system, sans-serif;
  --font-mono:  'SF Mono', 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 900 clamp(30px,8vw,96px)/0.95 var(--font-ui);
  --font-heading: 700 13px/1 var(--font-ui);
  --font-body:    400 12px/1.6 var(--font-ui);
  --font-label:   700 8px/1 var(--font-ui);

  /* Spacing (4px grid) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px;  --s-4: 16px;
  --s-5: 20px; --s-6: 28px; --s-7: 40px;  --s-8: 60px;

  /* Radius */
  --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-xl: 16px; --r-full: 9999px;
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 175, THUMB_H = 320;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 4)}
    <div style="font-size:8px;color:${P.muted};margin-top:10px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchHTML = [
  { hex: P.bg,      role: 'BG — Linear Black'    },
  { hex: P.surface, role: 'SURFACE'               },
  { hex: P.fg,      role: 'FOREGROUND'            },
  { hex: P.accent,  role: 'ACCENT — Indigo'       },
  { hex: P.violet,  role: 'AI — Violet'           },
  { hex: P.cyan,    role: 'STREAM — Cyan'         },
  { hex: P.green,   role: 'SUCCESS'               },
  { hex: P.amber,   role: 'WARNING'               },
].map(s => `
  <div style="flex:1;min-width:80px;max-width:120px">
    <div style="height:56px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.muted};margin-bottom:3px">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.accent};font-family:'Courier New',monospace">${s.hex}</div>
  </div>`).join('');

// ── Type scale ────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'DISPLAY',  size: '30px', weight: '900', sample: 'SYNAPSE'                           },
  { label: 'EDITORIAL',size: '22px', weight: '900', sample: 'AI WORKFLOW\nORCHESTRATOR'         },
  { label: 'HEADING',  size: '15px', weight: '700', sample: 'Customer Support Bot'              },
  { label: 'BODY',     size: '12px', weight: '400', sample: 'Monitor all AI agent workflows, debug failures, optimize cost.' },
  { label: 'LABEL',    size: '8px',  weight: '700', sample: 'EXECUTION TRACE · 2,847 TOKENS · LIVE STATUS' },
].map(t => `
  <div style="padding:16px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:8px;font-family:'Courier New',monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.15;color:${P.fg};overflow:hidden;white-space:pre;text-overflow:ellipsis">${t.sample}</div>
  </div>`).join('');

const shareText = encodeURIComponent(`SYNAPSE — AI Agent Workflow Orchestration Platform. Linear-inspired dark design, 5-screen mobile system. Built by RAM Design Studio.`);

const prd = `
<h3>OVERVIEW</h3>
<p>SYNAPSE is a dark-mode mobile application for building, running, and monitoring AI agent workflows. It gives platform engineers and AI teams a systematic, Linear-quality interface to design multi-step agent pipelines — connecting LLMs, vector databases, APIs, and tools — then observe every execution in real time. Inspired by Linear's near-black systematic product UI, Locomotive's editorial typography boldness, and LangChain's agent pipeline framing.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Platform engineers</strong> building production AI agent workflows connecting Claude, GPT-4o, Pinecone, and custom tools</li>
<li><strong>AI product teams</strong> who need observability into token usage, latency, cost, and failure points across pipelines</li>
<li><strong>Developer advocates &amp; founders</strong> prototyping multi-agent orchestration products on mobile</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Bento Dashboard</strong> — real-time system health gauge, 2×2 metric grid (active runs, agents live, success rate, avg latency), scrollable recent run feed with color-coded status</li>
<li><strong>Workflow Builder</strong> — vertical node pipeline with step cards (trigger → classify → search → generate), inline progress bars for running steps, cost/token summary strip</li>
<li><strong>Live Execution Monitor</strong> — step-by-step trace timeline with latency per step, context window preview with token count, abort control</li>
<li><strong>Agent Library</strong> — searchable grid of 47 agents, category filters, toggle switches to enable/disable, usage stats per agent</li>
<li><strong>Run History + Analytics</strong> — weekly bar chart with success overlay, chronological run list with retry CTAs for failures</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Linear-inspired near-black system:</strong> #08090A background with multi-layer surface elevation (#111214, #18191C, #1E1F23), extremely subtle borders (#25262B)</li>
<li><strong>Locomotive editorial type:</strong> oversized bold wordmarks at 28–34px/900 weight with tight tracking create instant hierarchy without imagery</li>
<li><strong>Electric Indigo primary (#5E6AD2):</strong> Linear's signature accent used for active states, primary CTAs, and live indicators — calm authority without aggression</li>
<li><strong>Semantic status system:</strong> Green #4CC38A (success), Amber #E9A23B (warning/latency), Red #EF5656 (failure), Violet #9C6FE4 (AI model), Cyan #2ABFDA (stream/data)</li>
<li><strong>Ambient glows:</strong> radial soft-light halos behind key metrics add depth without breaking the dark-mode covenant</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>Screen 1 — Dashboard:</strong> System health at a glance, 2×2 bento metrics, live run feed</li>
<li><strong>Screen 2 — Workflow Builder:</strong> Vertical pipeline node editor, step-level status, run controls</li>
<li><strong>Screen 3 — Live Monitor:</strong> Real-time trace, context preview, execution metrics, abort</li>
<li><strong>Screen 4 — Agent Library:</strong> Browse, filter, enable/disable agents across providers</li>
<li><strong>Screen 5 — Run History:</strong> Weekly analytics, chronological log, retry flows</li>
</ul>`;

// ── Build hero HTML ────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SYNAPSE — AI Agent Workflow Orchestrator · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — 5-screen mobile design system with CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  a{color:inherit;text-decoration:none}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}99;backdrop-filter:blur(12px);z-index:10}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px}
  .nav-id{font-size:10px;color:${P.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(52px,10vw,108px);font-weight:900;letter-spacing:-3px;line-height:0.92;margin-bottom:24px}
  .sub{font-size:16px;opacity:.5;max-width:500px;line-height:1.6;margin-bottom:36px}
  .meta{display:flex;gap:40px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1.5px;margin-bottom:4px}
  .meta-item strong{color:${P.accent};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:0.5px;transition:opacity 0.15s}
  .btn:hover{opacity:0.85}
  .btn-p{background:${P.accent};color:${P.bg}}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-x{background:#000;color:#fff;border:1px solid #1a1a1a}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${P.border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border}}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${P.fg};opacity:0.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.accent}22;border:1px solid ${P.accent}44;color:${P.accent};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${P.border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:12px;font-weight:700}
  .p-text{font-size:17px;opacity:.55;font-style:italic;max-width:600px;line-height:1.65;margin-bottom:20px;white-space:pre-wrap}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.accent};margin:32px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:20px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{opacity:1;color:${P.fg}}
  footer{padding:28px 40px;border-top:1px solid ${P.border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
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
  <div class="tag">DESIGN SYSTEM · MOBILE APP · AI TOOLING · ${DATE_STR.toUpperCase()}</div>
  <h1>SYNAPSE</h1>
  <p class="sub">${TAGLINE}. Systematic dark-mode design inspired by Linear, Locomotive, and LangChain.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>LINEAR DARK</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>BY</span><strong>RAM</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">◈ Open in Viewer</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/${SLUG}" onclick="copyPrompt(event)">⎘ Copy Prompt</a>
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

        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin:32px 0 16px;font-weight:700">SPACING SCALE</div>
        ${[4,8,12,16,20,28,40,60].map(sp => `
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
            <div style="font-size:9px;opacity:.4;width:30px;flex-shrink:0;font-family:'Courier New',monospace">${sp}px</div>
            <div style="height:7px;border-radius:4px;background:${P.accent};width:${sp * 2}px;opacity:0.7"></div>
          </div>`).join('')}
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:700">TYPE SCALE</div>
        ${typeScaleHTML}
      </div>
    </div>

    <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin:40px 0 16px;font-weight:700">CSS DESIGN TOKENS</div>
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
  <div class="section-label">PRODUCT BRIEF</div>
  ${prd}
</div>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT</span>
  <span>${DATE_STR.toUpperCase()}</span>
  <span>ram.zenbin.org</span>
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
function copyPrompt(e) {
  e.preventDefault();
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
    slug:       SLUG,
    app_name:   APP_NAME,
    tagline:    TAGLINE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    submitted_at: new Date().toISOString(),
    credit:     'RAM Heartbeat',
    archetype:  'productivity',
    palette: { bg: P.bg, fg: P.fg, accent: P.accent, accent2: P.violet },
  };

  // Get current queue.json
  const getResp = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'RAM-Design-Studio', 'Accept': 'application/vnd.github.v3+json' },
  });
  const getBody = JSON.parse(getResp.body);
  const existing = JSON.parse(Buffer.from(getBody.content, 'base64').toString('utf8'));
  if (!Array.isArray(existing)) throw new Error('queue.json is not an array');

  // Add new entry
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
  console.log('Publishing SYNAPSE to ZenBin...');

  // Hero page
  const heroResp = await createZenBin(SLUG, `${APP_NAME} — ${TAGLINE} · RAM Design Studio`, heroHTML, SUBDOMAIN);
  console.log(`  Hero:   ${heroResp.status} → https://ram.zenbin.org/${SLUG}`);

  // Viewer
  const viewResp = await createZenBin(`${SLUG}-viewer`, `${APP_NAME} — Viewer · RAM Design Studio`, viewerHtml, SUBDOMAIN);
  console.log(`  Viewer: ${viewResp.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  // Gallery queue
  try {
    const qStatus = await pushGalleryQueue();
    console.log(`  Queue:  ${qStatus} → ${GITHUB_REPO}/queue.json`);
  } catch (e) {
    console.warn(`  Queue:  WARN — ${e.message}`);
  }

  console.log('\n✓ SYNAPSE published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
