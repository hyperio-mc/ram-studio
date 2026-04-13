'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'ease';

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
<title>EASE — Recovery-Aware Training Companion</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#F6F3EE;--surf:#FFFFFF;--card:#EDE9E1;--card2:#E5E0D6;
    --border:#D8D0C4;--text:#1E1914;--text2:#7A6E62;--muted:#B5A99A;
    --terra:#C4623C;--terra-l:#F3E5DF;--terra-d:#8C3D22;
    --sage:#5C7A5E;--sage-l:#E2EDE3;--amber:#C98B2A;--amber-l:#F5EDD8;
  }
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

  /* HERO */
  .hero{
    min-height:100vh;display:flex;flex-direction:column;justify-content:center;
    align-items:center;padding:80px 24px 60px;text-align:center;
    background:var(--bg);
  }
  .hero-eyebrow{
    font-size:11px;letter-spacing:3px;color:var(--terra);font-weight:600;
    text-transform:uppercase;margin-bottom:24px;
  }
  .hero-title{
    font-family:'Lora',Georgia,serif;font-size:clamp(56px,12vw,96px);font-weight:400;
    color:var(--text);line-height:1.05;margin-bottom:16px;
  }
  .hero-badge{
    display:inline-flex;align-items:center;gap:10px;
    background:var(--terra-l);border:1px solid var(--terra);
    border-radius:40px;padding:10px 24px;margin-bottom:24px;
  }
  .hero-badge .score{font-size:24px;font-weight:400;font-family:'Lora',Georgia,serif;color:var(--text)}
  .hero-badge .label{font-size:13px;color:var(--terra)}
  .hero-tagline{
    font-size:17px;color:var(--text2);font-weight:300;max-width:440px;
    line-height:1.7;margin-bottom:40px;
  }
  .hero-btns{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;}
  .btn-primary{
    padding:14px 32px;background:var(--terra);color:#fff;border-radius:40px;
    font-size:15px;font-weight:500;text-decoration:none;transition:opacity .2s;
  }
  .btn-primary:hover{opacity:.85}
  .btn-secondary{
    padding:14px 32px;background:var(--card);color:var(--text);border-radius:40px;
    font-size:15px;font-weight:500;text-decoration:none;
    border:1px solid var(--border);transition:background .2s;
  }
  .btn-secondary:hover{background:var(--card2)}

  /* MANTRA BAND */
  .mantra{
    background:var(--terra-l);border-top:1px solid var(--border);border-bottom:1px solid var(--border);
    padding:40px 24px;text-align:center;
  }
  .mantra p{
    font-family:'Lora',Georgia,serif;font-size:20px;color:var(--terra-d);
    font-style:italic;max-width:480px;margin:0 auto;line-height:1.6;
  }

  /* SCREENS */
  .screens-section{background:var(--card);padding:80px 24px;}
  .screens-section h2{font-family:'Lora',Georgia,serif;font-size:32px;font-weight:400;color:var(--text);text-align:center;margin-bottom:8px;}
  .screens-section .sub{font-size:13px;color:var(--muted);text-align:center;margin-bottom:48px;letter-spacing:1px;}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;max-width:1100px;margin:0 auto;}
  .screen-card{display:flex;flex-direction:column;align-items:center;gap:12px;}
  .screen-card img{width:160px;height:346px;border-radius:20px;border:1px solid var(--border);box-shadow:0 4px 24px rgba(30,25,20,.07);object-fit:cover;}
  .screen-label{font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;}

  /* PHILOSOPHY */
  .philosophy{background:var(--bg);padding:80px 24px;max-width:640px;margin:0 auto;}
  .philosophy h2{font-family:'Lora',Georgia,serif;font-size:28px;font-weight:400;color:var(--text);margin-bottom:32px;}
  .phil-item{margin-bottom:28px;padding-left:20px;border-left:3px solid var(--terra-l);}
  .phil-item h3{font-size:13px;font-weight:700;color:var(--terra);margin-bottom:6px;letter-spacing:1.5px;text-transform:uppercase;}
  .phil-item p{font-size:14px;color:var(--text2);line-height:1.7;}

  /* SIGNALS */
  .signals{background:var(--card);padding:60px 24px;}
  .signals h2{font-family:'Lora',Georgia,serif;font-size:24px;font-weight:400;color:var(--text);text-align:center;margin-bottom:32px;}
  .signal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;max-width:800px;margin:0 auto;}
  .signal-card{background:var(--surf);border:1px solid var(--border);border-radius:16px;padding:20px;text-align:center;}
  .signal-icon{font-size:28px;margin-bottom:12px;}
  .signal-title{font-size:14px;font-weight:500;color:var(--text);margin-bottom:6px;}
  .signal-note{font-size:12px;color:var(--text2);line-height:1.5;}

  /* PALETTE */
  .palette-section{background:var(--bg);padding:60px 24px;text-align:center;}
  .palette-section h2{font-family:'Lora',Georgia,serif;font-size:24px;font-weight:400;color:var(--text);margin-bottom:32px;}
  .swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px;}
  .swatch-dot{width:52px;height:52px;border-radius:50%;border:1px solid var(--border);}
  .swatch-name{font-size:10px;color:var(--text2);}
  .swatch-hex{font-size:9px;color:var(--muted);font-family:monospace;}

  /* FOOTER */
  footer{background:var(--card);border-top:1px solid var(--border);padding:32px 24px;text-align:center;}
  footer p{font-size:12px;color:var(--muted);}
  footer a{color:var(--terra);text-decoration:none;}
  footer a:hover{text-decoration:underline;}
</style>
</head>
<body>

<section class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat #502</p>
  <h1 class="hero-title">EASE</h1>
  <div class="hero-badge">
    <span class="score">72</span>
    <span class="label">Readiness · Train light today</span>
  </div>
  <p class="hero-tagline">Recovery-aware training. Rest is data, not a gap in your log. Your recovery window is part of the plan.</p>
  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/ease-viewer">View Prototype →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/ease-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="mantra">
  <p>"Rest is data, not a gap in your log. Your recovery window is part of the plan."</p>
</div>

<section class="screens-section">
  <h2>6 Screens</h2>
  <p class="sub">Light · 774 elements · Warm mineral palette</p>
  <div class="screens-grid">
    ${pen.screens.map((sc, i) => `
    <div class="screen-card">
      <img src="${screenUris[i]}" alt="${sc.name} screen" loading="lazy">
      <span class="screen-label">${sc.name}</span>
    </div>`).join('')}
  </div>
</section>

<section class="philosophy">
  <h2>Design philosophy</h2>
  <div class="phil-item">
    <h3>Recovery as the primary metric</h3>
    <p>Inspired by Gentler Streak (Apple Design Award 2026 — Mobbin). Every screen leads with readiness, not performance targets. Rest days are data points, displayed with the same care as training sessions — not blank gaps in a log.</p>
  </div>
  <div class="phil-item">
    <h3>Warm mineral editorial palette</h3>
    <p>Siteinspire's curated aesthetic in April 2026 consistently favors warm off-whites, stone neutrals, and a single earthy accent over cold tech greys. #F6F3EE parchment base + terracotta #C4623C is the anti-neon fitness palette — it reads as premium, not urgent.</p>
  </div>
  <div class="phil-item">
    <h3>One-question check-in (Mobbin's Ada Health pattern)</h3>
    <p>The Log screen uses progressive disclosure — one question at a time with a step indicator. This reduces cognitive load and increases check-in completion rates. The question is set in serif at large size — it feels asked, not demanded.</p>
  </div>
  <div class="phil-item">
    <h3>Handmade trust signals (NNGroup, Apr 2026)</h3>
    <p>Georgia/Lora serif for all scores, pull quotes, and section headings signals craftsmanship in an era where everything looks AI-generated. Visible grain texture, precise micro-spacing, and deliberate weight hierarchy build perceived reliability.</p>
  </div>
</section>

<section class="signals">
  <h2>Recovery signals tracked</h2>
  <div class="signal-grid">
    <div class="signal-card"><div class="signal-icon">◐</div><div class="signal-title">Sleep Quality</div><div class="signal-note">Duration, interruptions, quality score</div></div>
    <div class="signal-card"><div class="signal-icon">◇</div><div class="signal-title">HRV</div><div class="signal-note">Heart rate variability — nervous system recovery</div></div>
    <div class="signal-card"><div class="signal-icon">◈</div><div class="signal-title">Resting HR</div><div class="signal-note">Baseline vs. elevated — fatigue signal</div></div>
    <div class="signal-card"><div class="signal-icon">◎</div><div class="signal-title">Muscle Load</div><div class="signal-note">Per-group recovery status, 12–36h tracking</div></div>
  </div>
</section>

<section class="palette-section">
  <h2>Palette</h2>
  <div class="swatches">
    <div class="swatch"><div class="swatch-dot" style="background:#F6F3EE;"></div><span class="swatch-name">Parchment</span><span class="swatch-hex">#F6F3EE</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#EDE9E1;"></div><span class="swatch-name">Warm Stone</span><span class="swatch-hex">#EDE9E1</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#C4623C;"></div><span class="swatch-name">Terracotta</span><span class="swatch-hex">#C4623C</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#5C7A5E;"></div><span class="swatch-name">Sage</span><span class="swatch-hex">#5C7A5E</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#C98B2A;"></div><span class="swatch-name">Amber</span><span class="swatch-hex">#C98B2A</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#1E1914;"></div><span class="swatch-name">Warm Black</span><span class="swatch-hex">#1E1914</span></div>
  </div>
</section>

<footer>
  <p>EASE · Heartbeat #502 · RAM Design · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:8px"><a href="https://ram.zenbin.org/ease-viewer">Prototype</a> · <a href="https://ram.zenbin.org/ease-mock">Interactive Mock</a></p>
</footer>

</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'EASE — Recovery-Aware Training Companion');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'EASE — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
