#!/usr/bin/env node
// dune-publish.js — hero page + viewer for DUNE
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'dune';
const APP_NAME  = 'DUNE';
const TAGLINE   = 'Know your money. Clearly.';
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

const penJson   = fs.readFileSync(path.join(__dirname, 'dune.pen'), 'utf8');
let viewerHtml  = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml      = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Hero page HTML ────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DUNE — Know your money. Clearly.</title>
  <meta name="description" content="DUNE is an AI-powered personal finance clarity app. Net worth pulse, smart spending breakdown, savings goal tracking, and portfolio intelligence — all in a calm, dark interface.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #0C0B09;
      --surface: #171512;
      --card:    #1F1C18;
      --text:    #F5F0E8;
      --muted:   rgba(245,240,232,0.45);
      --amber:   #E8B467;
      --amber2:  #F0C882;
      --green:   #6BBF8A;
      --blue:    #5B9BD5;
      --red:     #C46B6B;
      --dim:     rgba(245,240,232,0.08);
      --dim2:    rgba(245,240,232,0.12);
      --amber-dim: rgba(232,180,103,0.12);
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden; }

    /* NAV */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 40px;
      background: rgba(12,11,9,0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--dim2);
    }
    .nav-logo { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 15px; color: var(--amber); letter-spacing: 0.12em; }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      background: var(--amber); color: var(--bg);
      padding: 8px 20px; border-radius: 20px;
      font-size: 13px; font-weight: 700; text-decoration: none;
      transition: background 0.2s, transform 0.15s;
    }
    .nav-cta:hover { background: var(--amber2); transform: translateY(-1px); }

    /* HERO */
    .hero {
      min-height: 100vh; display: flex; align-items: center;
      padding: 120px 40px 80px;
      position: relative; overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; top: -200px; right: -100px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(232,180,103,0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content { max-width: 520px; position: relative; z-index: 1; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--amber-dim); border: 1px solid rgba(232,180,103,0.25);
      border-radius: 20px; padding: 6px 14px; margin-bottom: 32px;
      font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700;
      color: var(--amber); letter-spacing: 0.10em;
    }
    .hero-badge::before { content: '✦'; font-size: 10px; }
    .hero-title {
      font-size: clamp(48px, 7vw, 80px);
      font-weight: 800; line-height: 1.0; letter-spacing: -0.03em;
      margin-bottom: 24px; color: var(--text);
    }
    .hero-title em { color: var(--amber); font-style: normal; }
    .hero-sub {
      font-size: 17px; color: var(--muted); line-height: 1.7;
      margin-bottom: 40px; max-width: 420px;
    }
    .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .btn-primary {
      background: var(--amber); color: var(--bg);
      padding: 14px 28px; border-radius: 28px;
      font-size: 14px; font-weight: 700; text-decoration: none;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: var(--amber2); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(232,180,103,0.25); }
    .btn-secondary {
      color: var(--muted); font-size: 14px; text-decoration: none;
      display: flex; align-items: center; gap: 6px; font-weight: 500;
      transition: color 0.2s;
    }
    .btn-secondary:hover { color: var(--text); }

    /* METRIC STRIP */
    .metrics {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 16px; padding: 0 40px 80px;
    }
    .metric-card {
      background: var(--surface); border-radius: 16px;
      padding: 24px; border: 1px solid var(--dim2);
      position: relative; overflow: hidden;
    }
    .metric-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: var(--amber);
    }
    .metric-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 10px; }
    .metric-val { font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 700; color: var(--text); line-height: 1.0; margin-bottom: 6px; }
    .metric-delta { font-size: 12px; font-weight: 600; }
    .metric-delta.up { color: var(--green); }
    .metric-delta.amber { color: var(--amber); }

    /* SCREENS SHOWCASE */
    .screens-section { padding: 80px 0; }
    .section-header { text-align: center; padding: 0 40px 60px; }
    .section-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; color: var(--amber); margin-bottom: 16px; }
    .section-title { font-size: clamp(28px, 4vw, 44px); font-weight: 700; line-height: 1.1; color: var(--text); }

    .screens-scroll {
      display: flex; gap: 20px; overflow-x: auto;
      padding: 0 40px 20px;
      scrollbar-width: none;
    }
    .screens-scroll::-webkit-scrollbar { display: none; }
    .screen-card {
      flex-shrink: 0; width: 220px;
      background: var(--surface); border-radius: 24px;
      border: 1px solid var(--dim2); overflow: hidden;
    }
    .screen-tag {
      background: var(--amber-dim); padding: 6px 16px;
      font-family: 'JetBrains Mono', monospace; font-size: 8px;
      font-weight: 700; letter-spacing: 0.10em; color: var(--amber);
      border-bottom: 1px solid var(--dim2);
    }
    .screen-preview {
      padding: 16px;
      background: var(--bg);
      min-height: 360px;
    }
    .sp-metric { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700; color: var(--text); margin: 8px 0 4px; }
    .sp-label { font-size: 8px; font-weight: 700; letter-spacing: 0.10em; color: var(--muted); }
    .sp-delta { font-size: 10px; font-weight: 600; color: var(--green); }
    .sp-bar-row { display: flex; gap: 6px; margin: 12px 0 4px; }
    .sp-bar { height: 4px; border-radius: 2px; flex: 1; }
    .sp-card { background: var(--card); border-radius: 8px; padding: 8px 10px; margin: 6px 0; }
    .sp-card-title { font-size: 9px; font-weight: 600; color: var(--text); }
    .sp-card-sub { font-size: 8px; color: var(--muted); }
    .sp-card-val { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: var(--amber); float: right; }
    .sp-insight {
      background: rgba(232,180,103,0.10); border-left: 2px solid var(--amber);
      border-radius: 4px; padding: 6px 8px; margin-top: 10px;
      font-size: 8px; color: var(--amber); line-height: 1.4;
    }
    .clearfix::after { content: ''; display: block; clear: both; }

    /* FEATURES */
    .features { padding: 80px 40px; }
    .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 800px; margin: 0 auto; }
    .feature-card {
      background: var(--surface); border-radius: 16px;
      padding: 28px; border: 1px solid var(--dim2);
    }
    .feature-icon { font-size: 24px; margin-bottom: 16px; }
    .feature-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .feature-body { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* PHILOSOPHY */
    .philosophy { padding: 80px 40px; text-align: center; }
    .philosophy-quote {
      max-width: 600px; margin: 0 auto;
      font-size: clamp(20px, 3vw, 30px); font-weight: 300; color: var(--text);
      line-height: 1.5; font-style: italic;
    }
    .philosophy-quote em { color: var(--amber); font-style: normal; font-weight: 600; }
    .philosophy-attr { margin-top: 24px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 0.08em; }

    /* CTA FOOTER */
    .cta-section { padding: 100px 40px; text-align: center; position: relative; overflow: hidden; }
    .cta-section::before {
      content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(232,180,103,0.07) 0%, transparent 70%);
    }
    .cta-title { font-size: clamp(32px, 5vw, 56px); font-weight: 800; color: var(--text); margin-bottom: 16px; letter-spacing: -0.02em; }
    .cta-sub { font-size: 16px; color: var(--muted); margin-bottom: 40px; }
    .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

    /* FOOTER */
    footer {
      padding: 40px; border-top: 1px solid var(--dim2);
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 16px;
    }
    .footer-brand { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--amber); font-weight: 700; letter-spacing: 0.10em; }
    .footer-credit { font-size: 11px; color: var(--muted); }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; }
    .footer-links a:hover { color: var(--text); }

    @media (max-width: 640px) {
      nav { padding: 14px 20px; }
      .nav-links { display: none; }
      .hero { padding: 100px 20px 60px; }
      .metrics { grid-template-columns: 1fr; padding: 0 20px 60px; }
      .features-grid { grid-template-columns: 1fr; }
      footer { flex-direction: column; align-items: flex-start; padding: 30px 20px; }
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-logo">◈ DUNE</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/dune-viewer">Viewer</a>
  </div>
  <a href="https://ram.zenbin.org/dune-mock" class="nav-cta">Try Mock →</a>
</nav>

<section class="hero">
  <div class="hero-content">
    <div class="hero-badge">AI FINANCE DESIGN · DARK THEME</div>
    <h1 class="hero-title">Know your<br>money. <em>Clearly.</em></h1>
    <p class="hero-sub">DUNE is a personal finance clarity app built for the self-aware spender. AI-powered insights, net worth pulse, and spending intelligence — in a calm, warm dark interface.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/dune-mock" class="btn-primary">Open Interactive Mock</a>
      <a href="https://ram.zenbin.org/dune-viewer" class="btn-secondary">View Pen →</a>
    </div>
  </div>
</section>

<section class="metrics">
  <div class="metric-card">
    <div class="metric-label">NET WORTH</div>
    <div class="metric-val">$147K</div>
    <div class="metric-delta up">▲ +$2,341 this month</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">SAVINGS RATE</div>
    <div class="metric-val">35%</div>
    <div class="metric-delta amber">✦ 6% above average</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">HEALTH SCORE</div>
    <div class="metric-val">78</div>
    <div class="metric-delta up">▲ +3 this week</div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="section-header">
    <div class="section-eyebrow">DESIGN PREVIEW — 5 SCREENS</div>
    <h2 class="section-title">Every angle of your finances</h2>
  </div>
  <div class="screens-scroll">

    <!-- Pulse -->
    <div class="screen-card">
      <div class="screen-tag">01 · PULSE</div>
      <div class="screen-preview">
        <div class="sp-label">NET WORTH</div>
        <div class="sp-metric">$147,832</div>
        <div class="sp-delta">▲ +$2,341 this month</div>
        <div class="sp-bar-row">
          <div class="sp-bar" style="background:#E8B467;flex:2"></div>
          <div class="sp-bar" style="background:#6BBF8A;flex:1"></div>
          <div class="sp-bar" style="background:#5B9BD5;flex:0.5"></div>
        </div>
        <div class="sp-card clearfix">
          <span class="sp-card-val" style="color:#C46B6B">-$9.99</span>
          <div class="sp-card-title">Spotify</div>
          <div class="sp-card-sub">Subscriptions</div>
        </div>
        <div class="sp-card clearfix">
          <span class="sp-card-val" style="color:#6BBF8A">+$4,200</span>
          <div class="sp-card-title">Salary Credit</div>
          <div class="sp-card-sub">Income</div>
        </div>
        <div class="sp-insight">Your savings rate is 6% above your 3-month average. AI ✦</div>
      </div>
    </div>

    <!-- Spend -->
    <div class="screen-card">
      <div class="screen-tag">02 · SPEND</div>
      <div class="screen-preview">
        <div class="sp-label">THIS WEEK</div>
        <div class="sp-metric">$348</div>
        <div class="sp-delta" style="color:#C46B6B">↑ 8% vs last week</div>
        <div style="display:flex;gap:3px;align-items:flex-end;height:50px;margin:12px 0;">
          <div style="width:14px;background:rgba(245,240,232,0.12);border-radius:2px;height:18px"></div>
          <div style="width:14px;background:rgba(245,240,232,0.12);border-radius:2px;height:33px"></div>
          <div style="width:14px;background:rgba(245,240,232,0.12);border-radius:2px;height:11px"></div>
          <div style="width:14px;background:#E8B467;border-radius:2px;height:48px"></div>
          <div style="width:14px;background:rgba(245,240,232,0.12);border-radius:2px;height:26px"></div>
          <div style="width:14px;background:rgba(245,240,232,0.12);border-radius:2px;height:22px"></div>
          <div style="width:14px;background:rgba(245,240,232,0.12);border-radius:2px;height:2px"></div>
        </div>
        <div class="sp-card clearfix">
          <span class="sp-card-val">41%</span>
          <div class="sp-card-title">Food & Drink</div>
          <div class="sp-bar" style="background:#E8B467;height:3px;width:82%;margin-top:4px;border-radius:2px"></div>
        </div>
        <div class="sp-card clearfix">
          <span class="sp-card-val" style="color:#5B9BD5">20%</span>
          <div class="sp-card-title">Transport</div>
          <div class="sp-bar" style="background:#5B9BD5;height:3px;width:40%;margin-top:4px;border-radius:2px"></div>
        </div>
        <div class="sp-insight">Spending on food 18% higher vs last week. AI ✦</div>
      </div>
    </div>

    <!-- Save -->
    <div class="screen-card">
      <div class="screen-tag">03 · SAVE</div>
      <div class="screen-preview">
        <div class="sp-label">TOTAL SAVED</div>
        <div class="sp-metric">$18,400</div>
        <div class="sp-delta" style="color:#E8B467">43% of $42,000 target</div>
        <div class="sp-card clearfix" style="margin-top:12px">
          <span class="sp-card-val">70%</span>
          <div class="sp-card-title">Emergency Fund</div>
          <div class="sp-bar" style="background:#E8B467;height:3px;width:70%;margin-top:4px;border-radius:2px"></div>
        </div>
        <div class="sp-card clearfix">
          <span class="sp-card-val" style="color:#5B9BD5">47%</span>
          <div class="sp-card-title">Japan Trip</div>
          <div class="sp-bar" style="background:#5B9BD5;height:3px;width:47%;margin-top:4px;border-radius:2px"></div>
        </div>
        <div class="sp-card clearfix">
          <span class="sp-card-val" style="color:#6BBF8A">80%</span>
          <div class="sp-card-title">MacBook Pro</div>
          <div class="sp-bar" style="background:#6BBF8A;height:3px;width:80%;margin-top:4px;border-radius:2px"></div>
        </div>
        <div class="sp-insight">MacBook goal is 80% done — on track 2 weeks early. AI ✦</div>
      </div>
    </div>

    <!-- Invest -->
    <div class="screen-card">
      <div class="screen-tag">04 · INVEST</div>
      <div class="screen-preview">
        <div class="sp-label">PORTFOLIO VALUE</div>
        <div class="sp-metric">$68,240</div>
        <div class="sp-delta">▲ +$4,820 (7.6%) all-time</div>
        <div class="sp-bar-row" style="margin:12px 0 8px">
          <div class="sp-bar" style="background:#E8B467;flex:4.5"></div>
          <div class="sp-bar" style="background:#5B9BD5;flex:2"></div>
          <div class="sp-bar" style="background:#6BBF8A;flex:1.5"></div>
          <div class="sp-bar" style="background:#9B8BD5;flex:1.2"></div>
          <div class="sp-bar" style="background:rgba(245,240,232,0.2);flex:0.8"></div>
        </div>
        <div class="sp-card clearfix">
          <span class="sp-card-val">45%</span>
          <div class="sp-card-title">US Index (VTSAX)</div>
          <div class="sp-card-sub">$30,708</div>
        </div>
        <div class="sp-card clearfix">
          <span class="sp-card-val" style="color:#5B9BD5">20%</span>
          <div class="sp-card-title">Intl ETF (VXUS)</div>
          <div class="sp-card-sub">$13,648</div>
        </div>
        <div class="sp-insight">Crypto allocation drifted +2% — consider rebalancing. AI ✦</div>
      </div>
    </div>

    <!-- Insights -->
    <div class="screen-card">
      <div class="screen-tag">05 · INSIGHTS</div>
      <div class="screen-preview">
        <div class="sp-label">HEALTH SCORE</div>
        <div class="sp-metric">78<span style="font-size:14px;color:rgba(245,240,232,0.38)">/100</span></div>
        <div class="sp-delta">▲ +3 this week</div>
        <div class="sp-card" style="margin-top:10px;border-left:2px solid #E8B467">
          <div class="sp-card-title" style="font-size:8px;color:#E8B467;letter-spacing:0.08em">PATTERN</div>
          <div class="sp-card-sub" style="margin-top:2px">Thursday spending spike detected</div>
        </div>
        <div class="sp-card" style="border-left:2px solid #6BBF8A">
          <div class="sp-card-title" style="font-size:8px;color:#6BBF8A;letter-spacing:0.08em">OPPORTUNITY</div>
          <div class="sp-card-sub" style="margin-top:2px">Move idle cash to HYSA — $8.50/mo lost</div>
        </div>
        <div class="sp-card" style="border-left:2px solid #C46B6B">
          <div class="sp-card-title" style="font-size:8px;color:#C46B6B;letter-spacing:0.08em">ALERT</div>
          <div class="sp-card-sub" style="margin-top:2px">Subscription creep: +$34.97/mo detected</div>
        </div>
        <div class="sp-insight" style="background:rgba(107,191,138,0.10);border-color:#6BBF8A;color:#6BBF8A">6-week savings streak — your best yet! AI ✦</div>
      </div>
    </div>

  </div>
</section>

<section class="features" id="features">
  <div class="section-header" style="max-width:none">
    <div class="section-eyebrow">DESIGN DECISIONS</div>
    <h2 class="section-title">Why DUNE looks the way it does</h2>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Warm dark, not cold dark</div>
      <div class="feature-body">Most fintech dark UIs use blue-black (#0D1117). DUNE uses warm charcoal (#0C0B09) — the slight warmth reduces anxiety and makes financial data feel less clinical, more like a trusted advisor.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-title">Single amber accent discipline</div>
      <div class="feature-body">Inspired by Midday's accent restraint on darkmodedesign.com — one warm amber (#E8B467) does all the heavy lifting. Secondary colors (green, blue, red) only appear for data states — gains, categories, losses.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Evidence-based AI tone</div>
      <div class="feature-body">Inspired by Dawn (lapa.ninja) — AI insight chips are specific, actionable, and never vague. Every chip cites data: "Thursday spending is 2.4× daily average" — not "your spending looks high this week."</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">↗</div>
      <div class="feature-title">Monospaced financial data</div>
      <div class="feature-body">JetBrains Mono for all dollar amounts and percentages — numbers align perfectly, feel precise, and create a clear typographic hierarchy against Inter body copy. Signals accuracy without coldness.</div>
    </div>
  </div>
</section>

<section class="philosophy">
  <p class="philosophy-quote">
    "Most money apps want to <em>impress</em> you with data.<br>
    DUNE just wants you to <em>understand</em> yours."
  </p>
  <div class="philosophy-attr">RAM DESIGN STUDIO · APRIL 2026</div>
</section>

<section class="cta-section">
  <h2 class="cta-title">See it live</h2>
  <p class="cta-sub">Explore all 5 screens in the interactive mock or open the pen file directly.</p>
  <div class="cta-btns">
    <a href="https://ram.zenbin.org/dune-mock" class="btn-primary">Interactive Mock ☀◑</a>
    <a href="https://ram.zenbin.org/dune-viewer" class="btn-secondary">Open Pen Viewer →</a>
  </div>
</section>

<footer>
  <div class="footer-brand">◈ DUNE</div>
  <div class="footer-credit">Design by RAM · Inspired by Midday + Dawn · April 2026</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/dune-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/dune-mock">Mock</a>
  </div>
</footer>

</body>
</html>`;

async function main() {
  // Publish hero
  console.log('Publishing hero page…');
  const heroRes = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: `${APP_NAME} — ${TAGLINE}` });
  console.log(`Hero → ${heroRes.status}`, [200, 201].includes(heroRes.status) ? 'OK' : heroRes.body.slice(0, 120));

  // Publish viewer
  console.log('Publishing viewer…');
  const viewRes = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, title: `${APP_NAME} — Pen Viewer` });
  console.log(`Viewer → ${viewRes.status}`, [200, 201].includes(viewRes.status) ? 'OK' : viewRes.body.slice(0, 120));

  console.log(`\n✓ Hero:   https://${SUBDOMAIN}.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
