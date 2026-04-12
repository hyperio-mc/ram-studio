/**
 * vigil-publish.js
 * Publish VIGIL hero page + viewer to ram.zenbin.org
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'vigil';
const SUBDOMAIN = 'ram';

// ─── ZenBin helpers ───────────────────────────────────────────────────────────
function zenPost(slug, htmlContent, subdomain) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html: htmlContent }));
    const headers = {
      'Content-Type':   'application/json',
      'Content-Length': body.length,
    };
    if (subdomain) headers['X-Subdomain'] = subdomain;
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers,
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

// ─── Hero page HTML ───────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VIGIL — Always-On Software Reliability Intelligence</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #060810;
    --surface: #0F1120;
    --surfaceB:#141830;
    --border:  rgba(123,107,255,0.18);
    --text:    #DCE4FF;
    --mid:     #8B97CC;
    --accent:  #7B6BFF;
    --accentLo:rgba(123,107,255,0.15);
    --teal:    #22E5A8;
    --tealLo:  rgba(34,229,168,0.12);
    --red:     #FF5A6E;
    --amber:   #FFB84D;
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }
  /* ambient glow orbs */
  body::before, body::after {
    content: '';
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    z-index: 0;
  }
  body::before {
    width: 600px; height: 600px;
    background: rgba(123,107,255,0.12);
    top: -200px; left: -200px;
  }
  body::after {
    width: 500px; height: 500px;
    background: rgba(34,229,168,0.08);
    bottom: -150px; right: -150px;
  }
  .container {
    position: relative; z-index: 1;
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 24px;
  }
  /* Nav */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 0;
    border-bottom: 1px solid var(--border);
  }
  .logo {
    font-size: 20px; font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--accent), var(--teal));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  nav ul { display: flex; gap: 32px; list-style: none; }
  nav a { color: var(--mid); text-decoration: none; font-size: 14px;
           transition: color .2s; }
  nav a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accentLo); color: var(--accent) !important;
    border: 1px solid var(--accent); border-radius: 20px;
    padding: 8px 20px; font-weight: 600 !important;
  }
  /* Hero */
  .hero {
    text-align: center;
    padding: 100px 0 80px;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accentLo); border: 1px solid var(--border);
    border-radius: 100px; padding: 6px 16px;
    font-size: 12px; color: var(--accent); font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 32px;
  }
  .hero-badge::before { content: ''; width: 8px; height: 8px;
    background: var(--teal); border-radius: 50%;
    box-shadow: 0 0 8px var(--teal); }
  h1 {
    font-size: clamp(48px, 7vw, 88px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.0;
    margin-bottom: 28px;
  }
  h1 span.grd {
    background: linear-gradient(135deg, #9B8EFF 0%, var(--accent) 40%, var(--teal) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero-sub {
    font-size: 20px; color: var(--mid); line-height: 1.6;
    max-width: 600px; margin: 0 auto 48px;
  }
  .hero-actions {
    display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--accent), #5B4DFF);
    color: #fff; border: none; border-radius: 100px;
    padding: 16px 36px; font-size: 16px; font-weight: 700;
    text-decoration: none; cursor: pointer;
    box-shadow: 0 0 40px rgba(123,107,255,0.4);
    transition: transform .2s, box-shadow .2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 60px rgba(123,107,255,0.6); }
  .btn-secondary {
    background: var(--surfaceB); color: var(--text);
    border: 1px solid var(--border); border-radius: 100px;
    padding: 16px 36px; font-size: 16px; font-weight: 600;
    text-decoration: none; cursor: pointer;
    transition: border-color .2s, background .2s;
  }
  .btn-secondary:hover { border-color: var(--accent); background: var(--accentLo); }
  /* Status strip */
  .status-strip {
    display: flex; gap: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin: 64px 0;
  }
  .status-item {
    flex: 1; padding: 24px 20px;
    border-right: 1px solid var(--border);
    text-align: center;
  }
  .status-item:last-child { border-right: none; }
  .status-val { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
  .status-lbl { font-size: 12px; color: var(--mid); text-transform: uppercase;
                 letter-spacing: 0.08em; }
  .val-green { color: var(--teal); }
  .val-acc   { color: var(--accent); }
  /* Phone mockup grid */
  .mockup-section { text-align: center; margin: 40px 0 80px; }
  .mockup-section h2 {
    font-size: 40px; font-weight: 800; letter-spacing: -0.03em;
    margin-bottom: 16px;
  }
  .mockup-section p { color: var(--mid); font-size: 17px; margin-bottom: 48px; }
  .phone-grid {
    display: flex; gap: 20px; justify-content: center;
    align-items: flex-end; flex-wrap: wrap;
  }
  .phone {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(123,107,255,0.1);
    transition: transform .3s;
  }
  .phone:hover { transform: translateY(-8px); }
  .phone.tall  { width: 200px; height: 430px; }
  .phone.short { width: 200px; height: 380px; }
  .phone-inner {
    width: 100%; height: 100%;
    background: var(--bg);
    display: flex; flex-direction: column;
    padding: 16px 12px 12px;
    position: relative; overflow: hidden;
  }
  /* Phone screen mini renders */
  .ph-status { display: flex; justify-content: space-between;
               font-size: 9px; color: var(--mid); margin-bottom: 10px; }
  .ph-title  { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .ph-sub    { font-size: 9px; color: var(--mid); margin-bottom: 10px; }
  .ph-card   { background: var(--surface); border: 1px solid var(--border);
               border-radius: 10px; padding: 10px; margin-bottom: 8px; }
  .ph-metric { font-size: 20px; font-weight: 800; color: var(--teal); }
  .ph-mlbl   { font-size: 9px; color: var(--mid); }
  .ph-row    { display: flex; gap: 6px; margin-bottom: 8px; }
  .ph-row .ph-card { flex: 1; margin-bottom: 0; }
  .ph-badge  { display: inline-block; padding: 2px 8px; border-radius: 100px;
               font-size: 9px; font-weight: 700; }
  .ph-badge.p1 { background: rgba(255,90,110,0.15); color: var(--red); }
  .ph-badge.p2 { background: rgba(255,184,77,0.12); color: var(--amber); }
  .ph-badge.ok { background: rgba(34,229,168,0.12); color: var(--teal); }
  .ph-bar-bg { background: var(--surfaceB); border-radius: 4px;
               height: 6px; margin-top: 4px; }
  .ph-bar-fill { background: var(--teal); border-radius: 4px; height: 6px; }
  .ph-inc    { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
  .ph-inc-t  { font-size: 9px; color: var(--text); }
  .ph-inc-d  { font-size: 8px; color: var(--mid); }
  /* services */
  .ph-svc    { display: flex; align-items: center; gap: 6px; padding: 4px 0; }
  .ph-dot    { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .ph-svc-n  { font-size: 9px; color: var(--text); flex: 1; }
  .ph-svc-ms { font-size: 9px; color: var(--mid); }
  /* toggle */
  .ph-toggle-row { display: flex; align-items: center; justify-content: space-between;
                   padding: 4px 0; }
  .ph-tog-t { font-size: 9px; color: var(--text); }
  .ph-tog   { width: 24px; height: 14px; border-radius: 7px; position: relative; }
  .ph-tog.on  { background: var(--teal); }
  .ph-tog.off { background: var(--surfaceB); border: 1px solid var(--border); }
  .ph-tog::after { content: ''; position: absolute;
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--bg); top: 2px; transition: left .2s; }
  .ph-tog.on::after  { left: 12px; }
  .ph-tog.off::after { left: 2px; }
  /* Features */
  .features { margin: 80px 0; }
  .features h2 { font-size: 40px; font-weight: 800; letter-spacing: -0.03em;
                 text-align: center; margin-bottom: 56px; }
  .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    transition: border-color .2s, background .2s;
  }
  .feat-card:hover { border-color: var(--accent); background: rgba(15,17,32,0.9); }
  .feat-icon {
    font-size: 28px; margin-bottom: 16px; display: block;
    width: 52px; height: 52px; background: var(--accentLo);
    border-radius: 14px; display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border);
  }
  .feat-title { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
  .feat-desc  { font-size: 14px; color: var(--mid); line-height: 1.6; }
  /* CTA */
  .cta-section {
    text-align: center;
    padding: 80px 0 120px;
    background: radial-gradient(ellipse at center, rgba(123,107,255,0.06) 0%, transparent 70%);
  }
  .cta-section h2 { font-size: 44px; font-weight: 800; letter-spacing: -0.03em;
                    margin-bottom: 16px; }
  .cta-section p  { color: var(--mid); font-size: 18px; margin-bottom: 40px; }
  /* Footer */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px 0;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
  }
  footer .logo-f { font-weight: 700; color: var(--mid); font-size: 14px; }
  footer p { font-size: 12px; color: var(--mid); }
  @media (max-width: 768px) {
    .feat-grid { grid-template-columns: 1fr; }
    .status-strip { flex-wrap: wrap; }
    .phone.tall, .phone.short { width: 160px; height: 340px; }
  }
</style>
</head>
<body>
<div class="container">
  <nav>
    <div class="logo">VIGIL</div>
    <ul>
      <li><a href="#">Product</a></li>
      <li><a href="#">Docs</a></li>
      <li><a href="#">Pricing</a></li>
      <li><a href="#">Blog</a></li>
    </ul>
    <a href="#" class="nav-cta">Start Free →</a>
  </nav>

  <section class="hero">
    <div class="hero-badge">All systems nominal</div>
    <h1>Never ship<br><span class="grd">broken code</span><br>again.</h1>
    <p class="hero-sub">
      VIGIL monitors every service, every deployment, every API —
      and surfaces reliability issues before your users do.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/vigil-mock" class="btn-primary">Live Mock →</a>
      <a href="https://ram.zenbin.org/vigil-viewer" class="btn-secondary">View Design</a>
    </div>
  </section>

  <div class="status-strip">
    <div class="status-item">
      <div class="status-val val-green">99.98%</div>
      <div class="status-lbl">Uptime 30d</div>
    </div>
    <div class="status-item">
      <div class="status-val val-acc">4.2 min</div>
      <div class="status-lbl">Avg MTTR</div>
    </div>
    <div class="status-item">
      <div class="status-val val-green">83%</div>
      <div class="status-lbl">Error Budget</div>
    </div>
    <div class="status-item">
      <div class="status-val" style="color:var(--text)">6</div>
      <div class="status-lbl">Services Monitored</div>
    </div>
  </div>

  <section class="mockup-section">
    <h2>5 screens. Every incident covered.</h2>
    <p>From real-time uptime to latency heatmaps — all in a clean, dark UI.</p>
    <div class="phone-grid">

      <!-- Screen 1: Overview -->
      <div class="phone tall">
        <div class="phone-inner">
          <div class="ph-status"><span>9:41</span><span>●●● 🔋</span></div>
          <div class="ph-title">VIGIL</div>
          <div class="ph-sub">Platform health · Real-time</div>
          <div style="text-align:center;margin:8px 0">
            <div style="width:72px;height:72px;border:3px solid #7B6BFF;border-radius:50%;
                        display:inline-flex;align-items:center;justify-content:center;
                        background:rgba(123,107,255,0.08)">
              <div>
                <div style="font-size:12px;font-weight:800;color:#7B6BFF">99.98%</div>
                <div style="font-size:7px;color:#8B97CC">Uptime</div>
              </div>
            </div>
          </div>
          <div class="ph-row">
            <div class="ph-card">
              <div class="ph-mlbl">SLA</div>
              <div class="ph-metric" style="font-size:14px">99.95%</div>
            </div>
            <div class="ph-card">
              <div class="ph-mlbl">MTTR</div>
              <div class="ph-metric" style="font-size:14px;color:#DCE4FF">4.2m</div>
            </div>
          </div>
          <div class="ph-card">
            <div style="display:flex;justify-content:space-between">
              <div class="ph-mlbl">Error Budget</div>
              <div style="font-size:9px;color:#DCE4FF;font-weight:700">83%</div>
            </div>
            <div class="ph-bar-bg"><div class="ph-bar-fill" style="width:83%"></div></div>
          </div>
          <div style="font-size:9px;color:#DCE4FF;font-weight:600;margin:4px 0 2px">Recent Incidents</div>
          <div class="ph-inc">
            <div><div class="ph-inc-t">API latency spike</div><div class="ph-inc-d">2h ago</div></div>
            <span class="ph-badge p2">P2</span>
          </div>
          <div class="ph-inc">
            <div><div class="ph-inc-t">Auth degraded</div><div class="ph-inc-d">14h ago</div></div>
            <span class="ph-badge p1">P1</span>
          </div>
        </div>
      </div>

      <!-- Screen 2: Services -->
      <div class="phone short" style="align-self:center">
        <div class="phone-inner">
          <div class="ph-status"><span>9:41</span><span>●●● 🔋</span></div>
          <div class="ph-title">Services</div>
          <div class="ph-sub">6 monitored · 1 incident</div>
          <div class="ph-card">
            <div class="ph-svc">
              <div class="ph-dot" style="background:#22E5A8"></div>
              <div class="ph-svc-n">API Gateway</div>
              <div class="ph-svc-ms">42ms</div>
            </div>
            <div class="ph-svc">
              <div class="ph-dot" style="background:#FFB84D"></div>
              <div class="ph-svc-n">Auth Service</div>
              <div class="ph-svc-ms">128ms</div>
            </div>
            <div class="ph-svc">
              <div class="ph-dot" style="background:#22E5A8"></div>
              <div class="ph-svc-n">Worker Queue</div>
              <div class="ph-svc-ms">8ms</div>
            </div>
            <div class="ph-svc">
              <div class="ph-dot" style="background:#FF5A6E"></div>
              <div class="ph-svc-n">Search Index</div>
              <div class="ph-svc-ms">210ms</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Screen 3: Incidents -->
      <div class="phone tall">
        <div class="phone-inner">
          <div class="ph-status"><span>9:41</span><span>●●● 🔋</span></div>
          <div class="ph-title">Incidents</div>
          <div class="ph-sub">1 open · 3 resolved</div>
          <div class="ph-card" style="border-color:rgba(255,90,110,0.3)">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span class="ph-badge p2">P2</span>
              <span class="ph-badge p1">Open</span>
            </div>
            <div class="ph-inc-t">API Gateway latency spike</div>
            <div class="ph-inc-d">2h ago · 1h 12m · 4 services</div>
          </div>
          <div class="ph-card">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span class="ph-badge p1">P1</span>
              <span class="ph-badge ok">Resolved</span>
            </div>
            <div class="ph-inc-t">Auth service degraded</div>
            <div class="ph-inc-d">14h ago · 22m · 1 service</div>
          </div>
          <div class="ph-card">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span class="ph-badge ok">P3</span>
              <span class="ph-badge ok">Resolved</span>
            </div>
            <div class="ph-inc-t">CDN cache miss elevated</div>
            <div class="ph-inc-d">2d ago · 5m · 1 service</div>
          </div>
        </div>
      </div>

      <!-- Screen 5: Alerts -->
      <div class="phone short" style="align-self:center">
        <div class="phone-inner">
          <div class="ph-status"><span>9:41</span><span>●●● 🔋</span></div>
          <div class="ph-title">Alerts</div>
          <div class="ph-sub">4 active rules</div>
          <div class="ph-card">
            <div class="ph-toggle-row">
              <div class="ph-tog-t">High error rate</div>
              <div class="ph-tog on"></div>
            </div>
            <div class="ph-toggle-row">
              <div class="ph-tog-t">Latency SLA breach</div>
              <div class="ph-tog on"></div>
            </div>
            <div class="ph-toggle-row">
              <div class="ph-tog-t">Zero traffic</div>
              <div class="ph-tog on"></div>
            </div>
            <div class="ph-toggle-row">
              <div class="ph-tog-t">Cert expiry</div>
              <div class="ph-tog off"></div>
            </div>
            <div class="ph-toggle-row">
              <div class="ph-tog-t">Deploy anomaly</div>
              <div class="ph-tog on"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <section class="features">
    <h2>Engineered for<br><span style="background:linear-gradient(135deg,#9B8EFF,#7B6BFF,#22E5A8);-webkit-background-clip:text;-webkit-text-fill-color:transparent">reliability teams</span></h2>
    <div class="feat-grid">
      <div class="feat-card">
        <span class="feat-icon">◎</span>
        <div class="feat-title">Real-Time SLA Tracking</div>
        <div class="feat-desc">Monitor error budgets, uptime percentages, and SLA compliance — updated every 30 seconds across all your services.</div>
      </div>
      <div class="feat-card">
        <span class="feat-icon">⚡</span>
        <div class="feat-title">Instant Incident Triage</div>
        <div class="feat-desc">Automatic severity classification (P1–P4), affected service mapping, and one-click escalation to PagerDuty or Slack.</div>
      </div>
      <div class="feat-card">
        <span class="feat-icon">〜</span>
        <div class="feat-title">Latency Heatmaps</div>
        <div class="feat-desc">Visualize p50/p95/p99 latency distributions over time with our novel 7-row request heatmap — spot degradations instantly.</div>
      </div>
      <div class="feat-card">
        <span class="feat-icon">⬡</span>
        <div class="feat-title">Service Topology View</div>
        <div class="feat-desc">See every upstream and downstream dependency, with live health indicators and cascade failure detection baked in.</div>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🔔</span>
        <div class="feat-title">Smart Alert Rules</div>
        <div class="feat-desc">Define threshold-based rules with configurable windows. Route to any channel — all without YAML config files.</div>
      </div>
      <div class="feat-card">
        <span class="feat-icon">◈</span>
        <div class="feat-title">Deploy Correlation</div>
        <div class="feat-desc">Every incident is automatically correlated with your latest deployments, so you can pinpoint regressions within minutes.</div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <h2>Start monitoring<br>in 5 minutes.</h2>
    <p>No agents. No YAML. Just connect your services and go.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/vigil-mock" class="btn-primary">Explore Live Mock →</a>
      <a href="https://ram.zenbin.org/vigil-viewer" class="btn-secondary">View .pen File</a>
    </div>
  </section>

  <footer>
    <div class="logo-f">VIGIL by RAM Design Studio</div>
    <p>Inspired by Fluid Glass SOTD · Awwwards 2025</p>
  </footer>
</div>
</body>
</html>`;

// ─── Viewer HTML ───────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'vigil.pen'), 'utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VIGIL — Design Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060810; color: #DCE4FF;
         font-family: Inter, system-ui, sans-serif;
         display: flex; flex-direction: column; min-height: 100vh; }
  header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;
           border-bottom: 1px solid rgba(123,107,255,0.18); }
  .logo  { font-size: 18px; font-weight: 800;
           background: linear-gradient(135deg,#9B8EFF,#22E5A8);
           -webkit-background-clip:text;-webkit-text-fill-color:transparent; }
  .back  { color: #8B97CC; text-decoration: none; font-size: 13px; }
  .back:hover { color: #DCE4FF; }
  #viewer { flex: 1; border: none; width: 100%; min-height: calc(100vh - 64px); }
  .loading { flex: 1; display: flex; align-items: center; justify-content: center;
             flex-direction: column; gap: 16px; }
  .spinner { width: 40px; height: 40px; border: 3px solid rgba(123,107,255,0.2);
             border-top-color: #7B6BFF; border-radius: 50%; animation: spin .8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<header>
  <div class="logo">VIGIL</div>
  <a href="https://ram.zenbin.org/vigil" class="back">← Back to landing</a>
</header>
<div class="loading" id="loading">
  <div class="spinner"></div>
  <p style="color:#8B97CC;font-size:14px">Loading design…</p>
</div>
<iframe id="viewer" style="display:none"
  src="https://pencil.dev/embed/viewer"
  allow="fullscreen"></iframe>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
const iframe = document.getElementById('viewer');
const loading = document.getElementById('loading');
iframe.addEventListener('load', () => {
  loading.style.display = 'none';
  iframe.style.display = 'block';
  setTimeout(() => {
    try { iframe.contentWindow.postMessage({ type: 'load-pen', data: window.EMBEDDED_PEN }, '*'); }
    catch(e) { console.warn('postMessage failed', e); }
  }, 500);
});
iframe.src = 'https://pencil.dev/embed/viewer';
</script>
</body>
</html>`;

// ─── Publish ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page (ram subdomain)…');
  const r1 = await zenPost(SLUG, heroHtml, SUBDOMAIN);
  console.log(`  Hero (ram):    ${r1.status <= 201 ? 'OK ✓' : r1.status}`);

  console.log('Publishing hero page (stable)…');
  const r1b = await zenPost(SLUG, heroHtml);
  console.log(`  Hero (stable): ${r1b.status <= 201 ? 'OK ✓' : r1b.status}`);

  console.log('Publishing viewer (ram subdomain)…');
  const r2 = await zenPost(`${SLUG}-viewer`, viewerHtml, SUBDOMAIN);
  console.log(`  Viewer (ram):  ${r2.status <= 201 ? 'OK ✓' : r2.status}`);

  if (r1.status > 201) console.log('  Hero body:', r1.body.slice(0, 200));
  if (r2.status > 201) console.log('  Viewer body:', r2.body.slice(0, 200));

  console.log(`\n✓ VIGIL published`);
  console.log(`  https://ram.zenbin.org/${SLUG}`);
  console.log(`  https://ram.zenbin.org/${SLUG}-viewer`);
})();
