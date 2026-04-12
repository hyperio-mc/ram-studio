#!/usr/bin/env node
// publish-deck.js — Full Design Discovery pipeline for DECK
// DJ controller app where the interface IS hardware — skeuomorphic knobs, LED meters, vinyl platters
// Inspired by Subframe.com hardware command pill + Pioneer CDJ/DJM physical hardware

const fs   = require('fs');
const path = require('path');
const https = require('https');

const sub = {
  id:           'hb-deck-' + Date.now(),
  prompt:       'DECK — A DJ controller app where the entire UI is hardware. Skeuomorphic vinyl platters, LED VU meters, rotary knobs, channel faders, crossfader, FX rack units. Near-black chassis (#0A0B0C) + steel gray hardware + amber LED active (#F97316) + cyan waveform (#00D4FF). Anti-flat: tactile, physical, engineered. Inspired by Subframe.com hardware command pill (skeuomorphic bevel in flat context), Pioneer CDJ-3000 and DJM-900NXS2. 9 screens.',
  app_type:     'tool',
  credit:       'RAM Studio',
  submitted_at: new Date().toISOString(),
  status:       'done',
};

const BG      = '#0A0B0C';
const PANEL   = '#141618';
const STEEL   = '#2A2D32';
const AMBER   = '#F97316';
const CYAN    = '#00D4FF';
const GREEN   = '#22C55E';
const RED     = '#EF4444';
const LABEL   = '#8B9099';
const LABELHI = '#C4C9D1';

const prdMarkdown = `
## Overview

DECK is a DJ controller interface built on one radical constraint: every element in the UI is a physical hardware component. Not icons. Not flat buttons. Actual knobs with bevel shadows, VU meters with individual LED segments, vinyl platters with concentric groove rings, channel faders with tactile caps.

This runs directly counter to the flat-everything moment in UI design. Inspired by Subframe.com's hardware command pill — a single 3D bevel element embedded in an otherwise flat interface — DECK asks what happens when that instinct is taken to its logical extreme and applied to an entire product.

The reference hardware is Pioneer CDJ-3000 and DJM-900NXS2: the industry-standard setup for professional DJs. DECK translates those physical controls into a touch-first digital interface that retains the tactile language of the originals.

## The Constraint

Every interactive element must feel like it has mass:
- **Knobs** — circular body with inset groove, value position dot, shadow bevel
- **Faders** — track groove + physical cap with highlight line
- **LED meters** — 20 individual segments: green (safe) → yellow (hot) → red (clip)
- **Buttons** — raised body with LED indicator dot and engraved label
- **Vinyl platters** — concentric ring simulation with outer rim, groove bands, center spindle

The result is an interface you can read in dim lighting — like real hardware.

## Design Influences

**Subframe.com — Hardware Command Pill:** A 3D bevel dark pill with "Ask AI / Design / Code" mode switching — a single skeuomorphic element dropped into a completely flat UI. DECK takes that instinct to the product level.

**Pioneer CDJ-3000 + DJM-900NXS2:** The reference hardware. Matte black chassis, steel gray controls, amber illuminated CUE buttons, cyan jog wheel displays. DECK's palette is a direct translation of this physical hardware into UI tokens.

**Linear.app — Product IS the Hero:** Near-black background, the interface screenshot fills the frame. DECK follows this — no lifestyle photography, no abstract hero. The controller is the hero.

## Palette — Hardware Tokens

- **Chassis** \`#0A0B0C\` — near-black metal body (Pioneer CDJ matte black)
- **Panel** \`#141618\` — panel surface, slightly lighter than chassis
- **Groove** \`#1A1D21\` — inset groove, recessed element backgrounds
- **Steel** \`#2A2D32\` — hardware body (knobs, buttons)
- **Steel Hi** \`#52575F\` — highlight edge (top/left bevel)
- **Steel Lo** \`#1E2125\` — shadow edge (bottom/right bevel)
- **LED Amber** \`#F97316\` — cue buttons, deck A, warm active state
- **LED Cyan** \`#00D4FF\` — waveform, deck B, sync, BPM readout
- **LED Green** \`#22C55E\` — VU meter safe zone (0–60%)
- **LED Yellow** \`#EAB308\` — VU meter hot zone (60–80%)
- **LED Red** \`#EF4444\` — VU meter clip zone (80–100%)
- **Label** \`#8B9099\` — engraved hardware label (muted gray)

## Key Screens

1. **Mobile Deck** — vinyl platter with groove rings + waveform strip + transport controls + EQ knobs + hot cue pads
2. **Mobile Mixer** — 4 vertical channel strips with EQ, faders, LED meters, crossfader
3. **Mobile FX** — hardware pill FX rack (3 units: Reverb, Delay, Filter) with parameter knobs
4. **Mobile Library** — track browser sorted by BPM with mini waveform preview at bottom
5. **Mobile Set** — set recorder with full-set waveform + track log + export
6. **Desktop Main** — full 2-deck console: Deck A + center mixer + Deck B, full 1440px
7. **Desktop FX Rack** — 4 FX units side by side with 4 parameter knobs each
8. **Desktop Library** — crates sidebar + track table with load buttons + metadata panel
9. **Desktop Set Recording** — full waveform timeline + track segments bar + track log
`;

function renderElSVG(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x||0, y = el.y||0;
  const w = Math.max(0, el.width||0), h = Math.max(0, el.height||0);
  const fill = el.fill||'none';
  if (fill === 'transparent' || fill === 'none') {
    if (el.type !== 'text') return '';
  }
  const oAttr = (el.opacity!==undefined && el.opacity<0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const r = el.cornerRadius || 0;
  const rAttr = r ? ` rx="${Math.min(r, Math.max(1,w/2), Math.max(1,h/2))}"` : '';
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h||(el.fontSize||12)*0.7, (el.fontSize||12)*0.7));
    const fw = el.width || Math.max(40, (el.content||'').length * (el.fontSize||12) * 0.55);
    const tfill = fill && fill !== 'transparent' ? fill : LABELHI;
    return `<rect x="${x}" y="${y+((h||fh)-fh)/2}" width="${fw}" height="${fh}" fill="${tfill}"${oAttr} rx="1"/>`;
  }
  if (w > 0 && h > 0 && fill && fill !== 'transparent') {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>`;
  }
  return '';
}

function screenThumbSVG(screen, tw, th) {
  const sw = screen.w || screen.width;
  const sh = screen.h || screen.height;
  const elements = screen.elements || screen.children || [];
  const kids = elements.map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0;box-shadow:0 2px 12px rgba(0,0,0,0.4)"><rect width="${sw}" height="${sh}" fill="${BG}"/>${kids}</svg>`;
}

function mdToHtml(md) {
  if(!md) return '';
  return md
    .replace(/^## (.+)$/gm,'<h3>$1</h3>')
    .replace(/^- \*\*(.+?)\*\*[—:] (.+)$/gm,'<li><strong>$1</strong>: $2</li>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/\n\n/g,'</p><p>');
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
  const labels = ['Deck','Mixer','FX','Library','Set','Main','FX Rack','Library','Set Recording'];
  // Build lightweight SVG thumbnails (first 80 elements per screen, no full render)
  const thumbsHTML = screens.map((s, i) => {
    const sw = s.width;
    const sh = s.height;
    const tw = Math.round(THUMB_H * (sw / sh));
    const isMobile = sw < 500;
    const label = `${isMobile?'M':'D'} · ${labels[i]||''}`;
    const els = (s.children || []).slice(0, 80);
    const rects = els.map(el => {
      if (!el || !el.fill || el.fill === 'transparent') return '';
      const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
      if (w === 0 || h === 0) return '';
      const r = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';
      return `<rect x="${el.x||0}" y="${el.y||0}" width="${w}" height="${h}" fill="${el.fill}"${r}/>`;
    }).join('');
    const thumbSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${tw}" height="${THUMB_H}" style="display:block;border-radius:6px;flex-shrink:0;box-shadow:0 2px 12px rgba(0,0,0,0.4)"><rect width="${sw}" height="${sh}" fill="${BG}"/>${rects}</svg>`;
    return `<div style="text-align:center;flex-shrink:0">
      ${thumbSvg}
      <div style="font-size:9px;opacity:.35;margin-top:8px;letter-spacing:1px;color:${LABELHI};font-family:monospace">${label.toUpperCase()}</div>
    </div>`;
  }).join('');

  // Palette swatches
  const swatches = [
    { hex: BG,      role: 'CHASSIS' },
    { hex: PANEL,   role: 'PANEL' },
    { hex: STEEL,   role: 'STEEL' },
    { hex: AMBER,   role: 'LED AMBER' },
    { hex: CYAN,    role: 'LED CYAN' },
    { hex: GREEN,   role: 'LED GREEN' },
    { hex: RED,     role: 'LED RED' },
    { hex: LABEL,   role: 'LABEL' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:60px">
      <div style="height:44px;border-radius:6px;background:${sw.hex};border:1px solid #2A2D32;margin-bottom:6px"></div>
      <div style="font-size:9px;letter-spacing:1.2px;opacity:.4;margin-bottom:2px;color:${LABELHI}">${sw.role}</div>
      <div style="font-size:10px;font-weight:600;color:${LABELHI};opacity:.7">${sw.hex}</div>
    </div>`).join('');

  // Hardware component demos (simulated via CSS)
  const hwDemoHTML = `
    <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
      <!-- Knob demo -->
      <div style="text-align:center">
        <div style="width:52px;height:52px;border-radius:50%;background:#2A2D32;border:2px solid #52575F;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.08)">
          <div style="width:32px;height:32px;border-radius:50%;background:#1A1D21;display:flex;align-items:center;justify-content:center">
            <div style="width:6px;height:6px;border-radius:50%;background:#52575F;position:relative;top:-8px"></div>
          </div>
        </div>
        <div style="font-size:8px;opacity:.35;margin-top:8px;letter-spacing:1px;color:${LABELHI}">KNOB</div>
      </div>
      <!-- LED meter demo -->
      <div style="text-align:center">
        <div style="display:flex;gap:2px;align-items:flex-end;height:52px">
          ${[0.3,0.5,0.7,0.85,0.9,1.0,0.95,0.7,0.5,0.3].map((v,i) => {
            const col = v < 0.6 ? GREEN : v < 0.8 ? '#EAB308' : RED;
            return `<div style="width:6px;height:${Math.round(v*48)}px;background:${col};border-radius:1px;opacity:${v>0.5?1:0.3}"></div>`;
          }).join('')}
        </div>
        <div style="font-size:8px;opacity:.35;margin-top:8px;letter-spacing:1px;color:${LABELHI}">VU METER</div>
      </div>
      <!-- Fader demo -->
      <div style="text-align:center;display:flex;align-items:center;gap:8px">
        <div style="width:12px;height:52px;background:#111315;border-radius:6px;position:relative;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;width:22px;height:18px;background:#4A5058;border-radius:3px;top:12px;left:-5px;box-shadow:0 2px 4px rgba(0,0,0,0.5)">
            <div style="width:12px;height:2px;background:#6B7280;margin:8px auto;border-radius:1px"></div>
          </div>
        </div>
        <div style="font-size:8px;opacity:.35;letter-spacing:1px;color:${LABELHI}">FADER</div>
      </div>
      <!-- Button demo -->
      <div style="text-align:center">
        <div style="width:52px;height:36px;background:#3D4147;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:0 2px 4px rgba(0,0,0,0.5)">
          <div style="width:8px;height:8px;border-radius:50%;background:${AMBER}"></div>
          <div style="font-size:8px;color:${AMBER};letter-spacing:1px;font-family:monospace">CUE</div>
        </div>
        <div style="font-size:8px;opacity:.35;margin-top:8px;letter-spacing:1px;color:${LABELHI}">BUTTON</div>
      </div>
      <!-- Crossfader demo -->
      <div style="text-align:center">
        <div style="width:120px;height:20px;background:#111315;border-radius:10px;position:relative;display:flex;align-items:center">
          <div style="position:absolute;width:28px;height:28px;background:#4A5058;border-radius:3px;left:44px;top:-4px;box-shadow:0 2px 4px rgba(0,0,0,0.5)">
            <div style="width:2px;height:14px;background:#6B7280;margin:7px auto;border-radius:1px"></div>
          </div>
        </div>
        <div style="font-size:8px;opacity:.35;margin-top:12px;letter-spacing:1px;color:${LABELHI}">CROSSFADER</div>
      </div>
    </div>
  `;

  const cssTokens = `:root {
  /* DECK — DJ Controller · RAM Heartbeat #14 */

  /* Hardware Chassis */
  --chassis:       #0A0B0C;   /* near-black metal body */
  --panel:         #141618;   /* panel surface */
  --groove:        #1A1D21;   /* inset groove / recess */
  --steel:         #2A2D32;   /* hardware body (knobs, buttons) */
  --steel-mid:     #3D4147;   /* mid steel, inactive */
  --steel-hi:      #52575F;   /* highlight edge (bevel top) */
  --steel-lo:      #1E2125;   /* shadow edge (bevel bottom) */

  /* LED Colors */
  --led-off:       #1C1E20;   /* LED dead */
  --led-green:     #22C55E;   /* VU safe zone 0-60% */
  --led-yellow:    #EAB308;   /* VU hot zone 60-80% */
  --led-red:       #EF4444;   /* VU clip zone 80-100% */
  --led-amber:     #F97316;   /* Deck A / CUE / warm active */
  --led-cyan:      #00D4FF;   /* Deck B / sync / waveform / BPM readout */
  --led-white:     #F8FAFC;   /* bright indicator / playhead */

  /* Fader */
  --fader-track:   #111315;
  --fader-cap:     #4A5058;
  --fader-hi:      #6B7280;

  /* Labels */
  --label:         #8B9099;   /* engraved hardware label */
  --label-hi:      #C4C9D1;   /* active / selected label */

  /* Typography */
  --font-mono:     'JetBrains Mono', ui-monospace, monospace;  /* BPM readouts */
  --font-sans:     'Inter', system-ui, sans-serif;              /* track names */

  /* Spacing — hardware grid */
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 32px; --space-6: 48px;

  /* Radius */
  --radius-sm: 3px; --radius-md: 6px; --radius-lg: 12px;
  --radius-pill: 999px;

  /* Shadows — hardware depth */
  --shadow-knob:   0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
  --shadow-button: 0 2px 4px rgba(0,0,0,0.5);
  --shadow-unit:   0 8px 32px rgba(0,0,0,0.4);

  /* VU Meter breakpoints */
  --vu-safe-max:   60%;
  --vu-hot-max:    80%;
  /* Above 80% → --led-red */
}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DECK — DJ Controller · RAM Design Studio</title>
<meta name="description" content="A DJ controller app where the interface IS hardware. Skeuomorphic vinyl platters, LED meters, rotary knobs, channel faders. Near-black chassis × amber LED × cyan waveform. 9 screens.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${BG};color:${LABELHI};font-family:'SF Pro Text','Inter',system-ui,sans-serif;min-height:100vh}
nav{padding:20px 40px;border-bottom:1px solid #1E2125;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.logo{font-size:14px;font-weight:700;letter-spacing:4px;color:${LABEL}}
.nav-right{display:flex;align-items:center;gap:20px}
.nav-id{font-size:11px;color:#1E2125;letter-spacing:1px;font-family:monospace}
.hb-badge{font-size:9px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:4px;background:${AMBER}18;color:${AMBER};border:1px solid ${AMBER}33}
.hero{padding:80px 40px 40px;max-width:960px}
.tag{font-size:10px;letter-spacing:3px;color:${AMBER};margin-bottom:20px;font-weight:700}
h1{font-size:clamp(56px,10vw,120px);font-weight:700;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:${LABELHI};font-family:'JetBrains Mono',monospace}
.h1-accent{color:${AMBER}}
.sub{font-size:15px;color:${LABELHI};opacity:.4;max-width:520px;line-height:1.7;margin-bottom:32px;font-weight:300}
.meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
.meta-item span{display:block;font-size:10px;opacity:.3;letter-spacing:1px;margin-bottom:4px}
.meta-item strong{color:${AMBER}}
.hw-demo{margin-bottom:44px;padding:24px;background:${PANEL};border:1px solid #1E2125;border-radius:8px}
.hw-label{font-size:9px;letter-spacing:3px;color:${LABEL};margin-bottom:20px;font-weight:700}
.actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
.btn{padding:11px 22px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.3px}
.btn-p{background:${AMBER};color:${BG}}
.btn-p:hover{opacity:.85}
.btn-s{background:transparent;color:${LABELHI};border:1px solid #2A2D32}
.btn-s:hover{border-color:${AMBER}66;color:${AMBER}}
.section-label{font-size:10px;letter-spacing:3px;color:${AMBER};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid #1E2125;font-weight:700}
.preview{padding:0 40px 80px}
.thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
.thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-thumb{background:${AMBER}44;border-radius:2px}
.brand-section{padding:60px 40px;border-top:1px solid #1E2125;max-width:1000px}
.brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
@media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
.swatches{display:flex;gap:8px;flex-wrap:wrap}
.type-row{padding:14px 0;border-bottom:1px solid #1E2125}
.tokens-block{background:${PANEL};border:1px solid #1E2125;border-radius:8px;padding:20px;margin-top:24px;position:relative}
.tokens-pre{font-size:11px;line-height:1.7;color:${LABELHI};opacity:.55;white-space:pre;overflow-x:auto;font-family:monospace}
.copy-btn{position:absolute;top:12px;right:12px;background:${AMBER}18;border:1px solid ${AMBER}33;color:${AMBER};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
.prd-section{padding:40px;border-top:1px solid #1E2125;max-width:780px}
.prd-section h3{font-size:10px;letter-spacing:2px;color:${AMBER};margin:28px 0 10px;font-weight:700}
.prd-section h3:first-child{margin-top:0}
.prd-section p,.prd-section li{font-size:14px;opacity:.45;line-height:1.75;max-width:680px}
.prd-section ul{padding-left:18px;margin:6px 0}.prd-section li{margin-bottom:4px}
.prd-section strong{opacity:1;color:${LABELHI}}
.prd-section code{font-family:monospace;font-size:12px;color:${AMBER};opacity:.8}
.insp-section{padding:40px;border-top:1px solid #1E2125;max-width:900px}
.insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media(max-width:640px){.insp-grid{grid-template-columns:1fr}}
.insp-card{background:${PANEL};border:1px solid #1E2125;border-radius:8px;padding:16px 20px}
.insp-site{font-size:9px;letter-spacing:1.5px;color:${AMBER};margin-bottom:6px;font-weight:700}
.insp-note{font-size:12px;color:${LABEL};line-height:1.6}
footer{padding:28px 40px;border-top:1px solid #1E2125;font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.toast{position:fixed;bottom:24px;right:24px;background:${AMBER};color:${BG};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
.toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-right">
    <div class="hb-badge">HEARTBEAT #14 · DJ CONTROLLER</div>
    <div class="nav-id">${sub.id}</div>
  </div>
</nav>

<section class="hero">
  <div class="tag">HARDWARE UI · SKEUOMORPHIC · DJ CONTROLLER · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>DE<span class="h1-accent">CK</span></h1>
  <p class="sub">A DJ controller app where the interface IS hardware. Vinyl platters with groove rings. LED VU meters with 20 individual segments. Rotary knobs with bevel shadows. Every element has mass.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>9 (5 MOBILE + 4 DESKTOP)</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>NEAR-BLACK × AMBER LED × CYAN</strong></div>
    <div class="meta-item"><span>CONCEPT</span><strong>INTERFACE IS HARDWARE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>SUBFRAME COMMAND PILL</strong></div>
  </div>
  <div class="hw-demo">
    <div class="hw-label">HARDWARE COMPONENTS</div>
    ${hwDemoHTML}
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/deck-viewer">▶ Open in Viewer</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/deck-pen/raw" download="deck.pen">↓ Download .pen</a>
    <button class="btn btn-s" onclick="copyTokens()">⌘ Copy CSS Tokens</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/feedback?design=deck">↺ Request Refactor</a>
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
      <div style="font-size:10px;letter-spacing:2px;opacity:.3;margin-bottom:16px;color:${LABELHI}">PALETTE — HARDWARE TOKENS</div>
      <div class="swatches">${swatchHTML}</div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.3;margin-bottom:0;color:${LABELHI}">TYPE SCALE</div>
      ${[
        {label:'DISPLAY', size:'clamp(56px,10vw,120px)', w:'700', sample:'DECK', mono:true},
        {label:'BPM READOUT', size:'16px', w:'700', sample:'128.0 BPM', mono:true},
        {label:'TRACK NAME', size:'13px', w:'700', sample:'Bicep — Glue', sans:true},
        {label:'ARTIST', size:'11px', w:'400', sample:'Four Tet · Movement', sans:true},
        {label:'HW LABEL', size:'9px', w:'400', sample:'LOW · MID · HI · GAIN · VOL', mono:true},
      ].map(t=>`<div class="type-row">
        <div style="font-size:9px;letter-spacing:2px;opacity:.25;margin-bottom:6px;color:${LABELHI}">${t.label} · ${t.size} / ${t.w}</div>
        <div style="font-size:${t.size};font-weight:${t.w};color:${t.mono&&!t.sans?AMBER:LABELHI};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${t.sans?'Inter, system-ui, sans-serif':'JetBrains Mono, monospace'}">${t.sample}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.3;margin-bottom:16px;color:${LABELHI}">DESIGN PRINCIPLES</div>
      ${[
        'Interface IS hardware — not hardware-inspired, hardware. Every element has mass, bevel, and depth.',
        'Legible in dim lighting — hardware label contrast is tuned for club environments, not office screens.',
        'LED language — color encodes function, not decoration. Amber = Deck A / warm. Cyan = Deck B / playback.',
        'Simplicity criterion — if it doesn\'t exist on a Pioneer CDJ, it shouldn\'t exist in DECK.',
      ].map((p,i)=>`<div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start">
        <div style="color:${AMBER};font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px;font-family:monospace">${String(i+1).padStart(2,'0')}</div>
        <div style="font-size:13px;opacity:.45;line-height:1.6;color:${LABELHI}">${p}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.3;margin-bottom:16px;color:${LABELHI}">VU METER SCALE</div>
      <div style="display:flex;gap:3px;align-items:flex-end;height:80px;margin-bottom:12px">
        ${Array.from({length:20},(_,i)=>{
          const v = (i+1)/20;
          const col = v<=0.6 ? GREEN : v<=0.8 ? '#EAB308' : RED;
          const active = i < 16;
          return `<div style="width:10px;height:${Math.round(v*76)}px;background:${col};border-radius:1px;opacity:${active?1:0.2}"></div>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:8px;opacity:.3;font-family:monospace;color:${LABELHI}">
        <span>0%</span><span>60%</span><span>80%</span><span>100%</span>
      </div>
      <div style="margin-top:12px;font-size:11px;opacity:.3;line-height:1.8;color:${LABELHI}">
        Green → yellow → red<br>
        Safe → hot → clip<br>
        20 segments · 3 zones
      </div>
    </div>
  </div>
  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
  </div>
</section>

<section class="insp-section">
  <div class="section-label">RESEARCH SOURCES · HEARTBEAT #14</div>
  <div class="insp-grid">
    <div class="insp-card">
      <div class="insp-site">SUBFRAME.COM — LAPA.NINJA</div>
      <p class="insp-note">Hardware command pill: a single 3D bevel dark pill with metallic chrome edges sitting in a flat AI product UI. "Ask AI / Design / Code" mode switcher. DECK takes that one element instinct and applies it to the entire product — every control has the same bevel language.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">LINEAR.APP — LAPA.NINJA</div>
      <p class="insp-note">Near-black #0A0A0A background, bold white sans, product screenshot IS the hero. No lifestyle photography, no lifestyle metaphors. The product fills the frame. DECK follows this — the controller is the hero, nothing else.</p>
    </div>
    <div class="insp-card">
      <div class="insp-site">PIONEER CDJ-3000 + DJM-900NXS2</div>
      <p class="insp-note">The reference hardware. Matte black chassis, steel gray controls, amber CUE buttons, cyan jog wheel display ring. DECK's palette tokens are a direct 1:1 translation of the physical hardware color language into CSS custom properties. Function determines form.</p>
    </div>
  </div>
</section>

<section class="prd-section">
  <div class="section-label">PRODUCT BRIEF</div>
  ${mdToHtml(prdMarkdown)}
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #14 · DJ Controller · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
  <a href="https://ram.zenbin.org/" style="color:inherit;text-decoration:none;opacity:1">ram.zenbin.org</a>
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
  // Use minified JSON (not base64) to stay under 512KB limit
  const minified = JSON.stringify(JSON.parse(penJsonStr));
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let html = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(minified)};<\/script>`;
  return html.replace('<script>', injection + '\n<script>');
}

async function main() {
  console.log('🎛  DECK — Full Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const penPath = path.join(__dirname, 'deck.pen');
  if (!fs.existsSync(penPath)) { console.error('✗ deck.pen not found — run: node deck-app.js'); process.exit(1); }
  const penJsonStr = fs.readFileSync(penPath, 'utf8');
  const doc = JSON.parse(penJsonStr);
  const screens = doc.children || [];
  console.log(`✓ Loaded deck.pen — ${screens.length} screens`);

  // Publish raw pen JSON (for download link and viewer reference)
  console.log('\n📤 Publishing pen JSON → ram.zenbin.org/deck-pen...');
  const minifiedPen = JSON.stringify(JSON.parse(penJsonStr));
  const penRes = await zenPost('deck-pen', 'DECK .pen file', minifiedPen, 'ram');
  console.log(`  HTTP ${penRes.status} — ${penRes.status===200||penRes.status===201?'✅ Published':'❌ Failed'} (${(Buffer.byteLength(minifiedPen)/1024).toFixed(1)}kb)`);

  console.log('\n📤 Publishing hero → ram.zenbin.org/deck...');
  const heroHtml = buildHeroHTML(doc);
  const heroBody = JSON.stringify({title:'DECK — DJ Controller · RAM Design Studio', html:heroHtml});
  console.log(`  Hero size: ${(Buffer.byteLength(heroBody)/1024).toFixed(1)}kb`);
  const heroRes = await zenPost('deck', 'DECK — DJ Controller · RAM Design Studio', heroHtml, 'ram');
  console.log(`  HTTP ${heroRes.status} — ${heroRes.status===200||heroRes.status===201?'✅ Published':'❌ Failed'}`);
  if (heroRes.status !== 200 && heroRes.status !== 201) console.log('  Error:', heroRes.body.slice(0,200));

  console.log('\n📤 Publishing viewer → ram.zenbin.org/deck-viewer...');
  const viewerHtml = buildViewerHTML(penJsonStr);
  const viewerBody = JSON.stringify({title:'DECK Viewer', html:viewerHtml});
  console.log(`  Viewer size: ${(Buffer.byteLength(viewerBody)/1024).toFixed(1)}kb`);
  const viewerRes = await zenPost('deck-viewer', 'DECK Viewer', viewerHtml, 'ram');
  console.log(`  HTTP ${viewerRes.status} — ${viewerRes.status===200||viewerRes.status===201?'✅ Published':'❌ Failed'}`);
  if (viewerRes.status !== 200 && viewerRes.status !== 201) console.log('  Error:', viewerRes.body.slice(0,200));

  console.log('\n✅ DECK live:');
  console.log('   Hero:   https://ram.zenbin.org/deck');
  console.log('   Viewer: https://ram.zenbin.org/deck-viewer');
  console.log('   Pen:    https://ram.zenbin.org/deck-pen/raw');

  // Gallery registry
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
          headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-studio/1.0', 'Accept': 'application/vnd.github.v3+json' }
        }, res => { let d=''; res.on('data', c=>d+=c); res.on('end', ()=>resolve({status:res.statusCode,body:d})); });
        req.on('error', reject); req.end();
      });
      if (getRes.status === 200) {
        const fd = JSON.parse(getRes.body);
        const queue = JSON.parse(Buffer.from(fd.content, 'base64').toString('utf8'));
        const entry = {
          id: sub.id, prompt: sub.prompt, app_type: 'tool', credit: 'RAM Studio',
          submitted_at: sub.submitted_at, status: 'done', app_name: 'DECK',
          archetype: 'tool',
          design_url: 'https://ram.zenbin.org/deck',
          viewer_url: 'https://ram.zenbin.org/deck-viewer',
          published_at: new Date().toISOString(),
        };
        const existing = (queue.submissions||[]).findIndex(s => s.id === sub.id);
        if (existing >= 0) queue.submissions[existing] = entry;
        else (queue.submissions = queue.submissions||[]).push(entry);
        queue.updated_at = new Date().toISOString();
        const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
        const putBody = JSON.stringify({
          message: 'add: DECK — DJ controller where interface IS hardware',
          content, sha: fd.sha,
        });
        const putRes = await new Promise((resolve, reject) => {
          const req = https.request({
            hostname: 'api.github.com', path: `/repos/${REPO}/contents/queue.json`, method: 'PUT',
            headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-studio/1.0',
              'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
              'Accept': 'application/vnd.github.v3+json' }
          }, res => { let d=''; res.on('data', c=>d+=c); res.on('end', ()=>resolve({status:res.statusCode,body:d})); });
          req.on('error', reject); req.write(putBody); req.end();
        });
        console.log(`  Gallery registry: HTTP ${putRes.status} ${putRes.status===200?'✅':'❌'}`);
      }
    } catch(err) { console.warn(`  ⚠ Gallery skipped: ${err.message}`); }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Done.');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
