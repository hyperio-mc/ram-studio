'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'beam';
const penJson  = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen      = JSON.parse(penJson);

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

// ── Palette for hero page ─────────────────────────────────────────────────────
const bg      = '#090D1A';
const surf    = '#0D1220';
const card    = '#131A2E';
const acc     = '#00D4FF';
const acc2    = '#FF5B35';
const green   = '#10B981';
const warn    = '#F59E0B';
const textC   = '#E2E8F0';
const muted   = 'rgba(148,163,184,0.55)';

// ── SVG → data URI thumbnails ─────────────────────────────────────────────────
const thumbs = pen.screens.map(s =>
  `data:image/svg+xml;base64,${Buffer.from(s.svg).toString('base64')}`
);

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BEAM — Pinpoint every fault before it cascades</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${bg};--surf:${surf};--card:${card};
    --acc:${acc};--acc2:${acc2};--green:${green};--warn:${warn};
    --text:${textC};--muted:${muted};
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;min-height:100vh}
  a{color:var(--acc);text-decoration:none}
  /* Nav */
  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 32px;background:var(--surf);border-bottom:1px solid rgba(255,255,255,0.06)}
  .logo{font-size:20px;font-weight:800;letter-spacing:4px;color:var(--acc)}
  .logo span{color:var(--text);font-weight:300;letter-spacing:0;margin-left:8px;font-size:13px;opacity:0.7}
  .nav-links{display:flex;gap:28px;font-size:13px;color:var(--muted)}
  .nav-cta{background:var(--acc);color:${bg};padding:8px 20px;border-radius:20px;font-weight:700;font-size:13px;letter-spacing:0.3px}
  /* Hero */
  .hero{text-align:center;padding:80px 32px 60px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 20%,rgba(0,212,255,0.08),transparent);pointer-events:none}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,212,255,0.10);border:1px solid rgba(0,212,255,0.25);border-radius:20px;padding:6px 16px;margin-bottom:28px;font-size:12px;color:var(--acc);font-weight:600;letter-spacing:1px}
  .hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  h1{font-size:clamp(36px,6vw,64px);font-weight:800;line-height:1.1;letter-spacing:-1.5px;margin-bottom:20px}
  h1 em{font-style:normal;color:var(--acc)}
  .hero-sub{font-size:17px;color:var(--muted);max-width:520px;margin:0 auto 40px;line-height:1.7}
  .cta-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:var(--acc);color:${bg};padding:14px 32px;border-radius:28px;font-weight:700;font-size:15px;transition:opacity .2s}
  .btn-primary:hover{opacity:0.85}
  .btn-secondary{border:1px solid rgba(0,212,255,0.3);color:var(--acc);padding:14px 32px;border-radius:28px;font-weight:600;font-size:15px;transition:background .2s}
  .btn-secondary:hover{background:rgba(0,212,255,0.08)}
  /* Stats strip */
  .stats{display:flex;justify-content:center;gap:60px;padding:32px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);margin:0 0 0}
  .stat{text-align:center}
  .stat-val{font-size:28px;font-weight:800;color:var(--acc)}
  .stat-val.g{color:var(--green)}
  .stat-val.w{color:var(--warn)}
  .stat-label{font-size:11px;color:var(--muted);letter-spacing:1.2px;text-transform:uppercase;margin-top:4px}
  /* Screens carousel */
  .screens-section{padding:60px 24px}
  .section-label{text-align:center;font-size:11px;color:var(--acc);letter-spacing:2px;font-weight:700;text-transform:uppercase;margin-bottom:12px}
  .section-title{text-align:center;font-size:clamp(24px,4vw,36px);font-weight:800;margin-bottom:8px;letter-spacing:-0.5px}
  .section-sub{text-align:center;font-size:15px;color:var(--muted);max-width:480px;margin:0 auto 40px}
  .carousel{display:flex;gap:20px;overflow-x:auto;padding:8px 0 20px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .carousel::-webkit-scrollbar{display:none}
  .screen-card{flex:0 0 220px;scroll-snap-align:start;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);background:var(--card);transition:transform .2s,box-shadow .2s}
  .screen-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,212,255,0.15)}
  .screen-card img{width:100%;display:block;aspect-ratio:390/844;object-fit:cover}
  .screen-label{padding:12px 14px;font-size:12px;color:var(--muted);font-weight:500;letter-spacing:0.3px}
  /* Feature bento grid */
  .bento-section{padding:20px 24px 60px}
  .bento{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:900px;margin:0 auto}
  .bento-cell{background:var(--card);border-radius:16px;padding:28px;border:1px solid rgba(255,255,255,0.05)}
  .bento-cell.wide{grid-column:1/-1}
  .bento-cell.tall{padding:36px 28px}
  .bento-icon{font-size:24px;margin-bottom:16px}
  .bento-cell h3{font-size:17px;font-weight:700;margin-bottom:8px;letter-spacing:-0.2px}
  .bento-cell p{font-size:14px;color:var(--muted);line-height:1.65}
  .bento-metric{font-size:36px;font-weight:800;color:var(--acc);margin:12px 0 4px;line-height:1}
  .bento-metric-sub{font-size:12px;color:var(--muted)}
  /* Palette */
  .palette-section{padding:0 24px 60px}
  .swatch-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
  .swatch{border-radius:12px;padding:20px 16px 12px;min-width:90px;text-align:center}
  .swatch-name{font-size:11px;color:rgba(255,255,255,0.6);margin-top:8px}
  .swatch-hex{font-size:10px;font-family:monospace;opacity:0.5;margin-top:2px}
  /* Links */
  .links-section{text-align:center;padding:0 24px 80px}
  .links-section a{display:inline-block;margin:8px 12px;padding:12px 28px;border-radius:24px;font-size:14px;font-weight:600;border:1px solid rgba(0,212,255,0.3);color:var(--acc);transition:background .2s}
  .links-section a:hover{background:rgba(0,212,255,0.08)}
  .links-section a.mock-link{background:rgba(0,212,255,0.10)}
  /* Footer */
  footer{border-top:1px solid rgba(255,255,255,0.05);padding:28px 32px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--muted)}
  @media(max-width:600px){
    .bento{grid-template-columns:1fr}
    .bento-cell.wide{grid-column:1}
    .stats{gap:32px}
    nav{padding:16px}
    .nav-links{display:none}
  }
</style>
</head>
<body>

<nav>
  <div class="logo">BEAM <span>observability</span></div>
  <div class="nav-links">
    <a href="#">Traces</a>
    <a href="#">Service Map</a>
    <a href="#">Alerts</a>
    <a href="#">Docs</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/beam-viewer">View Design →</a>
</nav>

<section class="hero">
  <div class="hero-badge">🔴 LIVE · API OBSERVABILITY</div>
  <h1>Pinpoint every fault<br>before it <em>cascades</em></h1>
  <p class="hero-sub">BEAM gives your team distributed tracing, live service graphs, and P99 latency tracking — all in one dark-first observability dashboard.</p>
  <div class="cta-row">
    <a class="btn-primary" href="https://ram.zenbin.org/beam-viewer">View in Pencil →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/beam-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="stats">
  <div class="stat"><div class="stat-val g">99.97%</div><div class="stat-label">Uptime Tracked</div></div>
  <div class="stat"><div class="stat-val">142ms</div><div class="stat-label">P99 Latency</div></div>
  <div class="stat"><div class="stat-val w">0.03%</div><div class="stat-label">Error Rate</div></div>
  <div class="stat"><div class="stat-val">8,420</div><div class="stat-label">Req / Min</div></div>
  <div class="stat"><div class="stat-val">24</div><div class="stat-label">Services Live</div></div>
</div>

<section class="screens-section">
  <div class="section-label">6 screens</div>
  <h2 class="section-title">Every view your team needs</h2>
  <p class="section-sub">From bento-grid overview to trace waterfall to live service dependency graph.</p>
  <div class="carousel">
    ${pen.screens.map((s,i) => `
    <div class="screen-card">
      <img src="${thumbs[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="bento-section">
  <div class="section-label">Design System</div>
  <h2 class="section-title">Built on a clear visual logic</h2>
  <p class="section-sub">Navy-dark foundation, single cyan accent, monospace type for technical data.</p>
  <div class="bento">
    <div class="bento-cell wide">
      <div class="bento-icon">◈</div>
      <h3>Asymmetric Bento Grid</h3>
      <p>Inspired by Antimetal's asymmetric card pairs (saaspo.com). Full-width latency sparkline anchors the dashboard; two half-width bentos below balance request volume against service health — deliberate visual weight hierarchy.</p>
    </div>
    <div class="bento-cell">
      <div class="bento-icon">⊹</div>
      <h3>Navy-Dark Foundation</h3>
      <p>Navy <code style="color:var(--acc);font-size:12px">#090D1A</code> over pure black. From darkmodedesign.com research: tinted deep backgrounds reduce eye strain while communicating premium quality.</p>
      <div class="bento-metric" style="color:var(--acc)">3</div>
      <div class="bento-metric-sub">depth layers: bg / surface / card</div>
    </div>
    <div class="bento-cell">
      <div class="bento-icon">⌥</div>
      <h3>Monospace as Brand</h3>
      <p>Service names, trace IDs, threshold values — all rendered in monospace. Inspired by the "developer tools have personality now" trend from Godly.website.</p>
    </div>
    <div class="bento-cell">
      <div class="bento-icon">⚡</div>
      <h3>Trace Waterfall</h3>
      <p>8-span cascade with depth-indented lanes, proportional timing bars, and per-span color coding. Slow and error spans immediately visible at a glance.</p>
      <div class="bento-metric">524ms</div>
      <div class="bento-metric-sub">max trace depth shown</div>
    </div>
    <div class="bento-cell">
      <div class="bento-icon">◎</div>
      <h3>Live Service Graph</h3>
      <p>Dependency topology with dot-grid canvas texture, edge traffic indicators, and per-node rps badges. Degraded connections highlighted in amber.</p>
    </div>
    <div class="bento-cell">
      <div class="bento-icon">◉</div>
      <h3>Single Accent Rule</h3>
      <p>One dominant cyan <code style="color:var(--acc);font-size:12px">#00D4FF</code> for navigation, selection states, and primary data. Orange for errors only. Green for health. No color confusion.</p>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">Palette</div>
  <h2 class="section-title" style="margin-bottom:28px">Navy-Dark system</h2>
  <div class="swatch-row">
    ${[
      {name:'BG',hex:'#090D1A',light:false},
      {name:'Surface',hex:'#0D1220',light:false},
      {name:'Card',hex:'#131A2E',light:false},
      {name:'Cyan',hex:'#00D4FF',light:false},
      {name:'Flame',hex:'#FF5B35',light:false},
      {name:'Green',hex:'#10B981',light:false},
      {name:'Amber',hex:'#F59E0B',light:false},
      {name:'Text',hex:'#E2E8F0',light:true},
    ].map(s=>`<div class="swatch" style="background:${s.hex}">
      <div class="swatch-name" style="color:${s.light?'rgba(0,0,0,0.6)':'rgba(255,255,255,0.6)'}">${s.name}</div>
      <div class="swatch-hex" style="color:${s.light?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.4)'}">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<section class="links-section">
  <div class="section-label" style="margin-bottom:20px">Explore the Design</div>
  <a href="https://ram.zenbin.org/beam-viewer">Pencil Viewer →</a>
  <a class="mock-link" href="https://ram.zenbin.org/beam-mock">Interactive Mock ☀◑</a>
</section>

<footer>
  <span>BEAM — RAM Design Heartbeat #42 · Apr 9, 2026</span>
  <span>ram.zenbin.org/beam</span>
</footer>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'BEAM — Pinpoint every fault before it cascades');
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'BEAM — Pencil Viewer');
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
