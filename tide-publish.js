// tide-publish.js — TIDE hero + viewer publisher
const fs = require('fs');
const https = require('https');

const SLUG = 'tide';
const APP_NAME = 'Tide';
const TAGLINE = 'Your money, in motion';

function publish(subdomain, urlPath, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const opts = {
      hostname: 'zenbin.org',
      path: `/publish/${urlPath}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Palette
const C = {
  bg:       '#F4F0E8',
  surface:  '#FFFFFF',
  surfaceAlt:'#EDE7D9',
  text:     '#1C1A18',
  textMuted:'rgba(28,26,24,0.50)',
  accent:   '#2A5F4A',
  accentLt: '#EBF4F0',
  amber:    '#E8893A',
  amberLt:  '#FEF3E8',
  glass:    'rgba(255,255,255,0.72)',
  border:   'rgba(28,26,24,0.08)',
  borderMd: 'rgba(28,26,24,0.14)',
};

// ── HERO PAGE ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${C.bg};
    --surface: ${C.surface};
    --surfaceAlt: ${C.surfaceAlt};
    --text: ${C.text};
    --muted: ${C.textMuted};
    --accent: ${C.accent};
    --accentLt: ${C.accentLt};
    --amber: ${C.amber};
    --amberLt: ${C.amberLt};
    --border: ${C.border};
    --borderMd: ${C.borderMd};
    --glass: ${C.glass};
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 48px;
    background: rgba(244,240,232,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 10px 22px; border-radius: 24px;
    font-size: 13px; font-weight: 600;
    text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    display: flex; align-items: center;
    padding: 120px 48px 80px;
    position: relative; overflow: hidden;
  }
  .hero-blob {
    position: absolute; border-radius: 50%;
    filter: blur(60px); pointer-events: none;
  }
  .blob1 { width: 500px; height: 500px; background: var(--accentLt); top: -80px; right: -100px; opacity: 0.7; }
  .blob2 { width: 380px; height: 380px; background: var(--amberLt); bottom: 0; left: -80px; opacity: 0.55; }
  .blob3 { width: 300px; height: 300px; background: var(--accentLt); top: 40%; right: 30%; opacity: 0.35; }

  .hero-inner {
    max-width: 1100px; margin: 0 auto; width: 100%;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
    position: relative; z-index: 1;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--accentLt); color: var(--accent);
    padding: 6px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
    margin-bottom: 24px; letter-spacing: 0.3px;
  }
  .hero-badge::before { content: '✦'; font-size: 9px; }
  h1 {
    font-size: clamp(40px, 5vw, 64px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -2px;
    color: var(--text);
    margin-bottom: 20px;
  }
  h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: 16px; line-height: 1.65;
    color: var(--muted); max-width: 440px;
    margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 14px 28px; border-radius: 28px;
    font-size: 14px; font-weight: 700; text-decoration: none;
    transition: transform .2s, box-shadow .2s;
    box-shadow: 0 8px 24px rgba(42,95,74,0.25);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(42,95,74,0.32); }
  .btn-secondary {
    color: var(--text); font-size: 14px; font-weight: 600;
    text-decoration: none;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-secondary:hover { color: var(--accent); }
  .hero-trust {
    margin-top: 40px;
    display: flex; align-items: center; gap: 16px;
    font-size: 12px; color: var(--muted);
  }
  .trust-dots { display: flex; gap: -4px; }
  .trust-dot {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2px solid var(--bg);
    background: var(--accentLt);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: var(--accent);
    margin-left: -8px;
  }
  .trust-dot:first-child { margin-left: 0; }

  /* ── PHONE MOCKUP ── */
  .phone-wrap {
    display: flex; justify-content: center; align-items: center;
    position: relative;
  }
  .phone {
    width: 260px; height: 530px;
    background: var(--surface);
    border-radius: 44px;
    border: 8px solid rgba(28,26,24,0.12);
    box-shadow:
      0 40px 80px rgba(28,26,24,0.14),
      0 0 0 1px rgba(255,255,255,0.8) inset;
    overflow: hidden;
    position: relative;
    background: var(--bg);
  }
  .phone-notch {
    position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
    width: 100px; height: 6px; background: rgba(28,26,24,0.15); border-radius: 3px;
  }
  .phone-screen {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    padding: 28px 16px 16px;
    gap: 10px;
  }
  .phone-header { display: flex; justify-content: space-between; align-items: flex-end; }
  .phone-greeting { font-size: 9px; color: var(--muted); }
  .phone-name { font-size: 14px; font-weight: 800; color: var(--text); }
  .phone-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: var(--accentLt);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: var(--accent);
  }
  .phone-card {
    background: var(--glass);
    backdrop-filter: blur(16px);
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.80);
    padding: 14px;
    box-shadow: 0 4px 16px rgba(28,26,24,0.07);
  }
  .phone-balance-label { font-size: 7px; color: var(--muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px; }
  .phone-balance {
    font-size: 28px; font-weight: 900; color: var(--text);
    letter-spacing: -1.5px; line-height: 1;
  }
  .phone-balance span { font-size: 16px; font-weight: 400; color: var(--muted); }
  .phone-chip {
    display: inline-flex; align-items: center;
    background: var(--accentLt); color: var(--accent);
    font-size: 7px; font-weight: 600;
    padding: 3px 8px; border-radius: 10px;
    margin-top: 6px;
  }
  .phone-stats { display: flex; gap: 8px; }
  .phone-stat {
    flex: 1;
    background: var(--glass);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.75);
    padding: 10px;
    box-shadow: 0 2px 8px rgba(28,26,24,0.05);
  }
  .phone-stat-icon {
    width: 18px; height: 18px; border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; margin-bottom: 5px;
  }
  .phone-stat-val { font-size: 9px; font-weight: 700; color: var(--text); }
  .phone-stat-lbl { font-size: 6px; color: var(--muted); }
  .phone-section-title { font-size: 9px; font-weight: 700; color: var(--text); margin-top: 2px; }
  .phone-tx {
    background: var(--glass);
    backdrop-filter: blur(12px);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.75);
    padding: 8px 10px;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 2px 6px rgba(28,26,24,0.05);
  }
  .phone-tx-icon {
    width: 24px; height: 24px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; flex-shrink: 0;
  }
  .phone-tx-info { flex: 1; }
  .phone-tx-name { font-size: 8px; font-weight: 600; color: var(--text); }
  .phone-tx-cat { font-size: 6px; color: var(--muted); }
  .phone-tx-amt { font-size: 8px; font-weight: 700; }
  .phone-nav {
    background: var(--glass);
    backdrop-filter: blur(16px);
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.80);
    padding: 8px;
    display: flex; justify-content: space-around; align-items: center;
    margin-top: auto;
    box-shadow: 0 -2px 12px rgba(28,26,24,0.05);
  }
  .phone-nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 4px 8px; border-radius: 10px;
    font-size: 6px; color: var(--muted);
  }
  .phone-nav-item.active {
    background: var(--accent); color: #fff;
  }
  .phone-nav-icon { font-size: 11px; }

  /* sparkline svg */
  .sparkline { overflow: visible; }

  /* floating cards */
  .float-card {
    position: absolute;
    background: var(--surface);
    border-radius: 16px;
    border: 1px solid var(--border);
    padding: 14px 18px;
    box-shadow: 0 12px 32px rgba(28,26,24,0.10);
    pointer-events: none;
  }
  .float-left { left: -120px; top: 120px; width: 140px; }
  .float-right { right: -100px; bottom: 100px; width: 160px; }
  .float-label { font-size: 9px; color: var(--muted); margin-bottom: 4px; }
  .float-value { font-size: 18px; font-weight: 800; color: var(--text); }
  .float-sub { font-size: 9px; color: var(--muted); margin-top: 2px; }
  .float-chip {
    display: inline-flex; align-items: center;
    background: var(--accentLt); color: var(--accent);
    font-size: 8px; font-weight: 600;
    padding: 2px 7px; border-radius: 8px; margin-top: 4px;
  }

  /* ── STATS BAND ── */
  .stats-band {
    background: var(--accent);
    padding: 32px 48px;
  }
  .stats-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; justify-content: space-around; flex-wrap: wrap; gap: 24px;
  }
  .stat-item { text-align: center; }
  .stat-num { font-size: 36px; font-weight: 900; color: #fff; letter-spacing: -1px; }
  .stat-lbl { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 4px; }

  /* ── FEATURES ── */
  .section { padding: 96px 48px; }
  .section-inner { max-width: 1100px; margin: 0 auto; }
  .section-tag {
    display: inline-flex; align-items: center; gap: 6px;
    color: var(--accent); font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
    text-transform: uppercase; margin-bottom: 16px;
  }
  .section-tag::before { content: '◆'; font-size: 7px; }
  .section-title {
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 900; line-height: 1.1; letter-spacing: -1.5px;
    margin-bottom: 12px;
  }
  .section-title em { font-style: normal; color: var(--accent); }
  .section-sub { font-size: 15px; color: var(--muted); line-height: 1.65; max-width: 480px; margin-bottom: 56px; }

  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    transition: transform .2s, box-shadow .2s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(28,26,24,0.08); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ── HOW IT WORKS ── */
  .how-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
  }
  .steps { display: flex; flex-direction: column; gap: 28px; }
  .step { display: flex; gap: 20px; }
  .step-num {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--accentLt); color: var(--accent);
    font-size: 13px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px;
  }
  .step-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .step-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  .how-visual {
    background: var(--surface);
    border-radius: 28px;
    border: 1px solid var(--border);
    padding: 32px;
    box-shadow: 0 20px 60px rgba(28,26,24,0.08);
  }
  .visual-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 24px;
  }
  .visual-title { font-size: 13px; font-weight: 700; }
  .visual-period {
    background: var(--accent); color: #fff;
    font-size: 10px; font-weight: 600;
    padding: 4px 12px; border-radius: 12px;
  }
  .bar-chart { display: flex; align-items: flex-end; gap: 10px; height: 100px; margin-bottom: 10px; }
  .bar {
    flex: 1; border-radius: 6px 6px 0 0;
    background: var(--border);
    position: relative; transition: height .3s;
  }
  .bar.active { background: var(--accent); }
  .bar-label { text-align: center; font-size: 9px; color: var(--muted); margin-top: 6px; }
  .chart-labels { display: flex; gap: 10px; }
  .chart-label { flex: 1; text-align: center; font-size: 9px; color: var(--muted); }

  /* ── PRICING ── */
  .pricing-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    max-width: 900px; margin: 0 auto;
  }
  .price-card {
    border-radius: 24px;
    border: 1px solid var(--border);
    padding: 32px 28px;
    background: var(--surface);
    position: relative;
    transition: transform .2s;
  }
  .price-card:hover { transform: translateY(-3px); }
  .price-card.featured {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  .price-card.featured .price-desc { color: rgba(255,255,255,0.65); }
  .price-card.featured .price-feature { color: rgba(255,255,255,0.75); }
  .price-tag {
    position: absolute; top: -12px; right: 20px;
    background: var(--amber); color: #fff;
    font-size: 9px; font-weight: 700;
    padding: 4px 10px; border-radius: 10px; letter-spacing: 0.3px;
  }
  .price-plan { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
  .price-card.featured .price-plan { color: rgba(255,255,255,0.65); }
  .price-num { font-size: 40px; font-weight: 900; letter-spacing: -2px; }
  .price-per { font-size: 12px; color: var(--muted); margin-left: 2px; }
  .price-card.featured .price-per { color: rgba(255,255,255,0.55); }
  .price-desc { font-size: 12px; color: var(--muted); margin: 10px 0 20px; line-height: 1.5; }
  .price-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .price-feature { font-size: 12px; color: var(--muted); display: flex; gap: 8px; }
  .price-check { color: var(--accent); font-weight: 700; }
  .price-card.featured .price-check { color: rgba(255,255,255,0.85); }
  .price-btn {
    width: 100%; padding: 12px;
    border-radius: 14px;
    font-size: 13px; font-weight: 700;
    text-align: center; cursor: pointer;
    border: none; text-decoration: none; display: block;
    transition: opacity .2s;
  }
  .price-btn:hover { opacity: 0.85; }
  .price-btn-outline {
    background: transparent;
    border: 1.5px solid var(--borderMd);
    color: var(--text);
  }
  .price-btn-solid {
    background: #fff; color: var(--accent);
  }
  .price-btn-accent {
    background: var(--accent); color: #fff;
  }

  /* ── CTA BAND ── */
  .cta-band {
    background: linear-gradient(135deg, var(--accent), #1E4A38);
    padding: 80px 48px;
    text-align: center;
    position: relative; overflow: hidden;
  }
  .cta-band::before {
    content: '';
    position: absolute; top: -80px; right: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
  }
  .cta-title { font-size: clamp(28px, 3vw, 40px); font-weight: 900; color: #fff; letter-spacing: -1px; margin-bottom: 16px; }
  .cta-sub { font-size: 15px; color: rgba(255,255,255,0.65); margin-bottom: 32px; }
  .cta-actions { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; }
  .cta-btn-white {
    background: #fff; color: var(--accent);
    padding: 14px 28px; border-radius: 28px;
    font-size: 14px; font-weight: 700; text-decoration: none;
    transition: transform .2s; display: inline-block;
  }
  .cta-btn-white:hover { transform: translateY(-2px); }
  .cta-btn-ghost {
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.35);
    color: #fff;
    padding: 14px 28px; border-radius: 28px;
    font-size: 14px; font-weight: 600; text-decoration: none;
    transition: border-color .2s; display: inline-block;
  }
  .cta-btn-ghost:hover { border-color: rgba(255,255,255,0.65); }

  /* ── FOOTER ── */
  footer {
    background: var(--bg);
    padding: 48px;
    border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
  }
  .footer-logo { font-size: 16px; font-weight: 800; color: var(--text); }
  .footer-logo span { color: var(--accent); }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; }
  .footer-links a:hover { color: var(--text); }
  .footer-copy { font-size: 11px; color: var(--muted); }

  @media (max-width: 768px) {
    nav { padding: 16px 24px; }
    .hero { padding: 100px 24px 60px; }
    .hero-inner { grid-template-columns: 1fr; gap: 48px; }
    .float-left, .float-right { display: none; }
    .features-grid { grid-template-columns: 1fr; }
    .how-grid { grid-template-columns: 1fr; }
    .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
    .section { padding: 64px 24px; }
    footer { padding: 32px 24px; }
    .stats-band { padding: 32px 24px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">tide<span>.</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#how">How it works</a>
    <a href="#pricing">Pricing</a>
  </div>
  <a href="#cta" class="nav-cta">Get started free</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-blob blob1"></div>
  <div class="hero-blob blob2"></div>
  <div class="hero-blob blob3"></div>
  <div class="hero-inner">
    <div class="hero-text">
      <div class="hero-badge">Personal Finance · Redesigned</div>
      <h1>Your money,<br><em>in motion</em></h1>
      <p class="hero-sub">Tide gives you a crystal-clear view of where every dollar goes — with frosted glass clarity and insights that actually make sense.</p>
      <div class="hero-actions">
        <a href="#cta" class="btn-primary">Start for free</a>
        <a href="#how" class="btn-secondary">See how it works →</a>
      </div>
      <div class="hero-trust">
        <div class="trust-dots">
          <div class="trust-dot">M</div>
          <div class="trust-dot">J</div>
          <div class="trust-dot">A</div>
          <div class="trust-dot">+</div>
        </div>
        <span>Trusted by 14,000+ people tracking their finances</span>
      </div>
    </div>

    <div class="phone-wrap">
      <!-- Floating cards -->
      <div class="float-card float-left">
        <div class="float-label">Saved this month</div>
        <div class="float-value">$2,037</div>
        <div class="float-chip">↑ +18%</div>
      </div>
      <div class="float-card float-right">
        <div class="float-label">Emergency Fund</div>
        <div class="float-value">68%</div>
        <div class="float-sub">$6,800 of $10,000</div>
      </div>

      <!-- Phone -->
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="phone-header">
            <div>
              <div class="phone-greeting">Good morning</div>
              <div class="phone-name">Mia ✦</div>
            </div>
            <div class="phone-avatar">M</div>
          </div>

          <div class="phone-card">
            <div class="phone-balance-label">Net Worth</div>
            <div class="phone-balance">$12,847<span>.36</span></div>
            <div class="phone-chip">↑ +4.2% this month</div>
          </div>

          <div class="phone-stats">
            <div class="phone-stat">
              <div class="phone-stat-icon" style="background:#EDFAF4">↓</div>
              <div class="phone-stat-val">$4,200</div>
              <div class="phone-stat-lbl">Income</div>
            </div>
            <div class="phone-stat">
              <div class="phone-stat-icon" style="background:#FEF0F0">↑</div>
              <div class="phone-stat-val">$2,163</div>
              <div class="phone-stat-lbl">Spent</div>
            </div>
            <div class="phone-stat">
              <div class="phone-stat-icon" style="background:#EBF4F0">◆</div>
              <div class="phone-stat-val">$2,037</div>
              <div class="phone-stat-lbl">Saved</div>
            </div>
          </div>

          <div class="phone-section-title">Recent</div>

          <div class="phone-tx">
            <div class="phone-tx-icon" style="background:rgba(232,137,58,0.12)">🛒</div>
            <div class="phone-tx-info">
              <div class="phone-tx-name">Whole Foods</div>
              <div class="phone-tx-cat">Groceries</div>
            </div>
            <div class="phone-tx-amt" style="color:#1C1A18">−$43.20</div>
          </div>
          <div class="phone-tx">
            <div class="phone-tx-icon" style="background:rgba(39,174,116,0.12)">↓</div>
            <div class="phone-tx-info">
              <div class="phone-tx-name">Freelance</div>
              <div class="phone-tx-cat">Income</div>
            </div>
            <div class="phone-tx-amt" style="color:#27AE74">+$800</div>
          </div>

          <div class="phone-nav">
            <div class="phone-nav-item active">
              <div class="phone-nav-icon">⌂</div>
              <div>Home</div>
            </div>
            <div class="phone-nav-item">
              <div class="phone-nav-icon">◎</div>
              <div>Flow</div>
            </div>
            <div class="phone-nav-item">
              <div class="phone-nav-icon">◈</div>
              <div>Goals</div>
            </div>
            <div class="phone-nav-item">
              <div class="phone-nav-icon">≡</div>
              <div>History</div>
            </div>
            <div class="phone-nav-item">
              <div class="phone-nav-icon">✦</div>
              <div>Pulse</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS BAND -->
<div class="stats-band">
  <div class="stats-inner">
    <div class="stat-item">
      <div class="stat-num">$2.4B</div>
      <div class="stat-lbl">tracked by users monthly</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">14K+</div>
      <div class="stat-lbl">active users</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">4.8★</div>
      <div class="stat-lbl">App Store rating</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">68%</div>
      <div class="stat-lbl">hit their goals within 90 days</div>
    </div>
  </div>
</div>

<!-- FEATURES -->
<section class="section" id="features" style="background: var(--surfaceAlt, #EDE7D9);">
  <div class="section-inner">
    <div class="section-tag">Features</div>
    <h2 class="section-title">Glass-clear <em>financial clarity</em></h2>
    <p class="section-sub">No more spreadsheet chaos. Tide layers your financial life into a beautifully simple system you'll actually use.</p>
    <div class="features-grid">
      ${[
        { icon: '◎', bg: '#EBF4F0', name: 'Cash Flow View', desc: 'Visual spending breakdown with a frosted glass donut chart. See exactly where your money flows by category.' },
        { icon: '◈', bg: '#EBF4F0', name: 'Smart Goals', desc: 'Set savings goals, track progress with animated rings, and get monthly contribution guidance to hit them on time.' },
        { icon: '✦', bg: '#FEF3E8', name: 'Weekly Pulse', desc: 'Personalized weekly insights: spending patterns, best weeks, category anomalies — written in plain language.' },
        { icon: '⌂', bg: '#EBF4F0', name: 'Net Worth Dashboard', desc: 'Your complete financial picture at a glance. Balance, income, spent and saved — with a live sparkline trend.' },
        { icon: '≡', bg: '#F0EEF8', name: 'Transaction History', desc: 'Clean, searchable transaction log with category tags, pending states, and smart search across all accounts.' },
        { icon: '◆', bg: '#FEF3E8', name: 'Budget Bars', desc: 'Monthly budget tracker with sub-category color segments. Know your remaining runway at any moment.' },
      ].map(f => `
      <div class="feature-card">
        <div class="feature-icon" style="background:${f.bg}">${f.icon}</div>
        <div class="feature-name">${f.name}</div>
        <div class="feature-desc">${f.desc}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section" id="how">
  <div class="section-inner">
    <div class="how-grid">
      <div>
        <div class="section-tag">How it works</div>
        <h2 class="section-title">Three steps to <em>clarity</em></h2>
        <p class="section-sub">Tide is designed to get out of your way. Set it up once, and your financial picture updates automatically.</p>
        <div class="steps">
          ${[
            { n: '1', t: 'Connect your accounts', d: 'Securely link your bank accounts and cards. We use read-only access — we can see, never touch.' },
            { n: '2', t: 'Set your goals and budget', d: 'Define your monthly spend budget and create savings goals. Tide does the math so you don\'t have to.' },
            { n: '3', t: 'Watch your Pulse weekly', d: 'Every Monday, Tide delivers your weekly financial pulse — what changed, what to watch, what\'s working.' },
          ].map(s => `
          <div class="step">
            <div class="step-num">${s.n}</div>
            <div>
              <div class="step-title">${s.t}</div>
              <div class="step-desc">${s.d}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="how-visual">
        <div class="visual-header">
          <div class="visual-title">Daily Spending · This Week</div>
          <div class="visual-period">April 2026</div>
        </div>
        <div class="bar-chart">
          ${[42, 87, 23, 134, 56, 198, 45].map((v, i) => `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100px;">
            <div style="width:100%; height:${Math.round(v/198*90)}px; background:${i===5?'#2A5F4A':'rgba(28,26,24,0.07)'}; border-radius:5px 5px 0 0;"></div>
          </div>`).join('')}
        </div>
        <div class="chart-labels" style="display:flex; gap:0;">
          ${['M','T','W','T','F','S','S'].map((d, i) => `
          <div style="flex:1; text-align:center; font-size:9px; color:${i===5?'#2A5F4A':'rgba(28,26,24,0.45)'}; font-weight:${i===5?700:400}; margin-top:6px;">${d}</div>`).join('')}
        </div>
        <div style="margin-top:20px; padding:14px; background:rgba(42,95,74,0.06); border-radius:12px;">
          <div style="font-size:11px; font-weight:700; color:#1C1A18; margin-bottom:4px;">This week vs last</div>
          <div style="font-size:11px; color:rgba(28,26,24,0.55);">You spent 18% less — your best week this month.</div>
          <div style="display:inline-flex; background:#EBF4F0; color:#2A5F4A; font-size:9px; font-weight:600; padding:3px 10px; border-radius:8px; margin-top:8px;">↓ 18% saved</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="section" id="pricing" style="background: var(--surfaceAlt, #EDE7D9);">
  <div class="section-inner">
    <div style="text-align:center; margin-bottom:48px;">
      <div class="section-tag" style="justify-content:center">Pricing</div>
      <h2 class="section-title">Simple, honest <em>pricing</em></h2>
      <p class="section-sub" style="margin:0 auto; text-align:center;">No hidden fees. No paywalled insights. Cancel anytime.</p>
    </div>
    <div class="pricing-grid">
      <div class="price-card">
        <div class="price-plan">Free</div>
        <div class="price-num">$0<span class="price-per">/mo</span></div>
        <div class="price-desc">For getting started and exploring what Tide can do.</div>
        <div class="price-features">
          ${['1 bank account', 'Monthly overview', 'Basic categories', '90-day history'].map(f => `<div class="price-feature"><span class="price-check">✓</span>${f}</div>`).join('')}
        </div>
        <a href="#cta" class="price-btn price-btn-outline">Get started</a>
      </div>
      <div class="price-card featured">
        <div class="price-tag">Most popular</div>
        <div class="price-plan">Pro</div>
        <div class="price-num">$8<span class="price-per">/mo</span></div>
        <div class="price-desc">For people serious about understanding their money.</div>
        <div class="price-features">
          ${['Unlimited accounts', 'Goals + progress rings', 'Weekly Pulse insights', 'Smart categorization', 'Full history export'].map(f => `<div class="price-feature"><span class="price-check">✓</span>${f}</div>`).join('')}
        </div>
        <a href="#cta" class="price-btn price-btn-solid">Start free trial</a>
      </div>
      <div class="price-card">
        <div class="price-plan">Family</div>
        <div class="price-num">$14<span class="price-per">/mo</span></div>
        <div class="price-desc">Share financial clarity with up to 5 family members.</div>
        <div class="price-features">
          ${['Everything in Pro', 'Up to 5 members', 'Shared goals', 'Family dashboard', 'Priority support'].map(f => `<div class="price-feature"><span class="price-check">✓</span>${f}</div>`).join('')}
        </div>
        <a href="#cta" class="price-btn price-btn-accent">Start free trial</a>
      </div>
    </div>
  </div>
</section>

<!-- CTA BAND -->
<div class="cta-band" id="cta">
  <h2 class="cta-title">Start seeing your money clearly</h2>
  <p class="cta-sub">Join 14,000+ people who finally understand where their money goes.</p>
  <div class="cta-actions">
    <a href="#" class="cta-btn-white">Get started — it's free</a>
    <a href="#features" class="cta-btn-ghost">Explore features</a>
  </div>
</div>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">tide<span>.</span></div>
  <div class="footer-links">
    <a href="#">Privacy</a>
    <a href="#">Terms</a>
    <a href="#">Support</a>
    <a href="#">Blog</a>
  </div>
  <div class="footer-copy">© 2026 Tide · Built by RAM Design Heartbeat</div>
</footer>

</body>
</html>`;

// ── VIEWER PAGE ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/tide.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero page…');
  const h = await publish('ram', SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${h.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const v = await publish('ram', `${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Interactive Viewer`);
  console.log(`Viewer: ${v.status} → https://ram.zenbin.org/${SLUG}-viewer`);
})();
