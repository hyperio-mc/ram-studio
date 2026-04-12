#!/usr/bin/env node
// publish-cork.js — Full Design Discovery pipeline for CORK (HB#16)
// Wine discovery & cellar tracker — deep plum ink on warm cream
// Palette: Stripe Sessions 2026 cream #F9F7F7 + deep plum #20033C
// Three-part publish: cork-pen (raw JSON) → cork (hero) → cork-viewer

const fs   = require('fs');
const path = require('path');
const https = require('https');

const sub = {
  id:           'hb-cork-' + Date.now(),
  prompt:       'CORK — Wine discovery & cellar tracker. Deep plum #20033C as primary ink instead of black — inspired by Stripe Sessions 2026 (godly.website) warm cream bg + plum text. Anti-dark-mode: wine apps all go dark to look premium. CORK feels like a Decanter magazine spread. 9 screens.',
  app_type:     'lifestyle',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

// ── Palette ───────────────────────────────────────────────────────────────────
const BG       = '#F9F7F7';
const SURFACE  = '#F2EEEC';
const BORDER   = '#D8CEC9';
const INK      = '#20033C';
const MID      = '#5C4A5A';
const MUTED    = '#9B8B96';
const BURGUNDY = '#7A1B3F';
const ROSÉ     = '#C4706A';
const GOLD     = '#C49A3A';
const TAWNY    = '#A05C2A';
const SAGE     = '#5C7A5C';
const WHITE    = '#FDFBFB';

const prdMarkdown = `
## Overview

CORK is a wine discovery and cellar tracker built on one key insight from research: Stripe Sessions 2026 uses deep plum #20033C as its primary text color instead of black — on a warm cream #F9F7F7 background. This is unusual and striking. CORK applies this entire palette to a wine app.

Wine apps almost universally go dark to signal premium quality (Vivino, Delectable, Cellartracker all use dark UIs). CORK runs the counter-programming: it feels like opening Decanter or Wine Spectator — editorial cream pages with rich plum typography. The physical wine world — labels, publications, tasting rooms — lives in this palette. CORK brings it into product UI.

## The Palette Insight

Stripe Sessions 2026 was featured on godly.website. Its palette: rgb(249,247,247) warm cream background + rgb(32,3,60) deep purple-plum text + Söhne Variable typeface. This isn't black — it's a deep plum with warmth and personality.

Applied to a wine app, this palette is remarkably natural: plum literally references the product. The cream background evokes linen napkins, aged paper, the unbleached cotton of wine country. The burgundy accent color (drawn from the ink) gives primary actions a brand coherence.

## Design Principles

1. **Plum is the new black** — #20033C replaces black as ink everywhere. Not just as accent but as body text, headings, all text elements.
2. **Editorial warmth** — Georgia serif for wine names and tasting note body text. The reading experience of a wine journal.
3. **Type signals wine type** — Red wines use burgundy #7A1B3F, whites use gold #C49A3A, rosés use #C4706A, sparkling gold #9B7A3C. Color is functional but warm.
4. **Score as the hero** — Wine scores (90–100 pts) displayed in large editorial type, not buried in metadata.

## Key Screens

1. **Mobile Discover** — Featured wine hero card + new arrivals list with wine type indicators
2. **Mobile Detail** — Full wine profile with tasting attributes, drinking window, flavor tags
3. **Mobile Cellar** — Cellar inventory with status (Ready/Aging/Drink Now) and value tracking
4. **Mobile Notes** — Tasting journal with note composer and flavor tagging
5. **Mobile Search** — Search + filter by region, varietal, score range
6. **Desktop Discover** — Featured release + cellar stats + wine grid
7. **Desktop Detail** — Full two-column wine detail with community notes
8. **Desktop Cellar** — Cellar grid view with stats strip and type filtering
9. **Desktop Journal** — Tasting journal with master list + full note detail panel
`;

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- \*\*(.+?)\*\*[—:] (.+)$/gm, '<li><strong>$1</strong>: $2</li>')
    .replace(/^\d+\. \*\*(.+?)\*\*[—:] (.+)$/gm, '<li><strong>$1</strong>: $2</li>')
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
  const labels = ['Discover','Detail','Cellar','Notes','Search','Discover','Detail','Cellar','Journal'];

  const thumbsHTML = screens.map((s, i) => {
    const sw = s.width, sh = s.height;
    const tw = Math.round(THUMB_H * (sw / sh));
    const isMobile = sw < 500;
    const label = `${isMobile ? 'M' : 'D'} · ${labels[i] || ''}`;
    const els = (s.children || []).slice(0, 80);
    const rects = els.map(el => {
      if (!el || !el.fill || el.fill === 'transparent') return '';
      const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
      if (w === 0 || h === 0) return '';
      const r = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';
      const op = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
      return `<rect x="${el.x||0}" y="${el.y||0}" width="${w}" height="${h}" fill="${el.fill}"${r}${op}/>`;
    }).join('');
    const shadow = isMobile
      ? 'box-shadow:0 2px 16px rgba(32,3,60,0.10)'
      : 'box-shadow:0 2px 20px rgba(32,3,60,0.12)';
    const thumbSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${THUMB_H}" style="display:block;border-radius:8px;flex-shrink:0;${shadow}"><rect width="${sw}" height="${sh}" fill="${BG}"/>${rects}</svg>`;
    return `<div style="text-align:center;flex-shrink:0">
      ${thumbSvg}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;color:${MID};font-family:monospace">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: BG,       role: 'CREAM BG'  },
    { hex: SURFACE,  role: 'SURFACE'   },
    { hex: INK,      role: 'PLUM INK'  },
    { hex: BURGUNDY, role: 'BURGUNDY'  },
    { hex: ROSÉ,     role: 'ROSÉ'      },
    { hex: GOLD,     role: 'GOLD'      },
    { hex: TAWNY,    role: 'TAWNY'     },
    { hex: SAGE,     role: 'SAGE'      },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:60px">
      <div style="height:44px;border-radius:6px;background:${sw.hex};border:1px solid ${BORDER};margin-bottom:6px"></div>
      <div style="font-size:9px;letter-spacing:1.2px;opacity:.4;margin-bottom:2px;color:${MID}">${sw.role}</div>
      <div style="font-size:10px;font-weight:600;color:${MID};opacity:.7">${sw.hex}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* CORK — Wine Discovery · RAM Heartbeat #16 */
  /* Palette inspired by: Stripe Sessions 2026 (godly.website) */

  /* Cream Surface System */
  --bg:        #F9F7F7;   /* Stripe Sessions warm cream */
  --surface:   #F2EEEC;   /* cream card surface */
  --raised:    #EAE4E1;   /* elevated element */
  --border:    #D8CEC9;   /* warm plum-tinted border */
  --rule:      #E4DDD9;   /* subtle rule */

  /* Plum Ink Scale — replaces black */
  --ink:       #20033C;   /* Stripe Sessions deep plum — primary ink */
  --mid:       #5C4A5A;   /* warm plum-mid — secondary text */
  --muted:     #9B8B96;   /* warm purple-gray muted */
  --faint:     #C4B8C0;   /* very faint plum text */

  /* Wine Accents */
  --burgundy:  #7A1B3F;   /* deep burgundy — primary actions */
  --rosé:      #C4706A;   /* warm rosé — sparkling/rosé wines */
  --gold:      #C49A3A;   /* warm gold — white wine / premium */
  --tawny:     #A05C2A;   /* tawny port orange — aging indicator */
  --sage:      #5C7A5C;   /* sage green — ready to drink */

  /* Shadows — plum-tinted */
  --shadow-sm:   0 1px 3px #20033C10;
  --shadow-md:   0 2px 8px #20033C12;
  --shadow-lg:   0 4px 20px #20033C14;

  /* Typography */
  --font-serif: 'Georgia', 'Times New Roman', serif;   /* wine names, notes */
  --font-sans:  'Inter', system-ui, sans-serif;         /* UI elements */

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 32px; --space-6: 48px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 12px; --radius-lg: 20px;
}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CORK — Wine Discovery · RAM Design Studio</title>
<meta name="description" content="A wine discovery & cellar tracker using deep plum #20033C as primary ink on warm cream. Inspired by Stripe Sessions 2026 palette. Anti-dark-mode wine UI. 9 screens.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${BG};color:${INK};font-family:'SF Pro Text','Inter',system-ui,sans-serif;min-height:100vh}
nav{padding:20px 40px;border-bottom:1px solid ${BORDER};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.logo{font-size:14px;font-weight:700;letter-spacing:4px;color:${MUTED}}
.nav-right{display:flex;align-items:center;gap:20px}
.nav-id{font-size:11px;color:${BORDER};letter-spacing:1px;font-family:monospace}
.hb-badge{font-size:9px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:4px;background:${BURGUNDY}18;color:${BURGUNDY};border:1px solid ${BURGUNDY}44}
.inspo-bar{display:flex;align-items:center;gap:20px;padding:20px 40px;background:${SURFACE};border-bottom:1px solid ${BORDER}}
.plum-dot{width:48px;height:48px;border-radius:50%;background:${INK};flex-shrink:0;box-shadow:0 2px 12px ${INK}30}
.hero{padding:80px 40px 40px;max-width:960px}
.tag{font-size:10px;letter-spacing:3px;color:${BURGUNDY};margin-bottom:20px;font-weight:700}
h1{font-size:clamp(56px,10vw,120px);font-weight:700;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${INK};font-family:Georgia,serif}
.h1-accent{color:${BURGUNDY}}
.sub{font-size:15px;color:${MID};opacity:.7;max-width:520px;line-height:1.7;margin-bottom:32px;font-weight:300}
.meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
.meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px;color:${MID}}
.meta-item strong{color:${BURGUNDY}}
.actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
.btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
.btn-p{background:${BURGUNDY};color:${WHITE}}
.btn-p:hover{opacity:.85}
.btn-s{background:transparent;color:${MID};border:1px solid ${BORDER}}
.btn-s:hover{border-color:${BURGUNDY}88;color:${BURGUNDY}}
.section-label{font-size:10px;letter-spacing:3px;color:${BURGUNDY};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${BORDER};font-weight:700}
.preview{padding:0 40px 80px}
.thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
.thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-thumb{background:${BURGUNDY}44;border-radius:2px}
.brand-section{padding:60px 40px;border-top:1px solid ${BORDER};max-width:1000px}
.brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
@media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
.swatches{display:flex;gap:8px;flex-wrap:wrap}
.type-row{padding:14px 0;border-bottom:1px solid ${BORDER}}
.tokens-block{background:${SURFACE};border:1px solid ${BORDER};border-radius:8px;padding:20px;margin-top:24px;position:relative}
.tokens-pre{font-size:11px;line-height:1.7;color:${MID};opacity:.7;white-space:pre;overflow-x:auto;font-family:monospace}
.copy-btn{position:absolute;top:12px;right:12px;background:${BURGUNDY}18;border:1px solid ${BURGUNDY}44;color:${BURGUNDY};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
.prd-section{padding:40px;border-top:1px solid ${BORDER};max-width:780px}
.prd-section h3{font-size:10px;letter-spacing:2px;color:${BURGUNDY};margin:28px 0 10px;font-weight:700}
.prd-section h3:first-child{margin-top:0}
.prd-section p,.prd-section li{font-size:14px;color:${MID};opacity:.7;line-height:1.75;max-width:680px}
.prd-section ul,.prd-section ol{padding-left:18px;margin:6px 0}.prd-section li{margin-bottom:4px}
.prd-section strong{opacity:1;color:${INK}}
.prd-section code{font-family:monospace;font-size:12px;color:${BURGUNDY};opacity:.9}
.insp-section{padding:40px;border-top:1px solid ${BORDER};max-width:900px}
.insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media(max-width:640px){.insp-grid{grid-template-columns:1fr}}
.insp-card{background:${SURFACE};border:1px solid ${BORDER};border-radius:8px;padding:16px 20px}
.insp-site{font-size:9px;letter-spacing:1.5px;color:${BURGUNDY};margin-bottom:6px;font-weight:700}
.insp-note{font-size:12px;color:${MID};line-height:1.6;opacity:.7}
footer{padding:28px 40px;border-top:1px solid ${BORDER};font-size:11px;color:${MUTED};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.toast{position:fixed;bottom:24px;right:24px;background:${BURGUNDY};color:${WHITE};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
.toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-right">
    <div class="hb-badge">HEARTBEAT #16 · WINE APP</div>
    <div class="nav-id">${sub.id}</div>
  </div>
</nav>

<div class="inspo-bar">
  <div class="plum-dot"></div>
  <div>
    <div style="font-size:10px;letter-spacing:2px;color:${BURGUNDY};font-weight:700;margin-bottom:4px">PALETTE SOURCE — STRIPE SESSIONS 2026 · GODLY.WEBSITE</div>
    <div style="font-size:18px;font-weight:700;color:${INK};font-family:Georgia,serif">Deep Plum as Ink <span style="font-family:monospace;font-size:14px;color:${BURGUNDY}">#20033C</span></div>
    <div style="font-size:12px;color:${MID};opacity:.5;margin-top:2px">Replacing black with deep purple-plum throughout the entire type system</div>
  </div>
</div>

<section class="hero">
  <div class="tag">LIGHT MODE · EDITORIAL · WINE DISCOVERY · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>CO<span class="h1-accent">RK</span></h1>
  <p class="sub">A wine discovery app that feels like reading Decanter. Deep plum ink on warm cream. No dark mode. The editorial warmth of physical wine culture — labels, publications, tasting rooms — brought into product UI.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>9 (5 MOBILE + 4 DESKTOP)</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>CREAM × PLUM INK × BURGUNDY</strong></div>
    <div class="meta-item"><span>CONCEPT</span><strong>PLUM REPLACES BLACK</strong></div>
    <div class="meta-item"><span>SOURCE</span><strong>STRIPE SESSIONS 2026</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/cork-viewer">▶ Open in Viewer</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/cork-pen/raw" download="cork.pen">↓ Download .pen</a>
    <button class="btn btn-s" onclick="copyTokens()">⌘ Copy CSS Tokens</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/feedback?design=cork">↺ Request Refactor</a>
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
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px;color:${MID}">PALETTE — PLUM INK SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:0;color:${MID}">TYPE SCALE</div>
      ${[
        {label:'WINE NAME',    size:'clamp(18px,3vw,32px)', w:'700', sample:'Chambolle-Musigny PC', serif:true, color:INK},
        {label:'SCORE',        size:'28px',                 w:'700', sample:'98 pts',               serif:true, color:BURGUNDY},
        {label:'REGION',       size:'14px',                 w:'500', sample:'Côte de Nuits · Burgundy', color:MID},
        {label:'TASTING NOTE', size:'13px',                 w:'400', sample:'"Ethereal and silky, the finest..."', serif:true, color:MID},
        {label:'LABEL',        size:'11px',                 w:'700', sample:'RED WINE · FRANCE · 2018', color:MUTED},
      ].map(t => `<div class="type-row">
        <div style="font-size:9px;letter-spacing:2px;opacity:.3;margin-bottom:6px;color:${MID}">${t.label} · ${t.size} / ${t.w}</div>
        <div style="font-size:${t.size};font-weight:${t.w};color:${t.color||INK};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${t.serif?'Georgia,serif':'inherit'}">${t.sample}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px;color:${MID}">DESIGN PRINCIPLES</div>
      ${[
        'Plum is the new black — #20033C replaces black as ink everywhere. Not as accent, as the primary text color.',
        'Serif for wine — Georgia carries the editorial warmth of Decanter. UI labels in Inter, wine names in serif.',
        'Type signals wine type — burgundy for reds, gold for whites, rosé for sparkling. Functional color, warm palette.',
        'Score as hero — wine scores in large editorial type, center stage. The number is the message.',
      ].map((p,i) => `<div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start">
        <div style="color:${BURGUNDY};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i+1).padStart(2,'0')}</div>
        <div style="font-size:13px;color:${MID};opacity:.65;line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px;color:${MID}">WINE TYPE COLORS</div>
      ${[
        {type:'Red Wine',    color:BURGUNDY, note:'Primary. Burgundy from the plum ink.'},
        {type:'White Wine',  color:GOLD,     note:'Warm gold. Harvest, oak, sunlight.'},
        {type:'Rosé',        color:ROSÉ,     note:'Warm rosé-pink. Summer & provençal.'},
        {type:'Sparkling',   color:'#9B7A3C',note:'Deeper gold. Bead, brioche, yeast.'},
        {type:'Port/Dessert',color:TAWNY,    note:'Tawny orange. Aged, oxidative.'},
        {type:'Ready/Fresh', color:SAGE,     note:'Sage green. Drink now indicator.'},
      ].map(w => `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:16px;height:16px;border-radius:50%;background:${w.color};flex-shrink:0"></div>
        <div>
          <div style="font-size:12px;font-weight:600;color:${INK}">${w.type}</div>
          <div style="font-size:11px;color:${MUTED};opacity:.6">${w.note}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="insp-section">
  <div class="section-label">RESEARCH SOURCES · HEARTBEAT #16</div>
  <div class="insp-grid">
    <div class="insp-card">
      <div class="insp-site">STRIPE SESSIONS 2026 — GODLY.WEBSITE</div>
      <p class="insp-note">Background rgb(249,247,247) warm cream + rgb(32,3,60) deep purple-plum text + Söhne Variable. The key insight: Stripe is using plum instead of black. Not as an accent — as the primary ink. CORK applies this same choice to a wine app where plum is thematically perfect.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">THE FIRST THE LAST — AWWWARDS SOTD</div>
      <p class="insp-note">TWKLausanne-400 font on rgb(248,248,248) near-white. Award-winning Miami/Dubai creative agency. Confirms the trend: near-white backgrounds (not pure white) with premium grotesque typefaces. The "almost cream" background is a consistent signal across top-tier design in 2026.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">KYN & FOLK — LAND-BOOK.COM</div>
      <p class="insp-note">Handcrafted ceramic water filters. Academica Light serif + rgb(249,249,249) cream + warm gray rgb(79,78,78) text. Artisan e-commerce using cream + serif as editorial warmth signals. CORK's Georgia serif for wine names comes from this pattern: artisan products deserve artisan typography.</p>
    </div>
  </div>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${mdToHtml(prdMarkdown)}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #16 · Wine Discovery · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
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
  const minified = JSON.stringify(JSON.parse(penJsonStr));
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let html = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(minified)};<\/script>`;
  return html.replace('<script>', injection + '\n<script>');
}

async function main() {
  console.log('🍷  CORK — Full Design Discovery Pipeline (HB#16)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const penPath = path.join(__dirname, 'cork.pen');
  if (!fs.existsSync(penPath)) {
    console.error('✗ cork.pen not found — run: node cork-app.js');
    process.exit(1);
  }
  const penJsonStr = fs.readFileSync(penPath, 'utf8');
  const doc = JSON.parse(penJsonStr);
  const screens = doc.children || [];
  console.log(`✓ Loaded cork.pen — ${screens.length} screens`);
  screens.forEach(s => console.log(`  ${s.id.padEnd(14)} ${s.width}×${s.height}  ${(s.children||[]).length} els`));

  // ── 1. Pen JSON ──────────────────────────────────────────────────────────────
  console.log('\n📤 Publishing pen JSON → ram.zenbin.org/cork-pen...');
  const minifiedPen = JSON.stringify(JSON.parse(penJsonStr));
  const penRes = await zenPost('cork-pen', 'CORK .pen file', minifiedPen, 'ram');
  console.log(`  HTTP ${penRes.status} — ${penRes.status===200||penRes.status===201?'✅ Published':'❌ Failed'} (${(Buffer.byteLength(minifiedPen)/1024).toFixed(1)}kb)`);
  if (penRes.status!==200&&penRes.status!==201) console.log('  Error:', penRes.body.slice(0,300));

  // ── 2. Hero ──────────────────────────────────────────────────────────────────
  console.log('\n📤 Publishing hero → ram.zenbin.org/cork...');
  const heroHtml = buildHeroHTML(doc);
  const heroKb = Buffer.byteLength(JSON.stringify({title:'CORK',html:heroHtml}))/1024;
  console.log(`  Hero size: ${heroKb.toFixed(1)}kb`);
  const heroRes = await zenPost('cork', 'CORK — Wine Discovery · RAM Design Studio', heroHtml, 'ram');
  console.log(`  HTTP ${heroRes.status} — ${heroRes.status===200||heroRes.status===201?'✅ Published':'❌ Failed'}`);
  if (heroRes.status!==200&&heroRes.status!==201) console.log('  Error:', heroRes.body.slice(0,300));

  // ── 3. Viewer ────────────────────────────────────────────────────────────────
  console.log('\n📤 Publishing viewer → ram.zenbin.org/cork-viewer...');
  const viewerHtml = buildViewerHTML(penJsonStr);
  const viewerKb = Buffer.byteLength(JSON.stringify({title:'CORK Viewer',html:viewerHtml}))/1024;
  console.log(`  Viewer size: ${viewerKb.toFixed(1)}kb`);
  const viewerRes = await zenPost('cork-viewer', 'CORK Viewer', viewerHtml, 'ram');
  console.log(`  HTTP ${viewerRes.status} — ${viewerRes.status===200||viewerRes.status===201?'✅ Published':'❌ Failed'}`);
  if (viewerRes.status!==200&&viewerRes.status!==201) console.log('  Error:', viewerRes.body.slice(0,300));

  console.log('\n✅ CORK live:');
  console.log('   Hero:   https://ram.zenbin.org/cork');
  console.log('   Viewer: https://ram.zenbin.org/cork-viewer');
  console.log('   Pen:    https://ram.zenbin.org/cork-pen/raw');

  // ── 4. Gallery ───────────────────────────────────────────────────────────────
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
          hostname:'api.github.com',
          path:`/repos/${REPO}/contents/queue.json`,
          headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-studio/1.0','Accept':'application/vnd.github.v3+json'}
        }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
        req.on('error',reject); req.end();
      });
      if (getRes.status===200) {
        const fd = JSON.parse(getRes.body);
        const queue = JSON.parse(Buffer.from(fd.content,'base64').toString('utf8'));
        const entry = {
          id:sub.id, prompt:sub.prompt, app_type:'lifestyle', credit:'RAM Studio',
          submitted_at:sub.submitted_at, status:'done', app_name:'CORK', archetype:'wine/lifestyle',
          design_url:'https://ram.zenbin.org/cork', viewer_url:'https://ram.zenbin.org/cork-viewer',
          published_at:new Date().toISOString(),
        };
        const existing = (queue.submissions||[]).findIndex(s=>s.id===sub.id);
        if (existing>=0) queue.submissions[existing]=entry;
        else (queue.submissions=queue.submissions||[]).push(entry);
        queue.updated_at = new Date().toISOString();
        const content = Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
        const putBody = JSON.stringify({message:'add: CORK — wine discovery in deep plum + cream (HB#16)',content,sha:fd.sha});
        const putRes = await new Promise((resolve, reject) => {
          const req = https.request({
            hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'PUT',
            headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-studio/1.0','Content-Type':'application/json','Content-Length':Buffer.byteLength(putBody),'Accept':'application/vnd.github.v3+json'}
          }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
          req.on('error',reject); req.write(putBody); req.end();
        });
        console.log(`  Gallery registry: HTTP ${putRes.status} ${putRes.status===200?'✅':'❌'}`);
      }
    } catch(err) { console.warn(`  ⚠ Gallery skipped: ${err.message}`); }
  } else {
    console.log('\n  (Gallery registry skipped — no GitHub token)');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Done.');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
