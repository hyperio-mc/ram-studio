#!/usr/bin/env node
// signal-publish.js — hero + viewer + gallery queue for SIGNAL

'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'signal';
const APP_NAME = 'SIGNAL';
const TAGLINE  = 'Real-time market intelligence for serious traders';
const ARCHETYPE= 'finance-dark-editorial';
const SUBDOMAIN = 'ram';

const P = {
  bg:      '#050505',
  surface: '#0F0F0F',
  card:    '#141414',
  border:  '#1E1E1E',
  text:    '#EDE8DE',
  muted:   '#7A7570',
  accent:  '#FF6B35',
  green:   '#00C896',
  red:     '#FF3B5C',
  gold:    '#C8A250',
};

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'signal.pen'), 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.screens || [];

// ── HTTP helper ──────────────────────────────────────────────────────────────
function req(opts, body) {
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

function publish(slug, html, title) {
  const body = JSON.stringify({ html, title, overwrite: true });
  return req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    SUBDOMAIN,
    },
  }, body);
}

// ── SVG renderer (handles props-wrapped pen format) ──────────────────────────
function renderScreenSVG(screen, thumbW, thumbH) {
  const SW = screen.width || 390;
  const SH = screen.height || 844;
  const comps = screen.components || screen.elements || [];
  
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  
  function renderComp(comp) {
    const p = comp.props || {};
    const x = comp.x || 0;
    const y = comp.y || 0;
    const w = comp.width || 0;
    const h = comp.height || 0;
    const op = (p.opacity !== undefined ? p.opacity : (comp.opacity !== undefined ? comp.opacity : 1));
    
    if (comp.type === 'rectangle') {
      const fill = p.fill || comp.fill || 'transparent';
      const rx = p.cornerRadius || comp.cornerRadius || 0;
      const stroke = p.strokeColor || comp.strokeColor;
      const sw = p.strokeWidth || comp.strokeWidth || 0;
      const strokeAttr = stroke ? ` stroke="${esc(stroke)}" stroke-width="${sw}"` : '';
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${esc(fill)}" opacity="${op}"${strokeAttr}/>`;
    }
    if (comp.type === 'ellipse') {
      const fill = p.fill || comp.fill || 'transparent';
      const cx = x + w/2, cy = y + h/2;
      const rx = w/2, ry = h/2;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${esc(fill)}" opacity="${op}"/>`;
    }
    if (comp.type === 'text') {
      const content = p.content || comp.content || '';
      const fs  = p.fontSize || comp.fontSize || 12;
      const fill = p.color || comp.color || P.text;
      const fw = p.fontWeight || comp.fontWeight || 400;
      const ta = p.textAlign || comp.textAlign || 'left';
      const ls = p.letterSpacing || comp.letterSpacing || 0;
      const lh = (p.lineHeight || comp.lineHeight || 1.2) * fs;
      const anchor = ta === 'center' ? 'middle' : ta === 'right' ? 'end' : 'start';
      const xPos = ta === 'center' ? x + w/2 : ta === 'right' ? x + w : x;
      const lines = String(content).split('\n');
      return lines.map((ln, i) =>
        `<text x="${xPos.toFixed(1)}" y="${(y + fs + i*lh).toFixed(1)}" font-size="${fs}" font-weight="${fw}" fill="${esc(fill)}" opacity="${op}" text-anchor="${anchor}" letter-spacing="${ls}" font-family="system-ui,sans-serif">${esc(ln)}</text>`
      ).join('');
    }
    return '';
  }
  
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${thumbW}" height="${thumbH}" style="display:block">`];
  parts.push(`<rect width="${SW}" height="${SH}" fill="${P.bg}"/>`);
  comps.forEach(c => parts.push(renderComp(c)));
  parts.push('</svg>');
  return parts.join('');
}

// ── Screen thumbnails for hero ────────────────────────────────────────────────
const TW = 176, TH = 340;
const thumbsHTML = screens.map((s, i) =>
  `<div style="flex-shrink:0;text-align:center">
    <div style="border-radius:20px;overflow:hidden;border:1px solid ${P.border};box-shadow:0 24px 48px rgba(0,0,0,0.5)">
      ${renderScreenSVG(s, TW, TH)}
    </div>
    <div style="margin-top:10px;font-size:8px;color:${P.muted};letter-spacing:3px;font-weight:600;font-family:system-ui">${(s.name||'SCREEN '+(i+1)).toUpperCase()}</div>
  </div>`
).join('');

// ── Palette swatches ──────────────────────────────────────────────────────────
const swatchData = [
  { hex: P.bg,      role: 'VOID BLACK'      },
  { hex: P.card,    role: 'SURFACE'         },
  { hex: P.text,    role: 'CREAM TEXT'      },
  { hex: P.accent,  role: 'ORANGE-RED'      },
  { hex: P.green,   role: 'GAIN GREEN'      },
  { hex: P.red,     role: 'LOSS RED'        },
  { hex: P.gold,    role: 'SIGNAL GOLD'     },
  { hex: P.muted,   role: 'MUTED'           },
];
const swatchHTML = swatchData.map(s =>
  `<div style="flex:1;min-width:80px;max-width:110px">
    <div style="height:48px;border-radius:8px;background:${s.hex};border:1px solid ${P.border};margin-bottom:6px"></div>
    <div style="font-size:7.5px;letter-spacing:1.5px;color:${P.muted};margin-bottom:2px;font-family:monospace">${s.role}</div>
    <div style="font-size:11px;font-weight:700;color:${P.accent};font-family:monospace">${s.hex}</div>
  </div>`
).join('');

// ── Decision cards ────────────────────────────────────────────────────────────
const decisionsHTML = [
  { icon: '◼', title: 'Full-bleed editorial type', body: 'Inspired by Darkroom.au — "SIGNAL" renders at 68px weight-800 edge-to-edge, treating the hero as a newspaper front page rather than a dashboard header.' },
  { icon: '↔', title: 'Spaced letter headings', body: 'Lifted from Tracebit.com — every section header uses letter-spacing:3-4px ALL CAPS (e.g. "S I G N A L S", "T O P  M O V E R S") creating rhythm without decorative elements.' },
  { icon: '▬', title: 'Warm cream on void black', body: 'Rejected pure white #FFF in favour of #EDE8DE — a warm off-white that reduces harshness and creates the aged-print editorial feel of Darkroom\'s off-white on pitch black.' },
  { icon: '▌', title: 'Coloured left-border cards', body: 'Signal type and market direction encoded in a 3px left border strip (green/red/orange) — positional data before you read a single character.' },
  { icon: '⬛', title: 'Portfolio weight micro-bars', body: 'Each holding card shows a 4px bottom bar proportional to portfolio weight — a data layer that doesn\'t add visual noise but rewards attentive users.' },
].map(d =>
  `<div style="background:${P.card};border-radius:12px;border:1px solid ${P.border};padding:24px">
    <div style="font-size:18px;color:${P.accent};margin-bottom:12px">${d.icon}</div>
    <div style="font-size:13px;font-weight:700;color:${P.text};margin-bottom:10px;letter-spacing:-0.01em">${d.title}</div>
    <div style="font-size:12px;color:${P.muted};line-height:1.6">${d.body}</div>
  </div>`
).join('');

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SIGNAL — Market Intelligence</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }
body { background: ${P.bg}; color: ${P.text}; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }

/* NAV */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(5,5,5,0.88); backdrop-filter: blur(16px);
  border-bottom: 1px solid ${P.border};
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; height: 60px;
}
.logo { font-size: 1rem; font-weight: 800; letter-spacing: 3px; color: ${P.text}; text-decoration: none; }
.logo span { color: ${P.accent}; }
.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a { text-decoration: none; color: ${P.muted}; font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; transition: color .2s; }
.nav-links a:hover { color: ${P.text}; }
.nav-cta {
  background: ${P.accent}; color: #050505;
  border: none; padding: 8px 20px; border-radius: 100px;
  font-size: 0.8rem; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; cursor: pointer; text-decoration: none; transition: opacity .2s;
}
.nav-cta:hover { opacity: 0.85; }

/* HERO */
.hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 120px 32px 80px;
  text-align: center;
  position: relative; overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 50% at 50% 60%, rgba(255,107,53,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid ${P.border}; padding: 5px 16px; border-radius: 100px;
  font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase;
  color: ${P.muted}; margin-bottom: 36px;
}
.live-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: ${P.green};
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

.hero-title {
  font-size: clamp(4rem, 14vw, 9rem);
  font-weight: 800;
  letter-spacing: -4px;
  line-height: 0.92;
  color: ${P.text};
  margin-bottom: 20px;
}
.hero-sub-spaced {
  font-size: 0.65rem; letter-spacing: 6px; text-transform: uppercase;
  color: ${P.muted}; font-weight: 600; margin-bottom: 28px;
}
.hero-p {
  font-size: 1rem; color: ${P.muted}; max-width: 440px;
  margin: 0 auto 48px; line-height: 1.7;
}
.hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 80px; }
.btn-primary {
  background: ${P.accent}; color: #050505;
  padding: 14px 36px; border-radius: 100px;
  font-size: 0.875rem; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; text-decoration: none; transition: opacity .2s, transform .15s;
}
.btn-primary:hover { opacity: 0.88; transform: translateY(-2px); }
.btn-secondary {
  background: transparent; color: ${P.text};
  border: 1px solid ${P.border}; padding: 14px 36px; border-radius: 100px;
  font-size: 0.875rem; font-weight: 500;
  text-decoration: none; transition: border-color .2s, transform .15s;
}
.btn-secondary:hover { border-color: ${P.muted}; transform: translateY(-2px); }

/* SCREENS STRIP */
.screens-strip {
  display: flex; gap: 20px; overflow: visible;
  padding-bottom: 12px; justify-content: center; flex-wrap: wrap;
}

/* DIVIDER */
.section-divider {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800; letter-spacing: -2px;
  color: ${P.text}; line-height: 1;
}
.section-divider-sub {
  font-size: 0.65rem; letter-spacing: 5px; color: ${P.muted};
  font-weight: 600; text-transform: uppercase; margin-top: 12px;
}

/* SECTION */
.section { padding: 80px 32px; max-width: 1100px; margin: 0 auto; }

/* DECISIONS GRID */
.decisions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-top: 40px; }

/* PALETTE */
.palette-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 36px; }

/* STATS BAR */
.stats-bar {
  border-top: 1px solid ${P.border};
  border-bottom: 1px solid ${P.border};
  display: flex; gap: 0;
}
.stat-item {
  flex: 1; padding: 28px 24px; border-right: 1px solid ${P.border};
}
.stat-item:last-child { border-right: none; }
.stat-val { font-size: 1.8rem; font-weight: 700; letter-spacing: -1px; margin-bottom: 4px; }
.stat-label { font-size: 0.7rem; letter-spacing: 2px; color: ${P.muted}; font-weight: 600; text-transform: uppercase; }

/* LINKS */
.links-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 32px; }
.link-card {
  flex: 1; min-width: 200px;
  background: ${P.card}; border: 1px solid ${P.border};
  border-radius: 12px; padding: 20px 24px;
  text-decoration: none; transition: border-color .2s, transform .15s;
  display: flex; align-items: center; justify-content: space-between;
}
.link-card:hover { border-color: ${P.accent}; transform: translateY(-2px); }
.link-card-label { font-size: 0.75rem; letter-spacing: 2px; color: ${P.muted}; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
.link-card-title { font-size: 1rem; font-weight: 600; color: ${P.text}; }
.link-arrow { font-size: 1.2rem; color: ${P.accent}; }

/* FOOTER */
footer {
  border-top: 1px solid ${P.border};
  padding: 40px 32px;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
}
footer .logo-small { font-size: 0.8rem; font-weight: 800; letter-spacing: 3px; }
footer .meta { font-size: 0.75rem; color: ${P.muted}; }

@media (max-width: 640px) {
  .stats-bar { flex-direction: column; }
  .stat-item { border-right: none; border-bottom: 1px solid ${P.border}; }
  .hero-title { letter-spacing: -2px; }
  nav .nav-links { display: none; }
}
</style>
</head>
<body>

<nav>
  <a class="logo" href="#">S<span>I</span>GNAL</a>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#design">Decisions</a></li>
    <li><a href="#palette">Palette</a></li>
  </ul>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-viewer">View Prototype</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">
    <span class="live-dot"></span>
    RAM Design Heartbeat · March 2026
  </div>
  <h1 class="hero-title">SIGNAL</h1>
  <div class="hero-sub-spaced">R E A L - T I M E  M A R K E T  I N T E L L I G E N C E</div>
  <p class="hero-p">
    A dark editorial trading app for serious investors. Track markets, receive AI-detected pattern signals, and manage your portfolio — all in a near-pitch-black interface inspired by the editorial boldness of Darkroom.au.
  </p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">Explore Prototype →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
  </div>
  <div class="screens-strip">
    ${thumbsHTML}
  </div>
</section>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="stat-item">
    <div class="stat-val" style="color:${P.accent}">6</div>
    <div class="stat-label">Screens</div>
  </div>
  <div class="stat-item">
    <div class="stat-val" style="color:${P.green}">Dark</div>
    <div class="stat-label">Theme</div>
  </div>
  <div class="stat-item">
    <div class="stat-val" style="color:${P.gold}">#EDE8DE</div>
    <div class="stat-label">Cream on black</div>
  </div>
  <div class="stat-item">
    <div class="stat-val" style="color:${P.accent}">#FF6B35</div>
    <div class="stat-label">Signal Orange</div>
  </div>
</div>

<!-- INSPIRATION -->
<section class="section">
  <div style="font-size:0.65rem;letter-spacing:4px;color:${P.muted};font-weight:600;text-transform:uppercase;margin-bottom:16px">Inspiration</div>
  <div class="section-divider">What I saw.</div>
  <div class="section-divider-sub">Three sites that shaped this design</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:40px">
    ${[
      { src: 'Darkroom.au', url: 'https://darkroom.au', obs: '"DARKROOM" fills the entire viewport in massive condensed sans-serif. Pure black background, off-white/cream text. Zero decoration. The headline IS the design — no hero images, no gradients.' },
      { src: 'Midday.ai', url: 'https://midday.ai', obs: 'Feature tab navigation pattern — clicking "Assistant / Insights / Transactions" reveals different sections of the app. Contextual product showcasing without needing 6 separate pages.' },
      { src: 'Tracebit.com', url: 'https://tracebit.com', obs: '"M o d e r n  s e c u r i t y  t e a m s" — individual letter spacing used as visual rhythm. Not just tracking but deliberate spatial typography that creates texture without graphics.' },
    ].map(s => `
      <div style="background:${P.card};border-radius:12px;border:1px solid ${P.border};padding:24px">
        <a href="${s.url}" target="_blank" style="color:${P.accent};font-size:0.85rem;font-weight:700;letter-spacing:1px;text-decoration:none;display:block;margin-bottom:12px">${s.src} ↗</a>
        <p style="font-size:12px;color:${P.muted};line-height:1.65">${s.obs}</p>
      </div>`).join('')}
  </div>
</section>

<!-- SCREENS -->
<section id="screens" class="section">
  <div style="font-size:0.65rem;letter-spacing:4px;color:${P.muted};font-weight:600;text-transform:uppercase;margin-bottom:16px">Screens</div>
  <div class="section-divider">6 screens.</div>
  <div class="section-divider-sub">Market Pulse · Watchlist · Signal Feed · Asset Detail · Portfolio · Alerts</div>
  <div style="display:flex;gap:24px;overflow-x:auto;padding:40px 0 16px;scrollbar-width:thin">
    ${screens.map((s, i) => `
      <div style="flex-shrink:0;text-align:center">
        <div style="border-radius:24px;overflow:hidden;border:1px solid ${P.border};box-shadow:0 32px 64px rgba(0,0,0,0.6)">
          ${renderScreenSVG(s, 195, 380)}
        </div>
        <div style="margin-top:12px;font-size:8px;color:${P.muted};letter-spacing:3px;font-weight:600">${(s.name||'Screen '+(i+1)).toUpperCase()}</div>
      </div>`).join('')}
  </div>
</section>

<!-- DESIGN DECISIONS -->
<section id="design" class="section">
  <div style="font-size:0.65rem;letter-spacing:4px;color:${P.muted};font-weight:600;text-transform:uppercase;margin-bottom:16px">Design Decisions</div>
  <div class="section-divider">Why.</div>
  <div class="section-divider-sub">Five choices that define this design</div>
  <div class="decisions-grid">${decisionsHTML}</div>
</section>

<!-- PALETTE -->
<section id="palette" class="section">
  <div style="font-size:0.65rem;letter-spacing:4px;color:${P.muted};font-weight:600;text-transform:uppercase;margin-bottom:16px">Colour Palette</div>
  <div class="section-divider">8 colours.</div>
  <div class="section-divider-sub">Void black · Warm cream · Energy orange · Green / red data pair · Gold premium</div>
  <div class="palette-row">${swatchHTML}</div>
</section>

<!-- LINKS -->
<section class="section">
  <div style="font-size:0.65rem;letter-spacing:4px;color:${P.muted};font-weight:600;text-transform:uppercase;margin-bottom:24px">Explore</div>
  <div class="links-row">
    <a class="link-card" href="https://ram.zenbin.org/${SLUG}-viewer">
      <div><div class="link-card-label">Pen Viewer</div><div class="link-card-title">Browse all 6 screens</div></div>
      <span class="link-arrow">→</span>
    </a>
    <a class="link-card" href="https://ram.zenbin.org/${SLUG}-mock">
      <div><div class="link-card-label">Interactive Mock ☀◑</div><div class="link-card-title">Live Svelte prototype</div></div>
      <span class="link-arrow">→</span>
    </a>
  </div>
</section>

<footer>
  <span class="logo-small" style="color:${P.text}">SIGNAL</span>
  <span class="meta">RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB',{month:'long',year:'numeric'})} · Pencil v2.8</span>
  <span class="meta" style="color:${P.muted}">Inspired by Darkroom.au · Midday.ai · Tracebit.com</span>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SIGNAL — Prototype Viewer</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${P.bg}; color: ${P.text}; font-family: system-ui, sans-serif; min-height: 100vh; }
.viewer-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(5,5,5,0.9); backdrop-filter: blur(16px);
  border-bottom: 1px solid ${P.border};
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
}
.viewer-logo { font-size: 0.8rem; font-weight: 800; letter-spacing: 3px; color: ${P.text}; text-decoration: none; }
.screen-nav { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.screen-btn {
  background: ${P.card}; border: 1px solid ${P.border}; color: ${P.muted};
  font-size: 0.7rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
  padding: 5px 12px; border-radius: 100px; cursor: pointer; transition: .15s;
}
.screen-btn:hover, .screen-btn.active { background: ${P.accent}; color: #050505; border-color: ${P.accent}; }
.viewer-back { font-size: 0.75rem; color: ${P.muted}; text-decoration: none; transition: color .2s; }
.viewer-back:hover { color: ${P.text}; }
.phone-wrap {
  display: flex; justify-content: center; align-items: flex-start;
  padding: 80px 24px 48px; min-height: 100vh;
}
.phone-frame {
  width: 390px; height: 844px;
  background: ${P.bg};
  border-radius: 48px;
  border: 2px solid ${P.border};
  box-shadow: 0 48px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
  overflow: hidden; position: relative;
}
.phone-notch {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  width: 110px; height: 30px; background: #000; border-radius: 20px; z-index: 10;
}
.phone-frame svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; }
</style>
</head>
<body>
<div class="viewer-header">
  <a class="viewer-logo" href="https://ram.zenbin.org/${SLUG}">SIGNAL</a>
  <div class="screen-nav" id="screenNav"></div>
  <a class="viewer-back" href="https://ram.zenbin.org/${SLUG}">← Hero</a>
</div>
<div class="phone-wrap">
  <div class="phone-frame" id="phoneFrame">
    <div class="phone-notch"></div>
    <div style="display:flex;align-items:center;justify-content:center;height:100%;color:${P.muted}">Loading…</div>
  </div>
</div>
<script>
const pen = window.EMBEDDED_PEN || null;

function renderScreen(screen) {
  const W = 390, H = 844;
  const comps = screen.components || screen.elements || [];
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  const parts = [\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${W} \${H}" width="\${W}" height="\${H}">\`];
  parts.push(\`<rect width="\${W}" height="\${H}" fill="${P.bg}"/>\`);
  comps.forEach(comp => {
    const p = comp.props || {};
    const x = comp.x||0, y = comp.y||0, w = comp.width||0, h = comp.height||0;
    const op = p.opacity !== undefined ? p.opacity : 1;
    if (comp.type === 'rectangle') {
      const fill = p.fill||'transparent';
      const rx = p.cornerRadius||0;
      const stroke = p.strokeColor ? \` stroke="\${esc(p.strokeColor)}" stroke-width="\${p.strokeWidth||1}"\` : '';
      parts.push(\`<rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" rx="\${rx}" fill="\${esc(fill)}" opacity="\${op}"\${stroke}/>\`);
    } else if (comp.type === 'ellipse') {
      const fill = p.fill||'transparent';
      parts.push(\`<ellipse cx="\${(x+w/2).toFixed(1)}" cy="\${(y+h/2).toFixed(1)}" rx="\${(w/2).toFixed(1)}" ry="\${(h/2).toFixed(1)}" fill="\${esc(fill)}" opacity="\${op}"/>\`);
    } else if (comp.type === 'text') {
      const fs = p.fontSize||12, fw = p.fontWeight||400;
      const fill = p.color||'#EDE8DE';
      const ta = p.textAlign||'left';
      const ls = p.letterSpacing||0;
      const lh = (p.lineHeight||1.2)*fs;
      const anchor = ta==='center'?'middle':ta==='right'?'end':'start';
      const xPos = ta==='center'?x+w/2:ta==='right'?x+w:x;
      const lines = String(p.content||'').split('\\n');
      lines.forEach((ln,i) => {
        parts.push(\`<text x="\${xPos.toFixed(1)}" y="\${(y+fs+i*lh).toFixed(1)}" font-size="\${fs}" font-weight="\${fw}" fill="\${esc(fill)}" opacity="\${op}" text-anchor="\${anchor}" letter-spacing="\${ls}" font-family="system-ui,sans-serif">\${esc(ln)}</text>\`);
      });
    }
  });
  parts.push('</svg>');
  return parts.join('');
}

if (pen) {
  const data = typeof pen === 'string' ? JSON.parse(pen) : pen;
  const screens = data.screens || [];
  const nav = document.getElementById('screenNav');
  const frame = document.getElementById('phoneFrame');
  function show(idx) {
    const notch = frame.querySelector('.phone-notch');
    frame.innerHTML = renderScreen(screens[idx]);
    const n = document.createElement('div'); n.className = 'phone-notch';
    frame.appendChild(n);
    document.querySelectorAll('.screen-btn').forEach((b,i)=>b.classList.toggle('active',i===idx));
  }
  screens.forEach((s,i)=>{
    const btn = document.createElement('button');
    btn.className = 'screen-btn' + (i===0?' active':'');
    btn.textContent = s.name||s.label||('Screen '+(i+1));
    btn.onclick = ()=>show(i);
    nav.appendChild(btn);
  });
  show(0);
}
<\/script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
const viewerHtml = viewerTemplate.replace('<script>', injection + '\n<script>');

// ── Gallery queue ─────────────────────────────────────────────────────────────
async function updateGallery() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  if (getRes.status !== 200) { console.warn('Gallery GET failed:', getRes.status); return; }
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: 'Dark editorial market intelligence app inspired by Darkroom.au full-bleed typography, Midday.ai, and Tracebit letter-spacing patterns.',
    screens: screens.length,
    source: 'heartbeat',
    theme: 'dark',
    palette: P,
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? '✓ updated' : `✗ ${putRes.status} ${putRes.body.slice(0,80)}`);
  return newEntry;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing SIGNAL...');
  
  const heroRes = await publish(SLUG, heroHtml, 'SIGNAL — Market Intelligence');
  console.log(`Hero (${SLUG}): ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);
  
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, 'SIGNAL — Prototype Viewer');
  console.log(`Viewer (${SLUG}-viewer): ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  const entry = await updateGallery();
  
  console.log('\n✓ SIGNAL published:');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock  (pending Svelte build)`);
})().catch(e => { console.error('Error:', e); process.exit(1); });
