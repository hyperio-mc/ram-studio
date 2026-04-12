const https = require('https');
const fs = require('fs');

const SLUG = 'forge';

function publish(slug, title, html) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': 'ram',
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ url: `https://ram.zenbin.org/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0,200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Forge — Infrastructure Command Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #060A0F;
    --surface: #0D1520;
    --surface2: #111D2E;
    --border: #1E2D42;
    --text: #E2E8F0;
    --muted: #64748B;
    --accent: #22D3EE;
    --accent2: #818CF8;
    --success: #10B981;
    --warning: #F59E0B;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* Animated background grid */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }

  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 48px;
    background: rgba(6,10,15,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }

  .nav-logo {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 500;
    color: var(--accent);
    letter-spacing: -0.5px;
    text-decoration: none;
  }

  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }

  .nav-cta {
    background: var(--accent);
    color: #060A0F;
    padding: 8px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
    overflow: hidden;
  }

  .hero::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
    width: 800px;
    height: 800px;
    background: radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border: 1px solid rgba(34,211,238,0.3);
    background: rgba(34,211,238,0.06);
    border-radius: 100px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--accent);
    letter-spacing: 1px;
    margin-bottom: 32px;
  }

  .hero-badge::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.4); }
  }

  h1 {
    font-size: clamp(42px, 7vw, 80px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 24px;
    max-width: 900px;
  }

  h1 span {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: 20px;
    color: var(--muted);
    max-width: 560px;
    margin: 0 auto 48px;
    line-height: 1.6;
    font-weight: 400;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 80px;
  }

  .btn-primary {
    background: var(--accent);
    color: #060A0F;
    padding: 14px 28px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

  .btn-secondary {
    background: transparent;
    color: var(--text);
    padding: 14px 28px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    border: 1px solid var(--border);
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* DASHBOARD PREVIEW */
  .preview-wrapper {
    position: relative;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
  }

  .preview-glow {
    position: absolute;
    inset: -40px;
    background: radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,211,238,0.1), transparent);
    filter: blur(40px);
    pointer-events: none;
  }

  .dashboard-preview {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.05);
  }

  .dashboard-chrome {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    background: rgba(13,21,32,0.8);
  }

  .chrome-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
  }
  .chrome-dot.red { background: #FF5F57; }
  .chrome-dot.yellow { background: #FEBC2E; }
  .chrome-dot.green { background: #28C840; }

  .chrome-url {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 5px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--muted);
    text-align: center;
    margin: 0 20px;
  }

  .dashboard-body {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: 480px;
  }

  .dash-sidebar {
    background: rgba(6,10,15,0.6);
    border-right: 1px solid var(--border);
    padding: 24px 0;
  }

  .sidebar-logo {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    color: var(--accent);
    padding: 0 20px 24px;
    font-weight: 500;
  }

  .sidebar-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    font-size: 13px;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .sidebar-nav-item.active {
    color: var(--accent);
    background: rgba(34,211,238,0.06);
    border-right: 2px solid var(--accent);
  }
  .sidebar-nav-item svg { opacity: 0.7; }
  .sidebar-nav-item.active svg { opacity: 1; }

  .sidebar-section {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 1.5px;
    color: rgba(100,116,139,0.5);
    padding: 16px 20px 6px;
    text-transform: uppercase;
  }

  .sidebar-badge {
    margin-left: auto;
    background: rgba(245,158,11,0.15);
    color: var(--warning);
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 100px;
    font-weight: 600;
  }

  .dash-main {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
  }

  .dash-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dash-title {
    font-size: 18px;
    font-weight: 600;
  }

  .health-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.2);
    color: var(--success);
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
  }
  .health-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--success);
    animation: pulse 2s infinite;
  }

  .metrics-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .metric-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px;
  }

  .metric-label {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 6px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.5px;
  }

  .metric-value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 4px;
  }

  .metric-sub {
    font-size: 11px;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .metric-up { color: var(--success); }
  .metric-warn { color: var(--warning); }
  .metric-accent { color: var(--accent); }

  .services-table {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    flex: 1;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 80px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 80px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(30,45,66,0.5);
    align-items: center;
    font-size: 13px;
    transition: background 0.15s;
  }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: rgba(34,211,238,0.02); }

  .service-name {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  }

  .service-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
  }
  .dot-green { background: var(--success); box-shadow: 0 0 6px var(--success); }
  .dot-yellow { background: var(--warning); box-shadow: 0 0 6px var(--warning); }

  .status-chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 500;
  }
  .chip-green { background: rgba(16,185,129,0.1); color: var(--success); }
  .chip-yellow { background: rgba(245,158,11,0.1); color: var(--warning); }

  .mono { font-family: 'JetBrains Mono', monospace; }
  .dim { color: var(--muted); }

  /* FEATURES */
  .section {
    position: relative;
    z-index: 1;
    padding: 100px 48px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 2px;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 700;
    letter-spacing: -1.5px;
    line-height: 1.1;
    margin-bottom: 20px;
  }

  .section-sub {
    font-size: 18px;
    color: var(--muted);
    max-width: 480px;
    line-height: 1.7;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 64px;
  }

  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .feature-card:hover {
    border-color: rgba(34,211,238,0.3);
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 20px;
  }

  .feature-icon.cyan { background: rgba(34,211,238,0.1); }
  .feature-icon.purple { background: rgba(129,140,248,0.1); }
  .feature-icon.green { background: rgba(16,185,129,0.1); }

  .feature-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .feature-desc {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.7;
  }

  /* AI SECTION */
  .ai-section {
    position: relative;
    z-index: 1;
    padding: 80px 48px;
    overflow: hidden;
  }

  .ai-section::before {
    content: '';
    position: absolute;
    top: 50%; left: 60%;
    transform: translate(-50%, -50%);
    width: 700px; height: 500px;
    background: radial-gradient(ellipse, rgba(129,140,248,0.07), transparent 70%);
    pointer-events: none;
  }

  .ai-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .chat-ui {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: var(--accent);
  }

  .chat-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2s infinite;
  }

  .chat-messages {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 280px;
  }

  .chat-msg {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .chat-avatar {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
  }

  .avatar-ai { background: rgba(34,211,238,0.15); color: var(--accent); }
  .avatar-user { background: rgba(129,140,248,0.15); color: var(--accent2); }

  .chat-msg.user { flex-direction: row-reverse; }
  .chat-msg.user .msg-content {
    background: rgba(129,140,248,0.1);
    border-color: rgba(129,140,248,0.2);
    color: var(--text);
  }

  .msg-content {
    background: rgba(34,211,238,0.06);
    border: 1px solid rgba(34,211,238,0.12);
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    color: var(--text);
    line-height: 1.6;
    max-width: 80%;
  }

  .code-snippet {
    background: rgba(0,0,0,0.4);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 14px;
    margin-top: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #7DD3FC;
  }

  .chat-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--accent);
    cursor: pointer;
    font-weight: 500;
  }

  .chat-input {
    display: flex;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid var(--border);
  }

  .input-field {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--muted);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
  }

  .send-btn {
    width: 38px; height: 38px;
    background: var(--accent);
    border: none;
    border-radius: 8px;
    color: #060A0F;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  /* STATS */
  .stats-bar {
    position: relative;
    z-index: 1;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 64px 48px;
  }

  .stats-inner {
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
    text-align: center;
  }

  .stat-value {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -2px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 14px;
    color: var(--muted);
  }

  /* CTA */
  .cta-section {
    position: relative;
    z-index: 1;
    padding: 120px 48px;
    text-align: center;
  }

  .cta-card {
    max-width: 700px;
    margin: 0 auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 60px 48px;
    position: relative;
    overflow: hidden;
  }

  .cta-card::before {
    content: '';
    position: absolute;
    top: -100px; left: 50%;
    transform: translateX(-50%);
    width: 400px; height: 400px;
    background: radial-gradient(ellipse, rgba(34,211,238,0.08), transparent 70%);
    pointer-events: none;
  }

  .cta-title {
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 700;
    letter-spacing: -1.5px;
    margin-bottom: 16px;
    position: relative;
  }

  .cta-sub {
    color: var(--muted);
    font-size: 17px;
    margin-bottom: 40px;
    position: relative;
  }

  .footer {
    position: relative;
    z-index: 1;
    border-top: 1px solid var(--border);
    padding: 40px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-brand {
    font-family: 'JetBrains Mono', monospace;
    color: var(--accent);
    font-size: 16px;
    font-weight: 500;
  }

  .footer-note {
    font-size: 13px;
    color: var(--muted);
  }

  .footer-links { display: flex; gap: 24px; }
  .footer-links a { color: var(--muted); text-decoration: none; font-size: 13px; }
  .footer-links a:hover { color: var(--text); }

  @media (max-width: 900px) {
    nav { padding: 16px 24px; }
    .nav-links { display: none; }
    .dashboard-body { grid-template-columns: 1fr; }
    .dash-sidebar { display: none; }
    .metrics-row { grid-template-columns: repeat(2, 1fr); }
    .features-grid { grid-template-columns: 1fr; }
    .ai-inner { grid-template-columns: 1fr; }
    .stats-inner { grid-template-columns: repeat(2, 1fr); }
    .section, .ai-section { padding: 60px 24px; }
    .footer { flex-direction: column; gap: 16px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">forge_</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#ai">AI Engine</a>
    <a href="#pricing">Pricing</a>
    <a href="#docs">Docs</a>
  </div>
  <a href="#" class="nav-cta">Start free →</a>
</nav>

<section class="hero">
  <div class="hero-badge">REAL-TIME MONITORING</div>
  <h1>Infrastructure that <span>speaks your language</span></h1>
  <p class="hero-sub">Real-time service health, AI-powered runbooks, and deep metrics — all in one dark command center built for engineering teams.</p>
  <div class="hero-actions">
    <a href="#" class="btn-primary">Start monitoring free →</a>
    <a href="${'https://ram.zenbin.org/forge-mock'}" class="btn-secondary">☀◑ Interactive mock</a>
  </div>

  <div class="preview-wrapper">
    <div class="preview-glow"></div>
    <div class="dashboard-preview">
      <div class="dashboard-chrome">
        <div class="chrome-dot red"></div>
        <div class="chrome-dot yellow"></div>
        <div class="chrome-dot green"></div>
        <div class="chrome-url">app.forge.dev — dashboard</div>
        <div style="font-family: monospace; font-size: 12px; color: #64748B;">● 4 services</div>
      </div>
      <div class="dashboard-body">
        <div class="dash-sidebar">
          <div class="sidebar-logo">forge_</div>
          <div class="sidebar-section">Monitor</div>
          <div class="sidebar-nav-item active">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Overview
          </div>
          <div class="sidebar-nav-item">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Metrics
          </div>
          <div class="sidebar-nav-item">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Alerts
            <span class="sidebar-badge">2</span>
          </div>
          <div class="sidebar-nav-item">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/><rect x="2" y="14" width="7" height="7"/><rect x="15" y="14" width="7" height="7"/></svg>
            Services
          </div>
          <div class="sidebar-section">AI</div>
          <div class="sidebar-nav-item">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            AI Assistant
          </div>
        </div>
        <div class="dash-main">
          <div class="dash-header-row">
            <div class="dash-title">Overview</div>
            <div class="health-badge"><div class="health-dot"></div>98.7% healthy</div>
          </div>
          <div class="metrics-row">
            <div class="metric-card">
              <div class="metric-label">UPTIME</div>
              <div class="metric-value metric-up">99.98%</div>
              <div class="metric-sub metric-up">↑ 30d avg</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">P99 LATENCY</div>
              <div class="metric-value metric-warn">142ms</div>
              <div class="metric-sub metric-warn">↑ +12% vs avg</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">THROUGHPUT</div>
              <div class="metric-value metric-accent">94 r/s</div>
              <div class="metric-sub metric-up">↑ +8% vs avg</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">ERROR RATE</div>
              <div class="metric-value metric-up">0.03%</div>
              <div class="metric-sub metric-up">↓ below SLO</div>
            </div>
          </div>
          <div class="services-table">
            <div class="table-header">
              <span>SERVICE</span>
              <span>STATUS</span>
              <span>LATENCY</span>
              <span>UPTIME</span>
              <span>REGION</span>
            </div>
            <div class="table-row">
              <div class="service-name"><div class="service-dot dot-green"></div><span>postgres-primary</span></div>
              <div><span class="status-chip chip-green">healthy</span></div>
              <div class="mono dim">14ms</div>
              <div class="mono metric-up">99.98%</div>
              <div class="dim mono" style="font-size:11px">us-east-1</div>
            </div>
            <div class="table-row">
              <div class="service-name"><div class="service-dot dot-green"></div><span>api-gateway</span></div>
              <div><span class="status-chip chip-green">healthy</span></div>
              <div class="mono dim">8ms</div>
              <div class="mono metric-up">99.99%</div>
              <div class="dim mono" style="font-size:11px">7 regions</div>
            </div>
            <div class="table-row">
              <div class="service-name"><div class="service-dot dot-yellow"></div><span>worker-queue</span></div>
              <div><span class="status-chip chip-yellow">degraded</span></div>
              <div class="mono dim">—</div>
              <div class="mono metric-warn">99.82%</div>
              <div class="dim mono" style="font-size:11px">us-east-1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Features -->
<section class="section" id="features">
  <div class="section-label">// capabilities</div>
  <div class="section-title">Everything your stack<br>needs to stay healthy</div>
  <p class="section-sub">From raw metrics to AI-generated runbooks — Forge gives you full visibility without the noise.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon cyan">📡</div>
      <div class="feature-title">Real-Time Health Monitoring</div>
      <p class="feature-desc">Service topology with live health indicators. See dependencies, latency, and status at a glance — updated every 15 seconds.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon purple">📊</div>
      <div class="feature-title">Deep Metrics & Tracing</div>
      <p class="feature-desc">P50/P95/P99 latency, error rates, throughput. Drill from a metric spike to the exact trace in two clicks.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon green">🤖</div>
      <div class="feature-title">AI Runbook Generator</div>
      <p class="feature-desc">When incidents fire, Forge AI diagnoses root cause and generates a step-by-step runbook — so on-call isn't a guessing game.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon cyan">⚡</div>
      <div class="feature-title">Smart Alerting</div>
      <p class="feature-desc">Context-aware alerts that understand your deployment patterns. No more alert storms from deploys or scheduled jobs.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon purple">🔗</div>
      <div class="feature-title">Zero-Config Integrations</div>
      <p class="feature-desc">One-line SDK for Node, Python, Go, Rust. Auto-discovers services on Kubernetes, AWS, Fly.io, and Railway.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon green">🛡</div>
      <div class="feature-title">SLO Tracking</div>
      <p class="feature-desc">Define error budgets and SLOs. Forge tracks burn rate and warns you before you breach — not after.</p>
    </div>
  </div>
</section>

<!-- Stats -->
<div class="stats-bar">
  <div class="stats-inner">
    <div>
      <div class="stat-value">99.98%</div>
      <div class="stat-label">Platform uptime SLA</div>
    </div>
    <div>
      <div class="stat-value">&lt;15s</div>
      <div class="stat-label">Avg. time to detect</div>
    </div>
    <div>
      <div class="stat-value">4K+</div>
      <div class="stat-label">Services monitored</div>
    </div>
    <div>
      <div class="stat-value">8ms</div>
      <div class="stat-label">Agent overhead</div>
    </div>
  </div>
</div>

<!-- AI Section -->
<div class="ai-section" id="ai">
  <div class="ai-inner">
    <div>
      <div class="section-label">// forge ai</div>
      <div class="section-title">Your on-call engineer, powered by AI</div>
      <p class="section-sub">Ask Forge AI anything about your infrastructure in plain English. It correlates metrics, traces, and logs to give you answers — not raw data.</p>
      <div style="margin-top: 32px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="color: var(--accent); font-size: 20px;">◆</div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Root cause analysis</div>
            <div style="font-size: 14px; color: var(--muted);">Automatically correlates multiple signals to identify what actually broke.</div>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="color: var(--accent2); font-size: 20px;">◆</div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Predictive alerting</div>
            <div style="font-size: 14px; color: var(--muted);">Spots patterns before they become incidents. 34% fewer pages on average.</div>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="color: var(--success); font-size: 20px;">◆</div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Code-level suggestions</div>
            <div style="font-size: 14px; color: var(--muted);">From "P99 is high" to "here's the fix" — with diffs you can apply immediately.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-ui">
      <div class="chat-header">
        <div class="chat-dot"></div>
        forge_ai · online
      </div>
      <div class="chat-messages">
        <div class="chat-msg">
          <div class="chat-avatar avatar-ai">AI</div>
          <div class="msg-content">
            Detected: worker-queue backlog elevated. Processing rate dropped 23% — likely linked to job surge after the 09:18 deploy. 1,847 jobs pending.
            <div class="chat-action">View runbook →</div>
          </div>
        </div>
        <div class="chat-msg user">
          <div class="chat-avatar avatar-user">you</div>
          <div class="msg-content">What's causing the /auth latency spike?</div>
        </div>
        <div class="chat-msg">
          <div class="chat-avatar avatar-ai">AI</div>
          <div class="msg-content">
            JWT verification is CPU-bound on /auth. Enable token caching to drop P99 ~40%:
            <div class="code-snippet">jwt.verify(token, secret, { cache: true, cacheTTL: 300 })</div>
            <div class="chat-action">Apply suggestion →</div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <div class="input-field">Ask about your infrastructure...</div>
        <button class="send-btn">→</button>
      </div>
    </div>
  </div>
</div>

<!-- CTA -->
<div class="cta-section" id="pricing">
  <div class="cta-card">
    <div class="cta-title">Start monitoring in <span style="color: var(--accent)">5 minutes</span></div>
    <div class="cta-sub">Free for up to 3 services. No credit card required. Connects to your existing stack in minutes.</div>
    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative;">
      <a href="#" class="btn-primary" style="font-size: 16px; padding: 16px 32px;">Start for free →</a>
      <a href="https://ram.zenbin.org/forge-mock" class="btn-secondary" style="font-size: 16px; padding: 16px 32px;">Explore mock ☀◑</a>
    </div>
  </div>
</div>

<footer class="footer">
  <div class="footer-brand">forge_</div>
  <div class="footer-note">Designed by RAM · ram.zenbin.org</div>
  <div class="footer-links">
    <a href="#">Docs</a>
    <a href="#">Status</a>
    <a href="#">GitHub</a>
  </div>
</footer>

</body>
</html>`;

// ── VIEWER PAGE ────────────────────────────────────────────────────────────────
async function buildViewer() {
  const penJson = fs.readFileSync('/workspace/group/design-studio/forge.pen', 'utf8');
  const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Forge — Design Viewer</title>
<style>
  body { margin: 0; background: #060A0F; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Inter', sans-serif; color: #E2E8F0; }
  .viewer-header { padding: 24px; text-align: center; }
  .viewer-title { font-size: 24px; font-weight: 700; color: #22D3EE; font-family: monospace; }
  .viewer-sub { font-size: 14px; color: #64748B; margin-top: 4px; }
  .screens-grid { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; padding: 24px; max-width: 1200px; }
  .screen-card { background: #0D1520; border: 1px solid #1E2D42; border-radius: 12px; overflow: hidden; width: 300px; }
  .screen-name { padding: 12px 16px; font-family: monospace; font-size: 13px; color: #94A3B8; border-bottom: 1px solid #1E2D42; }
  .screen-preview { padding: 16px; font-size: 12px; color: #64748B; min-height: 200px; }
  pre { color: #22D3EE; font-size: 11px; white-space: pre-wrap; word-break: break-all; }
</style>
</head>
<body>
<div class="viewer-header">
  <div class="viewer-title">forge_ — design viewer</div>
  <div class="viewer-sub">5 screens · dark theme · infrastructure monitoring</div>
</div>
<div class="screens-grid" id="screens"></div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
const pen = typeof window.EMBEDDED_PEN === 'string' ? JSON.parse(window.EMBEDDED_PEN) : window.EMBEDDED_PEN;
const grid = document.getElementById('screens');
(pen.screens || []).forEach(s => {
  const card = document.createElement('div');
  card.className = 'screen-card';
  card.innerHTML = '<div class="screen-name">' + s.name + '</div><div class="screen-preview">' +
    (s.elements || []).map(e => '<div style="margin-bottom:6px; padding:4px; background: rgba(34,211,238,0.04); border-radius:4px; font-family:monospace; color:#64748B; font-size:11px">' + (e.type||'element') + (e.title ? ': ' + e.title : e.text ? ': ' + e.text.slice(0,30) : '') + '</div>').join('') + '</div>';
  grid.appendChild(card);
});
</script>
</body>
</html>`;
  return viewerTemplate;
}

(async () => {
  console.log('Publishing hero page...');
  const heroResult = await publish(SLUG, 'Forge — Infrastructure Command Center', heroHtml);
  console.log('Hero:', heroResult.url);

  console.log('Publishing viewer...');
  const viewerHtml = await buildViewer();
  const viewerResult = await publish(SLUG + '-viewer', 'Forge — Design Viewer', viewerHtml);
  console.log('Viewer:', viewerResult.url);
})();
