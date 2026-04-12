const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'beacon';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BEACON — Your Signal, Live</title>
<meta name="description" content="Real-time creative metrics dashboard for indie makers. Track every signal across all your platforms in one neon-lit command center.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080808; --surface: #111111; --surface2: #1A1A1A; --border: #2A2A2A;
    --text: #FFFFFF; --textMid: rgba(255,255,255,0.65); --textLow: rgba(255,255,255,0.35);
    --accent: #00FF88; --accent2: #FF6B35; --accent3: #7B61FF; --warn: #FF3B3B;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; overflow-x: hidden; }
  body::after {
    content: '';
    position: fixed; inset: 0;
    background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px; opacity: 0.25; pointer-events: none; z-index: 0;
  }
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 40px; background: rgba(8,8,8,0.85); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .logo { font-size: 18px; font-weight: 800; letter-spacing: 5px; }
  .logo span { color: var(--accent); }
  .live-dot {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 3px; color: var(--accent);
  }
  .live-dot::before {
    content: ''; width: 8px; height: 8px; background: var(--accent);
    border-radius: 50%; box-shadow: 0 0 10px var(--accent);
    animation: blink 2s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1;box-shadow:0 0 8px var(--accent);} 50%{opacity:0.4;box-shadow:0 0 20px var(--accent);} }
  .nav-cta {
    background: var(--accent); color: var(--bg); border: none;
    padding: 10px 22px; border-radius: 100px; font-size: 13px; font-weight: 700;
    letter-spacing: 1px; cursor: pointer; transition: all 0.2s;
  }
  .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(0,255,136,0.3); }
  .hero {
    position: relative; z-index: 1; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 100px 40px 60px; text-align: center; overflow: hidden;
  }
  .hero-glow {
    position: absolute; top: 20%; left: 50%; transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(0,255,136,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-glow2 {
    position: absolute; bottom: 0; right: -10%;
    width: 400px; height: 400px;
    background: radial-gradient(ellipse, rgba(123,97,255,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px;
    font-size: 11px; font-weight: 700; letter-spacing: 4px; color: var(--accent);
    padding: 6px 16px; border: 1px solid rgba(0,255,136,0.3); border-radius: 100px;
  }
  .hero h1 {
    font-size: clamp(72px, 13vw, 128px); font-weight: 900;
    letter-spacing: -2px; line-height: 0.9; margin-bottom: 8px;
  }
  .hero h1 .g { color: var(--accent); }
  .hero-sub {
    font-size: clamp(14px, 2.5vw, 22px); font-weight: 300; color: var(--textMid);
    letter-spacing: 7px; margin-bottom: 28px; text-transform: uppercase;
  }
  .hero-desc {
    max-width: 520px; font-size: 17px; line-height: 1.75;
    color: var(--textMid); margin-bottom: 48px;
  }
  .actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center; }
  .btn-p {
    background: var(--accent); color: var(--bg);
    padding: 16px 36px; border-radius: 100px; font-size: 15px; font-weight: 700;
    letter-spacing: 1px; text-decoration: none; transition: all 0.2s;
  }
  .btn-p:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,255,136,0.3); }
  .btn-s {
    color: var(--textMid); padding: 16px 36px; border-radius: 100px;
    font-size: 15px; font-weight: 500; letter-spacing: 1px; text-decoration: none;
    border: 1px solid var(--border); transition: all 0.2s;
  }
  .btn-s:hover { border-color: var(--textLow); color: var(--text); }
  .stats {
    position: relative; z-index: 1;
    display: flex; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    margin: 0 40px; flex-wrap: wrap;
  }
  .stat {
    flex: 1; min-width: 140px; padding: 40px; text-align: center;
    border-right: 1px solid var(--border);
  }
  .stat:last-child { border-right: none; }
  .stat-n { font-size: 44px; font-weight: 800; line-height: 1; margin-bottom: 8px; }
  .g { color: var(--accent); } .o { color: var(--accent2); } .v { color: var(--accent3); }
  .stat-l { font-size: 10px; font-weight: 600; letter-spacing: 3px; color: var(--textLow); text-transform: uppercase; }
  .features { position: relative; z-index: 1; padding: 100px 40px; max-width: 1100px; margin: 0 auto; }
  .features h2 { font-size: clamp(32px,5vw,52px); font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; text-align: center; }
  .features-sub { text-align: center; color: var(--textMid); font-size: 17px; margin-bottom: 60px; }
  .grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
  }
  .card { background: var(--bg); padding: 38px 34px; transition: background 0.2s; }
  .card:hover { background: var(--surface); }
  .card-icon { font-size: 26px; margin-bottom: 14px; }
  .card-name { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
  .card-desc { font-size: 14px; line-height: 1.7; color: var(--textMid); }
  .cta { position: relative; z-index: 1; padding: 100px 40px; text-align: center; }
  .cta h2 { font-size: clamp(32px,5vw,52px); font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
  .cta p { color: var(--textMid); font-size: 17px; margin-bottom: 36px; }
  footer {
    position: relative; z-index: 1; border-top: 1px solid var(--border);
    padding: 36px 40px; display: flex; justify-content: space-between; align-items: center;
    color: var(--textLow); font-size: 13px;
  }
  @media(max-width:768px) {
    nav { padding: 16px 20px; }
    .hero { padding: 80px 20px 40px; }
    .stats { margin: 0 20px; }
    footer { flex-direction: column; gap: 12px; text-align: center; }
  }
</style>
</head>
<body>
<nav>
  <div class="logo">BEAC<span>O</span>N</div>
  <div class="live-dot">LIVE NOW</div>
  <button class="nav-cta">Get Early Access</button>
</nav>
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>
  <div class="eyebrow">⚡ FOR INDIE MAKERS &amp; CREATORS</div>
  <h1>BEAC<span class="g">O</span>N</h1>
  <p class="hero-sub">Your Signal, Live</p>
  <p class="hero-desc">One command center for every metric that matters. Track reach, content performance, audience growth, and anomalies — across all platforms, in real time.</p>
  <div class="actions">
    <a href="/beacon-mock" class="btn-p">View Interactive Mock →</a>
    <a href="/beacon-viewer" class="btn-s">Browse Screens</a>
  </div>
</section>
<section class="stats">
  <div class="stat"><div class="stat-n g">5</div><div class="stat-l">Screens</div></div>
  <div class="stat"><div class="stat-n o">4</div><div class="stat-l">Platforms</div></div>
  <div class="stat"><div class="stat-n v">Live</div><div class="stat-l">AI Insights</div></div>
  <div class="stat"><div class="stat-n" style="font-size:28px;padding-top:8px">Dark</div><div class="stat-l">Theme</div></div>
</section>
<section class="features">
  <h2>Every signal, decoded</h2>
  <p class="features-sub">Built for makers who ship in public and need honest data, fast.</p>
  <div class="grid">
    <div class="card"><div class="card-icon">⚡</div><div class="card-name">Pulse Dashboard</div><div class="card-desc">Live-updating overview of your total reach with sparklines, platform breakdown, and real-time signal feed.</div></div>
    <div class="card"><div class="card-icon">◈</div><div class="card-name">Content Performance</div><div class="card-desc">Views, saves, and engagement rate per post. Color-coded by platform with mini momentum bar charts.</div></div>
    <div class="card"><div class="card-icon">◎</div><div class="card-name">Audience Signals</div><div class="card-desc">Radial growth visualization plus per-platform breakdown. AI pinpoints your fastest-growing channel.</div></div>
    <div class="card"><div class="card-icon">◆</div><div class="card-name">Milestone Goals</div><div class="card-desc">Set targets and watch percentage bars fill in real time. Days-left countdown keeps urgency front and center.</div></div>
    <div class="card"><div class="card-icon">🔮</div><div class="card-name">Smart Alerts</div><div class="card-desc">Anomaly detection spots viral spikes, reach drops, and goal proximity with priority tagging.</div></div>
    <div class="card"><div class="card-icon">★</div><div class="card-name">AI Timing Tips</div><div class="card-desc">Machine learning surfaces your best posting windows based on historical engagement patterns.</div></div>
  </div>
</section>
<section class="cta">
  <h2>Own your signal.</h2>
  <p>Stop flying blind. Start tracking what actually moves the needle.</p>
  <a href="/beacon-mock" class="btn-p">Explore the Design →</a>
</section>
<footer>
  <div>BEACON — Design by RAM · ram.zenbin.org/beacon</div>
  <div>Inspired by Haptic (Godly.website) · Neon (Dark Mode Design)</div>
</footer>
</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
const viewerHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BEACON — Design Viewer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
  // EMBEDDED_PEN will be injected here
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --bg: #080808; --surface: #111; --surface2: #1A1A1A; --border: #2A2A2A; --text: #fff; --muted: rgba(255,255,255,0.4); --accent: #00FF88; --accent2: #FF6B35; --accent3: #7B61FF; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; }
    .viewer-header { background: rgba(8,8,8,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
    .viewer-brand { font-size: 14px; font-weight: 800; letter-spacing: 4px; }
    .viewer-brand span { color: var(--accent); }
    .viewer-actions { display: flex; gap: 10px; }
    .viewer-btn { font-size: .8rem; padding: 7px 16px; border-radius: 100px; text-decoration: none; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s; }
    .viewer-btn.primary { background: var(--accent); color: var(--bg); }
    .viewer-btn.ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
    .viewer-btn.ghost:hover { color: var(--text); border-color: #444; }
    .viewer-body { max-width: 960px; margin: 0 auto; padding: 40px 28px; }
    .screen-nav { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
    .nav-pill { padding: 8px 18px; border-radius: 100px; font-size: .8rem; font-weight: 600; letter-spacing: 1px; background: var(--surface); border: 1px solid var(--border); cursor: pointer; color: var(--muted); font-family: 'Inter', sans-serif; transition: all .15s; }
    .nav-pill.active { background: var(--accent); color: var(--bg); border-color: var(--accent); }
    .screen-panel { display: none; animation: fadeIn .2s ease; }
    .screen-panel.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
    .pen-window { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 20px; }
    .pen-bar { background: var(--surface2); display: flex; align-items: center; padding: 0 18px; height: 42px; gap: 12px; border-bottom: 1px solid var(--border); }
    .pen-id { font-size: .65rem; font-weight: 500; color: var(--muted); font-family: monospace; }
    .pen-title { flex: 1; text-align: center; font-size: .75rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text); font-weight: 600; }
    .pen-badge { font-size: .6rem; background: rgba(0,255,136,0.12); color: var(--accent); border: 1px solid rgba(0,255,136,0.3); padding: 2px 8px; border-radius: 4px; font-weight: 700; letter-spacing: 1px; }
    .pen-body { padding: 28px; }
    h2 { font-size: 1.3rem; font-weight: 700; color: var(--text); margin-bottom: .5rem; }
    .meta-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 20px; }
    .meta-tag { background: rgba(0,255,136,0.08); border: 1px solid rgba(0,255,136,0.2); border-radius: 4px; padding: 4px 10px; font-size: .7rem; color: var(--accent); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
    .layer-count { font-size: .8rem; color: var(--muted); margin-bottom: 16px; }
    pre { font-family: 'Courier New', monospace; font-size: .7rem; line-height: 1.65; color: var(--muted); background: #0C0C0C; border: 1px solid var(--border); border-radius: 8px; padding: 16px; overflow-x: auto; white-space: pre-wrap; max-height: 400px; overflow-y: auto; }
  </style>
</head>
<body>
  <div class="viewer-header">
    <div class="viewer-brand">BEAC<span>O</span>N — Viewer</div>
    <div class="viewer-actions">
      <a href="/beacon" class="viewer-btn ghost">← Hero</a>
      <a href="/beacon-mock" class="viewer-btn primary">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="viewer-body">
    <div class="screen-nav" id="screenNav"></div>
    <div id="screenPanels"></div>
  </div>
  <script>
    const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
    const screens = pen && (pen.screens || pen.children);
    if (screens) {
      const nav    = document.getElementById('screenNav');
      const panels = document.getElementById('screenPanels');
      screens.forEach((s, i) => {
        const name  = s.name || ('Screen ' + (i+1));
        const pill  = document.createElement('button');
        pill.className = 'nav-pill' + (i===0?' active':'');
        pill.textContent = name;
        pill.onclick = () => {
          document.querySelectorAll('.nav-pill').forEach(p=>p.classList.remove('active'));
          document.querySelectorAll('.screen-panel').forEach(p=>p.classList.remove('active'));
          pill.classList.add('active');
          document.getElementById('spanel-'+i).classList.add('active');
        };
        nav.appendChild(pill);
        const shapes = s.shapes || s.children || [];
        const layerCount = shapes.length;
        const topLayerTypes = [...new Set(shapes.map(c=>c.type||'layer'))];
        const panel = document.createElement('div');
        panel.className = 'screen-panel' + (i===0?' active':'');
        panel.id = 'spanel-'+i;
        panel.innerHTML = \`
          <div class="pen-window">
            <div class="pen-bar">
              <span class="pen-id">S-0\${i+1}</span>
              <span class="pen-title">\${name.toUpperCase()} — BEACON</span>
              <span class="pen-badge">DARK</span>
            </div>
            <div class="pen-body">
              <h2>\${name}</h2>
              <div class="meta-row">
                \${topLayerTypes.map(t=>'<span class="meta-tag">'+t+'</span>').join('')}
              </div>
              <p class="layer-count">\${layerCount} shape layers</p>
              <pre>\${JSON.stringify(shapes.slice(0,8), null, 2)}</pre>
            </div>
          </div>
        \`;
        panels.appendChild(panel);
      });
    }
  </script>
</body>
</html>`;

// ── Publish ───────────────────────────────────────────────────────────────────
const HOST = 'zenbin.org';

async function run() {
  const penJson  = fs.readFileSync(path.join(__dirname, 'beacon.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const viewerHtml = viewerHtmlTemplate.replace(
    '<script>\n  // EMBEDDED_PEN will be injected here\n  </script>',
    injection + '\n<script>'
  );

  console.log('Publishing hero…');
  const r1 = await post(HOST, `/v1/pages/${SLUG}`,
    { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN }
  );
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0, 140));

  console.log('Publishing viewer…');
  const r2 = await post(HOST, `/v1/pages/${SLUG}-viewer`,
    { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN }
  );
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0, 140));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
