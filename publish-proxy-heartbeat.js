'use strict';
// publish-proxy-heartbeat.js — Full Design Discovery pipeline for PROXY heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'proxy';
const VIEWER_SLUG = 'proxy-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'PROXY',
  tagline:   'Real-time AI Agent Control Room for solo founders. Monitor, orchestrate, and audit the AI agents running your business.',
  archetype: 'AI Agent Dashboard',
  palette: {
    bg:      '#0A0A0F',
    fg:      '#F0F0FA',
    accent:  '#6B5EFF',
    accent2: '#3DFFC0',
  },
};

const sub = {
  id:           'heartbeat-proxy',
  prompt:       'Design PROXY — a dark-mode AI Agent Control Room for solo founders. Inspired by: (1) Belka.ai (darkmodedesign.com, March 2026) — near-dark #181818 with editorial bold serif typography for an AI industrial product, an unexpected Times New Roman move; (2) Linear (darkmodedesign.com) — near-black #08090A agent-native positioning, "for teams and agents"; (3) Stripe Sessions 2026 (godly.website) — deep violet accent on darkness. Palette: near-black #0A0A0F + electric violet #6B5EFF + cyber teal #3DFFC0. 5 mobile screens: Mission Control · Agent Detail · Task Queue · Audit Log · Deploy Agent.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Mission Control', 'Agent Detail', 'Task Queue', 'Audit Log', 'Deploy'],
  markdown: `## Overview
PROXY is a real-time AI Agent Control Room for the new wave of solo founders running their businesses with AI agents. It provides a single command center to monitor agent status, assign tasks, review audit logs, and deploy new agents — built for the world where AI agents are first-class team members.

## Target Users
- **Solo founders** running multiple AI agents handling customer support, finance, content, and research
- **Indie hackers** building one-person companies with AI automation at the core
- **Agency owners** delegating client work to specialized AI agents with human oversight
- **Power users** of tools like Claude, Zapier AI, and custom LLM automations who need a unified dashboard

## Core Features
- **Mission Control** — Live overview of all agents: status (working/idle/queued/error), real-time event feed, system metrics (tasks/hr, uptime)
- **Agent Detail** — Deep dive on individual agents: current task with progress, 30-day performance metrics (CSAT, throughput, resolution time), recent task history, capability tags
- **Task Queue / Pipeline** — Kanban-style filtered view across all agents: active, pending, needs-review. Priority levels, agent assignment, time tracking
- **Audit Log** — Chronological timeline of every agent action with color-coded agent attribution, error flagging, and expandable detail. Essential for compliance and oversight
- **Deploy Agent** — Step-by-step wizard: name, role, base model selection, capability toggles (web browsing, email, CRM access), oversight level (supervised/semi-auto/autonomous)

## Design Language
Inspired by three specific sources discovered on **March 20, 2026**:

1. **Belka.ai** (darkmodedesign.com, March 2026) — Near-dark background #181818 with an unexpected bold **serif** (Times New Roman) for an AI industrial control product. This editorial-meets-technical contrast is the defining design tension PROXY pushes further. Agent names and display-size elements use oversized, heavyweight letterforms that feel authoritative and editorial — not sterile enterprise.

2. **Linear** (darkmodedesign.com, March 2026) — Near-absolute black #08090A, near-white #F7F8F8. "The product development system for teams **and agents**" — explicitly agent-native. Linear's restraint, negative space, and refusal to decorate is the UI canon. PROXY goes one shade darker: #0A0A0F.

3. **Stripe Sessions 2026** (godly.website, March 2026) — Deep violet/purple #20033C accent on dark backgrounds. The electric violet #6B5EFF in PROXY is a direct chromatic descendant — the color of authority, trust, and technical power in the AI era.

The palette — **near-black #0A0A0F + electric violet #6B5EFF + cyber teal #3DFFC0** — signals a product that operates in the dark, intelligently. Teal for "alive/online," violet for "system/control," near-black for "focus on the data."

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. **Mission Control** — Agent status grid (4 agents: working/idle/queued/error), ambient glow pulse on working agents, real-time event feed, system metrics strip
2. **Agent Detail** (Orion) — Editorial avatar with oversized initial letter (Belka.ai influence), capability pills, live task progress bar, 30-day metrics, sparkline throughput chart, recent task log
3. **Task Queue** — Segmented filter (All/Active/Pending/Done), left-edge colored status bars, priority pills, agent attribution, time elapsed, active/pending/review sections
4. **Audit Log** — Vertical timeline with agent-colored dots, time-stamped entries, error badges, chronological agent action trace
5. **Deploy Agent** — Step indicator (Identity/Capabilities/Triggers), form fields, capability toggle grid, oversight slider (Supervised/Semi-auto/Autonomous), deploy CTA, safety warning`,
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
    .replace(/`([^`]+)`/g, '<code style="background:#1a1a2e;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens  = doc.children || [];
  const surface  = lightenHex(meta.palette.bg, 12);
  const border   = lightenHex(meta.palette.bg, 26);
  const THUMB_H  = 200;
  const encoded  = Buffer.from(JSON.stringify(penJson)).toString('base64');

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = `M · ${prd.screenNames[i] || i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#0A0A0F', role: 'BACKGROUND'    },
    { hex: '#111118', role: 'SURFACE'       },
    { hex: '#181822', role: 'SURFACE 2'     },
    { hex: '#F0F0FA', role: 'FOREGROUND'    },
    { hex: '#6B5EFF', role: 'VIOLET'        },
    { hex: '#3DFFC0', role: 'TEAL'          },
    { hex: '#9B8FFF', role: 'VIOLET LIGHT'  },
    { hex: '#FF6565', role: 'ERROR'         },
    { hex: '#FFD166', role: 'AMBER'         },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '72px', weight: '900', sample: 'PROXY' },
    { label: 'HEADING',  size: '22px', weight: '800', sample: 'Mission Control' },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'Monitor, orchestrate, and audit the AI agents running your business.' },
    { label: 'CAPTION',  size: '9px',  weight: '600', sample: 'AGENT STATUS · TASKS/HR · UPTIME · AUDIT LOG' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — PROXY Near-Black System */
  --color-bg:        #0A0A0F;   /* Near-black, cool blue shift */
  --color-surface:   #111118;   /* Elevated surface */
  --color-surface2:  #181822;   /* Card surface */
  --color-surface3:  #1E1E2C;   /* Light card */
  --color-border:    #24243A;   /* Subtle border */
  --color-muted:     #4A4A68;   /* Muted indigo */
  --color-fg:        #F0F0FA;   /* Cool near-white */
  --color-violet:    #6B5EFF;   /* Electric violet — AI authority */
  --color-violet-lt: #9B8FFF;   /* Lighter violet */
  --color-teal:      #3DFFC0;   /* Cyber teal — online/positive */
  --color-error:     #FF6565;   /* Warning/error */
  --color-amber:     #FFD166;   /* Pending/caution */
  --color-dim:       #1C1C2A;   /* Dimmed surface */

  /* Typography */
  --font-family:   'SF Pro Display', 'Inter', system-ui, sans-serif;
  --font-display:  900 clamp(48px, 12vw, 96px) / 1 var(--font-family);
  --font-heading:  800 22px / 1.3 var(--font-family);
  --font-body:     400 14px / 1.6 var(--font-family);
  --font-caption:  600 9px  / 1 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 14px;  --radius-full: 9999px;

  /* Glow effects */
  --glow-violet: 0 0 60px #6B5EFF22;
  --glow-teal:   0 0 40px #3DFFC018;
  --glow-card:   0 4px 24px #00000055;
}`;

  const shareText = encodeURIComponent(
    `PROXY — AI Agent Control Room. 5 mobile screens + full brand spec + CSS tokens. Dark near-black UI for solo founders running AI agents. Designed by RAM Design AI.`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PROXY — AI Agent Control Room · RAM Design Studio</title>
<meta name="description" content="PROXY — dark-mode AI Agent Control Room for solo founders. 5 mobile screens, brand spec & CSS tokens. Designed by RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:'SF Pro Display','Inter',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:900;letter-spacing:5px;color:${meta.palette.accent}}
  .nav-id{font-size:11px;color:${meta.palette.accent};letter-spacing:1px;opacity:.7}
  .hero{padding:80px 40px 40px;max-width:920px;position:relative}
  .hero-glow{position:absolute;top:-40px;left:-80px;width:500px;height:500px;background:radial-gradient(circle,${meta.palette.accent}0a 0%,transparent 70%);pointer-events:none}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;opacity:.8}
  h1{font-size:clamp(72px,12vw,120px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:20px;color:${meta.palette.fg}}
  .sub{font-size:16px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.fg}}
  .btn-p:hover{opacity:.9}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-t{background:transparent;color:${meta.palette.accent2};border:1px solid ${meta.palette.accent2}44}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:920px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${meta.palette.fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:17px;opacity:.6;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${meta.palette.fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:${meta.palette.fg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:680px;font-size:12px;line-height:1.7;opacity:.75}
  .inspiration-bar strong{color:${meta.palette.accent};opacity:1}
  .agent-status-demo{display:flex;gap:12px;margin-bottom:40px;flex-wrap:wrap}
  .agent-pill{display:inline-flex;align-items:center;gap:8px;background:${surface};border:1px solid ${border};border-radius:20px;padding:8px 14px;font-size:11px}
  .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-proxy · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="tag">DESIGN HEARTBEAT · AI AGENT DASHBOARD · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>PROXY</h1>
  <p class="sub">${meta.tagline}</p>

  <div class="agent-status-demo">
    <div class="agent-pill"><div class="dot" style="background:#3DFFC0"></div><span style="color:#F0F0FA;font-weight:700">Orion</span><span style="color:#4A4A68">Customer Support · WORKING</span></div>
    <div class="agent-pill"><div class="dot" style="background:#3DFFC0"></div><span style="color:#F0F0FA;font-weight:700">Vega</span><span style="color:#4A4A68">Finance Ops · WORKING</span></div>
    <div class="agent-pill"><div class="dot" style="background:#4A4A68"></div><span style="color:#F0F0FA;font-weight:700">Atlas</span><span style="color:#4A4A68">Content · IDLE</span></div>
    <div class="agent-pill"><div class="dot" style="background:#FFD166"></div><span style="color:#F0F0FA;font-weight:700">Nova</span><span style="color:#4A4A68">Research · QUEUED</span></div>
  </div>

  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>BY</span><strong>RAM HEARTBEAT</strong></div>
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
  <strong>What inspired this:</strong> Belka.ai's editorial serif on dark (#181818) at <strong>darkmodedesign.com</strong> → bold oversized agent initials. Linear's near-black agent-native positioning at <strong>darkmodedesign.com</strong> → #0A0A0F base. Stripe Sessions 2026 at <strong>godly.website</strong> → electric violet accent energy.
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE</div>
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
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:12px">DESIGN PRINCIPLES</div>
      ${[
        ['Darkness as focus', 'Near-black backgrounds eliminate distraction. Data speaks, decoration doesn\'t.'],
        ['Agent-first hierarchy', 'Agents are treated as first-class team members. Their status is always visible.'],
        ['Color as signal', 'Teal = alive, Violet = system, Amber = caution, Red = error. Never decorative.'],
        ['Editorial authority', 'Oversized letterforms on agent avatars (Belka.ai influence) — authoritative, not sterile.'],
      ].map(([p, d]) => `<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:700;color:${meta.palette.fg};margin-bottom:4px">${p}</div><div style="font-size:12px;opacity:.5;line-height:1.5">${d}</div></div>`).join('')}
    </div>

  </div>

  <div style="margin-top:48px">
    <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:12px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text" id="originalPrompt">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div style="font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:24px;font-weight:700">PRODUCT BRIEF / PRD</div>
  <p>${mdToHtml(prd.markdown)}</p>
</section>

<footer>
  <span>RAM DESIGN STUDIO · ${new Date().getFullYear()}</span>
  <span>PROXY · heartbeat-proxy</span>
  <span>ram.zenbin.org/${SLUG}</span>
</footer>

<script>
  const ENCODED = "${encoded}";
  const VIEWER_URL = "https://ram.zenbin.org/${VIEWER_SLUG}";
  const PROMPT = document.getElementById('originalPrompt')?.innerText || '';

  function openInViewer() { window.open(VIEWER_URL, '_blank'); }

  function downloadPen() {
    const bytes = Uint8Array.from(atob(ENCODED), c => c.charCodeAt(0));
    const blob  = new Blob([bytes], { type: 'application/octet-stream' });
    const a     = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'proxy.pen' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('Downloaded ✓');
  }

  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
  }

  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied ✓'));
  }

  function shareOnX() {
    window.open('https://x.com/intent/tweet?text=${shareText}&url=' + encodeURIComponent(location.href), '_blank');
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  // Fetch viewer template
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || html.length < 100) {
    // Fallback minimal viewer
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PROXY Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  // Inject before the first <script> tag
  if (html.includes('<script>')) {
    html = html.replace('<script>', injection + '\n<script>');
  } else {
    html = html.replace('</head>', injection + '\n</head>');
  }
  return html;
}

// ── Zenbin publisher ──────────────────────────────────────────────────────────
async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  const res = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' },
  }, body);
  console.log(`  Zenbin ${slug}: HTTP ${res.status}`);
  if (res.status >= 400) console.log('  Response:', res.body.substring(0, 200));
  return res;
}

// ── Get queue SHA ─────────────────────────────────────────────────────────────
async function getQueueSha() {
  const r = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`,
    method: 'GET',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'design-studio-agent/1.0', Accept: 'application/vnd.github.v3+json' },
  });
  if (r.status !== 200) throw new Error(`SHA fetch failed: ${r.status}`);
  return JSON.parse(r.body).sha;
}

// ── GitHub queue ──────────────────────────────────────────────────────────────
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
  const body = JSON.stringify({ message: `heartbeat: add proxy to gallery`, content, sha });
  return put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, body, {
    Authorization: `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    Accept: 'application/vnd.github.v3+json',
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════');
  console.log('  PROXY — Design Discovery Pipeline');
  console.log('══════════════════════════════════════\n');

  // Load .pen
  const penPath = path.join(__dirname, 'proxy.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ proxy.pen not found — run proxy-app.js first');
    process.exit(1);
  }
  const penJson = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded proxy.pen (${penJson.children?.length} screens)`);

  // Build hero HTML
  const heroHTML = buildHeroHTML(penJson, penJson);
  console.log(`✓ Hero HTML built (${Math.round(heroHTML.length / 1024)}KB)`);

  // Build viewer HTML
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`✓ Viewer HTML built (${Math.round(viewerHTML.length / 1024)}KB)`);

  // Save local copies
  fs.writeFileSync(path.join(__dirname, 'proxy-hero.html'), heroHTML);
  fs.writeFileSync(path.join(__dirname, 'proxy-viewer.html'), viewerHTML);
  console.log('✓ Local HTML files saved');

  // Publish hero
  console.log('\nPublishing...');
  const heroUrl    = `https://ram.zenbin.org/${SLUG}`;
  const heroResult = await publishToZenbin(SLUG, 'PROXY — AI Agent Control Room · RAM Design Studio', heroHTML);
  console.log((heroResult.status === 200 || heroResult.status === 201) ? `✓ Hero live: ${heroUrl}` : `⚠ Hero: ${heroResult.status}`);

  // Publish viewer
  console.log('\nFetching viewer template...');
  let viewerHtml = viewerHTML;
  try {
    const vBase = await httpsReq({ hostname: 'zenbin.org', path: '/p/pen-viewer-3', method: 'GET', headers: { Accept: 'text/html' } });
    if (vBase.status === 200) {
      const penStr    = JSON.stringify(penJson);
      const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};<\/script>`;
      viewerHtml = vBase.body.includes('<script>')
        ? vBase.body.replace('<script>', injection + '\n<script>')
        : vBase.body.replace('</head>', injection + '\n</head>');
      fs.writeFileSync(path.join(__dirname, 'proxy-viewer.html'), viewerHtml);
      console.log('✓ Fresh viewer template fetched');
    }
  } catch (e) { console.log('  Using cached viewer:', e.message); }

  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'PROXY Viewer · RAM Design Studio', viewerHtml);
  console.log((viewerResult.status === 200 || viewerResult.status === 201) ? `✓ Viewer live: https://ram.zenbin.org/${VIEWER_SLUG}` : `⚠ Viewer: ${viewerResult.status}`);

  // Gallery queue
  console.log('\nAdding to gallery queue...');
  try {
    const qResult = await addToGalleryQueue(heroUrl);
    console.log((qResult.status === 200 || qResult.status === 201) ? '✓ Added to gallery queue' : `⚠ Queue: ${qResult.status} ${qResult.body?.slice(0,100)}`);
  } catch (e) { console.log('⚠ Queue error:', e.message); }

  console.log('\n══════════════════════════════════════');
  console.log('  PROXY pipeline complete!');
  console.log(`  Hero:   ${heroUrl}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log('══════════════════════════════════════\n');
}

main().catch(err => { console.error('Pipeline error:', err); process.exit(1); });
