/**
 * NOX — AI Sleep Intelligence
 * Full Design Discovery Pipeline: Hero + Viewer + Gallery queue
 * RAM Design Heartbeat — Mar 28 2026
 *
 * Inspired by: Lapa Ninja "Dawn" AI mental health (warm+dark palette fusion)
 *              Lapa Ninja Air agent dashboard (dark terminal, electric accent)
 *              Dark Mode Design: Midday SaaS — dark editorial hierarchy
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'nox';
const APP       = 'Nox';
const TAGLINE   = 'AI sleep intelligence, decoded nightly';
const ARCHETYPE = 'sleep-health-dark';
const PROMPT    = 'Inspired by Lapa Ninja "Dawn" AI mental health (warm+dark palette fusion), Air agent dashboard, and Dark Mode Design: Midday. Dark theme. Midnight navy #070B14 + periwinkle #6C7EFF + warm coral #FF8A6B + teal-mint #44D9A4. Sleep stage wave viz, 30-day heatmap, AI insight cards, wind-down checklist. 5 screens: Tonight readiness, Sleep analysis, AI insights, Routine, History.';

const P = {
  bg:      '#070B14',
  surface: '#0D1426',
  text:    '#E4E9F5',
  textMid: '#8A94B5',
  accent:  '#6C7EFF',
  accent2: '#FF8A6B',
  accent3: '#44D9A4',
};

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const buf  = Buffer.from(body);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': buf.length,
        'X-Subdomain': 'ram',
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          resolve(parsed.url ? parsed : { url: `https://ram.zenbin.org/${slug}` });
        } catch { resolve({ url: `https://ram.zenbin.org/${slug}` }); }
      });
    });
    req.on('error', reject);
    req.write(buf); req.end();
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

function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nox — AI sleep intelligence, decoded nightly</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#070B14;--surf:#0D1426;--text:#E4E9F5;--mid:#8A94B5;
  --acc:#6C7EFF;--acc2:#FF8A6B;--acc3:#44D9A4;
  --border:rgba(108,126,255,0.15);
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}
body::before{
  content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(ellipse 60% 40% at 20% 20%,rgba(108,126,255,0.09) 0%,transparent 70%),
    radial-gradient(ellipse 50% 30% at 80% 70%,rgba(255,138,107,0.07) 0%,transparent 60%),
    radial-gradient(ellipse 40% 50% at 50% 50%,rgba(68,217,164,0.04) 0%,transparent 70%)
}
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:64px;
  background:rgba(7,11,20,0.85);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border)
}
.logo{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:700;color:var(--text);text-decoration:none;letter-spacing:-0.5px}
.logo-mark{
  width:32px;height:32px;border-radius:50%;
  background:conic-gradient(from 200deg,var(--acc) 0%,var(--acc2) 55%,var(--acc3) 100%);
  display:flex;align-items:center;justify-content:center;font-size:14px
}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{color:var(--mid);text-decoration:none;font-size:14px;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.btn{
  background:var(--acc);color:#fff;border:none;
  padding:10px 22px;border-radius:100px;font-size:14px;font-weight:600;
  cursor:pointer;text-decoration:none;transition:opacity .2s,transform .2s;display:inline-block
}
.btn:hover{opacity:.88;transform:translateY(-1px)}
.btn-ghost{color:var(--mid);text-decoration:none;font-size:14px;display:flex;align-items:center;gap:6px;transition:color .2s}
.btn-ghost:hover{color:var(--text)}

.hero{
  position:relative;z-index:1;
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:120px 40px 80px;text-align:center
}
.badge{
  display:inline-flex;align-items:center;gap:8px;
  background:rgba(108,126,255,0.12);border:1px solid rgba(108,126,255,0.25);
  border-radius:100px;padding:6px 16px;font-size:12px;
  color:var(--acc);letter-spacing:1px;text-transform:uppercase;
  font-weight:600;margin-bottom:36px
}
h1{
  font-size:clamp(56px,9vw,104px);font-weight:800;
  letter-spacing:-3px;line-height:.92;
  background:linear-gradient(135deg,var(--text) 0%,var(--acc) 55%,var(--acc2) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;margin-bottom:28px
}
.sub{font-size:18px;color:var(--mid);max-width:500px;line-height:1.6;margin-bottom:48px}
.cta{display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap}

.phones{
  position:relative;z-index:1;
  display:flex;justify-content:center;gap:20px;
  padding:0 40px 100px;flex-wrap:wrap;align-items:flex-start
}
.phone{
  width:200px;border-radius:28px;
  border:2px solid rgba(108,126,255,0.2);
  background:var(--surf);overflow:hidden;flex-shrink:0;
  box-shadow:0 24px 80px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.03);
  transition:transform .3s
}
.phone:hover{transform:translateY(-6px) rotate(.5deg)}
.phone:nth-child(2){transform:translateY(28px)}
.phone:nth-child(2):hover{transform:translateY(20px) rotate(-0.5deg)}
.phone:nth-child(3){transform:translateY(14px)}
.phone:nth-child(3):hover{transform:translateY(6px) rotate(.3deg)}
.pscreen{
  width:100%;aspect-ratio:390/852;
  background:linear-gradient(180deg,#070B14 0%,#0D1426 100%);
  padding:14px 12px;font-size:8px;display:flex;flex-direction:column
}
.pstatus{display:flex;justify-content:space-between;color:var(--mid);margin-bottom:8px}
.ptitle{font-size:13px;font-weight:700;margin-bottom:2px}
.psub{font-size:8px;color:var(--mid);margin-bottom:10px}
.pscore{text-align:center;margin:4px 0 12px}
.pscore-n{font-size:38px;font-weight:800;color:var(--acc);line-height:1}
.pscore-l{font-size:7px;color:var(--mid);letter-spacing:1.5px}
.pcard{
  background:var(--surf);border:1px solid var(--border);
  border-radius:8px;padding:6px 8px;margin-bottom:6px
}
.pcard-l{font-size:7px;color:var(--mid);margin-bottom:2px}
.pcard-v{font-size:11px;font-weight:700}
.pwave{display:flex;gap:1px;height:20px;border-radius:3px;overflow:hidden;margin-bottom:8px}
.pw-seg{height:100%}
.pins{background:rgba(108,126,255,0.1);border:1px solid rgba(108,126,255,0.2);border-radius:6px;padding:6px;font-size:7px;color:var(--mid)}

.stats{
  position:relative;z-index:1;
  border-top:1px solid var(--border);border-bottom:1px solid var(--border);
  display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
  max-width:960px;margin:0 auto
}
.stat{padding:44px 36px;text-align:center}
.stat+.stat{border-left:1px solid var(--border)}
.stat-v{font-size:44px;font-weight:800;letter-spacing:-2px;margin-bottom:6px}
.stat-l{font-size:12px;color:var(--mid)}

.features{
  position:relative;z-index:1;
  max-width:1040px;margin:0 auto;padding:100px 40px
}
.eyebrow{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--acc);font-weight:600;margin-bottom:14px}
h2{font-size:clamp(30px,4vw,46px);font-weight:700;letter-spacing:-1.5px;margin-bottom:56px;color:var(--text)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.fcard{
  background:var(--surf);border:1px solid var(--border);
  border-radius:18px;padding:28px;
  transition:border-color .3s,transform .3s
}
.fcard:hover{border-color:rgba(108,126,255,.4);transform:translateY(-3px)}
.ficon{
  width:44px;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;margin-bottom:16px
}
.fcard h3{font-size:16px;font-weight:700;margin-bottom:8px}
.fcard p{font-size:13px;color:var(--mid);line-height:1.6}

.vcta{position:relative;z-index:1;text-align:center;padding:80px 40px 120px}
.vcta h2{font-size:34px;font-weight:700;letter-spacing:-1px;margin-bottom:14px}
.vcta p{color:var(--mid);font-size:15px;margin-bottom:32px}
.bgroup{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

footer{
  position:relative;z-index:1;
  border-top:1px solid var(--border);
  padding:28px 40px;display:flex;justify-content:space-between;
  align-items:center;flex-wrap:wrap;gap:14px
}
footer p{font-size:12px;color:var(--mid)}
.ram{color:var(--acc);font-weight:600}

@media(max-width:640px){
  nav{padding:0 20px}
  .nav-links{display:none}
  .hero{padding:100px 20px 60px}
  .phone:nth-child(2),.phone:nth-child(3){display:none}
  .stat+.stat{border-left:none;border-top:1px solid var(--border)}
}
</style>
</head>
<body>
<nav>
  <a href="#" class="logo">
    <div class="logo-mark">◐</div>Nox
  </a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="nox-viewer">Design</a>
    <a href="nox-mock">Interactive</a>
  </div>
  <a href="nox-mock" class="btn">Try Mock →</a>
</nav>

<section class="hero">
  <div class="badge">◐ AI Sleep Intelligence</div>
  <h1>Sleep<br>Decoded.</h1>
  <p class="sub">Nox analyzes your sleep architecture nightly, learns your patterns, and gives you precise guidance — not generic tips.</p>
  <div class="cta">
    <a href="nox-mock" class="btn">Explore Interactive Mock →</a>
    <a href="nox-viewer" class="btn-ghost">View full design ↗</a>
  </div>
</section>

<section class="phones">
  <div class="phone">
    <div class="pscreen">
      <div class="pstatus"><span>11:42</span><span>●●●</span></div>
      <div class="ptitle">Tonight</div>
      <div class="psub">Saturday, March 28</div>
      <div class="pscore">
        <div class="pscore-n">84</div>
        <div class="pscore-l">SLEEP SCORE</div>
      </div>
      <div class="pcard" style="background:rgba(108,126,255,0.08);border-color:rgba(108,126,255,0.2)">
        <div class="pcard-l">◐ Recommended bedtime</div>
        <div class="pcard-v" style="color:#6C7EFF">10:45 PM</div>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:6px">
        <div class="pcard" style="flex:1"><div class="pcard-l">Wake</div><div class="pcard-v">6:45 AM</div></div>
        <div class="pcard" style="flex:1"><div class="pcard-l">Debt</div><div class="pcard-v" style="color:#FF8A6B">−23m</div></div>
      </div>
      <div class="pins">✦ HRV recovered well. Ideal for deep sleep tonight.</div>
    </div>
  </div>
  <div class="phone">
    <div class="pscreen">
      <div class="pstatus"><span>11:42</span><span>●●●</span></div>
      <div class="ptitle">Last Night</div>
      <div class="psub">10:58 PM – 6:42 AM</div>
      <div style="display:flex;gap:4px;margin-bottom:8px">
        <div class="pcard" style="flex:1;padding:4px 6px"><div class="pcard-l">Duration</div><div class="pcard-v" style="font-size:9px;color:#44D9A4">7h 44m</div></div>
        <div class="pcard" style="flex:1;padding:4px 6px"><div class="pcard-l">Efficiency</div><div class="pcard-v" style="font-size:9px;color:#6C7EFF">91%</div></div>
        <div class="pcard" style="flex:1;padding:4px 6px"><div class="pcard-l">Interrupts</div><div class="pcard-v" style="font-size:9px">2</div></div>
      </div>
      <div style="font-size:7px;color:var(--mid);margin-bottom:4px;font-weight:600">SLEEP STAGES</div>
      <div class="pwave">
        <div class="pw-seg" style="background:#FF8A6B;width:5%"></div>
        <div class="pw-seg" style="background:#6C7EFF;width:45%"></div>
        <div class="pw-seg" style="background:#3A4FCC;width:20%"></div>
        <div class="pw-seg" style="background:#44D9A4;width:30%"></div>
      </div>
      <div class="pcard" style="margin-bottom:6px"><div class="pcard-l">Deep Sleep</div><div class="pcard-v" style="color:#3A4FCC">1h 33m · 20%</div></div>
      <div class="pcard"><div class="pcard-l">REM</div><div class="pcard-v" style="color:#44D9A4">2h 19m · 30%</div></div>
    </div>
  </div>
  <div class="phone">
    <div class="pscreen">
      <div class="pstatus"><span>11:42</span><span>●●●</span></div>
      <div class="ptitle">Insights</div>
      <div class="psub">Patterns Nox has learned</div>
      <div class="pcard" style="margin-bottom:6px;border-color:rgba(108,126,255,0.25)">
        <div style="font-size:7px;color:#6C7EFF;font-weight:600">◑ INSIGHT · NEW</div>
        <div style="font-size:9px;font-weight:600;margin:3px 0 2px">Consistent bedtime = deeper sleep</div>
        <div style="font-size:7px;color:var(--mid)">4 nights before 11pm → deep avg 22%</div>
      </div>
      <div class="pcard" style="margin-bottom:6px;border-color:rgba(255,138,107,0.2)">
        <div style="font-size:7px;color:#FF8A6B;font-weight:600">◐ PATTERN</div>
        <div style="font-size:9px;font-weight:600;margin:3px 0 2px">Evening exercise shortens REM</div>
        <div style="font-size:7px;color:var(--mid)">Workouts after 7pm → 14% less REM</div>
      </div>
      <div class="pcard" style="border-color:rgba(68,217,164,0.2)">
        <div style="font-size:7px;color:#44D9A4;font-weight:600">✦ PROGRESS</div>
        <div style="font-size:9px;font-weight:600;margin:3px 0 2px">Weekend recovery improving</div>
        <div style="font-size:7px;color:var(--mid)">Saturday quality up 3 weeks in a row</div>
      </div>
    </div>
  </div>
</section>

<div class="stats">
  <div class="stat"><div class="stat-v" style="color:#6C7EFF">84</div><div class="stat-l">Sleep score tonight</div></div>
  <div class="stat"><div class="stat-v" style="color:#44D9A4">7h44</div><div class="stat-l">Last night's total</div></div>
  <div class="stat"><div class="stat-v" style="color:#FF8A6B">91%</div><div class="stat-l">Sleep efficiency</div></div>
  <div class="stat"><div class="stat-v">5</div><div class="stat-l">Screens designed</div></div>
</div>

<section class="features" id="features">
  <div class="eyebrow">What Nox does</div>
  <h2>Intelligence that works<br>while you sleep.</h2>
  <div class="grid">
    <div class="fcard">
      <div class="ficon" style="background:rgba(108,126,255,0.12)">◐</div>
      <h3>Nightly readiness score</h3>
      <p>A single 0–100 score reflecting sleep quality, HRV recovery, and next-day readiness — with full explanation.</p>
    </div>
    <div class="fcard">
      <div class="ficon" style="background:rgba(68,217,164,0.12)">◑</div>
      <h3>Sleep stage architecture</h3>
      <p>Visual wave timeline of deep, REM, and light sleep cycles. See how your lifestyle choices reshape each stage.</p>
    </div>
    <div class="fcard">
      <div class="ficon" style="background:rgba(255,138,107,0.12)">✦</div>
      <h3>AI pattern insights</h3>
      <p>Nox detects correlations across weeks — linking behaviour patterns to sleep outcomes specific to you, not averages.</p>
    </div>
    <div class="fcard">
      <div class="ficon" style="background:rgba(108,126,255,0.12)">◈</div>
      <h3>Personalised wind-down</h3>
      <p>A nightly checklist adapted to your schedule, emphasising the habits your data says matter most for your sleep.</p>
    </div>
    <div class="fcard">
      <div class="ficon" style="background:rgba(68,217,164,0.12)">◉</div>
      <h3>30-day heatmap</h3>
      <p>Spot your best and worst nights at a glance. Track progress over weeks rather than one night at a time.</p>
    </div>
    <div class="fcard">
      <div class="ficon" style="background:rgba(255,138,107,0.12)">◐</div>
      <h3>Bedtime precision</h3>
      <p>Calculated ideal sleep and wake windows based on your chronotype, current sleep debt, and next-day demands.</p>
    </div>
  </div>
</section>

<section class="vcta">
  <h2>See every screen.</h2>
  <p>Browse the full interactive prototype or step through the Pencil viewer.</p>
  <div class="bgroup">
    <a href="nox-mock" class="btn">Interactive mock ☀◑</a>
    <a href="nox-viewer" class="btn-ghost" style="color:var(--mid);text-decoration:none">Pencil viewer →</a>
  </div>
</section>

<footer>
  <p>Nox — AI Sleep Intelligence · <span class="ram">RAM Design</span> · March 2026</p>
  <p>Inspired by Dawn (lapa.ninja) · Air agent dashboard · Dark Mode Design: Midday</p>
</footer>
</body>
</html>`;
}

(async () => {
  console.log('🌑 NOX — Publishing Design Discovery Pipeline');

  const penPath = path.join(__dirname, 'nox.pen');
  if (!fs.existsSync(penPath)) { console.error('❌ nox.pen not found'); process.exit(1); }
  const penJson = fs.readFileSync(penPath, 'utf8');

  // Hero
  console.log('\n① Hero → ram.zenbin.org/nox');
  const heroRes = await publish('nox', buildHero(), 'Nox — AI sleep intelligence');
  console.log('   ', heroRes.url);

  // Viewer
  console.log('\n② Viewer → ram.zenbin.org/nox-viewer');
  let viewerHtml;
  try {
    viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
    const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } catch {
    viewerHtml = `<html><body style="background:#070B14;color:#E4E9F5;font-family:sans-serif;padding:40px"><h1>Nox Viewer</h1><script>window.EMBEDDED_PEN=${JSON.stringify(penJson)}<\/script></body></html>`;
  }
  const viewerRes = await publish('nox-viewer', viewerHtml, 'Nox — Design Viewer');
  console.log('   ', viewerRes.url);

  // Gallery queue
  console.log('\n③ Gallery queue → GitHub');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
    app_name: APP,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);
  console.log('   Queue:', putRes.status === 200 ? '✓ OK' : `⚠ ${putRes.status}`);

  fs.writeFileSync(path.join(__dirname, 'nox-entry.json'), JSON.stringify(newEntry, null, 2));
  console.log('\n✅ Done!');
  console.log(`   https://ram.zenbin.org/nox`);
  console.log(`   https://ram.zenbin.org/nox-viewer`);
  console.log(`   (mock → run nox-mock.mjs next)`);
})();
