'use strict';
// nodepulse-publish.js — hero page + viewer + gallery queue for NODEPULSE

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'nodepulse';
const APP_NAME  = 'NODEPULSE';
const TAGLINE   = 'Distributed AI Cluster Health Monitor';
const DATE_STR  = 'March 21, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'nodepulse.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:       '#050810',
  surface:  '#0A0E1A',
  surface2: '#0D1220',
  border:   '#182035',
  border2:  '#213050',
  muted:    '#3D4F70',
  muted2:   '#5A6E95',
  fg:       '#DCE8F8',
  fg2:      '#8A9FC0',
  cyan:     '#00D4FF',
  violet:   '#7C5CFC',
  green:    '#00E87A',
  amber:    '#FFB340',
  red:      '#FF4060',
};

const SCREEN_NAMES = ['Pulse Overview', 'Network Topology', 'Alert Feed', 'Node Inspector', 'Cluster Config'];

const PROMPT = `Design a dark-mode AI infrastructure monitoring platform inspired by:
1. Darknode (Awwwards SOTD March 21 2026, by Qream + Yehor Herasymenko) — deep cosmic void bg #050810,
   electric cyan node-network glows, 3D animated particles, cinematic hero video, breathing room.
2. OWO app + TRIONN agency (darkmodedesign.com) — spatial dark glass panels, bold editorial wordmarks,
   "roar in the digital wilderness" typographic confidence on near-black.
3. Dark Mode Design gallery — nodes, connections, status color-coding, infrastructure aesthetics.

5 mobile screens (390×844): pulse overview dashboard with cluster health arc + metric bento,
network topology map with glowing node graph, alert + incident command center,
node inspector deep-dive with memory pressure timeline, and cluster config with threshold sliders.`;

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
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
    const ax    = align === 'middle' ? x + w/2 : align === 'end' ? x + w : x;
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
    return `<ellipse cx="${(x + w/2).toFixed(1)}" cy="${(y + h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${noFill ? 'none' : fill}" opacity="${op}"${stroke}/>`;
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

// ── Design tokens ──────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* NODEPULSE Design Tokens — Darknode-inspired cosmic dark */

  /* Backgrounds */
  --bg:           ${P.bg};
  --surface:      ${P.surface};
  --surface-2:    ${P.surface2};
  --border:       ${P.border};
  --border-2:     ${P.border2};
  --muted:        ${P.muted};
  --muted-2:      ${P.muted2};

  /* Foreground */
  --fg:           ${P.fg};
  --fg-2:         ${P.fg2};

  /* Brand — Electric Cyan (Darknode-inspired node glow) */
  --cyan:         ${P.cyan};
  --cyan-hover:   #33DCFF;

  /* Secondary — Cosmic Violet */
  --violet:       ${P.violet};
  --violet-hover: #9B7FFD;

  /* Status system */
  --success:      ${P.green};
  --warning:      ${P.amber};
  --danger:       ${P.red};

  /* Typography */
  --font-ui:      'Inter Variable', 'Inter', -apple-system, sans-serif;
  --font-mono:    'SF Mono', 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 900 clamp(28px,8vw,96px)/0.95 var(--font-ui);
  --font-heading: 700 12px/1 var(--font-ui);
  --font-body:    400 12px/1.6 var(--font-ui);
  --font-label:   700 8px/1 var(--font-ui);

  /* Spacing (4px grid) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px;  --s-4: 16px;
  --s-5: 20px; --s-6: 28px; --s-7: 40px;  --s-8: 60px;

  /* Radius */
  --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-xl: 16px; --r-full: 9999px;

  /* Glow system (Darknode-inspired radial auras) */
  --glow-cyan:   0 0 60px ${P.cyan}22, 0 0 120px ${P.cyan}0A;
  --glow-violet: 0 0 60px ${P.violet}22, 0 0 120px ${P.violet}0A;
  --glow-red:    0 0 60px ${P.red}22, 0 0 120px ${P.red}0A;
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 175, THUMB_H = 320;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 4)}
    <div style="font-size:8px;color:${P.muted2};margin-top:10px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchHTML = [
  { hex: P.bg,      role: 'BG — Cosmic Void'       },
  { hex: P.surface, role: 'SURFACE'                  },
  { hex: P.fg,      role: 'FOREGROUND'               },
  { hex: P.cyan,    role: 'CYAN — Node Glow'         },
  { hex: P.violet,  role: 'VIOLET — Brand'           },
  { hex: P.green,   role: 'GREEN — Healthy'          },
  { hex: P.amber,   role: 'AMBER — Warning'          },
  { hex: P.red,     role: 'RED — Critical'           },
].map(s => `
  <div style="flex:1;min-width:80px;max-width:120px">
    <div style="height:56px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.muted2};margin-bottom:3px">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.cyan};font-family:'Courier New',monospace">${s.hex}</div>
  </div>`).join('');

// ── Type scale ────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'DISPLAY',   size: '28px', weight: '900', sample: 'NODEPULSE'                         },
  { label: 'WORDMARK',  size: '22px', weight: '900', sample: 'CLUSTER\nHEALTH'                   },
  { label: 'HEADING',   size: '13px', weight: '700', sample: 'gpu-cluster-01'                    },
  { label: 'BODY',      size: '12px', weight: '400', sample: 'Inference node · 247 nodes online' },
  { label: 'LABEL',     size: '8px',  weight: '700', sample: 'CRITICAL · OOM RISK · us-east-4'   },
].map(t => `
  <div style="padding:16px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.muted2};margin-bottom:8px;font-family:'Courier New',monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.15;color:${P.fg};overflow:hidden;white-space:pre-line;text-overflow:ellipsis">${t.sample}</div>
  </div>`).join('');

const shareText = encodeURIComponent(`NODEPULSE — Distributed AI Cluster Health Monitor. Cosmic dark design inspired by Darknode (Awwwards SOTD), 5-screen mobile system. Built by RAM Design Studio.`);

const prd = `
<h3>OVERVIEW</h3>
<p>NODEPULSE is a dark-mode mobile application for monitoring distributed AI cluster infrastructure in real time. It gives platform engineers and SRE teams a cinematic, Darknode-inspired interface to visualize cluster topology, respond to incidents, and manage 247+ inference nodes across 16 regions. The design draws from the 3D node-network aesthetic of Darknode (Awwwards SOTD March 21 2026) — electric cyan glows on cosmic void backgrounds, glass-panel depth, and editorial wordmarks from TRIONN's "roar in the digital wilderness" confidence.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Site reliability engineers (SREs)</strong> running distributed AI inference clusters across cloud regions</li>
<li><strong>Platform engineers</strong> managing GPU fleets, API gateways, and embedding services for AI products</li>
<li><strong>On-call responders</strong> triaging critical incidents with OOM kills, latency spikes, and thermal throttling</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Pulse Overview:</strong> Full-screen cluster health arc (94%), 3-column metric bento (247 nodes, 99.8% uptime, 142ms p99), status breakdown bar by severity, 24h sparkline activity</li>
<li><strong>Network Topology:</strong> Glowing node graph with hub + 6 outer nodes color-coded by health status, connection lines in cyan/amber, inline critical node callout with KILL action</li>
<li><strong>Alert Feed:</strong> 3-panel severity summary bento (2 critical, 9 warning, 47 resolved), filter tab bar, severity-coded alert cards with left-border accents, acknowledge-all CTA</li>
<li><strong>Node Inspector:</strong> Individual node health arc (18% — critical), 4-cell metric grid (CPU 97%, Memory 94%, Network, Uptime), memory pressure sparkline, connected-to node list, Restart/Scale actions</li>
<li><strong>Cluster Config:</strong> Alert threshold sliders (CPU/Memory/Latency), notification routing toggles (PagerDuty, Slack, Email), Save configuration CTA</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Cosmic void dark system:</strong> #050810 background inspired by Darknode's deep-space aesthetic, with multi-layer elevation (#0A0E1A, #0D1220) and barely-visible borders (#182035)</li>
<li><strong>Darknode glow system:</strong> Radial aura halos (4-ring gradient from 4% to 22% opacity) simulate the particle network energy from Darknode's 3D visualizations</li>
<li><strong>TRIONN editorial confidence:</strong> Bold 900-weight wordmarks split across two lines (NODE / PULSE) in contrasting fg/cyan — inspired by TRIONN's "roar" typographic splits</li>
<li><strong>Semantic status infrastructure:</strong> Cyan #00D4FF for network/healthy signals, Violet #7C5CFC for brand/primary, Green #00E87A success, Amber #FFB340 warning, Red #FF4060 critical — each with matching glow treatments</li>
<li><strong>Glassmorphism-lite cards:</strong> Surface cards with #182035 borders create depth without breaking the dark covenant — OWO app and TRIONN's panel handling influence</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>Screen 1 — Pulse Overview:</strong> Hero dashboard with health arc, metric bento, status bar, 24h activity sparkline</li>
<li><strong>Screen 2 — Network Topology:</strong> Node graph, hub visualization, cluster map with inline incident callout</li>
<li><strong>Screen 3 — Alert Feed:</strong> Severity bento + filter tabs + alert card stream + bulk acknowledge</li>
<li><strong>Screen 4 — Node Inspector:</strong> Single-node deep-dive with metrics, pressure timeline, connection graph</li>
<li><strong>Screen 5 — Cluster Config:</strong> Threshold sliders, notification routing toggles, cluster profile card</li>
</ul>`;

// ── Build hero HTML ────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — 5-screen dark mobile design system with CSS tokens. Inspired by Darknode Awwwards SOTD.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Pro Display','Inter',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(16px);z-index:10}
  .logo{font-size:13px;font-weight:900;letter-spacing:5px;color:${P.cyan}}
  .nav-id{font-size:10px;color:${P.muted2};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px;position:relative;overflow:hidden}
  /* Darknode-inspired ambient glow on hero */
  .hero::before{content:'';position:absolute;top:50px;left:-100px;width:500px;height:500px;background:radial-gradient(ellipse,${P.cyan}0A 0%,transparent 70%);pointer-events:none}
  .hero::after{content:'';position:absolute;top:0;right:-80px;width:300px;height:300px;background:radial-gradient(ellipse,${P.violet}0A 0%,transparent 70%);pointer-events:none}
  .tag{font-size:9px;letter-spacing:3px;color:${P.cyan};margin-bottom:20px;font-weight:700;position:relative}
  h1{font-size:clamp(60px,12vw,120px);font-weight:900;letter-spacing:-4px;line-height:0.9;margin-bottom:24px;position:relative}
  h1 .accent{color:${P.cyan}}
  .sub{font-size:16px;opacity:.45;max-width:520px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:40px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1.5px;margin-bottom:4px}
  .meta-item strong{color:${P.cyan};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:.3px;transition:opacity .15s}
  .btn:hover{opacity:.85}
  .btn-p{background:${P.cyan};color:${P.bg}}
  .btn-v{background:${P.violet};color:#fff}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-x{background:#000;color:#fff;border:1px solid #1a1a1a}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.cyan};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${P.border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.cyan}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border}}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.7;color:${P.fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.cyan}22;border:1px solid ${P.cyan}44;color:${P.cyan};font-family:inherit;font-size:9px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.cyan}33}
  .prompt-section{padding:40px;border-top:1px solid ${P.border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.cyan};margin-bottom:12px;font-weight:700}
  .p-text{font-size:17px;opacity:.5;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px;white-space:pre-wrap}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.cyan};margin:32px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:20px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{opacity:1;color:${P.fg}}
  footer{padding:28px 40px;border-top:1px solid ${P.border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.cyan};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999;pointer-events:none}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">HEARTBEAT · ${DATE_STR.toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">INFRASTRUCTURE MONITORING · MOBILE APP · DARK SYSTEM · ${DATE_STR.toUpperCase()}</div>
  <h1>NODE<span class="accent">PULSE</span></h1>
  <p class="sub">${TAGLINE}. Cosmic dark design inspired by Darknode — Awwwards SOTD March 21, 2026.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>NODES</span><strong>247 TOTAL</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>BY</span><strong>RAM</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">◈ Open in Viewer</a>
    <a class="btn btn-v" href="https://ram.zenbin.org/gallery" target="_blank">⬡ Gallery</a>
    <a class="btn btn-s" href="#" onclick="copyPrompt(event)">⎘ Copy Prompt</a>
    <a class="btn btn-x" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank">𝕏 Share</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS — 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<div class="brand-section">
  <div style="max-width:960px">
    <div class="section-label">BRAND SPEC</div>
    <div class="brand-grid">
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin-bottom:16px;font-weight:700">COLOR PALETTE</div>
        <div class="swatches">${swatchHTML}</div>

        <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin:32px 0 16px;font-weight:700">SPACING SCALE (4PX GRID)</div>
        ${[4,8,12,16,20,28,40,60].map(sp => `
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
            <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;font-family:'SF Mono',monospace">${sp}px</div>
            <div style="height:7px;border-radius:4px;background:${P.cyan};width:${sp * 2}px;opacity:0.6"></div>
          </div>`).join('')}

        <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin:32px 0 16px;font-weight:700">DESIGN PRINCIPLES</div>
        ${[
          ['Cosmic Depth', 'Node glow halos create spatial depth without breaking dark covenant'],
          ['Electric Signals', 'Cyan for data flow, violet for brand, status colors as infrastructure language'],
          ['Editorial Confidence', 'Split wordmarks and 900-weight letterforms announce presence boldly'],
          ['Signal Hierarchy', 'Critical alerts always red-bordered, warnings amber — zero ambiguity'],
        ].map(([title, desc]) => `
          <div style="margin-bottom:16px">
            <div style="font-size:10px;font-weight:700;color:${P.fg};margin-bottom:4px">${title}</div>
            <div style="font-size:11px;color:${P.muted2};line-height:1.5">${desc}</div>
          </div>`).join('')}
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin-bottom:16px;font-weight:700">TYPE SCALE</div>
        ${typeScaleHTML}
      </div>
    </div>

    <div style="font-size:9px;letter-spacing:2px;color:${P.muted2};margin:40px 0 16px;font-weight:700">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    </div>
  </div>
</div>

<div class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <div class="p-text">${PROMPT}</div>
</div>

<div class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${prd}
</div>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT</span>
  <span>${DATE_STR.toUpperCase()}</span>
  <span>ram.zenbin.org · ${SLUG}</span>
</footer>

<script>
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg + ' ✓';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}
function copyTokens() {
  navigator.clipboard.writeText(${JSON.stringify(cssTokens)}).then(() => toast('Tokens copied'));
}
function copyPrompt(e) {
  e.preventDefault();
  navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(() => toast('Prompt copied'));
}
</script>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Push to gallery queue ──────────────────────────────────────────────────────
async function pushGalleryQueue() {
  const entry = {
    slug:         SLUG,
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    submitted_at: new Date().toISOString(),
    credit:       'RAM Heartbeat',
    archetype:    'infrastructure',
    palette: { bg: P.bg, fg: P.fg, accent: P.cyan, accent2: P.violet },
  };

  const getResp = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'RAM-Design-Studio', 'Accept': 'application/vnd.github.v3+json' },
  });
  const getBody = JSON.parse(getResp.body);
  const existing = JSON.parse(Buffer.from(getBody.content, 'base64').toString('utf8'));
  if (!Array.isArray(existing)) throw new Error('queue.json is not an array');

  existing.push(entry);
  const newContent = Buffer.from(JSON.stringify(existing, null, 2)).toString('base64');

  const putBody = JSON.stringify({
    message: `Add ${SLUG} to design gallery queue — RAM Heartbeat`,
    content: newContent,
    sha: getBody.sha,
  });
  const putResp = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'RAM-Design-Studio',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
    },
  }, putBody);
  return putResp.status;
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing NODEPULSE to ZenBin...');

  // Hero page
  const heroResp = await createZenBin(SLUG, `${APP_NAME} — ${TAGLINE} · RAM Design Studio`, heroHTML, SUBDOMAIN);
  console.log(`  Hero:   ${heroResp.status} → https://ram.zenbin.org/${SLUG}`);

  // Viewer
  const viewResp = await createZenBin(`${SLUG}-viewer`, `${APP_NAME} — Viewer · RAM Design Studio`, viewerHtml, SUBDOMAIN);
  console.log(`  Viewer: ${viewResp.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  // Gallery queue
  try {
    const qStatus = await pushGalleryQueue();
    console.log(`  Queue:  ${qStatus} → ${GITHUB_REPO}/queue.json`);
  } catch (e) {
    console.warn(`  Queue:  WARN — ${e.message}`);
  }

  console.log('\n✓ NODEPULSE published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
