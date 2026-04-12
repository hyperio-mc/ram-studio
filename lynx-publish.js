#!/usr/bin/env node
// LYNX publish script — hero + viewer
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'lynx';
const APP_NAME  = 'LYNX';
const TAGLINE   = 'Your codebase, in sharp focus.';
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

const penJson    = fs.readFileSync(path.join(__dirname, 'lynx.pen'), 'utf8');
let viewerHtml   = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection  = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml       = viewerHtml.replace('<script>', injection + '\n<script>');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>LYNX — Your codebase, in sharp focus.</title>
  <meta name="description" content="LYNX is a dark AI code intelligence platform. Explore your repository with file-tree health overlays, manage autonomous coding agents, and track technical debt — all with AI-powered insights.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #060A17;
      --surface: #0D1424;
      --surface2:#141C35;
      --text:    #E2E6F8;
      --muted:   rgba(226,230,248,0.45);
      --accent:  #818CF8;
      --accent2: #34D399;
      --warn:    #FBBF24;
      --error:   #F87171;
      --dim:     rgba(226,230,248,0.10);
      --border:  rgba(226,230,248,0.08);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      overflow-x: hidden;
    }

    nav {
      position: sticky; top: 0; z-index: 100;
      padding: 0 32px; height: 60px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(6,10,23,0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav-brand { font-size: 15px; font-weight: 800; letter-spacing: 0.12em; color: var(--text); }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      padding: 8px 18px;
      background: var(--accent);
      color: #fff;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: opacity .2s;
    }
    .nav-cta:hover { opacity: .85; }

    /* HERO */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 80px 24px 60px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background:
        radial-gradient(ellipse 60% 40% at 50% 30%, rgba(129,140,248,0.12) 0%, transparent 70%),
        radial-gradient(ellipse 40% 30% at 80% 80%, rgba(52,211,153,0.06) 0%, transparent 60%);
      pointer-events: none;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px;
      background: rgba(129,140,248,0.12);
      border: 1px solid rgba(129,140,248,0.25);
      border-radius: 20px;
      font-size: 11px; font-weight: 600;
      color: var(--accent);
      letter-spacing: 0.08em;
      margin-bottom: 28px;
    }
    .hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent2); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    h1 {
      font-size: clamp(52px, 8vw, 92px);
      font-weight: 800;
      line-height: 1.0;
      letter-spacing: -0.03em;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #E2E6F8 0%, #818CF8 50%, #E2E6F8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .tagline {
      font-size: clamp(18px, 2.5vw, 24px);
      color: var(--muted);
      font-weight: 400;
      margin-bottom: 20px;
      letter-spacing: -0.01em;
    }
    .hero-desc {
      max-width: 520px;
      font-size: 16px;
      color: var(--muted);
      line-height: 1.7;
      margin-bottom: 40px;
    }
    .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      padding: 14px 32px;
      background: var(--accent);
      color: #fff;
      border-radius: 8px;
      font-size: 15px; font-weight: 600;
      text-decoration: none;
      transition: all .2s;
      box-shadow: 0 0 30px rgba(129,140,248,0.3);
    }
    .btn-primary:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 4px 40px rgba(129,140,248,0.4); }
    .btn-ghost {
      padding: 14px 32px;
      background: var(--surface);
      color: var(--text);
      border-radius: 8px;
      font-size: 15px; font-weight: 500;
      text-decoration: none;
      border: 1px solid var(--border);
      transition: all .2s;
    }
    .btn-ghost:hover { border-color: rgba(226,230,248,0.2); }

    /* SCREEN PREVIEW */
    .preview-section {
      padding: 80px 24px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .section-label {
      font-size: 10px; font-weight: 700;
      letter-spacing: 0.15em; color: var(--accent);
      text-transform: uppercase; margin-bottom: 12px;
    }
    .section-title {
      font-size: clamp(28px, 4vw, 44px);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
    }
    .section-sub { font-size: 16px; color: var(--muted); max-width: 480px; margin-bottom: 48px; line-height: 1.7; }

    .screens-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .screen-card {
      background: var(--surface);
      border-radius: 16px;
      border: 1px solid var(--border);
      padding: 24px 20px 16px;
      transition: all .3s;
      cursor: default;
    }
    .screen-card:hover { border-color: rgba(129,140,248,0.3); transform: translateY(-3px); box-shadow: 0 8px 40px rgba(0,0,0,0.3); }
    .screen-icon { font-size: 22px; margin-bottom: 12px; }
    .screen-name { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; color: var(--text); margin-bottom: 6px; }
    .screen-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }

    /* FEATURES */
    .features-section {
      padding: 80px 24px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 48px;
    }
    .feature-card {
      background: var(--surface);
      border-radius: 14px;
      border: 1px solid var(--border);
      padding: 28px 24px;
    }
    .feature-tag {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 9px; font-weight: 700;
      letter-spacing: 0.1em;
      margin-bottom: 14px;
      text-transform: uppercase;
    }
    .tag-accent  { background: rgba(129,140,248,0.15); color: var(--accent); }
    .tag-green   { background: rgba(52,211,153,0.15);  color: var(--accent2); }
    .tag-yellow  { background: rgba(251,191,36,0.15);  color: var(--warn); }
    .feature-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
    .feature-desc  { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* METRICS STRIP */
    .metrics-strip {
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 40px 24px;
      display: flex;
      justify-content: center; flex-wrap: wrap; gap: 48px;
    }
    .metric-item { text-align: center; }
    .metric-value { font-size: 36px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; margin-bottom: 6px; }
    .metric-label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
    .accent-val  { color: var(--accent); }
    .green-val   { color: var(--accent2); }
    .yellow-val  { color: var(--warn); }

    /* INSPIRATION */
    .inspo-section {
      padding: 80px 24px;
      max-width: 860px;
      margin: 0 auto;
    }
    .inspo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 36px; }
    .inspo-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .inspo-source { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
    .inspo-site   { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
    .inspo-desc   { font-size: 12px; color: var(--muted); line-height: 1.5; }

    /* FOOTER */
    footer {
      padding: 40px 32px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap; gap: 12px;
      font-size: 12px; color: var(--muted);
    }
    footer strong { color: var(--text); }

    @media (max-width: 640px) {
      nav { padding: 0 16px; }
      .nav-links { display: none; }
      .hero { padding: 60px 16px 40px; }
    }
  </style>
</head>
<body>

<nav>
  <span class="nav-brand">LYNX</span>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#inspiration">Inspiration</a>
  </div>
  <a href="https://ram.zenbin.org/lynx-viewer" class="nav-cta">View Prototype →</a>
</nav>

<section class="hero">
  <div class="hero-badge">
    <span class="dot"></span>
    DARK · AI CODE INTELLIGENCE
  </div>
  <h1>LYNX</h1>
  <p class="tagline">Your codebase, in sharp focus.</p>
  <p class="hero-desc">
    See every file's health at a glance. Deploy autonomous coding agents.
    Surface technical debt before it bites. LYNX gives you x-ray vision
    across your entire repository.
  </p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/lynx-viewer" class="btn-primary">View Prototype</a>
    <a href="https://ram.zenbin.org/lynx-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="metrics-strip">
  <div class="metric-item">
    <div class="metric-value accent-val">1,247</div>
    <div class="metric-label">Files Mapped</div>
  </div>
  <div class="metric-item">
    <div class="metric-value green-val">87</div>
    <div class="metric-label">Health Score</div>
  </div>
  <div class="metric-item">
    <div class="metric-value accent-val">3</div>
    <div class="metric-label">Active Agents</div>
  </div>
  <div class="metric-item">
    <div class="metric-value yellow-val">38</div>
    <div class="metric-label">Open Issues</div>
  </div>
</div>

<section class="preview-section" id="screens">
  <div class="section-label">5 Screens</div>
  <h2 class="section-title">Every view your repo needs</h2>
  <p class="section-sub">From health overview to file-tree forensics, LYNX gives you complete visibility into your codebase's state.</p>
  <div class="screens-grid">
    <div class="screen-card">
      <div class="screen-icon">◎</div>
      <div class="screen-name">SCAN</div>
      <div class="screen-desc">Repo health score ring, counter metrics, language breakdown, AI insight card, 14-day trend chart.</div>
    </div>
    <div class="screen-card">
      <div class="screen-icon">⊟</div>
      <div class="screen-name">FILES</div>
      <div class="screen-desc">File tree explorer with per-path health bars, issue counts, and AI-scored coverage overlays.</div>
    </div>
    <div class="screen-card">
      <div class="screen-icon">⚡</div>
      <div class="screen-name">AGENTS</div>
      <div class="screen-desc">Factory.ai-style numbered agent cards — task, progress bar, diff stats, status at a glance.</div>
    </div>
    <div class="screen-card">
      <div class="screen-icon">⚠</div>
      <div class="screen-name">ISSUES</div>
      <div class="screen-desc">Technical debt board with severity distribution bar, filter chips, and effort estimates per issue.</div>
    </div>
    <div class="screen-card">
      <div class="screen-icon">↑</div>
      <div class="screen-name">HISTORY</div>
      <div class="screen-desc">Git timeline with AI annotations — agent commits vs human commits, insight chips per change.</div>
    </div>
  </div>
</section>

<section class="features-section" id="features">
  <div class="section-label">Design Decisions</div>
  <h2 class="section-title">What makes LYNX tick</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-tag tag-accent">Pattern</div>
      <div class="feature-title">File Tree with Health Overlays</div>
      <div class="feature-desc">Each file/directory gets a real-time health bar, issue count badge, and color-coded score — a forensic view of your repo's state I haven't explored in prior designs.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-accent">Color</div>
      <div class="feature-title">Evervault Deep Blue-Black</div>
      <div class="feature-desc">#060A17 bg from Evervault's #010314 — a step warmer. Indigo (#818CF8) accent reads beautifully against this depth without the harshness of pure neon.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-green">Typography</div>
      <div class="feature-title">Digit-Counter Metric Strip</div>
      <div class="feature-desc">Inspired by 108.supply's animated rolling digit counters — the 4-up counter row on the Scan screen echoes that typographic density on dark.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-green">Interaction</div>
      <div class="feature-title">Numbered Agent Cards</div>
      <div class="feature-desc">Factory.ai's "01 TERMINAL / 02 WEB BROWSER" numbered sequence became a card format for agent management — each agent gets a sequential ID, status, and progress.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-yellow">Hierarchy</div>
      <div class="feature-title">Severity Distribution Bar</div>
      <div class="feature-desc">A segmented horizontal bar on the Issues screen gives instant proportional overview of critical/high/medium/low issues before reading individual cards.</div>
    </div>
    <div class="feature-card">
      <div class="feature-tag tag-yellow">Timeline</div>
      <div class="feature-title">Mixed-Authority Git Log</div>
      <div class="feature-desc">History screen distinguishes AI agent commits (⚡ icon + indigo) from human commits with different dot treatment — a new pattern for AI-native development workflows.</div>
    </div>
  </div>
</section>

<section class="inspo-section" id="inspiration">
  <div class="section-label">Research</div>
  <h2 class="section-title">What sparked LYNX</h2>
  <div class="inspo-grid">
    <div class="inspo-card">
      <div class="inspo-source">lapa.ninja · AI section</div>
      <div class="inspo-site">Factory.ai</div>
      <div class="inspo-desc">"Agent-Native Software Development" — numbered agent positions (01 TERMINAL / 02 WEB BROWSER), Geist font, clean terminal integration UI. Directly sparked the Agents screen numbering.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">darkmodedesign.com</div>
      <div class="inspo-site">108.supply</div>
      <div class="inspo-desc">#111111 charcoal dark, #F6F4F1 cream text, animated rolling digit counters. The 4-metric counter strip on the Scan screen is a direct nod to this typographic aesthetic.</div>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">godly.website</div>
      <div class="inspo-site">Evervault</div>
      <div class="inspo-desc">#010314 deep blue-black background, #DFE1F4 lavender text. The deepest, most distinctive dark palette I found — adapted to #060A17 for LYNX's code-intelligence brand.</div>
    </div>
  </div>
</section>

<footer>
  <strong>LYNX</strong>
  <span>Design by RAM · Pencil.dev v2.8 · Dark theme</span>
  <span>Inspired by Factory.ai (lapa.ninja) · 108.supply (darkmodedesign.com) · Evervault (godly.website)</span>
</footer>

</body>
</html>`;

async function main() {
  const heroRes = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: heroHtml, title: `${APP_NAME} — ${TAGLINE}` });
  console.log('Hero:', heroRes.status, [200,201].includes(heroRes.status) ? 'OK' : heroRes.body.slice(0,120));

  const viewerRes = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, title: `${APP_NAME} — Prototype Viewer` });
  console.log('Viewer:', viewerRes.status, [200,201].includes(viewerRes.status) ? 'OK' : viewerRes.body.slice(0,120));

  console.log(`\nLive:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
