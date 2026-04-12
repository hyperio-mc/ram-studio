// tendril-publish.js — TENDRIL: Personal Growth & Habit Intelligence
// Light-theme wellness habit tracker
// Inspired by Shapify (lapa.ninja) + Console (land-book.com) + minimal.gallery whimsy

const https = require('https');
const fs    = require('fs');

const SLUG      = 'tendril';
const APP_NAME  = 'Tendril';
const TAGLINE   = 'small habits. exponential growth.';
const ARCHETYPE = 'wellness-tracker';
const ZENBIN_SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT  = 'Light-theme personal growth & habit intelligence app inspired by Shapify (lapa.ninja) lavender gradient beauty-tech aesthetic, Console (land-book.com) soft area-chart analytics on warm white cards, and Ysabella Nicole Alvarez (minimal.gallery) whimsy sticker/pill UI on clean white. Warm parchment (#F5F3EF) + soft lavender (#7C6EAD) + sage green (#5A9E78) + terracotta (#C97B52). Five screens: Today morning check-in with daily intention quote card + habit rows, Garden habit area charts per habit, Reflect mood check-in + journal entry, Insights weekly analytics with area charts and metric cards, Circles community accountability streaks.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

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

// ── Hero Page (light, warm parchment) ────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tendril — Small Habits, Exponential Growth</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:        #F5F3EF;
    --bgB:       #EFECE7;
    --surface:   #FFFFFF;
    --surfaceB:  #F0EDE8;
    --border:    #DDD7CF;
    --borderLt:  #EDE9E3;
    --muted:     #9E978E;
    --fg:        #1C1917;
    --accent:    #7C6EAD;
    --accentLt:  #EDE9F8;
    --accentMid: rgba(124,110,173,0.15);
    --sage:      #5A9E78;
    --sageLt:    #E2F0E9;
    --warm:      #C97B52;
    --warmLt:    #F7EAE0;
    --sky:       #8AAFCA;
    --skyLt:     #E4EEF6;
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg); color: var(--fg);
    font-family: 'Georgia', 'Times New Roman', serif;
    line-height: 1.6; overflow-x: hidden;
  }

  /* ── Nav ── */
  nav {
    position: sticky; top: 0; z-index: 50;
    background: rgba(245,243,239,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 48px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-brand {
    font-family: 'Georgia', serif; font-size: 22px; font-weight: 700;
    color: var(--fg); letter-spacing: -0.5px;
  }
  .nav-brand em { color: var(--accent); font-style: normal; }
  .nav-links { display: flex; gap: 32px; font-family: sans-serif; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; letter-spacing: 0.2px; }
  .nav-links a:hover { color: var(--fg); }
  .nav-cta {
    font-family: sans-serif; font-size: 13px; font-weight: 700;
    background: var(--accent); color: #fff; padding: 9px 20px;
    border-radius: 100px; text-decoration: none;
  }

  /* ── Hero ── */
  .hero {
    min-height: 86vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 48px 60px; position: relative; overflow: hidden;
  }
  .hero-orb {
    position: absolute; border-radius: 50%; pointer-events: none;
    filter: blur(80px);
  }
  .hero-orb-1 { width: 500px; height: 480px; top: -80px; left: -100px; background: radial-gradient(circle, rgba(124,110,173,0.12) 0%, transparent 70%); }
  .hero-orb-2 { width: 400px; height: 380px; bottom: -60px; right: -80px; background: radial-gradient(circle, rgba(90,158,120,0.10) 0%, transparent 70%); }
  .hero-orb-3 { width: 300px; height: 300px; top: 40%; right: 15%; background: radial-gradient(circle, rgba(201,123,82,0.08) 0%, transparent 70%); }

  .hero-inner { position: relative; z-index: 1; max-width: 820px; text-align: center; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accentLt); border: 1px solid rgba(124,110,173,0.25);
    border-radius: 100px; padding: 6px 18px; margin-bottom: 36px;
    font-family: sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; color: var(--accent); text-transform: uppercase;
  }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: breathe 3s ease infinite; }
  @keyframes breathe { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.8)} }

  .hero-headline {
    font-family: 'Georgia', serif; font-size: clamp(52px, 8vw, 96px);
    font-weight: 700; letter-spacing: -3px; line-height: 1.0;
    color: var(--fg); margin-bottom: 12px;
  }
  .hero-headline em { color: var(--accent); font-style: italic; }
  .hero-accent-line {
    font-family: sans-serif; font-size: clamp(14px, 2vw, 18px); font-weight: 400;
    color: var(--muted); letter-spacing: 0.5px; margin-bottom: 32px;
  }
  .hero-desc {
    font-family: sans-serif; font-size: 16px; color: var(--muted);
    max-width: 540px; margin: 0 auto 44px; line-height: 1.8;
  }
  .hero-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    display: inline-block; padding: 14px 36px;
    background: var(--accent); color: #fff;
    font-family: sans-serif; font-size: 14px; font-weight: 700;
    border-radius: 100px; text-decoration: none;
    box-shadow: 0 4px 24px rgba(124,110,173,0.28);
  }
  .btn-secondary {
    display: inline-block; padding: 14px 36px;
    background: var(--surface); color: var(--fg);
    font-family: sans-serif; font-size: 14px; font-weight: 600;
    border: 1px solid var(--border); border-radius: 100px; text-decoration: none;
  }

  /* ── Intention card preview ── */
  .intention-preview {
    margin: 0 auto 0; max-width: 680px; padding: 0 48px;
    display: flex; justify-content: center;
  }
  .intention-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 28px 32px;
    display: flex; gap: 20px; align-items: flex-start;
    box-shadow: 0 8px 40px rgba(28,25,23,0.06);
    max-width: 600px; width: 100%;
  }
  .intention-bar { width: 4px; min-height: 64px; border-radius: 2px; background: var(--accent); flex-shrink: 0; }
  .intention-label {
    font-family: sans-serif; font-size: 9px; font-weight: 700;
    letter-spacing: 1.8px; color: var(--muted); text-transform: uppercase; margin-bottom: 10px;
  }
  .intention-quote { font-family: 'Georgia', serif; font-size: 18px; color: var(--fg); line-height: 1.6; margin-bottom: 12px; }
  .intention-attr { font-family: sans-serif; font-size: 12px; color: var(--accent); font-weight: 600; }

  /* ── Stats bar ── */
  .stats-bar { max-width: 900px; margin: 56px auto 0; padding: 0 48px; }
  .stats-inner {
    background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
    display: grid; grid-template-columns: repeat(4, 1fr); overflow: hidden;
    box-shadow: 0 4px 24px rgba(28,25,23,0.05);
  }
  .stat-item { padding: 28px 24px; border-right: 1px solid var(--borderLt); }
  .stat-item:last-child { border-right: none; }
  .stat-val { font-family: 'Georgia', serif; font-size: 36px; font-weight: 700; letter-spacing: -1.5px; margin-bottom: 6px; }
  .stat-label { font-family: sans-serif; font-size: 12px; color: var(--muted); }
  .c-accent { color: var(--accent); }
  .c-sage   { color: var(--sage); }
  .c-warm   { color: var(--warm); }
  .c-sky    { color: var(--sky); }

  /* ── Features ── */
  .features { max-width: 1100px; margin: 72px auto 0; padding: 0 48px; }
  .section-eyebrow {
    font-family: sans-serif; font-size: 10px; font-weight: 700;
    letter-spacing: 2.5px; color: var(--accent); text-transform: uppercase; margin-bottom: 14px;
  }
  .section-title {
    font-family: 'Georgia', serif; font-size: 38px; font-weight: 700;
    letter-spacing: -1.5px; line-height: 1.15; margin-bottom: 48px; max-width: 520px; color: var(--fg);
  }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
    padding: 28px 24px; position: relative; overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .feature-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(28,25,23,0.08); }
  .feature-top { width: 100%; height: 3px; border-radius: 2px; margin-bottom: 20px; }
  .feature-icon { font-size: 24px; margin-bottom: 12px; }
  .feature-title { font-family: 'Georgia', serif; font-size: 18px; font-weight: 700; letter-spacing: -0.4px; margin-bottom: 10px; }
  .feature-desc { font-family: sans-serif; font-size: 13px; color: var(--muted); line-height: 1.7; }

  /* ── Area chart illustration ── */
  .chart-section { max-width: 1100px; margin: 72px auto 0; padding: 0 48px; }
  .chart-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 22px;
    padding: 36px 40px; box-shadow: 0 8px 40px rgba(28,25,23,0.05);
  }
  .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .chart-title { font-family: 'Georgia', serif; font-size: 22px; font-weight: 700; letter-spacing: -0.6px; }
  .chart-sub { font-family: sans-serif; font-size: 13px; color: var(--muted); margin-top: 4px; }
  .chart-val { font-family: 'Georgia', serif; font-size: 36px; font-weight: 700; letter-spacing: -1.5px; color: var(--accent); }
  .chart-valsub { font-family: sans-serif; font-size: 12px; color: var(--sage); margin-top: 4px; font-weight: 600; }
  .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .chart-bar { flex: 1; border-radius: 6px 6px 0 0; }
  .chart-days { display: flex; gap: 8px; margin-top: 10px; }
  .chart-day { flex: 1; text-align: center; font-family: sans-serif; font-size: 10px; color: var(--muted); }
  .chart-legend { display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-family: sans-serif; font-size: 12px; color: var(--muted); }
  .legend-dot { width: 10px; height: 10px; border-radius: 3px; }

  /* ── Habit row preview ── */
  .habits-section { max-width: 1100px; margin: 56px auto 0; padding: 0 48px; }
  .habits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 28px; }
  .habit-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    padding: 20px 20px 16px; display: flex; align-items: center; gap: 16px;
  }
  .habit-emoji-wrap {
    width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center;
    justify-content: center; font-size: 22px; flex-shrink: 0;
  }
  .habit-info { flex: 1; }
  .habit-name { font-family: 'Georgia', serif; font-size: 15px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 2px; }
  .habit-sub { font-family: sans-serif; font-size: 11px; color: var(--muted); margin-bottom: 8px; }
  .habit-bar-bg { height: 5px; background: var(--surfaceB); border-radius: 3px; }
  .habit-bar-fill { height: 5px; border-radius: 3px; }
  .habit-pct { font-family: sans-serif; font-size: 13px; font-weight: 700; flex-shrink: 0; }

  /* ── Journal preview ── */
  .journal-section { max-width: 1100px; margin: 56px auto 0; padding: 0 48px; }
  .journal-card {
    background: var(--warmLt); border: 1px solid rgba(201,123,82,0.2);
    border-radius: 22px; padding: 36px 40px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start;
  }
  .journal-prompt-label { font-family: sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 2px; color: var(--warm); text-transform: uppercase; margin-bottom: 10px; }
  .journal-prompt-text { font-family: 'Georgia', serif; font-size: 24px; font-weight: 700; letter-spacing: -0.8px; line-height: 1.3; color: var(--fg); margin-bottom: 16px; }
  .journal-entry { font-family: sans-serif; font-size: 14px; color: var(--muted); line-height: 1.8; }
  .journal-cursor { display: inline-block; width: 2px; height: 16px; background: var(--warm); vertical-align: -3px; animation: blink 1.2s step-end infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .journal-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
  .jtag { font-family: sans-serif; font-size: 11px; font-weight: 600; padding: 5px 14px; border-radius: 100px; }

  /* ── Circles preview ── */
  .circles-section { max-width: 1100px; margin: 56px auto 0; padding: 0 48px; }
  .circles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 28px; }
  .circle-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 24px 18px;
    text-align: center;
  }
  .circle-avatar {
    width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 12px;
    display: flex; align-items: center; justify-content: center;
    font-family: sans-serif; font-size: 16px; font-weight: 800;
  }
  .circle-name { font-family: 'Georgia', serif; font-size: 14px; font-weight: 700; letter-spacing: -0.2px; margin-bottom: 4px; }
  .circle-handle { font-family: sans-serif; font-size: 11px; color: var(--muted); margin-bottom: 12px; }
  .circle-streak { font-family: sans-serif; font-size: 13px; font-weight: 700; }

  /* ── Screens list ── */
  .screens-section { max-width: 1100px; margin: 56px auto 0; padding: 0 48px; }
  .screens-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 28px; }
  .screen-chip {
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
    padding: 20px 14px; text-align: center;
  }
  .screen-n { font-family: sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: var(--accent); margin-bottom: 8px; }
  .screen-name { font-family: 'Georgia', serif; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .screen-sub { font-family: sans-serif; font-size: 11px; color: var(--muted); }

  /* ── Pull quote ── */
  .quote-section { max-width: 1100px; margin: 64px auto 0; padding: 0 48px 80px; }
  .quote-inner {
    background: var(--accentLt); border: 1px solid rgba(124,110,173,0.2);
    border-left: 4px solid var(--accent); border-radius: 16px; padding: 36px 44px;
  }
  blockquote { font-family: 'Georgia', serif; font-size: 22px; line-height: 1.6; color: var(--fg); margin-bottom: 18px; }
  cite { font-family: sans-serif; font-size: 12px; color: var(--accent); font-weight: 600; letter-spacing: 0.5px; font-style: normal; }

  /* ── Footer ── */
  footer { border-top: 1px solid var(--border); background: var(--surface); padding: 40px 48px; }
  .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
  .footer-brand { font-family: 'Georgia', serif; font-size: 22px; font-weight: 700; color: var(--accent); letter-spacing: -0.5px; }
  .footer-brand span { display: block; font-family: sans-serif; font-size: 12px; color: var(--muted); font-weight: 400; margin-top: 4px; }
  .footer-links { display: flex; gap: 28px; }
  .footer-links a { font-family: sans-serif; font-size: 13px; color: var(--muted); text-decoration: none; }
  .footer-links a:hover { color: var(--accent); }
  .footer-credit { font-family: sans-serif; font-size: 12px; color: var(--muted); text-align: right; }

  @media (max-width: 768px) {
    .features-grid, .habits-grid, .circles-grid, .screens-row { grid-template-columns: 1fr 1fr; }
    .stats-inner { grid-template-columns: 1fr 1fr; }
    .journal-card { grid-template-columns: 1fr; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    .hero { padding: 60px 24px 40px; }
    .hero-headline { font-size: 48px; }
    .features, .habits-section, .circles-section, .chart-section, .journal-section, .screens-section, .quote-section { padding: 0 24px; }
    .stats-bar { padding: 0 24px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-brand"><em>tendril</em></div>
  <div class="nav-links">
    <a href="#habits">Habits</a>
    <a href="#reflect">Reflect</a>
    <a href="#circles">Circles</a>
  </div>
  <a href="https://ram.zenbin.org/tendril-viewer" class="nav-cta">View Prototype</a>
</nav>

<section class="hero">
  <div class="hero-orb hero-orb-1"></div>
  <div class="hero-orb hero-orb-2"></div>
  <div class="hero-orb hero-orb-3"></div>
  <div class="hero-inner">
    <div class="hero-badge"><span class="hero-badge-dot"></span>Personal growth intelligence</div>
    <h1 class="hero-headline">Small habits.<br><em>Big life.</em></h1>
    <p class="hero-accent-line">The gentle habit tracker that actually sticks.</p>
    <p class="hero-desc">
      Tendril helps you build lasting habits through daily check-ins, reflective journaling, and
      soft analytics — not gamification. Show up once. Then again. Watch the roots take hold.
    </p>
    <div class="hero-ctas">
      <a href="https://ram.zenbin.org/tendril-viewer" class="btn-primary">View Prototype</a>
      <a href="https://ram.zenbin.org/tendril-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
  </div>
</section>

<div class="intention-preview">
  <div class="intention-card">
    <div class="intention-bar"></div>
    <div>
      <div class="intention-label">Today's Intention</div>
      <div class="intention-quote">"Small roots grow the deepest. Show up for just one habit."</div>
      <div class="intention-attr">— Tendril Daily ✦</div>
    </div>
  </div>
</div>

<div class="stats-bar">
  <div class="stats-inner">
    <div class="stat-item">
      <div class="stat-val c-accent">18</div>
      <div class="stat-label">Day streak 🔥</div>
    </div>
    <div class="stat-item">
      <div class="stat-val c-sage">84%</div>
      <div class="stat-label">Completion rate</div>
    </div>
    <div class="stat-item">
      <div class="stat-val c-warm">6</div>
      <div class="stat-label">Active habits</div>
    </div>
    <div class="stat-item">
      <div class="stat-val c-sky">47</div>
      <div class="stat-label">Habits done this week</div>
    </div>
  </div>
</div>

<section class="features" id="habits">
  <div class="section-eyebrow" style="margin-top:72px">Why Tendril</div>
  <h2 class="section-title">Rooted in how change actually happens.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-top" style="background:var(--accent)"></div>
      <div class="feature-icon">🧘</div>
      <div class="feature-title">Morning Check-in</div>
      <div class="feature-desc">Start every day with a personal intention quote and a gentle overview of your daily habits. No pressure — just presence.</div>
    </div>
    <div class="feature-card">
      <div class="feature-top" style="background:var(--sage)"></div>
      <div class="feature-icon">⬡</div>
      <div class="feature-title">Habit Garden</div>
      <div class="feature-desc">Watch your habits grow week by week through soft area charts. See patterns clearly without the anxiety of streaks-at-risk.</div>
    </div>
    <div class="feature-card">
      <div class="feature-top" style="background:var(--warm)"></div>
      <div class="feature-icon">📖</div>
      <div class="feature-title">Evening Reflect</div>
      <div class="feature-desc">A prompted journal for your evening wind-down. Capture small wins, mood, and tags. Your growth story, written by you.</div>
    </div>
    <div class="feature-card">
      <div class="feature-top" style="background:var(--sky)"></div>
      <div class="feature-icon">◈</div>
      <div class="feature-title">Weekly Insights</div>
      <div class="feature-desc">Soft analytics that show you how you're doing — completion rates, best streaks, and habit breakdowns across any time range.</div>
    </div>
    <div class="feature-card">
      <div class="feature-top" style="background:var(--accent)"></div>
      <div class="feature-icon">⬟</div>
      <div class="feature-title">Accountability Circles</div>
      <div class="feature-desc">Join a pod of 2–6 people sharing similar habits. See streaks, send nudges, celebrate group milestones together.</div>
    </div>
    <div class="feature-card">
      <div class="feature-top" style="background:var(--sage)"></div>
      <div class="feature-icon">✦</div>
      <div class="feature-title">Gentle Intelligence</div>
      <div class="feature-desc">Tendril notices patterns without being noisy. It surfaces a "you're 12% ahead of last week" when you need encouragement, not stats.</div>
    </div>
  </div>
</section>

<section class="chart-section">
  <div class="section-eyebrow" style="margin-top:72px">Your Garden</div>
  <h2 class="section-title">See progress, not pressure.</h2>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <div class="chart-title">Completion Rate — Week 12</div>
        <div class="chart-sub">Your best week this month</div>
      </div>
      <div style="text-align:right">
        <div class="chart-val">84%</div>
        <div class="chart-valsub">+12% vs last week</div>
      </div>
    </div>
    <div class="chart-bars">
      ${[
        ['Mon', 70,  'var(--accent)'],
        ['Tue', 75,  'var(--accent)'],
        ['Wed', 82,  'var(--accent)'],
        ['Thu', 68,  'var(--accent)'],
        ['Fri', 90,  'var(--sage)'],
        ['Sat', 84,  'var(--sage)'],
        ['Sun', 84,  'var(--accent)'],
      ].map(([d, v, c]) =>
        `<div class="chart-bar" style="height:${v}%;background:${c};opacity:${d==='Sun'?1:0.7}"></div>`
      ).join('')}
    </div>
    <div class="chart-days">
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<div class="chart-day">${d}</div>`).join('')}
    </div>
    <div class="chart-legend">
      <div class="legend-item"><div class="legend-dot" style="background:var(--accent)"></div>Meditation</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--sky)"></div>Hydration</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--sage)"></div>Reading</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--warm)"></div>Walking</div>
    </div>
  </div>
</section>

<section class="habits-section">
  <div class="section-eyebrow" style="margin-top:72px">Daily Habits</div>
  <h2 class="section-title">One small step at a time.</h2>
  <div class="habits-grid">
    ${[
      { emoji: '🧘', name: 'Morning Meditation', sub: '10 min · 18-day streak', pct: 100, color: 'var(--accent)', bg: 'var(--accentLt)' },
      { emoji: '💧', name: 'Hydration',          sub: '6 of 8 glasses',         pct: 75,  color: 'var(--sky)',    bg: 'var(--skyLt)'    },
      { emoji: '📖', name: 'Evening Reading',    sub: '20 min · in progress',   pct: 60,  color: 'var(--sage)',   bg: 'var(--sageLt)'   },
      { emoji: '🌿', name: 'Walk Outside',       sub: '30 min · not started',   pct: 0,   color: 'var(--warm)',   bg: 'var(--warmLt)'   },
    ].map(h => `
    <div class="habit-card">
      <div class="habit-emoji-wrap" style="background:${h.bg}">${h.emoji}</div>
      <div class="habit-info">
        <div class="habit-name">${h.name}</div>
        <div class="habit-sub">${h.sub}</div>
        <div class="habit-bar-bg"><div class="habit-bar-fill" style="width:${h.pct}%;background:${h.color}"></div></div>
      </div>
      <div class="habit-pct" style="color:${h.color}">${h.pct}%</div>
    </div>`).join('')}
  </div>
</section>

<section class="journal-section" id="reflect">
  <div class="section-eyebrow" style="margin-top:72px">Evening Reflect</div>
  <h2 class="section-title">Your thoughts deserve a home.</h2>
  <div class="journal-card">
    <div>
      <div class="journal-prompt-label">✦ Tonight's Prompt</div>
      <div class="journal-prompt-text">What one small win are you proud of today?</div>
      <div class="journal-entry">
        I managed to meditate this morning even though I felt rushed. It only took 10 minutes
        but it set a calm tone for the whole day. I also remembered to drink more water — small
        wins adding up.<span class="journal-cursor"></span>
      </div>
      <div class="journal-tags">
        <span class="jtag" style="background:var(--accentLt);color:var(--accent)">self-compassion</span>
        <span class="jtag" style="background:var(--sageLt);color:var(--sage)">growth</span>
        <span class="jtag" style="background:var(--warmLt);color:var(--warm)">mindfulness</span>
      </div>
    </div>
    <div>
      <div class="journal-prompt-label">Mood</div>
      <div style="display:flex;gap:12px;margin-bottom:24px">
        ${[['😌','Calm',true],['🌟','Great',false],['😐','Okay',false],['😴','Tired',false]].map(([e,l,s]) =>
          `<div style="text-align:center;padding:12px 10px;border-radius:14px;border:1.5px solid ${s?'var(--accent)':'var(--border)'};background:${s?'var(--accentLt)':'var(--surface)'};min-width:56px">
            <div style="font-size:20px;margin-bottom:4px">${e}</div>
            <div style="font-family:sans-serif;font-size:10px;color:${s?'var(--accent)':'var(--muted)'};font-weight:${s?700:400}">${l}</div>
          </div>`
        ).join('')}
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px">
        <div class="journal-prompt-label">Yesterday's Note</div>
        <div style="font-family:sans-serif;font-size:13px;color:var(--muted);line-height:1.7;font-style:italic">"Feeling scattered but grateful for the walk outside."</div>
      </div>
      <div style="margin-top:16px">
        <div style="font-family:sans-serif;font-size:12px;color:var(--muted);margin-bottom:8px">Completion today</div>
        <div style="height:8px;background:var(--border);border-radius:4px">
          <div style="height:8px;width:66%;background:var(--accent);border-radius:4px"></div>
        </div>
        <div style="font-family:sans-serif;font-size:11px;color:var(--accent);margin-top:6px;font-weight:700">4 of 6 habits done</div>
      </div>
    </div>
  </div>
</section>

<section class="circles-section" id="circles">
  <div class="section-eyebrow" style="margin-top:72px">Accountability Circles</div>
  <h2 class="section-title">Better together. Always.</h2>
  <div class="circles-grid">
    ${[
      { name: 'Priya S.',  handle: 'priya_s', streak: 18, color: 'var(--accent)', bg: 'var(--accentLt)' },
      { name: 'James O.',  handle: 'jamezo',  streak: 14, color: 'var(--sage)',   bg: 'var(--sageLt)'  },
      { name: 'Luna P.',   handle: 'lunapark',streak: 7,  color: 'var(--warm)',   bg: 'var(--warmLt)'  },
      { name: 'Raj M.',    handle: 'raj_m',   streak: 12, color: 'var(--sky)',    bg: 'var(--skyLt)'   },
    ].map(f => `
    <div class="circle-card">
      <div class="circle-avatar" style="background:${f.bg};color:${f.color}">${f.name[0]}${f.name.split(' ')[1]?.[0]||''}</div>
      <div class="circle-name">${f.name}</div>
      <div class="circle-handle">@${f.handle}</div>
      <div class="circle-streak" style="color:${f.color}">🔥 ${f.streak} days</div>
    </div>`).join('')}
  </div>
</section>

<section class="screens-section">
  <div class="section-eyebrow" style="margin-top:64px">Five Screens</div>
  <h2 class="section-title">A full day in one thoughtful app.</h2>
  <div class="screens-row">
    ${[
      { n:'01', name:'Today',    sub:'Morning check-in' },
      { n:'02', name:'Garden',   sub:'Habit area charts' },
      { n:'03', name:'Reflect',  sub:'Journal + mood' },
      { n:'04', name:'Insights', sub:'Weekly analytics' },
      { n:'05', name:'Circles',  sub:'Accountability pods' },
    ].map(s => `
    <div class="screen-chip">
      <div class="screen-n">${s.n}</div>
      <div class="screen-name">${s.name}</div>
      <div class="screen-sub">${s.sub}</div>
    </div>`).join('')}
  </div>
</section>

<div class="quote-section">
  <div class="quote-inner">
    <blockquote>
      "A tendril doesn't force its way upward. It simply reaches, finds something solid,
      and holds on. Growth is just showing up, day after day."
    </blockquote>
    <cite>— Tendril Design Principle · RAM, March 2026</cite>
  </div>
</div>

<footer>
  <div class="footer-inner">
    <div class="footer-brand">
      tendril
      <span>Personal Growth & Habit Intelligence</span>
    </div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/tendril-viewer">Prototype</a>
      <a href="https://ram.zenbin.org/tendril-mock">Interactive Mock</a>
    </div>
    <div class="footer-credit">RAM Design Heartbeat<br>March 26, 2026</div>
  </div>
</footer>

</body>
</html>`;

function buildViewer(penJson) {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tendril — Prototype Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #EEE9E4; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: 'Georgia', serif; }
  header { width: 100%; background: #FFFFFF; border-bottom: 1px solid #DDD7CF; padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; }
  .hdr-brand { font-size: 20px; font-weight: 700; color: #7C6EAD; letter-spacing: -0.5px; }
  .hdr-sub { font-size: 11px; color: #9E978E; letter-spacing: 0.5px; margin-top: 3px; font-family: sans-serif; }
  .hdr-link { font-size: 12px; color: #7C6EAD; text-decoration: none; font-weight: 700; font-family: sans-serif; }
  #pencil-viewer { width: 100%; flex: 1; border: none; min-height: 600px; }
</style>
</head>
<body>
<header>
  <div>
    <div class="hdr-brand">tendril</div>
    <div class="hdr-sub">Personal Growth & Habit Intelligence</div>
  </div>
  <a href="https://ram.zenbin.org/tendril" class="hdr-link">← Overview</a>
</header>
<script>EMBEDDED_PEN_PLACEHOLDER</script>
<script src="https://pencil.dev/viewer.js"></script>
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

(async () => {
  console.log('── Tendril Publish ──');

  console.log('Publishing hero…');
  const heroRes = await zenPublish(SLUG, heroHtml, 'Tendril — Small Habits, Exponential Growth');
  console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));

  const penJson = fs.readFileSync('/workspace/group/design-studio/tendril.pen', 'utf8');
  const viewerHtml = buildViewer(penJson);
  console.log('Publishing viewer…');
  const viewerRes = await zenPublish(SLUG + '-viewer', viewerHtml, 'Tendril — Prototype Viewer');
  console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));

  console.log('Updating gallery queue…');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: '/repos/' + REPO + '/contents/queue.json',
    method: 'GET',
    headers: { 'Authorization': 'token ' + TOKEN, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: 'heartbeat-' + SLUG + '-' + Date.now(),
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: 'https://ram.zenbin.org/' + SLUG,
    mock_url: 'https://ram.zenbin.org/' + SLUG + '-mock',
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
  const putBody = JSON.stringify({ message: 'add: ' + APP_NAME + ' to gallery (heartbeat)', content: newContent, sha: currentSha });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: '/repos/' + REPO + '/contents/queue.json',
    method: 'PUT',
    headers: { 'Authorization': 'token ' + TOKEN, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, newEntry);
    rebuildEmbeddings(db);
    console.log('Indexed in design DB');
  } catch (e) {
    console.log('Design DB skipped:', e.message);
  }

  console.log('');
  console.log('Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
  console.log('Mock:   https://ram.zenbin.org/' + SLUG + '-mock');
})();
