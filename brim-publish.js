/**
 * BRIM — Full Design Discovery Pipeline
 * Hero + Viewer + Gallery queue + DB
 * RAM Design Heartbeat — Mar 28 2026
 * 
 * Inspired by: darkmodedesign.com — Muradov portfolio (electric violet on near-black, bold condensed type)
 *              and Cecilia climate-tech (minimal centered layout on pure black)
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'brim';
const APP       = 'BRIM';
const TAGLINE   = 'Your money, finally intelligent.';
const ARCHETYPE = 'fintech-ai-dark';
const PROMPT    = 'Inspired by darkmodedesign.com Muradov portfolio — massive bold condensed display type on electric-violet-on-near-black, plus Cecilia climate-tech centred minimal layout on pure black. Dark AI-powered personal finance intelligence app: 5 screens covering a command-centre dashboard with editorial 52px net-worth number, spending pulse with category breakdown, portfolio intelligence with allocation bar + holdings, BRIM AI insights hub with health score + three insight cards, and goals tracker. Palette: near-black #080810, surface #0F0F1C, electric violet #7B5CF0, teal mint #00E5B4.';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const buf  = Buffer.from(body);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': buf.length,
        'X-Subdomain': subdomain,
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          resolve(parsed.url ? parsed : { url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) });
        } catch(e) { resolve({ url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) }); }
      });
    });
    req.on('error', reject);
    req.write(buf); req.end();
  });
}

const HERO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BRIM — Your money, finally intelligent.</title>
<meta name="description" content="AI-powered personal finance intelligence. See your full financial picture. Act on what matters.">
<style>
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  :root {
    --bg:      #080810;
    --surface: #0F0F1C;
    --card:    #14142A;
    --border:  #1E1E3A;
    --text:    #F0F0FC;
    --muted:   rgba(240,240,252,0.45);
    --accent:  #7B5CF0;
    --accent2: #00E5B4;
    --warn:    #FF6B6B;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    overflow-x: hidden;
  }

  /* ── NAV ────────────────────────────────── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 40px;
    background: rgba(8,8,16,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(123,92,240,0.1);
  }
  .nav-logo {
    font-size: 18px; font-weight: 900; letter-spacing: -0.5px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff; border: none; padding: 10px 22px;
    border-radius: 22px; font-size: 13px; font-weight: 700; cursor: pointer;
    transition: opacity .2s;
    text-decoration: none;
  }
  .nav-cta:hover { opacity: .85; }

  /* ── HERO ───────────────────────────────── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
    position: relative; overflow: hidden;
  }
  .hero-glow {
    position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
    width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, rgba(123,92,240,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-glow2 {
    position: absolute; bottom: -100px; right: -100px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,229,180,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(123,92,240,0.12); border: 1px solid rgba(123,92,240,0.3);
    color: var(--accent); font-size: 11px; font-weight: 800; letter-spacing: 3px;
    padding: 8px 18px; border-radius: 20px; margin-bottom: 32px;
  }
  .hero-badge span { opacity: 0.6; }
  h1 {
    font-size: clamp(52px, 9vw, 96px);
    font-weight: 900;
    letter-spacing: -3px;
    line-height: 1;
    margin-bottom: 24px;
  }
  h1 em {
    font-style: normal;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero-sub {
    font-size: 18px; color: var(--muted); max-width: 520px; margin: 0 auto 48px;
    line-height: 1.6;
  }
  .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff; border: none;
    padding: 16px 36px; border-radius: 28px; font-size: 15px; font-weight: 700;
    cursor: pointer; transition: all .2s; text-decoration: none;
    box-shadow: 0 0 40px rgba(123,92,240,0.3);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 60px rgba(123,92,240,0.5); }
  .btn-ghost {
    background: transparent; color: var(--text); border: 1px solid var(--border);
    padding: 16px 36px; border-radius: 28px; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: all .2s; text-decoration: none;
  }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  /* ── HERO DEVICE MOCKUP ─────────────────── */
  .hero-device {
    margin-top: 72px;
    position: relative; display: inline-block;
  }
  .device-frame {
    width: 280px; height: 580px;
    background: var(--surface);
    border-radius: 44px;
    border: 2px solid var(--border);
    overflow: hidden;
    box-shadow:
      0 0 80px rgba(123,92,240,0.25),
      0 60px 120px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.06);
    position: relative;
  }
  .device-screen {
    padding: 28px 20px 20px;
    height: 100%;
    display: flex; flex-direction: column; gap: 14px;
  }
  .dv-label { font-size: 7px; font-weight: 700; letter-spacing: 2.5px; color: var(--muted); }
  .dv-num { font-size: 36px; font-weight: 900; letter-spacing: -1.5px; margin: 2px 0; }
  .dv-badge {
    display: inline-block; font-size: 8px; font-weight: 700;
    background: rgba(0,229,180,0.15); color: var(--accent2);
    padding: 4px 10px; border-radius: 10px;
  }
  .dv-sparkline {
    height: 36px; background: var(--card); border-radius: 10px;
    display: flex; align-items: flex-end; gap: 2px; padding: 6px 8px;
    overflow: hidden;
  }
  .dv-bar { flex: 1; border-radius: 2px; background: var(--accent2); opacity: 0.7; }
  .dv-stat-row { display: flex; gap: 8px; }
  .dv-stat {
    flex: 1; background: var(--card); border-radius: 10px;
    padding: 8px 10px;
  }
  .dv-stat-lbl { font-size: 6px; font-weight: 700; letter-spacing: 1.5px; color: var(--muted); }
  .dv-stat-val { font-size: 14px; font-weight: 800; margin: 2px 0; }
  .dv-stat-chg { font-size: 7px; font-weight: 600; color: var(--accent2); }
  .dv-bill { background: var(--card); border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; gap: 8px; }
  .dv-bill-ic { font-size: 14px; }
  .dv-bill-info { flex: 1; }
  .dv-bill-name { font-size: 9px; font-weight: 600; }
  .dv-bill-due { font-size: 7px; color: var(--muted); }
  .dv-bill-amt { font-size: 10px; font-weight: 700; }
  .dv-ai {
    background: rgba(123,92,240,0.12); border: 1px solid rgba(123,92,240,0.25);
    border-radius: 12px; padding: 10px 12px;
    border-left: 3px solid var(--accent);
  }
  .dv-ai-badge { font-size: 7px; font-weight: 800; letter-spacing: 2px; color: var(--accent); margin-bottom: 4px; }
  .dv-ai-msg { font-size: 8px; color: var(--text); line-height: 1.5; }
  /* Second device */
  .device-frame-2 {
    position: absolute;
    right: -120px; bottom: 60px;
    width: 200px; height: 400px;
    background: var(--surface);
    border-radius: 32px;
    border: 2px solid var(--border);
    overflow: hidden;
    box-shadow: 0 0 50px rgba(0,229,180,0.12), 0 40px 80px rgba(0,0,0,0.5);
    opacity: 0.75;
  }
  .device-screen-2 { padding: 20px 14px; display: flex; flex-direction: column; gap: 10px; }
  .dv2-hd { font-size: 11px; font-weight: 900; }
  .dv2-cat { background: var(--card); border-radius: 8px; padding: 6px 8px; }
  .dv2-cat-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .dv2-cat-ic { font-size: 10px; }
  .dv2-cat-nm { font-size: 7px; font-weight: 600; flex: 1; }
  .dv2-cat-amt { font-size: 8px; font-weight: 700; }
  .dv2-bar-bg { height: 3px; background: var(--border); border-radius: 2px; }
  .dv2-bar { height: 3px; border-radius: 2px; }

  /* ── STATS STRIP ────────────────────────── */
  .stats-strip {
    display: flex; justify-content: center; gap: 0;
    padding: 0 40px;
    margin-top: -20px;
  }
  .stat-item {
    flex: 1; max-width: 240px; text-align: center;
    padding: 40px 24px;
    border-right: 1px solid var(--border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-num {
    font-size: 42px; font-weight: 900; letter-spacing: -2px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .stat-lbl { font-size: 13px; color: var(--muted); margin-top: 6px; }

  /* ── FEATURES ───────────────────────────── */
  section { padding: 100px 40px; }
  .section-badge {
    display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: 3px;
    color: var(--accent); background: rgba(123,92,240,0.1); border: 1px solid rgba(123,92,240,0.2);
    padding: 6px 14px; border-radius: 14px; margin-bottom: 24px;
  }
  h2 {
    font-size: clamp(32px, 5vw, 52px); font-weight: 900; letter-spacing: -2px;
    line-height: 1.05; margin-bottom: 20px;
  }
  .section-sub { font-size: 16px; color: var(--muted); max-width: 480px; line-height: 1.6; }

  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px; margin-top: 60px; max-width: 1100px; margin-left: auto; margin-right: auto;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px; padding: 32px;
    transition: border-color .2s, transform .2s;
  }
  .feature-card:hover { border-color: var(--accent); transform: translateY(-4px); }
  .feature-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 20px;
  }
  .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
  .feature-card p { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* ── INSIGHT SHOWCASE ───────────────────── */
  .insights-section {
    max-width: 1100px; margin: 0 auto; padding: 0 40px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .insight-cards { display: flex; flex-direction: column; gap: 16px; }
  .insight-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 24px; position: relative; overflow: hidden;
    border-left: 4px solid transparent;
    transition: transform .2s;
  }
  .insight-card:hover { transform: translateX(4px); }
  .insight-card.opportunity { border-left-color: var(--accent2); }
  .insight-card.alert { border-left-color: var(--warn); background: rgba(255,107,107,0.04); }
  .insight-card.rebalance { border-left-color: var(--accent); }
  .ic-badge {
    font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
    padding: 4px 10px; border-radius: 8px; display: inline-block; margin-bottom: 12px;
  }
  .ic-badge.opp { background: rgba(0,229,180,0.12); color: var(--accent2); }
  .ic-badge.alt { background: rgba(255,107,107,0.12); color: var(--warn); }
  .ic-badge.reb { background: rgba(123,92,240,0.12); color: var(--accent); }
  .insight-card h4 { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .insight-card p { font-size: 12px; color: var(--muted); line-height: 1.5; }
  .insight-act { font-size: 11px; font-weight: 700; margin-top: 12px; }
  .insight-act.opp { color: var(--accent2); }
  .insight-act.alt { color: var(--warn); }
  .insight-act.reb { color: var(--accent); }

  /* ── SCORE VISUAL ───────────────────────── */
  .score-display {
    text-align: center;
  }
  .score-ring {
    width: 200px; height: 200px; margin: 0 auto 32px;
    border-radius: 50%;
    background: conic-gradient(var(--accent) 0% 84%, var(--border) 84% 100%);
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .score-inner {
    width: 160px; height: 160px; border-radius: 50%;
    background: var(--surface);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .score-num { font-size: 52px; font-weight: 900; letter-spacing: -2px; color: var(--text); }
  .score-label { font-size: 12px; color: var(--muted); letter-spacing: 1px; }
  .score-tag {
    display: inline-block; background: rgba(0,229,180,0.12); color: var(--accent2);
    font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 14px; margin-bottom: 16px;
  }
  .score-desc { font-size: 15px; color: var(--muted); max-width: 320px; margin: 0 auto; line-height: 1.6; }

  /* ── PRICING ────────────────────────────── */
  .pricing-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px; max-width: 900px; margin: 60px auto 0;
  }
  .pricing-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 24px; padding: 36px; text-align: center;
  }
  .pricing-card.featured {
    border-color: var(--accent);
    box-shadow: 0 0 60px rgba(123,92,240,0.15);
    position: relative;
  }
  .pricing-card.featured::before {
    content: 'MOST POPULAR';
    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
    background: var(--accent); color: #fff;
    font-size: 10px; font-weight: 800; letter-spacing: 2px;
    padding: 4px 14px; border-radius: 10px;
  }
  .plan-name { font-size: 13px; font-weight: 700; letter-spacing: 2px; color: var(--muted); margin-bottom: 16px; }
  .plan-price { font-size: 44px; font-weight: 900; letter-spacing: -2px; margin-bottom: 6px; }
  .plan-price span { font-size: 16px; font-weight: 500; color: var(--muted); }
  .plan-sub { font-size: 13px; color: var(--muted); margin-bottom: 28px; }
  .plan-features { list-style: none; text-align: left; margin-bottom: 32px; display: flex; flex-direction: column; gap: 10px; }
  .plan-features li { font-size: 13px; color: var(--muted); display: flex; gap: 10px; }
  .plan-features li::before { content: '✓'; color: var(--accent2); font-weight: 700; flex-shrink: 0; }
  .plan-btn {
    width: 100%; padding: 14px; border-radius: 22px;
    font-size: 14px; font-weight: 700; cursor: pointer; border: none;
    transition: all .2s;
  }
  .plan-btn.primary { background: var(--accent); color: #fff; }
  .plan-btn.primary:hover { opacity: .85; }
  .plan-btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--border); }
  .plan-btn.ghost:hover { border-color: var(--accent); color: var(--accent); }

  /* ── CTA ────────────────────────────────── */
  .cta-section {
    text-align: center; padding: 100px 40px;
    background: radial-gradient(ellipse at center, rgba(123,92,240,0.08) 0%, transparent 70%);
    border-top: 1px solid var(--border);
  }
  .cta-section h2 { margin-bottom: 16px; }
  .cta-section p { color: var(--muted); font-size: 16px; margin-bottom: 40px; max-width: 480px; margin-left: auto; margin-right: auto; }

  /* ── FOOTER ─────────────────────────────── */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px;
    display: flex; justify-content: space-between; align-items: center;
    color: var(--muted); font-size: 13px;
  }
  .footer-logo { font-weight: 900; font-size: 15px; color: var(--text); }

  @media (max-width: 768px) {
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
    section { padding: 60px 20px; }
    .insights-section { grid-template-columns: 1fr; }
    .stats-strip { flex-direction: column; padding: 0 20px; }
    .stat-item { border-right: none; border-bottom: 1px solid var(--border); }
    .stat-item:last-child { border-bottom: none; }
    footer { flex-direction: column; gap: 12px; text-align: center; }
    .device-frame-2 { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">✦ BRIM</div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#insights">AI Insights</a></li>
    <li><a href="#pricing">Pricing</a></li>
  </ul>
  <a href="https://ram.zenbin.org/brim-mock" class="nav-cta">Try mock →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>

  <div class="hero-badge">✦ <span>POWERED BY</span> BRIM AI</div>

  <h1>Your money,<br><em>finally intelligent.</em></h1>
  <p class="hero-sub">
    One AI that watches your full financial picture — spending, investments, goals — and tells you exactly what to do next.
  </p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/brim-mock" class="btn-primary">See it in action</a>
    <a href="https://ram.zenbin.org/brim-viewer" class="btn-ghost">View design →</a>
  </div>

  <!-- Device mockup -->
  <div class="hero-device">
    <div class="device-frame">
      <div class="device-screen">
        <div>
          <div class="dv-label">NET WORTH</div>
          <div class="dv-num">$284,391</div>
          <span class="dv-badge">↑ +1.2% this month</span>
        </div>
        <div class="dv-sparkline">
          <div class="dv-bar" style="height:30%"></div>
          <div class="dv-bar" style="height:38%"></div>
          <div class="dv-bar" style="height:28%"></div>
          <div class="dv-bar" style="height:50%"></div>
          <div class="dv-bar" style="height:44%"></div>
          <div class="dv-bar" style="height:60%"></div>
          <div class="dv-bar" style="height:72%"></div>
          <div class="dv-bar" style="height:68%"></div>
          <div class="dv-bar" style="height:85%"></div>
          <div class="dv-bar" style="height:92%"></div>
          <div class="dv-bar" style="height:100%"></div>
        </div>
        <div class="dv-stat-row">
          <div class="dv-stat">
            <div class="dv-stat-lbl">CASH</div>
            <div class="dv-stat-val">$24.1K</div>
            <div class="dv-stat-chg">+1.2%</div>
          </div>
          <div class="dv-stat">
            <div class="dv-stat-lbl">INVEST</div>
            <div class="dv-stat-val">$198K</div>
            <div class="dv-stat-chg" style="color:var(--accent2)">+5.7%</div>
          </div>
          <div class="dv-stat">
            <div class="dv-stat-lbl">DEBT</div>
            <div class="dv-stat-val">$62K</div>
            <div class="dv-stat-chg" style="color:var(--warn)">-0.8%</div>
          </div>
        </div>
        <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--muted)">UPCOMING BILLS</div>
        <div class="dv-bill">
          <span class="dv-bill-ic">🏠</span>
          <div class="dv-bill-info">
            <div class="dv-bill-name">Rent</div>
            <div class="dv-bill-due">Due Apr 3</div>
          </div>
          <span class="dv-bill-amt">$2,200</span>
        </div>
        <div class="dv-bill">
          <span class="dv-bill-ic">🎬</span>
          <div class="dv-bill-info">
            <div class="dv-bill-name">Netflix</div>
            <div class="dv-bill-due">Due Apr 1</div>
          </div>
          <span class="dv-bill-amt">$15.99</span>
        </div>
        <div class="dv-ai">
          <div class="dv-ai-badge">✦ BRIM AI</div>
          <div class="dv-ai-msg">Move $2K from savings to your index fund — beats your 1.2% yield by 3.6%.</div>
        </div>
      </div>
    </div>
    <!-- Second device: spending -->
    <div class="device-frame-2">
      <div class="device-screen-2">
        <div class="dv2-hd">Spending Pulse</div>
        <div style="font-size:20px;font-weight:900;letter-spacing:-1px;">$3,847</div>
        <div style="font-size:8px;color:var(--muted)">of $5,000 budget · 77%</div>
        <div style="height:3px;background:var(--border);border-radius:2px;margin-bottom:6px">
          <div style="width:77%;height:100%;background:var(--warn);border-radius:2px"></div>
        </div>
        <div class="dv2-cat">
          <div class="dv2-cat-row"><span class="dv2-cat-ic">🏠</span><span class="dv2-cat-nm">Housing</span><span class="dv2-cat-amt">$2,200</span></div>
          <div class="dv2-bar-bg"><div class="dv2-bar" style="width:57%;background:var(--accent)"></div></div>
        </div>
        <div class="dv2-cat">
          <div class="dv2-cat-row"><span class="dv2-cat-ic">🍜</span><span class="dv2-cat-nm">Food</span><span class="dv2-cat-amt">$640</span></div>
          <div class="dv2-bar-bg"><div class="dv2-bar" style="width:17%;background:var(--accent2)"></div></div>
        </div>
        <div class="dv2-cat">
          <div class="dv2-cat-row"><span class="dv2-cat-ic">🚗</span><span class="dv2-cat-nm">Transport</span><span class="dv2-cat-amt">$380</span></div>
          <div class="dv2-bar-bg"><div class="dv2-bar" style="width:10%;background:#FFB800"></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<div class="stats-strip" style="max-width:900px;margin:0 auto;border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="stat-item">
    <div class="stat-num">$2.4T</div>
    <div class="stat-lbl">assets tracked globally</div>
  </div>
  <div class="stat-item">
    <div class="stat-num">47K</div>
    <div class="stat-lbl">AI insights delivered daily</div>
  </div>
  <div class="stat-item">
    <div class="stat-num">3.8×</div>
    <div class="stat-lbl">better savings rate vs average</div>
  </div>
</div>

<!-- FEATURES -->
<section id="features" style="max-width:1100px;margin:0 auto;text-align:center">
  <div class="section-badge">✦ FEATURES</div>
  <h2>Everything your<br>finances need.</h2>
  <p class="section-sub" style="margin:0 auto">One app. Full picture. AI that actually does something with it.</p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(123,92,240,0.12)">⌂</div>
      <h3>Command Centre</h3>
      <p>Net worth, cash, investments, and debt — all in one glanceable dashboard. Updated in real time.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(0,229,180,0.12)">◈</div>
      <h3>Spending Pulse</h3>
      <p>Automatic categorisation of every transaction. Visualise patterns before they become problems.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(123,92,240,0.12)">◎</div>
      <h3>Portfolio Intelligence</h3>
      <p>Live portfolio tracking with allocation analysis and drift detection across all your accounts.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(255,183,0,0.12)">✦</div>
      <h3>BRIM AI</h3>
      <p>Actionable insights — not generic tips. BRIM reads your full picture and tells you exactly what to do.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(0,229,180,0.12)">🌴</div>
      <h3>Goals Tracker</h3>
      <p>Set targets for anything — emergency fund, house, retirement. Track progress and get notified when you drift.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(255,107,107,0.12)">🔒</div>
      <h3>Bank-grade Security</h3>
      <p>256-bit encryption, read-only bank connections, biometric auth. Your data is yours, always.</p>
    </div>
  </div>
</section>

<!-- AI INSIGHTS SHOWCASE -->
<section id="insights" style="padding:100px 40px">
  <div class="insights-section">
    <div class="score-display">
      <div style="font-size:12px;font-weight:700;letter-spacing:3px;color:var(--muted);margin-bottom:16px">FINANCIAL HEALTH SCORE</div>
      <div class="score-ring">
        <div class="score-inner">
          <div class="score-num">84</div>
          <div class="score-label">/ 100</div>
        </div>
      </div>
      <span class="score-tag">Excellent · Top 14% of users</span>
      <p class="score-desc">Your personalised score updates daily based on cash flow, portfolio performance, debt ratio, and goal progress.</p>
    </div>
    <div>
      <div class="section-badge">✦ BRIM AI</div>
      <h2>Insights that<br>actually move<br>the needle.</h2>
      <p class="section-sub" style="margin-bottom:32px">Not generic advice. Real signals from your real data — with one-tap actions.</p>
      <div class="insight-cards">
        <div class="insight-card opportunity">
          <span class="ic-badge opp">↑ OPPORTUNITY</span>
          <h4>Earn 4.8% APY instead of 1.2%</h4>
          <p>Moving $15K to a high-yield savings account would net an extra $540 this year.</p>
          <div class="insight-act opp">Move funds →</div>
        </div>
        <div class="insight-card alert">
          <span class="ic-badge alt">⚠ ALERT</span>
          <h4>Dining spend up 34% this month</h4>
          <p>3 Uber Eats orders account for $180 of your $428 dining spend so far.</p>
          <div class="insight-act alt">See transactions →</div>
        </div>
        <div class="insight-card rebalance">
          <span class="ic-badge reb">◈ REBALANCE</span>
          <h4>Portfolio drift: crypto overweight</h4>
          <p>BTC is 22% of portfolio vs your 15% target. Consider trimming $2.4K.</p>
          <div class="insight-act reb">Rebalance →</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section id="pricing" style="text-align:center;max-width:1100px;margin:0 auto">
  <div class="section-badge">✦ PRICING</div>
  <h2>Simple, transparent pricing.</h2>
  <p class="section-sub" style="margin:0 auto">Start free. Upgrade when BRIM pays for itself — and it will.</p>
  <div class="pricing-grid">
    <div class="pricing-card">
      <div class="plan-name">FREE</div>
      <div class="plan-price">$0<span>/mo</span></div>
      <div class="plan-sub">Always free. No credit card.</div>
      <ul class="plan-features">
        <li>Dashboard + net worth</li>
        <li>Spending tracking (3 categories)</li>
        <li>2 goals</li>
        <li>Weekly AI digest</li>
      </ul>
      <button class="plan-btn ghost">Get started</button>
    </div>
    <div class="pricing-card featured">
      <div class="plan-name">PRO</div>
      <div class="plan-price">$9<span>/mo</span></div>
      <div class="plan-sub">Billed annually · $108/yr</div>
      <ul class="plan-features">
        <li>Everything in Free</li>
        <li>Unlimited spending categories</li>
        <li>Portfolio intelligence</li>
        <li>BRIM AI daily insights</li>
        <li>Unlimited goals</li>
        <li>Financial health score</li>
      </ul>
      <button class="plan-btn primary">Start free trial</button>
    </div>
    <div class="pricing-card">
      <div class="plan-name">FAMILY</div>
      <div class="plan-price">$19<span>/mo</span></div>
      <div class="plan-sub">Up to 5 members</div>
      <ul class="plan-features">
        <li>Everything in Pro</li>
        <li>Shared household dashboard</li>
        <li>Per-member privacy controls</li>
        <li>Joint goal tracking</li>
        <li>Priority support</li>
      </ul>
      <button class="plan-btn ghost">Get started</button>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta-section">
  <h2>Start knowing<br>your money.</h2>
  <p>Join 47,000 people who use BRIM to make their finances work harder.</p>
  <a href="https://ram.zenbin.org/brim-mock" class="btn-primary">Try the interactive mock →</a>
</div>

<footer>
  <div class="footer-logo">✦ BRIM</div>
  <div>© 2026 BRIM — AI Financial Intelligence</div>
  <div>RAM Design Heartbeat · <a href="https://ram.zenbin.org" style="color:var(--accent);text-decoration:none">ram.zenbin.org</a></div>
</footer>

</body>
</html>`;

async function main() {
  // 1. Hero page
  console.log('📄 Publishing hero page…');
  const heroRes = await publish(SLUG, HERO_HTML, `${APP} — ${TAGLINE}`);
  console.log('   Hero:', heroRes.url || JSON.stringify(heroRes).slice(0,100));

  // 2. Viewer page
  console.log('🖥  Publishing viewer…');
  const penJson = fs.readFileSync(path.join(__dirname, 'brim.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BRIM — Pencil Viewer</title>
<script src="https://cdn.zenbin.org/pencil-viewer.js"><\/script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#080810; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  #viewer { width:390px; height:844px; border-radius:44px; overflow:hidden;
    box-shadow: 0 0 80px rgba(123,92,240,0.25), 0 60px 120px rgba(0,0,0,0.6); }
  .back { position:fixed; top:20px; left:20px; color:#7B5CF0; font-family:system-ui;
    font-size:13px; text-decoration:none; background:rgba(15,15,28,0.95);
    padding:8px 16px; border-radius:20px; border:1px solid rgba(123,92,240,0.3); font-weight:700; }
</style>
</head>
<body>
<a class="back" href="https://ram.zenbin.org/brim">← BRIM</a>
<div id="viewer"></div>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#viewer', window.EMBEDDED_PEN);
    }
  });
<\/script>
</body>
</html>`;

  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Design Viewer`);
  console.log('   Viewer:', viewerRes.url || JSON.stringify(viewerRes).slice(0,100));

  // 3. Gallery queue
  console.log('📋 Updating gallery queue…');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

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

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
    app_name: APP,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:  new Date().toISOString(),
    published_at:  new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);
  console.log('   Gallery queue:', putRes.status === 200 ? '✓ OK' : `status ${putRes.status}: ${putRes.body.slice(0, 80)}`);

  console.log('\n✓ Pipeline complete');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);

  return newEntry;
}

main().catch(e => { console.error('Pipeline error:', e); process.exit(1); });
