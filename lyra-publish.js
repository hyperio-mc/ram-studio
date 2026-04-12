'use strict';
// lyra-publish.js — Full pipeline for LYRA: hero + viewer + gallery + mock link

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'lyra';
const APP_NAME  = 'LYRA';
const TAGLINE   = 'AI Agent Orchestration. Command your fleet.';
const SUBDOMAIN = 'ram';
const ARCHETYPE = 'productivity';

const SCREEN_NAMES = ['Command', 'Fleet', 'Task Detail', 'Analytics', 'Configure'];

const PROMPT = `Design LYRA — a 5-screen dark-mode AI Agent Operations Center for engineering teams, inspired by:
1. Haptic.app on godly.website (#965) — "Clean, Dark, Large Type, Single Page, Inter + SF Pro Display, Scrolling Animation" — oversized hero numerals on near-void black bg
2. Linear.app on darkmodedesign.com — "The product development system for teams and agents" — AI-era precision dark SaaS, 4px-grid discipline, type IS the information hierarchy
3. Forge + Flomodia on darkmodedesign.com — dense dark productivity tool panels; status colors are the only decoration
4. Runlayer "Enterprise MCPs, Skills & Agents" (land-book.com, March 2026) — AI agent orchestration is the dominant emerging UX category

Palette: near-void indigo-black (#05060F) + electric indigo (#5548FF) + teal-mint (#00DDB5) + red (#FF3D5E) + amber (#FFB93E)
5 screens: Command (Haptic-style big-number overview) · Fleet (agent cards) · Task Detail (step timeline + log stream) · Analytics (success rate hero + charts) · Configure (new agent wizard)`;

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'lyra.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette (mirrors lyra-app.js) ─────────────────────────────────────────────
const P = {
  bg:       '#05060F',
  surface:  '#0B0D1E',
  border:   '#1A1D42',
  fg:       '#E8E6FF',
  fg2:      '#6C6AA0',
  accent:   '#5548FF',
  accentHi: '#8B80FF',
  teal:     '#00DDB5',
  red:      '#FF3D5E',
  amber:    '#FFB93E',
};

// ── HTTP helpers ───────────────────────────────────────────────────────────────
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

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ slug, title, html });
  return req({
    hostname: 'zenbin.org',
    path:     `/v1/pages/${slug}`,
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    SUBDOMAIN,
    },
  }, body);
}

// ── SVG renderer for screen thumbnails ────────────────────────────────────────
function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#')) return c;
  const m = c.match(/^([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  return m ? '#' + m[1] : c;
}

function renderEl(node, ox, oy, depth) {
  if (!node || depth > 10) return '';
  const x = (node.x || 0) + ox, y = (node.y || 0) + oy;
  const w = node.width || 10, h = node.height || 10;
  const op = node.opacity !== undefined ? node.opacity : 1;

  if (node.type === 'text') {
    const fill  = sc(node.fill || P.fg);
    const sz    = Math.max(node.fontSize || 12, 6);
    const align = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const ax    = align === 'middle' ? x + w / 2 : align === 'end' ? x + w : x;
    const lh    = node.lineHeight ? sz * node.lineHeight : sz * 1.25;
    return String(node.content || '').split('\n').map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + sz + i * lh).toFixed(1)}" font-size="${sz}" fill="${fill}" opacity="${op}" text-anchor="${align}" font-weight="${node.fontWeight || 400}" font-family="Inter,system-ui,sans-serif">${ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
    ).join('');
  }

  if (node.type === 'ellipse') {
    const fill = sc(node.fill);
    const rx = w / 2, ry = h / 2;
    const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
    return `<ellipse cx="${(x+rx).toFixed(1)}" cy="${(y+ry).toFixed(1)}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${op}"${stroke}/>`;
  }

  // frame
  const fill   = sc(node.fill);
  const r      = node.cornerRadius || 0;
  const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
  const clip   = node.clip;
  const cid    = clip ? `cl${Math.random().toString(36).slice(2, 8)}` : null;
  const kids   = (node.children || []).map(c => renderEl(c, x, y, depth + 1)).join('');
  const rect   = `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}" opacity="${op}"${stroke}/>`;
  if (clip) {
    return `<clipPath id="${cid}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><g clip-path="url(#${cid})">${rect}${kids}</g>`;
  }
  return rect + kids;
}

function thumbSVG(s, tw, th) {
  const sw = s.width, sh = s.height;
  const kids = (s.children || []).map(c => renderEl(c, 0, 0, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px"><rect width="${sw}" height="${sh}" fill="${s.fill || P.bg}"/>${kids}</svg>`;
}

// ── Build hero HTML ────────────────────────────────────────────────────────────
const THUMB_H = 200;
const thumbsHTML = screens.map((s, i) => {
  const tw = Math.round(THUMB_H * (s.width / s.height));
  return `<div style="text-align:center;flex-shrink:0">
    ${thumbSVG(s, tw, THUMB_H)}
    <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px;color:${P.fg}">${SCREEN_NAMES[i] || 'SCREEN ' + (i+1)}</div>
  </div>`;
}).join('');

const swatches = [
  { hex: P.bg,      role: 'BACKGROUND' },
  { hex: P.surface, role: 'SURFACE'    },
  { hex: P.fg,      role: 'FOREGROUND' },
  { hex: P.accent,  role: 'PRIMARY'    },
  { hex: P.teal,    role: 'ACTIVE'     },
  { hex: P.red,     role: 'ERROR'      },
  { hex: P.amber,   role: 'WARNING'    },
];

const swatchHTML = swatches.map(sw => `
  <div style="flex:1;min-width:80px;max-width:120px">
    <div style="height:60px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:4px;color:${P.fg}">${sw.role}</div>
    <div style="font-size:12px;font-weight:700;color:${P.accentHi}">${sw.hex}</div>
  </div>`).join('');

const encoded = Buffer.from(penJson).toString('base64');

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:       ${P.bg};
    --surface:  ${P.surface};
    --border:   ${P.border};
    --fg:       ${P.fg};
    --fg2:      ${P.fg2};
    --accent:   ${P.accent};
    --accentHi: ${P.accentHi};
    --teal:     ${P.teal};
    --red:      ${P.red};
    --amber:    ${P.amber};
  }
  html, body { background: var(--bg); color: var(--fg); font-family: Inter, system-ui, sans-serif; min-height: 100vh; }
  body { padding: 0; }

  /* Hero */
  .hero { padding: 80px 40px 60px; max-width: 1200px; margin: 0 auto; }
  .hero-eyebrow { font-size: 11px; letter-spacing: 3px; color: var(--accentHi); font-weight: 700; margin-bottom: 20px; }
  .hero-title { font-size: clamp(48px, 8vw, 96px); font-weight: 900; line-height: 1; color: var(--fg); margin-bottom: 20px; }
  .hero-title span { color: var(--accent); }
  .hero-tagline { font-size: clamp(16px, 2.5vw, 22px); color: var(--fg2); max-width: 600px; line-height: 1.5; margin-bottom: 36px; }
  .hero-meta { font-size: 11px; color: var(--fg2); letter-spacing: 1px; margin-bottom: 40px; }

  /* Buttons */
  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 60px; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; border: none; transition: all .15s; letter-spacing: .3px; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accentHi); }
  .btn-secondary { background: var(--surface); color: var(--fg); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-teal { background: var(--teal); color: #000; }
  .btn-teal:hover { opacity: .85; }

  /* Divider */
  .divider { border: none; border-top: 1px solid var(--border); margin: 0 40px; }

  /* Section */
  .section { padding: 60px 40px; max-width: 1200px; margin: 0 auto; }
  .section-label { font-size: 10px; letter-spacing: 2.5px; color: var(--fg2); font-weight: 700; margin-bottom: 24px; }

  /* Scrollable screen strip */
  .screen-strip { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }

  /* Palette swatches */
  .swatches { display: flex; gap: 16px; flex-wrap: wrap; }

  /* Type scale */
  .type-scale > div { padding: 16px 0; border-bottom: 1px solid var(--border); }
  .type-label { font-size: 9px; letter-spacing: 2px; color: var(--fg2); margin-bottom: 8px; }

  /* Spacing system */
  .spacing-row { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; margin-top: 16px; }
  .spacing-unit { text-align: center; }
  .spacing-bar { background: var(--accent); border-radius: 2px; margin: 0 auto 8px; }

  /* CSS tokens */
  .tokens-block { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; font-family: 'Fira Code', 'Courier New', monospace; font-size: 12px; line-height: 1.8; color: var(--fg2); position: relative; overflow: auto; }
  .tokens-block .var-name { color: var(--accentHi); }
  .tokens-block .var-val { color: var(--teal); }
  .copy-btn { position: absolute; top: 16px; right: 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 11px; font-weight: 700; cursor: pointer; letter-spacing: .5px; }
  .copy-btn:hover { background: var(--accentHi); }

  /* PRD */
  .prd { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 32px; }
  .prd h2 { font-size: 16px; font-weight: 700; color: var(--fg); margin: 24px 0 12px; letter-spacing: .5px; }
  .prd h2:first-child { margin-top: 0; }
  .prd p, .prd li { font-size: 14px; color: var(--fg2); line-height: 1.7; }
  .prd ul { padding-left: 20px; }
  .prd li { margin-bottom: 6px; }
  .prd strong { color: var(--fg); }

  /* Prompt */
  .prompt-block { font-style: italic; font-size: 17px; line-height: 1.7; color: var(--fg2); border-left: 3px solid var(--accent); padding-left: 24px; }

  /* Design principles */
  .principles { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
  .principle { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
  .principle-icon { font-size: 24px; margin-bottom: 12px; }
  .principle-title { font-size: 13px; font-weight: 700; color: var(--fg); margin-bottom: 6px; }
  .principle-desc { font-size: 12px; color: var(--fg2); line-height: 1.5; }

  /* Footer */
  .footer { padding: 40px; text-align: center; font-size: 12px; color: var(--fg2); border-top: 1px solid var(--border); opacity: .5; }

  .live-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,221,181,.12); color: var(--teal); border: 1px solid rgba(0,221,181,.3); border-radius: 20px; padding: 6px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 24px; }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }
</style>
</head>
<body>

<!-- ── Hero ───────────────────────────────────────────────────────────────── -->
<div class="hero">
  <div class="live-pill"><span class="live-dot"></span>RAM DESIGN HEARTBEAT</div>
  <div class="hero-eyebrow">RAM DESIGN STUDIO · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1 class="hero-title"><span>${APP_NAME}</span></h1>
  <p class="hero-tagline">${TAGLINE}</p>
  <p class="hero-meta">5 SCREENS · DARK MODE · AI AGENT ORCHESTRATION · PRODUCTIVITY</p>

  <div class="btn-row">
    <a class="btn btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">Open in Viewer →</a>
    <a class="btn btn-teal" href="https://ram.zenbin.org/${SLUG}-mock">Try Interactive Mock ✦</a>
    <button class="btn btn-secondary" onclick="downloadPen()">Download .pen</button>
    <button class="btn btn-secondary" onclick="copyPrompt()">Copy Prompt</button>
    <a class="btn btn-secondary" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <a class="btn btn-secondary" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(APP_NAME + ' — ' + TAGLINE + ' %0Ahttps://ram.zenbin.org/' + SLUG)}">Share on X</a>
  </div>
</div>

<hr class="divider">

<!-- ── Screen Thumbnails ───────────────────────────────────────────────────── -->
<div class="section">
  <div class="section-label">SCREEN ARCHITECTURE · ${screens.length} SCREENS</div>
  <div class="screen-strip">${thumbsHTML}</div>
</div>

<hr class="divider">

<!-- ── Brand Spec ─────────────────────────────────────────────────────────── -->
<div class="section">
  <div class="section-label">BRAND SPECIFICATION</div>

  <div style="margin-bottom: 40px">
    <div style="font-size:11px;letter-spacing:1.5px;color:var(--fg2);margin-bottom:16px">COLOR PALETTE</div>
    <div class="swatches">${swatchHTML}</div>
  </div>

  <div style="margin-bottom: 40px">
    <div style="font-size:11px;letter-spacing:1.5px;color:var(--fg2);margin-bottom:16px">TYPE SCALE</div>
    <div class="type-scale">
      ${[
        { label: 'DISPLAY · 60px / 900', size: '42px', weight: '900', sample: APP_NAME },
        { label: 'HEADING · 22px / 700', size: '22px', weight: '700', sample: TAGLINE  },
        { label: 'BODY · 13px / 400',    size: '13px', weight: '400', sample: 'The quick brown fox jumps over the lazy dog.' },
        { label: 'CAPTION · 9px / 700',  size: '9px',  weight: '700', sample: 'STATUS LABEL · METADATA · UI ELEMENT' },
      ].map(t => `<div>
        <div class="type-label">${t.label}</div>
        <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:var(--fg);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
      </div>`).join('')}
    </div>
  </div>

  <div style="margin-bottom:40px">
    <div style="font-size:11px;letter-spacing:1.5px;color:var(--fg2);margin-bottom:16px">SPACING SYSTEM</div>
    <div class="spacing-row">
      ${[4,8,12,16,24,32,48,64].map(sp => `
      <div class="spacing-unit">
        <div class="spacing-bar" style="width:${sp}px;height:${sp}px"></div>
        <div style="font-size:9px;color:var(--fg2)">${sp}px</div>
      </div>`).join('')}
    </div>
  </div>

  <div>
    <div style="font-size:11px;letter-spacing:1.5px;color:var(--fg2);margin-bottom:16px">DESIGN PRINCIPLES</div>
    <div class="principles">
      <div class="principle">
        <div class="principle-icon">◉</div>
        <div class="principle-title">Big Type as UI</div>
        <div class="principle-desc">Hero metrics rendered at 60px/900 weight. The number IS the interface — no charts needed for primary stats.</div>
      </div>
      <div class="principle">
        <div class="principle-icon">◈</div>
        <div class="principle-title">Color = Status</div>
        <div class="principle-desc">Teal for active/healthy. Red for error. Amber for warning. Indigo for brand. Zero decorative color usage.</div>
      </div>
      <div class="principle">
        <div class="principle-icon">≡</div>
        <div class="principle-title">Precision Grid</div>
        <div class="principle-desc">4px base unit. 20px horizontal margins. Every element earns its place — no visual noise permitted.</div>
      </div>
      <div class="principle">
        <div class="principle-icon">⌗</div>
        <div class="principle-title">Void as Canvas</div>
        <div class="principle-desc">Near-black #05060F background. Generous whitespace signals confidence. Data floats in darkness.</div>
      </div>
    </div>
  </div>
</div>

<hr class="divider">

<!-- ── CSS Design Tokens ───────────────────────────────────────────────────── -->
<div class="section">
  <div class="section-label">CSS DESIGN TOKENS</div>
  <div class="tokens-block" id="tokens">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <div>
      <span class="var-name">--color-bg</span>: <span class="var-val">${P.bg}</span>;          <span style="opacity:.4">/* near-void indigo-black */</span><br>
      <span class="var-name">--color-surface</span>: <span class="var-val">${P.surface}</span>;    <span style="opacity:.4">/* panel / card background */</span><br>
      <span class="var-name">--color-border</span>: <span class="var-val">${P.border}</span>;     <span style="opacity:.4">/* subtle panel borders */</span><br>
      <span class="var-name">--color-fg</span>: <span class="var-val">${P.fg}</span>;          <span style="opacity:.4">/* primary text — cool white */</span><br>
      <span class="var-name">--color-fg-muted</span>: <span class="var-val">${P.fg2}</span>;      <span style="opacity:.4">/* secondary / metadata text */</span><br>
      <span class="var-name">--color-accent</span>: <span class="var-val">${P.accent}</span>;    <span style="opacity:.4">/* electric indigo — primary brand */</span><br>
      <span class="var-name">--color-accent-hi</span>: <span class="var-val">${P.accentHi}</span>; <span style="opacity:.4">/* lighter indigo for text on dark */</span><br>
      <span class="var-name">--color-teal</span>: <span class="var-val">${P.teal}</span>;    <span style="opacity:.4">/* active / running / healthy */</span><br>
      <span class="var-name">--color-red</span>: <span class="var-val">${P.red}</span>;     <span style="opacity:.4">/* error / offline / critical */</span><br>
      <span class="var-name">--color-amber</span>: <span class="var-val">${P.amber}</span>;   <span style="opacity:.4">/* warning / degraded / paused */</span><br>
      <br>
      <span class="var-name">--radius-sm</span>: <span class="var-val">8px</span>;<br>
      <span class="var-name">--radius-md</span>: <span class="var-val">12px</span>;<br>
      <span class="var-name">--radius-lg</span>: <span class="var-val">16px</span>;<br>
      <br>
      <span class="var-name">--space-1</span>: <span class="var-val">4px</span>;<br>
      <span class="var-name">--space-2</span>: <span class="var-val">8px</span>;<br>
      <span class="var-name">--space-3</span>: <span class="var-val">12px</span>;<br>
      <span class="var-name">--space-4</span>: <span class="var-val">16px</span>;<br>
      <span class="var-name">--space-6</span>: <span class="var-val">24px</span>;<br>
      <span class="var-name">--space-8</span>: <span class="var-val">32px</span>;<br>
      <br>
      <span class="var-name">--font-display</span>: <span class="var-val">60px / 900</span>;<br>
      <span class="var-name">--font-heading</span>: <span class="var-val">22px / 700</span>;<br>
      <span class="var-name">--font-body</span>: <span class="var-val">13px / 400</span>;<br>
      <span class="var-name">--font-caption</span>: <span class="var-val">9px / 700</span>; <span style="opacity:.4">/* letter-spacing: 1.5px */</span>
    </div>
  </div>
</div>

<hr class="divider">

<!-- ── Original Prompt ────────────────────────────────────────────────────── -->
<div class="section">
  <div class="section-label">ORIGINAL PROMPT</div>
  <p class="prompt-block">${PROMPT}</p>
</div>

<hr class="divider">

<!-- ── PRD ────────────────────────────────────────────────────────────────── -->
<div class="section">
  <div class="section-label">PRODUCT BRIEF</div>
  <div class="prd">
    <h2>Overview</h2>
    <p>LYRA is an AI Agent Operations Center — a mobile-first command dashboard for engineering teams that orchestrate fleets of AI agents. As AI agents become first-class collaborators in software development workflows, teams need purpose-built observability and control surfaces. LYRA is that surface.</p>
    <p style="margin-top:12px">The design philosophy borrows from Haptic.app's large-type minimalism (godly.website #965) and Linear's precision dark SaaS aesthetic, applied to the fastest-growing UX category of 2026: agent orchestration tooling.</p>

    <h2>Target Users</h2>
    <ul>
      <li><strong>Platform Engineers</strong> — monitoring agent health, token budgets, and system reliability</li>
      <li><strong>Engineering Managers</strong> — understanding fleet utilization, task throughput, and error rates</li>
      <li><strong>AI Infrastructure Teams</strong> — configuring new agents, managing model selection, setting permissions</li>
    </ul>

    <h2>Core Features</h2>
    <ul>
      <li><strong>Command Center</strong> — At-a-glance fleet status with Haptic-style hero metrics. Active agent count at 60px/900 weight. Real-time activity feed. System health bento grid.</li>
      <li><strong>Agent Fleet</strong> — Searchable, filterable agent list. Per-agent: model assignment, current task, status badge, live token count. One-tap into agent detail.</li>
      <li><strong>Task Detail</strong> — Execution step timeline with live/done/pending states. Streaming log output. Token consumption progress bar. Agent assignment context.</li>
      <li><strong>Analytics</strong> — Task success rate as hero metric (Haptic pattern). Daily token consumption chart. Model usage breakdown. P50/P95/P99 latency percentiles.</li>
      <li><strong>Configure</strong> — 4-step wizard: Identity → Model → Permissions → Deploy. Model comparison cards with RECOMMENDED badges. Permission toggles (read/write/network/shell).</li>
    </ul>

    <h2>Design Language</h2>
    <ul>
      <li><strong>Palette:</strong> Near-void indigo-black (#05060F) base. Electric indigo (#5548FF) brand. Teal (#00DDB5) for active/healthy. Red (#FF3D5E) errors. Amber (#FFB93E) warnings.</li>
      <li><strong>Typography:</strong> Inter at 9 weights. 60px/900 for hero numbers (Haptic-inspired). 9px/700/letter-spacing for all section labels. Type hierarchy IS the information architecture.</li>
      <li><strong>Grid:</strong> 4px base unit. 20px horizontal margins. 12–16px border radius. 1px border hairlines in #1A1D42.</li>
      <li><strong>Status Language:</strong> Color alone communicates state — no icons required for status dots. Consistent: teal=active, red=error, amber=warning, indigo=selected.</li>
    </ul>

    <h2>Screen Architecture</h2>
    <ul>
      <li><strong>Command</strong> — Overview / home. Hero agent count. 3-stat KPI row. 2×2 health bento. 4-item activity feed.</li>
      <li><strong>Fleet</strong> — Agent list with search + filter chips. 6 agent cards with inline task/token context.</li>
      <li><strong>Task Detail</strong> — Deep-dive into a running task. 5-step execution timeline. Log stream panel. Token progress bar.</li>
      <li><strong>Analytics</strong> — 98.1% success rate hero. 7-day token bar chart. Model usage breakdown with progress bars. Latency percentile summary.</li>
      <li><strong>Configure</strong> — New agent 4-step wizard. Model selection with comparison badges. 4-permission toggle system. Deploy CTA.</li>
    </ul>
  </div>
</div>

<div class="footer">
  LYRA · RAM Design Heartbeat · ram.zenbin.org/${SLUG} · March 2026
</div>

<script>
const PEN_B64 = "${encoded}";

function downloadPen() {
  const bytes = atob(PEN_B64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: 'application/octet-stream' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '${SLUG}.pen';
  a.click();
}

function copyPrompt() {
  navigator.clipboard.writeText(${JSON.stringify(PROMPT)});
  alert('Prompt copied!');
}

function copyTokens() {
  const txt = \`--color-bg: ${P.bg};
--color-surface: ${P.surface};
--color-border: ${P.border};
--color-fg: ${P.fg};
--color-fg-muted: ${P.fg2};
--color-accent: ${P.accent};
--color-accent-hi: ${P.accentHi};
--color-teal: ${P.teal};
--color-red: ${P.red};
--color-amber: ${P.amber};
--radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px; --space-8: 32px;
--font-display: 60px / 900; --font-heading: 22px / 700; --font-body: 13px / 400; --font-caption: 9px / 700;\`;
  navigator.clipboard.writeText(txt);
  const btn = document.querySelector('.copy-btn');
  btn.textContent = 'COPIED ✓';
  setTimeout(() => btn.textContent = 'COPY TOKENS', 2000);
}
</script>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Gallery queue push ─────────────────────────────────────────────────────────
async function pushToGallery(mockUrl) {
  const getRes = await req({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     mockUrl || `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      screens.length,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  return req({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers:  {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Publishing ${APP_NAME} to ram.zenbin.org...`);

  const [heroRes, viewerRes] = await Promise.all([
    zenPut(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML),
    zenPut(`${SLUG}-viewer`, `${APP_NAME} — Viewer`, viewerHtml),
  ]);

  console.log(`  Hero:   ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  try {
    const qRes = await pushToGallery(`https://ram.zenbin.org/${SLUG}-mock`);
    console.log(`  Queue:  ${qRes.status === 200 ? 'OK' : 'Error ' + qRes.status}`);
  } catch (e) {
    console.log(`  Queue:  FAILED — ${e.message}`);
  }

  console.log('\n✓ Done!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
