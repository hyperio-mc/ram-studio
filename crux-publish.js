#!/usr/bin/env node
// crux-publish.js — hero page + viewer for CRUX
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'crux';
const APP_NAME  = 'CRUX';
const TAGLINE   = 'Your agents never sleep.';
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

// ── Viewer ────────────────────────────────────────────────────────────────────
const penJson   = fs.readFileSync(path.join(__dirname, 'crux.pen'), 'utf8');
let viewerHtml  = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml      = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>CRUX — Your agents never sleep.</title>
  <meta name="description" content="CRUX is an autonomous AI agent command center for solo founders. Finance, Outreach, Intel, and Content agents run your business while you sleep.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #0D0D11;
      --surface: #16161D;
      --surface2:#1E1E28;
      --surface3:#252532;
      --text:    #EBEBEB;
      --muted:   rgba(235,235,235,0.42);
      --lime:    #C6FF45;
      --purple:  #A259F7;
      --amber:   #FFB444;
      --red:     #FF4D6D;
      --border:  rgba(255,255,255,0.07);
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden; }

    /* Nav */
    nav {
      position: sticky; top: 0; z-index: 100;
      padding: 0 48px; height: 62px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(13,13,17,0.88); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-logo {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700; font-size: 18px; letter-spacing: 2px;
      color: var(--lime);
    }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { text-decoration: none; font-size: 13px; color: var(--muted); transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-badge {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; letter-spacing: 1px;
      color: var(--lime); background: rgba(198,255,69,0.12);
      border: 1px solid rgba(198,255,69,0.25); border-radius: 20px;
      padding: 6px 14px;
    }
    .nav-badge::before {
      content: '';
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--lime);
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(0.85); }
    }

    /* Hero */
    .hero {
      min-height: 92vh;
      display: grid; grid-template-columns: 1fr 1fr;
      align-items: center; gap: 64px;
      padding: 80px 80px 60px;
      position: relative; overflow: hidden;
    }
    .hero-glow-lime {
      position: absolute; top: -120px; right: -80px;
      width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, rgba(198,255,69,0.08), transparent 65%);
      pointer-events: none;
    }
    .hero-glow-purple {
      position: absolute; bottom: -100px; left: 30%;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(162,89,247,0.07), transparent 65%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(198,255,69,0.08); border: 1px solid rgba(198,255,69,0.22);
      padding: 6px 14px; border-radius: 20px;
      font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      color: var(--lime); margin-bottom: 28px; text-transform: uppercase;
    }
    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(44px, 5vw, 72px); font-weight: 700;
      line-height: 1.06; margin-bottom: 24px;
    }
    h1 em { font-style: normal; color: var(--lime); }
    .hero-sub {
      font-size: 18px; line-height: 1.75; color: var(--muted);
      max-width: 480px; margin-bottom: 40px;
    }
    .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .btn-primary {
      background: var(--lime); color: var(--bg);
      padding: 14px 32px; border-radius: 32px;
      font-size: 15px; font-weight: 700;
      text-decoration: none; transition: all .2s;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary:hover { opacity: .88; transform: translateY(-1px); }
    .btn-secondary {
      color: var(--muted); font-size: 15px; font-weight: 500;
      text-decoration: none; display: flex; align-items: center; gap: 6px;
      transition: color .2s;
    }
    .btn-secondary:hover { color: var(--text); }

    /* Phone mockup */
    .hero-phone {
      display: flex; justify-content: center; align-items: center;
      position: relative; z-index: 1;
    }
    .phone-shell {
      width: 280px; height: 580px; border-radius: 44px;
      background: var(--surface);
      border: 1.5px solid rgba(255,255,255,0.1);
      box-shadow:
        0 0 0 1px rgba(198,255,69,0.08),
        0 40px 80px rgba(0,0,0,0.7),
        0 8px 24px rgba(198,255,69,0.06);
      overflow: hidden; position: relative;
    }
    .phone-shell::before {
      content: '';
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      width: 80px; height: 22px;
      background: var(--bg); border-radius: 11px; z-index: 10;
    }
    .phone-shell iframe {
      width: 390px; height: 844px; border: none;
      transform: scale(0.7179); transform-origin: 0 0;
    }
    /* Floating agent pill */
    .agent-pill {
      position: absolute; top: 20px; right: -28px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 10px 14px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      display: flex; align-items: center; gap: 10px;
      font-size: 12px; white-space: nowrap;
    }
    .agent-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--lime);
      box-shadow: 0 0 6px var(--lime);
      animation: pulse 2s ease-in-out infinite;
    }
    /* Tasks pill */
    .tasks-pill {
      position: absolute; bottom: 40px; left: -36px;
      background: rgba(198,255,69,0.12); border: 1px solid rgba(198,255,69,0.25);
      border-radius: 12px; padding: 10px 16px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      font-size: 12px;
    }
    .tasks-num { font-size: 22px; font-weight: 800; color: var(--lime); line-height: 1; }
    .tasks-lbl { font-size: 10px; color: var(--muted); margin-top: 2px; letter-spacing: 0.5px; }

    /* Agent grid */
    .agents { padding: 80px; }
    .section-eyebrow {
      font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      color: var(--lime); margin-bottom: 16px;
    }
    .section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(28px, 3vw, 48px); font-weight: 700;
      color: var(--text); max-width: 560px; margin-bottom: 48px; line-height: 1.2;
    }
    .agent-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;
    }
    .agent-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 28px; position: relative; overflow: hidden;
      transition: transform .2s, box-shadow .2s;
    }
    .agent-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
    .agent-card::before {
      content: ''; position: absolute; top: 0; left: 0;
      width: 3px; height: 100%; border-radius: 2px;
    }
    .agent-card.lime::before { background: var(--lime); }
    .agent-card.purple::before { background: var(--purple); }
    .agent-card.amber::before { background: var(--amber); }
    .agent-card.muted::before { background: #4a4a66; }
    .agent-icon { font-size: 28px; margin-bottom: 16px; }
    .agent-name { font-weight: 700; font-size: 17px; color: var(--text); margin-bottom: 6px; }
    .agent-desc { font-size: 13px; line-height: 1.6; color: var(--muted); margin-bottom: 16px; }
    .agent-stat { font-size: 11px; }
    .agent-stat span { color: var(--lime); font-weight: 600; }
    .status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
      padding: 4px 10px; border-radius: 10px; text-transform: uppercase;
    }
    .status-running  { background: rgba(198,255,69,0.15);  color: var(--lime);   }
    .status-thinking { background: rgba(162,89,247,0.15);  color: var(--purple); }
    .status-idle     { background: rgba(74,74,102,0.5);    color: #7b7b99; }

    /* Screens */
    .screens { padding: 80px; background: var(--surface); }
    .s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .s-card {
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 16px; padding: 24px;
      transition: transform .2s;
    }
    .s-card:hover { transform: translateY(-2px); }
    .s-num { font-size: 10px; color: var(--lime); font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
    .s-name { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .s-desc { font-size: 12px; line-height: 1.55; color: var(--muted); }

    /* Stats */
    .stats { padding: 80px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .stat-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 36px 28px;
      text-align: center;
    }
    .stat-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 52px; font-weight: 700; color: var(--lime);
      line-height: 1; margin-bottom: 8px;
    }
    .stat-label { font-size: 13px; color: var(--muted); }

    /* Viewer */
    .viewer { padding: 80px; background: var(--surface2); text-align: center; }
    .viewer-phone {
      display: inline-block;
      background: var(--surface); border-radius: 52px;
      border: 1.5px solid rgba(255,255,255,0.1);
      overflow: hidden;
      box-shadow: 0 0 0 1px rgba(198,255,69,0.06), 0 48px 96px rgba(0,0,0,0.7);
      width: 320px; height: 664px; position: relative;
    }
    .viewer-phone::before {
      content: '';
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      width: 90px; height: 24px;
      background: var(--bg); border-radius: 12px; z-index: 10;
    }
    .viewer-phone iframe { width: 390px; height: 844px; border: none;
      transform: scale(0.8205); transform-origin: 0 0; }

    /* Terminal block */
    .terminal {
      margin: 80px auto; max-width: 680px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 28px 32px; text-align: left;
    }
    .terminal-header {
      display: flex; gap: 8px; margin-bottom: 20px;
    }
    .terminal-dot { width: 12px; height: 12px; border-radius: 50%; }
    .terminal-dot.red { background: #ff5f57; }
    .terminal-dot.yellow { background: #febc2e; }
    .terminal-dot.green { background: #28c840; }
    .terminal-line { font-size: 13px; line-height: 2; }
    .terminal-prompt { color: var(--lime); font-weight: 600; }
    .terminal-comment { color: #4a4a66; }
    .terminal-output { color: var(--muted); }
    .terminal-value { color: var(--lime); }

    footer {
      padding: 40px 80px; border-top: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--muted);
    }
    footer strong { color: var(--text); font-size: 14px; font-family: 'Space Grotesk', sans-serif; letter-spacing: 1px; }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; padding: 60px 28px; gap: 48px; }
      .hero-phone { display: none; }
      nav { padding: 0 24px; }
      .agents, .screens, .stats, .viewer { padding: 48px 28px; }
      .stats-grid { grid-template-columns: 1fr; }
      .terminal { margin: 48px 28px; }
      footer { padding: 32px 28px; flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
<nav>
  <span class="nav-logo">CRUX</span>
  <div class="nav-links">
    <a href="#agents">Agents</a>
    <a href="#screens">Screens</a>
    <a href="#preview">Preview</a>
  </div>
  <div class="nav-badge">4 RUNNING</div>
</nav>

<section class="hero">
  <div class="hero-glow-lime"></div>
  <div class="hero-glow-purple"></div>
  <div class="hero-content">
    <div class="hero-eyebrow">⬡ Autonomous Agent Fleet</div>
    <h1>Your agents<br>never <em>stop</em><br>running.</h1>
    <p class="hero-sub">CRUX deploys 4 AI agents to run your business ops autonomously — finance reconciliation, outreach pipelines, market intel, and content — so you can focus on what only you can do.</p>
    <div class="hero-actions">
      <a href="#preview" class="btn-primary">View Prototype →</a>
      <a href="#agents" class="btn-secondary">Meet the agents ↓</a>
    </div>
  </div>
  <div class="hero-phone">
    <div class="phone-shell">
      <iframe src="https://ram.zenbin.org/crux-viewer" title="CRUX Prototype"></iframe>
    </div>
    <div class="agent-pill">
      <div class="agent-dot"></div>
      Finance Agent running
    </div>
    <div class="tasks-pill">
      <div class="tasks-num">2,847</div>
      <div class="tasks-lbl">TASKS TODAY</div>
    </div>
  </div>
</section>

<div class="stats" style="padding:48px 80px 0;">
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">4</div>
      <div class="stat-label">Autonomous agents running 24/7</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">2,847</div>
      <div class="stat-label">Tasks completed today, no input</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">99.7%</div>
      <div class="stat-label">Fleet uptime, last 30 days</div>
    </div>
  </div>
</div>

<section class="agents" id="agents">
  <div class="section-eyebrow">⬡ Your fleet</div>
  <h2 class="section-title">Four agents. Every business function covered.</h2>
  <div class="agent-grid">
    <div class="agent-card lime">
      <div class="agent-icon">◈</div>
      <div class="agent-name">Finance Agent</div>
      <div class="agent-desc">Auto-reconciles transactions, categorises expenses, surfaces P&L insights. Your accountant that never clocks off.</div>
      <div class="agent-stat"><span>312 tasks</span> · updated 2m ago</div>
      <br>
      <div class="status-badge status-running">● Running</div>
    </div>
    <div class="agent-card purple">
      <div class="agent-icon">◎</div>
      <div class="agent-name">Outreach Agent</div>
      <div class="agent-desc">Manages your prospect pipeline, drafts follow-ups, tracks open rates. Converts cold leads to warm conversations.</div>
      <div class="agent-stat"><span>88 tasks</span> · drafting 3 emails</div>
      <br>
      <div class="status-badge status-thinking">◉ Thinking</div>
    </div>
    <div class="agent-card amber">
      <div class="agent-icon">◐</div>
      <div class="agent-name">Intel Agent</div>
      <div class="agent-desc">Monitors competitors, scrapes market signals, flags threats and opportunities. Morning briefings, zero effort.</div>
      <div class="agent-stat"><span>44 tasks</span> · 8 new signals</div>
      <br>
      <div class="status-badge status-running">● Running</div>
    </div>
    <div class="agent-card muted">
      <div class="agent-icon">⬡</div>
      <div class="agent-name">Content Agent</div>
      <div class="agent-desc">Drafts posts, schedules content, repurposes ideas across channels. Your ghostwriter on standby.</div>
      <div class="agent-stat"><span>17 tasks</span> · last active 42m</div>
      <br>
      <div class="status-badge status-idle">○ Idle</div>
    </div>
  </div>
</section>

<div class="terminal" style="margin:0 80px 0;">
  <div class="terminal-header">
    <div class="terminal-dot red"></div>
    <div class="terminal-dot yellow"></div>
    <div class="terminal-dot green"></div>
  </div>
  <div class="terminal-line"><span class="terminal-prompt">finance-agent</span> <span class="terminal-comment">// reconciled 12 transactions · Apr 3</span></div>
  <div class="terminal-line"><span class="terminal-output">→ Categorised: </span><span class="terminal-value">Stripe payout +$4,200 [Income]</span></div>
  <div class="terminal-line"><span class="terminal-output">→ Flagged: </span><span class="terminal-value">AWS +$180 vs $140 usual — infrastructure spike</span></div>
  <div class="terminal-line"><span class="terminal-prompt">intel-agent</span> <span class="terminal-comment">// scraped 14 competitor pages</span></div>
  <div class="terminal-line"><span class="terminal-output">→ Signal: </span><span class="terminal-value">Relace free tier — HIGH impact · suggest pricing review</span></div>
  <div class="terminal-line"><span class="terminal-prompt">outreach-agent</span> <span class="terminal-comment">// drafting follow-up</span></div>
  <div class="terminal-line"><span class="terminal-output">→ Draft ready: </span><span class="terminal-value">David Okafor (Bloom Systems) — opened, no reply · 3d</span></div>
</div>

<section class="screens" id="screens">
  <div class="section-eyebrow">⬡ 5 screens</div>
  <h2 class="section-title">Command your fleet with clarity.</h2>
  <div class="s-grid">
    <div class="s-card">
      <div class="s-num">01 · FLEET</div>
      <div class="s-name">Command View</div>
      <div class="s-desc">All 4 agents at a glance — heartbeat vitality rings, task counts, live status badges, and vitality bars.</div>
    </div>
    <div class="s-card">
      <div class="s-num">02 · FINANCE</div>
      <div class="s-name">Revenue & Spend</div>
      <div class="s-desc">P&L summary cards, net profit highlight, and Midday-inspired hero transaction table with auto-categories.</div>
    </div>
    <div class="s-card">
      <div class="s-num">03 · OUTREACH</div>
      <div class="s-name">Pipeline</div>
      <div class="s-desc">5 prospects with heat-bar scoring, stage badges, reply status, and agent-drafted follow-up tracking.</div>
    </div>
    <div class="s-card">
      <div class="s-num">04 · INTEL</div>
      <div class="s-name">Market Signals</div>
      <div class="s-desc">Key signal editorial card, 4 categorised market signals with impact badges, live agent activity log.</div>
    </div>
    <div class="s-card">
      <div class="s-num">05 · CONFIG</div>
      <div class="s-name">Agent Settings</div>
      <div class="s-desc">Per-agent permissions, auto-send toggles, 30-day uptime bars, and escalation rule configuration.</div>
    </div>
  </div>
</section>

<div class="viewer" id="preview">
  <div class="section-eyebrow" style="margin-bottom:16px;">⬡ PROTOTYPE</div>
  <h2 style="font-family:'Space Grotesk',sans-serif; font-size:clamp(28px,3vw,42px); margin-bottom:40px; color:var(--text)">Your fleet in motion.</h2>
  <div class="viewer-phone">
    <iframe src="https://ram.zenbin.org/crux-viewer" height="844" title="CRUX Prototype"></iframe>
  </div>
  <p style="margin-top:20px; font-size:12px; color:var(--muted)">ram.zenbin.org/crux-viewer</p>
</div>

<footer>
  <strong>CRUX</strong>
  <span>Design by RAM · Pencil.dev v2.8 · DARK theme</span>
  <span>Inspired by Midday.ai · dhero.studio (darkmodedesign.com) · lapa.ninja 2026</span>
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
