#!/usr/bin/env node
// finch-publish.js — Hero page + Viewer publisher for FINCH

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG     = 'finch';
const APP_NAME = 'FINCH';
const TAGLINE  = 'Know where your money flows';
const SUBDOMAIN= 'ram';

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

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>FINCH — Know where your money flows</title>
  <meta name="description" content="FINCH is a warm, joyful personal finance intelligence app. Track spending, manage budgets, and get AI-powered coaching — all in one beautiful light-mode dashboard.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#F5F3EF;--surface:#FFFFFF;--surface2:#FDFCFA;
      --text:#1C1917;--muted:rgba(28,25,23,0.45);
      --accent:#FF5C35;--accent2:#6366F1;
      --green:#16A34A;--amber:#D97706;--red:#DC2626;
      --border:rgba(28,25,23,0.08);--border-md:rgba(28,25,23,0.13);
      --accent-soft:rgba(255,92,53,0.08);
      --a2-soft:rgba(99,102,241,0.08);
      --green-soft:rgba(22,163,74,0.08);
    }
    body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;min-height:100vh;overflow-x:hidden}

    /* Subtle dot grid */
    body::before{content:'';position:fixed;inset:0;
      background-image:radial-gradient(circle,rgba(28,25,23,0.06) 1px,transparent 1px);
      background-size:24px 24px;pointer-events:none;z-index:0}

    nav{position:fixed;top:0;left:0;right:0;z-index:100;
      background:rgba(245,243,239,0.88);backdrop-filter:blur(16px);
      border-bottom:1px solid var(--border);
      display:flex;align-items:center;justify-content:space-between;
      padding:0 40px;height:56px}
    .nav-brand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:16px;letter-spacing:-0.02em}
    .nav-brand-dot{width:10px;height:10px;border-radius:50%;background:var(--accent)}
    .nav-links{display:flex;align-items:center;gap:28px}
    .nav-links a{font-size:14px;color:var(--muted);text-decoration:none;font-weight:500;transition:color .2s}
    .nav-links a:hover{color:var(--text)}
    .nav-cta{background:var(--accent);color:#fff;border:none;padding:8px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .2s}
    .nav-cta:hover{opacity:0.88}

    section{position:relative;z-index:1}

    /* ─ HERO ─ */
    .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 24px 60px}
    .hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:var(--accent-soft);border:1px solid rgba(255,92,53,0.18);border-radius:99px;padding:6px 14px;margin-bottom:28px;font-size:12px;font-weight:600;color:var(--accent);letter-spacing:0.05em}
    .hero h1{font-size:clamp(48px,7vw,84px);font-weight:900;line-height:1.05;letter-spacing:-0.04em;max-width:800px;margin:0 auto 20px}
    .hero h1 em{font-style:normal;color:var(--accent)}
    .hero-sub{font-size:18px;color:var(--muted);max-width:480px;margin:0 auto 40px;line-height:1.6}
    .hero-cta-row{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
    .btn-primary{background:var(--accent);color:#fff;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;transition:opacity .2s}
    .btn-primary:hover{opacity:0.88}
    .btn-secondary{background:var(--surface);color:var(--text);padding:14px 28px;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none;border:1px solid var(--border-md);transition:background .2s}
    .btn-secondary:hover{background:#F0EDE8}
    .hero-note{margin-top:14px;font-size:12px;color:var(--muted)}

    /* phone mockup */
    .phone-wrap{margin-top:60px;position:relative;display:inline-block}
    .phone{width:280px;height:560px;background:var(--surface);border-radius:36px;box-shadow:0 32px 80px rgba(28,25,23,0.12),0 4px 16px rgba(28,25,23,0.06);overflow:hidden;border:1px solid var(--border);position:relative}
    .phone-screen{width:100%;height:100%;background:var(--bg);position:relative;overflow:hidden}
    /* Status bar */
    .ph-status{height:28px;background:var(--surface);display:flex;align-items:center;justify-content:space-between;padding:0 14px;font-size:8px;font-weight:600;color:var(--text)}
    /* Hero spend card inside phone */
    .ph-hero-card{margin:8px 10px;background:var(--accent);border-radius:16px;padding:14px;color:#fff}
    .ph-hero-card .label{font-size:6px;font-weight:700;letter-spacing:1.5px;opacity:0.7;margin-bottom:4px}
    .ph-hero-card .amount{font-size:32px;font-weight:900;line-height:1;margin-bottom:4px}
    .ph-hero-card .sub{font-size:7px;opacity:0.78}
    .ph-bar-track{height:4px;background:rgba(255,255,255,0.25);border-radius:2px;margin-top:8px}
    .ph-bar-fill{height:4px;width:72%;background:#fff;border-radius:2px}
    /* Category rows */
    .ph-section-label{font-size:6px;font-weight:700;letter-spacing:1.5px;color:var(--muted);padding:8px 10px 4px;text-transform:uppercase}
    .ph-cat-row{display:flex;align-items:center;gap:7px;margin:0 10px 5px;background:var(--surface);border-radius:10px;padding:7px 8px}
    .ph-cat-icon{width:24px;height:24px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
    .ph-cat-name{font-size:8px;font-weight:600;flex:1}
    .ph-cat-amt{font-size:8px;font-weight:700}
    .ph-nav{height:50px;background:var(--surface);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-around;padding:0 6px;position:absolute;bottom:0;left:0;right:0}
    .ph-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px}
    .ph-nav-icon{font-size:12px;color:var(--muted)}
    .ph-nav-icon.active{color:var(--accent)}
    .ph-nav-label{font-size:5px;color:var(--muted);font-weight:500}
    .ph-nav-label.active{color:var(--accent);font-weight:700}

    /* ─ METRICS ─ */
    .metrics{padding:80px 40px;max-width:960px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
    @media(max-width:640px){.metrics{grid-template-columns:1fr}}
    .metric-card{background:var(--surface);border-radius:20px;border:1px solid var(--border);padding:32px 28px}
    .metric-num{font-size:48px;font-weight:900;letter-spacing:-0.04em;line-height:1}
    .metric-label{font-size:13px;color:var(--muted);margin-top:8px;font-weight:500}

    /* ─ FEATURES ─ */
    .features{padding:80px 40px;max-width:960px;margin:0 auto}
    .features-header{text-align:center;margin-bottom:52px}
    .features-header h2{font-size:clamp(32px,4vw,48px);font-weight:900;letter-spacing:-0.03em}
    .features-header p{font-size:16px;color:var(--muted);margin-top:10px}
    .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    @media(max-width:640px){.features-grid{grid-template-columns:1fr}}
    .feat-card{background:var(--surface);border-radius:18px;border:1px solid var(--border);padding:28px 24px}
    .feat-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}
    .feat-card h3{font-size:15px;font-weight:700;margin-bottom:6px}
    .feat-card p{font-size:13px;color:var(--muted);line-height:1.6}

    /* ─ SCREENS SHOWCASE ─ */
    .screens{padding:80px 40px;text-align:center;overflow:hidden}
    .screens h2{font-size:clamp(28px,4vw,42px);font-weight:900;letter-spacing:-0.03em;margin-bottom:8px}
    .screens p{font-size:15px;color:var(--muted);margin-bottom:40px}
    .screens-strip{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
    .screen-pill{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:10px 18px;font-size:13px;font-weight:600;color:var(--muted)}
    .screen-pill.active{background:var(--accent);border-color:var(--accent);color:#fff}

    /* ─ CTA BANNER ─ */
    .cta-banner{margin:40px 40px 80px;background:var(--accent);border-radius:28px;padding:60px 40px;text-align:center;color:#fff}
    .cta-banner h2{font-size:clamp(28px,4vw,42px);font-weight:900;letter-spacing:-0.03em;margin-bottom:10px}
    .cta-banner p{font-size:16px;opacity:0.80;margin-bottom:32px}
    .btn-cta-inv{background:#fff;color:var(--accent);padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;transition:opacity .2s}
    .btn-cta-inv:hover{opacity:0.90}

    /* ─ FOOTER ─ */
    footer{padding:24px 40px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--muted)}
    .footer-brand{font-weight:800;font-size:14px;letter-spacing:-0.02em;color:var(--text)}

    a{color:inherit;text-decoration:none}
  </style>
</head>
<body>

<nav>
  <div class="nav-brand"><span class="nav-brand-dot"></span>FINCH</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="/finch-viewer">View Design</a>
  </div>
  <button class="nav-cta">Get Early Access</button>
</nav>

<!-- HERO -->
<section class="hero">
  <div>
    <div class="hero-eyebrow">✦ Personal Finance Intelligence</div>
    <h1>Know where your<br><em>money flows</em></h1>
    <p class="hero-sub">Finch turns your transactions into clear insights, beautiful budgets, and AI coaching that actually helps.</p>
    <div class="hero-cta-row">
      <a href="/finch-viewer" class="btn-primary">View Design Prototype</a>
      <a href="/finch-mock" class="btn-secondary">Interactive Mock →</a>
    </div>
    <p class="hero-note">5 screens · Light mode · Warm design system</p>

    <!-- Phone mockup -->
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-screen">
          <div class="ph-status">
            <span>9:41</span><span>● ▲ ⊟</span>
          </div>
          <div style="padding:6px 10px 0;background:var(--surface)">
            <div style="font-size:10px;font-weight:600;color:var(--text)">Good morning, Zara ✦</div>
            <div style="font-size:7px;color:var(--muted)">March 2026</div>
          </div>
          <div style="height:1px;background:var(--border);margin:0 0 6px"></div>
          <div class="ph-hero-card">
            <div class="label">TOTAL SPENT · MARCH</div>
            <div class="amount">$3,241</div>
            <div class="sub">of $4,500 budget &nbsp;·&nbsp; 72%</div>
            <div class="ph-bar-track"><div class="ph-bar-fill"></div></div>
          </div>
          <!-- bento row -->
          <div style="display:flex;gap:5px;margin:6px 10px">
            <div style="flex:1;background:var(--surface);border-radius:10px;padding:6px 8px;border:1px solid var(--border)">
              <div style="font-size:5px;font-weight:700;letter-spacing:1px;color:var(--muted);margin-bottom:2px">DAYS LEFT</div>
              <div style="font-size:18px;font-weight:900">16</div>
            </div>
            <div style="flex:1;background:var(--surface);border-radius:10px;padding:6px 8px;border:1px solid var(--border)">
              <div style="font-size:5px;font-weight:700;letter-spacing:1px;color:var(--muted);margin-bottom:2px">DAILY AVG</div>
              <div style="font-size:18px;font-weight:900">$104</div>
            </div>
          </div>
          <div class="ph-section-label">TOP CATEGORIES</div>
          <div class="ph-cat-row">
            <div class="ph-cat-icon" style="background:rgba(99,102,241,0.10)">🏠</div>
            <div><div class="ph-cat-name">Housing</div><div style="font-size:6px;color:var(--muted)">82% of budget</div></div>
            <div class="ph-cat-amt">$1,200</div>
          </div>
          <div class="ph-cat-row">
            <div class="ph-cat-icon" style="background:rgba(255,92,53,0.10)">🍽️</div>
            <div><div class="ph-cat-name">Food & Drink</div><div style="font-size:6px;color:var(--muted)">67% of budget</div></div>
            <div class="ph-cat-amt">$486</div>
          </div>
          <div class="ph-cat-row">
            <div class="ph-cat-icon" style="background:rgba(22,163,74,0.10)">🚗</div>
            <div><div class="ph-cat-name">Transport</div><div style="font-size:6px;color:var(--muted)">30% of budget</div></div>
            <div class="ph-cat-amt">$218</div>
          </div>
          <div class="ph-nav">
            <div class="ph-nav-item"><div class="ph-nav-icon active">⌂</div><div class="ph-nav-label active">Home</div></div>
            <div class="ph-nav-item"><div class="ph-nav-icon">◈</div><div class="ph-nav-label">Spend</div></div>
            <div class="ph-nav-item"><div class="ph-nav-icon">⇄</div><div class="ph-nav-label">Txns</div></div>
            <div class="ph-nav-item"><div class="ph-nav-icon">◎</div><div class="ph-nav-label">Budget</div></div>
            <div class="ph-nav-item"><div class="ph-nav-icon">✦</div><div class="ph-nav-label">Insights</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- METRICS -->
<section id="metrics">
  <div class="metrics">
    <div class="metric-card">
      <div class="metric-num" style="color:var(--accent)">5</div>
      <div class="metric-label">Screens designed — Dashboard, Categories, Transactions, Budget, Insights</div>
    </div>
    <div class="metric-card">
      <div class="metric-num" style="color:var(--accent2)">3</div>
      <div class="metric-label">Research sources — Capchase, Amie (Godly), Equals on Land-book</div>
    </div>
    <div class="metric-card">
      <div class="metric-num" style="color:var(--green)">1</div>
      <div class="metric-label">Trend at the core — warm cream replacing cold white in data SaaS</div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features" id="features">
  <div class="features-header">
    <h2>Built for real people,<br>not spreadsheet nerds</h2>
    <p>Everything you need to understand your money — nothing you don't.</p>
  </div>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--accent-soft)">📊</div>
      <h3>Bento Dashboard</h3>
      <p>Hero spend card + mini bento grid for days left and daily avg — info architecture inspired by Capchase's clean data hierarchy.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--a2-soft)">🎯</div>
      <h3>Category Tracking</h3>
      <p>Color-coded progress bars, over-budget alerts, and sub-category detail — modeled on Equals' analytical clarity.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--green-soft)">✦</div>
      <h3>AI Coaching</h3>
      <p>Finch AI surfaces actionable insights weekly — like spotting your coffee overspend and calculating how much you'd save.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:rgba(217,119,6,0.08)">⊛</div>
      <h3>Budget Rings</h3>
      <p>Circular progress rings + allocation breakdown — visual budget status at a glance, without the anxiety.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--accent-soft)">⇄</div>
      <h3>Transaction Feed</h3>
      <p>Grouped by day, searchable, filterable. Income green, spending neutral — so your paycheck feels like a win.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--a2-soft)">◎</div>
      <h3>Warm Design System</h3>
      <p>Cream #F5F3EF backgrounds, coral #FF5C35 accent, deep type hierarchy. Approachable, not clinical.</p>
    </div>
  </div>
</section>

<!-- SCREENS -->
<section class="screens" id="screens">
  <h2>Five screens, zero noise</h2>
  <p>Each screen solves exactly one job. Nothing more.</p>
  <div class="screens-strip">
    <div class="screen-pill active">Dashboard</div>
    <div class="screen-pill">Categories</div>
    <div class="screen-pill">Transactions</div>
    <div class="screen-pill">Budget</div>
    <div class="screen-pill">Insights</div>
  </div>
  <div style="margin-top:36px">
    <a href="/finch-viewer" class="btn-primary">Open Pencil Viewer →</a>
  </div>
</section>

<!-- CTA -->
<div class="cta-banner">
  <h2>Money, finally beautiful</h2>
  <p>Join the waitlist — Finch launches this summer.</p>
  <a href="/finch-mock" class="btn-cta-inv">Try the Interactive Mock</a>
</div>

<!-- FOOTER -->
<footer>
  <div class="footer-brand">✦ FINCH</div>
  <div>Designed by RAM · Design Heartbeat · March 2026</div>
  <div>Inspired by Capchase · Amie · Equals</div>
</footer>

</body>
</html>`;

// ─── VIEWER HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const penJson = fs.readFileSync(path.join(__dirname, 'finch.pen'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── PUBLISH ───────────────────────────────────────────────────────────────────
async function publish(slug, html) {
  const r = await post('zenbin.org', '/api/pages', { 'X-Subdomain': SUBDOMAIN }, { slug, html });
  const data = JSON.parse(r.body);
  const url = data.url || `https://${SUBDOMAIN}.zenbin.org/${slug}`;
  console.log(`✓ ${slug} → ${url} (${r.status})`);
  return url;
}

(async () => {
  const heroUrl   = await publish(SLUG, heroHtml);
  const viewerUrl = await publish(`${SLUG}-viewer`, viewerHtml);
  console.log('\nHero:  ', heroUrl);
  console.log('Viewer:', viewerUrl);
})().catch(console.error);
