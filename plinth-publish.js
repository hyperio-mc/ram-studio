'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'plinth';
const APP     = 'PLINTH';
const TAGLINE = 'Your financial foundation';

// ── Palette ──────────────────────────────────────────────────────────────────
const BG   = '#F7F5F1';
const SURF = '#FFFFFF';
const ACC  = '#0F766E';
const ACC2 = '#B45309';
const TEXT = '#1C1917';
const MUTED= '#A8A29E';
const BORDER='#D6D3CF';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
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

// ── Build hero page ──────────────────────────────────────────────────────────
const screens = pen.screens.map(sc => {
  // Build SVG data URI from elements
  const svgEls = (sc.elements || []).map(el => {
    if (el.type === 'rect') {
      const attrs = [`x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"`];
      if (el.rx)          attrs.push(`rx="${el.rx}"`);
      if (el.opacity)     attrs.push(`opacity="${el.opacity}"`);
      if (el.stroke)      attrs.push(`stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`);
      return `<rect ${attrs.join(' ')}/>`;
    }
    if (el.type === 'text') {
      const attrs = [
        `x="${el.x}" y="${el.y}"`,
        `font-size="${el.fontSize}"`,
        `fill="${el.fill}"`,
      ];
      if (el.fontWeight)   attrs.push(`font-weight="${el.fontWeight}"`);
      if (el.fontFamily)   attrs.push(`font-family="${el.fontFamily}"`);
      if (el.textAnchor)   attrs.push(`text-anchor="${el.textAnchor}"`);
      if (el.letterSpacing)attrs.push(`letter-spacing="${el.letterSpacing}"`);
      if (el.opacity)      attrs.push(`opacity="${el.opacity}"`);
      const safe = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text ${attrs.join(' ')}>${safe}</text>`;
    }
    if (el.type === 'circle') {
      const attrs = [`cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"`];
      if (el.opacity)  attrs.push(`opacity="${el.opacity}"`);
      if (el.stroke)   attrs.push(`stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`);
      return `<circle ${attrs.join(' ')}/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
    }
    return '';
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844" style="font-family:system-ui,-apple-system,sans-serif;">${svgEls}</svg>`;
  const dataUri = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  return { name: sc.name, dataUri };
});

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${BG};--surf:${SURF};--acc:${ACC};--acc2:${ACC2};
  --text:${TEXT};--muted:${MUTED};--border:${BORDER};
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6}

/* NAV */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(247,245,241,0.92);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 32px;height:64px;
}
.logo{font-family:'Fraunces',Georgia,serif;font-size:20px;font-weight:700;color:var(--text);letter-spacing:-0.5px}
.logo span{color:var(--acc)}
nav a{font-size:14px;color:var(--muted);text-decoration:none;margin-left:28px;transition:color .2s}
nav a:hover{color:var(--text)}
.nav-cta{
  background:var(--acc);color:#fff;padding:8px 20px;border-radius:100px;
  font-size:14px;font-weight:600;text-decoration:none;margin-left:28px;
  transition:opacity .2s;
}
.nav-cta:hover{opacity:0.88}

/* HERO */
.hero{
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  padding:100px 32px 64px;text-align:center;
}
.hero-eyebrow{
  display:inline-block;background:${ACC}18;color:var(--acc);
  font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
  padding:6px 16px;border-radius:100px;margin-bottom:28px;
}
h1{
  font-family:'Fraunces',Georgia,serif;
  font-size:clamp(48px,8vw,88px);font-weight:700;line-height:1.05;
  letter-spacing:-2px;color:var(--text);margin-bottom:24px;
  max-width:800px;
}
h1 em{color:var(--acc);font-style:normal}
.hero-sub{
  font-size:18px;color:var(--muted);max-width:520px;margin:0 auto 40px;line-height:1.7;
}
.cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-primary{
  background:var(--acc);color:#fff;padding:14px 32px;border-radius:100px;
  font-size:15px;font-weight:600;text-decoration:none;transition:transform .2s,opacity .2s;
}
.btn-primary:hover{transform:translateY(-1px);opacity:.92}
.btn-secondary{
  background:var(--surf);color:var(--text);padding:14px 32px;border-radius:100px;
  font-size:15px;font-weight:500;text-decoration:none;border:1px solid var(--border);
  transition:border-color .2s;
}
.btn-secondary:hover{border-color:var(--acc)}
.trust-row{
  display:flex;gap:24px;justify-content:center;align-items:center;
  margin-top:24px;flex-wrap:wrap;
}
.trust-item{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:6px}
.trust-dot{color:var(--acc)}

/* PHONE CAROUSEL */
.phones{padding:0 32px 80px;overflow:hidden}
.phones-label{text-align:center;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:40px}
.phone-scroll{
  display:flex;gap:24px;justify-content:center;
  overflow-x:auto;padding-bottom:16px;scroll-snap-type:x mandatory;
}
.phone-scroll::-webkit-scrollbar{height:4px}
.phone-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.phone-frame{
  flex-shrink:0;scroll-snap-align:center;
  background:${TEXT};border-radius:40px;padding:10px;
  box-shadow:0 24px 80px rgba(28,25,23,0.2);
}
.phone-frame img{
  display:block;border-radius:32px;width:220px;height:auto;
  image-rendering:crisp-edges;
}
.phone-label{
  text-align:center;font-size:12px;color:var(--muted);
  margin-top:12px;font-weight:500;
}

/* BENTO FEATURES */
.features{padding:80px 32px;max-width:960px;margin:0 auto}
.section-eyebrow{font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--acc);margin-bottom:12px}
.section-title{font-family:'Fraunces',Georgia,serif;font-size:clamp(32px,5vw,52px);font-weight:700;line-height:1.1;letter-spacing:-1px;margin-bottom:48px;max-width:520px}
.bento{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;gap:16px}
.bento-card{
  background:var(--surf);border-radius:20px;padding:28px;
  border:1px solid var(--border);
}
.bento-card.wide{grid-column:span 2}
.bento-card.accent{background:var(--acc);border-color:var(--acc)}
.bento-card.accent *{color:#fff!important}
.bento-card.warm{background:${ACC2};border-color:${ACC2}}
.bento-card.warm *{color:#fff!important}
.card-icon{font-size:28px;margin-bottom:16px}
.card-title{font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:600;margin-bottom:8px}
.card-desc{font-size:14px;color:var(--muted);line-height:1.6}
.card-metric{font-family:'Fraunces',Georgia,serif;font-size:40px;font-weight:700;color:var(--acc);margin-bottom:4px}
.bento-card.accent .card-metric{color:#fff}
.bento-card.warm .card-metric{color:#fff}
.card-metric-label{font-size:13px;color:var(--muted)}

/* PALETTE */
.palette{padding:60px 32px;max-width:960px;margin:0 auto}
.swatches{display:flex;gap:12px;flex-wrap:wrap}
.swatch{width:72px;height:72px;border-radius:16px;border:1px solid var(--border)}
.swatch-info{font-size:11px;color:var(--muted);margin-top:6px;font-family:monospace}

/* LINKS */
.links-row{
  padding:40px 32px 80px;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:12px;
}
.links-row a{
  color:var(--acc);text-decoration:none;font-size:15px;font-weight:500;
  border-bottom:1px solid ${ACC}40;padding-bottom:2px;transition:border-color .2s;
}
.links-row a:hover{border-color:var(--acc)}

/* FOOTER */
footer{
  border-top:1px solid var(--border);padding:32px;
  text-align:center;font-size:13px;color:var(--muted);
}

@media(max-width:700px){
  .bento{grid-template-columns:1fr}
  .bento-card.wide{grid-column:span 1}
  nav a{display:none}
}
</style>
</head>
<body>

<nav>
  <div class="logo">PLINTH<span>.</span></div>
  <div>
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock ☀◑</a>
  </div>
</nav>

<section class="hero">
  <div>
    <div class="hero-eyebrow">RAM Design Heartbeat · Light Theme</div>
    <h1>Money, <em>clearly</em><br>understood</h1>
    <p class="hero-sub">A personal finance OS built on bento-grid clarity. See your full financial picture in one glance.</p>
    <div class="cta-row">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">☀◑ Interactive Mock</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">View in Pencil</a>
    </div>
    <div class="trust-row">
      <span class="trust-item"><span class="trust-dot">●</span> 6 screens</span>
      <span class="trust-item"><span class="trust-dot">●</span> 410 elements</span>
      <span class="trust-item"><span class="trust-dot">●</span> Light theme</span>
      <span class="trust-item"><span class="trust-dot">●</span> Bento grid</span>
    </div>
  </div>
</section>

<section class="phones" id="screens">
  <div class="phones-label">6 Screens</div>
  <div class="phone-scroll">
${screens.map(s => `    <div>
      <div class="phone-frame">
        <img src="${s.dataUri}" width="220" alt="${s.name} screen">
      </div>
      <div class="phone-label">${s.name}</div>
    </div>`).join('\n')}
  </div>
</section>

<section class="features" id="features">
  <div class="section-eyebrow">Design Decisions</div>
  <h2 class="section-title">Built around bento grid clarity</h2>
  <div class="bento">
    <div class="bento-card accent wide">
      <div class="card-icon">⊞</div>
      <div class="card-title">Asymmetric Bento Dashboard</div>
      <div class="card-desc">Inspired by Saaspo's bento grid category — 29 examples of modular card layouts. Net worth gets the hero card, budget sits in a compact adjacent cell. Information density without cognitive overload.</div>
    </div>
    <div class="bento-card">
      <div class="card-metric">68%</div>
      <div class="card-metric-label">Budget used</div>
      <div class="card-desc">At-a-glance donut in the compact bento cell</div>
    </div>
    <div class="bento-card warm">
      <div class="card-icon">𝑓</div>
      <div class="card-title">Fraunces Serif</div>
      <div class="card-desc">Display serif for key metrics — a deliberate counter to the Inter monoculture in SaaS. Numbers feel weighty and trustworthy.</div>
    </div>
    <div class="bento-card">
      <div class="card-icon">🎨</div>
      <div class="card-title">Warm Cream Ground</div>
      <div class="card-desc">#F7F5F1 — not pure white. Lifted from minimal.gallery's paper-like aesthetic. Reduces eye strain and signals premium restraint.</div>
    </div>
    <div class="bento-card accent">
      <div class="card-metric">$124,830</div>
      <div class="card-metric-label">Net worth, always visible</div>
      <div class="card-desc">The most important number leads every session</div>
    </div>
  </div>
</section>

<section class="palette" id="palette" style="padding-top:0">
  <div class="section-eyebrow">Palette</div>
  <div class="swatches">
    ${[
      {c:BG,   l:'BG #F7F5F1'},
      {c:SURF, l:'Surf #FFFFFF'},
      {c:'#EDEAE5',l:'Card #EDEAE5'},
      {c:ACC,  l:'Teal #0F766E'},
      {c:ACC2, l:'Amber #B45309'},
      {c:TEXT, l:'Text #1C1917'},
      {c:MUTED,l:'Muted #A8A29E'},
    ].map(s=>`<div>
      <div class="swatch" style="background:${s.c}"></div>
      <div class="swatch-info">${s.l}</div>
    </div>`).join('')}
  </div>
</section>

<div class="links-row">
  <a href="https://ram.zenbin.org/${SLUG}-viewer">Open in Pencil Viewer →</a>
  <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Svelte Mock →</a>
</div>

<footer>
  RAM Design Heartbeat — PLINTH · ${new Date().toISOString().slice(0,10)} · Light theme<br>
  Inspired by Saaspo bento grid + minimal.gallery warm cream aesthetic
</footer>

</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);
  if (r1.status !== 200 && r1.status !== 201) console.log('Hero body:', r1.body.slice(0,200));

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  if (r2.status !== 200 && r2.status !== 201) console.log('Viewer body:', r2.body.slice(0,200));
}

main().catch(console.error);
