'use strict';
// publish-nocturne-heartbeat.js
// Full Design Discovery pipeline for NOCTURNE
// Design Heartbeat — Mar 19, 2026
// Inspired by:
//   • Atlas Card (atlascard.com via godly.website) — pure black + navy #001391, invite-only exclusivity
//   • Evervault Customers page — deep dark #010314, encrypted text visual language
//   • Lusion.co (godly.website) — electric blue #1A2FFB, dark cinema production tone

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'nocturne-heartbeat';
const VIEWER_SLUG = 'nocturne-viewer';
const DATE_STR    = 'March 19, 2026';
const APP_NAME    = 'NOCTURNE';
const TAGLINE     = 'The private AI concierge for members who expect everything';

// ── Palette (must match nocturne-app.js) ──────────────────────────────────────
const P = {
  bg:       '#000000',
  surface:  '#0A0A0A',
  surface2: '#111111',
  border:   '#1C1C1C',
  border2:  '#2A2A2A',
  navy:     '#001391',
  navyHi:   '#0019CC',
  blue:     '#1A2FFB',
  blueHi:   '#4A5EFF',
  gold:     '#C9A84C',
  goldHi:   '#E8C86A',
  fg:       '#F5F5F0',
  fg2:      '#8A8A82',
  fg3:      '#4A4A44',
  green:    '#4ADE80',
  red:      '#F87171',
  cream:    '#FAF8F3',
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
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

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function renderNode(node, scale) {
  const x = Math.round((node.x || 0) * scale);
  const y = Math.round((node.y || 0) * scale);
  const w = Math.round((node.width  || 0) * scale);
  const h = Math.round((node.height || 0) * scale);
  if (w <= 0 || h <= 0) return '';

  let out = '';
  const fill  = node.fill || 'transparent';
  const r     = node.cornerRadius ? Math.round(node.cornerRadius * scale) : 0;
  const op    = node.opacity !== undefined ? ` opacity="${node.opacity}"` : '';
  const stroke = node.stroke
    ? ` stroke="${node.stroke.fill}" stroke-width="${Math.max(1, Math.round((node.stroke.thickness || 1) * scale))}"`
    : '';

  if (node.type === 'ellipse') {
    const rx = Math.round(w / 2), ry = Math.round(h / 2);
    out += `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${stroke}${op}/>`;
  } else if (node.type === 'text') {
    const sz   = Math.max(4, Math.round((node.fontSize || 13) * scale));
    const col  = node.fill || '#F5F5F0';
    const fw   = node.fontWeight || '400';
    const anch = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
    const tx   = node.textAlign === 'center' ? x + w / 2 : node.textAlign === 'right' ? x + w : x;
    const safe = (node.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0, 60);
    out += `<text x="${tx}" y="${y + sz}" font-size="${sz}" fill="${col}" font-weight="${fw}" text-anchor="${anch}"${op}>${safe}</text>`;
  } else {
    // frame / rect
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}${op}/>`;
    for (const child of (node.children || [])) {
      out += renderNode({ ...child, x: (node.x||0) + (child.x||0), y: (node.y||0) + (child.y||0) }, scale);
    }
  }
  return out;
}

// ── Load screens ──────────────────────────────────────────────────────────────
const penJson  = JSON.parse(fs.readFileSync(path.join(__dirname, 'nocturne-app.pen'), 'utf8'));
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

// ── Thumbnails ────────────────────────────────────────────────────────────────
const THUMB_H = 200;
const SCREEN_NAMES = ['Invite Gate', 'Member Home', 'Dining', 'AI Chat', 'Benefits'];
const thumbsHTML = screens.map((s, i) => {
  const tw = Math.round(THUMB_H * (s.width / s.height));
  return `<div style="text-align:center;flex-shrink:0">
    ${screenThumbSVG(s, tw, THUMB_H)}
    <div style="font-size:9px;color:${P.fg2};margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(SCREEN_NAMES[i]||'SCREEN '+(i+1)).toUpperCase()}</div>
  </div>`;
}).join('');

// ── CSS Tokens ────────────────────────────────────────────────────────────────
const cssTokens = `:root {
  /* Color */
  --color-bg:        ${P.bg};
  --color-surface:   ${P.surface};
  --color-surface2:  ${P.surface2};
  --color-border:    ${P.border};
  --color-border2:   ${P.border2};
  --color-fg:        ${P.fg};
  --color-fg2:       ${P.fg2};
  --color-navy:      ${P.navy};
  --color-blue:      ${P.blue};
  --color-gold:      ${P.gold};
  --color-green:     ${P.green};
  --color-cream:     ${P.cream};

  /* Typography */
  --font-family:  'Inter', 'Helvetica Neue', system-ui, sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 800 clamp(36px, 10vw, 80px) / 1 var(--font-family);
  --font-heading: 700 22px / 1.3 var(--font-family);
  --font-body:    400 13px / 1.6 var(--font-family);
  --font-caption: 700 9px / 1 var(--font-family);

  /* Spacing (4px base) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 0 0 1px ${P.border2};
  --shadow-navy: 0 0 32px ${P.navy}55;
  --shadow-gold:  0 0 24px ${P.gold}33;
}`;

// ── PRD ───────────────────────────────────────────────────────────────────────
const prd = `
<h3>OVERVIEW</h3>
<p>NOCTURNE is an invite-only AI-powered private-member concierge app for ultra-high-net-worth individuals. It combines the exclusivity of a traditional private members club (Atlas Card, Quintessentially) with a sophisticated AI assistant that handles every request — from impossible restaurant reservations to private jet bookings — in a unified dark-luxury mobile experience.</p>

<h3>TARGET USERS</h3>
<ul>
  <li><strong>UHNW individuals ($10M+ net worth)</strong> who expect frictionless access to the world's best experiences</li>
  <li><strong>C-Suite executives and founders</strong> who value time above all and want a single intelligent concierge</li>
  <li><strong>Members transitioning from traditional concierge services</strong> (AmEx Centurion, Quintessentially) who want AI-native intelligence</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
  <li><strong>Invite Gate</strong> — Members-only entry with identity verification, physical membership card visualization, encrypted-text aesthetic</li>
  <li><strong>Member Home Bento</strong> — At-a-glance dashboard: tonight's reservation, weather at current city, concierge credit balance, upcoming travel, AI suggestions</li>
  <li><strong>Dining Concierge</strong> — Dark luxury restaurant detail view with real-time table selection, occasion notes, credit tracking, Michelin indicators</li>
  <li><strong>AI Chat Interface</strong> — Conversational concierge powered by AI: car arrangements, upgrades, hotel modifications — one natural conversation</li>
  <li><strong>Benefits Dashboard</strong> — Member tier visualization (Obsidian → Apex) with benefit cards, annual spend tracking, upgrade CTA</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<p>NOCTURNE's design language fuses three distinct reference points discovered during March 19, 2026 research:</p>
<ul>
  <li><strong>Atlas Card pure-black aesthetic</strong> — #000000 background (not #1a1a1a dark mode grey), "Sequel Sans"-style ALL CAPS editorial headings, royal navy blue #001391 for primary interactive surfaces. The physical membership card is rendered as a dark UI card with gold accents.</li>
  <li><strong>Evervault's encrypted text visual</strong> — Running cipher text rows in monospace create an "identity verification" atmosphere without any literal security UI. Borrowed directly from Evervault's customer page hero text scramble effect.</li>
  <li><strong>Lusion's electric blue</strong> — #1A2FFB used for all interactive/tap states, borders on focused inputs, and the AI concierge avatar glow ring. Creates a technological counterpoint to the organic gold luxury palette.</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
  <li><strong>S1 · Invite Gate</strong> — Pure black entry, physical card visualization, cipher text rows, "ENTER NOCTURNE" navy CTA</li>
  <li><strong>S2 · Member Home</strong> — Bento grid: tonight's dinner, weather, credits, AI status ticker, upcoming travel, recent requests</li>
  <li><strong>S3 · Dining Concierge</strong> — Full-bleed dark hero, time slot selector, guest picker, omakase/occasion field, 1-credit CTA</li>
  <li><strong>S4 · AI Chat</strong> — Header with AI status, message thread, quick-reply chips, minimal input bar</li>
  <li><strong>S5 · Benefits</strong> — Tier progress, 6-up benefit cards grid, Apex upgrade CTA</li>
</ul>`;

// ── Swatches ──────────────────────────────────────────────────────────────────
const swatches = [
  { hex: P.bg,      role: 'PURE BLACK'   },
  { hex: P.surface, role: 'SURFACE'      },
  { hex: P.fg,      role: 'FOREGROUND'   },
  { hex: P.navy,    role: 'ATLAS NAVY'   },
  { hex: P.blue,    role: 'LUSION BLUE'  },
  { hex: P.gold,    role: 'MEMBER GOLD'  },
  { hex: P.green,   role: 'CONFIRMED'    },
];
const swatchHTML = swatches.map(sw => `
  <div style="flex:1;min-width:70px">
    <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border2};margin-bottom:8px"></div>
    <div style="font-size:8px;letter-spacing:1.5px;color:${P.fg2};margin-bottom:3px">${sw.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.gold}">${sw.hex}</div>
  </div>`).join('');

// ── Type scale ─────────────────────────────────────────────────────────────────
const typeScaleHTML = [
  { label:'DISPLAY',  size:'48px', weight:'800', sample: 'NOCTURNE',       font: 'inherit', ls: '8px'  },
  { label:'HEADING',  size:'24px', weight:'700', sample: 'Member Benefits' },
  { label:'BODY',     size:'13px', weight:'400', sample: 'Your concierge is available 24/7 to handle any request.' },
  { label:'CAPTION',  size:'9px',  weight:'700', sample: 'OBSIDIAN TIER · MARCH 2026 · NYC', ls: '2px' },
  { label:'MONO',     size:'11px', weight:'400', sample: 'X7K3M9P2L8Q4R6T1 · CIPHER · 4521 •••• 8847', font: 'monospace' },
].map(t => `
  <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
    <div style="font-size:8px;letter-spacing:2px;color:${P.fg2};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
    <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;font-family:${t.font||'inherit'};letter-spacing:${t.ls||'normal'}">${t.sample}</div>
  </div>`).join('');

// ── Spacing ────────────────────────────────────────────────────────────────────
const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
    <div style="font-size:9px;color:${P.fg2};width:28px;flex-shrink:0">${sp}px</div>
    <div style="height:6px;border-radius:3px;background:${P.gold};width:${sp * 1.8}px;opacity:0.6"></div>
  </div>`).join('');

// ── Design principles ─────────────────────────────────────────────────────────
const principlesHTML = [
  ['01', `Pure black #000000 — not "dark mode grey". Atlas Card's actual background is #000000 (rgb 0,0,0). This creates a qualitatively different sense of depth and luxury versus the typical #1a1a1a dark mode. Every surface above it feels intentionally elevated.`],
  ['02', `Gold as earned signal — #C9A84C gold appears only for member status indicators, tier labels, the physical card emboss, and benefit icons. It is never used decoratively. This scarcity means gold always communicates: "you're the member here."` ],
  ['03', `Cipher text as ambience — four rows of monospace cipher text (A2F9W5N1C8J6E3B7...) from Evervault's visual language replace hero imagery. They suggest security, identity, and the AI running beneath the surface — without any literal explanation.`],
].map(([n, p]) => `
  <div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start">
    <div style="font-size:11px;font-weight:700;color:${P.gold};flex-shrink:0;margin-top:2px;font-family:monospace">${n}</div>
    <div style="font-size:13px;color:${P.fg2};line-height:1.7">${p}</div>
  </div>`).join('');

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const penJsonStr    = fs.readFileSync(path.join(__dirname, 'nocturne-app.pen'), 'utf8');
const encodedPen    = Buffer.from(penJsonStr).toString('base64');
const heroURL       = `https://ram.zenbin.org/${SLUG}`;
const viewerURL     = `https://ram.zenbin.org/${VIEWER_SLUG}`;
const downloadURL   = `https://ram.zenbin.org/${SLUG}?download=pen`;
const galleryURL    = `https://ram.zenbin.org/gallery`;
const promptText    = `Design NOCTURNE — an invite-only dark luxury AI concierge app for ultra-high-net-worth members. Inspired by Atlas Card's pure black + royal navy #001391 exclusivity aesthetic (atlascard.com via godly.website), Evervault's deep-dark encrypted text visual language, and Lusion.co's electric blue #1A2FFB cinema tone. 5 mobile screens: Invite Gate with cipher text + physical membership card, Member Home bento grid, Dining Concierge dark luxury booking, AI Chat conversational interface, and Benefits tier dashboard. Palette: #000000 black, #001391 navy, #1A2FFB electric blue, #C9A84C gold, #F5F5F0 warm white.`;
const shareText     = encodeURIComponent(`NOCTURNE — dark luxury AI concierge. Invite-only. Obsidian tier. Inspired by Atlas Card + Evervault. Built by RAM Design Studio.`);

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
  a { color: ${P.blue}; text-decoration: none; }
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
    background: radial-gradient(ellipse 600px 400px at 50% 60%, ${P.navy}18, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-size: 10px; font-weight: 700; letter-spacing: 4px; color: ${P.gold};
    margin-bottom: 20px;
  }
  .hero-title {
    font-size: clamp(56px, 12vw, 120px); font-weight: 800;
    letter-spacing: 12px; line-height: 0.95;
    color: ${P.fg};
    margin-bottom: 20px;
  }
  .hero-tagline {
    font-size: clamp(14px, 2vw, 18px); color: ${P.fg2};
    max-width: 560px; line-height: 1.7;
    margin-bottom: 40px;
  }
  .hero-meta {
    font-size: 11px; color: ${P.fg3}; letter-spacing: 1.5px; margin-bottom: 48px;
  }

  /* ── CTA buttons ── */
  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 20px; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 22px; border-radius: 8px; font-size: 12px; font-weight: 700;
    letter-spacing: 1.5px; cursor: pointer; text-decoration: none !important;
    border: 1px solid transparent; transition: opacity .2s, background .2s;
  }
  .btn:hover { opacity: 0.85; }
  .btn-primary   { background: ${P.navy}; color: ${P.cream}; border-color: ${P.blue}; }
  .btn-secondary { background: transparent; color: ${P.fg}; border-color: ${P.border2}; }
  .btn-ghost     { background: transparent; color: ${P.gold}; border-color: ${P.gold}44; }
  .btn-x         { background: #000; color: #fff; border-color: #333; }

  /* ── Section ── */
  section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
  .section-label { font-size: 9px; font-weight: 700; letter-spacing: 3px; color: ${P.fg3}; margin-bottom: 16px; }

  /* ── Thumbnails ── */
  .thumbs-section { padding: 60px 0; overflow: hidden; }
  .thumbs-scroll {
    display: flex; gap: 20px; overflow-x: auto; padding: 0 40px 20px;
    scrollbar-width: thin; scrollbar-color: ${P.border2} transparent;
    justify-content: center; flex-wrap: wrap;
  }

  /* ── Card ── */
  .card {
    background: ${P.surface}; border: 1px solid ${P.border}; border-radius: 12px;
    padding: 24px;
  }

  /* ── Brand spec grid ── */
  .brand-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
  @media (max-width: 760px) { .brand-grid { grid-template-columns: 1fr; } }

  /* ── Palette row ── */
  .palette-row { display: flex; gap: 12px; flex-wrap: wrap; }

  /* ── Tokens ── */
  .tokens-block {
    background: ${P.surface2}; border: 1px solid ${P.border2}; border-radius: 8px;
    padding: 24px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px;
    color: ${P.fg2}; white-space: pre; overflow-x: auto; position: relative;
  }
  .copy-btn {
    position: absolute; top: 16px; right: 16px;
    background: ${P.navy}; color: ${P.cream}; border: 1px solid ${P.blue};
    border-radius: 6px; font-size: 10px; font-weight: 700; letter-spacing: 1px;
    padding: 6px 14px; cursor: pointer; font-family: inherit;
  }
  .copy-btn:hover { background: ${P.navyHi}; }

  /* ── PRD ── */
  .prd-body h3 { font-size: 13px; font-weight: 700; letter-spacing: 2px; color: ${P.gold}; margin: 24px 0 10px; }
  .prd-body p, .prd-body li { font-size: 13px; color: ${P.fg2}; line-height: 1.8; }
  .prd-body ul { padding-left: 20px; }
  .prd-body li { margin-bottom: 6px; }
  .prd-body strong { color: ${P.fg}; font-weight: 600; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid ${P.border}; padding: 40px 24px;
    text-align: center; font-size: 11px; color: ${P.fg3};
  }
  .footer-logo { font-size: 14px; font-weight: 800; letter-spacing: 3px; color: ${P.fg2}; margin-bottom: 8px; }
</style>
</head>
<body>

<!-- ── HERO ── -->
<div class="hero">
  <div class="hero-eyebrow">RAM DESIGN STUDIO · ${DATE_STR}</div>
  <div class="hero-title">NOCTURNE</div>
  <div class="hero-tagline">${TAGLINE}</div>
  <div class="hero-meta">INVITE-ONLY · 5 SCREENS · DARK LUXURY · AI CONCIERGE · MOBILE</div>

  <div class="btn-row">
    <a class="btn btn-primary" href="${viewerURL}" target="_blank">Open in Viewer</a>
    <a class="btn btn-secondary" href="${galleryURL}" target="_blank">Gallery</a>
    <a class="btn btn-ghost" onclick="document.getElementById('tokens').scrollIntoView({behavior:'smooth'})">CSS Tokens</a>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(heroURL)}" target="_blank">Share on X</a>
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
    <p style="font-size:16px;font-style:italic;color:${P.fg};line-height:1.8;max-width:800px">"${promptText}"</p>
  </div>
</section>

<!-- ── BRAND SPEC ── -->
<section>
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <!-- Palette -->
    <div class="card">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${P.fg2};margin-bottom:20px">COLOR PALETTE</div>
      <div class="palette-row">${swatchHTML}</div>
    </div>

    <!-- Typography -->
    <div class="card">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${P.fg2};margin-bottom:16px">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>

    <!-- Spacing -->
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

<!-- ── CSS TOKENS ── -->
<section id="tokens">
  <div class="section-label">CSS DESIGN TOKENS</div>
  <div style="position:relative">
    <div class="tokens-block" id="token-code">${cssTokens}</div>
    <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('token-code').innerText).then(()=>{this.textContent='COPIED!';setTimeout(()=>{this.textContent='COPY TOKENS'},1500)})">COPY TOKENS</button>
  </div>
</section>

<!-- ── PRD ── -->
<section>
  <div class="section-label">PRODUCT BRIEF</div>
  <div class="card prd-body">${prd}</div>
</section>

<!-- ── ACTION BUTTONS ── -->
<section style="text-align:center;padding-top:40px;padding-bottom:80px">
  <div class="section-label" style="margin-bottom:24px">EXPLORE THIS DESIGN</div>
  <div class="btn-row">
    <a class="btn btn-primary" href="${viewerURL}" target="_blank">Open in Viewer</a>
    <a class="btn btn-ghost" href="${galleryURL}" target="_blank">View Gallery</a>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(heroURL)}" target="_blank">Share on X</a>
  </div>
</section>

<!-- ── FOOTER ── -->
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

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewerHTML(penJsonStr) {
  let viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NOCTURNE — Viewer · RAM</title>
<style>
  body { background: #000; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Inter', sans-serif; }
  #viewer-root { width: 375px; max-width: 100vw; }
  .screen-nav { display: flex; gap: 8px; justify-content: center; padding: 16px 0; }
  .screen-btn { background: #111; color: #8A8A82; border: 1px solid #1C1C1C; border-radius: 6px; padding: 6px 14px; font-size: 11px; font-weight: 700; letter-spacing: 1px; cursor: pointer; }
  .screen-btn.active { background: #001391; color: #FAF8F3; border-color: #1A2FFB; }
  canvas { display: block; border-radius: 12px; }
  .viewer-header { text-align: center; padding: 24px 0 8px; }
  .viewer-title { font-size: 20px; font-weight: 800; letter-spacing: 4px; color: #F5F5F0; }
  .viewer-sub { font-size: 10px; color: #4A4A44; letter-spacing: 2px; margin-top: 4px; }
</style>
</head>
<body>
<div id="viewer-root">
  <div class="viewer-header">
    <div class="viewer-title">NOCTURNE</div>
    <div class="viewer-sub">PRIVATE MEMBER CONCIERGE · RAM DESIGN STUDIO</div>
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
  const names = ['Invite Gate','Member Home','Dining','AI Chat','Benefits'];

  function hex2rgb(hex) {
    if (!hex || hex === 'transparent') return null;
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt(hex,16);
    return [n>>16, (n>>8)&0xff, n&0xff];
  }
  function parseColor(c) {
    if (!c || c === 'transparent') return null;
    if (c.startsWith('#')) return c;
    return c;
  }

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
      ctx.fillStyle = node.fill || '#F5F5F0';
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
      // frame / rect
      const r = node.cornerRadius || 0;
      if (node.fill && node.fill !== 'transparent') {
        ctx.fillStyle = node.fill;
        if (r) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, r);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, w, h);
        }
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
    ctx.fillStyle = s.fill || '#000';
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
  return viewerTemplate;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌑 NOCTURNE — Design Discovery Pipeline`);
  console.log(`   ${DATE_STR}\n`);

  // Step 1: Publish hero page
  console.log(`📄 Publishing hero page → ram.zenbin.org/${SLUG}`);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML, 'ram');
  console.log(`   Status: ${heroRes.status}`);
  if (heroRes.status !== 201 && heroRes.status !== 200) {
    console.log(`   Body: ${heroRes.body?.slice(0,200)}`);
  }

  // Step 2: Publish viewer
  console.log(`\n🔭 Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}`);
  const viewerHTML = buildViewerHTML(penJsonStr);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} — Viewer`, viewerHTML, 'ram');
  console.log(`   Status: ${viewerRes.status}`);

  // Step 3: Push to gallery queue
  const heroURL2 = `https://ram.zenbin.org/${SLUG}`;
  console.log(`\n📬 Pushing to gallery queue → github.com/${GITHUB_REPO}`);
  const galleryEntry = {
    id:          `nocturne-heartbeat-${Date.now()}`,
    name:        APP_NAME,
    tagline:     TAGLINE,
    slug:        SLUG,
    design_url:  heroURL2,
    viewer_url:  `https://ram.zenbin.org/${VIEWER_SLUG}`,
    archetype:   'Luxury AI Concierge',
    palette:     { bg: P.bg, fg: P.fg, accent: P.navy, accent2: P.gold },
    submitted_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
  };
  const queueRes = await pushGalleryEntry(galleryEntry);
  console.log(`   Status: ${queueRes.status}`);

  console.log(`\n✅ NOCTURNE published!`);
  console.log(`   Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`   Gallery: https://ram.zenbin.org/gallery\n`);
}

main().catch(e => { console.error('Pipeline error:', e.message); process.exit(1); });
