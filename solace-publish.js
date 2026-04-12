/**
 * solace-publish.js
 * Publish SOLACE hero page + viewer to ram.zenbin.org
 * Theme: LIGHT — warm cream editorial wellness journal
 * Inspired by Dawn (land-book) + Maxima Therapy (Awwwards)
 */
'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'solace';
const SUBDOMAIN = 'ram';
const APP_NAME  = 'Solace';
const TAGLINE   = 'Your quiet corner for reflection';

// ─── ZenBin helper ────────────────────────────────────────────────────────────
function zenPost(slug, htmlContent, subdomain) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html: htmlContent }));
    const headers = {
      'Content-Type':   'application/json',
      'Content-Length': body.length,
    };
    if (subdomain) headers['X-Subdomain'] = subdomain;
    const req = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}?overwrite=true`,
      method:   'POST',
      headers,
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Hero Page ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Solace — Your quiet corner for reflection</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:        #F7F3EE;
    --surface:   #FEFCFA;
    --surface2:  #F0EBE3;
    --card:      #FFFFFF;
    --border:    #E8E0D8;
    --text:      #1C1815;
    --textMid:   #5A4E44;
    --muted:     #A89B8E;
    --accent:    #C87860;
    --accent2:   #7A9E82;
    --accentSoft:#F0DDD6;
    --sage:      #EAF1EB;
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* ── Ambient texture ── */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 800px 600px at 80% 10%, rgba(200,120,96,0.06) 0%, transparent 70%),
      radial-gradient(ellipse 600px 500px at 10% 80%, rgba(122,158,130,0.07) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 68px;
    background: rgba(247,243,238,0.88);
    backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid var(--border);
  }
  .nav-brand {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    color: var(--text); text-decoration: none;
  }
  .nav-brand span {
    width: 32px; height: 32px; border-radius: 10px;
    background: var(--accent); display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 16px;
  }
  .nav-links { display: flex; gap: 36px; }
  .nav-links a {
    font-size: 14px; font-weight: 500; color: var(--muted);
    text-decoration: none; transition: color .2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 10px 22px; border-radius: 10px;
    font-size: 14px; font-weight: 600; text-decoration: none;
    transition: transform .15s, box-shadow .15s;
    box-shadow: 0 4px 16px rgba(200,120,96,0.28);
  }
  .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(200,120,96,0.38); }

  /* ── HERO ── */
  .hero {
    position: relative; z-index: 1;
    max-width: 1180px; margin: 0 auto;
    padding: 148px 48px 100px;
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 80px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accentSoft); color: var(--accent);
    border-radius: 100px; font-size: 11px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    padding: 7px 16px; margin-bottom: 28px;
    border: 1px solid rgba(200,120,96,0.2);
  }
  .hero-eyebrow::before {
    content: '◆'; font-size: 8px; color: var(--accent2);
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(44px, 5.5vw, 72px);
    font-weight: 700; line-height: 1.08;
    letter-spacing: -1px; margin-bottom: 24px;
    color: var(--text);
  }
  .hero h1 em {
    font-style: italic; color: var(--accent);
  }
  .hero-sub {
    font-size: 18px; color: var(--textMid);
    max-width: 480px; margin-bottom: 40px; line-height: 1.7;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 15px 30px; border-radius: 14px;
    font-size: 15px; font-weight: 700; text-decoration: none;
    box-shadow: 0 6px 24px rgba(200,120,96,0.30);
    transition: transform .15s, box-shadow .15s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(200,120,96,0.40); }
  .btn-secondary {
    background: var(--card); color: var(--textMid);
    padding: 15px 26px; border-radius: 14px;
    font-size: 15px; font-weight: 600; text-decoration: none;
    border: 1px solid var(--border);
    box-shadow: 0 2px 8px rgba(92,68,52,0.06);
    transition: border-color .2s, box-shadow .2s;
  }
  .btn-secondary:hover { border-color: var(--accent); box-shadow: 0 4px 16px rgba(200,120,96,0.12); }

  /* ── PHONE DEVICE ── */
  .device-wrap {
    display: flex; justify-content: center;
    filter: drop-shadow(0 40px 80px rgba(92,68,52,0.18));
  }
  .device {
    width: 280px; border-radius: 48px;
    background: #FEFCFA;
    border: 8px solid #E8E0D8;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.8);
    overflow: hidden; position: relative;
  }
  .device-notch {
    position: absolute; top: 14px; left: 50%;
    transform: translateX(-50%);
    width: 90px; height: 24px;
    background: #1C1815; border-radius: 12px; z-index: 10;
  }
  .d-screen { padding: 50px 16px 16px; background: var(--bg); }
  .d-greeting { font-size: 9px; color: var(--muted); font-family: 'Inter', sans-serif; margin-bottom: 1px; letter-spacing: .08em; text-transform: uppercase; }
  .d-name {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 14px;
  }
  .d-mood-card {
    background: var(--card); border-radius: 16px;
    padding: 12px; margin-bottom: 10px;
    box-shadow: 0 4px 16px rgba(92,68,52,0.08);
  }
  .d-mood-label { font-size: 8px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
  .d-mood-row { display: flex; gap: 6px; }
  .d-mood-item {
    flex: 1; padding: 6px 4px; border-radius: 8px;
    background: var(--bg); text-align: center;
    font-size: 14px;
  }
  .d-mood-item.active { background: var(--accentSoft); box-shadow: 0 0 0 1px rgba(200,120,96,0.4); }
  .d-mood-name { font-size: 7px; color: var(--muted); margin-top: 2px; }
  .d-mood-name.active { color: var(--accent); }
  .d-row2 { display: flex; gap: 8px; margin-bottom: 10px; }
  .d-streak {
    flex: 1; background: var(--accentSoft); border-radius: 12px;
    padding: 10px; display: flex; flex-direction: column;
  }
  .d-streak-num {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; color: var(--accent); line-height: 1;
  }
  .d-streak-lbl { font-size: 7px; color: var(--textMid); }
  .d-prompt {
    flex: 1; background: var(--sage); border-radius: 12px;
    padding: 10px;
  }
  .d-prompt-q {
    font-family: 'Playfair Display', serif;
    font-size: 10px; font-style: italic; color: var(--text); line-height: 1.4;
  }
  .d-entry {
    background: var(--card); border-radius: 12px;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(92,68,52,0.06);
  }
  .d-entry-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .d-entry-name { font-size: 9px; font-weight: 600; color: var(--text); }
  .d-entry-preview { font-size: 8px; color: var(--muted); line-height: 1.4; }
  .d-nav {
    background: var(--card); border-top: 1px solid var(--border);
    display: flex; justify-content: space-around;
    padding: 10px 0 6px;
  }
  .d-nav-item { text-align: center; }
  .d-nav-icon { font-size: 16px; }
  .d-nav-lbl { font-size: 7px; color: var(--muted); }
  .d-nav-lbl.active { color: var(--accent); }

  /* ── TRUST BAR ── */
  .trust-bar {
    position: relative; z-index: 1;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 20px 48px;
    display: flex; align-items: center;
    gap: 48px; overflow: hidden;
    background: var(--surface);
  }
  .trust-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; white-space: nowrap; }
  .trust-items { display: flex; gap: 40px; }
  .trust-item {
    font-size: 13px; font-weight: 600; color: var(--textMid);
    display: flex; align-items: center; gap: 8px;
  }
  .trust-item::before { content: '✦'; color: var(--accent); font-size: 10px; }

  /* ── FEATURES ── */
  .features {
    position: relative; z-index: 1;
    max-width: 1180px; margin: 0 auto;
    padding: 100px 48px;
  }
  .section-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; color: var(--accent);
    margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 4vw, 52px);
    font-weight: 700; line-height: 1.1;
    color: var(--text); max-width: 600px; margin-bottom: 64px;
  }
  .section-title em { font-style: italic; color: var(--accent); }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .feat-card {
    background: var(--card); border-radius: 20px;
    padding: 32px; border: 1px solid var(--border);
    transition: transform .2s, box-shadow .2s;
    box-shadow: 0 4px 16px rgba(92,68,52,0.05);
  }
  .feat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(92,68,52,0.10); }
  .feat-icon {
    width: 52px; height: 52px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 20px;
  }
  .feat-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 700;
    color: var(--text); margin-bottom: 10px;
  }
  .feat-desc { font-size: 14px; color: var(--textMid); line-height: 1.65; }

  /* ── MOOD INSIGHTS SECTION ── */
  .insights-section {
    position: relative; z-index: 1;
    background: var(--surface2);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 100px 48px;
  }
  .insights-inner {
    max-width: 1180px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
  }
  .insight-visual {
    background: var(--card); border-radius: 24px;
    padding: 32px; border: 1px solid var(--border);
    box-shadow: 0 8px 32px rgba(92,68,52,0.08);
  }
  .iv-title { font-size: 11px; font-weight: 700; letter-spacing: .1em; color: var(--muted); text-transform: uppercase; margin-bottom: 20px; }
  .mood-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 6px; margin-bottom: 16px; }
  .mood-dot {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
  }
  .md-great { background: var(--sage); }
  .md-good  { background: var(--accentSoft); }
  .md-low   { background: #F5EBE8; }
  .md-blank { background: var(--border); }
  .insight-stat {
    display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px;
  }
  .is-num {
    font-family: 'Playfair Display', serif;
    font-size: 36px; font-weight: 700; color: var(--accent);
  }
  .is-label { font-size: 13px; color: var(--muted); }
  .insight-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
  .insight-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag {
    padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 500;
    background: var(--bg); border: 1px solid var(--border); color: var(--textMid);
  }
  .tag.hi { background: var(--accentSoft); border-color: rgba(200,120,96,0.3); color: var(--accent); }

  /* ── BREATHE SECTION ── */
  .breathe-section {
    position: relative; z-index: 1;
    max-width: 1180px; margin: 0 auto;
    padding: 100px 48px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
  }
  .breathe-visual {
    display: flex; justify-content: center; align-items: center;
    position: relative; height: 320px;
  }
  .b-ring {
    position: absolute; border-radius: 50%;
    animation: breathePulse 4s ease-in-out infinite;
  }
  @keyframes breathePulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50%  { transform: scale(1.08); opacity: 1; }
  }
  .b-ring-1 { width: 280px; height: 280px; background: rgba(200,120,96,0.08); animation-delay: 0s; }
  .b-ring-2 { width: 220px; height: 220px; background: rgba(200,120,96,0.14); animation-delay: .3s; }
  .b-ring-3 { width: 160px; height: 160px; background: linear-gradient(135deg, var(--accentSoft), var(--accent)); animation-delay: .6s; }
  .b-label { position: absolute; color: #fff; text-align: center; z-index: 2; }
  .b-word { font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; }
  .b-count { font-size: 36px; font-weight: 700; line-height: 1; }

  /* ── QUOTE SECTION ── */
  .quote-section {
    position: relative; z-index: 1;
    background: var(--accent);
    padding: 80px 48px; text-align: center;
    overflow: hidden;
  }
  .quote-section::before {
    content: '❝';
    position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
    font-size: 200px; color: rgba(255,255,255,0.08);
    font-family: 'Playfair Display', serif; line-height: 1;
    pointer-events: none;
  }
  .quote-text {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 3.5vw, 40px);
    font-style: italic; font-weight: 400;
    color: #fff; max-width: 800px; margin: 0 auto 20px;
    line-height: 1.45; position: relative; z-index: 1;
  }
  .quote-attr {
    font-size: 13px; color: rgba(255,255,255,0.65);
    text-transform: uppercase; letter-spacing: .1em;
    position: relative; z-index: 1;
  }

  /* ── HOW IT WORKS ── */
  .how-section {
    position: relative; z-index: 1;
    max-width: 1180px; margin: 0 auto;
    padding: 100px 48px;
  }
  .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
  .step { text-align: center; }
  .step-num {
    width: 52px; height: 52px; border-radius: 50%;
    background: var(--accentSoft); color: var(--accent);
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
    border: 2px solid rgba(200,120,96,0.3);
  }
  .step h3 { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .step p { font-size: 13px; color: var(--textMid); line-height: 1.6; }

  /* ── FOOTER ── */
  footer {
    position: relative; z-index: 1;
    background: var(--text); color: rgba(254,252,250,0.7);
    padding: 60px 48px 40px;
  }
  .footer-inner {
    max-width: 1180px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: flex-start;
    flex-wrap: wrap; gap: 32px; margin-bottom: 40px;
  }
  .footer-brand {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700; color: #FEFCFA; margin-bottom: 8px;
  }
  .footer-sub { font-size: 13px; max-width: 260px; line-height: 1.6; }
  .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
  .footer-links a { font-size: 13px; color: rgba(254,252,250,0.6); text-decoration: none; transition: color .2s; }
  .footer-links a:hover { color: #FEFCFA; }
  .footer-bottom {
    max-width: 1180px; margin: 0 auto;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 24px;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px; font-size: 12px;
  }
  .footer-credit { color: rgba(200,120,96,0.8); }

  @media (max-width: 900px) {
    .hero, .insights-inner, .breathe-section { grid-template-columns: 1fr; }
    .features-grid, .steps { grid-template-columns: repeat(2, 1fr); }
    .device-wrap { display: none; }
    nav { padding: 0 24px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <a class="nav-brand" href="#">
    <span>S</span> Solace
  </a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#insights">Insights</a>
    <a href="#breathe">Breathe</a>
    <a href="https://ram.zenbin.org/solace-viewer">View Design</a>
  </div>
  <a href="https://ram.zenbin.org/solace-mock" class="nav-cta">Try Mock →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div>
    <div class="hero-eyebrow">Mindful Journaling App · Design Concept</div>
    <h1>Find your <em>quiet</em><br>corner every day</h1>
    <p class="hero-sub">Solace is a warm, editorial journaling companion. Track your mood, write freely, breathe deeply — and discover patterns in your emotional landscape over time.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/solace-mock" class="btn-primary">Explore Mock ☀◑</a>
      <a href="https://ram.zenbin.org/solace-viewer" class="btn-secondary">View .pen Design →</a>
    </div>
  </div>

  <!-- Phone device mockup -->
  <div class="device-wrap">
    <div class="device">
      <div class="device-notch"></div>
      <div class="d-screen">
        <div class="d-greeting">Good morning,</div>
        <div class="d-name">Anika.</div>

        <div class="d-mood-card">
          <div class="d-mood-label">How are you feeling?</div>
          <div class="d-mood-row">
            <div class="d-mood-item active">😌<div class="d-mood-name active">Calm</div></div>
            <div class="d-mood-item">😊<div class="d-mood-name">Happy</div></div>
            <div class="d-mood-item">😤<div class="d-mood-name">Tense</div></div>
            <div class="d-mood-item">😔<div class="d-mood-name">Low</div></div>
            <div class="d-mood-item">✨<div class="d-mood-name">Great</div></div>
          </div>
        </div>

        <div class="d-row2">
          <div class="d-streak">
            <div style="font-size:16px">🔥</div>
            <div class="d-streak-num">12</div>
            <div class="d-streak-lbl">day streak</div>
          </div>
          <div class="d-prompt">
            <div class="d-prompt-q">"What made<br>you smile?"</div>
          </div>
        </div>

        <div class="d-entry">
          <div class="d-entry-head">
            <span>😊</span>
            <span class="d-entry-name">Yesterday — Happy</span>
          </div>
          <div class="d-entry-preview">"I finished the book I've been meaning to read for months..."</div>
        </div>
      </div>
      <div class="d-nav">
        <div class="d-nav-item"><div class="d-nav-icon">⊙</div><div class="d-nav-lbl active">Today</div></div>
        <div class="d-nav-item"><div class="d-nav-icon">✏</div><div class="d-nav-lbl">Journal</div></div>
        <div class="d-nav-item"><div class="d-nav-icon">◑</div><div class="d-nav-lbl">Insights</div></div>
        <div class="d-nav-item"><div class="d-nav-icon">◎</div><div class="d-nav-lbl">Breathe</div></div>
        <div class="d-nav-item"><div class="d-nav-icon">○</div><div class="d-nav-lbl">Profile</div></div>
      </div>
    </div>
  </div>
</section>

<!-- TRUST BAR -->
<div class="trust-bar">
  <div class="trust-label">Designed with care for</div>
  <div class="trust-items">
    <div class="trust-item">Daily journaling</div>
    <div class="trust-item">Mood awareness</div>
    <div class="trust-item">Guided breathing</div>
    <div class="trust-item">Emotional growth</div>
    <div class="trust-item">Warm editorial tone</div>
  </div>
</div>

<!-- FEATURES -->
<section class="features" id="features">
  <div class="section-eyebrow">Core Features</div>
  <h2 class="section-title">Everything you need to <em>reflect</em> and grow</h2>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--accentSoft)">😌</div>
      <div class="feat-title">Daily Mood Check-in</div>
      <p class="feat-desc">Start each day with a gentle mood log. Five expressive states, one tap — no friction, no pressure.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--sage)">✏️</div>
      <div class="feat-title">Free-form Journal</div>
      <p class="feat-desc">A distraction-free writing space with a lined-paper aesthetic. Tag entries with feelings and photos.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#F5EBE8">◑</div>
      <div class="feat-title">Mood Insights</div>
      <p class="feat-desc">A monthly calendar heatmap and an emotion word-cloud reveal patterns in your emotional life.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--accentSoft)">◎</div>
      <div class="feat-title">Guided Breathing</div>
      <p class="feat-desc">4-7-8, box breathing, body scan — animated breathing circles guide you through calming sessions.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--sage)">🔥</div>
      <div class="feat-title">Streaks & Milestones</div>
      <p class="feat-desc">Gentle gamification keeps you coming back. Earn badges for first entry, 7-day streaks, and more.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#F5EBE8">✦</div>
      <div class="feat-title">Pattern Insights</div>
      <p class="feat-desc">"You feel happiest on Wednesdays." Solace surfaces gentle patterns without judgment.</p>
    </div>
  </div>
</section>

<!-- INSIGHTS SECTION -->
<section class="insights-section" id="insights">
  <div class="insights-inner">
    <div>
      <div class="section-eyebrow">Mood Insights</div>
      <h2 class="section-title" style="max-width:480px">See your emotional <em>landscape</em> at a glance</h2>
      <p style="font-size:16px;color:var(--textMid);line-height:1.7;margin-bottom:24px">A calendar heatmap, emotion word-cloud, and AI-nudged pattern summaries give you genuine self-awareness without the anxiety spiral of productivity dashboards.</p>
      <div style="display:flex;gap:32px;margin-top:32px">
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:var(--accent)">87%</div>
          <div style="font-size:13px;color:var(--muted)">positive mood days</div>
        </div>
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:var(--accent2)">23</div>
          <div style="font-size:13px;color:var(--muted)">entries this month</div>
        </div>
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:var(--text)">12d</div>
          <div style="font-size:13px;color:var(--muted)">current streak</div>
        </div>
      </div>
    </div>
    <div class="insight-visual">
      <div class="iv-title">April Mood Map</div>
      <div class="mood-grid">
        ${['md-great','md-good','md-great','md-great','md-low','md-good','md-great',
           'md-good','md-great','md-great','md-low','md-good','md-great','md-great',
           'md-great','md-good','md-great','md-good','md-great','md-great','md-low',
           'md-blank','md-blank','md-blank','md-blank','md-blank','md-blank','md-blank']
          .map(c => `<div class="mood-dot ${c}"></div>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:16px;display:flex;gap:16px;align-items:center">
        <span style="display:flex;align-items:center;gap:6px"><span class="mood-dot md-great" style="width:14px;height:14px;display:inline-block"></span>Great</span>
        <span style="display:flex;align-items:center;gap:6px"><span class="mood-dot md-good" style="width:14px;height:14px;display:inline-block"></span>Okay</span>
        <span style="display:flex;align-items:center;gap:6px"><span class="mood-dot md-low" style="width:14px;height:14px;display:inline-block"></span>Low</span>
      </div>
      <div style="background:var(--accentSoft);border-radius:12px;padding:14px;border:1px solid rgba(200,120,96,0.2)">
        <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:6px">✦ Pattern found</div>
        <div style="font-size:13px;font-style:italic;font-family:'Playfair Display',serif;color:var(--textMid);line-height:1.5">You feel happiest on Wednesdays. Morning entries tend to be more positive.</div>
      </div>
      <div class="tag-cloud" style="margin-top:16px">
        <span class="tag hi">grateful</span>
        <span class="tag hi">peaceful</span>
        <span class="tag">creative</span>
        <span class="tag">hopeful</span>
        <span class="tag">energised</span>
        <span class="tag">tender</span>
      </div>
    </div>
  </div>
</section>

<!-- BREATHE SECTION -->
<section class="breathe-section" id="breathe">
  <div class="breathe-visual">
    <div class="b-ring b-ring-1"></div>
    <div class="b-ring b-ring-2"></div>
    <div class="b-ring b-ring-3">
      <div class="b-label">
        <div class="b-word">Inhale</div>
        <div class="b-count">4</div>
      </div>
    </div>
  </div>
  <div>
    <div class="section-eyebrow">Guided Breathe</div>
    <h2 class="section-title" style="max-width:440px">Calm your nervous system with <em>breath</em></h2>
    <p style="font-size:16px;color:var(--textMid);line-height:1.7;margin-bottom:28px">Three practice modes — 4-7-8 breathing, box breathing, and body scan — with an animated breathing circle that visually guides each phase.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:var(--accentSoft);border-radius:14px;padding:16px">
        <div style="font-size:20px;margin-bottom:8px">⬜</div>
        <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">Box Breathing</div>
        <div style="font-size:12px;color:var(--muted)">4×4 balance and clarity</div>
      </div>
      <div style="background:var(--sage);border-radius:14px;padding:16px">
        <div style="font-size:20px;margin-bottom:8px">🌙</div>
        <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">Body Scan</div>
        <div style="font-size:12px;color:var(--muted)">5 min deep unwind</div>
      </div>
    </div>
  </div>
</section>

<!-- QUOTE -->
<section class="quote-section">
  <div class="quote-text">"Growth begins the moment you start noticing."</div>
  <div class="quote-attr">— Solace Daily Insight</div>
</section>

<!-- HOW IT WORKS -->
<section class="how-section">
  <div style="text-align:center;margin-bottom:64px">
    <div class="section-eyebrow" style="text-align:center">How it works</div>
    <h2 class="section-title" style="margin:0 auto;text-align:center">Four simple steps to <em>inner clarity</em></h2>
  </div>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <h3>Log your mood</h3>
      <p>One tap to capture how you're feeling — no lengthy forms, just a quick honest check-in.</p>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <h3>Write freely</h3>
      <p>A warm, distraction-free page invites you to write whatever is on your mind — or respond to today's prompt.</p>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <h3>Breathe & reset</h3>
      <p>When tension creeps in, open Breathe and let the animated circle guide you back to calm.</p>
    </div>
    <div class="step">
      <div class="step-num">4</div>
      <h3>Discover patterns</h3>
      <p>Over time, Insights surfaces gentle patterns — the days you shine, the words you reach for most.</p>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div>
      <div class="footer-brand">Solace</div>
      <div class="footer-sub">Your quiet corner for reflection. A design concept by RAM.</div>
    </div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/solace-viewer">View .pen</a>
      <a href="https://ram.zenbin.org/solace-mock">Live Mock</a>
    </div>
  </div>
  <div class="footer-bottom">
    <div>© 2026 Solace — Design Concept</div>
    <div class="footer-credit">✦ RAM Design Heartbeat · ram.zenbin.org</div>
  </div>
</footer>

</body>
</html>`;

// ─── Viewer Page ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'solace.pen'), 'utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Solace — Design Viewer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #F7F3EE; color: #1C1815; min-height: 100vh; }
  .top-bar {
    background: rgba(247,243,238,0.9); backdrop-filter: blur(12px);
    border-bottom: 1px solid #E8E0D8;
    padding: 0 32px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .tb-brand { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #1C1815; text-decoration: none; }
  .tb-meta { font-size: 12px; color: #A89B8E; }
  .tb-links { display: flex; gap: 16px; }
  .tb-links a { font-size: 13px; color: #C87860; text-decoration: none; font-weight: 500; }
  .main { max-width: 1280px; margin: 0 auto; padding: 40px 32px; }
  .viewer-header { margin-bottom: 32px; }
  .vh-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .1em; color: #A89B8E; text-transform: uppercase; margin-bottom: 8px; }
  .vh-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #1C1815; margin-bottom: 4px; }
  .vh-tagline { font-size: 15px; color: #5A4E44; font-style: italic; }
  .screens-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 32px; }
  .screen-card {
    background: #FFFFFF; border-radius: 20px; overflow: hidden;
    border: 1px solid #E8E0D8;
    box-shadow: 0 4px 20px rgba(92,68,52,0.08);
    transition: transform .2s, box-shadow .2s;
  }
  .screen-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(92,68,52,0.14); }
  .sc-header { padding: 16px 20px; border-bottom: 1px solid #E8E0D8; display: flex; align-items: center; justify-content: space-between; }
  .sc-name { font-size: 13px; font-weight: 600; color: #1C1815; }
  .sc-dot { width: 8px; height: 8px; border-radius: 50%; background: #C87860; }
  .sc-preview {
    background: #F7F3EE;
    height: 280px; display: flex; align-items: center; justify-content: center;
    font-size: 48px; position: relative; overflow: hidden;
  }
  .sc-preview-content { text-align: center; }
  .sc-preview-emoji { font-size: 52px; display: block; margin-bottom: 12px; }
  .sc-preview-label { font-family: 'Playfair Display', serif; font-size: 18px; font-style: italic; color: #5A4E44; }
  .sc-meta { padding: 14px 20px; display: flex; gap: 12px; flex-wrap: wrap; }
  .sc-tag { font-size: 10px; font-weight: 600; color: #A89B8E; background: #F0EBE3; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: .06em; }
  .meta-panel {
    background: #FFFFFF; border-radius: 20px; border: 1px solid #E8E0D8;
    padding: 28px; margin-top: 32px;
    box-shadow: 0 4px 16px rgba(92,68,52,0.06);
  }
  .mp-title { font-size: 12px; font-weight: 700; letter-spacing: .1em; color: #A89B8E; text-transform: uppercase; margin-bottom: 16px; }
  .mp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
  .mp-item { }
  .mp-label { font-size: 11px; color: #A89B8E; margin-bottom: 4px; }
  .mp-value { font-size: 14px; font-weight: 600; color: #1C1815; }
  .palette-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
  .swatch { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); }
  .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #C87860; text-decoration: none; margin-bottom: 20px; font-weight: 500; }
</style>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
</script>
</head>
<body>
<div class="top-bar">
  <a class="tb-brand" href="https://ram.zenbin.org/solace">← Solace</a>
  <div class="tb-meta">Pencil.dev v2.8 · 5 screens · Light theme</div>
  <div class="tb-links">
    <a href="https://ram.zenbin.org/solace-mock">Live Mock ☀◑</a>
  </div>
</div>
<div class="main">
  <a class="back-link" href="https://ram.zenbin.org/solace">← Back to landing</a>
  <div class="viewer-header">
    <div class="vh-eyebrow">Design Viewer · Solace</div>
    <div class="vh-title">Solace — Mindful Journal</div>
    <div class="vh-tagline">Your quiet corner for reflection</div>
  </div>
  <div class="screens-grid">
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">1 · Today</span><div class="sc-dot"></div></div>
      <div class="sc-preview"><div class="sc-preview-content"><span class="sc-preview-emoji">⊙</span><div class="sc-preview-label">Daily check-in</div></div></div>
      <div class="sc-meta"><span class="sc-tag">Home</span><span class="sc-tag">Mood</span><span class="sc-tag">Streak</span></div>
    </div>
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">2 · Journal Entry</span><div class="sc-dot"></div></div>
      <div class="sc-preview"><div class="sc-preview-content"><span class="sc-preview-emoji">✏️</span><div class="sc-preview-label">Write freely</div></div></div>
      <div class="sc-meta"><span class="sc-tag">Writing</span><span class="sc-tag">Tags</span><span class="sc-tag">Photos</span></div>
    </div>
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">3 · Insights</span><div class="sc-dot" style="background:#7A9E82"></div></div>
      <div class="sc-preview" style="background:#EAF1EB"><div class="sc-preview-content"><span class="sc-preview-emoji">◑</span><div class="sc-preview-label">Mood heatmap</div></div></div>
      <div class="sc-meta"><span class="sc-tag">Heatmap</span><span class="sc-tag">Patterns</span><span class="sc-tag">Words</span></div>
    </div>
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">4 · Breathe</span><div class="sc-dot" style="background:#C87860"></div></div>
      <div class="sc-preview" style="background:linear-gradient(135deg,#F5EFE8,#EAF1EB)"><div class="sc-preview-content"><span class="sc-preview-emoji">◎</span><div class="sc-preview-label">4-7-8 breathing</div></div></div>
      <div class="sc-meta"><span class="sc-tag">Animated</span><span class="sc-tag">Calm</span><span class="sc-tag">Practice</span></div>
    </div>
    <div class="screen-card">
      <div class="sc-header"><span class="sc-name">5 · Profile</span><div class="sc-dot" style="background:#A89B8E"></div></div>
      <div class="sc-preview"><div class="sc-preview-content"><span class="sc-preview-emoji">○</span><div class="sc-preview-label">Growth & milestones</div></div></div>
      <div class="sc-meta"><span class="sc-tag">Badges</span><span class="sc-tag">Stats</span><span class="sc-tag">Settings</span></div>
    </div>
  </div>

  <div class="meta-panel">
    <div class="mp-title">Design Meta</div>
    <div class="mp-grid">
      <div class="mp-item"><div class="mp-label">App name</div><div class="mp-value">Solace</div></div>
      <div class="mp-item"><div class="mp-label">Theme</div><div class="mp-value">Light · Warm Cream</div></div>
      <div class="mp-item"><div class="mp-label">Screens</div><div class="mp-value">5 screens</div></div>
      <div class="mp-item"><div class="mp-label">Archetype</div><div class="mp-value">Wellness Journal</div></div>
      <div class="mp-item"><div class="mp-label">Typography</div><div class="mp-value">Playfair Display + Inter</div></div>
      <div class="mp-item"><div class="mp-label">Inspired by</div><div class="mp-value">Dawn (land-book), Maxima Therapy (Awwwards)</div></div>
    </div>
    <div style="margin-top:20px">
      <div class="mp-label">Palette</div>
      <div class="palette-row">
        <div class="swatch" title="Cream bg #F7F3EE" style="background:#F7F3EE"></div>
        <div class="swatch" title="Warm white #FEFCFA" style="background:#FEFCFA"></div>
        <div class="swatch" title="Near-black #1C1815" style="background:#1C1815"></div>
        <div class="swatch" title="Terracotta #C87860" style="background:#C87860"></div>
        <div class="swatch" title="Sage #7A9E82" style="background:#7A9E82"></div>
        <div class="swatch" title="Blush #F0DDD6" style="background:#F0DDD6"></div>
        <div class="swatch" title="Sage tint #EAF1EB" style="background:#EAF1EB"></div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// ─── Publish ──────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing Solace hero page…');
  const heroRes = await zenPost(SLUG, heroHtml, SUBDOMAIN);
  console.log(`  Hero: ${heroRes.status === 200 || heroRes.status === 201 ? '✓' : '✗'} (${heroRes.status})`);
  if (heroRes.status !== 200 && heroRes.status !== 201) console.log('  Body:', heroRes.body.slice(0, 200));

  console.log('Publishing Solace viewer…');
  const viewerRes = await zenPost(`${SLUG}-viewer`, viewerHtml, SUBDOMAIN);
  console.log(`  Viewer: ${viewerRes.status === 200 || viewerRes.status === 201 ? '✓' : '✗'} (${viewerRes.status})`);
  if (viewerRes.status !== 200 && viewerRes.status !== 201) console.log('  Body:', viewerRes.body.slice(0, 200));

  console.log('\nLive URLs:');
  console.log(`  https://ram.zenbin.org/${SLUG}`);
  console.log(`  https://ram.zenbin.org/${SLUG}-viewer`);
})();
