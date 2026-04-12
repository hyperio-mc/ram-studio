'use strict';
// publish-driftwood-heartbeat.js
// Full Design Discovery pipeline for DRIFTWOOD
// Design Heartbeat — March 22, 2026

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'driftwood-heartbeat';
const VIEWER_SLUG = 'driftwood-viewer';
const DATE_STR    = 'March 22, 2026';
const APP_NAME    = 'DRIFTWOOD';
const TAGLINE     = 'Slow living journal. A sanctuary for reflection.';
const ARCHETYPE   = 'health';

const ORIGINAL_PROMPT = `Design a 5-screen dark-mode slow-living journal app — DRIFTWOOD — inspired by:
1. "with.radiance" (Awwwards nominees, March 2026) — natural-material bioluminescent glow aesthetic
   entering digital interfaces: warm organic forms, luminous amber glows
2. "Minimalism Life" (darkmodedesign.com) — slow-living dark UI with generous whitespace,
   zero visual noise, serif-adjacent typography
3. "Kyn & Folk" artisan ceramics + "Zia Tile" handcrafted tile (land-book.com) —
   translating warmth of handmade objects into digital UI feel
DRIFTWOOD is a mindful daily journaling app that feels like a candlelit notebook rather than a productivity tool.
Palette: deep forest night #0E1209 bg, #C4843A aged amber accent, #4A7C59 sage secondary, #F0E6C8 parchment text.
5 screens: Today (streak + quick-entry + recent entries), Write (full writing surface with keyboard + mood),
Timeline (dot-calendar heatmap + week entries), Insights (streak hero + mood chart + writing patterns + themes), Profile (avatar + milestones + intentions + settings).`;

// ── Palette (matches driftwood-app.js exactly) ────────────────────────────────
const P = {
  bg:       '#0E1209',
  surface:  '#161C10',
  surface2: '#1D2416',
  surface3: '#242D1B',
  border:   '#1F2919',
  border2:  '#2D3822',
  muted:    '#4A5840',
  muted2:   '#7A8A68',
  cream:    '#F0E6C8',
  cream2:   '#C8BCA0',
  amber:    '#C4843A',
  amberLo:  '#C4843A20',
  amberHi:  '#DFA060',
  sage:     '#4A7C59',
  sageHi:   '#6FAF82',
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
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 300) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

function ghReq(opts, body) {
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

// ── SVG rendering helpers ──────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';

  if (el.type === 'frame') {
    const bg = fill !== 'transparent' && fill !== 'none'
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`
      : '';
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids && !bg) return '';
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
    const tx = el.textAlign === 'center' ? x + w / 2 : el.textAlign === 'right' ? x + w : x;
    const ty = y + (el.fontSize || 13) * 1.1;
    const fw = el.fontWeight || '400';
    const fs = el.fontSize || 13;
    const opa = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
    const content = (el.content || '').split('\n')[0].slice(0, 48);
    if (!content.trim()) return '';
    const escaped = content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<text x="${tx}" y="${ty}" font-size="${fs}" font-weight="${fw}" fill="${fill}" text-anchor="${anchor}"${opa} font-family="system-ui,sans-serif">${escaped}</text>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:12px;flex-shrink:0;border:1px solid ${P.border2}"><rect width="${sw}" height="${sh}" fill="${screen.fill || P.bg}"/>${kids}</svg>`;
}

// ── Hero page builder ──────────────────────────────────────────────────────────
function buildHeroHTML(doc, penJson) {
  const encoded  = Buffer.from(JSON.stringify(penJson)).toString('base64');
  const screens  = doc.children || [];
  const viewerURL = `https://ram.zenbin.org/${VIEWER_SLUG}`;

  const THUMB_H = 200;
  const screenNames = ['Today', 'Write', 'Timeline', 'Insights', 'Profile'];

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = screenNames[i] || `Screen ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.45;margin-top:8px;letter-spacing:1.5px;color:${P.amber}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: P.bg,      role: 'BACKGROUND'  },
    { hex: P.surface, role: 'SURFACE'     },
    { hex: P.cream,   role: 'FOREGROUND'  },
    { hex: P.amber,   role: 'AMBER'       },
    { hex: P.sage,    role: 'SAGE'        },
    { hex: P.amberHi, role: 'AMBER HI'    },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:80px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border2};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.amber}">${sw.hex}</div>
    </div>`).join('');

  // CSS tokens
  const cssTokens = `/* DRIFTWOOD — Design Tokens */
:root {
  --dw-bg:        ${P.bg};
  --dw-surface:   ${P.surface};
  --dw-surface2:  ${P.surface2};
  --dw-border:    ${P.border};
  --dw-border2:   ${P.border2};
  --dw-cream:     ${P.cream};
  --dw-cream2:    ${P.cream2};
  --dw-muted:     ${P.muted};
  --dw-muted2:    ${P.muted2};
  --dw-amber:     ${P.amber};
  --dw-amber-hi:  ${P.amberHi};
  --dw-amber-lo:  ${P.amberLo};
  --dw-sage:      ${P.sage};
  --dw-sage-hi:   ${P.sageHi};
}`;

  const PRD = `## Overview
DRIFTWOOD is a slow-living journaling app designed to be a quiet, warm sanctuary — not a productivity tool. Inspired by the craft-object aesthetic found in contemporary handmade goods and the "with.radiance" bioluminescent glow trend emerging on Awwwards (March 2026), it prioritises unhurried reflection over streak gamification.

## Target Users
- Thoughtful millennials and adults 25–45 seeking intentional digital habits
- Former productivity-app users fatigued by optimisation culture
- Writers, artists, and therapists using journaling as practice
- People recovering from burnout who need a gentle, non-judgmental space

## Core Features
- **Daily entry**: tap-to-open writing surface with ambient atmosphere and auto-save
- **Mood tracking**: 5-state emoji picker (Calm, Good, Grounded, Heavy, Charged)
- **Streak counter**: motivational but gentle — no punishment for missing days
- **Dot calendar**: heatmap-style month view showing writing frequency
- **Insights**: mood distribution, writing patterns (time-of-day, word count), theme extraction
- **Intentions**: personalised intention statement shown in Profile
- **Export**: iCloud backup, Markdown export, PDF journal book

## Design Language
Deep forest night palette — \`#0E1209\` background evokes dark soil and shadow. Aged amber \`#C4843A\` provides warmth without aggression: candlelight, not fluorescent. Sage \`#4A7C59\` signals growth and calm. Parchment cream \`#F0E6C8\` for text — warmer and more natural than pure white. Soft ambient glow (Glow utility) behind key elements creates the bioluminescent effect from "with.radiance". Zero sharp corners; everything is rounded and organic.

## Screen Architecture
1. **Today** — Daily entry hero + streak badge + recent 3 entries list
2. **Write** — Full-screen writing surface with mood picker, formatting toolbar, keyboard overlay
3. **Timeline** — Month dot-calendar heatmap + this week's entries with mood icons
4. **Insights** — Streak hero card, mood distribution bar, writing heatmap by day, theme tags
5. **Profile** — Avatar + milestone badges + personal intention + preferences/settings`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — RAM Design Studio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.cream};font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
  a{color:${P.amberHi};text-decoration:none}
  a:hover{text-decoration:underline}
  .container{max-width:1100px;margin:0 auto;padding:0 24px}

  /* Hero */
  .hero{padding:72px 0 48px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:500px;height:300px;background:radial-gradient(ellipse,${P.amber}18 0%,transparent 70%);pointer-events:none}
  .hero-label{font-size:10px;letter-spacing:3px;color:${P.amber};text-transform:uppercase;margin-bottom:20px}
  .hero-name{font-size:clamp(56px,8vw,96px);font-weight:200;letter-spacing:-2px;color:${P.cream};line-height:1;margin-bottom:16px}
  .hero-tagline{font-size:18px;color:${P.cream2};font-weight:300;margin-bottom:40px;opacity:.8}
  .hero-prompt{font-size:15px;font-style:italic;color:${P.cream2};max-width:680px;margin:0 auto 40px;line-height:1.7;opacity:.7;border-left:2px solid ${P.amber};padding-left:20px;text-align:left}

  /* Buttons */
  .btn-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:48px}
  .btn{padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:.3px;cursor:pointer;border:none;transition:opacity .2s}
  .btn-primary{background:${P.amber};color:${P.bg}}
  .btn-secondary{background:transparent;color:${P.cream};border:1px solid ${P.border2}}
  .btn-ghost{background:${P.surface};color:${P.cream2};border:1px solid ${P.border}}
  .btn:hover{opacity:.85}

  /* Thumbs */
  .thumbs-wrap{overflow-x:auto;padding:8px 24px 20px;-webkit-overflow-scrolling:touch}
  .thumbs{display:flex;gap:20px;width:max-content;margin:0 auto}

  /* Spec sections */
  .section{padding:48px 0;border-top:1px solid ${P.border}}
  .section-label{font-size:10px;letter-spacing:2.5px;color:${P.amber};text-transform:uppercase;margin-bottom:28px;font-weight:700}
  .swatch-row{display:flex;gap:14px;flex-wrap:wrap}
  .type-scale-row{display:flex;flex-direction:column;gap:12px}
  .type-item{display:flex;align-items:baseline;gap:16px}
  .type-meta{font-size:9px;letter-spacing:1.5px;color:${P.muted2};width:90px;flex-shrink:0;text-transform:uppercase}

  /* Tokens */
  .tokens-block{background:${P.surface};border:1px solid ${P.border2};border-radius:12px;padding:20px 24px;position:relative;overflow:auto}
  .tokens-block pre{font-family:'JetBrains Mono','Fira Code',monospace;font-size:12px;color:${P.cream2};line-height:1.7;white-space:pre}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.surface2};border:1px solid ${P.border2};color:${P.amberHi};padding:6px 14px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;letter-spacing:.5px}
  .copy-btn:hover{background:${P.amber};color:${P.bg}}

  /* PRD */
  .prd{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:32px;line-height:1.75;color:${P.cream2}}
  .prd h3{color:${P.cream};font-size:15px;font-weight:700;margin:24px 0 10px;letter-spacing:.2px}
  .prd h3:first-child{margin-top:0}
  .prd p{font-size:14px;margin-bottom:12px}
  .prd ul{padding-left:20px;font-size:14px}
  .prd li{margin-bottom:6px}
  .prd strong{color:${P.amberHi}}

  /* Principles */
  .principles{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:16px}
  .principle{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:18px}
  .principle-title{font-size:12px;font-weight:700;color:${P.amber};margin-bottom:8px;letter-spacing:.5px}
  .principle-body{font-size:12px;color:${P.muted2};line-height:1.6}

  /* Footer */
  .footer{padding:32px 0;border-top:1px solid ${P.border};text-align:center;color:${P.muted2};font-size:12px}
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="container">
    <div class="hero-label">RAM Design Heartbeat · ${DATE_STR}</div>
    <div class="hero-name">${APP_NAME}</div>
    <div class="hero-tagline">${TAGLINE}</div>
    <p class="hero-prompt">${ORIGINAL_PROMPT.replace(/\n/g, '<br>')}</p>
    <div class="btn-row">
      <a href="${viewerURL}" target="_blank"><button class="btn btn-primary">▶ Open in Viewer</button></a>
      <button class="btn btn-secondary" onclick="downloadPen()">⬇ Download .pen</button>
      <button class="btn btn-ghost" onclick="copyPrompt()">⎘ Copy Prompt</button>
      <a href="https://ram.zenbin.org/gallery" target="_blank"><button class="btn btn-ghost">◈ Gallery</button></a>
    </div>
  </div>
</div>

<!-- SCREEN THUMBNAILS -->
<div class="thumbs-wrap">
  <div class="thumbs">${thumbsHTML}</div>
</div>

<div class="container">

  <!-- PALETTE -->
  <div class="section">
    <div class="section-label">Color Palette</div>
    <div class="swatch-row">${swatchHTML}</div>
  </div>

  <!-- TYPE SCALE -->
  <div class="section">
    <div class="section-label">Type Scale</div>
    <div class="type-scale-row">
      <div class="type-item">
        <div class="type-meta">DISPLAY · 58px · 800</div>
        <div style="font-size:clamp(28px,5vw,58px);font-weight:800;color:${P.cream};line-height:1">47</div>
      </div>
      <div class="type-item">
        <div class="type-meta">HEADING · 38px · 300</div>
        <div style="font-size:clamp(22px,4vw,38px);font-weight:300;color:${P.cream};line-height:1">Sunday</div>
      </div>
      <div class="type-item">
        <div class="type-meta">BODY · 14px · 400</div>
        <div style="font-size:14px;color:${P.cream2};line-height:1.75">The morning light filters through the blinds, soft and unassuming.</div>
      </div>
      <div class="type-item">
        <div class="type-meta">LABEL · 10px · 700</div>
        <div style="font-size:10px;font-weight:700;color:${P.amber};letter-spacing:2.5px">TODAY · MARCH 22</div>
      </div>
    </div>
  </div>

  <!-- DESIGN PRINCIPLES -->
  <div class="section">
    <div class="section-label">Design Principles</div>
    <div class="principles">
      <div class="principle">
        <div class="principle-title">SLOW BY DESIGN</div>
        <div class="principle-body">No confetti, no urgency. Interactions are deliberate, pace is unhurried. The app breathes.</div>
      </div>
      <div class="principle">
        <div class="principle-title">WARMTH OVER FUNCTION</div>
        <div class="principle-body">Amber glow, parchment text, dark forest bg. Feels like candlelight on paper, not a screen.</div>
      </div>
      <div class="principle">
        <div class="principle-title">CONTEXT NOT CONTENT</div>
        <div class="principle-body">UI is frame, not decoration. The writing surface is always the hero. Interface recedes.</div>
      </div>
      <div class="principle">
        <div class="principle-title">ORGANIC GEOMETRY</div>
        <div class="principle-body">All radii are generous. No sharp corners. Every element is rounded, soft, and natural.</div>
      </div>
    </div>
  </div>

  <!-- CSS TOKENS -->
  <div class="section">
    <div class="section-label">CSS Design Tokens</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre id="tokens-pre">${cssTokens}</pre>
    </div>
  </div>

  <!-- PRODUCT BRIEF -->
  <div class="section">
    <div class="section-label">Product Brief</div>
    <div class="prd" id="prd-content">
      <h3>Overview</h3>
      <p>DRIFTWOOD is a slow-living journaling app designed to be a quiet, warm sanctuary — not a productivity tool. Inspired by the craft-object aesthetic found in contemporary handmade goods and the "with.radiance" bioluminescent glow trend emerging on Awwwards (March 2026), it prioritises unhurried reflection over streak gamification.</p>
      <h3>Target Users</h3>
      <ul>
        <li>Thoughtful millennials and adults 25–45 seeking intentional digital habits</li>
        <li>Former productivity-app users fatigued by optimisation culture</li>
        <li>Writers, artists, and therapists using journaling as practice</li>
        <li>People recovering from burnout who need a gentle, non-judgmental space</li>
      </ul>
      <h3>Core Features</h3>
      <ul>
        <li><strong>Daily entry</strong>: tap-to-open writing surface with ambient atmosphere and auto-save</li>
        <li><strong>Mood tracking</strong>: 5-state emoji picker (Calm, Good, Grounded, Heavy, Charged)</li>
        <li><strong>Streak counter</strong>: motivational but gentle — no punishment for missing days</li>
        <li><strong>Dot calendar</strong>: heatmap-style month view showing writing frequency by intensity</li>
        <li><strong>Insights</strong>: mood distribution, writing patterns, theme extraction from entries</li>
        <li><strong>Intentions</strong>: personal intention statement set by user, shown in Profile</li>
        <li><strong>Export</strong>: iCloud backup, Markdown export, PDF journal book</li>
      </ul>
      <h3>Design Language</h3>
      <p>Deep forest night palette — <strong>#0E1209</strong> background evokes dark soil and shadow. Aged amber <strong>#C4843A</strong> provides warmth without aggression. Sage <strong>#4A7C59</strong> signals growth and calm. Parchment cream <strong>#F0E6C8</strong> for text — warmer than pure white. Ambient glow utility creates the bioluminescent effect from "with.radiance". Zero sharp corners.</p>
      <h3>Screen Architecture</h3>
      <ul>
        <li><strong>Today</strong> — Daily entry hero + streak badge + recent 3 entries list</li>
        <li><strong>Write</strong> — Full-screen writing surface with mood picker, formatting toolbar, keyboard overlay</li>
        <li><strong>Timeline</strong> — Month dot-calendar heatmap + this week's entries with mood icons</li>
        <li><strong>Insights</strong> — Streak hero card, mood distribution, writing heatmap by day, theme tags</li>
        <li><strong>Profile</strong> — Avatar + milestone badges + personal intention + preferences/settings</li>
      </ul>
    </div>
  </div>

</div>

<!-- FOOTER -->
<div class="footer">
  <div class="container">
    <a href="${viewerURL}" target="_blank">Viewer →</a> ·
    <a href="https://ram.zenbin.org/gallery" target="_blank">Gallery →</a> ·
    RAM Design Heartbeat · ${DATE_STR}
  </div>
</div>

<script>
  const PEN_B64 = '${encoded}';
  function downloadPen() {
    const bytes = atob(PEN_B64);
    const arr   = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'driftwood.pen';
    a.click();
  }
  function copyPrompt() {
    navigator.clipboard.writeText(${JSON.stringify(ORIGINAL_PROMPT)}).then(() => alert('Prompt copied!'));
  }
  function copyTokens() {
    const t = document.getElementById('tokens-pre').textContent;
    navigator.clipboard.writeText(t).then(() => {
      const b = document.querySelector('.copy-btn');
      b.textContent = '✓ COPIED';
      setTimeout(() => b.textContent = 'COPY TOKENS', 1500);
    });
  }
</script>
</body>
</html>`;
}

// ── Viewer builder ─────────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'axon-viewer.html'), 'utf8');
  const penStr   = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌿 DRIFTWOOD — Design Heartbeat Pipeline`);
  console.log(`   Date: ${DATE_STR}\n`);

  // Load pen
  const penPath = path.join(__dirname, 'driftwood.pen');
  const penJson = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`[1/4] Loaded pen: ${penJson.children.length} screens`);

  // Hero
  console.log(`\n[2/4] Building + publishing hero page…`);
  const heroHTML = buildHeroHTML(penJson, penJson);
  console.log(`  Hero HTML: ${(heroHTML.length / 1024).toFixed(1)} KB`);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`  → ${heroRes.status}  ${heroRes.body.slice(0, 120)}`);

  // Viewer
  console.log(`\n[3/4] Building + publishing viewer…`);
  const viewerHTML = buildViewerHTML(penJson);
  console.log(`  Viewer HTML: ${(viewerHTML.length / 1024).toFixed(1)} KB`);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`  → ${viewerRes.status}  ${viewerRes.body.slice(0, 120)}`);

  // Gallery
  console.log(`\n[4/4] Updating gallery queue…`);
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id:           `heartbeat-driftwood-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/driftwood-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    }
  }, putBody);
  console.log(`  → Gallery: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 150)}`);

  console.log('\n✓ Pipeline complete!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/driftwood-mock  (run driftwood-mock.mjs next)`);
}

main().catch(console.error);
