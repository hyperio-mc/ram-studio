'use strict';
// publish-vela-heartbeat.js
// Full Design Discovery pipeline for VELA
// Design Heartbeat — Mar 23, 2026
// Inspired by:
//   • atlascard.com (via godly.website) — ultra-premium dark luxury card UI, deep black + gold
//   • Linear's AI agent workflow visualization (via darkmodedesign.com)
//   • Intersection of luxury product design + real-time AI agent monitoring

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'vela';
const VIEWER_SLUG = 'vela-viewer';
const DATE_STR    = 'March 23, 2026';
const APP_NAME    = 'Vela';
const TAGLINE     = 'Your AI concierge, always on';
const ARCHETYPE   = 'luxury-concierge';
const MOCK_URL    = 'https://ram.zenbin.org/vela-mock';

const ORIGINAL_PROMPT = `Inspired by atlascard.com (godly.website) ultra-premium dark luxury UI + Linear AI agent workflow visualization (darkmodedesign.com) — a premium AI travel concierge app showing your AI working in real-time, midnight navy palette with champagne gold accents`;

// ── Palette (Dark — primary) ──────────────────────────────────────────────────
const P = {
  bg:       '#07091A',
  bg2:      '#0C0F26',
  surface:  '#111630',
  surface2: '#181E3A',
  border:   '#242B4D',
  gold:     '#C9A96E',
  goldDim:  '#8B6E42',
  goldHi:   '#E5C98A',
  blue:     '#7C9ECC',
  teal:     '#5BBFB5',
  rose:     '#D46D7A',
  fg:       '#E8E2D6',
  fg2:      '#A89E8E',
  fg3:      '#6B6057',
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

// ── Build hero HTML ───────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');
  const viewerURL  = `https://ram.zenbin.org/${VIEWER_SLUG}`;
  const shareText  = encodeURIComponent(`${APP_NAME} — ${TAGLINE} | RAM Design Studio`);
  const shareURL   = encodeURIComponent(`https://ram.zenbin.org/${SLUG}`);

  const swatchHTML = [
    { color: P.bg,      label: 'Midnight' },
    { color: P.surface, label: 'Surface'  },
    { color: P.gold,    label: 'Gold'     },
    { color: P.blue,    label: 'Steel'    },
    { color: P.teal,    label: 'Teal'     },
    { color: P.rose,    label: 'Rose'     },
    { color: P.fg,      label: 'Cream'    },
    { color: P.fg2,     label: 'Muted'    },
  ].map(({ color, label }) =>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <div style="width:40px;height:40px;border-radius:10px;background:${color};border:1px solid rgba(201,169,110,0.15)"></div>
      <span style="font-size:9px;color:${P.fg3};letter-spacing:0.5px">${label}</span>
      <span style="font-size:8px;color:${P.fg3};font-family:monospace">${color}</span>
    </div>`
  ).join('');

  const typeScaleHTML = [
    { size: '28px', weight: 700, label: 'Display', family: 'Instrument Serif' },
    { size: '22px', weight: 700, label: 'Heading', family: 'Inter' },
    { size: '14px', weight: 500, label: 'Body', family: 'Inter' },
    { size: '12px', weight: 400, label: 'Caption', family: 'Inter' },
    { size: '10px', weight: 400, label: 'Label', family: 'JetBrains Mono' },
  ].map(({ size, weight, label, family }) =>
    `<div style="display:flex;align-items:baseline;gap:12px;margin-bottom:10px;border-bottom:1px solid ${P.border};padding-bottom:10px">
      <span style="font-size:${size};font-weight:${weight};color:${P.fg};font-family:${family}">${label}</span>
      <span style="font-size:10px;color:${P.fg3};font-family:monospace">${size} / ${weight} / ${family}</span>
    </div>`
  ).join('');

  const spacingHTML = [4, 8, 12, 16, 20, 24, 32, 44, 56].map(n =>
    `<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <div style="height:8px;background:${P.gold};border-radius:2px;width:${n * 2}px;opacity:0.7"></div>
      <span style="font-size:10px;color:${P.fg3};font-family:monospace">${n}px</span>
    </div>`
  ).join('');

  const principlesHTML = [
    ['◉', 'Luxury first', 'Every detail earns its place — typography, spacing, and colour all serve a premium feel.'],
    ['◈', 'Agent-transparent', 'The AI shows its work in the open, building trust through a Linear-style activity log.'],
    ['✦', 'Gold as intent', 'Gold accent is reserved for active/primary states — never decorative. Only lit when Vela acts.'],
    ['⟳', 'Motion implies action', 'Pulsing status rings and progress bars communicate that something is always happening.'],
  ].map(([icon, title, body]) =>
    `<div style="display:flex;gap:12px;margin-bottom:16px">
      <span style="font-size:16px;color:${P.gold};flex-shrink:0">${icon}</span>
      <div>
        <div style="font-size:11px;font-weight:700;color:${P.fg};margin-bottom:4px">${title}</div>
        <div style="font-size:11px;color:${P.fg2};line-height:1.5">${body}</div>
      </div>
    </div>`
  ).join('');

  const cssTokens = `/* Vela Design Tokens — Dark Luxury Midnight */
:root {
  --vela-bg:        ${P.bg};
  --vela-bg2:       ${P.bg2};
  --vela-surface:   ${P.surface};
  --vela-surface2:  ${P.surface2};
  --vela-border:    ${P.border};

  --vela-gold:      ${P.gold};
  --vela-gold-dim:  ${P.goldDim};
  --vela-gold-hi:   ${P.goldHi};
  --vela-blue:      ${P.blue};
  --vela-teal:      ${P.teal};
  --vela-rose:      ${P.rose};

  --vela-fg:        ${P.fg};
  --vela-fg-2:      ${P.fg2};
  --vela-fg-3:      ${P.fg3};

  --vela-radius-sm: 10px;
  --vela-radius-md: 16px;
  --vela-radius-lg: 24px;

  --vela-font-display: 'Instrument Serif', Georgia, serif;
  --vela-font-ui:      'Inter', -apple-system, system-ui, sans-serif;
  --vela-font-mono:    'JetBrains Mono', 'SF Mono', monospace;
}`;

  const prdHTML = `
<h3>Overview</h3>
<p>Vela is a luxury AI travel and lifestyle concierge mobile app. It handles reservations, travel bookings, and curated recommendations while showing users what the AI is doing at every step. Think Black Card meets Linear's agent workflow.</p>

<h3>Design Challenge</h3>
<p>Directly inspired by two discoveries: <strong>atlascard.com</strong> (seen on godly.website) showed how deep-black luxury product UI can feel incredibly premium with gold accents and a bento-grid layout of perks. <strong>Linear's new AI agent view</strong> (darkmodedesign.com) showed how making AI activity visible — like a terminal log — builds extraordinary user trust. Combining both: what if a luxury concierge showed you, step by step, exactly what it was doing?</p>

<h3>Screen Architecture (6 Screens)</h3>
<ul>
  <li><strong>Home</strong> — Dashboard showing active AI status, upcoming trips, quick actions, and recent activity</li>
  <li><strong>Discover</strong> — Curated hotel and dining grid for current destination, Atlas Card-style bento layout</li>
  <li><strong>AI Agent</strong> — Real-time agent activity with Linear-style terminal log showing AI reasoning</li>
  <li><strong>Booking Detail</strong> — Premium booking card with confirmation details, card perks applied</li>
  <li><strong>Membership</strong> — Physical card visualization, points balance, and benefit status</li>
  <li><strong>Preferences</strong> — Taste profile, travel style, and AI behavior toggle settings</li>
</ul>

<h3>Key Design Decisions</h3>
<ul>
  <li><strong>Midnight navy vs pure black:</strong> #07091A gives the background warmth and depth vs cold pure black — makes the gold glow warmer</li>
  <li><strong>Champagne gold (#C9A96E) as state indicator:</strong> Gold only appears on active/working states — it earns its appearance</li>
  <li><strong>Monospace agent log:</strong> The AI activity screen uses JetBrains Mono to evoke a terminal, making AI transparency feel technical and trustworthy</li>
  <li><strong>Pulsing ring status:</strong> Concentric teal rings around the active indicator borrow from Linear's "in progress" pattern</li>
</ul>`;

  const thumbsHTML = pen.screens.map(s =>
    `<div style="flex-shrink:0;text-align:center">
      <div style="width:130px;height:280px;background:${P.bg};border-radius:18px;border:1px solid ${P.border};
        display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${P.gold}"></div>
        <span style="color:${P.fg2};font-size:11px;text-align:center;padding:12px">
          ${s.label}<br/><span style="color:${P.gold};font-size:18px;display:block;margin-top:8px">✦</span>
        </span>
      </div>
      <p style="font-size:10px;color:${P.fg3};margin-top:8px;letter-spacing:0.5px">${s.label}</p>
    </div>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="Vela: Premium AI travel concierge with midnight navy luxury aesthetic, champagne gold accents, and real-time AI agent activity visualization. 6 beautifully designed screens.">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:-apple-system,'Inter','Segoe UI',system-ui,sans-serif;line-height:1.6}
  a{color:${P.gold};text-decoration:none}
  a:hover{text-decoration:underline;color:${P.goldHi}}
  .container{max-width:960px;margin:0 auto;padding:0 24px}

  .hero{padding:80px 0 60px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);
    width:900px;height:500px;background:radial-gradient(ellipse at 45% 40%,${P.gold}18 0%,${P.blue}0A 50%,transparent 75%);pointer-events:none}
  .hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${P.border},transparent)}

  .hero-tag{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;
    background:rgba(201,169,110,0.1);color:${P.gold};
    font-size:10px;font-weight:700;letter-spacing:2px;border-radius:20px;margin-bottom:28px;
    border:1px solid rgba(201,169,110,0.25)}

  .hero-name-row{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:18px;flex-wrap:wrap}
  .word-block{display:inline-block;padding:10px 28px;border-radius:14px;font-size:clamp(52px,11vw,96px);
    font-weight:800;line-height:1;letter-spacing:-2px}
  .word-block-accent{background:linear-gradient(135deg,${P.gold},${P.goldHi});color:${P.bg}}
  .word-block-text{background:${P.surface};color:${P.fg};border:1px solid ${P.border}}

  .hero-tagline{font-size:clamp(15px,2.5vw,20px);color:${P.fg2};margin-bottom:8px;font-weight:300;letter-spacing:0.5px}
  .hero-date{font-size:11px;color:${P.fg3};letter-spacing:1.5px;margin-bottom:44px;text-transform:uppercase}
  .hero-prompt{font-size:14px;color:${P.fg2};font-style:italic;max-width:700px;margin:0 auto 48px;
    line-height:1.9;padding:28px;background:${P.surface};border-radius:14px;
    border:1px solid rgba(201,169,110,0.15);border-left:3px solid ${P.gold};
    box-shadow:0 2px 20px rgba(7,9,26,0.5)}

  .actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:56px}
  .btn{padding:11px 22px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;
    border:none;text-decoration:none;display:inline-flex;align-items:center;gap:8px;
    transition:all .15s;letter-spacing:0.5px}
  .btn:hover{opacity:.88;text-decoration:none;transform:translateY(-1px)}
  .btn-primary{background:${P.gold};color:${P.bg}}
  .btn-secondary{background:${P.surface};color:${P.fg};border:1px solid ${P.border}}
  .btn-outline{background:transparent;color:${P.fg2};border:1px solid ${P.border}}
  .btn-mock{background:linear-gradient(135deg,${P.gold},${P.blue});color:${P.bg}}

  .screens-section{margin-bottom:72px}
  .section-label{font-size:9px;font-weight:700;letter-spacing:2.5px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .screens-strip{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px;
    scrollbar-width:thin;scrollbar-color:rgba(201,169,110,0.3) transparent}
  .screens-strip::-webkit-scrollbar{height:4px}
  .screens-strip::-webkit-scrollbar-track{background:transparent}
  .screens-strip::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.3);border-radius:2px}

  .spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:72px}
  @media(max-width:600px){.spec-grid{grid-template-columns:1fr}}
  .spec-card{background:${P.surface};border:1px solid ${P.border};border-radius:14px;padding:24px;
    box-shadow:0 1px 16px rgba(7,9,26,0.4)}
  .spec-card h3{font-size:9px;font-weight:700;letter-spacing:2px;color:${P.fg3};
    text-transform:uppercase;margin-bottom:20px}
  .palette{display:flex;gap:8px;flex-wrap:wrap}

  .tokens-section{margin-bottom:72px}
  .tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:14px;
    padding:24px;position:relative;box-shadow:0 1px 16px rgba(7,9,26,0.4)}
  .tokens-block pre{font-family:'SF Mono','Fira Code',monospace;font-size:11px;
    color:${P.fg2};overflow-x:auto;line-height:1.8;white-space:pre}
  .copy-btn{position:absolute;top:16px;right:16px;background:rgba(201,169,110,0.1);color:${P.gold};
    border:1px solid rgba(201,169,110,0.25);border-radius:6px;padding:6px 14px;font-size:10px;font-weight:700;
    letter-spacing:1px;cursor:pointer;transition:all .15s}
  .copy-btn:hover{background:${P.gold};color:${P.bg}}

  .prd-section{margin-bottom:72px}
  .prd-body{color:${P.fg2};font-size:14px;line-height:1.8}
  .prd-body h3{font-size:17px;font-weight:700;color:${P.fg};margin:28px 0 12px}
  .prd-body p{margin-bottom:14px}
  .prd-body ul{padding-left:20px;margin-bottom:14px}
  .prd-body li{margin-bottom:6px}
  .prd-body strong{color:${P.fg}}

  .footer{padding:56px 0;border-top:1px solid ${P.border};text-align:center;
    color:${P.fg3};font-size:12px}
  .footer a{color:${P.fg3}}
  .footer a:hover{color:${P.fg2}}
</style>
</head>
<body>
<div class="container">

  <div class="hero">
    <div class="hero-tag">RAM DESIGN STUDIO · ${DATE_STR}</div>
    <div class="hero-name-row">
      <span class="word-block word-block-accent">${APP_NAME}</span>
    </div>
    <div class="hero-tagline">${TAGLINE}</div>
    <div class="hero-date">Design Heartbeat · Midnight Navy × Champagne Gold · 6 Screens</div>
    <div class="hero-prompt">${ORIGINAL_PROMPT}</div>
    <div class="actions">
      <a href="${viewerURL}" class="btn btn-primary" target="_blank">▶ Open in Viewer</a>
      <a href="${MOCK_URL}" class="btn btn-mock" target="_blank">✦ Try Interactive Mock</a>
      <a href="data:application/json;base64,${penEncoded}" download="vela.pen" class="btn btn-secondary">↓ Download .pen</a>
      <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.querySelector('.hero-prompt').textContent.trim()).then(()=>this.textContent='✓ Copied!')">⎘ Copy Prompt</button>
      <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}" class="btn btn-outline" target="_blank">𝕏 Share</a>
      <a href="https://ram.zenbin.org/gallery" class="btn btn-outline">⬡ Gallery</a>
    </div>
  </div>

  <div class="screens-section">
    <div class="section-label">6 Screens — Home · Discover · AI Agent · Booking · Membership · Preferences</div>
    <div class="screens-strip">${thumbsHTML}</div>
  </div>

  <div class="spec-grid">
    <div class="spec-card">
      <h3>Color Palette</h3>
      <div class="palette">${swatchHTML}</div>
    </div>
    <div class="spec-card">
      <h3>Type Scale</h3>
      ${typeScaleHTML}
    </div>
    <div class="spec-card">
      <h3>Spacing System</h3>
      ${spacingHTML}
    </div>
    <div class="spec-card">
      <h3>Design Principles</h3>
      ${principlesHTML}
    </div>
  </div>

  <div class="tokens-section">
    <div class="section-label">CSS Design Tokens</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.querySelector('.tokens-block pre').textContent).then(()=>this.textContent='✓ Copied!')">COPY TOKENS</button>
      <pre>${cssTokens}</pre>
    </div>
  </div>

  <div class="prd-section">
    <div class="section-label">Product Brief / PRD</div>
    <div class="spec-card">
      <div class="prd-body">${prdHTML}</div>
    </div>
  </div>

  <div class="footer">
    <p>Built by <strong style="color:${P.fg2}">RAM Design Studio</strong> · Heartbeat ${DATE_STR}</p>
    <p style="margin-top:8px">
      <a href="https://ram.zenbin.org/gallery">← Gallery</a> ·
      <a href="${viewerURL}">Viewer →</a> ·
      <a href="${MOCK_URL}">Interactive Mock →</a>
    </p>
  </div>

</div>
</body>
</html>`;
}

// ── Build viewer HTML ─────────────────────────────────────────────────────────
function buildViewerHTML(pen) {
  const penJson = JSON.stringify(pen);
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'axon-viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Vela Design Discovery Pipeline ===\n');

  const penPath = path.join(__dirname, 'vela.pen');
  const pen     = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`Loaded pen: ${pen.screens.length} screens`);

  // (a) Hero page
  console.log('\n[1/4] Building hero page...');
  const heroHTML = buildHeroHTML(pen);
  console.log(`  Hero HTML: ${(heroHTML.length / 1024).toFixed(1)} KB`);
  console.log('[1/4] Publishing hero → ram.zenbin.org/' + SLUG);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHTML, 'ram');
  console.log(`  -> ${heroRes.status}  ${heroRes.body.slice(0, 120)}`);

  // (b) Viewer
  console.log('\n[2/4] Building + publishing viewer...');
  const viewerHTML = buildViewerHTML(pen);
  console.log(`  Viewer HTML: ${(viewerHTML.length / 1024).toFixed(1)} KB`);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer | RAM Design Studio`, viewerHTML, 'ram');
  console.log(`  -> ${viewerRes.status}  ${viewerRes.body.slice(0, 120)}`);

  // (c) Gallery queue
  console.log('\n[3/4] Updating gallery queue...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-vela-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     MOCK_URL,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      6,
    source:       'heartbeat',
  };
  queue.submissions.push(newEntry);
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
  console.log(`  -> Gallery: ${putRes.status === 200 ? 'OK' : putRes.body.slice(0, 150)}`);

  console.log('\n[4/4] Pipeline complete!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock:   ${MOCK_URL} (run vela-mock.mjs separately)`);
}

main().catch(console.error);
