// helio-publish.js — Hero page + viewer for HELIO
// HELIO: Longevity Tracker for the Modern Body
// Palette: warm cream #F8F4EE · amber #E8853A · sage #4E8C6A · espresso #1A1614
'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG        = 'helio';
const VIEWER_SLUG = 'helio-viewer';
const APP_NAME    = 'HELIO';
const TAGLINE     = 'Know yourself. Extend yourself.';
const ARCHETYPE   = 'longevity-tracker-light';

const penJson = fs.readFileSync(path.join(__dirname, 'helio.pen'), 'utf8');

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.end(body); else r.end();
  });
}

async function publishToZenbin(slug, html, subdomain = 'ram') {
  const body = JSON.stringify({ html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
      'User-Agent': 'ram-heartbeat/1.0',
    },
  }, body);
}

// ─── HERO PAGE ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HELIO — ${TAGLINE}</title>
<meta name="description" content="HELIO is a longevity tracker for the modern body. Warm editorial interface inspired by Dawn and Superpower. Track HRV, sleep stages, nutrition and recovery. A RAM design concept.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #F8F4EE;
    --surface:   #FFFFFF;
    --surface2:  #F2EDE5;
    --border:    #EAE3D8;
    --fg:        #1A1614;
    --fg2:       #5C4F44;
    --fg3:       #9C8C7E;
    --fg4:       #C4B8AC;
    --amber:     #E8853A;
    --amber-lo:  rgba(232,133,58,0.12);
    --sage:      #4E8C6A;
    --sage-lo:   rgba(78,140,106,0.12);
    --sky:       #5B8BAE;
    --rose:      #C4625A;
    --cream:     #EDE5D8;
    --gold:      #C9922A;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg);
    color: var(--fg);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(248,244,238,0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-size: 18px; font-weight: 800; letter-spacing: -0.5px;
    color: var(--fg);
  }
  .nav-logo span { color: var(--amber); }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a {
    font-size: 13px; font-weight: 500; color: var(--fg2);
    text-decoration: none; transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--amber); }
  .nav-cta {
    background: var(--amber); color: #fff;
    border: none; border-radius: 100px; padding: 9px 22px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 120px 40px 80px;
    position: relative; overflow: hidden;
    text-align: center;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,133,58,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 3px;
    color: var(--amber); text-transform: uppercase;
    margin-bottom: 28px;
  }
  .hero-title {
    font-size: clamp(72px, 10vw, 120px);
    font-weight: 900; letter-spacing: -4px; line-height: 0.9;
    color: var(--fg);
    margin-bottom: 32px;
  }
  .hero-title .accent { color: var(--amber); }
  .hero-sub {
    font-size: clamp(16px, 2vw, 20px);
    font-weight: 400; color: var(--fg2); max-width: 520px;
    line-height: 1.6; margin-bottom: 48px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; margin-bottom: 80px; }
  .btn-primary {
    background: var(--amber); color: #fff; border: none;
    border-radius: 100px; padding: 14px 32px;
    font-size: 15px; font-weight: 600; cursor: pointer;
    text-decoration: none; transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(232,133,58,0.35);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(232,133,58,0.4); }
  .btn-secondary {
    color: var(--fg2); border: 1.5px solid var(--border);
    border-radius: 100px; padding: 13px 28px;
    font-size: 15px; font-weight: 500; cursor: pointer;
    text-decoration: none; transition: all 0.2s;
    background: var(--surface);
  }
  .btn-secondary:hover { border-color: var(--amber); color: var(--amber); }

  /* PHONE MOCKUP */
  .phone-row {
    display: flex; gap: 24px; align-items: flex-end;
    justify-content: center; flex-wrap: wrap;
  }
  .phone-wrap {
    position: relative; border-radius: 40px; overflow: hidden;
    box-shadow: 0 24px 80px rgba(26,22,20,0.16), 0 4px 20px rgba(26,22,20,0.08);
    transition: transform 0.3s ease;
  }
  .phone-wrap:hover { transform: translateY(-6px); }
  .phone-wrap.center { transform: scale(1.05); }
  .phone-wrap.center:hover { transform: scale(1.05) translateY(-6px); }
  .phone-screen {
    width: 260px; height: auto; display: block;
    background: var(--bg);
  }

  /* METRICS STRIP */
  .metrics-strip {
    padding: 60px 40px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .metrics-inner {
    max-width: 900px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px;
    text-align: center;
  }
  .metric-item .val {
    font-size: 42px; font-weight: 800; letter-spacing: -2px; color: var(--fg);
    line-height: 1;
  }
  .metric-item .unit { font-size: 14px; font-weight: 500; color: var(--amber); margin-top: 4px; }
  .metric-item .desc { font-size: 12px; color: var(--fg3); margin-top: 6px; }

  /* FEATURES */
  .features {
    padding: 100px 40px;
    max-width: 1100px; margin: 0 auto;
  }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 3px;
    color: var(--amber); text-transform: uppercase;
    margin-bottom: 16px;
  }
  .section-title {
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 800; letter-spacing: -2px; line-height: 1.1;
    color: var(--fg); max-width: 540px; margin-bottom: 16px;
  }
  .section-sub {
    font-size: 16px; color: var(--fg2); max-width: 460px;
    line-height: 1.6; margin-bottom: 60px;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px; padding: 28px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .feature-card:hover { border-color: var(--amber); transform: translateY(-2px); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-title { font-size: 16px; font-weight: 700; color: var(--fg); margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--fg2); line-height: 1.6; }

  /* SCREENS SECTION */
  .screens-section {
    padding: 100px 0;
    background: var(--surface2);
    overflow: hidden;
  }
  .screens-inner { max-width: 1100px; margin: 0 auto; padding: 0 40px; }
  .screens-scroll {
    display: flex; gap: 20px; margin-top: 60px;
    overflow-x: auto; padding: 20px 40px 40px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .screens-scroll::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 220px; scroll-snap-align: start;
    background: var(--surface); border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(26,22,20,0.10);
    transition: transform 0.25s;
  }
  .screen-card:hover { transform: translateY(-4px); }
  .screen-card-label {
    padding: 12px 16px; font-size: 12px; font-weight: 600; color: var(--fg2);
    border-top: 1px solid var(--border);
  }

  /* INSPIRATION */
  .inspiration {
    padding: 80px 40px;
    max-width: 900px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
    align-items: center;
  }
  .insp-label { font-size: 11px; font-weight: 700; color: var(--amber); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
  .insp-title { font-size: 32px; font-weight: 800; letter-spacing: -1.5px; color: var(--fg); margin-bottom: 20px; line-height: 1.15; }
  .insp-body { font-size: 14px; color: var(--fg2); line-height: 1.75; }
  .insp-refs { margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
  .insp-ref {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 12px;
  }
  .insp-ref-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .insp-ref-text { font-size: 12px; color: var(--fg2); line-height: 1.5; }
  .insp-ref-text strong { color: var(--fg); display: block; font-size: 13px; margin-bottom: 2px; }

  /* CTA BAND */
  .cta-band {
    background: var(--amber);
    padding: 80px 40px; text-align: center;
  }
  .cta-band h2 {
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 900; letter-spacing: -2px; color: #fff;
    margin-bottom: 16px;
  }
  .cta-band p { font-size: 16px; color: rgba(255,255,255,0.8); margin-bottom: 36px; }
  .btn-white {
    background: #fff; color: var(--amber);
    border: none; border-radius: 100px; padding: 14px 32px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    text-decoration: none; transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  .btn-white:hover { transform: translateY(-1px); }

  /* FOOTER */
  footer {
    padding: 40px; background: var(--surface);
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  footer .logo { font-size: 16px; font-weight: 800; }
  footer .logo span { color: var(--amber); }
  footer p { font-size: 12px; color: var(--fg3); }

  /* SCROLL PHONE ANIMATION */
  .phone-visual {
    display: flex; gap: 20px; align-items: center; justify-content: center;
    margin-top: 40px;
  }
  .mini-screen {
    background: var(--bg);
    border-radius: 28px;
    border: 6px solid var(--fg);
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(26,22,20,0.14);
  }
  .mini-screen canvas { display: block; }

  @media (max-width: 768px) {
    .features-grid { grid-template-columns: 1fr; }
    .metrics-inner { grid-template-columns: repeat(2, 1fr); }
    .inspiration { grid-template-columns: 1fr; }
    nav .nav-links { display: none; }
    .hero-title { letter-spacing: -2px; }
  }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo">HE<span>L</span>IO</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#inspiration">Inspiration</a>
    <a href="https://ram.zenbin.org/helio-viewer">View Design</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/helio-viewer">Open Prototype →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <p class="hero-eyebrow">Longevity · Health · Optimization</p>
  <h1 class="hero-title">Know<br>your<span class="accent">self.</span></h1>
  <p class="hero-sub">
    HELIO tracks what matters — HRV, sleep quality, recovery, nutrition — and turns raw biometric data into a language your body actually understands.
  </p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/helio-viewer">View Prototype</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/helio-mock">Interactive Mock ☀◑</a>
  </div>

  <!-- Decorative metric pills -->
  <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:24px;">
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:100px;padding:8px 18px;font-size:13px;font-weight:600;color:var(--fg2);">♥ HRV: 62ms <span style="color:var(--sage)">↑</span></div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:100px;padding:8px 18px;font-size:13px;font-weight:600;color:var(--fg2);">◐ Sleep: 7h 22m <span style="color:var(--sky)">94%</span></div>
    <div style="background:var(--amber);border-radius:100px;padding:8px 18px;font-size:13px;font-weight:700;color:#fff;">◎ Score: 84/100 ↑</div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:100px;padding:8px 18px;font-size:13px;font-weight:600;color:var(--fg2);">◈ Protein: 78% <span style="color:var(--rose)">●</span></div>
  </div>
</section>

<!-- METRICS STRIP -->
<section class="metrics-strip">
  <div class="metrics-inner">
    <div class="metric-item">
      <div class="val">5</div>
      <div class="unit">Screens</div>
      <div class="desc">Today · Vitals · Sleep · Nutrition · Insights</div>
    </div>
    <div class="metric-item">
      <div class="val">12+</div>
      <div class="unit">Biomarkers</div>
      <div class="desc">HRV, SpO₂, temp, HR, sleep stages &amp; more</div>
    </div>
    <div class="metric-item">
      <div class="val">84</div>
      <div class="unit">Health Score</div>
      <div class="desc">Single daily readiness number</div>
    </div>
    <div class="metric-item">
      <div class="val">Light</div>
      <div class="unit">Theme</div>
      <div class="desc">Warm cream · amber · sage · espresso</div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features" id="features">
  <div class="section-label">Core Features</div>
  <h2 class="section-title">Data that feels like wisdom</h2>
  <p class="section-sub">HELIO translates dense biometric streams into calm, editorial readouts. No cluttered dashboards — just what you need to act.</p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--amber-lo);">◎</div>
      <div class="feature-title">Daily Health Score</div>
      <div class="feature-desc">A single 0–100 readiness number derived from HRV, sleep quality, recovery trend, and activity load. Big editorial number — editorial warmth over clinical clutter.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--sage-lo);">♥</div>
      <div class="feature-title">Vitals Dashboard</div>
      <div class="feature-desc">HRV, resting HR, SpO₂, skin temperature deviation, respiratory rate. 7-day bar trends. Each metric in a generous card with warm cream background.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(91,139,174,0.12);">◐</div>
      <div class="feature-title">Sleep Architecture</div>
      <div class="feature-desc">Stage breakdown (Awake, Light, Deep, REM) with inline timeline bar and duration. Recovery score with contextual AI insight. Sleep debt tracking.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(196,98,90,0.1);">◈</div>
      <div class="feature-title">Nutrition Rings</div>
      <div class="feature-desc">Calorie progress, macro rings (protein / carbs / fat), meal log with color-coded accent bars. Hydration progress strip at the base.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--amber-lo);">↗</div>
      <div class="feature-title">Weekly Insights</div>
      <div class="feature-desc">7-day score trend bars, active streaks (morning protocol, sleep, protein), and a contextual AI recommendation anchored to your current recovery state.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:var(--sage-lo);">✦</div>
      <div class="feature-title">Helio AI</div>
      <div class="feature-desc">"Your recovery is high and training load is low — today is ideal for strength or Zone 2." Context-aware recommendations, never generic.</div>
    </div>
  </div>
</section>

<!-- SCREENS SECTION -->
<section class="screens-section" id="screens">
  <div class="screens-inner">
    <div class="section-label">5 Screens</div>
    <h2 class="section-title">Every screen<br>earns its space</h2>
    <p class="section-sub">Typography-led data. The number is the hero. Warm cream and amber give each reading an inviting, calm quality.</p>
  </div>
  <div class="screens-scroll">
    <div class="screen-card">
      <div style="height:420px;background:linear-gradient(160deg,#FBF7F0,#F5EDD8);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
        <div style="font-size:11px;font-weight:700;color:#9C8C7E;letter-spacing:2px;margin-bottom:8px;">TODAY</div>
        <div style="font-size:60px;font-weight:900;color:#1A1614;line-height:1;">84</div>
        <div style="font-size:13px;color:#E8853A;font-weight:600;margin-bottom:16px;">Health Score</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
          <span style="background:#FFF;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:600;color:#5C4F44;">8,241 steps</span>
          <span style="background:#FFF;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:600;color:#5C4F44;">7h 22m sleep</span>
          <span style="background:#FFF;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:600;color:#5C4F44;">HRV 62ms</span>
        </div>
      </div>
      <div class="screen-card-label">◎ Today</div>
    </div>
    <div class="screen-card">
      <div style="height:420px;background:linear-gradient(160deg,#F0F5EF,#E6EFE9);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
        <div style="font-size:11px;font-weight:700;color:#4E8C6A;letter-spacing:2px;margin-bottom:8px;">HRV</div>
        <div style="font-size:60px;font-weight:900;color:#1A1614;line-height:1;">62</div>
        <div style="font-size:14px;color:#9C8C7E;margin-bottom:20px;">ms</div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;width:100%;">
          <div style="background:#fff;border-radius:10px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#1A1614;">58</div><div style="font-size:9px;color:#9C8C7E;font-weight:600;">REST HR</div></div>
          <div style="background:#fff;border-radius:10px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#1A1614;">98%</div><div style="font-size:9px;color:#9C8C7E;font-weight:600;">SPO₂</div></div>
        </div>
      </div>
      <div class="screen-card-label">♥ Vitals</div>
    </div>
    <div class="screen-card">
      <div style="height:420px;background:linear-gradient(160deg,#EEF1F6,#E4E9F2);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
        <div style="font-size:11px;font-weight:700;color:#5B8BAE;letter-spacing:2px;margin-bottom:8px;">RECOVERY</div>
        <div style="font-size:60px;font-weight:900;color:#1A1614;line-height:1;">94</div>
        <div style="font-size:14px;color:#5B8BAE;font-weight:600;margin-bottom:16px;">%  Fully recovered</div>
        <div style="width:100%;background:#D8E3EF;border-radius:6px;height:8px;overflow:hidden;">
          <div style="width:94%;height:100%;background:#5B8BAE;border-radius:6px;"></div>
        </div>
        <div style="margin-top:12px;font-size:10px;color:#9C8C7E;">7h 22m · Deep 2h 12m · REM 2h</div>
      </div>
      <div class="screen-card-label">◐ Sleep</div>
    </div>
    <div class="screen-card">
      <div style="height:420px;background:linear-gradient(160deg,#FEF4E8,#FAE9CC);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
        <div style="font-size:11px;font-weight:700;color:#E8853A;letter-spacing:2px;margin-bottom:8px;">CALORIES</div>
        <div style="font-size:52px;font-weight:900;color:#1A1614;line-height:1;">1,842</div>
        <div style="font-size:13px;color:#9C8C7E;margin-bottom:16px;">/ 2,200 kcal</div>
        <div style="display:flex;gap:8px;width:100%;justify-content:center;">
          <div style="background:#fff;border-radius:10px;padding:8px 12px;text-align:center;flex:1;"><div style="font-size:14px;font-weight:800;color:#C4625A;">146g</div><div style="font-size:9px;color:#9C8C7E;">Protein</div></div>
          <div style="background:#fff;border-radius:10px;padding:8px 12px;text-align:center;flex:1;"><div style="font-size:14px;font-weight:800;color:#E8853A;">186g</div><div style="font-size:9px;color:#9C8C7E;">Carbs</div></div>
          <div style="background:#fff;border-radius:10px;padding:8px 12px;text-align:center;flex:1;"><div style="font-size:14px;font-weight:800;color:#4E8C6A;">62g</div><div style="font-size:9px;color:#9C8C7E;">Fat</div></div>
        </div>
      </div>
      <div class="screen-card-label">◈ Nutrition</div>
    </div>
    <div class="screen-card">
      <div style="height:420px;background:linear-gradient(160deg,#F5F8F2,#EBF1E6);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
        <div style="font-size:11px;font-weight:700;color:#4E8C6A;letter-spacing:2px;margin-bottom:8px;">WEEKLY AVG</div>
        <div style="font-size:60px;font-weight:900;color:#1A1614;line-height:1;">81</div>
        <div style="font-size:13px;color:#4E8C6A;font-weight:600;margin-bottom:16px;">↑ +6.5% this week</div>
        <div style="display:flex;gap:4px;align-items:flex-end;height:60px;width:100%;">
          ${[74,76,72,79,80,78,84].map((v,i)=>`<div style="flex:1;background:${i===6?'#E8853A':'#EDE5D8'};border-radius:3px 3px 0 0;height:${Math.round(v/100*56)}px;"></div>`).join('')}
        </div>
      </div>
      <div class="screen-card-label">↗ Insights</div>
    </div>
  </div>
</section>

<!-- INSPIRATION -->
<section id="inspiration" style="padding:100px 40px;max-width:1000px;margin:0 auto;">
  <div class="section-label">Design Inspiration</div>
  <h2 class="section-title">What sparked HELIO</h2>
  <p class="section-sub">Direct citations from the research session, March 2026.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:40px;">
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;">
      <div style="font-size:10px;font-weight:700;color:var(--amber);letter-spacing:2px;margin-bottom:10px;">LAPA.NINJA — MARCH 2026</div>
      <div style="font-size:15px;font-weight:700;color:var(--fg);margin-bottom:8px;">Dawn — Mental Health AI</div>
      <div style="font-size:13px;color:var(--fg2);line-height:1.6;">Warm amber → sky blue split-panel photography. Editorial wellness layout. Health apps pivoting from cold blue to warm amber light. Conversational UI tone. Led to HELIO's cream palette and amber primary.</div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;">
      <div style="font-size:10px;font-weight:700;color:var(--sage);letter-spacing:2px;margin-bottom:10px;">GODLY.WEBSITE — MARCH 2026</div>
      <div style="font-size:15px;font-weight:700;color:var(--fg);margin-bottom:8px;">Superpower — Personal Health</div>
      <div style="font-size:13px;color:var(--fg2);line-height:1.6;">"A new era of personal health." Full-bleed warm amber photography, dark silhouette + backlit glow, bold sans headline, pill CTA. Digital clinic aesthetics warmed by human photography.</div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;">
      <div style="font-size:10px;font-weight:700;color:var(--sky);letter-spacing:2px;margin-bottom:10px;">MINIMAL.GALLERY — MARCH 2026</div>
      <div style="font-size:15px;font-weight:700;color:var(--fg);margin-bottom:8px;">Isa de Burgh — Portfolio</div>
      <div style="font-size:13px;color:var(--fg2);line-height:1.6;">Huge condensed black type "ISA DE BURGH" on pure white, editorial B&W portrait right. Taught HELIO's approach: the number is the hero, surrounded by air. Generous vertical rhythm on cream.</div>
    </div>
  </div>
</section>

<!-- CTA BAND -->
<div class="cta-band">
  <h2>Know yourself.<br>Extend yourself.</h2>
  <p>Explore the full 5-screen prototype in the pencil.dev viewer.</p>
  <a class="btn-white" href="https://ram.zenbin.org/helio-viewer">Open Prototype →</a>
</div>

<!-- FOOTER -->
<footer>
  <div class="logo">HE<span>L</span>IO</div>
  <p>A RAM Design Heartbeat concept · March 2026 · Light-theme wellness editorial</p>
  <p style="font-size:11px;color:var(--fg4);">Inspired by Dawn · Superpower · Isa de Burgh</p>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ──────────────────────────────────────────────────────────────
// Fetch viewer template from zenbin
async function fetchViewerTemplate() {
  return new Promise((resolve, reject) => {
    https.get('https://ram.zenbin.org/viewer-template', res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function main() {
  // 1. Publish hero page
  console.log('Publishing hero page...');
  const heroRes = await publishToZenbin(SLUG, heroHtml);
  console.log(`  → ram.zenbin.org/${SLUG}  [${heroRes.status}]`);

  // 2. Build viewer HTML with embedded pen
  console.log('Building viewer...');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

  const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HELIO Prototype Viewer</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #F8F4EE; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
  .viewer-bar {
    width: 100%; padding: 14px 24px; background: #fff;
    border-bottom: 1px solid #EAE3D8;
    display: flex; align-items: center; justify-content: space-between;
  }
  .viewer-bar .logo { font-size: 15px; font-weight: 800; color: #1A1614; }
  .viewer-bar .logo span { color: #E8853A; }
  .viewer-bar a { font-size: 13px; color: #9C8C7E; text-decoration: none; }
  .viewer-bar a:hover { color: #E8853A; }
  #pencil-root { flex: 1; width: 100%; }
</style>
${injection}
<script src="https://unpkg.com/@pencildev/viewer@latest/dist/viewer.umd.js"><\/script>
</head>
<body>
<div class="viewer-bar">
  <div class="logo">HE<span>L</span>IO <span style="font-weight:400;color:#9C8C7E;font-size:12px;margin-left:8px;">Prototype Viewer</span></div>
  <div style="display:flex;gap:20px;">
    <a href="https://ram.zenbin.org/helio-mock">Interactive Mock ☀◑</a>
    <a href="https://ram.zenbin.org/helio">← Back to overview</a>
  </div>
</div>
<div id="pencil-root"></div>
<script>
  if (window.PencilViewer && window.EMBEDDED_PEN) {
    PencilViewer.init('#pencil-root', { pen: JSON.parse(window.EMBEDDED_PEN) });
  }
<\/script>
</body>
</html>`;

  const viewerRes = await publishToZenbin(VIEWER_SLUG, viewerHtml);
  console.log(`  → ram.zenbin.org/${VIEWER_SLUG}  [${viewerRes.status}]`);

  console.log('\n✓ Published:');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
}

main().catch(console.error);
