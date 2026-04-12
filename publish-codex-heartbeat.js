'use strict';
// publish-codex-heartbeat.js
// Publish CODEX heartbeat design through the full pipeline:
// 1. Build hero page (thumbnails + brand spec + PRD + CSS tokens)
// 2. Build viewer with EMBEDDED_PEN injection
// 3. Publish hero → ram.zenbin.org/codex-heartbeat
// 4. Publish viewer → ram.zenbin.org/codex-heartbeat-viewer
// 5. Add to GitHub gallery queue

const fs    = require('fs');
const https = require('https');
const path  = require('path');

const config      = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function req(opts, body) {
  return new Promise(resolve => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', e => resolve({ status: 0, error: e.message }));
    if (body) r.write(body);
    r.end();
  });
}

function publishPage(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return req({
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── SVG renderer (adapted from process-zenbin-queue.js) ───────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';

  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids) return bg;
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}/>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.7));
    return `<rect x="${x}" y="${y + (h - fh) / 2}" width="${w}" height="${fh}" fill="${fill}"${oAttr} rx="1"/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0;box-shadow:0 4px 20px rgba(0,0,0,.5)"><rect width="${sw}" height="${sh}" fill="${screen.fill||'#111'}"/>${kids}</svg>`;
}

function lightenHex(hex, amt) {
  const n = parseInt((hex || '#111111').replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ── Build hero HTML ────────────────────────────────────────────────────────────
function buildHeroHTML(penJson, heroSlug, viewerSlug) {
  const doc = penJson;
  const screens = doc.children || [];

  // Palette
  const BG      = '#0C0C12';
  const FG      = '#E4E4F0';
  const ACCENT  = '#7060F0';   // violet
  const ACCENT2 = '#E8A838';   // amber
  const surface = lightenHex(BG, 14);
  const border  = lightenHex(BG, 30);
  const muted   = lightenHex(BG, 80);

  // Screen thumbnails
  const THUMB_H = 180;
  const screenNames = ['INDEX', 'BROWSE', 'DOC VIEW', 'SEARCH', 'TEAM'];
  const thumbsHTML = screens.map((s, i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const label = `M · ${screenNames[i] || 'SCREEN ' + (i+1)}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: BG,            role: 'BACKGROUND' },
    { hex: surface,       role: 'SURFACE'    },
    { hex: FG,            role: 'FOREGROUND' },
    { hex: ACCENT,        role: 'VIOLET'     },
    { hex: ACCENT2,       role: 'AMBER'      },
    { hex: '#4A9EF0',     role: 'BLUE'       },
    { hex: '#3DD68C',     role: 'GREEN'      },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${ACCENT2}">${sw.hex}</div>
    </div>`).join('');

  // Type scale
  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '40px', weight: '900', sample: 'CODEX' },
    { label: 'HEADING',  size: '22px', weight: '700', sample: 'Team Knowledge Vault' },
    { label: 'BODY',     size: '13px', weight: '400', sample: 'Purpose-built for engineering teams. Designed for clarity and speed.' },
    { label: 'CAPTION',  size: '9px',  weight: '700', sample: 'REF: CDX-001 · API REFERENCE · UPDATED 34m AGO' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:8px">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${FG};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%">${t.sample}</div>
    </div>`).join('');

  // Spacing system
  const spacingHTML = [4, 8, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
      <div style="height:6px;border-radius:3px;background:${ACCENT};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  // Design principles
  const principlesHTML = [
    ['ARCHIVAL PRECISION', 'Every document has a REF code. Every category has an index. Information is findable, not searchable by accident.'],
    ['EDITORIAL HIERARCHY', 'Typography does the heavy lifting. ALL CAPS labels, large reference numbers, and subtle borders create the Swiss grid.'],
    ['DARK MODE FIRST', 'Engineered for long sessions. Near-black backgrounds with cool undertones reduce strain. Violet accent energizes focus.'],
    ['DATA DENSITY ≠ CLUTTER', 'Pack information tightly but breathe through spacing. Every element earns its place.'],
  ].map(([title, desc]) => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:9px;letter-spacing:1.5px;color:${ACCENT};margin-bottom:6px;font-weight:700">${title}</div>
      <div style="font-size:12px;opacity:.6;line-height:1.6">${desc}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* ── Color ── */
  --color-bg:        ${BG};
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        ${FG};
  --color-violet:    ${ACCENT};
  --color-amber:     ${ACCENT2};
  --color-blue:      #4A9EF0;
  --color-green:     #3DD68C;
  --color-red:       #F06B6B;
  --color-muted:     #4A4A72;

  /* ── Typography ── */
  --font-family:  'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 900 clamp(32px,6vw,64px) / 1 var(--font-family);
  --font-heading: 700 20px / 1.3 var(--font-family);
  --font-body:    400 13px / 1.65 var(--font-family);
  --font-caption: 700 9px / 1 var(--font-family);

  /* ── Spacing (4px base grid) ── */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 16px;
  --sp-4: 24px; --sp-5: 32px; --sp-6: 48px; --sp-7: 64px;

  /* ── Radius ── */
  --r-sm: 4px;  --r-md: 8px;  --r-lg: 12px;  --r-full: 9999px;

  /* ── Shadow ── */
  --shadow-card: 0 2px 12px rgba(0,0,0,.4);
  --shadow-glow: 0 0 40px rgba(112,96,240,.12);
}`;

  const encoded = Buffer.from(JSON.stringify(penJson)).toString('base64');
  const shareText = encodeURIComponent('CODEX — dark mode team knowledge vault. Swiss editorial archetype meets SaaS precision. 5 screens + brand spec + CSS tokens. Built by RAM Design AI');

  const prd = `
    <h3>OVERVIEW</h3>
    <p><strong>CODEX</strong> is a private team knowledge base for engineering teams — think Linear meets Notion but designed with the archival precision of a Swiss reference system. Every document has a REF: code. Every category is indexed. Documentation becomes a living, searchable vault that engineers actually use.</p>

    <h3>TARGET USERS</h3>
    <ul>
      <li><strong>Engineering teams</strong> of 5–50 at early-stage and growth startups</li>
      <li>Platform/infrastructure engineers managing runbooks and ADRs</li>
      <li>Tech leads maintaining API references and architecture decisions</li>
      <li>New engineers onboarding who need a single source of truth</li>
    </ul>

    <h3>CORE FEATURES</h3>
    <ul>
      <li><strong>REF taxonomy system</strong> — Every doc gets a CDX-XXX identifier for instant citation</li>
      <li><strong>Category Index</strong> — Dashboard view of all knowledge domains with health scores and doc counts</li>
      <li><strong>Doc Browser</strong> — Filtered card grid with tag taxonomy and recent/popular sorting</li>
      <li><strong>Doc Viewer</strong> — Editorial document view with inline code blocks and table of contents</li>
      <li><strong>Smart Search</strong> — Full-text search with taxonomy filters and amber-highlighted keyword matches</li>
      <li><strong>Team Map</strong> — Contributor health scores, activity charts, and expertise heatmap</li>
    </ul>

    <h3>DESIGN LANGUAGE</h3>
    <ul>
      <li><strong>Swiss archival editorial</strong> — Inspired by Silencio.es's reference taxonomy system (godly.website)</li>
      <li><strong>Dark SaaS precision</strong> — Deep near-black (#0C0C12) with cool undertones, influenced by Linear.app (darkmodedesign.com)</li>
      <li><strong>Dual accent system</strong> — Violet (#7060F0) for UI states and interaction; Amber (#E8A838) for archival REF codes and keyword matches</li>
      <li><strong>ALL CAPS label system</strong> — All metadata labels are uppercase with wide tracking; creates authoritative, archival feel</li>
      <li><strong>Monospace typography</strong> — Reinforces developer-first positioning; every element feels like it belongs in a terminal</li>
    </ul>

    <h3>SCREEN ARCHITECTURE</h3>
    <ul>
      <li><strong>INDEX</strong> — Category dashboard: 6 knowledge domains each with REF codes, doc counts, update timestamps, health progress bars</li>
      <li><strong>BROWSE</strong> — Doc card grid with hot/trending indicator, tag pills, author avatars, ref codes, recency labels</li>
      <li><strong>DOC VIEW</strong> — Full document: breadcrumb, table of contents with active state, endpoint cards (GET/POST/DELETE), syntax-highlighted code block with copy button</li>
      <li><strong>SEARCH</strong> — Accent-bordered search input, taxonomy filter chips, result rows with amber keyword match highlights, action row per result</li>
      <li><strong>TEAM</strong> — Vault health score (94/100), 14-day activity bar chart, contributor rows with avatar, role tags, streak badges, expertise health bars</li>
    </ul>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CODEX — Team Knowledge Vault · RAM Design Studio</title>
<meta name="description" content="CODEX — dark mode developer knowledge vault. Swiss editorial archetype meets SaaS precision. 5 screens, brand spec, CSS tokens. Designed by RAM Design AI.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${BG};color:${FG};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh;-webkit-font-smoothing:antialiased}
  nav{padding:18px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${BG}e8;backdrop-filter:blur(12px);z-index:100}
  .logo{font-size:13px;font-weight:900;letter-spacing:5px;color:${ACCENT}}
  .nav-right{display:flex;gap:10px;align-items:center}
  .nav-id{font-size:10px;color:${ACCENT2};letter-spacing:1.5px;opacity:.7}
  .hero{padding:72px 40px 32px;max-width:920px}
  .tag{font-size:9px;letter-spacing:3px;color:${ACCENT2};margin-bottom:16px;opacity:.9}
  h1{font-size:clamp(56px,9vw,96px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:16px}
  .sub{font-size:15px;opacity:.5;max-width:480px;line-height:1.65;margin-bottom:28px}
  .meta{display:flex;gap:28px;margin-bottom:36px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1.5px;margin-bottom:3px}
  .meta-item strong{color:${ACCENT2}}
  .actions{display:flex;gap:10px;margin-bottom:56px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;transition:all .15s}
  .btn-p{background:${ACCENT};color:${BG}}
  .btn-p:hover{opacity:.88}
  .btn-s{background:transparent;color:${FG};border:1px solid ${border}}
  .btn-s:hover{border-color:${ACCENT}66}
  .btn-a{background:${ACCENT2}18;color:${ACCENT2};border:1px solid ${ACCENT2}33}
  .btn-a:hover{background:${ACCENT2}28}
  .preview{padding:0 40px 60px}
  .section-label{font-size:9px;letter-spacing:3px;color:${ACCENT};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:18px;overflow-x:auto;padding-bottom:10px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-thumb{background:${ACCENT}33;border-radius:2px}
  .brand-section{padding:56px 40px;border-top:1px solid ${border};max-width:920px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10.5px;line-height:1.7;color:${FG};opacity:.65;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:10px;right:10px;background:${ACCENT}22;border:1px solid ${ACCENT}44;color:${ACCENT};font-family:inherit;font-size:9px;letter-spacing:1px;padding:4px 10px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${ACCENT}33}
  .prompt-section{padding:36px 40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${ACCENT};margin-bottom:10px}
  .p-text{font-size:17px;opacity:.55;font-style:italic;max-width:600px;line-height:1.65;margin-bottom:16px}
  .prd-section{padding:36px 40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${ACCENT};margin:24px 0 8px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;opacity:.6;line-height:1.75;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${FG}}
  footer{padding:24px 40px;border-top:1px solid ${border};font-size:10px;opacity:.28;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
  .toast{position:fixed;bottom:24px;right:24px;background:${ACCENT};color:${BG};font-family:inherit;font-size:10px;font-weight:700;letter-spacing:1px;padding:10px 18px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>

<nav>
  <div class="logo">CODEX</div>
  <div class="nav-right">
    <span class="nav-id">RAM DESIGN STUDIO · HEARTBEAT</span>
  </div>
</nav>

<div class="hero">
  <div class="tag">▸ DESIGN HEARTBEAT · MARCH 2026 · SWISS ARCHIVAL × DARK SAAS</div>
  <h1>CODEX</h1>
  <p class="sub">Team knowledge vault for engineering teams. Archival precision meets dark SaaS clarity. Every document indexed. Every decision traceable.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>DEV TOOL · KNOWLEDGE BASE</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#0C0C12 · #7060F0 · #E8A838</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>SILENCIO.ES · LINEAR.APP</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${viewerSlug}" target="_blank">↗ Open in Viewer</a>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⎘ Copy Prompt</button>
    <button class="btn btn-a" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</div>

<div class="preview">
  <div class="section-label">SCREENS — INDEX · BROWSE · DOC VIEW · SEARCH · TEAM</div>
  <div class="thumbs">${thumbsHTML}</div>
</div>

<div class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:32px;font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:12px">SPACING SYSTEM</div>
      ${spacingHTML}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:4px">TYPE SCALE</div>
      ${typeScaleHTML}
      <div style="margin-top:28px;font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:4px">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>
  </div>

  <div style="margin-top:40px">
    <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:0">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre">${cssTokens}</pre>
    </div>
  </div>
</div>

<div class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"Design a dark mode archival/editorial developer knowledge hub for engineering teams. Inspired by Silencio.es's reference taxonomy system (godly.website) and Linear.app's dark SaaS precision (darkmodedesign.com). 5 mobile screens: category index with REF codes, doc browse grid, document viewer with code blocks, taxonomic search, and team contributor map. Palette: near-black #0C0C12, violet accent #7060F0, amber phosphor #E8A838."</p>
</div>

<div class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${prd}
</div>

<footer>
  <span>RAM Design Studio · Production-ready in one prompt · 2026</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none">ram.zenbin.org/gallery</a>
</footer>

<div class="toast" id="toast"></div>

<script>
const D='${encoded}';
const PROMPT="Design a dark mode archival/editorial developer knowledge hub for engineering teams. Inspired by Silencio.es's reference taxonomy system (godly.website) and Linear.app's dark SaaS precision (darkmodedesign.com). 5 mobile screens: category index with REF codes, doc browse grid, document viewer with code blocks, taxonomic search, and team contributor map.";
const CSS_TOKENS=${JSON.stringify(cssTokens)};

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2400);
}
function downloadPen(){
  try{
    const jsonStr=atob(D);
    const blob=new Blob([jsonStr],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download='codex.pen';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(a.href);
    toast('Downloading codex.pen…');
  }catch(e){alert('Download failed: '+e.message);}
}
function copyPrompt(){
  navigator.clipboard.writeText(PROMPT)
    .then(()=>toast('Prompt copied ✓'))
    .catch(()=>{
      const ta=document.createElement('textarea');
      ta.value=PROMPT; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      toast('Prompt copied ✓');
    });
}
function copyTokens(){
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(()=>toast('CSS tokens copied ✓'))
    .catch(()=>{
      const ta=document.createElement('textarea');
      ta.value=CSS_TOKENS; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      toast('Tokens copied ✓');
    });
}
function shareOnX(){
  const text=encodeURIComponent('CODEX — dark mode team knowledge vault for engineering teams. Swiss archival editorial × SaaS precision. 5 screens + brand spec + CSS tokens. Built by RAM Design AI');
  const url=encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text='+text+'&url='+url,'_blank');
}
</script>
</body>
</html>`;
}

// ── Build viewer HTML with embedded pen ────────────────────────────────────────
function buildViewerHTML(penJson, heroSlug) {
  const penStr = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};<\/script>`;

  // Fetch the base viewer from ZenBin (pen-viewer-3) — we'll build inline instead
  const BG = '#0C0C12';
  const FG = '#E4E4F0';
  const ACCENT = '#7060F0';
  const ACCENT2 = '#E8A838';

  const sw = penJson.width || 2430;
  const sh = penJson.height || 844;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CODEX — Viewer · RAM Design Studio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${BG};color:${FG};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh;display:flex;flex-direction:column}
  header{padding:14px 28px;border-bottom:1px solid #242438;display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:900;letter-spacing:4px;color:${ACCENT}}
  .header-right{display:flex;gap:8px;align-items:center}
  .btn{padding:8px 16px;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:5px;letter-spacing:.5px;transition:all .15s}
  .btn-p{background:${ACCENT};color:${BG}}
  .btn-s{background:transparent;color:${FG};border:1px solid #242438}
  .btn-s:hover{border-color:${ACCENT}66}
  .viewer-wrap{flex:1;overflow:auto;padding:24px}
  canvas{display:block;border-radius:10px;box-shadow:0 4px 32px rgba(0,0,0,.6)}
  .footer-bar{padding:10px 28px;border-top:1px solid #242438;font-size:9px;opacity:.3;display:flex;gap:20px}
</style>
</head>
<body>
${injection}
<header>
  <div class="logo">CODEX</div>
  <div class="header-right">
    <a class="btn btn-s" href="https://ram.zenbin.org/${heroSlug}">← Hero Page</a>
    <button class="btn btn-p" onclick="downloadPen()">↓ Download .pen</button>
  </div>
</header>
<div class="viewer-wrap">
  <canvas id="canvas"></canvas>
</div>
<div class="footer-bar">
  <span>CODEX · RAM Design Studio · Pencil v2.8</span>
  <span id="info">5 screens · 390×844</span>
</div>

<script>
(function(){
  const raw = window.EMBEDDED_PEN;
  if (!raw) { document.getElementById('canvas').outerHTML='<p style="padding:40px;opacity:.5">No pen data.</p>'; return; }
  let doc;
  try { doc = JSON.parse(raw); } catch(e) { return; }

  const SCALE = window.devicePixelRatio || 1;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const W = doc.width || 2430;
  const H = doc.height || 844;
  const maxW = Math.min(W, window.innerWidth - 48);
  const ratio = maxW / W;
  const DW = Math.round(W * ratio);
  const DH = Math.round(H * ratio);

  canvas.width = DW * SCALE;
  canvas.height = DH * SCALE;
  canvas.style.width = DW + 'px';
  canvas.style.height = DH + 'px';
  ctx.scale(ratio * SCALE, ratio * SCALE);

  function hexToRgba(hex) {
    if (!hex || hex === 'none') return null;
    const h = hex.replace('#','');
    if (h.length === 8) {
      return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),parseInt(h.slice(6,8),16)/255];
    }
    if (h.length === 6) {
      return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),1];
    }
    return null;
  }

  function setFill(ctx, hex, opacity) {
    const c = hexToRgba(hex);
    if (!c) { ctx.fillStyle = 'transparent'; return; }
    const a = (opacity !== undefined ? opacity : 1) * c[3];
    ctx.fillStyle = 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';
  }
  function setStroke(ctx, stroke, opacity) {
    if (!stroke) return;
    const c = hexToRgba(stroke.fill);
    if (!c) return;
    const a = (opacity !== undefined ? opacity : 1) * c[3];
    ctx.strokeStyle = 'rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';
    ctx.lineWidth = stroke.thickness || 1;
  }

  function drawNode(ctx, n, ox, oy) {
    if (!n) return;
    const x = ox + (n.x||0), y = oy + (n.y||0);
    const w = n.width||0, h = n.height||0;
    const op = n.opacity !== undefined ? n.opacity : 1;
    ctx.save();
    ctx.globalAlpha = op;

    if (n.type === 'frame') {
      if (n.fill && n.fill !== 'none') {
        setFill(ctx, n.fill, 1);
        if (n.cornerRadius) { roundRect(ctx, x, y, w, h, n.cornerRadius); ctx.fill(); }
        else { ctx.fillRect(x,y,w,h); }
      }
      if (n.stroke) {
        setStroke(ctx, n.stroke, 1);
        if (n.cornerRadius) { roundRect(ctx, x, y, w, h, n.cornerRadius); ctx.stroke(); }
        else { ctx.strokeRect(x,y,w,h); }
      }
      if (n.clip) {
        ctx.save();
        if (n.cornerRadius) { roundRect(ctx,x,y,w,h,n.cornerRadius); ctx.clip(); }
        else { ctx.rect(x,y,w,h); ctx.clip(); }
        (n.children||[]).forEach(c => drawNode(ctx,c,x,y));
        ctx.restore();
      } else {
        (n.children||[]).forEach(c => drawNode(ctx,c,x,y));
      }
    } else if (n.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, Math.PI*2);
      if (n.fill && n.fill !== 'none') { setFill(ctx, n.fill, 1); ctx.fill(); }
      if (n.stroke) { setStroke(ctx, n.stroke, 1); ctx.stroke(); }
    } else if (n.type === 'text') {
      const fs = n.fontSize || 13;
      const fw = n.fontWeight || '400';
      ctx.font = fw+' '+fs+'px "SF Mono",monospace';
      setFill(ctx, n.fill || '${FG}', 1);
      ctx.textBaseline = 'top';
      const lines = (n.content||'').split('\\n');
      const lh = n.lineHeight ? n.lineHeight * fs : fs * 1.3;
      const ta = n.textAlign || 'left';
      lines.forEach((line, li) => {
        let tx = x;
        if (ta === 'center') { ctx.textAlign = 'center'; tx = x + w/2; }
        else if (ta === 'right') { ctx.textAlign = 'right'; tx = x + w; }
        else { ctx.textAlign = 'left'; }
        ctx.fillText(line, tx, y + li*lh, w);
      });
    }
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
    ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
    ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
    ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
  }

  // Draw background
  ctx.fillStyle = doc.fill || '${BG}';
  ctx.fillRect(0,0,W,H);

  // Draw all screens
  (doc.children||[]).forEach(screen => drawNode(ctx, screen, 0, 0));
  document.getElementById('info').textContent = (doc.children||[]).length + ' screens · ' + W + '×' + H;
})();

function downloadPen(){
  const raw = window.EMBEDDED_PEN;
  if (!raw) return;
  const blob = new Blob([raw], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'codex.pen';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
}
<\/script>
</body>
</html>`;
}

// ── GitHub gallery queue update ────────────────────────────────────────────────
async function updateGalleryQueue(heroUrl) {
  // Get current queue
  const rawRes = await req({
    hostname: 'raw.githubusercontent.com',
    path: `/${GITHUB_REPO}/main/queue.json`,
    method: 'GET',
    headers: { 'User-Agent': 'ram-design-studio/1.0' },
  });

  let queue = { version: 1, submissions: [], updated_at: new Date().toISOString() };
  if (rawRes.status === 200) {
    try { queue = JSON.parse(rawRes.body); } catch(e) {}
  }

  // Get current SHA
  const shaRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'User-Agent': 'ram-design-studio/1.0',
      'Authorization': `token ${GITHUB_TOKEN}`,
    },
  });
  let sha = null;
  if (shaRes.status === 200) {
    try { sha = JSON.parse(shaRes.body).sha; } catch(e) {}
  }

  // Add entry
  const entry = {
    id: 'codex-heartbeat',
    app_name: 'CODEX',
    archetype: 'Developer Knowledge Vault',
    design_url: heroUrl,
    published_at: new Date().toISOString(),
    palette: { bg: '#0C0C12', accent: '#7060F0', accent2: '#E8A838', fg: '#E4E4F0' },
    screens: 5,
    source: 'heartbeat',
    prompt: 'Dark mode archival/editorial developer knowledge hub inspired by Silencio.es and Linear.app. Swiss editorial reference taxonomy with REF codes, category index, doc browser, search, team map.',
    credit: 'RAM Design AI',
    status: 'done',
  };

  queue.submissions = queue.submissions || [];
  const idx = queue.submissions.findIndex(s => s.id === entry.id);
  if (idx >= 0) queue.submissions[idx] = entry;
  else queue.submissions.unshift(entry);
  queue.updated_at = new Date().toISOString();

  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const updateBody = JSON.stringify({
    message: `add: codex heartbeat design to gallery`,
    content,
    ...(sha ? { sha } : {}),
  });

  const updateRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'User-Agent': 'ram-design-studio/1.0',
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(updateBody),
    },
  }, updateBody);

  return updateRes;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎨 CODEX — Publishing heartbeat design');
  console.log('══════════════════════════════════════');

  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'codex.pen'), 'utf8'));
  const HERO_SLUG   = 'codex-heartbeat';
  const VIEWER_SLUG = 'codex-heartbeat-viewer';

  // Build HTML
  console.log('\n[1/4] Building hero page...');
  const heroHTML = buildHeroHTML(penJson, HERO_SLUG, VIEWER_SLUG);

  console.log('[2/4] Building viewer page...');
  const viewerHTML = buildViewerHTML(penJson, HERO_SLUG);

  // Publish hero
  console.log('\n[3/4] Publishing to ram.zenbin.org...');
  for (const [slug, title, html] of [
    [HERO_SLUG,   'CODEX — Team Knowledge Vault · RAM Design Studio', heroHTML],
    [VIEWER_SLUG, 'CODEX — Viewer · RAM Design Studio',               viewerHTML],
  ]) {
    for (const trySlug of [slug, slug + '-' + Date.now().toString(36)]) {
      console.log(`  → Posting to ram.zenbin.org/${trySlug}...`);
      const r = await publishPage(trySlug, title, html);
      console.log(`    HTTP ${r.status}`);
      if (r.status === 201 || r.status === 200) {
        console.log(`  ✅ https://ram.zenbin.org/${trySlug}`);
        break;
      } else if (r.status === 409) {
        console.log(`  ↻ Slug taken, trying variant...`);
        continue;
      } else {
        console.log(`  ⚠ Unexpected status: ${r.status}`);
        console.log('  Body:', r.body?.slice(0, 200));
        break;
      }
    }
    await sleep(800);
  }

  // Save hero HTML locally
  fs.writeFileSync(path.join(__dirname, 'codex-hero.html'), heroHTML);
  console.log('\n  💾 Saved codex-hero.html locally');

  // Update gallery queue
  console.log('\n[4/4] Updating gallery queue on GitHub...');
  const qr = await updateGalleryQueue(`https://ram.zenbin.org/${HERO_SLUG}`);
  if (qr.status === 200 || qr.status === 201) {
    console.log('  ✅ Gallery queue updated');
  } else {
    console.log(`  ⚠ Gallery update returned ${qr.status}`);
  }

  console.log('\n══════════════════════════════════════');
  console.log('✅ DONE');
  console.log(`   Hero:   https://ram.zenbin.org/${HERO_SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log('══════════════════════════════════════');
}

main().catch(console.error);
