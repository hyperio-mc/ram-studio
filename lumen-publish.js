'use strict';
// LUMEN — Hero page + viewer publisher
// Heartbeat #19 — Light theme instrument-panel aesthetic

const fs = require('fs');
const https = require('https');

const SLUG = 'lumen';
const APP_NAME = 'LUMEN';
const TAGLINE = 'precision for deep work';
const SUBDOMAIN = 'ram';

const C = {
  bg:        '#F8F7F4',
  surf:      '#FFFFFF',
  card:      '#F2F0EB',
  text:      '#1C1A18',
  muted:     'rgba(28,26,24,0.42)',
  muted2:    'rgba(28,26,24,0.12)',
  border:    'rgba(28,26,24,0.12)',
  borderMd:  'rgba(28,26,24,0.20)',
  acc:       '#E85D04',
  acc2:      '#502BD8',
  suc:       '#16A34A',
};

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
  <title>LUMEN — precision for deep work</title>
  <meta name="description" content="LUMEN is a focus session tracker with instrument-panel precision UI. Track sessions, build streaks, and achieve peak performance.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;1,14..32,400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: ${C.bg};
      --surf: ${C.surf};
      --card: ${C.card};
      --text: ${C.text};
      --muted: ${C.muted};
      --border: ${C.border};
      --border-md: ${C.borderMd};
      --acc: ${C.acc};
      --acc2: ${C.acc2};
      --suc: ${C.suc};
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', system-ui, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
      line-height: 1.5;
    }

    /* NAV */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; justify-content: space-between; align-items: center;
      padding: 0 40px; height: 52px;
      background: rgba(248,247,244,0.90);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav-brand {
      font-size: 12px; font-weight: 700;
      letter-spacing: 5px; color: var(--text);
      text-decoration: none;
    }
    .nav-brand span { color: var(--acc); }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a {
      font-size: 12px; color: var(--muted);
      text-decoration: none; letter-spacing: 0.5px;
      transition: color 0.15s;
    }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      padding: 8px 20px;
      background: var(--acc); color: #fff;
      border-radius: 20px;
      font-size: 12px; font-weight: 600;
      text-decoration: none; letter-spacing: 0.3px;
      transition: opacity 0.15s;
    }
    .nav-cta:hover { opacity: 0.85; }

    /* HERO */
    .hero {
      min-height: 100vh;
      padding: 100px 80px 60px;
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 80px; align-items: center;
    }
    .hero-eyebrow {
      font-size: 10px; letter-spacing: 5px;
      color: var(--acc); text-transform: uppercase;
      margin-bottom: 20px; font-weight: 600;
    }
    .hero-headline {
      font-size: clamp(40px, 5vw, 64px);
      font-weight: 800; line-height: 1.05;
      letter-spacing: -0.03em;
      color: var(--text); margin-bottom: 20px;
    }
    .hero-headline em { font-style: normal; color: var(--acc); }
    .hero-sub {
      font-size: 16px; line-height: 1.7;
      color: var(--muted); max-width: 440px;
      margin-bottom: 36px;
    }
    .hero-ctas { display: flex; gap: 12px; align-items: center; }
    .btn-primary {
      padding: 13px 28px; border-radius: 24px;
      background: var(--acc); color: #fff;
      font-size: 14px; font-weight: 600;
      text-decoration: none; letter-spacing: 0.2px;
      transition: opacity 0.15s;
    }
    .btn-primary:hover { opacity: 0.85; }
    .btn-ghost {
      padding: 13px 28px; border-radius: 24px;
      border: 1px solid var(--border-md);
      background: transparent; color: var(--text);
      font-size: 14px; font-weight: 500;
      text-decoration: none;
      transition: border-color 0.15s;
    }
    .btn-ghost:hover { border-color: var(--acc); color: var(--acc); }
    .hero-stats {
      display: flex; gap: 36px;
      margin-top: 40px; padding-top: 32px;
      border-top: 1px solid var(--border);
    }
    .stat-num {
      font-size: 28px; font-weight: 800;
      letter-spacing: -0.02em; color: var(--text);
      margin-bottom: 2px;
    }
    .stat-num em { color: var(--acc); font-style: normal; }
    .stat-lbl { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; }

    /* PHONE MOCKUPS */
    .phone-showcase {
      display: flex; gap: 16px; justify-content: center;
      align-items: flex-start; position: relative;
    }
    .phone {
      width: 200px; border-radius: 28px;
      background: var(--surf);
      border: 1px solid var(--border-md);
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(28,26,24,0.12), 0 4px 12px rgba(28,26,24,0.06);
    }
    .phone.center { transform: scale(1.08) translateY(-12px); z-index: 2; box-shadow: 0 32px 80px rgba(28,26,24,0.18); }
    .phone-top {
      padding: 14px 14px 0;
      font-size: 8px; color: var(--muted);
      display: flex; justify-content: space-between;
    }
    .phone-body { padding: 8px 12px 12px; }
    .ph-head { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
    .ph-sub { font-size: 9px; color: var(--muted); margin-bottom: 10px; }
    .ph-divider { height: 1px; background: var(--border); margin-bottom: 10px; }
    .ph-card {
      background: var(--card); border-radius: 8px;
      border-left: 3px solid var(--acc);
      padding: 8px 10px; margin-bottom: 8px;
    }
    .ph-card-label { font-size: 8px; color: var(--muted); margin-bottom: 3px; }
    .ph-card-title { font-size: 11px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
    .ph-card-sub { font-size: 8px; color: var(--muted); }
    .ph-stat-row { display: flex; gap: 6px; margin-bottom: 8px; }
    .ph-stat {
      flex: 1; background: var(--surf); border: 1px solid var(--border);
      border-radius: 6px; padding: 6px 8px;
    }
    .ph-stat-lbl { font-size: 7px; color: var(--muted); margin-bottom: 2px; }
    .ph-stat-val { font-size: 14px; font-weight: 700; color: var(--text); }
    .ph-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 0; border-bottom: 1px solid var(--border);
    }
    .ph-row:last-child { border-bottom: none; }
    .ph-row-name { font-size: 10px; font-weight: 500; color: var(--text); }
    .ph-row-sub { font-size: 8px; color: var(--muted); }
    .ph-badge {
      font-size: 9px; font-weight: 600;
      padding: 2px 6px; border-radius: 8px;
      background: var(--card); color: var(--text);
    }
    .ph-timer {
      text-align: center; padding: 10px 0 6px;
    }
    .ph-timer-num { font-size: 32px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
    .ph-timer-sub { font-size: 9px; color: var(--muted); }
    .ph-ring {
      width: 80px; height: 80px; margin: 8px auto;
      border-radius: 50%;
      border: 5px solid rgba(232,93,4,0.15);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .ph-ring-inner { text-align: center; }
    .ph-ring-val { font-size: 20px; font-weight: 700; color: var(--text); }
    .ph-ring-lbl { font-size: 7px; color: var(--muted); }
    .ph-score { text-align: center; margin: 8px 0; }
    .ph-score-num { font-size: 40px; font-weight: 800; color: var(--acc); }
    .ph-score-sub { font-size: 9px; color: var(--muted); }
    .ph-bar { height: 3px; background: var(--border); border-radius: 2px; margin: 6px 0; }
    .ph-bar-fill { height: 3px; border-radius: 2px; background: var(--acc); }
    .ph-nav {
      display: flex; border-top: 1px solid var(--border);
      padding: 8px 0 6px; background: var(--surf);
    }
    .ph-nav-item {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; gap: 2px;
    }
    .ph-nav-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--muted); opacity: 0.4; }
    .ph-nav-dot.active { background: var(--acc); opacity: 1; }
    .ph-nav-lbl { font-size: 7px; color: var(--muted); }
    .ph-nav-lbl.active { color: var(--acc); }

    /* TICKER STRIP */
    .ticker-strip {
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      background: var(--surf); padding: 12px 0;
      overflow: hidden;
    }
    .ticker-inner {
      display: flex; gap: 48px;
      animation: scroll 28s linear infinite;
      white-space: nowrap; font-size: 11px;
    }
    @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .tk { display: flex; gap: 8px; align-items: center; }
    .tk-l { color: var(--muted); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; }
    .tk-v { color: var(--text); font-weight: 600; }
    .tk-d { color: var(--suc); }
    .tk-d.up { color: var(--acc); }
    .tk-sep { color: var(--border-md); }

    /* FEATURES */
    .section { max-width: 1100px; margin: 0 auto; padding: 80px 80px; }
    .section-eyebrow {
      font-size: 10px; letter-spacing: 5px; color: var(--acc);
      text-transform: uppercase; font-weight: 600;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: clamp(28px, 3.5vw, 44px);
      font-weight: 800; line-height: 1.1;
      letter-spacing: -0.025em;
      color: var(--text); margin-bottom: 12px;
    }
    .section-sub {
      font-size: 15px; color: var(--muted);
      line-height: 1.7; max-width: 500px;
      margin-bottom: 56px;
    }
    .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
    .feature-card {
      background: var(--surf); border: 1px solid var(--border);
      border-radius: 12px; padding: 28px;
      transition: border-color 0.15s, transform 0.15s;
    }
    .feature-card:hover { border-color: rgba(232,93,4,0.35); transform: translateY(-2px); }
    .feature-icon {
      width: 36px; height: 36px; border-radius: 8px;
      background: rgba(232,93,4,0.08);
      border: 1px solid rgba(232,93,4,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; margin-bottom: 16px;
    }
    .feature-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
    .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

    /* SCREEN CARDS */
    .screens-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    .screen-card {
      background: var(--surf); border: 1px solid var(--border);
      border-radius: 12px; overflow: hidden;
    }
    .screen-head {
      padding: 12px 16px; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 8px;
      background: var(--card);
    }
    .s-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--border-md); }
    .s-dot.active { background: var(--acc); }
    .s-num { font-size: 10px; color: var(--muted); letter-spacing: 2px; margin-left: 6px; }
    .screen-body { padding: 16px; }
    .screen-name { font-size: 13px; font-weight: 700; margin-bottom: 6px; color: var(--text); }
    .screen-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }

    /* PALETTE */
    .palette-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .swatch {
      display: flex; flex-direction: column; gap: 6px; align-items: center;
    }
    .swatch-color {
      width: 56px; height: 56px; border-radius: 10px;
      border: 1px solid var(--border);
    }
    .swatch-name { font-size: 10px; color: var(--muted); letter-spacing: 0.3px; }
    .swatch-hex { font-size: 9px; color: var(--muted); font-family: monospace; }

    /* STATS BAR */
    .stats-bar {
      background: var(--surf);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .stats-inner {
      max-width: 1100px; margin: 0 auto;
      padding: 48px 80px;
      display: grid; grid-template-columns: repeat(4,1fr);
      gap: 40px; text-align: center;
    }
    .bar-num {
      font-size: 40px; font-weight: 800;
      letter-spacing: -0.03em; color: var(--text);
      margin-bottom: 6px;
    }
    .bar-num em { color: var(--acc); font-style: normal; }
    .bar-lbl { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }

    /* FOOTER */
    footer {
      border-top: 1px solid var(--border);
      padding: 32px 80px;
      max-width: 1100px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-brand { font-size: 12px; font-weight: 700; letter-spacing: 4px; color: var(--text); }
    .footer-brand em { color: var(--acc); font-style: normal; }
    .footer-note { font-size: 11px; color: var(--muted); }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; }
    .footer-links a:hover { color: var(--acc); }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; padding: 90px 24px 60px; }
      .phone-showcase { justify-content: center; }
      .phone.side { display: none; }
      .phone.center { transform: scale(1); }
      .section { padding: 60px 24px; }
      .features-grid, .screens-grid { grid-template-columns: 1fr; }
      .stats-inner { grid-template-columns: repeat(2,1fr); padding: 40px 24px; }
      nav { padding: 0 20px; }
      .nav-links { display: none; }
      footer { flex-direction: column; gap: 16px; padding: 32px 24px; }
    }
  </style>
</head>
<body>

<nav>
  <a href="#" class="nav-brand">LU<span>M</span>EN</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#palette">Palette</a>
  </div>
  <div style="display:flex;align-items:center;gap:10px">
    <a href="https://ram.zenbin.org/lumen-viewer" class="nav-cta">View Prototype</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div>
    <p class="hero-eyebrow">Heartbeat 19 · Productivity Tools</p>
    <h1 class="hero-headline">Precision for<br><em>deep work.</em></h1>
    <p class="hero-sub">LUMEN is a focus session tracker inspired by the instrument-panel aesthetic — hairline borders, precise labels, and warm orange accents on a Cloud Dancer base.</p>
    <div class="hero-ctas">
      <a href="https://ram.zenbin.org/lumen-viewer" class="btn-primary">View Prototype &rarr;</a>
      <a href="https://ram.zenbin.org/lumen-mock" class="btn-ghost">Interactive Mock</a>
    </div>
    <div class="hero-stats">
      <div><div class="stat-num">6</div><div class="stat-lbl">Screens</div></div>
      <div><div class="stat-num">450</div><div class="stat-lbl">Elements</div></div>
      <div><div class="stat-num"><em>#19</em></div><div class="stat-lbl">Heartbeat</div></div>
    </div>
  </div>

  <!-- Phone Mockups -->
  <div class="phone-showcase">
    <!-- Today -->
    <div class="phone side">
      <div class="phone-top"><span>9:41</span><span>●●●</span></div>
      <div class="phone-body">
        <div class="ph-head">Today</div>
        <div class="ph-sub">Wednesday · Apr 9</div>
        <div class="ph-divider"></div>
        <div class="ph-card">
          <div class="ph-card-label">NEXT SESSION</div>
          <div class="ph-card-title">Deep Work: Design System</div>
          <div class="ph-card-sub">25 min &middot; Starts in 12 min</div>
        </div>
        <div class="ph-stat-row">
          <div class="ph-stat"><div class="ph-stat-lbl">SESSIONS</div><div class="ph-stat-val">6</div></div>
          <div class="ph-stat"><div class="ph-stat-lbl">STREAK</div><div class="ph-stat-val">14d</div></div>
        </div>
        <div style="font-size:9px;color:var(--muted);margin-bottom:6px;font-weight:600">RECENT</div>
        <div class="ph-row"><div><div class="ph-row-name">Design System</div><div class="ph-row-sub">32 min</div></div><span class="ph-badge" style="background:rgba(80,43,216,0.1);color:#502BD8">91</span></div>
        <div class="ph-row"><div><div class="ph-row-name">Research</div><div class="ph-row-sub">45 min</div></div><span class="ph-badge" style="background:rgba(232,93,4,0.1);color:#E85D04">88</span></div>
      </div>
      <div class="ph-nav">
        <div class="ph-nav-item"><div class="ph-nav-dot active"></div><div class="ph-nav-lbl active">Today</div></div>
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Timer</div></div>
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Stats</div></div>
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Projects</div></div>
      </div>
    </div>

    <!-- Timer (center) -->
    <div class="phone center">
      <div class="phone-top"><span>9:53</span><span>●●●</span></div>
      <div class="phone-body">
        <div style="text-align:center;font-size:9px;color:#502BD8;letter-spacing:2px;margin-bottom:4px;font-weight:600">DESIGN SYSTEM</div>
        <div class="ph-ring" style="border-color:rgba(232,93,4,0.2)">
          <div class="ph-ring-inner">
            <div class="ph-ring-val" style="font-size:22px">18:32</div>
            <div class="ph-ring-lbl">remaining</div>
          </div>
        </div>
        <div class="ph-stat-row">
          <div class="ph-stat"><div class="ph-stat-lbl">ELAPSED</div><div class="ph-stat-val" style="font-size:12px">6:28</div></div>
          <div class="ph-stat"><div class="ph-stat-lbl">DEPTH</div><div class="ph-stat-val" style="font-size:12px;color:#16A34A">Deep</div></div>
        </div>
        <div style="text-align:center;margin:10px 0">
          <div style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#E85D04;line-height:36px;font-size:14px;color:#fff;font-weight:600">&#9646;&#9646;</div>
        </div>
        <div class="ph-bar"><div class="ph-bar-fill" style="width:62%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--muted)">
          <span>62% complete</span><span>2 distractions</span>
        </div>
      </div>
      <div class="ph-nav">
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Today</div></div>
        <div class="ph-nav-item"><div class="ph-nav-dot active"></div><div class="ph-nav-lbl active">Timer</div></div>
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Stats</div></div>
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Projects</div></div>
      </div>
    </div>

    <!-- Review -->
    <div class="phone side">
      <div class="phone-top"><span>10:18</span><span>●●●</span></div>
      <div class="phone-body">
        <div style="text-align:center;font-size:11px;font-weight:700;color:var(--text);margin-bottom:2px">Session Complete</div>
        <div style="text-align:center;font-size:9px;color:var(--muted);margin-bottom:10px">Design System &middot; 25 min</div>
        <div class="ph-score">
          <div class="ph-score-num">92</div>
          <div class="ph-score-sub">focus score / 100</div>
        </div>
        <div class="ph-stat-row">
          <div class="ph-stat"><div class="ph-stat-lbl">DURATION</div><div class="ph-stat-val" style="font-size:12px">25:00</div></div>
          <div class="ph-stat"><div class="ph-stat-lbl">STREAK</div><div class="ph-stat-val" style="font-size:12px">15d</div></div>
        </div>
        <div class="ph-bar" style="margin:8px 0 4px"><div class="ph-bar-fill" style="width:80%"></div></div>
        <div style="font-size:8px;color:var(--muted)">Daily: 3.2h of 4h &middot; 80%</div>
      </div>
      <div class="ph-nav">
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Today</div></div>
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Timer</div></div>
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Stats</div></div>
        <div class="ph-nav-item"><div class="ph-nav-dot"></div><div class="ph-nav-lbl">Projects</div></div>
      </div>
    </div>
  </div>
</section>

<!-- TICKER STRIP -->
<div class="ticker-strip">
  <div class="ticker-inner">
    <div class="tk"><span class="tk-l">FOCUS SCORE</span><span class="tk-v">84%</span><span class="tk-d">+3pts</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">SESSIONS TODAY</span><span class="tk-v">6</span><span class="tk-d">+2</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">STREAK</span><span class="tk-v">14 days</span><span class="tk-d up">&uarr;</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">GOAL</span><span class="tk-v">3.2h / 4h</span><span class="tk-d">80%</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">AVG DEPTH</span><span class="tk-v">Deep</span><span class="tk-d up">Peak</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">DISTRACTIONS</span><span class="tk-v">2</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">BEST TIME</span><span class="tk-v">9&ndash;11am</span><span class="tk-d">Morning</span></div><div class="tk-sep">&middot;</div>
    <!-- repeat for infinite loop -->
    <div class="tk"><span class="tk-l">FOCUS SCORE</span><span class="tk-v">84%</span><span class="tk-d">+3pts</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">SESSIONS TODAY</span><span class="tk-v">6</span><span class="tk-d">+2</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">STREAK</span><span class="tk-v">14 days</span><span class="tk-d up">&uarr;</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">GOAL</span><span class="tk-v">3.2h / 4h</span><span class="tk-d">80%</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">AVG DEPTH</span><span class="tk-v">Deep</span><span class="tk-d up">Peak</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">DISTRACTIONS</span><span class="tk-v">2</span></div><div class="tk-sep">&middot;</div>
    <div class="tk"><span class="tk-l">BEST TIME</span><span class="tk-v">9&ndash;11am</span><span class="tk-d">Morning</span></div>
  </div>
</div>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="stats-inner">
    <div><div class="bar-num"><em>84</em>%</div><div class="bar-lbl">Focus Score</div></div>
    <div><div class="bar-num">6</div><div class="bar-lbl">Sessions Today</div></div>
    <div><div class="bar-num">14</div><div class="bar-lbl">Day Streak</div></div>
    <div><div class="bar-num">6</div><div class="bar-lbl">Design Screens</div></div>
  </div>
</div>

<!-- FEATURES -->
<section class="section" id="features">
  <p class="section-eyebrow">What LUMEN tracks</p>
  <h2 class="section-title">Precision tools for<br>focused people.</h2>
  <p class="section-sub">Instrument-panel density meets warm, readable UI. Every metric earns its place.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">[T]</div>
      <div class="feature-title">Precision Timer</div>
      <div class="feature-desc">Instrument-panel clock with tick marks, progress arc, elapsed bar, and real-time depth classification. No fluff, just signal.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">[S]</div>
      <div class="feature-title">Focus Score</div>
      <div class="feature-desc">A 0&ndash;100 composite score per session: duration, distractions, depth, and consistency. One honest number.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">[C]</div>
      <div class="feature-title">Streak Calendar</div>
      <div class="feature-desc">28-day grid showing your consistency at a glance. Color-coded activity squares, current streak highlighted.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">[P]</div>
      <div class="feature-title">Project Goals</div>
      <div class="feature-desc">Set hour goals per project. Color-bar progress rings show completion percentage with automatic goal-reached indicators.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">[W]</div>
      <div class="feature-title">Weekly Analytics</div>
      <div class="feature-desc">Bar chart with daily hours, average line, today highlight. Top project breakdown with horizontal bar rankings.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">[R]</div>
      <div class="feature-title">Session Review</div>
      <div class="feature-desc">Post-session debrief: score, notes, daily progress recap, suggested next action. Close the loop on every block.</div>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section class="section" id="screens">
  <p class="section-eyebrow">6 Screens</p>
  <h2 class="section-title">A complete focus system.</h2>
  <p class="section-sub">Every screen designed for precision — hairline borders, warm orange accents, Cloud Dancer base.</p>
  <div class="screens-grid">
    <div class="screen-card"><div class="screen-head"><div class="s-dot active"></div><div class="s-dot"></div><div class="s-dot"></div><div class="s-num">01 &mdash; TODAY</div></div><div class="screen-body"><div class="screen-name">Today Overview</div><div class="screen-desc">Daily focus overview, next session card, goal ring, session count, streak counter, and recent sessions list.</div></div></div>
    <div class="screen-card"><div class="screen-head"><div class="s-dot active"></div><div class="s-dot"></div><div class="s-dot"></div><div class="s-num">02 &mdash; TIMER</div></div><div class="screen-body"><div class="screen-name">Active Timer</div><div class="screen-desc">Instrument-panel clock with 12-position tick marks, progress arc, large countdown, elapsed bar, and session controls.</div></div></div>
    <div class="screen-card"><div class="screen-head"><div class="s-dot active"></div><div class="s-dot"></div><div class="s-dot"></div><div class="s-num">03 &mdash; REVIEW</div></div><div class="screen-body"><div class="screen-name">Session Review</div><div class="screen-desc">Post-session score card, metric grid (duration, depth, distractions, streak), notes area, and next action buttons.</div></div></div>
    <div class="screen-card"><div class="screen-head"><div class="s-dot active"></div><div class="s-dot"></div><div class="s-dot"></div><div class="s-num">04 &mdash; STATS</div></div><div class="screen-body"><div class="screen-name">Weekly Stats</div><div class="screen-desc">Bar chart, average line, streak calendar grid, top projects ranking, avg focus score, and best time window.</div></div></div>
    <div class="screen-card"><div class="screen-head"><div class="s-dot active"></div><div class="s-dot"></div><div class="s-dot"></div><div class="s-num">05 &mdash; PROJECTS</div></div><div class="screen-body"><div class="screen-name">Projects</div><div class="screen-desc">Project cards with colored accent bars, hour totals, session counts, goal progress bars, and completion indicators.</div></div></div>
    <div class="screen-card"><div class="screen-head"><div class="s-dot active"></div><div class="s-dot"></div><div class="s-dot"></div><div class="s-num">06 &mdash; PROFILE</div></div><div class="screen-body"><div class="screen-name">Profile</div><div class="screen-desc">Avatar, achievement chips, total hours/sessions/streak, settings sections for Focus and Notifications.</div></div></div>
  </div>
</section>

<!-- PALETTE -->
<section class="section" id="palette">
  <p class="section-eyebrow">Color System</p>
  <h2 class="section-title">Cloud Dancer base palette.</h2>
  <p class="section-sub">Pantone 2026 Cloud Dancer off-white as foundation. Warm orange from Awwwards SOTD trends. Deep purple from Awwwards award category colors.</p>
  <div class="palette-row">
    <div class="swatch"><div class="swatch-color" style="background:#F8F7F4;box-shadow:0 0 0 1px rgba(28,26,24,0.15)"></div><div class="swatch-name">BG</div><div class="swatch-hex">#F8F7F4</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#FFFFFF"></div><div class="swatch-name">SURF</div><div class="swatch-hex">#FFFFFF</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#F2F0EB"></div><div class="swatch-name">CARD</div><div class="swatch-hex">#F2F0EB</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#1C1A18"></div><div class="swatch-name">TEXT</div><div class="swatch-hex">#1C1A18</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#E85D04"></div><div class="swatch-name">ACC</div><div class="swatch-hex">#E85D04</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#502BD8"></div><div class="swatch-name">ACC2</div><div class="swatch-hex">#502BD8</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#16A34A"></div><div class="swatch-name">SUC</div><div class="swatch-hex">#16A34A</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#DC2626"></div><div class="swatch-name">ERR</div><div class="swatch-hex">#DC2626</div></div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div>
    <div class="footer-brand">LU<em>M</em>EN</div>
    <div class="footer-note" style="margin-top:4px">RAM Design Heartbeat #19 &middot; April 2026</div>
    <div class="footer-note" style="margin-top:2px;font-size:10px">Inspired by Awwwards SOTD April 2026 &middot; Nine to Five &middot; Pencil.dev &middot; Pantone Cloud Dancer 2026</div>
  </div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/lumen-viewer">Prototype &rarr;</a>
    <a href="https://ram.zenbin.org/lumen-mock">Interactive Mock</a>
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
  <title>LUMEN &mdash; Design Viewer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
  // EMBEDDED_PEN will be injected here
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #F8F7F4; color: #1C1A18; font-family: 'Inter', sans-serif; min-height: 100vh; }
    .viewer-header {
      background: rgba(248,247,244,0.92); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(28,26,24,0.12);
      padding: 12px 24px;
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 100;
    }
    .viewer-brand { font-size: 13px; font-weight: 700; letter-spacing: 4px; color: #1C1A18; }
    .viewer-brand em { color: #E85D04; font-style: normal; }
    .viewer-tag { font-size: 11px; color: rgba(28,26,24,0.42); margin-top: 2px; }
    .viewer-actions { display: flex; gap: 10px; }
    .viewer-btn {
      font-size: 12px; padding: 6px 16px; border-radius: 16px;
      background: #E85D04; color: #fff; border: none;
      font-weight: 600; text-decoration: none; cursor: pointer;
    }
    .viewer-btn.ghost {
      background: transparent; color: #1C1A18;
      border: 1px solid rgba(28,26,24,0.20);
    }
    .viewer-body { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }
    .screen-nav { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
    .nav-pill {
      padding: 7px 16px; border-radius: 99px;
      font-size: 12px; font-weight: 500;
      background: #FFFFFF; border: 1px solid rgba(28,26,24,0.15);
      cursor: pointer; color: #1C1A18;
      transition: all 0.15s;
    }
    .nav-pill.active { background: #E85D04; color: #fff; border-color: #E85D04; }
    .screen-panel { display: none; animation: fadeIn 0.2s ease; }
    .screen-panel.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .viewer-window {
      background: #FFFFFF; border: 1px solid rgba(28,26,24,0.12);
      border-radius: 12px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(28,26,24,0.08);
    }
    .window-bar {
      background: #F2F0EB; border-bottom: 1px solid rgba(28,26,24,0.12);
      padding: 10px 16px;
      display: flex; align-items: center; gap: 8px;
    }
    .w-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(28,26,24,0.15); }
    .w-dot.a { background: #E85D04; }
    .w-id { font-size: 10px; color: rgba(28,26,24,0.42); letter-spacing: 2px; margin-left: 8px; }
    .window-body { padding: 24px; }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 6px; color: #1C1A18; }
    p.desc { font-size: 13px; color: rgba(28,26,24,0.55); line-height: 1.65; margin-bottom: 16px; }
    .meta-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .meta-pill {
      background: rgba(232,93,4,0.08); border: 1px solid rgba(232,93,4,0.2);
      border-radius: 5px; padding: 3px 10px;
      font-size: 11px; color: #E85D04;
    }
    .el-count { font-size: 13px; color: rgba(28,26,24,0.42); margin-bottom: 12px; }
    pre {
      font-family: 'Courier New', monospace; font-size: 11px;
      line-height: 1.65; color: rgba(28,26,24,0.65);
      background: #F2F0EB; border: 1px solid rgba(28,26,24,0.12);
      border-radius: 8px; padding: 16px;
      overflow-x: auto; white-space: pre-wrap;
      max-height: 400px; overflow-y: auto;
    }
  </style>
</head>
<body>
  <div class="viewer-header">
    <div>
      <div class="viewer-brand">LU<em>M</em>EN</div>
      <div class="viewer-tag">Design Viewer &middot; Heartbeat #19 &middot; 6 screens</div>
    </div>
    <div class="viewer-actions">
      <a href="/lumen" class="viewer-btn ghost">&larr; Hero</a>
      <a href="/lumen-mock" class="viewer-btn">Interactive Mock</a>
    </div>
  </div>
  <div class="viewer-body">
    <div class="screen-nav" id="screenNav"></div>
    <div id="screenPanels"></div>
  </div>
  <script>
    const raw = window.EMBEDDED_PEN;
    const pen = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
    if (pen) {
      const nav = document.getElementById('screenNav');
      const panels = document.getElementById('screenPanels');
      const screens = pen.screens || [];
      screens.forEach((s, i) => {
        const pill = document.createElement('button');
        pill.className = 'nav-pill' + (i===0?' active':'');
        pill.textContent = s.name || s.label || ('Screen ' + (i+1));
        pill.onclick = () => {
          document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
          document.querySelectorAll('.screen-panel').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          document.getElementById('panel-' + i).classList.add('active');
        };
        nav.appendChild(pill);

        const elCount = (s.elements || []).length;
        const elTypes = [...new Set((s.elements || []).map(el => el.type))];

        const panel = document.createElement('div');
        panel.className = 'screen-panel' + (i===0?' active':'');
        panel.id = 'panel-' + i;
        panel.innerHTML = \`<div class="viewer-window">
          <div class="window-bar">
            <div class="w-dot a"></div><div class="w-dot"></div><div class="w-dot"></div>
            <div class="w-id">S-0\${i+1} &mdash; \${(s.name||'').toUpperCase()}</div>
          </div>
          <div class="window-body">
            <h2>\${s.name || s.label}</h2>
            <div class="el-count">\${elCount} elements</div>
            <div class="meta-row">\${elTypes.map(t => '<span class="meta-pill">'+t+'</span>').join('')}</div>
            <pre>\${JSON.stringify((s.elements||[]).slice(0,20), null, 2)}\${elCount > 20 ? '\\n... (' + (elCount-20) + ' more elements)' : ''}</pre>
          </div>
        </div>\`;
        panels.appendChild(panel);
      });
    } else {
      document.getElementById('screenPanels').innerHTML = '<p style="color:rgba(28,26,24,0.4);padding:40px;text-align:center">No design data embedded.</p>';
    }
  </script>
</body>
</html>`;

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
const HOST = 'zenbin.org';

async function run() {
  // Inject pen into viewer
  const penJson = fs.readFileSync('/workspace/group/design-studio/lumen.pen', 'utf8');
  const injection = '<script>window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';<\\/script>';
  const viewerHtml = viewerHtmlTemplate.replace(
    '<script>\n  // EMBEDDED_PEN will be injected here\n  </script>',
    injection
  );

  console.log('Publishing hero page...');
  const r1 = await post(HOST, '/v1/pages/' + SLUG,
    { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: APP_NAME + ' \u2014 ' + TAGLINE }
  );
  console.log('Hero:', r1.status, r1.status === 200 || r1.status === 201 ? 'OK' : r1.body.slice(0, 100));

  console.log('Publishing viewer...');
  const r2 = await post(HOST, '/v1/pages/' + SLUG + '-viewer',
    { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, title: APP_NAME + ' \u2014 Design Viewer' }
  );
  console.log('Viewer:', r2.status, r2.status === 200 || r2.status === 201 ? 'OK' : r2.body.slice(0, 100));

  console.log('\nHero:   https://ram.zenbin.org/' + SLUG);
  console.log('Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}

run().catch(console.error);
