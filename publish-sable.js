'use strict';
// publish-sable.js — Full Design Discovery pipeline for SABLE heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'sable';
const VIEWER_SLUG = 'sable-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'SABLE',
  tagline:   'Personal finance bento dashboard. Track spending, set goals, and visualize net worth — in a void-black, amber-lit UI built for financial clarity.',
  archetype: 'Personal Finance Tracker',
  palette: {
    bg:      '#080A0F',
    surface: '#0F1117',
    surface2:'#161820',
    surface3:'#1D2030',
    fg:      '#F0EFEB',
    fg2:     '#9698B2',
    amber:   '#F59E0B',
    green:   '#10B981',
    red:     '#EF4444',
    violet:  '#8B5CF6',
    muted:   '#4A4E6A',
  },
};

const sub = {
  id:           'heartbeat-sable',
  prompt:       'Design SABLE — a dark-mode personal finance app with bento-grid layout. Inspired by AuthKit\'s modular bento panel architecture and gradient depth (godly.website #991), Silencio\'s stark all-caps Neue Haas Grotesk brutalist type hierarchy (godly.website #964), and the dark finance UI wave trending on darkmodedesign.com (Midday, Forge, Flomodia). Palette: void black #080A0F + electric amber #F59E0B + income green #10B981 + expense red #EF4444. 5 mobile screens: Home Bento Dashboard · Spending Breakdown · Transaction History · Add Transaction · Budget Goals.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Home Dashboard', 'Spending Breakdown', 'Transaction History', 'Add Transaction', 'Budget Goals'],
  markdown: `## Overview
SABLE is a mobile-first personal finance tracker that fuses a bento-grid layout with a void-dark aesthetic to make financial data feel premium rather than stressful. Designed on March 19, 2026 after discovering bento grid as the dominant layout pattern on godly.website (AuthKit, FT.991) and Silencio's brutalist typographic discipline (FT.964) on the same platform. The name "sable" means black in heraldry — a deliberate choice for a dark-first product.

## Target Users
- **Young professionals** (25–38) who want financial visibility without the anxiety of traditional "budget app" UX
- **Freelancers** with variable income who need clear income vs. expense separation
- **Design-conscious savers** who won't use ugly apps regardless of features
- **Investors** who want portfolio + cash flow in one view
- **Minimalists** who value signal over noise in their financial dashboard

## Core Features
- **Home Bento Dashboard** — Modular grid of financial KPIs: total balance hero cell (full-width), income/expense stat pair, savings rate ring, net worth trend bar chart, top 3 spending categories, and recent transactions. All live data, all in one glanceable screen.
- **Spending Breakdown** — Large interactive donut chart with 5-category breakdown. Each category shows percentage, amount, and color-coded legend. Clean amber/violet/green encoding makes categories instantly scannable.
- **Transaction History** — Chronological feed of all transactions with search bar and filter pills (ALL / INCOME / EXPENSE / INVEST). Each row shows merchant, category tag, date chip, and color-coded amount.
- **Add Transaction** — Expense/Income toggle, large amount input with real keyboard, 6-category grid picker, note field, date selector, and prominent amber CTA. Minimal steps to capture spending in-the-moment.
- **Budget Goals** — Net worth hero cell + 4 progress-bar goal cards. Each goal shows current amount, target, percentage complete, and color-coded progress fill. Add New Goal CTA at bottom.

## Design Language
Research conducted on **March 19, 2026** across godly.website and darkmodedesign.com revealed three converging trends:

1. **AuthKit (godly.website #991)** — Bento grid is the dominant layout pattern for modern SaaS. Modular cells with distinct roles replace endless list scrolls. The dark + gradient depth with Aeonik Pro monochromatic palette showed how to make black screens feel textured rather than flat. SABLE's home screen directly implements a 5-zone bento grid.

2. **Silencio (godly.website #964)** — The brutalist agency site showed how ALL CAPS, wide letter-spacing (2.5–3px), and disciplined type weight hierarchy (9px labels vs 44px display numbers) creates maximum information hierarchy without visual decoration. SABLE uses this typographic system throughout: every label is 8–10px all-caps, every metric is large-bold.

3. **Dark Finance Wave (darkmodedesign.com)** — Midday (dark editorial financial), Forge, and Flomodia all confirm dark-mode finance apps are shedding the green/teal of legacy banking apps. The amber-gold palette SABLE uses signals warmth and wealth without the coldness of crypto blue — a key differentiation for a personal (not institutional) finance tool.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. Home Dashboard — Full-width balance hero + 2-col stat row + savings ring + net worth chart + 3 category cells + recent transaction list
2. Spending Breakdown — Donut chart (simulated with concentric arcs) + 5 color-coded category legend rows
3. Transaction History — Search bar + 4 filter pills + 8 transaction rows with date chips, merchants, categories, and amounts
4. Add Transaction — Type toggle + large amount input + 6-cell category grid + note + date + amber CTA + numpad
5. Budget Goals — Net worth hero + 4 goal cards with progress bars + Add Goal CTA`,
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
const post = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'POST', headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const put_ = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'PUT',  headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const get_ = (host, p, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0', ...hdrs } });

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
    const sf = typeof el.fill === 'string' ? el.fill : meta.palette.amber;
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
    .replace(/`([^`]+)`/g, '<code style="background:#161820;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#F59E0B">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = lightenHex(meta.palette.bg, 12);
  const border  = lightenHex(meta.palette.bg, 26);
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
    { hex: meta.palette.bg,      role: 'VOID BG'    },
    { hex: meta.palette.surface, role: 'SURFACE'    },
    { hex: meta.palette.surface2,role: 'SURFACE 2'  },
    { hex: meta.palette.surface3,role: 'SURFACE 3'  },
    { hex: meta.palette.fg,      role: 'WARM WHITE' },
    { hex: meta.palette.amber,   role: 'AMBER'      },
    { hex: meta.palette.green,   role: 'INCOME'     },
    { hex: meta.palette.red,     role: 'EXPENSE'    },
    { hex: meta.palette.violet,  role: 'INVEST'     },
  ];

  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:70px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.amber}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '64px', weight: '900', sample: 'SABLE' },
    { label: 'HERO NUM', size: '44px', weight: '800', sample: '$24,801.50' },
    { label: 'HEADING',  size: '20px', weight: '900', sample: 'SPENDING BREAKDOWN' },
    { label: 'LABEL',    size: '9px',  weight: '700', sample: 'TOTAL BALANCE · MARCH 2026 · SAVINGS RATE' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.amber};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — SABLE Void-Amber palette */
  --color-bg:        #080A0F;   /* void black */
  --color-surface:   #0F1117;   /* elevated surface */
  --color-surface2:  #161820;   /* card surface */
  --color-surface3:  #1D2030;   /* lighter panel */
  --color-border:    #1E2030;   /* subtle border */
  --color-border2:   #2A2D42;   /* visible border */
  --color-fg:        #F0EFEB;   /* warm white */
  --color-fg2:       #9698B2;   /* secondary text */
  --color-muted:     #4A4E6A;   /* muted label */
  --color-amber:     #F59E0B;   /* electric amber (primary) */
  --color-amber-dim: #78350F;   /* deep amber bg */
  --color-green:     #10B981;   /* income green */
  --color-red:       #EF4444;   /* expense red */
  --color-violet:    #8B5CF6;   /* investment violet */

  /* Typography — Silencio-inspired label discipline */
  --font-sans:       'Inter', 'SF Pro Display', system-ui, sans-serif;
  --font-display:    900 clamp(44px, 8vw, 96px) / 1 var(--font-sans);
  --font-heading:    900 20px / 1 var(--font-sans);
  --font-metric:     800 26px / 1 var(--font-sans);
  --font-label:      700 9px / 1 var(--font-sans);
  --letter-label:    3px;   /* all-caps label spacing — Silencio system */

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;  --space-7: 48px;

  /* Bento grid */
  --bento-gap:    16px;
  --bento-radius: 16px;
  --bento-border: 1px solid var(--color-border2);

  /* Glows */
  --glow-amber:   0 0 60px #F59E0B18;
  --glow-green:   0 0 40px #10B98112;
  --shadow-card:  0 4px 24px #080A0F99;
}`;

  const principles = [
    'Bento grid over list — the home screen borrows AuthKit\'s modular panel philosophy. Each financial KPI owns its cell, making scanning faster than endless card lists.',
    'Silencio type discipline — every label is 8–10px all-caps with 2.5–3px letter-spacing. Every metric is large (24–44px), bold (700–900), directly inspired by Silencio\'s brutal hierarchy.',
    'Amber over green for wealth — traditional finance apps default to green. SABLE uses electric amber (#F59E0B) as the primary accent because it reads as warmth and premium rather than "bank app."',
    'Semantic color for transaction types — green for income (#10B981), red for expense (#EF4444), violet for investments (#8B5CF6), amber for dividends. Color does the work so text doesn\'t have to.',
  ];

  const encoded = Buffer.from(JSON.stringify(doc)).toString('base64');
  const shareText = encodeURIComponent(
    `SABLE — Dark-mode personal finance bento dashboard. 5 mobile screens + full brand spec + CSS tokens. Void black + electric amber palette. Inspired by AuthKit bento grid + Silencio brutalist type. Designed by RAM Design AI.`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SABLE — Personal Finance Bento Dashboard · RAM Design Studio</title>
<meta name="description" content="SABLE — dark-mode personal finance app with bento-grid layout. 5 mobile screens, full brand spec, CSS tokens. Designed by RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:'Inter','SF Pro Display',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:900;letter-spacing:5px;color:${meta.palette.amber}}
  .nav-id{font-size:11px;color:${meta.palette.amber};letter-spacing:1px;opacity:.7}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.amber};margin-bottom:20px;opacity:.8}
  h1{font-size:clamp(72px,12vw,120px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:20px;color:${meta.palette.fg}}
  .sub{font-size:16px;opacity:.5;max-width:560px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.amber}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:${meta.palette.amber};color:${meta.palette.bg}}
  .btn-p:hover{opacity:.9}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.amber}66}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.amber};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.amber}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${meta.palette.fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.amber}22;border:1px solid ${meta.palette.amber}44;color:${meta.palette.amber};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.amber}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.amber};margin-bottom:12px}
  .p-text{font-size:17px;opacity:.6;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.amber};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${meta.palette.fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.amber};color:${meta.palette.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.amber};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:720px;font-size:12px;line-height:1.7;opacity:.75}
  .inspiration-bar strong{color:${meta.palette.amber};opacity:1}
  .principle{padding:12px 0;border-bottom:1px solid ${border};font-size:13px;opacity:.65;line-height:1.6}
  .principle:last-child{border-bottom:none}
  .principle::before{content:'→ ';color:${meta.palette.amber};font-weight:700;opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-sable · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · PERSONAL FINANCE · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>SABLE</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>PERSONAL FINANCE TRACKER</strong></div>
    <div class="meta-item"><span>LAYOUT</span><strong>BENTO GRID</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<div class="inspiration-bar">
  <strong>Research sources (March 19, 2026):</strong>
  AuthKit bento grid layout + dark gradient depth (godly.website #991) ·
  Silencio all-caps brutalist typography + Neue Haas Grotesk discipline (godly.website #964) ·
  Dark finance UI wave: Midday · Forge · Flomodia (darkmodedesign.com)
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · 9 TONES</div>
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
      ${principles.map(p => `<div class="principle">${p}</div>`).join('')}
    </div>

  </div>

  <div style="margin-top:60px">
    <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">${sub.prompt}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  <div>${mdToHtml(prd.markdown)}</div>
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT · ${new Date().getFullYear()}</span>
  <span>Built autonomously by RAM Design AI · <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a></span>
</footer>

<script>
const ENCODED = '${encoded}';
const PROMPT  = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg || 'Copied ✓';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function openInViewer() {
  window.open('https://ram.zenbin.org/${VIEWER_SLUG}', '_blank');
}

function downloadPen() {
  try {
    const data = JSON.parse(atob(ENCODED));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sable.pen';
    a.click();
  } catch(e) { alert('Download error: ' + e.message); }
}

function copyPrompt() {
  navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
}

function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS).then(() => showToast('CSS Tokens copied ✓'));
}

function shareOnX() {
  const url = encodeURIComponent(window.location.href);
  const text = ${JSON.stringify(shareText)};
  window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
}
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const viewerPath = path.join(__dirname, 'pen-viewer.html');
  if (!fs.existsSync(viewerPath)) throw new Error('pen-viewer.html not found');
  let rawViewer = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  return rawViewer.replace('<script>', injection + '\n<script>');
}

// ── GitHub queue helper ───────────────────────────────────────────────────────
async function pushToGalleryQueue(heroUrl) {
  const AUTH = { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'design-studio-agent/1.0', 'Accept': 'application/vnd.github.v3+json' };
  const getRes = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, AUTH);
  if (getRes.status !== 200) throw new Error(`Queue GET failed: ${getRes.status}`);
  const { sha, content } = JSON.parse(getRes.body);
  const queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));

  const entry = {
    id:           sub.id,
    prompt:       sub.prompt,
    design_url:   heroUrl,
    submitted_at: sub.submitted_at,
    status:       'done',
    credit:       sub.credit,
    tags:         ['finance', 'personal-finance', 'dark-mode', 'bento-grid', 'amber'],
  };

  if (!queue.submissions) queue.submissions = [];
  const existing = queue.submissions.findIndex(s => s.id === sub.id);
  if (existing >= 0) queue.submissions[existing] = entry;
  else queue.submissions.unshift(entry);

  const updated = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: sable heartbeat design`, content: updated, sha });
  const putRes = await put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, putBody, AUTH);
  if (putRes.status !== 200 && putRes.status !== 201) throw new Error(`Queue PUT failed: ${putRes.status} — ${putRes.body}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('══════════════════════════════════════');
  console.log('  SABLE · Design Discovery Pipeline');
  console.log('══════════════════════════════════════\n');

  const penPath = path.join(__dirname, 'sable.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ sable.pen not found. Run: node sable-app.js first');
    process.exit(1);
  }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded sable.pen (${Math.round(penJson.length / 1024)}KB, ${doc.children.length} screens)`);

  // ── Step A: Build hero HTML ──────────────────────────────────────────────
  console.log('\n[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'sable-hero.html'), heroHtml);
  console.log(`  ✓ sable-hero.html (${Math.round(heroHtml.length / 1024)}KB)`);

  // ── Step B: Publish hero → zenbin ────────────────────────────────────────
  console.log('\n[2/4] Publishing hero → zenbin.org/p/sable…');
  let heroUrl  = `https://ram.zenbin.org/${SLUG}`;
  let heroSlug = SLUG;
  for (const trySlug of [SLUG, SLUG + '-2', SLUG + '-3']) {
    const body = JSON.stringify({ title: `SABLE — Personal Finance Bento Dashboard · RAM Design Studio`, html: heroHtml });
    const res = await post('zenbin.org', `/v1/pages/${trySlug}`, body, { 'X-Subdomain': 'ram' });
    if (res.status === 200 || res.status === 201) {
      heroSlug = trySlug;
      heroUrl  = `https://ram.zenbin.org/${trySlug}`;
      console.log(`  ✓ Hero live → ${heroUrl}`);
      break;
    } else if (res.status === 409) {
      const putRes = await put_('zenbin.org', `/v1/pages/${trySlug}`, body, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (putRes.status === 200 || putRes.status === 201) {
        heroSlug = trySlug;
        heroUrl  = `https://ram.zenbin.org/${trySlug}`;
        console.log(`  ✓ Hero updated → ${heroUrl}`);
        break;
      }
      console.log(`  ⚠ Slug '${trySlug}' taken (${res.status}), trying next…`);
    } else {
      console.log(`  ✗ Publish failed ${res.status}: ${res.body.slice(0,120)}`);
    }
  }

  // ── Step C: Build + publish viewer ───────────────────────────────────────
  console.log(`\n[3/4] Building & publishing viewer → zenbin.org/p/${VIEWER_SLUG}…`);
  let viewerOk = false;
  try {
    const viewerHtml = buildViewerHTML(penJson);
    fs.writeFileSync(path.join(__dirname, 'sable-viewer.html'), viewerHtml);
    const vBody = JSON.stringify({ title: `SABLE Viewer · RAM Design Studio`, html: viewerHtml });
    for (const trySlug of [VIEWER_SLUG, VIEWER_SLUG + '-2']) {
      const vRes = await post('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'X-Subdomain': 'ram' });
      if (vRes.status === 200 || vRes.status === 201) {
        console.log(`  ✓ Viewer live → https://ram.zenbin.org/${trySlug}`);
        viewerOk = true; break;
      }
      const vPut = await put_('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (vPut.status === 200 || vPut.status === 201) {
        console.log(`  ✓ Viewer updated → https://ram.zenbin.org/${trySlug}`);
        viewerOk = true; break;
      }
    }
    if (!viewerOk) console.log('  ⚠ Viewer publish had issues (hero still live)');
  } catch (e) {
    console.log('  ⚠ Viewer skipped:', e.message);
  }

  // ── Step D: Gallery queue ─────────────────────────────────────────────────
  console.log('\n[4/4] Adding to gallery queue…');
  try {
    await pushToGalleryQueue(heroUrl);
    console.log('  ✓ Queue updated');
  } catch (e) {
    console.log('  ⚠ Queue update failed:', e.message);
  }

  console.log('\n══════════════════════════════════════');
  console.log('✓ SABLE published successfully!');
  console.log(`  Hero:   ${heroUrl}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('══════════════════════════════════════\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
