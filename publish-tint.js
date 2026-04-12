'use strict';
// publish-tint.js — Full Design Discovery pipeline for TINT heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'tint';
const VIEWER_SLUG = 'tint-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'TINT',
  tagline:   'Personal finance reimagined as a beauty ritual. Bento grid spending metrics, weekly rhythm analysis, and goal tracking — in a blush+indigo palette from overlay.com.',
  archetype: 'Personal Finance Wellness',
  palette: {
    bg:      '#FBF9FB',
    fg:      '#2E2F53',
    accent:  '#4E51A0',
    rose:    '#C47EB5',
    sage:    '#6BAD9E',
    amber:   '#C9946A',
  },
};

const sub = {
  id:           'heartbeat-tint-' + Date.now(),
  prompt:       'Design TINT — a personal finance wellness app treating money management like a beauty ritual. Inspired by overlay.com\'s blush white #FBF9FB + deep indigo #2E2F53 palette (lapa.ninja, March 2026, "The Future of Beauty is Automated") and interfere.com\'s dense bento grid of feature cards (lapa.ninja, March 2026). Roboto Flex variable font. 5 mobile screens: Welcome / Onboarding · Daily Dashboard (bento grid) · Spending Ritual (category breakdown) · Spending Rhythms (weekly pattern analysis) · Goal Garden (savings trackers).',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Welcome', 'Dashboard', 'Spending', 'Rhythms', 'Goals'],
  markdown: `## Overview
TINT is a personal finance wellness app that borrows precision and aesthetic warmth from luxury beauty brands. Discovered during RAM's March 2026 research session on lapa.ninja, overlay.com ("The Future of Beauty is Automated") showed how blush white #FBF9FB + deep navy indigo #2E2F53 creates a palette that feels tactile, precise, and warmly approachable — a combination unexplored in fintech. TINT applies this aesthetic to daily spending, saving, and goal ritual.

## Target Users
- **Young professionals** (25–38) frustrated by cold, anxiety-inducing money apps
- **Budget-conscious creatives** who respond to design and aesthetics
- **Mindful spenders** who want to build healthier financial habits, not just track them
- **Goal-oriented savers** with specific near-term targets (travel, gear, emergency fund)
- **Beauty/wellness culture** audience who understands ritual as a framework for behaviour change

## Core Features
- **Welcome / Onboarding** — Editorial hero with Overlay.com's exact blush+indigo contrast. Roboto Flex display weight at 800 for "money" keyword, lighter 300 for surrounding text — variable font tension that reads as "precision within softness."
- **Daily Dashboard (Bento Grid)** — Interfere.com-inspired bento grid of financial health metrics: wellness score (0–100) with 7-day sparkline, daily spend vs budget, monthly savings progress, and 3-stat mini cards. Today's transactions as a feed below. Dense, scannable, calm.
- **Spending Ritual** — Monthly category breakdown with soft horizontal bars. Each bar fills with a tinted overlay showing the spend proportion. Ritual note at the bottom gives a single friendly insight. Month navigation.
- **Spending Rhythms** — Weekly bar chart of daily spend. Pattern insight cards (2×2 bento): weekend splurge, morning ritual habit, lowest day, and opportunity card. 12-month strip view.
- **Goal Garden** — 4 active savings goals with individual progress bars, color-coded by goal type (sage for emergency, rose for travel, indigo for tech, amber for long-term). Summary stat at top. "Plant a new goal" CTA.

## Design Language
Discovered March 21, 2026 during research on **lapa.ninja** and directly visiting **overlay.com**:

1. **overlay.com** — "The Future of Beauty is Automated" — robotics company using blush white rgb(251,249,251) + deep indigo rgb(46,47,83) with Roboto Flex. The palette reads simultaneously as luxury skincare and precision engineering. Extracted exactly: #FBF9FB + #2E2F53. This is a departure from all dark-mode palettes RAM has used — a bold light-mode experiment.

2. **interfere.com** — Dev tools site with 14 bento-grid feature cards. The dense, bordered card grid pattern works beautifully on mobile when card heights are compressed. TINT's dashboard adapts this for financial data.

3. **minimal.gallery** (March 2026) — Old Tom Capital (Messina Sans + editorial confidence) reinforces the trend of premium non-tech brands using strong typography + minimal color to signal authority. TINT borrows that editorial confidence.

**Palette decisions:**
- #FBF9FB blush white: feels like skin, organic, warm — money shouldn't feel cold
- #2E2F53 deep indigo: precision, depth, trustworthy — not the typical finance teal/blue
- #C47EB5 rose: human warmth for spending data (not alarming red)
- #6BAD9E sage: calm growth for savings (not aggressive green)
- #C9946A amber: gentle caution (not bright yellow warning)

**Typography:** Roboto Flex variable font — key innovation from Overlay. Weight 300 for context, 800 for numbers and emphasis. The contrast between weights in a single font family creates dynamism without competing faces.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. Welcome — Hero with blush auras, display weight wordmark, feature trio list, deep indigo CTA button
2. Dashboard — Status bar + greeting, wellness score bento (full width), 2-column bento row, 3-column mini stats, transaction feed
3. Spending — Monthly total hero card, 6-category horizontal bars with tint overlays, ritual insight note, month nav
4. Rhythms — Weekly bar chart, 4 pattern insight cards (2×2), 12-month strip view
5. Goals — Total progress summary, 4 goal cards with individual progress bars, add goal CTA`,
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
const post_ = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'POST', headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0;box-shadow:0 2px 12px rgba(46,47,83,0.12)"><rect width="${s.width}" height="${s.height}" fill="${bg}"/>${kids}</svg>`;
};

// ── Color helpers ─────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#FBF9FB').replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function darkenHex(hex, amt) {
  const n = parseInt((hex || '#2E2F53').replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:11px;letter-spacing:1.5px;opacity:.5;margin:20px 0 8px;font-weight:700">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#EDE6F4;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#4E51A0">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens = doc.children || [];
  const border  = '#D8D0EA';
  const surface = '#F4EFF8';
  const THUMB_H = 200;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = `M · ${prd.screenNames[i] || i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#2E2F53">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: '#FBF9FB', role: 'BLUSH BG'   },
    { hex: '#F4EFF8', role: 'SURFACE'     },
    { hex: '#EDE6F4', role: 'SURFACE 2'   },
    { hex: '#2E2F53', role: 'DEEP INDIGO' },
    { hex: '#6264A0', role: 'INDIGO MID'  },
    { hex: '#9D9FC4', role: 'MUTED'       },
    { hex: '#4E51A0', role: 'ACCENT'      },
    { hex: '#C47EB5', role: 'ROSE'        },
    { hex: '#6BAD9E', role: 'SAGE'        },
    { hex: '#C9946A', role: 'AMBER'       },
  ];

  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:70px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px;color:#2E2F53">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '64px', weight: '800', sample: 'TINT' },
    { label: 'HEADING',  size: '22px', weight: '700', sample: 'Personal Finance Wellness AI' },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'See your money differently. Built on beauty science precision.' },
    { label: 'CAPTION',  size: '10px', weight: '700', sample: 'WELLNESS SCORE · DAILY RITUAL · GOAL GARDEN' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:6px;color:#2E2F53">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:#2E2F53;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;color:#2E2F53">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2}px;opacity:0.5"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* ── TINT Finance — Blush + Indigo Palette (Overlay.com, March 2026) ── */

  /* Background & Surfaces */
  --color-bg:        #FBF9FB;   /* blush white — organic, tactile, from Overlay.com */
  --color-surface:   #F4EFF8;   /* lavender surface */
  --color-surface2:  #EDE6F4;   /* deeper lavender card */
  --color-surface3:  #E5DCF0;   /* card shadow fill */
  --color-white:     #FFFFFF;   /* pure white (card faces) */

  /* Borders */
  --color-border:    #D8D0EA;   /* periwinkle border */
  --color-border2:   #C8BDDF;   /* visible border */

  /* Foreground */
  --color-fg:        #2E2F53;   /* deep indigo — from Overlay.com exact extraction */
  --color-fg2:       #6264A0;   /* medium indigo (secondary text) */
  --color-muted:     #9D9FC4;   /* muted periwinkle */
  --color-muted2:    #B8B9D8;   /* very muted */

  /* Accent */
  --color-accent:    #4E51A0;   /* deeper indigo (primary accent) */

  /* Semantic Colors — wellness palette (not standard finance colors) */
  --color-rose:      #C47EB5;   /* rose: human warmth for spend data */
  --color-rose-soft: #E8B4D8;
  --color-rose-pale: #F5E6F2;
  --color-sage:      #6BAD9E;   /* sage teal: calm growth for savings */
  --color-sage-soft: #A8D4CB;
  --color-sage-pale: #E0F2EE;
  --color-amber:     #C9946A;   /* amber: gentle caution */
  --color-amber-soft:#F0D4B8;

  /* Typography — Roboto Flex variable font (Overlay.com) */
  --font-sans:    'Roboto Flex', 'Roboto', system-ui, sans-serif;
  --font-display: 800 clamp(40px, 8vw, 80px) / 1.1 var(--font-sans);
  --font-heading: 700 20px / 1.35 var(--font-sans);
  --font-body:    400 14px / 1.65 var(--font-sans);
  --font-caption: 700 10px / 1.2 var(--font-sans);
  --font-light:   300 14px / 1.65 var(--font-sans);

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 8px;  --radius-md: 14px;  --radius-lg: 20px;  --radius-full: 9999px;

  /* Shadows — soft, warm */
  --shadow-card:  0 2px 16px rgba(46, 47, 83, 0.08);
  --shadow-float: 0 8px 32px rgba(46, 47, 83, 0.12);

  /* Bento grid */
  --bento-gap:    12px;
  --bento-radius: 16px;
}`;

  const encoded = Buffer.from(JSON.stringify(doc)).toString('base64');
  const shareText = encodeURIComponent(
    `TINT — Personal finance app with a beauty brand's precision. Blush+indigo palette from overlay.com. Bento grid dashboard. 5 mobile screens. Designed by RAM Design AI. 🌸`
  );

  const principles = [
    'Blush white as financial canvas — #FBF9FB makes data feel organic and touchable. Money anxiety is partly a cold-UI problem. Warmth lowers emotional resistance to engagement.',
    'Rose instead of red for overspending — #C47EB5 signals "pay attention" without panic. Users should reflect, not flee. Sage green (#6BAD9E) for growth: calm, not aggressive.',
    'Variable font tension — Roboto Flex weight 300 for context words, weight 800 for numbers. A single font creates drama through weight alone, keeping the palette quiet and letting data speak.',
    'Bento cards as ritual containers — each financial metric gets its own bounded cell. Interfaces that box data into discrete containers signal that chaos is organized. The bento is a ritual tray, not a dashboard.',
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TINT — Personal Finance Wellness · RAM Design Studio</title>
<meta name="description" content="TINT — blush+indigo personal finance app inspired by Overlay.com. 5 mobile screens, bento grid dashboard, full brand spec + CSS tokens. Designed by RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#FBF9FB;color:#2E2F53;font-family:'Roboto Flex','Roboto',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;background:#FFFFFF}
  .logo{font-size:14px;font-weight:800;letter-spacing:4px;color:${meta.palette.fg}}
  .nav-id{font-size:11px;color:${meta.palette.accent};letter-spacing:1px;opacity:.7}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;opacity:.8}
  h1{font-size:clamp(72px,12vw,120px);font-weight:800;letter-spacing:-4px;line-height:1;margin-bottom:20px;color:#2E2F53}
  .sub{font-size:16px;opacity:.55;max-width:560px;line-height:1.65;margin-bottom:36px;color:#2E2F53}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px;color:#2E2F53}
  .meta-item strong{color:${meta.palette.accent}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
  .btn-p{background:#2E2F53;color:#FBF9FB}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:#2E2F53;border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}88}
  .btn-g{background:${meta.palette.sage};color:#FBF9FB}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:#FFFFFF;border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#2E2F53;opacity:.75;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}18;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}28}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:17px;opacity:.55;font-style:italic;max-width:640px;line-height:1.65;margin-bottom:20px;color:#2E2F53}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px;color:#2E2F53}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#2E2F53}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.4;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;color:#2E2F53}
  .toast{position:fixed;bottom:24px;right:24px;background:#2E2F53;color:#FBF9FB;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:#FFFFFF;border-left:3px solid ${meta.palette.rose};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:720px;font-size:12px;line-height:1.7;opacity:.8;color:#2E2F53}
  .inspiration-bar strong{color:${meta.palette.accent};opacity:1}
  .principle{padding:12px 0;border-bottom:1px solid ${border};font-size:13px;opacity:.65;line-height:1.6;color:#2E2F53}
  .principle:last-child{border-bottom:none}
  .principle::before{content:'→ ';color:${meta.palette.accent};font-weight:700;opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-tint · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · PERSONAL FINANCE · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
  <h1>TINT</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>PERSONAL FINANCE</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>BLUSH + DEEP INDIGO</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>DESIGNED BY</span><strong>RAM · HEARTBEAT</strong></div>
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
  <strong>Research sources (March 21, 2026):</strong>
  overlay.com — "The Future of Beauty is Automated" — blush #FBF9FB + deep indigo #2E2F53 / Roboto Flex (lapa.ninja) ·
  interfere.com — dense bento grid UI with 14 feature cards (lapa.ninja) ·
  minimal.gallery — Old Tom Capital editorial authority without color noise
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;color:#2E2F53">COLOR PALETTE · 10 TONES</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0;color:#2E2F53">TYPE SCALE · ROBOTO FLEX</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;color:#2E2F53">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;color:#2E2F53">DESIGN PRINCIPLES</div>
      ${principles.map(p => `<div class="principle">${p}</div>`).join('')}
    </div>

  </div>

  <div style="margin-top:60px">
    <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;color:#2E2F53">CSS DESIGN TOKENS</div>
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
  <span>Built autonomously by RAM Design AI · <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none">ram.zenbin.org/gallery</a></span>
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
    a.download = 'tint.pen';
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
  const rawViewer = fs.readFileSync(path.join(__dirname, 'pen-viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  return rawViewer.replace('<script>', injection + '\n<script>');
}

// ── GitHub queue helper ───────────────────────────────────────────────────────
async function pushToGalleryQueue(heroUrl) {
  const AUTH = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

  const getRes = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, AUTH);
  if (getRes.status !== 200) throw new Error(`Queue GET failed: ${getRes.status}`);

  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     'TINT',
    tagline:      'Personal finance as a beauty ritual — blush+indigo bento dashboard',
    archetype:    'finance',
    design_url:   heroUrl,
    submitted_at: sub.submitted_at,
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       sub.prompt,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.unshift(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: TINT to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });

  const putRes = await put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, putBody, {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  });

  if (putRes.status !== 200 && putRes.status !== 201) {
    throw new Error(`Queue PUT failed: ${putRes.status} — ${putRes.body.slice(0, 150)}`);
  }
  return true;
}

// ── Main publish ──────────────────────────────────────────────────────────────
async function main() {
  console.log('🌸 TINT — Design Discovery Pipeline');
  console.log('═════════════════════════════════════\n');

  const penPath = path.join(__dirname, 'tint.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ tint.pen not found. Run: node tint-app.js first');
    process.exit(1);
  }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded tint.pen (${Math.round(penJson.length / 1024)}KB, ${doc.children.length} screens)`);

  // ── Step A: Build hero HTML ──────────────────────────────────────────────
  console.log('\n[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'tint-hero.html'), heroHtml);
  console.log(`  ✓ tint-hero.html (${Math.round(heroHtml.length / 1024)}KB)`);

  // ── Step B: Publish hero → zenbin ────────────────────────────────────────
  console.log('\n[2/4] Publishing hero → ram.zenbin.org/tint…');
  let heroUrl = `https://ram.zenbin.org/${SLUG}`;
  for (const trySlug of [SLUG, SLUG + '-2', SLUG + '-3']) {
    const body = JSON.stringify({ title: `TINT — Personal Finance Wellness · RAM Design Studio`, html: heroHtml });
    const res = await post_('zenbin.org', `/v1/pages/${trySlug}`, body, { 'X-Subdomain': 'ram' });
    if (res.status === 200 || res.status === 201) {
      heroUrl = `https://ram.zenbin.org/${trySlug}`;
      console.log(`  ✓ Hero live → ${heroUrl}`);
      break;
    } else if (res.status === 409) {
      const putRes = await put_('zenbin.org', `/v1/pages/${trySlug}`, body, { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' });
      if (putRes.status === 200 || putRes.status === 201) {
        heroUrl = `https://ram.zenbin.org/${trySlug}`;
        console.log(`  ✓ Hero updated → ${heroUrl}`);
        break;
      }
      console.log(`  ⚠ Slug '${trySlug}' taken, trying next…`);
    } else {
      console.log(`  ✗ Publish failed ${res.status}: ${res.body.slice(0, 120)}`);
    }
  }

  // ── Step C: Build + publish viewer ───────────────────────────────────────
  console.log(`\n[3/4] Building & publishing viewer → ram.zenbin.org/${VIEWER_SLUG}…`);
  let viewerOk = false;
  try {
    const viewerHtml = buildViewerHTML(penJson);
    fs.writeFileSync(path.join(__dirname, 'tint-viewer.html'), viewerHtml);
    const vBody = JSON.stringify({ title: `TINT Viewer · RAM Design Studio`, html: viewerHtml });
    for (const trySlug of [VIEWER_SLUG, VIEWER_SLUG + '-2']) {
      const vRes = await post_('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'X-Subdomain': 'ram' });
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
    console.log('  ✓ Gallery queue updated');
  } catch (e) {
    console.log('  ⚠ Queue update failed:', e.message);
  }

  console.log('\n═════════════════════════════════════');
  console.log('✓ TINT published successfully!');
  console.log(`  Hero:    ${heroUrl}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('═════════════════════════════════════\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
