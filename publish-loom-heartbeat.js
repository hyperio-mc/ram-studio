'use strict';
// publish-loom-heartbeat.js
// Full Design Discovery pipeline for LOOM heartbeat design
// Publishes: hero page → ram.zenbin.org/loom
//            viewer   → ram.zenbin.org/loom-viewer
//            gallery  → hyperio-mc/design-studio-queue
//
// Challenge: Dark-mode AI agent orchestration platform — bento grid mission
// control UI inspired by Midday.ai (darkmodedesign.com), JetBrains Air
// (lapa.ninja), and Locomotive.ca (godly.website). Mar 20 2026.

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'loom';
const VIEWER_SLUG = 'loom-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'LOOM',
  tagline:   'Orchestrate AI agents. Weave intelligent workflows.',
  archetype: 'AI Agent Orchestration Platform',
  palette: {
    bg:      '#07080F',
    fg:      '#E8EAFF',
    accent:  '#00D9C8',
    accent2: '#7B5CF0',
    amber:   '#F59E0B',
    red:     '#F43F5E',
    green:   '#22C55E',
    blue:    '#3B82F6',
  },
};

const sub = {
  id:           'heartbeat-loom',
  prompt:       'Design a dark-mode AI agent orchestration platform called LOOM — inspired by Midday.ai\'s financial-precision dark aesthetic (darkmodedesign.com, Mar 20 2026), JetBrains Air\'s "multitask with agents, stay in control" bento grid UI (lapa.ninja), and Locomotive.ca\'s editorial boldness (godly.website). Palette: near-void #07080F + teal #00D9C8 + purple #7B5CF0 + amber #F59E0B. 10 screens: 5 mobile (Dashboard, Canvas, Agent Detail, Logs, Pricing) + 5 desktop equivalents. Bento grid mission control with live agent cards, visual workflow canvas, terminal logs.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Dashboard', 'Canvas', 'Agent Detail', 'Logs', 'Pricing'],
  markdown: `## Overview
LOOM is an AI agent orchestration platform that gives developers and product teams a mission-control dashboard to design, deploy, and monitor autonomous AI agents at scale — without managing infrastructure. Agents are visual nodes on a canvas; pipelines are connected flows; execution is real-time and observable.

## Target Users
- **AI-native developers** building multi-agent pipelines with LLMs
- **Product teams** automating business workflows with AI agents
- **Platform engineers** who need observability and reliability for AI workloads
- **Startups** wanting enterprise-grade AI orchestration without the ops burden

## Core Features
- **Visual Workflow Canvas** — Drag-and-drop nodes for triggers, agents, transforms, and outputs. No YAML, no config files
- **Real-time Agent Monitor** — Live status, throughput, error rate, queue depth, latency — per agent
- **Terminal-grade Execution Logs** — Full log stream with INFO/WARN/ERR filtering, live tail, download
- **Bento Dashboard** — Mission-control grid showing all agents at a glance with key metrics
- **Zero-config Deploy** — Connect your LLM API key, define your agent, press run
- **Auto-scaling** — Agents scale from 1 to 1,000 concurrent executions automatically
- **200+ Integrations** — OpenAI, Anthropic, Mistral, GitHub, Slack, Notion, Airtable, Postgres, and more

## Design Language
Inspired by three specific sources found during research on **March 20, 2026**:

1. **Midday.ai** (darkmodedesign.com) — The financial-grade precision dark SaaS aesthetic: near-void backgrounds, teal/emerald data accents, high-density information cards, frosted glass surfaces. This is the primary palette inspiration — teal #00D9C8 against #07080F creates the same financial-precision trust signal that Midday uses for transaction data.

2. **JetBrains Air** on Lapa Ninja — "Multitask with agents, stay in control" is exactly LOOM's positioning. The agent-centric bento grid, multi-pane UI, and status chips translate directly into LOOM's dashboard architecture. This was the conceptual anchor for the information hierarchy.

3. **Locomotive.ca** (godly.website) — The Montreal agency's editorial boldness: enormous display type, confident product positioning, "always shipping" energy. Influenced LOOM's hero headline ("ORCHESTRATE / AI AGENTS. / AT SCALE.") and the typographic confidence of the landing page.

**Signature design innovation:** The bento grid mission-control layout — each cell is a live monitoring tile for a different aspect of the system. This is RAM's first infrastructure/developer tool design, moving beyond social and consumer apps into the agent infrastructure space.

## Screen Architecture
### Mobile (390×844)
1. **Dashboard** — System health banner + headline + 3-stat metric row + live agent bento cards (SCOUT, FORGE, NEXUS, HERALD)
2. **Canvas** — Visual workflow node editor with trigger → agents → transform → output chain + toolbar
3. **Agent Detail** — SCOUT hero stat (1,204 tasks) + metric tiles + throughput sparkline chart + recent executions list
4. **Logs** — Terminal execution log with INFO/WARN/ERR filter chips + live tail + timestamp + level badges
5. **Pricing** — Monthly/annual toggle + PILOT (Free) / CONTROL ($49) / COMMAND ($199) tier cards

### Desktop (1440×900)
6. **Landing** — Editorial hero ("ORCHESTRATE AI AGENTS. AT SCALE.") + feature chips + large bento agent table preview
7. **Features** — Full bento grid: visual canvas demo + 98.3% metric + real-time logs + auto-scaling + integrations row + CTA
8. **Agent Monitor** — Left sidebar nav + top stat row + throughput chart + config panel + execution log stream
9. **Workflow Canvas** — Sidebar + toolbar + draggable node canvas with multi-branch pipeline + right inspector panel
10. **Pricing** — 3-column plan cards (PILOT/CONTROL/COMMAND) + trust badges row`,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

function getJson(hostname, path_, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path: path_, method: 'GET',
      headers: { 'User-Agent': 'design-studio-agent/1.0', ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.end();
  });
}

function put(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 7) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = (typeof el.fill === 'string') ? el.fill : 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';

  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const strokeEl = (el.stroke && el.stroke.fill) ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${el.stroke.fill}" stroke-width="${el.stroke.thickness || 1}"${rAttr}/>` : '';
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>${strokeEl}`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.65));
    const tf = (typeof fill === 'string' && fill !== 'none' && fill !== 'transparent') ? fill : meta.palette.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.88}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  const bg = (typeof screen.fill === 'string') ? screen.fill : meta.palette.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${bg}"/>${kids}</svg>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111111').replace('#', ''), 16);
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
    .replace(/`([^`]+)`/g, '<code style="background:#141622;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul style="padding-left:18px;margin:6px 0">$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup])/gm, '<p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens  = doc.children || [];
  const surface  = lightenHex(meta.palette.bg, 12);
  const border   = lightenHex(meta.palette.bg, 26);
  const muted    = lightenHex(meta.palette.bg, 70);
  const THUMB_H  = 190;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = prd.screenNames[i % 5]
      ? `${isMobile ? 'M' : 'D'} · ${prd.screenNames[i % 5]}`
      : `${isMobile ? 'MOBILE' : 'DESKTOP'} ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${meta.palette.fg}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatchHTML = [
    { hex: meta.palette.bg,     role: 'VOID BLACK'  },
    { hex: surface,             role: 'SURFACE'      },
    { hex: meta.palette.fg,     role: 'FOREGROUND'   },
    { hex: meta.palette.accent, role: 'TEAL PRIMARY' },
    { hex: meta.palette.accent2,role: 'PURPLE'       },
    { hex: meta.palette.amber,  role: 'AMBER'        },
    { hex: meta.palette.green,  role: 'SUCCESS'      },
  ].map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:10px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px;color:${meta.palette.fg}">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '52px', weight: '900', sample: 'LOOM' },
    { label: 'HEADLINE', size: '24px', weight: '800', sample: 'Orchestrate AI agents. Weave intelligent workflows.' },
    { label: 'SUBHEAD',  size: '16px', weight: '600', sample: 'Mission Control · Live Agents · Visual Canvas' },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'Design, deploy, and monitor autonomous AI agents at scale.' },
    { label: 'LABEL',    size: '10px', weight: '700', sample: 'AGENT STATUS · QUEUE DEPTH · LATENCY · THROUGHPUT' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:8px;color:${meta.palette.fg}">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;color:${meta.palette.fg}">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2.2}px;opacity:0.7"></div>
    </div>`).join('');

  const designPrinciplesHTML = [
    ['Mission Precision', 'Every pixel earns its place. Information density maximised, cognitive load minimised. Like a cockpit, not a toy.'],
    ['Teal as Signal', 'The teal accent (#00D9C8) is never decorative — it always means "alive, active, or primary action." Silence is dark.'],
    ['Bento as Architecture', 'Cards are self-contained intelligence cells. The grid IS the product. Each cell answers one specific question about your system.'],
    ['Darkness with Warmth', 'Near-void #07080F is not cold — the ambient teal glows give it a living-system feel, like a server room at 3am.'],
  ].map(([title, desc]) => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:11px;font-weight:700;color:${meta.palette.fg};margin-bottom:6px">${title}</div>
      <div style="font-size:12px;opacity:.5;line-height:1.6">${desc}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — LOOM Design System */
  --color-bg:        ${meta.palette.bg};
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        ${meta.palette.fg};
  --color-teal:      ${meta.palette.accent};
  --color-purple:    ${meta.palette.accent2};
  --color-amber:     ${meta.palette.amber};
  --color-green:     ${meta.palette.green};
  --color-red:       ${meta.palette.red};
  --color-muted:     ${muted};

  /* Semantic */
  --color-primary:   var(--color-teal);
  --color-secondary: var(--color-purple);
  --color-success:   var(--color-green);
  --color-warning:   var(--color-amber);
  --color-danger:    var(--color-red);
  --color-live:      var(--color-green);

  /* Bento system */
  --bento-radius: 14px;
  --bento-gap:    16px;
  --bento-pad:    24px;

  /* Agent status colors */
  --status-running: var(--color-green);
  --status-idle:    var(--color-amber);
  --status-paused:  var(--color-muted);
  --status-error:   var(--color-red);

  /* Typography */
  --font-family:  -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 900 clamp(42px, 7vw, 82px) / 1.0 var(--font-family);
  --font-heading: 800 clamp(20px, 2.5vw, 32px) / 1.2 var(--font-family);
  --font-subhead: 600 16px / 1.4 var(--font-family);
  --font-body:    400 14px / 1.6 var(--font-family);
  --font-label:   700 10px / 1 var(--font-family);
  --font-metric:  900 24px / 1 var(--font-family);
  --font-log:     400 11px / 1.5 var(--font-mono);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 14px;
  --radius-xl: 18px; --radius-pill: 9999px;

  /* Shadows & glows */
  --glow-teal:   0 0 40px ${meta.palette.accent}18;
  --glow-purple: 0 0 40px ${meta.palette.accent2}18;
  --shadow-card: 0 2px 12px rgba(0,0,0,0.6), 0 0 0 1px ${border};
}`;

  const shareText = encodeURIComponent(
    `LOOM — AI Agent Orchestration Platform. Dark-mode bento grid mission control for AI agents. 10-screen design system + brand spec + CSS tokens. Built by RAM Design Studio`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LOOM — AI Agent Orchestration · RAM Design Studio</title>
<meta name="description" content="Dark-mode bento grid mission control for AI agents. 10-screen design system with brand spec and CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${meta.palette.accent}}
  .nav-id{font-size:11px;color:${meta.palette.accent};letter-spacing:1px;opacity:.6}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;opacity:.8}
  h1{font-size:clamp(52px,8vw,96px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px}
  .sub{font-size:16px;opacity:.5;max-width:520px;line-height:1.6;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.bg}}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}55}
  .btn-x{background:#000;color:#fff;border:1px solid #222}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};opacity:.8}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:24px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.8;color:${meta.palette.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:14px;right:14px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 14px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px;opacity:.8}
  .p-text{font-size:17px;opacity:.55;font-style:italic;max-width:660px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:800px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700;opacity:.8}
  .prd-section h3:first-child{margin-top:0}
  .prd-section h4{color:${meta.palette.fg};opacity:.5}
  .prd-section p,.prd-section li{font-size:14px;opacity:.62;line-height:1.72;max-width:700px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{opacity:1;color:${meta.palette.fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.25;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:${meta.palette.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  /* Live indicator */
  .live-badge{display:inline-flex;align-items:center;gap:6px;font-size:10px;color:${meta.palette.green};font-weight:700;letter-spacing:1px;margin-bottom:24px}
  .live-dot{width:7px;height:7px;border-radius:50%;background:${meta.palette.green};animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(0.85)}}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">◈ RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · ${meta.archetype.toUpperCase()} · MARCH 20, 2026</div>
  <div class="live-badge"><span class="live-dot"></span>10 SCREENS · BRAND SPEC · CSS TOKENS</div>
  <h1>${meta.appName}</h1>
  <p class="sub">${meta.tagline} Inspired by Midday.ai's precision dark aesthetic, JetBrains Air's agent-centric UI, and Locomotive.ca's editorial boldness.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>${meta.archetype.toUpperCase()}</strong></div>
    <div class="meta-item"><span>SIGNATURE</span><strong>BENTO MISSION CONTROL</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>VOID + TEAL + PURPLE</strong></div>
    <div class="meta-item"><span>CREDIT</span><strong>${sub.credit}</strong></div>
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
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;color:${meta.palette.fg}">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0;color:${meta.palette.fg}">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;color:${meta.palette.fg}">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0;color:${meta.palette.fg}">DESIGN PRINCIPLES</div>
      ${designPrinciplesHTML}
    </div>
  </div>
  <div style="margin-top:48px">
    <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0;color:${meta.palette.fg}">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="tokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text" id="prompt-text">${sub.prompt}</p>
  <div style="font-size:11px;opacity:.3">RAM Design Heartbeat · ${new Date(sub.submitted_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF · PRD</div>
  <div>${mdToHtml(prd.markdown)}</div>
</section>

<footer>
  <span>RAM DESIGN STUDIO · ${new Date().getFullYear()}</span>
  <span>ram.zenbin.org/${SLUG}</span>
  <span>pencil.dev v2.8 · 10 screens</span>
</footer>

<script>
const PEN_B64 = "${Buffer.from(JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname, 'loom.pen'), 'utf8')))).toString('base64')}";
function getPen() { return JSON.parse(atob(PEN_B64)); }
function openInViewer() { window.open('https://ram.zenbin.org/${VIEWER_SLUG}','_blank'); }
function downloadPen() {
  const blob = new Blob([JSON.stringify(getPen(),null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'loom.pen'; a.click();
}
function copyPrompt() {
  navigator.clipboard.writeText(document.getElementById('prompt-text').textContent);
  showToast();
}
function copyTokens() {
  navigator.clipboard.writeText(document.getElementById('tokens').textContent);
  showToast();
}
function shareOnX() {
  window.open('https://twitter.com/intent/tweet?text=${shareText}','_blank');
}
function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}
</script>
</body>
</html>`;
}

// ── Viewer HTML ────────────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const viewerPath = path.join(__dirname, 'penviewer.html');
  let viewerHtml;
  if (fs.existsSync(viewerPath)) {
    viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  } else {
    viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>LOOM Viewer</title>
    <script>window.EMBEDDED_PEN = null;<\/script></head><body style="background:#07080F;color:#E8EAFF;font-family:sans-serif;padding:40px">
    <h1>LOOM Viewer</h1><p>penviewer.html not found.</p></body></html>`;
  }
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  const insertAt = viewerHtml.indexOf('<script>');
  if (insertAt !== -1) {
    viewerHtml = viewerHtml.slice(0, insertAt) + injection + '\n' + viewerHtml.slice(insertAt);
  } else {
    viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
  }
  return viewerHtml;
}

// ── Zenbin publish ─────────────────────────────────────────────────────────────
async function publishToZenbin(slug, html, subdomain = 'ram') {
  console.log(`  → Publishing ${subdomain}.zenbin.org/${slug} …`);
  const body = JSON.stringify({ html });
  const res = await post('zenbin.org', `/v1/pages/${slug}`, body, {
    'X-Subdomain': subdomain,
  });
  if (res.status === 200 || res.status === 201) {
    console.log(`  ✓ Published: https://${subdomain}.zenbin.org/${slug}`);
    return true;
  } else {
    console.error(`  ✗ Zenbin error ${res.status}: ${res.body.slice(0, 200)}`);
    return false;
  }
}

// ── GitHub queue ───────────────────────────────────────────────────────────────
async function pushToGalleryQueue(entry) {
  const authHeader = { Authorization: `token ${GITHUB_TOKEN}` };
  const apiBase = 'api.github.com';
  const filePath = `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`;

  console.log('  → Fetching gallery queue from GitHub…');
  const getRes = await getJson(apiBase, filePath, authHeader);
  if (getRes.status !== 200) {
    console.error(`  ✗ GitHub GET failed (${getRes.status}): ${getRes.body.slice(0, 120)}`);
    return false;
  }

  const fileData  = JSON.parse(getRes.body);
  const current   = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue;
  try { queue = JSON.parse(current); } catch { queue = []; }
  if (!Array.isArray(queue)) queue = [];

  const filtered = queue.filter(e => e.id !== entry.id);
  filtered.unshift(entry);

  const newContent = Buffer.from(JSON.stringify(filtered, null, 2)).toString('base64');
  const putRes = await put(apiBase, filePath, JSON.stringify({
    message: `Add ${entry.id} to gallery queue`,
    content: newContent,
    sha: fileData.sha,
  }), { ...authHeader, 'User-Agent': 'design-studio-agent/1.0' });

  if (putRes.status === 200 || putRes.status === 201) {
    console.log(`  ✓ Gallery queue updated (${filtered.length} entries)`);
    return true;
  } else {
    console.error(`  ✗ GitHub PUT failed (${putRes.status}): ${putRes.body.slice(0, 120)}`);
    return false;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  LOOM — Design Discovery Pipeline                  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  // 1. Load pen
  const penPath = path.join(__dirname, 'loom.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ loom.pen not found — run loom-app.js first');
    process.exit(1);
  }
  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc = JSON.parse(penJson);
  console.log(`✓ Loaded loom.pen — ${doc.children.length} screens`);
  doc.children.forEach((s, i) => console.log(`  ${i+1}. ${s.width}×${s.height}`));

  // 2. Build hero HTML
  console.log('\n[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'loom-hero.html'), heroHtml);
  console.log(`  ✓ loom-hero.html written (${(heroHtml.length/1024).toFixed(0)}KB)`);

  // 3. Build viewer HTML
  console.log('\n[2/4] Building viewer…');
  const viewerHtml = await buildViewerHTML(penJson);
  fs.writeFileSync(path.join(__dirname, 'loom-viewer.html'), viewerHtml);
  console.log(`  ✓ loom-viewer.html written (${(viewerHtml.length/1024).toFixed(0)}KB)`);

  // 4. Publish to Zenbin
  console.log('\n[3/4] Publishing to Zenbin…');
  const heroOk   = await publishToZenbin(SLUG, heroHtml);
  const viewerOk = await publishToZenbin(VIEWER_SLUG, viewerHtml);

  // 5. Gallery queue
  console.log('\n[4/4] Adding to gallery queue…');
  const queueEntry = {
    id:           sub.id,
    appName:      meta.appName,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${VIEWER_SLUG}`,
    palette:      meta.palette,
    screens:      doc.children.length,
    submitted_at: sub.submitted_at,
    credit:       sub.credit,
    prompt:       sub.prompt,
  };
  await pushToGalleryQueue(queueEntry);

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  ✓ Pipeline complete                               ║');
  console.log(`║  Hero:   https://ram.zenbin.org/${SLUG.padEnd(19)}║`);
  console.log(`║  Viewer: https://ram.zenbin.org/${VIEWER_SLUG.padEnd(19)}║`);
  console.log('╚════════════════════════════════════════════════════╝\n');
}

main().catch(err => {
  console.error('✗ Pipeline failed:', err.message);
  process.exit(1);
});
