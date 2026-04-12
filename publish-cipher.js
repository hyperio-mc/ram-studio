#!/usr/bin/env node
// publish-cipher.js — Full Design Discovery pipeline for CIPHER
// Generates hero page, viewer, pushes to gallery queue.

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Metadata ──────────────────────────────────────────────────────────────────
const sub = {
  id:           'hb-cipher-1742299200000',
  prompt:       'Design a dark-mode developer secrets & API key management SaaS — inspired by Evervault (godly.website #960) for the void-navy aesthetic and pill navigation, Linear (darkmodedesign.com) for cinematic dark surfaces, and the bento grid layouts trending on godly.website. 5 screens: Landing/Hero, Dashboard (bento grid), Secrets List, Key Detail (rotation timeline), Desktop Command Center (3-column split).',
  app_type:     'developer-tools',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const meta = {
  appName:   'CIPHER',
  tagline:   'Secrets, locked tight.',
  archetype: 'developer-tools',
  screens:   5,
  palette: {
    bg:      '#05070F',   // void indigo-black
    surface: '#0C1020',   // deep navy card
    fg:      '#E8EEFF',   // cool white
    accent:  '#5B7BFF',   // electric indigo
    accent2: '#8B5CF6',   // violet
    success: '#22C55E',
    warning: '#F59E0B',
    danger:  '#EF4444',
    muted:   '#5A6E99',
  },
};

const prdMarkdown = `
## Overview

CIPHER is a developer-first secrets management platform that brings security-grade API key management to teams who move fast. It's the control plane for every credential your stack touches — API keys, database URLs, webhook secrets, OAuth tokens — all encrypted, auditable, and rotation-ready.

Inspired aesthetically by Evervault's deep void-navy identity (as curated on godly.website) and Linear's cinematic dark-mode precision, CIPHER refuses the generic "developer tool" look. It reads as a security instrument, not a SaaS dashboard.

## Target Users

- **Solo developers** — managing credentials across 5–15 projects without a team secrets policy
- **Engineering leads** — enforcing rotation schedules and access controls for growing teams
- **Security-conscious startups** — achieving SOC 2 compliance without enterprise tooling overhead
- **DevOps engineers** — integrating secrets into CI/CD pipelines with audit trail requirements

## Core Features

- **Secrets vault** — encrypted storage for all credentials with monospace masked previews
- **Auto-rotation engine** — scheduled rotation with webhook triggers and zero-downtime swap
- **Permission scopes** — granular read/write permissions per key per service
- **Environment segmentation** — production / staging / dev namespacing with role-based access
- **Audit log** — immutable timestamped record of every access, rotation, and revocation
- **Team access control** — invite members, assign environments, limit scope exposure
- **Security score** — live risk assessment based on age, rotation frequency, and scope breadth

## Design Language

**Void navy depth** — backgrounds use #05070F, a near-black with deep indigo undertone. Cards sit at #0C1020, elevated panels at #111828. The hierarchy reads clearly without any grey midtones.

**Pill navigation** — the hero screen uses an Evervault-inspired pill nav bar (rounded 22px container) that floats above the content, creating a capsule-shaped identity anchor.

**Bento grid dashboard** — the dashboard screen uses an asymmetric bento layout with tiles of varying heights: a tall security score ring on the left, paired stat cards on the right, and a wide team tile spanning full width below.

**Monospace key previews** — all secret values use monospace type with masked middle sections. The prefix (sk_live_, psql://, SG.) is shown in electric indigo, the body is masked in grey, signalling structure without exposing value.

**Electric indigo accents** — #5B7BFF as the single primary accent. Violet #8B5CF6 as secondary. Status signals use semantic color: mint green for active, amber for expiring, red for revoked.

## Screen Architecture

1. **Landing / Hero** — pill nav, massive 60px display type, dual CTA (solid + ghost), trust strip, floating app preview card with live key list
2. **Dashboard** — bento grid: security score ring tile, active keys counter with sparkline, expiring-soon alert tile, team access tile, rotations + audit event stats, recent activity feed
3. **Secrets List** — search bar, environment filter pills, 8-item key list with monospace previews, status pills, timestamps
4. **Key Detail** — full key preview with copy, meta grid (created/expires/rotations), permission scope grid, rotation history timeline, action row (rotate/expire/revoke)
5. **Desktop Command Center** — 3-column split: sidebar nav with env tree and security score, 740px secrets table with column headers and row actions, 460px live detail panel with usage graph and rotation timeline
`;

// ── Helpers (from publish-grid.js) ────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';
  if (el.type === 'frame') {
    const bg   = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="${sw}" height="${sh}" fill="${screen.fill || '#05070F'}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  return md.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
    if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- ')).map(l =>
        `<li>${l.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`);
      return `<ul>${items.join('')}</ul>`;
    }
    return `<p>${block.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`;
  }).join('\n');
}

// ── Build hero HTML ────────────────────────────────────────────────────────────
function buildHeroHTML(pen) {
  const encoded = Buffer.from(JSON.stringify(pen)).toString('base64');
  const screens = pen.children || [];
  const P = meta.palette;

  const THUMB_H = 200;
  const thumbsHTML = screens.map((s, i) => {
    const tw    = Math.round(THUMB_H * (s.width / s.height));
    const label = s.name || `Screen ${i + 1}`;
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(s, tw, THUMB_H)}
      <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:monospace">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'VOID BG' },
    { hex: P.surface, role: 'SURFACE' },
    { hex: '#111828', role: 'ELEVATED' },
    { hex: '#1C2940', role: 'BORDER' },
    { hex: P.fg,      role: 'FOREGROUND' },
    { hex: P.muted,   role: 'MUTED' },
    { hex: P.accent,  role: 'INDIGO' },
    { hex: P.accent2, role: 'VIOLET' },
    { hex: P.success, role: 'SUCCESS' },
    { hex: P.warning, role: 'WARNING' },
    { hex: P.danger,  role: 'DANGER' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:60px;max-width:80px">
      <div style="height:44px;border-radius:6px;background:${sw.hex};border:1px solid ${P.accent}22;margin-bottom:6px"></div>
      <div style="font-size:8px;letter-spacing:1px;opacity:.45;margin-bottom:2px;font-family:monospace">${sw.role}</div>
      <div style="font-size:10px;font-weight:700;color:${P.accent};font-family:monospace">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label: 'DISPLAY',  size: '60px',  weight: '800', sample: 'CIPHER', mono: false },
    { label: 'HEADING',  size: '20px',  weight: '700', sample: 'Secrets, locked tight.', mono: false },
    { label: 'MONO BODY', size: '12px', weight: '400', sample: 'sk_live_9xBm3Kp••••••••••••••••••', mono: true },
    { label: 'CAPTION',  size: '9px',   weight: '600', sample: 'ACTIVE · PRODUCTION · 12H AGO', mono: false, ls: '1.5px' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${P.accent}22">
      <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px;font-family:monospace">${t.label} · ${t.size} / ${t.weight}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:${P.fg};font-family:${t.mono ? "monospace" : "system-ui, -apple-system, sans-serif"};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;letter-spacing:${t.ls||'normal'}">${t.sample}</div>
    </div>`).join('');

  const spacingHTML = [4, 8, 12, 16, 24, 32, 48, 64].map(sp => `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:9px;opacity:.4;width:32px;flex-shrink:0;font-family:monospace">${sp}px</div>
      <div style="height:6px;border-radius:3px;background:${P.accent};width:${sp * 2}px;opacity:0.7"></div>
    </div>`).join('');

  const principles = [
    'Void navy depth — not pure black, not grey. The #05070F background has deep indigo undertone that reads as premium darkness.',
    'Pill nav as identity — the floating pill navigation bar signals "this is not a normal tool" from the first screen.',
    'Bento asymmetry — the dashboard grid deliberately mixes tall/wide/narrow tiles to create visual hierarchy from data density alone.',
    'Monospace as trust signal — all credential values use monospace type. The format communicates precision, security, and technical authority.',
    'Status through color, not decoration — ACTIVE/EXPIRING/REVOKED states are mint/amber/red. No icons needed when color carries meaning.',
  ];
  const principlesHTML = principles.map((p, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
      <div style="color:${P.accent};font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* CIPHER — Color Tokens */
  --color-bg:         #05070F;   /* void indigo-black */
  --color-surface:    #0C1020;   /* deep navy card */
  --color-surface-2:  #111828;   /* elevated panel */
  --color-surface-3:  #162035;   /* lighter card */
  --color-border:     #1C2940;   /* hairline */
  --color-border-2:   #243350;   /* brighter edge */

  /* Text */
  --color-fg:         #E8EEFF;   /* cool white */
  --color-muted:      #5A6E99;   /* blue-grey */
  --color-mono:       #9EAECE;   /* code type */
  --color-key:        #C5D0FF;   /* key highlight */

  /* Accents */
  --color-accent:     #5B7BFF;   /* electric indigo — primary */
  --color-accent-dim: #5B7BFF22; /* glow fill */
  --color-violet:     #8B5CF6;   /* violet — secondary */

  /* Semantic status */
  --color-success:    #22C55E;   /* active / healthy */
  --color-warning:    #F59E0B;   /* expiring / needs attention */
  --color-danger:     #EF4444;   /* revoked / critical */

  /* Typography */
  --font-display:  system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono:     'SF Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  --text-display:  800 clamp(40px, 6vw, 60px) / 1 var(--font-display);
  --text-heading:  700 20px / 1.3 var(--font-display);
  --text-body:     400 14px / 1.6 var(--font-display);
  --text-mono:     400 12px / 1 var(--font-mono);
  --text-label:    600 9px / 1 var(--font-display);

  /* Spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;
  --space-7: 48px;  --space-8: 64px;

  /* Border radius */
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  20px;
  --radius-pill: 9999px;

  /* Elevation (box shadows) */
  --shadow-card: 0 1px 3px #00000066, inset 0 1px 0 #ffffff08;
  --shadow-glow: 0 0 32px #5B7BFF22;
}`;

  const prdHtml = mdToHtml(prdMarkdown);
  const dateStr = new Date(sub.submitted_at).toLocaleDateString('en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  const shareText = encodeURIComponent(
    'CIPHER — dark-mode developer secrets management SaaS. Void navy + bento grid + pill nav. 5 screens + brand spec + CSS tokens. By RAM Design Studio'
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CIPHER — Developer Secrets Management · RAM Design Studio</title>
<meta name="description" content="Secrets, locked tight. — Dark-mode developer secrets management SaaS. Void navy + bento grid + pill nav. 5 screens + brand spec + CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:system-ui,-apple-system,'Segoe UI',sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${P.accent}22;display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:13px;font-weight:800;letter-spacing:3px;font-family:monospace}
  .logo span{color:${P.accent}}
  .nav-id{font-size:10px;color:${P.muted};letter-spacing:1px;font-family:monospace}
  .hero{padding:80px 40px 40px;max-width:1000px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px;font-family:monospace;font-weight:600}
  h1{font-size:clamp(64px,11vw,120px);font-weight:800;letter-spacing:-3px;line-height:0.95;margin-bottom:16px;color:${P.fg}}
  h1 span{color:${P.accent}}
  .sub{font-size:20px;opacity:.45;max-width:500px;line-height:1.5;margin-bottom:36px}
  .meta{display:flex;gap:28px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:8px;opacity:.4;letter-spacing:2px;margin-bottom:4px;font-family:monospace}
  .meta-item strong{color:${P.accent};font-size:11px;font-family:monospace}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 22px;border-radius:22px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:8px;letter-spacing:.5px;transition:opacity .15s,transform .1s}
  .btn:hover{transform:translateY(-1px)}
  .btn-p{background:${P.accent};color:#fff}
  .btn-p:hover{opacity:.9}
  .btn-s{background:${P.accent}18;color:${P.fg};border:1px solid ${P.accent}44}
  .btn-s:hover{border-color:${P.accent}88;background:${P.accent}22}
  .btn-x{background:rgba(255,255,255,.05);color:${P.fg};border:1px solid ${P.accent}22}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid ${P.accent}22;font-family:monospace;font-weight:600}
  .thumbs{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${P.accent}22;max-width:1000px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:680px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${P.accent}22;border-radius:12px;padding:20px 20px 20px;margin-top:16px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.8;color:${P.mono};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.accent}22;border:1px solid ${P.accent}44;color:${P.accent};font-family:monospace;font-size:9px;letter-spacing:1px;padding:6px 14px;cursor:pointer;font-weight:700;border-radius:8px}
  .copy-btn:hover{background:${P.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${P.accent}22}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:14px;font-family:monospace;font-weight:600}
  .p-text{font-size:17px;opacity:.5;font-style:italic;max-width:680px;line-height:1.7}
  .prd-section{padding:40px;border-top:1px solid ${P.accent}22;max-width:820px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.accent};margin:28px 0 10px;font-weight:700;font-family:monospace}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:14px;opacity:.6;line-height:1.8;max-width:700px}
  .prd-section ul{padding-left:18px;margin:8px 0}
  .prd-section li{margin-bottom:6px}
  .prd-section strong{opacity:1;color:${P.fg}}
  footer{padding:28px 40px;border-top:1px solid ${P.accent}22;font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:monospace}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:#fff;font-family:monospace;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:20px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .glow-bg{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
  .glow-bg::before{content:'';position:absolute;top:-20%;right:-10%;width:600px;height:600px;background:radial-gradient(circle, ${P.accent}0A 0%, transparent 70%);border-radius:50%}
  .glow-bg::after{content:'';position:absolute;bottom:-10%;left:5%;width:400px;height:400px;background:radial-gradient(circle, ${P.accent2}0A 0%, transparent 70%);border-radius:50%}
  body > *:not(.glow-bg){position:relative;z-index:1}
</style>
</head>
<body>
<div class="glow-bg"></div>
<div class="toast" id="toast"></div>

<nav>
  <div class="logo">⌘ RAM<span>·</span>STUDIO</div>
  <div class="nav-id">HEARTBEAT · CIPHER · ${dateStr}</div>
</nav>

<section class="hero">
  <div class="tag">DEVELOPER TOOLS · DARK MODE · ${dateStr}</div>
  <h1>CIPHER<span>.</span></h1>
  <p class="sub">Secrets, locked tight.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 (4 MOBILE + 1 DESKTOP)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>DEVELOPER TOOLS · SAAS</strong></div>
    <div class="meta-item"><span>AESTHETIC</span><strong>VOID NAVY · BENTO GRID</strong></div>
    <div class="meta-item"><span>INSPIRATION</span><strong>EVERVAULT / LINEAR / GODLY</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <a class="btn btn-x" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN THUMBNAILS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">

    <div>
      <div class="section-label" style="margin-bottom:16px">COLOR PALETTE</div>
      <div class="swatches">${swatchHTML}</div>

      <div class="section-label" style="margin-top:40px;margin-bottom:16px">SPACING SYSTEM</div>
      ${spacingHTML}
    </div>

    <div>
      <div class="section-label" style="margin-bottom:16px">TYPE SCALE</div>
      ${typeScaleHTML}

      <div class="section-label" style="margin-top:40px;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${principlesHTML}
    </div>

  </div>

  <div style="margin-top:40px">
    <div class="section-label">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${sub.prompt}"</p>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF</div>
  ${prdHtml}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat · Inspired by Evervault (godly.website) + Linear (darkmodedesign.com)</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org/gallery</a>
</footer>

<script>
const D = '${encoded}';
const PROMPT = ${JSON.stringify(sub.prompt)};
const CSS_TOKENS = ${JSON.stringify(cssTokens)};
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}
function openInViewer(){
  try{
    const jsonStr=atob(D);JSON.parse(jsonStr);
    localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'cipher.pen'}));
    window.open('https://ram.zenbin.org/pen-viewer','_blank');
  }catch(e){alert('Could not load: '+e.message);}
}
function downloadPen(){
  try{
    const blob=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download='cipher.pen';a.click();
    URL.revokeObjectURL(a.href);
  }catch(e){alert('Download failed: '+e.message);}
}
function copyPrompt(){
  navigator.clipboard.writeText(PROMPT)
    .then(()=>toast('Prompt copied ✓'))
    .catch(()=>{const ta=document.createElement('textarea');ta.value=PROMPT;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Prompt copied ✓');});
}
function copyTokens(){
  navigator.clipboard.writeText(CSS_TOKENS)
    .then(()=>toast('CSS tokens copied ✓'))
    .catch(()=>{const ta=document.createElement('textarea');ta.value=CSS_TOKENS;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('CSS tokens copied ✓');});
}
function shareOnX(){
  const text=encodeURIComponent('CIPHER — dark-mode developer secrets management SaaS. Void navy + bento grid + pill nav. 5 screens + brand spec + CSS tokens. By RAM Design Studio');
  const url=encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text='+text+'&url='+url,'_blank');
}
</script>
</body>
</html>`;
}

// ── GitHub queue helper ───────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN || '';
const GITHUB_REPO  = config.GITHUB_REPO  || '';
const QUEUE_FILE   = config.QUEUE_FILE   || 'queue.json';

async function httpsRequest(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getQueueData() {
  const r = await httpsRequest({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'RAM-Design-Studio', 'Accept': 'application/vnd.github.v3+json' },
  });
  const json = JSON.parse(r.body);
  const content = Buffer.from(json.content, 'base64').toString('utf8');
  return { queue: JSON.parse(content), sha: json.sha };
}

async function updateQueue(queue, sha) {
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({ message: `heartbeat: cipher published`, content, sha });
  return httpsRequest({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'RAM-Design-Studio',
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

// ── Publish to Zenbin ─────────────────────────────────────────────────────────
async function publish(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsRequest({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
      'Authorization': `Bearer ${process.env.ZENBIN_API_KEY}`,
    },
  }, body);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔐 CIPHER — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const penPath = path.join(__dirname, 'cipher.pen');
  if (!fs.existsSync(penPath)) {
    console.error('cipher.pen not found — run: node cipher-app.js');
    process.exit(1);
  }
  const pen = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log(`✓ Loaded cipher.pen: ${pen.children.length} screens`);

  // Build hero HTML
  const html = buildHeroHTML(pen);
  console.log(`✓ Hero HTML: ${(html.length / 1024).toFixed(1)} KB`);

  // Build viewer with embedded pen
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const penJson = fs.readFileSync(penPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  // Publish hero → /cipher
  console.log('\n  Publishing hero     → ram.zenbin.org/cipher ...');
  const r1 = await publish('cipher', 'CIPHER — Developer Secrets Management · RAM Design Studio', html);
  console.log(`  ${r1.status === 200 ? '✓ Updated' : r1.status === 201 ? '✓ Created' : '✗ Error'} (HTTP ${r1.status})`);
  if (r1.status !== 200 && r1.status !== 201) console.log('  Body:', r1.body.slice(0, 200));

  // Publish viewer → /cipher-viewer
  console.log('  Publishing viewer   → ram.zenbin.org/cipher-viewer ...');
  const r2 = await publish('cipher-viewer', 'CIPHER — Viewer · RAM Design Studio', viewerHtml);
  console.log(`  ${r2.status === 200 ? '✓ Updated' : r2.status === 201 ? '✓ Created' : '✗ Error'} (HTTP ${r2.status})`);

  // Add to gallery queue
  if (GITHUB_TOKEN && GITHUB_REPO) {
    console.log('\n  Adding to gallery queue (GitHub)...');
    try {
      const { queue, sha } = await getQueueData();
      const entry = {
        ...sub,
        design_url: 'https://ram.zenbin.org/cipher',
        app_name:   meta.appName,
        archetype:  meta.archetype,
        app_type:   sub.app_type,
      };
      const existing = (queue.submissions || []).findIndex(s => s.id === sub.id);
      if (existing >= 0) {
        queue.submissions[existing] = entry;
      } else {
        if (!queue.submissions) queue.submissions = [];
        queue.submissions.push(entry);
      }
      queue.updated_at = new Date().toISOString();
      const gr = await updateQueue(queue, sha);
      console.log(`  ${gr.status === 200 ? '✓ Gallery updated' : '✗ Gallery error'} (HTTP ${gr.status})`);
    } catch(e) {
      console.warn(`  ⚠ Gallery update failed: ${e.message}`);
    }
  } else {
    console.log('  ⚠ No GitHub token — skipping gallery queue');
  }

  console.log('\n🔗 Live:');
  console.log('   Hero:   https://ram.zenbin.org/cipher');
  console.log('   Viewer: https://ram.zenbin.org/cipher-viewer');
}

main().catch(console.error);
