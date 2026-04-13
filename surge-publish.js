'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'surge';
const NAME    = 'SURGE';
const TAGLINE = 'Every API call, accounted for';

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

// ── Palette from pen ──────────────────────────────────────────────────────
const BG     = pen.metadata.palette.bg;      // #070A0F
const SURF   = pen.metadata.palette.surface;  // #0D1117
const CARD   = pen.metadata.palette.card;     // #141C26
const ACC    = pen.metadata.palette.accent;   // #00D4FF
const ACC2   = pen.metadata.palette.accent2;  // #FF5240
const TEXT   = pen.metadata.palette.text;     // #E2EAF4
const GREEN  = '#34C97A';
const AMBER  = '#F59E0B';
const BORDER = '#1E2D3D';
const TEXT2  = '#7B8FA6';
const TEXT3  = '#435567';

// ── Generate SVG data URI for each screen (palette skeleton) ─────────────
function screenSVG(screenName, idx) {
  const colors = {
    0: { accent: ACC,   glow: 'rgba(0,212,255,0.15)' },
    1: { accent: ACC,   glow: 'rgba(0,212,255,0.12)' },
    2: { accent: ACC2,  glow: 'rgba(255,82,64,0.15)' },
    3: { accent: AMBER, glow: 'rgba(245,158,11,0.12)' },
    4: { accent: ACC,   glow: 'rgba(0,212,255,0.10)' },
    5: { accent: ACC2,  glow: 'rgba(255,82,64,0.08)' },
  };
  const sc = colors[idx] || colors[0];

  // Bento grid layout skeleton
  const bentoPattern = idx === 0 ? `
    <rect x="12" y="110" width="155" height="85" rx="8" fill="${CARD}" stroke="${BORDER}" stroke-width="0.5"/>
    <rect x="12" y="110" width="155" height="85" rx="8" fill="${sc.accent}" opacity="0.05"/>
    <text x="24" y="130" font-size="7" fill="${TEXT2}" font-family="monospace" letter-spacing="1">REQUESTS</text>
    <text x="24" y="162" font-size="20" fill="${TEXT}" font-family="system-ui" font-weight="700">48.3M</text>
    <rect x="175" y="110" width="155" height="85" rx="8" fill="${CARD}" stroke="${BORDER}" stroke-width="0.5"/>
    <rect x="175" y="110" width="155" height="85" rx="8" fill="${ACC2}" opacity="0.05"/>
    <text x="187" y="130" font-size="7" fill="${TEXT2}" font-family="monospace" letter-spacing="1">ERROR RATE</text>
    <text x="187" y="162" font-size="20" fill="${TEXT}" font-family="system-ui" font-weight="700">0.12%</text>
    <rect x="12" y="205" width="318" height="90" rx="8" fill="${CARD}" stroke="${sc.accent}" stroke-width="0.5" opacity="0.7"/>
    <rect x="12" y="205" width="318" height="90" rx="8" fill="${sc.glow}"/>
    <text x="24" y="225" font-size="7" fill="${TEXT2}" font-family="monospace" letter-spacing="1">P99 LATENCY</text>
    <text x="24" y="260" font-size="26" fill="${TEXT}" font-family="system-ui" font-weight="700">186ms</text>
    <line x1="190" y1="220" x2="190" y2="285" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="202" y="240" font-size="8" fill="${TEXT3}" font-family="monospace">P50: 42ms</text>
    <text x="270" y="240" font-size="8" fill="${TEXT3}" font-family="monospace">P95: 98ms</text>
  ` : idx === 1 ? `
    <rect x="12" y="105" width="318" height="18" rx="4" fill="${CARD}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="20" y="118" font-size="7" fill="${TEXT3}" font-family="monospace">ENDPOINT</text>
    <text x="195" y="118" font-size="7" fill="${TEXT3}" font-family="monospace">LAT</text>
    <text x="248" y="118" font-size="7" fill="${TEXT3}" font-family="monospace">RPS</text>
    <text x="298" y="118" font-size="7" fill="${TEXT3}" font-family="monospace">ERR</text>
    ${[0,1,2,3,4,5].map(i => `
      <rect x="12" y="${130+i*40}" width="318" height="34" rx="6" fill="${i===2?CARD:'#0F1823'}" stroke="${i===2?ACC:BORDER}" stroke-width="${i===2?'0.8':'0.5'}"/>
      ${i===2?`<rect x="12" y="${130+i*40}" width="318" height="34" rx="6" fill="${ACC}" opacity="0.03"/>`:``}
    `).join('')}
  ` : idx === 2 ? `
    <rect x="12" y="105" width="318" height="120" rx="8" fill="${CARD}" stroke="${ACC2}" stroke-width="1"/>
    <rect x="12" y="105" width="318" height="120" rx="8" fill="${ACC2}" opacity="0.06"/>
    <rect x="12" y="105" width="3" height="120" rx="2" fill="${ACC2}"/>
    <text x="24" y="130" font-size="8" fill="${ACC2}" font-family="monospace" letter-spacing="1">● ACTIVE — P1</text>
    <text x="24" y="148" font-size="9" fill="${TEXT}" font-family="system-ui" font-weight="600">Elevated error rate on /v2/chat/stream</text>
    <text x="24" y="164" font-size="8" fill="${TEXT2}" font-family="system-ui">Error rate spiked to 1.4% (threshold: 0.5%)</text>
    ${[0,1,2].map(i => `<rect x="12" y="${242+i*44}" width="318" height="38" rx="6" fill="#0F1823" stroke="${BORDER}" stroke-width="0.5"/>
    <rect x="12" y="${242+i*44}" width="3" height="38" rx="2" fill="${GREEN}"/>`).join('')}
  ` : idx === 3 ? `
    <rect x="12" y="105" width="318" height="85" rx="8" fill="${CARD}" stroke="${BORDER}" stroke-width="0.5"/>
    <rect x="12" y="105" width="318" height="85" rx="8" fill="${sc.accent}" opacity="0.04"/>
    <text x="24" y="126" font-size="7" fill="${TEXT3}" font-family="monospace" letter-spacing="1">TOTAL SPEND</text>
    <text x="24" y="163" font-size="28" fill="${TEXT}" font-family="system-ui" font-weight="700">$2,847</text>
    <text x="24" y="180" font-size="8" fill="${TEXT2}">of $4,000 budget</text>
    ${[0,1,2,3].map(i => `
      <rect x="12" y="${205+i*48}" width="318" height="40" rx="6" fill="#0F1823" stroke="${BORDER}" stroke-width="0.5"/>
    `).join('')}
  ` : `
    ${[0,1,2].map(i => `
      <rect x="12" y="${105+i*68}" width="318" height="58" rx="8" fill="${CARD}" stroke="${BORDER}" stroke-width="0.5"/>
      <circle cx="40" cy="${134+i*68}" r="14" fill="${ACC}" opacity="0.1"/>
    `).join('')}
  `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="342" height="380" viewBox="0 0 342 380">
    <rect width="342" height="380" fill="${BG}" rx="12"/>
    <!-- Status bar -->
    <rect width="342" height="36" fill="${BG}"/>
    <text x="14" y="24" font-size="10" fill="${TEXT}" font-family="system-ui" font-weight="600">9:41</text>
    <circle cx="${idx === 2 ? 320 : 302}" cy="18" r="3" fill="${idx === 2 ? ACC2 : GREEN}" opacity="0.9"/>
    <!-- Nav bottom -->
    <rect y="320" width="342" height="60" fill="${SURF}" stroke="${BORDER}" stroke-width="0.5"/>
    <!-- Header bg -->
    <rect y="36" width="342" height="52" fill="${BG}"/>
    <!-- Logo pill -->
    <rect x="14" y="44" width="58" height="22" rx="11" fill="${ACC}" opacity="0.12"/>
    <text x="43" y="59" font-size="9" fill="${ACC}" font-family="system-ui" font-weight="800" text-anchor="middle" letter-spacing="2">SURGE</text>
    <!-- Screen title -->
    <text x="14" y="82" font-size="16" fill="${TEXT}" font-family="system-ui" font-weight="700">${screenName}</text>
    ${bentoPattern}
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ── Build hero HTML ────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${NAME} — ${TAGLINE}</title>
<style>
  :root {
    --bg: ${BG};
    --surf: ${SURF};
    --card: ${CARD};
    --border: ${BORDER};
    --acc: ${ACC};
    --acc2: ${ACC2};
    --green: ${GREEN};
    --amber: ${AMBER};
    --text: ${TEXT};
    --text2: ${TEXT2};
    --text3: ${TEXT3};
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }
  /* Import Inter */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

  /* ── NAV ── */
  nav {
    position: fixed; top:0; left:0; right:0; z-index:100;
    display: flex; align-items:center; justify-content:space-between;
    padding: 0 24px; height: 56px;
    background: rgba(7,10,15,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    display: flex; align-items:center; gap:10px;
    font-weight:800; font-size:14px; letter-spacing:3px; color:var(--acc);
  }
  .logo-pip {
    width:32px; height:32px; background:var(--acc); border-radius:8px;
    opacity:0.15; position:relative;
  }
  .nav-links { display:flex; gap:28px; }
  .nav-links a { color:var(--text2); text-decoration:none; font-size:13px; font-weight:500; transition:color 0.2s; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta {
    background: var(--acc); color: var(--bg);
    padding: 7px 18px; border-radius:20px;
    font-size:13px; font-weight:700; text-decoration:none;
    letter-spacing:0.3px;
    transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity:0.85; }

  /* ── HERO ── */
  .hero {
    padding: 120px 24px 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero-glow {
    position: absolute;
    top: 50%; left: 50%; transform: translate(-50%, -60%);
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.04) 40%, transparent 70%);
    pointer-events: none;
  }
  .hero-glow-2 {
    position: absolute;
    top: 60%; left: 30%; transform: translate(-50%, -50%);
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(255,82,64,0.07) 0%, transparent 60%);
    pointer-events: none;
  }
  .live-badge {
    display: inline-flex; align-items:center; gap:8px;
    background: rgba(52,201,122,0.1); border:1px solid rgba(52,201,122,0.25);
    color: var(--green); padding:5px 14px; border-radius:20px;
    font-size:11px; font-weight:700; letter-spacing:1.5px;
    margin-bottom: 28px;
  }
  .live-dot {
    width:6px; height:6px; border-radius:50%; background:var(--green);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); box-shadow:0 0 0 0 rgba(52,201,122,0.4); }
    50% { opacity:0.7; transform:scale(1.1); box-shadow:0 0 0 6px rgba(52,201,122,0); }
  }
  h1 {
    font-size: clamp(42px, 8vw, 80px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 20px;
    background: linear-gradient(135deg, var(--text) 0%, var(--text2) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  h1 span {
    background: linear-gradient(90deg, var(--acc), #0099CC);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .tagline {
    font-size:18px; color:var(--text2); font-weight:400; max-width:480px;
    margin: 0 auto 36px; line-height:1.6;
  }
  .hero-ctas { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  .btn-primary {
    background: var(--acc); color:var(--bg);
    padding: 13px 28px; border-radius:26px;
    font-weight:700; font-size:14px; text-decoration:none;
    transition:transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 30px rgba(0,212,255,0.25);
  }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 0 40px rgba(0,212,255,0.4); }
  .btn-ghost {
    border:1px solid var(--border); color:var(--text2);
    padding: 13px 28px; border-radius:26px;
    font-weight:500; font-size:14px; text-decoration:none;
    transition:border-color 0.2s, color 0.2s;
  }
  .btn-ghost:hover { border-color:var(--acc); color:var(--acc); }

  /* ── METRICS BAR ── */
  .metrics-bar {
    display: flex; justify-content:center; gap:0;
    background: var(--surf); border:1px solid var(--border);
    border-radius:16px; max-width:640px; margin: 40px auto 0;
    overflow: hidden;
  }
  .metric-item {
    flex:1; padding:20px 24px; text-align:center;
    border-right:1px solid var(--border); position:relative;
  }
  .metric-item:last-child { border-right:none; }
  .metric-val { font-size:24px; font-weight:700; color:var(--text); }
  .metric-val.cyan { color:var(--acc); }
  .metric-val.red { color:var(--acc2); }
  .metric-val.green { color:var(--green); }
  .metric-label { font-size:10px; color:var(--text3); letter-spacing:1.2px; font-weight:600; margin-top:4px; font-family:'JetBrains Mono', monospace; }

  /* ── SCREENS CAROUSEL ── */
  .screens-section {
    padding: 80px 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .section-label {
    text-align:center; font-size:11px; color:var(--acc);
    letter-spacing:2.5px; font-weight:700; margin-bottom:16px;
    font-family:'JetBrains Mono', monospace;
  }
  .section-title {
    text-align:center; font-size:32px; font-weight:700;
    color:var(--text); margin-bottom:12px; letter-spacing:-0.5px;
  }
  .section-sub {
    text-align:center; font-size:15px; color:var(--text2); max-width:500px;
    margin:0 auto 48px; line-height:1.6;
  }
  .screens-grid {
    display:grid; grid-template-columns:repeat(3, 1fr); gap:16px;
  }
  @media(max-width:700px) { .screens-grid { grid-template-columns:1fr 1fr; } }
  .screen-card {
    background: var(--surf); border:1px solid var(--border);
    border-radius:16px; overflow:hidden;
    transition:transform 0.25s, border-color 0.25s, box-shadow 0.25s;
    cursor:pointer;
  }
  .screen-card:hover {
    transform:translateY(-4px);
    border-color:rgba(0,212,255,0.35);
    box-shadow:0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.08);
  }
  .screen-card:nth-child(3):hover {
    border-color:rgba(255,82,64,0.35);
    box-shadow:0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,82,64,0.08);
  }
  .screen-img { width:100%; display:block; }
  .screen-name {
    padding:12px 16px;
    font-size:12px; font-weight:600; color:var(--text2);
    border-top:1px solid var(--border);
    font-family:'JetBrains Mono', monospace;
    letter-spacing:0.5px;
  }

  /* ── FEATURE BENTO ── */
  .features-section {
    padding: 40px 24px 80px;
    max-width: 880px; margin:0 auto;
  }
  .bento { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:600px) { .bento { grid-template-columns:1fr; } }
  .bento-card {
    background: var(--surf); border:1px solid var(--border);
    border-radius:16px; padding:28px; position:relative;
    overflow:hidden;
    transition:border-color 0.25s;
  }
  .bento-card:hover { border-color:rgba(0,212,255,0.25); }
  .bento-card.wide { grid-column:span 2; }
  @media(max-width:600px) { .bento-card.wide { grid-column:span 1; } }
  .bento-accent {
    position:absolute; top:0; left:0; right:0; height:2px;
    background: linear-gradient(90deg, var(--acc), transparent);
  }
  .bento-accent.red { background:linear-gradient(90deg, var(--acc2), transparent); }
  .bento-accent.green { background:linear-gradient(90deg, var(--green), transparent); }
  .bento-icon {
    width:40px; height:40px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:18px; margin-bottom:16px;
    background:rgba(0,212,255,0.1);
  }
  .bento-icon.red { background:rgba(255,82,64,0.1); }
  .bento-icon.green { background:rgba(52,201,122,0.1); }
  .bento-icon.amber { background:rgba(245,158,11,0.1); }
  .bento-title { font-size:16px; font-weight:700; color:var(--text); margin-bottom:8px; }
  .bento-body { font-size:13px; color:var(--text2); line-height:1.6; }

  /* ── PALETTE ── */
  .palette-section {
    padding: 40px 24px 80px;
    max-width:640px; margin:0 auto; text-align:center;
  }
  .swatches { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:24px; }
  .swatch {
    width:52px; height:52px; border-radius:12px;
    border:1px solid var(--border);
    position:relative; cursor:default;
  }
  .swatch-label {
    font-size:9px; color:var(--text3); margin-top:6px;
    font-family:'JetBrains Mono', monospace; text-align:center;
  }

  /* ── FOOTER ── */
  footer {
    border-top:1px solid var(--border);
    padding: 32px 24px;
    text-align:center;
    color: var(--text3);
    font-size:12px;
  }
  footer a { color:var(--acc); text-decoration:none; }
  .footer-links { display:flex; gap:24px; justify-content:center; margin-top:12px; }
  .footer-links a { color:var(--text3); text-decoration:none; font-size:12px; transition:color 0.2s; }
  .footer-links a:hover { color:var(--text2); }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">
    <div class="logo-pip"></div>
    SURGE
  </div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
  </div>
  <a href="https://ram.zenbin.org/surge-viewer" class="nav-cta">Open Viewer →</a>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow-2"></div>
  <div class="live-badge"><div class="live-dot"></div>DESIGN HEARTBEAT</div>
  <h1>Every <span>API call</span>,<br>accounted for</h1>
  <p class="tagline">Real-time observability for AI API usage. Track latency, error rates, cost, and incidents across every model endpoint — in one command center.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/surge-viewer" class="btn-primary">Open Viewer</a>
    <a href="https://ram.zenbin.org/surge-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
  <div class="metrics-bar">
    <div class="metric-item">
      <div class="metric-val cyan">48.3M</div>
      <div class="metric-label">REQUESTS/DAY</div>
    </div>
    <div class="metric-item">
      <div class="metric-val red">0.12%</div>
      <div class="metric-label">ERROR RATE</div>
    </div>
    <div class="metric-item">
      <div class="metric-val">186ms</div>
      <div class="metric-label">P99 LATENCY</div>
    </div>
    <div class="metric-item">
      <div class="metric-val green">99.97%</div>
      <div class="metric-label">UPTIME 30D</div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="section-label">6 SCREENS</div>
  <h2 class="section-title">Command. Monitor. Ship.</h2>
  <p class="section-sub">From bento-grid overview to per-endpoint analytics, incident command, and cost attribution.</p>
  <div class="screens-grid">
    ${pen.screens.map((sc, i) => `
    <div class="screen-card">
      <img class="screen-img" src="${screenSVG(sc.name, i)}" alt="${sc.name}" loading="lazy">
      <div class="screen-name">0${i+1} — ${sc.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features-section" id="features">
  <div class="section-label">FEATURES</div>
  <h2 class="section-title">Built for API-first teams</h2>
  <p class="section-sub">The observability layer your AI infrastructure deserves.</p>
  <div class="bento">
    <div class="bento-card">
      <div class="bento-accent"></div>
      <div class="bento-icon">◈</div>
      <div class="bento-title">Bento Command Dashboard</div>
      <div class="bento-body">Glow-card bento grid surfaces your most critical metrics at a glance — requests, error rates, latency, and cost side by side. Inspired by Mortons' cursor-tracking card glow treatment on DarkModeDesign.com.</div>
    </div>
    <div class="bento-card">
      <div class="bento-accent red"></div>
      <div class="bento-icon red">⚡</div>
      <div class="bento-title">Incident Command</div>
      <div class="bento-body">Active incident cards glow red with severity context, sparkline error data, and direct assignment. Resolved incidents collapse into a timeline so on-call engineers keep situational awareness.</div>
    </div>
    <div class="bento-card">
      <div class="bento-accent green"></div>
      <div class="bento-icon green">⊞</div>
      <div class="bento-title">Endpoint Health Matrix</div>
      <div class="bento-body">Per-endpoint latency, RPS, and error rate in a scannable table. Color-coded P99/P50/P95 breakdown. Mini health progress bars give instant visual signal without cognitive load.</div>
    </div>
    <div class="bento-card wide">
      <div class="bento-accent"></div>
      <div class="bento-icon amber">◎</div>
      <div class="bento-title">Cost Attribution by Model</div>
      <div class="bento-body">Track daily, weekly, and monthly API spend across every model — GPT-4o, Claude, Gemini, and open-source. Budget progress bars with projected end-of-month spend keep finance and engineering aligned. Zero surprises at invoice time.</div>
    </div>
  </div>
</section>

<section class="palette-section" id="palette">
  <div class="section-label">PALETTE</div>
  <h2 class="section-title">Developer-tool dark</h2>
  <p class="section-sub">Neon.com-inspired near-black base with electric cyan and alert red — calibrated for extended terminal-adjacent sessions.</p>
  <div class="swatches">
    ${[
      { hex:BG,    name:'BG' },
      { hex:SURF,  name:'Surface' },
      { hex:CARD,  name:'Card' },
      { hex:ACC,   name:'Cyan' },
      { hex:ACC2,  name:'Alert' },
      { hex:GREEN, name:'Success' },
      { hex:AMBER, name:'Warning' },
      { hex:TEXT,  name:'Text' },
      { hex:TEXT2, name:'Muted' },
    ].map(s => `
    <div>
      <div class="swatch" style="background:${s.hex};" title="${s.hex}"></div>
      <div class="swatch-label">${s.hex.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div>RAM Design Heartbeat — ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
  <div>SURGE — ${TAGLINE}</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/surge-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/surge-mock">☀◑ Interactive Mock</a>
  </div>
</footer>

</body>
</html>`;

// ── Inject pen into viewer ─────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} — https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} — https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
