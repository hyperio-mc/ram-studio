'use strict';
// publish-soma-heartbeat.js
// Full Design Discovery pipeline for SOMA
// Design Heartbeat — March 22, 2026

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'soma-heartbeat';
const VIEWER_SLUG = 'soma-viewer';
const DATE_STR    = 'March 22, 2026';
const APP_NAME    = 'SOMA';
const TAGLINE     = 'Flow state intelligence. Know when you\'re at your best.';
const ARCHETYPE   = 'health';

const ORIGINAL_PROMPT = `Design a 5-screen dark-mode flow state tracker — SOMA — inspired by:
1. Flomodia (darkmodedesign.com, March 2026) — a flow-state dark UI with purposeful minimal
   chrome, immersive session design, and intentional restraint
2. NNG "The Most Exciting Development in GenUI: Buttons and Checkboxes" (nngroup.com, March 2026)
   — AI that generates contextual UI components to reduce cognitive load — reflected in SOMA's
   AI suggestion chips and adaptive session configuration
3. Land-book AI tool landing pages (LangChain, Runlayer MCP orchestration, March 2026) —
   lean, precision interfaces for intelligent systems — informing SOMA's information density
4. Godly.website — bold typographic hierarchy and organic restraint as primary design language
SOMA is a flow state intelligence app: it learns your peak performance windows and helps you
protect and recreate them. Deep void + electric indigo + fresh mint palette.
5 screens: Now (score + state + recent sessions), Session (start + type + duration + AI suggestion),
Patterns (week chart + heatmap + peak windows), Insights (AI correlations + trend + triggers),
Profile (stats + milestones + goal + settings).`;

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:        '#090B14',
  surface:   '#111420',
  surface2:  '#171B2C',
  surface3:  '#1E2236',
  border:    '#1A1E30',
  border2:   '#252A40',
  muted:     '#3A4060',
  muted2:    '#6B7494',
  text:      '#F1F5F9',
  text2:     '#CBD5E1',
  indigo:    '#6366F1',
  indigoLo:  '#6366F118',
  indigoMid: '#6366F140',
  indigoHi:  '#818CF8',
  mint:      '#34D399',
  mintLo:    '#34D39918',
  mintHi:    '#6EE7B7',
  gold:      '#FBBF24',
  goldLo:    '#FBBF2418',
  goldHi:    '#FCD34D',
  rose:      '#F472B6',
  roseLo:    '#F472B618',
  violet:    '#A78BFA',
  violetLo:  '#A78BFA18',
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
  const mockURL   = `https://ram.zenbin.org/soma-mock`;

  const THUMB_H = 200;
  const screenNames = ['Now', 'Session', 'Patterns', 'Insights', 'Profile'];

  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = screenNames[i] || `Screen ${i+1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.45;margin-top:8px;letter-spacing:1.5px;color:${P.indigo}">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: P.bg,      role: 'VOID'         },
    { hex: P.surface, role: 'SURFACE'      },
    { hex: P.text,    role: 'FOREGROUND'   },
    { hex: P.indigo,  role: 'INDIGO'       },
    { hex: P.mint,    role: 'MINT'         },
    { hex: P.gold,    role: 'GOLD'         },
    { hex: P.violet,  role: 'VIOLET'       },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:70px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${P.border2};margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.indigoHi}">${sw.hex}</div>
    </div>`).join('');

  // CSS tokens
  const cssTokens = `/* SOMA — Design Tokens */
:root {
  --soma-bg:          ${P.bg};
  --soma-surface:     ${P.surface};
  --soma-surface-2:   ${P.surface2};
  --soma-surface-3:   ${P.surface3};
  --soma-border:      ${P.border};
  --soma-border-2:    ${P.border2};
  --soma-muted:       ${P.muted};
  --soma-muted-2:     ${P.muted2};
  --soma-text:        ${P.text};
  --soma-text-2:      ${P.text2};
  --soma-indigo:      ${P.indigo};
  --soma-indigo-hi:   ${P.indigoHi};
  --soma-indigo-lo:   ${P.indigoLo};
  --soma-indigo-mid:  ${P.indigoMid};
  --soma-mint:        ${P.mint};
  --soma-mint-hi:     ${P.mintHi};
  --soma-gold:        ${P.gold};
  --soma-violet:      ${P.violet};
  --soma-rose:        ${P.rose};
}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — RAM Design Studio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.text};font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
  a{color:${P.indigoHi};text-decoration:none}
  a:hover{text-decoration:underline}
  .container{max-width:1100px;margin:0 auto;padding:0 24px}

  /* Hero */
  .hero{padding:72px 0 48px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:600px;height:360px;background:radial-gradient(ellipse,${P.indigo}1A 0%,transparent 70%);pointer-events:none}
  .hero::after{content:'';position:absolute;bottom:-40px;right:10%;width:300px;height:200px;background:radial-gradient(ellipse,${P.mint}12 0%,transparent 70%);pointer-events:none}
  .hero-label{font-size:10px;letter-spacing:3px;color:${P.indigoHi};text-transform:uppercase;margin-bottom:20px}
  .hero-name{font-size:clamp(72px,10vw,120px);font-weight:800;letter-spacing:-4px;color:${P.text};line-height:1;margin-bottom:12px}
  .hero-tagline{font-size:18px;color:${P.text2};font-weight:300;margin-bottom:40px;opacity:.8}
  .hero-prompt{font-size:14px;font-style:italic;color:${P.text2};max-width:700px;margin:0 auto 40px;line-height:1.75;opacity:.65;border-left:2px solid ${P.indigo};padding-left:20px;text-align:left}

  /* Buttons */
  .btn-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:48px}
  .btn{padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:.3px;cursor:pointer;border:none;transition:opacity .2s}
  .btn-primary{background:${P.indigo};color:white}
  .btn-mock{background:${P.mint};color:${P.bg}}
  .btn-secondary{background:transparent;color:${P.text};border:1px solid ${P.border2}}
  .btn-ghost{background:${P.surface};color:${P.text2};border:1px solid ${P.border}}
  .btn:hover{opacity:.85}

  /* Thumbs */
  .thumbs-wrap{overflow-x:auto;padding:8px 24px 20px;-webkit-overflow-scrolling:touch}
  .thumbs{display:flex;gap:20px;width:max-content;margin:0 auto}

  /* Spec sections */
  .section{padding:48px 0;border-top:1px solid ${P.border}}
  .section-label{font-size:10px;letter-spacing:2.5px;color:${P.indigoHi};text-transform:uppercase;margin-bottom:28px;font-weight:700}
  .swatch-row{display:flex;gap:14px;flex-wrap:wrap}

  /* Tokens */
  .tokens-block{background:${P.surface};border:1px solid ${P.border2};border-radius:12px;padding:20px 24px;position:relative;overflow:auto}
  .tokens-block pre{font-family:'JetBrains Mono','Fira Code',monospace;font-size:12px;color:${P.text2};line-height:1.7;white-space:pre}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.surface2};border:1px solid ${P.border2};color:${P.indigoHi};padding:6px 14px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;letter-spacing:.5px}
  .copy-btn:hover{background:${P.indigo};color:white}

  /* PRD */
  .prd{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:32px;line-height:1.75;color:${P.text2}}
  .prd h3{color:${P.text};font-size:15px;font-weight:700;margin:24px 0 10px;letter-spacing:.2px}
  .prd h3:first-child{margin-top:0}
  .prd p{font-size:14px;margin-bottom:12px}
  .prd ul{padding-left:20px;font-size:14px}
  .prd li{margin-bottom:6px}
  .prd strong{color:${P.indigoHi}}

  /* Principles */
  .principles{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:16px}
  .principle{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:18px}
  .principle-title{font-size:12px;font-weight:700;color:${P.indigo};margin-bottom:8px;letter-spacing:.5px}
  .principle-body{font-size:12px;color:${P.muted2};line-height:1.6}

  /* Type scale */
  .type-scale-row{display:flex;flex-direction:column;gap:12px}
  .type-item{display:flex;align-items:baseline;gap:16px}
  .type-meta{font-size:9px;letter-spacing:1.5px;color:${P.muted2};width:100px;flex-shrink:0;text-transform:uppercase}

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
      <a href="${mockURL}" target="_blank"><button class="btn btn-mock">✦ Try Interactive Mock</button></a>
      <button class="btn btn-secondary" onclick="downloadPen()">⬇ Download .pen</button>
      <button class="btn btn-ghost" onclick="copyPrompt()">⎘ Copy Prompt</button>
      <a href="https://x.com/intent/tweet?text=${encodeURIComponent(`SOMA — Flow State Intelligence\nA dark-mode app that learns your peak performance windows\n\nhttps://ram.zenbin.org/${SLUG}\n\nDesigned by @RAM_DesignAI`)}" target="_blank"><button class="btn btn-ghost">✕ Share on X</button></a>
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
        <div class="type-meta">DISPLAY · 80px · 800</div>
        <div style="font-size:clamp(36px,6vw,80px);font-weight:800;color:${P.text};line-height:1;letter-spacing:-3px">SOMA</div>
      </div>
      <div class="type-item">
        <div class="type-meta">HEADING · 32px · 800</div>
        <div style="font-size:clamp(20px,3.5vw,32px);font-weight:800;color:${P.text};line-height:1;letter-spacing:-1px">Flow Score</div>
      </div>
      <div class="type-item">
        <div class="type-meta">SUBHEAD · 32px · 200</div>
        <div style="font-size:clamp(18px,3vw,32px);font-weight:200;color:${P.indigoHi};line-height:1;letter-spacing:-1px">Patterns</div>
      </div>
      <div class="type-item">
        <div class="type-meta">BODY · 13px · 400</div>
        <div style="font-size:13px;color:${P.text2};line-height:1.75">Your most productive hours are 9–11am. You are 40% more focused after a 7hr sleep.</div>
      </div>
      <div class="type-item">
        <div class="type-meta">LABEL · 9px · 700</div>
        <div style="font-size:9px;font-weight:700;color:${P.indigoHi};letter-spacing:2.5px">TODAY · MARCH 22 · IN FLOW</div>
      </div>
    </div>
  </div>

  <!-- DESIGN PRINCIPLES -->
  <div class="section">
    <div class="section-label">Design Principles</div>
    <div class="principles">
      <div class="principle">
        <div class="principle-title">FLOW FIRST</div>
        <div class="principle-body">The app exists to serve flow states, not interrupt them. Every interaction is deliberate, fast, and then invisible.</div>
      </div>
      <div class="principle">
        <div class="principle-title">DATA AS CLARITY</div>
        <div class="principle-body">Metrics surface insight, not anxiety. Numbers are large and contextual — always answering "so what?" not just "what."</div>
      </div>
      <div class="principle">
        <div class="principle-title">AI AS WHISPER</div>
        <div class="principle-body">AI suggestions appear as soft chips, not commands. GenUI patterns reduce choices at decision points — more checkboxes, fewer paragraphs.</div>
      </div>
      <div class="principle">
        <div class="principle-title">DEPTH WITHOUT DARKNESS</div>
        <div class="principle-body">Deep void background, but never oppressive. Indigo glow and mint accents create warmth and momentum in the dark.</div>
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
    <div class="prd">
      <h3>Overview</h3>
      <p>SOMA is a flow state intelligence app that learns your peak performance windows and helps you recreate them on demand. Inspired by Flomodia's flow-state UI aesthetic (darkmodedesign.com, March 2026) and the NNG GenUI research into AI-generated contextual UI components, SOMA combines adaptive AI with a minimal dark interface.</p>

      <h3>Target Users</h3>
      <ul>
        <li>Knowledge workers, developers, designers, and writers who depend on deep focus</li>
        <li>Athletes and high-performers using flow science to optimise training and output</li>
        <li>People recovering from burnout seeking to rebuild sustainable focus habits</li>
        <li>Biohackers and quantified-self practitioners tracking cognitive performance</li>
      </ul>

      <h3>Core Features</h3>
      <ul>
        <li><strong>Flow Score</strong>: Real-time composite score (0–100) derived from session data, sleep, mood, and self-report</li>
        <li><strong>Session Launcher</strong>: One-tap flow session with AI-pre-configured duration, sound, and focus type</li>
        <li><strong>Heatmap Calendar</strong>: Monthly flow intensity visualisation — find your patterns at a glance</li>
        <li><strong>Peak Windows</strong>: AI-identified daily time slots where you're statistically most likely to enter flow</li>
        <li><strong>AI Correlations</strong>: Data-backed insights like "7+ hours sleep boosts your score by 31%"</li>
        <li><strong>GenUI Suggestions</strong>: Context-aware buttons and chips that pre-fill sessions based on your history (inspired by NNG GenUI research)</li>
        <li><strong>Streaks + Milestones</strong>: Gentle gamification that rewards consistency without punishing breaks</li>
      </ul>

      <h3>Design Language</h3>
      <p>Deep void <strong>#090B14</strong> — the darkest possible dark without pure black, creating depth without aggression. Electric indigo <strong>#6366F1</strong> is the primary accent, chosen for its association with focus and creative intensity. Fresh mint <strong>#34D399</strong> signals active states, positive momentum, and AI outputs. Amber gold <strong>#FBBF24</strong> reserved for achievement and streak data. Two-weight typography system: 800 weight for impact, 200 weight for contrast and softness. All type uses system-ui for performance.</p>

      <h3>Screen Architecture</h3>
      <ul>
        <li><strong>Now</strong> — Flow Score hero ring, energy/focus/mood state cards, today's sessions, 14-day streak</li>
        <li><strong>Session</strong> — Session type picker, duration selector, ambient sound, intention input, AI peak window chip</li>
        <li><strong>Patterns</strong> — Weekly bar chart, month flow heatmap, peak time windows with progress bars</li>
        <li><strong>Insights</strong> — Main AI insight card, correlations grid (sleep/day/music/recovery), 30-day trend sparkline, flow trigger tags</li>
        <li><strong>Profile</strong> — Avatar, all-time stats, milestone badges, weekly flow goal, settings list</li>
      </ul>
    </div>
  </div>

</div>

<!-- FOOTER -->
<div class="footer">
  <div class="container">
    <a href="${viewerURL}" target="_blank">Viewer →</a> ·
    <a href="${mockURL}" target="_blank">Interactive Mock →</a> ·
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
    a.download = 'soma.pen';
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
  console.log(`\n◎ SOMA — Design Heartbeat Pipeline`);
  console.log(`   Date: ${DATE_STR}\n`);

  // Load pen
  const penPath = path.join(__dirname, 'soma.pen');
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
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id:           `heartbeat-soma-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/soma-mock`,
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
  console.log(`  Mock:   https://ram.zenbin.org/soma-mock  (run soma-mock.mjs next)`);
}

main().catch(console.error);
