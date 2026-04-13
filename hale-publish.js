'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'hale';
const NAME    = 'HALE';
const TAGLINE = 'Mindful health, beautifully kept';

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

const penJson  = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen      = JSON.parse(penJson);
const palette  = pen.metadata.palette;

// ── SVG render helper (same logic as generator) ──────────────────────────────
function renderScreen(screen) {
  const { width: W, height: H, elements } = screen;
  let paths = '';
  for (const el of elements) {
    switch (el.type) {
      case 'rect':
        paths += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"
          fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}"
          stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
        break;
      case 'text': {
        const anchor = el.textAnchor || 'start';
        paths += `<text x="${el.x}" y="${el.y}"
          font-size="${el.fontSize}" fill="${el.fill}"
          font-weight="${el.fontWeight||400}"
          font-family="${el.fontFamily||'Georgia, serif'}"
          text-anchor="${anchor}"
          letter-spacing="${el.letterSpacing||0}"
          opacity="${el.opacity||1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}</text>`;
        break;
      }
      case 'circle':
        paths += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}"
          fill="${el.fill}" opacity="${el.opacity||1}"
          stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
        break;
      case 'line':
        paths += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"
          stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"
          opacity="${el.opacity||1}"/>`;
        break;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
    viewBox="0 0 ${W} ${H}" style="border-radius:24px;box-shadow:0 8px 40px rgba(92,64,51,0.12)">${paths}</svg>`;
}

const screenSVGs = pen.screens.map(renderScreen);

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${NAME} — ${TAGLINE}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#FAF7F2;--surf:#FFFFFF;--cream:#F5EFE4;--border:#E8DFD0;
  --text:#1C1714;--sub:#6B5A4E;--muted:#A89A8E;
  --accent:#5C4033;--sage:#7B9B6B;--amber:#C4843C;
  --divider:#DDD4C6;
}
body{background:var(--bg);color:var(--text);font-family:'Georgia',serif;overflow-x:hidden}

/* Nav */
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:var(--bg);
  border-bottom:1px solid var(--divider);display:flex;align-items:center;
  justify-content:space-between;padding:0 32px;height:56px}
.nav-logo{font-size:13px;font-weight:700;letter-spacing:3px;color:var(--accent);
  font-family:sans-serif}
.nav-links{display:flex;gap:24px}
.nav-links a{font-family:sans-serif;font-size:12px;color:var(--sub);text-decoration:none;
  letter-spacing:0.5px}
.nav-cta{background:var(--accent);color:#fff;font-family:sans-serif;font-size:12px;
  letter-spacing:0.5px;padding:8px 20px;border-radius:4px;text-decoration:none}

/* Hero */
.hero{min-height:100vh;display:flex;align-items:center;padding:100px 40px 60px;
  max-width:1100px;margin:0 auto;gap:80px}
.hero-text{flex:1;min-width:320px}
.hero-eyebrow{font-family:sans-serif;font-size:10px;letter-spacing:3px;color:var(--muted);
  margin-bottom:24px;text-transform:uppercase}
.hero-title{font-size:clamp(42px,6vw,80px);line-height:1.05;font-weight:300;
  color:var(--text);margin-bottom:28px;letter-spacing:-1px}
.hero-title em{font-style:italic;color:var(--accent)}
.hero-body{font-size:17px;line-height:1.75;color:var(--sub);max-width:440px;margin-bottom:40px}
.hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#fff;padding:14px 32px;border-radius:4px;
  text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:500;letter-spacing:0.3px}
.btn-secondary{color:var(--sub);font-family:sans-serif;font-size:13px;
  text-decoration:underline;text-underline-offset:4px}
.hero-visual{flex:1;min-width:280px;display:flex;justify-content:center}
.phone-wrap{position:relative;width:300px}
.phone-wrap svg{width:100%;height:auto}

/* Divider */
.divider-line{width:60px;height:1px;background:var(--divider);margin:0 auto 48px}

/* Screens carousel */
.screens-section{padding:80px 40px;max-width:1100px;margin:0 auto;text-align:center}
.section-eyebrow{font-family:sans-serif;font-size:10px;letter-spacing:3px;color:var(--muted);
  text-transform:uppercase;margin-bottom:16px}
.section-title{font-size:clamp(28px,4vw,44px);font-weight:300;color:var(--text);
  margin-bottom:12px;letter-spacing:-0.5px}
.section-sub{font-size:15px;color:var(--sub);margin-bottom:56px;line-height:1.7}
.screens-scroll{display:flex;gap:24px;overflow-x:auto;padding-bottom:24px;
  scrollbar-width:thin;scrollbar-color:var(--border) transparent;justify-content:center;
  flex-wrap:wrap}
.screen-card{flex:0 0 auto;text-align:center}
.screen-label{font-family:sans-serif;font-size:11px;color:var(--muted);letter-spacing:1px;
  margin-top:14px;text-transform:uppercase}

/* Features */
.features{padding:80px 40px;background:var(--cream);border-top:1px solid var(--border);
  border-bottom:1px solid var(--border)}
.features-inner{max-width:900px;margin:0 auto}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:32px;margin-top:52px}
.feature-item{background:var(--surf);border:1px solid var(--border);border-radius:4px;
  padding:28px;position:relative;overflow:hidden}
.feature-bar{position:absolute;left:0;top:0;bottom:0;width:3px}
.feature-icon{font-size:22px;margin-bottom:14px}
.feature-title{font-size:15px;font-weight:500;color:var(--text);margin-bottom:8px}
.feature-body{font-size:13px;color:var(--sub);line-height:1.65;font-family:sans-serif}

/* Palette */
.palette-section{padding:72px 40px;max-width:900px;margin:0 auto;text-align:center}
.swatches{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:36px}
.swatch{width:72px}
.swatch-color{height:72px;border-radius:4px;border:1px solid var(--border)}
.swatch-label{font-family:sans-serif;font-size:9px;color:var(--muted);margin-top:8px;letter-spacing:0.5px}
.swatch-hex{font-family:sans-serif;font-size:9px;color:var(--sub)}

/* Quote */
.quote-section{padding:80px 40px;text-align:center;background:var(--accent)}
.quote-text{font-size:clamp(22px,3vw,34px);font-weight:300;color:#fff;font-style:italic;
  max-width:680px;margin:0 auto 20px;line-height:1.5;letter-spacing:-0.3px}
.quote-attr{font-family:sans-serif;font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.55)}

/* CTA */
.cta-section{padding:80px 40px;text-align:center;max-width:600px;margin:0 auto}
.cta-title{font-size:clamp(28px,4vw,44px);font-weight:300;color:var(--text);
  margin-bottom:16px;letter-spacing:-0.5px}
.cta-body{font-size:15px;color:var(--sub);margin-bottom:40px;line-height:1.7;font-family:sans-serif}
.cta-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}

/* Footer */
footer{border-top:1px solid var(--divider);padding:32px 40px;display:flex;
  align-items:center;justify-content:space-between;flex-wrap:gap;
  font-family:sans-serif;font-size:11px;color:var(--muted)}
.footer-logo{letter-spacing:3px;font-weight:700;color:var(--accent)}
.footer-links{display:flex;gap:20px}
.footer-links a{color:var(--muted);text-decoration:none}
</style>
</head>
<body>

<nav>
  <span class="nav-logo">HALE</span>
  <div class="nav-links">
    <a href="#">About</a>
    <a href="#">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">View Design</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Interactive Mock</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-text">
    <div class="hero-eyebrow">Health journaling · Mindful tracking · Wellness</div>
    <h1 class="hero-title">Health is not a<br/>destination.<br/><em>It is the practice</em><br/>of showing up.</h1>
    <p class="hero-body">HALE is a mindful health companion that helps you track movement, nourishment, and rest — with the unhurried grace of a well-kept journal. Warm. Quiet. Yours.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Explore the mock ☀◑</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">View in Pencil viewer →</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-wrap">
      ${screenSVGs[0]}
    </div>
  </div>
</section>

<!-- SCREENS -->
<section class="screens-section">
  <div class="section-eyebrow">All screens</div>
  <h2 class="section-title">Six thoughtfully considered views</h2>
  <p class="section-sub">From a welcoming onboarding to daily trends — every screen breathes.</p>
  <div class="screens-scroll">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      ${screenSVGs[i].replace(/style="[^"]*"/, `style="border-radius:20px;box-shadow:0 4px 24px rgba(92,64,51,0.1);width:170px;height:auto"`)}
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- FEATURES -->
<section class="features">
  <div class="features-inner">
    <div class="section-eyebrow" style="text-align:center">Designed with intention</div>
    <h2 class="section-title" style="text-align:center;margin-bottom:0">What makes HALE different</h2>
    <div class="features-grid">
      <div class="feature-item">
        <div class="feature-bar" style="background:#5C4033"></div>
        <div class="feature-icon">◈</div>
        <div class="feature-title">Log in seconds</div>
        <div class="feature-body">Frictionless entry for meals, movement, mood, and body metrics. Quick tags, smart suggestions, no cognitive load.</div>
      </div>
      <div class="feature-item">
        <div class="feature-bar" style="background:#7B9B6B"></div>
        <div class="feature-icon">◉</div>
        <div class="feature-title">Gentle pattern recognition</div>
        <div class="feature-body">Warm charts reveal what your body is telling you across sleep, activity, HRV, and nourishment — over days and weeks.</div>
      </div>
      <div class="feature-item">
        <div class="feature-bar" style="background:#C4843C"></div>
        <div class="feature-icon">◑</div>
        <div class="feature-title">Health journaling</div>
        <div class="feature-body">An editorial-style journal that connects your written reflections to your tracked data. Words and numbers, together.</div>
      </div>
      <div class="feature-item">
        <div class="feature-bar" style="background:#A278B5"></div>
        <div class="feature-icon">✦</div>
        <div class="feature-title">Daily intention setting</div>
        <div class="feature-body">Each morning, a quiet prompt. Each evening, a brief reflection. Built around the rhythms of a considered life.</div>
      </div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section">
  <div class="section-eyebrow">Colour language</div>
  <h2 class="section-title">Warm, editorial, grounded</h2>
  <p class="section-sub" style="font-family:sans-serif">Inspired by Aesop's earthy warmth and Kinfolk's generous whitespace — a palette that feels like a Sunday morning.</p>
  <div class="swatches">
    ${[
      {hex:'#FAF7F2',name:'Parchment'},
      {hex:'#F5EFE4',name:'Warm cream'},
      {hex:'#5C4033',name:'Terracotta'},
      {hex:'#7B9B6B',name:'Sage'},
      {hex:'#C4843C',name:'Amber'},
      {hex:'#A278B5',name:'Lavender'},
      {hex:'#1C1714',name:'Deep brown'},
      {hex:'#A89A8E',name:'Muted warm'},
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-label">${s.name}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<!-- QUOTE -->
<section class="quote-section">
  <p class="quote-text">"Rest is not idleness, but the pause that sharpens the blade."</p>
  <p class="quote-attr">— John Lubbock · as displayed in HALE's daily intention card</p>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2 class="cta-title">A practice worth keeping</h2>
  <p class="cta-body">Explore the full interactive mock with light/dark toggle, or open the design in the Pencil.dev viewer.</p>
  <div class="cta-buttons">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Interactive mock ☀◑</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">Pencil viewer →</a>
  </div>
</section>

<footer>
  <span class="footer-logo">HALE</span>
  <span>RAM Design Heartbeat #490 · April 2026</span>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </div>
</footer>

</body>
</html>`;

// ── VIEWER ─────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
