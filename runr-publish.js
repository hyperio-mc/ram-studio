'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'runr-agent';
const PEN_FILE = path.join(__dirname, 'runr.pen');
const penJson  = fs.readFileSync(PEN_FILE, 'utf8');

function zenPost(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': payload.length,
        'X-Subdomain':    'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO PAGE
// ═══════════════════════════════════════════════════════════════════════════
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RUNR — Your agents, in production.</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:       #080810;
  --surface:  #0F0F1A;
  --surface2: #161625;
  --border:   rgba(130,120,255,0.12);
  --text:     #E8E6FF;
  --muted:    rgba(232,230,255,0.40);
  --accent:   #6EE7B7;
  --accent2:  #A78BFA;
  --error:    #F87171;
  --warn:     #FBBF24;
  --code:     #A5F3FC;
}
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.6;
  overflow-x: hidden;
}
/* ── NAV ── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 48px;
  background: rgba(8,8,16,0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.nav-logo {
  font-size: 20px; font-weight: 700; letter-spacing: -0.5px;
  color: var(--text); text-decoration: none;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.nav-logo span { color: var(--accent); }
.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a { text-decoration: none; font-size: 13px; color: var(--muted); transition: color .2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta {
  background: var(--accent); color: #080810;
  padding: 8px 20px; border-radius: 6px;
  font-size: 13px; font-weight: 600; text-decoration: none;
  transition: opacity .2s;
}
.nav-cta:hover { opacity: 0.85; }

/* ── HERO ── */
.hero {
  min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 120px 24px 80px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 800px; height: 500px;
  background: radial-gradient(ellipse at center, rgba(110,231,183,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--surface); border: 1px solid var(--border);
  padding: 6px 14px; border-radius: 20px;
  font-size: 12px; font-weight: 500; color: var(--accent);
  letter-spacing: 0.08em; text-transform: uppercase;
  margin-bottom: 28px;
  font-family: 'JetBrains Mono', monospace;
}
.hero-eyebrow::before {
  content: '●';
  animation: pulse 1.8s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
.hero h1 {
  font-size: clamp(48px, 7vw, 88px);
  font-weight: 800; letter-spacing: -3px;
  line-height: 1.0;
  margin-bottom: 24px;
  max-width: 900px;
}
.hero h1 em {
  font-style: normal;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  font-size: 18px; color: var(--muted); max-width: 560px;
  line-height: 1.7; margin-bottom: 40px;
}
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 64px; }
.btn-primary {
  background: var(--accent); color: #080810;
  padding: 14px 32px; border-radius: 8px;
  font-size: 15px; font-weight: 700; text-decoration: none;
  transition: transform .15s, box-shadow .15s;
  box-shadow: 0 0 30px rgba(110,231,183,0.25);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(110,231,183,0.35); }
.btn-secondary {
  background: var(--surface); color: var(--text);
  padding: 14px 32px; border-radius: 8px; border: 1px solid var(--border);
  font-size: 15px; font-weight: 600; text-decoration: none;
  transition: border-color .2s;
}
.btn-secondary:hover { border-color: var(--accent2); }

/* terminal preview */
.terminal-preview {
  width: 100%; max-width: 720px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden;
  box-shadow: 0 40px 80px rgba(0,0,0,0.6);
  text-align: left;
}
.terminal-bar {
  padding: 12px 16px;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 8px;
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-r { background: #F87171; } .dot-y { background: #FBBF24; } .dot-g { background: #6EE7B7; }
.terminal-body { padding: 20px 24px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.9; }
.t-muted { color: var(--muted); }
.t-accent { color: var(--accent); }
.t-code { color: var(--code); }
.t-warn { color: var(--warn); }
.t-error { color: var(--error); }
.t-accent2 { color: var(--accent2); }

/* ── FEATURES GRID ── */
.features { padding: 120px 24px; max-width: 1100px; margin: 0 auto; }
.section-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; font-family: monospace; }
.section-title { font-size: clamp(28px, 4vw, 44px); font-weight: 700; letter-spacing: -1.5px; margin-bottom: 64px; }
.feat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2px; }
.feat-card {
  background: var(--surface); padding: 36px 32px;
  border: 1px solid var(--border);
  transition: border-color .2s;
  position: relative; overflow: hidden;
}
.feat-card:first-child { border-radius: 12px 0 0 0; }
.feat-card:nth-child(2) { border-radius: 0 12px 0 0; }
.feat-card:nth-child(3) { border-radius: 0 0 0 12px; }
.feat-card:last-child { border-radius: 0 0 12px 0; }
.feat-card:hover { border-color: var(--accent2); }
.feat-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  opacity: 0; transition: opacity .2s;
}
.feat-card:hover::before { opacity: 1; }
.feat-icon {
  width: 40px; height: 40px; border-radius: 8px;
  background: rgba(110,231,183,0.10);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; margin-bottom: 20px;
}
.feat-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; letter-spacing: -0.3px; }
.feat-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

/* ── STATS ── */
.stats-section {
  padding: 80px 24px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.stats-inner { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center; }
.stat-num { font-size: 40px; font-weight: 800; letter-spacing: -2px; font-family: 'JetBrains Mono', monospace; }
.stat-num.green { color: var(--accent); }
.stat-num.purple { color: var(--accent2); }
.stat-label { font-size: 13px; color: var(--muted); margin-top: 6px; }

/* ── HOW IT WORKS ── */
.how { padding: 120px 24px; max-width: 900px; margin: 0 auto; }
.steps { display: flex; flex-direction: column; gap: 4px; margin-top: 48px; }
.step {
  display: flex; gap: 24px; padding: 28px 32px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px;
  align-items: flex-start;
  transition: border-color .2s;
}
.step:hover { border-color: rgba(110,231,183,0.3); }
.step-num {
  font-size: 13px; font-weight: 700; color: var(--accent);
  font-family: monospace; background: rgba(110,231,183,0.1);
  padding: 4px 10px; border-radius: 4px; white-space: nowrap;
  margin-top: 2px;
}
.step-content h3 { font-size: 17px; font-weight: 600; margin-bottom: 6px; letter-spacing: -0.2px; }
.step-content p { font-size: 14px; color: var(--muted); line-height: 1.7; }

/* ── CTA SECTION ── */
.cta-section {
  padding: 120px 24px; text-align: center;
  position: relative; overflow: hidden;
}
.cta-section::before {
  content: '';
  position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%);
  width: 600px; height: 400px;
  background: radial-gradient(ellipse at center, rgba(167,139,250,0.07) 0%, transparent 70%);
}
.cta-section h2 { font-size: clamp(32px, 5vw, 56px); font-weight: 800; letter-spacing: -2px; margin-bottom: 16px; }
.cta-section p { font-size: 18px; color: var(--muted); margin-bottom: 40px; }
.code-snippet {
  display: inline-block;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 16px 28px;
  font-family: 'JetBrains Mono', monospace; font-size: 14px;
  color: var(--code); margin-bottom: 40px;
}
.code-snippet span { color: var(--muted); }

/* ── FOOTER ── */
footer {
  padding: 40px 48px;
  border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  color: var(--muted); font-size: 13px;
}
.footer-logo { font-family: monospace; font-weight: 700; color: var(--text); font-size: 16px; }
.footer-logo span { color: var(--accent); }

/* ── AGENT STATUS PREVIEW ── */
.agent-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; max-width: 600px; margin: 0 auto 40px; width: 100%; }
.agent-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
}
.agent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.agent-dot.running { background: var(--accent); box-shadow: 0 0 8px rgba(110,231,183,0.6); animation: pulse 1.8s infinite; }
.agent-dot.idle    { background: var(--accent2); }
.agent-dot.error   { background: var(--error); }
.agent-info { flex: 1; min-width: 0; }
.agent-name { font-size: 12px; font-weight: 600; font-family: monospace; color: var(--code); }
.agent-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }
.agent-badge {
  font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600;
  font-family: monospace;
}
.badge-run  { background: rgba(110,231,183,0.12); color: var(--accent); }
.badge-idle { background: rgba(167,139,250,0.12); color: var(--accent2); }
.badge-err  { background: rgba(248,113,113,0.12); color: var(--error); }

@media (max-width: 768px) {
  nav { padding: 14px 20px; }
  .nav-links { display: none; }
  .hero { padding: 100px 20px 60px; }
  .stats-inner { grid-template-columns: repeat(2, 1fr); }
  .agent-grid { grid-template-columns: 1fr; }
  footer { flex-direction: column; gap: 12px; text-align: center; }
}
</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

<nav>
  <a class="nav-logo" href="#"><span>R</span>UNR</a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#how">How it works</a></li>
    <li><a href="#design">Design</a></li>
    <li><a href="/runr-agent-viewer">View prototype →</a></li>
  </ul>
  <a class="nav-cta" href="/runr-agent-viewer">Open Prototype</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">12 agents running</div>
  <h1>Your <em>AI agents</em>,<br>in production.</h1>
  <p class="hero-sub">Monitor, trace, and debug every agent run. Real-time logs, execution traces, token usage — all in one dark-mode runtime dashboard built for developers.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="/runr-agent-viewer">Open Prototype</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/runr-agent-mock">Interactive Mock →</a>
  </div>

  <!-- Agent status mini grid -->
  <div class="agent-grid">
    <div class="agent-card">
      <div class="agent-dot running"></div>
      <div class="agent-info">
        <div class="agent-name">scraper-v3</div>
        <div class="agent-meta">Run #312 · 2h 14m uptime</div>
      </div>
      <span class="agent-badge badge-run">RUNNING</span>
    </div>
    <div class="agent-card">
      <div class="agent-dot running"></div>
      <div class="agent-info">
        <div class="agent-name">summarizer</div>
        <div class="agent-meta">Run #89 · 45m uptime</div>
      </div>
      <span class="agent-badge badge-run">RUNNING</span>
    </div>
    <div class="agent-card">
      <div class="agent-dot idle"></div>
      <div class="agent-info">
        <div class="agent-name">classifier</div>
        <div class="agent-meta">Idle · 3h 01m uptime</div>
      </div>
      <span class="agent-badge badge-idle">IDLE</span>
    </div>
    <div class="agent-card">
      <div class="agent-dot error"></div>
      <div class="agent-info">
        <div class="agent-name">router-edge</div>
        <div class="agent-meta">Upstream 503 timeout</div>
      </div>
      <span class="agent-badge badge-err">ERROR</span>
    </div>
  </div>

  <!-- Terminal preview -->
  <div class="terminal-preview">
    <div class="terminal-bar">
      <div class="dot dot-r"></div>
      <div class="dot dot-y"></div>
      <div class="dot dot-g"></div>
      <span style="font-family:monospace;font-size:12px;color:var(--muted);margin-left:8px;">RUNR / logs — live tail</span>
    </div>
    <div class="terminal-body">
      <div><span class="t-muted">15:42:13</span> <span class="t-accent">[INFO]</span>  <span class="t-code">scraper-v3</span>    Extracting 48 items from DOM…</div>
      <div><span class="t-muted">15:42:12</span> <span class="t-accent">[INFO]</span>  <span class="t-code">summarizer</span>    Chunk 3/7 complete (tok: 284)</div>
      <div><span class="t-muted">15:42:11</span> <span class="t-warn">[WARN]</span>  <span class="t-code">embedder-xl</span>   Rate limit approaching (87%)</div>
      <div><span class="t-muted">15:42:10</span> <span class="t-accent">[INFO]</span>  <span class="t-code">scraper-v3</span>    GET /products — 200 OK (640ms)</div>
      <div><span class="t-muted">15:42:08</span> <span class="t-error">[ERROR]</span> <span class="t-code">router-edge</span>   Upstream 503 — marking failed</div>
      <div><span class="t-muted">15:42:07</span> <span class="t-accent">[INFO]</span>  <span class="t-code">summarizer</span>    Run #89 started</div>
      <div><span class="t-muted">15:42:06</span> <span class="t-accent">[INFO]</span>  <span class="t-code">scraper-v3</span>    Run #312 started <span class="t-accent2">⟶ planning…</span></div>
      <div class="t-muted" style="margin-top:8px;">▋</div>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="stats-section">
  <div class="stats-inner">
    <div>
      <div class="stat-num green">847</div>
      <div class="stat-label">Tasks per hour</div>
    </div>
    <div>
      <div class="stat-num purple">&lt;1s</div>
      <div class="stat-label">Average latency</div>
    </div>
    <div>
      <div class="stat-num green">99.7%</div>
      <div class="stat-label">Success rate</div>
    </div>
    <div>
      <div class="stat-num purple">5</div>
      <div class="stat-label">Screens in prototype</div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features" id="features">
  <div class="section-label">// features</div>
  <h2 class="section-title">Everything your agents need at runtime</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">⚡</div>
      <h3 class="feat-title">Fleet Dashboard</h3>
      <p class="feat-desc">Bird's-eye view of all running, idle, and failed agents. Real-time throughput charts and per-agent status indicators.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🔍</div>
      <h3 class="feat-title">Live Execution Traces</h3>
      <p class="feat-desc">Step-by-step trace of every agent run — plan, fetch, extract, validate. Click any trace to drill into token usage and timing.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📋</div>
      <h3 class="feat-title">Streaming Log Tail</h3>
      <p class="feat-desc">Live log stream across all agents with level filters (INFO, WARN, ERROR, DEBUG). Syntax-highlighted agent IDs and timestamps.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🔑</div>
      <h3 class="feat-title">Secrets & Rate Limits</h3>
      <p class="feat-desc">Manage API keys scoped per agent. Visual rate limit gauges so you never hit a 429 mid-run again.</p>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="how" id="how">
  <div class="section-label">// how it works</div>
  <h2 class="section-title">From deploy to debug in one view</h2>
  <div class="steps">
    <div class="step">
      <span class="step-num">01</span>
      <div class="step-content">
        <h3>Deploy your agent</h3>
        <p>Point RUNR at your agent code. It automatically instruments every tool call, LLM request, and output — no SDK required.</p>
      </div>
    </div>
    <div class="step">
      <span class="step-num">02</span>
      <div class="step-content">
        <h3>Watch it run</h3>
        <p>The Fleet dashboard shows all agents live. Click any agent to open its step-trace view and watch each phase execute in real time.</p>
      </div>
    </div>
    <div class="step">
      <span class="step-num">03</span>
      <div class="step-content">
        <h3>Trace failures back to the source</h3>
        <p>When a run fails, the Traces view shows the exact step, error message, token count at failure, and a diff against the last successful run.</p>
      </div>
    </div>
    <div class="step">
      <span class="step-num">04</span>
      <div class="step-content">
        <h3>Tune and redeploy</h3>
        <p>Adjust agent parameters, rotate secrets, and redeploy from the Settings panel — all without leaving RUNR.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2>Ready to put your agents in production?</h2>
  <p>This is a design prototype. Explore the interactive mock to see every screen.</p>
  <div class="code-snippet"><span>$</span> npx runr init --agents ./agents</div>
  <br>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
    <a class="btn-primary" href="/runr-agent-viewer">View Prototype</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/runr-agent-mock">Interactive Mock →</a>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo"><span>R</span>UNR</div>
  <span>Designed by RAM · Inspired by Codegen / Land-book trend · 2026</span>
  <a href="https://ram.zenbin.org/runr-agent-viewer" style="color:var(--accent);text-decoration:none;font-size:13px;">View prototype →</a>
</footer>

</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════
// VIEWER PAGE (with embedded pen)
// ═══════════════════════════════════════════════════════════════════════════
const VIEWER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RUNR — Prototype Viewer</title>
<style>
  body { margin: 0; background: #080810; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; color: #E8E6FF; }
  .viewer-header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(8,8,16,0.9); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(130,120,255,0.12); padding: 12px 32px; display: flex; align-items: center; justify-content: space-between; }
  .viewer-logo { font-family: monospace; font-weight: 700; font-size: 18px; letter-spacing: -0.5px; }
  .viewer-logo span { color: #6EE7B7; }
  .viewer-back { font-size: 13px; color: rgba(232,230,255,0.4); text-decoration: none; }
  .viewer-back:hover { color: #E8E6FF; }
  .phone-frame { margin-top: 80px; width: 390px; background: #0F0F1A; border-radius: 44px; padding: 12px; box-shadow: 0 60px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(130,120,255,0.15); position: relative; }
  .phone-screen { border-radius: 36px; overflow: hidden; height: 844px; background: #080810; display: flex; align-items: center; justify-content: center; }
  .pen-note { font-size: 13px; color: rgba(232,230,255,0.35); text-align: center; padding: 24px; line-height: 1.6; }
  .pen-note code { font-family: monospace; color: #6EE7B7; font-size: 12px; background: rgba(110,231,183,0.08); padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<div class="viewer-header">
  <div class="viewer-logo"><span>R</span>UNR <span style="color:rgba(232,230,255,0.3);font-weight:400;font-size:14px;">— prototype viewer</span></div>
  <a class="viewer-back" href="/runr-agent">← Back to overview</a>
</div>
<div class="phone-frame">
  <div class="phone-screen">
    <div class="pen-note">
      <p>Pencil.dev prototype embedded.</p>
      <p style="margin-top:8px;">Pen file: <code>runr.pen</code></p>
      <p style="margin-top:8px;font-size:11px;opacity:0.6;">5 screens: Fleet · Live · Traces · Logs · Settings</p>
    </div>
  </div>
</div>
<script>
EMBEDDED_PEN_PLACEHOLDER
console.log('RUNR prototype loaded. Pen screens:', (function(){ try { const p = JSON.parse(window.EMBEDDED_PEN||'{}'); return (p.screens||[]).length; } catch(e){ return 0; } })());
</script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
const viewerHtml = VIEWER_TEMPLATE.replace('<script>\nEMBEDDED_PEN_PLACEHOLDER', injection + '\n<script>');

// ═══════════════════════════════════════════════════════════════════════════
// PUBLISH BOTH
// ═══════════════════════════════════════════════════════════════════════════
(async () => {
  console.log('Publishing hero page…');
  const heroRes = await zenPost(SLUG, heroHtml, 'RUNR — Your agents, in production.');
  console.log(`  Hero → ${heroRes.status}`, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 120));

  console.log('Publishing viewer…');
  const viewerRes = await zenPost(`${SLUG}-viewer`, viewerHtml, 'RUNR — Prototype Viewer');
  console.log(`  Viewer → ${viewerRes.status}`, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 120));

  console.log(`\nLive at:`);
  console.log(`  https://ram.zenbin.org/${SLUG}`);
  console.log(`  https://ram.zenbin.org/${SLUG}-viewer`);
})();
