'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'tidal';
const DIR  = __dirname;

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      port:     443,
      path:     `/v1/pages/${slug}`,
      method:   'POST',
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

const penJson = fs.readFileSync(path.join(DIR, 'tidal.pen'), 'utf8');
const pen     = JSON.parse(penJson);

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:    '#030B17',
  surf:  '#071120',
  card:  '#0C1A30',
  acc:   '#06B6D4',
  acc2:  '#818CF8',
  acc3:  '#34D399',
  text:  '#E0F2FE',
  sub:   '#7DB9D8',
  muted: '#3B5F7A',
};

// ── Screens → SVG data URIs for carousel ─────────────────────────────────────
function screenToSvgUri(screen) {
  const W = screen.width  || 390;
  const H = screen.height || 844;
  const elements = screen.elements || [];

  const elems = elements.map(el => {
    if (el.type === 'rect') {
      const rx   = el.rx    || 0;
      const op   = el.opacity !== undefined ? el.opacity : 1;
      const sw   = el.strokeWidth || 0;
      const strk = el.stroke ? `stroke="${el.stroke}" stroke-width="${sw}"` : '';
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${rx}" opacity="${op}" ${strk}/>`;
    }
    if (el.type === 'circle') {
      const op   = el.opacity !== undefined ? el.opacity : 1;
      const sw   = el.strokeWidth || 0;
      const strk = el.stroke ? `stroke="${el.stroke}" stroke-width="${sw}"` : '';
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${op}" ${strk}/>`;
    }
    if (el.type === 'line') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${op}"/>`;
    }
    if (el.type === 'text') {
      const fw     = el.fontWeight || 400;
      const anchor = el.textAnchor || 'start';
      const op     = el.opacity !== undefined ? el.opacity : 1;
      const ls     = el.letterSpacing || 0;
      const safe   = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${fw}" font-family="Inter,sans-serif" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${op}">${safe}</text>`;
    }
    return '';
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${elems}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const screenUris = pen.screens.map(screenToSvgUri);

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TIDAL — Artist analytics, deep as the ocean</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${C.bg}; --surf:${C.surf}; --card:${C.card};
    --acc:${C.acc}; --acc2:${C.acc2}; --acc3:${C.acc3};
    --text:${C.text}; --sub:${C.sub}; --muted:${C.muted};
    --bdr:rgba(6,182,212,0.14);
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* ── Noise overlay ─────────────────────────────────── */
  body::before{
    content:''; position:fixed; inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events:none; z-index:0; opacity:0.4;
  }

  /* ── Hero ──────────────────────────────────────────── */
  .hero{
    position:relative; min-height:100vh;
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; text-align:center;
    padding:80px 24px 60px; overflow:hidden;
  }
  .glow-orb{
    position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none;
  }
  .glow-orb.teal{
    width:600px; height:600px;
    background:radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
    top:-100px; left:50%; transform:translateX(-50%);
  }
  .glow-orb.indigo{
    width:400px; height:400px;
    background:radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%);
    bottom:0; right:-100px;
  }
  .hero-eyebrow{
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(6,182,212,0.08); border:1px solid var(--bdr);
    border-radius:100px; padding:6px 14px; font-size:12px;
    color:var(--acc); letter-spacing:0.5px; margin-bottom:28px;
  }
  .hero-eyebrow::before{content:''; width:6px; height:6px; background:var(--acc); border-radius:50%; flex-shrink:0}
  .hero-title{
    font-size:clamp(52px,10vw,88px); font-weight:800;
    letter-spacing:-2px; line-height:1;
    background:linear-gradient(135deg, var(--text) 0%, var(--acc) 60%, var(--acc2) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; margin-bottom:20px;
  }
  .hero-sub{
    font-size:clamp(16px,2.5vw,20px); color:var(--sub); max-width:560px;
    line-height:1.6; font-weight:400; margin-bottom:40px;
  }
  .hero-cta{display:flex; gap:14px; flex-wrap:wrap; justify-content:center; margin-bottom:60px}
  .btn-primary{
    background:var(--acc); color:#000; font-weight:700;
    padding:14px 30px; border-radius:12px; text-decoration:none;
    font-size:15px; transition:opacity 0.2s;
  }
  .btn-primary:hover{opacity:0.85}
  .btn-ghost{
    background:transparent; color:var(--text); border:1px solid var(--bdr);
    padding:14px 30px; border-radius:12px; text-decoration:none;
    font-size:15px; transition:background 0.2s;
  }
  .btn-ghost:hover{background:rgba(6,182,212,0.06)}

  /* ── Screen carousel ────────────────────────────────── */
  .screens-wrap{
    position:relative; width:100%; max-width:1100px; margin:0 auto;
    display:flex; gap:20px; overflow-x:auto; padding:20px 0 40px;
    scrollbar-width:none;
    -webkit-mask-image:linear-gradient(90deg,transparent,black 8%,black 92%,transparent);
    mask-image:linear-gradient(90deg,transparent,black 8%,black 92%,transparent);
  }
  .screens-wrap::-webkit-scrollbar{display:none}
  .screen-card{
    flex-shrink:0; width:200px;
    background:var(--card); border:1px solid var(--bdr);
    border-radius:20px; overflow:hidden;
    box-shadow:0 20px 60px rgba(0,0,0,0.5);
    transition:transform 0.3s, box-shadow 0.3s;
  }
  .screen-card:hover{transform:translateY(-8px) scale(1.02); box-shadow:0 30px 80px rgba(6,182,212,0.15)}
  .screen-card img{width:100%; display:block}
  .screen-label{
    padding:10px 12px; font-size:11px; color:var(--sub);
    font-weight:500; letter-spacing:0.3px; text-align:center;
  }

  /* ── Features bento ─────────────────────────────────── */
  .section{padding:80px 24px; max-width:1100px; margin:0 auto}
  .section-title{
    font-size:clamp(28px,4vw,42px); font-weight:700;
    letter-spacing:-1px; margin-bottom:12px;
  }
  .section-sub{color:var(--sub); font-size:16px; margin-bottom:48px; max-width:540px}
  .bento{display:grid; grid-template-columns:repeat(3,1fr); gap:16px}
  @media(max-width:768px){.bento{grid-template-columns:1fr}}
  .bento-card{
    background:var(--card); border:1px solid var(--bdr);
    border-radius:16px; padding:28px;
  }
  .bento-card.wide{grid-column:span 2}
  .bento-card.tall{grid-row:span 2}
  .bento-icon{
    width:44px; height:44px; border-radius:12px;
    background:rgba(6,182,212,0.1); display:flex; align-items:center;
    justify-content:center; font-size:22px; margin-bottom:18px;
  }
  .bento-card h3{font-size:17px; font-weight:600; margin-bottom:8px}
  .bento-card p{font-size:14px; color:var(--sub); line-height:1.6}

  /* ── Palette swatches ───────────────────────────────── */
  .palette{display:flex; gap:12px; flex-wrap:wrap; margin-top:40px}
  .swatch{
    display:flex; flex-direction:column; align-items:center; gap:6px;
  }
  .swatch-dot{width:48px; height:48px; border-radius:12px; border:1px solid var(--bdr)}
  .swatch span{font-size:10px; color:var(--muted); font-family:monospace}

  /* ── Inspiration callout ────────────────────────────── */
  .inspo-bar{
    background:var(--surf); border-top:1px solid var(--bdr);
    border-bottom:1px solid var(--bdr); padding:24px;
    text-align:center; font-size:13px; color:var(--sub);
  }
  .inspo-bar strong{color:var(--acc)}

  /* ── Footer ─────────────────────────────────────────── */
  footer{
    padding:48px 24px; text-align:center; border-top:1px solid var(--bdr);
    font-size:13px; color:var(--muted);
  }
  footer a{color:var(--acc); text-decoration:none}
</style>
</head>
<body>

<!-- Hero -->
<section class="hero">
  <div class="glow-orb teal"></div>
  <div class="glow-orb indigo"></div>
  <div class="hero-eyebrow">Heartbeat #50 · RAM Design System</div>
  <h1 class="hero-title">TIDAL</h1>
  <p class="hero-sub">Artist analytics, deep as the ocean. Stream intelligence, royalty tracking, and audience insights for independent artists and their teams.</p>
  <div class="hero-cta">
    <a href="https://ram.zenbin.org/tidal-viewer" class="btn-primary">View in Pencil Viewer →</a>
    <a href="https://ram.zenbin.org/tidal-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>

  <!-- Screen carousel -->
  <div class="screens-wrap">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenUris[i]}" alt="${s.name}" loading="lazy" width="200" height="435">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- Inspiration callout -->
<div class="inspo-bar">
  Inspired by <strong>darkmodedesign.com</strong> (QASE frozen deep-sea bioluminescence) ·
  <strong>saaspo.com</strong> (bento grid + product-glow patterns) ·
  <strong>godly.website</strong> (deconstructed negative-space hero)
</div>

<!-- Features bento -->
<section class="section">
  <h2 class="section-title">Everything your artist needs</h2>
  <p class="section-sub">From stream velocity to royalty projections — all in one deep analytics dashboard.</p>
  <div class="bento">
    <div class="bento-card wide">
      <div class="bento-icon">◈</div>
      <h3>Stream Velocity</h3>
      <p>Real-time and historical streaming data across all major platforms — Spotify, Apple Music, YouTube Music, and more. Understand peaks, plateaus, and momentum shifts at a glance.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◯</div>
      <h3>Audience Intelligence</h3>
      <p>Age groups, gender splits, and top countries — understand exactly who your listeners are.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◎</div>
      <h3>Revenue Tracking</h3>
      <p>Per-platform earnings breakdown with payout forecasting and year-to-date summaries.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">♪</div>
      <h3>Track Performance</h3>
      <p>Ranked track list with 30-day delta — spot which songs are gaining and which are fading.</p>
    </div>
    <div class="bento-card wide">
      <div class="bento-icon">⬡</div>
      <h3>Campaign Manager</h3>
      <p>Launch and monitor promotional campaigns directly in TIDAL. Budget tracking, reach metrics, and editorial playlist pitching — from one command center.</p>
    </div>
  </div>
</section>

<!-- Palette -->
<section class="section" style="padding-top:0">
  <h2 class="section-title" style="font-size:24px">Palette</h2>
  <p class="section-sub" style="margin-bottom:24px; font-size:14px">Deep-sea bioluminescence — inspired by darkmodedesign.com's QASE example</p>
  <div class="palette">
    ${[
      ['#030B17','Deep Sea'],
      ['#071120','Surface'],
      ['#0C1A30','Card'],
      ['#06B6D4','Electric Teal'],
      ['#818CF8','Soft Indigo'],
      ['#34D399','Bioluminescent Mint'],
      ['#E0F2FE','Ice Text'],
    ].map(([hex, name]) => `
    <div class="swatch">
      <div class="swatch-dot" style="background:${hex}"></div>
      <span>${hex}</span>
      <span style="color:var(--sub);font-size:10px">${name}</span>
    </div>`).join('')}
  </div>
</section>

<!-- Footer -->
<footer>
  <p>TIDAL · Heartbeat #50 · RAM Design · <a href="https://ram.zenbin.org/tidal-viewer">Viewer</a> · <a href="https://ram.zenbin.org/tidal-mock">Mock</a></p>
  <p style="margin-top:8px">6 screens · 627 elements · Dark theme · 2026-04-10</p>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(DIR, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

// ── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'TIDAL — Artist analytics, deep as the ocean');
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 120) : 'OK');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'TIDAL — Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 120) : 'OK');
}

main().catch(console.error);
