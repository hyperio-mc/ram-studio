#!/usr/bin/env node
// publish-chord.js — Full Design Discovery pipeline for CHORD
// Music discovery app where playlists ARE gradient panels — no album art
// Inspired by Stripe Sessions prismatic diagonal tiles + Kunsthalle Basel minimal chrome

const fs   = require('fs');
const path = require('path');
const https = require('https');

const sub = {
  id:           'hb-chord-' + Date.now(),
  prompt:       'CHORD — A music discovery app where playlists and moods are gradient panels instead of album art. Anti-Spotify: off-white lavender background, deep midnight indigo type, 6 "mood chords" each a diagonal gradient pair (Focus: blue→cyan, Energy: orange→red, Flow: amber→gold, Dream: violet→pink, Ground: emerald→forest, Pulse: rose→purple). Inspired by Stripe Sessions prismatic gradient tiles + Kunsthalle Basel museum-editorial minimalism. First light-bg music app in RAM portfolio.',
  app_type:     'music',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const BG   = '#F5F3F8';
const INK  = '#180A44';
const RULE = '#D4CFE6';
const MOODS = {
  focus:  ['#2563EB','#06B6D4'],
  energy: ['#F97316','#EF4444'],
  flow:   ['#F59E0B','#FBBF24'],
  dream:  ['#8B5CF6','#EC4899'],
  ground: ['#10B981','#065F46'],
  pulse:  ['#F43F5E','#A855F7'],
};

const prdMarkdown = `
## Overview

CHORD is a music discovery app built around a single radical premise: playlists don't need album art. Instead, each playlist, album, and mood is represented by its "chord" — a diagonal gradient panel encoding the emotional temperature of the music. Focus is blue→cyan. Dream is violet→pink. Energy is orange→red.

This isn't a Spotify clone. The palette is off-white lavender (#F5F3F8) with deep midnight indigo (#180A44) type — directly counter-programmed against the dark-mode-by-default music app standard. Inspired by Stripe Sessions 2026 (prismatic gradient panels) and Kunsthalle Basel (full-bleed content, near-invisible chrome, museum editorial minimalism applied to a functional product).

## The Concept

Traditional music apps front-load visual complexity: album art, artist photography, animated waveforms, glassmorphism effects. CHORD strips all of that and asks: what if the music was the gradient?

A "mood chord" is the fundamental unit of CHORD's visual language. Each of 6 moods gets a gradient pair, carefully chosen for emotional accuracy:
- **Focus** — blue → cyan: clarity, concentration, cool precision
- **Energy** — orange → red: heat, movement, activation
- **Flow** — amber → gold: warmth, creativity, gentle momentum
- **Dream** — violet → pink: night, imagination, soft emotion
- **Ground** — emerald → forest: nature, stability, slowness
- **Pulse** — rose → purple: excitement, late night, social energy

## Design Influences

**Stripe Sessions 2026 (stripesessions.com):** The conference site uses diagonal chromatic gradient panels as the primary visual element on a near-white lavender background with deep indigo type. CHORD takes this exact visual language — gradient-as-content — and applies it to a functional music product.

**Kunsthalle Basel (kunsthallebasel.ch):** Minimal K logo, full-bleed photography, two-word nav (Menu, Visit). The institution disappears and the art fills the frame. CHORD applies the same principle: the UI chrome disappears and the gradient fills the frame.

**Idle Hour Matcha (idlehourmatcha.com):** Cream/warm off-white editorial. "The product IS the design." CHORD's gradient panels achieve the same thing — each playlist has a visual identity without photography.

## Target Users

- **Intentional listeners** — people who think about what music they put on, not passive shufflers
- **Mood-aware workers** — use music deliberately: deep work vs creative vs commute vs sleep
- **Anti-algorithm rebels** — tired of algorithmic recommendation as the default, want deliberate selection

## Key Screens

1. **Mobile Home** — greeting, mood filter chips, 2-col trending gradient panels, recent 4-square row
2. **Mobile Player** — full-screen gradient fills top 55% behind minimal controls + queue preview
3. **Mobile Library** — playlists as gradient thumbnail list, clean editorial type
4. **Mobile Discover** — editorial layout: large hero mood panels + 6-mood grid + "For You Today"
5. **Mobile Search** — mood-sorted search with 6-panel browse grid
6. **Desktop Home** — sidebar nav with mood color dots + main feed + right-rail now-playing panel
7. **Desktop Discover** — editorial 55% hero panel + Kunsthalle-style copy + 6-mood strip + new arrivals
8. **Desktop Full Player** — split: full-screen gradient left 50%, waveform progress + queue right
9. **Desktop Library** — 4-col gradient panel grid + empty "new playlist" slot
10. **Desktop Queue + Mood Analysis** — queue list + mood breakdown bars + energy arc chart
`;

function renderElSVG(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x||0, y = el.y||0;
  const w = Math.max(0,el.width||0), h = Math.max(0,el.height||0);
  const fill = el.fill||'none';
  const oAttr = (el.opacity!==undefined&&el.opacity<0.99)?` opacity="${el.opacity.toFixed(2)}"`:'';
  const rAttr = el.cornerRadius?` rx="${Math.min(el.cornerRadius,Math.max(1,w/2),Math.max(1,h/2))}"`: '';
  if (el.type==='frame') {
    const bg=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids=(el.children||[]).map(c=>renderElSVG(c,depth+1)).join('');
    if(!kids) return bg;
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type==='text') {
    const fh=Math.max(1,Math.min(h||(el.fontSize||13)*0.8,(el.fontSize||13)*0.7));
    return `<rect x="${x}" y="${y+((h||fh)-fh)/2}" width="${w||60}" height="${fh}" fill="${fill}"${oAttr} rx="1"/>`;
  }
  if(w>0&&h>0) return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw=screen.width, sh=screen.height;
  const kids=(screen.children||[]).map(c=>renderElSVG(c,0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill||BG}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  if(!md) return '';
  return md
    .replace(/^## (.+)$/gm,'<h3>$1</h3>')
    .replace(/^- \*\*(.+?)\*\*[—:] (.+)$/gm,'<li><strong>$1</strong>: $2</li>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n\n/g,'</p><p>');
}

function zenPost(slug,title,html,subdomain) {
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({title,html});
    const headers={'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)};
    if(subdomain) headers['X-Subdomain']=subdomain;
    const req=https.request({hostname:'zenbin.org',path:`/v1/pages/${slug}`,method:'POST',headers},
      res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}));});
    req.on('error',reject);req.write(body);req.end();
  });
}

function buildHeroHTML(doc, penJsonStr) {
  const screens=doc.children||[];
  const THUMB_H=180;
  const labels=['Home','Player','Library','Discover','Search','Home','Discover','Player','Library','Queue'];
  const thumbsHTML=screens.map((s,i)=>{
    const tw=Math.round(THUMB_H*(s.width/s.height));
    const isMobile=s.width<500;
    const label=`${isMobile?'M':'D'} · ${labels[i]||''}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s,tw,THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;color:${INK};font-family:monospace">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches=[
    {hex:BG,       role:'VOID'},
    {hex:'#EDEAF4', role:'SURFACE'},
    {hex:INK,       role:'INK'},
    {hex:RULE,      role:'RULE'},
    ...Object.entries(MOODS).map(([k,[c1,c2]])=>({hex:c1,role:k.toUpperCase(),c2})),
  ];
  const swatchHTML=swatches.map(sw=>`
    <div style="flex:1;min-width:60px">
      <div style="height:44px;border-radius:6px;background:${sw.c2?`linear-gradient(135deg,${sw.hex},${sw.c2})`:sw.hex};border:1px solid ${RULE};margin-bottom:6px"></div>
      <div style="font-size:9px;letter-spacing:1.2px;opacity:.5;margin-bottom:2px;color:${INK}">${sw.role}</div>
      <div style="font-size:10px;font-weight:600;color:${INK};opacity:.7">${sw.hex}</div>
    </div>`).join('');

  // Mood chord demos
  const chordsHTML=Object.entries(MOODS).map(([key,[c1,c2]])=>{
    const label=key.charAt(0).toUpperCase()+key.slice(1);
    return `<div style="flex:1;min-width:80px;border-radius:8px;height:60px;background:linear-gradient(135deg,${c1},${c2});display:flex;align-items:flex-end;padding:8px 10px">
      <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.5px">${label.toUpperCase()}</span>
    </div>`;
  }).join('');

  const cssTokens=`:root {
  /* CHORD — Music Discovery · RAM Heartbeat #13 */

  /* Palette — off-white lavender + deep indigo */
  --color-bg:      #F5F3F8;   /* Stripe Sessions near-white lavender */
  --color-surface: #EDEAF4;
  --color-raised:  #E4E0F0;
  --color-ink:     #180A44;   /* deep midnight indigo */
  --color-muted:   #8880A6;
  --color-faint:   #C4BFD8;
  --color-rule:    #D4CFE6;

  /* Mood Chords — gradient pairs */
  --chord-focus-1:  #2563EB;  --chord-focus-2:  #06B6D4;
  --chord-energy-1: #F97316;  --chord-energy-2: #EF4444;
  --chord-flow-1:   #F59E0B;  --chord-flow-2:   #FBBF24;
  --chord-dream-1:  #8B5CF6;  --chord-dream-2:  #EC4899;
  --chord-ground-1: #10B981;  --chord-ground-2: #065F46;
  --chord-pulse-1:  #F43F5E;  --chord-pulse-2:  #A855F7;

  /* Chord panel usage */
  --chord-panel: linear-gradient(135deg, var(--chord-*-1), var(--chord-*-2));
  /* Replace * with mood name */

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 32px; --space-6: 48px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-pill: 999px;

  /* Shadows — soft, on light bg */
  --shadow-card: 0 2px 12px rgba(24,10,68,0.06);
  --shadow-panel: 0 8px 32px rgba(24,10,68,0.10);
}`;

  const encoded=Buffer.from(penJsonStr).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CHORD — Music Discovery · RAM Design Studio</title>
<meta name="description" content="Music discovery where playlists are gradient panels. Off-white lavender × deep midnight indigo × 6 mood chords. 10 screens.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${BG};color:${INK};font-family:'SF Pro Text','Inter',system-ui,sans-serif;min-height:100vh}
nav{padding:20px 40px;border-bottom:1px solid ${RULE};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.logo{font-size:14px;font-weight:700;letter-spacing:4px;color:#8880A6}
.nav-right{display:flex;align-items:center;gap:20px}
.nav-id{font-size:11px;color:${RULE};letter-spacing:1px;font-family:monospace}
.hb-badge{font-size:9px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:4px;background:${MOODS.dream[0]}18;color:${MOODS.dream[0]};border:1px solid ${MOODS.dream[0]}33}
.hero{padding:80px 40px 40px;max-width:960px}
.tag{font-size:10px;letter-spacing:3px;color:${MOODS.dream[0]};margin-bottom:20px;font-weight:700}
h1{font-size:clamp(56px,10vw,104px);font-weight:700;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${INK}}
.h1-accent{background:linear-gradient(135deg,${MOODS.dream[0]},${MOODS.dream[1]});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{font-size:15px;color:${INK};opacity:.45;max-width:500px;line-height:1.7;margin-bottom:32px;font-weight:300}
.meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
.meta-item span{display:block;font-size:10px;opacity:.35;letter-spacing:1px;margin-bottom:4px}
.meta-item strong{color:${MOODS.dream[0]}}
.chords-demo{display:flex;gap:8px;margin-bottom:44px;flex-wrap:wrap}
.actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
.btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px}
.btn-p{background:${INK};color:${BG}}
.btn-p:hover{opacity:.85}
.btn-s{background:transparent;color:${INK};border:1px solid ${RULE}}
.btn-s:hover{border-color:${MOODS.dream[0]}66}
.section-label{font-size:10px;letter-spacing:3px;color:${MOODS.dream[0]};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${RULE};font-weight:700}
.preview{padding:0 40px 80px}
.thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
.thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-thumb{background:${MOODS.dream[0]}44;border-radius:2px}
.brand-section{padding:60px 40px;border-top:1px solid ${RULE};max-width:1000px}
.brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
@media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
.swatches{display:flex;gap:8px;flex-wrap:wrap}
.type-row{padding:14px 0;border-bottom:1px solid ${RULE}}
.tokens-block{background:#EDEAF4;border:1px solid ${RULE};border-radius:8px;padding:20px;margin-top:24px;position:relative}
.tokens-pre{font-size:11px;line-height:1.7;color:${INK};opacity:.65;white-space:pre;overflow-x:auto;font-family:monospace}
.copy-btn{position:absolute;top:12px;right:12px;background:${MOODS.dream[0]}18;border:1px solid ${MOODS.dream[0]}33;color:${MOODS.dream[0]};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
.prd-section{padding:40px;border-top:1px solid ${RULE};max-width:780px}
.prd-section h3{font-size:10px;letter-spacing:2px;color:${MOODS.dream[0]};margin:28px 0 10px;font-weight:700}
.prd-section h3:first-child{margin-top:0}
.prd-section p,.prd-section li{font-size:14px;opacity:.55;line-height:1.75;max-width:680px}
.prd-section ul{padding-left:18px;margin:6px 0}.prd-section li{margin-bottom:4px}
.prd-section strong{opacity:1;color:${INK}}
.insp-section{padding:40px;border-top:1px solid ${RULE};max-width:900px}
.insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.insp-card{background:#EDEAF4;border:1px solid ${RULE};border-radius:8px;padding:16px 20px}
.insp-site{font-size:9px;letter-spacing:1.5px;color:${MOODS.dream[0]};margin-bottom:6px;font-weight:700}
.insp-note{font-size:12px;color:#8880A6;line-height:1.6}
footer{padding:28px 40px;border-top:1px solid ${RULE};font-size:11px;opacity:.35;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.toast{position:fixed;bottom:24px;right:24px;background:${INK};color:${BG};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
.toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-right">
    <div class="hb-badge">HEARTBEAT #13 · MUSIC</div>
    <div class="nav-id">${sub.id}</div>
  </div>
</nav>

<section class="hero">
  <div class="tag">MUSIC · NO ALBUM ART · GRADIENT PANELS · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>CHO<span class="h1-accent">RD</span></h1>
  <p class="sub">Music discovery where playlists are gradient panels. No album art. Each mood is a colour chord — a diagonal gradient pair encoding the emotional temperature of the music.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>LAVENDER × MIDNIGHT INDIGO</strong></div>
    <div class="meta-item"><span>MOODS</span><strong>6 GRADIENT CHORDS</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>STRIPE SESSIONS 2026</strong></div>
  </div>
  <div style="margin-bottom:12px;font-size:10px;letter-spacing:2px;opacity:.4">6 MOOD CHORDS</div>
  <div class="chords-demo">${chordsHTML}</div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyTokens()">⌘ Copy CSS Tokens</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/feedback?design=chord">↺ Request Refactor</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE + 5 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px">PALETTE — BASE + 6 CHORDS</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:0">TYPE SCALE</div>
      ${[
        {label:'DISPLAY', size:'clamp(56px,10vw,104px)', w:'700', sample:'CHORD'},
        {label:'HEADING', size:'20px', w:'700', sample:'Good evening, Aiko'},
        {label:'BODY',    size:'14px', w:'400', sample:'Music that slows time down.'},
        {label:'CAPTION', size:'10px', w:'400', sample:'MOOD DISTRIBUTION · 68% DREAM'},
        {label:'MONO',    size:'8px',  w:'400', sample:'MOOD DISTRIBUTION · 14 TRACKS', mono:true},
      ].map(t=>`<div class="type-row">
        <div style="font-size:9px;letter-spacing:2px;opacity:.3;margin-bottom:6px">${t.label} · ${t.size} / ${t.w}</div>
        <div style="font-size:${t.size};font-weight:${t.w};color:${INK};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;${t.mono?'font-family:monospace':''}">${t.sample}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${[
        'No album art — the gradient IS the playlist identity. Emotional temperature encoded in colour.',
        'Light-mode by default — off-white lavender counters the dark-mode dominance in music apps.',
        'Mood-first navigation — you don\'t search for songs, you choose a state of mind.',
        'Editorial chrome — near-invisible UI, content fills the frame (Kunsthalle Basel principle).',
      ].map((p,i)=>`<div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start">
        <div style="color:${MOODS.dream[0]};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i+1).padStart(2,'0')}</div>
        <div style="font-size:13px;opacity:.55;line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px">SPACING · 4PX GRID</div>
      ${[4,8,16,24,32,48,64].map(sp=>`<div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
        <div style="font-size:10px;opacity:.3;width:32px;flex-shrink:0">${sp}px</div>
        <div style="height:6px;border-radius:3px;background:linear-gradient(90deg,${MOODS.dream[0]},${MOODS.dream[1]});width:${sp*2}px;opacity:.5"></div>
      </div>`).join('')}
    </div>
  </div>
  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="insp-section">
  <div class="section-label">RESEARCH SOURCES · HEARTBEAT #13</div>
  <div class="insp-grid">
    <div class="insp-card">
      <div class="insp-site">STRIPE SESSIONS 2026 — GODLY.WEBSITE</div>
      <p class="insp-note">Primary visual reference. Diagonal chromatic gradient panels (orange→gold→pink→purple) on near-white lavender background with deep indigo display type. CHORD takes this gradient-as-content language and applies it to every playlist in the app.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">KUNSTHALLE BASEL — SITEINSPIRE</div>
      <p class="insp-note">Full-bleed content, near-invisible chrome. Two-word nav (Menu, Visit). The institution disappears and the art fills the frame. CHORD applies the same principle: the UI chrome vanishes and the gradient panel IS the content.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">IDLE HOUR MATCHA — SITEINSPIRE</div>
      <p class="insp-note">Warm cream editorial, product photography IS the design. Minimal chrome around rich visual content. Confirmed the "off-white light-mode with minimal nav" direction as viable for a consumer product, not just agency/brand sites.</p>
    </div>
  </div>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${mdToHtml(prdMarkdown)}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #13 · Music · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
  <a href="https://ram.zenbin.org/" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org</a>
</footer>

<script>
const D=${JSON.stringify(Buffer.from(penJsonStr).toString('base64'))};
const CSS_TOKENS=${JSON.stringify(cssTokens)};
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function openInViewer(){
  try{const jsonStr=atob(D);JSON.parse(jsonStr);
    localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'chord.pen'}));
    window.open('https://zenbin.org/p/pen-viewer-3','_blank');
  }catch(e){alert('Could not load: '+e.message);}
}
function downloadPen(){
  try{const blob=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='chord.pen';a.click();URL.revokeObjectURL(a.href);
  }catch(e){alert('Failed: '+e.message);}
}
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
  const viewerPath=path.join(__dirname,'penviewer-app.html');
  let html=fs.readFileSync(viewerPath,'utf8');
  const injection=`<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};<\/script>`;
  return html.replace('<script>',injection+'\n<script>');
}

async function main() {
  console.log('♩ CHORD — Full Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const penPath=path.join(__dirname,'chord.pen');
  if(!fs.existsSync(penPath)){console.error('✗ chord.pen not found'); process.exit(1);}
  const penJsonStr=fs.readFileSync(penPath,'utf8');
  const doc=JSON.parse(penJsonStr);
  console.log(`✓ Loaded chord.pen — ${(doc.children||[]).length} screens`);

  console.log('\n📤 Publishing hero → ram.zenbin.org/chord...');
  const heroHtml=buildHeroHTML(doc,penJsonStr);
  const heroRes=await zenPost('chord','CHORD — Music Discovery · RAM Design Studio',heroHtml,'ram');
  console.log(`  HTTP ${heroRes.status} — ${heroRes.status===200||heroRes.status===201?'✅ Published':'❌ Failed'}`);

  console.log('\n📤 Publishing viewer → ram.zenbin.org/chord-viewer...');
  const viewerHtml=buildViewerHTML(penJsonStr);
  const viewerRes=await zenPost('chord-viewer','CHORD Viewer',viewerHtml,'ram');
  console.log(`  HTTP ${viewerRes.status} — ${viewerRes.status===200||viewerRes.status===201?'✅ Published':'❌ Failed'}`);

  console.log('\n✅ CHORD live:');
  console.log('   Hero:   https://ram.zenbin.org/chord');
  console.log('   Viewer: https://ram.zenbin.org/chord-viewer');

  // Gallery registry
  const CONFIG_PATH=path.join(__dirname,'community-config.json');
  let config={};
  try{config=JSON.parse(fs.readFileSync(CONFIG_PATH,'utf8'));}catch{}
  const TOKEN=process.env.GITHUB_TOKEN||config.GITHUB_TOKEN||'';
  const REPO=process.env.GITHUB_REPO||config.GITHUB_REPO||'';
  if(TOKEN&&REPO){
    console.log('\n📋 Updating gallery registry...');
    try{
      const getRes=await new Promise((resolve,reject)=>{
        const req=https.request({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,
          headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-studio/1.0','Accept':'application/vnd.github.v3+json'}
        },res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}));});
        req.on('error',reject);req.end();
      });
      if(getRes.status===200){
        const fd=JSON.parse(getRes.body);
        const queue=JSON.parse(Buffer.from(fd.content,'base64').toString('utf8'));
        const entry={id:sub.id,prompt:sub.prompt,app_type:'music',credit:'RAM Studio',
          submitted_at:sub.submitted_at,status:'done',app_name:'CHORD',archetype:'music',
          design_url:'https://ram.zenbin.org/chord',viewer_url:'https://ram.zenbin.org/chord-viewer',
          published_at:new Date().toISOString()};
        const existing=(queue.submissions||[]).findIndex(s=>s.id===sub.id);
        if(existing>=0) queue.submissions[existing]=entry;
        else (queue.submissions=queue.submissions||[]).push(entry);
        queue.updated_at=new Date().toISOString();
        const content=Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
        const putBody=JSON.stringify({message:'add: CHORD — music discovery with gradient panels',content,sha:fd.sha});
        const putRes=await new Promise((resolve,reject)=>{
          const req=https.request({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
            headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-studio/1.0','Content-Type':'application/json',
            'Content-Length':Buffer.byteLength(putBody),'Accept':'application/vnd.github.v3+json'}
          },res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}));});
          req.on('error',reject);req.write(putBody);req.end();
        });
        console.log(`  Gallery registry: HTTP ${putRes.status} ${putRes.status===200?'✅':'❌'}`);
      }
    }catch(err){console.warn(`  ⚠ Gallery skipped: ${err.message}`);}
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Done.');
}

main().catch(err=>{console.error('Fatal:',err.message);process.exit(1);});
