'use strict';
// publish-draft-heartbeat.js — Full Design Discovery pipeline for DRAFT heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'draft';
const VIEWER_SLUG = 'draft-viewer';
const APP_NAME    = 'DRAFT';

const meta = {
  appName:   APP_NAME,
  tagline:   'Proposals that close. Pipeline that pays.',
  archetype: 'freelance-crm',
  palette: {
    bg:      '#0D0C0A',
    surface: '#17150F',
    fg:      '#F8F5EE',
    accent:  '#4A3AFF',
    accent2: '#00B87A',
    muted:   'rgba(248,245,238,0.42)',
  },
  lightPalette: {
    bg:      '#F8F6F2',
    surface: '#FFFFFF',
    text:    '#18140F',
    accent:  '#4A3AFF',
    accent2: '#00B87A',
    muted:   'rgba(24,20,15,0.42)',
  },
};

const ORIGINAL_PROMPT = `Design DRAFT — a proposal and pipeline tool for independent creatives and freelancers. Inspired by two research finds from this heartbeat run:
1. Midday.ai (darkmodedesign.com): "For the new wave of one-person companies" — ultra-clean finance tool for solo operators, with horizontal feature switcher, warm minimal typography, and purposeful whitespace. The insight: enterprise-grade tooling designed specifically for one person, not shrunk down from a team product.
2. Tracebit (land-book.com): Spaced-out editorial typography with letter-level layout control, clean enterprise landing with a single strong concept, integration grid with logo chips, minimal two-button CTA. The insight: editorial letter-spacing as a design differentiator — "SENT · VIEWED · SIGNED" as status beats rather than status labels.

Theme: LIGHT — warm paper white #F8F6F2, deep violet #4A3AFF (deliberately not the tired blue — violet says "creative professional"), forest green #00B87A for won/active, ink #18140F.

Challenge: Use letter-spacing and uppercase micro-labels aggressively — make the typography feel editorial and deliberate, inspired by Tracebit's character-spaced headlines. Build a pipeline kanban that works as a list, not a board — single column with bordered left accent showing proposal stage. Include a contract screen that feels like a real legal document.

5 screens: Pipeline (deal value banner + kanban list) · Proposal Detail (scope line items + payment schedule) · Contract (awaiting signature status + contract preview + activity) · Client Profile (stats + notes + project history) · Analytics (win rate hero + bar chart + lead sources).`;

const sub = {
  id:           `heartbeat-draft-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

const prd = {
  screenNames: ['Pipeline', 'Proposal', 'Contract', 'Client', 'Analytics'],
  markdown: `## Overview
DRAFT is a proposal and pipeline manager for independent creatives — designers, developers, consultants — who win work through relationships rather than RFPs. Inspired by Midday.ai's "one-person company" positioning (darkmodedesign.com) and Tracebit's editorial typography control (land-book.com), DRAFT brings enterprise-quality deal management to the solo operator.

## Design Philosophy
**Editorial not corporate.** Proposals are persuasive documents, not spreadsheet rows. DRAFT's warm paper-white palette (#F8F6F2) and deep violet accent (#4A3AFF) feel closer to a thoughtfully designed pitch deck than a CRM. Letter-spacing is used deliberately — "OVERDUE · DRAFT · SENT" aren't just status labels, they're editorial beats.

**Inspired by:**
- Midday.ai (darkmodedesign.com) — "new wave of one-person companies," horizontal feature showcase, warm minimal palette
- Tracebit (land-book.com) — letter-level typography control, bold concept-first landing, status-as-editorial-beat

## Target Users
- **Freelance designers** — visual identity, UX/product design, motion
- **Independent developers** — full-stack, mobile, API work
- **Creative consultants** — brand strategists, content directors
- **Solo agencies** — one-person studios with 3–10 active clients

## Core Features
- **Pipeline view** — single-column deal list with left-border stage indicator (violet=sent, amber=follow-up, gray=draft), deal value banner with 90-day pipeline total
- **Proposal builder** — scope line items with individual pricing, payment schedule with progress bar, one-tap send with email preview
- **Contract module** — auto-generated from proposal, client signing link, activity log (opened, signed, bounced), kill-fee clause pre-filled
- **Client profiles** — lifetime value, project history, private notes (relationship intel), referral tracking
- **Analytics** — win rate (primary metric), revenue per period, proposal-to-close time, lead source breakdown

## Design Language
Three typographic rules drive DRAFT:
1. **Letter-spacing as hierarchy** — ALL-CAPS micro labels use 1–2px letter-spacing. Section headers use 1.2px. Never use letter-spacing on body text.
2. **Left-border stage coding** — 3px left border on proposal cards: violet=active/sent, amber=needs follow-up, muted=draft. No colored backgrounds, just the accent edge.
3. **Numbers in violet** — Dollar amounts in the pipeline context use accent color. Numbers in won/analytics context use green. Overdue numbers use red.

Type: Inter 800 for display ($54,800), Inter 700 for headings, Inter 500-600 for body, Inter 600 ALL-CAPS 1.2px tracking for micro labels.
Palette: Paper #F8F6F2, surface #FFFFFF, ink #18140F, violet #4A3AFF, green #00B87A, amber #E88C1A, red #E84040.

## Screen Architecture
1. **Pipeline** — "DRAFT  Pipeline" split wordmark header, violet deal value banner, period chips, 3 proposal cards with left-border stage coding, FAB for new proposal
2. **Proposal** — Client + amount hero card, scope line items (4 deliverables + individual prices), 50/50 payment schedule with progress bar, Edit + Send CTA row
3. **Contract** — Green "awaiting signature" banner, contract preview card (key terms + signature status), Copy Link + Send Reminder CTAs, activity log
4. **Client** — Avatar card with contact info + status, 3-stat row (lifetime/active/avg), private notes, project history list with status dots
5. **Analytics** — Win rate hero on violet card (62% + progress bar), 4-stat grid (sent/won/lost/open), revenue bar chart (3 months), lead source progress bars`,
};

// ── HTTP helpers ─────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
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

async function get_(host, p) {
  return httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'ram-design/1.0' } });
}

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path:     `/v1/pages/${slug}`,
    method:   'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    'ram',
    },
  }, body);
}

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / (screen.width  || 390);
  const scaleY = th / (screen.height || 844);
  const BG_LIGHT = '#F8F6F2';

  function renderNode(node, depth = 0) {
    if (depth > 8) return '';
    const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');
    const x    = (node.x || 0) * scaleX;
    const y    = (node.y || 0) * scaleY;
    const w    = (node.width  || 0) * scaleX;
    const h    = (node.height || 0) * scaleY;
    const fill = node.fill || 'transparent';
    const op   = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
    const cr   = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX, scaleY)}"` : '';
    const sw   = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX, scaleY) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';
    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w/2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fw = ['700','800','900'].includes(String(node.fontWeight)) ? ' font-weight="bold"' : '';
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill||'#18140F'}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      const sw2 = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX, scaleY) : 0;
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op} stroke="${node.stroke?.fill||'none'}" stroke-width="${sw2}"/>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${((x*100+y*10)|0)}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:10px;overflow:hidden;border:1px solid rgba(74,58,255,0.15);box-shadow:0 2px 16px rgba(74,58,255,0.08)">
    <rect width="${tw}" height="${th}" fill="${BG_LIGHT}"/>
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];

  const BG      = '#F8F6F2';
  const SURFACE = '#FFFFFF';
  const FG      = '#18140F';
  const ACCENT  = '#4A3AFF';
  const GREEN   = '#00B87A';
  const AMBER   = '#E88C1A';
  const RED     = '#E84040';
  const BORDER  = 'rgba(24,20,15,0.08)';
  const FG2     = 'rgba(24,20,15,0.65)';
  const FG3     = 'rgba(24,20,15,0.38)';

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * ((s.width||390) / (s.height||844)));
    const label = prd.screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;color:${FG3};margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: BG,      role: 'PAPER BG'     },
    { hex: SURFACE, role: 'SURFACE'      },
    { hex: FG,      role: 'INK TEXT'     },
    { hex: ACCENT,  role: 'VIOLET / ACT' },
    { hex: GREEN,   role: 'GREEN / WON'  },
    { hex: AMBER,   role: 'AMBER / WARM' },
    { hex: RED,     role: 'RED / OVERDUE'},
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${BORDER};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;color:${FG3};margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${ACCENT};font-family:'SF Mono','Fira Code',monospace">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',   size: '48px', weight: '900', sample: '$54,800' },
    { label: 'HERO',      size: '28px', weight: '800', sample: 'DRAFT — Proposals that close' },
    { label: 'HEADING',   size: '16px', weight: '700', sample: 'Pipeline · Proposal · Contract' },
    { label: 'BODY',      size: '13px', weight: '400', sample: 'Prefers async comms. Loves detailed scope docs.' },
    { label: 'MICRO CAP', size: '11px', weight: '700', sample: 'OVERDUE · SENT · DRAFT · AWAITING SIGNATURE', spacing: true },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${BORDER}">
      <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${FG};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;${t.spacing?'letter-spacing:1.2px':''}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,12,16,24,32,48].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:10px;color:${FG3};width:32px;flex-shrink:0;font-family:'SF Mono',monospace">${sp}px</div>
      <div style="height:8px;border-radius:2px;background:${ACCENT};width:${sp*2}px;opacity:0.4"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* DRAFT — Proposals & Pipeline for Independent Creatives */
  /* Inspired by Midday.ai + Tracebit (darkmodedesign.com + land-book.com) */

  /* Color — warm paper light system */
  --color-bg:        #F8F6F2;        /* paper white */
  --color-surface:   #FFFFFF;        /* card surface */
  --color-surface-alt: #EDEAE4;      /* subtle alt */
  --color-border:    rgba(24,20,15,0.08);   /* hairline */
  --color-fg:        #18140F;        /* near-black ink */
  --color-fg2:       rgba(24,20,15,0.65);
  --color-fg3:       rgba(24,20,15,0.38);   /* muted */
  --color-violet:    #4A3AFF;        /* primary accent */
  --color-violet-lo: rgba(74,58,255,0.09);
  --color-green:     #00B87A;        /* won / active */
  --color-green-lo:  rgba(0,184,122,0.10);
  --color-amber:     #E88C1A;        /* follow-up needed */
  --color-amber-lo:  rgba(232,140,26,0.10);
  --color-red:       #E84040;        /* overdue */
  --color-red-lo:    rgba(232,64,64,0.08);

  /* Typography */
  --font-sans:  'Inter', system-ui, -apple-system, sans-serif;

  /* Spacing — 4px grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;

  /* Elevation */
  --shadow-card: 0 1px 12px rgba(24,20,15,0.07);
  --shadow-float: 0 4px 24px rgba(74,58,255,0.2);

  /* Radius */
  --radius-sm: 8px;  --radius-md: 14px;  --radius-lg: 20px;

  /* Typography rules */
  /* letter-spacing: 1.2px on ALL-CAPS micro labels only */
  /* letter-spacing: -0.5px on display numbers */
}`;

  const shareText = encodeURIComponent(`DRAFT — Proposals & pipeline for independent creatives. Light editorial design inspired by Midday.ai. Made by RAM Design.`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DRAFT — Proposals & Pipeline · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${BG};color:${FG};font-family:-apple-system,'Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${BORDER};display:flex;justify-content:space-between;align-items:center;background:${SURFACE}}
  .logo{font-size:12px;font-weight:700;letter-spacing:3px;color:${FG};opacity:0.45}
  .nav-tag{font-size:9px;color:${ACCENT};letter-spacing:1px;background:rgba(74,58,255,0.08);padding:4px 10px;border-radius:20px;font-weight:700;border:1px solid rgba(74,58,255,0.2)}
  .hero{padding:80px 40px 48px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${ACCENT};margin-bottom:14px;font-weight:700}
  h1{font-size:clamp(56px,11vw,104px);font-weight:900;letter-spacing:-3px;line-height:0.9;margin-bottom:20px;color:${FG}}
  h1 span{color:${ACCENT}}
  .sub{font-size:16px;color:${FG2};max-width:480px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:28px;margin-bottom:36px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:8px;color:${FG3};letter-spacing:1.5px;margin-bottom:4px;font-weight:600}
  .meta-item strong{color:${FG};font-size:13px;font-weight:700;font-family:'SF Mono','Fira Code',monospace}
  .actions{display:flex;gap:10px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${ACCENT};color:#FFFFFF}
  .btn-p:hover{opacity:.87}
  .btn-s{background:${SURFACE};color:${FG};border:1px solid ${BORDER}}
  .btn-s:hover{border-color:rgba(74,58,255,0.35)}
  .btn-mock{background:rgba(74,58,255,0.09);color:${ACCENT};border:1px solid rgba(74,58,255,0.25);font-weight:700}
  .btn-g{background:rgba(0,184,122,0.09);color:${GREEN};border:1px solid rgba(0,184,122,0.22)}
  .preview{padding:0 40px 80px}
  .section-label{font-size:8px;letter-spacing:3px;color:${FG3};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${BORDER};font-weight:600}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:10px}
  .thumbs::-webkit-scrollbar{height:3px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:rgba(74,58,255,0.2);border-radius:2px}
  .brand-section{padding:64px 40px;border-top:1px solid ${BORDER};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${SURFACE};border:1px solid ${BORDER};border-radius:10px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${FG2};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:rgba(74,58,255,0.09);border:1px solid rgba(74,58,255,0.25);color:${ACCENT};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:rgba(74,58,255,0.15)}
  .prompt-section{padding:40px;border-top:1px solid ${BORDER};max-width:760px}
  .p-label{font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:10px;font-weight:600}
  .p-text{font-size:14px;color:${FG2};font-style:italic;max-width:640px;line-height:1.75;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${BORDER};max-width:780px}
  .prd-section h3{font-size:8px;letter-spacing:2px;color:${ACCENT};margin:24px 0 8px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${FG2};line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${FG};font-weight:600}
  footer{padding:24px 40px;border-top:1px solid ${BORDER};font-size:10px;color:${FG3};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;background:${SURFACE};font-family:'SF Mono',monospace}
  .toast{position:fixed;bottom:24px;right:24px;background:${ACCENT};color:#FFFFFF;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .insight-note{background:rgba(74,58,255,0.05);border:1px solid rgba(74,58,255,0.15);border-left:3px solid ${ACCENT};border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:36px;max-width:520px}
  .insight-note .i-label{font-size:8px;color:${ACCENT};font-weight:700;letter-spacing:1.5px;margin-bottom:6px}
  .insight-note p{font-size:13px;color:${FG};line-height:1.6}
  .status-beats{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap}
  .beat{font-size:10px;font-weight:700;letter-spacing:1.8px;padding:5px 12px;border-radius:20px;border:1px solid}
  .beat-violet{color:${ACCENT};background:rgba(74,58,255,0.07);border-color:rgba(74,58,255,0.2)}
  .beat-green{color:${GREEN};background:rgba(0,184,122,0.07);border-color:rgba(0,184,122,0.2)}
  .beat-amber{color:${AMBER};background:rgba(232,140,26,0.07);border-color:rgba(232,140,26,0.2)}
  .beat-red{color:${RED};background:rgba(232,64,64,0.07);border-color:rgba(232,64,64,0.2)}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-tag">▲ Heartbeat Design</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · FREELANCE-CRM · MARCH 2026</div>
  <h1>DR<span>A</span>FT</h1>
  <p class="sub">${meta.tagline}</p>

  <div class="insight-note">
    <div class="i-label">// DESIGN_INSPIRATION</div>
    <p>Inspired by Midday.ai's "one-person company" positioning (darkmodedesign.com) and Tracebit's editorial letter-spacing (land-book.com). New territory: using letter-spacing as a UI design tool — status labels as editorial beats, left-border stage coding instead of color fills, contract screen that feels like a real legal doc.</p>
  </div>

  <div class="status-beats">
    <div class="beat beat-violet">SENT</div>
    <div class="beat beat-amber">FOLLOW UP</div>
    <div class="beat beat-red">OVERDUE</div>
    <div class="beat beat-green">WON</div>
    <div class="beat beat-violet">AWAITING SIGNATURE</div>
  </div>

  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>THEME</span><strong>LIGHT · PAPER</strong></div>
    <div class="meta-item"><span>ACCENT</span><strong>#4A3AFF</strong></div>
    <div class="meta-item"><span>BG</span><strong>#F8F6F2</strong></div>
    <div class="meta-item"><span>CATEGORY</span><strong>FREELANCE</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/draft-mock" target="_blank">✦ Try Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-s" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-g" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN PREVIEWS — 5 MOBILE SCREENS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:16px;font-weight:600">COLOR SYSTEM — PAPER + SEMANTIC</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:16px;font-weight:600">SPACING — 4PX GRID</div>
        ${spacingHTML}
      </div>
    </div>
    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:16px;font-weight:600">TYPE SCALE — INTER</div>
      ${typeScaleHTML}
    </div>
  </div>

  <div style="margin-top:48px">
    <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:4px;font-weight:600">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${prd.markdown
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h3 style="letter-spacing:1px;font-size:8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/(?<![>])\n/g, ' ')}
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · 2026-03-23</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied ✓'));
  }
  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied ✓'));
  }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ───────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DRAFT Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue update ───────────────────────────────────────────────────────
async function updateGalleryQueue() {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Accept':        'application/vnd.github.v3+json',
    },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    ...sub,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });
  return httpsReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);
}

// ── Design DB index ───────────────────────────────────────────────────────────
async function indexInDB() {
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, {
      ...sub,
      design_url: `https://ram.zenbin.org/${SLUG}`,
      mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    });
    rebuildEmbeddings(db);
    return true;
  } catch(e) {
    console.warn('  DB index skipped:', e.message);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('▲ DRAFT — Design Discovery Pipeline\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'draft.pen'), 'utf8'));
  console.log('Pen loaded:', penJson.screens?.length || 0, 'screens');

  const heroHTML   = buildHeroHTML(penJson);
  const viewerHTML = await buildViewerHTML(penJson);
  console.log('HTML built — hero:', (heroHTML.length/1024).toFixed(1), 'KB');

  // a) Hero
  console.log('\nPublishing hero page...');
  const heroResult = await publishToZenbin(SLUG, `DRAFT — Proposals & Pipeline · RAM Design Studio`, heroHTML);
  console.log(`  ${SLUG}: HTTP ${heroResult.status}`);
  if (heroResult.status === 200 || heroResult.status === 201) {
    console.log(`  ✓ https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log('  Response:', heroResult.body.slice(0, 200));
  }

  // b) Viewer
  console.log('\nPublishing viewer...');
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'DRAFT Viewer · RAM Design Studio', viewerHTML);
  console.log(`  ${VIEWER_SLUG}: HTTP ${viewerResult.status}`);
  if (viewerResult.status === 200 || viewerResult.status === 201) {
    console.log(`  ✓ https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.log('  Response:', viewerResult.body.slice(0, 200));
  }

  // c) Gallery queue
  console.log('\nUpdating gallery queue...');
  try {
    const qRes = await updateGalleryQueue();
    console.log(`  HTTP ${qRes.status}`);
    if (qRes.status === 200) console.log('  ✓ Gallery queue updated');
    else console.log('  Body:', qRes.body.slice(0, 200));
  } catch(e) {
    console.warn('  Queue error:', e.message);
  }

  // d) Design DB
  console.log('\nIndexing in design DB...');
  const indexed = await indexInDB();
  if (indexed) console.log('  ✓ Indexed');

  console.log('\n✓ DRAFT pipeline complete');
  console.log(`  Hero    → https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer  → https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock    → https://ram.zenbin.org/${SLUG}-mock (built separately)`);
}

main().catch(err => { console.error('Pipeline error:', err); process.exit(1); });
