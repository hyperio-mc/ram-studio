/**
 * FABLE — Full Design Discovery Pipeline
 * Hero page + Viewer + Gallery queue
 * Light theme: warm cream + terracotta + sage
 */

const https = require('https');
const fs    = require('fs');

const SLUG      = 'fable';
const APP       = 'FABLE';
const TAGLINE   = 'read deeply, not just more';
const ARCHETYPE = 'reading-wellness-light';
const PROMPT    = 'Light-theme slow-reading & focus companion. Warm cream + terracotta + sage palette. Editorial serif headings. Inspired by Dawn wellness app on Lapa Ninja and cozy library aesthetic on Land-book. 5 screens: Today, Library, Focus Session, Insights, Discover.';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch(e) { resolve({ url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) }); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// ─── HERO PAGE ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FABLE — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:      #F7F3ED;
    --parchment:  #EDE8DF;
    --espresso:   #1C1714;
    --terracotta: #C4613A;
    --sage:       #6B9E78;
    --dust:       #C8C0B4;
    --warm-white: #FDFAF7;
    --blush:      #F2E8E1;
    --ink:        #2E2420;
    --fog:        rgba(28,23,20,0.38);
  }

  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--cream);
    color: var(--espresso);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── NAV ─── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px;
    background: rgba(247,243,237,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(200,192,180,0.3);
  }
  .logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    color: var(--espresso); letter-spacing: -0.5px;
  }
  .logo span { color: var(--terracotta); }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { text-decoration: none; color: var(--ink); opacity: 0.6; font-size: 14px; font-weight: 500; transition: opacity .2s; }
  .nav-links a:hover { opacity: 1; }
  .nav-cta {
    background: var(--espresso); color: var(--warm-white);
    border: none; padding: 10px 24px; border-radius: 50px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif; transition: transform .2s;
  }
  .nav-cta:hover { transform: translateY(-1px); }

  /* ── HERO ─── */
  .hero {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 120px 48px 80px;
    position: relative;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 60% at 65% 40%, rgba(196,97,58,0.12) 0%, transparent 70%),
                radial-gradient(ellipse 50% 50% at 20% 80%, rgba(107,158,120,0.1) 0%, transparent 60%),
                var(--cream);
  }
  .hero-inner {
    position: relative; z-index: 1;
    max-width: 1100px; width: 100%;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-text {}
  .eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
    color: var(--terracotta); margin-bottom: 24px;
    padding: 6px 16px; background: rgba(196,97,58,0.1); border-radius: 50px;
  }
  h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(48px, 6vw, 78px);
    font-weight: 900; line-height: 1.05;
    color: var(--espresso); margin-bottom: 24px;
    letter-spacing: -2px;
  }
  h1 em { color: var(--terracotta); font-style: italic; }
  .hero-sub {
    font-size: 18px; line-height: 1.7; color: var(--ink); opacity: 0.65;
    max-width: 440px; margin-bottom: 40px; font-weight: 400;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--espresso); color: var(--warm-white);
    border: none; padding: 16px 32px; border-radius: 50px;
    font-size: 15px; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif; text-decoration: none;
    transition: all .25s; display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { background: var(--terracotta); transform: translateY(-2px); }
  .btn-secondary {
    color: var(--espresso); font-size: 15px; font-weight: 500;
    text-decoration: none; opacity: 0.65; transition: opacity .2s;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-secondary:hover { opacity: 1; }
  .hero-stats {
    display: flex; gap: 32px; margin-top: 48px;
    padding-top: 32px; border-top: 1px solid rgba(200,192,180,0.4);
  }
  .stat-item { display: flex; flex-direction: column; gap: 4px; }
  .stat-val {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700; color: var(--espresso);
  }
  .stat-label { font-size: 11px; color: var(--ink); opacity: 0.5; font-weight: 500; letter-spacing: 0.5px; }

  /* ── PHONE MOCK ─── */
  .hero-visual { display: flex; justify-content: center; align-items: center; }
  .phone-shell {
    width: 260px; height: 530px;
    background: var(--espresso);
    border-radius: 40px;
    padding: 10px;
    box-shadow: 0 40px 80px rgba(28,23,20,0.25), 0 0 0 1px rgba(28,23,20,0.1);
    position: relative;
  }
  .phone-inner {
    width: 100%; height: 100%;
    background: var(--cream); border-radius: 32px;
    overflow: hidden; position: relative;
  }
  .phone-screen {
    padding: 28px 20px 20px;
    height: 100%; display: flex; flex-direction: column; gap: 12px;
  }
  .phone-greeting { font-size: 9px; color: var(--terracotta); font-weight: 600; letter-spacing: 1px; }
  .phone-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; line-height: 1.2; color: var(--espresso);
  }
  .phone-streak {
    display: inline-flex; align-items: center; gap: 4px;
    background: var(--terracotta); color: #fff;
    font-size: 9px; font-weight: 700; padding: 4px 10px; border-radius: 12px;
    width: fit-content;
  }
  .phone-card {
    background: var(--warm-white); border-radius: 14px;
    padding: 12px; border: 1px solid rgba(200,192,180,0.4);
  }
  .phone-card-label { font-size: 8px; color: var(--terracotta); font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
  .phone-card-title { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: var(--espresso); }
  .phone-card-author { font-size: 9px; color: var(--ink); opacity: 0.5; margin-bottom: 8px; }
  .progress-bar { height: 4px; background: var(--parchment); border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; width: 65%; background: var(--terracotta); border-radius: 2px; }
  .progress-meta { display: flex; justify-content: space-between; margin-top: 4px; font-size: 8px; opacity: 0.5; }
  .goals-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
  .goal-chip {
    background: var(--parchment); border-radius: 10px; padding: 8px 6px;
    text-align: center;
  }
  .goal-chip-val { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--espresso); }
  .goal-chip-label { font-size: 7px; color: var(--ink); opacity: 0.5; }
  .phone-cta {
    background: var(--espresso); color: var(--warm-white);
    border-radius: 12px; padding: 10px; text-align: center;
    font-size: 10px; font-weight: 700; letter-spacing: 0.5px; margin-top: auto;
  }
  .phone-notch {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 90px; height: 28px; background: var(--espresso);
    border-radius: 0 0 16px 16px; z-index: 10;
  }
  .floating-badge {
    position: absolute; top: -16px; right: -24px;
    background: var(--terracotta); color: #fff;
    border-radius: 50%; width: 64px; height: 64px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 8px; font-weight: 700; text-align: center; line-height: 1.2;
    box-shadow: 0 8px 24px rgba(196,97,58,0.4);
  }
  .floating-badge .badge-num { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; }

  /* ── FEATURES ─── */
  .section {
    max-width: 1100px; margin: 0 auto; padding: 96px 48px;
  }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
    color: var(--terracotta); margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 4vw, 52px); font-weight: 900;
    color: var(--espresso); line-height: 1.1; letter-spacing: -1.5px;
    margin-bottom: 16px;
  }
  .section-sub { font-size: 16px; color: var(--ink); opacity: 0.6; max-width: 500px; line-height: 1.7; }

  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 56px;
  }
  .feature-card {
    background: var(--warm-white); border-radius: 20px; padding: 32px;
    border: 1px solid rgba(200,192,180,0.4);
    transition: transform .25s, box-shadow .25s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(28,23,20,0.1); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--blush); display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 20px;
  }
  .feature-title { font-size: 17px; font-weight: 700; color: var(--espresso); margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: var(--ink); opacity: 0.6; line-height: 1.65; }

  /* ── SCREENS SECTION ─── */
  .screens-section {
    background: var(--parchment);
    padding: 96px 48px;
  }
  .screens-inner { max-width: 1100px; margin: 0 auto; }
  .screens-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;
    margin-top: 48px;
  }
  .screen-thumb {
    background: var(--warm-white); border-radius: 20px; overflow: hidden;
    border: 1px solid rgba(200,192,180,0.4);
    aspect-ratio: 9/16;
    display: flex; flex-direction: column;
    transition: transform .25s;
  }
  .screen-thumb:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(28,23,20,0.12); }
  .screen-header {
    padding: 14px 12px 8px;
    border-bottom: 1px solid rgba(200,192,180,0.3);
  }
  .screen-header-label { font-size: 7px; font-weight: 700; letter-spacing: 1.5px; color: var(--terracotta); text-transform: uppercase; }
  .screen-header-title { font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: var(--espresso); line-height: 1.3; margin-top: 2px; }
  .screen-body { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
  .mock-bar { height: 6px; border-radius: 3px; background: var(--parchment); }
  .mock-bar.accent { background: var(--terracotta); opacity: 0.7; }
  .mock-bar.sage { background: var(--sage); opacity: 0.6; }
  .mock-card { background: var(--parchment); border-radius: 8px; padding: 8px; }
  .mock-rect { height: 32px; background: var(--parchment); border-radius: 6px; }
  .mock-rect.terracotta { background: rgba(196,97,58,0.25); height: 48px; }
  .screen-label {
    text-align: center; padding: 10px;
    font-size: 9px; font-weight: 700; letter-spacing: 1px; color: var(--ink); opacity: 0.5; text-transform: uppercase;
  }

  /* ── PHILOSOPHY SECTION ─── */
  .philosophy-section { max-width: 1100px; margin: 0 auto; padding: 96px 48px; }
  .philosophy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; margin-top: 56px; }
  .philosophy-quote {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 700; line-height: 1.3;
    color: var(--espresso); font-style: italic;
    border-left: 3px solid var(--terracotta); padding-left: 32px;
  }
  .philosophy-quote cite { display: block; margin-top: 16px; font-size: 14px; font-style: normal; opacity: 0.5; font-family: 'Inter', sans-serif; }
  .philosophy-points { display: flex; flex-direction: column; gap: 28px; }
  .philo-point { display: flex; gap: 16px; }
  .philo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--terracotta); margin-top: 8px; flex-shrink: 0; }
  .philo-text h4 { font-size: 15px; font-weight: 700; color: var(--espresso); margin-bottom: 4px; }
  .philo-text p { font-size: 14px; color: var(--ink); opacity: 0.6; line-height: 1.6; }

  /* ── CTA SECTION ─── */
  .cta-section {
    background: var(--espresso);
    padding: 96px 48px;
    text-align: center;
  }
  .cta-inner { max-width: 600px; margin: 0 auto; }
  .cta-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 4vw, 52px); font-weight: 900;
    color: var(--warm-white); line-height: 1.1; letter-spacing: -1.5px;
    margin-bottom: 16px;
  }
  .cta-section h2 em { color: var(--terracotta); font-style: italic; }
  .cta-section p { font-size: 16px; color: var(--warm-white); opacity: 0.55; margin-bottom: 36px; line-height: 1.7; }
  .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-light {
    background: var(--warm-white); color: var(--espresso);
    border: none; padding: 16px 32px; border-radius: 50px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'Inter', sans-serif; text-decoration: none;
    transition: all .25s; display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-light:hover { background: var(--terracotta); color: #fff; transform: translateY(-2px); }
  .btn-outline {
    background: transparent; color: var(--warm-white);
    border: 1px solid rgba(253,250,247,0.25); padding: 16px 32px; border-radius: 50px;
    font-size: 15px; font-weight: 500; cursor: pointer;
    font-family: 'Inter', sans-serif; text-decoration: none;
    transition: all .25s;
  }
  .btn-outline:hover { border-color: rgba(253,250,247,0.6); transform: translateY(-2px); }

  /* ── FOOTER ─── */
  footer {
    background: var(--espresso); padding: 32px 48px;
    border-top: 1px solid rgba(253,250,247,0.08);
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--warm-white); }
  .footer-credit { font-size: 12px; color: var(--warm-white); opacity: 0.35; }
  .footer-links { display: flex; gap: 24px; list-style: none; }
  .footer-links a { color: var(--warm-white); opacity: 0.35; font-size: 12px; text-decoration: none; transition: opacity .2s; }
  .footer-links a:hover { opacity: 0.75; }

  @media (max-width: 768px) {
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
    .hero { padding: 100px 20px 60px; }
    .hero-inner { grid-template-columns: 1fr; gap: 40px; }
    .hero-visual { display: none; }
    .section { padding: 64px 20px; }
    .features-grid { grid-template-columns: 1fr; }
    .screens-grid { grid-template-columns: repeat(2, 1fr); }
    .philosophy-grid { grid-template-columns: 1fr; }
    .cta-section { padding: 64px 20px; }
    footer { flex-direction: column; gap: 16px; text-align: center; padding: 24px 20px; }
  }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="logo">f<span>a</span>ble</div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#philosophy">Philosophy</a></li>
  </ul>
  <button class="nav-cta">Download Beta</button>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-inner">
    <div class="hero-text">
      <div class="eyebrow">✦ Reading Companion</div>
      <h1>Read <em>deeply</em>,<br>not just more.</h1>
      <p class="hero-sub">Fable is a slow-reading companion that tracks your focus sessions, celebrates your streaks, and surfaces insights from your reading life — without the noise.</p>
      <div class="hero-actions">
        <a href="/fable-viewer" class="btn-primary">◎ View Prototype →</a>
        <a href="/fable-mock" class="btn-secondary">Interactive mock ↗</a>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-val">23</span>
          <span class="stat-label">Day Streak</span>
        </div>
        <div class="stat-item">
          <span class="stat-val">312</span>
          <span class="stat-label">Pages This Week</span>
        </div>
        <div class="stat-item">
          <span class="stat-val">44</span>
          <span class="stat-label">Pages / Hour</span>
        </div>
      </div>
    </div>

    <div class="hero-visual">
      <div style="position:relative;">
        <div class="phone-shell">
          <div class="phone-notch"></div>
          <div class="phone-inner">
            <div class="phone-screen">
              <div class="phone-greeting">GOOD MORNING, SAM</div>
              <div class="phone-title">Your story<br>continues.</div>
              <div class="phone-streak">🔥 23 day streak</div>
              <div class="phone-card">
                <div class="phone-card-label">Currently Reading</div>
                <div class="phone-card-title">The Midnight Library</div>
                <div class="phone-card-author">Matt Haig</div>
                <div class="progress-bar"><div class="progress-fill"></div></div>
                <div class="progress-meta"><span>65% complete</span><span>≈ 4h left</span></div>
              </div>
              <div class="goals-row">
                <div class="goal-chip"><div class="goal-chip-val">18</div><div class="goal-chip-label">pages read</div></div>
                <div class="goal-chip"><div class="goal-chip-val">28</div><div class="goal-chip-label">min focused</div></div>
                <div class="goal-chip"><div class="goal-chip-val">1</div><div class="goal-chip-label">sessions</div></div>
              </div>
              <div class="phone-cta">◷ Begin Focus Session</div>
            </div>
          </div>
        </div>
        <div class="floating-badge"><span class="badge-num">5</span>screens</div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="section" id="features">
  <div class="section-label">What Fable does</div>
  <h2 class="section-title">Everything a slow reader needs.</h2>
  <p class="section-sub">Designed for people who believe that reading should be a ritual, not a race.</p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <h3 class="feature-title">Focus Sessions</h3>
      <p class="feature-desc">Distraction-free reading timers with ambient soundscapes — forest, café, rain, ocean. Log pages as you go.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊟</div>
      <h3 class="feature-title">Smart Library</h3>
      <p class="feature-desc">Organize your books by reading status. See progress at a glance. Never lose your place or forget what you meant to read next.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <h3 class="feature-title">Reading Insights</h3>
      <p class="feature-desc">Weekly velocity, genre breakdowns, streak data. Understand your reading patterns without obsessing over them.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◬</div>
      <h3 class="feature-title">Curated Discovery</h3>
      <p class="feature-desc">Editor-picked recommendations filtered by reading mood — calm, learn, escape, connect. No algorithms, just taste.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔥</div>
      <h3 class="feature-title">Streaks & Goals</h3>
      <p class="feature-desc">Gentle daily goals for pages, minutes, and sessions. Celebrate consistency over volume — 30 pages is plenty.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✎</div>
      <h3 class="feature-title">Reading Notes</h3>
      <p class="feature-desc">Quick-capture thoughts during focus sessions. Review your notes alongside your progress stats.</p>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section class="screens-section" id="screens">
  <div class="screens-inner">
    <div class="section-label">5 screens</div>
    <h2 class="section-title">Every part of your reading life.</h2>
    <p class="section-sub" style="color:var(--ink)">From today's ritual to long-term progress — everything in one warm, editorial app.</p>

    <div class="screens-grid">
      <div class="screen-thumb">
        <div class="screen-header">
          <div class="screen-header-label">Home</div>
          <div class="screen-header-title">Today</div>
        </div>
        <div class="screen-body">
          <div class="mock-bar accent" style="width:55%"></div>
          <div class="mock-bar" style="width:75%"></div>
          <div class="mock-bar" style="width:40%"></div>
          <div class="mock-card">
            <div class="mock-bar" style="width:60%;margin-bottom:4px"></div>
            <div class="mock-bar accent" style="width:100%;height:3px"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
            <div class="mock-rect" style="border-radius:8px"></div>
            <div class="mock-rect" style="border-radius:8px"></div>
            <div class="mock-rect" style="border-radius:8px"></div>
          </div>
          <div class="mock-rect terracotta" style="border-radius:10px;opacity:0.5"></div>
        </div>
        <div class="screen-label">Today</div>
      </div>

      <div class="screen-thumb">
        <div class="screen-header">
          <div class="screen-header-label">Collection</div>
          <div class="screen-header-title">Library</div>
        </div>
        <div class="screen-body">
          <div class="mock-bar" style="width:80%"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <div class="mock-rect terracotta" style="border-radius:10px"></div>
            <div style="height:48px;background:rgba(107,158,120,0.2);border-radius:10px"></div>
            <div style="height:48px;background:rgba(74,127,165,0.2);border-radius:10px"></div>
            <div style="height:48px;background:rgba(201,168,108,0.2);border-radius:10px"></div>
          </div>
          <div class="mock-bar" style="width:60%"></div>
        </div>
        <div class="screen-label">Library</div>
      </div>

      <div class="screen-thumb">
        <div class="screen-header">
          <div class="screen-header-label">Active</div>
          <div class="screen-header-title">Focus Session</div>
        </div>
        <div class="screen-body">
          <div class="mock-bar" style="width:55%"></div>
          <div style="background:var(--parchment);border-radius:50%;width:70px;height:70px;margin:4px auto;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:var(--espresso)">28:32</div>
          <div style="display:flex;gap:4px">
            <div class="mock-bar sage" style="height:20px;border-radius:6px;flex:1"></div>
            <div class="mock-bar" style="height:20px;border-radius:6px;flex:1"></div>
            <div class="mock-bar" style="height:20px;border-radius:6px;flex:1"></div>
          </div>
          <div class="mock-bar" style="width:100%"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <div class="mock-rect" style="border-radius:8px;height:28px"></div>
            <div class="mock-rect terracotta" style="border-radius:8px;height:28px;opacity:0.5"></div>
          </div>
        </div>
        <div class="screen-label">Focus</div>
      </div>

      <div class="screen-thumb">
        <div class="screen-header">
          <div class="screen-header-label">Stats</div>
          <div class="screen-header-title">Insights</div>
        </div>
        <div class="screen-body">
          <div class="mock-bar" style="width:70%"></div>
          <div style="display:flex;gap:3px;align-items:flex-end;height:36px">
            ${[40,28,52,44,20,60,48].map(h => `<div style="flex:1;height:${h}%;background:var(--parchment);border-radius:3px 3px 0 0"></div>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
            <div class="mock-rect" style="border-radius:8px;height:32px"></div>
            <div class="mock-rect" style="border-radius:8px;height:32px"></div>
            <div class="mock-rect" style="border-radius:8px;height:32px"></div>
          </div>
          <div class="mock-bar accent" style="width:48%"></div>
          <div class="mock-bar sage" style="width:28%"></div>
          <div class="mock-rect terracotta" style="border-radius:8px;height:28px;opacity:0.35"></div>
        </div>
        <div class="screen-label">Insights</div>
      </div>

      <div class="screen-thumb">
        <div class="screen-header">
          <div class="screen-header-label">Find</div>
          <div class="screen-header-title">Discover</div>
        </div>
        <div class="screen-body">
          <div class="mock-rect terracotta" style="border-radius:12px;height:60px;opacity:0.7"></div>
          <div style="display:flex;gap:4px">
            <div class="mock-bar sage" style="height:18px;border-radius:9px;width:44px"></div>
            <div class="mock-bar" style="height:18px;border-radius:9px;flex:1"></div>
          </div>
          <div class="mock-card"><div class="mock-bar" style="width:80%;margin-bottom:4px"></div><div class="mock-bar" style="width:50%"></div></div>
          <div class="mock-card"><div class="mock-bar" style="width:70%;margin-bottom:4px"></div><div class="mock-bar" style="width:45%"></div></div>
        </div>
        <div class="screen-label">Discover</div>
      </div>
    </div>
  </div>
</section>

<!-- PHILOSOPHY -->
<section class="philosophy-section" id="philosophy">
  <div class="section-label">Design philosophy</div>
  <h2 class="section-title">Calm by design.</h2>
  <div class="philosophy-grid">
    <div>
      <blockquote class="philosophy-quote">
        "The world is full of information. Fable is for the moments you choose depth."
        <cite>— Design principle, March 2026</cite>
      </blockquote>
    </div>
    <div class="philosophy-points">
      <div class="philo-point">
        <div class="philo-dot"></div>
        <div class="philo-text">
          <h4>Warm, not clinical</h4>
          <p>Most productivity apps feel like spreadsheets. Fable uses cream, terracotta and sage — colours that feel like a good library or a favourite café.</p>
        </div>
      </div>
      <div class="philo-point">
        <div class="philo-dot"></div>
        <div class="philo-text">
          <h4>Editorial typography</h4>
          <p>Playfair Display headings mixed with Inter body text. Reading is about words — the interface should honour that with considered type choices.</p>
        </div>
      </div>
      <div class="philo-point">
        <div class="philo-dot"></div>
        <div class="philo-text">
          <h4>Progress, not pressure</h4>
          <p>Streaks celebrate consistency rather than shaming gaps. Goals are gentle. Focus sessions are voluntary. The app works for you, not against you.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-inner">
    <h2>Start your reading <em>ritual</em>.</h2>
    <p>Join readers who measure depth, not just pages. Your next chapter starts today.</p>
    <div class="cta-buttons">
      <a href="/fable-mock" class="btn-light">◎ Try the Mock →</a>
      <a href="/fable-viewer" class="btn-outline">View Prototype</a>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">fable</div>
  <ul class="footer-links">
    <li><a href="/fable-viewer">Prototype</a></li>
    <li><a href="/fable-mock">Interactive Mock</a></li>
  </ul>
  <div class="footer-credit">RAM Design Heartbeat · Mar 2026</div>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ──────────────────────────────────────────────────────────────
function buildViewer(penJson) {
  const base = fs.readFileSync('/workspace/group/viewer/index.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  return base.replace('<script>', injection + '\n<script>');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing FABLE…');

  // 1. Hero
  const heroRes = await publish(SLUG, heroHtml, `FABLE — ${TAGLINE}`);
  console.log('Hero:', heroRes.url || heroRes);

  // 2. Viewer
  const penJson = fs.readFileSync('./fable.pen', 'utf8');
  let viewerHtml;
  try {
    viewerHtml = buildViewer(penJson);
  } catch(e) {
    // Fallback minimal viewer
    viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FABLE Viewer</title>
    <script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
    </head><body style="margin:0;background:#F7F3ED;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif">
    <div style="text-align:center;color:#1C1714">
      <h1 style="font-size:48px;margin-bottom:8px">fable</h1>
      <p style="opacity:0.55">Prototype loaded — ${JSON.stringify(penJson).length} bytes</p>
      <a href="/fable" style="color:#C4613A">← Back to overview</a>
    </div></body></html>`;
  }
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `FABLE — Prototype Viewer`);
  console.log('Viewer:', viewerRes.url || viewerRes);

  console.log('\n✓ Done publishing FABLE');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
