'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG   = 'mare';
const SUBDOM = 'ram';

// Palette
const BG       = '#06080F';
const SURFACE  = '#0D1120';
const SURFACE2 = '#141828';
const TEXT     = '#DCE8F5';
const MUTED    = '#5A7090';
const ACCENT   = '#00E5A0';
const ACCENT2  = '#6B52FF';
const DIM      = '#1A2235';
const AMBER    = '#F5A623';

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}?overwrite=true`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOM,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MARE — Sleep Intelligence Platform</title>
<meta name="description" content="Understand your sleep at a cellular level. MARE maps every stage, signal, and pattern — then tells you exactly what to do.">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: ${BG};
  --surface: ${SURFACE};
  --surface2: ${SURFACE2};
  --dim: ${DIM};
  --text: ${TEXT};
  --muted: ${MUTED};
  --accent: ${ACCENT};
  --accent2: ${ACCENT2};
  --amber: ${AMBER};
}
html { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; }
body { min-height: 100vh; overflow-x: hidden; }

/* Subtle noise texture overlay */
body::before {
  content: '';
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: 0.4;
}

/* Ambient glow blobs — like the 3D sculptural orbs from Cecilia */
.glow-1, .glow-2, .glow-3 {
  position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none;
  animation: drift 18s ease-in-out infinite;
}
.glow-1 { width: 600px; height: 600px; top: -200px; right: -150px;
  background: radial-gradient(circle, ${ACCENT}18, transparent 70%); animation-delay: 0s; }
.glow-2 { width: 500px; height: 500px; bottom: -100px; left: -100px;
  background: radial-gradient(circle, ${ACCENT2}14, transparent 70%); animation-delay: -6s; }
.glow-3 { width: 300px; height: 300px; top: 50%; left: 50%;
  background: radial-gradient(circle, ${AMBER}0C, transparent 70%); animation-delay: -12s; }

@keyframes drift {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(30px,-20px) scale(1.05); }
  66% { transform: translate(-20px,15px) scale(0.97); }
}

nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 40px;
  border-bottom: 1px solid ${ACCENT}18;
  background: ${BG}CC;
  backdrop-filter: blur(20px);
}
.nav-logo { font-size: 14px; font-weight: 700; letter-spacing: 4px; color: var(--text); }
.nav-logo span { color: var(--accent); }
.nav-links { display: flex; gap: 32px; }
.nav-links a { font-size: 12px; font-weight: 500; letter-spacing: 2px;
  color: var(--muted); text-decoration: none; transition: color .2s;
  text-transform: uppercase; }
.nav-links a:hover { color: var(--accent); }
.nav-cta { font-size: 12px; font-weight: 600; letter-spacing: 2px;
  color: var(--bg); background: var(--accent); border: none; border-radius: 100px;
  padding: 10px 22px; cursor: pointer; text-transform: uppercase;
  text-decoration: none; transition: opacity .2s; }
.nav-cta:hover { opacity: 0.85; }

/* ── HERO ── */
.hero {
  position: relative; z-index: 1;
  min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 120px 40px 80px;
  text-align: center;
}
.hero-eyebrow {
  font-size: 10px; font-weight: 600; letter-spacing: 5px;
  color: var(--accent); text-transform: uppercase; margin-bottom: 28px;
}
/* MEGA display type — inspired by Muradov's full-width oversized headline */
.hero-title {
  font-size: clamp(72px, 14vw, 160px);
  font-weight: 800; line-height: 0.9;
  letter-spacing: -4px;
  background: linear-gradient(135deg, var(--text) 30%, ${ACCENT}88 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
}
.hero-tagline {
  font-size: 20px; font-weight: 300;
  color: var(--muted); max-width: 480px; line-height: 1.5;
  margin-bottom: 48px;
}
.hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.btn-primary {
  font-size: 13px; font-weight: 600; letter-spacing: 2px;
  color: var(--bg); background: var(--accent); border: none;
  border-radius: 100px; padding: 16px 36px; cursor: pointer;
  text-transform: uppercase; text-decoration: none;
  transition: transform .2s, box-shadow .2s;
  box-shadow: 0 0 40px ${ACCENT}40;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 50px ${ACCENT}50; }
.btn-secondary {
  font-size: 13px; font-weight: 500; letter-spacing: 2px;
  color: var(--text); background: transparent;
  border: 1px solid ${TEXT}22; border-radius: 100px;
  padding: 16px 36px; cursor: pointer; text-transform: uppercase;
  text-decoration: none; transition: border-color .2s;
}
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

/* ── SCORE ORB — the sculptural 3D element from Cecilia ── */
.score-orb-wrap {
  position: relative; margin: 60px auto 0;
  width: 220px; height: 220px;
}
.score-orb {
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%,
    ${SURFACE2} 0%, ${SURFACE} 40%, ${BG} 100%);
  box-shadow:
    0 0 0 1px ${ACCENT}18,
    0 0 60px ${ACCENT}20,
    0 0 120px ${ACCENT}10,
    inset 0 0 40px ${ACCENT}08;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  animation: pulse-orb 4s ease-in-out infinite;
}
@keyframes pulse-orb {
  0%, 100% { box-shadow: 0 0 0 1px ${ACCENT}18, 0 0 60px ${ACCENT}20, 0 0 120px ${ACCENT}10, inset 0 0 40px ${ACCENT}08; }
  50% { box-shadow: 0 0 0 1px ${ACCENT}30, 0 0 80px ${ACCENT}35, 0 0 160px ${ACCENT}18, inset 0 0 60px ${ACCENT}12; }
}
.orb-score { font-size: 64px; font-weight: 800; color: var(--text); line-height: 1; }
.orb-label { font-size: 10px; font-weight: 600; letter-spacing: 4px;
  color: var(--accent); text-transform: uppercase; margin-top: 4px; }
.orb-ring {
  position: absolute; inset: -12px; border-radius: 50%;
  border: 1px solid ${ACCENT}15;
  animation: spin-ring 20s linear infinite;
}
.orb-ring-2 {
  position: absolute; inset: -24px; border-radius: 50%;
  border: 1px dashed ${ACCENT2}10;
  animation: spin-ring 30s linear infinite reverse;
}
@keyframes spin-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ── STATS STRIP ── */
.stats-strip {
  position: relative; z-index: 1;
  display: flex; justify-content: center; gap: 0;
  border-top: 1px solid ${TEXT}08; border-bottom: 1px solid ${TEXT}08;
  padding: 40px 40px;
  background: ${SURFACE}50;
}
.stat { text-align: center; padding: 0 48px; border-right: 1px solid ${TEXT}08; }
.stat:last-child { border-right: none; }
.stat-value { font-size: 42px; font-weight: 800; color: var(--text); line-height: 1; }
.stat-value.green { color: var(--accent); }
.stat-label { font-size: 10px; font-weight: 500; letter-spacing: 3px;
  color: var(--muted); text-transform: uppercase; margin-top: 8px; }

/* ── FEATURES ── */
.features {
  position: relative; z-index: 1;
  max-width: 1100px; margin: 0 auto; padding: 100px 40px;
}
.features-header { text-align: center; margin-bottom: 64px; }
.features-header h2 {
  font-size: clamp(32px, 5vw, 56px); font-weight: 800; letter-spacing: -2px;
  margin-bottom: 16px;
}
.features-header p { font-size: 16px; color: var(--muted); }

.features-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2px;
}
.feature-card {
  background: var(--surface); padding: 40px;
  transition: background .2s;
}
.feature-card:first-child { border-radius: 20px 0 0 0; }
.feature-card:nth-child(2) { border-radius: 0 20px 0 0; }
.feature-card:nth-child(3) { border-radius: 0 0 0 20px; }
.feature-card:last-child { border-radius: 0 0 20px 0; }
.feature-card:hover { background: var(--surface2); }
.feature-icon {
  font-size: 28px; margin-bottom: 20px; display: block;
  width: 52px; height: 52px;
  background: ${ACCENT}12; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.feature-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
.feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

/* ── SCREENS PREVIEW ── */
.screens-section {
  position: relative; z-index: 1;
  padding: 80px 40px;
  background: ${SURFACE}40;
  overflow: hidden;
}
.screens-section h2 {
  text-align: center; font-size: clamp(28px,4vw,48px);
  font-weight: 800; letter-spacing: -1px; margin-bottom: 12px;
}
.screens-section p {
  text-align: center; font-size: 15px; color: var(--muted); margin-bottom: 52px;
}
.screens-scroll {
  display: flex; gap: 24px; justify-content: center;
  flex-wrap: wrap;
}
.screen-pill {
  background: var(--dim);
  border: 1px solid ${TEXT}10;
  border-radius: 14px; padding: 14px 22px;
  font-size: 12px; font-weight: 600; letter-spacing: 2px;
  color: var(--muted); text-transform: uppercase; cursor: pointer;
  transition: all .2s;
}
.screen-pill:hover, .screen-pill.active { background: ${ACCENT}15;
  border-color: var(--accent); color: var(--accent); }

.phone-mock {
  margin: 48px auto 0;
  width: 300px; background: #0A0D18;
  border-radius: 48px;
  border: 1px solid ${TEXT}12;
  box-shadow: 0 40px 100px #000A, 0 0 0 4px ${SURFACE},
    0 0 0 5px ${TEXT}08, 0 0 60px ${ACCENT}15;
  overflow: hidden; min-height: 520px;
  display: flex; flex-direction: column;
}
.phone-notch {
  width: 120px; height: 30px; background: #0A0D18;
  border-radius: 0 0 20px 20px; margin: 0 auto;
  border: 1px solid ${TEXT}10; border-top: none;
}
.phone-content { padding: 16px 20px; flex: 1; }
.phone-screen-label {
  font-size: 8px; font-weight: 600; letter-spacing: 4px;
  color: var(--accent); text-transform: uppercase; margin-bottom: 12px; opacity: 0.7;
}
.phone-metric-big { font-size: 56px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
.phone-metric-sub { font-size: 11px; color: var(--muted); margin-bottom: 20px; }
.phone-card {
  background: var(--surface); border-radius: 12px;
  padding: 14px; margin-bottom: 10px;
  border: 1px solid ${TEXT}06;
}
.phone-card-label { font-size: 8px; letter-spacing: 2px; color: var(--muted);
  text-transform: uppercase; margin-bottom: 6px; }
.phone-card-val { font-size: 18px; font-weight: 700; }
.phone-card-sub { font-size: 10px; color: var(--accent); margin-top: 3px; }
.phone-row { display: flex; gap: 8px; }
.phone-row .phone-card { flex: 1; }
.stage-bar {
  height: 6px; border-radius: 3px; margin-bottom: 8px; overflow: hidden;
  display: flex; gap: 2px;
}
.stage-bar div { border-radius: 3px; }

/* ── CTA ── */
.cta-section {
  position: relative; z-index: 1;
  text-align: center; padding: 100px 40px;
}
.cta-section h2 {
  font-size: clamp(32px,5vw,60px); font-weight: 800; letter-spacing: -2px;
  margin-bottom: 20px; line-height: 1.1;
}
.cta-section p { font-size: 16px; color: var(--muted); margin-bottom: 40px; }

/* ── FOOTER ── */
footer {
  position: relative; z-index: 1;
  border-top: 1px solid ${TEXT}08; padding: 32px 40px;
  display: flex; justify-content: space-between; align-items: center;
}
.footer-logo { font-size: 13px; font-weight: 700; letter-spacing: 4px; }
.footer-logo span { color: var(--accent); }
.footer-copy { font-size: 11px; color: var(--muted); }
.footer-links { display: flex; gap: 24px; }
.footer-links a { font-size: 11px; color: var(--muted); text-decoration: none;
  letter-spacing: 1px; }

@media (max-width: 768px) {
  nav { padding: 16px 20px; }
  .nav-links { display: none; }
  .hero { padding: 100px 24px 60px; }
  .stats-strip { padding: 32px 20px; gap: 0; }
  .stat { padding: 0 20px; }
  .features { padding: 60px 24px; }
  footer { flex-direction: column; gap: 16px; text-align: center; }
}
</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
<div class="glow-1"></div>
<div class="glow-2"></div>
<div class="glow-3"></div>

<nav>
  <span class="nav-logo"><span>M</span>ARE</span>
  <div class="nav-links">
    <a href="#">Science</a>
    <a href="#">Prototype</a>
    <a href="#">Insights</a>
  </div>
  <a href="https://ram.zenbin.org/mare-viewer" class="nav-cta">View Design</a>
</nav>

<section class="hero">
  <p class="hero-eyebrow">✦ Sleep Intelligence Platform</p>
  <h1 class="hero-title">MARE</h1>
  <p class="hero-tagline">Sleep, mapped. Every stage, signal, and pattern — decoded into clarity.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/mare-viewer" class="btn-primary">View Prototype ↗</a>
    <a href="https://ram.zenbin.org/mare-mock" class="btn-secondary">Interactive Mock ◑</a>
  </div>

  <div class="score-orb-wrap">
    <div class="orb-ring"></div>
    <div class="orb-ring-2"></div>
    <div class="score-orb">
      <div class="orb-score">87</div>
      <div class="orb-label">Good</div>
    </div>
  </div>
</section>

<section class="stats-strip">
  <div class="stat">
    <div class="stat-value green">7h 32m</div>
    <div class="stat-label">Total Sleep</div>
  </div>
  <div class="stat">
    <div class="stat-value">91%</div>
    <div class="stat-label">Efficiency</div>
  </div>
  <div class="stat">
    <div class="stat-value green">1h 42m</div>
    <div class="stat-label">Deep Sleep</div>
  </div>
  <div class="stat">
    <div class="stat-value">58ms</div>
    <div class="stat-label">HRV</div>
  </div>
</section>

<section class="features">
  <div class="features-header">
    <h2>Everything your sleep is<br>trying to tell you.</h2>
    <p>MARE listens all night so you don't have to guess in the morning.</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Sleep Score</div>
      <div class="feature-desc">A single number that accounts for duration, efficiency, stage composition, and consistency — calibrated to your baseline.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≋</div>
      <div class="feature-title">Stage Mapping</div>
      <div class="feature-desc">See exactly when you entered deep sleep, REM, and light cycles. A full hypnogram of every minute you were asleep.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">♡</div>
      <div class="feature-title">Recovery Signals</div>
      <div class="feature-desc">HRV, resting heart rate, body temperature deviation, and SpO₂ — combined into a readiness score that tells you how hard to push today.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Sleep Coach</div>
      <div class="feature-desc">Personalized wind-down protocols, breathing exercises, and environment recommendations — timed to your biology.</div>
    </div>
  </div>
</section>

<section class="screens-section">
  <h2>Five screens.<br>Total visibility.</h2>
  <p>From raw biometrics to actionable coaching — every view is purposeful.</p>

  <div class="screens-scroll">
    <div class="screen-pill active">Score</div>
    <div class="screen-pill">Stages</div>
    <div class="screen-pill">Trends</div>
    <div class="screen-pill">Recovery</div>
    <div class="screen-pill">Coach</div>
  </div>

  <div class="phone-mock">
    <div class="phone-notch"></div>
    <div class="phone-content">
      <div class="phone-screen-label">Sleep Score</div>
      <div class="phone-metric-big" style="color:${TEXT}">87</div>
      <div class="phone-metric-sub">Last night · Good · Top 18% of your age group</div>
      <div class="phone-row">
        <div class="phone-card">
          <div class="phone-card-label">Deep</div>
          <div class="phone-card-val">1h 42m</div>
          <div class="phone-card-sub">↑ 14min</div>
        </div>
        <div class="phone-card">
          <div class="phone-card-label">REM</div>
          <div class="phone-card-val">2h 08m</div>
          <div class="phone-card-sub" style="color:${MUTED}">→ stable</div>
        </div>
        <div class="phone-card">
          <div class="phone-card-label">Effic.</div>
          <div class="phone-card-val">91%</div>
          <div class="phone-card-sub">↑ 3%</div>
        </div>
      </div>
      <div class="phone-card">
        <div class="phone-card-label">Stage Breakdown</div>
        <div class="stage-bar" style="margin-top:8px">
          <div style="width:7%;background:${MUTED};opacity:.5"></div>
          <div style="width:38%;background:${ACCENT2};opacity:.7"></div>
          <div style="width:28%;background:${ACCENT};opacity:.9"></div>
          <div style="width:27%;background:#9B6EFF;opacity:.8"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9px;color:${MUTED}">
          <span>Awake</span><span>Light</span><span style="color:${ACCENT}">Deep</span><span>REM</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2>Sleep is the foundation.<br><span style="color:var(--accent)">Build on it.</span></h2>
  <p>Explore the full prototype — five screens of sleep intelligence, meticulously designed.</p>
  <a href="https://ram.zenbin.org/mare-viewer" class="btn-primary">Explore Prototype ↗</a>
</section>

<footer>
  <div class="footer-logo"><span>M</span>ARE</div>
  <div class="footer-copy">RAM Design Heartbeat · 2026</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/mare-viewer">Prototype</a>
    <a href="https://ram.zenbin.org/mare-mock">Mock</a>
  </div>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ─────────────────────────────────────────────────────────────
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>MARE — Prototype Viewer</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#06080F;color:#DCE8F5;font-family:'Inter',system-ui,sans-serif;min-height:100vh;
  display:flex;flex-direction:column;align-items:center;justify-content:center}
.viewer-header{position:fixed;top:0;left:0;right:0;padding:16px 32px;
  display:flex;align-items:center;justify-content:space-between;
  background:#06080FCC;backdrop-filter:blur(12px);border-bottom:1px solid #00E5A018;z-index:100}
.viewer-logo{font-size:12px;font-weight:700;letter-spacing:4px}
.viewer-logo span{color:#00E5A0}
.viewer-back{font-size:11px;letter-spacing:2px;color:#5A7090;text-decoration:none;
  text-transform:uppercase;transition:color .2s}
.viewer-back:hover{color:#00E5A0}
#pencil-viewer{width:100%;flex:1;border:none;min-height:calc(100vh - 57px);margin-top:57px}
</style>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
<div class="viewer-header">
  <span class="viewer-logo"><span>M</span>ARE</span>
  <a href="https://ram.zenbin.org/mare" class="viewer-back">← Back to Overview</a>
</div>
<script>
window.EMBEDDED_PEN = null;
</script>
<script src="https://cdn.pencil.dev/viewer/v2/viewer.js"></script>
<div id="pencil-viewer"></div>
<script>
if (window.EMBEDDED_PEN && window.PencilViewer) {
  PencilViewer.init('pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN) });
}
</script>
</body>
</html>`;

// Inject pen JSON
const penJson = fs.readFileSync('/workspace/group/design-studio/mare.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>\nwindow.EMBEDDED_PEN = null;\n</script>', injection + '\n');

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page...');
  const r1 = await zenPublish(SLUG, heroHtml, 'MARE — Sleep Intelligence Platform');
  console.log('Hero:', r1.status, r1.status===200?'OK':r1.body.slice(0,120));

  console.log('Publishing viewer...');
  const r2 = await zenPublish(SLUG+'-viewer', viewerHtml, 'MARE — Prototype Viewer');
  console.log('Viewer:', r2.status, r2.status===200?'OK':r2.body.slice(0,120));

  if (r1.status===200 && r2.status===200) {
    console.log('\n✓ Hero   → https://ram.zenbin.org/mare');
    console.log('✓ Viewer → https://ram.zenbin.org/mare-viewer');
  }
})();
