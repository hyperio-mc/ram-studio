'use strict';
// folio-hero.js — Publish hero landing page for Folio

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SLUG = 'folio';
const HOST = 'ram.zenbin.org';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: HOST, port: 443,
      path: '/publish', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// ── Hero HTML ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Folio — Time tracked. Money made.</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #F7F3EC;
    --surface: #FFFDF8;
    --border:  #E8E0D2;
    --text:    #1C1810;
    --sub:     #7A7060;
    --accent:  #C4622D;
    --green:   #2D6E4E;
    --warning: #C49A2D;
    --danger:  #C43D2D;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    background: rgba(247,243,236,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    z-index: 100;
    padding: 0 32px;
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: var(--text); }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { text-decoration: none; color: var(--sub); font-size: 14px; font-weight: 500; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    border: none; border-radius: 20px;
    padding: 8px 20px; font-size: 14px; font-weight: 600;
    cursor: pointer; text-decoration: none;
  }

  /* Hero */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 24px 60px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.45;
    pointer-events: none;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12px; font-weight: 600;
    color: var(--accent);
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 28px;
    position: relative;
  }
  .hero-badge::before {
    content: ''; width: 6px; height: 6px;
    background: var(--accent); border-radius: 50%;
  }

  h1 {
    font-size: clamp(44px, 7vw, 80px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -2px;
    color: var(--text);
    max-width: 760px;
    margin-bottom: 24px;
    position: relative;
  }
  h1 em {
    font-style: normal;
    color: var(--accent);
    position: relative;
  }
  h1 em::after {
    content: '';
    position: absolute;
    bottom: 4px; left: 0; right: 0;
    height: 3px;
    background: var(--accent);
    border-radius: 2px;
    opacity: 0.3;
  }

  .hero-sub {
    font-size: 18px; color: var(--sub);
    max-width: 480px; margin: 0 auto 40px;
    font-weight: 400; line-height: 1.65;
    position: relative;
  }

  .hero-actions {
    display: flex; gap: 14px; align-items: center;
    flex-wrap: wrap; justify-content: center;
    position: relative;
  }
  .btn-primary {
    background: var(--text); color: var(--bg);
    border: none; border-radius: 26px;
    padding: 14px 30px; font-size: 15px; font-weight: 600;
    cursor: pointer; text-decoration: none;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(28,24,16,0.15); }
  .btn-ghost {
    background: transparent; color: var(--text);
    border: 1.5px solid var(--border);
    border-radius: 26px;
    padding: 13px 28px; font-size: 15px; font-weight: 500;
    cursor: pointer; text-decoration: none;
  }

  /* Stats strip */
  .stats-strip {
    width: 100%; max-width: 700px;
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin: 60px auto 0;
  }
  .stat-cell {
    background: var(--surface);
    padding: 20px 28px;
    text-align: center;
  }
  .stat-val {
    font-size: 28px; font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--text); letter-spacing: -1px;
  }
  .stat-val.accent { color: var(--accent); }
  .stat-val.green { color: var(--green); }
  .stat-label { font-size: 12px; color: var(--sub); margin-top: 4px; }

  /* Phone mockup section */
  .screens-section {
    padding: 100px 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .section-label {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.5px; color: var(--accent);
    margin-bottom: 12px;
  }
  .section-title {
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 700; letter-spacing: -1px;
    color: var(--text); margin-bottom: 16px;
  }
  .section-sub {
    color: var(--sub); font-size: 16px;
    max-width: 480px; line-height: 1.65;
    margin-bottom: 56px;
  }

  .screens-row {
    display: flex; gap: 20px;
    overflow-x: auto;
    padding-bottom: 12px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  .screens-row::-webkit-scrollbar { height: 4px; }
  .screens-row::-webkit-scrollbar-track { background: var(--border); border-radius: 2px; }
  .screens-row::-webkit-scrollbar-thumb { background: var(--sub); border-radius: 2px; }

  .screen-card {
    flex: 0 0 240px;
    scroll-snap-align: start;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(28,24,16,0.06);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .screen-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(28,24,16,0.1); }
  .screen-card-header {
    background: var(--bg);
    padding: 12px 16px 8px;
    border-bottom: 1px solid var(--border);
  }
  .screen-card-title { font-size: 11px; font-weight: 600; color: var(--sub); text-transform: uppercase; letter-spacing: 0.5px; }
  .screen-card-body { padding: 16px; }

  /* Mini UI elements for screen cards */
  .mini-amount {
    font-size: 24px; font-weight: 700; color: var(--text);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
    margin-bottom: 2px;
  }
  .mini-label { font-size: 11px; color: var(--sub); margin-bottom: 12px; }
  .mini-bar-wrap { height: 6px; background: var(--border); border-radius: 3px; margin: 6px 0 12px; overflow: hidden; }
  .mini-bar { height: 100%; border-radius: 3px; }
  .mini-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 0; border-bottom: 1px solid var(--border);
    font-size: 12px;
  }
  .mini-row:last-child { border-bottom: none; }
  .mini-name { color: var(--text); font-weight: 500; }
  .mini-val { color: var(--text); font-weight: 600; font-variant-numeric: tabular-nums; }
  .mini-tag {
    display: inline-block; padding: 2px 8px; border-radius: 10px;
    font-size: 10px; font-weight: 600;
  }
  .tag-paid { background: #EDF7F2; color: var(--green); }
  .tag-sent { background: #FEF8E8; color: var(--warning); }
  .tag-over { background: #FEF0EE; color: var(--danger); }

  /* Features grid */
  .features-section {
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 80px 24px;
  }
  .features-inner { max-width: 1000px; margin: 0 auto; }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 48px;
  }
  .feature-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    transition: border-color 0.2s;
  }
  .feature-card:hover { border-color: var(--accent); }
  .feature-icon {
    width: 40px; height: 40px;
    background: var(--accent);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    margin-bottom: 16px;
  }
  .feature-icon.green { background: var(--green); }
  .feature-icon.warning { background: var(--warning); }
  .feature-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
  .feature-desc { font-size: 14px; color: var(--sub); line-height: 1.6; }

  /* Testimonial */
  .testimonial-section {
    padding: 80px 24px;
    max-width: 700px; margin: 0 auto;
    text-align: center;
  }
  blockquote {
    font-size: clamp(18px, 2.5vw, 24px);
    color: var(--text);
    line-height: 1.6;
    font-weight: 400;
    margin-bottom: 24px;
    letter-spacing: -0.3px;
  }
  blockquote::before { content: '\\201C'; color: var(--accent); }
  blockquote::after  { content: '\\201D'; color: var(--accent); }
  .quote-attr { font-size: 13px; color: var(--sub); font-weight: 500; }

  /* Footer / CTA */
  .cta-section {
    background: var(--text);
    padding: 80px 24px;
    text-align: center;
  }
  .cta-section h2 {
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 700; letter-spacing: -1px;
    color: var(--bg); margin-bottom: 16px;
  }
  .cta-section p { color: rgba(247,243,236,0.6); font-size: 16px; margin-bottom: 36px; }
  .btn-light {
    background: var(--bg); color: var(--text);
    border: none; border-radius: 26px;
    padding: 14px 32px; font-size: 16px; font-weight: 600;
    cursor: pointer; text-decoration: none;
    transition: transform 0.15s;
  }
  .btn-light:hover { transform: translateY(-2px); }

  .footer {
    background: var(--text);
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 24px 32px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px; color: rgba(247,243,236,0.4);
    flex-wrap: wrap; gap: 12px;
  }
  .footer a { color: rgba(247,243,236,0.4); text-decoration: none; }

  @media (max-width: 600px) {
    .nav-links { display: none; }
    .stats-strip { grid-template-columns: 1fr; }
    .hero-actions { flex-direction: column; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">folio<span>.</span></div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/folio-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/folio-mock">Mock ☀◑</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/folio-mock">Try it →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-badge">Design Concept · RAM Heartbeat</div>
  <h1>Time tracked.<br><em>Money made.</em></h1>
  <p class="hero-sub">The billing app for independent creators — log hours, send invoices, and see exactly where your income comes from.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/folio-mock">View Interactive Mock →</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/folio-viewer">See Prototype</a>
  </div>
  <div class="stats-strip">
    <div class="stat-cell">
      <div class="stat-val accent">6</div>
      <div class="stat-label">screens designed</div>
    </div>
    <div class="stat-cell">
      <div class="stat-val">Light</div>
      <div class="stat-label">warm parchment theme</div>
    </div>
    <div class="stat-cell">
      <div class="stat-val green">425</div>
      <div class="stat-label">elements rendered</div>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section class="screens-section" id="screens">
  <div class="section-label">Prototype</div>
  <h2 class="section-title">Six screens, one flow.</h2>
  <p class="section-sub">From daily snapshot to invoice breakdown — everything a freelancer needs to stay on top of their business.</p>

  <div class="screens-row">
    <!-- Home -->
    <div class="screen-card">
      <div class="screen-card-header"><div class="screen-card-title">Home — Today</div></div>
      <div class="screen-card-body">
        <div class="mini-amount">$1,240</div>
        <div class="mini-label">earned today · 6.5h logged</div>
        <div class="mini-row"><span class="mini-name">Nomad Studio</span><span class="mini-val">12.5h</span></div>
        <div class="mini-row"><span class="mini-name">Aria Health</span><span class="mini-val">8.0h</span></div>
        <div class="mini-row"><span class="mini-name">Hex Games</span><span class="mini-val">3.0h</span></div>
        <div style="margin-top:10px;font-size:11px;color:#C43D2D;font-weight:600;">⚠ $2,100 overdue</div>
      </div>
    </div>

    <!-- Projects -->
    <div class="screen-card">
      <div class="screen-card-header"><div class="screen-card-title">Projects</div></div>
      <div class="screen-card-body">
        <div class="mini-row"><span class="mini-name">Nomad Studio</span><span class="mini-val">$12k</span></div>
        <div class="mini-bar-wrap"><div class="mini-bar" style="width:71%;background:#C4622D"></div></div>
        <div class="mini-row"><span class="mini-name">Aria Health</span><span class="mini-val">$6.4k</span></div>
        <div class="mini-bar-wrap"><div class="mini-bar" style="width:44%;background:#2D6E4E"></div></div>
        <div class="mini-row"><span class="mini-name">Hex Games</span><span class="mini-val">$4.4k</span></div>
        <div class="mini-bar-wrap"><div class="mini-bar" style="width:19%;background:#C4622D"></div></div>
        <div class="mini-row"><span class="mini-name">VaultFi</span><span class="mini-val">✓ Done</span></div>
      </div>
    </div>

    <!-- Time Log -->
    <div class="screen-card">
      <div class="screen-card-header"><div class="screen-card-title">Time Log</div></div>
      <div class="screen-card-body">
        <div class="mini-amount" style="color:#C4622D">02:14:38</div>
        <div class="mini-label" style="color:#C4622D">● Active — Nomad Studio</div>
        <div class="mini-row"><span class="mini-name">Logo iterations</span><span class="mini-val">1h 30m</span></div>
        <div class="mini-row"><span class="mini-name">Wireframe review</span><span class="mini-val">1h 15m</span></div>
        <div class="mini-row"><span class="mini-name">Component lib.</span><span class="mini-val">1h 37m</span></div>
        <div style="margin-top:8px;font-size:12px;color:#7A7060;">Today: 4h 22m · $832.40</div>
      </div>
    </div>

    <!-- Invoices -->
    <div class="screen-card">
      <div class="screen-card-header"><div class="screen-card-title">Invoices</div></div>
      <div class="screen-card-body">
        <div class="mini-row"><span class="mini-name">INV-048 · Aria</span><span><span class="mini-tag tag-over">Overdue</span></span></div>
        <div class="mini-row"><span class="mini-name">INV-049 · Nomad</span><span><span class="mini-tag tag-sent">Sent</span></span></div>
        <div class="mini-row"><span class="mini-name">INV-050 · Hex</span><span><span class="mini-tag tag-sent">Sent</span></span></div>
        <div class="mini-row"><span class="mini-name">INV-047 · VaultFi</span><span><span class="mini-tag tag-paid">Paid</span></span></div>
        <div style="margin-top:8px;font-size:11px;color:#2D6E4E;font-weight:600;">$28,400 paid this month</div>
      </div>
    </div>

    <!-- Insights -->
    <div class="screen-card">
      <div class="screen-card-header"><div class="screen-card-title">Insights — March</div></div>
      <div class="screen-card-body">
        <div class="mini-amount">$18,620</div>
        <div class="mini-label" style="color:#2D6E4E;">↑ 12.4% vs February</div>
        <div class="mini-row"><span class="mini-name">Nomad Studio</span><span class="mini-val">46%</span></div>
        <div class="mini-row"><span class="mini-name">VaultFi</span><span class="mini-val">29%</span></div>
        <div class="mini-row"><span class="mini-name">Aria Health</span><span class="mini-val">18%</span></div>
        <div class="mini-row"><span class="mini-name">Hex Games</span><span class="mini-val">7%</span></div>
      </div>
    </div>

    <!-- Invoice Detail -->
    <div class="screen-card">
      <div class="screen-card-header"><div class="screen-card-title">Invoice Detail</div></div>
      <div class="screen-card-body">
        <div style="font-size:11px;color:#C43D2D;font-weight:700;margin-bottom:4px;">⚠ OVERDUE · INV-048</div>
        <div class="mini-amount" style="color:#C43D2D;">$4,480</div>
        <div class="mini-label">Aria Health · Due Mar 15</div>
        <div class="mini-row"><span class="mini-name">User Research</span><span class="mini-val">$1,280</span></div>
        <div class="mini-row"><span class="mini-name">Wireframing</span><span class="mini-val">$1,600</span></div>
        <div class="mini-row"><span class="mini-name">Component Lib</span><span class="mini-val">$960</span></div>
        <div class="mini-row"><span class="mini-name">Prototype</span><span class="mini-val">$640</span></div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features-section" id="features">
  <div class="features-inner">
    <div class="section-label">What it does</div>
    <h2 class="section-title">Built around how freelancers actually work.</h2>
    <p class="section-sub">Inspired by Midday.ai's unified transaction model — one source of truth for time, invoices, and money.</p>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">◷</div>
        <div class="feature-title">One-tap time tracking</div>
        <div class="feature-desc">Start a timer from any project with a single tap. Entries auto-link to clients and calculate billable amounts on the fly.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon green">⊞</div>
        <div class="feature-title">Smart invoicing</div>
        <div class="feature-desc">Generate invoices from logged hours automatically. Track sent, overdue, and paid status in one clean list.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon warning">◈</div>
        <div class="feature-title">Project budget tracking</div>
        <div class="feature-desc">Visual budget progress bars per project. Know before you hit 100% — never over-deliver for free again.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">▲</div>
        <div class="feature-title">Income insights</div>
        <div class="feature-desc">Monthly earnings breakdown by client, avg hourly rate trends, and utilization against your target hours.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon green">$</div>
        <div class="feature-title">Overdue alerts</div>
        <div class="feature-desc">Overdue invoices surface prominently in red on every screen — so nothing slips through the cracks.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⌂</div>
        <div class="feature-title">Daily snapshot</div>
        <div class="feature-desc">Home screen shows today's earnings, hours logged, and a weekly bar chart — your morning briefing at a glance.</div>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIAL -->
<section class="testimonial-section">
  <blockquote>I used to spend Sunday nights piecing together invoices from spreadsheets and timers. Folio does it all in one place.</blockquote>
  <div class="quote-attr">— Concept user, freelance product designer</div>
</section>

<!-- DESIGN NOTES -->
<section style="padding: 60px 24px; max-width: 700px; margin: 0 auto; border-top: 1px solid var(--border);">
  <div class="section-label">Design Notes</div>
  <h2 class="section-title" style="font-size: 24px; margin-bottom: 16px;">Trend → Execution</h2>
  <p style="color: var(--sub); font-size: 15px; line-height: 1.7; margin-bottom: 16px;">
    Inspired by <strong style="color:var(--text)">Midday.ai</strong> (spotted on Dark Mode Design) — their "all transactions unified" feature showcase and clean tabular dashboard UI for modern founders. I wanted to transpose that pattern into a <strong style="color:var(--text)">warm light-mode</strong> aesthetic, stepping away from stark white toward a parchment/ledger feel.
  </p>
  <p style="color: var(--sub); font-size: 15px; line-height: 1.7; margin-bottom: 16px;">
    Key decisions: (1) <strong style="color:var(--text)">JetBrains Mono for all money values</strong> — makes financial numbers feel precise and legible. (2) <strong style="color:var(--text)">Terracotta + forest green accent pair</strong> — overdue in orange-red, paid/positive in green, creating a natural traffic-light system. (3) <strong style="color:var(--text)">Subtle ledger-paper grid</strong> in the hero section — references the bookkeeping DNA of the app without being heavy-handed.
  </p>
  <p style="color: var(--sub); font-size: 15px; line-height: 1.7;">
    <strong style="color:var(--text)">Honest critique:</strong> The Projects screen is data-dense in a way that might feel overwhelming on a real 390px device — the 4 cards probably need collapsing or pagination in a real implementation.
  </p>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2>See it in motion.</h2>
  <p>The interactive mock has light/dark toggle and full screen navigation.</p>
  <a class="btn-light" href="https://ram.zenbin.org/folio-mock">Open Interactive Mock →</a>
</section>

<footer class="footer">
  <span>Folio — RAM Design Heartbeat · Mar 26, 2026</span>
  <span>Inspired by Midday.ai · <a href="https://ram.zenbin.org/folio-viewer">Viewer</a> · <a href="https://ram.zenbin.org/folio-mock">Mock</a></span>
</footer>

</body>
</html>`;

(async () => {
  console.log('Publishing hero page...');
  const r = await publish(SLUG, heroHtml, 'Folio — Time tracked. Money made.');
  console.log('Hero:', r.status, r.status === 200 ? `https://${HOST}/${SLUG}` : r.body.slice(0, 120));
})();
