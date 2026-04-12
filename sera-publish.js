'use strict';
// sera-publish.js — hero page + viewer for SÉRA

const fs   = require('fs');
const path = require('path');

const SLUG = 'sera-app';
const PEN_FILE = path.join(__dirname, 'sera.pen');

// ── Zenbin publish helper ─────────────────────────────────────────────────────
const https = require('https');
function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const options = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, ...JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, raw: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Palette (matches sera-app.js) ─────────────────────────────────────────────
const P = {
  bg:        '#F6F2EB',
  surface:   '#FFFFFF',
  surface2:  '#EDE9E0',
  border:    '#D4CBB8',
  text:      '#1C1814',
  textMid:   '#5A5145',
  textMuted: '#9A8E7E',
  gold:      '#B8955A',
  gold2:     '#8C6A30',
  green:     '#4A7A5C',
};

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SÉRA — Luxury Longevity Concierge</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg};
    --surface: ${P.surface};
    --surface2: ${P.surface2};
    --border: ${P.border};
    --text: ${P.text};
    --text-mid: ${P.textMid};
    --text-muted: ${P.textMuted};
    --gold: ${P.gold};
    --gold2: ${P.gold2};
    --green: ${P.green};
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }
  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.25em;
    color: var(--text); text-decoration: none;
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px; font-weight: 600; letter-spacing: 0.15em;
    color: var(--text-muted); text-decoration: none; text-transform: uppercase;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--gold); }
  .nav-cta {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;
    padding: 10px 22px;
    background: var(--text); color: var(--bg);
    border: none; cursor: pointer; text-decoration: none;
    transition: background 0.2s;
  }
  .nav-cta:hover { background: var(--gold2); }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 120px 40px 80px;
    position: relative; overflow: hidden;
  }
  .hero-inner { max-width: 900px; width: 100%; }
  .hero-eyebrow {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.3em;
    color: var(--gold); text-transform: uppercase; margin-bottom: 24px;
  }
  .hero-title {
    font-size: clamp(52px, 8vw, 96px);
    font-weight: 400; line-height: 1.0;
    color: var(--text);
    margin-bottom: 32px;
  }
  .hero-title em { font-style: italic; color: var(--gold); }
  .hero-sub {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px; font-weight: 400; color: var(--text-mid);
    max-width: 520px; line-height: 1.7; margin-bottom: 48px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
    padding: 16px 36px; background: var(--text); color: var(--bg);
    border: none; cursor: pointer; text-decoration: none;
    transition: background 0.2s, transform 0.2s;
  }
  .btn-primary:hover { background: var(--gold2); transform: translateY(-1px); }
  .btn-secondary {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--text-muted); text-decoration: none;
    border-bottom: 1px solid var(--border); padding-bottom: 2px;
    transition: color 0.2s;
  }
  .btn-secondary:hover { color: var(--gold); border-color: var(--gold); }

  /* SCORE BADGE */
  .hero-score {
    position: absolute; right: 60px; top: 50%;
    transform: translateY(-50%);
    text-align: center;
  }
  .score-ring {
    width: 160px; height: 160px;
    border-radius: 50%;
    border: 12px solid var(--surface2);
    display: flex; align-items: center; justify-content: center;
    position: relative;
    background: var(--surface);
  }
  .score-ring::before {
    content: '';
    position: absolute; inset: -12px;
    border-radius: 50%;
    border: 12px solid transparent;
    border-top-color: var(--gold);
    border-right-color: var(--gold);
    border-bottom-color: var(--gold);
    transform: rotate(-50deg);
  }
  .score-num {
    font-size: 48px; font-weight: 700; color: var(--text);
    line-height: 1;
  }
  .score-label {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 0.2em;
    color: var(--text-muted); margin-top: 4px;
  }
  .score-caption {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px; color: var(--text-muted); margin-top: 12px;
  }

  /* DIVIDER */
  .section-divider {
    display: flex; align-items: center; gap: 16px;
    padding: 0 40px; margin-bottom: 60px;
  }
  .section-divider span {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 0.3em;
    color: var(--gold); text-transform: uppercase; white-space: nowrap;
  }
  .section-divider hr { flex: 1; border: none; border-top: 1px solid var(--border); }

  /* FEATURES — Atlas-style editorial sections */
  .feature-section {
    padding: 100px 40px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
    align-items: center; max-width: 1100px; margin: 0 auto;
  }
  .feature-section.reverse { direction: rtl; }
  .feature-section.reverse > * { direction: ltr; }
  .feature-eyebrow {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 0.3em;
    color: var(--gold); text-transform: uppercase; margin-bottom: 12px;
  }
  .feature-hook {
    font-size: clamp(32px, 4vw, 52px); font-weight: 400; line-height: 1.05;
    color: var(--text); margin-bottom: 20px;
  }
  .feature-hook em { font-style: italic; color: var(--gold); }
  .feature-body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 15px; color: var(--text-mid); line-height: 1.75;
    margin-bottom: 28px;
  }
  .feature-link {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--text); text-decoration: none;
    border-bottom: 1px solid var(--text); padding-bottom: 2px;
    transition: color 0.2s, border-color 0.2s;
  }
  .feature-link:hover { color: var(--gold); border-color: var(--gold); }

  /* MOCK CARD */
  .feature-visual {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    min-height: 320px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .visual-label {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 0.3em; color: var(--gold);
    text-transform: uppercase; margin-bottom: 20px;
  }
  .visual-metric { font-size: 48px; font-weight: 700; color: var(--text); line-height: 1; }
  .visual-sub {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px; color: var(--text-muted); margin-top: 6px;
  }
  .visual-bar-wrap { margin-top: 28px; }
  .visual-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .visual-bar-label {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px; color: var(--text-muted); width: 80px;
  }
  .visual-bar-track { flex: 1; height: 4px; background: var(--surface2); border-radius: 2px; overflow: hidden; }
  .visual-bar-fill { height: 100%; border-radius: 2px; background: var(--gold); }
  .visual-pct {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px; font-weight: 600; color: var(--text); width: 36px; text-align: right;
  }

  /* PHONE MOCKUP */
  .phone-wrap {
    display: flex; justify-content: center; align-items: center;
    padding: 20px 0;
  }
  .phone-frame {
    width: 240px; background: var(--text); border-radius: 40px;
    padding: 16px 12px; box-shadow: 0 40px 80px rgba(28,24,20,0.18);
  }
  .phone-screen {
    background: var(--bg); border-radius: 28px; overflow: hidden;
    height: 380px; display: flex; flex-direction: column;
  }
  .phone-nav-bar {
    height: 32px; background: var(--bg);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px;
    font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 8px; font-weight: 700;
    color: var(--text);
  }
  .phone-content { flex: 1; padding: 10px 12px; }
  .phone-card {
    background: var(--surface); border-radius: 12px;
    padding: 14px; margin-bottom: 8px;
    border: 1px solid var(--border);
  }
  .phone-card-label {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 7px; font-weight: 700; letter-spacing: 0.2em; color: var(--gold);
    text-transform: uppercase; margin-bottom: 4px;
  }
  .phone-card-val { font-size: 22px; font-weight: 700; color: var(--text); line-height: 1; }
  .phone-card-sub {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 8px; color: var(--green); margin-top: 2px;
  }
  .phone-bottom {
    height: 48px; background: var(--surface);
    border-top: 1px solid var(--border);
    display: flex; justify-content: space-around; align-items: center;
    padding: 0 8px;
  }
  .phone-nav-dot { width: 4px; height: 4px; background: var(--gold); border-radius: 50%; }
  .phone-nav-dot-off { width: 4px; height: 4px; background: var(--border); border-radius: 50%; }

  /* MEMBERSHIP SECTION */
  .membership-section {
    padding: 100px 40px;
    background: var(--text);
    text-align: center;
  }
  .membership-eyebrow {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 0.3em; color: var(--gold);
    text-transform: uppercase; margin-bottom: 24px;
  }
  .membership-title {
    font-size: clamp(36px, 5vw, 64px); font-weight: 400; color: #F6F2EB;
    margin-bottom: 20px; line-height: 1.1;
  }
  .membership-title em { font-style: italic; color: var(--gold); }
  .membership-sub {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 15px; color: #9A8E7E; max-width: 480px; margin: 0 auto 48px;
  }
  .tiers { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .tier-card {
    background: #2A2620; border: 1px solid #3A3228;
    border-radius: 16px; padding: 32px 28px; width: 240px;
    text-align: left;
  }
  .tier-card.featured {
    background: #1C1814; border-color: var(--gold);
    position: relative;
  }
  .tier-badge {
    position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
    background: var(--gold); color: var(--text);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 8px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
    padding: 4px 14px; border-radius: 10px;
  }
  .tier-name {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.3em; color: var(--gold);
    text-transform: uppercase; margin-bottom: 12px;
  }
  .tier-price { font-size: 36px; font-weight: 700; color: #F6F2EB; }
  .tier-period {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px; color: #9A8E7E; margin-bottom: 20px;
  }
  .tier-divider { border: none; border-top: 1px solid #3A3228; margin-bottom: 16px; }
  .tier-feature {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px; color: #9A8E7E; margin-bottom: 8px;
    display: flex; gap: 8px; align-items: flex-start;
  }
  .tier-feature .check { color: var(--gold); }

  /* STATS STRIP */
  .stats-strip {
    padding: 60px 40px;
    display: flex; justify-content: center; gap: 80px;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .stat-item { text-align: center; }
  .stat-val { font-size: 48px; font-weight: 700; color: var(--text); line-height: 1; }
  .stat-label {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.2em; color: var(--text-muted);
    text-transform: uppercase; margin-top: 8px;
  }

  /* FOOTER */
  footer {
    padding: 40px; display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid var(--border);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px; color: var(--text-muted);
    flex-wrap: wrap; gap: 12px;
  }
  footer a { color: var(--gold); text-decoration: none; }

  @media (max-width: 768px) {
    .feature-section { grid-template-columns: 1fr; gap: 40px; }
    .feature-section.reverse { direction: ltr; }
    .hero-score { display: none; }
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
    .hero { padding: 100px 24px 60px; }
    .feature-section { padding: 60px 24px; }
    .stats-strip { gap: 40px; }
    .tiers { flex-direction: column; align-items: center; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">SÉRA</a>
  <div class="nav-links">
    <a href="#vitality">VITALITY</a>
    <a href="#protocols">PROTOCOLS</a>
    <a href="#concierge">CONCIERGE</a>
    <a href="#membership">MEMBERSHIP</a>
  </div>
  <a class="nav-cta" href="#">REQUEST INVITE</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <p class="hero-eyebrow">Luxury Longevity Platform · Est. 2024</p>
    <h1 class="hero-title">
      Your body,<br>
      <em>optimised.</em>
    </h1>
    <p class="hero-sub">
      SÉRA is the wellness concierge for modern executives — combining real-time biometric intelligence, personalised longevity protocols, and dedicated physician advisors.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="#">Request Invite</a>
      <a class="btn-secondary" href="#vitality">See how it works</a>
    </div>
  </div>
  <div class="hero-score">
    <div class="score-ring">
      <div>
        <div class="score-num">82</div>
        <div class="score-label">VITALITY</div>
      </div>
    </div>
    <div class="score-caption">Today's score</div>
  </div>
</section>

<!-- STATS STRIP -->
<div class="stats-strip">
  <div class="stat-item">
    <div class="stat-val">3,200+</div>
    <div class="stat-label">Members</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">94</div>
    <div class="stat-label">Avg Protocol Score</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">+23%</div>
    <div class="stat-label">HRV improvement</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">18</div>
    <div class="stat-label">Physician Advisors</div>
  </div>
</div>

<!-- SECTION DIVIDER -->
<div class="section-divider" id="vitality" style="margin-top:80px;">
  <span>Biometric Intelligence</span>
  <hr>
</div>

<!-- FEATURE 1 — Vitality Score -->
<div class="feature-section">
  <div>
    <p class="feature-eyebrow">Daily Score</p>
    <h2 class="feature-hook">Excellent,<br>every morning.</h2>
    <p class="feature-body">
      SÉRA synthesises your HRV, sleep architecture, strain, and biomarkers into a single Vitality Score — and compares it to your cohort of high performers.
    </p>
    <a class="feature-link" href="#">View your dashboard →</a>
  </div>
  <div class="feature-visual">
    <div class="visual-label">Vitality · Today</div>
    <div>
      <div class="visual-metric">82</div>
      <div class="visual-sub">Excellent · Top 8% of cohort</div>
    </div>
    <div class="visual-bar-wrap">
      <div class="visual-bar-row">
        <span class="visual-bar-label">HRV</span>
        <div class="visual-bar-track"><div class="visual-bar-fill" style="width:82%"></div></div>
        <span class="visual-pct">68ms</span>
      </div>
      <div class="visual-bar-row">
        <span class="visual-bar-label">Sleep</span>
        <div class="visual-bar-track"><div class="visual-bar-fill" style="width:74%"></div></div>
        <span class="visual-pct">7.4h</span>
      </div>
      <div class="visual-bar-row">
        <span class="visual-bar-label">Strain</span>
        <div class="visual-bar-track"><div class="visual-bar-fill" style="width:71%"></div></div>
        <span class="visual-pct">14.2</span>
      </div>
    </div>
  </div>
</div>

<!-- FEATURE 2 — Protocols -->
<div class="section-divider" id="protocols">
  <span>Personalised Protocols</span>
  <hr>
</div>
<div class="feature-section reverse">
  <div>
    <p class="feature-eyebrow">Longevity Stack</p>
    <h2 class="feature-hook">Peak every<br><em>morning.</em></h2>
    <p class="feature-body">
      Your physician curates a personalised supplement and lifestyle stack, continuously refined by your biomarker data. Not generic advice — your protocol.
    </p>
    <a class="feature-link" href="#">Explore protocols →</a>
  </div>
  <div class="phone-wrap">
    <div class="phone-frame">
      <div class="phone-screen">
        <div class="phone-nav-bar">
          <span>9:41</span>
          <span style="letter-spacing:0.1em">SÉRA</span>
          <span>●▰▰▰</span>
        </div>
        <div class="phone-content">
          <div class="phone-card">
            <div class="phone-card-label">Foundation Stack · Score</div>
            <div class="phone-card-val">94</div>
            <div class="phone-card-sub">↑ 6 active protocols</div>
          </div>
          <div class="phone-card" style="display:flex;align-items:center;gap:10px;">
            <div style="flex:1">
              <div class="phone-card-label">Creatine</div>
              <div style="font-size:13px;font-weight:600;color:var(--text)">5g · Done</div>
            </div>
            <div style="width:22px;height:22px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:700">✓</div>
          </div>
          <div class="phone-card" style="display:flex;align-items:center;gap:10px;">
            <div style="flex:1">
              <div class="phone-card-label">NMN + Resveratrol</div>
              <div style="font-size:13px;font-weight:600;color:var(--gold)">Review needed</div>
            </div>
            <div style="width:22px;height:22px;border-radius:50%;border:1.5px solid var(--gold)"></div>
          </div>
        </div>
        <div class="phone-bottom">
          <div class="phone-nav-dot-off"></div>
          <div class="phone-nav-dot"></div>
          <div class="phone-nav-dot-off"></div>
          <div class="phone-nav-dot-off"></div>
          <div class="phone-nav-dot-off"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- FEATURE 3 — Concierge -->
<div class="section-divider" id="concierge">
  <span>Physician Concierge</span>
  <hr>
</div>
<div class="feature-section">
  <div>
    <p class="feature-eyebrow">Your Advisor</p>
    <h2 class="feature-hook">Lab reviewed.<br><em>In minutes.</em></h2>
    <p class="feature-body">
      Every SÉRA member gets a dedicated physician advisor — Stanford-trained, longevity-specialised. They review your labs, message you personally, and refine your protocol quarterly.
    </p>
    <a class="feature-link" href="#">Meet your advisor →</a>
  </div>
  <div class="feature-visual" style="background:var(--text)">
    <div class="visual-label" style="color:var(--gold)">Dr. Laura Chen · Online Now</div>
    <div style="color:#F6F2EB">
      <div style="font-size:15px;font-weight:600;margin-bottom:10px">March labs reviewed.</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#9A8E7E;line-height:1.6">
        "Your testosterone is up 18% — excellent response. I am blocking 30 min tomorrow to walk through your full Q1 results and 3 new recommendations."
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:16px">
      <div style="width:8px;height:8px;border-radius:50%;background:var(--green)"></div>
      <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#9A8E7E">Available for consultation · 45m ago</span>
    </div>
  </div>
</div>

<!-- MEMBERSHIP SECTION -->
<section class="membership-section" id="membership">
  <p class="membership-eyebrow">Membership</p>
  <h2 class="membership-title">Engineered to<br><em>outperform.</em></h2>
  <p class="membership-sub">Three tiers of membership. All include physician oversight, biometric tracking, and personalised protocols.</p>
  <div class="tiers">
    <div class="tier-card">
      <div class="tier-name">Gold</div>
      <div class="tier-price">$199</div>
      <div class="tier-period">/month</div>
      <hr class="tier-divider">
      <div class="tier-feature"><span class="check">·</span> Vitality Score & tracking</div>
      <div class="tier-feature"><span class="check">·</span> Core longevity protocols</div>
      <div class="tier-feature"><span class="check">·</span> Monthly advisor check-in</div>
    </div>
    <div class="tier-card featured">
      <div class="tier-badge">Most Popular</div>
      <div class="tier-name">Platinum</div>
      <div class="tier-price">$499</div>
      <div class="tier-period">/month</div>
      <hr class="tier-divider">
      <div class="tier-feature"><span class="check" style="color:var(--gold)">✓</span> Everything in Gold</div>
      <div class="tier-feature"><span class="check" style="color:var(--gold)">✓</span> Quarterly bloodwork panels</div>
      <div class="tier-feature"><span class="check" style="color:var(--gold)">✓</span> Bi-weekly advisor reviews</div>
      <div class="tier-feature"><span class="check" style="color:var(--gold)">✓</span> Priority concierge access</div>
    </div>
    <div class="tier-card">
      <div class="tier-name">Obsidian</div>
      <div class="tier-price">$999</div>
      <div class="tier-period">/month</div>
      <hr class="tier-divider">
      <div class="tier-feature"><span class="check">·</span> Everything in Platinum</div>
      <div class="tier-feature"><span class="check">·</span> Dedicated physician advisor</div>
      <div class="tier-feature"><span class="check">·</span> Annual longevity retreat</div>
      <div class="tier-feature"><span class="check">·</span> Unlimited consultations</div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <span><strong>SÉRA</strong> — Luxury Longevity Concierge</span>
  <span>Designed by <a href="https://ram.zenbin.org">RAM</a> · Design Heartbeat · March 2026</span>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewer(penJson) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SÉRA — Design Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F6F2EB; font-family: 'Helvetica Neue', Arial, sans-serif; }
  .header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 10;
    background: #F6F2EB; border-bottom: 1px solid #D4CBB8;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px;
  }
  .header h1 { font-size: 12px; font-weight: 700; letter-spacing: 0.2em; color: #1C1814; }
  .header a { font-size: 10px; color: #B8955A; text-decoration: none; letter-spacing: 0.15em; }
  #viewer { padding-top: 60px; }
</style>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
<script src="https://ram.zenbin.org/viewer.js"></script>
</head>
<body>
<div class="header">
  <h1>SÉRA — DESIGN VIEWER</h1>
  <a href="https://ram.zenbin.org/${SLUG}">← Back to overview</a>
</div>
<div id="viewer"></div>
</body>
</html>`;
}

async function main() {
  console.log('Publishing SÉRA...\n');

  // 1) Hero page
  console.log('1) Publishing hero page...');
  const heroResult = await publish(SLUG, heroHtml, 'SÉRA — Luxury Longevity Concierge');
  console.log('   Hero:', heroResult.url || heroResult.raw?.slice(0, 80) || JSON.stringify(heroResult).slice(0, 80));

  // 2) Viewer
  console.log('2) Publishing viewer...');
  const penJson = fs.readFileSync(PEN_FILE, 'utf8');
  const viewerHtml = buildViewer(penJson);
  const viewerResult = await publish(SLUG + '-viewer', viewerHtml, 'SÉRA — Interactive Viewer');
  console.log('   Viewer:', viewerResult.url || viewerResult.raw?.slice(0, 80) || JSON.stringify(viewerResult).slice(0, 80));

  console.log('\nDone.');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
