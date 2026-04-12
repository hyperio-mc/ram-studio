'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'brume';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ── Render SVG thumbnails ─────────────────────────────────────────────────────
function renderScreenSvg(screen) {
  const W = screen.width || 390;
  const H = screen.height || 844;
  let svgEls = '';
  for (const el of screen.elements) {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const op = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke || 'none';
      const sw = el.strokeWidth || 0;
      svgEls += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${el.fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
    } else if (el.type === 'text') {
      const fw = el.fontWeight || '400';
      const fs = el.fontSize || 12;
      const ff = el.fontFamily || 'Georgia, serif';
      const anchor = el.textAnchor || 'start';
      const op = el.opacity !== undefined ? el.opacity : 1;
      const ls = el.letterSpacing || 0;
      const content = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgEls += `<text x="${el.x}" y="${el.y}" font-size="${fs}" font-weight="${fw}" font-family="${ff}" fill="${el.fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${op}">${content}</text>`;
    } else if (el.type === 'circle') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke || 'none';
      const sw = el.strokeWidth || 0;
      svgEls += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
    } else if (el.type === 'line') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      const sw = el.strokeWidth || 1;
      svgEls += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${sw}" opacity="${op}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#F8F4EE"/>${svgEls}</svg>`;
}

const screenSvgs = pen.screens.map(s => {
  const svgStr = renderScreenSvg(s);
  return `data:image/svg+xml;base64,${Buffer.from(svgStr).toString('base64')}`;
});

const screenNames = pen.screens.map(s => s.name);

// ── Hero HTML — warm editorial light theme ────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BRUME — Your creative studio, at rest</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F8F4EE;
    --surf: #FFFFFF;
    --card: #F0EAE0;
    --border: #E4DDD4;
    --acc: #C75D3A;
    --acc2: #4B7BAB;
    --acc-lt: #FCE8E0;
    --green: #3B7D5B;
    --green-lt: #DCF0E5;
    --text: #1D1916;
    --mid: #7A6D66;
    --divid: #E4DDD4;
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(248,244,238,0.88);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 700;
    color: var(--text); letter-spacing: -0.01em;
  }
  .nav-logo span { color: var(--acc); }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a {
    font-size: 13px; color: var(--mid);
    text-decoration: none; font-weight: 500;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--acc) !important;
    color: #fff !important;
    padding: 8px 20px; border-radius: 8px;
    font-weight: 600 !important; font-size: 13px !important;
    transition: opacity 0.2s !important;
  }
  .nav-cta:hover { opacity: 0.85 !important; }

  /* hero */
  .hero {
    padding: 140px 40px 80px;
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
  }
  .hero-eyebrow {
    font-size: 11px; font-weight: 600; color: var(--acc);
    letter-spacing: 2px; text-transform: uppercase;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 24px;
  }
  .hero-eyebrow::before {
    content: ''; display: inline-block;
    width: 28px; height: 1px; background: var(--acc);
  }
  h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 4.5vw, 62px);
    font-weight: 700; line-height: 1.08;
    letter-spacing: -0.02em; margin-bottom: 22px;
    color: var(--text);
  }
  h1 em { font-style: italic; color: var(--acc); }
  .hero-sub {
    font-size: 17px; line-height: 1.7;
    color: var(--mid); margin-bottom: 40px;
    max-width: 460px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .btn-primary {
    background: var(--acc); color: #fff;
    border: none; cursor: pointer;
    padding: 14px 30px; border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover { opacity: 0.88; box-shadow: 0 8px 32px rgba(199,93,58,0.22); }
  .btn-secondary {
    background: transparent; color: var(--mid);
    border: 1.5px solid var(--border); cursor: pointer;
    padding: 14px 30px; border-radius: 10px;
    font-size: 14px; font-weight: 500;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--mid); color: var(--text); }

  /* screen showcase */
  .screens-showcase {
    position: relative;
    display: flex; gap: 16px; align-items: flex-end;
    justify-content: flex-end;
  }
  .screen-frame {
    background: var(--surf);
    border-radius: 28px;
    border: 1px solid var(--border);
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(29,25,22,0.10), 0 4px 12px rgba(29,25,22,0.06);
    transition: transform 0.3s;
  }
  .screen-frame:hover { transform: translateY(-4px); }
  .screen-frame img { display: block; width: 100%; }
  .sf-main { width: 200px; }
  .sf-side { width: 160px; opacity: 0.85; }
  .sf-back { width: 130px; opacity: 0.65; position: absolute; right: 340px; bottom: -20px; }

  /* section */
  section { max-width: 1200px; margin: 0 auto; padding: 80px 40px; }
  .section-label {
    font-size: 11px; font-weight: 600; color: var(--acc);
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-label::before {
    content: ''; width: 20px; height: 1px; background: var(--acc);
  }
  h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 700; line-height: 1.15;
    letter-spacing: -0.02em; color: var(--text);
    margin-bottom: 16px;
  }
  .section-sub {
    font-size: 16px; line-height: 1.7; color: var(--mid);
    max-width: 520px; margin-bottom: 56px;
  }

  /* divider */
  .divider {
    border: none;
    border-top: 1px solid var(--divid);
    max-width: 1200px; margin: 0 auto;
  }

  /* features */
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
  }
  .feature-card {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 32px;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .feature-card:hover {
    box-shadow: 0 12px 40px rgba(29,25,22,0.08);
    transform: translateY(-2px);
  }
  .feature-icon {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 20px;
  }
  .fi-acc { background: var(--acc-lt); }
  .fi-acc2 { background: #DDE8F3; }
  .fi-green { background: var(--green-lt); }
  .feature-card h3 {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 600; margin-bottom: 10px; color: var(--text);
  }
  .feature-card p { font-size: 14px; line-height: 1.65; color: var(--mid); }

  /* all screens grid */
  .screens-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  .screen-card {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: 18px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(29,25,22,0.06);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .screen-card:hover {
    box-shadow: 0 16px 48px rgba(29,25,22,0.12);
    transform: translateY(-3px);
  }
  .screen-card img { display: block; width: 100%; }
  .screen-card-label {
    padding: 12px 16px;
    font-size: 12px; font-weight: 600; color: var(--mid);
    border-top: 1px solid var(--border);
    letter-spacing: 0.04em; text-transform: uppercase;
  }

  /* palette swatches */
  .palette-strip {
    display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px;
    align-items: center;
  }
  .swatch {
    width: 52px; height: 52px; border-radius: 10px;
    border: 1px solid rgba(0,0,0,0.06);
    position: relative; cursor: default;
    transition: transform 0.15s;
  }
  .swatch:hover { transform: scale(1.05); }
  .swatch-label {
    font-size: 9px; color: var(--mid);
    margin-top: 6px; text-align: center;
    letter-spacing: 0.03em; font-family: monospace;
  }
  .swatch-group { display: flex; flex-direction: column; align-items: center; }

  /* stats band */
  .stats-band {
    background: var(--card);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .stats-inner {
    max-width: 1200px; margin: 0 auto;
    padding: 56px 40px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 40px; text-align: center;
  }
  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 40px; font-weight: 700;
    color: var(--text); line-height: 1;
    margin-bottom: 8px;
  }
  .stat-num span { color: var(--acc); }
  .stat-label { font-size: 13px; color: var(--mid); font-weight: 500; }

  /* quote */
  .quote-section {
    background: var(--acc);
    padding: 80px 40px;
  }
  .quote-inner {
    max-width: 760px; margin: 0 auto; text-align: center;
  }
  .quote-mark {
    font-family: 'Playfair Display', serif;
    font-size: 80px; color: rgba(255,255,255,0.2);
    line-height: 0.5; margin-bottom: 32px;
  }
  .quote-text {
    font-family: 'Playfair Display', serif;
    font-size: clamp(20px, 2.5vw, 28px);
    font-weight: 400; line-height: 1.5;
    color: #fff; margin-bottom: 28px;
    font-style: italic;
  }
  .quote-attr {
    font-size: 13px; color: rgba(255,255,255,0.65);
    font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;
  }

  /* CTA section */
  .cta-section {
    padding: 100px 40px;
    text-align: center; max-width: 680px; margin: 0 auto;
  }
  .cta-section h2 { text-align: center; margin-bottom: 16px; }
  .cta-section .section-sub { margin: 0 auto 40px; text-align: center; }
  .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  /* footer */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px;
    display: flex; align-items: center; justify-content: space-between;
    max-width: 1200px; margin: 0 auto;
  }
  .footer-logo {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 700; color: var(--mid);
  }
  .footer-logo span { color: var(--acc); }
  .footer-meta {
    font-size: 12px; color: var(--mid);
    display: flex; gap: 24px;
  }
  .footer-meta a { color: var(--mid); text-decoration: none; }
  .footer-meta a:hover { color: var(--acc); }
  .footer-ram {
    font-size: 11px; color: var(--mid);
    font-style: italic;
  }
  .footer-ram a { color: var(--acc); text-decoration: none; }

  /* responsive */
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 48px; padding-top: 100px; }
    .screens-showcase { justify-content: center; }
    .sf-back { display: none; }
    .features-grid { grid-template-columns: 1fr 1fr; }
    .screens-grid { grid-template-columns: 1fr 1fr; }
    .stats-inner { grid-template-columns: 1fr 1fr; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
  }
  @media (max-width: 600px) {
    .features-grid, .screens-grid, .stats-inner { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">BR<span>U</span>ME</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/brume-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/brume-mock" class="nav-cta">Try Mock →</a>
  </div>
</nav>

<!-- Hero -->
<div class="hero">
  <div>
    <div class="hero-eyebrow">Heartbeat #390 · Light · Creative Studio</div>
    <h1>Your studio,<br><em>always</em><br>in composure.</h1>
    <p class="hero-sub">
      BRUME is a calm workspace for independent creative studios —
      projects, clients, timeline, and finances in one warm editorial view.
      No noise. Just clarity.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/brume-mock" class="btn-primary">Open Interactive Mock</a>
      <a href="https://ram.zenbin.org/brume-viewer" class="btn-secondary">View in Pencil Viewer</a>
    </div>
  </div>
  <div class="screens-showcase">
    <div class="screen-frame sf-back">
      <img src="${screenSvgs[3]}" alt="${screenNames[3]}" loading="lazy"/>
    </div>
    <div class="screen-frame sf-side">
      <img src="${screenSvgs[1]}" alt="${screenNames[1]}" loading="lazy"/>
    </div>
    <div class="screen-frame sf-main">
      <img src="${screenSvgs[0]}" alt="${screenNames[0]}" loading="lazy"/>
    </div>
  </div>
</div>

<!-- Stats Band -->
<div class="stats-band">
  <div class="stats-inner">
    <div>
      <div class="stat-num">6<span>.</span></div>
      <div class="stat-label">Screens Designed</div>
    </div>
    <div>
      <div class="stat-num">497<span>.</span></div>
      <div class="stat-label">Design Elements</div>
    </div>
    <div>
      <div class="stat-num">#390<span>.</span></div>
      <div class="stat-label">Heartbeat Run</div>
    </div>
    <div>
      <div class="stat-num">☀<span>.</span></div>
      <div class="stat-label">Light Editorial Theme</div>
    </div>
  </div>
</div>

<hr class="divider"/>

<!-- Features -->
<section id="features">
  <div class="section-label">What's Inside</div>
  <h2>Every part of your studio,<br>held in one place.</h2>
  <p class="section-sub">
    From morning stand-up to end-of-month invoicing — BRUME keeps it all in view
    without the clutter.
  </p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon fi-acc">⌂</div>
      <h3>Studio Hub</h3>
      <p>Good-morning dashboard with active projects, task checklist, and revenue at a glance. Starts every day calm and clear.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-acc2">◫</div>
      <h3>Projects Board</h3>
      <p>Track each project's progress, budget, and deadline in card view. Colour-coded by client and status at a glance.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-green">◎</div>
      <h3>Client Relations</h3>
      <p>Know your client relationships at a glance — health status, total spend, and contacts, searchable in seconds.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-acc">◷</div>
      <h3>Day Timeline</h3>
      <p>Visual calendar with project-colour-coded time blocks. Design hours, meetings, and admin in a single vertical view.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-acc2">◈</div>
      <h3>Finances</h3>
      <p>Revenue hero card, invoice list with status pills, and monthly trend bars — all in one scroll.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-green">◑</div>
      <h3>Studio Insights</h3>
      <p>Utilisation rate, average project value, client retention, and hours tracked — your studio's quiet performance report.</p>
    </div>
  </div>
</section>

<hr class="divider"/>

<!-- All Screens -->
<section id="screens">
  <div class="section-label">6 Screens</div>
  <h2>The full design, spread out.</h2>
  <p class="section-sub">
    Designed mobile-first at 390×844. Every screen builds on the warm cream editorial system.
  </p>
  <div class="screens-grid">
    ${screenSvgs.map((uri, i) => `
    <div class="screen-card">
      <img src="${uri}" alt="${screenNames[i]}" loading="lazy"/>
      <div class="screen-card-label">${String(i+1).padStart(2,'0')} — ${screenNames[i]}</div>
    </div>`).join('')}
  </div>
</section>

<hr class="divider"/>

<!-- Palette -->
<section id="palette">
  <div class="section-label">Colour System</div>
  <h2>Warm cream editorial.</h2>
  <p class="section-sub">
    Inspired by Land-book's "warm neutral" SaaS trend and minimal.gallery's "Pastel Confidence" pattern.
    Soft backgrounds, terracotta accent, steel blue secondary, Georgian serif.
  </p>
  <div class="palette-strip">
    ${[
      ['#F8F4EE','BG Cream'],
      ['#FFFFFF','Surface'],
      ['#F0EAE0','Card'],
      ['#E4DDD4','Border'],
      ['#C75D3A','Sienna ACC'],
      ['#4B7BAB','Steel ACC2'],
      ['#3B7D5B','Forest Green'],
      ['#B08520','Warm Amber'],
      ['#1D1916','Text'],
      ['#7A6D66','Muted'],
    ].map(([c,n]) => `
    <div class="swatch-group">
      <div class="swatch" style="background:${c}"></div>
      <div class="swatch-label">${c}</div>
      <div class="swatch-label" style="font-family:sans-serif;color:#7A6D66;font-size:9px">${n}</div>
    </div>`).join('')}
  </div>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;max-width:640px">
    <p style="font-size:13px;color:var(--mid);line-height:1.7">
      <strong style="color:var(--text)">Typography:</strong> Playfair Display for display/editorial headlines (weight 700, tracking −0.02em),
      Inter for UI labels and body (weight 400–600). The serif revival in tech UI observed on
      minimal.gallery and saaspo was the direct inspiration — warmth and authority without coldness.
    </p>
  </div>
</section>

<!-- Quote -->
<div class="quote-section">
  <div class="quote-inner">
    <div class="quote-mark">"</div>
    <p class="quote-text">A quiet month builds a loud quarter.</p>
    <p class="quote-attr">RAM Design Heartbeat #390 · April 2026</p>
  </div>
</div>

<!-- CTA -->
<div style="background:var(--bg);padding:0 40px">
  <div class="cta-section">
    <div class="section-label" style="justify-content:center">Explore</div>
    <h2>See it in motion.</h2>
    <p class="section-sub">
      Try the interactive Svelte mock with built-in light/dark toggle,
      or open the Pencil Viewer to inspect every element.
    </p>
    <div class="cta-actions">
      <a href="https://ram.zenbin.org/brume-mock" class="btn-primary">Interactive Mock ☀◑</a>
      <a href="https://ram.zenbin.org/brume-viewer" class="btn-secondary">Pencil Viewer</a>
    </div>
  </div>
</div>

<footer>
  <div class="footer-logo">BR<span>U</span>ME</div>
  <div class="footer-meta">
    <a href="https://ram.zenbin.org/brume-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/brume-mock">Mock</a>
    <span>6 screens · 497 elements</span>
  </div>
  <div class="footer-ram">Built by <a href="#">RAM</a> · Heartbeat #390</div>
</footer>

</body>
</html>`;

// ── Viewer ─────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'BRUME — Your creative studio, at rest');
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);
  if (r1.status !== 200 && r1.status !== 201) console.log('  body:', r1.body.slice(0,200));

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'BRUME — Viewer');
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  if (r2.status !== 200 && r2.status !== 201) console.log('  body:', r2.body.slice(0,200));
}
main().catch(console.error);
