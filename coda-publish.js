/**
 * CODA — Full Design Discovery Pipeline
 * Hero + Viewer + Gallery queue + DB
 * RAM Design Heartbeat — Mar 29 2026
 *
 * Inspired by:
 * · Midday.ai (darkmodedesign.com) — "business stack for modern founders"
 * · GTM Analytics / Equals (land-book.com) — editorial analytics UI
 * · Cardless Embedded Credit Card Platform (land-book.com, Framer) — warm fintech
 */
'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'coda';
const APP       = 'CODA';
const TAGLINE   = 'Financial intelligence for independent consultants';
const ARCHETYPE = 'finance-light';
const PROMPT    = 'Inspired by Midday.ai on darkmodedesign.com ("business stack for modern founders") and GTM Analytics/Equals on land-book.com — a light-theme financial intelligence app for independent consultants. Warm cream paper palette, cognac amber accent, editorial typographic hierarchy. 5 screens: daily snapshot, client health scores, deal pipeline, invoice detail, and month-close readiness checklist.';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const buf  = Buffer.from(body);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Content-Length': buf.length,
        'X-Subdomain':   subdomain,
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          resolve(parsed.url ? parsed : { url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) });
        } catch(e) { resolve({ url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) }); }
      });
    });
    req.on('error', reject);
    req.write(buf); req.end();
  });
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CODA — Financial Intelligence for Independent Consultants</title>
<meta name="description" content="Know exactly where you stand. CODA gives independent consultants a clear, calm view of their financial health — every day.">
<meta property="og:title" content="CODA — Financial Intelligence">
<meta property="og:description" content="Know exactly where you stand.">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #FAF7F2;
    --bg2:       #F4F0E8;
    --surface:   #FFFFFF;
    --surface2:  #EDE8DE;
    --text:      #1A1514;
    --text-dim:  #6B635E;
    --text-faint:rgba(26,21,20,0.38);
    --accent:    #C4700A;
    --green:     #2E6B4F;
    --amber:     #D4A017;
    --red:       #C43A2A;
    --acc10:     rgba(196,112,10,0.10);
    --acc20:     rgba(196,112,10,0.20);
    --border:    rgba(26,21,20,0.09);
    --border2:   rgba(26,21,20,0.06);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: rgba(250,247,242,0.90);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 13px; font-weight: 800; letter-spacing: .18em; color: var(--accent); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 8px 20px; border-radius: 20px;
    text-decoration: none; font-size: 13px; font-weight: 700;
    letter-spacing: .04em; transition: opacity .15s;
  }
  .nav-cta:hover { opacity: .88; }

  /* ── Hero ── */
  .hero {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 80px 24px 60px;
    position: relative; overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 800px 600px at 70% 40%, rgba(196,112,10,0.05) 0%, transparent 70%),
                radial-gradient(ellipse 600px 400px at 20% 70%, rgba(46,107,79,0.04) 0%, transparent 60%);
  }
  .hero-inner {
    max-width: 1080px; width: 100%; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
    position: relative; z-index: 1;
  }
  .hero-left { max-width: 520px; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--acc10); border: 1px solid rgba(196,112,10,0.20);
    color: var(--accent); padding: 6px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; margin-bottom: 28px;
  }
  .hero-eyebrow span { width:6px; height:6px; border-radius:50%; background:var(--accent); flex-shrink:0; }
  .hero-headline {
    font-size: clamp(42px, 5vw, 64px);
    font-weight: 800; line-height: 1.08;
    letter-spacing: -0.03em; margin-bottom: 24px;
    color: var(--text);
  }
  .hero-headline em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: 18px; line-height: 1.65;
    color: var(--text-dim); margin-bottom: 40px; max-width: 440px;
  }
  .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--text); color: var(--bg);
    padding: 14px 28px; border-radius: 10px;
    text-decoration: none; font-size: 15px; font-weight: 700;
    transition: transform .15s, box-shadow .15s;
    box-shadow: 0 4px 20px rgba(26,21,20,0.14);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(26,21,20,0.18); }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--accent); padding: 14px 28px;
    text-decoration: none; font-size: 15px; font-weight: 600;
    border: 1.5px solid rgba(196,112,10,0.30); border-radius: 10px;
    transition: background .15s;
  }
  .btn-secondary:hover { background: var(--acc10); }

  /* ── Hero Stats ── */
  .hero-stats {
    display: flex; gap: 32px; margin-top: 48px; padding-top: 40px;
    border-top: 1px solid var(--border);
  }
  .stat { }
  .stat-val { font-size: 28px; font-weight: 800; color: var(--text); letter-spacing: -.02em; }
  .stat-val.green { color: var(--green); }
  .stat-lbl { font-size: 12px; color: var(--text-dim); margin-top: 2px; letter-spacing: .02em; }

  /* ── Phone Mockup ── */
  .phone-wrap {
    display: flex; justify-content: center; align-items: center;
    position: relative;
  }
  .phone {
    width: 280px; height: 604px;
    background: var(--surface);
    border-radius: 40px;
    border: 1.5px solid var(--border);
    box-shadow:
      0 0 0 8px rgba(26,21,20,0.04),
      0 40px 80px rgba(26,21,20,0.12),
      0 80px 120px rgba(26,21,20,0.06);
    overflow: hidden;
    position: relative;
  }
  .phone-screen {
    width: 100%; height: 100%;
    background: var(--bg);
    display: flex; flex-direction: column;
    padding: 16px;
    font-size: 11px;
  }
  .phone-status {
    display: flex; justify-content: space-between;
    font-size: 10px; font-weight: 600;
    color: var(--text); margin-bottom: 12px;
  }
  .phone-heading {
    font-size: 9px; color: var(--text-dim); letter-spacing: .08em;
    text-transform: uppercase; font-weight: 700; margin-bottom: 4px;
  }
  .phone-date { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 12px; }
  .phone-card {
    background: var(--text); border-radius: 10px;
    padding: 10px 12px; margin-bottom: 10px;
  }
  .phone-card-lbl { font-size: 7px; color: rgba(250,247,242,0.55); letter-spacing: .1em; text-transform: uppercase; font-weight: 700; }
  .phone-card-val { font-size: 24px; font-weight: 800; color: #FAF7F2; letter-spacing: -.02em; margin-top: 2px; }
  .phone-card-sub { font-size: 8px; color: rgba(250,247,242,0.5); margin-top: 2px; }
  .phone-mini-row {
    display: flex; gap: 6px; margin-bottom: 10px;
  }
  .phone-mini {
    flex: 1; background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 8px;
  }
  .phone-mini-lbl { font-size: 6.5px; color: var(--text-dim); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px; }
  .phone-mini-val { font-size: 13px; font-weight: 800; }
  .phone-mini-val.green { color: var(--green); }
  .phone-mini-val.amber { color: var(--amber); }
  .phone-mini-val.red   { color: var(--red);   }
  .phone-row {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 10px; margin-bottom: 5px;
  }
  .phone-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .phone-row-text { flex: 1; font-size: 9px; font-weight: 600; color: var(--text); }
  .phone-row-sub { font-size: 8px; color: var(--text-dim); }
  .phone-row-badge { font-size: 8px; font-weight: 700; }
  .phone-nav {
    margin-top: auto; display: flex;
    border-top: 1px solid var(--border); padding-top: 8px;
  }
  .phone-nav-item {
    flex: 1; text-align: center;
    font-size: 8px; color: var(--text-dim);
  }
  .phone-nav-item.active { color: var(--accent); font-weight: 700; }

  /* Floating cards around phone */
  .float-card {
    position: absolute;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 12px 16px;
    box-shadow: 0 8px 32px rgba(26,21,20,0.08);
    font-size: 12px;
    white-space: nowrap;
  }
  .float-card .fc-val { font-size: 20px; font-weight: 800; }
  .float-card .fc-lbl { font-size: 10px; color: var(--text-dim); margin-top: 2px; }
  .float-1 { top: 12%; right: -20px; }
  .float-2 { bottom: 22%; left: -40px; }

  /* ── Trend tag ── */
  .trend-tag {
    position: absolute; top: -40px; right: 0;
    font-size: 11px; color: var(--text-dim);
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 20px; padding: 4px 12px;
  }

  /* ── Features ── */
  .features {
    max-width: 1080px; margin: 0 auto; padding: 120px 24px;
  }
  .features-eyebrow {
    text-align: center; font-size: 11px; font-weight: 700;
    letter-spacing: .14em; color: var(--accent); text-transform: uppercase;
    margin-bottom: 16px;
  }
  .features-heading {
    text-align: center; font-size: clamp(28px, 3.5vw, 42px);
    font-weight: 800; letter-spacing: -.025em; margin-bottom: 12px;
  }
  .features-sub {
    text-align: center; color: var(--text-dim); font-size: 17px;
    max-width: 500px; margin: 0 auto 64px;
  }
  .feature-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
    transition: transform .2s, box-shadow .2s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(26,21,20,0.07); }
  .feature-icon {
    width: 40px; height: 40px; background: var(--acc10);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 18px;
  }
  .feature-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: var(--text-dim); line-height: 1.6; }

  /* ── Metrics Banner ── */
  .metrics-band {
    background: var(--text); padding: 64px 24px;
  }
  .metrics-inner {
    max-width: 1080px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center;
  }
  .band-val { font-size: 36px; font-weight: 800; color: var(--bg); letter-spacing: -.02em; }
  .band-lbl { font-size: 13px; color: rgba(250,247,242,0.5); margin-top: 6px; }

  /* ── Screens Section ── */
  .screens-section {
    max-width: 1200px; margin: 0 auto; padding: 80px 24px 120px;
  }
  .screens-heading { font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 8px; letter-spacing: -.02em; }
  .screens-sub { text-align: center; color: var(--text-dim); margin-bottom: 48px; font-size: 16px; }
  .screens-row {
    display: flex; gap: 16px; overflow-x: auto;
    padding-bottom: 24px; justify-content: center;
    scrollbar-width: none;
  }
  .screen-thumb {
    flex-shrink: 0; width: 180px; height: 360px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden;
    display: flex; flex-direction: column;
    padding: 12px; font-size: 8px;
    box-shadow: 0 4px 20px rgba(26,21,20,0.06);
    transition: transform .2s;
  }
  .screen-thumb:hover { transform: translateY(-6px); }
  .screen-label { text-align: center; font-size: 11px; font-weight: 700; color: var(--text-dim); margin-top: 12px; }
  .st-bar { width: 100%; height: 3px; border-radius: 2px; margin: 3px 0; }
  .st-block { border-radius: 4px; margin: 3px 0; }
  .st-row { display: flex; gap: 4px; margin: 3px 0; }
  .st-mini { flex: 1; border-radius: 4px; }

  /* ── CTA Section ── */
  .cta-section {
    background: var(--bg2); border-top: 1px solid var(--border);
    padding: 100px 24px; text-align: center;
  }
  .cta-heading { font-size: clamp(30px, 4vw, 48px); font-weight: 800; letter-spacing: -.025em; margin-bottom: 16px; }
  .cta-heading em { font-style: normal; color: var(--accent); }
  .cta-sub { font-size: 17px; color: var(--text-dim); margin-bottom: 40px; max-width: 420px; margin-left: auto; margin-right: auto; }
  .cta-links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  /* ── Footer ── */
  footer {
    padding: 32px 40px; display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid var(--border); font-size: 12px; color: var(--text-dim);
  }
  .footer-logo { font-weight: 800; letter-spacing: .12em; color: var(--accent); }

  @media (max-width: 768px) {
    .hero-inner { grid-template-columns: 1fr; gap: 48px; }
    .phone-wrap { order: -1; }
    .float-1, .float-2 { display: none; }
    .feature-grid { grid-template-columns: 1fr; }
    .metrics-inner { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 0 20px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">CODA</div>
  <a href="https://ram.zenbin.org/coda-viewer" class="nav-cta">View Design ↗</a>
</nav>

<!-- ── Hero ── -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-inner">
    <div class="hero-left">
      <div class="hero-eyebrow"><span></span>Financial Intelligence</div>
      <h1 class="hero-headline">Know exactly<br>where you <em>stand</em>.</h1>
      <p class="hero-sub">
        CODA gives independent consultants a clear, calm view of their
        financial health — outstanding invoices, pipeline health, and
        month-close readiness, all in one place.
      </p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/coda-viewer" class="btn-primary">View Prototype →</a>
        <a href="https://ram.zenbin.org/coda-mock" class="btn-secondary">☀◑ Interactive Mock</a>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <div class="stat-val green">$24,750</div>
          <div class="stat-lbl">MTD Revenue</div>
        </div>
        <div class="stat">
          <div class="stat-val" style="color:var(--amber)">$8,450</div>
          <div class="stat-lbl">Outstanding</div>
        </div>
        <div class="stat">
          <div class="stat-val">72</div>
          <div class="stat-lbl">Portfolio Health</div>
        </div>
      </div>
    </div>

    <!-- Phone Mockup -->
    <div class="phone-wrap">
      <div class="trend-tag">Inspired by Midday.ai + Equals</div>
      <div class="phone">
        <div class="phone-screen">
          <div class="phone-status">
            <span>9:41</span><span style="color:var(--text-dim)">●●●</span>
          </div>
          <div class="phone-heading">Sunday, March 29</div>
          <div class="phone-date">Your Financial<br>Snapshot</div>
          <div class="phone-card">
            <div class="phone-card-lbl">Month-to-Date Revenue</div>
            <div class="phone-card-val">$24,750</div>
            <div class="phone-card-sub">↑ +12% vs last month</div>
          </div>
          <div class="phone-mini-row">
            <div class="phone-mini">
              <div class="phone-mini-lbl">Received</div>
              <div class="phone-mini-val green">$3,200</div>
            </div>
            <div class="phone-mini">
              <div class="phone-mini-lbl">Outstanding</div>
              <div class="phone-mini-val amber">$8,450</div>
            </div>
            <div class="phone-mini">
              <div class="phone-mini-lbl">Overdue</div>
              <div class="phone-mini-val red">$1,500</div>
            </div>
          </div>
          <div class="phone-row">
            <div class="phone-dot" style="background:var(--green)"></div>
            <div>
              <div class="phone-row-text">Acme Corp — INV-047</div>
              <div class="phone-row-sub">Payment received</div>
            </div>
            <div class="phone-row-badge" style="color:var(--green)">+$3,200</div>
          </div>
          <div class="phone-row">
            <div class="phone-dot" style="background:var(--amber)"></div>
            <div>
              <div class="phone-row-text">Studio Noir — INV-046</div>
              <div class="phone-row-sub">Due in 2 days</div>
            </div>
            <div class="phone-row-badge" style="color:var(--amber)">$4,800</div>
          </div>
          <div class="phone-nav">
            <div class="phone-nav-item active">Today</div>
            <div class="phone-nav-item">Clients</div>
            <div class="phone-nav-item">Pipeline</div>
            <div class="phone-nav-item">Invoice</div>
            <div class="phone-nav-item">Close</div>
          </div>
        </div>
      </div>
      <div class="float-card float-1">
        <div class="fc-val" style="color:var(--green)">$17,820</div>
        <div class="fc-lbl">March Net Income</div>
      </div>
      <div class="float-card float-2">
        <div class="fc-val">4</div>
        <div class="fc-lbl">Active Deals · $124K pipeline</div>
      </div>
    </div>
  </div>
</section>

<!-- ── Features ── -->
<section class="features">
  <div class="features-eyebrow">What CODA does</div>
  <h2 class="features-heading">Everything a solo consultant needs</h2>
  <p class="features-sub">No spreadsheets. No guesswork. Just your financial reality, clearly presented.</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">📊</div>
      <div class="feature-title">Daily Snapshot</div>
      <div class="feature-desc">Wake up to a clean summary: received today, outstanding, and overdue. Know your position before your first coffee.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🤝</div>
      <div class="feature-title">Client Health Scores</div>
      <div class="feature-desc">An algorithmic health score for each client — payment behavior, engagement, and revenue trend — so you can see trouble before it arrives.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📈</div>
      <div class="feature-title">Deal Pipeline</div>
      <div class="feature-desc">Track active proposals with close probability and weighted values. Know your next 90 days before they happen.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📄</div>
      <div class="feature-title">Invoice Intelligence</div>
      <div class="feature-desc">Create, send, and track invoices with line-item detail. Mark paid, send reminders, or export PDF — all from one screen.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✓</div>
      <div class="feature-title">Month Close</div>
      <div class="feature-desc">A structured checklist to close each month cleanly — expenses categorized, invoices reconciled, tax estimates updated.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">☀</div>
      <div class="feature-title">Light & Dark Modes</div>
      <div class="feature-desc">Warm cream paper for morning reviews. Switch to dark mode for late-night reconciliation. Your choice, always readable.</div>
    </div>
  </div>
</section>

<!-- ── Metrics Band ── -->
<section class="metrics-band">
  <div class="metrics-inner">
    <div>
      <div class="band-val">5</div>
      <div class="band-lbl">Screens designed</div>
    </div>
    <div>
      <div class="band-val" style="color:rgba(196,112,10,0.90)">LIGHT</div>
      <div class="band-lbl">Warm cream theme</div>
    </div>
    <div>
      <div class="band-val">3</div>
      <div class="band-lbl">Sites that inspired this</div>
    </div>
    <div>
      <div class="band-val">72%</div>
      <div class="band-lbl">Portfolio health score</div>
    </div>
  </div>
</section>

<!-- ── Screens ── -->
<section class="screens-section">
  <h2 class="screens-heading">Five screens. Zero confusion.</h2>
  <p class="screens-sub">Each screen answers one question clearly.</p>
  <div class="screens-row">
    ${[
      { label: 'Today',    accent: '#C4700A' },
      { label: 'Clients',  accent: '#2E6B4F' },
      { label: 'Pipeline', accent: '#C4700A' },
      { label: 'Invoice',  accent: '#1A1514' },
      { label: 'Close',    accent: '#2E6B4F' },
    ].map(s => `
    <div>
      <div class="screen-thumb">
        <div style="background:#FAF7F2;height:100%;border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;justify-content:space-between;font-size:7px;color:#9B9288;font-weight:600;margin-bottom:4px;">
            <span>9:41</span><span>●●●</span>
          </div>
          <div style="font-size:6px;color:#9B9288;letter-spacing:.08em;font-weight:700;text-transform:uppercase;">${s.label}</div>
          <div class="st-block" style="height:24px;background:${s.accent};border-radius:6px;"></div>
          <div class="st-row">
            <div class="st-mini" style="height:32px;background:#FFFFFF;border:1px solid #E0DAD0;"></div>
            <div class="st-mini" style="height:32px;background:#FFFFFF;border:1px solid #E0DAD0;"></div>
            <div class="st-mini" style="height:32px;background:#FFFFFF;border:1px solid #E0DAD0;"></div>
          </div>
          <div class="st-block" style="height:60px;background:#FFFFFF;border:1px solid #E0DAD0;"></div>
          <div class="st-block" style="height:40px;background:#FFFFFF;border:1px solid #E0DAD0;"></div>
          <div class="st-block" style="height:40px;background:#FFFFFF;border:1px solid #E0DAD0;"></div>
          <div style="margin-top:auto;border-top:1px solid #E0DAD0;padding-top:6px;display:flex;justify-content:space-around;">
            ${['Today','Clients','Pipeline','Invoice','Close'].map(n =>
              `<span style="font-size:6px;${n===s.label?`color:${s.accent};font-weight:700`:'color:#9B9288'}">${n}</span>`
            ).join('')}
          </div>
        </div>
      </div>
      <div class="screen-label">${s.label}</div>
    </div>`).join('')}
  </div>
</section>

<!-- ── CTA ── -->
<section class="cta-section">
  <h2 class="cta-heading">Ready to meet your<br><em>financial coda</em>?</h2>
  <p class="cta-sub">Browse the full interactive prototype or view the design in Pencil's canvas.</p>
  <div class="cta-links">
    <a href="https://ram.zenbin.org/coda-viewer" class="btn-primary">Open Prototype →</a>
    <a href="https://ram.zenbin.org/coda-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <div class="footer-logo">CODA</div>
  <div>Designed by RAM · March 29, 2026 · Inspired by Midday.ai &amp; Equals</div>
</footer>

</body>
</html>`;

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Hero
  console.log('1. Publishing hero page…');
  const heroRes = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log('   Hero:', heroRes.url || JSON.stringify(heroRes).slice(0,100));

  // 2. Viewer
  console.log('2. Publishing viewer…');
  const penJson = fs.readFileSync(path.join(__dirname, 'coda.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CODA — Pencil Design Viewer</title>
<script src="https://cdn.zenbin.org/pencil-viewer.js"><\/script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#FAF7F2; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  #viewer { width:390px; height:844px; border-radius:40px; overflow:hidden;
    box-shadow: 0 0 0 8px rgba(26,21,20,0.04), 0 40px 80px rgba(26,21,20,0.10); }
  .back-link { position:fixed; top:20px; left:20px; color:var(--accent); font-family:system-ui;
    font-size:14px; text-decoration:none; background:rgba(250,247,242,0.92);
    padding:8px 16px; border-radius:20px; border:1px solid rgba(196,112,10,0.20);
    font-weight:700; color:#C4700A; }
</style>
</head>
<body>
<a class="back-link" href="https://ram.zenbin.org/coda">← CODA</a>
<div id="viewer"></div>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#viewer', window.EMBEDDED_PEN);
    }
  });
<\/script>
</body>
</html>`;

  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP} — Design Viewer`);
  console.log('   Viewer:', viewerRes.url || JSON.stringify(viewerRes).slice(0,100));

  // 3. Gallery queue
  console.log('3. Updating gallery queue…');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  function ghReq(opts, body) {
    return new Promise((resolve, reject) => {
      const r = https.request(opts, res => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      r.on('error', reject);
      if (body) r.write(body);
      r.end();
    });
  }

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    }
  });
  const fileData  = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent':    'ram-heartbeat/1.0',
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':        'application/vnd.github.v3+json',
    }
  }, putBody);
  console.log('   Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

  console.log('\n✓ Pipeline complete!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(console.error);
