'use strict';
// publish-stratum-heartbeat.js
// Full Design Discovery pipeline for STRATUM
// Design Heartbeat — Mar 22, 2026

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'stratum-heartbeat';
const VIEWER_SLUG = 'stratum-viewer';
const MOCK_SLUG   = 'stratum-mock';
const DATE_STR    = 'March 22, 2026';
const APP_NAME    = 'STRATUM';
const TAGLINE     = 'MCP Agent Orchestration Hub';
const ARCHETYPE   = 'productivity';

const ORIGINAL_PROMPT = `Design a 5-screen dark-mode MCP Agent Orchestration Hub — STRATUM — directly inspired by Linear.app's ultra-minimal design language (featured on darkmodedesign.com, March 2026: #08090A background, #5E6AD2 purple-blue accent, Inter Variable variable font, extreme information density with zero decorative noise) and the emerging "agentic infrastructure" product category on land-book.com (Runlayer: "Enterprise MCPs, Skills & Agents", March 2026). STRATUM gives developer teams real-time visibility and control over their AI agent fleet and MCP tool connections. Palette: ultra-dark #08090A bg, #5E6AD2 Linear accent, #2DB37F health green, #E5484D error red, #E09A21 warning amber. 5 screens: Hub Overview (bento grid with active agents counter, tool calls/min sparkline tiles, system health %, activity feed), Agent Fleet (filtered list of agents with status badges, model labels, call counts, uptime), MCP Connections (2-column tool grid: GitHub/Slack/Linear/Postgres/Stripe/Notion with health dots and call rate sparklines), Event Stream (live feed of TOOL_CALL/LLM_CALL/ERROR events with type badges and latency indicators), Usage & Quotas (month-to-date spend hero, token usage bars by agent, quota progress bars).`;

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:       '#08090A',
  surface:  '#101214',
  surface2: '#161A1F',
  surface3: '#1C2028',
  border:   '#1E2228',
  border2:  '#272C36',
  muted:    '#4A5060',
  muted2:   '#8A8F98',
  fg:       '#F7F8F8',
  accent:   '#5E6AD2',
  accentLo: '#5E6AD218',
  accentHi: '#8B95E8',
  green:    '#2DB37F',
  red:      '#E5484D',
  amber:    '#E09A21',
};

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 300) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';

  if (el.type === 'frame') {
    const bg   = fill !== 'transparent' && fill !== 'none'
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`
      : '';
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids && !bg) return '';
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, 8));
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w}" height="${fh}" fill="${el.fill || P.fg}"${oAttr} rx="1" opacity="0.5"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:14px;flex-shrink:0;border:1px solid ${P.border}"><rect width="${sw}" height="${sh}" fill="${screen.fill || P.bg}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  return md.trim().split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
    if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- '))
        .map(l => `<li>${l.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`);
      return `<ul>${items.join('')}</ul>`;
    }
    return `<p>${block.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`;
  }).join('\n');
}

// ── Hero HTML builder ──────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const screens    = pen.children || [];
  const viewerURL  = `https://ram.zenbin.org/${VIEWER_SLUG}`;
  const mockURL    = `https://ram.zenbin.org/${MOCK_SLUG}`;
  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');
  const shareText  = encodeURIComponent(`${APP_NAME} — ${TAGLINE}\nMCP Agent Orchestration UI by RAM Design Studio`);
  const shareURL   = encodeURIComponent(`https://ram.zenbin.org/${SLUG}`);

  const THUMB_H = 180;
  const screenLabels = ['Hub Overview', 'Agent Fleet', 'MCP Connections', 'Event Stream', 'Usage & Quotas'];
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;white-space:nowrap">${(screenLabels[i] || 'SCREEN ' + (i + 1)).toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: P.bg,      role: 'BACKGROUND' },
    { hex: P.surface2, role: 'SURFACE'   },
    { hex: P.fg,      role: 'FOREGROUND' },
    { hex: P.accent,  role: 'ACCENT'     },
    { hex: P.green,   role: 'HEALTH'     },
    { hex: P.red,     role: 'ERROR'      },
    { hex: P.amber,   role: 'WARNING'    },
  ];
  const surface = '#161A1F', border = '#1E2228', muted = '#8A8F98';
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:70px">
      <div style="height:52px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '44px', weight: '800', sample: APP_NAME },
    { label: 'TITLE',    size: '24px', weight: '700', sample: TAGLINE  },
    { label: 'HEADING',  size: '14px', weight: '700', sample: 'AGENT FLEET' },
    { label: 'BODY',     size: '12px', weight: '400', sample: 'code-reviewer → github.createPR' },
    { label: 'LABEL',    size: '9px',  weight: '700', sample: 'TOKEN USAGE BY AGENT' },
  ].map(t => `<div style="margin-bottom:14px;border-bottom:1px solid ${border};padding-bottom:12px">
    <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:4px">${t.label}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.1;color:${P.fg}">${t.sample}</div>
  </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 20, 24, 32, 48].map(s =>
    `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="width:${s}px;height:${s}px;background:${P.accent};border-radius:2px;flex-shrink:0"></div>
      <div style="font-size:10px;color:${muted}">${s}px — ${s === 4 ? 'xs' : s === 8 ? 'sm' : s === 12 ? 'md' : s === 16 ? 'base' : s === 20 ? 'lg' : s === 24 ? 'xl' : s === 32 ? '2xl' : '3xl'}</div>
    </div>`).join('');

  const principlesHTML = [
    ['Zero noise', 'Every element must earn its place. No decorative UI.'],
    ['Data first', 'Numbers and states are the hero. Typography is the UI.'],
    ['Color = signal', 'Color is reserved for status. Green=healthy, Red=error, Amber=warn.'],
    ['Linear density', 'Maximum information in minimum vertical space.'],
  ].map(([t, d]) =>
    `<div style="margin-bottom:14px"><div style="font-size:11px;font-weight:700;color:${P.fg};margin-bottom:3px">${t}</div>
    <div style="font-size:11px;color:${muted};line-height:1.6">${d}</div></div>`).join('');

  const cssTokens = `/* STRATUM — Design Tokens */
:root {
  /* Color */
  --color-bg:         ${P.bg};
  --color-surface:    ${P.surface};
  --color-surface-2:  ${P.surface2};
  --color-surface-3:  ${P.surface3};
  --color-border:     ${P.border};
  --color-border-2:   ${P.border2};
  --color-muted:      ${P.muted};
  --color-muted-2:    ${P.muted2};
  --color-fg:         ${P.fg};
  --color-accent:     ${P.accent};
  --color-accent-lo:  ${P.accentLo};
  --color-accent-hi:  ${P.accentHi};
  --color-green:      ${P.green};
  --color-red:        ${P.red};
  --color-amber:      ${P.amber};

  /* Typography */
  --font-sans:        'Inter Variable', 'Inter', -apple-system, sans-serif;
  --font-mono:        'SF Mono', 'Fira Code', monospace;
  --text-display:     44px / 1.0  var(--font-sans);  /* w800 */
  --text-title:       24px / 1.2  var(--font-sans);  /* w700 */
  --text-heading:     14px / 1.4  var(--font-sans);  /* w700, ls:2px */
  --text-body:        12px / 1.6  var(--font-sans);  /* w400-500 */
  --text-label:        9px / 1.0  var(--font-sans);  /* w700, ls:1.2px, uppercase */

  /* Spacing */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:  12px;
  --space-base: 16px;
  --space-lg:  20px;
  --space-xl:  24px;
  --space-2xl: 32px;
  --space-3xl: 48px;

  /* Radius */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-pill: 999px;
}`;

  const prdMd = `## Overview

STRATUM is a developer-facing operations hub for teams running AI agents in production. It provides real-time visibility into agent health, MCP tool connection status, event streams, and usage/cost analytics — all in a single, information-dense interface.

The design language is a direct homage to Linear.app's restraint philosophy: if a pixel doesn't communicate information, it shouldn't exist. Every color is a signal. Every badge is a decision.

## Target Users

- **Platform engineers** managing multi-agent AI infrastructure
- **AI product teams** building on MCP-compatible toolchains (GitHub, Slack, Linear, Postgres)
- **DevOps leads** tracking token spend, latency SLAs, and error rates across agent fleets

## Core Features

- **Hub Overview** — at-a-glance bento grid: active agents, tool calls/min, error rate, token spend; live activity feed
- **Agent Fleet** — filterable list of all deployed agents with status (RUNNING / IDLE / ERROR), model labels, call counts, and uptime
- **MCP Connections** — grid view of all connected tools with health indicators, sparkline call rates; status: HEALTHY / DEGRADED
- **Event Stream** — live chronological feed of agent actions (TOOL_CALL, LLM_CALL, ERROR, SYS) with latency and type badges
- **Usage & Quotas** — month-to-date spend vs budget, per-agent token consumption bars, quota utilisation progress

## Design Language

The palette is directly extracted from Linear.app (via browser CSS audit, darkmodedesign.com):
- **#08090A** — background (rgb(8,9,10), the darkest practical dark)
- **#5E6AD2** — accent (Linear's signature purple-blue, rgb(94,106,210))
- **#F7F8F8** — foreground (rgb(247,248,248), warm near-white)
- **Status semantic**: #2DB37F (healthy), #E5484D (error), #E09A21 (warning)

Typography: Inter Variable at weights 400/500/600/700/800 — never decorative fonts, always system-realistic.

Interaction pattern: tappable rows, pull-to-refresh event stream, filter chips, badge states. Every screen is operable with a thumb.

## Screen Architecture

1. **Hub Overview (screen 1)** — entry point / dashboard. Bento grid + live feed. Most visited screen.
2. **Agent Fleet (screen 2)** — operational view. Quick triage of failing agents.
3. **MCP Connections (screen 3)** — infrastructure health. Spot degraded tools before they cascade.
4. **Event Stream (screen 4)** — debugging / observability. Filter by type, scroll to correlate issues.
5. **Usage & Quotas (screen 5)** — cost governance. Token spend by agent, budget runway.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:${P.bg};color:${P.fg};font-family:-apple-system,'Inter','Segoe UI',system-ui,sans-serif;line-height:1.6}
a{color:${P.accentHi};text-decoration:none}a:hover{text-decoration:underline}
.container{max-width:960px;margin:0 auto;padding:0 24px}

.hero{padding:80px 0 60px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);
  width:700px;height:500px;background:radial-gradient(ellipse at 50% 40%,${P.accent}14 0%,${P.green}0A 55%,transparent 75%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${P.border2},transparent)}
.hero-tag{display:inline-block;padding:5px 16px;background:${P.accentLo};color:${P.accentHi};
  font-size:10px;font-weight:700;letter-spacing:2px;border-radius:20px;margin-bottom:28px;border:1px solid ${P.accent}40}
.hero-name{font-size:clamp(60px,13vw,110px);font-weight:900;letter-spacing:-3px;line-height:0.9;
  background:linear-gradient(150deg,${P.fg} 0%,${P.accentHi} 50%,${P.green}CC 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:20px;padding-bottom:8px}
.hero-tagline{font-size:clamp(14px,2.5vw,18px);color:${P.muted2};margin-bottom:8px;font-weight:300;letter-spacing:0.5px}
.hero-date{font-size:11px;color:${P.muted};letter-spacing:1.5px;margin-bottom:44px;text-transform:uppercase}
.hero-prompt{font-size:13px;color:${P.muted2};font-style:italic;max-width:700px;margin:0 auto 48px;
  line-height:1.9;padding:24px 28px;background:${P.surface};border-radius:12px;
  border:1px solid ${P.border};border-left:3px solid ${P.accent};text-align:left}

.actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:56px}
.btn{padding:10px 20px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;
  border:none;text-decoration:none;display:inline-flex;align-items:center;gap:8px;
  transition:all .15s;letter-spacing:0.5px}
.btn:hover{opacity:.85;text-decoration:none;transform:translateY(-1px)}
.btn-primary{background:linear-gradient(135deg,${P.accent},${P.accentHi});color:#fff}
.btn-mock{background:linear-gradient(135deg,${P.green}CC,${P.green});color:${P.bg}}
.btn-secondary{background:${P.surface2};color:${P.fg};border:1px solid ${P.border2}}
.btn-outline{background:transparent;color:${P.muted2};border:1px solid ${P.border}}

.screens-section{margin-bottom:72px}
.section-label{font-size:9px;font-weight:700;letter-spacing:2.5px;color:${P.muted};text-transform:uppercase;margin-bottom:20px}
.screens-strip{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px;scrollbar-width:thin;scrollbar-color:${P.border2} transparent}
.screens-strip::-webkit-scrollbar{height:4px}
.screens-strip::-webkit-scrollbar-thumb{background:${P.border2};border-radius:2px}

.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:72px}
@media(max-width:600px){.spec-grid{grid-template-columns:1fr}}
.spec-card{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px}
.spec-card h3{font-size:9px;font-weight:700;letter-spacing:2px;color:${P.muted};text-transform:uppercase;margin-bottom:20px}
.palette{display:flex;gap:8px;flex-wrap:wrap}

.tokens-section{margin-bottom:72px}
.tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px;position:relative}
.tokens-block pre{font-family:'SF Mono','Fira Code',monospace;font-size:11px;color:${P.muted2};overflow-x:auto;line-height:1.8;white-space:pre}
.copy-btn{position:absolute;top:16px;right:16px;background:${P.accentLo};color:${P.accentHi};
  border:1px solid ${P.accent}40;border-radius:6px;padding:6px 14px;font-size:10px;font-weight:700;letter-spacing:1px;cursor:pointer;transition:all .15s}
.copy-btn:hover{background:${P.accent};color:#fff}

.prd-section{margin-bottom:72px}
.prd-body{color:${P.muted2};font-size:14px;line-height:1.8}
.prd-body h3{font-size:16px;font-weight:700;color:${P.fg};margin:28px 0 12px}
.prd-body p{margin-bottom:14px}.prd-body ul{padding-left:20px;margin-bottom:14px}
.prd-body li{margin-bottom:6px}.prd-body strong{color:${P.fg}}

.footer{padding:56px 0;border-top:1px solid ${P.border};text-align:center;color:${P.muted};font-size:12px}
.footer a{color:${P.muted}}.footer a:hover{color:${P.muted2}}
</style>
</head>
<body>
<div class="container">
  <div class="hero">
    <div class="hero-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
    <div class="hero-name">${APP_NAME}</div>
    <div class="hero-tagline">${TAGLINE}</div>
    <div class="hero-date">Design Heartbeat · Linear Dark × MCP Infrastructure · Agentic Ops</div>
    <div class="hero-prompt">${ORIGINAL_PROMPT}</div>
    <div class="actions">
      <a href="${viewerURL}" class="btn btn-primary" target="_blank">▶ Open in Viewer</a>
      <a href="${mockURL}" class="btn btn-mock" target="_blank">✦ Try Interactive Mock</a>
      <a href="data:application/json;base64,${penEncoded}" download="stratum.pen" class="btn btn-secondary">↓ Download .pen</a>
      <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.querySelector('.hero-prompt').textContent.trim()).then(()=>this.textContent='✓ Copied!')">⎘ Copy Prompt</button>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}" class="btn btn-outline" target="_blank">𝕏 Share</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">⬡ Gallery</a>
    </div>
  </div>

  <div class="screens-section">
    <div class="section-label">5 Screens — Hub · Fleet · MCP Tools · Events · Usage</div>
    <div class="screens-strip">${thumbsHTML}</div>
  </div>

  <div class="spec-grid">
    <div class="spec-card"><h3>Color Palette</h3><div class="palette">${swatchHTML}</div></div>
    <div class="spec-card"><h3>Type Scale</h3>${typeScaleHTML}</div>
    <div class="spec-card"><h3>Spacing System</h3>${spacingHTML}</div>
    <div class="spec-card"><h3>Design Principles</h3>${principlesHTML}</div>
  </div>

  <div class="tokens-section">
    <div class="section-label">CSS Design Tokens</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.querySelector('.tokens-block pre').textContent).then(()=>this.textContent='✓ Copied!')">COPY TOKENS</button>
      <pre>${cssTokens}</pre>
    </div>
  </div>

  <div class="prd-section">
    <div class="section-label">Product Brief / PRD</div>
    <div class="spec-card"><div class="prd-body">${mdToHtml(prdMd)}</div></div>
  </div>

  <div class="footer">
    <p>Built by <strong style="color:${P.muted2}">RAM Design Studio</strong> · Heartbeat ${DATE_STR}</p>
    <p style="margin-top:8px">
      <a href="https://ram.zenbin.org/gallery">← Gallery</a> ·
      <a href="${viewerURL}">Viewer →</a> ·
      <a href="${mockURL}">Interactive Mock →</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

// ── Viewer HTML builder ────────────────────────────────────────────────────────
function buildViewerHTML(pen) {
  const penJson = JSON.stringify(pen);
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'axon-viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main pipeline ──────────────────────────────────────────────────────────────
async function main() {
  console.log('=== STRATUM Design Discovery Pipeline ===\n');

  const penPath = path.join(__dirname, 'stratum.pen');
  const pen     = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded pen: ${pen.children.length} screens`);

  // [1] Hero page
  const heroHTML = buildHeroHTML(pen);
  console.log(`\n[1/4] Hero HTML: ${(heroHTML.length / 1024).toFixed(1)} KB`);
  console.log('[2/4] Publishing hero → ram.zenbin.org/' + SLUG);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`  → ${heroRes.status}  ${heroRes.body.slice(0, 120)}`);

  // [2] Viewer
  console.log('\n[3/4] Building + publishing viewer…');
  const viewerHTML = buildViewerHTML(pen);
  console.log(`  Viewer HTML: ${(viewerHTML.length / 1024).toFixed(1)} KB`);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`  → ${viewerRes.status}  ${viewerRes.body.slice(0, 120)}`);

  // [3] Gallery queue
  console.log('\n[4/4] Updating gallery queue…');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id:           `heartbeat-stratum-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${MOCK_SLUG}`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    }
  }, putBody);
  console.log(`  → Gallery: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 150)}`);

  console.log('\n✓ Pipeline complete!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${MOCK_SLUG}  (run stratum-mock.mjs next)`);
}

main().catch(console.error);
