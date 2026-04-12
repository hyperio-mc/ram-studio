// ember-publish.js — EMBER Podcast AI: Hero page + Prototype Viewer publisher
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'ember';
const APP_NAME  = 'Ember';
const TAGLINE   = 'Your podcast, deeply understood';
const ARCHETYPE = 'audio-intelligence';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = `Design EMBER — a private intelligence network for world-shaping founders and operators.
Inspired by:
1. darkmodedesign.com "Maker" — deep void black, cosmic/planetary imagery, all-caps bold type, "WE CONNECT PEOPLE SHAPING THE WORLD", private founder community backed by Founders Fund/Sequoia/Combinator/Thiel
2. godly.website "Atlas Card" — cinematic luxury, exclusive access, cool steel blue, floating phone UI, premium concierge membership
3. minimal.gallery "UNLEARNED" — ultra-high-contrast bold display typography as visual anchor

Theme: DARK — near-void black (#080807), hammered copper/amber accent (#C8783A), deep violet secondary (#7B5EA7)
5 screens: Network (orbital pulse ring) · Intelligence Feed (signal cards with left-stripe) · Rooms · Compose Signal · Operator Profile (trust score arc)`;

// ── HTTP helpers ─────────────────────────────────────────────
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

// ── Dark palette (CSS vars) ──────────────────────────────────
const P = {
  bg:       '#080807',
  bg2:      '#0F0F0D',
  surface:  '#161614',
  surface2: '#1E1D1A',
  text:     '#EDE9E0',
  muted:    'rgba(237,233,224,0.46)',
  dim:      'rgba(237,233,224,0.20)',
  accent:   '#C8783A',
  accentBr: '#E8955A',
  accentS:  'rgba(200,120,58,0.12)',
  accent2:  '#7B5EA7',
  accent2S: 'rgba(123,94,167,0.12)',
  green:    '#3A9E72',
  greenS:   'rgba(58,158,114,0.12)',
  teal:     '#2A8E9E',
  border:   'rgba(255,185,80,0.12)',
  border2:  'rgba(255,185,80,0.22)',
  borderSub:'rgba(237,233,224,0.08)',
};

// ── Hero HTML ────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       ${P.bg};
    --bg2:      ${P.bg2};
    --surface:  ${P.surface};
    --surface2: ${P.surface2};
    --text:     ${P.text};
    --muted:    ${P.muted};
    --dim:      ${P.dim};
    --accent:   ${P.accent};
    --accent-br:${P.accentBr};
    --accent-s: ${P.accentS};
    --accent2:  ${P.accent2};
    --accent2-s:${P.accent2S};
    --green:    ${P.green};
    --teal:     ${P.teal};
    --border:   ${P.border};
    --border2:  ${P.border2};
    --border-sub:${P.borderSub};
  }

  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
  }

  .mono { font-family: 'Space Mono', monospace; }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: rgba(8,8,7,0.88);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px; font-weight: 700; letter-spacing: 5px;
    color: var(--accent-br); text-decoration: none;
  }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 8px 20px; border-radius: 100px; font-size: 13px; font-weight: 700;
    text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: .85; }

  /* ── Hero ── */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 100px 24px 72px;
    position: relative; overflow: hidden;
  }
  /* Orbital glow orb */
  .hero::before {
    content: '';
    position: absolute;
    width: 700px; height: 700px;
    top: 50%; left: 50%;
    transform: translate(-50%, -55%);
    background: radial-gradient(ellipse, rgba(200,120,58,0.12) 0%, rgba(200,120,58,0.04) 40%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  /* Orbital rings */
  .hero::after {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    top: 50%; left: 50%;
    transform: translate(-50%, -52%);
    border: 1px solid rgba(200,120,58,0.14);
    border-radius: 50%;
    pointer-events: none;
  }
  .hero-ring-2 {
    position: absolute;
    width: 480px; height: 480px;
    top: 50%; left: 50%;
    transform: translate(-50%, -54%);
    border: 1px solid rgba(200,120,58,0.09);
    border-radius: 50%;
  }
  .hero-inner { position: relative; z-index: 1; max-width: 700px; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 3px;
    color: var(--accent-br);
    border: 1px solid var(--border2);
    padding: 5px 16px; border-radius: 100px;
    margin-bottom: 32px;
    background: var(--accent-s);
  }
  .hero-eyebrow::before { content: '◉'; font-size: 8px; color: var(--green); margin-right: 4px; }
  .hero h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(48px, 7.5vw, 80px); font-weight: 700; line-height: 1.05;
    color: var(--text); margin-bottom: 8px; letter-spacing: -1px;
  }
  .hero h1 em {
    font-style: normal;
    background: linear-gradient(135deg, var(--accent-br) 0%, var(--accent) 60%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    font-size: 17px; color: var(--muted); max-width: 500px; margin: 20px auto 40px; line-height: 1.75;
  }
  .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-p {
    background: var(--accent); color: #fff;
    padding: 13px 30px; border-radius: 100px; font-size: 14px; font-weight: 700;
    text-decoration: none; transition: opacity .2s, box-shadow .2s;
    box-shadow: 0 0 32px rgba(200,120,58,0.25);
  }
  .btn-p:hover { opacity: .9; box-shadow: 0 0 48px rgba(200,120,58,0.4); }
  .btn-w {
    border: 1px solid var(--border2); color: var(--text); background: var(--surface);
    padding: 12px 30px; border-radius: 100px; font-size: 14px; font-weight: 500;
    text-decoration: none; transition: border-color .2s, color .2s;
  }
  .btn-w:hover { border-color: var(--accent-br); color: var(--accent-br); }

  /* ── Stats band ── */
  .stats-band {
    max-width: 860px; margin: 0 auto 80px; padding: 0 24px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px; background: var(--border);
    border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
  }
  .stat-cell {
    background: var(--surface); padding: 28px 24px;
    text-align: center;
  }
  .stat-num {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 32px; font-weight: 700; color: var(--text);
    display: block; line-height: 1;
  }
  .stat-num.amber { color: var(--accent-br); }
  .stat-num.violet { color: #9E7EC8; }
  .stat-num.green { color: var(--green); }
  .stat-label { font-size: 11px; color: var(--muted); margin-top: 6px; letter-spacing: 0.5px; }

  /* ── Feature section ── */
  .section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
  .section-eyebrow {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 3px; color: var(--accent-br);
    margin-bottom: 16px; text-transform: uppercase;
  }
  .section h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(28px, 4vw, 44px); font-weight: 700; line-height: 1.15;
    color: var(--text); margin-bottom: 16px;
  }
  .section-sub { font-size: 16px; color: var(--muted); max-width: 520px; line-height: 1.7; margin-bottom: 56px; }

  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border-sub);
    border-radius: 16px; padding: 32px 28px;
    transition: border-color .2s, box-shadow .2s;
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: ''; position: absolute; left: 0; top: 20px; bottom: 20px;
    width: 3px; border-radius: 2px;
  }
  .feature-card.copper::before { background: var(--accent); }
  .feature-card.violet::before { background: var(--accent2); }
  .feature-card.green::before  { background: var(--green); }
  .feature-card.teal::before   { background: var(--teal); }
  .feature-card.red::before    { background: #C04040; }
  .feature-card.amber::before  { background: var(--accent-br); }
  .feature-card:hover { border-color: var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
  .feature-icon {
    font-size: 20px; margin-bottom: 16px; display: block;
  }
  .feature-title { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

  /* ── Signal showcase ── */
  .signal-section {
    padding: 80px 24px; background: var(--surface);
    border-top: 1px solid var(--border-sub);
    border-bottom: 1px solid var(--border-sub);
  }
  .signal-inner { max-width: 820px; margin: 0 auto; }
  .signal-card {
    border: 1px solid var(--border-sub); border-radius: 14px;
    padding: 24px 28px; margin-bottom: 16px;
    position: relative; overflow: hidden;
    background: var(--bg);
  }
  .signal-card::before {
    content: ''; position: absolute; left: 0; top: 12px; bottom: 12px;
    width: 3px; border-radius: 2px;
  }
  .signal-card.c1::before { background: var(--accent); }
  .signal-card.c2::before { background: var(--accent2); }
  .signal-card.c3::before { background: var(--green); }
  .signal-type {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 9px; font-weight: 800; letter-spacing: 1.5px;
    margin-bottom: 10px; display: block;
  }
  .signal-card.c1 .signal-type { color: var(--accent-br); }
  .signal-card.c2 .signal-type { color: #9E7EC8; }
  .signal-card.c3 .signal-type { color: var(--green); }
  .signal-quote {
    font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.55;
    margin-bottom: 12px;
  }
  .signal-meta { font-size: 12px; color: var(--muted); }
  .signal-reactions { float: right; font-size: 12px; color: var(--accent-br); font-weight: 600; }

  /* ── Trust section ── */
  .trust-section { padding: 80px 24px; max-width: 900px; margin: 0 auto; text-align: center; }
  .trust-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
  .trust-card {
    background: var(--surface); border: 1px solid var(--border-sub);
    border-radius: 14px; padding: 28px 24px;
  }
  .trust-score {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 42px; font-weight: 700; line-height: 1;
    color: var(--accent-br); margin-bottom: 8px;
  }
  .trust-tier {
    font-size: 10px; font-weight: 800; letter-spacing: 2px;
    color: var(--accent); margin-bottom: 12px;
    display: block; text-transform: uppercase;
  }
  .trust-name { font-size: 14px; font-weight: 600; color: var(--text); }
  .trust-role { font-size: 12px; color: var(--muted); margin-top: 4px; }

  /* ── Apply section ── */
  .apply-section {
    padding: 100px 24px;
    text-align: center;
    position: relative; overflow: hidden;
  }
  .apply-section::before {
    content: '';
    position: absolute;
    width: 800px; height: 400px;
    top: 0; left: 50%;
    transform: translateX(-50%);
    background: radial-gradient(ellipse, rgba(200,120,58,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .apply-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
  .apply-section h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(36px, 5vw, 56px); font-weight: 700; line-height: 1.1;
    color: var(--text); margin-bottom: 20px;
  }
  .apply-section h2 em {
    font-style: normal;
    background: linear-gradient(135deg, var(--accent-br) 0%, var(--accent) 60%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .apply-sub { font-size: 16px; color: var(--muted); margin-bottom: 40px; line-height: 1.7; }
  .apply-criteria {
    list-style: none; text-align: left; max-width: 400px; margin: 0 auto 40px;
  }
  .apply-criteria li {
    display: flex; align-items: center; gap: 12px;
    font-size: 14px; color: var(--muted); padding: 10px 0;
    border-bottom: 1px solid var(--border-sub);
  }
  .apply-criteria li::before {
    content: '✦'; color: var(--accent); font-size: 10px; flex-shrink: 0;
  }

  /* ── Footer ── */
  footer {
    padding: 40px 40px;
    border-top: 1px solid var(--border-sub);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: var(--dim);
  }
  .footer-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 4px; color: var(--accent);
  }

  @media (max-width: 768px) {
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    .hero h1 { font-size: 40px; }
    .stats-band, .feature-grid, .trust-grid { grid-template-columns: 1fr 1fr; }
    footer { flex-direction: column; gap: 12px; text-align: center; }
  }
  @media (max-width: 480px) {
    .stats-band, .feature-grid, .trust-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">EMBER</a>
  <ul class="nav-links">
    <li><a href="#network">Network</a></li>
    <li><a href="#intelligence">Intelligence</a></li>
    <li><a href="#rooms">Rooms</a></li>
    <li><a href="/ember-viewer" target="_blank">View Prototype →</a></li>
  </ul>
  <a class="nav-cta" href="#apply">Apply for Access</a>
</nav>

<section class="hero">
  <div class="hero-ring-2"></div>
  <div class="hero-inner">
    <span class="hero-eyebrow">34 OPERATORS LIVE NOW</span>
    <h1>Intelligence for<br><em>world-shaping</em><br>operators</h1>
    <p class="hero-sub">
      A private network for the founders and operators who move markets.
      Real signals. Verified peers. No noise.
    </p>
    <div class="hero-actions">
      <a class="btn-p" href="#apply">Apply for Access</a>
      <a class="btn-w" href="/ember-viewer" target="_blank">View Prototype</a>
    </div>
  </div>
</section>

<div class="stats-band">
  <div class="stat-cell">
    <span class="stat-num amber">247</span>
    <p class="stat-label">Vetted Operators</p>
  </div>
  <div class="stat-cell">
    <span class="stat-num">$4.2B</span>
    <p class="stat-label">Combined Portfolio</p>
  </div>
  <div class="stat-cell">
    <span class="stat-num green">3,840</span>
    <p class="stat-label">Signals Shared</p>
  </div>
  <div class="stat-cell">
    <span class="stat-num violet">18</span>
    <p class="stat-label">Active Rooms</p>
  </div>
</div>

<section class="section" id="network">
  <p class="section-eyebrow">The Network</p>
  <h2>Not a community. An operating system for operators.</h2>
  <p class="section-sub">
    Ember is a private intelligence layer for founders, GPs, and operators who shape markets.
    Every member is vouched, every signal is verified, every room has a purpose.
  </p>
  <div class="feature-grid">
    <div class="feature-card copper">
      <span class="feature-icon">◎</span>
      <div class="feature-title">Orbital Network</div>
      <p class="feature-desc">See who's active and how you're connected. Real-time pulse shows live operators in your orbit and their current focus areas.</p>
    </div>
    <div class="feature-card violet">
      <span class="feature-icon">◈</span>
      <div class="feature-title">Intelligence Feed</div>
      <p class="feature-desc">Curated signals from verified operators: deal flow, market moves, ops intel, risk signals. Categorized, sourced, and actionable.</p>
    </div>
    <div class="feature-card green">
      <span class="feature-icon">▣</span>
      <div class="feature-title">Private Rooms</div>
      <p class="feature-desc">Sector-specific rooms for deep discussion. AI Infra, Defense Tech, Climate, Deep Tech M&A — vetted entry, high signal density.</p>
    </div>
    <div class="feature-card teal">
      <span class="feature-icon">⊕</span>
      <div class="feature-title">Broadcast Signal</div>
      <p class="feature-desc">Post your own intelligence to the network. Deal flow, market observations, resource sharing, or open opportunities. Reach the right people fast.</p>
    </div>
    <div class="feature-card amber">
      <span class="feature-icon">◉</span>
      <div class="feature-title">Operator Card</div>
      <p class="feature-desc">Your verified identity in the network. Trust score built from signal quality, peer vouches, room activity, and verified deals.</p>
    </div>
    <div class="feature-card red">
      <span class="feature-icon">▲</span>
      <div class="feature-title">Risk Signals</div>
      <p class="feature-desc">Early warnings from operators watching the edges. Model risks, regulatory shifts, competitive moves — surfaced before the market knows.</p>
    </div>
  </div>
</section>

<section class="signal-section" id="intelligence">
  <div class="signal-inner">
    <p class="section-eyebrow" style="text-align:center; margin-bottom: 8px;">Intelligence in action</p>
    <h2 style="font-family: 'Space Grotesk'; font-size: clamp(26px,4vw,38px); font-weight:700; text-align:center; margin-bottom: 40px; color: var(--text)">The signals that move your decisions</h2>

    <div class="signal-card c1">
      <span class="signal-type">⚡ DEAL FLOW</span>
      <p class="signal-quote">"Term sheets moving fast in defense tech — a16z + Founders Fund both writing checks in the same round. First time in 3 years."</p>
      <span class="signal-reactions">◈ 89  ◷ 14</span>
      <span class="signal-meta">Marcus K. · GP @ Meridian Capital · 2h ago</span>
    </div>

    <div class="signal-card c2">
      <span class="signal-type">◈ MARKET MOVE</span>
      <p class="signal-quote">"GPU spot pricing dropped 23% in 90 days. Anyone not re-pricing compute in their models is leaving real money on the table right now."</p>
      <span class="signal-reactions">◈ 211  ◷ 38</span>
      <span class="signal-meta">Anya N. · Founder @ Axon AI · 4h ago</span>
    </div>

    <div class="signal-card c3">
      <span class="signal-type">◉ OPPORTUNITY</span>
      <p class="signal-quote">"Sequoia growth is actively looking for Series B fintech with LATAM traction. DM me if you qualify — I have the direct partner contact."</p>
      <span class="signal-reactions">◈ 44  ◷ 9</span>
      <span class="signal-meta">Thomas C. · Co-founder @ Vesper · 10h ago</span>
    </div>
  </div>
</section>

<section class="trust-section" id="apply">
  <p class="section-eyebrow">Trust Score</p>
  <h2 style="font-family: 'Space Grotesk'; font-size: clamp(28px,4vw,42px); font-weight:700; color:var(--text);">Your reputation, quantified</h2>
  <p class="section-sub" style="margin: 16px auto 0; max-width:480px;">Every operator has a Trust Score built from signal quality, peer vouches, room activity, verified deals, and network growth.</p>
  <div class="trust-grid">
    <div class="trust-card">
      <div class="trust-score">87</div>
      <span class="trust-tier">✦ Elite · Tier 1</span>
      <div class="trust-name">Anya Nikolaev</div>
      <div class="trust-role">Founder, Axon AI · Series B</div>
    </div>
    <div class="trust-card">
      <div class="trust-score" style="color:#9E7EC8;">79</div>
      <span class="trust-tier" style="color:var(--accent2)">◈ Verified · Tier 2</span>
      <div class="trust-name">Marcus Kim</div>
      <div class="trust-role">GP, Meridian Capital · Partner</div>
    </div>
    <div class="trust-card">
      <div class="trust-score" style="color:var(--green);">91</div>
      <span class="trust-tier" style="color:var(--green)">◉ Apex · Tier 1</span>
      <div class="trust-name">Sana Rahman</div>
      <div class="trust-role">Co-founder, Locus · Seed</div>
    </div>
  </div>
</section>

<section class="apply-section">
  <div class="apply-inner">
    <h2>Built for operators<br><em>shaping the world</em></h2>
    <p class="apply-sub">Ember is invite-only. Every member is vouched by an existing Tier 1 operator. We review applications quarterly.</p>
    <ul class="apply-criteria">
      <li>Founded or co-founded a venture-backed company</li>
      <li>GP, partner, or principal at a recognized fund</li>
      <li>Operator at Series B+ with significant equity</li>
      <li>Vouched by an existing Ember member</li>
    </ul>
    <a class="btn-p" href="#apply" style="display:inline-block">Request an Invitation</a>
  </div>
</section>

<footer>
  <span class="footer-logo">EMBER</span>
  <span>Prototype by RAM Design Heartbeat · 2026</span>
  <a href="/ember-viewer" style="color: var(--accent-br); font-weight:600; text-decoration:none;">View Prototype →</a>
</footer>

</body>
</html>`;

// ── Main ─────────────────────────────────────────────────────
(async () => {
  console.log('── EMBER Design Discovery Pipeline ──\n');
  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'ember.pen'), 'utf8'));

  // a) Hero page
  console.log('a) Publishing hero page...');
  const heroRes = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML);
  console.log(`   Status: ${heroRes.status}`);
  const heroUrl = `https://ram.zenbin.org/${SLUG}`;
  console.log(`   URL: ${heroUrl}`);

  // b) Viewer
  console.log('b) Publishing viewer...');
  const viewerHtml = await buildViewerHTML(penJson);
  const viewerRes  = await publishToZenbin(`${SLUG}-viewer`, `${APP_NAME} — Prototype Viewer`, viewerHtml);
  console.log(`   Status: ${viewerRes.status}`);
  console.log(`   URL: https://ram.zenbin.org/${SLUG}-viewer`);

  // c) Gallery queue
  console.log('c) Updating gallery queue...');
  const mockUrl = `https://ram.zenbin.org/${SLUG}-mock`;
  const queueStatus = await updateGalleryQueue(heroUrl, mockUrl);
  console.log(`   Queue: ${queueStatus}`);

  // d) Design DB
  console.log('d) Indexing in design DB...');
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, {
      id: `heartbeat-${SLUG}-${Date.now()}`,
      app_name: APP_NAME, tagline: TAGLINE, archetype: ARCHETYPE,
      design_url: heroUrl, mock_url: mockUrl,
      published_at: new Date().toISOString(), source: 'heartbeat', screens: 5,
    });
    rebuildEmbeddings(db);
    console.log('   Indexed ✓');
  } catch (e) { console.log('   DB skip:', e.message.slice(0, 60)); }

  console.log('\n✓ Pipeline complete');
  console.log(`  Hero:   ${heroUrl}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   ${mockUrl}`);
})();
