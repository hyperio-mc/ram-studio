'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'forma';

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

// ── Palette
const BG    = '#FAF8F5';
const SURF  = '#FFFFFF';
const CARD  = '#F2EFE9';
const INK   = '#1A1714';
const MUTED = '#9A9590';
const ACC   = '#C8441A';
const ACC2  = '#4B6A8D';
const LINE  = '#E5E0D8';

// ── Build SVG previews from pen elements (simplified thumbnails)
function buildScreenSvg(screen, idx) {
  const svgEls = (screen.elements || []).map(e => {
    if(e.type==='rect') return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" rx="${e.rx||0}" fill="${e.fill}" opacity="${e.opacity!==undefined?e.opacity:1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    if(e.type==='text') return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight||400}" font-family="${e.fontFamily||'Inter'}" text-anchor="${e.textAnchor||'start'}" letter-spacing="${e.letterSpacing||0}" opacity="${e.opacity!==undefined?e.opacity:1}">${String(e.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    if(e.type==='circle') return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity!==undefined?e.opacity:1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    if(e.type==='line') return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth||1}" opacity="${e.opacity!==undefined?e.opacity:1}"/>`;
    return '';
  }).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="195" height="422">
  ${svgEls}
</svg>`;
}

const screenPreviews = pen.screens.map((s,i) => {
  const svgStr = buildScreenSvg(s, i);
  const b64 = Buffer.from(svgStr).toString('base64');
  return { name: s.name, dataUri: `data:image/svg+xml;base64,${b64}` };
});

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FORMA — Variable Type Studio</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${BG}; --surf:${SURF}; --card:${CARD};
  --ink:${INK}; --muted:${MUTED}; --acc:${ACC}; --acc2:${ACC2}; --line:${LINE};
  --font:'Inter',system-ui,sans-serif;
}
body{background:var(--bg);color:var(--ink);font-family:var(--font);line-height:1.5;min-height:100vh}
a{color:inherit;text-decoration:none}

/* NAV */
nav{
  position:sticky;top:0;z-index:100;
  background:rgba(250,248,245,0.92);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--line);
  padding:0 32px;height:60px;
  display:flex;align-items:center;justify-content:space-between;
}
.nav-logo{font-size:15px;font-weight:700;letter-spacing:4px;font-family:'Courier New',monospace;color:var(--ink)}
.nav-links{display:flex;gap:32px}
.nav-links a{font-size:13px;color:var(--muted);transition:color .15s}
.nav-links a:hover{color:var(--ink)}
.nav-cta{
  background:var(--ink);color:#fff;border:none;
  padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;
  transition:opacity .15s;
}
.nav-cta:hover{opacity:0.82}

/* HERO */
.hero{max-width:900px;margin:0 auto;padding:80px 32px 40px}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--card);border:1px solid var(--line);
  border-radius:20px;padding:5px 14px;
  font-size:11px;font-weight:600;letter-spacing:1.5px;
  color:var(--acc);font-family:'Courier New',monospace;
  margin-bottom:28px;
}
.hero-eyebrow span{width:6px;height:6px;border-radius:50%;background:var(--acc);display:inline-block}
h1{
  font-size:clamp(52px,8vw,96px);font-weight:800;line-height:0.95;
  letter-spacing:-4px;color:var(--ink);margin-bottom:10px;
}
h1 em{font-weight:200;font-style:normal;letter-spacing:-2px}
.hero-sub{font-size:18px;color:var(--muted);max-width:520px;margin-bottom:36px;line-height:1.55}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px}
.btn-primary{
  background:var(--ink);color:#fff;
  padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;
  transition:opacity .15s;
}
.btn-primary:hover{opacity:0.82}
.btn-secondary{
  background:var(--card);color:var(--ink);border:1px solid var(--line);
  padding:14px 28px;border-radius:10px;font-size:15px;font-weight:500;
  transition:background .15s;
}
.btn-secondary:hover{background:var(--line)}
.hero-meta{font-size:12px;color:var(--muted);font-family:'Courier New',monospace;letter-spacing:0.5px}
.hero-meta span{color:var(--acc);font-weight:700}

/* WEIGHT SPECIMEN STRIP */
.weight-strip{
  background:var(--card);border-top:1px solid var(--line);border-bottom:1px solid var(--line);
  overflow:hidden;padding:24px 32px;
  display:flex;gap:0;align-items:baseline;
}
.weight-strip .wchar{
  font-size:72px;line-height:1;color:var(--ink);flex:1;text-align:center;
  transition:opacity .2s;
}
.weight-strip .wchar:hover{opacity:1!important}

/* SCREENS CAROUSEL */
.screens-section{max-width:900px;margin:0 auto;padding:60px 32px 40px}
.section-label{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--muted);font-family:'Courier New',monospace;margin-bottom:20px}
.screens-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:16px;
}
.screen-card{
  background:var(--surf);border:1px solid var(--line);border-radius:12px;
  overflow:hidden;transition:transform .2s,box-shadow .2s;cursor:pointer;
}
.screen-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(26,23,20,0.08)}
.screen-card img{width:100%;display:block}
.screen-card-label{padding:10px 14px;font-size:11px;font-weight:600;color:var(--muted);border-top:1px solid var(--line);font-family:'Courier New',monospace}

/* FEATURES */
.features{background:var(--surf);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:60px 32px}
.features-inner{max-width:900px;margin:0 auto}
.features-inner h2{font-size:36px;font-weight:700;letter-spacing:-1.5px;margin-bottom:8px}
.features-inner p{font-size:15px;color:var(--muted);margin-bottom:40px}
.bento{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.bento-card{background:var(--card);border-radius:12px;padding:24px;border:1px solid var(--line)}
.bento-card.wide{grid-column:span 2}
.bento-card.tall{grid-row:span 2}
.bento-icon{width:36px;height:36px;background:var(--surf);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:14px;border:1px solid var(--line)}
.bento-card h3{font-size:15px;font-weight:700;margin-bottom:6px}
.bento-card p{font-size:12px;color:var(--muted);line-height:1.5}
.bento-card.accent{background:var(--ink);border-color:var(--ink)}
.bento-card.accent h3,.bento-card.accent p{color:#fff}
.bento-card.accent p{opacity:0.6}
.bento-number{font-size:42px;font-weight:800;letter-spacing:-2px;margin-bottom:4px;color:var(--acc)}

/* PALETTE */
.palette-section{max-width:900px;margin:0 auto;padding:48px 32px}
.swatches{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.swatch{border-radius:8px;padding:12px 16px;font-size:11px;font-family:'Courier New',monospace;font-weight:600;border:1px solid var(--line)}

/* CTA */
.cta-section{background:var(--card);border-top:1px solid var(--line);padding:64px 32px;text-align:center}
.cta-section h2{font-size:40px;font-weight:800;letter-spacing:-2px;margin-bottom:12px}
.cta-section p{font-size:16px;color:var(--muted);margin-bottom:32px}
.cta-links{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* FOOTER */
footer{border-top:1px solid var(--line);padding:24px 32px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--muted);max-width:none}
footer a{color:var(--acc);font-weight:600}
.mono{font-family:'Courier New',monospace;letter-spacing:0.5px}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">FORMA</div>
  <div class="nav-links">
    <a href="#">Catalog</a>
    <a href="#">Studio</a>
    <a href="#">Library</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
  </div>
  <button class="nav-cta">Try Free</button>
</nav>

<section class="hero">
  <div class="hero-eyebrow"><span></span>VARIABLE TYPE STUDIO</div>
  <h1>Haas<br><em>Grotesk</em></h1>
  <p class="hero-sub">Discover, test, and license world-class variable typefaces. From foundry to file — the complete type toolkit for designers who care about craft.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
  <p class="hero-meta">Heartbeat <span>#15</span> · Light Theme · <span>6 screens · 475 elements</span> · ${new Date().toISOString().split('T')[0]}</p>
</section>

<div class="weight-strip">
  ${[100,200,300,400,500,600,700,800,900].map((w,i) =>
    `<span class="wchar" style="font-weight:${w};opacity:${0.12+i*0.1}">Aa</span>`
  ).join('')}
</div>

<section class="screens-section">
  <p class="section-label">06 SCREENS — MOBILE 390×844</p>
  <div class="screens-grid">
    ${screenPreviews.map(s => `
    <div class="screen-card">
      <img src="${s.dataUri}" alt="${s.name}" loading="lazy">
      <div class="screen-card-label">${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <div class="features-inner">
    <h2>Type as brand infrastructure</h2>
    <p>Inspired by Superhuman's bespoke variable font system — a single type investment that covers every context.</p>
    <div class="bento">
      <div class="bento-card wide accent">
        <div class="bento-icon" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.15);color:#fff">Aa</div>
        <h3>Variable Font Explorer</h3>
        <p>Adjust weight (100–900), width (75–125), optical size, and italic angle in real time. See how a typeface breathes across its full axis range before you buy.</p>
      </div>
      <div class="bento-card">
        <div class="bento-number">1,247</div>
        <h3>Typefaces</h3>
        <p>From free system fonts to bespoke studio releases — all filterable by category, variable support, and license type.</p>
      </div>
      <div class="bento-card">
        <div class="bento-number">18</div>
        <h3>Styles per family</h3>
        <p>Haas Grotesk ships with 18 named styles. Variable version covers the full axis continuously.</p>
      </div>
      <div class="bento-card">
        <div class="bento-icon">📋</div>
        <h3>Licensing Engine</h3>
        <p>Personal · Studio · Enterprise. Buy exactly what you need — no hidden pageview overages.</p>
      </div>
      <div class="bento-card">
        <div class="bento-icon">📚</div>
        <h3>Your Library</h3>
        <p>All purchased typefaces in one place. Download any style, check license scope, upgrade anytime.</p>
      </div>
    </div>
  </div>
</section>

<section class="palette-section">
  <p class="section-label">PALETTE — WARM INK</p>
  <div class="swatches">
    ${[
      {color:BG,   name:'BG',   label:'Warm Off-White'},
      {color:SURF, name:'SURF', label:'Pure White'},
      {color:CARD, name:'CARD', label:'Warm Cream'},
      {color:INK,  name:'INK',  label:'Near-Black Warm'},
      {color:MUTED,name:'MUTED',label:'Warm Gray'},
      {color:ACC,  name:'ACC',  label:'Terracotta'},
      {color:ACC2, name:'ACC2', label:'Slate Blue'},
      {color:LINE, name:'LINE', label:'Warm Divider'},
    ].map(s => `
    <div class="swatch" style="background:${s.color};color:${s.color==='#1A1714'?'#FAF8F5':INK}">
      ${s.color}<br><span style="opacity:0.6;font-size:10px">${s.label}</span>
    </div>`).join('')}
  </div>
</section>

<section class="cta-section">
  <h2>Explore FORMA</h2>
  <p>Open the interactive viewer to browse all 6 screens, or launch the mock for a live clickable prototype.</p>
  <div class="cta-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Pencil Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span class="mono">RAM Design Heartbeat #15 · ${new Date().toISOString().split('T')[0]}</span>
  <span>Made by <a href="https://ram.zenbin.org">RAM</a></span>
</footer>

</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'FORMA — Variable Type Studio');
  console.log(`Hero: ${r1.status}`, r1.status!==201?r1.body.slice(0,80):'OK');

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'FORMA — Pencil Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status!==201?r2.body.slice(0,80):'OK');
}
main().catch(console.error);
