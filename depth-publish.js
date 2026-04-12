'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'depth';
const APP_NAME = 'DEPTH';
const TAGLINE = 'AI organizational memory for engineering teams';

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

// ─── Hero Page ─────────────────────────────────────────────────────────────────
const C = pen.metadata.palette;

function svgDataUri(screenIdx) {
  const svg = pen.screens[screenIdx].svg;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${C.bg};
    --surf: ${C.surf};
    --card: ${C.card};
    --accent: ${C.accent};
    --accent2: ${C.accent2};
    --accent3: ${C.accent3};
    --text: ${C.text};
    --mid: ${C.textMid};
    --dim: ${C.textDim};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: ${C.bg}ee;
    backdrop-filter: blur(16px);
    border-bottom: 1px solid ${C.line ?? '#1E2035'};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 60px;
  }
  .logo { font-size: 18px; font-weight: 900; letter-spacing: -0.5px; color: var(--text); }
  .logo span { color: var(--accent); }
  nav a { color: var(--mid); text-decoration: none; font-size: 14px; margin-left: 28px; transition: color .2s; }
  nav a:hover { color: var(--accent); }
  .nav-cta {
    background: var(--accent); color: var(--bg) !important;
    padding: 8px 18px; border-radius: 20px; font-weight: 600;
    margin-left: 24px !important;
  }

  /* ── Hero ── */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 100px 24px 60px;
    position: relative; overflow: hidden;
  }
  .hero-glow {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -60%);
    width: 600px; height: 600px;
    background: radial-gradient(circle, ${C.accent}18 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-glow2 {
    position: absolute; top: 30%; left: 20%;
    width: 300px; height: 300px;
    background: radial-gradient(circle, ${C.accent2}0e 0%, transparent 70%);
    pointer-events: none;
  }
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: ${C.accent}18; border: 1px solid ${C.accent}44;
    color: var(--accent); border-radius: 20px;
    padding: 6px 14px; font-size: 11px; font-weight: 700;
    letter-spacing: 1.2px; margin-bottom: 28px; text-transform: uppercase;
  }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  h1 {
    font-size: clamp(42px, 7vw, 80px);
    font-weight: 900; letter-spacing: -2px;
    line-height: 1.05;
    background: linear-gradient(135deg, var(--text) 0%, var(--accent) 60%, var(--accent2) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    max-width: 820px; margin-bottom: 20px;
  }
  .hero p {
    font-size: clamp(16px, 2.5vw, 20px); color: var(--mid);
    max-width: 560px; margin: 0 auto 40px; font-weight: 400;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-bottom: 56px; }
  .btn-primary {
    background: var(--accent); color: var(--bg);
    padding: 14px 28px; border-radius: 30px;
    font-size: 15px; font-weight: 700;
    text-decoration: none; transition: all .2s;
    box-shadow: 0 0 32px ${C.accent}44;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 48px ${C.accent}66; }
  .btn-secondary {
    background: transparent; color: var(--text);
    padding: 14px 28px; border-radius: 30px;
    border: 1px solid ${C.line ?? '#1E2035'};
    font-size: 15px; font-weight: 600;
    text-decoration: none; transition: all .2s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Screen carousel ── */
  .screens-section {
    padding: 0 24px 80px; max-width: 1100px; margin: 0 auto;
  }
  .screens-label {
    text-align: center; font-size: 11px; font-weight: 700;
    letter-spacing: 2px; color: var(--dim); text-transform: uppercase;
    margin-bottom: 36px;
  }
  .screens-grid {
    display: flex; gap: 20px; overflow-x: auto;
    padding-bottom: 16px; scroll-snap-type: x mandatory;
    -ms-overflow-style: none; scrollbar-width: none;
  }
  .screens-grid::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 220px; scroll-snap-align: center;
    background: var(--surf);
    border: 1px solid ${C.line ?? '#1E2035'};
    border-radius: 20px; overflow: hidden;
    transition: all .3s;
  }
  .screen-card:hover {
    border-color: var(--accent);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px ${C.accent}22;
  }
  .screen-card img { width: 100%; display: block; }
  .screen-label {
    padding: 12px 16px; font-size: 12px; font-weight: 600;
    color: var(--mid); text-align: center;
  }

  /* ── Features ── */
  .features {
    padding: 80px 24px;
    max-width: 1100px; margin: 0 auto;
  }
  .section-header { text-align: center; margin-bottom: 56px; }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    color: var(--accent); text-transform: uppercase; margin-bottom: 12px;
  }
  .section-title {
    font-size: clamp(28px, 4vw, 44px); font-weight: 800;
    letter-spacing: -1px; line-height: 1.2;
  }
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 768px) { .bento-grid { grid-template-columns: 1fr; } }
  .bento-card {
    background: var(--surf);
    border: 1px solid ${C.line ?? '#1E2035'};
    border-radius: 16px; padding: 28px;
    transition: all .3s;
  }
  .bento-card:hover { border-color: ${C.accent}66; transform: translateY(-2px); }
  .bento-card.wide { grid-column: span 2; }
  .bento-card.accent { border-color: ${C.accent}44; background: ${C.accent}0a; }
  .bento-icon {
    font-size: 24px; margin-bottom: 16px;
    width: 48px; height: 48px;
    background: ${C.accent}18; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .bento-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .bento-desc { font-size: 14px; color: var(--mid); line-height: 1.6; }
  .bento-stat { font-size: 36px; font-weight: 900; color: var(--accent); margin-bottom: 4px; }
  .bento-stat-label { font-size: 13px; color: var(--dim); }

  /* ── Palette ── */
  .palette-section {
    padding: 60px 24px;
    max-width: 1100px; margin: 0 auto; text-align: center;
  }
  .swatches { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 28px; }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .swatch-block {
    width: 60px; height: 60px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .swatch-name { font-size: 10px; color: var(--dim); }
  .swatch-hex { font-size: 11px; color: var(--mid); font-family: monospace; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid ${C.line ?? '#1E2035'};
    padding: 40px 24px; text-align: center;
    color: var(--dim); font-size: 13px;
  }
  footer a { color: var(--accent); text-decoration: none; }
  .footer-links { display: flex; gap: 20px; justify-content: center; margin-bottom: 16px; }
</style>
</head>
<body>

<nav>
  <div class="logo">DEP<span>✦</span>TH</div>
  <div>
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/depth-viewer">Prototype</a>
    <a href="https://ram.zenbin.org/depth-mock" class="nav-cta">Interactive Mock ☀◑</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>
  <div class="badge">
    <div class="badge-dot"></div>
    RAM Design Heartbeat #331 — Dark
  </div>
  <h1>Your team's decisions,<br>captured automatically</h1>
  <p>DEPTH is an AI organizational memory layer that silently captures what your engineering team knows — and surfaces it the moment you need it.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/depth-viewer" class="btn-primary">View Prototype →</a>
    <a href="https://ram.zenbin.org/depth-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-label">6 screens — mobile first</div>
  <div class="screens-grid">
    ${pen.screens.map((sc, i) => `
    <div class="screen-card">
      <img src="${svgDataUri(i)}" alt="${sc.name}" loading="lazy">
      <div class="screen-label">${sc.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <div class="section-header">
    <div class="section-label">✦ What DEPTH does</div>
    <h2 class="section-title">Ambient intelligence<br>for engineering teams</h2>
  </div>
  <div class="bento-grid">
    <div class="bento-card accent wide">
      <div class="bento-icon">✦</div>
      <div class="bento-title">AI Query Engine</div>
      <div class="bento-desc">Ask anything about your team's history in plain English. "Why did we choose Clerk?" → DEPTH surfaces the exact decision, participants, and reasoning captured at the time.</div>
    </div>
    <div class="bento-card">
      <div class="bento-stat">518</div>
      <div class="bento-stat-label">Context captures per day</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🧠</div>
      <div class="bento-title">Auto-Capture</div>
      <div class="bento-desc">Passively monitors Slack, Linear, GitHub, and Notion. No manual input required.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◈</div>
      <div class="bento-title">Knowledge Graph</div>
      <div class="bento-desc">See how decisions, PRs, discussions, and runbooks connect across your whole team.</div>
    </div>
    <div class="bento-card">
      <div class="bento-stat">84</div>
      <div class="bento-stat-label">Avg. team health score</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">📋</div>
      <div class="bento-title">Auto-Generated Runbooks</div>
      <div class="bento-desc">DEPTH converts captured context into living documentation — automatically updated as your system evolves.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">Palette — Dark / AI Intelligence</div>
  <p style="color:var(--dim);font-size:14px;margin-top:8px;">Indigo-lavender accent on deep navy-black — inspired by the AI SaaS category explosion on Saaspo</p>
  <div class="swatches">
    ${[
      { name: 'Background', hex: C.bg },
      { name: 'Surface', hex: C.surf },
      { name: 'Card', hex: C.card },
      { name: 'Accent', hex: C.accent },
      { name: 'Accent 2', hex: C.accent2 },
      { name: 'Accent 3', hex: C.accent3 },
      { name: 'Text', hex: C.text },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-block" style="background:${s.hex}"></div>
      <div class="swatch-name">${s.name}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/depth-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/depth-mock">Interactive Mock ☀◑</a>
  </div>
  RAM Design Heartbeat #331 · April 8, 2026 · Inspired by Limitless.ai on Godly + Saaspo AI SaaS trends
</footer>

</body>
</html>`;

// ─── Viewer Page ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 120) : '✓');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 120) : '✓');
}

main().catch(console.error);
