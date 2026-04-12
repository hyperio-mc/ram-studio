#!/usr/bin/env node
// ZENITH — Hero page + viewer publisher

const fs = require('fs');
const https = require('https');

const SLUG = 'zenith-ops';
const APP_NAME = 'ZENITH';
const TAGLINE = 'Command your AI fleet';
const SUBDOMAIN = 'ram';

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

// ─── HERO HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ZENITH — Command your AI fleet</title>
  <meta name="description" content="ZENITH is a dark AI operations command center. Monitor your agent fleet, manage missions, and triage anomalies in real time.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #050810; --surface: #0C1220; --surface-alt: #111827;
      --text: #E8EEFF; --muted: rgba(232,238,255,0.40);
      --accent: #00CFFF; --accent2: #8B5CF6;
      --accent-soft: rgba(0,207,255,0.10); --accent2-soft: rgba(139,92,246,0.10);
      --border: rgba(232,238,255,0.07); --border-strong: rgba(232,238,255,0.14);
      --border-accent: rgba(0,207,255,0.25);
      --green: #00F5A0; --orange: #FF9A3C; --red: #FF4D6A;
      --green-soft: rgba(0,245,160,0.10); --orange-soft: rgba(255,154,60,0.10);
      --grid: rgba(232,238,255,0.03);
    }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; min-height: 100vh; overflow-x: hidden; }
    body::before { content: ''; position: fixed; inset: 0; background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
    .orb { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
    .orb-1 { width: 600px; height: 600px; top: -200px; left: -150px; background: rgba(0,207,255,0.07); }
    .orb-2 { width: 500px; height: 500px; bottom: -100px; right: -100px; background: rgba(139,92,246,0.07); }
    a { color: var(--accent); text-decoration: none; }
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(5,8,16,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 56px; }
    .nav-brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.08em; }
    .nav-ver { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted); background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 2px 6px; }
    .nav-badge { display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--green); background: var(--green-soft); border: 1px solid rgba(0,245,160,0.2); border-radius: 4px; padding: 3px 8px; }
    .nav-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { color: var(--muted); font-size: 13px; font-weight: 500; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta { background: var(--accent); color: #050810; font-size: 13px; font-weight: 600; padding: 8px 18px; border-radius: 6px; }
    .nav-cta:hover { background: #33d8ff; }

    .hero { position: relative; z-index: 1; padding: 140px 80px 80px; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .hero-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.15em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; }
    .hero-headline { font-size: 56px; font-weight: 800; line-height: 1.08; letter-spacing: -0.03em; margin-bottom: 24px; }
    .highlight { background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-sub { font-size: 17px; color: var(--muted); line-height: 1.65; max-width: 420px; margin-bottom: 36px; }
    .hero-ctas { display: flex; gap: 12px; align-items: center; }
    .btn-primary { background: var(--accent); color: #050810; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 7px; display: inline-block; }
    .btn-primary:hover { background: #33d8ff; }
    .btn-ghost { background: transparent; color: var(--text); font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 7px; border: 1px solid var(--border-strong); }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
    .hero-stats { display: flex; gap: 32px; margin-top: 48px; padding-top: 36px; border-top: 1px solid var(--border); }
    .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
    .stat-value .up { color: var(--green); }
    .stat-label { font-size: 12px; color: var(--muted); margin-top: 2px; }

    .hero-mock { position: relative; background: var(--surface); border: 1px solid var(--border-strong); border-radius: 12px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,207,255,0.12); }
    .mock-topbar { background: rgba(5,8,16,0.8); border-bottom: 1px solid var(--border); padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
    .mock-brand { display: flex; align-items: center; gap: 8px; font-weight: 600; letter-spacing: 0.08em; }
    .mock-title { color: var(--muted); }
    .mock-live { display: flex; align-items: center; gap: 5px; background: var(--green-soft); border: 1px solid rgba(0,245,160,0.2); padding: 2px 8px; border-radius: 4px; color: var(--green); font-size: 10px; }
    .mock-live::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
    .mock-ticker { background: rgba(0,207,255,0.04); border-bottom: 1px solid var(--border); padding: 8px 16px; display: flex; gap: 24px; overflow: hidden; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
    .ti { display: flex; gap: 6px; white-space: nowrap; }
    .tl { color: var(--muted); } .tv { color: var(--text); font-weight: 600; } .td { color: var(--green); }
    .mock-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12px; }
    .agent-card { background: var(--surface-alt, #111827); border: 1px solid var(--border); border-radius: 8px; padding: 10px; }
    .agent-card.warn { border-color: rgba(255,154,60,0.3); }
    .aid { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--muted); margin-bottom: 4px; }
    .aname { font-size: 12px; font-weight: 700; margin-bottom: 2px; }
    .arole { font-size: 10px; color: var(--muted); margin-bottom: 8px; }
    .astatus { display: flex; align-items: center; gap: 5px; font-size: 10px; }
    .sdot { width: 6px; height: 6px; border-radius: 50%; }
    .sdot.active { background: var(--green); box-shadow: 0 0 6px var(--green); }
    .sdot.idle { background: var(--muted); }
    .sdot.warn { background: var(--orange); box-shadow: 0 0 6px var(--orange); }
    .atasks { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--accent); margin-top: 4px; }
    .mock-missions { padding: 0 12px 12px; }
    .ml { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--muted); letter-spacing: 0.1em; margin-bottom: 8px; }
    .mrow { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .mname { font-size: 11px; font-weight: 500; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mpw { width: 80px; height: 3px; background: var(--border); border-radius: 2px; }
    .mpf { height: 3px; border-radius: 2px; background: var(--accent); }
    .mpf.fin { background: var(--orange); }
    .mpct { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted); min-width: 28px; text-align: right; }

    .ticker-strip { position: relative; z-index: 1; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: rgba(12,18,32,0.8); padding: 12px 0; overflow: hidden; }
    .ticker-inner { display: flex; gap: 48px; animation: scroll 30s linear infinite; white-space: nowrap; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .tk { display: flex; gap: 8px; } .tk-l { color: var(--muted); font-size: 10px; } .tk-v { color: var(--text); font-weight: 600; } .tk-d { color: var(--green); } .tk-sep { color: var(--border-strong); }

    .section { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 80px 80px; }
    .section-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.15em; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; }
    .section-title { font-size: 36px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 48px; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 28px; transition: border-color 0.2s, transform 0.2s; }
    .feature-card:hover { border-color: var(--border-accent); transform: translateY(-2px); }
    .feature-icon { width: 36px; height: 36px; border-radius: 8px; background: var(--accent-soft); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; font-size: 16px; margin-bottom: 16px; }
    .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
    .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

    .screens-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .screen-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .screen-header { background: rgba(5,8,16,0.6); border-bottom: 1px solid var(--border); padding: 12px 16px; display: flex; align-items: center; gap: 8px; }
    .screen-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-strong); }
    .screen-dot.a { background: var(--accent); box-shadow: 0 0 8px var(--accent); }
    .screen-name { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); margin-left: 8px; }
    .screen-body { padding: 20px; }
    .screen-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .screen-desc { font-size: 13px; color: var(--muted); line-height: 1.55; }

    .stats-band { position: relative; z-index: 1; background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .stats-inner { max-width: 1200px; margin: 0 auto; padding: 48px 80px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center; }
    .bsv { font-size: 42px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 6px; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .bsl { font-size: 13px; color: var(--muted); }

    footer { position: relative; z-index: 1; border-top: 1px solid var(--border); padding: 40px 80px; max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .footer-brand { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; }
    .footer-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }
    .footer-link { font-size: 13px; color: var(--muted); }
    .footer-link:hover { color: var(--accent); }
    @media (max-width: 900px) { .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; } .hero-mock { display: none; } .section { padding: 60px 24px; } .features-grid { grid-template-columns: 1fr; } .screens-grid { grid-template-columns: 1fr; } .stats-inner { grid-template-columns: repeat(2,1fr); padding: 40px 24px; } nav { padding: 0 24px; } .nav-links { display: none; } footer { padding: 40px 24px; flex-direction: column; gap: 16px; } }
  </style>
</head>
<body>
  <div class="orb orb-1"></div><div class="orb orb-2"></div>

  <nav>
    <div class="nav-brand"><span>ZENITH</span><span class="nav-ver">v2.4</span></div>
    <div class="nav-links"><a href="#features">Features</a><a href="#screens">Screens</a><a href="#viewer">Prototype</a></div>
    <div style="display:flex;align-items:center;gap:12px">
      <div class="nav-badge">LIVE</div>
      <a href="https://ram.zenbin.org/zenith-ops-viewer" class="nav-cta">Open Prototype →</a>
    </div>
  </nav>

  <section class="hero">
    <div>
      <div class="hero-eyebrow">AI Operations Command</div>
      <h1 class="hero-headline">Command your<br><span class="highlight">AI fleet</span><br>in real time</h1>
      <p class="hero-sub">ZENITH gives you total situational awareness over your AI agents. Monitor health, assign missions, triage anomalies — all from a single ops center.</p>
      <div class="hero-ctas">
        <a href="https://ram.zenbin.org/zenith-ops-viewer" class="btn-primary">Open Prototype →</a>
        <a href="https://ram.zenbin.org/zenith-ops-mock" class="btn-ghost">Interactive Mock ☀◑</a>
      </div>
      <div class="hero-stats">
        <div><div class="stat-value"><span class="up">99.7%</span></div><div class="stat-label">Fleet uptime</div></div>
        <div><div class="stat-value">12</div><div class="stat-label">Active agents</div></div>
        <div><div class="stat-value">96.4%</div><div class="stat-label">Success rate</div></div>
      </div>
    </div>

    <div class="hero-mock">
      <div class="mock-topbar">
        <div class="mock-brand"><span>ZENITH</span><span class="mock-title">&nbsp;FLEET COMMAND</span></div>
        <div class="mock-live">LIVE</div>
      </div>
      <div class="mock-ticker">
        <div class="ti"><span class="tl">UPTIME</span><span class="tv">99.7%</span><span class="td">↑</span></div>
        <div class="ti"><span class="tl">TASKS</span><span class="tv">1,847</span><span class="td">+23%</span></div>
        <div class="ti"><span class="tl">LATENCY</span><span class="tv">312ms</span><span class="td">−18ms</span></div>
        <div class="ti"><span class="tl">SUCCESS</span><span class="tv">96.4%</span></div>
      </div>
      <div class="mock-grid">
        <div class="agent-card"><div class="aid">AG-01</div><div class="aname">Nexus</div><div class="arole">Orchestrator</div><div class="astatus"><span class="sdot active"></span><span>active</span></div><div class="atasks">342 tasks</div></div>
        <div class="agent-card"><div class="aid">AG-02</div><div class="aname">Scout</div><div class="arole">Researcher</div><div class="astatus"><span class="sdot active"></span><span>active</span></div><div class="atasks">215 tasks</div></div>
        <div class="agent-card"><div class="aid">AG-03</div><div class="aname">Forge</div><div class="arole">Code Writer</div><div class="astatus"><span class="sdot active"></span><span>active</span></div><div class="atasks">189 tasks</div></div>
        <div class="agent-card"><div class="aid">AG-04</div><div class="aname">Prism</div><div class="arole">Analyzer</div><div class="astatus"><span class="sdot active"></span><span>active</span></div><div class="atasks">407 tasks</div></div>
        <div class="agent-card"><div class="aid">AG-05</div><div class="aname">Echo</div><div class="arole">Summarizer</div><div class="astatus"><span class="sdot idle"></span><span style="color:var(--muted)">idle</span></div><div class="atasks">93 tasks</div></div>
        <div class="agent-card warn"><div class="aid">AG-07</div><div class="aname">Relay</div><div class="arole">Dispatcher</div><div class="astatus"><span class="sdot warn"></span><span style="color:var(--orange)">warning</span></div><div class="atasks">278 tasks</div></div>
      </div>
      <div class="mock-missions">
        <div class="ml">ACTIVE MISSIONS</div>
        <div class="mrow"><div class="mname">Q2 Market Analysis</div><div class="mpw"><div class="mpf" style="width:67%"></div></div><div class="mpct">67%</div></div>
        <div class="mrow"><div class="mname">Codebase Refactor</div><div class="mpw"><div class="mpf" style="width:23%"></div></div><div class="mpct">23%</div></div>
        <div class="mrow"><div class="mname">Content Pipeline</div><div class="mpw"><div class="mpf fin" style="width:89%"></div></div><div class="mpct">89%</div></div>
      </div>
    </div>
  </section>

  <div class="ticker-strip">
    <div class="ticker-inner">
      <div class="tk"><span class="tk-l">UPTIME</span><span class="tk-v">99.7%</span><span class="tk-d">↑+0.2%</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">TASKS TODAY</span><span class="tk-v">1,847</span><span class="tk-d">↑+23%</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">AVG LATENCY</span><span class="tk-v">312ms</span><span class="tk-d">↓−18ms</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">SUCCESS RATE</span><span class="tk-v">96.4%</span><span class="tk-d">↑+1.1%</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">TOKENS USED</span><span class="tk-v">4.2M</span><span class="tk-d">62% budget</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">ACTIVE MISSIONS</span><span class="tk-v">4</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">UPTIME</span><span class="tk-v">99.7%</span><span class="tk-d">↑+0.2%</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">TASKS TODAY</span><span class="tk-v">1,847</span><span class="tk-d">↑+23%</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">AVG LATENCY</span><span class="tk-v">312ms</span><span class="tk-d">↓−18ms</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">SUCCESS RATE</span><span class="tk-v">96.4%</span><span class="tk-d">↑+1.1%</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">TOKENS USED</span><span class="tk-v">4.2M</span><span class="tk-d">62% budget</span></div><div class="tk-sep">·</div>
      <div class="tk"><span class="tk-l">ACTIVE MISSIONS</span><span class="tk-v">4</span></div>
    </div>
  </div>

  <section class="section" id="features">
    <div class="section-label">Capabilities</div>
    <h2 class="section-title">Everything you need to<br>operate your AI fleet</h2>
    <div class="features-grid">
      <div class="feature-card"><div class="feature-icon">⚡</div><div class="feature-title">Live Fleet Monitoring</div><div class="feature-desc">Real-time visibility into every agent's status, task count, uptime, and health. Scrolling metrics ticker keeps you situationally aware at a glance.</div></div>
      <div class="feature-card"><div class="feature-icon">🎯</div><div class="feature-title">Mission Control</div><div class="feature-desc">Kanban pipeline: queued → running → finalizing → done. Drill into any mission for a step-by-step execution timeline with agent assignments.</div></div>
      <div class="feature-card"><div class="feature-icon">🔔</div><div class="feature-title">Anomaly Triage</div><div class="feature-desc">Severity-sorted alert log with one-click intervention. Critical, warning, and info channels keep signal-to-noise ratio high.</div></div>
      <div class="feature-card"><div class="feature-icon">🚀</div><div class="feature-title">Agent Deployment</div><div class="feature-desc">4-step wizard: name → model → capabilities → launch. Choose from GPT-4o, Claude 3.6, Gemini 1.5, or lightweight mini models.</div></div>
      <div class="feature-card"><div class="feature-icon">📊</div><div class="feature-title">Analytics & Cost</div><div class="feature-desc">7-day throughput charts, per-agent token cost breakdown, and mission performance tables. Know exactly where your compute goes.</div></div>
      <div class="feature-card"><div class="feature-icon">🔗</div><div class="feature-title">Agent-to-Agent Comms</div><div class="feature-desc">Orchestrate multi-agent missions with built-in handoff tracing. Full latency telemetry on every Scout ↔ Prism collaboration.</div></div>
    </div>
  </section>

  <section class="section" id="screens">
    <div class="section-label">6 Screens</div>
    <h2 class="section-title">A full ops center, screen by screen</h2>
    <div class="screens-grid">
      <div class="screen-card"><div class="screen-header"><div class="screen-dot a"></div><div class="screen-dot"></div><div class="screen-dot"></div><div class="screen-name">01 — COMMAND</div></div><div class="screen-body"><div class="screen-title">Fleet Command Center</div><div class="screen-desc">Live agent grid (9 agents), scrolling metrics ticker, and active mission progress strip — total situational awareness in one view.</div></div></div>
      <div class="screen-card"><div class="screen-header"><div class="screen-dot a"></div><div class="screen-dot"></div><div class="screen-dot"></div><div class="screen-name">02 — AGENTS</div></div><div class="screen-body"><div class="screen-title">Agent Roster</div><div class="screen-desc">Expanded profile with capability tags, 7-day uptime sparkline, success rate, and avg latency. Filterable table for the full fleet.</div></div></div>
      <div class="screen-card"><div class="screen-header"><div class="screen-dot a"></div><div class="screen-dot"></div><div class="screen-dot"></div><div class="screen-name">03 — MISSIONS</div></div><div class="screen-body"><div class="screen-title">Mission Control</div><div class="screen-desc">4-column kanban with step-by-step execution timeline. Critical missions flagged, agent handoffs traced, ETAs always visible.</div></div></div>
      <div class="screen-card"><div class="screen-header"><div class="screen-dot a"></div><div class="screen-dot"></div><div class="screen-dot"></div><div class="screen-name">04 — ALERTS</div></div><div class="screen-body"><div class="screen-title">Alert Center</div><div class="screen-desc">Severity summary (0 critical, 3 warning, 7 info), chronological log with agent attribution, and one-click intervention actions.</div></div></div>
      <div class="screen-card"><div class="screen-header"><div class="screen-dot a"></div><div class="screen-dot"></div><div class="screen-dot"></div><div class="screen-name">05 — DEPLOY</div></div><div class="screen-body"><div class="screen-title">Deploy Agent</div><div class="screen-desc">4-step wizard with model radio cards (latency + cost shown), capability toggle grid, and save-as-template support.</div></div></div>
      <div class="screen-card"><div class="screen-header"><div class="screen-dot a"></div><div class="screen-dot"></div><div class="screen-dot"></div><div class="screen-name">06 — ANALYTICS</div></div><div class="screen-body"><div class="screen-title">Analytics Dashboard</div><div class="screen-desc">KPI tiles, 7-day area chart (tasks + success), horizontal bar (token cost by agent), mission performance data table.</div></div></div>
    </div>
  </section>

  <div class="stats-band">
    <div class="stats-inner">
      <div><div class="bsv">12</div><div class="bsl">Concurrent agents</div></div>
      <div><div class="bsv">4</div><div class="bsl">Active model providers</div></div>
      <div><div class="bsv">96.4%</div><div class="bsl">Mission success rate</div></div>
      <div><div class="bsv">6</div><div class="bsl">Prototype screens</div></div>
    </div>
  </div>

  <footer id="viewer">
    <div>
      <div class="footer-brand">ZENITH</div>
      <div class="footer-sub">RAM Design Heartbeat · March 2026</div>
      <div class="footer-sub" style="margin-top:6px;font-size:11px">Inspired by Midday.ai on DarkModeDesign.com + Traffic Productions on Godly.website</div>
    </div>
    <div style="display:flex;gap:20px">
      <a href="https://ram.zenbin.org/zenith-ops-viewer" class="footer-link">Prototype →</a>
      <a href="https://ram.zenbin.org/zenith-ops-mock" class="footer-link">Interactive ☀◑</a>
    </div>
  </footer>
</body>
</html>`;

// ─── VIEWER HTML ─────────────────────────────────────────────────────────────
const viewerHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ZENITH — Prototype Viewer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script>
  // EMBEDDED_PEN will be injected here
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #050810; color: #E8EEFF; font-family: 'Inter', sans-serif; min-height: 100vh; }
    .viewer-header { background: rgba(5,8,16,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(232,238,255,0.07); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
    .viewer-brand { font-size: 14px; font-weight: 700; letter-spacing: 0.08em; }
    .viewer-tag { font-size: 12px; color: rgba(232,238,255,0.4); margin-top: 2px; }
    .viewer-actions { display: flex; gap: 10px; }
    .viewer-btn { font-size: 12px; padding: 6px 14px; border-radius: 6px; cursor: pointer; background: #00CFFF; color: #050810; border: none; font-weight: 600; text-decoration: none; }
    .viewer-btn.ghost { background: transparent; color: #E8EEFF; border: 1px solid rgba(232,238,255,0.14); }
    .viewer-body { max-width: 960px; margin: 0 auto; padding: 40px 24px; }
    .screen-nav { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
    .nav-pill { padding: 8px 16px; border-radius: 99px; font-size: 13px; font-weight: 500; background: rgba(12,18,32,1); border: 1px solid rgba(232,238,255,0.12); cursor: pointer; color: #E8EEFF; transition: all 0.15s; }
    .nav-pill.active { background: #00CFFF; color: #050810; border-color: #00CFFF; }
    .screen-panel { display: none; animation: fadeIn 0.2s ease; }
    .screen-panel.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .ops-window { background: #0C1220; border: 1px solid rgba(232,238,255,0.10); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.5); margin-bottom: 20px; }
    .ops-bar { background: rgba(5,8,16,0.7); border-bottom: 1px solid rgba(232,238,255,0.07); display: flex; align-items: center; padding: 0 16px; height: 38px; gap: 10px; }
    .ops-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(232,238,255,0.4); }
    .ops-title { flex: 1; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.05em; color: #E8EEFF; }
    .ops-live { font-family: 'JetBrains Mono', monospace; font-size: 9px; background: rgba(0,245,160,0.1); color: #00F5A0; border: 1px solid rgba(0,245,160,0.2); padding: 2px 6px; border-radius: 3px; }
    .wbody { padding: 24px; }
    pre { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; line-height: 1.7; color: rgba(232,238,255,0.7); background: rgba(5,8,16,0.5); border: 1px solid rgba(232,238,255,0.07); border-radius: 8px; padding: 16px; overflow-x: auto; white-space: pre-wrap; }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
    p { font-size: 13px; color: rgba(232,238,255,0.5); line-height: 1.65; margin-bottom: 16px; }
    .meta-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; margin-bottom: 20px; }
    .meta-pill { background: rgba(0,207,255,0.08); border: 1px solid rgba(0,207,255,0.2); border-radius: 5px; padding: 4px 10px; font-size: 11px; color: #00CFFF; font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <div class="viewer-header">
    <div><div class="viewer-brand">ZENITH</div><div class="viewer-tag">Prototype Viewer · 6 screens</div></div>
    <div class="viewer-actions">
      <a href="/zenith-ops" class="viewer-btn ghost">← Hero</a>
      <a href="/zenith-ops-mock" class="viewer-btn">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="viewer-body">
    <div class="screen-nav" id="screenNav"></div>
    <div id="screenPanels"></div>
  </div>
  <script>
    const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
    if (pen) {
      const nav = document.getElementById('screenNav');
      const panels = document.getElementById('screenPanels');
      pen.screens.forEach((s, i) => {
        const pill = document.createElement('button');
        pill.className = 'nav-pill' + (i===0?' active':'');
        pill.textContent = s.label;
        pill.onclick = () => {
          document.querySelectorAll('.nav-pill').forEach(p=>p.classList.remove('active'));
          document.querySelectorAll('.screen-panel').forEach(p=>p.classList.remove('active'));
          pill.classList.add('active');
          document.getElementById('panel-'+s.id).classList.add('active');
        };
        nav.appendChild(pill);
        const panel = document.createElement('div');
        panel.className = 'screen-panel' + (i===0?' active':'');
        panel.id = 'panel-'+s.id;
        panel.innerHTML = \`
          <div class="ops-window">
            <div class="ops-bar">
              <span class="ops-id">S-0\${i+1}</span>
              <span class="ops-title">\${s.label.toUpperCase()} — ZENITH</span>
              <span class="ops-live">LIVE</span>
            </div>
            <div class="wbody">
              <h2>\${s.label}</h2>
              <p>\${s.description}</p>
              <div class="meta-row">\${(s.components||[]).map(c=>'<span class="meta-pill">'+c.type+'</span>').join('')}</div>
              <pre>\${JSON.stringify(s.components, null, 2)}</pre>
            </div>
          </div>
        \`;
        panels.appendChild(panel);
      });
    }
  </script>
</body>
</html>`;

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const HOST = 'zenbin.org';


async function run() {
  // Inject pen into viewer
  const penJson = fs.readFileSync('/workspace/group/design-studio/zenith.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const viewerHtml = viewerHtmlTemplate.replace('<script>\n  // EMBEDDED_PEN will be injected here\n  </script>', injection + '\n<script>');

  // Save locally
  fs.writeFileSync('/workspace/group/design-studio/zenith-ops-hero.html', heroHtml);
  fs.writeFileSync('/workspace/group/design-studio/zenith-ops-viewer.html', viewerHtml);

  console.log('Publishing hero page…');
  const r1 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG }, { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN });
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,100));

  console.log('Publishing viewer…');
  const r2 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' }, { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN });
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,100));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
