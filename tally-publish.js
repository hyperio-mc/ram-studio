// tally-publish.js — Full Design Discovery pipeline for TALLY
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG      = 'tally';
const APP_NAME  = 'Tally';
const TAGLINE   = 'Financial clarity for indie founders';
const ARCHETYPE = 'fintech-dashboard-founders';

const ORIGINAL_PROMPT = `Design TALLY — a financial operating system for indie founders.
Inspired by:
1. land-book.com "Equals GTM Analytics" — editorial data density, clean table/grid UI, monospaced numbers
2. darkmodedesign.com "Midday" — business stack for founders, bento feature grid, dashboard OS
3. awwwards.com "Artefakt" (Honorable Mention Mar 2026) — ASCII-influenced typographic elements, monospaced aesthetics

Theme: LIGHT — warm parchment background (#F4F0E6), forest green accent (#1A6B4A), tabular monospace numbers,
bento metric grid, horizontal stacked revenue bars, editorial column layout.
5 screens: Overview · Transaction Ledger · Runway Planner · P&L Report · AI Insights`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function get_(host, path_) {
  return httpsReq({ hostname: host, path: path_, method: 'GET', headers: { 'User-Agent': 'ram/1.0' } });
}

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${APP_NAME} Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

async function updateGalleryQueue(designUrl, mockUrl) {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const now = new Date().toISOString();
  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   designUrl,
    mock_url:     mockUrl,
    submitted_at: now,
    published_at: now,
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120);
}

// ── Light-theme design palette ─────────────────────────────────────────────────
const P = {
  bg:       '#F4F0E6',
  bg2:      '#EDE8D8',
  surface:  '#FFFFFF',
  text:     '#1B1916',
  muted:    'rgba(27,25,22,0.52)',
  dim:      'rgba(27,25,22,0.28)',
  accent:   '#1A6B4A',
  accentS:  'rgba(26,107,74,0.09)',
  accent2:  '#B84C2A',
  accent3:  '#2B4D8E',
  green:    '#E6F4EE',
  amber:    '#FAEBE4',
  blue:     '#E8EEF9',
  border:   '#DDD7C8',
  borderS:  'rgba(221,215,200,0.8)',
  mono:     '"Fira Code", "JetBrains Mono", "Courier New", monospace',
};

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      ${P.bg};
    --bg2:     ${P.bg2};
    --surface: ${P.surface};
    --text:    ${P.text};
    --muted:   ${P.muted};
    --dim:     ${P.dim};
    --accent:  ${P.accent};
    --accentS: ${P.accentS};
    --accent2: ${P.accent2};
    --accent3: ${P.accent3};
    --green:   ${P.green};
    --amber:   ${P.amber};
    --blue:    ${P.blue};
    --border:  ${P.border};
    --mono:    ${P.mono};
  }

  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', system-ui, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
  }

  .mono { font-family: var(--mono); }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: rgba(244,240,230,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-size: 12px; font-weight: 800; letter-spacing: 4px;
    color: var(--accent); text-decoration: none;
  }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 8px 20px; border-radius: 100px; font-size: 13px; font-weight: 700;
    text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: .85; }

  /* ── Hero ── */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 100px 24px 72px;
    position: relative; overflow: hidden;
  }
  /* Paper grid overlay */
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(26,107,74,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,107,74,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .hero::after {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 70% 60% at 50% 50%, rgba(244,240,230,0) 0%, var(--bg) 70%);
  }
  .hero-inner { position: relative; z-index: 1; max-width: 680px; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 10px; font-weight: 700; letter-spacing: 3px;
    color: var(--accent);
    border: 1px solid rgba(26,107,74,0.25);
    padding: 5px 16px; border-radius: 100px;
    margin-bottom: 32px;
    background: var(--accentS);
  }
  .hero-eyebrow::before { content: '✦'; font-size: 8px; }
  .hero h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(44px, 7vw, 72px); font-weight: 700; line-height: 1.1;
    color: var(--text); margin-bottom: 8px;
  }
  .hero h1 span { display: block; font-style: italic; color: var(--accent); }
  .hero-sub {
    font-size: 17px; color: var(--muted); max-width: 460px; margin: 20px auto 40px; line-height: 1.75;
  }
  .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-p {
    background: var(--accent); color: #fff;
    padding: 13px 30px; border-radius: 100px; font-size: 14px; font-weight: 700;
    text-decoration: none; transition: opacity .2s;
  }
  .btn-p:hover { opacity: .85; }
  .btn-w {
    border: 1px solid var(--border); color: var(--text); background: var(--surface);
    padding: 12px 30px; border-radius: 100px; font-size: 14px; font-weight: 500;
    text-decoration: none; transition: border-color .2s, color .2s;
  }
  .btn-w:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Floating metrics band ── */
  .metrics-band {
    max-width: 860px; margin: 0 auto 80px; padding: 0 24px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px; background: var(--border);
    border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
  }
  .metric-cell {
    background: var(--surface); padding: 28px 24px; text-align: center;
  }
  .metric-val {
    font-family: var(--mono); font-size: 28px; font-weight: 700; color: var(--text); line-height: 1;
    margin-bottom: 6px;
  }
  .metric-val.green { color: var(--accent); }
  .metric-val.amber { color: var(--accent2); }
  .metric-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: var(--muted); }

  .section-label {
    font-family: var(--mono); font-size: 10px; font-weight: 700; letter-spacing: 3px;
    color: var(--accent); margin-bottom: 12px;
  }

  /* ── Features ── */
  section { padding: 80px 24px; max-width: 1060px; margin: 0 auto; }
  .section-header { margin-bottom: 48px; }
  .section-header.center { text-align: center; }
  .section-header h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(28px, 4vw, 44px); font-weight: 700; color: var(--text); margin-bottom: 12px; line-height: 1.2;
  }
  .section-header p { color: var(--muted); font-size: 15px; max-width: 440px; }
  .section-header.center p { margin: 0 auto; }

  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px;
    transition: border-color .25s, transform .25s;
  }
  .feature-card:hover { border-color: rgba(26,107,74,0.3); transform: translateY(-2px); }
  .feat-icon {
    width: 46px; height: 46px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
  .feature-card p  { color: var(--muted); font-size: 13.5px; line-height: 1.65; }

  /* ── Data showcase ── */
  .data-showcase {
    background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start;
    max-width: 1000px; margin: 0 auto 80px;
  }
  .data-left h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 34px; font-weight: 700; color: var(--text); line-height: 1.25; margin-bottom: 16px;
  }
  .data-left h2 em { font-style: italic; color: var(--accent); }
  .data-left p { color: var(--muted); font-size: 14.5px; line-height: 1.7; margin-bottom: 24px; }
  .data-table { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; font-size: 13px; }
  .dt-header {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    background: var(--bg2); padding: 10px 16px;
    font-family: var(--mono); font-size: 9px; font-weight: 700; letter-spacing: 1px; color: var(--muted);
  }
  .dt-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 10px 16px; border-top: 1px solid var(--border);
    align-items: center;
  }
  .dt-row:nth-child(even) { background: rgba(244,240,230,0.5); }
  .dt-row span { font-size: 12px; color: var(--text); }
  .dt-row span.mono { font-family: var(--mono); }
  .dt-row span.pos { color: var(--accent); font-weight: 700; }
  .dt-row span.neg { color: var(--accent2); font-weight: 700; }
  .dt-tag {
    display: inline-block; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 3px;
  }

  /* ── Screens ── */
  .screen-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
  .screen-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 22px 16px;
    transition: border-color .25s;
  }
  .screen-card:hover { border-color: var(--accent); }
  .screen-num { font-family: var(--mono); font-size: 10px; font-weight: 700; color: var(--accent);
    letter-spacing: 2px; margin-bottom: 8px; }
  .screen-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 6px; color: var(--text); }
  .screen-card p  { font-size: 11.5px; color: var(--muted); line-height: 1.5; }

  /* ── AI showcase ── */
  .ai-card {
    background: linear-gradient(135deg, rgba(26,107,74,0.06) 0%, rgba(43,77,142,0.04) 100%);
    border: 1px solid rgba(26,107,74,0.2);
    border-radius: 20px; padding: 40px;
    max-width: 900px; margin: 0 auto 80px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
  }
  .ai-left h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 34px; font-weight: 700; color: var(--text); line-height: 1.2; margin-bottom: 14px;
  }
  .ai-left h2 em { font-style: italic; color: var(--accent); }
  .ai-left p { color: var(--muted); font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
  .insight-list { display: flex; flex-direction: column; gap: 12px; }
  .insight-item {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;
    display: flex; gap: 12px; align-items: flex-start;
  }
  .ins-icon {
    width: 28px; height: 28px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; font-size: 12px;
    flex-shrink: 0;
  }
  .insight-item h4 { font-size: 12px; font-weight: 700; margin-bottom: 3px; color: var(--text); }
  .insight-item p  { font-size: 11px; color: var(--muted); line-height: 1.4; }

  /* ── CTA ── */
  .cta-wrap { max-width: 680px; margin: 0 auto 80px; padding: 0 24px; text-align: center; }
  .cta-block {
    background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 56px 40px;
  }
  .cta-block h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 34px; font-weight: 700; color: var(--text); line-height: 1.25; margin-bottom: 14px;
  }
  .cta-block h2 em { font-style: italic; color: var(--accent); }
  .cta-block p { color: var(--muted); font-size: 15px; margin-bottom: 28px; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 36px 24px; text-align: center;
    color: var(--muted); font-size: 13px;
  }
  footer a { color: var(--accent); text-decoration: none; }
  footer a:hover { text-decoration: underline; }
  .footer-logo { font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: 3px; color: var(--accent); margin-bottom: 10px; }

  @media (max-width: 700px) {
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    .metrics-band { grid-template-columns: repeat(2, 1fr); }
    .data-showcase, .ai-card { grid-template-columns: 1fr; }
    .screen-grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>

<nav>
  <a href="/" class="nav-logo">TALLY</a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#ai">AI Insights</a></li>
  </ul>
  <a href="/${SLUG}-mock" class="nav-cta">Try Mock →</a>
</nav>

<!-- Hero -->
<section class="hero" style="padding-top:100px">
  <div class="hero-inner">
    <div class="hero-eyebrow">FINANCIAL OS FOR INDIE FOUNDERS</div>
    <h1>Your numbers,
      <span>finally clear</span>
    </h1>
    <p class="hero-sub">
      MRR, runway, P&amp;L, and AI-powered insights —
      all in one clean, parchment-warm interface built for founders who run lean.
    </p>
    <div class="hero-actions">
      <a href="/${SLUG}-viewer" class="btn-p">View Prototype →</a>
      <a href="/${SLUG}-mock" class="btn-w">Interactive Mock ☀◑</a>
    </div>
  </div>
</section>

<!-- Metrics band -->
<div class="metrics-band">
  <div class="metric-cell">
    <div class="metric-val green mono">$24,180</div>
    <div class="metric-label">MRR</div>
  </div>
  <div class="metric-cell">
    <div class="metric-val mono">$290K</div>
    <div class="metric-label">ARR</div>
  </div>
  <div class="metric-cell">
    <div class="metric-val mono">22mo</div>
    <div class="metric-label">RUNWAY</div>
  </div>
  <div class="metric-cell">
    <div class="metric-val amber mono">1.8%</div>
    <div class="metric-label">CHURN</div>
  </div>
</div>

<!-- Features -->
<section id="features">
  <div class="section-header center">
    <div class="section-label">CORE FEATURES</div>
    <h2>Built for the one-person CFO</h2>
    <p>Every number you need to run a profitable, sustainable indie business.</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--green)">◈</div>
      <h3>Live MRR Dashboard</h3>
      <p>Real-time revenue breakdown by tier, 7-month sparkline trend, and delta against last month — updated as Stripe webhooks arrive.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--blue)">≡</div>
      <h3>Transaction Ledger</h3>
      <p>Every Stripe payout, AWS invoice, and payroll run in one tabular ledger. Color-coded by category, searchable, filterable.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--blue)">◐</div>
      <h3>Runway Planner</h3>
      <p>Cash projection through 12 months. Toggle Base, Bull, Bear scenarios. Adjust growth rate and burn with live sliders.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--amber)">⊞</div>
      <h3>P&amp;L Report</h3>
      <p>Quarterly income statement with QoQ delta column. Net revenue, OpEx breakdown, profit margin — all in a clean editorial table.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(112,82,163,0.1)">✦</div>
      <h3>AI Insights</h3>
      <p>Natural language answers to financial questions. Proactive alerts when costs outpace growth or an upsell opportunity appears.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--green)">⬡</div>
      <h3>Integrations</h3>
      <p>Stripe, AWS, Payroll providers, Linear, Figma — one-click connects pull transactions automatically. Zero manual entry.</p>
    </div>
  </div>
</section>

<!-- Data showcase -->
<div class="data-showcase" style="padding:0 24px;max-width:1060px;margin:0 auto 80px">
  <div class="data-left">
    <div class="section-label">TRANSACTION LEDGER</div>
    <h2>Every transaction,<br><em>perfectly organized</em></h2>
    <p>Color-coded left-border indicators, monospaced amounts, category tags, and one-tap search —
       the kind of clarity you usually only get from a spreadsheet, but without the maintenance.</p>
    <a href="/${SLUG}-viewer" class="btn-p" style="display:inline-block">Open prototype →</a>
  </div>
  <div class="data-right">
    <div class="data-table">
      <div class="dt-header">
        <span>DESCRIPTION</span>
        <span>CAT</span>
        <span>DATE</span>
        <span>AMOUNT</span>
      </div>
      <div class="dt-row">
        <span>Stripe — Pro Subscription</span>
        <span><span class="dt-tag" style="background:var(--green);color:#1A6B4A">Revenue</span></span>
        <span class="mono" style="font-size:11px">Mar 27</span>
        <span class="mono pos">+$79.00</span>
      </div>
      <div class="dt-row">
        <span>AWS EC2 &amp; RDS</span>
        <span><span class="dt-tag" style="background:var(--blue);color:#2B4D8E">Infra</span></span>
        <span class="mono" style="font-size:11px">Mar 27</span>
        <span class="mono neg">-$312.40</span>
      </div>
      <div class="dt-row">
        <span>Stripe — 14 renewals</span>
        <span><span class="dt-tag" style="background:var(--green);color:#1A6B4A">Revenue</span></span>
        <span class="mono" style="font-size:11px">Mar 26</span>
        <span class="mono pos">+$1,106</span>
      </div>
      <div class="dt-row">
        <span>Payroll — March run</span>
        <span><span class="dt-tag" style="background:var(--amber);color:#B84C2A">Payroll</span></span>
        <span class="mono" style="font-size:11px">Mar 25</span>
        <span class="mono neg">-$4,800</span>
      </div>
      <div class="dt-row">
        <span>Linear — Annual Plan</span>
        <span><span class="dt-tag" style="background:rgba(112,82,163,0.1);color:#7052A3">Tools</span></span>
        <span class="mono" style="font-size:11px">Mar 26</span>
        <span class="mono neg">-$144.00</span>
      </div>
    </div>
  </div>
</div>

<!-- Screens -->
<section id="screens" style="padding-top:0">
  <div class="section-header center">
    <div class="section-label">5 SCREENS</div>
    <h2>Everything a founder needs</h2>
    <p>From morning revenue check to quarterly export — one app, no finance degree required.</p>
  </div>
  <div class="screen-grid">
    <div class="screen-card">
      <div class="screen-num">01</div>
      <h4>Overview</h4>
      <p>MRR hero card, bento metric grid, stacked revenue bar, cash & burn bento, runway banner.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">02</div>
      <h4>Ledger</h4>
      <p>Tabular transactions with category tags, color-coded left indicator bars, monospaced amounts.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">03</div>
      <h4>Runway</h4>
      <p>12-month cash projection chart, burn breakdown bars, scenario toggle, live sliders.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">04</div>
      <h4>P&amp;L Report</h4>
      <p>Editorial income table, QoQ delta column, highlighted net profit row, CSV/PDF export.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">05</div>
      <h4>AI Insights</h4>
      <p>Ask bar, proactive alerts, growth/cost/hiring insight cards with category tags.</p>
    </div>
  </div>
  <div style="display:flex;gap:14px;justify-content:center;margin-top:36px;flex-wrap:wrap">
    <a href="/${SLUG}-viewer" class="btn-p">Open Prototype →</a>
    <a href="/${SLUG}-mock" class="btn-w">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- AI showcase -->
<div class="ai-card" style="padding:0 24px;max-width:1060px;margin:0 auto 80px" id="ai">
  <div class="ai-left" style="padding:40px 0 40px 40px">
    <div class="section-label">AI INSIGHTS</div>
    <h2>Ask your finances<br><em>anything</em></h2>
    <p>Natural language queries — "What's driving my burn up this quarter?" — answered in seconds from your actual transaction data. Plus proactive alerts before a problem becomes a crisis.</p>
    <a href="/${SLUG}-mock" class="btn-p" style="display:inline-block">Try the mock →</a>
  </div>
  <div class="ai-right" style="padding:40px 40px 40px 0">
    <div class="insight-list">
      <div class="insight-item">
        <div class="ins-icon" style="background:var(--green);color:#1A6B4A">↑</div>
        <div>
          <h4>MRR growth accelerating</h4>
          <p>3-month trend +12.4% vs +9.1% prior Q. Cohort retention 87.3% — all-time high.</p>
        </div>
      </div>
      <div class="insight-item">
        <div class="ins-icon" style="background:var(--amber);color:#B84C2A">⚠</div>
        <div>
          <h4>Infra scaling faster than revenue</h4>
          <p>AWS +22% QoQ vs revenue +19.4%. Reserved instances save ~$644/mo.</p>
        </div>
      </div>
      <div class="insight-item">
        <div class="ins-icon" style="background:var(--blue);color:#2B4D8E">◈</div>
        <div>
          <h4>Business tier upsell opportunity</h4>
          <p>34 Pro users with 3+ team members. Upgrading adds $3,400 MRR in one push.</p>
        </div>
      </div>
      <div class="insight-item">
        <div class="ins-icon" style="background:rgba(112,82,163,0.1);color:#7052A3">✦</div>
        <div>
          <h4>Safe to hire in Q3 2026</h4>
          <p>At current growth, payroll stays below 60% of burn through Q4.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- CTA -->
<div class="cta-wrap">
  <div class="cta-block">
    <h2>Numbers that make<br><em>decisions easy</em></h2>
    <p>The prototype is live. The mock is interactive. Start exploring.</p>
    <div class="cta-btns">
      <a href="/${SLUG}-viewer" class="btn-p">View Prototype →</a>
      <a href="/${SLUG}-mock" class="btn-w">Interactive Mock ☀◑</a>
    </div>
  </div>
</div>

<footer>
  <div class="footer-logo">TALLY</div>
  <p>${TAGLINE}</p>
  <p style="margin-top:8px">
    Design by <a href="https://ram.zenbin.org">RAM</a> ·
    <a href="/${SLUG}-viewer">Prototype</a> ·
    <a href="/${SLUG}-mock">Interactive Mock ☀◑</a>
  </p>
</footer>
</body>
</html>`;

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const penJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'tally.pen'), 'utf8'));
  console.log(`\n── TALLY publish pipeline ──\n`);

  // Hero
  console.log(`Publishing hero → ram.zenbin.org/${SLUG} …`);
  const heroRes = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML);
  console.log(`  ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  // Viewer
  console.log(`Publishing viewer → ram.zenbin.org/${SLUG}-viewer …`);
  const viewerHTML = await buildViewerHTML(penJson);
  const viewerRes  = await publishToZenbin(`${SLUG}-viewer`, `${APP_NAME} — Prototype Viewer`, viewerHTML);
  console.log(`  ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  // Gallery queue
  console.log(`Updating GitHub gallery queue …`);
  try {
    const qRes = await updateGalleryQueue(
      `https://ram.zenbin.org/${SLUG}`,
      `https://ram.zenbin.org/${SLUG}-mock`
    );
    console.log(`  queue: ${qRes}`);
  } catch(e) {
    console.log(`  queue error: ${e.message}`);
  }

  console.log(`\n✓ Done — hero + viewer published, gallery updated`);
})();
