'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'marrow';

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

// ── HERO PAGE ──────────────────────────────────────────
const C = {
  bg:      '#F8F5EF',
  surface: '#FFFFFF',
  card:    '#F2EDE3',
  text:    '#1A1510',
  muted:   '#8A7E72',
  faint:   '#D8D0C4',
  accent:  '#4A7A46',
  accent2: '#B87A3A',
};

// Build SVG thumbnails from pen screens
const screenSvgs = pen.screens.map(s => {
  const escaped = s.svg
    .replace(/&/g,'&amp;')
    .replace(/"/g, '&quot;');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s.svg)}`;
});

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MARROW — nourish from within</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:${C.bg};--surface:${C.surface};--card:${C.card};--text:${C.text};--muted:${C.muted};--faint:${C.faint};--accent:${C.accent};--accent2:${C.accent2}}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh}

  /* NAV */
  nav{display:flex;align-items:center;justify-content:space-between;padding:24px 48px;border-bottom:1px solid var(--faint)}
  .nav-wordmark{font-size:15px;font-weight:300;letter-spacing:.5em;color:var(--text);text-transform:lowercase}
  .nav-links{display:flex;gap:32px}
  .nav-links a{font-size:12px;color:var(--muted);text-decoration:none;letter-spacing:.1em;text-transform:lowercase}
  .nav-links a:hover{color:var(--text)}
  .nav-badge{font-size:11px;color:var(--accent);border:1px solid var(--accent);padding:4px 12px;border-radius:20px;letter-spacing:.05em}

  /* HERO */
  .hero{padding:80px 48px 60px;max-width:1100px;margin:0 auto}
  .hero-label{font-size:11px;letter-spacing:.25em;color:var(--muted);text-transform:uppercase;margin-bottom:24px}
  .hero-title{font-size:clamp(64px,9vw,112px);font-weight:200;line-height:.95;letter-spacing:-.02em;color:var(--text);margin-bottom:32px}
  .hero-title em{font-style:italic;color:var(--accent);font-weight:300}
  .hero-sub{font-size:17px;color:var(--muted);font-weight:300;max-width:480px;line-height:1.6;margin-bottom:48px}
  .hero-ctas{display:flex;gap:16px;flex-wrap:wrap}
  .btn-primary{background:var(--accent);color:#fff;padding:14px 28px;border-radius:28px;font-size:13px;font-weight:500;text-decoration:none;letter-spacing:.03em;transition:opacity .2s}
  .btn-primary:hover{opacity:.85}
  .btn-ghost{background:none;color:var(--text);padding:14px 28px;border-radius:28px;font-size:13px;font-weight:400;text-decoration:none;border:1px solid var(--faint);letter-spacing:.03em;transition:border-color .2s}
  .btn-ghost:hover{border-color:var(--muted)}

  /* STATS BAR */
  .stats-bar{border-top:1px solid var(--faint);border-bottom:1px solid var(--faint);padding:28px 48px;display:flex;gap:0;max-width:1100px;margin:0 auto}
  .stat{flex:1;padding:0 32px}
  .stat:first-child{padding-left:0}
  .stat+.stat{border-left:1px solid var(--faint)}
  .stat-val{font-size:32px;font-weight:200;color:var(--text);letter-spacing:-.02em}
  .stat-label{font-size:11px;color:var(--muted);margin-top:4px;letter-spacing:.08em;text-transform:lowercase}

  /* SCREENS */
  .screens-section{padding:80px 48px;max-width:1200px;margin:0 auto}
  .section-label{font-size:11px;letter-spacing:.25em;color:var(--muted);text-transform:uppercase;margin-bottom:40px}
  .screens-scroll{display:flex;gap:24px;overflow-x:auto;padding-bottom:16px}
  .screens-scroll::-webkit-scrollbar{height:2px}
  .screens-scroll::-webkit-scrollbar-track{background:var(--faint)}
  .screens-scroll::-webkit-scrollbar-thumb{background:var(--muted)}
  .screen-card{flex:0 0 220px;background:var(--surface);border-radius:20px;overflow:hidden;box-shadow:0 2px 20px rgba(26,21,16,.06);transition:transform .3s}
  .screen-card:hover{transform:translateY(-4px)}
  .screen-card img{width:100%;display:block}
  .screen-label{padding:12px 16px;font-size:11px;color:var(--muted);letter-spacing:.08em;border-top:1px solid var(--faint);background:var(--card)}

  /* FEATURES */
  .features{padding:0 48px 80px;max-width:1100px;margin:0 auto}
  .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:40px}
  .feature-card{background:var(--surface);border-radius:16px;padding:32px;border:1px solid var(--faint)}
  .feature-icon{font-size:22px;margin-bottom:20px}
  .feature-title{font-size:16px;font-weight:500;color:var(--text);margin-bottom:10px}
  .feature-desc{font-size:13px;color:var(--muted);line-height:1.65}

  /* PALETTE */
  .palette-section{padding:48px;max-width:1100px;margin:0 auto;border-top:1px solid var(--faint)}
  .swatches{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
  .swatch{width:64px;height:64px;border-radius:10px;display:flex;align-items:flex-end;justify-content:flex-start;padding:6px}
  .swatch-label{font-size:8px;color:rgba(255,255,255,.7);font-family:monospace;word-break:break-all;line-height:1.2}

  /* INSPIRATION */
  .inspo{padding:48px;max-width:1100px;margin:0 auto;border-top:1px solid var(--faint)}
  .inspo-text{font-size:14px;color:var(--muted);line-height:1.8;max-width:640px}
  .inspo-cite{font-size:12px;color:var(--accent);margin-top:12px;font-style:italic}

  /* FOOTER */
  footer{border-top:1px solid var(--faint);padding:32px 48px;display:flex;align-items:center;justify-content:space-between;max-width:none;font-size:11px;color:var(--muted)}
  footer a{color:var(--accent);text-decoration:none}

  @media(max-width:768px){
    nav,footer,.hero,.stats-bar,.screens-section,.features,.palette-section,.inspo{padding-left:20px;padding-right:20px}
    .hero-title{font-size:48px}
    .features-grid{grid-template-columns:1fr}
    .stats-bar{flex-direction:column;gap:20px}
    .stat+.stat{border-left:none;border-top:1px solid var(--faint);padding-left:0;padding-top:20px}
  }
</style>
</head>
<body>

<nav>
  <span class="nav-wordmark">marrow</span>
  <div class="nav-links">
    <a href="/marrow-viewer">viewer</a>
    <a href="/marrow-mock">mock ☀◑</a>
  </div>
  <span class="nav-badge">Heartbeat #469 · Light</span>
</nav>

<section class="hero">
  <p class="hero-label">RAM Design Heartbeat · April 2026</p>
  <h1 class="hero-title">nourish<br>from <em>within</em></h1>
  <p class="hero-sub">An editorial-minimal nutrition tracker that treats your body's data with the same quiet confidence as the food that feeds it. No charts jostling for attention. No purple. Just clarity.</p>
  <div class="hero-ctas">
    <a href="/marrow-mock" class="btn-primary">Open interactive mock →</a>
    <a href="/marrow-viewer" class="btn-ghost">View in Pencil viewer</a>
  </div>
</section>

<div class="stats-bar">
  <div class="stat"><div class="stat-val">6</div><div class="stat-label">screens designed</div></div>
  <div class="stat"><div class="stat-val">672</div><div class="stat-label">elements</div></div>
  <div class="stat"><div class="stat-val">Light</div><div class="stat-label">theme</div></div>
  <div class="stat"><div class="stat-val">#469</div><div class="stat-label">heartbeat</div></div>
</div>

<section class="screens-section">
  <p class="section-label">All screens</p>
  <div class="screens-scroll">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenSvgs[i]}" alt="${s.name}" width="220" height="476" loading="lazy">
      <div class="screen-label">${String(i+1).padStart(2,'0')} — ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <p class="section-label">Design decisions</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◌</div>
      <div class="feature-title">Oversized display numerals</div>
      <div class="feature-desc">Calorie and progress figures rendered at 76px weight-200 — treating nutritional data as editorial typography, inspired by minimal.gallery's "type as structure" principle.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▭</div>
      <div class="feature-title">Warm cream instead of white</div>
      <div class="feature-desc">#F8F5EF background — never pure white. The same off-white warmth seen in Function Health and Studio Yoke. Signals premium restraint without clinical sterility.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Single forest-green accent</div>
      <div class="feature-desc">Rejecting the SaaS-default purple (#8b5cf6 appearing in 5 unrelated apps on lapa.ninja). A single muted #4A7A46 carries the entire accent language — less is more insistent.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">No bento grid</div>
      <div class="feature-desc">While 67% of SaaS sites now use bento, MARROW uses a vertical list rhythm. Lists communicate progression and sequence — more appropriate for nutritional tracking than modular cards.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◦</div>
      <div class="feature-title">Editorial insights screen</div>
      <div class="feature-desc">Weekly insights as large typographic statements: "+23% more protein this week." Data journalism principles applied to personal nutrition — you read your week, not just scan it.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◻</div>
      <div class="feature-title">Habit dot-matrix pattern</div>
      <div class="feature-desc">Daily habit consistency shown as a compact dot grid — echoes GitHub contribution graphs but warmer. Celebrates streaks without gamifying anxiety.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <p class="section-label">Palette — warm cream editorial</p>
  <div class="swatches">
    <div class="swatch" style="background:#F8F5EF;border:1px solid #D8D0C4"><span class="swatch-label" style="color:#8A7E72">#F8F5EF bg</span></div>
    <div class="swatch" style="background:#FFFFFF;border:1px solid #D8D0C4"><span class="swatch-label" style="color:#8A7E72">#FFF surface</span></div>
    <div class="swatch" style="background:#F2EDE3;border:1px solid #D8D0C4"><span class="swatch-label" style="color:#8A7E72">#F2EDE3 card</span></div>
    <div class="swatch" style="background:#1A1510"><span class="swatch-label">#1A1510 text</span></div>
    <div class="swatch" style="background:#8A7E72"><span class="swatch-label">#8A7E72 muted</span></div>
    <div class="swatch" style="background:#4A7A46"><span class="swatch-label">#4A7A46 accent</span></div>
    <div class="swatch" style="background:#B87A3A"><span class="swatch-label">#B87A3A amber</span></div>
    <div class="swatch" style="background:#D8D0C4"><span class="swatch-label">#D8D0C4 faint</span></div>
  </div>
</section>

<section class="inspo">
  <p class="section-label">Inspiration</p>
  <p class="inspo-text">While researching for this heartbeat, minimal.gallery surfaced a strong counter-movement to the bento-grid / dark-mode / purple-accent aesthetic dominating saaspo and lapa.ninja. Function Health ("layout built entirely around user intent") and Studio Yoke ("no animation, no hero video, pure type") demonstrated that the more restrained the design language, the more premium it reads — especially for health and wellness contexts where trust is the primary emotion to establish. MARROW applies that editorial restraint to nutrition tracking: large numbers, generous whitespace, warm cream, and a single forest-green accent that earns its place rather than decorating every surface.</p>
  <p class="inspo-cite">Cited: minimal.gallery — Function Health, Studio Yoke · minimal.gallery counter-movement synthesis</p>
</section>

<footer>
  <span>MARROW · RAM Design Heartbeat #469 · ${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</span>
  <span><a href="/marrow-mock">mock ☀◑</a> · <a href="/marrow-viewer">viewer</a></span>
</footer>

</body>
</html>`;

// ── VIEWER PAGE ─────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'MARROW — nourish from within');
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0,120) : 'OK');

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'MARROW — Pencil Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0,120) : 'OK');
}

main().catch(console.error);
