#!/usr/bin/env node
// WATCH publish — hero page + viewer
const fs    = require('fs');
const https = require('https');

const SLUG      = 'watch';
const APP_NAME  = 'WATCH';
const TAGLINE   = 'Your stack, always on.';
const SUBDOMAIN = 'ram';

function zenPost(pageId, html, title) {
  const body = JSON.stringify({ html, title: title || pageId });
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'zenbin.org',
      path:     `/v1/pages/${pageId}`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'X-Subdomain':    SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HERO HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>WATCH — Your stack, always on.</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#070709;
  --surface:#0D0E12;
  --surfup:#12141A;
  --surfhigh:#181B23;
  --border:rgba(255,255,255,0.06);
  --borderup:rgba(255,255,255,0.11);
  --borderacc:rgba(0,255,176,0.28);
  --text:#E8E9F3;
  --mid:#888CA8;
  --faint:rgba(232,233,243,0.30);
  --accent:#00FFB0;
  --accsoft:rgba(0,255,176,0.10);
  --accmid:rgba(0,255,176,0.20);
  --indigo:#6366F1;
  --amber:#F59E0B;
  --red:#F43F5E;
}
html{scroll-behavior:smooth}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:60px;background:rgba(7,7,9,0.88);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
.nav-logo{font-family:'IBM Plex Mono',monospace;font-size:15px;font-weight:600;letter-spacing:0.10em;color:var(--text)}
.nav-logo span{color:var(--accent)}
.nav-links{display:flex;gap:28px}
.nav-links a{font-size:12px;color:var(--mid);text-decoration:none;font-family:'IBM Plex Mono',monospace;letter-spacing:0.04em}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#070709;border:none;padding:7px 18px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:'IBM Plex Mono',monospace;letter-spacing:0.04em}

/* HERO */
.hero{padding:130px 40px 80px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);width:600px;height:600px;background:radial-gradient(ellipse,rgba(0,255,176,0.06) 0%,transparent 70%);pointer-events:none}
.hero-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:600;letter-spacing:0.18em;color:var(--mid);text-transform:uppercase;margin-bottom:20px}
.hero-score{font-family:'IBM Plex Mono',monospace;font-size:clamp(72px,10vw,110px);font-weight:700;color:var(--accent);letter-spacing:-0.03em;line-height:1;margin-bottom:8px;text-shadow:0 0 60px rgba(0,255,176,0.25)}
.hero-label{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.14em;color:var(--mid);text-transform:uppercase;margin-bottom:28px}
.hero-title{font-size:clamp(32px,5vw,52px);font-weight:800;color:var(--text);letter-spacing:-0.03em;line-height:1.1;max-width:680px;margin:0 auto 20px}
.hero-sub{font-size:16px;color:var(--mid);line-height:1.65;max-width:540px;margin:0 auto 40px}
.hero-ctas{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
.cta-primary{background:var(--accent);color:#070709;border:none;padding:13px 30px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:'IBM Plex Mono',monospace;letter-spacing:0.04em;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
.cta-secondary{background:transparent;color:var(--text);border:1px solid var(--borderup);padding:12px 28px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:'IBM Plex Mono',monospace;letter-spacing:0.04em;text-decoration:none}
.cta-secondary:hover{border-color:var(--borderacc);color:var(--accent)}

/* STATUS BAR */
.status-bar{max-width:800px;margin:0 auto 80px;display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap;padding:0 40px}
.status-chip{display:flex;align-items:center;gap:8px;padding:8px 16px;background:var(--surface);border:1px solid var(--border);border-radius:8px}
.status-dot{width:8px;height:8px;border-radius:50%}
.status-chip-text{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;color:var(--mid)}
.status-chip-val{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:600;color:var(--text)}

/* TICKER */
.ticker-wrap{background:var(--surfup);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:10px 0;overflow:hidden;white-space:nowrap;margin-bottom:80px}
.ticker-inner{display:inline-flex;gap:60px;animation:ticker 24s linear infinite}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.ticker-item{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;color:var(--mid);letter-spacing:0.06em}
.ticker-item span{color:var(--accent)}

/* FEATURES */
.section{max-width:1100px;margin:0 auto;padding:0 40px 80px}
.section-label{font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:600;letter-spacing:0.18em;color:var(--mid);text-transform:uppercase;margin-bottom:14px}
.section-title{font-size:clamp(26px,4vw,40px);font-weight:800;color:var(--text);letter-spacing:-0.025em;line-height:1.2;margin-bottom:48px;max-width:560px}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
.feature-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px;transition:border-color 0.2s}
.feature-card:hover{border-color:var(--borderacc)}
.feature-icon{width:36px;height:36px;background:var(--accsoft);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:16px;border:1px solid var(--borderacc)}
.feature-name{font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px;letter-spacing:-0.01em}
.feature-desc{font-size:13px;color:var(--mid);line-height:1.6}

/* METRICS ROW */
.metrics-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:900px;margin:0 auto 80px;padding:0 40px}
.metric-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;text-align:center}
.metric-val{font-family:'IBM Plex Mono',monospace;font-size:32px;font-weight:700;color:var(--accent);margin-bottom:4px}
.metric-label{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;letter-spacing:0.12em;color:var(--mid);text-transform:uppercase}

/* SERVICE DEMO */
.services-demo{max-width:600px;margin:0 auto 80px;padding:0 40px}
.svc-row{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px 18px;margin-bottom:8px}
.svc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.svc-name{font-size:13px;font-weight:500;color:var(--text);flex:1}
.svc-region{font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:400;color:var(--faint);margin-left:8px}
.svc-uptime{font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;margin-left:auto}
.svc-rt{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:400;color:var(--mid);margin-left:12px}

/* CTA SECTION */
.cta-section{text-align:center;padding:60px 40px 100px;position:relative}
.cta-section::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:200px;background:radial-gradient(ellipse,rgba(0,255,176,0.05) 0%,transparent 70%);pointer-events:none}
.cta-section h2{font-size:clamp(26px,4vw,42px);font-weight:800;color:var(--text);letter-spacing:-0.025em;line-height:1.2;max-width:520px;margin:0 auto 16px}
.cta-section p{font-size:15px;color:var(--mid);margin:0 auto 36px;max-width:420px}

/* FOOTER */
footer{border-top:1px solid var(--border);padding:28px 40px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
footer .logo{font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;letter-spacing:0.10em;color:var(--mid)}
footer .credit{font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:var(--faint)}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">WATCH<span>●</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#services">Services</a>
    <a href="https://ram.zenbin.org/watch-viewer">Design →</a>
  </div>
  <button class="nav-cta" onclick="window.open('https://ram.zenbin.org/watch-mock','_blank')">Open Mock ↗</button>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">Infrastructure Monitoring · Always-On Alerting</div>
  <div class="hero-score">99.8%</div>
  <div class="hero-label">System Health Score</div>
  <h1 class="hero-title">Know the moment your stack breaks</h1>
  <p class="hero-sub">WATCH gives your engineering team a live pulse on every service — uptime, incidents, on-call rotation, and alert rules. No noise. No lag.</p>
  <div class="hero-ctas">
    <a class="cta-primary" href="https://ram.zenbin.org/watch-mock">View Interactive Mock ↗</a>
    <a class="cta-secondary" href="https://ram.zenbin.org/watch-viewer">Design Viewer</a>
  </div>
</section>

<!-- STATUS CHIPS -->
<div class="status-bar">
  <div class="status-chip"><div class="status-dot" style="background:#00FFB0"></div><span class="status-chip-text">API Gateway &nbsp;</span><span class="status-chip-val">99.98%</span></div>
  <div class="status-chip"><div class="status-dot" style="background:#00FFB0"></div><span class="status-chip-text">Auth &nbsp;</span><span class="status-chip-val">100.0%</span></div>
  <div class="status-chip"><div class="status-dot" style="background:#F59E0B"></div><span class="status-chip-text">DB Cluster &nbsp;</span><span class="status-chip-val">99.12%</span></div>
  <div class="status-chip"><div class="status-dot" style="background:#F43F5E"></div><span class="status-chip-text">Queue Worker &nbsp;</span><span class="status-chip-val">OUTAGE</span></div>
</div>

<!-- TICKER -->
<div class="ticker-wrap">
  <div class="ticker-inner">
    <span class="ticker-item">✦ WATCH MONITOR · <span>16 SERVICES TRACKED</span></span>
    <span class="ticker-item">★ INC-0291 · QUEUE WORKER · <span>ACTIVE OUTAGE</span></span>
    <span class="ticker-item">✦ P95 RESPONSE · <span>64ms AVG</span></span>
    <span class="ticker-item">⟳ ON-CALL · <span>SOFIA LIN</span> · SRE TEAM</span>
    <span class="ticker-item">✦ 90-DAY UPTIME · <span>99.93% AVG</span></span>
    <span class="ticker-item">★ MTTA · <span>3m 24s</span> · MTTR · <span>47m</span></span>
    <span class="ticker-item">✦ WATCH MONITOR · <span>16 SERVICES TRACKED</span></span>
    <span class="ticker-item">★ INC-0291 · QUEUE WORKER · <span>ACTIVE OUTAGE</span></span>
    <span class="ticker-item">✦ P95 RESPONSE · <span>64ms AVG</span></span>
    <span class="ticker-item">⟳ ON-CALL · <span>SOFIA LIN</span> · SRE TEAM</span>
  </div>
</div>

<!-- FEATURES -->
<section class="section" id="features">
  <div class="section-label">Built for SRE teams</div>
  <h2 class="section-title">Everything your on-call needs, nothing else</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-name">Live Health Score</div>
      <div class="feature-desc">A single composited score across all your services — updated every 12 seconds. Know system state at a glance, not after reading 30 graphs.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <div class="feature-name">Incident Timeline</div>
      <div class="feature-desc">Every incident automatically tracked with severity, duration, affected service, and resolution note. Open/resolved filter keeps your feed clean.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔔</div>
      <div class="feature-name">Smart Alert Rules</div>
      <div class="feature-desc">Route to PagerDuty, Slack, or Email per-service. Toggle rules on/off instantly. See when each rule last fired without leaving the screen.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⟳</div>
      <div class="feature-name">On-Call Rotation</div>
      <div class="feature-desc">Who's on right now, who's next, and the full week rotation. MTTA/MTTR stats per rotation period. Escalate in one tap.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≡</div>
      <div class="feature-name">Service Detail</div>
      <div class="feature-desc">Per-service uptime bars, response time history, region, and 90-day sparkline. Degraded services get an accent stripe so they always catch your eye.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">〰</div>
      <div class="feature-name">90-Day Pulse Chart</div>
      <div class="feature-desc">A bar-by-bar history of every day your stack was up, degraded, or down. Instantly see patterns — that recurring Friday 3am degradation? WATCH sees it.</div>
    </div>
  </div>
</section>

<!-- METRICS -->
<div class="metrics-row">
  <div class="metric-card"><div class="metric-val">3m 24s</div><div class="metric-label">Avg MTTA</div></div>
  <div class="metric-card"><div class="metric-val">99.93%</div><div class="metric-label">90-Day Uptime</div></div>
  <div class="metric-card"><div class="metric-val">47m</div><div class="metric-label">Avg MTTR</div></div>
</div>

<!-- SERVICE DEMO -->
<section class="services-demo" id="services">
  <div style="text-align:center;margin-bottom:24px">
    <div class="section-label" style="display:inline-block">Live service status</div>
  </div>
  <div class="svc-row"><div class="svc-dot" style="background:#00FFB0"></div><span class="svc-name">API Gateway</span><span class="svc-region">us-east-1</span><span class="svc-uptime" style="color:#00FFB0">99.98%</span><span class="svc-rt">42ms</span></div>
  <div class="svc-row"><div class="svc-dot" style="background:#00FFB0"></div><span class="svc-name">Auth Service</span><span class="svc-region">global</span><span class="svc-uptime" style="color:#00FFB0">100.0%</span><span class="svc-rt">18ms</span></div>
  <div class="svc-row" style="border-color:rgba(245,158,11,0.4)"><div class="svc-dot" style="background:#F59E0B"></div><span class="svc-name">Database Cluster</span><span class="svc-region">us-west-2</span><span class="svc-uptime" style="color:#F59E0B">99.12%</span><span class="svc-rt">187ms</span></div>
  <div class="svc-row"><div class="svc-dot" style="background:#00FFB0"></div><span class="svc-name">CDN Edge</span><span class="svc-region">global</span><span class="svc-uptime" style="color:#00FFB0">99.99%</span><span class="svc-rt">8ms</span></div>
  <div class="svc-row" style="border-color:rgba(244,63,94,0.4)"><div class="svc-dot" style="background:#F43F5E"></div><span class="svc-name">Queue Worker</span><span class="svc-region">us-east-1</span><span class="svc-uptime" style="color:#F43F5E">97.43%</span><span class="svc-rt">—</span></div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2>Ship with confidence. Rest easy on-call.</h2>
  <p>WATCH keeps your entire team aligned on infrastructure health — from the first deploy to the midnight incident.</p>
  <div class="hero-ctas">
    <a class="cta-primary" href="https://ram.zenbin.org/watch-mock">Open Interactive Mock ↗</a>
    <a class="cta-secondary" href="https://ram.zenbin.org/watch-viewer">View Design Screens</a>
  </div>
</section>

<footer>
  <span class="logo">WATCH●</span>
  <span class="credit">RAM Design Heartbeat · ram.zenbin.org/watch · Inspired by Interfere (land-book) + Neon UI (darkmodedesign)</span>
</footer>

</body>
</html>`;

// ── VIEWER HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8').replace('<title>Pencil Viewer</title>', '<title>WATCH — Design Viewer</title>');
const penJson = fs.readFileSync('/workspace/group/design-studio/watch.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero page...');
  const r1 = await zenPost('watch', heroHtml, 'WATCH — Your stack, always on.');
  console.log('Hero:', r1.status, r1.body.slice(0,80));

  console.log('Publishing viewer...');
  const r2 = await zenPost('watch-viewer', viewerHtml, 'WATCH — Design Viewer');
  console.log('Viewer:', r2.status, r2.body.slice(0,80));

  if (r1.status === 200 && r2.status === 200) {
    console.log('\n✓ Published:');
    console.log('  Hero   → https://ram.zenbin.org/watch');
    console.log('  Viewer → https://ram.zenbin.org/watch-viewer');
  }
})();
