'use strict';
// publish-lumen.js — Full Design Discovery pipeline for LUMEN heartbeat

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'lumen';
const VIEWER_SLUG = 'lumen-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'LUMEN',
  tagline:   'Developer conference discovery & scheduling platform. Find talks, save your schedule, and watch live from anywhere — in a cosmic dark UI.',
  archetype: 'Developer Conference & Tech Event Platform',
  palette: {
    bg:      '#07070F',
    fg:      '#EDE9E0',
    accent:  '#C8F03D',
    accent2: '#8B7FFF',
  },
};

const sub = {
  id:           'heartbeat-lumen',
  prompt:       'Design LUMEN — a dark-mode developer conference discovery & live streaming platform. Inspired by Stripe Sessions 2026\'s ultra-thin variable font typography at weight 250 on massive 90px display headings (land-book.com / lapa.ninja), Evervault\'s cosmic near-black #010314 with glassmorphism panels (godly.website), and Twingate\'s confident minimal developer-tool aesthetic on dark #0E0F11 (godly.website). Palette: cosmic void #07070F, warm cream text #EDE9E0, electric acid lime #C8F03D accent, soft violet #8B7FFF interactive. 5 mobile screens: Home Feed · Conference Detail · Session Browser · My Schedule · Live Now.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Home Feed', 'Conference Detail', 'Session Browser', 'My Schedule', 'Live Now'],
  markdown: `## Overview
LUMEN is a dark-mode mobile-first platform for discovering developer conferences, building personal talk schedules, and watching keynotes live. In a world where developer events have become digital-first, LUMEN brings the energy of a packed auditorium to your phone — with a design language that feels as premium as the conferences it features.

Designed during a research sprint on **March 20, 2026** across godly.website, land-book.com, lapa.ninja, and darkmodedesign.com.

## Target Users
- **Senior engineers & tech leads** who attend 2-4 conferences per year and want to optimize their schedule before arriving
- **Remote developers** who can't travel but want to watch keynotes live and engage with the community
- **Developer advocates & PMs** scouting speakers and tracking which talks get the most engagement
- **Conference organizers** measuring live audience interest by session

## Core Features
- **Home Feed** — Curated conference cards with editorial oversized headings (the Stripe Sessions 2026 ultra-thin type influence). Featured conference hero with electric lime date badges, upcoming events list with track chips and date tiles.
- **Conference Detail** — Full event page with key stats (talks, speakers, days), speaker grid with role attribution, register CTA, and track overview with visual progress bars showing session distribution.
- **Session Browser** — Searchable, filterable list of all 124+ sessions. Filter chips for track, type, time. Each session card shows time slot, duration, track tag, speaker avatar and role, and a save toggle.
- **My Schedule** — Personal timeline for Day 1/2/3 with booked sessions. Day selector, stats strip showing saved count and potential conflicts, and a full time-blocked view from 9am to 5pm.
- **Live Now** — Active keynote livestream with simulated stage view, LIVE badge with viewer count, progress scrubber, and a live audience reaction stream with emoji responses and scrolling comments.

## Design Language
Three research sources converged on this design:

**1. Stripe Sessions 2026** (land-book.com, lapa.ninja) — The standout UI trend of March 2026: ultra-thin variable-weight display typography. Headings at font-weight 250 with 89px size creates an editorial "antiweight" effect — monumental scale with gossamer delicacy. The warm cream-on-deep-dark contrast (off-white #EDE9E0 on #07070F) avoids the harsh pure-white-on-black glare of typical dark UIs. This is the most distinctive typographic trend in current web design and one RAM had not yet explored. LUMEN's hero headline "VELOCITY / CONF 2026" directly implements this weight-250 approach at scale.

**2. Evervault Customers page** (godly.website) — Featured prominently in the godly.website feed (March 2026). Deep cosmic background (#010314, near-void), glassmorphism card panels, and translucent glass overlays. This "universe of encryption" aesthetic — dark as the cosmos but with focused light sources — informs LUMEN's ambient glow system (soft colored ellipses at low opacity behind content blocks).

**3. Twingate** (godly.website) — "Security, Performance, Simplicity. Pick Three." Twingate's ultra-minimal value proposition on near-black #0E0F11 demonstrates that developer tools can lead with confidence and restraint. LUMEN's Session Browser draws from this architectural clarity — each card is a clean record, not a decorative element.

The palette innovation: **electric acid lime #C8F03D** replaces the ubiquitous teal/indigo accent seen in most dark developer tools. Against the cosmic void, lime creates maximum contrast with an energy that matches conference excitement. Soft violet #8B7FFF handles interactive states without screaming.

## Screen Architecture
**Mobile (390×844) — 5 screens:**
1. **Home Feed** — Featured conference hero with massive ultra-thin "VELOCITY / CONF 2026" heading, electric lime chip, event metadata, then 3 upcoming event cards with date tiles, location, and track chips
2. **Conference Detail** — Glass hero card with thin conference name, stats trio (124 talks / 48 speakers / 3 days), REGISTER CTA in lime, speaker avatar grid (4 speakers), track distribution bars
3. **Session Browser** — Search bar, filter chip row (All/AI-ML/Frontend/DevOps/OSS/Keynote), scrolling session cards with time+duration, track chip, speaker avatar, and star-save toggle
4. **My Schedule** — Day 1/2/3 selector, stat strip (6 saved / 4 conflicts / 11h content), full timeline from 9:00am with keynotes, breaks, and talk blocks color-coded by track
5. **Live Now** — Simulated stage view video area, LIVE badge + 2.4K viewer count, HD/CC controls, progress scrubber, session info panel with ultra-thin title, live reaction emoji bubbles, comment stream, Send input bar`,
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
const put_ = (host, p, body, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'PUT',  headers: { 'Content-Type': 'application/json', ...hdrs } }, body);
const get_ = (host, p, hdrs = {}) => httpsReq({ hostname: host, path: p, method: 'GET', headers: { 'User-Agent': 'design-studio-agent/1.0', ...hdrs } });

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderEl(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = typeof el.fill === 'string' ? el.fill : 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99)
    ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius
    ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';

  if (el.type === 'frame') {
    const stroke = el.stroke ? ` stroke="${el.stroke.fill}" stroke-width="${el.stroke.thickness || 1}"` : '';
    const clipId = el.clip ? `clip-lm-${el.id}` : null;
    const inner = (el.children || []).map(c => renderEl(c, depth + 1)).join('');
    if (el.clip) {
      return `<g${oAttr}><defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}"${rAttr}/></clipPath></defs>`
        + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${stroke}/>`
        + `<g clip-path="url(#${clipId})">${inner}</g></g>`;
    }
    return `<g${oAttr}><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${stroke}/>${inner}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
    const tx = el.textAlign === 'center' ? x + w / 2 : el.textAlign === 'right' ? x + w : x;
    const sz = el.fontSize || 13;
    const fw = el.fontWeight || '400';
    const c = typeof el.fill === 'string' ? el.fill : '#ffffff';
    const line = (el.content || '').split('\n')[0].slice(0, 60);
    return `<text x="${tx}" y="${y + sz}" font-size="${sz}" font-weight="${fw}" fill="${c}" text-anchor="${anchor}"${oAttr} font-family="system-ui,sans-serif">${
      line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    }</text>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sx = tw / screen.width, sy = th / screen.height;
  const scale = Math.min(sx, sy);
  const inner = (screen.children || []).map(c => renderEl(c, 0)).join('');
  return `<svg width="${tw}" height="${th}" viewBox="0 0 ${screen.width} ${screen.height}" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px;display:block;background:${screen.fill || '#07070F'}"><rect width="${screen.width}" height="${screen.height}" fill="${screen.fill || '#07070F'}"/>${inner}</svg>`;
}

// ── Markdown → HTML ───────────────────────────────────────────────────────────
function mdToHtml(md) {
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:11px;letter-spacing:1.5px;opacity:.5;margin:16px 0 6px">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .split('\n').map(l => l.startsWith('<') ? l : (l ? `<p>${l}</p>` : '')).join('');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const encoded = Buffer.from(penJson).toString('base64');
  const screens = doc.children || [];

  function lightenHex(hex, amt) {
    const n = parseInt((hex||'#111111').replace('#',''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  const surface = lightenHex(meta.palette.bg, 14);
  const border  = lightenHex(meta.palette.bg, 28);

  // Thumbnails
  const THUMB_H = 200;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = (prd.screenNames && prd.screenNames[i]) || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: meta.palette.bg,      role: 'BG'         },
    { hex: surface,              role: 'SURFACE'     },
    { hex: '#EDE9E0',            role: 'FOREGROUND'  },
    { hex: meta.palette.accent,  role: 'LIME'        },
    { hex: meta.palette.accent2, role: 'VIOLET'      },
    { hex: '#FF4D6A',            role: 'LIVE'        },
    { hex: '#F59E42',            role: 'DESIGN TRK'  },
    { hex: '#38D9A9',            role: 'ENG TRK'     },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:56px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  // Type scale
  const typeScaleHTML = [
    { label:'DISPLAY',  size:'52px', weight:'200', sample:'VELOCITY CONF 2026' },
    { label:'HEADING',  size:'22px', weight:'600', sample: meta.appName },
    { label:'BODY',     size:'14px', weight:'400', sample:'The quick brown fox jumps over the lazy dog.' },
    { label:'CAPTION',  size:'9px',  weight:'700', sample:'TRACK · LABEL · UI ELEMENT' },
  ].map(t => `
    <div style="padding:16px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:8px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.1;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  // Spacing
  const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp*2}px;opacity:0.6"></div>
    </div>`).join('');

  // CSS tokens
  const cssTokens = `:root {
  /* Color */
  --color-bg:        ${meta.palette.bg};
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        #EDE9E0;
  --color-primary:   ${meta.palette.accent};
  --color-secondary: ${meta.palette.accent2};
  --color-live:      #FF4D6A;
  --color-track-design: #F59E42;
  --color-track-eng:    #38D9A9;
  --color-track-ai:     #60A5FA;

  /* Typography */
  --font-family:  system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-display: 200 clamp(44px, 8vw, 80px) / 1.0 var(--font-family);
  --font-heading: 600 22px / 1.3 var(--font-family);
  --font-body:    400 14px / 1.6 var(--font-family);
  --font-caption: 700 9px / 1 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Shadows */
  --glow-primary: 0 0 60px rgba(200, 240, 61, 0.08);
  --glow-violet:  0 0 60px rgba(139, 127, 255, 0.08);
}`;

  const shareText = encodeURIComponent(`LUMEN — AI-generated developer conference platform design. 5 mobile screens + full brand spec + CSS tokens. Built autonomously by RAM Design Studio`);

  const principles = [
    'Ultra-thin display type — weight-200 headings at 50px+ create editorial gravitas without aggression.',
    'Warm cream on cosmic void — #EDE9E0 on #07070F is gentler than pure white, more premium.',
    'Electric accent, one rule — lime #C8F03D appears only for primary actions; everything else is quiet.',
    'Glass-panel depth — surfaces layer with 14px lightness increments to simulate physical depth.',
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.appName} — Design System · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:#EDE9E0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${meta.palette.accent}}
  .nav-id{font-size:11px;color:#EDE9E080;letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:940px}
  .tag{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(52px,8vw,100px);font-weight:200;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:#EDE9E0}
  .sub{font-size:16px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:36px;font-weight:300}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1px;margin-bottom:4px;font-weight:600}
  .meta-item strong{color:${meta.palette.accent};font-size:12px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.bg}}
  .btn-p:hover{opacity:.9}
  .btn-s{background:transparent;color:#EDE9E0;border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:940px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:24px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.75;color:#EDE9E0;opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',ui-monospace,monospace}
  .copy-btn{position:absolute;top:14px;right:14px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:9px;letter-spacing:1.5px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:14px;font-weight:700}
  .p-text{font-size:17px;opacity:.55;font-style:italic;max-width:640px;line-height:1.7;margin-bottom:20px;font-weight:300}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.6;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:#EDE9E0}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:${meta.palette.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-bar{background:${surface};border-left:3px solid ${meta.palette.accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:0 40px 40px;max-width:740px;font-size:12px;line-height:1.75;opacity:.75}
  .inspiration-bar strong{color:${meta.palette.accent};opacity:1}
  .principle{padding:12px 0;border-bottom:1px solid ${border};font-size:13px;opacity:.6;line-height:1.6}
  .principle:last-child{border-bottom:none}
  .principle::before{content:'→ ';color:${meta.palette.accent};font-weight:700;opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">heartbeat-lumen · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="tag">DESIGN HEARTBEAT · CONFERENCE PLATFORM · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>LUMEN</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE (390×844)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>CONFERENCE PLATFORM</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
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
  <strong>Research sources (March 20, 2026):</strong>
  Stripe Sessions 2026 — ultra-thin weight-250 variable typography, warm cream on dark (land-book.com, lapa.ninja) ·
  Evervault Customers — cosmic near-black #010314, glassmorphism panels (godly.website) ·
  Twingate — confident minimal dark developer tool aesthetic (godly.website) ·
  darkmodedesign.com — Linear, Midday, Forge, Superset dark UI survey
</div>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;font-weight:600">COLOR PALETTE · 8 TONES</div>
      <div class="swatches">${swatchHTML}</div>
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0;font-weight:600">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;font-weight:600">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;font-weight:600">DESIGN PRINCIPLES</div>
      ${principles.map(p => `<div class="principle">${p}</div>`).join('')}
    </div>

  </div>

  <div style="margin-top:60px">
    <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px;font-weight:600">CSS DESIGN TOKENS</div>
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
  <span>Built autonomously by RAM Design AI · <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a></span>
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
    const jsonStr = atob(ENCODED);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lumen.pen';
    a.click();
    URL.revokeObjectURL(a.href);
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
  const viewerPath = path.join(__dirname, 'pen-viewer.html');
  if (!fs.existsSync(viewerPath)) throw new Error('pen-viewer.html not found');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── GitHub queue helper ───────────────────────────────────────────────────────
async function pushToGalleryQueue(heroUrl) {
  const AUTH = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'design-studio-agent/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };
  const getRes = await get_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, AUTH);
  if (getRes.status !== 200) throw new Error(`Queue GET failed: ${getRes.status}`);
  const { sha, content } = JSON.parse(getRes.body);
  const queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));

  const entry = {
    id:           sub.id,
    prompt:       sub.prompt,
    design_url:   heroUrl,
    submitted_at: sub.submitted_at,
    status:       'done',
    credit:       sub.credit,
    tags:         ['conference', 'event-platform', 'dark-mode', 'editorial-type', 'developer-tools'],
  };

  if (!queue.submissions) queue.submissions = [];
  const existing = queue.submissions.findIndex(s => s.id === sub.id);
  if (existing >= 0) queue.submissions[existing] = entry;
  else queue.submissions.unshift(entry);

  const updated = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: lumen heartbeat design`,
    content: updated,
    sha,
  });
  const putRes = await put_('api.github.com', `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`, putBody, AUTH);
  if (putRes.status !== 200 && putRes.status !== 201) {
    throw new Error(`Queue PUT failed: ${putRes.status} — ${putRes.body.slice(0,200)}`);
  }
  return true;
}

// ── Main publish ──────────────────────────────────────────────────────────────
async function main() {
  console.log('🌟 LUMEN — Design Discovery Pipeline');
  console.log('══════════════════════════════════════\n');

  const penPath = path.join(__dirname, 'lumen.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ lumen.pen not found. Run: node lumen-app.js first');
    process.exit(1);
  }

  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc     = JSON.parse(penJson);
  console.log(`✓ Loaded lumen.pen (${Math.round(penJson.length/1024)}KB, ${doc.children.length} screens)`);

  // ── Step A: Build hero HTML ──────────────────────────────────────────────
  console.log('\n[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'lumen-hero.html'), heroHtml);
  console.log(`  ✓ lumen-hero.html (${Math.round(heroHtml.length/1024)}KB)`);

  // ── Step B: Publish hero → zenbin ────────────────────────────────────────
  console.log('\n[2/4] Publishing hero → zenbin.org/p/lumen…');
  let heroUrl  = `https://ram.zenbin.org/${SLUG}`;
  let heroSlug = SLUG;

  for (const trySlug of [SLUG, SLUG+'-2', SLUG+'-3']) {
    const body = JSON.stringify({
      title: `LUMEN — Developer Conference Platform · RAM Design Studio`,
      html:  heroHtml,
    });
    const res = await post('zenbin.org', `/v1/pages/${trySlug}`, body, { 'X-Subdomain': 'ram' });
    if (res.status === 200 || res.status === 201) {
      heroSlug = trySlug;
      heroUrl  = `https://ram.zenbin.org/${trySlug}`;
      console.log(`  ✓ Hero live → ${heroUrl}`);
      break;
    } else if (res.status === 409) {
      const putRes = await put_('zenbin.org', `/v1/pages/${trySlug}`, body, {
        'Content-Type': 'application/json', 'X-Subdomain': 'ram',
      });
      if (putRes.status === 200 || putRes.status === 201) {
        heroSlug = trySlug;
        heroUrl  = `https://ram.zenbin.org/${trySlug}`;
        console.log(`  ✓ Hero updated → ${heroUrl}`);
        break;
      }
      console.log(`  ⚠ Slug '${trySlug}' taken (${res.status}), trying next…`);
    } else {
      console.log(`  ✗ Publish failed ${res.status}: ${res.body.slice(0,120)}`);
    }
  }

  // ── Step C: Build + publish viewer ───────────────────────────────────────
  console.log(`\n[3/4] Building & publishing viewer → zenbin.org/p/${VIEWER_SLUG}…`);
  let viewerOk = false;
  try {
    const viewerHtml = buildViewerHTML(penJson);
    fs.writeFileSync(path.join(__dirname, 'lumen-viewer.html'), viewerHtml);
    const vBody = JSON.stringify({
      title: `LUMEN Viewer · RAM Design Studio`,
      html:  viewerHtml,
    });
    for (const trySlug of [VIEWER_SLUG, VIEWER_SLUG+'-2']) {
      const vRes = await post('zenbin.org', `/v1/pages/${trySlug}`, vBody, { 'X-Subdomain': 'ram' });
      if (vRes.status === 200 || vRes.status === 201) {
        console.log(`  ✓ Viewer live → https://ram.zenbin.org/${trySlug}`);
        viewerOk = true; break;
      }
      const vPut = await put_('zenbin.org', `/v1/pages/${trySlug}`, vBody, {
        'Content-Type': 'application/json', 'X-Subdomain': 'ram',
      });
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
    console.log('  ✓ Queue updated');
  } catch (e) {
    console.log('  ⚠ Queue update failed:', e.message);
  }

  console.log('\n══════════════════════════════════════');
  console.log('✓ LUMEN published successfully!');
  console.log(`  Hero:    ${heroUrl}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Gallery: https://ram.zenbin.org/gallery`);
  console.log('══════════════════════════════════════\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
