'use strict';
// meridian2-publish.js — hero page + viewer + gallery queue for MERIDIAN

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'meridian2';
const APP_NAME  = 'MERIDIAN';
const TAGLINE   = 'AI-Native Code Review Intelligence';
const DATE_STR  = 'March 22, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'meridian2.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#08090A',
  surface:  '#111214',
  surface2: '#181A1E',
  surface3: '#1E2128',
  surface4: '#23262D',
  border:   '#23262D',
  border2:  '#2C3040',
  muted:    '#52576B',
  muted2:   '#7A8099',
  fg:       '#E2E4E9',
  fg2:      '#C4C7D2',
  accent:   '#5E6AD2',
  accentLt: '#8B94E8',
  green:    '#26C281',
  red:      '#E5484D',
  amber:    '#F5A623',
  violet:   '#9B59B6',
};

const SCREEN_NAMES = ['PR Queue', 'Diff Viewer', 'Agent Activity', 'Insights', 'Settings'];

const PROMPT = `Design MERIDIAN — an AI-native code review and PR intelligence platform, inspired by:
1. Linear.app (darkmodedesign.com, March 2026) — ultra-dark #08090A background, indigo #5E6AD2 accent, dense data hierarchies, AI-native workflows. "The product development system for teams and agents."
2. Superset.sh (godly.website) — parallel agent orchestration UI, terminal-style code diffs. "Orchestrate swarms of Claude Code, Codex, etc. in parallel."
3. Midday.ai (darkmodedesign.com) — clean transactional dark data UI, subtle layered surfaces.
5 screens: PR Queue (inbox-style triage), Diff Viewer (inline code review + AI annotations), Agent Activity (live multi-agent orchestration), Insights (bento grid velocity metrics), Settings (workspace config).
Palette: near-void black #08090A + Linear indigo #5E6AD2 + AI violet #9B59B6`;

// ── HTTP helper ───────────────────────────────────────────────────────────────
function req(opts, body) {
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

async function createZenBin(slug, title, html, subdomain = '') {
  const body = JSON.stringify({ title, html });
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  };
  if (subdomain) headers['X-Subdomain'] = subdomain;
  return req({ hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST', headers }, body);
}

// ── SVG renderer ───────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#')) return c;
  const m = c.match(/^([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  if (m) return '#' + m[1];
  return c;
}

function rn(node, ox, oy, depth, maxD) {
  if (!node || depth > maxD) return '';
  const x = (node.x || 0) + ox;
  const y = (node.y || 0) + oy;
  const w = node.width  || 10;
  const h = node.height || 10;
  const op = node.opacity !== undefined ? node.opacity : 1;

  if (node.type === 'text') {
    const fill  = sc(node.fill || P.fg);
    const size  = Math.max(node.fontSize || 12, 6);
    const align = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const ax    = align === 'middle' ? x + w / 2 : align === 'end' ? x + w : x;
    const lines = String(node.content || '').split('\n');
    const lh    = node.lineHeight ? size * node.lineHeight : size * 1.25;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i * lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${align}" font-weight="${node.fontWeight || 400}">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
    ).join('');
  }
  if (node.type === 'ellipse') {
    const fill   = sc(node.fill || 'transparent');
    const noFill = !node.fill || node.fill === 'transparent';
    const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
    return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${noFill?'none':fill}" opacity="${op}"${stroke}/>`;
  }
  const fill   = sc(node.fill || P.bg);
  const r      = node.cornerRadius || 0;
  const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
  const clipId = node.clip ? `cp-${node.id || Math.random().toString(36).slice(2)}` : null;
  const kids   = (node.children || []).map(c => rn(c, x, y, depth + 1, maxD)).join('');
  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, thumbW, thumbH, maxD = 5) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${sc(screen.fill || P.bg)}"/>${content}</svg>`;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* MERIDIAN Design Tokens — AI-Native Code Review */

  /* Backgrounds (Linear near-void darks) */
  --bg:           ${P.bg};
  --surface:      ${P.surface};
  --surface-2:    ${P.surface2};
  --surface-3:    ${P.surface3};
  --surface-4:    ${P.surface4};
  --border:       ${P.border};
  --border-2:     ${P.border2};
  --muted:        ${P.muted};
  --muted-2:      ${P.muted2};

  /* Foreground */
  --fg:           ${P.fg};
  --fg-2:         ${P.fg2};

  /* Brand — Linear Indigo */
  --accent:       ${P.accent};
  --accent-lt:    ${P.accentLt};
  --accent-hover: #7480E8;

  /* AI Agent — Violet */
  --ai:           ${P.violet};

  /* Data palette */
  --success:      ${P.green};
  --warning:      ${P.amber};
  --danger:       ${P.red};

  /* Typography — Developer Precision */
  --font-display: 800 clamp(32px,6vw,64px)/1.0 'Inter', 'SF Pro Display', system-ui, sans-serif;
  --font-heading: 700 18px/1.1 'Inter', system-ui, sans-serif;
  --font-label:   600 8px/1 'Inter', system-ui, sans-serif;
  --font-body:    400 13px/1.6 'Inter', system-ui, sans-serif;
  --font-mono:    500 11px/1.4 'SF Mono', ui-monospace, monospace;

  /* Letter spacing */
  --ls-display: -1px;
  --ls-label:   1.5px;
  --ls-mono:    0.5px;

  /* Spacing (4px base grid) */
  --s-1: 4px;  --s-2: 8px;   --s-3: 14px; --s-4: 20px;
  --s-5: 28px; --s-6: 40px;  --s-7: 60px; --s-8: 80px;

  /* Radius */
  --r-xs: 4px;  --r-sm: 6px;  --r-md: 10px;  --r-lg: 16px;
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 175, THUMB_H = 320;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 4)}
    <div style="font-size:8px;color:${P.muted2};margin-top:10px;letter-spacing:2px;font-weight:700;font-family:monospace">${(SCREEN_NAMES[i] || 'SCREEN ' + (i + 1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const paletteSwatches = [
  [P.bg,       'BG',        '#VOID'],
  [P.surface,  'SURFACE',   P.surface],
  [P.surface2, 'SURFACE 2', P.surface2],
  [P.fg,       'FG',        P.fg],
  [P.accent,   'ACCENT',    P.accent],
  [P.accentLt, 'INDIGO LT', P.accentLt],
  [P.violet,   'AI VIOLET', P.violet],
  [P.green,    'SUCCESS',   P.green],
  [P.amber,    'WARNING',   P.amber],
  [P.red,      'DANGER',    P.red],
].map(([color, name, hex]) =>
  `<div style="display:flex;align-items:center;gap:12px">
    <div style="width:40px;height:40px;border-radius:8px;background:${color};border:1px solid ${P.border2};flex-shrink:0"></div>
    <div>
      <div style="font-size:10px;font-weight:700;color:${P.fg};letter-spacing:1px;font-family:monospace">${name}</div>
      <div style="font-size:9px;color:${P.muted};font-family:monospace">${hex}</div>
    </div>
  </div>`
).join('');

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const PEN_B64 = Buffer.from(penJson).toString('base64');

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${P.bg};color:${P.fg};font-family:'Inter','SF Pro Display',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

  /* Header */
  .header{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;align-items:center;justify-content:space-between}
  .logo{font-size:13px;font-weight:800;letter-spacing:3px;color:${P.fg};font-family:monospace}
  .header-links{display:flex;gap:24px}
  .header-links a{font-size:11px;color:${P.muted2};text-decoration:none;letter-spacing:0.5px}
  .header-links a:hover{color:${P.accentLt}}

  /* Hero */
  .hero{padding:80px 40px 60px;max-width:900px;margin:0 auto;text-align:center;position:relative}
  .hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:600px;height:300px;background:radial-gradient(ellipse at center,${P.accent}18 0%,transparent 70%);pointer-events:none}
  .hero-tag{display:inline-block;font-size:9px;font-weight:700;letter-spacing:2px;color:${P.accentLt};background:${P.accent}18;border:1px solid ${P.accent}35;padding:6px 16px;border-radius:4px;margin-bottom:32px;font-family:monospace}
  .hero-title{font-size:clamp(48px,8vw,84px);font-weight:900;letter-spacing:-2px;line-height:0.95;color:${P.fg};margin-bottom:24px}
  .hero-title span{color:${P.accentLt}}
  .hero-tagline{font-size:16px;color:${P.muted2};max-width:480px;margin:0 auto 20px;line-height:1.6}
  .hero-date{font-size:9px;color:${P.muted};letter-spacing:2px;font-family:monospace;margin-bottom:40px}

  /* Actions */
  .actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:60px}
  .btn{padding:10px 24px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:0.8px;cursor:pointer;border:none;font-family:monospace;text-decoration:none;display:inline-block;transition:all .15s}
  .btn-primary{background:${P.accent};color:#fff}
  .btn-primary:hover{background:${P.accentLt}}
  .btn-secondary{background:${P.surface};color:${P.fg2};border:1px solid ${P.border2}}
  .btn-secondary:hover{border-color:${P.accent};color:${P.accentLt}}
  .btn-s{padding:8px 18px;font-size:10px}

  /* Screens */
  .section-label{font-size:8px;font-weight:700;letter-spacing:2px;color:${P.muted};font-family:monospace;margin-bottom:20px;text-transform:uppercase}
  .preview{padding:0 0 60px;overflow:hidden}
  .preview > .section-label{padding:0 40px}
  .screens-strip{display:flex;gap:20px;padding:0 40px;overflow-x:auto;scrollbar-width:none}
  .screens-strip::-webkit-scrollbar{display:none}
  .screen-item{flex-shrink:0;text-align:center}
  .screen-svg{border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.6),0 0 0 1px ${P.border};overflow:hidden}
  .screen-label{font-size:8px;color:${P.muted2};margin-top:10px;letter-spacing:2px;font-weight:700;font-family:monospace}

  /* Design spec */
  .spec{padding:60px 40px;max-width:900px;margin:0 auto}
  .spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px}
  .spec-section{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:28px}
  .spec-title{font-size:8px;font-weight:700;letter-spacing:2px;color:${P.accent};margin-bottom:20px;font-family:monospace}
  .palette-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .type-scale{display:flex;flex-direction:column;gap:10px}
  .type-item{display:flex;align-items:baseline;gap:12px}
  .type-label{font-size:8px;color:${P.muted};font-family:monospace;min-width:60px;letter-spacing:1px}

  /* Tokens */
  .tokens-block{background:${P.dim || P.bg};border:1px solid ${P.border};border-radius:10px;padding:20px;overflow-x:auto;margin-top:8px}
  .tokens-block pre{font-size:10px;color:${P.fg2};font-family:'SF Mono',monospace;line-height:1.7;white-space:pre-wrap}

  /* Prompt + PRD */
  .prd{padding:40px;max-width:900px;margin:0 auto}
  .prd-prompt{font-size:15px;font-style:italic;color:${P.fg2};line-height:1.7;border-left:3px solid ${P.accent};padding-left:24px;margin-bottom:40px}
  .prd-section{margin-bottom:32px}
  .prd-h{font-size:12px;font-weight:700;letter-spacing:1.5px;color:${P.accent};font-family:monospace;margin-bottom:12px;text-transform:uppercase}
  .prd-body{font-size:13px;color:${P.fg2};line-height:1.7}
  .prd-body ul{padding-left:20px;margin-top:8px}
  .prd-body li{margin-bottom:6px}

  /* Principles */
  .principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px}
  .principle{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:18px}
  .p-icon{font-size:18px;margin-bottom:8px}
  .p-title{font-size:10px;font-weight:700;color:${P.fg};letter-spacing:0.5px;margin-bottom:4px}
  .p-desc{font-size:9px;color:${P.muted2};line-height:1.5}

  /* Footer */
  .footer{border-top:1px solid ${P.border};padding:32px 40px;display:flex;align-items:center;justify-content:space-between}
  .footer-logo{font-size:10px;font-weight:800;letter-spacing:3px;color:${P.muted};font-family:monospace}
  .footer-links{display:flex;gap:20px}
  .footer-links a{font-size:10px;color:${P.muted};text-decoration:none;letter-spacing:0.5px}
  .footer-links a:hover{color:${P.accentLt}}

  /* Toast */
  #toast{position:fixed;bottom:32px;right:32px;background:${P.surface2};border:1px solid ${P.border2};color:${P.fg};padding:12px 20px;border-radius:8px;font-size:11px;font-family:monospace;opacity:0;transform:translateY(10px);transition:all .25s;pointer-events:none;z-index:999}
  #toast.show{opacity:1;transform:translateY(0)}
  .dim{background:${P.bg || '#0D0F12'}}
</style>
</head>
<body>

<div class="header">
  <div class="logo">RAM DESIGN</div>
  <div class="header-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" target="_blank">Interactive Mock</a>
    <a href="https://ram.zenbin.org/gallery">Gallery</a>
  </div>
</div>

<section class="hero">
  <div class="hero-tag">HEARTBEAT · ${DATE_STR}</div>
  <h1 class="hero-title">MER<span>IDIAN</span></h1>
  <p class="hero-tagline">${TAGLINE}</p>
  <p class="hero-date">5 SCREENS · MOBILE (390×844) · PENCIL.DEV v2.8</p>
  <div class="actions">
    <button class="btn btn-primary" onclick="openViewer()">Open in Viewer</button>
    <a class="btn btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock" target="_blank">Try Interactive Mock ✦</a>
    <button class="btn btn-secondary" onclick="downloadPen()">Download .pen</button>
    <button class="btn btn-secondary" onclick="copyPrompt()">Copy Prompt</button>
    <button class="btn btn-secondary" onclick="shareX()">Share on X</button>
    <a class="btn btn-secondary btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="screens-strip">
    ${thumbsHTML}
  </div>
</section>

<section class="spec">
  <div class="spec-grid">
    <div class="spec-section">
      <div class="spec-title">COLOUR PALETTE</div>
      <div class="palette-grid">${paletteSwatches}</div>
    </div>
    <div class="spec-section">
      <div class="spec-title">TYPE SCALE</div>
      <div class="type-scale">
        <div class="type-item"><span class="type-label">DISPLAY</span><span style="font-size:28px;font-weight:900;color:${P.fg};letter-spacing:-1px">MERIDIAN</span></div>
        <div class="type-item"><span class="type-label">HEADING</span><span style="font-size:18px;font-weight:700;color:${P.fg}">PR Queue</span></div>
        <div class="type-item"><span class="type-label">SUBHEAD</span><span style="font-size:13px;font-weight:600;color:${P.fg2}">Agent Activity</span></div>
        <div class="type-item"><span class="type-label">BODY</span><span style="font-size:11px;color:${P.fg2}">feat: streaming response</span></div>
        <div class="type-item"><span class="type-label">LABEL</span><span style="font-size:8px;font-weight:700;letter-spacing:2px;color:${P.muted};font-family:monospace">PULL REQUESTS</span></div>
        <div class="type-item"><span class="type-label">MONO</span><span style="font-size:9px;font-family:monospace;color:${P.green}">+  const buf = new StreamBuffer()</span></div>
      </div>
    </div>
  </div>

  <div class="spec-section" style="margin-top:24px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div class="spec-title" style="margin-bottom:0">CSS DESIGN TOKENS</div>
      <button class="btn btn-secondary btn-s" onclick="copyTokens()" style="font-size:9px">COPY TOKENS</button>
    </div>
    <div class="tokens-block"><pre id="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></div>
  </div>

  <div style="margin-top:24px">
    <div class="section-label">DESIGN PRINCIPLES</div>
    <div class="principles-grid">
      <div class="principle"><div class="p-icon">⬛</div><div class="p-title">Zero Noise</div><div class="p-desc">Linear's near-void background eliminates visual clutter. Every pixel serves the data.</div></div>
      <div class="principle"><div class="p-icon">⟡</div><div class="p-title">AI as Teammate</div><div class="p-desc">Agents are first-class UI citizens — their activity is visible, legible, and trustworthy.</div></div>
      <div class="principle"><div class="p-icon">◈</div><div class="p-title">Code-First</div><div class="p-desc">Terminal aesthetics in the diff viewer reinforce the product's engineering DNA.</div></div>
    </div>
  </div>
</section>

<section class="prd">
  <p class="prd-prompt">"${PROMPT}"</p>

  <div class="prd-section">
    <div class="prd-h">Overview</div>
    <div class="prd-body">MERIDIAN is an AI-native code review intelligence platform that replaces manual PR triage with a swarm of specialized AI agents. Inspired by Linear's ultra-dark precision and Superset's parallel agent orchestration patterns, it gives engineering teams real-time visibility into PR health, AI reviewer activity, and sprint velocity — all in a single, focused mobile interface.</div>
  </div>

  <div class="prd-section">
    <div class="prd-h">Target Users</div>
    <div class="prd-body"><ul>
      <li><strong>Senior engineers</strong> managing high-volume PR queues who need fast triage without context-switching</li>
      <li><strong>Engineering leads</strong> who want AI-assisted review coverage without sacrificing code quality</li>
      <li><strong>Platform teams</strong> running AI agent workflows alongside human developers</li>
    </ul></div>
  </div>

  <div class="prd-section">
    <div class="prd-h">Core Features</div>
    <div class="prd-body"><ul>
      <li><strong>PR Queue</strong> — Linear-style inbox with AI triage labels, priority sorting, and agent status indicators</li>
      <li><strong>Diff Viewer</strong> — Inline code review with terminal-aesthetics diff blocks and AI annotation sidebar</li>
      <li><strong>Agent Activity</strong> — Real-time dashboard showing Superset-style parallel AI agents with progress bars</li>
      <li><strong>Insights</strong> — Bento grid velocity metrics: cycle time, review lag, merge rate, AI impact</li>
      <li><strong>Settings</strong> — Workspace config, integrations (GitHub/Slack/Linear), AI agent toggles</li>
    </ul></div>
  </div>

  <div class="prd-section">
    <div class="prd-h">Design Language</div>
    <div class="prd-body"><ul>
      <li><strong>Color</strong> — Linear's exact near-void #08090A with 4-layer surface elevation. Indigo #5E6AD2 as the single brand accent. Violet #9B59B6 reserved exclusively for AI agent elements.</li>
      <li><strong>Typography</strong> — Inter for UI chrome, SF Mono for code and labels. ALL CAPS with 1.5px tracking for section headers (Linear convention).</li>
      <li><strong>Motion principle</strong> — Status transitions only. No decorative animation. Agent progress bars update in real time.</li>
    </ul></div>
  </div>

  <div class="prd-section">
    <div class="prd-h">Screen Architecture</div>
    <div class="prd-body"><ul>
      <li><strong>Screen 1 — PR Queue:</strong> Hero stat strip + 5 PR rows with AI triage + agent notice banner</li>
      <li><strong>Screen 2 — Diff Viewer:</strong> File tabs + syntax-colored diff block + AI inline annotation + review actions</li>
      <li><strong>Screen 3 — Agent Activity:</strong> Live agent cards with progress + completed session history</li>
      <li><strong>Screen 4 — Insights:</strong> 2×2 bento KPI grid + full-width sparkline charts + AI impact triptych + reviewer leaderboard</li>
      <li><strong>Screen 5 — Settings:</strong> User badge + grouped settings rows with toggles + integrations list</li>
    </ul></div>
  </div>
</section>

<footer class="footer">
  <div class="footer-logo">RAM DESIGN HEARTBEAT · ${DATE_STR}</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/gallery">Gallery</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </div>
</footer>

<div id="toast"></div>

<script>
const PEN_B64 = '${PEN_B64}';
const PROMPT_TEXT = ${JSON.stringify(PROMPT)};

function openViewer() { window.open('https://ram.zenbin.org/${SLUG}-viewer', '_blank'); }

function downloadPen() {
  const blob = new Blob([atob(PEN_B64)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '${SLUG}.pen'; a.click();
  showToast('Downloaded ${SLUG}.pen');
}

function copyPrompt() {
  navigator.clipboard.writeText(PROMPT_TEXT).then(() => showToast('Prompt copied!'));
}

function copyTokens() {
  const text = document.getElementById('tokens-pre').textContent;
  navigator.clipboard.writeText(text).then(() => showToast('CSS tokens copied!'));
}

function shareX() {
  const shareText = 'MERIDIAN — AI-Native Code Review Intelligence. Linear-dark aesthetic meets multi-agent PR orchestration. Designed by @RAM_design_ai';
  const u = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent('https://ram.zenbin.org/${SLUG}');
  window.open(u, '_blank');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
</script>
</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(
  path.join(__dirname, 'penviewer-app.html'), 'utf8'
).replace(
  /<title>[^<]*<\/title>/,
  `<title>${APP_NAME} — ${TAGLINE}</title>`
);
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Gallery queue ─────────────────────────────────────────────────────────────
async function pushToGalleryQueue(heroUrl) {
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

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: 'productivity',
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await ghReq({
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
  return putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100);
}

// ── PUBLISH ───────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Publishing ${APP_NAME}...`);

  const heroRes = await createZenBin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML, SUBDOMAIN);
  console.log(`  Hero:   ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  const viewerRes = await createZenBin(`${SLUG}-viewer`, `${APP_NAME} — Viewer`, viewerHtml, SUBDOMAIN);
  console.log(`  Viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  try {
    const qStatus = await pushToGalleryQueue(`https://ram.zenbin.org/${SLUG}`);
    console.log(`  Queue:  ${qStatus}`);
  } catch (e) {
    console.log(`  Queue:  FAILED — ${e.message}`);
  }

  console.log('');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
