#!/usr/bin/env node
// GRAFT — Hero landing page + viewer publisher

const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'graft';
const APP_NAME = 'GRAFT';
const TAGLINE = 'Branch, test & trace AI workflows';

function zenRequest(method, subpath, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'zenbin.org',
      port: 443,
      path: subpath,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': 'ram',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...extraHeaders
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GRAFT — Branch, test & trace AI workflows</title>
<style>
  :root {
    --bg: #F4F2EF;
    --surface: #FFFFFF;
    --surface-alt: #ECEAE6;
    --text: #1C1A17;
    --muted: rgba(28,26,23,0.45);
    --accent: #1ACA8A;
    --accent2: #6B48FF;
    --border: rgba(28,26,23,0.09);
    --border-strong: rgba(28,26,23,0.18);
    --green: #059669;
    --orange: #D97706;
    --red: #DC2626;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }
  /* ── NAV ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 56px;
    background: rgba(244,242,239,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 15px; font-weight: 700; letter-spacing: 0.12em; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a {
    font-size: 13px; color: var(--muted); text-decoration: none;
    transition: color .2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    display: flex; align-items: center; gap: 10px;
  }
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: 8px; font-size: 13px;
    font-weight: 500; cursor: pointer; text-decoration: none;
    transition: all .15s;
    border: none;
  }
  .btn-ghost { background: transparent; border: 1px solid var(--border-strong); color: var(--text); }
  .btn-ghost:hover { background: var(--surface-alt); }
  .btn-accent { background: var(--accent); color: #fff; }
  .btn-accent:hover { opacity: .9; transform: translateY(-1px); }

  /* ── HERO ── */
  .hero {
    max-width: 1100px; margin: 0 auto;
    padding: 100px 40px 80px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
    align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 5px 12px; border-radius: 100px;
    background: rgba(26,202,138,0.10);
    border: 1px solid rgba(26,202,138,0.25);
    font-size: 11px; font-weight: 600; letter-spacing: .08em;
    color: var(--green); margin-bottom: 24px;
    text-transform: uppercase;
  }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
  .dot.pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:.5; transform:scale(1.3); }
  }
  .hero-title {
    font-size: clamp(36px, 4vw, 54px);
    font-weight: 800; letter-spacing: -.025em; line-height: 1.08;
    margin-bottom: 20px;
  }
  .hero-title em { font-style: normal; color: var(--accent); }
  .hero-subtitle {
    font-size: 17px; color: var(--muted); line-height: 1.65;
    max-width: 460px; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .hero-trust {
    margin-top: 32px; font-size: 12px; color: var(--muted);
    display: flex; align-items: center; gap: 16px;
  }
  .hero-trust span { display: flex; align-items: center; gap: 5px; }

  /* ── HERO MOCKUP ── */
  .hero-mockup {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 40px rgba(28,26,23,0.08);
    overflow: hidden;
  }
  .mock-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 16px; border-bottom: 1px solid var(--border);
    margin-bottom: 18px;
  }
  .mock-brand { font-size: 12px; font-weight: 700; letter-spacing: .1em; }
  .mock-brand span { color: var(--accent); }
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 4px; font-size: 10px;
    font-weight: 600;
  }
  .badge-green { background: rgba(5,150,105,0.10); color: var(--green); }
  .badge-orange { background: rgba(217,119,6,0.10); color: var(--orange); }
  .badge-purple { background: rgba(107,72,255,0.09); color: var(--accent2); }

  .mock-stat-row {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 10px; margin-bottom: 18px;
  }
  .mock-stat {
    background: var(--bg);
    border-radius: 8px; padding: 12px 14px;
    border: 1px solid var(--border);
  }
  .mock-stat-label { font-size: 10px; color: var(--muted); font-weight: 500; letter-spacing: .04em; margin-bottom: 4px; }
  .mock-stat-value { font-size: 18px; font-weight: 700; line-height: 1.1; }
  .mock-stat-delta { font-size: 10px; color: var(--green); margin-top: 2px; }
  .mock-stat-delta.warn { color: var(--orange); }

  .mock-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: .08em;
    color: var(--muted); margin-bottom: 10px; text-transform: uppercase;
  }

  .mock-branch-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    background: var(--bg); border: 1px solid var(--border);
    margin-bottom: 8px;
  }
  .mock-branch-item.main { border-color: rgba(26,202,138,0.30); }
  .branch-dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0;
  }
  .mock-branch-name { font-size: 12px; font-weight: 600; flex: 1; }
  .mock-branch-sub { font-size: 10px; color: var(--muted); }
  .mock-branch-meta { font-size: 10px; color: var(--muted); text-align: right; }
  .mock-branch-rate { font-size: 11px; font-weight: 600; color: var(--green); }

  /* ── METRICS BAND ── */
  .metrics-band {
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 28px 0;
  }
  .metrics-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 40px;
    display: flex; justify-content: space-between; align-items: center;
    gap: 20px; flex-wrap: wrap;
  }
  .metric-item { text-align: center; }
  .metric-val {
    font-size: 32px; font-weight: 800; letter-spacing: -.02em;
    line-height: 1;
  }
  .metric-val.green { color: var(--green); }
  .metric-val.purple { color: var(--accent2); }
  .metric-label { font-size: 12px; color: var(--muted); margin-top: 4px; }

  /* ── FEATURES ── */
  .features {
    max-width: 1100px; margin: 0 auto; padding: 80px 40px;
  }
  .section-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: .1em;
    color: var(--muted); text-transform: uppercase; margin-bottom: 12px;
  }
  .section-title {
    font-size: clamp(26px, 2.8vw, 36px);
    font-weight: 800; letter-spacing: -.02em; margin-bottom: 60px;
    max-width: 500px;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 28px;
    transition: transform .2s, box-shadow .2s;
  }
  .feature-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(28,26,23,0.08);
  }
  .feature-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 16px;
  }
  .feature-icon.green { background: rgba(26,202,138,0.12); }
  .feature-icon.purple { background: rgba(107,72,255,0.10); }
  .feature-icon.orange { background: rgba(217,119,6,0.10); }
  .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ── TRACE DEMO ── */
  .trace-demo {
    max-width: 1100px; margin: 0 auto; padding: 0 40px 80px;
  }
  .waterfall {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 28px;
  }
  .wf-step {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 10px;
  }
  .wf-label { font-size: 12px; color: var(--muted); width: 180px; flex-shrink: 0; }
  .wf-bar-track {
    flex: 1; height: 24px;
    background: var(--bg);
    border-radius: 4px; position: relative; overflow: visible;
  }
  .wf-bar {
    height: 100%; border-radius: 4px;
    position: absolute; top: 0;
    display: flex; align-items: center; padding: 0 8px;
  }
  .wf-bar-label { font-size: 10px; font-weight: 600; color: white; white-space: nowrap; }
  .wf-dur { font-size: 11px; color: var(--muted); width: 52px; text-align: right; flex-shrink: 0; }

  /* ── CTA ── */
  .cta-section {
    background: var(--text);
    padding: 80px 40px;
    text-align: center;
  }
  .cta-section .section-eyebrow { color: rgba(244,242,239,0.45); }
  .cta-section .section-title { color: #F4F2EF; max-width: 540px; margin: 0 auto 36px; }
  .cta-section .section-title em { font-style: normal; color: var(--accent); }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 28px 40px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: var(--muted);
    max-width: 100%; background: var(--bg);
  }

  @media (max-width: 800px) {
    .hero { grid-template-columns: 1fr; padding: 60px 24px 40px; }
    .features-grid { grid-template-columns: 1fr; }
    .metrics-inner { gap: 32px; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo">GRAFT<span>.</span></div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Docs</a>
    <a href="#">Pricing</a>
    <a href="#">Changelog</a>
  </div>
  <div class="nav-cta">
    <a href="#" class="btn btn-ghost">Sign In</a>
    <a href="https://ram.zenbin.org/graft-mock" class="btn btn-accent">Try Interactive →</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div>
    <div class="hero-eyebrow"><div class="dot pulse"></div> AI-era workflow tracing</div>
    <h1 class="hero-title">Branch, test &<br><em>trace</em> every agent run.</h1>
    <p class="hero-subtitle">
      Graft gives your AI workflows the developer tools they deserve.
      Branch prompts like code, compare outputs side-by-side, and trace
      every token from retrieval to response.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/graft-mock" class="btn btn-accent">Explore Interactive Mock →</a>
      <a href="https://ram.zenbin.org/graft-viewer" class="btn btn-ghost">View .pen Design</a>
    </div>
    <div class="hero-trust">
      <span>✦ Inspired by <strong>Neon.com</strong> branching</span>
      <span>✦ Awwwards editorial style</span>
    </div>
  </div>

  <!-- HERO MOCKUP -->
  <div class="hero-mockup">
    <div class="mock-topbar">
      <span class="mock-brand">GRAFT<span>.</span></span>
      <span style="font-size:11px;color:var(--muted)">Overview</span>
      <span class="badge badge-green">● LIVE</span>
    </div>
    <div class="mock-stat-row">
      <div class="mock-stat">
        <div class="mock-stat-label">RUNS</div>
        <div class="mock-stat-value">2,841</div>
        <div class="mock-stat-delta">↑ 18%</div>
      </div>
      <div class="mock-stat">
        <div class="mock-stat-label">SUCCESS</div>
        <div class="mock-stat-value">97.3%</div>
        <div class="mock-stat-delta">+0.8%</div>
      </div>
      <div class="mock-stat">
        <div class="mock-stat-label">AVG LAT.</div>
        <div class="mock-stat-value">1.4s</div>
        <div class="mock-stat-delta">−0.2s</div>
      </div>
      <div class="mock-stat">
        <div class="mock-stat-label">COST/WK</div>
        <div class="mock-stat-value">$24.80</div>
        <div class="mock-stat-delta warn">+$3.10</div>
      </div>
    </div>

    <div class="mock-section-label">Active Branches</div>
    <div class="mock-branch-item main">
      <div class="branch-dot" style="background:#1ACA8A"></div>
      <div>
        <div class="mock-branch-name">main</div>
        <div class="mock-branch-sub">GPT-4o — Production</div>
      </div>
      <div class="mock-branch-meta">
        <div class="mock-branch-rate">98.2%</div>
        <div style="font-size:10px;color:var(--muted)">2 min ago</div>
      </div>
    </div>
    <div class="mock-branch-item">
      <div class="branch-dot" style="background:#6B48FF"></div>
      <div>
        <div class="mock-branch-name">exp/chain-of-thought</div>
        <div class="mock-branch-sub">GPT-4o — Testing CoT</div>
      </div>
      <div class="mock-branch-meta">
        <div style="font-size:11px;font-weight:600;color:var(--accent2)">96.8%</div>
        <div style="font-size:10px;color:var(--muted)">14 min ago</div>
      </div>
    </div>
    <div class="mock-branch-item">
      <div class="branch-dot" style="background:#D97706"></div>
      <div>
        <div class="mock-branch-name">exp/gemini-flash</div>
        <div class="mock-branch-sub">Gemini Flash — Benchmarking</div>
      </div>
      <div class="mock-branch-meta">
        <div style="font-size:11px;font-weight:600;color:var(--orange)">95.1%</div>
        <div style="font-size:10px;color:var(--muted)">1 hr ago</div>
      </div>
    </div>
  </div>
</section>

<!-- METRICS BAND -->
<div class="metrics-band">
  <div class="metrics-inner">
    <div class="metric-item">
      <div class="metric-val green">97.3%</div>
      <div class="metric-label">Average success rate</div>
    </div>
    <div class="metric-item">
      <div class="metric-val">1.4s</div>
      <div class="metric-label">Median run latency</div>
    </div>
    <div class="metric-item">
      <div class="metric-val green">18.6M</div>
      <div class="metric-label">Tokens traced this week</div>
    </div>
    <div class="metric-item">
      <div class="metric-val purple">4</div>
      <div class="metric-label">Live branches compared</div>
    </div>
    <div class="metric-item">
      <div class="metric-val">$0.009</div>
      <div class="metric-label">Avg cost per run</div>
    </div>
  </div>
</div>

<!-- FEATURES -->
<section class="features">
  <div class="section-eyebrow">Why Graft?</div>
  <h2 class="section-title">Built for the AI engineering era.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon green">🌿</div>
      <div class="feature-title">Workflow Branching</div>
      <div class="feature-desc">
        Branch any prompt or agent config like a git repo.
        Run experiments in parallel without disrupting production.
        Merge when you're confident.
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-icon purple">⚡</div>
      <div class="feature-title">Waterfall Tracing</div>
      <div class="feature-desc">
        See every millisecond of every run — retrieval, assembly,
        inference, storage. Pin down the bottleneck and fix it fast.
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-icon orange">⚖️</div>
      <div class="feature-title">A/B Branch Compare</div>
      <div class="feature-desc">
        Compare two branches across accuracy, latency, token usage, and cost.
        Get a clear verdict before you promote anything to production.
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-icon green">📊</div>
      <div class="feature-title">Cost Analytics</div>
      <div class="feature-desc">
        Track spend by model, branch, and day. Get actionable tips —
        like switching to Gemini Flash for 3× savings at −2.7% accuracy.
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-icon purple">🔍</div>
      <div class="feature-title">LLM Eval Scoring</div>
      <div class="feature-desc">
        Run GPT-4o as judge across your branches. Compare coherence,
        brevity, and accuracy side-by-side in a clean benchmark table.
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-icon orange">🔔</div>
      <div class="feature-title">Budget Alerts</div>
      <div class="feature-desc">
        Set monthly budgets per branch or globally. Get notified before
        an experiment runs away. Never be surprised by an invoice.
      </div>
    </div>
  </div>
</section>

<!-- TRACE WATERFALL DEMO -->
<section class="trace-demo">
  <div class="section-eyebrow">Execution Waterfall</div>
  <h2 class="section-title">Every step. Every millisecond.</h2>
  <div class="waterfall">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)">
      <div style="font-size:13px;font-weight:600">RUN-9041</div>
      <span class="badge badge-green">success</span>
      <div style="font-size:12px;color:var(--muted)">main · GPT-4o · 1,184ms total · 1,420 tokens · $0.011</div>
    </div>
    ${[
      { label: 'Input validation', pct: 1, offset: 0, color: '#6B48FF', dur: '12ms' },
      { label: 'Context retrieval', pct: 10, offset: 1.1, color: '#1ACA8A', dur: '118ms' },
      { label: 'Prompt assembly', pct: 1.8, offset: 11, color: '#6B48FF', dur: '22ms' },
      { label: 'LLM inference', pct: 75, offset: 13, color: '#059669', dur: '891ms', bold: true },
      { label: 'Output parsing', pct: 2.6, offset: 88, color: '#6B48FF', dur: '31ms' },
      { label: 'Result storage', pct: 5.8, offset: 90.8, color: '#D97706', dur: '68ms' },
      { label: 'Webhook dispatch', pct: 3.5, offset: 96.5, color: '#1ACA8A', dur: '42ms' }
    ].map(s => `
    <div class="wf-step">
      <div class="wf-label" style="${s.bold ? 'color:var(--text);font-weight:600' : ''}">${s.label}</div>
      <div class="wf-bar-track">
        <div class="wf-bar" style="left:${s.offset}%;width:${Math.max(s.pct, 1)}%;background:${s.color};opacity:${s.bold ? 1 : 0.75}">
          ${s.pct > 4 ? `<span class="wf-bar-label">${s.dur}</span>` : ''}
        </div>
      </div>
      <div class="wf-dur">${s.dur}</div>
    </div>`).join('')}
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="section-eyebrow">Get Started</div>
  <h2 class="section-title">Ready to <em>branch</em> your AI workflows?</h2>
  <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/graft-mock" class="btn btn-accent" style="font-size:15px;padding:12px 28px">
      Explore Interactive Mock →
    </a>
    <a href="https://ram.zenbin.org/graft-viewer" class="btn btn-ghost" style="font-size:15px;padding:12px 28px;background:transparent;border-color:rgba(244,242,239,0.25);color:#F4F2EF">
      View .pen Prototype
    </a>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div>GRAFT — designed by RAM · April 2026</div>
  <div style="display:flex;gap:20px">
    <a href="https://ram.zenbin.org/graft-viewer" style="color:inherit;text-decoration:none">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/graft-mock" style="color:inherit;text-decoration:none">Interactive Mock</a>
  </div>
</footer>
</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GRAFT — Pencil.dev Viewer</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#F4F2EF; font-family:'Inter',system-ui,sans-serif; }
  .viewer-header {
    background:#fff; border-bottom:1px solid rgba(28,26,23,0.09);
    padding:16px 28px; display:flex; align-items:center; justify-content:space-between;
  }
  .viewer-brand { font-size:14px; font-weight:700; letter-spacing:.1em; }
  .viewer-brand span { color:#1ACA8A; }
  .viewer-links a {
    font-size:12px; color:rgba(28,26,23,0.55); text-decoration:none;
    margin-left:20px; transition:color .2s;
  }
  .viewer-links a:hover { color:#1C1A17; }
  #pencil-viewer { width:100%; height:calc(100vh - 57px); border:none; }
</style>
<script>
// EMBEDDED_PEN will be injected here
</script>
</head>
<body>
<div class="viewer-header">
  <div class="viewer-brand">GRAFT<span>.</span> — Pencil Prototype</div>
  <div class="viewer-links">
    <a href="https://ram.zenbin.org/graft">← Hero Page</a>
    <a href="https://ram.zenbin.org/graft-mock">Interactive Mock →</a>
  </div>
</div>
<iframe id="pencil-viewer" src="https://pencil.dev/embed/viewer" allow="fullscreen"></iframe>
<script>
  const iframe = document.getElementById('pencil-viewer');
  iframe.addEventListener('load', () => {
    if (window.EMBEDDED_PEN) {
      iframe.contentWindow.postMessage({ type: 'load-pen', data: window.EMBEDDED_PEN }, '*');
    }
  });
</script>
</body>
</html>`;

// Inject pen data into viewer
const penJson = fs.readFileSync(path.join(__dirname, 'graft.pen'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>\n// EMBEDDED_PEN will be injected here\n</script>', injection + '\n<script>');

async function publish(slug, html, title) {
  const res = await zenRequest('POST', '/api/pages', { slug, html, title });
  if (res.status === 200 || res.status === 201) {
    console.log(`✓ Published: https://ram.zenbin.org/${slug}`);
  } else {
    console.log(`  Trying PUT for ${slug}...`);
    const res2 = await zenRequest('PUT', `/api/pages/${slug}`, { html, title });
    if (res2.status === 200 || res2.status === 201) {
      console.log(`✓ Updated:   https://ram.zenbin.org/${slug}`);
    } else {
      console.error(`✗ Failed ${slug}: ${res2.status} ${res2.body.slice(0,120)}`);
    }
  }
}

(async () => {
  console.log('Publishing GRAFT...');
  await publish('graft', heroHtml, 'GRAFT — Branch, test & trace AI workflows');
  await publish('graft-viewer', viewerHtml, 'GRAFT — Pencil Prototype Viewer');
  console.log('Done.');
})();
