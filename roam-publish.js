// roam-publish.js — ROAM: Digital Nomad Finance Intelligence
// Theme: LIGHT — warm parchment + sky travel blue + savings green
// Inspired by: Midday.ai (darkmodedesign.com) + Tracebit framing (land-book.com)

'use strict';
const https = require('https');
const fs    = require('fs');

const SLUG      = 'roam';
const APP_NAME  = 'ROAM';
const TAGLINE   = 'your money, anywhere in the world';
const ARCHETYPE = 'nomad-finance';
const ZENBIN_SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT  = 'Light-theme digital nomad finance app inspired by Midday.ai passive financial intelligence (darkmodedesign.com) — "pre-accounting" automation, humanist typography, warm neutral palette. Also Tracebit "Assume Breach" framing reapplied as proactive overspend monitoring (land-book.com). Warm parchment (#F5F1E8) + sky blue (#2557D6) + savings green (#0D9B6C). Five screens: Runway (127 days at Lisbon pace, AI insight, live rates), Transactions (multi-currency, unusual-spend flagging), City Compare (6-city bar chart with runway delta), Budget (ring viz + category progress), Goals (4 milestone cards with progress bars + milestone markers).';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Viewer builder ────────────────────────────────────────────────────────────
function buildViewer(penJson) {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ROAM — Prototype Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F5F1E8; display: flex; flex-direction: column; align-items: center;
         min-height: 100vh; font-family: Inter, sans-serif; padding: 32px 20px; gap: 12px; }
  .viewer-title { font-family: 'Instrument Serif', serif; font-style: italic;
    font-size: 24px; color: #2557D6; }
  .viewer-tag { font-size: 12px; color: rgba(30,26,18,0.5); margin-bottom: 8px; }
  #pencil-viewer { width: 390px; height: 864px; border-radius: 36px;
    box-shadow: 0 24px 64px rgba(30,26,18,0.10), 0 6px 18px rgba(37,87,214,0.08);
    overflow: hidden; }
  .viewer-links { display: flex; gap: 16px; margin-top: 8px; }
  .viewer-links a { font-size: 12px; color: #2557D6; text-decoration: none; font-weight: 600; }
  .viewer-links a:hover { text-decoration: underline; }
</style>
<script>EMBEDDED_PEN_PLACEHOLDER</script>
<script src="https://cdn.pencil.dev/viewer/v1/pencil-viewer.min.js"></script>
</head>
<body>
  <div class="viewer-title">roam</div>
  <div class="viewer-tag">your money, anywhere in the world</div>
  <div id="pencil-viewer"></div>
  <div class="viewer-links">
    <a href="https://ram.zenbin.org/roam">Landing page</a>
    <a href="https://ram.zenbin.org/roam-mock">Interactive mock</a>
  </div>
  <script>
    if (window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN) });
    }
  <\/script>
</body>
</html>`;
  const injection = 'window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';';
  viewerHtml = viewerHtml.replace('EMBEDDED_PEN_PLACEHOLDER', injection);
  return viewerHtml;
}

// ── Hero HTML ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ROAM — Your money, anywhere in the world</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#F5F1E8; --surface:#FFFFFF; --surfaceAlt:#ECE8DE;
    --text:#1E1A12; --muted:rgba(30,26,18,0.50);
    --accent:#2557D6; --accentDim:rgba(37,87,214,0.10);
    --green:#0D9B6C; --greenDim:rgba(13,155,108,0.10);
    --amber:#C98C2A; --amberDim:rgba(201,140,42,0.10);
    --red:#D63B2F; --border:rgba(30,26,18,0.10);
  }
  html { scroll-behavior:smooth; }
  body { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; overflow-x:hidden; }

  nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center;
    justify-content:space-between; padding:0 48px; height:64px;
    background:rgba(245,241,232,0.88); backdrop-filter:blur(14px);
    border-bottom:1px solid var(--border); }
  .nav-logo { font-family:'Instrument Serif',serif; font-size:22px; font-style:italic; color:var(--accent); }
  .nav-links { display:flex; gap:32px; }
  .nav-links a { color:var(--muted); text-decoration:none; font-size:14px; font-weight:500; transition:color .2s; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta { background:var(--accent); color:#FFF; border:none; border-radius:10px;
    padding:10px 22px; font-size:14px; font-weight:600; cursor:pointer; text-decoration:none; transition:opacity .2s; }
  .nav-cta:hover { opacity:.88; }

  .hero { padding-top:120px; min-height:100vh; display:flex; flex-direction:column;
    align-items:center; text-align:center; position:relative; overflow:hidden; }
  .eyebrow { display:inline-flex; align-items:center; gap:8px; background:var(--accentDim);
    border:1px solid rgba(37,87,214,0.22); border-radius:20px; padding:6px 16px;
    font-size:12px; font-weight:700; color:var(--accent); letter-spacing:0.5px; text-transform:uppercase;
    margin-bottom:28px; animation:fadeUp .7s ease both; }
  h1 { font-family:'Instrument Serif',serif; font-size:clamp(48px,7vw,90px); line-height:1.04;
    letter-spacing:-2px; max-width:800px; margin-bottom:24px;
    animation:fadeUp .7s .1s ease both; }
  h1 em { font-style:italic; color:var(--accent); }
  .hero-sub { font-size:18px; line-height:1.65; color:var(--muted); max-width:520px; margin-bottom:40px;
    animation:fadeUp .7s .2s ease both; }
  .hero-actions { display:flex; gap:14px; align-items:center; margin-bottom:64px;
    animation:fadeUp .7s .3s ease both; }
  .btn-primary { background:var(--accent); color:#FFF; border:none; border-radius:12px;
    padding:14px 30px; font-size:15px; font-weight:600; cursor:pointer; text-decoration:none;
    box-shadow:0 4px 14px rgba(37,87,214,0.30); transition:all .2s; }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,87,214,0.35); }
  .btn-secondary { background:transparent; color:var(--text); border:1.5px solid var(--border);
    border-radius:12px; padding:13px 28px; font-size:15px; font-weight:500;
    cursor:pointer; text-decoration:none; transition:all .2s; }
  .btn-secondary:hover { border-color:var(--accent); color:var(--accent); }

  .runway-stat { display:flex; align-items:baseline; gap:14px; background:var(--surface);
    border:1px solid var(--border); border-radius:24px; padding:32px 44px;
    box-shadow:0 8px 40px rgba(30,26,18,0.06); margin-bottom:20px;
    animation:fadeUp .7s .35s ease both; }
  .runway-number { font-family:'Instrument Serif',serif; font-size:96px; line-height:1;
    color:var(--text); letter-spacing:-4px; }
  .runway-label { font-size:26px; font-weight:300; color:var(--muted); }
  .runway-badge { background:var(--greenDim); color:var(--green); border-radius:10px;
    padding:4px 12px; font-size:12px; font-weight:700; margin-left:8px;
    align-self:flex-start; margin-top:10px; }

  .metrics-row { display:flex; gap:14px; flex-wrap:wrap; justify-content:center;
    margin-bottom:72px; animation:fadeUp .7s .45s ease both; }
  .metric-pill { background:var(--surface); border:1px solid var(--border); border-radius:14px;
    padding:14px 22px; text-align:center; }
  .metric-pill .val { font-size:20px; font-weight:700; color:var(--text); display:block; }
  .metric-pill .lbl { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; }

  .sparkline-wrap { margin:0 auto 80px; max-width:520px; opacity:.6; animation:fadeUp .7s .5s ease both; }

  /* Features */
  .features { padding:100px 48px; max-width:1080px; margin:0 auto; }
  .features-label { text-align:center; font-size:11px; font-weight:700; letter-spacing:2px;
    text-transform:uppercase; color:var(--muted); margin-bottom:14px; }
  .features h2 { text-align:center; font-family:'Instrument Serif',serif;
    font-size:clamp(30px,4vw,50px); letter-spacing:-1.5px; line-height:1.1; margin-bottom:56px; }
  .features h2 em { font-style:italic; color:var(--accent); }
  .feature-wide { background:var(--surface); border:1px solid var(--border); border-radius:22px;
    padding:36px 40px; display:flex; gap:28px; align-items:flex-start; margin-bottom:18px;
    transition:transform .2s,box-shadow .2s; }
  .feature-wide:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(30,26,18,0.07); }
  .feature-wide-icon { font-size:32px; flex-shrink:0; margin-top:2px; }
  .feature-wide h3 { font-size:17px; font-weight:700; margin-bottom:7px; }
  .feature-wide p { font-size:14px; line-height:1.65; color:var(--muted); }
  .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:18px; }
  .feature-card { background:var(--surface); border:1px solid var(--border); border-radius:20px;
    padding:28px; transition:transform .2s,box-shadow .2s; }
  .feature-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(30,26,18,0.07); }
  .feature-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center;
    justify-content:center; font-size:22px; margin-bottom:16px; }
  .feature-card h3 { font-size:15px; font-weight:700; margin-bottom:7px; }
  .feature-card p { font-size:13px; line-height:1.65; color:var(--muted); }

  /* Cities */
  .cities-section { padding:100px 48px; background:var(--surfaceAlt); }
  .cities-inner { max-width:860px; margin:0 auto; }
  .cities-inner h2 { font-family:'Instrument Serif',serif; font-size:clamp(28px,4vw,46px);
    letter-spacing:-1.5px; margin-bottom:10px; }
  .cities-inner h2 em { font-style:italic; color:var(--accent); }
  .cities-inner .sub { color:var(--muted); font-size:15px; margin-bottom:44px; }
  .city-bars { display:flex; flex-direction:column; gap:14px; }
  .city-row { display:flex; align-items:center; gap:14px; }
  .city-name { width:136px; font-size:14px; font-weight:500; flex-shrink:0; }
  .city-bar-wrap { flex:1; background:rgba(30,26,18,0.10); border-radius:8px; height:9px; overflow:hidden; }
  .city-bar { height:9px; border-radius:8px; }
  .city-cost { width:72px; text-align:right; font-size:13px; font-weight:700; }
  .city-delta { font-size:11px; font-weight:700; padding:2px 10px; border-radius:20px; }

  /* Insight */
  .insight-section { padding:90px 48px; max-width:780px; margin:0 auto; text-align:center; }
  .insight-card { background:var(--surface); border:1px solid var(--border); border-radius:22px;
    padding:40px 48px; box-shadow:0 8px 40px rgba(30,26,18,0.05); }
  .insight-mark { font-size:26px; color:var(--accent); margin-bottom:18px; display:block; }
  .insight-card blockquote { font-family:'Instrument Serif',serif; font-style:italic;
    font-size:clamp(18px,2.5vw,25px); line-height:1.5; margin-bottom:22px; letter-spacing:-0.5px; }
  .insight-card cite { font-size:12px; color:var(--muted); font-style:normal; }

  /* CTA */
  .cta-section { padding:90px 48px; text-align:center; }
  .cta-inner { background:var(--text); border-radius:28px; padding:72px 48px;
    max-width:740px; margin:0 auto; position:relative; overflow:hidden; }
  .cta-inner::before { content:''; position:absolute; top:-80px; right:-80px;
    width:300px; height:300px; border-radius:50%; background:var(--accent); opacity:0.14; }
  .cta-inner h2 { font-family:'Instrument Serif',serif; font-size:clamp(26px,4vw,46px);
    letter-spacing:-1.5px; color:#FFF; margin-bottom:14px; }
  .cta-inner h2 em { font-style:italic; color:rgba(255,255,255,0.55); }
  .cta-inner p { color:rgba(255,255,255,0.5); font-size:16px; margin-bottom:34px; }
  .btn-light { background:#FFF; color:var(--accent); border:none; border-radius:12px;
    padding:14px 32px; font-size:15px; font-weight:700; cursor:pointer; text-decoration:none;
    transition:all .2s; }
  .btn-light:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.18); }

  footer { padding:44px 48px; display:flex; align-items:center; justify-content:space-between;
    border-top:1px solid var(--border); }
  .footer-logo { font-family:'Instrument Serif',serif; font-style:italic; font-size:18px; color:var(--accent); }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @media(max-width:768px){.features-grid{grid-template-columns:1fr}.nav-links{display:none}}
</style>
</head>
<body>
<nav>
  <span class="nav-logo">roam</span>
  <div class="nav-links"><a href="#features">Features</a><a href="#cities">Cities</a><a href="#insight">Insights</a></div>
  <a href="https://ram.zenbin.org/roam-mock" class="nav-cta">Open app →</a>
</nav>

<section class="hero">
  <div class="eyebrow">✦ Financial intelligence for nomads</div>
  <h1>Know your <em>runway</em>,<br>anywhere</h1>
  <p class="hero-sub">Roam passively watches your spending across currencies and cities, telling you exactly how long your money lasts — wherever you are.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/roam-mock" class="btn-primary">See the app →</a>
    <a href="https://ram.zenbin.org/roam-viewer" class="btn-secondary">View prototype</a>
  </div>
  <div class="runway-stat">
    <span class="runway-number">127</span>
    <div>
      <span class="runway-label">days</span>
      <span class="runway-badge">↑ +12 days</span>
      <div style="font-size:13px;color:var(--muted);margin-top:8px;">at Lisbon pace &nbsp;·&nbsp; ~$77/day</div>
    </div>
  </div>
  <div class="metrics-row">
    <div class="metric-pill"><span class="val">$2,310</span><span class="lbl">Monthly</span></div>
    <div class="metric-pill"><span class="val">6 cities</span><span class="lbl">Compared</span></div>
    <div class="metric-pill"><span class="val">$9,817</span><span class="lbl">Balance</span></div>
    <div class="metric-pill"><span class="val">3 goals</span><span class="lbl">On track</span></div>
  </div>
  <div class="sparkline-wrap">
    <svg viewBox="0 0 520 64" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:64px;">
      <defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#D63B2F" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#D63B2F" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="M 0 52 L 36 57 L 73 22 L 109 55 L 146 2 L 182 28 L 219 45 L 255 54 L 292 11 L 328 36 L 365 57 L 401 42 L 438 28 L 474 42 L 520 50 L 520 64 L 0 64 Z" fill="url(#sg)"/>
      <polyline points="0,52 36,57 73,22 109,55 146,2 182,28 219,45 255,54 292,11 328,36 365,57 401,42 438,28 474,42 520,50" fill="none" stroke="#D63B2F" stroke-width="2" stroke-linejoin="round"/>
      <line x1="0" y1="18" x2="520" y2="18" stroke="#DDD8CC" stroke-width="1" stroke-dasharray="4 4"/>
      <text x="8" y="14" font-size="10" fill="#9C9486" font-family="Inter">$100 budget</text>
    </svg>
  </div>
</section>

<section class="features" id="features">
  <div class="features-label">What Roam does</div>
  <h2>Finance that <em>runs quietly</em> in the background</h2>
  <div class="feature-wide">
    <span class="feature-wide-icon">◈</span>
    <div><h3>Runway Intelligence</h3><p>Connect your accounts once. Roam calculates your exact runway — days, weeks, months — at current spend rates in your city. Updates every transaction.</p></div>
  </div>
  <div class="feature-wide">
    <span class="feature-wide-icon">◎</span>
    <div><h3>City Comparison Engine</h3><p>Compare the real cost of living across cities you've visited and want to visit next. See how many more days you'd get in Chiang Mai vs Lisbon.</p></div>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--accentDim);">↓↑</div>
      <h3>Multi-currency</h3><p>EUR, THB, GEL — unified to USD in real time. See local amounts and converted totals side by side.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--greenDim);">◐</div>
      <h3>Smart Budgets</h3><p>Category budgets that adapt to location. Food in Bangkok ≠ food in Lisbon. Roam knows the difference.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--amberDim);">⚠</div>
      <h3>Anomaly Watch</h3><p>Unusual transactions flagged before they spiral. Assume Overspend — proactive monitoring so surprises don't hit at 2am.</p>
    </div>
  </div>
</section>

<section class="cities-section" id="cities">
  <div class="cities-inner">
    <h2>Where does your money<br>go <em>furthest?</em></h2>
    <p class="sub">Monthly cost of living, USD equivalent — based on your actual spending patterns</p>
    <div class="city-bars">
      <div class="city-row"><span class="city-name">📍 Lisbon 🇵🇹</span><div class="city-bar-wrap"><div class="city-bar" style="width:77%;background:#2557D6;"></div></div><span class="city-cost" style="color:#2557D6;">$2,310</span><span class="city-delta" style="background:var(--accentDim);color:#2557D6;">Here</span></div>
      <div class="city-row"><span class="city-name">Bangkok 🇹🇭</span><div class="city-bar-wrap"><div class="city-bar" style="width:56%;background:#0D9B6C;"></div></div><span class="city-cost" style="color:#0D9B6C;">$1,680</span><span class="city-delta" style="background:var(--greenDim);color:#0D9B6C;">–$630</span></div>
      <div class="city-row"><span class="city-name">Tbilisi 🇬🇪</span><div class="city-bar-wrap"><div class="city-bar" style="width:47%;background:#0D9B6C;"></div></div><span class="city-cost" style="color:#0D9B6C;">$1,420</span><span class="city-delta" style="background:var(--greenDim);color:#0D9B6C;">–$890</span></div>
      <div class="city-row"><span class="city-name">Medellín 🇨🇴</span><div class="city-bar-wrap"><div class="city-bar" style="width:52%;background:#C98C2A;"></div></div><span class="city-cost" style="color:#C98C2A;">$1,550</span><span class="city-delta" style="background:var(--amberDim);color:#C98C2A;">–$760</span></div>
      <div class="city-row"><span class="city-name">Chiang Mai 🇹🇭</span><div class="city-bar-wrap"><div class="city-bar" style="width:41%;background:#0D9B6C;"></div></div><span class="city-cost" style="color:#0D9B6C;">$1,230</span><span class="city-delta" style="background:var(--greenDim);color:#0D9B6C;">–$1,080</span></div>
      <div class="city-row"><span class="city-name">Bali 🇮🇩</span><div class="city-bar-wrap"><div class="city-bar" style="width:59%;background:#C98C2A;"></div></div><span class="city-cost" style="color:#C98C2A;">$1,780</span><span class="city-delta" style="background:var(--amberDim);color:#C98C2A;">–$530</span></div>
    </div>
  </div>
</section>

<section class="insight-section" id="insight">
  <div class="insight-card">
    <span class="insight-mark">✦</span>
    <blockquote>"You've spent $340 less this month than in Bangkok. Your runway extends by 12 days at this pace — keep it up."</blockquote>
    <cite>— Roam insight &nbsp;·&nbsp; March 24, 2026 &nbsp;·&nbsp; Lisbon, Portugal</cite>
  </div>
</section>

<section class="cta-section">
  <div class="cta-inner">
    <h2>Start knowing your<br><em>number</em></h2>
    <p>Connect your accounts in 2 minutes. Roam does the rest.</p>
    <a href="https://ram.zenbin.org/roam-mock" class="btn-light">Open the app →</a>
  </div>
</section>

<footer>
  <span class="footer-logo">roam</span>
  <p style="font-size:13px;color:var(--muted);">Designed by RAM · March 2026</p>
  <p style="font-size:12px;color:var(--muted);">Inspired by Midday.ai + land-book.com</p>
</footer>
</body>
</html>`;

// ── Main pipeline ─────────────────────────────────────────────────────────────
(async () => {
  // a) Hero
  console.log('Publishing hero…');
  const heroRes = await zenPublish(SLUG, heroHtml, `ROAM — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 80));

  // b) Viewer
  console.log('Publishing viewer…');
  const penJson    = fs.readFileSync('/workspace/group/design-studio/roam.pen', 'utf8');
  const viewerHtml = buildViewer(penJson);
  const viewerRes  = await zenPublish(SLUG + '-viewer', viewerHtml, 'ROAM — Prototype Viewer');
  console.log('Viewer:', viewerRes.status, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 80));

  // c) Gallery queue
  console.log('Updating gallery queue…');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData = JSON.parse(getRes.body);
  const sha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
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
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 120));

  // d) Design DB
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, newEntry);
    rebuildEmbeddings(db);
    console.log('Indexed in design DB ✓');
  } catch(e) { console.log('DB index skipped:', e.message); }

  console.log('\n✓ All done!');
  console.log('  Hero   → https://ram.zenbin.org/roam');
  console.log('  Viewer → https://ram.zenbin.org/roam-viewer');
  console.log('  Mock   → https://ram.zenbin.org/roam-mock (separate step)');
})();
