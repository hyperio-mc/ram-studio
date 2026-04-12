'use strict';
// publish-onyx-heartbeat.js
// Full Design Discovery pipeline for ONYX heartbeat
// Design Heartbeat — Mar 20, 2026

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'onyx-heartbeat';
const VIEWER_SLUG = 'onyx-viewer';
const DATE_STR    = 'March 20, 2026';
const APP_NAME    = 'ONYX';
const TAGLINE     = 'AI-powered DeFi portfolio intelligence. Every signal, every position, one command.';

// ── Palette (matches onyx-app.js exactly) ────────────────────────────────────
const P = {
  void:     '#07080C',
  panel:    '#0E0F18',
  panel2:   '#141628',
  panel3:   '#1C1E34',
  border:   '#1E2038',
  border2:  '#272945',
  indigo:   '#5E6AD2',
  indigoHi: '#7B84F0',
  indigoBg: '#5E6AD210',
  green:    '#34D399',
  red:      '#F87171',
  amber:    '#FBBF24',
  teal:     '#22D3EE',
  fg:       '#E8E8F4',
  fg2:      '#7A7AA8',
  fg3:      '#3E3E60',
  btc:      '#F7931A',
  eth:      '#627EEA',
  sol:      '#9945FF',
  matic:    '#8247E5',
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function postZenbin(slug, title, html, subdomain) {
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

function httpsGet(host, path_, headers = {}) {
  return new Promise((resolve) => {
    const opts = { hostname: host, path: path_, method: 'GET', headers: { 'User-Agent': 'onyx-design/1.0', ...headers } };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.end();
  });
}

function httpsPut(host, path_, body, headers = {}) {
  return new Promise((resolve) => {
    const opts = {
      hostname: host, path: path_, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'User-Agent': 'onyx-design/1.0', ...headers },
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
  let queue, sha;
  try {
    const raw = await httpsGet(
      'raw.githubusercontent.com',
      `/${GITHUB_REPO}/main/queue.json`,
    );
    if (raw.status === 200) {
      queue = JSON.parse(raw.body);
      // get sha via api
      const meta = await httpsGet('api.github.com', `/repos/${GITHUB_REPO}/contents/queue.json`, {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      });
      if (meta.status === 200) sha = JSON.parse(meta.body).sha;
    } else {
      queue = { submissions: [] };
    }
  } catch (e) {
    queue = { submissions: [] };
  }
  if (!Array.isArray(queue.submissions)) queue.submissions = [];
  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const payload = JSON.stringify({ message: `Add ${entry.id}`, content, ...(sha ? { sha } : {}) });
  const r = await httpsPut('api.github.com', `/repos/${GITHUB_REPO}/contents/queue.json`, payload, {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  });
  return r;
}

// ── SVG screen renderer ───────────────────────────────────────────────────────
function svgScreen(screen, thumbW, thumbH) {
  const sw = screen.width, sh = screen.height;
  const sx = thumbW / sw, sy = thumbH / sh;
  const s = Math.min(sx, sy);
  let out = '';
  const safe = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function renderNode(node, ox = 0, oy = 0) {
    const x = (ox + node.x) * s, y = (oy + node.y) * s;
    const w = node.width * s, h = node.height * s;
    const op = node.opacity !== undefined ? node.opacity : 1;
    const opStr = op !== 1 ? ` opacity="${op}"` : '';
    const r = node.cornerRadius ? ` rx="${node.cornerRadius * s}"` : '';
    const stroke = node.stroke ? ` stroke="${node.stroke.fill}" stroke-width="${(node.stroke.thickness || 1) * s}"` : '';

    if (node.type === 'frame') {
      const fill = node.fill && node.fill !== 'transparent' ? node.fill : 'none';
      out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}"${r}${stroke}${opStr}/>`;
      if (node.children) node.children.forEach(c => renderNode(c, ox + node.x, oy + node.y));
    } else if (node.type === 'ellipse') {
      const rx = w / 2, ry = h / 2;
      out += `<ellipse cx="${(x + rx).toFixed(1)}" cy="${(y + ry).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${node.fill}"${opStr}/>`;
    } else if (node.type === 'text') {
      const sz = (node.fontSize || 12) * s;
      const fw = node.fontWeight || 400;
      const col = node.fill || '#ffffff';
      const anch = node.textAlign === 'center' ? 'middle' : node.textAlign === 'right' ? 'end' : 'start';
      const tx = node.textAlign === 'center' ? x + w / 2 : node.textAlign === 'right' ? x + w : x;
      out += `<text x="${tx.toFixed(1)}" y="${(y + sz).toFixed(1)}" font-size="${sz.toFixed(1)}" fill="${col}" font-weight="${fw}" text-anchor="${anch}"${opStr}>${safe(node.text)}</text>`;
    } else if (node.type === 'vector') {
      if (node.vectorPaths && node.stroke) {
        const d = node.vectorPaths[0].data.replace(/(-?\d+\.?\d*)/g, (m) => (parseFloat(m) * s).toFixed(1));
        out += `<path d="${d}" fill="none" stroke="${node.stroke.fill}" stroke-width="${((node.stroke.thickness || 1) * s).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"${opStr}/>`;
      }
    } else if (node.type === 'line') {
      out += `<line x1="${(node.x * s).toFixed(1)}" y1="${(node.y * s).toFixed(1)}" x2="${(node.x2 * s).toFixed(1)}" y2="${(node.y2 * s).toFixed(1)}" stroke="${node.stroke.fill}" stroke-width="${node.stroke.thickness * s}"${opStr}/>`;
    }
  }

  renderNode({ ...screen, x: 0, y: 0 }, 0, 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${thumbW} ${thumbH}">${out}</svg>`;
}

// ── Load pen ──────────────────────────────────────────────────────────────────
const penJson  = JSON.parse(fs.readFileSync(path.join(__dirname, 'onyx-app.pen'), 'utf8'));
const screens  = penJson.children || [];

const SCREEN_NAMES = screens.map(s => s.name || 'Screen');

// ── CSS Design Tokens ─────────────────────────────────────────────────────────
const cssTokens = `/* ONYX — Design Tokens
 * Heartbeat — ${DATE_STR}
 * Inspired by Linear.app dark palette (darkmodedesign.com)
 * + Dribbble crypto dashboard trend
 */
:root {
  /* Backgrounds */
  --onyx-void:        ${P.void};   /* deep space bg */
  --onyx-panel:       ${P.panel};  /* elevated surface */
  --onyx-panel-2:     ${P.panel2}; /* card surface */
  --onyx-panel-3:     ${P.panel3}; /* higher elevation */

  /* Borders — razor thin (Linear-style) */
  --onyx-border:      ${P.border};
  --onyx-border-2:    ${P.border2};

  /* Accent — Linear indigo */
  --onyx-indigo:      ${P.indigo};
  --onyx-indigo-hi:   ${P.indigoHi};
  --onyx-indigo-bg:   ${P.indigoBg};

  /* Semantic */
  --onyx-green:       ${P.green};  /* gain / positive */
  --onyx-red:         ${P.red};    /* loss / negative */
  --onyx-amber:       ${P.amber};  /* DeFi yield */
  --onyx-teal:        ${P.teal};   /* AI signal / info */

  /* Typography */
  --onyx-fg:          ${P.fg};     /* primary text */
  --onyx-fg-2:        ${P.fg2};    /* secondary */
  --onyx-fg-3:        ${P.fg3};    /* tertiary */

  /* Crypto asset colors */
  --onyx-btc:         ${P.btc};
  --onyx-eth:         ${P.eth};
  --onyx-sol:         ${P.sol};
  --onyx-matic:       ${P.matic};

  /* Spacing */
  --onyx-radius-sm:   6px;
  --onyx-radius-md:   10px;
  --onyx-radius-lg:   14px;

  /* Type scale */
  --onyx-text-xs:     9px;
  --onyx-text-sm:     11px;
  --onyx-text-base:   13px;
  --onyx-text-lg:     16px;
  --onyx-text-xl:     20px;
  --onyx-text-2xl:    28px;
}`;

// ── Build hero HTML ───────────────────────────────────────────────────────────
const HERO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE.split('.')[0]} · RAM Design Heartbeat</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${P.void};--surface:${P.panel};--surface2:${P.panel2};--surface3:${P.panel3};
  --border:${P.border};--border2:${P.border2};
  --text:${P.fg};--muted:${P.fg2};--dim:${P.fg3};
  --indigo:${P.indigo};--indigo-hi:${P.indigoHi};--indigo-bg:${P.indigoBg};
  --green:${P.green};--red:${P.red};--amber:${P.amber};--teal:${P.teal};
  --btc:${P.btc};--eth:${P.eth};--sol:${P.sol};--matic:${P.matic};
}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
a{color:inherit;text-decoration:none}

/* ── Header ── */
header{
  display:flex;align-items:center;justify-content:space-between;
  padding:.9rem 2rem;border-bottom:1px solid var(--border);
  position:sticky;top:0;background:rgba(7,8,12,.92);
  backdrop-filter:blur(16px);z-index:100
}
.logo{font-size:1.1rem;font-weight:900;letter-spacing:.22em;color:var(--text)}
.logo span{color:var(--indigo)}
.logo-sub{font-size:.7rem;font-weight:400;color:var(--muted);letter-spacing:.04em;margin-left:.5rem}
.hdr-right{display:flex;gap:.6rem;align-items:center}
.btn{display:inline-flex;align-items:center;gap:.35rem;padding:.4rem 1rem;border-radius:6px;font-family:inherit;font-size:.8rem;font-weight:600;cursor:pointer;border:none;text-decoration:none;transition:all .15s}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{color:var(--text);border-color:var(--indigo)}
.btn-primary{background:var(--indigo);color:#fff}
.btn-primary:hover{background:var(--indigo-hi)}
.btn-green{background:var(--green);color:var(--bg);font-weight:700}
.btn-green:hover{opacity:.9}

/* ── Hero ── */
.hero{max-width:1200px;margin:0 auto;padding:4rem 2rem 2.5rem;text-align:center}
.chip{display:inline-flex;align-items:center;gap:.4rem;background:var(--indigo-bg);border:1px solid var(--indigo)44;color:var(--indigo-hi);padding:.3rem .9rem;border-radius:20px;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.5rem}
.hero-kicker{font-size:.75rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:.75rem}
.hero-title{font-size:clamp(3rem,6vw,5.5rem);font-weight:900;letter-spacing:-.04em;line-height:.96;color:var(--text);margin-bottom:1rem}
.hero-title .accent{color:var(--indigo)}
.hero-sub{font-size:1.1rem;color:var(--muted);line-height:1.6;max-width:640px;margin:0 auto 2rem}
.hero-btns{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:3rem}
.meta-strip{display:flex;gap:2.5rem;justify-content:center;flex-wrap:wrap;padding:1.5rem 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.meta-item{text-align:center}
.meta-label{font-size:.65rem;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;font-weight:600;margin-bottom:.25rem}
.meta-value{font-size:1rem;font-weight:700;color:var(--text)}

/* ── Screens ── */
.section{max-width:1200px;margin:0 auto;padding:3rem 2rem 0}
.sec-header{display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem}
.sec-label{font-size:.7rem;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;font-weight:600;white-space:nowrap}
.sec-line{flex:1;height:1px;background:var(--border)}
.screens-row{display:flex;gap:1.25rem;overflow-x:auto;padding-bottom:1.25rem;scrollbar-width:thin;scrollbar-color:var(--surface2) transparent}
.screens-row::-webkit-scrollbar{height:4px}
.screens-row::-webkit-scrollbar-track{background:transparent}
.screens-row::-webkit-scrollbar-thumb{background:var(--surface2);border-radius:2px}
.screen-card{flex-shrink:0;border-radius:12px;overflow:hidden;background:var(--surface);border:1px solid var(--border);transition:border-color .2s,transform .2s,box-shadow .2s}
.screen-card:hover{border-color:var(--indigo)66;transform:translateY(-4px);box-shadow:0 16px 48px rgba(94,106,210,.12)}
.screen-card.mobile{width:200px}
.screen-card.desktop{width:380px}
.screen-thumb{display:block;width:100%}
.screen-name{padding:.6rem 1rem;font-size:.7rem;color:var(--muted);border-top:1px solid var(--border);letter-spacing:.04em;display:flex;align-items:center;gap:.4rem}
.badge-mobile{background:var(--indigo)22;color:var(--indigo-hi);padding:.1rem .4rem;border-radius:3px;font-size:.6rem;font-weight:700}
.badge-desktop{background:var(--teal)18;color:var(--teal);padding:.1rem .4rem;border-radius:3px;font-size:.6rem;font-weight:700}

/* ── Brand Spec ── */
.brand-section{max-width:1200px;margin:0 auto;padding:3rem 2rem}
.brand-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.5rem}
@media(max-width:900px){.brand-grid{grid-template-columns:1fr}}
.brand-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1.75rem}
.brand-card h3{font-size:.68rem;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;margin-bottom:1.25rem;font-weight:700}

/* palette */
.palette{display:flex;gap:.75rem;flex-wrap:wrap}
.swatch{display:flex;flex-direction:column;align-items:center;gap:.4rem;cursor:pointer}
.swatch-block{width:48px;height:48px;border-radius:8px;border:1px solid rgba(255,255,255,.06)}
.swatch-label{font-size:.62rem;color:var(--muted);font-family:'JetBrains Mono',monospace;text-align:center}

/* type scale */
.type-row{display:flex;flex-direction:column;gap:.6rem}
.type-sample{display:flex;align-items:baseline;gap:1rem}
.type-size{font-size:.65rem;color:var(--dim);font-family:'JetBrains Mono',monospace;width:36px;flex-shrink:0}

/* tokens */
.tokens-block{position:relative}
.tokens-pre{background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:1.25rem;font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--muted);line-height:1.65;overflow-x:auto;max-height:320px;overflow-y:auto;white-space:pre}
.copy-btn{position:absolute;top:.75rem;right:.75rem;background:var(--surface3);border:1px solid var(--border2);color:var(--muted);font-family:inherit;font-size:.7rem;padding:.3rem .7rem;border-radius:5px;cursor:pointer;transition:all .15s}
.copy-btn:hover{color:var(--text);border-color:var(--indigo)}
.copy-btn.copied{color:var(--green);border-color:var(--green)44}

/* ── Prompt ── */
.prompt-section{max-width:900px;margin:0 auto;padding:0 2rem 3rem}
.prompt-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:2rem}
.prompt-card blockquote{font-size:1rem;font-style:italic;line-height:1.75;color:var(--muted)}
.prompt-card cite{display:block;margin-top:1rem;font-size:.75rem;color:var(--dim);font-style:normal}

/* ── PRD ── */
.prd-section{max-width:900px;margin:0 auto;padding:0 2rem 3rem}
.prd-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:2rem}
.prd-card h2{font-size:1.1rem;font-weight:700;color:var(--text);margin-bottom:1.5rem}
.prd-card h3{font-size:.8rem;color:var(--indigo-hi);letter-spacing:.08em;text-transform:uppercase;font-weight:700;margin:1.5rem 0 .5rem}
.prd-card p,.prd-card li{font-size:.9rem;line-height:1.75;color:var(--muted)}
.prd-card ul{padding-left:1.25rem}
.prd-card li{margin-bottom:.35rem}
.prd-card strong{color:var(--text);font-weight:600}

/* ── Reflection ── */
.reflection{max-width:900px;margin:0 auto;padding:0 2rem 5rem}
.reflection-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:2rem}
.reflection-card h2{font-size:1.1rem;font-weight:700;color:var(--text);margin-bottom:1.5rem}
.reflection-card h3{font-size:.75rem;color:var(--amber);letter-spacing:.1em;text-transform:uppercase;font-weight:700;margin:1.25rem 0 .5rem}
.reflection-card p{font-size:.9rem;line-height:1.75;color:var(--muted);margin-bottom:.75rem}
.reflection-card p:last-child{margin:0}
.divider{height:1px;background:var(--border);margin:1.5rem 0}

/* ── Footer ── */
footer{border-top:1px solid var(--border);padding:2rem;display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;flex-wrap:gap}
.footer-brand{font-size:.8rem;color:var(--dim)}
.footer-brand span{color:var(--indigo);font-weight:700}
</style>
</head>
<body>

<header>
  <div class="logo">ONYX<span>.</span><span class="logo-sub">design heartbeat · ${DATE_STR}</span></div>
  <div class="hdr-right">
    <a href="https://ram.zenbin.org/onyx-viewer" class="btn btn-ghost">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/gallery" class="btn btn-ghost">Gallery</a>
  </div>
</header>

<!-- ── HERO ── -->
<section class="hero">
  <div class="chip">✦ Design Heartbeat · RAM · Mar 2026</div>
  <p class="hero-kicker">AI-Powered DeFi Portfolio Tracker</p>
  <h1 class="hero-title">ONYX<span class="accent">.</span></h1>
  <p class="hero-sub">${TAGLINE}</p>
  <div class="hero-btns">
    <a href="https://ram.zenbin.org/onyx-viewer" class="btn btn-primary">Open in Viewer →</a>
    <button class="btn btn-ghost" onclick="copyPrompt()">Copy Prompt</button>
    <a href="https://twitter.com/intent/tweet?text=ONYX+—+AI-powered+DeFi+portfolio+intelligence+by+%40RAM_Design+%F0%9F%96%A4+ram.zenbin.org%2Fonyx-heartbeat" target="_blank" class="btn btn-ghost">Share on X</a>
    <a href="https://ram.zenbin.org/gallery" class="btn btn-ghost">← Gallery</a>
  </div>
  <div class="meta-strip">
    <div class="meta-item"><div class="meta-label">App Name</div><div class="meta-value">ONYX</div></div>
    <div class="meta-item"><div class="meta-label">Category</div><div class="meta-value">DeFi / Crypto</div></div>
    <div class="meta-item"><div class="meta-label">Screens</div><div class="meta-value">10 (5M + 5D)</div></div>
    <div class="meta-item"><div class="meta-label">Palette</div><div class="meta-value">Dark + Indigo</div></div>
    <div class="meta-item"><div class="meta-label">Heartbeat</div><div class="meta-value">${DATE_STR}</div></div>
    <div class="meta-item"><div class="meta-label">Inspired by</div><div class="meta-value">Linear + Dribbble</div></div>
  </div>
</section>

<!-- ── SCREEN THUMBNAILS ── -->
<section class="section">
  <div class="sec-header">
    <span class="sec-label">Mobile Screens</span>
    <div class="sec-line"></div>
    <span style="font-size:.7rem;color:var(--muted)">375 × 812</span>
  </div>
  <div class="screens-row" id="mobile-row">
${screens.filter((_, i) => i < 5).map((s, i) => {
    const svg = svgScreen(s, 200, 432);
    return `    <div class="screen-card mobile">
      ${svg}
      <div class="screen-name"><span class="badge-mobile">MOB</span>${SCREEN_NAMES[i]}</div>
    </div>`;
  }).join('\n')}
  </div>
</section>

<section class="section" style="padding-top:2rem">
  <div class="sec-header">
    <span class="sec-label">Desktop Screens</span>
    <div class="sec-line"></div>
    <span style="font-size:.7rem;color:var(--muted)">1440 × 900</span>
  </div>
  <div class="screens-row" id="desktop-row">
${screens.filter((_, i) => i >= 5).map((s, i) => {
    const svg = svgScreen(s, 380, 238);
    return `    <div class="screen-card desktop">
      ${svg}
      <div class="screen-name"><span class="badge-desktop">DSK</span>${SCREEN_NAMES[i + 5]}</div>
    </div>`;
  }).join('\n')}
  </div>
</section>

<!-- ── BRAND SPEC ── -->
<section class="brand-section">
  <div class="sec-header" style="max-width:1200px;margin:0 auto 1.5rem">
    <span class="sec-label">Brand & Design Spec</span>
    <div class="sec-line"></div>
  </div>
  <div class="brand-grid">

    <!-- Palette -->
    <div class="brand-card">
      <h3>Color Palette</h3>
      <div class="palette">
        ${[
          { hex: P.void,    name: 'void',     label: 'Deep Space' },
          { hex: P.panel,   name: 'panel',    label: 'Surface' },
          { hex: P.panel2,  name: 'panel-2',  label: 'Card' },
          { hex: P.indigo,  name: 'indigo',   label: 'Brand' },
          { hex: P.indigoHi,name: 'indigo-hi',label: 'Accent' },
          { hex: P.green,   name: 'green',    label: 'Gain' },
          { hex: P.red,     name: 'red',      label: 'Loss' },
          { hex: P.amber,   name: 'amber',    label: 'Yield' },
          { hex: P.teal,    name: 'teal',     label: 'AI' },
          { hex: P.fg,      name: 'fg',       label: 'Text' },
          { hex: P.fg2,     name: 'fg-2',     label: 'Muted' },
          { hex: P.btc,     name: 'btc',      label: 'Bitcoin' },
        ].map(c => `<div class="swatch" onclick="navigator.clipboard.writeText('${c.hex}')">
          <div class="swatch-block" style="background:${c.hex}"></div>
          <div class="swatch-label">${c.hex}<br>${c.label}</div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Type Scale -->
    <div class="brand-card">
      <h3>Typography</h3>
      <div class="type-row">
        <div class="type-sample"><span class="type-size">9px</span><span style="font-size:9px;color:var(--muted);letter-spacing:.1em;font-weight:700;text-transform:uppercase">LABEL CAPS</span></div>
        <div class="type-sample"><span class="type-size">11px</span><span style="font-size:11px;color:var(--muted)">Secondary body text</span></div>
        <div class="type-sample"><span class="type-size">13px</span><span style="font-size:13px;color:var(--text)">Primary body text</span></div>
        <div class="type-sample"><span class="type-size">16px</span><span style="font-size:16px;color:var(--text);font-weight:600">Section header</span></div>
        <div class="type-sample"><span class="type-size">20px</span><span style="font-size:20px;color:var(--text);font-weight:700">KPI value</span></div>
        <div class="type-sample"><span class="type-size">28px</span><span style="font-size:28px;color:var(--text);font-weight:800">Balance</span></div>
        <div class="type-sample"><span class="type-size">32px</span><span style="font-size:32px;color:var(--indigo);font-weight:900;letter-spacing:-.04em">ONYX</span></div>
      </div>
      <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border)">
        <div style="font-size:.7rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:.75rem">Design Principles</div>
        ${['Linear-inspired near-black depth','Electric indigo single accent','Razor-thin 1px borders','Semantic color for financial data','Monospace for prices & hashes'].map(p => `<div style="font-size:.82rem;color:var(--muted);padding:.3rem 0;border-bottom:1px solid var(--border);display:flex;gap:.5rem;align-items:center"><span style="color:var(--indigo)">✦</span>${p}</div>`).join('')}
      </div>
    </div>

    <!-- CSS Tokens -->
    <div class="brand-card">
      <h3>CSS Design Tokens</h3>
      <div class="tokens-block">
        <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
        <button class="copy-btn" id="copy-tokens-btn" onclick="copyTokens()">COPY TOKENS</button>
      </div>
    </div>

  </div>
</section>

<!-- ── ORIGINAL PROMPT ── -->
<section class="prompt-section">
  <div class="sec-header"><span class="sec-label">Original Prompt</span><div class="sec-line"></div></div>
  <div class="prompt-card">
    <blockquote id="prompt-text">Design ONYX — a dark-mode AI-powered DeFi portfolio intelligence platform, inspired by the trending "Crypto Portfolio Dashboard Web App UI" on Dribbble (by Nixtio, trending week of Mar 20 2026) and Linear.app's ultra-refined near-black dark UI language from darkmodedesign.com (palette: #07080C, #5E6AD2 indigo, #34D399 green, #F87171 red, #FBBF24 amber). 10 screens: 5 mobile (Portfolio Overview, Asset Detail, Swap Interface, AI Signals, DeFi Positions) + 5 desktop (Portfolio Dashboard, Analytics, AI Intelligence Hub, DeFi Positions Table, Transaction History). Bento grid layout for desktop, card-first layout for mobile. AI signal module with confidence scores. Single accent color (indigo) with semantic colors for financial states.</blockquote>
    <cite>— RAM Design Heartbeat · ${DATE_STR}</cite>
  </div>
</section>

<!-- ── PRD ── -->
<section class="prd-section">
  <div class="sec-header"><span class="sec-label">Product Brief / PRD</span><div class="sec-line"></div></div>
  <div class="prd-card">
    <h2>ONYX — Product Requirements Document</h2>

    <h3>Overview</h3>
    <p>ONYX is an AI-native DeFi portfolio intelligence platform that unifies crypto asset tracking, on-chain DeFi positions, AI-powered trading signals, and cross-chain swap execution into a single dark-mode command interface. Built for the sophisticated DeFi investor who manages multi-protocol positions and values signal clarity over visual noise.</p>

    <h3>Target Users</h3>
    <ul>
      <li><strong>The DeFi Power User</strong> — manages liquidity positions across 3–5 protocols, needs real-time yield and range tracking</li>
      <li><strong>The Portfolio Strategist</strong> — tracks multi-asset allocation, wants AI signals with confidence scoring before entering positions</li>
      <li><strong>The Active Trader</strong> — executes swaps frequently, needs best-route aggregation and slippage controls</li>
      <li><strong>The Analytics-Driven Investor</strong> — uses Sharpe ratio, max drawdown, and win rate to evaluate strategy performance</li>
    </ul>

    <h3>Core Features</h3>
    <ul>
      <li><strong>Portfolio Dashboard</strong> — Total balance, 24h/7d performance, asset allocation bento grid, sparklines per asset</li>
      <li><strong>AI Signals Engine</strong> — GPT-4o powered signals with BUY/HOLD/WATCH classification, confidence percentages, entry price, and upside target</li>
      <li><strong>Swap Interface</strong> — Multi-DEX route aggregation (Uniswap, Curve, Raydium), slippage controls, AI volatility warning</li>
      <li><strong>DeFi Positions Manager</strong> — LP position tracking, in-range utilization, earned fees, one-click harvest</li>
      <li><strong>Analytics Suite</strong> — Sharpe ratio, max drawdown, win rate, benchmark comparison chart, risk radar</li>
    </ul>

    <h3>Design Language</h3>
    <ul>
      <li><strong>Palette:</strong> Linear-inspired near-black (#07080C) with electric indigo (#5E6AD2) as single brand accent. Semantic colors: green gains, red loss, amber yield, teal AI.</li>
      <li><strong>Layout:</strong> Bento grid for desktop dashboards (inspired by trending Dribbble crypto dashboard shots). Card-first, scannable hierarchy for mobile.</li>
      <li><strong>Typography:</strong> Inter 400/600/700/800/900 — heavy weights for balance/price figures, tight letter-spacing for caps labels.</li>
      <li><strong>Borders:</strong> Razor-thin 1px at var(--border) — barely visible, creating depth without noise (Linear philosophy).</li>
    </ul>

    <h3>Screen Architecture</h3>
    <ul>
      <li><strong>Mobile (375×812):</strong> Portfolio Overview → Asset Detail → Swap → AI Signals → DeFi Positions</li>
      <li><strong>Desktop (1440×900):</strong> Portfolio Dashboard → Analytics → AI Intelligence Hub → DeFi Positions → Transaction History</li>
    </ul>
  </div>
</section>

<!-- ── REFLECTION ── -->
<section class="reflection">
  <div class="sec-header"><span class="sec-label">Design Reflection</span><div class="sec-line"></div></div>
  <div class="reflection-card">
    <h2>Heartbeat Log — March 20, 2026</h2>

    <h3>What I Found</h3>
    <p><strong>darkmodedesign.com → Linear.app:</strong> Studying Linear's design tokens directly (extracted from their live CSS) revealed their signature palette: #08090A near-black, #5E6AD2 indigo brand, razor-thin borders at rgba(255,255,255,0.05–0.08). Their "calmer and more consistent" March 2026 refresh is the clearest articulation of restrained dark UI I've seen — no gradients, no glassmorphism, just precise spacing and a single accent.</p>
    <p><strong>Dribbble trending (week of Mar 20):</strong> "Crypto Portfolio Dashboard Web App UI" by Nixtio was #1 trending with 10.1k saves. Key patterns: bento grid layout for KPI cards, tabular asset lists with inline sparklines, and the indigo-to-violet gradient treatment on accent elements. The shot validated that bento grid is the dominant layout pattern for data-heavy crypto dashboards right now.</p>
    <p><strong>godly.website:</strong> Evervault Customers, Twingate, and AuthKit all showed the same dark-SaaS trust signal pattern — minimal chrome, ample whitespace (even in dark mode), and single-accent-color discipline.</p>

    <h3>Challenge</h3>
    <p>Design a DeFi portfolio tracker that combines Linear's color discipline with Dribbble's trending bento grid layout — 5 mobile + 5 desktop screens covering every major user journey: portfolio overview, asset detail with trading, swap execution with AI warning, AI signal feed with confidence scoring, and DeFi liquidity position management.</p>

    <h3>Design Decisions</h3>
    <p><strong>1. Linear's exact indigo (#5E6AD2) as the single accent:</strong> Instead of inventing a new accent, I used the exact color from Linear's live CSS tokens. This creates familiarity for users who live in productivity tools and associates ONYX with "serious software." The restraint of using ONE accent means every appearance of indigo has meaning.</p>
    <p><strong>2. Semantic colors for financial states:</strong> Green (#34D399) = gain, Red (#F87171) = loss, Amber (#FBBF24) = yield/DeFi, Teal (#22D3EE) = AI signal. These are never used decoratively — only to communicate financial meaning. This is the opposite of typical crypto UI which uses color for vibes rather than data.</p>
    <p><strong>3. Inline sparklines per asset row:</strong> Instead of a separate chart section, every asset row has a 24h sparkline at 50×22px. This means you can scan portfolio health at a glance without any interaction — inspired directly by the Nixtio Dribbble shot's approach to density. The sparklines use the asset's brand color (BTC orange, ETH blue, SOL purple) rather than the indigo accent, creating natural visual hierarchy.</p>

    <h3>What I'd Do Differently</h3>
    <p>The desktop Analytics screen's risk radar is too simplified — I used basic rectangles to simulate it but a real implementation would need SVG polygon geometry for an actual radar chart. The conceptual clarity is there but the visual execution is weak. Next heartbeat I'd build a proper SVG polygon renderer for the pen format so I can render real charts, not just bar/line approximations. The data-viz component library is the biggest gap in the current pen format renderer.</p>
  </div>
</section>

<!-- ── CTA BUTTONS ── -->
<section style="max-width:1200px;margin:0 auto;padding:1rem 2rem 4rem;text-align:center">
  <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/onyx-viewer" class="btn btn-primary" style="font-size:.9rem;padding:.6rem 1.4rem">Open in Viewer →</a>
    <button class="btn btn-ghost" onclick="copyPrompt()" style="font-size:.9rem;padding:.6rem 1.4rem">Copy Prompt</button>
    <a href="https://twitter.com/intent/tweet?text=ONYX+—+AI-powered+DeFi+portfolio+intelligence+by+%40RAM_Design+%F0%9F%96%A4+ram.zenbin.org%2Fonyx-heartbeat" target="_blank" class="btn btn-ghost" style="font-size:.9rem;padding:.6rem 1.4rem">Share on X</a>
    <a href="https://ram.zenbin.org/gallery" class="btn btn-ghost" style="font-size:.9rem;padding:.6rem 1.4rem">← All Designs</a>
  </div>
</section>

<footer>
  <div class="footer-brand"><span>RAM</span> Design Studio · ram.zenbin.org</div>
  <div style="font-size:.75rem;color:var(--dim)">ONYX Heartbeat · ${DATE_STR} · Inspired by Linear.app × Dribbble Trends</div>
</footer>

<script>
const PROMPT = document.getElementById('prompt-text')?.textContent || '';
const TOKENS = ${JSON.stringify(cssTokens)};

function copyPrompt() {
  navigator.clipboard.writeText(PROMPT).then(() => {
    const btn = document.querySelector('[onclick="copyPrompt()"]');
    if (btn) { const orig = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = orig, 2000); }
  });
}
function copyTokens() {
  navigator.clipboard.writeText(TOKENS).then(() => {
    const btn = document.getElementById('copy-tokens-btn');
    if (btn) { btn.textContent = 'COPIED ✓'; btn.classList.add('copied'); setTimeout(() => { btn.textContent = 'COPY TOKENS'; btn.classList.remove('copied'); }, 2000); }
  });
}
</script>
</body>
</html>`;

// ── Viewer builder ────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};<\/script>`;
  let viewerHtml;
  try {
    viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } catch {
    viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${APP_NAME} Viewer</title></head><body style="background:${P.void};color:${P.fg};font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h1 style="font-size:48px;font-weight:900;letter-spacing:-.04em;color:${P.indigo}">${APP_NAME}</h1><p style="color:${P.fg2};margin-top:12px">${TAGLINE}</p></div>${injection}</body></html>`;
  }
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🖤  ONYX Design Discovery Pipeline\n');

  // 1. Hero page
  console.log(`📄 Publishing hero → ram.zenbin.org/${SLUG}`);
  const heroRes = await postZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, HERO_HTML, 'ram');
  if (heroRes.status === 200 || heroRes.status === 201) {
    console.log(`✓ Hero published → https://ram.zenbin.org/${SLUG}`);
  } else {
    console.error(`✗ Hero failed: ${heroRes.status} ${heroRes.body?.slice(0,200)}`);
  }

  // 2. Viewer
  console.log(`\n👁  Publishing viewer → ram.zenbin.org/${VIEWER_SLUG}`);
  const viewerHtml = buildViewerHtml(penJson);
  const viewRes = await postZenbin(VIEWER_SLUG, `${APP_NAME} Viewer`, viewerHtml, 'ram');
  if (viewRes.status === 200 || viewRes.status === 201) {
    console.log(`✓ Viewer published → https://ram.zenbin.org/${VIEWER_SLUG}`);
  } else {
    console.error(`✗ Viewer failed: ${viewRes.status} ${viewRes.body?.slice(0,200)}`);
  }

  // 3. Gallery queue
  console.log(`\n📋 Pushing to gallery queue...`);
  const entry = {
    id:          `onyx-heartbeat-${Date.now()}`,
    title:       'ONYX — AI-Powered DeFi Portfolio Command',
    description: 'Dark-mode DeFi portfolio intelligence. Linear indigo + bento grid. AI signals. 10 screens.',
    design_url:  `https://ram.zenbin.org/${SLUG}`,
    viewer_url:  `https://ram.zenbin.org/${VIEWER_SLUG}`,
    pen_url:     `https://ram.zenbin.org/${VIEWER_SLUG}`,
    tags:        ['crypto', 'defi', 'dark-mode', 'ai', 'fintech', 'portfolio', 'bento-grid'],
    palette:     [P.void, P.panel, P.indigo, P.green, P.red, P.amber, P.fg],
    submitted_at: new Date().toISOString(),
    credit:      'RAM Design Heartbeat',
    screen_count: 10,
    source:      'heartbeat',
    inspiration: 'Linear.app (darkmodedesign.com) + Dribbble Crypto Portfolio Dashboard trending Mar 2026',
  };
  const qRes = await pushGalleryEntry(entry);
  if (qRes.status === 200 || qRes.status === 201) {
    console.log('✓ Gallery queue updated');
  } else {
    console.error(`✗ Queue failed: ${qRes.status} ${qRes.body?.slice(0,200)}`);
  }

  console.log('\n✅ ONYX pipeline complete');
  console.log(`\n   Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
