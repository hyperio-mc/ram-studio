#!/usr/bin/env node
// CAPE — publish script — hero + viewer
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'cape';
const APP_NAME  = 'CAPE';
const TAGLINE   = 'Your launchpad for everything that matters.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

const penJson    = fs.readFileSync(path.join(__dirname, 'cape.pen'), 'utf8');
let viewerHtml   = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection  = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml       = viewerHtml.replace('<script>', injection + '\n<script>');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>CAPE — Your launchpad for everything that matters.</title>
  <meta name="description" content="CAPE is a personal mission-phase life tracker. Break big goals into mission phases, track your launch readiness, and log your victories — inspired by aerospace editorial design.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #FAFAF8;
      --surface: #FFFFFF;
      --surface2:#F2F0EC;
      --text:    #0D1B3E;
      --muted:   rgba(13,27,62,0.50);
      --accent:  #FF6B35;
      --accent2: #00B4A0;
      --accent3: #FBBF24;
      --dim:     rgba(13,27,62,0.08);
      --border:  rgba(13,27,62,0.10);
      --nav-bg:  #0D1B3E;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      overflow-x: hidden;
    }

    nav {
      position: sticky; top: 0; z-index: 100;
      padding: 0 40px; height: 62px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(250,250,248,0.90);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-brand {
      font-size: 15px; font-weight: 900;
      letter-spacing: 0.16em; color: var(--text);
    }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; font-weight: 500; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      padding: 9px 20px;
      background: var(--accent);
      color: #fff;
      border-radius: 8px;
      font-size: 13px; font-weight: 700;
      text-decoration: none;
      letter-spacing: 0.02em;
      transition: opacity .2s, transform .2s;
    }
    .nav-cta:hover { opacity: .9; transform: translateY(-1px); }

    /* HERO */
    .hero {
      min-height: 100vh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center;
      padding: 100px 24px 80px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,107,53,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 90% 80%, rgba(0,180,160,0.05) 0%, transparent 60%);
      pointer-events: none;
    }

    /* Grid lines — editorial aerospace aesthetic */
    .hero::after {
      content: '';
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(13,27,62,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(13,27,62,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
    }

    .hero-eyebrow {
      position: relative; z-index: 1;
      display: inline-flex; align-items: center; gap: 8px;
      padding: 7px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      font-size: 10px; font-weight: 800;
      color: var(--accent);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin-bottom: 32px;
      box-shadow: 0 2px 12px rgba(13,27,62,0.06);
    }
    .hero-eyebrow .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--accent);
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.8)} }

    h1 {
      position: relative; z-index: 1;
      font-size: clamp(64px, 10vw, 110px);
      font-weight: 900;
      line-height: 0.95;
      letter-spacing: -0.04em;
      color: var(--text);
      margin-bottom: 12px;
    }
    h1 span { color: var(--accent); }

    .hero-tagline {
      position: relative; z-index: 1;
      font-size: clamp(18px, 2.5vw, 26px);
      color: var(--muted);
      font-weight: 400;
      margin-bottom: 18px;
      letter-spacing: -0.01em;
    }
    .hero-desc {
      position: relative; z-index: 1;
      max-width: 500px;
      font-size: 16px; color: var(--muted);
      line-height: 1.75; margin-bottom: 44px;
    }
    .hero-actions {
      position: relative; z-index: 1;
      display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    }
    .btn-primary {
      padding: 15px 36px;
      background: var(--accent);
      color: #fff; border-radius: 10px;
      font-size: 15px; font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 24px rgba(255,107,53,0.30);
      transition: all .2s;
      letter-spacing: 0.02em;
    }
    .btn-primary:hover { opacity: .9; transform: translateY(-2px); box-shadow: 0 8px 36px rgba(255,107,53,0.35); }
    .btn-ghost {
      padding: 15px 36px;
      background: var(--surface);
      color: var(--text); border-radius: 10px;
      font-size: 15px; font-weight: 600;
      text-decoration: none;
      border: 1.5px solid var(--border);
      transition: all .2s;
    }
    .btn-ghost:hover { border-color: rgba(13,27,62,0.25); transform: translateY(-1px); }

    /* PHASE DEMO */
    .phase-demo {
      position: relative; z-index: 1;
      margin-top: 60px;
      display: flex; align-items: center; gap: 0;
    }
    .phase-node {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
    }
    .phase-circle {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 800;
      transition: all .3s;
    }
    .phase-circle.done  { background: var(--accent2); color: #fff; }
    .phase-circle.active{ background: var(--accent);  color: #fff; box-shadow: 0 0 0 6px rgba(255,107,53,0.15); }
    .phase-circle.next  { background: var(--surface); color: var(--muted); border: 2px solid var(--border); }
    .phase-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: var(--muted); text-transform: uppercase; }
    .phase-label.active { color: var(--text); }
    .phase-connector {
      width: 56px; height: 2px;
      margin-bottom: 22px;
    }
    .phase-connector.done { background: var(--accent2); }
    .phase-connector.next { background: var(--dim); }

    /* METRICS */
    .metrics-strip {
      background: var(--nav-bg);
      padding: 48px 24px;
      display: flex; justify-content: center;
      flex-wrap: wrap; gap: 56px;
    }
    .metric-item { text-align: center; }
    .metric-value { font-size: 40px; font-weight: 900; line-height: 1; letter-spacing: -0.04em; margin-bottom: 6px; }
    .metric-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 700; }
    .v-orange { color: var(--accent); }
    .v-teal   { color: var(--accent2); }
    .v-white  { color: #FFFFFF; }

    /* SECTIONS */
    .section { padding: 90px 24px; max-width: 1080px; margin: 0 auto; }
    .section-label { font-size: 10px; font-weight: 800; letter-spacing: 0.18em; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }
    .section-title { font-size: clamp(30px, 4.5vw, 46px); font-weight: 800; line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 16px; }
    .section-sub { font-size: 16px; color: var(--muted); max-width: 480px; line-height: 1.75; margin-bottom: 52px; }

    /* SCREEN CARDS */
    .screens-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
    .screen-card {
      background: var(--surface);
      border-radius: 14px;
      border: 1.5px solid var(--border);
      padding: 22px 18px 18px;
      transition: all .25s;
    }
    .screen-card:hover { border-color: rgba(255,107,53,0.3); transform: translateY(-3px); box-shadow: 0 10px 40px rgba(13,27,62,0.08); }
    .screen-icon { font-size: 20px; margin-bottom: 10px; }
    .screen-name { font-size: 12px; font-weight: 800; letter-spacing: 0.08em; color: var(--text); margin-bottom: 6px; text-transform: uppercase; }
    .screen-desc { font-size: 12px; color: var(--muted); line-height: 1.55; }

    /* FEATURES */
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 18px; }
    .feature-card {
      background: var(--surface);
      border-radius: 14px;
      border: 1.5px solid var(--border);
      padding: 26px 22px;
    }
    .feature-tag {
      display: inline-block;
      padding: 4px 10px; border-radius: 5px;
      font-size: 9px; font-weight: 800;
      letter-spacing: 0.1em; text-transform: uppercase;
      margin-bottom: 14px;
    }
    .tag-orange { background: rgba(255,107,53,0.12); color: var(--accent); }
    .tag-teal   { background: rgba(0,180,160,0.12);  color: var(--accent2); }
    .tag-amber  { background: rgba(251,191,36,0.12); color: var(--accent3); }
    .tag-navy   { background: rgba(13,27,62,0.08);   color: var(--text); }
    .feature-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .feature-desc  { font-size: 13px; color: var(--muted); line-height: 1.65; }

    /* INSPIRATION */
    .inspo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 40px; }
    .inspo-card {
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 22px 20px;
    }
    .inspo-source { font-size: 9px; font-weight: 800; letter-spacing: 0.14em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
    .inspo-site   { font-size: 16px; font-weight: 700; margin-bottom: 6px; color: var(--text); }
    .inspo-desc   { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* FOOTER */
    footer {
      background: var(--nav-bg);
      padding: 44px 40px;
      display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 14px;
      font-size: 12px; color: rgba(255,255,255,0.4);
    }
    footer strong { color: #FFFFFF; font-weight: 800; letter-spacing: 0.1em; }

    @media (max-width: 640px) {
      nav { padding: 0 20px; }
      .nav-links { display: none; }
      .phase-demo { gap: 0; transform: scale(0.85); transform-origin: center; }
    }
  </style>
</head>
<body>

<nav>
  <span class="nav-brand">CAPE</span>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#inspiration">Inspiration</a>
  </div>
  <a href="https://ram.zenbin.org/cape-viewer" class="nav-cta">View Prototype →</a>
</nav>

<section class="hero">
  <div class="hero-eyebrow">
    <span class="dot"></span>
    Light · Personal Mission Tracker
  </div>
  <h1>CAPE<span>.</span></h1>
  <p class="hero-tagline">Your launchpad for everything that matters.</p>
  <p class="hero-desc">
    Break big goals into mission phases. Track your launch readiness.
    Build momentum and log every milestone cleared — like a mission controller
    for your own life.
  </p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/cape-viewer" class="btn-primary">View Prototype</a>
    <a href="https://ram.zenbin.org/cape-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>

  <!-- Phase timeline demo -->
  <div class="phase-demo">
    <div class="phase-node">
      <div class="phase-circle done">✓</div>
      <div class="phase-label">PREP</div>
    </div>
    <div class="phase-connector done"></div>
    <div class="phase-node">
      <div class="phase-circle active">2</div>
      <div class="phase-label active">BUILD</div>
    </div>
    <div class="phase-connector next"></div>
    <div class="phase-node">
      <div class="phase-circle next">3</div>
      <div class="phase-label">PEAK</div>
    </div>
    <div class="phase-connector next"></div>
    <div class="phase-node">
      <div class="phase-circle next">4</div>
      <div class="phase-label">RACE</div>
    </div>
  </div>
</section>

<div class="metrics-strip">
  <div class="metric-item">
    <div class="metric-value v-orange">4</div>
    <div class="metric-label">Active Missions</div>
  </div>
  <div class="metric-item">
    <div class="metric-value v-teal">11</div>
    <div class="metric-label">Phases Hit</div>
  </div>
  <div class="metric-item">
    <div class="metric-value v-white">87%</div>
    <div class="metric-label">On-Track Rate</div>
  </div>
  <div class="metric-item">
    <div class="metric-value v-orange">7</div>
    <div class="metric-label">Launch Streak</div>
  </div>
</div>

<section class="section" id="screens">
  <div class="section-label">6 Screens</div>
  <h2 class="section-title">Mission control for your goals</h2>
  <p class="section-sub">From launch checklist to mission log, every screen is built around the phase-progression metaphor.</p>
  <div class="screens-grid">
    <div class="screen-card">
      <div class="screen-icon">⊙</div>
      <div class="screen-name">Control</div>
      <div class="screen-desc">All active missions at a glance. Phase dots, progress bars, and a launch-soon alert banner.</div>
    </div>
    <div class="screen-card">
      <div class="screen-icon">◎</div>
      <div class="screen-name">Mission</div>
      <div class="screen-desc">Horizontal phase timeline — the key new pattern. Active phase card in deep navy with milestones below.</div>
    </div>
    <div class="screen-card">
      <div class="screen-icon">▲</div>
      <div class="screen-name">Phase Launch</div>
      <div class="screen-desc">Pre-launch checklist with countdown and required/optional items. Launch CTA in rocket orange.</div>
    </div>
    <div class="screen-card">
      <div class="screen-icon">≡</div>
      <div class="screen-name">Mission Log</div>
      <div class="screen-desc">Editorial timeline with status pills — Complete, In Progress, Missed. Phase history in chronological order.</div>
    </div>
    <div class="screen-card">
      <div class="screen-icon">+</div>
      <div class="screen-name">New Mission</div>
      <div class="screen-desc">Mission builder: name input, category selection, phase count stepper, and live timeline preview.</div>
    </div>
    <div class="screen-card">
      <div class="screen-icon">○</div>
      <div class="screen-name">Profile</div>
      <div class="screen-desc">Overall launch rate ring, on-track/delayed/missed breakdown, streak cards, and mission stats.</div>
    </div>
  </div>
</section>

<section class="section" id="features" style="background: var(--surface2); max-width: none; padding: 90px 24px;">
<div style="max-width: 1080px; margin: 0 auto;">
  <div class="section-label">Design Decisions</div>
  <h2 class="section-title">What makes CAPE distinct</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-tag tag-orange">New Pattern</div>
      <div class="feature-title">Horizontal Phase Timeline</div>
      <div class="feature-desc">The primary navigation metaphor: a horizontal row of phase nodes (done/active/future) with connectors. Adapted from Vast's aerospace mission roadmap — a layout I haven't used in previous designs.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-teal">Color</div>
      <div class="feature-title">Warm White Editorial Palette</div>
      <div class="feature-desc">#FAFAF8 background (not cold white) keeps the editorial warmth of Vast's print-inspired feel. Deep navy #0D1B3E as the primary text color gives strong contrast without pure black harshness.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-amber">Accent Strategy</div>
      <div class="feature-title">Rocket Orange as Launch Signal</div>
      <div class="feature-desc">#FF6B35 is used specifically for "launch readiness" — active phases, alert banners, CTAs. Teal #00B4A0 for completion signals. The two colors never compete because they mean different things.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-navy">Contrast</div>
      <div class="feature-title">Navy Cards Inside Light Screens</div>
      <div class="feature-desc">The active phase card on Mission Detail uses the full #0D1B3E navy — a dark card inside a light screen. Creates strong visual hierarchy and a "command centre" feel within the warm editorial context.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-orange">Language</div>
      <div class="feature-title">Aerospace Mission Metaphors</div>
      <div class="feature-desc">Phases not "steps." Launch not "start." Mission not "project." Phase launch checklist. Pre-launch readiness. The language reframes personal productivity as something worth treating with mission-grade seriousness.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-teal">Critique</div>
      <div class="feature-title">What I'd Change</div>
      <div class="feature-desc">The phase timeline dots are too small on mobile — especially when there are 5+ phases. A collapsing/scrollable timeline strip (like Apple's stage-based progress) would handle variable phase counts better.</div>
    </div>
  </div>
</div>
</section>

<section class="section" id="inspiration">
  <div class="section-label">Research</div>
  <h2 class="section-title">What sparked CAPE</h2>
  <div class="inspo-grid">
    <div class="inspo-card">
      <div class="inspo-source">Awwwards · Nominee Apr 2026</div>
      <div class="inspo-site">Vast (vastspace.com)</div>
      <div class="inspo-desc">White editorial canvas (#FFFFFF), mission-phase roadmap, "Create your mission" CTA. The horizontal phase timeline is a direct translation of Vast's mission stages into a mobile UI pattern.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">siteinspire · Featured</div>
      <div class="inspo-site">Skylrk</div>
      <div class="inspo-desc">Minimal black/white brutalist grid. Showed me how to use maximum white space without feeling empty — the breathing room in CAPE's card layout is a reaction to Skylrk's grid discipline.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">lapa.ninja · Featured</div>
      <div class="inspo-site">Dawn / Human Interest</div>
      <div class="inspo-desc">Editorial hero sections with single bold mission claims. Confirmed the value of large, confident type on white — CAPE's 110px wordmark is a direct response to seeing these bold editorial heroes.</div>
    </div>
  </div>
</section>

<footer>
  <strong>CAPE</strong>
  <span>Design by RAM · Pencil.dev v2.8 · Light theme</span>
  <span>Inspired by Vast (Awwwards) · Skylrk (siteinspire) · Dawn/Human Interest (lapa.ninja)</span>
</footer>

</body>
</html>`;

async function main() {
  const heroRes = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: `${APP_NAME} — ${TAGLINE}` });
  console.log('Hero:', heroRes.status, [200,201].includes(heroRes.status) ? 'OK' : heroRes.body.slice(0,120));

  const viewerRes = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, title: `${APP_NAME} — Prototype Viewer` });
  console.log('Viewer:', viewerRes.status, [200,201].includes(viewerRes.status) ? 'OK' : viewerRes.body.slice(0,120));

  console.log(`\nLive:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
