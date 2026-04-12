'use strict';
// sentri-publish.js — builds hero + viewer + gallery queue for SENTRI

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG        = 'sentri';
const APP_NAME    = 'SENTRI';
const TAGLINE     = 'AI Agent Security & Observability Platform';
const DATE_STR    = 'March 19, 2026';
const SUBDOMAIN   = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'sentri.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette (must match sentri-app.js) ────────────────────────────────────────
const P = {
  bg:       '#010314',
  surface:  '#070E2E',
  surface2: '#0D1845',
  border:   '#1E2F6A',
  muted:    '#4A5A9E',
  fg:       '#E8EEFF',
  accent:   '#4361EE',
  violet:   '#7B2FBE',
  cyan:     '#00C2FF',
  success:  '#22C55E',
  warning:  '#F59E0B',
  danger:   '#EF4444',
};

const SCREEN_NAMES = ['Overview', 'Agent Fleet', 'Threat Feed', 'Agent Detail', 'Policy Control'];
const PROMPT = 'Design a dark AI agent security & observability platform inspired by Evervault\'s deep navy aesthetic (#010314), Runlayer\'s enterprise agent control-plane framing, and Linear\'s systematic product UI. 5 mobile screens: bento-grid dashboard, agent fleet list, real-time threat feed, agent detail deep-dive, and policy control center.';

// ── SVG renderer (pen → SVG thumbnail) ───────────────────────────────────────
function sc(c) {
  if (!c || typeof c !== 'string') return '#010314';
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
    const fill  = sc(node.fill || '#E8EEFF');
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
    const isTrans = !node.fill || node.fill === 'transparent';
    const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
    return `<ellipse cx="${(x + w/2).toFixed(1)}" cy="${(y + h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${isTrans ? 'none' : fill}" opacity="${op}"${stroke}/>`;
  }

  // frame / default
  const fill   = sc(node.fill || '#010314');
  const r      = node.cornerRadius || 0;
  const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
  const clipId = node.clip ? `clip-${node.id || Math.random().toString(36).slice(2)}` : null;
  const kids   = (node.children || []).map(c => rn(c, x, y, depth + 1, maxD)).join('');

  if (clipId) {
    return `<g opacity="${op}"><clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}"/></clipPath><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/><g clip-path="url(#${clipId})">${kids}</g></g>`;
  }
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke} opacity="${op}"/>${kids}`;
}

function screenSVG(screen, thumbW, thumbH, maxD = 6) {
  const sw = screen.width || 390, sh = screen.height || 844;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  const bg = sc(screen.fill || P.bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${bg}"/>${content}</svg>`;
}

// ── Derived design tokens ─────────────────────────────────────────────────────
const cssTokens = `:root {
  /* SENTRI — Design Tokens */

  /* Core Backgrounds (Evervault void navy) */
  --bg:          ${P.bg};
  --surface:     ${P.surface};
  --surface-2:   ${P.surface2};
  --border:      ${P.border};
  --muted:       ${P.muted};

  /* Primary: Electric Indigo (agent activity) */
  --accent:      ${P.accent};

  /* Secondary: Deep Violet (AI model identity) */
  --violet:      ${P.violet};

  /* Tertiary: Agent Cyan (live status) */
  --cyan:        ${P.cyan};

  /* Semantic Status */
  --success:     ${P.success};
  --warning:     ${P.warning};
  --danger:      ${P.danger};

  /* Text */
  --fg:          ${P.fg};

  /* Typography */
  --font-ui:    'Geist', 'Inter', -apple-system, sans-serif;
  --font-mono:  'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 900 clamp(52px,9vw,108px)/0.95 var(--font-ui);
  --font-heading: 700 15px/1 var(--font-ui);
  --font-body:    400 12px/1.6 var(--font-ui);
  --font-label:   700 9px/1 var(--font-ui);

  /* Spacing (4px base grid) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 14px;  --s-4: 20px;
  --s-5: 28px; --s-6: 40px; --s-7: 56px;  --s-8: 80px;

  /* Radius */
  --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 24px; --r-full: 9999px;
}`;

// ── Thumbnail strip ───────────────────────────────────────────────────────────
const THUMB_W = 180, THUMB_H = 330; // mobile proportions
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 4)}
    <div style="font-size:8px;color:${P.muted};margin-top:10px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

const swatchHTML = [
  { hex: P.bg,      role: 'BG — Void Navy'  },
  { hex: P.surface, role: 'SURFACE'          },
  { hex: P.fg,      role: 'FOREGROUND'       },
  { hex: P.accent,  role: 'ACCENT — Indigo'  },
  { hex: P.violet,  role: 'SECONDARY — Violet'},
  { hex: P.cyan,    role: 'AGENT CYAN'       },
  { hex: P.danger,  role: 'DANGER'           },
  { hex: P.success, role: 'SUCCESS'          },
].map(s => `
  <div style="flex:1;min-width:80px;max-width:120px">
    <div style="height:56px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.muted};margin-bottom:3px">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.accent};font-family:'Courier New',monospace">${s.hex}</div>
  </div>`).join('');

const typeScaleHTML = [
  { label: 'DISPLAY',  size: '52px', weight: '900', sample: 'SENTRI' },
  { label: 'HEADING',  size: '24px', weight: '800', sample: 'AI Agent Security' },
  { label: 'SUBHEAD',  size: '15px', weight: '700', sample: 'Command & Control Center' },
  { label: 'BODY',     size: '13px', weight: '400', sample: 'Monitor all AI agent activity, block threats in real-time.' },
  { label: 'CAPTION',  size: '9px',  weight: '700', sample: 'THREAT FEED · 12 BLOCKED · LIVE STATUS' },
].map(t => `
  <div style="padding:16px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:8px;font-family:'Courier New',monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
  </div>`).join('');

const shareText = encodeURIComponent(`SENTRI — AI Agent Security & Observability Platform. Dark navy + electric indigo. 5-screen mobile design by RAM Design Studio.`);

const prd = `
<h3>OVERVIEW</h3>
<p>SENTRI is a dark-mode mobile security command center for enterprise teams managing fleets of AI agents. Inspired by Evervault's deep-void navy aesthetic, Runlayer's "command & control plane for MCPs and agents" positioning, and Linear's systematic product UI — SENTRI gives security and platform teams real-time visibility into every request, data access, and threat event across their AI deployments.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Platform engineers</strong> deploying AI agents across enterprise tooling (Cursor, Claude Code, VSCode Copilot)</li>
<li><strong>Security teams</strong> responsible for monitoring PII exposure and policy violations in AI workflows</li>
<li><strong>CISOs &amp; compliance leads</strong> who need audit logs and trust posture controls</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Security Score Dashboard</strong> — single number trust score with bento-grid metrics: active agents, threats blocked, data requests, PII masked, unvetted MCP servers</li>
<li><strong>Agent Fleet Monitor</strong> — searchable list of all running agents with trust level, request count, and status (active / idle / flagged)</li>
<li><strong>Live Threat Feed</strong> — real-time stream of security events categorized by severity (CRITICAL / HIGH / MED / LOW) with one-tap detail view</li>
<li><strong>Agent Detail Drill-down</strong> — per-agent permission map, activity timeline, stats (uptime, PII hits, blocked calls)</li>
<li><strong>Policy Control Center</strong> — toggle-based policy rules, global trust posture selector, full audit log shortcut</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Void Navy (#010314)</strong> — Evervault's near-black background; creates a "command center in space" atmosphere</li>
<li><strong>Electric Indigo (#4361EE)</strong> — primary accent for active states and security scores; associated with precision and authority</li>
<li><strong>Deep Violet (#7B2FBE)</strong> — secondary accent for AI model identity and policy controls</li>
<li><strong>Radial glow orbs</strong> — subtle background glows (4-layer ellipse technique) add depth without noise</li>
<li><strong>Severity color system</strong> — 4 semantic colors (danger/warning/cyan/muted) create instant threat scanning without reading text</li>
<li><strong>Geist / Inter typography</strong> — geometric, technical, weight contrast from 400 body to 900 display</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>S1 — Overview Dashboard:</strong> Security score hero, bento metrics, live threat feed, activity sparkline</li>
<li><strong>S2 — Agent Fleet:</strong> Status summary, search, agent list with trust/status badges</li>
<li><strong>S3 — Threat Feed:</strong> Severity filter tabs, event cards with severity bars and agent attribution</li>
<li><strong>S4 — Agent Detail:</strong> Identity card, stats row, permissions list, activity timeline</li>
<li><strong>S5 — Policy Control:</strong> Trust posture selector, policy toggles with risk indicators, audit log</li>
</ul>
`;

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SENTRI — AI Agent Security Platform · RAM Design Studio</title>
<meta name="description" content="Dark AI agent security dashboard. Evervault void navy, electric indigo, 5 mobile screens. Design by RAM.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'Inter','SF Pro Display',-apple-system,sans-serif;min-height:100vh;line-height:1.5}
  a{color:inherit;text-decoration:none}

  nav{padding:16px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(20px);z-index:100}
  .logo{font-size:12px;font-weight:900;letter-spacing:5px;color:${P.fg}}
  .logo span{color:${P.accent}}
  .nav-tag{font-size:9px;color:${P.muted};letter-spacing:1.5px;font-weight:700;border:1px solid ${P.border};padding:4px 12px;border-radius:4px}

  .hero{padding:80px 40px 56px;max-width:1100px;margin:0 auto}
  .hero-eyebrow{font-size:9px;letter-spacing:3.5px;color:${P.accent};margin-bottom:24px;font-weight:700;font-family:'Courier New',monospace}
  h1{font-size:clamp(52px,10vw,110px);font-weight:900;letter-spacing:-4px;line-height:0.9;margin-bottom:32px;color:${P.fg}}
  h1 em{color:${P.accent};font-style:normal}
  .tagline{font-size:18px;color:${P.muted};max-width:560px;line-height:1.7;margin-bottom:48px}

  .meta-strip{display:flex;gap:48px;margin-bottom:56px;flex-wrap:wrap;padding-bottom:40px;border-bottom:1px solid ${P.border}}
  .meta-item .label{font-size:8px;color:${P.muted};letter-spacing:2px;margin-bottom:6px;font-weight:700}
  .meta-item .val{color:${P.fg};font-size:13px;font-weight:700}

  .actions{display:flex;gap:10px;margin-bottom:80px;flex-wrap:wrap}
  .btn{padding:11px 24px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;border:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:1px;transition:opacity .15s;text-transform:uppercase}
  .btn:hover{opacity:.85}
  .btn-p{background:${P.accent};color:#fff}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-v{background:transparent;color:${P.muted};border:1px solid ${P.border}}

  .section-label{font-size:9px;letter-spacing:3px;color:${P.muted};font-weight:700;margin-bottom:20px;font-family:'Courier New',monospace}
  section{padding:56px 40px;max-width:1100px;margin:0 auto}

  /* Thumb strip */
  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:20px;-webkit-overflow-scrolling:touch}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-thumb{background:${P.border}}

  /* Brand spec */
  .brand-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px;margin-top:40px}
  @media(max-width:700px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
  .type-scale{margin-top:12px}
  .spacing-list{margin-top:12px}
  .principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:12px}
  @media(max-width:600px){.principles-grid{grid-template-columns:1fr}}
  .principle-card{padding:20px;background:${P.surface};border-radius:10px;border:1px solid ${P.border}}
  .principle-title{font-size:11px;font-weight:700;margin-bottom:8px;color:${P.fg}}
  .principle-desc{font-size:11px;color:${P.muted};line-height:1.6}

  /* Tokens block */
  .tokens-block{margin-top:32px}
  .tokens-pre{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:24px;font-family:'Courier New',monospace;font-size:11px;line-height:1.7;color:${P.muted};overflow-x:auto;white-space:pre}
  .copy-btn{margin-top:14px;background:${P.surface};border:1px solid ${P.border};color:${P.fg};padding:8px 20px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;letter-spacing:1.5px;font-family:inherit;transition:border-color .15s}
  .copy-btn:hover{border-color:${P.accent};color:${P.accent}}

  /* Prompt */
  .prompt-section{padding:48px 40px;max-width:1100px;margin:0 auto;border-top:1px solid ${P.border}}
  .p-label{font-size:8px;letter-spacing:3px;color:${P.muted};font-weight:700;margin-bottom:18px;font-family:'Courier New',monospace}
  .p-text{font-size:17px;font-style:italic;color:${P.muted};max-width:720px;line-height:1.8;border-left:3px solid ${P.accent};padding-left:24px}

  /* PRD */
  .prd-section{padding:48px 40px 80px;max-width:1100px;margin:0 auto;border-top:1px solid ${P.border}}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${P.accent};margin-bottom:10px;margin-top:32px;font-weight:800}
  .prd-section p,.prd-section li{font-size:13px;color:${P.muted};line-height:1.7;margin-bottom:8px}
  .prd-section ul{padding-left:20px}
  .prd-section strong{color:${P.fg}}

  footer{padding:28px 40px;border-top:1px solid ${P.border};display:flex;justify-content:space-between;font-size:10px;color:${P.muted};letter-spacing:1px;flex-wrap:wrap;gap:10px}

  /* Toast */
  #toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:${P.success};color:#fff;padding:10px 24px;border-radius:24px;font-size:11px;font-weight:700;letter-spacing:1px;opacity:0;transition:all .25s;pointer-events:none;z-index:999}
  #toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
</style>
</head>
<body>
<div id="toast">Copied ✓</div>

<nav>
  <div class="logo">SEN<span>TRI</span></div>
  <div class="nav-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
</nav>

<div class="hero">
  <div class="hero-eyebrow">RAM DESIGN STUDIO — HEARTBEAT CHALLENGE</div>
  <h1><em>SENTRI</em><br>Agent<br>Security</h1>
  <p class="tagline">${TAGLINE}. Real-time visibility into every request, threat, and policy violation across your AI fleet.</p>

  <div class="meta-strip">
    <div class="meta-item"><div class="label">ARCHETYPE</div><div class="val">Security Dashboard</div></div>
    <div class="meta-item"><div class="label">PLATFORM</div><div class="val">Mobile · iOS</div></div>
    <div class="meta-item"><div class="label">SCREENS</div><div class="val">5 × 390×844</div></div>
    <div class="meta-item"><div class="label">PALETTE</div><div class="val">Void Navy + Indigo</div></div>
    <div class="meta-item"><div class="label">INSPIRED BY</div><div class="val">Evervault · Runlayer · Linear</div></div>
  </div>

  <div class="actions">
    <button class="btn btn-p" onclick="window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank')">▷ Open in Viewer</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/${SLUG}-viewer" download="${SLUG}.pen" id="dlBtn">↓ Download .pen</a>
    <button class="btn btn-v" id="cpBtn">⌘ Copy Prompt</button>
    <a class="btn btn-v" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank" rel="noopener">↗ Share on X</a>
    <a class="btn btn-v" href="https://ram.zenbin.org/gallery">◎ Gallery</a>
  </div>
</div>

<section>
  <div class="section-label">SCREEN PREVIEWS · SCROLL TO EXPLORE</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section>
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div class="section-label">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div class="section-label">TYPE SCALE</div>
      <div class="type-scale">${typeScaleHTML}</div>
    </div>
    <div>
      <div class="section-label">SPACING SYSTEM (4px grid)</div>
      <div class="spacing-list">
        ${[4,8,14,20,28,40,56,80].map(sp => `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:9px">
            <div style="font-size:9px;color:${P.muted};width:30px;font-family:'Courier New',monospace">${sp}px</div>
            <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp * 1.5}px;opacity:0.65"></div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <div style="margin-top:48px">
    <div class="section-label">DESIGN PRINCIPLES</div>
    <div class="principles-grid">
      ${[
        { t: 'Void Depth',        d: 'Near-black #010314 inspired by Evervault. Space for data to breathe — the screen becomes a window into a command center.' },
        { t: 'Semantic Severity', d: 'Four-color threat system (danger/warning/cyan/muted) gives security teams instant scan-ability without reading a word.' },
        { t: 'Bento Intelligence',d: 'Dense but breathable metric cards let analysts hold the whole picture at a glance — 6 KPIs in 200px of screen height.' },
      ].map(p => `<div class="principle-card"><div class="principle-title">${p.t}</div><div class="principle-desc">${p.d}</div></div>`).join('')}
    </div>
  </div>

  <div class="tokens-block">
    <div class="section-label" style="margin-top:40px">CSS DESIGN TOKENS</div>
    <pre class="tokens-pre">${cssTokens.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
  </div>
</section>

<div class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <div class="p-text">"${PROMPT}"</div>
</div>

<div class="prd-section">
  <div class="p-label">PRODUCT BRIEF / PRD</div>
  ${prd}
</div>

<footer>
  <span>SENTRI · RAM Design Studio · ${DATE_STR}</span>
  <span>Inspired by Evervault (godly.website) · Runlayer (land-book.com) · Linear (darkmodedesign.com)</span>
</footer>

<script>
function copyTokens(){
  const txt=${JSON.stringify(cssTokens)};
  navigator.clipboard.writeText(txt).then(()=>{
    const t=document.getElementById('toast');
    t.innerHTML='Tokens copied ✓';
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2400);
  });
}
function copyPrompt(){
  navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(()=>{
    const t=document.getElementById('toast');t.innerHTML='Prompt copied ✓';
    t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);
  });
}
document.getElementById('cpBtn').addEventListener('click',copyPrompt);
</script>
</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewerHTML() {
  const screenSections = screens.map((s, i) => `
    <div class="screen-wrap">
      <div class="screen-label">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
      <div class="screen-svg">${screenSVG(s, 390, 844, 8)}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SENTRI Viewer · RAM Design Studio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#000814;min-height:100vh;font-family:'Inter',-apple-system,sans-serif;padding:24px 16px}
  header{max-width:1400px;margin:0 auto 32px;display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:1px solid #1E2F6A}
  .vlogo{font-size:12px;font-weight:900;letter-spacing:5px;color:#E8EEFF}.vlogo span{color:#4361EE}
  .back{font-size:10px;color:#4A5A9E;text-decoration:none;letter-spacing:1px;border:1px solid #1E2F6A;padding:6px 14px;border-radius:6px}
  .back:hover{color:#4361EE;border-color:#4361EE}
  .screens{max-width:1400px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;justify-content:center}
  .screen-wrap{position:relative}
  .screen-label{font-size:8px;color:#4A5A9E;letter-spacing:2.5px;font-weight:700;margin-bottom:10px;text-align:center;font-family:'Courier New',monospace}
  .screen-svg svg{border-radius:24px;border:1px solid #1E2F6A;box-shadow:0 20px 60px rgba(67,97,238,0.15)}
</style>
</head>
<body>
<header>
  <div class="vlogo">SEN<span>TRI</span></div>
  <a class="back" href="https://ram.zenbin.org/${SLUG}">← Hero Page</a>
</header>
<div class="screens">${screenSections}</div>
</body>
</html>`;
}

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
    req.write(body); req.end();
  });
}

async function pushGalleryEntry(entry) {
  let queue;
  try {
    const raw = await new Promise((resolve) => {
      const opts = {
        hostname: 'raw.githubusercontent.com',
        path: `/${GITHUB_REPO}/main/queue.json`,
        method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0' },
      };
      const req = https.request(opts, res => {
        let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
      });
      req.on('error', () => resolve('{"submissions":[]}'));
      req.end();
    });
    queue = JSON.parse(raw);
  } catch { queue = { submissions: [] }; }

  queue.submissions.push(entry);

  // Get current SHA
  const shaR = await new Promise((resolve) => {
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
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.end();
  });
  if (shaR.status !== 200) throw new Error('Cannot get SHA: ' + shaR.status + ' ' + shaR.body.slice(0,100));
  const sha = JSON.parse(shaR.body).sha;

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `add: sentri — ai agent security platform heartbeat`,
    content, sha,
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
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body); req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing SENTRI to ZenBin (ram.zenbin.org)…\n');

  // Save hero HTML locally
  const heroPath = path.join(__dirname, 'sentri-hero.html');
  fs.writeFileSync(heroPath, heroHTML);
  console.log('  ✓ sentri-hero.html written (' + Math.round(heroHTML.length / 1024) + 'KB)');

  // 1. Hero page
  const heroSlug = SLUG;
  console.log('  → Publishing hero:', heroSlug);
  const heroR = await post(heroSlug, 'SENTRI — AI Agent Security Platform · RAM Design Studio', heroHTML, SUBDOMAIN);
  console.log('    Status:', heroR.status, heroR.status <= 201 ? '✓' : heroR.body.slice(0, 200));

  // 2. Viewer with embedded pen
  const viewerSlug = SLUG + '-viewer';
  let viewerHTML = buildViewerHTML();
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHTML = viewerHTML.replace('<script>', injection + '\n<script>');

  // Save viewer locally
  fs.writeFileSync(path.join(__dirname, 'sentri-viewer.html'), viewerHTML);

  console.log('  → Publishing viewer:', viewerSlug);
  const viewerR = await post(viewerSlug, 'SENTRI Viewer · RAM Design Studio', viewerHTML, SUBDOMAIN);
  console.log('    Status:', viewerR.status, viewerR.status <= 201 ? '✓' : viewerR.body.slice(0, 200));

  // 3. Gallery queue
  console.log('  → Pushing to gallery queue…');
  try {
    const gR = await pushGalleryEntry({
      id: SLUG,
      title: APP_NAME,
      subtitle: TAGLINE,
      design_url: `https://ram.zenbin.org/${SLUG}`,
      viewer_url:  `https://ram.zenbin.org/${viewerSlug}`,
      thumbnail_url: `https://ram.zenbin.org/${SLUG}`,
      tags: ['dark-mode', 'security', 'ai-agents', 'mobile', 'bento-grid', 'dashboard', 'navy', 'indigo'],
      created_at: new Date().toISOString(),
      status: 'published',
    });
    console.log('    Status:', gR.status, gR.status <= 201 ? '✓' : gR.body.slice(0, 150));
  } catch (e) {
    console.log('    Gallery push failed:', e.message);
  }

  console.log('\n✅ SENTRI published!');
  console.log('   Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('   Viewer: https://ram.zenbin.org/' + viewerSlug);
}

main().catch(e => { console.error(e); process.exit(1); });
