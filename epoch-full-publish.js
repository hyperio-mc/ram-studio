'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG   = 'epoch';
const SUBDOM = 'ram';
const APP_NAME = 'EPOCH';
const TAGLINE = 'Your year, rendered.';
const ARCHETYPE = 'analytics-wrapped';

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOM,
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

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EPOCH — Your year, rendered.</title>
<meta name="description" content="Annual intelligence platform that renders your year as immersive visual data — work patterns, creative output, and key moments in one cinematic dashboard.">
<meta property="og:title" content="EPOCH — Your year, rendered.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#09090E;--surface:#131320;--text:#EBE8F7;
  --accent:#F5A623;--accent2:#7C6FFF;--muted:rgba(235,232,247,0.45);
  --border:rgba(235,232,247,0.07)
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

body::before{content:'';position:fixed;top:-300px;left:50%;transform:translateX(-50%);
  width:800px;height:800px;border-radius:50%;
  background:radial-gradient(circle,rgba(245,166,35,0.05) 0%,transparent 70%);
  pointer-events:none;z-index:0}
body::after{content:'';position:fixed;bottom:-200px;right:-100px;
  width:500px;height:500px;border-radius:50%;
  background:radial-gradient(circle,rgba(124,111,255,0.04) 0%,transparent 70%);
  pointer-events:none;z-index:0}

nav{position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;justify-content:space-between;align-items:center;
  padding:18px 40px;background:rgba(9,9,14,0.88);backdrop-filter:blur(24px);
  border-bottom:1px solid var(--border)}
.logo{font-size:13px;font-weight:800;letter-spacing:5px;color:var(--text)}
.nav-year{font-size:12px;font-weight:600;color:var(--accent);
  background:rgba(245,166,35,0.1);padding:6px 14px;border-radius:20px;
  border:1px solid rgba(245,166,35,0.2)}
.nav-links{display:flex;gap:28px}
.nav-links a{text-decoration:none;color:var(--muted);font-size:14px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--text)}

.hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  align-items:center;text-align:center;padding:120px 24px 80px;position:relative;z-index:1}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:5px;color:var(--accent);
  margin-bottom:28px;text-transform:uppercase}
h1{font-size:clamp(56px,9vw,108px);font-weight:800;line-height:0.95;
  letter-spacing:-4px;margin-bottom:28px}
h1 .dim{color:rgba(235,232,247,0.25)}
.hero-sub{font-size:18px;color:var(--muted);max-width:480px;line-height:1.65;margin-bottom:52px}

.cta-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
.btn-primary{background:var(--accent);color:#09090E;padding:16px 36px;
  border-radius:14px;font-size:15px;font-weight:700;text-decoration:none;
  transition:opacity .2s;white-space:nowrap}
.btn-primary:hover{opacity:.85}
.btn-ghost{background:transparent;color:var(--text);padding:16px 32px;
  border-radius:14px;font-size:15px;font-weight:600;text-decoration:none;
  border:1px solid rgba(235,232,247,0.14);transition:border-color .2s;white-space:nowrap}
.btn-ghost:hover{border-color:rgba(235,232,247,0.3)}

.stats-bar{display:flex;gap:0;border:1px solid var(--border);
  border-radius:20px;overflow:hidden;background:var(--surface);width:100%;max-width:600px}
.stat{flex:1;padding:24px 20px;text-align:center;border-right:1px solid var(--border)}
.stat:last-child{border-right:none}
.stat-val{font-size:28px;font-weight:800;letter-spacing:-1px}
.stat-label{font-size:10px;font-weight:600;letter-spacing:2px;color:var(--muted);
  margin-top:4px;text-transform:uppercase}

section{position:relative;z-index:1}

.features-section{padding:80px 24px;max-width:1100px;margin:0 auto}
.sec-eyebrow{font-size:10px;font-weight:700;letter-spacing:4px;color:var(--accent);
  text-align:center;margin-bottom:14px;text-transform:uppercase}
h2{font-size:clamp(28px,4vw,44px);font-weight:800;text-align:center;
  letter-spacing:-1.5px;margin-bottom:52px}

.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.feat-card{background:var(--surface);border:1px solid var(--border);
  border-radius:20px;padding:32px;transition:border-color .25s,transform .25s}
.feat-card:hover{border-color:rgba(245,166,35,0.2);transform:translateY(-3px)}
.feat-icon{font-size:24px;margin-bottom:18px;display:block}
.feat-card h3{font-size:17px;font-weight:700;margin-bottom:10px;letter-spacing:-0.3px}
.feat-card p{font-size:14px;color:var(--muted);line-height:1.65}

.heatmap-section{padding:60px 24px 80px;max-width:700px;margin:0 auto;text-align:center}
.heatmap-wrap{background:var(--surface);border:1px solid var(--border);
  border-radius:20px;padding:32px;margin-top:32px}
.hm-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:5px;margin-bottom:10px}
.hm-col{display:flex;flex-direction:column;gap:5px}
.hm-cell{border-radius:3px;aspect-ratio:1}
.month-labels{display:grid;grid-template-columns:repeat(12,1fr);gap:5px;
  font-size:10px;color:var(--muted);letter-spacing:1px}

.insight-section{padding:0 24px 80px;max-width:700px;margin:0 auto}
.insight-card{background:var(--surface);border:1px solid var(--border);
  border-radius:20px;padding:32px;margin-bottom:16px;position:relative;overflow:hidden}
.insight-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:var(--accent)}
.insight-card.indigo::before{background:var(--accent2)}
.ic-tag{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--accent);margin-bottom:12px}
.insight-card.indigo .ic-tag{color:var(--accent2)}
.insight-card h3{font-size:18px;font-weight:700;margin-bottom:10px;letter-spacing:-0.3px}
.insight-card p{font-size:14px;color:var(--muted);line-height:1.65}

.cta-final{background:var(--surface);border:1px solid rgba(245,166,35,0.2);
  border-radius:24px;padding:64px 40px;text-align:center;
  max-width:700px;margin:0 24px 80px;margin-left:auto;margin-right:auto}
.cta-final h2{margin-bottom:14px}
.cta-final p{font-size:16px;color:var(--muted);margin-bottom:36px}

footer{padding:40px;border-top:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
footer .f-logo{font-size:12px;letter-spacing:3px;font-weight:700;opacity:0.4}
footer p{font-size:12px;color:var(--muted);opacity:0.5}

@media(max-width:768px){
  nav{padding:16px 20px}.nav-links{display:none}
  h1{letter-spacing:-2px}.stats-bar{flex-wrap:wrap}
  .stat{min-width:50%;border-right:none;border-bottom:1px solid var(--border)}
  .stat:last-child{border-bottom:none}
  .cta-final{margin:0 16px 60px;padding:40px 24px}
  footer{flex-direction:column;align-items:center;text-align:center}
}
</style>
</head>
<body>

<nav>
  <span class="logo">EPOCH</span>
  <div class="nav-links">
    <a href="#">Timeline</a>
    <a href="#">Moments</a>
    <a href="#">Network</a>
    <a href="#">Insights</a>
  </div>
  <span class="nav-year">2025 ↗</span>
</nav>

<section class="hero">
  <p class="eyebrow">Annual Intelligence Platform</p>
  <h1>Your Year,<br><span class="dim">Rendered.</span></h1>
  <p class="hero-sub">Connect your tools. We surface the patterns, breakthroughs, and collaborations that defined your 2025.</p>
  <div class="cta-row">
    <a href="/epoch-viewer" class="btn-primary">View Prototype ↗</a>
    <a href="/epoch-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
  <div class="stats-bar">
    <div class="stat">
      <div class="stat-val" style="color:var(--accent)">94</div>
      <div class="stat-label">Focus Score</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color:var(--accent2)">2.8K</div>
      <div class="stat-label">Hours Logged</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color:var(--accent)">394</div>
      <div class="stat-label">Tasks Shipped</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color:var(--accent2)">47d</div>
      <div class="stat-label">Best Streak</div>
    </div>
  </div>
</section>

<section class="features-section">
  <p class="sec-eyebrow">What's Inside</p>
  <h2>Five screens. One complete year.</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <span class="feat-icon">◑</span>
      <h3>Year Wrapped</h3>
      <p>Your headline numbers at a glance — focus score, task throughput, best streak, and annual goal progress bar.</p>
    </div>
    <div class="feat-card">
      <span class="feat-icon">◈</span>
      <h3>Timeline Heatmap</h3>
      <p>A 12-month activity grid revealing your rhythm — peak months, deep work clusters, and momentum arcs over the year.</p>
    </div>
    <div class="feat-card">
      <span class="feat-icon">✦</span>
      <h3>Top Moments</h3>
      <p>Your three highest-impact days ranked by a composite score of output, focus time, and quality signals.</p>
    </div>
    <div class="feat-card">
      <span class="feat-icon">⬡</span>
      <h3>Collaboration Map</h3>
      <p>An orbital network graph of everyone you worked with — strength, frequency, and new connections made in 2025.</p>
    </div>
    <div class="feat-card">
      <span class="feat-icon">◎</span>
      <h3>AI Insights</h3>
      <p>Patterns your year surfaced — your best work days, deep focus growth signals, and 2026 forward projections.</p>
    </div>
  </div>
</section>

<section class="heatmap-section">
  <p class="sec-eyebrow">Activity Heatmap</p>
  <h2 style="font-size:28px">Your rhythm across 2025</h2>
  <div class="heatmap-wrap">
    <div class="hm-grid">
      ${[
        [0.15,0.25,0.4,0.6,0.8,0.95,0.7,0.55,0.85,0.45,0.3,0.2],
        [0.2,0.35,0.5,0.7,0.4,0.6,0.9,0.3,0.5,0.75,0.4,0.25],
        [0.1,0.2,0.3,0.45,0.65,0.5,0.8,0.6,0.4,0.55,0.35,0.15]
      ][0].map((o, i) => `<div class="hm-col">
        <div class="hm-cell" style="background:rgba(245,166,35,${o})"></div>
        <div class="hm-cell" style="background:rgba(124,111,255,${[0.2,0.35,0.5,0.7,0.4,0.6,0.9,0.3,0.5,0.75,0.4,0.25][i]})"></div>
        <div class="hm-cell" style="background:rgba(245,166,35,${[0.1,0.2,0.3,0.45,0.65,0.5,0.8,0.6,0.4,0.55,0.35,0.15][i]})"></div>
      </div>`).join('')}
    </div>
    <div class="month-labels">
      ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => `<span>${m}</span>`).join('')}
    </div>
  </div>
</section>

<section class="insight-section">
  <div class="insight-card">
    <p class="ic-tag">✦  PATTERN DETECTED</p>
    <h3>You do your best work on Tuesdays</h3>
    <p>78% of your high-output days this year fell on Tuesdays or Wednesdays. Consider scheduling your most creative work then for 2026.</p>
  </div>
  <div class="insight-card indigo">
    <p class="ic-tag">◈  GROWTH SIGNAL</p>
    <h3>Deep focus time ↑ 34% vs 2024</h3>
    <p>Your uninterrupted work blocks grew from 45 minutes to 6.2 hours average. Momentum compound effect at work.</p>
  </div>
</section>

<section class="cta-final">
  <h2 style="text-align:center;letter-spacing:-1px">Your year, your story.</h2>
  <p>Explore the full interactive prototype below.</p>
  <div class="cta-row" style="margin-bottom:0">
    <a href="/epoch-viewer" class="btn-primary">Open Prototype ↗</a>
    <a href="/epoch-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span class="f-logo">EPOCH</span>
  <p>Designed by RAM · Inspired by Awwwards "Unseen Studio 2025 Wrapped" · ram.zenbin.org/epoch</p>
</footer>

</body>
</html>`;

const penJson = fs.readFileSync('/workspace/group/design-studio/epoch.pen', 'utf8');
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/penviewer-app.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  let r = await zenPublish(SLUG, heroHtml, APP_NAME + ' — ' + TAGLINE);
  console.log('Hero:', r.status, r.body.slice(0,80));
  r = await zenPublish(SLUG + '-viewer', viewerHtml, APP_NAME + ' — Prototype Viewer');
  console.log('Viewer:', r.status, r.body.slice(0,80));
  console.log('Live → https://ram.zenbin.org/' + SLUG);
  console.log('Viewer → https://ram.zenbin.org/' + SLUG + '-viewer');
})();
