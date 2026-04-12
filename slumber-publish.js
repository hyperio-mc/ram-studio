'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'slumber';
const APP_NAME = 'SLUMBER';
const TAGLINE = 'AI Sleep & Recovery';

const BG='#080C14', SURF='#0F1726', ACC='#34D399', ACC2='#818CF8', TEXT='#E2E8F0', MUTED='#94A3B8';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
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
const pen = JSON.parse(penJson);

// Build SVG string from elements
function elToSVG(el) {
  switch(el.type) {
    case 'rect':
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity!=null?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    case 'text':
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter,sans-serif'}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity!=null?el.opacity:1}">${el.content}</text>`;
    case 'circle':
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity!=null?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    case 'line':
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity!=null?el.opacity:1}"/>`;
    case 'path':
      return `<path d="${el.d}" fill="${el.fill||'none'}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||1}" stroke-linecap="${el.strokeLinecap||'round'}" opacity="${el.opacity!=null?el.opacity:1}"/>`;
    default:
      return '';
  }
}

function screenToSVG(screen, idx) {
  const svgEls = screen.elements.map(elToSVG).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">
  <defs>
    <filter id="glow${idx}">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  ${svgEls}
</svg>`;
}

const svgs = pen.screens.map((s, i) => screenToSVG(s, i));
const svgDataURIs = svgs.map(s => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64'));

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SLUMBER — AI Sleep &amp; Recovery</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:${BG};color:${TEXT};font-family:'Inter',sans-serif;overflow-x:hidden}

  /* Aurora background */
  body::before{
    content:'';position:fixed;inset:0;z-index:0;
    background:
      radial-gradient(ellipse 600px 400px at 10% 20%, rgba(129,140,248,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 500px 350px at 85% 40%, rgba(45,212,191,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 700px 500px at 40% 80%, rgba(167,139,250,0.07) 0%, transparent 70%);
    pointer-events:none;
  }

  .container{max-width:1200px;margin:0 auto;padding:0 24px;position:relative;z-index:1}

  /* Nav */
  nav{display:flex;align-items:center;justify-content:space-between;padding:24px 0;border-bottom:1px solid rgba(255,255,255,0.06)}
  .logo{font-size:18px;font-weight:800;letter-spacing:3px;color:${TEXT}}
  .logo span{color:${ACC}}
  nav a{color:${MUTED};text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s}
  nav a:hover{color:${ACC}}
  .nav-links{display:flex;gap:32px;align-items:center}
  .badge{background:rgba(52,211,153,0.12);color:${ACC};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:1px}

  /* Hero */
  .hero{text-align:center;padding:100px 0 80px;position:relative}
  .hero-label{display:inline-flex;align-items:center;gap:8px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);color:${ACC};padding:8px 20px;border-radius:100px;font-size:12px;font-weight:700;letter-spacing:2px;margin-bottom:32px}
  .hero-label::before{content:'✦';font-size:10px}
  h1{font-size:clamp(52px,8vw,96px);font-weight:900;line-height:0.95;letter-spacing:-3px;margin-bottom:24px}
  h1 .acc{color:${ACC}}
  h1 .acc2{color:${ACC2}}
  .hero p{font-size:18px;color:${MUTED};max-width:540px;margin:0 auto 48px;line-height:1.6}
  .hero-cta{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:${ACC};color:${BG};padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;transition:opacity 0.2s}
  .btn-primary:hover{opacity:0.9}
  .btn-ghost{border:1px solid rgba(255,255,255,0.15);color:${TEXT};padding:14px 32px;border-radius:12px;font-weight:500;font-size:15px;text-decoration:none;transition:all 0.2s}
  .btn-ghost:hover{border-color:${ACC};color:${ACC}}

  /* Score ring */
  .hero-ring{position:relative;display:flex;flex-direction:column;align-items:center;margin:64px 0}
  .ring-wrap{position:relative;width:200px;height:200px}
  .ring-wrap svg{transform:rotate(-90deg)}
  .ring-score{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .ring-score .num{font-size:56px;font-weight:900;font-family:'JetBrains Mono',monospace;color:${TEXT}}
  .ring-score .lbl{font-size:10px;color:${MUTED};letter-spacing:2px;font-weight:600;margin-top:-4px}
  .ring-badge{background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.2);color:${ACC};padding:4px 16px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:1.5px;margin-top:16px}
  .ring-sub{color:${MUTED};font-size:13px;margin-top:8px;font-family:'JetBrains Mono',monospace}

  /* Screens carousel */
  .screens{padding:40px 0 80px}
  .screens h2{font-size:36px;font-weight:800;text-align:center;margin-bottom:12px}
  .screens p{color:${MUTED};text-align:center;margin-bottom:48px;font-size:15px}
  .carousel{display:flex;gap:20px;overflow-x:auto;padding:20px 0;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
  .carousel::-webkit-scrollbar{height:4px}
  .carousel::-webkit-scrollbar-track{background:rgba(255,255,255,0.04)}
  .carousel::-webkit-scrollbar-thumb{background:${ACC};border-radius:2px}
  .screen-card{flex:0 0 240px;scroll-snap-align:start;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.06);transition:transform 0.3s}
  .screen-card:hover{transform:translateY(-6px)}
  .screen-card img{width:100%;display:block}
  .screen-card .label{background:${SURF};padding:10px 14px;font-size:12px;font-weight:600;color:${MUTED};letter-spacing:0.5px}

  /* Features bento */
  .features{padding:40px 0 80px}
  .features h2{font-size:36px;font-weight:800;text-align:center;margin-bottom:12px}
  .features p{color:${MUTED};text-align:center;margin-bottom:48px;font-size:15px}
  .bento{display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto auto;gap:16px}
  .bento-card{background:${SURF};border-radius:16px;padding:28px;border:1px solid rgba(255,255,255,0.06);transition:border-color 0.3s}
  .bento-card:hover{border-color:rgba(52,211,153,0.2)}
  .bento-card.wide{grid-column:span 2}
  .bento-card.tall{grid-row:span 2}
  .bento-icon{font-size:28px;margin-bottom:16px}
  .bento-card h3{font-size:18px;font-weight:700;margin-bottom:8px}
  .bento-card p{font-size:14px;color:${MUTED};line-height:1.6}
  .bento-stat{font-size:42px;font-weight:900;font-family:'JetBrains Mono',monospace;color:${ACC};margin-bottom:4px}
  .bento-sub{font-size:13px;color:${MUTED}}

  /* Palette */
  .palette{padding:40px 0 80px}
  .palette h2{font-size:36px;font-weight:800;text-align:center;margin-bottom:48px}
  .swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .swatch{border-radius:12px;width:100px;height:100px;display:flex;flex-direction:column;justify-content:flex-end;padding:10px;font-size:10px;font-weight:600;font-family:'JetBrains Mono',monospace}
  .swatch .hex{color:rgba(255,255,255,0.7)}
  .swatch .name{color:rgba(255,255,255,0.5);font-size:9px;margin-top:2px}

  /* Inspiration */
  .inspo{background:${SURF};border-radius:20px;padding:40px;margin:0 0 80px;border:1px solid rgba(255,255,255,0.06)}
  .inspo h3{font-size:20px;font-weight:700;margin-bottom:16px;color:${ACC}}
  .inspo p{color:${MUTED};line-height:1.7;font-size:14px}
  .inspo ul{list-style:none;margin-top:16px;display:flex;flex-direction:column;gap:8px}
  .inspo ul li{color:${MUTED};font-size:14px;display:flex;gap:8px}
  .inspo ul li::before{content:'·';color:${ACC};font-weight:700}

  /* Footer */
  footer{border-top:1px solid rgba(255,255,255,0.06);padding:40px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:gap}
  footer p{color:${MUTED};font-size:13px}
  footer a{color:${ACC};text-decoration:none;font-size:13px;font-weight:600}
</style>
</head>
<body>
<div class="container">

  <nav>
    <div class="logo">SL<span>U</span>MBER</div>
    <div class="nav-links">
      <a href="#screens">Screens</a>
      <a href="#features">Features</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
      <span class="badge">DARK ◑</span>
    </div>
  </nav>

  <div class="hero">
    <div class="hero-label">RAM DESIGN HEARTBEAT #42</div>
    <h1>Sleep<br/><span class="acc">smarter</span>,<br/>recover <span class="acc2">faster</span></h1>
    <p>AI-powered sleep tracking that reads your body's signals and translates them into actions for the next day.</p>
    <div class="hero-cta">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open in Viewer →</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">☀◑ Interactive Mock</a>
    </div>
  </div>

  <!-- Sleep score ring -->
  <div class="hero-ring">
    <div class="ring-wrap">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
        <circle cx="100" cy="100" r="80" fill="none" stroke="${ACC}" stroke-width="10"
          stroke-dasharray="${2*Math.PI*80*0.84} ${2*Math.PI*80*(1-0.84)}"
          stroke-linecap="round"/>
      </svg>
      <div class="ring-score">
        <div class="num">84</div>
        <div class="lbl">SCORE</div>
      </div>
    </div>
    <div class="ring-badge">EXCELLENT</div>
    <div class="ring-sub">7h 46m · 94% efficiency · 5 cycles</div>
  </div>

  <!-- Screens -->
  <div class="screens" id="screens">
    <h2>6 Screens</h2>
    <p>Sleep score, body metrics, AI insights, trends, profile, and deep analysis</p>
    <div class="carousel">
      ${pen.screens.map((s, i) => `
      <div class="screen-card">
        <img src="${svgDataURIs[i]}" alt="${s.name}" loading="lazy"/>
        <div class="label">${String(i+1).padStart(2,'0')} · ${s.name}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Features bento -->
  <div class="features" id="features">
    <h2>Built on research</h2>
    <p>Every decision traced to a specific design trend observed in the wild</p>
    <div class="bento">
      <div class="bento-card wide">
        <div class="bento-icon">◎</div>
        <h3>Ambient Aurora Backgrounds</h3>
        <p>Barely-perceptible radial gradient blobs (purple, teal, indigo) composited at 7–12% opacity, inspired by Godly.website's AI startup aesthetic — making dark screens feel luminous rather than simply black.</p>
      </div>
      <div class="bento-card">
        <div class="bento-stat">532</div>
        <div class="bento-sub">elements across 6 screens</div>
      </div>
      <div class="bento-card">
        <div class="bento-icon">✦</div>
        <h3>Glassmorphic Cards</h3>
        <p>Subtle white border hairlines at rgba(255,255,255,0.06–0.2) layered on elevated surfaces — echoing Apple's Liquid Glass influence seen across DarkModeDesign.com.</p>
      </div>
      <div class="bento-card">
        <div class="bento-icon">◈</div>
        <h3>Mono Data Readouts</h3>
        <p>All numeric health data — HRV, HR, SpO₂, sleep duration — rendered in JetBrains Mono. The "system readout" aesthetic borrowed from Saaspo's dev tool category.</p>
      </div>
      <div class="bento-card wide">
        <div class="bento-icon">◉</div>
        <h3>Single-Accent Color System</h3>
        <p>Emerald #34D399 as the only interactive color across all 6 screens. One accent, used sparingly for CTAs, active states, and data highlights only — everything else monochrome. The clearest pattern from DarkModeDesign's Alphamark and Yvdh features.</p>
      </div>
    </div>
  </div>

  <!-- Palette -->
  <div class="palette">
    <h2>Palette</h2>
    <div class="swatches">
      ${[
        {col:BG,name:'Midnight','label':'BG'},
        {col:'#0F1726',name:'Surface','label':'SURF'},
        {col:'#162138',name:'Elevated','label':'ELEV'},
        {col:ACC,name:'Emerald','label':'ACC'},
        {col:ACC2,name:'Indigo','label':'ACC2'},
        {col:'#2DD4BF',name:'Teal','label':'TEAL'},
        {col:TEXT,name:'Text','label':'TEXT'},
        {col:MUTED,name:'Muted','label':'MUTED'},
      ].map(s=>`
      <div class="swatch" style="background:${s.col}">
        <div class="hex">${s.col}</div>
        <div class="name">${s.name}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Inspiration -->
  <div class="inspo">
    <h3>Research Sources</h3>
    <p>This design was directly inspired by three specific trends observed across four sites during this heartbeat's research phase:</p>
    <ul>
      <li><strong>DarkModeDesign.com</strong> — Alphamark (black + neon yellow) and Yvdh (neon green single-accent) proved that one vivid color on pure dark is stronger than multi-accent palettes</li>
      <li><strong>Godly.website</strong> — AI startup sites use deep purple-to-teal gradient blobs as ambient aurora backgrounds, creating luminous atmosphere without color noise</li>
      <li><strong>Saaspo.com</strong> — AI health & wellness category is rising fast; calm midnight + emerald palettes signal trust and precision in biometric apps</li>
      <li><strong>DarkModeDesign.com</strong> — Apple's Liquid Glass (iOS 26) has re-legitimized glassmorphism; white hairline borders on semi-transparent surfaces are appearing across curated dark UI</li>
    </ul>
  </div>

  <footer>
    <p>RAM Design Heartbeat #42 · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
    <div style="display:flex;gap:24px">
      <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
    </div>
  </footer>

</div>
</body>
</html>`;

// ─── Viewer ───────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'SLUMBER — AI Sleep & Recovery');
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'SLUMBER — Viewer');
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
