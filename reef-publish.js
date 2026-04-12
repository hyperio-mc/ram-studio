'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'reef';

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
const m = pen.metadata;

// SVG from screens — first 4 screens as data URIs for carousel
function screenToDataUri(screen) {
  const svgEls = (screen.elements || []).map(el => {
    if (el.type === 'rect')
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    if (el.type === 'text')
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter,sans-serif'}" text-anchor="${el.textAnchor||'start'}" opacity="${el.opacity||1}" letter-spacing="${el.letterSpacing||0}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    if (el.type === 'circle')
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    if (el.type === 'line')
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
    if (el.type === 'polyline')
      return `<polyline points="${el.points}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1.5}" fill="${el.fill||'none'}" opacity="${el.opacity||1}"/>`;
    if (el.type === 'polygon')
      return `<polygon points="${el.points}" fill="${el.fill||'none'}" opacity="${el.opacity||0.1}"/>`;
    if (el.type === 'ellipse')
      return `<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}" fill="${el.fill}" opacity="${el.opacity||1}"/>`;
    return '';
  }).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${svgEls}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const screenImgs = pen.screens.slice(0,6).map(s => ({
  name: s.name,
  uri: screenToDataUri(s),
}));

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>REEF — Ocean Health. Monitored.</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#060A10; --surf:#0B1018; --card:#111823;
    --acc:#00CFFF; --acc2:#05F080; --warn:#F5A623;
    --txt:#E2EEF8; --txt2:#7A9BB5; --txt3:#4A6A82;
    --border:rgba(0,207,255,0.12); --border2:rgba(255,255,255,0.06);
  }
  html,body{background:var(--bg);color:var(--txt);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* Ambient glows */
  body::before{content:'';position:fixed;top:-200px;left:-200px;width:600px;height:600px;
    background:radial-gradient(circle,rgba(0,207,255,0.08) 0%,transparent 70%);pointer-events:none;z-index:0}
  body::after{content:'';position:fixed;bottom:-200px;right:-200px;width:500px;height:500px;
    background:radial-gradient(circle,rgba(5,240,128,0.07) 0%,transparent 70%);pointer-events:none;z-index:0}

  nav{position:fixed;top:0;left:0;right:0;z-index:100;
    background:rgba(6,10,16,0.85);backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border2);
    display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:64px}
  .nav-brand{font-size:18px;font-weight:800;color:var(--acc);letter-spacing:4px}
  .nav-links{display:flex;gap:32px}
  .nav-links a{color:var(--txt2);text-decoration:none;font-size:14px;transition:color .2s}
  .nav-links a:hover{color:var(--txt)}
  .nav-cta{background:var(--acc);color:#000;padding:8px 22px;border-radius:8px;
    font-size:14px;font-weight:700;text-decoration:none;transition:opacity .2s}
  .nav-cta:hover{opacity:.85}

  /* Hero */
  .hero{position:relative;min-height:100vh;display:flex;align-items:center;
    justify-content:center;flex-direction:column;text-align:center;padding:120px 40px 80px;z-index:1}
  .hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(0,207,255,0.1);
    border:1px solid var(--border);border-radius:20px;padding:6px 16px;
    font-size:11px;font-weight:600;color:var(--acc);letter-spacing:2px;margin-bottom:32px}
  .hero-eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--acc2);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}
  h1{font-size:clamp(48px,6vw,90px);font-weight:800;line-height:1.05;letter-spacing:-2px;
    margin-bottom:24px;background:linear-gradient(135deg,#fff 0%,var(--acc) 50%,var(--acc2) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .hero-sub{font-size:20px;color:var(--txt2);max-width:580px;line-height:1.6;margin:0 auto 48px}
  .hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:var(--acc);color:#000;padding:14px 32px;border-radius:10px;
    font-size:15px;font-weight:700;text-decoration:none;transition:all .2s}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,207,255,0.3)}
  .btn-secondary{border:1px solid var(--border);color:var(--txt);padding:14px 32px;
    border-radius:10px;font-size:15px;font-weight:500;text-decoration:none;transition:all .2s;
    backdrop-filter:blur(10px)}
  .btn-secondary:hover{border-color:var(--acc);color:var(--acc)}

  /* Stats strip */
  .stats-strip{display:flex;justify-content:center;gap:0;margin:56px auto 0;
    max-width:600px;background:rgba(11,16,24,0.8);border:1px solid var(--border2);
    border-radius:16px;overflow:hidden}
  .stat{flex:1;padding:24px 20px;text-align:center;border-right:1px solid var(--border2)}
  .stat:last-child{border-right:none}
  .stat-val{font-size:28px;font-weight:800;color:var(--acc);display:block}
  .stat-val.green{color:var(--acc2)}
  .stat-val.warn{color:var(--warn)}
  .stat-lbl{font-size:11px;color:var(--txt3);margin-top:4px;letter-spacing:.5px}

  /* Screen carousel */
  .screens-section{position:relative;z-index:1;padding:100px 40px;text-align:center}
  .section-tag{font-size:11px;font-weight:700;color:var(--acc2);letter-spacing:3px;margin-bottom:16px}
  .screens-section h2{font-size:clamp(32px,4vw,52px);font-weight:800;letter-spacing:-1px;margin-bottom:16px}
  .screens-section p{color:var(--txt2);font-size:16px;max-width:500px;margin:0 auto 56px;line-height:1.6}
  .carousel{display:flex;gap:20px;overflow-x:auto;padding:20px 40px 40px;
    scrollbar-width:none;justify-content:center;flex-wrap:wrap}
  .carousel::-webkit-scrollbar{display:none}
  .screen-card{flex:0 0 auto;width:195px;background:var(--card);border:1px solid var(--border2);
    border-radius:20px;overflow:hidden;transition:all .3s;cursor:pointer}
  .screen-card:hover{transform:translateY(-8px) scale(1.02);border-color:var(--border);
    box-shadow:0 20px 60px rgba(0,207,255,0.15)}
  .screen-card img{width:100%;display:block}
  .screen-label{padding:12px 16px;font-size:12px;font-weight:600;color:var(--txt2);text-align:left}

  /* Bento feature grid */
  .features{position:relative;z-index:1;padding:80px 40px;max-width:1100px;margin:0 auto}
  .features-header{text-align:center;margin-bottom:56px}
  .features-header h2{font-size:clamp(32px,4vw,48px);font-weight:800;letter-spacing:-1px;margin-bottom:12px}
  .features-header p{color:var(--txt2);font-size:16px;max-width:500px;margin:0 auto}
  .bento{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto;gap:16px}
  .bento-card{background:var(--card);border:1px solid var(--border2);border-radius:20px;
    padding:32px;transition:all .3s;position:relative;overflow:hidden}
  .bento-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,207,255,0.03),transparent);pointer-events:none}
  .bento-card:hover{border-color:var(--border);transform:translateY(-4px)}
  .bento-card.wide{grid-column:span 2}
  .bento-card.tall{grid-row:span 2}
  .bento-icon{font-size:28px;margin-bottom:20px}
  .bento-card h3{font-size:18px;font-weight:700;margin-bottom:10px}
  .bento-card p{font-size:14px;color:var(--txt2);line-height:1.6}
  .bento-accent{position:absolute;bottom:24px;right:24px;font-size:24px;font-weight:800;color:var(--acc);opacity:.2}

  /* Palette section */
  .palette-section{position:relative;z-index:1;padding:80px 40px;text-align:center;max-width:900px;margin:0 auto}
  .palette-section h2{font-size:36px;font-weight:800;letter-spacing:-1px;margin-bottom:8px}
  .palette-section p{color:var(--txt2);font-size:15px;margin-bottom:40px}
  .swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:10px}
  .swatch-dot{width:56px;height:56px;border-radius:14px;border:1px solid var(--border2)}
  .swatch-name{font-size:11px;color:var(--txt3)}
  .swatch-hex{font-size:12px;font-weight:600;color:var(--txt2)}

  /* Footer */
  footer{position:relative;z-index:1;text-align:center;padding:60px 40px;
    border-top:1px solid var(--border2);color:var(--txt3);font-size:13px}
  footer a{color:var(--acc);text-decoration:none}

  @media(max-width:768px){
    .bento{grid-template-columns:1fr}
    .bento-card.wide{grid-column:span 1}
    nav{padding:0 20px}
    .stats-strip{flex-direction:column}
    .stat{border-right:none;border-bottom:1px solid var(--border2)}
    .stat:last-child{border-bottom:none}
  }
</style>
</head>
<body>
<nav>
  <div class="nav-brand">REEF</div>
  <div class="nav-links">
    <a href="#">Monitor</a>
    <a href="#">Alerts</a>
    <a href="#">Reports</a>
    <a href="#">Map</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/reef-viewer">View Design</a>
</nav>

<section class="hero">
  <div class="hero-eyebrow">🌊 OCEAN HEALTH MONITORING</div>
  <h1>Ocean Health.<br>Monitored.</h1>
  <p class="hero-sub">Real-time environmental intelligence for marine researchers, conservationists, and oceanographic institutions. 47 buoys. 6 oceans. One platform.</p>
  <div class="hero-ctas">
    <a class="btn-primary" href="https://ram.zenbin.org/reef-viewer">Explore Design →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/reef-mock">Interactive Mock ☀◑</a>
  </div>
  <div class="stats-strip">
    <div class="stat">
      <span class="stat-val">87.4</span>
      <div class="stat-lbl">HEALTH INDEX</div>
    </div>
    <div class="stat">
      <span class="stat-val green">42/47</span>
      <div class="stat-lbl">SENSORS ONLINE</div>
    </div>
    <div class="stat">
      <span class="stat-val warn">3</span>
      <div class="stat-lbl">ACTIVE ALERTS</div>
    </div>
    <div class="stat">
      <span class="stat-val">312</span>
      <div class="stat-lbl">SPECIES TRACKED</div>
    </div>
  </div>
</section>

<section class="screens-section">
  <div class="section-tag">6 SCREENS · DARK GLASSMORPHISM</div>
  <h2>Built for the field,<br>designed for clarity</h2>
  <p>Every screen is optimized for low-light conditions and fast data comprehension at sea.</p>
  <div class="carousel">
    ${screenImgs.map(s => `
    <div class="screen-card">
      <img src="${s.uri}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <div class="features-header">
    <div class="section-tag">CAPABILITIES</div>
    <h2>From buoy to briefing</h2>
    <p>A full observability stack for ocean science</p>
  </div>
  <div class="bento">
    <div class="bento-card wide">
      <div class="bento-icon">🌡️</div>
      <h3>Real-Time Sensor Network</h3>
      <p>Ingest temperature, pH, dissolved oxygen, salinity, and turbidity data from 47+ buoys across 6 ocean regions. Sub-minute latency. Offline-tolerant edge sync.</p>
      <div class="bento-accent">42</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">⚠️</div>
      <h3>Anomaly Detection</h3>
      <p>ML-powered alerts for algae blooms, acidification events, and sensor failures. Three severity tiers.</p>
      <div class="bento-accent">3</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🗺️</div>
      <h3>Geographic Map View</h3>
      <p>Live sensor map with incident overlays. Visual pulse rings indicate active critical events.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🐋</div>
      <h3>Biodiversity Tracker</h3>
      <p>Species observation counts, conservation status, and migration pattern analysis via hydrophone arrays.</p>
      <div class="bento-accent">312</div>
    </div>
    <div class="bento-card wide">
      <div class="bento-icon">📊</div>
      <h3>Trend Reports & Export</h3>
      <p>7-day, 30-day, and annual health reports with parameter-level breakdowns. Shannon Diversity Index over time. Export to PDF, CSV, or ArcGIS-compatible formats for academic publishing.</p>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-tag">DESIGN SYSTEM</div>
  <h2>Bioluminescent Palette</h2>
  <p>Inspired by deep-sea organisms — dark as the ocean floor, accents as bright as glowing plankton.</p>
  <div class="swatches">
    ${[
      {name:'Abyss',hex:'#060A10',color:'#060A10'},
      {name:'Deep',hex:'#0B1018',color:'#0B1018'},
      {name:'Surface',hex:'#111823',color:'#111823'},
      {name:'Cyan',hex:'#00CFFF',color:'#00CFFF'},
      {name:'Phosphor',hex:'#05F080',color:'#05F080'},
      {name:'Warning',hex:'#F5A623',color:'#F5A623'},
      {name:'Danger',hex:'#FF4B6E',color:'#FF4B6E'},
    ].map(s => `<div class="swatch">
      <div class="swatch-dot" style="background:${s.color};${s.color==='#060A10'?'border:1px solid #333':''}"></div>
      <div class="swatch-name">${s.name}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <p>RAM Design Heartbeat · Ocean Health Monitor</p>
  <p style="margin-top:12px">
    <a href="https://ram.zenbin.org/reef-viewer">Pencil Viewer</a> ·
    <a href="https://ram.zenbin.org/reef-mock">Interactive Mock</a>
  </p>
</footer>
</body>
</html>`;

// ─── VIEWER ──────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'REEF — Ocean Health. Monitored.');
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0,100) : 'OK');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'REEF — Pencil Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0,100) : 'OK');
}
main().catch(console.error);
