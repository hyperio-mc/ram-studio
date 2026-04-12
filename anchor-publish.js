/**
 * Anchor — Hero page + Viewer publisher
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const SLUG = 'anchor-deploy';
const APP_NAME = 'Anchor';
const TAGLINE = 'Deploy with confidence';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, slug, subdomain: 'ram' });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
        'X-Slug': slug,
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

// ─── HERO PAGE ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F2F5FB;
    --surface: #FFFFFF;
    --border: #E2E8F4;
    --text: #0D1117;
    --muted: #667085;
    --accent: #2563EB;
    --accent2: #10B981;
    --warn: #F59E0B;
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    line-height: 1.6;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(242,245,251,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-size: 20px; font-weight: 800; color: var(--accent);
    text-decoration: none; letter-spacing: -0.5px;
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    font-size: 14px; font-weight: 500; color: var(--muted);
    text-decoration: none; transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 10px 20px; border-radius: 10px;
    font-size: 14px; font-weight: 700;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* HERO */
  .hero {
    max-width: 1120px; margin: 0 auto;
    padding: 160px 40px 100px;
    display: grid; grid-template-columns: 1fr 440px; gap: 80px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--accent); background: #EFF6FF; border-radius: 100px;
    padding: 6px 14px; margin-bottom: 24px;
  }
  .hero-eyebrow::before { content: '●'; color: var(--accent2); font-size: 8px; }
  h1 {
    font-size: clamp(40px, 5vw, 64px); font-weight: 900;
    line-height: 1.05; letter-spacing: -2px;
    color: var(--text); margin-bottom: 24px;
  }
  h1 span { color: var(--accent); }
  .hero-sub {
    font-size: 18px; line-height: 1.6; color: var(--muted); max-width: 460px;
    margin-bottom: 40px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 14px 28px; border-radius: 12px;
    font-size: 16px; font-weight: 700; text-decoration: none;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 20px rgba(37,99,235,0.3);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(37,99,235,0.4); }
  .btn-secondary {
    color: var(--muted); font-size: 15px; font-weight: 600;
    text-decoration: none; display: flex; align-items: center; gap: 6px;
    transition: color 0.2s;
  }
  .btn-secondary:hover { color: var(--text); }

  /* DEVICE MOCKUP */
  .device {
    width: 280px; margin: 0 auto;
    background: var(--surface); border-radius: 44px;
    border: 8px solid #D1D9EC;
    box-shadow: 0 40px 120px rgba(13,17,23,0.14), 0 2px 8px rgba(37,99,235,0.08);
    overflow: hidden; aspect-ratio: 390/844;
    position: relative;
  }
  .device-notch {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 100px; height: 26px; background: #D1D9EC; border-radius: 0 0 18px 18px;
    z-index: 2;
  }
  .device-screen {
    width: 100%; height: 100%; background: var(--bg);
    display: flex; flex-direction: column;
  }
  .ds-header {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 36px 16px 10px;
    display: flex; align-items: baseline; justify-content: space-between;
  }
  .ds-header-left .app-name { font-size: 15px; font-weight: 800; color: var(--accent); }
  .ds-header-left .app-sub { font-size: 9px; color: var(--muted); }
  .ds-live { background: #DCFCE7; color: #16A34A; font-size: 8px; font-weight: 700; padding: 3px 8px; border-radius: 100px; }
  .ds-card {
    margin: 8px; background: var(--accent); border-radius: 12px;
    padding: 12px; color: #fff;
  }
  .ds-card-label { font-size: 8px; font-weight: 600; opacity: 0.7; text-transform: uppercase; }
  .ds-card-value { font-size: 36px; font-weight: 900; line-height: 1.1; margin: 4px 0 2px; }
  .ds-card-sub { font-size: 8px; opacity: 0.65; }
  .ds-stats { display: flex; gap: 6px; margin: 0 8px; }
  .ds-stat { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px; }
  .ds-stat-label { font-size: 8px; color: var(--muted); }
  .ds-stat-value { font-size: 18px; font-weight: 900; }
  .ds-services { margin: 8px; }
  .ds-services-label { font-size: 9px; font-weight: 700; margin-bottom: 4px; }
  .ds-svc { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
  .ds-svc-dot { width: 8px; height: 8px; border-radius: 50%; }
  .ds-svc-name { font-size: 9px; font-weight: 700; font-family: monospace; flex: 1; }
  .ds-svc-uptime { font-size: 9px; font-weight: 700; }
  .ds-nav { margin-top: auto; background: var(--surface); border-top: 1px solid var(--border); display: flex; justify-content: space-around; padding: 6px 0; }
  .ds-nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .ds-nav-dot { width: 6px; height: 6px; border-radius: 50%; }
  .ds-nav-label { font-size: 7px; }

  /* FEATURES */
  .features {
    max-width: 1120px; margin: 0 auto;
    padding: 80px 40px;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(13,17,23,0.08); }
  .feature-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: #EFF6FF; display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 20px;
  }
  .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
  .feature-card p { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* METRICS STRIP */
  .metrics {
    background: var(--text); color: #fff;
    padding: 72px 40px;
  }
  .metrics-inner { max-width: 1120px; margin: 0 auto; }
  .metrics-label {
    font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: rgba(255,255,255,0.45); margin-bottom: 40px;
  }
  .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
  .metric-item {}
  .metric-value { font-size: 52px; font-weight: 900; letter-spacing: -2px; color: #fff; line-height: 1; }
  .metric-value span { color: var(--accent2); }
  .metric-label { font-size: 14px; color: rgba(255,255,255,0.55); margin-top: 8px; }

  /* CTA */
  .cta-section {
    max-width: 720px; margin: 0 auto;
    padding: 100px 40px; text-align: center;
  }
  .cta-section h2 { font-size: 48px; font-weight: 900; letter-spacing: -2px; margin-bottom: 20px; }
  .cta-section p { font-size: 18px; color: var(--muted); margin-bottom: 40px; }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border); padding: 32px 40px;
    display: flex; align-items: center; justify-content: space-between;
    max-width: 1120px; margin: 0 auto;
  }
  footer .logo { font-size: 16px; font-weight: 800; color: var(--accent); }
  footer p { font-size: 12px; color: var(--muted); }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 120px 24px 60px; gap: 48px; }
    .features-grid { grid-template-columns: 1fr; }
    .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 0 24px; }
    .nav-links { display: none; }
  }
</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body>

<nav>
  <a href="#" class="nav-logo">Anchor</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#metrics">Metrics</a>
    <a href="/${SLUG}-viewer">View Design</a>
  </div>
  <a href="/${SLUG}-mock" class="nav-cta">Try Mock →</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-eyebrow">Reliability Engineering</div>
    <h1>Deploy with<br><span>confidence.</span></h1>
    <p class="hero-sub">
      Anchor gives engineering teams a real-time view of system health, deployment readiness,
      and on-call coverage — so you ship fast without breaking things.
    </p>
    <div class="hero-actions">
      <a href="/${SLUG}-mock" class="btn-primary">Explore the mock</a>
      <a href="/${SLUG}-viewer" class="btn-secondary">View design →</a>
    </div>
  </div>

  <div>
    <div class="device">
      <div class="device-notch"></div>
      <div class="device-screen">
        <div class="ds-header">
          <div class="ds-header-left">
            <div class="app-name">Anchor</div>
            <div class="app-sub">Reliability Dashboard</div>
          </div>
          <div class="ds-live">● LIVE</div>
        </div>
        <div class="ds-card">
          <div class="ds-card-label">Overall Reliability</div>
          <div class="ds-card-value">99.7%</div>
          <div class="ds-card-sub">↑ 0.2% vs last 30 days · Budget: 87%</div>
        </div>
        <div class="ds-stats">
          <div class="ds-stat">
            <div class="ds-stat-label">Incidents</div>
            <div class="ds-stat-value" style="color:#10B981">0</div>
          </div>
          <div class="ds-stat">
            <div class="ds-stat-label">Deploys</div>
            <div class="ds-stat-value">14</div>
          </div>
          <div class="ds-stat">
            <div class="ds-stat-label">MTTR</div>
            <div class="ds-stat-value">4m</div>
          </div>
        </div>
        <div class="ds-services">
          <div class="ds-services-label">Services</div>
          <div class="ds-svc">
            <div class="ds-svc-dot" style="background:#10B981"></div>
            <div class="ds-svc-name">api-gateway</div>
            <div class="ds-svc-uptime" style="color:#10B981">100%</div>
          </div>
          <div class="ds-svc">
            <div class="ds-svc-dot" style="background:#10B981"></div>
            <div class="ds-svc-name">auth-service</div>
            <div class="ds-svc-uptime" style="color:#10B981">99.9%</div>
          </div>
          <div class="ds-svc">
            <div class="ds-svc-dot" style="background:#F59E0B"></div>
            <div class="ds-svc-name">payments</div>
            <div class="ds-svc-uptime" style="color:#F59E0B">99.4%</div>
          </div>
        </div>
        <div class="ds-nav">
          <div class="ds-nav-item">
            <div class="ds-nav-dot" style="background:#2563EB"></div>
            <div class="ds-nav-label" style="color:#2563EB">Home</div>
          </div>
          <div class="ds-nav-item">
            <div class="ds-nav-dot" style="background:#E2E8F4"></div>
            <div class="ds-nav-label" style="color:#667085">Deploy</div>
          </div>
          <div class="ds-nav-item">
            <div class="ds-nav-dot" style="background:#E2E8F4"></div>
            <div class="ds-nav-label" style="color:#667085">Services</div>
          </div>
          <div class="ds-nav-item">
            <div class="ds-nav-dot" style="background:#E2E8F4"></div>
            <div class="ds-nav-label" style="color:#667085">Incidents</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">🚦</div>
      <h3>Deploy Confidence Score</h3>
      <p>A composite 0–100 score that weighs test coverage, latency, staging canary results, and open issues — giving you a single number to trust before shipping.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📡</div>
      <h3>Real-time Service Health</h3>
      <p>Monitor every service's uptime, SLA status, and request rates in a single scrollable view. Color-coded indicators surface issues instantly.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔁</div>
      <h3>On-Call Rotation</h3>
      <p>Know who's holding the pager at any moment. Anchor tracks rotation handoffs, escalation policies, and lets you page the on-call engineer in one tap.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <h3>Error Budget Tracking</h3>
      <p>Visualise how much of your error budget remains in real time. Never burn through your SLA allowance without knowing — Anchor warns you early.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📋</div>
      <h3>Pre-flight Checklists</h3>
      <p>Automated checks against test suites, coverage thresholds, latency budgets, and database migrations before every production deployment.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📊</div>
      <h3>Incident Analytics</h3>
      <p>Track MTTR, MTTD, and incident frequency over time. Identify patterns in your on-call load and prove reliability improvements to stakeholders.</p>
    </div>
  </div>
</section>

<section class="metrics" id="metrics">
  <div class="metrics-inner">
    <div class="metrics-label">Impact by the numbers</div>
    <div class="metrics-grid">
      <div class="metric-item">
        <div class="metric-value"><span>38</span>%</div>
        <div class="metric-label">Reduction in MTTR within 60 days</div>
      </div>
      <div class="metric-item">
        <div class="metric-value"><span>4</span>m</div>
        <div class="metric-label">Average time to detect incidents</div>
      </div>
      <div class="metric-item">
        <div class="metric-value"><span>99.7</span>%</div>
        <div class="metric-label">Average reliability across customer fleet</div>
      </div>
      <div class="metric-item">
        <div class="metric-value"><span>0</span></div>
        <div class="metric-label">Failed deployments with confidence ≥ 90</div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2>Ship fast.<br>Break nothing.</h2>
  <p>Anchor brings deployment confidence, service visibility, and incident readiness into a single, beautiful dashboard.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
    <a href="/${SLUG}-mock" class="btn-primary">Explore the interactive mock</a>
    <a href="/${SLUG}-viewer" class="btn-secondary" style="color:var(--muted)">View design file →</a>
  </div>
</section>

<footer>
  <div class="logo">Anchor</div>
  <p>Designed by RAM · Design Heartbeat · ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ─────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Design Viewer</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #0D1117; color: #F0F4FF;
    min-height: 100vh; display: flex; flex-direction: column;
  }
  header {
    padding: 20px 32px; border-bottom: 1px solid #21262D;
    display: flex; align-items: center; justify-content: space-between;
  }
  header h1 { font-size: 18px; font-weight: 700; color: #2563EB; }
  header p { font-size: 12px; color: #667085; margin-top: 2px; }
  .viewer-area {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 40px; gap: 32px; flex-wrap: wrap;
  }
  .screen-card {
    background: #F2F5FB; border-radius: 32px;
    width: 280px; height: 608px; overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    position: relative;
  }
  .screen-label {
    position: absolute; bottom: -28px; left: 0; right: 0;
    text-align: center; font-size: 11px; color: #667085; font-weight: 600;
  }
  .screen-wrapper { position: relative; margin-bottom: 40px; }
  iframe { width: 390px; height: 854px; border: none; transform-origin: top left; transform: scale(0.718); }
  .back-link {
    display: inline-block; padding: 8px 16px; background: #1C2230;
    border-radius: 8px; color: #93A3B8; font-size: 12px; text-decoration: none;
    margin: 0 32px 32px;
  }
</style>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
</head>
<body>
<header>
  <div>
    <h1>${APP_NAME}</h1>
    <p>${TAGLINE} · Design by RAM Heartbeat</p>
  </div>
  <a href="/${SLUG}" style="color:#2563EB;font-size:13px;font-weight:600;text-decoration:none;">← Back to landing</a>
</header>
<div class="viewer-area" id="viewer">
  <p style="color:#667085;font-size:14px;">Loading design screens…</p>
</div>
<script>
(function() {
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if (!pen) return;
  const area = document.getElementById('viewer');
  area.innerHTML = '';
  pen.screens.forEach(screen => {
    const wrapper = document.createElement('div');
    wrapper.className = 'screen-wrapper';
    const card = document.createElement('div');
    card.className = 'screen-card';
    card.innerHTML = '<div style="padding:20px;font-family:monospace;font-size:11px;color:#667085;word-break:break-all;overflow:auto;height:100%;">' + JSON.stringify(screen.elements?.slice(0,3), null, 1) + '<br>…' + screen.elements?.length + ' elements total</div>';
    const label = document.createElement('div');
    label.className = 'screen-label';
    label.textContent = screen.label;
    wrapper.appendChild(card);
    wrapper.appendChild(label);
    area.appendChild(wrapper);
  });
})();
</script>
</body>
</html>`;

async function main() {
  console.log('Publishing hero page…');
  const heroRes = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Viewer`);
  console.log(`Viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
