'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'camo';
const NAME    = 'CAMO';
const TAGLINE = 'Go dark. Stay invisible.';

// Palette
const BG   = '#0C1010';
const SURF = '#131C1C';
const CARD = '#1A2626';
const ACC  = '#10B981';
const ACC2 = '#FF5240';
const ACC3 = '#FBBF24';
const TEXT = '#D1EDE4';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type'  : 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain'   : 'ram',
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
const pen     = JSON.parse(penJson);

// Render SVG screens from pen elements
function renderEl(el) {
  if (el.type === 'rect') {
    return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" rx="${el.rx||0}" fill="${el.fill}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||1}" opacity="${el.opacity??1}"/>`;
  }
  if (el.type === 'text') {
    const anchor = el.anchor || 'start';
    return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw||400}" font-family="${el.font||'system-ui,sans-serif'}" text-anchor="${anchor}" letter-spacing="${el.ls||0}" opacity="${el.opacity??1}">${el.content}</text>`;
  }
  if (el.type === 'circle') {
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||1}" opacity="${el.opacity??1}"/>`;
  }
  if (el.type === 'line') {
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw||1}" opacity="${el.opacity??1}"/>`;
  }
  return '';
}

function screenToSvg(screen) {
  const svgEls = screen.elements.map(renderEl).join('\n    ');
  return `<svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
    ${svgEls}
  </svg>`;
}

const screenSvgs = pen.screens.map(screenToSvg);
const svgDataUris = screenSvgs.map(s => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64'));

// ── Hero Page ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CAMO — Go dark. Stay invisible.</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${BG};--surf:${SURF};--card:${CARD};
    --acc:${ACC};--acc2:${ACC2};--acc3:${ACC3};--text:${TEXT};
    --muted:rgba(161,207,190,0.5);
  }
  body{background:var(--bg);color:var(--text);font-family:system-ui,sans-serif;line-height:1.5;overflow-x:hidden}
  /* aurora glow */
  body::before{content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:800px;height:400px;
    background:radial-gradient(ellipse,rgba(16,185,129,0.08) 0%,transparent 70%);pointer-events:none;z-index:0}

  nav{position:sticky;top:0;z-index:100;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;
    background:rgba(12,16,16,0.85);backdrop-filter:blur(16px);border-bottom:1px solid rgba(16,185,129,0.1)}
  .logo{font-family:monospace;font-size:18px;font-weight:700;color:var(--acc);letter-spacing:4px}
  .nav-links{display:flex;gap:32px}
  .nav-links a{color:var(--muted);text-decoration:none;font-size:13px}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--acc);color:#0C1010;padding:8px 20px;border-radius:20px;font-size:13px;font-weight:700;text-decoration:none}

  section{position:relative;z-index:1}

  .hero{padding:100px 40px 80px;text-align:center;max-width:800px;margin:0 auto}
  .badge{display:inline-block;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);
    color:var(--acc);font-size:11px;font-weight:700;letter-spacing:3px;padding:6px 16px;border-radius:20px;margin-bottom:32px;font-family:monospace}
  h1{font-size:clamp(42px,8vw,80px);font-weight:800;line-height:1.05;margin-bottom:24px;
    background:linear-gradient(135deg,var(--text) 0%,var(--acc) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .hero-sub{font-size:18px;color:var(--muted);max-width:520px;margin:0 auto 40px}
  .hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:var(--acc);color:#0C1010;padding:14px 32px;border-radius:24px;font-weight:700;text-decoration:none;font-size:15px}
  .btn-secondary{border:1px solid rgba(16,185,129,0.4);color:var(--acc);padding:14px 32px;border-radius:24px;text-decoration:none;font-size:15px}

  /* Stats strip */
  .stats{display:flex;justify-content:center;gap:60px;padding:48px 40px;border-top:1px solid rgba(16,185,129,0.08);border-bottom:1px solid rgba(16,185,129,0.08);flex-wrap:wrap}
  .stat-val{font-family:monospace;font-size:36px;font-weight:800;color:var(--acc)}
  .stat-label{font-size:12px;color:var(--muted);margin-top:4px}

  /* Screens carousel */
  .screens{padding:80px 40px;text-align:center}
  .screens h2{font-size:32px;font-weight:700;margin-bottom:12px}
  .screens p{color:var(--muted);margin-bottom:48px}
  .phone-row{display:flex;gap:24px;justify-content:center;overflow-x:auto;padding:0 20px 20px;scrollbar-width:thin}
  .phone{flex:0 0 auto;width:200px;background:var(--surf);border-radius:28px;overflow:hidden;
    border:1px solid rgba(16,185,129,0.12);transition:transform 0.3s}
  .phone:hover{transform:translateY(-8px)}
  .phone img{width:100%;height:auto;display:block}
  .phone-label{font-size:11px;color:var(--muted);text-align:center;padding:10px;font-weight:600}

  /* Feature bento grid */
  .features{padding:0 40px 80px;max-width:1000px;margin:0 auto}
  .features h2{font-size:32px;font-weight:700;margin-bottom:40px;text-align:center}
  .bento{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .bento-card{background:var(--surf);border-radius:20px;padding:28px;border:1px solid rgba(16,185,129,0.08);position:relative;overflow:hidden}
  .bento-card.wide{grid-column:span 2}
  .bento-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--acc);opacity:0.5}
  .bento-card.threat::before{background:var(--acc2)}
  .bento-card.warn::before{background:var(--acc3)}
  .bento-icon{font-size:28px;margin-bottom:16px}
  .bento-card h3{font-size:18px;font-weight:700;margin-bottom:8px}
  .bento-card p{font-size:13px;color:var(--muted)}
  .bento-stat{font-family:monospace;font-size:40px;font-weight:800;color:var(--acc);margin:16px 0 4px}
  .bento-stat.red{color:var(--acc2)}
  .bento-stat.amber{color:var(--acc3)}

  /* Palette swatches */
  .palette{padding:0 40px 80px;text-align:center}
  .palette h2{font-size:28px;font-weight:700;margin-bottom:32px}
  .swatches{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .swatch{width:80px;text-align:center}
  .swatch-color{width:80px;height:80px;border-radius:16px;margin-bottom:10px}
  .swatch-hex{font-family:monospace;font-size:11px;color:var(--muted)}
  .swatch-name{font-size:11px;color:var(--text);margin-top:3px}

  footer{padding:40px;text-align:center;border-top:1px solid rgba(16,185,129,0.08)}
  footer p{color:var(--muted);font-size:13px}
  footer a{color:var(--acc);text-decoration:none}

  @media(max-width:700px){.bento{grid-template-columns:1fr}.bento-card.wide{grid-column:span 1}.stats{gap:32px}}
</style>
</head>
<body>

<nav>
  <span class="logo">CAMO</span>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Brokers</a>
    <a href="#">Pricing</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-viewer">View Design</a>
</nav>

<section class="hero">
  <div class="badge">PRIVACY SHIELD · DARK MODE</div>
  <h1>Go dark.<br/>Stay invisible.</h1>
  <p class="hero-sub">CAMO monitors your digital footprint, removes your data from brokers, blocks trackers, and keeps your identity out of the dark web.</p>
  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">View Prototype</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock →</a>
  </div>
</section>

<section class="stats">
  <div><div class="stat-val">23</div><div class="stat-label">data brokers removed</div></div>
  <div><div class="stat-val">12K+</div><div class="stat-label">trackers blocked/week</div></div>
  <div><div class="stat-val">84</div><div class="stat-label">CAMO score (your privacy)</div></div>
  <div><div class="stat-val">3</div><div class="stat-label">breach alerts resolved</div></div>
</section>

<section class="screens">
  <h2>6-Screen Privacy Dashboard</h2>
  <p>Inspired by the warm dark clinical aesthetic of Orbit ML (Godly/Muzli research) — semantic green/coral for safe/threat states</p>
  <div class="phone-row">
    ${pen.screens.map((s, i) => `
    <div class="phone">
      <img src="${svgDataUris[i]}" alt="${s.name}" loading="lazy"/>
      <div class="phone-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <h2>Privacy Intelligence. Automated.</h2>
  <div class="bento">
    <div class="bento-card wide">
      <div class="bento-icon">◉</div>
      <h3>Broker Removal Engine</h3>
      <p>Automatically sends removal requests to 200+ data brokers. Tracks progress and re-scans monthly. Your data stays gone.</p>
      <div class="bento-stat">200+</div>
      <p>brokers monitored continuously</p>
    </div>
    <div class="bento-card threat">
      <div class="bento-icon">⚠</div>
      <h3>Breach Alerts</h3>
      <p>Real-time alerts when your email appears in known data breaches.</p>
      <div class="bento-stat red">3</div>
      <p>new alerts this month</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◎</div>
      <h3>Tracker Shield</h3>
      <p>Blocks advertising, analytics, and fingerprinting trackers across all your browsing.</p>
      <div class="bento-stat">12K</div>
      <p>blocked per week</p>
    </div>
    <div class="bento-card wide warn">
      <div class="bento-icon">⊙</div>
      <h3>VPN + IP Masking</h3>
      <p>Route your traffic through privacy-first servers in Switzerland, Netherlands, or Singapore. Zero-log policy. DNS leak protection included. WebRTC leak blocked.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◈</div>
      <h3>Privacy Score</h3>
      <p>Unified 0–100 audit across identity, network, breach, and password hygiene.</p>
      <div class="bento-stat">84</div>
      <p>your current score</p>
    </div>
  </div>
</section>

<section class="palette">
  <h2>Palette — Warm Dark Teal</h2>
  <div class="swatches">
    ${[
      { hex: BG,   name: 'Background', label: 'Abyss' },
      { hex: SURF, name: 'Surface',    label: 'Depths' },
      { hex: CARD, name: 'Card',       label: 'Shade' },
      { hex: ACC,  name: 'Safe',       label: 'Emerald' },
      { hex: ACC2, name: 'Threat',     label: 'Coral' },
      { hex: ACC3, name: 'Warning',    label: 'Amber' },
      { hex: TEXT, name: 'Text',       label: 'Mist' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}; border:1px solid rgba(255,255,255,0.08)"></div>
      <div class="swatch-hex">${s.hex}</div>
      <div class="swatch-name">${s.label}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <p>RAM Design Heartbeat #42 · <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> · <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a></p>
  <p style="margin-top:8px;opacity:0.5">Inspired by Orbit ML (Godly/Muzli) warm dark monitoring aesthetic + grotesque+monospace data precision pattern</p>
</footer>

</body>
</html>`;

// ── Viewer ──────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0,80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0,80)}`);
}
main().catch(console.error);
