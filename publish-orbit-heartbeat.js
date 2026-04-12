'use strict';
// publish-orbit-heartbeat.js
// Full Design Discovery pipeline for ORBIT
// Design Heartbeat — Mar 21, 2026
// Inspired by:
//   • Linear (linear.app via darkmodedesign.com) — #08090A near-black, #5E6AD2 purple, Inter
//   • Atlas Card (atlascard.com via godly.website) — ApercuMono, exclusive SaaS dark design
//   • Obsidian OS (obsidianos.com via darkmodedesign.com) — AI-powered B2B platform aesthetic

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'orbit-heartbeat';
const VIEWER_SLUG = 'orbit-viewer';
const DATE_STR    = 'March 21, 2026';
const APP_NAME    = 'ORBIT';
const TAGLINE     = 'The system for humans and agents';

// ── Palette (matches orbit-app.js) ───────────────────────────────────────────
const P = {
  bg:        '#08090A',
  surface:   '#0F1012',
  surface2:  '#161719',
  surface3:  '#1F2023',
  border:    '#1F2023',
  border2:   '#2C2F34',
  accent:    '#5E6AD2',
  accentHi:  '#7B84E8',
  accentDim: '#3A4199',
  fg:        '#F7F8F8',
  fg2:       '#8A8F98',
  fg3:       '#3D4148',
  green:     '#4ADE80',
  amber:     '#F59E0B',
  red:       '#F87171',
  blue:      '#60A5FA',
  purple:    '#C084FC',
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
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
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 200) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

function githubPost(token, repo, payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const opts = {
      hostname: 'api.github.com',
      path:     `/repos/${repo}/dispatches`,
      method:   'POST',
      headers: {
        Authorization:  `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent':   'RAM-Studio/1.0',
        Accept:         'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: d.slice(0, 200) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';

  if (el.type === 'frame') {
    const bg   = fill !== 'transparent' && fill !== 'none'
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`
      : '';
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids) return bg;
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.72));
    const textFill = el.fill || P.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w}" height="${fh}" fill="${textFill}"${oAttr} rx="1" opacity="0.7"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill || P.bg}"/>${kids}</svg>`;
}

// ── Markdown → HTML ───────────────────────────────────────────────────────────
function mdToHtml(md) {
  return md.split('\n\n').map(block => {
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

// ── Build hero HTML ───────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const screens = pen.children || [];

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || `SCREEN ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,       role: 'BACKGROUND' },
    { hex: P.surface2, role: 'SURFACE' },
    { hex: P.fg,       role: 'FOREGROUND' },
    { hex: P.accent,   role: 'ACCENT' },
    { hex: P.accentHi, role: 'ACCENT HI' },
    { hex: P.green,    role: 'LIVE' },
    { hex: P.purple,   role: 'AI AGENT' },
    { hex: P.amber,    role: 'PENDING' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:48px;background:${sw.hex};border:1px solid #1F2023;margin-bottom:8px;border-radius:2px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '48px', weight: '800', sample: 'ORBIT', font: 'system-ui' },
    { label: 'HEADING',  size: '22px', weight: '700', sample: 'The system for humans & agents', font: 'system-ui' },
    { label: 'BODY',     size: '13px', weight: '400', sample: 'Sprint 14 · 14/22 issues resolved · 4 agents running', font: 'system-ui' },
    { label: 'MONO',     size: '11px', weight: '400', sample: 'orbit-agent-3 · ORB-238 · dispatch.ts', font: 'monospace' },
    { label: 'CAPTION',  size: '9px',  weight: '700', sample: 'IN PROGRESS · AI AGENT · SPRINT 14', font: 'system-ui' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid #1F2023">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};font-family:${t.font};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 20, 24, 32, 44, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:8px;background:${P.accent};width:${sp * 2}px;opacity:0.7;border-radius:1px"></div>
    </div>`).join('');

  const principles = [
    'System over decoration — every visual element must encode information, not style.',
    'Purple-blue as the single thermal signal — only actionable or active states use accent color.',
    'Near-black depth — three surface levels (#0F1012, #161719, #1F2023) create hierarchy without color noise.',
    'Agent-first language — AI tasks are first-class citizens, annotated with ⬡ glyphs and purple type.',
    'Monospace for machine outputs — agent logs, IDs, and durations always render in monospace.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${P.accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* ORBIT Color System — Linear-inspired */
  --color-bg:         #08090A;   /* Linear exact near-black */
  --color-surface:    #0F1012;   /* base surface */
  --color-surface-2:  #161719;   /* elevated card */
  --color-surface-3:  #1F2023;   /* highest elevation */
  --color-border:     #1F2023;   /* subtle divider */
  --color-border-2:   #2C2F34;   /* stronger border */
  --color-accent:     #5E6AD2;   /* Linear purple-blue (exact) */
  --color-accent-hi:  #7B84E8;   /* lighter purple-blue */
  --color-accent-dim: #3A4199;   /* dimmed accent fills */
  --color-fg:         #F7F8F8;   /* Linear off-white */
  --color-fg-2:       #8A8F98;   /* muted secondary */
  --color-fg-3:       #3D4148;   /* very muted tertiary */

  /* Status semantic colors */
  --color-live:    #4ADE80;   /* running agent / done */
  --color-pending: #F59E0B;   /* queued / waiting */
  --color-failed:  #F87171;   /* error / blocked */
  --color-info:    #60A5FA;   /* in-progress / neutral */
  --color-agent:   #C084FC;   /* AI-generated / agent label */

  /* Typography */
  --font-ui:   -apple-system, 'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* Font scale */
  --text-display: 800 48px / 1 var(--font-ui);
  --text-h1:      700 22px / 1.3 var(--font-ui);
  --text-h2:      700 18px / 1.3 var(--font-ui);
  --text-body:    400 13px / 1.6 var(--font-ui);
  --text-small:   400 11px / 1.4 var(--font-ui);
  --text-mono:    400 11px / 1.5 var(--font-mono);
  --text-label:   700 9px / 1 var(--font-ui);

  /* Spacing — 4px base */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 20px;  --space-5: 24px;  --space-6: 32px;
  --space-7: 44px;  --space-8: 64px;

  /* Component tokens */
  --radius-sm:   6px;
  --radius-md:   8px;
  --radius-lg:   10px;
  --radius-pill: 10px;
  --border-thin: 1px solid var(--color-border);
  --border-mid:  1px solid var(--color-border-2);
  --border-accent: 1px solid var(--color-accent-dim);

  /* Motion */
  --duration-fast:   120ms;
  --duration-base:   200ms;
  --easing-standard: cubic-bezier(0.2, 0, 0, 1);
}`;

  const PROMPT = `Design an AI-native development operations platform in the style of Linear's dark system aesthetic — exact palette #08090A background, #5E6AD2 purple-blue accent, Inter Variable typography at 64px display scale. The app (ORBIT) manages both human engineers and AI agents in a unified task, sprint, and review workflow. Include: landing hero, board view with agent activity strip, issue detail with live agent log, agent roster with progress bars, sprint burndown and velocity, and workspace settings with agent permission controls. AI tasks are first-class citizens annotated with ⬡ glyphs. 6 screens.`;

  const prdHTML = mdToHtml(`
## Overview

ORBIT is an AI-native development operations platform that treats human engineers and AI agents as first-class, co-equal participants in the software delivery workflow. Inspired by Linear's systematic dark design language, ORBIT extends the issue-tracking paradigm to include agent queues, agent progress monitoring, and agent permission governance.

The core insight: the shift from "AI assists developers" to "AI agents and developers are peers" requires new UI primitives. ORBIT introduces the ⬡ glyph as a universal AI-origin marker, purple as the agent semantic color, and real-time agent progress cards embedded inline in the standard board view.

## Target Users

- **Engineering teams of 5–50** migrating from Jira/Linear who want native agent orchestration
- **Platform engineers** who need visibility into concurrent AI agent workloads and spend
- **Indie developers / solo founders** running autonomous agent pipelines with periodic human review gates

## Core Features

- **Unified board** — human issues and AI agent tasks on the same kanban board, visually distinguished via ⬡ badge and purple type
- **Agent roster** — real-time fleet view with per-agent progress bars, duration, and task references
- **Live agent log panel** — embedded in issue detail, streams agent reasoning and file operations as they happen
- **Sprint analytics** — velocity chart across 8 sprints, burndown with ideal line, issue breakdown by type including AI-agent tasks
- **Agent permission governance** — workspace settings control PR creation rights, branch merge rights, concurrency limits, and monthly spend caps

## Design Language

Linear-derived systematic dark: three near-black surface levels (#08090A / #0F1012 / #161719) provide spatial hierarchy without color noise. The single accent color (#5E6AD2 purple-blue) marks every actionable or active element. Agent-specific UI uses #C084FC purple to distinguish machine origin from human origin at a glance.

Monospace font is reserved exclusively for machine outputs: agent names, issue IDs, log lines, durations. All human-readable UI uses Inter Variable. The distinction is intentional — it encodes who wrote what.

## Screen Architecture

1. **Landing / Hero** — full-dark marketing page, 38px display headings, ambient purple glow, CTA + feature pills
2. **Board View** — sprint progress bar, kanban column headers, issue list with ⬡ badges, live agent activity strip
3. **Issue Detail** — status/type pills, description, live agent log card with streaming log lines, activity timeline
4. **Agent Roster** — stats strip (running/queued/done), per-agent progress cards, queue preview
5. **Sprint Planning** — velocity bar chart (8 sprints), KPI row, burndown, issue breakdown bars
6. **Workspace Settings** — plan badge, agent permission toggles, integration status, danger zone
`);

  const heroURL    = `https://ram.zenbin.org/${SLUG}`;
  const viewerURL  = `https://ram.zenbin.org/${VIEWER_SLUG}`;
  const shareText  = encodeURIComponent(`ORBIT — AI-native devops platform in Linear's dark system aesthetic. 6 screens + full brand spec + CSS tokens. Built by RAM Design Studio`);
  const shareURL   = encodeURIComponent(heroURL);
  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="ORBIT: AI-native development operations. Linear-inspired dark system design. 6 screens + CSS tokens.">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:-apple-system,'Inter','Segoe UI',system-ui,sans-serif;line-height:1.6}
  a{color:${P.accentHi};text-decoration:none}
  a:hover{text-decoration:underline}
  .container{max-width:900px;margin:0 auto;padding:0 24px}

  /* Hero */
  .hero{padding:72px 0 56px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:40px;left:50%;transform:translateX(-50%);
    width:600px;height:300px;background:radial-gradient(ellipse at center,${P.accent}18 0%,transparent 70%);pointer-events:none}
  .hero-tag{display:inline-block;padding:4px 14px;background:${P.accentDim};color:${P.accentHi};
    font-size:10px;font-weight:700;letter-spacing:2px;border-radius:20px;margin-bottom:24px}
  .hero-name{font-size:clamp(52px,10vw,96px);font-weight:900;letter-spacing:-2px;line-height:1;
    background:linear-gradient(135deg,${P.fg} 0%,${P.accentHi} 100%);-webkit-background-clip:text;
    -webkit-text-fill-color:transparent;background-clip:text;margin-bottom:16px}
  .hero-tagline{font-size:clamp(16px,3vw,22px);color:${P.fg2};margin-bottom:8px}
  .hero-date{font-size:11px;color:${P.fg3};letter-spacing:1px;margin-bottom:40px}
  .hero-prompt{font-size:15px;color:${P.fg2};font-style:italic;max-width:640px;margin:0 auto 40px;
    line-height:1.8;padding:24px;background:${P.surface2};border-radius:8px;border-left:3px solid ${P.accent}}

  /* Actions */
  .actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:48px}
  .btn{padding:12px 24px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;
    border:none;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:opacity .15s}
  .btn:hover{opacity:.85;text-decoration:none}
  .btn-primary{background:${P.accent};color:#fff}
  .btn-secondary{background:${P.surface2};color:${P.fg};border:1px solid ${P.border2}}
  .btn-outline{background:transparent;color:${P.fg2};border:1px solid ${P.border2}}

  /* Screens strip */
  .screens-section{margin-bottom:64px}
  .section-label{font-size:9px;font-weight:700;letter-spacing:2px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .screens-strip{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px;
    scrollbar-width:thin;scrollbar-color:${P.border2} transparent}
  .screens-strip::-webkit-scrollbar{height:4px}
  .screens-strip::-webkit-scrollbar-track{background:transparent}
  .screens-strip::-webkit-scrollbar-thumb{background:${P.border2};border-radius:2px}

  /* Brand spec */
  .spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:64px}
  @media(max-width:600px){.spec-grid{grid-template-columns:1fr}}
  .spec-card{background:${P.surface2};border:1px solid ${P.border};border-radius:10px;padding:24px}
  .spec-card h3{font-size:10px;font-weight:700;letter-spacing:2px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .palette{display:flex;gap:10px;flex-wrap:wrap}

  /* Tokens */
  .tokens-section{margin-bottom:64px}
  .tokens-block{background:${P.surface2};border:1px solid ${P.border};border-radius:10px;
    padding:24px;position:relative}
  .tokens-block pre{font-family:'SF Mono','Fira Code',monospace;font-size:11px;
    color:${P.fg2};overflow-x:auto;line-height:1.7;white-space:pre}
  .copy-btn{position:absolute;top:16px;right:16px;background:${P.accentDim};color:${P.accentHi};
    border:none;border-radius:6px;padding:6px 14px;font-size:10px;font-weight:700;
    letter-spacing:1px;cursor:pointer;transition:background .15s}
  .copy-btn:hover{background:${P.accent};color:#fff}

  /* PRD */
  .prd-section{margin-bottom:64px}
  .prd-body{color:${P.fg2};font-size:14px;line-height:1.8}
  .prd-body h3{font-size:16px;font-weight:700;color:${P.fg};margin:28px 0 12px}
  .prd-body p{margin-bottom:14px}
  .prd-body ul{padding-left:20px;margin-bottom:14px}
  .prd-body li{margin-bottom:6px}
  .prd-body strong{color:${P.fg}}

  /* Footer */
  .footer{padding:48px 0;border-top:1px solid ${P.border};text-align:center;
    color:${P.fg3};font-size:12px}
  .footer a{color:${P.fg3}}
</style>
</head>
<body>

<div class="container">
  <!-- Hero -->
  <div class="hero">
    <div class="hero-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
    <div class="hero-name">${APP_NAME}</div>
    <div class="hero-tagline">${TAGLINE}</div>
    <div class="hero-date">Design Heartbeat · Linear-inspired dark system aesthetics</div>
    <div class="hero-prompt">${PROMPT}</div>
    <div class="actions">
      <a href="https://ram.zenbin.org/${VIEWER_SLUG}" class="btn btn-primary" target="_blank">▶ Open in Viewer</a>
      <a href="data:application/json;base64,${penEncoded}" download="orbit-app.pen" class="btn btn-secondary">↓ Download .pen</a>
      <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.querySelector('.hero-prompt').textContent).then(()=>this.textContent='✓ Copied!')">⎘ Copy Prompt</button>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}" class="btn btn-outline" target="_blank">𝕏 Share</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">⬡ Gallery</a>
    </div>
  </div>

  <!-- Screen Thumbnails -->
  <div class="screens-section">
    <div class="section-label">6 Screens</div>
    <div class="screens-strip">${thumbsHTML}</div>
  </div>

  <!-- Brand Spec -->
  <div class="spec-grid">
    <div class="spec-card">
      <h3>Color Palette</h3>
      <div class="palette">${swatchHTML}</div>
    </div>
    <div class="spec-card">
      <h3>Type Scale</h3>
      ${typeScaleHTML}
    </div>
    <div class="spec-card">
      <h3>Spacing System</h3>
      ${spacingHTML}
    </div>
    <div class="spec-card">
      <h3>Design Principles</h3>
      ${principlesHTML}
    </div>
  </div>

  <!-- CSS Tokens -->
  <div class="tokens-section">
    <div class="section-label">CSS Design Tokens</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.querySelector('.tokens-block pre').textContent).then(()=>this.textContent='✓ Copied!')">COPY TOKENS</button>
      <pre>${cssTokens}</pre>
    </div>
  </div>

  <!-- PRD -->
  <div class="prd-section">
    <div class="section-label">Product Brief</div>
    <div class="spec-card">
      <div class="prd-body">${prdHTML}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Built by <strong style="color:${P.fg2}">RAM Design Studio</strong> · Heartbeat ${DATE_STR}</p>
    <p style="margin-top:8px"><a href="https://ram.zenbin.org/gallery">← Gallery</a> · <a href="https://ram.zenbin.org/${VIEWER_SLUG}">Open Viewer →</a></p>
  </div>
</div>

</body>
</html>`;
}

// ── Build viewer HTML ─────────────────────────────────────────────────────────
function buildViewerHTML(pen) {
  const penJson = JSON.stringify(pen);
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'axon-viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== ORBIT Design Discovery Pipeline ===\n');

  // Load pen
  const penPath = path.join(__dirname, 'orbit-app.pen');
  const pen     = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded pen: ${pen.children.length} screens`);

  // (a) Hero page
  console.log('\n[1/4] Building hero page…');
  const heroHTML = buildHeroHTML(pen);
  console.log(`  Hero HTML: ${(heroHTML.length / 1024).toFixed(1)} KB`);

  console.log('[2/4] Publishing hero → ram.zenbin.org/' + SLUG);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`  → ${heroRes.status}  ${heroRes.body}`);

  // (b) Viewer
  console.log('\n[3/4] Building viewer with embedded pen…');
  const viewerHTML = buildViewerHTML(pen);
  console.log(`  Viewer HTML: ${(viewerHTML.length / 1024).toFixed(1)} KB`);

  console.log('  Publishing viewer → ram.zenbin.org/' + VIEWER_SLUG);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`  → ${viewerRes.status}  ${viewerRes.body}`);

  // (c) Gallery queue
  console.log('\n[4/4] Adding to gallery queue…');
  const queuePayload = {
    event_type: 'new_design',
    client_payload: {
      id:          `hb-orbit-${Date.now()}`,
      prompt:      `AI-native DevOps platform in Linear's dark system aesthetic. #08090A bg, #5E6AD2 purple-blue accent, agent-native UI with ⬡ glyphs. Board, issue detail, agent roster, sprint analytics, settings. 6 screens.`,
      app_type:    'devops',
      credit:      'RAM Studio',
      design_url:  `https://ram.zenbin.org/${SLUG}`,
      viewer_url:  `https://ram.zenbin.org/${VIEWER_SLUG}`,
      submitted_at: new Date().toISOString(),
      status:      'done',
    },
  };
  const ghRes = await githubPost(GITHUB_TOKEN, GITHUB_REPO, queuePayload);
  console.log(`  → GitHub: ${ghRes.status}  ${ghRes.body}`);

  console.log('\n=== Pipeline complete ===');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
}

main().catch(console.error);
