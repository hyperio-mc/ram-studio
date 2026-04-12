'use strict';
// TORCH — publish hero + viewer to ram.zenbin.org

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'torch';
const APP  = 'TORCH';
const TAGLINE = 'Intelligence. Illuminated.';

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

// ─── Palette ──────────────────────────────────────────────────────────────
const C = {
  bg:      '#07060F',
  surf:    '#0E0C1E',
  card:    '#16132B',
  accent:  '#8B5CF6',
  accent2: '#F59E0B',
  accent3: '#22D3EE',
  text:    '#EDE9FF',
  textDim: '#9D93CC',
  green:   '#10B981',
  red:     '#F43F5E',
};

// ─── SVG screen thumbnails ─────────────────────────────────────────────────
function buildScreenSVG(screen, idx) {
  const els = screen.elements;
  let svgContent = '';

  els.forEach(el => {
    if (!el) return;
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const op = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
      svgContent += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${el.fill}" fill-opacity="${op}" ${stroke}/>\n`;
    } else if (el.type === 'text') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      const anchor = el.textAnchor || 'start';
      const fw = el.fontWeight || 400;
      const ls = el.letterSpacing || 0;
      const safe = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgContent += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" fill-opacity="${op}" text-anchor="${anchor}" font-weight="${fw}" letter-spacing="${ls}" font-family="Inter,sans-serif">${safe}</text>\n`;
    } else if (el.type === 'circle') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
      svgContent += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" fill-opacity="${op}" ${stroke}/>\n`;
    } else if (el.type === 'line') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      svgContent += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}" stroke-opacity="${op}"/>\n`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="195" height="422">${svgContent}</svg>`;
}

// ─── Hero HTML ────────────────────────────────────────────────────────────
const screenNames  = pen.screens.map(s => s.name);
const screenSVGs   = pen.screens.map((s, i) => buildScreenSVG(s, i));
const svgDataURIs  = screenSVGs.map(s => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`);

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP} — ${TAGLINE}</title>
<meta name="description" content="TORCH is an AI research intelligence platform that illuminates the signals that matter. Dark-mode mobile app — RAM Design Heartbeat #47.">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      ${C.bg};
    --surf:    ${C.surf};
    --card:    ${C.card};
    --accent:  ${C.accent};
    --accent2: ${C.accent2};
    --accent3: ${C.accent3};
    --text:    ${C.text};
    --textDim: ${C.textDim};
    --green:   ${C.green};
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Ambient background glows */
  body::before {
    content: '';
    position: fixed;
    top: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, ${C.accent}18 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  body::after {
    content: '';
    position: fixed;
    bottom: -150px; left: -150px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, ${C.accent2}10 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 64px;
    background: ${C.bg}E0;
    backdrop-filter: blur(20px);
    border-bottom: 1px solid ${C.card};
  }
  .nav-logo { font-size: 18px; font-weight: 900; letter-spacing: 4px; color: var(--text); }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { font-size: 13px; color: var(--textDim); text-decoration: none; letter-spacing: 0.5px; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    font-size: 13px; font-weight: 700; color: var(--bg);
    background: var(--accent); border: none; cursor: pointer;
    padding: 8px 20px; border-radius: 20px; letter-spacing: 0.5px;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* Hero */
  .hero {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${C.accent}18; border: 1px solid ${C.accent}40;
    padding: 6px 16px; border-radius: 20px;
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
    color: var(--accent); text-transform: uppercase;
    margin-bottom: 32px;
  }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
  .hero-title {
    font-size: clamp(52px, 12vw, 96px);
    font-weight: 900;
    letter-spacing: 8px;
    line-height: 1;
    margin-bottom: 16px;
    background: linear-gradient(135deg, var(--text) 40%, var(--accent) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-tagline {
    font-size: 18px; color: var(--textDim); letter-spacing: 2px;
    font-weight: 300; margin-bottom: 48px;
  }
  .hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 72px; }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent); color: #fff;
    font-size: 14px; font-weight: 700; letter-spacing: 0.5px;
    padding: 14px 28px; border-radius: 14px; text-decoration: none;
    transition: all 0.2s; box-shadow: 0 0 40px ${C.accent}40;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px ${C.accent}60; }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${C.card}; color: var(--textDim);
    font-size: 14px; font-weight: 600; letter-spacing: 0.5px;
    padding: 14px 28px; border-radius: 14px; text-decoration: none;
    border: 1px solid ${C.surf}; transition: all 0.2s;
  }
  .btn-secondary:hover { color: var(--text); border-color: var(--accent); }

  /* Stat pills */
  .hero-stats { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .stat-pill {
    background: var(--surf); border: 1px solid ${C.card};
    padding: 12px 20px; border-radius: 12px;
    text-align: center;
  }
  .stat-pill .val { font-size: 22px; font-weight: 800; color: var(--text); }
  .stat-pill .lbl { font-size: 11px; color: var(--textDim); letter-spacing: 1px; margin-top: 2px; }
  .stat-pill.accent .val { color: var(--accent); }
  .stat-pill.amber  .val { color: var(--accent2); }
  .stat-pill.cyan   .val { color: var(--accent3); }

  /* Screens carousel */
  .screens-section {
    position: relative; z-index: 1;
    padding: 80px 24px;
  }
  .section-label {
    text-align: center;
    font-size: 11px; font-weight: 700; letter-spacing: 3px;
    color: var(--textDim); text-transform: uppercase;
    margin-bottom: 48px;
  }
  .screens-track {
    display: flex; gap: 20px;
    overflow-x: auto; scroll-snap-type: x mandatory;
    padding: 20px 40px 40px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .screens-track::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 195px; scroll-snap-align: center;
    background: var(--surf);
    border: 1px solid ${C.card};
    border-radius: 24px; overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
  }
  .screen-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 60px ${C.accent}25; }
  .screen-card img { width: 195px; height: 422px; display: block; }
  .screen-card .sc-name {
    padding: 10px 14px; font-size: 11px; font-weight: 700;
    letter-spacing: 1px; color: var(--textDim); text-transform: uppercase;
    border-top: 1px solid ${C.card};
  }

  /* Features section */
  .features-section {
    position: relative; z-index: 1;
    padding: 80px 24px;
    max-width: 960px; margin: 0 auto;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px; margin-top: 48px;
  }
  .feature-card {
    background: var(--surf);
    border: 1px solid ${C.card};
    border-radius: 20px; padding: 28px;
    transition: border-color 0.2s;
  }
  .feature-card:hover { border-color: var(--accent); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feature-card p  { font-size: 13px; color: var(--textDim); line-height: 1.6; }

  /* Palette section */
  .palette-section {
    position: relative; z-index: 1;
    padding: 60px 24px;
    max-width: 960px; margin: 0 auto;
  }
  .palette-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
  .swatch {
    flex: 1; min-width: 100px;
    height: 72px; border-radius: 14px;
    display: flex; flex-direction: column;
    justify-content: flex-end; padding: 10px 14px;
  }
  .swatch .sw-val { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: rgba(255,255,255,0.85); }
  .swatch .sw-name { font-size: 10px; color: rgba(255,255,255,0.55); margin-top: 2px; }

  /* Inspiration banner */
  .inspiration-section {
    position: relative; z-index: 1;
    padding: 60px 24px; max-width: 960px; margin: 0 auto;
  }
  .inspiration-card {
    background: var(--surf); border: 1px solid ${C.card};
    border-radius: 20px; padding: 32px;
    border-left: 4px solid var(--accent);
  }
  .inspiration-card blockquote {
    font-size: 18px; font-weight: 500; line-height: 1.5;
    color: var(--text); margin-bottom: 16px;
    font-style: italic;
  }
  .inspiration-card cite { font-size: 12px; color: var(--accent); font-style: normal; font-weight: 700; letter-spacing: 1px; }

  /* Footer */
  footer {
    position: relative; z-index: 1;
    border-top: 1px solid ${C.card};
    padding: 40px 32px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .footer-brand { font-size: 14px; font-weight: 800; letter-spacing: 3px; }
  .footer-brand span { color: var(--accent); }
  .footer-meta { font-size: 12px; color: var(--textDim); }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 12px; color: var(--textDim); text-decoration: none; }
  .footer-links a:hover { color: var(--accent); }

  @media (max-width: 640px) {
    nav .nav-links { display: none; }
    .hero-title { letter-spacing: 4px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">T<span>●</span>RCH</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/torch-mock">View Mock ☀◑</a>
</nav>

<section class="hero">
  <div class="hero-badge">
    <div class="hero-badge-dot"></div>
    RAM Design Heartbeat #47 — Dark Theme
  </div>
  <h1 class="hero-title">TORCH</h1>
  <p class="hero-tagline">INTELLIGENCE. ILLUMINATED.</p>
  <div class="hero-ctas">
    <a class="btn-primary" href="https://ram.zenbin.org/torch-viewer">Open in Viewer →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/torch-mock">Interactive Mock ☀◑</a>
  </div>
  <div class="hero-stats">
    <div class="stat-pill accent"><div class="val">6</div><div class="lbl">Screens</div></div>
    <div class="stat-pill">     <div class="val">481</div><div class="lbl">Elements</div></div>
    <div class="stat-pill amber"><div class="val">#47</div><div class="lbl">Heartbeat</div></div>
    <div class="stat-pill cyan"> <div class="val">Dark</div><div class="lbl">Theme</div></div>
  </div>
</section>

<section class="screens-section" id="screens">
  <p class="section-label">6 Screens — Pencil.dev v2.8</p>
  <div class="screens-track">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${svgDataURIs[i]}" alt="${s.name}" loading="lazy">
      <div class="sc-name">${i + 1}. ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features-section" id="features">
  <p class="section-label">Designed Capabilities</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:${C.accent}18;">◈</div>
      <h3>Command Center</h3>
      <p>Bento-grid dashboard inspired by iOS widget layouts — trend spotted across saaspo.com and land-book.com. Asymmetric card sizing creates visual hierarchy at a glance.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${C.accent2}18;">⚡</div>
      <h3>Signal Feed</h3>
      <p>Real-time intelligence feed with relevance scoring and urgency tiers. Each signal card uses a left accent bar — a dark-mode pattern documented on darkmodedesign.com.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${C.accent3}18;">◎</div>
      <h3>Topic Cluster Map</h3>
      <p>Visual network of monitored topics with signal volume encoded in node size. Force-directed cluster layout shows topic relationships at a glance.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${C.green}18;">▲</div>
      <h3>Brief Builder</h3>
      <p>AI-generated intelligence briefs with time-range and topic filtering. One-tap export to PDF or shareable link — productivity at the speed of thought.</p>
    </div>
  </div>
</section>

<section class="palette-section" id="palette">
  <p class="section-label">Colour Palette</p>
  <div class="palette-row">
    <div class="swatch" style="background:${C.bg}; border:1px solid ${C.card}">
      <div class="sw-val">${C.bg}</div><div class="sw-name">Ink Black</div>
    </div>
    <div class="swatch" style="background:${C.surf}">
      <div class="sw-val">${C.surf}</div><div class="sw-name">Night Surface</div>
    </div>
    <div class="swatch" style="background:${C.card}">
      <div class="sw-val">${C.card}</div><div class="sw-name">Card</div>
    </div>
    <div class="swatch" style="background:${C.accent}">
      <div class="sw-val">${C.accent}</div><div class="sw-name">Violet · AI</div>
    </div>
    <div class="swatch" style="background:${C.accent2}">
      <div class="sw-val">${C.accent2}</div><div class="sw-name">Amber · Torch</div>
    </div>
    <div class="swatch" style="background:${C.accent3}">
      <div class="sw-val">${C.accent3}</div><div class="sw-name">Cyan · Data</div>
    </div>
  </div>
</section>

<section class="inspiration-section">
  <p class="section-label">What Inspired This</p>
  <div class="inspiration-card">
    <blockquote>"The void is a design element in itself. The best dark mode sites use darkness not as a stylesheet setting but as narrative material."</blockquote>
    <cite>Observed: darkmodedesign.com · WyrVox torch-and-shadow cursor effect · bento grid trend from saaspo.com + land-book.com · purple as the AI colour of 2026 (cross-referenced across 40+ SaaS landing pages)</cite>
  </div>
</section>

<footer>
  <div class="footer-brand">T<span>●</span>RCH</div>
  <div class="footer-meta">RAM Design Heartbeat #47 · Apr 9, 2026 · Dark Theme</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/torch-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/torch-mock">Mock ☀◑</a>
  </div>
</footer>

</body>
</html>`;

// ─── Viewer ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ──────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing TORCH hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} — https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing TORCH viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status} — https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
