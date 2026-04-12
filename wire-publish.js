// wire-publish.js — publish Wire hero page + viewer to ram.zenbin.org
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'wire';
const APP_NAME = 'Wire';
const TAGLINE = 'Wire your agents, automate your ops';
const SUBDOMAIN = 'ram';

function deploy(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': SUBDOMAIN,
        'X-Slug': slug,
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ raw: d, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero page ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wire — AI Workflow Orchestration</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#F7F4EE;--surface:#fff;--text:#1A1918;--text2:#6B6560;
    --accent:#00C97A;--accent2:#7B5CF6;--border:#E5E0D6;
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.5}
  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 40px;border-bottom:1px solid var(--border);background:var(--surface)}
  .logo{font-size:18px;font-weight:800;letter-spacing:-0.5px}
  .logo span{color:var(--accent)}
  nav a{text-decoration:none;color:var(--text2);font-size:14px;margin-left:24px}
  .cta-btn{background:var(--text);color:var(--bg);border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
  .hero{max-width:900px;margin:0 auto;padding:80px 40px 60px;text-align:center}
  .badge{display:inline-flex;align-items:center;gap:6px;background:#E6FAF1;color:#008F52;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:28px}
  .badge .dot{width:7px;height:7px;border-radius:50%;background:#00C97A;animation:pulse 1.8s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  h1{font-size:clamp(36px,6vw,64px);font-weight:800;letter-spacing:-2px;line-height:1.08;margin-bottom:24px}
  h1 em{font-style:normal;color:var(--accent)}
  .sub{font-size:18px;color:var(--text2);max-width:520px;margin:0 auto 40px}
  .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
  .btn-primary{background:var(--text);color:var(--bg);padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none}
  .btn-secondary{background:var(--surface);color:var(--text);border:1px solid var(--border);padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none}
  .screens-strip{display:flex;gap:16px;overflow-x:auto;padding:0 40px;max-width:1100px;margin:0 auto 80px;scrollbar-width:none}
  .screens-strip::-webkit-scrollbar{display:none}
  .screen-card{flex:0 0 220px;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
  .screen-card .label{font-size:11px;color:var(--text2);font-weight:600;padding:10px 14px;border-bottom:1px solid var(--border)}
  .screen-preview{height:140px;background:var(--bg);padding:12px;display:flex;flex-direction:column;gap:6px}
  .mock-bar{height:8px;border-radius:4px;background:var(--border)}
  .mock-bar.accent{background:var(--accent);width:40%}
  .mock-bar.w60{width:60%}
  .mock-bar.w80{width:80%}
  .mock-card{background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:8px;display:flex;gap:6px;align-items:center}
  .mock-dot{width:8px;height:8px;border-radius:50%}
  .mock-dot.g{background:var(--accent)}
  .mock-dot.r{background:#E5484D}
  .mock-dot.gr{background:#C0BAB0}
  .mock-lines{flex:1;display:flex;flex-direction:column;gap:3px}
  .mock-line{height:5px;border-radius:2px;background:var(--border)}
  .mock-line.s{width:55%}
  .features{max-width:900px;margin:0 auto 80px;padding:0 40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
  .feat{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px}
  .feat-icon{font-size:24px;margin-bottom:12px}
  .feat h3{font-size:15px;font-weight:700;margin-bottom:6px}
  .feat p{font-size:13px;color:var(--text2);line-height:1.6}
  .palette-row{display:flex;gap:10px;justify-content:center;margin-bottom:80px}
  .swatch{width:44px;height:44px;border-radius:8px;border:1px solid var(--border)}
  footer{border-top:1px solid var(--border);padding:24px 40px;text-align:center;font-size:12px;color:var(--text2)}
  .view-btn{display:inline-block;margin-top:8px;background:var(--accent);color:#000;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none}
</style>
</head>
<body>
<nav>
  <div class="logo">W<span>i</span>re</div>
  <div>
    <a href="#">Docs</a>
    <a href="#">Pricing</a>
    <a href="${SLUG}-viewer">View Design</a>
    <a href="${SLUG}-mock" style="margin-left:24px"><button class="cta-btn">Live Mock →</button></a>
  </div>
</nav>

<div class="hero">
  <div class="badge"><span class="dot"></span> Design Exploration — April 2026</div>
  <h1>Wire your <em>agents</em>,<br>automate your ops</h1>
  <p class="sub">An AI workflow orchestration platform built for engineering teams who run agents at scale.</p>
  <div class="btns">
    <a class="btn-primary" href="${SLUG}-mock">Interactive Mock ☀◑</a>
    <a class="btn-secondary" href="${SLUG}-viewer">View in Pencil Viewer →</a>
  </div>
</div>

<div class="screens-strip">
  ${['Flows','Agents','Run Log','Analytics','Config'].map(s => `
  <div class="screen-card">
    <div class="label">${s}</div>
    <div class="screen-preview">
      <div class="mock-bar w80"></div>
      <div class="mock-bar w60"></div>
      <div class="mock-card">
        <div class="mock-dot g"></div>
        <div class="mock-lines"><div class="mock-line"></div><div class="mock-line s"></div></div>
      </div>
      <div class="mock-card">
        <div class="mock-dot gr"></div>
        <div class="mock-lines"><div class="mock-line"></div><div class="mock-line s"></div></div>
      </div>
      <div class="mock-card">
        <div class="mock-dot r"></div>
        <div class="mock-lines"><div class="mock-line"></div><div class="mock-line s"></div></div>
      </div>
    </div>
  </div>`).join('')}
</div>

<div class="features">
  <div class="feat">
    <div class="feat-icon">⚡</div>
    <h3>Multi-agent Flows</h3>
    <p>Chain Classifier → Router → Generator → QA agents into reliable pipelines with live status tracking.</p>
  </div>
  <div class="feat">
    <div class="feat-icon">▶</div>
    <h3>Live Run Log</h3>
    <p>Terminal-style execution feed with per-agent output, latency, and inline error diagnostics.</p>
  </div>
  <div class="feat">
    <div class="feat-icon">◉</div>
    <h3>Analytics Dashboard</h3>
    <p>7-day run volume charts, success rates, and per-agent latency breakdowns at a glance.</p>
  </div>
  <div class="feat">
    <div class="feat-icon">◈</div>
    <h3>Agent Roster</h3>
    <p>Monitor uptime, queue depth, and model assignment across all agents in your workspace.</p>
  </div>
</div>

<div style="text-align:center;margin-bottom:40px">
  <p style="font-size:13px;color:var(--text2);margin-bottom:16px;font-weight:600;letter-spacing:0.05em">PALETTE</p>
  <div class="palette-row">
    <div class="swatch" style="background:#F7F4EE" title="#F7F4EE Warm Cream"></div>
    <div class="swatch" style="background:#FFFFFF" title="#FFFFFF Surface"></div>
    <div class="swatch" style="background:#1A1918" title="#1A1918 Near-Black"></div>
    <div class="swatch" style="background:#00C97A" title="#00C97A Agent Green"></div>
    <div class="swatch" style="background:#7B5CF6" title="#7B5CF6 Violet"></div>
    <div class="swatch" style="background:#E5E0D6" title="#E5E0D6 Border"></div>
  </div>
</div>

<footer>
  <p>Wire — RAM Design Heartbeat · April 4, 2026</p>
  <p style="margin-top:4px">Inspired by Neon.com (agent-green, code-adjacent UX) + Midday.ai (editorial warmth)</p>
  <a class="view-btn" href="${SLUG}-mock">Open Interactive Mock →</a>
</footer>
</body>
</html>`;

// ── Viewer page ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'wire.pen'), 'utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wire — Pencil Viewer</title>
<script>
// EMBEDDED_PEN_PLACEHOLDER
</script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#E8E4DA;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;min-height:100vh}
  header{width:100%;background:#fff;border-bottom:1px solid #E5E0D6;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
  .logo{font-size:16px;font-weight:800}
  .logo span{color:#00C97A}
  header a{font-size:13px;color:#6B6560;text-decoration:none;font-weight:600}
  .canvas-wrap{flex:1;overflow:auto;padding:40px;display:flex;gap:20px;align-items:flex-start;justify-content:center}
  .screen-frame{background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.1);flex-shrink:0}
  .screen-label{font-size:11px;font-weight:700;color:#6B6560;text-align:center;padding:8px 0;letter-spacing:0.06em;background:#F7F4EE;border-bottom:1px solid #E5E0D6}
  canvas{display:block}
  .fallback{width:390px;height:844px;background:#F7F4EE;display:flex;flex-direction:column;gap:8px;padding:24px}
  .fb-bar{height:10px;border-radius:5px;background:#E5E0D6}
  .fb-bar.a{background:#00C97A;width:45%}
  .fb-card{background:#fff;border:1px solid #E5E0D6;border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:6px}
  #loading{position:fixed;inset:0;background:#F7F4EE;display:flex;align-items:center;justify-content:center;font-size:14px;color:#6B6560;z-index:99}
</style>
</head>
<body>
<div id="loading">Loading Wire…</div>
<header>
  <div class="logo">W<span>i</span>re Viewer</div>
  <a href="${SLUG}">← Hero</a>
</header>
<div class="canvas-wrap" id="canvasWrap">
  <div style="text-align:center;padding:60px;color:#6B6560;font-size:14px">
    <p style="font-size:28px;margin-bottom:16px">◈</p>
    <p style="font-weight:700;font-size:18px;margin-bottom:8px">Wire Design</p>
    <p>5 screens · Light theme · AI Workflow Orchestration</p>
    <p style="margin-top:24px"><a href="${SLUG}-mock" style="color:#00C97A;font-weight:700">Open Interactive Mock →</a></p>
    <div style="display:flex;gap:20px;justify-content:center;margin-top:48px;flex-wrap:wrap">
      ${['Flows','Agents','Run Log','Analytics','Config'].map(s => `
      <div class="screen-frame">
        <div class="screen-label">${s.toUpperCase()}</div>
        <div class="fallback">
          <div class="fb-bar" style="width:70%"></div>
          <div class="fb-bar" style="width:45%"></div>
          <div class="fb-card"><div class="fb-bar a"></div><div class="fb-bar" style="width:80%"></div></div>
          <div class="fb-card"><div class="fb-bar" style="width:60%"></div><div class="fb-bar" style="width:90%"></div></div>
          <div class="fb-card"><div class="fb-bar" style="width:75%"></div><div class="fb-bar" style="width:50%"></div></div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>
<script>document.getElementById('loading').style.display='none';</script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>\n// EMBEDDED_PEN_PLACEHOLDER\n</script>', injection + '\n');

// ── Deploy ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page...');
  const heroRes = await deploy(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.url || heroRes.raw?.slice(0,80) || JSON.stringify(heroRes).slice(0,80));

  console.log('Publishing viewer...');
  const viewerRes = await deploy(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log('Viewer:', viewerRes.url || viewerRes.raw?.slice(0,80) || JSON.stringify(viewerRes).slice(0,80));
})();
