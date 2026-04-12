'use strict';
// publish-grove.js — Full Design Discovery pipeline for GROVE heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'grove';
const VIEWER_SLUG = 'grove-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'GROVE',
  tagline:   'Sustainability intelligence for companies that mean it.',
  archetype: 'B2B Sustainability SaaS',
  palette: {
    bg:      '#faf9f4',
    fg:      '#1a1814',
    accent:  '#1c3a1c',
    accent2: '#d97b2a',
  },
};

const sub = {
  id:           'heartbeat-grove',
  prompt:       'Design GROVE — a light-mode sustainability intelligence platform for mid-market B2B companies. Inspired by "The First The Last" (Awwwards SOTD, thefirstthelast.agency) for bold editorial typography and asymmetric layout, Amie (godly.website #992) for colorful bento-grid dashboards and GSAP data visualization, and Midday.ai (darkmodedesign.com) for solopreneur-focused financial data UX. Palette: warm cream #faf9f4, forest green #1c3a1c, amber #d97b2a, sage #6a9e6a, terracotta #c45a3a. 6 screens: Landing Page (desktop editorial hero), Dashboard Bento Grid (desktop), Supplier Detail (desktop), Mobile Home, Mobile Report, Mobile Onboarding.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Landing', 'Dashboard', 'Supplier', 'Home', 'Report', 'Onboarding'],
  markdown: `## Overview
GROVE is a light-mode sustainability intelligence platform purpose-built for mid-market B2B companies navigating CSRD, GHG Protocol, and supply chain ESG requirements. It transforms complex emissions data and supplier audits into a living, AI-assisted dashboard that makes sustainability reporting feel less like compliance and more like strategy.

## Target Users
- **Head of Sustainability / CSO** who needs a real-time command center for emissions, supplier scores, and regulatory filings
- **Procurement teams** who manage hundreds of supplier relationships and need ESG scoring baked into vendor workflows
- **Finance Directors** who tie carbon credits and green premiums to P&L and need clean, exportable reports
- **Operations teams** at growth-stage companies (€50M–€500M revenue) who are CSRD-bound for the first time

## Core Features
- **Emissions Dashboard** — Scope 1, 2, and 3 tracked by month with stacked bar visualization. Benchmarked against industry peers and previous periods.
- **Supplier Intelligence** — 247 suppliers scored across Environmental, Social, Governance, and Carbon Intensity dimensions. Risk-tiered (LOW / MED / HIGH / CRITICAL). Deep-dive profile per supplier with document vault and AI summary.
- **Regulatory Tracker** — CSRD, GHG Protocol, CDP, and SEC disclosure readiness tracked with a live compliance checklist. One-click gap report export.
- **AI Insight Feed** — Proactive, plain-language recommendations: "Switching FastShip Asia to certified rail saves 14% Scope 3 + €32k in carbon credits." One-click apply.
- **Report Builder** — Generate audit-ready CSRD annexes and GHG inventory reports in PDF and XLSX. Pre-populated with live data.

## Design Language
Inspired by three sources discovered on **March 19, 2026**:

1. **"The First The Last"** (Awwwards SOTD · thefirstthelast.agency) — Bold editorial typography, strong asymmetric column layouts with a vertical rule, oversized stacked type. Directly inspired the Landing Page hero section: 80px stacked type, thick left rule, editorial "Measure / what / matters." headline.
2. **Amie** (godly.website #992) — Colorful productivity SaaS with bento-grid feature layout, Inter/Poppins fonts, GSAP scrolling animation, and lively data visualization. Inspired the Dashboard bento grid, stacked bar charts, and the colorful supplier-risk donut.
3. **Midday.ai** (darkmodedesign.com) — "For the new wave of one-person companies." Clean financial data UX, table-first UI, a dashboard that feels like a living document rather than a feature dump. Inspired the Supplier Detail clean data tables and the metric card components.

The palette — **warm cream #faf9f4 with forest green #1c3a1c** — deliberately subverts the dark/cold aesthetic of most sustainability tools (which ironically feel extractive and corporate). The warm organic tones signal authenticity and long-term thinking. Amber (#d97b2a) for AI and call-to-action keeps energy without aggression. Terracotta for risk flags feels human rather than alarming.

## Screen Architecture
**Desktop (1440×900):**
1. Landing Page — Editorial hero (80px stacked type, asymmetric 2-col), dashboard preview card with live data, stats trio, social proof
2. Dashboard Overview — Sidebar nav, KPI row, bento grid (emissions chart + supplier donut + regulatory tracker), AI insights feed, supplier table
3. Supplier Detail — Breadcrumb, supplier hero card, 3-col layout (ESG breakdown | Emissions history | AI summary + documents)

**Mobile (390×844):**
4. Home Dashboard — GROVE score hero card, 2×2 metric grid, AI insight, top suppliers list, bottom nav
5. Supplier Report — Supplier card, ESG score bars, emissions bar chart, AI insight, action buttons
6. Onboarding — Step 1/3 form, company name/industry/revenue fields, trust signal, unlock preview`,
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
    const sf = typeof el.fill === 'string' ? el.fill : '#1c3a1c';
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : '#1a1814';
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}

const screenThumbSVG = (s, tw, th) => {
  const kids = (s.children || []).map(c => renderEl(c, 0)).join('');
  const bg = typeof s.fill === 'string' ? s.fill : '#faf9f4';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0;border:1px solid #e2dfd3"><rect width="${s.width}" height="${s.height}" fill="${bg}"/>${kids}</svg>`;
};

// ── Color helpers ─────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#faf9f4').replace('#', ''), 16);
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
    .replace(/`([^`]+)`/g, '<code style="background:#e8f0e8;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#1c3a1c">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const surface = '#f3f1e8';
  const border  = '#e2dfd3';
  const THUMB_H = 180;
  const screenLabels = prd.screenNames;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = screenLabels[i] || (isMobile ? `M${i + 1}` : `D${i + 1}`);
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.5;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#1a1814">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#faf9f4', role: 'CREAM BG'  },
    { hex: '#f3f1e8', role: 'PAPER'     },
    { hex: '#1a1814', role: 'INK'       },
    { hex: '#1c3a1c', role: 'FOREST'    },
    { hex: '#6a9e6a', role: 'SAGE'      },
    { hex: '#d97b2a', role: 'AMBER'     },
    { hex: '#c45a3a', role: 'TERRA'     },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:#1c3a1c">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '48px', weight: '900', sample: 'GROVE', color: '#1c3a1c' },
    { label: 'HEADING',  size: '22px', weight: '700', sample: 'Sustainability intelligence for companies that mean it.' },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'Scope 1, 2, and 3 tracked by month with stacked bar visualization. Benchmarked against industry peers.' },
    { label: 'CAPTION',  size: '10px', weight: '600', sample: 'EMISSIONS · SUPPLIERS · CSRD · AI INSIGHTS' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px;color:#1a1814">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${t.color || '#1a1814'};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;color:#1a1814">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:#1c3a1c;width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — GROVE warm editorial palette */
  --color-cream:     #faf9f4;
  --color-paper:     #f3f1e8;
  --color-card:      #ffffff;
  --color-border:    #e2dfd3;
  --color-border-2:  #cdc9ba;
  --color-ink:       #1a1814;
  --color-ink-2:     #2e2b25;
  --color-muted:     #a39f90;
  --color-muted-2:   #7a7669;

  /* Brand */
  --color-forest:    #1c3a1c;
  --color-forest-lt: #2d5c2d;
  --color-forest-dim:#e8f0e8;
  --color-amber:     #d97b2a;
  --color-amber-lt:  #f2a04a;
  --color-amber-dim: #fdf0e0;
  --color-sage:      #6a9e6a;
  --color-sage-dim:  #eaf3ea;
  --color-terra:     #c45a3a;
  --color-terra-dim: #fceee9;
  --color-gold:      #d4a821;

  /* Score grades */
  --score-a: #2d8b4e;
  --score-b: #6a9e6a;
  --score-c: #d97b2a;
  --score-d: #c45a3a;

  /* Typography */
  --font-family: 'Inter', 'Poppins', system-ui, sans-serif;
  --font-display: 900 clamp(48px, 8vw, 80px) / 1 var(--font-family);
  --font-heading: 700 22px / 1.3 var(--font-family);
  --font-body:    400 14px / 1.6 var(--font-family);
  --font-caption: 600 10px / 1.2 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 14px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-card:  0 2px 12px rgba(26,24,20,0.08);
  --shadow-panel: 0 4px 32px rgba(26,24,20,0.06);
}`;

  const encoded = Buffer.from(JSON.stringify(doc)).toString('base64');
  const shareText = encodeURIComponent(
    `GROVE — sustainability intelligence for mid-market B2B. Light-mode editorial design with warm palette, bento dashboard, supplier ESG scoring. By RAM Design AI:`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GROVE — Sustainability Intelligence · RAM Design Studio</title>
<meta name="description" content="GROVE — light-mode sustainability intelligence platform for mid-market B2B. Complete design system with 6 screens, brand spec & CSS tokens. By RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#faf9f4;color:#1a1814;font-family:'Inter','Poppins',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;background:#faf9f4}
  .logo{font-size:14px;font-weight:900;letter-spacing:5px;color:#1c3a1c}
  .nav-id{font-size:11px;color:#a39f90;letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:#1c3a1c;margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(52px,8vw,96px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px;color:#1c3a1c;font-family:'Inter',system-ui,sans-serif}
  .sub{font-size:17px;color:#7a7669;max-width:540px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;color:#a39f90;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:#1c3a1c}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:#1c3a1c;color:#faf9f4}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:#1a1814;border:1px solid ${border}}
  .btn-s:hover{border-color:#1c3a1c55}
  .btn-a{background:#d97b2a;color:#fff}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:#1c3a1c;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:#1c3a1c44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#1a1814;opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:#1c3a1c22;border:1px solid #1c3a1c44;color:#1c3a1c;font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:#1c3a1c33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:#1c3a1c;margin-bottom:12px;font-weight:700}
  .p-text{font-size:17px;color:#7a7669;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:#1c3a1c;margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;color:#7a7669;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:#1a1814}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;color:#a39f90;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:#1c3a1c;color:#faf9f4;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:4px solid #1c3a1c;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:680px;font-size:12px;line-height:1.7;color:#7a7669}
  .inspiration-bar strong{color:#1c3a1c}
  .hero-rule{width:6px;height:200px;background:#1c3a1c;border-radius:3px;display:inline-block;vertical-align:middle;margin-right:24px}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-grove · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">▸  DESIGN HEARTBEAT · B2B SUSTAINABILITY SAAS · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>GROVE</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>6 (3 DESKTOP + 3 MOBILE)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>B2B SUSTAINABILITY SAAS</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>WARM EDITORIAL · LIGHT MODE</strong></div>
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
  <strong>Research sources (March 19, 2026):</strong> "The First The Last" (Awwwards SOTD · thefirstthelast.agency) — bold editorial asymmetric type · Amie (godly.website #992) — colorful bento-grid SaaS with GSAP data viz · Midday.ai (darkmodedesign.com) — solopreneur financial UX, clean data tables · Linear.app (darkmodedesign.com) — precision dense dark UI
</div>

<section class="preview">
  <div class="section-label">SCREENS · 3 DESKTOP (1440×900) + 3 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;color:#a39f90;margin-bottom:16px">COLOR PALETTE · 7 CORE TONES</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;color:#a39f90;margin-bottom:0">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;color:#a39f90;margin-bottom:16px">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;color:#a39f90;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${[
        'Warmth signals authenticity — cream and forest green subvert the cold/corporate aesthetic of most ESG tools. Organic warmth builds trust for long-term relationships.',
        'Data deserves beauty — emissions charts, supplier score bars, and risk donuts are the primary UI components. Every visualization earns its place by driving a decision.',
        'Amber for AI, green for compliance — amber (#d97b2a) is reserved for AI insights and calls-to-action. Forest green for confirmed compliance. Terracotta for risk. Never decorative.',
      ].map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
        <div style="color:#1c3a1c;font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i + 1).padStart(2, '0')}</div>
        <div style="font-size:13px;color:#7a7669;line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>

  </div>

  <div class="tokens-block" id="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${mdToHtml(prd.markdown)}
</section>

<footer>
  <span>RAM Design Studio · AI-native design heartbeat</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = '${encoded}';
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
    a.download = 'grove.pen';
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
  window.open('https://twitter.com/intent/tweet?text=${shareText}%20https://ram.zenbin.org/${SLUG}', '_blank');
}
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
function buildViewerHTML(viewerTemplate, penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  return viewerTemplate.replace('<script>', injection + '\n<script>');
}

// ── GitHub queue helper ───────────────────────────────────────────────────────
async function getQueueSha() {
  const r = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  });
  if (r.status !== 200) throw new Error(`Queue SHA fetch failed: ${r.status} ${r.body}`);
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
    message: `heartbeat: add grove to gallery`,
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

// ── Viewer template fetch ─────────────────────────────────────────────────────
async function fetchViewerTemplate() {
  const r = await get_('zenbin.org', '/p/pen-viewer-3');
  if (r.status !== 200) throw new Error(`Viewer template fetch failed: ${r.status}`);
  return r.body;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  GROVE — Design Discovery Pipeline');
  console.log('  RAM Design Heartbeat · March 19, 2026');
  console.log('═══════════════════════════════════════════════\n');

  // Load .pen file
  const penPath = path.join(__dirname, 'grove.pen');
  if (!fs.existsSync(penPath)) throw new Error('grove.pen not found. Run grove-app.js first.');
  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc = JSON.parse(penJson);
  console.log(`✓ Loaded grove.pen (${screens_count(doc)} screens)`);

  // Build hero HTML
  const heroHTML = buildHeroHTML(doc, penJson);
  console.log(`✓ Hero HTML built (${(heroHTML.length / 1024).toFixed(1)} KB)`);

  // Fetch viewer template
  console.log('  Fetching viewer template…');
  const viewerTemplate = await fetchViewerTemplate();
  const viewerHTML = buildViewerHTML(viewerTemplate, penJson);
  console.log(`✓ Viewer HTML built (${(viewerHTML.length / 1024).toFixed(1)} KB)`);

  // Publish hero page
  console.log(`\n  Publishing hero → ram.zenbin.org/${SLUG} …`);
  const heroRes = await publishToZenBin(SLUG, `GROVE — Sustainability Intelligence · RAM`, heroHTML);
  console.log(`  Status: ${heroRes.status}`);
  if (heroRes.status !== 200 && heroRes.status !== 201) {
    console.error('  Hero publish error:', heroRes.body.slice(0, 300));
  } else {
    console.log(`✓ Hero live → https://ram.zenbin.org/${SLUG}`);
  }

  // Publish viewer
  console.log(`\n  Publishing viewer → ram.zenbin.org/${VIEWER_SLUG} …`);
  const viewerRes = await publishToZenBin(VIEWER_SLUG, `GROVE Viewer · RAM`, viewerHTML);
  console.log(`  Status: ${viewerRes.status}`);
  if (viewerRes.status !== 200 && viewerRes.status !== 201) {
    console.error('  Viewer publish error:', viewerRes.body.slice(0, 300));
  } else {
    console.log(`✓ Viewer live → https://ram.zenbin.org/${VIEWER_SLUG}`);
  }

  // Add to gallery queue
  const heroUrl = `https://ram.zenbin.org/${SLUG}`;
  console.log(`\n  Adding to gallery queue…`);
  try {
    const qRes = await addToGalleryQueue(heroUrl);
    if (qRes.status === 200 || qRes.status === 201) {
      console.log(`✓ Gallery queue updated`);
    } else {
      console.warn('  Queue update warning:', qRes.status, qRes.body.slice(0, 200));
    }
  } catch (e) {
    console.warn('  Queue update failed (non-fatal):', e.message);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  DONE');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log('═══════════════════════════════════════════════');
}

function screens_count(doc) {
  return (doc.children || []).length;
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
