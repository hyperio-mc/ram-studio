'use strict';
// publish-bask-heartbeat.js — Full Design Discovery pipeline for BASK heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'bask';
const VIEWER_SLUG = 'bask-viewer';
const APP_NAME    = 'BASK';

const meta = {
  appName:   'BASK',
  tagline:   'Ambient work rhythm companion. Deep focus, without the noise.',
  archetype: 'productivity',
  palette: {
    bg:      '#F5F1EC',
    surface: '#FFFFFF',
    fg:      '#1C1917',
    accent:  '#C47A40',
    accent2: '#3D8B5F',
    muted:   'rgba(28,25,23,0.42)',
  },
  lightPalette: {
    bg:      '#F5F1EC',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#C47A40',
    accent2: '#3D8B5F',
    muted:   'rgba(28,25,23,0.42)',
  },
};

const ORIGINAL_PROMPT = `Design BASK — an ambient work rhythm companion for makers and designers. Inspired by three discoveries from this heartbeat's research:
1. Amie.so (godly.website) — "AI Note Taker without a bot" framing: a clean LIGHT theme product that positions AI as invisible, woven-in, never chatbot-intrusive. Warm off-white backgrounds, restrained typography, AI-enhanced but ambient.
2. AuthKit by WorkOS (godly.website) — ultra-minimal auth card UI: white cards on off-white backgrounds, soft box shadows, clean 12px border radii, gentle hairline borders. That card-on-linen surface pattern drives BASK's entire design system.
3. land-book.com light SaaS trend (Voy, Sanity): warm linen-white backgrounds (#F5F1EC), large hero numerals as primary UI element (session timer = 34px bold), thin supporting labels with generous tracking.
Theme: LIGHT. Warm linen background (#F5F1EC), white cards (#FFFFFF), terracotta amber accent (#C47A40), forest-green success (#3D8B5F), calm blue (#4674B8). The challenge: design an AI productivity tool that feels like a quiet notebook rather than a dashboard. AI insight appears as ambient whispers, not popups. 5 screens: Today (intention + focus blocks) · Focus (active session timer, ambient AI nudge) · Insights (weekly chart + AI patterns) · Log (session history) · Settings (AI toggles + quiet hours).`;

const sub = {
  id:           `heartbeat-bask-${Date.now()}`,
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
  screenNames: ['Today', 'Focus', 'Insights', 'Log', 'Settings'],
  markdown: `## Overview
BASK is a calm, ambient AI work companion that helps makers build deep focus habits — without a single chatbot popup. Inspired by Amie's "AI without a bot" positioning (godly.website) and AuthKit's minimal card language (workos.com/authkit), BASK treats AI as invisible infrastructure: it surfaces insights only when they're useful, never when they're loud.

## Design Philosophy
**Quiet over clever.** Most productivity tools signal their AI features with glowing gradients and chat UIs. BASK does the opposite. Warm linen canvas (#F5F1EC), white cards with soft 12px radius, hairline borders, amber accent (#C47A40) only where it matters. The session timer is 34px bold — the work IS the design.

**Inspired by:**
- Amie.so (godly.website) — ambient AI framing, warm light palette, "without the bot" positioning
- AuthKit/WorkOS (godly.website) — white card on off-white bg, soft shadow, minimal stroke system
- land-book.com light SaaS trend (Voy, Sanity) — linen whites, hero numerals, thin label tracking

## Target Users
- **Designers and makers** — deep work practitioners who want calm, not dashboards
- **Remote freelancers** — tracking billable focus time without friction
- **Indie hackers** — building in public, wanting a quiet rhythm tracker
- **Knowledge workers** — anyone trying to protect 2+ hours of daily deep work

## Core Features
- **Today** — Morning intention set quietly by AI at 8AM, focus block timeline with live status, daily score strip (Flow Score · Sessions · Deep Hours)
- **Focus** — Minimal circular session timer (34px), ambient AI whisper card ("You're 8 min ahead"), distraction block indicator, Pause/Note/End controls
- **Insights** — 7-day deep work bar chart (today highlighted in amber), 4 AI pattern cards (Peak Hours · Avg Session · Best Day · Distractions), weekly observation from Bask AI, 12-day streak card
- **Log** — Filterable session history with color-coded left-border cards (amber=active, green=complete, blue=review), date groupings, duration pills
- **Settings** — Profile card, 4 ambient AI toggles (Nudges · Morning Brief · Weekly Patterns · Distraction Block), Quiet Hours configuration

## Design Language
Three constraints drive the BASK visual system:
1. **Linen canvas** (#F5F1EC) — warm, paper-like background. Not stark white, not gray. Feels like a physical notebook.
2. **Terracotta amber** (#C47A40) — the only warm accent. Used for active states, AI identity (the ✦ symbol), and navigation active indicators.
3. **AI as whisper** — AI insights appear in surface2 panels with a ✦ prefix and "Bask · ambient nudge" attribution. No modal, no chatbot, no glow.

Type system: System UI (SF Pro / Inter). Display weight 700 for session timers and daily scores. Label weight 600, 8-9px, tracked at 0.8-1.2px. Body 400/500, 10-12px. Generous line height (1.4-1.6) throughout.

## Screen Architecture
1. **Today** — Warm greeting + avatar, amber-accented intention card with left-bar, 4 focus block cards (color-coded status), daily score strip
2. **Focus** — Minimal circular ring timer (approximated arc at ~52%), 34px bold time display, 3-button control row, ambient AI nudge, distractions-blocked strip
3. **Insights** — 7-bar deep work chart with avg line, 2×2 pattern metric grid, amber observation panel, streak card with record badge
4. **Log** — Tab filter strip (amber active tab), dated session entries with left-border color coding, duration pills, overflow handled gracefully
5. **Settings** — Profile with avatar + plan badge, 4 AI toggle rows with animated pills, Quiet Hours card with edit link`,
};

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

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

// ── SVG thumbnail renderer ─────────────────────────────────────────────────────
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
    const cr   = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX,scaleY)}"` : '';
    const sw   = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX,scaleY) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';

    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w/2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fw = ['700','800','900'].includes(String(node.fontWeight)) ? ' font-weight="bold"' : '';
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill||'#1C1917'}" text-anchor="${anchor}"${op}${fw}>${(node.content||'').slice(0,30).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      const sw2 = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX,scaleY) : 0;
      const strokeStr2 = sw2 > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw2}"` : '';
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op}${strokeStr2}/>`;
    }
    if (node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${((x*100+y*10)|0)}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:10px;overflow:hidden;border:1px solid #E4DED5;box-shadow:0 2px 12px rgba(28,25,23,0.08)">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ──────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];

  // Light theme palette
  const BG      = meta.palette.bg;       // linen
  const SURFACE = meta.palette.surface;  // white
  const FG      = meta.palette.fg;       // warm near-black
  const ACCENT  = meta.palette.accent;   // amber
  const GREEN   = meta.palette.accent2;  // green
  const BORDER  = '#E4DED5';
  const FG2     = '#695F56';
  const FG3     = '#A89E96';

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = prd.screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;color:${FG3};margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: BG,       role: 'LINEN BG'    },
    { hex: SURFACE,  role: 'CARD'        },
    { hex: FG,       role: 'FG WARM'     },
    { hex: ACCENT,   role: 'AMBER'       },
    { hex: GREEN,    role: 'FOREST GRN'  },
    { hex: '#4674B8',role: 'CALM BLUE'   },
    { hex: '#C45050',role: 'MUTED ROSE'  },
  ];
  const swatchHTML = swatches.map(sw => {
    const isDark = parseInt(sw.hex.replace('#','').slice(0,2),16) < 80;
    const labelFg = isDark ? '#fff' : FG;
    return `<div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${BORDER};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;color:${FG3};margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${ACCENT}">${sw.hex}</div>
    </div>`;
  }).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '56px', weight: '700', sample: '1:02:17' },
    { label: 'HERO',     size: '28px', weight: '700', sample: 'BASK — Ambient Work Rhythm' },
    { label: 'HEADING',  size: '16px', weight: '600', sample: 'Design Sprint · Active' },
    { label: 'BODY',     size: '12px', weight: '400', sample: 'You\'re 8 min ahead of your usual pace — Bask' },
    { label: 'LABEL',    size: '9px',  weight: '600', sample: 'FLOW SCORE · DEEP WORK · AMBIENT' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${BORDER}">
      <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${FG};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4,8,16,24,32,48,64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:10px;color:${FG3};width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:8px;border-radius:4px;background:${ACCENT};width:${sp*2}px;opacity:0.5"></div>
    </div>`).join('');

  const cssTokens = `:root {
  /* BASK — Ambient Work Rhythm */
  /* Inspired by Amie.so + AuthKit (godly.website) + land-book light SaaS */

  /* Color — warm linen, ambient accent system */
  --color-bg:        ${BG};          /* warm linen canvas */
  --color-surface:   ${SURFACE};     /* white card */
  --color-surface2:  #FAF8F5;        /* off-white inner panel */
  --color-border:    ${BORDER};      /* hairline warm border */
  --color-fg:        ${FG};          /* warm near-black */
  --color-fg2:       #695F56;        /* warm mid-gray */
  --color-fg3:       #A89E96;        /* warm muted */
  --color-amber:     ${ACCENT};      /* terracotta amber — active/AI */
  --color-amber-lo:  #C47A4015;      /* amber wash */
  --color-green:     ${GREEN};       /* forest green — done/positive */
  --color-green-lo:  #3D8B5F15;      /* green wash */
  --color-blue:      #4674B8;        /* calm blue — info */
  --color-rose:      #C45050;        /* muted rose — warning */

  /* Typography — system UI, warm and readable */
  --font-family:     -apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif;
  --font-display:    700 clamp(32px, 8vw, 56px) / 1 var(--font-family);
  --font-heading:    600 16px / 1.4 var(--font-family);
  --font-body:       400 12px / 1.6 var(--font-family);
  --font-label:      600 9px / 1 var(--font-family);

  /* Spacing — 4px base */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;

  /* Elevation — card shadow system */
  --shadow-card:   0 2px 12px rgba(28,25,23,0.07);
  --shadow-subtle: 0 1px  6px rgba(28,25,23,0.05);

  /* Radius */
  --radius-sm: 6px;  --radius-md: 12px;  --radius-lg: 20px;  --radius-pill: 9999px;
}`;

  const shareText = encodeURIComponent(`BASK — ambient AI work rhythm companion. Light theme, warm linen palette, "AI without a bot" design. Made by RAM Design.`);
  const penB64 = Buffer.from(JSON.stringify(penJson)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BASK — Ambient Work Rhythm · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${BG};color:${FG};font-family:-apple-system,'SF Pro Text','Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${BORDER};display:flex;justify-content:space-between;align-items:center;background:${SURFACE}}
  .logo{font-size:12px;font-weight:700;letter-spacing:3px;color:${FG}}
  .nav-tag{font-size:9px;color:${ACCENT};letter-spacing:1px;background:${ACCENT}15;padding:4px 10px;border-radius:20px;font-weight:600}
  .hero{padding:72px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${ACCENT};margin-bottom:14px;font-weight:600}
  h1{font-size:clamp(48px,9vw,88px);font-weight:700;letter-spacing:-2px;line-height:1;margin-bottom:14px;color:${FG}}
  .sub{font-size:15px;color:${FG2};max-width:520px;line-height:1.65;margin-bottom:28px}
  .meta{display:flex;gap:28px;margin-bottom:36px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:8px;color:${FG3};letter-spacing:1px;margin-bottom:4px;font-weight:600}
  .meta-item strong{color:${FG};font-size:13px;font-weight:700}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.4px}
  .btn-p{background:${ACCENT};color:#fff}
  .btn-p:hover{opacity:.85}
  .btn-s{background:${SURFACE};color:${FG};border:1px solid ${BORDER};box-shadow:0 1px 4px rgba(28,25,23,0.06)}
  .btn-s:hover{border-color:${ACCENT}88}
  .btn-mock{background:${ACCENT}15;color:${ACCENT};border:1px solid ${ACCENT}44;font-weight:700}
  .btn-g{background:${GREEN}15;color:${GREEN};border:1px solid ${GREEN}44}
  .preview{padding:0 40px 80px}
  .section-label{font-size:8px;letter-spacing:3px;color:${FG3};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${BORDER};font-weight:600}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:10px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${ACCENT}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${BORDER};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${SURFACE};border:1px solid ${BORDER};border-radius:10px;padding:20px;margin-top:20px;position:relative;box-shadow:0 1px 6px rgba(28,25,23,0.05)}
  .tokens-pre{font-size:10px;line-height:1.8;color:${FG2};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${ACCENT}18;border:1px solid ${ACCENT}44;color:${ACCENT};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${ACCENT}30}
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
  footer{padding:24px 40px;border-top:1px solid ${BORDER};font-size:10px;color:${FG3};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;background:${SURFACE}}
  .toast{position:fixed;bottom:24px;right:24px;background:${ACCENT};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .ai-note{background:${ACCENT}12;border:1px solid ${ACCENT}30;border-radius:10px;padding:16px 20px;margin-bottom:32px;max-width:520px}
  .ai-note .ai-label{font-size:8px;color:${ACCENT};font-weight:700;letter-spacing:1px;margin-bottom:6px}
  .ai-note p{font-size:13px;color:${FG};line-height:1.6}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-tag">✦ Heartbeat Design</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · PRODUCTIVITY · MARCH 2026</div>
  <h1>BASK</h1>
  <p class="sub">${meta.tagline}</p>

  <div class="ai-note">
    <div class="ai-label">✦ DESIGN INSPIRATION</div>
    <p>Inspired by Amie's "AI without a bot" positioning and AuthKit's minimal card language — both discovered on godly.website. The trend: AI tools that feel like quiet notebooks, not dashboards.</p>
  </div>

  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>THEME</span><strong>LIGHT · LINEN</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>AMIE + AUTHKIT</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#C47A40 + #F5F1EC</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/bask-mock" target="_blank">✦ Try Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-s" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-g" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">𝕏 Share</a>
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
      <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:16px;font-weight:600">COLOR PALETTE — WARM LINEN + AMBIENT ACCENT</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:16px;font-weight:600">SPACING SCALE — 4PX BASE GRID</div>
        ${spacingHTML}
      </div>
    </div>
    <div>
      <div style="font-size:8px;letter-spacing:2px;color:${FG3};margin-bottom:16px;font-weight:600">TYPE SCALE — SYSTEM UI</div>
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
  <div class="section-label">PRODUCT BRIEF / PRD</div>
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
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · MARCH 2026</span>
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

// ── Viewer HTML builder ────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BASK Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue update ────────────────────────────────────────────────────────
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
  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) {
    queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  }
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/bask-mock`,
    submitted_at: sub.submitted_at,
    published_at: sub.published_at,
    credit:       sub.credit,
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: BASK to gallery (heartbeat)`,
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

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ BASK Design Discovery Pipeline ══\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'bask.pen'), 'utf8'));
  console.log(`✓ Loaded bask.pen (${penJson.children.length} screens)`);

  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penJson);
  console.log(`  ✓ Hero HTML built (${(heroHTML.length/1024).toFixed(1)}kb)`);

  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penJson);
  console.log(`  ✓ Viewer HTML built (${(viewerHTML.length/1024).toFixed(1)}kb)`);

  console.log(`\nPublishing hero → ram.zenbin.org/${SLUG} ...`);
  const heroResult = await publishToZenbin(SLUG, `BASK — Ambient Work Rhythm · RAM Design Studio`, heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) {
    console.log(`  ✓ Live at https://ram.zenbin.org/${SLUG}`);
  } else {
    console.log(`  Response: ${heroResult.body.slice(0, 200)}`);
  }

  console.log(`\nPublishing viewer → ram.zenbin.org/${VIEWER_SLUG} ...`);
  const viewerResult = await publishToZenbin(VIEWER_SLUG, 'BASK Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) {
    console.log(`  ✓ Live at https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.log(`  Response: ${viewerResult.body.slice(0, 200)}`);
  }

  console.log('\nUpdating gallery queue...');
  try {
    const queueResult = await updateGalleryQueue();
    console.log(`  Status: ${queueResult.status}`);
    if (queueResult.status === 200) {
      console.log('  ✓ Gallery queue updated');
    } else {
      console.log(`  Response: ${queueResult.body.slice(0,200)}`);
    }
  } catch(e) {
    console.log('  ⚠ Queue update failed:', e.message);
  }

  console.log('\n══ Pipeline complete ══');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/bask-mock`);
})();
