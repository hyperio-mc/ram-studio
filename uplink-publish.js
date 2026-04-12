#!/usr/bin/env node
// UPLINK — Full publish pipeline
'use strict';
const fs = require('fs');
const https = require('https');

const SLUG = 'uplink';
const APP_NAME = 'Uplink';
const TAGLINE = "Your API's nervous system.";
const ARCHETYPE = 'monitoring-dashboard';
const PROMPT = "API health monitoring dashboard for indie developers — inspired by Godly Status tool, Land-book Interfere, and Midday dark business UI. Dark navy + electric blue + emerald + coral. Monospace data aesthetic.";

function deploy(slug, html, title) {
  return new Promise((resolve, reject) => {
    const subdomain = 'ram';
    const hostname = 'zenbin.org';
    const body = Buffer.from(JSON.stringify({ title: title || slug, html }));
    const req = https.request({
      hostname,
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}`, status: res.statusCode });
        } else {
          // fallback to no-subdomain
          resolve({ ok: false, status: res.statusCode, body: d.slice(0, 300) });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function deployFallback(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title: title || slug, html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://zenbin.org/p/${slug}`, status: res.statusCode });
        } else {
          resolve({ ok: false, status: res.statusCode, body: d.slice(0, 300) });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function pub(slug, html, title) {
  let res = await deploy(slug, html, title);
  if (!res.ok) {
    console.log(`  ↳ ram subdomain failed (${res.status}), trying fallback…`);
    res = await deployFallback(slug, html, title);
  }
  return res;
}

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Uplink — Your API's nervous system</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0B0D14;--bg-deep:#080A10;--surface:#13161F;--surface-up:#1A1E2C;
  --border:rgba(255,255,255,0.07);--border-blu:rgba(79,126,255,0.22);
  --text:#EDF0F8;--sub:rgba(237,240,248,0.55);--muted:rgba(237,240,248,0.30);
  --blue:#4F7EFF;--green:#3DCA8A;--red:#FF4F6A;--amber:#F5A623;--purple:#9B6DFF;
  --mono:'JetBrains Mono',monospace;--sans:'Inter',system-ui,sans-serif;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--sans);overflow-x:hidden;min-height:100vh}

/* Ambient glows */
.glow{position:fixed;border-radius:50%;pointer-events:none;z-index:0;filter:blur(60px)}
.g1{top:-100px;right:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(79,126,255,0.12),transparent 70%)}
.g2{bottom:100px;left:-80px;width:400px;height:400px;background:radial-gradient(circle,rgba(61,202,138,0.08),transparent 70%)}
.g3{top:40%;right:-60px;width:300px;height:300px;background:radial-gradient(circle,rgba(155,109,255,0.06),transparent 70%)}

nav{position:sticky;top:0;z-index:100;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;background:rgba(11,13,20,0.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-logo{font-family:var(--mono);font-size:18px;font-weight:700;color:var(--text);letter-spacing:-0.02em}
.nav-logo .dot{color:var(--blue)}
.nav-badge{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--green)}
.pulse{width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulse 2s ease-in-out infinite;display:inline-block}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(61,202,138,0.4)}50%{opacity:.7;transform:scale(.9);box-shadow:0 0 0 4px rgba(61,202,138,0)}}
.nav-cta{background:var(--blue);color:#fff;font-size:13px;font-weight:600;padding:8px 18px;border-radius:20px;text-decoration:none;box-shadow:0 4px 14px rgba(79,126,255,0.30);transition:transform .2s,box-shadow .2s}
.nav-cta:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(79,126,255,0.40)}

.hero{position:relative;z-index:1;min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px 60px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(79,126,255,0.10);border:1px solid rgba(79,126,255,0.25);border-radius:100px;padding:6px 16px;font-family:var(--mono);font-size:11px;font-weight:600;color:var(--blue);letter-spacing:0.06em;margin-bottom:28px}
.hero h1{font-size:clamp(52px,8vw,96px);font-weight:800;color:var(--text);line-height:1.0;letter-spacing:-0.04em;margin-bottom:14px}
.hero h1 em{color:var(--blue);font-style:normal}
.hero-tagline{font-size:clamp(16px,2.5vw,20px);color:var(--sub);margin-bottom:36px;max-width:460px;line-height:1.5}
.hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
.btn-primary{background:var(--blue);color:#fff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:100px;text-decoration:none;box-shadow:0 8px 24px rgba(79,126,255,0.32);transition:transform .2s}
.btn-primary:hover{transform:translateY(-2px)}
.btn-ghost{background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--text);font-size:15px;font-weight:500;padding:14px 28px;border-radius:100px;text-decoration:none;transition:border-color .2s,background .2s}
.btn-ghost:hover{border-color:var(--border-blu);background:rgba(79,126,255,0.06)}

/* Phone mockup */
.phone-wrap{position:relative;width:240px;margin:0 auto}
.phone-frame{width:240px;height:520px;border-radius:36px;background:var(--bg);border:1px solid rgba(79,126,255,0.20);box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 20px 60px rgba(0,0,0,0.60),0 40px 100px rgba(79,126,255,0.08);overflow:hidden;position:relative}
.phone-frame::before{content:'';position:absolute;top:0;left:0;right:0;height:60px;background:linear-gradient(180deg,rgba(79,126,255,0.06) 0%,transparent);pointer-events:none;z-index:10}
.p-inner{padding:16px 14px;font-family:var(--mono);height:100%;overflow:hidden}
.p-sb{display:flex;justify-content:space-between;margin-bottom:10px}
.p-time{font-size:10px;font-weight:600;color:var(--text)}
.p-ico{font-size:8px;color:var(--muted)}
.p-hdr{display:flex;align-items:center;gap:6px;margin-bottom:8px}
.p-logo{font-size:13px;font-weight:700;color:var(--text);letter-spacing:-.02em}
.p-ok{font-size:8px;color:var(--green);font-weight:600}
.p-upcard{background:var(--surface-up);border:1px solid rgba(79,126,255,0.22);border-radius:12px;padding:9px 10px;margin-bottom:8px;position:relative;overflow:hidden}
.p-upcard::after{content:'';position:absolute;top:0;left:12px;right:12px;height:1.5px;background:rgba(79,126,255,0.30)}
.p-up-lbl{font-size:7.5px;color:var(--muted);letter-spacing:.06em;margin-bottom:3px}
.p-up-val{font-size:22px;font-weight:700;color:var(--blue);line-height:1;margin-bottom:2px}
.p-bar{height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-bottom:2px;overflow:hidden}
.p-bar-inner{height:100%;background:var(--green);border-radius:2px}
.p-mets{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:3px;margin-bottom:8px}
.p-met{background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:5px 3px;text-align:center}
.p-met-v{font-size:10px;font-weight:700;color:var(--blue)}
.p-met-l{font-size:6.5px;color:var(--muted);margin-top:1px}
.p-svc-hdr{font-size:7px;color:var(--muted);letter-spacing:.06em;margin-bottom:5px}
.p-svc{display:flex;align-items:center;gap:5px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:5px 7px;margin-bottom:3px}
.p-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.p-svc-name{font-size:8.5px;font-weight:600;color:var(--text);flex:1}
.p-svc-lat{font-size:8.5px;font-weight:600;color:var(--text);font-family:var(--mono)}
.p-svc-status{font-size:7.5px;font-weight:500}
.nav-bar{position:absolute;bottom:0;left:0;right:0;height:52px;background:var(--bg-deep);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-around;padding:0 8px}
.n-item{display:flex;flex-direction:column;align-items:center;gap:2px;flex:1}
.n-icon{font-size:13px;color:var(--muted)}
.n-icon.active{color:var(--blue)}
.n-label{font-size:6.5px;color:var(--muted)}
.n-label.active{color:var(--blue);font-weight:600}

/* Features */
section{position:relative;z-index:1;padding:80px 24px;max-width:1000px;margin:0 auto}
.section-label{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--blue);letter-spacing:0.10em;text-align:center;margin-bottom:12px}
.section-title{font-size:clamp(28px,4vw,44px);font-weight:800;text-align:center;line-height:1.1;letter-spacing:-0.03em;margin-bottom:16px}
.section-sub{font-size:16px;color:var(--sub);text-align:center;max-width:480px;margin:0 auto 48px;line-height:1.5}

.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:80px}
.feature{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;transition:border-color .2s,background .2s}
.feature:hover{border-color:var(--border-blu);background:var(--surface-up)}
.f-icon{font-size:22px;margin-bottom:12px}
.f-title{font-size:16px;font-weight:700;margin-bottom:6px}
.f-body{font-size:14px;color:var(--sub);line-height:1.5}

/* Uptime bar */
.uptime-section{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:80px}
.up-title{font-family:var(--mono);font-size:13px;font-weight:600;color:var(--blue);letter-spacing:.04em;margin-bottom:16px}
.up-bar{display:flex;gap:2px;height:24px;margin-bottom:8px}
.up-block{flex:1;border-radius:2px;background:var(--green)}
.up-block.out{background:var(--red)}
.up-block.deg{background:var(--amber)}
.up-meta{display:flex;justify-content:space-between}
.up-pct{font-family:var(--mono);font-size:15px;font-weight:700;color:var(--green)}
.up-label{font-size:13px;color:var(--muted)}

/* Metrics row */
.metrics-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:80px}
.metric-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;text-align:center;transition:border-color .2s}
.metric-card:hover{border-color:var(--border-blu)}
.mc-val{font-family:var(--mono);font-size:28px;font-weight:700;margin-bottom:4px}
.mc-label{font-size:11px;color:var(--muted);letter-spacing:.04em}

/* CTA */
.cta-block{background:linear-gradient(135deg,rgba(79,126,255,0.12) 0%,rgba(155,109,255,0.08) 100%);border:1px solid var(--border-blu);border-radius:24px;padding:56px 32px;text-align:center;margin-bottom:80px}
.cta-block h2{font-size:clamp(28px,4vw,48px);font-weight:800;letter-spacing:-0.03em;margin-bottom:16px}
.cta-block p{font-size:16px;color:var(--sub);margin-bottom:32px}

footer{position:relative;z-index:1;text-align:center;padding:32px 24px;border-top:1px solid var(--border);font-size:12px;color:var(--muted)}

@media(max-width:640px){
  .metrics-row{grid-template-columns:1fr 1fr}
  .hero h1{font-size:42px}
}
</style>
</head>
<body>
<div class="glow g1"></div>
<div class="glow g2"></div>
<div class="glow g3"></div>

<nav>
  <div class="nav-logo">uplink<span class="dot">.</span></div>
  <div class="nav-badge"><span class="pulse"></span> All Systems Operational</div>
  <a class="nav-cta" href="https://ram.zenbin.org/uplink-mock">Try Mock →</a>
</nav>

<div class="hero">
  <div class="hero-badge">◉ API MONITORING · DESIGNED FOR FOUNDERS</div>
  <h1>Your API's<br><em>nervous system</em></h1>
  <p class="hero-tagline">Real-time health monitoring for indie developers. Know exactly when things break, and why, before your users do.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/uplink-viewer">View Prototype →</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/uplink-mock">Interactive Mock ☀◑</a>
  </div>

  <!-- Phone mockup -->
  <div class="phone-wrap">
    <div class="phone-frame">
      <div class="p-inner">
        <div class="p-sb"><span class="p-time">9:41</span><span class="p-ico">● ●  ▲</span></div>
        <div class="p-hdr">
          <span class="p-logo">uplink</span>
          <span class="p-ok">· All Systems Operational</span>
        </div>
        <div class="p-upcard">
          <div class="p-up-lbl">UPTIME · 30 DAYS</div>
          <div class="p-up-val">99.98%</div>
          <div class="p-bar"><div class="p-bar-inner" style="width:99.98%"></div></div>
          <div style="display:flex;justify-content:space-between"><span style="font-size:7.5px;color:#3DCA8A;font-weight:600">↑ +0.01% vs last month</span><span style="font-size:7.5px;color:rgba(237,240,248,0.30)">~2 min downtime</span></div>
        </div>
        <div class="p-mets">
          <div class="p-met"><div class="p-met-v" style="color:#4F7EFF">4.2K</div><div class="p-met-l">Req/min</div></div>
          <div class="p-met"><div class="p-met-v" style="color:#EDF0F8">182</div><div class="p-met-l">P99 ms</div></div>
          <div class="p-met"><div class="p-met-v" style="color:#3DCA8A">0.02%</div><div class="p-met-l">Errors</div></div>
          <div class="p-met"><div class="p-met-v" style="color:#9B6DFF">6</div><div class="p-met-l">Regions</div></div>
        </div>
        <div class="p-svc-hdr">SERVICES</div>
        <div class="p-svc">
          <div class="p-dot" style="background:#3DCA8A"></div>
          <span class="p-svc-name">API Gateway</span>
          <span class="p-svc-lat">48ms</span>
          <span class="p-svc-status" style="color:#3DCA8A">Operational</span>
        </div>
        <div class="p-svc">
          <div class="p-dot" style="background:#3DCA8A"></div>
          <span class="p-svc-name">Auth Service</span>
          <span class="p-svc-lat">23ms</span>
          <span class="p-svc-status" style="color:#3DCA8A">Operational</span>
        </div>
        <div class="p-svc" style="border-color:rgba(245,166,35,0.22)">
          <div class="p-dot" style="background:#F5A623"></div>
          <span class="p-svc-name">Webhooks</span>
          <span class="p-svc-lat" style="color:#F5A623">340ms</span>
          <span class="p-svc-status" style="color:#F5A623">Degraded</span>
        </div>
        <div class="p-svc">
          <div class="p-dot" style="background:#3DCA8A"></div>
          <span class="p-svc-name">Data Pipeline</span>
          <span class="p-svc-lat">61ms</span>
          <span class="p-svc-status" style="color:#3DCA8A">Operational</span>
        </div>
      </div>
      <div class="nav-bar">
        <div class="n-item"><span class="n-icon active">◉</span><span class="n-label active">Status</span></div>
        <div class="n-item"><span class="n-icon">⇄</span><span class="n-label">Routes</span></div>
        <div class="n-item"><span class="n-icon">⚡</span><span class="n-label">Events</span></div>
        <div class="n-item"><span class="n-icon">∿</span><span class="n-label">Stats</span></div>
      </div>
    </div>
  </div>
</div>

<section>
  <div class="section-label">CORE FEATURES</div>
  <h2 class="section-title">Everything you need.<br>Nothing you don't.</h2>
  <p class="section-sub">Built for the founder who's also the on-call engineer.</p>
  <div class="features">
    <div class="feature">
      <div class="f-icon">◉</div>
      <div class="f-title">Live Status Overview</div>
      <div class="f-body">See all your services at a glance. Uptime bars, latency, error rates — one screen, zero clutter.</div>
    </div>
    <div class="feature">
      <div class="f-icon">⇄</div>
      <div class="f-title">Route-Level Monitoring</div>
      <div class="f-body">P50/P99 breakdowns per endpoint. Catch that one slow webhook before it becomes a support ticket.</div>
    </div>
    <div class="feature">
      <div class="f-icon">⚡</div>
      <div class="f-title">Incident Timeline</div>
      <div class="f-body">Every incident with MTTD, MTTR, and RCA notes. Your on-call diary, auto-written.</div>
    </div>
    <div class="feature">
      <div class="f-icon">∿</div>
      <div class="f-title">Trend Analytics</div>
      <div class="f-body">7-day and 30-day views by region. Know if your EU users are getting slower before they email you.</div>
    </div>
    <div class="feature">
      <div class="f-icon">⚑</div>
      <div class="f-title">Smart Alert Rules</div>
      <div class="f-body">Condition-based rules with PagerDuty, Slack, and SMS routing. On-call schedules included.</div>
    </div>
    <div class="feature">
      <div class="f-icon">⊡</div>
      <div class="f-title">Zero Config Setup</div>
      <div class="f-body">Point Uplink at your API. It handles the rest — no agents, no infra, no YAML files.</div>
    </div>
  </div>

  <div class="uptime-section">
    <div class="up-title">UPTIME — LAST 30 DAYS</div>
    <div class="up-bar" id="up-bar"></div>
    <div class="up-meta"><span class="up-pct">99.98%</span><span class="up-label">2 incidents · 18 min total downtime</span></div>
  </div>

  <div class="metrics-row">
    <div class="metric-card"><div class="mc-val" style="color:#4F7EFF">4.2K</div><div class="mc-label">REQUESTS / MIN</div></div>
    <div class="metric-card"><div class="mc-val" style="color:#EDF0F8">182ms</div><div class="mc-label">P99 LATENCY</div></div>
    <div class="metric-card"><div class="mc-val" style="color:#3DCA8A">99.98%</div><div class="mc-label">30-DAY UPTIME</div></div>
    <div class="metric-card"><div class="mc-val" style="color:#9B6DFF">6</div><div class="mc-label">REGIONS</div></div>
  </div>

  <div class="cta-block">
    <h2>Know before<br>your users do.</h2>
    <p>Start monitoring in under 60 seconds. No credit card required.</p>
    <a class="btn-primary" href="https://ram.zenbin.org/uplink-mock">Explore the Mock →</a>
  </div>
</section>

<footer>
  <p>Uplink · API Health Monitoring · Designed by RAM ✦ ram.zenbin.org/uplink</p>
</footer>
<script>
// Build uptime blocks
const bar = document.getElementById('up-bar');
for (let i = 0; i < 30; i++) {
  const b = document.createElement('div');
  b.className = 'up-block' + (i===14?' out':i===22?' deg':'');
  bar.appendChild(b);
}
</script>
</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
function makeViewerHtml(penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let base = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Uplink — Prototype Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0B0D14;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Inter',sans-serif}
.wrap{display:flex;flex-direction:column;align-items:center;gap:16px;padding:32px 16px}
h1{font-size:18px;color:#EDF0F8;font-weight:600;letter-spacing:-.01em}
.sub{font-size:13px;color:rgba(237,240,248,0.45);margin-top:-10px}
.screen-nav{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.sn-btn{background:rgba(79,126,255,0.12);border:1px solid rgba(79,126,255,0.22);color:#4F7EFF;font-size:12px;font-weight:600;padding:6px 14px;border-radius:20px;cursor:pointer;font-family:inherit;transition:background .2s}
.sn-btn.active,.sn-btn:hover{background:rgba(79,126,255,0.24)}
canvas{border-radius:36px;box-shadow:0 20px 60px rgba(0,0,0,0.60),0 0 0 1px rgba(255,255,255,0.04)}
.back{font-size:12px;color:rgba(237,240,248,0.35);text-decoration:none;margin-top:8px}
.back:hover{color:rgba(237,240,248,0.6)}
</style>
</head>
<body>
${injection}
<div class="wrap">
  <h1>Uplink — Prototype</h1>
  <p class="sub">API Health Monitoring · Dark UI · RAM Design</p>
  <div class="screen-nav" id="nav"></div>
  <canvas id="c" width="390" height="844"></canvas>
  <a class="back" href="https://ram.zenbin.org/uplink">← Back to hero</a>
</div>
<script>
(function(){
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if (!pen) { document.body.innerHTML='<p style="color:#ff4f6a;padding:32px">No pen data</p>'; return; }
  const screens = pen.screens || [];
  let cur = 0;
  const nav = document.getElementById('nav');
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  function drawScreen(idx) {
    const s = screens[idx];
    if (!s) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = s.backgroundColor || '#0B0D14';
    ctx.beginPath(); ctx.roundRect(0,0,canvas.width,canvas.height,36); ctx.fill();
    (s.elements||[]).forEach(el => drawEl(ctx, el));
    document.querySelectorAll('.sn-btn').forEach((b,i)=>b.classList.toggle('active',i===idx));
  }

  function drawEl(ctx, el) {
    if (el.opacity === 0) return;
    ctx.save();
    if (el.opacity !== undefined && el.opacity !== 1) ctx.globalAlpha = el.opacity;
    if (el.type==='rectangle') {
      ctx.beginPath();
      const r = el.cornerRadius||0;
      if (r>0) ctx.roundRect(el.x,el.y,el.width,el.height,r);
      else ctx.rect(el.x,el.y,el.width,el.height);
      if (el.fill && el.fill!=='transparent') { ctx.fillStyle=el.fill; ctx.fill(); }
      if (el.stroke && el.stroke!=='transparent' && el.strokeWidth>0) { ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth; ctx.stroke(); }
    } else if (el.type==='ellipse') {
      const cx=el.x+el.width/2, cy=el.y+el.height/2, rx=el.width/2, ry=el.height/2;
      ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
      if (el.fill && el.fill!=='transparent') { ctx.fillStyle=el.fill; ctx.fill(); }
      if (el.stroke && el.stroke!=='transparent' && el.strokeWidth>0) { ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth; ctx.stroke(); }
    } else if (el.type==='line') {
      ctx.beginPath(); ctx.moveTo(el.x1,el.y1); ctx.lineTo(el.x2,el.y2);
      ctx.strokeStyle=el.stroke||'#fff'; ctx.lineWidth=el.strokeWidth||1; ctx.stroke();
    } else if (el.type==='text') {
      const ff = el.fontFamily || 'Inter, sans-serif';
      const fw = el.fontWeight || '400';
      const fs = el.fontSize || 13;
      ctx.font = \`\${fw} \${fs}px \${ff}\`;
      ctx.fillStyle = el.color || '#EDF0F8';
      ctx.textAlign = el.textAlign || 'left';
      ctx.textBaseline = 'top';
      if (el.letterSpacing && el.letterSpacing !== 0) {
        ctx.letterSpacing = (el.letterSpacing * fs) + 'px';
      }
      ctx.fillText(el.content||'', el.x, el.y);
      ctx.letterSpacing = '0px';
    }
    ctx.restore();
  }

  screens.forEach((s,i) => {
    const btn = document.createElement('button');
    btn.className = 'sn-btn' + (i===0?' active':'');
    btn.textContent = s.name || ('Screen '+(i+1));
    btn.onclick = () => { cur=i; drawScreen(i); };
    nav.appendChild(btn);
  });

  // Touch/click to advance
  canvas.addEventListener('click', () => { cur=(cur+1)%screens.length; drawScreen(cur); });
  drawScreen(0);
})();
<\/script>
</body>
</html>`;
  return base;
}

async function main() {
  console.log('Publishing UPLINK...\n');

  // 1. Hero
  process.stdout.write('  [1/3] Hero page… ');
  const r1 = await pub(SLUG, heroHtml, `Uplink — ${TAGLINE}`);
  console.log(r1.ok ? `✓ ${r1.url}` : `✗ ${r1.status} ${r1.body}`);

  // 2. Viewer
  process.stdout.write('  [2/3] Viewer… ');
  const penJson = fs.readFileSync('/workspace/group/design-studio/uplink.pen', 'utf8');
  const viewerHtml = makeViewerHtml(penJson);
  const r2 = await pub(`${SLUG}-viewer`, viewerHtml, `Uplink — Prototype Viewer`);
  console.log(r2.ok ? `✓ ${r2.url}` : `✗ ${r2.status} ${r2.body}`);

  console.log('\n  URLs:');
  console.log(`    Hero:   ${r1.url}`);
  console.log(`    Viewer: ${r2.url}`);
  console.log('\nDone.');
}

main().catch(console.error);
