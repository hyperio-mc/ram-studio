'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'siren';
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);
const meta = pen.meta;

// ── publish helper ─────────────────────────────────────────────────────────────
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

// ── palette ───────────────────────────────────────────────────────────────────
const P = meta.palette;

// ── build SVG data URIs for carousel ─────────────────────────────────────────
const screenPreviews = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return { name: s.name, dataUri: `data:image/svg+xml;base64,${encoded}` };
});

// ── hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SIREN — real-time API incident intelligence</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#0C0C0F; --surf:#131317; --card:#1B1B21;
    --acc:#F59E0B; --acc2:#06B6D4; --green:#10B981;
    --red:#EF4444; --orange:#F97316;
    --text:#F0EFE8; --muted:rgba(240,239,232,0.45);
    --border:rgba(240,239,232,0.08);
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

  /* nav */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:64px;background:rgba(12,12,15,0.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
  .brand{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:18px;letter-spacing:.08em;color:var(--acc)}
  .brand span{color:var(--muted);font-weight:400}
  nav a{color:var(--muted);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
  nav a:hover{color:var(--text)}
  .nav-badge{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.06em;border:1px solid rgba(245,158,11,.35);background:rgba(245,158,11,.10);color:var(--acc);padding:3px 8px;border-radius:4px}

  /* hero */
  .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:100px 24px 60px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(245,158,11,.10) 0%,transparent 70%);pointer-events:none}
  .hero-label{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--acc);background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);border-radius:6px;padding:6px 14px;margin-bottom:32px}
  .hero-label::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--acc);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  h1{font-size:clamp(52px,8vw,96px);font-weight:700;line-height:1;letter-spacing:-.02em;margin-bottom:24px}
  h1 .mono{font-family:'JetBrains Mono',monospace;color:var(--acc);letter-spacing:.04em}
  .tagline{font-size:18px;color:var(--muted);max-width:520px;margin:0 auto 48px;line-height:1.6}
  .hero-cta{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  .btn-pri{background:var(--acc);color:#0C0C0F;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:.02em;transition:opacity .2s}
  .btn-pri:hover{opacity:.88}
  .btn-sec{border:1px solid var(--border);color:var(--text);font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:500;background:var(--card);transition:border-color .2s}
  .btn-sec:hover{border-color:rgba(240,239,232,.25)}

  /* terminal ticker */
  .ticker{margin-top:64px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted);display:flex;gap:32px;justify-content:center;flex-wrap:wrap}
  .ticker-item{display:flex;align-items:center;gap:8px}
  .tick-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
  .ok{background:var(--green)}.warn{background:var(--orange)}.err{background:var(--red)}

  /* screens carousel */
  .screens-section{padding:60px 0 80px}
  .screens-track{display:flex;gap:20px;padding:20px 40px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .screens-track::-webkit-scrollbar{display:none}
  .screen-card{flex-shrink:0;width:260px;background:var(--card);border:1px solid var(--border);border-radius:18px;overflow:hidden;transition:transform .3s,box-shadow .3s}
  .screen-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.5)}
  .screen-card img{width:100%;display:block}
  .screen-name{padding:12px 16px;font-size:12px;color:var(--muted);font-family:'JetBrains Mono',monospace;letter-spacing:.04em}

  /* features bento */
  section{max-width:1000px;margin:0 auto;padding:60px 24px}
  h2{font-size:clamp(28px,5vw,42px);font-weight:700;margin-bottom:48px;text-align:center}
  h2 .acc{color:var(--acc)}
  .bento{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .bento-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px}
  .bento-card.wide{grid-column:span 2}
  .bento-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:20px}
  .bento-card h3{font-size:16px;font-weight:600;margin-bottom:8px}
  .bento-card p{font-size:14px;color:var(--muted);line-height:1.6}
  .bento-metric{font-family:'JetBrains Mono',monospace;font-size:36px;font-weight:700;color:var(--acc);margin:12px 0 4px}
  .bento-sub{font-size:12px;color:var(--muted)}

  /* palette */
  .palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px;justify-content:center}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
  .swatch-block{width:56px;height:56px;border-radius:12px;border:1px solid var(--border)}
  .swatch-name{font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;text-align:center}

  /* footer */
  footer{border-top:1px solid var(--border);padding:40px 24px;text-align:center;color:var(--muted);font-size:13px}
  footer a{color:var(--acc);text-decoration:none}
</style>
</head>
<body>
<nav>
  <div class="brand">SIREN <span>/ HB-${meta.heartbeat}</span></div>
  <div style="display:flex;gap:24px;align-items:center">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive →</a>
    <span class="nav-badge">DARK</span>
  </div>
</nav>

<div class="hero">
  <div>
    <div class="hero-label">● Heartbeat #${meta.heartbeat} · RAM Design</div>
    <h1><span class="mono">SIREN</span></h1>
    <p class="tagline">Real-time API incident intelligence — know before your users do. Bento-grid command centre for infrastructure SREs.</p>
    <div class="hero-cta">
      <a class="btn-pri" href="https://ram.zenbin.org/${SLUG}-mock">Try Interactive Mock ☀◑</a>
      <a class="btn-sec" href="https://ram.zenbin.org/${SLUG}-viewer">View Prototype</a>
    </div>
    <div class="ticker">
      <div class="ticker-item"><span class="tick-dot ok"></span>/api/auth · 48ms · 99.99%</div>
      <div class="ticker-item"><span class="tick-dot warn"></span>/api/orders · 312ms · degraded</div>
      <div class="ticker-item"><span class="tick-dot err"></span>/api/search · TIMEOUT · INC-2847</div>
      <div class="ticker-item"><span class="tick-dot ok"></span>/api/users · 61ms · 99.97%</div>
    </div>
  </div>
</div>

<div class="screens-section">
  <div class="screens-track">
    ${screenPreviews.map(s => `
    <div class="screen-card">
      <img src="${s.dataUri}" alt="${s.name}" loading="lazy"/>
      <div class="screen-name">${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</div>

<section>
  <h2>Built on <span class="acc">current trends</span></h2>
  <div class="bento">
    <div class="bento-card">
      <div class="bento-icon" style="background:rgba(245,158,11,.12)">⚡</div>
      <div class="bento-metric">99.97%</div>
      <div class="bento-sub">Uptime tracked live</div>
      <h3 style="margin-top:12px">Bento 2.0 Layout</h3>
      <p>Dashboard cards inspired by Saaspo.com's bento grid trend — exaggerated corner radii, elevation layers, mixed-scale tiles.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon" style="background:rgba(6,182,212,.12)">▬</div>
      <h3>JetBrains Mono as Brand</h3>
      <p>From Godly.website: monospaced fonts used as identity, not just code blocks. Every label, badge, and status chip speaks terminal.</p>
    </div>
    <div class="bento-card wide">
      <div class="bento-icon" style="background:rgba(239,68,68,.12)">◉</div>
      <h3>Elevation-Based Dark Mode</h3>
      <p>From DarkModeDesign.com: depth through subtle surface lifts (#0C0C0F → #131317 → #1B1B21), not heavy shadows. Soft amber glows replace generic purple gradients. Amber accent (#F59E0B) deliberately sidesteps the overused indigo-500 AI template.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon" style="background:rgba(16,185,129,.12)">⬡</div>
      <h3>6 Screens</h3>
      <p>Dashboard → Alerts → Endpoint Health → Incident Timeline → Team On-Call → Config</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon" style="background:rgba(245,158,11,.12)">◈</div>
      <div class="bento-metric">${meta.totalElements}</div>
      <div class="bento-sub">total elements</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon" style="background:rgba(6,182,212,.12)">∿</div>
      <h3>Sparkline Latency</h3>
      <p>Real-time P99 chart with SLA threshold overlay — data density without cognitive overload.</p>
    </div>
  </div>
</section>

<section>
  <h2>The <span class="acc">palette</span></h2>
  <p style="text-align:center;color:var(--muted);margin-bottom:32px">Charcoal + Neon Amber — the "durable" dark combo. No purple. No mesh gradients.</p>
  <div class="palette-row">
    ${[
      { hex: P.bg, name: 'Void' },
      { hex: P.surface, name: 'Surface' },
      { hex: P.card, name: 'Card' },
      { hex: P.accent, name: 'Amber' },
      { hex: P.accent2, name: 'Cyan' },
      { hex: P.green, name: 'Healthy' },
      { hex: P.red, name: 'Critical' },
      { hex: P.orange, name: 'Warning' },
    ].map(sw => `
    <div class="swatch">
      <div class="swatch-block" style="background:${sw.hex}"></div>
      <div class="swatch-name">${sw.name}<br/>${sw.hex}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <p>RAM Design Heartbeat #${meta.heartbeat} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  <p style="margin-top:8px">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> ·
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </p>
</footer>
</body>
</html>`;

// ── viewer ─────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ── publish ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'SIREN — real-time API incident intelligence');
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'SIREN — Viewer');
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
