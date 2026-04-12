/**
 * MEND — Full Design Discovery Pipeline
 * Hero + Viewer + Gallery queue + DB
 * RAM Design Heartbeat — Mar 28 2026
 *
 * Inspired by: Dribbble #1 popular "Smart Ring App — Health Tracking Mobile UI" (12.8k views)
 *              Dawn AI mental health app (lapa.ninja) — evidence-based AI for mental wellness
 *              minimal.gallery editorial warmth — organic, typographic, human
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'mend';
const APP       = 'MEND';
const TAGLINE   = 'Recovery intelligence for smart wearables';
const ARCHETYPE = 'health-wearable-light';
const PROMPT    = 'Inspired by Dribbble #1 popular "Smart Ring App — Health Tracking Mobile UI" (12.8k views) and Dawn AI mental health (lapa.ninja). Light theme. Warm parchment #F5F2EC base with forest green #3E6B4A accent and terra cotta #C4714A. Editorial serif number hierarchy (88px recovery score), organic HRV wave visualizations, sleep hypnogram, AI focus windows, insights feed. 5 screens: Welcome, Today dashboard, Sleep analysis, Focus windows, AI insights.';

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F5F2EC',
  surface:  '#FDFCFA',
  surface2: '#EDE9E1',
  text:     '#1C1A17',
  textMid:  '#6B6560',
  textFaint:'#B0AA9F',
  accent:   '#3E6B4A',
  accent2:  '#C4714A',
  accent3:  '#7B5EA0',
  positive: '#3E8B5A',
  warn:     '#C4A24A',
};

// ── Publish helper ───────────────────────────────────────────────────────────
function publish(slug, html, title, subdomain = 'ram') {
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
        'X-Subdomain': subdomain,
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          resolve(parsed.url ? parsed : { url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) });
        } catch(e) { resolve({ url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) }); }
      });
    });
    req.on('error', reject);
    req.write(buf); req.end();
  });
}

// ── GitHub helper ────────────────────────────────────────────────────────────
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

// ── Hero HTML ────────────────────────────────────────────────────────────────
const HERO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MEND — Recovery intelligence for smart wearables</title>
<meta name="description" content="Smart ring biometric companion. Typographically-led recovery dashboard with organic wave data and editorial number hierarchy.">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface}; --text: ${P.text};
    --mid: ${P.textMid}; --faint: ${P.textFaint}; --border: ${P.surface2};
    --accent: ${P.accent}; --accent2: ${P.accent2}; --accent3: ${P.accent3};
    --warn: ${P.warn}; --pos: ${P.positive};
  }
  html { font-size: 16px; }
  body { background: var(--bg); color: var(--text); font-family: -apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif; line-height: 1.5; overflow-x: hidden; }

  nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px;
    background: rgba(245,242,236,0.9); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 20px; font-weight: 700; color: var(--accent); letter-spacing: -0.5px; }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a { text-decoration: none; font-size: 14px; color: var(--mid); transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: #fff; border: none; padding: 10px 22px; border-radius: 100px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }

  .hero {
    max-width: 1120px; margin: 0 auto; padding: 96px 32px 64px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
  }
  .hero-tag { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); padding: 5px 12px; border-radius: 100px; margin-bottom: 20px; }
  .hero h1 { font-size: clamp(48px, 6vw, 78px); font-weight: 700; line-height: 1.0; letter-spacing: -3px; margin-bottom: 20px; }
  .hero h1 em { font-style: normal; color: var(--accent); }
  .hero-sub { font-size: 18px; color: var(--mid); line-height: 1.65; margin-bottom: 36px; max-width: 440px; }
  .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary { background: var(--accent); color: #fff; padding: 14px 28px; border-radius: 100px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-block; }
  .btn-secondary { border: 1.5px solid var(--border); color: var(--text); padding: 13px 28px; border-radius: 100px; font-size: 15px; font-weight: 500; text-decoration: none; display: inline-block; }

  .hero-visual { display: flex; justify-content: center; align-items: center; position: relative; min-height: 500px; }
  .phone-a {
    width: 240px; height: 520px; background: var(--surface);
    border-radius: 44px; border: 1.5px solid var(--border);
    box-shadow: 0 40px 80px rgba(62,107,74,0.12), 0 8px 24px rgba(0,0,0,0.06);
    overflow: hidden; transform: rotate(-3deg); z-index: 2; position: relative;
  }
  .phone-b {
    position: absolute; right: -20px; top: 40px;
    width: 200px; height: 430px; background: var(--surface);
    border-radius: 38px; border: 1.5px solid var(--border);
    box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    overflow: hidden; transform: rotate(4deg); z-index: 1; opacity: .82;
  }
  .pi { padding: 22px 16px; }
  .pi-label { font-size: 9px; font-weight: 600; letter-spacing: 1px; color: var(--faint); margin-bottom: 2px; }
  .pi-big { font-size: 68px; font-weight: 700; font-family: Georgia, serif; letter-spacing: -4px; line-height: 1; color: var(--text); }
  .pi-green { font-size: 11px; color: var(--accent); margin-bottom: 12px; }
  .pi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 10px; }
  .pi-cell { background: var(--bg); border-radius: 10px; padding: 8px 6px; text-align: center; }
  .pi-cv { font-size: 18px; font-weight: 700; font-family: Georgia, serif; }
  .pi-cl { font-size: 7px; color: var(--faint); letter-spacing: .5px; }
  .pi-bar { background: var(--bg); border-radius: 10px; padding: 8px 10px; margin-bottom: 8px; }
  .pi-blab { font-size: 8px; font-weight: 500; color: var(--mid); margin-bottom: 5px; }
  .pi-brow { display: flex; align-items: center; gap: 5px; margin-bottom: 3px; }
  .pi-bday { font-size: 7px; color: var(--faint); width: 8px; }
  .pi-btrack { flex: 1; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .pi-bfill { height: 5px; border-radius: 3px; }
  .pi-bval { font-size: 7px; color: var(--faint); }
  .pi-ins { background: color-mix(in srgb, var(--accent) 10%, transparent); border-radius: 10px; padding: 8px 10px; }
  .pi-it { font-size: 9px; color: var(--accent); line-height: 1.4; }

  .metrics-strip { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .metrics-inner { max-width: 1120px; margin: 0 auto; display: flex; justify-content: space-between; padding: 28px 32px; }
  .metric { text-align: center; }
  .metric-val { font-size: 40px; font-weight: 700; font-family: Georgia, serif; letter-spacing: -2px; }
  .metric-val span { font-size: 18px; font-weight: 500; color: var(--mid); }
  .metric-label { font-size: 12px; color: var(--faint); margin-top: 4px; letter-spacing: .5px; }

  .section { max-width: 1120px; margin: 80px auto; padding: 0 32px; }
  .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; text-align: center; }
  .section-h2 { font-size: clamp(32px, 4vw, 48px); font-weight: 700; letter-spacing: -2px; text-align: center; margin-bottom: 12px; }
  .section-sub { font-size: 17px; color: var(--mid); text-align: center; max-width: 540px; margin: 0 auto 56px; }

  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px 24px; transition: transform .2s; }
  .feature-card:hover { transform: translateY(-3px); }
  .fi { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
  .ft { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .fb { font-size: 14px; color: var(--mid); line-height: 1.6; }

  .screens-section { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 0; }
  .screens-inner { max-width: 1120px; margin: 0 auto; padding: 0 32px; }
  .screens-scroll { display: flex; gap: 24px; overflow-x: auto; padding-bottom: 20px; scrollbar-width: none; }
  .screens-scroll::-webkit-scrollbar { display: none; }
  .screen-card { flex-shrink: 0; background: var(--bg); border: 1px solid var(--border); border-radius: 20px; padding: 20px 16px; width: 204px; }
  .screen-label { font-size: 11px; font-weight: 600; letter-spacing: .8px; color: var(--faint); text-transform: uppercase; margin-bottom: 14px; }
  .sv { height: 300px; background: var(--bg); border-radius: 12px; padding: 12px; position: relative; overflow: hidden; }

  .quote-section { max-width: 800px; margin: 96px auto; padding: 0 32px; text-align: center; }
  .quote-text { font-size: clamp(24px, 3.5vw, 38px); font-family: Georgia, serif; font-style: italic; letter-spacing: -1px; line-height: 1.35; margin-bottom: 24px; }
  .quote-attr { font-size: 14px; color: var(--faint); }

  .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: 56px; }
  .step { text-align: center; }
  .step-num { width: 48px; height: 48px; border-radius: 50%; background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
  .step h4 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .step p { font-size: 14px; color: var(--mid); line-height: 1.5; }

  .cta-section { max-width: 1120px; margin: 0 auto 96px; padding: 0 32px; }
  .cta-card { background: var(--accent); border-radius: 32px; padding: 64px; text-align: center; color: #fff; position: relative; overflow: hidden; }
  .cta-card::before { content: ''; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: rgba(255,255,255,0.08); border-radius: 50%; }
  .cta-card h2 { font-size: 40px; font-weight: 700; letter-spacing: -2px; margin-bottom: 12px; }
  .cta-card p { font-size: 18px; opacity: .8; margin-bottom: 32px; }
  .btn-white { background: #fff; color: var(--accent); padding: 14px 32px; border-radius: 100px; font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; }
  .cta-links { margin-top: 20px; display: flex; justify-content: center; gap: 24px; }
  .cta-links a { color: rgba(255,255,255,.6); font-size: 14px; text-decoration: none; }
  .cta-links a:hover { color: #fff; }

  footer { border-top: 1px solid var(--border); padding: 32px; text-align: center; }
  footer p { font-size: 13px; color: var(--faint); }
  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 48px 20px; }
    .hero-visual { display: none; }
    .metrics-inner { flex-wrap: wrap; gap: 24px; }
    .feature-grid { grid-template-columns: 1fr; }
    .steps { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 12px 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">MEND</div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#how">How it works</a></li>
    <li><a href="#screens">Screens</a></li>
  </ul>
  <a class="nav-cta" href="https://ram.zenbin.org/mend-viewer">View Design ↗</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-tag">Smart Ring · AI Recovery · Light Theme</div>
    <h1>Know when to push,<br>when to <em>rest.</em></h1>
    <p class="hero-sub">MEND reads your smart ring's biometrics — HRV, sleep stages, cortisol patterns — and tells you exactly when your body and mind are primed to perform.</p>
    <div class="hero-ctas">
      <a class="btn-primary" href="https://ram.zenbin.org/mend-viewer">Open in Viewer →</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/mend-mock">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-a">
      <div class="pi">
        <div class="pi-label">RECOVERY SCORE</div>
        <div class="pi-big">84</div>
        <div class="pi-green">↑ Good · +6pts from yesterday</div>
        <div class="pi-grid">
          <div class="pi-cell"><div class="pi-cv" style="color:${P.accent}">62</div><div class="pi-cl">HRV ms</div></div>
          <div class="pi-cell"><div class="pi-cv" style="color:${P.accent3}">7.4</div><div class="pi-cl">SLEEP hrs</div></div>
          <div class="pi-cell"><div class="pi-cv" style="color:${P.accent2}">58</div><div class="pi-cl">REST bpm</div></div>
        </div>
        <div class="pi-bar">
          <div class="pi-blab">Weekly Recovery Trend</div>
          ${[71,68,75,79,82,78,84].map((v,i)=>`<div class="pi-brow"><span class="pi-bday">${['M','T','W','T','F','S','S'][i]}</span><div class="pi-btrack"><div class="pi-bfill" style="width:${v}%;background:${i===6?P.accent:P.textFaint+'55'}"></div></div><span class="pi-bval">${v}</span></div>`).join('')}
        </div>
        <div class="pi-ins"><div class="pi-it">💡 Peak window: 10am–1pm · Body primed for deep work</div></div>
      </div>
    </div>
    <div class="phone-b">
      <div class="pi" style="padding:18px 14px">
        <div class="pi-label">SLEEP LAST NIGHT</div>
        <div style="font-size:52px;font-weight:700;font-family:Georgia,serif;letter-spacing:-3px;color:${P.accent3};line-height:1">7</div>
        <div style="font-size:10px;color:${P.textMid};margin-bottom:8px">hrs 24 min · Deep 22% · REM 19%</div>
        <svg width="100%" height="50" viewBox="0 0 172 50" fill="none">
          <path d="M0 35 C8 12 16 40 26 24 C36 8 44 38 56 26 C68 14 76 36 88 20 C100 4 108 34 120 18 C132 2 140 32 152 16 L172 22 L172 50 L0 50 Z" fill="${P.accent3}22" stroke="${P.accent3}" stroke-width="1.5"/>
        </svg>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:10px">
          ${[['Duration','88',P.accent],['Efficiency','91',P.accent],['Timing','74',P.warn],['Rest','82',P.accent3]].map(([l,v,c])=>`<div style="background:${P.bg};border-radius:8px;padding:6px"><div style="font-size:7px;color:${P.textFaint}">${l}</div><div style="font-size:14px;font-weight:700;font-family:Georgia,serif;color:${c}">${v}</div></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<div class="metrics-strip">
  <div class="metrics-inner">
    <div class="metric"><div class="metric-val">5<span>screens</span></div><div class="metric-label">COMPLETE FLOW</div></div>
    <div class="metric"><div class="metric-val" style="color:${P.accent}">84<span>%</span></div><div class="metric-label">RECOVERY SCORE</div></div>
    <div class="metric"><div class="metric-val" style="color:${P.accent3}">7.4<span>hrs</span></div><div class="metric-label">SLEEP TRACKED</div></div>
    <div class="metric"><div class="metric-val">4<span>signals</span></div><div class="metric-label">BIOMETRICS MERGED</div></div>
    <div class="metric"><div class="metric-val" style="color:${P.accent2}">1<span>palette</span></div><div class="metric-label">WARM PARCHMENT</div></div>
  </div>
</div>

<section class="section" id="features">
  <div class="eyebrow">Core Features</div>
  <h2 class="section-h2">Every metric that matters</h2>
  <p class="section-sub">Built around the biometrics your ring collects all night, translated into plain language you can act on.</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="fi" style="background:color-mix(in srgb,${P.accent} 12%,transparent)">◎</div>
      <div class="ft">Recovery Score</div>
      <p class="fb">A single editorial number — 0 to 100 — synthesising HRV, sleep quality, resting heart rate, and activity load into one honest daily verdict.</p>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:color-mix(in srgb,${P.accent3} 12%,transparent)">∿</div>
      <div class="ft">Sleep Architecture</div>
      <p class="fb">Visualise your actual sleep stages with an organic wave HRV overlay. Deep, REM, light, awake — not just hours, but quality.</p>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:color-mix(in srgb,${P.accent2} 12%,transparent)">◈</div>
      <div class="ft">Focus Windows</div>
      <p class="fb">AI maps your biometric rhythm to identify daily cognitive peak windows, creative flow states, and physical prime times — personalised, not generic.</p>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:color-mix(in srgb,${P.warn} 12%,transparent)">△</div>
      <div class="ft">Stress Detection</div>
      <p class="fb">Cortisol-proxy patterns surfaced from HRV dips throughout the day. Know which meetings, habits, or times are driving your load.</p>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:color-mix(in srgb,${P.accent} 12%,transparent)">∷</div>
      <div class="ft">AI Insights Feed</div>
      <p class="fb">Evidence-based observations delivered daily, grounded in your 90-day biometric history. Specific, actionable, yours.</p>
    </div>
    <div class="feature-card">
      <div class="fi" style="background:color-mix(in srgb,${P.accent2} 12%,transparent)">⊕</div>
      <div class="ft">Trend Intelligence</div>
      <p class="fb">Weekly and monthly views reveal the patterns daily snapshots miss — sleep debt accumulation, training balance, recovery trajectories.</p>
    </div>
  </div>
</section>

<div class="quote-section">
  <p class="quote-text">"Recovery is not the absence of training — it's the presence of readiness."</p>
  <p class="quote-attr">Design principle behind MEND</p>
</div>

<section class="section" id="how">
  <div class="eyebrow">How It Works</div>
  <h2 class="section-h2">From ring to insight</h2>
  <p class="section-sub">Four steps from raw biometric data to actionable daily intelligence.</p>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <h4>Ring syncs overnight</h4>
      <p>Your smart ring captures HRV, SpO₂, skin temperature, and movement through every sleep stage.</p>
    </div>
    <div class="step">
      <div class="step-num" style="background:color-mix(in srgb,${P.accent3} 12%,transparent);color:${P.accent3}">2</div>
      <h4>MEND processes signals</h4>
      <p>Our model weights your biometrics against your 90-day personal baseline — not a population average.</p>
    </div>
    <div class="step">
      <div class="step-num" style="background:color-mix(in srgb,${P.accent2} 12%,transparent);color:${P.accent2}">3</div>
      <h4>Score + windows generated</h4>
      <p>By 7am your recovery score, focus windows, and sleep breakdown are ready before your first coffee.</p>
    </div>
    <div class="step">
      <div class="step-num" style="background:color-mix(in srgb,${P.warn} 12%,transparent);color:${P.warn}">4</div>
      <h4>Act on it</h4>
      <p>Know whether to push hard, train light, rest, or shift that important meeting to your peak cognitive window.</p>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-inner">
    <div class="eyebrow">All Screens</div>
    <h2 class="section-h2" style="margin-bottom:12px">5-screen prototype</h2>
    <p class="section-sub">From welcome through to weekly insights — a complete design system.</p>
    <div class="screens-scroll">
      <div class="screen-card"><div class="screen-label">01 — Welcome</div><div class="sv">
        <div style="text-align:center;padding-top:36px">
          <div style="width:70px;height:70px;border-radius:50%;background:${P.accent}18;display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><span style="font-size:28px;color:${P.accent}">○</span></div>
          <div style="font-size:9px;color:${P.textFaint};letter-spacing:1px">GOOD MORNING</div>
          <div style="font-size:32px;font-weight:700;font-family:Georgia,serif;letter-spacing:-2px;color:${P.text}">Alex.</div>
          <div style="height:1px;background:${P.surface2};margin:8px 24px"></div>
          <div style="font-size:10px;color:${P.textMid};margin-bottom:14px">Your score is ready</div>
          <div style="background:${P.accent};color:#fff;border-radius:100px;padding:8px 20px;font-size:10px;font-weight:700;display:inline-block">See Today's Score</div>
        </div>
      </div></div>
      <div class="screen-card"><div class="screen-label">02 — Today</div><div class="sv">
        <div style="background:${P.surface};border-radius:12px;padding:10px;margin-bottom:8px">
          <div style="font-size:8px;letter-spacing:1px;color:${P.textFaint}">RECOVERY SCORE</div>
          <div style="font-size:52px;font-weight:700;font-family:Georgia,serif;letter-spacing:-3px;color:${P.text};line-height:1">84</div>
          <div style="font-size:9px;color:${P.accent}">↑ Good · +6pts</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-bottom:8px">
          ${[['62','HRV',P.accent],['7.4','sleep',P.accent3],['58','bpm',P.accent2]].map(([v,l,c])=>`<div style="background:${P.surface};border-radius:8px;padding:6px;text-align:center"><div style="font-size:16px;font-weight:700;font-family:Georgia,serif;color:${c}">${v}</div><div style="font-size:7px;color:${P.textFaint}">${l}</div></div>`).join('')}
        </div>
        <div style="background:${P.surface};border-radius:8px;padding:8px">
          <div style="font-size:7px;letter-spacing:.8px;color:${P.accent}">TODAY'S FOCUS</div>
          <div style="font-size:10px;font-weight:600;color:${P.text}">Deep work primed</div>
          <div style="font-size:8px;color:${P.textMid}">Peak window: 10am–1pm</div>
        </div>
      </div></div>
      <div class="screen-card"><div class="screen-label">03 — Sleep</div><div class="sv">
        <div style="font-size:9px;color:${P.textFaint};letter-spacing:.8px">LAST NIGHT</div>
        <div style="font-size:44px;font-weight:700;font-family:Georgia,serif;letter-spacing:-3px;color:${P.accent3};line-height:1">7</div>
        <div style="font-size:10px;color:${P.textMid};margin-bottom:8px">hrs 24 min</div>
        <div style="display:flex;gap:4px;margin-bottom:10px">
          ${[['DEEP',P.accent3],['REM',P.accent],['Light',P.textFaint]].map(([l,c])=>`<span style="font-size:7px;background:${c}22;color:${c};padding:2px 6px;border-radius:100px;font-weight:600">${l}</span>`).join('')}
        </div>
        <svg width="100%" height="44" viewBox="0 0 172 44" fill="none">
          <path d="M0 32 C8 10 16 36 26 20 C36 4 44 34 56 22 C68 10 76 30 88 16 C100 2 108 28 120 14 C132 0 140 26 152 12 L172 18 L172 44 L0 44 Z" fill="${P.accent3}22" stroke="${P.accent3}" stroke-width="1.5"/>
        </svg>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:8px">
          ${[['Dur','88',P.accent],['Eff','91',P.accent],['Time','74',P.warn],['Rest','82',P.accent3]].map(([l,v,c])=>`<div style="background:${P.surface};border-radius:8px;padding:5px"><div style="font-size:7px;color:${P.textFaint}">${l}</div><div style="font-size:14px;font-weight:700;font-family:Georgia,serif;color:${c}">${v}</div></div>`).join('')}
        </div>
      </div></div>
      <div class="screen-card"><div class="screen-label">04 — Focus</div><div class="sv">
        <div style="background:${P.surface};border-radius:12px;padding:10px;margin-bottom:8px;border-top:3px solid ${P.accent}">
          <div style="font-size:8px;letter-spacing:.8px;color:${P.accent}">PEAK WINDOW</div>
          <div style="font-size:22px;font-weight:700;font-family:Georgia,serif;letter-spacing:-1px;color:${P.text}">10am — 1pm</div>
          <div style="font-size:9px;color:${P.textMid}">Deep work · Strategy · Learning</div>
        </div>
        ${[['7–8:30am','Morning Reset',P.accent3,false],['10am–1pm','Peak Cognitive',P.accent,true],['2–3:30pm','Creative Flow',P.accent2,false],['5–6:30pm','Physical Prime',P.warn,false]].map(([t,n,c,a])=>`
          <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid ${P.surface2}">
            <span style="width:7px;height:7px;border-radius:50%;background:${c};flex-shrink:0"></span>
            <div style="flex:1"><div style="font-size:9px;font-weight:600;color:${P.text}">${n}</div><div style="font-size:8px;color:${P.textFaint}">${t}</div></div>
            ${a?`<span style="font-size:8px;color:${P.accent}">NOW</span>`:''}
          </div>`).join('')}
      </div></div>
      <div class="screen-card"><div class="screen-label">05 — Insights</div><div class="sv">
        <div style="background:${P.surface};border-radius:10px;padding:8px;margin-bottom:8px">
          <div style="display:flex;gap:12px">
            ${[['84',P.accent,'avg rec'],['7.2',P.accent3,'sleep hrs'],['↑12%',P.positive,'hrv']].map(([v,c,l])=>`<div style="text-align:center;flex:1"><div style="font-size:16px;font-weight:700;font-family:Georgia,serif;color:${c}">${v}</div><div style="font-size:7px;color:${P.textFaint}">${l}</div></div>`).join('')}
          </div>
        </div>
        ${[['◎','HRV 5-day trend up',P.accent],['∿','Sleep timing shifted',P.accent3],['△','Wed stress spike noted',P.accent2],['◈','Focus window stable',P.positive]].map(([ic,txt,c])=>`
          <div style="background:${P.surface};border-radius:8px;padding:7px;margin-bottom:5px;border-left:3px solid ${c}">
            <div style="display:flex;align-items:center;gap:6px"><span style="color:${c};font-size:12px">${ic}</span><div style="font-size:9px;font-weight:600;color:${P.text}">${txt}</div></div>
          </div>`).join('')}
      </div></div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="cta-card">
    <h2>Ready to see the design?</h2>
    <p>Explore the full 5-screen prototype in the viewer or the interactive mock.</p>
    <a class="btn-white" href="https://ram.zenbin.org/mend-viewer">Open Viewer →</a>
    <div class="cta-links">
      <a href="https://ram.zenbin.org/mend-mock">Interactive Mock ☀◑</a>
      <a href="https://ram.zenbin.org/mend">Hero Page</a>
    </div>
  </div>
</section>

<footer>
  <p>MEND — Recovery Intelligence · A RAM Design Heartbeat prototype · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:6px">Inspired by Dribbble's #1 popular "Smart Ring App — Health Tracking Mobile UI" and Dawn AI (lapa.ninja)</p>
</footer>
</body>
</html>`;

// ── Main pipeline ────────────────────────────────────────────────────────────
async function run() {
  // 1. Hero page
  console.log('🌿 Publishing hero page…');
  const heroRes = await publish(SLUG, HERO_HTML, `${APP} — ${TAGLINE}`);
  console.log('   Hero:', heroRes.url || JSON.stringify(heroRes).slice(0,120));

  // 2. Viewer
  console.log('🖥  Publishing viewer…');
  const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MEND — Pencil Viewer</title>
<script src="https://cdn.zenbin.org/pencil-viewer.js"><\/script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:${P.bg}; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; gap:20px; }
  #viewer { width:390px; height:844px; border-radius:44px; overflow:hidden;
    box-shadow: 0 40px 80px rgba(62,107,74,0.15), 0 8px 24px rgba(0,0,0,0.06); }
  .back { position:fixed; top:20px; left:20px; color:${P.accent}; font-family:system-ui;
    font-size:13px; text-decoration:none; background:rgba(253,252,250,0.95);
    padding:8px 16px; border-radius:20px; border:1px solid ${P.surface2}; font-weight:700; }
  .mock-link { color:${P.accent}; font-family:system-ui; font-size:13px; text-decoration:none;
    padding:8px 16px; border-radius:20px; border:1px solid ${P.surface2}; background:rgba(253,252,250,0.95); font-weight:600; }
</style>
</head>
<body>
<a class="back" href="https://ram.zenbin.org/mend">← MEND</a>
<div id="viewer"></div>
<a class="mock-link" href="https://ram.zenbin.org/mend-mock">Interactive Mock ☀◑</a>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#viewer', window.EMBEDDED_PEN);
    }
  });
<\/script>
</body>
</html>`;

  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Design Viewer`);
  console.log('   Viewer:', viewerRes.url || JSON.stringify(viewerRes).slice(0,120));

  console.log('\n✅ Hero + Viewer published.');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(err => {
  console.error('Pipeline error:', err.message);
  process.exit(1);
});
