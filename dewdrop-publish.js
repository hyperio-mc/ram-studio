'use strict';
// dewdrop-publish.js — DEWDROP hero page + viewer
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'dewdrop';
const APP_NAME  = 'DEWDROP';
const TAGLINE   = 'daily mood & micro-journal';
const ARCHETYPE = 'emotional-wellness-journal';
const PROMPT    = 'Light editorial mood tracking app. Inspired by: "Voy: Your Proactive Companion for Healthy Living" (17♥ on land-book), "Dawn" health/fitness on Lapa Ninja, and Litbix (minimal book tracker on minimal.gallery). Swiss editorial layout — large serif numerals as data viz, pure cream background (#F9F6F1), sage green (#7B9E87) + warm coral (#D4856A) accents, zero card shadows. 5 screens: Today (hero mood number), Log Mood, Patterns (heatmap), Journal (timeline), Insights (weekly wrap).';

const P = {
  bg:       '#F9F6F1',
  surface:  '#EDE9E0',
  ink:      '#1A1817',
  sage:     '#7B9E87',
  coral:    '#D4856A',
  amber:    '#D4A853',
  lavender: '#9B8FB5',
  divider:  '#D5D0C6',
  muted:    'rgba(26,24,23,0.38)',
  mutedMed: 'rgba(26,24,23,0.55)',
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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface}; --ink: ${P.ink};
    --sage: ${P.sage}; --coral: ${P.coral}; --amber: ${P.amber};
    --lavender: ${P.lavender}; --divider: ${P.divider};
    --muted: ${P.muted}; --mutedMed: ${P.mutedMed};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--ink); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(249,246,241,0.92); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--divider);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 56px;
  }
  .nav-brand { font-size: 17px; font-weight: 800; color: var(--ink); text-decoration: none; letter-spacing: -0.03em; }
  .nav-brand span { color: var(--sage); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--ink); }
  .nav-cta {
    background: var(--ink); color: var(--bg) !important; font-weight: 600 !important;
    padding: 8px 20px; border-radius: 20px; transition: opacity 0.2s !important;
  }
  .nav-cta:hover { opacity: 0.8 !important; color: var(--bg) !important; }

  /* ── Hero ── */
  .hero {
    padding: 140px 40px 80px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .hero-kicker {
    font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--sage);
    text-transform: uppercase; margin-bottom: 20px;
  }
  .hero-title {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(48px, 6vw, 80px);
    font-weight: 700; line-height: 1.05;
    letter-spacing: -0.03em; color: var(--ink);
    margin-bottom: 24px;
  }
  .hero-title em { color: var(--sage); font-style: italic; }
  .hero-desc {
    font-size: 17px; color: var(--mutedMed); line-height: 1.7;
    max-width: 480px; margin-bottom: 40px; font-weight: 400;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--ink); color: var(--bg); font-size: 15px; font-weight: 600;
    padding: 14px 32px; border-radius: 30px; text-decoration: none; transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.75; }
  .btn-secondary {
    color: var(--ink); font-size: 14px; font-weight: 500; text-decoration: none;
    border-bottom: 1px solid var(--divider); padding-bottom: 2px; transition: border-color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--sage); color: var(--sage); }

  /* ── Phone mockup ── */
  .hero-phone {
    display: flex; justify-content: center;
  }
  .phone-shell {
    width: 270px; height: 582px;
    background: var(--bg);
    border-radius: 40px;
    border: 2px solid var(--divider);
    box-shadow: 0 24px 80px rgba(26,24,23,0.12), 0 4px 16px rgba(26,24,23,0.06);
    overflow: hidden; position: relative;
    font-family: 'Inter', sans-serif;
  }
  .phone-notch {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 100px; height: 26px;
    background: var(--bg); border-radius: 0 0 14px 14px;
    border: 2px solid var(--divider); border-top: none; z-index: 10;
  }
  .phone-screen {
    width: 100%; height: 100%; padding: 36px 14px 12px;
    display: flex; flex-direction: column; gap: 0;
  }
  .phone-status { display: flex; justify-content: space-between; font-size: 9px; color: var(--muted); font-weight: 500; margin-bottom: 10px; }
  .phone-greeting { font-size: 9px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; font-weight: 700; margin-bottom: 3px; }
  .phone-name { font-size: 17px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
  .phone-divider { height: 1px; background: var(--divider); margin: 8px 0; }
  .phone-label { font-size: 8px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-bottom: 2px; }
  .phone-bignum {
    font-family: 'Lora', Georgia, serif;
    font-size: 72px; font-weight: 700; color: var(--ink); line-height: 1; margin-bottom: 0;
  }
  .phone-bignum span { font-size: 16px; color: var(--muted); font-weight: 300; font-family: Inter; vertical-align: middle; margin-left: 4px; }
  .phone-mood-label { font-size: 11px; color: var(--sage); font-weight: 600; margin-bottom: 8px; letter-spacing: 0.3px; }
  .phone-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; }
  .phone-tag {
    font-size: 9px; font-weight: 600; padding: 3px 8px; border-radius: 10px; letter-spacing: 0.3px;
  }
  .tag-sage { background: rgba(123,158,135,0.15); color: var(--sage); }
  .tag-coral { background: rgba(212,133,106,0.15); color: var(--coral); }
  .tag-amber { background: rgba(212,168,83,0.15); color: var(--amber); }
  .phone-week { display: flex; gap: 4px; align-items: flex-end; margin-bottom: 8px; }
  .week-day { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .week-day-label { font-size: 7px; color: var(--muted); font-weight: 600; }
  .week-dot { width: 20px; border-radius: 3px; }
  .week-dot.s8 { height: 28px; background: var(--sage); }
  .week-dot.s7 { height: 22px; background: var(--amber); }
  .week-dot.s6 { height: 18px; background: rgba(212,168,83,0.5); }
  .week-dot.s5 { height: 14px; background: rgba(212,133,106,0.6); }
  .week-dot.s0 { height: 8px; background: var(--divider); }
  .phone-streak { background: rgba(123,158,135,0.1); border-radius: 8px; padding: 6px 8px; font-size: 9px; color: var(--ink); font-weight: 500; margin-bottom: 8px; }
  .phone-cta { background: var(--ink); color: var(--bg); text-align: center; border-radius: 16px; padding: 8px; font-size: 10px; font-weight: 600; margin-top: auto; }
  .phone-nav { display: flex; justify-content: space-around; padding-top: 8px; border-top: 1px solid var(--divider); }
  .phone-nav-item { display: flex; flex-direction: column; align-items: center; gap: 1px; font-size: 8px; color: var(--muted); font-weight: 500; }
  .phone-nav-item.active { color: var(--sage); }
  .phone-nav-icon { font-size: 12px; }

  /* ── Stats row ── */
  .stats-bar {
    border-top: 1px solid var(--divider);
    border-bottom: 1px solid var(--divider);
    padding: 40px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px;
  }
  .stat { text-align: center; }
  .stat-num {
    font-family: 'Lora', Georgia, serif;
    font-size: 48px; font-weight: 700; color: var(--ink);
    line-height: 1; margin-bottom: 8px;
  }
  .stat-label { font-size: 12px; color: var(--muted); font-weight: 600; letter-spacing: 0.5px; }

  /* ── Features ── */
  .features {
    max-width: 1100px; margin: 0 auto; padding: 80px 40px;
  }
  .features-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--sage); text-transform: uppercase; margin-bottom: 16px; }
  .features-title {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(32px, 4vw, 52px); font-weight: 700; line-height: 1.1;
    max-width: 600px; margin-bottom: 60px; letter-spacing: -0.02em;
  }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--divider); border: 1px solid var(--divider); }
  .feature-card {
    background: var(--bg); padding: 36px 32px;
    transition: background 0.2s;
  }
  .feature-card:hover { background: var(--surface); }
  .feature-icon { font-size: 28px; margin-bottom: 16px; }
  .feature-title { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: var(--mutedMed); line-height: 1.65; }

  /* ── Screens showcase ── */
  .screens-section {
    background: var(--surface); padding: 80px 40px;
  }
  .screens-inner { max-width: 1100px; margin: 0 auto; }
  .screens-header { text-align: center; margin-bottom: 60px; }
  .screens-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--sage); text-transform: uppercase; margin-bottom: 12px; }
  .screens-title {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(30px, 4vw, 48px); font-weight: 700; color: var(--ink);
    letter-spacing: -0.02em;
  }
  .screens-row { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; scroll-snap-type: x mandatory; }
  .screen-pill {
    flex-shrink: 0; width: 200px; height: 434px;
    background: var(--bg); border-radius: 28px; border: 1px solid var(--divider);
    box-shadow: 0 8px 32px rgba(26,24,23,0.08);
    scroll-snap-align: start; overflow: hidden;
    padding: 24px 14px 14px; font-family: 'Inter', sans-serif;
    display: flex; flex-direction: column; gap: 0;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .screen-pill:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(26,24,23,0.12); }
  .sp-status { font-size: 7px; color: var(--muted); font-weight: 500; margin-bottom: 8px; display: flex; justify-content: space-between; }
  .sp-label { font-size: 7px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-bottom: 2px; }
  .sp-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
  .sp-divider { height: 1px; background: var(--divider); margin: 6px 0; }
  .sp-bignum { font-family: 'Lora', Georgia, serif; font-size: 52px; font-weight: 700; color: var(--ink); line-height: 1; }
  .sp-bignum small { font-size: 13px; color: var(--muted); font-family: Inter; font-weight: 300; }
  .sp-sub { font-size: 9px; color: var(--sage); font-weight: 600; margin-bottom: 6px; }
  .sp-tag-row { display: flex; gap: 4px; flex-wrap: wrap; }
  .sp-tag { font-size: 7px; font-weight: 600; padding: 2px 6px; border-radius: 8px; }
  .sp-bar { height: 5px; border-radius: 3px; margin: 3px 0; }
  .sp-entry { padding: 5px 0; border-bottom: 1px solid var(--divider); }
  .sp-entry-title { font-size: 9px; font-weight: 600; color: var(--ink); }
  .sp-entry-sub { font-size: 8px; color: var(--muted); }
  .sp-footer { margin-top: auto; }
  .sp-btn { background: var(--ink); color: var(--bg); text-align: center; border-radius: 12px; padding: 7px; font-size: 9px; font-weight: 600; }
  .sp-nav { display: flex; justify-content: space-around; padding-top: 6px; border-top: 1px solid var(--divider); font-size: 7px; color: var(--muted); }

  /* ── Philosophy ── */
  .philosophy {
    max-width: 1100px; margin: 0 auto; padding: 80px 40px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .phil-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--coral); text-transform: uppercase; margin-bottom: 16px; }
  .phil-title {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(28px, 3.5vw, 44px); font-weight: 700;
    line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 24px;
  }
  .phil-desc { font-size: 16px; color: var(--mutedMed); line-height: 1.75; margin-bottom: 24px; }
  .phil-pull {
    font-family: 'Lora', Georgia, serif;
    font-size: 22px; font-style: italic; color: var(--ink);
    border-left: 3px solid var(--sage); padding-left: 24px; line-height: 1.5;
  }
  .phil-visual {
    display: flex; flex-direction: column; gap: 12px;
  }
  .emotion-row {
    display: flex; align-items: center; gap: 12px;
  }
  .emotion-name { font-size: 13px; font-weight: 600; color: var(--ink); width: 90px; flex-shrink: 0; }
  .emotion-bar-track { flex: 1; height: 8px; background: var(--surface); border-radius: 4px; overflow: hidden; }
  .emotion-bar-fill { height: 100%; border-radius: 4px; }
  .emotion-pct { font-size: 12px; font-weight: 700; width: 36px; text-align: right; flex-shrink: 0; }

  /* ── CTA ── */
  .cta-section {
    background: var(--ink); padding: 100px 40px; text-align: center;
  }
  .cta-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: rgba(249,246,241,0.5); text-transform: uppercase; margin-bottom: 20px; }
  .cta-title {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(36px, 5vw, 64px); font-weight: 700; color: var(--bg);
    line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 24px;
  }
  .cta-title em { color: var(--sage); font-style: italic; }
  .cta-sub { font-size: 16px; color: rgba(249,246,241,0.55); margin-bottom: 48px; max-width: 480px; margin-left: auto; margin-right: auto; }
  .cta-actions { display: flex; gap: 16px; justify-content: center; align-items: center; flex-wrap: wrap; }
  .btn-cream {
    background: var(--bg); color: var(--ink); font-size: 15px; font-weight: 700;
    padding: 16px 40px; border-radius: 32px; text-decoration: none; transition: opacity 0.2s;
  }
  .btn-cream:hover { opacity: 0.85; }
  .btn-ghost {
    color: rgba(249,246,241,0.6); font-size: 14px; font-weight: 500; text-decoration: none;
    border-bottom: 1px solid rgba(249,246,241,0.25); padding-bottom: 2px; transition: all 0.2s;
  }
  .btn-ghost:hover { color: var(--bg); border-color: var(--bg); }

  /* ── Footer ── */
  footer {
    background: var(--bg); border-top: 1px solid var(--divider);
    padding: 40px; text-align: center;
  }
  .footer-brand { font-size: 16px; font-weight: 800; color: var(--ink); letter-spacing: -0.03em; margin-bottom: 8px; }
  .footer-brand span { color: var(--sage); }
  .footer-copy { font-size: 12px; color: var(--muted); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
    .hero-phone { display: none; }
    .stats-bar { grid-template-columns: repeat(2, 1fr); padding: 40px 24px; }
    .features-grid { grid-template-columns: 1fr; }
    .philosophy { grid-template-columns: 1fr; padding: 60px 24px; }
    nav { padding: 0 20px; }
    .nav-links { gap: 16px; }
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-brand">DEW<span>DROP</span></a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#philosophy">Philosophy</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">View Design</a>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div>
    <p class="hero-kicker">✦ Emotional Intelligence · Daily Practice</p>
    <h1 class="hero-title">Know how<br>you <em>really</em><br>feel today.</h1>
    <p class="hero-desc">Dewdrop is a daily mood journaling app built around one core belief: small, honest check-ins compound into deep self-understanding. No streaks to chase, no gamification — just your emotional truth, beautifully tracked.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open prototype</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive mock ☀◑</a>
    </div>
  </div>
  <div class="hero-phone">
    <div class="phone-shell">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●  ▮▮▮</span></div>
        <div class="phone-greeting">Good morning</div>
        <div class="phone-name">Rakis ✦</div>
        <div class="phone-divider"></div>
        <div class="phone-label">Today's mood</div>
        <div class="phone-bignum">7<span>/ 10</span></div>
        <div class="phone-mood-label">Feeling good today ✦</div>
        <div class="phone-tags">
          <span class="phone-tag tag-sage">Calm</span>
          <span class="phone-tag tag-coral">Focused</span>
          <span class="phone-tag tag-amber">Rested</span>
        </div>
        <div class="phone-divider"></div>
        <div class="phone-label">This week</div>
        <div class="phone-week">
          ${['M','T','W','T','F','S','S'].map((d, i) => {
            const cls = ['s6','s6','s8','s7','s0','s0','s0'][i];
            return `<div class="week-day"><div class="week-dot ${cls}"></div><div class="week-day-label">${d}</div></div>`;
          }).join('')}
        </div>
        <div class="phone-streak">🔥 3-day streak — keep going</div>
        <div class="phone-cta">Log today's mood</div>
        <div class="phone-nav">
          <div class="phone-nav-item active"><span class="phone-nav-icon">◎</span>Today</div>
          <div class="phone-nav-item"><span class="phone-nav-icon">+</span>Log</div>
          <div class="phone-nav-item"><span class="phone-nav-icon">≋</span>Patterns</div>
          <div class="phone-nav-item"><span class="phone-nav-icon">❧</span>Journal</div>
          <div class="phone-nav-item"><span class="phone-nav-icon">✦</span>Insights</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Stats -->
<div class="stats-bar">
  <div class="stat">
    <div class="stat-num">7.4</div>
    <div class="stat-label">Avg mood this week</div>
  </div>
  <div class="stat">
    <div class="stat-num">18</div>
    <div class="stat-label">Entries this month</div>
  </div>
  <div class="stat">
    <div class="stat-num">3×</div>
    <div class="stat-label">More self-aware</div>
  </div>
  <div class="stat">
    <div class="stat-num">5</div>
    <div class="stat-label">Screens, zero clutter</div>
  </div>
</div>

<!-- Features -->
<section class="features" id="features">
  <p class="features-eyebrow">✦ What makes it different</p>
  <h2 class="features-title">Mood tracking, done with editorial restraint</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">7</div>
      <div class="feature-title">Numbers as poetry</div>
      <div class="feature-desc">Your daily score lives large on screen — a single serif numeral that tells the whole story at a glance. No pie charts, no dashboards.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≋</div>
      <div class="feature-title">Pattern heatmap</div>
      <div class="feature-desc">A 4-week calendar dot-grid shows your emotional rhythm. Morning vs evening, weekday vs weekend — patterns emerge naturally.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-title">Weekly intelligence</div>
      <div class="feature-desc">Dewdrop surfaces what your data means: which activities lift your mood, when you're most drained, and what to try differently.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">❧</div>
      <div class="feature-title">Micro-journaling</div>
      <div class="feature-desc">A single sentence captures the day. The Journal view becomes a timeline of your inner life — searchable, scrollable, yours.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Context tagging</div>
      <div class="feature-desc">Log the context — work, exercise, rest — and Dewdrop reveals which environments help you thrive vs. which drain you silently.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">☀</div>
      <div class="feature-title">Calm aesthetics</div>
      <div class="feature-desc">Cream paper tones, sage green, and warm coral. A palette that feels like morning light — designed to reduce friction, not add it.</div>
    </div>
  </div>
</section>

<!-- Screens -->
<section class="screens-section" id="screens">
  <div class="screens-inner">
    <div class="screens-header">
      <p class="screens-eyebrow">✦ Design exploration</p>
      <h2 class="screens-title">Five screens. Zero noise.</h2>
    </div>
    <div class="screens-row">
      <!-- Today -->
      <div class="screen-pill">
        <div class="sp-status"><span>9:41</span><span>●●●</span></div>
        <div class="sp-label">Good morning</div>
        <div class="sp-title">Rakis</div>
        <div class="sp-divider"></div>
        <div class="sp-bignum">7 <small>/ 10</small></div>
        <div class="sp-sub">Feeling good today ✦</div>
        <div class="sp-tag-row">
          <span class="sp-tag" style="background:rgba(123,158,135,0.15);color:#7B9E87">Calm</span>
          <span class="sp-tag" style="background:rgba(212,133,106,0.15);color:#D4856A">Focused</span>
          <span class="sp-tag" style="background:rgba(212,168,83,0.15);color:#D4A853">Rested</span>
        </div>
        <div class="sp-divider"></div>
        <div class="sp-label">This week</div>
        <div style="display:flex;gap:3px;margin:4px 0 6px">
          ${[6,6,8,7,0,0,0].map(s => `<div style="width:16px;height:${Math.max(s*3,6)}px;background:${s>=8?'#7B9E87':s>=6?'#D4A853':'#D5D0C6'};border-radius:2px"></div>`).join('')}
        </div>
        <div style="background:rgba(123,158,135,0.1);border-radius:6px;padding:5px 6px;font-size:8px;color:#1A1817;font-weight:500">🔥 3-day streak</div>
        <div class="sp-footer" style="margin-top:10px">
          <div class="sp-btn">Log today's mood</div>
          <div class="sp-nav">
            <span style="color:#7B9E87;font-weight:600">◎ Today</span>
            <span>+ Log</span><span>≋ Pat</span><span>❧ J</span><span>✦ I</span>
          </div>
        </div>
      </div>

      <!-- Log -->
      <div class="screen-pill">
        <div class="sp-status"><span>9:41</span><span>●●●</span></div>
        <div class="sp-label">Log mood</div>
        <div class="sp-title">How are you feeling?</div>
        <div class="sp-divider"></div>
        <div class="sp-label">Intensity 1-10</div>
        <div style="display:flex;gap:2px;margin:4px 0">
          ${[1,2,3,4,5,6,7,8,9,10].map(n => `<div style="width:14px;height:28px;background:${n===7?'#1A1817':'rgba(26,24,23,0.06)'};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:${n===7?700:400};color:${n===7?'#F9F6F1':n<5?'#D4856A':n>7?'#7B9E87':'#1A1817'}">${n}</div>`).join('')}
        </div>
        <div class="sp-divider"></div>
        <div class="sp-label">Emotions</div>
        <div style="display:flex;flex-wrap:wrap;gap:3px;margin:4px 0">
          ${[
            {l:'Calm',c:'#7B9E87',bg:'rgba(123,158,135,0.15)',sel:true},
            {l:'Energized',c:'#D4A853',bg:'rgba(212,168,83,0.15)'},
            {l:'Focused',c:'#7B9E87',bg:'rgba(123,158,135,0.15)',sel:true},
            {l:'Tired',c:'#9B8FB5',bg:'rgba(155,143,181,0.15)'},
            {l:'Anxious',c:'#D4856A',bg:'rgba(212,133,106,0.15)'},
          ].map(t => `<span style="font-size:7px;font-weight:600;padding:2px 6px;border-radius:8px;background:${t.sel?t.c:t.bg};color:${t.sel?'#F9F6F1':t.c}">${t.l}</span>`).join('')}
        </div>
        <div class="sp-divider"></div>
        <div style="background:#EDE9E0;border-radius:6px;padding:5px;font-size:7px;color:#1A1817;line-height:1.4;margin-bottom:6px">Morning coffee + focus session. Calls felt manageable...</div>
        <div class="sp-footer" style="margin-top:auto">
          <div class="sp-btn" style="background:#7B9E87">Save this moment</div>
          <div class="sp-nav">
            <span>◎ T</span><span style="color:#7B9E87;font-weight:600">+ Log</span>
            <span>≋ P</span><span>❧ J</span><span>✦ I</span>
          </div>
        </div>
      </div>

      <!-- Patterns -->
      <div class="screen-pill">
        <div class="sp-status"><span>9:41</span><span>●●●</span></div>
        <div class="sp-label">Patterns</div>
        <div class="sp-title">Your rhythm</div>
        <div class="sp-divider"></div>
        <div style="font-family:Georgia;font-size:38px;font-weight:700;color:#1A1817;line-height:1">7.2</div>
        <div style="font-size:8px;color:#7B9E87;font-weight:600;margin-bottom:5px">↑ 0.8 from last month</div>
        <div class="sp-divider"></div>
        <div class="sp-label">Daily moods — March</div>
        <div style="display:flex;flex-wrap:wrap;gap:2px;margin:4px 0 5px">
          ${[6,7,5,8,7,0,0,4,5,6,7,8,9,8,7,6,8,7,0,0,0,8,9,7,0,0,0,0].map(s =>
            `<div style="width:8px;height:8px;border-radius:2px;background:${s===0?'#EDE9E0':s>=9?'#7B9E87':s>=7?'#D4A853':s>=5?'rgba(212,168,83,0.5)':'#D4856A'}"></div>`
          ).join('')}
        </div>
        <div class="sp-label">Top emotions</div>
        ${[
          {l:'Calm',pct:68,c:'#7B9E87'},{l:'Focused',pct:54,c:'#D4A853'},
          {l:'Tired',pct:42,c:'#9B8FB5'},{l:'Anxious',pct:28,c:'#D4856A'},
        ].map(e => `
          <div style="display:flex;align-items:center;gap:4px;margin:2px 0">
            <span style="font-size:7px;width:44px;color:#1A1817;font-weight:500">${e.l}</span>
            <div style="flex:1;height:4px;background:#EDE9E0;border-radius:2px">
              <div style="width:${e.pct}%;height:100%;background:${e.c};border-radius:2px"></div>
            </div>
            <span style="font-size:7px;font-weight:700;color:${e.c};width:22px;text-align:right">${e.pct}%</span>
          </div>`).join('')}
        <div class="sp-footer">
          <div class="sp-nav">
            <span>◎ T</span><span>+ L</span>
            <span style="color:#7B9E87;font-weight:600">≋ Pat</span>
            <span>❧ J</span><span>✦ I</span>
          </div>
        </div>
      </div>

      <!-- Journal -->
      <div class="screen-pill">
        <div class="sp-status"><span>9:41</span><span>●●●</span></div>
        <div class="sp-label">Journal</div>
        <div class="sp-title">Reflections</div>
        <div style="background:#EDE9E0;border-radius:10px;padding:4px 8px;font-size:7px;color:#8a8580;margin-bottom:6px">🔍 Search entries...</div>
        <div class="sp-divider"></div>
        ${[
          {d:'Today',t:'9:30 AM',s:7,m:'Calm · Focused',c:'#7B9E87',txt:'Morning coffee + focus session. Calls felt manageable.'},
          {d:'Yesterday',t:'9:15 PM',s:6,m:'Tired · Calm',c:'#D4A853',txt:'Sunset walk at 7pm was a lifesaver.'},
          {d:'Monday',t:'8:45 PM',s:8,m:'Energized · Joyful',c:'#7B9E87',txt:'Crushed my goals by noon. Flow state.'},
          {d:'Sunday',t:'7:00 PM',s:5,m:'Tired · Anxious',c:'#D4856A',txt:'Pre-week dread. Journaling helped name it.'},
        ].map(e => `
          <div class="sp-entry">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:8px;font-weight:700;color:#1A1817">${e.d}</span>
              <span style="font-size:8px;font-weight:700;color:${e.c};font-family:Georgia">${e.s}</span>
            </div>
            <div style="font-size:7px;color:${e.c};font-weight:600;margin:1px 0">${e.m}</div>
            <div style="font-size:7px;color:rgba(26,24,23,0.55);line-height:1.4">${e.txt}</div>
          </div>`).join('')}
        <div class="sp-footer">
          <div class="sp-nav">
            <span>◎ T</span><span>+ L</span><span>≋ P</span>
            <span style="color:#7B9E87;font-weight:600">❧ J</span><span>✦ I</span>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="screen-pill">
        <div class="sp-status"><span>9:41</span><span>●●●</span></div>
        <div class="sp-label">Insights</div>
        <div class="sp-title">Weekly wrap</div>
        <div style="background:rgba(123,158,135,0.12);border-radius:8px;padding:5px 6px;font-size:7px;color:#1A1817;line-height:1.4;margin-bottom:5px">
          <span style="color:#7B9E87;font-weight:700">✦ DEWDROP —</span> Best week in a month. Morning routines drove higher scores — 7.8 avg before noon.
        </div>
        <div class="sp-divider"></div>
        <div style="font-family:Georgia;font-size:38px;font-weight:700;color:#1A1817;line-height:1">7.4</div>
        <div style="font-size:8px;color:#7B9E87;font-weight:600;margin-bottom:4px">↑ from 6.8 last week</div>
        <div class="sp-divider"></div>
        ${[
          {icon:'⭐',title:'Peak day',detail:'Monday · 9/10',c:'#7B9E87'},
          {icon:'↓',title:'Low point',detail:'Thursday · 5/10',c:'#D4856A'},
          {icon:'🚶',title:'Pattern',detail:'+1.4 on walk days',c:'#D4A853'},
        ].map(m => `
          <div style="display:flex;gap:5px;padding:3px 0;border-bottom:1px solid #D5D0C6">
            <span style="font-size:10px">${m.icon}</span>
            <div>
              <div style="font-size:8px;font-weight:700;color:#1A1817">${m.title}</div>
              <div style="font-size:7px;color:${m.c};font-weight:600">${m.detail}</div>
            </div>
          </div>`).join('')}
        <div class="sp-footer" style="margin-top:8px">
          <div class="sp-btn">Share week recap</div>
          <div class="sp-nav">
            <span>◎ T</span><span>+ L</span><span>≋ P</span><span>❧ J</span>
            <span style="color:#7B9E87;font-weight:600">✦ I</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Philosophy -->
<section class="philosophy" id="philosophy">
  <div>
    <p class="phil-eyebrow">✦ Design philosophy</p>
    <h2 class="phil-title">The number is the design</h2>
    <p class="phil-desc">Inspired by Swiss editorial magazines and the "type as UI" movement, Dewdrop removes every chrome element that doesn't earn its place. No cards. No shadows. Just a large serif number, a thin rule, and space to breathe.</p>
    <p class="phil-pull">"Your emotional state deserves more than a smiley face slider."</p>
  </div>
  <div class="phil-visual">
    <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase;margin-bottom:12px">Top emotions this month</p>
    ${[
      {name:'Calm',pct:68,color:'#7B9E87'},{name:'Focused',pct:54,color:'#D4A853'},
      {name:'Tired',pct:42,color:'#9B8FB5'},{name:'Grateful',pct:38,color:'#D4856A'},
      {name:'Anxious',pct:28,color:'#D4856A'},{name:'Joyful',pct:22,color:'#7B9E87'},
    ].map(e => `
      <div class="emotion-row">
        <span class="emotion-name">${e.name}</span>
        <div class="emotion-bar-track">
          <div class="emotion-bar-fill" style="width:${e.pct}%;background:${e.color}"></div>
        </div>
        <span class="emotion-pct" style="color:${e.color}">${e.pct}%</span>
      </div>
    `).join('')}
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <p class="cta-eyebrow">✦ Try the prototype</p>
  <h2 class="cta-title">Know how you<br><em>really</em> feel.</h2>
  <p class="cta-sub">Explore the full Dewdrop design — five screens, editorial light palette, built to feel like a calm morning ritual.</p>
  <div class="cta-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-cream">Open Pencil viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">Interactive mock →</a>
  </div>
</section>

<footer>
  <div class="footer-brand">DEW<span>DROP</span></div>
  <p class="footer-copy">RAM Design Heartbeat · March 2026 · Inspired by land-book.com & lapa.ninja</p>
</footer>

</body>
</html>`;
}

async function main() {
  console.log('Publishing DEWDROP...');

  // 1. Hero page
  const heroHtml = buildHeroHtml();
  const heroRes = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, `→ https://ram.zenbin.org/${SLUG}`);

  // 2. Viewer page
  const penJson = fs.readFileSync(path.join(__dirname, 'dewdrop.pen'), 'utf8');

  // Read pencil viewer template
  let viewerHtml;
  const viewerTemplatePaths = [
    '/workspace/group/design-studio/viewer-template.html',
    '/workspace/group/core/viewer.html',
  ];
  for (const p of viewerTemplatePaths) {
    if (fs.existsSync(p)) { viewerHtml = fs.readFileSync(p, 'utf8'); break; }
  }
  if (!viewerHtml) {
    // Minimal inline viewer
    viewerHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Prototype Viewer</title>
<script>window.EMBEDDED_PEN_PLACEHOLDER = true;</script>
<style>
  body{margin:0;background:#F9F6F1;font-family:Inter,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px}
  h1{font-size:22px;font-weight:800;margin-bottom:8px;letter-spacing:-0.03em}
  p{font-size:14px;color:rgba(26,24,23,0.55);margin-bottom:24px}
  a{background:#1A1817;color:#F9F6F1;padding:12px 28px;border-radius:24px;text-decoration:none;font-size:14px;font-weight:600}
</style>
</head>
<body>
<h1>DEWDROP</h1>
<p>daily mood & micro-journal — Pencil viewer</p>
<a href="https://ram.zenbin.org/${SLUG}">View hero page</a>
<script>
</script>
</body></html>`;
  }

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  // Inject before first <script> tag, or append to head
  if (viewerHtml.includes('<script>')) {
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } else {
    viewerHtml = viewerHtml.replace('</head>', injection + '\n</head>');
  }

  const viewerRes = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log('Viewer:', viewerRes.status, `→ https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
