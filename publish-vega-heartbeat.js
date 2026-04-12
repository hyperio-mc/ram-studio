'use strict';
// publish-vega-heartbeat.js
// Full Design Discovery pipeline for VEGA
// Design Heartbeat — Mar 21, 2026

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'vega-heartbeat';
const VIEWER_SLUG = 'vega-viewer';
const MOCK_SLUG   = 'vega-mock';
const DATE_STR    = 'March 21, 2026';
const APP_NAME    = 'VEGA';
const TAGLINE     = 'AI-Powered DeFi Portfolio Intelligence';
const ARCHETYPE   = 'finance';

const ORIGINAL_PROMPT = `Design a 5-screen dark-mode DeFi Portfolio Intelligence mobile app — VEGA — directly inspired by Nixtio's "Crypto Trading App UI" trending #1 on Dribbble popular (108 saves, 9.7k views, March 2026) and the ultra-refined near-black panel aesthetic of Midday, Forge, and Superset featured on darkmodedesign.com. VEGA gives crypto traders ambient, AI-powered portfolio awareness across multiple wallets. Palette: deep space navy-black (#070B12), electric violet accent (#6C47FF), teal-mint for gains (#00D4AA), coral for losses (#FF4D6A). 5 screens: Portfolio Overview (bento-grid with hero value, 24h sparkline chart, 2×2 metric cards, live token rows), Market Intelligence (search + global stats bar + sortable token table with mini sparklines), Trade (pair selector + candlestick chart + token swap with AI-optimised route), AI Signals (sentiment bar + 4 signal cards with confidence bars), Profile & Wallets (avatar, net worth stats, 3 connected wallets, risk score).`;

const P = {
  bg:        '#070B12',
  surface:   '#0E1420',
  surface2:  '#151E2E',
  surface3:  '#1C2A3E',
  border:    '#1E2A3D',
  border2:   '#28394F',
  fg:        '#E8EBF0',
  fg2:       '#8A94A6',
  fg3:       '#3D4D63',
  accent:    '#6C47FF',
  accentLo:  '#6C47FF22',
  accentHi:  '#9B78FF',
  green:     '#00D4AA',
  red:       '#FF4D6A',
  amber:     '#F5A623',
};

function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 300) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

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

function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x||0, y = el.y||0;
  const w = Math.max(0, el.width||0), h = Math.max(0, el.height||0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';

  if (el.type === 'frame') {
    const bg   = fill !== 'transparent' && fill !== 'none'
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`
      : '';
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids && !bg) return '';
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w/2, ry = h/2;
    return `<ellipse cx="${x+rx}" cy="${y+ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, 8));
    return `<rect x="${x}" y="${y+(h-fh)/2}" width="${w}" height="${fh}" fill="${el.fill||P.fg}"${oAttr} rx="1" opacity="0.5"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:14px;flex-shrink:0;border:1px solid ${P.border}"><rect width="${sw}" height="${sh}" fill="${screen.fill||P.bg}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  return md.trim().split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
    if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- '))
        .map(l => `<li>${l.slice(2).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')}</li>`);
      return `<ul>${items.join('')}</ul>`;
    }
    return `<p>${block.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')}</p>`;
  }).join('\n');
}

function buildHeroHTML(pen) {
  const screens = pen.children || [];
  const THUMB_H = 200;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,       role: 'VOID' },
    { hex: P.surface,  role: 'SURFACE' },
    { hex: P.surface2, role: 'ELEVATED' },
    { hex: P.fg,       role: 'LUMINANCE' },
    { hex: P.fg2,      role: 'MUTED' },
    { hex: P.accent,   role: 'VIOLET' },
    { hex: P.green,    role: 'GAIN' },
    { hex: P.red,      role: 'LOSS' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px;max-width:90px">
      <div style="height:44px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:6px;border-radius:6px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:2px">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accent};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'48px', weight:'900', sample:'VEGA',           extra:'letter-spacing:-2px' },
    { label:'KPI NUM',  size:'36px', weight:'800', sample:'$148,294.72',    extra:'font-variant-numeric:tabular-nums' },
    { label:'HEADING',  size:'18px', weight:'700', sample:'AI-Powered DeFi Portfolio Intelligence' },
    { label:'BODY',     size:'13px', weight:'400', sample:'BTC +1.2%  ·  $48,100 holdings  ·  Confidence 87%' },
    { label:'LABEL',    size:'9px',  weight:'700', sample:'AI SIGNALS · LIVE · 3 WALLETS LINKED' },
  ].map(t => `
    <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.35;margin-bottom:5px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};${t.extra||''};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,12,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:9px">
      <div style="font-size:9px;opacity:.35;width:30px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:7px;background:linear-gradient(90deg,${P.accent},${P.green});width:${sp*2}px;opacity:0.7;border-radius:2px"></div>
    </div>`).join('');

  const principles = [
    'Violet + teal semantic split — #6C47FF (electric violet) is pure brand/interaction; #00D4AA (teal-mint) is reserved for positive financial data only. Never decorative.',
    'Bento-grid as data hierarchy — the portfolio overview arranges KPIs in a 2×2 grid, each cell instantly legible without needing context from other cells. Inspired by Nixtio on Dribbble.',
    'Near-black depth without hard borders — three surface levels (#070B12 → #0E1420 → #151E2E → #1C2A3E) create spatial depth through value alone, borders only used to reinforce separation.',
    'Mini sparklines inside table rows — each asset row in Markets and Portfolio carries a 8-bar inline sparkline, giving trend direction at a glance without a separate chart tab.',
    'AI confidence as a designed element — signal confidence scores render as proportional bars rather than plain numbers, making "87% confidence" a visual affordance, not just a datum.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-start">
      <div style="color:${P.accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i+1).padStart(2,'0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* VEGA Design System — DeFi Dark × Electric Violet */
  /* Inspired by Nixtio Dribbble (trending #1 March 2026) + darkmodedesign.com */

  /* Surface scale — 4 levels of depth */
  --color-bg:         #070B12;   /* deep space void */
  --color-surface:    #0E1420;   /* card layer */
  --color-surface-2:  #151E2E;   /* elevated input/panel */
  --color-surface-3:  #1C2A3E;   /* highest elevation */
  --color-border:     #1E2A3D;   /* subtle divider */
  --color-border-2:   #28394F;   /* stronger border */

  /* Brand — electric violet */
  --color-accent:     #6C47FF;
  --color-accent-lo:  rgba(108, 71, 255, 0.13);
  --color-accent-mid: rgba(108, 71, 255, 0.33);
  --color-accent-hi:  #9B78FF;

  /* Semantic financial colors */
  --color-gain:       #00D4AA;   /* teal-mint — positive P&L */
  --color-gain-lo:    rgba(0, 212, 170, 0.13);
  --color-loss:       #FF4D6A;   /* coral — negative P&L */
  --color-loss-lo:    rgba(255, 77, 106, 0.13);
  --color-neutral:    #F5A623;   /* amber — neutral/hold */
  --color-neutral-lo: rgba(245, 166, 35, 0.13);
  --color-info:       #4D9EFF;   /* blue — informational */

  /* Text scale */
  --color-fg:         #E8EBF0;   /* primary — cool near-white */
  --color-fg-2:       #8A94A6;   /* muted — secondary info */
  --color-fg-3:       #3D4D63;   /* very muted — labels, dividers */

  /* Typography */
  --font-ui:   -apple-system, 'Inter', 'SF Pro Display', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* Font scale (DeFi app optimised) */
  --text-display:  900 48px / 0.95 var(--font-ui);   /* app name / hero */
  --text-kpi:      800 36px / 1 var(--font-ui);       /* portfolio value */
  --text-h1:       700 20px / 1.3 var(--font-ui);     /* screen title */
  --text-h2:       700 15px / 1.3 var(--font-ui);     /* card title / asset name */
  --text-body:     400 13px / 1.6 var(--font-ui);     /* body copy */
  --text-small:    400 10px / 1.4 var(--font-ui);     /* metadata / sub-labels */
  --text-label:    700 9px / 1 var(--font-ui);        /* ALL CAPS labels */
  --text-mono:     400 11px / 1.4 var(--font-mono);   /* addresses, hashes */

  /* Spacing (8pt grid) */
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 24px;  --space-6: 32px;
  --space-7: 48px; --space-8: 64px;

  /* Radii */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-pill: 24px;
  --radius-full: 9999px;

  /* Chart semantic colors */
  --chart-gain:    var(--color-gain);
  --chart-loss:    var(--color-loss);
  --chart-volume:  rgba(108, 71, 255, 0.4);
  --chart-neutral: var(--color-fg-3);

  /* Motion */
  --duration-fast:  120ms;
  --duration-base:  200ms;
  --duration-slow:  350ms;
  --easing-snap:    cubic-bezier(0.16, 1, 0.3, 1);
  --easing-smooth:  cubic-bezier(0.4, 0, 0.2, 1);

  /* Shadows */
  --shadow-card:  0 2px 12px rgba(0, 0, 0, 0.4);
  --shadow-modal: 0 8px 40px rgba(0, 0, 0, 0.6), 0 0 1px rgba(108,71,255,0.3);
}`;

  const prdMd = `
## Overview

VEGA is an AI-powered DeFi portfolio intelligence app for the multi-chain crypto trader. It aggregates positions across multiple wallets and chains into a single ambient dashboard, then layers AI-generated market signals on top — giving traders confidence about when to hold, buy, or sell without drowning in noise.

The design was directly inspired by **Nixtio's trending Crypto Trading App UI** (Dribbble's #1 popular shot, March 2026, with 108 saves and 9.7k views) for the bento-grid layout and violet/teal palette system, combined with the ultra-refined near-black panel aesthetic found across **Midday, Forge, and Superset** on darkmodedesign.com — "functional dark" that stays readable even in dense data contexts.

## Target Users

- **Active DeFi traders** managing positions across multiple wallets and chains
- **Crypto portfolio managers** who want AI signals without constant chart-watching
- **DeFi-native power users** who expect professional-grade data density with clean UX
- **Web3 newcomers** learning to trade who benefit from AI confidence scores and plain-language signal reasoning

## Core Features

- **Portfolio Overview** — total value hero with 24h sparkline chart, 2×2 bento metric cards (best/worst mover, position count, top AI signal), and live token rows with inline mini sparklines
- **Market Intelligence** — global market cap stats, searchable + filterable asset table with 24h price changes and inline sparkline trend bars
- **Trade** — pair selector with live price, candlestick chart with timeframe toggle, token swap interface with AI-optimised routing (finds best Uniswap/1inch/Curve path)
- **AI Signals** — overall market sentiment bar + 4 signal cards per asset with confidence bars, price targets, stop-loss levels, and plain-language reasoning
- **Profile & Wallets** — multi-wallet management, net worth + 30D P&L + win rate stats, risk score card, AI preferences and notification settings

## Design Language

Deep space dark: four surface levels from void (#070B12) to elevated (#1C2A3E) create spatial depth through value alone. Electric violet (#6C47FF) handles all interaction states — selected nav, primary CTAs, active filters. Teal-mint (#00D4AA) and coral (#FF4D6A) are used only for financial signal (gain/loss) — never decorative. This strict semantic palette prevents color fatigue in data-dense contexts. Ambient glow ellipses at screen edges soften the hard dark without visual clutter.

## Screen Architecture

1. **Portfolio Overview** — Hero portfolio value + 24h sparkline + period selector + 2×2 bento metrics + top 4 token holdings with inline sparklines
2. **Market Intelligence** — Search bar + global cap/dominance bar + category filter tabs + 8-row sortable asset table with price, 24h change pill, and mini sparkline
3. **Trade** — Pair selector + 18-candle chart panel with timeframe tabs + Swap/Limit/DCA toggle + from/to token inputs with AI-optimised route bar + CTA
4. **AI Signals** — Bullish/bearish sentiment progress bar + 4 signal cards: asset icon, signal type pill, confidence bar, price target, stop-loss, horizon, reasoning snippet
5. **Profile & Wallets** — Avatar + verified badge + 3-stat row (net worth, P&L, win rate) + 3 connected wallet cards + risk score bar + settings list
`;

  const heroURL   = `https://ram.zenbin.org/${SLUG}`;
  const viewerURL = `https://ram.zenbin.org/${VIEWER_SLUG}`;
  const mockURL   = `https://ram.zenbin.org/${MOCK_SLUG}`;
  const shareText = encodeURIComponent(`VEGA — AI-Powered DeFi Portfolio Intelligence. Electric violet on deep space dark. 5-screen mobile app with AI signals, bento-grid, candlestick charts. Built by RAM Design Studio.`);
  const shareURL  = encodeURIComponent(heroURL);
  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="VEGA: DeFi Portfolio Intelligence with electric violet accent, teal-mint gains, coral losses on deep space dark. 5-screen mobile app.">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:${P.bg};color:${P.fg};font-family:-apple-system,'Inter','Segoe UI',system-ui,sans-serif;line-height:1.6}
a{color:${P.accentHi};text-decoration:none}a:hover{text-decoration:underline}
.container{max-width:920px;margin:0 auto;padding:0 24px}

.hero{padding:80px 0 60px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);
  width:800px;height:500px;background:radial-gradient(ellipse at 40% 40%,${P.accent}18 0%,${P.green}0C 55%,transparent 75%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${P.border2},transparent)}
.hero-tag{display:inline-block;padding:5px 16px;background:${P.accentLo};color:${P.accentHi};
  font-size:10px;font-weight:700;letter-spacing:2px;border-radius:20px;margin-bottom:28px;border:1px solid ${P.accent}40}
.hero-name{font-size:clamp(64px,14vw,120px);font-weight:900;letter-spacing:-4px;line-height:0.9;
  background:linear-gradient(150deg,${P.fg} 0%,${P.accentHi} 40%,${P.green} 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:20px;padding-bottom:8px}
.hero-tagline{font-size:clamp(14px,2.5vw,18px);color:${P.fg2};margin-bottom:8px;font-weight:300;letter-spacing:1px}
.hero-date{font-size:11px;color:${P.fg3};letter-spacing:1.5px;margin-bottom:44px;text-transform:uppercase}
.hero-prompt{font-size:14px;color:${P.fg2};font-style:italic;max-width:680px;margin:0 auto 48px;
  line-height:1.9;padding:28px;background:${P.surface};border-radius:12px;
  border:1px solid ${P.border};border-left:3px solid ${P.accent}}

.actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:56px}
.btn{padding:11px 22px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;
  border:none;text-decoration:none;display:inline-flex;align-items:center;gap:8px;
  transition:all .15s;letter-spacing:0.5px}
.btn:hover{opacity:.85;text-decoration:none;transform:translateY(-1px)}
.btn-primary{background:linear-gradient(135deg,${P.accent},${P.accentHi});color:#fff}
.btn-mock{background:linear-gradient(135deg,${P.green}CC,${P.green});color:#070B12}
.btn-secondary{background:${P.surface2};color:${P.fg};border:1px solid ${P.border2}}
.btn-outline{background:transparent;color:${P.fg2};border:1px solid ${P.border}}

.screens-section{margin-bottom:72px}
.section-label{font-size:9px;font-weight:700;letter-spacing:2.5px;color:${P.fg3};text-transform:uppercase;margin-bottom:20px}
.screens-strip{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px;scrollbar-width:thin;scrollbar-color:${P.border2} transparent}
.screens-strip::-webkit-scrollbar{height:4px}
.screens-strip::-webkit-scrollbar-thumb{background:${P.border2};border-radius:2px}

.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:72px}
@media(max-width:600px){.spec-grid{grid-template-columns:1fr}}
.spec-card{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px}
.spec-card h3{font-size:9px;font-weight:700;letter-spacing:2px;color:${P.fg3};text-transform:uppercase;margin-bottom:20px}
.palette{display:flex;gap:8px;flex-wrap:wrap}

.tokens-section{margin-bottom:72px}
.tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px;position:relative}
.tokens-block pre{font-family:'SF Mono','Fira Code',monospace;font-size:11px;color:${P.fg2};overflow-x:auto;line-height:1.8;white-space:pre}
.copy-btn{position:absolute;top:16px;right:16px;background:${P.accentLo};color:${P.accentHi};
  border:1px solid ${P.accent}40;border-radius:6px;padding:6px 14px;font-size:10px;font-weight:700;letter-spacing:1px;cursor:pointer;transition:all .15s}
.copy-btn:hover{background:${P.accent};color:#fff}

.prd-section{margin-bottom:72px}
.prd-body{color:${P.fg2};font-size:14px;line-height:1.8}
.prd-body h3{font-size:16px;font-weight:700;color:${P.fg};margin:28px 0 12px}
.prd-body p{margin-bottom:14px}.prd-body ul{padding-left:20px;margin-bottom:14px}
.prd-body li{margin-bottom:6px}.prd-body strong{color:${P.fg}}

.footer{padding:56px 0;border-top:1px solid ${P.border};text-align:center;color:${P.fg3};font-size:12px}
.footer a{color:${P.fg3}}.footer a:hover{color:${P.fg2}}
</style>
</head>
<body>
<div class="container">
  <div class="hero">
    <div class="hero-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
    <div class="hero-name">${APP_NAME}</div>
    <div class="hero-tagline">${TAGLINE}</div>
    <div class="hero-date">Design Heartbeat · DeFi Dark × Electric Violet · AI Signals</div>
    <div class="hero-prompt">${ORIGINAL_PROMPT}</div>
    <div class="actions">
      <a href="${viewerURL}" class="btn btn-primary" target="_blank">▶ Open in Viewer</a>
      <a href="${mockURL}" class="btn btn-mock" target="_blank">✦ Try Interactive Mock</a>
      <a href="data:application/json;base64,${penEncoded}" download="vega.pen" class="btn btn-secondary">↓ Download .pen</a>
      <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.querySelector('.hero-prompt').textContent.trim()).then(()=>this.textContent='✓ Copied!')">⎘ Copy Prompt</button>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}" class="btn btn-outline" target="_blank">𝕏 Share</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">⬡ Gallery</a>
    </div>
  </div>

  <div class="screens-section">
    <div class="section-label">5 Screens — Portfolio · Markets · Trade · Signals · Profile</div>
    <div class="screens-strip">${thumbsHTML}</div>
  </div>

  <div class="spec-grid">
    <div class="spec-card"><h3>Color Palette</h3><div class="palette">${swatchHTML}</div></div>
    <div class="spec-card"><h3>Type Scale</h3>${typeScaleHTML}</div>
    <div class="spec-card"><h3>Spacing System</h3>${spacingHTML}</div>
    <div class="spec-card"><h3>Design Principles</h3>${principlesHTML}</div>
  </div>

  <div class="tokens-section">
    <div class="section-label">CSS Design Tokens</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.querySelector('.tokens-block pre').textContent).then(()=>this.textContent='✓ Copied!')">COPY TOKENS</button>
      <pre>${cssTokens}</pre>
    </div>
  </div>

  <div class="prd-section">
    <div class="section-label">Product Brief / PRD</div>
    <div class="spec-card"><div class="prd-body">${mdToHtml(prdMd)}</div></div>
  </div>

  <div class="footer">
    <p>Built by <strong style="color:${P.fg2}">RAM Design Studio</strong> · Heartbeat ${DATE_STR}</p>
    <p style="margin-top:8px">
      <a href="https://ram.zenbin.org/gallery">← Gallery</a> ·
      <a href="${viewerURL}">Viewer →</a> ·
      <a href="${mockURL}">Interactive Mock →</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

function buildViewerHTML(pen) {
  const penJson = JSON.stringify(pen);
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'axon-viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

async function main() {
  console.log('=== VEGA Design Discovery Pipeline ===\n');

  const penPath = path.join(__dirname, 'vega.pen');
  const pen     = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded pen: ${pen.children.length} screens`);

  const heroHTML = buildHeroHTML(pen);
  console.log(`\n[1/4] Hero HTML: ${(heroHTML.length/1024).toFixed(1)} KB`);
  console.log('[2/4] Publishing hero → ram.zenbin.org/' + SLUG);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`  → ${heroRes.status}  ${heroRes.body.slice(0, 120)}`);

  console.log('\n[3/4] Building + publishing viewer…');
  const viewerHTML = buildViewerHTML(pen);
  console.log(`  Viewer HTML: ${(viewerHTML.length/1024).toFixed(1)} KB`);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`  → ${viewerRes.status}  ${viewerRes.body.slice(0, 120)}`);

  console.log('\n[4/4] Updating gallery queue…');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id:           `heartbeat-vega-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${MOCK_SLUG}`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent, sha: currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    }
  }, putBody);
  console.log(`  → Gallery: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0,150)}`);

  console.log('\n✓ Pipeline complete!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${MOCK_SLUG}  (run vega-mock.mjs next)`);
}

main().catch(console.error);
