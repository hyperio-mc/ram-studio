'use strict';
// crest-publish.js — Design Discovery pipeline for CREST
// CREST — Editorial cashflow intelligence for independent workers
// Theme: LIGHT · Slug: crest

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'crest';
const APP_NAME  = 'Crest';
const TAGLINE   = 'Freelance cashflow, well-edited';
const ARCHETYPE = 'finance-cashflow-freelancer';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Editorial cashflow app for freelancers — LIGHT theme. Inspired by land-book.com: Equals ("What\'s after Excel?"), UglyCash brutalist fintech typography, Deon Libra all-caps editorial headings applied to finance, and Maker ("For the new wave of one-person companies"). Warm cream palette (#F5F2EC), near-black, electric chartreuse (#BAFF4F) accent. Magazine-editorial treatment of financial data.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'crest.pen'), 'utf8');

function req(opts, body) {
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

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  const res = await req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
  return res;
}

// Light palette (matches crest-app.js)
const P = {
  bg:      '#F5F2EC',
  surface: '#FFFFFF',
  s2:      '#EDE9E1',
  border:  '#D9D3C9',
  fg:      '#111111',
  muted:   '#9E9487',
  accent:  '#BAFF4F',
  navy:    '#1B3054',
  green:   '#1CA750',
  red:     '#E03540',
};

// ── HERO PAGE ──────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Crest — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="Crest is an editorial cashflow app for freelancers — treating your finances the way a magazine treats a feature story.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.fg};font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:60px;
  background:rgba(245,242,236,0.9);
  backdrop-filter:blur(20px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-size:14px;font-weight:800;letter-spacing:3px;color:${P.fg}}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:13px;color:${P.muted};text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${P.fg}}
.nav-cta{
  background:${P.fg};color:${P.bg};
  padding:8px 20px;border-radius:20px;
  font-size:13px;font-weight:700;text-decoration:none;
  transition:opacity .2s;
}
.nav-cta:hover{opacity:0.8}

/* HERO */
.hero{
  min-height:100vh;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:90px 24px 60px;
  position:relative;
}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  background:${P.accent};color:${P.fg};
  border-radius:20px;padding:6px 18px;
  font-size:10px;font-weight:800;letter-spacing:2px;
  text-transform:uppercase;margin-bottom:32px;
}
.hero-badge::before{content:'◈'}
h1{
  font-size:clamp(44px,8vw,100px);font-weight:900;
  line-height:0.95;letter-spacing:-4px;
  color:${P.fg};margin-bottom:24px;max-width:920px;
}
h1 em{font-style:normal;color:${P.navy}}
.hero-rule{width:64px;height:4px;background:${P.accent};border-radius:2px;margin:0 auto 28px}
.hero-sub{
  font-size:clamp(15px,2vw,20px);color:${P.muted};
  max-width:480px;line-height:1.65;margin-bottom:44px;
}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:56px}
.btn-primary{
  background:${P.fg};color:${P.bg};
  padding:14px 32px;border-radius:28px;
  font-size:15px;font-weight:700;text-decoration:none;
  transition:opacity .15s;
}
.btn-primary:hover{opacity:0.8}
.btn-secondary{
  background:${P.surface};color:${P.fg};
  border:1.5px solid ${P.border};
  padding:14px 28px;border-radius:28px;
  font-size:15px;font-weight:600;text-decoration:none;
  transition:border-color .2s;
}
.btn-secondary:hover{border-color:${P.fg}}

/* Stats row */
.hero-stats{
  display:flex;gap:0;border:1.5px solid ${P.border};
  border-radius:20px;background:${P.surface};
  overflow:hidden;margin-bottom:56px;
}
.hero-stat{
  padding:20px 32px;text-align:center;
  border-right:1px solid ${P.border};
}
.hero-stat:last-child{border-right:none}
.hstat-val{font-size:28px;font-weight:800;color:${P.fg};line-height:1}
.hstat-val.green{color:${P.green}}
.hstat-val.red{color:${P.red}}
.hstat-label{font-size:10px;color:${P.muted};margin-top:4px;letter-spacing:1px;font-weight:600;text-transform:uppercase}

/* Screen mockup cards */
.screens-row{
  display:flex;gap:16px;justify-content:center;flex-wrap:wrap;
  max-width:1100px;margin:0 auto 0;padding:0 20px;
}
.screen-card{
  width:160px;height:310px;border-radius:24px;
  border:1px solid ${P.border};overflow:hidden;
  background:${P.surface};
  box-shadow:0 8px 32px rgba(17,17,17,0.08);
  transition:transform .2s,box-shadow .2s,border-color .2s;
  position:relative;
}
.screen-card:hover{
  transform:translateY(-8px);
  box-shadow:0 20px 48px rgba(17,17,17,0.14);
  border-color:${P.accent};
}
.screen-inner{width:100%;height:100%;background:${P.bg};padding:12px 10px}
.sc-bar{height:2px;width:36px;background:${P.accent};border-radius:1px;margin-bottom:8px}
.sc-num{font-size:22px;font-weight:800;color:${P.fg};letter-spacing:-0.5px;line-height:1}
.sc-label{font-size:7px;font-weight:700;color:${P.muted};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:2px}
.sc-sub{font-size:8px;color:${P.muted};margin-top:2px}
.sc-rule{height:1px;background:${P.border};margin:8px 0}
.sc-row{display:flex;justify-content:space-between;align-items:center;margin:4px 0}
.sc-tx-name{font-size:8px;font-weight:600;color:${P.fg}}
.sc-tx-amt{font-size:9px;font-weight:700}
.sc-green{color:${P.green}} .sc-red{color:${P.red}}
.sc-pill{font-size:6px;font-weight:700;padding:2px 6px;border-radius:6px}
.sc-card{background:${P.navy};border-radius:8px;padding:8px;margin-top:8px}
.sc-card-lbl{font-size:6px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase}
.sc-card-val{font-size:14px;font-weight:800;color:#fff;margin-top:2px}
.sc-accbar{height:3px;border-radius:2px;background:${P.accent};margin-top:6px}
.sc-bar2{height:3px;border-radius:1.5px;margin:4px 0;background:${P.s2};overflow:hidden}
.sc-bar2-fill{height:100%;border-radius:1.5px}
.screen-label{
  position:absolute;bottom:0;left:0;right:0;
  padding:8px 12px;font-size:9px;font-weight:700;
  color:${P.muted};
  background:linear-gradient(transparent,rgba(255,255,255,0.97));
  letter-spacing:0.5px;
}

/* Sections */
section{padding:80px 48px;max-width:1100px;margin:0 auto}
.section-label{
  font-size:10px;font-weight:800;letter-spacing:2.5px;
  color:${P.accent === '#BAFF4F' ? P.navy : P.accent};
  margin-bottom:14px;text-transform:uppercase;
}
.section-title{
  font-size:clamp(28px,4vw,48px);font-weight:900;
  color:${P.fg};line-height:1.0;margin-bottom:16px;letter-spacing:-2px;
}
.section-sub{font-size:16px;color:${P.muted};line-height:1.65;max-width:480px}
.section-rule{width:48px;height:3px;background:${P.accent};border-radius:1.5px;margin-bottom:40px}

/* Features grid */
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:40px}
.feature-card{
  background:${P.surface};border:1.5px solid ${P.border};
  border-radius:20px;padding:28px;
  transition:border-color .2s,box-shadow .2s;
}
.feature-card:hover{border-color:${P.accent};box-shadow:0 4px 24px rgba(17,17,17,0.08)}
.feature-icon{
  width:44px;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;margin-bottom:16px;
}
.fi-lime{background:${P.accent}30}
.fi-navy{background:rgba(27,48,84,0.12)}
.fi-green{background:rgba(28,167,80,0.12)}
.fi-red{background:rgba(224,53,64,0.1)}
.feature-title{font-size:15px;font-weight:700;color:${P.fg};margin-bottom:8px}
.feature-desc{font-size:13px;color:${P.muted};line-height:1.6}

/* Inspiration */
.insp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:40px}
.insp-card{
  background:${P.surface};border:1.5px solid ${P.border};
  border-radius:20px;padding:28px;
}
.insp-source{
  font-size:10px;font-weight:800;letter-spacing:1.8px;
  color:${P.navy};margin-bottom:10px;text-transform:uppercase;
}
.insp-title{font-size:16px;font-weight:700;color:${P.fg};margin-bottom:8px}
.insp-desc{font-size:13px;color:${P.muted};line-height:1.6}

/* Decisions */
.decisions-list{margin-top:40px;display:flex;flex-direction:column;gap:16px}
.decision-item{
  background:${P.surface};border:1.5px solid ${P.border};
  border-radius:20px;padding:24px 28px;
  display:flex;gap:20px;align-items:flex-start;
}
.decision-num{
  font-size:32px;font-weight:900;color:${P.accent};
  line-height:1;flex-shrink:0;letter-spacing:-1px;
  background:${P.fg};width:48px;height:48px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;
}
.decision-title{font-size:16px;font-weight:700;color:${P.fg};margin-bottom:6px}
.decision-body{font-size:13px;color:${P.muted};line-height:1.6}

/* Palette */
.palette-row{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap;align-items:center}
.swatch{display:flex;flex-direction:column;align-items:center;gap:6px}
.swatch-color{width:52px;height:52px;border-radius:14px;border:1px solid ${P.border}}
.swatch-hex{font-size:9px;color:${P.muted};letter-spacing:0.3px;font-family:monospace}

/* CTA */
.cta-band{
  background:${P.fg};border-radius:32px;
  padding:64px 48px;text-align:center;
  margin:0 48px 80px;position:relative;overflow:hidden;
}
.cta-band::before{
  content:'CREST';position:absolute;
  font-size:200px;font-weight:900;letter-spacing:-8px;
  color:rgba(255,255,255,0.04);top:-20px;left:50%;transform:translateX(-50%);
  pointer-events:none;white-space:nowrap;
}
.cta-band .acc-bar{width:48px;height:4px;background:${P.accent};border-radius:2px;margin:0 auto 24px}
.cta-band h2{font-size:clamp(24px,4vw,42px);font-weight:900;color:#fff;margin-bottom:14px;letter-spacing:-2px}
.cta-band p{font-size:16px;color:rgba(255,255,255,0.55);margin-bottom:32px}
.btn-cta{
  background:${P.accent};color:${P.fg};
  padding:14px 36px;border-radius:28px;
  font-size:15px;font-weight:800;text-decoration:none;
  transition:opacity .15s;display:inline-block;
}
.btn-cta:hover{opacity:0.85}

footer{
  border-top:1px solid ${P.border};
  padding:28px 48px;
  display:flex;align-items:center;justify-content:space-between;
  font-size:12px;color:${P.muted};
}
.footer-logo{font-weight:800;letter-spacing:3px;color:${P.fg};font-size:13px}
.footer-accent{color:${P.navy}}

@media(max-width:768px){
  nav{padding:0 20px}
  .hero{padding:80px 20px 40px}
  section{padding:60px 20px}
  .insp-grid{grid-template-columns:1fr}
  .cta-band{margin:0 20px 60px;padding:40px 24px}
  footer{flex-direction:column;gap:12px;text-align:center}
  .hero-stats{flex-wrap:wrap}
  .hero-stat{flex:1 1 120px}
}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">CREST</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#design">Design</a>
    <a href="#inspiration">Inspiration</a>
    <a href="/crest-mock" class="nav-cta">Try Mock →</a>
  </div>
</nav>

<div class="hero">
  <div class="hero-badge">FREELANCE CASHFLOW</div>
  <h1>Your money,<br><em>well-edited</em></h1>
  <div class="hero-rule"></div>
  <p class="hero-sub">Crest treats your finances the way a magazine treats a feature story — big numbers, clear hierarchy, no noise.</p>

  <div class="hero-stats">
    <div class="hero-stat">
      <div class="hstat-val green">+$12,847</div>
      <div class="hstat-label">Net Flow</div>
    </div>
    <div class="hero-stat">
      <div class="hstat-val">$24,130</div>
      <div class="hstat-label">Inflow</div>
    </div>
    <div class="hero-stat">
      <div class="hstat-val red">$11,283</div>
      <div class="hstat-label">Outflow</div>
    </div>
    <div class="hero-stat">
      <div class="hstat-val">4</div>
      <div class="hstat-label">Clients</div>
    </div>
  </div>

  <div class="hero-actions">
    <a href="/crest-mock" class="btn-primary">View Interactive Mock →</a>
    <a href="/crest-viewer" class="btn-secondary">Design Viewer ↗</a>
  </div>

  <div class="screens-row">
    <!-- Screen 1: Home -->
    <div class="screen-card">
      <div class="screen-inner">
        <div class="sc-label">NET FLOW</div>
        <div class="sc-bar"></div>
        <div class="sc-num">+$12,847</div>
        <div class="sc-sub" style="font-size:7px;color:${P.muted}">this month</div>
        <div class="sc-rule"></div>
        <div class="sc-row">
          <div class="sc-tx-name">Meridian Studio</div>
          <div class="sc-tx-amt sc-green">+$4,200</div>
        </div>
        <div class="sc-row">
          <div class="sc-tx-name">Figma Pro</div>
          <div class="sc-tx-amt sc-red">−$45</div>
        </div>
        <div class="sc-row">
          <div class="sc-tx-name">Arc Agency</div>
          <div class="sc-tx-amt sc-green">+$3,800</div>
        </div>
        <div class="sc-card">
          <div class="sc-card-lbl">TAX RESERVE</div>
          <div class="sc-card-val">$6,200</div>
          <div class="sc-accbar" style="width:77%"></div>
        </div>
      </div>
      <div class="screen-label">HOME</div>
    </div>
    <!-- Screen 2: Inflow -->
    <div class="screen-card">
      <div class="screen-inner">
        <div class="sc-label">INFLOW</div>
        <div class="sc-bar" style="background:${P.green}"></div>
        <div class="sc-num sc-green">$24,130</div>
        <div class="sc-sub">4 clients</div>
        <div class="sc-rule"></div>
        ${[['Meridian Studio','$8,000',0.83],['Arc Agency','$7,600',0.79],['Ghost Protocol','$5,200',0.54],['Solace Group','$3,330',0.35]].map(([n,a,p])=>`
        <div style="margin-bottom:7px">
          <div class="sc-row"><div class="sc-tx-name">${n}</div><div class="sc-tx-amt sc-green">${a}</div></div>
          <div class="sc-bar2"><div class="sc-bar2-fill" style="width:${p*100}%;background:${P.green}"></div></div>
        </div>`).join('')}
      </div>
      <div class="screen-label">INFLOW</div>
    </div>
    <!-- Screen 3: Outflow -->
    <div class="screen-card">
      <div class="screen-inner">
        <div class="sc-label">OUTFLOW</div>
        <div class="sc-bar" style="background:${P.red}"></div>
        <div class="sc-num sc-red">$11,283</div>
        <div class="sc-sub">5 categories</div>
        <div class="sc-rule"></div>
        ${[['Software','$4,210',0.73],['Marketing','$2,800',0.49],['Freelance','$2,100',0.37],['Finance','$1,630',0.28]].map(([n,a,p])=>`
        <div style="margin-bottom:7px">
          <div class="sc-row"><div class="sc-tx-name">${n}</div><div class="sc-tx-amt sc-red">${a}</div></div>
          <div class="sc-bar2"><div class="sc-bar2-fill" style="width:${p*100}%;background:${P.red}"></div></div>
        </div>`).join('')}
      </div>
      <div class="screen-label">OUTFLOW</div>
    </div>
    <!-- Screen 4: Invoices -->
    <div class="screen-card">
      <div class="screen-inner">
        <div class="sc-label">INVOICES</div>
        <div class="sc-bar" style="background:${P.navy}"></div>
        <div class="sc-num">$10,200</div>
        <div class="sc-sub">2 open</div>
        <div style="background:${P.accent};border-radius:6px;padding:5px 8px;margin:6px 0;text-align:center;font-size:7px;font-weight:800">+ NEW INVOICE</div>
        <div class="sc-rule"></div>
        ${[['Meridian','$6,400','SENT','#3B72D4'],['Arc Agency','$3,800','VIEWED',P.amber||'#E89000'],['Ghost','$5,200','PAID',P.green],['Solace','$1,200','OVERDUE',P.red]].map(([n,a,s,c])=>`
        <div class="sc-row">
          <div class="sc-tx-name">${n}</div>
          <div style="display:flex;gap:4px;align-items:center">
            <span class="sc-pill" style="background:${c}18;color:${c}">${s}</span>
            <span class="sc-tx-amt" style="color:${P.fg}">${a}</span>
          </div>
        </div>`).join('')}
      </div>
      <div class="screen-label">INVOICES</div>
    </div>
    <!-- Screen 5: Plan -->
    <div class="screen-card">
      <div class="screen-inner">
        <div class="sc-label">90-DAY VIEW</div>
        <div class="sc-bar"></div>
        <div class="sc-num">$39,500</div>
        <div class="sc-sub">projected Q2</div>
        <div style="display:flex;align-items:flex-end;gap:3px;height:44px;margin:8px 0">
          ${[[36,false,false],[42,false,false],[58,false,true],[50,true,false],[61,true,false],[67,true,false]].map(([h,proj,cur])=>`
          <div style="flex:1;height:${h}px;background:${cur?P.accent:proj?P.accent+'66':P.fg+'25'};border-radius:3px 3px 0 0"></div>`).join('')}
        </div>
        <div class="sc-rule"></div>
        ${[['Apr 10','Arc Agency','$3,800',P.green],['Apr 15','Meridian due','$6,400',P.navy],['Apr 30','Tax deadline','$8,000',P.red]].map(([d,n,a,c])=>`
        <div class="sc-row" style="margin:3px 0">
          <div style="display:flex;gap:4px;align-items:center">
            <div style="width:2px;height:16px;background:${c};border-radius:1px;flex-shrink:0"></div>
            <div><div style="font-size:7px;color:${P.muted}">${d}</div><div class="sc-tx-name">${n}</div></div>
          </div>
          <div class="sc-tx-amt" style="color:${P.fg}">${a}</div>
        </div>`).join('')}
      </div>
      <div class="screen-label">PLAN</div>
    </div>
  </div>
</div>

<!-- Features -->
<section id="features">
  <div class="section-label">WHAT IT DOES</div>
  <h2 class="section-title">One screen.<br>Full picture.</h2>
  <div class="section-rule"></div>
  <p class="section-sub">Crest consolidates your income, expenses, invoices, and forecast into a single editorial-style dashboard.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon fi-lime">💰</div>
      <div class="feature-title">Net Flow at a Glance</div>
      <div class="feature-desc">Your monthly cashflow as a headline number — not buried in a table. See where you stand the moment you open the app.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-navy">📊</div>
      <div class="feature-title">Client Income Breakdown</div>
      <div class="feature-desc">Horizontal progress bars show each client's contribution to your monthly inflow. Spot which relationships drive your revenue.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-red">📉</div>
      <div class="feature-title">Expense Categories</div>
      <div class="feature-desc">Five clean categories. No pie charts. A bar and a number — fast to read, easy to act on. Upcoming bills flagged in red.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-green">🧾</div>
      <div class="feature-title">Invoice Tracker</div>
      <div class="feature-desc">Outstanding balance front and centre. Status chips (Sent, Viewed, Paid, Overdue) without the spreadsheet noise.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-lime">📅</div>
      <div class="feature-title">90-Day Forecast</div>
      <div class="feature-desc">Projected cashflow bars for the next quarter, with key upcoming dates — payments expected, invoices due, tax deadlines.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-navy">🏦</div>
      <div class="feature-title">Tax Reserve Tracking</div>
      <div class="feature-desc">A dedicated savings goal card on the home screen keeps your tax reserve visible so you're never caught short at filing time.</div>
    </div>
  </div>
</section>

<!-- Design -->
<section id="design">
  <div class="section-label">DESIGN SYSTEM</div>
  <h2 class="section-title">Editorial meets<br>financial precision.</h2>
  <div class="section-rule"></div>
  <p class="section-sub">A warm cream base with near-black typography and a single electric chartreuse accent — the result is a financial app that feels like a well-designed magazine.</p>

  <div class="palette-row">
    ${[['#F5F2EC','Cream BG'],['#FFFFFF','Surface'],['#111111','Near-Black'],['#BAFF4F','Chartreuse'],['#1B3054','Navy'],['#1CA750','Green'],['#E03540','Red'],['#9E9487','Muted']].map(([c,l])=>`
    <div class="swatch">
      <div class="swatch-color" style="background:${c}"></div>
      <div class="swatch-hex">${c}</div>
      <div class="swatch-hex" style="font-size:8px">${l}</div>
    </div>`).join('')}
  </div>

  <div class="decisions-list">
    <div class="decision-item">
      <div class="decision-num">01</div>
      <div>
        <div class="decision-title">Display numbers as headlines</div>
        <div class="decision-body">Financial amounts are set at 44–56px, 800–900 weight — the same visual hierarchy you'd give a magazine cover story. The number IS the design, not a data point inside it.</div>
      </div>
    </div>
    <div class="decision-item">
      <div class="decision-num">02</div>
      <div>
        <div class="decision-title">Single accent, maximum punch</div>
        <div class="decision-body">Electric chartreuse (#BAFF4F) is used exactly twice per screen: the wordmark rule and the primary CTA. Every other colour is semantic (green = inflow, red = outflow, navy = important). No decorative colour.</div>
      </div>
    </div>
    <div class="decision-item">
      <div class="decision-num">03</div>
      <div>
        <div class="decision-title">Bars, not charts</div>
        <div class="decision-body">Horizontal progress bars replace pie charts and area graphs throughout. They're faster to read, easier to skim, and work within the editorial grid without demanding visual real estate.</div>
      </div>
    </div>
  </div>
</section>

<!-- Inspiration -->
<section id="inspiration">
  <div class="section-label">WHAT INSPIRED THIS</div>
  <h2 class="section-title">Found on<br>Land-book.</h2>
  <div class="section-rule"></div>
  <div class="insp-grid">
    <div class="insp-card">
      <div class="insp-source">land-book.com → Equals</div>
      <div class="insp-title">"What's after Excel?"</div>
      <div class="insp-desc">Clean analytical SaaS UI with editorial restraint — data hierarchy without chart overload. Inspired Crest's "one number, full story" layout philosophy.</div>
    </div>
    <div class="insp-card">
      <div class="insp-source">land-book.com → UglyCash</div>
      <div class="insp-title">"YOUR BANK WON'T DO THIS"</div>
      <div class="insp-desc">Brutalist statement typography applied to fintech. Showed that financial apps can lead with a bold declarative headline rather than hiding data behind chrome.</div>
    </div>
    <div class="insp-card">
      <div class="insp-source">land-book.com → Deon Libra</div>
      <div class="insp-title">"Wellness rooted in ritual, art, and drop culture"</div>
      <div class="insp-desc">All-caps editorial section labels with wide tracking applied to a lifestyle brand. Adapted directly into Crest's section headers: NET FLOW, INFLOW, BY CLIENT, KEY DATES.</div>
    </div>
    <div class="insp-card">
      <div class="insp-source">darkmodedesign.com → Maker</div>
      <div class="insp-title">"For the new wave of one-person companies"</div>
      <div class="insp-desc">Quiet textured surfaces, minimal CTA language, solo-operator aesthetic. Confirmed that a finance app for independents should feel grounded — not slick startup SaaS.</div>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta-band">
  <div class="acc-bar"></div>
  <h2>Your finances,<br>finally legible.</h2>
  <p>Five screens. Everything you need to understand your month.</p>
  <a href="/crest-mock" class="btn-cta">Explore the interactive mock →</a>
</div>

<footer>
  <div class="footer-logo">CREST <span class="footer-accent">·</span> RAM</div>
  <div>Editorial cashflow for independent workers</div>
  <div>RAM Design Studio · March 2026</div>
</footer>

</body>
</html>`;
}

// ── VIEWER ────────────────────────────────────────────────────────────────────
function buildViewer() {
  let viewerHtml = fs.readFileSync(
    path.join(__dirname, '..', 'pencil-viewer', 'viewer.html'), 'utf8'
  );
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── GITHUB QUEUE ──────────────────────────────────────────────────────────────
async function updateQueue() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const file = JSON.parse(getRes.body);
  const sha  = file.sha;
  let queue  = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha,
  });
  const putRes = await req({
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
  return putRes.status === 200 ? 'OK' : putRes.body.slice(0, 200);
}

// ── RUN ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('── CREST Design Discovery Pipeline ──\n');

  console.log('a) Hero page…');
  const heroRes = await zenPut(SLUG, `Crest — ${TAGLINE}`, buildHero());
  console.log(`   ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('b) Viewer…');
  try {
    const vHtml  = buildViewer();
    const vRes   = await zenPut(`${SLUG}-viewer`, 'Crest — Design Viewer', vHtml);
    console.log(`   ${vRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  } catch(e) {
    console.log('   viewer skipped:', e.message);
  }

  console.log('c) GitHub queue…');
  try {
    const qr = await updateQueue();
    console.log('  ', qr);
  } catch(e) {
    console.log('   queue error:', e.message);
  }

  console.log('\n✓ Done');
  console.log(`  Design: https://ram.zenbin.org/${SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
