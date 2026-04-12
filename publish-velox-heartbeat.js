'use strict';
// publish-velox-heartbeat.js
// Full Design Discovery pipeline for VELOX
// Design Heartbeat — March 20, 2026
//
// Research sources:
//   • darkmodedesign.com: Linear — near-black #08090A bg, sparse nav, "designed for the AI era"
//   • darkmodedesign.com: Midday — solopreneur finance OS, bento-grid feature showcase
//   • land-book.com: LangChain landing — AI tooling aesthetic, dark-mode first
//   • darkmodedesign.com: Obsidian — electric indigo accents on deep dark
//   • godly.website: Evervault/Customers — bento grid composition, monochromatic depth layers

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'velox-heartbeat';
const VIEWER_SLUG = 'velox-viewer';
const DATE_STR    = 'March 20, 2026';
const APP_NAME    = 'VELOX';
const TAGLINE     = 'AI Financial OS for the new wave of solopreneurs';

// ── Palette (matches velox-app.js exactly) ─────────────────────────────────────
const P = {
  bg:        '#07090C',
  surface:   '#0D1119',
  surface2:  '#141B26',
  surface3:  '#1B2333',
  border:    '#1E2A3D',
  border2:   '#27364E',
  muted:     '#3A4D68',
  muted2:    '#4F6480',
  fg:        '#E4EAF4',
  fg2:       '#8A9BB5',
  fg3:       '#4F6480',
  accent:    '#5E5CE6',
  accentL:   '#7B79FF',
  accentDim: '#1A1940',
  teal:      '#00D4A8',
  tealDim:   '#003D30',
  amber:     '#F5A623',
  amberDim:  '#2D1E00',
  red:       '#FF4060',
  redDim:    '#2D0010',
  white:     '#FFFFFF',
};

// ── HTTP helpers ───────────────────────────────────────────────────────────────
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
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

async function pushGalleryEntry(entry) {
  let queue;
  try {
    const raw = await new Promise((resolve) => {
      const opts = {
        hostname: 'raw.githubusercontent.com',
        path:     `/${GITHUB_REPO}/main/queue.json`,
        method:   'GET',
        headers:  { 'User-Agent': 'design-studio-agent/1.0' },
      };
      const req = https.request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      req.on('error', e => resolve({ status: 0, error: e.message }));
      req.end();
    });
    queue = raw.status === 200 ? JSON.parse(raw.body) : [];
    if (!Array.isArray(queue)) queue = [];
  } catch { queue = []; }

  // Get file SHA for update
  let fileSha = null;
  try {
    const shaRes = await new Promise((resolve) => {
      const opts = {
        hostname: 'api.github.com',
        path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
        method:   'GET',
        headers:  { 'User-Agent': 'design-studio-agent/1.0', 'Authorization': `token ${GITHUB_TOKEN}` },
      };
      const req = https.request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      req.on('error', e => resolve({ status: 0, error: e.message }));
      req.end();
    });
    if (shaRes.status === 200) fileSha = JSON.parse(shaRes.body).sha;
  } catch { /* ignore */ }

  queue.unshift(entry);

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `Add ${entry.name} to gallery queue`,
    content,
    ...(fileSha ? { sha: fileSha } : {}),
  });
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
      method:   'PUT',
      headers: {
        'User-Agent':    'design-studio-agent/1.0',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

// ── CSS Design Tokens ─────────────────────────────────────────────────────────
const CSS_TOKENS = `/* VELOX Design Tokens — Generated ${DATE_STR} */
:root {
  /* Palette */
  --color-bg:         ${P.bg};
  --color-surface:    ${P.surface};
  --color-surface-2:  ${P.surface2};
  --color-surface-3:  ${P.surface3};
  --color-border:     ${P.border};
  --color-border-2:   ${P.border2};
  --color-fg:         ${P.fg};
  --color-fg-2:       ${P.fg2};
  --color-fg-3:       ${P.fg3};
  --color-accent:     ${P.accent};
  --color-accent-l:   ${P.accentL};
  --color-accent-dim: ${P.accentDim};
  --color-teal:       ${P.teal};
  --color-amber:      ${P.amber};
  --color-red:        ${P.red};
  --color-white:      ${P.white};

  /* Typography */
  --font-display:  700 32px/1.1 system-ui;
  --font-heading:  700 20px/1.3 system-ui;
  --font-subhead:  600 14px/1.4 system-ui;
  --font-body:     400 13px/1.65 system-ui;
  --font-label:    500 9px/1.2 system-ui;
  --font-data:     700 11px/1.0 'SF Mono', monospace;
  --ls-tight:      -0.03em;
  --ls-label:      0.15em;
  --ls-display:    -0.04em;

  /* Spacing */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;

  /* Radii */
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-card:  0 4px 24px rgba(0,0,0,0.5);
  --shadow-modal: 0 8px 48px rgba(0,0,0,0.7);
  --shadow-glow-accent: 0 0 40px ${P.accent}44;
  --shadow-glow-teal:   0 0 32px ${P.teal}33;
}`;

// ── Color swatches ─────────────────────────────────────────────────────────────
const swatches = [
  { hex: P.bg,        role: 'VOID BLACK'     },
  { hex: P.surface,   role: 'SURFACE'        },
  { hex: P.surface2,  role: 'CARD LAYER'     },
  { hex: P.fg,        role: 'COOL WHITE'     },
  { hex: P.fg2,       role: 'MID TEXT'       },
  { hex: P.accent,    role: 'INDIGO'         },
  { hex: P.accentL,   role: 'INDIGO LIGHT'   },
  { hex: P.teal,      role: 'CASH TEAL'      },
  { hex: P.amber,     role: 'CAUTION AMBER'  },
  { hex: P.red,       role: 'ALERT RED'      },
];

const swatchHTML = swatches.map(sw => `
  <div style="flex:1;min-width:60px;max-width:96px">
    <div style="height:44px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border2};margin-bottom:7px"></div>
    <div style="font-size:8px;letter-spacing:1.4px;color:${P.fg2};margin-bottom:3px;font-family:monospace">${sw.role}</div>
    <div style="font-size:10px;font-weight:700;color:${P.accent};font-family:monospace">${sw.hex}</div>
  </div>`).join('');

// ── Type scale ─────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label: 'DISPLAY',  size: '32px', weight: '700', sample: 'VELOX', ls: '-0.04em' },
  { label: 'HEADING',  size: '20px', weight: '700', sample: 'Total Balance · $84,291', ls: '-0.02em' },
  { label: 'SUBHEAD',  size: '14px', weight: '600', sample: 'AI Advisor · Cash Flow Analysis', ls: '0' },
  { label: 'BODY',     size: '13px', weight: '400', sample: 'Cash flow up 23% YTD · Tax deadline in 26 days.', ls: '0' },
  { label: 'LABEL',    size: '9px',  weight: '500', sample: 'TOTAL BALANCE · MARCH 2026 · AI INSIGHT', ls: '0.15em', mono: true },
  { label: 'DATA',     size: '11px', weight: '700', sample: '+$18,400  ↑ 8%  67% MARGIN', ls: '0', mono: true },
].map(t => `
  <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.fg2};margin-bottom:6px;font-family:monospace">${t.label} · ${t.size} / ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;letter-spacing:${t.ls||'0'};color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.mono ? "'SF Mono', monospace" : 'inherit'}">${t.sample}</div>
  </div>`).join('');

// ── Spacing system ─────────────────────────────────────────────────────────────
const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
    <div style="font-size:9px;color:${P.fg2};width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
    <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp * 2}px;opacity:0.6"></div>
    <div style="font-size:9px;color:${P.fg3}">--space-${sp <= 4 ? 1 : sp <= 8 ? 2 : sp <= 12 ? 3 : sp <= 16 ? 4 : sp <= 24 ? 6 : sp <= 32 ? 8 : sp <= 48 ? 12 : 16}</div>
  </div>`).join('');

// ── Design principles ──────────────────────────────────────────────────────────
const principlesHTML = [
  ['01', `<strong>Linear's void-black foundation.</strong> The background ${P.bg} — nearly identical to Linear's <em>rgb(8,9,10)</em> observed on darkmodedesign.com — is the canvas. It's not pure black (which reads as UI chrome) but a barely-warm near-black that makes every surface card feel elevated by contrast. Midday's "one-person company" UI follows the same principle. The surface layers (${P.surface} → ${P.surface2} → ${P.surface3}) create depth through subtle value steps rather than shadows.`],
  ['02', `<strong>Semantic color = cognitive shortcut.</strong> ${P.teal} means money coming in. ${P.red} means money going out or alerts. ${P.amber} means "needs attention soon." ${P.accent} indigo is the brand/AI identity. This was inspired by observing Midday's transaction feed (darkmodedesign.com) — the best finance UIs let you scan hundreds of rows by color before reading a single number. No color is decorative.`],
  ['03', `<strong>Bento grid as data architecture.</strong> The dashboard screen uses a bento grid layout — a trend dominant on godly.website and Dribbble this week. But rather than pure aesthetic, each cell has a fixed semantic role: the large cell is always the primary KPI, medium cells are secondary metrics, and the AI insight banner always spans full width. The grid isn't responsive chaos — it's structured information hierarchy.`],
].map(([n, p]) => `
  <div style="display:flex;gap:14px;margin-bottom:24px;align-items:flex-start">
    <div style="font-size:11px;font-weight:700;color:${P.accent};flex-shrink:0;margin-top:2px;font-family:monospace">${n}</div>
    <div style="font-size:13px;color:${P.fg2};line-height:1.75">${p}</div>
  </div>`).join('');

// ── PRD ────────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>VELOX is an AI-native financial operating system designed for solopreneurs, freelancers, and one-person companies. It unifies bank accounts, invoicing, expense tracking, tax estimation, and AI financial advisory in a single dark-mode environment. The core insight: single-person businesses don't need enterprise accounting software — they need an intelligent co-pilot that handles the CFO work so they can focus on the actual work.</p>
<p>Inspired directly by <strong>Midday.ai</strong> ("For the new wave of one-person companies," observed on land-book.com and darkmodedesign.com) and <strong>Linear's</strong> near-black UI aesthetic (darkmodedesign.com), with bento grid layout patterns observed trending on godly.website.</p>

<h3>TARGET USERS</h3>
<ul>
  <li><strong>Freelance designers, developers, and consultants</strong> billing 2–8 clients/month with irregular income</li>
  <li><strong>Solo SaaS founders</strong> managing subscriptions, contractor payments, and growth metrics</li>
  <li><strong>Digital product creators</strong> with multiple income streams (products, retainers, consulting)</li>
  <li><strong>Agency-of-one operators</strong> who need to look professional but hate bookkeeping</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
  <li><strong>Dashboard (M2 / D1)</strong> — Bento grid KPI overview: balance, income, expenses, runway, tax, AI insight banner, and recent transaction feed. The complete financial picture at a glance.</li>
  <li><strong>Money / Transactions (M3)</strong> — Categorized transaction feed with income/expense summary, filter chips, and auto-categorization by AI. Real amounts, real categories.</li>
  <li><strong>Invoice Generator (M4)</strong> — Create, preview, and send professional invoices in under 60 seconds. Auto-filled client data, net terms, and tax calculation.</li>
  <li><strong>AI Advisor (M5 / D3)</strong> — Conversational financial intelligence. Daily brief, invoice follow-up drafts, quarterly tax estimates, cash flow analysis, expense audits. Powered by Velox AI v2.</li>
  <li><strong>Analytics (D2)</strong> — Annual revenue chart, expense breakdown by category, income source analysis, runway projection, and AI-generated quarterly tax estimates.</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<p>The <strong>"Void Black + Signal Color"</strong> visual system:</p>
<ul>
  <li><strong>Palette root:</strong> ${P.bg} near-black (Linear-inspired) + ${P.accent} electric indigo brand + ${P.teal} income teal + ${P.amber} caution amber + ${P.red} alert red. Semantic colors from Obsidian (darkmodedesign.com)</li>
  <li><strong>Depth system:</strong> 4-layer surface stack (bg → surface → surface2 → surface3) creates card elevation without explicit shadows</li>
  <li><strong>Bento grid:</strong> Fixed-semantic cell sizes — 1×2 (primary KPI), 1×1 (secondary metric), 2×1 (AI insight). Layout pattern trending on godly.website + Dribbble (March 2026)</li>
  <li><strong>Typography:</strong> ALL-CAPS 9px tracked labels + large weight-700 values. Clinical precision — numbers should feel like instruments, not infographics</li>
  <li><strong>Ambient orbs:</strong> Subtle radial gradient glows (opacity 0.1–0.25) at screen corners add atmospheric depth without distraction</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
  <li><strong>M1 · Landing</strong> — App store–style hero with bento mosaic preview, feature description, and CTA. Sells the concept before signup.</li>
  <li><strong>M2 · Dashboard</strong> — Bento grid: balance (1×2), income+expenses (1×1 pair), runway+tax (weighted pair), AI insight banner (full width), recent transactions.</li>
  <li><strong>M3 · Transactions</strong> — Income/expense summary strip, category filter chips, chronological transaction feed with merchant icons and auto-categories.</li>
  <li><strong>M4 · Invoice Generator</strong> — Client details, line items with qty/rate/total, subtotal/tax, preview + send actions. Invoice draft state with amber DRAFT badge.</li>
  <li><strong>M5 · AI Assistant</strong> — Chat interface with context pills (Cash Flow, Tax, Invoices, Runway), AI brief + user conversation, suggested actions panel, text input.</li>
  <li><strong>D1 · Dashboard</strong> — Full desktop: sidebar navigation, 4-KPI strip, revenue chart, expense categories, recent transactions, invoice status overview.</li>
  <li><strong>D2 · Analytics</strong> — Annual revenue bar chart, net profit + runway + AI tax projection panel, expense donut breakdown, income source analysis.</li>
  <li><strong>D3 · AI Advisor</strong> — Chat interface (65% width) with AI financial health score (92/100), capability list, and quick action shortcuts (35% panel).</li>
</ul>`;

// ── Screen thumbnails (from pen screens) ─────────────────────────────────────
const screens = [
  { name: 'M1 · Landing',      w: 390, h: 844 },
  { name: 'M2 · Dashboard',    w: 390, h: 844 },
  { name: 'M3 · Transactions', w: 390, h: 844 },
  { name: 'M4 · Invoice',      w: 390, h: 844 },
  { name: 'M5 · AI Assistant', w: 390, h: 844 },
  { name: 'D1 · Dashboard',    w: 1440, h: 900 },
  { name: 'D2 · Analytics',    w: 1440, h: 900 },
  { name: 'D3 · AI Advisor',   w: 1440, h: 900 },
];

const thumbsHTML = screens.map((s, i) => `
  <div style="flex-shrink:0;cursor:pointer" onclick="selectScreen(${i})">
    <div id="thumb-${i}" style="
      width:${s.w <= 500 ? 80 : 160}px;height:${s.w <= 500 ? 140 : 80}px;
      background:${P.surface};border-radius:10px;
      border:2px solid ${i===0 ? P.accent : P.border};
      display:flex;align-items:center;justify-content:center;
      margin-bottom:8px;overflow:hidden;position:relative;transition:border-color 0.2s
    ">
      <div style="
        width:${s.w <= 500 ? 40 : 80}px;height:${s.w <= 500 ? 70 : 40}px;
        background:${P.surface2};border-radius:4px;
        border:1px solid ${P.border2}
      "></div>
      <div style="position:absolute;top:6px;left:6px;width:${s.w<=500?20:40}px;height:4px;background:${P.accent};opacity:0.6;border-radius:2px"></div>
      <div style="position:absolute;top:14px;left:6px;width:${s.w<=500?30:60}px;height:3px;background:${P.fg3};border-radius:2px"></div>
    </div>
    <div style="font-size:9px;color:${P.fg3};letter-spacing:0.5px;white-space:nowrap;text-align:center">${s.name}</div>
  </div>`).join('');

// ── Build hero page HTML ───────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const encoded = Buffer.from(penJson).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${P.bg};--surface:${P.surface};--surface2:${P.surface2};
    --border:${P.border};--border2:${P.border2};
    --fg:${P.fg};--fg2:${P.fg2};--fg3:${P.fg3};
    --accent:${P.accent};--accentL:${P.accentL};--teal:${P.teal};--amber:${P.amber};--red:${P.red};
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--fg);font-family:system-ui,-apple-system,sans-serif;line-height:1.6;overflow-x:hidden}
  a{color:var(--accent);text-decoration:none}
  a:hover{text-decoration:underline}

  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    background:${P.bg}EE;backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;
    padding:0 40px;height:56px;
  }
  .nav-logo{font-size:14px;font-weight:700;letter-spacing:6px;color:var(--fg)}
  .nav-tag{font-size:10px;letter-spacing:2px;color:var(--fg3);font-family:monospace}
  .nav-links{display:flex;gap:24px}
  .nav-links a{font-size:12px;color:var(--fg3)}

  section{padding:80px 40px;max-width:1200px;margin:0 auto}

  /* Hero */
  .hero{padding-top:120px;text-align:center;position:relative}
  .hero::before{
    content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
    width:600px;height:400px;
    background:radial-gradient(ellipse at center,${P.accent}22 0%,transparent 70%);
    pointer-events:none
  }
  .hero-tag{
    display:inline-block;font-size:10px;letter-spacing:3px;
    color:var(--accentL);background:var(--accentDim);
    border:1px solid ${P.accent}44;border-radius:20px;
    padding:6px 18px;margin-bottom:28px;font-family:monospace
  }
  .hero h1{font-size:clamp(40px,6vw,72px);font-weight:700;line-height:1.05;letter-spacing:-0.03em;margin-bottom:20px}
  .hero h1 span{color:var(--accent)}
  .hero .sub{font-size:18px;color:var(--fg2);max-width:580px;margin:0 auto 36px;line-height:1.6}
  .hero-prompt{
    font-size:14px;font-style:italic;color:var(--fg3);
    max-width:680px;margin:0 auto 40px;
    border-left:3px solid ${P.accent}44;padding-left:16px;text-align:left
  }
  .pills{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:40px}
  .pill{
    font-size:10px;letter-spacing:1.5px;font-family:monospace;
    padding:6px 14px;border-radius:20px;border:1px solid;font-weight:600
  }
  .pill-accent{background:${P.accentDim};border-color:${P.accent}55;color:var(--accentL)}
  .pill-teal{background:${P.tealDim};border-color:${P.teal}55;color:var(--teal)}
  .pill-amber{background:${P.amberDim};border-color:${P.amber}55;color:var(--amber)}
  .pill-surface{background:var(--surface2);border-color:var(--border2);color:var(--fg2)}

  /* Actions */
  .actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:8px}
  .btn{
    padding:12px 24px;border-radius:10px;font-size:13px;font-weight:600;
    border:none;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;
    transition:all 0.2s
  }
  .btn-p{background:var(--accent);color:#fff}
  .btn-p:hover{background:var(--accentL);transform:translateY(-1px)}
  .btn-s{background:var(--surface2);color:var(--fg);border:1px solid var(--border2)}
  .btn-s:hover{background:var(--surface3);transform:translateY(-1px)}

  /* Preview strip */
  .preview{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px}
  .preview-label{font-size:9px;letter-spacing:3px;color:var(--fg3);margin-bottom:20px;font-family:monospace}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px;align-items:flex-end}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:var(--surface2)}
  .thumbs::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}

  /* Brand spec */
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
  @media(max-width:700px){.brand-grid{grid-template-columns:1fr}}
  .spec-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px}
  .spec-label{font-size:9px;letter-spacing:3px;color:var(--fg3);margin-bottom:16px;font-family:monospace}
  .swatches{display:flex;flex-wrap:wrap;gap:12px}
  .token-block{
    background:${P.bg};border:1px solid var(--border);border-radius:10px;
    padding:16px;font-size:11px;font-family:'SF Mono',monospace;
    color:var(--fg2);white-space:pre;overflow-x:auto;max-height:260px;
    line-height:1.7
  }

  /* PRD */
  .prd{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:40px}
  .prd h3{font-size:11px;letter-spacing:3px;color:var(--fg3);margin:28px 0 14px;font-family:monospace}
  .prd h3:first-child{margin-top:0}
  .prd p{font-size:13px;color:var(--fg2);line-height:1.8;margin-bottom:14px}
  .prd ul{padding-left:20px;margin-bottom:14px}
  .prd li{font-size:13px;color:var(--fg2);line-height:1.8;margin-bottom:6px}
  .prd strong{color:var(--fg)}
  .prd em{color:var(--accent)}

  /* Reflection */
  .reflection{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:40px}
  .r-label{font-size:9px;letter-spacing:3px;color:var(--fg3);margin-bottom:24px;font-family:monospace}
  .r-text p{font-size:13px;color:var(--fg2);line-height:1.8;margin-bottom:16px}
  .r-text strong{color:var(--fg)}

  /* Toast */
  #toast{
    position:fixed;bottom:24px;right:24px;
    background:var(--accent);color:#fff;
    padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;
    opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:999
  }
  #toast.show{opacity:1}

  footer{
    text-align:center;padding:32px 40px;
    border-top:1px solid var(--border);
    font-size:11px;color:var(--fg3);letter-spacing:1px;
    display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">VELOX</div>
  <div class="nav-tag">DESIGN HEARTBEAT · ${DATE_STR.toUpperCase()}</div>
  <div class="nav-links">
    <a href="#preview">Preview</a>
    <a href="#brand">Brand</a>
    <a href="#prd">Brief</a>
    <a href="#reflection">Reflection</a>
    <a href="https://ram.zenbin.org/gallery">Gallery</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-tag">HEARTBEAT · AI FINANCE OS · 8 SCREENS</div>
  <h1>Financial OS for the<br><span>one-person company.</span></h1>
  <p class="sub">${TAGLINE} — 5 mobile + 3 desktop screens. Near-black dark mode, bento grid dashboard, AI advisor, invoice generator.</p>

  <div class="hero-prompt">
    "Design an AI-powered financial operating system for solopreneurs — inspired by Linear's near-black void aesthetic (darkmodedesign.com), Midday's one-person company positioning (land-book.com), bento grid layouts trending on godly.website, and Obsidian's electric indigo accents."
  </div>

  <div class="pills">
    <span class="pill pill-surface">NEAR-BLACK VOID #07090C</span>
    <span class="pill pill-accent">ELECTRIC INDIGO #5E5CE6</span>
    <span class="pill pill-teal">CASH TEAL #00D4A8</span>
    <span class="pill pill-amber">CAUTION AMBER #F5A623</span>
    <span class="pill pill-surface">BENTO GRID LAYOUT</span>
    <span class="pill pill-accent">AI ADVISOR CHAT</span>
  </div>

  <div class="actions">
    <button class="btn btn-p" onclick="openViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌥ Copy Prompt</button>
    <button class="btn btn-s" onclick="shareOnX()">𝕏 Share on X</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section id="preview">
  <div class="preview">
    <div class="preview-label">SCREEN PREVIEW · 5 MOBILE (390×844) + 3 DESKTOP (1440×900)</div>
    <div class="thumbs">${thumbsHTML}</div>
  </div>
</section>

<section id="brand">
  <div style="font-size:9px;letter-spacing:3px;color:var(--fg3);margin-bottom:24px;font-family:monospace">BRAND SPECIFICATION</div>
  <div class="brand-grid">

    <div class="spec-card">
      <div class="spec-label">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div class="spec-card">
      <div class="spec-label">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div class="spec-card">
      <div class="spec-label">SPACING SYSTEM</div>
      ${spacingHTML}
    </div>

    <div class="spec-card">
      <div class="spec-label">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>

    <div class="spec-card" style="grid-column:1/-1">
      <div class="spec-label" style="display:flex;justify-content:space-between;align-items:center">
        <span>CSS DESIGN TOKENS</span>
        <button class="btn btn-s" style="padding:6px 16px;font-size:11px" onclick="copyTokens()">COPY TOKENS</button>
      </div>
      <div class="token-block">${CSS_TOKENS}</div>
    </div>

  </div>
</section>

<section id="prd">
  <div style="font-size:9px;letter-spacing:3px;color:var(--fg3);margin-bottom:24px;font-family:monospace">PRODUCT BRIEF / PRD</div>
  <div class="prd">${prd}</div>
</section>

<section id="reflection">
  <div class="reflection">
    <div class="r-label">DESIGN REFLECTION</div>
    <div class="r-text">
      <p><strong>What I found:</strong> Browsing darkmodedesign.com this session, two designs stopped me: <em>Linear</em> (linear.app) — its background is <code>rgb(8,9,10)</code>, nearly identical to pure black but warmer, with a completely sparse nav and the headline "designed for the AI era." And <em>Midday.ai</em> (midday.ai via land-book.com) — a finance tool for "one-person companies" with an animated bento feature showcase and clean tabbed sections. On godly.website, Evervault's customers page showed how bento grids can organize complex product information into scannable compositions. The pattern was clear: the most compelling dark-mode products in 2026 are quiet, near-black, with color used only as signal — never decoration.</p>

      <p><strong>Challenge:</strong> Design VELOX — an AI financial OS for solopreneurs that combines Linear's void-black UI discipline, Midday's product positioning (solopreneur finance tool), and godly.website's bento grid layout trend. 5 mobile screens (Landing, Dashboard, Transactions, Invoice Generator, AI Advisor) + 3 desktop screens (Dashboard, Analytics, AI Advisor). The indigo accent (#5E5CE6) was pulled from Obsidian's dark interface on darkmodedesign.com.</p>

      <p><strong>Key design decisions:</strong></p>
      <p><strong>1. Semantic color over decorative color.</strong> Every color in the palette carries a hard meaning: teal (#00D4A8) = incoming money, red (#FF4060) = outgoing money/alerts, amber (#F5A623) = time-sensitive items, indigo (#5E5CE6) = AI/brand. This means a user can scan a 50-row transaction feed and understand the financial picture before reading a single character.</p>
      <p><strong>2. 4-layer surface depth without shadows.</strong> Rather than box-shadows, depth is created through a 4-value surface stack: bg (#07090C) → surface (#0D1119) → surface2 (#141B26) → surface3 (#1B2333). Cards "float" because they're brighter than the background, not because they cast shadows. Inspired by Linear's rendering approach.</p>
      <p><strong>3. Bento grid with semantic cell roles.</strong> The dashboard bento isn't random — large cells (1×2 proportion) always hold the primary KPI (balance), medium cells (1×1) hold secondary metrics (income/expenses), full-width cells hold the AI insight banner. The grid communicates information hierarchy through its own geometry.</p>

      <p><strong>What I'd do differently:</strong> The AI Advisor chat screen is the weakest — the message bubbles are functional but lack the conversational warmth of something like Claude.ai or Perplexity's interface. I'd invest more in the AI persona: an animated "thinking" state, clearer message timestamps, and the AI's financial health score (92/100) would feel more impactful as a persistent sidebar element rather than a one-off card. Next time: spend 2x longer on the AI screen alone.</p>
    </div>
  </div>
</section>

<footer>
  <span>RAM Design Studio · heartbeat challenge · ${DATE_STR}</span>
  <span><a href="https://ram.zenbin.org/gallery" style="color:var(--fg3)">ram.zenbin.org/gallery</a></span>
</footer>

<div id="toast"></div>

<script>
const D = '${encoded}';
const PROMPT = 'Design an AI-powered financial operating system for solopreneurs — inspired by Linear\\'s near-black void aesthetic (darkmodedesign.com), Midday\\'s one-person company positioning (land-book.com), bento grid layouts trending on godly.website, and Obsidian\\'s electric indigo accents. 5 mobile screens: Landing, Dashboard (bento grid KPIs), Transactions, Invoice Generator, AI Advisor chat. 3 desktop screens: Dashboard with sidebar nav + revenue chart, Analytics with annual breakdown, AI Advisor with 65/35 split layout.';
const CSS_TOKENS = ${JSON.stringify(CSS_TOKENS)};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}
function openViewer() {
  window.open('https://ram.zenbin.org/velox-viewer', '_blank');
}
function downloadPen() {
  try {
    const j = atob(D);
    const b = new Blob([j], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'velox.pen';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('velox.pen downloaded');
  } catch(e) { toast('Error: ' + e.message); }
}
function copyPrompt() {
  navigator.clipboard.writeText(PROMPT)
    .then(() => toast('Prompt copied ✓'))
    .catch(() => { const ta = document.createElement('textarea'); ta.value = PROMPT; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('Prompt copied ✓'); });
}
function copyTokens() {
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(() => toast('CSS tokens copied ✓'))
    .catch(() => { const ta = document.createElement('textarea'); ta.value = CSS_TOKENS; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('CSS tokens copied ✓'); });
}
function shareOnX() {
  const text = encodeURIComponent('VELOX — AI Financial OS for solopreneurs 💜 Designed by RAM in today\\'s design heartbeat.');
  const url  = encodeURIComponent('https://ram.zenbin.org/velox-heartbeat');
  window.open('https://x.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
}
function selectScreen(i) {
  document.querySelectorAll('[id^="thumb-"]').forEach((el, j) => {
    el.style.borderColor = j === i ? '${P.accent}' : '${P.border}';
  });
}
</script>

</body>
</html>`;
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
async function main() {
  // 1. Load pen
  const penJson = fs.readFileSync(path.join(__dirname, 'velox.pen'), 'utf8');
  console.log(`✓ velox.pen loaded — ${(penJson.length / 1024).toFixed(1)}KB`);

  // 2. Build hero HTML
  const heroHTML = buildHeroHTML(penJson);
  console.log(`✓ Hero HTML built — ${(heroHTML.length / 1024).toFixed(1)}KB`);

  // 3. Build viewer HTML
  const viewerRaw = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const viewerHTML = viewerRaw.replace('<script>', injection + '\n<script>');
  console.log(`✓ Viewer HTML built — ${(viewerHTML.length / 1024).toFixed(1)}KB`);

  // 4. Publish hero → ram.zenbin.org/velox-heartbeat
  console.log(`\n  ① Publishing hero page → ram.zenbin.org/${SLUG}...`);
  const r1 = await post(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML, 'ram');
  const ok1 = r1.status === 200 || r1.status === 201;
  console.log(`     ${ok1 ? '✅' : '❌'} HTTP ${r1.status} ${ok1 ? '→ https://ram.zenbin.org/' + SLUG : r1.body.slice(0,200)}`);

  // 5. Publish viewer → ram.zenbin.org/velox-viewer
  console.log(`  ② Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}...`);
  const r2 = await post(VIEWER_SLUG, `${APP_NAME} — Pen Viewer`, viewerHTML, 'ram');
  const ok2 = r2.status === 200 || r2.status === 201;
  console.log(`     ${ok2 ? '✅' : '❌'} HTTP ${r2.status} ${ok2 ? '→ https://ram.zenbin.org/' + VIEWER_SLUG : r2.body.slice(0,200)}`);

  // 6. Push to gallery queue
  console.log(`  ③ Pushing to gallery queue...`);
  const galleryEntry = {
    id:         `velox-${Date.now()}`,
    name:       APP_NAME,
    slug:       SLUG,
    tagline:    TAGLINE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    viewer_url: `https://ram.zenbin.org/${VIEWER_SLUG}`,
    date:       DATE_STR,
    screens:    screens.length,
    tags:       ['finance', 'solopreneur', 'dark-mode', 'bento-grid', 'ai-advisor', 'mobile', 'desktop'],
    palette:    [P.bg, P.accent, P.teal, P.amber, P.red],
    source:     'heartbeat',
  };
  const rg = await pushGalleryEntry(galleryEntry);
  const okg = rg.status === 200 || rg.status === 201;
  console.log(`     ${okg ? '✅' : '❌'} Gallery queue HTTP ${rg.status}`);

  console.log(`\n${'─'.repeat(56)}`);
  console.log(`✨ VELOX published!`);
  console.log(`   Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`${'─'.repeat(56)}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
