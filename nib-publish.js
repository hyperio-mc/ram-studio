'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'nib';
const APP     = 'NIB';
const TAGLINE = 'Rare manuscript catalogue for serious collectors';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: '/v1/pages/' + slug,
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

const penJson = fs.readFileSync(path.join(__dirname, SLUG + '.pen'), 'utf8');
const pen = JSON.parse(penJson);
const screens = pen.screens;

// Build screen carousel SVG data URIs
function svgToDataUri(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// Palette
const C = {
  bg:     '#FAF7F1',
  card:   '#F3EFE6',
  card2:  '#EDE7D9',
  text:   '#1C1915',
  text2:  '#5A4F42',
  muted:  '#9C8E7E',
  acc:    '#4A3728',
  acc2:   '#B05C2E',
  border: '#D9D1C2',
};

// ── Hero HTML ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&family=Courier+Prime:wght@400;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:${C.bg};color:${C.text};font-family:'Inter',sans-serif;min-height:100vh}

  /* Nav */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(250,247,241,0.9);
    backdrop-filter:blur(12px);border-bottom:1px solid ${C.border};padding:0 48px;
    height:60px;display:flex;align-items:center;justify-content:space-between}
  .nav-logo{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;
    color:${C.acc};letter-spacing:-0.3px}
  .nav-sub{font-family:'Courier Prime',monospace;font-size:11px;color:${C.muted};
    letter-spacing:1.5px;margin-left:10px}
  .nav-right{display:flex;gap:32px;align-items:center}
  .nav-link{font-size:13px;color:${C.text2};text-decoration:none;letter-spacing:0.3px}
  .nav-link:hover{color:${C.acc}}
  .nav-cta{background:${C.acc};color:#fff;padding:9px 22px;border-radius:4px;
    font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.3px}
  .nav-cta:hover{background:#3a2a1e}

  /* Hero */
  .hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;
    padding:120px 48px 80px;position:relative;overflow:hidden}
  .hero-eyebrow{font-family:'Courier Prime',monospace;font-size:11px;color:${C.acc2};
    letter-spacing:3px;font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:12px}
  .hero-eyebrow::before{content:'';display:inline-block;width:30px;height:1px;background:${C.acc2}}
  .hero-title{font-family:'Playfair Display',serif;font-size:clamp(52px,8vw,96px);
    font-weight:700;line-height:1.05;letter-spacing:-2px;color:${C.text};margin-bottom:12px}
  .hero-title em{color:${C.acc};font-style:italic}
  .hero-rule{width:80px;height:2px;background:${C.acc2};margin:28px 0}
  .hero-sub{font-size:18px;color:${C.text2};max-width:520px;line-height:1.65;
    font-weight:300;margin-bottom:44px}
  .hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  .btn-primary{background:${C.acc};color:#fff;padding:14px 32px;border-radius:4px;
    font-size:14px;font-weight:500;text-decoration:none;letter-spacing:0.3px;transition:all 0.2s}
  .btn-primary:hover{background:#3a2a1e;transform:translateY(-1px)}
  .btn-secondary{border:1px solid ${C.border};color:${C.text2};padding:14px 28px;
    border-radius:4px;font-size:14px;font-weight:400;text-decoration:none;transition:all 0.2s}
  .btn-secondary:hover{border-color:${C.acc};color:${C.acc}}
  .hero-meta{font-family:'Courier Prime',monospace;font-size:11px;color:${C.muted};
    margin-top:64px;display:flex;gap:40px;flex-wrap:wrap}
  .hero-meta span{display:flex;align-items:center;gap:8px}
  .hero-meta span::before{content:'';display:inline-block;width:6px;height:6px;
    border-radius:50%;background:${C.acc2}}

  /* Background ornament */
  .hero-bg{position:absolute;right:-60px;top:50%;transform:translateY(-50%);
    opacity:0.06;pointer-events:none;user-select:none;font-family:'Playfair Display',serif;
    font-size:320px;font-weight:700;color:${C.acc};line-height:1;letter-spacing:-20px}

  /* Screens carousel */
  .screens-section{padding:80px 48px;background:${C.card};border-top:1px solid ${C.border};
    border-bottom:1px solid ${C.border}}
  .section-label{font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:3px;
    color:${C.muted};font-weight:700;margin-bottom:16px}
  .section-title{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;
    color:${C.text};margin-bottom:8px;letter-spacing:-0.5px}
  .section-sub{font-size:15px;color:${C.text2};margin-bottom:48px;font-weight:300;max-width:500px}
  .carousel{display:flex;gap:20px;overflow-x:auto;padding-bottom:20px;
    scrollbar-width:none;cursor:grab}
  .carousel::-webkit-scrollbar{display:none}
  .carousel-card{flex:0 0 200px;border-radius:10px;overflow:hidden;
    border:1px solid ${C.border};background:#fff;transition:all 0.25s;box-shadow:0 2px 8px rgba(74,55,40,0.06)}
  .carousel-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(74,55,40,0.12)}
  .carousel-card img{width:100%;height:auto;display:block}
  .carousel-card .card-label{padding:10px 12px;font-family:'Courier Prime',monospace;
    font-size:10px;color:${C.muted};letter-spacing:1px;border-top:1px solid ${C.border}}

  /* Features grid */
  .features-section{padding:80px 48px}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;
    margin-top:48px}
  .feature-card{background:${C.card};border:1px solid ${C.border};border-radius:8px;
    padding:28px;transition:border-color 0.2s}
  .feature-card:hover{border-color:${C.acc2}}
  .feature-icon{width:36px;height:36px;background:${C.card2};border-radius:6px;
    display:flex;align-items:center;justify-content:center;margin-bottom:16px;
    font-size:18px;border:1px solid ${C.border}}
  .feature-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;
    color:${C.text};margin-bottom:8px}
  .feature-body{font-size:13px;color:${C.text2};line-height:1.65;font-weight:300}

  /* Annotation demo */
  .annotation-section{padding:80px 48px;background:${C.card};border-top:1px solid ${C.border};
    border-bottom:1px solid ${C.border}}
  .annotation-demo{position:relative;max-width:600px;margin:48px auto 0;
    background:#fff;border-radius:10px;border:1px solid ${C.border};padding:32px;
    box-shadow:0 4px 16px rgba(74,55,40,0.08)}
  .ms-lines{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
  .ms-line{height:3px;background:${C.border};border-radius:2px}
  .ms-line.w80{width:80%} .ms-line.w65{width:65%} .ms-line.w90{width:90%}
  .ms-line.w55{width:55%} .ms-line.w75{width:75%}
  .annot-label{position:absolute;background:${C.acc2};color:#fff;font-family:'Courier Prime',monospace;
    font-size:10px;padding:3px 8px;border-radius:3px;letter-spacing:1px;font-weight:700}
  .annot-line{position:absolute;background:${C.acc2};opacity:0.5}

  /* Palette strip */
  .palette-section{padding:48px 48px;background:${C.bg}}
  .palette-strip{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
  .swatch{height:56px;flex:1;min-width:80px;border-radius:6px;border:1px solid ${C.border};
    display:flex;align-items:flex-end;padding:8px;position:relative;overflow:hidden}
  .swatch-label{font-family:'Courier Prime',monospace;font-size:10px;font-weight:700;letter-spacing:1px}

  /* Footer */
  footer{padding:32px 48px;border-top:1px solid ${C.border};display:flex;
    justify-content:space-between;align-items:center;flex-wrap:gap;gap:16px}
  .footer-logo{font-family:'Playfair Display',serif;font-weight:700;color:${C.acc};font-size:16px}
  .footer-links{display:flex;gap:28px}
  .footer-link{font-size:13px;color:${C.muted};text-decoration:none}
  .footer-link:hover{color:${C.acc}}
  .footer-credit{font-family:'Courier Prime',monospace;font-size:10px;color:${C.muted};
    letter-spacing:1px}

  @media(max-width:768px){
    nav,hero,.screens-section,.features-section,.annotation-section,
    .palette-section,footer{padding-left:24px;padding-right:24px}
    .hero-bg{display:none}
    .hero-title{font-size:44px}
  }
</style>
</head>
<body>

<nav>
  <div style="display:flex;align-items:baseline">
    <span class="nav-logo">NIB</span>
    <span class="nav-sub">MANUSCRIPT CATALOGUE</span>
  </div>
  <div class="nav-right">
    <a href="#screens" class="nav-link">Screens</a>
    <a href="#features" class="nav-link">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-link">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Interactive Mock</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-bg">NIB</div>
  <div class="hero-eyebrow">HEARTBEAT #498 — LIGHT THEME</div>
  <h1 class="hero-title">The <em>Collector's</em><br>Archive</h1>
  <div class="hero-rule"></div>
  <p class="hero-sub">A rare manuscript catalogue for serious bibliophiles. Log acquisitions, annotate specimens with archival precision, and trace provenance across continents and centuries.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Explore Mock →</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">Open Viewer</a>
  </div>
  <div class="hero-meta">
    <span>6 screens</span>
    <span>554 elements</span>
    <span>Warm archival · light theme</span>
    <span>minimal.gallery + Land-book inspired</span>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="section-label">SCREENS — 01 / 06</div>
  <h2 class="section-title">Six Archival Views</h2>
  <p class="section-sub">From the index table to the annotated specimen — every screen designed like a page from a scholarly catalogue raisonné.</p>
  <div class="carousel">
    ${screens.map((s,i) => `
    <div class="carousel-card">
      <img src="${svgToDataUri(s.svg)}" alt="${s.name}" width="200" height="435" loading="${i<2?'eager':'lazy'}">
      <div class="card-label">${String(i+1).padStart(2,'0')} — ${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features-section" id="features">
  <div class="section-label">FEATURES</div>
  <h2 class="section-title">Built for the Serious Collector</h2>
  <p class="section-sub">Every detail serves scholarship — from pointer-line annotations to full provenance chains.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">📋</div>
      <div class="feature-title">Archival Index Grid</div>
      <div class="feature-body">Your collection displayed as a scholarly catalogue — lot numbers, condition grades, valuations, and script types in a scannable table.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔬</div>
      <div class="feature-title">Specimen Annotations</div>
      <div class="feature-body">Technical pointer lines label every feature of a manuscript — rubrication, script type, material support — in the Spaceship Manual aesthetic.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🗺</div>
      <div class="feature-title">Provenance Origins Map</div>
      <div class="feature-body">Geographic origin visualisation — dot-scaled by item count, with a cartographic grid overlay referencing historical scriptoria locations.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📎</div>
      <div class="feature-title">Acquisition Form</div>
      <div class="feature-body">Log new items with labelled form fields — ARGOS-style dashed upload zone, condition grade, provenance chain, and estimated value range.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔎</div>
      <div class="feature-title">Browse by Era + Script</div>
      <div class="feature-body">Filter the archive by medieval era (500–1600 CE) or by script type — Carolingian Minuscule, Gothic Textura, Nashī Arabic — with proportional bar charts.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🏛</div>
      <div class="feature-title">Collector Profile</div>
      <div class="feature-body">Portfolio value, acquisition timeline, activity feed, and expertise tags — presented in the same archival register as the collection itself.</div>
    </div>
  </div>
</section>

<section class="annotation-section">
  <div class="section-label">DESIGN LANGUAGE</div>
  <h2 class="section-title">Spaceship Manual Annotations</h2>
  <p class="section-sub">Inspired by Land-book's blueprint aesthetic — thin L-shaped pointer lines label manuscript features with monospace precision.</p>
  <div class="annotation-demo">
    <div style="font-family:'Playfair Display',serif;font-size:13px;font-weight:700;color:${C.acc2};margin-bottom:8px">B</div>
    <div class="ms-lines">
      <div class="ms-line w80"></div><div class="ms-line w65"></div>
      <div class="ms-line w90"></div><div class="ms-line w55"></div>
      <div class="ms-line w75"></div><div class="ms-line w80"></div>
    </div>
    <div style="font-size:12px;color:${C.muted};font-family:'Courier Prime',monospace;margin-top:8px">
      ← RUBRICATION · BICOLUMNAR LAYOUT · GOTHIC TEXTURA · VELLUM LEAF →
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">PALETTE</div>
  <h2 class="section-title" style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:4px">Warm Archival Paper</h2>
  <div class="palette-strip">
    <div class="swatch" style="background:${C.bg}">
      <span class="swatch-label" style="color:${C.text2}">BG · ${C.bg}</span></div>
    <div class="swatch" style="background:${C.card}">
      <span class="swatch-label" style="color:${C.text2}">CARD · ${C.card}</span></div>
    <div class="swatch" style="background:${C.card2}">
      <span class="swatch-label" style="color:${C.text2}">CARD2 · ${C.card2}</span></div>
    <div class="swatch" style="background:${C.acc}">
      <span class="swatch-label" style="color:#fff">ACC · ${C.acc}</span></div>
    <div class="swatch" style="background:${C.acc2}">
      <span class="swatch-label" style="color:#fff">ACC2 · ${C.acc2}</span></div>
    <div class="swatch" style="background:${C.text}">
      <span class="swatch-label" style="color:${C.muted}">TEXT · ${C.text}</span></div>
  </div>
</section>

<footer>
  <div>
    <div class="footer-logo">NIB</div>
    <div style="font-family:'Courier Prime',monospace;font-size:10px;color:${C.muted};margin-top:4px">
      RAM DESIGN HEARTBEAT #498 · 2026-04-12
    </div>
  </div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="footer-link">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="footer-link">Mock ☀◑</a>
  </div>
  <div class="footer-credit">RAM · DESIGN STUDIO</div>
</footer>

</body>
</html>`;

// ── Viewer HTML ─────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = '<script>window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';</script>';
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, APP + ' — ' + TAGLINE);
  console.log('Hero:', r1.status, r1.body.slice(0,80));

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, APP + ' — Viewer');
  console.log('Viewer:', r2.status, r2.body.slice(0,80));
}
main().catch(console.error);
