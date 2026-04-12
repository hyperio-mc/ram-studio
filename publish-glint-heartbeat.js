'use strict';
// publish-glint-heartbeat.js
// Full Design Discovery pipeline for GLINT heartbeat design
// Publishes: hero page → ram.zenbin.org/glint
//            viewer   → ram.zenbin.org/glint-viewer
//            gallery  → hyperio-mc/design-studio-queue

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;
const QUEUE_FILE   = config.QUEUE_FILE;

const SLUG        = 'glint';
const VIEWER_SLUG = 'glint-viewer';

// ── Design metadata ───────────────────────────────────────────────────────────
const meta = {
  appName:   'GLINT',
  tagline:   'Generate ideas, polish every word, publish everywhere.',
  archetype: 'AI Writing Assistant',
  palette: {
    bg:      '#070710',
    fg:      '#F0EFF8',
    accent:  '#3DFF9A',
    accent2: '#7C3AED',
    pink:    '#F43F5E',
    amber:   '#FBBF24',
  },
};

const sub = {
  id:           'heartbeat-glint',
  prompt:       'Design an AI writing assistant landing page called GLINT using the word-pill typographic hero style — inspired by OWO\'s colored-capsule word layout on darkmodedesign.com (Mar 20 2026) and Locomotive.ca\'s editorial-bold energy (godly.website). Near-void dark background #070710 + acid green #3DFF9A + violet #7C3AED + hot pink #F43F5E + amber #FBBF24. 10 screens: 5 mobile (Hero/Landing, Editor, Ideas, Publish, Pricing) + 5 desktop equivalents.',
  submitted_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
};

const prd = {
  screenNames: ['Hero', 'Editor', 'Ideas', 'Publish', 'Pricing'],
  markdown: `## Overview
GLINT is an AI-powered writing studio that helps content creators, bloggers, and marketers go from blank page to polished, published post — fast. It generates drafts, learns the user's unique voice, and publishes directly to Substack, Medium, Ghost, LinkedIn, and more.

## Target Users
- **Independent content creators** publishing on Substack, Medium, and newsletters
- **Startup founders & marketers** who need high-quality content but lack dedicated writers
- **Bloggers & SEO writers** who want AI-assisted drafting without losing their voice
- **Agencies** managing content for multiple clients across multiple platforms

## Core Features
- **AI Draft Generation** — Input a title or brief; GLINT generates full drafts in your voice in seconds
- **Voice Learning Model** — Analyzes your existing writing to match your tone, vocabulary, and structure
- **Inline AI Suggestions** — Contextual "make shorter / expand / improve flow" suggestions that appear in-line while you write
- **Idea Sparks** — Generates fresh article angles and headlines on demand; never face a blank page
- **1-Click Publish** — Connect Substack, Medium, Ghost, LinkedIn, WordPress; publish from one dashboard
- **SEO Optimizer** — Real-time SEO scoring and keyword suggestions as you write
- **Grammar & Clarity** — Powered by the latest language models for tone, clarity, and style

## Design Language
Inspired by three specific sources found during research on **March 20, 2026**:

1. **OWO** (darkmodedesign.com) — Word-pill hero: each word of the headline sits inside a distinct colorful rounded capsule on a near-black background. Hot pink, yellow, and purple pills create a bold, playful-yet-premium visual hierarchy. This is the primary design innovation of GLINT — applying this pattern to the hero and feature labels throughout.

2. **Locomotive.ca** (godly.website) — Montreal digital agency site with an electric orange-red (#FF4B2B) background, enormous typographic display text that fills the viewport, and a "Design & Code" editorial positioning. Influenced GLINT's bold headline sizing, the word-layering approach, and the editorial confidence.

3. **Hemispherical Stacks** (minimal.gallery) — Deep purple sci-fi aesthetic with near-void dark tones. Validated the #070710 near-void black with purple undertone for GLINT's background, and the violet accent palette.

The word-pill pattern is intentionally distinct from RAM's previous dashboard/tool designs (AXIS, BEACON, VAULT, etc.). GLINT marks a move toward landing page editorial design — expressive, brand-forward, creative-tool aesthetic rather than dense developer UI.

## Screen Architecture
### Mobile (390×834)
1. **Hero** — Sticky nav + word-pill headline (each word in colored capsule) + tagline + green CTA + feature mini-cards bento
2. **Editor** — Document with inline AI suggestion card + AI command toolbar + bottom AI chat bar + word count
3. **Ideas** — Generate-ideas prompt + saved ideas list with colored sidebar accents + tag pills
4. **Publish** — Current draft card + platform connection grid (Substack, Medium, Ghost, LinkedIn) + schedule option
5. **Pricing** — Toggle monthly/annual + Spark (free) + Flow ($19) + feature lists

### Desktop (1440×900)
6. **Landing** — Full editorial hero with word-pill headline spanning 3 rows + floating editor preview card
7. **Features** — Bento grid layout: large AI drafts card + voice learning + idea sparks + publish + SEO + stats row
8. **Editor** — Left sidebar nav + main document with inline AI + right AI assistant panel with chat
9. **Ideas** — Sidebar nav + generate prompt bar + 3-column idea cards grid with color accents
10. **Pricing** — 3-column plan cards (Spark/Flow/Studio) + guarantee badge`,
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

function getJson(hostname, path_, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path: path_, method: 'GET',
      headers: { 'User-Agent': 'design-studio-agent/1.0', ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.end();
  });
}

function put(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname, path: path_, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length, ...headers },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = (typeof el.fill === 'string') ? el.fill : 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';

  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    if (el.strokeColor && el.strokeWidth) {
      const sw = el.strokeWidth || 1;
      const strokeRect = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${el.strokeColor}" stroke-width="${sw}"${rAttr}/>`;
      const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
      return `${bg}<g transform="translate(${x},${y})">${kids}</g>${strokeRect}`;
    }
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids) return bg;
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    const sf = (typeof el.fill === 'string') ? el.fill : '#3DFF9A';
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${sf}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    const tf = (typeof fill === 'string' && fill !== 'none' && fill !== 'transparent') ? fill : '#F0EFF8';
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w * 0.85}" height="${fh}" fill="${tf}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  const bg = (typeof screen.fill === 'string') ? screen.fill : '#070710';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${bg}"/>${kids}</svg>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111111').replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:11px;letter-spacing:1.5px;opacity:.5;margin:20px 0 8px;font-weight:700">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#1A1A2E;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<li>/g, '<ul style="padding-left:18px;margin:4px 0"><li>')
    .replace(/<\/li>(?!\n<li>)/g, '</li></ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup])/gm, '<p>');
}

// ── Hero HTML builder ─────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const screens  = doc.children || [];
  const surface  = lightenHex(meta.palette.bg, 13);
  const border   = lightenHex(meta.palette.bg, 27);
  const muted    = lightenHex(meta.palette.bg, 74);
  const THUMB_H  = 180;

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = prd.screenNames[i % 5]
      ? `${isMobile ? 'M' : 'D'} · ${prd.screenNames[i % 5]}`
      : `${isMobile ? 'MOBILE' : 'DESKTOP'} ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${meta.palette.fg}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatchHTML = [
    { hex: meta.palette.bg,     role: 'VOID BLACK' },
    { hex: surface,             role: 'SURFACE'    },
    { hex: meta.palette.fg,     role: 'FOREGROUND' },
    { hex: meta.palette.accent, role: 'ACID GREEN' },
    { hex: meta.palette.accent2,role: 'VIOLET'     },
    { hex: meta.palette.pink,   role: 'HOT PINK'   },
    { hex: meta.palette.amber,  role: 'AMBER'      },
  ].map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:52px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:10px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px;color:${meta.palette.fg}">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${meta.palette.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '48px', weight: '900', sample: meta.appName },
    { label: 'HEADING',  size: '22px', weight: '700', sample: meta.tagline },
    { label: 'SUBHEAD',  size: '16px', weight: '600', sample: 'AI Draft Generation · Voice Learning · 1-Click Publish' },
    { label: 'BODY',     size: '14px', weight: '400', sample: 'From blank page to polished post in seconds. GLINT learns your voice.' },
    { label: 'CAPTION',  size: '10px', weight: '700', sample: 'WORD PILL · EDITORIAL HERO · DESIGN SYSTEM' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:8px;color:${meta.palette.fg}">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${meta.palette.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0;color:${meta.palette.fg}">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${meta.palette.accent};width:${sp * 2.2}px;opacity:0.7"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* Color — GLINT Design System */
  --color-bg:        ${meta.palette.bg};
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        ${meta.palette.fg};
  --color-green:     ${meta.palette.accent};
  --color-violet:    ${meta.palette.accent2};
  --color-pink:      ${meta.palette.pink};
  --color-amber:     ${meta.palette.amber};
  --color-muted:     ${muted};

  /* Word-pill system (OWO-inspired) */
  --pill-green-bg:   #0A2618;
  --pill-violet-bg:  #1A0D30;
  --pill-pink-bg:    #2A0A10;
  --pill-amber-bg:   #2A1D06;
  --pill-radius:     9999px;

  /* Semantic */
  --color-primary:   var(--color-green);
  --color-secondary: var(--color-violet);
  --color-danger:    var(--color-pink);
  --color-warn:      var(--color-amber);

  /* Typography */
  --font-display: 900 clamp(40px, 7vw, 80px) / 1.1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-heading: 700 22px / 1.3 -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body:    400 14px / 1.7 -apple-system, BlinkMacSystemFont, sans-serif;
  --font-label:   700 10px / 1 -apple-system, BlinkMacSystemFont, sans-serif;

  /* Spacing — 4px base grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 8px;  --radius-md: 14px;  --radius-lg: 20px;  --radius-pill: 9999px;

  /* Shadows */
  --shadow-green:  0 0 24px ${meta.palette.accent}22;
  --shadow-violet: 0 0 24px ${meta.palette.accent2}22;
  --shadow-card:   0 2px 8px rgba(0,0,0,.7);
}`;

  const shareText = encodeURIComponent(
    `GLINT — AI Writing Assistant. Dark-mode landing page with word-pill typography (OWO-inspired). 10 screens + brand spec + CSS tokens by RAM Design Studio\nhttps://ram.zenbin.org/glint\n#uidesign #aiwriting #designsystem #darkmode`
  );

  const designPrinciplesHTML = [
    { label: 'Word-pill first', desc: 'Headlines are sculptures. Each word is a colored capsule — the layout IS the brand.' },
    { label: 'Voice over chrome', desc: 'The editor disappears. Toolbars fade. Only writing and AI suggestions remain.' },
    { label: 'Color = intent', desc: 'Green = generate/create. Violet = AI/polish. Pink = expand. Amber = publish/schedule.' },
    { label: 'Editorial confidence', desc: 'Big type, bold weight, dark space. GLINT is for serious writers — the UI respects that.' },
  ].map(p => `
    <div style="padding:16px 0;border-bottom:1px solid ${border}">
      <div style="font-size:12px;font-weight:700;color:${meta.palette.accent};margin-bottom:6px">${p.label}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p.desc}</div>
    </div>`).join('');

  const encoded = Buffer.from(JSON.stringify(doc)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.appName} — Design System · RAM Design Studio</title>
<meta name="description" content="${meta.tagline} — AI writing assistant with word-pill typography. 10 screens, brand spec & CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${meta.palette.bg};color:${meta.palette.fg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:900;letter-spacing:4px;color:${meta.palette.accent}}
  .nav-id{font-size:11px;color:${meta.palette.accent2};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:900px}
  .tag{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:20px}
  h1{font-size:clamp(48px,8vw,96px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:20px}
  .sub{font-size:16px;opacity:.5;max-width:500px;line-height:1.6;margin-bottom:36px}
  /* Word-pill demo in hero */
  .pill-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
  .pill{display:inline-flex;align-items:center;padding:8px 20px;border-radius:9999px;font-size:22px;font-weight:900;line-height:1}
  .pill-green{background:#0A2618;color:${meta.palette.accent}}
  .pill-violet{background:#1A0D30;color:${meta.palette.accent2}}
  .pill-pink{background:#2A0A10;color:${meta.palette.pink}}
  .pill-amber{background:#2A1D06;color:${meta.palette.amber}}
  .pill-solid-green{background:${meta.palette.accent};color:${meta.palette.bg}}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${meta.palette.accent}}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px}
  .btn-p{background:${meta.palette.accent};color:${meta.palette.bg}}
  .btn-p:hover{opacity:0.9}
  .btn-s{background:transparent;color:${meta.palette.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${meta.palette.accent}66}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:${meta.palette.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${meta.palette.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:900px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:0}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:${meta.palette.fg};opacity:0.7;white-space:pre;overflow-x:auto;font-family:'Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${meta.palette.accent}22;border:1px solid ${meta.palette.accent}44;color:${meta.palette.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${meta.palette.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin-bottom:12px}
  .p-text{font-size:18px;opacity:.6;font-style:italic;max-width:620px;line-height:1.6;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:10px;letter-spacing:2px;color:${meta.palette.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.65;line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${meta.palette.fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${meta.palette.accent};color:${meta.palette.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">✦ GLINT</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">PRODUCTION DESIGN SYSTEM · ${meta.archetype.toUpperCase()} · ${new Date(sub.submitted_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>${meta.appName}</h1>

  <!-- Word-pill demo inline in hero — the signature GLINT pattern -->
  <div class="pill-row">
    <span class="pill pill-solid-green">Generate</span>
    <span class="pill pill-violet">ideas,</span>
    <span class="pill pill-pink">polish</span>
  </div>
  <div class="pill-row">
    <span class="pill pill-amber">every</span>
    <span class="pill pill-violet">word,</span>
    <span class="pill pill-green">publish</span>
  </div>
  <div class="pill-row" style="margin-bottom:32px">
    <span class="pill pill-green">everywhere.</span>
  </div>

  <p class="sub">${meta.tagline} Inspired by OWO's word-pill typography (darkmodedesign.com) and Locomotive.ca's editorial boldness (godly.website).</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>${meta.archetype.toUpperCase()}</strong></div>
    <div class="meta-item"><span>SIGNATURE PATTERN</span><strong>WORD-PILL HERO</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>CREDIT</span><strong>${sub.credit}</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
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
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;color:${meta.palette.fg}">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0;color:${meta.palette.fg}">TYPE SCALE</div>
      ${typeScaleHTML}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px;color:${meta.palette.fg}">SPACING SYSTEM · 4PX BASE GRID</div>
      ${spacingHTML}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0;color:${meta.palette.fg}">DESIGN PRINCIPLES</div>
      ${designPrinciplesHTML}
    </div>
  </div>
  <div style="margin-top:40px">
    <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0;color:${meta.palette.fg}">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="tokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text" id="prompt-text">${sub.prompt}</p>
  <div style="font-size:11px;opacity:.3">RAM Design Heartbeat · ${new Date(sub.submitted_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF · PRD</div>
  <div>${mdToHtml(prd.markdown)}</div>
</section>

<footer>
  <span>RAM DESIGN STUDIO · ${new Date().getFullYear()}</span>
  <span>ram.zenbin.org/glint</span>
  <span>pencil.dev v2.8 · 10 screens</span>
</footer>

<script>
const PEN_B64 = "${encoded}";
function getPen() { return JSON.parse(atob(PEN_B64)); }
function openInViewer() { window.open('https://ram.zenbin.org/glint-viewer','_blank'); }
function downloadPen() {
  const blob = new Blob([JSON.stringify(getPen(),null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'glint.pen'; a.click();
}
function copyPrompt() {
  navigator.clipboard.writeText(document.getElementById('prompt-text').textContent);
  showToast();
}
function copyTokens() {
  navigator.clipboard.writeText(document.getElementById('tokens').textContent);
  showToast();
}
function shareOnX() {
  window.open('https://twitter.com/intent/tweet?text=${shareText}','_blank');
}
function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2000);
}
</script>
</body>
</html>`;
}

// ── Viewer HTML ────────────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const viewerPath = path.join(__dirname, 'penviewer.html');
  let viewerHtml;
  if (fs.existsSync(viewerPath)) {
    viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  } else {
    // Fallback minimal viewer
    viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GLINT Viewer</title>
    <script>window.EMBEDDED_PEN = null;<\/script></head><body style="background:#070710;color:#F0EFF8;font-family:sans-serif;padding:40px">
    <h1>GLINT Viewer</h1><p>penviewer.html not found — pen embedded.</p></body></html>`;
  }
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  // Insert before first <script> tag
  const insertAt = viewerHtml.indexOf('<script>');
  if (insertAt !== -1) {
    viewerHtml = viewerHtml.slice(0, insertAt) + injection + '\n' + viewerHtml.slice(insertAt);
  } else {
    viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
  }
  return viewerHtml;
}

// ── Zenbin publish ─────────────────────────────────────────────────────────────
async function publishToZenbin(slug, html, subdomain = 'ram') {
  console.log(`  → Publishing to ${subdomain}.zenbin.org/${slug} …`);
  const body = JSON.stringify({ html });
  const res = await post('zenbin.org', `/v1/pages/${slug}`, body, {
    'X-Subdomain': subdomain,
  });
  if (res.status === 200 || res.status === 201) {
    console.log(`  ✓ Published: https://${subdomain}.zenbin.org/${slug}`);
    return true;
  } else {
    console.error(`  ✗ Zenbin error ${res.status}: ${res.body.slice(0, 200)}`);
    return false;
  }
}

// ── GitHub queue ───────────────────────────────────────────────────────────────
async function pushToGalleryQueue(entry) {
  const authHeader = { Authorization: `token ${GITHUB_TOKEN}` };
  const apiBase = 'api.github.com';
  const filePath = `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`;

  console.log('  → Fetching gallery queue from GitHub…');
  const getRes = await getJson(apiBase, filePath, authHeader);
  if (getRes.status !== 200) {
    console.error(`  ✗ GitHub GET failed (${getRes.status}): ${getRes.body.slice(0, 120)}`);
    return false;
  }

  const fileData = JSON.parse(getRes.body);
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue;
  try { queue = JSON.parse(currentContent); } catch { queue = []; }
  if (!Array.isArray(queue)) queue = [];

  // Remove duplicate id
  const filtered = queue.filter(e => e.id !== entry.id);
  filtered.unshift(entry);

  const newContent = Buffer.from(JSON.stringify(filtered, null, 2)).toString('base64');
  const putRes = await put(apiBase, filePath, JSON.stringify({
    message: `Add ${entry.id} to gallery queue`,
    content: newContent,
    sha: fileData.sha,
  }), { ...authHeader, 'User-Agent': 'design-studio-agent/1.0' });

  if (putRes.status === 200 || putRes.status === 201) {
    console.log(`  ✓ Gallery queue updated (${filtered.length} entries)`);
    return true;
  } else {
    console.error(`  ✗ GitHub PUT failed (${putRes.status}): ${putRes.body.slice(0, 120)}`);
    return false;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  GLINT — Design Discovery Pipeline                ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  // 1. Load pen
  const penPath = path.join(__dirname, 'glint.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ glint.pen not found — run glint-app.js first');
    process.exit(1);
  }
  const penJson = fs.readFileSync(penPath, 'utf8');
  const doc = JSON.parse(penJson);
  console.log(`✓ Loaded glint.pen — ${doc.children.length} screens`);

  // 2. Build hero HTML
  console.log('\n[1/4] Building hero page…');
  const heroHtml = buildHeroHTML(doc, penJson);
  fs.writeFileSync(path.join(__dirname, 'glint-hero.html'), heroHtml);
  console.log('  ✓ glint-hero.html written');

  // 3. Build viewer HTML
  console.log('\n[2/4] Building viewer…');
  const viewerHtml = await buildViewerHTML(penJson);
  fs.writeFileSync(path.join(__dirname, 'glint-viewer.html'), viewerHtml);
  console.log('  ✓ glint-viewer.html written');

  // 4. Publish to Zenbin
  console.log('\n[3/4] Publishing to Zenbin…');
  await publishToZenbin(SLUG, heroHtml);
  await publishToZenbin(VIEWER_SLUG, viewerHtml);

  // 5. Gallery queue
  console.log('\n[4/4] Adding to gallery queue…');
  const queueEntry = {
    id:          sub.id,
    appName:     meta.appName,
    tagline:     meta.tagline,
    archetype:   meta.archetype,
    design_url:  `https://ram.zenbin.org/${SLUG}`,
    viewer_url:  `https://ram.zenbin.org/${VIEWER_SLUG}`,
    palette:     meta.palette,
    screens:     doc.children.length,
    submitted_at: sub.submitted_at,
    credit:      sub.credit,
    prompt:      sub.prompt,
  };
  await pushToGalleryQueue(queueEntry);

  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  ✓ Pipeline complete                               ║');
  console.log(`║  Hero:   https://ram.zenbin.org/${SLUG.padEnd(18)}║`);
  console.log(`║  Viewer: https://ram.zenbin.org/${VIEWER_SLUG.padEnd(18)}║`);
  console.log('╚═══════════════════════════════════════════════════╝\n');
}

main().catch(err => {
  console.error('✗ Pipeline failed:', err);
  process.exit(1);
});
