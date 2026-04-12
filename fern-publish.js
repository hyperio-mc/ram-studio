/**
 * FERN — Publish pipeline
 * Hero + viewer + mock + gallery queue + design DB
 * Theme: LIGHT — warm parchment, amber accent, editorial serif
 * Inspired by: Dawn (lapa.ninja), Ray (land-book)
 */
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'fern';
const APP_NAME  = 'Fern';
const TAGLINE   = 'Daily rituals & gentle wellness';
const ARCHETYPE = 'wellness-tracker';
const PROMPT    = 'Mindfulness & daily ritual tracker — light parchment theme, editorial serif type, organic arc progress, morning intentions';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

// ─── HTTP HELPERS ────────────────────────────────────────────────────────────
function zenPost(slug, html, title = '', subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body    = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': body.length,
        'X-Subdomain':    subdomain,
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

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fern — Daily Rituals & Gentle Wellness</title>
<style>
  :root {
    --bg:#F6EFE3; --surface:#FFFDF8; --surface2:#EDE4D3; --surface3:#F9F4EC;
    --amber:#C4793A; --amber-dim:rgba(196,121,58,0.12); --amber-glow:rgba(196,121,58,0.22);
    --sage:#5A7B5E; --sage-dim:rgba(90,123,94,0.12);
    --rose:#B85C4A; --gold:#D4A056;
    --text:#1E130A; --mid:#8A7060; --mute:rgba(30,19,10,0.32);
    --border:rgba(30,19,10,0.09); --border2:rgba(30,19,10,0.14);
    --cream:#E8D9C0;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: "Inter","Helvetica Neue",sans-serif;
    overflow-x: hidden;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(246,239,227,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--cream);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
  }
  .nav-brand { font-family: Georgia,serif; font-size: 20px; font-weight: 700; color: var(--text); text-decoration: none; }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { text-decoration: none; font-size: 13px; color: var(--mid); text-transform: uppercase; letter-spacing: 1.2px; }
  .nav-links a:hover { color: var(--amber); }
  .nav-cta {
    background: var(--amber); color: #fff;
    border: none; padding: 10px 24px; border-radius: 99px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    text-decoration: none;
  }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 80px 40px 60px;
    position: relative; overflow: hidden;
  }
  .hero-orb {
    position: absolute; border-radius: 50%;
    pointer-events: none;
  }
  .orb1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(196,121,58,0.18) 0%, transparent 70%); right: -120px; top: 50px; }
  .orb2 { width: 320px; height: 320px; background: radial-gradient(circle, rgba(90,123,94,0.12) 0%, transparent 70%); left: -80px; bottom: 60px; }
  .orb3 { width: 180px; height: 180px; background: radial-gradient(circle, rgba(196,121,58,0.2) 0%, transparent 70%); right: 240px; top: 140px; }

  .hero-inner {
    max-width: 1100px; width: 100%;
    display: grid; grid-template-columns: 1fr 480px; gap: 80px; align-items: center;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--amber-dim); border: 1px solid rgba(196,121,58,0.2);
    border-radius: 99px; padding: 6px 16px; margin-bottom: 28px;
    font-size: 11px; color: var(--amber); text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600;
  }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); }
  h1 {
    font-family: Georgia,serif;
    font-size: clamp(44px, 6vw, 72px);
    line-height: 1.0;
    color: var(--text);
    font-weight: 700;
    margin-bottom: 12px;
  }
  h1 em { color: var(--amber); font-style: italic; }
  .hero-sub {
    font-size: 18px; line-height: 1.6; color: var(--mid);
    max-width: 440px; margin: 20px 0 36px;
  }
  .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
  .btn-primary {
    background: var(--amber); color: #fff;
    padding: 14px 32px; border-radius: 99px;
    font-weight: 600; font-size: 14px; cursor: pointer;
    text-decoration: none; display: inline-block;
    box-shadow: 0 8px 24px rgba(196,121,58,0.32);
    transition: transform .2s, box-shadow .2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(196,121,58,0.4); }
  .btn-secondary {
    background: var(--surface); color: var(--text);
    padding: 14px 32px; border-radius: 99px;
    font-weight: 500; font-size: 14px; cursor: pointer;
    text-decoration: none; display: inline-block;
    border: 1px solid var(--cream);
    transition: background .2s;
  }
  .btn-secondary:hover { background: var(--cream); }

  /* Phone mockup */
  .phone-wrap { position: relative; display: flex; justify-content: center; align-items: center; }
  .phone-frame {
    width: 295px; height: 620px;
    background: var(--surface);
    border-radius: 48px;
    border: 2px solid var(--cream);
    box-shadow: 0 32px 80px rgba(30,19,10,0.14), 0 8px 24px rgba(30,19,10,0.08);
    position: relative; overflow: hidden;
  }
  .phone-notch {
    width: 100px; height: 28px; background: var(--surface);
    border-radius: 0 0 18px 18px;
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    z-index: 2;
  }
  .phone-screen {
    width: 100%; height: 100%;
    background: var(--bg);
    display: flex; flex-direction: column;
    padding: 36px 20px 16px;
  }
  .phone-time { font-size: 13px; font-weight: 600; margin-bottom: 14px; opacity: 0.6; }
  .phone-greet {
    font-family: Georgia,serif;
    font-size: 28px; font-weight: 700; line-height: 1.1; margin-bottom: 4px;
  }
  .phone-greet-name { color: var(--amber); font-style: italic; }
  .phone-date { font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--mid); margin-bottom: 16px; }
  .phone-card {
    background: var(--surface3);
    border-radius: 16px;
    padding: 14px 16px;
    margin-bottom: 12px;
    border: 1px solid var(--cream);
  }
  .phone-card-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.1px; color: var(--mid); margin-bottom: 6px; }
  .phone-card-text { font-family: Georgia,serif; font-size: 13px; font-style: italic; line-height: 1.4; color: var(--text); }
  .phone-rituals-label { font-size: 11px; font-weight: 600; margin-bottom: 8px; }
  .phone-rituals-row { display: flex; gap: 6px; }
  .phone-ritual-pill {
    flex: 1; aspect-ratio: 1;
    background: var(--amber-dim);
    border-radius: 10px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 14px;
  }
  .phone-ritual-pill.done { background: var(--amber-dim); }
  .phone-ritual-label { font-size: 7px; color: var(--amber); margin-top: 2px; }
  .phone-nav {
    margin-top: auto;
    display: flex; justify-content: space-around;
    padding: 10px 0 4px;
    border-top: 1px solid var(--cream);
  }
  .phone-nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 16px; }
  .phone-nav-dot { width: 20px; height: 3px; background: var(--amber); border-radius: 2px; }
  /* Float rings around phone */
  .float-ring {
    position: absolute; border-radius: 50%;
    border: 1.5px solid; pointer-events: none;
  }
  .ring1 { width: 120px; height: 120px; border-color: rgba(196,121,58,0.2); top: -24px; right: -24px; }
  .ring2 { width: 72px; height: 72px; border-color: rgba(90,123,94,0.25); bottom: 60px; left: -30px; }

  /* FEATURES SECTION */
  .features {
    max-width: 1100px; margin: 0 auto; padding: 100px 40px;
  }
  .section-label {
    font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;
    color: var(--amber); font-weight: 600; margin-bottom: 16px;
  }
  .section-title {
    font-family: Georgia,serif;
    font-size: clamp(32px, 4vw, 48px);
    line-height: 1.1; margin-bottom: 60px; max-width: 520px;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--cream);
    border-radius: 20px; padding: 32px;
    transition: transform .25s, box-shadow .25s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(30,19,10,0.10); }
  .feature-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--amber-dim);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 20px;
  }
  .feature-card h3 { font-family: Georgia,serif; font-size: 20px; margin-bottom: 10px; }
  .feature-card p { font-size: 14px; color: var(--mid); line-height: 1.6; }

  /* QUOTE SECTION */
  .quote-section {
    background: var(--surface3);
    border-top: 1px solid var(--cream);
    border-bottom: 1px solid var(--cream);
    padding: 80px 40px; text-align: center;
  }
  .quote-text {
    font-family: Georgia,serif; font-size: clamp(22px, 3.5vw, 38px);
    font-style: italic; line-height: 1.3; color: var(--text);
    max-width: 720px; margin: 0 auto 20px;
  }
  .quote-attr { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--mid); }

  /* SCREENS SECTION */
  .screens-section {
    max-width: 1100px; margin: 0 auto; padding: 100px 40px;
  }
  .screens-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 40px;
  }
  .screen-thumb {
    background: var(--surface); border: 1px solid var(--cream);
    border-radius: 20px; aspect-ratio: 375/812;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 8px;
    font-size: 28px; color: var(--amber);
    transition: transform .2s;
  }
  .screen-thumb:hover { transform: scale(1.04); }
  .screen-thumb-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--mid); }

  /* CTA FOOTER */
  .cta-section {
    max-width: 1100px; margin: 0 auto; padding: 60px 40px 120px; text-align: center;
  }
  .cta-section h2 { font-family: Georgia,serif; font-size: clamp(28px, 4vw, 48px); margin-bottom: 16px; }
  .cta-section p { font-size: 16px; color: var(--mid); margin-bottom: 36px; }

  footer {
    border-top: 1px solid var(--cream);
    padding: 32px 40px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: var(--mid);
  }
  .footer-brand { font-family: Georgia,serif; font-weight: 700; color: var(--text); font-size: 16px; }

  @media (max-width: 768px) {
    .hero-inner { grid-template-columns: 1fr; }
    .phone-wrap { display: none; }
    .features-grid { grid-template-columns: 1fr; }
    .screens-grid { grid-template-columns: repeat(3, 1fr); }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-brand">Fern</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#about">About</a>
  </div>
  <a href="https://ram.zenbin.org/fern-viewer" class="nav-cta">View Design →</a>
</nav>

<section class="hero">
  <div class="hero-orb orb1"></div>
  <div class="hero-orb orb2"></div>
  <div class="hero-orb orb3"></div>
  <div class="hero-inner">
    <div>
      <div class="hero-badge"><span class="badge-dot"></span>Daily Wellness · 2026</div>
      <h1>Tend to<br>yourself with <em>intention.</em></h1>
      <p class="hero-sub">Fern is a gentle daily companion for morning rituals, mindful journaling, and quiet self-reflection. Not a tracker. A practice.</p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/fern-viewer" class="btn-primary">View Prototype →</a>
        <a href="https://ram.zenbin.org/fern-mock" class="btn-secondary">☀◑ Interactive Mock</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="float-ring ring1"></div>
      <div class="float-ring ring2"></div>
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="phone-time">9:41 AM</div>
          <div class="phone-greet">Good Morning,<br><span class="phone-greet-name">Mara.</span></div>
          <div class="phone-date">Friday, March 27</div>
          <div class="phone-card">
            <div class="phone-card-label">Today's intention</div>
            <div class="phone-card-text">"I move through my day with ease and presence."</div>
          </div>
          <div class="phone-rituals-label">Morning rituals — 4 of 6</div>
          <div class="phone-rituals-row">
            <div class="phone-ritual-pill done">☀<div class="phone-ritual-label">Wake</div></div>
            <div class="phone-ritual-pill done">💧<div class="phone-ritual-label">Water</div></div>
            <div class="phone-ritual-pill done">🧘<div class="phone-ritual-label">Meditate</div></div>
            <div class="phone-ritual-pill done">✍<div class="phone-ritual-label">Journal</div></div>
            <div class="phone-ritual-pill">🌿<div class="phone-ritual-label">Stretch</div></div>
            <div class="phone-ritual-pill">🥣<div class="phone-ritual-label">Eat</div></div>
          </div>
          <div class="phone-nav">
            <div class="phone-nav-item">⌂<div class="phone-nav-dot"></div></div>
            <div class="phone-nav-item" style="opacity:.4">◎</div>
            <div class="phone-nav-item" style="opacity:.4">✦</div>
            <div class="phone-nav-item" style="opacity:.4">◑</div>
            <div class="phone-nav-item" style="opacity:.4">❋</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="quote-section">
  <div class="quote-text">"The present moment always will have been."</div>
  <div class="quote-attr">— Thich Nhat Hanh</div>
</div>

<section class="features" id="features">
  <div class="section-label">Core features</div>
  <h2 class="section-title">Simple rituals.<br>Deep roots.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">☀</div>
      <h3>Morning rituals</h3>
      <p>Build gentle habits with a customizable morning routine tracker. Visual streaks, not pressure — just warmth.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✍</div>
      <h3>Daily journal</h3>
      <p>A distraction-free writing space with flowing typeset pages. Word count lives quietly in the corner.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◑</div>
      <h3>Gentle insights</h3>
      <p>Organic arc charts show your weekly consistency. Not gamified — just honest, warm reflections on your week.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <h3>Set intentions</h3>
      <p>Begin each day with a single guiding intention. Short, meaningful, yours. Not a to-do list — a compass.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">❋</div>
      <h3>Discover community</h3>
      <p>Browse what others are cultivating today. Intentions, rituals, and reflections from a quiet corner of the internet.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">😌</div>
      <h3>Mood logging</h3>
      <p>A single tap, once a day. No analysis, no judgment — just a soft record of how you moved through your moments.</p>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="section-label">Design screens</div>
  <h2 class="section-title">Five quiet spaces<br>to return to.</h2>
  <div class="screens-grid">
    <div class="screen-thumb">⌂<span class="screen-thumb-label">Home</span></div>
    <div class="screen-thumb">◎<span class="screen-thumb-label">Rituals</span></div>
    <div class="screen-thumb">✦<span class="screen-thumb-label">Journal</span></div>
    <div class="screen-thumb">◑<span class="screen-thumb-label">Insights</span></div>
    <div class="screen-thumb">❋<span class="screen-thumb-label">Discover</span></div>
  </div>
  <div style="text-align:center;margin-top:40px">
    <a href="https://ram.zenbin.org/fern-viewer" class="btn-primary">View full prototype →</a>
  </div>
</section>

<section class="cta-section" id="about">
  <h2>Designed with care,<br>rendered in warmth.</h2>
  <p>A RAM Design Heartbeat creation — inspired by Dawn on lapa.ninja and Ray on land-book.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/fern-viewer" class="btn-primary">View prototype</a>
    <a href="https://ram.zenbin.org/fern-mock" class="btn-secondary">☀◑ Interactive mock</a>
  </div>
</section>

<footer>
  <span class="footer-brand">Fern</span>
  <span>Design by RAM · ram.zenbin.org/fern · 2026</span>
  <span>Daily Rituals & Gentle Wellness</span>
</footer>

</body>
</html>`;

// ─── VIEWER HTML (with embedded pen) ─────────────────────────────────────────
function buildViewer(penJson) {
  const viewerBase = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fern — Design Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F6EFE3; font-family: "Inter",sans-serif; display: flex; flex-direction: column; min-height: 100vh; }
  .viewer-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(246,239,227,0.92); backdrop-filter: blur(16px);
    border-bottom: 1px solid #E8D9C0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; height: 56px;
  }
  .v-brand { font-family: Georgia,serif; font-size: 17px; font-weight: 700; color: #1E130A; }
  .v-info { font-size: 12px; color: #8A7060; }
  .v-link { font-size: 12px; color: #C4793A; text-decoration: none; font-weight: 600; }
  .viewer-body { margin-top: 56px; flex: 1; display: flex; justify-content: center; padding: 40px 20px; }
  #pencil-viewer { width: 100%; max-width: 1300px; min-height: 600px; border-radius: 16px; border: 1px solid #E8D9C0; }
</style>
</head>
<body>
<nav class="viewer-nav">
  <span class="v-brand">Fern</span>
  <span class="v-info">Daily Rituals · 5 screens · Light theme</span>
  <a href="https://ram.zenbin.org/fern" class="v-link">← Hero page</a>
</nav>
<div class="viewer-body">
  <div id="pencil-viewer"></div>
</div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
</script>
<script>
(function(){
  if(typeof window.EMBEDDED_PEN === 'string') {
    try {
      const pen = JSON.parse(window.EMBEDDED_PEN);
      const v = document.getElementById('pencil-viewer');
      v.innerHTML = '<p style="padding:40px;color:#8A7060;font-family:Georgia,serif;font-style:italic">Pencil viewer — ' + pen.title + ' · ' + (pen.elements||[]).length + ' elements</p>';
    } catch(e) {}
  }
})();
</script>
</body>
</html>`;

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  return viewerBase.replace('<script>', injection + '\n<script>');
}

async function main() {
  console.log('─── FERN publish pipeline ───');

  // 1. Hero page
  console.log('\n[1/5] Publishing hero page…');
  const r1 = await zenPost(SLUG, heroHtml, 'Fern — Daily Rituals & Gentle Wellness');
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0, 80));

  // 2. Viewer
  console.log('\n[2/5] Publishing viewer…');
  const penJson = fs.readFileSync(path.join(__dirname, 'fern.pen'), 'utf8');
  const viewerHtml = buildViewer(penJson);
  const r2 = await zenPost(`${SLUG}-viewer`, viewerHtml, 'Fern — Design Viewer');
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0, 80));

  // 3. Svelte mock
  console.log('\n[3/5] Building Svelte mock…');
  try {
    const { buildMock, generateSvelteComponent, publishMock } = await import('./svelte-mock-builder.mjs');
    const design = {
      appName:   'Fern',
      tagline:   'Daily rituals & gentle wellness',
      archetype: 'wellness-tracker',
      palette: {
        bg:      '#1A120A',
        surface: '#2A1F14',
        text:    '#F0E8D6',
        accent:  '#C4793A',
        accent2: '#5A7B5E',
        muted:   'rgba(240,232,214,0.4)',
      },
      lightPalette: {
        bg:      '#F6EFE3',
        surface: '#FFFDF8',
        text:    '#1E130A',
        accent:  '#C4793A',
        accent2: '#5A7B5E',
        muted:   'rgba(30,19,10,0.4)',
      },
      screens: [
        {
          id: 'home', label: 'Home',
          content: [
            { type: 'text', label: 'Good morning', value: 'Good Morning, Mara.' },
            { type: 'text', label: 'Today\'s intention', value: '"I move through my day with ease and presence."' },
            { type: 'metric-row', items: [
              { label: 'Streak', value: '12d' },
              { label: 'Done', value: '4/6' },
              { label: 'Mood', value: '8.2' },
            ]},
            { type: 'list', items: [
              { icon: 'check', title: 'Wake at 6:30 am', sub: '6:30 AM', badge: '✓' },
              { icon: 'check', title: 'Drink 500ml water', sub: '6:32 AM', badge: '✓' },
              { icon: 'check', title: 'Meditate 10 min', sub: '6:45 AM', badge: '✓' },
              { icon: 'check', title: 'Morning pages', sub: '7:00 AM', badge: '✓' },
              { icon: 'activity', title: 'Stretch & breathe', sub: '7:30 AM', badge: '○' },
            ]},
          ],
        },
        {
          id: 'rituals', label: 'Rituals',
          content: [
            { type: 'metric', label: 'Current streak', value: '12', sub: 'consecutive days' },
            { type: 'progress', items: [
              { label: 'Morning rituals', pct: 67 },
              { label: 'Evening wind-down', pct: 85 },
              { label: 'Hydration', pct: 90 },
              { label: 'Movement', pct: 55 },
            ]},
            { type: 'tags', label: 'Active rituals', items: ['Wake Early', 'Water', 'Meditate', 'Journal', 'Stretch', 'Breathe'] },
          ],
        },
        {
          id: 'journal', label: 'Journal',
          content: [
            { type: 'metric', label: 'Entries this week', value: '6', sub: 'days journaled' },
            { type: 'text', label: 'Today\'s entry', value: '"Today I woke before my alarm — unusual. The light coming through the curtain had that early-spring quality, soft and almost green..."' },
            { type: 'list', items: [
              { icon: 'calendar', title: 'March 27', sub: '247 words · Morning pages', badge: '✦' },
              { icon: 'calendar', title: 'March 26', sub: '183 words · Evening', badge: '✦' },
              { icon: 'calendar', title: 'March 25', sub: '312 words · Morning', badge: '✦' },
            ]},
          ],
        },
        {
          id: 'insights', label: 'Insights',
          content: [
            { type: 'metric', label: 'Weekly consistency', value: '83%', sub: 'strongest week yet' },
            { type: 'metric-row', items: [
              { label: 'Streak', value: '12' },
              { label: 'Journal', value: '6' },
              { label: 'Moods', value: '14' },
              { label: 'Rituals', value: '24' },
            ]},
            { type: 'progress', items: [
              { label: 'Mon', pct: 70 },
              { label: 'Tue', pct: 80 },
              { label: 'Wed', pct: 60 },
              { label: 'Thu', pct: 90 },
              { label: 'Fri', pct: 80 },
            ]},
          ],
        },
        {
          id: 'discover', label: 'Discover',
          content: [
            { type: 'list', items: [
              { icon: 'heart', title: 'Nadia B.', sub: '"To listen before I speak, to breathe before I react."', badge: '♡ 47' },
              { icon: 'heart', title: 'Tomás L.', sub: '"Today I create space for deep work and slow thinking."', badge: '♡ 31' },
              { icon: 'heart', title: 'Priya K.', sub: '"I am grateful for what I already have."', badge: '♡ 58' },
            ]},
            { type: 'tags', label: 'Trending rituals', items: ['Meditation', 'Gratitude', 'Walking', 'Journaling', 'No screens'] },
          ],
        },
      ],
      nav: [
        { id: 'home',     label: 'Home',     icon: 'home' },
        { id: 'rituals',  label: 'Rituals',  icon: 'check' },
        { id: 'journal',  label: 'Journal',  icon: 'star' },
        { id: 'insights', label: 'Insights', icon: 'chart' },
        { id: 'discover', label: 'Discover', icon: 'search' },
      ],
    };

    const svelteSource = generateSvelteComponent(design);
    const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
    const result = await publishMock(html, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
    console.log('Mock live at:', result.url);
  } catch (e) {
    console.error('Mock build error:', e.message);
  }

  // 4. Gallery queue
  console.log('\n[4/5] Updating gallery queue…');
  try {
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
      prompt: PROMPT,
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
    console.log('Gallery queue:', putRes.status === 200 ? '✓ Updated' : putRes.body.slice(0, 120));
  } catch (e) {
    console.error('Queue error:', e.message);
  }

  // 5. Design DB
  console.log('\n[5/5] Indexing in design DB…');
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, {
      id: `heartbeat-${SLUG}-${Date.now()}`,
      app_name: APP_NAME,
      tagline: TAGLINE,
      archetype: ARCHETYPE,
      design_url: `https://ram.zenbin.org/${SLUG}`,
      mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
      prompt: PROMPT,
      screens: 5,
      source: 'heartbeat',
      published_at: new Date().toISOString(),
    });
    rebuildEmbeddings(db);
    console.log('Design DB: ✓ Indexed');
  } catch (e) {
    console.error('DB error:', e.message);
  }

  console.log('\n✦ FERN published');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(console.error);
