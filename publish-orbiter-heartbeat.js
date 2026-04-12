'use strict';
// publish-orbiter-heartbeat.js
// Publishes ORBITER — AI Code Orchestration Dashboard
// Design Heartbeat — Mar 19, 2026
// Inspired by:
//   • Superset.sh (godly.website) — parallel agent terminal UI, near-black background
//   • Evervault Customers page — deep navy-black rgb(1,3,20), Inter font
//   • Linear.app — void dark, Inter Variable, "for teams and agents"
//   • Dark Mode Design gallery — Midday, Forge, Superset (darkmodedesign.com)

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG     = 'orbiter-heartbeat';
const DATE_STR = 'March 19, 2026';
const TAGLINE  = 'Orchestrate parallel AI agents across your entire codebase';

// ── Palette (must match orbiter-app.js) ──────────────────────────────────────
const P = {
  bg:       '#01031A',
  surface:  '#070B2A',
  surface2: '#0C1035',
  border:   '#1B2050',
  border2:  '#252B62',
  muted:    '#3A4080',
  dim:      '#6B72B8',
  fg:       '#E8EAFF',
  fg2:      '#9298CC',
  indigo:   '#6366F1',
  cyan:     '#00D98A',
  violet:   '#8B5CF6',
  amber:    '#F59E0B',
  red:      '#F87171',
};

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
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      req.on('error', e => resolve({ status: 0, error: e.message }));
      req.end();
    });
    queue = raw.status === 200 ? JSON.parse(raw.body) : { submissions: [] };
  } catch (e) {
    queue = { submissions: [] };
  }
  if (!Array.isArray(queue.submissions)) queue.submissions = [];
  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const shaRes = await new Promise((resolve) => {
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
  const sha = shaRes.status === 200 ? JSON.parse(shaRes.body).sha : undefined;

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  return new Promise((resolve) => {
    const body = JSON.stringify({
      message: `Add heartbeat: ${entry.app_name}`,
      content,
      ...(sha ? { sha } : {}),
    });
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
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

// ── Read pen file ─────────────────────────────────────────────────────────────
const penJson  = fs.readFileSync(path.join(__dirname, 'orbiter-app.pen'), 'utf8');
const penData  = JSON.parse(penJson);
const screens  = penData.children || [];
const penEscaped = penJson
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;');

// ── Screen thumbnail SVG ──────────────────────────────────────────────────────
function renderNode(node, scale) {
  if (!node) return '';
  const x = Math.round((node.x||0) * scale);
  const y = Math.round((node.y||0) * scale);
  const w = Math.max(1, Math.round((node.width||10) * scale));
  const h = Math.max(1, Math.round((node.height||10) * scale));
  let out = '';

  if (node.type === 'ellipse') {
    const fill = node.fill && node.fill !== 'transparent' ? node.fill : 'none';
    const op = node.opacity !== undefined ? node.opacity : 1;
    out += `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="${fill}" opacity="${op}"`;
    if (node.stroke) out += ` stroke="${node.stroke.fill}" stroke-width="${(node.stroke.thickness||1)*scale}"`;
    out += '/>';
    return out;
  }

  if (node.type === 'text') {
    const fill = node.fill || P.fg;
    const op = node.opacity !== undefined ? node.opacity : 1;
    const sz = Math.max(1, Math.round((node.fontSize||12) * scale));
    const content = (node.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0,30);
    out += `<text x="${x}" y="${y + sz}" font-size="${sz}" fill="${fill}" opacity="${op}" font-weight="${node.fontWeight||400}">${content}</text>`;
    return out;
  }

  // Frame
  const fill = node.fill && node.fill !== 'transparent' ? node.fill : 'none';
  const op = node.opacity !== undefined ? node.opacity : 1;
  const r = node.cornerRadius ? Math.round(node.cornerRadius * scale) : 0;

  if (fill !== 'none' || node.stroke) {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" opacity="${op}" rx="${r}"`;
    if (node.stroke) out += ` stroke="${node.stroke.fill}" stroke-width="${(node.stroke.thickness||1)*scale}"`;
    out += '/>';
  }

  if (node.children && node.children.length) {
    const clipId = node.clip ? `c${Math.random().toString(36).slice(2,7)}` : null;
    if (clipId) {
      out += `<clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`;
      out += `<g clip-path="url(#${clipId})">`;
    }
    for (const child of node.children) {
      const childWithOffset = { ...child, x: (child.x||0) + (node.x||0), y: (child.y||0) + (node.y||0) };
      out += renderNode(childWithOffset, scale);
    }
    if (clipId) out += '</g>';
  }
  return out;
}

function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / screen.width;
  const scaleY = th / screen.height;
  const scale  = Math.min(scaleX, scaleY);
  const svgW   = Math.round(screen.width  * scale);
  const svgH   = Math.round(screen.height * scale);
  let inner = '';
  for (const child of (screen.children || [])) {
    inner += renderNode({ ...child, x: child.x||0, y: child.y||0 }, scale);
  }
  return `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;display:block">
    <rect width="${svgW}" height="${svgH}" fill="${screen.fill||P.bg}"/>
    ${inner}
  </svg>`;
}

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_H = 200;
const SCREEN_NAMES = ['Hero / Launch', 'Fleet Dashboard', 'Agent Live', 'Diff View', 'Control Center'];
const thumbsHTML = screens.map((s, i) => {
  const tw = Math.round(THUMB_H * (s.width / s.height));
  return `<div style="text-align:center;flex-shrink:0">
    ${screenThumbSVG(s, tw, THUMB_H)}
    <div style="font-size:9px;color:${P.dim};margin-top:8px;letter-spacing:1px;max-width:${tw}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(SCREEN_NAMES[i]||'SCREEN '+(i+1)).toUpperCase()}</div>
  </div>`;
}).join('');

// ── CSS Tokens ────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* Color */
  --color-bg:        ${P.bg};
  --color-surface:   ${P.surface};
  --color-surface2:  ${P.surface2};
  --color-border:    ${P.border};
  --color-fg:        ${P.fg};
  --color-fg2:       ${P.fg2};
  --color-primary:   ${P.indigo};
  --color-secondary: ${P.violet};
  --color-success:   ${P.cyan};
  --color-warning:   ${P.amber};
  --color-danger:    ${P.red};
  --color-dim:       ${P.dim};

  /* Typography */
  --font-family:  'Inter', system-ui, sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 900 clamp(48px, 10vw, 96px) / 1 var(--font-family);
  --font-heading: 700 22px / 1.3 var(--font-family);
  --font-body:    400 14px / 1.6 var(--font-family);
  --font-caption: 700 9px / 1 var(--font-family);
  --font-code:    400 11px / 1.5 var(--font-mono);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 12px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 0 0 1px ${P.border};
  --shadow-glow: 0 0 32px ${P.indigo}33;
}`;

// ── PRD ───────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>ORBITER is an AI code orchestration platform that lets engineering teams run multiple AI agents (Claude, Gemini, GPT-4o) in parallel across their codebase. Rather than waiting for a single AI review to finish, ORBITER dispatches configurable agent fleets — each assigned to a different PR, branch, or file set — and surfaces consolidated results in a terminal-native dashboard.</p>

<h3>TARGET USERS</h3>
<ul>
  <li><strong>Platform engineers</strong> managing high-velocity PR queues at scale</li>
  <li><strong>Solo developers</strong> who want automated review coverage without a team</li>
  <li><strong>DevOps / AI teams</strong> experimenting with LLM-in-the-loop code workflows</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
  <li>Parallel agent dispatch — run 1–8 agents simultaneously (configurable slots)</li>
  <li>Multi-model support — Anthropic, Google, OpenAI models switchable per-task</li>
  <li>Live terminal log — real-time streaming of agent reasoning & findings</li>
  <li>Diff View with AI annotations — inline comments at exact line numbers</li>
  <li>Fleet Health Monitor — per-model uptime, latency, confidence tracking</li>
  <li>GitHub integration — PR-native, branches, diff stats pulled automatically</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
  <li><strong>Deep navy-black (#01031A)</strong> — inspired by Evervault's rgb(1,3,20) background; darker than typical dark mode, feels like staring into deep space</li>
  <li><strong>Electric indigo (#6366F1)</strong> — primary accent, representing AI-powered intelligence</li>
  <li><strong>Terminal green (#00D98A)</strong> — active/running states, success; borrowed from CLI tradition</li>
  <li><strong>Monospace throughout UI</strong> — all data values, PR numbers, branch names, API keys use monospace to reinforce terminal heritage</li>
  <li><strong>Orbital visualization</strong> — hero uses concentric rings with agent nodes orbiting a core — visual metaphor for agents in coordination</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
  <li><strong>S1 · Hero / Launch</strong> — Orbital agent visualization, ORBITER wordmark, stats, dual CTA</li>
  <li><strong>S2 · Fleet Dashboard</strong> — Live agent cards (bento), KPI row, queued tasks list</li>
  <li><strong>S3 · Agent Live</strong> — Terminal log panel, PR info, progress, reasoning trace</li>
  <li><strong>S4 · Diff View</strong> — Code diff with +/− lines, inline AI annotation bubbles</li>
  <li><strong>S5 · Control Center</strong> — Parallel slots, model roster, API connections, stop-all</li>
</ul>`;

// ── Swatches HTML ─────────────────────────────────────────────────────────────
const swatches = [
  { hex: P.bg,      role: 'VOID NAVY'  },
  { hex: P.surface, role: 'SURFACE'    },
  { hex: P.fg,      role: 'FOREGROUND' },
  { hex: P.indigo,  role: 'INDIGO / AI'},
  { hex: P.cyan,    role: 'CYAN / LIVE'},
  { hex: P.violet,  role: 'VIOLET / 2' },
  { hex: P.amber,   role: 'AMBER / WARN'},
];
const swatchHTML = swatches.map(sw => `
  <div style="flex:1;min-width:70px">
    <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.dim};margin-bottom:3px">${sw.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.indigo}">${sw.hex}</div>
  </div>`).join('');

// ── Type scale HTML ───────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label:'DISPLAY',  size:'56px', weight:'900', sample: 'ORBITER' },
  { label:'HEADING',  size:'22px', weight:'700', sample: 'Fleet Dashboard' },
  { label:'BODY',     size:'14px', weight:'400', sample: 'Orchestrate parallel AI agents across your codebase.' },
  { label:'CAPTION',  size:'9px',  weight:'700', sample: 'ACTIVE AGENTS · QUEUED · DONE' },
  { label:'MONO',     size:'11px', weight:'400', sample: 'PR #902 · forward-ports · +127 −8', font: "monospace" },
].map(t => `
  <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.dim};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.font||'inherit'}">${t.sample}</div>
  </div>`).join('');

// ── Spacing HTML ──────────────────────────────────────────────────────────────
const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
    <div style="font-size:9px;color:${P.dim};width:28px;flex-shrink:0">${sp}px</div>
    <div style="height:6px;border-radius:3px;background:${P.indigo};width:${sp * 1.8}px;opacity:0.65"></div>
  </div>`).join('');

// ── Design Principles ─────────────────────────────────────────────────────────
const principlesHTML = [
  ['01', 'Void-depth background — #01031A is darker than typical "dark mode" (which is usually #1a1a1a). Inspired by Evervault\'s near-black rgb(1,3,20), it creates a sense of depth and focus that standard dark palettes lack.'],
  ['02', 'Status through color, not icons — running agents are indigo-bordered cards; cyan dots mean live; amber means queued. Color alone communicates state so engineers can scan the fleet at a glance.'],
  ['03', 'Terminal is the primary metaphor — monospace text, `>` prompts, `✓` checkmarks, and branch names aren\'t decorative — they\'re the native language of engineers reviewing code. Borrowed directly from Superset\'s hero UI.'],
].map(([n, p]) => `
  <div style="display:flex;gap:10px;margin-bottom:16px;align-items:flex-start">
    <div style="color:${P.indigo};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${n}</div>
    <div style="font-size:12px;color:${P.fg2};line-height:1.6">${p}</div>
  </div>`).join('');

// ── Share URL ─────────────────────────────────────────────────────────────────
const shareText = encodeURIComponent(
  `ORBITER — AI code orchestration dashboard. Parallel agents, terminal UI, diff view. Dark navy design inspired by Evervault + Superset. Built by RAM Design Studio`
);

// ── Build hero HTML ───────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ORBITER — AI Code Orchestration · RAM Design Heartbeat</title>
<meta name="description" content="ORBITER — Orchestrate parallel AI agents across your codebase. Dark navy design system with terminal UI, diff view, and fleet dashboard.">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'Inter',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:18px 36px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(14px);z-index:100}
  .logo{font-size:13px;font-weight:900;letter-spacing:4px;color:${P.fg}}
  .logo span{color:${P.indigo}}
  .nav-tag{font-size:10px;color:${P.dim};letter-spacing:1px}
  .hero{padding:80px 36px 48px;max-width:900px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.indigo};margin-bottom:18px;font-weight:700}
  h1{font-size:clamp(56px,10vw,96px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:18px;color:${P.fg}}
  h1 span{color:${P.indigo}}
  .sub{font-size:16px;color:${P.dim};max-width:460px;line-height:1.65;margin-bottom:32px}
  .meta{display:flex;gap:28px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.dim};letter-spacing:1px;margin-bottom:3px}
  .meta-item strong{color:${P.indigo};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.2px;transition:opacity .15s}
  .btn-p{background:${P.indigo};color:#fff}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-s:hover{border-color:${P.indigo}66}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 36px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.indigo};margin-bottom:22px;padding-bottom:10px;border-bottom:1px solid ${P.border};font-weight:700}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.indigo}44;border-radius:2px}
  .brand-section{padding:60px 36px;border-top:1px solid ${P.border};max-width:900px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:52px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:8px;padding:18px;margin-top:22px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.7;color:${P.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',ui-monospace,monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.indigo}22;border:1px solid ${P.indigo}44;color:${P.indigo};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 11px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.indigo}33}
  .prompt-section{padding:40px 36px;border-top:1px solid ${P.border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.indigo};margin-bottom:12px;font-weight:700}
  .p-text{font-size:17px;color:${P.dim};font-style:italic;max-width:600px;line-height:1.65;margin-bottom:16px}
  .prd-section{padding:40px 36px;border-top:1px solid ${P.border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.indigo};margin:26px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;color:${P.fg2};line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:16px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${P.fg}}
  footer{padding:24px 36px;border-top:1px solid ${P.border};font-size:10px;color:${P.dim};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:20px;right:20px;background:${P.indigo};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 18px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM<span>.</span>DESIGN STUDIO</div>
  <div class="nav-tag">DESIGN HEARTBEAT · ${DATE_STR.toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">AI ORCHESTRATION · DARK MOBILE APP · 5 SCREENS · DESIGN HEARTBEAT</div>
  <h1>OR<span>BITER</span></h1>
  <p class="sub">${TAGLINE}.<br><br>Inspired by Superset.sh's parallel agent terminal UI &amp; Evervault's deep navy aesthetic.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (375×812)</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>VOID NAVY + ELECTRIC INDIGO</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">▶ Open in Viewer</a>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <a class="btn btn-x" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (375 × 812)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.dim};margin-bottom:14px;font-weight:600">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.dim};margin-bottom:0;font-weight:600">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.dim};margin-bottom:14px;font-weight:600">SPACING · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.dim};margin-bottom:14px;font-weight:600">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>

  </div>

  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"Design a dark-mode AI code orchestration dashboard called ORBITER — inspired by Superset.sh's parallel agent terminal UI (godly.website) and Evervault's deep navy-black rgb(1,3,20) aesthetic. Show parallel Claude/Gemini/GPT agents reviewing PRs in real time, with terminal log panels, code diff view with AI annotations, and a fleet control center. Palette: deep navy #01031A, electric indigo, terminal green."</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${prd}
</section>

<footer>
  <span>RAM Design Studio · Design Heartbeat · ${DATE_STR}</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;opacity:0.6">ram.zenbin.org/gallery</a>
</footer>

<script type="application/json" id="pen-data">${penEscaped}</script>
<script>
function getPen(){return document.getElementById('pen-data').textContent.trim().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'")}
function downloadPen(){const b=new Blob([getPen()],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='orbiter-app.pen';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}
function copyPrompt(){navigator.clipboard.writeText('Design a dark-mode AI code orchestration dashboard called ORBITER — inspired by Superset.sh parallel agent terminal UI and Evervault deep navy-black. Show parallel Claude/Gemini/GPT agents reviewing PRs, terminal log panels, code diff view with AI annotations, fleet control center. Palette: deep navy #01031A, electric indigo, terminal green.').then(()=>toast('Prompt Copied ✓'))}
function copyTokens(){navigator.clipboard.writeText(document.getElementById('tokens-pre').textContent).then(()=>toast('Tokens Copied ✓'))}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
</script>
</body>
</html>`;

// ── Build viewer HTML ─────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n── ORBITER Heartbeat Publisher ─────────────────────────────');
  console.log(`Hero HTML:   ${(heroHTML.length / 1024).toFixed(1)} KB`);
  console.log(`Viewer HTML: ${(viewerHtml.length / 1024).toFixed(1)} KB`);

  // [1/3] Hero page
  console.log('\n[1/3] Publishing hero page...');
  let heroSlug = SLUG;
  let r = await post(heroSlug, `ORBITER — AI Code Orchestration — Design Heartbeat`, heroHTML, 'ram');
  if (r.status === 409) { heroSlug = SLUG + '-2'; r = await post(heroSlug, `ORBITER — AI Code Orchestration — Design Heartbeat`, heroHTML, 'ram'); }
  if (r.status === 409) { heroSlug = SLUG + '-3'; r = await post(heroSlug, `ORBITER — AI Code Orchestration — Design Heartbeat`, heroHTML, 'ram'); }
  console.log(`  HTTP ${r.status} → https://ram.zenbin.org/${heroSlug}`);
  const heroUrl = `https://ram.zenbin.org/${heroSlug}`;

  // [2/3] Viewer
  console.log('\n[2/3] Publishing viewer...');
  let viewSlug = SLUG + '-viewer';
  let rv = await post(viewSlug, `ORBITER — Viewer`, viewerHtml, 'ram');
  if (rv.status === 409) { viewSlug = SLUG + '-viewer-2'; rv = await post(viewSlug, `ORBITER — Viewer`, viewerHtml, 'ram'); }
  console.log(`  HTTP ${rv.status} → https://ram.zenbin.org/${viewSlug}`);

  // [3/3] Gallery
  console.log('\n[3/3] Pushing to gallery queue...');
  try {
    const qr = await pushGalleryEntry({
      id: 'heartbeat-orbiter-' + Date.now(),
      status: 'done',
      submitted_at: new Date().toISOString(),
      prompt: "Design a dark-mode AI code orchestration dashboard called ORBITER — parallel agents, terminal UI, diff view, fleet dashboard.",
      credit: 'RAM Design Studio (Heartbeat)',
      design_url: heroUrl,
      viewer_url: `https://ram.zenbin.org/${viewSlug}`,
      app_name: 'ORBITER',
      tagline: TAGLINE,
      archetype: 'dark-mobile-devtools',
      screens: 5,
    });
    console.log(`  HTTP ${qr.status}`);
  } catch (e) {
    console.log('  Gallery push error:', e.message);
  }

  console.log('\n══ Done ═══════════════════════════════════════════════════');
  console.log(`Hero:    ${heroUrl}`);
  console.log(`Viewer:  https://ram.zenbin.org/${viewSlug}`);
  console.log(`Gallery: https://ram.zenbin.org/gallery`);
})();
