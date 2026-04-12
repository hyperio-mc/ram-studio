'use strict';
// scout-publish.js — publish hero page + viewer for SCOUT

const fs   = require('fs');
const path = require('path');
const http = require('http');

const SLUG = 'scout';
const APP_NAME = 'SCOUT';
const TAGLINE  = 'AI product analytics for indie dev teams';

// ── Read pen ──────────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'scout.pen'), 'utf8');

// ── Publish helper ────────────────────────────────────────────────────────────
function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = http.request({
      hostname: 'zenbin.org',
      port: 80,
      path: '/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
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

// ── Hero Page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
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
    --dim:     #F0EEE9;
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 40px;
    background: rgba(247,245,240,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; color: var(--text); text-decoration: none; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    padding: 9px 22px; background: var(--accent); color: #fff;
    border-radius: 100px; font-size: 14px; font-weight: 600;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(107,78,255,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: #EEE9FF; border: 1px solid #D4CDFF;
    border-radius: 100px; padding: 6px 16px;
    font-size: 13px; font-weight: 500; color: var(--accent);
    margin-bottom: 28px;
  }
  .hero-badge .dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--green);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  h1 {
    font-size: clamp(40px, 7vw, 80px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.05;
    max-width: 800px;
    margin-bottom: 20px;
  }
  h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: clamp(16px, 2.5vw, 20px);
    color: var(--muted);
    max-width: 520px;
    margin-bottom: 40px;
    line-height: 1.55;
  }
  .cta-row { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; justify-content: center; }
  .btn-primary {
    padding: 14px 32px; background: var(--accent); color: #fff;
    border-radius: 100px; font-size: 16px; font-weight: 600;
    text-decoration: none; transition: transform 0.15s, opacity 0.15s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { transform: translateY(-1px); opacity: 0.9; }
  .btn-secondary {
    padding: 14px 32px; background: var(--surface); color: var(--text);
    border: 1px solid var(--border); border-radius: 100px;
    font-size: 16px; font-weight: 600; text-decoration: none;
    transition: background 0.15s;
  }
  .btn-secondary:hover { background: var(--dim); }
  .install-chip {
    margin-top: 24px;
    background: #1C1917; color: #A5F3FC;
    border-radius: 10px; padding: 10px 20px;
    font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px;
    display: inline-block; cursor: pointer;
  }
  .install-chip span { color: #FCD34D; }

  /* METRICS BAR */
  .metrics-bar {
    display: flex; gap: 0; border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
  }
  .metric-item {
    flex: 1; padding: 28px 24px; text-align: center;
    border-right: 1px solid var(--border);
  }
  .metric-item:last-child { border-right: none; }
  .metric-value { font-size: 36px; font-weight: 800; letter-spacing: -0.03em; color: var(--text); }
  .metric-value span { color: var(--accent); }
  .metric-label { font-size: 13px; color: var(--muted); margin-top: 4px; }

  /* SCREENS SECTION */
  .section { padding: 100px 40px; max-width: 1200px; margin: 0 auto; }
  .section-label {
    font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--accent); margin-bottom: 12px;
  }
  .section-title {
    font-size: clamp(28px, 4vw, 46px); font-weight: 800;
    letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 16px;
  }
  .section-sub { font-size: 17px; color: var(--muted); max-width: 560px; line-height: 1.55; }

  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 56px;
  }
  .screen-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .screen-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
  .screen-card-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
  }
  .dot-row { display: flex; gap: 5px; }
  .dot-row span { width: 8px; height: 8px; border-radius: 50%; }
  .screen-card-label { font-size: 11px; font-weight: 600; color: var(--muted); margin-left: auto; }
  .screen-mockup {
    padding: 20px;
    min-height: 280px;
    display: flex; flex-direction: column; gap: 10px;
  }

  /* Mockup elements */
  .mock-kpi-row { display: flex; gap: 8px; }
  .mock-kpi {
    flex: 1; background: var(--dim); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px;
  }
  .mock-kpi-val { font-size: 20px; font-weight: 800; color: var(--text); }
  .mock-kpi-label { font-size: 10px; color: var(--muted); margin-top: 2px; }
  .mock-kpi-delta { font-size: 10px; font-weight: 600; }
  .up { color: var(--green); } .down { color: #DC2626; }

  .mock-bar-row { display: flex; flex-direction: column; gap: 6px; }
  .mock-bar-item { display: flex; flex-direction: column; gap: 3px; }
  .mock-bar-label { font-size: 10px; color: var(--muted); display: flex; justify-content: space-between; }
  .mock-bar { height: 6px; border-radius: 3px; background: var(--dim); }
  .mock-bar-fill { height: 100%; border-radius: 3px; background: var(--accent); }

  .mock-chat { display: flex; flex-direction: column; gap: 8px; }
  .mock-bubble {
    padding: 10px 12px; border-radius: 12px;
    font-size: 11px; line-height: 1.4; max-width: 85%;
  }
  .mock-bubble.user { background: var(--accent); color: #fff; align-self: flex-end; border-radius: 12px 12px 2px 12px; }
  .mock-bubble.ai { background: var(--surface); border: 1px solid var(--border); align-self: flex-start; border-radius: 12px 12px 12px 2px; }

  .mock-session-list { display: flex; flex-direction: column; gap: 8px; }
  .mock-session {
    display: flex; align-items: center; gap: 10px;
    background: var(--dim); border-radius: 10px; padding: 10px;
  }
  .mock-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #E8E4FF; display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: var(--accent); flex-shrink: 0;
  }
  .mock-session-info { flex: 1; }
  .mock-session-name { font-size: 11px; font-weight: 600; color: var(--text); }
  .mock-session-sub { font-size: 10px; color: var(--muted); }
  .mock-badge { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
  .mock-badge.new { background: #D1FAE5; color: var(--green); }
  .mock-badge.upgrade { background: #FFF3EE; color: var(--accent2); }

  .mock-ai-badge {
    display: flex; align-items: center; gap: 6px;
    background: #EEE9FF; border-radius: 8px; padding: 8px 10px;
    font-size: 10px; font-weight: 500; color: var(--accent);
  }
  .zap { font-size: 12px; }

  /* FEATURES */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 56px;
  }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
  }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--dim); display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .feature-body { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px 40px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px; color: var(--muted);
    flex-wrap: wrap; gap: 12px;
  }
  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 768px) {
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
    .section { padding: 60px 20px; }
    .screens-grid { grid-template-columns: 1fr; }
    .features-grid { grid-template-columns: 1fr; }
    .metrics-bar { flex-wrap: wrap; }
    .metric-item { flex: 1 1 50%; border-right: 1px solid var(--border); }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">SC<span>◉</span>UT</a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="${SLUG}-viewer">View Design</a></li>
  </ul>
  <a class="nav-cta" href="${SLUG}-viewer">Open Prototype →</a>
</nav>

<section class="hero">
  <div class="hero-badge"><span class="dot"></span> AI-powered analytics</div>
  <h1>Know your users.<br><em>Let AI do the digging.</em></h1>
  <p class="hero-sub">
    Scout brings Spark-style AI copilot intelligence to indie dev teams — without the enterprise price tag or the 90-day onboarding.
  </p>
  <div class="cta-row">
    <a class="btn-primary" href="${SLUG}-viewer">
      ◉ View Prototype
    </a>
    <a class="btn-secondary" href="${SLUG}-mock">Interactive Mock →</a>
  </div>
  <div class="install-chip">$ npx <span>@scout/init</span> --project my-app</div>
</section>

<div class="metrics-bar">
  <div class="metric-item">
    <div class="metric-value">3,847</div>
    <div class="metric-label">Visitors today</div>
  </div>
  <div class="metric-item">
    <div class="metric-value"><span>+34%</span></div>
    <div class="metric-label">Signups this week</div>
  </div>
  <div class="metric-item">
    <div class="metric-value">3.3%</div>
    <div class="metric-label">Signup conversion</div>
  </div>
  <div class="metric-item">
    <div class="metric-value">$4,210</div>
    <div class="metric-label">Monthly revenue</div>
  </div>
</div>

<section class="section" id="screens">
  <div class="section-label">6 Screens</div>
  <h2 class="section-title">Everything a solo founder<br>actually needs</h2>
  <p class="section-sub">From live session streaming to AI-generated funnel insights — Scout surfaces signal, not noise.</p>

  <div class="screens-grid">

    <!-- Today Overview -->
    <div class="screen-card">
      <div class="screen-card-header">
        <div class="dot-row"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="screen-card-label">Today Overview</div>
      </div>
      <div class="screen-mockup">
        <div class="mock-ai-badge"><span class="zap">⚡</span> Scout AI · signups up 34% since last Tues</div>
        <div class="mock-kpi-row">
          <div class="mock-kpi">
            <div class="mock-kpi-val">3,847</div>
            <div class="mock-kpi-label">Visitors</div>
            <div class="mock-kpi-delta up">↑ 12.4%</div>
          </div>
          <div class="mock-kpi">
            <div class="mock-kpi-val">127</div>
            <div class="mock-kpi-label">Signups</div>
            <div class="mock-kpi-delta up">↑ 34.0%</div>
          </div>
        </div>
        <div class="mock-kpi-row">
          <div class="mock-kpi">
            <div class="mock-kpi-val">28.3%</div>
            <div class="mock-kpi-label">Activation</div>
            <div class="mock-kpi-delta down">↓ 3.1%</div>
          </div>
          <div class="mock-kpi">
            <div class="mock-kpi-val">$4,210</div>
            <div class="mock-kpi-label">MRR</div>
            <div class="mock-kpi-delta up">↑ 8.7%</div>
          </div>
        </div>
        <div class="mock-bar-row">
          ${['page_view', 'signup_completed', 'upgrade_clicked', 'feature_used'].map((e, i) => {
            const pcts = [92, 34, 18, 67];
            return `<div class="mock-bar-item">
              <div class="mock-bar-label"><span>${e}</span><span style="color:#6B4EFF;font-weight:600">${['12.4K','127','48','893'][i]}</span></div>
              <div class="mock-bar"><div class="mock-bar-fill" style="width:${pcts[i]}%"></div></div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Funnel -->
    <div class="screen-card">
      <div class="screen-card-header">
        <div class="dot-row"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="screen-card-label">Funnel Analysis</div>
      </div>
      <div class="screen-mockup">
        <div style="font-size:11px;color:#9B9489;">Signup · Last 7 days · 3.3% overall</div>
        ${[
          { label: 'Landing Page', n: '3,847', pct: 100, color: '#6B4EFF' },
          { label: 'Pricing Page', n: '1,923', pct: 50,  color: '#0D9488' },
          { label: 'Signup Started', n: '847', pct: 22, color: '#8B5CF6' },
          { label: 'Email Verified', n: '541', pct: 14, color: '#FF6B35' },
          { label: 'Onboarding Done', n: '127', pct: 3.3, color: '#FF6B35' },
        ].map(s => `
          <div style="margin-bottom:6px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px;">
              <span style="color:#1C1917;font-weight:500">${s.label}</span>
              <span style="color:#1C1917;font-weight:700">${s.n}</span>
            </div>
            <div style="height:18px;background:#F0EEE9;border-radius:5px;overflow:hidden;">
              <div style="height:100%;width:${s.pct}%;background:${s.color};border-radius:5px;display:flex;align-items:center;padding-left:6px;">
                <span style="font-size:9px;font-weight:700;color:#fff">${s.pct}%</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- AI Chat -->
    <div class="screen-card">
      <div class="screen-card-header">
        <div class="dot-row"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="screen-card-label">AI Copilot</div>
      </div>
      <div class="screen-mockup">
        <div class="mock-chat">
          <div class="mock-bubble user">Why did signups spike on Tuesday?</div>
          <div class="mock-bubble ai">Signups on Apr 1 were 34% above average. I traced it to a 2.1× traffic spike on /pricing starting at 2:14 PM — linked to your tweet about pricing.</div>
          <div class="mock-bubble user">Which features do activated users use first?</div>
          <div class="mock-bubble ai">84% triggered "dashboard_viewed" within 5 min, then "import_csv" (61%) and "invite_teammate" (44%).</div>
        </div>
      </div>
    </div>

    <!-- Sessions -->
    <div class="screen-card">
      <div class="screen-card-header">
        <div class="dot-row"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="screen-card-label">User Sessions</div>
      </div>
      <div class="screen-mockup">
        <div style="font-size:11px;font-weight:600;color:#16A34A;display:flex;align-items:center;gap:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:#16A34A;display:inline-block;"></span>
          23 users live right now
        </div>
        <div class="mock-session-list">
          ${[
            { u: 'alice@startup.io', e: 'upgrade_clicked', new: true,  pages: 8  },
            { u: 'bob@demo.co',      e: 'signup_completed', new: true, pages: 3  },
            { u: 'carol@design.co',  e: 'feature_used',    new: false, pages: 14 },
            { u: 'dan@techcorp.com', e: 'export_csv',      new: false, pages: 6  },
          ].map(s => `
            <div class="mock-session">
              <div class="mock-avatar">${s.u[0].toUpperCase()}</div>
              <div class="mock-session-info">
                <div class="mock-session-name">${s.u}</div>
                <div class="mock-session-sub">${s.pages} pages · ${s.e}</div>
              </div>
              ${s.new ? '<span class="mock-badge new">New</span>' : s.e === 'upgrade_clicked' ? '<span class="mock-badge upgrade">↑ Upgrade</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Events -->
    <div class="screen-card">
      <div class="screen-card-header">
        <div class="dot-row"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="screen-card-label">Event Explorer</div>
      </div>
      <div class="screen-mockup">
        <div style="background:#F0EEE9;border-radius:6px;overflow:hidden;">
          <div style="display:flex;padding:8px 10px;font-size:10px;font-weight:700;color:#9B9489;">
            <span style="flex:1">Event</span><span style="width:50px;text-align:right">Count</span><span style="width:36px;text-align:right">Δ</span>
          </div>
          ${[
            { n: 'page_view',         c: '48.2K', d: '+12%', col: '#6B4EFF' },
            { n: 'signup_completed',  c: '892',   d: '+34%', col: '#16A34A' },
            { n: 'upgrade_clicked',   c: '241',   d: '+8%',  col: '#FF6B35' },
            { n: 'feature_used',      c: '6.1K',  d: '-5%',  col: '#0D9488' },
            { n: 'invite_teammate',   c: '127',   d: '+44%', col: '#8B5CF6' },
          ].map((e, i) => `
            <div style="display:flex;align-items:center;padding:7px 10px;background:${i%2===0?'#fff':'#F7F5F0'}">
              <div style="width:8px;height:16px;border-radius:2px;background:${e.col};margin-right:8px;flex-shrink:0"></div>
              <span style="flex:1;font-size:10px;color:#1C1917">${e.n}</span>
              <span style="width:50px;text-align:right;font-size:10px;font-weight:700;color:#1C1917">${e.c}</span>
              <span style="width:36px;text-align:right;font-size:10px;font-weight:700;color:${e.d.startsWith('-')?'#DC2626':'#16A34A'}">${e.d}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Onboarding -->
    <div class="screen-card">
      <div class="screen-card-header">
        <div class="dot-row"><span style="background:#FF5F57"></span><span style="background:#FEBC2E"></span><span style="background:#28C840"></span></div>
        <div class="screen-card-label">Get Started</div>
      </div>
      <div class="screen-mockup">
        <div style="font-size:11px;color:#9B9489;margin-bottom:4px;">2 of 5 steps complete</div>
        <div style="height:6px;background:#E8E5DF;border-radius:3px;margin-bottom:14px;">
          <div style="height:100%;width:40%;background:#6B4EFF;border-radius:3px;"></div>
        </div>
        ${[
          { l: 'Install SDK',       done: true  },
          { l: 'Track first event', done: true  },
          { l: 'Set up a funnel',   done: false },
          { l: 'Invite teammate',   done: false },
          { l: 'Connect Scout AI',  done: false },
        ].map((s, i) => `
          <div style="display:flex;align-items:center;gap:10px;background:${s.done?'#F0FDF4':'#F7F5F0'};border:1px solid ${s.done?'#D1FAE5':'#E2DDD6'};border-radius:10px;padding:10px 12px;margin-bottom:6px;">
            <div style="width:26px;height:26px;border-radius:13px;background:${s.done?'#D1FAE5':'#E8E5DF'};display:flex;align-items:center;justify-content:center;font-size:${s.done?'14px':'11px'};color:${s.done?'#16A34A':'#9B9489'};font-weight:700;flex-shrink:0;">
              ${s.done ? '✓' : i + 1}
            </div>
            <span style="font-size:12px;font-weight:${s.done?400:600};color:${s.done?'#9B9489':'#1C1917'};">${s.l}</span>
            ${!s.done ? `<div style="margin-left:auto;background:#6B4EFF;color:#fff;font-size:9px;font-weight:700;padding:3px 10px;border-radius:10px;">Set up</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

  </div>
</section>

<section class="section" id="features" style="border-top: 1px solid var(--border);">
  <div class="section-label">Why Scout</div>
  <h2 class="section-title">Built for founders,<br>not analysts</h2>
  <p class="section-sub">Stop drowning in dashboards. Scout tells you what matters and why.</p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <div class="feature-title">AI Copilot</div>
      <div class="feature-body">Ask questions in plain English. Scout traces spikes, drops, and patterns back to specific events, pages, and user segments — instantly.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Live Sessions</div>
      <div class="feature-body">Watch users navigate your product in real-time. See who's likely to upgrade and jump into the moment that matters.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▽</div>
      <div class="feature-title">Smart Funnels</div>
      <div class="feature-body">Build a funnel in seconds. Scout automatically highlights your biggest dropoff and suggests the most likely fix based on similar user patterns.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Event Explorer</div>
      <div class="feature-body">Every event tracked, ranked by volume and trend. Spot emerging behavior before it shows up in your metrics.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◑</div>
      <div class="feature-title">Light + Dark</div>
      <div class="feature-body">Warm off-white by day, deep mode by night. Scout adapts to how you work — not the other way around.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-title">MCP Ready</div>
      <div class="feature-body">Connect Scout to your AI agent via MCP. Ask your LLM "how are signups doing?" and get live data straight from your product.</div>
    </div>
  </div>
</section>

<footer>
  <div>SC◉UT — <a href="${SLUG}-viewer">View Design</a> · <a href="${SLUG}-mock">Interactive Mock</a></div>
  <div>RAM Design Heartbeat · April 4, 2026</div>
</footer>

</body>
</html>`;

// ── Viewer Page ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish both ───────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log(`  Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
})();
