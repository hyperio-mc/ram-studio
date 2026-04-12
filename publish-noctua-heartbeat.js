'use strict';
// publish-noctua-heartbeat.js — Full Design Discovery pipeline for NOCTUA heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'noctua';
const VIEWER_SLUG = 'noctua-viewer';
const APP_NAME    = 'NOCTUA';

const meta = {
  appName:   'NOCTUA',
  tagline:   'Calm AI revenue & focus companion for independent workers.',
  archetype: 'productivity',
  palette: {
    bg:      '#0E0C09',
    surface: '#171410',
    fg:      '#EDD9A3',
    accent:  '#E8924A',
    accent2: '#7B9E87',
    red:     '#C96060',
    muted:   '#7A6A4E',
  },
};

const ORIGINAL_PROMPT = `Design NOCTUA — a calm ambient-aware financial + focus dashboard for freelancers. Inspired by:
1. Midday (darkmodedesign.com) — warm dark time-tracking SaaS for one-person companies; structured data views, warm muted tones, minimal chrome
2. Letta (minimal.gallery / SaaS category) — AI agent framework with calm information hierarchy; sparse interaction, trust through restraint
3. Land-book Sanity CMS hero — editorial section breaks, breathing room between cards
Palette: void warm black #0E0C09 + amber #E8924A + sage green #7B9E87 + warm cream #EDD9A3
5 screens: Today overview · Revenue tracking · Focus session ring · Projects health · AI Insights`;

const prd = {
  screenNames: ['Today', 'Revenue', 'Focus', 'Projects', 'Insights'],
  markdown: `## Overview
NOCTUA is an ambient-aware companion for independent workers — freelancers, consultants, and solo founders — that surfaces revenue health, focus patterns, and project risk without demanding your attention. Unlike typical productivity dashboards, NOCTUA aspires to feel like a warm lamp on a late-night work session: present, informative, non-anxious.

## Design Philosophy
The palette is the philosophy. Where most fintech apps reach for cool blues or "professional" greys, NOCTUA uses warm earth tones — void brown-black (#0E0C09), amber (#E8924A), sage green (#7B9E87), warm cream (#EDD9A3). It positions the product emotionally closer to a notebook or a quality desk lamp than to a Bloomberg terminal.

**Inspired directly by:**
- Midday.ai (darkmodedesign.com) — "Built for the modern freelancer." Warm dark SaaS done with restraint. Calendar-integrated revenue views. One-person company ethos.
- Letta (minimal.gallery SaaS) — AI agent framework with enormous restraint. Large type, massive whitespace, zero decoration.
- Sanity CMS (land-book.com) — Editorial-style section hierarchy; single accent line breaks; content before chrome.

## Target Users
- **Freelancers / independent consultants** tracking income across multiple clients
- **Solo founders** monitoring burn rate vs. earnings
- **Creative professionals** who want focus-mode accountability without Pomodoro anxiety

## Core Features
- **Today** — Revenue earned today vs. yesterday, focus time vs. goal, task queue with status pills
- **Revenue** — MTD progress bar, 6-month bar chart, client breakdown with proportional bars, invoice status
- **Focus** — Ambient donut ring (progress without reading), session log, weekly streak bars
- **Projects** — Health cards with task checklists, risk indicators, budget vs. earned
- **Insights** — AI-generated health score, 3 weekly signal cards (pattern / client / wellbeing)

## Design Language
NOCTUA uses a "calm data" approach — numbers are big and legible but never alarming. Warm amber signals progress; sage green signals positivity; muted warm red signals caution without panic. The ambient ring on the Focus screen is the signature interaction: a glanceable donut that communicates elapsed session time without requiring you to parse a number.`,
};

const sub = {
  id:           `heartbeat-noctua-${Date.now()}`,
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
    const cr   = node.cornerRadius ? ` rx="${node.cornerRadius * Math.min(scaleX, scaleY)}"` : '';
    const sw   = node.stroke?.thickness ? node.stroke.thickness * Math.min(scaleX, scaleY) : 0;
    const strokeStr = sw > 0 ? ` stroke="${node.stroke.fill}" stroke-width="${sw}"` : '';

    if (node.type === 'text') {
      const fs = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const anchor = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w/2 : node.textAlign === 'right' ? x + w : x;
      const ty = y + fs * 0.85;
      const fw = ['700','800','900'].includes(String(node.fontWeight)) ? ' font-weight="bold"' : '';
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${node.fill || meta.palette.fg}" text-anchor="${anchor}"${op}${fw}>${(node.content || '').slice(0, 28).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (node.type === 'ellipse') {
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill}"${op}${strokeStr}/>`;
    }
    const clipId = `fc${depth}_${((Math.abs(x*100+y*10))|0)}`;
    const clipContent = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipAttr = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipContent}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipAttr}>${children}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:10px;overflow:hidden;border:1px solid #2E2924">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML ──────────────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens  = penJson.children || [];
  const P        = meta.palette;
  const border   = '#2E2924';
  const surface  = '#171410';
  const surface2 = '#201D18';

  const THUMB_H = 180;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = prd.screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'VOID WARM BG'   },
    { hex: P.surface, role: 'SURFACE'         },
    { hex: P.fg,      role: 'WARM CREAM'      },
    { hex: P.accent,  role: 'AMBER'           },
    { hex: P.accent2, role: 'SAGE GREEN'      },
    { hex: P.red,     role: 'WARM RED'        },
    { hex: P.muted,   role: 'MUTED EARTH'     },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:52px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',   size:'64px', weight:'900', sample: '$12,000',   color: P.fg   },
    { label:'HERO',      size:'32px', weight:'800', sample: 'Revenue',   color: P.fg   },
    { label:'HEADING',   size:'14px', weight:'600', sample: 'Orion Labs — Brand Identity', color: P.fg },
    { label:'BODY',      size:'12px', weight:'400', sample: 'You\'ve logged over 45 working hours for 4 consecutive weeks.', color: P.fg },
    { label:'MICRO',     size:'8px',  weight:'700', sample: 'REVENUE TODAY · FOCUS TIME · ACTIVE CLIENTS', color: P.muted },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.25;color:${t.color || P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* NOCTUA — Calm AI Revenue & Focus Companion */
  /* Inspired by Midday · Letta · Sanity CMS · calm-tech principle */

  /* Color — warm earth / amber signal system */
  --color-bg:        ${P.bg};       /* void warm black — late-night lamp feel */
  --color-surface:   ${P.surface};   /* warm charcoal card bg */
  --color-surface2:  #201D18;        /* elevated card */
  --color-border:    ${border};      /* warm hairline */
  --color-fg:        ${P.fg};        /* warm cream text */
  --color-amber:     ${P.accent};    /* progress / primary CTA */
  --color-sage:      ${P.accent2};   /* positive / growth */
  --color-red:       ${P.red};       /* caution — muted, non-alarming */
  --color-muted:     ${P.muted};     /* labels / secondary text */

  /* Typography — warm weight system */
  --font-family: -apple-system, 'SF Pro Display', 'Inter', system-ui, sans-serif;
  --font-display: 900 clamp(40px,10vw,72px) / 1 var(--font-family);
  --font-hero:    800 32px / 1.1 var(--font-family);
  --font-heading: 600 14px / 1.3 var(--font-family);
  --font-body:    400 12px / 1.6 var(--font-family);
  --font-micro:   700 8px / 1 var(--font-family);

  /* Spacing — 8px base */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 12px;  --radius-lg: 16px;  --radius-pill: 9999px;
}`;

  const htmlMarkdown = prd.markdown.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^##\s(.+)$/gm, '<h3 style="font-size:13px;font-weight:700;letter-spacing:1px;margin:20px 0 10px;color:'+P.accent+'">$1</h3>').replace(/^-\s(.+)$/gm, '<li style="margin:6px 0;opacity:.7">$1</li>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NOCTUA — Calm AI Companion for Independent Workers · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:-apple-system,'SF Pro Display','Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${P.fg}}
  .nav-tag{font-size:9px;color:${P.accent};letter-spacing:1.5px;opacity:.7}
  .hero{padding:80px 40px 40px;max-width:960px;margin:0 auto}
  .eyebrow{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:16px;text-transform:uppercase}
  h1{font-size:clamp(56px,11vw,104px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${P.fg}}
  .sub{font-size:15px;opacity:.5;max-width:520px;line-height:1.65;margin-bottom:32px}
  .meta-row{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${P.accent};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${P.accent};color:${P.bg}}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${P.accent}66}
  .btn-mock{background:${P.accent}18;color:${P.accent};border:1px solid ${P.accent}44}
  section{padding:60px 40px;max-width:960px;margin:0 auto}
  .section-label{font-size:9px;letter-spacing:2.5px;opacity:.4;margin-bottom:24px;text-transform:uppercase}
  .card{background:${surface};border:1px solid ${border};border-radius:16px;padding:28px}
  .palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:0}
  .thumb-row{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px}
  .thumb-row::-webkit-scrollbar{height:3px}
  .thumb-row::-webkit-scrollbar-track{background:${surface}}
  .thumb-row::-webkit-scrollbar-thumb{background:${border}}
  pre{background:${surface2};border:1px solid ${border};border-radius:10px;padding:20px;overflow-x:auto;font-size:11px;line-height:1.7;color:${P.fg};opacity:.85}
  .prd-body{font-size:13px;line-height:1.8;opacity:.7;max-width:680px}
  .prd-body ul{padding-left:20px}
  .footer{border-top:1px solid ${border};padding:32px 40px;display:flex;justify-content:space-between;align-items:center;opacity:.4;font-size:10px;letter-spacing:1px}
  .glow-accent{position:fixed;top:0;left:0;width:500px;height:500px;background:radial-gradient(circle at 20% 20%, ${P.accent}08 0%, transparent 60%);pointer-events:none;z-index:0}
  .glow-sage{position:fixed;bottom:0;right:0;width:400px;height:400px;background:radial-gradient(circle at 80% 80%, ${P.accent2}06 0%, transparent 60%);pointer-events:none;z-index:0}
  .rel{position:relative;z-index:1}
  @media(max-width:600px){nav,section,.hero{padding-left:20px;padding-right:20px}h1{font-size:48px}}
</style>
</head>
<body>
<div class="glow-accent"></div>
<div class="glow-sage"></div>

<nav class="rel">
  <div class="logo">NOCTUA</div>
  <div class="nav-tag">RAM DESIGN STUDIO · 2026</div>
</nav>

<div class="hero rel">
  <div class="eyebrow">✦ Design Heartbeat · 24 Mar 2026</div>
  <h1>NOCTUA</h1>
  <p class="sub">${meta.tagline} Ambient-aware, anxiety-free dashboard for independent workers. Dark warm palette. 5 screens.</p>

  <div class="meta-row">
    <div class="meta-item"><span>ARCHETYPE</span><strong>Productivity · Fintech</strong></div>
    <div class="meta-item"><span>THEME</span><strong>Dark Warm</strong></div>
    <div class="meta-item"><span>SCREENS</span><strong>5 Mobile</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#0E0C09 · #E8924A · #7B9E87</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>Midday · Letta · Sanity CMS</strong></div>
  </div>

  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/noctua-viewer">Open in Pencil Viewer →</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/noctua-mock">☀◑ Interactive Mock</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/noctua">Hero Page</a>
  </div>
</div>

<section class="rel">
  <div class="section-label">Screen Previews</div>
  <div class="thumb-row">${thumbsHTML}</div>
</section>

<section class="rel">
  <div class="section-label">Colour Palette</div>
  <div class="card">
    <div class="palette-row">${swatchHTML}</div>
  </div>
</section>

<section class="rel">
  <div class="section-label">Type Scale</div>
  <div class="card">${typeScaleHTML}</div>
</section>

<section class="rel">
  <div class="section-label">Design Tokens (CSS)</div>
  <pre>${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
</section>

<section class="rel">
  <div class="section-label">Product Requirements</div>
  <div class="card prd-body">${htmlMarkdown}</div>
</section>

<footer class="rel footer">
  <div>NOCTUA · RAM Design Studio · March 2026</div>
  <div>Inspired by Midday · Letta · Sanity CMS</div>
</footer>
</body>
</html>`;
}

// ── Viewer HTML ────────────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const penStr = JSON.stringify(penJson);
  const P = meta.palette;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NOCTUA — Viewer · RAM Design Studio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:-apple-system,system-ui,sans-serif}
  header{width:100%;padding:16px 24px;border-bottom:1px solid #2E2924;display:flex;align-items:center;justify-content:space-between}
  .logo{font-size:11px;font-weight:700;letter-spacing:4px;color:${P.fg}}
  .tag{font-size:9px;color:${P.accent};letter-spacing:1px}
  #viewer{width:100%;max-width:1400px;flex:1}
</style>
</head>
<body>
<header>
  <div class="logo">NOCTUA</div>
  <div class="tag">RAM DESIGN STUDIO · PENCIL VIEWER</div>
</header>
<div id="viewer"></div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penStr)};
</script>
<script src="https://pencil.zenbin.org/viewer.js"></script>
</body>
</html>`;

  // Proper injection per spec
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── GitHub queue ───────────────────────────────────────────────────────────────
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

  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
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
    message:  `add: ${APP_NAME} to gallery (heartbeat)`,
    content:  newContent,
    sha:      currentSha,
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
  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'noctua.pen'), 'utf8'));

  // a) Hero page
  console.log('Publishing hero page…');
  const heroHTML = buildHeroHTML(penJson);
  const heroRes = await publishToZenbin(SLUG, `NOCTUA — ${meta.tagline}`, heroHTML);
  console.log(`  Hero: ${heroRes.status === 200 ? '✓' : '✗'} → https://ram.zenbin.org/${SLUG}`);

  // b) Viewer
  console.log('Publishing viewer…');
  const viewerHTML = buildViewerHTML(penJson);
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'NOCTUA — Pencil Viewer', viewerHTML);
  console.log(`  Viewer: ${viewerRes.status === 200 ? '✓' : '✗'} → https://ram.zenbin.org/${VIEWER_SLUG}`);

  // d) Gallery queue
  console.log('Updating gallery queue…');
  try {
    const queueRes = await updateGalleryQueue();
    console.log(`  Queue: ${queueRes.status === 200 ? '✓' : '✗ ' + queueRes.body.slice(0, 80)}`);
  } catch (e) {
    console.log('  Queue error:', e.message);
  }

  console.log('\n✓ Done — NOCTUA published');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
