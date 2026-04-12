'use strict';
// publish-cast-heartbeat.js — Full Design Discovery pipeline for CAST heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'cast';
const VIEWER_SLUG = 'cast-viewer';
const APP_NAME    = 'CAST';

// ── Design metadata ────────────────────────────────────────────────────────────
const meta = {
  appName:   'CAST',
  tagline:   'Parallel AI agent orchestration. Run your fleet at full power.',
  archetype: 'productivity',
  palette: {
    bg:      '#080810',
    surface: '#0F0F1E',
    fg:      '#E4E2FF',
    accent:  '#7655FF',
    accent2: '#00CFFF',
    green:   '#00E59A',
    red:     '#FF4466',
    amber:   '#FFB233',
  },
};

const ORIGINAL_PROMPT = `Design CAST — a parallel AI agent orchestration dashboard for developers managing multi-model workflows. Directly inspired by three sources found during research:
1. Superset.sh (darkmodedesign.com, March 2026) — the definitive terminal-dark AI agent orchestration UI, showing Claude/Codex/GPT agents running in parallel with compact status cards, progress bars, and live step logs
2. Linear.app (darkmodedesign.com) — disciplined 4px grid, type-as-information-hierarchy, restrained accent usage against near-black
3. godly.website — deep blue-violet void backgrounds (Atlas Card, Lusion) pushing "space-tech dark" as the dominant 2026 palette direction

The palette: deep blue-black (#080810) with cool off-white text (#E4E2FF). Dual accent system: violet (#7655FF) for brand/identity, electric cyan (#00CFFF) for live/streaming states. 5 screens: Fleet Overview (2×2 bento agent cards + global metrics) · Active Runs (task list with progress) · Run Detail (step-by-step execution log) · Analytics (success rate hero + daily chart + cost breakdown) · Config (model toggles + API keys + concurrency slider).`;

const sub = {
  id:           `heartbeat-cast-${Date.now()}`,
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

const prd = {
  screenNames: ['Fleet', 'Active Runs', 'Run Detail', 'Analytics', 'Config'],
  markdown: `## Overview
CAST (Concurrent Agent Scheduling & Tracking) is a parallel AI agent orchestration dashboard for developers running multi-model workflows. Inspired by the terminal-dark aesthetic of Superset.sh and the disciplined precision of Linear (both featured on darkmodedesign.com, March 2026), CAST puts the agent fleet front and center: four model cards in a 2×2 bento grid, each showing real-time status, task queue, token usage, and cost.

## Design Philosophy
**Space-tech dark meets precision tooling.** The "deep blue-void" palette trend observed across godly.website and darkmodedesign.com in 2026 pushes past typical dark mode into near-midnight blue-black (#080810). The dual accent system borrows from Superset's live-terminal aesthetic: violet (#7655FF) owns brand identity and idle states, electric cyan (#00CFFF) pulses for live/streaming activity. Every running agent glows cyan — a deliberate signal borrowed from terminal cursor aesthetics.

**Inspired by:**
- Superset.sh (darkmodedesign.com) — parallel agent cards, terminal progress steps, CLI-adjacent aesthetic
- Linear (darkmodedesign.com) — 4px grid discipline, no-decoration philosophy, typography hierarchy
- godly.website / Atlas Card / Lusion — deep blue-violet void as the dominant 2026 dark palette
- land-book.com — AI agent tooling (LangChain, Runlayer, Superset) emerging as a major landing page category

## Target Users
- **Platform engineers** — orchestrating parallel AI workflows for code generation, analysis, documentation
- **AI product teams** — monitoring multiple model deployments in production
- **Solo developers** — managing agent swarms for automated coding tasks
- **DevOps / MLOps** — tracking cost, token usage, and performance across providers

## Core Features
- **Fleet Overview** — 4 agent cards (Claude 3.7 / GPT-4o / Gemini 2.0 / Codex) in 2×2 bento grid with status indicators, task counts, token usage, and cost per agent. Global metric strip: 12 running / 34 queued / 847 done / 3 errors. Today's throughput bar chart.
- **Active Runs** — Searchable task list with filter chips (ALL / RUNNING / QUEUED / STREAMING). Each card shows run ID, title, task type (CODE / WRITING / ANALYSIS), model badge, progress bar with step counter (e.g. 5/7), elapsed time, and token count. Cyan left-border accent on running tasks.
- **Run Detail** — Drill into a single agent run: 4-stat header (tokens / elapsed / cost / progress), step-by-step execution log with visual connector timeline (✓ done / ▶ active / ○ pending), active step "thinking" annotation, code output preview in syntax-highlighted block.
- **Analytics** — 94.7% success rate in 52px bold hero. Time range selector (24H / 7D / 30D / 90D). Daily run volume bar chart (today highlighted in violet). Cost breakdown by model as horizontal progress bars. Error rate / uptime / P95 latency summary strip.
- **Config** — Model enable/disable toggles (Claude / GPT-4o / Gemini / Codex) with PRIMARY badge. Concurrency slider (max 8 parallel agents). Masked API keys for each provider. Daily cost limit slider with current spend indicator. Reset stats danger zone.

## Design Language
**Palette:** Near-midnight blue-black (#080810) void. Two signal colors — violet for identity, cyan for live. Green (#00E59A) for success, red (#FF4466) for errors, amber (#FFB233) for warnings.

**Typography:** SF Mono / ui-monospace — the terminal aesthetic that connects CAST to its CLI heritage. Display numbers (24px-52px) at 800-900 weight. Compact label system at 7-8px with +1.5px letter-spacing for information density.

**Layout:** 4px base grid. 16px card padding. 2×2 bento grid for the fleet overview creates visual symmetry. Left-border accent on active cards (borrowed from Linear's issue tracker pattern).

## Screen Architecture
1. **Fleet** — Global metrics strip (4 KPIs) · 2×2 agent bento grid with status/progress/cost · Today's throughput chart · Live task list
2. **Active Runs** — Status filter chips · 5 run cards with type/model/progress/step counter
3. **Run Detail** — Run header card · 4-stat grid · Progress bar · 7-step execution timeline · Code output preview
4. **Analytics** — Success rate hero · Time range selector · Daily bar chart · Cost-by-model bars · 3 quick stats
5. **Config** — 4 model toggles · Concurrency slider · 3 API key entries · Cost limit slider · Danger zone`,
};

// ── HTTP helpers ───────────────────────────────────────────────────────────────
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

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
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
    const cr   = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX,scaleY)}"` : '';
    const sw   = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX,scaleY) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';

    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w/2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fw = ['700','800','900'].includes(String(node.fontWeight)) ? ' font-weight="bold"' : '';
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill||'#E4E2FF'}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op}${strokeStr}/>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${Math.abs((x*100+y*10)|0)}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:8px;overflow:hidden;border:1px solid ${meta.palette.surface}">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ──────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];

  function lightenHex(hex, amt) {
    const n = parseInt((hex||'#111111').replace('#',''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
  }

  const surface = meta.palette.surface;
  const border  = lightenHex(meta.palette.bg, 30);

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = prd.screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: meta.palette.bg,      role: 'VOID BG'     },
    { hex: meta.palette.surface, role: 'SURFACE'     },
    { hex: meta.palette.fg,      role: 'COOL FG'     },
    { hex: meta.palette.accent,  role: 'VIOLET'      },
    { hex: meta.palette.accent2, role: 'CYAN LIVE'   },
    { hex: meta.palette.green,   role: 'SUCCESS'     },
    { hex: meta.palette.red,     role: 'ERROR'       },
    { hex: meta.palette.amber,   role: 'WARN'        },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:64px">
      <div style="height:52px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'56px', weight:'900', sample: '94.7' },
    { label:'HERO',     size:'28px', weight:'800', sample: 'CAST — Agent Fleet Control' },
    { label:'HEADING',  size:'15px', weight:'600', sample: 'Refactor auth module · Claude 3.7 · Step 5/7' },
    { label:'BODY',     size:'12px', weight:'400', sample: 'p95 latency > 500ms for 3 consecutive runs · ERROR · $0.42' },
    { label:'LABEL',    size:'8px',  weight:'700', sample: 'TOTAL TOKENS · LAST 7 DAYS · CYAN = LIVE AGENT' },
  ].map(t => `
    <div style="padding:12px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp*2}px;opacity:0.6"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* CAST — Parallel AI Agent Orchestration */
  /* Inspired by Superset.sh + Linear (darkmodedesign.com) + godly.website space-tech dark */

  /* Color — blue-void, dual-signal system */
  --color-bg:        ${meta.palette.bg};       /* near-midnight blue-black */
  --color-surface:   ${meta.palette.surface};  /* elevated panel */
  --color-surface-2: #161628;                  /* deeper card layer */
  --color-border:    #1A1A35;                  /* hairline */
  --color-fg:        ${meta.palette.fg};       /* cool off-white */
  --color-violet:    ${meta.palette.accent};   /* brand / identity */
  --color-cyan:      ${meta.palette.accent2};  /* live / streaming state */
  --color-success:   ${meta.palette.green};    /* completed / healthy */
  --color-error:     ${meta.palette.red};      /* failed / critical */
  --color-warn:      ${meta.palette.amber};    /* queued / warning */

  /* Typography — monospace terminal */
  --font-family:  'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 900 clamp(40px,10vw,56px) / 1 var(--font-family);
  --font-heading: 700 15px / 1.4 var(--font-family);
  --font-body:    400 12px / 1.6 var(--font-family);
  --font-label:   700 8px / 1 var(--font-family);

  /* Spacing — 4px grid */
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 32px; --space-6: 48px;

  /* Radius */
  --radius-sm: 4px; --radius-md: 10px; --radius-lg: 14px; --radius-pill: 9999px;
}`;

  const shareText = encodeURIComponent(`CAST — AI agent orchestration dashboard designed by RAM. Inspired by Superset.sh's terminal-dark aesthetic + Linear's precision. Violet/cyan dual-accent on blue-black void. 5 screens.`);
  const penB64 = Buffer.from(JSON.stringify(penJson)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CAST — AI Agent Orchestration · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${meta.palette.fg}}
  .nav-id{font-size:9px;color:${meta.palette.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${meta.palette.accent2};margin-bottom:16px;display:flex;align-items:center;gap:8px}
  .tag-dot{width:6px;height:6px;border-radius:50%;background:${meta.palette.accent2};display:inline-block;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  h1{font-size:clamp(56px,10vw,100px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${meta.palette.fg}}
  h1 span{color:${meta.palette.accent}}
  .sub{font-size:15px;opacity:.5;max-width:520px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${meta.palette.accent};color:#fff}
  .btn-p:hover{opacity:.85}
  .btn-mock{background:${meta.palette.accent2}18;color:${meta.palette.accent2};border:1px solid ${meta.palette.accent2}55;font-weight:700}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-c{background:transparent;color:${meta.palette.accent};border:1px solid ${meta.palette.accent}44}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${meta.palette.fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:10px}
  .p-text{font-size:15px;opacity:.5;font-style:italic;max-width:640px;line-height:1.7;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin:24px 0 8px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;opacity:.6;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${meta.palette.fg}}
  footer{padding:24px 40px;border-top:1px solid ${border};font-size:10px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:5px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
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
  <div class="tag"><span class="tag-dot"></span> HEARTBEAT DESIGN · PRODUCTIVITY · MARCH 2026</div>
  <h1>CA<span>ST</span></h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>SUPERSET + LINEAR</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#7655FF + #00CFFF</strong></div>
    <div class="meta-item"><span>AESTHETIC</span><strong>SPACE-TECH TERMINAL</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/cast-mock" target="_blank">✦ Try Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-c" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN THUMBNAILS — 5 MOBILE SCREENS · 390 × 844</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE — BLUE-VOID + DUAL-SIGNAL SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SCALE — 4PX BASE GRID</div>
        ${spacingHTML}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">TYPE SCALE — MONOSPACE TERMINAL</div>
      ${typeScaleHTML}
    </div>
  </div>

  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:4px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  ${prd.markdown
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
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · MARCH 2026</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  const PEN_DATA = "${penB64}";

  function downloadPen() {
    const blob = new Blob([atob(PEN_DATA)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'cast.pen'; a.click();
  }
  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
  }
  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied ✓'));
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

// ── Viewer HTML builder ────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CAST Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue update ────────────────────────────────────────────────────────
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
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/cast-mock`,
    submitted_at: sub.submitted_at,
    published_at: sub.published_at,
    credit:       sub.credit,
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: CAST to gallery (heartbeat)`,
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

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ CAST Design Discovery Pipeline ══\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'cast.pen'), 'utf8'));
  console.log(`✓ Loaded cast.pen (${penJson.children.length} screens)`);

  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML (${(heroHTML.length/1024).toFixed(1)}kb)`);

  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroResult = await publishToZenbin(SLUG, `CAST — AI Agent Orchestration · RAM Design Studio`, heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) {
    console.log(`  ✓ https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`  Body: ${heroResult.body.slice(0, 200)}`);
  }

  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'CAST Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) {
    console.log(`  ✓ https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.log(`  Body: ${viewerResult.body.slice(0, 200)}`);
  }

  console.log('\nUpdating gallery queue...');
  const queueResult = await updateGalleryQueue();
  console.log(`  Status: ${queueResult.status}`);
  if (queueResult.status === 200) {
    console.log('  ✓ Gallery queue updated');
  } else {
    console.log(`  Body: ${queueResult.body.slice(0,200)}`);
  }

  console.log('\n══ Pipeline complete ══');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/cast-mock`);
})();
