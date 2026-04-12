'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'herd';
const HOST      = 'zenbin.org';
const APP_NAME  = 'HERD';
const TAGLINE   = 'Multi-Agent Orchestration OS';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const req = https.request({
      hostname: HOST, port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
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

const penJson = fs.readFileSync(path.join(__dirname, 'herd.pen'), 'utf8');
const pen = JSON.parse(penJson);

// ── HERO PAGE ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>HERD — Multi-Agent Orchestration OS</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#09080E;
  --surface:#110F1A;
  --surface2:#1A1728;
  --border:#2A2640;
  --text:#E4E0F5;
  --muted:#6B6585;
  --accent:#7B5CFF;
  --accent2:#3DBAFF;
  --accent3:#FF5CA8;
  --green:#4DFFA3;
  --amber:#FFB84D;
}
html{scroll-behavior:smooth;background:var(--bg)}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}

/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%, rgba(123,92,255,0.18) 0%, transparent 70%);pointer-events:none}
.hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 50% 40% at 80% 70%, rgba(61,186,255,0.1) 0%, transparent 60%);pointer-events:none}

/* Grid bg dots */
.grid-bg{position:absolute;inset:0;background-image:radial-gradient(circle, rgba(123,92,255,0.15) 1px, transparent 1px);background-size:40px 40px;pointer-events:none;opacity:0.5}

.eyebrow{font-size:11px;letter-spacing:3px;color:var(--muted);font-family:'SF Mono','Fira Code',monospace;text-transform:uppercase;margin-bottom:1.5rem;padding:6px 16px;border:1px solid var(--border);border-radius:20px;display:inline-block}
.hero-title{font-size:clamp(60px,12vw,96px);font-weight:900;line-height:0.95;letter-spacing:-3px;margin-bottom:1.5rem;position:relative}
.hero-title .word-herd{background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-title .word-os{color:var(--text);-webkit-text-fill-color:var(--text)}
.hero-sub{font-size:18px;color:var(--muted);max-width:520px;line-height:1.6;margin-bottom:2.5rem}
.hero-sub strong{color:var(--accent2);font-weight:500}

.cta-row{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:4rem}
.btn-primary{padding:14px 32px;background:var(--accent);color:#fff;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .2s}
.btn-primary:hover{background:#8B6DFF;transform:translateY(-1px);box-shadow:0 8px 30px rgba(123,92,255,0.35)}
.btn-ghost{padding:14px 32px;border:1px solid var(--border);color:var(--text);border-radius:12px;font-size:15px;font-weight:500;text-decoration:none;transition:all .2s}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}

/* Stat strip */
.stat-strip{display:flex;gap:0;border:1px solid var(--border);border-radius:16px;overflow:hidden;background:var(--surface);margin-bottom:5rem;max-width:540px;width:100%}
.stat-item{flex:1;padding:18px 24px;text-align:center;border-right:1px solid var(--border)}
.stat-item:last-child{border-right:none}
.stat-val{font-size:28px;font-weight:800;margin-bottom:4px}
.stat-val.green{color:var(--green)}
.stat-val.violet{color:var(--accent)}
.stat-val.cyan{color:var(--accent2)}
.stat-label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px}

/* Screens showcase */
.showcase{padding:5rem 2rem;max-width:1200px;margin:0 auto}
.section-label{font-size:11px;letter-spacing:3px;color:var(--muted);font-family:'SF Mono',monospace;text-transform:uppercase;margin-bottom:1rem}
.section-title{font-size:clamp(32px,5vw,52px);font-weight:800;letter-spacing:-1.5px;margin-bottom:1rem;line-height:1.1}
.section-sub{font-size:16px;color:var(--muted);max-width:480px;line-height:1.6;margin-bottom:3rem}

.screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.screen-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:1.5rem;transition:all .3s;cursor:pointer;position:relative;overflow:hidden}
.screen-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent2));opacity:0;transition:.3s}
.screen-card:hover{border-color:var(--accent);transform:translateY(-4px);box-shadow:0 20px 60px rgba(123,92,255,0.15)}
.screen-card:hover::before{opacity:1}
.screen-num{font-size:11px;color:var(--muted);font-family:monospace;margin-bottom:.75rem;letter-spacing:1px}
.screen-name{font-size:18px;font-weight:700;margin-bottom:.5rem;color:var(--text)}
.screen-desc{font-size:13px;color:var(--muted);line-height:1.5}
.screen-tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;margin-top:.75rem;font-family:monospace;letter-spacing:.5px}

/* Feature section */
.features{padding:5rem 2rem;background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.features-inner{max-width:1200px;margin:0 auto}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;margin-top:3rem}
.feat-card{padding:2rem;background:var(--bg);border:1px solid var(--border);border-radius:16px;transition:all .3s}
.feat-card:hover{border-color:var(--accent);box-shadow:0 0 40px rgba(123,92,255,0.08)}
.feat-icon{font-size:28px;margin-bottom:1rem}
.feat-title{font-size:17px;font-weight:700;margin-bottom:.5rem;color:var(--text)}
.feat-desc{font-size:14px;color:var(--muted);line-height:1.6}

/* Terminal block */
.terminal-section{padding:5rem 2rem;max-width:1200px;margin:0 auto}
.terminal{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.term-header{padding:12px 18px;display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--border)}
.term-dot{width:12px;height:12px;border-radius:50%}
.term-body{padding:1.5rem 2rem;font-family:'SF Mono','Fira Code',Consolas,monospace;font-size:13.5px;line-height:2}
.term-prompt{color:var(--muted)}
.term-cmd{color:var(--accent2)}
.term-out{color:var(--green)}
.term-out.muted{color:var(--muted)}

/* Viewer CTA */
.viewer-cta{text-align:center;padding:6rem 2rem;position:relative;overflow:hidden}
.viewer-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(123,92,255,0.12) 0%,transparent 70%);pointer-events:none}
.big-link{display:inline-flex;align-items:center;gap:1rem;padding:18px 40px;background:linear-gradient(135deg,var(--accent),var(--accent2));border-radius:16px;font-size:18px;font-weight:700;color:#fff;text-decoration:none;transition:all .3s;margin-top:2rem;box-shadow:0 10px 50px rgba(123,92,255,0.25)}
.big-link:hover{transform:translateY(-2px);box-shadow:0 16px 60px rgba(123,92,255,0.4)}

/* Footer */
footer{padding:2rem;text-align:center;border-top:1px solid var(--border);color:var(--muted);font-size:13px}
footer a{color:var(--muted);text-decoration:none}
footer a:hover{color:var(--accent)}

/* Live badge */
.live-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border:1px solid rgba(77,255,163,0.3);border-radius:20px;font-size:11px;color:var(--green);margin-bottom:1.5rem;font-family:monospace}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(0.8)}}

/* Responsive */
@media(max-width:600px){
  .stat-strip{flex-wrap:wrap}
  .stat-item{flex:0 0 50%;border-right:none;border-bottom:1px solid var(--border)}
  .stat-item:last-child{border-bottom:none}
  .cta-row{flex-direction:column;align-items:center}
}
</style>
</head>
<body>
<div class="grid-bg"></div>

<!-- HERO -->
<section class="hero">
  <div class="live-badge"><span class="live-dot"></span>18 agents running</div>
  <div class="eyebrow">Agent Orchestration OS · v1.4.2</div>
  <h1 class="hero-title">
    <span class="word-herd">HERD</span><br>
    <span class="word-os">your agents</span>
  </h1>
  <p class="hero-sub">The mobile OS for wrangling autonomous AI agents. <strong>Build flows</strong>, watch them run, catch them when they drift — all from one commanding dark interface.</p>

  <div class="cta-row">
    <a href="https://ram.zenbin.org/herd-viewer" class="btn-primary">View Prototype →</a>
    <a href="https://ram.zenbin.org/herd-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>

  <div class="stat-strip">
    <div class="stat-item">
      <div class="stat-val green">1,847</div>
      <div class="stat-label">Tasks / day</div>
    </div>
    <div class="stat-item">
      <div class="stat-val violet">25</div>
      <div class="stat-label">Agents Live</div>
    </div>
    <div class="stat-item">
      <div class="stat-val cyan">4.2s</div>
      <div class="stat-label">Avg Latency</div>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section class="showcase">
  <div class="section-label">5 Screens</div>
  <h2 class="section-title">Every layer of<br>agent control.</h2>
  <p class="section-sub">From high-level fleet overview to real-time event logs — built for operators who don't blink.</p>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => {
      const descs = [
        'Fleet ring, active agent cards, pipeline progress at a glance.',
        'Roster view with status badges, uptime, and task counts.',
        'Visual flow builder — connect agents into pipelines with drag-and-drop.',
        'Live event stream with timestamps, agent source, and severity tags.',
        'Throughput sparkline, latency, cost, and top performer table.',
      ];
      const tags = ['overview','roster','pipeline','realtime','analytics'];
      const tagCols = ['#7B5CFF','#4DFFA3','#3DBAFF','#FFB84D','#FF5CA8'];
      return `
      <div class="screen-card">
        <div class="screen-num">0${i+1} / 05</div>
        <div class="screen-name">${s.name}</div>
        <div class="screen-desc">${descs[i]}</div>
        <span class="screen-tag" style="background:${tagCols[i]}22;color:${tagCols[i]}">${tags[i]}</span>
      </div>`;
    }).join('')}
  </div>
</section>

<!-- FEATURES -->
<section class="features">
  <div class="features-inner">
    <div class="section-label">Capabilities</div>
    <h2 class="section-title">Built for the agent era.</h2>
    <div class="features-grid">
      <div class="feat-card">
        <div class="feat-icon">⚡</div>
        <div class="feat-title">Real-time Event Stream</div>
        <div class="feat-desc">Live activity log with monospace timestamps, per-agent source tags, and color-coded severity. Never miss a timeout or retry.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon">🕸️</div>
        <div class="feat-title">Visual Flow Builder</div>
        <div class="feat-desc">Connect agents into pipelines on a dot-grid canvas. Trigger conditions, branching logic, and agent assignment in one view.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon">🔭</div>
        <div class="feat-title">Fleet Command</div>
        <div class="feat-desc">Animated status ring shows fleet health at a glance. Drill into any running agent with one tap.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon">📡</div>
        <div class="feat-title">Pulse Analytics</div>
        <div class="feat-desc">Throughput sparklines, cost per run, error rates, and top performer rankings — all scoped to the last 24 hours.</div>
      </div>
    </div>
  </div>
</section>

<!-- TERMINAL DEMO -->
<section class="terminal-section">
  <div class="section-label">Under the Hood</div>
  <h2 class="section-title" style="margin-bottom:2rem">Terminal-first.<br>UI-optional.</h2>
  <div class="terminal">
    <div class="term-header">
      <div class="term-dot" style="background:#FF5CA8"></div>
      <div class="term-dot" style="background:#FFB84D"></div>
      <div class="term-dot" style="background:#4DFFA3"></div>
      <span style="font-size:12px;color:#6B6585;font-family:monospace;margin-left:8px">herd-cli v1.4.2</span>
    </div>
    <div class="term-body">
      <div><span class="term-prompt">~ </span><span class="term-cmd">herd fleet status</span></div>
      <div class="term-out">✓ Fleet: 18/25 running · 5 idle · 2 error</div>
      <div class="term-out muted">  scout-01    RUNNING  task:scrape_catalog_batch_47</div>
      <div class="term-out muted">  writer-03   RUNNING  task:draft_email_user_8821</div>
      <div class="term-out muted">  outbox-04   ERROR    smtp_timeout (retry 2/3)</div>
      <div style="margin-top:.5rem"><span class="term-prompt">~ </span><span class="term-cmd">herd pipeline run onboarding --watch</span></div>
      <div class="term-out">⚡ Trigger fired · webhook:new_lead · id:lead_9941</div>
      <div class="term-out">→ scout-01 assigned · research phase</div>
      <div class="term-out muted">  47 records scraped in 3.2s</div>
      <div class="term-out">→ router-01 dispatching to writer-03, verify-02</div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="viewer-cta">
  <div class="section-label">Open Design</div>
  <h2 class="section-title">See every screen.</h2>
  <p class="hero-sub" style="margin:1rem auto 0">5 mobile screens. Dark terminal meets ambient glow.</p>
  <a href="https://ram.zenbin.org/herd-viewer" class="big-link">Open Pencil Viewer →</a>
</section>

<footer>
  <p>HERD — Multi-Agent Orchestration OS &nbsp;·&nbsp; Design by <a href="https://ram.zenbin.org">RAM</a> &nbsp;·&nbsp; Inspired by herding.app &amp; Lapa.ninja agent trends &nbsp;·&nbsp; <a href="https://ram.zenbin.org/herd-mock">Interactive Mock →</a></p>
</footer>
</body>
</html>`;

// ── VIEWER PAGE ────────────────────────────────────────────────────────────
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>HERD — Pencil Viewer</title>
<script>
// EMBEDDED_PEN_PLACEHOLDER
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#09080E;font-family:Inter,system-ui,sans-serif;color:#E4E0F5;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:2rem 1rem}
h1{font-size:clamp(22px,4vw,36px);font-weight:800;letter-spacing:-1px;margin-bottom:.5rem}
h1 span{background:linear-gradient(135deg,#7B5CFF,#3DBAFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{font-size:14px;color:#6B6585;margin-bottom:2rem}
.viewer-wrap{width:100%;max-width:420px}
.screen-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1.5rem;justify-content:center}
.tab{padding:7px 16px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid #2A2640;background:#110F1A;color:#6B6585;transition:all .2s}
.tab.active{background:#7B5CFF;color:#fff;border-color:#7B5CFF}
.screen-display{width:390px;max-width:100%;border-radius:20px;overflow:hidden;border:1px solid #2A2640;box-shadow:0 20px 60px rgba(0,0,0,0.5)}
.screen-display svg{display:block;width:100%;height:auto}
.back-link{margin-top:2rem;font-size:13px;color:#6B6585}
.back-link a{color:#7B5CFF;text-decoration:none}
</style>
</head>
<body>
<h1><span>HERD</span> — Agent OS</h1>
<p class="sub">Multi-Agent Orchestration · 5 Screens · Dark Mode</p>
<div class="viewer-wrap">
  <div class="screen-tabs" id="tabs"></div>
  <div class="screen-display" id="display"></div>
</div>
<p class="back-link"><a href="https://ram.zenbin.org/herd">← Hero Page</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/herd-mock">Interactive Mock ☀◑</a></p>
<script>
(function(){
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if(!pen){document.body.innerHTML+='<p style="color:#FF5CA8;margin-top:2rem">No pen data found.</p>';return;}
  const screens = pen.screens || [];
  const tabs = document.getElementById('tabs');
  const display = document.getElementById('display');
  let current = 0;
  function show(i){
    current = i;
    display.innerHTML = screens[i].svg;
    document.querySelectorAll('.tab').forEach((t,j)=>t.classList.toggle('active',j===i));
  }
  screens.forEach((s,i)=>{
    const btn = document.createElement('button');
    btn.className='tab'+(i===0?' active':'');
    btn.textContent=s.name;
    btn.onclick=()=>show(i);
    tabs.appendChild(btn);
  });
  show(0);
})();
</script>
</body>
</html>`;

// Inject embedded pen
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>\n// EMBEDDED_PEN_PLACEHOLDER\n</script>', injection);

// ── PUBLISH ────────────────────────────────────────────────────────────────
async function run() {
  console.log('Publishing hero page...');
  let r = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${r.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  r = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pencil Viewer`);
  console.log(`  Viewer: ${r.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
