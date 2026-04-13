'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'solv';
const APP_NAME = 'SOLV';
const TAGLINE = 'Know when you\'ll get paid';

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

// ── Extract SVGs as data URIs for carousel
const screenImgs = pen.screens.map(s => {
  const b64 = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
});

// ── Palette
const C = {
  bg: '#0D0B13', s1: '#141121', s2: '#1C1829',
  acc: '#A78BFA', acc2: '#22D3EE', acc3: '#F472B6', acc4: '#34D399',
  text: '#EDE9FE', sub: '#A89FC5', warn: '#FBBF24',
};

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${C.bg};--s1:${C.s1};--s2:${C.s2};
    --acc:${C.acc};--acc2:${C.acc2};--acc3:${C.acc3};--acc4:${C.acc4};
    --text:${C.text};--sub:${C.sub};--warn:${C.warn};
  }
  html{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;scroll-behavior:smooth}
  body{min-height:100vh;overflow-x:hidden}

  /* ── Ambient background orbs */
  .orb{position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0}
  .orb1{width:600px;height:600px;background:rgba(167,139,250,0.08);top:-200px;right:-200px}
  .orb2{width:500px;height:500px;background:rgba(34,211,238,0.06);bottom:-150px;left:-150px}
  .orb3{width:400px;height:400px;background:rgba(244,114,182,0.04);top:40%;left:30%}

  .wrap{max-width:1100px;margin:0 auto;padding:0 24px;position:relative;z-index:1}

  /* ── Nav */
  nav{padding:24px 0;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(167,139,250,0.1)}
  .logo{font-size:22px;font-weight:800;background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .nav-links{display:flex;gap:32px;align-items:center}
  .nav-links a{color:var(--sub);text-decoration:none;font-size:14px;transition:color 0.2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--acc);color:#0D0B13;padding:10px 22px;border-radius:20px;font-weight:700;font-size:14px;text-decoration:none;transition:opacity 0.2s}
  .nav-cta:hover{opacity:0.85}

  /* ── Hero */
  .hero{padding:100px 0 80px;text-align:center}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.25);border-radius:20px;padding:6px 16px;margin-bottom:32px;font-size:13px;color:var(--acc)}
  .hero-badge .dot{width:6px;height:6px;background:var(--acc4);border-radius:50%}
  h1{font-size:clamp(42px,6vw,80px);font-weight:800;line-height:1.05;letter-spacing:-2px;margin-bottom:24px}
  h1 .grad{background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .hero-sub{font-size:20px;color:var(--sub);max-width:520px;margin:0 auto 40px;line-height:1.6;font-weight:300}
  .hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:80px}
  .btn-primary{background:var(--acc);color:#0D0B13;padding:16px 36px;border-radius:50px;font-weight:700;font-size:16px;text-decoration:none;transition:all 0.2s;box-shadow:0 0 32px rgba(167,139,250,0.3)}
  .btn-primary:hover{transform:scale(1.03);box-shadow:0 0 48px rgba(167,139,250,0.5)}
  .btn-secondary{border:1px solid rgba(167,139,250,0.3);color:var(--text);padding:16px 36px;border-radius:50px;font-weight:600;font-size:16px;text-decoration:none;transition:all 0.2s}
  .btn-secondary:hover{border-color:var(--acc);color:var(--acc)}

  /* ── Screen carousel */
  .carousel{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 0 24px;scrollbar-width:none;justify-content:center}
  .carousel::-webkit-scrollbar{display:none}
  .screen-card{flex:0 0 220px;scroll-snap-align:start;background:var(--s2);border-radius:24px;overflow:hidden;border:1px solid rgba(167,139,250,0.1);transition:transform 0.2s,box-shadow 0.2s}
  .screen-card:hover{transform:translateY(-6px) scale(1.02);box-shadow:0 16px 48px rgba(167,139,250,0.2)}
  .screen-card img{width:100%;display:block}
  .screen-label{padding:12px 16px;font-size:12px;font-weight:600;color:var(--sub);text-transform:uppercase;letter-spacing:0.8px}

  /* ── Stats strip */
  .stats-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(167,139,250,0.1);border-radius:16px;overflow:hidden;margin:80px 0}
  .stat-cell{background:var(--s1);padding:28px 24px;text-align:center}
  .stat-val{font-size:32px;font-weight:800;background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:block}
  .stat-lbl{font-size:13px;color:var(--sub);margin-top:6px}

  /* ── Features */
  .features{padding:80px 0}
  .section-label{font-size:12px;font-weight:700;letter-spacing:1.5px;color:var(--acc);text-transform:uppercase;margin-bottom:16px;text-align:center}
  h2{font-size:clamp(28px,4vw,48px);font-weight:800;text-align:center;margin-bottom:12px;letter-spacing:-1px}
  .section-sub{font-size:17px;color:var(--sub);text-align:center;margin-bottom:60px;font-weight:300}
  .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
  .feature-card{background:var(--s2);border:1px solid rgba(167,139,250,0.1);border-radius:20px;padding:32px;transition:border-color 0.2s,transform 0.2s}
  .feature-card:hover{border-color:rgba(167,139,250,0.35);transform:translateY(-4px)}
  .feature-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px}
  .feature-card h3{font-size:18px;font-weight:700;margin-bottom:10px}
  .feature-card p{font-size:14px;color:var(--sub);line-height:1.7}

  /* ── Palette swatches */
  .palette-section{padding:60px 0}
  .swatch-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:32px}
  .swatch{width:72px;height:72px;border-radius:16px;position:relative}
  .swatch-info{position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);font-size:10px;color:var(--sub);white-space:nowrap;font-family:monospace}

  /* ── Links */
  .links-section{padding:60px 0;text-align:center}
  .links-grid{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:32px}
  .link-card{background:var(--s2);border:1px solid rgba(167,139,250,0.15);border-radius:16px;padding:20px 32px;text-decoration:none;color:var(--text);transition:all 0.2s;display:flex;align-items:center;gap:12px}
  .link-card:hover{border-color:var(--acc);box-shadow:0 0 24px rgba(167,139,250,0.15)}
  .link-icon{font-size:20px}
  .link-text{font-weight:600;font-size:15px}
  .link-sub{font-size:12px;color:var(--sub)}

  /* ── Footer */
  footer{border-top:1px solid rgba(167,139,250,0.1);padding:40px 0;text-align:center;color:var(--sub);font-size:13px}
  footer a{color:var(--acc);text-decoration:none}
</style>
</head>
<body>

<div class="orb orb1"></div>
<div class="orb orb2"></div>
<div class="orb orb3"></div>

<!-- Nav -->
<nav class="wrap">
  <span class="logo">SOLV</span>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">View Design</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Live Mock ☀◑</a>
  </div>
</nav>

<!-- Hero -->
<section class="hero wrap">
  <div class="hero-badge"><span class="dot"></span> RAM Design Heartbeat #507</div>
  <h1>Know exactly<br><span class="grad">when you'll get paid</span></h1>
  <p class="hero-sub">SOLV gives freelancers a real-time cash flow intelligence layer — payment risk scoring, runway forecasting, and proactive alerts before things go wrong.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">☀◑ Explore Mock</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">View in Pencil.dev</a>
  </div>

  <!-- Screen carousel -->
  <div class="carousel">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenImgs[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- Stats -->
<section class="wrap">
  <div class="stats-strip">
    <div class="stat-cell"><span class="stat-val">6</span><span class="stat-lbl">Screens</span></div>
    <div class="stat-cell"><span class="stat-val">532</span><span class="stat-lbl">Elements</span></div>
    <div class="stat-cell"><span class="stat-val">Dark</span><span class="stat-lbl">Theme</span></div>
    <div class="stat-cell"><span class="stat-val">#507</span><span class="stat-lbl">Heartbeat</span></div>
  </div>
</section>

<!-- Features -->
<section class="features wrap" id="features">
  <p class="section-label">What SOLV does</p>
  <h2>Financial clarity, not<br>spreadsheet chaos</h2>
  <p class="section-sub">Inspired by trust-first design patterns from Land-book and elevation-based dark UI from DarkModeDesign.com</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(167,139,250,0.12)">📊</div>
      <h3>Cash Runway</h3>
      <p>See exactly how many days of cash you have left at your current burn rate. No guesswork — just clarity.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(34,211,238,0.12)">⚡</div>
      <h3>Payment Risk Scoring</h3>
      <p>Every invoice and client gets a real-time risk score based on payment history, days outstanding, and behavior patterns.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(52,211,153,0.12)">📈</div>
      <h3>30/60/90 Forecast</h3>
      <p>See your projected cash position across rolling time windows. What-if scenarios show how late payments impact your runway.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(244,114,182,0.12)">🔔</div>
      <h3>Proactive Alerts</h3>
      <p>Get notified before invoices go overdue — not after. Smart nudges with one-tap reminder sending.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(251,191,36,0.12)">⭐</div>
      <h3>Client Reliability</h3>
      <p>Each client gets a payment reliability score based on your history together. Know who pays on time before you sign.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(167,139,250,0.12)">🔗</div>
      <h3>Stripe Integration</h3>
      <p>Connect Stripe for automatic invoice sync and real-time payment detection. No manual entry required.</p>
    </div>
  </div>
</section>

<!-- Palette -->
<section class="palette-section wrap">
  <p class="section-label">Design System</p>
  <h2>Elevation-based dark palette</h2>
  <p class="section-sub">Inspired by DarkModeDesign.com — four surface levels, soft lavender accent, warm near-black base</p>
  <div class="swatch-row">
    ${[
      { c: C.bg, name: 'BG' },
      { c: C.s1, name: 'Surface' },
      { c: C.s2, name: 'Card' },
      { c: C.acc, name: 'Lavender' },
      { c: C.acc2, name: 'Cyan' },
      { c: C.acc3, name: 'Pink' },
      { c: C.acc4, name: 'Emerald' },
      { c: C.warn, name: 'Amber' },
    ].map(s => `<div style="position:relative;padding-bottom:36px">
      <div class="swatch" style="background:${s.c};border:1px solid rgba(255,255,255,0.08)"></div>
      <div style="font-size:10px;color:${C.sub};text-align:center;margin-top:8px;font-family:monospace">${s.c}<br>${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- Links -->
<section class="links-section wrap">
  <p class="section-label">Explore</p>
  <h2>View the full design</h2>
  <div class="links-grid">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-card">
      <span class="link-icon">☀◑</span>
      <div><div class="link-text">Interactive Mock</div><div class="link-sub">Svelte 5 · light/dark toggle</div></div>
    </a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-card">
      <span class="link-icon">◈</span>
      <div><div class="link-text">Pencil.dev Viewer</div><div class="link-sub">All 6 screens</div></div>
    </a>
  </div>
</section>

<footer class="wrap">
  <p>SOLV — Heartbeat #507 · <a href="https://ram.zenbin.org">RAM Design</a> · April 2026</p>
  <p style="margin-top:8px">Inspired by <a href="https://www.darkmodedesign.com">DarkModeDesign.com</a> elevation patterns and <a href="https://land-book.com">Land-book</a> trust-first UI</p>
</footer>

</body>
</html>`;

// ── Build viewer page with embedded pen
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero page...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
