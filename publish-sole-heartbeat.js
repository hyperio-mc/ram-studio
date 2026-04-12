'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'sole';
const VIEWER_SLUG = 'sole-viewer';
const APP_NAME    = 'SOLE';
const TAGLINE     = 'Your whole business, one view';
const ARCHETYPE   = 'productivity-finance';

const ORIGINAL_PROMPT = `Design SOLE — a light-themed business OS for one-person companies.
Inspired by:
1. Midday.ai (darkmodedesign.com) — "For the new wave of one-person companies" — clean financial OS, beautifully typeset data, monospace numbers
2. Locomotive (godly.website) — editorial grid layouts, large typographic hierarchy, numbers as design elements
3. Lapa.ninja recent — Overlay, Paperclip, Ape AI — warm off-white precision utility apps
Light palette: warm parchment #F5F0E8 + ink black #1C1A16 + terracotta #C25234 + sage #4A7256 + amber #C07020
6 screens: Today (dashboard), Money (P&L + cashflow), Clients (portfolio), Work (projects), Invoices, You (report card)`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
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

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ html, title });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    }
  }, body);
}

// ── Hero page ─────────────────────────────────────────────────────────────────
function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SOLE — Your whole business, one view</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#F5F0E8;--surface:#FFFFFF;--surface2:#EDE8DE;
    --text:#1C1A16;--textMid:#5A5650;--muted:#9A9590;
    --border:#E0DAD0;--border2:#CFC9BE;
    --accent:#C25234;--accentLt:#F0E5DF;
    --sage:#4A7256;--sageLt:#DFF0E6;
    --amber:#C07020;--amberLt:#F5E8CE;
  }
  html{scroll-behavior:smooth}
  body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--text);line-height:1.5;overflow-x:hidden}

  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;background:rgba(245,240,232,0.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
  .nav-logo{font-size:17px;font-weight:800;letter-spacing:-0.5px;color:var(--text)}
  .nav-logo span{color:var(--accent)}
  .nav-links{display:flex;gap:32px;list-style:none}
  .nav-links a{font-size:13px;font-weight:500;color:var(--textMid);text-decoration:none;transition:color .2s}
  .nav-links a:hover{color:var(--accent)}
  .nav-cta{background:var(--accent);color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;transition:opacity .2s}
  .nav-cta:hover{opacity:.88}

  .hero{padding:96px 48px 80px;max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
  .hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:var(--accentLt);border:1px solid rgba(194,82,52,.25);color:var(--accent);font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;letter-spacing:.8px;text-transform:uppercase;margin-bottom:28px}
  .hero-eyebrow-dot{width:6px;height:6px;background:var(--accent);border-radius:50%}
  .hero h1{font-size:64px;font-weight:800;line-height:1.0;letter-spacing:-3px;color:var(--text);margin-bottom:24px}
  .hero h1 .accent{color:var(--accent)}
  .hero p{font-size:17px;color:var(--textMid);line-height:1.65;max-width:460px;margin-bottom:40px}
  .hero-actions{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  .btn-primary{background:var(--accent);color:#fff;border:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 20px rgba(194,82,52,.3)}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(194,82,52,.4)}
  .btn-secondary{background:var(--surface);color:var(--text);border:1px solid var(--border);padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;transition:border-color .2s,color .2s}
  .btn-secondary:hover{border-color:var(--accent);color:var(--accent)}

  .hero-screens{display:grid;grid-template-columns:1fr 1fr;gap:12px;transform:perspective(1200px) rotateY(-8deg) rotateX(4deg)}
  .screen-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:16px;height:180px;overflow:hidden;box-shadow:0 8px 32px rgba(28,26,22,.08)}
  .screen-card:nth-child(3),.screen-card:nth-child(4){margin-top:20px}
  .sc-label{font-size:9px;font-weight:700;color:var(--muted);letter-spacing:.8px;text-transform:uppercase;margin-bottom:8px}
  .sc-big{font-size:24px;font-weight:800;color:var(--text);letter-spacing:-1px;line-height:1.1}
  .sc-sub{font-size:10px;color:var(--muted);margin-top:4px}
  .sc-bar-row{display:flex;align-items:flex-end;gap:4px;margin-top:12px;height:36px}
  .sc-bar{border-radius:3px;flex:1}
  .sc-list{display:flex;flex-direction:column;gap:6px;margin-top:8px}
  .sc-list-item{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--text);font-weight:500}
  .sc-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
  .sc-amount{margin-left:auto;font-weight:700;font-size:10px}
  .sc-prog-wrap{margin-top:8px}
  .sc-prog-row{margin-bottom:6px}
  .sc-prog-labels{display:flex;justify-content:space-between;margin-bottom:3px}
  .sc-prog-labels span{font-size:9px;color:var(--muted)}
  .sc-prog-bar{height:4px;background:var(--surface2);border-radius:2px;overflow:hidden}
  .sc-prog-fill{height:100%;border-radius:2px}

  .stats-bar{display:flex;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--surface);overflow:hidden}
  .stat-item{flex:1;padding:28px 24px;border-right:1px solid var(--border);text-align:center}
  .stat-item:last-child{border-right:none}
  .stat-value{font-size:34px;font-weight:800;color:var(--text);letter-spacing:-1.5px;line-height:1}
  .stat-label{font-size:12px;color:var(--muted);margin-top:6px;font-weight:500}

  .features{padding:96px 48px;max-width:1200px;margin:0 auto}
  .features-header{text-align:center;margin-bottom:72px}
  .features-header h2{font-size:44px;font-weight:800;letter-spacing:-2px;color:var(--text);margin-bottom:14px}
  .features-header p{font-size:17px;color:var(--textMid)}
  .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .feature-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px;transition:box-shadow .2s,transform .2s}
  .feature-card:hover{box-shadow:0 12px 40px rgba(28,26,22,.1);transform:translateY(-2px)}
  .feature-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:20px}
  .feature-card h3{font-size:17px;font-weight:700;margin-bottom:10px;color:var(--text)}
  .feature-card p{font-size:13px;color:var(--textMid);line-height:1.6}

  .screens-section{background:var(--surface2);padding:80px 48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .screens-label{text-align:center;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
  .screens-title{text-align:center;font-size:34px;font-weight:800;letter-spacing:-1.5px;color:var(--text);margin-bottom:48px}
  .screens-row{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px;justify-content:center;flex-wrap:wrap}
  .screen-preview{background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:18px;width:185px;flex-shrink:0;box-shadow:0 4px 16px rgba(28,26,22,.06)}
  .sp-bar{height:4px;border-radius:2px;margin-bottom:10px}
  .sp-title{font-size:11px;font-weight:700;color:var(--text);margin-bottom:5px}
  .sp-sub{font-size:9px;color:var(--muted);line-height:1.4}
  .sp-big{font-size:18px;font-weight:800;letter-spacing:-.5px;margin:6px 0 3px}
  .sp-rows{display:flex;flex-direction:column;gap:4px;margin-top:8px}
  .sp-row{height:20px;background:var(--surface);border-radius:4px;border-left:2px solid;display:flex;align-items:center;padding:0 7px;font-size:8px;font-weight:600;color:var(--textMid)}

  .pricing{padding:96px 48px;max-width:900px;margin:0 auto;text-align:center}
  .pricing h2{font-size:38px;font-weight:800;letter-spacing:-1.5px;color:var(--text);margin-bottom:14px}
  .pricing-sub{font-size:17px;color:var(--textMid);margin-bottom:56px}
  .pricing-card{background:var(--surface);border:2px solid var(--border);border-radius:20px;padding:48px;max-width:420px;margin:0 auto;box-shadow:0 8px 40px rgba(28,26,22,.08)}
  .pricing-plan{font-size:12px;font-weight:700;color:var(--accent);letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}
  .pricing-amount{font-size:50px;font-weight:800;letter-spacing:-2px;color:var(--text)}
  .pricing-period{font-size:14px;color:var(--muted)}
  .pricing-features{list-style:none;margin:32px 0;text-align:left}
  .pricing-features li{display:flex;gap:12px;align-items:flex-start;font-size:14px;color:var(--textMid);margin-bottom:14px}
  .pricing-features li::before{content:'✓';color:var(--sage);font-weight:700;flex-shrink:0;margin-top:1px}
  .pricing-cta{display:block;width:100%;background:var(--accent);color:#fff;border:none;padding:16px;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;transition:opacity .2s;text-decoration:none}
  .pricing-cta:hover{opacity:.88}

  footer{background:var(--surface);border-top:1px solid var(--border);padding:32px 48px;display:flex;align-items:center;justify-content:space-between}
  footer .logo{font-size:16px;font-weight:800;color:var(--text)}
  footer .logo span{color:var(--accent)}
  footer p{font-size:12px;color:var(--muted)}

  @media(max-width:900px){
    nav{padding:16px 24px}
    .hero{grid-template-columns:1fr;padding:60px 24px 40px;gap:40px}
    .hero h1{font-size:44px}
    .hero-screens{display:none}
    .features{padding:60px 24px}
    .features-grid{grid-template-columns:1fr}
    .stats-bar{flex-direction:column}
    .stat-item{border-right:none;border-bottom:1px solid var(--border)}
    footer{flex-direction:column;gap:16px;text-align:center}
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">SOLE<span>.</span></div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#pricing">Pricing</a></li>
  </ul>
  <a href="https://ram.zenbin.org/sole-mock" class="nav-cta">Try mock →</a>
</nav>

<section class="hero">
  <div class="hero-copy">
    <div class="hero-eyebrow"><span class="hero-eyebrow-dot"></span> For one-person companies</div>
    <h1>Your whole<br>business,<br><span class="accent">one view.</span></h1>
    <p>SOLE is the business OS for the new wave of independent operators. Revenue, clients, work, and invoices — every number, one place, beautifully clear.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/sole-viewer" class="btn-primary">View prototype</a>
      <a href="https://ram.zenbin.org/sole-mock" class="btn-secondary">Interactive mock ☀◑</a>
    </div>
  </div>

  <div class="hero-screens">
    <div class="screen-card">
      <div class="sc-label">Today</div>
      <div style="font-size:34px;font-weight:800;color:#1C1A16;letter-spacing:-2px;line-height:1">24</div>
      <div style="font-size:12px;font-weight:700;color:#C25234;margin-top:3px">MAR 2026</div>
      <div class="sc-bar-row">
        <div class="sc-bar" style="height:19px;background:#EDE8DE"></div>
        <div class="sc-bar" style="height:23px;background:#EDE8DE"></div>
        <div class="sc-bar" style="height:17px;background:#EDE8DE"></div>
        <div class="sc-bar" style="height:26px;background:#EDE8DE"></div>
        <div class="sc-bar" style="height:22px;background:#EDE8DE"></div>
        <div class="sc-bar" style="height:31px;background:#C25234"></div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-label">Revenue</div>
      <div class="sc-big" style="color:#4A7256">£18,400</div>
      <div class="sc-sub">+12% vs last month</div>
      <div class="sc-list">
        <div class="sc-list-item"><span class="sc-dot" style="background:#4A7256"></span>Revenue<span class="sc-amount" style="color:#4A7256">£18.4k</span></div>
        <div class="sc-list-item"><span class="sc-dot" style="background:#C25234"></span>Expenses<span class="sc-amount" style="color:#C25234">£4.2k</span></div>
        <div class="sc-list-item" style="font-weight:700"><span class="sc-dot" style="background:#1C1A16"></span>Net<span class="sc-amount">£14.2k</span></div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-label">Clients</div>
      <div class="sc-list">
        <div class="sc-list-item"><span class="sc-dot" style="background:#4A7256"></span>Aria Studios<span class="sc-amount">£2,400/mo</span></div>
        <div class="sc-list-item"><span class="sc-dot" style="background:#C07020"></span>Northfield<span class="sc-amount">£3,800</span></div>
        <div class="sc-list-item"><span class="sc-dot" style="background:#C25234"></span>TwoRoads<span class="sc-amount">£5,000</span></div>
      </div>
      <div style="margin-top:10px;font-size:9px;color:#9A9590">5 active relationships</div>
    </div>
    <div class="screen-card">
      <div class="sc-label">Active work</div>
      <div class="sc-prog-wrap">
        <div class="sc-prog-row">
          <div class="sc-prog-labels"><span>Brand Identity</span><span style="color:#4A7256;font-weight:700">75%</span></div>
          <div class="sc-prog-bar"><div class="sc-prog-fill" style="width:75%;background:#4A7256"></div></div>
        </div>
        <div class="sc-prog-row">
          <div class="sc-prog-labels"><span>Website Redesign</span><span style="color:#C25234;font-weight:700">15%</span></div>
          <div class="sc-prog-bar"><div class="sc-prog-fill" style="width:15%;background:#C25234"></div></div>
        </div>
        <div class="sc-prog-row">
          <div class="sc-prog-labels"><span>Pitch Deck</span><span style="color:#C07020;font-weight:700">40%</span></div>
          <div class="sc-prog-bar"><div class="sc-prog-fill" style="width:40%;background:#C07020"></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="stats-bar">
  <div class="stat-item"><div class="stat-value">6</div><div class="stat-label">Screens in design</div></div>
  <div class="stat-item"><div class="stat-value" style="color:#C25234">521</div><div class="stat-label">Total design elements</div></div>
  <div class="stat-item"><div class="stat-value" style="color:#4A7256">Light</div><div class="stat-label">Warm parchment theme</div></div>
  <div class="stat-item"><div class="stat-value">RAM</div><div class="stat-label">Design AI · 2026</div></div>
</div>

<section class="features" id="features">
  <div class="features-header">
    <h2>Everything a one-person company needs</h2>
    <p>No spreadsheets. No switching apps. Just clarity.</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:#F0E5DF">◈</div>
      <h3>Today — Morning pulse</h3>
      <p>Revenue trend, today's priorities, and client status. Your daily brief, beautifully typeset like an editorial dashboard.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:#DFF0E6">◉</div>
      <h3>Money — Live P&L</h3>
      <p>Real-time profit & loss, cashflow bars, and every transaction unified. Know your net before you open email.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:#F5E8CE">◫</div>
      <h3>Clients — Your portfolio</h3>
      <p>Every relationship, its status, value, and last contact. Retainer, proposal, invoice — all tracked, all visible.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:#EDE8DE">◧</div>
      <h3>Work — Projects & time</h3>
      <p>Active projects with progress, time logged, and deadlines. Capacity utilisation so you never over-commit.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:#F0E5DF">◎</div>
      <h3>Invoices — Get paid</h3>
      <p>Outstanding, sent, paid, overdue — every invoice with one-tap actions. Create, chase, and collect from one screen.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:#DFF0E6">◌</div>
      <h3>You — Report card</h3>
      <p>Monthly business health: effective rate, revenue growth, collection rate. Know if your business is actually working.</p>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-label">Design preview</div>
  <div class="screens-title">6 screens. Complete picture.</div>
  <div class="screens-row">
    <div class="screen-preview">
      <div class="sp-bar" style="background:#C25234;width:60%"></div>
      <div class="sp-title">Today</div>
      <div style="font-size:20px;font-weight:800;letter-spacing:-1px;color:#1C1A16">24 MAR</div>
      <div class="sp-big" style="color:#1C1A16;font-size:14px;margin-top:4px">£18,400</div>
      <div class="sp-sub">Revenue this month</div>
      <div class="sp-rows">
        <div class="sp-row" style="border-color:#C25234">Proposal — Aria</div>
        <div class="sp-row" style="border-color:#4A7256;opacity:.5">Review invoice ✓</div>
        <div class="sp-row" style="border-color:#C07020">Call TwoRoads</div>
      </div>
    </div>
    <div class="screen-preview">
      <div class="sp-bar" style="background:#4A7256;width:80%"></div>
      <div class="sp-title">Money</div>
      <div class="sp-big" style="color:#4A7256">£14,190</div>
      <div class="sp-sub">Net profit March</div>
      <div class="sp-rows">
        <div class="sp-row" style="border-color:#4A7256">+£3,800 Northfield</div>
        <div class="sp-row" style="border-color:#C25234">– £58 Adobe CC</div>
        <div class="sp-row" style="border-color:#4A7256">+£2,500 deposit</div>
      </div>
    </div>
    <div class="screen-preview">
      <div class="sp-bar" style="background:#C07020;width:50%"></div>
      <div class="sp-title">Clients</div>
      <div class="sp-rows" style="margin-top:4px">
        <div class="sp-row" style="border-color:#4A7256">Aria Studios</div>
        <div class="sp-row" style="border-color:#C07020">Northfield Co.</div>
        <div class="sp-row" style="border-color:#C25234">TwoRoads Ltd</div>
        <div class="sp-row" style="border-color:#4A7256">Clearpath</div>
        <div class="sp-row" style="border-color:#CFC9BE;opacity:.5">Modo Collective</div>
      </div>
    </div>
    <div class="screen-preview">
      <div class="sp-bar" style="background:#C07020;width:55%"></div>
      <div class="sp-title">Work</div>
      <div class="sp-sub" style="margin-bottom:5px">22h / 40h this week</div>
      <div class="sp-rows">
        <div class="sp-row" style="border-color:#4A7256">Identity 75%</div>
        <div class="sp-row" style="border-color:#C25234">Website 15%</div>
        <div class="sp-row" style="border-color:#C07020">Pitch Deck 40%</div>
      </div>
    </div>
    <div class="screen-preview">
      <div class="sp-bar" style="background:#C07020;width:40%"></div>
      <div class="sp-title">Invoices</div>
      <div class="sp-big" style="color:#C07020;font-size:14px">£8,800 out</div>
      <div class="sp-sub">2 outstanding</div>
      <div class="sp-rows">
        <div class="sp-row" style="border-color:#9A9590;opacity:.6">#0044 DRAFT</div>
        <div class="sp-row" style="border-color:#C07020">#0043 SENT</div>
        <div class="sp-row" style="border-color:#4A7256;opacity:.5">#0042 PAID</div>
      </div>
    </div>
    <div class="screen-preview">
      <div class="sp-bar" style="background:#4A7256;width:78%"></div>
      <div class="sp-title">You</div>
      <div class="sp-big" style="color:#4A7256;font-size:14px">£209/h</div>
      <div class="sp-sub">Effective rate March</div>
      <div class="sp-rows">
        <div class="sp-row" style="border-color:#4A7256">Growth 78%</div>
        <div class="sp-row" style="border-color:#4A7256">Collection 92%</div>
        <div class="sp-row" style="border-color:#C25234">Capacity 63%</div>
      </div>
    </div>
  </div>
</section>

<section class="pricing" id="pricing">
  <h2>Simple pricing for one person</h2>
  <p class="pricing-sub">Everything included. No per-seat nonsense.</p>
  <div class="pricing-card">
    <div class="pricing-plan">Solo Plan</div>
    <div class="pricing-amount">£12<span class="pricing-period">/mo</span></div>
    <ul class="pricing-features">
      <li>Unlimited clients and projects</li>
      <li>Live P&L and cashflow tracking</li>
      <li>Invoice creation and automatic reminders</li>
      <li>Time logging and effective rate calculator</li>
      <li>Monthly business health report card</li>
      <li>Bank sync — UK, EU, and US</li>
    </ul>
    <a href="#" class="pricing-cta">Start free — no card needed</a>
  </div>
</section>

<footer>
  <div class="logo">SOLE<span>.</span></div>
  <p>The business OS for one-person companies.</p>
  <div style="font-size:11px;color:var(--muted)">Designed by RAM · 2026</div>
</footer>

</body>
</html>`;
}

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SOLE — Design Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#F5F0E8;color:#1C1A16;font-family:'Inter',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px}
  h1{font-size:28px;font-weight:900;letter-spacing:-1px;margin-bottom:8px;color:#1C1A16}
  p{color:#9A9590;font-size:14px;margin-bottom:30px}
  .viewer-links{display:flex;gap:16px;margin-top:30px;flex-wrap:wrap;justify-content:center}
  .viewer-links a{color:#C25234;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border:1px solid rgba(194,82,52,.4);border-radius:8px;transition:background .2s}
  .viewer-links a:hover{background:rgba(194,82,52,.08)}
</style>
<script>
  // Pen data injected here
<\/script>
</head>
<body>
  <div style="text-align:center">
    <div style="font-size:13px;font-weight:700;color:#C25234;letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px">Business OS</div>
    <h1>SOLE.</h1>
    <p>Your whole business, one view — Design Prototype</p>
    <p style="color:#CFC9BE;font-size:12px;margin-top:8px">Pen data embedded. Open in Pencil.dev to explore all 6 screens.</p>
  </div>
  <div class="viewer-links">
    <a href="https://ram.zenbin.org/sole">← Hero Page</a>
    <a href="https://ram.zenbin.org/sole-mock">Interactive Mock →</a>
  </div>
</body>
</html>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Svelte mock ───────────────────────────────────────────────────────────────
async function buildSvelteMock() {
  const { buildMock, generateSvelteComponent, publishMock } = await import('./svelte-mock-builder.mjs');

  const design = {
    appName:   APP_NAME,
    tagline:   TAGLINE,
    archetype: ARCHETYPE,
    palette: {
      bg:      '#1C1A16',
      surface: '#282420',
      text:    '#F5F0E8',
      accent:  '#C25234',
      accent2: '#4A7256',
      muted:   'rgba(245,240,232,0.4)',
    },
    lightPalette: {
      bg:      '#F5F0E8',
      surface: '#FFFFFF',
      text:    '#1C1A16',
      accent:  '#C25234',
      accent2: '#4A7256',
      muted:   'rgba(28,26,22,0.4)',
    },
    screens: [
      {
        id: 'today', label: 'Today',
        content: [
          { type: 'metric', label: 'Revenue This Month', value: '£18,400', sub: '+12% vs last month — best month ever' },
          { type: 'metric-row', items: [{ label: 'Net Profit', value: '£14.2k' }, { label: 'Expenses', value: '£4.2k' }, { label: 'Tax Est', value: '£3.5k' }] },
          { type: 'tags', label: "Today's Focus", items: ['Send Proposal', 'Review Invoice', 'Call TwoRoads'] },
          { type: 'list', items: [
            { icon: 'star', title: 'Aria Studios', sub: 'Active retainer', badge: '£2,400/mo' },
            { icon: 'alert', title: 'Northfield Co.', sub: 'Invoice outstanding', badge: '£3,800' },
            { icon: 'share', title: 'TwoRoads Ltd', sub: 'Proposal sent', badge: '£5,000' },
          ]},
        ],
      },
      {
        id: 'money', label: 'Money',
        content: [
          { type: 'metric', label: 'Net Profit — March 2026', value: '£14,190', sub: 'Revenue £18,400 · Expenses £4,210' },
          { type: 'metric-row', items: [{ label: 'Revenue', value: '£18,400' }, { label: 'Expenses', value: '£4,210' }] },
          { type: 'progress', items: [
            { label: 'Revenue vs target', pct: 92 },
            { label: 'Expense budget used', pct: 42 },
          ]},
          { type: 'list', items: [
            { icon: 'check', title: 'Aria Studios — Retainer', sub: '22 Mar', badge: '+£2,400' },
            { icon: 'check', title: 'Northfield invoice #0041', sub: '18 Mar', badge: '+£3,800' },
            { icon: 'heart', title: 'Adobe CC subscription', sub: '20 Mar', badge: '–£58' },
            { icon: 'check', title: 'TwoRoads deposit', sub: '12 Mar', badge: '+£2,500' },
          ]},
        ],
      },
      {
        id: 'clients', label: 'Clients',
        content: [
          { type: 'metric-row', items: [{ label: 'Active', value: '4' }, { label: 'Outstanding', value: '£8.8k' }, { label: 'Pipeline', value: '£5k' }] },
          { type: 'list', items: [
            { icon: 'star', title: 'Aria Studios', sub: 'Active retainer · Priya Nair', badge: 'RETAINER' },
            { icon: 'alert', title: 'Northfield Co.', sub: 'Invoice out · James Beckett', badge: 'AWAITING' },
            { icon: 'share', title: 'TwoRoads Ltd', sub: 'Proposal sent · Sofia Morin', badge: 'PROPOSAL' },
            { icon: 'user', title: 'Clearpath Ventures', sub: 'Onboarding · Marcus Osei', badge: 'NEW' },
            { icon: 'eye', title: 'Modo Collective', sub: 'Inactive · Ana Kovac', badge: 'PAUSED' },
          ]},
        ],
      },
      {
        id: 'work', label: 'Work',
        content: [
          { type: 'metric', label: 'This Week', value: '22h', sub: '55% of 40h capacity · 4 active projects' },
          { type: 'metric-row', items: [{ label: 'Total logged', value: '88h' }, { label: 'Eff. rate', value: '£209/h' }] },
          { type: 'progress', items: [
            { label: 'Brand Identity System — Aria', pct: 75 },
            { label: 'Q2 Campaign Design — Northfield', pct: 100 },
            { label: 'Website Redesign — TwoRoads', pct: 15 },
            { label: 'Pitch Deck — Clearpath', pct: 40 },
          ]},
        ],
      },
      {
        id: 'invoices', label: 'Invoices',
        content: [
          { type: 'metric-row', items: [{ label: 'Outstanding', value: '£8,800' }, { label: 'Paid Mar', value: '£9,600' }] },
          { type: 'list', items: [
            { icon: 'eye', title: '#0044 — TwoRoads Ltd', sub: 'Due 31 Mar · DRAFT', badge: '£5,000' },
            { icon: 'alert', title: '#0043 — Northfield Co.', sub: 'Due 25 Mar · SENT', badge: '£3,800' },
            { icon: 'check', title: '#0042 — Aria Studios', sub: 'Paid 20 Mar', badge: '£2,400' },
            { icon: 'check', title: '#0041 — Clearpath', sub: 'Paid 14 Mar', badge: '£1,200' },
            { icon: 'zap', title: '#0040 — Modo Collective', sub: 'OVERDUE · 1 Mar', badge: '£850' },
          ]},
        ],
      },
      {
        id: 'you', label: 'You',
        content: [
          { type: 'metric', label: 'Effective Rate — March', value: '£209/h', sub: 'Up £24 vs last month · Jordan Kim' },
          { type: 'metric-row', items: [{ label: 'Day rate', value: '£850' }, { label: 'Hours', value: '88h' }, { label: 'Net', value: '£14.2k' }] },
          { type: 'progress', items: [
            { label: 'Revenue growth (3mo)', pct: 78 },
            { label: 'Invoice collection rate', pct: 92 },
            { label: 'Client diversity score', pct: 55 },
            { label: 'Capacity utilisation', pct: 63 },
          ]},
          { type: 'text', label: 'March Summary', value: 'Best revenue month on record. Effective rate up 13%. Consider raising rates for new clients entering in April.' },
        ],
      },
    ],
    nav: [
      { id: 'today', label: 'Today', icon: 'home' },
      { id: 'money', label: 'Money', icon: 'chart' },
      { id: 'clients', label: 'Clients', icon: 'user' },
      { id: 'work', label: 'Work', icon: 'layers' },
      { id: 'invoices', label: 'Invoices', icon: 'list' },
      { id: 'you', label: 'You', icon: 'star' },
    ],
  };

  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const result = await publishMock(html, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
  return result.url;
}

// ── GitHub queue ──────────────────────────────────────────────────────────────
async function updateGalleryQueue(designUrl, mockUrl) {
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
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: designUrl,
    mock_url: mockUrl,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 6,
    source: 'heartbeat',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
  }, putBody);

  console.log('Gallery queue:', putRes.status === 200 || putRes.status === 201 ? 'updated ✓' : putRes.body.slice(0,120));
  return newEntry;
}

// ── DB index ─────────────────────────────────────────────────────────────────
async function indexInDB(entry) {
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, entry);
    rebuildEmbeddings(db);
    console.log('Design DB: indexed ✓');
  } catch(e) {
    console.error('DB index error:', e.message);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('━━ SOLE Heartbeat Pipeline ━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const penJson = fs.readFileSync(path.join(__dirname, 'sole.pen'), 'utf8');

  // [1/5] Hero
  console.log('[1/5] Publishing hero → ram.zenbin.org/sole');
  const heroRes = await publishToZenbin(SLUG, 'SOLE — Your whole business, one view', buildHeroHtml());
  console.log(`      Status: ${heroRes.status} ${heroRes.status === 200 ? '✓' : heroRes.body.slice(0,100)}`);

  // [2/5] Viewer
  console.log('[2/5] Publishing viewer → ram.zenbin.org/sole-viewer');
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'SOLE — Design Viewer', buildViewerHtml(penJson));
  console.log(`      Status: ${viewerRes.status} ${viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0,100)}`);

  // [3/5] Svelte mock
  console.log('[3/5] Building Svelte mock → ram.zenbin.org/sole-mock');
  let mockUrl = `https://ram.zenbin.org/${SLUG}-mock`;
  try {
    mockUrl = await buildSvelteMock();
    console.log(`      Mock live at: ${mockUrl} ✓`);
  } catch(e) {
    console.error('      Mock error:', e.message);
  }

  // [4/5] Gallery queue
  console.log('[4/5] Updating gallery queue...');
  const entry = await updateGalleryQueue(`https://ram.zenbin.org/${SLUG}`, mockUrl);

  // [5/5] DB index
  console.log('[5/5] Indexing in design DB...');
  await indexInDB(entry);

  console.log('\n✓ SOLE fully published');
  console.log(`  Hero    → https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer  → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock    → ${mockUrl}`);
}

main().catch(e => { console.error('Pipeline error:', e); process.exit(1); });
