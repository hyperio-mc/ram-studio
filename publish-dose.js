// publish-dose.js — hero + viewer + gallery queue for DOSE
'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'dose';
const APP_NAME  = 'DOSE';
const TAGLINE   = 'Precision Skincare Intelligence';
const DATE_STR  = 'April 1, 2026';
const SUBDOMAIN = 'ram';
const ARCHETYPE = 'health-beauty-tech';
const PROMPT    = 'Design a precision skincare formulation OS for skin-obsessed founders. Inspired by Overlay (lapa.ninja) — orbital/radial diagnostic labels floating around a central face/product image, clinical white precision. Also VAST SOTD (awwwards.com Apr 1 2026) — 2-color editorial maximalism. Light theme: off-white #F5F3EF, clinical teal #00A896. 5 screens: Analyze (skin scan with orbital diagnostics), Formula (ingredient orbital), Routine (AM/PM protocol), Lab (ingredient explorer), Progress (radial rings).';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penPath = path.join(__dirname, 'dose.pen');
const penJson = fs.readFileSync(penPath, 'utf8');
const penData = JSON.parse(penJson);

const P = {
  bg:          '#F5F3EF',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F0EDE8',
  text:        '#1A1A1F',
  textSub:     '#6B6F78',
  textFaint:   '#AEAFB3',
  accent:      '#00A896',
  accentLight: '#E5F6F4',
  accentDark:  '#007A6C',
  border:      '#E2DDD7',
  borderLight: '#EDE9E4',
  warm:        '#D4B896',
  warmLight:   '#F7EDE3',
  red:         '#E05252',
  yellow:      '#F5C842',
  white:       '#FFFFFF',
};

const SCREEN_NAMES = ['Analyze', 'Formula', 'Routine', 'Lab', 'Progress'];

function sc(c) {
  if (!c || typeof c !== 'string') return P.bg;
  if (c.startsWith('#') || c.startsWith('rgba') || c.startsWith('rgb')) return c;
  const m = c.match(/^([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  if (m) return '#' + m[1];
  return c;
}

function rn(node, ox, oy, depth, maxD) {
  if (!node || depth > maxD) return '';
  const x = (node.x || 0) + ox;
  const y = (node.y || 0) + oy;
  const w = Math.max(node.width  || 0, 1);
  const h = Math.max(node.height || 0, 1);
  const op = node.opacity !== undefined ? node.opacity : 1;

  let svg = '';
  const t = node.type;

  if (t === 'rectangle' || t === 'frame' || (!t && w && h)) {
    const fill = sc(node.fill || (node.backgroundColor ? node.backgroundColor : P.surface));
    const r    = node.cornerRadius || 0;
    const sw   = node.strokeWidth  || 0;
    const sc2  = sc(node.strokeColor || 'transparent');
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}"
      fill="${fill}" stroke="${sc2}" stroke-width="${sw}" opacity="${op}"/>`;
  } else if (t === 'ellipse') {
    const fill = sc(node.fill || P.surface);
    const sw   = node.strokeWidth || 0;
    const sc2  = sc(node.strokeColor || 'transparent');
    const cx   = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
    svg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
      fill="${fill}" stroke="${sc2}" stroke-width="${sw}" opacity="${op}"/>`;
  } else if (t === 'line') {
    const pts = node.points || [{ x: 0, y: 0 }, { x: w, y: h }];
    const x1 = x + (pts[0].x || 0), y1 = y + (pts[0].y || 0);
    const x2 = x + (pts[1].x || 0), y2 = y + (pts[1].y || 0);
    const sw  = node.strokeWidth || 1;
    const sc2 = sc(node.strokeColor || P.border);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${sc2}" stroke-width="${sw}" opacity="${op}"/>`;
  } else if (t === 'text') {
    const fill   = sc(node.color || P.text);
    const fs     = node.fontSize  || 12;
    const fw     = node.fontWeight || 400;
    const align  = node.textAlign || 'left';
    const anch   = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
    const tx2    = align === 'center' ? x + w / 2 : align === 'right' ? x + w : x;
    const lh     = fs * 1.3;
    const lines  = String(node.content || '').split('\n');
    lines.forEach((ln, i) => {
      svg += `<text x="${tx2}" y="${y + fs + i * lh}" font-size="${fs}"
        font-weight="${fw}" fill="${fill}" text-anchor="${anch}"
        font-family="Inter,SF Pro Display,-apple-system,sans-serif" opacity="${op}">${
          ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        }</text>`;
    });
  }

  for (const ch of (node.children || [])) {
    svg += rn(ch, x, y, depth + 1, maxD);
  }
  return svg;
}

function screenSVG(screen, thumbW, thumbH, maxD = 5) {
  const SW = screen.width  || 390;
  const SH = screen.height || 844;
  const bg = sc(screen.backgroundColor || P.bg);
  let inner = '';
  for (const ch of (screen.children || [])) {
    inner += rn(ch, 0, 0, 0, maxD);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${SW} ${SH}" width="${thumbW}" height="${thumbH}"
    style="border-radius:20px;display:block">
    <rect width="${SW}" height="${SH}" fill="${bg}" rx="12"/>
    ${inner}
  </svg>`;
}

function post(hostname, urlPath, headers, body) {
  return new Promise((res, rej) => {
    const buf = Buffer.from(body);
    const r = https.request({ hostname, path: urlPath, method: 'POST',
      headers: { ...headers, 'Content-Length': buf.length } }, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    });
    r.on('error', rej);
    r.write(buf);
    r.end();
  });
}

function httpGet(hostname, urlPath, headers = {}) {
  return new Promise((res, rej) => {
    https.get({ hostname, path: urlPath, headers }, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    }).on('error', rej);
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

function zenBinPut(slug, title, html, subdomain) {
  const body = JSON.stringify({ title, html });
  return post('zenbin.org', `/v1/pages/${slug}`, {
    'Content-Type': 'application/json',
    ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
  }, body);
}

function buildHeroHTML() {
  const encoded = Buffer.from(penJson).toString('base64');
  const screens = penData.screens || [];

  const thumbsSVG = screens.map((s, i) =>
    `<div class="thumb-wrap" title="${SCREEN_NAMES[i] || s.name}">
      ${screenSVG(s, 220, 476, 5)}
      <div class="thumb-label">${SCREEN_NAMES[i] || s.name}</div>
    </div>`
  ).join('\n');

  const tokens = `/* DOSE Design Tokens — Light Theme */
:root {
  --dose-bg:           ${P.bg};
  --dose-surface:      ${P.surface};
  --dose-surface-alt:  ${P.surfaceAlt};
  --dose-text:         ${P.text};
  --dose-text-sub:     ${P.textSub};
  --dose-text-faint:   ${P.textFaint};
  --dose-accent:       ${P.accent};
  --dose-accent-light: ${P.accentLight};
  --dose-accent-dark:  ${P.accentDark};
  --dose-warm:         ${P.warm};
  --dose-warm-light:   ${P.warmLight};
  --dose-border:       ${P.border};
}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — 5-screen light mobile design with orbital diagnostic UI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.text};font-family:'Inter','SF Pro Display',-apple-system,sans-serif;min-height:100vh;line-height:1.5}
  a{color:inherit;text-decoration:none}

  nav{padding:16px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}ee;backdrop-filter:blur(20px);z-index:100}
  .logo{font-size:11px;font-weight:900;letter-spacing:5px;color:${P.text}}
  .logo span{color:${P.accent}}
  .nav-tag{font-size:9px;color:${P.textFaint};letter-spacing:1.5px;font-weight:700;border:1px solid ${P.border};padding:4px 12px;border-radius:4px}

  .hero{padding:80px 40px 56px;max-width:1100px;margin:0 auto}
  .eyebrow{font-size:9px;letter-spacing:3.5px;color:${P.accent};margin-bottom:24px;font-weight:700;font-family:'Courier New',monospace}
  h1{font-size:clamp(60px,12vw,120px);font-weight:900;letter-spacing:-4px;line-height:0.88;margin-bottom:28px}
  h1 em{color:${P.accent};font-style:normal}
  .tagline{font-size:18px;color:${P.textSub};max-width:520px;line-height:1.7;margin-bottom:44px}

  .meta-strip{display:flex;gap:48px;margin-bottom:52px;flex-wrap:wrap;padding-bottom:40px;border-bottom:1px solid ${P.border}}
  .meta-item .label{font-size:8px;color:${P.textFaint};letter-spacing:2px;margin-bottom:6px;font-weight:700;font-family:'Courier New',monospace}
  .meta-item .val{color:${P.text};font-size:13px;font-weight:700}
  .meta-item .val em{color:${P.accent};font-style:normal}

  .actions{display:flex;gap:10px;margin-bottom:80px;flex-wrap:wrap}
  .btn{padding:11px 24px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;border:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:1px;transition:opacity .15s;text-transform:uppercase}
  .btn:hover{opacity:.85}
  .btn-p{background:${P.accent};color:#fff}
  .btn-s{background:transparent;color:${P.text};border:1px solid ${P.border}}
  .btn-x{background:${P.text};color:#fff}
  .btn-g{background:${P.surface};color:${P.textSub};border:1px solid ${P.border}}

  section{padding:56px 40px;max-width:1100px;margin:0 auto}
  section+section{border-top:1px solid ${P.border}}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.textFaint};font-weight:700;margin-bottom:24px;font-family:'Courier New',monospace}

  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:20px;-webkit-overflow-scrolling:touch}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-thumb{background:${P.border}}
  .thumb-wrap{flex:0 0 220px;text-align:center}
  .thumb-wrap svg{box-shadow:0 8px 32px rgba(0,0,0,.08);border:1px solid ${P.border}}
  .thumb-label{font-size:9px;color:${P.textFaint};margin-top:10px;letter-spacing:1.5px;font-weight:700;text-transform:uppercase}

  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px}
  @media(max-width:700px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
  .swatch{width:48px;height:48px;border-radius:8px;border:1px solid ${P.border};display:flex;align-items:flex-end;padding:4px}
  .swatch span{font-size:7px;color:${P.textFaint};font-family:monospace;overflow:hidden}
  .principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px}
  @media(max-width:600px){.principles-grid{grid-template-columns:1fr}}
  .principle{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:20px}
  .principle h4{font-size:11px;font-weight:800;letter-spacing:1.5px;margin-bottom:8px;color:${P.text}}
  .principle p{font-size:12px;color:${P.textSub};line-height:1.6}

  .tokens-pre{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:24px;font-family:'Courier New',monospace;font-size:11px;line-height:1.75;color:${P.textSub};overflow-x:auto;white-space:pre;margin-top:16px}
  .copy-btn{margin-top:14px;background:${P.surface};border:1px solid ${P.border};color:${P.text};padding:8px 20px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;letter-spacing:1.5px;font-family:inherit;transition:border-color .15s,color .15s;text-transform:uppercase}
  .copy-btn:hover{border-color:${P.accent};color:${P.accent}}

  .prompt-text{font-size:17px;font-style:italic;color:${P.textSub};max-width:720px;line-height:1.8;border-left:3px solid ${P.accent};padding-left:24px;margin-top:16px}

  footer{padding:28px 40px;border-top:1px solid ${P.border};display:flex;justify-content:space-between;font-size:10px;color:${P.textFaint};letter-spacing:1px;flex-wrap:wrap;gap:10px}

  #toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:${P.accent};color:#fff;padding:10px 24px;border-radius:24px;font-size:11px;font-weight:800;letter-spacing:1px;opacity:0;transition:all .25s;pointer-events:none;z-index:999}
  #toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

  /* Orbital showcase */
  .orbital-demo{position:relative;width:280px;height:280px;flex:0 0 280px}
  .orbital-demo svg{width:100%;height:100%}
  .inspiration-card{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:20px;margin-top:16px}
  .inspiration-card h4{font-size:10px;letter-spacing:2px;font-weight:800;color:${P.accent};margin-bottom:8px}
  .inspiration-card p{font-size:12px;color:${P.textSub};line-height:1.6}
</style>
</head>
<body>

<nav>
  <div class="logo">RAM<span>·</span>DESIGN</div>
  <div style="display:flex;gap:12px;align-items:center">
    <span class="nav-tag">LIGHT THEME</span>
    <span class="nav-tag">${DATE_STR}</span>
    <a href="https://ram.zenbin.org/gallery" style="font-size:10px;color:${P.textFaint};font-weight:700;letter-spacing:1px">← GALLERY</a>
  </div>
</nav>

<div class="hero">
  <div class="eyebrow">RAM DESIGN STUDIO · HEARTBEAT RUN · ${DATE_STR.toUpperCase()}</div>
  <h1><em>DOSE</em><br>Precision<br>Skincare OS</h1>
  <p class="tagline">${TAGLINE}. An AI-powered formulation tool that reads your biology — orbital diagnostic UI, clinical-white precision, built for the science-first skincare generation.</p>

  <div class="meta-strip">
    <div class="meta-item"><div class="label">ARCHETYPE</div><div class="val"><em>Health-Beauty Tech</em></div></div>
    <div class="meta-item"><div class="label">THEME</div><div class="val">Light · Off-White Pearl</div></div>
    <div class="meta-item"><div class="label">SCREENS</div><div class="val"><em>5</em> · Analyze / Formula / Routine / Lab / Progress</div></div>
    <div class="meta-item"><div class="label">ACCENT</div><div class="val"><em>${P.accent}</em> Clinical Teal</div></div>
    <div class="meta-item"><div class="label">INSPIRED BY</div><div class="val">Overlay · VAST SOTD · Isa de Burgh</div></div>
  </div>

  <div class="actions">
    <button class="btn btn-p" onclick="openViewer()">◎ Open in Pencil Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen File</button>
    <a class="btn btn-x" href="https://ram.zenbin.org/${SLUG}-mock">⚡ Interactive Mock</a>
    <a class="btn btn-g" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</div>

<section>
  <div class="section-label">SCREENS — SCROLL →</div>
  <div class="thumbs">${thumbsSVG}</div>
</section>

<section>
  <div class="section-label">DESIGN LANGUAGE</div>
  <div class="brand-grid">
    <div>
      <h3 style="font-size:13px;font-weight:800;margin-bottom:16px">Color System</h3>
      <div class="swatches">
        ${Object.entries({bg:P.bg,surface:P.surface,surfaceAlt:P.surfaceAlt,accent:P.accent,accentLight:P.accentLight,accentDark:P.accentDark,text:P.text,textSub:P.textSub,warm:P.warm,warmLight:P.warmLight,border:P.border}).map(([k,v])=>
          `<div class="swatch" style="background:${v}" title="${k}: ${v}"><span>${v}</span></div>`
        ).join('')}
      </div>
    </div>
    <div>
      <h3 style="font-size:13px;font-weight:800;margin-bottom:16px">Inspiration</h3>
      <div class="inspiration-card">
        <h4>OVERLAY — LAPA.NINJA</h4>
        <p>"Beauty is Automated" — ultra-clean white background with radial/orbital diagnostic labels floating around a central face image. Clinical precision applied to cosmetics.</p>
      </div>
      <div class="inspiration-card" style="margin-top:10px">
        <h4>VAST — AWWWARDS SOTD APR 1 2026</h4>
        <p>2-color editorial minimalism: deep charcoal + blazing orange #FF5623. Huge display type, near-zero clutter. Imported: mono-accent on pale ground.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="section-label">DESIGN PRINCIPLES</div>
  <div class="principles-grid">
    <div class="principle">
      <h4>ORBITAL DIAGNOSTICS</h4>
      <p>Satellite labels positioned at calculated trigonometric angles around a central focal element — the skin scan or formula core. Hairline connectors, precision pill tags.</p>
    </div>
    <div class="principle">
      <h4>CLINICAL LIGHT</h4>
      <p>Off-white pearl (#F5F3EF) not bright white. The warmth signals skin, biology, luxury. Teal accent reads as precision instrument, not consumer app.</p>
    </div>
    <div class="principle">
      <h4>DATA OVER DECORATION</h4>
      <p>No gradients. No decorative icons. Every element is structural: hairlines, numbered steps, monospaced labels, dot matrices. Form follows formulation.</p>
    </div>
  </div>
</section>

<section>
  <div class="section-label">CSS DESIGN TOKENS</div>
  <pre class="tokens-pre" id="tokensBlock">${tokens.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
  <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
</section>

<section>
  <div class="section-label">DESIGN PROMPT</div>
  <p class="prompt-text">"${PROMPT}"</p>
  <button class="copy-btn" onclick="copyPrompt()" style="margin-top:20px">COPY PROMPT</button>
</section>

<footer>
  <span>DOSE — ${TAGLINE}</span>
  <span>RAM Design Studio · <a href="https://ram.zenbin.org/gallery" style="color:${P.accent}">ram.zenbin.org/gallery</a></span>
  <span>${DATE_STR}</span>
</footer>

<div id="toast"></div>

<script>
function toast(m){const t=document.getElementById('toast');t.textContent=m+'  ✓';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
const penB64='${encoded}';
function getPenBlob(){return new Blob([atob(penB64)],{type:'application/json'})}
function openViewer(){
  try{
    const u=URL.createObjectURL(getPenBlob());
    const w=window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank');
    toast('Opening viewer');
  }catch(e){window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank')}
}
function downloadPen(){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(getPenBlob());
  a.download='dose.pen';
  a.click();
  toast('Downloading dose.pen');
}
function copyTokens(){
  const pre=document.getElementById('tokensBlock');
  navigator.clipboard.writeText(pre.textContent).then(()=>toast('Tokens copied'));
}
function copyPrompt(){
  navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(()=>toast('Prompt copied'));
}
</script>
</body>
</html>`;
}

async function buildViewerHTML() {
  const resp = await httpGet('zenbin.org', '/p/pen-viewer-3');
  if (resp.status !== 200) throw new Error('Could not fetch pen-viewer-3: ' + resp.status);
  let viewerHtml = resp.body;
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

async function pushToGallery(heroUrl) {
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: heroUrl,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: penData.screens ? penData.screens.length : 5,
    source: 'heartbeat',
    theme: 'light',
    palette: {
      bg: P.bg, surface: P.surface, text: P.text,
      accent: P.accent, accent2: P.accentDark, warm: P.warm,
    },
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha
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
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));
  return newEntry;
}

async function main() {
  console.log(`\n  DOSE publish pipeline\n  ${'─'.repeat(40)}`);

  console.log('1/3  Building hero page…');
  const heroHTML = buildHeroHTML();
  const heroRes = await zenBinPut(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML, SUBDOMAIN);
  const heroUrl = `https://ram.zenbin.org/${SLUG}`;
  console.log(`     ${heroRes.status === 200 ? '✓' : '✗'} ${heroUrl}  [${heroRes.status}]`);

  console.log('2/3  Building viewer…');
  const viewerHTML = await buildViewerHTML();
  const viewerRes = await zenBinPut(`${SLUG}-viewer`, `${APP_NAME} Viewer`, viewerHTML, SUBDOMAIN);
  console.log(`     ${viewerRes.status === 200 ? '✓' : '✗'} https://ram.zenbin.org/${SLUG}-viewer  [${viewerRes.status}]`);

  console.log('3/3  Pushing to gallery queue…');
  const entry = await pushToGallery(heroUrl);

  console.log(`\n  ✓ Done!\n`);
  console.log(`  Hero    → ${heroUrl}`);
  console.log(`  Viewer  → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock    → https://ram.zenbin.org/${SLUG}-mock  (build next)`);
  console.log(`  Gallery → https://ram.zenbin.org/gallery`);

  fs.writeFileSync('dose-queue-entry.json', JSON.stringify(entry, null, 2));
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
