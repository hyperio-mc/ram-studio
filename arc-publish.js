'use strict';
// arc-publish.js — ARC hero page + viewer
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'arc';
const APP_NAME  = 'ARC';
const TAGLINE   = 'AI Agent Orchestration Console';
const ARCHETYPE = 'agent-orchestration-os';
const PROMPT    = 'Dark-theme AI Agent Orchestration OS. Inspired by: Linear "UI refresh: a calmer, more consistent interface" (darkmodedesign.com) + Codegen "OS for Code Agents" (land-book.com). Network graph visualization of agent pipelines. Deep midnight palette (#0D0C14), violet accent (#8B5CF6), teal active (#2DD4BF). 6 screens: Hub (command center), Agents list, Network Graph (agent pipeline map — new pattern), Agent Detail (Coder-1), Logs (live terminal stream), Settings.';

const P = {
  bg:       '#0D0C14',
  surface:  '#141320',
  surfHi:   '#1C1A2E',
  border:   '#28263C',
  text:     '#EBE9FC',
  muted:    'rgba(235,233,252,0.45)',
  dim:      'rgba(235,233,252,0.2)',
  accent:   '#8B5CF6',
  accent2:  '#2DD4BF',
  accent3:  '#F59E0B',
  accent4:  '#F87171',
};

function zenPublish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
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
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface}; --surfhi: ${P.surfHi};
    --border: ${P.border}; --text: ${P.text}; --muted: ${P.muted}; --dim: ${P.dim};
    --accent: ${P.accent}; --teal: ${P.accent2}; --amber: ${P.accent3}; --red: ${P.accent4};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.55; overflow-x: hidden; }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(13,12,20,0.92); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 58px;
  }
  .nav-brand { font-size: 18px; font-weight: 800; color: var(--text); text-decoration: none; letter-spacing: -0.04em; }
  .nav-brand span { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: #fff; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; padding: 9px 22px; border-radius: 8px; text-decoration: none; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.85; }

  /* ── Hero ── */
  .hero { min-height: 100vh; padding: 148px 40px 80px; max-width: 1160px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .hero-left {}
  .hero-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
  .hero-eyebrow::before { content: ''; display: inline-block; width: 24px; height: 1px; background: var(--accent); }
  .hero-headline { font-size: clamp(38px, 5vw, 64px); font-weight: 800; line-height: 1.04; letter-spacing: -0.04em; margin-bottom: 24px; }
  .hero-headline .hl { background: linear-gradient(135deg, var(--accent), var(--teal)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-sub { font-size: 16px; color: var(--muted); max-width: 440px; line-height: 1.65; margin-bottom: 48px; }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 48px; }
  .btn-primary { background: var(--accent); color: #fff; font-size: 13px; font-weight: 600; padding: 14px 32px; border-radius: 9px; text-decoration: none; display: inline-block; transition: opacity 0.2s; letter-spacing: 0.02em; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-ghost { border: 1px solid var(--border); color: var(--muted); font-size: 13px; font-weight: 500; padding: 13px 28px; border-radius: 9px; text-decoration: none; display: inline-block; transition: border-color 0.2s, color 0.2s; }
  .btn-ghost:hover { border-color: var(--accent); color: var(--text); }
  .hero-stats { display: flex; gap: 32px; }
  .stat-item { }
  .stat-val { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 600; color: var(--text); }
  .stat-lbl { font-size: 11px; color: var(--dim); margin-top: 2px; letter-spacing: 0.05em; }

  /* ── Network Graph Illustration ── */
  .hero-graph { position: relative; }
  .graph-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; position: relative; overflow: hidden; box-shadow: 0 0 80px rgba(139,92,246,0.08); }
  .graph-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 65%); pointer-events: none; }
  .graph-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 20px; text-transform: uppercase; }
  .graph-svg { width: 100%; height: auto; }
  .graph-footer { margin-top: 16px; display: flex; gap: 20px; align-items: center; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

  /* ── Metrics ── */
  .metrics-section { max-width: 1160px; margin: 0 auto; padding: 0 40px 80px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .metric-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px 20px; border-top: 2px solid transparent; transition: border-top-color 0.3s, transform 0.2s; }
  .metric-card:hover { transform: translateY(-2px); }
  .metric-card.v { border-top-color: var(--accent); }
  .metric-card.t { border-top-color: var(--teal); }
  .metric-card.a { border-top-color: var(--amber); }
  .metric-card.r { border-top-color: var(--red); }
  .metric-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dim); margin-bottom: 12px; }
  .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 600; color: var(--text); line-height: 1; margin-bottom: 8px; }
  .metric-sub { font-size: 12px; color: var(--muted); }

  /* ── Features ── */
  .features-section { max-width: 1160px; margin: 0 auto; padding: 60px 40px 80px; }
  .section-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
  .section-title { font-size: clamp(28px, 4vw, 44px); font-weight: 700; letter-spacing: -0.03em; margin-bottom: 56px; line-height: 1.1; }
  .section-title .hl { background: linear-gradient(135deg, var(--accent), var(--teal)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
  .feature-card { background: var(--surface); padding: 32px 28px; transition: background 0.2s; }
  .feature-card:hover { background: var(--surfhi); }
  .feature-icon { font-size: 22px; margin-bottom: 16px; }
  .feature-title { font-size: 14px; font-weight: 700; margin-bottom: 10px; color: var(--text); letter-spacing: -0.01em; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

  /* ── Pipeline steps ── */
  .pipeline-section { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 40px; }
  .pipeline-inner { max-width: 1160px; margin: 0 auto; }
  .pipeline-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0; margin-top: 48px; }
  .pipe-step { padding: 0 20px 0 0; position: relative; }
  .pipe-step:not(:last-child)::after { content: '→'; position: absolute; right: -4px; top: 10px; font-size: 14px; color: var(--dim); }
  .pipe-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; color: var(--accent); margin-bottom: 10px; }
  .pipe-node { display: inline-flex; align-items: center; gap: 8px; background: var(--surfhi); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; }
  .pipe-dot { width: 8px; height: 8px; border-radius: 50%; }
  .pipe-name { font-size: 12px; font-weight: 600; color: var(--text); }
  .pipe-desc { font-size: 11px; color: var(--dim); line-height: 1.55; }

  /* ── Log preview ── */
  .log-section { max-width: 1160px; margin: 0 auto; padding: 60px 40px 80px; }
  .log-terminal { background: #0A0910; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; font-family: 'JetBrains Mono', monospace; }
  .log-topbar { background: var(--surface); padding: 12px 20px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border); }
  .log-dot { width: 10px; height: 10px; border-radius: 50%; }
  .log-title { font-size: 11px; color: var(--muted); margin-left: 8px; letter-spacing: 0.05em; }
  .log-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow: hidden; }
  .log-row { display: flex; gap: 12px; font-size: 12px; line-height: 1.4; }
  .log-time { color: var(--dim); min-width: 76px; flex-shrink: 0; }
  .log-agent { min-width: 68px; flex-shrink: 0; font-weight: 600; }
  .log-level { min-width: 48px; flex-shrink: 0; }
  .log-msg { color: rgba(235,233,252,0.78); }
  .lv-info  { color: #2DD4BF; }
  .lv-debug { color: rgba(235,233,252,0.25); }
  .lv-warn  { color: #F59E0B; }
  .lv-error { color: #F87171; }
  .ag-coder { color: #8B5CF6; }
  .ag-scout { color: #2DD4BF; }
  .ag-analyst { color: #A78BFA; }
  .ag-fetch { color: #F59E0B; }
  .ag-system { color: rgba(235,233,252,0.45); }

  /* ── CTA ── */
  .cta-section { background: linear-gradient(135deg, #0D0C14 0%, #1a0f3a 50%, #0D0C14 100%); border-top: 1px solid var(--border); padding: 96px 40px; text-align: center; position: relative; overflow: hidden; }
  .cta-section::before { content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 400px; height: 400px; background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%); pointer-events: none; }
  .cta-heading { font-size: clamp(30px, 4.5vw, 52px); font-weight: 800; letter-spacing: -0.04em; margin-bottom: 18px; line-height: 1.08; }
  .cta-heading .hl { background: linear-gradient(135deg, var(--accent), var(--teal)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .cta-sub { font-size: 16px; color: var(--muted); margin-bottom: 44px; }
  .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-outline { border: 1px solid rgba(139,92,246,0.4); color: var(--accent); font-size: 13px; font-weight: 600; padding: 13px 28px; border-radius: 9px; text-decoration: none; transition: border-color 0.2s, background 0.2s; }
  .btn-outline:hover { border-color: var(--accent); background: rgba(139,92,246,0.08); }

  footer { max-width: 1160px; margin: 0 auto; padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-top: 1px solid var(--border); }
  .footer-brand { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.04em; }
  .footer-brand span { color: var(--accent); }
  .footer-note { font-size: 11px; color: var(--dim); font-family: 'JetBrains Mono', monospace; }

  @media (max-width: 960px) {
    .hero { grid-template-columns: 1fr; gap: 48px; padding: 120px 24px 60px; }
    .pipeline-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .pipe-step:not(:last-child)::after { display: none; }
    .metrics-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    nav { padding: 0 20px; } .nav-links { display: none; }
    .hero { padding: 100px 20px 60px; }
    .features-grid { grid-template-columns: 1fr; }
    .metrics-grid { grid-template-columns: 1fr 1fr; }
    .metrics-section, .features-section, .log-section { padding-left: 20px; padding-right: 20px; }
    .pipeline-section { padding: 60px 20px; }
    .pipeline-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
    footer { padding: 24px 20px; flex-direction: column; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-brand">A<span>R</span>C</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#pipeline">Pipeline</a>
    <a href="#logs">Logs</a>
    <a href="https://ram.zenbin.org/arc-mock">Mock ☀◑</a>
  </div>
  <a href="https://ram.zenbin.org/arc-mock" class="nav-cta">Try Mock</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <p class="hero-eyebrow">AI Agent Orchestration</p>
    <h1 class="hero-headline">
      Command your<br>
      <span class="hl">agent fleet.</span>
    </h1>
    <p class="hero-sub">ARC is the control plane for teams running multiple AI agents. Monitor pipelines, inspect logs, trace tasks, and coordinate agent workflows — all in one calm, focused console.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/arc-mock" class="btn-primary">Try Interactive Mock</a>
      <a href="#features" class="btn-ghost">See Features</a>
    </div>
    <div class="hero-stats">
      <div class="stat-item">
        <div class="stat-val">7</div>
        <div class="stat-lbl">Active agents</div>
      </div>
      <div class="stat-item">
        <div class="stat-val">342</div>
        <div class="stat-lbl">Tasks today</div>
      </div>
      <div class="stat-item">
        <div class="stat-val">0.3%</div>
        <div class="stat-lbl">Error rate</div>
      </div>
    </div>
  </div>
  <div class="hero-graph">
    <div class="graph-card">
      <div class="graph-label">Research → Publish Pipeline</div>
      <!-- SVG network graph -->
      <svg class="graph-svg" viewBox="0 0 340 360" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Edge glows -->
        <line x1="170" y1="52" x2="82" y2="130" stroke="rgba(139,92,246,0.2)" stroke-width="8"/>
        <line x1="170" y1="52" x2="258" y2="130" stroke="rgba(139,92,246,0.2)" stroke-width="8"/>
        <line x1="82"  y1="130" x2="170" y2="210" stroke="rgba(139,92,246,0.2)" stroke-width="8"/>
        <line x1="258" y1="130" x2="170" y2="210" stroke="rgba(139,92,246,0.2)" stroke-width="8"/>
        <line x1="170" y1="210" x2="82"  y2="290" stroke="rgba(139,92,246,0.2)" stroke-width="8"/>
        <line x1="170" y1="210" x2="258" y2="290" stroke="rgba(139,92,246,0.2)" stroke-width="8"/>
        <line x1="82"  y1="290" x2="170" y2="348" stroke="rgba(139,92,246,0.2)" stroke-width="8"/>
        <line x1="258" y1="290" x2="170" y2="348" stroke="rgba(139,92,246,0.2)" stroke-width="8"/>
        <!-- Edges -->
        <line x1="170" y1="52" x2="82" y2="130" stroke="#28263C" stroke-width="1.5"/>
        <line x1="170" y1="52" x2="258" y2="130" stroke="#28263C" stroke-width="1.5"/>
        <line x1="82"  y1="130" x2="170" y2="210" stroke="#28263C" stroke-width="1.5"/>
        <line x1="258" y1="130" x2="170" y2="210" stroke="#28263C" stroke-width="1.5"/>
        <line x1="170" y1="210" x2="82"  y2="290" stroke="#28263C" stroke-width="1.5"/>
        <line x1="170" y1="210" x2="258" y2="290" stroke="#28263C" stroke-width="1.5"/>
        <line x1="82"  y1="290" x2="170" y2="348" stroke="#28263C" stroke-width="1.5"/>
        <line x1="258" y1="290" x2="170" y2="348" stroke="#28263C" stroke-width="1.5"/>
        <!-- Traveling dots -->
        <circle cx="126" cy="91"  r="3.5" fill="#2DD4BF"/>
        <circle cx="214" cy="91"  r="3.5" fill="#2DD4BF"/>
        <circle cx="126" cy="170" r="3.5" fill="#8B5CF6"/>
        <circle cx="214" cy="170" r="3.5" fill="#F59E0B"/>
        <circle cx="126" cy="250" r="3.5" fill="#8B5CF6"/>
        <circle cx="214" cy="250" r="3.5" fill="#8B5CF6"/>
        <circle cx="126" cy="319" r="3.5" fill="#2DD4BF"/>
        <circle cx="214" cy="319" r="3.5" fill="#2DD4BF"/>
        <!-- Node: Trigger -->
        <circle cx="170" cy="52" r="30" fill="rgba(139,92,246,0.06)" stroke="#3A3758" stroke-width="1.5"/>
        <circle cx="170" cy="52" r="24" fill="#141320"/>
        <text x="170" y="48" font-family="JetBrains Mono" font-size="8" font-weight="700" fill="#6B6890" text-anchor="middle">TRIGGER</text>
        <text x="170" y="60" font-family="JetBrains Mono" font-size="7" fill="rgba(235,233,252,0.3)" text-anchor="middle">webhook</text>
        <!-- Node: Scout-3 -->
        <circle cx="82" cy="130" r="34" fill="rgba(45,212,191,0.08)" stroke="#2DD4BF" stroke-width="1.5"/>
        <circle cx="82" cy="130" r="28" fill="#141320"/>
        <text x="82" y="126" font-family="JetBrains Mono" font-size="8.5" font-weight="700" fill="#2DD4BF" text-anchor="middle">Scout-3</text>
        <text x="82" y="138" font-family="JetBrains Mono" font-size="7" fill="rgba(235,233,252,0.3)" text-anchor="middle">crawl</text>
        <!-- Node: Fetch-2 -->
        <circle cx="258" cy="130" r="34" fill="rgba(245,158,11,0.08)" stroke="#F59E0B" stroke-width="1.5"/>
        <circle cx="258" cy="130" r="28" fill="#141320"/>
        <text x="258" y="126" font-family="JetBrains Mono" font-size="8.5" font-weight="700" fill="#F59E0B" text-anchor="middle">Fetch-2</text>
        <text x="258" y="138" font-family="JetBrains Mono" font-size="7" fill="rgba(235,233,252,0.3)" text-anchor="middle">fetch</text>
        <!-- Node: Analyst -->
        <circle cx="170" cy="210" r="38" fill="rgba(139,92,246,0.1)" stroke="#8B5CF6" stroke-width="2"/>
        <circle cx="170" cy="210" r="32" fill="#141320"/>
        <text x="170" y="205" font-family="JetBrains Mono" font-size="9" font-weight="700" fill="#8B5CF6" text-anchor="middle">Analyst</text>
        <text x="170" y="218" font-family="JetBrains Mono" font-size="7" fill="rgba(235,233,252,0.3)" text-anchor="middle">analyze</text>
        <!-- Node: Writer-A -->
        <circle cx="82" cy="290" r="32" fill="rgba(45,212,191,0.07)" stroke="#2DD4BF" stroke-width="1.5"/>
        <circle cx="82" cy="290" r="26" fill="#141320"/>
        <text x="82" y="285" font-family="JetBrains Mono" font-size="8" font-weight="700" fill="#2DD4BF" text-anchor="middle">Writer</text>
        <text x="82" y="297" font-family="JetBrains Mono" font-size="7" fill="rgba(235,233,252,0.3)" text-anchor="middle">write</text>
        <!-- Node: Coder-1 -->
        <circle cx="258" cy="290" r="32" fill="rgba(139,92,246,0.08)" stroke="#8B5CF6" stroke-width="1.5"/>
        <circle cx="258" cy="290" r="26" fill="#141320"/>
        <text x="258" y="285" font-family="JetBrains Mono" font-size="8" font-weight="700" fill="#8B5CF6" text-anchor="middle">Coder-1</text>
        <text x="258" y="297" font-family="JetBrains Mono" font-size="7" fill="rgba(235,233,252,0.3)" text-anchor="middle">code</text>
        <!-- Node: Output -->
        <circle cx="170" cy="348" r="28" fill="rgba(45,212,191,0.1)" stroke="#2DD4BF" stroke-width="1.5"/>
        <circle cx="170" cy="348" r="22" fill="#141320"/>
        <text x="170" y="344" font-family="JetBrains Mono" font-size="8" font-weight="700" fill="#2DD4BF" text-anchor="middle">OUTPUT</text>
        <text x="170" y="356" font-family="JetBrains Mono" font-size="7" fill="rgba(235,233,252,0.3)" text-anchor="middle">publish</text>
      </svg>
      <div class="graph-footer">
        <div class="legend-item"><div class="legend-dot" style="background:#2DD4BF"></div> Running</div>
        <div class="legend-item"><div class="legend-dot" style="background:#8B5CF6"></div> Queued</div>
        <div class="legend-item"><div class="legend-dot" style="background:#F59E0B"></div> Waiting</div>
        <div class="legend-item"><div class="legend-dot" style="background:#F87171"></div> Error</div>
      </div>
    </div>
  </div>
</section>

<div class="metrics-section">
  <div class="metrics-grid">
    <div class="metric-card t">
      <div class="metric-label">Active Agents</div>
      <div class="metric-value" style="color:#2DD4BF">7</div>
      <div class="metric-sub">↑ 2 since yesterday</div>
    </div>
    <div class="metric-card v">
      <div class="metric-label">Tasks Today</div>
      <div class="metric-value">342</div>
      <div class="metric-sub">↑ 18% vs avg</div>
    </div>
    <div class="metric-card a">
      <div class="metric-label">Pipeline Runs</div>
      <div class="metric-value">29</div>
      <div class="metric-sub">Last run: 4m ago</div>
    </div>
    <div class="metric-card t">
      <div class="metric-label">Error Rate</div>
      <div class="metric-value" style="color:#2DD4BF">0.3%</div>
      <div class="metric-sub">↓ Well within range</div>
    </div>
  </div>
</div>

<section class="features-section" id="features">
  <p class="section-eyebrow">What ARC does</p>
  <h2 class="section-title">One console for<br><span class="hl">every agent you run.</span></h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⬡</div>
      <div class="feature-title">Command Hub</div>
      <div class="feature-desc">A live overview of all agents, recent events, and system health. Know exactly what's running, what's queued, and what needs attention — at a glance.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-title">Pipeline Graph</div>
      <div class="feature-desc">Visualise agent-to-agent dependencies as an interactive network graph. See data flow, identify bottlenecks, and trace exactly where a task stalled.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Agent Fleet</div>
      <div class="feature-desc">Every agent in one list — with live status, model config, task counts, success rates, and latency metrics. Drill into any agent for a full timeline.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≡</div>
      <div class="feature-title">Live Log Stream</div>
      <div class="feature-desc">Terminal-style log viewer with real-time filtering by agent, level, or keyword. Colour-coded by severity — INFO, DEBUG, WARN, ERROR. No noise.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-title">Pipeline Composer</div>
      <div class="feature-desc">Build multi-agent pipelines with a visual step editor. Define triggers, connect agents, set conditions, and schedule or trigger on demand.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Model Config</div>
      <div class="feature-desc">Per-agent model selection, temperature, context window, and tool bindings. Switch models across your fleet in one action.</div>
    </div>
  </div>
</section>

<section class="pipeline-section" id="pipeline">
  <div class="pipeline-inner">
    <p class="section-eyebrow">Example pipeline</p>
    <h2 class="section-title">Research → Publish in 6 steps.</h2>
    <div class="pipeline-grid">
      <div class="pipe-step">
        <div class="pipe-num">01</div>
        <div class="pipe-node"><div class="pipe-dot" style="background:#3A3758"></div><div class="pipe-name">Trigger</div></div>
        <div class="pipe-desc">Webhook fires on new research brief. Pipeline initialised.</div>
      </div>
      <div class="pipe-step">
        <div class="pipe-num">02</div>
        <div class="pipe-node"><div class="pipe-dot" style="background:#2DD4BF"></div><div class="pipe-name">Scout-3</div></div>
        <div class="pipe-desc">Crawls 400+ pages, extracts content blocks, deduplicates.</div>
      </div>
      <div class="pipe-step">
        <div class="pipe-num">03</div>
        <div class="pipe-node"><div class="pipe-dot" style="background:#F59E0B"></div><div class="pipe-name">Fetch-2</div></div>
        <div class="pipe-desc">Fetches citations, media, and structured data from APIs.</div>
      </div>
      <div class="pipe-step">
        <div class="pipe-num">04</div>
        <div class="pipe-node"><div class="pipe-dot" style="background:#8B5CF6"></div><div class="pipe-name">Analyst</div></div>
        <div class="pipe-desc">Summarises, scores, and tags the full document corpus.</div>
      </div>
      <div class="pipe-step">
        <div class="pipe-num">05</div>
        <div class="pipe-node"><div class="pipe-dot" style="background:#2DD4BF"></div><div class="pipe-name">Writer-A</div></div>
        <div class="pipe-desc">Generates long-form article drafts from the tagged brief.</div>
      </div>
      <div class="pipe-step">
        <div class="pipe-num">06</div>
        <div class="pipe-node"><div class="pipe-dot" style="background:#2DD4BF"></div><div class="pipe-name">Publish</div></div>
        <div class="pipe-desc">Pushes to CMS, notifies Slack, archives to storage.</div>
      </div>
    </div>
  </div>
</section>

<section class="log-section" id="logs">
  <p class="section-eyebrow" style="margin-bottom:16px">Live log stream</p>
  <h2 class="section-title">Every agent. Every event.<br>Zero noise.</h2>
  <div class="log-terminal">
    <div class="log-topbar">
      <div class="log-dot" style="background:#F87171"></div>
      <div class="log-dot" style="background:#F59E0B"></div>
      <div class="log-dot" style="background:#2DD4BF"></div>
      <span class="log-title">arc — live stream — all agents</span>
    </div>
    <div class="log-body">
      <div class="log-row">
        <span class="log-time">09:41:02</span>
        <span class="log-agent ag-coder">Coder-1</span>
        <span class="log-level lv-info">INFO</span>
        <span class="log-msg">Starting task #291 auth refactor</span>
      </div>
      <div class="log-row">
        <span class="log-time">09:41:04</span>
        <span class="log-agent ag-coder">Coder-1</span>
        <span class="log-level lv-debug">DEBUG</span>
        <span class="log-msg">Reading 14 source files…</span>
      </div>
      <div class="log-row">
        <span class="log-time">09:41:08</span>
        <span class="log-agent ag-scout">Scout-3</span>
        <span class="log-level lv-info">INFO</span>
        <span class="log-msg">Crawl complete: 412/412 pages indexed</span>
      </div>
      <div class="log-row">
        <span class="log-time">09:40:58</span>
        <span class="log-agent ag-fetch">Fetch-2</span>
        <span class="log-level lv-warn">WARN</span>
        <span class="log-msg">Rate limit hit — backing off 60s</span>
      </div>
      <div class="log-row">
        <span class="log-time">09:40:36</span>
        <span class="log-agent ag-fetch">Fetch-2</span>
        <span class="log-level lv-error">ERROR</span>
        <span class="log-msg">Connection timeout: api.source.io:443</span>
      </div>
      <div class="log-row">
        <span class="log-time">09:40:30</span>
        <span class="log-agent ag-system">SYSTEM</span>
        <span class="log-level lv-info">INFO</span>
        <span class="log-msg">Pipeline "Research→Publish" started</span>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2 class="cta-heading">Your agents deserve<br><span class="hl">a control plane.</span></h2>
  <p class="cta-sub">Try the interactive mock — light and dark mode included.</p>
  <div class="cta-actions">
    <a href="https://ram.zenbin.org/arc-mock" class="btn-primary">Try Interactive Mock</a>
    <a href="https://ram.zenbin.org/arc-viewer" class="btn-outline">View Pen Design</a>
  </div>
</section>

<footer>
  <span class="footer-brand">A<span>R</span>C</span>
  <span class="footer-note">ram.zenbin.org/arc</span>
  <span class="footer-note">Dark · AI Agents · Orchestration</span>
</footer>

</body>
</html>`;
}

function buildViewerHtml() {
  const penJson = fs.readFileSync(path.join(__dirname, 'arc.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'renderer.html'), 'utf8');
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

(async () => {
  console.log('Publishing ARC hero page…');
  const heroHtml = buildHeroHtml();
  const heroRes = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, heroRes.status === 201 ? '✓ Created' : heroRes.status === 200 ? '✓ Updated' : heroRes.body.slice(0, 120));

  console.log('Publishing ARC viewer…');
  try {
    const viewerHtml = buildViewerHtml();
    const viewerRes = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
    console.log('Viewer:', viewerRes.status, viewerRes.status === 201 ? '✓ Created' : viewerRes.status === 200 ? '✓ Updated' : viewerRes.body.slice(0, 120));
  } catch (e) {
    console.warn('Viewer skipped:', e.message);
  }

  console.log('\nLive at:');
  console.log(`  https://ram.zenbin.org/${SLUG}`);
  console.log(`  https://ram.zenbin.org/${SLUG}-viewer`);
})();
