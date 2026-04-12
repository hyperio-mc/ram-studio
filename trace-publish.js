// TRACE — publish hero page + viewer
const https = require('https');
const fs = require('fs');
const path = require('path');

const SLUG = 'trace';
const APP_NAME = 'TRACE';
const TAGLINE = 'API Observability Engine';
const SUBDOMAIN = 'ram';

function post(pathname, body, subdomain) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'zenbin.org',
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Subdomain': subdomain,
      }
    }, res => {
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
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TRACE — API Observability Engine</title>
<style>
  :root {
    --bg: #080B14;
    --surface: #0F1420;
    --surface2: #151B2E;
    --border: #1E2840;
    --text: #E8EDF5;
    --muted: #4A5568;
    --accent: #00FF88;
    --blue: #5B8DEF;
    --warn: #FFB547;
    --danger: #FF4D6D;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', 'Helvetica Neue', sans-serif; overflow-x: hidden; }
  a { color: inherit; text-decoration: none; }

  /* ── Nav ── */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: rgba(8,11,20,0.92);
    backdrop-filter: blur(12px); z-index: 100;
  }
  .nav-brand {
    font-size: 16px; font-weight: 700; letter-spacing: 3px;
    color: var(--text);
  }
  .nav-links { display: flex; gap: 32px; font-size: 12px; letter-spacing: 1.5px; color: var(--muted); }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    font-size: 11px; letter-spacing: 1.5px; padding: 8px 20px;
    border: 1px solid var(--accent); color: var(--accent);
    border-radius: 4px; cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .nav-cta:hover { background: var(--accent); color: var(--bg); }

  /* ── Hero ── */
  .hero {
    min-height: 100vh; display: flex; align-items: center;
    padding: 80px 48px 120px;
    position: relative; overflow: hidden;
  }
  .hero-grid {
    display: grid; grid-template-columns: 1fr 420px; gap: 80px;
    align-items: center; max-width: 1200px; margin: 0 auto; width: 100%;
  }
  .hero-label {
    font-size: 10px; letter-spacing: 3px; color: var(--accent);
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }
  .hero-label::before {
    content: ''; display: block; width: 24px; height: 1px; background: var(--accent);
  }
  .hero-title {
    font-size: clamp(52px, 6vw, 88px);
    font-weight: 700; letter-spacing: -2px; line-height: 1;
    margin-bottom: 8px;
  }
  .hero-title span { color: var(--accent); }
  .hero-tagline {
    font-size: clamp(18px, 2.5vw, 26px);
    color: var(--muted); letter-spacing: 2px;
    text-transform: uppercase; margin-bottom: 32px; font-weight: 300;
  }
  .hero-desc {
    font-size: 16px; line-height: 1.7; color: var(--muted);
    max-width: 520px; margin-bottom: 48px;
  }
  .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
  .btn-primary {
    padding: 14px 32px; background: var(--accent); color: var(--bg);
    font-size: 12px; font-weight: 700; letter-spacing: 2px;
    border-radius: 4px; cursor: pointer; border: none;
    transition: opacity 0.2s;
    text-transform: uppercase;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-secondary {
    padding: 14px 32px; border: 1px solid var(--border); color: var(--muted);
    font-size: 12px; letter-spacing: 2px; border-radius: 4px; cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    text-transform: uppercase;
  }
  .btn-secondary:hover { border-color: var(--text); color: var(--text); }

  /* ── Phone mockup ── */
  .phone-wrap {
    display: flex; justify-content: center; align-items: center;
    position: relative;
  }
  .phone {
    width: 240px; background: var(--surface);
    border-radius: 32px; padding: 12px;
    border: 1px solid var(--border);
    box-shadow: 0 0 60px rgba(0,255,136,0.08), 0 0 120px rgba(91,141,239,0.06);
    position: relative; z-index: 2;
  }
  .phone-screen {
    width: 100%; border-radius: 22px; overflow: hidden;
    aspect-ratio: 390/844; background: var(--bg);
    font-size: 7px; padding: 8px;
    font-family: 'Courier New', monospace;
  }
  .phone-screen .ps-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4px 4px 6px;
    border-bottom: 1px solid var(--border); margin-bottom: 4px;
  }
  .phone-screen .ps-brand { color: var(--text); font-weight: 700; letter-spacing: 2px; }
  .phone-screen .ps-live {
    background: #001A0D; border: 1px solid var(--accent);
    color: var(--accent); padding: 1px 5px; border-radius: 10px; font-size: 6px;
    display: flex; align-items: center; gap: 2px;
  }
  .phone-screen .ps-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }
  .phone-screen .ps-big { font-size: 28px; font-weight: 700; color: var(--accent); line-height: 1; margin: 4px 0 0; }
  .phone-screen .ps-sub { font-size: 5px; color: var(--muted); letter-spacing: 1.5px; margin-bottom: 6px; }
  .phone-screen .ps-cards {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; margin-bottom: 6px;
  }
  .phone-screen .ps-card {
    background: var(--surface2); border-radius: 4px; padding: 3px 4px;
    border: 1px solid var(--border);
  }
  .phone-screen .ps-card-label { color: var(--muted); font-size: 5px; letter-spacing: 1px; }
  .phone-screen .ps-card-val { font-weight: 700; }
  .phone-screen .ps-card-val.blue { color: var(--blue); }
  .phone-screen .ps-card-val.green { color: var(--accent); }
  .phone-screen .ps-section-label { color: var(--muted); font-size: 5px; letter-spacing: 1.5px; margin-bottom: 2px; }
  .phone-screen .ps-endpoint {
    background: var(--surface2); border-radius: 3px; padding: 3px 4px;
    margin-bottom: 2px; border: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .phone-screen .ps-ep-path { color: var(--text); }
  .phone-screen .ps-ep-lat { color: var(--accent); }
  .phone-screen .ps-ep-lat.warn { color: var(--warn); }
  .phone-screen .ps-nav {
    display: flex; border-top: 1px solid var(--border);
    margin-top: auto; padding-top: 4px; margin-top: 4px;
  }
  .phone-screen .ps-nav-item {
    flex: 1; text-align: center; color: var(--muted); font-size: 5px;
  }
  .phone-screen .ps-nav-item.active { color: var(--accent); }
  /* Glow rings behind phone */
  .phone-glow {
    position: absolute; border-radius: 50%; filter: blur(60px); z-index: 1;
    pointer-events: none;
  }
  .glow-green { width: 300px; height: 300px; background: rgba(0,255,136,0.07); top: -20px; left: 50%; transform: translateX(-50%); }
  .glow-blue { width: 250px; height: 250px; background: rgba(91,141,239,0.06); bottom: 0; left: 30%; }

  /* ── Big stats ── */
  .stats-section {
    padding: 80px 48px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .stats-inner { max-width: 1200px; margin: 0 auto; }
  .stats-label {
    font-size: 9px; letter-spacing: 3px; color: var(--muted);
    margin-bottom: 40px; text-transform: uppercase;
  }
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); }
  .stat-cell {
    background: var(--bg); padding: 40px 32px;
  }
  .stat-num {
    font-size: 56px; font-weight: 700; line-height: 1;
    font-family: 'Courier New', monospace; margin-bottom: 4px;
  }
  .stat-num.green { color: var(--accent); }
  .stat-num.blue  { color: var(--blue);   }
  .stat-num.white { color: var(--text);   }
  .stat-unit { font-size: 18px; color: var(--muted); font-family: 'Courier New', monospace; }
  .stat-label { font-size: 10px; letter-spacing: 2px; color: var(--muted); margin-top: 8px; }

  /* ── Features ── */
  .features-section { padding: 100px 48px; }
  .features-inner { max-width: 1200px; margin: 0 auto; }
  .features-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 60px; }
  .features-title { font-size: clamp(32px, 3vw, 48px); font-weight: 700; letter-spacing: -1px; }
  .features-title span { color: var(--accent); }
  .features-sub { font-size: 12px; letter-spacing: 2px; color: var(--muted); }
  .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); }
  .feature-card {
    background: var(--surface); padding: 40px 32px;
    transition: background 0.2s;
  }
  .feature-card:hover { background: var(--surface2); }
  .feature-icon { font-size: 24px; margin-bottom: 20px; }
  .feature-name { font-size: 14px; font-weight: 700; letter-spacing: 1px; margin-bottom: 12px; }
  .feature-desc { font-size: 13px; line-height: 1.7; color: var(--muted); }
  .feature-tag {
    display: inline-block; margin-top: 20px;
    font-size: 9px; letter-spacing: 2px; color: var(--accent);
    border: 1px solid rgba(0,255,136,0.3); padding: 4px 10px; border-radius: 2px;
  }

  /* ── Screens section ── */
  .screens-section { padding: 100px 48px; border-top: 1px solid var(--border); }
  .screens-inner { max-width: 1200px; margin: 0 auto; }
  .screens-label {
    font-size: 9px; letter-spacing: 3px; color: var(--muted); margin-bottom: 12px;
  }
  .screens-title { font-size: clamp(28px, 3vw, 44px); font-weight: 700; margin-bottom: 48px; letter-spacing: -1px; }
  .screens-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 12px; }
  .screen-thumb {
    aspect-ratio: 390/844; background: var(--surface);
    border-radius: 12px; border: 1px solid var(--border);
    overflow: hidden; position: relative;
    cursor: pointer; transition: border-color 0.2s, transform 0.2s;
  }
  .screen-thumb:hover { border-color: var(--accent); transform: translateY(-4px); }
  .screen-thumb-inner {
    width: 100%; height: 100%; padding: 8px;
    font-size: 5px; font-family: 'Courier New', monospace;
    display: flex; flex-direction: column; gap: 3px;
  }
  .st-header { background: var(--surface2); border-radius: 3px; height: 12px; }
  .st-big { background: var(--accent); border-radius: 2px; height: 20px; width: 60%; opacity: 0.7; }
  .st-cards { display: flex; gap: 2px; }
  .st-card { flex: 1; background: var(--surface2); border-radius: 3px; height: 16px; border: 1px solid var(--border); }
  .st-spark { background: var(--surface2); border-radius: 3px; height: 18px; border: 1px solid var(--border); }
  .st-rows { display: flex; flex-direction: column; gap: 2px; flex: 1; }
  .st-row { background: var(--surface2); border-radius: 2px; height: 10px; }
  .st-row.accent { border-left: 2px solid var(--accent); }
  .st-row.warn { border-left: 2px solid var(--warn); }
  .st-row.danger { border-left: 2px solid var(--danger); }
  .st-nav { background: var(--surface2); border-radius: 3px; height: 12px; margin-top: auto; border-top: 1px solid var(--border); }
  .screen-thumb-label {
    position: absolute; bottom: 8px; left: 0; right: 0;
    text-align: center; font-size: 8px; letter-spacing: 1px;
    color: var(--muted); pointer-events: none;
  }

  /* ── CTA banner ── */
  .cta-section {
    padding: 100px 48px; border-top: 1px solid var(--border);
    text-align: center;
  }
  .cta-label { font-size: 9px; letter-spacing: 3px; color: var(--accent); margin-bottom: 24px; }
  .cta-title { font-size: clamp(36px, 4vw, 60px); font-weight: 700; letter-spacing: -1.5px; margin-bottom: 16px; }
  .cta-sub { font-size: 16px; color: var(--muted); margin-bottom: 48px; max-width: 480px; margin-left: auto; margin-right: auto; }
  .cta-actions { display: flex; justify-content: center; gap: 16px; }

  /* ── Footer ── */
  footer {
    padding: 40px 48px; border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; color: var(--muted); letter-spacing: 1.5px;
  }
  footer a { color: var(--muted); }
  footer a:hover { color: var(--accent); }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    nav { padding: 16px 24px; }
    .hero { padding: 60px 24px 80px; }
    .hero-grid { grid-template-columns: 1fr; gap: 60px; }
    .phone-wrap { order: -1; }
    .stats-grid { grid-template-columns: repeat(2,1fr); }
    .features-grid { grid-template-columns: 1fr; }
    .screens-grid { grid-template-columns: repeat(3,1fr); }
    .features-section, .screens-section, .stats-section, .cta-section { padding: 60px 24px; }
    footer { padding: 24px; flex-direction: column; gap: 12px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-brand">TRACE</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="/trace-viewer">View Design</a>
    <a href="/trace-mock">Interactive mock</a>
  </div>
  <a class="nav-cta" href="/trace-mock">Interactive mock ☀◑</a>
</nav>

<section class="hero">
  <div class="hero-grid">
    <div class="hero-content">
      <div class="hero-label">API OBSERVABILITY ENGINE</div>
      <h1 class="hero-title">TRACE<span>.</span></h1>
      <div class="hero-tagline">See everything. Miss nothing.</div>
      <p class="hero-desc">
        Real-time API health intelligence for developer teams. Monitor latency, track error rates, resolve incidents faster, and never be surprised by an outage again.
      </p>
      <div class="hero-actions">
        <a href="/trace-viewer" class="btn-primary">View design →</a>
        <a href="/trace-mock" class="btn-secondary">Interactive mock ☀◑</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="phone-glow glow-green"></div>
      <div class="phone-glow glow-blue"></div>
      <div class="phone">
        <div class="phone-screen">
          <div class="ps-header">
            <span class="ps-brand">TRACE</span>
            <span class="ps-live"><span class="ps-dot"></span>LIVE</span>
          </div>
          <div style="font-size:5px;color:var(--muted);letter-spacing:1.5px;margin-bottom:2px;">SYSTEM HEALTH</div>
          <div class="ps-big">99.97</div>
          <div style="font-size:7px;color:#00CC6E;font-weight:700;display:inline;">%</div>
          <div class="ps-sub">UPTIME · LAST 90 DAYS</div>
          <div class="ps-cards">
            <div class="ps-card">
              <div class="ps-card-label">LATENCY</div>
              <div class="ps-card-val blue">142ms</div>
            </div>
            <div class="ps-card">
              <div class="ps-card-label">REQ/SEC</div>
              <div class="ps-card-val">8.4k</div>
            </div>
            <div class="ps-card">
              <div class="ps-card-label">ERR RATE</div>
              <div class="ps-card-val green">0.03%</div>
            </div>
          </div>
          <div class="ps-section-label">TOP ENDPOINTS</div>
          <div class="ps-endpoint"><span class="ps-ep-path">/api/v2/auth</span><span class="ps-ep-lat">67ms</span></div>
          <div class="ps-endpoint"><span class="ps-ep-path">/api/v2/data</span><span class="ps-ep-lat">142ms</span></div>
          <div class="ps-endpoint"><span class="ps-ep-path">/api/v2/events</span><span class="ps-ep-lat">89ms</span></div>
          <div class="ps-endpoint"><span class="ps-ep-path">/api/v1/legacy</span><span class="ps-ep-lat warn">312ms</span></div>
          <div class="ps-nav">
            <div class="ps-nav-item active">◈ Over</div>
            <div class="ps-nav-item">⌥ End</div>
            <div class="ps-nav-item">⚡ Inc</div>
            <div class="ps-nav-item">≡ Logs</div>
            <div class="ps-nav-item">◎ Alrt</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="stats-section">
  <div class="stats-inner">
    <div class="stats-label">KEY METRICS — LIVE</div>
    <div class="stats-grid">
      <div class="stat-cell">
        <div class="stat-num green">99<span class="stat-unit">.97%</span></div>
        <div class="stat-label">UPTIME · 90 DAYS</div>
      </div>
      <div class="stat-cell">
        <div class="stat-num blue">142<span class="stat-unit">ms</span></div>
        <div class="stat-label">P95 LATENCY</div>
      </div>
      <div class="stat-cell">
        <div class="stat-num white">8.4<span class="stat-unit">k/s</span></div>
        <div class="stat-label">REQUESTS / SEC</div>
      </div>
      <div class="stat-cell">
        <div class="stat-num green">6.8<span class="stat-unit">min</span></div>
        <div class="stat-label">MEAN TIME TO RESOLVE</div>
      </div>
    </div>
  </div>
</section>

<section class="features-section" id="features">
  <div class="features-inner">
    <div class="features-header">
      <h2 class="features-title">Built for<br><span>developer teams.</span></h2>
      <div class="features-sub">5 VIEWS · DARK MODE · REAL-TIME</div>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">◈</div>
        <div class="feature-name">HEALTH OVERVIEW</div>
        <p class="feature-desc">System-wide uptime displayed as a Locomotive-style editorial number anchor — 99.97% in 72px type forces immediate comprehension. Sparkline request charts fill the remaining space with data density.</p>
        <span class="feature-tag">SCREEN 1</span>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⌥</div>
        <div class="feature-name">ENDPOINT ANALYTICS</div>
        <p class="feature-desc">Every endpoint with method badge, health progress bar, p50/p99 latency split, and RPS counter. Color-coded by severity: green for healthy, amber for degraded, red for failing.</p>
        <span class="feature-tag">SCREEN 2</span>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <div class="feature-name">INCIDENT TIMELINE</div>
        <p class="feature-desc">MTTR and incident rate displayed as editorial anchors at the top. Incident cards with severity badges, affected endpoints, duration, and live/resolved status. Ongoing incidents glow amber.</p>
        <span class="feature-tag">SCREEN 3</span>
      </div>
      <div class="feature-card">
        <div class="feature-icon">≡</div>
        <div class="feature-name">LIVE LOG STREAM</div>
        <p class="feature-desc">Monospace log stream with alternating row backgrounds for scannability. Level badges (INFO/WARN/ERROR) with matching color coding. Timestamp + message on two lines per entry.</p>
        <span class="feature-tag">SCREEN 4</span>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◎</div>
        <div class="feature-name">ALERT RULES</div>
        <p class="feature-desc">Notification channel status, alert rule toggles with animated switch state. Cooldown periods in monospace blue. Active rules show a subtle progress bar at the bottom edge of each card.</p>
        <span class="feature-tag">SCREEN 5</span>
      </div>
      <div class="feature-card">
        <div class="feature-icon">▣</div>
        <div class="feature-name">DARK PALETTE</div>
        <p class="feature-desc">Deep #080B14 navy-black with #00FF88 electric green health indicators. Inspired by Evervault.com's precision dark SaaS palette — a security-tech feel that communicates trust and precision.</p>
        <span class="feature-tag">INSPIRED BY GODLY.WEBSITE</span>
      </div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-inner">
    <div class="screens-label">DESIGN SCREENS</div>
    <h2 class="screens-title">5 screens, zero ambiguity.</h2>
    <div class="screens-grid">
      ${['Overview','Endpoints','Incidents','Logs','Alerts'].map(name => `
        <div class="screen-thumb">
          <div class="screen-thumb-inner">
            <div class="st-header"></div>
            <div class="st-big"></div>
            <div class="st-cards"><div class="st-card"></div><div class="st-card"></div><div class="st-card"></div></div>
            <div class="st-spark"></div>
            <div class="st-rows">
              <div class="st-row accent"></div>
              <div class="st-row accent"></div>
              <div class="st-row warn"></div>
              <div class="st-row accent"></div>
            </div>
            <div class="st-nav"></div>
          </div>
          <div class="screen-thumb-label">${name.toUpperCase()}</div>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="cta-label">READY TO EXPLORE</div>
  <h2 class="cta-title">View the full design.</h2>
  <p class="cta-sub">Browse all 5 screens in the interactive viewer or explore the mock with light/dark toggle.</p>
  <div class="cta-actions">
    <a href="/trace-viewer" class="btn-primary">Open viewer →</a>
    <a href="/trace-mock" class="btn-secondary">Interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <div>TRACE — API OBSERVABILITY ENGINE · RAM DESIGN HEARTBEAT</div>
  <div style="display:flex;gap:24px;">
    <a href="/trace-viewer">Viewer</a>
    <a href="/trace-mock">Mock</a>
    <a href="https://ram.zenbin.org">Gallery</a>
  </div>
  <div>2026</div>
</footer>

</body>
</html>`;

async function main() {
  // 1. Publish hero
  console.log('Publishing hero...');
  let r = await post('/publish', { slug: SLUG, html: heroHtml }, SUBDOMAIN);
  console.log('Hero:', r.status, r.body.slice(0, 80));

  // 2. Build viewer with embedded pen
  const penJson = fs.readFileSync('trace.pen', 'utf8');
  const viewerBase = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let viewerHtml = viewerBase.replace('<script>', injection + '\n<script>');
  
  r = await post('/publish', { slug: SLUG + '-viewer', html: viewerHtml }, SUBDOMAIN);
  console.log('Viewer:', r.status, r.body.slice(0, 80));

  console.log('\nLive at:');
  console.log('  Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}

main().catch(console.error);
