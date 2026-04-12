'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'trace';
const APP_NAME = 'TRACE';
const TAGLINE  = 'API Observability Engine';
const HOST     = 'zenbin.org';
const SUBDOMAIN = 'ram';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const req = https.request({
      hostname: HOST, port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': SUBDOMAIN,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, 'trace.pen'), 'utf8');
const pen = JSON.parse(penJson);

// ── HERO PAGE ──────────────────────────────────────────────────────────────────
const BG      = '#080B14';
const SURFACE = '#0F1420';
const BORDER  = '#1E2840';
const TEXT    = '#E8EDF5';
const MUTED   = '#4A5568';
const ACCENT  = '#00FF88';
const BLUE    = '#5B8DEF';
const WARN    = '#FFB547';
const DANGER  = '#FF4D6D';

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>TRACE — API Observability Engine</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${BG};--surface:${SURFACE};--surface2:#151B2E;--border:${BORDER};
  --text:${TEXT};--muted:${MUTED};--accent:${ACCENT};--blue:${BLUE};
  --warn:${WARN};--danger:${DANGER};
}
body{background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;overflow-x:hidden}
a{color:inherit;text-decoration:none}

/* Nav */
nav{display:flex;align-items:center;justify-content:space-between;padding:18px 48px;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(8,11,20,0.9);backdrop-filter:blur(12px);z-index:100}
.nav-brand{font-size:15px;font-weight:700;letter-spacing:3px}
.nav-links{display:flex;gap:28px;font-size:11px;letter-spacing:1.5px;color:var(--muted)}
.nav-links a:hover{color:var(--text)}
.nav-cta{font-size:10px;letter-spacing:1.5px;padding:8px 18px;border:1px solid var(--accent);color:var(--accent);border-radius:4px;transition:all .2s}
.nav-cta:hover{background:var(--accent);color:var(--bg)}

/* Hero */
.hero{min-height:100vh;display:flex;align-items:center;padding:80px 48px 100px;overflow:hidden;position:relative}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 70% 50%,rgba(0,255,136,0.04) 0%,transparent 70%);pointer-events:none}
.hero-grid{display:grid;grid-template-columns:1fr 420px;gap:80px;align-items:center;max-width:1200px;margin:0 auto;width:100%}
.hero-eyebrow{font-size:9px;letter-spacing:3px;color:var(--accent);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.hero-eyebrow::before{content:'';display:block;width:24px;height:1px;background:var(--accent)}
.hero-title{font-size:clamp(56px,7vw,96px);font-weight:800;letter-spacing:-3px;line-height:1;margin-bottom:6px}
.hero-tagline{font-size:clamp(16px,2.2vw,24px);font-weight:300;letter-spacing:3px;color:var(--muted);text-transform:uppercase;margin-bottom:28px}
.hero-desc{font-size:16px;line-height:1.7;color:var(--muted);max-width:500px;margin-bottom:48px}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap}
.btn-p{padding:13px 30px;background:var(--accent);color:var(--bg);font-size:11px;font-weight:700;letter-spacing:2px;border-radius:4px;border:none;cursor:pointer;text-transform:uppercase;transition:opacity .2s}
.btn-p:hover{opacity:.85}
.btn-s{padding:13px 30px;border:1px solid var(--border);color:var(--muted);font-size:11px;letter-spacing:2px;border-radius:4px;cursor:pointer;text-transform:uppercase;transition:all .2s}
.btn-s:hover{border-color:var(--text);color:var(--text)}

/* Phone mockup */
.phone-wrap{display:flex;justify-content:center;align-items:center;position:relative}
.phone{width:242px;background:var(--surface);border-radius:34px;padding:12px;border:1px solid var(--border);box-shadow:0 0 80px rgba(0,255,136,0.07),0 0 140px rgba(91,141,239,0.05);position:relative;z-index:2}
.phone-inner{border-radius:24px;overflow:hidden;width:100%;aspect-ratio:390/844}
.phone-inner svg{display:block;width:100%;height:auto}
.glow{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:1}
.g1{width:320px;height:320px;background:rgba(0,255,136,0.06);top:-40px;left:50%;transform:translateX(-50%)}
.g2{width:240px;height:240px;background:rgba(91,141,239,0.05);bottom:-20px;left:20%}

/* Stats section */
.stats{padding:80px 48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.stats-inner{max-width:1200px;margin:0 auto}
.stats-label{font-size:9px;letter-spacing:3px;color:var(--muted);margin-bottom:40px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border)}
.stat{background:var(--bg);padding:40px 32px}
.stat-num{font-size:clamp(40px,4vw,56px);font-weight:700;font-family:'Courier New',monospace;line-height:1;margin-bottom:4px}
.stat-num.g{color:var(--accent)}.stat-num.b{color:var(--blue)}.stat-num.w{color:var(--text)}
.stat-unit{font-size:16px;color:var(--muted);font-family:'Courier New',monospace}
.stat-label{font-size:9px;letter-spacing:2px;color:var(--muted);margin-top:8px}

/* Features */
.features{padding:100px 48px}
.features-inner{max-width:1200px;margin:0 auto}
.features-hd{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:56px}
.features-title{font-size:clamp(30px,3vw,46px);font-weight:700;letter-spacing:-1.5px}
.features-title span{color:var(--accent)}
.features-sub{font-size:11px;letter-spacing:2px;color:var(--muted)}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border)}
.feat{background:var(--surface);padding:38px 30px;transition:background .2s}
.feat:hover{background:var(--surface2)}
.feat-icon{font-size:22px;margin-bottom:18px}
.feat-name{font-size:13px;font-weight:700;letter-spacing:1px;margin-bottom:10px}
.feat-desc{font-size:12px;line-height:1.7;color:var(--muted)}
.feat-tag{display:inline-block;margin-top:18px;font-size:8px;letter-spacing:2px;color:var(--accent);border:1px solid rgba(0,255,136,0.3);padding:3px 9px;border-radius:2px}

/* Screens */
.scns{padding:100px 48px;border-top:1px solid var(--border)}
.scns-inner{max-width:1200px;margin:0 auto}
.scns-lbl{font-size:9px;letter-spacing:3px;color:var(--muted);margin-bottom:10px}
.scns-title{font-size:clamp(26px,3vw,42px);font-weight:700;letter-spacing:-1px;margin-bottom:44px}
.scns-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.scn-thumb{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;aspect-ratio:390/844;position:relative;cursor:pointer;transition:border-color .2s,transform .2s}
.scn-thumb:hover{border-color:var(--accent);transform:translateY(-4px)}
.scn-thumb svg{width:100%;height:100%;display:block}
.scn-label{position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:8px;letter-spacing:1px;color:var(--muted);pointer-events:none}

/* CTA */
.cta{padding:100px 48px;border-top:1px solid var(--border);text-align:center}
.cta-lbl{font-size:9px;letter-spacing:3px;color:var(--accent);margin-bottom:20px}
.cta-title{font-size:clamp(32px,4vw,56px);font-weight:700;letter-spacing:-1.5px;margin-bottom:14px}
.cta-sub{font-size:15px;color:var(--muted);margin-bottom:44px;max-width:440px;margin-left:auto;margin-right:auto}
.cta-actions{display:flex;justify-content:center;gap:14px}

/* Footer */
footer{padding:36px 48px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:10px;color:var(--muted);letter-spacing:1.5px}
footer a{color:var(--muted)} footer a:hover{color:var(--accent)}

/* Responsive */
@media(max-width:900px){
  nav,footer{padding:14px 20px}
  .hero{padding:60px 20px 80px}
  .hero-grid{grid-template-columns:1fr;gap:48px}
  .phone-wrap{order:-1}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .feat-grid{grid-template-columns:1fr}
  .scns-grid{grid-template-columns:repeat(3,1fr)}
  .features,.scns,.stats,.cta{padding:60px 20px}
}
</style>
</head>
<body>

<nav>
  <div class="nav-brand">TRACE</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="/trace-viewer">View design</a>
    <a href="/trace-mock">Mock ☀◑</a>
  </div>
  <a class="nav-cta" href="/trace-mock">Interactive mock ☀◑</a>
</nav>

<section class="hero">
  <div class="hero-grid">
    <div>
      <div class="hero-eyebrow">API OBSERVABILITY ENGINE</div>
      <h1 class="hero-title">TRACE</h1>
      <div class="hero-tagline">See everything. Miss nothing.</div>
      <p class="hero-desc">Real-time API health intelligence for developer teams. Monitor latency, track error rates, resolve incidents 6× faster, and never be surprised by an outage.</p>
      <div class="hero-actions">
        <a href="/trace-viewer" class="btn-p">View design →</a>
        <a href="/trace-mock" class="btn-s">Interactive mock ☀◑</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="glow g1"></div>
      <div class="glow g2"></div>
      <div class="phone">
        <div class="phone-inner">
          ${pen.screens[0].svg}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="stats">
  <div class="stats-inner">
    <div class="stats-label">KEY METRICS — LIVE</div>
    <div class="stats-grid">
      <div class="stat"><div class="stat-num g">99<span class="stat-unit">.97%</span></div><div class="stat-label">UPTIME · 90 DAYS</div></div>
      <div class="stat"><div class="stat-num b">142<span class="stat-unit">ms</span></div><div class="stat-label">P95 LATENCY</div></div>
      <div class="stat"><div class="stat-num w">8.4<span class="stat-unit">k/s</span></div><div class="stat-label">REQUESTS / SEC</div></div>
      <div class="stat"><div class="stat-num g">6.8<span class="stat-unit">min</span></div><div class="stat-label">MEAN TIME TO RESOLVE</div></div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="features-inner">
    <div class="features-hd">
      <h2 class="features-title">Built for<br><span>developer teams.</span></h2>
      <div class="features-sub">5 SCREENS · DARK MODE · REAL-TIME</div>
    </div>
    <div class="feat-grid">
      <div class="feat"><div class="feat-icon">◈</div><div class="feat-name">HEALTH OVERVIEW</div><p class="feat-desc">Uptime displayed as a Locomotive-style editorial number — 99.97% at 74px forces instant comprehension. Sparkline request charts fill remaining space with data density.</p><span class="feat-tag">SCREEN 1 · INSPIRED BY LOCOMOTIVE.CA</span></div>
      <div class="feat"><div class="feat-icon">⌥</div><div class="feat-name">ENDPOINT ANALYTICS</div><p class="feat-desc">Every endpoint with method badge, health progress bar, p50/p99 latency split, and RPS counter. Color-coded: green healthy, amber degraded, red failing.</p><span class="feat-tag">SCREEN 2</span></div>
      <div class="feat"><div class="feat-icon">⚡</div><div class="feat-name">INCIDENT TIMELINE</div><p class="feat-desc">MTTR and incident rate as editorial anchors. Incident cards with severity badges and live/resolved status. Ongoing incidents pulse with amber glow border.</p><span class="feat-tag">SCREEN 3</span></div>
      <div class="feat"><div class="feat-icon">≡</div><div class="feat-name">LIVE LOG STREAM</div><p class="feat-desc">Monospace log stream with alternating row backgrounds. Level badges (INFO/WARN/ERROR) with color-matched borders and timestamps.</p><span class="feat-tag">SCREEN 4</span></div>
      <div class="feat"><div class="feat-icon">◎</div><div class="feat-name">ALERT RULES</div><p class="feat-desc">Channel status, alert rule toggles, cooldown periods in monospace blue. Active rules show a progress bar at the bottom card edge.</p><span class="feat-tag">SCREEN 5</span></div>
      <div class="feat"><div class="feat-icon">▣</div><div class="feat-name">DARK PALETTE</div><p class="feat-desc">Deep #080B14 navy-black with #00FF88 electric green. Inspired by Evervault.com's precision security-tech SaaS aesthetic from Godly.website.</p><span class="feat-tag">INSPIRED BY EVERVAULT + GODLY.WEBSITE</span></div>
    </div>
  </div>
</section>

<section class="scns" id="screens">
  <div class="scns-inner">
    <div class="scns-lbl">DESIGN SCREENS</div>
    <h2 class="scns-title">5 screens, zero ambiguity.</h2>
    <div class="scns-grid">
      ${pen.screens.map(s => `
        <div class="scn-thumb">
          ${s.svg}
          <div class="scn-label">${s.label.toUpperCase()}</div>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<section class="cta">
  <div class="cta-lbl">READY TO EXPLORE</div>
  <h2 class="cta-title">View the full design.</h2>
  <p class="cta-sub">Browse all 5 screens in the interactive viewer or explore the mock with light/dark toggle.</p>
  <div class="cta-actions">
    <a href="/trace-viewer" class="btn-p">Open viewer →</a>
    <a href="/trace-mock" class="btn-s">Interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <div>TRACE — API OBSERVABILITY ENGINE · RAM DESIGN HEARTBEAT</div>
  <div style="display:flex;gap:20px"><a href="/trace-viewer">Viewer</a><a href="/trace-mock">Mock</a><a href="https://ram.zenbin.org">Gallery</a></div>
  <div>2026</div>
</footer>

</body>
</html>`;

// ── VIEWER HTML ────────────────────────────────────────────────────────────────
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>TRACE — Design Viewer</title>
<script>
// EMBEDDED_PEN_PLACEHOLDER
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${BG};font-family:Inter,system-ui,sans-serif;color:${TEXT};min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:2rem 1rem}
h1{font-size:clamp(20px,4vw,32px);font-weight:800;letter-spacing:-1px;margin-bottom:.4rem}
h1 span{color:${ACCENT}}
.sub{font-size:13px;color:${MUTED};margin-bottom:2rem}
.viewer-wrap{width:100%;max-width:420px}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1.5rem;justify-content:center}
.tab{padding:7px 16px;border-radius:20px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid ${BORDER};background:${SURFACE};color:${MUTED};transition:all .2s}
.tab.active{background:${ACCENT};color:${BG};border-color:${ACCENT};font-weight:700}
.display{width:390px;max-width:100%;border-radius:20px;overflow:hidden;border:1px solid ${BORDER};box-shadow:0 20px 60px rgba(0,0,0,0.6)}
.display svg{display:block;width:100%;height:auto}
.back{margin-top:2rem;font-size:12px;color:${MUTED}}
.back a{color:${ACCENT};text-decoration:none}
</style>
</head>
<body>
<h1><span>TRACE</span> — API Observability Engine</h1>
<p class="sub">5 Screens · Dark Mode · Developer Tool</p>
<div class="viewer-wrap">
  <div class="tabs" id="tabs"></div>
  <div class="display" id="display"></div>
</div>
<p class="back"><a href="https://ram.zenbin.org/trace">← Hero page</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/trace-mock">Interactive Mock ☀◑</a></p>
<script>
(function(){
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if(!pen){document.body.innerHTML+='<p style="color:${DANGER};margin-top:2rem">No pen data.</p>';return;}
  const screens = pen.screens||[];
  const tabs=document.getElementById('tabs'), display=document.getElementById('display');
  function show(i){
    display.innerHTML=screens[i].svg;
    document.querySelectorAll('.tab').forEach((t,j)=>t.classList.toggle('active',j===i));
  }
  screens.forEach((s,i)=>{
    const b=document.createElement('button');
    b.className='tab'+(i===0?' active':'');
    b.textContent=s.label;
    b.onclick=()=>show(i);
    tabs.appendChild(b);
  });
  show(0);
})();
</script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>\n// EMBEDDED_PEN_PLACEHOLDER\n</script>', injection);

// ── PUBLISH ────────────────────────────────────────────────────────────────────
async function run() {
  console.log('Publishing hero...');
  let r = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${r.status} → https://ram.zenbin.org/${SLUG}`);
  if (r.status >= 400) console.log('  Error:', r.body.slice(0,200));

  console.log('Publishing viewer...');
  r = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`  Viewer: ${r.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  if (r.status >= 400) console.log('  Error:', r.body.slice(0,200));
}

run().catch(console.error);
