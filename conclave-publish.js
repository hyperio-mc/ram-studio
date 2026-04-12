// conclave-publish.js — Full Design Discovery pipeline for CONCLAVE
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG      = 'conclave';
const APP_NAME  = 'Conclave';
const TAGLINE   = 'Private travel intelligence for the select few';
const ARCHETYPE = 'luxury-travel-concierge';

const ORIGINAL_PROMPT = `Design Conclave — a dark luxury travel concierge app for private members. Inspired by:

1. Atlas Card (godly.website) — luxury concierge card app with near-black backgrounds, editorial section-per-feature layout, warm ivory type, full-bleed imagery panels. Exclusive membership vibes with "Dining", "Hotels", "Experiences", "Benefits" sections.
2. Maker (darkmodedesign.com) — exclusive founders community, editorial dark, invitation-only feel, bold sans headings.

Trend: "Luxury Editorial Dark" — obsidian near-black (#0D0D0F), warm gold accent (#C8A96E), warm ivory text (#F0EDE6), full-bleed moody imagery panels, bold display numerics, section-per-feature reveal. 5 screens: Home · Discover · Trip Planner · Concierge Chat · Member Profile.`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
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

async function get_(host, path_) {
  return httpsReq({ hostname: host, path: path_, method: 'GET', headers: { 'User-Agent': 'ram/1.0' } });
}

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${APP_NAME} Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

async function updateGalleryQueue(designUrl, mockUrl) {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const now = new Date().toISOString();
  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   designUrl,
    mock_url:     mockUrl,
    submitted_at: now,
    published_at: now,
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120);
}

// ── Design palette for hero page ──────────────────────────────────────────────
const P = {
  bg:      '#0D0D0F',
  surface: '#161618',
  surface2:'#1E1E22',
  text:    '#F0EDE6',
  muted:   'rgba(240,237,230,0.5)',
  accent:  '#C8A96E',
  accentS: 'rgba(200,169,110,0.12)',
  teal:    '#6B8F8C',
  violet:  '#9B7BAE',
  green:   '#4CAF7D',
  border:  'rgba(200,169,110,0.12)',
  borderM: 'rgba(200,169,110,0.2)',
};

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: ${P.bg};
    --surface: ${P.surface};
    --surface2: ${P.surface2};
    --text: ${P.text};
    --muted: ${P.muted};
    --accent: ${P.accent};
    --accentS: ${P.accentS};
    --teal: ${P.teal};
    --violet: ${P.violet};
    --green: ${P.green};
    --border: ${P.border};
    --borderM: ${P.borderM};
  }

  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', system-ui, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
  }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px;
    height: 64px;
    background: rgba(13,13,15,0.88);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-size: 13px; font-weight: 700; letter-spacing: 4px;
    color: var(--accent); text-decoration: none;
  }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: var(--bg);
    padding: 8px 22px; border-radius: 100px; font-size: 13px; font-weight: 700;
    text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: .85; }

  /* ── Hero ── */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 120px 24px 80px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 50% 30%, rgba(200,169,110,0.07) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 20% 80%, rgba(107,143,140,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 80% 70%, rgba(155,123,174,0.05) 0%, transparent 60%);
  }
  /* Fine grid */
  .hero::after {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
  }
  .hero-inner { position: relative; z-index: 1; max-width: 700px; }
  .hero-eyebrow {
    display: inline-block;
    font-size: 11px; font-weight: 700; letter-spacing: 4px; color: var(--accent);
    border: 1px solid var(--borderM);
    padding: 6px 18px; border-radius: 100px;
    margin-bottom: 28px;
  }
  .hero h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(42px, 7vw, 72px); font-weight: 700; line-height: 1.12;
    color: var(--text); margin-bottom: 24px;
  }
  .hero h1 em { font-style: italic; color: var(--accent); }
  .hero-sub {
    font-size: 17px; color: var(--muted); max-width: 480px; margin: 0 auto 40px;
    line-height: 1.7;
  }
  .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-p {
    background: var(--accent); color: var(--bg);
    padding: 14px 32px; border-radius: 100px; font-size: 14px; font-weight: 700;
    text-decoration: none; transition: opacity .2s;
  }
  .btn-p:hover { opacity: .85; }
  .btn-w {
    border: 1px solid var(--borderM); color: var(--text);
    padding: 13px 32px; border-radius: 100px; font-size: 14px; font-weight: 500;
    text-decoration: none; transition: border-color .2s, color .2s; background: transparent;
  }
  .btn-w:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Divider label ── */
  .section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 3.5px; color: var(--accent);
    margin-bottom: 14px;
  }

  /* ── Features ── */
  .features {
    padding: 96px 24px; max-width: 1100px; margin: 0 auto;
  }
  .features-header { text-align: center; margin-bottom: 64px; }
  .features-header h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(30px, 4vw, 48px); font-weight: 700;
    color: var(--text); margin-bottom: 16px;
  }
  .features-header p { color: var(--muted); font-size: 16px; max-width: 440px; margin: 0 auto; }

  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px; padding: 32px;
    transition: border-color .3s, transform .3s;
  }
  .feature-card:hover { border-color: var(--borderM); transform: translateY(-3px); }
  .feat-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 20px;
  }
  .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; color: var(--text); }
  .feature-card p  { color: var(--muted); font-size: 14px; line-height: 1.65; }

  /* ── Stats ── */
  .stats-row {
    max-width: 900px; margin: 0 auto 96px; padding: 0 24px;
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    background: var(--border); border-radius: 20px; overflow: hidden;
    border: 1px solid var(--border);
  }
  .stat-item {
    background: var(--surface);
    padding: 40px 32px; text-align: center;
  }
  .stat-number {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 48px; font-weight: 700; color: var(--accent);
    line-height: 1; margin-bottom: 8px;
  }
  .stat-label { font-size: 13px; color: var(--muted); letter-spacing: 1.5px; font-weight: 600; }

  /* ── Screens ── */
  .screens-section {
    padding: 0 24px 96px; max-width: 1100px; margin: 0 auto; text-align: center;
  }
  .screens-header { margin-bottom: 48px; }
  .screens-header h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(28px, 4vw, 44px); font-weight: 700; color: var(--text); margin-bottom: 12px;
  }
  .screens-header p { color: var(--muted); font-size: 15px; }

  .screen-list {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px; margin-bottom: 48px;
  }
  .screen-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 24px 16px;
    transition: border-color .25s;
  }
  .screen-card:hover { border-color: var(--accent); }
  .screen-num {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    color: var(--accent); margin-bottom: 10px;
  }
  .screen-card h4 { font-size: 15px; font-weight: 700; margin-bottom: 6px; color: var(--text); }
  .screen-card p  { font-size: 12px; color: var(--muted); line-height: 1.5; }

  /* ── Concierge showcase ── */
  .concierge-section {
    max-width: 900px; margin: 0 auto 96px; padding: 0 24px;
  }
  .concierge-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 24px;
    padding: 48px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
  }
  .conc-left h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 36px; font-weight: 700; color: var(--text); margin-bottom: 16px; line-height: 1.2;
  }
  .conc-left h2 em { font-style: italic; color: var(--accent); }
  .conc-left p { color: var(--muted); font-size: 15px; line-height: 1.7; margin-bottom: 24px; }
  .conc-chat { display: flex; flex-direction: column; gap: 12px; }
  .chat-bubble {
    padding: 12px 16px; border-radius: 14px;
    font-size: 13px; line-height: 1.5; max-width: 85%;
  }
  .chat-sophie {
    background: var(--surface2); color: var(--text);
    border-bottom-left-radius: 4px; align-self: flex-start;
  }
  .chat-user {
    background: var(--accentS); color: var(--text);
    border: 1px solid var(--borderM);
    border-bottom-right-radius: 4px; align-self: flex-end;
  }
  .chat-name { font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; color: var(--accent); }

  /* ── Membership tiers ── */
  .tiers-section {
    padding: 0 24px 96px; max-width: 1000px; margin: 0 auto;
  }
  .tiers-header { text-align: center; margin-bottom: 48px; }
  .tiers-header h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(28px, 4vw, 44px); font-weight: 700; color: var(--text); margin-bottom: 12px;
  }
  .tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .tier-card {
    background: var(--surface); border-radius: 20px;
    padding: 32px 24px;
    border: 1px solid var(--border);
    text-align: center;
  }
  .tier-card.featured {
    border-color: var(--accent);
    background: linear-gradient(160deg, rgba(200,169,110,0.1) 0%, var(--surface) 50%);
  }
  .tier-badge {
    display: inline-block;
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    padding: 4px 14px; border-radius: 100px;
    margin-bottom: 20px;
  }
  .tier-card.featured .tier-badge { background: var(--accentS); color: var(--accent); }
  .tier-card:not(.featured) .tier-badge { background: rgba(240,237,230,0.06); color: var(--muted); }
  .tier-name { font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
  .tier-desc { font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
  .tier-perks { list-style: none; text-align: left; display: flex; flex-direction: column; gap: 10px; }
  .tier-perks li { font-size: 13px; color: var(--muted); display: flex; gap: 10px; align-items: flex-start; }
  .tier-perks li::before { content: '✦'; color: var(--accent); font-size: 10px; margin-top: 3px; flex-shrink: 0; }

  /* ── CTA ── */
  .cta-section {
    max-width: 700px; margin: 0 auto 96px; padding: 0 24px; text-align: center;
  }
  .cta-card {
    background: linear-gradient(135deg, rgba(200,169,110,0.14) 0%, rgba(107,143,140,0.08) 100%);
    border: 1px solid var(--borderM);
    border-radius: 28px; padding: 64px 48px;
  }
  .cta-card h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 36px; font-weight: 700; color: var(--text); margin-bottom: 16px; line-height: 1.2;
  }
  .cta-card p { color: var(--muted); font-size: 16px; margin-bottom: 32px; }
  .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px 24px; text-align: center;
    color: var(--muted); font-size: 13px;
  }
  footer a { color: var(--accent); text-decoration: none; }
  footer a:hover { text-decoration: underline; }

  @media (max-width: 700px) {
    .stats-row { grid-template-columns: 1fr; }
    .tiers-grid { grid-template-columns: 1fr; }
    .concierge-card { grid-template-columns: 1fr; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <a href="/" class="nav-logo">CONCLAVE</a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#tiers">Membership</a></li>
  </ul>
  <a href="/${SLUG}-mock" class="nav-cta">Try Mock →</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-eyebrow">PRIVATE MEMBERSHIP · OBSIDIAN TIER</div>
    <h1>Travel intelligence<br>for the <em>select few</em></h1>
    <p class="hero-sub">
      Your personal concierge, curated destinations, and privileged access — 
      all in a single obsidian-dark app built for members who expect more.
    </p>
    <div class="hero-actions">
      <a href="/${SLUG}-viewer" class="btn-p">View Prototype →</a>
      <a href="/${SLUG}-mock" class="btn-w">Interactive Mock ☀◑</a>
    </div>
  </div>
</section>

<!-- Stats -->
<div class="stats-row">
  <div class="stat-item">
    <div class="stat-number">1,200+</div>
    <div class="stat-label">AIRPORT LOUNGES</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">340</div>
    <div class="stat-label">CURATED PROPERTIES</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">24/7</div>
    <div class="stat-label">PERSONAL CONCIERGE</div>
  </div>
</div>

<!-- Features -->
<section class="features" id="features">
  <div class="features-header">
    <div class="section-label">CORE FEATURES</div>
    <h2>Every detail, handled</h2>
    <p>Conclave manages the extraordinary so you focus on experiencing it.</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(200,169,110,0.1)">✈</div>
      <h3>Curated Destinations</h3>
      <p>Hand-picked villas, ryokans, and estates. Editorial cards surface the world's finest stays before they fill.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(107,143,140,0.1)">✉</div>
      <h3>Personal Concierge</h3>
      <p>Sophie and the team are online now. Restaurant reservations, event tickets, ground transport — one message away.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(155,123,174,0.1)">◷</div>
      <h3>Trip Intelligence</h3>
      <p>Visual timeline of every confirmed and pending element. Progress tracking from first inquiry to final night.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(76,175,125,0.1)">◉</div>
      <h3>Member Benefits</h3>
      <p>Airport suites, hotel elite status, private event access, and ground priority — all activated at the door.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(196,107,90,0.1)">⛵</div>
      <h3>Yacht & Private Charters</h3>
      <p>On-demand yacht access across the Mediterranean, Caribbean, and Pacific. Request from home screen in seconds.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(200,169,110,0.08)">🎟</div>
      <h3>Exclusive Experiences</h3>
      <p>Front-row F1 paddock, private opera in Vienna, backstage passes — the kind of access that isn't publicly available.</p>
    </div>
  </div>
</section>

<!-- Screens preview -->
<section class="screens-section" id="screens">
  <div class="screens-header">
    <div class="section-label">5 SCREENS</div>
    <h2>The full member experience</h2>
    <p>From morning curation to concierge chat — everything in one obsidian canvas.</p>
  </div>
  <div class="screen-list">
    <div class="screen-card">
      <div class="screen-num">01</div>
      <h4>Home</h4>
      <p>Curated destination hero, quick service access, active trip countdown, latest concierge message.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">02</div>
      <h4>Discover</h4>
      <p>Editorial destination cards with filter chips, two-column grid, and trending experience list.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">03</div>
      <h4>Trip Planner</h4>
      <p>Visual timeline with confirmation states, vertical connector lines, and real-time item tracking.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">04</div>
      <h4>Concierge</h4>
      <p>Live chat with Sophie, quick-request chips, and a messenger-style input with instant send.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">05</div>
      <h4>Profile</h4>
      <p>Member card with gold ring avatar, stat grid, benefits list, and membership management CTA.</p>
    </div>
  </div>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="/${SLUG}-viewer" class="btn-p">Open Prototype</a>
    <a href="/${SLUG}-mock" class="btn-w">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- Concierge showcase -->
<section class="concierge-section">
  <div class="concierge-card">
    <div class="conc-left">
      <div class="section-label">PERSONAL CONCIERGE</div>
      <h2>One message.<br><em>Done.</em></h2>
      <p>
        Sophie, your dedicated concierge, handles Sukiyabashi Jiro reservations, 
        Blade helicopter transfers, and sold-out concert passes — 
        all before you've finished your morning coffee.
      </p>
      <a href="/${SLUG}-mock" class="btn-p" style="display:inline-block">See it in action →</a>
    </div>
    <div class="conc-right">
      <div class="conc-chat">
        <div class="chat-bubble chat-sophie">
          <div class="chat-name">SOPHIE</div>
          Good evening, James. Your Narita arrival transfer is confirmed. Driver: Kenji +81 90-1234-5678.
        </div>
        <div class="chat-bubble chat-user">
          Can you book dinner at Sukiyabashi Jiro for Nov 5th?
        </div>
        <div class="chat-bubble chat-sophie">
          <div class="chat-name">SOPHIE</div>
          Confirmed! Nov 5th, 7:30pm · 2 omakase seats · ¥66,000 pp
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Tiers -->
<section class="tiers-section" id="tiers">
  <div class="tiers-header">
    <div class="section-label">MEMBERSHIP</div>
    <h2>Choose your tier</h2>
    <p style="color:var(--muted);font-size:15px">Each tier unlocks a deeper layer of Conclave's world.</p>
  </div>
  <div class="tiers-grid">
    <div class="tier-card">
      <div class="tier-badge">ONYX</div>
      <div class="tier-name">Onyx</div>
      <div class="tier-desc">The essential Conclave experience for discerning travellers.</div>
      <ul class="tier-perks">
        <li>Personal concierge (business hours)</li>
        <li>400+ partner hotels</li>
        <li>Airport lounge access</li>
        <li>Restaurant priority booking</li>
      </ul>
    </div>
    <div class="tier-card featured">
      <div class="tier-badge">✦ OBSIDIAN</div>
      <div class="tier-name">Obsidian</div>
      <div class="tier-desc">The complete Conclave experience. Most popular among frequent travellers.</div>
      <ul class="tier-perks">
        <li>24/7 dedicated concierge</li>
        <li>1,200+ airport suites globally</li>
        <li>Hotel elite status (250+ properties)</li>
        <li>Exclusive events & experiences</li>
        <li>Ground priority · Yacht access</li>
      </ul>
    </div>
    <div class="tier-card">
      <div class="tier-badge">CIPHER</div>
      <div class="tier-name">Cipher</div>
      <div class="tier-desc">By invitation only. For the world's most demanding members.</div>
      <ul class="tier-perks">
        <li>All Obsidian benefits</li>
        <li>Private jet coordination</li>
        <li>Dedicated estate manager</li>
        <li>Ultra-private property access</li>
        <li>Bespoke security & logistics</li>
      </ul>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta-section">
  <div class="cta-card">
    <h2>Built for those who<br><em>never compromise</em></h2>
    <p>Prototype ready. Mock interactive. Request your invitation.</p>
    <div class="cta-btns">
      <a href="/${SLUG}-viewer" class="btn-p">View Prototype →</a>
      <a href="/${SLUG}-mock" class="btn-w">Try interactive mock ☀◑</a>
    </div>
  </div>
</div>

<footer>
  <p>Conclave — <em>${TAGLINE}</em></p>
  <p style="margin-top:8px">
    Design by <a href="https://ram.zenbin.org">RAM</a> ·
    <a href="/${SLUG}-viewer">Prototype</a> ·
    <a href="/${SLUG}-mock">Interactive Mock ☀◑</a>
  </p>
</footer>
</body>
</html>`;

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'conclave.pen'), 'utf8'));
  console.log(`\n── CONCLAVE publish pipeline ──\n`);

  // Hero
  console.log(`Publishing hero → ram.zenbin.org/${SLUG} …`);
  const heroRes = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML);
  console.log(`  ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  // Viewer
  console.log(`Publishing viewer → ram.zenbin.org/${SLUG}-viewer …`);
  const viewerHTML = await buildViewerHTML(penJson);
  const viewerRes  = await publishToZenbin(`${SLUG}-viewer`, `${APP_NAME} — Prototype Viewer`, viewerHTML);
  console.log(`  ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  // Gallery queue
  console.log(`Updating GitHub gallery queue …`);
  try {
    const qRes = await updateGalleryQueue(
      `https://ram.zenbin.org/${SLUG}`,
      `https://ram.zenbin.org/${SLUG}-mock`
    );
    console.log(`  queue: ${qRes}`);
  } catch(e) {
    console.log(`  queue error: ${e.message}`);
  }

  console.log(`\n✓ Done`);
})();
