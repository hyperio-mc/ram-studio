'use strict';
// publish-quanta.js — Full Design Discovery pipeline for QUANTA
// Design Heartbeat — March 20, 2026

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'quanta-agent-hub';
const VIEWER_SLUG = 'quanta-viewer';
const APP_NAME    = 'QUANTA';
const TAGLINE     = 'The AI agent orchestration dashboard for teams running agents in production';
const DATE_STR    = 'March 20, 2026';

const P = {
  bg:       '#08090A',
  surface:  '#0F1114',
  surface2: '#141619',
  surface3: '#1A1D22',
  border:   '#212530',
  border2:  '#2C3040',
  muted:    '#4A5060',
  fg:       '#F0F2F5',
  fg2:      '#8892A4',
  cyan:     '#00D4FF',
  amber:    '#F59E0B',
  rose:     '#F43F5E',
  sage:     '#34D399',
  violet:   '#A78BFA',
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain = 'ram') {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const req = https.request({
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    subdomain,
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body); req.end();
  });
}

async function pushGallery(entry) {
  let queue = { submissions: [] };
  try {
    const raw = await new Promise(resolve => {
      const req = https.request({
        hostname: 'raw.githubusercontent.com',
        path: `/${GITHUB_REPO}/main/queue.json`,
        method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0' },
      }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
      req.on('error', e => resolve({ status: 0 }));
      req.end();
    });
    if (raw.status === 200) queue = JSON.parse(raw.body);
  } catch (e) {}
  if (!Array.isArray(queue.submissions)) queue.submissions = [];
  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const shaRes = await new Promise(resolve => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'design-studio-agent/1.0', 'Accept': 'application/vnd.github.v3+json' },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', e => resolve({ status: 0 })); req.end();
  });

  const sha     = shaRes.status === 200 ? JSON.parse(shaRes.body).sha : undefined;
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `Add ${entry.name} to queue`, content, ...(sha ? { sha } : {}) });

  return new Promise(resolve => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'design-studio-agent/1.0',
        'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putBody),
      },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', e => resolve({ status: 0 }));
    req.write(putBody); req.end();
  });
}

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderNode(node, scale) {
  const x = Math.round((node.x || 0) * scale);
  const y = Math.round((node.y || 0) * scale);
  const w = Math.round((node.width  || 0) * scale);
  const h = Math.round((node.height || 0) * scale);
  if (w <= 0 || h <= 0) return '';
  let out = '';
  const fill      = node.fill || 'transparent';
  const r         = node.cornerRadius ? Math.round(node.cornerRadius * scale) : 0;
  const op        = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
  const strokeAttr = node.stroke
    ? ` stroke="${node.stroke.fill}" stroke-width="${Math.max(1, Math.round((node.stroke.thickness || 1) * scale))}"`
    : '';
  if (node.type === 'ellipse') {
    const rx = Math.round(w / 2), ry = Math.round(h / 2);
    out += `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${strokeAttr}${op}/>`;
  } else if (node.type === 'text') {
    const sz   = Math.max(4, Math.round((node.fontSize || 13) * scale));
    const col  = node.fill || P.fg;
    const fw   = node.fontWeight || '400';
    const anch = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const tx   = node.textAlign === 'center' ? x + w / 2 : node.textAlign === 'right' ? x + w : x;
    const safe = (node.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').split('\n')[0].slice(0, 60);
    out += `<text x="${tx}" y="${y + sz}" font-size="${sz}" fill="${col}" font-weight="${fw}" text-anchor="${anch}"${op}>${safe}</text>`;
  } else {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${strokeAttr}${op}/>`;
    for (const child of (node.children || [])) {
      out += renderNode({ ...child, x: (node.x || 0) + (child.x || 0), y: (node.y || 0) + (child.y || 0) }, scale);
    }
  }
  return out;
}

// ── Load pen ──────────────────────────────────────────────────────────────────
const penJsonStr = fs.readFileSync(path.join(__dirname, 'quanta.pen'), 'utf8');
const penJson    = JSON.parse(penJsonStr);
const screens    = penJson.children || [];

function screenThumbSVG(screen, tw, th) {
  const scale = Math.min(tw / screen.width, th / screen.height);
  const svgW  = Math.round(screen.width  * scale);
  const svgH  = Math.round(screen.height * scale);
  let inner = '';
  for (const child of (screen.children || [])) {
    inner += renderNode({ ...child, x: child.x || 0, y: child.y || 0 }, scale);
  }
  return `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="border-radius:10px;display:block;box-shadow:0 0 0 1px ${P.border2}">
    <rect width="${svgW}" height="${svgH}" fill="${screen.fill || P.bg}"/>
    ${inner}
  </svg>`;
}

const THUMB_H      = 200;
const SCREEN_NAMES = ['Agent Hub', 'Agent Detail', 'Task Queue', 'Alerts', 'Config'];
const thumbsHTML   = screens.map((s, i) => {
  const tw = Math.round(THUMB_H * (s.width / s.height));
  return `<div style="text-align:center;flex-shrink:0">
    ${screenThumbSVG(s, tw, THUMB_H)}
    <div style="font-size:9px;color:${P.fg2};margin-top:10px;letter-spacing:2px;max-width:${tw}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`;
}).join('');

// ── CSS Tokens ────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* QUANTA — AI Agent Control Center */

  /* Backgrounds */
  --quanta-bg:        ${P.bg};
  --quanta-surface:   ${P.surface};
  --quanta-surface2:  ${P.surface2};
  --quanta-surface3:  ${P.surface3};

  /* Borders */
  --quanta-border:    ${P.border};
  --quanta-border2:   ${P.border2};

  /* Foreground */
  --quanta-fg:        ${P.fg};
  --quanta-fg2:       ${P.fg2};
  --quanta-muted:     ${P.muted};

  /* Status colors */
  --quanta-cyan:      ${P.cyan};   /* primary / running */
  --quanta-sage:      ${P.sage};   /* online / healthy  */
  --quanta-violet:    ${P.violet}; /* idle / queued     */
  --quanta-amber:     ${P.amber};  /* warning           */
  --quanta-rose:      ${P.rose};   /* critical / error  */

  /* Typography — Linear-style monospace everything */
  --font-mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  --type-display: 900 clamp(42px, 8vw, 88px) / 1   var(--font-mono);
  --type-heading: 700 22px                   / 1.3 var(--font-mono);
  --type-body:    400 13px                   / 1.6 var(--font-mono);
  --type-caption: 700 9px                    / 1   var(--font-mono);

  /* Spacing (4px grid) */
  --sp-1: 4px;  --sp-2: 8px;   --sp-3: 12px;
  --sp-4: 16px; --sp-5: 24px;  --sp-6: 32px;  --sp-7: 48px;

  /* Radius */
  --r-sm: 6px;  --r-md: 12px;  --r-lg: 16px;  --r-full: 9999px;

  /* Glow — Evervault-inspired halo effects */
  --glow-cyan:   0 0 40px ${P.cyan}18, 0 0 80px ${P.cyan}0A;
  --glow-rose:   0 0 40px ${P.rose}18, 0 0 80px ${P.rose}0A;
  --glow-amber:  0 0 40px ${P.amber}18, 0 0 80px ${P.amber}0A;
}`;

// ── PRD ────────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>QUANTA is an AI agent orchestration control center — a mobile-first dashboard for dev teams managing multiple autonomous AI agents running in production. It brings Linear's precision dark-mode aesthetic (as seen on darkmodedesign.com) to the emerging AI infrastructure space. Where Linear made issue tracking feel effortless, QUANTA makes agent monitoring feel invisible — you only look when something needs attention, and when you do, every piece of data is exactly where you expect it.</p>

<h3>RESEARCH SOURCES (March 20, 2026)</h3>
<ul>
  <li><strong>Linear.app (darkmodedesign.com)</strong> — The definitive reference: ultra-dark near-black #08090A background, white text, SF Mono typeface, surgical information density. The background RGB is (8, 9, 10) — not generic #1a1a1a but a <em>designed</em> near-black with a faint cool undertone. QUANTA adopts this exactly.</li>
  <li><strong>Evervault Customers page (godly.website)</strong> — Cosmic glassmorphism: glowing card halos that pulse with activity color, rgba panel backgrounds at low opacity, temporal blending. QUANTA borrows the halo glow language — each agent card emits a subtle radial glow in its status color.</li>
  <li><strong>Awwwards nominees (Mar 2026)</strong> — MoMoney fintech bento grids, Vast data-viz editorial cards. Inspired the 2×2 small agent card layout on the hub screen and the "data as design" principle where numbers ARE the visual hierarchy.</li>
</ul>

<h3>TARGET USERS</h3>
<ul>
  <li><strong>AI engineers</strong> building and deploying multi-agent pipelines who need real-time visibility into agent health without context-switching to log dashboards</li>
  <li><strong>DevOps / Platform teams</strong> responsible for uptime SLAs on agent infrastructure running autonomous workloads</li>
  <li><strong>Product managers</strong> at AI-native companies monitoring output quality and throughput of automated content, research, and review pipelines</li>
  <li><strong>Founders and CTOs</strong> who want a single pane of glass showing fleet health at a glance during stand-ups or investor demos</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
  <li><strong>Agent Hub</strong> — Bento grid overview of all agents with live status glows, global health badge, throughput strip, and instant incident banners. One glance shows the full fleet state.</li>
  <li><strong>Agent Detail</strong> — Deep-dive into a single agent: live CPU/memory/task metrics, full task log with status states (queued → running → done), 24h throughput bar chart, model info, and pause/logs actions.</li>
  <li><strong>Task Queue</strong> — Real-time queue view split into Running (with agent assignments + ETAs) and Pending (unassigned tasks with priority tags). Single-tap to dispatch new tasks.</li>
  <li><strong>Alerts</strong> — Severity-filtered incident log (CRITICAL / WARNING / INFO) with left-accent color coding, agent attribution, and contextual action links. A persistent alert summary bar shows the fleet's incident state at a glance.</li>
  <li><strong>Config</strong> — Agent configuration screen: model selection, system prompt editor, per-permission toggles (Linear-style toggle design), and rate limit settings. Clean save flow.</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<p>QUANTA's visual grammar is built on three rules derived from research:</p>
<ul>
  <li><strong>Rule 1 — One dark, many lights:</strong> The background is a single near-black (#08090A, directly from Linear). Every other surface is a carefully stepped lighter variant. There are no random greys — each surface level has a semantic meaning (bg → surface → card → elevated).</li>
  <li><strong>Rule 2 — Status = color = light:</strong> The only colors with hue are the four status states (cyan, sage, violet, amber, rose). Each color appears as: the element fill, a glow halo behind the element, and a left-border accent on list items. This Evervault-inspired system means color carries meaning, not decoration.</li>
  <li><strong>Rule 3 — Numbers lead:</strong> Inspired by Awwwards' bento data-viz trend, the primary typographic element on every screen is a large number (73%, 47, 99.97%). Type sizing deliberately makes data the hero, with labels as secondary infrastructure.</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
  <li><strong>Screen 1 — Agent Hub:</strong> Global command center. Featured agent hero card + 2×2 agent bento grid + stats bar + incident banner + recent activity feed. Primary action: tap any agent card.</li>
  <li><strong>Screen 2 — Agent Detail:</strong> Drill-down view for a single agent. Live metric strip + task log with 4 status variants + 24h throughput chart + model badge + pause/logs CTA row.</li>
  <li><strong>Screen 3 — Task Queue:</strong> Orchestration layer. Running tasks (cyan-bordered) with agent + ETA vs. pending tasks (violet-bordered) awaiting assignment. Add task CTA at bottom.</li>
  <li><strong>Screen 4 — Alerts:</strong> Incident log with severity filters, color-coded left-accent cards, contextual dismiss/investigate actions, persistent fleet status banner.</li>
  <li><strong>Screen 5 — Config:</strong> Model selector + system prompt textarea + permission toggles + rate limits + save. Agent configuration as the final screen in the nav arc.</li>
</ul>`;

// ── Swatches HTML ─────────────────────────────────────────────────────────────
const swatches = [
  { hex: P.bg,     role: 'BACKGROUND',   label: 'Linear Void'    },
  { hex: P.surface2, role: 'CARD',       label: 'Card Surface'   },
  { hex: P.fg,     role: 'FOREGROUND',   label: 'Near White'     },
  { hex: P.cyan,   role: 'PRIMARY',      label: 'Electric Cyan'  },
  { hex: P.rose,   role: 'CRITICAL',     label: 'Rose'           },
  { hex: P.amber,  role: 'WARNING',      label: 'Amber'          },
  { hex: P.sage,   role: 'HEALTHY',      label: 'Sage'           },
  { hex: P.violet, role: 'IDLE',         label: 'Violet'         },
];
const swatchHTML = swatches.map(sw => `
  <div style="flex:1;min-width:76px">
    <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border2};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.cyan};margin-bottom:2px">${sw.hex}</div>
    <div style="font-size:9px;opacity:.35">${sw.label}</div>
  </div>`).join('');

// ── Type scale HTML ───────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'DISPLAY',  size: '48px', weight: '900', sample: APP_NAME },
  { label: 'HEADING',  size: '22px', weight: '700', sample: TAGLINE  },
  { label: 'BODY',     size: '13px', weight: '400', sample: 'The quick brown fox jumps over the lazy dog — agent monitoring at scale.' },
  { label: 'CAPTION',  size: '9px',  weight: '700', sample: 'LABEL · METADATA · ALERT STATUS · TIMESTAMP' },
].map(t => `
  <div style="padding:16px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:8px">${t.label} · ${t.size} / ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
  </div>`).join('');

// ── Spacing HTML ──────────────────────────────────────────────────────────────
const spacingHTML = [4,8,12,16,24,32,48].map(sp => `
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">
    <div style="font-size:10px;opacity:.35;width:28px;flex-shrink:0">${sp}px</div>
    <div style="height:6px;border-radius:3px;background:${P.cyan};width:${sp * 2}px;opacity:.65"></div>
  </div>`).join('');

// ── Share text ────────────────────────────────────────────────────────────────
const shareText = encodeURIComponent(
  `QUANTA — AI Agent Orchestration Control Center. Dark-mode design system inspired by Linear + Evervault, built by RAM Design Studio.`
);

// ── Hero page HTML ────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — AI Agent Control Center · RAM Design Studio</title>
<meta name="description" content="${TAGLINE}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Mono','Fira Code','JetBrains Mono',ui-monospace,monospace;min-height:100vh}
  a{color:inherit;text-decoration:none}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${P.fg}}
  .nav-id{font-size:11px;color:${P.cyan};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:900px}
  .tag{font-size:10px;letter-spacing:3px;color:${P.cyan};margin-bottom:20px}
  h1{font-size:clamp(52px,10vw,100px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:16px}
  .tagline{font-size:16px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:32px}
  .meta-row{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.35;letter-spacing:1.5px;margin-bottom:4px}
  .meta-item strong{color:${P.cyan};font-size:12px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;transition:opacity .2s}
  .btn-p{background:${P.cyan};color:${P.bg}}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-s:hover{border-color:${P.cyan}55}
  .btn-x{background:#111;color:#eee;border:1px solid #333}
  .section{padding:0 40px 72px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.cyan};margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid ${P.border}}
  .thumbs{display:flex;gap:18px;overflow-x:auto;padding-bottom:10px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.cyan}33;border-radius:2px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}.hero{padding:50px 24px 24px}.section{padding:0 24px 48px}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:22px;margin-top:0;position:relative}
  .tokens-pre{font-size:11px;line-height:1.75;color:${P.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.cyan}18;border:1px solid ${P.cyan}30;color:${P.cyan};font-family:inherit;font-size:10px;letter-spacing:1.2px;padding:5px 14px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.cyan}28}
  .prompt-section{padding:40px;border-top:1px solid ${P.border};max-width:820px}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.cyan};margin-bottom:12px}
  .p-text{font-size:18px;opacity:.55;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:0}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:800px}
  .prd-section h3{font-size:9px;letter-spacing:2.5px;color:${P.cyan};margin:32px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;opacity:.65;line-height:1.75;max-width:700px}
  .prd-section ul{padding-left:18px;margin:8px 0}
  .prd-section li{margin-bottom:6px}
  .prd-section strong{opacity:1;color:${P.fg}}
  footer{padding:28px 40px;border-top:1px solid ${P.border};font-size:10px;opacity:.25;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.cyan};color:${P.bg};font-family:inherit;font-size:11px;font-weight:800;letter-spacing:1.2px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .glow-bar{height:1px;background:linear-gradient(90deg,transparent,${P.cyan}44,transparent);margin:0 40px}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${SLUG}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT  ·  AI INFRASTRUCTURE  ·  ${DATE_STR.toUpperCase()}</div>
  <h1>${APP_NAME}</h1>
  <p class="tagline">${TAGLINE}</p>
  <div class="meta-row">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>AI INFRASTRUCTURE TOOL</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>LINEAR VOID + CYAN + AMBER + ROSE</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">Open in Viewer →</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/${SLUG}" target="_blank">Hero Page</a>
    <a class="btn btn-x" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank">Share on X</a>
  </div>
</section>

<div class="glow-bar"></div>

<section class="section" style="padding-top:48px">
  <div class="section-label">SCREENS  ·  5 MOBILE</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="section" style="border-top:1px solid ${P.border}">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:14px">COLOUR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin:28px 0 14px">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin-bottom:14px">SPACING SYSTEM</div>
      ${spacingHTML}
      <div style="font-size:9px;letter-spacing:2px;opacity:.35;margin:28px 0 14px">DESIGN PRINCIPLES</div>
      ${[
        ['ONE DARK', 'Background #08090A is a single designed void. All surfaces step from it.'],
        ['STATUS = COLOR = LIGHT', 'Every hue carries semantic meaning. Cyan = running, sage = healthy, rose = critical.'],
        ['NUMBERS LEAD', 'Large numerals are the primary visual element. Labels are infrastructure.'],
        ['GLOW WITH PURPOSE', 'Halos appear only on active elements. Glowing = live = pay attention.'],
      ].map(([principle, desc]) => `
        <div style="margin-bottom:16px;padding:14px;background:${P.surface};border-radius:8px;border:1px solid ${P.border}">
          <div style="font-size:9px;color:${P.cyan};font-weight:700;letter-spacing:2px;margin-bottom:6px">${principle}</div>
          <div style="font-size:11px;opacity:.55;line-height:1.6">${desc}</div>
        </div>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="border-top:1px solid ${P.border}">
  <div class="section-label">CSS DESIGN TOKENS</div>
  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokensBlock">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">DESIGN PROMPT</div>
  <p class="p-text">"Design a dark-mode AI Agent Orchestration Control Center inspired by Linear's near-black #08090A aesthetic from darkmodedesign.com, with glowing card halos from Evervault (godly.website), and bento grid layouts from Awwwards nominees — for dev teams monitoring autonomous agents running in production."</p>
</section>

<section class="prd-section">
  <div class="section-label" style="padding:0 0 12px;border-bottom:1px solid ${P.border};margin-bottom:32px">PRODUCT BRIEF</div>
  ${prd}
</section>

<footer>
  <span>RAM DESIGN STUDIO · ${DATE_STR.toUpperCase()}</span>
  <span>BUILT FROM ONE PROMPT</span>
  <span>ram.zenbin.org</span>
</footer>

<script>
function copyTokens() {
  const text = document.getElementById('tokensBlock').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const t = document.getElementById('toast');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  });
}
</script>
</body>
</html>`;

// ── Viewer page HTML ──────────────────────────────────────────────────────────
let viewerHTML = fs.readFileSync(
  path.join(__dirname, 'penviewer-app.html'),
  'utf8'
);
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};</script>`;
viewerHTML = viewerHTML.replace('<script>', injection + '\n<script>');

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing QUANTA — AI Agent Orchestration Control Center');
  console.log('──────────────────────────────────────────────────────────');

  // Hero page
  console.log(`\n[1/3] Publishing hero → ram.zenbin.org/${SLUG}`);
  const heroRes = await post(SLUG, `${APP_NAME} — AI Agent Control Center · RAM`, heroHTML);
  console.log(`     Status: ${heroRes.status} ${heroRes.status === 200 ? '✓' : '✗'}`);

  // Viewer page
  console.log(`\n[2/3] Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}`);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer · RAM`, viewerHTML);
  console.log(`     Status: ${viewerRes.status} ${viewerRes.status === 200 ? '✓' : '✗'}`);

  // Gallery queue
  console.log(`\n[3/3] Pushing to design gallery queue`);
  const galleryRes = await pushGallery({
    id:           SLUG,
    name:         APP_NAME,
    tagline:      TAGLINE,
    archetype:    'ai-infrastructure',
    palette:      { bg: P.bg, fg: P.fg, accent: P.cyan, accent2: P.rose },
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${VIEWER_SLUG}`,
    submitted_at: new Date().toISOString(),
    credit:       'RAM Design Studio',
    screens:      5,
  });
  console.log(`     Status: ${galleryRes.status} ${galleryRes.status === 200 || galleryRes.status === 201 ? '✓' : '✗'}`);

  console.log('\n──────────────────────────────────────────────────────────');
  console.log(`\n✓ QUANTA published`);
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery queue updated`);
}

main().catch(console.error);
