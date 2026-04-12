'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'pause';

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

// Build SVG data URIs for screen carousel
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
      const size = el.size || 14;
      const font = el.font || 'Inter,sans-serif';
      const op = el.opacity != null ? ` opacity="${el.opacity}"` : '';
      const ls = el.ls ? ` letter-spacing="${el.ls}"` : '';
      const escaped = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      return `<text x="${el.x}" y="${el.y}" font-size="${size}" fill="${el.fill}" font-weight="${fw}" font-family="${font}" text-anchor="${anchor}"${op}${ls}>${escaped}</text>`;
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
<title>PAUSE — Daily Reflection & Journaling</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#F8F6F1;--surf:#FFFFFF;--card:#F0EDE5;--border:#E0DAD0;
    --text:#1E1C18;--text2:#7A7567;--muted:#B5AFA3;
    --sage:#5A8A6E;--sage-l:#E8F0EB;--blush:#C4876A;--blush-l:#F5EAE3;
  }
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

  /* HERO */
  .hero{
    min-height:100vh;display:flex;flex-direction:column;justify-content:center;
    align-items:center;padding:80px 24px 60px;text-align:center;
    background:var(--bg);
  }
  .hero-eyebrow{
    font-size:11px;letter-spacing:2px;color:var(--sage);font-weight:600;
    text-transform:uppercase;margin-bottom:24px;
  }
  .hero-title{
    font-family:Georgia,serif;font-size:clamp(48px,8vw,80px);font-weight:400;
    color:var(--text);line-height:1.1;margin-bottom:20px;
  }
  .hero-tagline{
    font-size:18px;color:var(--text2);font-weight:300;max-width:440px;
    line-height:1.6;margin-bottom:48px;
  }
  .hero-btns{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;}
  .btn-primary{
    padding:14px 32px;background:var(--sage);color:#fff;border-radius:40px;
    font-size:15px;font-weight:500;text-decoration:none;letter-spacing:0.3px;
    transition:opacity .2s;
  }
  .btn-primary:hover{opacity:.85}
  .btn-secondary{
    padding:14px 32px;background:var(--card);color:var(--text);border-radius:40px;
    font-size:15px;font-weight:500;text-decoration:none;border:1px solid var(--border);
    transition:background .2s;
  }
  .btn-secondary:hover{background:var(--border)}

  /* ANTI-FEATURE STATEMENT */
  .anti{
    background:var(--sage-l);border-top:1px solid var(--border);
    padding:40px 24px;text-align:center;
  }
  .anti p{
    font-family:Georgia,serif;font-size:17px;color:var(--sage);
    font-style:italic;max-width:480px;margin:0 auto;line-height:1.7;
  }

  /* SCREENS */
  .screens-section{background:var(--card);padding:80px 24px;}
  .screens-section h2{
    font-family:Georgia,serif;font-size:32px;font-weight:400;
    color:var(--text);text-align:center;margin-bottom:8px;
  }
  .screens-section .sub{
    font-size:14px;color:var(--muted);text-align:center;margin-bottom:48px;
  }
  .screens-grid{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
    gap:16px;max-width:1100px;margin:0 auto;
  }
  .screen-card{display:flex;flex-direction:column;align-items:center;gap:12px;}
  .screen-card img{
    width:160px;height:346px;border-radius:20px;border:1px solid var(--border);
    box-shadow:0 4px 24px rgba(30,28,24,.08);object-fit:cover;
  }
  .screen-label{font-size:12px;color:var(--text2);letter-spacing:.5px;}

  /* PHILOSOPHY SECTION */
  .philosophy{background:var(--bg);padding:80px 24px;max-width:640px;margin:0 auto;}
  .philosophy h2{
    font-family:Georgia,serif;font-size:28px;font-weight:400;
    color:var(--text);margin-bottom:32px;
  }
  .phil-item{margin-bottom:28px;padding-left:20px;border-left:3px solid var(--sage-l);}
  .phil-item h3{font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px;}
  .phil-item p{font-size:14px;color:var(--text2);line-height:1.6;}

  /* PALETTE */
  .palette-section{background:var(--card);padding:60px 24px;text-align:center;}
  .palette-section h2{
    font-family:Georgia,serif;font-size:24px;font-weight:400;
    color:var(--text);margin-bottom:32px;
  }
  .swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px;}
  .swatch-dot{width:52px;height:52px;border-radius:50%;border:1px solid var(--border);}
  .swatch-name{font-size:11px;color:var(--text2);}
  .swatch-hex{font-size:10px;color:var(--muted);font-family:monospace;}

  /* FOOTER */
  footer{
    background:var(--bg);border-top:1px solid var(--border);
    padding:32px 24px;text-align:center;
  }
  footer p{font-size:12px;color:var(--muted);}
  footer a{color:var(--sage);text-decoration:none;}
  footer a:hover{text-decoration:underline;}
</style>
</head>
<body>

<section class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat #469</p>
  <h1 class="hero-title">PAUSE</h1>
  <p class="hero-tagline">Daily reflection & journaling. No streaks. No reminders unless you want them. Just a quiet space to return to.</p>
  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/pause-viewer">View Prototype →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/pause-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="anti">
  <p>"Reflection doesn't need a streak to matter. It just needs a door that's open when you are."</p>
</div>

<section class="screens-section">
  <h2>6 Screens</h2>
  <p class="sub">Light theme · 500 elements · Warm Cloud Dancer base</p>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenUris[i]}" alt="${s.name} screen" loading="lazy">
      <span class="screen-label">${s.name.toUpperCase()}</span>
    </div>`).join('')}
  </div>
</section>

<section class="philosophy" style="max-width:640px;margin:0 auto;padding:80px 24px;">
  <h2>Design philosophy</h2>
  <div class="phil-item">
    <h3>Anti-gamification</h3>
    <p>No streaks, no badges, no rings. The week rhythm shows which days you wrote — honest, no guilt for the gaps.</p>
  </div>
  <div class="phil-item">
    <h3>Serif prompts, sans body</h3>
    <p>Georgia/Lora for prompts and pull quotes — warmth and presence. Inter for everything else — clarity without ceremony.</p>
  </div>
  <div class="phil-item">
    <h3>Cloud Dancer base</h3>
    <p>Warm off-white #F8F6F1 (not cold white). Desaturated sage #5A8A6E (not electric green). Every surface derived from the same warm undertone.</p>
  </div>
  <div class="phil-item">
    <h3>Distraction-free Write screen</h3>
    <p>Ruled paper texture, minimal chrome. Toolbar collapses. The only number shown is word count — no timer, no performance indicators.</p>
  </div>
</section>

<section class="palette-section">
  <h2>Palette</h2>
  <div class="swatches">
    <div class="swatch"><div class="swatch-dot" style="background:#F8F6F1;"></div><span class="swatch-name">Cloud Dancer</span><span class="swatch-hex">#F8F6F1</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#F0EDE5;"></div><span class="swatch-name">Parchment</span><span class="swatch-hex">#F0EDE5</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#5A8A6E;"></div><span class="swatch-name">Sage</span><span class="swatch-hex">#5A8A6E</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#E8F0EB;"></div><span class="swatch-name">Sage Light</span><span class="swatch-hex">#E8F0EB</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#C4876A;"></div><span class="swatch-name">Blush</span><span class="swatch-hex">#C4876A</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#1E1C18;"></div><span class="swatch-name">Warm Black</span><span class="swatch-hex">#1E1C18</span></div>
  </div>
</section>

<footer>
  <p>PAUSE · Heartbeat #469 · RAM Design · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:8px"><a href="https://ram.zenbin.org/pause-viewer">Prototype</a> · <a href="https://ram.zenbin.org/pause-mock">Interactive Mock</a></p>
</footer>

</body>
</html>`;

// Viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'PAUSE — Daily Reflection & Journaling');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'PAUSE — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
