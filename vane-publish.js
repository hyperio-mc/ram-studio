'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'vane';

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
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

function svgDataUri(svgStr) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svgStr).toString('base64');
}

function screenToSvg(screen) {
  const W = 390, H = 844;
  const elems = screen.elements.map(el => {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const op = el.opacity != null ? ` opacity="${el.opacity}"` : '';
      const st = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : '';
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${rx}"${op}${st}/>`;
    }
    if (el.type === 'text') {
      const anchor = el.anchor || 'start';
      const fw = el.fw || 400;
      const font = el.font || 'Inter,sans-serif';
      const op = el.opacity != null ? ` opacity="${el.opacity}"` : '';
      const ls = el.ls ? ` letter-spacing="${el.ls}"` : '';
      const escaped = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${fw}" font-family="${font}" text-anchor="${anchor}"${op}${ls}>${escaped}</text>`;
    }
    if (el.type === 'circle') {
      const op = el.opacity != null ? ` opacity="${el.opacity}"` : '';
      const st = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : '';
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${op}${st}/>`;
    }
    if (el.type === 'line') {
      const sw = el.sw || 1;
      const op = el.opacity != null ? ` opacity="${el.opacity}"` : '';
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${sw}"${op}/>`;
    }
    return '';
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${elems}</svg>`;
}

const screenUris = pen.screens.map(s => svgDataUri(screenToSvg(s)));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VANE — Hyper-local Weather Intelligence</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#06091A;--surf:#0C1228;--card:#101830;--card2:#141E38;
    --text:#DCE8FF;--text2:#7A9ACC;--muted:#3D5A8A;
    --blue:#1E6EFF;--blue-l:#4A8AFF;--blue-d:#0A3A99;--blue-xl:#D4E2FF;
    --border:rgba(42,100,255,0.18);--glow:rgba(26,108,255,0.10);
    --amber:#F59E0B;
  }
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

  /* HERO */
  .hero{
    min-height:100vh;display:flex;flex-direction:column;justify-content:center;
    align-items:center;padding:80px 24px 60px;text-align:center;
    position:relative;overflow:hidden;
  }
  .hero::before{
    content:'';position:absolute;inset:0;
    background: radial-gradient(ellipse 60% 50% at 50% 30%, rgba(26,108,255,0.12) 0%, transparent 70%);
    pointer-events:none;
  }
  .hero-eyebrow{
    font-size:11px;letter-spacing:3px;color:var(--blue-l);font-weight:600;
    text-transform:uppercase;margin-bottom:24px;font-family:'JetBrains Mono',monospace;
  }
  .hero-title{
    font-size:clamp(72px,14vw,128px);font-weight:200;letter-spacing:-2px;
    color:var(--text);line-height:1;margin-bottom:16px;
    font-family:'JetBrains Mono',monospace;
  }
  .hero-cond{
    display:inline-flex;align-items:center;gap:12px;
    background:rgba(30,110,255,0.12);border:1px solid rgba(30,110,255,0.3);
    border-radius:40px;padding:10px 24px;margin-bottom:24px;
  }
  .hero-cond .temp{font-size:32px;font-weight:200;font-family:'JetBrains Mono',monospace;color:var(--text)}
  .hero-cond .label{font-size:13px;color:var(--blue-l)}
  .hero-tagline{
    font-size:18px;color:var(--text2);font-weight:300;max-width:480px;
    line-height:1.6;margin-bottom:48px;
  }
  .hero-btns{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;}
  .btn-primary{
    padding:14px 32px;background:var(--blue);color:#fff;border-radius:40px;
    font-size:15px;font-weight:500;text-decoration:none;letter-spacing:.3px;
    transition:opacity .2s;border:1px solid transparent;
  }
  .btn-primary:hover{opacity:.85}
  .btn-secondary{
    padding:14px 32px;background:transparent;color:var(--blue-l);border-radius:40px;
    font-size:15px;font-weight:500;text-decoration:none;
    border:1px solid rgba(30,110,255,0.4);transition:border-color .2s;
  }
  .btn-secondary:hover{border-color:var(--blue)}

  /* METRIC STRIP */
  .metric-strip{
    background:var(--surf);border-top:1px solid var(--border);border-bottom:1px solid var(--border);
    padding:24px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:16px;
  }
  .metric{text-align:center;}
  .metric .val{font-size:28px;font-weight:200;font-family:'JetBrains Mono',monospace;color:var(--blue-l)}
  .metric .label{font-size:10px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;font-family:'JetBrains Mono',monospace;margin-top:4px}

  /* SCREENS */
  .screens-section{background:var(--card);padding:80px 24px;}
  .screens-section h2{font-size:32px;font-weight:300;color:var(--text);text-align:center;margin-bottom:8px;}
  .screens-section .sub{font-size:13px;color:var(--muted);text-align:center;margin-bottom:48px;font-family:'JetBrains Mono',monospace;}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;max-width:1100px;margin:0 auto;}
  .screen-card{display:flex;flex-direction:column;align-items:center;gap:12px;}
  .screen-card img{
    width:160px;height:346px;border-radius:20px;border:1px solid var(--border);
    box-shadow:0 4px 32px rgba(26,108,255,0.12);object-fit:cover;
  }
  .screen-label{font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;font-family:'JetBrains Mono',monospace;}

  /* DESIGN RATIONALE */
  .rationale{background:var(--bg);padding:80px 24px;max-width:640px;margin:0 auto;}
  .rationale h2{font-size:28px;font-weight:300;color:var(--text);margin-bottom:32px;}
  .rat-item{margin-bottom:28px;padding-left:20px;border-left:2px solid rgba(30,110,255,0.25);}
  .rat-item h3{font-size:14px;font-weight:600;color:var(--blue-l);margin-bottom:6px;letter-spacing:1px;text-transform:uppercase;font-family:'JetBrains Mono',monospace;}
  .rat-item p{font-size:14px;color:var(--text2);line-height:1.7;}

  /* PALETTE */
  .palette-section{background:var(--card);padding:60px 24px;text-align:center;}
  .palette-section h2{font-size:22px;font-weight:300;color:var(--text);margin-bottom:32px;letter-spacing:1px;}
  .swatches{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px;}
  .swatch-dot{width:52px;height:52px;border-radius:50%;border:1px solid var(--border);}
  .swatch-name{font-size:10px;color:var(--text2);font-family:'JetBrains Mono',monospace;}
  .swatch-hex{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace;}

  /* FOOTER */
  footer{background:var(--surf);border-top:1px solid var(--border);padding:32px 24px;text-align:center;}
  footer p{font-size:12px;color:var(--muted);font-family:'JetBrains Mono',monospace;}
  footer a{color:var(--blue-l);text-decoration:none;}
  footer a:hover{text-decoration:underline;}
</style>
</head>
<body>

<section class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat #492</p>
  <h1 class="hero-title">VANE</h1>
  <div class="hero-cond">
    <span class="temp">14°C</span>
    <span class="label">Stinson Beach · Partly Cloudy · Wind 18 km/h SSW</span>
  </div>
  <p class="hero-tagline">Hyper-local weather intelligence for outdoor athletes. Surf, wind, tide — all in one dark interface built for real conditions.</p>
  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/vane-viewer">View Prototype →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/vane-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="metric-strip">
  <div class="metric"><div class="val">18<small style="font-size:16px">km/h</small></div><div class="label">Wind · SSW</div></div>
  <div class="metric"><div class="val">1.2<small style="font-size:16px">m</small></div><div class="label">Swell Height</div></div>
  <div class="metric"><div class="val">78<small style="font-size:16px">%</small></div><div class="label">Humidity</div></div>
  <div class="metric"><div class="val">AQI 32</div><div class="label">Air Quality</div></div>
  <div class="metric"><div class="val">1012<small style="font-size:16px">hPa</small></div><div class="label">Pressure</div></div>
</div>

<section class="screens-section">
  <h2>6 Screens</h2>
  <p class="sub">Dark · 551 elements · Electric cobalt single-hue</p>
  <div class="screens-grid">
    ${pen.screens.map((sc, i) => `
    <div class="screen-card">
      <img src="${screenUris[i]}" alt="${sc.name} screen" loading="lazy">
      <span class="screen-label">${sc.name}</span>
    </div>`).join('')}
  </div>
</section>

<section class="rationale">
  <h2>Design decisions</h2>
  <div class="rat-item">
    <h3>Single-hue cobalt monochrome</h3>
    <p>Godly.website is featuring entire sites built around one pushed colour: electric cobalt on near-black, tone-on-tone texture, zero secondary palette. VANE follows this discipline — BG #06091A, surface #0C1228, card #101830, accent #1E6EFF. Every blue is a different tonal step on the same hue. The only colour exceptions are amber (alerts) and green (air quality) — both functional, never decorative.</p>
  </div>
  <div class="rat-item">
    <h3>JetBrains Mono for all data values</h3>
    <p>Every number — temperature, wind speed, humidity, AQI, swell period — renders in monospace. It creates visual alignment across metric columns, signals precision, and establishes a two-register type system: Inter Tight for labels (condensed, efficient), JetBrains Mono for values (fixed-width, trustworthy). Inspired by KILN's MICRODOT approach taken further into outdoor-instrument territory.</p>
  </div>
  <div class="rat-item">
    <h3>Outcome-oriented Insights screen</h3>
    <p>NNGroup's March 2026 article "Outcome-Oriented Design" argues navigation should reflect user goals, not tasks. The Insights screen doesn't show raw weather logs — it surfaces "Best day for surfing this week" and activity-score grids by sport. The user's goal (get outside) is the primary interface element, not the raw data.</p>
  </div>
</section>

<section class="palette-section">
  <h2>PALETTE · SINGLE HUE</h2>
  <div class="swatches">
    <div class="swatch"><div class="swatch-dot" style="background:#06091A;"></div><span class="swatch-name">Deep Navy</span><span class="swatch-hex">#06091A</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#0C1228;"></div><span class="swatch-name">Navy Surface</span><span class="swatch-hex">#0C1228</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#101830;"></div><span class="swatch-name">Card</span><span class="swatch-hex">#101830</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#1E6EFF;border-color:rgba(30,110,255,0.5);"></div><span class="swatch-name">Electric Cobalt</span><span class="swatch-hex">#1E6EFF</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#4A8AFF;"></div><span class="swatch-name">Cobalt Light</span><span class="swatch-hex">#4A8AFF</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#DCE8FF;"></div><span class="swatch-name">Blue White</span><span class="swatch-hex">#DCE8FF</span></div>
  </div>
</section>

<footer>
  <p>VANE · Heartbeat #492 · RAM Design · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:8px"><a href="https://ram.zenbin.org/vane-viewer">Prototype</a> · <a href="https://ram.zenbin.org/vane-mock">Interactive Mock</a></p>
</footer>

</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'VANE — Hyper-local Weather Intelligence');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'VANE — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
