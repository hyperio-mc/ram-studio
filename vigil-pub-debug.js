'use strict';
// publish-vigil-heartbeat.js — Full Design Discovery pipeline for VIGIL heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'vigil';
const VIEWER_SLUG = 'vigil-viewer';
const MOCK_SLUG   = 'vigil-mock';
const APP_NAME    = 'VIGIL';

// ── Design metadata ────────────────────────────────────────────────────────────
const meta = {
  appName:   'VIGIL',
  tagline:   'Cyber threat intelligence platform. Watch everything. Miss nothing.',
  archetype: 'security',
  palette: {
    bg:       '#0A0C12',
    surface:  '#131621',
    surface2: '#1A1D2E',
    border:   '#1F2336',
    fg:       '#E8E2D0',
    fg2:      '#A8A396',
    accent:   '#FF2233',
    accent2:  '#3DFFD0',
    amber:    '#FFB830',
    purple:   '#7C5CFC',
    muted:    '#5A6080',
  },
};

const ORIGINAL_PROMPT = `Design VIGIL — a dark-mode cyber threat intelligence platform. Directly inspired by research from this heartbeat session:

1. Utopia Tokyo (Awwwards SOTD, March 2026) — "MASKED. MARKED. WATCHED." Dark navy #14171F, vibrant red #FF1919, warm cream text #EBE5CE, pixel fonts (Neopixel, Zpix) mixed with PP Mori. Cyberpunk surveillance energy applied to B2B security SaaS.

2. Evervault Customers page (featured on godly.website) — Deep space navy #010314, glassmorphism cards rgba(23,24,37,0.75), soft lavender text. Security/privacy SaaS design language — data tables showing breach prevented, fraud blocked, sensitive data secured.

3. Twingate (godly.website) — Zero-trust security network, clean dark data tables with status indicators, compact information density.

Theme: DARK (previous design SPOOL was light). Deep space navy #0A0C12, alert red #FF2233 (Utopia Tokyo family), cyber mint #3DFFD0 for safe states, warm cream text #E8E2D0. 5 screens: Threat Command dashboard / Asset Registry / Alert Feed / Threat Intelligence Profile / Security Posture scorecard.`;

const sub = {
  id:           `heartbeat-vigil-${Date.now()}`,
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

const screenNames = ['Command', 'Assets', 'Alerts', 'Intel', 'Posture'];

// ── Helpers ────────────────────────────────────────────────────────────────────
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
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
      'User-Agent': 'Mozilla/5.0 (compatible; RAM-Design/1.0)',
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
    const cr   = node.radius ? ` rx="${node.radius * Math.min(scaleX, scaleY)}"` : '';
    const sw   = node.strokeWidth || 0;
    const strokeStr = sw > 0 && node.stroke ? ` stroke="${node.stroke}" stroke-width="${sw * Math.min(scaleX, scaleY)}"` : '';

    if (node.type === 'text') {
      const fs  = Math.max(1, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const tx  = x;
      const ty  = y + fs * 0.88;
      const fw  = (node.fontWeight >= 700) ? ' font-weight="bold"' : '';
      const txt = (node.content || '').slice(0, 28).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${fill}"${op}${fw}>${txt}</text>`;
    }
    if (node.type === 'ellipse') {
      const fill2 = fill.startsWith('rgba') || fill.startsWith('rgb') ? fill : fill;
      return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${(y+h/2).toFixed(1)}" rx="${(w/2).toFixed(1)}" ry="${(h/2).toFixed(1)}" fill="${fill2}"${op}${strokeStr}/>`;
    }
    if (node.type === 'rect' || node.type === 'rectangle') {
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/>`;
    }
    const clipId  = `fc${depth}_${((x*100+y*10)|0)}`;
    const clipDef = node.clip ? `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}"${cr}/></clipPath>` : '';
    const clipA   = node.clip ? ` clip-path="url(#${clipId})"` : '';
    return `${clipDef}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${fill}"${op}${cr}${strokeStr}/><g${clipA}>${children}</g>`;
  }

  const P = meta.palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:10px;overflow:hidden;border:1px solid ${P.border}">
    ${renderNode(screen)}
  </svg>`;
}

// ── Hero HTML builder ──────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  const screens = penJson.children || [];
  const P = meta.palette;

  const THUMB_H = 188;
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = screenNames[i] || `SCREEN ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1.5px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${P.fg}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'SPACE NAVY'  },
    { hex: P.surface, role: 'SURFACE'     },
    { hex: P.fg,      role: 'CREAM TEXT'  },
    { hex: P.accent,  role: 'ALERT RED'   },
    { hex: P.accent2, role: 'CYBER MINT'  },
    { hex: P.amber,   role: 'WARNING'     },
    { hex: P.purple,  role: 'INTEL PURP'  },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:64px">
      <div style="height:48px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border};margin-bottom:8px"></div>
      <div style="font-size:7.5px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px;color:${P.fg2}">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY', size: '48px', weight: '800', sample: 'VIGIL',                               color: P.fg   },
    { label: 'HEADING', size: '18px', weight: '700', sample: 'Threat Command — Real-time Overview',  color: P.fg   },
    { label: 'SUBHEAD', size: '12px', weight: '600', sample: 'ACTIVE THREATS · CRITICAL · BLOCKED',  color: P.fg2  },
    { label: 'BODY',    size: '11px', weight: '400', sample: 'SQL Injection attempt on /api/users detected and blocked.', color: P.fg2 },
    { label: 'LABEL',   size: '8px',  weight: '700', sample: 'CRITICAL  HIGH  MEDIUM  LOW  LIVE  IN PROGRESS', color: P.muted },
  ].map(t => `
    <div style="padding:12px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:7.5px;letter-spacing:2px;color:${P.muted};margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${t.color};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* VIGIL — Cyber Threat Intelligence Platform */
  /* Inspired by Utopia Tokyo (Awwwards SOTD) + Evervault (godly.website) */

  /* Color — deep space dark system */
  --color-bg:       ${P.bg};      /* deep space navy */
  --color-surface:  ${P.surface}; /* elevated card */
  --color-border:   ${P.border};  /* subtle divider */
  --color-fg:       ${P.fg};      /* warm cream text */
  --color-fg2:      ${P.fg2};     /* secondary text */
  --color-muted:    ${P.muted};   /* muted blue-grey */
  --color-accent:   ${P.accent};  /* alert red — critical */
  --color-safe:     ${P.accent2}; /* cyber mint — clear/safe */
  --color-warning:  ${P.amber};   /* warning amber */
  --color-intel:    ${P.purple};  /* intel purple */

  /* Severity levels */
  --sev-critical: ${P.accent};
  --sev-high:     ${P.amber};
  --sev-medium:   ${P.purple};
  --sev-low:      ${P.accent2};

  /* Typography */
  --font: -apple-system, 'Inter', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-display: 800 clamp(32px, 8vw, 48px) / 1 var(--font);
  --font-heading: 700 16px / 1.3 var(--font);
  --font-label:   700 8.5px / 1 var(--font);

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 12px;
}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VIGIL — Cyber Threat Intelligence · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:-apple-system,'Inter',system-ui,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${P.fg}}
  .nav-id{font-size:9px;color:${P.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:16px}
  h1{font-size:clamp(64px,12vw,108px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${P.fg}}
  .sub{font-size:15px;color:${P.fg2};max-width:540px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.muted};letter-spacing:1px;margin-bottom:4px;text-transform:uppercase}
  .meta-item strong{color:${P.fg};font-size:13px}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${P.accent};color:#FFFFFF}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${P.border}}
  .btn-s:hover{border-color:${P.accent}}
  .btn-mock{background:${P.accent2}18;color:${P.accent2};border:1px solid ${P.accent2}44;font-weight:700}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${P.border}}
  .thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}55;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:9.5px;line-height:1.8;color:${P.fg};opacity:.7;white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.accent}18;border:1px solid ${P.accent}44;color:${P.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.accent}30}
  .prompt-section{padding:40px;border-top:1px solid ${P.border};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:10px;text-transform:uppercase}
  .p-text{font-size:14px;color:${P.fg2};font-style:italic;max-width:640px;line-height:1.7;margin-bottom:16px}
  footer{padding:24px 40px;border-top:1px solid ${P.border};font-size:10px;color:${P.muted};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .inspiration-box{background:${P.surface};border:1px solid ${P.border};border-left:3px solid ${P.accent};border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0}
  .inspiration-box p{font-size:12px;color:${P.fg2};line-height:1.7}
  .live-pill{display:inline-flex;align-items:center;gap:6px;background:${P.accent}18;border:1px solid ${P.accent}44;border-radius:20px;padding:4px 12px;margin-left:12px;vertical-align:middle}
  .live-dot{width:6px;height:6px;border-radius:50%;background:${P.accent};animation:pulse 1.5s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .live-text{font-size:9px;font-weight:700;letter-spacing:1.5px;color:${P.accent}}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · SECURITY · MARCH 2026 · DARK THEME</div>
  <h1>VIGIL <span class="live-pill"><span class="live-dot"></span><span class="live-text">LIVE</span></span></h1>
  <p class="sub">${meta.tagline}</p>
  <div class="meta">
    <div class="meta-item"><span>Screens</span><strong>5 Mobile</strong></div>
    <div class="meta-item"><span>Inspired By</span><strong>Utopia Tokyo + Evervault</strong></div>
    <div class="meta-item"><span>Palette</span><strong>#FF2233 + #0A0C12</strong></div>
    <div class="meta-item"><span>Theme</span><strong>Dark — Deep Space Navy</strong></div>
    <div class="meta-item"><span>Designer</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${VIEWER_SLUG}" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/${MOCK_SLUG}" target="_blank">✦ Try Interactive Mock ☀◑</a>
    <a class="btn btn-s" href="#brand">⬡ Brand System</a>
    <a class="btn btn-s" href="#tokens">◈ CSS Tokens</a>
  </div>

  <div class="inspiration-box">
    <p><strong>Trend spotted:</strong> Utopia Tokyo won Awwwards SOTD this week — their "MASKED. MARKED. WATCHED." tagline and dark navy + vibrant red + warm cream parchment text combo is a striking aesthetic. I took that surveillance energy and translated it into a B2B security SaaS context (inspired also by Evervault's customer page featured on godly.website — deep space navy, glassmorphism cards, privacy-first data density).</p>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN PREVIEW — 5 MOBILE SCREENS (390×844)</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section" id="brand">
  <div class="section-label">BRAND SYSTEM</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;text-transform:uppercase">Color Palette</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:32px">
        <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;text-transform:uppercase">Type Scale</div>
        ${typeScaleHTML}
      </div>
    </div>
    <div id="tokens">
      <div style="font-size:9px;letter-spacing:2px;color:${P.muted};margin-bottom:16px;text-transform:uppercase">CSS Design Tokens</div>
      <div class="tokens-block">
        <button class="copy-btn" onclick="copyTokens()">COPY</button>
        <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
      </div>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">Design Prompt</div>
  <p class="p-text">${ORIGINAL_PROMPT.replace(/\n/g, '<br>')}</p>
</section>

<footer>
  <span>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</span>
  <span>ram.zenbin.org/${SLUG}</span>
</footer>

<script>
function copyTokens(){
  const pre=document.querySelector('.tokens-pre');
  navigator.clipboard.writeText(pre.innerText).then(()=>{
    const t=document.getElementById('toast');
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2200);
  });
}
</script>
</body>
</html>`;
}

// ── Viewer HTML builder ────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  const P = meta.palette;
  const penJsonStr = JSON.stringify(penJson);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VIGIL — Pencil Viewer · RAM</title>
<style>
  body{margin:0;background:${P.bg};display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,sans-serif}
  #viewer-root{width:100%;max-width:1200px;padding:24px}
  .viewer-header{color:${P.fg};font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;opacity:.4}
</style>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};</script>
</head>
<body>
<div id="viewer-root">
  <div class="viewer-header">VIGIL — Cyber Threat Intelligence · Pencil v2.8</div>
  <div id="pencil-viewer"></div>
</div>
<script src="https://cdn.pencil.dev/viewer/v2.8/pencil-viewer.min.js"></script>
<script>
  if(window.PencilViewer){
    PencilViewer.init({
      container: document.getElementById('pencil-viewer'),
      pen: JSON.parse(window.EMBEDDED_PEN),
      theme: 'dark',
    });
  } else {
    document.getElementById('pencil-viewer').innerHTML = '<p style="color:${P.fg2};font-size:13px;padding:24px">Viewer unavailable — pen data embedded.</p>';
  }
</script>
</body>
</html>`;
}

// ── GitHub queue helper ────────────────────────────────────────────────────────
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

// ── Main pipeline ──────────────────────────────────────────────────────────────
(async () => {
  console.log('── VIGIL Heartbeat Publish Pipeline ──\n');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'vigil.pen'), 'utf8'));
  console.log(`✓ Loaded vigil.pen — ${penJson.children.length} screens`);

  // 1. Hero page
  const heroHTML = buildHeroHTML(penJson);
  fs.writeFileSync("/tmp/vigil-hero-actual.html", heroHTML);
  console.log(`  hero HTML: ${heroHTML.length.toLocaleString()} chars`);
  const heroRes = await publishToZenbin(SLUG, 'VIGIL — Cyber Threat Intelligence · RAM Design Studio', heroHTML);
  console.log(`✓ Hero published → https://ram.zenbin.org/${SLUG} [${heroRes.status}]`);
  if (heroRes.status !== 200 && heroRes.status !== 201) {
    console.log('  Response:', heroRes.body.slice(0, 200));
  }

  // 2. Viewer
  const viewerHTML = buildViewerHTML(penJson);
  console.log(`  viewer HTML: ${viewerHTML.length.toLocaleString()} chars`);
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'VIGIL Viewer · RAM Design Studio', viewerHTML);
  console.log(`✓ Viewer published → https://ram.zenbin.org/${VIEWER_SLUG} [${viewerRes.status}]`);

  // 3. GitHub gallery queue
  console.log('\n── GitHub gallery queue ──');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (getRes.status !== 200) {
    console.log('  GitHub GET failed:', getRes.status, getRes.body.slice(0, 100));
    return;
  }

  const fileData    = JSON.parse(getRes.body);
  const currentSha  = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    ...sub,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    viewer_url: `https://ram.zenbin.org/${VIEWER_SLUG}`,
    mock_url:   `https://ram.zenbin.org/${MOCK_SLUG}`,
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await ghReq({
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

  if (putRes.status === 200 || putRes.status === 201) {
    console.log(`✓ Gallery queue updated — ${queue.submissions.length} total entries`);
  } else {
    console.log('  GitHub PUT failed:', putRes.status, putRes.body.slice(0, 150));
  }

  console.log('\n── Pipeline complete ──');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${MOCK_SLUG}`);
})();
