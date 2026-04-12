'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'arch';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
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

const penJson  = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen      = JSON.parse(penJson);

// Palette
const C = {
  bg:       '#FAF7F2',
  card:     '#F3EEE6',
  cardB:    '#EDE6DB',
  surface:  '#FFFFFF',
  text:     '#1E1A16',
  textMid:  '#5C5248',
  textFaint:'#9E9087',
  accent:   '#C4614A',   // terracotta
  accent2:  '#4A7B6F',   // sage green
  gold:     '#C09A52',
};

// Build SVG data URIs for thumbnails
const thumbs = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
});

// ── Hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ARCH — Architecture Studio · Project & Commission Tracker</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${C.bg};
    --card: ${C.card};
    --cardB: ${C.cardB};
    --surface: ${C.surface};
    --text: ${C.text};
    --mid: ${C.textMid};
    --faint: ${C.textFaint};
    --accent: ${C.accent};
    --accent2: ${C.accent2};
    --gold: ${C.gold};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
  }
  /* Nav */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,247,242,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--cardB);
    padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 56px;
  }
  .nav-logo {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 22px; font-weight: 700;
    letter-spacing: 6px; color: var(--text);
    text-decoration: none;
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    font-size: 12px; letter-spacing: 1px; font-weight: 500;
    color: var(--mid); text-decoration: none; text-transform: uppercase;
  }
  .nav-links a:hover { color: var(--accent); }
  .nav-cta {
    background: var(--accent); color: #fff;
    font-size: 11px; letter-spacing: 1px; font-weight: 600;
    text-transform: uppercase; border: none; cursor: pointer;
    padding: 8px 20px; border-radius: 6px; text-decoration: none;
  }
  /* Hero */
  .hero {
    min-height: 90vh;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0; align-items: center;
    padding: 80px 64px 80px 64px;
    border-bottom: 1px solid var(--cardB);
  }
  .hero-left { padding-right: 64px; }
  .hero-kicker {
    font-size: 11px; letter-spacing: 3px; font-weight: 600;
    color: var(--faint); text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-title {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(64px, 8vw, 104px);
    font-weight: 700;
    line-height: 0.9;
    letter-spacing: -2px;
    color: var(--text);
    margin-bottom: 32px;
  }
  .hero-title .accent { color: var(--accent); }
  .hero-sub {
    font-size: 16px; color: var(--mid);
    max-width: 420px; line-height: 1.7;
    margin-bottom: 40px;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; }
  .btn-primary {
    background: var(--accent); color: #fff;
    font-size: 13px; font-weight: 600; letter-spacing: 0.5px;
    padding: 14px 32px; border-radius: 8px; border: none;
    cursor: pointer; text-decoration: none; display: inline-block;
  }
  .btn-ghost {
    color: var(--mid); font-size: 13px; font-weight: 500;
    text-decoration: none; border-bottom: 1px solid var(--cardB);
    padding-bottom: 2px;
  }
  .btn-ghost:hover { color: var(--accent); border-color: var(--accent); }
  .hero-right {
    display: flex; justify-content: center; align-items: center;
  }
  .phone-frame {
    width: 280px; height: 570px;
    background: var(--surface);
    border-radius: 36px;
    border: 1px solid var(--cardB);
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(30,26,22,0.12), 0 8px 24px rgba(30,26,22,0.06);
    flex-shrink: 0;
  }
  .phone-frame img { width: 100%; height: 100%; object-fit: cover; }
  /* Palette swatches */
  .palette-bar {
    display: flex; gap: 0;
    margin-bottom: 40px;
  }
  .swatch { width: 48px; height: 8px; border-radius: 2px; }
  /* Stats row */
  .stats-row {
    display: flex; gap: 48px;
    padding: 48px 64px;
    border-bottom: 1px solid var(--cardB);
    background: var(--surface);
  }
  .stat { }
  .stat-val {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 48px; font-weight: 700; line-height: 1;
    color: var(--text);
  }
  .stat-label {
    font-size: 11px; letter-spacing: 2px; font-weight: 500;
    color: var(--faint); text-transform: uppercase;
    margin-top: 6px;
  }
  /* Feature grid */
  .features {
    padding: 80px 64px;
    border-bottom: 1px solid var(--cardB);
  }
  .section-kicker {
    font-size: 10px; letter-spacing: 3px; font-weight: 600;
    color: var(--faint); text-transform: uppercase;
    margin-bottom: 48px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--cardB);
  }
  .feature-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background: var(--cardB);
    border: 1px solid var(--cardB);
    border-radius: 12px; overflow: hidden;
  }
  .feature-card {
    background: var(--surface);
    padding: 32px 28px;
  }
  .feature-accent {
    width: 32px; height: 3px; border-radius: 2px;
    margin-bottom: 20px;
  }
  .feature-title {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 22px; font-weight: 700;
    margin-bottom: 10px; color: var(--text);
  }
  .feature-desc { font-size: 13px; color: var(--mid); line-height: 1.65; }
  /* Carousel */
  .carousel-section {
    padding: 80px 64px;
    border-bottom: 1px solid var(--cardB);
  }
  .screen-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-top: 48px;
  }
  .screen-thumb {
    aspect-ratio: 390/844;
    background: var(--card);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--cardB);
  }
  .screen-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .screen-label {
    font-size: 10px; color: var(--faint); letter-spacing: 1px;
    text-transform: uppercase; margin-top: 8px; text-align: center;
  }
  /* Philosophy block */
  .philosophy {
    padding: 80px 64px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 64px; align-items: center;
    border-bottom: 1px solid var(--cardB);
  }
  .phil-quote {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(28px, 3vw, 40px);
    line-height: 1.3; color: var(--text);
  }
  .phil-quote em { color: var(--accent); font-style: normal; }
  .phil-body { font-size: 14px; color: var(--mid); line-height: 1.8; }
  /* Footer */
  footer {
    padding: 40px 64px;
    display: flex; justify-content: space-between; align-items: center;
  }
  footer .logo {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 18px; font-weight: 700; letter-spacing: 4px; color: var(--faint);
  }
  footer .links { font-size: 11px; color: var(--faint); }
  footer .links a { color: var(--mid); text-decoration: none; margin-left: 20px; }
  footer .links a:hover { color: var(--accent); }
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 48px 24px; }
    .hero-left { padding-right: 0; }
    .hero-right { display: none; }
    .stats-row { flex-wrap: wrap; gap: 24px; padding: 32px 24px; }
    .features, .carousel-section, .philosophy { padding: 48px 24px; }
    .feature-grid { grid-template-columns: 1fr; }
    .screen-grid { grid-template-columns: repeat(3, 1fr); }
    .philosophy { grid-template-columns: 1fr; }
    footer { flex-direction: column; gap: 16px; padding: 24px; }
    nav { padding: 0 16px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">ARCH</a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-viewer">Open Viewer</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-left">
    <p class="hero-kicker">RAM Design Heartbeat · #52 · Light Theme</p>
    <div class="palette-bar">
      <div class="swatch" style="background:${C.accent}"></div>
      <div class="swatch" style="background:${C.accent2};margin-left:4px"></div>
      <div class="swatch" style="background:${C.gold};margin-left:4px"></div>
      <div class="swatch" style="background:${C.textMid};margin-left:4px"></div>
    </div>
    <h1 class="hero-title">ARCH<br><span class="accent">Studio.</span></h1>
    <p class="hero-sub">Architecture studio project &amp; commission tracker. Inspired by the editorial serif + warm cream Swiss grid aesthetic of minimal.gallery and the Big Type genre on Land-book.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
      <a class="btn-ghost" href="https://ram.zenbin.org/${SLUG}-viewer">View Design →</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="phone-frame">
      <img src="${thumbs[0]}" alt="Dashboard screen" />
    </div>
  </div>
</section>

<!-- Stats -->
<div class="stats-row" id="palette">
  <div class="stat">
    <div class="stat-val">6</div>
    <div class="stat-label">Screens</div>
  </div>
  <div class="stat">
    <div class="stat-val">497</div>
    <div class="stat-label">Elements</div>
  </div>
  <div class="stat">
    <div class="stat-val" style="color:${C.accent}">Light</div>
    <div class="stat-label">Theme</div>
  </div>
  <div class="stat">
    <div class="stat-val">#52</div>
    <div class="stat-label">Heartbeat</div>
  </div>
</div>

<!-- Screen carousel -->
<section class="carousel-section" id="screens">
  <p class="section-kicker">All screens</p>
  <div class="screen-grid">
    ${pen.screens.map((s, i) => `
    <div>
      <div class="screen-thumb"><img src="${thumbs[i]}" alt="${s.name}" /></div>
      <p class="screen-label">${s.name}</p>
    </div>`).join('')}
  </div>
</section>

<!-- Features -->
<section class="features" id="features">
  <p class="section-kicker">Design Decisions</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-accent" style="background:${C.accent}"></div>
      <h3 class="feature-title">Editorial Serif</h3>
      <p class="feature-desc">EB Garamond replaces the ubiquitous Inter/Geist SaaS template. Inspired by minimal.gallery's architecture studio examples where display serifs signal craft and permanence over speed-to-ship.</p>
    </div>
    <div class="feature-card">
      <div class="feature-accent" style="background:${C.accent2}"></div>
      <h3 class="feature-title">Warm Cream Base</h3>
      <p class="feature-desc">Background #FAF7F2 — not white. Off-white with warm undertones from minimal.gallery's luxury/architecture niche. Reduces eye strain and signals premium positioning over clinical SaaS white.</p>
    </div>
    <div class="feature-card">
      <div class="feature-accent" style="background:${C.gold}"></div>
      <h3 class="feature-title">Big Type Ghost</h3>
      <p class="feature-desc">The '2026' ghost type on the Commission Brief screen directly references Land-book's Big Type filter — screen-filling typography as texture, not navigation. Bold yet purely decorative.</p>
    </div>
    <div class="feature-card">
      <div class="feature-accent" style="background:${C.text}"></div>
      <h3 class="feature-title">Swiss Grid Lines</h3>
      <p class="feature-desc">Faint vertical grid reference lines on Team and Projects screens echo the architectural section drawing discipline — structure made visible rather than hidden behind opaque cards.</p>
    </div>
    <div class="feature-card">
      <div class="feature-accent" style="background:${C.accent}"></div>
      <h3 class="feature-title">Terracotta Accent</h3>
      <p class="feature-desc">C4614A terracotta replaces the purple/violet trend dominating AI SaaS. Warm, Mediterranean, tied to architecture's physical materiality — differentiated from Saaspo's violet-heavy AI category.</p>
    </div>
    <div class="feature-card">
      <div class="feature-accent" style="background:${C.accent2}"></div>
      <h3 class="feature-title">Floor Plan Detail</h3>
      <p class="feature-desc">Project Detail includes a schematic floor plan SVG, dimension annotations, scale bar, and north arrow — domain-specific chrome that grounds the app in its professional context.</p>
    </div>
  </div>
</section>

<!-- Philosophy -->
<section class="philosophy">
  <div>
    <p class="phil-quote">Design tools should feel like the discipline they serve — <em>not like another SaaS dashboard.</em></p>
  </div>
  <div>
    <p class="phil-body">Most architecture tools borrow the same dark/purple/bento template from AI-category SaaS. ARCH rejects that convergence. The palette, typography, and detail language are borrowed from architectural drawings themselves: warm trace paper, dimension ticks, registration marks.</p>
    <br/>
    <p class="phil-body" style="color:${C.faint};font-size:12px">Inspired by: minimal.gallery editorial series + Land-book Big Type filter · April 2026</p>
  </div>
</section>

<!-- Footer -->
<footer>
  <span class="logo">ARCH</span>
  <div class="links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
    <span style="margin-left:20px;color:var(--faint)">RAM Design Heartbeat #52</span>
  </div>
</footer>

</body>
</html>`;

// ── Viewer page ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'ARCH — Architecture Studio · Project & Commission Tracker');
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 120) : '✓');

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'ARCH — Design Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 120) : '✓');
}

main().catch(console.error);
