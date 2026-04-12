'use strict';
// haze-publish.js — hero page + viewer for HAZE

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG       = 'haze';
const APP_NAME   = 'HAZE';
const TAGLINE    = 'focus deep, drift less';
const SUBDOMAIN  = 'ram';

// ─── HTTP helper ─────────────────────────────────────────────────────────────
function req(opts, body) {
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

function publish(slug, html, title) {
  const body = JSON.stringify({ title: title || slug, html, overwrite: true });
  return req({
    hostname: 'zenbin.org',
    path:     `/v1/pages/${slug}`,
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    SUBDOMAIN,
    },
  }, body);
}

// ─── HERO PAGE ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HAZE — focus deep, drift less</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #07080F;
    --surface: #111827;
    --surfB:   #161E2E;
    --border:  #1F2A42;
    --text:    #E8EAFF;
    --mid:     #9AA3C5;
    --muted:   rgba(232,234,255,0.35);
    --violet:  #7C5CFC;
    --vglow:   rgba(124,92,252,0.15);
    --teal:    #2DD4BF;
    --tglow:   rgba(45,212,191,0.12);
    --amber:   #F59E0B;
  }

  html { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; }
  body { min-height: 100vh; overflow-x: hidden; }

  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  /* ── Grain overlay ── */
  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.5;
  }

  /* ── Ambient glows ── */
  .glow-1 { position:fixed; top:-120px; left:-80px; width:440px; height:440px;
    background: radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 70%);
    pointer-events:none; z-index:0; }
  .glow-2 { position:fixed; bottom:-100px; right:-60px; width:380px; height:380px;
    background: radial-gradient(circle, rgba(45,212,191,0.13) 0%, transparent 70%);
    pointer-events:none; z-index:0; }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 20px 40px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(7,8,15,0.8); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .logo { font-size: 16px; font-weight: 800; letter-spacing: 3px; color: var(--text); }
  .logo span { color: var(--violet); }
  .nav-links { display:flex; gap:32px; }
  .nav-links a { text-decoration:none; color:var(--mid); font-size:13px; font-weight:500;
    transition:color .2s; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta { background:var(--violet); color:#fff; border:none; padding:10px 22px;
    border-radius:10px; font-size:13px; font-weight:600; cursor:pointer;
    transition:opacity .2s; }
  .nav-cta:hover { opacity:0.85; }

  /* ── Hero ── */
  .hero {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 120px 24px 80px;
    text-align: center;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--vglow); border: 1px solid rgba(124,92,252,0.3);
    padding: 6px 16px; border-radius: 20px; margin-bottom: 32px;
    font-size: 12px; font-weight: 600; color: var(--violet); letter-spacing: 0.5px;
  }
  .hero-badge::before { content: '✦'; }
  .hero-title {
    font-size: clamp(52px, 9vw, 96px);
    font-weight: 800;
    letter-spacing: -3px;
    line-height: 1.0;
    color: var(--text);
    max-width: 700px;
    margin-bottom: 12px;
  }
  .hero-title em { color: var(--violet); font-style: italic; font-weight: 300; }
  .hero-sub {
    font-size: 18px; color: var(--mid); font-weight: 400; max-width: 480px;
    line-height: 1.6; margin-bottom: 48px;
  }
  .hero-actions { display:flex; gap:16px; flex-wrap:wrap; justify-content:center; }
  .btn-primary {
    background: var(--violet); color: #fff; padding: 14px 32px;
    border-radius: 12px; font-size: 15px; font-weight: 600;
    text-decoration:none; transition:opacity .2s, transform .2s;
    border: none; cursor: pointer;
  }
  .btn-primary:hover { opacity:0.88; transform:translateY(-1px); }
  .btn-ghost {
    background: var(--surface); color: var(--text); padding: 14px 32px;
    border-radius: 12px; font-size: 15px; font-weight: 500;
    text-decoration:none; border: 1px solid var(--border);
    transition:border-color .2s;
  }
  .btn-ghost:hover { border-color: var(--violet); }

  /* ── App preview (floating card) ── */
  .preview-wrap {
    position: relative; margin-top: 72px;
    display: flex; justify-content: center;
  }
  .preview-frame {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 36px; padding: 16px;
    box-shadow: 0 40px 120px rgba(124,92,252,0.2), 0 0 0 1px rgba(124,92,252,0.1);
    max-width: 340px; width: 100%;
  }
  .preview-screen {
    background: var(--bg); border-radius: 24px; padding: 28px 20px 20px;
    font-size: 13px; min-height: 360px;
  }
  .preview-greeting { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .preview-date { font-size: 12px; color: var(--mid); margin-bottom: 20px; }
  .preview-card {
    background: var(--surfB); border-radius: 14px; padding: 16px;
    margin-bottom: 12px; border-left: 3px solid var(--violet);
  }
  .preview-card-label { font-size: 9px; font-weight: 600; color: var(--mid); letter-spacing: 1.2px; text-transform:uppercase; margin-bottom:6px; }
  .preview-time { font-size: 30px; font-weight: 800; margin-bottom: 6px; }
  .preview-prose { font-size: 11px; color: var(--mid); line-height: 1.6; }
  .preview-stats { display:flex; gap:12px; margin-top:10px; }
  .preview-stat { font-size:11px; font-weight:500; }
  .preview-stat.t { color:var(--teal); }
  .preview-stat.v { color:var(--violet); }
  .preview-stat.a { color:var(--amber); }

  /* ── Features ── */
  .features {
    position:relative; z-index:1;
    padding: 80px 40px; max-width: 1100px; margin: 0 auto;
  }
  .features-label { font-size:11px; font-weight:600; letter-spacing:1.5px; color:var(--violet); text-transform:uppercase; margin-bottom:16px; }
  .features-title { font-size: clamp(32px,5vw,52px); font-weight:800; letter-spacing:-1.5px; max-width:520px; margin-bottom:56px; line-height:1.1; }
  .feat-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap:16px; }
  .feat-card {
    background:var(--surface); border:1px solid var(--border); border-radius:18px;
    padding:28px; transition:border-color .25s, transform .25s;
  }
  .feat-card:hover { border-color:var(--violet); transform:translateY(-3px); }
  .feat-icon { font-size:24px; margin-bottom:16px; }
  .feat-name { font-size:16px; font-weight:700; margin-bottom:8px; }
  .feat-desc { font-size:13px; color:var(--mid); line-height:1.6; }

  /* ── Stats ── */
  .stats {
    position:relative; z-index:1;
    background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border);
    padding:56px 40px;
  }
  .stats-inner { max-width:900px; margin:0 auto; display:flex; justify-content:space-around; flex-wrap:wrap; gap:32px; text-align:center; }
  .stat-val { font-size:42px; font-weight:800; letter-spacing:-1px; color:var(--violet); }
  .stat-lbl { font-size:13px; color:var(--mid); margin-top:4px; }

  /* ── Trend callout ── */
  .trend {
    position:relative; z-index:1;
    max-width:900px; margin:80px auto; padding:0 40px;
  }
  .trend-card {
    background: linear-gradient(135deg, rgba(124,92,252,0.12) 0%, rgba(45,212,191,0.08) 100%);
    border:1px solid rgba(124,92,252,0.25);
    border-radius:20px; padding:40px;
  }
  .trend-kicker { font-size:11px; font-weight:600; letter-spacing:1.5px; color:var(--teal); text-transform:uppercase; margin-bottom:12px; }
  .trend-quote { font-size:clamp(18px,3vw,26px); font-weight:600; line-height:1.5; margin-bottom:16px; }
  .trend-source { font-size:12px; color:var(--mid); }

  /* ── Footer ── */
  footer {
    position:relative; z-index:1;
    border-top:1px solid var(--border);
    padding:40px;
    display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;
  }
  .footer-logo { font-size:14px; font-weight:800; letter-spacing:3px; }
  .footer-logo span { color:var(--violet); }
  footer p { font-size:12px; color:var(--mid); }
</style>
</head>
<body>

<div class="glow-1"></div>
<div class="glow-2"></div>

<nav>
  <div class="logo">HA<span>Z</span>E</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#about">About</a>
    <a href="/${SLUG}-viewer">Preview</a>
  </div>
  <button class="nav-cta">Get early access</button>
</nav>

<section class="hero">
  <div class="hero-badge">Ambient focus intelligence</div>
  <h1 class="hero-title">Focus <em>deep</em>,<br>drift less.</h1>
  <p class="hero-sub">Session tracking, ambient soundscapes, and prose-first insights — built for independent creatives who do their best work in flow.</p>
  <div class="hero-actions">
    <a href="/${SLUG}-viewer" class="btn-primary">View design →</a>
    <a href="/${SLUG}-mock" class="btn-ghost">Interactive mock</a>
  </div>

  <!-- Floating app card preview — Midday "emerging UI" pattern -->
  <div class="preview-wrap">
    <div class="preview-frame">
      <div class="preview-screen">
        <div class="preview-greeting">Good evening, Alex</div>
        <div class="preview-date">Thursday, March 27</div>
        <div class="preview-card">
          <div class="preview-card-label">Today's Focus</div>
          <div class="preview-time">4h 22m</div>
          <div class="preview-prose">Your deepest session was 87 min — a personal best. Flow state detected twice today.</div>
          <div class="preview-stats">
            <span class="preview-stat t">3 sessions</span>
            <span class="preview-stat v">92 score</span>
            <span class="preview-stat a">↑ 14%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="features-label">What Haze does</div>
  <h2 class="features-title">Every session, understood.</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">⊛</div>
      <div class="feat-name">Flow detection</div>
      <div class="feat-desc">Haze recognises when you've hit flow state and logs it automatically — no tapping required.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🌧</div>
      <div class="feat-name">Ambient library</div>
      <div class="feat-desc">24 curated soundscapes from spatial rain to binaural forest. Grouped by mood: Deep Work, Creative, Wind Down.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◷</div>
      <div class="feat-name">35-day heatmap</div>
      <div class="feat-desc">Visualise your focus patterns over five weeks at a glance. Spot your peaks, protect your streaks.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">✦</div>
      <div class="feat-name">Prose insights</div>
      <div class="feat-desc">Weekly briefs written in plain English — "Your Tuesday 6h marathon powered your streak" — not just charts.</div>
    </div>
  </div>
</section>

<div class="stats">
  <div class="stats-inner">
    <div><div class="stat-val">4h 22m</div><div class="stat-lbl">average daily focus</div></div>
    <div><div class="stat-val">92</div><div class="stat-lbl">peak session score</div></div>
    <div><div class="stat-val">6d</div><div class="stat-lbl">longest streak</div></div>
    <div><div class="stat-val">2×</div><div class="stat-lbl">flow states detected</div></div>
  </div>
</div>

<section class="trend" id="about">
  <div class="trend-card">
    <div class="trend-kicker">Design inspiration</div>
    <p class="trend-quote">"Midday.ai showed us that productivity data doesn't need to live in charts — it can be spoken in plain English. We took that 'prose widget' pattern and brought it to the focus timer space."</p>
    <div class="trend-source">RAM Design Heartbeat — darkmodedesign.com · godly.website · March 2026</div>
  </div>
</section>

<footer>
  <div class="footer-logo">HA<span>Z</span>E</div>
  <p>focus deep, drift less — design by RAM ✦</p>
  <p><a href="/${SLUG}-viewer" style="color:var(--violet);text-decoration:none;">View full prototype →</a></p>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ─────────────────────────────────────────────────────────────
const penJson  = fs.readFileSync(path.join(__dirname, 'haze.pen'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

let viewerBase = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HAZE — design viewer</title>
<style>
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html, body { height:100%; background:#07080F; overflow:hidden; }
  body { display:flex; flex-direction:column; }

  header {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 24px; background:#111827; border-bottom:1px solid #1F2A42;
    flex-shrink:0;
  }
  .v-logo { font-family:system-ui; font-size:13px; font-weight:800;
    letter-spacing:3px; color:#E8EAFF; }
  .v-logo span { color:#7C5CFC; }
  .v-tagline { font-size:11px; color:#9AA3C5; }
  .v-links a { color:#7C5CFC; font-size:12px; text-decoration:none; margin-left:16px; }

  #viewer-container { flex:1; position:relative; }
  #pencil-viewer { width:100%; height:100%; border:none; }

  .loading {
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:16px; color:#9AA3C5; font-family:system-ui;
  }
  .loading-dot { width:8px; height:8px; border-radius:50%; background:#7C5CFC;
    animation:pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
</style>
<script>
window.EMBEDDED_PEN = null;
</script>
</head>
<body>
<header>
  <div class="v-logo">HA<span>Z</span>E</div>
  <div class="v-tagline">focus deep, drift less — 5 screens</div>
  <div class="v-links">
    <a href="/${SLUG}">← Hero</a>
    <a href="/${SLUG}-mock">Mock ☀◑</a>
  </div>
</header>
<div id="viewer-container">
  <div class="loading" id="loading">
    <div class="loading-dot"></div>
    <span>Loading prototype…</span>
  </div>
  <iframe id="pencil-viewer"
    src="https://viewer.pencil.dev/?embed=1"
    allow="fullscreen"
    style="opacity:0;transition:opacity .4s;">
  </iframe>
</div>
<script>
  const iframe = document.getElementById('pencil-viewer');
  iframe.addEventListener('load', () => {
    if (window.EMBEDDED_PEN) {
      iframe.contentWindow.postMessage({ type:'LOAD_PEN', pen: window.EMBEDDED_PEN }, '*');
    }
    setTimeout(() => {
      iframe.style.opacity = '1';
      document.getElementById('loading').style.display = 'none';
    }, 800);
  });
</script>
</body>
</html>`;

viewerBase = viewerBase.replace('<script>\nwindow.EMBEDDED_PEN = null;\n</script>', injection + '\n<script>\nwindow.EMBEDDED_PEN = null;\n</script>');

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  hero → ${r1.status}`, r1.status === 200 || r1.status === 201 ? 'OK' : r1.body.slice(0,120));

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerBase, `${APP_NAME} — Design Viewer`);
  console.log(`  viewer → ${r2.status}`, r2.status === 200 || r2.status === 201 ? 'OK' : r2.body.slice(0,120));

  if (r1.status === 200) console.log(`\n✓ https://ram.zenbin.org/${SLUG}`);
  if (r2.status === 200) console.log(`✓ https://ram.zenbin.org/${SLUG}-viewer`);
})();
