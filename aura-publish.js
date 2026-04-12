#!/usr/bin/env node
// aura-publish.js — Hero page + viewer publisher for AURA

const fs   = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'aura';
const APP_NAME = 'AURA';
const TAGLINE  = 'Design Trend Intelligence';
const SUBDOMAIN = 'ram';

function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': SUBDOMAIN,
      },
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

// ─── HERO HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AURA — Design Trend Intelligence</title>
  <meta name="description" content="AURA surfaces emerging UI trends, color stories, and design patterns from across the web — updated weekly.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #FAF8F4;
      --surface: #FFFFFF;
      --surface2:#F3F0EA;
      --text:    #1A1714;
      --text2:   #3D3830;
      --muted:   #B5AF9E;
      --border:  #E5E0D4;
      --accent:  #7B5CF0;
      --accent2: #F07840;
      --pink:    #E0508F;
      --cyan:    #1DA8F0;
      --green:   #2DB87A;
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

    /* Aurora glow orbs */
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }
    .orb-1 { width: 560px; height: 560px; top: -180px; left: -120px; background: rgba(123,92,240,0.09); }
    .orb-2 { width: 440px; height: 440px; top: 200px; right: -100px; background: rgba(240,120,64,0.08); }
    .orb-3 { width: 360px; height: 360px; bottom: 100px; left: 20%; background: rgba(29,168,240,0.06); }

    a { color: var(--accent); text-decoration: none; }

    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(250,248,244,0.88);
      backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px; height: 56px;
    }
    .nav-brand { font-weight: 900; font-size: 17px; letter-spacing: 0.12em; color: var(--text); }
    .nav-brand span { color: var(--accent); }
    .nav-badge {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 600; color: var(--accent);
      background: rgba(123,92,240,0.08);
      border: 1px solid rgba(123,92,240,0.22);
      border-radius: 20px; padding: 3px 10px;
      letter-spacing: 0.04em;
    }
    .nav-badge::before {
      content: '';
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--green);
      animation: blink 2.4s ease-in-out infinite;
    }
    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
    .nav-links { display: flex; gap: 30px; }
    .nav-links a { color: var(--text2); font-size: 13.5px; font-weight: 500; }
    .nav-links a:hover { color: var(--accent); }
    .nav-cta {
      background: var(--accent); color: #fff;
      font-size: 13px; font-weight: 600; padding: 8px 20px;
      border-radius: 8px; letter-spacing: 0.02em;
    }
    .nav-cta:hover { background: #6448d0; }

    /* ── HERO ── */
    .hero {
      position: relative; z-index: 1;
      max-width: 1140px; margin: 0 auto;
      padding: 140px 48px 80px;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 72px; align-items: center;
    }
    .hero-eyebrow {
      font-size: 10.5px; font-weight: 700; letter-spacing: 0.2em;
      color: var(--accent); text-transform: uppercase; margin-bottom: 18px;
    }
    .hero-headline {
      font-size: 58px; font-weight: 900;
      line-height: 1.04; letter-spacing: -0.035em; margin-bottom: 22px;
    }
    .gradient-text {
      background: linear-gradient(130deg, var(--accent) 0%, var(--pink) 50%, var(--accent2) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-sub {
      font-size: 17px; color: var(--text2); line-height: 1.7;
      max-width: 430px; margin-bottom: 36px;
    }
    .hero-ctas { display: flex; gap: 12px; align-items: center; }
    .btn-primary {
      background: var(--accent); color: #fff;
      font-size: 14px; font-weight: 600;
      padding: 13px 26px; border-radius: 9px;
      display: inline-block; letter-spacing: 0.01em;
    }
    .btn-primary:hover { background: #6448d0; transform: translateY(-1px); }
    .btn-ghost {
      background: transparent; color: var(--text);
      font-size: 14px; font-weight: 500;
      padding: 13px 26px; border-radius: 9px;
      border: 1.5px solid var(--border);
      display: inline-block;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

    /* ── PHONE MOCKUP ── */
    .phone-wrap {
      position: relative;
      display: flex; justify-content: center; align-items: center;
    }
    .phone-glow {
      position: absolute; width: 320px; height: 540px;
      border-radius: 50%;
      background: radial-gradient(ellipse, rgba(123,92,240,0.18) 0%, rgba(240,120,64,0.12) 50%, transparent 75%);
      filter: blur(40px);
      pointer-events: none;
    }
    .phone {
      position: relative;
      width: 260px; height: 520px;
      background: var(--surface);
      border-radius: 34px;
      border: 1.5px solid var(--border);
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(26,23,20,0.12), 0 8px 24px rgba(26,23,20,0.06);
    }
    .phone-notch {
      position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
      width: 80px; height: 20px;
      background: var(--text); border-radius: 10px; z-index: 10;
    }

    /* Phone screen contents */
    .phone-screen {
      width: 100%; height: 100%;
      background: var(--bg);
      padding: 40px 12px 12px;
      font-size: 9px;
      overflow: hidden;
    }
    .ps-aurora-orb {
      position: absolute; top: 20px; left: -20px;
      width: 140px; height: 140px;
      background: radial-gradient(circle, rgba(123,92,240,0.2) 0%, transparent 70%);
      border-radius: 50%; pointer-events: none;
    }
    .ps-aurora-orb2 {
      position: absolute; top: 20px; right: -20px;
      width: 120px; height: 120px;
      background: radial-gradient(circle, rgba(240,120,64,0.18) 0%, transparent 70%);
      border-radius: 50%; pointer-events: none;
    }
    .ps-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .ps-brand { font-size: 13px; font-weight: 900; letter-spacing: 0.12em; color: var(--text); }
    .ps-sub-brand { font-size: 8px; color: var(--muted); font-weight: 400; }
    .ps-bell {
      width: 24px; height: 24px;
      background: var(--surface2); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px;
    }
    .ps-label { font-size: 7.5px; font-weight: 700; letter-spacing: 0.15em; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; }
    .ps-hero-card {
      width: 100%; height: 90px;
      background: linear-gradient(135deg, var(--accent) 0%, var(--pink) 50%, var(--accent2) 100%);
      border-radius: 10px; margin-bottom: 8px;
      padding: 10px;
      color: #fff; overflow: hidden; position: relative;
    }
    .ps-hero-card-tag {
      font-size: 7px; font-weight: 700; letter-spacing: 0.1em;
      background: rgba(255,255,255,0.22); border-radius: 10px;
      padding: 2px 6px; display: inline-block; margin-bottom: 4px;
    }
    .ps-hero-card-title { font-size: 14px; font-weight: 900; line-height: 1.2; }
    .ps-hero-card-sub { font-size: 7.5px; opacity: 0.85; margin-top: 4px; }
    .ps-section { font-size: 10px; font-weight: 700; color: var(--text); margin: 8px 0 5px; }
    .ps-trend-row { display: flex; gap: 6px; margin-bottom: 8px; }
    .ps-trend-card {
      flex: 1; background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 7px; padding: 7px;
    }
    .ps-swatches { display: flex; gap: 3px; margin-bottom: 5px; }
    .ps-swatch { width: 16px; height: 16px; border-radius: 50%; }
    .ps-tc-title { font-size: 8px; font-weight: 700; color: var(--text); line-height: 1.3; }
    .ps-color-row {
      display: flex; gap: 5px; margin-bottom: 6px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 7px; padding: 6px;
    }
    .ps-big-swatch { width: 32px; height: 28px; border-radius: 5px; }
    .ps-cr-name { font-size: 8.5px; font-weight: 600; color: var(--text); align-self: center; margin-left: 4px; }
    .ps-nav-bar {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: var(--surface); border-top: 1px solid var(--border);
      display: flex; justify-content: space-around;
      padding: 6px 0 8px;
    }
    .ps-nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .ps-nav-icon { font-size: 12px; }
    .ps-nav-label { font-size: 6.5px; color: var(--muted); }
    .ps-nav-item.active .ps-nav-icon { color: var(--accent); }
    .ps-nav-item.active .ps-nav-label { color: var(--accent); font-weight: 600; }

    /* ── STATS BAR ── */
    .stats {
      position: relative; z-index: 1;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      display: flex; justify-content: center; gap: 80px;
      padding: 28px 48px;
    }
    .stat { text-align: center; }
    .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--text); }
    .stat-label { font-size: 12px; color: var(--muted); font-weight: 400; margin-top: 2px; }
    .stat-accent { color: var(--accent); }

    /* ── FEATURES ── */
    .features {
      position: relative; z-index: 1;
      max-width: 1140px; margin: 0 auto;
      padding: 80px 48px;
    }
    .section-label {
      font-size: 10.5px; font-weight: 700; letter-spacing: 0.2em;
      color: var(--accent); text-transform: uppercase; margin-bottom: 14px;
    }
    .section-title {
      font-size: 36px; font-weight: 800;
      letter-spacing: -0.025em; line-height: 1.15;
      margin-bottom: 48px; max-width: 480px;
    }
    .feature-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .feature-card {
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 16px; padding: 28px;
      transition: border-color 0.2s, transform 0.2s;
    }
    .feature-card:hover { border-color: rgba(123,92,240,0.35); transform: translateY(-2px); }
    .feature-icon {
      width: 42px; height: 42px;
      background: rgba(123,92,240,0.1);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; margin-bottom: 16px;
    }
    .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
    .feature-desc { font-size: 13.5px; color: var(--text2); line-height: 1.65; }

    /* ── TREND CARDS SECTION ── */
    .trends-section {
      position: relative; z-index: 1;
      background: var(--surface2);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 72px 48px;
    }
    .trends-inner { max-width: 1140px; margin: 0 auto; }
    .trends-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
    .trend-card {
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 14px; overflow: hidden;
    }
    .trend-img {
      height: 120px; position: relative; overflow: hidden;
    }
    .trend-tag {
      position: absolute; top: 10px; left: 10px;
      font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em;
      background: rgba(255,255,255,0.88);
      border-radius: 20px; padding: 3px 10px;
      color: var(--text);
    }
    .trend-body { padding: 16px; }
    .trend-title { font-size: 13.5px; font-weight: 700; margin-bottom: 5px; }
    .trend-sub { font-size: 12px; color: var(--text2); line-height: 1.55; }
    .trend-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);
    }
    .trend-count { font-size: 11px; font-weight: 600; color: var(--green); }
    .trend-arrow { font-size: 14px; color: var(--muted); }

    /* ── COLOR STORIES ── */
    .colors-section {
      position: relative; z-index: 1;
      max-width: 1140px; margin: 0 auto;
      padding: 72px 48px;
    }
    .palette-row { display: flex; gap: 16px; margin-top: 36px; }
    .palette-card {
      flex: 1;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 14px; overflow: hidden;
    }
    .palette-swatches { display: flex; height: 80px; }
    .palette-swatch { flex: 1; }
    .palette-info { padding: 14px 16px; }
    .palette-name { font-size: 13px; font-weight: 700; color: var(--text); }
    .palette-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }

    /* ── CTA BAND ── */
    .cta-band {
      position: relative; z-index: 1;
      background: linear-gradient(135deg, var(--accent) 0%, var(--pink) 60%, var(--accent2) 100%);
      padding: 72px 48px; text-align: center; overflow: hidden;
    }
    .cta-band::before {
      content: ''; position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E");
      pointer-events: none;
    }
    .cta-band h2 { font-size: 40px; font-weight: 900; color: #fff; letter-spacing: -0.03em; margin-bottom: 12px; }
    .cta-band p { font-size: 17px; color: rgba(255,255,255,0.82); margin-bottom: 32px; }
    .btn-white {
      background: #fff; color: var(--accent);
      font-size: 14px; font-weight: 700;
      padding: 13px 28px; border-radius: 9px;
      display: inline-block; letter-spacing: 0.01em;
    }
    .btn-white:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

    footer {
      position: relative; z-index: 1;
      border-top: 1px solid var(--border);
      padding: 28px 48px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-brand { font-weight: 800; font-size: 14px; letter-spacing: 0.1em; color: var(--text); }
    .footer-meta { font-size: 12px; color: var(--muted); }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a { font-size: 12px; color: var(--muted); }
    .footer-links a:hover { color: var(--accent); }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; gap: 40px; padding: 120px 24px 60px; }
      .phone-wrap { display: none; }
      .hero-headline { font-size: 38px; }
      .stats { gap: 32px; flex-wrap: wrap; }
      .feature-grid, .trends-grid { grid-template-columns: 1fr; }
      .palette-row { flex-direction: column; }
      nav { padding: 0 24px; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <nav>
    <div class="nav-brand">AURA<span>.</span></div>
    <div class="nav-badge">Weekly Update · April 2026</div>
    <div class="nav-links">
      <a href="#trends">Trends</a>
      <a href="#colors">Colors</a>
      <a href="#sites">Sites</a>
      <a href="#about">About</a>
    </div>
    <a class="nav-cta" href="#viewer">View Prototype →</a>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <p class="hero-eyebrow">Design Intelligence Platform</p>
      <h1 class="hero-headline">
        See what's<br>
        <span class="gradient-text">trending</span><br>
        in design
      </h1>
      <p class="hero-sub">
        AURA tracks thousands of web designs weekly — surfacing aurora gradients, editorial typography, retro revivals, and every pattern shaping the visual web right now.
      </p>
      <div class="hero-ctas">
        <a class="btn-primary" href="https://ram.zenbin.org/aura-viewer">View Prototype</a>
        <a class="btn-ghost" href="https://ram.zenbin.org/aura-mock">Interactive Mock ☀◑</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="phone-glow"></div>
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-screen" style="position:relative;">
          <div class="ps-aurora-orb"></div>
          <div class="ps-aurora-orb2"></div>
          <div class="ps-header">
            <div>
              <div class="ps-brand">AURA</div>
              <div class="ps-sub-brand">Design Intelligence</div>
            </div>
            <div class="ps-bell">🔔</div>
          </div>
          <div class="ps-label">TRENDING THIS WEEK</div>
          <div class="ps-hero-card">
            <div class="ps-hero-card-tag">↑ RISING</div>
            <div class="ps-hero-card-title">Aurora Mesh<br>Gradients</div>
            <div class="ps-hero-card-sub">847 sites using this trend →</div>
          </div>
          <div class="ps-section">Trending Patterns</div>
          <div class="ps-trend-row">
            <div class="ps-trend-card">
              <div class="ps-swatches">
                <div class="ps-swatch" style="background:#7B5CF0"></div>
                <div class="ps-swatch" style="background:#E0508F"></div>
                <div class="ps-swatch" style="background:#F07840"></div>
              </div>
              <div class="ps-tc-title">Editorial<br>Type Scale</div>
            </div>
            <div class="ps-trend-card">
              <div class="ps-swatches">
                <div class="ps-swatch" style="background:#1DA8F0"></div>
                <div class="ps-swatch" style="background:#2DB87A"></div>
                <div class="ps-swatch" style="background:#7B5CF0"></div>
              </div>
              <div class="ps-tc-title">3D Floating<br>Objects</div>
            </div>
          </div>
          <div class="ps-section">Color Stories</div>
          <div class="ps-color-row">
            <div class="ps-big-swatch" style="background:#E8875A"></div>
            <div class="ps-big-swatch" style="background:#F0BC5A"></div>
            <div class="ps-big-swatch" style="background:#E05858"></div>
            <div class="ps-big-swatch" style="background:#7B5CF0"></div>
            <div class="ps-cr-name">Solstice Warmth</div>
          </div>
          <div class="ps-nav-bar">
            <div class="ps-nav-item active">
              <div class="ps-nav-icon">⊞</div>
              <div class="ps-nav-label">Trends</div>
            </div>
            <div class="ps-nav-item">
              <div class="ps-nav-icon">⌕</div>
              <div class="ps-nav-label">Explore</div>
            </div>
            <div class="ps-nav-item">
              <div class="ps-nav-icon">★</div>
              <div class="ps-nav-label">Saved</div>
            </div>
            <div class="ps-nav-item">
              <div class="ps-nav-icon">◧</div>
              <div class="ps-nav-label">Colors</div>
            </div>
            <div class="ps-nav-item">
              <div class="ps-nav-icon">◎</div>
              <div class="ps-nav-label">Profile</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="stats">
    <div class="stat">
      <div class="stat-value stat-accent">2,847</div>
      <div class="stat-label">Sites tracked weekly</div>
    </div>
    <div class="stat">
      <div class="stat-value">134</div>
      <div class="stat-label">New sites this week</div>
    </div>
    <div class="stat">
      <div class="stat-value">28</div>
      <div class="stat-label">Active trend signals</div>
    </div>
    <div class="stat">
      <div class="stat-value stat-accent">4</div>
      <div class="stat-label">Galleries monitored</div>
    </div>
  </div>

  <section class="features" id="about">
    <p class="section-label">What AURA does</p>
    <h2 class="section-title">Design intelligence that keeps you current</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">🌅</div>
        <h3 class="feature-title">Trend Tracking</h3>
        <p class="feature-desc">Monitors Awwwards, Dark Mode Design, Minimal Gallery, and more to surface rising patterns before they peak.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:rgba(240,120,64,0.1);">🎨</div>
        <h3 class="feature-title">Color Stories</h3>
        <p class="feature-desc">Extracts and clusters color palettes from curated sites, revealing the color language of the current web.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:rgba(29,168,240,0.1);">⚡</div>
        <h3 class="feature-title">Weekly Digest</h3>
        <p class="feature-desc">Every Monday: a focused report on the 5 most significant design shifts observed across thousands of new sites.</p>
      </div>
    </div>
  </section>

  <section class="trends-section" id="trends">
    <div class="trends-inner">
      <p class="section-label">Current signals</p>
      <h2 class="section-title">What's moving this week</h2>
      <div class="trends-grid">
        <div class="trend-card">
          <div class="trend-img" style="background:linear-gradient(135deg,#1A0A2E,#7B5CF0,#E0508F,#F07840);">
            <div class="trend-tag">↑ RISING</div>
          </div>
          <div class="trend-body">
            <h4 class="trend-title">Aurora Mesh Gradients</h4>
            <p class="trend-sub">Soft multi-color blob gradients on dark AND light backgrounds — seen on Orbi, Champions For Good, and dozens more Awwwards nominees.</p>
            <div class="trend-footer">
              <span class="trend-count">↑ 847 sites</span>
              <span class="trend-arrow">→</span>
            </div>
          </div>
        </div>
        <div class="trend-card">
          <div class="trend-img" style="background:#F5F200; display:flex; align-items:center; justify-content:center;">
            <span style="font-size:56px; font-weight:900; color:#000; letter-spacing:-3px;">Aa</span>
            <div class="trend-tag">STRONG</div>
          </div>
          <div class="trend-body">
            <h4 class="trend-title">Type as Visual Architecture</h4>
            <p class="trend-sub">Oversized letterforms — sometimes fragmented — used as primary visual elements. KOMETA, Otherkind, and dozens of top portfolio sites.</p>
            <div class="trend-footer">
              <span class="trend-count">↑ 23% YoW</span>
              <span class="trend-arrow">→</span>
            </div>
          </div>
        </div>
        <div class="trend-card">
          <div class="trend-img" style="background:#0C0A14; display:flex; align-items:center; padding:12px;">
            <div style="background:#1A1828; border-radius:6px; padding:8px; width:100%; font-size:8px; color:#E8E4F8; font-family:monospace;">
              <div style="color:#9B7FF8; margin-bottom:4px;">● DASHBOARD — ONLINE</div>
              <div style="background:#14111F; border-radius:4px; height:16px; margin-bottom:3px;"></div>
              <div style="background:#14111F; border-radius:4px; height:16px; width:70%;"></div>
            </div>
            <div class="trend-tag">HOT</div>
          </div>
          <div class="trend-body">
            <h4 class="trend-title">Product UI as Hero</h4>
            <p class="trend-sub">SaaS tools using their own dark-mode interface as the hero visual. The product IS the advertisement — seen on Cushion, Tayte.co, and many others.</p>
            <div class="trend-footer">
              <span class="trend-count">↑ 18% YoW</span>
              <span class="trend-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="colors-section" id="colors">
    <p class="section-label">Color intelligence</p>
    <h2 class="section-title">Palettes of the moment</h2>
    <div class="palette-row">
      <div class="palette-card">
        <div class="palette-swatches">
          <div class="palette-swatch" style="background:#7B5CF0;"></div>
          <div class="palette-swatch" style="background:#E0508F;"></div>
          <div class="palette-swatch" style="background:#F07840;"></div>
          <div class="palette-swatch" style="background:#F5C842;"></div>
          <div class="palette-swatch" style="background:#2DB87A;"></div>
        </div>
        <div class="palette-info">
          <div class="palette-name">Aurora · 2026</div>
          <div class="palette-meta">★ 2,411 saves · Trending</div>
        </div>
      </div>
      <div class="palette-card">
        <div class="palette-swatches">
          <div class="palette-swatch" style="background:#FAF8F4;"></div>
          <div class="palette-swatch" style="background:#E5E0D4;"></div>
          <div class="palette-swatch" style="background:#B5AF9E;"></div>
          <div class="palette-swatch" style="background:#3D3830;"></div>
          <div class="palette-swatch" style="background:#1A1714;"></div>
        </div>
        <div class="palette-info">
          <div class="palette-name">Warm Editorial</div>
          <div class="palette-meta">★ 1,890 saves · Classic</div>
        </div>
      </div>
      <div class="palette-card">
        <div class="palette-swatches">
          <div class="palette-swatch" style="background:#00DD44;"></div>
          <div class="palette-swatch" style="background:#F5F200;"></div>
          <div class="palette-swatch" style="background:#FF2266;"></div>
          <div class="palette-swatch" style="background:#0055FF;"></div>
          <div class="palette-swatch" style="background:#000000;"></div>
        </div>
        <div class="palette-info">
          <div class="palette-name">Y2K Revival</div>
          <div class="palette-meta">★ 1,240 saves · Rising</div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-band">
    <h2>Your design, informed by data</h2>
    <p>Stop guessing what's current. Let AURA show you.</p>
    <a class="btn-white" href="https://ram.zenbin.org/aura-viewer">Explore the prototype →</a>
  </section>

  <footer>
    <div class="footer-brand">AURA.</div>
    <div class="footer-meta">A RAM Design Heartbeat · April 2026 · Inspired by darkmodedesign.com &amp; minimal.gallery</div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/aura-viewer">Viewer</a>
      <a href="https://ram.zenbin.org/aura-mock">Mock</a>
    </div>
  </footer>

</body>
</html>`;

// ─── VIEWER HTML ─────────────────────────────────────────────────────────────
const minimalViewer = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AURA — Prototype Viewer</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { margin: 0; background: #FAF8F4; font-family: Inter, sans-serif; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
    header { width: 100%; background: rgba(250,248,244,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid #E5E0D4; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 52px; position: sticky; top: 0; z-index: 100; }
    .brand { font-weight: 900; font-size: 16px; letter-spacing: 0.12em; }
    .brand span { color: #7B5CF0; }
    .links a { margin-left: 20px; font-size: 13px; color: #B5AF9E; text-decoration: none; }
    .links a:hover { color: #7B5CF0; }
    main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
    #pen-container { width: 100%; max-width: 1100px; }
    #pen-container iframe, #pen-container canvas { width: 100%; border: none; border-radius: 16px; box-shadow: 0 24px 64px rgba(26,23,20,0.1); }
    .fallback { text-align: center; padding: 60px 24px; color: #B5AF9E; }
    .fallback h2 { font-size: 18px; font-weight: 700; color: #1A1714; margin-bottom: 8px; }
    footer { padding: 20px; font-size: 11px; color: #B5AF9E; }
  </style>
</head>
<body>
  <header>
    <div class="brand">AURA<span>.</span></div>
    <div class="links">
      <a href="https://ram.zenbin.org/aura">← Hero</a>
      <a href="https://ram.zenbin.org/aura-mock">Mock ☀◑</a>
    </div>
  </header>
  <main>
    <div id="pen-container">
      <div class="fallback">
        <h2>AURA Prototype</h2>
        <p>Pen data embedded for pencil.dev viewer</p>
      </div>
    </div>
  </main>
  <footer>AURA — Design Trend Intelligence · RAM Heartbeat · April 2026</footer>
  <script>
  // EMBEDDED_PEN injected by publisher
  (function() {
    const pen = window.EMBEDDED_PEN;
    if (!pen) return;
    const container = document.getElementById('pen-container');
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#7B5CF0;font-weight:600;">Pen loaded — ' + JSON.parse(pen).screens.length + ' screens</p>';
  })();
  </script>
</body>
</html>`;

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
async function run() {
  // 1. Publish hero
  console.log('Publishing hero page…');
  fs.writeFileSync(path.join(__dirname, `${SLUG}-hero.html`), heroHtml);
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log('Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 120));

  // 2. Publish viewer with embedded pen
  console.log('Publishing viewer…');
  const penJson = fs.readFileSync(path.join(__dirname, 'aura.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let viewerHtml = minimalViewer.replace('<script>', injection + '\n<script>');
  fs.writeFileSync(path.join(__dirname, `${SLUG}-viewer.html`), viewerHtml);

  const viewerRes = await zenPut(`${SLUG}-viewer`, `${APP_NAME} — Prototype Viewer`, viewerHtml);
  console.log('Viewer:', viewerRes.status, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 120));

  console.log('\nURLs:');
  console.log(`  Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
