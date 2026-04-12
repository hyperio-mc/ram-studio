/**
 * NOCTURN publish pipeline
 * Hero page + viewer + gallery queue + design DB
 */

const fs   = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'nocturn';
const APP_NAME = 'NOCTURN';
const TAGLINE  = 'Protect your deep work';
const ARCHETYPE = 'focus-productivity';
const ORIGINAL_PROMPT = 'Inspired by Dark Mode Design showcase (Midday, Obsidian) — rich dark productivity tools with amber/gold accents, glass card surfaces, and dense information architecture. Dark-mode focus & deep work session tracker for intentional builders.';

const PAL = {
  bg:       '#0B0C0F',
  surface:  '#141519',
  surface2: '#1C1E24',
  border:   'rgba(255,255,255,0.07)',
  text:     '#E8E4DC',
  muted:    'rgba(232,228,220,0.42)',
  accent:   '#F5A623',
  accent2:  '#8B6FFF',
  green:    '#4ECBA0',
};

// ── ZenBin publish helper ─────────────────────────────────────────────────────
function zenPublish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── GitHub helper ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// HERO PAGE
// ─────────────────────────────────────────────────────────────────────────────
function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NOCTURN — Protect your deep work</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0B0C0F;--surface:#141519;--surface2:#1C1E24;
  --text:#E8E4DC;--muted:rgba(232,228,220,0.45);
  --accent:#F5A623;--accent2:#8B6FFF;--green:#4ECBA0;
  --border:rgba(255,255,255,0.07);
}
html{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;scroll-behavior:smooth}
body{min-height:100vh;overflow-x:hidden}

/* ─── Nav ─── */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 5%;height:64px;
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(11,12,15,0.8);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border)}
.logo{font-size:18px;font-weight:800;letter-spacing:.08em;color:var(--text)}
.logo span{color:var(--accent)}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:var(--muted);text-decoration:none;font-size:14px;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#0B0C0F;padding:10px 22px;border-radius:100px;
  font-size:13px;font-weight:700;text-decoration:none;transition:all .2s}
.nav-cta:hover{background:#fbb726;transform:translateY(-1px)}

/* ─── Hero ─── */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:80px 5% 60px;text-align:center;position:relative;overflow:hidden}
.hero-glow{position:absolute;top:-20%;left:50%;transform:translateX(-50%);
  width:700px;height:500px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(245,166,35,0.08) 0%,transparent 65%);pointer-events:none}
.hero-glow2{position:absolute;bottom:-10%;left:20%;
  width:400px;height:400px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(139,111,255,0.06) 0%,transparent 65%);pointer-events:none}
.hero-badge{display:inline-flex;align-items:center;gap:8px;
  border:1px solid rgba(245,166,35,0.25);border-radius:100px;
  padding:6px 16px;font-size:12px;color:var(--accent);margin-bottom:32px;
  background:rgba(245,166,35,0.06)}
.hero-badge::before{content:'●';font-size:8px;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
h1{font-size:clamp(48px,7vw,80px);font-weight:900;line-height:1.05;letter-spacing:-.03em;
  margin-bottom:24px}
h1 .word-focus{color:var(--accent)}
h1 .word-deep{
  background:linear-gradient(135deg,var(--text) 0%,var(--accent2) 80%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{font-size:18px;color:var(--muted);max-width:500px;line-height:1.65;margin-bottom:44px}
.hero-actions{display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:center;margin-bottom:64px}
.btn-primary{background:var(--accent);color:#0B0C0F;padding:16px 36px;border-radius:100px;
  font-size:15px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;
  transition:all .2s;box-shadow:0 8px 32px rgba(245,166,35,0.25)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(245,166,35,0.35)}
.btn-ghost{border:1.5px solid var(--border);color:var(--text);padding:14px 32px;
  border-radius:100px;font-size:15px;text-decoration:none;display:inline-flex;align-items:center;
  gap:8px;transition:all .2s}
.btn-ghost:hover{border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.04)}

/* ─── Phone mockup ─── */
.phone-wrap{position:relative;display:inline-block}
.phone-frame{width:300px;height:620px;border-radius:48px;border:2px solid rgba(255,255,255,0.1);
  background:var(--surface);overflow:hidden;position:relative;
  box-shadow:0 40px 80px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.04),inset 0 1px 0 rgba(255,255,255,0.1)}
.phone-notch{width:80px;height:22px;border-radius:0 0 16px 16px;background:#0B0C0F;
  margin:0 auto;position:relative;z-index:2}
.phone-screen{padding:12px;height:calc(100% - 22px);overflow:hidden}
.screen-status{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);padding:4px 8px}

/* Live session card */
.live-card{background:rgba(245,166,35,0.06);border:1.5px solid rgba(245,166,35,0.2);
  border-radius:16px;padding:14px;margin:8px 0}
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);
  display:inline-block;animation:pulse 1.5s ease-in-out infinite}
.live-label{font-size:9px;font-weight:700;color:var(--accent);letter-spacing:.05em}
.live-time{font-size:32px;font-weight:900;color:var(--text);line-height:1.1;margin:4px 0}
.live-tag{font-size:9px;color:var(--muted)}
.prog-bg{height:4px;border-radius:2px;background:var(--surface2);margin-top:8px;overflow:hidden}
.prog-fill{height:100%;border-radius:2px;background:var(--accent);width:92%}

/* Block items */
.block-item{display:flex;align-items:center;gap:8px;padding:8px 10px;
  background:var(--surface2);border-radius:10px;margin:4px 0}
.block-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.block-dot.done{background:var(--green)}
.block-dot.active{background:var(--accent)}
.block-dot.up{background:var(--surface)}
.block-text{font-size:10px;flex:1}
.block-time{font-size:9px;color:var(--muted)}

/* Glow below phone */
.phone-glow{position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);
  width:260px;height:80px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(245,166,35,0.18) 0%,transparent 70%)}

/* ─── Features ─── */
.section{padding:80px 5%;max-width:1200px;margin:0 auto}
.section-label{font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--accent);
  margin-bottom:16px}
.section-title{font-size:clamp(28px,4vw,44px);font-weight:800;line-height:1.15;
  margin-bottom:16px;letter-spacing:-.02em}
.section-sub{font-size:16px;color:var(--muted);max-width:520px;line-height:1.65;margin-bottom:56px}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.feat-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;
  padding:32px;transition:all .25s}
.feat-card:hover{border-color:rgba(245,166,35,0.2);transform:translateY(-3px);
  box-shadow:0 20px 40px rgba(0,0,0,0.3)}
.feat-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;
  justify-content:center;font-size:22px;margin-bottom:20px}
.feat-icon.amber{background:rgba(245,166,35,0.12)}
.feat-icon.violet{background:rgba(139,111,255,0.12)}
.feat-icon.green{background:rgba(78,203,160,0.12)}
.feat-title{font-size:17px;font-weight:700;margin-bottom:8px}
.feat-desc{font-size:14px;color:var(--muted);line-height:1.65}

/* ─── Metrics ─── */
.metrics-section{padding:60px 5%;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.metrics-inner{max-width:1200px;margin:0 auto;display:grid;
  grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:2px}
.metric{padding:40px 32px;text-align:center}
.metric-val{font-size:44px;font-weight:900;color:var(--accent);letter-spacing:-.03em;line-height:1}
.metric-label{font-size:13px;color:var(--muted);margin-top:8px}

/* ─── How it works ─── */
.steps-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-top:48px}
.step{padding:24px;background:var(--surface);border:1px solid var(--border);border-radius:20px}
.step-num{font-size:13px;font-weight:700;color:var(--accent);letter-spacing:.05em;margin-bottom:12px}
.step-title{font-size:16px;font-weight:700;margin-bottom:8px}
.step-desc{font-size:13px;color:var(--muted);line-height:1.6}

/* ─── CTA ─── */
.cta-section{padding:120px 5%;text-align:center;position:relative;overflow:hidden}
.cta-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:600px;height:400px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(245,166,35,0.07) 0%,transparent 60%);pointer-events:none}
.cta-badge{background:rgba(245,166,35,0.1);color:var(--accent);border:1px solid rgba(245,166,35,0.2);
  border-radius:100px;padding:8px 20px;font-size:12px;font-weight:600;
  display:inline-block;margin-bottom:32px}
.cta-title{font-size:clamp(32px,5vw,56px);font-weight:900;margin-bottom:20px;letter-spacing:-.03em}
.cta-sub{font-size:17px;color:var(--muted);margin-bottom:48px}

/* ─── Footer ─── */
footer{padding:40px 5%;border-top:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
.footer-credit{font-size:12px;color:var(--muted)}
.footer-credit a{color:var(--accent);text-decoration:none}
</style>
</head>
<body>

<nav>
  <div class="logo">NOCT<span>URN</span></div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#how">How it works</a></li>
    <li><a href="#stats">Stats</a></li>
  </ul>
  <a class="nav-cta" href="https://ram.zenbin.org/nocturn-viewer">View Design</a>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>
  <div class="hero-badge">Deep Work Companion · Now in Beta</div>
  <h1>
    <span class="word-focus">Focus</span> like<br>
    your work is<br><span class="word-deep">sacred</span>
  </h1>
  <p class="hero-sub">NOCTURN guards your most important hours. Plan deep work blocks, track focus sessions, and watch your craft compound over time.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/nocturn-mock">Try the Mock ↗</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/nocturn-viewer">View Design File</a>
  </div>

  <!-- Phone mockup -->
  <div class="phone-wrap">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="screen-status"><span>9:41</span><span>●●● 100%</span></div>
        <div style="padding:0 4px">
          <div style="font-size:11px;color:rgba(232,228,220,0.4);margin-bottom:2px">Sunday</div>
          <div style="font-size:20px;font-weight:800;margin-bottom:12px">March 22</div>

          <div class="live-card">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <div class="live-dot"></div>
              <span class="live-label">DEEP WORK IN PROGRESS</span>
            </div>
            <div class="live-time">2:47:13</div>
            <div class="live-tag">of 3h 00m goal · Product Design</div>
            <div class="prog-bg"><div class="prog-fill"></div></div>
          </div>

          <div style="font-size:9px;font-weight:700;color:rgba(232,228,220,0.42);letter-spacing:.06em;margin:12px 0 6px">TODAY'S BLOCKS</div>
          <div class="block-item">
            <div class="block-dot done"></div>
            <div>
              <div class="block-text" style="color:#E8E4DC">Inbox zero + planning</div>
              <div class="block-time">08:00 – 09:00</div>
            </div>
          </div>
          <div class="block-item" style="border:1px solid rgba(245,166,35,0.2);background:rgba(245,166,35,0.06)">
            <div class="block-dot active"></div>
            <div>
              <div class="block-text" style="color:#F5A623;font-weight:600">Product Design</div>
              <div class="block-time">09:30 – 12:30</div>
            </div>
          </div>
          <div class="block-item">
            <div class="block-dot up"></div>
            <div>
              <div class="block-text" style="color:rgba(232,228,220,0.5)">Code review & shipping</div>
              <div class="block-time">14:00 – 16:00</div>
            </div>
          </div>
          <div class="block-item">
            <div class="block-dot up"></div>
            <div>
              <div class="block-text" style="color:rgba(232,228,220,0.5)">Writing & thinking</div>
              <div class="block-time">16:30 – 18:00</div>
            </div>
          </div>

          <div style="display:flex;gap:6px;margin-top:12px">
            <div style="background:var(--surface2);border-radius:100px;padding:6px 12px;font-size:10px">🔥 14 day streak</div>
            <div style="background:var(--surface2);border-radius:100px;padding:6px 12px;font-size:10px;color:var(--accent)">⚡ 5.2h today</div>
          </div>
        </div>
      </div>
    </div>
    <div class="phone-glow"></div>
  </div>
</section>

<!-- Metrics bar -->
<div class="metrics-section">
  <div class="metrics-inner">
    <div class="metric"><div class="metric-val">4.9h</div><div class="metric-label">Avg deep work per day</div></div>
    <div class="metric"><div class="metric-val">84</div><div class="metric-label">Focus score (top 12%)</div></div>
    <div class="metric"><div class="metric-val">14d</div><div class="metric-label">Current streak</div></div>
    <div class="metric"><div class="metric-val">412h</div><div class="metric-label">Total hours logged</div></div>
  </div>
</div>

<!-- Features -->
<section class="section" id="features">
  <div class="section-label">FEATURES</div>
  <h2 class="section-title">Everything that<br>matters for focus</h2>
  <p class="section-sub">Built for makers who treat their attention as their most valuable asset.</p>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon amber">⬡</div>
      <div class="feat-title">Daily Focus Blocks</div>
      <div class="feat-desc">Design your day in intentional time blocks. Nocturn tracks which are active, done, and upcoming — all at a glance.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon violet">◈</div>
      <div class="feat-title">Session History</div>
      <div class="feat-desc">Every deep work session is logged with its project, duration, and tag. Your work becomes a beautiful ledger of effort.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon green">◉</div>
      <div class="feat-title">Weekly Analytics</div>
      <div class="feat-desc">Visualise your focus patterns across the week. Spot your peak windows and protect them — ruthlessly.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon amber">▣</div>
      <div class="feat-title">Project Allocation</div>
      <div class="feat-desc">See exactly where your hours go across projects. Balance matters — Nocturn makes it visible.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon violet">●</div>
      <div class="feat-title">Focus Score</div>
      <div class="feat-desc">A single number that tells the truth about your week. Insight-driven nudges help you move it upward.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon green">◷</div>
      <div class="feat-title">Streak & Momentum</div>
      <div class="feat-desc">Consistency is the compound interest of craft. Nocturn keeps your streak alive and makes it feel real.</div>
    </div>
  </div>
</section>

<!-- How it works -->
<section class="section" id="how" style="padding-top:40px">
  <div class="section-label">HOW IT WORKS</div>
  <h2 class="section-title">Simple by design,<br>powerful by habit</h2>
  <div class="steps-grid">
    <div class="step"><div class="step-num">01 — PLAN</div><div class="step-title">Block your day</div><div class="step-desc">Set focused time blocks each morning. Assign projects, durations, and a type to each slot.</div></div>
    <div class="step"><div class="step-num">02 — FOCUS</div><div class="step-title">Start a session</div><div class="step-desc">Hit start when you're ready. Nocturn tracks elapsed time, progress against your goal, and keeps the rest of your phone quiet.</div></div>
    <div class="step"><div class="step-num">03 — REVIEW</div><div class="step-title">See your output</div><div class="step-desc">At day's end, see exactly what you shipped. Sessions are logged automatically — no friction.</div></div>
    <div class="step"><div class="step-num">04 — COMPOUND</div><div class="step-title">Watch it build</div><div class="step-desc">Weekly stats, focus scores, and streak data show you compounding over time. Your attention becomes your edge.</div></div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-glow"></div>
  <div class="cta-badge">Free to try · No account needed</div>
  <div class="cta-title">Your best work<br>starts here</div>
  <p class="cta-sub">Join builders who protect their most important hours.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a class="btn-primary" href="https://ram.zenbin.org/nocturn-mock">Explore Mock ↗</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/nocturn-viewer">View Design</a>
  </div>
</section>

<footer>
  <div class="footer-credit">Designed by <a href="https://ram.zenbin.org">RAM</a> · Deep work companion concept</div>
  <div class="footer-credit">Inspired by <a href="https://www.darkmodedesign.com" target="_blank">Dark Mode Design</a> · Midday + Obsidian</div>
</footer>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWER PAGE
// ─────────────────────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('── NOCTURN publish pipeline ──');

  // 1. Hero
  console.log('\n[1/4] Publishing hero page...');
  const heroHtml = buildHeroHtml();
  try {
    const r = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
    console.log(`  ✓ Hero live → https://ram.zenbin.org/${SLUG}  (HTTP ${r.status})`);
  } catch(e) { console.error('  ✗ Hero failed:', e.message); }

  // 2. Viewer
  console.log('\n[2/4] Publishing viewer...');
  const penJson = fs.readFileSync('nocturn.pen', 'utf8');
  try {
    const viewerHtml = buildViewerHtml(penJson);
    const r = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Viewer`);
    console.log(`  ✓ Viewer live → https://ram.zenbin.org/${SLUG}-viewer  (HTTP ${r.status})`);
  } catch(e) {
    console.error('  ✗ Viewer failed:', e.message);
  }

  // 3. Gallery queue
  console.log('\n[3/4] Pushing to GitHub gallery queue...');
  const config = JSON.parse(fs.readFileSync('community-config.json', 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  try {
    const getRes = await ghReq({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/queue.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
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
      viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
      mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
      submitted_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      credit: 'RAM Design Heartbeat',
      prompt: ORIGINAL_PROMPT,
      screens: 5,
      source: 'heartbeat',
      theme: 'dark',
      palette: { bg: '#0B0C0F', accent: '#F5A623', accent2: '#8B6FFF' },
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
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putBody),
        'Accept': 'application/vnd.github.v3+json',
      },
    }, putBody);
    console.log('  ✓ Gallery queue updated:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));

    // Save entry for DB step
    fs.writeFileSync('/tmp/nocturn-entry.json', JSON.stringify(newEntry, null, 2));
  } catch(e) { console.error('  ✗ Gallery failed:', e.message); }

  console.log('\n[4/4] Design DB indexing deferred to separate ESM step.');
  console.log('\n── Done ──');
  console.log(`  Hero    → https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer  → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock    → https://ram.zenbin.org/${SLUG}-mock (publish separately)`);
}

main().catch(console.error);
