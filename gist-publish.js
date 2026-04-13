'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'gist';
const APP     = 'GIST';
const TAGLINE = 'Slow reading for busy minds';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
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
const C = {
  bg:        '#FAF8F4',
  surface:   '#FFFFFF',
  card:      '#F5F1EB',
  border:    '#E8E2D9',
  text:      '#1A1714',
  textMid:   '#5C5148',
  textFaint: '#9C9088',
  accent:    '#2B4A3F',
  accentLt:  '#3D6B5E',
  accentBg:  '#EBF2EF',
  amber:     '#C4874A',
  amberBg:   '#FDF3E7',
};

// ── SVG data URIs from pen screens ──────────────────────────────────────────
const svgDataUris = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
});

// ── Hero page ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:       ${C.bg};
    --surface:  ${C.surface};
    --card:     ${C.card};
    --border:   ${C.border};
    --text:     ${C.text};
    --textMid:  ${C.textMid};
    --faint:    ${C.textFaint};
    --accent:   ${C.accent};
    --accentLt: ${C.accentLt};
    --accentBg: ${C.accentBg};
    --amber:    ${C.amber};
    --amberBg:  ${C.amberBg};
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Georgia', serif;
    line-height: 1.6;
  }

  /* ── NAV ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,248,244,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .nav-logo {
    font-family: system-ui, sans-serif;
    font-size: 18px; font-weight: 700;
    letter-spacing: 4px; color: var(--accent);
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    font-family: system-ui, sans-serif;
    font-size: 13px; color: var(--textMid);
    text-decoration: none;
  }
  .nav-cta {
    background: var(--accent);
    color: #fff !important;
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: 600 !important;
    font-size: 13px !important;
    text-decoration: none;
    font-family: system-ui, sans-serif;
  }

  /* ── HERO ── */
  .hero {
    max-width: 1100px; margin: 0 auto;
    padding: 80px 40px 60px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-block;
    background: var(--accentBg);
    color: var(--accentLt);
    font-family: system-ui, sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 1.5px;
    padding: 5px 14px; border-radius: 20px;
    margin-bottom: 24px; text-transform: uppercase;
  }
  .hero h1 {
    font-size: clamp(42px, 5vw, 64px);
    font-weight: 600; line-height: 1.12;
    color: var(--text); margin-bottom: 20px;
  }
  .hero p {
    font-size: 18px; color: var(--textMid);
    line-height: 1.7; margin-bottom: 32px;
    font-family: Georgia, serif;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; }
  .btn-primary {
    background: var(--accent);
    color: #fff; padding: 14px 28px;
    border-radius: 12px; font-family: system-ui, sans-serif;
    font-size: 14px; font-weight: 600;
    text-decoration: none; display: inline-block;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-ghost {
    color: var(--accent); font-family: system-ui, sans-serif;
    font-size: 14px; font-weight: 500;
    text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { text-decoration: underline; }

  /* ── PHONE MOCKUP ── */
  .phone-wrap {
    display: flex; justify-content: center;
    position: relative;
  }
  .phone-shell {
    width: 280px; height: 566px;
    border-radius: 40px;
    background: var(--surface);
    border: 6px solid var(--text);
    box-shadow: 0 32px 80px rgba(26,23,20,0.16);
    overflow: hidden; position: relative;
  }
  .phone-shell img {
    width: 100%; height: 100%; object-fit: cover;
    display: block;
  }
  .phone-notch {
    position: absolute; top: 0; left: 50%;
    transform: translateX(-50%);
    width: 100px; height: 24px;
    background: var(--text); border-radius: 0 0 18px 18px;
    z-index: 2;
  }
  /* Floating context cards */
  .float-card {
    position: absolute;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 12px 16px;
    box-shadow: 0 8px 32px rgba(26,23,20,0.1);
    font-family: system-ui, sans-serif;
  }
  .float-left  { left: -60px;  top: 140px; }
  .float-right { right: -56px; top: 260px; }
  .float-card .f-label { font-size: 10px; color: var(--faint); letter-spacing: 0.5px; margin-bottom: 4px; }
  .float-card .f-val   { font-size: 18px; font-weight: 700; color: var(--accent); }
  .float-card .f-sub   { font-size: 10px; color: var(--textMid); margin-top: 2px; }

  /* ── DIVIDER ── */
  .divider { border: none; border-top: 1px solid var(--border); margin: 0 40px; }

  /* ── STATS BAR ── */
  .stats-bar {
    max-width: 1100px; margin: 0 auto;
    padding: 40px 40px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px; background: var(--border);
    border: 1px solid var(--border); border-radius: 16px;
    overflow: hidden; margin-bottom: 0;
  }
  .stat-item {
    background: var(--surface);
    padding: 28px 24px; text-align: center;
  }
  .stat-num {
    font-size: 32px; font-weight: 700; color: var(--accent);
    font-family: system-ui, sans-serif; display: block; margin-bottom: 4px;
  }
  .stat-lbl {
    font-size: 12px; color: var(--faint); font-family: system-ui, sans-serif;
    letter-spacing: 0.3px;
  }

  /* ── SECTION ── */
  .section { max-width: 1100px; margin: 80px auto; padding: 0 40px; }
  .section-eyebrow {
    font-family: system-ui, sans-serif;
    font-size: 11px; font-weight: 600;
    color: var(--accentLt); letter-spacing: 1.5px;
    text-transform: uppercase; margin-bottom: 16px;
  }
  .section h2 {
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 600; line-height: 1.2;
    color: var(--text); margin-bottom: 16px;
  }
  .section-sub {
    font-size: 17px; color: var(--textMid); max-width: 540px; margin-bottom: 48px;
    line-height: 1.7;
  }

  /* ── SCREENS CAROUSEL ── */
  .screens-grid {
    display: flex; gap: 24px; overflow-x: auto;
    padding-bottom: 12px; scroll-snap-type: x mandatory;
  }
  .screens-grid::-webkit-scrollbar { height: 4px; }
  .screens-grid::-webkit-scrollbar-track { background: var(--card); border-radius: 4px; }
  .screens-grid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  .screen-thumb {
    scroll-snap-align: start; flex-shrink: 0;
    width: 200px; border-radius: 26px;
    border: 4px solid var(--text);
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(26,23,20,0.12);
    transition: transform 0.2s;
  }
  .screen-thumb:hover { transform: translateY(-4px); }
  .screen-thumb img { width: 100%; display: block; }
  .screen-label {
    font-family: system-ui, sans-serif;
    font-size: 12px; color: var(--textMid);
    text-align: center; margin-top: 10px; font-weight: 500;
  }

  /* ── FEATURES ── */
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 28px 24px;
  }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--accentBg);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-card h3 {
    font-size: 16px; font-weight: 600;
    font-family: system-ui, sans-serif; margin-bottom: 8px;
    color: var(--text);
  }
  .feature-card p {
    font-size: 14px; color: var(--textMid);
    line-height: 1.6; font-family: system-ui, sans-serif;
  }

  /* ── PALETTE ── */
  .palette-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .swatch {
    width: 72px; height: 72px; border-radius: 12px;
    border: 1px solid var(--border);
  }
  .swatch-label {
    font-family: system-ui, sans-serif; font-size: 10px;
    color: var(--textMid); margin-top: 6px; text-align: center;
  }
  .swatch-hex {
    font-family: monospace; font-size: 10px;
    color: var(--faint); text-align: center;
  }

  /* ── QUOTE ── */
  .editorial-quote {
    max-width: 1100px; margin: 60px auto;
    padding: 48px 60px;
    background: var(--accent);
    border-radius: 20px;
    display: grid; grid-template-columns: 4px 1fr;
    gap: 32px; align-items: start;
  }
  .quote-rule { background: rgba(255,255,255,0.3); border-radius: 2px; }
  .editorial-quote blockquote {
    font-size: clamp(18px, 2.5vw, 28px);
    color: #fff; line-height: 1.5; font-style: italic;
    margin-bottom: 16px;
  }
  .editorial-quote cite {
    font-family: system-ui, sans-serif; font-size: 13px;
    color: rgba(255,255,255,0.65); font-style: normal;
  }

  /* ── LINKS SECTION ── */
  .links-row {
    display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
    margin-bottom: 40px;
  }
  .link-chip {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-family: system-ui, sans-serif; font-size: 13px;
    font-weight: 500; color: var(--text); text-decoration: none;
    transition: background 0.15s, border-color 0.15s;
  }
  .link-chip:hover { background: var(--accentBg); border-color: var(--accentLt); }
  .link-chip.primary {
    background: var(--accent); color: #fff; border-color: transparent;
  }
  .link-chip.primary:hover { background: var(--accentLt); }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px 40px;
    max-width: 1100px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
  }
  footer p { font-family: system-ui, sans-serif; font-size: 12px; color: var(--faint); }
  footer a { color: var(--accentLt); text-decoration: none; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; }
    .hero-right { display: none; }
    .stats-bar { grid-template-columns: repeat(2, 1fr); }
    .features-grid { grid-template-columns: 1fr; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">GIST</div>
  <div class="nav-links">
    <a href="#">Discover</a>
    <a href="#">Collections</a>
    <a href="#">Pricing</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock →</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-left">
    <span class="hero-eyebrow">✦ Design Heartbeat · April 2026</span>
    <h1>Read slowly.<br>Think deeply.</h1>
    <p>GIST is a calm reading digest for people who prefer considered thinking over endless scrolling. Eight curated stories, every morning.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Explore Mock →</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-ghost">View Design ↗</a>
    </div>
  </div>
  <div class="hero-right phone-wrap">
    <div class="phone-shell">
      <div class="phone-notch"></div>
      <img src="${svgDataUris[0]}" alt="Morning Brief screen" loading="lazy">
    </div>
    <div class="float-card float-left">
      <div class="f-label">Streak</div>
      <div class="f-val">14 days</div>
      <div class="f-sub">Keep reading 🔥</div>
    </div>
    <div class="float-card float-right">
      <div class="f-label">Today</div>
      <div class="f-val">8 stories</div>
      <div class="f-sub">Est. 24 min</div>
    </div>
  </div>
</section>

<!-- STATS -->
<div style="max-width:1100px;margin:0 auto;padding:0 40px 40px;">
  <div class="stats-bar">
    <div class="stat-item"><span class="stat-num">8</span><span class="stat-lbl">Stories daily</span></div>
    <div class="stat-item"><span class="stat-num">0</span><span class="stat-lbl">Ads, ever</span></div>
    <div class="stat-item"><span class="stat-num">24m</span><span class="stat-lbl">Avg. daily read</span></div>
    <div class="stat-item"><span class="stat-num">47+</span><span class="stat-lbl">Publications</span></div>
  </div>
</div>

<hr class="divider" style="margin:60px 40px;">

<!-- SCREENS -->
<section class="section">
  <p class="section-eyebrow">All Screens</p>
  <h2>Six thoughtfully designed views</h2>
  <p class="section-sub">Inspired by the warm minimal aesthetic of Minimal Gallery and the serif revival trend on Lapa Ninja.</p>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => `
      <div>
        <div class="screen-thumb">
          <img src="${svgDataUris[i]}" alt="${s.name}" loading="lazy">
        </div>
        <p class="screen-label">${s.name}</p>
      </div>
    `).join('')}
  </div>
</section>

<!-- FEATURES -->
<section class="section">
  <p class="section-eyebrow">Design Decisions</p>
  <h2>Editorial thinking, applied to apps</h2>
  <p class="section-sub">Each decision was deliberate — informed by what's resonating across curated design galleries in April 2026.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <h3>Warm parchment palette</h3>
      <p>Inspired by Minimal Gallery's paper-like warm whites. BG #FAF8F4 creates a tactile, readable surface that feels calm on any lighting.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <h3>Editorial serif headlines</h3>
      <p>Georgia serif for story titles and article text — echoing Lapa Ninja's documented serif revival, especially the "PP Editorial New" trend across SaaS landing pages.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◇</div>
      <h3>Deep forest green accent</h3>
      <p>#2B4A3F as the primary accent — a calm, editorial choice that avoids the clichéd tech blue and pairs naturally with warm neutrals.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◑</div>
      <h3>Generous whitespace</h3>
      <p>Narrow content columns and intentional empty regions, directly referencing the Minimal Gallery curation style — whitespace as a first-class design element.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◬</div>
      <h3>Amber warmth accents</h3>
      <p>#C4874A as the secondary tone — used for category tags and source markers. Creates hierarchy without jarring contrast against the cream background.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◻</div>
      <h3>Progress-first reading UX</h3>
      <p>Thin progress bar, reading streak card, and "time remaining" in the reader — UX patterns from Lapa Ninja's Saaspo-adjacent B2C apps applied to a reading context.</p>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="section">
  <p class="section-eyebrow">Colour Palette</p>
  <h2>Warm editorial tones</h2>
  <div class="palette-row" style="margin-top:32px;">
    ${[
      { hex: '#FAF8F4', name: 'Parchment' },
      { hex: '#FFFFFF', name: 'Surface' },
      { hex: '#F5F1EB', name: 'Cream card' },
      { hex: '#E8E2D9', name: 'Border' },
      { hex: '#1A1714', name: 'Ink' },
      { hex: '#5C5148', name: 'Mid' },
      { hex: '#9C9088', name: 'Faint' },
      { hex: '#2B4A3F', name: 'Forest' },
      { hex: '#EBF2EF', name: 'Green tint' },
      { hex: '#C4874A', name: 'Amber' },
    ].map(s => `
      <div>
        <div class="swatch" style="background:${s.hex};"></div>
        <div class="swatch-label">${s.name}</div>
        <div class="swatch-hex">${s.hex}</div>
      </div>
    `).join('')}
  </div>
</section>

<!-- EDITORIAL QUOTE -->
<div style="padding:0 40px;">
  <div class="editorial-quote">
    <div class="quote-rule"></div>
    <div>
      <blockquote>"Slow reading is an act of resistance — a refusal to let the feed decide what matters."</blockquote>
      <cite>— Design ethos for GIST, April 2026 heartbeat</cite>
    </div>
  </div>
</div>

<!-- LINKS -->
<section class="section" style="margin-top:60px;">
  <p class="section-eyebrow">Explore this design</p>
  <div class="links-row">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-chip primary">☀◑ Interactive Mock →</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-chip">◎ Pen Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}" class="link-chip">◈ This Page</a>
  </div>
</section>

<footer>
  <p>RAM Design Heartbeat · April 2026 · Light theme · Inspired by Minimal Gallery + Lapa Ninja</p>
  <p>Built by <a href="https://ram.zenbin.org">RAM</a></p>
</footer>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero page…');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0,80)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Pen Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0,80)}`);
}
main().catch(console.error);
