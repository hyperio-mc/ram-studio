'use strict';
// sigma-publish.js — Full design discovery pipeline for SIGMA

const fs      = require('fs');
const path    = require('path');
const https   = require('https');

const SLUG    = 'sigma';
const APP     = 'SIGMA';
const TAGLINE = 'Pattern before failure.';
const ARCH    = 'devops-monitoring';
const PROMPT  = 'Design a dark AI production monitoring app inspired by neon.com\'s pure black + electric green terminal aesthetic. Infra dashboard for engineers.';

const C = {
  bg:       '#060708',
  surf:     '#0C0E14',
  surf2:    '#111520',
  green:    '#00E599',
  greenDim: 'rgba(0,229,153,0.12)',
  amber:    '#F59E0B',
  text:     '#E8EDF5',
  muted:    'rgba(232,237,245,0.5)',
  sub:      'rgba(232,237,245,0.3)',
  border:   'rgba(232,237,245,0.07)',
};

// ─── HTTP helpers ────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function publish(subdomain, slugPath, html, title) {
  const body = JSON.stringify({ html, title });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slugPath}`,
    method: 'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    subdomain,
    },
  }, body);
}

// ─── Hero page ───────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP} — ${TAGLINE}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${C.bg};--surf:${C.surf};--surf2:${C.surf2};
  --green:${C.green};--amber:${C.amber};
  --text:${C.text};--muted:${C.muted};--sub:${C.sub};
  --border:${C.border};
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

/* — NAV — */
nav{position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 40px;height:60px;
    background:rgba(6,7,8,0.85);backdrop-filter:blur(12px);
    border-bottom:1px solid var(--border)}
.logo{font-size:16px;font-weight:700;letter-spacing:.12em;color:var(--green)}
.nav-links{display:flex;gap:28px}
.nav-links a{color:var(--muted);text-decoration:none;font-size:13px;
             transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--green);color:#060708;border:none;
         padding:8px 20px;border-radius:20px;font-size:13px;
         font-weight:700;cursor:pointer;letter-spacing:.04em;
         transition:opacity .2s}
.nav-cta:hover{opacity:.85}

/* — HERO — */
.hero{min-height:100vh;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      text-align:center;padding:100px 24px 60px;position:relative;overflow:hidden}

/* Grid overlay */
.hero::before{content:'';position:absolute;inset:0;
  background-image:linear-gradient(var(--border) 1px,transparent 1px),
                   linear-gradient(90deg,var(--border) 1px,transparent 1px);
  background-size:40px 40px;opacity:.6}

/* Green glow */
.hero::after{content:'';position:absolute;top:20%;left:50%;
  transform:translateX(-50%);
  width:600px;height:300px;
  background:radial-gradient(ellipse,rgba(0,229,153,0.12) 0%,transparent 70%);
  pointer-events:none}

.hero-eyebrow{position:relative;display:inline-flex;align-items:center;gap:8px;
  background:var(--greenDim);border:1px solid rgba(0,229,153,0.25);
  border-radius:20px;padding:5px 14px;margin-bottom:28px;font-size:11px;
  font-weight:600;color:var(--green);letter-spacing:.08em}
.dot{width:6px;height:6px;background:var(--green);border-radius:50%;
     animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:.5;transform:scale(1.4)}}

.hero h1{position:relative;font-size:clamp(48px,8vw,96px);font-weight:800;
  line-height:1;letter-spacing:-.04em;margin-bottom:24px}
.hero h1 span{color:var(--green)}
.hero-sub{position:relative;max-width:520px;font-size:18px;line-height:1.6;
  color:var(--muted);margin-bottom:40px}
.hero-actions{position:relative;display:flex;gap:14px;flex-wrap:wrap;
  justify-content:center}
.btn-primary{background:var(--green);color:#060708;border:none;
  padding:14px 32px;border-radius:28px;font-size:15px;font-weight:700;
  cursor:pointer;letter-spacing:.03em;transition:opacity .2s,transform .2s}
.btn-primary:hover{opacity:.9;transform:translateY(-2px)}
.btn-secondary{background:transparent;color:var(--text);
  border:1px solid var(--border);padding:14px 32px;border-radius:28px;
  font-size:15px;font-weight:500;cursor:pointer;
  transition:border-color .2s,color .2s}
.btn-secondary:hover{border-color:rgba(0,229,153,0.4);color:var(--green)}

/* — METRICS TICKER — */
.ticker{position:relative;margin:60px 0;width:100%;overflow:hidden;
  border-top:1px solid var(--border);border-bottom:1px solid var(--border);
  padding:20px 0}
.ticker-inner{display:flex;gap:60px;animation:ticker 20s linear infinite;
  white-space:nowrap}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ticker-item{display:flex;align-items:center;gap:10px;flex-shrink:0}
.ticker-val{font-size:22px;font-weight:700;color:var(--green)}
.ticker-label{font-size:11px;color:var(--sub);letter-spacing:.06em}

/* — FEATURES — */
.features{max-width:1100px;margin:0 auto;padding:40px 24px 100px}
.section-label{text-align:center;font-size:11px;font-weight:600;
  color:var(--green);letter-spacing:.12em;margin-bottom:16px}
.section-title{text-align:center;font-size:clamp(28px,5vw,48px);font-weight:800;
  letter-spacing:-.03em;margin-bottom:60px;line-height:1.1}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2px}
.feat{background:var(--surf);padding:36px;border:1px solid var(--border);transition:border-color .2s}
.feat:first-child{border-radius:12px 0 0 0}
.feat:nth-child(3){border-radius:0 12px 0 0}
.feat:nth-child(4){border-radius:0 0 0 12px}
.feat:last-child{border-radius:0 0 12px 0}
.feat:hover{border-color:rgba(0,229,153,0.25)}
.feat-icon{font-size:28px;margin-bottom:16px}
.feat h3{font-size:16px;font-weight:700;margin-bottom:8px;letter-spacing:-.01em}
.feat p{font-size:13px;line-height:1.6;color:var(--muted)}
.feat-tag{display:inline-block;margin-top:12px;font-size:9px;font-weight:600;
  color:var(--green);letter-spacing:.08em;background:var(--greenDim);
  border-radius:4px;padding:2px 8px}

/* — TRACE DEMO — */
.trace-demo{max-width:900px;margin:0 auto 100px;padding:0 24px}
.demo-card{background:var(--surf);border:1px solid var(--border);
  border-radius:16px;padding:28px;overflow:hidden}
.demo-header{display:flex;align-items:center;justify-content:space-between;
  margin-bottom:20px}
.demo-header h3{font-size:13px;font-weight:600;color:var(--muted);letter-spacing:.06em}
.status-live{display:flex;align-items:center;gap:6px;font-size:11px;
  color:var(--green);font-weight:600}
.status-dot{width:6px;height:6px;background:var(--green);border-radius:50%;
  animation:pulse 1.5s infinite}
.trace-row{display:flex;align-items:center;gap:12px;padding:8px 0;
  border-bottom:1px solid var(--border)}
.trace-row:last-child{border-bottom:none}
.trace-name{font-size:11px;color:var(--muted);width:110px;flex-shrink:0}
.trace-bar-wrap{flex:1;height:10px;background:var(--surf2);border-radius:3px;
  overflow:hidden;position:relative}
.trace-bar{height:100%;border-radius:3px;position:absolute;top:0}
.trace-dur{font-size:10px;color:var(--sub);width:40px;text-align:right;flex-shrink:0}

/* — SLO SECTION — */
.slo-section{max-width:900px;margin:0 auto 100px;padding:0 24px;
  display:grid;grid-template-columns:1fr 1fr;gap:20px}
.slo-card{background:var(--surf);border:1px solid var(--border);
  border-radius:16px;padding:28px}
.slo-label{font-size:11px;color:var(--muted);letter-spacing:.06em;margin-bottom:8px}
.slo-val{font-size:36px;font-weight:800;color:var(--green);letter-spacing:-.03em}
.slo-sub{font-size:11px;color:var(--sub);margin-top:4px}
.slo-bar{height:6px;background:var(--surf2);border-radius:3px;
  margin-top:16px;overflow:hidden}
.slo-fill{height:100%;border-radius:3px;background:var(--green)}

/* — CTA — */
.cta-section{text-align:center;padding:80px 24px 100px;
  background:linear-gradient(to bottom,transparent,rgba(0,229,153,0.04))}
.cta-section h2{font-size:clamp(32px,5vw,56px);font-weight:800;
  letter-spacing:-.03em;margin-bottom:16px}
.cta-section p{font-size:16px;color:var(--muted);margin-bottom:36px}

/* — FOOTER — */
footer{border-top:1px solid var(--border);padding:32px 40px;
  display:flex;align-items:center;justify-content:space-between;
  font-size:12px;color:var(--sub)}
</style>
</head>
<body>
<nav>
  <div class="logo">Σ SIGMA</div>
  <div class="nav-links">
    <a href="#">Monitor</a>
    <a href="#">Traces</a>
    <a href="#">Alerts</a>
    <a href="#">Pricing</a>
  </a>
  </div>
  <button class="nav-cta">Start free</button>
</nav>

<section class="hero">
  <div class="hero-eyebrow">
    <span class="dot"></span>
    PRODUCTION INTELLIGENCE
  </div>
  <h1>Pattern before<br><span>failure.</span></h1>
  <p class="hero-sub">SIGMA watches your production systems so you catch anomalies at first signal — not after your on-call wakes up.</p>
  <div class="hero-actions">
    <a href="/sigma-mock"><button class="btn-primary">View Interactive Mock</button></a>
    <a href="/sigma-viewer"><button class="btn-secondary">Open Prototype</button></a>
  </div>
</section>

<div class="ticker">
  <div class="ticker-inner">
    ${[
      ['99.99%','SLO Maintained'],['<2ms','Cache p50'],['4.2K/s','API Throughput'],
      ['0.02%','Error Rate'],['340+','Active Traces'],['12','Services Monitored'],
      ['99.99%','SLO Maintained'],['<2ms','Cache p50'],['4.2K/s','API Throughput'],
      ['0.02%','Error Rate'],['340+','Active Traces'],['12','Services Monitored'],
    ].map(([v,l]) => `<div class="ticker-item"><span class="ticker-val">${v}</span><span class="ticker-label">${l}</span></div>`).join('')}
  </div>
</div>

<section class="features">
  <div class="section-label">WHAT SIGMA DOES</div>
  <h2 class="section-title">Observability without<br>the noise.</h2>
  <div class="feat-grid">
    <div class="feat">
      <div class="feat-icon">◈</div>
      <h3>Live Monitor</h3>
      <p>Real-time service health grid with SLO burn rate tracking. Know your error budget before it's gone.</p>
      <span class="feat-tag">REAL-TIME</span>
    </div>
    <div class="feat">
      <div class="feat-icon">⌥</div>
      <h3>Distributed Traces</h3>
      <p>Waterfall visualisation of every request across your stack. Spot slow spans before they cascade.</p>
      <span class="feat-tag">AI FILTERED</span>
    </div>
    <div class="feat">
      <div class="feat-icon">◉</div>
      <h3>Smart Alerts</h3>
      <p>P1–P4 alerting with one-click acknowledgement. Signal severity is determined by ML, not thresholds.</p>
      <span class="feat-tag">ML POWERED</span>
    </div>
    <div class="feat">
      <div class="feat-icon">▸</div>
      <h3>Deploy Tracking</h3>
      <p>Every deployment linked to its error rate impact. Roll back with confidence, ship with data.</p>
      <span class="feat-tag">GIT-LINKED</span>
    </div>
  </div>
</section>

<section class="trace-demo">
  <div class="demo-card">
    <div class="demo-header">
      <h3>DISTRIBUTED TRACE · trc_8f3a2b</h3>
      <div class="status-live"><span class="status-dot"></span> LIVE</div>
    </div>
    ${[
      ['api-gateway', 0, 100, '#00E599', '342ms'],
      ['auth.verify',  5,  18, '#00E599',  '18ms'],
      ['queue.push',  28,  85, '#F59E0B', '290ms'],
      ['db.insert',   97,   3, '#00E599',  '10ms'],
    ].map(([name, start, width, color, dur]) => `
    <div class="trace-row">
      <span class="trace-name">${name}</span>
      <div class="trace-bar-wrap">
        <div class="trace-bar" style="left:${start}%;width:${width}%;background:${color};opacity:0.8"></div>
      </div>
      <span class="trace-dur">${dur}</span>
    </div>`).join('')}
  </div>
</section>

<section class="slo-section">
  <div class="slo-card">
    <div class="slo-label">30-DAY SLO</div>
    <div class="slo-val">99.94%</div>
    <div class="slo-sub">Error budget: 62% remaining</div>
    <div class="slo-bar"><div class="slo-fill" style="width:99.94%"></div></div>
  </div>
  <div class="slo-card">
    <div class="slo-label">MEAN TIME TO DETECT</div>
    <div class="slo-val">1.8m</div>
    <div class="slo-sub">Industry avg: 14.3 min</div>
    <div class="slo-bar"><div class="slo-fill" style="width:14%"></div></div>
  </div>
  <div class="slo-card">
    <div class="slo-label">ACTIVE INCIDENTS</div>
    <div class="slo-val" style="color:#F59E0B">2</div>
    <div class="slo-sub">P2 · Queue latency · 23m</div>
    <div class="slo-bar"><div class="slo-fill" style="width:100%;background:#F59E0B"></div></div>
  </div>
  <div class="slo-card">
    <div class="slo-label">DEPLOYS TODAY</div>
    <div class="slo-val">4</div>
    <div class="slo-sub">Last: v2.14.0 · 14m ago</div>
    <div class="slo-bar"><div class="slo-fill" style="width:60%"></div></div>
  </div>
</section>

<section class="cta-section">
  <h2>Ship faster.<br>Sleep better.</h2>
  <p>Join 2,400+ engineering teams monitoring production with SIGMA.</p>
  <a href="/sigma-mock"><button class="btn-primary" style="font-size:16px;padding:16px 40px">Try the interactive mock</button></a>
</section>

<footer>
  <span>Σ SIGMA — AI Production Monitoring</span>
  <span>Design by RAM · ram.zenbin.org/${SLUG}</span>
</footer>
</body>
</html>`;
}

// ─── Viewer page ─────────────────────────────────────────────────────────────
function buildViewer() {
  const penJson = fs.readFileSync(path.join(__dirname, 'sigma.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP} — Prototype Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#060708;display:flex;flex-direction:column;align-items:center;
     justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;
     color:#E8EDF5}
.header{position:fixed;top:0;left:0;right:0;z-index:10;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 24px;height:52px;
  background:rgba(6,7,8,0.9);backdrop-filter:blur(8px);
  border-bottom:1px solid rgba(232,237,245,0.07)}
.logo{font-size:13px;font-weight:700;letter-spacing:.1em;color:#00E599}
.back{font-size:12px;color:rgba(232,237,245,0.5);text-decoration:none}
.back:hover{color:#00E599}
.viewer{margin-top:52px;padding:40px 24px;display:flex;
  flex-direction:column;align-items:center;gap:12px}
.screens-wrap{display:flex;gap:24px;flex-wrap:wrap;justify-content:center}
.screen-frame{border-radius:20px;overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(232,237,245,0.07);
  position:relative}
.screen-label{text-align:center;font-size:10px;color:rgba(232,237,245,0.4);
  letter-spacing:.06em;margin-top:8px}
canvas,img{display:block}
</style>
</head>
<body>
<div class="header">
  <span class="logo">Σ SIGMA</span>
  <a class="back" href="/${SLUG}">← Hero page</a>
</div>
<div class="viewer">
  <div id="screens-container" class="screens-wrap"></div>
</div>
<script>
(function renderPen() {
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if (!pen) { document.getElementById('screens-container').textContent = 'No pen data.'; return; }

  const container = document.getElementById('screens-container');
  const scale = 0.55;

  pen.screens.forEach(screen => {
    const wrap = document.createElement('div');
    const W = screen.frame.width, H = screen.frame.height;
    const canvas = document.createElement('canvas');
    canvas.width  = W * scale;
    canvas.height = H * scale;
    canvas.style.borderRadius = '20px';
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    function parseColor(c) {
      if (!c || c === 'transparent') return null;
      return c;
    }

    function drawLayer(layer) {
      const f = layer.frame;
      if (!f) return;
      ctx.save();
      ctx.translate(f.x || 0, f.y || 0);
      const r = layer.cornerRadius || 0;

      if (layer.type === 'rectangle' && layer.fills?.length) {
        const fill = layer.fills[0];
        const color = parseColor(fill.color);
        if (color) {
          ctx.fillStyle = color;
          if (r > 0) {
            ctx.beginPath();
            ctx.roundRect(0, 0, f.width, f.height, r);
            ctx.fill();
          } else {
            ctx.fillRect(0, 0, f.width, f.height);
          }
        }
      }

      if (layer.type === 'text') {
        const color = parseColor(layer.color);
        if (color) {
          ctx.fillStyle = color;
          const fw = layer.fontWeight || '400';
          ctx.font = \`\${fw} \${layer.fontSize || 12}px Inter,system-ui,sans-serif\`;
          ctx.textAlign = layer.textAlign || 'left';
          const x = layer.textAlign === 'center' ? f.width/2 : layer.textAlign === 'right' ? f.width : 0;
          const y = layer.verticalAlign === 'middle' ? f.height/2 + (layer.fontSize || 12) * 0.35
                  : (layer.fontSize || 12) * 0.85;
          // Clip text
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, f.width, f.height);
          ctx.clip();
          ctx.fillText(layer.content || '', x, y);
          ctx.restore();
        }
      }

      if (layer.type === 'group' && layer.children) {
        layer.children.forEach(drawLayer);
      }
      ctx.restore();
    }

    screen.children.forEach(drawLayer);

    const label = document.createElement('div');
    label.className = 'screen-label';
    label.textContent = screen.name;

    const frame = document.createElement('div');
    frame.className = 'screen-frame';
    frame.appendChild(canvas);
    wrap.appendChild(frame);
    wrap.appendChild(label);
    container.appendChild(wrap);
  });
})();
</script>
</body>
</html>`;

  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing SIGMA design pipeline...\n');

  // 1. Hero page
  console.log('1/4  Hero page...');
  const heroHtml = buildHero();
  const heroRes  = await publish('ram', SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`     → ${heroRes.status} https://ram.zenbin.org/${SLUG}`);

  // 2. Viewer
  console.log('2/4  Viewer...');
  const viewerHtml = buildViewer();
  const viewRes    = await publish('ram', `${SLUG}-viewer`, viewerHtml, `${APP} — Prototype Viewer`);
  console.log(`     → ${viewRes.status} https://ram.zenbin.org/${SLUG}-viewer`);

  // 3. Gallery queue
  console.log('3/4  Gallery queue...');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN  = config.GITHUB_TOKEN;
  const REPO   = config.GITHUB_REPO;

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

  const getRes  = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const sha      = fileData.sha;
  let queue      = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const entry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP,
    tagline:      TAGLINE,
    archetype:    ARCH,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat',
  };
  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({ message: `add: ${APP} to gallery (heartbeat)`, content: newContent, sha });
  const putRes     = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);
  console.log(`     → ${putRes.status === 200 ? 'OK' : putRes.body.slice(0, 80)}`);

  // Save entry for DB step
  fs.writeFileSync(path.join(__dirname, 'sigma-entry.json'), JSON.stringify(entry, null, 2));
  console.log(`\n✓ Done.\n  Hero:   https://ram.zenbin.org/${SLUG}\n  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
