'use strict';
// publish-folia-heartbeat.js
// Full Design Discovery pipeline for FOLIA
// Design Heartbeat — Mar 20, 2026
// Inspired by:
//   • Midday.ai (darkmodedesign.com) — dark professional finance surface, AI assistant, bento grid
//   • OWO (lapa.ninja) — ultra-clean minimal dark finance UI, WhatsApp money transfer
//   • MoMoney / Moneda (lapa.ninja) — personal finance dark cards, emerald/amber palette
//   • Stripe Sessions 2026 (godly.website) — editorial typography rhythm, high contrast

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'folia-heartbeat';
const VIEWER_SLUG = 'folia-viewer';
const DATE_STR    = 'March 20, 2026';
const APP_NAME    = 'FOLIA';
const TAGLINE     = 'AI finance intelligence for independent creatives';

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#080E0B',
  surface:   '#0F1A14',
  surface2:  '#162110',
  surface3:  '#1C2B18',
  border:    '#1E2E1E',
  border2:   '#2A3E28',
  emerald:   '#2ECC8A',
  emeraldHi: '#4FFAAA',
  amber:     '#E8A832',
  amberHi:   '#FFBE4A',
  red:       '#F87171',
  blue:      '#6BCFFF',
  fg:        '#EEF0EC',
  fg2:       '#8A9A88',
  fg3:       '#4A5648',
  mono:      '#A8BCA8',
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
  const putBody = JSON.stringify({ message: `Add ${entry.name} to queue`, content, ...(sha ? { sha } : {}) });

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
    const safe = (node.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0, 60);
    out += `<text x="${tx}" y="${y + sz}" font-size="${sz}" fill="${col}" font-weight="${fw}" text-anchor="${anch}"${op}>${safe}</text>`;
  } else {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}${op}/>`;
    for (const child of (node.children || [])) {
      out += renderNode({ ...child, x: (node.x||0) + (child.x||0), y: (node.y||0) + (child.y||0) }, scale);
    }
  }
  return out;
}

// ── Load screens ───────────────────────────────────────────────────────────────
const penJson  = JSON.parse(fs.readFileSync(path.join(__dirname, 'folia.pen'), 'utf8'));
const screens  = penJson.children || [];

function screenThumbSVG(screen, tw, th) {
  const scale = Math.min(tw / screen.width, th / screen.height);
  const svgW  = Math.round(screen.width  * scale);
  const svgH  = Math.round(screen.height * scale);
  let inner = '';
  for (const child of (screen.children || [])) {
    inner += renderNode({ ...child, x: child.x||0, y: child.y||0 }, scale);
  }
  return `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="border-radius:10px;display:block;box-shadow:0 0 0 1px ${P.border2}">
    <rect width="${svgW}" height="${svgH}" fill="${screen.fill || P.bg}"/>
    ${inner}
  </svg>`;
}

// ── Thumbnails ─────────────────────────────────────────────────────────────────
const THUMB_H = 200;
const SCREEN_NAMES = ['Dashboard', 'Cash Flow', 'Invoices', 'Ask FOLIA', 'Tax Prep'];
const thumbsHTML = screens.map((s, i) => {
  const tw = Math.round(THUMB_H * (s.width / s.height));
  return `<div style="text-align:center;flex-shrink:0">
    ${screenThumbSVG(s, tw, THUMB_H)}
    <div style="font-size:9px;color:${P.fg2};margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(SCREEN_NAMES[i]||'SCREEN '+(i+1)).toUpperCase()}</div>
  </div>`;
}).join('');

// ── CSS Tokens ─────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* Color */
  --color-bg:        ${P.bg};
  --color-surface:   ${P.surface};
  --color-surface2:  ${P.surface2};
  --color-border:    ${P.border};
  --color-border2:   ${P.border2};
  --color-emerald:   ${P.emerald};
  --color-amber:     ${P.amber};
  --color-red:       ${P.red};
  --color-blue:      ${P.blue};
  --color-fg:        ${P.fg};
  --color-fg2:       ${P.fg2};
  --color-fg3:       ${P.fg3};
  --color-mono:      ${P.mono};

  /* Typography */
  --font-family:  'Inter', 'Helvetica Neue', system-ui, sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 800 clamp(36px, 10vw, 72px) / 1 var(--font-family);
  --font-heading: 700 22px / 1.3 var(--font-family);
  --font-body:    400 13px / 1.6 var(--font-family);
  --font-label:   700 9px / 1 var(--font-family);
  --font-data:    600 14px / 1 var(--font-mono);

  /* Spacing (4px base) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-card:    0 0 0 1px ${P.border};
  --shadow-emerald: 0 0 32px ${P.emerald}22;
  --shadow-amber:   0 0 24px ${P.amber}22;
}`;

// ── PRD ────────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>FOLIA is an AI-powered freelance finance intelligence app for independent creatives and solo consultants. It automates the tedious parts of freelance money management — categorising transactions, predicting cash flow, preparing tax estimates, and chasing invoices — through a conversational AI interface that speaks plainly about your money. Inspired by Midday.ai's dark professional aesthetic, OWO's minimal money UI, and the emerging "AI explains your finances" SaaS trend observed on darkmodedesign.com and lapa.ninja.</p>

<h3>TARGET USERS</h3>
<ul>
  <li><strong>Independent designers, developers, and copywriters</strong> earning $60K–$300K annually across multiple clients</li>
  <li><strong>Solo consultants</strong> transitioning from salaried roles who need to manage quarterly taxes for the first time</li>
  <li><strong>Freelancers with 3–10 active clients</strong> juggling multiple invoices, retainers, and project milestones</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
  <li><strong>Dashboard</strong> — Net income bento grid, AI insight strip with proactive nudges, recent transactions, real-time sparkline</li>
  <li><strong>Cash Flow</strong> — Weekly waterfall chart (income vs expenses), AI narrative summary, category percentage breakdown</li>
  <li><strong>Invoice Tracker</strong> — Card-based invoice list with OVERDUE/PENDING/SENT/PAID status, one-tap reminders, quick actions</li>
  <li><strong>Ask FOLIA AI</strong> — Conversational money intelligence: "Which client made me the most?" / "Should I raise my rates?" / "Draft a rate increase email"</li>
  <li><strong>Tax Prep</strong> — Automated quarterly tax estimate (25% SE rate), deduction breakdown, accountant invite, PDF/CSV export</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<p>FOLIA's design language fuses four reference points discovered during the March 20, 2026 research session:</p>
<ul>
  <li><strong>Midday.ai dark surface system</strong> (darkmodedesign.com) — deep professional dark #080E0B (not generic dark grey), bento grid data architecture, embedded AI "Ask anything" interface. The Midday approach of treating AI as a first-class citizen rather than a gimmick.</li>
  <li><strong>OWO minimal finance clarity</strong> (lapa.ninja) — clean card hierarchy, brand color only on CTAs and positive states, zero decorative clutter. Every pixel has a data job.</li>
  <li><strong>Emerald as income signal</strong> — #2ECC8A emerald is used exclusively for positive money flow: income, paid status, confirmed states, the AI avatar glow. Amber #E8A832 for warnings and pending. Red #F87171 for expenses and overdue only.</li>
  <li><strong>Forest metaphor palette</strong> — The deep forest dark (#080E0B) and surface greens create a distinctive visual identity that differentiates FOLIA from the navy/midnight blues of typical fintech dark modes.</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
  <li><strong>S1 · Dashboard</strong> — Net income hero with sparkline, AI insight strip (proactive nudge), 2×2 bento grid, recent transactions list</li>
  <li><strong>S2 · Cash Flow</strong> — Month toggle, weekly waterfall chart, AI narrative summary card, category breakdown with progress bars</li>
  <li><strong>S3 · Invoices</strong> — Filter tabs (All/Paid/Pending/Draft), outstanding summary, card list with status pills + quick actions</li>
  <li><strong>S4 · Ask FOLIA</strong> — AI avatar with status pulse, quick action chips, conversational message thread, minimal input bar</li>
  <li><strong>S5 · Tax Prep</strong> — Q1 tax estimate hero with percentage dial, deduction table with AUTO/MANUAL flags, export CTA, accountant invite</li>
</ul>`;

// ── Swatches ───────────────────────────────────────────────────────────────────
const swatches = [
  { hex: P.bg,      role: 'FOREST DARK'  },
  { hex: P.surface, role: 'SURFACE'      },
  { hex: P.fg,      role: 'FOREGROUND'   },
  { hex: P.emerald, role: 'INCOME'       },
  { hex: P.amber,   role: 'PENDING'      },
  { hex: P.red,     role: 'EXPENSE'      },
  { hex: P.blue,    role: 'AI DATA'      },
];
const swatchHTML = swatches.map(sw => `
  <div style="flex:1;min-width:70px">
    <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border2};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.fg2};margin-bottom:3px">${sw.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.emerald}">${sw.hex}</div>
  </div>`).join('');

// ── Type scale ─────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label:'DISPLAY',  size:'48px', weight:'800', sample: '+$14,280',                                       ls: '0'   },
  { label:'HEADING',  size:'22px', weight:'800', sample: 'Cash Flow'                                               },
  { label:'BODY',     size:'13px', weight:'400', sample: 'Your best month yet — 3 invoices still unpaid.'          },
  { label:'LABEL',    size:'9px',  weight:'700', sample: 'NET INCOME · MARCH 2026 · AUTO-RESERVE ON',     ls: '2px' },
  { label:'DATA',     size:'14px', weight:'600', sample: 'INV-2026-041 · OVERDUE · DUE MAR 24',   font: 'monospace' },
].map(t => `
  <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.fg2};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.font||'inherit'};letter-spacing:${t.ls||'normal'}">${t.sample}</div>
  </div>`).join('');

// ── Spacing ─────────────────────────────────────────────────────────────────────
const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
    <div style="font-size:9px;color:${P.fg2};width:28px;flex-shrink:0">${sp}px</div>
    <div style="height:6px;border-radius:3px;background:${P.emerald};width:${sp * 1.8}px;opacity:0.6"></div>
  </div>`).join('');

// ── Design principles ──────────────────────────────────────────────────────────
const principlesHTML = [
  ['01', `Semantic color — emerald #2ECC8A is income only, amber #E8A832 is pending/warning only, red #F87171 is expense/overdue only. This means color has information value: you can scan the screen and understand money direction before reading a single number.`],
  ['02', `Forest dark over generic midnight — #080E0B (not #1a1a1a or #0f1117) gives FOLIA a distinctive warm-dark identity. The slight green undertone connects the UI to the emerald palette and makes the brand feel coherent from background to accent.`],
  ['03', `AI as co-pilot, not widget — the FOLIA AI appears as a glowing presence throughout: insight strip on Dashboard, narrative card on Cash Flow, full conversation on Ask FOLIA. The AI is never in a modal or hidden behind a button; it surfaces proactively where the data is.`],
].map(([n, p]) => `
  <div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start">
    <div style="font-size:11px;font-weight:700;color:${P.emerald};flex-shrink:0;margin-top:2px;font-family:monospace">${n}</div>
    <div style="font-size:13px;color:${P.fg2};line-height:1.7">${p}</div>
  </div>`).join('');

// ── Hero HTML ──────────────────────────────────────────────────────────────────
const penJsonStr  = fs.readFileSync(path.join(__dirname, 'folia.pen'), 'utf8');
const heroURL     = `https://ram.zenbin.org/${SLUG}`;
const viewerURL   = `https://ram.zenbin.org/${VIEWER_SLUG}`;
const galleryURL  = `https://ram.zenbin.org/gallery`;
const promptText  = `Design FOLIA — an AI-powered freelance finance intelligence app for independent creatives. Inspired by Midday.ai's dark professional bento + AI assistant (darkmodedesign.com), OWO's minimal money UI (lapa.ninja), and the emerging "AI explains your finances" SaaS trend. 5 mobile screens: Dashboard bento grid with AI insight strip, Cash Flow waterfall chart with AI narrative, Invoice Tracker with status pills + quick actions, Ask FOLIA conversational AI, and Tax Prep with automated deduction breakdown. Palette: #080E0B forest dark, #2ECC8A emerald (income), #E8A832 amber (pending), #6BCFFF AI blue.`;
const shareText   = encodeURIComponent(`FOLIA — AI finance intelligence for independent creatives. Built by RAM Design Studio.`);

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — Design System · RAM Design Studio</title>
<meta name="description" content="${TAGLINE}">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { background: ${P.bg}; color: ${P.fg}; font-family: 'Inter', system-ui, sans-serif; scroll-behavior: smooth; }
  body { min-height: 100vh; }
  a { color: ${P.emerald}; text-decoration: none; }
  a:hover { text-decoration: underline; }

  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 24px 60px;
    position: relative; overflow: hidden; text-align: center;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 500px 350px at 50% 55%, ${P.emerald}10, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 4px; color: ${P.emerald}; margin-bottom: 20px; }
  .hero-title { font-size: clamp(64px, 14vw, 130px); font-weight: 800; letter-spacing: 10px; line-height: 0.92; color: ${P.fg}; margin-bottom: 20px; }
  .hero-tagline { font-size: clamp(14px, 2vw, 18px); color: ${P.fg2}; max-width: 520px; line-height: 1.7; margin-bottom: 40px; }
  .hero-meta { font-size: 11px; color: ${P.fg3}; letter-spacing: 1.5px; margin-bottom: 48px; }

  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 20px; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 22px; border-radius: 8px; font-size: 12px; font-weight: 700;
    letter-spacing: 1.5px; cursor: pointer; text-decoration: none !important;
    border: 1px solid transparent; transition: opacity .2s, background .2s;
  }
  .btn:hover { opacity: 0.85; }
  .btn-primary   { background: ${P.emerald}; color: ${P.bg}; }
  .btn-secondary { background: transparent; color: ${P.fg}; border-color: ${P.border2}; }
  .btn-ghost     { background: transparent; color: ${P.amber}; border-color: ${P.amber}44; }
  .btn-x         { background: #000; color: #fff; border-color: #333; }

  section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
  .section-label { font-size: 9px; font-weight: 700; letter-spacing: 3px; color: ${P.fg3}; margin-bottom: 16px; }

  .thumbs-section { padding: 60px 0; overflow: hidden; }
  .thumbs-scroll {
    display: flex; gap: 20px; overflow-x: auto; padding: 0 40px 20px;
    scrollbar-width: thin; scrollbar-color: ${P.border2} transparent;
    justify-content: center; flex-wrap: wrap;
  }

  .card { background: ${P.surface}; border: 1px solid ${P.border}; border-radius: 12px; padding: 24px; }
  .brand-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
  @media (max-width: 760px) { .brand-grid { grid-template-columns: 1fr; } }
  .palette-row { display: flex; gap: 12px; flex-wrap: wrap; }

  .tokens-block {
    background: ${P.surface2}; border: 1px solid ${P.border2}; border-radius: 8px;
    padding: 24px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px;
    color: ${P.fg2}; white-space: pre; overflow-x: auto; position: relative;
  }
  .copy-btn {
    position: absolute; top: 16px; right: 16px;
    background: ${P.emerald}; color: ${P.bg}; border: none;
    border-radius: 6px; font-size: 10px; font-weight: 700; letter-spacing: 1px;
    padding: 6px 14px; cursor: pointer; font-family: inherit;
  }
  .copy-btn:hover { background: ${P.emeraldHi}; }

  .prd-body h3 { font-size: 13px; font-weight: 700; letter-spacing: 2px; color: ${P.emerald}; margin: 24px 0 10px; }
  .prd-body p, .prd-body li { font-size: 13px; color: ${P.fg2}; line-height: 1.8; }
  .prd-body ul { padding-left: 20px; }
  .prd-body li { margin-bottom: 6px; }
  .prd-body strong { color: ${P.fg}; font-weight: 600; }

  footer { border-top: 1px solid ${P.border}; padding: 40px 24px; text-align: center; font-size: 11px; color: ${P.fg3}; }
  .footer-logo { font-size: 14px; font-weight: 800; letter-spacing: 3px; color: ${P.fg2}; margin-bottom: 8px; }
</style>
</head>
<body>

<div class="hero">
  <div class="hero-eyebrow">RAM DESIGN STUDIO · ${DATE_STR}</div>
  <div class="hero-title">FOLIA</div>
  <div class="hero-tagline">${TAGLINE}</div>
  <div class="hero-meta">AI FINANCE · 5 SCREENS · FREELANCE · DARK · MOBILE</div>

  <div class="btn-row">
    <a class="btn btn-primary" href="${viewerURL}" target="_blank">Open in Viewer</a>
    <a class="btn btn-secondary" href="${galleryURL}" target="_blank">Gallery</a>
    <a class="btn btn-ghost" onclick="document.getElementById('tokens').scrollIntoView({behavior:'smooth'})">CSS Tokens</a>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(heroURL)}" target="_blank">Share on X</a>
  </div>
</div>

<div class="thumbs-section">
  <div class="section-label" style="text-align:center;padding-bottom:20px">SCREEN ARCHITECTURE · 5 MOBILE SCREENS</div>
  <div class="thumbs-scroll">${thumbsHTML}</div>
</div>

<section>
  <div class="section-label">ORIGINAL PROMPT</div>
  <div class="card">
    <p style="font-size:16px;font-style:italic;color:${P.fg};line-height:1.8;max-width:800px">"${promptText}"</p>
  </div>
</section>

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
      <div style="margin-top:24px">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${P.fg2};margin-bottom:16px">DESIGN PRINCIPLES</div>
        ${principlesHTML}
      </div>
    </div>
  </div>
</section>

<section id="tokens">
  <div class="section-label">CSS DESIGN TOKENS</div>
  <div style="position:relative">
    <div class="tokens-block" id="token-code">${cssTokens}</div>
    <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('token-code').innerText).then(()=>{this.textContent='COPIED!';setTimeout(()=>{this.textContent='COPY TOKENS'},1500)})">COPY TOKENS</button>
  </div>
</section>

<section>
  <div class="section-label">PRODUCT BRIEF</div>
  <div class="card prd-body">${prd}</div>
</section>

<section style="text-align:center;padding-top:40px;padding-bottom:80px">
  <div class="section-label" style="margin-bottom:24px">EXPLORE THIS DESIGN</div>
  <div class="btn-row">
    <a class="btn btn-primary" href="${viewerURL}" target="_blank">Open in Viewer</a>
    <a class="btn btn-ghost" href="${galleryURL}" target="_blank">View Gallery</a>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(heroURL)}" target="_blank">Share on X</a>
  </div>
</section>

<footer>
  <div class="footer-logo">RAM</div>
  <div>RAM Design Studio · AI-generated design systems</div>
  <div style="margin-top:8px">
    <a href="${heroURL}">Hero Page</a> ·
    <a href="${viewerURL}">Viewer</a> ·
    <a href="${galleryURL}">Gallery</a>
  </div>
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
<title>FOLIA — Viewer · RAM</title>
<style>
  body { background: ${P.bg}; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Inter', sans-serif; }
  #viewer-root { width: 375px; max-width: 100vw; }
  .screen-nav { display: flex; gap: 8px; justify-content: center; padding: 16px 0; flex-wrap: wrap; }
  .screen-btn { background: ${P.surface}; color: ${P.fg3}; border: 1px solid ${P.border}; border-radius: 6px; padding: 6px 14px; font-size: 11px; font-weight: 700; letter-spacing: 1px; cursor: pointer; }
  .screen-btn.active { background: ${P.emerald}22; color: ${P.emerald}; border-color: ${P.emerald}44; }
  canvas { display: block; border-radius: 12px; }
  .viewer-header { text-align: center; padding: 24px 0 8px; }
  .viewer-title { font-size: 20px; font-weight: 800; letter-spacing: 4px; color: ${P.emerald}; }
  .viewer-sub { font-size: 10px; color: ${P.fg3}; letter-spacing: 2px; margin-top: 4px; }
</style>
</head>
<body>
<div id="viewer-root">
  <div class="viewer-header">
    <div class="viewer-title">FOLIA</div>
    <div class="viewer-sub">AI FINANCE INTELLIGENCE · RAM DESIGN STUDIO</div>
  </div>
  <div class="screen-nav" id="nav"></div>
  <canvas id="c" width="375" height="812"></canvas>
</div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};

(function(){
  const doc = JSON.parse(window.EMBEDDED_PEN);
  const screens = doc.children || [];
  let current = 0;

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const nav = document.getElementById('nav');
  const names = ['Dashboard','Cash Flow','Invoices','Ask FOLIA','Tax Prep'];

  function drawNode(node, ox, oy) {
    const x = (node.x||0) + ox;
    const y = (node.y||0) + oy;
    const w = node.width||0;
    const h = node.height||0;
    if (w <= 0 || h <= 0) return;

    ctx.save();
    if (node.opacity !== undefined) ctx.globalAlpha *= node.opacity;

    if (node.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, Math.PI*2);
      if (node.fill && node.fill !== 'transparent') { ctx.fillStyle = node.fill; ctx.fill(); }
      if (node.stroke) { ctx.strokeStyle = node.stroke.fill; ctx.lineWidth = node.stroke.thickness||1; ctx.stroke(); }
    } else if (node.type === 'text') {
      const sz = node.fontSize || 13;
      const fw = node.fontWeight || '400';
      const ff = node.fontFamily || 'Inter, system-ui, sans-serif';
      ctx.font = fw + ' ' + sz + 'px ' + ff;
      ctx.fillStyle = node.fill || '${P.fg}';
      ctx.textBaseline = 'top';
      const lines = (node.content||'').split('\\n');
      const lh = node.lineHeight ? sz * node.lineHeight : sz * 1.3;
      lines.forEach((line, li) => {
        let tx = x;
        if (node.textAlign === 'center') { ctx.textAlign = 'center'; tx = x + w/2; }
        else if (node.textAlign === 'right') { ctx.textAlign = 'right'; tx = x + w; }
        else ctx.textAlign = 'left';
        ctx.fillText(line, tx, y + li * lh, w);
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
        ctx.lineWidth = node.stroke.thickness||1;
        if (r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke(); }
        else ctx.strokeRect(x, y, w, h);
      }
      for (const child of (node.children||[])) drawNode(child, x, y);
    }
    ctx.restore();
  }

  function render() {
    const s = screens[current];
    ctx.clearRect(0, 0, 375, 812);
    ctx.fillStyle = s.fill || '${P.bg}';
    ctx.fillRect(0, 0, 375, 812);
    for (const child of (s.children||[])) drawNode(child, 0, 0);
  }

  function buildNav() {
    nav.innerHTML = '';
    screens.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'screen-btn' + (i === current ? ' active' : '');
      btn.textContent = (names[i]||'S'+(i+1)).toUpperCase();
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
  console.log(`\n🌿 FOLIA — Design Discovery Pipeline`);
  console.log(`   ${DATE_STR}\n`);

  console.log(`📄 Publishing hero page → ram.zenbin.org/${SLUG}`);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML, 'ram');
  console.log(`   Status: ${heroRes.status}`);
  if (heroRes.status !== 201 && heroRes.status !== 200) {
    console.log(`   Body: ${heroRes.body?.slice(0,200)}`);
  }

  console.log(`\n🔭 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}`);
  const viewerHTML = buildViewerHTML(penJsonStr);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} — Viewer`, viewerHTML, 'ram');
  console.log(`   Status: ${viewerRes.status}`);

  const heroURL2 = `https://ram.zenbin.org/${SLUG}`;
  console.log(`\n📬 Pushing to gallery queue → github.com/${GITHUB_REPO}`);
  const galleryEntry = {
    id:           `folia-heartbeat-${Date.now()}`,
    name:         APP_NAME,
    tagline:      TAGLINE,
    slug:         SLUG,
    design_url:   heroURL2,
    viewer_url:   `https://ram.zenbin.org/${VIEWER_SLUG}`,
    archetype:    'Freelance Finance AI',
    palette:      { bg: P.bg, fg: P.fg, accent: P.emerald, accent2: P.amber },
    submitted_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
  };
  const queueRes = await pushGalleryEntry(galleryEntry);
  console.log(`   Status: ${queueRes.status}`);

  console.log(`\n✅ FOLIA published!`);
  console.log(`   Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery\n`);
}

main().catch(e => { console.error('Pipeline error:', e.message); process.exit(1); });
