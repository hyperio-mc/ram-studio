'use strict';
// neuralvault-publish.js — Full Design Discovery pipeline for NeuralVault
// Publishes hero page, viewer, and adds to gallery queue.

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG     = 'neuralvault';
const APP_NAME = 'NeuralVault';
const TAGLINE  = 'AI-Powered DeFi Portfolio Intelligence.';
const ARCHETYPE = 'finance';
const PROMPT   = 'Design a 5-screen dark-mode DeFi AI portfolio tracker inspired by the #1 trending Dribbble shot "Crypto Trading App UI – DeFi Mobile Design" (Nixtio, 12.7k views) and Superset.sh\'s terminal/matrix aesthetic from darkmodedesign.com. Void black (#0A0B0F), neon emerald (#00FF88), electric cyan (#00D4FF), bento-grid card layout, monospace number typography, neural confidence segment bars for AI signals. Screens: Portfolio Overview, Markets Feed, Trade/Swap, Analytics, AI Signals.';

const palette = {
  bg:      '#0A0B0F',
  surface: '#111318',
  fg:      '#E8EAF0',
  accent:  '#00FF88',
  accent2: '#00D4FF',
};

// ─────────────────────────────────────────────────────────────────────────────
function req(opts, body) {
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

async function publish(slug, html, title, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const res = await req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
  if (res.status !== 200 && res.status !== 201) throw new Error(`publish failed ${res.status}: ${res.body.slice(0,200)}`);
  return JSON.parse(res.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// Load .pen
const penJson = fs.readFileSync(path.join(__dirname, 'neuralvault.pen'), 'utf8');
const doc     = JSON.parse(penJson);
const screens = doc.children || [];

// ─────────────────────────────────────────────────────────────────────────────
// Screen thumbnail SVG renderer (minimal wireframe thumbnails)
function screenThumbSVG(screen, tw, th) {
  const sx = screen.width  || 390;
  const sy = screen.height || 844;
  const scaleX = tw / sx;
  const scaleY = th / sy;

  function renderNode(node, depth = 0) {
    if (!node || depth > 6) return '';
    const x = (node.x || 0) * scaleX;
    const y = (node.y || 0) * scaleY;
    const w = (node.width  || 0) * scaleX;
    const h = (node.height || 0) * scaleY;
    if (w < 1 || h < 1) return '';
    const fill   = node.fill   || 'transparent';
    const r      = (node.cornerRadius || 0) * Math.min(scaleX, scaleY);
    const stroke = node.stroke ? node.stroke.fill : 'none';
    const sw     = node.stroke ? (node.stroke.thickness || 1) * Math.min(scaleX, scaleY) : 0;
    const opacity = node.opacity !== undefined ? node.opacity : 1;

    let out = '';
    if (node.type === 'frame') {
      const clipId = node.clip ? `clip-${node.id}` : null;
      if (fill !== 'transparent' && fill) {
        out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${r.toFixed(1)}" fill="${fill}" opacity="${opacity}" ${stroke !== 'none' ? `stroke="${stroke}" stroke-width="${sw.toFixed(1)}"` : ''}/>`;
      }
      if (node.children) {
        const inner = node.children.map(c => {
          const child = { ...c, x: (c.x || 0) + (node.x || 0), y: (c.y || 0) + (node.y || 0) };
          return renderNode(child, depth + 1);
        }).join('');
        out += inner;
      }
    } else if (node.type === 'text') {
      const sz = Math.max(3, (node.fontSize || 13) * Math.min(scaleX, scaleY) * 1.2);
      if (sz >= 3) {
        const textX = node.textAlign === 'right' ? x + w : node.textAlign === 'center' ? x + w / 2 : x;
        const anchor = node.textAlign === 'right' ? 'end' : node.textAlign === 'center' ? 'middle' : 'start';
        const textY = y + h / 2 + sz * 0.35;
        const safe = (node.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0, 40);
        out += `<text x="${textX.toFixed(1)}" y="${textY.toFixed(1)}" font-size="${sz.toFixed(1)}" fill="${node.fill || '#E8EAF0'}" opacity="${opacity}" text-anchor="${anchor}" font-weight="${node.fontWeight || 400}">${safe}</text>`;
      }
    } else if (node.type === 'ellipse') {
      const cx = x + w / 2, cy = y + h / 2;
      const rx = w / 2, ry = h / 2;
      out += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${fill}" opacity="${opacity}" ${stroke !== 'none' ? `stroke="${stroke}" stroke-width="${sw.toFixed(1)}"` : ''}/>`;
    }
    return out;
  }

  const content = (screen.children || []).map(n => renderNode(n, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" style="border-radius:8px;overflow:hidden">
    <rect width="${tw}" height="${th}" fill="${screen.fill || '#0A0B0F'}"/>
    ${content}
  </svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build hero page
function buildHeroHTML() {
  const P = palette;
  const bg      = P.bg;
  const surface = '#111318';
  const border  = '#1E2330';
  const muted   = '#3A3F52';

  const THUMB_H = 200;
  const screenNames = ['Portfolio', 'Markets', 'Trade', 'Analytics', 'AI Signals'];
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:2px;color:${P.accent}">${screenNames[i] ? screenNames[i].toUpperCase() : 'SCREEN ' + (i+1)}</div>
    </div>`;
  }).join('');

  const swatchHTML = [
    { hex: P.bg, role: 'VOID BLACK' },
    { hex: P.surface, role: 'SURFACE' },
    { hex: P.fg, role: 'FOREGROUND' },
    { hex: P.accent, role: 'NEON EMERALD' },
    { hex: P.accent2, role: 'ELECTRIC CYAN' },
    { hex: '#9B6DFF', role: 'NEURAL VIOLET' },
  ].map(sw => `
    <div style="flex:1;min-width:80px">
      <div style="height:64px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:10px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px;color:${P.fg}">${sw.role}</div>
      <div style="font-size:12px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'48px', weight:'900', sample: APP_NAME },
    { label:'HEADING',  size:'24px', weight:'700', sample: TAGLINE },
    { label:'BODY',     size:'14px', weight:'400', sample: 'Neural confidence: 87% · Market timing: 73%' },
    { label:'MONO/DATA','size':'20px', weight:'700', sample: '$247,831 · +1.73%' },
    { label:'LABEL',    size:'9px',  weight:'700', sample: 'AI SIGNAL · NEURAL CONFIDENCE' },
  ].map(t => `
    <div style="border-bottom:1px solid ${border};padding:16px 0;display:flex;align-items:baseline;gap:24px">
      <div style="width:80px;font-size:9px;letter-spacing:1.5px;opacity:.4;color:${P.fg};flex-shrink:0">${t.label}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};color:${t.size === '9px' ? P.accent : P.fg};letter-spacing:${t.size === '9px' ? '2px' : '0'}">${t.sample}</div>
    </div>`).join('');

  const principles = [
    { title: 'Data Density', body: 'Every pixel serves information. Bento grid cards maximize scanning speed — price, change, spark, AI signal all visible in one glance.' },
    { title: 'Neural Identity', body: 'AI confidence is shown through segmented bar meters — a new pattern that makes abstract ML probability tangible and scannable.' },
    { title: 'Terminal Aesthetic', body: 'Void black (#0A0B0F) + neon emerald borrows from the terminal/matrix aesthetic of AI-native tools like Superset.sh.' },
    { title: 'Signal Hierarchy', body: 'Color encodes direction: emerald = bull/long, cyan = neutral positive, amber = caution, red = bear/short. Consistent across all 5 screens.' },
  ].map(p => `
    <div style="background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;flex:1;min-width:200px">
      <div style="font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:10px">${p.title.toUpperCase()}</div>
      <div style="font-size:13px;line-height:1.6;opacity:.7;color:${P.fg}">${p.body}</div>
    </div>`).join('');

  const cssTokens = `/* NeuralVault Design Tokens */
:root {
  /* Colors */
  --nv-bg:          ${P.bg};
  --nv-surface:     ${P.surface};
  --nv-surface-2:   #161921;
  --nv-surface-3:   #1C2029;
  --nv-border:      #1E2330;
  --nv-border-2:    #252B3B;
  --nv-fg:          ${P.fg};
  --nv-fg-2:        #7B8099;
  --nv-fg-3:        #3A3F52;
  --nv-emerald:     #00FF88;
  --nv-cyan:        ${P.accent2};
  --nv-purple:      #9B6DFF;
  --nv-red:         #FF4560;
  --nv-amber:       #FFB020;

  /* Typography */
  --nv-font:        -apple-system, 'SF Pro Display', system-ui, sans-serif;
  --nv-font-mono:   'SF Mono', 'Fira Code', monospace;
  --nv-size-display: 42px;
  --nv-size-h1:     24px;
  --nv-size-body:   13px;
  --nv-size-label:  9px;

  /* Spacing */
  --nv-space-xs:    4px;
  --nv-space-sm:    8px;
  --nv-space-md:    16px;
  --nv-space-lg:    24px;
  --nv-space-xl:    32px;

  /* Radius */
  --nv-radius-sm:   8px;
  --nv-radius-md:   12px;
  --nv-radius-pill: 20px;

  /* Shadows */
  --nv-glow-emerald: 0 0 20px rgba(0,255,136,.15);
  --nv-glow-cyan:    0 0 20px rgba(0,212,255,.12);
}`;

  const prd = `## Overview
NeuralVault is a mobile-first DeFi portfolio intelligence platform that combines real-time cryptocurrency portfolio tracking with AI-powered trading signals. Built for active DeFi traders who want institutional-grade analysis in a sleek dark-mode interface.

The core differentiator: an AI neural engine that processes millions of on-chain and off-chain data points to generate confidence-scored trading signals — displayed through a novel "Neural Confidence Bar" UI component that makes probability tangible.

## Target Users
- **Active DeFi traders** — managing 3–10 assets, trading multiple times per week
- **Yield farmers** — tracking APY across protocols, seeking optimal entry/exit
- **Crypto-native power users** — comfortable with technical analysis, want AI augmentation

## Core Features
- **Portfolio Overview** — Total AUM, per-asset bento cards with mini spark charts, real-time PnL, AI signal banner
- **Markets Feed** — Live token list with AI signal badges, fear/greed index, dominance stats, trending filters
- **Trade/Swap** — Multi-step swap interface with AI confidence analysis, slippage controls, route optimization
- **Analytics** — Monthly PnL chart, portfolio allocation doughnut, key metrics (Sharpe, drawdown, win rate)
- **AI Signals** — Active trade signals with direction, confidence meters (TP/SL/horizon), one-tap execution

## Design Language
Terminal-meets-DeFi. Void black backgrounds, neon emerald primary accent, electric cyan secondary. Monospace numerals for all price/financial data. Bento grid card layout for maximum information density. Neural confidence bars as a new interaction pattern for AI probability display.

## Screen Architecture
1. **Portfolio** (home) — hero balance + 2×2 bento grid + activity feed
2. **Markets** — searchable live feed + market stats strip + trending assets
3. **Trade** — token pair selector + AI confidence panel + swap details
4. **Analytics** — time-range chart + allocation + key metric cards
5. **Signals** — AI engine status + 4 active signals with confidence bars`;

  const penB64 = Buffer.from(penJson).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${bg}; color: ${P.fg}; font-family: -apple-system, 'SF Pro Display', system-ui, sans-serif; line-height: 1.6; }
  a { color: ${P.accent}; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .section { max-width: 1100px; margin: 0 auto; padding: 80px 24px; }
  .label { font-size: 9px; letter-spacing: 2.5px; font-weight: 700; color: ${P.accent}; text-transform: uppercase; }
  pre { background: #0D0E14; border: 1px solid ${border}; border-radius: 10px; padding: 24px; overflow-x: auto; font-size: 12px; line-height: 1.7; color: ${P.fg}; font-family: 'SF Mono', 'Fira Code', monospace; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; text-decoration: none; transition: opacity .2s; }
  .btn:hover { opacity: .8; text-decoration: none; }
  .btn-primary { background: ${P.accent}; color: ${bg}; }
  .btn-secondary { background: transparent; border: 1px solid ${border}; color: ${P.fg}; }
  .btn-cyan { background: ${P.accent2}; color: ${bg}; }
</style>
</head>
<body>

<!-- HERO -->
<div style="border-bottom:1px solid ${border};padding:120px 24px 80px;text-align:center;background:radial-gradient(ellipse 60% 40% at 50% 0%, #00FF8808 0%, transparent 70%)">
  <div class="label" style="margin-bottom:20px">RAM Design Heartbeat · March 2026</div>
  <h1 style="font-size:clamp(48px,8vw,96px);font-weight:900;line-height:1;letter-spacing:-2px;margin-bottom:16px">
    <span style="color:${P.accent}">Neural</span>Vault
  </h1>
  <p style="font-size:clamp(18px,2.5vw,28px);opacity:.6;max-width:600px;margin:0 auto 40px">${TAGLINE}</p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn btn-primary">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn btn-cyan">⚡ Try Interactive Mock</a>
    <a href="https://zenbin.org/gallery" class="btn btn-secondary">Gallery</a>
  </div>
</div>

<!-- SCREEN THUMBNAILS -->
<div class="section">
  <div class="label" style="margin-bottom:24px">Screens · ${screens.length} total</div>
  <div style="display:flex;gap:20px;overflow-x:auto;padding-bottom:16px">${thumbsHTML}</div>
</div>

<!-- BRAND SPEC: PALETTE -->
<div class="section" style="border-top:1px solid ${border}">
  <div class="label" style="margin-bottom:32px">Brand Spec · Color Palette</div>
  <div style="display:flex;gap:16px;flex-wrap:wrap">${swatchHTML}</div>
</div>

<!-- TYPE SCALE -->
<div class="section" style="border-top:1px solid ${border}">
  <div class="label" style="margin-bottom:24px">Brand Spec · Type Scale</div>
  ${typeScaleHTML}
</div>

<!-- DESIGN PRINCIPLES -->
<div class="section" style="border-top:1px solid ${border}">
  <div class="label" style="margin-bottom:24px">Brand Spec · Design Principles</div>
  <div style="display:flex;gap:16px;flex-wrap:wrap">${principles}</div>
</div>

<!-- CSS TOKENS -->
<div class="section" style="border-top:1px solid ${border}">
  <div class="label" style="margin-bottom:24px">CSS Design Tokens</div>
  <div style="position:relative">
    <pre id="tokens">${cssTokens}</pre>
    <button onclick="navigator.clipboard.writeText(document.getElementById('tokens').textContent);this.textContent='Copied!';setTimeout(()=>this.textContent='Copy Tokens',2000)"
      style="position:absolute;top:12px;right:12px;background:${P.accent};color:${bg};border:none;padding:6px 14px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">
      Copy Tokens
    </button>
  </div>
</div>

<!-- PROMPT -->
<div class="section" style="border-top:1px solid ${border}">
  <div class="label" style="margin-bottom:20px">Original Prompt</div>
  <p style="font-size:20px;font-style:italic;opacity:.7;line-height:1.7;max-width:800px">"${PROMPT}"</p>
</div>

<!-- PRD -->
<div class="section" style="border-top:1px solid ${border}">
  <div class="label" style="margin-bottom:24px">Product Brief / PRD</div>
  <div style="max-width:800px;opacity:.8;line-height:1.8">
    ${prd.split('\n').map(line => {
      if (line.startsWith('## ')) return `<h2 style="font-size:20px;font-weight:700;margin:32px 0 12px;color:${P.accent}">${line.slice(3)}</h2>`;
      if (line.startsWith('- **')) return `<li style="margin:6px 0 6px 20px;color:${P.fg}">${line.slice(2).replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${P.fg}">$1</strong>`)}</li>`;
      if (line.trim() === '') return '<br>';
      return `<p style="margin-bottom:10px">${line.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${P.fg}">$1</strong>`)}</p>`;
    }).join('')}
  </div>
</div>

<!-- ACTION BUTTONS -->
<div style="border-top:1px solid ${border};padding:60px 24px;text-align:center">
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn btn-primary">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn btn-cyan">⚡ Try Interactive Mock</a>
    <a href="data:application/json;base64,${penB64}" download="${SLUG}.pen" class="btn btn-secondary">Download .pen</a>
    <button onclick="navigator.clipboard.writeText('${PROMPT.replace(/'/g,"\\'")}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy Prompt',2000)"
      class="btn btn-secondary">Copy Prompt</button>
    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`NeuralVault — AI-Powered DeFi Portfolio Intelligence\n\n${TAGLINE}\n\nhttps://ram.zenbin.org/${SLUG}`)}" target="_blank" class="btn btn-secondary">Share on X</a>
    <a href="https://zenbin.org/gallery" class="btn btn-secondary">Gallery</a>
  </div>
  <div style="margin-top:40px;font-size:12px;opacity:.3">Generated by RAM Design AI · ram.zenbin.org</div>
</div>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build viewer HTML
function buildViewerHTML() {
  const rawViewer = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Pencil Viewer</title>
<style>
  body { margin:0; background:#0A0B0F; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:system-ui,sans-serif; }
  #viewer-root { width:100%; max-width:1400px; }
</style>
<script>
window.PENCIL_VIEWER_CONFIG = { theme: 'dark' };
</script>
</head>
<body>
<div id="viewer-root">
  <div style="color:#E8EAF0;text-align:center;padding:60px;opacity:.5">
    Loading NeuralVault design...
  </div>
</div>
<script src="https://viewer.pencil.dev/v2/viewer.js"></script>
<script>
if(window.PencilViewer && window.EMBEDDED_PEN) {
  PencilViewer.init('#viewer-root', { pen: JSON.parse(window.EMBEDDED_PEN) });
}
</script>
</body>
</html>`;

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  return rawViewer.replace('<script>', injection + '\n<script>');
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📐 Building hero page...');
  const heroHTML = buildHeroHTML();

  console.log('🖥  Building viewer...');
  const viewerHTML = buildViewerHTML();

  console.log('🚀 Publishing hero →', `ram.zenbin.org/${SLUG}`);
  const heroRes = await publish(SLUG, heroHTML, `${APP_NAME} — ${TAGLINE}`);
  console.log('   Hero:', heroRes.url || `https://ram.zenbin.org/${SLUG}`);

  console.log('🚀 Publishing viewer →', `ram.zenbin.org/${SLUG}-viewer`);
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHTML, `${APP_NAME} — Viewer`);
  console.log('   Viewer:', viewerRes.url || `https://ram.zenbin.org/${SLUG}-viewer`);

  // ── Gallery queue ──
  console.log('📋 Updating gallery queue...');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log('   Gallery queue:', putRes.status === 200 ? '✅ OK' : `⚠️  ${putRes.body.slice(0,100)}`);

  console.log('\n✅ Pipeline complete!');
  console.log('   Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('   Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
  console.log('   Mock:   https://ram.zenbin.org/' + SLUG + '-mock  (build with neuralvault-mock.mjs)');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
