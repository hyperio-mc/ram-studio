'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'koji';

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
<title>KOJI — Fermentation Culture Companion</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#0A1208;--surf:#111C0F;--card:#192617;--card2:#1E2E1B;
    --border:rgba(107,143,101,0.18);--text:#EEF0E8;--text2:#8CA882;--muted:#5C7A58;
    --amber:#D97706;--amber-l:#FDE68A;--amber-m:#F59E0B;--amber-d:#92400E;
    --sage:#6B8F65;--sage-l:rgba(107,143,101,0.15);
  }
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

  /* HERO */
  .hero{
    min-height:100vh;display:flex;flex-direction:column;justify-content:center;
    align-items:center;padding:80px 24px 60px;text-align:center;
    background:var(--bg);
    background-image:radial-gradient(ellipse 60% 50% at 50% 0%, rgba(217,119,6,0.08) 0%, transparent 70%);
  }
  .hero-eyebrow{font-size:11px;letter-spacing:3px;color:var(--amber);font-weight:500;text-transform:uppercase;margin-bottom:24px;}
  .hero-title{
    font-family:'Inter Tight',Inter,sans-serif;font-size:clamp(64px,14vw,108px);font-weight:700;
    color:var(--text);line-height:1.0;margin-bottom:12px;letter-spacing:-3px;
  }
  .hero-badge{
    display:inline-flex;align-items:center;gap:10px;
    background:rgba(217,119,6,0.12);border:1px solid rgba(217,119,6,0.35);
    border-radius:40px;padding:10px 24px;margin-bottom:20px;
  }
  .hero-badge .score{font-family:'JetBrains Mono',monospace;font-size:22px;color:var(--amber-l);}
  .hero-badge .label{font-size:13px;color:var(--amber);letter-spacing:0.5px;}
  .hero-tagline{font-size:17px;color:var(--text2);font-weight:300;max-width:460px;line-height:1.7;margin-bottom:40px;}
  .hero-btns{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;}
  .btn-primary{padding:14px 32px;background:var(--amber);color:#0A1208;border-radius:40px;font-size:15px;font-weight:600;text-decoration:none;transition:opacity .2s;}
  .btn-primary:hover{opacity:.85}
  .btn-secondary{padding:14px 32px;background:var(--card);color:var(--text);border-radius:40px;font-size:15px;font-weight:500;text-decoration:none;border:1px solid var(--border);transition:background .2s;}
  .btn-secondary:hover{background:var(--card2)}

  /* MANTRA */
  .mantra{background:var(--surf);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:40px 24px;text-align:center;}
  .mantra p{font-family:'Inter Tight',Inter,sans-serif;font-size:18px;color:var(--text2);max-width:500px;margin:0 auto;line-height:1.6;font-weight:300;font-style:italic;}
  .mantra em{color:var(--amber);font-style:normal;}

  /* SCREENS */
  .screens-section{background:var(--card);padding:80px 24px;}
  .screens-section h2{font-family:'Inter Tight',Inter,sans-serif;font-size:32px;font-weight:600;color:var(--text);text-align:center;margin-bottom:8px;}
  .screens-section .sub{font-size:13px;color:var(--muted);text-align:center;margin-bottom:48px;letter-spacing:1px;}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;max-width:1100px;margin:0 auto;}
  .screen-card{display:flex;flex-direction:column;align-items:center;gap:12px;}
  .screen-card img{width:160px;height:346px;border-radius:20px;border:1px solid var(--border);box-shadow:0 4px 32px rgba(217,119,6,0.06);object-fit:cover;}
  .screen-label{font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;}

  /* PHILOSOPHY */
  .philosophy{background:var(--bg);padding:80px 24px;max-width:660px;margin:0 auto;}
  .philosophy h2{font-family:'Inter Tight',Inter,sans-serif;font-size:28px;font-weight:600;color:var(--text);margin-bottom:32px;}
  .phil-item{margin-bottom:28px;padding-left:20px;border-left:3px solid rgba(217,119,6,0.25);}
  .phil-item h3{font-size:12px;font-weight:600;color:var(--amber);margin-bottom:6px;letter-spacing:2px;text-transform:uppercase;}
  .phil-item p{font-size:14px;color:var(--text2);line-height:1.75;}

  /* SCREENS LIST */
  .screen-list{background:var(--surf);padding:60px 24px;}
  .screen-list h2{font-family:'Inter Tight',Inter,sans-serif;font-size:24px;font-weight:600;color:var(--text);text-align:center;margin-bottom:32px;}
  .screen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;max-width:900px;margin:0 auto;}
  .sc-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;}
  .sc-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);margin-bottom:8px;letter-spacing:1px;}
  .sc-name{font-size:16px;font-weight:600;color:var(--text);margin-bottom:8px;}
  .sc-desc{font-size:13px;color:var(--text2);line-height:1.6;}

  /* PALETTE */
  .palette-section{background:var(--bg);padding:60px 24px;text-align:center;}
  .palette-section h2{font-family:'Inter Tight',Inter,sans-serif;font-size:24px;font-weight:600;color:var(--text);margin-bottom:32px;}
  .swatches{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px;}
  .swatch-dot{width:52px;height:52px;border-radius:50%;border:1px solid var(--border);}
  .swatch-name{font-size:11px;color:var(--text2);}
  .swatch-hex{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace;}

  /* FOOTER */
  footer{background:var(--card);border-top:1px solid var(--border);padding:32px 24px;text-align:center;}
  footer p{font-size:12px;color:var(--muted);}
  footer a{color:var(--amber);text-decoration:none;}
  footer a:hover{text-decoration:underline;}
</style>
</head>
<body>

<section class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat #503</p>
  <h1 class="hero-title">KOJI</h1>
  <div class="hero-badge">
    <span class="score">Day 14</span>
    <span class="label">Active · pH 3.9 · Rising well</span>
  </div>
  <p class="hero-tagline">Fermentation culture companion. Your starter is alive — track it like it is.</p>
  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/koji-viewer">View Prototype →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/koji-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="mantra">
  <p>"The culture is alive. <em>It has a story.</em> Every feed, every rise, every observation — logged, not lost."</p>
</div>

<section class="screens-section">
  <h2>6 Screens</h2>
  <p class="sub">Dark · 733 elements · Forest-black + amber palette</p>
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
    <h3>Culture as protagonist</h3>
    <p>Most fermentation apps treat cultures as tracked objects — rows in a log. KOJI's Timeline screen treats each culture as a living protagonist with a narrative arc. Entries are story beats, not database records. The 14-day timeline sparkline shows character, not just data.</p>
  </div>
  <div class="phil-item">
    <h3>Warm amber on forest-black</h3>
    <p>Inspired by Dribbble's April 2026 trend toward warm amber/honey tones on deep organic darks — an antidote to cold blue-grey productivity apps. #D97706 amber against #0A1208 forest-black reads as fermentation: alive, warm, slightly wild.</p>
  </div>
  <div class="phil-item">
    <h3>Organic bubble motifs (NNGroup Handmade Designs)</h3>
    <p>NNGroup's April 2026 research found that visible imperfection in UI builds trust in an era of AI-smoothed surfaces. Every screen carries subtle bubble scatter — small circles in varying sizes, irregular but intentional. Fermentation is alive; the interface echoes it.</p>
  </div>
  <div class="phil-item">
    <h3>Science without intimidation</h3>
    <p>The Science screen shows pH trend charts and rise timelines — but the data is always paired with a plain-language biological context note. WGSN's 2026 Transformative Teal research showed consumers want to understand natural processes, not just track them.</p>
  </div>
</section>

<section class="screen-list">
  <h2>What you can do</h2>
  <div class="screen-grid">
    <div class="sc-card">
      <div class="sc-num">01 — CULTURES</div>
      <div class="sc-name">All your cultures</div>
      <div class="sc-desc">Overview of active cultures with activity glow — amber intensity shows how alive each one is right now.</div>
    </div>
    <div class="sc-card">
      <div class="sc-num">02 — TIMELINE</div>
      <div class="sc-name">The story so far</div>
      <div class="sc-desc">14-day narrative timeline. Each entry is a story beat — what you did, what happened, what the culture felt like.</div>
    </div>
    <div class="sc-card">
      <div class="sc-num">03 — FEED</div>
      <div class="sc-name">Log a feeding</div>
      <div class="sc-desc">Ratio selector, flour type, hydration, sensory notes, temperature. One feed, fully documented.</div>
    </div>
    <div class="sc-card">
      <div class="sc-num">04 — SCIENCE</div>
      <div class="sc-name">pH & rise data</div>
      <div class="sc-desc">pH trend chart with optimal zone band, rise timeline bars, biological context note — science made legible.</div>
    </div>
    <div class="sc-card">
      <div class="sc-num">05 — DIAGNOSE</div>
      <div class="sc-name">Something's off?</div>
      <div class="sc-desc">Symptom selector leads to a narrative diagnosis — not a dry error code, but an explanation of what's happening and why.</div>
    </div>
    <div class="sc-card">
      <div class="sc-num">06 — BAKE</div>
      <div class="sc-name">Ready to use</div>
      <div class="sc-desc">Recipe suggestions matched to your culture's current readiness state — active culture gets the bold levain recipe, tired culture gets the discard pancakes.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <h2>Palette</h2>
  <div class="swatches">
    <div class="swatch"><div class="swatch-dot" style="background:#0A1208;"></div><span class="swatch-name">Forest Black</span><span class="swatch-hex">#0A1208</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#192617;"></div><span class="swatch-name">Forest Card</span><span class="swatch-hex">#192617</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#D97706;"></div><span class="swatch-name">Amber</span><span class="swatch-hex">#D97706</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#F59E0B;"></div><span class="swatch-name">Amber Mid</span><span class="swatch-hex">#F59E0B</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#6B8F65;"></div><span class="swatch-name">Sage</span><span class="swatch-hex">#6B8F65</span></div>
    <div class="swatch"><div class="swatch-dot" style="background:#EEF0E8;"></div><span class="swatch-name">Warm White</span><span class="swatch-hex">#EEF0E8</span></div>
  </div>
</section>

<footer>
  <p>KOJI · Heartbeat #503 · RAM Design · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:8px"><a href="https://ram.zenbin.org/koji-viewer">Prototype</a> · <a href="https://ram.zenbin.org/koji-mock">Interactive Mock</a></p>
</footer>

</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'KOJI — Fermentation Culture Companion');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'KOJI — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
