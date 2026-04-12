// vitro-publish.js — VITRO: Longevity Biomarker Tracker
// Inspired by: "Superpower" health app on godly.website —
//   warm amber photography meets clinical-precise data cards.
// Light theme: warm cream (#FAF7F2) + terracotta (#C8622A) + forest green.

'use strict';
const https = require('https');
const fs    = require('fs');

const SLUG      = 'vitro';
const APP_NAME  = 'VITRO';
const TAGLINE   = 'know your biology. own your future.';
const ARCHETYPE = 'longevity-health-tracker';
const ZENBIN_SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT  = 'Light-theme longevity biomarker tracker inspired by Superpower health app on godly.website — warm amber photography meets clinical white data cards. Warm cream (#FAF7F2) + terracotta (#C8622A) palette. Five screens: Vitality Score (longevity score 82/100 with weekly sparkline), Blood Panel (42 biomarkers with optimal/borderline/risk status), Recovery (HRV trend chart + sleep stages + readiness factors), Supplement Stack (3 timing windows with adherence tracking), and AI Insights (prioritised personalised recommendations).';

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

// ═══════════════════════════════════════════════════════════════════════════════
// HERO PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VITRO — Know Your Biology. Own Your Future.</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #FAF7F2;
    --surface:  #FFFFFF;
    --surfaceAlt: #F5F0E8;
    --text:     #1C1917;
    --muted:    rgba(28,25,23,0.50);
    --accent:   #C8622A;
    --accentDim: rgba(200,98,42,0.10);
    --green:    #2D6A4F;
    --greenDim: rgba(45,106,79,0.10);
    --yellow:   #B45309;
    --yellowDim: rgba(180,83,9,0.10);
    --red:      #9B1C1C;
    --border:   rgba(28,25,23,0.08);
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Nav ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,247,242,0.88);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .nav-brand { font-size: 14px; font-weight: 800; letter-spacing: 3px; color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    border: none; border-radius: 8px;
    padding: 8px 20px; font-size: 13px; font-weight: 600;
    cursor: pointer; text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── Hero ── */
  .hero {
    max-width: 1100px; margin: 0 auto;
    padding: 96px 40px 80px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accentDim); border: 1px solid rgba(200,98,42,0.2);
    border-radius: 20px; padding: 4px 14px;
    font-size: 11px; font-weight: 700; color: var(--accent);
    letter-spacing: 0.8px; text-transform: uppercase;
    margin-bottom: 20px;
  }
  .hero-title {
    font-size: clamp(40px, 5vw, 60px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-bottom: 20px;
  }
  .hero-title span { color: var(--accent); }
  .hero-sub {
    font-size: 18px; color: var(--muted); line-height: 1.65;
    margin-bottom: 36px; max-width: 440px;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; }
  .btn-primary {
    background: var(--accent); color: #fff;
    border-radius: 10px; padding: 14px 28px;
    font-size: 14px; font-weight: 700;
    text-decoration: none; transition: opacity .2s, transform .2s;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-secondary {
    color: var(--text); font-size: 14px; font-weight: 500;
    text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
    transition: color .2s;
  }
  .btn-secondary:hover { color: var(--accent); }

  /* ── Hero phone mock ── */
  .hero-phone-wrap { position: relative; display: flex; justify-content: center; }
  .hero-phone {
    width: 280px; height: 560px;
    background: var(--surface);
    border-radius: 44px;
    border: 2px solid var(--border);
    box-shadow: 0 24px 64px rgba(28,25,23,0.10), 0 4px 16px rgba(200,98,42,0.06);
    overflow: hidden; position: relative;
  }
  .phone-screen { width: 100%; height: 100%; padding: 20px 16px 12px; }
  .phone-status { display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); margin-bottom: 12px; }
  .phone-score-card {
    background: var(--surfaceAlt);
    border-radius: 16px; padding: 16px; margin-bottom: 12px;
    border-top: 3px solid var(--accent);
  }
  .phone-score-num { font-size: 52px; font-weight: 800; color: var(--accent); line-height: 1; }
  .phone-score-label { font-size: 10px; color: var(--muted); margin-top: 4px; }
  .phone-metric-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px; }
  .phone-metric {
    background: var(--surface); border-radius: 10px;
    border: 1px solid var(--border); padding: 8px;
    text-align: center;
  }
  .phone-metric-val { font-size: 16px; font-weight: 700; color: var(--green); }
  .phone-metric-lbl { font-size: 8px; color: var(--muted); margin-top: 1px; }
  .phone-alert {
    background: var(--yellowDim); border: 1px solid var(--yellow);
    border-left: 3px solid var(--yellow); border-radius: 10px;
    padding: 8px 10px; font-size: 10px; color: var(--yellow); font-weight: 600;
  }

  /* Phone glow halo */
  .hero-phone-wrap::before {
    content: ''; position: absolute;
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(200,98,42,0.12) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    pointer-events: none; z-index: -1;
  }

  /* ── Social proof ── */
  .trust-bar {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 24px 40px;
    display: flex; justify-content: center; gap: 60px;
    max-width: 1100px; margin: 0 auto;
  }
  .trust-item { text-align: center; }
  .trust-value { font-size: 28px; font-weight: 800; color: var(--accent); }
  .trust-label { font-size: 12px; color: var(--muted); margin-top: 2px; letter-spacing: 0.3px; }

  /* ── Features ── */
  .features {
    max-width: 1100px; margin: 80px auto; padding: 0 40px;
  }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: var(--accent);
    text-align: center; margin-bottom: 12px;
  }
  .section-title {
    font-size: 36px; font-weight: 800; text-align: center;
    letter-spacing: -0.02em; margin-bottom: 50px;
    color: var(--text);
  }
  .feature-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px; padding: 28px;
    transition: box-shadow .2s, transform .2s;
  }
  .feature-card:hover {
    box-shadow: 0 8px 32px rgba(28,25,23,0.08);
    transform: translateY(-2px);
  }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--accentDim); display: flex; align-items: center;
    justify-content: center; font-size: 20px; margin-bottom: 16px;
  }
  .feature-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feature-body { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* ── Biomarker showcase ── */
  .biomarker-section {
    background: var(--surfaceAlt);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 80px 40px;
  }
  .biomarker-inner {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .biomarker-list { display: flex; flex-direction: column; gap: 10px; }
  .biomarker-row {
    background: var(--surface);
    border: 1px solid var(--border); border-radius: 12px;
    padding: 12px 16px; display: flex; align-items: center; gap: 12px;
    transition: box-shadow .2s;
  }
  .biomarker-row:hover { box-shadow: 0 4px 16px rgba(28,25,23,0.07); }
  .bio-bar { width: 4px; height: 36px; border-radius: 2px; flex-shrink: 0; }
  .bio-name { flex: 1; }
  .bio-name-main { font-size: 13px; font-weight: 600; }
  .bio-name-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
  .bio-value { font-size: 13px; font-weight: 700; margin-right: 8px; }
  .bio-badge {
    padding: 3px 8px; border-radius: 6px;
    font-size: 10px; font-weight: 700;
  }
  .opt  { background: var(--greenDim);  color: var(--green); }
  .bord { background: var(--yellowDim); color: var(--yellow); }
  .risk { background: #FEE2E2;          color: var(--red); }

  .biomarker-copy h2 { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 16px; }
  .biomarker-copy p  { font-size: 16px; color: var(--muted); line-height: 1.65; margin-bottom: 24px; }
  .tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag { background: var(--accentDim); border: 1px solid rgba(200,98,42,0.18);
         border-radius: 20px; padding: 4px 12px;
         font-size: 12px; font-weight: 500; color: var(--accent); }

  /* ── Screens preview ── */
  .screens-section { max-width: 1100px; margin: 80px auto; padding: 0 40px; }
  .screens-row { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 10px; justify-content: center; }
  .screen-thumb {
    flex-shrink: 0; width: 180px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 24px; padding: 16px;
    text-align: center; transition: box-shadow .2s;
  }
  .screen-thumb:hover { box-shadow: 0 8px 24px rgba(28,25,23,0.08); }
  .screen-num { font-size: 24px; font-weight: 800; color: var(--accent); margin-bottom: 6px; }
  .screen-lbl { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .screen-desc { font-size: 11px; color: var(--muted); line-height: 1.5; }

  /* ── CTA ── */
  .cta-section {
    background: var(--accent); padding: 80px 40px; text-align: center;
  }
  .cta-title { font-size: 36px; font-weight: 800; color: #fff; letter-spacing: -0.02em; margin-bottom: 14px; }
  .cta-sub { font-size: 16px; color: rgba(255,255,255,0.75); margin-bottom: 32px; }
  .cta-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff; color: var(--accent);
    padding: 14px 32px; border-radius: 10px;
    font-size: 15px; font-weight: 700; text-decoration: none;
    transition: opacity .2s;
  }
  .cta-btn:hover { opacity: 0.92; }

  /* ── Footer ── */
  footer {
    background: var(--surfaceAlt); padding: 40px;
    border-top: 1px solid var(--border); text-align: center;
    font-size: 12px; color: var(--muted);
  }
  footer strong { color: var(--accent); font-weight: 700; letter-spacing: 2px; }

  @media (max-width: 768px) {
    .hero, .biomarker-inner { grid-template-columns: 1fr; }
    .hero { padding: 48px 24px 40px; }
    .feature-grid { grid-template-columns: 1fr; }
    .hero-phone-wrap { order: -1; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    .trust-bar { gap: 32px; flex-wrap: wrap; padding: 24px 20px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-brand">VITRO</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#biomarkers">Biomarkers</a>
    <a href="#screens">Screens</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/vitro-mock">Try Mock →</a>
</nav>

<section>
  <div class="hero">
    <div class="hero-copy">
      <div class="hero-eyebrow">🧬 Longevity Intelligence</div>
      <h1 class="hero-title">Know your <span>biology.</span><br>Own your future.</h1>
      <p class="hero-sub">VITRO tracks your 42+ biomarkers, HRV, sleep stages, and supplement stack — turning raw lab data into a clear longevity roadmap.</p>
      <div class="hero-actions">
        <a class="btn-primary" href="https://ram.zenbin.org/vitro-mock">Explore prototype →</a>
        <a class="btn-secondary" href="https://ram.zenbin.org/vitro-viewer">View in Pencil ↗</a>
      </div>
    </div>
    <div class="hero-phone-wrap">
      <div class="hero-phone">
        <div class="phone-screen">
          <div class="phone-status"><span>9:41</span><span>●●●</span></div>
          <div class="phone-score-card">
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:rgba(200,98,42,0.6);margin-bottom:6px;">VITALITY SCORE</div>
            <div style="display:flex;align-items:flex-end;gap:6px;">
              <div class="phone-score-num">82</div>
              <div style="font-size:16px;color:rgba(28,25,23,0.4);margin-bottom:10px;">/ 100</div>
            </div>
            <div class="phone-score-label">Biological age: <strong style="color:#2D6A4F">34.2 yrs</strong> &nbsp;↑ +14 pts this week</div>
          </div>
          <div class="phone-metric-row">
            <div class="phone-metric">
              <div class="phone-metric-val">58</div>
              <div class="phone-metric-lbl">HRV ms</div>
            </div>
            <div class="phone-metric">
              <div class="phone-metric-val" style="color:#C8622A">94</div>
              <div class="phone-metric-lbl">Glucose</div>
            </div>
            <div class="phone-metric">
              <div class="phone-metric-val">74</div>
              <div class="phone-metric-lbl">Recovery</div>
            </div>
          </div>
          <div class="phone-alert">⚠ ApoB elevated — review blood panel</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="trust-bar">
  <div class="trust-item"><div class="trust-value">42+</div><div class="trust-label">Biomarkers tracked</div></div>
  <div class="trust-item"><div class="trust-value">5</div><div class="trust-label">Data screens</div></div>
  <div class="trust-item"><div class="trust-value">11</div><div class="trust-label">Supplement protocols</div></div>
  <div class="trust-item"><div class="trust-value">AI</div><div class="trust-label">Personalised insights</div></div>
</div>

<section id="features" class="features">
  <div class="section-label">What VITRO does</div>
  <h2 class="section-title">Your entire biology, one dashboard</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">🩸</div>
      <div class="feature-title">Blood Panel Intelligence</div>
      <div class="feature-body">Upload your lab results and VITRO categorises every marker — optimal, borderline, or risk — with trend tracking across tests.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">💓</div>
      <div class="feature-title">Recovery & HRV Tracking</div>
      <div class="feature-body">Syncs with Oura, Garmin, and Whoop. Visualises HRV trends, sleep stages, and readiness scores with daily context.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🧪</div>
      <div class="feature-title">Supplement Stack Manager</div>
      <div class="feature-body">Organise your protocol by timing window. Track daily adherence, flag interactions, and measure downstream biomarker effects.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🤖</div>
      <div class="feature-title">AI Longevity Insights</div>
      <div class="feature-body">Prioritised, evidence-backed recommendations for your specific biomarker profile — diet, training, supplementation, and testing cadence.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📈</div>
      <div class="feature-title">Biological Age Score</div>
      <div class="feature-body">Composite longevity score calculated from blood markers, HRV, VO₂ max, and body composition. Track it weekly as you optimise.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🎯</div>
      <div class="feature-title">Testing Protocols</div>
      <div class="feature-body">Know exactly what to test, when to test, and how to read results. VITRO generates personalised testing schedules by quarter.</div>
    </div>
  </div>
</section>

<section id="biomarkers" class="biomarker-section">
  <div class="biomarker-inner">
    <div class="biomarker-list">
      <div class="biomarker-row">
        <div class="bio-bar" style="background:#9B1C1C"></div>
        <div class="bio-name"><div class="bio-name-main">ApoB</div><div class="bio-name-sub">Cardiovascular risk marker</div></div>
        <div class="bio-value" style="color:#9B1C1C">112 mg/dL</div>
        <div class="bio-badge risk">Risk</div>
      </div>
      <div class="biomarker-row">
        <div class="bio-bar" style="background:#B45309"></div>
        <div class="bio-name"><div class="bio-name-main">LDL-C</div><div class="bio-name-sub">Low-density lipoprotein</div></div>
        <div class="bio-value" style="color:#B45309">118 mg/dL</div>
        <div class="bio-badge bord">Borderline</div>
      </div>
      <div class="biomarker-row">
        <div class="bio-bar" style="background:#2D6A4F"></div>
        <div class="bio-name"><div class="bio-name-main">HDL-C</div><div class="bio-name-sub">High-density lipoprotein</div></div>
        <div class="bio-value" style="color:#2D6A4F">68 mg/dL</div>
        <div class="bio-badge opt">Optimal</div>
      </div>
      <div class="biomarker-row">
        <div class="bio-bar" style="background:#2D6A4F"></div>
        <div class="bio-name"><div class="bio-name-main">HbA1c</div><div class="bio-name-sub">3-month glucose average</div></div>
        <div class="bio-value" style="color:#2D6A4F">5.3%</div>
        <div class="bio-badge opt">Optimal</div>
      </div>
      <div class="biomarker-row">
        <div class="bio-bar" style="background:#B45309"></div>
        <div class="bio-name"><div class="bio-name-main">hsCRP</div><div class="bio-name-sub">Systemic inflammation</div></div>
        <div class="bio-value" style="color:#B45309">1.2 mg/L</div>
        <div class="bio-badge bord">Borderline</div>
      </div>
      <div class="biomarker-row">
        <div class="bio-bar" style="background:#2D6A4F"></div>
        <div class="bio-name"><div class="bio-name-main">Glucose (fasting)</div><div class="bio-name-sub">Metabolic health</div></div>
        <div class="bio-value" style="color:#2D6A4F">94 mg/dL</div>
        <div class="bio-badge opt">Optimal</div>
      </div>
    </div>
    <div class="biomarker-copy">
      <h2>42 markers. Every status. Clear context.</h2>
      <p>VITRO doesn't just show you a number — it shows you whether that number is optimal for longevity, which direction it's trending, and exactly what to do about it.</p>
      <div class="tag-cloud">
        <span class="tag">Lipids</span>
        <span class="tag">Metabolic</span>
        <span class="tag">Inflammation</span>
        <span class="tag">CBC</span>
        <span class="tag">Hormones</span>
        <span class="tag">Thyroid</span>
        <span class="tag">Vitamins</span>
        <span class="tag">Heavy Metals</span>
      </div>
    </div>
  </div>
</section>

<section id="screens" class="screens-section">
  <div class="section-label">The prototype</div>
  <h2 class="section-title">5 screens. Everything you need.</h2>
  <div class="screens-row">
    <div class="screen-thumb">
      <div class="screen-num">01</div>
      <div class="screen-lbl">Vitality Score</div>
      <div class="screen-desc">Longevity score, weekly trend sparkline, top metric cards</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-num">02</div>
      <div class="screen-lbl">Blood Panel</div>
      <div class="screen-desc">42 biomarkers, status colour codes, trend arrows</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-num">03</div>
      <div class="screen-lbl">Recovery</div>
      <div class="screen-desc">HRV chart, sleep stages bar, readiness factors</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-num">04</div>
      <div class="screen-lbl">Stack</div>
      <div class="screen-desc">Supplement timing windows, daily adherence tracker</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-num">05</div>
      <div class="screen-lbl">Insights</div>
      <div class="screen-desc">AI-prioritised personalised longevity recommendations</div>
    </div>
  </div>
  <div style="text-align:center;margin-top:40px">
    <a class="btn-primary" href="https://ram.zenbin.org/vitro-mock">Explore interactive mock →</a>
  </div>
</section>

<section class="cta-section">
  <h2 class="cta-title">Your biology is the ultimate dataset.</h2>
  <p class="cta-sub">Start tracking what actually moves the needle on longevity.</p>
  <a class="cta-btn" href="https://ram.zenbin.org/vitro-mock">Open prototype</a>
</section>

<footer>
  <p>Designed by <strong>RAM</strong> — Design AI · RAM Design Heartbeat · March 2026</p>
  <p style="margin-top:8px">Inspired by Superpower health app on godly.website</p>
</footer>

</body>
</html>`;

// ── Viewer page ───────────────────────────────────────────────────────────────
function buildViewer(penJson) {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VITRO — Prototype Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAF7F2; display: flex; flex-direction: column; align-items: center;
         min-height: 100vh; font-family: Inter, sans-serif; padding: 20px; }
  h1 { font-size: 14px; font-weight: 800; letter-spacing: 3px; color: #C8622A;
       margin-bottom: 4px; margin-top: 8px; }
  p  { font-size: 12px; color: rgba(28,25,23,0.5); margin-bottom: 16px; }
  #pencil-viewer { width: 390px; height: 864px; border-radius: 32px;
                   box-shadow: 0 16px 48px rgba(28,25,23,0.12), 0 4px 16px rgba(200,98,42,0.08);
                   overflow: hidden; }
</style>
<script>EMBEDDED_PEN_PLACEHOLDER</script>
<script src="https://cdn.pencil.dev/viewer/v1/pencil-viewer.min.js"></script>
</head>
<body>
  <h1>VITRO</h1>
  <p>know your biology. own your future.</p>
  <div id="pencil-viewer"></div>
  <script>
    if (window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN) });
    }
  </script>
</body>
</html>`;
  const injection = 'window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';';
  viewerHtml = viewerHtml.replace('EMBEDDED_PEN_PLACEHOLDER', injection);
  return viewerHtml;
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
(async () => {
  // a) Hero page
  console.log('Publishing hero page…');
  const heroRes = await zenPublish(SLUG, heroHtml, 'VITRO — Know Your Biology. Own Your Future.');
  console.log('Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 80));

  // b) Viewer
  console.log('Publishing viewer…');
  const penJson  = fs.readFileSync('/workspace/group/design-studio/vitro.pen', 'utf8');
  const viewerHtml = buildViewer(penJson);
  const viewerRes  = await zenPublish(SLUG + '-viewer', viewerHtml, 'VITRO — Prototype Viewer');
  console.log('Viewer:', viewerRes.status, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 80));

  // c) Gallery queue
  console.log('Updating gallery queue…');
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
  console.log('Gallery queue:', putRes.status === 200 ? '✓ updated' : putRes.body.slice(0, 100));

  // d) Design DB
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, newEntry);
    rebuildEmbeddings(db);
    console.log('Design DB: ✓ indexed');
  } catch (e) {
    console.log('Design DB: skipped —', e.message);
  }

  console.log('\n✓ VITRO pipeline complete');
  console.log('  Hero:   https://ram.zenbin.org/vitro');
  console.log('  Viewer: https://ram.zenbin.org/vitro-viewer');
  console.log('  Mock:   https://ram.zenbin.org/vitro-mock');
})();
