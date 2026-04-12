#!/usr/bin/env node
// publish-signal.js — Full Design Discovery pipeline for SIGNAL
// Social app with chat feed DNA — unique chartreuse + warm near-black palette

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const sub = {
  id:           'hb-signal-' + Date.now(),
  prompt:       'SIGNAL — High-signal social platform with chat feed DNA. Anti-algorithmic, chronological, dense. Chat-like thread dynamics with inline reply chains and thread connector lines. Mixed image+text feed cards. Unique palette: warm near-black #0E0F0F + electric chartreuse #C8FF00 + hot coral #FF5C38 + ice cyan #38D1E8. Signal heat meters on every post.',
  app_type:     'social',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const C = {
  bg:     '#0E0F0F',
  chart:  '#C8FF00',
  coral:  '#FF5C38',
  ice:    '#38D1E8',
  text:   '#E8E8E5',
  muted:  '#7A7A76',
  surface:'#161818',
};

const prdMarkdown = `
## Overview

SIGNAL is a social platform built for high-signal people. The thesis: chronological order, no algorithm, dense information, and chat-like thread dynamics that make every conversation feel like a room you're actually in.

The design is a direct reaction to generic social apps — the palette uses electric chartreuse (#C8FF00) and warm near-black (#0E0F0F), a combination that has never appeared in a mainstream social app. It reads like a terminal cursor or a radio signal indicator: utility, not entertainment.

## The Spark

Every post in SIGNAL displays a "Signal Meter" — a live heat bar showing how much conversation is happening around it. High engagement = bright chartreuse bar. Low engagement = dim. The feed self-organises around what's actually resonating, without an algorithm deciding for you.

Thread replies use a visual connector line (the "wire") — a thin chartreuse line on the left side showing the conversation tree at a glance. Like IRC meets Twitter, rendered in 2026.

## Target Users

- **Founders and builders** — want signal without noise, Reddit without chaos, Twitter without the algorithm
- **Crypto/web3 natives** — familiar with the AO/Arweave permanence concept, want a social layer that matches
- **High-signal communities** — design, engineering, startups — people who think about what they post

## Core Features

- **Anti-algorithmic feed** — chronological, with channel filtering (like Discord channels but in a unified feed)
- **Signal meters** — every post shows its engagement heat as a small bar. You see what's resonating before you read it
- **Chat thread dynamics** — inline reply chains with visual connector lines, nested replies, no click-to-expand
- **Channel system** — #design, #builds, #crypto, #irl — subscribe to channels, filter feed by them
- **Compose with signal strength** — real-time signal quality indicator as you write, based on clarity and engagement patterns
- **Signal heatmap** — explore screen shows trending topics as a bubble map, sized by activity

## Design Language

**Warm near-black** — background is #0E0F0F, not #000000 or #111827. The warmth in the near-black is critical — it avoids the cold blue-gray of Discord/Twitter and the flat black of dark-mode fatigue.

**Electric chartreuse** — #C8FF00 is the primary accent. Used for: online indicators, signal meters, active states, compose button, CTA. No social app uses chartreuse. It reads like a signal light, a terminal cursor, a frequency indicator. Industrial utility.

**Heat metaphor** — chartreuse for high signal (bright, active), coral for trending/alerts, ice for links/mentions. The palette is a radio spectrum: signal, noise, interference.

**Chat thread wires** — thin 2px chartreuse connector lines showing reply depth. Borrowed from IRC and terminal chat interfaces, applied to a modern social feed.

## Key Screens

1. **Mobile Feed** — channel pill filter row, mixed image+text cards with signal meters, live badge for active posters
2. **Mobile Thread** — original post with full signal meter, threaded replies with connector lines, reply input
3. **Mobile Profile** — cover grid texture, stats row, post grid
4. **Mobile Compose** — real-time signal strength meter, attachment preview, keyboard
5. **Mobile Channels** — channel list with unread counts, discover trending channels with HOT badge
6. **Desktop Home** — 3-column: sidebar nav + main feed + trending signals + who to follow
7. **Desktop Thread** — expanded thread with related signals panel
8. **Desktop Profile** — cover with grid texture, bento-style post grid
9. **Desktop Explore** — live signal heatmap bubble visualisation + trending grid
10. **Desktop Compose** — full compose modal with signal strength, channel selector, audience picker
`;

// ── SVG renderer (same as other publish scripts) ─────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, Math.max(1,w/2), Math.max(1,h/2))}"` : '';
  if (el.type === 'frame') {
    const bg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    if (!kids) return bg;
    return `${bg}<g transform="translate(${x},${y})">${kids}</g>`;
  }
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h||10, (el.fontSize || 13) * 0.7));
    return `<rect x="${x}" y="${y + ((h||10)-fh)/2}" width="${w||50}" height="${fh}" fill="${fill}"${oAttr} rx="1"/>`;
  }
  if (w > 0 && h > 0) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.width, sh = screen.height;
  const kids = (screen.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill||C.bg}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm,'<h3>$1</h3>')
    .replace(/^- \*\*(.+?)\*\*: (.+)$/gm,'<li><strong>$1</strong>: $2</li>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n\n/g,'</p><p>');
}

function zenPost(slug, title, html, subdomain) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const headers = { 'Content-Type':'application/json','Content-Length':Buffer.byteLength(body) };
    if (subdomain) headers['X-Subdomain'] = subdomain;
    const req = https.request({
      hostname:'zenbin.org', path:`/v1/pages/${slug}`, method:'POST', headers,
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
    req.on('error',reject); req.write(body); req.end();
  });
}

function buildHeroHTML(doc, penJsonStr) {
  const screens = doc.children || [];
  const THUMB_H = 180;
  const labels  = ['Feed','Thread','Profile','Compose','Channels','Home','Thread','Profile','Explore','Compose'];
  const thumbsHTML = screens.map((s,i) => {
    const tw = Math.round(THUMB_H * (s.width / s.height));
    const isMobile = s.width < 500;
    const label = `${isMobile ? 'M' : 'D'} · ${labels[i]||''}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s,tw,THUMB_H)}
      <div style="font-size:9px;opacity:.35;margin-top:8px;letter-spacing:1px;color:${C.chart};font-family:monospace">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    {hex:C.bg,    role:'VOID'},
    {hex:'#161818',role:'SURFACE'},
    {hex:C.text,  role:'TEXT'},
    {hex:C.chart, role:'SIGNAL'},
    {hex:C.coral, role:'ALERT'},
    {hex:C.ice,   role:'LINK'},
    {hex:C.muted, role:'MUTED'},
    {hex:'#272A2A',role:'BORDER'},
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:72px">
      <div style="height:48px;border-radius:6px;background:${sw.hex};border:1px solid #272A2A;margin-bottom:8px"></div>
      <div style="font-size:9px;letter-spacing:1.5px;opacity:.4;margin-bottom:3px;color:${C.text};font-family:monospace">${sw.role}</div>
      <div style="font-size:11px;font-weight:600;color:${C.chart};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* SIGNAL — High-Signal Social · RAM Design Studio */

  /* Color — warm near-black + chartreuse signal */
  --color-bg:       #0E0F0F;   /* warm near-black — NOT cool gray */
  --color-surface:  #161818;   /* card surface */
  --color-raised:   #1E2020;   /* elevated elements */
  --color-border:   #272A2A;   /* hairline */
  --color-signal:   #C8FF00;   /* electric chartreuse — primary */
  --color-signal-dim: #8AB800; /* dimmed chartreuse */
  --color-alert:    #FF5C38;   /* hot coral — trending/alerts */
  --color-link:     #38D1E8;   /* ice cyan — mentions/links */
  --color-text:     #E8E8E5;   /* warm near-white */
  --color-muted:    #7A7A76;   /* warm gray */
  --color-faint:    #3A3D3D;   /* placeholder */

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* Mono used for: signal meters, timestamps, channel tags, system labels */
  /* Sans used for: post body, names, UI copy */

  /* Weights */
  --weight-normal: 400;
  --weight-bold:   700;

  /* Spacing (4px grid) */
  --space-1: 4px;  --space-2: 8px;   --space-3: 16px;
  --space-4: 24px; --space-5: 32px;  --space-6: 48px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 12px; --radius-pill: 999px;

  /* Signal meter — use as a bar, sized by engagement % */
  --signal-bar-bg: #272A2A;
  --signal-bar-fill: rgba(200, 255, 0, 0.5);  /* C8FF00 at 50% */
  --signal-bar-height: 4px;
  --signal-bar-radius: 2px;
}`;

  const encoded = Buffer.from(penJsonStr).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SIGNAL — High-Signal Social · RAM Design Studio</title>
<meta name="description" content="Anti-algorithmic social with chat feed DNA. Electric chartreuse + warm near-black. 10 screens.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${C.bg};color:${C.text};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
nav{padding:20px 40px;border-bottom:1px solid #272A2A;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.logo{font-size:14px;font-weight:700;letter-spacing:4px;color:${C.muted}}
.nav-right{display:flex;align-items:center;gap:20px}
.nav-id{font-size:11px;color:#3A3D3D;letter-spacing:1px}
.hb-badge{font-size:9px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:4px;background:${C.chart}22;color:${C.chart};border:1px solid ${C.chart}44}
.hero{padding:80px 40px 40px;max-width:900px}
.tag{font-size:10px;letter-spacing:3px;color:${C.chart};margin-bottom:20px;font-weight:700}
h1{font-size:clamp(48px,10vw,96px);font-weight:700;letter-spacing:-2px;line-height:1;margin-bottom:16px;color:${C.text}}
.h1-accent{color:${C.chart}}
.sub{font-size:15px;opacity:.5;max-width:480px;line-height:1.7;margin-bottom:32px}
.meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
.meta-item span{display:block;font-size:10px;opacity:.35;letter-spacing:1px;margin-bottom:4px}
.meta-item strong{color:${C.chart}}
.actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
.btn{padding:11px 22px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px}
.btn-p{background:${C.chart};color:${C.bg}}
.btn-p:hover{opacity:0.88}
.btn-s{background:transparent;color:${C.text};border:1px solid #272A2A}
.btn-s:hover{border-color:${C.chart}44;color:${C.chart}}
.section-label{font-size:10px;letter-spacing:3px;color:${C.chart};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid #272A2A;font-weight:700}
.preview{padding:0 40px 80px}
.thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
.thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-thumb{background:${C.chart}44;border-radius:2px}
.brand-section{padding:60px 40px;border-top:1px solid #272A2A;max-width:1000px}
.brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
@media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
.swatches{display:flex;gap:10px;flex-wrap:wrap}
.type-row{padding:14px 0;border-bottom:1px solid #272A2A}
.tokens-block{background:#161818;border:1px solid #272A2A;border-radius:8px;padding:20px;margin-top:24px;position:relative}
.tokens-pre{font-size:11px;line-height:1.7;color:${C.chart};opacity:0.7;white-space:pre;overflow-x:auto;font-family:inherit}
.copy-btn{position:absolute;top:12px;right:12px;background:${C.chart}22;border:1px solid ${C.chart}44;color:${C.chart};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
.prd-section{padding:40px;border-top:1px solid #272A2A;max-width:780px}
.prd-section h3{font-size:10px;letter-spacing:2px;color:${C.chart};margin:28px 0 10px;font-weight:700}
.prd-section h3:first-child{margin-top:0}
.prd-section p,.prd-section li{font-size:14px;opacity:.55;line-height:1.75;max-width:680px}
.prd-section ul{padding-left:18px;margin:6px 0}
.prd-section li{margin-bottom:4px}
.prd-section strong{opacity:1;color:${C.text}}
.insp-section{padding:40px;border-top:1px solid #272A2A;max-width:900px}
.insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.insp-card{background:#161818;border:1px solid #272A2A;border-radius:8px;padding:16px 20px}
.insp-site{font-size:9px;letter-spacing:1.5px;color:${C.chart};margin-bottom:6px;font-weight:700}
.insp-note{font-size:12px;color:${C.muted};line-height:1.6}
footer{padding:28px 40px;border-top:1px solid #272A2A;font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.toast{position:fixed;bottom:24px;right:24px;background:${C.chart};color:${C.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
.toast.show{transform:translateY(0);opacity:1}
/* Signal meter preview */
.sig-demo{display:flex;align-items:center;gap:12px;margin:8px 0}
.sig-bar{height:4px;border-radius:2px;background:#272A2A;flex:1}
.sig-fill{height:4px;border-radius:2px;background:${C.chart}88}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-right">
    <div class="hb-badge">SOCIAL · CHAT FEED DNA</div>
    <div class="nav-id">${sub.id}</div>
  </div>
</nav>

<section class="hero">
  <div class="tag">SOCIAL · ANTI-ALGORITHMIC · CHAT FEED DYNAMICS · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>SIG<span class="h1-accent">NAL</span></h1>
  <p class="sub">High-signal social with chat feed DNA. Chronological, dense, permanent. No algorithm. Electric chartreuse on warm near-black — a palette no social app has touched.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>PRIMARY ACCENT</span><strong>#C8FF00 CHARTREUSE</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>SOCIAL / COMMUNITY</strong></div>
    <div class="meta-item"><span>SPARK</span><strong>SIGNAL HEAT METERS</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyTokens()">⌘ Copy CSS Tokens</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/feedback?design=signal">↺ Request Refactor</a>
  </div>

  <!-- Signal meter demo -->
  <div style="margin-bottom:32px;max-width:360px">
    <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:12px">SIGNAL METER — LIVE ENGAGEMENT HEAT</div>
    <div class="sig-demo"><span style="font-size:9px;opacity:.4;width:60px">#AO-compute</span><div class="sig-bar"><div class="sig-fill" style="width:88%"></div></div><span style="font-size:9px;color:${C.chart}">88%</span></div>
    <div class="sig-demo"><span style="font-size:9px;opacity:.4;width:60px">#design</span><div class="sig-bar"><div class="sig-fill" style="width:72%"></div></div><span style="font-size:9px;color:${C.chart}">72%</span></div>
    <div class="sig-demo"><span style="font-size:9px;opacity:.4;width:60px">#builds</span><div class="sig-bar"><div class="sig-fill" style="width:41%"></div></div><span style="font-size:9px;color:${C.chart};opacity:.5">41%</span></div>
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
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px">COLOR PALETTE — 8 ROLES</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:0">TYPE — SANS + MONO PAIRING</div>
      ${[
        {label:'BODY',    font:'Inter',          size:'14px', sample:'The gap between "could ship" and "should ship"'},
        {label:'NAME',    font:'Inter Bold',     size:'13px', sample:'Aiko Kato'},
        {label:'CHANNEL', font:'Inter',          size:'11px', sample:'#design · #builds · #crypto'},
        {label:'SIGNAL',  font:'JetBrains Mono', size:'9px',  sample:'78% SIGNAL STRENGTH'},
        {label:'SYSTEM',  font:'JetBrains Mono', size:'8px',  sample:'SIG · HOT · LIVE · 2m ago'},
      ].map(t=>`<div class="type-row">
        <div style="font-size:9px;letter-spacing:2px;opacity:.3;margin-bottom:6px">${t.label} · ${t.font} · ${t.size}</div>
        <div style="font-size:${t.size};color:${C.text};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${[
        'Warm near-black, not cool gray — #0E0F0F has warmth. The 3-unit temperature difference matters.',
        'Chartreuse is signal — #C8FF00 is used exclusively for live states. If it glows chartreuse, it\'s active.',
        'Thread wires show depth — 2px connector lines reveal conversation structure at a glance.',
        'Heat before hierarchy — signal meters let you scan before you read. Engagement is metadata.',
      ].map((p,i)=>`<div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start">
        <div style="color:${C.chart};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i+1).padStart(2,'0')}</div>
        <div style="font-size:13px;opacity:.55;line-height:1.6">${p}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.35;margin-bottom:16px">SPACING · 4PX GRID</div>
      ${[4,8,16,24,32,48].map(sp=>`<div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
        <div style="font-size:10px;opacity:.3;width:32px;flex-shrink:0">${sp}px</div>
        <div style="height:4px;border-radius:2px;background:${C.chart};width:${sp*2}px;opacity:0.5"></div>
      </div>`).join('')}
    </div>
  </div>
  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="insp-section">
  <div class="section-label">RESEARCH SOURCES</div>
  <div class="insp-grid">
    <div class="insp-card">
      <div class="insp-site">HYPERBEAM.AR.IO</div>
      <p class="insp-note">Frontier/permaweb ideology — "planting a stake in digital territory." Chroma-space aesthetic. The irreverent footer copy ("lol jk in cyberspace") signals a crypto-native subculture that doesn't sanitise itself. SIGNAL channels this energy.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">AO.AR.IO</div>
      <p class="insp-note">Polar opposite of HyperBEAM — extreme restraint, near-white #F7F7F8, precision loading states. Counter-cultural light-mode in a dark-mode world. Showed me that the detail level (150ms fade-in) is what separates craft from noise.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">LIGHTFIELD.APP + GOOGLE STITCH</div>
      <p class="insp-note">Lightfield: AI-native CRM with editorial minimalism. Google Stitch (dropped today): vibe design partner with AI-native canvas. Both show that "AI-native" is the new default — SIGNAL's signal meter is AI-native UX baked into the social feed.</p>
    </div>
  </div>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${mdToHtml(prdMarkdown)}
</section>

<footer>
  <span>RAM Design Studio · Social · Signal Heat Meters · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
  <a href="https://ram.zenbin.org/" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org</a>
</footer>

<script>
const D=${JSON.stringify(encoded)};
const CSS_TOKENS=${JSON.stringify(cssTokens)};
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function openInViewer(){
  try{const jsonStr=atob(D);JSON.parse(jsonStr);
    localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'signal.pen'}));
    window.open('https://zenbin.org/p/pen-viewer-3','_blank');
  }catch(e){alert('Could not load pen: '+e.message);}
}
function downloadPen(){
  try{const blob=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='signal.pen';a.click();URL.revokeObjectURL(a.href);
  }catch(e){alert('Download failed: '+e.message);}
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
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJsonStr)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

async function main() {
  console.log('📡 SIGNAL — Full Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const penPath = path.join(__dirname, 'signal.pen');
  if (!fs.existsSync(penPath)) { console.error('✗ signal.pen not found — run signal-app.js first'); process.exit(1); }

  const penJsonStr = fs.readFileSync(penPath,'utf8');
  const doc = JSON.parse(penJsonStr);
  console.log(`✓ Loaded signal.pen — ${(doc.children||[]).length} screens`);

  console.log('\n📤 Publishing hero → ram.zenbin.org/signal...');
  const heroHtml = buildHeroHTML(doc, penJsonStr);
  const heroRes  = await zenPost('signal', 'SIGNAL — High-Signal Social · RAM Design Studio', heroHtml, 'ram');
  console.log(`  HTTP ${heroRes.status} — ${heroRes.status===200||heroRes.status===201?'✅ Published':'❌ Failed'}`);

  console.log('\n📤 Publishing viewer → ram.zenbin.org/signal-viewer...');
  const viewerHtml = buildViewerHTML(penJsonStr);
  const viewerRes  = await zenPost('signal-viewer','SIGNAL Viewer',viewerHtml,'ram');
  console.log(`  HTTP ${viewerRes.status} — ${viewerRes.status===200||viewerRes.status===201?'✅ Published':'❌ Failed'}`);

  console.log('\n✅ SIGNAL live:');
  console.log('   Hero:   https://ram.zenbin.org/signal');
  console.log('   Viewer: https://ram.zenbin.org/signal-viewer');

  // Gallery registry
  const CONFIG_PATH = path.join(__dirname,'community-config.json');
  let config = {};
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH,'utf8')); } catch {}
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN || config.GITHUB_TOKEN || '';
  const GITHUB_REPO  = process.env.GITHUB_REPO  || config.GITHUB_REPO  || '';
  if (GITHUB_TOKEN && GITHUB_REPO) {
    console.log('\n📋 Updating gallery registry...');
    try {
      const getRes = await new Promise((resolve,reject)=>{
        const req = https.request({hostname:'api.github.com',path:`/repos/${GITHUB_REPO}/contents/queue.json`,
          headers:{'Authorization':`token ${GITHUB_TOKEN}`,'User-Agent':'ram-studio/1.0','Accept':'application/vnd.github.v3+json'}
        },res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}));});
        req.on('error',reject);req.end();
      });
      if (getRes.status===200) {
        const fileData = JSON.parse(getRes.body);
        const queue = JSON.parse(Buffer.from(fileData.content,'base64').toString('utf8'));
        const entry = { id:sub.id,prompt:sub.prompt,app_type:'social',credit:'RAM Studio',
          submitted_at:sub.submitted_at,status:'done',app_name:'SIGNAL',archetype:'social',
          design_url:'https://ram.zenbin.org/signal',viewer_url:'https://ram.zenbin.org/signal-viewer',
          published_at:new Date().toISOString() };
        const existing=(queue.submissions||[]).findIndex(s=>s.id===sub.id);
        if(existing>=0) queue.submissions[existing]=entry;
        else (queue.submissions=queue.submissions||[]).push(entry);
        queue.updated_at=new Date().toISOString();
        const content=Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
        const putBody=JSON.stringify({message:'add: SIGNAL — high-signal social',content,sha:fileData.sha});
        const putRes=await new Promise((resolve,reject)=>{
          const req=https.request({hostname:'api.github.com',path:`/repos/${GITHUB_REPO}/contents/queue.json`,
            method:'PUT',headers:{'Authorization':`token ${GITHUB_TOKEN}`,'User-Agent':'ram-studio/1.0',
            'Content-Type':'application/json','Content-Length':Buffer.byteLength(putBody),'Accept':'application/vnd.github.v3+json'}
          },res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}));});
          req.on('error',reject);req.write(putBody);req.end();
        });
        console.log(`  Gallery registry: HTTP ${putRes.status} ${putRes.status===200?'✅':'❌'}`);
      }
    } catch(err) { console.warn(`  ⚠ Gallery update skipped: ${err.message}`); }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Done.');
}

main().catch(err=>{ console.error('Fatal:',err.message); process.exit(1); });
