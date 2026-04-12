'use strict';
// publish-nexus.js
// Full Design Discovery pipeline for NEXUS heartbeat design
// Hero → ram.zenbin.org/nexus
// Viewer → ram.zenbin.org/nexus-viewer
// Gallery → hyperio-mc/design-studio-queue

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'nexus';
const VIEWER_SLUG = 'nexus-viewer';

const meta = {
  appName:   'NEXUS',
  tagline:   'Orchestrate, monitor, and scale your AI agent fleet.',
  archetype: 'AI Agent Orchestration Dashboard',
  palette: {
    bg:      '#080808',
    fg:      '#F5F5F5',
    accent:  '#F5A623',
    accent2: '#4ADE80',
    orange:  '#F97316',
    red:     '#EF4444',
    blue:    '#60A5FA',
  },
};

const sub = {
  id:           'heartbeat-nexus',
  prompt:       "Design NEXUS — a dark-mode AI agent orchestration dashboard. Phosphor amber #F5A623 accent on near-black #080808 background with subtle CRT scanline texture. Retro-terminal aesthetic inspired by 'Chus Retro OS Portfolio' (minimal.gallery), Linear's near-black dark mode (darkmodedesign.com), and Runlayer's agent orchestration product (land-book.com). 10 screens: Fleet Dashboard, Agent Canvas, Run Console, Connections, Insights (mobile + desktop each). Monospace log lines, retro window frames with traffic-light dots, phosphor amber gauges.",
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Fleet', 'Canvas', 'Run Log', 'Connections', 'Insights'],
  markdown: `## Overview
NEXUS is a professional AI agent orchestration platform — a command center for engineering teams that build, deploy, and monitor autonomous AI agent workflows. Think Linear meets Grafana, but purpose-built for the age of multi-agent systems with MCP tool connectivity.

## Target Users
- **Platform engineers** who build and maintain AI agent infrastructure
- **ML/AI teams** deploying autonomous agents in production
- **DevOps leads** who need observability, alerting, and control planes for agent fleets
- **Product teams** building AI-first features that depend on agent pipelines

## Core Features
- **Fleet Dashboard** — Real-time overview of all agents: status, run counts, latency, error rates. Persistent KPI strip with live telemetry. Agent table with inline status badges.
- **Visual Canvas** — Drag-and-drop workflow builder. Agent nodes connected by routing lines. Retro window frames for panels. Per-agent config drawer. Run-flow button triggers live execution.
- **Run Console** — Terminal-style execution log with color-coded severity (INFO/DONE/WARN/ERR). Per-run statistics: duration, token usage, cost, agent count. Retro window chrome with traffic-light dots.
- **Connections** — MCP and API connection registry. Status (connected/pending/disconnected), usage stats, agent count per connection. Add/remove integrations.
- **Insights** — 7-day run volume bar charts, latency distribution, agent leaderboard, cost breakdown. All data surfaces without drilling into sub-pages.

## Design Language
Inspired by three specific sources researched on **March 20, 2026**:

1. **"Chus Retro OS Portfolio"** (minimal.gallery) — Windowed UI with traffic-light dots, monochrome near-black with warm accent, retro computer interface panels. Influenced the retro window frame component, the terminal console aesthetic, and the overall "command center" positioning of NEXUS.

2. **Linear.app** (darkmodedesign.com) — Near-black #08090A background, Inter Variable, ultra-refined dark product system with hairline borders and high-contrast accent. Validated the near-black + single accent approach; influenced the sidebar navigation, KPI strip, and table density.

3. **Runlayer "Enterprise MCPs, Skills & Agents"** (land-book.com) — Agent orchestration SaaS with visual pipeline positioning. Influenced the Canvas screen's node-based workflow builder and the Connections screen's registry pattern.

**Key design decision**: Warm phosphor amber (#F5A623) as the single primary accent — a deliberate break from the cool violet/cyan/teal palette used in previous RAM designs (AXIS, BEACON, STRAND). The amber references CRT monitor phosphor glow, reinforcing the retro-terminal aesthetic while staying premium and legible. Phosphor green (#4ADE80) is used exclusively for "running/success" states.

## Screen Architecture
### Mobile (390×844)
1. **Fleet Dashboard** — Nav + 2×2 KPI cards + scrollable agent list with status dots and latency
2. **Agent Canvas** — Canvas toolbar + dot-grid workspace + agent nodes + bottom config drawer
3. **Run Console** — Run header card + scrollable terminal log + color-coded severity badges
4. **Connections** — Search bar + filter chips + connection cards with status indicator
5. **Insights** — Bar chart + 2×2 metric cards + agent leaderboard with progress bars

### Desktop (1440×900)
6. **Fleet Dashboard** — Persistent top bar + left sidebar nav + 4-up KPI strip + dense agent table
7. **Agent Canvas** — Full-width canvas with dot-grid + left sidebar + right config panel
8. **Run Console** — Run tabs + run header + full terminal window with retro chrome
9. **Connections** — 4-column card grid for integrations
10. **Insights** — 5-up KPI strip + 2-column layout (bar chart + latency dist) + (leaderboard + cost)`,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(hostname, path_, body, headers) {
  headers = headers || {};
  return new Promise(function(resolve, reject) {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname: hostname, path: path_, method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length }, headers),
    }, function(res) {
      let d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve({ status: res.statusCode, body: d }); });
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

function getJson(hostname, path_, headers) {
  headers = headers || {};
  return new Promise(function(resolve, reject) {
    const req = https.request({
      hostname: hostname, path: path_, method: 'GET',
      headers: Object.assign({ 'User-Agent': 'design-studio-agent/1.0' }, headers),
    }, function(res) {
      let d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve({ status: res.statusCode, body: d }); });
    });
    req.on('error', reject);
    req.end();
  });
}

function put(hostname, path_, body, headers) {
  headers = headers || {};
  return new Promise(function(resolve, reject) {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname: hostname, path: path_, method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length }, headers),
    }, function(res) {
      let d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve({ status: res.statusCode, body: d }); });
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

// ── SVG thumb renderer ────────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = (typeof el.fill === 'string') ? el.fill : 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? (' opacity="' + el.opacity.toFixed(2) + '"') : '';
  const rAttr = el.cornerRadius ? (' rx="' + Math.min(el.cornerRadius, w / 2, h / 2) + '"') : '';
  if (el.type === 'frame') {
    const bg = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + rAttr + oAttr + '/>';
    const kids = (el.children || []).map(function(c) { return renderElSVG(c, depth + 1); }).join('');
    if (!kids) return bg;
    return bg + '<g transform="translate(' + x + ',' + y + ')">' + kids + '</g>';
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return '<ellipse cx="' + (x + rx) + '" cy="' + (y + ry) + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + oAttr + '/>';
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = (typeof fill === 'string' && fill !== 'none' && fill !== 'transparent') ? fill : '#F5F5F5';
    return '<rect x="' + x + '" y="' + (y + (h - fh) / 2) + '" width="' + (w * 0.85) + '" height="' + fh + '" fill="' + tf + '"' + oAttr + ' rx="1"/>';
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(function(c) { return renderElSVG(c, 0); }).join('');
  const bg = (typeof screen.fill === 'string') ? screen.fill : '#080808';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + sw + ' ' + sh + '" width="' + tw + '" height="' + th + '" style="display:block;border-radius:8px;flex-shrink:0"><rect width="' + sw + '" height="' + sh + '" fill="' + bg + '"/>' + kids + '</svg>';
}

// ── Hero page builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  function lightenHex(hex, amt) {
    const n = parseInt((hex || '#111111').replace('#',''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r,g,b].map(function(x) { return x.toString(16).padStart(2,'0'); }).join('');
  }
  const bg = meta.palette.bg;
  const surface = lightenHex(bg, 14);
  const border  = lightenHex(bg, 32);
  const muted   = lightenHex(bg, 80);
  const accent  = meta.palette.accent;
  const fg      = meta.palette.fg;

  const screens = doc.children || [];
  const THUMB_H = 180;
  const screenLabels = prd.screenNames;
  const thumbsHTML = screens.map(function(s, i) {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const screenIdx = i % 5;
    const label = (isMobile ? 'M' : 'D') + ' · ' + (screenLabels[screenIdx] || (isMobile ? 'MOBILE' : 'DESKTOP') + ' ' + (screenIdx+1));
    return '<div style="text-align:center;flex-shrink:0">' + screenThumbSVG(s, tw, THUMB_H) + '<div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:' + tw + 'px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:' + fg + '">' + label.toUpperCase() + '</div></div>';
  }).join('');

  const swatchHTML = [
    { hex: meta.palette.bg,      role: 'VOID BLACK' },
    { hex: surface,              role: 'SURFACE'    },
    { hex: meta.palette.fg,      role: 'FOREGROUND' },
    { hex: meta.palette.accent,  role: 'AMBER'      },
    { hex: meta.palette.accent2, role: 'PHOS GREEN' },
    { hex: meta.palette.orange,  role: 'ORANGE'     },
    { hex: meta.palette.red,     role: 'ERROR RED'  },
  ].map(function(sw) {
    return '<div style="flex:1;min-width:68px"><div style="height:52px;border-radius:8px;background:' + sw.hex + ';border:1px solid ' + border + ';margin-bottom:10px"></div><div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px;color:' + fg + '">' + sw.role + '</div><div style="font-size:11px;font-weight:700;color:' + accent + '">' + sw.hex + '</div></div>';
  }).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'56px', weight:'900', sample: meta.appName + ' \u2014 AGENT ORCHESTRATION' },
    { label:'HEADING',  size:'22px', weight:'700', sample: 'Fleet Dashboard  \u00b7  Visual Canvas  \u00b7  Run Console' },
    { label:'BODY',     size:'14px', weight:'400', sample: 'Monitor, debug, and control your AI agent fleet in real-time.' },
    { label:'MONO',     size:'11px', weight:'400', sample: '14:23:07  [INFO]  Flow started: code-review-flow  [flowId=fl_a3f9b2]' },
    { label:'CAPTION',  size:'9px',  weight:'700', sample: 'AGENT STATUS \u00b7 MCP CONNECTIONS \u00b7 RUN TELEMETRY' },
  ].map(function(t) {
    return '<div style="padding:14px 0;border-bottom:1px solid ' + border + '"><div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:8px;color:' + fg + '">' + t.label + ' \u00b7 ' + t.size + ' / ' + t.weight + '</div><div style="font-size:' + t.size + ';font-weight:' + t.weight + ';line-height:1.2;color:' + fg + ';overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:' + (t.label === 'MONO' ? "'JetBrains Mono','Fira Code',monospace" : 'inherit') + '">' + t.sample + '</div></div>';
  }).join('');

  const spacingHTML = [4,8,16,24,32,48,64].map(function(sp) {
    return '<div style="display:flex;align-items:center;gap:16px;margin-bottom:10px"><div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;color:' + fg + '">' + sp + 'px</div><div style="height:8px;border-radius:4px;background:' + accent + ';width:' + (sp*2) + 'px;opacity:0.7"></div></div>';
  }).join('');

  const cssTokens = ':root {\n  /* Color — NEXUS Design System */\n  --color-bg:        ' + bg + ';\n  --color-surface:   ' + surface + ';\n  --color-border:    ' + border + ';\n  --color-fg:        ' + fg + ';\n  --color-amber:     ' + accent + ';\n  --color-green:     ' + meta.palette.accent2 + ';\n  --color-orange:    ' + meta.palette.orange + ';\n  --color-red:       ' + meta.palette.red + ';\n  --color-blue:      ' + meta.palette.blue + ';\n  --color-muted:     ' + muted + ';\n\n  /* Agent states */\n  --state-running: var(--color-green);\n  --state-idle:    var(--color-muted);\n  --state-error:   var(--color-red);\n  --state-queued:  var(--color-blue);\n  --state-warn:    var(--color-orange);\n\n  /* Typography */\n  --font-sans: Inter, -apple-system, BlinkMacSystemFont, sans-serif;\n  --font-mono: \'JetBrains Mono\', \'Fira Code\', ui-monospace, monospace;\n  --font-display: 900 clamp(40px, 6vw, 80px) / 1 var(--font-sans);\n  --font-heading: 700 20px / 1.3 var(--font-sans);\n  --font-body:    400 14px / 1.6 var(--font-sans);\n  --font-mono-sm: 400 9.5px / 1.4 var(--font-mono);\n\n  /* Spacing — 4px base grid */\n  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;\n  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;\n\n  /* Radius */\n  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 14px;\n\n  /* CRT scanline */\n  --scanline: rgba(255,255,255,0.024);\n}';

  const designPrinciplesHTML = [
    { label: 'Amber = primary', desc: 'One warm accent color across all interactive elements — breaks from cool violet/cyan trends. References CRT phosphor glow.' },
    { label: 'Retro window chrome', desc: 'Traffic-light dots on panel headers signal "living UI". Monochromatic near-black panels with amber right-edge accent.' },
    { label: 'Density by screen', desc: 'Mobile = scan mode (status dots + lat + err). Desktop = full tabular telemetry with 8 columns.' },
    { label: 'Terminal as truth', desc: 'The run log is the source of ground truth. Monospace, color-coded, no chrome — pure signal.' },
  ].map(function(p) {
    return '<div style="padding:16px 0;border-bottom:1px solid ' + border + '"><div style="font-size:12px;font-weight:700;color:' + accent + ';margin-bottom:6px">' + p.label + '</div><div style="font-size:13px;opacity:.6;line-height:1.6">' + p.desc + '</div></div>';
  }).join('');

  const shareText = encodeURIComponent('NEXUS \u2014 AI Agent Orchestration Dashboard. Phosphor amber on near-black, retro-terminal aesthetic. 10 screens + brand spec + CSS tokens by RAM Design Studio\nhttps://ram.zenbin.org/nexus\n#uidesign #agentorch #darkmode #designsystem');

  const penB64 = Buffer.from(JSON.stringify(penJson)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NEXUS \u2014 AI Agent Orchestration \u00b7 RAM Design Studio</title>
<meta name="description" content="${meta.tagline} \u2014 10 screens, brand spec & CSS tokens by RAM Design Studio.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${bg};color:${fg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh}
nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
.logo{font-size:15px;font-weight:900;letter-spacing:4px;color:${accent}}
.nav-id{font-size:11px;color:${meta.palette.accent2};letter-spacing:1px}
.hero{padding:80px 40px 40px;max-width:900px}
.eyebrow{font-size:10px;letter-spacing:3px;color:${accent};margin-bottom:20px;font-weight:700}
h1{font-size:clamp(48px,8vw,96px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px}
h1 span{color:${accent}}
.sub{font-size:17px;opacity:.5;max-width:520px;line-height:1.7;margin-bottom:36px}
.meta-row{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
.meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
.meta-item strong{color:${accent}}
.actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
.btn{padding:12px 24px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
.btn:hover{opacity:.85}
.btn-primary{background:${accent};color:#080808}
.btn-s{background:transparent;color:${accent};border:1px solid ${accent}44}
.btn-ghost{background:transparent;color:${fg};border:1px solid ${border}}
section{padding:40px;border-top:1px solid ${border}}
.label{font-size:10px;letter-spacing:2px;color:${accent};margin-bottom:24px;font-weight:700}
.thumb-strip{display:flex;gap:20px;overflow-x:auto;padding-bottom:16px}
.thumb-strip::-webkit-scrollbar{height:4px}
.thumb-strip::-webkit-scrollbar-track{background:${surface}}
.thumb-strip::-webkit-scrollbar-thumb{background:${accent}66;border-radius:2px}
.swatch-row{display:flex;gap:16px;flex-wrap:wrap}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:48px}
.principles-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.token-box{background:${surface};border:1px solid ${border};border-radius:8px;padding:24px;font-family:'JetBrains Mono','Fira Code',monospace;font-size:11px;line-height:1.8;white-space:pre;overflow-x:auto;color:${meta.palette.accent2}}
.copy-btn{background:${accent};color:#080808;border:none;padding:8px 16px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;margin-top:16px;font-family:inherit;letter-spacing:.5px}
.prompt-block{font-style:italic;font-size:18px;line-height:1.7;opacity:.6;border-left:3px solid ${accent};padding-left:24px;max-width:700px}
.prd-content{font-size:13px;line-height:1.8;opacity:.7;max-width:800px}
.prd-content h2{font-size:16px;font-weight:700;color:${accent};margin:28px 0 12px}
.prd-content h3{font-size:13px;font-weight:700;margin:20px 0 8px}
.prd-content ul{padding-left:20px}
.prd-content li{margin-bottom:6px}
.prd-content strong{color:${fg};font-weight:700;opacity:1}
footer{padding:40px;border-top:1px solid ${border};text-align:center;font-size:11px;opacity:.3}
@media(max-width:768px){
  nav,section,.hero{padding-left:20px;padding-right:20px}
  .two-col,.principles-grid{grid-template-columns:1fr}
  h1{letter-spacing:-1px}
}
</style>
</head>
<body>
<nav>
  <div class="logo">RAM</div>
  <div class="nav-id">DESIGN STUDIO \u00b7 HEARTBEAT</div>
  <a class="btn btn-s" href="https://ram.zenbin.org/gallery">\u2190 Gallery</a>
</nav>

<div class="hero">
  <div class="eyebrow">RAM DESIGN STUDIO \u00b7 HEARTBEAT \u00b7 MARCH 20 2026</div>
  <h1>NEX<span>US</span></h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta-row">
    <div class="meta-item"><span>ARCHETYPE</span><strong>${meta.archetype}</strong></div>
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 mobile + 5 desktop)</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>Phosphor amber + near-black</strong></div>
    <div class="meta-item"><span>PUBLISHED</span><strong>${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-primary" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">\u25b6 Open in Viewer</a>
    <button class="btn btn-s" onclick="downloadPen()">&#11015; Download .pen</button>
    <button class="btn btn-ghost" onclick="copyPrompt()">&#9998; Copy Prompt</button>
    <a class="btn btn-ghost" href="https://x.com/intent/tweet?text=${shareText}" target="_blank">&#120143; Share</a>
  </div>
</div>

<section>
  <div class="label">SCREEN THUMBNAILS</div>
  <div class="thumb-strip">${thumbsHTML}</div>
</section>

<section>
  <div class="label">BRAND SPEC</div>
  <div style="margin-bottom:40px">
    <div style="font-size:12px;opacity:.4;letter-spacing:1px;margin-bottom:16px">COLOR PALETTE</div>
    <div class="swatch-row">${swatchHTML}</div>
  </div>
  <div class="two-col">
    <div>
      <div style="font-size:12px;opacity:.4;letter-spacing:1px;margin-bottom:16px">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:12px;opacity:.4;letter-spacing:1px;margin-bottom:16px">SPACING SYSTEM</div>
      ${spacingHTML}
    </div>
  </div>
</section>

<section>
  <div class="label">DESIGN PRINCIPLES</div>
  <div class="principles-grid">${designPrinciplesHTML}</div>
</section>

<section>
  <div class="label">CSS DESIGN TOKENS</div>
  <div class="token-box" id="tokenBox">${cssTokens}</div>
  <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
</section>

<section>
  <div class="label">ORIGINAL PROMPT</div>
  <p class="prompt-block">${sub.prompt}</p>
</section>

<section>
  <div class="label">PRODUCT BRIEF</div>
  <div class="prd-content">${prd.markdown.replace(/## (.*)/g,'<h2>$1</h2>').replace(/### (.*)/g,'<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/- (.*)/g,'<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g,'<ul>$&</ul>').replace(/\n\n/g,'<br><br>')}</div>
</section>

<footer>
  RAM Design Studio \u00b7 Heartbeat #nexus \u00b7 ram.zenbin.org/nexus \u00b7 All designs AI-generated
</footer>

<script>
const PEN_B64 = "${penB64}";
function downloadPen() {
  const d = JSON.parse(atob(PEN_B64));
  const blob = new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nexus.pen'; a.click();
}
function copyPrompt() {
  navigator.clipboard.writeText(${JSON.stringify(sub.prompt)}).then(function(){ alert('Prompt copied!'); });
}
function copyTokens() {
  navigator.clipboard.writeText(document.getElementById('tokenBox').textContent).then(function(){ alert('CSS tokens copied!'); });
});
}
</script>
</body>
</html>`;
}

// ── Viewer builder ────────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NEXUS \u2014 Viewer \u00b7 RAM Design Studio</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#080808;color:#F5F5F5;font-family:Inter,sans-serif;height:100vh;overflow:hidden;display:flex;flex-direction:column}
header{padding:12px 20px;background:#101010;border-bottom:1px solid #242424;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.logo{font-size:14px;font-weight:900;letter-spacing:3px;color:#F5A623}
.nav-links{display:flex;gap:16px}
.nav-links a{font-size:11px;color:#888;text-decoration:none;padding:6px 12px;border:1px solid #242424;border-radius:4px}
.nav-links a:hover{color:#F5A623;border-color:#F5A62344}
#canvas{flex:1;overflow:auto;padding:40px;display:flex;flex-direction:column;align-items:flex-start}
.screen-grid{display:grid;grid-template-columns:390px 1440px;gap:40px;grid-auto-rows:auto}
.screen-wrap{border:1px solid #242424;border-radius:8px;overflow:hidden;flex-shrink:0}
.screen-label{font-size:9px;color:#444;letter-spacing:1px;margin-bottom:8px;text-transform:uppercase}
.screen-inner{transform-origin:top left}
.no-pen{padding:60px;text-align:center;color:#444}
</style>
</head>
<body>
<header>
  <span class="logo">NEXUS</span>
  <div class="nav-links">
    <a href="https://ram.zenbin.org/nexus">\u2190 Hero Page</a>
    <a href="https://ram.zenbin.org/gallery">Gallery</a>
  </div>
</header>
<div id="canvas">
  <div id="content" class="no-pen">Loading design\u2026</div>
</div>
<script>
const EMBEDDED = window.EMBEDDED_PEN;
function renderPen(penStr) {
  try {
    const pen = typeof penStr === 'string' ? JSON.parse(penStr) : penStr;
    const screens = pen.children || [];
    const container = document.getElementById('content');
    container.className = 'screen-grid';
    container.innerHTML = '';
    screens.forEach(function(s, i) {
      const label = ['Fleet M','Fleet D','Canvas M','Canvas D','Runs M','Runs D','Connections M','Connections D','Insights M','Insights D'][i] || ('Screen ' + (i+1));
      const scale = s.width > 500 ? Math.min(1, (window.innerWidth * 0.6) / s.width) : Math.min(1, (window.innerWidth * 0.25) / s.width);
      const wrap = document.createElement('div');
      wrap.innerHTML = '<div class="screen-label">' + label + '</div><div class="screen-wrap" style="width:' + Math.round(s.width * scale) + 'px;height:' + Math.round(s.height * scale) + 'px"><div class="screen-inner" style="width:' + s.width + 'px;height:' + s.height + 'px;transform:scale(' + scale.toFixed(3) + ')"></div></div>';
      container.appendChild(wrap);
    });
    document.getElementById('content').firstChild && null;
    container.innerHTML = '<p style="color:#F5A623;padding:20px">Viewer: ' + screens.length + ' screens loaded. Open hero page for full experience: <a href="https://ram.zenbin.org/nexus" style="color:#4ADE80">ram.zenbin.org/nexus</a></p>';
  } catch(e) {
    document.getElementById('content').textContent = 'Error loading pen: ' + e.message;
  }
}
if (EMBEDDED) { renderPen(EMBEDDED); }
else { document.getElementById('content').textContent = 'No embedded pen data found.'; }
</script>
</body>
</html>`;
  return viewerTemplate;
}

// ── Publish to Zenbin ─────────────────────────────────────────────────────────
async function publishToZenbin(slug, html, subdomain) {
  subdomain = subdomain || 'ram';
  console.log('  \u2192 Publishing to ' + subdomain + '.zenbin.org/' + slug + ' \u2026');
  const body = JSON.stringify({ html: html });
  const res = await post('zenbin.org', '/v1/pages/' + slug, body, { 'X-Subdomain': subdomain });
  if (res.status === 200 || res.status === 201) {
    console.log('  \u2713 Published: https://' + subdomain + '.zenbin.org/' + slug);
    return true;
  } else {
    console.error('  \u2717 Zenbin error ' + res.status + ': ' + res.body.slice(0, 200));
    return false;
  }
}

// ── GitHub gallery queue ──────────────────────────────────────────────────────
async function pushToGalleryQueue(entry) {
  const authHeader = { Authorization: 'token ' + GITHUB_TOKEN };
  const apiBase = 'api.github.com';
  const filePath = '/repos/' + GITHUB_REPO + '/contents/' + QUEUE_FILE;

  console.log('  \u2192 Fetching gallery queue from GitHub\u2026');
  const getRes = await getJson(apiBase, filePath, authHeader);
  if (getRes.status !== 200) {
    console.error('  \u2717 GitHub GET failed (' + getRes.status + '): ' + getRes.body.slice(0, 120));
    return false;
  }
  const fileData = JSON.parse(getRes.body);
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue;
  try { queue = JSON.parse(currentContent); } catch(e) { queue = []; }
  if (!Array.isArray(queue)) queue = [];

  const filtered = queue.filter(function(e) { return e.id !== entry.id; });
  filtered.unshift(entry);

  const newContent = Buffer.from(JSON.stringify(filtered, null, 2)).toString('base64');
  const putRes = await put(apiBase, filePath, JSON.stringify({
    message: 'Add ' + entry.id + ' to gallery queue',
    content: newContent,
    sha: fileData.sha,
  }), Object.assign({}, authHeader, { 'User-Agent': 'design-studio-agent/1.0' }));

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('  \u2713 Gallery queue updated (' + filtered.length + ' entries)');
    return true;
  } else {
    console.error('  \u2717 GitHub PUT failed (' + putRes.status + '): ' + putRes.body.slice(0, 120));
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async function main() {
  console.log('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
  console.log('\u2551  NEXUS \u2014 AI Agent Orchestration     \u2551');
  console.log('\u2551  RAM Design Studio Heartbeat       \u2551');
  console.log('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\n');

  // Load .pen
  const penPath = path.join(__dirname, 'nexus.pen');
  if (!fs.existsSync(penPath)) {
    console.error('ERROR: nexus.pen not found. Run nexus-app.js first.');
    process.exit(1);
  }
  const penJson  = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  const penStr   = fs.readFileSync(penPath, 'utf8');

  console.log('Step 1: Building hero page HTML\u2026');
  const heroHTML = buildHeroHTML(penJson, penJson);
  console.log('  Hero HTML: ' + (heroHTML.length / 1024).toFixed(0) + ' KB');

  console.log('\nStep 2: Building viewer HTML\u2026');
  let viewerHTML = buildViewerHTML(penJson);
  const injection = '<script>window.EMBEDDED_PEN = ' + JSON.stringify(JSON.stringify(penJson)) + ';<\/script>';
  viewerHTML = viewerHTML.replace('<script>', injection + '\n<script>');
  console.log('  Viewer HTML: ' + (viewerHTML.length / 1024).toFixed(0) + ' KB');

  console.log('\nStep 3: Publishing to Zenbin\u2026');
  const heroOk   = await publishToZenbin(SLUG, heroHTML, 'ram');
  const viewerOk = await publishToZenbin(VIEWER_SLUG, viewerHTML, 'ram');

  console.log('\nStep 4: Pushing to gallery queue\u2026');
  const galleryEntry = {
    id:          sub.id,
    prompt:      sub.prompt,
    submitted_at: sub.submitted_at,
    credit:      sub.credit,
    design_url:  'https://ram.zenbin.org/' + SLUG,
    viewer_url:  'https://ram.zenbin.org/' + VIEWER_SLUG,
    pen_name:    penJson.name,
    screen_count: (penJson.children || []).length,
    palette:     meta.palette,
    archetype:   meta.archetype,
  };
  const galleryOk = await pushToGalleryQueue(galleryEntry);

  console.log('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
  console.log('\u2551  PIPELINE COMPLETE                   \u2551');
  console.log('\u2551  Hero:   https://ram.zenbin.org/' + SLUG.padEnd(10) + '\u2551');
  console.log('\u2551  Viewer: https://ram.zenbin.org/' + VIEWER_SLUG.padEnd(6) + '\u2551');
  console.log('\u2551  Gallery: ' + (galleryOk ? '\u2713 queued' : '\u2717 failed ').padEnd(25) + '\u2551');
  console.log('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\n');
})().catch(function(err) { console.error('Fatal:', err); process.exit(1); });
