'use strict';
// publish-margin-heartbeat.js
// Publishes MARGIN — AI Arbitrage Intelligence
// Design Heartbeat — Mar 18, 2026
// Inspired by: Spread.app (land-book.com), Midday.ai (darkmodedesign.com),
//              Stripe Sessions (godly.website FT.961), Good Fella SOTD (awwwards.com)

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

async function getQueueSha() {
  const r = await new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Accept': 'application/vnd.github.v3+json',
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
  if (r.status !== 200) throw new Error('Cannot get SHA: ' + r.status);
  return JSON.parse(r.body).sha;
}

async function pushGalleryEntry(entry) {
  let queue;
  try {
    const raw = await new Promise((resolve) => {
      const opts = {
        hostname: 'raw.githubusercontent.com',
        path: `/${GITHUB_REPO}/main/queue.json`,
        method: 'GET',
        headers: { 'User-Agent': 'design-studio-agent/1.0' },
      };
      const req = https.request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(d));
      });
      req.on('error', () => resolve('{"submissions":[]}'));
      req.end();
    });
    queue = JSON.parse(raw);
  } catch { queue = { submissions: [] }; }

  queue.submissions.push(entry);
  const sha = await getQueueSha();
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `add: margin-heartbeat — AI arbitrage app design`,
    content,
    sha,
  });
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/vnd.github.v3+json',
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

// ── Design constants ──────────────────────────────────────────────────────────
const SLUG     = 'margin-heartbeat';
const APP_NAME = 'MARGIN';
const TAGLINE  = 'AI arbitrage intelligence for marketplace flippers.';
const DATE_STR = 'March 18, 2026';

const P = {
  bg:     '#080808',
  fg:     '#f0f0f0',
  fg2:    '#aaaaaa',
  profit: '#00e87a',
  ai:     '#4d9eff',
  warn:   '#f5c842',
  orange: '#ff6b35',
  surface:'#111111',
  border: '#202020',
  muted:  '#454545',
};

// ── Read the .pen file ────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'margin-app.pen'), 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.children || [];

// ── SVG renderer (inline in hero page) ───────────────────────────────────────
function sc(c) {
  if (!c || c === 'none') return 'none';
  if (c === '#00000000') return 'none';
  if (c.length === 9) {
    const a = parseInt(c.slice(7, 9), 16) / 255;
    return `rgba(${parseInt(c.slice(1,3),16)},${parseInt(c.slice(3,5),16)},${parseInt(c.slice(5,7),16)},${a.toFixed(2)})`;
  }
  return c;
}

function rn(n, ox, oy) {
  if (!n || typeof n !== 'object') return '';
  const nx = (n.x || 0) + ox, ny = (n.y || 0) + oy;
  const w = n.width || 0, h = n.height || 0;
  const op = n.opacity !== undefined ? n.opacity : 1;
  const r  = n.cornerRadius || 0;
  let out  = '';

  if (n.type === 'frame' || n.type === 'group') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    const cid = n.clip ? 'cl' + n.id : '';
    if (cid) out += `<defs><clipPath id="${cid}"><rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>`;
    out += `<rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
    const inner = (n.children || []).map(c => rn(c, nx, ny)).join('');
    out += cid ? `<g clip-path="url(#${cid})">${inner}</g>` : inner;
  } else if (n.type === 'rectangle') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    out += `<rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
  } else if (n.type === 'ellipse') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    out += `<ellipse cx="${nx + w/2}" cy="${ny + h/2}" rx="${w/2}" ry="${h/2}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
  } else if (n.type === 'text') {
    const fs = n.fontSize || 12, fw = n.fontWeight || '400';
    const ta = n.textAlign || 'left';
    let ax = nx;
    if (ta === 'center') ax = nx + w / 2;
    else if (ta === 'right') ax = nx + w;
    const anchor = ta === 'center' ? 'middle' : ta === 'right' ? 'end' : 'start';
    const lh = n.lineHeight || (fs * 1.3);
    const ls = n.letterSpacing ? `letter-spacing="${n.letterSpacing}"` : '';
    (n.content || '').split('\n').forEach((line, li) => {
      out += `<text x="${ax}" y="${ny + fs + li * lh}" font-size="${fs}" font-weight="${fw}" font-family="'SF Mono','Fira Code',monospace" fill="${sc(n.fill || '#f0f0f0')}" text-anchor="${anchor}" dominant-baseline="auto" opacity="${op}" ${ls}>${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    });
  }
  return out;
}

function screenSVG(screen, thumbW, thumbH) {
  const sw = screen.width || 375, sh = screen.height || 812;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0)).join('');
  const bg = sc(screen.fill || P.bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:12px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${bg}"/>${content}</svg>`;
}

// ── Build hero HTML ───────────────────────────────────────────────────────────
const SCREEN_NAMES = [
  'Hero / Landing',
  'Deal Feed',
  'Deal Detail',
  'Niche Selector',
  'Profit Analytics',
];

const THUMB_W = 160, THUMB_H = 346;

const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H)}
    <div style="font-size:9px;color:${P.muted};margin-top:8px;letter-spacing:1.5px;font-weight:600">${(SCREEN_NAMES[i] || ('SCREEN ' + (i+1))).toUpperCase()}</div>
  </div>`
).join('');

const penEscaped = penJson
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/'/g, '&#39;');

const surface = '#111111';
const border  = '#202020';

const cssTokens = `:root {
  /* Color */
  --color-bg:        ${P.bg};
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        ${P.fg};
  --color-profit:    ${P.profit};
  --color-ai:        ${P.ai};
  --color-warn:      ${P.warn};
  --color-orange:    ${P.orange};

  /* Typography */
  --font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:  900 clamp(40px, 8vw, 80px) / 1 var(--font-family);
  --font-heading:  700 24px / 1.3 var(--font-family);
  --font-body:     400 14px / 1.6 var(--font-family);
  --font-caption:  600 10px / 1 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Deal score colors */
  --score-high:   ${P.profit};  /* 80–100 */
  --score-medium: ${P.warn};    /* 60–79  */
  --score-low:    ${P.orange};  /* 40–59  */
}`;

const shareText = encodeURIComponent(
  `MARGIN — AI arbitrage intelligence for marketplace flippers. 5-screen dark mobile app design by RAM Design Studio.`
);

const prd = `
<h3>OVERVIEW</h3>
<p>MARGIN is a dark-mode mobile app that uses AI to scan marketplace listings across 6 platforms (eBay, Facebook Marketplace, Craigslist, OfferUp, Reverb, Apt Deco), scores each deal by profit potential, and helps resellers act fast — with AI-written offer messages and one-tap cross-platform listing drafts.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>Active resellers</strong> who flip 5–20 items per month across multiple categories</li>
<li><strong>Niche experts</strong> with domain knowledge in specific categories (espresso machines, vintage audio, furniture)</li>
<li><strong>Aspiring flippers</strong> who want to start but don't know how to find good deals</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Deal Feed</strong> — real-time scored opportunities sorted by AI confidence score (0–100)</li>
<li><strong>Deal Detail</strong> — full analysis: AI score breakdown, platform comparison, profit projection, offer draft</li>
<li><strong>Niche Selector</strong> — pill-based category picker with trend indicators and avg profit per niche</li>
<li><strong>Profit Analytics</strong> — weekly/monthly P&amp;L, platform breakdown, deal velocity, AI pattern detection</li>
<li><strong>AI Opener</strong> — auto-generated opening offer messages customized to seller listing tone</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Near-void dark base</strong> (#080808) — premium, focused, reduces visual noise around data</li>
<li><strong>Electric green profit accent</strong> (#00e87a) — positive reinforcement, every profitable deal glows</li>
<li><strong>Monospace type</strong> — data-first, precise, reads like a trading terminal</li>
<li><strong>AI blue (#4d9eff)</strong> — distinguishes machine-generated insights from user data</li>
<li><strong>Score rings</strong> — circular confidence indicators, immediately scannable</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>Screen 1 — Hero/Landing:</strong> large type hero, floating deal preview card, stats strip, live ticker</li>
<li><strong>Screen 2 — Deal Feed:</strong> filter strip, scored deal rows, AI insight card, real-time badge</li>
<li><strong>Screen 3 — Deal Detail:</strong> score ring hero, price breakdown, AI analysis panel, platform comparison, action CTAs</li>
<li><strong>Screen 4 — Niche Selector:</strong> search input, 2-column pill grid with active state, trend badges</li>
<li><strong>Screen 5 — Profit Analytics:</strong> big P&L number, bar chart, platform breakdown bars, AI pattern insight</li>
</ul>
`;

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MARGIN — AI Arbitrage Intelligence · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} Dark mobile app design. 5 screens, brand spec &amp; CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  a{color:inherit;text-decoration:none}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(12px);z-index:100}
  .logo{font-size:14px;font-weight:700;letter-spacing:4px;color:${P.fg}}
  .logo span{color:${P.profit}}
  .nav-right{display:flex;gap:12px;align-items:center}
  .nav-tag{font-size:10px;color:${P.profit};letter-spacing:1.5px;font-weight:700}
  .hero{padding:80px 40px 48px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.profit};margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(56px,9vw,100px);font-weight:900;letter-spacing:-3px;line-height:0.95;margin-bottom:24px;color:${P.fg}}
  h1 span{color:${P.profit}}
  .sub{font-size:16px;color:${P.fg2};max-width:500px;line-height:1.65;margin-bottom:40px}
  .meta{display:flex;gap:36px;margin-bottom:48px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.muted};letter-spacing:1.5px;margin-bottom:4px;font-weight:600}
  .meta-item strong{color:${P.profit};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:64px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;transition:opacity .15s}
  .btn-p{background:${P.profit};color:${P.bg}}
  .btn-p:hover{opacity:0.85}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${P.profit}66}
  .btn-x{background:#000;color:#fff;border:1px solid #2a2a2a}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.profit};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border};font-weight:700}
  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-thumb{background:${P.profit}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:920px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .swatch{flex:1;min-width:70px}
  .swatch-box{height:64px;border-radius:10px;border:1px solid ${border};margin-bottom:10px}
  .swatch-role{font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:4px;font-weight:600}
  .swatch-hex{font-size:11px;font-weight:700;color:${P.profit}}
  .type-row{padding:14px 0;border-bottom:1px solid ${border}}
  .type-label{font-size:8px;letter-spacing:2px;color:${P.muted};margin-bottom:8px;font-weight:600}
  .spacing-row{display:flex;align-items:center;gap:14px;margin-bottom:10px}
  .spacing-px{font-size:9px;color:${P.muted};width:32px;flex-shrink:0}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.7;color:${P.fg};opacity:.65;white-space:pre;overflow-x:auto}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.profit}22;border:1px solid ${P.profit}44;color:${P.profit};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.profit}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.profit};margin-bottom:12px;font-weight:700}
  .p-text{font-size:18px;color:${P.fg2};font-style:italic;max-width:600px;line-height:1.6;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:760px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.profit};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${P.fg2};line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{color:${P.fg};font-weight:600}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;color:${P.muted};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.profit};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .ticker{overflow:hidden;background:${surface};border-top:1px solid ${border};border-bottom:1px solid ${border};padding:8px 0;margin:0 0 0 0}
  .ticker-inner{display:flex;gap:48px;white-space:nowrap;animation:ticker 20s linear infinite}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .ticker-item{font-size:10px;color:${P.profit};font-weight:600;letter-spacing:0.8px}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>

<nav>
  <div class="logo">RAM<span>.</span>DESIGN STUDIO</div>
  <div class="nav-right">
    <span class="nav-tag">DESIGN HEARTBEAT · ${DATE_STR.toUpperCase()}</span>
  </div>
</nav>

<div class="ticker">
  <div class="ticker-inner">
    ${['NEW DEAL ↗ · Breville Oracle +$500', 'AI SCORE 94 · Herman Miller Aeron', 'PLATFORM: EBAY · AVG +$380', 'LIVE ALERT · 12s SCAN SPEED', '6 MARKETPLACES · 24/7 SCANNING', 'NICHES: ESPRESSO · VINYL · CAMERAS',
       'NEW DEAL ↗ · Breville Oracle +$500', 'AI SCORE 94 · Herman Miller Aeron', 'PLATFORM: EBAY · AVG +$380', 'LIVE ALERT · 12s SCAN SPEED', '6 MARKETPLACES · 24/7 SCANNING', 'NICHES: ESPRESSO · VINYL · CAMERAS']
      .map(t => `<span class="ticker-item">${t}</span>`).join('')}
  </div>
</div>

<section class="hero">
  <div class="tag">AI ARBITRAGE INTELLIGENCE · DARK MOBILE APP · 5 SCREENS</div>
  <h1>MAR<span>GIN</span></h1>
  <p class="sub">${TAGLINE}<br><br>Find what's underpriced. Sell it for what it's worth.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>SPREAD · MIDDAY · STRIPE</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">▶ Open in Viewer</a>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <a class="btn btn-x" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE (375 × 812)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:600">COLOR PALETTE</div>
      <div class="swatches">
        ${[
          { hex: P.bg,      role: 'BACKGROUND' },
          { hex: P.surface, role: 'SURFACE'    },
          { hex: P.fg,      role: 'FOREGROUND' },
          { hex: P.profit,  role: 'PROFIT'     },
          { hex: P.ai,      role: 'AI BLUE'    },
          { hex: P.warn,    role: 'MEDIUM'     },
        ].map(sw => `
          <div class="swatch">
            <div class="swatch-box" style="background:${sw.hex}"></div>
            <div class="swatch-role">${sw.role}</div>
            <div class="swatch-hex">${sw.hex}</div>
          </div>`).join('')}
      </div>
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:0;font-weight:600">TYPE SCALE</div>
      ${[
        { label:'DISPLAY',  size:'56px', weight:'900', sample: 'MARGIN' },
        { label:'HEADING',  size:'18px', weight:'700', sample: 'Deal Feed · Analytics' },
        { label:'BODY',     size:'13px', weight:'400', sample: 'AI scans every marketplace, scores every deal.' },
        { label:'CAPTION',  size:'9px',  weight:'700', sample: 'AI SCORE · PROFIT · LIVE · PLATFORM' },
      ].map(t => `
        <div class="type-row">
          <div class="type-label">${t.label} · ${t.size} / ${t.weight}</div>
          <div style="font-size:${t.size};font-weight:${t.weight};color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
        </div>`).join('')}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:600">SPACING · 4PX BASE GRID</div>
      ${[4,8,16,24,32,48,64].map(sp => `
        <div class="spacing-row">
          <div class="spacing-px">${sp}px</div>
          <div style="height:8px;border-radius:4px;background:${P.profit};width:${sp*2}px;opacity:0.65"></div>
        </div>`).join('')}
    </div>

    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;font-weight:600">DESIGN PRINCIPLES</div>
      ${[
        ['01', 'Data density as clarity — deal rows pack score, price, platform, and profit into one scannable line.'],
        ['02', 'Color carries meaning — green always means profit, blue always means AI, amber always means caution.'],
        ['03', 'Speed above decoration — zero unnecessary flourish. Every frame reduces time-to-decision for the reseller.'],
      ].map(([n, p]) => `
        <div style="display:flex;gap:12px;margin-bottom:18px;align-items:flex-start">
          <div style="color:${P.profit};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${n}</div>
          <div style="font-size:13px;color:${P.fg2};line-height:1.6">${p}</div>
        </div>`).join('')}
    </div>

  </div>

  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;')}</pre>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"Design a dark-mode AI arbitrage dashboard for marketplace resellers — inspired by Spread.app's deal scoring cards (land-book.com), Midday.ai's dark finance transactions UI (darkmodedesign.com), and Stripe Sessions' large type interaction patterns (godly.website). App name: MARGIN."</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${prd}
</section>

<footer>
  <span>RAM Design Studio · Design Heartbeat · ${DATE_STR}</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;opacity:0.6">ram.zenbin.org/gallery</a>
</footer>

<script type="application/json" id="pen-data">${penEscaped}</script>
<script>
function getPen(){return document.getElementById('pen-data').textContent.trim().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'")}
function downloadPen(){const b=new Blob([getPen()],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='margin-app.pen';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}
function copyPrompt(){navigator.clipboard.writeText('Design a dark-mode AI arbitrage dashboard for marketplace resellers — inspired by Spread.app deal scoring cards, Midday.ai dark finance UI, and Stripe Sessions large type. App name: MARGIN.').then(()=>toast('Prompt Copied ✓'))}
function copyTokens(){navigator.clipboard.writeText(document.getElementById('tokens-pre').textContent).then(()=>toast('Tokens Copied ✓'))}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
</script>
</body>
</html>`;

// ── Build viewer HTML ─────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n── MARGIN Heartbeat Publisher ─────────────────');
  console.log(`Hero HTML:   ${(heroHTML.length / 1024).toFixed(1)} KB`);
  console.log(`Viewer HTML: ${(viewerHtml.length / 1024).toFixed(1)} KB`);

  // Hero page → ram.zenbin.org/margin-heartbeat
  console.log('\n[1/3] Publishing hero page...');
  let heroSlug = SLUG;
  let r = await post(heroSlug, `MARGIN — AI Arbitrage Intelligence — Design Heartbeat`, heroHTML, 'ram');
  if (r.status === 409) {
    heroSlug = SLUG + '-2';
    r = await post(heroSlug, `MARGIN — AI Arbitrage Intelligence — Design Heartbeat`, heroHTML, 'ram');
  }
  if (r.status === 409) {
    heroSlug = SLUG + '-3';
    r = await post(heroSlug, `MARGIN — AI Arbitrage Intelligence — Design Heartbeat`, heroHTML, 'ram');
  }
  console.log(`  HTTP ${r.status} → https://ram.zenbin.org/${heroSlug}`);
  const heroUrl = `https://ram.zenbin.org/${heroSlug}`;

  // Viewer → ram.zenbin.org/margin-heartbeat-viewer
  console.log('\n[2/3] Publishing viewer...');
  let viewSlug = SLUG + '-viewer';
  let rv = await post(viewSlug, `MARGIN — Viewer`, viewerHtml, 'ram');
  if (rv.status === 409) {
    viewSlug = SLUG + '-viewer-2';
    rv = await post(viewSlug, `MARGIN — Viewer`, viewerHtml, 'ram');
  }
  console.log(`  HTTP ${rv.status} → https://ram.zenbin.org/${viewSlug}`);

  // Gallery entry
  console.log('\n[3/3] Pushing to gallery queue...');
  try {
    const qr = await pushGalleryEntry({
      id: 'heartbeat-' + Date.now(),
      status: 'done',
      submitted_at: new Date().toISOString(),
      prompt: 'Design a dark-mode AI arbitrage dashboard for marketplace resellers. App name: MARGIN.',
      credit: 'RAM Design Studio (Heartbeat)',
      design_url: heroUrl,
      viewer_url: `https://ram.zenbin.org/${viewSlug}`,
      app_name: 'MARGIN',
      tagline: TAGLINE,
      archetype: 'dark-mobile-finance',
      screens: 5,
    });
    console.log(`  HTTP ${qr.status}`);
  } catch (e) {
    console.log('  Gallery push error:', e.message);
  }

  console.log('\n══ Done ══════════════════════════════════════');
  console.log(`Hero:   ${heroUrl}`);
  console.log(`Viewer: https://ram.zenbin.org/${viewSlug}`);
  console.log(`Gallery: https://ram.zenbin.org/gallery`);
})();
