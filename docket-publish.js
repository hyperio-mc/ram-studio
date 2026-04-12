#!/usr/bin/env node
// DOCKET — Hero page + viewer publisher

const fs   = require('fs');
const https = require('https');

const SLUG     = 'docket';
const APP_NAME = 'DOCKET';
const TAGLINE  = 'Documents that think with you.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DOCKET — Documents that think with you.</title>
  <meta name="description" content="DOCKET is an AI-powered document intelligence platform for legal professionals. Clause analysis, risk scoring, smart drafting, and a searchable clause library.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #FAF7F1;
      --surface: #FFFFFF;
      --surface-alt: #F2EFE8;
      --text:    #1A1714;
      --muted:   rgba(26,23,20,0.42);
      --muted2:  rgba(26,23,20,0.22);
      --accent:  #C95A2C;
      --accent2: #3B5E45;
      --accent-soft: rgba(201,90,44,0.08);
      --accent2-soft: rgba(59,94,69,0.08);
      --border:  rgba(26,23,20,0.08);
      --border-strong: rgba(26,23,20,0.15);
      --border-accent: rgba(201,90,44,0.22);
      --green: #2F7A54; --amber: #B07020; --red: #B84040;
      --green-soft: rgba(47,122,84,0.10);
      --amber-soft: rgba(176,112,32,0.10);
      --red-soft:   rgba(184,64,64,0.10);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', system-ui, sans-serif;
      line-height: 1.6; min-height: 100vh; overflow-x: hidden;
    }
    /* Warm blob accent */
    body::after {
      content: ''; position: fixed; top: -180px; right: -200px;
      width: 700px; height: 700px; border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(201,90,44,0.10) 0%, rgba(201,90,44,0.04) 50%, transparent 75%);
      pointer-events: none; z-index: 0;
    }
    a { color: var(--accent); text-decoration: none; }

    /* NAV */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(250,247,241,0.88); backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px; height: 56px;
    }
    .nav-brand {
      font-family: 'Lora', Georgia, serif; font-weight: 700;
      font-size: 17px; letter-spacing: 0.04em; color: var(--text);
      display: flex; align-items: center; gap: 10px;
    }
    .nav-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
    .nav-links { display: flex; gap: 32px; font-size: 13px; color: var(--muted); font-weight: 500; }
    .nav-links span:hover { color: var(--text); cursor: pointer; }
    .nav-cta {
      background: var(--text); color: var(--bg); border: none;
      border-radius: 8px; padding: 9px 22px; font-size: 13px;
      font-weight: 600; cursor: pointer; letter-spacing: 0.01em;
      transition: background 0.15s, transform 0.15s;
    }
    .nav-cta:hover { background: var(--accent); transform: translateY(-1px); }

    /* HERO */
    .hero {
      position: relative; z-index: 1;
      padding: 148px 48px 80px; max-width: 1120px; margin: 0 auto;
    }
    .hero-inner {
      display: grid; grid-template-columns: 1fr 420px; gap: 80px; align-items: center;
    }
    .hero-eyebrow {
      font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
      color: var(--accent); text-transform: uppercase;
      margin-bottom: 20px;
      display: flex; align-items: center; gap: 10px;
    }
    .hero-eyebrow::before {
      content: ''; display: block; width: 28px; height: 1px; background: var(--accent);
    }
    h1 {
      font-family: 'Lora', Georgia, serif;
      font-size: clamp(38px, 5vw, 60px); font-weight: 700; line-height: 1.12;
      letter-spacing: -0.02em; color: var(--text); margin-bottom: 24px;
    }
    h1 em { color: var(--accent); font-style: italic; }
    .hero-sub {
      font-size: 16px; color: var(--muted); max-width: 480px;
      line-height: 1.7; margin-bottom: 40px;
    }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .btn-primary {
      background: var(--accent); color: #fff; border: none;
      border-radius: 9px; padding: 13px 28px; font-size: 14px;
      font-weight: 700; cursor: pointer; letter-spacing: 0.01em;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,90,44,0.30); }
    .btn-ghost {
      background: transparent; color: var(--text);
      border: 1px solid var(--border-strong);
      border-radius: 9px; padding: 13px 28px; font-size: 14px;
      font-weight: 600; cursor: pointer;
      transition: border-color 0.15s;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

    /* HERO CARD */
    .hero-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 28px; position: relative;
      box-shadow: 0 4px 40px rgba(26,23,20,0.08), 0 1px 3px rgba(26,23,20,0.06);
    }
    .card-matter-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 20px;
    }
    .card-matter-num {
      font-family: 'Lora', Georgia, serif; font-size: 11px;
      color: var(--muted); font-style: italic; letter-spacing: 0.06em;
    }
    .card-matter-client { font-weight: 700; font-size: 15px; margin-top: 4px; }
    .card-matter-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .risk-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 100px;
      background: var(--red-soft); border: 1px solid rgba(184,64,64,0.20);
      font-size: 11px; font-weight: 700; color: var(--red); letter-spacing: 0.06em;
      white-space: nowrap;
    }
    .risk-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--red); }
    .ai-pullquote {
      background: var(--surface-alt); border-left: 3px solid var(--red);
      border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 18px;
      font-size: 12px; line-height: 1.55; color: var(--text);
    }
    .ai-pullquote-source {
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      color: var(--muted); margin-top: 8px;
    }
    .clause-flag {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 14px; border-radius: 10px;
      background: var(--bg); border: 1px solid var(--border);
      margin-bottom: 8px;
    }
    .clause-flag-badge {
      font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 5px;
      white-space: nowrap; flex-shrink: 0; margin-top: 1px;
    }
    .badge-high   { background: var(--red-soft);   color: var(--red);   border: 1px solid rgba(184,64,64,0.18); }
    .badge-medium { background: var(--amber-soft);  color: var(--amber); border: 1px solid rgba(176,112,32,0.18); }
    .badge-green  { background: var(--green-soft);  color: var(--green); border: 1px solid rgba(47,122,84,0.18); }
    .clause-flag-body { flex: 1; min-width: 0; }
    .clause-flag-title { font-size: 12px; font-weight: 700; }
    .clause-flag-section { font-size: 10px; color: var(--accent); font-weight: 600; }

    /* METRICS STRIP */
    .metrics-strip {
      position: relative; z-index: 1;
      display: grid; grid-template-columns: repeat(4, 1fr);
      border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    }
    .metric-item {
      padding: 44px 40px; text-align: center;
      border-right: 1px solid var(--border);
    }
    .metric-item:last-child { border-right: none; }
    .metric-num {
      font-family: 'Lora', Georgia, serif;
      font-size: clamp(32px, 4vw, 44px); font-weight: 700; color: var(--accent);
      letter-spacing: -0.02em;
    }
    .metric-lbl { font-size: 11px; font-weight: 600; color: var(--muted);
      margin-top: 6px; letter-spacing: 0.08em; text-transform: uppercase; }

    /* FEATURES */
    .section { position: relative; z-index: 1; padding: 80px 48px; max-width: 1120px; margin: 0 auto; }
    .section-number {
      font-family: 'Lora', Georgia, serif; font-size: 11px; font-style: italic;
      color: var(--muted); letter-spacing: 0.06em; margin-bottom: 8px;
    }
    .section-eyebrow {
      font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
      color: var(--accent); text-transform: uppercase;
      margin-bottom: 16px;
    }
    .section-title {
      font-family: 'Lora', Georgia, serif;
      font-size: clamp(26px, 3.5vw, 38px); font-weight: 700;
      line-height: 1.2; letter-spacing: -0.01em; margin-bottom: 16px;
    }
    .section-sub { font-size: 15px; color: var(--muted); max-width: 500px; line-height: 1.7; }

    /* EDITORIAL RULE */
    .editorial-rule {
      position: relative; z-index: 1;
      max-width: 1120px; margin: 0 auto; padding: 0 48px;
      display: flex; align-items: center; gap: 20px;
    }
    .editorial-rule-num {
      font-family: 'Lora', Georgia, serif; font-style: italic;
      font-size: 11px; color: var(--muted); white-space: nowrap; letter-spacing: 0.06em;
    }
    .editorial-rule-line { flex: 1; height: 1px; background: var(--border); }
    .editorial-rule-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
      color: var(--muted); text-transform: uppercase; white-space: nowrap;
    }

    .features-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 2px; margin-top: 48px;
      border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
    }
    .feature-card {
      background: var(--surface); padding: 32px 28px;
      border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
      transition: background 0.15s;
    }
    .feature-card:nth-child(3n) { border-right: none; }
    .feature-card:nth-last-child(-n+3) { border-bottom: none; }
    .feature-card:hover { background: var(--surface-alt); }
    .feature-num {
      font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 700;
      color: var(--muted2); letter-spacing: -0.02em; margin-bottom: 16px;
      line-height: 1;
    }
    .feature-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
    .feature-body { font-size: 13px; color: var(--muted); line-height: 1.65; }

    /* MATTER LIST DEMO */
    .matter-demo {
      position: relative; z-index: 1; max-width: 680px; margin: 0 auto 80px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; overflow: hidden;
      box-shadow: 0 4px 40px rgba(26,23,20,0.07);
    }
    .matter-demo-header {
      padding: 20px 24px; border-bottom: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
    }
    .matter-demo-title {
      font-size: 11px; font-weight: 700; letter-spacing: 0.10em;
      color: var(--muted); text-transform: uppercase;
    }
    .matter-demo-num {
      font-family: 'Lora', Georgia, serif; font-style: italic;
      font-size: 11px; color: var(--muted);
    }
    .matter-row {
      padding: 16px 24px; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 16px;
    }
    .matter-row:last-child { border-bottom: none; }
    .matter-row:hover { background: var(--bg); }
    .matter-index {
      font-family: 'Lora', Georgia, serif; font-size: 13px; font-weight: 700;
      color: var(--muted2); width: 36px; flex-shrink: 0;
    }
    .matter-info { flex: 1; min-width: 0; }
    .matter-client { font-size: 13px; font-weight: 700; }
    .matter-name { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .matter-status {
      font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 100px;
      letter-spacing: 0.05em; white-space: nowrap;
    }
    .status-red    { background: var(--red-soft);   color: var(--red);   border: 1px solid rgba(184,64,64,0.15); }
    .status-amber  { background: var(--amber-soft);  color: var(--amber); border: 1px solid rgba(176,112,32,0.15); }
    .status-green  { background: var(--green-soft);  color: var(--green); border: 1px solid rgba(47,122,84,0.15); }
    .matter-docs { font-size: 11px; color: var(--muted); text-align: right; white-space: nowrap; }

    /* CLAUSE LIBRARY DEMO */
    .clause-demo {
      position: relative; z-index: 1; max-width: 860px; margin: 0 auto 80px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    }
    .clause-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 24px;
      box-shadow: 0 2px 16px rgba(26,23,20,0.05);
    }
    .clause-card-num {
      font-family: 'Lora', Georgia, serif; font-size: 10px; font-style: italic;
      color: var(--muted); margin-bottom: 8px; letter-spacing: 0.06em;
    }
    .clause-card-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
    .clause-card-excerpt {
      font-size: 12px; color: var(--muted); line-height: 1.6; margin-bottom: 14px;
    }
    .clause-card-footer {
      display: flex; align-items: center; justify-content: space-between;
    }
    .clause-tag {
      font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 5px;
      letter-spacing: 0.05em;
    }
    .clause-usage { font-size: 11px; color: var(--muted); }

    /* CTA SECTION */
    .cta-section {
      position: relative; z-index: 1;
      text-align: center; padding: 100px 48px;
      background: var(--surface-alt);
      border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    }
    .cta-section h2 {
      font-family: 'Lora', Georgia, serif;
      font-size: clamp(28px, 4vw, 46px); font-weight: 700;
      letter-spacing: -0.01em; margin-bottom: 16px;
    }
    .cta-section p { font-size: 16px; color: var(--muted); margin-bottom: 40px; }

    /* FOOTER */
    footer {
      position: relative; z-index: 1;
      padding: 32px 48px;
      display: flex; align-items: center; justify-content: space-between;
      font-size: 12px; color: var(--muted);
      border-top: 1px solid var(--border);
    }
    .footer-brand {
      font-family: 'Lora', Georgia, serif; font-weight: 700;
      font-size: 16px; color: var(--text); letter-spacing: 0.04em;
    }

    @media (max-width: 900px) {
      .hero-inner { grid-template-columns: 1fr; }
      .hero-card { display: none; }
      .metrics-strip { grid-template-columns: repeat(2, 1fr); }
      .features-grid { grid-template-columns: 1fr; }
      .clause-demo { grid-template-columns: 1fr; }
      nav { padding: 0 20px; }
      .hero, .section { padding-left: 20px; padding-right: 20px; }
      .editorial-rule { padding: 0 20px; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-brand"><div class="nav-dot"></div> DOCKET</div>
    <div class="nav-links">
      <span>Features</span>
      <span>Matters</span>
      <span>Clauses</span>
      <span>Pricing</span>
    </div>
    <button class="nav-cta">Start Free Trial</button>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-left">
        <div class="hero-eyebrow">AI Document Intelligence</div>
        <h1>Documents that<br><em>think</em> with you.</h1>
        <p class="hero-sub">
          DOCKET scans your legal documents, flags risky clauses, and suggests
          improvements — so you spend less time reviewing and more time advising.
        </p>
        <div class="hero-actions">
          <button class="btn-primary">Start Free Trial</button>
          <button class="btn-ghost">View the Design →</button>
        </div>
      </div>
      <div class="hero-card">
        <div class="card-matter-header">
          <div>
            <div class="card-matter-num">Matter · 004</div>
            <div class="card-matter-client">Thorne Industries</div>
            <div class="card-matter-sub">Supplier Framework Agreement</div>
          </div>
          <div class="risk-pill">
            <div class="risk-pill-dot"></div>HIGH RISK
          </div>
        </div>
        <div class="ai-pullquote">
          "The indemnification clause in §7.2 creates disproportionate liability exposure — recommend negotiation or carve-out."
          <div class="ai-pullquote-source">DOCKET AI · Clause Analysis</div>
        </div>
        <div class="clause-flag">
          <div class="clause-flag-badge badge-high">HIGH</div>
          <div class="clause-flag-body">
            <div class="clause-flag-section">§7.2 · Liability</div>
            <div class="clause-flag-title">Indemnification — Uncapped</div>
          </div>
        </div>
        <div class="clause-flag">
          <div class="clause-flag-badge badge-medium">REVIEW</div>
          <div class="clause-flag-body">
            <div class="clause-flag-section">§12.1 · Termination</div>
            <div class="clause-flag-title">7-Day Termination Notice</div>
          </div>
        </div>
        <div class="clause-flag">
          <div class="clause-flag-badge badge-medium">REVIEW</div>
          <div class="clause-flag-body">
            <div class="clause-flag-section">§4.4 · Exclusivity</div>
            <div class="clause-flag-title">Exclusivity Window — Undefined Scope</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- METRICS STRIP -->
  <div class="metrics-strip">
    <div class="metric-item">
      <div class="metric-num">12k+</div>
      <div class="metric-lbl">Clauses Analysed</div>
    </div>
    <div class="metric-item">
      <div class="metric-num">94%</div>
      <div class="metric-lbl">Risk Detection Accuracy</div>
    </div>
    <div class="metric-item">
      <div class="metric-num">3.4h</div>
      <div class="metric-lbl">Saved Per Document</div>
    </div>
    <div class="metric-item">
      <div class="metric-num">341</div>
      <div class="metric-lbl">Clause Library Average</div>
    </div>
  </div>

  <!-- MATTER LIST DEMO -->
  <div style="position:relative;z-index:1;padding:80px 48px 40px;max-width:1120px;margin:0 auto;">
    <div class="section-eyebrow" style="margin-bottom:12px;">Matter Queue</div>
    <div style="font-family:'Lora',Georgia,serif;font-size:clamp(22px,3vw,32px);font-weight:700;margin-bottom:40px;letter-spacing:-0.01em;">All your active matters,<br>at a glance.</div>
  </div>
  <div class="matter-demo" style="max-width:680px;margin:0 auto 80px;">
    <div class="matter-demo-header">
      <div class="matter-demo-title">01 — Matter Queue</div>
      <div class="matter-demo-num">4 active</div>
    </div>
    <div class="matter-row">
      <div class="matter-index">001</div>
      <div class="matter-info">
        <div class="matter-client">Harmon & Reeves Ltd.</div>
        <div class="matter-name">Commercial Lease Review</div>
      </div>
      <div class="matter-status status-amber">Needs Review</div>
      <div class="matter-docs">3 docs</div>
    </div>
    <div class="matter-row">
      <div class="matter-index">002</div>
      <div class="matter-info">
        <div class="matter-client">Bellfield Capital</div>
        <div class="matter-name">Series B Term Sheet</div>
      </div>
      <div class="matter-status status-green">In Draft</div>
      <div class="matter-docs">5 docs</div>
    </div>
    <div class="matter-row">
      <div class="matter-index">003</div>
      <div class="matter-info">
        <div class="matter-client">Voss Pharmaceuticals</div>
        <div class="matter-name">NDA — Research Partnership</div>
      </div>
      <div class="matter-status status-green">Client Review</div>
      <div class="matter-docs">2 docs</div>
    </div>
    <div class="matter-row">
      <div class="matter-index">004</div>
      <div class="matter-info">
        <div class="matter-client">Thorne Industries</div>
        <div class="matter-name">Supplier Framework Agreement</div>
      </div>
      <div class="matter-status status-red">Flagged Clauses</div>
      <div class="matter-docs">4 docs</div>
    </div>
  </div>

  <!-- EDITORIAL RULE -->
  <div class="editorial-rule" style="margin-bottom:40px;">
    <span class="editorial-rule-num">02</span>
    <div class="editorial-rule-line"></div>
    <span class="editorial-rule-label">Clause Library</span>
  </div>

  <!-- CLAUSE DEMO -->
  <div style="position:relative;z-index:1;padding:0 48px 40px;max-width:1120px;margin:0 auto;">
    <div style="font-family:'Lora',Georgia,serif;font-size:clamp(22px,3vw,32px);font-weight:700;margin-bottom:40px;letter-spacing:-0.01em;">341 clauses. All yours.<br><em style="color:var(--accent);">Instantly searchable.</em></div>
  </div>
  <div class="clause-demo">
    <div class="clause-card">
      <div class="clause-card-num">C·001 · Saved 14 times</div>
      <div class="clause-card-title">Standard Limitation of Liability</div>
      <div class="clause-card-excerpt">In no event shall either party be liable for indirect, incidental, special or consequential damages…</div>
      <div class="clause-card-footer">
        <span class="clause-tag badge-high">Liability</span>
        <span class="clause-usage">Last used Mar 28</span>
      </div>
    </div>
    <div class="clause-card">
      <div class="clause-card-num">C·002 · Saved 27 times</div>
      <div class="clause-card-title">Mutual NDA — Standard Form</div>
      <div class="clause-card-excerpt">Each party agrees to hold in confidence all Confidential Information received from the other party…</div>
      <div class="clause-card-footer">
        <span class="clause-tag badge-green">Confidential</span>
        <span class="clause-usage">Last used Apr 1</span>
      </div>
    </div>
    <div class="clause-card">
      <div class="clause-card-num">C·003 · Saved 9 times</div>
      <div class="clause-card-title">IP Ownership — Work for Hire</div>
      <div class="clause-card-excerpt">All work product created by Supplier under this Agreement shall be considered works made for hire…</div>
      <div class="clause-card-footer">
        <span class="clause-tag badge-medium">IP</span>
        <span class="clause-usage">Last used Mar 15</span>
      </div>
    </div>
    <div class="clause-card">
      <div class="clause-card-num">C·004 · Saved 19 times</div>
      <div class="clause-card-title">30-Day Termination Notice</div>
      <div class="clause-card-excerpt">Either party may terminate this Agreement upon thirty (30) days written notice to the other party…</div>
      <div class="clause-card-footer">
        <span class="clause-tag badge-medium">Termination</span>
        <span class="clause-usage">Last used Apr 2</span>
      </div>
    </div>
  </div>

  <!-- FEATURES -->
  <div class="editorial-rule" style="margin:60px auto 0;margin-bottom:40px;">
    <span class="editorial-rule-num">03</span>
    <div class="editorial-rule-line"></div>
    <span class="editorial-rule-label">Features</span>
  </div>
  <section class="section" style="padding-top:20px;">
    <div class="section-title">Everything a careful lawyer<br>needs in one place.</div>
    <p class="section-sub" style="margin-bottom:0;">DOCKET handles the scan. You handle the strategy.</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-num">01</div>
        <div class="feature-title">AI Clause Scanning</div>
        <div class="feature-body">Upload any document. DOCKET parses every clause, flags risks, and assigns severity scores in seconds.</div>
      </div>
      <div class="feature-card">
        <div class="feature-num">02</div>
        <div class="feature-title">Risk Scoring</div>
        <div class="feature-body">Each matter receives a 0–100 risk score. Drill down to individual clauses that are driving exposure.</div>
      </div>
      <div class="feature-card">
        <div class="feature-num">03</div>
        <div class="feature-title">Smart Drafting</div>
        <div class="feature-body">Build documents section by section. AI suggests standard clauses from your personal library as you draft.</div>
      </div>
      <div class="feature-card">
        <div class="feature-num">04</div>
        <div class="feature-title">Clause Library</div>
        <div class="feature-body">Every clause you've ever used, searchable and tagged. Reuse your best work with one click.</div>
      </div>
      <div class="feature-card">
        <div class="feature-num">05</div>
        <div class="feature-title">Matter Tracking</div>
        <div class="feature-body">12 matters, 60 documents, zero confusion. DOCKET tracks status, due dates, and document health per client.</div>
      </div>
      <div class="feature-card">
        <div class="feature-num">06</div>
        <div class="feature-title">Editorial Reports</div>
        <div class="feature-body">Export AI briefs as clean, print-ready PDFs with your branding — ready to share with clients.</div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <div class="cta-section">
    <h2>Start reviewing faster.<br>Start advising better.</h2>
    <p>Free for solo practitioners. No credit card required.</p>
    <button class="btn-primary" style="font-size:15px;padding:15px 36px;">Open Your First Matter →</button>
  </div>

  <footer>
    <div class="footer-brand">DOCKET</div>
    <div style="font-style:italic;font-family:'Lora',Georgia,serif;font-size:12px;">AI document intelligence for legal professionals.</div>
    <div>Designed by RAM · <a href="https://ram.zenbin.org/docket" style="color:var(--muted);">ram.zenbin.org/docket</a> · © 2026</div>
  </footer>
</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/docket.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return post('zenbin.org', `/v1/pages/${slug}`, { 'X-Subdomain': SUBDOMAIN }, body);
}

(async () => {
  console.log('Publishing DOCKET hero page…');
  const r1 = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,200));

  console.log('Publishing DOCKET viewer…');
  const r2 = await zenPut(`${SLUG}-viewer`, `${APP_NAME} Viewer`, viewerHtml);
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,200));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
