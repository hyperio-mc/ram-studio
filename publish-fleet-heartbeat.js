'use strict';
// publish-fleet-heartbeat.js — Full Design Discovery pipeline for FLEET heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'fleet';
const VIEWER_SLUG = 'fleet-viewer';
const APP_NAME    = 'FLEET';

const P = {
  bg:       '#080C12',
  surface:  '#0F1520',
  surface2: '#141C2E',
  surface3: '#1A2540',
  border:   '#1E2D45',
  border2:  '#263552',
  text:     '#E8EDF5',
  textMid:  '#8B9BB5',
  textFade: '#4A5878',
  cyan:     '#22D3EE',
  violet:   '#A78BFA',
  green:    '#34D399',
  amber:    '#FBBF24',
  red:      '#F87171',
};

const meta = {
  appName:   'FLEET',
  tagline:   'Run your agents, not your tools.',
  archetype: 'developer-tools',
  palette: P,
};

const ORIGINAL_PROMPT = `Design FLEET — a dark-theme autonomous agent orchestration platform styled as "mission control."

Inspired by research from this heartbeat session:

1. Midday.ai (darkmodedesign.com, Apr 2026) — "Let agents run your business." Their tabbed "How it works" feature UI, clean dark SaaS aesthetic with live dashboard previews, and agent-first product messaging showed how a sophisticated finance SaaS communicates automation and trust.

2. Neon.com (darkmodedesign.com, Apr 2026) — now a Databricks company, their headline "for Teams and Agents" + teal glow on near-black shows the developer-tools aesthetic converging on electric accent colors as a metaphor for live data.

3. Awwwards Fluid Glass SOTD (Mar 30 2026, Exo Ape) — mask-wipe scroll transitions, fluid interaction patterns as a new choreography language for web experiences.

New territory this run: radial health rings as agent status indicators (health % shown as a partial ellipse stroke around an orb), live pulse dots for running state, and a grid-based fleet view.

Theme: DARK — deep space navy #080C12, electric cyan #22D3EE, violet #A78BFA.

5 screens: Mission Control (live overview + agent status orbs + live feed) · Agent Fleet (2-col grid with health ring orbs) · Task Queue (tabbed priority pipeline + progress bars) · Trace Log (execution timeline step-by-step) · Deploy Agent (config form + trigger selector + cron input + CTA).`;

const screenNames = ['Mission Control', 'Agent Fleet', 'Task Queue', 'Trace Log', 'Deploy Agent'];

const sub = {
  id:           `heartbeat-fleet-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

const prdMarkdown = `## Overview
FLEET is an autonomous agent orchestration platform designed as a "mission control" for modern founders and engineering teams. Inspired by Midday.ai's agent-first SaaS positioning and Neon.com's dark developer aesthetic, it presents a live operational view of all running AI agents — their health, task queues, and execution traces — in a single compact mobile interface.

## Design Philosophy
**Agents as a fleet, not a feature.** The metaphor is military/aviation mission control — every agent is a unit with a status, a health score, and a live trace. The UI communicates urgency and precision through electric cyan accents on a deep navy canvas. Radial ring indicators (new this run) replace bar meters — health is a circular percentage, read like a radar screen.

**Inspired directly by:**
- Midday.ai (darkmodedesign.com, April 2026) — "Let agents run your business," tabbed feature showcase, live dashboard preview
- Neon.com (darkmodedesign.com, April 2026) — Databricks "for Teams and Agents," teal-on-black developer glow
- Awwwards Fluid Glass SOTD (Exo Ape, March 30, 2026) — fluid scroll interactions as new web choreography

## Target Users
- **Founders** who use multiple AI agents to run business operations (data enrichment, reporting, notifications)
- **Engineering teams** deploying and monitoring autonomous workflows
- **Operations leads** who need live visibility into agent health and task throughput

## Core Screens
- **Mission Control** — Grid stats (Active/Queued/Done), 4 health orbs with radial ring indicators, 6-item live feed with timestamps
- **Agent Fleet** — 2-col grid of 6 agent cards, each with a radial health ring + status chip + task count
- **Task Queue** — Tabbed priority filter, 3 running tasks with progress bars, 5 pending items with priority badges
- **Trace Log** — Execution timeline for a single agent run, 14 steps with done/running/pending states and duration readouts
- **Deploy Agent** — Name/type/URL/prompt fields, 3 trigger type cards, cron expression input, deploy CTA

## Design Language
Three core constraints:

1. **Deep space navy canvas (#080C12)** — not just "dark mode." The specific blue-black of a radar screen. Surface lifts to #0F1520 and #1A2540 to create depth without washing out the accent.
2. **Electric cyan action (#22D3EE)** — neon-cold, immediate. Used for primary CTAs, active state, live indicators, and health ring fill. Violet (#A78BFA) as secondary for report/generate agent types.
3. **Radial health rings** — the unique visual element of this design. Each agent orb has a background track ring and a colored progress ring whose opacity represents health percentage. The inner orb glows at low opacity. This is a new interaction primitive — an ambient health "aura."`;

function httpsReq(opts, body) {
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

async function get_(host, p) {
  return httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'ram-design/1.0' } });
}

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
}

function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / screen.width;
  const scaleY = th / screen.height;

  function renderNode(node, depth = 0) {
    if (depth > 8) return '';
    const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');
    const x  = (node.x || 0) * scaleX;
    const y  = (node.y || 0) * scaleY;
    const w  = (node.width  || 0) * scaleX;
    const h  = (node.height || 0) * scaleY;
    const fill = node.fill || 'transparent';
    const op   = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
    const cr   = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX, scaleY)}"` : '';
    const sw   = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX, scaleY) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';

    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w/2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fw = ['700','800','900'].includes(String(node.fontWeight)) ? ' font-weight="bold"' : '';
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill || P.text}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op}${strokeStr}/>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${(((x*100+y*10)|0)+1000).toString().replace('-','')}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:8px;overflow:hidden;border:1px solid ${P.border}">
    ${renderNode(screen)}
  </svg>`;
}

function buildHeroHTML(penJson) {
  const screens = penJson.screens || [];

  const THUMB_H = 200;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;color:${P.textFade};margin-top:8px;letter-spacing:1px;max-width:${tw}px">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'DEEP NAVY'  },
    { hex: P.surface, role: 'SURFACE'    },
    { hex: P.text,    role: 'TEXT'       },
    { hex: P.cyan,    role: 'CYAN'       },
    { hex: P.violet,  role: 'VIOLET'     },
    { hex: P.green,   role: 'GREEN'      },
    { hex: P.amber,   role: 'AMBER'      },
    { hex: P.red,     role: 'RED'        },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:6px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;color:${P.textFade};margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.cyan}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'48px', weight:'800', sample: 'FLEET', color: P.cyan },
    { label:'HERO',     size:'22px', weight:'700', sample: 'Mission Control', color: P.text },
    { label:'HEADING',  size:'15px', weight:'700', sample: 'Active · Queued · Done · 14 Running', color: P.text },
    { label:'BODY',     size:'13px', weight:'400', sample: 'Fetched 342 records · batch 3/4', color: P.textMid },
    { label:'LABEL',    size:'10px', weight:'600', sample: 'LIVE FEED · AGENT STATUS · RUNNING NOW · TK-4821', color: P.textFade },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:8px;letter-spacing:2px;color:${P.textFade};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${t.color};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* FLEET — Run your agents, not your tools */
  /* Inspired by Midday.ai + Neon.com + Fluid Glass SOTD (Exo Ape) */

  /* Color — dark space navy system */
  --color-bg:        ${P.bg};        /* deep navy — radar screen base */
  --color-surface:   ${P.surface};   /* lifted card surface */
  --color-surface2:  ${P.surface2};  /* active field highlight */
  --color-border:    ${P.border};    /* subtle border */
  --color-text:      ${P.text};      /* cool white text */
  --color-mid:       ${P.textMid};   /* muted mid tone */
  --color-muted:     ${P.textFade};  /* faded text */
  --color-cyan:      ${P.cyan};      /* electric cyan — active, running, CTA */
  --color-violet:    ${P.violet};    /* violet — report/generate agent type */
  --color-success:   ${P.green};     /* green — done, healthy */
  --color-warning:   ${P.amber};     /* amber — queued, warning */
  --color-error:     ${P.red};       /* red — error, critical */

  /* Typography */
  --font-family:  -apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-display: 800 24px / 1 var(--font-family);
  --font-heading: 700 15px / 1.3 var(--font-family);
  --font-body:    400 13px / 1.6 var(--font-family);
  --font-label:   600 10px / 1 var(--font-family);
  --font-trace:   400 11px / 1.4 var(--font-mono);

  /* Spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 12px;  --radius-lg: 16px;  --radius-pill: 9999px;

  /* Unique: health ring stroke */
  --health-ring-track-color: ${P.border2};
  --health-ring-track-width: 2px;
}`;

  const shareText = encodeURIComponent(`FLEET — autonomous agent mission control, designed by RAM. Dark space navy + electric cyan. 5 screens.`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FLEET — Run Your Agents, Not Your Tools · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.text};font-family:-apple-system,'SF Pro Text','Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;background:${P.surface}}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${P.text}}
  .nav-id{font-size:9px;color:${P.textFade};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .hero-badge{display:inline-block;background:${P.cyan}18;color:${P.cyan};font-size:9px;font-weight:700;letter-spacing:2.5px;padding:6px 14px;border-radius:20px;border:1px solid ${P.cyan}30;margin-bottom:24px}
  h1{font-size:clamp(56px,10vw,96px);font-weight:800;letter-spacing:-2px;line-height:1;margin-bottom:16px;color:${P.cyan}}
  .sub{font-size:16px;color:${P.textMid};max-width:560px;line-height:1.65;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.textFade};letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${P.cyan};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:24px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px;transition:opacity .15s}
  .btn-p{background:${P.cyan};color:${P.bg}}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${P.text};border:1px solid ${P.border}}
  .btn-s:hover{border-color:${P.cyan}88}
  .btn-c{background:transparent;color:${P.cyan};border:1px solid ${P.cyan}44}
  .btn-mock{background:${P.cyan}12;color:${P.cyan};border:1px solid ${P.cyan}44;font-weight:700}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.textFade};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${P.border};font-weight:600}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-thumb{background:${P.cyan}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:8px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${P.textMid};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.cyan}15;border:1px solid ${P.cyan}40;color:${P.cyan};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .prompt-section{padding:40px;border-top:1px solid ${P.border};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:10px;font-weight:600}
  .p-text{font-size:15px;color:${P.textMid};font-style:italic;max-width:640px;line-height:1.75;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.textFade};margin:24px 0 8px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${P.textMid};line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${P.text}}
  footer{padding:24px 40px;border-top:1px solid ${P.border};font-size:10px;color:${P.textFade};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;background:${P.surface}}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.cyan};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:20px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="hero-badge">HEARTBEAT DESIGN · DEVELOPER TOOLS · APRIL 2026</div>
  <h1>FLEET</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>MIDDAY.AI · NEON.COM</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#080C12 + #22D3EE</strong></div>
    <div class="meta-item"><span>THEME</span><strong>DARK · SPACE NAVY</strong></div>
    <div class="meta-item"><span>TREND</span><strong>AGENT-FIRST SaaS</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/fleet-mock" target="_blank">✦ Try Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-c" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-s" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN THUMBNAILS — 5 MOBILE SCREENS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:16px;font-weight:600">COLOR PALETTE — SPACE NAVY SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:16px;font-weight:600">SPACING SCALE — 8PX BASE GRID</div>
        ${[4,8,12,16,20,24,32].map(sp => `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
          <div style="font-size:10px;color:${P.textFade};width:32px;flex-shrink:0">${sp}px</div>
          <div style="height:8px;border-radius:4px;background:${P.cyan};width:${sp*2}px;opacity:0.45"></div>
        </div>`).join('')}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:16px;font-weight:600">TYPE SCALE — PRECISION WEIGHT CONTRAST</div>
      ${typeScaleHTML}
    </div>
  </div>

  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:4px;font-weight:600">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT.replace(/\n/g, '<br>')}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  ${prdMarkdown
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h3 style="letter-spacing:1px;font-size:8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/(?<![>])\n/g, ' ')}
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · APRIL 2026</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied!'));
  }
  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied!'));
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

async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FLEET Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

async function updateGalleryQueue() {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id:           sub.id,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/fleet-mock`,
    submitted_at: sub.submitted_at,
    published_at: sub.published_at,
    credit:       sub.credit,
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: FLEET to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
}

(async () => {
  console.log('══ FLEET Design Discovery Pipeline ══\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'fleet.pen'), 'utf8'));
  console.log(`✓ Loaded fleet.pen (${penJson.screens.length} screens)`);

  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML (${(heroHTML.length/1024).toFixed(1)}kb)`);

  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroRes = await publishToZenbin(SLUG, 'FLEET — Run Your Agents, Not Your Tools · RAM Design Studio', heroHTML);
  console.log(`  Status: ${heroRes.status}`);
  if (heroRes.status === 200) console.log(`  ✓ https://ram.zenbin.org/${SLUG}`);
  else console.log(`  Err: ${heroRes.body.slice(0,200)}`);

  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewRes = await publishToZenbin(VIEWER_SLUG, 'FLEET Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewRes.status}`);
  if (viewRes.status === 200) console.log(`  ✓ https://ram.zenbin.org/${VIEWER_SLUG}`);
  else console.log(`  Err: ${viewRes.body.slice(0,200)}`);

  console.log('\nUpdating gallery queue...');
  const qRes = await updateGalleryQueue();
  console.log(`  Status: ${qRes.status}`);
  if (qRes.status === 200) console.log('  ✓ Gallery queue updated');
  else console.log(`  Err: ${qRes.body.slice(0,200)}`);

  console.log('\n══ Pipeline complete ══');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/fleet-mock`);
})();
