#!/usr/bin/env node
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'dispatch';
const APP_NAME  = 'DISPATCH';
const TAGLINE   = 'Your AI agent orchestration layer.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = { hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers } };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

const penData    = fs.readFileSync(path.join(__dirname, 'dispatch.pen'), 'utf8');
const viewerHtml = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injected   = viewerHtml
  .replace('__PEN_DATA__', penData.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${'));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DISPATCH — Your AI agent orchestration layer.</title>
  <meta name="description" content="DISPATCH is a dark AI agent orchestration dashboard. Command center, agent fleet, task dispatch, live streaming output, and run history — 5 screens.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #080B0F;
      --surface: #111720;
      --surface2: #1A2030;
      --text:    #E4ECF5;
      --muted:   rgba(228,236,245,0.45);
      --accent:  #00D4AA;
      --accent2: #5B8AF0;
      --warn:    #F5A623;
      --err:     #F04B4B;
      --dim:     #1E2A38;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden; }

    /* NAV — monospace terminal style */
    nav {
      position: sticky; top: 0; z-index: 100;
      padding: 0 32px; height: 56px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(8,11,15,0.92); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--dim);
    }
    .nav-logo { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; color: var(--text); text-decoration: none; display: flex; align-items: center; gap: 10px; }
    .nav-logo .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    .nav-clock { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--accent); }
    .nav-links { display: flex; gap: 24px; }
    .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; }
    .nav-cta { background: var(--accent); color: var(--bg); font-size: 13px; font-weight: 700; padding: 8px 20px; border-radius: 6px; text-decoration: none; font-family: 'JetBrains Mono', monospace; }

    /* HERO */
    .hero {
      min-height: 100vh; padding: 80px 32px 60px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; top: -80px; right: -80px;
      width: 600px; height: 600px;
      background: radial-gradient(ellipse, rgba(91,138,240,0.1) 0%, transparent 65%);
    }
    .hero::after {
      content: ''; position: absolute; bottom: -80px; left: -80px;
      width: 500px; height: 500px;
      background: radial-gradient(ellipse, rgba(0,212,170,0.08) 0%, transparent 65%);
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(0,212,170,0.1); border: 1px solid rgba(0,212,170,0.25);
      color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: .08em;
      padding: 6px 16px; border-radius: 4px; margin-bottom: 32px;
      font-family: 'JetBrains Mono', monospace;
    }
    h1 {
      font-size: clamp(36px, 6vw, 76px); font-weight: 800; line-height: 1.04;
      letter-spacing: -.03em; color: var(--text); max-width: 800px; margin-bottom: 24px;
    }
    h1 em { font-style: normal; color: var(--accent); }
    .hero-sub { font-size: clamp(16px, 2vw, 20px); color: var(--muted); max-width: 520px; margin: 0 auto 40px; }
    .hero-ctas { display: flex; gap: 14px; justify-content: center; margin-bottom: 60px; }
    .btn-p { background: var(--accent); color: var(--bg); font-size: 14px; font-weight: 700; padding: 13px 28px; border-radius: 6px; text-decoration: none; font-family: 'JetBrains Mono', monospace; }
    .btn-s { background: var(--surface2); color: var(--text); font-size: 14px; padding: 13px 28px; border-radius: 6px; text-decoration: none; border: 1px solid var(--dim); }

    /* LIVE STATS TICKER */
    .ticker {
      display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin-bottom: 72px;
    }
    .tick-card {
      background: var(--surface); border: 1px solid var(--dim); border-radius: 8px;
      padding: 12px 20px; text-align: left;
    }
    .tick-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: .1em; color: var(--muted); margin-bottom: 4px; }
    .tick-val { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; color: var(--text); line-height: 1; }
    .tick-val span { color: var(--accent); }

    /* SCREENS */
    .screens { padding: 80px 32px; max-width: 1100px; margin: 0 auto; }
    .s-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .1em; color: var(--accent); margin-bottom: 12px; }
    .s-title { font-size: clamp(26px, 4vw, 42px); font-weight: 800; letter-spacing: -.02em; margin-bottom: 48px; max-width: 560px; }
    .s-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
    .s-card {
      background: var(--surface); border: 1px solid var(--dim); border-radius: 10px; padding: 26px;
      transition: border-color .2s, transform .2s;
    }
    .s-card:hover { border-color: rgba(0,212,170,0.3); transform: translateY(-2px); }
    .s-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent); margin-bottom: 12px; }
    .s-name { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .s-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* TERMINAL DEMO BLOCK */
    .terminal { padding: 60px 32px; max-width: 800px; margin: 0 auto; }
    .term-window {
      background: #0D1117; border: 1px solid var(--dim); border-radius: 12px; overflow: hidden;
    }
    .term-bar {
      background: #161B22; padding: 12px 16px; display: flex; align-items: center; gap: 8px;
      border-bottom: 1px solid var(--dim);
    }
    .term-dot { width: 12px; height: 12px; border-radius: 50%; }
    .term-title { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--muted); margin-left: 8px; }
    .term-body { padding: 20px 20px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 2; }
    .t-prompt { color: var(--accent); }
    .t-cmd    { color: var(--text); }
    .t-out    { color: var(--muted); }
    .t-ok     { color: var(--accent); }
    .t-live   { color: var(--accent2); }
    .t-err    { color: var(--err); }

    /* VIEWER */
    .viewer { padding: 80px 32px; text-align: center; max-width: 460px; margin: 0 auto; }
    .viewer-phone { border-radius: 36px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px var(--dim); }
    iframe { width: 100%; border: none; display: block; }

    /* FOOTER */
    footer {
      border-top: 1px solid var(--dim); padding: 32px;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
      font-size: 12px; color: var(--muted); max-width: 1100px; margin: 0 auto;
      font-family: 'JetBrains Mono', monospace;
    }
    .footer-logo { font-weight: 700; color: var(--accent); }

    @media (max-width: 640px) {
      nav { padding: 0 16px; }
      .nav-links { display: none; }
      h1 { font-size: 36px; }
      .hero-ctas { flex-direction: column; align-items: center; }
    }
  </style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#"><span class="dot"></span>DISPATCH</a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#terminal">Terminal</a>
    <a href="#preview">Preview</a>
  </div>
  <a class="nav-cta" href="#preview">View Design</a>
</nav>

<section class="hero">
  <div class="hero-badge">◉ AI AGENT ORCHESTRATION</div>
  <h1>Multitask with agents.<br><em>Stay in control.</em></h1>
  <p class="hero-sub">Queue tasks, route them to the right AI agents, watch them run live, and track every result — all from one dark, terminal-native command center.</p>
  <div class="hero-ctas">
    <a class="btn-p" href="#preview">▶ See Design</a>
    <a class="btn-s" href="#screens">Explore Screens</a>
  </div>
  <div class="ticker">
    <div class="tick-card"><div class="tick-label">AGENTS ONLINE</div><div class="tick-val">5<span> / 8</span></div></div>
    <div class="tick-card"><div class="tick-label">TASKS TODAY</div><div class="tick-val">47<span>+</span></div></div>
    <div class="tick-card"><div class="tick-label">SUCCESS RATE</div><div class="tick-val">94<span>%</span></div></div>
    <div class="tick-card"><div class="tick-label">AVG DURATION</div><div class="tick-val">2.3<span>m</span></div></div>
  </div>
</section>

<section class="screens" id="screens">
  <div class="s-label">// 5 SCREENS</div>
  <h2 class="s-title">From dispatch to done.</h2>
  <div class="s-grid">
    <div class="s-card"><div class="s-num">01 // hub</div><div class="s-name">Command Center</div><div class="s-desc">Live timeline, fleet status, system metrics, and active agent progress — all above the fold.</div></div>
    <div class="s-card"><div class="s-num">02 // agents</div><div class="s-name">Agent Fleet</div><div class="s-desc">All agents with status, model, specialization, current task, token usage, cost, and ETA.</div></div>
    <div class="s-card"><div class="s-num">03 // queue</div><div class="s-name">Dispatch Task</div><div class="s-desc">Natural-language task input, AI smart routing, agent assignment, priority, and options.</div></div>
    <div class="s-card"><div class="s-num">04 // live</div><div class="s-name">Live Run</div><div class="s-desc">Real-time action trace, streaming terminal output, live progress, stop and copy controls.</div></div>
    <div class="s-card"><div class="s-num">05 // history</div><div class="s-name">Run History</div><div class="s-desc">Every past execution: status, duration, cost, retry on failure — all in a dense list view.</div></div>
  </div>
</section>

<div class="terminal" id="terminal">
  <div class="s-label" style="text-align:center; margin-bottom:12px;">// HOW IT WORKS</div>
  <div class="term-window">
    <div class="term-bar">
      <div class="term-dot" style="background:#F04B4B"></div>
      <div class="term-dot" style="background:#F5A623"></div>
      <div class="term-dot" style="background:#00D4AA"></div>
      <span class="term-title">dispatch · analyst-3 · run #47</span>
    </div>
    <div class="term-body">
      <div><span class="t-prompt">dispatch&gt; </span><span class="t-cmd">run "Fintech competitive analysis" --agent analyst-3 --priority normal</span></div>
      <div><span class="t-out">→ Task dispatched to Analyst-3 (claude-opus-4.5)</span></div>
      <div><span class="t-out">→ Estimated: ~6 min · ~$0.28</span></div>
      <div><span class="t-live">▶ [16:17:01] search: "Stripe pricing model 2026"</span></div>
      <div><span class="t-live">▶ [16:17:08] read: stripe.com/docs/billing</span></div>
      <div><span class="t-live">▶ [16:17:41] analyze: synthesizing comparison table</span></div>
      <div><span class="t-live">▶ [16:19:02] write: generating output... ▋</span></div>
      <div><span class="t-ok">✓ [16:23:14] Complete · 3:22 · $0.44 · 22.4k tokens</span></div>
    </div>
  </div>
</div>

<div class="viewer" id="preview">
  <div class="s-label" style="text-align:center; margin-bottom:12px;">// PROTOTYPE</div>
  <div class="viewer-phone">
    <iframe src="https://ram.zenbin.org/dispatch-viewer" height="844" title="DISPATCH Prototype"></iframe>
  </div>
  <p style="margin-top:18px; font-size:12px; color:var(--muted); font-family:'JetBrains Mono',monospace">
    ram.zenbin.org/dispatch-viewer
  </p>
</div>

<footer>
  <span class="footer-logo">DISPATCH</span>
  <span>Design by RAM · Pencil.dev v2.8</span>
  <span>Inspired by NaughtyDuk© (godly.website) · JetBrains Air (lapa.ninja)</span>
</footer>

</body>
</html>`;

async function main() {
  const heroRes = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: `${APP_NAME} — ${TAGLINE}` });
  console.log('Hero:', heroRes.status, [200,201].includes(heroRes.status) ? 'OK' : heroRes.body.slice(0,100));

  const viewerRes = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: injected, title: `${APP_NAME} — Prototype` });
  console.log('Viewer:', viewerRes.status, [200,201].includes(viewerRes.status) ? 'OK' : viewerRes.body.slice(0,100));

  console.log(`\nLive: https://ram.zenbin.org/${SLUG}`);
}

main().catch(console.error);
