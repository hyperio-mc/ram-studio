'use strict';
// publish-nova-heartbeat.js
// Full Design Discovery pipeline for NOVA
// Design Heartbeat — Mar 21, 2026
// Inspired by:
//   • Evervault.com (godly.website nominee) — #010314 cosmic deep navy, #DFE1F4 soft blue-white
//   • Linear.app (darkmodedesign.com) — systematic dark hierarchy, Inter Variable
//   • Minimal.gallery — pure dark, high-contrast aesthetic

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'nova-heartbeat';
const VIEWER_SLUG = 'nova-viewer';
const DATE_STR    = 'March 21, 2026';
const APP_NAME    = 'NOVA';
const TAGLINE     = 'AI-Powered Code Review';
const ARCHETYPE   = 'productivity';

const ORIGINAL_PROMPT = `Design an AI-native code review platform using Evervault's cosmic dark palette (#010314 deep navy bg, #DFE1F4 soft blue-white text, #14E8D0 electric teal accent) discovered on godly.website. The platform (NOVA) surfaces AI-generated code insights inline with human review threads, with animated diff highlights, AI confidence scores, and a real-time team analytics dashboard. 5 screens: PR dashboard, code diff with AI annotations, review conversation thread, team velocity analytics, and notification settings.`;

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#010314',
  surface:   '#060B2A',
  surface2:  '#0C1240',
  surface3:  '#131A55',
  border:    '#1A2270',
  border2:   '#243090',
  accent:    '#14E8D0',
  accentDim: '#0A6E63',
  accentHi:  '#4DF7E8',
  fg:        '#DFE1F4',
  fg2:       '#8890C4',
  fg3:       '#3D4580',
  green:     '#34D399',
  amber:     '#FBBF24',
  red:       '#F87171',
  purple:    '#A78BFA',
  blue:      '#60A5FA',
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
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';

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
    const textFill = el.fill || P.fg;
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w}" height="${fh}" fill="${textFill}"${oAttr} rx="1" opacity="0.6"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0;border:1px solid ${P.border}"><rect width="${sw}" height="${sh}" fill="${screen.fill || P.bg}"/>${kids}</svg>`;
}

// ── Markdown → HTML ───────────────────────────────────────────────────────────
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

// ── Build hero HTML ───────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const screens = pen.children || [];

  const THUMB_H = 200;
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
    { hex: P.surface3, role: 'ELEVATED' },
    { hex: P.fg,       role: 'FOREGROUND' },
    { hex: P.fg2,      role: 'MUTED' },
    { hex: P.accent,   role: 'TEAL ACCENT' },
    { hex: P.purple,   role: 'AI AGENT' },
    { hex: P.green,    role: 'APPROVED' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px;max-width:90px">
      <div style="height:44px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:6px;border-radius:4px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:2px">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accent};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '52px', weight: '900', sample: 'NOVA', font: 'system-ui' },
    { label: 'HEADING',  size: '20px', weight: '700', sample: 'AI-Powered Code Review', font: 'system-ui' },
    { label: 'BODY',     size: '13px', weight: '400', sample: 'PR #2341 · refactor: move auth to middleware — 3 AI insights', font: 'system-ui' },
    { label: 'MONO',     size: '11px', weight: '400', sample: 'nova/auth-middleware · sha:a3f2b1 · 4m ago', font: 'monospace' },
    { label: 'LABEL',    size: '9px',  weight: '700', sample: 'AI INSIGHT · APPROVED · BLOCKER', font: 'system-ui' },
  ].map(t => `
    <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.35;margin-bottom:5px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};font-family:${t.font};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
      <div style="font-size:9px;opacity:.35;width:30px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:7px;background:linear-gradient(90deg,${P.accent},${P.purple});width:${sp * 2}px;opacity:0.6;border-radius:2px"></div>
    </div>`).join('');

  const principles = [
    'Cosmic depth over flat darkness — three navy surface layers (#010314 → #060B2A → #0C1240) create spatial hierarchy without visual noise.',
    'Teal as singular trust signal — electric #14E8D0 marks only AI confidence scores, approvals, and actionable states.',
    'Purple for machine-origin — AI-generated insights, agent labels, and suggested changes use #A78BFA to distinguish from human review.',
    'Monospace for code identity — all file paths, SHAs, branch names, and log output use monospace; human prose uses system-ui.',
    'Inline AI, not modal AI — AI insights appear as cards embedded in the diff stream, not in separate panels that break flow.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-start">
      <div style="color:${P.accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* NOVA Color System — Evervault-inspired Cosmic Dark */
  --color-bg:         #010314;   /* Evervault exact cosmic deep navy */
  --color-surface:    #060B2A;   /* base surface layer */
  --color-surface-2:  #0C1240;   /* elevated card */
  --color-surface-3:  #131A55;   /* highest elevation */
  --color-border:     #1A2270;   /* subtle border */
  --color-border-2:   #243090;   /* stronger border */

  /* Accent — electric teal (differentiates from purple-blue ecosystems) */
  --color-accent:     #14E8D0;
  --color-accent-dim: #0A6E63;
  --color-accent-hi:  #4DF7E8;

  /* Text — Evervault soft blue-white */
  --color-fg:         #DFE1F4;   /* Evervault exact */
  --color-fg-2:       #8890C4;   /* muted blue-toned */
  --color-fg-3:       #3D4580;   /* very muted */

  /* Semantic status */
  --color-approved:   #34D399;
  --color-pending:    #FBBF24;
  --color-blocked:    #F87171;
  --color-info:       #60A5FA;
  --color-ai:         #A78BFA;   /* AI/agent origin marker */

  /* Typography */
  --font-ui:   -apple-system, 'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* Font scale */
  --text-display: 900 52px / 1 var(--font-ui);
  --text-h1:      700 20px / 1.3 var(--font-ui);
  --text-h2:      700 16px / 1.3 var(--font-ui);
  --text-body:    400 13px / 1.6 var(--font-ui);
  --text-small:   400 11px / 1.4 var(--font-ui);
  --text-code:    400 11px / 1.6 var(--font-mono);
  --text-label:   700 9px / 1 var(--font-ui);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;
  --space-7: 48px;  --space-8: 64px;

  /* Radii */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   12px;
  --radius-pill: 20px;

  /* Borders */
  --border-default: 1px solid var(--color-border);
  --border-strong:  1px solid var(--color-border-2);
  --border-accent:  1px solid var(--color-accent-dim);
  --border-ai:      1px solid rgba(167, 139, 250, 0.3);

  /* AI diff line colors */
  --diff-added:   rgba(52, 211, 153, 0.08);
  --diff-removed: rgba(248, 113, 113, 0.08);
  --diff-ai-mark: rgba(20, 232, 208, 0.12);

  /* Motion */
  --duration-fast: 100ms;
  --duration-base: 180ms;
  --easing-snap:   cubic-bezier(0.16, 1, 0.3, 1);
}`;

  const prdHTML = mdToHtml(`
## Overview

NOVA is an AI-native code review platform that embeds artificial intelligence analysis directly into the pull request workflow. Unlike bolt-on AI features, NOVA treats AI-generated insights as first-class review participants — displayed inline in the diff stream with confidence scores, actionable suggestions, and their own reply threads.

The core thesis: code review is fundamentally a knowledge-transfer problem. NOVA's AI surfaces implicit architectural concerns, security implications, and performance tradeoffs that humans miss under time pressure — not as alerts, but as structured, threadable comments with clear confidence signals.

## Target Users

- **Engineering teams of 5–100** using GitHub/GitLab who want AI review beyond simple linting
- **Staff+ engineers and tech leads** who review many PRs and want AI pre-triage
- **Security-conscious teams** needing automated vulnerability scanning with context
- **Fast-moving startups** where review bottlenecks cause deploy delays

## Core Features

- **AI Diff Annotations** — inline AI cards in the diff stream showing vulnerability flags, refactor suggestions, and performance insights with confidence percentages
- **Review Thread with AI context** — threaded conversations where AI insights are proper participants, not sidebars
- **PR Dashboard** — prioritized queue with AI triage scores, estimated review times, and blocker flags
- **Team Analytics** — PR velocity by sprint, individual contribution charts, average review-to-merge time
- **Granular notification settings** — per-repo, per-author, and per-AI-confidence-level notification rules

## Design Language

Evervault-inspired cosmic dark: the deep navy background (#010314) creates a distinctive "space" aesthetic that signals security and trust without the aggression of pure black. Three surface levels provide hierarchy. Electric teal (#14E8D0) is the sole accent — appearing only on AI confidence signals and approval states. Purple (#A78BFA) marks all AI-origin content.

The diff viewer uses color-coded line backgrounds (green adds, red removes) at very low opacity to preserve the dark tone while maintaining git diff semantics. AI annotation cards use a left accent border in teal to distinguish from human comments.

## Screen Architecture

1. **PR Dashboard** — prioritized PR queue with AI confidence scores, status indicators, progress bars, and ambient AI insight banner
2. **Code Diff View** — tab-navigated PR detail with file tree header, line-by-line diff, and floating AI annotation card
3. **Review Thread** — AI summary card at top with confidence score, threaded human + AI comments, inline reply input
4. **Team Analytics** — sprint velocity bar chart (8 sprints), review time trend, contributor leaderboard with progress bars
5. **Settings / Notifications** — profile card, notification toggles, repo scope selector, danger zone
`);

  const heroURL   = `https://ram.zenbin.org/${SLUG}`;
  const viewerURL = `https://ram.zenbin.org/${VIEWER_SLUG}`;
  const mockURL   = `https://ram.zenbin.org/nova-mock`;
  const shareText = encodeURIComponent(`NOVA — AI-Powered Code Review Platform. Evervault's cosmic dark palette (#010314 navy, #14E8D0 teal). 5 screens + brand spec + CSS tokens. Built by RAM Design Studio`);
  const shareURL  = encodeURIComponent(heroURL);
  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="NOVA: AI-powered code review in Evervault's cosmic dark. #010314 deep navy, #14E8D0 electric teal. 5 screens + CSS tokens.">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:-apple-system,'Inter','Segoe UI',system-ui,sans-serif;line-height:1.6}
  a{color:${P.accentHi};text-decoration:none}
  a:hover{text-decoration:underline}
  .container{max-width:920px;margin:0 auto;padding:0 24px}

  /* Hero */
  .hero{padding:80px 0 60px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
    width:700px;height:400px;background:radial-gradient(ellipse at 50% 30%,${P.accent}12 0%,${P.purple}08 40%,transparent 70%);pointer-events:none}
  .hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${P.border},transparent)}
  .hero-tag{display:inline-block;padding:5px 16px;background:${P.accentDim};color:${P.accentHi};
    font-size:10px;font-weight:700;letter-spacing:2px;border-radius:20px;margin-bottom:28px;
    border:1px solid ${P.accent}40}
  .hero-name{font-size:clamp(56px,12vw,104px);font-weight:900;letter-spacing:-3px;line-height:0.9;
    background:linear-gradient(150deg,${P.fg} 0%,${P.accentHi} 55%,${P.purple} 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    margin-bottom:20px;padding-bottom:8px}
  .hero-tagline{font-size:clamp(15px,2.5vw,20px);color:${P.fg2};margin-bottom:8px;font-weight:300;letter-spacing:0.5px}
  .hero-date{font-size:11px;color:${P.fg3};letter-spacing:1.5px;margin-bottom:44px;text-transform:uppercase}
  .hero-prompt{font-size:14px;color:${P.fg2};font-style:italic;max-width:660px;margin:0 auto 48px;
    line-height:1.9;padding:28px;background:${P.surface};border-radius:12px;
    border-left:3px solid ${P.accent};border:1px solid ${P.border};border-left:3px solid ${P.accent}}

  /* Actions */
  .actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:56px}
  .btn{padding:11px 22px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;
    border:none;text-decoration:none;display:inline-flex;align-items:center;gap:8px;
    transition:all .15s;letter-spacing:0.5px}
  .btn:hover{opacity:.85;text-decoration:none;transform:translateY(-1px)}
  .btn-primary{background:linear-gradient(135deg,${P.accent},${P.accentHi});color:${P.bg}}
  .btn-secondary{background:${P.surface2};color:${P.fg};border:1px solid ${P.border2}}
  .btn-outline{background:transparent;color:${P.fg2};border:1px solid ${P.border}}
  .btn-mock{background:linear-gradient(135deg,${P.purple},#7C3AED);color:#fff}

  /* Screens strip */
  .screens-section{margin-bottom:72px}
  .section-label{font-size:9px;font-weight:700;letter-spacing:2.5px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .screens-strip{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px;
    scrollbar-width:thin;scrollbar-color:${P.border2} transparent}
  .screens-strip::-webkit-scrollbar{height:4px}
  .screens-strip::-webkit-scrollbar-track{background:transparent}
  .screens-strip::-webkit-scrollbar-thumb{background:${P.border2};border-radius:2px}

  /* Brand spec */
  .spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:72px}
  @media(max-width:600px){.spec-grid{grid-template-columns:1fr}}
  .spec-card{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px}
  .spec-card h3{font-size:9px;font-weight:700;letter-spacing:2px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .palette{display:flex;gap:8px;flex-wrap:wrap}

  /* Tokens */
  .tokens-section{margin-bottom:72px}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:12px;
    padding:24px;position:relative}
  .tokens-block pre{font-family:'SF Mono','Fira Code',monospace;font-size:11px;
    color:${P.fg2};overflow-x:auto;line-height:1.8;white-space:pre}
  .copy-btn{position:absolute;top:16px;right:16px;background:${P.accentDim};color:${P.accentHi};
    border:1px solid ${P.accent}40;border-radius:6px;padding:6px 14px;font-size:10px;font-weight:700;
    letter-spacing:1px;cursor:pointer;transition:all .15s}
  .copy-btn:hover{background:${P.accent};color:${P.bg}}

  /* PRD */
  .prd-section{margin-bottom:72px}
  .prd-body{color:${P.fg2};font-size:14px;line-height:1.8}
  .prd-body h3{font-size:16px;font-weight:700;color:${P.fg};margin:28px 0 12px}
  .prd-body p{margin-bottom:14px}
  .prd-body ul{padding-left:20px;margin-bottom:14px}
  .prd-body li{margin-bottom:6px}
  .prd-body strong{color:${P.fg}}

  /* Footer */
  .footer{padding:56px 0;border-top:1px solid ${P.border};text-align:center;
    color:${P.fg3};font-size:12px}
  .footer a{color:${P.fg3}}
  .footer a:hover{color:${P.fg2}}
</style>
</head>
<body>

<div class="container">
  <!-- Hero -->
  <div class="hero">
    <div class="hero-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
    <div class="hero-name">${APP_NAME}</div>
    <div class="hero-tagline">${TAGLINE}</div>
    <div class="hero-date">Design Heartbeat · Evervault × Linear dark aesthetic</div>
    <div class="hero-prompt">${ORIGINAL_PROMPT}</div>
    <div class="actions">
      <a href="${viewerURL}" class="btn btn-primary" target="_blank">▶ Open in Viewer</a>
      <a href="${mockURL}" class="btn btn-mock" target="_blank">✦ Try Interactive Mock</a>
      <a href="data:application/json;base64,${penEncoded}" download="nova-app.pen" class="btn btn-secondary">↓ Download .pen</a>
      <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.querySelector('.hero-prompt').textContent.trim()).then(()=>this.textContent='✓ Copied!')">⎘ Copy Prompt</button>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}" class="btn btn-outline" target="_blank">𝕏 Share</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">⬡ Gallery</a>
    </div>
  </div>

  <!-- Screen Thumbnails -->
  <div class="screens-section">
    <div class="section-label">5 Screens</div>
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
    <div class="section-label">Product Brief / PRD</div>
    <div class="spec-card">
      <div class="prd-body">${prdHTML}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Built by <strong style="color:${P.fg2}">RAM Design Studio</strong> · Heartbeat ${DATE_STR}</p>
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
  console.log('=== NOVA Design Discovery Pipeline ===\n');

  const penPath = path.join(__dirname, 'nova-app.pen');
  const pen     = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded pen: ${pen.children.length} screens`);

  // (a) Hero page
  console.log('\n[1/5] Building hero page…');
  const heroHTML = buildHeroHTML(pen);
  console.log(`  Hero HTML: ${(heroHTML.length / 1024).toFixed(1)} KB`);
  console.log('[2/5] Publishing hero → ram.zenbin.org/' + SLUG);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`  → ${heroRes.status}  ${heroRes.body.slice(0, 100)}`);

  // (b) Viewer
  console.log('\n[3/5] Building + publishing viewer…');
  const viewerHTML = buildViewerHTML(pen);
  console.log(`  Viewer HTML: ${(viewerHTML.length / 1024).toFixed(1)} KB`);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`  → ${viewerRes.status}  ${viewerRes.body.slice(0, 100)}`);

  // (d) Gallery queue (step 4 here, mock is step 5 in separate script)
  console.log('\n[4/5] Updating gallery queue…');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-nova-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/nova-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };
  queue.submissions.push(newEntry);
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
  console.log(`  → Gallery: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 100)}`);

  console.log('\n=== Pipeline complete ===');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/nova-mock (run nova-mock.mjs)`);
}

main().catch(console.error);
