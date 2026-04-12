'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'kira';
const NAME    = 'KIRA';
const TAGLINE = 'creator intelligence, amplified';

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
const pen     = JSON.parse(penJson);

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:     '#0C1120',
  surf:   '#111827',
  card:   '#1A2035',
  acc:    '#3A82FF',
  acc2:   '#A855F7',
  acc3:   '#10B981',
  text:   '#F8FAFC',
  sub:    '#94A3B8',
};

// ── SVG screen thumbnails ─────────────────────────────────────────────────────
function screenToSvg(screen, idx) {
  const W = 390, H = 844;
  const SCALE = 0.45;
  const sw = Math.round(W * SCALE);
  const sh = Math.round(H * SCALE);
  // Mini thumbnail using palette colors
  const gradId = `g${idx}`;
  return `<svg width="${sw}" height="${sh}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradId}" cx="75%" cy="18%" r="55%">
      <stop offset="0%" stop-color="${P.acc}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${P.bg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- BG -->
  <rect width="${W}" height="${H}" fill="${P.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#${gradId})"/>
  <!-- Status bar -->
  <rect y="0" width="${W}" height="44" fill="${P.bg}"/>
  <text x="16" y="28" fill="${P.text}" font-size="13" font-weight="600" font-family="Inter,sans-serif">9:41</text>
  <!-- Header area -->
  <rect x="0" y="44" width="${W}" height="60" fill="${P.bg}"/>
  <text x="16" y="82" fill="${P.text}" font-size="22" font-weight="800" font-family="Inter,sans-serif">${screen.name}</text>
  <!-- Hero card -->
  <rect x="16" y="116" width="${W - 32}" height="100" fill="${P.card}" rx="16"/>
  <rect x="16" y="116" width="${W - 32}" height="1" fill="rgba(58,130,255,0.18)" rx="14"/>
  <text x="28" y="148" fill="${P.sub}" font-size="11" font-family="Inter,sans-serif">Overview</text>
  <text x="28" y="184" fill="${P.text}" font-size="32" font-weight="800" font-family="Inter,sans-serif">
    ${['4.28M', '247', '284K', '$12,480', '87/100', 'Maya Kim'][idx] || '—'}
  </text>
  <!-- Bento row -->
  <rect x="16"  y="232" width="179" height="90" fill="${P.card}" rx="14"/>
  <rect x="16"  y="232" width="179" height="1"  fill="rgba(58,130,255,0.18)"/>
  <rect x="203" y="232" width="171" height="90" fill="${P.card}" rx="14"/>
  <rect x="203" y="232" width="171" height="1"  fill="rgba(58,130,255,0.18)"/>
  <!-- Row items -->
  <rect x="16"  y="336" width="${W - 32}" height="58" fill="${P.card}" rx="12"/>
  <rect x="16"  y="408" width="${W - 32}" height="58" fill="${P.card}" rx="12"/>
  <rect x="16"  y="480" width="${W - 32}" height="58" fill="${P.card}" rx="12"/>
  <!-- Accent stripe bottom -->
  <rect x="0" y="${H - 72}" width="${W}" height="1" fill="rgba(58,130,255,0.2)"/>
  <rect x="0" y="${H - 72}" width="${W}" height="72" fill="${P.surf}"/>
  <!-- Nav dots -->
  ${[39, 117, 195, 273, 351].map((nx, ni) => `
    <circle cx="${nx}" cy="${H - 36}" r="${ni === idx % 5 ? 4 : 3}"
      fill="${ni === idx % 5 ? P.acc : P.sub}" opacity="${ni === idx % 5 ? 1 : 0.5}"/>
    <text x="${nx}" y="${H - 18}" text-anchor="middle" font-size="9"
      fill="${ni === idx % 5 ? P.acc : P.sub}" font-family="Inter,sans-serif"
      opacity="${ni === idx % 5 ? 1 : 0.5}">
      ${['Home','Content','Audience','Revenue','Insights'][ni]}
    </text>
  `).join('')}
  <!-- Accent glow indicators in cards -->
  <circle cx="186" cy="277" r="28" fill="${P.acc}" opacity="0.08"/>
  <text x="186" y="283" text-anchor="middle" fill="${P.acc}" font-size="11"
    font-weight="700" font-family="Inter,sans-serif">
    ${['+23%', '14.2%', '+1.2K', '42%', '4 pts', '284K'][idx] || '—'}
  </text>
  <circle cx="289" cy="277" r="28" fill="${P.acc2}" opacity="0.08"/>
  <text x="289" y="283" text-anchor="middle" fill="${P.acc2}" font-size="11"
    font-weight="700" font-family="Inter,sans-serif">
    ${['8.7%', '11.8%', '62%', '38%', '87', '247'][idx] || '—'}
  </text>
</svg>`;
}

// ── Hero page ─────────────────────────────────────────────────────────────────
const svgCards = pen.screens.map((s, i) => screenToSvg(s, i));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:    ${P.bg};
    --surf:  ${P.surf};
    --card:  ${P.card};
    --acc:   ${P.acc};
    --acc2:  ${P.acc2};
    --acc3:  ${P.acc3};
    --text:  ${P.text};
    --sub:   ${P.sub};
    --border: rgba(58,130,255,0.18);
    --glow:   rgba(58,130,255,0.12);
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }
  /* Ambient orbs */
  .orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(80px);
  }
  .orb-1 { width: 600px; height: 600px; background: rgba(58,130,255,0.08); top: -200px; right: -150px; }
  .orb-2 { width: 400px; height: 400px; background: rgba(168,85,247,0.07); bottom: 10%; left: -100px; }

  /* ── Nav ──────────────────────────────────────────────────── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px;
    background: rgba(12,17,32,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .nav-brand {
    font-size: 18px; font-weight: 900;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, var(--acc), var(--acc2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { color: var(--sub); text-decoration: none; font-size: 14px; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--acc); color: #fff;
    padding: 9px 22px; border-radius: 24px; font-size: 14px;
    font-weight: 600; text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── Hero ─────────────────────────────────────────────────── */
  .hero {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center;
    padding: 120px 24px 80px;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 20px;
    background: rgba(58,130,255,0.12); border: 1px solid var(--border);
    font-size: 12px; font-weight: 600; color: var(--acc);
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-eyebrow span { width: 6px; height: 6px; border-radius: 50%; background: var(--acc3); display: inline-block; }
  .hero-headline {
    font-size: clamp(42px, 8vw, 88px);
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1.05;
    margin-bottom: 24px;
  }
  .hero-headline .accent-blue { color: var(--acc); }
  .hero-headline .accent-purple { color: var(--acc2); }
  .hero-sub {
    max-width: 560px; font-size: 18px;
    color: var(--sub); margin-bottom: 48px;
    line-height: 1.65;
  }
  .hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: #fff;
    padding: 14px 32px; border-radius: 28px;
    font-size: 15px; font-weight: 700; text-decoration: none;
    transition: all .2s; box-shadow: 0 0 30px rgba(58,130,255,0.25);
  }
  .btn-primary:hover { box-shadow: 0 0 50px rgba(58,130,255,0.4); transform: translateY(-1px); }
  .btn-secondary {
    background: transparent; color: var(--text);
    padding: 14px 32px; border-radius: 28px;
    border: 1px solid var(--border);
    font-size: 15px; font-weight: 600; text-decoration: none;
    transition: all .2s;
  }
  .btn-secondary:hover { background: var(--card); }

  /* ── Screens carousel ────────────────────────────────────── */
  .screens-section { position: relative; z-index: 1; padding: 80px 24px; text-align: center; }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--acc); margin-bottom: 12px;
  }
  .section-title {
    font-size: clamp(28px, 5vw, 48px); font-weight: 800;
    letter-spacing: -0.03em; margin-bottom: 48px;
  }
  .screens-scroll {
    display: flex; gap: 20px; overflow-x: auto;
    padding: 16px 4px 32px; scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }
  .screen-card {
    flex: 0 0 auto; scroll-snap-align: start;
    background: var(--card); border-radius: 20px;
    border: 1px solid var(--border);
    overflow: hidden;
    transition: transform .3s, box-shadow .3s;
  }
  .screen-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 60px rgba(58,130,255,0.15);
  }
  .screen-label {
    padding: 10px 16px; font-size: 12px; font-weight: 600;
    color: var(--sub); background: var(--surf);
    border-top: 1px solid var(--border);
    text-align: center;
  }

  /* ── Features grid ───────────────────────────────────────── */
  .features-section { position: relative; z-index: 1; padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 48px; }
  .feature-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 28px;
    transition: transform .2s, box-shadow .2s;
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--acc), var(--acc2));
    opacity: 0; transition: opacity .3s;
  }
  .feature-card:hover::before { opacity: 1; }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(58,130,255,0.1); }
  .feature-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 16px;
  }
  .feature-icon.blue   { background: rgba(58,130,255,0.15); }
  .feature-icon.purple { background: rgba(168,85,247,0.15); }
  .feature-icon.green  { background: rgba(16,185,129,0.15); }
  .feature-icon.amber  { background: rgba(245,158,11,0.15); }
  .feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
  .feature-card p  { font-size: 14px; color: var(--sub); line-height: 1.6; }

  /* ── Palette swatches ────────────────────────────────────── */
  .palette-section {
    position: relative; z-index: 1;
    padding: 60px 24px; max-width: 900px; margin: 0 auto; text-align: center;
  }
  .swatches { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 32px; }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .swatch-dot { width: 52px; height: 52px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); }
  .swatch-hex { font-size: 11px; color: var(--sub); font-family: monospace; }
  .swatch-name { font-size: 11px; color: var(--text); font-weight: 600; }

  /* ── Stats band ──────────────────────────────────────────── */
  .stats-band {
    position: relative; z-index: 1;
    background: var(--surf); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 40px 24px;
    display: flex; gap: 32px; justify-content: center; flex-wrap: wrap;
    text-align: center;
  }
  .stat-item h3 { font-size: 32px; font-weight: 900; margin-bottom: 4px; }
  .stat-item .blue   { color: var(--acc); }
  .stat-item .purple { color: var(--acc2); }
  .stat-item .green  { color: var(--acc3); }
  .stat-item p  { font-size: 13px; color: var(--sub); }

  /* ── Footer ──────────────────────────────────────────────── */
  footer {
    position: relative; z-index: 1;
    padding: 32px 24px; text-align: center;
    border-top: 1px solid var(--border);
    font-size: 13px; color: var(--sub);
  }
  footer a { color: var(--acc); text-decoration: none; }
  footer .brand { color: var(--text); font-weight: 700; font-size: 15px; display: block; margin-bottom: 8px; }

  @media (max-width: 600px) {
    .nav-links { display: none; }
    .hero-headline { font-size: 40px; }
  }
</style>
</head>
<body>

<div class="orb orb-1"></div>
<div class="orb orb-2"></div>

<nav>
  <div class="nav-brand">✦ KIRA</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-viewer">Open in Viewer</a>
</nav>

<section class="hero">
  <div class="hero-eyebrow"><span></span> Heartbeat #18 · Dark Theme · Apr 2026</div>
  <h1 class="hero-headline">
    <span class="accent-blue">Creator</span><br>
    <span class="accent-purple">Intelligence</span>,<br>
    Amplified
  </h1>
  <p class="hero-sub">
    KIRA unifies your analytics across every platform — views, subscribers, revenue,
    and AI-powered insights — in one space-dark dashboard built for serious creators.
  </p>
  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">View in Pencil ↗</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="stats-band">
  <div class="stat-item"><h3 class="blue">6</h3><p>Screens designed</p></div>
  <div class="stat-item"><h3 class="purple">565</h3><p>Design elements</p></div>
  <div class="stat-item"><h3 class="green">4</h3><p>Data modules</p></div>
  <div class="stat-item"><h3 class="blue">#0C1120</h3><p>Deep navy void</p></div>
</div>

<section class="screens-section" id="screens">
  <div class="section-label">6 Screens</div>
  <h2 class="section-title">Every creator touchpoint</h2>
  <div class="screens-scroll">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      ${svgCards[i]}
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features-section" id="features">
  <div class="section-label" style="text-align:center">Design Decisions</div>
  <h2 class="section-title" style="text-align:center">Why KIRA looks like this</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon blue">🌌</div>
      <h3>Deep Navy Space Palette</h3>
      <p>Inspired by QASE on darkmodedesign.com — a #0C1120 deep navy void with electric blue #3A82FF accent creates a "space-like" atmosphere that signals premium data intelligence without the generic SaaS dark look.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon purple">⬛</div>
      <h3>Bento Grid Metrics</h3>
      <p>Dashboard uses an asymmetric 2-column tile grid inspired by Land-Book's SaaS feature section trend — each metric card is a self-contained information unit with its own sparkline or progress bar, scannable at a glance.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon green">✦</div>
      <h3>Glassmorphism Cards (Second Wave)</h3>
      <p>Each card has a 1px border at rgba(58,130,255,0.18) and a top-edge highlight at rgba(255,255,255,0.08) — Godly's observation about subtle glassmorphism working better on dark grounds than light, with no harsh blur.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon amber">💡</div>
      <h3>Ambient Glow Orbs</h3>
      <p>Layered radial gradient circles simulate light sources behind key content areas — an interaction pattern from Dark Mode Design's featured sites (Vapi, Darkroom) that adds depth without heavy shadows.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon blue">📊</div>
      <h3>Real UI Over Abstract Art</h3>
      <p>Every screen shows actual creator metrics — real numbers, real growth charts, real platform data. Countering the Land-Book trend of real product screenshots replacing abstract 3D illustrations in SaaS design.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon purple">🎨</div>
      <h3>Three-Accent System</h3>
      <p>Electric blue #3A82FF (primary), purple #A855F7 (secondary), emerald #10B981 (positive signals) — a triple accent system inspired by Awwwards SOTD nominees who use distinct accent colors to code different information types.</p>
    </div>
  </div>
</section>

<section class="palette-section" id="palette">
  <div class="section-label">Colour System</div>
  <h2 class="section-title">Deep navy space</h2>
  <div class="swatches">
    <div class="swatch"><div class="swatch-dot" style="background:#0C1120"></div><div class="swatch-hex">#0C1120</div><div class="swatch-name">Void</div></div>
    <div class="swatch"><div class="swatch-dot" style="background:#111827"></div><div class="swatch-hex">#111827</div><div class="swatch-name">Surface</div></div>
    <div class="swatch"><div class="swatch-dot" style="background:#1A2035"></div><div class="swatch-hex">#1A2035</div><div class="swatch-name">Card</div></div>
    <div class="swatch"><div class="swatch-dot" style="background:#3A82FF"></div><div class="swatch-hex">#3A82FF</div><div class="swatch-name">Electric</div></div>
    <div class="swatch"><div class="swatch-dot" style="background:#A855F7"></div><div class="swatch-hex">#A855F7</div><div class="swatch-name">Pulse</div></div>
    <div class="swatch"><div class="swatch-dot" style="background:#10B981"></div><div class="swatch-hex">#10B981</div><div class="swatch-name">Signal</div></div>
    <div class="swatch"><div class="swatch-dot" style="background:#F43F5E"></div><div class="swatch-hex">#F43F5E</div><div class="swatch-name">Alert</div></div>
    <div class="swatch"><div class="swatch-dot" style="background:#94A3B8"></div><div class="swatch-hex">#94A3B8</div><div class="swatch-name">Subtle</div></div>
  </div>
</section>

<footer>
  <div class="brand">✦ KIRA</div>
  Designed by <strong>RAM</strong> · Heartbeat #18 · 9 Apr 2026<br>
  <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a> &nbsp;·&nbsp;
  <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a> &nbsp;·&nbsp;
  Inspired by <a href="https://www.darkmodedesign.com" target="_blank">Dark Mode Design</a> + <a href="https://land-book.com" target="_blank">Land-Book</a>
</footer>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero page…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status}  https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}  https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
