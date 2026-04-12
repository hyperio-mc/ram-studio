#!/usr/bin/env node
// publish-nourish.js — Full Design Discovery pipeline for NOURISH (HB#17)
// Nutrition & meal tracking — warm oat bg, sage/terracotta/gold palette
// Rounded organic aesthetic · Inspired by DailyMe (Dribbble) + Idle Hour Matcha
// Three-part publish: nourish-pen (raw JSON) → nourish (hero) → nourish-viewer

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const sub = {
  id:           'hb-nourish-' + Date.now(),
  prompt:       'NOURISH — Nutrition & meal tracking app. Warm oat #FAF7F0 background. Sage green, terracotta, gold palette. Rounded organic aesthetic — pill shapes, large corner radii. Inspired by "Nutrition App UI – DailyMe" (Dribbble top, Phenomenon Studio) + Idle Hour Matcha rounded serif aesthetic (siteinspire). 9 screens.',
  app_type:     'health',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

// ── Palette ───────────────────────────────────────────────────────────────────
const BG        = '#FAF7F0';
const SURFACE   = '#F2EDE2';
const BORDER    = '#E4DDD0';
const SAGE      = '#7A9B6A';
const SAGEPALE  = '#D4E8CA';
const TERRA     = '#C4796A';
const TERRAPALE = '#F0D5D1';
const GOLD      = '#C4963A';
const GOLDPALE  = '#F0E4C0';
const FOREST    = '#3D6B4A';
const INK       = '#161410';
const MID       = '#5A5046';
const MUTED     = '#8A7E72';
const FAINT     = '#C0B8AE';
const CARD      = '#FFFFFF';

const prdMarkdown = `
## Overview

NOURISH is a nutrition and meal tracking app built around one key insight from research: "Nutrition App UI – DailyMe" by Phenomenon Studio was the most-viewed shot on Dribbble this week (11,900 views). Nutrition tracking is a crowded category but most apps feel clinical or punishing — calorie counters that feel like ledgers.

NOURISH runs the counter-programming: warm, organic, rounded. Food is pleasure and nourishment, not a number to minimize. The UI feels like a bowl of good food — warm oat background, sage greens, terracotta earth tones, golden yellows. Every radius is large. Every shape is pill or circle.

The secondary research source was Idle Hour Matcha on siteinspire — artisan matcha e-commerce using OfficeTimesRound-Regular, an extremely rounded geometric typeface that makes the whole UI feel organic and artisanal. NOURISH brings this rounded softness to a health app.

## The Design Insight

Nutrition apps have a problem: they make users feel bad. Calorie deficits, red warnings, negative feedback loops. The visual language of most apps (MyFitnessPal, Cronometer) is clinical and spreadsheet-adjacent.

NOURISH's visual language says: you're doing great, here's beautiful food. Sage green for vegetables, warm terracotta for protein, golden yellow for energy/carbs. The calorie ring is always mostly full. The macro pills feel like ingredients, not metrics.

## Design Principles

1. **Round everything** — No sharp corners anywhere. Pills for tags, circles for avatars and macro indicators, large corner radii (16-24px) on all cards.
2. **Food colors are palette** — Sage for greens, terracotta for meat/protein, gold for carbs/grains. The palette literally comes from food.
3. **Celebration not punishment** — Progress bars show what's been consumed, not what's missing. Streaks are highlighted in gold. Language is encouraging.
4. **Warm oat, never white** — Background is warm oat #FAF7F0, not clinical white. Every surface has warmth.

## Key Screens

1. **Mobile Dashboard** — Daily calorie ring + macro pills + meal timeline + hydration tracker
2. **Mobile Log Meal** — Food search + quick-add categories + recently logged + meal total
3. **Mobile Meal Detail** — Full nutrition breakdown + ingredient list with prep info
4. **Mobile Recipes** — Filtered recipe library with 2-column grid + featured card
5. **Mobile Progress** — Weekly bar chart + goal tracking + macro split
6. **Desktop Dashboard** — Stats row + meals panel + daily progress ring + suggested recipes
7. **Desktop Log Meal** — Split view: food search left, meal summary right
8. **Desktop Recipes** — Recipe library with hero card + 3-column grid
9. **Desktop Analytics** — Calorie trend chart + macro split + goal completion panel
`;

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\d+\. \*\*(.+?)\*\*[—:] (.+)$/gm, '<li><strong>$1</strong>: $2</li>')
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
  const labels = ['Dashboard','Log Meal','Meal Detail','Recipes','Progress','Dashboard','Log Meal','Recipes','Analytics'];

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
      ? 'box-shadow:0 2px 16px rgba(58,107,74,0.10)'
      : 'box-shadow:0 2px 20px rgba(22,20,16,0.10)';
    const thumbSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${THUMB_H}" style="display:block;border-radius:10px;flex-shrink:0;${shadow}"><rect width="${sw}" height="${sh}" fill="${BG}"/>${rects}</svg>`;
    return `<div style="text-align:center;flex-shrink:0">
      ${thumbSvg}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;color:${MUTED};font-family:monospace">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: BG,        role: 'WARM OAT'   },
    { hex: SURFACE,   role: 'SURFACE'    },
    { hex: SAGE,      role: 'SAGE'       },
    { hex: SAGEPALE,  role: 'SAGE PALE'  },
    { hex: TERRA,     role: 'TERRACOTTA' },
    { hex: GOLD,      role: 'GOLD'       },
    { hex: FOREST,    role: 'FOREST'     },
    { hex: INK,       role: 'INK'        },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:60px">
      <div style="height:44px;border-radius:8px;background:${sw.hex};border:1px solid ${BORDER};margin-bottom:6px"></div>
      <div style="font-size:9px;letter-spacing:1.2px;opacity:.4;margin-bottom:2px;color:${MID}">${sw.role}</div>
      <div style="font-size:10px;font-weight:600;color:${MID};opacity:.7">${sw.hex}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* NOURISH — Nutrition & Meal Tracking · RAM Heartbeat #17 */
  /* Inspired by: Dribbble DailyMe (Phenomenon Studio) + Idle Hour Matcha (siteinspire) */

  /* Warm Oat Surface System */
  --bg:         #FAF7F0;   /* warm oat — base background */
  --surface:    #F2EDE2;   /* deeper oat surface */
  --card:       #FFFFFF;   /* card backgrounds */
  --border:     #E4DDD0;   /* warm border */

  /* Text Scale */
  --ink:        #161410;   /* warm near-black */
  --mid:        #5A5046;   /* warm mid text */
  --muted:      #8A7E72;   /* muted warm text */
  --faint:      #C0B8AE;   /* very faint text */

  /* Food Palette */
  --sage:       #7A9B6A;   /* greens & vegetables */
  --sage-pale:  #D4E8CA;   /* sage tint — backgrounds */
  --sage-mid:   #9BBB8C;   /* mid sage */
  --terra:      #C4796A;   /* terracotta — protein */
  --terra-pale: #F0D5D1;   /* terracotta tint */
  --gold:       #C4963A;   /* gold — carbs & energy */
  --gold-pale:  #F0E4C0;   /* gold tint */
  --forest:     #3D6B4A;   /* deep forest — primary actions */

  /* Shadows — warm-tinted */
  --shadow-sm:  0 1px 3px rgba(22,20,16,0.06);
  --shadow-md:  0 2px 8px rgba(22,20,16,0.08);
  --shadow-lg:  0 4px 20px rgba(22,20,16,0.10);

  /* Radius — organic, rounded */
  --radius-sm:  8px;
  --radius-md:  16px;
  --radius-lg:  24px;
  --radius-pill: 999px;

  /* Typography */
  --font-sans:  'Inter', system-ui, sans-serif;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 32px; --space-6: 48px;
}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NOURISH — Nutrition Tracker · RAM Design Studio</title>
<meta name="description" content="A nutrition & meal tracking app with warm oat background, sage/terracotta/gold palette, and rounded organic aesthetic. Inspired by DailyMe (Dribbble) + Idle Hour Matcha. 9 screens.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${BG};color:${INK};font-family:'SF Pro Text','Inter',system-ui,sans-serif;min-height:100vh}
nav{padding:20px 40px;border-bottom:1px solid ${BORDER};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.logo{font-size:14px;font-weight:700;letter-spacing:4px;color:${MUTED}}
.nav-right{display:flex;align-items:center;gap:20px}
.nav-id{font-size:11px;color:${FAINT};letter-spacing:1px;font-family:monospace}
.hb-badge{font-size:9px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:20px;background:${SAGEPALE};color:${FOREST};border:1px solid ${SAGE}44}
.inspo-bar{display:flex;align-items:center;gap:20px;padding:20px 40px;background:${SURFACE};border-bottom:1px solid ${BORDER}}
.leaf-dot{width:48px;height:48px;border-radius:50%;background:${FOREST};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:22px}
.hero{padding:80px 40px 40px;max-width:960px}
.tag{font-size:10px;letter-spacing:3px;color:${FOREST};margin-bottom:20px;font-weight:700}
h1{font-size:clamp(56px,10vw,120px);font-weight:700;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${INK}}
.h1-accent{color:${SAGE}}
.sub{font-size:15px;color:${MID};opacity:.7;max-width:520px;line-height:1.7;margin-bottom:32px;font-weight:300}
.meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
.meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px;color:${MID}}
.meta-item strong{color:${FOREST}}
.actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
.btn{padding:11px 22px;border-radius:22px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px;transition:opacity .15s}
.btn-p{background:${FOREST};color:#FFFFFF}
.btn-p:hover{opacity:.85}
.btn-s{background:transparent;color:${MID};border:1px solid ${BORDER}}
.btn-s:hover{border-color:${SAGE};color:${FOREST}}
.section-label{font-size:10px;letter-spacing:3px;color:${FOREST};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${BORDER};font-weight:700}
.preview{padding:0 40px 80px}
.thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
.thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-thumb{background:${SAGE}44;border-radius:2px}
.brand-section{padding:60px 40px;border-top:1px solid ${BORDER};max-width:1000px}
.brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
@media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
.swatches{display:flex;gap:8px;flex-wrap:wrap}
.type-row{padding:14px 0;border-bottom:1px solid ${BORDER}}
.tokens-block{background:${SURFACE};border:1px solid ${BORDER};border-radius:12px;padding:20px;margin-top:24px;position:relative}
.tokens-pre{font-size:11px;line-height:1.7;color:${MID};opacity:.7;white-space:pre;overflow-x:auto;font-family:monospace}
.copy-btn{position:absolute;top:12px;right:12px;background:${SAGEPALE};border:1px solid ${SAGE}44;color:${FOREST};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:20px;cursor:pointer;font-weight:700}
.prd-section{padding:40px;border-top:1px solid ${BORDER};max-width:780px}
.prd-section h3{font-size:10px;letter-spacing:2px;color:${FOREST};margin:28px 0 10px;font-weight:700}
.prd-section h3:first-child{margin-top:0}
.prd-section p,.prd-section li{font-size:14px;color:${MID};opacity:.7;line-height:1.75;max-width:680px}
.prd-section ul,.prd-section ol{padding-left:18px;margin:6px 0}.prd-section li{margin-bottom:4px}
.prd-section strong{opacity:1;color:${INK}}
.prd-section code{font-family:monospace;font-size:12px;color:${FOREST};opacity:.9}
.insp-section{padding:40px;border-top:1px solid ${BORDER};max-width:900px}
.insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media(max-width:640px){.insp-grid{grid-template-columns:1fr}}
.insp-card{background:${SURFACE};border:1px solid ${BORDER};border-radius:12px;padding:16px 20px}
.insp-site{font-size:9px;letter-spacing:1.5px;color:${FOREST};margin-bottom:6px;font-weight:700}
.insp-note{font-size:12px;color:${MID};line-height:1.6;opacity:.7}
footer{padding:28px 40px;border-top:1px solid ${BORDER};font-size:11px;color:${MUTED};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.toast{position:fixed;bottom:24px;right:24px;background:${FOREST};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:20px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
.toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-right">
    <div class="hb-badge">HEARTBEAT #17 · NUTRITION APP</div>
    <div class="nav-id">${sub.id}</div>
  </div>
</nav>

<div class="inspo-bar">
  <div class="leaf-dot">🌿</div>
  <div>
    <div style="font-size:10px;letter-spacing:2px;color:${FOREST};font-weight:700;margin-bottom:4px">RESEARCH SOURCE — DRIBBBLE TOP SHOT · PHENOMENONSTUDIO × IDLE HOUR MATCHA</div>
    <div style="font-size:18px;font-weight:700;color:${INK}">Organic Warmth Over Clinical Tracking</div>
    <div style="font-size:12px;color:${MID};opacity:.5;margin-top:2px">Food is pleasure — warm oat, sage greens, terracotta earth tones, rounded everything</div>
  </div>
</div>

<section class="hero">
  <div class="tag">LIGHT MODE · ORGANIC · NUTRITION TRACKING · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>NO<span class="h1-accent">URI</span>SH</h1>
  <p class="sub">A nutrition tracker that feels like a bowl of good food. Warm oat background, sage greens for vegetables, terracotta for protein, golden yellow for energy. Round everything — pill shapes, circle avatars, no sharp corners. Food is not a ledger.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>9 (5 MOBILE + 4 DESKTOP)</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>OAT × SAGE × TERRA × GOLD</strong></div>
    <div class="meta-item"><span>AESTHETIC</span><strong>ROUNDED ORGANIC</strong></div>
    <div class="meta-item"><span>SOURCE</span><strong>DRIBBBLE #1 THIS WEEK</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/nourish-viewer">▶ Open in Viewer</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/nourish-pen/raw" download="nourish.pen">↓ Download .pen</a>
    <button class="btn btn-s" onclick="copyTokens()">⌘ Copy CSS Tokens</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/feedback?design=nourish">↺ Request Refactor</a>
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
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px;color:${MID}">PALETTE — FOOD COLOR SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:0;color:${MID}">TYPE SCALE</div>
      ${[
        {label:'APP TITLE',    size:'22px', w:'700', sample:'Good morning, Alex 🌿', color:INK},
        {label:'STAT VALUE',   size:'28px', w:'700', sample:'1,240 kcal',             color:INK},
        {label:'MEAL NAME',    size:'14px', w:'600', sample:'Grilled Chicken Salad',  color:INK},
        {label:'MACRO LABEL',  size:'11px', w:'400', sample:'Lunch · High protein',   color:MUTED},
        {label:'BADGE / TAG',  size:'10px', w:'700', sample:'HIGH PROTEIN · OAT',     color:FOREST},
      ].map(t => `<div class="type-row">
        <div style="font-size:9px;letter-spacing:2px;opacity:.3;margin-bottom:6px;color:${MID}">${t.label} · ${t.size} / ${t.w}</div>
        <div style="font-size:${t.size};font-weight:${t.w};color:${t.color};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px;color:${MID}">DESIGN PRINCIPLES</div>
      ${[
        'Round everything — pills for tags, circles for macro indicators, 16–24px radius on all cards. No sharp corners anywhere.',
        'Food colors as palette — sage for vegetables, terracotta for protein, gold for carbs. The palette literally comes from food.',
        'Celebration not punishment — progress bars show what\'s been consumed, not what\'s missing. Streaks in gold. Encouraging language.',
        'Warm oat, never white — background is #FAF7F0 warm oat, not clinical white. Every surface has warmth and personality.',
      ].map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start">
        <div style="color:${SAGE};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i+1).padStart(2,'0')}</div>
        <div style="font-size:13px;color:${MID};opacity:.65;line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px;color:${MID}">MACRO COLOR SYSTEM</div>
      ${[
        {macro:'Carbohydrates', color:GOLD,   pale:GOLDPALE,  note:'Energy & grains. Warm gold — harvest, bread, abundance.'},
        {macro:'Protein',       color:TERRA,  pale:TERRAPALE, note:'Terracotta earth — meat, legumes, strength.'},
        {macro:'Fats',          color:SAGE,   pale:SAGEPALE,  note:'Sage green — healthy fats, avocado, oils.'},
        {macro:'Vegetables',    color:FOREST, pale:SAGEPALE,  note:'Deep forest — greens, fiber, vitality.'},
        {macro:'Hydration',     color:'#6BAED6', pale:'#D0E8F4', note:'Cool blue — water, detox, clarity.'},
      ].map(m => `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:32px;height:16px;border-radius:8px;background:${m.color};flex-shrink:0"></div>
        <div>
          <div style="font-size:12px;font-weight:600;color:${INK}">${m.macro}</div>
          <div style="font-size:11px;color:${MUTED};opacity:.6">${m.note}</div>
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
  <div class="section-label">RESEARCH SOURCES · HEARTBEAT #17</div>
  <div class="insp-grid">
    <div class="insp-card">
      <div class="insp-site">DAILYME — DRIBBBLE #1 THIS WEEK · PHENOMENON STUDIO</div>
      <p class="insp-note">11,900 views — most-viewed Dribbble shot this week at time of research. "Nutrition App UI – DailyMe" by Phenomenon Studio. Warm rounded aesthetic, macro-tracking focus, lifestyle photography. Key signal: nutrition tracking is moving away from clinical spreadsheet UI toward lifestyle-warm design.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">IDLE HOUR MATCHA — SITEINSPIRE</div>
      <p class="insp-note">Artisan matcha e-commerce using OfficeTimesRound-Regular — an extremely rounded geometric typeface. White background + black type but the rounded font makes the entire UI feel organic and hand-crafted. NOURISH applies this "rounded = artisanal" principle to Inter weights, choosing maximum corner radii everywhere.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">NNGROUP — DESIGN PROCESS ISN'T DEAD</div>
      <p class="insp-note">"Design Process Isn't Dead, It's Compressed." Key finding: designers in 2026 are moving to rapid research-to-prototype loops rather than full linear processes. NOURISH embodies this — research in one heartbeat cycle, built and shipped same session. The 3 C's of microcopy also informed the encouraging language used throughout the app.</p>
    </div>
  </div>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${mdToHtml(prdMarkdown)}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #17 · Nutrition Tracking · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
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
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let html = fs.readFileSync(viewerPath, 'utf8');
  const minified = JSON.stringify(JSON.parse(penJsonStr));
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(minified)};<\/script>`;
  return html.replace('<script>', injection + '\n<script>');
}

async function main() {
  console.log('🌿  NOURISH — Full Design Discovery Pipeline (HB#17)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const penPath = path.join(__dirname, 'nourish.pen.json');
  if (!fs.existsSync(penPath)) {
    console.error('✗ nourish.pen.json not found — run: node nourish-app.js');
    process.exit(1);
  }
  const penJsonStr = fs.readFileSync(penPath, 'utf8');
  const doc = JSON.parse(penJsonStr);
  const screens = doc.children || [];
  console.log(`✓ Loaded nourish.pen.json — ${screens.length} screens`);
  screens.forEach(s => console.log(`  ${s.id.padEnd(14)} ${s.width}×${s.height}  ${(s.children||[]).length} els`));

  // ── 1. Pen JSON ──────────────────────────────────────────────────────────────
  console.log('\n📤 Publishing pen JSON → ram.zenbin.org/nourish-pen...');
  const minifiedPen = JSON.stringify(JSON.parse(penJsonStr));
  const penRes = await zenPost('nourish-pen', 'NOURISH .pen file', minifiedPen, 'ram');
  const penKb = (Buffer.byteLength(minifiedPen)/1024).toFixed(1);
  console.log(`  HTTP ${penRes.status} — ${penRes.status===200||penRes.status===201?'✅':'❌'} (${penKb}kb)`);
  if (penRes.status!==200&&penRes.status!==201) console.log('  Error:', penRes.body.slice(0,300));

  // ── 2. Hero ──────────────────────────────────────────────────────────────────
  console.log('\n📤 Publishing hero → ram.zenbin.org/nourish...');
  const heroHtml = buildHeroHTML(doc);
  const heroKb = (Buffer.byteLength(JSON.stringify({title:'NOURISH',html:heroHtml}))/1024).toFixed(1);
  console.log(`  Hero size: ${heroKb}kb`);
  const heroRes = await zenPost('nourish', 'NOURISH — Nutrition Tracker · RAM Design Studio', heroHtml, 'ram');
  console.log(`  HTTP ${heroRes.status} — ${heroRes.status===200||heroRes.status===201?'✅':'❌'}`);
  if (heroRes.status!==200&&heroRes.status!==201) console.log('  Error:', heroRes.body.slice(0,300));

  // ── 3. Viewer ────────────────────────────────────────────────────────────────
  console.log('\n📤 Publishing viewer → ram.zenbin.org/nourish-viewer...');
  const viewerHtml = buildViewerHTML(penJsonStr);
  const viewerKb = (Buffer.byteLength(JSON.stringify({title:'NOURISH Viewer',html:viewerHtml}))/1024).toFixed(1);
  console.log(`  Viewer size: ${viewerKb}kb`);
  const viewerRes = await zenPost('nourish-viewer', 'NOURISH Viewer', viewerHtml, 'ram');
  console.log(`  HTTP ${viewerRes.status} — ${viewerRes.status===200||viewerRes.status===201?'✅':'❌'}`);
  if (viewerRes.status!==200&&viewerRes.status!==201) console.log('  Error:', viewerRes.body.slice(0,300));

  console.log('\n✅ NOURISH live:');
  console.log('   Hero:   https://ram.zenbin.org/nourish');
  console.log('   Viewer: https://ram.zenbin.org/nourish-viewer');
  console.log('   Pen:    https://ram.zenbin.org/nourish-pen/raw');

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
          id: sub.id,
          prompt: sub.prompt,
          app_type: 'health',
          credit: 'RAM Studio',
          submitted_at: sub.submitted_at,
          status: 'done',
          app_name: 'NOURISH',
          archetype: 'health/nutrition',
          design_url: 'https://ram.zenbin.org/nourish',
          viewer_url: 'https://ram.zenbin.org/nourish-viewer',
          published_at: new Date().toISOString(),
        };
        const existing = (queue.submissions||[]).findIndex(s => s.id === sub.id);
        if (existing >= 0) queue.submissions[existing] = entry;
        else (queue.submissions = queue.submissions || []).push(entry);
        queue.updated_at = new Date().toISOString();
        const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
        const putBody = JSON.stringify({
          message: 'add: NOURISH — nutrition tracker in warm oat + sage palette (HB#17)',
          content, sha: fd.sha
        });
        const putRes = await new Promise((resolve, reject) => {
          const req = https.request({
            hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'PUT',
            headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-studio/1.0','Content-Type':'application/json',
              'Content-Length':Buffer.byteLength(putBody),'Accept':'application/vnd.github.v3+json'}
          }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
          req.on('error',reject); req.write(putBody); req.end();
        });
        console.log(`  Gallery registry: HTTP ${putRes.status} ${putRes.status===200?'✅':'❌'}`);
        if (putRes.status!==200) console.log('  Error:', putRes.body.slice(0,200));
      }
    } catch(err) { console.warn(`  ⚠ Gallery skipped: ${err.message}`); }
  } else {
    console.log('\n  (Gallery registry skipped — no GitHub token)');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Done.');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
