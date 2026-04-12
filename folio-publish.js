#!/usr/bin/env node
'use strict';
// folio-publish.js — Hero page + viewer for FOLIO

const fs    = require('fs');
const https = require('https');

const SLUG     = 'folio-editorial';
const APP_NAME = 'FOLIO';
const TAGLINE  = 'Content intelligence for editorial teams';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
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
  <title>FOLIO — Content intelligence for editorial teams</title>
  <meta name="description" content="FOLIO brings an archival editorial sensibility to content analytics. REF-numbered articles, readability grades, audience depth, and AI-powered editorial signals.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #F6F3EE; --surface: #FFFFFF; --surface2: #F0EDE6;
      --text: #1C1510; --muted: rgba(28,21,16,0.45);
      --accent: #B85C38; --accent2: #3D6B8E;
      --accent-soft: rgba(184,92,56,0.10);
      --border: rgba(28,21,16,0.08); --border-strong: rgba(28,21,16,0.16);
      --good: #3A7D5C; --warn: #B07A2C; --danger: #A53030;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', system-ui, sans-serif;
      line-height: 1.6; min-height: 100vh; overflow-x: hidden;
    }
    a { color: var(--accent); text-decoration: none; }

    /* ── Nav ── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(246,243,238,0.92); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px; height: 58px;
    }
    .nav-brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px; font-weight: 700; letter-spacing: 0.12em;
      color: var(--accent);
    }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { font-size: 13px; color: var(--muted); letter-spacing: 0.04em; transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      background: var(--accent); color: #fff;
      padding: 8px 22px; border-radius: 6px;
      font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
      transition: background .2s;
    }
    .nav-cta:hover { background: #9d4a28; }

    /* ── Hero ── */
    .hero {
      padding: 148px 48px 100px;
      max-width: 1100px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
    }
    .hero-issue {
      font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
      color: var(--accent); margin-bottom: 18px; text-transform: uppercase;
    }
    .hero-issue span { color: var(--muted); }
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(42px, 5vw, 64px); font-weight: 400; line-height: 1.12;
      letter-spacing: -0.02em; color: var(--text); margin-bottom: 24px;
    }
    h1 em { font-style: italic; color: var(--accent); }
    .hero-sub {
      font-size: 17px; color: var(--muted); line-height: 1.7;
      max-width: 460px; margin-bottom: 40px;
    }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .btn-primary {
      background: var(--accent); color: #fff;
      padding: 13px 30px; border-radius: 8px;
      font-size: 14px; font-weight: 600; letter-spacing: 0.03em;
      transition: background .2s, transform .15s;
    }
    .btn-primary:hover { background: #9d4a28; transform: translateY(-1px); }
    .btn-outline {
      border: 1px solid var(--border-strong); color: var(--text);
      padding: 13px 30px; border-radius: 8px;
      font-size: 14px; font-weight: 500; letter-spacing: 0.03em;
      transition: border-color .2s, background .2s;
    }
    .btn-outline:hover { background: var(--surface); }

    /* Hero phone mock */
    .hero-device {
      position: relative; display: flex; justify-content: center;
    }
    .phone-shell {
      width: 280px; background: var(--text);
      border-radius: 38px; padding: 12px;
      box-shadow: 0 40px 100px rgba(28,21,16,0.18), 0 8px 24px rgba(28,21,16,0.10);
    }
    .phone-screen {
      background: var(--bg); border-radius: 28px; overflow: hidden;
      padding: 22px 16px 16px;
    }
    .phone-issue-line {
      font-size: 8px; font-weight: 600; letter-spacing: 0.18em;
      color: var(--muted); text-transform: uppercase; margin-bottom: 4px;
    }
    .phone-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px; font-weight: 700; color: var(--accent);
      letter-spacing: 0.14em; margin-bottom: 12px;
    }
    .phone-score-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
    .phone-score {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 52px; font-weight: 400; color: var(--text); line-height: 1;
    }
    .phone-score-label { font-size: 10px; color: var(--muted); font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
    .phone-divider { height: 1px; background: var(--border); margin: 10px 0; }
    .phone-metric-row { display: flex; gap: 8px; margin-bottom: 12px; }
    .phone-metric {
      flex: 1; background: var(--surface); border-radius: 6px;
      padding: 8px; box-shadow: 0 1px 3px rgba(28,21,16,0.06);
    }
    .phone-metric-label { font-size: 7px; font-weight: 600; letter-spacing: 0.14em; color: var(--muted); text-transform: uppercase; margin-bottom: 4px; }
    .phone-metric-value { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: var(--text); }
    .phone-metric-sub { font-size: 8px; color: var(--warn); margin-top: 1px; }
    .phone-section-label { font-size: 7px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
    .phone-article {
      background: var(--surface); border-radius: 5px; padding: 8px 10px;
      margin-bottom: 6px; box-shadow: 0 1px 2px rgba(28,21,16,0.05);
      display: flex; align-items: center; justify-content: space-between;
    }
    .phone-article-ref { font-size: 7px; font-weight: 700; color: var(--accent); letter-spacing: 1px; margin-bottom: 2px; }
    .phone-article-title { font-family: 'Playfair Display', Georgia, serif; font-size: 11px; color: var(--text); }
    .phone-article-score { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: var(--good); }
    .phone-signal {
      background: var(--accent-soft); border: 1px solid rgba(184,92,56,0.25);
      border-radius: 6px; padding: 8px 10px;
    }
    .phone-signal-text { font-size: 11px; color: var(--accent); font-weight: 500; }
    .phone-nav {
      display: flex; justify-content: space-around; align-items: center;
      background: var(--surface); border-radius: 14px; padding: 8px 0 4px;
      margin-top: 10px; border-top: 1px solid var(--border);
    }
    .phone-nav-item { text-align: center; font-size: 8px; color: var(--muted); }
    .phone-nav-item.active { color: var(--accent); font-weight: 600; }
    .phone-nav-icon { font-size: 14px; display: block; margin-bottom: 1px; }

    /* ── Stats bar ── */
    .stats-bar {
      background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
      padding: 28px 48px;
    }
    .stats-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; gap: 0; justify-content: space-around; align-items: center;
    }
    .stat-item { text-align: center; flex: 1; }
    .stat-item + .stat-item { border-left: 1px solid var(--border); }
    .stat-num {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 36px; font-weight: 400; color: var(--text); line-height: 1;
    }
    .stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--muted); text-transform: uppercase; margin-top: 4px; }

    /* ── Features ── */
    .features-section {
      max-width: 1100px; margin: 100px auto; padding: 0 48px;
    }
    .section-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.22em; color: var(--accent); text-transform: uppercase; margin-bottom: 14px; }
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 38px; font-weight: 400; line-height: 1.2;
      letter-spacing: -0.01em; color: var(--text); margin-bottom: 56px;
    }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .feature-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 12px; padding: 28px;
      transition: box-shadow .2s, transform .2s;
    }
    .feature-card:hover { box-shadow: 0 8px 32px rgba(28,21,16,0.08); transform: translateY(-2px); }
    .feature-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: var(--accent-soft);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 16px;
    }
    .feature-name { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.65; }
    .feature-ref { display: inline-block; font-size: 9px; font-weight: 700; letter-spacing: 0.12em; color: var(--accent); margin-top: 14px; }

    /* ── Catalog section ── */
    .catalog-section { background: var(--surface2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 48px; }
    .catalog-inner { max-width: 1100px; margin: 0 auto; }
    .catalog-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
    .catalog-col-labels {
      display: grid; grid-template-columns: 80px 1fr 80px 80px;
      gap: 12px; padding: 0 24px;
      font-size: 9px; font-weight: 700; letter-spacing: 0.18em; color: var(--muted); text-transform: uppercase;
      margin-bottom: 10px;
    }
    .catalog-row {
      display: grid; grid-template-columns: 80px 1fr 80px 80px;
      gap: 12px; align-items: center;
      background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      padding: 14px 24px; margin-bottom: 8px;
      transition: box-shadow .15s;
    }
    .catalog-row:hover { box-shadow: 0 4px 16px rgba(28,21,16,0.06); }
    .catalog-ref { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); }
    .catalog-title { font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: var(--text); }
    .catalog-reads { font-size: 12px; color: var(--muted); text-align: right; }
    .catalog-score { text-align: center; }
    .catalog-score-badge {
      display: inline-block;
      font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 400;
      width: 36px; height: 30px; line-height: 30px; border-radius: 6px; text-align: center;
    }
    .score-good  { background: rgba(58,125,92,0.10);  color: #3A7D5C; }
    .score-warn  { background: rgba(176,122,44,0.10); color: #B07A2C; }
    .score-bad   { background: rgba(165,48,48,0.10);  color: #A53030; }

    /* ── CTA section ── */
    .cta-section { max-width: 1100px; margin: 100px auto; padding: 0 48px; text-align: center; }
    .cta-box {
      background: var(--text); border-radius: 20px; padding: 80px 48px;
      position: relative; overflow: hidden;
    }
    .cta-box::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(184,92,56,0.25), transparent);
    }
    .cta-issue { position: relative; font-size: 10px; font-weight: 700; letter-spacing: 0.22em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; }
    .cta-title {
      position: relative;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 46px; font-weight: 400; color: #FAF7F2; line-height: 1.12;
      letter-spacing: -0.02em; margin-bottom: 20px;
    }
    .cta-sub { position: relative; font-size: 16px; color: rgba(250,247,242,0.55); margin-bottom: 40px; }
    .cta-btn {
      position: relative;
      display: inline-block; background: var(--accent); color: #fff;
      padding: 14px 36px; border-radius: 8px;
      font-size: 15px; font-weight: 600; letter-spacing: 0.03em;
      transition: background .2s;
    }
    .cta-btn:hover { background: #9d4a28; }

    /* ── Footer ── */
    footer {
      border-top: 1px solid var(--border);
      padding: 40px 48px; text-align: center;
      font-size: 12px; color: var(--muted);
    }
    .footer-brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px; font-weight: 700; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 12px;
    }
    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; gap: 48px; padding: 120px 24px 64px; }
      .hero-device { display: none; }
      .features-grid { grid-template-columns: 1fr; }
      .stats-inner { flex-wrap: wrap; gap: 24px; }
      .catalog-section { padding: 48px 24px; }
      .catalog-col-labels, .catalog-row { grid-template-columns: 70px 1fr 60px; }
      .catalog-reads { display: none; }
      nav { padding: 0 24px; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-brand">FOLIO</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#catalog">Catalog</a>
    <a href="#signals">Signals</a>
  </div>
  <a class="nav-cta" href="/folio-editorial-viewer">View Design →</a>
</nav>

<section class="hero">
  <div class="hero-copy">
    <div class="hero-issue">Issue No. 47  <span>·  Week of April 7, 2026</span></div>
    <h1>Content intelligence that reads <em>like you do</em></h1>
    <p class="hero-sub">
      FOLIO brings an archival editorial sensibility to content analytics. Every article gets a reference number, a readability grade, and an honest verdict. No dashboards. Just clarity.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="/folio-editorial-viewer">Explore Design</a>
      <a class="btn-outline" href="/folio-editorial-mock">Interactive Mock ☀◑</a>
    </div>
  </div>

  <!-- Phone mockup -->
  <div class="hero-device">
    <div class="phone-shell">
      <div class="phone-screen">
        <div class="phone-issue-line">Issue No. 47  ·  April 2026</div>
        <div class="phone-title">FOLIO</div>
        <div class="phone-score-row">
          <div class="phone-score">94</div>
          <div>
            <div class="phone-score-label">Health Score</div>
            <div style="font-size:10px;color:#3A7D5C;margin-top:2px;">+3 pts this week</div>
          </div>
        </div>
        <div class="phone-divider"></div>
        <div class="phone-metric-row">
          <div class="phone-metric">
            <div class="phone-metric-label">Avg Read</div>
            <div class="phone-metric-value">4:23</div>
            <div class="phone-metric-sub">−0:18</div>
          </div>
          <div class="phone-metric">
            <div class="phone-metric-label">Full Reads</div>
            <div class="phone-metric-value">38%</div>
            <div class="phone-metric-sub" style="color:#3A7D5C">+5%</div>
          </div>
          <div class="phone-metric">
            <div class="phone-metric-label">Signals</div>
            <div class="phone-metric-value" style="color:#B85C38">7</div>
            <div class="phone-metric-sub" style="color:#B85C38">flagged</div>
          </div>
        </div>
        <div class="phone-section-label">Top Performing — This Week</div>
        <div class="phone-article">
          <div>
            <div class="phone-article-ref">REF–0041</div>
            <div class="phone-article-title">The quiet revolution in ambient…</div>
          </div>
          <div class="phone-article-score">97</div>
        </div>
        <div class="phone-article">
          <div>
            <div class="phone-article-ref" style="color:#3D6B8E">REF–0038</div>
            <div class="phone-article-title">Five design systems worth studying…</div>
          </div>
          <div class="phone-article-score" style="color:#3A7D5C">91</div>
        </div>
        <div class="phone-signal">
          <div class="phone-signal-text">◆  7 articles need attention</div>
        </div>
        <div class="phone-nav">
          <div class="phone-nav-item active"><span class="phone-nav-icon">◉</span>Pulse</div>
          <div class="phone-nav-item"><span class="phone-nav-icon">▤</span>Articles</div>
          <div class="phone-nav-item"><span class="phone-nav-icon">◈</span>Clarity</div>
          <div class="phone-nav-item"><span class="phone-nav-icon">◎</span>Audience</div>
          <div class="phone-nav-item"><span class="phone-nav-icon">⚑</span>Signals</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="stats-bar">
  <div class="stats-inner">
    <div class="stat-item"><div class="stat-num">148</div><div class="stat-label">Articles catalogued</div></div>
    <div class="stat-item"><div class="stat-num">47K</div><div class="stat-label">Unique readers</div></div>
    <div class="stat-item"><div class="stat-num">38%</div><div class="stat-label">Full-read rate</div></div>
    <div class="stat-item"><div class="stat-num">94</div><div class="stat-label">Avg health score</div></div>
    <div class="stat-item"><div class="stat-num">A−</div><div class="stat-label">Editorial grade</div></div>
  </div>
</div>

<section class="features-section" id="features">
  <div class="section-eyebrow">What FOLIO does</div>
  <h2 class="section-title">Every article, given a reference<br>and a real verdict</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-name">Pulse</div>
      <p class="feature-desc">Your weekly editorial health overview. See issue-level metrics, top performers, and open signals at a glance — catalogued by issue number, not just date.</p>
      <span class="feature-ref">ISSUE HEALTH</span>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▤</div>
      <div class="feature-name">Article Catalog</div>
      <p class="feature-desc">Every article gets a REF number. Browse, filter, and sort your entire back-catalog. Scores, authors, and engagement depth all visible in one editorial grid.</p>
      <span class="feature-ref">CATALOG BROWSER</span>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-name">Clarity Analysis</div>
      <p class="feature-desc">Deep readability breakdown per article. Section-by-section pacing chart, passive voice rate, vocabulary richness — and an honest editorial grade from A to F.</p>
      <span class="feature-ref">EDITORIAL GRADE</span>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-name">Audience</div>
      <p class="feature-desc">Know who actually reads you. Engagement depth (full vs skim), reader segments by profession, and 30/90-day growth with clean comparative timelines.</p>
      <span class="feature-ref">READER INTELLIGENCE</span>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚑</div>
      <div class="feature-name">Signals</div>
      <p class="feature-desc">AI-detected editorial issues, prioritised by urgency. Missing meta, grade-too-high, drop-off detected, stale stats — each with a one-click fix action.</p>
      <span class="feature-ref">AI EDITORIAL QUEUE</span>
    </div>
    <div class="feature-card" style="background:var(--surface2);border-style:dashed;">
      <div class="feature-icon" style="background:rgba(28,21,16,0.06);">+</div>
      <div class="feature-name" style="color:var(--muted);">Coming Next</div>
      <p class="feature-desc" style="color:var(--muted);">Team collaboration, Substack and Ghost import, custom readability rubrics, and publication-level comparison across writers.</p>
      <span class="feature-ref" style="color:var(--muted);">ROADMAP</span>
    </div>
  </div>
</section>

<section class="catalog-section" id="catalog">
  <div class="catalog-inner">
    <div class="section-eyebrow">Article Catalog</div>
    <h2 class="section-title" style="margin-bottom:28px;">The reference system<br>your archive deserves</h2>
    <div class="catalog-col-labels">
      <span>REF</span><span>Title</span><span style="text-align:right">Reads</span><span style="text-align:center">Score</span>
    </div>
    ${[
      { ref: '0041', title: 'The quiet revolution in ambient computing', reads: '12.4K', score: 97, cls: 'good' },
      { ref: '0040', title: 'Notes from the edge of machine perception', reads: '8.1K', score: 93, cls: 'good' },
      { ref: '0039', title: 'Against the tyranny of perfectly readable prose', reads: '6.3K', score: 88, cls: 'good' },
      { ref: '0038', title: 'Five design systems worth studying in 2026', reads: '9.8K', score: 91, cls: 'good' },
      { ref: '0037', title: 'How newsletters learned to compete with search', reads: '4.2K', score: 76, cls: 'warn' },
      { ref: '0036', title: 'Building in public: a one-year retrospective', reads: '5.7K', score: 82, cls: 'warn' },
      { ref: '0035', title: 'What happens when AI writes the brief?', reads: '7.2K', score: 84, cls: 'warn' },
      { ref: '0034', title: 'Spatial computing for the rest of us', reads: '2.1K', score: 61, cls: 'bad' },
    ].map(a => `
    <div class="catalog-row">
      <div class="catalog-ref">REF–${a.ref}</div>
      <div class="catalog-title">${a.title}</div>
      <div class="catalog-reads">${a.reads}</div>
      <div class="catalog-score"><span class="catalog-score-badge score-${a.cls}">${a.score}</span></div>
    </div>`).join('')}
  </div>
</section>

<section class="cta-section">
  <div class="cta-box">
    <div class="cta-issue">FOLIO — Issue No. 47</div>
    <h2 class="cta-title">Your content deserves<br>an honest editor</h2>
    <p class="cta-sub">See every article in its proper context. Know what works, what needs work, and why.</p>
    <a class="cta-btn" href="/folio-editorial-viewer">Explore the Design →</a>
  </div>
</section>

<footer>
  <div class="footer-brand">FOLIO</div>
  <p>Designed by RAM — Design Heartbeat · April 7, 2026</p>
  <p style="margin-top:6px;">Inspired by Stripe Sessions 2026 editorial aesthetic &amp; Silencio catalog reference system</p>
</footer>

</body>
</html>`;

// ─── VIEWER HTML ─────────────────────────────────────────────────────────────
const penJson   = fs.readFileSync('/workspace/group/design-studio/folio.pen', 'utf8');
let viewerHtml  = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml      = viewerHtml.replace('<script>', injection + '\n<script>');

async function publish(slug, html, title) {
  const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
  const res = await post('zenbin.org', '/api/publish', {
    'X-Subdomain': SUBDOMAIN,
    'X-API-Key':   config.ZENBIN_API_KEY || config.API_KEY || '',
  }, { slug, html, title });
  const j = JSON.parse(res.body);
  return j.url || `https://${SUBDOMAIN}.zenbin.org/${slug}`;
}

(async () => {
  console.log('Publishing hero page…');
  const heroUrl = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroUrl);

  console.log('Publishing viewer…');
  const viewerUrl = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Interactive Viewer`);
  console.log('Viewer:', viewerUrl);

  console.log('Done!');
})();
