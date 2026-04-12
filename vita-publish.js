'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'vita';
const NAME = 'VITA';
const TAGLINE = 'Daily longevity, made ritual';

// Palette
const C = {
  bg: '#FAF7F2', surf: '#FFFFFF', card: '#F0EDE8',
  text: '#1C1917', sub: '#78716C', muted: '#A8A29E',
  accent: '#5A7A5A', accent2: '#B87350', gold: '#C9973E',
  divider: '#E8E4DE',
};

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

// Extract SVG screens for display
const screens = pen.screens;

// Build SVG data URIs
function svgToDataUri(svgStr) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svgStr).toString('base64');
}

const screenDataUris = screens.map(s => svgToDataUri(s.svg));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: ${C.bg};
    --surf: ${C.surf};
    --card: ${C.card};
    --text: ${C.text};
    --sub: ${C.sub};
    --muted: ${C.muted};
    --accent: ${C.accent};
    --accent2: ${C.accent2};
    --gold: ${C.gold};
    --divider: ${C.divider};
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: system-ui, -apple-system, 'Helvetica Neue', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(250, 247, 242, 0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--divider);
  }
  .nav-logo {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 20px; font-weight: 300; letter-spacing: 0.12em;
    color: var(--text);
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { text-decoration: none; color: var(--sub); font-size: 13px; letter-spacing: 0.04em; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: white;
    border: none; border-radius: 20px; padding: 8px 20px;
    font-size: 13px; font-weight: 500; cursor: pointer; letter-spacing: 0.02em;
    text-decoration: none;
  }

  /* HERO */
  .hero {
    min-height: 100vh; padding-top: 64px;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; gap: 60px;
    max-width: 1160px; margin: 0 auto; padding-left: 40px; padding-right: 40px;
  }

  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(90, 122, 90, 0.08); border: 1px solid rgba(90,122,90,0.2);
    border-radius: 20px; padding: 5px 14px;
    font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
    color: var(--accent); text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

  .hero-headline {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(42px, 5vw, 64px);
    font-weight: 300; line-height: 1.12;
    letter-spacing: -0.02em; color: var(--text);
    margin-bottom: 20px;
  }
  .hero-headline em { font-style: italic; color: var(--accent); }

  .hero-sub {
    font-size: 16px; color: var(--sub); line-height: 1.7;
    max-width: 440px; margin-bottom: 36px;
  }

  .hero-actions { display: flex; align-items: center; gap: 16px; margin-bottom: 48px; }
  .btn-primary {
    background: var(--accent); color: white;
    border: none; border-radius: 24px; padding: 13px 28px;
    font-size: 14px; font-weight: 500; cursor: pointer; letter-spacing: 0.02em;
    text-decoration: none; display: inline-block;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(90,122,90,0.25); }
  .btn-secondary {
    color: var(--sub); font-size: 14px; text-decoration: none;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-secondary:hover { color: var(--text); }

  .hero-proof {
    display: flex; align-items: center; gap: 16px;
    font-size: 12px; color: var(--muted);
  }
  .hero-proof-avatars { display: flex; }
  .hero-proof-avatars span {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2px solid var(--bg);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; margin-left: -6px;
    font-family: Georgia, serif;
  }
  .hero-proof-avatars span:first-child { margin-left: 0; }
  .av1 { background: #D4EDD4; color: var(--accent); }
  .av2 { background: #EDD4C8; color: var(--accent2); }
  .av3 { background: #EDE8D4; color: var(--gold); }
  .av4 { background: #D4E4ED; color: #5870A8; }

  /* Phone mockup */
  .hero-visual { display: flex; justify-content: center; position: relative; }
  .phone-shell {
    width: 260px; height: auto;
    background: var(--surf);
    border-radius: 36px;
    box-shadow: 0 32px 80px rgba(28,25,23,0.12), 0 0 0 1px var(--divider);
    overflow: hidden;
    position: relative;
  }
  .phone-shell img { width: 100%; display: block; }
  .phone-notch {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 100px; height: 28px; background: var(--text);
    border-radius: 0 0 16px 16px; z-index: 10;
  }

  /* Float cards */
  .float-card {
    position: absolute;
    background: var(--surf);
    border-radius: 16px;
    padding: 12px 16px;
    box-shadow: 0 8px 32px rgba(28,25,23,0.10);
    border: 1px solid var(--divider);
    font-size: 12px;
  }
  .float-card-1 { left: -60px; top: 120px; }
  .float-card-2 { right: -50px; bottom: 160px; }
  .float-score { font-size: 26px; font-weight: 700; color: var(--accent); font-family: Georgia, serif; }
  .float-label { color: var(--sub); margin-top: 2px; }
  .float-streak { display: flex; align-items: center; gap: 6px; }
  .float-streak-num { font-size: 22px; font-weight: 700; color: var(--gold); font-family: Georgia, serif; }
  .float-streak-icon { font-size: 18px; }

  /* SCREEN CAROUSEL */
  .screens-section {
    background: var(--surf);
    padding: 96px 0;
    border-top: 1px solid var(--divider);
    border-bottom: 1px solid var(--divider);
    overflow: hidden;
  }
  .screens-header {
    text-align: center; max-width: 480px;
    margin: 0 auto 56px;
    padding: 0 40px;
  }
  .section-eyebrow {
    font-size: 11px; letter-spacing: 0.1em; color: var(--accent);
    text-transform: uppercase; font-weight: 500; margin-bottom: 12px;
  }
  .section-title {
    font-family: Georgia, serif; font-size: 36px; font-weight: 300;
    line-height: 1.2; color: var(--text); margin-bottom: 12px;
  }
  .section-sub { font-size: 15px; color: var(--sub); }

  .screens-track {
    display: flex; gap: 24px; padding: 0 60px;
    overflow-x: auto; scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .screens-track::-webkit-scrollbar { display: none; }
  .screen-card {
    flex-shrink: 0; scroll-snap-align: start;
    width: 200px;
    background: var(--card);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(28,25,23,0.08);
    border: 1px solid var(--divider);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .screen-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(28,25,23,0.12);
  }
  .screen-card img { width: 100%; display: block; }
  .screen-card-label {
    text-align: center; padding: 10px 0 14px;
    font-size: 11px; letter-spacing: 0.06em;
    color: var(--sub); text-transform: uppercase; font-weight: 500;
  }

  /* FEATURES */
  .features-section {
    padding: 96px 40px;
    max-width: 1160px; margin: 0 auto;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    background: var(--divider);
    border-radius: 20px; overflow: hidden;
    border: 1px solid var(--divider);
  }
  .feature-item {
    background: var(--surf);
    padding: 32px 28px;
    transition: background 0.2s;
  }
  .feature-item:hover { background: var(--bg); }
  .feature-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 16px;
  }
  .feature-name { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--sub); line-height: 1.6; }

  /* PALETTE */
  .palette-section {
    background: var(--card);
    padding: 64px 40px;
    border-top: 1px solid var(--divider);
    border-bottom: 1px solid var(--divider);
  }
  .palette-inner { max-width: 1160px; margin: 0 auto; }
  .palette-row { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    font-size: 11px; color: var(--sub);
  }
  .swatch-dot { width: 56px; height: 56px; border-radius: 14px; border: 1px solid var(--divider); }
  .swatch-name { font-weight: 500; color: var(--text); font-size: 11px; }
  .swatch-hex { font-size: 10px; font-family: monospace; color: var(--muted); }

  /* FOOTER */
  footer {
    padding: 48px 40px;
    display: flex; align-items: center; justify-content: space-between;
    max-width: 1160px; margin: 0 auto;
    border-top: 1px solid var(--divider);
  }
  .footer-logo {
    font-family: Georgia, serif; font-size: 18px; font-weight: 300;
    letter-spacing: 0.12em; color: var(--text);
  }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a {
    text-decoration: none; color: var(--sub); font-size: 13px;
    transition: color 0.2s;
  }
  .footer-links a:hover { color: var(--text); }
  .footer-credit { font-size: 11px; color: var(--muted); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding-top: 100px; text-align: center; }
    .hero-sub { margin-left: auto; margin-right: auto; }
    .hero-actions { justify-content: center; }
    .hero-proof { justify-content: center; }
    .hero-visual { margin-top: 40px; }
    .float-card-1 { display: none; }
    .float-card-2 { display: none; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    .features-grid { grid-template-columns: 1fr; }
    footer { flex-direction: column; gap: 24px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">V<span>I</span>TA</div>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#palette">Palette</a></li>
  </ul>
  <a href="https://ram.zenbin.org/vita-mock" class="nav-cta">View Mock →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">
      <span class="hero-eyebrow-dot"></span>
      Health Design System
    </div>
    <h1 class="hero-headline">
      Daily longevity,<br><em>made ritual</em>
    </h1>
    <p class="hero-sub">
      VITA is a longevity tracking app inspired by the health tech design surge — using editorial warmth,
      serif typography, and calm visual minimalism to make daily rituals feel like a practice, not a chore.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/vita-viewer" class="btn-primary">View in Pencil Viewer</a>
      <a href="https://ram.zenbin.org/vita-mock" class="btn-secondary">Interactive mock →</a>
    </div>
    <div class="hero-proof">
      <div class="hero-proof-avatars">
        <span class="av1">M</span>
        <span class="av2">J</span>
        <span class="av3">K</span>
        <span class="av4">L</span>
      </div>
      <span>Built for people who take longevity seriously</span>
    </div>
  </div>

  <div class="hero-visual">
    <div class="float-card float-card-1">
      <div class="float-score">78</div>
      <div class="float-label">Vitality Score</div>
    </div>
    <div class="phone-shell">
      <div class="phone-notch"></div>
      <img src="${screenDataUris[0]}" alt="Today screen" loading="lazy">
    </div>
    <div class="float-card float-card-2">
      <div class="float-streak">
        <span class="float-streak-icon">🔥</span>
        <span class="float-streak-num">14</span>
      </div>
      <div class="float-label">Day streak</div>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section class="screens-section" id="screens">
  <div class="screens-header">
    <div class="section-eyebrow">6 Screens</div>
    <h2 class="section-title">Every angle of longevity</h2>
    <p class="section-sub">From daily rituals to sleep staging and biomarker tracking — one coherent visual system.</p>
  </div>
  <div class="screens-track">
    ${screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenDataUris[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-card-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- FEATURES -->
<section class="features-section" id="features">
  <div style="text-align:center; margin-bottom:56px;">
    <div class="section-eyebrow">Design Decisions</div>
    <h2 class="section-title">Built around the longevity archetype</h2>
  </div>
  <div class="features-grid">
    <div class="feature-item">
      <div class="feature-icon" style="background:rgba(90,122,90,0.1);">◎</div>
      <div class="feature-name">Editorial Serif + Sans Stack</div>
      <div class="feature-desc">Georgia serif for display numerics and headlines paired with system-ui body text — reflecting the Instrument Serif + Inter trend dominating minimal.gallery's 2025 health and editorial picks.</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon" style="background:rgba(201,151,62,0.1);">✦</div>
      <div class="feature-name">Warm Cream Light Theme</div>
      <div class="feature-desc">FAF7F2 warm cream base with sage green, terracotta, and warm gold accents — drawing from the body-adjacent, nature-referencing palettes seen across health tech entries on lapa.ninja and land-book.</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon" style="background:rgba(184,115,80,0.1);">◉</div>
      <div class="feature-name">Radial Ring Progress System</div>
      <div class="feature-desc">The vitality score uses a clean arc ring with sub-metric satellites — a pattern borrowed from the Activity rings aesthetic but applied with editorial restraint, avoiding gamified neon in favour of calm sage.</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon" style="background:rgba(88,112,168,0.1);">◑</div>
      <div class="feature-name">Sleep Hypnogram Visualization</div>
      <div class="feature-desc">Sleep stages rendered as variable-height bars across a timeline — inspired by wearable data UI patterns seen in mobbin's health app references. Colour-coded by stage without jargon overload.</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon" style="background:rgba(90,122,90,0.1);">◈</div>
      <div class="feature-name">Ritual Card Stack</div>
      <div class="feature-desc">Each ritual is a self-contained card with a left colour-accent bar, icon circle, streak counter, and tag chips. The modular card approach matches land-book's most-bookmarked feature-grid pattern.</div>
    </div>
    <div class="feature-item">
      <div class="feature-icon" style="background:rgba(201,151,62,0.1);">◇</div>
      <div class="feature-name">Biomarker 2×2 Grid</div>
      <div class="feature-desc">HRV, resting HR, VO2 estimate, and recovery score presented in a compact 2×2 grid with delta badges — putting the most actionable numbers front-and-center on the Insights screen.</div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section" id="palette">
  <div class="palette-inner">
    <div class="section-eyebrow">Colour System</div>
    <h2 class="section-title" style="margin-top:12px;">Warm, body-adjacent earth tones</h2>
    <div class="palette-row">
      ${[
        { name: 'Warm Cream', hex: '#FAF7F2', role: 'Background' },
        { name: 'Pure White', hex: '#FFFFFF', role: 'Surface' },
        { name: 'Parchment', hex: '#F0EDE8', role: 'Card' },
        { name: 'Sage Green', hex: '#5A7A5A', role: 'Accent' },
        { name: 'Terracotta', hex: '#B87350', role: 'Accent 2' },
        { name: 'Warm Gold', hex: '#C9973E', role: 'Achievement' },
        { name: 'Slate Blue', hex: '#8B9FBE', role: 'Sleep' },
        { name: 'Warm Bark', hex: '#1C1917', role: 'Text' },
        { name: 'Drift', hex: '#78716C', role: 'Subtext' },
      ].map(s => `
      <div class="swatch">
        <div class="swatch-dot" style="background:${s.hex};"></div>
        <div class="swatch-name">${s.name}</div>
        <div class="swatch-hex">${s.hex}</div>
        <div style="font-size:10px;color:#A8A29E;">${s.role}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">VITA</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/vita-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/vita-mock">Interactive Mock ☀◑</a>
  </div>
  <div class="footer-credit">RAM Design Heartbeat · April 2026</div>
</footer>

</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
