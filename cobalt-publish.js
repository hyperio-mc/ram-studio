'use strict';
// COBALT hero page publisher

const https = require('https');
const fs    = require('fs');

const SLUG   = 'cobalt';
const DOMAIN = 'ram.zenbin.org';
const SUBDOMAIN = 'ram';

function post(path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: DOMAIN,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Subdomain': SUBDOMAIN,
        ...extraHeaders
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>COBALT — Developer Operations Command Center</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #08090E;
    --surf:    #10131C;
    --surf2:   #171B28;
    --border:  #1E2535;
    --text:    #CDD9EE;
    --dim:     #6B7FA0;
    --mint:    #3DFFA0;
    --violet:  #6E3FFF;
    --pink:    #FF3D8A;
    --amber:   #FFB93D;
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Scanline overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.06) 2px,
      rgba(0,0,0,0.06) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 56px;
    background: rgba(8,9,14,0.85);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
  }
  .nav-logo {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; font-weight: 700;
    color: var(--mint); letter-spacing: 0.3em;
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.25em;
    color: var(--dim); text-decoration: none;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }

  /* ── Hero ── */
  .hero {
    min-height: 100vh; padding-top: 56px;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .hero-glow {
    position: absolute; width: 700px; height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(61,255,160,0.06) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .hero-glow-2 {
    position: absolute; width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(110,63,255,0.08) 0%, transparent 70%);
    top: 30%; right: 10%;
    pointer-events: none;
  }
  .hero-inner {
    position: relative; z-index: 1;
    text-align: center; max-width: 800px; padding: 0 40px;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.4em;
    color: var(--mint); margin-bottom: 24px;
    padding: 6px 16px; border: 1px solid rgba(61,255,160,0.25);
    border-radius: 2px; background: rgba(61,255,160,0.05);
  }
  .hero-eyebrow::before { content: '●'; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .hero-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(52px, 9vw, 96px);
    font-weight: 700; color: var(--text);
    letter-spacing: 0.05em; line-height: 1;
    margin-bottom: 8px;
  }
  .hero-title span { color: var(--mint); }
  .hero-tagline {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.35em;
    color: var(--dim); margin-bottom: 40px;
  }
  .hero-desc {
    font-size: 16px; line-height: 1.7;
    color: var(--dim); max-width: 560px; margin: 0 auto 48px;
  }
  .hero-desc strong { color: var(--text); font-weight: 500; }
  .hero-actions { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }
  .btn-primary {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.2em;
    color: var(--bg); background: var(--mint);
    border: none; padding: 14px 28px; border-radius: 2px;
    cursor: pointer; text-decoration: none;
    font-weight: 700; transition: opacity 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 20px rgba(61,255,160,0.3);
  }
  .btn-primary:hover { opacity: 0.9; box-shadow: 0 0 32px rgba(61,255,160,0.5); }
  .btn-secondary {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.2em;
    color: var(--text);
    border: 1px solid var(--border);
    background: transparent; padding: 14px 28px; border-radius: 2px;
    cursor: pointer; text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--dim); }

  /* ── Terminal preview ── */
  .terminal-preview {
    margin: 100px auto 0; max-width: 720px; padding: 0 40px;
  }
  .terminal-frame {
    background: #060708;
    border: 1px solid rgba(61,255,160,0.2);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 0 60px rgba(61,255,160,0.06), 0 40px 80px rgba(0,0,0,0.6);
  }
  .terminal-chrome {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(61,255,160,0.1);
    background: #0A0B10;
  }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-r { background: #FF5F5F; } .dot-y { background: #FFBD2E; } .dot-g { background: #28C840; }
  .terminal-path {
    flex: 1; text-align: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: var(--dim); letter-spacing: 0.15em;
  }
  .terminal-body { padding: 20px 24px; }
  .t-line { font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.8; }
  .t-prompt { color: var(--mint); }
  .t-cmd { color: var(--text); }
  .t-out-ok { color: #6B7FA0; }
  .t-out-warn { color: var(--amber); }
  .t-cursor { display: inline-block; width: 8px; height: 14px; background: var(--mint); animation: blink 1.1s step-end infinite; vertical-align: middle; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* ── Bento grid preview ── */
  .bento-section { max-width: 1100px; margin: 100px auto; padding: 0 40px; }
  .section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.4em;
    color: var(--mint); margin-bottom: 40px; text-align: center;
  }
  .bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 10px; }
  .cell {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: 6px; padding: 20px;
    min-height: 120px;
  }
  .cell-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px; letter-spacing: 0.3em;
    color: var(--dim); margin-bottom: 12px;
  }
  .cell-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 32px; font-weight: 700; color: var(--text);
    line-height: 1;
  }
  .cell-value.mint { color: var(--mint); font-size: 36px; }
  .cell-badge {
    display: inline-block; margin-top: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; padding: 3px 8px; border-radius: 2px;
  }
  .cell-a1 { grid-column: span 3; grid-row: span 2; border-color: rgba(61,255,160,0.2); box-shadow: 0 0 30px rgba(61,255,160,0.05); }
  .cell-a2 { grid-column: span 3; }
  .cell-a3 { grid-column: span 3; }
  .cell-a4 { grid-column: span 3; }
  .cell-b1 { grid-column: span 6; }
  .cell-b2 { grid-column: span 3; }
  .cell-c1 { grid-column: span 9; }
  .cell-c2 { grid-column: span 3; background: #060708; border-color: rgba(61,255,160,0.15); }
  .sparkline-mock {
    height: 28px; margin-top: 12px;
    background: linear-gradient(90deg, transparent 0%, rgba(61,255,160,0.5) 50%, rgba(61,255,160,0.15) 100%);
    border-radius: 2px; opacity: 0.6;
  }
  .service-row { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
  .svc-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .svc-name { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--dim); flex: 1; }
  .svc-latency { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text); }
  .bar-container { margin-top: 10px; }
  .bar-bg { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 4px; }
  .bar-fill { height: 100%; border-radius: 2px; }

  /* ── Features ── */
  .features { max-width: 1000px; margin: 100px auto; padding: 0 40px; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feature-card {
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 6px; padding: 28px;
  }
  .feature-icon {
    font-family: 'JetBrains Mono', monospace;
    font-size: 20px; color: var(--mint);
    margin-bottom: 16px;
  }
  .feature-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.2em; color: var(--text);
    margin-bottom: 10px;
  }
  .feature-desc { font-size: 13px; line-height: 1.6; color: var(--dim); }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--border); padding: 32px 40px;
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 100px;
  }
  .footer-logo {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; font-weight: 700;
    color: var(--mint); letter-spacing: 0.3em;
  }
  .footer-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; color: var(--dim); letter-spacing: 0.2em;
  }

  @media (max-width: 768px) {
    nav { padding: 0 20px; } .nav-links { display: none; }
    .bento-grid { grid-template-columns: 1fr 1fr; }
    .cell-a1, .cell-a2, .cell-a3, .cell-a4, .cell-b1, .cell-b2, .cell-c1, .cell-c2 { grid-column: span 1; }
    .features-grid { grid-template-columns: 1fr; }
    footer { flex-direction: column; gap: 16px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">COBALT</div>
  <div class="nav-links">
    <a href="#">OVERVIEW</a>
    <a href="#">FEATURES</a>
    <a href="#">DOCS</a>
    <a href="#" style="color:var(--mint)">LAUNCH APP →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow-2"></div>
  <div class="hero-inner">
    <div class="hero-eyebrow">DEVELOPER OPERATIONS CENTER</div>
    <h1 class="hero-title">CO<span>BALT</span></h1>
    <p class="hero-tagline">YOUR STACK. ONE TERMINAL.</p>
    <p class="hero-desc">
      The <strong>command center for engineering teams</strong> who care about visibility.
      Real-time deployments, repository health, live log streams, and contributor insights —
      all in a single dark-mode OS-style interface.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/cobalt-mock" class="btn-primary">LAUNCH MOCK →</a>
      <a href="https://ram.zenbin.org/cobalt-viewer" class="btn-secondary">VIEW DESIGN</a>
    </div>
  </div>
</section>

<div class="terminal-preview">
  <div class="terminal-frame">
    <div class="terminal-chrome">
      <div class="dot dot-r"></div>
      <div class="dot dot-y"></div>
      <div class="dot dot-g"></div>
      <div class="terminal-path">cobalt@core:~$</div>
    </div>
    <div class="terminal-body">
      <div class="t-line"><span class="t-prompt">→ </span><span class="t-cmd">cobalt status --live</span></div>
      <div class="t-line"><span class="t-out-ok">● api-gateway      UP    12ms   load 64%</span></div>
      <div class="t-line"><span class="t-out-ok">● auth-service     UP    8ms    load 31%</span></div>
      <div class="t-line" style="color:var(--amber)">● ml-pipeline      ⚠     340ms  load 82%   GPU memory high</div>
      <div class="t-line"><span class="t-out-ok">● billing-svc      UP    14ms   load 22%</span></div>
      <div class="t-line"><span class="t-out-ok">● cdn-edge         UP    4ms    load 17%</span></div>
      <div class="t-line" style="margin-top:8px"><span class="t-prompt">→ </span><span class="t-cmd">cobalt deploys --today</span></div>
      <div class="t-line"><span class="t-out-ok">14 deployments — 12 success  1 running  1 failed</span></div>
      <div class="t-line"><span class="t-prompt">→ </span><span class="t-cursor"></span></div>
    </div>
  </div>
</div>

<section class="bento-section">
  <div class="section-label">BENTO COMMAND GRID</div>
  <div class="bento-grid">
    <div class="cell cell-a1">
      <div class="cell-label">UPTIME</div>
      <div class="cell-value mint">99.97%</div>
      <div class="sparkline-mock"></div>
    </div>
    <div class="cell cell-a2">
      <div class="cell-label">DEPLOYS TODAY</div>
      <div class="cell-value">14</div>
      <span class="cell-badge" style="color:#3DFFA0;background:rgba(61,255,160,0.1)">+3 vs yesterday</span>
    </div>
    <div class="cell cell-a3">
      <div class="cell-label">OPEN PRS</div>
      <div class="cell-value">28</div>
      <span class="cell-badge" style="color:#FFB93D;background:rgba(255,185,61,0.1)">6 awaiting review</span>
    </div>
    <div class="cell cell-a4">
      <div class="cell-label">ERROR RATE</div>
      <div class="cell-value">0.03%</div>
      <span class="cell-badge" style="color:#3DFFA0;background:rgba(61,255,160,0.1)">↓ from 0.04%</span>
    </div>
    <div class="cell cell-b1">
      <div class="cell-label">RECENT DEPLOYMENTS</div>
      <div class="service-row"><div class="svc-dot" style="background:#3DFFA0"></div><div class="svc-name">api-gateway v3.14.2 → prod</div><div class="svc-latency" style="color:#3DFFA0">SUCCESS</div></div>
      <div class="service-row"><div class="svc-dot" style="background:#3DFFA0"></div><div class="svc-name">auth-service v2.1.0 → prod</div><div class="svc-latency" style="color:#3DFFA0">SUCCESS</div></div>
      <div class="service-row"><div class="svc-dot" style="background:#6E3FFF"></div><div class="svc-name">ml-pipeline v1.9.0 → stg</div><div class="svc-latency" style="color:#6E3FFF">RUNNING</div></div>
      <div class="service-row"><div class="svc-dot" style="background:#FF3D8A"></div><div class="svc-name">billing-svc v2.3.1 → prod</div><div class="svc-latency" style="color:#FF3D8A">FAILED</div></div>
    </div>
    <div class="cell cell-b2">
      <div class="cell-label">COMMITS / 7D</div>
      <div class="cell-value">143</div>
      <div class="bar-container">
        <div class="bar-bg"><div class="bar-fill" style="width:80%;background:#6E3FFF"></div></div>
        <div class="bar-bg" style="margin-top:6px"><div class="bar-fill" style="width:60%;background:#6E3FFF;opacity:0.6"></div></div>
        <div class="bar-bg" style="margin-top:6px"><div class="bar-fill" style="width:90%;background:#6E3FFF;opacity:0.4"></div></div>
        <div class="bar-bg" style="margin-top:6px"><div class="bar-fill" style="width:45%;background:#6E3FFF;opacity:0.3"></div></div>
      </div>
    </div>
    <div class="cell cell-c1">
      <div class="cell-label">SERVICE HEALTH</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:8px">
        <div><div class="service-row"><div class="svc-dot" style="background:#3DFFA0"></div><div class="svc-name">API Gateway</div><div class="svc-latency">12ms</div></div><div class="bar-bg"><div class="bar-fill" style="width:64%;background:#3DFFA0;opacity:0.6"></div></div></div>
        <div><div class="service-row"><div class="svc-dot" style="background:#3DFFA0"></div><div class="svc-name">Auth Service</div><div class="svc-latency">8ms</div></div><div class="bar-bg"><div class="bar-fill" style="width:31%;background:#3DFFA0;opacity:0.6"></div></div></div>
        <div><div class="service-row"><div class="svc-dot" style="background:#3DFFA0"></div><div class="svc-name">DB Primary</div><div class="svc-latency">2ms</div></div><div class="bar-bg"><div class="bar-fill" style="width:48%;background:#3DFFA0;opacity:0.6"></div></div></div>
        <div><div class="service-row"><div class="svc-dot" style="background:#FFB93D"></div><div class="svc-name">ML Pipeline</div><div class="svc-latency">340ms</div></div><div class="bar-bg"><div class="bar-fill" style="width:82%;background:#FFB93D;opacity:0.6"></div></div></div>
        <div><div class="service-row"><div class="svc-dot" style="background:#3DFFA0"></div><div class="svc-name">CDN Edge</div><div class="svc-latency">4ms</div></div><div class="bar-bg"><div class="bar-fill" style="width:17%;background:#3DFFA0;opacity:0.6"></div></div></div>
        <div><div class="service-row"><div class="svc-dot" style="background:#3DFFA0"></div><div class="svc-name">Queue Worker</div><div class="svc-latency">—</div></div><div class="bar-bg"><div class="bar-fill" style="width:55%;background:#3DFFA0;opacity:0.6"></div></div></div>
      </div>
    </div>
    <div class="cell cell-c2">
      <div class="cell-label">TERMINAL</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:9px;line-height:1.9">
        <div style="color:#3DFFA0">$ cobalt status</div>
        <div style="color:#6B7FA0">● api     UP</div>
        <div style="color:#6B7FA0">● auth    UP</div>
        <div style="color:#FFB93D">● ml      ⚠</div>
        <div style="color:#6B7FA0">● billing UP</div>
        <div style="color:#3DFFA0">_<span style="animation:blink 1s infinite">▌</span></div>
      </div>
    </div>
  </div>
</section>

<section class="features">
  <div class="section-label">DESIGNED FOR ENGINEERING TEAMS</div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⌗</div>
      <div class="feature-title">BENTO COMMAND GRID</div>
      <p class="feature-desc">A spatial dashboard that gives every metric its own visual weight — uptime, PRs, error rates, and deployments coexist without hierarchy fights.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▶</div>
      <div class="feature-title">LIVE LOG STREAM</div>
      <p class="feature-desc">Terminal-native log viewer with real-time filtering. ERROR, WARN, INFO — all in monospaced clarity on a near-black substrate with scanline texture.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">PIPELINE VISIBILITY</div>
      <p class="feature-desc">Each deployment's four-stage journey — build, test, security, deploy — rendered as a progress chain. Green is good. Pink means wake someone up.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">△</div>
      <div class="feature-title">REPOSITORY HEALTH</div>
      <p class="feature-desc">Per-repo health scores, language breakdowns, and PR backlogs in a scannable list. CI failures surface with an orange alert badge.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">CONTRIBUTOR INSIGHTS</div>
      <p class="feature-desc">Commit streaks, code ownership maps, and team activity pulse charts. Know who owns what — and who's been heads-down this sprint.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-title">NEON-ON-BLACK PALETTE</div>
      <p class="feature-desc">Deep space black (#08090E), neon mint accents (#3DFFA0), electric violet for secondary data. Inspired by Neon DB and Evervault's dark UI language.</p>
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">COBALT</div>
  <div class="footer-meta">RAM DESIGN HEARTBEAT · ${new Date().toISOString().split('T')[0].replace(/-/g,'.')} · DARK THEME</div>
</footer>

</body>
</html>`;

async function main() {
  console.log('Publishing COBALT hero page...');
  const res = await post('/publish', { slug: SLUG, html: heroHtml, title: 'COBALT — Developer Operations Command Center' });
  if (res.status === 200 || res.status === 201) {
    console.log(`✓ Hero: https://${DOMAIN}/${SLUG}`);
  } else {
    console.log('Hero publish failed:', res.status, res.body.slice(0, 200));
  }
}

main().catch(console.error);
