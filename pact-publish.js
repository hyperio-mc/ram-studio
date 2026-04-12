#!/usr/bin/env node
// pact-publish.js — hero page + viewer for PACT
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'pact';
const APP_NAME  = 'PACT';
const TAGLINE   = 'Financial wellbeing, not just a balance.';
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

// ── Viewer (pen embedded) ────────────────────────────────────────────────
const penJson    = fs.readFileSync(path.join(__dirname, 'pact.pen'), 'utf8');
let viewerHtml   = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection  = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml       = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Hero page ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>PACT — Financial wellbeing, not just a balance.</title>
  <meta name="description" content="PACT is a personal finance companion that treats money management like a wellness practice — warm, editorial, and deeply human.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #FAF8F2;
      --surface: #FFFFFF;
      --surface2:#F4F0E6;
      --surface3:#EDE5D4;
      --text:    #1C1916;
      --muted:   rgba(28,25,22,0.5);
      --accent:  #C25E34;
      --accent2: #5A8472;
      --gold:    #D4A840;
      --border:  #E6DED0;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden; }

    nav {
      position: sticky; top: 0; z-index: 100;
      padding: 0 40px; height: 60px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(250,248,242,0.90); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav-logo { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 18px; color: var(--text); }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { text-decoration: none; font-size: 13px; color: var(--muted); transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta { background: var(--accent); color: #fff; font-size: 13px; font-weight: 600; padding: 9px 22px; border-radius: 24px; text-decoration: none; transition: opacity .2s; }
    .nav-cta:hover { opacity: .85; }

    /* Hero */
    .hero {
      min-height: 88vh;
      display: grid; grid-template-columns: 1fr 1fr;
      align-items: center; gap: 64px;
      padding: 80px 80px 60px;
      position: relative; overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; top: -100px; right: -100px;
      width: 600px; height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212,168,64,0.12), transparent 70%);
      pointer-events: none;
    }
    .hero::after {
      content: '';
      position: absolute; bottom: -80px; left: -80px;
      width: 400px; height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(194,94,52,0.08), transparent 70%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--surface3); border: 1px solid var(--border);
      padding: 6px 14px; border-radius: 20px;
      font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
      color: var(--accent); margin-bottom: 28px;
    }
    .hero-eyebrow::before { content: '✦'; }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(44px, 5vw, 72px); font-weight: 900;
      line-height: 1.05; color: var(--text);
      margin-bottom: 24px;
    }
    h1 em { font-style: normal; color: var(--accent); }
    .hero-sub {
      font-size: 18px; line-height: 1.7; color: var(--muted);
      max-width: 480px; margin-bottom: 40px;
    }
    .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .btn-primary {
      background: var(--accent); color: #fff;
      padding: 14px 32px; border-radius: 32px;
      font-size: 15px; font-weight: 600;
      text-decoration: none; transition: all .2s;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary:hover { opacity: .88; transform: translateY(-1px); }
    .btn-secondary {
      color: var(--text); font-size: 15px; font-weight: 500;
      text-decoration: none; display: flex; align-items: center; gap: 6px;
      transition: color .2s;
    }
    .btn-secondary:hover { color: var(--accent); }

    /* Phone mockup */
    .hero-phone {
      display: flex; justify-content: center; align-items: center;
      position: relative; z-index: 1;
    }
    .phone-shell {
      width: 280px; height: 580px;
      background: var(--surface); border-radius: 42px;
      border: 2px solid var(--border);
      box-shadow: 0 40px 80px rgba(28,25,22,0.12), 0 8px 20px rgba(28,25,22,0.06);
      overflow: hidden; position: relative;
    }
    .phone-shell::before {
      content: '';
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      width: 80px; height: 22px;
      background: var(--surface2); border-radius: 11px; z-index: 10;
    }
    .phone-iframe { width: 390px; height: 844px; border: none;
      transform: scale(0.7179); transform-origin: 0 0; }

    /* Wellness score pill */
    .wellness-pill {
      position: absolute; top: 40px; right: -20px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 12px 18px;
      box-shadow: 0 8px 24px rgba(28,25,22,0.08);
      display: flex; align-items: center; gap: 10px;
      font-size: 12px;
    }
    .score-circle {
      width: 40px; height: 40px; border-radius: 50%;
      background: conic-gradient(var(--accent) 0% 84%, var(--surface3) 84% 100%);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px; color: var(--text);
    }

    /* Trend cards */
    .trends-row {
      padding: 0 80px; margin-bottom: 80px;
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    }
    .trend-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 24px;
      transition: transform .2s, box-shadow .2s;
    }
    .trend-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(28,25,22,0.08); }
    .trend-card-icon { font-size: 28px; margin-bottom: 14px; }
    .trend-card-value { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .trend-card-label { font-size: 12px; color: var(--muted); letter-spacing: 0.5px; }
    .trend-card-delta { font-size: 12px; margin-top: 8px; }
    .up { color: var(--accent2); }
    .down { color: var(--accent); }

    /* Features */
    .features { padding: 80px; background: var(--surface2); }
    .features-eyebrow {
      font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
      color: var(--accent); margin-bottom: 16px;
    }
    .features-title {
      font-family: 'Playfair Display', serif; font-size: clamp(32px, 3vw, 52px);
      font-weight: 700; color: var(--text); max-width: 560px; margin-bottom: 56px; line-height: 1.2;
    }
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 28px;
    }
    .feature-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 32px;
      position: relative; overflow: hidden;
    }
    .feature-card::before {
      content: ''; position: absolute; top: 0; left: 0;
      width: 3px; height: 100%; border-radius: 2px;
    }
    .feature-card.clay::before { background: var(--accent); }
    .feature-card.sage::before { background: var(--accent2); }
    .feature-card.gold::before { background: var(--gold); }
    .feature-card.violet::before { background: #7878C2; }
    .feature-icon { font-size: 28px; margin-bottom: 16px; }
    .feature-title { font-weight: 700; font-size: 17px; color: var(--text); margin-bottom: 10px; }
    .feature-desc { font-size: 14px; line-height: 1.65; color: var(--muted); }

    /* Screens */
    .screens { padding: 80px; }
    .s-eyebrow {
      font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
      color: var(--accent); margin-bottom: 16px;
    }
    .s-title {
      font-family: 'Playfair Display', serif; font-size: clamp(32px, 3vw, 52px);
      font-weight: 700; color: var(--text); margin-bottom: 48px; max-width: 500px; line-height: 1.2;
    }
    .s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .s-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px;
      transition: transform .2s;
    }
    .s-card:hover { transform: translateY(-3px); }
    .s-num { font-size: 10px; color: var(--accent); font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
    .s-name { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
    .s-desc { font-size: 13px; line-height: 1.6; color: var(--muted); }

    /* Prototype viewer */
    .viewer { padding: 80px; background: var(--surface2); text-align: center; }
    .viewer-phone {
      display: inline-block;
      background: var(--surface); border-radius: 52px;
      border: 2px solid var(--border); overflow: hidden;
      box-shadow: 0 48px 96px rgba(28,25,22,0.12);
      width: 320px; height: 664px; position: relative;
    }
    .viewer-phone::before {
      content: '';
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      width: 90px; height: 24px;
      background: var(--surface2); border-radius: 12px; z-index: 10;
    }
    .viewer-phone iframe { width: 390px; height: 844px; border: none;
      transform: scale(0.8205); transform-origin: 0 0; }

    /* Quote block */
    .quote-block {
      padding: 80px; display: flex; justify-content: center;
    }
    .quote-inner {
      max-width: 660px; text-align: center;
    }
    .quote-mark { font-family: 'Playfair Display', serif; font-size: 80px; color: var(--accent); opacity: .3; line-height: 0.8; margin-bottom: 20px; }
    .quote-text { font-family: 'Playfair Display', serif; font-size: clamp(22px, 2.5vw, 34px); color: var(--text); line-height: 1.4; margin-bottom: 20px; }
    .quote-attr { font-size: 12px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }

    footer {
      padding: 40px 80px; border-top: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--muted);
    }
    footer strong { color: var(--text); font-size: 14px; }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; padding: 60px 32px; gap: 48px; }
      .hero-phone { display: none; }
      .trends-row, .features, .screens, .viewer, .quote-block { padding: 48px 32px; }
      footer { padding: 32px; flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
<nav>
  <span class="nav-logo">Pact</span>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#preview">Preview</a>
  </div>
  <a href="#preview" class="nav-cta">View Prototype →</a>
</nav>

<section class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">Financial Wellbeing</div>
    <h1>Your money,<br>as a <em>wellness</em><br>practice.</h1>
    <p class="hero-sub">Pact treats your finances the way you treat your mental health — with warmth, editorial clarity, and honest AI insights. Not a ledger. A companion.</p>
    <div class="hero-actions">
      <a href="#preview" class="btn-primary">View Prototype →</a>
      <a href="#screens" class="btn-secondary">Explore screens ↓</a>
    </div>
  </div>
  <div class="hero-phone">
    <div class="phone-shell">
      <iframe class="phone-iframe" src="https://ram.zenbin.org/pact-viewer" title="Pact Prototype"></iframe>
    </div>
    <div class="wellness-pill">
      <div class="score-circle">84</div>
      <div>
        <div style="font-weight:600;color:var(--text)">Money Score</div>
        <div style="color:var(--muted)">Great rhythm this week</div>
      </div>
    </div>
  </div>
</section>

<div class="trends-row">
  <div class="trend-card">
    <div class="trend-card-icon">💰</div>
    <div class="trend-card-value">$847</div>
    <div class="trend-card-label">SPENT THIS MONTH</div>
    <div class="trend-card-delta up">↓ 12% vs last month — on track</div>
  </div>
  <div class="trend-card">
    <div class="trend-card-icon">🎯</div>
    <div class="trend-card-value">22%</div>
    <div class="trend-card-label">SAVINGS RATE</div>
    <div class="trend-card-delta up">↑ Tracking toward $7,200/year</div>
  </div>
  <div class="trend-card">
    <div class="trend-card-icon">✦</div>
    <div class="trend-card-value">+$2,353</div>
    <div class="trend-card-label">NET CASH FLOW</div>
    <div class="trend-card-delta up">Income minus spend this month</div>
  </div>
</div>

<section class="features" id="features">
  <div class="features-eyebrow">✦ What Pact does</div>
  <h2 class="features-title">Finance as a ritual, not a chore.</h2>
  <div class="features-grid">
    <div class="feature-card clay">
      <div class="feature-icon">◑</div>
      <div class="feature-title">Spend Ring</div>
      <div class="feature-desc">A warm, at-a-glance circular view of your monthly spend vs. budget — colour-coded by category, no spreadsheets required.</div>
    </div>
    <div class="feature-card sage">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Intention Goals</div>
      <div class="feature-desc">Set goals with large percentage display type — editorial, not clinical. Track Japan Trip, Emergency Fund, and Roth IRA in one scroll.</div>
    </div>
    <div class="feature-card gold">
      <div class="feature-icon">✦</div>
      <div class="feature-title">AI Money Story</div>
      <div class="feature-desc">Pact AI writes editorial pull-quote observations: "You spent 23% less on dining this week — your best streak in 3 months." Warm, not robotic.</div>
    </div>
    <div class="feature-card violet">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Pattern Detection</div>
      <div class="feature-desc">Weekend spending spikes, morning danger zones, subscription creep — surfaced as gentle narrative insights, not alert banners.</div>
    </div>
  </div>
</section>

<section class="quote-block">
  <div class="quote-inner">
    <div class="quote-mark">"</div>
    <div class="quote-text">Your spending is in a good rhythm this week — best stretch in three months.</div>
    <div class="quote-attr">— Pact AI · April 7, 2026</div>
  </div>
</section>

<section class="screens" id="screens">
  <div class="s-eyebrow">✦ 5 screens</div>
  <h2 class="s-title">Everything you need, nothing you don't.</h2>
  <div class="s-grid">
    <div class="s-card">
      <div class="s-num">01 · HOME</div>
      <div class="s-name">Today</div>
      <div class="s-desc">Morning greeting, AI pull-quote, spend ring with category legend, and recent transactions at a glance.</div>
    </div>
    <div class="s-card">
      <div class="s-num">02 · SPENDING</div>
      <div class="s-name">Month View</div>
      <div class="s-desc">Editorial large-number hero display, micro sparkline chart, and category breakdown with left-rule colour bars.</div>
    </div>
    <div class="s-card">
      <div class="s-num">03 · GOALS</div>
      <div class="s-name">Intentions</div>
      <div class="s-desc">Savings rate badge, four active goals with oversized % typography, milestone dots, and progress tracks.</div>
    </div>
    <div class="s-card">
      <div class="s-num">04 · AI</div>
      <div class="s-name">Money Story</div>
      <div class="s-desc">Pull-quote hero card, paired nugget cards, and three editorial pattern observations with left-rule colour accents.</div>
    </div>
    <div class="s-card">
      <div class="s-num">05 · TRENDS</div>
      <div class="s-name">At a Glance</div>
      <div class="s-desc">4-month bar chart vs. budget line, top 5 merchants with proportion bars, and net cash flow strip in sage green.</div>
    </div>
  </div>
</section>

<div class="viewer" id="preview">
  <div class="s-eyebrow" style="margin-bottom:16px;">✦ PROTOTYPE</div>
  <h2 style="font-family:'Playfair Display',serif; font-size:clamp(28px,3vw,42px); margin-bottom:40px; color:var(--text)">Feel it in motion.</h2>
  <div class="viewer-phone">
    <iframe src="https://ram.zenbin.org/pact-viewer" height="844" title="Pact Prototype"></iframe>
  </div>
  <p style="margin-top:20px; font-size:12px; color:var(--muted)">ram.zenbin.org/pact-viewer</p>
</div>

<footer>
  <strong>Pact</strong>
  <span>Design by RAM · Pencil.dev v2.8 · LIGHT theme</span>
  <span>Inspired by Dawn (lapa.ninja) · Overlay (lapa.ninja) · New Genre (minimal.gallery)</span>
</footer>
</body>
</html>`;

async function main() {
  const heroRes = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: `${APP_NAME} — ${TAGLINE}` });
  console.log('Hero:', heroRes.status, [200,201].includes(heroRes.status) ? 'OK' : heroRes.body.slice(0,120));

  const viewerRes = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, title: `${APP_NAME} — Prototype` });
  console.log('Viewer:', viewerRes.status, [200,201].includes(viewerRes.status) ? 'OK' : viewerRes.body.slice(0,120));

  console.log(`\nLive: https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
