'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'chalk';
const APP_NAME = 'CHALK';
const TAGLINE = 'Think in long form';

// ─── Palette ───────────────────────────────────────────────────────────────
const BG   = '#FAF8F4';
const ACC  = '#C0522E';
const TEXT = '#1C1A18';
const SURF = '#FFFFFF';
const CARD = '#F5F1EB';
const ACCLT = '#F0E2DC';

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

// Extract screen SVGs for the hero carousel
const screens = pen.screens || [];

function svgToDataUri(svg) {
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

// ─── Hero HTML ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  :root {
    --bg: ${BG};
    --surf: ${SURF};
    --card: ${CARD};
    --text: ${TEXT};
    --text2: #6B6560;
    --acc: ${ACC};
    --acclt: ${ACCLT};
    --border: rgba(28,26,24,0.08);
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Georgia','Times New Roman',serif; min-height:100vh; }

  /* NAV */
  nav {
    position:fixed; top:0; left:0; right:0; z-index:100;
    background:rgba(250,248,244,0.92); backdrop-filter:blur(16px);
    border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 40px; height:60px;
  }
  .nav-logo { font-size:18px; font-weight:700; letter-spacing:4px; font-family:system-ui,sans-serif; }
  .nav-links { display:flex; gap:32px; font-family:system-ui,sans-serif; font-size:14px; color:var(--text2); }
  .nav-links a { color:inherit; text-decoration:none; }
  .nav-cta {
    background:var(--acc); color:#fff; padding:8px 22px; border-radius:24px;
    font-family:system-ui,sans-serif; font-size:13px; font-weight:600;
    text-decoration:none; letter-spacing:0.3px;
  }

  /* HERO */
  .hero {
    padding: 120px 40px 80px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .hero-eyebrow {
    display:inline-block; background:var(--acclt); color:var(--acc);
    padding:4px 14px; border-radius:4px; font-size:11px; font-weight:600;
    letter-spacing:1.5px; font-family:system-ui,sans-serif;
    margin-bottom:24px; text-transform:uppercase;
  }
  .hero h1 {
    font-size:clamp(36px,4vw,58px); font-weight:400; line-height:1.15;
    letter-spacing:-0.5px; margin-bottom:24px;
  }
  .hero h1 em { font-style:italic; color:var(--acc); }
  .hero-sub {
    font-family:system-ui,sans-serif; font-size:17px; line-height:1.7;
    color:var(--text2); margin-bottom:36px; max-width:420px;
  }
  .hero-actions { display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
  .btn-primary {
    background:var(--acc); color:#fff; padding:14px 30px; border-radius:32px;
    text-decoration:none; font-family:system-ui,sans-serif; font-size:15px; font-weight:600;
  }
  .btn-secondary {
    color:var(--acc); font-family:system-ui,sans-serif; font-size:14px; text-decoration:none;
    display:flex; align-items:center; gap:6px;
  }

  /* Phone mockup */
  .phone-container { display:flex; justify-content:center; align-items:center; }
  .phone {
    width:260px; height:562px; border-radius:40px;
    border:8px solid ${TEXT};
    box-shadow:0 40px 80px rgba(28,26,24,0.15), 0 8px 20px rgba(28,26,24,0.08);
    overflow:hidden; position:relative; background:var(--bg);
    cursor:pointer;
  }
  .phone-notch {
    position:absolute; top:0; left:50%; transform:translateX(-50%);
    width:100px; height:24px; background:${TEXT}; border-radius:0 0 16px 16px; z-index:10;
  }
  .phone-screen {
    width:100%; height:100%; object-fit:cover; object-position:top;
    transition: opacity 0.4s ease;
  }
  .screen-dots {
    display:flex; gap:6px; justify-content:center; margin-top:16px;
  }
  .screen-dot {
    width:7px; height:7px; border-radius:50%; background:var(--border); cursor:pointer;
    transition:background 0.3s;
  }
  .screen-dot.active { background:var(--acc); }

  /* FEATURE SECTION */
  .section { padding:80px 40px; max-width:1100px; margin:0 auto; }
  .section-eyebrow {
    font-family:system-ui,sans-serif; font-size:11px; font-weight:600;
    letter-spacing:2px; color:var(--acc); text-transform:uppercase; margin-bottom:16px;
  }
  .section h2 { font-size:clamp(28px,3vw,44px); font-weight:400; margin-bottom:16px; line-height:1.2; }
  .section-sub { font-family:system-ui,sans-serif; color:var(--text2); font-size:16px; line-height:1.7; max-width:540px; margin-bottom:48px; }

  /* BENTO GRID */
  .bento { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .bento-card {
    background:var(--surf); border-radius:16px; padding:28px;
    border:1px solid var(--border);
  }
  .bento-card.accent { background:var(--acc); color:#fff; }
  .bento-card.cream { background:var(--card); }
  .bento-card.span2 { grid-column:span 2; }
  .bento-icon { font-size:28px; margin-bottom:16px; }
  .bento-card h3 { font-size:20px; font-weight:400; margin-bottom:10px; }
  .bento-card.accent h3 { color:#fff; }
  .bento-card p { font-family:system-ui,sans-serif; font-size:14px; color:var(--text2); line-height:1.7; }
  .bento-card.accent p { color:rgba(255,255,255,0.75); }
  .bento-stat { font-size:40px; font-weight:400; color:var(--acc); margin-bottom:4px; }
  .bento-card.accent .bento-stat { color:#fff; }

  /* PALETTE */
  .palette-row { display:flex; gap:12px; flex-wrap:wrap; margin-top:32px; }
  .swatch { width:56px; height:56px; border-radius:12px; position:relative; }
  .swatch-label { font-family:system-ui,sans-serif; font-size:11px; color:var(--text2); margin-top:6px; text-align:center; }

  /* SCREENS STRIP */
  .screens-strip { display:flex; gap:16px; overflow-x:auto; padding:8px 0; margin-top:16px; scrollbar-width:none; }
  .screens-strip::-webkit-scrollbar { display:none; }
  .strip-screen {
    flex-shrink:0; width:130px; height:280px; border-radius:18px;
    border:3px solid var(--border); overflow:hidden;
    box-shadow:0 4px 12px rgba(28,26,24,0.08);
  }
  .strip-screen img { width:100%; height:100%; object-fit:cover; object-position:top; }
  .strip-label { font-family:system-ui,sans-serif; font-size:11px; color:var(--text2); text-align:center; margin-top:8px; }

  /* FOOTER */
  footer {
    background:${TEXT}; color:#fff;
    padding:60px 40px; text-align:center;
  }
  footer .logo { font-size:24px; font-weight:700; letter-spacing:4px; font-family:system-ui,sans-serif; margin-bottom:12px; }
  footer p { font-family:system-ui,sans-serif; font-size:14px; color:rgba(255,255,255,0.5); margin-bottom:32px; }
  footer .footer-links { display:flex; gap:24px; justify-content:center; flex-wrap:wrap; }
  footer a { color:rgba(255,255,255,0.6); text-decoration:none; font-family:system-ui,sans-serif; font-size:13px; }
  footer a.highlight { color:var(--acc); font-weight:600; }

  @media (max-width:768px) {
    .hero { grid-template-columns:1fr; }
    .phone-container { order:-1; }
    .bento { grid-template-columns:1fr; }
    .bento-card.span2 { grid-column:auto; }
    nav { padding:0 20px; }
    nav .nav-links { display:none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">CHALK</div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Library</a>
    <a href="#">Explore</a>
    <a href="#">Pricing</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/chalk-mock">Try Mock</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-eyebrow">Editorial Knowledge App</div>
    <h1>Read. Think.<br><em>Remember.</em></h1>
    <p class="hero-sub">
      CHALK is the knowledge app for deep thinkers — an editorial reading and writing space designed around the rhythm of long-form thought.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/chalk-viewer">View Design</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/chalk-mock">Interactive Mock →</a>
    </div>
  </div>
  <div class="phone-container">
    <div>
      <div class="phone" id="mainPhone">
        <div class="phone-notch"></div>
        <img id="phoneScreen" class="phone-screen" src="${svgToDataUri(screens[0]?.svg || '')}" alt="CHALK Library Screen"/>
      </div>
      <div class="screen-dots" id="screenDots">
        ${screens.map((s, i) => `<div class="screen-dot ${i === 0 ? 'active' : ''}" onclick="changeScreen(${i})" title="${s.name}"></div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="section" style="border-top:1px solid var(--border)">
  <div class="section-eyebrow">What makes CHALK different</div>
  <h2>Designed for the<br>long-form mind</h2>
  <p class="section-sub">Most apps optimize for speed and scanning. CHALK is built for depth — unhurried reading, margin notes, and the slow accretion of understanding.</p>

  <div class="bento">
    <div class="bento-card span2">
      <div class="bento-icon">✦</div>
      <h3>Editorial Typography First</h3>
      <p>Inspired by <em>minimal.gallery</em>'s Kinfolk-effect design trend: generous line heights, editorial serifs, and the discipline of a single accent color — terracotta — used only where it matters. Every screen slows you down on purpose.</p>
    </div>
    <div class="bento-card cream">
      <div class="bento-stat">14</div>
      <h3>Day Streak</h3>
      <p>Reading habits tracked, not just pages.</p>
    </div>
    <div class="bento-card cream">
      <div class="bento-icon">○</div>
      <h3>Bento Explore</h3>
      <p>Inspired by <em>lapa.ninja</em>'s bento grid trend — curated threads arranged in an asymmetric card grid.</p>
    </div>
    <div class="bento-card accent span2">
      <div class="bento-stat">4.2 hrs</div>
      <h3>Average weekly reading</h3>
      <p>Insights that reflect how your mind actually moves — by topic, depth, and recall.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon">⌘</div>
      <h3>Smart Connections</h3>
      <p>Ideas seeded from your own library surface while you write — not from an algorithm.</p>
    </div>
  </div>
</section>

<section class="section" style="border-top:1px solid var(--border)">
  <div class="section-eyebrow">All 6 screens</div>
  <h2>The full design</h2>
  <p class="section-sub">6 screens exploring a reading-first editorial aesthetic — light, deliberate, and typographically driven.</p>
  <div class="screens-strip">
    ${screens.map((s, i) => `
    <div>
      <div class="strip-screen" onclick="changeScreen(${i})">
        <img src="${svgToDataUri(s.svg)}" alt="${s.name}"/>
      </div>
      <div class="strip-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="section" style="border-top:1px solid var(--border)">
  <div class="section-eyebrow">Design palette</div>
  <h2>Warm minimal</h2>
  <p class="section-sub">A single accent color rule — terracotta, used sparingly — with warm cream grounds and editorial serif typography. Directly inspired by minimal.gallery's "one accent color" formula.</p>
  <div class="palette-row">
    ${[
      { color: BG,       name: 'Cream BG' },
      { color: SURF,     name: 'Surface' },
      { color: CARD,     name: 'Card' },
      { color: ACCLT,    name: 'Tint' },
      { color: ACC,      name: 'Terracotta' },
      { color: '#6B6560', name: 'Muted' },
      { color: TEXT,     name: 'Ink' },
    ].map(s => `
      <div>
        <div class="swatch" style="background:${s.color}; border:1px solid rgba(28,26,24,0.1)"></div>
        <div class="swatch-label">${s.name}</div>
      </div>`).join('')}
  </div>
</section>

<footer>
  <div class="logo">CHALK</div>
  <p>${TAGLINE} — RAM Design Heartbeat · April 2026</p>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/chalk-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/chalk-mock" class="highlight">☀◑ Interactive Mock</a>
    <a href="#">Inspired by minimal.gallery</a>
  </div>
</footer>

<script>
const screens = ${JSON.stringify(screens.map(s => ({ name: s.name, src: svgToDataUri(s.svg) })))};
let current = 0;
let timer;

function changeScreen(i) {
  current = i;
  document.getElementById('phoneScreen').src = screens[i].src;
  document.querySelectorAll('.screen-dot').forEach((d,j) => {
    d.classList.toggle('active', j === i);
  });
}

function autoAdvance() {
  current = (current + 1) % screens.length;
  changeScreen(current);
}

timer = setInterval(autoAdvance, 3000);
document.getElementById('mainPhone').addEventListener('click', () => {
  clearInterval(timer);
  current = (current + 1) % screens.length;
  changeScreen(current);
  timer = setInterval(autoAdvance, 3000);
});
</script>
</body>
</html>`;

// ─── Viewer HTML ───────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 120)}`);
}

main().catch(console.error);
