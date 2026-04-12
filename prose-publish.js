'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'prose';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

const BG     = '#FAF6F0';
const SURF   = '#FFFFFF';
const CARD   = '#F3EDE3';
const TEXT   = '#1E1812';
const SIENNA = '#B85A2A';
const SAGE   = '#4E7A56';
const PEACH  = '#E8A882';
const SAND   = '#C9A87C';
const MUTED  = 'rgba(30,24,18,0.45)';

function screenSvg(screen) {
  const els = screen.elements || [];
  let out = '';
  for (const e of els) {
    if (e.type === 'rect') {
      const rx = e.rx||0, op = e.opacity!==undefined?e.opacity:1;
      const sk = e.stroke&&e.stroke!=='none'?`stroke="${e.stroke}" stroke-width="${e.sw||1}"`:'';
      out += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${rx}" fill="${e.fill}" opacity="${op}" ${sk}/>`;
    } else if (e.type === 'text') {
      const op = e.opacity!==undefined?e.opacity:1;
      const ls = e.ls?`letter-spacing="${e.ls}"`:'';
      const safe = String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      const fontFamily = (e.font||'').includes('Georgia') ? 'Georgia,serif' : 'Inter,sans-serif';
      out += `<text x="${e.x}" y="${e.y}" font-size="${e.size}" fill="${e.fill}" font-weight="${e.fw||400}" text-anchor="${e.anchor||'start'}" font-family="${fontFamily}" opacity="${op}" ${ls}>${safe}</text>`;
    } else if (e.type === 'circle') {
      const op = e.opacity!==undefined?e.opacity:1;
      const sk = e.stroke&&e.stroke!=='none'?`stroke="${e.stroke}" stroke-width="${e.sw||1}"`:'';
      out += `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${op}" ${sk}/>`;
    } else if (e.type === 'line') {
      const op = e.opacity!==undefined?e.opacity:1;
      out += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.sw||1}" opacity="${op}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${out}</svg>`;
}

const svgUris = pen.screens.map(s => 'data:image/svg+xml;base64,' + Buffer.from(screenSvg(s)).toString('base64'));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PROSE — Reading Tracker & Book Notes</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${BG};--surf:${SURF};--card:${CARD};--text:${TEXT};
    --sienna:${SIENNA};--sage:${SAGE};--peach:${PEACH};--sand:${SAND};--muted:${MUTED};
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* HERO */
  .hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;
    padding:80px 56px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-80px;right:-60px;width:440px;height:440px;
    background:radial-gradient(circle,rgba(184,90,42,0.1) 0%,transparent 65%);border-radius:50%;pointer-events:none}
  .hero::after{content:'';position:absolute;bottom:-60px;left:-40px;width:380px;height:380px;
    background:radial-gradient(circle,rgba(232,168,130,0.12) 0%,transparent 65%);border-radius:50%;pointer-events:none}
  .eyebrow{display:inline-flex;align-items:center;gap:8px;
    background:rgba(184,90,42,0.08);border:1px solid rgba(184,90,42,0.2);
    border-radius:100px;padding:6px 16px;font-size:11px;font-weight:600;
    color:var(--sienna);letter-spacing:.1em;text-transform:uppercase;margin-bottom:28px;width:fit-content}
  h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(72px,10vw,120px);
    font-weight:900;line-height:.88;letter-spacing:-.02em;color:var(--text);margin-bottom:28px;
    position:relative;z-index:1}
  h1 em{color:var(--sienna);font-style:italic}
  .hero-sub{font-size:18px;line-height:1.7;color:var(--muted);max-width:520px;margin-bottom:40px;
    font-family:'Playfair Display',serif;font-style:italic}
  .ctas{display:flex;gap:14px;flex-wrap:wrap}
  .btn-p{background:var(--sienna);color:#fff;padding:14px 32px;border-radius:100px;
    font-size:14px;font-weight:600;text-decoration:none;transition:transform .15s,box-shadow .15s}
  .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(184,90,42,0.3)}
  .btn-s{background:transparent;border:1.5px solid rgba(30,24,18,0.2);color:var(--text);
    padding:14px 32px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;
    transition:border-color .15s}
  .btn-s:hover{border-color:var(--sienna)}
  .hero-stats{display:flex;gap:48px;margin-top:52px;padding-top:40px;
    border-top:1px solid rgba(30,24,18,0.1)}
  .stat-val{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:var(--sienna)}
  .stat-lab{font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:3px}

  /* TICKER */
  .ticker{background:var(--sienna);padding:10px 0;overflow:hidden;white-space:nowrap}
  .ticker-inner{display:inline-flex;animation:tick 32s linear infinite}
  .ti{font-family:'Playfair Display',serif;font-size:12px;font-style:italic;
    color:rgba(255,255,255,0.85);padding:0 28px;letter-spacing:.04em}
  .td{color:rgba(255,255,255,0.4)}
  @keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

  /* SCREENS */
  .screens{padding:80px 56px}
  .section-eyebrow{font-size:11px;font-weight:600;color:var(--sienna);letter-spacing:.12em;
    text-transform:uppercase;margin-bottom:10px}
  .section-title{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,50px);
    font-weight:700;color:var(--text);margin-bottom:48px}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:18px;
    max-width:1280px;margin:0 auto}
  .scard{background:var(--surf);border-radius:18px;overflow:hidden;
    border:1px solid rgba(30,24,18,0.07);transition:transform .2s,box-shadow .2s}
  .scard:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(30,24,18,0.08)}
  .scard img{width:100%;display:block}
  .scard-label{padding:12px 16px;font-family:'Playfair Display',serif;
    font-size:12px;font-weight:700;font-style:italic;color:var(--sienna)}

  /* FEATURES */
  .features{padding:80px 56px;background:var(--card)}
  .feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;
    max-width:1100px;margin:40px auto 0}
  .feat{background:var(--surf);border-radius:16px;padding:28px;
    border:1px solid rgba(30,24,18,0.07)}
  .feat-icon{width:40px;height:40px;border-radius:10px;
    background:rgba(184,90,42,0.1);display:flex;align-items:center;justify-content:center;
    font-family:'Playfair Display',serif;font-size:18px;color:var(--sienna);margin-bottom:14px;font-style:italic}
  .feat-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;
    color:var(--text);margin-bottom:6px}
  .feat-desc{font-size:13px;color:var(--muted);line-height:1.65}

  /* QUOTE PULL */
  .pullquote{padding:80px 56px;text-align:center}
  .pq{font-family:'Playfair Display',serif;font-size:clamp(22px,3.5vw,40px);
    font-style:italic;color:var(--text);max-width:760px;margin:0 auto;line-height:1.4}
  .pq-attr{margin-top:20px;font-size:13px;color:var(--muted)}

  /* PALETTE */
  .palette{padding:60px 56px;background:var(--card)}
  .swatches{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
  .sw{flex:1;min-width:80px;height:72px;border-radius:12px;
    display:flex;flex-direction:column;justify-content:flex-end;padding:10px 12px}
  .sw-name{font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
  .sw-hex{font-size:9px;opacity:.6}

  footer{background:var(--text);color:rgba(250,246,240,0.6);text-align:center;
    padding:40px 24px;font-size:12px}
  footer a{color:var(--peach);text-decoration:none}

  @media(max-width:640px){
    .hero,.screens,.features,.pullquote,.palette{padding:80px 24px 48px}
    .hero-stats{gap:24px;flex-wrap:wrap}
  }
</style>
</head>
<body>

<section class="hero">
  <div class="eyebrow">Heartbeat #48 · Light Theme · Reading</div>
  <h1>PROSE<br><em>Read more,</em><br>Remember it.</h1>
  <p class="hero-sub">Track your reading life — log sessions, save highlights, write notes, and discover what to read next. Built for people who take books seriously.</p>
  <div class="ctas">
    <a href="https://ram.zenbin.org/prose-viewer" class="btn-p">View in Pencil.dev →</a>
    <a href="https://ram.zenbin.org/prose-mock" class="btn-s">Interactive Mock ☀◑</a>
  </div>
  <div class="hero-stats">
    <div><div class="stat-val">6</div><div class="stat-lab">Screens</div></div>
    <div><div class="stat-val">500</div><div class="stat-lab">Elements</div></div>
    <div><div class="stat-val">Light</div><div class="stat-lab">Theme</div></div>
    <div><div class="stat-val">#48</div><div class="stat-lab">Heartbeat</div></div>
  </div>
</section>

<div class="ticker"><div class="ticker-inner">
${['Library','Session','Highlights','Discover','Notes','Reading Streak','Book Notes',
   'The Women','James','Orbital','Tomorrow','Intermezzo','All Fours','Literary Fiction'].map(t =>
  `<span class="ti">${t} <span class="td">·</span></span>`).join('').repeat(2)}
</div></div>

<section class="screens">
  <div class="section-eyebrow">6 screens · 500 elements</div>
  <div class="section-title">Your Reading Life, Designed</div>
  <div class="screens-grid">
    ${pen.screens.map((s,i) => `
    <div class="scard">
      <img src="${svgUris[i]}" alt="${s.name}" loading="lazy">
      <div class="scard-label">${['i.','ii.','iii.','iv.','v.','vi.'][i]} ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="pullquote">
  <div class="pq">"A reader lives a thousand lives before he dies. The man who never reads lives only one."</div>
  <div class="pq-attr">— George R.R. Martin, cited in highlights screen</div>
</section>

<section class="features">
  <div class="section-eyebrow">Design System</div>
  <div class="section-title">What Makes PROSE</div>
  <div class="feat-grid">
    <div class="feat">
      <div class="feat-icon">Pp</div>
      <div class="feat-title">Display Serif Throughout</div>
      <div class="feat-desc">Screen titles, pull quotes, book titles, and the hero mark all use a Playfair Display–inspired serif. Inspired by Fundable's Piazzolla + Open Runde pairing from Lapa Ninja 2025 — an unconventional serif choice for a mobile app, but natural for a reading context.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(232,168,130,0.15);color:${SIENNA}">◉</div>
      <div class="feat-title">Cloud Dancer Palette</div>
      <div class="feat-desc">Background ${BG} is directly inspired by Pantone's 2026 Color of the Year — Cloud Dancer — a warm, soft near-white described as a "calming blank canvas." Sienna ${SIENNA} as primary accent reads as ink on warm paper, not a tech brand color.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(78,122,86,0.12);color:${SAGE}">⊟</div>
      <div class="feat-title">Semantic Status Colors</div>
      <div class="feat-desc">Peach left-border = personal notes and thoughts. Sage = books read / completed states. Sienna = primary actions and active states. Sand = discovery / wish-list items. A consistent four-signal system across all six screens.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(201,168,124,0.15);color:${SAND}">◈</div>
      <div class="feat-title">Session Timer with Page Counter</div>
      <div class="feat-desc">The reading session screen centers on a large serif timer surrounded by radial progress dots — showing elapsed time as the primary metric. Page entry (+/−) buttons flank the page count. Mood picker captures reading energy state for habit analytics.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">ii.</div>
      <div class="feat-title">Pull-Quote Highlight Cards</div>
      <div class="feat-desc">Saved quotes render in serif italic, personal notes in regular Inter — the font switch signals the boundary between someone else's words and your own. Colour-coded left borders distinguish quote / note / idea types at a glance.</div>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:rgba(184,90,42,0.1);color:${SIENNA}">▶</div>
      <div class="feat-title">Progress Bars Everywhere</div>
      <div class="feat-desc">Book-level (currently reading), library-level (reading vs. want vs. read), goal-level (40-book year target), genre-level (favourite categories), session-level (pages read today) — a consistent bar primitive carries all progress semantics.</div>
    </div>
  </div>
</section>

<section class="palette">
  <div class="section-eyebrow">Palette</div>
  <div class="section-title">Warm Parchment Spectrum</div>
  <div class="swatches">
    ${[
      {col:BG,    name:'Cloud Dancer',light:false},
      {col:SURF,  name:'Surface',     light:false},
      {col:CARD,  name:'Parchment',   light:false},
      {col:TEXT,  name:'Warm Black',  light:true },
      {col:SIENNA,name:'Sienna',      light:true },
      {col:SAGE,  name:'Sage',        light:true },
      {col:PEACH, name:'Peach',       light:false},
      {col:SAND,  name:'Sand',        light:false},
    ].map(s=>`<div class="sw" style="background:${s.col}">
      <div class="sw-name" style="color:${s.light?'rgba(255,255,255,0.8)':'rgba(30,24,18,0.6)'}">${s.name}</div>
      <div class="sw-hex" style="color:${s.light?'rgba(255,255,255,0.5)':'rgba(30,24,18,0.45)'}">${s.col}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <p>PROSE · Heartbeat #48 · RAM Design Studio · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:8px;opacity:.6">Inspired by Fundable's Piazzolla serif pairing on Lapa Ninja · Pantone Cloud Dancer 2026 · land-book peach/warm editorial trend</p>
</footer>

</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'PROSE — Reading Tracker & Book Notes');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'PROSE — Pencil.dev Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
