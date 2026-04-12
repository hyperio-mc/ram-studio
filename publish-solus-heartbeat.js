'use strict';
// publish-solus-heartbeat.js
// Full Design Discovery pipeline for SOLUS
// Design Heartbeat — Mar 20, 2026
// Inspired by:
//   • Midday.ai (lapa.ninja) — "For the new wave of one-person companies", dark finance product
//   • TRIONN (trionn.com via darkmodedesign.com) — near-black + ice teal #7FFFD4, ice text #E0EEEE
//   • MoMoney (awwwards.com nominees Mar 2026) — personal finance dark UI
//   • Forge (forge-site.webflow.io via darkmodedesign.com) — deep near-black strategy branding

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'solus-heartbeat';
const VIEWER_SLUG = 'solus-viewer';
const DATE_STR    = 'March 20, 2026';
const APP_NAME    = 'SOLUS';
const TAGLINE     = 'The financial OS for the new wave of one-person companies';

// ── Palette (matches solus-app.js exactly) ─────────────────────────────────────
const P = {
  bg:       '#0B0C0E',
  surface:  '#131619',
  surface2: '#1A1E22',
  border:   '#22272E',
  border2:  '#2E3540',
  teal:     '#7FFFD4',
  tealDim:  '#3BBFAA',
  ice:      '#DDEEED',
  fg:       '#E4EDE8',
  fg2:      '#7A8F8C',
  fg3:      '#3A4A47',
  green:    '#4AE3A0',
  red:      '#FF6B6B',
  yellow:   '#F5C84A',
  purple:   '#9B87F5',
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
    queue = raw.status === 200 ? JSON.parse(raw.body) : { submissions: [] };
  } catch (e) {
    queue = { submissions: [] };
  }
  if (!Array.isArray(queue.submissions)) queue.submissions = [];
  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const shaRes = await new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
      method:   'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent':    'design-studio-agent/1.0',
        'Accept':        'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.end();
  });

  const sha = shaRes.status === 200 ? JSON.parse(shaRes.body).sha : undefined;
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `Add ${entry.name} to gallery queue`, content, ...(sha ? { sha } : {}) });

  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
      method:   'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent':    'design-studio-agent/1.0',
        'Accept':        'application/vnd.github.v3+json',
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(putBody),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(putBody);
    req.end();
  });
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function renderNode(node, scale) {
  const x = Math.round((node.x || 0) * scale);
  const y = Math.round((node.y || 0) * scale);
  const w = Math.round((node.width  || 0) * scale);
  const h = Math.round((node.height || 0) * scale);
  if (w <= 0 || h <= 0) return '';

  let out = '';
  const fill   = node.fill || 'transparent';
  const r      = node.cornerRadius ? Math.round(node.cornerRadius * scale) : 0;
  const op     = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
  const stroke = node.stroke
    ? ` stroke="${node.stroke.fill}" stroke-width="${Math.max(1, Math.round((node.stroke.thickness || 1) * scale))}"`
    : '';

  if (node.type === 'ellipse') {
    const rx = Math.round(w / 2), ry = Math.round(h / 2);
    out += `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${stroke}${op}/>`;
  } else if (node.type === 'text') {
    const sz   = Math.max(4, Math.round((node.fontSize || 13) * scale));
    const col  = node.fill || P.fg;
    const fw   = node.fontWeight || '400';
    const anch = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const tx   = node.textAlign === 'center' ? x + w / 2 : node.textAlign === 'right' ? x + w : x;
    const safe = (node.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0, 50);
    out += `<text x="${tx}" y="${y + sz}" font-size="${sz}" fill="${col}" font-weight="${fw}" text-anchor="${anch}"${op}>${safe}</text>`;
  } else {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}${op}/>`;
    for (const child of (node.children || [])) {
      out += renderNode({ ...child, x: (node.x || 0) + (child.x || 0), y: (node.y || 0) + (child.y || 0) }, scale);
    }
  }
  return out;
}

const penJsonStr = fs.readFileSync(path.join(__dirname, 'solus-app.pen'), 'utf8');
const penJson    = JSON.parse(penJsonStr);
const screens    = penJson.children || [];

function screenThumbSVG(screen, tw, th) {
  const scale = Math.min(tw / screen.width, th / screen.height);
  const svgW  = Math.round(screen.width  * scale);
  const svgH  = Math.round(screen.height * scale);
  let inner = '';
  for (const child of (screen.children || [])) {
    inner += renderNode({ ...child, x: child.x || 0, y: child.y || 0 }, scale);
  }
  return `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="border-radius:10px;display:block;box-shadow:0 0 0 1px ${P.border2}">
    <rect width="${svgW}" height="${svgH}" fill="${screen.fill || P.bg}"/>
    ${inner}
  </svg>`;
}

// ── Thumbnails ─────────────────────────────────────────────────────────────────
const THUMB_H    = 200;
const SCREEN_NAMES = ['Dashboard', 'Transactions', 'Invoice Builder', 'Cash Flow', 'Financial Health'];
const thumbsHTML = screens.map((s, i) => {
  const tw = Math.round(THUMB_H * (s.width / s.height));
  return `<div style="text-align:center;flex-shrink:0">
    ${screenThumbSVG(s, tw, THUMB_H)}
    <div style="font-size:9px;color:${P.fg2};margin-top:10px;letter-spacing:1.5px;max-width:${tw}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(SCREEN_NAMES[i] || 'SCREEN ' + (i + 1)).toUpperCase()}</div>
  </div>`;
}).join('');

// ── CSS Tokens ─────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* ── Color ── */
  --color-bg:        ${P.bg};
  --color-surface:   ${P.surface};
  --color-surface2:  ${P.surface2};
  --color-border:    ${P.border};
  --color-border2:   ${P.border2};
  --color-fg:        ${P.fg};
  --color-fg2:       ${P.fg2};
  --color-fg3:       ${P.fg3};
  --color-teal:      ${P.teal};     /* TRIONN ice-teal accent */
  --color-teal-dim:  ${P.tealDim};
  --color-ice:       ${P.ice};      /* TRIONN #E0EEEE reference */
  --color-green:     ${P.green};    /* Positive cash / confirmed */
  --color-red:       ${P.red};      /* Expense / negative */
  --color-yellow:    ${P.yellow};   /* Pending / overdue */
  --color-purple:    ${P.purple};   /* Tax reserve / savings */

  /* ── Typography ── */
  --font-family:  'Inter', system-ui, -apple-system, sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 900 clamp(36px, 10vw, 80px) / 1 var(--font-family);
  --font-heading: 800 22px / 1.2 var(--font-family);
  --font-body:    400 13px / 1.65 var(--font-family);
  --font-caption: 700 9px / 1 var(--font-family);

  /* ── Spacing (4px base) ── */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* ── Radius ── */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-full: 9999px;

  /* ── Shadows ── */
  --shadow-card:  0 0 0 1px ${P.border2};
  --shadow-teal:  0 0 32px ${P.teal}18;
  --shadow-glow:  0 0 20px ${P.teal}0A;
}`;

// ── Color swatches ─────────────────────────────────────────────────────────────
const swatches = [
  { hex: P.bg,      role: 'VOID BLACK'  },
  { hex: P.surface, role: 'SURFACE'     },
  { hex: P.ice,     role: 'ICE TEXT'    },
  { hex: P.teal,    role: 'TEAL ACCENT' },
  { hex: P.green,   role: 'POSITIVE'    },
  { hex: P.red,     role: 'EXPENSE'     },
  { hex: P.yellow,  role: 'PENDING'     },
  { hex: P.purple,  role: 'TAX RESERVE' },
];
const swatchHTML = swatches.map(sw => `
  <div style="flex:1;min-width:68px">
    <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border2};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.fg2};margin-bottom:3px">${sw.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.teal}">${sw.hex}</div>
  </div>`).join('');

// ── Type scale ─────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label:'DISPLAY',  size:'48px', weight:'900', sample: 'SOLUS',        ls: '5px' },
  { label:'HEADING',  size:'22px', weight:'800', sample: 'Cash Flow Forecast' },
  { label:'BODY',     size:'13px', weight:'400', sample: 'Your finances, automated for the one-person company era.' },
  { label:'CAPTION',  size:'9px',  weight:'700', sample: 'REVENUE · MTD · Q1 2026', ls: '2px' },
  { label:'MONO',     size:'12px', weight:'700', sample: '$28,450.00 · Invoice #0047', font: 'monospace' },
].map(t => `
  <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.fg2};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.font || 'inherit'};letter-spacing:${t.ls || 'normal'}">${t.sample}</div>
  </div>`).join('');

// ── Spacing ────────────────────────────────────────────────────────────────────
const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
    <div style="font-size:9px;color:${P.fg2};width:28px;flex-shrink:0">${sp}px</div>
    <div style="height:6px;border-radius:3px;background:${P.teal};width:${sp * 1.8}px;opacity:0.6"></div>
  </div>`).join('');

// ── Design principles ──────────────────────────────────────────────────────────
const principlesHTML = [
  ['01', `Ice teal #7FFFD4 on near-void black #0B0C0E. TRIONN (trionn.com, discovered via darkmodedesign.com March 2026) uses an ice palette — almost luminous pale text against deep black — that reads as intelligent and premium without the clichéd neon-on-black. Applied here to financial data so every number feels crisp and trustworthy.`],
  ['02', `Color only carries signal. Green = money in. Red = money out. Yellow = action required. Purple = tax/saved. No decorative color use. A one-person founder glancing at the dashboard understands their financial state in under 3 seconds.`],
  ['03', `Bento grid as cognitive map. Inspired by Midday's unified dashboard approach and the bento grid trend on Awwwards — revenue, runway, invoices due, expenses, and tax reserve all visible simultaneously. No tabs required to understand your financial health.`],
].map(([n, p]) => `
  <div style="display:flex;gap:14px;margin-bottom:22px;align-items:flex-start">
    <div style="font-size:11px;font-weight:700;color:${P.teal};flex-shrink:0;margin-top:2px;font-family:monospace">${n}</div>
    <div style="font-size:13px;color:${P.fg2};line-height:1.75">${p}</div>
  </div>`).join('');

// ── PRD ────────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>SOLUS is a mobile financial OS built for independent founders, freelancers, and one-person companies. It combines real-time transaction visibility, invoice management, cash flow forecasting, and financial health scoring in a single dark-mode app. Inspired by Midday.ai's vision of automating business finances for indie workers, and styled using the ice-teal-on-black aesthetic pioneered by TRIONN digital agency (observed March 20, 2026 on darkmodedesign.com).</p>

<h3>TARGET USERS</h3>
<ul>
  <li><strong>Independent designers, developers, and consultants</strong> billing $8K–$30K/month with multiple clients</li>
  <li><strong>Solo product founders</strong> with recurring SaaS revenue who need runway clarity and tax discipline</li>
  <li><strong>Freelancers transitioning to LLC/S-Corp</strong> who need simple P&amp;L visibility without a bookkeeper</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
  <li><strong>Bento Dashboard</strong> — Glanceable financial state: MTD revenue with sparkline, runway months, invoices outstanding, recent transactions, tax reserve balance, expenses total</li>
  <li><strong>Transactions Feed</strong> — Categorized income/expense feed with auto-tagging (TOOLS, INFRA, INCOME, FEES), monthly in/out summary header, filterable by type</li>
  <li><strong>Invoice Builder</strong> — Fast invoice creation: client selector, line items with qty × rate, auto-subtotal, send or save as draft. Invoice number management, due date tracking</li>
  <li><strong>Cash Flow Forecast</strong> — 12-week rolling forecast with bar chart (actual vs projected), balance trend, expected income vs committed expenses breakdown, projected runway display</li>
  <li><strong>Financial Health</strong> — Composite score (0–100) with key business metrics (gross margin, receivables age, profit margin, expense ratio), tax calendar with Q1/Q2 estimated dates, accountant export</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<p>SOLUS's visual system is rooted in three research observations from March 20, 2026:</p>
<ul>
  <li><strong>Midday.ai (lapa.ninja)</strong> — "For the new wave of one-person companies" — dark finance dashboard, unified transaction + invoice flows, clean typographic hierarchy</li>
  <li><strong>TRIONN ice palette (darkmodedesign.com)</strong> — rgb(18,19,21) near-black background, rgb(224,238,238) ice-teal text. This ice palette creates a qualitatively different feel from typical dark modes: it reads as cool, precise, and financial-grade — not gaming-dark or tech-dark</li>
  <li><strong>MoMoney (Awwwards nominees)</strong> — Personal finance with bento grid layout, refined dark UI, color-coded financial signals</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
  <li><strong>S1 · Dashboard</strong> — Bento grid: full-width revenue with 8-week sparkline, half-width runway + invoices due, full-width recent txns, half-width tax reserve + expenses</li>
  <li><strong>S2 · Transactions</strong> — Filter pills, month in/out summary card, chronological transaction list with category pills and color-coded amounts</li>
  <li><strong>S3 · Invoice Builder</strong> — Draft invoice with number + due date, bill-to client, line items, subtotals, teal "Send Invoice" CTA</li>
  <li><strong>S4 · Cash Flow Forecast</strong> — Period selector, current balance card, 12-bar forecast chart (actual + projected), income/expense breakdown, projected runway</li>
  <li><strong>S5 · Financial Health</strong> — Health score ring (84/100), 4-metric bento grid, tax calendar Q1/Q2, export CTA</li>
</ul>`;

// ── Hero HTML ──────────────────────────────────────────────────────────────────
const heroURL    = `https://ram.zenbin.org/${SLUG}`;
const viewerURL  = `https://ram.zenbin.org/${VIEWER_SLUG}`;
const galleryURL = `https://ram.zenbin.org/gallery`;
const promptText = `Design SOLUS — a dark-mode financial OS for one-person companies. Inspired by Midday.ai ("For the new wave of one-person companies" via lapa.ninja), TRIONN's ice-teal-on-near-black aesthetic (#0B0C0E void black, #7FFFD4 teal, #DDEEED ice text — from darkmodedesign.com), and MoMoney from Awwwards. 5 mobile screens: Bento grid dashboard with revenue sparkline + runway + invoice + tax reserve cards, Transactions feed with category pills, Invoice builder, 12-week cash flow forecast with bar chart, and Financial Health score with metrics + tax calendar.`;
const shareText  = encodeURIComponent(`SOLUS — dark-mode financial OS for solo founders. Ice teal on void black. 5 screens + full brand spec. Inspired by Midday + TRIONN. Built by RAM Design Studio.`);

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — Financial OS · RAM Design Studio</title>
<meta name="description" content="${TAGLINE}">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { background: ${P.bg}; color: ${P.fg}; font-family: 'Inter', system-ui, sans-serif; scroll-behavior: smooth; }
  body { min-height: 100vh; }
  a { color: ${P.teal}; text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* ── Hero ── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 24px 60px;
    position: relative; overflow: hidden; text-align: center;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 700px 500px at 60% 40%, ${P.teal}08, transparent 70%),
                radial-gradient(ellipse 400px 400px at 20% 80%, ${P.purple}06, transparent 60%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-size: 10px; font-weight: 700; letter-spacing: 4px; color: ${P.teal};
    margin-bottom: 20px; position: relative;
  }
  .hero-title {
    font-size: clamp(72px, 16vw, 160px); font-weight: 900;
    letter-spacing: 16px; line-height: 0.9;
    color: ${P.ice}; position: relative;
    margin-bottom: 24px;
  }
  .hero-tagline {
    font-size: clamp(14px, 2vw, 18px); color: ${P.fg2};
    max-width: 520px; line-height: 1.75;
    margin-bottom: 12px; position: relative;
  }
  .hero-meta {
    font-size: 10px; color: ${P.fg3}; letter-spacing: 2px; margin-bottom: 44px;
    position: relative;
  }

  /* ── Buttons ── */
  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 16px; position: relative; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 22px; border-radius: 8px; font-size: 12px; font-weight: 700;
    letter-spacing: 1px; cursor: pointer; text-decoration: none !important;
    border: 1px solid transparent; transition: all .2s; font-family: 'Inter', sans-serif;
  }
  .btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-primary   { background: ${P.teal}; color: ${P.bg}; border-color: ${P.teal}; }
  .btn-secondary { background: transparent; color: ${P.fg}; border-color: ${P.border2}; }
  .btn-ghost     { background: transparent; color: ${P.teal}; border-color: ${P.teal}44; }
  .btn-x         { background: #000; color: #fff; border-color: #333; }

  /* ── Sections ── */
  section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
  .section-label { font-size: 9px; font-weight: 700; letter-spacing: 3px; color: ${P.fg3}; margin-bottom: 20px; }

  /* ── Thumbnails ── */
  .thumbs-section { padding: 60px 0; border-top: 1px solid ${P.border}; }
  .thumbs-scroll {
    display: flex; gap: 24px; overflow-x: auto; padding: 0 40px 20px;
    scrollbar-width: thin; scrollbar-color: ${P.border2} transparent;
    justify-content: center; flex-wrap: wrap;
  }

  /* ── Cards ── */
  .card {
    background: ${P.surface}; border: 1px solid ${P.border}; border-radius: 12px; padding: 28px;
  }

  /* ── Brand grid ── */
  .brand-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 28px; }
  @media (max-width: 760px) { .brand-grid { grid-template-columns: 1fr; } }
  .palette-row { display: flex; gap: 10px; flex-wrap: wrap; }

  /* ── Tokens ── */
  .tokens-block {
    background: ${P.surface2}; border: 1px solid ${P.border2}; border-radius: 10px;
    padding: 28px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px;
    color: ${P.fg2}; white-space: pre; overflow-x: auto; position: relative;
    line-height: 1.8;
  }
  .copy-btn {
    position: absolute; top: 16px; right: 16px;
    background: ${P.teal}18; color: ${P.teal}; border: 1px solid ${P.teal}44;
    border-radius: 6px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    padding: 6px 14px; cursor: pointer; font-family: 'SF Mono', monospace;
  }
  .copy-btn:hover { background: ${P.teal}30; }

  /* ── PRD ── */
  .prd-body h3 { font-size: 12px; font-weight: 700; letter-spacing: 2px; color: ${P.teal}; margin: 28px 0 10px; text-transform: uppercase; }
  .prd-body h3:first-child { margin-top: 0; }
  .prd-body p, .prd-body li { font-size: 13px; color: ${P.fg2}; line-height: 1.8; }
  .prd-body ul { padding-left: 20px; margin: 8px 0; }
  .prd-body li { margin-bottom: 6px; }
  .prd-body strong { color: ${P.fg}; font-weight: 600; }

  /* ── Footer ── */
  footer { border-top: 1px solid ${P.border}; padding: 44px 24px; text-align: center; font-size: 11px; color: ${P.fg3}; }
  .footer-logo { font-size: 16px; font-weight: 900; letter-spacing: 5px; color: ${P.fg2}; margin-bottom: 10px; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 28px; right: 28px;
    background: ${P.teal}; color: ${P.bg};
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    padding: 10px 22px; border-radius: 8px;
    transform: translateY(80px); opacity: 0; transition: all .3s; z-index: 999;
    font-family: 'Inter', sans-serif;
  }
  .toast.show { transform: translateY(0); opacity: 1; }
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<!-- ── HERO ── -->
<div class="hero">
  <div class="hero-eyebrow">RAM DESIGN STUDIO · ${DATE_STR}</div>
  <div class="hero-title">SOLUS</div>
  <div class="hero-tagline">${TAGLINE}</div>
  <div class="hero-meta">5 SCREENS · DARK FINANCE · INDIE FOUNDERS · ICE TEAL PALETTE</div>
  <div class="btn-row">
    <a class="btn btn-primary" href="${viewerURL}" target="_blank">▶ Open in Viewer</a>
    <a class="btn btn-ghost" onclick="document.getElementById('tokens').scrollIntoView({behavior:'smooth'})">CSS Tokens</a>
    <a class="btn btn-secondary" href="${galleryURL}" target="_blank">← Gallery</a>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(heroURL)}" target="_blank">𝕏 Share</a>
  </div>
</div>

<!-- ── SCREEN THUMBNAILS ── -->
<div class="thumbs-section">
  <div class="section-label" style="text-align:center;padding-bottom:20px">SCREEN ARCHITECTURE · 5 MOBILE SCREENS</div>
  <div class="thumbs-scroll">${thumbsHTML}</div>
</div>

<!-- ── ORIGINAL PROMPT ── -->
<section>
  <div class="section-label">ORIGINAL PROMPT</div>
  <div class="card">
    <p style="font-size:16px;font-style:italic;color:${P.fg};line-height:1.85;max-width:820px">"${promptText}"</p>
  </div>
</section>

<!-- ── BRAND SPEC ── -->
<section>
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div class="card">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${P.fg2};margin-bottom:20px">COLOR PALETTE</div>
      <div class="palette-row">${swatchHTML}</div>
    </div>
    <div class="card">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${P.fg2};margin-bottom:16px">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div class="card">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${P.fg2};margin-bottom:16px">SPACING SYSTEM</div>
      ${spacingHTML}
      <div style="margin-top:28px">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${P.fg2};margin-bottom:18px">DESIGN PRINCIPLES</div>
        ${principlesHTML}
      </div>
    </div>
  </div>
</section>

<!-- ── CSS TOKENS ── -->
<section id="tokens">
  <div class="section-label">CSS DESIGN TOKENS</div>
  <div style="position:relative">
    <div class="tokens-block" id="token-code">${cssTokens}</div>
    <button class="copy-btn" onclick="
      navigator.clipboard.writeText(document.getElementById('token-code').innerText).then(()=>{
        const t=document.getElementById('toast');
        t.textContent='Tokens copied ✓'; t.classList.add('show');
        this.textContent='COPIED!';
        setTimeout(()=>{ t.classList.remove('show'); this.textContent='COPY TOKENS'; }, 2000);
      })
    ">COPY TOKENS</button>
  </div>
</section>

<!-- ── PRD ── -->
<section>
  <div class="section-label">PRODUCT BRIEF</div>
  <div class="card prd-body">${prd}</div>
</section>

<!-- ── BOTTOM CTAs ── -->
<section style="text-align:center;padding-top:40px;padding-bottom:80px">
  <div class="section-label" style="margin-bottom:24px">EXPLORE THIS DESIGN</div>
  <div class="btn-row">
    <a class="btn btn-primary" href="${viewerURL}" target="_blank">▶ Open in Viewer</a>
    <a class="btn btn-ghost" href="${galleryURL}" target="_blank">← View Gallery</a>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(heroURL)}" target="_blank">𝕏 Share on X</a>
  </div>
</section>

<!-- ── FOOTER ── -->
<footer>
  <div class="footer-logo">RAM</div>
  <div>RAM Design Studio · AI-generated design systems</div>
  <div style="margin-top:10px">
    <a href="${heroURL}" style="color:${P.teal}">Hero Page</a> ·
    <a href="${viewerURL}" style="color:${P.teal}">Viewer</a> ·
    <a href="${galleryURL}" style="color:${P.teal}">Gallery</a>
  </div>
  <div style="margin-top:16px;font-size:10px;color:${P.fg3}">Inspired by Midday.ai · TRIONN · MoMoney · Awwwards March 2026</div>
</footer>

</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
function buildViewerHTML(penJsonStr) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SOLUS — Viewer · RAM</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080909; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; padding-bottom: 40px; }
  .viewer-header { text-align: center; padding: 32px 0 16px; }
  .viewer-title { font-size: 24px; font-weight: 900; letter-spacing: 6px; color: ${P.ice}; }
  .viewer-sub { font-size: 10px; color: ${P.fg3}; letter-spacing: 2.5px; margin-top: 6px; }
  .screen-nav { display: flex; gap: 8px; justify-content: center; padding: 16px 0 20px; flex-wrap: wrap; }
  .screen-btn {
    background: ${P.surface}; color: ${P.fg2};
    border: 1px solid ${P.border}; border-radius: 8px;
    padding: 7px 16px; font-size: 11px; font-weight: 700; letter-spacing: 1px; cursor: pointer;
    transition: all .2s; font-family: 'Inter', sans-serif;
  }
  .screen-btn.active { background: ${P.teal}18; color: ${P.teal}; border-color: ${P.teal}55; }
  .screen-btn:hover:not(.active) { border-color: ${P.border2}; color: ${P.fg}; }
  canvas { display: block; border-radius: 16px; box-shadow: 0 0 0 1px ${P.border2}, 0 32px 80px rgba(0,0,0,0.6); }
</style>
</head>
<body>
<div class="viewer-header">
  <div class="viewer-title">SOLUS</div>
  <div class="viewer-sub">FINANCIAL OS FOR ONE-PERSON COMPANIES · RAM DESIGN STUDIO · MAR 20, 2026</div>
</div>
<div class="screen-nav" id="nav"></div>
<canvas id="c" width="375" height="812"></canvas>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};
(function(){
  const doc = JSON.parse(window.EMBEDDED_PEN);
  const screens = doc.children || [];
  let current = 0;
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const nav = document.getElementById('nav');
  const names = ['Dashboard','Transactions','Invoice Builder','Cash Flow','Financial Health'];

  function drawNode(node, ox, oy) {
    const x = (node.x || 0) + ox;
    const y = (node.y || 0) + oy;
    const w = node.width || 0;
    const h = node.height || 0;
    if (w <= 0 || h <= 0) return;
    ctx.save();
    if (node.opacity !== undefined) ctx.globalAlpha *= node.opacity;

    if (node.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
      if (node.fill && node.fill !== 'transparent') { ctx.fillStyle = node.fill; ctx.fill(); }
      if (node.stroke) { ctx.strokeStyle = node.stroke.fill; ctx.lineWidth = node.stroke.thickness || 1; ctx.stroke(); }
    } else if (node.type === 'text') {
      const sz = node.fontSize || 13;
      const fw = node.fontWeight || '400';
      const ff = node.fontFamily || 'Inter, system-ui, sans-serif';
      ctx.font = fw + ' ' + sz + 'px ' + ff;
      ctx.fillStyle = node.fill || '${P.fg}';
      ctx.textBaseline = 'top';
      const lines = (node.content || '').split('\\n');
      const lh = node.lineHeight ? sz * node.lineHeight : sz * 1.35;
      lines.forEach((line, li) => {
        if (node.textAlign === 'center') { ctx.textAlign = 'center'; ctx.fillText(line, x + w/2, y + li * lh, w); }
        else if (node.textAlign === 'right') { ctx.textAlign = 'right'; ctx.fillText(line, x + w, y + li * lh, w); }
        else { ctx.textAlign = 'left'; ctx.fillText(line, x, y + li * lh, w); }
      });
    } else {
      const r = node.cornerRadius || 0;
      if (node.fill && node.fill !== 'transparent') {
        ctx.fillStyle = node.fill;
        if (r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
        else ctx.fillRect(x, y, w, h);
      }
      if (node.stroke) {
        ctx.strokeStyle = node.stroke.fill;
        ctx.lineWidth = node.stroke.thickness || 1;
        if (r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke(); }
        else ctx.strokeRect(x, y, w, h);
      }
      for (const child of (node.children || [])) drawNode(child, x, y);
    }
    ctx.restore();
  }

  function render() {
    const s = screens[current];
    ctx.clearRect(0, 0, 375, 812);
    ctx.fillStyle = s.fill || '${P.bg}';
    ctx.fillRect(0, 0, 375, 812);
    for (const child of (s.children || [])) drawNode(child, 0, 0);
  }

  function buildNav() {
    nav.innerHTML = '';
    screens.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'screen-btn' + (i === current ? ' active' : '');
      btn.textContent = (names[i] || 'S' + (i + 1)).toUpperCase();
      btn.onclick = () => { current = i; buildNav(); render(); };
      nav.appendChild(btn);
    });
  }

  buildNav();
  render();
})();
</script>
</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n◈  SOLUS — Design Discovery Pipeline`);
  console.log(`   ${DATE_STR}\n`);

  // Step 1: Publish hero page
  console.log(`📄 Publishing hero → ram.zenbin.org/${SLUG}`);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML, 'ram');
  console.log(`   Status: ${heroRes.status}`);
  if (heroRes.status !== 201 && heroRes.status !== 200) {
    console.log(`   Body: ${heroRes.body?.slice(0, 200)}`);
  }

  // Step 2: Publish viewer
  console.log(`\n🔭 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}`);
  const viewerHTML = buildViewerHTML(penJsonStr);
  const viewerRes  = await post(VIEWER_SLUG, `${APP_NAME} — Viewer · RAM`, viewerHTML, 'ram');
  console.log(`   Status: ${viewerRes.status}`);
  if (viewerRes.status !== 201 && viewerRes.status !== 200) {
    console.log(`   Body: ${viewerRes.body?.slice(0, 200)}`);
  }

  // Step 3: Push to gallery queue
  console.log(`\n📬 Pushing to gallery queue`);
  const galleryEntry = {
    id:           `solus-heartbeat-${Date.now()}`,
    name:         APP_NAME,
    tagline:      TAGLINE,
    slug:         SLUG,
    design_url:   heroURL,
    viewer_url:   `https://ram.zenbin.org/${VIEWER_SLUG}`,
    archetype:    'Indie Finance OS',
    palette:      { bg: P.bg, fg: P.fg, accent: P.teal, accent2: P.ice },
    submitted_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
  };
  const queueRes = await pushGalleryEntry(galleryEntry);
  console.log(`   Status: ${queueRes.status}`);

  console.log(`\n✅ SOLUS published!`);
  console.log(`   Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery\n`);
}

main().catch(e => { console.error('Pipeline error:', e.message); process.exit(1); });
