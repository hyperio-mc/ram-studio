/**
 * SIGNAL — publish pipeline
 * RAM Design Heartbeat · March 2026
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLUG       = 'signal';
const APP_NAME   = 'SIGNAL';
const TAGLINE    = 'AI Pipeline Observability';
const ARCHETYPE  = 'developer-tools';
const PROMPT     = 'Design an AI pipeline observability platform for monitoring LLM agents in production — traces, latency, token budgets, cost comparison. Dark theme inspired by Darknode (Awwwards SOTD) and Runlayer from Land-book. Electric blue accent on near-void navy-black.';

// ── ZenBin helper ─────────────────────────────────────────────────────────────
function zenPost(slug, html, title) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(JSON.stringify({ title, html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) resolve({ ok: true, status: res.statusCode });
        else reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── GitHub helper ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Hero page
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1/5] Building hero page…');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SIGNAL — AI Pipeline Observability</title>
<meta name="description" content="Monitor LLM agents in production. Traces, latency, token budgets, cost — in one precision-engineered dashboard.">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #07090F;
    --surface: #0E1219;
    --border:  #1C2333;
    --text:    #D6E0F0;
    --muted:   #5A6882;
    --accent:  #4B7FFF;
    --live:    #1EE8A8;
    --warn:    #FF9052;
    --error:   #FF4D6A;
    --dim:     #1A2035;
    --mono:    'JetBrains Mono', 'Fira Code', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: Inter, system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Noise texture overlay */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: 0.5;
  }

  /* ── Grid pattern */
  body::after {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.25;
    pointer-events: none; z-index: 0;
  }

  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* ── Nav */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 32px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
    background: color-mix(in srgb, var(--bg) 80%, transparent);
    backdrop-filter: blur(12px);
  }
  .nav-logo {
    font-family: var(--mono); font-size: 16px; font-weight: 700;
    letter-spacing: 3px; color: var(--text);
    text-decoration: none;
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    border: none; padding: 8px 18px; border-radius: 6px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── Hero */
  .hero {
    padding: 120px 0 80px;
    text-align: center;
    position: relative;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid var(--live); border-radius: 99px;
    padding: 5px 14px; font-size: 11px; color: var(--live);
    margin-bottom: 28px; letter-spacing: 0.5px;
    background: color-mix(in srgb, var(--live) 8%, transparent);
  }
  .hero-badge::before { content: '●'; font-size: 8px; }
  .hero h1 {
    font-size: clamp(40px, 7vw, 72px); font-weight: 800;
    letter-spacing: -2px; line-height: 1.05;
    margin-bottom: 20px;
    background: linear-gradient(135deg, var(--text) 60%, var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero-sub {
    font-size: 18px; color: var(--muted); max-width: 560px; margin: 0 auto 40px;
    line-height: 1.6;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff; border: none;
    padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;
    cursor: pointer; text-decoration: none; transition: all .2s;
    box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 30%, transparent);
  }
  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-secondary {
    background: transparent; color: var(--text);
    border: 1px solid var(--border); padding: 13px 28px;
    border-radius: 8px; font-size: 14px; font-weight: 500;
    cursor: pointer; text-decoration: none; transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: var(--accent); }

  /* ── Stats ticker */
  .stats-row {
    display: flex; gap: 0; justify-content: center;
    margin: 60px 0 0; border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden; background: var(--surface);
  }
  .stat-item {
    flex: 1; padding: 20px; text-align: center;
    border-right: 1px solid var(--border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-val { font-size: 28px; font-weight: 800; color: var(--text); display: block; }
  .stat-val.blue { color: var(--accent); }
  .stat-val.green { color: var(--live); }
  .stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ── Mock frames */
  .screens-section { padding: 100px 0; }
  .section-label {
    font-family: var(--mono); font-size: 11px; color: var(--accent);
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 12px;
  }
  .section-title {
    font-size: clamp(28px, 4vw, 42px); font-weight: 700;
    letter-spacing: -1px; margin-bottom: 16px;
  }
  .section-sub { font-size: 16px; color: var(--muted); max-width: 500px; }

  .screens-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 20px; margin-top: 48px;
  }

  .screen-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
    transition: border-color .3s, transform .3s;
  }
  .screen-card:hover { border-color: var(--accent); transform: translateY(-2px); }
  .screen-card.featured { grid-column: 1 / -1; }

  .screen-chrome {
    background: var(--dim); padding: 10px 14px;
    display: flex; align-items: center; gap: 6px;
    border-bottom: 1px solid var(--border);
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; }
  .dot-r { background: #FF4D6A; }
  .dot-y { background: #FFB800; }
  .dot-g { background: #1EE8A8; }
  .screen-chrome-title {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    margin-left: 8px;
  }

  .screen-body { padding: 20px; }
  .screen-name { font-size: 11px; font-weight: 700; color: var(--accent); letter-spacing: 1px; margin-bottom: 6px; }
  .screen-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* ── Mockup visual inside card */
  .mockup-visual {
    aspect-ratio: 390/300;
    background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    padding: 16px;
  }

  /* ── Feature grid */
  .features-section { padding: 80px 0 100px; }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px; margin-top: 48px;
  }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 24px;
    transition: border-color .3s;
  }
  .feature-card:hover { border-color: var(--accent); }
  .feature-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 14px;
  }
  .feature-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* ── Inline dashboard demo */
  .demo-section { padding: 40px 0 100px; }
  .demo-container {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .demo-bar {
    background: var(--dim); padding: 12px 20px;
    display: flex; align-items: center; gap: 8px;
    border-bottom: 1px solid var(--border);
  }
  .demo-metrics {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px; background: var(--border);
  }
  .demo-metric {
    background: var(--surface); padding: 20px;
  }
  .demo-metric-val { font-size: 26px; font-weight: 800; }
  .demo-metric-val.g { color: var(--live); }
  .demo-metric-val.b { color: var(--accent); }
  .demo-metric-val.w { color: var(--warn); }
  .demo-metric-label { font-size: 10px; color: var(--muted); margin-top: 2px; letter-spacing: 0.5px; }

  .agent-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 20px; border-bottom: 1px solid var(--border);
  }
  .agent-row:last-child { border-bottom: none; }
  .agent-status { width: 8px; height: 8px; border-radius: 50%; }
  .agent-status.live { background: var(--live); box-shadow: 0 0 6px var(--live); }
  .agent-status.warn { background: var(--warn); }
  .agent-name { font-family: var(--mono); font-size: 12px; flex: 1; }
  .agent-model { font-size: 11px; color: var(--muted); width: 100px; }
  .agent-rps { font-size: 11px; color: var(--accent); width: 60px; text-align: right; }
  .agent-lat { font-size: 11px; color: var(--muted); width: 60px; text-align: right; }
  .agent-bar-wrap { width: 100px; }
  .agent-bar-bg { height: 2px; background: var(--border); border-radius: 1px; }
  .agent-bar-fill { height: 2px; border-radius: 1px; }

  /* ── Pricing */
  .pricing-section { padding: 80px 0 100px; text-align: center; }
  .pricing-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 20px; margin-top: 48px; text-align: left;
  }
  .pricing-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 28px;
  }
  .pricing-card.featured {
    border-color: var(--accent);
    box-shadow: 0 0 40px color-mix(in srgb, var(--accent) 15%, transparent);
  }
  .pricing-plan { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--muted); margin-bottom: 12px; }
  .pricing-price { font-size: 36px; font-weight: 800; margin-bottom: 4px; }
  .pricing-price span { font-size: 14px; font-weight: 400; color: var(--muted); }
  .pricing-desc { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .pricing-features li { font-size: 13px; color: var(--muted); display: flex; gap: 8px; }
  .pricing-features li::before { content: '✓'; color: var(--live); font-weight: 700; }
  .pricing-btn {
    width: 100%; padding: 10px; border-radius: 6px;
    font-size: 13px; font-weight: 600; cursor: pointer; text-align: center;
    border: 1px solid var(--border); background: transparent; color: var(--text);
    text-decoration: none; display: block;
  }
  .pricing-btn.primary {
    background: var(--accent); border-color: var(--accent); color: #fff;
  }

  /* ── CTA */
  .cta-section {
    padding: 80px 0 120px; text-align: center;
  }
  .cta-box {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 64px 48px;
    position: relative; overflow: hidden;
  }
  .cta-box::before {
    content: ''; position: absolute;
    top: -80px; left: 50%; transform: translateX(-50%);
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%);
    pointer-events: none;
  }
  .cta-title { font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; }
  .cta-sub { font-size: 16px; color: var(--muted); max-width: 480px; margin: 0 auto 32px; }

  /* ── Footer */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px 32px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: var(--muted);
    position: relative; z-index: 1;
  }
  footer a { color: var(--muted); text-decoration: none; }
  footer a:hover { color: var(--text); }

  @media (max-width: 768px) {
    .screens-grid, .features-grid, .pricing-grid { grid-template-columns: 1fr; }
    .screen-card.featured { grid-column: 1; }
    .demo-metrics { grid-template-columns: repeat(2, 1fr); }
    nav { flex-wrap: wrap; gap: 12px; }
    .nav-links { display: none; }
  }

  /* ── Animation */
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--live) 40%, transparent); }
    50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--live) 0%, transparent); }
  }
  .live-dot { animation: pulse-glow 2s infinite; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hero > * { animation: fade-up 0.6s ease both; }
  .hero > *:nth-child(2) { animation-delay: 0.1s; }
  .hero > *:nth-child(3) { animation-delay: 0.2s; }
  .hero > *:nth-child(4) { animation-delay: 0.3s; }
  .hero > *:nth-child(5) { animation-delay: 0.4s; }
</style>
</head>
<body>

<!-- Nav -->
<nav>
  <a class="nav-logo" href="#"><span>SIG</span>NAL</a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#demo">Demo</a></li>
    <li><a href="#pricing">Pricing</a></li>
    <li><a href="#docs">Docs</a></li>
  </ul>
  <a class="nav-cta" href="https://ram.zenbin.org/signal-mock">View Prototype →</a>
</nav>

<!-- Hero -->
<div class="container">
  <section class="hero">
    <div class="hero-badge">LLM Observability · Production Ready</div>
    <h1>Every agent,<br>fully visible.</h1>
    <p class="hero-sub">SIGNAL monitors your LLM pipelines in real time — traces, latency, token budgets, and cost — so you can ship AI products with confidence.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/signal-mock" class="btn-primary">Try the prototype</a>
      <a href="https://ram.zenbin.org/signal-viewer" class="btn-secondary">View pen file</a>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-val green">48</span>
        <div class="stat-label">Active agents</div>
      </div>
      <div class="stat-item">
        <span class="stat-val blue">1.2K</span>
        <div class="stat-label">Requests / min</div>
      </div>
      <div class="stat-item">
        <span class="stat-val">284ms</span>
        <div class="stat-label">P99 latency</div>
      </div>
      <div class="stat-item">
        <span class="stat-val">0.3%</span>
        <div class="stat-label">Error rate</div>
      </div>
    </div>
  </section>

  <!-- Demo -->
  <section class="demo-section" id="demo">
    <div class="demo-container">
      <div class="demo-bar">
        <div class="dot dot-r"></div>
        <div class="dot dot-y"></div>
        <div class="dot dot-g"></div>
        <span style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-left:8px">signal.dashboard — live</span>
        <span style="margin-left:auto;font-size:10px;color:var(--live)">● CONNECTED</span>
      </div>
      <div class="demo-metrics">
        <div class="demo-metric">
          <div class="demo-metric-val g">48</div>
          <div class="demo-metric-label">ACTIVE AGENTS</div>
        </div>
        <div class="demo-metric">
          <div class="demo-metric-val b">1,247</div>
          <div class="demo-metric-label">REQ / MIN</div>
        </div>
        <div class="demo-metric">
          <div class="demo-metric-val">284ms</div>
          <div class="demo-metric-label">P99 LATENCY</div>
        </div>
        <div class="demo-metric">
          <div class="demo-metric-val w">0.3%</div>
          <div class="demo-metric-label">ERROR RATE</div>
        </div>
      </div>
      <div style="padding:8px 20px;font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--muted);border-bottom:1px solid var(--border)">ACTIVE AGENTS</div>

      <div class="agent-row">
        <div class="agent-status live live-dot"></div>
        <div class="agent-name">research-agent-01</div>
        <div class="agent-model">gpt-4o</div>
        <div class="agent-rps">18.4 rps</div>
        <div class="agent-lat">312ms</div>
        <div class="agent-bar-wrap">
          <div class="agent-bar-bg"><div class="agent-bar-fill" style="width:72%;background:var(--accent)"></div></div>
        </div>
      </div>
      <div class="agent-row">
        <div class="agent-status live live-dot"></div>
        <div class="agent-name">summarizer-v3</div>
        <div class="agent-model">claude-3-5</div>
        <div class="agent-rps">9.2 rps</div>
        <div class="agent-lat">189ms</div>
        <div class="agent-bar-wrap">
          <div class="agent-bar-bg"><div class="agent-bar-fill" style="width:48%;background:var(--accent)"></div></div>
        </div>
      </div>
      <div class="agent-row">
        <div class="agent-status warn"></div>
        <div class="agent-name">code-reviewer</div>
        <div class="agent-model">gpt-4-turbo</div>
        <div class="agent-rps">4.1 rps</div>
        <div class="agent-lat" style="color:var(--warn)">441ms ▲</div>
        <div class="agent-bar-wrap">
          <div class="agent-bar-bg"><div class="agent-bar-fill" style="width:82%;background:var(--warn)"></div></div>
        </div>
      </div>
      <div class="agent-row">
        <div class="agent-status live live-dot"></div>
        <div class="agent-name">embed-pipeline</div>
        <div class="agent-model">text-embed-3</div>
        <div class="agent-rps">88.0 rps</div>
        <div class="agent-lat">42ms</div>
        <div class="agent-bar-wrap">
          <div class="agent-bar-bg"><div class="agent-bar-fill" style="width:91%;background:var(--live)"></div></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="features-section" id="features">
    <div class="section-label">// capabilities</div>
    <h2 class="section-title">Everything your AI team needs<br>to ship with confidence.</h2>
    <p class="section-sub">From raw LLM traces to dollar-level cost breakdowns, SIGNAL gives you the full picture.</p>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⌥</div>
        <div class="feature-title">Waterfall Traces</div>
        <div class="feature-desc">Visualise every span in your LLM call chain — retrieval, generation, post-processing — with millisecond precision.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">△</div>
        <div class="feature-title">Anomaly Alerts</div>
        <div class="feature-desc">Automated detection for latency spikes, token budget exhaustion, and error rate regression. Paged before users feel it.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⬡</div>
        <div class="feature-title">Model Comparison</div>
        <div class="feature-desc">Side-by-side P99, cost-per-1K-tokens, and health scores across every model in your stack. Switch confidently.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◈</div>
        <div class="feature-title">Real-time Dashboard</div>
        <div class="feature-desc">Live throughput sparklines, active agent counts, and error rates refreshed every second. No stale data.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⊞</div>
        <div class="feature-title">Access Control</div>
        <div class="feature-desc">Per-key permissions, monthly usage tracking with auto-alerts at 80%, and instant revocation.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◉</div>
        <div class="feature-title">SDK Integration</div>
        <div class="feature-desc">One-line wrapping for OpenAI, Anthropic, Gemini. Zero config. Works with LangChain, CrewAI, and custom pipelines.</div>
      </div>
    </div>
  </section>

  <!-- Screens overview -->
  <section class="screens-section">
    <div class="section-label">// design</div>
    <h2 class="section-title">5 screens. Every workflow covered.</h2>
    <div class="screens-grid">
      <div class="screen-card featured">
        <div class="screen-chrome"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div><span class="screen-chrome-title">signal — overview</span></div>
        <div class="screen-body">
          <div class="screen-name">OVERVIEW</div>
          <div class="screen-desc">System health at a glance — 4 key metrics, throughput sparklines, and a live agent list with utilisation bars.</div>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-chrome"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div><span class="screen-chrome-title">signal — traces</span></div>
        <div class="screen-body">
          <div class="screen-name">TRACES</div>
          <div class="screen-desc">Waterfall visualisation of every LLM call chain with per-span timing and token counts.</div>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-chrome"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div><span class="screen-chrome-title">signal — alerts</span></div>
        <div class="screen-body">
          <div class="screen-name">ALERTS</div>
          <div class="screen-desc">Severity-ranked anomaly feed with left accent stripes and one-tap drill-down to the offending pipeline.</div>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-chrome"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div><span class="screen-chrome-title">signal — models</span></div>
        <div class="screen-body">
          <div class="screen-name">MODELS</div>
          <div class="screen-desc">Cross-model P99, cost-per-1K, call volume, and health bars with inline sparklines per model.</div>
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-chrome"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div><span class="screen-chrome-title">signal — api keys</span></div>
        <div class="screen-body">
          <div class="screen-name">API KEYS</div>
          <div class="screen-desc">Monthly token budget gauge, key list with last-used timestamps, permissions, and one-tap revocation.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section class="pricing-section" id="pricing">
    <div class="section-label">// pricing</div>
    <h2 class="section-title">Simple, transparent pricing.</h2>
    <p class="section-sub" style="margin:0 auto">Start free. Scale as your pipelines grow.</p>

    <div class="pricing-grid">
      <div class="pricing-card">
        <div class="pricing-plan">STARTER</div>
        <div class="pricing-price">$0 <span>/month</span></div>
        <div class="pricing-desc">For indie devs and small experiments.</div>
        <ul class="pricing-features">
          <li>Up to 5 agents</li>
          <li>1M tokens / month</li>
          <li>7-day trace retention</li>
          <li>Email alerts</li>
        </ul>
        <a href="#" class="pricing-btn">Get started free</a>
      </div>
      <div class="pricing-card featured">
        <div class="pricing-plan">TEAM</div>
        <div class="pricing-price">$49 <span>/month</span></div>
        <div class="pricing-desc">For growing teams shipping AI products.</div>
        <ul class="pricing-features">
          <li>Unlimited agents</li>
          <li>20M tokens / month</li>
          <li>30-day trace retention</li>
          <li>Slack + PagerDuty alerts</li>
          <li>Model comparison</li>
          <li>10 API keys</li>
        </ul>
        <a href="#" class="pricing-btn primary">Start free trial</a>
      </div>
      <div class="pricing-card">
        <div class="pricing-plan">ENTERPRISE</div>
        <div class="pricing-price">Custom</div>
        <div class="pricing-desc">For orgs with serious scale and compliance needs.</div>
        <ul class="pricing-features">
          <li>Unlimited everything</li>
          <li>SSO + SAML</li>
          <li>On-prem deployment</li>
          <li>SLA guarantee</li>
          <li>Dedicated support</li>
        </ul>
        <a href="#" class="pricing-btn">Contact sales</a>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="cta-box">
      <h2 class="cta-title">Your agents are running.<br>Are you watching?</h2>
      <p class="cta-sub">Start monitoring in under 5 minutes. One SDK call, full observability.</p>
      <a href="https://ram.zenbin.org/signal-mock" class="btn-primary">Try the interactive mock →</a>
    </div>
  </section>
</div>

<!-- Footer -->
<footer>
  <span>SIGNAL — AI Pipeline Observability · RAM Design Studio</span>
  <span>Built with <a href="https://ram.zenbin.org">ram.zenbin.org</a></span>
</footer>

</body>
</html>`;

await zenPost(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log(`  ✓ Hero → https://ram.zenbin.org/${SLUG}`);

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Viewer
// ─────────────────────────────────────────────────────────────────────────────
console.log('[2/5] Building viewer page…');

const penJson = fs.readFileSync(path.join(__dirname, 'signal.pen'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SIGNAL — Pen Viewer</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#07090F;color:#D6E0F0;font-family:Inter,system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 16px}
  .logo{font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:3px;color:#5A6882;margin-bottom:32px}
  .logo span{color:#4B7FFF}
  .frame{width:100%;max-width:900px;background:#0E1219;border:1px solid #1C2333;border-radius:16px;overflow:hidden;box-shadow:0 32px 100px rgba(0,0,0,.7)}
  .chrome{background:#1A2035;padding:12px 20px;display:flex;align-items:center;gap:6px;border-bottom:1px solid #1C2333}
  .dot{width:10px;height:10px;border-radius:50%}
  .r{background:#FF4D6A}.y{background:#FF9052}.g{background:#1EE8A8}
  .chrome-title{font-family:monospace;font-size:11px;color:#5A6882;margin-left:12px}
  .screen-tabs{display:flex;gap:0;border-bottom:1px solid #1C2333;overflow-x:auto}
  .tab{padding:10px 20px;font-size:11px;font-weight:600;letter-spacing:.5px;color:#5A6882;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:color .2s}
  .tab.active{color:#4B7FFF;border-bottom-color:#4B7FFF}
  .content{padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .info-card{background:#1A2035;border:1px solid #1C2333;border-radius:10px;padding:16px}
  .info-label{font-size:9px;font-weight:700;letter-spacing:1.5px;color:#5A6882;margin-bottom:8px}
  .info-val{font-size:13px;color:#D6E0F0;line-height:1.5}
  .node-list{font-family:monospace;font-size:10px;color:#4B7FFF;line-height:1.8;max-height:300px;overflow-y:auto}
  .meta-grid{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .meta-card{background:#1A2035;border:1px solid #1C2333;border-radius:8px;padding:14px;text-align:center}
  .meta-val{font-size:22px;font-weight:800;color:#4B7FFF}
  .meta-label{font-size:9px;color:#5A6882;margin-top:3px;letter-spacing:.5px}
  .inspiration{grid-column:1/-1;background:#1A2035;border:1px solid #4B7FFF33;border-left:3px solid #4B7FFF;border-radius:8px;padding:16px;font-size:12px;color:#8A9CC0;line-height:1.6}
  .back{margin-top:24px;color:#5A6882;font-size:12px;text-decoration:none}
  .back:hover{color:#D6E0F0}
  .live-badge{display:inline-flex;align-items:center;gap:5px;background:#1EE8A822;border:1px solid #1EE8A844;border-radius:99px;padding:4px 10px;font-size:9px;color:#1EE8A8;margin-left:auto}
</style>
<script>window.SIGNAL_PLACEHOLDER=true;</script>
</head>
<body>
<div class="logo"><span>SIG</span>NAL · PEN VIEWER</div>
<div class="frame">
  <div class="chrome">
    <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
    <span class="chrome-title">signal.pen — v2.8</span>
    <div class="live-badge">● EMBEDDED</div>
  </div>
  <div class="screen-tabs" id="tabs"></div>
  <div class="content" id="content">
    <div class="meta-grid" id="meta"></div>
    <div class="inspiration" id="insp"></div>
    <div class="info-card" style="grid-column:1/-1"><div class="info-label">NODES</div><div class="node-list" id="nodes"></div></div>
  </div>
</div>
<a class="back" href="https://ram.zenbin.org/signal">← Back to SIGNAL hero page</a>
<script>
const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
if (pen) {
  // Meta row
  const meta = document.getElementById('meta');
  [
    {v: pen.screens.length,          l: 'SCREENS'},
    {v: pen.screens.reduce((a,s)=>a+s.nodes.length,0), l: 'TOTAL NODES'},
    {v: pen.meta.theme.mode.toUpperCase(), l: 'THEME'},
    {v: pen.meta.tags.length,        l: 'TAGS'},
  ].forEach(({v,l}) => {
    meta.innerHTML += '<div class="meta-card"><div class="meta-val">'+v+'</div><div class="meta-label">'+l+'</div></div>';
  });

  // Inspiration
  document.getElementById('insp').textContent = '✦ ' + pen.meta.inspiration;

  // Tabs
  const tabs = document.getElementById('tabs');
  const nodesEl = document.getElementById('nodes');
  let active = 0;
  function renderScreen(i) {
    active = i;
    tabs.querySelectorAll('.tab').forEach((t,j) => t.className = 'tab' + (j===i?' active':''));
    const s = pen.screens[i];
    nodesEl.innerHTML = s.nodes.map(n =>
      '  ' + n.type.padEnd(14) + ' · ' + (n.content || n.fills?.[0]?.color ? (n.content||'').slice(0,40) : '[shape]')
    ).join('<br>');
  }
  pen.screens.forEach((s,i) => {
    const t = document.createElement('div');
    t.className = 'tab' + (i===0?' active':'');
    t.textContent = s.name + ' (' + s.nodes.length + ')';
    t.onclick = () => renderScreen(i);
    tabs.appendChild(t);
  });
  renderScreen(0);
}
</script>
</body>
</html>`;

viewerHtml = viewerHtml.replace('<script>window.SIGNAL_PLACEHOLDER=true;</script>', injection);

await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
console.log(`  ✓ Viewer → https://ram.zenbin.org/${SLUG}-viewer`);

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Svelte mock
// ─────────────────────────────────────────────────────────────────────────────
console.log('[3/5] Building Svelte mock…');

const design = {
  appName:   'SIGNAL',
  tagline:   'AI Pipeline Observability',
  archetype: 'developer-tools',
  palette: {
    bg:      '#07090F',
    surface: '#0E1219',
    text:    '#D6E0F0',
    accent:  '#4B7FFF',
    accent2: '#1EE8A8',
    muted:   'rgba(90,104,130,0.8)',
  },
  lightPalette: {
    bg:      '#F0F2F7',
    surface: '#FFFFFF',
    text:    '#0F1724',
    accent:  '#2B5CE8',
    accent2: '#00B87A',
    muted:   'rgba(80,100,130,0.55)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Agents', value: '48' },
          { label: 'Req/min',       value: '1.2K' },
          { label: 'P99',           value: '284ms' },
          { label: 'Error Rate',    value: '0.3%' },
        ]},
        { type: 'text', label: 'Pipeline Health', value: 'All 4 critical pipelines nominal. code-reviewer showing elevated latency (441ms avg) — monitoring.' },
        { type: 'list', items: [
          { icon: 'activity', title: 'research-agent-01', sub: 'gpt-4o · 18.4 rps', badge: '312ms' },
          { icon: 'activity', title: 'summarizer-v3',     sub: 'claude-3-5 · 9.2 rps', badge: '189ms' },
          { icon: 'alert',    title: 'code-reviewer',     sub: 'gpt-4-turbo · 4.1 rps', badge: '441ms !' },
          { icon: 'zap',      title: 'embed-pipeline',    sub: 'text-embed-3 · 88.0 rps', badge: '42ms' },
        ]},
        { type: 'progress', items: [
          { label: 'research-agent-01 util', pct: 72 },
          { label: 'summarizer-v3 util',     pct: 48 },
          { label: 'code-reviewer util',     pct: 82 },
          { label: 'embed-pipeline util',    pct: 91 },
        ]},
      ],
    },
    {
      id: 'traces', label: 'Traces',
      content: [
        { type: 'tags', label: 'Filters', items: ['All', 'Errors', 'Slow >500ms', 'GPT-4o', 'Claude'] },
        { type: 'list', items: [
          { icon: 'code',  title: 'trc_8f2a91 · research-pipeline', sub: 'retrieval 45ms → gpt-4o 712ms → postproc 135ms', badge: '892ms' },
          { icon: 'code',  title: 'trc_1c44fe · summarizer-v3',     sub: 'claude-3-5 189ms → format 42ms', badge: '231ms' },
          { icon: 'alert', title: 'trc_9d77bc · code-reviewer',      sub: 'parse 88ms → gpt-4-turbo 1240ms → lint 113ms', badge: '1441ms !' },
          { icon: 'zap',   title: 'trc_3a10d2 · embed-pipeline',    sub: 'embed 38ms → store 4ms', badge: '42ms' },
        ]},
        { type: 'metric', label: 'Avg tokens / trace', value: '3,358', sub: 'across last 1000 traces' },
        { type: 'metric', label: 'Traces / hour',      value: '71.4K', sub: 'current rate' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '0' },
          { label: 'Warning',  value: '3' },
          { label: 'Info',     value: '11' },
          { label: 'Resolved', value: '24' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'P99 latency spike detected',     sub: 'code-reviewer exceeded 1400ms threshold · 2m ago', badge: 'WARN' },
          { icon: 'alert', title: 'Token budget near limit',         sub: 'research-agent-01 at 87% of hourly budget · 8m ago', badge: 'WARN' },
          { icon: 'alert', title: 'Embedding cache miss rate high',  sub: 'embed-pipeline at 64% miss rate (normal <30%) · 14m ago', badge: 'WARN' },
          { icon: 'check', title: 'New model version available',     sub: 'gpt-4o-2025-03 ready for zero-downtime rollout · 1h ago', badge: 'INFO' },
          { icon: 'check', title: 'Summarizer-v3 auto-scaled',       sub: '+2 instances in us-east-1 · 1h ago', badge: 'INFO' },
        ]},
      ],
    },
    {
      id: 'models', label: 'Models',
      content: [
        { type: 'list', items: [
          { icon: 'star',   title: 'gpt-4o',         sub: 'OpenAI · 48.2K calls · 95% health', badge: '$0.024/1K' },
          { icon: 'star',   title: 'claude-3-5',      sub: 'Anthropic · 31.0K calls · 98% health', badge: '$0.018/1K' },
          { icon: 'alert',  title: 'gpt-4-turbo',     sub: 'OpenAI · 12.4K calls · 78% health', badge: '$0.031/1K' },
          { icon: 'search', title: 'gemini-1.5-pro',  sub: 'Google · 8.9K calls · 91% health', badge: '$0.014/1K' },
          { icon: 'zap',    title: 'text-embed-3',    sub: 'OpenAI · 204K calls · 100% health', badge: '$0.001/1K' },
        ]},
        { type: 'progress', items: [
          { label: 'gpt-4o health',        pct: 95 },
          { label: 'claude-3-5 health',    pct: 98 },
          { label: 'gpt-4-turbo health',   pct: 78 },
          { label: 'gemini-1.5-pro health', pct: 91 },
        ]},
        { type: 'metric', label: 'Total spend this month', value: '$486', sub: '−12% vs last month' },
      ],
    },
    {
      id: 'keys', label: 'Keys',
      content: [
        { type: 'metric', label: 'Monthly token usage', value: '68%', sub: '13.6M of 20M tokens · resets Apr 1' },
        { type: 'progress', items: [{ label: 'Token budget', pct: 68 }] },
        { type: 'list', items: [
          { icon: 'lock', title: 'Production',  sub: 'sig_live_8f2a...c9d1 · Read/Write · used 2m ago', badge: 'LIVE' },
          { icon: 'lock', title: 'Staging',     sub: 'sig_test_1c44...77bc · Read/Write · used 1h ago', badge: 'LIVE' },
          { icon: 'eye',  title: 'Analytics',   sub: 'sig_live_9d77...a901 · Read only · used 3h ago', badge: 'READ' },
          { icon: 'user', title: 'Dev (Jake)',   sub: 'sig_test_3a10...f822 · Read/Write · used 2d ago', badge: 'OFF' },
        ]},
        { type: 'text', label: 'Cost this month', value: '$486 total · $0.024 avg per 1K tokens · −12% vs March 2025' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'traces',   label: 'Traces',   icon: 'activity' },
    { id: 'alerts',   label: 'Alerts',   icon: 'alert' },
    { id: 'models',   label: 'Models',   icon: 'layers' },
    { id: 'keys',     label: 'Keys',     icon: 'lock' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const mockHtml = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const mockResult = await publishMock(mockHtml, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
console.log(`  ✓ Mock → ${mockResult.url}`);

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Gallery queue
// ─────────────────────────────────────────────────────────────────────────────
console.log('[4/5] Pushing to gallery queue…');

const config   = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN    = config.GITHUB_TOKEN;
const REPO     = config.GITHUB_REPO;

const ghHeaders = {
  'Authorization': `token ${TOKEN}`,
  'User-Agent':    'ram-heartbeat/1.0',
  'Accept':        'application/vnd.github.v3+json',
};

const getRes = await ghReq({
  hostname: 'api.github.com',
  path:     `/repos/${REPO}/contents/queue.json`,
  method:   'GET',
  headers:  ghHeaders,
});

const fileData      = JSON.parse(getRes.body);
const currentSha    = fileData.sha;
const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

let queue = JSON.parse(currentContent);
if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];

const newEntry = {
  id:           `heartbeat-${SLUG}-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      TAGLINE,
  archetype:    ARCHETYPE,
  design_url:   `https://ram.zenbin.org/${SLUG}`,
  mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       PROMPT,
  screens:      5,
  source:       'heartbeat',
};

queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody    = JSON.stringify({
  message: `add: ${APP_NAME} to gallery (heartbeat)`,
  content: newContent,
  sha:     currentSha,
});

const putRes = await ghReq({
  hostname: 'api.github.com',
  path:     `/repos/${REPO}/contents/queue.json`,
  method:   'PUT',
  headers:  { ...ghHeaders, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody) },
}, putBody);

console.log(`  ✓ Gallery queue → ${putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120)}`);

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — Design DB index
// ─────────────────────────────────────────────────────────────────────────────
console.log('[5/5] Indexing in design DB…');
const db = openDB();
upsertDesign(db, { ...newEntry });
rebuildEmbeddings(db);
console.log('  ✓ Indexed in design DB');

console.log('\n✦ SIGNAL publish complete!');
console.log(`  Hero   → https://ram.zenbin.org/${SLUG}`);
console.log(`  Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`  Mock   → https://ram.zenbin.org/${SLUG}-mock`);
