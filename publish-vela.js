'use strict';
// publish-vela.js — Full Design Discovery pipeline for VELA heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'vela';
const VIEWER_SLUG = 'vela-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'VELA',
  tagline:   'AI-powered creative intelligence. Brief smarter, score faster, ship campaigns that win.',
  archetype: 'Marketing AI Platform',
  palette: {
    bg:      '#07070f',
    fg:      '#e8e8ff',
    accent:  '#7c5af5',
    accent2: '#38eac7',
  },
};

const sub = {
  id:           'heartbeat-vela',
  prompt:       'Design VELA — a dark-mode AI creative intelligence platform for marketing teams. Inspired by Midday.ai\'s dark finance dashboard (darkmodedesign.com), Linear\'s ultra-refined dark UI, Haptic app\'s large editorial type (godly.website #965), and Flim.ai\'s AI-first product page (lapa.ninja). Palette: near-black #07070f with electric violet #7c5af5, coral #f25f7e, teal #38eac7, gold #f5c842. 10 screens: Campaign Dashboard, AI Brief Generator, Creative Analytics, Campaign Detail, Landing/Onboarding (x5 mobile + x5 desktop).',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Home', 'Brief Gen', 'Analytics', 'Campaign', 'Onboarding'],
  markdown: `## Overview
VELA is an AI-native creative intelligence platform built for modern marketing teams. It transforms the entire campaign lifecycle — from brief generation to creative scoring to predictive analytics — into a unified, AI-assisted workflow.

## Target Users
- **Head of Creative / CMO** who needs real-time campaign performance at a glance
- **Brand Strategists** who spend hours crafting briefs manually — VELA writes them in 15 seconds
- **Performance Marketers** who want AI-powered rebalancing recommendations across channels
- **Creative Directors** who want to score assets before launch, not after

## Core Features
- **AI Brief Generator** — Input campaign name, objective, audience, channels, and budget. VELA streams a complete creative brief with key messages, tone guide, channel strategy, and predicted score in ~15 seconds.
- **Campaign Intelligence Dashboard** — Real-time metrics across all active campaigns: reach, CTR, video completion, CPA, and an overall "campaign score" that synthesizes performance into one number.
- **Creative Score Engine** — Four-dimensional scoring of every creative asset: Brand Fit, Emotional Resonance, Clarity, and Recall Potential — inspired by attention research and cognitive load theory.
- **Channel Analytics** — Spend efficiency by channel with AI recommendations to rebalance budget toward highest-performing placements.
- **AI Insights Feed** — Proactive, plain-language recommendations ("Shift 15% of budget from Display to TikTok — 2.8× engagement per dollar") with one-click apply.

## Design Language
Inspired by three key references discovered on **March 18, 2026**:

1. **Midday.ai** (darkmodedesign.com) — Dark finance SaaS with clean metric dashboard, ultra-minimal navigation, and "data as beauty" aesthetic. Informed the dashboard layout and stat card patterns.
2. **Linear.app** (darkmodedesign.com) — Pure-black precision UI with electric accent color, tight grid system, no decorative elements. Informed the typography hierarchy and spacing discipline.
3. **Haptic app** (godly.website #965) — Mobile-first dark app with large editorial type (SF Pro Display), scrolling animation, single-page clean layout. Informed the mobile screen architecture and hero type treatment.
4. **Flim.ai / Relace** (lapa.ninja) — AI-first product dark interfaces with bold hero numbers and strong type hierarchy. Informed the landing page layout and glowing metric tiles.

The palette — **near-black #07070f with electric violet #7c5af5** — conveys creative precision and AI authority. Violet reads as "creative intelligence" rather than raw utility. Coral, teal, and gold provide semantic color coding: teal = positive/growing, coral = alert/attention, gold = spend/value.

## Screen Architecture
**Mobile (390×844):**
1. Home Dashboard — campaign overview, quick KPIs, AI nudge card
2. Brief Generator — Step 2/4 of brief creation flow with AI suggestions panel
3. Analytics — Creative score radials, channel breakdown, trend bars
4. Campaign Detail — Deep dive on "Spring Launch 2026" with brief preview
5. Onboarding/Landing — Conversion page with feature pills and social proof

**Desktop (1440×900):**
6. Dashboard Overview — Full sidebar + bento layout with campaign table, AI insights, score grid
7. Brief Generator — Split-panel with form (left) and live AI preview (right)
8. Analytics Deep Dive — Glowing KPI row + creative scores + channel efficiency + AI recommendations
9. Campaign Detail — Full campaign view with brief, AI insights, and timeline
10. Landing Page — Editorial hero (96px type, accent left-rule) + dashboard preview mockup`,
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
    const sf = typeof el.fill === 'string' ? el.fill : '#7c5af5';
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = typeof fill === 'string' && fill !== 'none' && fill !== 'transparent' ? fill : '#e8e8ff';
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}
const screenThumbSVG = (s, tw, th) => {
  const kids = (s.children || []).map(c => renderEl(c, 0)).join('');
  const bg = typeof s.fill === 'string' ? s.fill : '#07070f';
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
    .replace(/`([^`]+)`/g, '<code style="background:#1a1a2e;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
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
  const THUMB_H = 180;
  const screenLabels = prd.screenNames;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = screenLabels ? `${isMobile ? 'M' : 'D'} · ${screenLabels[i % 5]}` : `${isMobile ? 'MOBILE' : 'DESKTOP'} ${(i % 5) + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#07070f', role: 'BACKGROUND' },
    { hex: '#0f0f1e', role: 'SURFACE'    },
    { hex: '#e8e8ff', role: 'FOREGROUND' },
    { hex: '#7c5af5', role: 'PRIMARY'    },
    { hex: '#38eac7', role: 'SECONDARY'  },
    { hex: '#f25f7e', role: 'CORAL'      },
    { hex: '#f5c842', role: 'GOLD'       },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '48px', weight: '900', sample: 'VELA' },
    { label: 'HEADING',  size: '22px', weight: '700', sample: meta.tagline.split('.')[0] },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'Campaign intelligence, creative scoring, AI briefs — in one place.' },
    { label: 'CAPTION',  size: '10px', weight: '400', sample: 'CAMPAIGN · ANALYTICS · AI INSIGHT · SCORE' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:#e8e8ff;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color */
  --color-bg:        #07070f;
  --color-surface:   #0f0f1e;
  --color-surface2:  #161628;
  --color-border:    #222240;
  --color-fg:        #e8e8ff;
  --color-fg2:       #9898c8;
  --color-primary:   #7c5af5;
  --color-primary-lt:#a585ff;
  --color-primary-dm:#1e1550;
  --color-secondary: #38eac7;
  --color-coral:     #f25f7e;
  --color-gold:      #f5c842;
  --color-muted:     #484870;

  /* Typography */
  --font-family: 'SF Pro Display', 'Inter', system-ui, sans-serif;
  --font-display:  900 clamp(48px, 8vw, 96px) / 1 var(--font-family);
  --font-heading:  700 22px / 1.3 var(--font-family);
  --font-body:     400 14px / 1.6 var(--font-family);
  --font-caption:  600 10px / 1 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 14px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-glow: 0 0 40px #7c5af533;
  --shadow-card: 0 4px 24px #07070f88;
}`;

  const encoded = Buffer.from(JSON.stringify(doc)).toString('base64');
  const shareText = encodeURIComponent(
    `VELA — AI Creative Intelligence Platform. 10 screens + brand spec + CSS tokens. Dark-mode marketing SaaS designed by RAM Design AI. Check it out:`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VELA — AI Creative Intelligence · RAM Design Studio</title>
<meta name="description" content="VELA — AI-powered creative intelligence for marketing teams. Complete design system with 10 screens, brand spec & CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#07070f;color:#e8e8ff;font-family:'SF Pro Display','Inter',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:900;letter-spacing:5px;color:#7c5af5}
  .nav-id{font-size:11px;color:#7c5af5;letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:920px}
  .tag{font-size:10px;letter-spacing:3px;color:#7c5af5;margin-bottom:20px}
  h1{font-size:clamp(52px,8vw,96px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px;color:#e8e8ff}
  .sub{font-size:16px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:#7c5af5}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:#7c5af5;color:#07070f}
  .btn-p:hover{opacity:.9}
  .btn-s{background:transparent;color:#e8e8ff;border:1px solid ${border}}
  .btn-s:hover{border-color:#7c5af566}
  .btn-t{background:#38eac7;color:#07070f}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:#7c5af5;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:#7c5af544;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:920px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#e8e8ff;opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:#7c5af522;border:1px solid #7c5af544;color:#7c5af5;font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:#7c5af533}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:#7c5af5;margin-bottom:12px}
  .p-text{font-size:17px;opacity:.6;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:#7c5af5;margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#e8e8ff}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:#7c5af5;color:#07070f;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid #7c5af5;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:640px;font-size:12px;line-height:1.7;opacity:.7}
  .inspiration-bar strong{color:#7c5af5;opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-vela · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · AI MARKETING PLATFORM · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>VELA</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>MARKETING AI SAAS</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>DESIGNED BY</span><strong>RAM · HEARTBEAT RUN</strong></div>
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
  <strong>Research sources (March 18, 2026):</strong> Midday.ai dark finance dashboard (darkmodedesign.com) · Linear.app pure-black UI (darkmodedesign.com) · Haptic app editorial type (godly.website #965) · Flim.ai + Relace AI interfaces (lapa.ninja)
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844) + 5 DESKTOP (1440×900)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE · 7 TONES</div>
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
        'Data is beauty — metric tiles are the primary UI component, not decoration.',
        'Electric violet commands trust — AI actions are always violet, human edits are white.',
        'Semantic color — teal = growing, coral = alert, gold = value. Never decorative.',
      ].map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
        <div style="color:#7c5af5;font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i + 1).padStart(2, '0')}</div>
        <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
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
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
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
  try {
    const jsonStr = atob(D);
    JSON.parse(jsonStr);
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'vela.pen' }));
    window.open('https://zenbin.org/p/pen-viewer-3', '_blank');
  } catch(e) { alert('Could not load pen: ' + e.message); }
}
function downloadPen() {
  try {
    const jsonStr = atob(D);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vela.pen';
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
  window.open('https://twitter.com/intent/tweet?text=${shareText}%20https://ram.zenbin.org/vela', '_blank');
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
    message: `heartbeat: add vela to gallery`,
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
  console.log('🚀 Publishing VELA through Design Discovery pipeline...\n');

  // Load pen
  const penJson = fs.readFileSync(path.join(__dirname, 'vela.pen'), 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded vela.pen — ${doc.children.length} screens`);

  // Build hero HTML
  const heroHTML = buildHeroHTML(doc, penJson);
  console.log(`✓ Built hero HTML — ${(heroHTML.length / 1024).toFixed(0)}KB`);

  // Save hero locally
  fs.writeFileSync(path.join(__dirname, 'vela-hero.html'), heroHTML);
  console.log('✓ Saved vela-hero.html locally');

  // Publish hero → ram.zenbin.org/vela
  console.log(`\n📤 Publishing hero → ram.zenbin.org/${SLUG}...`);
  const heroResult = await publishToZenBin(SLUG, 'VELA — AI Creative Intelligence · RAM Design Studio', heroHTML, 'ram');
  if (heroResult.status === 200 || heroResult.status === 201) {
    console.log(`✓ Hero published → https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`⚠ Hero publish: ${heroResult.status} ${heroResult.body.slice(0, 200)}`);
  }

  // Build viewer HTML — fetch base viewer template
  let viewerResult = { status: 0 };
  try {
    console.log(`\n📤 Fetching pen-viewer template...`);
    const viewerBase = await httpsReq({ hostname: 'zenbin.org', path: '/p/pen-viewer-3', method: 'GET', headers: { Accept: 'text/html' } });
    if (viewerBase.status === 200) {
      let viewerHtml = viewerBase.body;
      const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
      if (viewerHtml.includes('<script>')) {
        viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
      } else {
        viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
      }
      console.log(`📤 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
      viewerResult = await publishToZenBin(VIEWER_SLUG, 'VELA Viewer · RAM Design Studio', viewerHtml, 'ram');
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

  // Add to gallery queue
  console.log(`\n📋 Adding to gallery queue...`);
  try {
    const heroUrl = `https://ram.zenbin.org/${SLUG}`;
    const qResult = await addToGalleryQueue(heroUrl);
    if (qResult.status === 200 || qResult.status === 201) {
      console.log(`✓ Added to gallery queue → hyperio-mc/design-studio-queue`);
    } else {
      console.log(`⚠ Gallery queue: ${qResult.status} ${qResult.body.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`⚠ Gallery queue error: ${e.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ VELA Design Discovery Pipeline Complete');
  console.log(`   Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
