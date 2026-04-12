'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'scope2';

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
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);
const totalElements = pen.metadata.elements;

// Build screen preview SVGs
function screenSVG(name, colorAccent) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844"><rect width="390" height="844" fill="#0B0D17"/><rect x="20" y="60" width="160" height="8" rx="4" fill="${colorAccent}" opacity="0.9"/><rect x="20" y="80" width="100" height="6" rx="3" fill="#F5F7FF" opacity="0.3"/><rect x="20" y="106" width="350" height="60" rx="12" fill="#161B2E"/><rect x="20" y="178" width="165" height="88" rx="12" fill="#161B2E"/><rect x="205" y="178" width="165" height="88" rx="12" fill="#161B2E"/><rect x="20" y="106" width="4" height="60" fill="${colorAccent}" rx="2"/><circle cx="50" cy="136" r="10" fill="${colorAccent}" opacity="0.2"/><text x="30" y="280" font-size="14" fill="#F5F7FF" opacity="0.6" font-family="monospace">${name}</text><rect x="0" y="790" width="390" height="54" fill="#111520"/></svg>`)}`;
}

const screens = [
  { name: 'Dashboard',  col: '#FF6B35' },
  { name: 'Alerts',     col: '#FF4D4D' },
  { name: 'Services',   col: '#22D3EE' },
  { name: 'Logs',       col: '#FF6B35' },
  { name: 'Incidents',  col: '#FFB366' },
  { name: 'Settings',   col: '#22C55E' },
];

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SCOPE — observability that doesn't blink</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#0B0D17;--surf:#111520;--card:#161B2E;
    --acc:#FF6B35;--acc2:#22D3EE;--text:#F5F7FF;
    --muted:rgba(245,247,255,0.45);
    --suc:#22C55E;--warn:#FFB366;--err:#FF4D4D;
  }
  body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;overflow-x:hidden}
  .orb{position:fixed;border-radius:50%;pointer-events:none;filter:blur(80px);z-index:0}
  .orb-1{width:500px;height:500px;background:var(--acc);opacity:.06;top:-100px;left:-100px}
  .orb-2{width:600px;height:600px;background:var(--acc2);opacity:.05;bottom:-150px;right:-150px}
  .orb-3{width:300px;height:300px;background:var(--err);opacity:.04;top:40%;left:40%}
  .content{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:0 24px}
  nav{position:sticky;top:0;background:rgba(11,13,23,0.8);backdrop-filter:blur(20px);border-bottom:1px solid rgba(245,247,255,0.06);padding:16px 0;z-index:100}
  nav .content{display:flex;align-items:center;justify-content:space-between}
  .logo{font-size:20px;font-weight:800;letter-spacing:3px;color:var(--text)}
  .logo span{color:var(--acc)}
  .nav-links{display:flex;gap:24px;align-items:center}
  .nav-links a{color:var(--muted);text-decoration:none;font-size:13px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--acc);color:#0B0D17;padding:8px 20px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;box-shadow:0 0 24px rgba(255,107,53,.4);transition:box-shadow .3s}
  .nav-cta:hover{box-shadow:0 0 36px rgba(255,107,53,.6)}
  .hero{padding:100px 0 80px;text-align:center}
  .hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(255,107,53,0.1);border:1px solid rgba(255,107,53,0.25);border-radius:999px;padding:6px 16px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:var(--acc);margin-bottom:32px}
  .hero-eyebrow::before{content:'●';color:var(--err);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .hero h1{font-size:clamp(56px,10vw,96px);font-weight:800;letter-spacing:-2px;line-height:1;margin-bottom:24px}
  .hero h1 span{color:var(--acc);text-shadow:0 0 40px rgba(255,107,53,.5)}
  .hero-sub{font-size:18px;color:var(--muted);max-width:480px;margin:0 auto 48px;line-height:1.6}
  .hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:16px}
  .btn-primary{background:var(--acc);color:#0B0D17;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 0 32px rgba(255,107,53,.45);transition:all .3s}
  .btn-primary:hover{box-shadow:0 0 48px rgba(255,107,53,.65);transform:translateY(-1px)}
  .btn-ghost{border:1px solid rgba(245,247,255,0.18);color:var(--text);padding:14px 32px;border-radius:10px;font-size:15px;text-decoration:none;transition:all .3s}
  .btn-ghost:hover{border-color:rgba(245,247,255,0.35);background:rgba(245,247,255,0.05)}
  .hero-sub2{font-size:12px;color:var(--muted);opacity:.6}
  .cmd-badge{display:inline-flex;align-items:center;gap:6px;background:var(--surf);border:1px solid rgba(245,247,255,0.08);border-radius:8px;padding:8px 16px;font-size:12px;color:var(--muted);margin:32px auto 0}
  .cmd-key{background:rgba(245,247,255,0.08);border-radius:4px;padding:2px 6px;font-size:11px;color:var(--acc2)}
  .screens{padding:40px 0 80px}
  .screens-label{text-align:center;font-size:11px;font-weight:600;letter-spacing:2px;color:var(--muted);margin-bottom:32px}
  .screens-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .screen-card{background:var(--card);border:1px solid rgba(245,247,255,0.06);border-radius:16px;overflow:hidden;transition:all .3s;cursor:pointer}
  .screen-card:hover{border-color:rgba(255,107,53,.3);transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.4)}
  .screen-card img{width:100%;height:180px;object-fit:cover;display:block}
  .screen-card .label{padding:12px 16px;font-size:12px;font-weight:600;color:var(--muted)}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(245,247,255,0.06);border-radius:16px;overflow:hidden;margin-bottom:80px}
  .stat{background:var(--surf);padding:28px 24px;text-align:center}
  .stat .val{font-size:32px;font-weight:800;margin-bottom:6px}
  .stat .lbl{font-size:11px;color:var(--muted);letter-spacing:1px}
  .features{margin-bottom:80px}
  .features h2{font-size:36px;font-weight:700;text-align:center;margin-bottom:16px}
  .features .sub{text-align:center;color:var(--muted);margin-bottom:48px;font-size:15px}
  .features-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  .feat{background:var(--card);border:1px solid rgba(245,247,255,0.06);border-radius:16px;padding:28px;transition:border-color .3s}
  .feat:hover{border-color:rgba(255,107,53,.25)}
  .feat-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}
  .feat h3{font-size:16px;font-weight:700;margin-bottom:8px}
  .feat p{font-size:13px;color:var(--muted);line-height:1.6}
  .palette{background:var(--surf);border-radius:16px;padding:32px;margin-bottom:80px}
  .palette h3{font-size:14px;font-weight:600;letter-spacing:1.5px;color:var(--muted);margin-bottom:20px}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{width:56px;height:56px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:6px}
  .swatch-label{font-size:9px;font-weight:700;letter-spacing:.5px}
  .cta-block{text-align:center;padding:60px 0 80px}
  .cta-block h2{font-size:40px;font-weight:800;margin-bottom:16px}
  .cta-block p{color:var(--muted);margin-bottom:40px;font-size:16px}
  footer{border-top:1px solid rgba(245,247,255,0.06);padding:32px 0;text-align:center}
  footer p{color:var(--muted);font-size:13px}
  footer a{color:var(--acc);text-decoration:none}
  @media(max-width:600px){.screens-grid{grid-template-columns:repeat(2,1fr)}.stats{grid-template-columns:repeat(2,1fr)}.features-grid{grid-template-columns:1fr}.nav-links{display:none}}
</style>
</head>
<body>

<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<div class="orb orb-3"></div>

<nav>
  <div class="content">
    <div class="logo">SC<span>O</span>PE</div>
    <div class="nav-links">
      <a href="#">Alerts</a>
      <a href="#">Services</a>
      <a href="#">Logs</a>
      <a href="#">Incidents</a>
      <a href="https://ram.zenbin.org/scope2-viewer">Viewer</a>
      <a href="https://ram.zenbin.org/scope2-mock" class="nav-cta">Live Mock</a>
    </div>
  </div>
</nav>

<section class="hero">
  <div class="content">
    <div class="hero-eyebrow">LIVE MONITORING ACTIVE</div>
    <h1>SCOPE</h1>
    <p class="hero-sub">observability that doesn't blink. Real-time infrastructure monitoring with glow alerts, command palette navigation, and cinematic incident timelines.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/scope2-viewer" class="btn-primary">View Design →</a>
      <a href="https://ram.zenbin.org/scope2-mock" class="btn-ghost">Interactive Mock</a>
    </div>
    <p class="hero-sub2">RAM Design Heartbeat #20 · 6 screens · ${totalElements} elements · Dark theme</p>
    <div class="cmd-badge">
      Press <span class="cmd-key">⌘K</span> to search systems, metrics, logs…
    </div>
  </div>
</section>

<section class="screens">
  <div class="content">
    <div class="screens-label">6 SCREENS · MOBILE FIRST · DARK MODE</div>
    <div class="screens-grid">
      ${screens.map(s => `
      <div class="screen-card">
        <img src="${screenSVG(s.name, s.col)}" alt="${s.name} screen" />
        <div class="label" style="color:${s.col}">${s.name}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<div class="content">
  <div class="stats">
    <div class="stat"><div class="val" style="color:var(--acc)">99.98%</div><div class="lbl">UPTIME SLA</div></div>
    <div class="stat"><div class="val" style="color:var(--acc2)">42ms</div><div class="lbl">P95 LATENCY</div></div>
    <div class="stat"><div class="val" style="color:var(--suc)">1.2M</div><div class="lbl">REQUESTS/HR</div></div>
    <div class="stat"><div class="val" style="color:var(--warn)">${totalElements}</div><div class="lbl">DESIGN ELEMENTS</div></div>
  </div>
</div>

<section class="features">
  <div class="content">
    <h2>Built for SREs who don't sleep</h2>
    <p class="sub">Inspired by darkmodedesign.com's 2026 orange glow trend and Saaspo's command palette patterns</p>
    <div class="features-grid">
      <div class="feat">
        <div class="feat-icon" style="background:rgba(255,107,53,0.15)">🟠</div>
        <h3>Glow Alert System</h3>
        <p>Neon-bordered alert cards with ambient box-shadow bloom — #FF6B35 orange accent radiates urgency without panic.</p>
      </div>
      <div class="feat">
        <div class="feat-icon" style="background:rgba(34,211,238,0.15)">⌘</div>
        <h3>Command Palette</h3>
        <p>⌘K surfaces any service, metric, or log line instantly. Replaces deep navigation menus with conversational speed.</p>
      </div>
      <div class="feat">
        <div class="feat-icon" style="background:rgba(34,197,94,0.15)">📡</div>
        <h3>Live Log Stream</h3>
        <p>Terminal-style log viewer with severity pills and real-time LIVE indicator — your system's heartbeat made visible.</p>
      </div>
      <div class="feat">
        <div class="feat-icon" style="background:rgba(255,77,77,0.15)">🔴</div>
        <h3>Incident Timeline</h3>
        <p>Chronological event spine connecting deploys, commits, and alerts — root cause at a glance, MTTR reduced.</p>
      </div>
    </div>
  </div>
</section>

<div class="content">
  <div class="palette">
    <h3>PALETTE — CINEMATIC DARK SPACE</h3>
    <div class="swatches">
      <div class="swatch" style="background:#0B0D17"><span class="swatch-label" style="color:rgba(245,247,255,0.5)">BG</span></div>
      <div class="swatch" style="background:#111520"><span class="swatch-label" style="color:rgba(245,247,255,0.5)">SURF</span></div>
      <div class="swatch" style="background:#161B2E"><span class="swatch-label" style="color:rgba(245,247,255,0.5)">CARD</span></div>
      <div class="swatch" style="background:#FF6B35"><span class="swatch-label" style="color:#0B0D17">ACC</span></div>
      <div class="swatch" style="background:#22D3EE"><span class="swatch-label" style="color:#0B0D17">CYAN</span></div>
      <div class="swatch" style="background:#22C55E"><span class="swatch-label" style="color:#0B0D17">SUC</span></div>
      <div class="swatch" style="background:#FFB366"><span class="swatch-label" style="color:#0B0D17">WARN</span></div>
      <div class="swatch" style="background:#FF4D4D"><span class="swatch-label" style="color:#0B0D17">ERR</span></div>
    </div>
  </div>
</div>

<section class="cta-block">
  <div class="content">
    <h2>See it live</h2>
    <p>Browse the interactive Svelte mock with built-in dark/light toggle</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/scope2-mock" class="btn-primary">Interactive Mock</a>
      <a href="https://ram.zenbin.org/scope2-viewer" class="btn-ghost">Pencil Viewer</a>
    </div>
  </div>
</section>

<footer>
  <div class="content">
    <p>RAM Design Heartbeat #20 · April 2026 · <a href="https://ram.zenbin.org/">ram.zenbin.org</a></p>
  </div>
</footer>

</body>
</html>`;

async function main() {
  // Hero page
  const r1 = await publish(SLUG, heroHtml, "SCOPE — observability that doesn't blink");
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0,100) : '');

  // Viewer
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'SCOPE — Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0,100) : '');
}
main().catch(console.error);
