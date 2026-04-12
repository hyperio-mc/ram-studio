'use strict';
// halo-publish-all.js — Full Design Discovery pipeline for HALO
// HALO — Circadian health companion
// Theme: LIGHT · Slug: halo

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'halo';
const APP_NAME  = 'Halo';
const TAGLINE   = 'Your body\'s natural rhythm, made visible';
const ARCHETYPE = 'health-wellness-companion';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Light-themed circadian health companion app. Inspired by Voy "Your Proactive Companion for Healthy Living" (most-saved on land-book.com, 17 saves) combined with Overlay\'s 2026 trend of editorial serif (PP Editorial Old style) on warm cream/white with gradient accents (tagged White, Serif Fonts, Gradient on lapa.ninja). Warm cream palette #FAF7F2, terra cotta #C8714A accent, sage green #4E7C51, bento-grid card layouts, circadian energy forecast bar chart, sleep stages visualization.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'halo.pen'), 'utf8');

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

async function zenPut(slug, title, html) {
  const payload = JSON.stringify({ title, html });
  const res = await req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'X-Subdomain': SUBDOMAIN,
    },
  }, payload);
  return res;
}

// ── Light palette ──────────────────────────────────────────────────────────────
const P = {
  bg:         '#FAF7F2',
  surface:    '#FFFFFF',
  surface2:   '#F3EFE8',
  border:     'rgba(28,25,23,0.08)',
  text:       '#1C1917',
  textMid:    'rgba(28,25,23,0.55)',
  textSoft:   'rgba(28,25,23,0.35)',
  accent:     '#C8714A',
  accentDim:  'rgba(200,113,74,0.10)',
  green:      '#4E7C51',
  greenDim:   'rgba(78,124,81,0.12)',
  blush:      '#D4A49A',
  blushDim:   'rgba(212,164,154,0.15)',
  amber:      '#D4A835',
  amberDim:   'rgba(212,168,53,0.12)',
};

// ── Hero page ─────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Halo — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="Halo is a circadian health companion that shows you when to focus, exercise, and sleep based on your body's natural rhythms.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${P.bg};--surface:${P.surface};--surface2:${P.surface2};
  --border:${P.border};--text:${P.text};--muted:${P.textMid};--soft:${P.textSoft};
  --accent:${P.accent};--accent-dim:${P.accentDim};
  --green:${P.green};--green-dim:${P.greenDim};
  --blush:${P.blush};--amber:${P.amber};
}
html{scroll-behavior:smooth}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:rgba(250,247,242,0.90);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-logo{font-family:'Lora',Georgia,serif;font-size:22px;font-weight:400;color:var(--text);text-decoration:none;letter-spacing:-0.3px}
.nav-logo span{color:var(--accent)}
.nav-links{display:flex;gap:32px;align-items:center}
.nav-links a{font-size:14px;color:var(--muted);text-decoration:none;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#fff;padding:10px 22px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;transition:opacity .2s}
.nav-cta:hover{opacity:.88;color:#fff}

/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 40px 80px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-160px;left:50%;transform:translateX(-50%);width:900px;height:700px;background:radial-gradient(ellipse,rgba(200,113,74,0.07) 0%,transparent 65%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(ellipse,rgba(78,124,81,0.06) 0%,transparent 70%);pointer-events:none}
.hero-chip{display:inline-flex;align-items:center;gap:8px;background:var(--accent-dim);border:1px solid rgba(200,113,74,0.18);padding:6px 16px;border-radius:50px;font-size:11px;font-weight:600;color:var(--accent);letter-spacing:.07em;text-transform:uppercase;margin-bottom:32px}
.hero-title{font-family:'Lora',Georgia,serif;font-size:clamp(52px,8vw,100px);font-weight:400;letter-spacing:-3px;line-height:1.04;color:var(--text);margin-bottom:28px}
.hero-title em{color:var(--accent);font-style:italic}
.hero-sub{font-size:clamp(16px,2vw,20px);color:var(--muted);max-width:500px;margin:0 auto 52px;font-weight:400;line-height:1.6}
.hero-actions{display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#fff;padding:16px 36px;border-radius:50px;font-size:16px;font-weight:600;text-decoration:none;transition:opacity .2s;box-shadow:0 8px 32px rgba(200,113,74,0.22)}
.btn-primary:hover{opacity:.88}
.btn-ghost{background:transparent;color:var(--text);padding:16px 36px;border-radius:50px;font-size:16px;font-weight:500;text-decoration:none;border:1.5px solid var(--border);transition:border-color .2s}
.btn-ghost:hover{border-color:rgba(28,25,23,0.22)}

/* PHONES */
.phones-section{padding:72px 40px 80px;display:flex;justify-content:center;align-items:flex-end;gap:20px;overflow:hidden;flex-wrap:wrap}
.phone{width:196px;background:var(--surface);border-radius:28px;box-shadow:0 20px 60px rgba(28,25,23,0.09);overflow:hidden;transition:transform .3s;flex-shrink:0}
.phone:hover{transform:translateY(-6px)}
.phone.hero-phone{width:220px;box-shadow:0 28px 72px rgba(200,113,74,0.18)}
.phone-label{font-size:9px;font-weight:600;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;padding:14px 16px 4px}

/* Score card */
.score-card{margin:0 12px 10px;background:var(--accent);border-radius:14px;padding:16px}
.score-card-label{font-size:8px;font-weight:600;opacity:.7;letter-spacing:.08em;text-transform:uppercase;color:#fff}
.score-card-val{font-family:'Lora',Georgia,serif;font-size:48px;font-weight:400;letter-spacing:-2px;color:#fff;margin:2px 0 4px}
.score-badge{display:inline-block;background:rgba(255,255,255,0.18);padding:3px 10px;border-radius:10px;font-size:10px;font-weight:600;color:#fff}
.mini-grid{display:flex;gap:6px;padding:0 12px 12px}
.mini-tile{flex:1;background:${P.surface2};border-radius:10px;padding:8px}
.mini-tile-val{font-family:'Lora',serif;font-size:14px;color:var(--text)}
.mini-tile-lbl{font-size:8px;color:var(--muted);margin-top:1px}
.mini-bar-bg{height:3px;background:var(--border);border-radius:2px;margin-top:5px}
.mini-bar-fill{height:3px;border-radius:2px}

/* Rhythm card */
.rhythm-head{padding:12px 14px 6px;font-family:'Lora',serif;font-size:22px;letter-spacing:-.5px;line-height:1.2}
.rhythm-head span{color:var(--accent)}
.energy-chart{margin:0 12px 10px;background:var(--surface);border-radius:12px;padding:10px}
.chart-label{font-size:8px;font-weight:600;color:var(--muted);letter-spacing:.06em;margin-bottom:6px}
.bar-row{display:flex;align-items:flex-end;gap:2px;height:32px}
.bar-row div{flex:1;border-radius:3px}
.time-row{display:flex;gap:2px;margin-top:3px}
.time-row span{flex:1;font-size:6px;color:var(--soft);text-align:center}
.window-card{margin:0 12px 8px;background:var(--surface2);border-radius:10px;padding:10px;border-left:3px solid var(--accent)}
.window-title{font-family:'Lora',serif;font-size:13px;color:var(--text)}
.window-time{font-size:10px;color:var(--muted);margin-top:2px}

/* Sleep card */
.sleep-hero{margin:0 12px 10px;background:#1C1917;border-radius:14px;padding:16px;color:#fff}
.sleep-score{font-family:'Lora',serif;font-size:48px;font-weight:400;letter-spacing:-2px}
.sleep-sub{font-size:10px;opacity:.55;margin-top:2px}
.stage-list{padding:0 12px 12px}
.stage-row{display:flex;align-items:center;gap:6px;margin-bottom:5px}
.stage-name{font-size:9px;color:var(--muted);font-weight:500;width:34px}
.stage-track{flex:1;height:5px;background:var(--border);border-radius:3px;overflow:hidden}
.stage-bar{height:5px;border-radius:3px}
.stage-pct{font-size:9px;color:var(--muted);width:22px;text-align:right}

/* STATS */
.stats{padding:80px 40px;background:${P.surface2};text-align:center}
.stats-row{display:flex;justify-content:center;gap:80px;flex-wrap:wrap;gap:48px}
.stat-val{font-family:'Lora',serif;font-size:56px;font-weight:400;letter-spacing:-2px;color:var(--accent)}
.stat-lbl{font-size:14px;color:var(--muted);margin-top:6px}

/* FEATURES */
.features{padding:100px 40px;max-width:1100px;margin:0 auto}
.section-eyebrow{text-align:center;font-size:10px;font-weight:600;color:var(--accent);letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
.section-title{text-align:center;font-family:'Lora',serif;font-size:clamp(32px,4vw,52px);font-weight:400;letter-spacing:-1.5px;color:var(--text);margin-bottom:64px}
.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.feature-card{background:var(--surface);border-radius:20px;padding:32px;box-shadow:0 2px 16px rgba(28,25,23,0.05);transition:transform .2s,box-shadow .2s}
.feature-card:hover{transform:translateY(-4px);box-shadow:0 8px 32px rgba(28,25,23,0.08)}
.fi{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px}
.ft{font-family:'Lora',serif;font-size:20px;font-weight:400;letter-spacing:-.3px;margin-bottom:8px;color:var(--text)}
.fd{font-size:14px;color:var(--muted);line-height:1.65}

/* INSIGHT */
.insight-section{padding:80px 40px;max-width:1100px;margin:0 auto}
.insight-card{background:${P.text};border-radius:24px;padding:60px;position:relative;overflow:hidden}
.insight-card::after{content:'✦';position:absolute;right:60px;top:50px;font-size:130px;color:rgba(200,113,74,0.08);font-family:serif;line-height:1}
.insight-eyebrow{font-size:10px;font-weight:600;color:var(--accent);letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px}
.insight-quote{font-family:'Lora',serif;font-size:clamp(22px,3vw,36px);font-weight:400;line-height:1.4;color:#fff;max-width:620px;letter-spacing:-.3px}
.insight-source{margin-top:30px;font-size:13px;color:rgba(255,255,255,0.40)}

/* FOOTER */
footer{padding:48px 40px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.flogo{font-family:'Lora',serif;font-size:18px;color:var(--text);text-decoration:none}
.flogo span{color:var(--accent)}
.fcopy{font-size:13px;color:var(--muted)}
footer a{color:var(--muted);text-decoration:none;font-size:13px}
footer a:hover{color:var(--text)}

@media(max-width:768px){
  nav{padding:16px 20px}.nav-links{display:none}
  .hero{padding:100px 24px 60px}
  .feature-grid{grid-template-columns:1fr}
  .insight-card{padding:40px 32px}
  .features,.insight-section{padding:60px 24px}
}
</style>
</head>
<body>

<nav>
  <a href="/" class="nav-logo">Halo<span>.</span></a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#insights">Insights</a>
    <a href="https://ram.zenbin.org/halo-viewer">Prototype</a>
    <a href="https://ram.zenbin.org/halo-mock" class="nav-cta">Explore Mock ✦</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-chip">✦ Circadian Intelligence · 2026</div>
  <h1 class="hero-title">Your body's<br/><em>natural rhythm,</em><br/>made visible.</h1>
  <p class="hero-sub">Halo learns your chronotype and tells you exactly when to focus, exercise, and sleep — every single day, recalculated each morning.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/halo-mock" class="btn-primary">Explore the Design ✦</a>
    <a href="https://ram.zenbin.org/halo-viewer" class="btn-ghost">View Prototype</a>
  </div>
</section>

<!-- Phone previews -->
<section class="phones-section">
  <!-- Dashboard -->
  <div class="phone">
    <div class="phone-label">Dashboard</div>
    <div style="padding:10px 14px 4px;font-family:'Lora',serif;font-size:28px;letter-spacing:-1px;line-height:1.1">Good<br/>morning, <span style="color:${P.accent}">Alex.</span></div>
    <div class="score-card">
      <div class="score-card-label">Circadian Score</div>
      <div class="score-card-val">87</div>
      <span class="score-badge">✦ Excellent</span>
    </div>
    <div class="mini-grid">
      <div class="mini-tile">
        <div class="mini-tile-val">7h 42m</div>
        <div class="mini-tile-lbl">Sleep</div>
        <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:83%;background:${P.green}"></div></div>
      </div>
      <div class="mini-tile">
        <div class="mini-tile-val">6.2K</div>
        <div class="mini-tile-lbl">Steps</div>
        <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:62%;background:${P.amber}"></div></div>
      </div>
      <div class="mini-tile">
        <div class="mini-tile-val">64ms</div>
        <div class="mini-tile-lbl">HRV</div>
        <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:75%;background:${P.blush}"></div></div>
      </div>
    </div>
  </div>

  <!-- Rhythm (hero/featured) -->
  <div class="phone hero-phone">
    <div class="phone-label">Today's Rhythm</div>
    <div class="rhythm-head">Today's<br/><span>Rhythm</span></div>
    <div style="margin:6px 12px;background:${P.greenDim};border-radius:16px;padding:6px 12px;display:inline-flex;align-items:center;gap:6px">
      <div style="width:6px;height:6px;border-radius:3px;background:${P.green}"></div>
      <span style="font-size:10px;font-weight:600;color:${P.green}">Rising energy window</span>
    </div>
    <div class="energy-chart">
      <div class="chart-label">ENERGY FORECAST</div>
      <div class="bar-row">
        <div style="height:10px;background:rgba(200,113,74,0.20)"></div>
        <div style="height:26px;background:${P.accent}"></div>
        <div style="height:36px;background:rgba(200,113,74,0.85)"></div>
        <div style="height:22px;background:rgba(200,113,74,0.45)"></div>
        <div style="height:30px;background:rgba(200,113,74,0.65)"></div>
        <div style="height:16px;background:rgba(200,113,74,0.30)"></div>
        <div style="height:6px;background:rgba(200,113,74,0.12)"></div>
      </div>
      <div class="time-row">
        <span>6a</span><span>9a</span><span>12</span><span>3p</span><span>6p</span><span>9p</span><span>12a</span>
      </div>
    </div>
    <div class="window-card">
      <div class="window-title">Deep Work</div>
      <div class="window-time">10:20 – 12:40 PM · 2h 20m</div>
    </div>
    <div style="margin:0 12px 8px;background:${P.surface2};border-radius:10px;padding:10px;border-left:3px solid ${P.green}">
      <div class="window-title">Exercise</div>
      <div class="window-time">6:00 – 7:30 PM · Body temp peak</div>
    </div>
  </div>

  <!-- Sleep -->
  <div class="phone">
    <div class="phone-label">Sleep Journal</div>
    <div class="sleep-hero">
      <div class="score-card-label" style="opacity:.55">Sleep Score</div>
      <div class="sleep-score">82</div>
      <div class="sleep-sub">Good recovery · 7h 42m</div>
    </div>
    <div class="stage-list">
      <div class="stage-row">
        <span class="stage-name">Deep</span>
        <div class="stage-track"><div class="stage-bar" style="width:13%;background:${P.green}"></div></div>
        <span class="stage-pct">13%</span>
      </div>
      <div class="stage-row">
        <span class="stage-name">REM</span>
        <div class="stage-track"><div class="stage-bar" style="width:28%;background:${P.accent}"></div></div>
        <span class="stage-pct">28%</span>
      </div>
      <div class="stage-row">
        <span class="stage-name">Light</span>
        <div class="stage-track"><div class="stage-bar" style="width:50%;background:${P.amber}"></div></div>
        <span class="stage-pct">50%</span>
      </div>
      <div class="stage-row">
        <span class="stage-name">Awake</span>
        <div class="stage-track"><div class="stage-bar" style="width:9%;background:${P.blush}"></div></div>
        <span class="stage-pct">9%</span>
      </div>
    </div>
  </div>
</section>

<!-- Stats -->
<section class="stats">
  <div class="stats-row">
    <div><div class="stat-val">87%</div><div class="stat-lbl">avg circadian alignment</div></div>
    <div><div class="stat-val">+38m</div><div class="stat-lbl">extra deep sleep by week 2</div></div>
    <div><div class="stat-val">12d</div><div class="stat-lbl">average habit streak</div></div>
  </div>
</section>

<!-- Features -->
<section class="features" id="features">
  <div class="section-eyebrow">✦ How it works</div>
  <h2 class="section-title">Your biology,<br/>as a dashboard.</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="fi" style="background:${P.accentDim}">☀️</div>
      <div class="ft">Circadian Scoring</div>
      <div class="fd">A daily score synthesising sleep timing, light exposure, activity patterns, and HRV into one clear number — 0 to 100.</div>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:${P.greenDim}">🌊</div>
      <div class="ft">Energy Forecast</div>
      <div class="fd">Your predicted peak focus windows, exercise slots, and wind-down times — recalculated every morning from last night's data.</div>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:${P.blushDim}">🌙</div>
      <div class="ft">Sleep Intelligence</div>
      <div class="fd">Sleep stages visualised with actionable insights. Not just how long you slept — how efficiently you cycled through deep and REM.</div>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:${P.amberDim}">🔥</div>
      <div class="ft">Habit Streaks</div>
      <div class="fd">Circadian-aware habits: morning sunlight, hydration windows, caffeine cutoffs — each timed to amplify your natural rhythm.</div>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:${P.accentDim}">✦</div>
      <div class="ft">Halo Analysis</div>
      <div class="fd">Weekly AI insights that explain your patterns in plain language and suggest exactly one focused change to improve your score.</div>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:${P.greenDim}">📖</div>
      <div class="ft">Chronotype Learning</div>
      <div class="fd">Halo adapts to your individual chronotype — night owl or early bird — building a personalised model over your first two weeks.</div>
    </div>
  </div>
</section>

<!-- Insight block -->
<section class="insight-section" id="insights">
  <div class="insight-card">
    <div class="insight-eyebrow">✦ Halo Analysis · Weekly</div>
    <div class="insight-quote">"Your late screens are cutting deep sleep short. Shift wind-down 30 minutes earlier for an extra hour of REM."</div>
    <div class="insight-source">Based on 7 nights of data — generated every Sunday morning</div>
  </div>
</section>

<footer>
  <a href="/" class="flogo">Halo<span>.</span></a>
  <span class="fcopy">RAM Design Heartbeat · ram.zenbin.org/halo</span>
  <div style="display:flex;gap:24px">
    <a href="https://ram.zenbin.org/halo-viewer">Prototype</a>
    <a href="https://ram.zenbin.org/halo-mock">Interactive Mock ☀◑</a>
  </div>
</footer>
</body>
</html>`;
}

// ── Viewer page ───────────────────────────────────────────────────────────────
function buildViewer() {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  const base = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Halo — Pencil Viewer</title>
<script src="https://cdn.pencil.dev/viewer/v2.8/viewer.js"><\/script>
</head>
<body style="margin:0;background:${P.bg};">
<div id="pencil-viewer" style="width:100%;height:100vh;"></div>
<script>
  window.PencilViewer && window.PencilViewer.init({
    container: document.getElementById('pencil-viewer'),
    pen: window.EMBEDDED_PEN,
    theme: 'light',
  });
<\/script>
</body>
</html>`;
  return base.replace('<script>', injection + '\n<script>');
}

// ── GitHub gallery queue ──────────────────────────────────────────────────────
async function updateGithubQueue() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
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
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return { status: putRes.status, entry: newEntry };
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('── Halo Design Discovery Pipeline ──\n');

  console.log('Publishing hero page…');
  const heroHtml = buildHero();
  const heroRes = await zenPut(SLUG, `Halo — ${TAGLINE}`, heroHtml);
  console.log(`  hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  try {
    const viewerHtml = buildViewer();
    const viewerRes = await zenPut(`${SLUG}-viewer`, `Halo — Design Viewer`, viewerHtml);
    console.log(`  viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  } catch (e) {
    console.log('  viewer: skipped —', e.message);
  }

  console.log('Updating GitHub gallery queue…');
  try {
    const ghResult = await updateGithubQueue();
    console.log(`  github: ${ghResult.status === 200 ? 'OK' : ghResult.status}`);
  } catch (e) {
    console.log('  github: failed —', e.message);
  }

  console.log('\n✓ Pipeline complete!');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
})();
