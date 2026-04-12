'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'pave';
const APP_NAME = 'PAVE';
const TAGLINE = 'wealth, made clear';

const BG      = '#F9F7F4';
const SURF    = '#FFFFFF';
const CARD    = '#F2EEE8';
const TEXT    = '#1A1714';
const ACC     = '#0F766E';
const ACC2    = '#C2410C';
const MUTED   = '#8C8078';
const BORDER  = '#E5DDD5';
const GREEN   = '#16A34A';

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

// Generate SVG data URIs for screen thumbnails
function svgToDataUri(svgStr) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svgStr).toString('base64');
}

const screenThumb = pen.screens.map(s => svgToDataUri(s.svg));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: ${BG};
    --surf: ${SURF};
    --card: ${CARD};
    --text: ${TEXT};
    --acc: ${ACC};
    --acc2: ${ACC2};
    --muted: ${MUTED};
    --border: ${BORDER};
    --green: ${GREEN};
  }

  html { font-size: 16px; scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 2.5rem;
    background: rgba(249,247,244,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 1.1rem; font-weight: 800; letter-spacing: 0.14em; color: var(--text); }
  .nav-links { display: flex; gap: 2rem; list-style: none; }
  .nav-links a { font-size: 0.85rem; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--acc); }
  .nav-cta {
    background: var(--acc); color: white; border: none; border-radius: 100px;
    padding: 0.5rem 1.4rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    text-decoration: none; letter-spacing: 0.02em; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    padding: 9rem 2.5rem 5rem;
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(15,118,110,0.08); border-radius: 100px;
    padding: 0.35rem 1rem; font-size: 0.75rem; font-weight: 600;
    color: var(--acc); letter-spacing: 0.06em; margin-bottom: 1.5rem;
    border: 1px solid rgba(15,118,110,0.2);
  }
  .hero-eyebrow::before { content: '◉'; font-size: 0.6rem; }
  .hero h1 {
    font-size: clamp(2.4rem, 4vw, 3.6rem);
    font-weight: 800; line-height: 1.08; letter-spacing: -0.03em;
    margin-bottom: 1.4rem; color: var(--text);
  }
  .hero h1 em { font-style: normal; color: var(--acc); }
  .hero p { font-size: 1.05rem; color: var(--muted); line-height: 1.7; margin-bottom: 2.2rem; max-width: 480px; }
  .hero-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: white; border: none; border-radius: 100px;
    padding: 0.85rem 2rem; font-size: 0.95rem; font-weight: 600; cursor: pointer;
    text-decoration: none; transition: all 0.2s; letter-spacing: 0.01em;
    box-shadow: 0 4px 20px rgba(15,118,110,0.25);
  }
  .btn-primary:hover { box-shadow: 0 6px 28px rgba(15,118,110,0.35); transform: translateY(-1px); }
  .btn-ghost {
    background: transparent; color: var(--text); border: 1.5px solid var(--border);
    border-radius: 100px; padding: 0.85rem 2rem; font-size: 0.95rem; font-weight: 500;
    cursor: pointer; text-decoration: none; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: var(--acc); color: var(--acc); }

  /* Hero stat pills */
  .hero-stats { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .stat-pill {
    display: flex; align-items: center; gap: 0.4rem;
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 100px; padding: 0.4rem 0.9rem;
    font-size: 0.8rem; color: var(--muted);
  }
  .stat-pill strong { color: var(--text); font-weight: 700; }
  .stat-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

  /* Phone mockup stack */
  .hero-visual { position: relative; display: flex; justify-content: center; align-items: flex-end; gap: -20px; }
  .phone-wrap { position: relative; }
  .phone-frame {
    width: 220px; border-radius: 36px;
    box-shadow: 0 32px 80px rgba(26,23,20,0.18), 0 8px 24px rgba(26,23,20,0.08);
    border: 2px solid rgba(255,255,255,0.8);
    overflow: hidden; display: block;
  }
  .phone-frame img { width: 100%; display: block; }
  .phone-secondary {
    position: absolute; right: -80px; top: 40px;
    width: 180px; border-radius: 32px;
    box-shadow: 0 24px 60px rgba(26,23,20,0.14);
    border: 2px solid rgba(255,255,255,0.7);
    overflow: hidden; opacity: 0.85;
    transform: rotate(4deg);
  }
  .phone-secondary img { width: 100%; display: block; }

  /* FEATURES */
  .section { padding: 5rem 2.5rem; max-width: 1200px; margin: 0 auto; }
  .section-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; color: var(--acc); text-transform: uppercase; margin-bottom: 0.75rem; }
  .section-title { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800; letter-spacing: -0.025em; margin-bottom: 1rem; line-height: 1.15; }
  .section-sub { font-size: 1rem; color: var(--muted); max-width: 540px; line-height: 1.7; margin-bottom: 3rem; }

  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
  }
  .feature-card {
    background: var(--surf); border: 1px solid var(--border); border-radius: 20px;
    padding: 1.75rem; transition: all 0.2s;
  }
  .feature-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(26,23,20,0.08); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px; margin-bottom: 1.2rem;
    display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
  }
  .feature-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
  .feature-card p { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }

  /* SCREENS */
  .screens-section { padding: 5rem 0; background: var(--card); }
  .screens-inner { max-width: 1200px; margin: 0 auto; padding: 0 2.5rem; }
  .screens-scroll {
    display: flex; gap: 1.25rem; overflow-x: auto; padding: 2rem 0 1.5rem;
    scrollbar-width: none; scroll-snap-type: x mandatory;
  }
  .screens-scroll::-webkit-scrollbar { display: none; }
  .screen-card {
    flex-shrink: 0; width: 200px; border-radius: 28px; overflow: hidden;
    box-shadow: 0 16px 48px rgba(26,23,20,0.12); scroll-snap-align: start;
    border: 1.5px solid rgba(255,255,255,0.7); transition: transform 0.2s;
  }
  .screen-card:hover { transform: scale(1.03); }
  .screen-card img { width: 100%; display: block; }
  .screen-label { text-align: center; font-size: 0.75rem; color: var(--muted); margin-top: 0.75rem; font-weight: 500; }

  /* PALETTE */
  .palette-section { padding: 4rem 2.5rem; max-width: 1200px; margin: 0 auto; }
  .palette-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
  .swatch {
    flex: 1; min-width: 80px; height: 80px; border-radius: 16px;
    display: flex; flex-direction: column; justify-content: flex-end; padding: 0.75rem;
    border: 1px solid var(--border);
  }
  .swatch-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em; }
  .swatch-hex { font-size: 0.6rem; opacity: 0.7; }

  /* CTA */
  .cta-section {
    margin: 0 2rem 4rem; border-radius: 28px;
    background: var(--text); color: white;
    padding: 4rem 3rem; text-align: center;
  }
  .cta-section h2 { font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.025em; }
  .cta-section p { font-size: 1rem; opacity: 0.65; margin-bottom: 2rem; }
  .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  .btn-white { background: white; color: var(--text); border-radius: 100px; padding: 0.85rem 2rem; font-size: 0.95rem; font-weight: 700; text-decoration: none; transition: opacity 0.2s; }
  .btn-white:hover { opacity: 0.9; }
  .btn-outline-white { background: transparent; color: white; border: 1.5px solid rgba(255,255,255,0.35); border-radius: 100px; padding: 0.85rem 2rem; font-size: 0.95rem; font-weight: 500; text-decoration: none; transition: border-color 0.2s; }
  .btn-outline-white:hover { border-color: rgba(255,255,255,0.7); }

  /* FOOTER */
  footer { text-align: center; padding: 2rem; font-size: 0.8rem; color: var(--muted); border-top: 1px solid var(--border); }
  footer a { color: var(--acc); text-decoration: none; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 3rem; padding: 8rem 1.5rem 3rem; }
    .features-grid { grid-template-columns: 1fr; }
    .phone-secondary { display: none; }
    .hero-visual { justify-content: center; }
  }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">PAVE</span>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#palette">Palette</a></li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">View Mock</a>
</nav>

<section class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">Design Heartbeat #406 · Light Theme</div>
    <h1>Wealth intelligence,<br><em>without the noise</em></h1>
    <p>PAVE brings calm clarity to personal finance. Track portfolio growth, manage goals, and catch smart insights — all in a restrained, type-forward interface.</p>

    <div class="hero-stats">
      <div class="stat-pill"><div class="dot"></div> <strong>$284,391</strong> net worth</div>
      <div class="stat-pill"><strong>+12.2%</strong> annual return</div>
      <div class="stat-pill"><strong>6</strong> screens</div>
    </div>

    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">☀◑ Interactive Mock</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-ghost">View in Pencil</a>
    </div>
  </div>

  <div class="hero-visual">
    <div class="phone-wrap">
      <div class="phone-frame">
        <img src="${screenThumb[0]}" alt="Portfolio Overview">
      </div>
    </div>
    <div class="phone-secondary">
      <img src="${screenThumb[2]}" alt="Insights">
    </div>
  </div>
</section>

<section class="section" id="features">
  <div class="section-label">Features</div>
  <h2 class="section-title">Built on restraint,<br>designed for clarity</h2>
  <p class="section-sub">Inspired by the finance-minimal aesthetic from minimal.gallery — trust through whitespace, not decoration.</p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background: rgba(15,118,110,0.1);">◈</div>
      <h3>Portfolio at a glance</h3>
      <p>Net worth, allocation breakdown, and performance sparkline on one screen. No clutter, just signal.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background: rgba(194,65,12,0.1);">◉</div>
      <h3>Smart Insights</h3>
      <p>Rebalancing alerts, dividend tracking, and tax-loss harvest opportunities surfaced before you need to look for them.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background: rgba(22,163,74,0.1);">◎</div>
      <h3>Goal Engine</h3>
      <p>Link savings targets to real positions. See exactly how much to invest monthly to hit each goal on time.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background: rgba(217,119,6,0.1);">⊞</div>
      <h3>Holdings Detail</h3>
      <p>Every position with gain/loss, allocation share, and micro progress bars. Filter by asset class in one tap.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background: rgba(140,128,120,0.1);">⌕</div>
      <h3>Transaction History</h3>
      <p>Searchable log of every buy, sell, deposit, and dividend. Clean timeline with zero visual noise.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background: rgba(15,118,110,0.1);">○</div>
      <h3>Risk Profile</h3>
      <p>Diversification score, expense ratio, savings rate — health metrics that actually mean something.</p>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-inner">
    <div class="section-label">6 Screens</div>
    <h2 class="section-title">Every view, considered</h2>
    <div class="screens-scroll">
      ${pen.screens.map((s, i) => `
      <div>
        <div class="screen-card">
          <img src="${screenThumb[i]}" alt="${s.name}">
        </div>
        <div class="screen-label">${s.name}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="palette-section" id="palette">
  <div class="section-label">Palette</div>
  <h2 class="section-title">Warm cream · Finance minimal</h2>
  <p class="section-sub">Inspired by Old Tom Capital's trust-through-restraint approach and Sparkles' warm multi-hue warmth. No purple. No gradients.</p>

  <div class="palette-grid">
    <div class="swatch" style="background: ${BG};">
      <span class="swatch-label" style="color:${TEXT};">BG</span>
      <span class="swatch-hex" style="color:${TEXT};">${BG}</span>
    </div>
    <div class="swatch" style="background: ${SURF}; border-color: ${BORDER};">
      <span class="swatch-label" style="color:${TEXT};">SURF</span>
      <span class="swatch-hex" style="color:${TEXT};">${SURF}</span>
    </div>
    <div class="swatch" style="background: ${CARD};">
      <span class="swatch-label" style="color:${TEXT};">CARD</span>
      <span class="swatch-hex" style="color:${TEXT};">${CARD}</span>
    </div>
    <div class="swatch" style="background: ${ACC};">
      <span class="swatch-label" style="color:white;">TEAL</span>
      <span class="swatch-hex" style="color:rgba(255,255,255,0.7);">${ACC}</span>
    </div>
    <div class="swatch" style="background: ${ACC2};">
      <span class="swatch-label" style="color:white;">TERRA</span>
      <span class="swatch-hex" style="color:rgba(255,255,255,0.7);">${ACC2}</span>
    </div>
    <div class="swatch" style="background: ${GREEN};">
      <span class="swatch-label" style="color:white;">GAIN</span>
      <span class="swatch-hex" style="color:rgba(255,255,255,0.7);">${GREEN}</span>
    </div>
    <div class="swatch" style="background: ${TEXT};">
      <span class="swatch-label" style="color:white;">INK</span>
      <span class="swatch-hex" style="color:rgba(255,255,255,0.7);">${TEXT}</span>
    </div>
  </div>
</section>

<section style="max-width:1200px;margin:0 auto;padding:0 2rem 4rem;">
  <div class="cta-section">
    <h2>See it alive, not static</h2>
    <p>Light/dark toggle, full navigation, realistic financial data</p>
    <div class="cta-btns">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-white">☀◑ Open Mock</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-outline-white">Pencil Viewer</a>
    </div>
  </div>
</section>

<footer>
  PAVE — Heartbeat #406 by RAM &nbsp;·&nbsp; <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
</footer>

</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status}`);
}

main().catch(console.error);
