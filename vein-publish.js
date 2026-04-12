#!/usr/bin/env node
// vein-publish.js — VEIN hero page + viewer publisher

const fs = require('fs');
const https = require('https');

const SLUG = 'vein';
const APP_NAME = 'VEIN';
const TAGLINE = 'Biometric intelligence, alive in the dark';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VEIN — Biometric intelligence, alive in the dark</title>
  <meta name="description" content="VEIN renders your body data as glowing, luminous art. Heart rate, sleep, recovery and AI-generated insights — all on a warm obsidian canvas.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:       #0E0B09;
      --surface:  #1A1410;
      --surface2: #241D18;
      --surface3: #2E2620;
      --border:   rgba(255,200,140,0.10);
      --border-hi:rgba(255,200,140,0.22);
      --amber:    #F97316;
      --amber-glow: rgba(249,115,22,0.18);
      --amberDim: #C45C0A;
      --rose:     #FB7185;
      --gold:     #FBBF24;
      --text:     #F5EDE4;
      --textSub:  #C4A882;
      --textDim:  #7A6B5C;
      --green:    #22C55E;
      --blue:     #60A5FA;
    }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; min-height: 100vh; overflow-x: hidden; }

    /* ambient warm orbs */
    .orb { position: fixed; border-radius: 50%; filter: blur(110px); pointer-events: none; z-index: 0; }
    .orb-1 { width: 560px; height: 560px; top: -180px; left: -120px; background: rgba(249,115,22,0.08); }
    .orb-2 { width: 480px; height: 480px; bottom: -80px; right: -80px; background: rgba(251,113,133,0.07); }
    .orb-3 { width: 360px; height: 360px; top: 40%; left: 55%; background: rgba(251,191,36,0.05); }

    a { color: var(--amber); text-decoration: none; }

    /* NAV */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(14,11,9,0.85); backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px; height: 58px; }
    .nav-brand { display: flex; align-items: center; gap: 10px; }
    .brand-name { font-size: 16px; font-weight: 900; letter-spacing: 0.12em; color: var(--text); }
    .brand-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber);
      box-shadow: 0 0 8px var(--amber); animation: pulse 2.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px var(--amber)} 50%{opacity:0.5;box-shadow:0 0 16px var(--amber)} }
    .nav-links { display: flex; gap: 36px; }
    .nav-links a { color: var(--textSub); font-size: 13.5px; font-weight: 500; transition: color 0.15s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta { background: var(--amber); color: var(--bg); font-size: 13px;
      font-weight: 700; padding: 9px 20px; border-radius: 8px; letter-spacing: 0.02em; }
    .nav-cta:hover { background: #ff8533; color: var(--bg); }

    /* HERO */
    .hero { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto;
      padding: 152px 80px 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .hero-eyebrow { font-size: 11px; letter-spacing: 0.18em; color: var(--amber);
      text-transform: uppercase; font-weight: 600; margin-bottom: 22px;
      display: flex; align-items: center; gap: 10px; }
    .hero-eyebrow::before { content: ''; display: inline-block; width: 24px; height: 1px; background: var(--amber); }
    .hero-headline { font-family: 'DM Serif Display', Georgia, serif; font-size: 60px;
      line-height: 1.06; letter-spacing: -0.01em; margin-bottom: 26px; }
    .headline-em { font-style: italic; background: linear-gradient(135deg, var(--amber), var(--rose));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-sub { font-size: 17px; color: var(--textSub); line-height: 1.68; max-width: 420px; margin-bottom: 40px; }
    .hero-ctas { display: flex; gap: 12px; align-items: center; }
    .btn-primary { background: var(--amber); color: var(--bg); font-size: 14px;
      font-weight: 700; padding: 13px 26px; border-radius: 8px; }
    .btn-primary:hover { background: #ff8533; color: var(--bg); }
    .btn-ghost { background: transparent; color: var(--text); font-size: 14px;
      font-weight: 500; padding: 13px 26px; border-radius: 8px;
      border: 1px solid var(--border-hi); }
    .btn-ghost:hover { border-color: var(--amber); color: var(--amber); }
    .hero-stats { display: flex; gap: 40px; margin-top: 52px; padding-top: 40px;
      border-top: 1px solid var(--border); }
    .stat-value { font-size: 30px; font-weight: 900; letter-spacing: -0.03em; color: var(--text); }
    .stat-value .accent { color: var(--amber); }
    .stat-value .green { color: var(--green); }
    .stat-label { font-size: 12px; color: var(--textDim); margin-top: 3px; }

    /* Hero mock — phone silhouette */
    .hero-phone { position: relative; display: flex; justify-content: center; }
    .phone-frame { width: 260px; background: var(--surface); border: 1.5px solid var(--border-hi);
      border-radius: 40px; overflow: hidden; padding: 0;
      box-shadow: 0 48px 96px rgba(0,0,0,0.7), 0 0 60px rgba(249,115,22,0.14), 0 0 120px rgba(249,115,22,0.06); }
    .phone-notch { width: 80px; height: 28px; background: var(--bg);
      margin: 0 auto; border-radius: 0 0 18px 18px; }
    .phone-screen { background: var(--bg); padding: 12px 16px 16px; }
    .ps-time { font-size: 11px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .ps-greeting { font-size: 10px; color: var(--textSub); margin-bottom: 2px; }
    .ps-name { font-size: 18px; font-weight: 900; color: var(--text); margin-bottom: 12px; letter-spacing: -0.5px; }
    /* ring */
    .ps-ring-wrap { display: flex; justify-content: center; margin-bottom: 14px; position: relative; }
    .ps-ring-wrap svg { filter: drop-shadow(0 0 18px rgba(249,115,22,0.5)); }
    .ps-ring-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
    .ps-score { font-size: 26px; font-weight: 900; color: var(--text); line-height: 1; letter-spacing: -1px; }
    .ps-score-label { font-size: 7px; color: var(--textSub); letter-spacing: 1.5px; margin-top: 1px; }
    /* stat grid */
    .ps-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
    .ps-stat { background: var(--surface2); border-radius: 10px; padding: 8px 10px;
      border-top: 2px solid; }
    .ps-stat.amber { border-color: var(--amber); }
    .ps-stat.rose  { border-color: var(--rose); }
    .ps-stat.gold  { border-color: var(--gold); }
    .ps-stat.blue  { border-color: var(--blue); }
    .ps-stat-val { font-size: 15px; font-weight: 800; color: var(--text); }
    .ps-stat-lbl { font-size: 8px; color: var(--textDim); margin-top: 1px; }
    /* insight strip */
    .ps-strip { background: var(--amber-glow); border: 0.75px solid var(--amber);
      border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; gap: 8px; }
    .ps-strip-icon { width: 20px; height: 20px; background: var(--amber);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 10px; flex-shrink: 0; }
    .ps-strip-title { font-size: 9px; font-weight: 700; color: var(--text); }
    .ps-strip-sub   { font-size: 8px; color: var(--textSub); }
    /* phone tabs */
    .phone-tabbar { background: var(--surface); border-top: 0.5px solid var(--border);
      display: flex; padding: 8px 0 10px; }
    .phone-tab { flex: 1; text-align: center; font-size: 8px; color: var(--textDim); }
    .phone-tab.active { color: var(--amber); }
    .phone-home { width: 80px; height: 4px; background: var(--textDim);
      border-radius: 2px; margin: 10px auto 0; opacity: 0.4; }

    /* GLOW BARS section — Neon homage */
    .glow-section { position: relative; z-index: 1; padding: 80px 80px;
      max-width: 1200px; margin: 0 auto; }
    .glow-bars { display: flex; align-items: flex-end; gap: 5px; height: 120px;
      margin: 36px 0 16px; }
    .glow-bar { flex: 1; border-radius: 4px 4px 0 0; position: relative; }
    .glow-bar.amber { background: linear-gradient(to top, var(--amberDim), var(--amber));
      box-shadow: 0 -8px 24px rgba(249,115,22,0.5); }
    .glow-bar.rose { background: linear-gradient(to top, #c84062, var(--rose));
      box-shadow: 0 -8px 24px rgba(251,113,133,0.5); }
    .glow-bar.gold { background: linear-gradient(to top, #b88a12, var(--gold));
      box-shadow: 0 -8px 24px rgba(251,191,36,0.5); }
    .glow-bar.dim { background: var(--surface3); }
    .glow-caption { font-size: 12px; color: var(--textDim); }

    /* FEATURES */
    .section { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 60px 80px; }
    .section-eyebrow { font-size: 11px; letter-spacing: 0.18em; color: var(--amber);
      text-transform: uppercase; font-weight: 600; margin-bottom: 14px;
      display: flex; align-items: center; gap: 10px; }
    .section-eyebrow::before { content:''; width:20px; height:1px; background:var(--amber); }
    .section-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 38px;
      line-height: 1.14; letter-spacing: -0.01em; margin-bottom: 48px; }
    .section-title em { font-style: italic; color: var(--amber); }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .feature-card { background: var(--surface2); border: 1px solid var(--border);
      border-radius: 14px; padding: 28px; transition: border-color 0.2s, transform 0.2s; }
    .feature-card:hover { border-color: rgba(249,115,22,0.35); transform: translateY(-3px); }
    .feature-icon { width: 40px; height: 40px; border-radius: 10px;
      background: var(--amber-glow); border: 1px solid rgba(249,115,22,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 18px; }
    .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
    .feature-desc { font-size: 13px; color: var(--textSub); line-height: 1.62; }

    /* SCREENS */
    .screens-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
    .screen-tile { background: var(--surface2); border: 1px solid var(--border);
      border-radius: 12px; padding: 20px 16px; }
    .screen-num { font-size: 10px; letter-spacing: 0.1em; color: var(--textDim);
      font-weight: 600; margin-bottom: 10px; }
    .screen-icon { font-size: 20px; margin-bottom: 10px; }
    .screen-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
    .screen-desc { font-size: 11.5px; color: var(--textSub); line-height: 1.55; }

    /* STATS BAND */
    .stats-band { position: relative; z-index: 1;
      background: var(--surface); border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border); }
    .stats-inner { max-width: 1200px; margin: 0 auto; padding: 48px 80px;
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center; }
    .bsv { font-size: 44px; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 6px;
      background: linear-gradient(135deg, var(--amber), var(--rose));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .bsl { font-size: 13px; color: var(--textSub); }

    /* FOOTER */
    footer { position: relative; z-index: 1; border-top: 1px solid var(--border);
      padding: 44px 80px; max-width: 1200px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center; }
    .footer-brand { font-size: 14px; font-weight: 900; letter-spacing: 0.1em; color: var(--text); }
    .footer-sub { font-size: 12px; color: var(--textDim); margin-top: 4px; }
    .footer-link { font-size: 13px; color: var(--textSub); transition: color 0.15s; }
    .footer-link:hover { color: var(--amber); }

    @media (max-width: 900px) {
      nav { padding: 0 24px; }
      .nav-links { display: none; }
      .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
      .hero-phone { display: none; }
      .hero-headline { font-size: 40px; }
      .section, .glow-section { padding: 48px 24px; }
      .features-grid { grid-template-columns: 1fr; }
      .screens-grid { grid-template-columns: 1fr 1fr; }
      .stats-inner { grid-template-columns: repeat(2,1fr); padding: 40px 24px; }
      footer { padding: 40px 24px; flex-direction: column; gap: 16px; }
    }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <nav>
    <div class="nav-brand">
      <div class="brand-dot"></div>
      <span class="brand-name">VEIN</span>
    </div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#screens">Screens</a>
      <a href="#prototype">Prototype</a>
    </div>
    <a href="https://ram.zenbin.org/vein-viewer" class="nav-cta">Open Prototype →</a>
  </nav>

  <section class="hero">
    <div>
      <div class="hero-eyebrow">Biometric Intelligence</div>
      <h1 class="hero-headline">Your body data,<br><span class="headline-em">rendered alive</span><br>in the dark</h1>
      <p class="hero-sub">VEIN transforms raw biometrics into luminous, glowing art. Heart rate, sleep cycles, recovery scores and AI-generated insights — on a warm obsidian canvas that breathes with you.</p>
      <div class="hero-ctas">
        <a href="https://ram.zenbin.org/vein-viewer" class="btn-primary">Open Prototype →</a>
        <a href="https://ram.zenbin.org/vein-mock" class="btn-ghost">Interactive Mock ☀◑</a>
      </div>
      <div class="hero-stats">
        <div>
          <div class="stat-value"><span class="accent">94</span></div>
          <div class="stat-label">Today's readiness</div>
        </div>
        <div>
          <div class="stat-value"><span class="green">↑12%</span></div>
          <div class="stat-label">HRV trend</div>
        </div>
        <div>
          <div class="stat-value">7h 22m</div>
          <div class="stat-label">Last night's sleep</div>
        </div>
      </div>
    </div>

    <div class="hero-phone">
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="ps-time">9:41</div>
          <div class="ps-greeting">Good morning,</div>
          <div class="ps-name">Alex</div>

          <!-- SVG ring -->
          <div class="ps-ring-wrap">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <!-- track rings -->
              <circle cx="80" cy="80" r="68" stroke="rgba(255,200,150,0.08)" stroke-width="9" fill="none"/>
              <circle cx="80" cy="80" r="50" stroke="rgba(255,200,150,0.08)" stroke-width="8" fill="none"/>
              <circle cx="80" cy="80" r="32" stroke="rgba(255,200,150,0.08)" stroke-width="7" fill="none"/>
              <!-- glow arcs -->
              <circle cx="80" cy="80" r="68" stroke="rgba(249,115,22,0.25)" stroke-width="18" fill="none"
                stroke-dasharray="${(2*Math.PI*68*0.78).toFixed(1)} ${(2*Math.PI*68*0.22).toFixed(1)}"
                stroke-dashoffset="${(2*Math.PI*68*0.25).toFixed(1)}" stroke-linecap="round"/>
              <circle cx="80" cy="80" r="50" stroke="rgba(251,113,133,0.22)" stroke-width="14" fill="none"
                stroke-dasharray="${(2*Math.PI*50*0.62).toFixed(1)} ${(2*Math.PI*50*0.38).toFixed(1)}"
                stroke-dashoffset="${(2*Math.PI*50*0.25).toFixed(1)}" stroke-linecap="round"/>
              <circle cx="80" cy="80" r="32" stroke="rgba(251,191,36,0.20)" stroke-width="12" fill="none"
                stroke-dasharray="${(2*Math.PI*32*0.85).toFixed(1)} ${(2*Math.PI*32*0.15).toFixed(1)}"
                stroke-dashoffset="${(2*Math.PI*32*0.25).toFixed(1)}" stroke-linecap="round"/>
              <!-- solid arcs -->
              <circle cx="80" cy="80" r="68" stroke="#F97316" stroke-width="9" fill="none"
                stroke-dasharray="${(2*Math.PI*68*0.78).toFixed(1)} ${(2*Math.PI*68*0.22).toFixed(1)}"
                stroke-dashoffset="${(2*Math.PI*68*0.25).toFixed(1)}" stroke-linecap="round"/>
              <circle cx="80" cy="80" r="50" stroke="#FB7185" stroke-width="8" fill="none"
                stroke-dasharray="${(2*Math.PI*50*0.62).toFixed(1)} ${(2*Math.PI*50*0.38).toFixed(1)}"
                stroke-dashoffset="${(2*Math.PI*50*0.25).toFixed(1)}" stroke-linecap="round"/>
              <circle cx="80" cy="80" r="32" stroke="#FBBF24" stroke-width="7" fill="none"
                stroke-dasharray="${(2*Math.PI*32*0.85).toFixed(1)} ${(2*Math.PI*32*0.15).toFixed(1)}"
                stroke-dashoffset="${(2*Math.PI*32*0.25).toFixed(1)}" stroke-linecap="round"/>
            </svg>
            <div class="ps-ring-center">
              <div class="ps-score">94</div>
              <div class="ps-score-label">READINESS</div>
            </div>
          </div>

          <div class="ps-stats">
            <div class="ps-stat rose">
              <div class="ps-stat-val">58 <span style="font-size:9px;color:#FB7185">BPM</span></div>
              <div class="ps-stat-lbl">Resting HR</div>
            </div>
            <div class="ps-stat gold">
              <div class="ps-stat-val">7.4 <span style="font-size:9px;color:#FBBF24">hrs</span></div>
              <div class="ps-stat-lbl">Sleep</div>
            </div>
            <div class="ps-stat amber">
              <div class="ps-stat-val">2,840 <span style="font-size:9px;color:#F97316">cal</span></div>
              <div class="ps-stat-lbl">Energy</div>
            </div>
            <div class="ps-stat blue">
              <div class="ps-stat-val">97 <span style="font-size:9px;color:#60A5FA">%</span></div>
              <div class="ps-stat-lbl">SpO₂</div>
            </div>
          </div>

          <div class="ps-strip">
            <div class="ps-strip-icon">✦</div>
            <div>
              <div class="ps-strip-title">Peak Focus: 10:00–12:30</div>
              <div class="ps-strip-sub">Optimal for deep work today</div>
            </div>
          </div>
        </div>
        <div class="phone-tabbar">
          <div class="phone-tab active">◉<br>Home</div>
          <div class="phone-tab">♥<br>Heart</div>
          <div class="phone-tab">◑<br>Sleep</div>
          <div class="phone-tab">◎<br>Recovery</div>
          <div class="phone-tab">✦<br>Insights</div>
        </div>
        <div class="phone-home"></div>
      </div>
    </div>
  </section>

  <!-- Glow bars section (Neon homage) -->
  <div class="glow-section" id="features">
    <div class="section-eyebrow">Data as Ambience</div>
    <h2 class="section-title">Your biometrics, rendered as<br><em>glowing living art</em></h2>
    <div class="glow-bars">
      ${[45,55,62,48,70,85,92,78,65,55,72,95,88,76,60,50,44,58,80,75,65,48,55,62]
        .map((h, i) => {
          const isHigh = h > 80;
          const cls = isHigh ? 'rose' : (h > 65 ? 'amber' : (h > 50 ? 'gold' : 'dim'));
          return `<div class="glow-bar ${cls}" style="height:${h}%"></div>`;
        }).join('')}
    </div>
    <div class="glow-caption">Heart rate distribution — today · 24-hour rolling view</div>

    <div class="features-grid" style="margin-top:56px">
      <div class="feature-card">
        <div class="feature-icon">◉</div>
        <div class="feature-title">Readiness Ring</div>
        <div class="feature-desc">Three nested glowing arcs — activity, HRV, and sleep quality — converge into a single readiness score with ambient glow halos that pulse with your data.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">♥</div>
        <div class="feature-title">Luminous Heart Chart</div>
        <div class="feature-desc">Real-time ECG waveform with a warm glowing trail, plus a 24-bar distribution chart where every bar blooms with ember light. High-intensity zones shift to rose.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◑</div>
        <div class="feature-title">Sleep Stage Timeline</div>
        <div class="feature-desc">A warm horizontal band maps your night: awake · light · deep · REM — each stage color-coded with depth heatmap rows and a bedtime suggestion for tonight.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◎</div>
        <div class="feature-title">Recovery Orb</div>
        <div class="feature-desc">An ambient glow orb radiates warmth from your readiness score. Five concentric halos expand and dim with your recovery level — calm when rested, vivid when peaked.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✦</div>
        <div class="feature-title">AI Insights</div>
        <div class="feature-desc">Four AI-generated cards highlight meaningful correlations: HRV trends, REM lengthening, peak output windows, and breathwork effects — each backed by your real data.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <div class="feature-title">Warm Dark Palette</div>
        <div class="feature-desc">Warm obsidian (#0E0B09) — not pure black. Ember amber + rose accent on a brown-tinged surface. Dark mode that feels alive and body-forward, not cold or clinical.</div>
      </div>
    </div>
  </div>

  <!-- Screens -->
  <section class="section" id="screens">
    <div class="section-eyebrow">5 Screens</div>
    <h2 class="section-title">Every reading, <em>beautifully framed</em></h2>
    <div class="screens-grid">
      <div class="screen-tile">
        <div class="screen-num">01</div>
        <div class="screen-icon">◉</div>
        <div class="screen-name">Home</div>
        <div class="screen-desc">Glowing tri-ring readiness display, 4 biometric stat cards, and an AI focus-window strip.</div>
      </div>
      <div class="screen-tile">
        <div class="screen-num">02</div>
        <div class="screen-icon">♥</div>
        <div class="screen-name">Heart</div>
        <div class="screen-desc">Live BPM, ECG waveform, 24-bar glow chart, and 4 HR zone cards.</div>
      </div>
      <div class="screen-tile">
        <div class="screen-num">03</div>
        <div class="screen-icon">◑</div>
        <div class="screen-name">Sleep</div>
        <div class="screen-desc">Score ring (81), 4 stage cards, horizontal timeline, depth heatmap, and bedtime suggestion.</div>
      </div>
      <div class="screen-tile">
        <div class="screen-num">04</div>
        <div class="screen-icon">◎</div>
        <div class="screen-name">Recovery</div>
        <div class="screen-desc">5-layer ambient orb, 4 metric progress cards, and a training recommendation strip.</div>
      </div>
      <div class="screen-tile">
        <div class="screen-num">05</div>
        <div class="screen-icon">✦</div>
        <div class="screen-name">Insights</div>
        <div class="screen-desc">4 AI-generated cards with left accent bar, metric callout, body copy, and "View analysis" links.</div>
      </div>
    </div>
  </section>

  <!-- Stats -->
  <div class="stats-band">
    <div class="stats-inner">
      <div><div class="bsv">94</div><div class="bsl">Peak readiness score</div></div>
      <div><div class="bsv">+12%</div><div class="bsl">HRV improvement</div></div>
      <div><div class="bsv">5</div><div class="bsl">Prototype screens</div></div>
      <div><div class="bsv">4</div><div class="bsl">AI insight cards</div></div>
    </div>
  </div>

  <footer id="prototype">
    <div>
      <div class="footer-brand">VEIN</div>
      <div class="footer-sub">RAM Design Heartbeat · April 2026</div>
      <div class="footer-sub" style="margin-top:6px;font-size:11px">
        Inspired by Neon on darkmodedesign.com + Superpower on godly.website
      </div>
    </div>
    <div style="display:flex;gap:20px">
      <a href="https://ram.zenbin.org/vein-viewer" class="footer-link">Prototype →</a>
      <a href="https://ram.zenbin.org/vein-mock" class="footer-link">Interactive ☀◑</a>
    </div>
  </footer>
</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
const viewerHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VEIN — Prototype Viewer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
  // EMBEDDED_PEN injection point
  </script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:#0E0B09;color:#F5EDE4;font-family:'Inter',sans-serif;min-height:100vh}
    .vhdr{background:rgba(14,11,9,0.92);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,200,140,0.10);
      padding:12px 24px;display:flex;align-items:center;justify-content:space-between;
      position:sticky;top:0;z-index:100}
    .vbrand{font-size:15px;font-weight:900;letter-spacing:0.1em}
    .vtag{font-size:11px;color:rgba(196,168,130,0.6);margin-top:2px}
    .vacts{display:flex;gap:10px}
    .vbtn{font-size:12px;padding:7px 16px;border-radius:7px;cursor:pointer;
      background:#F97316;color:#0E0B09;border:none;font-weight:700;text-decoration:none}
    .vbtn.ghost{background:transparent;color:#F5EDE4;border:1px solid rgba(255,200,140,0.20)}
    .vbody{max-width:880px;margin:0 auto;padding:40px 24px}
    .snav{display:flex;gap:8px;margin-bottom:28px;flex-wrap:wrap}
    .spill{padding:8px 18px;border-radius:99px;font-size:13px;font-weight:500;
      background:#1A1410;border:1px solid rgba(255,200,140,0.14);cursor:pointer;
      color:#C4A882;transition:all 0.15s}
    .spill.active{background:#F97316;color:#0E0B09;border-color:#F97316;font-weight:700}
    .spanel{display:none;animation:fi 0.2s ease}
    .spanel.active{display:block}
    @keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    .scard{background:#1A1410;border:1px solid rgba(255,200,140,0.10);
      border-radius:14px;overflow:hidden;margin-bottom:20px}
    .sbar{background:rgba(14,11,9,0.7);border-bottom:1px solid rgba(255,200,140,0.08);
      display:flex;align-items:center;padding:0 18px;height:40px;gap:10px}
    .sbar-id{font-size:11px;color:rgba(196,168,130,0.5);font-family:monospace}
    .sbar-title{flex:1;text-align:center;font-size:12px;letter-spacing:0.06em;color:#F5EDE4}
    .sbar-badge{font-size:9px;background:rgba(249,115,22,0.12);color:#F97316;
      border:1px solid rgba(249,115,22,0.25);padding:2px 8px;border-radius:4px}
    .sbody{padding:24px}
    h2{font-size:18px;font-weight:800;margin-bottom:6px}
    p.desc{font-size:13px;color:rgba(196,168,130,0.7);line-height:1.6;margin-bottom:16px}
    .mpills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
    .mp{background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);
      border-radius:4px;padding:3px 9px;font-size:10.5px;color:#F97316;font-family:monospace}
    pre{font-family:monospace;font-size:11px;line-height:1.65;color:rgba(245,237,228,0.65);
      background:rgba(14,11,9,0.6);border:1px solid rgba(255,200,140,0.08);
      border-radius:8px;padding:16px;overflow-x:auto;white-space:pre-wrap}
  </style>
</head>
<body>
  <div class="vhdr">
    <div><div class="vbrand">VEIN</div><div class="vtag">Prototype Viewer · 5 screens</div></div>
    <div class="vacts">
      <a href="/vein" class="vbtn ghost">← Hero</a>
      <a href="/vein-mock" class="vbtn">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="vbody">
    <div class="snav" id="screenNav"></div>
    <div id="screenPanels"></div>
  </div>
  <script>
    const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
    if (pen) {
      const nav = document.getElementById('screenNav');
      const panels = document.getElementById('screenPanels');
      pen.screens.forEach((s, i) => {
        const pill = document.createElement('button');
        pill.className = 'spill' + (i===0?' active':'');
        pill.textContent = s.label;
        pill.onclick = () => {
          document.querySelectorAll('.spill').forEach(p=>p.classList.remove('active'));
          document.querySelectorAll('.spanel').forEach(p=>p.classList.remove('active'));
          pill.classList.add('active');
          document.getElementById('panel-'+s.id).classList.add('active');
        };
        nav.appendChild(pill);
        const panel = document.createElement('div');
        panel.className = 'spanel' + (i===0?' active':'');
        panel.id = 'panel-'+s.id;
        const types = [...new Set((s.children||[]).map(c=>c.type).filter(Boolean))];
        panel.innerHTML = \`
          <div class="scard">
            <div class="sbar">
              <span class="sbar-id">S-0\${i+1}</span>
              <span class="sbar-title">\${s.label.toUpperCase()} — VEIN</span>
              <span class="sbar-badge">BIOMETRIC</span>
            </div>
            <div class="sbody">
              <h2>\${s.label}</h2>
              <p class="desc">\${s.description || 'Biometric screen — VEIN dark health UI'}</p>
              <div class="mpills">\${types.map(t=>'<span class="mp">'+t+'</span>').join('')}</div>
              <pre>\${JSON.stringify({id:s.id,children_count:s.children?.length,background:s.background},null,2)}</pre>
            </div>
          </div>
        \`;
        panels.appendChild(panel);
      });
    }
  </script>
</body>
</html>`;

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const HOST = 'zenbin.org';

async function run() {
  const penJson = fs.readFileSync('/workspace/group/design-studio/vein.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const viewerHtml = viewerHtmlTemplate.replace(
    '<script>\n  // EMBEDDED_PEN injection point\n  </script>',
    injection + '\n<script>'
  );

  fs.writeFileSync('/workspace/group/design-studio/vein-hero.html', heroHtml);
  fs.writeFileSync('/workspace/group/design-studio/vein-viewer.html', viewerHtml);

  console.log('Publishing hero…');
  const r1 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG }, { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN });
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,120));

  console.log('Publishing viewer…');
  const r2 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' }, { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN });
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,120));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
