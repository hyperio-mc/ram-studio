'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG    = 'petal';
const NAME    = 'Petal';
const TAGLINE = 'Your daily wellness garden';

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
const screens = pen.screens;

// ── Build screen SVG previews ─────────────────────────────────────────────────
const screenPreviews = screens.map((s, i) => {
  const svgEncoded = Buffer.from(s.svg).toString('base64');
  return `
  <div class="screen-card" onclick="showScreen(${i})">
    <div class="screen-frame">
      <img src="data:image/svg+xml;base64,${svgEncoded}" alt="${s.name}" />
    </div>
    <div class="screen-label">${s.name}</div>
  </div>`;
}).join('');

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:     #FAF7F4;
    --surf:   #FFFFFF;
    --card:   #F2EDE8;
    --text:   #1C1917;
    --text2:  #57534E;
    --text3:  #A8A29E;
    --acc:    #5B8A6B;
    --acc2:   #C4873C;
    --acc3:   #9B7EC8;
    --divid:  #E5DDD8;
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(250,247,244,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--divid);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 60px;
  }
  .nav-logo { font-weight: 800; font-size: 18px; letter-spacing: -0.5px; color: var(--acc); display: flex; align-items: center; gap: 8px; }
  .nav-logo span { color: var(--text); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 14px; color: var(--text2); text-decoration: none; font-weight: 500; }
  .nav-links a:hover { color: var(--acc); }
  .nav-cta {
    background: var(--acc); color: #fff;
    padding: 8px 20px; border-radius: 100px; font-size: 13px; font-weight: 600;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    padding: 120px 48px 80px;
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--acc) + '15'; background-color: rgba(91,138,107,0.1);
    color: var(--acc); padding: 6px 14px; border-radius: 100px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero h1 {
    font-size: 64px; font-weight: 900; line-height: 1.05;
    letter-spacing: -2px; color: var(--text);
    margin-bottom: 20px;
  }
  .hero h1 em { font-style: normal; color: var(--acc); }
  .hero p {
    font-size: 18px; line-height: 1.65; color: var(--text2);
    margin-bottom: 36px; max-width: 440px;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; }
  .btn-primary {
    background: var(--acc); color: #fff;
    padding: 14px 28px; border-radius: 100px; font-size: 15px; font-weight: 700;
    text-decoration: none; transition: all 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(91,138,107,0.35); }
  .btn-secondary {
    color: var(--text2); font-size: 14px; font-weight: 500;
    text-decoration: none; display: flex; align-items: center; gap: 6px;
  }
  .hero-social { margin-top: 48px; display: flex; align-items: center; gap: 16px; }
  .hero-social-text { font-size: 13px; color: var(--text3); }
  .hero-avatars { display: flex; }
  .hero-avatar {
    width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--bg);
    margin-left: -8px; background: var(--acc); display: flex; align-items: center; justify-content: center;
    font-size: 14px; first-of-type { margin-left: 0 };
  }

  /* PHONE MOCKUP */
  .hero-phone {
    display: flex; justify-content: center; align-items: center; position: relative;
  }
  .phone-shell {
    width: 280px; height: 580px;
    background: #fff; border-radius: 40px;
    box-shadow: 0 40px 120px rgba(28,25,23,0.15), 0 0 0 1px var(--divid);
    overflow: hidden; position: relative;
  }
  .phone-shell img { width: 100%; height: 100%; object-fit: cover; }
  .phone-notch {
    position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
    width: 80px; height: 22px; background: #1C1917; border-radius: 20px; z-index: 10;
  }
  .phone-float {
    position: absolute; background: #fff; border-radius: 16px;
    box-shadow: 0 8px 32px rgba(28,25,23,0.12);
    padding: 12px 16px; font-size: 12px; font-weight: 600;
  }
  .phone-float-1 { top: 80px; right: -30px; color: var(--acc); }
  .phone-float-2 { bottom: 100px; left: -30px; color: var(--acc2); }

  /* SECTION BASE */
  section { padding: 80px 48px; max-width: 1200px; margin: 0 auto; }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--acc); margin-bottom: 16px;
  }
  .section-title { font-size: 40px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
  .section-sub { font-size: 16px; color: var(--text2); max-width: 480px; }

  /* SCREENS CAROUSEL */
  .screens-section { padding: 0 48px 80px; max-width: 1200px; margin: 0 auto; }
  .screens-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
    margin-top: 48px;
  }
  .screen-card {
    cursor: pointer; transition: transform 0.2s;
  }
  .screen-card:hover { transform: translateY(-6px); }
  .screen-frame {
    border-radius: 28px; overflow: hidden;
    box-shadow: 0 8px 40px rgba(28,25,23,0.1);
    border: 1px solid var(--divid);
    background: #fff;
  }
  .screen-frame img { width: 100%; display: block; }
  .screen-label {
    text-align: center; margin-top: 12px;
    font-size: 13px; font-weight: 600; color: var(--text2);
  }

  /* FEATURES / BENTO */
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    margin-top: 48px;
  }
  .feature-card {
    background: var(--surf); border-radius: 24px; padding: 28px;
    border: 1px solid var(--divid); transition: box-shadow 0.2s;
  }
  .feature-card:hover { box-shadow: 0 8px 32px rgba(28,25,23,0.08); }
  .feature-card.wide { grid-column: span 2; }
  .feature-icon { font-size: 32px; margin-bottom: 16px; }
  .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .feature-card p { font-size: 14px; color: var(--text2); line-height: 1.55; }
  .feature-accent { color: var(--acc); }

  /* PALETTE SWATCHES */
  .palette-row { display: flex; gap: 16px; margin-top: 32px; }
  .swatch {
    flex: 1; height: 80px; border-radius: 16px;
    display: flex; align-items: flex-end; padding: 10px 14px;
    font-size: 11px; font-weight: 700;
  }

  /* STATS */
  .stats-row {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 48px;
  }
  .stat-card {
    background: var(--surf); border-radius: 20px; padding: 24px;
    border: 1px solid var(--divid); text-align: center;
  }
  .stat-value { font-size: 40px; font-weight: 900; color: var(--acc); letter-spacing: -1px; }
  .stat-label { font-size: 13px; color: var(--text2); margin-top: 4px; }

  /* CTA */
  .cta-section {
    background: var(--acc); border-radius: 32px; padding: 72px 48px;
    text-align: center; max-width: 1104px; margin: 0 auto 80px;
  }
  .cta-section h2 { font-size: 46px; font-weight: 900; color: #fff; letter-spacing: -1.5px; margin-bottom: 16px; }
  .cta-section p { font-size: 18px; color: rgba(255,255,255,0.8); margin-bottom: 36px; }
  .btn-white {
    background: #fff; color: var(--acc);
    padding: 14px 32px; border-radius: 100px; font-size: 15px; font-weight: 700;
    text-decoration: none; display: inline-block; transition: all 0.2s;
  }
  .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--divid); padding: 32px 48px;
    display: flex; justify-content: space-between; align-items: center;
    max-width: 1200px; margin: 0 auto;
  }
  footer .logo { font-weight: 800; color: var(--acc); font-size: 16px; }
  footer p { font-size: 13px; color: var(--text3); }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; gap: 48px; }
    .hero h1 { font-size: 44px; }
    .screens-grid { grid-template-columns: repeat(2, 1fr); padding: 0 24px; }
    .features-grid { grid-template-columns: 1fr; }
    .feature-card.wide { grid-column: span 1; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 0 24px; }
    .nav-links { display: none; }
    section { padding: 60px 24px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">❀ <span>Petal</span></div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock →</a>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">🌿 RAM Design Heartbeat #415</div>
    <h1>Wellness as a<br><em>daily garden.</em></h1>
    <p>Petal is a calm, bento-grid micro-habit tracker designed for gentle consistency — not obsessive streaks. Inspired by nature-first design trends and Minimal Gallery's whitespace philosophy.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View Prototype →</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive mock ☀◑</a>
    </div>
    <div class="hero-social">
      <div class="hero-avatars">
        <div class="hero-avatar">🌱</div>
        <div class="hero-avatar">🌸</div>
        <div class="hero-avatar">🍃</div>
        <div class="hero-avatar">✦</div>
      </div>
      <div class="hero-social-text">Inspired by lapa.ninja earthy palettes · bento grid patterns</div>
    </div>
  </div>
  <div class="hero-phone">
    <div class="phone-shell">
      <div class="phone-notch"></div>
      <img src="data:image/svg+xml;base64,${Buffer.from(screens[0].svg).toString('base64')}" alt="Petal dashboard" />
    </div>
    <div class="phone-float phone-float-1">🔥 14-day streak</div>
    <div class="phone-float phone-float-2">89% this week</div>
  </div>
</div>

<!-- SCREENS -->
<div class="screens-section" id="screens">
  <div class="section-label">All 6 Screens</div>
  <div class="section-title">Every ritual, beautifully tracked</div>
  <div class="screens-grid">
    ${screenPreviews}
  </div>
</div>

<!-- FEATURES -->
<section id="features">
  <div class="section-label">Design Decisions</div>
  <div class="section-title">Built around calm</div>
  <div class="section-sub">Three principles shaped every screen: warmth over clinical precision, bento structure over endless lists, typography over decoration.</div>
  <div class="features-grid">
    <div class="feature-card wide">
      <div class="feature-icon">▦</div>
      <h3>Bento grid dashboard</h3>
      <p>Inspired by lapa.ninja's "bento grid" landing page category — the dashboard uses asymmetric card sizing to give each habit its own visual weight. Water gets a large card because it's the most-neglected habit; sleep gets a compact card because it's passive. The layout encodes priority.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🌿</div>
      <h3>Earthy palette</h3>
      <p>Sage green, warm amber, and soft violet over warm cream — a direct lift from lapa.ninja's "Pastel" and "Natural" category trends. No cold tech-blue here.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <h3>Typography-first headers</h3>
      <p>34px bold headings with generous line height carry each screen. Inspired by Minimal Gallery's ethos: typography is the layout, not a layer on top of it.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <h3>Calm anti-overload</h3>
      <p>Dashboard surfaces only 4 habits at a glance. All-habit view is one tap away. Borrowed from Land-book's Linear-inspired "calm dashboard" pattern.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◑</div>
      <h3>Light / Dark mock</h3>
      <p>The interactive mock includes both light (warm cream) and dark mode so you can see how the earthy palette holds up across themes.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📊</div>
      <h3>Heatmap streaks</h3>
      <p>A 4-week calendar heatmap shows consistency at a glance — inspired by GitHub's contribution graph but warmed up with sage-green intensity fills.</p>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section id="palette">
  <div class="section-label">Palette</div>
  <div class="section-title">Warm, earthy, alive</div>
  <div class="palette-row">
    <div class="swatch" style="background:#FAF7F4;border:1px solid #E5DDD8;color:#A8A29E">#FAF7F4 Cream</div>
    <div class="swatch" style="background:#5B8A6B;color:rgba(255,255,255,0.85)">#5B8A6B Sage</div>
    <div class="swatch" style="background:#C4873C;color:rgba(255,255,255,0.85)">#C4873C Amber</div>
    <div class="swatch" style="background:#9B7EC8;color:rgba(255,255,255,0.85)">#9B7EC8 Violet</div>
    <div class="swatch" style="background:#1C1917;color:rgba(255,255,255,0.6)">#1C1917 Ink</div>
  </div>
</section>

<!-- STATS -->
<section>
  <div class="section-label">Design Stats</div>
  <div class="section-title">By the numbers</div>
  <div class="stats-row">
    <div class="stat-card"><div class="stat-value">6</div><div class="stat-label">Screens</div></div>
    <div class="stat-card"><div class="stat-value">${pen.metadata.elements}</div><div class="stat-label">Elements</div></div>
    <div class="stat-card"><div class="stat-value">5</div><div class="stat-label">Color tokens</div></div>
    <div class="stat-card"><div class="stat-value">415</div><div class="stat-label">Heartbeat #</div></div>
  </div>
</section>

<!-- CTA -->
<div style="padding: 0 48px;">
  <div class="cta-section">
    <h2>Tend your daily garden 🌿</h2>
    <p>Explore every screen in the Pencil.dev viewer or try the interactive Svelte mock with light/dark toggle.</p>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-white">Open Interactive Mock →</a>
  </div>
</div>

<footer>
  <div class="logo">❀ Petal</div>
  <p>RAM Design Heartbeat #415 · ram.zenbin.org/${SLUG}</p>
  <p style="color:var(--text3);font-size:12px;">Viewer → ram.zenbin.org/${SLUG}-viewer</p>
</footer>

<script>
function showScreen(i) {
  window.open('https://ram.zenbin.org/${SLUG}-viewer', '_blank');
}
</script>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? 'OK' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? 'OK' : r2.body.slice(0, 120)}`);
}
main().catch(console.error);
