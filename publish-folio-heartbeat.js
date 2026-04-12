'use strict';
// publish-folio-heartbeat.js — Full Design Discovery pipeline for FOLIO heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'folio';
const VIEWER_SLUG = 'folio-viewer';
const APP_NAME    = 'FOLIO';

const P = {
  bg:       '#FAF8F5',
  surface:  '#FFFFFF',
  surface2: '#F3EDE3',
  border:   '#E2D9CC',
  text:     '#1A1614',
  textMid:  '#5C534A',
  textFade: '#9C8E83',
  accent:   '#C25838',
  accent2:  '#5B7B9A',
  green:    '#3D7A5B',
  amber:    '#D4872A',
  purple:   '#7B6FA3',
};

const meta = {
  appName:   'FOLIO',
  tagline:   'Read more. Remember more. A warm editorial reading companion.',
  archetype: 'productivity',
  palette: P,
};

const ORIGINAL_PROMPT = `Design FOLIO — a warm, editorial reading companion app with a parchment-and-ink aesthetic. Inspired by research from this heartbeat session:

1. "Litbix (for book lovers)" — spotted on minimal.gallery. The editorial, text-forward community reading experience. Clean type hierarchy, warm neutral palettes, book-as-object-of-beauty. A sign that the community around reading/books is building a design language of its own.

2. "Dawn: AI for Mental Health" on lapa.ninja — warm, approachable light UI for personal wellness/habit apps. Soft gradients, generous whitespace, comforting data presentation. AI-powered personal tools are moving to warmer, more humanistic palettes.

3. Overall minimal.gallery trend: cream/off-white (#FAF8F5) backgrounds replacing stark white, terracotta/clay (#C25838) accents replacing primary blues, editorial serif/sans pairings, data that feels calming rather than urgent.

The challenge: create the "ideal reading app" that feels like picking up a physical book — warm, tactile, unhurried. 5 screens: Library (current read + book grid) · Book Detail (cover, sessions, progress) · Progress (yearly goal, streaks, bar chart) · Notes & Highlights (quote cards, annotated passages) · Discover (AI taste profile, recommendations, trending).`;

const sub = {
  id:           `heartbeat-folio-${Date.now()}`,
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

const screenNames = ['Library', 'Book Detail', 'Progress', 'Notes & Highlights', 'Discover'];

const prdMarkdown = `## Overview
FOLIO is a reading companion app designed around the principle that reading should feel like reading — unhurried, warm, and personal. Inspired by the "Litbix for book lovers" site on minimal.gallery and the warm AI wellness design trend on lapa.ninja, it uses a parchment-and-ink palette (#FAF8F5 cream + #C25838 terracotta) that treats the interface itself as a book.

## Design Philosophy
**The book as object of beauty.** Color-blocked covers with spine accents replace photography. The background is warm cream, not cold white. Terracotta replaces blue as the primary action color — it reads as ink, warmth, intention. Typography is weight-varied but friendly: 700 for headings, 400 for body, never sterile.

**Inspired directly by:**
- "Litbix (for book lovers)" (minimal.gallery, April 2026) — editorial warmth, text-forward hierarchy, community reading culture
- "Dawn: AI for Mental Health" (lapa.ninja) — warm, approachable light UI for personal habit tracking
- Minimal.gallery general trend: cream backgrounds, clay/terracotta accents, generous breathing room

## Target Users
- **Avid readers** who read 20–40 books per year and want a dedicated companion
- **Goal-setters** tracking yearly reading targets and daily streaks
- **Annotators** who want their highlights and quotes organized beautifully
- **Discoverers** who want AI-curated, taste-profile-aware recommendations

## Core Features
- **Library** — Continue reading card (progress bar, cover, chapter), weekly stats trio (pages/minutes/streak), 6-book grid with color-blocked covers
- **Book Detail** — Parchment shelf hero with large cover, genre pills, reading progress, session history cards, full-width CTA
- **Progress** — Yearly goal card (terracotta, progress bar), streak tracker with day dots, weekly bar chart, completed books list
- **Notes & Highlights** — Large featured quote card, 4 color-coded highlight cards with left accent borders (amber, blue, green, purple)
- **Discover** — AI taste profile card, featured recommendation, trending titles row, genre pill grid

## Design Language
Three core constraints:

1. **Warm parchment canvas (#FAF8F5)** — not "white," not "beige." The specific warmth of aged paper. Every surface and card lifts slightly from this base.
2. **Terracotta action (#C25838)** — ink on parchment. Used for primary CTAs, progress fills, active tab indicators, and the "continue reading" button.
3. **Color-blocked book covers** — each book gets a dominant color + spine accent + subtle title type. No photos. Covers are always slightly taller than wide (3:4 ratio).

Spacing: generous — 20px screen margin, 12px card gutter. Cards use 12–16px radius for soft warmth. Bottom nav with 2px underline for active state.`;

// ── HTTP helpers ───────────────────────────────────────────────────────────────
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

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
}

// ── SVG thumbnail renderer (light-theme aware) ────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / screen.width;
  const scaleY = th / screen.height;

  function renderNode(node, depth = 0) {
    if (depth > 8) return '';
    const children = (node.children || []).map(c => renderNode(c, depth + 1)).join('');
    const x  = (node.x || 0) * scaleX;
    const y  = (node.y || 0) * scaleY;
    const w  = (node.width  || 0) * scaleX;
    const h  = (node.height || 0) * scaleY;
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
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill || P.text}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op}/>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${(((x*100+y*10)|0)+1000).toString().replace('-','')}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:8px;overflow:hidden;border:1px solid ${P.border}">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];

  const THUMB_H = 200;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;color:${P.textFade};margin-top:8px;letter-spacing:1px;max-width:${tw}px">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'PARCHMENT BG' },
    { hex: P.surface, role: 'SURFACE'       },
    { hex: P.text,    role: 'INK TEXT'      },
    { hex: P.accent,  role: 'TERRACOTTA'    },
    { hex: P.accent2, role: 'DUSTY BLUE'    },
    { hex: P.green,   role: 'FOREST GREEN'  },
    { hex: P.amber,   role: 'WARM AMBER'    },
    { hex: P.purple,  role: 'DUSTY PURPLE'  },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:6px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;color:${P.textFade};margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'48px', weight:'700', sample: 'FOLIO', color: P.text },
    { label:'HERO',     size:'22px', weight:'700', sample: 'The Midnight Library', color: P.text },
    { label:'HEADING',  size:'15px', weight:'700', sample: 'Continue Reading · Chapter 14 of 29', color: P.text },
    { label:'BODY',     size:'13px', weight:'400', sample: 'She had never imagined she needed certain things.', color: P.textMid },
    { label:'LABEL',    size:'10px', weight:'600', sample: 'PAGES · MINUTES · STREAK · 48% · THIS WEEK', color: P.textFade },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:8px;letter-spacing:2px;color:${P.textFade};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${t.color};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* FOLIO — Read more. Remember more. */
  /* Inspired by Litbix (minimal.gallery) + Dawn AI wellness (lapa.ninja) */

  /* Color — parchment-and-ink warm editorial system */
  --color-bg:        ${P.bg};        /* warm parchment — aged paper base */
  --color-surface:   ${P.surface};   /* lifted card — pure white */
  --color-surface2:  ${P.surface2};  /* warm cream secondary */
  --color-border:    ${P.border};    /* soft parchment border */
  --color-text:      ${P.text};      /* warm near-black ink */
  --color-mid:       ${P.textMid};   /* warm mid tone */
  --color-muted:     ${P.textFade};  /* faded warm gray */
  --color-action:    ${P.accent};    /* terracotta — ink warmth, primary CTA */
  --color-calm:      ${P.accent2};   /* dusty slate blue — reading calm */
  --color-success:   ${P.green};     /* forest green — completion */
  --color-warm:      ${P.amber};     /* warm amber — streaks, ratings */
  --color-mark:      ${P.purple};    /* dusty lavender — annotations */

  /* Typography — editorial weight contrast */
  --font-family:  -apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif;
  --font-display: 700 22px / 1 var(--font-family);
  --font-heading: 700 15px / 1.3 var(--font-family);
  --font-body:    400 13px / 1.6 var(--font-family);
  --font-label:   600 10px / 1 var(--font-family);
  --font-meta:    400 9px  / 1 var(--font-family);

  /* Spacing — 8px base grid, generous margins */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;

  /* Radius — soft, warm, card-like */
  --radius-sm: 4px;  --radius-md: 12px;  --radius-lg: 16px;  --radius-pill: 9999px;

  /* Book cover spine width */
  --book-spine-ratio: 0.09;
}`;

  const shareText = encodeURIComponent(`FOLIO — a warm editorial reading companion app designed by RAM. Inspired by Litbix (minimal.gallery). Parchment + terracotta. 5 screens.`);
  const penB64 = Buffer.from(JSON.stringify(penJson)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FOLIO — Read more. Remember more. · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.text};font-family:-apple-system,'SF Pro Text','Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;background:${P.surface}}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${P.text}}
  .nav-id{font-size:9px;color:${P.textFade};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .hero-badge{display:inline-block;background:${P.accent}18;color:${P.accent};font-size:9px;font-weight:700;letter-spacing:2.5px;padding:6px 14px;border-radius:20px;border:1px solid ${P.accent}30;margin-bottom:24px}
  h1{font-size:clamp(56px,10vw,96px);font-weight:700;letter-spacing:-2px;line-height:1;margin-bottom:16px;color:${P.text}}
  .sub{font-size:16px;color:${P.textMid};max-width:560px;line-height:1.65;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.textFade};letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${P.accent};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:24px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px;transition:opacity .15s}
  .btn-p{background:${P.accent};color:#fff}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${P.text};border:1px solid ${P.border}}
  .btn-s:hover{border-color:${P.accent}88}
  .btn-c{background:transparent;color:${P.accent};border:1px solid ${P.accent}44}
  .btn-mock{background:${P.accent}12;color:${P.accent};border:1px solid ${P.accent}44;font-weight:700}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.textFade};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${P.border};font-weight:600}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:8px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${P.textMid};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.accent}15;border:1px solid ${P.accent}40;color:${P.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .prompt-section{padding:40px;border-top:1px solid ${P.border};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:10px;font-weight:600}
  .p-text{font-size:15px;color:${P.textMid};font-style:italic;max-width:640px;line-height:1.75;margin-bottom:16px}
  .prd-section{padding:40px;border-top:1px solid ${P.border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.textFade};margin:24px 0 8px;font-weight:700;text-transform:uppercase}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${P.textMid};line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${P.text}}
  footer{padding:24px 40px;border-top:1px solid ${P.border};font-size:10px;color:${P.textFade};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;background:${P.surface}}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:20px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="hero-badge">HEARTBEAT DESIGN · PRODUCTIVITY · APRIL 2026</div>
  <h1>FOLIO</h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>LITBIX · MINIMAL.GALLERY</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#FAF8F5 + #C25838</strong></div>
    <div class="meta-item"><span>THEME</span><strong>LIGHT · PARCHMENT</strong></div>
    <div class="meta-item"><span>TREND</span><strong>WARM EDITORIAL UI</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/folio-mock" target="_blank">✦ Try Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-c" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-s" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN THUMBNAILS — 5 MOBILE SCREENS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:16px;font-weight:600">COLOR PALETTE — PARCHMENT & INK SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:16px;font-weight:600">SPACING SCALE — 8PX BASE GRID</div>
        ${[4,8,12,16,20,24,32].map(sp => `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
          <div style="font-size:10px;color:${P.textFade};width:32px;flex-shrink:0">${sp}px</div>
          <div style="height:8px;border-radius:4px;background:${P.accent};width:${sp*2}px;opacity:0.45"></div>
        </div>`).join('')}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:16px;font-weight:600">TYPE SCALE — EDITORIAL WEIGHT CONTRAST</div>
      ${typeScaleHTML}
    </div>
  </div>

  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;color:${P.textFade};margin-bottom:4px;font-weight:600">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT.replace(/\n/g, '<br>')}</p>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF / PRD</div>
  ${prdMarkdown
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
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · APRIL 2026</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};

  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => showToast('Prompt copied!'));
  }
  function copyTokens() {
    const txt = document.getElementById('cssTokens')?.innerText || '';
    navigator.clipboard.writeText(txt).then(() => showToast('Tokens copied!'));
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

// ── Viewer HTML ───────────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FOLIO Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue ──────────────────────────────────────────────────────────────
async function updateGalleryQueue() {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id:           sub.id,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/folio-mock`,
    submitted_at: sub.submitted_at,
    published_at: sub.published_at,
    credit:       sub.credit,
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: FOLIO to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ FOLIO Design Discovery Pipeline ══\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'folio.pen'), 'utf8'));
  console.log(`✓ Loaded folio.pen (${penJson.children.length} screens)`);

  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML (${(heroHTML.length/1024).toFixed(1)}kb)`);

  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroRes = await publishToZenbin(SLUG, 'FOLIO — Read more. Remember more. · RAM Design Studio', heroHTML);
  console.log(`  Status: ${heroRes.status}`);
  if (heroRes.status === 200) console.log(`  ✓ https://ram.zenbin.org/${SLUG}`);
  else console.log(`  Err: ${heroRes.body.slice(0,200)}`);

  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewRes = await publishToZenbin(VIEWER_SLUG, 'FOLIO Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewRes.status}`);
  if (viewRes.status === 200) console.log(`  ✓ https://ram.zenbin.org/${VIEWER_SLUG}`);
  else console.log(`  Err: ${viewRes.body.slice(0,200)}`);

  console.log('\nUpdating gallery queue...');
  const qRes = await updateGalleryQueue();
  console.log(`  Status: ${qRes.status}`);
  if (qRes.status === 200) console.log('  ✓ Gallery queue updated');
  else console.log(`  Err: ${qRes.body.slice(0,200)}`);

  console.log('\n══ Pipeline complete ══');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/folio-mock`);
})();
