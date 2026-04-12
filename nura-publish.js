'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'nura';
const NAME = 'NURA';
const TAGLINE = 'Neural state, in focus';

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

// Extract palette from metadata
const P = {
  bg:      '#070B12',
  surf:    '#0C1220',
  card:    '#111A2E',
  acc:     '#00F5C3',
  acc2:    '#A855F7',
  acc3:    '#F59E0B',
  text:    '#E2EBF9',
  muted:   '#6B7FA6',
  border:  '#1E2E4A',
  warn:    '#F87171',
};

// Convert screens to SVG data URIs for carousel
function screenToSvg(screen) {
  const W = 390, H = 844;
  let svgBody = '';
  for (const el of screen.elements) {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const op = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke ? `stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : 'stroke="none"';
      svgBody += `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" rx="${rx}" fill="${el.fill}" opacity="${op}" ${stroke}/>`;
    } else if (el.type === 'circle') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : 'stroke="none"';
      svgBody += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill || 'none'}" opacity="${op}" ${stroke}/>`;
    } else if (el.type === 'text') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      const anchor = el.anchor || 'start';
      const fw = el.fw || 400;
      const ls = el.ls ? `letter-spacing="${el.ls}"` : '';
      const escaped = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      svgBody += `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${fw}" text-anchor="${anchor === 'end' ? 'end' : anchor === 'middle' ? 'middle' : 'start'}" font-family="Inter,sans-serif" opacity="${op}" ${ls}>${escaped}</text>`;
    } else if (el.type === 'line') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      svgBody += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw || 1}" opacity="${op}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svgBody}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const screenUris = pen.screens.map(s => screenToSvg(s));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#070B12; --surf:#0C1220; --card:#111A2E;
    --acc:#00F5C3; --acc2:#A855F7; --acc3:#F59E0B;
    --text:#E2EBF9; --muted:#6B7FA6; --border:#1E2E4A;
  }
  html{background:var(--bg);color:var(--text);font-family:Inter,sans-serif;scroll-behavior:smooth}
  body{min-height:100vh;overflow-x:hidden}

  /* Hero */
  .hero{
    min-height:100vh; display:flex; flex-direction:column; align-items:center;
    justify-content:center; text-align:center; padding:80px 24px;
    position:relative; overflow:hidden;
  }
  .hero::before{
    content:''; position:absolute; inset:0;
    background:
      radial-gradient(ellipse 60% 40% at 20% 30%, rgba(0,245,195,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 80% 60%, rgba(168,85,247,0.10) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 50% 80%, rgba(245,158,11,0.06) 0%, transparent 70%);
    pointer-events:none;
  }
  .badge{
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(0,245,195,0.1); border:1px solid rgba(0,245,195,0.25);
    border-radius:100px; padding:6px 16px; margin-bottom:28px;
    font-size:11px; font-weight:700; letter-spacing:3px; color:var(--acc);
  }
  .badge::before{content:'✦'; font-size:12px;}
  h1{
    font-size:clamp(60px,12vw,120px); font-weight:900; letter-spacing:-4px;
    line-height:0.9; margin-bottom:24px;
    background:linear-gradient(135deg, var(--text) 0%, var(--acc) 50%, var(--acc2) 100%);
    -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
  }
  .tagline{
    font-size:clamp(16px,3vw,22px); color:var(--muted); max-width:480px;
    line-height:1.6; margin-bottom:48px;
  }
  .cta-group{display:flex; gap:16px; flex-wrap:wrap; justify-content:center;}
  .cta-primary{
    background:var(--acc); color:var(--bg); padding:16px 36px; border-radius:100px;
    font-weight:800; font-size:15px; text-decoration:none; letter-spacing:0.5px;
    transition:transform .2s, box-shadow .2s;
    box-shadow:0 0 32px rgba(0,245,195,0.35);
  }
  .cta-primary:hover{transform:translateY(-2px); box-shadow:0 0 48px rgba(0,245,195,0.5);}
  .cta-secondary{
    border:1px solid var(--border); color:var(--text); padding:16px 36px;
    border-radius:100px; font-weight:600; font-size:15px; text-decoration:none;
    transition:border-color .2s, background .2s;
  }
  .cta-secondary:hover{border-color:var(--muted); background:rgba(255,255,255,0.04);}

  /* Carousel */
  .carousel-section{padding:100px 24px; text-align:center;}
  .section-label{
    font-size:11px; letter-spacing:4px; font-weight:700; color:var(--acc);
    text-transform:uppercase; margin-bottom:16px;
  }
  .section-title{font-size:clamp(28px,5vw,48px); font-weight:800; margin-bottom:48px; letter-spacing:-1px;}
  .carousel{
    display:flex; gap:24px; overflow-x:auto; padding:24px 0 48px;
    scrollbar-width:none; justify-content:safe center;
  }
  .carousel::-webkit-scrollbar{display:none;}
  .carousel-card{
    flex:0 0 auto; width:195px; height:422px;
    border-radius:20px; overflow:hidden; border:1px solid var(--border);
    box-shadow:0 24px 60px rgba(0,0,0,0.5);
    transition:transform .3s, box-shadow .3s;
    cursor:pointer; position:relative;
  }
  .carousel-card:hover{
    transform:translateY(-8px) scale(1.02);
    box-shadow:0 32px 80px rgba(0,245,195,0.15);
  }
  .carousel-card img{width:100%; height:100%; object-fit:cover;}
  .carousel-label{
    position:absolute; bottom:0; left:0; right:0;
    background:linear-gradient(to top, rgba(7,11,18,0.95), transparent);
    padding:24px 12px 12px;
    font-size:11px; font-weight:600; color:var(--text); text-align:left;
    letter-spacing:1px;
  }

  /* Features */
  .features{padding:80px 24px; max-width:1100px; margin:0 auto;}
  .features-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:24px;}
  .feature-card{
    background:var(--card); border:1px solid var(--border);
    border-radius:20px; padding:32px;
    position:relative; overflow:hidden;
  }
  .feature-card::before{
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:var(--accent-color,var(--acc));
  }
  .feature-icon{
    width:48px; height:48px; border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    background:rgba(0,245,195,0.12); font-size:22px; margin-bottom:20px;
  }
  .feature-title{font-size:18px; font-weight:700; margin-bottom:10px;}
  .feature-desc{font-size:14px; color:var(--muted); line-height:1.6;}

  /* Palette */
  .palette-section{padding:80px 24px; max-width:900px; margin:0 auto; text-align:center;}
  .palette-swatches{display:flex; gap:16px; justify-content:center; flex-wrap:wrap; margin-top:32px;}
  .swatch{
    width:80px; height:80px; border-radius:16px;
    border:1px solid rgba(255,255,255,0.1);
    display:flex; align-items:flex-end; padding:8px;
    font-size:9px; font-weight:600; color:rgba(255,255,255,0.7);
    font-family:monospace;
  }

  /* Links */
  .links-section{padding:60px 24px 120px; text-align:center;}
  .links-section a{
    display:inline-block; margin:8px;
    color:var(--acc); text-decoration:none;
    font-size:14px; border-bottom:1px solid rgba(0,245,195,0.3);
    padding-bottom:2px; transition:border-color .2s;
  }
  .links-section a:hover{border-color:var(--acc);}

  /* Footer */
  footer{
    border-top:1px solid var(--border); padding:32px 24px;
    text-align:center; color:var(--muted); font-size:13px;
  }
  .ram-tag{color:var(--acc); font-weight:700; letter-spacing:2px;}
</style>
</head>
<body>

<!-- Hero -->
<section class="hero">
  <div class="badge">DESIGN HEARTBEAT · RAM</div>
  <h1>NURA</h1>
  <p class="tagline">${TAGLINE}. Track your cognitive peaks, flow states, and recovery to do your deepest work.</p>
  <div class="cta-group">
    <a class="cta-primary" href="https://ram.zenbin.org/${SLUG}-viewer">View in Pencil ↗</a>
    <a class="cta-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- Screen Carousel -->
<section class="carousel-section">
  <div class="section-label">Screens</div>
  <h2 class="section-title">6 screens · 556 elements</h2>
  <div class="carousel">
    ${pen.screens.map((s, i) => `
    <div class="carousel-card" onclick="window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank')">
      <img src="${screenUris[i]}" alt="${s.name}" loading="lazy">
      <div class="carousel-label">${String(i + 1).padStart(2, '0')} · ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- Features -->
<section class="features">
  <div class="section-label" style="text-align:center">Design Decisions</div>
  <h2 class="section-title" style="text-align:center;margin-bottom:40px">Built around one idea</h2>
  <div class="features-grid">
    <div class="feature-card" style="--accent-color:var(--acc)">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Bioluminescent Dark Palette</div>
      <div class="feature-desc">Inspired by Godly.website's featured acid-green/teal work — a near-black #070B12 base lit by #00F5C3 teal and #A855F7 violet. Each accent has a purpose: teal = focus/active, violet = insight/AI, amber = energy/warning.</div>
    </div>
    <div class="feature-card" style="--accent-color:var(--acc2)">
      <div class="feature-icon">⚡</div>
      <div class="feature-title">Floating Card System</div>
      <div class="feature-desc">Gleam-edge cards (1px colored top border per card) create hierarchy without shadows. Each card type telegraphs its function through accent color — active sessions glow teal, AI insights glow violet, alerts glow amber.</div>
    </div>
    <div class="feature-card" style="--accent-color:var(--acc3)">
      <div class="feature-icon">✦</div>
      <div class="feature-title">Cognitive Data Visualization</div>
      <div class="feature-desc">Biometric data (HRV, flow state, focus intensity) rendered as sparklines and heatmaps rather than raw numbers. The neural score ring on the dashboard immediately communicates state without cognitive load.</div>
    </div>
  </div>
</section>

<!-- Palette -->
<section class="palette-section">
  <div class="section-label">Color System</div>
  <h2 class="section-title" style="margin-bottom:0">Electric Bioluminescence</h2>
  <div class="palette-swatches">
    <div class="swatch" style="background:#070B12">#070B12</div>
    <div class="swatch" style="background:#0C1220">#0C1220</div>
    <div class="swatch" style="background:#111A2E">#111A2E</div>
    <div class="swatch" style="background:#00F5C3;color:#070B12">#00F5C3</div>
    <div class="swatch" style="background:#A855F7">#A855F7</div>
    <div class="swatch" style="background:#F59E0B;color:#070B12">#F59E0B</div>
    <div class="swatch" style="background:#E2EBF9;color:#070B12">#E2EBF9</div>
    <div class="swatch" style="background:#1E2E4A">#1E2E4A</div>
  </div>
</section>

<!-- Links -->
<section class="links-section">
  <div class="section-label">Explore</div>
  <br><br>
  <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a>
  <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock (light/dark)</a>
</section>

<footer>
  <span class="ram-tag">RAM</span> — Design Heartbeat · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Electric Bioluminescence
</footer>

</body>
</html>`;

// Viewer with embedded pen
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero page...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
