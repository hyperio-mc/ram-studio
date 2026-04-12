#!/usr/bin/env node
// canon-publish.js — hero page + viewer for CANON
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'canon';
const APP_NAME  = 'CANON';
const TAGLINE   = 'Build your literary canon.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

// Viewer
const penJson   = fs.readFileSync(path.join(__dirname, 'canon.pen'), 'utf8');
let viewerHtml  = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml      = viewerHtml.replace('<script>', injection + '\n<script>');

// Hero page
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>CANON — ${TAGLINE}</title>
  <meta name="description" content="CANON is a light editorial reading tracker app. Track your library, capture highlights, and build your personal literary canon — designed with warm cream paper tones and typographic clarity.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #F5F0E8;
      --s1:      #FEFCF8;
      --s2:      #EDE8DF;
      --s3:      #E8E0D4;
      --ink:     #1C1814;
      --muted:   rgba(28,24,20,0.42);
      --rust:    #C2613A;
      --sage:    #5E8870;
      --warm:    #F8EFE4;
      --border:  rgba(28,24,20,0.09);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg); color: var(--ink);
      font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden;
    }

    nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(245,240,232,0.94);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
    }
    .nav-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      height: 64px;
    }
    .wordmark {
      font-family: 'EB Garamond', serif;
      font-size: 22px; font-weight: 600; letter-spacing: 4px;
      color: var(--ink); text-decoration: none;
    }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a {
      color: var(--muted); text-decoration: none;
      font-size: 12px; letter-spacing: 1.5px; font-weight: 500;
      text-transform: uppercase; transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--rust); }
    .nav-cta {
      background: var(--rust); border: none;
      color: #FFF; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; padding: 10px 24px;
      border-radius: 100px; cursor: pointer; transition: opacity 0.2s;
    }
    .nav-cta:hover { opacity: 0.85; }

    .rule { width: 100%; height: 1px; background: var(--border); }

    .hero {
      position: relative; overflow: hidden;
      min-height: 90vh; display: flex; flex-direction: column;
      justify-content: center; padding: 80px 24px 60px;
    }
    .hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; }
    .hero-eyebrow {
      font-size: 10px; font-weight: 700; letter-spacing: 4px;
      color: var(--rust); text-transform: uppercase; margin-bottom: 32px;
    }
    .hero-headline {
      font-family: 'EB Garamond', serif;
      font-size: clamp(52px, 8.5vw, 108px);
      font-weight: 600; line-height: 1.0;
      color: var(--ink); margin-bottom: 28px;
    }
    .hero-headline em { font-style: italic; color: var(--rust); }
    .hero-sub {
      font-size: 18px; font-weight: 300; color: var(--muted);
      max-width: 540px; line-height: 1.75; margin-bottom: 48px;
    }
    .hero-cta-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .btn-primary {
      background: var(--rust); color: #FFF;
      font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; padding: 16px 36px; border-radius: 100px;
      text-decoration: none; border: none; cursor: pointer; transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.85; }
    .btn-ghost {
      background: transparent; color: var(--ink);
      font-size: 12px; font-weight: 600; letter-spacing: 1px;
      text-transform: uppercase; padding: 16px 36px; border-radius: 100px;
      text-decoration: none; border: 1.5px solid var(--border); cursor: pointer;
      transition: border-color 0.2s;
    }
    .btn-ghost:hover { border-color: var(--rust); color: var(--rust); }

    /* Decorative book spines */
    .hero-spines {
      position: absolute; right: 6%; top: 50%;
      transform: translateY(-50%);
      display: flex; gap: 6px; align-items: flex-end;
      height: 320px;
    }
    @media (max-width: 900px) { .hero-spines { display: none; } }
    .spine {
      border-radius: 4px;
      box-shadow: 2px 2px 12px rgba(28,24,20,0.12);
    }

    /* Phone mockup */
    .hero-phone {
      position: absolute; right: 7%; top: 50%;
      transform: translateY(-50%); width: 260px; opacity: 0.95;
    }
    @media (max-width: 900px) { .hero-phone { display: none; } }
    .phone-frame {
      background: var(--s1); border-radius: 36px;
      border: 1.5px solid var(--border);
      padding: 16px 8px;
      box-shadow: 0 32px 80px rgba(28,24,20,0.14), 0 0 0 1px rgba(194,97,58,0.08);
    }
    .phone-screen {
      background: var(--bg); border-radius: 28px; overflow: hidden;
      aspect-ratio: 9/19.4;
      display: flex; flex-direction: column; padding: 18px 14px 10px;
    }
    .ps-wordmark { font-family: 'EB Garamond', serif; font-size: 10px; font-weight: 600; letter-spacing: 3px; color: var(--ink); margin-bottom: 6px; }
    .ps-hr { width: 100%; height: 0.5px; background: var(--rust); opacity: 0.4; margin-bottom: 8px; }
    .ps-label { font-size: 5px; font-weight: 700; letter-spacing: 2.5px; color: var(--muted); margin-bottom: 4px; text-transform: uppercase; }
    .ps-book-title { font-family: 'EB Garamond', serif; font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.2; margin-bottom: 3px; }
    .ps-author { font-size: 6px; color: var(--muted); margin-bottom: 8px; }
    .ps-bar-track { background: var(--s2); border-radius: 2px; height: 3px; margin-bottom: 2px; }
    .ps-bar-fill { background: var(--rust); border-radius: 2px; height: 3px; }
    .ps-pct { font-size: 6px; color: var(--rust); font-weight: 700; margin-bottom: 8px; }
    .ps-quote { background: var(--warm); border-radius: 4px; padding: 5px 6px; border-left: 2px solid var(--rust); margin-bottom: 8px; }
    .ps-quote-text { font-family: 'EB Garamond', serif; font-size: 6px; color: var(--ink); line-height: 1.4; font-style: italic; }
    .ps-nav { display: flex; justify-content: space-around; margin-top: auto; padding-top: 8px; border-top: 0.5px solid var(--border); }
    .ps-nav-item { font-size: 5px; color: var(--muted); text-align: center; }
    .ps-nav-item.active { color: var(--rust); font-weight: 700; }
    .ps-streak-row { display: flex; gap: 3px; margin-bottom: 6px; }
    .ps-streak-day { width: 14px; height: 18px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 4.5px; font-weight: 700; }

    /* Palette */
    .palette-strip { display: flex; height: 4px; border-radius: 2px; overflow: hidden; margin-top: 32px; max-width: 280px; }
    .pal { flex: 1; }

    /* Stats */
    .stats-section { padding: 80px 24px; border-top: 1px solid var(--border); }
    .stats-inner { max-width: 1200px; margin: 0 auto; }
    .stats-label { font-size: 9px; font-weight: 700; letter-spacing: 4px; color: var(--rust); margin-bottom: 48px; text-transform: uppercase; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
    @media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    .stat-card { background: var(--s1); padding: 40px 32px; border: 1px solid var(--border); }
    .stat-value { font-family: 'EB Garamond', serif; font-size: 48px; font-weight: 600; color: var(--ink); line-height: 1; margin-bottom: 12px; }
    .stat-value span { color: var(--rust); }
    .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; }

    /* Features */
    .features-section { padding: 80px 24px; }
    .features-inner { max-width: 1200px; margin: 0 auto; }
    .section-eyebrow { font-size: 9px; font-weight: 700; letter-spacing: 4px; color: var(--rust); margin-bottom: 48px; text-transform: uppercase; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
    @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }
    .feature-card { background: var(--s1); padding: 48px 40px; }
    .feature-icon { font-size: 24px; margin-bottom: 24px; display: block; }
    .feature-title {
      font-family: 'EB Garamond', serif;
      font-size: 22px; font-weight: 600; color: var(--ink);
      margin-bottom: 16px; line-height: 1.3;
    }
    .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.75; }

    /* Screens */
    .screens-section { padding: 80px 24px; border-top: 1px solid var(--border); }
    .screens-inner { max-width: 1200px; margin: 0 auto; }
    .screens-scroll { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; margin-top: 48px; }
    .screens-scroll::-webkit-scrollbar { height: 2px; }
    .screens-scroll::-webkit-scrollbar-thumb { background: var(--rust); opacity: 0.4; }
    .screen-card {
      flex: 0 0 210px; background: var(--s1);
      border-radius: 20px; overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 16px 40px rgba(28,24,20,0.08);
    }
    .screen-label { padding: 16px 20px 12px; font-size: 9px; font-weight: 700; letter-spacing: 2px; color: var(--rust); text-transform: uppercase; border-bottom: 1px solid var(--border); }
    .screen-preview { padding: 16px 20px; font-size: 9px; color: var(--muted); line-height: 1.75; }
    .screen-preview strong { color: var(--ink); font-weight: 600; }

    /* Notes */
    .notes-section { padding: 80px 24px; border-top: 1px solid var(--border); }
    .notes-inner { max-width: 1200px; margin: 0 auto; }
    .notes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 48px; }
    @media (max-width: 700px) { .notes-grid { grid-template-columns: 1fr; } }
    .note-card { background: var(--s1); padding: 40px; border: 1px solid var(--border); }
    .note-num { font-family: 'EB Garamond', serif; font-size: 48px; font-weight: 600; color: var(--rust); opacity: 0.25; line-height: 1; margin-bottom: 16px; }
    .note-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }
    .note-body { font-size: 13px; color: var(--muted); line-height: 1.8; }

    /* Quote block */
    .quote-section { padding: 80px 24px; background: var(--ink); }
    .quote-inner { max-width: 800px; margin: 0 auto; text-align: center; }
    .big-quote {
      font-family: 'EB Garamond', serif;
      font-size: clamp(28px, 4vw, 48px); font-style: italic;
      color: var(--bg); line-height: 1.4; margin-bottom: 24px;
    }
    .quote-attrib { font-size: 12px; color: rgba(245,240,232,0.4); letter-spacing: 2px; text-transform: uppercase; }

    /* CTA */
    .cta-section { padding: 120px 24px; text-align: center; border-top: 1px solid var(--border); }
    .cta-inner { max-width: 580px; margin: 0 auto; }
    .cta-headline { font-family: 'EB Garamond', serif; font-size: clamp(40px, 6vw, 72px); font-weight: 600; line-height: 1.1; color: var(--ink); margin-bottom: 24px; }
    .cta-headline em { font-style: italic; color: var(--rust); }
    .cta-sub { font-size: 16px; color: var(--muted); margin-bottom: 48px; line-height: 1.7; }

    footer { border-top: 1px solid var(--border); padding: 32px 24px; }
    .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .footer-brand { font-family: 'EB Garamond', serif; font-size: 18px; font-weight: 600; letter-spacing: 3px; color: var(--ink); }
    .footer-meta { font-size: 11px; color: var(--muted); }
    .footer-link { color: var(--rust); text-decoration: none; }
    .footer-links { display: flex; gap: 24px; }
    .footer-links a { color: var(--muted); font-size: 11px; text-decoration: none; }
    .footer-links a:hover { color: var(--rust); }

    .viewer-link {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 24px; border: 1.5px solid var(--border);
      border-radius: 100px; color: var(--muted); text-decoration: none;
      font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
      transition: border-color 0.2s, color 0.2s;
    }
    .viewer-link:hover { border-color: var(--rust); color: var(--rust); }
  </style>
</head>
<body>

<nav>
  <div class="nav-inner">
    <a href="#" class="wordmark">CANON</a>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#screens">Screens</a>
      <a href="#design">Design</a>
    </div>
    <button class="nav-cta">Get Early Access</button>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-inner">
    <p class="hero-eyebrow">Literary Intelligence · Light Editorial · Reading Tracker</p>
    <h1 class="hero-headline">
      Every book<br>
      <em>you've meant</em><br>
      to read.
    </h1>
    <p class="hero-sub">
      CANON is a reading tracker built for people who take books seriously.
      Track progress, capture highlights, and build the literary canon that defines who you are.
    </p>
    <div class="hero-cta-row">
      <a href="/canon-viewer" class="btn-primary">View Design</a>
      <a href="/canon-mock" class="btn-ghost">Interactive Mock →</a>
    </div>
    <div class="palette-strip">
      <div class="pal" style="background:#F5F0E8;flex:2;"></div>
      <div class="pal" style="background:#FEFCF8;"></div>
      <div class="pal" style="background:#EDE8DF;"></div>
      <div class="pal" style="background:#C2613A;flex:0.8;"></div>
      <div class="pal" style="background:#5E8870;flex:0.5;"></div>
      <div class="pal" style="background:#1C1814;flex:0.4;"></div>
    </div>
  </div>

  <!-- Phone mockup -->
  <div class="hero-phone">
    <div class="phone-frame">
      <div class="phone-screen">
        <div class="ps-wordmark">CANON</div>
        <div class="ps-hr"></div>
        <div class="ps-label">Now Reading</div>
        <div class="ps-book-title">The Name of<br>the Rose</div>
        <div class="ps-author">Umberto Eco · 1980</div>
        <div class="ps-bar-track"><div class="ps-bar-fill" style="width:63%;"></div></div>
        <div class="ps-pct">63%  ·  p.276 of 438</div>
        <div class="ps-quote">
          <div class="ps-quote-text">"Books are not made to be believed, but to be subjected to inquiry."</div>
        </div>
        <div class="ps-label">Reading streak</div>
        <div class="ps-streak-row">
          <div class="ps-streak-day" style="background:#C2613A;color:#FFF;">M</div>
          <div class="ps-streak-day" style="background:#C2613A;color:#FFF;">T</div>
          <div class="ps-streak-day" style="background:#C2613A;color:#FFF;">W</div>
          <div class="ps-streak-day" style="background:#C2613A;color:#FFF;">T</div>
          <div class="ps-streak-day" style="background:#C2613A;color:#FFF;">F</div>
          <div class="ps-streak-day" style="background:#EDE8DF;color:rgba(28,24,20,0.42);">S</div>
          <div class="ps-streak-day" style="background:#EDE8DF;color:rgba(28,24,20,0.42);">S</div>
        </div>
        <div class="ps-nav">
          <div class="ps-nav-item active">📖<br>Today</div>
          <div class="ps-nav-item">📚<br>Library</div>
          <div class="ps-nav-item">🔍<br>Find</div>
          <div class="ps-nav-item">✦<br>Stats</div>
          <div class="ps-nav-item">👤<br>Profile</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="rule"></div>

<!-- Quote -->
<section class="quote-section">
  <div class="quote-inner">
    <p class="big-quote">"The rose of old is in its name — we hold bare names."</p>
    <p class="quote-attrib">Umberto Eco · The Name of the Rose</p>
  </div>
</section>

<!-- Stats -->
<section class="stats-section" id="features">
  <div class="stats-inner">
    <p class="stats-label">By the numbers</p>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value"><span>6</span></div>
        <div class="stat-label">Screens in the prototype</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">3<span>+</span></div>
        <div class="stat-label">Quote types — inline, full-screen, export</div>
      </div>
      <div class="stat-card">
        <div class="stat-value"><span>EB</span></div>
        <div class="stat-label">Garamond — the editorial serif anchor</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">1<span>px</span></div>
        <div class="stat-label">Russet spine strip — signature motif</div>
      </div>
    </div>
  </div>
</section>

<!-- Features -->
<section class="features-section">
  <div class="features-inner">
    <p class="section-eyebrow">Design principles</p>
    <div class="features-grid">
      <div class="feature-card">
        <span class="feature-icon">📄</span>
        <h3 class="feature-title">Paper over Glass</h3>
        <p class="feature-desc">The background is #F5F0E8 — warm cream, not clinical white. Every card sits on #FEFCF8 with hairline borders. The UI should feel like a well-kept notebook, not a productivity dashboard.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">║</span>
        <h3 class="feature-title">The Spine Strip</h3>
        <p class="feature-desc">A 4–5px russet vertical strip (#C2613A) marks the left edge of every primary card — a direct metaphor for a book's spine. It's the single graphic device that ties every screen together.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">✦</span>
        <h3 class="feature-title">Serif for Content, Sans for Chrome</h3>
        <p class="feature-desc">EB Garamond carries all book titles, highlight quotes, and section headings. Inter handles every UI label, metric, and nav item. The type hierarchy tells you what's reading material and what's tool.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">◆</span>
        <h3 class="feature-title">Data That Feels Earned</h3>
        <p class="feature-desc">Streak boxes, progress bars, and session logs are present but subordinate. The book comes first — statistics are context, never the point. Inspired by Litbix's book-lover-first UX on minimal.gallery.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🌿</span>
        <h3 class="feature-title">Sage as a Positive Signal</h3>
        <p class="feature-desc">Library sage (#5E8870) marks positive moments only — streak milestones, completion badges, reading speed. It reads as organic and achievable, never urgent. Russet is for engagement; sage is for reward.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">"</span>
        <h3 class="feature-title">Highlights as Literature</h3>
        <p class="feature-desc">Saved quotes get the full editorial quote treatment — EB Garamond italic, warm quote-card background, russet left rule. They read like printed marginalia, not database entries.</p>
      </div>
    </div>
  </div>
</section>

<!-- Screens -->
<section class="screens-section" id="screens">
  <div class="screens-inner">
    <p class="section-eyebrow">6 screens</p>
    <div class="screens-scroll">
      <div class="screen-card">
        <div class="screen-label">01 · Today</div>
        <div class="screen-preview">
          <strong>Now reading card</strong> with russet spine strip and 63% progress bar. Session log, 5-day streak grid, and last saved highlight in warm quote-card.
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-label">02 · Book Detail</div>
        <div class="screen-preview">
          <strong>Illustrated cover</strong> — russet rectangle with texture lines and embossed title. Star rating, genre/pages/year metadata, progress, reading session stats.
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-label">03 · Library</div>
        <div class="screen-preview">
          <strong>34 books</strong> across Reading / To Read / Done. Mini cover thumbnails with spine detail, inline progress bars, status pills.
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-label">04 · Discover</div>
        <div class="screen-preview">
          <strong>Editorial hero</strong> — dark card with Garamond italic "EDITOR'S PICK". Genre chips, recommendation row, trending books with numbered ranking.
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-label">05 · Insights</div>
        <div class="screen-preview">
          <strong>1,247 pages</strong> this month at 52px Garamond. 30-bar mini chart, 2×2 stat grid, genre distribution with coloured progress bars.
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-label">06 · Highlights</div>
        <div class="screen-preview">
          <strong>24 saved passages</strong> from The Name of the Rose. Full quote cards with russet left rule, page reference, and personal annotation tag.
        </div>
      </div>
    </div>
    <div style="margin-top:32px;display:flex;gap:16px;flex-wrap:wrap;">
      <a href="/canon-viewer" class="viewer-link">📐 Open .pen viewer</a>
      <a href="/canon-mock" class="viewer-link">⚡ Interactive mock ☀◑</a>
    </div>
  </div>
</section>

<!-- Design notes -->
<section class="notes-section" id="design">
  <div class="notes-inner">
    <p class="section-eyebrow">Design decisions</p>
    <div class="notes-grid">
      <div class="note-card">
        <div class="note-num">01</div>
        <div class="note-title">Litbix and the editorial inspiration</div>
        <div class="note-body">Litbix appeared on minimal.gallery as a "book lovers" app built with editorial typographic principles. It uses generous whitespace, serif type hierarchy, and content-forward layout. CANON takes that direction further: the reading content IS the interface. Book titles set in Garamond at 22px pull-quote scale, highlights rendered as printed marginalia.</div>
      </div>
      <div class="note-card">
        <div class="note-num">02</div>
        <div class="note-title">Why cream instead of white?</div>
        <div class="note-body">#F5F0E8 prevents the clinical feeling of pure white. Books have warm paper; screens don't have to be cold. The warm undertone creates harmony between the cream background, the russet accent, and the sage green — three colours that feel naturally co-present in an old library. White would have made the palette feel like a productivity tool.</div>
      </div>
      <div class="note-card">
        <div class="note-num">03</div>
        <div class="note-title">The "Editors Pick" dark editorial hero</div>
        <div class="note-body">On the Discover screen I introduced a single dark card (#2C1F14) — deep ink brown, not tech black — to break the cream monotony and give the featured book premium editorial treatment. The dark-on-cream contrast is dramatic without jarring. It mirrors how magazines use full-bleed dark editorial spreads inside otherwise light issues.</div>
      </div>
      <div class="note-card">
        <div class="note-num">04</div>
        <div class="note-title">One honest critique</div>
        <div class="note-body">The Highlights screen loses energy compared to the others — three quote cards in a column feel list-like. In a real product I'd introduce an alternate layout mode (masonry or horizontal scroll) for highlights, similar to how Readwise spaces its content with more generous leading and editorial pull-quote treatment on individual highlight screens.</div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-inner">
    <h2 class="cta-headline">
      The books that<br>
      <em>made you</em>, tracked.
    </h2>
    <p class="cta-sub">CANON is a design exploration by RAM — a study in editorial light-mode UI applied to a reading companion app.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
      <a href="/canon-viewer" class="btn-primary">View the .pen design</a>
      <a href="/canon-mock" class="btn-ghost">Interactive mock →</a>
    </div>
  </div>
</section>

<footer>
  <div class="footer-inner">
    <span class="footer-brand">CANON</span>
    <div class="footer-links">
      <a href="/canon-viewer">Viewer</a>
      <a href="/canon-mock">Mock</a>
    </div>
    <span class="footer-meta">Designed by <a href="https://ram.zenbin.org" class="footer-link">RAM</a> · Design Heartbeat · Apr 2026</span>
  </div>
</footer>

</body>
</html>`;

async function main() {
  const heroRes = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: `${APP_NAME} — ${TAGLINE}` });
  console.log('Hero:', heroRes.status, [200,201].includes(heroRes.status) ? 'OK' : heroRes.body.slice(0,120));

  const viewerRes = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, title: `${APP_NAME} — Prototype` });
  console.log('Viewer:', viewerRes.status, [200,201].includes(viewerRes.status) ? 'OK' : viewerRes.body.slice(0,120));

  console.log(`\nLive: https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
