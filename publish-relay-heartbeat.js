'use strict';
// publish-relay-heartbeat.js
// RELAY — AI Agent Fleet Commander
// Design Heartbeat — Mar 19, 2026
// Inspired by:
//   • Linear.app "product development for teams AND agents" (darkmodedesign.com)
//   • Runlayer "Enterprise MCPs, Skills & Agents" (land-book.com)
//   • Silencio.es brutalist visual language store (godly.website)
//   • Midday.ai near-void dark finance dashboard (darkmodedesign.com)

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

async function getQueueSha() {
  const r = await new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.end();
  });
  if (r.status !== 200) throw new Error('Cannot get SHA: ' + r.status);
  return JSON.parse(r.body).sha;
}

async function pushGalleryEntry(entry) {
  let queue;
  try {
    const raw = await new Promise((resolve) => {
      const opts = {
        hostname: 'raw.githubusercontent.com',
        path: `/${GITHUB_REPO}/main/queue.json`,
        method: 'GET',
        headers: { 'User-Agent': 'design-studio-agent/1.0' },
      };
      const req = https.request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(d));
      });
      req.on('error', () => resolve('{"submissions":[]}'));
      req.end();
    });
    queue = JSON.parse(raw);
  } catch { queue = { submissions: [] }; }

  queue.submissions.push(entry);
  const sha = await getQueueSha();
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `add: relay-heartbeat — AI agent operations console design`,
    content,
    sha,
  });
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

// ── Design constants ──────────────────────────────────────────────────────────
const SLUG     = 'relay-heartbeat';
const APP_NAME = 'RELAY';
const TAGLINE  = 'AI Agent Fleet Commander. Spawn, monitor, and coordinate your entire AI agent stack from one dark console.';
const DATE_STR = 'March 19, 2026';

const P = {
  bg:      '#070b0f',
  surface: '#0d1117',
  card:    '#141c26',
  border:  '#1e2d3d',
  border2: '#263546',
  muted:   '#3d5068',
  fg:      '#e6edf3',
  fg2:     '#8b949e',
  fg3:     '#4d5d6b',
  blue:    '#58a6ff',
  green:   '#3fb950',
  yellow:  '#d29922',
  red:     '#f85149',
  purple:  '#bc8cff',
  cyan:    '#39c5cf',
};

// ── Read the .pen file ────────────────────────────────────────────────────────
const penJson  = fs.readFileSync(path.join(__dirname, 'relay-app.pen'), 'utf8');
const penData  = JSON.parse(penJson);
const screens  = penData.children || [];

// ── SVG renderer ──────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || c === 'none') return 'none';
  if (c === '#00000000') return 'none';
  if (c.length === 9) {
    const a = parseInt(c.slice(7, 9), 16) / 255;
    return `rgba(${parseInt(c.slice(1,3),16)},${parseInt(c.slice(3,5),16)},${parseInt(c.slice(5,7),16)},${a.toFixed(2)})`;
  }
  return c;
}

function rn(n, ox, oy) {
  if (!n || typeof n !== 'object') return '';
  const nx = (n.x || 0) + ox, ny = (n.y || 0) + oy;
  const w = n.width || 0, h = n.height || 0;
  const op = n.opacity !== undefined ? n.opacity : 1;
  const r  = n.cornerRadius || 0;
  let out  = '';

  if (n.type === 'frame' || n.type === 'group') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    const cid = n.clip ? 'cl' + n.id : '';
    if (cid) out += `<defs><clipPath id="${cid}"><rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>`;
    out += `<rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
    const inner = (n.children || []).map(c => rn(c, nx, ny)).join('');
    out += cid ? `<g clip-path="url(#${cid})">${inner}</g>` : inner;
  } else if (n.type === 'rectangle') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    out += `<rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
  } else if (n.type === 'ellipse') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    out += `<ellipse cx="${nx + w/2}" cy="${ny + h/2}" rx="${w/2}" ry="${h/2}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
  } else if (n.type === 'text') {
    const fs = n.fontSize || 12, fw = n.fontWeight || '400';
    const ta = n.textAlign || 'left';
    let ax = nx;
    if (ta === 'center') ax = nx + w / 2;
    else if (ta === 'right') ax = nx + w;
    const anchor = ta === 'center' ? 'middle' : ta === 'right' ? 'end' : 'start';
    const lh = n.lineHeight || (fs * 1.3);
    const ls = n.letterSpacing ? `letter-spacing="${n.letterSpacing}"` : '';
    (n.content || '').split('\n').forEach((line, li) => {
      out += `<text x="${ax}" y="${ny + fs + li * lh}" font-size="${fs}" font-weight="${fw}" font-family="'SF Mono','Fira Code',monospace" fill="${sc(n.fill || P.fg)}" text-anchor="${anchor}" dominant-baseline="auto" opacity="${op}" ${ls}>${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    });
  }
  return out;
}

function screenSVG(screen, thumbW, thumbH) {
  const sw = screen.width || 375, sh = screen.height || 812;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0)).join('');
  const bg = sc(screen.fill || P.bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:10px;overflow:hidden;box-shadow:0 0 0 1px ${P.border}"><rect width="${sw}" height="${sh}" fill="${bg}"/>${content}</svg>`;
}

// ── Screen thumbnails ─────────────────────────────────────────────────────────
const MOBILE_NAMES  = ['Fleet Dashboard', 'Agent Detail', 'Workflow Builder', 'Event Logs', 'Spawn Agent'];
const DESKTOP_NAMES = ['Fleet Dashboard', 'Workflow Builder', 'Event Logs', 'Configuration', 'Spawn Modal'];

const mobileScreens  = screens.slice(0, 5);
const desktopScreens = screens.slice(5, 10);

const mobileThumbsHTML = mobileScreens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, 140, 302)}
    <div style="font-size:9px;color:${P.muted};margin-top:8px;letter-spacing:1.5px;font-weight:600">M · ${MOBILE_NAMES[i].toUpperCase()}</div>
  </div>`
).join('');

const desktopThumbsHTML = desktopScreens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, 280, 168)}
    <div style="font-size:9px;color:${P.muted};margin-top:8px;letter-spacing:1.5px;font-weight:600">D · ${DESKTOP_NAMES[i].toUpperCase()}</div>
  </div>`
).join('');

// ── CSS Tokens ────────────────────────────────────────────────────────────────
const surface2 = '#141c26';
const border2  = '#263546';

const cssTokens = `:root {
  /* Color — Agent Operations Palette */
  --color-bg:         ${P.bg};
  --color-surface:    ${P.surface};
  --color-card:       ${P.card};
  --color-border:     ${P.border};
  --color-fg:         ${P.fg};
  --color-fg2:        ${P.fg2};
  --color-primary:    ${P.blue};
  --color-success:    ${P.green};
  --color-warning:    ${P.yellow};
  --color-danger:     ${P.red};
  --color-ai:         ${P.purple};
  --color-tool:       ${P.cyan};

  /* Typography */
  --font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:  900 clamp(48px, 8vw, 96px) / 1 var(--font-family);
  --font-heading:  700 24px / 1.3 var(--font-family);
  --font-body:     400 14px / 1.6 var(--font-family);
  --font-caption:  600 10px / 1 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 14px;  --radius-full: 9999px;

  /* Agent status colors */
  --status-running: ${P.green};
  --status-idle:    ${P.yellow};
  --status-done:    ${P.fg3};
  --status-error:   ${P.red};

  /* Shadows */
  --shadow-card: 0 0 0 1px ${P.border}, 0 4px 16px rgba(0,0,0,0.4);
  --glow-primary: 0 0 20px ${P.blue}33;
}`;

// ── Share text ────────────────────────────────────────────────────────────────
const shareText = encodeURIComponent(
  `RELAY — AI Agent Fleet Commander. Dark-mode ops console for spawning and monitoring AI agents. 10 screens + brand spec. By RAM Design Studio`
);

// ── PRD ───────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>RELAY is a dark-mode AI agent operations platform for one-person companies and indie builders who run multiple AI agents as part of their daily workflow. It provides a single console to spawn agents (Claude, GPT-4o, etc.), connect them to MCP tools (filesystem, web-fetch, Slack, GitHub), wire them into visual workflows, and monitor their real-time activity — all in a near-void dark UI inspired by Linear's "for teams and agents" paradigm.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Indie hackers &amp; solo founders</strong> running AI-assisted research, content, and analysis pipelines</li>
<li><strong>AI-first startups</strong> that use agents as background workers rather than hiring humans for repetitive tasks</li>
<li><strong>Developers</strong> who want a visual layer over their MCP server stack without building custom dashboards</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Agent Fleet</strong> — bento grid of live agents with status indicators, CPU/memory bars, token usage, and current task</li>
<li><strong>Workflow Builder</strong> — visual DAG editor to connect agents into reusable flows (trigger → agent → agent → notify)</li>
<li><strong>Event Logs</strong> — real-time structured log stream with level filtering (INFO / WARN / ERROR / TOOL), searchable, alert-pinned</li>
<li><strong>Agent Spawn</strong> — form to configure and launch new agents: model selector, system prompt, MCP tool toggles, limits</li>
<li><strong>Configuration</strong> — API key management per provider, MCP server toggles, fleet-wide rate limits and cost caps</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Near-void dark</strong> (#070b0f) — deeper than GitHub dark, signals "serious infrastructure" not "consumer app"</li>
<li><strong>Electric blue primary</strong> (#58a6ff) — Linear/GitHub-inspired, familiar for developer tools</li>
<li><strong>Status-coded agents</strong> — green=running, amber=idle, dim=done, red=error, immediately scannable</li>
<li><strong>Monospace type throughout</strong> — reinforces precision, data density, and CLI heritage</li>
<li><strong>Bento grid layout</strong> — agent cards in a grid rather than a list, richer information density per viewport</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>M1 / D1 — Fleet Dashboard:</strong> live bento grid of all agents with status, task, CPU, memory, tokens, runtime</li>
<li><strong>M2 / D2 — Workflow Builder:</strong> visual DAG editor with node inspector panel (sidebar on desktop)</li>
<li><strong>M3 / D3 — Event Logs:</strong> structured log stream with level chips, agent attribution, alert banner for errors</li>
<li><strong>M4 / D4 — Configuration:</strong> API key fields per provider, MCP server toggles, fleet-wide limits</li>
<li><strong>M5 / D5 — Spawn Agent:</strong> two-column form with model picker, system prompt, tool toggles, flow connection</li>
</ul>
`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewerHTML() {
  const viewerPath = path.join(__dirname, 'viewer.html');
  let viewerHtml = fs.existsSync(viewerPath) ? fs.readFileSync(viewerPath, 'utf8') : null;
  if (!viewerHtml) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${APP_NAME} Viewer</title></head><body style="background:#070b0f;color:#e6edf3;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
    <div style="text-align:center"><div style="font-size:32px;font-weight:900;letter-spacing:4px;margin-bottom:12px">RELAY</div><div style="opacity:.5">Viewer not available</div><br><a href="https://ram.zenbin.org/${SLUG}" style="color:#58a6ff">← Back to Design Page</a></div></body></html>`;
  }
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RELAY — AI Agent Fleet Commander · RAM Design Studio</title>
<meta name="description" content="RELAY — AI Agent Operations Console. 10-screen dark design system for spawning and monitoring AI agent fleets. Brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(12px);z-index:100}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px}
  .logo span{color:${P.blue}}
  .nav-tag{font-size:9px;color:${P.blue};letter-spacing:2px;font-weight:700}
  .nav-live{display:flex;align-items:center;gap:6px}
  .live-dot{width:6px;height:6px;border-radius:50%;background:${P.green};animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .ticker{overflow:hidden;background:${P.surface};border-bottom:1px solid ${P.border};padding:7px 0}
  .ticker-inner{display:flex;gap:56px;white-space:nowrap;animation:ticker 28s linear infinite}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .ticker-item{font-size:9px;color:${P.blue};font-weight:700;letter-spacing:1px}
  .hero{padding:80px 40px 48px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.blue};margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(56px,9vw,108px);font-weight:900;letter-spacing:-4px;line-height:0.95;margin-bottom:24px}
  h1 em{color:${P.blue};font-style:normal}
  .sub{font-size:15px;color:${P.fg2};max-width:520px;line-height:1.7;margin-bottom:40px}
  .meta{display:flex;gap:36px;margin-bottom:48px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.muted};letter-spacing:1.5px;margin-bottom:4px;font-weight:600}
  .meta-item strong{color:${P.blue};font-size:12px}
  .actions{display:flex;gap:10px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;transition:all .15s}
  .btn-p{background:${P.blue};color:${P.bg}}
  .btn-p:hover{background:${P.blue}cc}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-s:hover{border-color:${P.blue}88;color:${P.blue}}
  .btn-x{background:#000;color:#fff;border:1px solid #1e1e1e}
  .section-wrap{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.blue};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${P.border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px;margin-bottom:40px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-thumb{background:${P.blue}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border};max-width:920px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:700px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .swatch{flex:1;min-width:60px}
  .swatch-box{height:56px;border-radius:8px;margin-bottom:8px}
  .swatch-role{font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:3px;font-weight:600}
  .swatch-hex{font-size:11px;font-weight:700;color:${P.blue}}
  .type-row{padding:12px 0;border-bottom:1px solid ${P.border}}
  .type-label{font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:6px;font-weight:600}
  .spacing-row{display:flex;align-items:center;gap:14px;margin-bottom:9px}
  .spacing-px{font-size:9px;color:${P.muted};width:32px;flex-shrink:0}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${P.fg};opacity:.6;white-space:pre;overflow-x:auto}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.blue}1a;border:1px solid ${P.blue}44;color:${P.blue};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.blue}33}
  .prompt-section{padding:40px;border-top:1px solid ${P.border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.blue};margin-bottom:14px;font-weight:700}
  .p-text{font-size:18px;color:${P.fg2};font-style:italic;max-width:620px;line-height:1.65}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:760px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.blue};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${P.fg2};line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${P.fg};font-weight:600}
  footer{padding:28px 40px;border-top:1px solid ${P.border};font-size:11px;color:${P.muted};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.blue};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM<span>.</span>DESIGN STUDIO</div>
  <div style="display:flex;align-items:center;gap:20px">
    <div class="nav-live"><div class="live-dot"></div><span style="font-size:9px;color:${P.green};font-weight:700;letter-spacing:1px">LIVE</span></div>
    <span class="nav-tag">HEARTBEAT · ${DATE_STR.toUpperCase()}</span>
  </div>
</nav>

<div class="ticker">
  <div class="ticker-inner">
    ${['RELAY · AI AGENT FLEET COMMANDER', 'INSPIRED BY: LINEAR · RUNLAYER · MIDDAY · SILENCIO',
       'DARK MODE · 10 SCREENS · 1488 ELEMENTS', 'BENTO GRID AGENT CARDS',
       'MCP TOOL INTEGRATION', 'VISUAL WORKFLOW BUILDER', 'REAL-TIME LOG STREAM',
       'CSS DESIGN TOKENS · COPY-READY',
       'RELAY · AI AGENT FLEET COMMANDER', 'INSPIRED BY: LINEAR · RUNLAYER · MIDDAY · SILENCIO',
       'DARK MODE · 10 SCREENS · 1488 ELEMENTS', 'BENTO GRID AGENT CARDS',
       'MCP TOOL INTEGRATION', 'VISUAL WORKFLOW BUILDER', 'REAL-TIME LOG STREAM',
       'CSS DESIGN TOKENS · COPY-READY']
      .map(t => `<span class="ticker-item">${t}</span>`).join('')}
  </div>
</div>

<section class="hero">
  <div class="tag">AI AGENT OPERATIONS · DARK CONSOLE · 10 SCREENS (5 MOBILE + 5 DESKTOP)</div>
  <h1>RE<em>LAY</em></h1>
  <p class="sub">${TAGLINE}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5M + 5D)</strong></div>
    <div class="meta-item"><span>ELEMENTS</span><strong>1,488</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>LINEAR · RUNLAYER</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">▶ Open in Viewer</a>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="section-wrap">
  <div class="section-label">MOBILE SCREENS · 375×812 · AGENT OPS ON THE GO</div>
  <div class="thumbs">${mobileThumbsHTML}</div>
  <div class="section-label">DESKTOP SCREENS · 1280×780 · FULL COMMAND CONSOLE</div>
  <div class="thumbs">${desktopThumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:600">COLOR PALETTE</div>
      <div class="swatches">
        ${[
          { hex: P.bg,      role: 'BACKGROUND' },
          { hex: P.surface, role: 'SURFACE'    },
          { hex: P.fg,      role: 'FOREGROUND' },
          { hex: P.blue,    role: 'PRIMARY'    },
          { hex: P.green,   role: 'SUCCESS'    },
          { hex: P.red,     role: 'DANGER'     },
          { hex: P.purple,  role: 'AI MODEL'   },
          { hex: P.cyan,    role: 'TOOL CALL'  },
        ].map(sw => `
          <div class="swatch">
            <div class="swatch-box" style="background:${sw.hex};border:1px solid ${P.border}"></div>
            <div class="swatch-role">${sw.role}</div>
            <div class="swatch-hex">${sw.hex}</div>
          </div>`).join('')}
      </div>
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:0;font-weight:600">TYPE SCALE</div>
      ${[
        { label:'DISPLAY',  size:'48px', weight:'900', sample: 'RELAY' },
        { label:'HEADING',  size:'24px', weight:'700', sample: 'Agent Fleet Commander' },
        { label:'BODY',     size:'13px', weight:'400', sample: 'Spawning RESEARCHER-02 with gpt-4o...' },
        { label:'CAPTION',  size:'9px',  weight:'600', sample: 'STATUS · RUNNING · 4M 12S ELAPSED' },
      ].map(t => `
        <div class="type-row">
          <div class="type-label">${t.label} · ${t.size} / ${t.weight}</div>
          <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
        </div>`).join('')}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:600">SPACING SYSTEM · 4PX BASE GRID</div>
      ${[4,8,16,24,32,48,64].map(sp => `
        <div class="spacing-row">
          <div class="spacing-px">${sp}px</div>
          <div style="height:8px;border-radius:3px;background:${P.blue};width:${sp * 2}px;opacity:.7"></div>
        </div>`).join('')}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:600">DESIGN PRINCIPLES</div>
      ${[
        ['01', 'Agent-first information hierarchy — status and health are always visible without interaction.'],
        ['02', 'Near-void dark base — #070b0f signals infrastructure, not consumer. Deeper than GitHub dark.'],
        ['03', 'Color = semantic state. Blue=primary, green=running, amber=idle, red=error. Never decorative.'],
        ['04', 'Monospace throughout — reinforces precision, data density, and terminal-native heritage.'],
      ].map(([n, text]) => `
        <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
          <div style="color:${P.blue};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px">${n}</div>
          <div style="font-size:12px;color:${P.fg2};line-height:1.65">${text}</div>
        </div>`).join('')}
    </div>

  </div>

  <div class="tokens-block">
    <button class="copy-btn" id="copy-tokens-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"Design RELAY — a dark-mode AI agent operations console for one-person companies. Inspired by Linear's agent paradigm (darkmodedesign.com) and Runlayer's enterprise MCP/Skills/Agents stack (land-book.com). One place to spawn, monitor, and wire together your entire AI agent fleet."</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${prd}
</section>

<footer>
  <span>RAM Design Studio · Production-ready in one prompt · ${DATE_STR}</span>
  <a href="https://ram.zenbin.org/gallery" style="color:${P.muted}">ram.zenbin.org/gallery</a>
</footer>

<script>
const PROMPT = 'Design RELAY \u2014 a dark-mode AI agent operations console for one-person companies. Inspired by Linear\'s agent paradigm (darkmodedesign.com) and Runlayer\'s enterprise MCP/Skills/Agents stack (land-book.com). One place to spawn, monitor, and wire together your entire AI agent fleet.';

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg + ' \u2713';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function openInViewer() { window.open('https://ram.zenbin.org/${SLUG}-viewer', '_blank'); }

function downloadPen() {
  // .pen download available via viewer
  window.open('https://ram.zenbin.org/${SLUG}-viewer', '_blank');
  showToast('Opening viewer for .pen download');
}

function copyPrompt() {
  navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied'));
}

function copyTokens() {
  const text = document.getElementById('tokens-pre').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('CSS tokens copied');
    document.getElementById('copy-tokens-btn').textContent = 'COPIED \u2713';
    setTimeout(() => { document.getElementById('copy-tokens-btn').textContent = 'COPY TOKENS'; }, 2000);
  });
}

function shareOnX() {
  window.open('https://x.com/intent/tweet?text=${shareText}&url=' + encodeURIComponent('https://ram.zenbin.org/${SLUG}'), '_blank');
}
</script>
</body>
</html>`;

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Publishing RELAY — AI Agent Fleet Commander');
  console.log(`   Slug: ${SLUG}`);

  // 1. Publish hero page
  console.log('\n1. Publishing hero page → ram.zenbin.org/' + SLUG);
  const heroRes = await post(SLUG, `RELAY — AI Agent Fleet Commander · RAM Design Studio`, heroHTML, 'ram');
  console.log(`   Status: ${heroRes.status} — ${heroRes.status === 200 ? '✓ OK' : heroRes.body.substring(0, 80)}`);

  // 2. Publish viewer
  console.log('\n2. Publishing viewer → ram.zenbin.org/' + SLUG + '-viewer');
  const viewerHTML = buildViewerHTML();
  const viewerRes = await post(SLUG + '-viewer', `RELAY Viewer · RAM Design Studio`, viewerHTML, 'ram');
  console.log(`   Status: ${viewerRes.status} — ${viewerRes.status === 200 ? '✓ OK' : viewerRes.body.substring(0, 80)}`);

  // 3. Push gallery entry
  console.log('\n3. Pushing gallery entry to GitHub queue...');
  try {
    const galleryEntry = {
      id: 'heartbeat-relay-' + Date.now(),
      slug: SLUG,
      app_name: APP_NAME,
      tagline: TAGLINE,
      design_url: `https://ram.zenbin.org/${SLUG}`,
      viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
      archetype: 'SaaS Dashboard',
      screens: 10,
      submitted_at: new Date().toISOString(),
      source: 'heartbeat',
      palette: {
        bg: P.bg, fg: P.fg, accent: P.blue, accent2: P.green,
      },
      inspiration: 'Linear (darkmodedesign.com), Runlayer (land-book.com), Silencio.es (godly.website)',
    };
    const galleryRes = await pushGalleryEntry(galleryEntry);
    console.log(`   Status: ${galleryRes.status} — ${galleryRes.status === 200 ? '✓ Gallery updated' : galleryRes.body?.substring(0, 80)}`);
  } catch (e) {
    console.warn('   ⚠ Gallery push failed:', e.message);
  }

  console.log('\n✅ RELAY published!');
  console.log(`   Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
