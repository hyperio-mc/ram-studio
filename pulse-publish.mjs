// PULSE — Real-time Media Intelligence
// Hero page + Viewer + Gallery queue + DB index
import fs from 'fs';

const SLUG     = 'pulse-signal';
const APP_NAME = 'PULSE';
const TAGLINE  = 'Real-time media intelligence.';
const ARCHETYPE = 'media-intelligence';
const ORIGINAL_PROMPT = 'Light-theme AI-powered news monitoring terminal. 5 screens: Feed, Topics, Sources, Alerts, Digest. Inspired by NewsCatcher (Awwwards), Runlayer (land-book), Superset.sh (darkmodedesign). Warm parchment editorial meets live data density.';

async function publish(slug, html, title) {
  const res = await fetch('https://zenbin.org/v1/pages/' + slug + '?overwrite=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Subdomain': 'ram' },
    body: JSON.stringify({ title, html }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Publish failed [${res.status}]: ${JSON.stringify(data)}`);
  return data;
}

const P = {
  bg:       '#F5F2EB',
  surface:  '#FFFFFF',
  surface2: '#EDE9DF',
  text:     '#1C1810',
  muted:    'rgba(28,24,16,0.48)',
  accent:   '#C94828',
  accent2:  '#1D4ED8',
  green:    '#237A4B',
  amber:    '#C97020',
  purple:   '#6B3FA0',
  border:   'rgba(28,24,16,0.1)',
};

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PULSE — Real-time media intelligence</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F5F2EB; --surface: #FFFFFF; --surface2: #EDE9DF;
    --text: #1C1810; --muted: rgba(28,24,16,0.48); --muted2: #B3AC9B;
    --accent: #C94828; --accent2: #1D4ED8; --green: #237A4B;
    --amber: #C97020; --purple: #6B3FA0;
    --border: rgba(28,24,16,0.1);
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(245,242,235,0.90); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 58px; }
  .nav-logo { font-family: 'IBM Plex Mono', monospace; font-size: 18px; font-weight: 600; letter-spacing: 2px; color: var(--text); text-decoration: none; }
  .nav-live { display: inline-flex; align-items: center; gap: 6px; background: var(--accent); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.7px; margin-left: 12px; }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: #fff; font-size: 13px; font-weight: 700; padding: 8px 20px; border-radius: 20px; text-decoration: none; transition: opacity .2s; }
  .nav-cta:hover { opacity: .85; }

  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 100px 24px 60px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(201,72,40,0.1); border: 1px solid rgba(201,72,40,0.25); color: var(--accent); font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; padding: 5px 14px; border-radius: 4px; margin-bottom: 32px; letter-spacing: 0.6px; }
  h1 { font-family: 'Lora', Georgia, serif; font-size: clamp(44px, 6.5vw, 82px); font-weight: 700; line-height: 1.08; color: var(--text); margin-bottom: 24px; max-width: 860px; }
  h1 em { font-style: italic; color: var(--accent); }
  .hero-sub { font-size: clamp(16px, 2vw, 20px); color: var(--muted); max-width: 540px; margin: 0 auto 40px; line-height: 1.6; }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-bottom: 56px; }
  .btn-primary { background: var(--accent); color: #fff; font-size: 15px; font-weight: 700; padding: 13px 30px; border-radius: 6px; text-decoration: none; transition: all .2s; box-shadow: 0 4px 18px rgba(201,72,40,0.28); }
  .btn-primary:hover { opacity: .88; transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--text); font-size: 15px; font-weight: 500; padding: 13px 26px; border-radius: 6px; text-decoration: none; border: 1.5px solid rgba(28,24,16,0.2); transition: all .2s; }
  .btn-ghost:hover { border-color: rgba(28,24,16,0.35); }

  /* Phone mockup */
  .phone-wrap { position: relative; display: inline-block; margin-bottom: 80px; }
  .phone-frame { width: 278px; height: 576px; background: #1C1810; border-radius: 42px; padding: 12px; box-shadow: 0 28px 72px rgba(28,24,16,0.24), 0 4px 14px rgba(28,24,16,0.1); }
  .phone-screen { width: 100%; height: 100%; background: var(--bg); border-radius: 32px; overflow: hidden; position: relative; }
  .phone-notch { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 80px; height: 20px; background: #1C1810; border-radius: 10px; z-index: 10; }

  /* Live feed preview in phone */
  .feed-preview { padding: 22px 12px 8px; }
  .fp-statusbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .fp-time { font-family: 'IBM Plex Mono', monospace; font-size: 8px; font-weight: 600; color: #1C1810; }
  .fp-nav { font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: var(--muted2); }
  .fp-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0 6px; border-bottom: 1px solid rgba(28,24,16,0.1); margin-bottom: 8px; }
  .fp-title { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; color: #1C1810; letter-spacing: 1px; }
  .fp-subtitle { font-size: 7px; color: var(--muted2); margin-top: 1px; }
  .fp-live { background: var(--accent); color: #fff; font-family: 'IBM Plex Mono', monospace; font-size: 7px; font-weight: 700; padding: 2px 7px; border-radius: 3px; letter-spacing: 0.5px; }
  .fp-breaking { background: rgba(201,72,40,0.08); border: 1px solid rgba(201,72,40,0.25); border-radius: 6px; padding: 7px 8px; margin-bottom: 7px; }
  .fp-brk-label { font-family: 'IBM Plex Mono', monospace; font-size: 7px; font-weight: 700; color: var(--accent); letter-spacing: 0.5px; margin-bottom: 3px; }
  .fp-brk-text { font-size: 8px; font-weight: 600; color: #1C1810; line-height: 1.35; }
  .fp-card { background: #fff; border: 1px solid rgba(28,24,16,0.1); border-radius: 6px; padding: 7px 8px; margin-bottom: 5px; }
  .fp-card-head { font-size: 8px; font-weight: 500; color: #1C1810; line-height: 1.35; margin-bottom: 4px; }
  .fp-card-meta { display: flex; justify-content: space-between; }
  .fp-src { font-family: 'IBM Plex Mono', monospace; font-size: 7px; color: var(--accent2); }
  .fp-vol { font-family: 'IBM Plex Mono', monospace; font-size: 7px; font-weight: 600; color: var(--accent); }
  .fp-sent-pos { font-size: 7px; color: var(--green); }
  .fp-sent-neu { font-size: 7px; color: var(--muted2); }

  .stats { display: flex; justify-content: center; gap: clamp(24px, 5vw, 80px); padding: 48px 24px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 0 24px 80px; flex-wrap: wrap; }
  .stat-value { font-family: 'IBM Plex Mono', monospace; font-size: clamp(28px, 3.5vw, 44px); font-weight: 600; color: var(--text); line-height: 1; }
  .stat-label { font-size: 13px; color: var(--muted); margin-top: 6px; }

  .section { max-width: 1080px; margin: 0 auto; padding: 0 24px 100px; }
  .section-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; }
  .section-title { font-family: 'Lora', serif; font-size: clamp(30px, 3.8vw, 46px); font-weight: 700; line-height: 1.15; max-width: 600px; margin-bottom: 48px; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
  .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
  .feature-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
  .feature-icon { font-family: 'IBM Plex Mono', monospace; font-size: 22px; margin-bottom: 16px; color: var(--accent); }
  .feature-title { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
  .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

  .screens-section { background: var(--surface); border-radius: 24px; padding: 44px; margin: 0 24px 80px; border: 1px solid var(--border); }
  .screens-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-top: 28px; }
  .screen-pill { background: var(--bg); border-radius: 12px; padding: 16px 12px; text-align: center; border: 1px solid var(--border); }
  .screen-pill-icon { font-family: 'IBM Plex Mono', monospace; font-size: 18px; color: var(--accent); margin-bottom: 8px; }
  .screen-pill-name { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .screen-pill-desc { font-size: 11px; color: var(--muted); line-height: 1.4; }

  .cta-section { text-align: center; padding: 80px 24px 100px; }
  .cta-title { font-family: 'Lora', serif; font-size: clamp(30px, 4.5vw, 54px); font-weight: 700; margin-bottom: 20px; }
  .cta-title em { font-style: italic; color: var(--accent); }
  .cta-sub { font-size: 17px; color: var(--muted); margin-bottom: 40px; }

  footer { border-top: 1px solid var(--border); padding: 36px 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .footer-logo { font-family: 'IBM Plex Mono', monospace; font-size: 14px; font-weight: 600; letter-spacing: 2px; color: var(--text); }
  .footer-note { font-size: 12px; color: var(--muted); }
  .design-credit a { color: var(--accent); text-decoration: none; }

  @media (max-width: 640px) {
    .screens-grid { grid-template-columns: 1fr 1fr; }
    .stats { gap: 28px; }
    footer { flex-direction: column; text-align: center; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div style="display:flex;align-items:center;">
    <a class="nav-logo" href="#">PULSE</a>
    <div class="nav-live"><span class="live-dot"></span>LIVE</div>
  </div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">5 screens</a>
    <a href="https://ram.zenbin.org/pulse-signal-mock">Interactive mock</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/pulse-signal-mock">Try mock →</a>
</nav>

<section class="hero">
  <div class="hero-badge">◈ Media Intelligence · Mar 2026</div>
  <h1>Every signal,<br><em>in real time.</em></h1>
  <p class="hero-sub">Monitor, cluster, and distill news across 300+ sources — with AI-generated intelligence that surfaces what actually matters.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/pulse-signal-mock">Explore the mock →</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/pulse-signal-viewer">View screens</a>
  </div>

  <!-- Phone mockup with live feed preview -->
  <div class="phone-wrap">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="feed-preview">
          <div class="fp-statusbar">
            <span class="fp-time">9:41</span>
            <span class="fp-nav">88% WiFi</span>
          </div>
          <div class="fp-header">
            <div>
              <div class="fp-title">PULSE</div>
              <div class="fp-subtitle">847 signals today</div>
            </div>
            <div class="fp-live">● LIVE</div>
          </div>
          <div class="fp-breaking">
            <div class="fp-brk-label">⚡ BREAKING</div>
            <div class="fp-brk-text">Fed signals emergency rate review amid market volatility</div>
          </div>
          <div class="fp-card">
            <div class="fp-card-head">OpenAI announces GPT-5 preview with extended context</div>
            <div class="fp-card-meta">
              <span class="fp-src">TC · 14m · 23 sources</span>
              <span class="fp-vol">+8%</span>
            </div>
          </div>
          <div class="fp-card">
            <div class="fp-card-head">Senate advances AI regulation framework to full vote</div>
            <div class="fp-card-meta">
              <span class="fp-src">RTR · 31m · 61 sources</span>
              <span class="fp-sent-neu">Neutral</span>
            </div>
          </div>
          <div class="fp-card">
            <div class="fp-card-head">NVIDIA Q1 data center revenue surpasses $30B</div>
            <div class="fp-card-meta">
              <span class="fp-src">BBG · 55m · 88 sources</span>
              <span class="fp-vol">+12%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<div class="stats">
  <div class="stat"><div class="stat-value">847</div><div class="stat-label">Signals indexed today</div></div>
  <div class="stat"><div class="stat-value">312</div><div class="stat-label">Sources tracked</div></div>
  <div class="stat"><div class="stat-value">5</div><div class="stat-label">Screens designed</div></div>
  <div class="stat"><div class="stat-value">Light</div><div class="stat-label">Warm parchment theme</div></div>
</div>

<!-- FEATURES -->
<div class="section" id="features">
  <div class="section-eyebrow">What PULSE does</div>
  <h2 class="section-title">News intelligence, not news overload.</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Live Signal Feed</div>
      <div class="feature-desc">Real-time stream of indexed stories with breaking alerts, sentiment tags, source badges, and 24-hour volume sparklines.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-title">Topic Clusters</div>
      <div class="feature-desc">7 auto-clustered topics with signal volume bars, sentiment distribution, and velocity deltas — see what's accelerating.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◫</div>
      <div class="feature-title">Source Trust Matrix</div>
      <div class="feature-desc">312 tracked sources ranked by reach, stories/hour, and trust score. Active status, uptime, and velocity at a glance.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◬</div>
      <div class="feature-title">Smart Alerts</div>
      <div class="feature-desc">Keyword + sentiment + volume triggers. TRIGGERED, WATCHING, PAUSED states with threshold descriptions and match history.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◧</div>
      <div class="feature-title">AI Digest</div>
      <div class="feature-desc">Morning briefing written by AI — 3 key signals, market impact scores, sigma deviation, and forward-looking outlook.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⟡</div>
      <div class="feature-title">Signal Outlook</div>
      <div class="feature-desc">Forward-looking AI summary of which clusters to watch. Pairs with export/share for analyst workflow integration.</div>
    </div>
  </div>
</div>

<!-- SCREEN TOUR -->
<div class="screens-section" id="screens">
  <div class="section-eyebrow">5 screens</div>
  <h2 style="font-family:'Lora',serif;font-size:30px;font-weight:700;margin-bottom:6px;">A complete intelligence workflow.</h2>
  <p style="color:var(--muted);font-size:15px;">From raw signal to curated digest.</p>
  <div class="screens-grid">
    <div class="screen-pill">
      <div class="screen-pill-icon">◈</div>
      <div class="screen-pill-name">Feed</div>
      <div class="screen-pill-desc">Live signal stream + breaking alerts + 24h sparkline</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◉</div>
      <div class="screen-pill-name">Topics</div>
      <div class="screen-pill-desc">7 clusters with volume bars + sentiment split</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◫</div>
      <div class="screen-pill-name">Sources</div>
      <div class="screen-pill-desc">312 tracked · reach bars · trust scores</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◬</div>
      <div class="screen-pill-name">Alerts</div>
      <div class="screen-pill-desc">6 monitors · trigger states · new alert CTA</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◧</div>
      <div class="screen-pill-name">Digest</div>
      <div class="screen-pill-desc">AI morning brief · 3 key signals · outlook</div>
    </div>
  </div>
  <div style="margin-top:24px;text-align:center;">
    <a href="https://ram.zenbin.org/pulse-signal-viewer" style="font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--accent);font-weight:600;text-decoration:none;">→ View all screens</a>
  </div>
</div>

<!-- DESIGN NOTES -->
<div class="section">
  <div class="section-eyebrow">Design decisions</div>
  <h2 class="section-title">Why it looks this way.</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-title">Warm parchment base</div>
      <div class="feature-desc">Background #F5F2EB — editorial warmth in a data context. NewsCatcher on Awwwards uses a similarly warm editorial base to humanize information density. Contrast with cold "developer gray" dashboards.</div>
    </div>
    <div class="feature-card">
      <div class="feature-title">Signal red + data blue</div>
      <div class="feature-desc">Accent red #C94828 (urgency, breaking news) paired with data blue #1D4ED8 (analytics, source tags). Two-accent tension borrowed from Superset.sh's dual-signal approach to parallel agent states.</div>
    </div>
    <div class="feature-card">
      <div class="feature-title">IBM Plex Mono for data</div>
      <div class="feature-desc">Monospaced numbers and source codes give the platform a terminal credibility — inspired by NewsCatcher's "graphic elements" emphasis and Runlayer's code/agent identity. Lora serif reserved for the AI Digest output.</div>
    </div>
  </div>
</div>

<section class="cta-section">
  <h2 class="cta-title">The signal is<br><em>always on.</em></h2>
  <p class="cta-sub">Explore the interactive mock or browse all five screens.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/pulse-signal-mock">Interactive mock →</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/pulse-signal-viewer">Screen viewer</a>
  </div>
</section>

<footer>
  <div class="footer-logo">PULSE</div>
  <div class="footer-note">Designed Mar 2026 · Inspired by NewsCatcher (Awwwards) · Runlayer (land-book) · Superset.sh (darkmodedesign)</div>
  <div class="design-credit" style="font-size:12px;color:var(--muted)">By <a href="https://ram.zenbin.org">RAM</a> · Design Heartbeat</div>
</footer>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PULSE — Screen Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F5F2EB; font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 16px; }
  h1 { font-family: 'IBM Plex Mono', monospace; font-size: 20px; font-weight: 600; letter-spacing: 2px; color: #1C1810; margin-bottom: 6px; }
  p { font-size: 13px; color: rgba(28,24,16,0.5); margin-bottom: 24px; }
  #screen-nav { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 28px; }
  .screen-btn { background: #fff; border: 1.5px solid rgba(28,24,16,0.12); color: #1C1810; font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 500; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: all .15s; }
  .screen-btn.active { background: #C94828; border-color: #C94828; color: #fff; font-weight: 700; }
  #render { width: 390px; height: 844px; background: #F5F2EB; border: 1.5px solid rgba(28,24,16,0.12); border-radius: 24px; overflow: hidden; position: relative; box-shadow: 0 8px 40px rgba(0,0,0,0.1); }
  .loading { padding: 40px; text-align: center; color: rgba(28,24,16,0.4); font-size: 14px; }
  .theme-toggle { margin-bottom: 16px; }
  .theme-btn { background: transparent; border: 1px solid rgba(28,24,16,0.15); color: rgba(28,24,16,0.6); font-size: 12px; padding: 6px 14px; border-radius: 20px; cursor: pointer; }
</style>
</head>
<body>
<h1>PULSE</h1>
<p>Real-time media intelligence · 5 screens</p>
<div id="screen-nav"></div>
<div id="render"><div class="loading">Loading screens…</div></div>
<script>window.__PULSE_PLACEHOLDER__ = true;</script>
<script>
(function() {
  function init() {
    const penRaw = window.EMBEDDED_PEN;
    if (!penRaw) { document.getElementById('render').innerHTML = '<div class="loading">No pen data embedded.</div>'; return; }
    const doc = typeof penRaw === 'string' ? JSON.parse(penRaw) : penRaw;
    const screens = [];
    const screenW = 390, screenH = 844;
    const gap = 80;
    const nScreens = 5;
    for (let i = 0; i < nScreens; i++) {
      const offsetX = gap + i * (screenW + gap);
      screens.push({ offsetX, label: ['Feed','Topics','Sources','Alerts','Digest'][i] });
    }
    const nav = document.getElementById('screen-nav');
    const render = document.getElementById('render');
    let current = 0;

    function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function renderEl(el) {
      const type = el.type;
      if (!type) return '';
      if (type === 'frame') {
        const fill = el.fill || 'transparent';
        const r = el.cornerRadius || 0;
        const stroke = el.stroke;
        const border = stroke ? 'border:' + stroke.thickness + 'px solid ' + stroke.fill + ';' : '';
        const clip = el.clip ? 'overflow:hidden;' : '';
        const opacity = el.opacity !== undefined ? 'opacity:' + el.opacity + ';' : '';
        const inner = (el.children || []).map(renderEl).join('');
        return '<div style="position:absolute;left:' + el.x + 'px;top:' + el.y + 'px;width:' + el.width + 'px;height:' + el.height + 'px;background:' + fill + ';border-radius:' + r + 'px;' + border + clip + opacity + '">' + inner + '</div>';
      }
      if (type === 'ellipse') {
        return '<div style="position:absolute;left:' + el.x + 'px;top:' + el.y + 'px;width:' + el.width + 'px;height:' + el.height + 'px;background:' + el.fill + ';border-radius:50%;"></div>';
      }
      if (type === 'text') {
        const ff = el.fontFamily === 'IBM Plex Mono' ? "'IBM Plex Mono',monospace" : "'Inter',sans-serif";
        const lh = el.lineHeight ? 'line-height:' + el.lineHeight + ';' : '';
        const ls = el.letterSpacing ? 'letter-spacing:' + el.letterSpacing + 'px;' : '';
        const ta = el.textAlign === 'right' ? 'right' : el.textAlign === 'center' ? 'center' : 'left';
        const opacity = el.opacity !== undefined ? 'opacity:' + el.opacity + ';' : '';
        const content = esc(el.content || '').replace(/\n/g, '<br>');
        return '<div style="position:absolute;left:' + el.x + 'px;top:' + el.y + 'px;width:' + el.width + 'px;height:' + el.height + 'px;font-size:' + el.fontSize + 'px;font-weight:' + el.fontWeight + ';color:' + el.fill + ';font-family:' + ff + ';text-align:' + ta + ';overflow:hidden;' + lh + ls + opacity + '">' + content + '</div>';
      }
      return '';
    }

    function showScreen(i) {
      current = i;
      const scr = screens[i];
      const offsetX = scr.offsetX;
      const children = (doc.children || []).filter(el => {
        const cx = el.x + (el.width || 0) / 2;
        return cx >= offsetX - 10 && cx <= offsetX + screenW + 10;
      });
      const shifted = children.map(el => shiftEl(el, -offsetX, 0));
      render.innerHTML = shifted.map(renderEl).join('');
      document.querySelectorAll('.screen-btn').forEach((b, j) => b.classList.toggle('active', j === i));
    }

    function shiftEl(el, dx, dy) {
      const shifted = Object.assign({}, el, { x: (el.x || 0) + dx, y: (el.y || 0) + dy });
      if (shifted.children) shifted.children = shifted.children.map(c => shiftEl(c, dx, dy));
      return shifted;
    }

    screens.forEach((scr, i) => {
      const btn = document.createElement('button');
      btn.className = 'screen-btn' + (i === 0 ? ' active' : '');
      btn.textContent = scr.label;
      btn.onclick = () => showScreen(i);
      nav.appendChild(btn);
    });
    showScreen(0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
</body>
</html>`;

// Inject pen
const penJson = fs.readFileSync('/workspace/group/design-studio/pulse.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>window.__PULSE_PLACEHOLDER__ = true;</script>', injection);

// ── Publish ────────────────────────────────────────────────────────────────────
console.log('Publishing PULSE hero…');
await publish(SLUG, heroHtml, 'PULSE — Real-time media intelligence');
console.log('✅ Hero:', `https://ram.zenbin.org/${SLUG}`);

console.log('Publishing viewer…');
await publish(`${SLUG}-viewer`, viewerHtml, 'PULSE — Design Screens Viewer');
console.log('✅ Viewer:', `https://ram.zenbin.org/${SLUG}-viewer`);
