// volt-publish.js — VOLT: Network Security Observability
// Dark electric-midnight security dashboard
// Inspired by Evervault (godly.website) + Tracebit (land-book.com) + Midday/Linear dark UIs

const https = require('https');
const fs    = require('fs');

const SLUG      = 'volt';
const APP_NAME  = 'VOLT';
const TAGLINE   = 'live wire. dead threats.';
const ARCHETYPE = 'security-observability';
const ZENBIN_SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT  = 'Dark security network observability dashboard inspired by Evervault dark security card aesthetic (godly.website), Tracebit "The answer to Assume Breach" (land-book.com), and Midday/Linear precision dark dashboards (darkmodedesign.com). Electric-cyan (#00CFFF) + alert-red (#FF4D2E) palette on deep navy-black. Five screens: Live Feed event stream with severity codes, Network Map radial topology with pulse rings on critical nodes, Incident Detail with attack timeline bar chart + response actions, Response Policies with IF/DO rule cards, Timeline with 24h severity heatmap grid.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug + '?overwrite=true',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': ZENBIN_SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ── Hero Page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VOLT — Network Security Observability</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:        #080B12;
    --bgB:       #0F1420;
    --surface:   #0F1420;
    --surfaceB:  #141B2D;
    --surfaceC:  #1A2236;
    --accent:    #00CFFF;
    --accentDim: rgba(0,207,255,0.12);
    --alert:     #FF4D2E;
    --alertDim:  rgba(255,77,46,0.12);
    --warning:   #F59E0B;
    --success:   #22D38A;
    --violet:    #8B5CF6;
    --text:      #E2E8F4;
    --textMid:   rgba(226,232,244,0.6);
    --textDim:   rgba(226,232,244,0.35);
    --border:    rgba(226,232,244,0.07);
    --borderMid: rgba(226,232,244,0.13);
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg); color: var(--text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.5; overflow-x: hidden;
  }

  nav {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,11,18,0.88); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 40px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-brand { font-size: 18px; font-weight: 900; letter-spacing: 3px; color: var(--accent); font-family: 'Courier New', monospace; }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--textMid); text-decoration: none; }
  .nav-links a:hover { color: var(--accent); }
  .nav-cta { font-size: 12px; font-weight: 700; background: var(--accent); color: var(--bg); padding: 8px 18px; border-radius: 6px; text-decoration: none; }

  .hero {
    min-height: 88vh; display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden; padding: 80px 40px 60px;
  }
  .hero-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px; opacity: 0.5;
  }
  .hero-glow { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }
  .hero-glow-1 { width: 500px; height: 500px; top: -100px; left: -100px; background: radial-gradient(circle, rgba(0,207,255,0.08) 0%, transparent 70%); }
  .hero-glow-2 { width: 400px; height: 400px; bottom: -100px; right: -80px; background: radial-gradient(circle, rgba(255,77,46,0.07) 0%, transparent 70%); }
  .hero-inner { position: relative; z-index: 1; max-width: 900px; text-align: center; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--alertDim); border: 1px solid rgba(255,77,46,0.3);
    border-radius: 100px; padding: 6px 16px;
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    color: var(--alert); text-transform: uppercase; margin-bottom: 32px;
  }
  .hero-badge::before {
    content: ''; display: block; width: 7px; height: 7px; border-radius: 50%;
    background: var(--alert); box-shadow: 0 0 10px var(--alert);
    animation: pdot 2s infinite;
  }
  @keyframes pdot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
  .hero-wordmark {
    font-size: clamp(80px, 14vw, 160px); font-weight: 900; letter-spacing: -4px; line-height: 0.9;
    font-family: 'Courier New', monospace;
    background: linear-gradient(135deg, var(--accent) 0%, rgba(0,207,255,0.5) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 24px;
  }
  .hero-tagline { font-size: 20px; font-weight: 400; color: var(--textMid); letter-spacing: 4px; text-transform: uppercase; margin-bottom: 48px; }
  .hero-tagline em { color: var(--text); font-style: normal; }
  .hero-desc { font-size: 17px; color: var(--textMid); max-width: 580px; margin: 0 auto 48px; line-height: 1.7; }
  .hero-ctas { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-primary { display: inline-block; padding: 14px 32px; background: var(--accent); color: var(--bg); font-size: 14px; font-weight: 700; letter-spacing: 0.5px; border-radius: 8px; text-decoration: none; box-shadow: 0 0 30px rgba(0,207,255,0.3); }
  .btn-secondary { display: inline-block; padding: 14px 32px; background: transparent; color: var(--text); font-size: 14px; font-weight: 600; border: 1px solid var(--borderMid); border-radius: 8px; text-decoration: none; }

  .ticker { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 12px 0; overflow: hidden; font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 1px; color: var(--textMid); }
  .ticker-track { display: flex; gap: 80px; white-space: nowrap; animation: scroll-l 22s linear infinite; }
  @keyframes scroll-l { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .tick-item { display: inline-flex; align-items: center; gap: 8px; }
  .tick-dot { width: 6px; height: 6px; border-radius: 50%; }
  .tick-crit { background: var(--alert); box-shadow: 0 0 8px var(--alert); }
  .tick-high { background: var(--warning); }
  .tick-ok   { background: var(--success); }

  .metrics { max-width: 1100px; margin: 60px auto 0; padding: 0 40px; }
  .metrics-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; background: var(--surface); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
  .metric-item { padding: 32px 28px; border-right: 1px solid var(--border); position: relative; }
  .metric-item:last-child { border-right: none; }
  .metric-item.alert-item::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--alert); }
  .metric-val { font-size: 42px; font-weight: 900; letter-spacing: -2px; line-height: 1; font-family: 'Courier New', monospace; margin-bottom: 8px; }
  .metric-val.c-accent  { color: var(--accent); }
  .metric-val.c-alert   { color: var(--alert); }
  .metric-val.c-success { color: var(--success); }
  .metric-val.c-warning { color: var(--warning); }
  .metric-label { font-size: 12px; color: var(--textMid); letter-spacing: 0.5px; }

  .features { max-width: 1100px; margin: 64px auto 0; padding: 0 40px; }
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; }
  .section-title { font-size: 36px; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 48px; max-width: 520px; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 28px; position: relative; overflow: hidden; }
  .feature-card::before { content: attr(data-num); position: absolute; top: -8px; right: 16px; font-family: 'Courier New', monospace; font-size: 72px; font-weight: 900; line-height: 1; color: rgba(226,232,244,0.04); }
  .feature-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 18px; }
  .feature-icon.cyan   { background: var(--accentDim); }
  .feature-icon.red    { background: var(--alertDim); }
  .feature-icon.green  { background: rgba(34,211,138,0.1); }
  .feature-icon.violet { background: rgba(139,92,246,0.12); }
  .feature-icon.amber  { background: rgba(245,158,11,0.1); }
  .feature-icon.blue   { background: rgba(59,130,246,0.1); }
  .feature-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.3px; }
  .feature-desc { font-size: 13px; color: var(--textMid); line-height: 1.6; }

  .rule-block { max-width: 1100px; margin: 64px auto 0; padding: 0 40px; }
  .rule-terminal { background: var(--surfaceB); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
  .rule-terminal-bar { background: var(--surfaceC); border-bottom: 1px solid var(--border); padding: 12px 16px; display: flex; align-items: center; gap: 8px; }
  .term-dot { width: 10px; height: 10px; border-radius: 50%; }
  .term-title { margin-left: 8px; font-size: 11px; letter-spacing: 1px; color: var(--textDim); }
  .rule-body { padding: 28px 32px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 2; }
  .k{color:var(--violet)} .v{color:var(--accent)} .s{color:var(--success)} .c{color:var(--textDim)} .a{color:var(--alert)} .w{color:var(--warning)}

  .screens-section { max-width: 1100px; margin: 64px auto 0; padding: 0 40px 80px; }
  .screens-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 28px; }
  .screen-chip { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 14px; text-align: center; }
  .screen-num { font-family: 'Courier New', monospace; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: var(--accent); margin-bottom: 8px; }
  .screen-name { font-size: 14px; font-weight: 800; margin-bottom: 4px; letter-spacing: -0.3px; }
  .screen-sub { font-size: 11px; color: var(--textDim); }

  .pull-quote { max-width: 1100px; margin: 0 auto; padding: 0 40px 64px; }
  .pull-quote-inner { background: var(--alertDim); border: 1px solid rgba(255,77,46,0.2); border-left: 4px solid var(--alert); border-radius: 12px; padding: 32px 40px; }
  blockquote { font-size: 20px; font-weight: 400; line-height: 1.6; color: var(--text); margin-bottom: 16px; font-style: italic; }
  cite { font-family: 'Courier New', monospace; font-size: 11px; color: var(--textMid); font-style: normal; letter-spacing: 0.5px; }

  footer { border-top: 1px solid var(--border); background: var(--surfaceB); padding: 40px; }
  .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; }
  .footer-brand { font-family: 'Courier New', monospace; font-size: 20px; font-weight: 900; color: var(--accent); letter-spacing: 3px; }
  .footer-brand span { display: block; font-size: 11px; font-weight: 400; color: var(--textMid); letter-spacing: 1px; margin-top: 4px; font-family: sans-serif; }
  .footer-links { display: flex; gap: 28px; }
  .footer-links a { font-size: 13px; color: var(--textMid); text-decoration: none; }
  .footer-links a:hover { color: var(--accent); }
  .footer-credit { font-size: 12px; color: var(--textDim); text-align: right; }
</style>
</head>
<body>

<nav>
  <div class="nav-brand">VOLT</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#rules">Policies</a>
    <a href="#screens">Screens</a>
  </div>
  <a href="https://ram.zenbin.org/volt-viewer" class="nav-cta">View Prototype</a>
</nav>

<section class="hero">
  <div class="hero-grid"></div>
  <div class="hero-glow hero-glow-1"></div>
  <div class="hero-glow hero-glow-2"></div>
  <div class="hero-inner">
    <div class="hero-badge">Live threat detection</div>
    <div class="hero-wordmark">VOLT</div>
    <div class="hero-tagline"><em>live wire.</em> dead threats.</div>
    <p class="hero-desc">
      Real-time network observability for teams that assume breach.
      Watch every packet, surface every anomaly, and respond automatically —
      before attackers get comfortable.
    </p>
    <div class="hero-ctas">
      <a href="https://ram.zenbin.org/volt-viewer" class="btn-primary">View Prototype</a>
      <a href="https://ram.zenbin.org/volt-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
  </div>
</section>

<div class="ticker">
  <div class="ticker-track">
    ${[
      ['crit','[CRITICAL] INC-0041 SSH brute force — DB-01 · 185.234.219.44 · 1,847 attempts'],
      ['high','[HIGH] DNS anomaly · *.onion.resolver · QUARANTINED'],
      ['ok',  '[OK] Auto-block applied · 12 IPs blocked last 5min'],
      ['crit','[CRITICAL] Port scan · 203.0.113.77 · 21 ports in 3s'],
      ['high','[HIGH] Cert pinning bypass · mobile-client → api.internal'],
      ['ok',  '[OK] Policy engine active · 6 rules · 0 failures'],
      ['crit','[CRITICAL] INC-0041 SSH brute force — DB-01 · 185.234.219.44 · 1,847 attempts'],
      ['high','[HIGH] DNS anomaly · *.onion.resolver · QUARANTINED'],
      ['ok',  '[OK] Auto-block applied · 12 IPs blocked last 5min'],
      ['crit','[CRITICAL] Port scan · 203.0.113.77 · 21 ports in 3s'],
      ['high','[HIGH] Cert pinning bypass · mobile-client → api.internal'],
      ['ok',  '[OK] Policy engine active · 6 rules · 0 failures'],
    ].map(([level, msg]) => '<span class="tick-item"><span class="tick-dot tick-' + level + '"></span>' + msg + '</span>').join('')}
  </div>
</div>

<div class="metrics">
  <div class="metrics-inner">
    <div class="metric-item alert-item">
      <div class="metric-val c-alert">3</div>
      <div class="metric-label">Active Incidents</div>
    </div>
    <div class="metric-item">
      <div class="metric-val c-accent">3,847</div>
      <div class="metric-label">Events today</div>
    </div>
    <div class="metric-item">
      <div class="metric-val c-success">1,204</div>
      <div class="metric-label">Auto-blocked</div>
    </div>
    <div class="metric-item">
      <div class="metric-val c-warning">23</div>
      <div class="metric-label">Needs review</div>
    </div>
  </div>
</div>

<section class="features" id="features">
  <div class="section-label" style="margin-top:64px">Capabilities</div>
  <h2 class="section-title">Everything your SOC needs, always on.</h2>
  <div class="features-grid">
    <div class="feature-card" data-num="01">
      <div class="feature-icon cyan">⚡</div>
      <div class="feature-title">Live Event Feed</div>
      <div class="feature-desc">Real-time stream of every network event. Severity-coded, source-tracked, filterable in under 200ms.</div>
    </div>
    <div class="feature-card" data-num="02">
      <div class="feature-icon red">🔴</div>
      <div class="feature-title">Topology Map</div>
      <div class="feature-desc">Radial network graph shows which nodes are clean, anomalous, or under active attack — updated live.</div>
    </div>
    <div class="feature-card" data-num="03">
      <div class="feature-icon green">🛡</div>
      <div class="feature-title">Incident Drilling</div>
      <div class="feature-desc">From signal to context in one tap. Attacker fingerprint, timeline bar chart, one-click response actions.</div>
    </div>
    <div class="feature-card" data-num="04">
      <div class="feature-icon violet">⚙️</div>
      <div class="feature-title">Policy Engine</div>
      <div class="feature-desc">Write IF/DO rules in plain syntax. Block, throttle, alert, page — automatically, in milliseconds.</div>
    </div>
    <div class="feature-card" data-num="05">
      <div class="feature-icon amber">📊</div>
      <div class="feature-title">24h Heatmap</div>
      <div class="feature-desc">See attack patterns across the full day. Density grid by severity lets you spot timing patterns instantly.</div>
    </div>
    <div class="feature-card" data-num="06">
      <div class="feature-icon blue">🌐</div>
      <div class="feature-title">Threat Intelligence</div>
      <div class="feature-desc">Every source IP enriched with ASN, geolocation, and historical incident count from the global threat graph.</div>
    </div>
  </div>
</section>

<section class="rule-block" id="rules">
  <div class="section-label" style="margin-top:64px">Policy Engine</div>
  <h2 class="section-title">Rules that read like intentions.</h2>
  <div class="rule-terminal">
    <div class="rule-terminal-bar">
      <span class="term-dot" style="background:#FF5F57"></span>
      <span class="term-dot" style="background:#FEBC2E"></span>
      <span class="term-dot" style="background:#28C840"></span>
      <span class="term-title">volt · policy-engine · 6 rules active</span>
    </div>
    <div class="rule-body">
      <span class="c">// Rule 1 — Auto-block SSH brute force</span><br>
      <span class="k">WHEN</span> <span class="v">event.type</span> <span class="c">=</span> <span class="s">"auth_fail"</span><br>
      &nbsp;&nbsp;<span class="k">AND</span> <span class="v">count</span>(<span class="v">event.source_ip</span>, <span class="s">30s</span>) <span class="c">&gt;</span> <span class="w">10</span><br>
      <span class="k">DO</span> <span class="a">BLOCK</span> <span class="v">event.source_ip</span> <span class="k">FOR</span> <span class="s">24h</span><br>
      &nbsp;&nbsp;<span class="k">AND</span> <span class="a">ALERT</span> <span class="s">"security"</span> <span class="k">WITH</span> <span class="v">severity</span><span class="c">=</span><span class="a">CRITICAL</span><br><br>
      <span class="c">// Rule 2 — DNS watchlist quarantine</span><br>
      <span class="k">WHEN</span> <span class="v">dns.query.tld</span> <span class="k">IN</span> <span class="v">watchlist</span><span class="c">.</span><span class="v">malicious_tlds</span><br>
      <span class="k">DO</span> <span class="a">QUARANTINE</span> <span class="v">event.source_host</span><br>
      &nbsp;&nbsp;<span class="k">AND</span> <span class="s">LOG</span> <span class="v">event</span> <span class="k">TO</span> <span class="s">"siem"</span><br><br>
      <span class="c">// Rule 3 — API abuse throttle</span><br>
      <span class="k">WHEN</span> <span class="v">http.status</span> <span class="c">=</span> <span class="w">429</span> <span class="k">AND</span> <span class="v">rate</span> <span class="c">&gt;</span> <span class="w">500</span><span class="c">/min</span><br>
      <span class="k">DO</span> <span class="w">THROTTLE</span> <span class="v">event.source_ip</span> <span class="k">TO</span> <span class="w">10</span><span class="c">/min</span><br>
      &nbsp;&nbsp;<span class="k">AND</span> <span class="s">NOTIFY</span> <span class="s">"ops-channel"</span>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="section-label">Five Screens</div>
  <h2 class="section-title">From raw signal to resolved incident.</h2>
  <div class="screens-grid">
    ${[
      { n:'01', name:'Live Feed',       sub:'Real-time event stream' },
      { n:'02', name:'Network Map',     sub:'Radial topology graph' },
      { n:'03', name:'Incident Detail', sub:'Drill-down + response' },
      { n:'04', name:'Policies',        sub:'IF/DO rule engine' },
      { n:'05', name:'Timeline',        sub:'24h heatmap + summary' },
    ].map(s => '<div class="screen-chip"><div class="screen-num">' + s.n + '</div><div class="screen-name">' + s.name + '</div><div class="screen-sub">' + s.sub + '</div></div>').join('')}
  </div>
</section>

<div class="pull-quote">
  <div class="pull-quote-inner">
    <blockquote>
      "Assume breach isn't a philosophy — it's an architecture.
      Every screen in VOLT is designed for the team that's already
      lost trust in their perimeter."
    </blockquote>
    <cite>— VOLT Design Principle · RAM, March 2026</cite>
  </div>
</div>

<footer>
  <div class="footer-inner">
    <div class="footer-brand">
      VOLT
      <span>Network Security Observability</span>
    </div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/volt-viewer">Prototype</a>
      <a href="https://ram.zenbin.org/volt-mock">Interactive Mock</a>
    </div>
    <div class="footer-credit">
      RAM Design Heartbeat<br>
      March 24, 2026
    </div>
  </div>
</footer>

</body>
</html>`;

function buildViewer(penJson) {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VOLT — Prototype Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080B12; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: 'Courier New', monospace; }
  header { width: 100%; background: #0F1420; border-bottom: 1px solid rgba(226,232,244,0.07); padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
  .hdr-brand { font-size: 20px; font-weight: 900; color: #00CFFF; letter-spacing: 3px; }
  .hdr-sub { font-size: 10px; color: rgba(226,232,244,0.4); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; font-family: sans-serif; }
  .hdr-link { font-size: 12px; color: #00CFFF; text-decoration: none; font-weight: 700; font-family: sans-serif; }
  #pencil-viewer { width: 100%; flex: 1; border: none; min-height: 600px; }
</style>
</head>
<body>
<header>
  <div>
    <div class="hdr-brand">VOLT</div>
    <div class="hdr-sub">Network Security Observability</div>
  </div>
  <a href="https://ram.zenbin.org/volt" class="hdr-link">← Overview</a>
</header>
<script>EMBEDDED_PEN_PLACEHOLDER</script>
<script src="https://pencil.dev/viewer.js"></script>
<div id="pencil-viewer"></div>
<script>
  if (window.PencilViewer && window.EMBEDDED_PEN) {
    PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN) });
  }
</script>
</body>
</html>`;
  const injection = 'window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';';
  viewerHtml = viewerHtml.replace('EMBEDDED_PEN_PLACEHOLDER', injection);
  return viewerHtml;
}

(async () => {
  console.log('── VOLT Publish ──');

  console.log('Publishing hero…');
  const heroRes = await zenPublish(SLUG, heroHtml, 'VOLT — Network Security Observability');
  console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));

  const penJson = fs.readFileSync('/workspace/group/design-studio/volt.pen', 'utf8');
  const viewerHtml = buildViewer(penJson);
  console.log('Publishing viewer…');
  const viewerRes = await zenPublish(SLUG + '-viewer', viewerHtml, 'VOLT — Prototype Viewer');
  console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));

  console.log('Updating gallery queue…');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: '/repos/' + REPO + '/contents/queue.json',
    method: 'GET',
    headers: { 'Authorization': 'token ' + TOKEN, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: 'heartbeat-' + SLUG + '-' + Date.now(),
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: 'https://ram.zenbin.org/' + SLUG,
    mock_url: 'https://ram.zenbin.org/' + SLUG + '-mock',
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: 'add: ' + APP_NAME + ' to gallery (heartbeat)', content: newContent, sha: currentSha });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: '/repos/' + REPO + '/contents/queue.json',
    method: 'PUT',
    headers: { 'Authorization': 'token ' + TOKEN, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, newEntry);
    rebuildEmbeddings(db);
    console.log('Indexed in design DB');
  } catch (e) {
    console.log('Design DB skipped:', e.message);
  }

  console.log('');
  console.log('Hero:   https://ram.zenbin.org/volt');
  console.log('Viewer: https://ram.zenbin.org/volt-viewer');
  console.log('Mock:   https://ram.zenbin.org/volt-mock');
})();
