#!/usr/bin/env node
// PYRE — Brand Intelligence Platform
// Hero + Viewer publisher
// Inspired by: Format Podcasts (DarkModeDesign.com) — warm amber on deep near-black #0E0202
// Cinematic editorial dark mode, light-weight serif typography, asymmetric layouts

const fs = require('fs');
const https = require('https');

const SLUG     = 'pyre';
const APP_NAME = 'PYRE';
const TAGLINE  = 'Measure what moves people';
const SUBDOMAIN = 'ram';

// ─── HTTP helper ───────────────────────────────────────────────────────────────
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

// ─── HERO HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>PYRE — Measure what moves people</title>
  <meta name="description" content="PYRE is a brand analytics intelligence platform. Track what resonates, understand your audience, and act on AI-powered insights.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500&family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #080204;
      --surf:    #130A0E;
      --surf2:   #1C1016;
      --amber:   #D4871C;
      --amber2:  #E8A030;
      --copper:  #7B4A2A;
      --red:     #E84B3A;
      --green:   #2DB882;
      --text:    #F0E6D3;
      --sub:     #A08070;
      --dim:     #5A4A42;
      --border:  rgba(212,135,28,0.12);
      --border-strong: rgba(212,135,28,0.24);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', system-ui, sans-serif;
      line-height: 1.6;
      min-height: 100vh;
      overflow-x: hidden;
    }
    /* Atmospheric grain texture */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: 0.5;
    }
    /* Warm radial glow — ember quality */
    body::before {
      content: '';
      position: fixed;
      top: -20vh;
      left: 50%;
      transform: translateX(-50%);
      width: 80vw;
      height: 60vh;
      background: radial-gradient(ellipse at center, rgba(212,135,28,0.06) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      background: rgba(8,2,4,0.88);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      height: 58px;
    }
    .nav-brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 400;
      font-size: 20px;
      letter-spacing: 0.12em;
      color: var(--text);
    }
    .nav-brand span { color: var(--amber); }
    .nav-links { display: flex; align-items: center; gap: 32px; }
    .nav-links a {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--sub);
      text-decoration: none;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      background: var(--amber);
      color: var(--bg) !important;
      padding: 8px 20px;
      border-radius: 4px;
      font-weight: 700 !important;
    }

    /* ─── HERO ─────────────────────────────────────────────────────────────── */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 120px 64px 80px;
      z-index: 1;
      overflow: hidden;
    }
    /* Amber ember glow lower-right */
    .hero::after {
      content: '';
      position: absolute;
      bottom: -10vh;
      right: -10vw;
      width: 50vw;
      height: 50vw;
      background: radial-gradient(ellipse, rgba(123,74,42,0.15) 0%, transparent 65%);
      pointer-events: none;
    }
    .hero-eyebrow {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--amber);
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .hero-eyebrow::before {
      content: '';
      display: inline-block;
      width: 32px;
      height: 1px;
      background: var(--amber);
    }
    .hero-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 300;
      font-size: clamp(52px, 7vw, 96px);
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: var(--text);
      max-width: 720px;
      margin-bottom: 32px;
    }
    .hero-heading em {
      font-style: italic;
      color: var(--amber);
    }
    .hero-sub {
      font-size: 16px;
      font-weight: 300;
      color: var(--sub);
      max-width: 460px;
      line-height: 1.7;
      margin-bottom: 48px;
    }
    .hero-actions {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .btn-primary {
      background: var(--amber);
      color: var(--bg);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 14px 32px;
      border-radius: 4px;
      text-decoration: none;
      transition: background 0.2s, transform 0.15s;
      display: inline-block;
    }
    .btn-primary:hover { background: var(--amber2); transform: translateY(-1px); }
    .btn-ghost {
      color: var(--sub);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      border-bottom: 1px solid var(--border-strong);
      padding-bottom: 2px;
      transition: color 0.2s, border-color 0.2s;
    }
    .btn-ghost:hover { color: var(--text); border-color: var(--sub); }

    /* Hero scroll indicator */
    .hero-scroll {
      position: absolute;
      bottom: 40px;
      left: 64px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 9px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--dim);
    }
    .scroll-line {
      width: 40px; height: 1px;
      background: var(--dim);
    }

    /* Ticker bar */
    .ticker {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 32px;
      background: rgba(212,135,28,0.08);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .ticker-track {
      display: flex;
      gap: 0;
      animation: ticker 24s linear infinite;
      white-space: nowrap;
    }
    .ticker-track span {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--amber);
      padding: 0 32px;
    }
    @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

    /* ─── FEATURE STATS ────────────────────────────────────────────────────── */
    .stats-bar {
      position: relative;
      z-index: 1;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      background: var(--surf);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
    }
    .stat-item {
      padding: 36px 40px;
      border-right: 1px solid var(--border);
    }
    .stat-item:last-child { border-right: none; }
    .stat-num {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 300;
      font-size: 42px;
      color: var(--text);
      line-height: 1;
      margin-bottom: 6px;
    }
    .stat-num em { font-style: normal; color: var(--amber); }
    .stat-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--sub);
    }
    .stat-delta {
      font-size: 10px;
      font-weight: 600;
      color: var(--green);
      margin-top: 4px;
    }

    /* ─── SCREENS SECTION ─────────────────────────────────────────────────── */
    section { position: relative; z-index: 1; }
    .section-eyebrow {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--amber);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-eyebrow::before {
      content: '';
      display: inline-block;
      width: 24px; height: 1px;
      background: var(--amber);
    }
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 300;
      font-size: clamp(32px, 4vw, 52px);
      line-height: 1.1;
      color: var(--text);
      margin-bottom: 16px;
    }
    .section-sub {
      font-size: 14px;
      font-weight: 300;
      color: var(--sub);
      max-width: 480px;
      line-height: 1.7;
    }
    .screens-section {
      padding: 100px 64px;
      background: var(--bg);
    }
    .screens-header {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: end;
      margin-bottom: 64px;
    }
    .screens-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .screen-card {
      background: var(--surf);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
      cursor: pointer;
      text-decoration: none;
    }
    .screen-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-strong);
    }
    .screen-preview {
      width: 100%;
      aspect-ratio: 9/16;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      color: var(--dim);
      position: relative;
      overflow: hidden;
    }
    /* Decorative amber grid line */
    .screen-preview::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 20px 20px;
    }
    /* Screen mock content */
    .screen-mock {
      position: absolute;
      inset: 12px;
      background: #080204;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px 8px;
    }
    .mock-bar { height: 3px; background: var(--amber); border-radius: 2px; }
    .mock-circle {
      width: 48px; height: 48px;
      border-radius: 50%;
      border: 2px solid var(--amber);
      margin: 4px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 200;
      color: var(--amber);
      font-family: 'Playfair Display', serif;
    }
    .mock-row { height: 6px; background: rgba(212,135,28,0.2); border-radius: 2px; }
    .mock-row.accent { background: rgba(212,135,28,0.5); width: 60%; }
    .mock-row.wide { width: 80%; }
    .mock-row.med { width: 55%; }
    .mock-row.short { width: 35%; }
    .mock-card { height: 32px; background: var(--surf); border-radius: 4px; border-left: 2px solid var(--amber); }
    .screen-label {
      padding: 14px 16px;
      border-top: 1px solid var(--border);
    }
    .screen-label-name {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--sub);
      margin-bottom: 4px;
    }
    .screen-label-desc {
      font-size: 11px;
      font-weight: 300;
      color: var(--text);
    }

    /* ─── FEATURES GRID ───────────────────────────────────────────────────── */
    .features-section {
      padding: 100px 64px;
      background: var(--surf);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .features-header { margin-bottom: 64px; }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    .feature-item {
      padding: 40px 32px;
      background: var(--bg);
      transition: background 0.2s;
    }
    .feature-item:hover { background: var(--surf2); }
    .feature-icon {
      font-size: 20px;
      color: var(--amber);
      margin-bottom: 20px;
      display: block;
    }
    .feature-name {
      font-family: 'Playfair Display', serif;
      font-weight: 400;
      font-size: 18px;
      color: var(--text);
      margin-bottom: 10px;
    }
    .feature-desc {
      font-size: 13px;
      font-weight: 300;
      color: var(--sub);
      line-height: 1.65;
    }

    /* ─── INSIGHT HIGHLIGHT ───────────────────────────────────────────────── */
    .insight-section {
      padding: 100px 64px;
      background: var(--bg);
    }
    .insight-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }
    .insight-card {
      background: var(--surf);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 40px;
      position: relative;
      overflow: hidden;
    }
    .insight-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 3px;
      background: linear-gradient(90deg, var(--amber), var(--copper));
    }
    .insight-card-icon {
      font-size: 28px;
      color: var(--amber);
      margin-bottom: 20px;
    }
    .insight-card-title {
      font-family: 'Playfair Display', serif;
      font-weight: 400;
      font-size: 20px;
      color: var(--text);
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .insight-card-body {
      font-size: 13px;
      font-weight: 300;
      color: var(--sub);
      line-height: 1.65;
      margin-bottom: 24px;
    }
    .insight-card-action {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--amber);
    }
    .insight-confidence {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .confidence-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 8px;
    }
    .confidence-bar-track {
      height: 4px;
      background: var(--surf2);
      border-radius: 2px;
      overflow: hidden;
    }
    .confidence-bar-fill {
      height: 100%;
      width: 85%;
      background: linear-gradient(90deg, var(--amber), var(--amber2));
      border-radius: 2px;
    }
    .confidence-pct {
      font-size: 10px;
      font-weight: 600;
      color: var(--amber);
      margin-top: 6px;
    }

    /* ─── CTA SECTION ─────────────────────────────────────────────────────── */
    .cta-section {
      padding: 120px 64px;
      background: var(--surf);
      border-top: 1px solid var(--border);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .cta-section::before {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 600px; height: 300px;
      background: radial-gradient(ellipse, rgba(212,135,28,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .cta-headline {
      font-family: 'Playfair Display', serif;
      font-weight: 300;
      font-size: clamp(36px, 5vw, 64px);
      color: var(--text);
      margin-bottom: 20px;
    }
    .cta-headline em { font-style: italic; color: var(--amber); }
    .cta-sub {
      font-size: 15px;
      font-weight: 300;
      color: var(--sub);
      max-width: 480px;
      margin: 0 auto 48px;
      line-height: 1.7;
    }
    .cta-actions { display: flex; gap: 20px; justify-content: center; align-items: center; flex-wrap: wrap; }

    /* ─── FOOTER ──────────────────────────────────────────────────────────── */
    footer {
      background: var(--bg);
      border-top: 1px solid var(--border);
      padding: 48px 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }
    .footer-brand {
      font-family: 'Playfair Display', serif;
      font-weight: 300;
      font-size: 16px;
      letter-spacing: 0.1em;
      color: var(--sub);
    }
    .footer-credit {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--dim);
    }
    .footer-credit a { color: var(--amber); text-decoration: none; }

    @media (max-width: 900px) {
      .hero { padding: 100px 32px 80px; }
      .stats-bar { grid-template-columns: repeat(2, 1fr); }
      .screens-grid { grid-template-columns: repeat(2, 1fr); }
      .screens-header { grid-template-columns: 1fr; gap: 24px; }
      .features-grid { grid-template-columns: 1fr; }
      .insight-layout { grid-template-columns: 1fr; }
      .features-section, .screens-section, .insight-section, .cta-section { padding: 64px 32px; }
      footer { flex-direction: column; gap: 16px; text-align: center; padding: 32px; }
      nav { padding: 0 24px; }
    }
  </style>
</head>
<body>

  <nav>
    <div class="nav-brand">P<span>Y</span>RE</div>
    <div class="nav-links">
      <a href="#screens">Screens</a>
      <a href="#features">Features</a>
      <a href="https://ram.zenbin.org/pyre-viewer" target="_blank">View Design</a>
      <a href="https://ram.zenbin.org/pyre-mock" target="_blank" class="nav-cta">Live Mock</a>
    </div>
  </nav>

  <!-- ── HERO ─────────────────────────────────────────────────────────────── -->
  <section class="hero">
    <div class="hero-eyebrow">Brand Intelligence Platform</div>
    <h1 class="hero-heading">
      Measure what<br><em>moves people</em>
    </h1>
    <p class="hero-sub">
      PYRE tracks the signals behind your brand's performance —
      reach, resonance, timing, and format — and surfaces
      AI-powered insights before your competition even notices.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/pyre-mock" target="_blank" class="btn-primary">Explore Mock →</a>
      <a href="https://ram.zenbin.org/pyre-viewer" target="_blank" class="btn-ghost">View Design File</a>
    </div>
    <div class="hero-scroll">
      <div class="scroll-line"></div>
      Scroll to explore
    </div>
    <div class="ticker">
      <div class="ticker-track">
        <span>REACH ↑12%</span><span>·</span>
        <span>SENTIMENT ↑8%</span><span>·</span>
        <span>VELOCITY ×3.1</span><span>·</span>
        <span>SAVES ↑44%</span><span>·</span>
        <span>NEW FOLLOWERS ↑38%</span><span>·</span>
        <span>BRAND SCORE 87</span><span>·</span>
        <span>IMPRESSIONS ↑31%</span><span>·</span>
        <span>REACH ↑12%</span><span>·</span>
        <span>SENTIMENT ↑8%</span><span>·</span>
        <span>VELOCITY ×3.1</span><span>·</span>
        <span>SAVES ↑44%</span><span>·</span>
        <span>NEW FOLLOWERS ↑38%</span><span>·</span>
        <span>BRAND SCORE 87</span><span>·</span>
        <span>IMPRESSIONS ↑31%</span><span>·</span>
      </div>
    </div>
  </section>

  <!-- ── STATS BAR ─────────────────────────────────────────────────────────── -->
  <div class="stats-bar">
    <div class="stat-item">
      <div class="stat-num">4.8<em>M</em></div>
      <div class="stat-label">Weekly Reach</div>
      <div class="stat-delta">↑ 18% vs last week</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">8<em>7</em></div>
      <div class="stat-label">Brand Health Score</div>
      <div class="stat-delta">↑ 4 points this week</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">×3<em>.1</em></div>
      <div class="stat-label">Content Velocity</div>
      <div class="stat-delta">↑ 31% momentum</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">28<em>K</em></div>
      <div class="stat-label">New Followers</div>
      <div class="stat-delta">↑ 44% this month</div>
    </div>
  </div>

  <!-- ── SCREENS ───────────────────────────────────────────────────────────── -->
  <section class="screens-section" id="screens">
    <div class="screens-header">
      <div>
        <div class="section-eyebrow">6 Screens</div>
        <h2 class="section-title">Brand intelligence,<br>beautifully surfaced</h2>
      </div>
      <p class="section-sub">
        Every screen designed to reduce cognitive load and amplify the signal.
        From health score to AI weekly digest — PYRE tells you exactly what to act on.
      </p>
    </div>
    <div class="screens-grid">

      <a class="screen-card" href="https://ram.zenbin.org/pyre-viewer" target="_blank">
        <div class="screen-preview">
          <div class="screen-mock">
            <div style="height:6px;background:#D4871C40;border-radius:2px;width:40%"></div>
            <div class="mock-circle">87</div>
            <div class="mock-row accent"></div>
            <div class="mock-row wide"></div>
            <div class="mock-card"></div>
            <div class="mock-card"></div>
            <div class="mock-card"></div>
          </div>
        </div>
        <div class="screen-label">
          <div class="screen-label-name">01 · Pulse</div>
          <div class="screen-label-desc">Brand health score with live signal feed</div>
        </div>
      </a>

      <a class="screen-card" href="https://ram.zenbin.org/pyre-viewer" target="_blank">
        <div class="screen-preview">
          <div class="screen-mock">
            <div style="height:8px;background:#D4871C30;border-radius:2px;width:70%"></div>
            <div style="height:48px;background:#1C1016;border-radius:4px;border-top:2px solid #D4871C;padding:6px 8px;display:flex;flex-direction:column;gap:3px;">
              <div style="height:3px;background:#D4871C60;border-radius:1px;width:80%"></div>
              <div style="height:20px;background:#D4871C10;border-radius:2px;"></div>
            </div>
            <div class="mock-row med"></div>
            <div class="mock-card" style="height:20px;"></div>
            <div class="mock-card" style="height:20px;"></div>
            <div class="mock-card" style="height:20px;"></div>
          </div>
        </div>
        <div class="screen-label">
          <div class="screen-label-name">02 · Signals</div>
          <div class="screen-label-desc">Top-performing content ranked by resonance</div>
        </div>
      </a>

      <a class="screen-card" href="https://ram.zenbin.org/pyre-viewer" target="_blank">
        <div class="screen-preview">
          <div class="screen-mock">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px;">
              <div style="height:60px;background:#1C1016;border-radius:4px;border-top:2px solid #D4871C;"></div>
              <div style="height:60px;background:#1C1016;border-radius:4px;"></div>
              <div style="height:60px;background:#1C1016;border-radius:4px;"></div>
              <div style="height:60px;background:#1C1016;border-radius:4px;"></div>
            </div>
            <div class="mock-row short"></div>
          </div>
        </div>
        <div class="screen-label">
          <div class="screen-label-name">03 · Creative</div>
          <div class="screen-label-desc">Asset grid with per-format performance metrics</div>
        </div>
      </a>

      <a class="screen-card" href="https://ram.zenbin.org/pyre-viewer" target="_blank">
        <div class="screen-preview">
          <div class="screen-mock">
            <div style="height:28px;background:#D4871C20;border-radius:2px;width:65%;margin-bottom:2px;">
              <div style="font-size:16px;font-weight:200;color:#D4871C;padding:4px 8px;font-family:serif;">4.8M</div>
            </div>
            <div class="mock-row short"></div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;">
              <div style="display:flex;align-items:center;gap:4px;">
                <div style="height:4px;background:#D4871C;border-radius:2px;width:75%;flex-shrink:0;"></div>
              </div>
              <div style="display:flex;align-items:center;gap:4px;">
                <div style="height:4px;background:#D4871C80;border-radius:2px;width:55%;flex-shrink:0;"></div>
              </div>
              <div style="display:flex;align-items:center;gap:4px;">
                <div style="height:4px;background:#D4871C60;border-radius:2px;width:38%;flex-shrink:0;"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="screen-label">
          <div class="screen-label-name">04 · Channels</div>
          <div class="screen-label-desc">Platform breakdown with audience overlap Venn</div>
        </div>
      </a>

      <a class="screen-card" href="https://ram.zenbin.org/pyre-viewer" target="_blank">
        <div class="screen-preview">
          <div class="screen-mock">
            <div class="mock-card" style="height:44px;border-top:2px solid #D4871C;margin-bottom:4px;"></div>
            <div class="mock-card" style="height:44px;border-left-color:#2DB882;margin-bottom:4px;"></div>
            <div class="mock-card" style="height:44px;border-left-color:#7B4A2A;margin-bottom:4px;"></div>
            <div style="height:20px;background:#D4871C30;border-radius:4px;border-top:1px solid #D4871C;"></div>
          </div>
        </div>
        <div class="screen-label">
          <div class="screen-label-name">05 · Insights</div>
          <div class="screen-label-desc">AI-generated weekly observations with confidence scores</div>
        </div>
      </a>

      <a class="screen-card" href="https://ram.zenbin.org/pyre-viewer" target="_blank">
        <div class="screen-preview">
          <div class="screen-mock">
            <div class="mock-row short" style="width:50%;"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin:4px 0;">
              <div style="height:20px;background:#1C1016;border-radius:3px;"></div>
              <div style="height:20px;background:#1C1016;border-radius:3px;"></div>
              <div style="height:20px;background:#1C1016;border-radius:3px;"></div>
            </div>
            <div class="mock-card"></div>
            <div style="display:flex;gap:4px;margin-top:4px;">
              <div style="height:12px;background:#D4871C;border-radius:2px;flex:1;"></div>
              <div style="height:12px;background:#1C1016;border-radius:2px;flex:1;border:1px solid #5A4A42;"></div>
            </div>
          </div>
        </div>
        <div class="screen-label">
          <div class="screen-label-name">06 · Report</div>
          <div class="screen-label-desc">Weekly digest with AI summary and export</div>
        </div>
      </a>

    </div>
  </section>

  <!-- ── FEATURES ──────────────────────────────────────────────────────────── -->
  <section class="features-section" id="features">
    <div class="features-header">
      <div class="section-eyebrow">Why PYRE</div>
      <h2 class="section-title">Designed around<br>the signal, not the noise</h2>
    </div>
    <div class="features-grid">
      <div class="feature-item">
        <span class="feature-icon">◉</span>
        <div class="feature-name">Brand Health Score</div>
        <p class="feature-desc">A single, calibrated score that blends reach, sentiment, velocity, and engagement quality. Updated in real time.</p>
      </div>
      <div class="feature-item">
        <span class="feature-icon">◎</span>
        <div class="feature-name">Signal Intelligence</div>
        <p class="feature-desc">Ranked view of your top-performing content with format analysis, audience response curves, and breakout detection.</p>
      </div>
      <div class="feature-item">
        <span class="feature-icon">▦</span>
        <div class="feature-name">Creative Performance</div>
        <p class="feature-desc">Asset-level analytics across video, story, carousel, reel, and live — CTR, saves, completion, and format benchmarks.</p>
      </div>
      <div class="feature-item">
        <span class="feature-icon">≋</span>
        <div class="feature-name">Channel Breakdown</div>
        <p class="feature-desc">Platform-by-platform comparison with cross-platform audience overlap analysis. Know where your audience truly lives.</p>
      </div>
      <div class="feature-item">
        <span class="feature-icon">✦</span>
        <div class="feature-name">AI Insight Engine</div>
        <p class="feature-desc">Three prioritized observations each week — format insights, audience trends, timing windows — with confidence scores.</p>
      </div>
      <div class="feature-item">
        <span class="feature-icon">◷</span>
        <div class="feature-name">Weekly Report</div>
        <p class="feature-desc">Auto-generated digest with AI summary, daily reach chart, top assets, and one-tap sharing to stakeholders.</p>
      </div>
    </div>
  </section>

  <!-- ── INSIGHT HIGHLIGHT ─────────────────────────────────────────────────── -->
  <section class="insight-section">
    <div class="insight-layout">
      <div>
        <div class="section-eyebrow">AI in Action</div>
        <h2 class="section-title">Insights that actually<br><em>change behaviour</em></h2>
        <p class="section-sub" style="margin-top:16px;">
          PYRE's insight engine surfaces the observations that move the needle —
          not vanity stats. Each insight includes a confidence score,
          the data behind it, and a one-tap recommended action.
        </p>
        <div style="margin-top:40px;">
          <a href="https://ram.zenbin.org/pyre-mock" target="_blank" class="btn-primary">Try the Mock →</a>
        </div>
      </div>
      <div>
        <div class="insight-card" style="margin-bottom:16px;">
          <div class="insight-card-icon">▶</div>
          <div class="insight-card-title">Short-form video is your breakout format</div>
          <p class="insight-card-body">Videos under 60s are generating 4.1× the engagement rate of your next-best format. Completion rate (78%) is 2.3× the platform average.</p>
          <div class="insight-card-action">View format analysis →</div>
          <div class="insight-confidence">
            <div class="confidence-label">Model Confidence</div>
            <div class="confidence-bar-track"><div class="confidence-bar-fill"></div></div>
            <div class="confidence-pct">85%</div>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-card-icon">◷</div>
          <div class="insight-card-title">Tuesday 7–9pm outperforms all other windows</div>
          <p class="insight-card-body">Posts in this window average 3.2× more reach. Your current schedule hits it only 18% of the time — significant untapped opportunity.</p>
          <div class="insight-card-action">Adjust schedule →</div>
          <div class="insight-confidence">
            <div class="confidence-label">Model Confidence</div>
            <div class="confidence-bar-track"><div class="confidence-bar-fill" style="width:91%;"></div></div>
            <div class="confidence-pct">91%</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── CTA ───────────────────────────────────────────────────────────────── -->
  <section class="cta-section">
    <h2 class="cta-headline">Stop counting views.<br>Start measuring <em>meaning</em>.</h2>
    <p class="cta-sub">PYRE shows you what your audience actually responds to — and what to do next.</p>
    <div class="cta-actions">
      <a href="https://ram.zenbin.org/pyre-mock" target="_blank" class="btn-primary">Explore Interactive Mock →</a>
      <a href="https://ram.zenbin.org/pyre-viewer" target="_blank" class="btn-ghost">View Design File</a>
    </div>
  </section>

  <!-- ── FOOTER ────────────────────────────────────────────────────────────── -->
  <footer>
    <div class="footer-brand">PYRE · Brand Intelligence</div>
    <div class="footer-credit">
      Designed by <a href="https://ram.zenbin.org">RAM</a> · Design Heartbeat · Apr 2026
    </div>
  </footer>

</body>
</html>`;

// ─── VIEWER HTML (with EMBEDDED_PEN injection point) ──────────────────────────
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>PYRE — Design Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080204; color: #F0E6D3; font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; height: 100vh; }
    header {
      height: 52px; background: #130A0E; border-bottom: 1px solid rgba(212,135,28,0.15);
      display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0;
    }
    .brand { font-size: 14px; font-weight: 600; letter-spacing: 0.1em; color: #D4871C; }
    .nav-links { display: flex; gap: 16px; }
    .nav-links a { font-size: 11px; color: #5A4A42; text-decoration: none; transition: color 0.2s; }
    .nav-links a:hover { color: #F0E6D3; }
    #app { flex: 1; overflow: hidden; }
  </style>
  <script>
  // EMBEDDED_PEN_PLACEHOLDER
  </script>
</head>
<body>
  <header>
    <div class="brand">✦ PYRE</div>
    <div class="nav-links">
      <a href="https://ram.zenbin.org/pyre">← Hero</a>
      <a href="https://ram.zenbin.org/pyre-mock" target="_blank">Interactive Mock ↗</a>
    </div>
  </header>
  <div id="app"></div>
  <script src="https://viewer.pencil.dev/v2/embed.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (window.EMBEDDED_PEN && window.PencilViewer) {
        window.PencilViewer.init('#app', { pen: JSON.parse(window.EMBEDDED_PEN), theme: 'dark' });
      }
    });
  </script>
</body>
</html>`;

// Inject embedded pen
const penJson = fs.readFileSync('pyre.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>\n  // EMBEDDED_PEN_PLACEHOLDER\n  </script>', injection);

// Save locally
fs.writeFileSync('pyre-hero.html', heroHtml);
fs.writeFileSync('pyre-viewer.html', viewerHtml);
console.log('✓ pyre-hero.html written');
console.log('✓ pyre-viewer.html written');

// ─── Publish via zenbin API ────────────────────────────────────────────────────
async function publish(slug, html) {
  const res = await post('zenbin.org', '/api/publish', {
    'X-Subdomain': SUBDOMAIN,
    'X-Slug': slug,
  }, { slug, html, subdomain: SUBDOMAIN });
  return res;
}

(async () => {
  try {
    // Publish hero
    console.log('Publishing hero…');
    const heroRes = await publish(SLUG, heroHtml);
    console.log(`Hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

    // Publish viewer
    console.log('Publishing viewer…');
    const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml);
    console.log(`Viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

    console.log('✓ Done publishing');
  } catch(e) {
    console.error('Publish error:', e.message);
    process.exit(1);
  }
})();
