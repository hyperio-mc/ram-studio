const https = require('https');
const fs    = require('fs');

const SLUG      = 'kodo';
const SUBDOMAIN = 'ram';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title, html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': SUBDOMAIN,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201)
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}` });
        else reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
      });
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
<title>Kōdo — Engineering Intelligence Platform</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#070B14;--surface:#0F1623;--surface2:#16202E;--border:#1F3050;--text:#E2E8F0;--mid:#94A3B8;--dim:#4A6080;--cyan:#22D3EE;--indigo:#818CF8;--green:#34D399;--amber:#FBBF24;--red:#F87171}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;overflow-x:hidden}
  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:18px 40px;background:rgba(7,11,20,0.88);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)}
  .logo{font-size:18px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:6px}
  .logo span{color:var(--cyan)}
  .nav-links{display:flex;gap:28px}
  .nav-links a{color:var(--mid);text-decoration:none;font-size:14px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--cyan);color:#000;padding:8px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700;transition:opacity .2s}
  .nav-cta:hover{opacity:.85}
  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:900px;height:600px;background:radial-gradient(ellipse,rgba(34,211,238,.10) 0%,transparent 70%);pointer-events:none}
  .live-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--green);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:36px}
  .live-dot{width:7px;height:7px;background:var(--green);border-radius:50%;animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  h1{font-size:clamp(48px,7vw,88px);font-weight:900;letter-spacing:-2.5px;line-height:1.0;margin-bottom:28px}
  h1 .c{color:var(--cyan)}
  h1 .i{color:var(--indigo)}
  .hero-sub{font-size:18px;color:var(--mid);max-width:520px;line-height:1.7;margin-bottom:44px}
  .cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
  .btn-p{background:var(--cyan);color:#000;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;transition:opacity .2s,transform .15s}
  .btn-p:hover{opacity:.88;transform:translateY(-1px)}
  .btn-s{background:var(--surface);color:var(--text);border:1px solid var(--border);padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;text-decoration:none;transition:border-color .2s,transform .15s}
  .btn-s:hover{border-color:var(--cyan);transform:translateY(-1px)}
  .metrics-strip{display:flex;gap:1px;margin-top:72px;background:var(--border);border-radius:14px;overflow:hidden;width:100%;max-width:800px}
  .metric-chip{flex:1;background:var(--surface);padding:22px 18px;text-align:left}
  .metric-label{font-size:10px;color:var(--dim);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
  .metric-val{font-size:28px;font-weight:900;letter-spacing:-1px}
  .metric-unit{font-size:11px;color:var(--mid);margin-left:2px}
  .metric-delta{font-size:11px;font-weight:600;margin-top:8px;color:var(--green)}
  .section{padding:90px 40px;max-width:1100px;margin:0 auto}
  .section-label{font-size:11px;font-weight:700;color:var(--cyan);letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
  .section-title{font-size:clamp(30px,4vw,50px);font-weight:800;letter-spacing:-1.5px;line-height:1.1;margin-bottom:18px}
  .section-sub{font-size:16px;color:var(--mid);max-width:480px;line-height:1.7}
  .feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:52px}
  .feature-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;transition:border-color .2s,transform .2s}
  .feature-card:hover{border-color:var(--cyan);transform:translateY(-3px)}
  .feature-icon{font-size:20px;margin-bottom:14px;width:44px;height:44px;background:rgba(34,211,238,.1);border-radius:10px;display:flex;align-items:center;justify-content:center}
  .feature-name{font-size:16px;font-weight:700;margin-bottom:8px}
  .feature-desc{font-size:14px;color:var(--mid);line-height:1.6}
  .screens-section{padding:60px 0 100px;text-align:center}
  .screens-rail{display:flex;gap:24px;padding:0 60px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;margin-top:40px}
  .screens-rail::-webkit-scrollbar{display:none}
  .screen-card{min-width:200px;height:330px;background:var(--surface2);border:1px solid var(--border);border-radius:20px;scroll-snap-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;transition:border-color .2s,transform .2s;cursor:pointer}
  .screen-card:hover{border-color:var(--indigo);transform:scale(1.02)}
  .screen-num{font-size:36px;font-weight:900;color:var(--dim);margin-bottom:8px}
  .screen-name{font-size:14px;font-weight:700;margin-bottom:6px}
  .screen-desc{font-size:12px;color:var(--mid);text-align:center}
  .ai-section{padding:80px 40px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
  .ai-card{background:var(--surface);border:1px solid rgba(129,140,248,.3);border-radius:14px;padding:22px;position:relative;overflow:hidden;margin-bottom:14px}
  .ai-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--indigo)}
  .ai-card-label{font-size:10px;font-weight:700;color:var(--indigo);text-transform:uppercase;letter-spacing:1px;padding-left:12px;margin-bottom:10px}
  .ai-card-text{font-size:14px;color:var(--text);padding-left:12px;margin-bottom:6px;line-height:1.5}
  .ai-card-sub{font-size:12px;color:var(--mid);padding-left:12px}
  footer{border-top:1px solid var(--border);padding:40px;text-align:center;color:var(--dim);font-size:13px}
  footer a{color:var(--cyan);text-decoration:none}
  @media(max-width:768px){nav{padding:16px 20px}.nav-links{display:none}.metrics-strip{flex-direction:column}.feature-grid{grid-template-columns:1fr}.ai-section{grid-template-columns:1fr}}
</style>
</head>
<body>
<nav>
  <div class="logo">&#9675; Ko&#772;<span>do</span></div>
  <div class="nav-links"><a href="#features">Features</a><a href="#screens">Screens</a><a href="#ai">AI Layer</a></div>
  <a href="/kodo-viewer" class="nav-cta">View Design &rarr;</a>
</nav>
<section class="hero">
  <div class="live-badge"><div class="live-dot"></div>Live Engineering Intelligence</div>
  <h1>Ship faster.<br>Break <span class="c">less</span>.<br>Know <span class="i">why</span>.</h1>
  <p class="hero-sub">K&#333;do gives engineering leads real-time DORA metrics, PR velocity tracking, and AI-powered incident intelligence &mdash; all in one command center.</p>
  <div class="cta-row">
    <a href="/kodo-viewer" class="btn-p">View Interactive Design</a>
    <a href="/kodo-mock" class="btn-s">&#9728;&#9681; Try Mock</a>
  </div>
  <div class="metrics-strip">
    <div class="metric-chip"><div class="metric-label">Deploy Freq</div><div class="metric-val">4.2<span class="metric-unit">/day</span></div><div class="metric-delta">&uarr; +12% this week</div></div>
    <div class="metric-chip"><div class="metric-label">Lead Time</div><div class="metric-val">1.8<span class="metric-unit">hrs</span></div><div class="metric-delta">&darr; &minus;8% improving</div></div>
    <div class="metric-chip"><div class="metric-label">Change Fail</div><div class="metric-val">2.1<span class="metric-unit">%</span></div><div class="metric-delta">&darr; &minus;0.4% lower</div></div>
    <div class="metric-chip"><div class="metric-label">MTTR</div><div class="metric-val">14<span class="metric-unit">min</span></div><div class="metric-delta">&darr; &minus;22% faster</div></div>
  </div>
</section>
<section class="section" id="features">
  <div class="section-label">Platform Features</div>
  <h2 class="section-title">Built for engineering<br>excellence</h2>
  <p class="section-sub">Every metric that matters. AI filters 94% of alerts so only signal reaches your team.</p>
  <div class="feature-grid">
    <div class="feature-card"><div class="feature-icon">&#8257;</div><div class="feature-name">DORA Dashboard</div><div class="feature-desc">Real-time deployment frequency, lead time, change failure rate, and MTTR &mdash; the four elite engineering signals.</div></div>
    <div class="feature-card"><div class="feature-icon">&#8644;</div><div class="feature-name">PR Intelligence</div><div class="feature-desc">Review wait times, stale PR detection, and bottleneck identification before they slow your sprint.</div></div>
    <div class="feature-card"><div class="feature-icon">&#9889;</div><div class="feature-name">Incident Command</div><div class="feature-desc">Unified incident view with on-call tracking, MTTR trends, and AI root cause analysis in seconds.</div></div>
    <div class="feature-card"><div class="feature-icon">&#9675;</div><div class="feature-name">Team Throughput</div><div class="feature-desc">Per-developer metrics, sprint velocity, review load balancing, and streak tracking.</div></div>
    <div class="feature-card"><div class="feature-icon">&#9708;</div><div class="feature-name">Smart Alerts</div><div class="feature-desc">AI-filtered alert stream. 94% noise reduction. Only actionable signals reach your team.</div></div>
    <div class="feature-card"><div class="feature-icon">&#10050;</div><div class="feature-name">AI Insights</div><div class="feature-desc">Pattern detection across your entire SDLC. Proactive recommendations before issues become incidents.</div></div>
  </div>
</section>
<section class="screens-section" id="screens">
  <div class="section-label">5-Screen Design</div>
  <h2 class="section-title">Every workflow covered</h2>
  <div class="screens-rail">
    <div class="screen-card"><div class="screen-num">01</div><div class="screen-name">Dashboard</div><div class="screen-desc">DORA rail + health score ring + deploy activity</div></div>
    <div class="screen-card"><div class="screen-num">02</div><div class="screen-name">Pull Requests</div><div class="screen-desc">Review queue with wait-time alerts + leaderboard</div></div>
    <div class="screen-card"><div class="screen-num">03</div><div class="screen-name">Incidents</div><div class="screen-desc">On-call view, MTTR trend, AI root cause</div></div>
    <div class="screen-card"><div class="screen-num">04</div><div class="screen-name">Team</div><div class="screen-desc">Sprint progress, per-dev throughput, streaks</div></div>
    <div class="screen-card"><div class="screen-num">05</div><div class="screen-name">Alerts</div><div class="screen-desc">AI-filtered smart signal stream</div></div>
  </div>
</section>
<section class="ai-section" id="ai">
  <div>
    <div class="section-label">AI Intelligence Layer</div>
    <h2 class="section-title" style="font-size:36px">Your engineering analyst that never sleeps</h2>
    <p class="section-sub" style="margin-top:16px">K&#333;do&apos;s AI monitors your entire SDLC, surfaces anomalies, and explains what changed &mdash; so your team spends time fixing, not investigating.</p>
  </div>
  <div>
    <div class="ai-card"><div class="ai-card-label">&#10050; AI Insight &middot; Dashboard</div><div class="ai-card-text">Deploy cadence up 12% vs last week.</div><div class="ai-card-sub">PR review time is your current bottleneck.</div></div>
    <div class="ai-card"><div class="ai-card-label">&#10050; AI Root Cause &middot; P2 Incident</div><div class="ai-card-text">Deploy v2.8.1 changed batch size.</div><div class="ai-card-sub">Rollback or patch query pool limit to resolve.</div></div>
    <div class="ai-card"><div class="ai-card-label">&#10050; AI Alert Filter &middot; Active</div><div class="ai-card-text">94% of alerts suppressed as non-actionable.</div><div class="ai-card-sub">6 signals surfaced in your feed right now.</div></div>
  </div>
</section>
<footer>
  <p>K&#333;do Design Concept &middot; <a href="/kodo-viewer">View in Pencil Viewer</a> &middot; <a href="/kodo-mock">Interactive Mock &#9728;&#9681;</a></p>
  <p style="margin-top:8px;color:#2A4060">RAM Design Heartbeat &middot; ram.zenbin.org &middot; 2026</p>
</footer>
</body>
</html>`;

const penJson = fs.readFileSync('/workspace/group/design-studio/kodo.pen', 'utf8');
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  try {
    console.log('Publishing hero...');
    const h = await publish(SLUG, heroHtml, 'Kōdo — Engineering Intelligence Platform');
    console.log('Hero:', h.url);

    console.log('Publishing viewer...');
    const v = await publish(SLUG + '-viewer', viewerHtml, 'Kōdo — Pencil Viewer');
    console.log('Viewer:', v.url);
    console.log('Done ✓');
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
