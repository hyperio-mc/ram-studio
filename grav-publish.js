'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'grav';
const APP_NAME = 'GRAV';
const TAGLINE = 'AI Relationship Intelligence';

// Palette
const BG = '#030014';
const ACC = '#A78BFA';
const ACC2 = '#38BDF8';
const ACC3 = '#F472B6';
const TEXT = '#F1F5F9';
const MUTED = 'rgba(148,163,184,0.7)';
const CARD = '#110830';
const SUCCESS = '#34D399';

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

// Extract SVGs for carousel
const screenSVGs = pen.screens.map(s => s.svg);
const screenNames = pen.screens.map(s => s.name);

function svgToDataURI(svg) {
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

// ─── Hero HTML ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>GRAV — AI Relationship Intelligence</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #030014;
    --surf: #0A0520;
    --card: #110830;
    --card2: #150C3A;
    --acc: #A78BFA;
    --acc2: #38BDF8;
    --acc3: #F472B6;
    --text: #F1F5F9;
    --muted: rgba(148,163,184,0.7);
    --dim: rgba(148,163,184,0.4);
    --success: #34D399;
    --border: rgba(167,139,250,0.15);
  }

  html { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg); color: var(--text); scroll-behavior: smooth; }

  /* ─── Stars ─── */
  body { position: relative; overflow-x: hidden; }
  .stars { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .star { position: absolute; background: white; border-radius: 50%; animation: twinkle var(--d, 3s) ease-in-out infinite; opacity: 0; }
  @keyframes twinkle { 0%,100%{opacity:0} 50%{opacity:var(--op,0.6)} }

  /* ─── Orb glows ─── */
  .orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
  .orb-1 { width: 600px; height: 600px; background: var(--acc); opacity: 0.04; top: -200px; left: 50%; transform: translateX(-50%); }
  .orb-2 { width: 400px; height: 400px; background: var(--acc2); opacity: 0.03; bottom: 20%; right: -100px; }
  .orb-3 { width: 300px; height: 300px; background: var(--acc3); opacity: 0.03; bottom: 10%; left: -80px; }

  main { position: relative; z-index: 1; }

  /* ─── Nav ─── */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; position: sticky; top: 0;
    background: rgba(3,0,20,0.8); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border); z-index: 100;
  }
  .nav-logo { font-size: 22px; font-weight: 900; letter-spacing: -0.05em; background: linear-gradient(135deg, var(--acc), var(--acc2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--acc); color: var(--bg); font-size: 14px; font-weight: 700; padding: 10px 24px; border-radius: 100px; text-decoration: none; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.85; }

  /* ─── Hero ─── */
  .hero { text-align: center; padding: 120px 48px 80px; max-width: 900px; margin: 0 auto; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.3);
    color: var(--acc); font-size: 12px; font-weight: 600; letter-spacing: 0.08em;
    padding: 6px 16px; border-radius: 100px; margin-bottom: 32px;
  }
  .hero-badge-dot { width: 6px; height: 6px; background: var(--acc); border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  h1 {
    font-size: clamp(52px, 8vw, 96px); font-weight: 900; letter-spacing: -0.05em; line-height: 1;
    background: linear-gradient(135deg, #fff 0%, var(--acc) 50%, var(--acc2) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px;
  }
  .hero-sub { font-size: 18px; color: var(--muted); max-width: 560px; margin: 0 auto 48px; line-height: 1.6; }
  .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: var(--bg); font-size: 16px; font-weight: 700;
    padding: 16px 36px; border-radius: 100px; text-decoration: none;
    box-shadow: 0 0 40px rgba(167,139,250,0.4); transition: all 0.3s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 60px rgba(167,139,250,0.6); }
  .btn-secondary {
    background: rgba(167,139,250,0.1); color: var(--text); font-size: 16px;
    padding: 16px 36px; border-radius: 100px; text-decoration: none;
    border: 1px solid var(--border); transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: var(--acc); }

  /* ─── Score display ─── */
  .hero-score { margin-top: 60px; display: flex; justify-content: center; gap: 48px; }
  .score-item { text-align: center; }
  .score-num { font-size: 36px; font-weight: 900; letter-spacing: -0.04em; }
  .score-label { font-size: 12px; color: var(--muted); letter-spacing: 0.06em; margin-top: 4px; }

  /* ─── Screens Carousel ─── */
  .screens-section { padding: 80px 48px; max-width: 1200px; margin: 0 auto; }
  .section-label { font-size: 12px; color: var(--acc); font-weight: 600; letter-spacing: 0.12em; margin-bottom: 16px; }
  .section-title { font-size: clamp(32px, 4vw, 48px); font-weight: 800; letter-spacing: -0.04em; margin-bottom: 48px; }
  .screens-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .screen-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 24px;
    overflow: hidden; transition: transform 0.3s, box-shadow 0.3s;
  }
  .screen-card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(167,139,250,0.15); }
  .screen-img { width: 100%; display: block; }
  .screen-label { padding: 16px 20px; font-size: 13px; font-weight: 600; color: var(--muted); }

  /* ─── Bento Features ─── */
  .features-section { padding: 80px 48px; max-width: 1200px; margin: 0 auto; }
  .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .bento-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 20px;
    padding: 32px; transition: border-color 0.3s;
  }
  .bento-card:hover { border-color: rgba(167,139,250,0.4); }
  .bento-card.wide { grid-column: span 2; }
  .bento-icon { font-size: 24px; margin-bottom: 20px; }
  .bento-title { font-size: 20px; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 12px; }
  .bento-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }
  .bento-stat { font-size: 42px; font-weight: 900; letter-spacing: -0.05em; margin-top: 20px; }
  .bento-stat.violet { background: linear-gradient(135deg, var(--acc), var(--acc2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .bento-stat.sky { color: var(--acc2); }
  .bento-stat.pink { color: var(--acc3); }
  .bento-stat.green { color: var(--success); }

  /* ─── Palette ─── */
  .palette-section { padding: 80px 48px; max-width: 1200px; margin: 0 auto; }
  .palette-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .swatch { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .swatch-color { width: 80px; height: 80px; border-radius: 16px; border: 1px solid var(--border); }
  .swatch-name { font-size: 11px; color: var(--muted); text-align: center; }
  .swatch-hex { font-size: 11px; color: var(--dim); font-family: monospace; }

  /* ─── Footer ─── */
  footer {
    border-top: 1px solid var(--border); padding: 48px;
    display: flex; justify-content: space-between; align-items: center;
    max-width: 1200px; margin: 0 auto; flex-wrap: wrap; gap: 24px;
  }
  .footer-logo { font-size: 16px; font-weight: 900; letter-spacing: -0.04em; background: linear-gradient(135deg, var(--acc), var(--acc2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { color: var(--muted); text-decoration: none; font-size: 13px; }
  .footer-links a:hover { color: var(--text); }
  .footer-credit { font-size: 12px; color: var(--dim); }

  @media (max-width: 768px) {
    nav { padding: 16px 24px; }
    .hero { padding: 80px 24px 60px; }
    .screens-section, .features-section, .palette-section { padding: 60px 24px; }
    .screens-grid { grid-template-columns: 1fr 1fr; }
    .bento-grid { grid-template-columns: 1fr; }
    .bento-card.wide { grid-column: span 1; }
    footer { padding: 32px 24px; flex-direction: column; text-align: center; }
  }
</style>
</head>
<body>
<!-- Stars -->
<div class="stars" id="stars"></div>
<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<div class="orb orb-3"></div>

<main>
<nav>
  <div class="nav-logo">GRAV</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock ☀◑</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-badge">
    <div class="hero-badge-dot"></div>
    AI-Powered Network Intelligence
  </div>
  <h1>Your Network Has Gravity</h1>
  <p class="hero-sub">GRAV maps the invisible pull between you and your connections — surfacing who matters, when to reach out, and which relationships are fading.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Interactive Mock ☀◑</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">View in Pencil →</a>
  </div>
  <div class="hero-score">
    <div class="score-item">
      <div class="score-num" style="color:${ACC}">312</div>
      <div class="score-label">CONNECTIONS</div>
    </div>
    <div class="score-item">
      <div class="score-num" style="color:${ACC2}">847</div>
      <div class="score-label">GRAVITY SCORE</div>
    </div>
    <div class="score-item">
      <div class="score-num" style="color:${SUCCESS}">94%</div>
      <div class="score-label">NETWORK HEALTH</div>
    </div>
  </div>
</section>

<!-- Screens -->
<section class="screens-section" id="screens">
  <div class="section-label">6 SCREENS</div>
  <div class="section-title">Every Dimension of Your Network</div>
  <div class="screens-grid">
    ${screenSVGs.map((svg, i) => `
    <div class="screen-card">
      <img class="screen-img" src="${svgToDataURI(svg)}" alt="${screenNames[i]}" loading="lazy"/>
      <div class="screen-label">${String(i + 1).padStart(2, '0')} — ${screenNames[i]}</div>
    </div>`).join('')}
  </div>
</section>

<!-- Features Bento -->
<section class="features-section" id="features">
  <div class="section-label">FEATURES</div>
  <div class="section-title">Built on Gravitational Intelligence</div>
  <div class="bento-grid">
    <div class="bento-card wide">
      <div class="bento-icon">◎</div>
      <div class="bento-title">Gravity Score</div>
      <div class="bento-desc">A live, AI-computed score measuring the strength of each relationship — factoring in recency, mutual depth, and interaction momentum.</div>
      <div class="bento-stat violet">847</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">⬡</div>
      <div class="bento-title">Orbital Network</div>
      <div class="bento-desc">Visualize contacts as orbiting bodies — the closer the orbit, the stronger the pull.</div>
      <div class="bento-stat sky">312</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">✦</div>
      <div class="bento-title">AI Discover</div>
      <div class="bento-desc">Match-scored introductions from warm paths through your existing network.</div>
      <div class="bento-stat pink">97%</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◈</div>
      <div class="bento-title">Pulse Messages</div>
      <div class="bento-desc">AI-crafted outreach that sounds like you, sent at exactly the right moment.</div>
    </div>
    <div class="bento-card wide">
      <div class="bento-icon">◑</div>
      <div class="bento-title">Pattern Insights</div>
      <div class="bento-desc">Surface weak ties, momentum alerts, and industry shifts before they become obvious. Know your network before your competition does.</div>
      <div class="bento-stat green">Top 5%</div>
    </div>
  </div>
</section>

<!-- Palette -->
<section class="palette-section">
  <div class="section-label">PALETTE</div>
  <div class="section-title">Cosmic Dark System</div>
  <div class="palette-row">
    <div class="swatch">
      <div class="swatch-color" style="background:#030014"></div>
      <div class="swatch-name">Deep Space</div>
      <div class="swatch-hex">#030014</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#110830"></div>
      <div class="swatch-name">Card</div>
      <div class="swatch-hex">#110830</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#A78BFA"></div>
      <div class="swatch-name">Violet</div>
      <div class="swatch-hex">#A78BFA</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#38BDF8"></div>
      <div class="swatch-name">Sky</div>
      <div class="swatch-hex">#38BDF8</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#F472B6"></div>
      <div class="swatch-name">Pink</div>
      <div class="swatch-hex">#F472B6</div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#34D399"></div>
      <div class="swatch-name">Emerald</div>
      <div class="swatch-hex">#34D399</div>
    </div>
  </div>
  <p style="margin-top:32px;font-size:13px;color:var(--dim);line-height:1.6;">
    Inspired by Reflect.app's deep navy cosmic aesthetic (#030014) spotted on Godly.website —
    where AI-intelligence products use near-black backgrounds and purple-blue-magenta gradient accents
    to signal depth and precision.
  </p>
</section>

</main>

<footer>
  <div class="footer-logo">GRAV by RAM</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
  </div>
  <div class="footer-credit">RAM Design Studio · Heartbeat · ${new Date().toDateString()}</div>
</footer>

<script>
// Generate star field
const stars = document.getElementById('stars');
for (let i = 0; i < 80; i++) {
  const s = document.createElement('div');
  s.className = 'star';
  const size = Math.random() * 2 + 0.5;
  s.style.cssText = \`
    width:\${size}px; height:\${size}px;
    left:\${Math.random()*100}%;
    top:\${Math.random()*100}%;
    --d:\${2+Math.random()*4}s;
    --op:\${0.3+Math.random()*0.5};
    animation-delay:\${Math.random()*4}s;
  \`;
  stars.appendChild(s);
}
</script>
</body>
</html>`;

// ─── Viewer HTML ─────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ─── Publish ─────────────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 100) : 'OK');

  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 100) : 'OK');
}
main().catch(console.error);
