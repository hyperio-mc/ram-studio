'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG    = 'hilt';
const NAME    = 'HILT';
const TAGLINE = 'Get a grip on your wealth';

const BG   = '#080F1C';
const SURF = '#0D1830';
const CARD = '#111F3A';
const ACC  = '#D4A843';
const ACC2 = '#4DB6AC';
const RED  = '#E05C5C';
const GRN  = '#56C97B';
const TEXT = '#E8ECF4';

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

// ── Render SVG for each screen ──────────────────────────────────────────────
function renderEl(el) {
  if (el.type === 'rect') {
    return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity!=null?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
  }
  if (el.type === 'circle') {
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity!=null?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
  }
  if (el.type === 'text') {
    const anchor = el.textAnchor||'start';
    return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter,sans-serif'}" text-anchor="${anchor}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity!=null?el.opacity:1}">${el.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
  }
  if (el.type === 'line') {
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity!=null?el.opacity:1}"/>`;
  }
  return '';
}

function screenToSvg(screen) {
  const svgEls = screen.elements.map(renderEl).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${svgEls}</svg>`;
}

const svgs = pen.screens.map(screenToSvg);
const svgDataUris = svgs.map(s => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64'));

// ── Hero page ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>HILT — Get a grip on your wealth</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${BG};--surf:${SURF};--card:${CARD};
  --acc:${ACC};--acc2:${ACC2};--text:${TEXT};
  --red:${RED};--grn:${GRN};--muted:rgba(232,236,244,0.5);
}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}

/* Nav */
nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(8,15,28,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(212,168,67,0.1)}
.nav-logo{font-size:20px;font-weight:900;letter-spacing:3px;color:var(--acc)}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:var(--muted);text-decoration:none;font-size:14px;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--acc);color:#080F1C;padding:10px 24px;border-radius:100px;font-weight:700;font-size:14px;text-decoration:none;transition:opacity .2s}
.nav-cta:hover{opacity:0.85}

/* Hero */
.hero{min-height:100vh;display:flex;align-items:center;padding:120px 40px 80px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-200px;right:-200px;width:700px;height:700px;background:radial-gradient(circle,rgba(212,168,67,0.08) 0%,transparent 70%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-100px;left:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(77,182,172,0.06) 0%,transparent 70%);pointer-events:none}
.hero-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;width:100%}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(212,168,67,0.1);border:1px solid rgba(212,168,67,0.3);border-radius:100px;padding:6px 16px;font-size:12px;color:var(--acc);letter-spacing:1px;font-weight:600;margin-bottom:28px}
h1{font-size:clamp(48px,5vw,72px);font-weight:900;line-height:1.05;letter-spacing:-2px;margin-bottom:24px}
h1 span{color:var(--acc)}
.hero-sub{font-size:18px;color:var(--muted);line-height:1.6;max-width:480px;margin-bottom:40px}
.hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.btn-primary{background:var(--acc);color:#080F1C;padding:16px 36px;border-radius:100px;font-weight:700;font-size:16px;text-decoration:none;transition:all .2s}
.btn-primary:hover{opacity:0.85;transform:translateY(-1px)}
.btn-ghost{color:var(--text);padding:16px 24px;font-size:15px;text-decoration:none;display:flex;align-items:center;gap:8px;opacity:0.7;transition:opacity .2s}
.btn-ghost:hover{opacity:1}
.hero-stat{font-size:13px;color:var(--muted);margin-top:24px}
.hero-stat strong{color:var(--grn);font-weight:700}

/* Phone stack */
.phone-stack{position:relative;height:600px;display:flex;align-items:center;justify-content:center}
.phone{width:220px;border-radius:40px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(212,168,67,0.15);position:absolute;transition:transform .3s}
.phone img{width:100%;display:block}
.phone-main{z-index:3;transform:translateY(-10px) scale(1)}
.phone-left{z-index:2;transform:translateX(-170px) translateY(30px) rotate(-8deg) scale(0.88);opacity:0.7}
.phone-right{z-index:2;transform:translateX(170px) translateY(30px) rotate(8deg) scale(0.88);opacity:0.7}
.phone-back{z-index:1;transform:translateY(60px) scale(0.78);opacity:0.45}

/* Features */
.section{padding:100px 40px;max-width:1200px;margin:0 auto}
.section-label{font-size:12px;letter-spacing:2px;color:var(--acc);font-weight:600;margin-bottom:12px}
.section-title{font-size:clamp(36px,4vw,52px);font-weight:800;letter-spacing:-1.5px;margin-bottom:16px;line-height:1.1}
.section-sub{font-size:16px;color:var(--muted);max-width:520px;line-height:1.6;margin-bottom:60px}

/* Bento grid */
.bento{display:grid;grid-template-columns:repeat(12,1fr);grid-template-rows:auto;gap:16px}
.bento-card{background:var(--surf);border:1px solid rgba(212,168,67,0.1);border-radius:24px;padding:28px;transition:border-color .2s}
.bento-card:hover{border-color:rgba(212,168,67,0.3)}
.b-wide{grid-column:span 7}
.b-slim{grid-column:span 5}
.b-third{grid-column:span 4}
.b-full{grid-column:span 12}
.b-half{grid-column:span 6}
.card-icon{font-size:28px;margin-bottom:16px}
.card-title{font-size:20px;font-weight:700;margin-bottom:8px}
.card-desc{font-size:14px;color:var(--muted);line-height:1.6}
.card-metric{font-size:48px;font-weight:900;color:var(--acc);letter-spacing:-2px;margin:16px 0 4px}
.card-metric-sub{font-size:13px;color:var(--muted)}

/* Metric highlights */
.metric-row{display:flex;gap:16px;margin:12px 0}
.metric-chip{background:rgba(86,201,123,0.1);border:1px solid rgba(86,201,123,0.2);border-radius:8px;padding:4px 12px;font-size:12px;color:var(--grn);font-weight:600}
.metric-chip.neg{background:rgba(224,92,92,0.1);border-color:rgba(224,92,92,0.2);color:var(--red)}
.metric-chip.gold{background:rgba(212,168,67,0.1);border-color:rgba(212,168,67,0.2);color:var(--acc)}

/* Palette */
.palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px}
.swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
.swatch-color{width:52px;height:52px;border-radius:12px;border:1px solid rgba(255,255,255,0.1)}
.swatch-label{font-size:11px;color:var(--muted);font-family:'Courier New',monospace}

/* Screen carousel */
.screens-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:20px}
.screen-card{background:var(--surf);border:1px solid rgba(212,168,67,0.1);border-radius:20px;overflow:hidden;transition:transform .2s,border-color .2s}
.screen-card:hover{transform:translateY(-4px);border-color:rgba(212,168,67,0.3)}
.screen-card img{width:100%;display:block}
.screen-name{padding:12px 16px;font-size:12px;color:var(--muted);font-weight:600;letter-spacing:0.5px}

/* Links section */
.links-bar{background:var(--surf);border:1px solid rgba(212,168,67,0.15);border-radius:24px;padding:32px 40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:gap;margin-top:60px;gap:24px}
.links-bar h3{font-size:20px;font-weight:700}
.links-bar p{font-size:14px;color:var(--muted);margin-top:4px}
.link-btns{display:flex;gap:12px;flex-wrap:wrap}
.link-btn{padding:10px 20px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s}
.lb-primary{background:var(--acc);color:#080F1C}
.lb-secondary{background:transparent;border:1px solid rgba(212,168,67,0.4);color:var(--acc)}
.lb-secondary:hover{background:rgba(212,168,67,0.1)}

/* Footer */
footer{border-top:1px solid rgba(212,168,67,0.08);padding:40px;text-align:center;color:var(--muted);font-size:13px}
footer strong{color:var(--acc)}

@media(max-width:768px){
  .hero-inner{grid-template-columns:1fr}
  .phone-stack{height:400px;margin-top:40px}
  .phone-left,.phone-right,.phone-back{display:none}
  .b-wide,.b-slim,.b-third,.b-half{grid-column:span 12}
  .screens-grid{grid-template-columns:1fr 1fr}
}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">HILT</div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#palette">Design</a></li>
  </ul>
  <a href="https://ram.zenbin.org/hilt-mock" class="nav-cta">Try Mock →</a>
</nav>

<section class="hero">
  <div class="hero-inner">
    <div>
      <div class="hero-badge">◈ RAM Heartbeat #395 · Wealth OS</div>
      <h1>Get a <span>grip</span> on your wealth</h1>
      <p class="hero-sub">A personal finance OS built for serious investors. Real-time portfolio tracking, bento-grid dashboard, and AI-powered insights — all in one dark, focused interface.</p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/hilt-mock" class="btn-primary">Explore Mock ☀◑</a>
        <a href="https://ram.zenbin.org/hilt-viewer" class="btn-ghost">View in Pencil →</a>
      </div>
      <p class="hero-stat">Average user tracks <strong>↑ +24.4% YTD</strong> across 847 transactions</p>
    </div>
    <div class="phone-stack">
      <div class="phone phone-left"><img src="${svgDataUris[4]}" alt="Markets"></div>
      <div class="phone phone-right"><img src="${svgDataUris[2]}" alt="Analytics"></div>
      <div class="phone phone-back"><img src="${svgDataUris[3]}" alt="Transactions"></div>
      <div class="phone phone-main"><img src="${svgDataUris[0]}" alt="Dashboard"></div>
    </div>
  </div>
</section>

<div style="max-width:1200px;margin:0 auto;padding:0 40px">

  <!-- Bento features grid -->
  <section class="section" id="features">
    <div class="section-label">CAPABILITIES</div>
    <h2 class="section-title">One screen to rule them all</h2>
    <p class="section-sub">Inspired by the bento grid pattern from godly.website — every feature gets exactly one cell, each cell gets exactly one idea.</p>

    <div class="bento">
      <!-- Wide: Net Worth hero -->
      <div class="bento-card b-wide">
        <div class="card-icon">◈</div>
        <div class="card-title">Net Worth Dashboard</div>
        <div class="card-metric">$247,830</div>
        <div class="metric-row">
          <span class="metric-chip">↑ +1.32% today</span>
          <span class="metric-chip">↑ +24.4% YTD</span>
        </div>
        <div class="card-desc">All accounts, investments, and savings unified into one live number. Updated in real time. No manual entry ever.</div>
      </div>
      <!-- Slim: Portfolio -->
      <div class="bento-card b-slim">
        <div class="card-icon">⬡</div>
        <div class="card-title">Portfolio Tracking</div>
        <div class="card-desc">Holdings, allocation, and performance across stocks, ETFs, and crypto in a single scrollable list with live sparklines.</div>
        <div class="metric-row" style="margin-top:20px">
          <span class="metric-chip gold">AAPL · +2.1%</span>
          <span class="metric-chip">BTC · +5.1%</span>
        </div>
      </div>
      <!-- Third: Markets -->
      <div class="bento-card b-third">
        <div class="card-icon">◐</div>
        <div class="card-title">Markets Watchlist</div>
        <div class="card-desc">Live prices with embedded sparklines. S&P, NASDAQ, and custom tickers at a glance.</div>
      </div>
      <!-- Third: Analytics -->
      <div class="bento-card b-third">
        <div class="card-icon">◎</div>
        <div class="card-title">Performance Analytics</div>
        <div class="card-desc">30-day chart, benchmark comparison vs S&P 500, best/worst days, and YTD return — all on one screen.</div>
      </div>
      <!-- Third: Insights -->
      <div class="bento-card b-third" style="border-color:rgba(212,168,67,0.3);background:rgba(212,168,67,0.04)">
        <div class="card-icon">⭐</div>
        <div class="card-title" style="color:var(--acc)">Smart Insights</div>
        <div class="card-desc">AI reads your data and surfaces what matters: "On pace to exceed last year's gains by 8%."</div>
      </div>
      <!-- Half: Transactions -->
      <div class="bento-card b-half">
        <div class="card-icon">⊕</div>
        <div class="card-title">Transaction Feed</div>
        <div class="card-desc">Chronological history with auto-categorization, merchant names, and amounts. Search + filter by category in one tap.</div>
      </div>
      <!-- Half: Wealth Score -->
      <div class="bento-card b-half">
        <div class="card-icon">⊘</div>
        <div class="card-title">Wealth Score</div>
        <div class="card-metric" style="font-size:48px">847</div>
        <div class="card-metric-sub">Excellent · Based on savings rate, diversification & growth velocity</div>
      </div>
    </div>
  </section>

  <!-- Screen gallery -->
  <section class="section" id="screens" style="padding-top:0">
    <div class="section-label">6 SCREENS</div>
    <h2 class="section-title">Every screen earns its place</h2>
    <div class="screens-grid">
      ${pen.screens.map((s,i)=>`
      <div class="screen-card">
        <img src="${svgDataUris[i]}" alt="${s.name}">
        <div class="screen-name">${String(i+1).padStart(2,'0')} · ${s.name.toUpperCase()}</div>
      </div>`).join('')}
    </div>
  </section>

  <!-- Palette -->
  <section class="section" id="palette" style="padding-top:0">
    <div class="section-label">PALETTE</div>
    <h2 class="section-title">Deep navy · old gold · teal</h2>
    <p class="section-sub">Inspired by Revolut's 3D mockup dark finance aesthetic from darkmodedesign.com — not pure black but midnight navy, not garish yellow but aged gold.</p>
    <div class="palette-row">
      ${[
        {hex:BG,name:'Midnight'},
        {hex:SURF,name:'Deep Navy'},
        {hex:CARD,name:'Card'},
        {hex:ACC,name:'Old Gold'},
        {hex:ACC2,name:'Teal'},
        {hex:GRN,name:'Gain'},
        {hex:RED,name:'Loss'},
        {hex:TEXT,name:'Text'},
      ].map(c=>`<div class="swatch"><div class="swatch-color" style="background:${c.hex}"></div><div class="swatch-label">${c.hex}</div><div style="font-size:11px;color:var(--muted);margin-top:2px">${c.name}</div></div>`).join('')}
    </div>

    <!-- Links bar -->
    <div class="links-bar">
      <div>
        <h3>Explore HILT</h3>
        <p>View the full design + interactive mock</p>
      </div>
      <div class="link-btns">
        <a href="https://ram.zenbin.org/hilt-viewer" class="link-btn lb-secondary">Pencil Viewer →</a>
        <a href="https://ram.zenbin.org/hilt-mock" class="link-btn lb-primary">Interactive Mock ☀◑</a>
      </div>
    </div>
  </section>

</div>

<footer>
  <p>RAM Design Heartbeat #395 · <strong>HILT</strong> · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
  <p style="margin-top:8px;opacity:0.5">Inspired by darkmodedesign.com Revolut navy · godly.website bento grid · scrnshts.club interior pattern</p>
</footer>

</body>
</html>`;

// ── Inject pen into viewer ──────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}  ${r1.body.slice(0,80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}  ${r2.body.slice(0,80)}`);
}

main().catch(console.error);
