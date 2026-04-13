'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'node';
const NAME = 'NODE';
const TAGLINE = 'every connection, in focus';

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

// ── PALETTE ──────────────────────────────────────────────────────────────────
const BG    = '#090C12';
const SURF  = '#0D1321';
const CARD  = '#111827';
const BORD  = '#1E2D47';
const ACC   = '#00D4FF';
const ACC2  = '#7B5FFF';
const ACC3  = '#FF4D6A';
const ACC4  = '#00E5A0';
const TEXT  = '#E2EAF4';
const MUTED = '#4A6280';

// ── SVG SCREEN THUMBNAILS ─────────────────────────────────────────────────────
function buildThumb(screen, idx) {
  const W = 390, H = 844;
  const titles = ['Network Map', 'Alerts', 'Traffic', 'Node Detail', 'Firewall Rules', 'System'];
  const icons  = ['◈', '⚡', '≋', '◎', '⊞', '⚙'];
  const accents = [ACC, ACC3, ACC, ACC4, ACC2, ACC2];
  const ac = accents[idx];

  // Blueprint grid lines
  let gridLines = '';
  for (let y = 0; y <= H; y += 56) {
    gridLines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#131E2E" stroke-width="1"/>`;
  }
  for (let x = 0; x <= W; x += 56) {
    gridLines += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#131E2E" stroke-width="1"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  ${gridLines}
  <rect x="0" y="0" width="${W}" height="44" fill="${SURF}"/>
  <text x="16" y="29" fill="${TEXT}" font-size="13" font-family="Inter" font-weight="600">9:41</text>
  <rect x="0" y="44" width="${W}" height="52" fill="${BG}"/>
  <line x1="0" y1="96" x2="${W}" y2="96" stroke="${BORD}" stroke-width="1"/>
  <text x="16" y="73" fill="${TEXT}" font-size="20" font-family="Inter" font-weight="700" letter-spacing="-0.5">${titles[idx]}</text>
  <text x="${icons[idx] === '◈' ? 195 : 195}" y="330" fill="${ac}" font-size="80" font-family="Inter" text-anchor="middle" opacity="0.08">${icons[idx]}</text>
  ${idx === 0 ? `
  <circle cx="195" cy="310" r="60" fill="${ac}" opacity="0.04"/>
  <circle cx="195" cy="310" r="45" fill="${ac}" opacity="0.06"/>
  <circle cx="195" cy="310" r="28" fill="${SURF}" stroke="${ac}" stroke-width="2"/>
  <circle cx="195" cy="310" r="14" fill="${ac}" opacity="0.3"/>
  <circle cx="195" cy="310" r="6" fill="${ac}"/>
  <line x1="100" y1="195" x2="155" y2="310" stroke="${ACC4}" stroke-width="1" opacity="0.35"/>
  <line x1="290" y1="195" x2="235" y2="310" stroke="${ACC4}" stroke-width="1" opacity="0.35"/>
  <line x1="80" y1="340" x2="167" y2="310" stroke="${ACC2}" stroke-width="1" opacity="0.35"/>
  <line x1="315" y1="340" x2="223" y2="310" stroke="${ACC4}" stroke-width="1" opacity="0.35"/>
  <circle cx="100" cy="195" r="10" fill="${SURF}" stroke="${ACC4}" stroke-width="1.5"/>
  <circle cx="100" cy="195" r="5" fill="${ACC4}" opacity="0.8"/>
  <circle cx="290" cy="195" r="10" fill="${SURF}" stroke="${ACC4}" stroke-width="1.5"/>
  <circle cx="290" cy="195" r="5" fill="${ACC4}" opacity="0.8"/>
  <circle cx="80" cy="340" r="10" fill="${SURF}" stroke="${ACC2}" stroke-width="1.5"/>
  <circle cx="80" cy="340" r="5" fill="${ACC2}" opacity="0.8"/>
  <circle cx="315" cy="340" r="10" fill="${SURF}" stroke="${ACC4}" stroke-width="1.5"/>
  <circle cx="315" cy="340" r="5" fill="${ACC4}" opacity="0.8"/>
  <circle cx="120" cy="450" r="10" fill="${SURF}" stroke="${ACC3}" stroke-width="1.5"/>
  <circle cx="120" cy="450" r="5" fill="${ACC3}" opacity="0.8"/>
  <circle cx="270" cy="450" r="10" fill="${SURF}" stroke="#FF9A3C" stroke-width="1.5"/>
  <circle cx="270" cy="450" r="5" fill="#FF9A3C" opacity="0.8"/>
  ` : ''}
  <rect x="0" y="${H - 72}" width="${W}" height="72" fill="${SURF}"/>
  <line x1="0" y1="${H - 72}" x2="${W}" y2="${H - 72}" stroke="${BORD}" stroke-width="1"/>
  <text x="39" y="${H - 22}" fill="${MUTED}" font-size="9" font-family="Inter" text-anchor="middle">Map</text>
  <text x="117" y="${H - 22}" fill="${MUTED}" font-size="9" font-family="Inter" text-anchor="middle">Alerts</text>
  <text x="195" y="${H - 22}" fill="${MUTED}" font-size="9" font-family="Inter" text-anchor="middle">Traffic</text>
  <text x="273" y="${H - 22}" fill="${MUTED}" font-size="9" font-family="Inter" text-anchor="middle">Nodes</text>
  <text x="351" y="${H - 22}" fill="${MUTED}" font-size="9" font-family="Inter" text-anchor="middle">Rules</text>
  <rect x="${39 + idx * 78 - 18}" y="${H - 68}" width="36" height="2" fill="${ac}" rx="1"/>
  <text x="${39 + idx * 78}" y="${H - 42}" fill="${ac}" font-size="18" font-family="Inter" text-anchor="middle">
    ${{ 0: '◈', 1: '⚡', 2: '≋', 3: '◎', 4: '⊞', 5: '⚙' }[idx]}
  </text>
</svg>`;
}

// ── HERO HTML ─────────────────────────────────────────────────────────────────
const screenNames = pen.screens.map(s => s.name);
const thumbsHtml = pen.screens.map((s, i) => {
  const svg = buildThumb(s, i);
  const b64 = Buffer.from(svg).toString('base64');
  return `
  <div class="screen-card" onclick="setActive(${i})" id="card-${i}">
    <div class="screen-preview">
      <img src="data:image/svg+xml;base64,${b64}" alt="${s.name}" loading="lazy"/>
    </div>
    <div class="screen-label">${s.name}</div>
  </div>`;
}).join('');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>NODE — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG};
    --surf: ${SURF};
    --card: ${CARD};
    --bord: ${BORD};
    --acc: ${ACC};
    --acc2: ${ACC2};
    --acc3: ${ACC3};
    --acc4: ${ACC4};
    --text: ${TEXT};
    --muted: ${MUTED};
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    overflow-x: hidden;
    line-height: 1.6;
  }

  /* Blueprint grid overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(${BORD}55 1px, transparent 1px),
      linear-gradient(90deg, ${BORD}55 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  /* Cyan glow aura */
  body::after {
    content: '';
    position: fixed;
    top: -30vh;
    left: 50%;
    transform: translateX(-50%);
    width: 80vw;
    height: 80vh;
    background: radial-gradient(ellipse at center, ${ACC}18 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
    background: ${BG}CC;
    border-bottom: 1px solid ${BORD};
  }
  .nav-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 24px;
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo {
    font-size: 16px; font-weight: 800; letter-spacing: -0.5px;
    color: var(--text);
    display: flex; align-items: center; gap: 10px;
  }
  .nav-logo .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--acc); box-shadow: 0 0 8px var(--acc); }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { color: var(--muted); font-size: 13px; text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    font-size: 12px; font-weight: 600; letter-spacing: 0.8px;
    color: var(--bg);
    background: var(--acc);
    padding: 8px 18px;
    border-radius: 6px;
    text-decoration: none;
    text-transform: uppercase;
  }

  /* ── HERO ── */
  .hero {
    padding: 140px 0 80px;
    text-align: center;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${ACC}15;
    border: 1px solid ${ACC}40;
    border-radius: 20px;
    padding: 5px 14px;
    font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
    color: var(--acc);
    margin-bottom: 32px;
  }
  .hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--acc); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  .hero h1 {
    font-size: clamp(52px, 8vw, 96px);
    font-weight: 800;
    letter-spacing: -3px;
    line-height: 1;
    color: var(--text);
    margin-bottom: 16px;
  }
  .hero h1 span { color: var(--acc); }
  .hero-sub {
    font-size: 18px; color: var(--muted); font-weight: 400;
    margin-bottom: 48px; letter-spacing: -0.2px;
  }
  .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc); color: var(--bg);
    padding: 14px 32px; border-radius: 8px;
    font-size: 14px; font-weight: 700; letter-spacing: 0.3px;
    text-decoration: none;
    box-shadow: 0 0 32px ${ACC}40;
    transition: box-shadow 0.2s;
  }
  .btn-primary:hover { box-shadow: 0 0 48px ${ACC}60; }
  .btn-secondary {
    background: transparent; color: var(--text);
    border: 1px solid var(--bord);
    padding: 14px 32px; border-radius: 8px;
    font-size: 14px; font-weight: 500;
    text-decoration: none;
    transition: border-color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--acc); color: var(--acc); }

  /* ── ANNOTATION ANNOTATION ── */
  .annotation-strip {
    display: flex; gap: 24px; justify-content: center;
    margin: 48px 0;
    flex-wrap: wrap;
  }
  .ann-item {
    display: flex; flex-direction: column; align-items: center;
    gap: 4px;
  }
  .ann-val { font-size: 28px; font-weight: 800; letter-spacing: -1px; color: var(--text); }
  .ann-label {
    font-size: 9px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted);
  }
  .ann-sep { width: 1px; height: 40px; background: var(--bord); align-self: center; }

  /* ── SCREEN CAROUSEL ── */
  .screens-section { padding: 60px 0; }
  .section-label {
    font-size: 9px; font-weight: 600; letter-spacing: 3px;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 32px;
    display: flex; align-items: center; gap: 12px;
  }
  .section-label::before { content: ''; width: 20px; height: 1px; background: var(--muted); }
  .screen-tabs { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
  .screen-tab {
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid var(--bord);
    background: transparent;
    color: var(--muted);
    font-size: 11px; font-weight: 500; letter-spacing: 0.3px;
    cursor: pointer; transition: all 0.2s;
  }
  .screen-tab.active {
    background: var(--acc); border-color: var(--acc);
    color: var(--bg); font-weight: 700;
  }
  .screen-display {
    display: flex; gap: 24px; align-items: flex-start;
  }
  .screen-main {
    flex: 0 0 280px;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid var(--bord);
    box-shadow: 0 0 60px ${BG}, 0 0 120px ${ACC}15;
  }
  .screen-main img { width: 100%; display: block; }
  .screen-thumb-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    flex: 1;
  }
  .screen-card {
    cursor: pointer;
    border-radius: 12px; overflow: hidden;
    border: 1px solid var(--bord);
    transition: border-color 0.2s, transform 0.2s;
  }
  .screen-card:hover { border-color: var(--acc); transform: translateY(-2px); }
  .screen-card.active { border-color: var(--acc); box-shadow: 0 0 16px ${ACC}20; }
  .screen-preview img { width: 100%; display: block; }
  .screen-label {
    padding: 6px 10px;
    font-size: 9px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; color: var(--muted);
    background: var(--card);
    border-top: 1px solid var(--bord);
  }

  /* ── FEATURES BENTO ── */
  .features-section { padding: 60px 0; }
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
    gap: 16px;
  }
  .bento-card {
    background: var(--card);
    border: 1px solid var(--bord);
    border-radius: 12px;
    padding: 28px;
    position: relative;
    overflow: hidden;
  }
  /* Blueprint corner ticks */
  .bento-card::before {
    content: '';
    position: absolute; top: 0; left: 0;
    width: 12px; height: 12px;
    border-top: 1px solid; border-left: 1px solid;
    border-color: inherit;
    opacity: 0.6;
  }
  .bento-card::after {
    content: '';
    position: absolute; bottom: 0; right: 0;
    width: 12px; height: 12px;
    border-bottom: 1px solid; border-right: 1px solid;
    border-color: inherit;
    opacity: 0.6;
  }
  .bento-card.span2 { grid-column: span 2; }
  .bento-card.span3 { grid-column: span 3; }
  .bento-icon {
    font-size: 22px; margin-bottom: 16px;
    display: block;
  }
  .bento-title { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 8px; }
  .bento-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
  .bento-stat { font-size: 36px; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 4px; }
  .bento-stat-label { font-size: 10px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; }
  .ann { font-size: 8px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; opacity: 0.5; margin-bottom: 4px; }

  /* ── PALETTE ── */
  .palette-section { padding: 60px 0; }
  .palette-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .palette-chip {
    display: flex; align-items: center; gap: 12px;
    background: var(--card);
    border: 1px solid var(--bord);
    border-radius: 8px;
    padding: 12px 16px;
  }
  .palette-dot { width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0; }
  .palette-info { display: flex; flex-direction: column; }
  .palette-hex { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
  .palette-name { font-size: 10px; color: var(--muted); }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--bord);
    padding: 40px 0;
    margin-top: 80px;
  }
  .footer-inner {
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
  }
  .footer-logo { font-size: 14px; font-weight: 800; letter-spacing: -0.5px; }
  .footer-meta { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; }
  .footer-links a:hover { color: var(--acc); }

  @media (max-width: 768px) {
    .bento-grid { grid-template-columns: 1fr; }
    .bento-card.span2, .bento-card.span3 { grid-column: span 1; }
    .screen-display { flex-direction: column; }
    .screen-thumb-grid { grid-template-columns: repeat(3, 1fr); }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-inner">
    <div class="nav-logo">
      <div class="logo-dot"></div>
      NODE
    </div>
    <div class="nav-links">
      <a href="#screens">Screens</a>
      <a href="#features">Features</a>
      <a href="#palette">Palette</a>
    </div>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">Open Viewer</a>
  </div>
</nav>

<section class="hero">
  <div class="container">
    <div class="hero-badge">RAM Design Heartbeat · #47</div>
    <h1><span>NODE</span></h1>
    <p class="hero-sub">${TAGLINE}</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
    </div>

    <div class="annotation-strip">
      <div class="ann-item">
        <span class="ann-val" style="color:${ACC}">6</span>
        <span class="ann-label">Screens</span>
      </div>
      <div class="ann-sep"></div>
      <div class="ann-item">
        <span class="ann-val">809</span>
        <span class="ann-label">Elements</span>
      </div>
      <div class="ann-sep"></div>
      <div class="ann-item">
        <span class="ann-val" style="color:${ACC2}">Dark</span>
        <span class="ann-label">Theme</span>
      </div>
      <div class="ann-sep"></div>
      <div class="ann-item">
        <span class="ann-val" style="color:${ACC4}">Blueprint</span>
        <span class="ann-label">Aesthetic</span>
      </div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="container">
    <div class="section-label">Design Screens</div>
    <div class="screen-display">
      <div class="screen-main" id="main-preview">
        <img src="data:image/svg+xml;base64,${Buffer.from(buildThumb(pen.screens[0], 0)).toString('base64')}" id="main-img" alt="Main preview"/>
      </div>
      <div class="screen-thumb-grid">
        ${thumbsHtml}
      </div>
    </div>
  </div>
</section>

<section class="features-section" id="features">
  <div class="container">
    <div class="section-label">Feature Highlights</div>
    <div class="bento-grid">

      <div class="bento-card span2" style="border-color:${ACC}40">
        <span class="ann">NETWORK TOPOLOGY</span>
        <div class="bento-title">Live Node Map</div>
        <p class="bento-desc">Interactive graph of all network nodes with real-time health, connection lines drawn in the blueprint annotation style — thin orthogonal routes with circuit-corner bends. Inspired by AuthKit's circuit diagram UI on darkmodedesign.com.</p>
      </div>

      <div class="bento-card" style="border-color:${ACC3}40">
        <span class="bento-stat" style="color:${ACC3}">3</span>
        <div class="bento-stat-label">Active Threats</div>
        <p class="bento-desc" style="margin-top:8px">Critical + warning alerts surfaced immediately on the dashboard.</p>
      </div>

      <div class="bento-card" style="border-color:${ACC4}40">
        <span class="bento-stat" style="color:${ACC4}">99.8%</span>
        <div class="bento-stat-label">Uptime</div>
        <p class="bento-desc" style="margin-top:8px">Live health metrics per node with per-port status monitoring.</p>
      </div>

      <div class="bento-card" style="border-color:${ACC}40">
        <span class="bento-stat" style="color:${ACC}">12ms</span>
        <div class="bento-stat-label">Avg Latency</div>
        <p class="bento-desc" style="margin-top:8px">Protocol breakdown with traffic sparklines across 5 chart types.</p>
      </div>

      <div class="bento-card" style="border-color:${ACC2}40">
        <span class="ann">FIREWALL RULES</span>
        <div class="bento-title">Zero-Trust Policy</div>
        <p class="bento-desc">Visual rule builder with annotation-style corners marking each rule card. ALLOW/DENY badges with source/destination and protocol filtering.</p>
      </div>

      <div class="bento-card span3" style="border-color:${ACC}20; background: linear-gradient(135deg, ${SURF} 0%, ${CARD} 100%)">
        <span class="ann">DESIGN INSPIRATION</span>
        <div class="bento-title">Blueprint Annotation Aesthetic</div>
        <p class="bento-desc">Inspired by the "blueprint / annotation UI" pattern documented on <strong style="color:${TEXT}">darkmodedesign.com</strong> — thin orthogonal connection lines, corner bracket ticks on bento cards, monospace annotation labels, and node-connector diagrams used as decorative elements. Combined with the "Linear Look" dark-first AI SaaS language from <strong style="color:${TEXT}">saaspo.com</strong>: near-black canvas, bento grid feature layout, thin borders, and colorful blurry glow accents.</p>
      </div>

    </div>
  </div>
</section>

<section class="palette-section" id="palette">
  <div class="container">
    <div class="section-label">Color System</div>
    <div class="palette-row">
      ${[
        { hex: BG,    name: 'Background',    label: 'Deep Navy Black' },
        { hex: SURF,  name: 'Surface',       label: 'Navy Surface' },
        { hex: CARD,  name: 'Card',          label: 'Dark Card' },
        { hex: ACC,   name: 'Primary Cyan',  label: 'Electric Cyan' },
        { hex: ACC2,  name: 'Violet',        label: 'Circuit Violet' },
        { hex: ACC3,  name: 'Alert',         label: 'Threat Red' },
        { hex: ACC4,  name: 'Success',       label: 'Health Green' },
        { hex: MUTED, name: 'Muted',         label: 'Blueprint Gray' },
      ].map(p => `
      <div class="palette-chip">
        <div class="palette-dot" style="background:${p.hex}; box-shadow: 0 0 8px ${p.hex}60"></div>
        <div class="palette-info">
          <span class="palette-hex">${p.hex}</span>
          <span class="palette-name">${p.label}</span>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <div class="footer-inner">
      <div>
        <div class="footer-logo">NODE</div>
        <div class="footer-meta" style="margin-top:4px">RAM Design Heartbeat #47 · April 2026</div>
      </div>
      <div class="footer-links">
        <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
        <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
      </div>
      <div class="footer-meta">Blueprint annotation dark theme</div>
    </div>
  </div>
</footer>

<script>
const thumbData = ${JSON.stringify(pen.screens.map((s, i) => Buffer.from(buildThumb(s, i)).toString('base64')))};

function setActive(idx) {
  document.getElementById('main-img').src = 'data:image/svg+xml;base64,' + thumbData[idx];
  document.querySelectorAll('.screen-card').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });
}
setActive(0);
</script>

</body>
</html>`;

// ── VIEWER ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 120) : '✓');

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 120) : '✓');
}
main().catch(console.error);
