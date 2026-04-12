'use strict';
// publish-till-heartbeat.js
// TILL — Zero-Admin Revenue OS for Freelancers
// Design Heartbeat Publish Script — Mar 19, 2026

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'till-heartbeat';
const VIEWER_SLUG = 'till-heartbeat-viewer';
const APP_NAME    = 'TILL';
const TAGLINE     = 'The zero-admin revenue OS for freelancers.';
const ARCHETYPE   = 'fintech / productivity';
const SUB_ID      = 'heartbeat-till-' + Date.now();
const PROMPT      = 'Design a dark-mode micro-revenue dashboard for solo freelancers — inspired by Midday.ai\'s near-void dark financial UI and Moneda\'s "money that finally works for you" fintech aesthetic. Amber gold on aubergine-black. Tabular data meets warmth.';

// Palette — aubergine dark + amber gold
const P = {
  bg:      '#06050A',
  surface: '#0C0B12',
  border:  '#1E1C2E',
  fg:      '#EDE9FF',
  accent:  '#F0A432',
  accent2: '#A78BFA',
};

function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111111').replace('#',''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}
const surface = lightenHex(P.bg, 14);
const border  = lightenHex(P.bg, 28);

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

async function getQueueSha() {
  const r = await new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Accept': 'application/vnd.github.v3+json',
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
  if (r.status !== 200) throw new Error('Cannot get SHA: ' + r.status);
  return JSON.parse(r.body).sha;
}

async function pushGalleryEntry(entry) {
  let queue;
  try {
    const raw = await new Promise((resolve) => {
      const opts = {
        hostname: 'raw.githubusercontent.com',
        path: `/${GITHUB_REPO}/main/queue.json`,
        method: 'GET',
        headers: { 'User-Agent': 'design-studio-agent/1.0' },
      };
      const req = https.request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(d));
      });
      req.on('error', () => resolve('{"submissions":[]}'));
      req.end();
    });
    queue = JSON.parse(raw);
  } catch { queue = { submissions: [] }; }

  queue.submissions.push(entry);
  const sha = await getQueueSha();
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `add: till-heartbeat — freelancer revenue OS dark design`,
    content,
    sha,
  });
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/vnd.github.v3+json',
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

// ── Screen thumbnail SVG ──────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / screen.width;
  const scaleY = th / screen.height;
  const scale  = Math.min(scaleX, scaleY);

  function renderEl(el) {
    if (!el) return '';
    const x = (el.x || 0) * scale;
    const y = (el.y || 0) * scale;
    const w = Math.max(1, (el.width  || 0) * scale);
    const h = Math.max(1, (el.height || 0) * scale);
    const fill   = el.fill   || 'transparent';
    const r2     = el.cornerRadius ? el.cornerRadius * scale : 0;
    const stroke = el.stroke ? el.stroke.fill : null;
    const sw     = el.stroke ? (el.stroke.thickness || 1) * scale : 0;
    const op     = el.opacity !== undefined ? el.opacity : 1;
    const children = (el.children || []).map(renderEl).join('');

    if (el.type === 'text') {
      const fs = Math.max(4, Math.round((el.fontSize || 12) * scale));
      const fw = el.fontWeight || '400';
      const ta = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
      const tx = el.textAlign === 'center' ? x + w / 2 : el.textAlign === 'right' ? x + w : x;
      const content = (el.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text x="${tx.toFixed(1)}" y="${(y + h * 0.72).toFixed(1)}" font-size="${fs}" font-weight="${fw}" fill="${fill}" text-anchor="${ta}" opacity="${op}" clip-path="none">${content.substring(0, 24)}</text>`;
    }
    if (el.type === 'ellipse') {
      const cx2 = x + w / 2, cy2 = y + h / 2;
      return `<ellipse cx="${cx2.toFixed(1)}" cy="${cy2.toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}" opacity="${op}"${stroke ? ` stroke="${stroke}" stroke-width="${sw.toFixed(1)}"` : ''}/>${children}`;
    }
    // frame or rectangle
    const clipId = el.clip ? `clip-${el.id}` : null;
    let out = '';
    if (clipId) out += `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${r2.toFixed(1)}"/></clipPath>`;
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${r2.toFixed(1)}" fill="${fill}" opacity="${op}"${stroke ? ` stroke="${stroke}" stroke-width="${sw.toFixed(1)}"` : ''}/>`;
    if (children) {
      out += clipId ? `<g clip-path="url(#${clipId})">${children}</g>` : `<g>${children}</g>`;
    }
    return out;
  }

  const svgW = tw, svgH = Math.round(screen.height * scale);
  return `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;flex-shrink:0">
  <rect width="${svgW}" height="${svgH}" fill="${screen.fill || P.bg}"/>
  ${(screen.children || []).map(renderEl).join('\n  ')}
</svg>`;
}

// ── Simplified thumbnail SVG (fast, small) ────────────────────────────────────
function screenThumbSVGSimple(screen, tw, th, idx) {
  const bgFill = screen.fill || P.bg;
  // Render only top-level direct children as simple colored rects/text
  const scale = Math.min(tw / screen.width, th / screen.height);
  const svgH = Math.round(screen.height * scale);
  const children = (screen.children || []).slice(0, 60).map(el => {
    if (!el) return '';
    const x = ((el.x || 0) * scale).toFixed(1);
    const y = ((el.y || 0) * scale).toFixed(1);
    const w = Math.max(1, (el.width || 0) * scale).toFixed(1);
    const h = Math.max(1, (el.height || 0) * scale).toFixed(1);
    const fill = el.fill || 'transparent';
    const op = el.opacity !== undefined ? el.opacity : 1;
    const r2 = el.cornerRadius ? (el.cornerRadius * scale).toFixed(1) : 0;
    if (el.type === 'text') {
      const fs = Math.max(3, Math.round((el.fontSize || 12) * scale));
      return `<text x="${x}" y="${(parseFloat(y) + parseFloat(h) * 0.75).toFixed(1)}" font-size="${fs}" fill="${fill}" opacity="${op}">${(el.content || '').substring(0,8)}</text>`;
    }
    if (el.type === 'ellipse') {
      const cx2 = (parseFloat(x) + parseFloat(w)/2).toFixed(1);
      const cy2 = (parseFloat(y) + parseFloat(h)/2).toFixed(1);
      return `<ellipse cx="${cx2}" cy="${cy2}" rx="${(parseFloat(w)/2).toFixed(1)}" ry="${(parseFloat(h)/2).toFixed(1)}" fill="${fill}" opacity="${op}"/>`;
    }
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r2}" fill="${fill}" opacity="${op}"/>`;
  }).join('');
  return `<svg width="${tw}" height="${svgH}" viewBox="0 0 ${tw} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;overflow:hidden;flex-shrink:0;border:1px solid #1E1C2E">
  <rect width="${tw}" height="${svgH}" fill="${bgFill}"/>
  ${children}
</svg>`;
}

// ── Build hero HTML ───────────────────────────────────────────────────────────
// NOTE: We do NOT embed the full pen data here (330 KB → 440 KB base64 = too large).
// Instead we link to the viewer slug where the pen is injected separately.
function buildHeroHTML(penJson, viewerSlug) {
  const doc = JSON.parse(penJson);
  const screens = doc.children || [];

  const THUMB_H = 180;
  const screenNames = [
    'Dashboard', 'Invoice Composer', 'Time Tracker', 'Client Ledger', 'Analytics',
    'Dashboard', 'Invoice Manager', 'Time Tracker', 'Client Profile', 'Analytics',
  ];

  // Use simplified SVG thumbnails to keep hero page under 512 KB
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = `${isMobile ? 'M' : 'D'} · ${screenNames[i] || (isMobile ? 'MOBILE' : 'DESKTOP')}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVGSimple(s, tw, THUMB_H, i)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'BACKGROUND'  },
    { hex: P.surface, role: 'SURFACE'     },
    { hex: P.fg,      role: 'FOREGROUND'  },
    { hex: P.accent,  role: 'PRIMARY'     },
    { hex: P.accent2, role: 'SECONDARY'   },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:80px">
      <div style="height:64px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:10px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:12px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'48px', weight:'900', sample: APP_NAME },
    { label:'HEADING',  size:'24px', weight:'700', sample: TAGLINE },
    { label:'BODY',     size:'14px', weight:'400', sample: 'The quick brown fox jumps over the lazy dog.' },
    { label:'CAPTION',  size:'10px', weight:'400', sample: 'LABEL · METADATA · UI ELEMENT' },
  ].map(t => `
    <div style="padding:16px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:8px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${P.accent};width:${sp*2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color */
  --color-bg:        ${P.bg};
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        ${P.fg};
  --color-primary:   ${P.accent};
  --color-secondary: ${P.accent2};

  /* Typography */
  --font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:  900 clamp(48px, 8vw, 96px) / 1 var(--font-family);
  --font-heading:  700 24px / 1.3 var(--font-family);
  --font-body:     400 14px / 1.6 var(--font-family);
  --font-caption:  400 10px / 1 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 16px;  --radius-full: 9999px;
}`;

  const shareText = encodeURIComponent(
    `TILL — AI-generated dark-mode revenue OS for freelancers. 10 screens + brand spec + CSS tokens. Built by RAM Design Studio`
  );

  const principles = [
    'Revenue clarity over feature bloat — one number that always tells the truth.',
    'Dark-first, warm-accented — aubergine black + amber gold create premium calm.',
    'Tabular precision meets human warmth — data you can trust, in a space you want to return to.',
  ];

  const prdHTML = `
    <h3>OVERVIEW</h3>
    <p>TILL is a zero-admin revenue operating system for freelancers and solo creators. Named after the cash drawer — the single place where all money flows through — TILL unifies invoicing, time tracking, client management, and revenue analytics in one dark, calm, data-rich interface.</p>
    <h3>TARGET USERS</h3>
    <ul>
      <li><strong>Solo freelancers</strong> — designers, developers, consultants billing 3–12 clients</li>
      <li><strong>Indie consultants</strong> — strategy, coaching, advisory roles with recurring clients</li>
      <li><strong>One-person agencies</strong> — handling multiple projects with varied billing models</li>
    </ul>
    <h3>CORE FEATURES</h3>
    <ul>
      <li><strong>Revenue Dashboard</strong> — MTD revenue vs goal, pending invoices, overdue alerts, quick stats</li>
      <li><strong>Invoice Composer</strong> — Line-item builder with client selector, auto-numbering, tax handling</li>
      <li><strong>Time Tracker</strong> — Live timer with project tagging, daily log, weekly breakdown by client</li>
      <li><strong>Client Ledger</strong> — Lifetime value, active projects, contact notes, invoice history per client</li>
      <li><strong>Revenue Analytics</strong> — Monthly trends, rate breakdown, goal tracking, client concentration</li>
    </ul>
    <h3>DESIGN LANGUAGE</h3>
    <p><strong>Palette:</strong> Near-void aubergine (#06050A) as canvas. Amber gold (#F0A432) as primary accent — warm, transactional, trustworthy. Lavender-white (#EDE9FF) text that feels softer than pure white against the deep background.</p>
    <p><strong>Typography:</strong> Monospace throughout — SF Mono / Fira Code. Precision for numbers, authority for data. Tabular figures everywhere money appears.</p>
    <p><strong>Layout:</strong> Linear-inspired sidebar + content grid. Bento-grid inspired dashboard. Full-width data tables for the invoice manager. Micro-detail at every level.</p>
    <h3>SCREEN ARCHITECTURE</h3>
    <ul>
      <li><strong>M1 / D1 — Dashboard:</strong> Revenue hero, KPI cards, invoice preview, time allocation, top clients</li>
      <li><strong>M2 / D2 — Invoices:</strong> Composer (mobile) / full manager table (desktop) with status filtering</li>
      <li><strong>M3 / D3 — Time:</strong> Live timer with ring UI (mobile) / full-width session table + weekly bars (desktop)</li>
      <li><strong>M4 / D4 — Clients:</strong> Client cards with LTV (mobile) / full profile with notes + activity (desktop)</li>
      <li><strong>M5 / D5 — Analytics:</strong> Revenue breakdown, rate analysis, annual goal tracking</li>
    </ul>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — Freelancer Revenue OS · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — Complete design system with 10 screens, brand spec &amp; CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:700;letter-spacing:4px;color:${P.accent}}
  .nav-id{font-size:11px;color:${P.fg};opacity:0.4;letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:900px}
  .tag{font-size:10px;letter-spacing:3px;color:${P.accent};margin-bottom:20px}
  h1{font-size:clamp(64px,10vw,120px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px;color:${P.fg}}
  h1 span{color:${P.accent}}
  .sub{font-size:18px;opacity:.5;max-width:500px;line-height:1.6;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${P.accent}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px;transition:opacity 0.2s}
  .btn-p{background:${P.accent};color:${P.bg}}
  .btn-p:hover{opacity:0.9}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${P.accent}66}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${P.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:900px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${P.fg};opacity:0.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.accent}22;border:1px solid ${P.accent}44;color:${P.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${P.accent};margin-bottom:12px}
  .p-text{font-size:18px;opacity:.6;font-style:italic;max-width:600px;line-height:1.6;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${P.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${P.fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  /* Gold glow on h1 */
  .glow { text-shadow: 0 0 60px ${P.accent}44; }
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat · mar 19, 2026</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · ${ARCHETYPE.toUpperCase()} · MARCH 19, 2026</div>
  <h1><span class="glow">TILL</span></h1>
  <p class="sub">${TAGLINE}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>AUBERGINE + AMBER GOLD</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>${ARCHETYPE.toUpperCase()}</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>MIDDAY.AI + MONEDA</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">▶ Open in Viewer</a>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE + 5 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE</div>
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
      ${principles.map((p2, i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
        <div style="color:${P.accent};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i+1).padStart(2,'0')}</div>
        <div style="font-size:13px;opacity:.6;line-height:1.6">${p2}</div>
      </div>`).join('')}
    </div>
  </div>

  <div class="tokens-block" id="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${PROMPT}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${prdHTML}
</section>

<footer>
  <span>RAM Design Studio · Production-ready in one heartbeat</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const PROMPT_TEXT=${JSON.stringify(PROMPT)};
const CSS_TOKENS=${JSON.stringify(cssTokens)};

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2000);
}
function copyPrompt(){
  navigator.clipboard.writeText(PROMPT_TEXT).then(()=>toast('Prompt copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=PROMPT_TEXT;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    toast('Prompt copied ✓');
  });
}
function copyTokens(){
  navigator.clipboard.writeText(CSS_TOKENS).then(()=>toast('Tokens copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=CSS_TOKENS;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    toast('Tokens copied ✓');
  });
}
function shareOnX(){
  window.open('https://twitter.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}','_blank');
}
</script>
</body>
</html>`;
}

// ── Build viewer HTML ─────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const viewerRes = await new Promise((resolve) => {
    const opts = {
      hostname: 'zenbin.org',
      path: '/p/pen-viewer-3',
      method: 'GET',
      headers: { 'Accept': 'text/html' },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, body: '' }));
    req.end();
  });

  let viewerHtml = viewerRes.body;
  if (!viewerHtml || viewerRes.status !== 200) {
    return `<!DOCTYPE html><html><body style="background:#06050A;color:#EDE9FF;font-family:monospace;padding:40px">
      <h2>TILL Viewer</h2><p>Viewer template unavailable. <a href="https://ram.zenbin.org/${SLUG}" style="color:#F0A432">← Back to Hero</a></p>
    </body></html>`;
  }

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  // Insert before first <script> tag
  if (viewerHtml.includes('<script>')) {
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } else {
    viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
  }
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔨 TILL — Design Heartbeat Publisher');
  console.log('=====================================\n');

  // Load .pen file
  const penPath = path.join(__dirname, 'till-app.pen');
  const penJson = fs.readFileSync(penPath, 'utf8');
  console.log('✓ Loaded till-app.pen (' + Math.round(penJson.length / 1024) + ' KB)');

  // Build hero HTML (no embedded pen data — links to viewer)
  const heroHTML = buildHeroHTML(penJson, VIEWER_SLUG);
  console.log('✓ Built hero HTML (' + Math.round(heroHTML.length / 1024) + ' KB)');

  // Publish hero page
  console.log('\n📤 Publishing hero page → ram.zenbin.org/' + SLUG);
  const heroRes = await post(SLUG, APP_NAME + ' — Revenue OS for Freelancers · RAM Design Studio', heroHTML, 'ram');
  console.log('   Status:', heroRes.status, heroRes.status === 200 ? '✓' : '✗');
  if (heroRes.status !== 200) console.log('   Body:', heroRes.body.substring(0, 200));

  // Build & publish viewer
  console.log('\n📤 Publishing viewer → ram.zenbin.org/' + VIEWER_SLUG);
  const viewerHTML = await buildViewerHTML(penJson);
  const viewerRes = await post(VIEWER_SLUG, APP_NAME + ' Viewer · RAM Design Studio', viewerHTML, 'ram');
  console.log('   Status:', viewerRes.status, viewerRes.status === 200 ? '✓' : '✗');

  // Add to gallery queue
  const heroURL = `https://ram.zenbin.org/${SLUG}`;
  console.log('\n📋 Adding to gallery queue...');
  const galleryEntry = {
    id: SUB_ID,
    type: 'heartbeat',
    submitted_at: new Date().toISOString(),
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: heroURL,
    viewer_url: `https://ram.zenbin.org/${VIEWER_SLUG}`,
    palette: { bg: P.bg, fg: P.fg, accent: P.accent, accent2: P.accent2 },
    screens: 10,
    prompt: PROMPT,
    status: 'done',
  };
  try {
    const qRes = await pushGalleryEntry(galleryEntry);
    console.log('   Queue update status:', qRes.status, qRes.status === 200 ? '✓' : '✗');
  } catch (e) {
    console.log('   Queue error:', e.message);
  }

  console.log('\n✅ DONE');
  console.log('   Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('   Viewer: https://ram.zenbin.org/' + VIEWER_SLUG);
  console.log('   Gallery: https://ram.zenbin.org/gallery');
}

main().catch(console.error);
