#!/usr/bin/env node
// scout-publish2.js — hero + viewer using correct zenbin API

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'scout';
const APP_NAME  = 'SCOUT';
const TAGLINE   = 'AI product analytics for indie dev teams';
const SUBDOMAIN = 'ram';
const HOST      = 'zenbin.org';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

// ── Read pen ──────────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'scout.pen'), 'utf8');

// ── Hero Page HTML ────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<meta name="description" content="Scout — AI product analytics for indie dev teams. Know your users. Let AI do the digging.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #F7F5F0;
    --surface: #FFFFFF;
    --text:    #1C1917;
    --muted:   #9B9489;
    --border:  #E2DDD6;
    --accent:  #6B4EFF;
    --accent2: #FF6B35;
    --green:   #16A34A;
    --red:     #DC2626;
    --dim:     #F0EEE9;
    --teal:    #0D9488;
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg); color: var(--text); line-height: 1.6;
    min-height: 100vh; overflow-x: hidden;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 56px;
    background: rgba(247,245,240,0.88);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
  }
  .nav-brand { font-size: 17px; font-weight: 800; letter-spacing: -0.02em; color: var(--text); text-decoration: none; }
  .nav-brand em { font-style: normal; color: var(--accent); }
  .nav-links { display: flex; gap: 24px; list-style: none; }
  .nav-links a { font-size: 14px; color: var(--muted); text-decoration: none; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { padding: 8px 20px; background: var(--accent); color: #fff; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; }
  .nav-cta:hover { opacity: 0.88; }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 100px 24px 80px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 75% 55% at 50% 35%, rgba(107,78,255,0.08) 0%, transparent 65%);
    pointer-events: none;
  }
  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: #EEE9FF; border: 1px solid #D4CDFF;
    border-radius: 100px; padding: 6px 16px; margin-bottom: 28px;
    font-size: 13px; font-weight: 500; color: var(--accent);
  }
  .badge .dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--green);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  h1 {
    font-size: clamp(38px, 7vw, 76px); font-weight: 800;
    letter-spacing: -0.04em; line-height: 1.06; max-width: 760px; margin-bottom: 20px;
  }
  h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: clamp(15px, 2.2vw, 19px); color: var(--muted);
    max-width: 500px; margin-bottom: 38px; line-height: 1.6;
  }
  .cta-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: center; margin-bottom: 28px; }
  .btn-primary {
    padding: 13px 30px; background: var(--accent); color: #fff;
    border-radius: 100px; font-size: 15px; font-weight: 600; text-decoration: none;
    transition: transform 0.15s, opacity 0.15s;
  }
  .btn-primary:hover { transform: translateY(-1px); opacity: 0.9; }
  .btn-ghost {
    padding: 13px 30px; background: var(--surface); color: var(--text);
    border: 1px solid var(--border); border-radius: 100px;
    font-size: 15px; font-weight: 600; text-decoration: none;
    transition: background 0.15s;
  }
  .btn-ghost:hover { background: var(--dim); }
  .install-chip {
    background: #1C1917; color: #A5F3FC;
    border-radius: 10px; padding: 10px 20px;
    font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px;
    cursor: pointer; display: inline-block;
  }
  .install-chip em { font-style: normal; color: #FCD34D; }

  /* METRICS */
  .metrics {
    display: flex; background: var(--surface);
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  }
  .m-item {
    flex: 1; padding: 28px 20px; text-align: center;
    border-right: 1px solid var(--border);
  }
  .m-item:last-child { border-right: none; }
  .m-val { font-size: 32px; font-weight: 800; letter-spacing: -0.03em; }
  .m-val.accent { color: var(--accent); }
  .m-label { font-size: 12px; color: var(--muted); margin-top: 4px; }

  /* SECTION */
  .section { padding: 96px 40px; max-width: 1160px; margin: 0 auto; }
  .section-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
  .section-title { font-size: clamp(26px, 4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 14px; }
  .section-sub { font-size: 16px; color: var(--muted); max-width: 520px; line-height: 1.6; }

  /* SCREENS GRID */
  .screens-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 52px;
  }
  .s-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
    overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
  }
  .s-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.08); }
  .s-card-head {
    padding: 10px 14px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 6px;
  }
  .dots { display: flex; gap: 4px; }
  .dots span { width: 8px; height: 8px; border-radius: 50%; }
  .s-card-name { font-size: 11px; font-weight: 600; color: var(--muted); margin-left: auto; }
  .s-body { padding: 16px; min-height: 260px; display: flex; flex-direction: column; gap: 9px; }

  /* mini mockup pieces */
  .kpi2 { display: flex; gap: 8px; }
  .kpi-box { flex:1; background: var(--dim); border: 1px solid var(--border); border-radius: 9px; padding: 10px; }
  .kv { font-size: 18px; font-weight: 800; color: var(--text); }
  .kl { font-size: 9px; color: var(--muted); margin: 1px 0; }
  .kd { font-size: 9px; font-weight: 600; }
  .up{color:var(--green)} .dn{color:var(--red)}

  .funnel-bar { margin-bottom: 5px; }
  .fb-head { display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); margin-bottom: 2px; }
  .fb-body { height: 16px; background: var(--dim); border-radius: 4px; overflow: hidden; }
  .fb-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; padding-left: 6px; }
  .fb-pct { font-size: 9px; font-weight: 700; color: #fff; }

  .chat-wrap { display: flex; flex-direction: column; gap: 7px; }
  .bubble { padding: 8px 10px; border-radius: 10px; font-size: 10px; line-height: 1.4; max-width: 85%; }
  .bubble.u { background: var(--accent); color: #fff; align-self: flex-end; border-radius: 10px 10px 2px 10px; }
  .bubble.a { background: var(--surface); border: 1px solid var(--border); align-self: flex-start; border-radius: 10px 10px 10px 2px; }

  .sess-list { display: flex; flex-direction: column; gap: 7px; }
  .sess-row { display: flex; align-items: center; gap: 8px; background: var(--dim); border-radius: 8px; padding: 8px; }
  .av { width: 28px; height: 28px; border-radius: 50%; background: #E8E4FF; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--accent); flex-shrink: 0; }
  .si { flex:1; }
  .sn { font-size: 10px; font-weight: 600; }
  .ss { font-size: 9px; color: var(--muted); }
  .nb { font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 8px; }
  .nb.new { background: #D1FAE5; color: var(--green); }
  .nb.upg { background: #FFF3EE; color: var(--accent2); }

  .ev-table { overflow: hidden; border-radius: 8px; background: var(--dim); }
  .ev-head { display: flex; padding: 7px 10px; font-size: 9px; font-weight: 700; color: var(--muted); background: var(--surface3,#E8E5DF); }
  .ev-row { display: flex; align-items: center; padding: 6px 10px; font-size: 9px; }
  .ev-dot { width: 7px; height: 14px; border-radius: 2px; margin-right: 7px; flex-shrink: 0; }
  .ev-name { flex:1; color: var(--text); }
  .ev-cnt { width: 42px; text-align: right; font-weight: 700; color: var(--text); }
  .ev-delta { width: 34px; text-align: right; font-weight: 700; }

  .step-list { display: flex; flex-direction: column; gap: 7px; }
  .step-row { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 9px; border: 1px solid var(--border); }
  .step-num { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .step-label { font-size: 11px; flex: 1; }
  .step-cta { font-size: 8px; font-weight: 700; background: var(--accent); color: #fff; padding: 3px 8px; border-radius: 8px; }

  .ai-chip { display: flex; align-items: center; gap: 6px; background: #EEE9FF; border-radius: 8px; padding: 7px 10px; font-size: 10px; font-weight: 500; color: var(--accent); }

  /* FEATURES */
  .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 52px; }
  .feat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px; }
  .feat-icon { font-size: 24px; margin-bottom: 12px; }
  .feat-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feat-body { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border);
    padding: 28px 40px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: var(--muted); flex-wrap: wrap; gap: 10px;
  }
  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 768px) {
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    .section { padding: 56px 20px; }
    .screens-grid, .feat-grid { grid-template-columns: 1fr; }
    .metrics { flex-wrap: wrap; }
    .m-item { flex: 1 1 50%; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-brand" href="#">SC<em>◉</em>UT</a>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#features">Features</a></li>
  </ul>
  <a class="nav-cta" href="${SLUG}-viewer">Open Prototype →</a>
</nav>

<section class="hero">
  <div class="badge"><span class="dot"></span> AI-powered analytics · April 2026</div>
  <h1>Know your users.<br><em>Let AI do the digging.</em></h1>
  <p class="hero-sub">
    Scout brings Spark-style AI copilot intelligence to indie dev teams — without the enterprise price tag or the 90-day onboarding.
  </p>
  <div class="cta-row">
    <a class="btn-primary" href="${SLUG}-viewer">◉ View Prototype</a>
    <a class="btn-ghost" href="${SLUG}-mock">Interactive Mock →</a>
  </div>
  <div class="install-chip">$ npx <em>@scout/init</em> --project my-app</div>
</section>

<div class="metrics">
  <div class="m-item"><div class="m-val">3,847</div><div class="m-label">Visitors today</div></div>
  <div class="m-item"><div class="m-val accent">+34%</div><div class="m-label">Signups this week</div></div>
  <div class="m-item"><div class="m-val">3.3%</div><div class="m-label">Signup conversion</div></div>
  <div class="m-item"><div class="m-val">$4,210</div><div class="m-label">MRR</div></div>
</div>

<section class="section" id="screens">
  <div class="section-eyebrow">6 Screens · Light Mode</div>
  <h2 class="section-title">Everything a solo founder<br>actually needs</h2>
  <p class="section-sub">From live session streaming to AI-generated funnel insights — Scout surfaces signal, not noise.</p>

  <div class="screens-grid">

    <!-- Today -->
    <div class="s-card">
      <div class="s-card-head">
        <div class="dots"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="s-card-name">Today Overview</div>
      </div>
      <div class="s-body">
        <div class="ai-chip">⚡ Scout AI · signups up 34% since Tuesday</div>
        <div class="kpi2">
          <div class="kpi-box"><div class="kv">3,847</div><div class="kl">Visitors</div><div class="kd up">↑ 12.4%</div></div>
          <div class="kpi-box"><div class="kv">127</div><div class="kl">Signups</div><div class="kd up">↑ 34.0%</div></div>
        </div>
        <div class="kpi2">
          <div class="kpi-box"><div class="kv">28.3%</div><div class="kl">Activation</div><div class="kd dn">↓ 3.1%</div></div>
          <div class="kpi-box"><div class="kv">$4,210</div><div class="kl">MRR</div><div class="kd up">↑ 8.7%</div></div>
        </div>
        <div>
          ${[['page_view','12.4K',92],['signup_completed','127',34],['upgrade_clicked','48',18],['feature_used','893',67]].map(([n,c,p])=>`
          <div class="funnel-bar">
            <div class="fb-head"><span>${n}</span><span style="color:#6B4EFF;font-weight:600">${c}</span></div>
            <div class="fb-body"><div class="fb-fill" style="width:${p}%;background:#6B4EFF"><span class="fb-pct">${p}%</span></div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Funnel -->
    <div class="s-card">
      <div class="s-card-head">
        <div class="dots"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="s-card-name">Funnel Analysis</div>
      </div>
      <div class="s-body">
        <div style="font-size:10px;color:#9B9489;">Signup · Last 7 days · 3.3% overall</div>
        ${[
          ['Landing Page','3,847',100,'#6B4EFF'],
          ['Pricing Page','1,923',50,'#0D9488'],
          ['Signup Started','847',22,'#8B5CF6'],
          ['Email Verified','541',14,'#FF6B35'],
          ['Onboarding Done','127',3.3,'#FF6B35'],
        ].map(([l,n,p,c])=>`
          <div class="funnel-bar">
            <div class="fb-head"><span style="font-weight:500">${l}</span><span style="font-weight:700">${n}</span></div>
            <div class="fb-body"><div class="fb-fill" style="width:${p}%;background:${c}"><span class="fb-pct">${p}%</span></div></div>
          </div>`).join('')}
        <div class="ai-chip" style="margin-top:4px;font-size:9px;">⚡ Adding social proof could reduce 50% drop at step 2</div>
      </div>
    </div>

    <!-- AI -->
    <div class="s-card">
      <div class="s-card-head">
        <div class="dots"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="s-card-name">AI Copilot</div>
      </div>
      <div class="s-body">
        <div class="chat-wrap">
          <div class="bubble u">Why did signups spike on Tuesday?</div>
          <div class="bubble a">Signups on Apr 1 were 34% above average. I traced it to a 2.1× traffic spike on /pricing at 2:14 PM — likely linked to your pricing tweet.</div>
          <div class="bubble u">Which features do activated users use first?</div>
          <div class="bubble a">84% triggered "dashboard_viewed" in 5 min, then "import_csv" (61%) and "invite_teammate" (44%).</div>
        </div>
      </div>
    </div>

    <!-- Sessions -->
    <div class="s-card">
      <div class="s-card-head">
        <div class="dots"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="s-card-name">User Sessions</div>
      </div>
      <div class="s-body">
        <div style="font-size:10px;font-weight:600;color:#16A34A;display:flex;align-items:center;gap:5px;">
          <span style="width:7px;height:7px;border-radius:50%;background:#16A34A;display:inline-block"></span>
          23 users live right now
        </div>
        <div class="sess-list">
          ${[
            ['A','alice@startup.io','upgrade_clicked','new'],
            ['B','bob@demo.co','signup_completed','new'],
            ['C','carol@design.co','feature_used',''],
            ['D','dan@techcorp.com','export_csv',''],
          ].map(([av,u,ev,tag])=>`
            <div class="sess-row">
              <div class="av">${av}</div>
              <div class="si"><div class="sn">${u}</div><div class="ss">${ev}</div></div>
              ${tag==='new'?'<span class="nb new">New</span>':ev==='upgrade_clicked'?'<span class="nb upg">↑ Upg</span>':''}
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Events -->
    <div class="s-card">
      <div class="s-card-head">
        <div class="dots"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="s-card-name">Event Explorer</div>
      </div>
      <div class="s-body">
        <div class="ev-table">
          <div class="ev-head"><span style="flex:1">Event</span><span style="width:42px;text-align:right">Count</span><span style="width:34px;text-align:right">Δ%</span></div>
          ${[
            ['page_view','48.2K','+12%','#6B4EFF'],
            ['signup_completed','892','+34%','#16A34A'],
            ['upgrade_clicked','241','+8%','#FF6B35'],
            ['feature_used','6.1K','-5%','#0D9488'],
            ['invite_teammate','127','+44%','#8B5CF6'],
            ['session_start','3.8K','+15%','#16A34A'],
          ].map(([n,c,d,col],i)=>`
            <div class="ev-row" style="background:${i%2===0?'#fff':'#F7F5F0'}">
              <div class="ev-dot" style="background:${col}"></div>
              <span class="ev-name">${n}</span>
              <span class="ev-cnt">${c}</span>
              <span class="ev-delta" style="color:${d.startsWith('-')?'#DC2626':'#16A34A'}">${d}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Onboarding -->
    <div class="s-card">
      <div class="s-card-head">
        <div class="dots"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="s-card-name">Get Started</div>
      </div>
      <div class="s-body">
        <div style="font-size:10px;color:#9B9489;">2 of 5 steps complete</div>
        <div style="height:6px;background:#E8E5DF;border-radius:3px;">
          <div style="height:100%;width:40%;background:#6B4EFF;border-radius:3px;"></div>
        </div>
        <div class="step-list">
          ${[
            ['Install SDK',true],
            ['Track first event',true],
            ['Set up a funnel',false],
            ['Invite teammate',false],
            ['Connect Scout AI',false],
          ].map(([l,done],i)=>`
            <div class="step-row" style="background:${done?'#F0FDF4':'#F7F5F0'};border-color:${done?'#D1FAE5':'#E2DDD6'}">
              <div class="step-num" style="background:${done?'#D1FAE5':'#E8E5DF'};color:${done?'#16A34A':'#9B9489'}">${done?'✓':i+1}</div>
              <span class="step-label" style="color:${done?'#9B9489':'#1C1917'};font-weight:${done?400:600}">${l}</span>
              ${!done?'<div class="step-cta">Set up</div>':''}
            </div>`).join('')}
        </div>
        <div style="background:#1C1917;border-radius:8px;padding:8px 12px;font-family:monospace;font-size:10px;">
          <span style="color:#9B9489"># install</span><br>
          <span style="color:#A5F3FC">npm install</span> <span style="color:#FCD34D">@scout/sdk</span>
        </div>
      </div>
    </div>

  </div>
</section>

<section class="section" id="features" style="border-top:1px solid var(--border);">
  <div class="section-eyebrow">Why Scout</div>
  <h2 class="section-title">Built for founders,<br>not analysts</h2>
  <p class="section-sub">Stop drowning in dashboards. Scout tells you what matters — and why it changed.</p>

  <div class="feat-grid">
    <div class="feat-card"><div class="feat-icon">⚡</div><div class="feat-title">AI Copilot</div><div class="feat-body">Ask questions in plain English. Scout traces spikes, drops, and patterns back to specific events instantly — no SQL required.</div></div>
    <div class="feat-card"><div class="feat-icon">◎</div><div class="feat-title">Live Sessions</div><div class="feat-body">Watch users navigate your product in real-time. See who's about to upgrade and understand exactly what nudged them.</div></div>
    <div class="feat-card"><div class="feat-icon">▽</div><div class="feat-title">Smart Funnels</div><div class="feat-body">Build a funnel in seconds. Scout highlights your biggest dropoff and suggests the most likely fix automatically.</div></div>
    <div class="feat-card"><div class="feat-icon">◈</div><div class="feat-title">Event Explorer</div><div class="feat-body">Every event tracked, ranked by volume and trend. Spot emerging behaviour before it shows in your weekly metrics.</div></div>
    <div class="feat-card"><div class="feat-icon">◑</div><div class="feat-title">Light + Dark</div><div class="feat-body">Warm off-white by day, deep mode by night. Scout adapts to how you work — system preference or manual toggle.</div></div>
    <div class="feat-card"><div class="feat-icon">⊞</div><div class="feat-title">MCP Ready</div><div class="feat-body">Connect Scout to your AI agent via MCP. Ask your LLM about signups and get live product data straight from your codebase.</div></div>
  </div>
</section>

<footer>
  <div>SC◉UT — <a href="${SLUG}-viewer">View Prototype</a> · <a href="${SLUG}-mock">Interactive Mock</a></div>
  <div>RAM Design Heartbeat · April 4, 2026 · Inspired by Mixpanel on godly.website</div>
</footer>

</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer-template.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ────────────────────────────────────────────────────────────────────
async function run() {
  console.log('Publishing hero page…');
  const r1 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG }, { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN });
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,120));

  console.log('Publishing viewer…');
  const r2 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' }, { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN });
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,120));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
