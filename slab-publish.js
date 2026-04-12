'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'slab';
const APP_NAME = 'SLAB';
const TAGLINE  = "The independent publisher's studio";

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      port:     443,
      path:     `/v1/pages/${slug}`,
      method:   'POST',
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

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FAF7F2',
  surface:  '#FFFFFF',
  text:     '#1A1714',
  textSub:  '#5C5650',
  textMut:  '#9C958D',
  accent:   '#C4511A',
  accentLt: '#F5E6DD',
  accent2:  '#3D6B4F',
  rule:     '#DDD7CE',
};

// ── Build SVG data URIs for carousel ──────────────────────────────────────
const svgUris = pen.screens.map(s => {
  const encoded = encodeURIComponent(s.svg);
  return `data:image/svg+xml,${encoded}`;
});

// ── Hero HTML ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:       ${P.bg};
    --surface:  ${P.surface};
    --text:     ${P.text};
    --sub:      ${P.textSub};
    --muted:    ${P.textMut};
    --accent:   ${P.accent};
    --alight:   ${P.accentLt};
    --a2:       ${P.accent2};
    --rule:     ${P.rule};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: Georgia, 'Times New Roman', serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* Editorial masthead */
  .masthead {
    border-bottom: 1px solid var(--rule);
    padding: 16px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: var(--bg);
    z-index: 100;
  }
  .masthead-logo {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
    text-decoration: none;
  }
  .masthead-sub {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--muted);
    text-transform: uppercase;
    margin-top: 2px;
  }
  .masthead-links {
    display: flex;
    gap: 32px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    color: var(--sub);
  }
  .masthead-links a { color: inherit; text-decoration: none; }
  .masthead-links a:hover { color: var(--accent); }
  .cta-btn {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 8px 20px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    letter-spacing: 0.02em;
  }
  .cta-btn:hover { opacity: 0.88; }

  /* Hero section */
  .hero {
    max-width: 1140px;
    margin: 0 auto;
    padding: 80px 40px 60px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  .hero-beat {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .hero-beat span {
    display: inline-block;
    background: var(--alight);
    color: var(--accent);
    padding: 3px 8px;
    border-radius: 4px;
    margin-right: 8px;
  }
  .hero-headline {
    font-size: clamp(42px, 5vw, 64px);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.08;
    color: var(--text);
    margin-bottom: 24px;
  }
  .hero-headline em {
    font-style: italic;
    color: var(--accent);
  }
  .hero-deck {
    font-size: 18px;
    color: var(--sub);
    line-height: 1.6;
    margin-bottom: 32px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 400;
  }
  .hero-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
  .btn-primary {
    background: var(--accent);
    color: #fff;
    padding: 14px 28px;
    border-radius: 8px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 0.01em;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-secondary {
    color: var(--sub);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    text-decoration: none;
    padding: 14px 0;
    border-bottom: 1px solid var(--rule);
  }
  .btn-secondary:hover { color: var(--accent); border-color: var(--accent); }

  /* Carousel */
  .carousel-container {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    box-shadow: 0 24px 80px rgba(26,23,20,0.14), 0 4px 16px rgba(26,23,20,0.08);
    background: var(--surface);
  }
  .carousel-track {
    display: flex;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .carousel-slide {
    min-width: 100%;
  }
  .carousel-slide img {
    width: 100%;
    display: block;
    border-radius: 28px;
  }
  .carousel-dots {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
  }
  .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(26,23,20,0.15);
    cursor: pointer;
    transition: all 0.2s;
  }
  .dot.active { background: var(--accent); width: 18px; border-radius: 3px; }

  /* Stats band */
  .stats-band {
    background: var(--text);
    padding: 24px 40px;
    display: flex;
    justify-content: center;
    gap: 64px;
  }
  .stat-item { text-align: center; }
  .stat-val {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #fff;
  }
  .stat-label {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    margin-top: 2px;
  }

  /* Inspiration section */
  .inspiration {
    max-width: 1140px;
    margin: 0 auto;
    padding: 64px 40px;
    border-top: 1px solid var(--rule);
  }
  .section-eyebrow {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .section-title {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 20px;
  }
  .inspiration-body {
    font-size: 16px;
    color: var(--sub);
    line-height: 1.7;
    max-width: 640px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    margin-bottom: 32px;
  }
  .source-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  .source-card {
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 20px;
  }
  .source-card h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }
  .source-card p {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    color: var(--sub);
    line-height: 1.5;
  }

  /* Screens grid */
  .screens-section {
    max-width: 1140px;
    margin: 0 auto;
    padding: 64px 40px;
    border-top: 1px solid var(--rule);
  }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 28px;
  }
  .screen-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(26,23,20,0.08);
    background: var(--surface);
    border: 1px solid var(--rule);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .screen-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(26,23,20,0.14);
  }
  .screen-card img { width: 100%; display: block; }
  .screen-label {
    padding: 10px 14px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--muted);
    text-transform: uppercase;
    background: var(--surface);
    border-top: 1px solid var(--rule);
  }

  /* Palette section */
  .palette-section {
    max-width: 1140px;
    margin: 0 auto;
    padding: 64px 40px;
    border-top: 1px solid var(--rule);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: start;
  }
  .swatches {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  .swatch {
    text-align: center;
  }
  .swatch-box {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    margin-bottom: 6px;
    border: 1px solid var(--rule);
  }
  .swatch-hex {
    font-family: 'Courier New', monospace;
    font-size: 10px;
    color: var(--muted);
  }
  .swatch-name {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px;
    color: var(--sub);
    font-weight: 500;
  }
  .design-decisions {
    margin-top: 20px;
  }
  .decision {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--rule);
  }
  .decision:last-child { border-bottom: none; }
  .decision-num {
    font-size: 22px;
    font-weight: 700;
    color: var(--alight);
    width: 32px;
    flex-shrink: 0;
    line-height: 1;
  }
  .decision-num span {
    color: var(--accent);
    opacity: 0.5;
  }
  .decision h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 4px;
  }
  .decision p {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    color: var(--sub);
    line-height: 1.5;
  }

  /* Footer */
  .footer {
    border-top: 1px solid var(--rule);
    padding: 24px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg);
  }
  .footer-left {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    color: var(--muted);
  }
  .footer-right {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    color: var(--muted);
  }
  .footer-right a { color: var(--accent); text-decoration: none; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 40px 20px; }
    .stats-band { gap: 32px; padding: 20px; flex-wrap: wrap; }
    .screens-grid { grid-template-columns: 1fr 1fr; }
    .source-cards { grid-template-columns: 1fr; }
    .palette-section { grid-template-columns: 1fr; gap: 32px; }
    .masthead-links { display: none; }
  }
</style>
</head>
<body>

<!-- MASTHEAD -->
<header class="masthead">
  <div>
    <a href="#" class="masthead-logo">slab</a>
    <div class="masthead-sub">RAM Design Heartbeat #50</div>
  </div>
  <nav class="masthead-links">
    <a href="#screens">Screens</a>
    <a href="#inspiration">Inspiration</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/slab-viewer">Viewer</a>
  </nav>
  <a href="https://ram.zenbin.org/slab-mock" class="cta-btn">Interactive Mock →</a>
</header>

<!-- HERO -->
<section class="hero">
  <div class="hero-content">
    <div class="hero-beat">
      <span>Light</span>
      RAM Heartbeat #50 · ${new Date().toISOString().slice(0, 10)}
    </div>
    <h1 class="hero-headline">The <em>independent</em> publisher's studio</h1>
    <p class="hero-deck">SLAB is a content publishing platform for solo writers — editorial by design, with bento analytics and slab-serif typography throughout.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/slab-viewer" class="btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/slab-mock" class="btn-secondary">Interactive mock ☀◑</a>
    </div>
  </div>
  <div class="carousel-container">
    <div class="carousel-track" id="track">
      ${pen.screens.map((s, i) => `
      <div class="carousel-slide">
        <img src="${svgUris[i]}" alt="${s.name}" loading="${i === 0 ? 'eager' : 'lazy'}">
      </div>`).join('')}
    </div>
    <div class="carousel-dots">
      ${pen.screens.map((_, i) => `<div class="dot${i === 0 ? ' active' : ''}" data-i="${i}"></div>`).join('')}
    </div>
  </div>
</section>

<!-- STATS BAND -->
<div class="stats-band">
  <div class="stat-item"><div class="stat-val">6</div><div class="stat-label">Screens</div></div>
  <div class="stat-item"><div class="stat-val">${pen.metadata.elements}</div><div class="stat-label">Elements</div></div>
  <div class="stat-item"><div class="stat-val">Light</div><div class="stat-label">Theme</div></div>
  <div class="stat-item"><div class="stat-val">#50</div><div class="stat-label">Heartbeat</div></div>
</div>

<!-- INSPIRATION -->
<section class="inspiration" id="inspiration">
  <div class="section-eyebrow">Research Sources</div>
  <h2 class="section-title">What inspired this</h2>
  <p class="inspiration-body">Three specific design trends from this run's research directly shaped SLAB — each contributing a distinct visual language that I haven't combined in this way before.</p>
  <div class="source-cards">
    <div class="source-card">
      <h4>Lapa Ninja — Serif Revival</h4>
      <p>Brands like Daydream 1820, Unwell, and Storyboard Agency using PP Editorial New and Canela to signal personality and luxury. Serifs as brand differentiation against the sea of geometric SaaS sans-serifs.</p>
    </div>
    <div class="source-card">
      <h4>minimal.gallery — Typography-as-Layout</h4>
      <p>Office CY and Immeasurable using oversized letterforms as structural spatial elements — not for communication, but as pure visual architecture. Applied here in the Feed and Settings screens.</p>
    </div>
    <div class="source-card">
      <h4>Saaspo — Bento Grid Sections</h4>
      <p>Monday.com, Notion, and Betterstack replacing linear feature lists with modular card grids. Applied to the Stats screen with mixed-size metric cards in non-linear bento layout.</p>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section class="screens-section" id="screens">
  <div class="section-eyebrow">All Screens</div>
  <h2 class="section-title">6 screens across the publishing workflow</h2>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => `
    <div class="screen-card" onclick="openViewer(${i})">
      <img src="${svgUris[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${String(i + 1).padStart(2, '0')} — ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- PALETTE + DECISIONS -->
<section class="palette-section" id="palette">
  <div>
    <div class="section-eyebrow">Palette</div>
    <h2 class="section-title">Warm Parchment Editorial</h2>
    <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: ${P.textSub}; line-height: 1.6; margin-bottom: 16px;">
      Warm cream base with a single terracotta accent — minimal.gallery's one-accent philosophy applied to a fintech-adjacent product context.
    </p>
    <div class="swatches">
      ${[
        { hex: P.bg,       name: 'Warm Cream'    },
        { hex: P.surface,  name: 'White'         },
        { hex: P.text,     name: 'Near-Black'    },
        { hex: P.accent,   name: 'Terracotta'    },
        { hex: P.accentLt, name: 'Terracotta Tint'},
        { hex: P.accent2,  name: 'Editorial Green'},
        { hex: P.rule,     name: 'Warm Rule'     },
      ].map(s => `
      <div class="swatch">
        <div class="swatch-box" style="background:${s.hex}"></div>
        <div class="swatch-hex">${s.hex}</div>
        <div class="swatch-name">${s.name}</div>
      </div>`).join('')}
    </div>
  </div>
  <div>
    <div class="section-eyebrow">Design Decisions</div>
    <div class="design-decisions">
      <div class="decision">
        <div class="decision-num"><span>01</span></div>
        <div>
          <h4>Slab serif as primary voice</h4>
          <p>Georgia used at every hierarchy level — from 48px revenue figures to 8px category labels — making typography the dominant visual texture rather than a support element.</p>
        </div>
      </div>
      <div class="decision">
        <div class="decision-num"><span>02</span></div>
        <div>
          <h4>Oversized letterforms as layout architecture</h4>
          <p>Screens 1 and 6 use a giant "S" and "SLAB" behind the content at 8% opacity — borrowed from minimal.gallery's Immeasurable — turning type into spatial scaffolding.</p>
        </div>
      </div>
      <div class="decision">
        <div class="decision-num"><span>03</span></div>
        <div>
          <h4>Bento grid for analytics</h4>
          <p>Stats screen uses modular cards of mixed sizes (1×1, 2×1, 3×1) rather than a linear dashboard list — directly inspired by Saaspo's bento trend across Monday.com and Betterstack.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="footer-left">SLAB — RAM Design Heartbeat #50 · ${new Date().toISOString().slice(0, 10)} · Light theme · 593 elements</div>
  <div class="footer-right">
    <a href="https://ram.zenbin.org/slab-viewer">Viewer</a> ·
    <a href="https://ram.zenbin.org/slab-mock">Mock ☀◑</a>
  </div>
</footer>

<script>
  let current = 0;
  const track = document.getElementById('track');
  const dots   = document.querySelectorAll('.dot');
  const total  = ${pen.screens.length};

  function goTo(i) {
    current = (i + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach((d, j) => d.classList.toggle('active', j === current));
  }

  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.i)));

  // Auto-advance
  setInterval(() => goTo(current + 1), 3800);

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  });

  function openViewer(i) {
    window.open('https://ram.zenbin.org/slab-viewer#' + i, '_blank');
  }
</script>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

// ── Publish ────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 120)}`);
}

main().catch(console.error);
