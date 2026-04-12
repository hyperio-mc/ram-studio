'use strict';
// publish-lattice.js — Full Design Discovery pipeline for LATTICE heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'lattice';
const VIEWER_SLUG = 'lattice-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'LATTICE',
  tagline:   'AI-powered developer experience analytics. DORA metrics, PR cycle time, code health, and team insights — in one ultra-dark dashboard.',
  archetype: 'DevEx Analytics Platform',
  palette: {
    bg:      '#010610',
    fg:      '#DCE8FF',
    accent:  '#4F8EFF',
    accent2: '#00C896',
  },
};

const sub = {
  id:           'heartbeat-lattice',
  prompt:       'Design LATTICE — an AI developer experience analytics platform for engineering teams. Inspired by Evervault\'s ultra-deep navy #010314 background seen on godly.website (enterprise security SaaS aesthetic), LangChain\'s AI developer tool landing page trending on land-book.com (March 2026), Linear\'s hyper-refined dark UI from darkmodedesign.com, and Good Fella\'s brutalist motion-forward portfolio on Awwwards. Palette: void navy #010610 with electric blue #4F8EFF, teal #00C896, amber #FFB340. 5 mobile screens: Dashboard (DORA metrics bento) · PR Analytics (cycle time chart + review queue) · Alerts (incident intelligence) · Code Health (tech debt + coverage) · Team (contributor dashboard).',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Dashboard', 'PR Analytics', 'Alerts', 'Code Health', 'Team'],
  markdown: `## Overview
LATTICE is an AI-powered developer experience (DevEx) analytics platform built for engineering leaders and senior engineers who care about team performance, code quality, and sustainable delivery. It surfaces DORA metrics, PR cycle time trends, incident intelligence, code health scores, and contributor activity in a single ultra-dark, data-dense mobile dashboard.

## Target Users
- **Engineering managers** tracking team velocity, DORA metrics, and deployment frequency
- **Staff/principal engineers** monitoring code health, tech debt, and complexity hotspots
- **DevOps/SRE teams** watching incident patterns, MTTR, and error rates
- **CTOs and VPEs** wanting a single pane of glass on engineering org health

## Core Features
- **DORA Dashboard** — Real-time DORA score (Elite/High/Medium/Low) with deploy frequency, lead time, change failure rate, and MTTR. 12-week sparkline charts showing velocity and lead time trends. Active PR strip.
- **PR Analytics** — Cycle time bar chart with 12-week history, best-day highlight, and trend line. Review queue sorted by urgency (URGENT / TODAY / QUEUE) with repo labels, line counts, and age.
- **Alert Intelligence** — Active incidents with severity (CRITICAL / WARNING), auto-scale status, and runbook links. Resolved incident log with time-to-resolve. Pulsing live indicator for critical incidents.
- **Code Health** — Composite health score (A–F) with tech debt in days, test coverage %, and cyclomatic complexity grade. 12-week coverage trend sparkline. Complexity hotspot file list with refactor priority.
- **Team Contributor View** — Week activity bar chart (Mon–Sun). Per-contributor cards with avatar, role, status badge (active/focused/out), PR count, review count, and contribution progress bar.

## Design Language
Inspired by four specific sources discovered on **March 20, 2026**:

1. **Evervault Customers page** (godly.website) — Background computed as \`rgb(1, 3, 20)\` — a near-void navy that is *not* pure black. LATTICE adopts this as its signature tone (#010610), pushing deeper darkness to create maximum luminance contrast with glow-blue accents.
2. **LangChain landing page** (land-book.com, trending March 2026) — AI/developer tool SaaS with strong terminal flavour and structured data hierarchy. LATTICE uses a similar information-dense bento layout with clear section labelling at 9px / letter-spacing 1.5px.
3. **Linear** (darkmodedesign.com) — Hyper-refined dark UI with subtle glow borders and impeccable information density. LATTICE borrows the border strategy: 1px solid with low-opacity accent colors (\`#4F8EFF44\`) rather than grey to maintain color temperature.
4. **Good Fella portfolio** (Awwwards, March 2026) — "Websites That Move" — bold oversized type on dark backgrounds. LATTICE uses heavy all-caps section labels (9px / 700 weight / 1.5px letter-spacing) as structural anchors throughout every screen.

The palette — **void navy #010610 with electric blue #4F8EFF** — reads as elite developer tooling. The electric blue is luminous against the near-void background. Teal #00C896 provides semantic positive (good metrics, resolved), amber #FFB340 for warnings, red #FF4D6A for critical.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. Dashboard — DORA score hero card with ring, 4 metric chips (bento), 2 sparklines, active PR strip
2. PR Analytics — Filter chips, 12-bar cycle time chart, 4 review queue cards with urgency badges
3. Alerts — Critical incident card with pulse dot + action buttons, warning card, 5 resolved items
4. Code Health — Composite health score ring, 3 breakdown chips, coverage sparkline, 4 hotspot file rows
5. Team — 7-day commit activity bar chart, 5 contributor cards with status, stats, and contribution bars`,
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
const post  = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'POST', headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const put_  = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'PUT',  headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const get_  = (host, p, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0', ...hdrs } });

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
    .replace(/`([^`]+)`/g, '<code style="background:#0B1530;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#4F8EFF">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = lightenHex(meta.palette.bg, 10);
  const border  = lightenHex(meta.palette.bg, 24);
  const THUMB_H = 200;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = `M · ${prd.screenNames[i] || i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#010610', role: 'VOID NAVY'     },
    { hex: '#060D1F', role: 'SURFACE'       },
    { hex: '#0B1530', role: 'SURFACE 2'     },
    { hex: '#DCE8FF', role: 'FOREGROUND'    },
    { hex: '#4F8EFF', role: 'ELECTRIC BLUE' },
    { hex: '#00C896', role: 'TEAL'          },
    { hex: '#FFB340', role: 'AMBER'         },
    { hex: '#FF4D6A', role: 'ALERT RED'     },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '72px', weight: '900', sample: 'LATTICE' },
    { label: 'HEADING',  size: '20px', weight: '700', sample: 'AI Developer Experience Platform' },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'DORA metrics, code health, and team insights for elite engineering orgs.' },
    { label: 'CAPTION',  size: '10px', weight: '700', sample: 'DEPLOY FREQ · LEAD TIME · MTTR · CHANGE FAIL RATE' },
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
  /* Color — LATTICE Void Navy palette */
  --color-bg:        #010610;
  --color-surface:   #060D1F;
  --color-surface2:  #0B1530;
  --color-surface3:  #101D3F;
  --color-border:    #1A2D5A;
  --color-dim:       #243660;
  --color-muted:     #3A5490;
  --color-fg:        #DCE8FF;
  --color-fg2:       #8AAAD8;
  --color-blue:      #4F8EFF;
  --color-blue-lt:   #7EAAFF;
  --color-blue-dm:   #0A1A3F;
  --color-teal:      #00C896;
  --color-teal-dm:   #003D2D;
  --color-amber:     #FFB340;
  --color-amber-dm:  #3D2900;
  --color-red:       #FF4D6A;
  --color-red-dm:    #3D0012;

  /* Typography */
  --font-family:   'SF Pro Display', 'Inter', system-ui, sans-serif;
  --font-mono:     'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:  900 clamp(48px, 8vw, 96px) / 1 var(--font-family);
  --font-heading:  700 20px / 1.3 var(--font-family);
  --font-body:     400 14px / 1.6 var(--font-family);
  --font-caption:  700 10px / 1 var(--font-family);
  --font-label:    700 9px / 1 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 14px;  --radius-full: 9999px;

  /* Shadows / Glows */
  --shadow-glow-blue:  0 0 60px #4F8EFF18;
  --shadow-glow-teal:  0 0 40px #00C89614;
  --shadow-glow-amber: 0 0 40px #FFB34014;
  --shadow-card: 0 4px 24px #01061088;

  /* Borders */
  --border-subtle:  1px solid #1A2D5A;
  --border-accent:  1px solid #4F8EFF44;
  --border-success: 1px solid #00C89644;
  --border-warning: 1px solid #FFB34044;
  --border-danger:  1px solid #FF4D6A44;
}`;

  const encoded = Buffer.from(JSON.stringify(doc)).toString('base64');
  const shareText = encodeURIComponent(
    `LATTICE — AI Developer Experience Platform. 5 dark-mode mobile screens + full brand spec + CSS tokens. Void navy DevEx dashboard designed by RAM Design AI. Check it out:`
  );

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LATTICE — AI Developer Experience Platform · RAM Design Studio</title>
<meta name="description" content="LATTICE — ultra-dark DevEx analytics platform. DORA metrics, PR cycle time, code health, team insights. 5 mobile screens, full brand spec, CSS tokens. Designed by RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#010610;color:#DCE8FF;font-family:'SF Pro Display','Inter',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:900;letter-spacing:5px;color:${meta.palette.accent}}
  .nav-id{font-size:11px;color:${meta.palette.accent};letter-spacing:1px;opacity:.7}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;opacity:.8}
  h1{font-size:clamp(72px,12vw,128px);font-weight:900;letter-spacing:-4px;line-height:0.95;margin-bottom:24px;color:#DCE8FF}
  .sub{font-size:16px;opacity:.5;max-width:560px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:${meta.palette.accent};color:#010610}
  .btn-p:hover{opacity:.9}
  .btn-g{background:${meta.palette.accent2};color:#010610}
  .btn-g:hover{opacity:.9}
  .btn-s{background:transparent;color:#DCE8FF;border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:680px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#DCE8FF;opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:17px;opacity:.55;font-style:italic;max-width:680px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:800px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:720px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#DCE8FF}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:#010610;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:720px;font-size:12px;line-height:1.7;opacity:.75}
  .inspiration-bar strong{color:${meta.palette.accent};opacity:1}
  .stat-row{display:flex;gap:40px;margin:0 40px 60px;flex-wrap:wrap}
  .stat{border:1px solid ${border};border-radius:10px;padding:16px 24px;flex:1;min-width:140px}
  .stat-val{font-size:28px;font-weight:900;color:${meta.palette.accent};margin-bottom:4px}
  .stat-label{font-size:9px;letter-spacing:1.5px;opacity:.4}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-lattice · ${today}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · DEVEX ANALYTICS · ${today}</div>
  <h1>LATTICE</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>DEVEX ANALYTICS</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>VOID NAVY + ELECTRIC BLUE</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>DESIGNED BY</span><strong>RAM · HEARTBEAT RUN</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-g" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="stat-row">
  <div class="stat"><div class="stat-val">5</div><div class="stat-label">SCREENS</div></div>
  <div class="stat"><div class="stat-val">181KB</div><div class="stat-label">PEN FILE SIZE</div></div>
  <div class="stat"><div class="stat-val">8</div><div class="stat-label">COLOR TOKENS</div></div>
  <div class="stat"><div class="stat-val">4</div><div class="stat-label">RESEARCH SOURCES</div></div>
</div>

<div class="inspiration-bar">
  <strong>Research sources (March 20, 2026):</strong>
  Evervault Customers page deep navy aesthetic (<a href="https://godly.website" style="color:#4F8EFF">godly.website</a>) ·
  LangChain AI dev tool landing page (<a href="https://land-book.com" style="color:#4F8EFF">land-book.com</a>) ·
  Linear hyper-refined dark UI (<a href="https://www.darkmodedesign.com" style="color:#4F8EFF">darkmodedesign.com</a>) ·
  Good Fella brutalist motion portfolio (<a href="https://www.awwwards.com" style="color:#4F8EFF">Awwwards</a>)
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · 8 TONES</div>
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
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${[
        'Void navy, not plain black — #010610 has a blue-black cast that creates depth without the harshness of pure black. Every glow reads warmer against it.',
        'Semantic color as signal — electric blue for navigation/primary, teal for positive outcomes, amber for warnings, red for critical. Never used decoratively.',
        'Section labels as grid anchors — 9px / 700 weight / 1.5px letter-spacing labels replace headers. Inspired by Linear\'s information density philosophy and Good Fella\'s typographic boldness.',
      ].map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
        <div style="color:${meta.palette.accent};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i + 1).padStart(2, '0')}</div>
        <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>

  </div>

  <div class="tokens-block" id="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF / PRD</div>
  ${mdToHtml(prd.markdown)}
</section>

<footer>
  <span>RAM Design Studio · AI-native design heartbeat</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = ${JSON.stringify(encoded)};
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
function openInViewer() {
  window.open('https://ram.zenbin.org/${VIEWER_SLUG}', '_blank');
}
function downloadPen() {
  try {
    const jsonStr = atob(D);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lattice.pen';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch(e) { alert('Download failed: ' + e.message); }
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT)
    .then(() => toast('Prompt copied ✓'))
    .catch(() => toast('Copy failed'));
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(() => toast('Tokens copied ✓'))
    .catch(() => toast('Copy failed'));
}
function shareOnX() {
  window.open('https://twitter.com/intent/tweet?text=${shareText}%20https://ram.zenbin.org/lattice', '_blank');
}
</script>
</body>
</html>`;
}

// ── GitHub queue helpers ──────────────────────────────────────────────────────
async function getQueueSha() {
  const r = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  });
  if (r.status !== 200) throw new Error(`Queue SHA fetch failed: ${r.status}`);
  return JSON.parse(r.body).sha;
}

async function addToGalleryQueue(heroUrl) {
  const raw = await get_('raw.githubusercontent.com', `/${GITHUB_REPO}/main/${QUEUE_FILE}`, {});
  if (raw.status !== 200) throw new Error(`Queue fetch failed: ${raw.status}`);
  const queue = JSON.parse(raw.body);
  const sha = await getQueueSha();

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
  const body = JSON.stringify({
    message: `heartbeat: add lattice to gallery`,
    content,
    sha,
  });
  return put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, body, {
    Authorization: `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    Accept: 'application/vnd.github.v3+json',
  });
}

// ── Publish to ZenBin ─────────────────────────────────────────────────────────
async function publishToZenBin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const r = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': subdomain,
    },
  }, body);
  return r;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('⚡ Publishing LATTICE through Design Discovery pipeline...\n');

  const penJson = fs.readFileSync(path.join(__dirname, 'lattice.pen'), 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded lattice.pen — ${doc.children.length} screens`);

  const heroHTML = buildHeroHTML(doc, penJson);
  console.log(`✓ Built hero HTML — ${(heroHTML.length / 1024).toFixed(0)}KB`);

  fs.writeFileSync(path.join(__dirname, 'lattice-hero.html'), heroHTML);
  console.log('✓ Saved lattice-hero.html locally');

  // Hero → ram.zenbin.org/lattice
  console.log(`\n📤 Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroResult = await publishToZenBin(SLUG, 'LATTICE — AI Developer Experience Platform · RAM Design Studio', heroHTML, 'ram');
  if (heroResult.status === 200 || heroResult.status === 201) {
    console.log(`✓ Hero published → https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`⚠ Hero publish: ${heroResult.status} ${heroResult.body.slice(0, 300)}`);
  }

  // Viewer → ram.zenbin.org/lattice-viewer
  let viewerResult = { status: 0 };
  try {
    console.log(`\n📤 Fetching pen-viewer template...`);
    const viewerBase = await httpsReq({
      hostname: 'zenbin.org',
      path: '/p/pen-viewer-3',
      method: 'GET',
      headers: { Accept: 'text/html', 'User-Agent': 'design-studio-agent/1.0' },
    });
    if (viewerBase.status === 200) {
      let viewerHtml = viewerBase.body;
      const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
      if (viewerHtml.includes('<script>')) {
        viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
      } else {
        viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
      }
      console.log(`📤 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
      viewerResult = await publishToZenBin(VIEWER_SLUG, 'LATTICE Viewer · RAM Design Studio', viewerHtml, 'ram');
      if (viewerResult.status === 200 || viewerResult.status === 201) {
        console.log(`✓ Viewer published → https://ram.zenbin.org/${VIEWER_SLUG}`);
      } else {
        console.log(`⚠ Viewer publish: ${viewerResult.status} ${viewerResult.body.slice(0, 200)}`);
      }
    } else {
      console.log(`⚠ Could not fetch viewer template: ${viewerBase.status}`);
    }
  } catch (e) {
    console.log(`⚠ Viewer publish error: ${e.message}`);
  }

  // Gallery queue
  console.log(`\n📋 Adding to gallery queue...`);
  try {
    const heroUrl = `https://ram.zenbin.org/${SLUG}`;
    const qResult = await addToGalleryQueue(heroUrl);
    if (qResult.status === 200 || qResult.status === 201) {
      console.log(`✓ Added to gallery queue → ${GITHUB_REPO}`);
    } else {
      console.log(`⚠ Gallery queue: ${qResult.status} ${qResult.body.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`⚠ Gallery queue error: ${e.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ LATTICE Design Discovery Pipeline Complete');
  console.log(`   Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
