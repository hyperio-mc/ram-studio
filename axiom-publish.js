'use strict';
// axiom-publish.js — hero page + viewer + gallery queue for AXIOM

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'axiom';
const APP_NAME  = 'AXIOM';
const TAGLINE   = 'The AI Model Exchange — Editorial Brutalism × Deep Indigo Dark Mode';
const DATE_STR  = 'March 21, 2026';
const SUBDOMAIN = 'ram';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'axiom.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#050311',
  surface:  '#0B0820',
  surface2: '#110E2B',
  surface3: '#171437',
  surface4: '#1E1B43',
  border:   '#201C45',
  border2:  '#2E2860',
  muted:    '#4E4882',
  muted2:   '#7B74B0',
  fg:       '#F4F2FF',
  fg2:      '#C4BFEE',
  accent:   '#3B2EFF',
  accentLt: '#6B5FFF',
  accent2:  '#FF2E6C',
  green:    '#00E87A',
  amber:    '#FFB930',
  mono:     '#A8FFDC',
};

const SCREEN_NAMES = ['Home / Hero', 'Model Browser', 'API Console', 'Usage Analytics', 'Model Detail'];

const PROMPT = `Design AXIOM — an AI model marketplace/API hub with editorial brutalism × deep indigo dark mode, inspired by:
1. SILENCIO (godly.website) — "CONSUME RESPONSIBLY", "LIMITED QUANTITY", "AUTHENTIC DIGITAL PRODUCTS" — editorial brutalism, Neue Haas Grotesk, ALL CAPS, anti-marketing aesthetic
2. Stripe Sessions 2026 (godly.website) — deep purple-black #20033C, near-white #F9F7F7, Söhne font, type-first layout
3. Atlas Card (godly.website) — electric indigo #001391, stark 3-color palette, "Sequel Sans", zero visual noise
4. Dark Mode Design trends (darkmodedesign.com) — Linear, Midday, Forge — clean developer productivity tools

Palette: deep indigo-black (#050311) + electric indigo (#3B2EFF) + cool off-white (#F4F2FF) + hot pink (#FF2E6C)
5 mobile screens: Home/Hero with SILENCIO-style brutalist stats, Model Browser grid, API Terminal Console, Usage Analytics bento grid, Model Detail "product page"`;

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
    const ax    = align === 'middle' ? x + w / 2 : align === 'end' ? x + w : x;
    const lines = String(node.content || '').split('\n');
    const lh    = node.lineHeight ? size * node.lineHeight : size * 1.25;
    return lines.map((ln, i) =>
      `<text x="${ax.toFixed(1)}" y="${(y + size + i * lh).toFixed(1)}" font-size="${size}" fill="${fill}" opacity="${op}" text-anchor="${align}" font-weight="${node.fontWeight || 400}">${ln.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`
    ).join('');
  }
  if (node.type === 'ellipse') {
    const fill   = sc(node.fill || 'transparent');
    const noFill = !node.fill || node.fill === 'transparent';
    const stroke = node.stroke ? ` stroke="${sc(node.stroke.fill)}" stroke-width="${node.stroke.thickness || 1}"` : '';
    return `<ellipse cx="${(x + w / 2).toFixed(1)}" cy="${(y + h / 2).toFixed(1)}" rx="${(w / 2).toFixed(1)}" ry="${(h / 2).toFixed(1)}" fill="${noFill ? 'none' : fill}" opacity="${op}"${stroke}/>`;
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
  /* AXIOM Design Tokens — Editorial Brutalism × Deep Indigo */

  /* Backgrounds (deep indigo darks) */
  --bg:           ${P.bg};
  --surface:      ${P.surface};
  --surface-2:    ${P.surface2};
  --surface-3:    ${P.surface3};
  --surface-4:    ${P.surface4};
  --border:       ${P.border};
  --border-2:     ${P.border2};
  --muted:        ${P.muted};
  --muted-2:      ${P.muted2};

  /* Foreground (cool violet-tinted off-whites) */
  --fg:           ${P.fg};
  --fg-2:         ${P.fg2};

  /* Brand — Electric Indigo (Atlas Card lineage) */
  --accent:       ${P.accent};
  --accent-lt:    ${P.accentLt};
  --accent-hover: #4D41FF;

  /* Editorial pop — Hot Pink (SILENCIO ref) */
  --editorial:    ${P.accent2};

  /* Data palette */
  --success:      ${P.green};
  --warning:      ${P.amber};
  --terminal:     ${P.mono};

  /* Typography — Brutalist Monospace System */
  --font-display: 900 clamp(48px,10vw,96px)/0.95 'SF Mono', ui-monospace, monospace;
  --font-heading: 700 22px/1.1 'SF Mono', ui-monospace, monospace;
  --font-label:   700 8px/1 'SF Mono', ui-monospace, monospace;
  --font-body:    400 13px/1.6 'SF Mono', ui-monospace, monospace;
  --font-data:    600 11px/1 'SF Mono', ui-monospace, monospace;

  /* Letter spacing — editorial brutalism */
  --ls-display: -2px;
  --ls-label:   2px;
  --ls-data:    1px;

  /* Spacing (4px base grid) */
  --s-1: 4px;  --s-2: 8px;   --s-3: 14px; --s-4: 20px;
  --s-5: 28px; --s-6: 40px;  --s-7: 60px; --s-8: 80px;

  /* Radius */
  --r-xs: 4px;  --r-sm: 6px;  --r-md: 10px;  --r-lg: 16px;
}`;

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_W = 175, THUMB_H = 320;
const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 4)}
    <div style="font-size:8px;color:${P.muted2};margin-top:10px;letter-spacing:2px;font-weight:700;font-family:monospace">${(SCREEN_NAMES[i] || 'SCREEN ' + (i + 1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchHTML = [
  { hex: P.bg,       role: 'BG — Deep Indigo Black'  },
  { hex: P.surface2, role: 'SURFACE'                  },
  { hex: P.fg,       role: 'FG — Cool Off-White'      },
  { hex: P.accent,   role: 'ACCENT — Electric Indigo' },
  { hex: P.accentLt, role: 'ACCENT LT'                },
  { hex: P.accent2,  role: 'EDITORIAL — Hot Pink'     },
  { hex: P.green,    role: 'SUCCESS — Neon Green'      },
  { hex: P.amber,    role: 'WARNING — Amber'           },
].map(s => `
  <div style="flex:1;min-width:80px;max-width:120px">
    <div style="height:56px;border-radius:6px;background:${s.hex};border:1px solid ${P.border2};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.muted};margin-bottom:3px;font-family:monospace">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.accent};font-family:monospace">${s.hex}</div>
  </div>`).join('');

// ── Type scale ────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'DISPLAY',  size: '56px', weight: '900', sample: 'AXIOM' },
  { label: 'WORDMARK', size: '28px', weight: '900', sample: 'AI MODEL EXCHANGE' },
  { label: 'HEADING',  size: '16px', weight: '700', sample: 'GPT-4o Ultra — 142ms Latency' },
  { label: 'BODY',     size: '13px', weight: '400', sample: 'The quick brown fox jumps over the lazy dog.' },
  { label: 'LABEL',    size: '8px',  weight: '700', sample: 'LATENCY · COST/1K · CONTEXT WINDOW · BENCHMARKS' },
].map(t => `
  <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:8px;font-family:monospace">${t.label} · ${t.size} / wt ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.1;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:monospace">${t.sample}</div>
  </div>`).join('');

// ── Design principles ──────────────────────────────────────────────────────────
const principlesHTML = [
  ['BRUTALIST EDITORIAL', 'ALL CAPS navigation, oversized display type, no decorative elements — influenced by SILENCIO\'s "CONSUME RESPONSIBLY" anti-marketing.'],
  ['ELECTRIC RESTRAINT', 'One dominant electric indigo (#3B2EFF) on deep purple-black — inspired by Atlas Card\'s 3-color discipline and Stripe Sessions\' dark palette.'],
  ['DATA AS TYPOGRAPHY', 'Numbers are the hero. Metrics like "2,847,392 REQUESTS" and "0.12% ERROR RATE" are displayed at display sizes — data as design.'],
  ['ANTI-SOFT', 'Hard edges, monospace only, no gradients — this product respects the engineering mindset of its users.'],
].map(([title, desc], i) => `
  <div style="padding:16px 0;border-bottom:1px solid ${P.border}">
    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="color:${P.accent};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div>
        <div style="font-size:9px;font-weight:700;color:${P.fg};letter-spacing:1.5px;margin-bottom:6px;font-family:monospace">${title}</div>
        <div style="font-size:12px;color:${P.muted2};line-height:1.65;font-family:monospace">${desc}</div>
      </div>
    </div>
  </div>`).join('');

const shareText = encodeURIComponent(`AXIOM — AI model marketplace design. Editorial brutalism × deep indigo dark mode. Inspired by SILENCIO + Stripe Sessions + Atlas Card. Built by RAM Design Studio.`);

const prd = `
<h3>OVERVIEW</h3>
<p>AXIOM is an AI model marketplace and API hub that treats language models as limited-edition digital products. Drawing on SILENCIO's anti-marketing editorial aesthetic ("CONSUME RESPONSIBLY", "VERY LIMITED QUANTITY AVAILABLE") and applied to the very-real scarcity of enterprise AI model capacity, AXIOM positions itself as the anti-AWS: curated, design-first, brutally transparent. Developers browse models like gallery pieces, run API calls in a terminal-aesthetic console, and track usage through a data-dense bento dashboard.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Indie SaaS developers</strong> who integrate multiple AI models and need to compare cost, latency, and capability without the bloat of cloud provider dashboards</li>
<li><strong>Design engineers</strong> who care about the aesthetic of their tools as much as their function</li>
<li><strong>AI-first product teams</strong> managing spend across GPT-4, Claude, Llama and emerging open models</li>
<li><strong>ML engineers</strong> evaluating benchmark scores and context window requirements for production deployment</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Home / Hero (Screen 1)</strong> — Brutalist landing with oversized "AX / IOM" wordmark split across accent and foreground, live metrics strip ("247 MODELS LIVE", "99.9% UPTIME", "1.2ms AVG LATENCY"), scrolling SILENCIO-style ticker tape, featured model cards, and a hot-pink "CONSUME RESPONSIBLY" warning badge.</li>
<li><strong>Model Browser (Screen 2)</strong> — Dense grid of AI models with provider labels in ALL CAPS, latency/cost metrics, availability pills (AVAILABLE/LIMITED in green/amber), and filter chips. Sort by popularity, cost, or latency.</li>
<li><strong>API Console (Screen 3)</strong> — Terminal-aesthetic JSON editor for request construction, live response with latency/token/cost metrics strip, and mint-colored (#A8FFDC) output text. History and save actions.</li>
<li><strong>Usage Analytics (Screen 4)</strong> — Bento grid: total requests sparkline card, cost vs. budget gauge, quota percentage bar, per-model breakdown with animated progress bars, error rate chart.</li>
<li><strong>Model Detail (Screen 5)</strong> — Single-model "product page" in SILENCIO style: oversized name split across two lines (white/indigo), spec grid (latency/context/cost), capability checklist, benchmark bars (MMLU/HumanEval/MT-Bench), and "VERY LIMITED CAPACITY — REQUEST DEMO" CTA.</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Palette origin:</strong> Deep indigo-black (#050311) from Stripe Sessions 2026 taken darker; electric indigo (#3B2EFF) from Atlas Card's #001391 brightened; hot pink editorial pop (#FF2E6C) from SILENCIO's urgency language</li>
<li><strong>Typography:</strong> Monospace only — SF Mono / JetBrains Mono. ALL CAPS for all navigation labels and section headers. Oversized 96px display weight for hero numerals. Tight negative letter-spacing on display, wide positive on labels.</li>
<li><strong>Layout:</strong> Bento grid for data screens, strict editorial columns for product/browse screens. No rounded corners above 10px. No shadows. No gradients. One rule: if a pixel isn't data, cut it.</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li>Home → Model Browser (Browse ALL MODELS →)</li>
<li>Model Browser → Model Detail (tap any card)</li>
<li>Model Detail → API Console (ADD TO PROJECT)</li>
<li>API Console → Usage Analytics (via nav)</li>
<li>Usage Analytics → Model Detail (tap model row)</li>
</ul>`;

// ── Hero HTML ──────────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — AI Model Exchange · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — Editorial brutalism × deep indigo dark mode. 5 screens + brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Mono','Fira Code','Courier New',ui-monospace,monospace;min-height:100vh;line-height:1.5}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${P.fg}}
  .nav-id{font-size:10px;color:${P.accent};letter-spacing:1px}
  .ticker{background:${P.surface};border-bottom:1px solid ${P.border};padding:8px 0;overflow:hidden;white-space:nowrap;font-size:8px;color:${P.muted};letter-spacing:2px;font-weight:700}
  .ticker-inner{display:inline-block;animation:ticker 24s linear infinite}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .hero{padding:80px 40px 40px}
  .hero-split{display:flex;align-items:flex-start;gap:0}
  .wordmark{font-size:clamp(72px,12vw,120px);font-weight:900;line-height:0.9;letter-spacing:-4px;margin-bottom:24px}
  .wm-white{color:${P.fg}}
  .wm-accent{color:${P.accent}}
  .tagline{font-size:10px;letter-spacing:3px;color:${P.muted};margin-bottom:20px;font-weight:700}
  .sub{font-size:14px;color:${P.fg2};max-width:520px;line-height:1.7;margin-bottom:36px;opacity:0.7}
  .stats{display:flex;gap:40px;margin-bottom:40px;flex-wrap:wrap;padding:24px 0;border-top:1px solid ${P.border};border-bottom:1px solid ${P.border}}
  .stat-n{font-size:32px;font-weight:900;letter-spacing:-1px;line-height:1}
  .stat-l{font-size:7px;color:${P.muted};letter-spacing:2px;font-weight:700;margin-top:6px}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:1px}
  .btn-p{background:${P.accent};color:${P.fg}}
  .btn-p:hover{background:#4D41FF}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border2}}
  .btn-s:hover{border-color:${P.accent}88;color:${P.accentLt}}
  .preview{padding:0 40px 80px}
  .section-label{font-size:8px;letter-spacing:3px;color:${P.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${P.border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:680px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border2};border-radius:6px;padding:20px;position:relative;margin-top:24px}
  .tokens-pre{font-size:10px;line-height:1.8;color:${P.fg2};opacity:0.75;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.accent}22;border:1px solid ${P.accent}44;color:${P.accent};font-family:inherit;font-size:9px;letter-spacing:1.5px;padding:5px 12px;border-radius:3px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.accent}44}
  .prompt-section{padding:40px;border-top:1px solid ${P.border}}
  .p-label{font-size:8px;letter-spacing:2.5px;color:${P.accent};margin-bottom:14px;font-weight:700}
  .p-text{font-size:15px;color:${P.fg2};font-style:italic;max-width:640px;line-height:1.75;margin-bottom:20px;opacity:0.7}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:780px}
  .prd-section h3{font-size:8px;letter-spacing:2.5px;color:${P.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${P.fg2};line-height:1.75;max-width:680px;opacity:0.8}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{color:${P.fg};opacity:1}
  footer{padding:28px 40px;border-top:1px solid ${P.border};font-size:10px;color:${P.muted};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:${P.fg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:2px;padding:10px 20px;border-radius:4px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .warn-badge{display:inline-flex;align-items:center;gap:8px;background:${P.accent2}18;border:1px solid ${P.accent2}44;border-radius:4px;padding:6px 14px;margin-bottom:32px}
  .warn-badge span{font-size:8px;color:${P.accent2};font-weight:700;letter-spacing:1.5px}
</style>
</head>
<body>
<div class="toast" id="toast">COPIED ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">HEARTBEAT · ${DATE_STR.toUpperCase()}</div>
</nav>

<div class="ticker">
  <div class="ticker-inner">
  © AXIOM EXCHANGE &nbsp;·&nbsp; AI MODELS &nbsp;·&nbsp; LIMITED ACCESS &nbsp;·&nbsp; CONSUME RESPONSIBLY &nbsp;·&nbsp; API FIRST &nbsp;·&nbsp; EDITORIAL BRUTALISM &nbsp;·&nbsp; DEEP INDIGO &nbsp;·&nbsp; 247 MODELS LIVE &nbsp;·&nbsp; 99.9% UPTIME &nbsp;·&nbsp;
  © AXIOM EXCHANGE &nbsp;·&nbsp; AI MODELS &nbsp;·&nbsp; LIMITED ACCESS &nbsp;·&nbsp; CONSUME RESPONSIBLY &nbsp;·&nbsp; API FIRST &nbsp;·&nbsp; EDITORIAL BRUTALISM &nbsp;·&nbsp; DEEP INDIGO &nbsp;·&nbsp; 247 MODELS LIVE &nbsp;·&nbsp; 99.9% UPTIME &nbsp;·&nbsp;
  </div>
</div>

<section class="hero">
  <div class="tagline">PRODUCTION DESIGN SYSTEM · AI MARKETPLACE · ${DATE_STR.toUpperCase()}</div>

  <div class="wordmark">
    <span class="wm-white">AX</span><br>
    <span class="wm-accent">IOM</span>
  </div>

  <p class="sub">An AI model marketplace designed as a gallery product. Editorial brutalism — ALL CAPS, monospace-only, electric indigo — inspired by SILENCIO, Stripe Sessions 2026, and Atlas Card.</p>

  <div class="warn-badge"><span>⚠ CONSUME RESPONSIBLY · VERY LIMITED AI CAPACITY · HARD WORK WARRANTY · NO RETURN POLICY</span></div>

  <div class="stats">
    <div><div class="stat-n" style="color:${P.fg}">5</div><div class="stat-l">MOBILE SCREENS</div></div>
    <div><div class="stat-n" style="color:${P.accent}">247</div><div class="stat-l">MODELS IN DESIGN</div></div>
    <div><div class="stat-n" style="color:${P.green}">99.9%</div><div class="stat-l">BRAND FIDELITY</div></div>
    <div><div class="stat-n" style="color:${P.amber}">1</div><div class="stat-l">CSS TOKEN FILE</div></div>
  </div>

  <div class="actions">
    <button class="btn btn-p" onclick="openViewer()">▶ OPEN IN VIEWER</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ DOWNLOAD .PEN</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ COPY PROMPT</button>
    <button class="btn btn-s" onclick="shareOnX()">𝕏 SHARE</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← GALLERY</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:700">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:0;font-weight:700">TYPE SCALE · MONOSPACE ONLY</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:700">SPACING SYSTEM · 4PX BASE GRID</div>
      ${[4, 8, 14, 20, 28, 40, 60].map(sp => `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
          <div style="font-size:9px;color:${P.muted};width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
          <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp * 2}px;opacity:0.7"></div>
        </div>`).join('')}
    </div>

    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:0;font-weight:700">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>
  </div>

  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <div class="p-text" id="prompt-text">${PROMPT.replace(/\n/g, '<br>')}</div>
  <button class="btn btn-s" onclick="copyPrompt()" style="font-size:9px">⌘ COPY PROMPT</button>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  ${prd}
</section>

<footer>
  <span>RAM DESIGN STUDIO · ${DATE_STR.toUpperCase()} · HEARTBEAT</span>
  <span>INSPIRATION: SILENCIO (GODLY.WEBSITE) · STRIPE SESSIONS 2026 · ATLAS CARD · DARKMODEDESIGN.COM</span>
</footer>

<script>
const PEN_B64 = '${Buffer.from(penJson).toString('base64')}';
const PROMPT_TEXT = ${JSON.stringify(PROMPT)};

function openViewer() { window.open('https://ram.zenbin.org/${SLUG}-viewer', '_blank'); }

function downloadPen() {
  const blob = new Blob([atob(PEN_B64)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '${SLUG}.pen'; a.click();
}

function copyPrompt() {
  navigator.clipboard.writeText(PROMPT_TEXT).then(() => showToast('PROMPT COPIED ✓'));
}

function copyTokens() {
  const t = document.getElementById('tokens-pre').innerText;
  navigator.clipboard.writeText(t).then(() => showToast('TOKENS COPIED ✓'));
}

function shareOnX() {
  const u = 'https://twitter.com/intent/tweet?text=${shareText}&url=' + encodeURIComponent('https://ram.zenbin.org/${SLUG}');
  window.open(u, '_blank');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
</script>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(
  path.join(__dirname, 'penviewer-app.html'), 'utf8'
);
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── GitHub queue entry ─────────────────────────────────────────────────────────
async function pushToGalleryQueue(heroUrl) {
  const queueUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/queue.json`;

  // fetch current queue
  const fetchRes = await new Promise((resolve, reject) => {
    https.get(queueUrl, { headers: { 'User-Agent': 'ram-design-studio/1.0' } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });

  let queue = { submissions: [] };
  let sha = null;

  if (fetchRes.status === 200) {
    try { queue = JSON.parse(fetchRes.body); } catch {}
  }

  // get sha
  const shaRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-design-studio/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (shaRes.status === 200) sha = JSON.parse(shaRes.body).sha;

  const entry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    slug: SLUG,
    app_name: APP_NAME,
    tagline: TAGLINE,
    design_url: heroUrl,
    submitted_at: new Date().toISOString(),
    credit: 'RAM (heartbeat)',
    status: 'done',
    palette: { bg: P.bg, accent: P.accent, fg: P.fg, accent2: P.accent2 },
    screen_names: SCREEN_NAMES,
    tags: ['dark-mode', 'editorial', 'brutalism', 'indigo', 'developer-tool', 'marketplace'],
  };

  queue.submissions = queue.submissions || [];
  queue.submissions.push(entry);

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({ message: `heartbeat: add ${SLUG}`, content, sha });

  const updateRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-design-studio/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, body);

  return updateRes.status;
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing AXIOM to ZenBin...');

  // 1. Hero page
  const heroRes = await createZenBin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML, SUBDOMAIN);
  console.log(`  Hero:   ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  // 2. Viewer
  const viewerRes = await createZenBin(`${SLUG}-viewer`, `${APP_NAME} — Viewer`, viewerHtml, SUBDOMAIN);
  console.log(`  Viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  // 3. Gallery queue
  try {
    const qStatus = await pushToGalleryQueue(`https://ram.zenbin.org/${SLUG}`);
    console.log(`  Queue:  ${qStatus}`);
  } catch (e) {
    console.log(`  Queue:  FAILED — ${e.message}`);
  }

  console.log('\n✓ Done!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
