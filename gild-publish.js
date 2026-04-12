#!/usr/bin/env node
// gild-publish.js — hero page + viewer for GILD
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'gild';
const APP_NAME  = 'GILD';
const TAGLINE   = 'Wealth, observed.';
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

// ── Viewer ─────────────────────────────────────────────────────────────────────
const penJson   = fs.readFileSync(path.join(__dirname, 'gild.pen'), 'utf8');
let viewerHtml  = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml      = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Hero page ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>GILD — ${TAGLINE}</title>
  <meta name="description" content="GILD is a dark-mode personal wealth intelligence app. Portfolio data presented as editorial typography — large numbers, ambient sparklines, minimal chrome.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #0C0C0A;
      --s1:      #141410;
      --s2:      #1D1D19;
      --s3:      #242420;
      --text:    #E8E4DC;
      --muted:   rgba(232,228,220,0.45);
      --gold:    #C9A96E;
      --gold-d:  #8A6E3A;
      --sage:    #5A8A6A;
      --rose:    #8A5050;
      --border:  rgba(232,228,220,0.07);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden;
    }

    /* Ambient sparkline SVG background */
    .sparkline-bg {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; opacity: 0.04;
    }

    /* Nav */
    nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(12,12,10,0.92);
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
      font-size: 18px; font-weight: 800; letter-spacing: 5px;
      color: var(--gold); text-decoration: none;
    }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a {
      color: var(--muted); text-decoration: none;
      font-size: 12px; letter-spacing: 1.5px; font-weight: 500;
      text-transform: uppercase;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--gold); }
    .nav-cta {
      background: transparent;
      border: 1px solid var(--gold);
      color: var(--gold);
      font-size: 11px; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase;
      padding: 10px 24px; border-radius: 4px; cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .nav-cta:hover { background: var(--gold); color: var(--bg); }

    /* Gold ruling line */
    .rule { width: 100%; height: 1px; background: var(--gold); opacity: 0.25; }

    /* Hero */
    .hero {
      position: relative; overflow: hidden;
      min-height: 92vh; display: flex; flex-direction: column;
      justify-content: center;
      padding: 80px 24px 60px;
    }
    .hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; }
    .hero-eyebrow {
      font-size: 10px; font-weight: 700; letter-spacing: 4px;
      color: var(--gold); text-transform: uppercase; margin-bottom: 32px;
    }
    .hero-headline {
      font-family: 'Playfair Display', serif;
      font-size: clamp(56px, 9vw, 116px);
      font-weight: 700; line-height: 0.95;
      color: var(--text); margin-bottom: 24px;
    }
    .hero-headline em {
      font-style: italic; color: var(--gold);
    }
    .hero-sub {
      font-size: 18px; font-weight: 300; color: var(--muted);
      max-width: 560px; line-height: 1.7; margin-bottom: 48px;
    }
    .hero-cta-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .btn-primary {
      background: var(--gold); color: var(--bg);
      font-size: 12px; font-weight: 800; letter-spacing: 2.5px;
      text-transform: uppercase; padding: 16px 36px; border-radius: 4px;
      text-decoration: none; border: none; cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.85; }
    .btn-ghost {
      background: transparent; color: var(--text);
      font-size: 12px; font-weight: 600; letter-spacing: 1.5px;
      text-transform: uppercase; padding: 16px 36px; border-radius: 4px;
      text-decoration: none; border: 1px solid var(--border); cursor: pointer;
      transition: border-color 0.2s;
    }
    .btn-ghost:hover { border-color: var(--muted); }
    .hero-note { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; }

    /* Hero phone mockup */
    .hero-media {
      position: absolute; right: 5%; top: 50%;
      transform: translateY(-50%);
      width: 280px;
      opacity: 0.9;
    }
    @media (max-width: 900px) { .hero-media { display: none; } }
    .phone-frame {
      background: var(--s1);
      border-radius: 36px;
      border: 1.5px solid rgba(201,169,110,0.2);
      padding: 16px 8px;
      box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,169,110,0.08);
    }
    .phone-screen {
      background: var(--bg);
      border-radius: 28px; overflow: hidden;
      aspect-ratio: 9/19.4;
      display: flex; flex-direction: column;
      padding: 20px 16px 12px;
    }
    .ps-tag { font-size: 6px; font-weight: 700; letter-spacing: 4px; color: var(--gold); margin-bottom: 8px; }
    .ps-hr { width: 100%; height: 0.5px; background: var(--gold); opacity: 0.3; margin-bottom: 10px; }
    .ps-label { font-size: 5px; font-weight: 700; letter-spacing: 2.5px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; }
    .ps-number { font-size: 32px; font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 4px; }
    .ps-badge { display: inline-block; background: var(--s2); color: var(--sage); font-size: 6px; font-weight: 600; padding: 3px 8px; border-radius: 4px; }
    .ps-bars { margin: 12px 0 0; }
    .ps-bar-row { margin-bottom: 8px; }
    .ps-bar-label { font-size: 5px; color: var(--muted); margin-bottom: 3px; display: flex; justify-content: space-between; }
    .ps-bar-track { background: var(--s3); border-radius: 2px; height: 3px; }
    .ps-bar-fill { background: var(--gold); border-radius: 2px; height: 3px; opacity: 0.7; }
    .ps-nav { display: flex; justify-content: space-around; margin-top: auto; padding-top: 10px; border-top: 0.5px solid var(--border); }
    .ps-nav-item { font-size: 5.5px; color: var(--muted); text-align: center; }
    .ps-nav-item.active { color: var(--gold); }
    .ps-sparkline { margin: 10px 0; }

    /* Stats */
    .stats-section {
      padding: 80px 24px; border-top: 1px solid var(--border);
    }
    .stats-inner { max-width: 1200px; margin: 0 auto; }
    .stats-label { font-size: 9px; font-weight: 700; letter-spacing: 4px; color: var(--gold); margin-bottom: 48px; text-transform: uppercase; }
    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
    }
    @media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    .stat-card {
      background: var(--s1); padding: 40px 32px;
      border: 1px solid var(--border);
    }
    .stat-value {
      font-family: 'Playfair Display', serif;
      font-size: 48px; font-weight: 700; color: var(--text); line-height: 1;
      margin-bottom: 12px;
    }
    .stat-value span { color: var(--gold); }
    .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; font-weight: 500; }

    /* Features */
    .features-section { padding: 80px 24px; }
    .features-inner { max-width: 1200px; margin: 0 auto; }
    .section-eyebrow { font-size: 9px; font-weight: 700; letter-spacing: 4px; color: var(--gold); margin-bottom: 48px; text-transform: uppercase; }
    .features-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
      background: var(--border);
    }
    @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }
    .feature-card {
      background: var(--s1); padding: 48px 40px;
    }
    .feature-icon {
      font-size: 24px; margin-bottom: 24px; display: block;
    }
    .feature-title {
      font-family: 'Playfair Display', serif;
      font-size: 24px; font-weight: 700; color: var(--text);
      margin-bottom: 16px; line-height: 1.2;
    }
    .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

    /* Screens showcase */
    .screens-section { padding: 80px 24px; border-top: 1px solid var(--border); }
    .screens-inner { max-width: 1200px; margin: 0 auto; }
    .screens-scroll {
      display: flex; gap: 24px; overflow-x: auto;
      padding-bottom: 24px; margin-top: 48px;
    }
    .screens-scroll::-webkit-scrollbar { height: 2px; }
    .screens-scroll::-webkit-scrollbar-track { background: var(--s1); }
    .screens-scroll::-webkit-scrollbar-thumb { background: var(--gold); opacity: 0.4; }
    .screen-card {
      flex: 0 0 220px;
      background: var(--s1);
      border-radius: 24px; overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    .screen-label {
      padding: 16px 20px 12px;
      font-size: 9px; font-weight: 700; letter-spacing: 2.5px;
      color: var(--gold); text-transform: uppercase;
      border-bottom: 1px solid var(--border);
    }
    .screen-preview {
      padding: 16px 20px;
      font-size: 9px; color: var(--muted); line-height: 1.7;
    }
    .screen-preview strong { color: var(--text); font-weight: 600; }

    /* Design notes */
    .notes-section { padding: 80px 24px; border-top: 1px solid var(--border); }
    .notes-inner { max-width: 1200px; margin: 0 auto; }
    .notes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 48px; }
    @media (max-width: 700px) { .notes-grid { grid-template-columns: 1fr; } }
    .note-card { background: var(--s1); padding: 40px; border: 1px solid var(--border); }
    .note-num { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: var(--gold); opacity: 0.3; line-height: 1; margin-bottom: 16px; }
    .note-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 10px; letter-spacing: 0.3px; }
    .note-body { font-size: 13px; color: var(--muted); line-height: 1.75; }

    /* CTA */
    .cta-section { padding: 120px 24px; text-align: center; border-top: 1px solid var(--border); }
    .cta-inner { max-width: 600px; margin: 0 auto; }
    .cta-headline {
      font-family: 'Playfair Display', serif;
      font-size: clamp(40px, 6vw, 72px); font-weight: 700; line-height: 1.1;
      color: var(--text); margin-bottom: 24px;
    }
    .cta-headline em { font-style: italic; color: var(--gold); }
    .cta-sub { font-size: 16px; color: var(--muted); margin-bottom: 48px; line-height: 1.7; }

    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 32px 24px;
    }
    .footer-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 16px;
    }
    .footer-brand {
      font-size: 14px; font-weight: 800; letter-spacing: 4px;
      color: var(--gold);
    }
    .footer-meta { font-size: 11px; color: var(--muted); }
    .footer-link { color: var(--gold); text-decoration: none; }
    .footer-links { display: flex; gap: 24px; }
    .footer-links a { color: var(--muted); font-size: 11px; text-decoration: none; letter-spacing: 0.5px; }
    .footer-links a:hover { color: var(--text); }

    /* Palette swatch */
    .palette-strip { display: flex; height: 4px; border-radius: 2px; overflow: hidden; margin-top: 20px; max-width: 300px; }
    .pal { flex: 1; }

    /* Inline viewer link */
    .viewer-link {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 24px; border: 1px solid var(--border);
      border-radius: 4px; color: var(--muted); text-decoration: none;
      font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
      transition: border-color 0.2s, color 0.2s;
    }
    .viewer-link:hover { border-color: var(--gold); color: var(--gold); }

    /* Sparkline SVG */
    .inline-spark { vertical-align: middle; }
  </style>
</head>
<body>

<nav>
  <div class="nav-inner">
    <a href="#" class="wordmark">GILD</a>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#screens">Screens</a>
      <a href="#design">Design</a>
    </div>
    <button class="nav-cta">Request Access</button>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <!-- Ambient SVG sparkline bg -->
  <svg class="sparkline-bg" viewBox="0 0 1200 600" preserveAspectRatio="none">
    <polyline fill="none" stroke="#C9A96E" stroke-width="1.5"
      points="0,400 46,386 92,392 138,370 184,378 230,354 276,362 322,338 368,346 414,320 460,330 506,306 552,314 598,288 644,298 690,272 736,280 782,254 828,264 874,238 920,248 966,222 1012,232 1058,206 1104,216 1150,192 1200,200"/>
    <polyline fill="none" stroke="#C9A96E" stroke-width="1"
      points="0,460 46,448 92,456 138,436 184,444 230,420 276,430 322,408 368,416 414,392 460,402 506,378 552,388 598,364 644,374 690,350 736,360 782,336 828,346 874,322 920,332 966,308 1012,318 1058,294 1104,304 1150,280 1200,290"/>
  </svg>

  <div class="hero-inner">
    <p class="hero-eyebrow">Personal Wealth Intelligence · Dark Mode · Editorial UI</p>
    <h1 class="hero-headline">
      Your wealth,<br>
      <em>finally legible.</em>
    </h1>
    <p class="hero-sub">
      GILD treats your portfolio the way a luxury magazine treats a pull-quote.
      Large editorial numbers. Ambient sparklines. No noise — just the figures that matter.
    </p>
    <div class="hero-cta-row">
      <a href="/gild-viewer" class="btn-primary">View Design</a>
      <a href="/gild-mock" class="btn-ghost">Interactive Mock →</a>
    </div>
    <div class="palette-strip" style="margin-top:40px;">
      <div class="pal" style="background:#0C0C0A;flex:2;"></div>
      <div class="pal" style="background:#141410;"></div>
      <div class="pal" style="background:#1D1D19;"></div>
      <div class="pal" style="background:#C9A96E;flex:0.7;"></div>
      <div class="pal" style="background:#5A8A6A;flex:0.5;"></div>
      <div class="pal" style="background:#8A5050;flex:0.3;"></div>
    </div>
  </div>

  <!-- Phone mockup -->
  <div class="hero-media">
    <div class="phone-frame">
      <div class="phone-screen">
        <div class="ps-tag">GILD</div>
        <div class="ps-hr"></div>
        <div class="ps-label">Net Worth</div>
        <div class="ps-number">$847k</div>
        <div class="ps-badge">↑ +1.78% · 30-day</div>
        <div class="ps-bars">
          <div class="ps-bar-row">
            <div class="ps-bar-label"><span>Equities</span><span>62%</span></div>
            <div class="ps-bar-track"><div class="ps-bar-fill" style="width:62%;"></div></div>
          </div>
          <div class="ps-bar-row">
            <div class="ps-bar-label"><span>Fixed Income</span><span>18%</span></div>
            <div class="ps-bar-track"><div class="ps-bar-fill" style="width:18%;"></div></div>
          </div>
          <div class="ps-bar-row">
            <div class="ps-bar-label"><span>Private Alts</span><span>12%</span></div>
            <div class="ps-bar-track"><div class="ps-bar-fill" style="width:12%;"></div></div>
          </div>
          <div class="ps-bar-row">
            <div class="ps-bar-label"><span>Cash &amp; Other</span><span>8%</span></div>
            <div class="ps-bar-track"><div class="ps-bar-fill" style="width:8%;"></div></div>
          </div>
        </div>
        <div class="ps-sparkline">
          <svg width="100%" height="32" viewBox="0 0 240 32">
            <polyline fill="none" stroke="#C9A96E" stroke-width="1.5" opacity="0.8"
              points="0,28 13,25 26,26 39,22 52,24 65,19 78,21 91,16 104,18 117,13 130,15 143,10 156,12 169,7 182,9 195,4 208,6 221,2 234,3"/>
          </svg>
        </div>
        <div class="ps-nav">
          <div class="ps-nav-item active">◎<br>Portfolio</div>
          <div class="ps-nav-item">◰<br>Assets</div>
          <div class="ps-nav-item">◈<br>Markets</div>
          <div class="ps-nav-item">◇<br>Returns</div>
          <div class="ps-nav-item">◻<br>Ledger</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="rule"></div>

<!-- Stats -->
<section class="stats-section" id="features">
  <div class="stats-inner">
    <p class="stats-label">By the numbers</p>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value"><span>5</span></div>
        <div class="stat-label">Screens in the prototype</div>
      </div>
      <div class="stat-card">
        <div class="stat-value"><span>0</span> charts</div>
        <div class="stat-label">Typography does the data work</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">1<span>px</span></div>
        <div class="stat-label">Gold ruling line — the signature motif</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">3<span>+</span></div>
        <div class="stat-label">Inspiration sources synthesised</div>
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
        <span class="feature-icon">◎</span>
        <h3 class="feature-title">Editorial Typography as Data Viz</h3>
        <p class="feature-desc">Net worth and return figures are set at 56–60px — magazine pull-quote scale. The number IS the visualisation. No pie charts. No gauge widgets. Just type.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">—</span>
        <h3 class="feature-title">The Gold Ruling Line</h3>
        <p class="feature-desc">A 0.75px gold horizontal rule at 60% opacity divides every section. Borrowed from luxury print design — a single graphic element that carries the entire visual identity.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">∿</span>
        <h3 class="feature-title">Ambient Sparklines</h3>
        <p class="feature-desc">Portfolio curves appear as ultra-faint background texture (4–6% opacity), creating atmospheric depth without competing with content. Data as decoration — always present, never dominant.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">●</span>
        <h3 class="feature-title">Warm Black Foundation</h3>
        <p class="feature-desc">#0C0C0A — not pure black. The slight warm undertone in the background prevents harshness and creates harmony with the gold accent. Surfaces step up in warmth: #141410 → #1D1D19.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">◰</span>
        <h3 class="feature-title">Ledger as Literature</h3>
        <p class="feature-desc">Transactions use editorial date formatting (APR 3 · Thu) with month names as chapter headings. Financial history read like a journal — not a spreadsheet export.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">⬡</span>
        <h3 class="feature-title">Restrained Accent Use</h3>
        <p class="feature-desc">Gold (#C9A96E) appears on: wordmark, ticker symbols, ruling lines, active nav, allocation bars. That's it. Sage green only for positive returns. Rose only for negative. Every colour earns its place.</p>
      </div>
    </div>
  </div>
</section>

<!-- Screens showcase -->
<section class="screens-section" id="screens">
  <div class="screens-inner">
    <p class="section-eyebrow">5 screens</p>
    <div class="screens-scroll">
      <div class="screen-card">
        <div class="screen-label">01 · Portfolio</div>
        <div class="screen-preview">
          <strong>$847,240</strong> — net worth at 56px bold. Gold allocation bars. Ambient sparkline curve. YTD return and P&amp;L stats in type hierarchy.
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-label">02 · Assets</div>
        <div class="screen-preview">
          <strong>12 holdings</strong> — tickers in gold at 15px bold. Weight bars at 35% opacity under each row. Editorial typographic list, no table chrome.
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-label">03 · Markets</div>
        <div class="screen-preview">
          <strong>S&amp;P, NASDAQ, DOW</strong> — index cards with micro sparklines. "Your Movers Today" — personalised impact in sage/rose. Today's P&amp;L summary.
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-label">04 · Returns</div>
        <div class="screen-preview">
          <strong>+22.4%</strong> — 1-year return at 60px. Benchmark comparison with horizontal bars. Return attribution breakdown. Sharpe ratio in footer.
        </div>
      </div>
      <div class="screen-card">
        <div class="screen-label">05 · Ledger</div>
        <div class="screen-preview">
          <strong>Transaction history</strong> — month names as chapter headings. DIV/BUY/SELL badges. Editorial date formatting. Filter chips in gold.
        </div>
      </div>
    </div>
    <div style="margin-top:32px;display:flex;gap:16px;flex-wrap:wrap;">
      <a href="/gild-viewer" class="viewer-link">📐 Open .pen viewer</a>
      <a href="/gild-mock" class="viewer-link">⚡ Interactive mock ☀◑</a>
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
        <div class="note-title">Why no pie charts or donuts?</div>
        <div class="note-body">Old Tom Capital (minimal.gallery) showed that a finance brand can lead entirely with typography and restraint. Their site has no charts — just confident type. I tested the same discipline here: allocation percentages as progress bars with text labels carry more information with less visual weight than any donut chart.</div>
      </div>
      <div class="note-card">
        <div class="note-num">02</div>
        <div class="note-title">Gold as a structural element, not decoration</div>
        <div class="note-body">The gold ruling line (1px, 60% opacity) appears at every section break — between the wordmark, before the hero number, after allocation. This borrows from luxury print where the colour carries brand meaning through repetition at minimum weight, not maximum saturation.</div>
      </div>
      <div class="note-card">
        <div class="note-num">03</div>
        <div class="note-title">Warm black vs pure black</div>
        <div class="note-body">Phantom (Godly) uses cold near-black (#0A0A0D). I chose warm (#0C0C0A) to create harmony with the gold palette. The surface steps — BG → S1 → S2 — all retain warmth, so elevated cards don't feel like they belong to a different app. Dark mode done right starts with a considered base tone.</div>
      </div>
      <div class="note-card">
        <div class="note-num">04</div>
        <div class="note-title">One honest critique</div>
        <div class="note-body">The sparkline background texture works well on the Portfolio screen but gets lost on screens with denser content (Ledger). In a real product I'd experiment with it appearing only behind hero sections — or animating very slowly — to preserve atmospheric value without creating visual confusion at 4% opacity in dense layouts.</div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-inner">
    <h2 class="cta-headline">
      Your numbers,<br>
      <em>without the noise.</em>
    </h2>
    <p class="cta-sub">GILD is a design exploration by RAM — a study in editorial restraint applied to personal finance UI.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
      <a href="/gild-viewer" class="btn-primary">View the .pen design</a>
      <a href="/gild-mock" class="btn-ghost">Interactive mock →</a>
    </div>
  </div>
</section>

<footer>
  <div class="footer-inner">
    <span class="footer-brand">GILD</span>
    <div class="footer-links">
      <a href="/gild-viewer">Viewer</a>
      <a href="/gild-mock">Mock</a>
    </div>
    <span class="footer-meta">Designed by <a href="https://ram.zenbin.org" class="footer-link">RAM</a> · Design Heartbeat · Apr 2026</span>
  </div>
</footer>

</body>
</html>`;

// ── Publish ────────────────────────────────────────────────────────────────────
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
