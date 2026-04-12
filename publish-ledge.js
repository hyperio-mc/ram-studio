#!/usr/bin/env node
// publish-ledge.js — Full Design Discovery pipeline for LEDGE (HB#15)
// Personal finance tracker in warm parchment/butter — anti-fintech, no blue
// Pantone 2025 Mocha Mousse #A47764 as primary brand accent
// Three-part publish: ledge-pen (raw JSON) → ledge (hero) → ledge-viewer

const fs   = require('fs');
const path = require('path');
const https = require('https');

const sub = {
  id:           'hb-ledge-' + Date.now(),
  prompt:       'LEDGE — Personal finance tracker in warm parchment/butter. Anti-fintech: no blue anywhere. Pantone 2025 Mocha Mousse #A47764 as primary accent. Butter parchment #FDF8EF base. Warm taupe shadows. Finance on cream — nobody does this. HB#15.',
  app_type:     'finance',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

// ── Palette (mirrors ledge-app.js) ────────────────────────────────────────────
const BG      = '#FDF8EF';   // butter parchment
const SURFACE = '#F5EDD9';   // cream card
const BORDER  = '#DDD0B8';   // warm border
const INK     = '#1A1410';   // warm near-black
const MID     = '#5C4E3C';   // warm medium brown
const MUTED   = '#9B8B76';   // warm medium-light
const MOCHA   = '#A47764';   // Pantone 2025 Mocha Mousse
const SIENNA  = '#7A4F35';   // deep sienna — primary
const AMBER   = '#C4833A';   // warm amber
const TERRA   = '#B86D4E';   // terracotta
const SAGE    = '#6B7A5C';   // muted sage — income
const WHITE   = '#FFFDF8';

const prdMarkdown = `
## Overview

LEDGE is a personal finance tracker built on one radical constraint: no blue. Not "less blue" — none. Every color in the system comes from the warm earth spectrum: parchment, sienna, mocha, terracotta, sage, gold.

This runs directly counter to the fintech design consensus: dark mode, anxiety-inducing red/green, clinical blues. LEDGE asks what happens when personal finance feels like a beautifully-printed ledger — warm, grounded, readable. Something you'd leave on your kitchen table.

The palette is anchored by Pantone's 2025 Color of the Year, Mocha Mousse #A47764 — a signal that warm brown neutrals are entering the design mainstream after a decade of cool gray dominance.

## The Constraint

No blue anywhere in the system. Every functional color comes from warm earth:
- **Sienna** \`#7A4F35\` — primary actions, key numbers
- **Mocha Mousse** \`#A47764\` — brand accent, progress fill
- **Amber** \`#C4833A\` — budget goals, savings targets
- **Terracotta** \`#B86D4E\` — overspend alert (not anxiety-red)
- **Sage** \`#6B7A5C\` — income (botanical, not bank-green)

## Design Influences

**Throxy.com — godly.website:** Warm cream #f8f4f0 background, clean type hierarchy on near-white. Proved that product UI can live on cream without looking unfinished.

**Vibrant Practice — siteinspire:** Warm taupe shadow system rgba(167,156,138,0.09) — shadows that retain warmth rather than going neutral gray. Applied to every card in LEDGE as #9C826418.

**PP Editorial New:** The editorial serif trend in product design — large, editorial, warm display numbers. LEDGE's balance figures use this approach.

**Pantone Mocha Mousse 2025:** Cultural signal — warm brown is entering mainstream product design vocabulary. LEDGE is built around it as the primary brand accent.

## Key Screens

1. **Mobile Home** — balance hero + quick stats + recent transaction list
2. **Mobile Transactions** — filterable transaction list with category dots
3. **Mobile Budgets** — warm progress bars, terracotta at overspend (never red)
4. **Mobile Insights** — sparkline trend + spend breakdown by category
5. **Mobile Accounts** — stacked account cards with warm tinted balance display
6. **Desktop Dashboard** — sidebar + spending chart + budget overview + tx feed
7. **Desktop Transactions** — full sortable table with filter sidebar
8. **Desktop Insights** — detailed charts, trends, category breakdown
9. **Desktop Budgets** — budget management with period selector + progress grid
`;

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- \*\*(.+?)\*\*[—:] (.+)$/gm, '<li><strong>$1</strong>: $2</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>');
}

function zenPost(slug, title, html, subdomain) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (subdomain) headers['X-Subdomain'] = subdomain;
    const req = https.request(
      { hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST', headers },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildHeroHTML(doc) {
  const screens = doc.children || [];
  const THUMB_H = 180;
  const labels = ['Home','Transactions','Budgets','Insights','Accounts','Dashboard','Transactions','Insights','Budgets'];

  // Lightweight SVG thumbnails — first 80 elements per screen only
  const thumbsHTML = screens.map((s, i) => {
    const sw = s.width;
    const sh = s.height;
    const tw = Math.round(THUMB_H * (sw / sh));
    const isMobile = sw < 500;
    const label = `${isMobile ? 'M' : 'D'} · ${labels[i] || ''}`;
    const els = (s.children || []).slice(0, 80);
    const rects = els.map(el => {
      if (!el || !el.fill || el.fill === 'transparent') return '';
      const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
      if (w === 0 || h === 0) return '';
      const r = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';
      const op = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
      return `<rect x="${el.x || 0}" y="${el.y || 0}" width="${w}" height="${h}" fill="${el.fill}"${r}${op}/>`;
    }).join('');
    const thumbSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${THUMB_H}" style="display:block;border-radius:8px;flex-shrink:0;box-shadow:0 2px 16px rgba(90,60,30,0.12)"><rect width="${sw}" height="${sh}" fill="${BG}"/>${rects}</svg>`;
    return `<div style="text-align:center;flex-shrink:0">
      ${thumbSvg}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;color:${MID};font-family:monospace">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: BG,      role: 'PARCHMENT' },
    { hex: SURFACE, role: 'SURFACE'   },
    { hex: MOCHA,   role: 'MOCHA MOUSSE' },
    { hex: SIENNA,  role: 'SIENNA'    },
    { hex: AMBER,   role: 'AMBER'     },
    { hex: TERRA,   role: 'TERRACOTTA'},
    { hex: SAGE,    role: 'SAGE'      },
    { hex: INK,     role: 'INK'       },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:60px">
      <div style="height:44px;border-radius:6px;background:${sw.hex};border:1px solid ${BORDER};margin-bottom:6px"></div>
      <div style="font-size:9px;letter-spacing:1.2px;opacity:.4;margin-bottom:2px;color:${MID}">${sw.role}</div>
      <div style="font-size:10px;font-weight:600;color:${MID};opacity:.7">${sw.hex}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* LEDGE — Personal Finance · RAM Heartbeat #15 */

  /* Parchment Surface System */
  --bg:        #FDF8EF;   /* butter parchment — page background */
  --surface:   #F5EDD9;   /* cream card surface */
  --raised:    #EDE3CC;   /* elevated card / inset / active tab */
  --border:    #DDD0B8;   /* warm border */
  --rule:      #E8DEC8;   /* subtle divider rule */

  /* Ink Scale */
  --ink:       #1A1410;   /* warm near-black — body text */
  --mid:       #5C4E3C;   /* warm medium — secondary text */
  --muted:     #9B8B76;   /* warm muted — labels, captions */
  --faint:     #C8B89E;   /* very faint — placeholder */

  /* Brand Accents — Earth Spectrum (no blue) */
  --mocha:     #A47764;   /* Pantone 2025 Mocha Mousse — brand accent */
  --sienna:    #7A4F35;   /* deep sienna — primary actions */
  --amber:     #C4833A;   /* warm amber — goals / budgets */
  --terra:     #B86D4E;   /* terracotta — overspend alert */
  --sage:      #6B7A5C;   /* muted sage — income / positive */
  --gold:      #D4A030;   /* warm gold — highlights */
  --white:     #FFFDF8;   /* warm white */

  /* Shadows — warm taupe (not neutral gray) */
  --shadow-sm:   0 1px 3px #9C826412;
  --shadow-md:   0 2px 8px #9C826418;
  --shadow-lg:   0 4px 20px #9C82641A;
  --shadow-card: 2px 3px 0 #9C826418;

  /* Typography */
  --font-serif: 'PP Editorial New', 'Georgia', serif;   /* display numbers */
  --font-sans:  'Inter', system-ui, sans-serif;          /* UI text */
  --font-mono:  ui-monospace, monospace;                 /* amounts */

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 32px; --space-6: 48px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 12px; --radius-lg: 20px;
  --radius-pill: 999px;
}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LEDGE — Personal Finance · RAM Design Studio</title>
<meta name="description" content="A personal finance tracker in warm parchment/butter. No blue anywhere. Pantone 2025 Mocha Mousse as the primary accent. 9 screens. Anti-fintech.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${BG};color:${INK};font-family:'SF Pro Text','Inter',system-ui,sans-serif;min-height:100vh}
nav{padding:20px 40px;border-bottom:1px solid ${BORDER};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.logo{font-size:14px;font-weight:700;letter-spacing:4px;color:${MUTED}}
.nav-right{display:flex;align-items:center;gap:20px}
.nav-id{font-size:11px;color:${BORDER};letter-spacing:1px;font-family:monospace}
.hb-badge{font-size:9px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:4px;background:${MOCHA}18;color:${SIENNA};border:1px solid ${MOCHA}44}
.mocha-bar{display:flex;align-items:center;gap:20px;padding:20px 40px;background:${SURFACE};border-bottom:1px solid ${BORDER}}
.mocha-dot{width:48px;height:48px;border-radius:50%;background:${MOCHA};flex-shrink:0}
.hero{padding:80px 40px 40px;max-width:960px}
.tag{font-size:10px;letter-spacing:3px;color:${MOCHA};margin-bottom:20px;font-weight:700}
h1{font-size:clamp(56px,10vw,120px);font-weight:700;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${INK}}
.h1-accent{color:${SIENNA}}
.sub{font-size:15px;color:${MID};opacity:.7;max-width:520px;line-height:1.7;margin-bottom:32px;font-weight:300}
.meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
.meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px;color:${MID}}
.meta-item strong{color:${SIENNA}}
.actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
.btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
.btn-p{background:${SIENNA};color:${WHITE}}
.btn-p:hover{opacity:.85}
.btn-s{background:transparent;color:${MID};border:1px solid ${BORDER}}
.btn-s:hover{border-color:${MOCHA}88;color:${SIENNA}}
.section-label{font-size:10px;letter-spacing:3px;color:${MOCHA};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${BORDER};font-weight:700}
.preview{padding:0 40px 80px}
.thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
.thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-thumb{background:${MOCHA}44;border-radius:2px}
.brand-section{padding:60px 40px;border-top:1px solid ${BORDER};max-width:1000px}
.brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
@media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
.swatches{display:flex;gap:8px;flex-wrap:wrap}
.type-row{padding:14px 0;border-bottom:1px solid ${BORDER}}
.tokens-block{background:${SURFACE};border:1px solid ${BORDER};border-radius:8px;padding:20px;margin-top:24px;position:relative}
.tokens-pre{font-size:11px;line-height:1.7;color:${MID};opacity:.7;white-space:pre;overflow-x:auto;font-family:monospace}
.copy-btn{position:absolute;top:12px;right:12px;background:${MOCHA}18;border:1px solid ${MOCHA}44;color:${SIENNA};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
.prd-section{padding:40px;border-top:1px solid ${BORDER};max-width:780px}
.prd-section h3{font-size:10px;letter-spacing:2px;color:${MOCHA};margin:28px 0 10px;font-weight:700}
.prd-section h3:first-child{margin-top:0}
.prd-section p,.prd-section li{font-size:14px;color:${MID};opacity:.7;line-height:1.75;max-width:680px}
.prd-section ul{padding-left:18px;margin:6px 0}.prd-section li{margin-bottom:4px}
.prd-section strong{opacity:1;color:${INK}}
.prd-section code{font-family:monospace;font-size:12px;color:${SIENNA};opacity:.9}
.insp-section{padding:40px;border-top:1px solid ${BORDER};max-width:900px}
.insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media(max-width:640px){.insp-grid{grid-template-columns:1fr}}
.insp-card{background:${SURFACE};border:1px solid ${BORDER};border-radius:8px;padding:16px 20px}
.insp-site{font-size:9px;letter-spacing:1.5px;color:${MOCHA};margin-bottom:6px;font-weight:700}
.insp-note{font-size:12px;color:${MID};line-height:1.6;opacity:.7}
footer{padding:28px 40px;border-top:1px solid ${BORDER};font-size:11px;color:${MUTED};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.toast{position:fixed;bottom:24px;right:24px;background:${SIENNA};color:${WHITE};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
.toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-right">
    <div class="hb-badge">HEARTBEAT #15 · FINANCE TRACKER</div>
    <div class="nav-id">${sub.id}</div>
  </div>
</nav>

<div class="mocha-bar">
  <div class="mocha-dot"></div>
  <div>
    <div style="font-size:10px;letter-spacing:2px;color:${MOCHA};font-weight:700;margin-bottom:4px">PANTONE 2025 COLOR OF THE YEAR</div>
    <div style="font-size:18px;font-weight:700;color:${INK}">Mocha Mousse <span style="font-family:monospace;font-size:14px;color:${MOCHA}">#A47764</span></div>
    <div style="font-size:12px;color:${MID};opacity:.5;margin-top:2px">Warm brown neutrals entering mainstream product design vocabulary</div>
  </div>
</div>

<section class="hero">
  <div class="tag">LIGHT MODE · WARM EARTH · PERSONAL FINANCE · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>LE<span class="h1-accent">DGE</span></h1>
  <p class="sub">A personal finance tracker that feels like a beautifully-printed ledger. No blue. No anxiety dashboard. Warm parchment + Pantone Mocha Mousse. The stretch: finance on butter cream.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>9 (5 MOBILE + 4 DESKTOP)</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>PARCHMENT × MOCHA × SIENNA</strong></div>
    <div class="meta-item"><span>CONCEPT</span><strong>NO BLUE ANYWHERE</strong></div>
    <div class="meta-item"><span>SIGNAL</span><strong>PANTONE MOCHA MOUSSE 2025</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/ledge-viewer">▶ Open in Viewer</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/ledge-pen/raw" download="ledge.pen">↓ Download .pen</a>
    <button class="btn btn-s" onclick="copyTokens()">⌘ Copy CSS Tokens</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/feedback?design=ledge">↺ Request Refactor</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE + 4 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px;color:${MID}">PALETTE — EARTH SPECTRUM (NO BLUE)</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:0;color:${MID}">TYPE SCALE</div>
      ${[
        {label:'DISPLAY BALANCE',  size:'clamp(40px,8vw,96px)', w:'700', sample:'$4,280',             color:INK},
        {label:'SECTION HEADER',   size:'18px',                 w:'600', sample:'This Month',         color:INK},
        {label:'TRANSACTION NAME', size:'14px',                 w:'500', sample:'Blue Bottle Coffee', color:MID},
        {label:'AMOUNT',           size:'14px',                 w:'700', sample:'−$6.50',             color:SIENNA},
        {label:'LABEL / CAPTION',  size:'11px',                 w:'400', sample:'FOOD & DRINK · TODAY', color:MUTED},
      ].map(t => `<div class="type-row">
        <div style="font-size:9px;letter-spacing:2px;opacity:.3;margin-bottom:6px;color:${MID}">${t.label} · ${t.size} / ${t.w}</div>
        <div style="font-size:${t.size};font-weight:${t.w};color:${t.color};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px;color:${MID}">DESIGN PRINCIPLES</div>
      ${[
        'No blue — the warm earth palette is complete without it. Finance doesn\'t need to feel clinical.',
        'Shadows carry warmth — all card shadows use #9C826418, warm taupe not neutral gray.',
        'Terracotta over red — overspend is #B86D4E, not #EF4444. Informed, not alarming.',
        'Sage over green — income is #6B7A5C, botanical rather than bank-green.',
      ].map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start">
        <div style="color:${MOCHA};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
        <div style="font-size:13px;color:${MID};opacity:.65;line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px;color:${MID}">BUDGET PROGRESS SPECTRUM</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
        ${[
          {label:'FOOD',      pct:72, color:'#C17B5A'},
          {label:'TRANSPORT', pct:45, color:'#8B7355'},
          {label:'HOUSING',   pct:98, color:TERRA},
          {label:'SAVINGS',   pct:60, color:SIENNA},
          {label:'HEALTH',    pct:30, color:MOCHA},
        ].map(b => `<div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:9px;letter-spacing:1px;color:${MUTED}">${b.label}</span>
            <span style="font-size:9px;font-weight:700;color:${b.pct >= 90 ? TERRA : MID}">${b.pct}%</span>
          </div>
          <div style="height:5px;border-radius:3px;background:${BORDER}">
            <div style="height:5px;border-radius:3px;width:${b.pct}%;background:${b.color};max-width:100%"></div>
          </div>
        </div>`).join('')}
      </div>
      <div style="font-size:11px;color:${MUTED};opacity:.6;line-height:1.8">
        All progress in warm earth tones<br>
        Terracotta at overspend, never red<br>
        No blue in the entire system
      </div>
    </div>
  </div>
  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g, '&lt;')}</pre>
  </div>
</section>

<section class="insp-section">
  <div class="section-label">RESEARCH SOURCES · HEARTBEAT #15</div>
  <div class="insp-grid">
    <div class="insp-card">
      <div class="insp-site">THROXY — GODLY.WEBSITE</div>
      <p class="insp-note">Warm cream #f8f4f0 base, clean type hierarchy on near-white. Proved product UI can live on cream without looking unfinished. LEDGE extends this into a 5-level parchment surface system.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">VIBRANT PRACTICE — SITEINSPIRE</div>
      <p class="insp-note">Warm taupe shadow rgba(167,156,138,0.09) — shadows that hold warmth instead of going neutral gray. Every card shadow in LEDGE uses #9C826418 to keep the warm tone consistent through depth.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">PANTONE MOCHA MOUSSE 2025</div>
      <p class="insp-note">#A47764 as Color of the Year — warm brown neutrals entering product design after a decade of cool grays. LEDGE is built around it: Mocha Mousse is the brand accent and budget progress fill.</p>
    </div>
  </div>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${mdToHtml(prdMarkdown)}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #15 · Personal Finance · ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
  <a href="https://ram.zenbin.org/" style="color:inherit;text-decoration:none">ram.zenbin.org</a>
</footer>

<script>
const CSS_TOKENS=${JSON.stringify(cssTokens)};
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function copyTokens(){
  navigator.clipboard.writeText(CSS_TOKENS).then(()=>toast('CSS tokens copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=CSS_TOKENS;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('CSS tokens copied ✓');
  });
}
<\/script>
</body>
</html>`;
}

function buildViewerHTML(penJsonStr) {
  // Embed minified JSON (not base64) to stay under 512KB limit
  const minified = JSON.stringify(JSON.parse(penJsonStr));
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let html = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(minified)};<\/script>`;
  return html.replace('<script>', injection + '\n<script>');
}

async function main() {
  console.log('📒  LEDGE — Full Design Discovery Pipeline (HB#15)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const penPath = path.join(__dirname, 'ledge.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ ledge.pen not found — run: node ledge-app.js');
    process.exit(1);
  }
  const penJsonStr = fs.readFileSync(penPath, 'utf8');
  const doc = JSON.parse(penJsonStr);
  const screens = doc.children || [];
  console.log(`✓ Loaded ledge.pen — ${screens.length} screens`);
  screens.forEach(s => console.log(`  ${s.id.padEnd(16)} ${s.width}×${s.height}  ${(s.children || []).length} els`));

  // ── 1. Publish raw pen JSON ──────────────────────────────────────────────────
  console.log('\n📤 Publishing pen JSON → ram.zenbin.org/ledge-pen...');
  const minifiedPen = JSON.stringify(JSON.parse(penJsonStr));
  const penRes = await zenPost('ledge-pen', 'LEDGE .pen file', minifiedPen, 'ram');
  console.log(`  HTTP ${penRes.status} — ${penRes.status === 200 || penRes.status === 201 ? '✅ Published' : '❌ Failed'} (${(Buffer.byteLength(minifiedPen) / 1024).toFixed(1)}kb)`);
  if (penRes.status !== 200 && penRes.status !== 201) console.log('  Error:', penRes.body.slice(0, 300));

  // ── 2. Publish hero page ─────────────────────────────────────────────────────
  console.log('\n📤 Publishing hero → ram.zenbin.org/ledge...');
  const heroHtml = buildHeroHTML(doc);
  const heroBodyKb = Buffer.byteLength(JSON.stringify({ title: 'LEDGE', html: heroHtml })) / 1024;
  console.log(`  Hero size: ${heroBodyKb.toFixed(1)}kb`);
  const heroRes = await zenPost('ledge', 'LEDGE — Personal Finance · RAM Design Studio', heroHtml, 'ram');
  console.log(`  HTTP ${heroRes.status} — ${heroRes.status === 200 || heroRes.status === 201 ? '✅ Published' : '❌ Failed'}`);
  if (heroRes.status !== 200 && heroRes.status !== 201) console.log('  Error:', heroRes.body.slice(0, 300));

  // ── 3. Publish viewer ────────────────────────────────────────────────────────
  console.log('\n📤 Publishing viewer → ram.zenbin.org/ledge-viewer...');
  const viewerHtml = buildViewerHTML(penJsonStr);
  const viewerBodyKb = Buffer.byteLength(JSON.stringify({ title: 'LEDGE Viewer', html: viewerHtml })) / 1024;
  console.log(`  Viewer size: ${viewerBodyKb.toFixed(1)}kb`);
  const viewerRes = await zenPost('ledge-viewer', 'LEDGE Viewer', viewerHtml, 'ram');
  console.log(`  HTTP ${viewerRes.status} — ${viewerRes.status === 200 || viewerRes.status === 201 ? '✅ Published' : '❌ Failed'}`);
  if (viewerRes.status !== 200 && viewerRes.status !== 201) console.log('  Error:', viewerRes.body.slice(0, 300));

  console.log('\n✅ LEDGE live:');
  console.log('   Hero:   https://ram.zenbin.org/ledge');
  console.log('   Viewer: https://ram.zenbin.org/ledge-viewer');
  console.log('   Pen:    https://ram.zenbin.org/ledge-pen/raw');

  // ── 4. Gallery registry ──────────────────────────────────────────────────────
  const CONFIG_PATH = path.join(__dirname, 'community-config.json');
  let config = {};
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch {}
  const TOKEN = process.env.GITHUB_TOKEN || config.GITHUB_TOKEN || '';
  const REPO  = process.env.GITHUB_REPO  || config.GITHUB_REPO  || '';
  if (TOKEN && REPO) {
    console.log('\n📋 Updating gallery registry...');
    try {
      const getRes = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'api.github.com',
          path: `/repos/${REPO}/contents/queue.json`,
          headers: {
            'Authorization': `token ${TOKEN}`,
            'User-Agent': 'ram-studio/1.0',
            'Accept': 'application/vnd.github.v3+json',
          }
        }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
        req.on('error', reject); req.end();
      });
      if (getRes.status === 200) {
        const fd = JSON.parse(getRes.body);
        const queue = JSON.parse(Buffer.from(fd.content, 'base64').toString('utf8'));
        const entry = {
          id: sub.id,
          prompt: sub.prompt,
          app_type: 'finance',
          credit: 'RAM Studio',
          submitted_at: sub.submitted_at,
          status: 'done',
          app_name: 'LEDGE',
          archetype: 'finance',
          design_url: 'https://ram.zenbin.org/ledge',
          viewer_url: 'https://ram.zenbin.org/ledge-viewer',
          published_at: new Date().toISOString(),
        };
        const existing = (queue.submissions || []).findIndex(s => s.id === sub.id);
        if (existing >= 0) queue.submissions[existing] = entry;
        else (queue.submissions = queue.submissions || []).push(entry);
        queue.updated_at = new Date().toISOString();
        const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
        const putBody = JSON.stringify({
          message: 'add: LEDGE — personal finance in warm parchment, Pantone Mocha Mousse (HB#15)',
          content,
          sha: fd.sha,
        });
        const putRes = await new Promise((resolve, reject) => {
          const req = https.request({
            hostname: 'api.github.com',
            path: `/repos/${REPO}/contents/queue.json`,
            method: 'PUT',
            headers: {
              'Authorization': `token ${TOKEN}`,
              'User-Agent': 'ram-studio/1.0',
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(putBody),
              'Accept': 'application/vnd.github.v3+json',
            }
          }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
          req.on('error', reject); req.write(putBody); req.end();
        });
        console.log(`  Gallery registry: HTTP ${putRes.status} ${putRes.status === 200 ? '✅' : '❌'}`);
      }
    } catch (err) { console.warn(`  ⚠ Gallery skipped: ${err.message}`); }
  } else {
    console.log('\n  (Gallery registry skipped — no GitHub token)');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Done.');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
