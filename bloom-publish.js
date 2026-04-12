'use strict';
// bloom-publish.js — BLOOM hero page + viewer with embedded pen
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'bloom';
const APP_NAME  = 'BLOOM';
const TAGLINE   = 'Customer success for DTC brands';
const ARCHETYPE = 'brand-success-platform';
const PROMPT    = 'Light-theme customer success + brand onboarding platform for DTC/ecommerce brands. Inspired by: darkmodedesign.com featured Midday (open-source AI finance/time tracking with clean SaaS UI) and Darkroom (premium tool for creative professionals); land-book.com featured Cernel ("Product Onboarding for Ecommerce Teams", clean B2B SaaS with editorial warmth); lapa.ninja featured Isa de Burgh (CPG brand architect for food/beverage/skincare — "helping brands build clarity, trust, and momentum"). Bento-grid card layout for dashboard. Warm cream palette (#F8F5F0), forest green (#2A5A3A), amber (#D4884A). 6 screens: Overview (bento), Brand List, Onboarding Flow, AI Insights, Brand Profile, Settings.';

const P = {
  bg:       '#F8F5F0',
  surface:  '#FFFFFF',
  surface2: '#EEE9E0',
  text:     '#1A1914',
  muted:    'rgba(26,25,20,0.44)',
  forest:   '#2A5A3A',
  forestLt: '#3D7A52',
  amber:    '#D4884A',
  sage:     '#6B9E7D',
  risk:     '#E07055',
  border:   'rgba(26,25,20,0.09)',
};

function zenPublish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length, 'X-Subdomain': 'ram' },
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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface}; --s2: ${P.surface2};
    --text: ${P.text}; --muted: ${P.muted};
    --forest: ${P.forest}; --forestlt: ${P.forestLt};
    --amber: ${P.amber}; --sage: ${P.sage}; --risk: ${P.risk};
    --border: ${P.border};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.55; overflow-x: hidden; }

  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(248,245,240,0.96); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 56px;
  }
  .nav-brand { font-family: 'Lora', serif; font-size: 18px; font-weight: 600; color: var(--forest); text-decoration: none; letter-spacing: 0.05em; }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--forest); color: #fff; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; padding: 9px 22px; border-radius: 6px; text-decoration: none; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.88; }

  .hero { min-height: 100vh; padding: 140px 32px 80px; max-width: 1100px; margin: 0 auto; }
  .hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--amber); margin-bottom: 20px; }
  .hero-headline { font-family: 'Lora', serif; font-size: clamp(42px, 7vw, 86px); font-weight: 400; line-height: 1.02; letter-spacing: -0.01em; margin-bottom: 28px; }
  .hero-headline em { font-style: italic; color: var(--forest); }
  .hero-sub { font-size: clamp(16px, 1.8vw, 19px); color: var(--muted); max-width: 500px; line-height: 1.6; margin-bottom: 44px; }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 72px; }
  .btn-primary { background: var(--forest); color: #fff; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; padding: 14px 32px; border-radius: 8px; text-decoration: none; display: inline-block; transition: opacity 0.2s; }
  .btn-primary:hover { opacity: 0.88; }
  .btn-ghost { border: 1.5px solid var(--border); color: var(--text); font-size: 13px; font-weight: 500; padding: 13px 28px; border-radius: 8px; text-decoration: none; display: inline-block; transition: border-color 0.2s; }
  .btn-ghost:hover { border-color: var(--forest); }

  /* Brand health preview */
  .health-preview { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; max-width: 620px; box-shadow: 0 4px 32px rgba(26,25,20,0.08); }
  .hp-header { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .hp-title { font-family: 'Lora', serif; font-size: 13px; color: var(--text); }
  .hp-date { font-size: 11px; color: var(--muted); }
  .hp-row { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
  .hp-row:last-child { border-bottom: none; }
  .hp-avatar { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .hp-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .hp-cat { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .hp-score { font-size: 18px; font-weight: 700; margin-left: auto; }
  .hp-badge { font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 99px; margin-left: 8px; }
  .score-green { color: var(--sage); }
  .score-amber { color: var(--amber); }
  .score-risk  { color: var(--risk); }
  .badge-green { background: rgba(107,158,125,0.15); color: var(--sage); }
  .badge-amber { background: rgba(212,136,74,0.15); color: var(--amber); }
  .badge-risk  { background: rgba(224,112,85,0.15); color: var(--risk); }

  /* Metrics grid */
  .metrics-section { max-width: 1100px; margin: 0 auto; padding: 0 32px 80px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .metric-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 24px 20px; border-top: 3px solid transparent; }
  .metric-card.forest { border-top-color: var(--forest); }
  .metric-card.amber  { border-top-color: var(--amber); }
  .metric-card.sage   { border-top-color: var(--sage); }
  .metric-card.risk   { border-top-color: var(--risk); }
  .metric-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .metric-value { font-family: 'Lora', serif; font-size: 32px; font-weight: 400; color: var(--text); line-height: 1; margin-bottom: 6px; }
  .metric-sub { font-size: 12px; color: var(--muted); }

  /* Features */
  .features-section { max-width: 1100px; margin: 0 auto; padding: 60px 32px 80px; }
  .section-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; }
  .section-title { font-family: 'Lora', serif; font-size: clamp(28px, 4vw, 42px); font-weight: 400; margin-bottom: 48px; line-height: 1.15; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .feature-card { background: var(--surface); padding: 32px 28px; transition: background 0.2s; }
  .feature-card:hover { background: ${P.bg}; }
  .feature-icon { font-size: 20px; margin-bottom: 14px; }
  .feature-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

  /* Onboarding steps */
  .steps-section { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 32px; }
  .steps-inner { max-width: 1100px; margin: 0 auto; }
  .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0; }
  .step { padding: 24px 24px; position: relative; }
  .step + .step::before { content: ''; position: absolute; left: 0; top: 40px; width: 1px; height: 32px; background: var(--border); }
  .step-num { font-family: 'Lora', serif; font-size: 36px; font-weight: 400; color: var(--forest); opacity: 0.25; line-height: 1; margin-bottom: 12px; }
  .step-title { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
  .step-desc { font-size: 12px; color: var(--muted); line-height: 1.55; }

  /* CTA */
  .cta-section { background: var(--forest); padding: 80px 32px; text-align: center; }
  .cta-heading { font-family: 'Lora', serif; font-size: clamp(28px, 4vw, 46px); font-weight: 400; color: #fff; margin-bottom: 16px; }
  .cta-sub { font-size: 16px; color: rgba(255,255,255,0.65); margin-bottom: 40px; }
  .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-white { background: #fff; color: var(--forest); font-size: 13px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; }
  .btn-outline-white { border: 1.5px solid rgba(255,255,255,0.4); color: #fff; font-size: 13px; font-weight: 500; padding: 13px 28px; border-radius: 8px; text-decoration: none; }

  footer { max-width: 1100px; margin: 0 auto; padding: 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-brand { font-family: 'Lora', serif; font-size: 15px; color: var(--forest); font-weight: 600; letter-spacing: 0.05em; }
  .footer-note { font-size: 11px; color: var(--muted); }

  @media (max-width: 768px) {
    nav { padding: 0 16px; } .nav-links { display: none; }
    .hero { padding: 100px 16px 60px; }
    .metrics-grid { grid-template-columns: 1fr 1fr; }
    .metrics-section, .features-section { padding: 40px 16px 60px; }
    .steps-section { padding: 60px 16px; }
    footer { padding: 24px 16px; flex-direction: column; gap: 8px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-brand">bloom</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#onboarding">Onboarding</a>
    <a href="https://ram.zenbin.org/bloom-mock">Mock ☀◑</a>
  </div>
  <a href="https://ram.zenbin.org/bloom-mock" class="nav-cta">Try Mock</a>
</nav>

<section class="hero">
  <p class="hero-eyebrow">Brand Success Platform</p>
  <h1 class="hero-headline">
    Every DTC brand<br>
    <em>deserves to bloom.</em>
  </h1>
  <p class="hero-sub">BLOOM gives brand success teams the intelligence to onboard, monitor, and grow DTC brands — from first intake to sustained momentum.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/bloom-mock" class="btn-primary">Try Interactive Mock</a>
    <a href="#features" class="btn-ghost">See Features</a>
  </div>

  <div class="health-preview">
    <div class="hp-header">
      <span class="hp-title">Brand health overview — 12 active brands</span>
      <span class="hp-date">Mon 24 March</span>
    </div>
    <div class="hp-row">
      <div class="hp-avatar" style="background:${P.forest}">MC</div>
      <div>
        <div class="hp-name">Maison Colette</div>
        <div class="hp-cat">Food & Beverage</div>
      </div>
      <span class="hp-score score-green">91</span>
      <span class="hp-badge badge-green">Healthy</span>
    </div>
    <div class="hp-row">
      <div class="hp-avatar" style="background:${P.amber}">NS</div>
      <div>
        <div class="hp-name">Nomad Supply Co.</div>
        <div class="hp-cat">Outdoor & Apparel</div>
      </div>
      <span class="hp-score score-amber">68</span>
      <span class="hp-badge badge-amber">Monitor</span>
    </div>
    <div class="hp-row">
      <div class="hp-avatar" style="background:${P.risk}">SF</div>
      <div>
        <div class="hp-name">Soilborn Foods</div>
        <div class="hp-cat">CPG / Organic</div>
      </div>
      <span class="hp-score score-risk">44</span>
      <span class="hp-badge badge-risk">At Risk</span>
    </div>
    <div class="hp-row">
      <div class="hp-avatar" style="background:${P.sage}">VS</div>
      <div>
        <div class="hp-name">Verdant Skincare</div>
        <div class="hp-cat">Beauty & Personal Care</div>
      </div>
      <span class="hp-score score-green">88</span>
      <span class="hp-badge badge-green">Healthy</span>
    </div>
  </div>
</section>

<div class="metrics-section">
  <div class="metrics-grid">
    <div class="metric-card forest">
      <div class="metric-label">Avg Health Score</div>
      <div class="metric-value">84</div>
      <div class="metric-sub">↑ 3 pts this week</div>
    </div>
    <div class="metric-card sage">
      <div class="metric-label">Active Brands</div>
      <div class="metric-value">12</div>
      <div class="metric-sub">+2 this month</div>
    </div>
    <div class="metric-card amber">
      <div class="metric-label">Brands At Risk</div>
      <div class="metric-value">3</div>
      <div class="metric-sub">Action needed</div>
    </div>
    <div class="metric-card risk">
      <div class="metric-label">Onboarded</div>
      <div class="metric-value">94%</div>
      <div class="metric-sub">Avg 18 days</div>
    </div>
  </div>
</div>

<section class="features-section" id="features">
  <p class="section-eyebrow">What Bloom does</p>
  <h2 class="section-title">Built for brand success<br>teams who move fast.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">📊</div>
      <div class="feature-title">Health Score Dashboard</div>
      <div class="feature-desc">A single score per brand, updated weekly. Combines NPS, engagement, order velocity, and response time into one actionable signal.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🌱</div>
      <div class="feature-title">Structured Onboarding</div>
      <div class="feature-desc">A 6-step onboarding flow with AI-assisted briefs, founder calls, positioning audit, and strategy deck — tracked per brand.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🤖</div>
      <div class="feature-title">AI Portfolio Insights</div>
      <div class="feature-desc">GPT-powered analysis of your brand portfolio. Surfaces churn signals, growth patterns, and category trends before you notice them manually.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚠️</div>
      <div class="feature-title">Risk Alerts</div>
      <div class="feature-desc">Brands with declining health scores surface automatically. 14-day low-engagement windows trigger an alert before churn becomes inevitable.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔗</div>
      <div class="feature-title">Native Integrations</div>
      <div class="feature-desc">Connect Shopify, Klaviyo, and Notion in minutes. Data flows in automatically — health scores update without manual input.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">👥</div>
      <div class="feature-title">Team Collaboration</div>
      <div class="feature-desc">Roles for CSMs, strategists, and analysts. Assign brands, track activity, manage handoffs. Everyone sees the same source of truth.</div>
    </div>
  </div>
</section>

<section class="steps-section" id="onboarding">
  <div class="steps-inner">
    <p class="section-eyebrow">The onboarding flow</p>
    <h2 class="section-title" style="margin-bottom:40px;">Six steps from intake<br>to growing brand.</h2>
    <div class="steps-grid">
      <div class="step">
        <div class="step-num">01</div>
        <div class="step-title">Brand Intake</div>
        <div class="step-desc">Structured form capturing brand positioning, goals, and existing channels.</div>
      </div>
      <div class="step">
        <div class="step-num">02</div>
        <div class="step-title">Discovery Call</div>
        <div class="step-desc">Recorded founder interview. AI transcription + summary added to brand profile.</div>
      </div>
      <div class="step">
        <div class="step-num">03</div>
        <div class="step-title">Brand Audit</div>
        <div class="step-desc">Positioning review, competitive analysis, content and channel snapshot.</div>
      </div>
      <div class="step">
        <div class="step-num">04</div>
        <div class="step-title">Strategy Deck</div>
        <div class="step-desc">Co-authored strategy doc shared for async review and revision.</div>
      </div>
      <div class="step">
        <div class="step-num">05</div>
        <div class="step-title">Launch Alignment</div>
        <div class="step-desc">Go-to-market plan, milestones, and KPIs agreed and tracked in Bloom.</div>
      </div>
      <div class="step">
        <div class="step-num">06</div>
        <div class="step-title">Live & Monitored</div>
        <div class="step-desc">Brand enters active monitoring. Health score tracking begins. You're done.</div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2 class="cta-heading">Give every brand the attention it deserves.</h2>
  <p class="cta-sub">Start with the interactive mock — no sign-up needed.</p>
  <div class="cta-actions">
    <a href="https://ram.zenbin.org/bloom-mock" class="btn-white">Try Interactive Mock</a>
    <a href="https://ram.zenbin.org/bloom-mock" class="btn-outline-white">Light / Dark Toggle ☀◑</a>
  </div>
</section>

<footer>
  <span class="footer-brand">bloom</span>
  <span class="footer-note">RAM Design Studio · ram.zenbin.org</span>
  <span class="footer-note">Light · DTC · Brand Success</span>
</footer>

</body>
</html>`;
}

function buildViewerHtml() {
  const penJson = fs.readFileSync(path.join(__dirname, 'bloom.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'renderer.html'), 'utf8');
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

(async () => {
  console.log('Publishing hero page…');
  const heroHtml = buildHeroHtml();
  const heroRes = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, heroRes.status === 201 ? '✓ Created' : heroRes.status === 200 ? '✓ Updated' : heroRes.body.slice(0, 100));

  console.log('Publishing viewer page…');
  let viewerHtml = null;
  try {
    viewerHtml = buildViewerHtml();
    const viewerRes = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
    console.log('Viewer:', viewerRes.status, viewerRes.status === 201 ? '✓ Created' : viewerRes.status === 200 ? '✓ Updated' : viewerRes.body.slice(0, 100));
  } catch (e) {
    console.warn('Viewer skipped:', e.message);
  }

  console.log('\nLive at:');
  console.log(`  https://ram.zenbin.org/${SLUG}`);
  console.log(`  https://ram.zenbin.org/${SLUG}-viewer`);
})();
