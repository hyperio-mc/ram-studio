/**
 * PRISM — Publish Hero Page + Viewer
 * Content performance intelligence for creators & media teams
 */
const fs   = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'prism';
const APP_NAME = 'PRISM';
const TAGLINE  = 'Clarity in every signal';

// ─── Zenbin publish helper ────────────────────────────────────────────────────
function publishRaw(slug, html, title, subdomain) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title: title || slug, html }));
    const headers = {
      'Content-Type':   'application/json',
      'Content-Length': body.length,
    };
    if (subdomain) headers['X-Subdomain'] = subdomain;
    const req = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}?overwrite=true`,
      method:   'POST',
      headers,
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Hero Page HTML ───────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PRISM — Clarity in every signal</title>
  <meta name="description" content="Content performance intelligence for creators and media teams. Know which content resonates, when, and why.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:        #080A12;
      --surface:   #111420;
      --glass:     #1A1E2E;
      --text:      #E8E4F4;
      --faded:     rgba(232,228,244,0.45);
      --violet:    #7B50FF;
      --violet-s:  rgba(123,80,255,0.20);
      --coral:     #FF4D7E;
      --seafoam:   #3EEFC8;
      --amber:     #FFB347;
      --border:    rgba(255,255,255,0.07);
      --glass-b:   rgba(255,255,255,0.10);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    nav {
      position: fixed; top: 0; left: 0; right: 0; height: 64px;
      background: rgba(8,10,18,0.85); backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px; z-index: 100;
    }
    .nav-logo { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 800; letter-spacing: 0.12em; }
    .nm { display: flex; gap: 3px; align-items: center; }
    .nsq { width: 9px; height: 9px; border-radius: 2px; }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { font-size: 13px; color: var(--faded); text-decoration: none; transition: color 0.2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta { background: var(--violet); color: #fff; padding: 10px 22px; border-radius: 24px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
    .nav-cta:hover { background: #9370FF; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(123,80,255,0.4); }
    .hero {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 120px 48px 80px; text-align: center; position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(123,80,255,0.15) 0%, transparent 70%);
      top: 10%; left: 50%; transform: translateX(-50%); pointer-events: none;
    }
    .hero::after {
      content: ''; position: absolute;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(255,77,126,0.10) 0%, transparent 70%);
      top: 40%; right: 10%; pointer-events: none;
    }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(123,80,255,0.15); border: 1px solid rgba(123,80,255,0.35);
      padding: 7px 18px; border-radius: 24px;
      font-size: 12px; font-weight: 600; color: var(--violet);
      margin-bottom: 32px; letter-spacing: 0.06em; text-transform: uppercase;
      position: relative; z-index: 1;
    }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--seafoam); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
    h1 {
      font-size: clamp(48px, 8vw, 96px); font-weight: 800;
      line-height: 1.02; letter-spacing: -0.035em;
      max-width: 900px; margin-bottom: 28px; position: relative; z-index: 1;
    }
    h1 .grad {
      background: linear-gradient(135deg, var(--violet) 0%, var(--coral) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .hero-sub { font-size: 18px; color: var(--faded); max-width: 540px; line-height: 1.65; margin-bottom: 48px; position: relative; z-index: 1; }
    .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1; }
    .btn-primary {
      background: var(--violet); color: #fff; padding: 16px 38px; border-radius: 32px;
      font-size: 15px; font-weight: 700; text-decoration: none; transition: all 0.25s;
      display: inline-flex; align-items: center; gap: 8px;
      box-shadow: 0 4px 24px rgba(123,80,255,0.35);
    }
    .btn-primary:hover { background: #9370FF; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(123,80,255,0.45); }
    .btn-secondary {
      background: rgba(255,255,255,0.05); color: var(--text);
      border: 1px solid var(--glass-b); padding: 16px 38px; border-radius: 32px;
      font-size: 15px; font-weight: 600; text-decoration: none; transition: all 0.25s; backdrop-filter: blur(8px);
    }
    .btn-secondary:hover { border-color: var(--violet); transform: translateY(-2px); }
    .waveform-section { padding: 60px 48px 80px; display: flex; flex-direction: column; align-items: center; }
    .waveform-label { font-size: 11px; font-weight: 600; letter-spacing: 0.10em; color: var(--faded); text-transform: uppercase; margin-bottom: 20px; }
    .waveform-card { background: var(--glass); border: 1px solid var(--glass-b); border-radius: 28px; padding: 32px 32px 20px; max-width: 760px; width: 100%; }
    .waveform-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .waveform-header h3 { font-size: 14px; font-weight: 600; color: var(--faded); }
    .live-badge { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--seafoam); }
    .waveform-bars { display: flex; align-items: flex-end; gap: 5px; height: 80px; }
    .wbar { flex: 1; border-radius: 3px 3px 2px 2px; }
    .day-labels { display: flex; justify-content: space-between; margin-top: 12px; }
    .day-labels span { font-size: 10px; color: var(--faded); }
    .features { padding: 80px 48px; max-width: 1140px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 56px; }
    .section-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: var(--violet); text-transform: uppercase; margin-bottom: 12px; }
    .section-title { font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.12; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
    .feature-card {
      background: var(--glass); border-radius: 20px; padding: 28px;
      border: 1px solid var(--border); transition: transform 0.2s, border-color 0.2s;
      position: relative; overflow: hidden;
    }
    .feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0; transition: opacity 0.3s; }
    .feature-card:hover { transform: translateY(-4px); border-color: var(--glass-b); }
    .feature-card:hover::before { opacity: 1; }
    .feature-card.av::before { background: var(--violet); }
    .feature-card.ac::before { background: var(--coral);  }
    .feature-card.as::before { background: var(--seafoam); }
    .feature-card.aa::before { background: var(--amber);  }
    .feature-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
    .feature-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
    .feature-card p { font-size: 13px; color: var(--faded); line-height: 1.65; }
    .stats-bar {
      background: var(--glass); border: 1px solid var(--glass-b); border-radius: 28px;
      padding: 40px; max-width: 900px; margin: 0 auto 80px;
      display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 20px;
    }
    .stat-val {
      font-size: 38px; font-weight: 800;
      background: linear-gradient(135deg, var(--violet), var(--coral));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 6px;
    }
    .stat-label { font-size: 12px; color: var(--faded); letter-spacing: 0.04em; }
    .screens-section { padding: 80px 48px; overflow: hidden; }
    .screens-scroll { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; scrollbar-width: none; }
    .screens-scroll::-webkit-scrollbar { display: none; }
    .screen-card { flex-shrink: 0; background: var(--glass); border-radius: 24px; width: 200px; padding: 16px; border: 1px solid var(--border); transition: border-color 0.2s, transform 0.2s; }
    .screen-card:hover { border-color: var(--glass-b); transform: translateY(-3px); }
    .screen-name { font-size: 11px; font-weight: 600; color: var(--faded); margin-top: 10px; text-align: center; text-transform: uppercase; letter-spacing: 0.06em; }
    .phone-mini { width: 168px; height: 310px; background: var(--bg); border-radius: 16px; overflow: hidden; position: relative; }
    .phone-mini-nav { background: var(--surface); height: 28px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 10px; gap: 5px; }
    .nsq2 { width: 6px; height: 6px; border-radius: 1px; }
    .cta-section { padding: 80px 48px; text-align: center; }
    .cta-box {
      background: linear-gradient(135deg, rgba(123,80,255,0.15) 0%, rgba(255,77,126,0.10) 100%);
      border: 1px solid rgba(123,80,255,0.25); border-radius: 36px;
      padding: 72px 48px; max-width: 760px; margin: 0 auto; position: relative; overflow: hidden;
    }
    .cta-box::before {
      content: ''; position: absolute; width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, rgba(123,80,255,0.12) 0%, transparent 70%);
      top: -100px; left: 50%; transform: translateX(-50%); pointer-events: none;
    }
    .cta-box h2 { font-size: clamp(28px,4vw,46px); font-weight: 800; color: var(--text); margin-bottom: 16px; letter-spacing: -0.025em; position: relative; z-index: 1; }
    .cta-box h2 span { background: linear-gradient(135deg,var(--violet),var(--coral)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .cta-box p { font-size: 16px; color: var(--faded); margin-bottom: 40px; position: relative; z-index: 1; }
    .cta-box .btn-primary { position: relative; z-index: 1; }
    footer { border-top: 1px solid var(--border); padding: 32px 48px; display: flex; justify-content: space-between; align-items: center; max-width: 1140px; margin: 0 auto; }
    footer p { font-size: 12px; color: var(--faded); }
    footer a { color: var(--violet); text-decoration: none; font-weight: 600; }
    @media (max-width: 640px) {
      nav { padding: 0 20px; } .nav-links { display: none; }
      .hero, .features, .screens-section, .waveform-section { padding-left: 20px; padding-right: 20px; }
      .stats-bar { grid-template-columns: repeat(2,1fr); padding: 28px 20px; }
      footer { flex-direction: column; gap: 12px; text-align: center; }
    }
  </style>
</head>
<body>
<nav>
  <div class="nav-logo">
    <div class="nm">
      <div class="nsq" style="background:var(--violet)"></div>
      <div class="nsq" style="background:var(--coral);width:5px;height:5px;align-self:flex-end"></div>
    </div>
    PRISM
  </div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/prism-mock">Mock →</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/prism-mock">Try Mock ↗</a>
</nav>

<section class="hero">
  <div class="hero-eyebrow"><span class="live-dot"></span>Content Intelligence · Design Prototype</div>
  <h1>Every signal,<br><span class="grad">finally clear</span></h1>
  <p class="hero-sub">PRISM surfaces which content resonates, when your audience is most reachable, and what turns a passive view into a loyal subscriber — all in one intelligent dark dashboard.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/prism-viewer">View Design ↗</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/prism-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<section class="waveform-section">
  <div class="waveform-label">Weekly signal strength · 7 days</div>
  <div class="waveform-card">
    <div class="waveform-header">
      <h3>Engagement Waveform</h3>
      <div class="live-badge"><div class="live-dot"></div>Live</div>
    </div>
    <div class="waveform-bars" id="wave-bars"></div>
    <div class="day-labels">
      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-header">
    <div class="section-eyebrow">What PRISM does</div>
    <h2 class="section-title">Intelligence that surfaces<br>what actually matters</h2>
  </div>
  <div class="features-grid">
    <div class="feature-card av">
      <div class="feature-icon" style="background:rgba(123,80,255,0.18);color:var(--violet)">◈</div>
      <h3>Signal Dashboard</h3>
      <p>Total reach, share velocity, and conversion rate — surfaced in glass cards with live sparklines and trend arrows.</p>
    </div>
    <div class="feature-card ac">
      <div class="feature-icon" style="background:rgba(255,77,126,0.18);color:var(--coral)">⊞</div>
      <h3>Content Library</h3>
      <p>Every piece scored, ranked, and tagged. See which episodes and articles are pulling weight — and which need a push.</p>
    </div>
    <div class="feature-card as">
      <div class="feature-icon" style="background:rgba(62,239,200,0.16);color:var(--seafoam)">◎</div>
      <h3>Audience Segments</h3>
      <p>Three behavioral clusters — Creators, Builders, Learners — with resonance overlap as a concentric ring map.</p>
    </div>
    <div class="feature-card aa">
      <div class="feature-icon" style="background:rgba(255,179,71,0.18);color:var(--amber)">⌁</div>
      <h3>Engagement Peaks</h3>
      <p>A live waveform and day/hour heatmap shows your power publishing windows. Thu 6–8PM is 3.2× more effective.</p>
    </div>
  </div>
</section>

<div style="padding: 0 48px;">
  <div class="stats-bar">
    <div><div class="stat-val">2.4M</div><div class="stat-label">Weekly Reach</div></div>
    <div><div class="stat-val">+18%</div><div class="stat-label">Trend Up</div></div>
    <div><div class="stat-val">Thu 7PM</div><div class="stat-label">Peak Window</div></div>
    <div><div class="stat-val">8.2%</div><div class="stat-label">Convert Rate</div></div>
  </div>
</div>

<section class="screens-section" id="screens">
  <div class="section-header" style="margin-bottom:32px;">
    <div class="section-eyebrow">5 Screens</div>
    <h2 class="section-title">Designed end-to-end</h2>
  </div>
  <div class="screens-scroll">
    <div class="screen-card">
      <div class="phone-mini">
        <div class="phone-mini-nav"><div class="nsq2" style="background:#7B50FF"></div><div style="font-size:7px;font-weight:800;color:#7B50FF;letter-spacing:0.12em;margin-left:2px">PRISM</div></div>
        <div style="padding:8px;display:flex;flex-direction:column;gap:5px;">
          <div style="height:12px;background:rgba(255,255,255,0.08);border-radius:3px;width:55%"></div>
          <div style="height:44px;background:rgba(123,80,255,0.15);border-radius:8px;margin-top:4px;border:1px solid rgba(123,80,255,0.25)"></div>
          <div style="display:flex;gap:4px;margin-top:2px;">
            <div style="flex:1;height:38px;background:rgba(255,255,255,0.06);border-radius:7px;border:1px solid rgba(255,255,255,0.07)"></div>
            <div style="flex:1;height:38px;background:rgba(255,255,255,0.06);border-radius:7px;border:1px solid rgba(255,255,255,0.07)"></div>
          </div>
        </div>
      </div>
      <div class="screen-name">Signal</div>
    </div>
    <div class="screen-card">
      <div class="phone-mini">
        <div class="phone-mini-nav"><div class="nsq2" style="background:#FF4D7E"></div><div style="font-size:7px;font-weight:800;color:#FF4D7E;letter-spacing:0.12em;margin-left:2px">PRISM</div></div>
        <div style="padding:8px;display:flex;flex-direction:column;gap:4px;margin-top:4px;">
          <div style="height:42px;background:rgba(255,255,255,0.06);border-radius:8px;border-left:3px solid #7B50FF"></div>
          <div style="height:42px;background:rgba(255,255,255,0.06);border-radius:8px;border-left:3px solid #FF4D7E"></div>
          <div style="height:42px;background:rgba(255,255,255,0.06);border-radius:8px;border-left:3px solid #3EEFC8"></div>
        </div>
      </div>
      <div class="screen-name">Content</div>
    </div>
    <div class="screen-card">
      <div class="phone-mini">
        <div class="phone-mini-nav"><div class="nsq2" style="background:#3EEFC8"></div><div style="font-size:7px;font-weight:800;color:#3EEFC8;letter-spacing:0.12em;margin-left:2px">PRISM</div></div>
        <div style="padding:8px;display:flex;flex-direction:column;align-items:center;margin-top:12px;">
          <div style="width:80px;height:80px;border-radius:50%;background:rgba(123,80,255,0.18);border:1px solid rgba(123,80,255,0.3);display:flex;align-items:center;justify-content:center;">
            <div style="width:56px;height:56px;border-radius:50%;background:rgba(123,80,255,0.28);display:flex;align-items:center;justify-content:center;">
              <div style="width:30px;height:30px;border-radius:50%;background:rgba(123,80,255,0.5)"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="screen-name">Audience</div>
    </div>
    <div class="screen-card">
      <div class="phone-mini">
        <div class="phone-mini-nav"><div class="nsq2" style="background:#FFB347"></div><div style="font-size:7px;font-weight:800;color:#FFB347;letter-spacing:0.12em;margin-left:2px">PRISM</div></div>
        <div style="padding:8px;">
          <div style="display:flex;align-items:flex-end;gap:2px;height:60px;margin-top:8px;">
            <div style="flex:1;background:#3EEFC8;height:28px;border-radius:2px;opacity:0.7"></div>
            <div style="flex:1;background:#3EEFC8;height:36px;border-radius:2px;opacity:0.75"></div>
            <div style="flex:1;background:#7B50FF;height:42px;border-radius:2px;opacity:0.75"></div>
            <div style="flex:1;background:#7B50FF;height:54px;border-radius:2px;opacity:0.85"></div>
            <div style="flex:1;background:#FF4D7E;height:58px;border-radius:2px;opacity:0.9"></div>
            <div style="flex:1;background:#FF4D7E;height:60px;border-radius:2px;opacity:1.0"></div>
            <div style="flex:1;background:#FF4D7E;height:50px;border-radius:2px;opacity:0.85"></div>
          </div>
        </div>
      </div>
      <div class="screen-name">Peaks</div>
    </div>
    <div class="screen-card">
      <div class="phone-mini">
        <div class="phone-mini-nav"><div class="nsq2" style="background:#7B50FF"></div><div style="font-size:7px;font-weight:800;color:#7B50FF;letter-spacing:0.12em;margin-left:2px">PRISM</div></div>
        <div style="padding:8px;display:flex;flex-direction:column;gap:4px;margin-top:4px;">
          <div style="height:55px;background:rgba(123,80,255,0.15);border-radius:8px;border:1px solid rgba(123,80,255,0.25);border-top:2px solid #7B50FF"></div>
          <div style="height:32px;background:rgba(255,255,255,0.06);border-radius:7px;border:1px solid rgba(255,255,255,0.07)"></div>
          <div style="height:32px;background:rgba(255,255,255,0.06);border-radius:7px;border:1px solid rgba(255,255,255,0.07)"></div>
        </div>
      </div>
      <div class="screen-name">Insights</div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="cta-box">
    <h2>See your content<br><span>through PRISM</span></h2>
    <p>Interactive prototype — light and dark modes, all 5 screens, live navigation.</p>
    <a class="btn-primary" href="https://ram.zenbin.org/prism-mock">Open Interactive Mock ↗</a>
  </div>
</section>

<footer>
  <p>PRISM · RAM Design Heartbeat · <a href="https://ram.zenbin.org/prism-viewer">View .pen ↗</a></p>
  <p>Inspired by Fluid Glass (awwwards.com) · Format Podcasts (darkmodedesign.com) · land-book.com</p>
</footer>

<script>
const bars = document.getElementById('wave-bars');
if (bars) {
  const vals = [0.38,0.52,0.45,0.68,0.62,0.78,0.72,0.88,0.82,0.95,0.90,0.65,0.58,0.48,0.40,0.55,0.50,0.70,0.65,0.85,0.80,1.0,0.95,0.68,0.60,0.50,0.42,0.38];
  vals.forEach((v, i) => {
    const t = i/vals.length;
    const col = t < 0.35 ? '#3EEFC8' : t < 0.65 ? '#7B50FF' : '#FF4D7E';
    const bar = document.createElement('div');
    bar.className = 'wbar';
    bar.style.height = (v * 72) + 'px';
    bar.style.background = col;
    bar.style.opacity = 0.35 + v * 0.6;
    bars.appendChild(bar);
  });
}
</script>
</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PRISM — Design Viewer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#080A12;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;padding:40px 20px;min-height:100vh}
    .viewer-header{text-align:center;margin-bottom:40px}
    .viewer-header h1{font-size:32px;font-weight:800;letter-spacing:-0.02em;color:#E8E4F4}
    .viewer-header h1 span{background:linear-gradient(135deg,#7B50FF,#FF4D7E);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .viewer-header p{color:rgba(232,228,244,0.45);font-size:14px;margin-top:8px}
    .screens-container{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;max-width:1400px}
    .screen-wrap{display:flex;flex-direction:column;align-items:center;gap:12px}
    .screen-label{font-size:11px;font-weight:600;color:rgba(232,228,244,0.45);letter-spacing:0.08em;text-transform:uppercase}
    .phone-frame{
      width:390px;height:848px;background:#080A12;border-radius:48px;
      border:8px solid #1A1E2E;overflow:hidden;
      box-shadow:0 24px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.07);
      flex-shrink:0;
    }
    canvas{display:block}
    .back-link{margin-top:40px;color:rgba(232,228,244,0.45);font-size:13px;text-decoration:none}
    .back-link:hover{color:#7B50FF}
  </style>
</head>
<body>
<div class="viewer-header">
  <h1><span>PRISM</span> — Design Viewer</h1>
  <p>Pencil.dev prototype · 5 screens · Dark theme</p>
</div>
<div class="screens-container" id="screens-container">
  <p style="color:rgba(232,228,244,0.45)">Loading screens...</p>
</div>
<a class="back-link" href="https://ram.zenbin.org/prism">← Back to overview</a>
<script>
window.EMBEDDED_PEN = null;
</script>
<script>
(function() {
  const penData = window.EMBEDDED_PEN;
  if (!penData) {
    document.getElementById('screens-container').innerHTML = '<p style="color:#FF4D7E">No pen data embedded.</p>';
    return;
  }
  let pen;
  try { pen = typeof penData === 'string' ? JSON.parse(penData) : penData; } catch(e) { return; }
  const container = document.getElementById('screens-container');
  container.innerHTML = '';
  (pen.artboards || []).forEach(screen => {
    const wrap = document.createElement('div');
    wrap.className = 'screen-wrap';
    const label = document.createElement('div');
    label.className = 'screen-label';
    label.textContent = screen.name;
    wrap.appendChild(label);
    const frame = document.createElement('div');
    frame.className = 'phone-frame';
    const canvas = document.createElement('canvas');
    canvas.width = 390; canvas.height = 848;
    canvas.style.width = '374px'; canvas.style.height = '832px';
    frame.appendChild(canvas);
    wrap.appendChild(frame);
    container.appendChild(wrap);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = screen.backgroundColor || '#080A12';
    ctx.fillRect(0,0,390,848);
    (screen.elements || []).forEach(el => {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;
      if (el.type === 'rect') {
        ctx.fillStyle = el.fill || '#1A1E2E';
        const r = el.rx || 0;
        if (r > 0) {
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(el.x, el.y, el.w, el.h, r);
          } else {
            const {x,y,w,h} = el;
            ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
            ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
            ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
            ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
            ctx.closePath();
          }
          ctx.fill();
          if (el.stroke) { ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth||1; ctx.stroke(); }
        } else {
          ctx.fillRect(el.x, el.y, el.w, el.h);
        }
      } else if (el.type === 'circle') {
        ctx.beginPath();
        ctx.arc(el.cx, el.cy, el.r, 0, Math.PI*2);
        ctx.fillStyle = el.fill || 'transparent';
        ctx.fill();
        if (el.stroke) { ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth||1; ctx.stroke(); }
      } else if (el.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(el.x1,el.y1); ctx.lineTo(el.x2,el.y2);
        ctx.strokeStyle = el.stroke || 'rgba(255,255,255,0.07)';
        ctx.lineWidth = el.strokeWidth || 1;
        if (el.dashArray) { const p=String(el.dashArray).split(',').map(Number); ctx.setLineDash(p); }
        ctx.stroke(); ctx.setLineDash([]);
      } else if (el.type === 'text') {
        ctx.font = \`\${el.fontWeight||400} \${el.fontSize||14}px '\${el.fontFamily||'Inter'}', sans-serif\`;
        ctx.fillStyle = el.fill || '#E8E4F4';
        ctx.textAlign = el.align || 'left';
        ctx.fillText(el.text, el.x, el.y);
      }
      ctx.restore();
    });
  });
})();
</script>
</body>
</html>`;

async function main() {
  const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  const viewerHtml = viewerTemplate.replace(
    '<script>\nwindow.EMBEDDED_PEN = null;\n</script>',
    injection + '\n<script>\nwindow.EMBEDDED_PEN = null;\n</script>'
  );

  async function pub(slug, html, title) {
    let res = await publishRaw(slug, html, title, 'ram');
    if (res.status === 200 || res.status === 201) {
      console.log(`  ✓ ${slug} → https://ram.zenbin.org/${slug} (${res.status})`);
      return `https://ram.zenbin.org/${slug}`;
    }
    console.log(`  ↳ subdomain returned ${res.status}, trying fallback…`);
    res = await publishRaw(slug, html, title, null);
    if (res.status === 200 || res.status === 201) {
      console.log(`  ✓ ${slug} → https://zenbin.org/p/${slug} (${res.status}) [fallback]`);
      return `https://zenbin.org/p/${slug}`;
    }
    console.error(`  ✗ ${slug} failed: ${res.status} — ${res.body.slice(0,200)}`);
    return `https://ram.zenbin.org/${slug}`;
  }

  console.log('\nPublishing PRISM hero page…');
  const heroUrl = await pub(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);

  console.log('Publishing PRISM viewer…');
  const viewerUrl = await pub(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Viewer`);

  console.log('\nDone!');
  console.log('  Hero:  ', heroUrl);
  console.log('  Viewer:', viewerUrl);
}

main().catch(console.error);
