/**
 * LEDGE — Full publish pipeline
 * Hero + viewer + gallery queue
 */
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'ledge';
const APP_NAME  = 'Ledge';
const TAGLINE   = 'Your wealth, in focus';
const ARCHETYPE = 'personal-finance';
const PROMPT    = 'Light-theme personal investment portfolio tracker — warm parchment palette, emerald accent for gains, bento-grid layout. Inspired by Equals GTM analytics (landbook.com) editorial number hero and Midday.ai bento grid inverted to light mode.';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

function zenPost(slug, html, title) {
  return new Promise(function(resolve, reject) {
    const payload = JSON.stringify({ title: title || slug, html: html });
    const body    = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug + '?overwrite=true',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': body.length,
        'X-Subdomain':    'ram',
      },
    }, function(res) {
      let d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve({ status: res.statusCode, body: d }); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function ghReq(opts, body) {
  return new Promise(function(resolve, reject) {
    const r = https.request(opts, function(res) {
      let d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve({ status: res.statusCode, body: d }); });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
function buildHeroHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ledge — Your wealth, in focus</title>
<meta name="description" content="A warm-light investment portfolio tracker. Clean bento grid, emerald gains, editorial number hierarchy.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F5F3EE; --surf:#FFFFFF; --surf2:#F0EDE6; --surf3:#E8E4DC;
  --bd:rgba(26,23,24,0.08); --bd2:rgba(26,23,24,0.14);
  --t1:#1A1718; --t2:rgba(26,23,24,0.55); --t3:rgba(26,23,24,0.35);
  --em:#16A34A; --emP:rgba(22,163,74,0.12); --emM:rgba(22,163,74,0.25);
  --am:#B45309; --amP:rgba(180,83,9,0.10);
  --re:#DC2626; --reP:rgba(220,38,38,0.10);
  --bl:#2563EB; --blP:rgba(37,99,235,0.10);
  --pu:#7C3AED; --puP:rgba(124,58,237,0.10);
}
html{background:var(--bg);color:var(--t1);font-family:"Inter",system-ui,sans-serif;scroll-behavior:smooth}
body{min-height:100vh;overflow-x:hidden}

/* HERO */
.hero{
  position:relative;min-height:100vh;display:flex;flex-direction:column;
  justify-content:center;padding:0 80px;overflow:hidden;
}
.hero::before{
  content:"";position:absolute;top:-200px;right:-150px;width:700px;height:700px;
  background:radial-gradient(circle,rgba(22,163,74,0.07) 0%,transparent 65%);
  pointer-events:none;
}
.hero::after{
  content:"";position:absolute;bottom:-200px;left:-100px;width:500px;height:500px;
  background:radial-gradient(circle,rgba(180,83,9,0.06) 0%,transparent 65%);
  pointer-events:none;
}
.pill{
  display:inline-flex;align-items:center;gap:6px;
  background:var(--emP);border:1px solid var(--emM);
  color:var(--em);font-size:9px;font-weight:700;letter-spacing:2px;
  text-transform:uppercase;padding:7px 16px;border-radius:100px;
  margin-bottom:36px;width:fit-content;
}
.dot{width:6px;height:6px;border-radius:50%;background:var(--em);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.hero-eye{font-size:10px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:var(--am);margin-bottom:28px}
.hero-title{
  font-size:clamp(72px,13vw,190px);font-weight:800;line-height:0.85;
  letter-spacing:-0.06em;color:var(--t1);
}
.hero-title .acc{color:var(--em)}
.hero-sub{
  font-size:clamp(14px,1.8vw,18px);color:var(--t2);line-height:1.7;
  letter-spacing:-0.01em;margin-top:40px;max-width:500px;
}
.screen-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}
.stag{
  font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
  padding:6px 14px;border-radius:100px;border:1px solid var(--bd2);
  color:var(--t2);background:var(--surf);
}
.stag.green{background:var(--emP);border-color:var(--emM);color:var(--em)}
.stag.amber{background:var(--amP);border-color:rgba(180,83,9,0.25);color:var(--am)}
.hero-cta{
  display:inline-flex;align-items:center;gap:10px;margin-top:48px;
  background:var(--t1);color:var(--surf);padding:18px 36px;border-radius:14px;
  font-size:14px;font-weight:700;text-decoration:none;width:fit-content;
  transition:transform 0.15s,box-shadow 0.15s;
  box-shadow:0 4px 20px rgba(26,23,24,0.2);
}
.hero-cta:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(26,23,24,0.25)}
.hero-cta .arr{font-size:18px;transition:transform 0.15s}
.hero-cta:hover .arr{transform:translateX(4px)}

/* BENTO GRID */
.section{padding:120px 80px}
.section-label{
  font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
  color:var(--em);margin-bottom:16px;
}
.section-title{font-size:clamp(36px,5vw,64px);font-weight:800;letter-spacing:-0.04em;line-height:1.05;color:var(--t1);margin-bottom:16px}
.section-sub{font-size:16px;color:var(--t2);line-height:1.65;max-width:520px;margin-bottom:64px}

.bento{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
.bcard{
  background:var(--surf);border:1px solid var(--bd);border-radius:20px;
  padding:32px;position:relative;overflow:hidden;
  box-shadow:0 2px 12px rgba(26,23,24,0.06);transition:transform 0.2s,box-shadow 0.2s;
}
.bcard:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(26,23,24,0.10)}
.bc-1{grid-column:span 7}
.bc-2{grid-column:span 5}
.bc-3{grid-column:span 4}
.bc-4{grid-column:span 4}
.bc-5{grid-column:span 4}
.bc-6{grid-column:span 6}
.bc-7{grid-column:span 6}

.bcard-icon{
  width:44px;height:44px;border-radius:12px;display:flex;align-items:center;
  justify-content:center;font-size:20px;margin-bottom:20px;
}
.bcard-title{font-size:18px;font-weight:700;letter-spacing:-0.02em;color:var(--t1);margin-bottom:8px}
.bcard-body{font-size:13px;color:var(--t2);line-height:1.65}

/* Big number card */
.big-num{font-size:clamp(52px,7vw,84px);font-weight:800;letter-spacing:-0.05em;line-height:0.9;color:var(--t1);margin-bottom:12px}
.big-num .em{color:var(--em)}
.sub-metric{font-size:12px;color:var(--t2);display:flex;align-items:center;gap:8px;margin-top:14px}
.badge-gain{background:var(--emP);color:var(--em);border-radius:100px;padding:3px 10px;font-size:11px;font-weight:700}
.badge-loss{background:var(--reP);color:var(--re);border-radius:100px;padding:3px 10px;font-size:11px;font-weight:700}
.badge-amr{background:var(--amP);color:var(--am);border-radius:100px;padding:3px 10px;font-size:11px;font-weight:700}

/* Sparkline card */
.spark-wrap{width:100%;height:80px;position:relative;margin-top:24px}
.spark-svg{width:100%;height:100%}

/* Progress bars */
.prog-row{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.prog-label{font-size:11px;color:var(--t2);flex:0 0 70px}
.prog-bar-bg{flex:1;height:6px;background:var(--surf3);border-radius:3px;overflow:hidden}
.prog-bar{height:100%;border-radius:3px;transition:width 0.8s cubic-bezier(.22,1,.36,1)}
.prog-val{font-size:11px;font-weight:600;flex:0 0 36px;text-align:right}

/* Holdings list */
.holding-row{
  display:flex;align-items:center;padding:16px 0;
  border-bottom:1px solid var(--bd);
}
.holding-row:last-child{border-bottom:none}
.h-badge{
  width:38px;height:28px;border-radius:6px;display:flex;
  align-items:center;justify-content:center;
  font-size:9px;font-weight:800;letter-spacing:0.5px;flex-shrink:0;
}
.h-name{flex:1;margin:0 14px}
.h-name-main{font-size:13px;font-weight:600;color:var(--t1)}
.h-name-sub{font-size:10px;color:var(--t3);margin-top:1px}
.h-val{text-align:right}
.h-val-main{font-size:13px;font-weight:700;color:var(--t1)}
.h-val-sub{font-size:10px;margin-top:1px}

/* Insight cards */
.insight-card{
  background:var(--surf);border:1px solid var(--bd);border-radius:16px;
  padding:24px;margin-bottom:12px;display:flex;gap:16px;
  box-shadow:0 2px 8px rgba(26,23,24,0.05);transition:transform 0.15s;
}
.insight-card:hover{transform:translateX(4px)}
.insight-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.insight-title{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:4px}
.insight-body{font-size:11px;color:var(--t2);line-height:1.6}
.insight-action{font-size:10px;font-weight:600;margin-top:8px}

/* DIVIDER */
.div{border:none;border-top:1px solid var(--bd);margin:0 80px}

/* FOOTER */
footer{padding:80px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--bd)}
.ft-name{font-size:22px;font-weight:800;letter-spacing:-0.04em;color:var(--t1)}
.ft-by{font-size:11px;color:var(--t3);margin-top:4px}
.ft-links{display:flex;gap:20px}
.ft-link{font-size:12px;color:var(--t2);text-decoration:none;transition:color 0.15s}
.ft-link:hover{color:var(--em)}

@media(max-width:900px){
  .hero,.section,footer,.div{padding-left:24px;padding-right:24px}
  .bento{grid-template-columns:1fr}
  .bc-1,.bc-2,.bc-3,.bc-4,.bc-5,.bc-6,.bc-7{grid-column:span 1}
}
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="pill"><span class="dot"></span>Design Study · RAM</div>
  <p class="hero-eye">Personal Finance · Portfolio Tracker</p>
  <h1 class="hero-title">LEDGE<span class="acc">.</span></h1>
  <p class="hero-sub">Your wealth, in focus. A warm-light investment portfolio tracker built around one principle — your numbers deserve space to breathe.</p>
  <div class="screen-tags">
    <span class="stag green">Portfolio Overview</span>
    <span class="stag">Holdings</span>
    <span class="stag green">Performance</span>
    <span class="stag amber">AI Insights</span>
    <span class="stag">Add Position</span>
  </div>
  <a href="https://ram.zenbin.org/ledge-viewer" class="hero-cta">
    Open in Viewer <span class="arr">→</span>
  </a>
</section>

<hr class="div">

<!-- DESIGN PRINCIPLES -->
<section class="section">
  <p class="section-label">Design System</p>
  <h2 class="section-title">Numbers deserve<br>room to breathe</h2>
  <p class="section-sub">Inspired by Equals analytics (landbook.com) and Midday.ai's bento grid — but flipped to a warm parchment light mode. Data hierarchy through scale, not decoration.</p>

  <!-- BENTO GRID -->
  <div class="bento">

    <!-- Total Value card (big) -->
    <div class="bcard bc-1">
      <div class="bcard-icon" style="background:rgba(22,163,74,0.10)">◈</div>
      <div class="bcard-title">Portfolio Overview</div>
      <div class="big-num">$147<span class="em">,</span>293</div>
      <div class="sub-metric">
        <span class="badge-gain">▲ +1.27% today</span>
        <span style="color:var(--t3);font-size:12px">All-time: <strong style="color:var(--em)">+30.2%</strong></span>
      </div>
      <div class="spark-wrap">
        <svg class="spark-svg" viewBox="0 0 400 80" preserveAspectRatio="none">
          <polyline fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            points="0,64 44,56 88,60 133,48 177,52 222,38 266,42 311,30 355,18 400,0"/>
        </svg>
      </div>
    </div>

    <!-- Dividends card -->
    <div class="bcard bc-2" style="background:var(--surf2)">
      <div class="bcard-icon" style="background:var(--amP)">◎</div>
      <div class="bcard-title">Dividends YTD</div>
      <div class="big-num" style="font-size:52px;color:var(--am)">$2,841</div>
      <div class="sub-metric">
        <span class="badge-amr">Next: Apr 15</span>
        <span style="color:var(--t3);font-size:12px">$184 expected</span>
      </div>
      <p class="bcard-body" style="margin-top:16px">Annual yield 1.9% · 6 payers active</p>
    </div>

    <!-- Allocation -->
    <div class="bcard bc-3">
      <div class="bcard-icon" style="background:var(--blP)">◐</div>
      <div class="bcard-title">Allocation</div>
      <div class="prog-row" style="margin-top:16px">
        <span class="prog-label">US Stocks</span>
        <div class="prog-bar-bg"><div class="prog-bar" style="width:48%;background:var(--em)"></div></div>
        <span class="prog-val" style="color:var(--em)">48%</span>
      </div>
      <div class="prog-row">
        <span class="prog-label">Intl</span>
        <div class="prog-bar-bg"><div class="prog-bar" style="width:27%;background:var(--bl)"></div></div>
        <span class="prog-val" style="color:var(--bl)">27%</span>
      </div>
      <div class="prog-row">
        <span class="prog-label">Bonds</span>
        <div class="prog-bar-bg"><div class="prog-bar" style="width:15%;background:var(--am)"></div></div>
        <span class="prog-val" style="color:var(--am)">15%</span>
      </div>
      <div class="prog-row">
        <span class="prog-label">Crypto</span>
        <div class="prog-bar-bg"><div class="prog-bar" style="width:10%;background:#7C3AED"></div></div>
        <span class="prog-val" style="color:#7C3AED">10%</span>
      </div>
    </div>

    <!-- Benchmark -->
    <div class="bcard bc-4" style="background:var(--emP);border-color:rgba(22,163,74,0.2)">
      <div class="bcard-icon" style="background:rgba(22,163,74,0.15)">▲</div>
      <div class="bcard-title">vs S&P 500</div>
      <div class="big-num" style="font-size:48px;color:var(--em)">+11.8<span style="font-size:32px">pp</span></div>
      <p class="bcard-body" style="margin-top:12px">You: +30.2% · SPY: +18.4%<br>3-month window · outperforming</p>
    </div>

    <!-- Risk insight -->
    <div class="bcard bc-5" style="background:rgba(37,99,235,0.05);border-color:rgba(37,99,235,0.15)">
      <div class="bcard-icon" style="background:var(--blP);color:var(--bl)">◈</div>
      <div class="bcard-title" style="color:var(--bl)">Concentration Risk</div>
      <p class="bcard-body" style="margin-top:8px">AAPL is 46.5% of portfolio — above the 20% cap for single-stock exposure. Consider rebalancing.</p>
      <div style="margin-top:16px;display:inline-block;background:var(--blP);border-radius:100px;padding:5px 12px;font-size:10px;font-weight:700;color:var(--bl)">Rebalance →</div>
    </div>

    <!-- Holdings list -->
    <div class="bcard bc-6">
      <div class="bcard-icon" style="background:var(--surf3)">≡</div>
      <div class="bcard-title">Top Holdings</div>
      <div class="holding-row">
        <div class="h-badge" style="background:var(--emP);color:var(--em)">AAPL</div>
        <div class="h-name"><div class="h-name-main">Apple Inc.</div><div class="h-name-sub">46.5% of portfolio</div></div>
        <div class="h-val"><div class="h-val-main">$68,420</div><div class="h-val-sub" style="color:var(--em)">+10.4%</div></div>
      </div>
      <div class="holding-row">
        <div class="h-badge" style="background:var(--emP);color:var(--em)">VTI</div>
        <div class="h-name"><div class="h-name-main">Vanguard Total Mkt</div><div class="h-name-sub">21.8% of portfolio</div></div>
        <div class="h-val"><div class="h-val-main">$32,140</div><div class="h-val-sub" style="color:var(--em)">+10.8%</div></div>
      </div>
      <div class="holding-row">
        <div class="h-badge" style="background:rgba(124,58,237,0.10);color:#7C3AED">BTC</div>
        <div class="h-name"><div class="h-name-main">Bitcoin</div><div class="h-name-sub">16.9% of portfolio</div></div>
        <div class="h-val"><div class="h-val-main">$24,810</div><div class="h-val-sub" style="color:var(--em)">+65.3%</div></div>
      </div>
      <div class="holding-row">
        <div class="h-badge" style="background:var(--reP);color:var(--re)">GOOGL</div>
        <div class="h-name"><div class="h-name-main">Alphabet</div><div class="h-name-sub">8.4% of portfolio</div></div>
        <div class="h-val"><div class="h-val-main">$12,320</div><div class="h-val-sub" style="color:var(--re)">−5.2%</div></div>
      </div>
    </div>

    <!-- AI Insights preview -->
    <div class="bcard bc-7" style="background:var(--surf2)">
      <div class="bcard-icon" style="background:rgba(124,58,237,0.10);color:#7C3AED">◎</div>
      <div class="bcard-title">AI Insights</div>
      <div class="insight-card" style="margin-top:16px;padding:14px;box-shadow:none">
        <div class="insight-icon" style="background:var(--emP)">◎</div>
        <div>
          <div class="insight-title">Dividend Opportunity</div>
          <div class="insight-body">Adding 15% dividend ETFs could push yield from 1.9% → 2.8%</div>
          <div class="insight-action" style="color:var(--em)">Explore →</div>
        </div>
      </div>
      <div class="insight-card" style="padding:14px;box-shadow:none">
        <div class="insight-icon" style="background:var(--amP)">⬡</div>
        <div>
          <div class="insight-title">Tax-Loss Harvesting</div>
          <div class="insight-body">GOOGL loss of $680 could offset gains — save ~$170 in taxes</div>
          <div class="insight-action" style="color:var(--am)">Learn more →</div>
        </div>
      </div>
    </div>

  </div>
</section>

<hr class="div">

<!-- DESIGN PROCESS -->
<section class="section">
  <p class="section-label">Design Rationale</p>
  <h2 class="section-title">Three decisions</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:48px">
    <div class="bcard">
      <div class="bcard-icon" style="background:var(--emP)">①</div>
      <div class="bcard-title">Parchment, not white</div>
      <p class="bcard-body">Pure white finance apps feel sterile. The warm #F5F3EE cream reduces eye strain for daily check-ins and signals trustworthiness — closer to a physical ledger than a dashboard.</p>
    </div>
    <div class="bcard">
      <div class="bcard-icon" style="background:var(--amP)">②</div>
      <div class="bcard-title">Editorial number hierarchy</div>
      <p class="bcard-body">Inspired directly by Equals (landbook.com) — the total portfolio value runs at 34px on mobile, dominating the hero card. Numbers drive the hierarchy, not labels or icons.</p>
    </div>
    <div class="bcard">
      <div class="bcard-icon" style="background:var(--blP)">③</div>
      <div class="bcard-title">Bento grid for features</div>
      <p class="bcard-body">Midday.ai's bento layout translates beautifully to finance — each metric or insight lives in its own card, scannable independently. Inverted here from dark to light for a fresh perspective.</p>
    </div>
  </div>
  <div style="margin-top:24px" class="bcard" style="background:var(--surf2)">
    <div class="bcard-title" style="color:var(--re)">One thing I'd change</div>
    <p class="bcard-body" style="margin-top:8px">The allocation donut on screen 1 is too simplified — it reads more as colored dots than a real donut chart. A proper arc-based SVG donut would give better spatial understanding of portfolio weight at a glance.</p>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div>
    <div class="ft-name">LEDGE</div>
    <div class="ft-by">Design study by RAM · Mar 2026</div>
  </div>
  <div class="ft-links">
    <a href="https://ram.zenbin.org/ledge-viewer" class="ft-link">Viewer</a>
    <a href="https://ram.zenbin.org/ledge-mock" class="ft-link">Mock ☀◑</a>
    <a href="https://ram.zenbin.org/" class="ft-link">Gallery</a>
  </div>
</footer>

</body>
</html>`;
}

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
function buildViewerHTML() {
  const penJson = fs.readFileSync(path.join(__dirname, 'ledge.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

  // Fetch viewer template from zenbin or use inline
  const viewerBase = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ledge — Viewer</title>
${injection}
<script src="https://pencil.zenbin.org/viewer.js"><\/script>
</head>
<body style="margin:0;background:#F5F3EE;display:flex;align-items:center;justify-content:center;min-height:100vh">
<div id="pencil-viewer"></div>
<script>
if(window.PencilViewer && window.EMBEDDED_PEN){
  PencilViewer.init({container:'#pencil-viewer',pen:window.EMBEDDED_PEN});
}
<\/script>
</body>
</html>`;
  return viewerBase;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing LEDGE...\n');

  // 1. Hero
  const heroHtml = buildHeroHTML();
  const heroRes = await zenPost(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero   → ${heroRes.status === 200 ? '✓' : '✗'} ram.zenbin.org/${SLUG} (${heroRes.status})`);

  // 2. Viewer
  const viewerHtml = buildViewerHTML();
  const viewerRes = await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer → ${viewerRes.status === 200 ? '✓' : '✗'} ram.zenbin.org/${SLUG}-viewer (${viewerRes.status})`);

  // 3. GitHub queue
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
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
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`Queue  → ${putRes.status === 200 ? '✓' : '✗'} GitHub queue updated (${putRes.status})`);

  console.log('\nDone!');
  return newEntry;
}

main().catch(console.error);
