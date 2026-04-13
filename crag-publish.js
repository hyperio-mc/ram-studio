'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'crag';
const APP     = 'CRAG';
const TAGLINE = 'Every endpoint, every second';

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
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ── Hero HTML ────────────────────────────────────────────────────────────────
const screens = pen.screens;

function svgToDataUri(svgStr) {
  const enc = encodeURIComponent(svgStr).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml,${enc}`;
}

const P = {
  bg: '#000000', surf: '#0D0D0D', surf2: '#151515', border: 'rgba(255,255,255,0.07)',
  text: '#EDEDED', muted: '#6B7280', cyan: '#22D3EE', green: '#4ADE80',
  amber: '#FBBF24', red: '#F87171', purple: '#A78BFA',
};

const screenCardsHtml = screens.map((sc, i) => {
  const uri = svgToDataUri(sc.svg);
  return `
    <div class="screen-card" style="animation-delay:${i * 0.1}s">
      <div class="screen-label">${sc.name}</div>
      <img src="${uri}" alt="${sc.name}" loading="lazy"/>
    </div>`;
}).join('');

const paletteSwatches = [
  { color: P.bg,     name: 'OLED Black',  hex: '#000000' },
  { color: P.surf,   name: 'Carbon',      hex: '#0D0D0D' },
  { color: P.cyan,   name: 'Signal Cyan', hex: '#22D3EE' },
  { color: P.green,  name: 'Up Green',    hex: '#4ADE80' },
  { color: P.amber,  name: 'Warn Amber',  hex: '#FBBF24' },
  { color: P.red,    name: 'Down Red',    hex: '#F87171' },
  { color: P.purple, name: 'AI Violet',   hex: '#A78BFA' },
].map(s => `
  <div class="swatch">
    <div class="swatch-color" style="background:${s.color};${s.hex === '#000000' ? 'border:1px solid #222;' : ''}"></div>
    <div class="swatch-hex">${s.hex}</div>
    <div class="swatch-name">${s.name}</div>
  </div>`).join('');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#000;--surf:#0D0D0D;--surf2:#151515;--border:rgba(255,255,255,0.07);
    --text:#EDEDED;--muted:#6B7280;
    --cyan:#22D3EE;--green:#4ADE80;--amber:#FBBF24;--red:#F87171;--purple:#A78BFA;
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}

  /* Ambient orbs — from DarkModeDesign.com research */
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:500px;height:500px;background:rgba(34,211,238,0.07);top:-100px;right:-100px;animation:breathe 12s ease-in-out infinite}
  .orb2{width:400px;height:400px;background:rgba(74,222,128,0.05);bottom:0;left:-100px;animation:breathe 15s ease-in-out infinite reverse}
  @keyframes breathe{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.15);opacity:1}}

  /* Grain texture overlay — from Land-book research */
  body::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");opacity:.02;pointer-events:none;z-index:1}

  /* Nav */
  nav{position:fixed;top:0;left:0;right:0;height:60px;background:rgba(0,0,0,0.8);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 32px;z-index:10}
  .nav-logo{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:600;color:var(--cyan);letter-spacing:.15em}
  .nav-links{display:flex;gap:28px;align-items:center}
  .nav-links a{color:var(--muted);text-decoration:none;font-size:13px;font-weight:500;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.3);color:var(--cyan);padding:7px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}
  .nav-cta:hover{background:rgba(34,211,238,0.2)}

  main{position:relative;z-index:2}

  /* Hero */
  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 24px 60px;text-align:center}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.25);color:var(--green);font-size:11px;font-weight:700;letter-spacing:.1em;padding:5px 14px;border-radius:100px;margin-bottom:32px}
  .hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)}
  h1{font-size:clamp(36px,7vw,72px);font-weight:700;line-height:1.05;letter-spacing:-.03em;margin-bottom:24px;font-family:'JetBrains Mono',monospace}
  h1 .accent{color:var(--cyan)}
  .hero-sub{font-size:18px;color:var(--muted);max-width:480px;line-height:1.7;margin-bottom:40px}
  .hero-ctas{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
  .btn-primary{background:var(--cyan);color:#000;padding:13px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;transition:opacity .2s;letter-spacing:.02em}
  .btn-primary:hover{opacity:.85}
  .btn-secondary{background:var(--surf);border:1px solid var(--border);color:var(--text);padding:13px 28px;border-radius:10px;font-size:14px;font-weight:500;text-decoration:none;transition:background .2s}
  .btn-secondary:hover{background:var(--surf2)}

  /* Instrument-panel stat bar — from Godly research */
  .stat-bar{width:100%;max-width:700px;display:grid;grid-template-columns:repeat(4,1fr);gap:0;background:var(--surf);border:1px solid var(--border);border-radius:16px;margin-top:60px;overflow:hidden}
  .stat-item{padding:20px 24px;position:relative}
  .stat-item+.stat-item{border-left:1px solid var(--border)}
  .stat-val{font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:600;margin-bottom:4px}
  .stat-label{font-size:10px;color:var(--muted);font-weight:600;letter-spacing:.08em;text-transform:uppercase}

  /* Screen carousel */
  section{padding:80px 24px;max-width:1100px;margin:0 auto}
  .section-label{font-size:11px;color:var(--cyan);font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}
  .section-heading{font-size:clamp(24px,4vw,40px);font-weight:700;letter-spacing:-.02em;margin-bottom:16px}
  .section-sub{color:var(--muted);font-size:16px;line-height:1.7;max-width:520px;margin-bottom:48px}

  .screens-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px}
  .screen-card{background:var(--surf);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:transform .25s,border-color .25s;opacity:0;animation:fadeUp .5s ease forwards}
  .screen-card:hover{transform:translateY(-4px);border-color:rgba(34,211,238,0.3)}
  .screen-label{font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;padding:12px 14px 8px}
  .screen-card img{width:100%;display:block}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

  /* Features — bento grid from Saaspo research */
  .bento{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;gap:16px;margin-top:0}
  .bento-card{background:var(--surf);border:1px solid var(--border);border-radius:16px;padding:28px;transition:border-color .25s}
  .bento-card:hover{border-color:rgba(34,211,238,0.2)}
  .bento-card.wide{grid-column:span 2}
  .bento-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:20px}
  .bento-card h3{font-size:15px;font-weight:600;margin-bottom:8px}
  .bento-card p{font-size:13px;color:var(--muted);line-height:1.65}
  .bento-card .metric{font-family:'JetBrains Mono',monospace;font-size:36px;font-weight:700;margin:12px 0 4px}
  .bento-card .metric-sub{font-size:12px;color:var(--muted)}

  /* Palette */
  .palette-grid{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{text-align:center}
  .swatch-color{width:60px;height:60px;border-radius:12px;margin-bottom:6px}
  .swatch-hex{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted)}
  .swatch-name{font-size:10px;color:var(--muted);margin-top:2px}

  /* Footer */
  footer{border-top:1px solid var(--border);padding:40px 32px;display:flex;align-items:center;justify-content:space-between;color:var(--muted);font-size:12px;position:relative;z-index:2}
  .footer-logo{font-family:'JetBrains Mono',monospace;color:var(--cyan);font-weight:600;letter-spacing:.12em}
  footer a{color:var(--muted);text-decoration:none}
  footer a:hover{color:var(--cyan)}

  @media(max-width:600px){
    .stat-bar{grid-template-columns:repeat(2,1fr)}
    .stat-item+.stat-item{border-left:none;border-top:1px solid var(--border)}
    .stat-item:nth-child(2n+1)+.stat-item{border-left:none}
    .bento{grid-template-columns:1fr}
    .bento-card.wide{grid-column:span 1}
    nav .nav-links{display:none}
  }
</style>
</head>
<body>
<div class="orb orb1"></div>
<div class="orb orb2"></div>

<nav>
  <div class="nav-logo">CRAG</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">Open Mock ☀◑</a>
</nav>

<main>
<section class="hero">
  <div class="hero-badge">LIVE MONITORING</div>
  <h1>Every endpoint,<br><span class="accent">every second.</span></h1>
  <p class="hero-sub">CRAG watches your APIs around the clock — latency, uptime, incidents, and alerts, all in one instrument panel built for engineers.</p>
  <div class="hero-ctas">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">Open Viewer</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>

  <div class="stat-bar">
    <div class="stat-item">
      <div class="stat-val" style="color:#22D3EE">97.4%</div>
      <div class="stat-label">Global Health</div>
    </div>
    <div class="stat-item">
      <div class="stat-val" style="color:#4ADE80">48</div>
      <div class="stat-label">Endpoints</div>
    </div>
    <div class="stat-item">
      <div class="stat-val" style="color:#FBBF24">83ms</div>
      <div class="stat-label">Avg Latency</div>
    </div>
    <div class="stat-item">
      <div class="stat-val" style="color:#F87171">2</div>
      <div class="stat-label">Active Incidents</div>
    </div>
  </div>
</section>

<section id="screens" style="padding-top:40px">
  <div class="section-label">6 screens</div>
  <div class="section-heading">The full interface</div>
  <div class="section-sub">Instrument panel dashboard, endpoint drill-downs, latency charts, incident timeline, alert rules, and team settings.</div>
  <div class="screens-grid">${screenCardsHtml}</div>
</section>

<section id="features">
  <div class="section-label">Design Decisions</div>
  <div class="section-heading">Built for the terminal generation</div>
  <div class="bento">
    <div class="bento-card">
      <div class="bento-icon" style="background:rgba(34,211,238,0.12);color:#22D3EE">⬡</div>
      <h3>Instrument Panel Gauge</h3>
      <p>Arc-segment health score at the top of the dashboard — inspired by Arrow Dynamics' cyberpunk instrument panel on Godly.website. Tick marks add precision without clutter.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon" style="background:rgba(74,222,128,0.12);color:#4ADE80">◈</div>
      <h3>OLED-Optimised Black</h3>
      <p>True <code style="font-family:JetBrains Mono;font-size:11px;color:#22D3EE">#000000</code> background on mobile. Turns pixels off on OLED displays (iPhone, Samsung) for zero power draw behind the interface.</p>
    </div>
    <div class="bento-card wide">
      <div class="bento-icon" style="background:rgba(251,191,36,0.12);color:#FBBF24">◐</div>
      <h3>Semantic Color Status Language</h3>
      <p>Cyan = active/monitored · Green = healthy/up · Amber = degraded/warning · Red = down/P1 incident · Violet = AI-generated insight. Consistent across every screen — no legend needed after first use.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon" style="background:rgba(167,139,250,0.12);color:#A78BFA">⚙</div>
      <h3>Monospace Data Hierarchy</h3>
      <p>JetBrains Mono for all latency values, uptime percentages, and endpoint paths. Visual separation between UI chrome (Inter) and live data (Mono).</p>
    </div>
    <div class="bento-card">
      <div class="metric" style="color:#22D3EE">779</div>
      <div class="metric-sub">total SVG elements across 6 screens</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon" style="background:rgba(34,211,238,0.12);color:#22D3EE">⬡</div>
      <h3>Surface Elevation Model</h3>
      <p>No drop shadows. Depth is conveyed by surface lightness: #000 → #0D0D0D → #151515 → #1C1C1C. Standard dark-mode pattern from DarkModeDesign.com research.</p>
    </div>
  </div>
</section>

<section id="palette">
  <div class="section-label">Palette</div>
  <div class="section-heading">Carbon Dark</div>
  <div class="section-sub">OLED-first. Seven semantic roles, each pulled from developer-tool conventions and the instrument-panel aesthetic.</div>
  <div class="palette-grid">${paletteSwatches}</div>
</section>
</main>

<footer>
  <span class="footer-logo">RAM ✦ CRAG</span>
  <span>Design heartbeat · ${new Date().toISOString().slice(0, 10)}</span>
  <span>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> &nbsp;·&nbsp;
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </span>
</footer>
</body>
</html>`;

// ── Viewer HTML
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
