const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'epoch';
const APP_NAME = 'EPOCH';
const TAGLINE = 'Your year, rendered.';
const ARCHETYPE = 'analytics-wrapped';

function zenReq(method, urlPath, body, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'zenbin.org',
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': subdomain
      }
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  const penJson = fs.readFileSync('/workspace/group/design-studio/epoch.pen', 'utf8');

  // ── HERO PAGE ──
  const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EPOCH — Your year, rendered.</title>
<meta name="description" content="Annual intelligence platform that renders your year as immersive visual data — work patterns, creative output, and key moments in one cinematic dashboard.">
<meta property="og:title" content="EPOCH — Your year, rendered.">
<meta property="og:description" content="Annual intelligence platform that renders your year as immersive visual data.">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#09090E;--surface:#131320;--text:#EBE8F7;
    --accent:#F5A623;--accent2:#7C6FFF;--muted:rgba(235,232,247,0.4)
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
  
  /* Ambient glow */
  body::before{content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);
    width:600px;height:600px;border-radius:50%;
    background:radial-gradient(circle,rgba(245,166,35,0.06) 0%,transparent 70%);
    pointer-events:none;z-index:0}

  nav{position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;justify-content:space-between;align-items:center;
    padding:20px 32px;background:rgba(9,9,14,0.85);backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(235,232,247,0.06)}
  .logo{font-size:13px;font-weight:800;letter-spacing:4px;color:var(--text)}
  .year-badge{font-size:12px;font-weight:600;color:var(--accent);
    background:rgba(245,166,35,0.1);padding:6px 14px;border-radius:20px;
    border:1px solid rgba(245,166,35,0.2)}

  .hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;
    align-items:center;text-align:center;padding:120px 24px 80px;position:relative;z-index:1}
  .hero-eyebrow{font-size:11px;font-weight:700;letter-spacing:4px;color:var(--accent);
    margin-bottom:28px;opacity:0.8}
  .hero-title{font-size:clamp(52px,8vw,96px);font-weight:800;line-height:1.0;
    letter-spacing:-3px;margin-bottom:24px}
  .hero-title .dim{color:var(--muted)}
  .hero-sub{font-size:18px;color:var(--muted);max-width:500px;line-height:1.6;margin-bottom:48px}
  
  .cta-row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center}
  .cta-primary{background:var(--accent);color:var(--bg);padding:16px 36px;
    border-radius:14px;font-size:15px;font-weight:700;text-decoration:none;
    transition:opacity 0.2s}
  .cta-primary:hover{opacity:0.88}
  .cta-ghost{background:transparent;color:var(--text);padding:16px 36px;
    border-radius:14px;font-size:15px;font-weight:600;text-decoration:none;
    border:1px solid rgba(235,232,247,0.15);transition:border-color 0.2s}
  .cta-ghost:hover{border-color:rgba(235,232,247,0.35)}

  /* Stats row */
  .stats{display:flex;gap:0;margin-top:80px;border:1px solid rgba(235,232,247,0.07);
    border-radius:20px;overflow:hidden;background:var(--surface)}
  .stat{flex:1;padding:28px 24px;text-align:center;border-right:1px solid rgba(235,232,247,0.06)}
  .stat:last-child{border-right:none}
  .stat-val{font-size:32px;font-weight:800;color:var(--accent);letter-spacing:-1px}
  .stat-val.indigo{color:var(--accent2)}
  .stat-label{font-size:11px;font-weight:600;letter-spacing:2px;color:var(--muted);
    margin-top:6px;text-transform:uppercase}

  /* Feature section */
  .features{padding:80px 24px;max-width:1100px;margin:0 auto}
  .section-label{font-size:11px;font-weight:700;letter-spacing:4px;color:var(--accent);
    text-align:center;margin-bottom:16px}
  .section-title{font-size:clamp(28px,4vw,48px);font-weight:800;text-align:center;
    letter-spacing:-1px;margin-bottom:56px}

  .feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
  .feat-card{background:var(--surface);border:1px solid rgba(235,232,247,0.06);
    border-radius:20px;padding:32px;transition:border-color 0.2s}
  .feat-card:hover{border-color:rgba(245,166,35,0.2)}
  .feat-icon{font-size:28px;margin-bottom:18px}
  .feat-title{font-size:17px;font-weight:700;margin-bottom:10px}
  .feat-desc{font-size:14px;color:var(--muted);line-height:1.65}

  /* Heatmap teaser */
  .heatmap-section{padding:80px 24px;max-width:800px;margin:0 auto;text-align:center}
  .heatmap-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;margin-top:32px}
  .hm-col{display:flex;flex-direction:column;gap:4px}
  .hm-cell{height:14px;border-radius:3px}
  .month-labels{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;
    margin-top:8px;font-size:10px;color:var(--muted);letter-spacing:1px}

  /* Footer */
  footer{padding:48px 32px;border-top:1px solid rgba(235,232,247,0.06);
    display:flex;justify-content:space-between;align-items:center;flex-wrap:gap}
  footer .logo{font-size:12px;letter-spacing:3px;opacity:0.5}
  footer p{font-size:12px;color:var(--muted);opacity:0.5}
</style>
</head>
<body>

<nav>
  <span class="logo">EPOCH</span>
  <span class="year-badge">2025 ↗</span>
</nav>

<section class="hero">
  <p class="hero-eyebrow">Annual Intelligence Platform</p>
  <h1 class="hero-title">Your Year,<br><span class="dim">Rendered.</span></h1>
  <p class="hero-sub">Connect your tools. We surface the patterns, breakthroughs, and collaborations that defined your 2025.</p>
  <div class="cta-row">
    <a href="/epoch-viewer" class="cta-primary">View Interactive Prototype →</a>
    <a href="/epoch-mock" class="cta-ghost">Open Mock ☀◑</a>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-val">94</div>
      <div class="stat-label">Focus Score</div>
    </div>
    <div class="stat">
      <div class="stat-val indigo">2.8K</div>
      <div class="stat-label">Hours Logged</div>
    </div>
    <div class="stat">
      <div class="stat-val">394</div>
      <div class="stat-label">Tasks Shipped</div>
    </div>
    <div class="stat">
      <div class="stat-val indigo">47d</div>
      <div class="stat-label">Best Streak</div>
    </div>
  </div>
</section>

<section class="features">
  <p class="section-label">What's Inside</p>
  <h2 class="section-title">Five screens. One complete year.</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">◑</div>
      <div class="feat-title">Year Wrapped</div>
      <div class="feat-desc">Your headline numbers at a glance — focus score, task throughput, best streak, annual goal progress.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◈</div>
      <div class="feat-title">Timeline Heatmap</div>
      <div class="feat-desc">A 12-month activity grid that reveals your rhythm — peak months, deep work clusters, and momentum arcs.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">✦</div>
      <div class="feat-title">Top Moments</div>
      <div class="feat-desc">Your three highest-impact days of the year, ranked by a composite score of output, focus, and quality.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⬡</div>
      <div class="feat-title">Collaboration Map</div>
      <div class="feat-desc">An orbital network graph of everyone you worked with — strength, frequency, and new connections in 2025.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◎</div>
      <div class="feat-title">AI Insights</div>
      <div class="feat-desc">Patterns your year surfaced — peak days, growth signals, and forward projections for 2026.</div>
    </div>
  </div>
</section>

<section class="heatmap-section">
  <p class="section-label">Activity Heatmap</p>
  <h2 class="section-title" style="font-size:32px">Your rhythm across 2025</h2>
  <div class="heatmap-grid">
    ${[0.15,0.25,0.4,0.6,0.8,0.95,0.7,0.55,0.85,0.45,0.3,0.2].map((opacity, i) => `
    <div class="hm-col">
      <div class="hm-cell" style="background:rgba(245,166,35,${opacity})"></div>
      <div class="hm-cell" style="background:rgba(124,111,255,${[0.2,0.35,0.5,0.7,0.4,0.6,0.9,0.3,0.5,0.75,0.4,0.25][i]})"></div>
      <div class="hm-cell" style="background:rgba(245,166,35,${[0.1,0.2,0.3,0.45,0.65,0.5,0.8,0.6,0.4,0.55,0.35,0.15][i]})"></div>
    </div>`).join('')}
  </div>
  <div class="month-labels">
    ${['J','F','M','A','M','J','J','A','S','O','N','D'].map(m => `<div>${m}</div>`).join('')}
  </div>
</section>

<footer>
  <span class="logo">EPOCH</span>
  <p>Designed by RAM · ram.zenbin.org</p>
</footer>

</body>
</html>`;

  // ── VIEWER PAGE ──
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/penviewer-app.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  // Publish hero
  let res = await zenReq('POST', '/api/pages', { slug: SLUG, html: heroHtml, title: 'EPOCH — Your year, rendered.' });
  console.log('Hero:', res.status, res.body.slice(0,80));

  // Publish viewer
  res = await zenReq('POST', '/api/pages', { slug: SLUG + '-viewer', html: viewerHtml, title: 'EPOCH — Prototype Viewer' });
  console.log('Viewer:', res.status, res.body.slice(0,80));

  console.log('Hero live at: https://ram.zenbin.org/' + SLUG);
  console.log('Viewer live at: https://ram.zenbin.org/' + SLUG + '-viewer');
}

main().catch(console.error);
