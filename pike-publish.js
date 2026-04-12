'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'pike';
const APP_NAME = 'PIKE';
const TAGLINE = 'Know your body daily';

// ─── PUBLISH HELPER ──────────────────────────────────────────────────────────
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

// ─── LOAD PEN ────────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const BG = '#FAF9F3';
const SURF = '#FFFFFF';
const TEXT = '#1C1C18';
const ACCENT = '#C9F53A';
const ACCENT_D = '#2D3A1E';
const BORDER = '#E8E7DF';
const TEXT_MID = '#5A5A54';

// ─── RENDER SVG FROM PEN ELEMENTS ────────────────────────────────────────────
function renderElement(el) {
  if (!el) return '';
  switch (el.type) {
    case 'rect':
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}"/>`;
    case 'text': {
      const anchor = el.anchor || 'start';
      const adjustedX = anchor === 'middle' ? el.x : anchor === 'end' ? el.x : el.x;
      return `<text x="${adjustedX}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw||400}" font-family="${el.font||'system-ui'}" text-anchor="${anchor}" letter-spacing="${el.ls||'-0.02em'}" opacity="${el.opacity||1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    case 'circle':
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}"/>`;
    case 'line':
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw||1}" opacity="${el.opacity||1}"/>`;
    default:
      return '';
  }
}

function screenToSvg(screen) {
  const els = screen.elements.map(renderElement).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">\n  ${els}\n</svg>`;
}

function svgToDataUri(svg) {
  const encoded = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

// ─── BUILD HERO PAGE ─────────────────────────────────────────────────────────
const screenSvgs = pen.screens.map(s => ({
  name: s.name,
  dataUri: svgToDataUri(screenToSvg(s)),
}));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: ${BG};
  --surf: ${SURF};
  --text: ${TEXT};
  --accent: ${ACCENT};
  --accent-d: ${ACCENT_D};
  --border: ${BORDER};
  --mid: ${TEXT_MID};
}
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  min-height: 100vh;
}

/* ── NAV ─────────────────────────────────────────────────────────────── */
nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; height: 60px;
  background: rgba(250,249,243,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-logo { font-size: 18px; font-weight: 800; letter-spacing: -0.05em; color: var(--text); text-decoration: none; }
.nav-logo span { color: var(--accent-d); background: var(--accent); padding: 1px 6px; border-radius: 4px; margin-right: 2px; }
.nav-links { display: flex; gap: 28px; }
.nav-links a { font-size: 13px; font-weight: 500; color: var(--mid); text-decoration: none; transition: color 0.2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 700;
  background: var(--accent-d); color: var(--accent);
  padding: 8px 18px; border-radius: 20px; text-decoration: none;
  letter-spacing: -0.01em; transition: opacity 0.2s;
}
.nav-cta:hover { opacity: 0.85; }

/* ── HERO ─────────────────────────────────────────────────────────────── */
.hero {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; min-height: calc(100vh - 60px); align-items: center;
  max-width: 1200px; margin: 0 auto; padding: 80px 32px;
}
.hero-text { padding-right: 60px; }
.hero-tag {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--accent-d);
  background: var(--accent); padding: 6px 14px; border-radius: 20px;
  margin-bottom: 28px; text-transform: uppercase;
}
.hero-h1 {
  font-size: 68px; font-weight: 800; line-height: 1.0;
  letter-spacing: -0.06em; color: var(--text);
  margin-bottom: 24px;
}
.hero-h1 em { font-style: normal; color: var(--accent-d); background: var(--accent); padding: 0 6px; border-radius: 8px; }
.hero-sub {
  font-size: 18px; font-weight: 400; color: var(--mid);
  line-height: 1.6; margin-bottom: 40px; max-width: 420px;
  letter-spacing: -0.01em;
}
.hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 700; letter-spacing: -0.02em;
  background: var(--accent-d); color: var(--accent);
  padding: 14px 28px; border-radius: 28px; text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(45,58,30,0.2); }
.btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 500; color: var(--text);
  padding: 14px 20px; text-decoration: none;
  border: 1.5px solid var(--border); border-radius: 28px;
  transition: border-color 0.2s;
}
.btn-secondary:hover { border-color: var(--text); }
.hero-note { font-size: 12px; color: var(--mid); margin-top: 16px; }

/* ── PHONE CAROUSEL ──────────────────────────────────────────────────── */
.hero-screens {
  display: flex; gap: 16px; align-items: flex-start;
  overflow-x: auto; padding-bottom: 16px;
  scrollbar-width: none;
}
.hero-screens::-webkit-scrollbar { display: none; }
.phone-frame {
  flex-shrink: 0;
  width: 200px; background: var(--surf);
  border-radius: 28px; overflow: hidden;
  border: 2px solid var(--border);
  box-shadow: 0 16px 48px rgba(28,28,24,0.12);
  transition: transform 0.3s;
}
.phone-frame:hover { transform: translateY(-6px); }
.phone-frame:first-child { margin-top: 0; }
.phone-frame:nth-child(2) { margin-top: 40px; }
.phone-frame:nth-child(3) { margin-top: 16px; }
.phone-frame img { width: 100%; display: block; }
.screen-label {
  text-align: center; font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
  color: var(--mid); padding: 8px 0; text-transform: uppercase;
  background: var(--surf); border-top: 1px solid var(--border);
}

/* ── TICKER ──────────────────────────────────────────────────────────── */
.ticker-wrap {
  background: var(--accent); overflow: hidden;
  padding: 10px 0; border-top: 1px solid var(--accent-d);
  border-bottom: 1px solid var(--accent-d);
}
.ticker-inner {
  display: flex; gap: 60px; width: max-content;
  animation: ticker 28s linear infinite;
}
.ticker-item {
  font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
  color: var(--accent-d); white-space: nowrap; text-transform: uppercase;
}
.ticker-dot { opacity: 0.5; margin: 0 8px; }
@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* ── FEATURES ────────────────────────────────────────────────────────── */
.features {
  max-width: 1200px; margin: 100px auto; padding: 0 32px;
}
.features-header { margin-bottom: 56px; }
.section-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  color: var(--accent-d); text-transform: uppercase; margin-bottom: 12px;
}
.features-header h2 {
  font-size: 48px; font-weight: 800; letter-spacing: -0.05em; color: var(--text);
  line-height: 1.1; max-width: 600px;
}
.feat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
}
.feat-card {
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 20px; padding: 28px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.feat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(28,28,24,0.08); }
.feat-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--accent); display: flex; align-items: center; justify-content: center;
  font-size: 20px; margin-bottom: 18px; color: var(--accent-d);
}
.feat-card h3 {
  font-size: 16px; font-weight: 700; letter-spacing: -0.02em;
  color: var(--text); margin-bottom: 8px;
}
.feat-card p { font-size: 13px; color: var(--mid); line-height: 1.6; }

/* ── PALETTE ────────────────────────────────────────────────────────── */
.palette-section {
  max-width: 1200px; margin: 80px auto; padding: 0 32px 80px;
}
.palette-row { display: flex; gap: 16px; align-items: stretch; margin-top: 24px; }
.swatch {
  flex: 1; border-radius: 16px; overflow: hidden;
  border: 1px solid var(--border);
  display: flex; flex-direction: column;
}
.swatch-color { height: 80px; }
.swatch-info { padding: 14px 16px; background: var(--surf); }
.swatch-name { font-size: 12px; font-weight: 700; color: var(--text); letter-spacing: -0.01em; }
.swatch-hex { font-size: 11px; color: var(--mid); font-family: monospace; margin-top: 2px; }
.swatch-role { font-size: 10px; color: var(--mid); margin-top: 4px; letter-spacing: 0.02em; text-transform: uppercase; }

/* ── ALL SCREENS ────────────────────────────────────────────────────── */
.all-screens { max-width: 1200px; margin: 0 auto 80px; padding: 0 32px; }
.screens-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-top: 24px; }
.screen-card {
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 16px; overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.screen-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(28,28,24,0.1); }
.screen-card img { width: 100%; display: block; }
.screen-card .lbl {
  text-align: center; font-size: 10px; font-weight: 600;
  color: var(--mid); padding: 6px; text-transform: uppercase; letter-spacing: 0.04em;
}

/* ── DESIGN INFO ────────────────────────────────────────────────────── */
.design-info { max-width: 1200px; margin: 0 auto 80px; padding: 0 32px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 24px; }
.info-card { background: var(--surf); border: 1px solid var(--border); border-radius: 20px; padding: 28px; }
.info-card h3 { font-size: 14px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 14px; color: var(--text); }
.info-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); }
.info-item:last-child { border-bottom: none; }
.info-key { font-size: 12px; color: var(--mid); font-weight: 500; }
.info-val { font-size: 12px; color: var(--text); font-weight: 600; }

/* ── FOOTER ─────────────────────────────────────────────────────────── */
footer {
  background: var(--accent-d); color: var(--accent);
  padding: 40px 32px; text-align: center;
}
footer p { font-size: 13px; opacity: 0.7; margin-top: 8px; }
footer a { color: var(--accent); opacity: 0.8; }

/* ── RESPONSIVE ─────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; padding: 40px 20px; }
  .hero-text { padding-right: 0; }
  .hero-h1 { font-size: 44px; }
  .feat-grid { grid-template-columns: 1fr 1fr; }
  .screens-grid { grid-template-columns: repeat(3, 1fr); }
  .info-grid { grid-template-columns: 1fr; }
}
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <a href="#" class="nav-logo"><span>P</span>PIKE</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">View in Viewer →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-text">
    <div class="hero-tag">◈ Health Biometrics · Heartbeat #13</div>
    <h1 class="hero-h1">Know your <em>body</em> daily.</h1>
    <p class="hero-sub">A minimal health tracker inspired by the warm editorial style of NoGood studio — just four colors, clean data, no noise.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Viewer ↗</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
    </div>
    <p class="hero-note">600 elements · 6 screens · Light theme · RAM Design Studio</p>
  </div>
  <div class="hero-screens">
    ${screenSvgs.slice(0, 3).map((s, i) => `
    <div class="phone-frame" style="margin-top:${[0,40,16][i]}px">
      <img src="${s.dataUri}" alt="${s.name} screen" width="200" height="433" loading="${i === 0 ? 'eager' : 'lazy'}">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- TICKER -->
<div class="ticker-wrap">
  <div class="ticker-inner">
    ${Array(2).fill(['SLEEP TRACKING', 'HEART RATE', 'ACTIVITY RINGS', 'HRV ANALYSIS', 'NUTRITION', 'BODY SCORE', 'SMART GOALS', 'WEARABLE SYNC', 'DAILY INSIGHTS', 'TREND REPORTS'])
      .flat().map(t => `<span class="ticker-item">${t}<span class="ticker-dot">◈</span></span>`).join('')}
  </div>
</div>

<!-- FEATURES -->
<section class="features" id="features">
  <div class="features-header">
    <div class="section-label">Why PIKE</div>
    <h2>Health data that's actually readable.</h2>
  </div>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">◗</div>
      <h3>Sleep Stages</h3>
      <p>Visualise REM, deep, light and awake time in a single glanceable bar. Weekly trends with personal average markers.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◎</div>
      <h3>Activity Rings</h3>
      <p>Three-ring move/exercise/stand system with daily log and weekly calorie bar chart. Every workout auto-tagged.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">♡</div>
      <h3>Vital Signs</h3>
      <p>Heart rate, HRV, SpO₂, skin temp and respiratory rate — all in one clean vitals panel with trend badges.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◇</div>
      <h3>Body Score</h3>
      <p>A single daily score that synthesises all your metrics — so you know at a glance whether today was a good body day.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◈</div>
      <h3>Smart Goals</h3>
      <p>Four active goals with progress bars, streaks and contextual coaching nudges. Completed goals archived, never lost.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◗</div>
      <h3>30-Day Trends</h3>
      <p>Sparkline health trend across every metric. Monthly body composition tracking with weight, BMI and muscle mass.</p>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section" id="palette">
  <div class="section-label">Design Palette</div>
  <h2 style="font-size:36px;font-weight:800;letter-spacing:-0.04em;margin-bottom:0">Four colours. Zero noise.</h2>
  <p style="font-size:14px;color:var(--mid);margin-top:10px;margin-bottom:0">Inspired by the 4-color constraint of Tayte.co (minimal.gallery)</p>
  <div class="palette-row">
    <div class="swatch">
      <div class="swatch-color" style="background:${BG}; border-bottom:1px solid var(--border)"></div>
      <div class="swatch-info">
        <div class="swatch-name">Warm Off-White</div>
        <div class="swatch-hex">${BG}</div>
        <div class="swatch-role">Background</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:${TEXT}"></div>
      <div class="swatch-info">
        <div class="swatch-name">Warm Near-Black</div>
        <div class="swatch-hex">${TEXT}</div>
        <div class="swatch-role">Primary Text</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:${ACCENT}"></div>
      <div class="swatch-info">
        <div class="swatch-name">Electric Lime</div>
        <div class="swatch-hex">${ACCENT}</div>
        <div class="swatch-role">Primary Accent</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:${ACCENT_D}"></div>
      <div class="swatch-info">
        <div class="swatch-name">Deep Forest</div>
        <div class="swatch-hex">${ACCENT_D}</div>
        <div class="swatch-role">Accent Dark / CTA</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:${SURF}; border-bottom:1px solid var(--border)"></div>
      <div class="swatch-info">
        <div class="swatch-name">Pure White</div>
        <div class="swatch-hex">${SURF}</div>
        <div class="swatch-role">Card Surface</div>
      </div>
    </div>
  </div>
</section>

<!-- ALL SCREENS -->
<section class="all-screens" id="screens">
  <div class="section-label">All Screens</div>
  <h2 style="font-size:36px;font-weight:800;letter-spacing:-0.04em;margin-bottom:0">6 screens, 600 elements.</h2>
  <div class="screens-grid">
    ${screenSvgs.map(s => `
    <div class="screen-card">
      <img src="${s.dataUri}" alt="${s.name}" loading="lazy">
      <div class="lbl">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- DESIGN INFO -->
<section class="design-info">
  <div class="section-label">Design Notes</div>
  <div class="info-grid">
    <div class="info-card">
      <h3>Design Specs</h3>
      <div class="info-item"><span class="info-key">Format</span><span class="info-val">Pencil.dev v2.8</span></div>
      <div class="info-item"><span class="info-key">Canvas</span><span class="info-val">390 × 844 px</span></div>
      <div class="info-item"><span class="info-key">Screens</span><span class="info-val">6</span></div>
      <div class="info-item"><span class="info-key">Elements</span><span class="info-val">600</span></div>
      <div class="info-item"><span class="info-key">Theme</span><span class="info-val">Light</span></div>
      <div class="info-item"><span class="info-key">Heartbeat</span><span class="info-val">#13</span></div>
    </div>
    <div class="info-card">
      <h3>Inspiration</h3>
      <div class="info-item"><span class="info-key">Source</span><span class="info-val">minimal.gallery</span></div>
      <div class="info-item"><span class="info-key">Reference site</span><span class="info-val">NoGood studio</span></div>
      <div class="info-item"><span class="info-key">4-color rule</span><span class="info-val">Tayte.co</span></div>
      <div class="info-item"><span class="info-key">Warm off-white bg</span><span class="info-val">#FAF9F3</span></div>
      <div class="info-item"><span class="info-key">Electric lime accent</span><span class="info-val">#C9F53A</span></div>
      <div class="info-item"><span class="info-key">Contrast pairing</span><span class="info-val">Lime on Forest</span></div>
    </div>
  </div>
  <div style="margin-top:16px; display:flex; gap:12px; flex-wrap:wrap">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;background:var(--accent-d);color:var(--accent);padding:10px 20px;border-radius:20px">Open Viewer ↗</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:var(--text);padding:10px 20px;border-radius:20px;border:1.5px solid var(--border)">☀◑ Interactive Mock</a>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <strong style="font-size:20px;font-weight:800;letter-spacing:-0.04em">PIKE</strong>
  <p>${TAGLINE} · RAM Design Studio · Heartbeat #13</p>
  <p style="margin-top:12px">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> ·
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </p>
</footer>

</body>
</html>`;

// ─── BUILD VIEWER ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`
);

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);
  if (r1.status !== 200 && r1.status !== 201) console.error('Hero error:', r1.body.slice(0, 200));

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Pen Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  if (r2.status !== 200 && r2.status !== 201) console.error('Viewer error:', r2.body.slice(0, 200));
}

main().catch(console.error);
