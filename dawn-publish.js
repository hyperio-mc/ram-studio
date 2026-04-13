'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'dawn';
const APP     = 'Dawn';
const TAGLINE = 'Your morning, by design';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);
const screens = pen.screens;
const P       = pen.metadata.palette;

// ─── SVG thumbnail generator ─────────────────────────────────────────────────
function renderElementSVG(el) {
  if (el.type === 'rect') {
    const rx = el.rx ?? 0;
    const opacity = el.opacity ?? 1;
    const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth ?? 1}"` : '';
    const fillVal = el.fill === 'transparent' ? 'none' : el.fill;
    return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${fillVal}" opacity="${opacity}" ${stroke}/>`;
  }
  if (el.type === 'text') {
    const fw = el.fontWeight ?? 400;
    const anchor = el.textAnchor ?? 'start';
    const opacity = el.opacity ?? 1;
    const ls = el.letterSpacing ?? 0;
    const escaped = String(el.content)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${fw}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}" font-family="${el.fontFamily ?? 'sans-serif'}">${escaped}</text>`;
  }
  if (el.type === 'circle') {
    const opacity = el.opacity ?? 1;
    const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth ?? 1}"` : '';
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${opacity}" ${stroke}/>`;
  }
  if (el.type === 'line') {
    const opacity = el.opacity ?? 1;
    const sw = el.strokeWidth ?? 1;
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
  }
  return '';
}

function makeSVG(screen, scaleW, scaleH) {
  const W = screen.width ?? 390, H = screen.height ?? 844;
  const els = screen.elements.map(renderElementSVG).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${scaleW}" height="${scaleH}" viewBox="0 0 ${W} ${H}">${els}</svg>`;
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const screenSVGs = screens.map(s => makeSVG(s, 200, 433));
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #F9F4EC;
    --bg2:     #F2EBE0;
    --surf:    #FFFFFF;
    --ink:     #2A2118;
    --ink2:    #6B5A48;
    --sage:    #6E9B72;
    --sage2:   #A8C7AA;
    --rose:    #C17B72;
    --gold:    #B08A4A;
    --goldL:   #D4B07A;
    --border:  #EDE5D8;
    --serif:   'Lora', Georgia, serif;
    --sans:    'Inter', system-ui, sans-serif;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--ink); font-family: var(--sans); min-height: 100vh; }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(249,244,236,0.88); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
  }
  .nav-logo { font-family: var(--serif); font-size: 22px; font-weight: 700; color: var(--ink); text-decoration: none; }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 14px; color: var(--ink2); text-decoration: none; font-weight: 500; }
  .nav-links a:hover { color: var(--sage); }
  .nav-cta { background: var(--sage); color: #fff; padding: 9px 24px; border-radius: 24px; font-size: 14px; font-weight: 600; text-decoration: none; }

  /* Hero */
  .hero {
    padding: 140px 40px 80px;
    max-width: 1140px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-label {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 24px; padding: 6px 16px; margin-bottom: 24px;
    font-size: 12px; font-weight: 600; color: var(--gold); letter-spacing: 1.2px; text-transform: uppercase;
  }
  .hero-title { font-family: var(--serif); font-size: 56px; font-weight: 700; line-height: 1.08; color: var(--ink); margin-bottom: 20px; }
  .hero-title em { font-style: italic; color: var(--sage); }
  .hero-sub { font-size: 18px; color: var(--ink2); line-height: 1.6; margin-bottom: 36px; max-width: 480px; }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary { background: var(--sage); color: #fff; padding: 14px 32px; border-radius: 32px; font-size: 16px; font-weight: 600; text-decoration: none; }
  .btn-secondary { color: var(--ink2); font-size: 15px; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 6px; }
  .btn-secondary:hover { color: var(--ink); }
  .hero-stats { display: flex; gap: 32px; margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border); }
  .hero-stat-val { font-family: var(--serif); font-size: 28px; font-weight: 700; color: var(--ink); }
  .hero-stat-lbl { font-size: 12px; color: var(--ink2); font-weight: 500; margin-top: 2px; }

  /* Screen carousel */
  .hero-screens {
    display: flex; gap: 12px; align-items: flex-start;
    overflow: hidden;
  }
  .screen-thumb {
    border-radius: 20px; overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 8px 32px rgba(42,33,24,0.10);
    flex-shrink: 0;
  }
  .screen-thumb:nth-child(2) { margin-top: 40px; }
  .screen-thumb:nth-child(3) { margin-top: 20px; }

  /* Feature bento */
  .section { max-width: 1140px; margin: 0 auto; padding: 80px 40px; }
  .section-label { font-size: 12px; font-weight: 600; color: var(--gold); letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 12px; }
  .section-title { font-family: var(--serif); font-size: 40px; font-weight: 700; color: var(--ink); margin-bottom: 16px; line-height: 1.15; }
  .section-sub { font-size: 16px; color: var(--ink2); line-height: 1.6; max-width: 520px; margin-bottom: 48px; }

  .bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .bento-card { background: var(--surf); border: 1px solid var(--border); border-radius: 24px; padding: 28px; }
  .bento-card.wide { grid-column: span 2; }
  .bento-card.tall { }
  .bento-icon { font-size: 28px; margin-bottom: 16px; }
  .bento-title { font-family: var(--serif); font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
  .bento-text { font-size: 14px; color: var(--ink2); line-height: 1.6; }
  .bento-tag { display: inline-block; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 4px 12px; font-size: 11px; font-weight: 600; color: var(--gold); margin-top: 16px; letter-spacing: 0.8px; text-transform: uppercase; }

  /* Palette */
  .palette-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 48px; }
  .swatch { width: 64px; height: 64px; border-radius: 16px; border: 1px solid var(--border); display: flex; align-items: flex-end; padding: 6px; }
  .swatch-label { font-size: 9px; color: rgba(255,255,255,0.9); font-weight: 600; background: rgba(0,0,0,0.25); padding: 2px 4px; border-radius: 4px; }
  .swatch-label.dark { color: rgba(0,0,0,0.65); background: rgba(0,0,0,0.08); }

  /* Screens gallery */
  .screens-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
  .screen-card { border-radius: 28px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 4px 24px rgba(42,33,24,0.08); }
  .screen-card-label { padding: 16px 20px; background: var(--surf); font-size: 13px; font-weight: 600; color: var(--ink2); border-top: 1px solid var(--border); }

  /* Links section */
  .links-bar { background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 32px 40px; display: flex; gap: 24px; align-items: center; justify-content: center; flex-wrap: wrap; }
  .link-pill { background: var(--surf); border: 1px solid var(--border); border-radius: 32px; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; color: var(--ink); display: flex; align-items: center; gap: 8px; }
  .link-pill:hover { background: var(--sage); color: #fff; border-color: var(--sage); }
  .link-pill .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sage); }
  .link-pill:hover .dot { background: rgba(255,255,255,0.7); }

  /* Footer */
  footer { text-align: center; padding: 48px 40px; color: var(--ink2); font-size: 13px; }
  footer a { color: var(--sage); text-decoration: none; }
</style>
</head>
<body>
<nav>
  <a class="nav-logo" href="#">Dawn</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/dawn-viewer">Viewer</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/dawn-mock">Try Mock ☀◑</a>
</nav>

<main>
  <div class="hero">
    <div class="hero-copy">
      <div class="hero-label">✦ Design Heartbeat · Light Theme</div>
      <h1 class="hero-title">Your morning,<br><em>by design.</em></h1>
      <p class="hero-sub">Dawn helps you build rituals that hold, track your energy through the day, and reflect on what's actually working — beautifully and without friction.</p>
      <div class="hero-actions">
        <a class="btn-primary" href="https://ram.zenbin.org/dawn-mock">Explore mock ☀◑</a>
        <a class="btn-secondary" href="https://ram.zenbin.org/dawn-viewer">View in Pencil →</a>
      </div>
      <div class="hero-stats">
        <div>
          <div class="hero-stat-val">6</div>
          <div class="hero-stat-lbl">Screens</div>
        </div>
        <div>
          <div class="hero-stat-val">1,761</div>
          <div class="hero-stat-lbl">Elements</div>
        </div>
        <div>
          <div class="hero-stat-val">Light</div>
          <div class="hero-stat-lbl">Theme</div>
        </div>
        <div>
          <div class="hero-stat-val">Serif</div>
          <div class="hero-stat-lbl">Type</div>
        </div>
      </div>
    </div>
    <div class="hero-screens">
      <div class="screen-thumb">${screenSVGs[0]}</div>
      <div class="screen-thumb">${screenSVGs[2]}</div>
      <div class="screen-thumb">${screenSVGs[4]}</div>
    </div>
  </div>

  <div id="features" class="section">
    <div class="section-label">◈ Features</div>
    <h2 class="section-title">Everything your morning<br>ritual deserves</h2>
    <p class="section-sub">Inspired by the "earthy tech" and editorial serif trends emerging on Land-book — warm, unhurried design for daily practice.</p>
    <div class="bento">
      <div class="bento-card wide">
        <div class="bento-icon">○</div>
        <div class="bento-title">Morning Dashboard</div>
        <div class="bento-text">A bento-grid overview of your energy ring, mood log, and sleep summary — everything in one warm, unhurried glance.</div>
        <span class="bento-tag">Bento Grid</span>
      </div>
      <div class="bento-card">
        <div class="bento-icon">✦</div>
        <div class="bento-title">Lined Journal</div>
        <div class="bento-text">Prompted daily writing on a warm-cream lined canvas. Weekly insight patterns surfaced automatically.</div>
        <span class="bento-tag">Pattern AI</span>
      </div>
      <div class="bento-card">
        <div class="bento-icon">◈</div>
        <div class="bento-title">Energy Tracking</div>
        <div class="bento-text">Weekly bar charts and breakdown cards for sleep, nutrition, movement, and mindset factors.</div>
        <span class="bento-tag">4 Factors</span>
      </div>
      <div class="bento-card wide">
        <div class="bento-icon">◇</div>
        <div class="bento-title">Ritual Builder & Streaks</div>
        <div class="bento-text">Build morning and evening stacks with visual streak tracking and per-ritual completion percentages. A 22-day streak banner keeps momentum alive.</div>
        <span class="bento-tag">Streaks</span>
      </div>
      <div class="bento-card">
        <div class="bento-icon">◉</div>
        <div class="bento-title">Weekly Review</div>
        <div class="bento-text">Three-score summary card, wins log, focus areas, and an intention-setter to frame the week ahead.</div>
        <span class="bento-tag">Reflection</span>
      </div>
    </div>
  </div>

  <div id="screens" class="section" style="padding-top: 0;">
    <div class="section-label">◉ All Screens</div>
    <h2 class="section-title">6 screens, 1,761 elements</h2>
    <div class="screens-grid">
      ${screens.map((s, i) => `
        <div class="screen-card">
          ${makeSVG(s, 340, 736)}
          <div class="screen-card-label">${i + 1}. ${s.name}</div>
        </div>`).join('')}
    </div>
  </div>

  <div id="palette" class="section" style="padding-top: 0;">
    <div class="section-label">○ Palette</div>
    <h2 class="section-title">Warm Cream × Sage × Dusty Rose</h2>
    <p class="section-sub">A light, earthy system drawn from the "pastel colors" and "earthy tech" clusters observed on Land-book. Warm parchment (#F9F4EC) replaces pure white — softer, more premium.</p>
    <div class="palette-row">
      ${[
        { c:'#F9F4EC', n:'Parchment BG', dark: true },
        { c:'#F2EBE0', n:'Deep Cream', dark: true },
        { c:'#FFFFFF', n:'Pure Surface', dark: true },
        { c:'#6E9B72', n:'Sage Green', dark: false },
        { c:'#A8C7AA', n:'Sage Light', dark: true },
        { c:'#C17B72', n:'Dusty Rose', dark: false },
        { c:'#B08A4A', n:'Brass Gold', dark: false },
        { c:'#D4B07A', n:'Gold Light', dark: true },
        { c:'#2A2118', n:'Warm Ink', dark: false },
        { c:'#6B5A48', n:'Muted Brown', dark: false },
        { c:'#EDE5D8', n:'Warm Border', dark: true },
      ].map(s => `<div class="swatch" style="background:${s.c};"><span class="swatch-label ${s.dark ? 'dark' : ''}">${s.n}</span></div>`).join('')}
    </div>
  </div>
</main>

<div class="links-bar">
  <a class="link-pill" href="https://ram.zenbin.org/dawn"><span class="dot"></span>Hero Page</a>
  <a class="link-pill" href="https://ram.zenbin.org/dawn-viewer"><span class="dot"></span>Pencil Viewer</a>
  <a class="link-pill" href="https://ram.zenbin.org/dawn-mock"><span class="dot"></span>Interactive Mock ☀◑</a>
</div>

<footer>
  <p>RAM Design Heartbeat · Dawn · ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</p>
  <p style="margin-top:8px;">Inspired by <a href="https://land-book.com">Land-book</a> earthy-tech + pastel trends · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
</footer>
</body>
</html>`;

// ─── VIEWER ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status}  ${r1.status === 201 ? '✓' : r1.body.slice(0, 80)}`);

  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status}  ${r2.status === 201 ? '✓' : r2.body.slice(0, 80)}`);
}
main().catch(console.error);
