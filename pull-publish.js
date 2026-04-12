'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'pull';
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

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

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#0B0D12',
  surface: '#111520',
  card:    '#181D2C',
  card2:   '#1E2436',
  acc:     '#4F9EFF',
  acc2:    '#8B5CF6',
  acc3:    '#34D399',
  text:    '#E2E8F8',
  textDim: '#8899BB',
  orange:  '#FB923C',
  red:     '#F87171',
  border:  'rgba(226,232,248,0.08)',
};

// ── Build SVG data URIs ───────────────────────────────────────────────────────
const screenSvgs = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
});

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PULL — AI code review, at team velocity</title>
<style>
  :root {
    --bg:     ${C.bg};
    --surf:   ${C.surface};
    --card:   ${C.card};
    --card2:  ${C.card2};
    --acc:    ${C.acc};
    --acc2:   ${C.acc2};
    --acc3:   ${C.acc3};
    --text:   ${C.text};
    --dim:    ${C.textDim};
    --red:    ${C.red};
    --orange: ${C.orange};
    --border: ${C.border};
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* Aurora glow layers */
  .aurora {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 0; overflow: hidden;
  }
  .aurora-blob {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.07;
  }
  .aurora-blob.a { width: 600px; height: 600px; top: -200px; right: -100px; background: var(--acc2); }
  .aurora-blob.b { width: 400px; height: 400px; top: 300px; left: -150px; background: var(--acc); }
  .aurora-blob.c { width: 500px; height: 500px; top: 800px; right: 50px; background: var(--acc3); opacity: 0.04; }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: rgba(11,13,18,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-size: 16px; font-weight: 800; letter-spacing: 0.12em;
    color: var(--text);
    display: flex; align-items: center; gap: 8px;
  }
  .nav-logo .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--acc); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .nav-links { display: flex; gap: 24px; align-items: center; }
  .nav-links a { text-decoration: none; color: var(--dim); font-size: 13px; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    padding: 8px 20px; border-radius: 8px; background: var(--acc);
    color: var(--bg); font-size: 13px; font-weight: 700;
    text-decoration: none; letter-spacing: -0.01em;
    transition: opacity .2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* Sections */
  section { position: relative; z-index: 1; }
  .container { max-width: 1100px; margin: 0 auto; padding: 0 40px; }

  /* Hero */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 120px 40px 80px;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 20px;
    background: rgba(79,158,255,0.12); border: 1px solid rgba(79,158,255,0.25);
    color: var(--acc); font-size: 12px; font-weight: 600;
    letter-spacing: 0.06em; margin-bottom: 28px;
  }
  .hero-badge .hb-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--acc); }
  h1 {
    font-size: clamp(52px, 8vw, 88px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.05;
    margin-bottom: 20px;
  }
  h1 .grad {
    background: linear-gradient(135deg, var(--acc) 0%, var(--acc2) 60%, var(--acc3) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    font-size: 20px; color: var(--dim); line-height: 1.6;
    max-width: 560px; margin: 0 auto 40px;
    font-weight: 400;
  }
  .hero-actions { display: flex; gap: 16px; justify-content: center; margin-bottom: 64px; }
  .btn-primary {
    padding: 14px 32px; border-radius: 10px;
    background: var(--acc); color: var(--bg);
    font-size: 15px; font-weight: 700;
    text-decoration: none; letter-spacing: -0.01em;
    transition: transform .2s, opacity .2s;
  }
  .btn-primary:hover { transform: translateY(-1px); opacity: 0.9; }
  .btn-secondary {
    padding: 14px 32px; border-radius: 10px;
    background: var(--card); color: var(--text);
    font-size: 15px; font-weight: 600;
    text-decoration: none; border: 1px solid var(--border);
    transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: rgba(226,232,248,0.2); }

  /* Screen carousel */
  .carousel {
    display: flex; gap: 20px;
    overflow-x: auto; scroll-snap-type: x mandatory;
    scrollbar-width: none; padding: 0 20px;
    width: 100%; max-width: 1100px;
  }
  .carousel::-webkit-scrollbar { display: none; }
  .carousel-card {
    flex: 0 0 auto; scroll-snap-align: center;
    width: 280px; border-radius: 24px;
    overflow: hidden; border: 1px solid var(--border);
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    transition: transform .3s;
    cursor: pointer;
  }
  .carousel-card:hover { transform: translateY(-6px) scale(1.02); }
  .carousel-card img { width: 100%; display: block; }
  .carousel-label {
    padding: 10px 16px;
    background: var(--card);
    font-size: 11px; font-weight: 600;
    color: var(--dim); letter-spacing: 0.06em;
    border-top: 1px solid var(--border);
  }

  /* Stats bar */
  .stats-bar {
    padding: 32px 40px;
    background: var(--surf);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .stats-bar .container { display: flex; gap: 0; }
  .stat {
    flex: 1; text-align: center;
    padding: 12px 0;
    border-right: 1px solid var(--border);
  }
  .stat:last-child { border-right: none; }
  .stat-val { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--acc); }
  .stat-label { font-size: 12px; color: var(--dim); margin-top: 4px; font-weight: 500; }

  /* Features — bento grid */
  .features { padding: 100px 40px; }
  .features-header { text-align: center; margin-bottom: 64px; }
  .features-header h2 { font-size: 40px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 12px; }
  .features-header p { color: var(--dim); font-size: 16px; max-width: 480px; margin: 0 auto; }

  /* BENTO GRID — inspired by saaspo.com bento layouts */
  .bento {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: 16px;
    max-width: 1100px; margin: 0 auto;
  }
  .bento-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    position: relative; overflow: hidden;
    transition: border-color .2s, transform .2s;
  }
  .bento-card:hover { border-color: rgba(226,232,248,0.15); transform: translateY(-2px); }
  .bento-card.wide { grid-column: span 2; }
  .bento-card.tall { grid-row: span 2; }
  .bento-card .card-glow {
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    filter: blur(60px); opacity: 0.1;
    pointer-events: none;
  }
  .bento-card .card-icon {
    font-size: 24px; margin-bottom: 16px; display: block;
  }
  .bento-card h3 { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
  .bento-card p { font-size: 14px; color: var(--dim); line-height: 1.6; }
  .bento-card .tag {
    display: inline-block; padding: 4px 10px; border-radius: 6px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
    margin-top: 16px;
  }
  .tag-blue { background: rgba(79,158,255,0.15); color: var(--acc); }
  .tag-purple { background: rgba(139,92,246,0.15); color: var(--acc2); }
  .tag-green { background: rgba(52,211,153,0.15); color: var(--acc3); }

  /* Mini code block */
  .mini-diff {
    margin-top: 20px;
    background: var(--card2);
    border-radius: 10px;
    padding: 14px 16px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 11px;
    line-height: 1.8;
    border: 1px solid var(--border);
  }
  .diff-add { color: var(--acc3); }
  .diff-del { color: var(--red); }
  .diff-ctx { color: var(--dim); }
  .diff-ai  { color: var(--acc2); }

  /* Palette */
  .palette-section { padding: 80px 40px; background: var(--surf); border-top: 1px solid var(--border); }
  .palette-section h2 { font-size: 32px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 40px; text-align: center; }
  .palette-swatches { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; max-width: 800px; margin: 0 auto; }
  .swatch {
    width: 100px; border-radius: 12px; overflow: hidden;
    border: 1px solid var(--border);
  }
  .swatch-color { height: 64px; }
  .swatch-label { padding: 8px; text-align: center; font-size: 10px; font-weight: 600; letter-spacing: 0.04em; color: var(--dim); background: var(--card); }

  /* Footer */
  footer {
    padding: 40px; border-top: 1px solid var(--border);
    text-align: center;
  }
  footer .footer-logo { font-size: 20px; font-weight: 800; letter-spacing: 0.1em; color: var(--dim); margin-bottom: 12px; }
  footer p { font-size: 13px; color: var(--dim); opacity: 0.6; line-height: 1.7; }
  footer a { color: var(--acc); text-decoration: none; }

  @media (max-width: 768px) {
    .bento { grid-template-columns: 1fr; }
    .bento-card.wide { grid-column: span 1; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    h1 { font-size: 42px; }
  }
</style>
</head>
<body>

<div class="aurora">
  <div class="aurora-blob a"></div>
  <div class="aurora-blob b"></div>
  <div class="aurora-blob c"></div>
</div>

<nav>
  <div class="nav-logo">
    <div class="dot"></div>
    PULL
  </div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
    <a href="https://ram.zenbin.org/pull-viewer">View Design ↗</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/pull-mock">Live Mock →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-badge">
    <div class="hb-dot"></div>
    HEARTBEAT #100 · DARK THEME
  </div>
  <h1>AI code review,<br><span class="grad">at team velocity</span></h1>
  <p class="hero-sub">PULL brings AI-powered analysis to every pull request — catching issues, measuring quality, and keeping your team in flow.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/pull-mock">Interactive Mock ↗</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/pull-viewer">View in Pencil ↗</a>
  </div>

  <!-- Screen carousel -->
  <div class="carousel">
    ${screenSvgs.map((src, i) => `
    <div class="carousel-card">
      <img src="${src}" alt="${pen.screens[i].name}" loading="lazy">
      <div class="carousel-label">${pen.screens[i].name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="container">
    <div class="stat"><div class="stat-val">6</div><div class="stat-label">Screens</div></div>
    <div class="stat"><div class="stat-val">538</div><div class="stat-label">Elements</div></div>
    <div class="stat"><div class="stat-val">#100</div><div class="stat-label">Heartbeat</div></div>
    <div class="stat"><div class="stat-val">Dark</div><div class="stat-label">Theme</div></div>
  </div>
</div>

<!-- FEATURES — BENTO GRID (saaspo.com pattern) -->
<section class="features" id="features">
  <div class="container">
    <div class="features-header">
      <h2>Every review, elevated</h2>
      <p>From dashboard to diff — PULL gives your team the signal, not the noise.</p>
    </div>
    <div class="bento">

      <!-- Wide card: AI Analysis -->
      <div class="bento-card wide">
        <div class="card-glow" style="background:${C.acc2}"></div>
        <span class="card-icon">◈</span>
        <h3>AI Review Analysis</h3>
        <p>Every PR gets a real-time AI audit — quality score, security scan, and line-level annotations before a human even opens the diff.</p>
        <div class="mini-diff">
          <div class="diff-ai">◈ AI Analysis · Score: 8.4 / 10</div>
          <div class="diff-add">● Good separation of concerns</div>
          <div class="diff-add">● Webhook validation is robust</div>
          <div class="diff-del">● API key exposed in test fixtures — critical</div>
          <div class="diff-ctx">  → Auto-fix suggestion available</div>
        </div>
        <span class="tag tag-purple">AI POWERED</span>
      </div>

      <!-- Tall card: Bento Dashboard -->
      <div class="bento-card tall">
        <div class="card-glow" style="background:${C.acc}"></div>
        <span class="card-icon">⌘</span>
        <h3>Bento Dashboard</h3>
        <p>A mosaic of metrics — open PRs, coverage, cycle time, AI quality scores — each in its own panel. Inspired by the bento grid layouts taking over SaaS design in 2026.</p>
        <p style="margin-top:12px">Elevation through shade steps, not shadows. Each card layer sits at a precise dark value — <code style="color:${C.acc};font-size:12px">#0B0D12 → #111520 → #181D2C</code> — creating depth you feel without seeing.</p>
        <span class="tag tag-blue">BENTO GRID</span>
      </div>

      <!-- Card: PR Queue -->
      <div class="bento-card">
        <div class="card-glow" style="background:${C.acc3}"></div>
        <span class="card-icon">⇄</span>
        <h3>Smart PR Queue</h3>
        <p>Filterable by author, state, and AI score. Stale PRs surface automatically with a red accent — never lose a 3-day-old review.</p>
        <span class="tag tag-green">REAL-TIME</span>
      </div>

      <!-- Card: Review Feed -->
      <div class="bento-card">
        <div class="card-glow" style="background:${C.acc}"></div>
        <span class="card-icon">◎</span>
        <h3>Live Review Feed</h3>
        <p>A timestamped activity stream of every approval, flag, comment, and merge — human and AI interleaved on the same timeline.</p>
        <span class="tag tag-blue">LIVE UPDATES</span>
      </div>

      <!-- Card: Team Stats -->
      <div class="bento-card">
        <div class="card-glow" style="background:${C.acc2}"></div>
        <span class="card-icon">◉</span>
        <h3>Team Leaderboard</h3>
        <p>Merge counts, review coverage, and AI quality scores per contributor. Rank-ordered with a visual bar that fills to capacity with each week's output.</p>
        <span class="tag tag-purple">TEAM METRICS</span>
      </div>

    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section" id="palette">
  <h2>Design System</h2>
  <div class="palette-swatches">
    ${[
      ['Background', C.bg],
      ['Surface', C.surface],
      ['Card', C.card],
      ['Electric Blue', C.acc],
      ['Violet', C.acc2],
      ['Mint', C.acc3],
      ['Dim Text', C.textDim],
    ].map(([label, color]) => `
    <div class="swatch">
      <div class="swatch-color" style="background:${color}"></div>
      <div class="swatch-label">${label}<br>${color}</div>
    </div>`).join('')}
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">PULL</div>
  <p>
    Heartbeat #100 · RAM Design AI · 10 April 2026<br>
    Inspired by <a href="https://www.darkmodedesign.com">darkmodedesign.com</a> (Linear aesthetic) &amp; <a href="https://saaspo.com">saaspo.com</a> (bento grid layouts)<br><br>
    <a href="https://ram.zenbin.org/pull-viewer">Pencil Viewer</a> · <a href="https://ram.zenbin.org/pull-mock">Interactive Mock</a>
  </p>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'PULL — AI code review, at team velocity');
  console.log(`Hero: ${r1.status}`, r1.status >= 400 ? r1.body.slice(0, 200) : 'OK');

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'PULL — Pencil Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status >= 400 ? r2.body.slice(0, 200) : 'OK');
}

main().catch(console.error);
