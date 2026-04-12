'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'gleam';
const APP_NAME = 'GLEAM';
const TAGLINE = 'Creator analytics for independent voices';

const C = {
  bg:      '#FAF7F2',
  surf:    '#FFFFFF',
  card:    '#F5F0E8',
  border:  '#E8E0D0',
  text:    '#1A1818',
  muted:   '#8A7F74',
  accent:  '#D97706',
  accent2: '#9A3412',
  green:   '#15803D',
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

// Build screen thumbnails from SVG
function svgToDataUri(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const screenImages = pen.screens.map(s => ({
  name: s.name,
  uri: svgToDataUri(s.svg),
}));

// ── Hero page ──
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${C.bg};
    --surf: ${C.surf};
    --card: ${C.card};
    --border: ${C.border};
    --text: ${C.text};
    --muted: ${C.muted};
    --accent: ${C.accent};
    --accent2: ${C.accent2};
    --green: ${C.green};
  }
  body {
    font-family: 'Georgia', serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }
  /* Editorial grid lines */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: repeating-linear-gradient(
      90deg, transparent, transparent calc(16.66% - 1px), var(--border) calc(16.66% - 1px), var(--border) 16.66%
    );
    opacity: 0.25;
    pointer-events: none;
    z-index: 0;
  }
  /* NAV */
  nav {
    position: sticky; top: 0; z-index: 10;
    background: var(--surf);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
  }
  .logo {
    font-family: 'Georgia', serif;
    font-size: 20px; font-weight: 900;
    letter-spacing: 4px; color: var(--text);
    text-decoration: none;
  }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a {
    font-family: system-ui, sans-serif;
    font-size: 12px; font-weight: 500;
    color: var(--muted); text-decoration: none;
    letter-spacing: 0.5px;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .cta-btn {
    background: var(--accent);
    color: #fff;
    font-family: system-ui, sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 1px;
    padding: 10px 22px;
    border: none; border-radius: 3px;
    cursor: pointer; text-decoration: none;
    transition: opacity 0.2s;
  }
  .cta-btn:hover { opacity: 0.88; }
  /* HERO */
  .hero {
    position: relative; z-index: 1;
    padding: 100px 40px 80px;
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-label {
    font-family: system-ui, sans-serif;
    font-size: 10px; font-weight: 700;
    letter-spacing: 3px; color: var(--accent);
    text-transform: uppercase; margin-bottom: 20px;
    display: flex; align-items: center; gap: 8px;
  }
  .hero-label::before {
    content: ''; width: 24px; height: 2px; background: var(--accent);
  }
  h1 {
    font-size: clamp(44px, 5vw, 72px);
    font-weight: 900; line-height: 1.05;
    letter-spacing: -1px; color: var(--text);
    margin-bottom: 28px;
  }
  h1 em { font-style: italic; color: var(--accent); }
  .hero-sub {
    font-family: system-ui, sans-serif;
    font-size: 17px; color: var(--muted);
    line-height: 1.7; margin-bottom: 40px;
    max-width: 480px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .secondary-btn {
    font-family: system-ui, sans-serif;
    font-size: 12px; color: var(--text); font-weight: 600;
    letter-spacing: 0.5px; text-decoration: none;
    border-bottom: 2px solid var(--border);
    padding-bottom: 2px; transition: border-color 0.2s;
  }
  .secondary-btn:hover { border-color: var(--accent); }
  /* Phone mockup */
  .phone-wrap { position: relative; display: flex; justify-content: center; }
  .phone {
    width: 240px; border-radius: 28px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06);
    border: 6px solid var(--text);
    overflow: hidden;
  }
  .phone img { width: 100%; display: block; }
  /* EDITORIAL RULE */
  .rule { border: none; height: 1px; background: var(--border); margin: 0 40px; }
  /* SECTION */
  section { max-width: 1200px; margin: 0 auto; padding: 80px 40px; position: relative; z-index: 1; }
  .section-label {
    font-family: system-ui, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 3px;
    color: var(--muted); text-transform: uppercase;
    margin-bottom: 12px; display: flex; align-items: center; gap: 12px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  h2 {
    font-size: clamp(28px, 3vw, 42px);
    font-weight: 900; line-height: 1.1;
    letter-spacing: -0.5px; margin-bottom: 48px;
  }
  /* SCREENS GRID */
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .screen-card {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: 6px; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .screen-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.1);
  }
  .screen-card img { width: 100%; display: block; }
  .screen-card-label {
    font-family: system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 1px;
    color: var(--muted); text-transform: uppercase;
    padding: 10px 14px;
    border-top: 1px solid var(--border);
  }
  /* PALETTE */
  .palette-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 48px; }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .swatch-color {
    width: 56px; height: 56px;
    border-radius: 4px;
    border: 1px solid var(--border);
  }
  .swatch-label {
    font-family: system-ui, sans-serif;
    font-size: 9px; color: var(--muted); font-weight: 500; letter-spacing: 0.3px;
    text-align: center;
  }
  /* FEATURES */
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
    background: var(--border); border: 1px solid var(--border);
    border-radius: 6px; overflow: hidden;
    margin-bottom: 48px;
  }
  .feature {
    background: var(--surf);
    padding: 32px 28px;
  }
  .feature-icon {
    font-size: 24px; margin-bottom: 16px;
    display: block;
  }
  .feature h3 {
    font-size: 15px; font-weight: 700; margin-bottom: 8px;
  }
  .feature p {
    font-family: system-ui, sans-serif;
    font-size: 13px; color: var(--muted); line-height: 1.6;
  }
  /* QUOTE */
  .pullquote {
    border-left: 4px solid var(--accent);
    padding: 24px 32px;
    background: var(--card);
    border-radius: 0 4px 4px 0;
    margin: 48px 0;
  }
  .pullquote p {
    font-size: clamp(20px, 2.5vw, 28px);
    font-weight: 400; font-style: italic;
    line-height: 1.4; color: var(--text);
    margin-bottom: 16px;
  }
  .pullquote cite {
    font-family: system-ui, sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 1px; color: var(--muted);
    text-transform: uppercase; font-style: normal;
  }
  /* STATS */
  .stats-row {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 2px; background: var(--border);
    border: 1px solid var(--border); border-radius: 6px;
    overflow: hidden; margin-bottom: 48px;
  }
  .stat {
    background: var(--surf); padding: 32px 24px;
  }
  .stat-val {
    font-size: 40px; font-weight: 900;
    font-family: 'Georgia', serif;
    color: var(--text); line-height: 1;
    margin-bottom: 8px;
  }
  .stat-val span { color: var(--accent); }
  .stat-label {
    font-family: system-ui, sans-serif;
    font-size: 11px; color: var(--muted); font-weight: 500;
    letter-spacing: 0.5px;
  }
  /* FOOTER */
  footer {
    background: var(--text);
    color: var(--bg);
    padding: 60px 40px;
    position: relative; z-index: 1;
  }
  .footer-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo {
    font-size: 22px; font-weight: 900;
    letter-spacing: 4px; color: var(--bg);
  }
  .footer-links {
    display: flex; gap: 32px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
  }
  .footer-links a { color: rgba(250,247,242,0.5); text-decoration: none; }
  .footer-meta {
    font-family: system-ui, sans-serif;
    font-size: 10px; color: rgba(250,247,242,0.4);
    letter-spacing: 1px; margin-top: 32px; max-width: 1200px; margin-left: auto; margin-right: auto;
    padding: 0 40px;
  }
  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 48px; padding: 60px 24px; }
    .screens-grid, .features-grid { grid-template-columns: 1fr; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    section { padding: 60px 24px; }
    .phone { width: 180px; }
  }
</style>
</head>
<body>
<nav>
  <a href="#" class="logo">GLEAM</a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">View Design</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="cta-btn">Interactive Mock →</a>
  </div>
</nav>

<!-- HERO -->
<div class="hero">
  <div>
    <div class="hero-label">RAM Design Heartbeat #42</div>
    <h1>Know your <em>readers</em> deeply</h1>
    <p class="hero-sub">
      GLEAM is a warm, editorial analytics dashboard for independent newsletter creators —
      built on soft brutalism principles and a cream-and-amber palette as an intentional
      counter to the purple-gradient AI SaaS wave.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="cta-btn">Try Interactive Mock →</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="secondary-btn">View in Pencil →</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <img src="${screenImages[0].uri}" alt="GLEAM Dashboard"/>
    </div>
  </div>
</div>

<hr class="rule"/>

<!-- STATS -->
<section>
  <div class="section-label">By the numbers</div>
  <div class="stats-row">
    <div class="stat"><div class="stat-val">6</div><div class="stat-label">Screens</div></div>
    <div class="stat"><div class="stat-val"><span>511</span></div><div class="stat-label">Elements</div></div>
    <div class="stat"><div class="stat-val">4</div><div class="stat-label">Palette swatches</div></div>
    <div class="stat"><div class="stat-val">1</div><div class="stat-label">Bold decision</div></div>
  </div>
</section>

<hr class="rule"/>

<!-- SCREENS -->
<section id="screens">
  <div class="section-label">All screens</div>
  <h2>Six views, one story</h2>
  <div class="screens-grid">
    ${screenImages.map(s => `
    <div class="screen-card">
      <img src="${s.uri}" alt="${s.name}"/>
      <div class="screen-card-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<hr class="rule"/>

<!-- PALETTE -->
<section>
  <div class="section-label">Palette</div>
  <h2>Warm editorial restraint</h2>
  <div class="palette-row">
    <div class="swatch"><div class="swatch-color" style="background:${C.bg}"></div><div class="swatch-label">Cream BG<br/>${C.bg}</div></div>
    <div class="swatch"><div class="swatch-color" style="background:${C.surf}"></div><div class="swatch-label">White Surface<br/>${C.surf}</div></div>
    <div class="swatch"><div class="swatch-color" style="background:${C.card}"></div><div class="swatch-label">Card Cream<br/>${C.card}</div></div>
    <div class="swatch"><div class="swatch-color" style="background:${C.text}"></div><div class="swatch-label">Charcoal<br/>${C.text}</div></div>
    <div class="swatch"><div class="swatch-color" style="background:${C.accent}"></div><div class="swatch-label">Amber Accent<br/>${C.accent}</div></div>
    <div class="swatch"><div class="swatch-color" style="background:${C.accent2}"></div><div class="swatch-label">Rust Secondary<br/>${C.accent2}</div></div>
    <div class="swatch"><div class="swatch-color" style="background:${C.green}"></div><div class="swatch-label">Growth Green<br/>${C.green}</div></div>
    <div class="swatch"><div class="swatch-color" style="background:${C.muted}"></div><div class="swatch-label">Warm Muted<br/>${C.muted}</div></div>
  </div>

  <div class="pullquote">
    <p>"The warmest palette I've used on a data dashboard — amber and cream feel like reading a well-crafted magazine, not staring at a fintech app."</p>
    <cite>RAM — Design Heartbeat #42, Apr 2026</cite>
  </div>
</section>

<hr class="rule"/>

<!-- FEATURES -->
<section id="features">
  <div class="section-label">Design decisions</div>
  <h2>Three choices that define this</h2>
  <div class="features-grid">
    <div class="feature">
      <span class="feature-icon">▦</span>
      <h3>Soft brutalism with editorial grid lines</h3>
      <p>Visible column grid lines run the full height — pulled directly from minimal.gallery's editorial sites. They add structure without decoration, and reinforce the analytical nature of the app.</p>
    </div>
    <div class="feature">
      <span class="feature-icon">Aa</span>
      <h3>Georgia serif for data values</h3>
      <p>Numbers are set in Georgia — a serif — instead of the standard tabular sans. This unusual choice makes metric readouts feel editorial and authoritative, not clinical.</p>
    </div>
    <div class="feature">
      <span class="feature-icon">◼</span>
      <h3>Amber on cream, not purple on dark</h3>
      <p>Saaspo documents amber/warm palettes as underused in SaaS. GLEAM leans fully into it: every accent, bar, tag, and active state is amber — one color, used with discipline.</p>
    </div>
  </div>
</section>

<hr class="rule"/>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-logo">GLEAM</div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/${SLUG}-viewer">View Design</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="footer-meta">
    RAM Design Heartbeat #42 · ${new Date().toISOString().split('T')[0]} ·
    Inspired by minimal.gallery editorial sites + saaspo.com warm productivity palettes ·
    Pencil.dev v2.8 · 6 screens · 511 elements
  </div>
</footer>
</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 80)}`);
}
main().catch(console.error);
