'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'seam';
const APP_NAME  = 'SEAM';
const TAGLINE   = 'Client-to-cash, seamlessly';
const ARCHETYPE = 'freelance-ops-platform';
const PROMPT    = 'Inspired by SUTÉRA multi-reality UI (Awwwards SOTD Mar 28 2026) + midday.ai clean founder-finance SaaS structure (via darkmodedesign.com). Light theme freelance ops platform: warm paper whites (#F5F3EF), indigo (#4F46E5) + emerald (#059669) accents. 6 screens: Overview dashboard with AI insight banner, Contracts pipeline with left accent lines, Invoice studio, Cash flow bar chart, Client hub with relationship health bars, New invoice creation with AI pre-fill.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

function zenPublish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

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

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SEAM — Client-to-cash, seamlessly</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F5F3EF;--surface:#FFFFFF;--surface2:#F0EDE8;--border:#E4E0D8;
  --fg:#1C1917;--muted:#78716C;--faint:#A8A29E;
  --indigo:#4F46E5;--indigoL:#EEF2FF;
  --emerald:#059669;--emeraldL:#ECFDF5;
  --amber:#D97706;--amberL:#FFFBEB;
  --rose:#E11D48;--roseL:#FFF1F2;
  --sky:#0284C7;--skyL:#F0F9FF;
}
body{font-family:'Inter',-apple-system,sans-serif;background:var(--bg);color:var(--fg);line-height:1.5}
nav{display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:var(--bg);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;backdrop-filter:blur(8px)}
.logo{font-size:20px;font-weight:700;letter-spacing:-0.5px}
.logo span{color:var(--indigo)}
nav a{font-size:14px;color:var(--muted);text-decoration:none;margin-left:28px;transition:color .2s}
nav a:hover{color:var(--fg)}
.nav-cta{background:var(--indigo);color:white!important;padding:8px 20px;border-radius:8px;font-weight:600}
.hero{max-width:920px;margin:0 auto;padding:88px 48px 64px;text-align:center}
.badge{display:inline-flex;align-items:center;gap:8px;background:var(--indigoL);color:var(--indigo);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.5px;margin-bottom:28px;border:1px solid #C7D2FE}
.hero h1{font-size:clamp(36px,5.5vw,62px);font-weight:700;letter-spacing:-1.5px;line-height:1.08;margin-bottom:22px}
.hero h1 em{color:var(--indigo);font-style:normal}
.hero p{font-size:18px;color:var(--muted);max-width:500px;margin:0 auto 44px;line-height:1.65}
.ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-p{background:var(--indigo);color:white;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;text-decoration:none;display:inline-block;transition:opacity .2s}
.btn-p:hover{opacity:.88}
.btn-s{background:var(--surface);color:var(--fg);padding:14px 32px;border-radius:10px;font-size:16px;font-weight:500;text-decoration:none;display:inline-block;border:1px solid var(--border)}
.screens{max-width:1240px;margin:64px auto;padding:0 48px;display:flex;gap:20px;overflow-x:auto;padding-bottom:24px;-webkit-overflow-scrolling:touch;scrollbar-width:thin}
.phone{flex-shrink:0;width:202px;background:var(--surface);border-radius:28px;padding:14px;box-shadow:0 8px 48px rgba(0,0,0,0.09);border:1px solid var(--border)}
.phone h4{font-size:9px;font-weight:600;color:var(--faint);letter-spacing:0.7px;text-transform:uppercase;margin-bottom:10px;text-align:center}
.art{background:var(--bg);border-radius:18px;padding:10px;aspect-ratio:9/16;overflow:hidden}
.row{background:white;border-radius:6px;padding:5px 7px;margin:3px 0;font-size:8px;display:flex;align-items:center;gap:5px}
.dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.ai-box{background:var(--indigoL);border-radius:8px;padding:7px 8px;margin:5px 0;font-size:7.5px;color:#3730A3;line-height:1.5;border:1px solid #C7D2FE}
.ai-box .lbl{font-size:8px;font-weight:700;color:var(--indigo);margin-bottom:2px}
.kpis{display:flex;gap:4px;margin:5px 0}
.kpi{flex:1;background:white;border-radius:6px;padding:5px 6px}
.kpi .v{font-size:11px;font-weight:700}
.kpi .l{font-size:6.5px;color:var(--faint);margin-top:1px}
.pill{display:inline-block;padding:2px 6px;border-radius:8px;font-size:7px;font-weight:600}
.features{max-width:920px;margin:0 auto 80px;padding:0 48px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.fc{background:var(--surface);border-radius:18px;padding:30px;border:1px solid var(--border)}
.fc .ico{font-size:26px;margin-bottom:14px}
.fc h3{font-size:16px;font-weight:600;margin-bottom:8px}
.fc p{font-size:14px;color:var(--muted);line-height:1.6}
.band{max-width:828px;margin:0 auto 80px;padding:40px 48px;background:var(--indigoL);border-radius:24px;border:1px solid #C7D2FE}
.band h2{font-size:28px;font-weight:700;color:var(--indigo);margin-bottom:12px}
.band p{font-size:15px;color:#3730A3;max-width:540px;line-height:1.65}
.pal{max-width:920px;margin:0 auto 80px;padding:0 48px}
.pal h2{font-size:20px;font-weight:700;margin-bottom:20px}
.swatches{display:flex;gap:16px;flex-wrap:wrap}
.sw{display:flex;align-items:center;gap:10px}
.swc{width:40px;height:40px;border-radius:10px;border:1px solid var(--border)}
.swi .n{font-size:13px;font-weight:600}
.swi .h{font-size:11px;color:var(--muted)}
footer{text-align:center;padding:40px 48px;border-top:1px solid var(--border);font-size:13px;color:var(--muted)}
footer a{color:var(--indigo);text-decoration:none}
@media(max-width:768px){
  nav{padding:14px 20px}
  .hero,.features,.pal{padding:40px 20px}
  .hero h1{font-size:36px}
  .features{grid-template-columns:1fr}
  .screens{padding:0 20px 20px}
  .band{margin:0 20px 60px;padding:28px 24px}
}
</style>
</head>
<body>

<nav>
  <div class="logo">SE<span>AM</span></div>
  <div>
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="/seam-mock" class="nav-cta">Try mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="badge">✦ AI-assisted · Mar 2026</div>
  <h1>Client-to-cash,<br><em>seamlessly.</em></h1>
  <p>Contracts, invoices, cash flow, and client health — one platform for freelancers and studio founders.</p>
  <div class="ctas">
    <a href="/seam-mock" class="btn-p">Explore interactive mock →</a>
    <a href="/seam-viewer" class="btn-s">View pen file</a>
  </div>
</section>

<div class="screens">
  <!-- Overview -->
  <div class="phone">
    <h4>Overview</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:1px">Good morning, Alex</div>
      <div style="font-size:7px;color:#78716C;margin-bottom:6px">March 28 · 3 actions need attention</div>
      <div class="kpis">
        <div class="kpi"><div class="v" style="color:#4F46E5">12</div><div class="l">Contracts</div></div>
        <div class="kpi"><div class="v" style="color:#059669">$18.4k</div><div class="l">Unpaid</div></div>
        <div class="kpi"><div class="v" style="color:#0284C7">$52k</div><div class="l">30-day</div></div>
      </div>
      <div class="ai-box"><div class="lbl">✦ AI Insight</div>Horizon Creative is 14 days late — send a reminder?</div>
      <div style="font-size:8px;font-weight:600;margin:5px 0 3px">Active Projects</div>
      <div class="row">
        <span style="width:3px;height:20px;background:#059669;border-radius:2px;flex-shrink:0;display:inline-block"></span>
        <div style="flex:1"><div style="font-weight:600">Brand Refresh</div><div style="color:#78716C;font-size:7px">Horizon Creative</div></div>
        <div style="text-align:right"><div style="font-weight:700;font-size:9px">$8,400</div><div style="font-size:6px;color:#A8A29E">Apr 5</div></div>
      </div>
      <div class="row">
        <span style="width:3px;height:20px;background:#0284C7;border-radius:2px;flex-shrink:0;display:inline-block"></span>
        <div style="flex:1"><div style="font-weight:600">Website Redesign</div><div style="color:#78716C;font-size:7px">Volta Systems</div></div>
        <div style="text-align:right"><div style="font-weight:700;font-size:9px">$14,200</div><div style="font-size:6px;color:#A8A29E">Apr 22</div></div>
      </div>
      <div class="row">
        <span style="width:3px;height:20px;background:#D97706;border-radius:2px;flex-shrink:0;display:inline-block"></span>
        <div style="flex:1"><div style="font-weight:600">Q2 Campaign</div><div style="color:#78716C;font-size:7px">Maison Studio</div></div>
        <div style="text-align:right"><div style="font-weight:700;font-size:9px">$6,000</div><div style="font-size:6px;color:#A8A29E">TBD</div></div>
      </div>
    </div>
  </div>

  <!-- Contracts -->
  <div class="phone">
    <h4>Contracts</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:5px">Contracts</div>
      <div style="display:flex;gap:3px;margin-bottom:6px">
        <span style="background:#4F46E5;color:white;padding:2px 7px;border-radius:9px;font-size:8px;font-weight:600">All</span>
        <span style="background:#F0EDE8;color:#A8A29E;padding:2px 7px;border-radius:9px;font-size:8px">Active</span>
        <span style="background:#F0EDE8;color:#A8A29E;padding:2px 7px;border-radius:9px;font-size:8px">Proposals</span>
        <span style="background:#F0EDE8;color:#A8A29E;padding:2px 7px;border-radius:9px;font-size:8px">Expiring</span>
      </div>
      <div class="row" style="padding-left:0;gap:0">
        <span style="width:3px;height:32px;background:#059669;border-radius:2px;flex-shrink:0;margin-right:6px"></span>
        <div style="flex:1"><div style="font-weight:600">Brand Identity System</div><div style="color:#78716C;font-size:7px">Horizon Creative · $8,400</div><div style="margin-top:2px"><span style="background:#ECFDF5;color:#059669;padding:1px 4px;border-radius:4px;font-size:6.5px;font-weight:600">Active</span></div></div>
        <div style="font-size:7px;color:#A8A29E;text-align:right">Ends<br>Jun 30</div>
      </div>
      <div class="row" style="padding-left:0;gap:0">
        <span style="width:3px;height:32px;background:#0284C7;border-radius:2px;flex-shrink:0;margin-right:6px"></span>
        <div style="flex:1"><div style="font-weight:600">Full-Stack Build</div><div style="color:#78716C;font-size:7px">Volta Systems · $24,000</div><div style="margin-top:2px"><span style="background:#F0F9FF;color:#0284C7;padding:1px 4px;border-radius:4px;font-size:6.5px;font-weight:600">Active</span></div></div>
        <div style="font-size:7px;color:#A8A29E;text-align:right">Ends<br>Sep 15</div>
      </div>
      <div class="row" style="padding-left:0;gap:0">
        <span style="width:3px;height:32px;background:#D97706;border-radius:2px;flex-shrink:0;margin-right:6px"></span>
        <div style="flex:1"><div style="font-weight:600">Q2 Campaign Suite</div><div style="color:#78716C;font-size:7px">Maison Studio · $6,000</div><div style="margin-top:2px"><span style="background:#FFFBEB;color:#D97706;padding:1px 4px;border-radius:4px;font-size:6.5px;font-weight:600">Proposal</span></div></div>
        <div style="font-size:7px;color:#A8A29E;text-align:right">Expires<br>Apr 10</div>
      </div>
      <div class="row" style="padding-left:0;gap:0">
        <span style="width:3px;height:32px;background:#E11D48;border-radius:2px;flex-shrink:0;margin-right:6px"></span>
        <div style="flex:1"><div style="font-weight:600">Annual Retainer</div><div style="color:#78716C;font-size:7px">Pellucid Labs · $36,000</div><div style="margin-top:2px"><span style="background:#FFF1F2;color:#E11D48;padding:1px 4px;border-radius:4px;font-size:6.5px;font-weight:600">Expiring</span></div></div>
        <div style="font-size:7px;color:#A8A29E;text-align:right">Expires<br>Apr 5</div>
      </div>
    </div>
  </div>

  <!-- Invoices -->
  <div class="phone">
    <h4>Invoices</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:5px">Invoices</div>
      <div style="display:flex;gap:3px;margin-bottom:5px">
        <div style="flex:1;background:white;border-radius:6px;padding:5px">
          <div style="font-size:9px;font-weight:700;color:#1C1917">$18.4k</div>
          <div style="font-size:6px;color:#A8A29E">Awaiting</div>
        </div>
        <div style="flex:1;background:white;border-radius:6px;padding:5px">
          <div style="font-size:9px;font-weight:700;color:#E11D48">$3.2k</div>
          <div style="font-size:6px;color:#A8A29E">Overdue</div>
        </div>
        <div style="flex:1;background:white;border-radius:6px;padding:5px">
          <div style="font-size:9px;font-weight:700;color:#059669">$21.6k</div>
          <div style="font-size:6px;color:#A8A29E">Month</div>
        </div>
      </div>
      <div class="row" style="justify-content:space-between"><div><div style="font-weight:600">INV-082</div><div style="font-size:7px;color:#78716C">Horizon Creative</div></div><div style="text-align:right"><div style="font-weight:700;font-size:9px">$3,200</div><span style="background:#FFF1F2;color:#E11D48;padding:1px 5px;border-radius:4px;font-size:6.5px;font-weight:600">Overdue</span></div></div>
      <div class="row" style="justify-content:space-between"><div><div style="font-weight:600">INV-081</div><div style="font-size:7px;color:#78716C">Volta Systems</div></div><div style="text-align:right"><div style="font-weight:700;font-size:9px">$7,000</div><span style="background:#FFFBEB;color:#D97706;padding:1px 5px;border-radius:4px;font-size:6.5px;font-weight:600">Pending</span></div></div>
      <div class="row" style="justify-content:space-between"><div><div style="font-weight:600">INV-080</div><div style="font-size:7px;color:#78716C">Maison Studio</div></div><div style="text-align:right"><div style="font-weight:700;font-size:9px">$2,400</div><span style="background:#FFFBEB;color:#D97706;padding:1px 5px;border-radius:4px;font-size:6.5px;font-weight:600">Pending</span></div></div>
      <div class="row" style="justify-content:space-between"><div><div style="font-weight:600">INV-079</div><div style="font-size:7px;color:#78716C">Pellucid Labs</div></div><div style="text-align:right"><div style="font-weight:700;font-size:9px">$3,000</div><span style="background:#ECFDF5;color:#059669;padding:1px 5px;border-radius:4px;font-size:6.5px;font-weight:600">Paid</span></div></div>
    </div>
  </div>

  <!-- Cash Flow -->
  <div class="phone">
    <h4>Cash Flow</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:1px">March Revenue</div>
      <div style="font-size:14px;font-weight:700;margin:2px 0">$52,000</div>
      <div style="font-size:7px;color:#059669;font-weight:600;margin-bottom:6px">↑ 14% vs February</div>
      <!-- Mini bar chart -->
      <div style="display:flex;align-items:flex-end;gap:3px;height:50px;background:white;border-radius:8px;padding:6px 8px 2px;margin-bottom:5px">
        <div style="flex:1;background:#E4E0D8;border-radius:2px 2px 0 0" title="Jan" data-h="54%"><div style="height:27px;background:#E4E0D8;border-radius:2px"></div><div style="font-size:5.5px;color:#A8A29E;text-align:center;margin-top:2px">Jan</div></div>
        <div style="flex:1;background:#E4E0D8;border-radius:2px 2px 0 0"><div style="height:33px;background:#E4E0D8;border-radius:2px"></div><div style="font-size:5.5px;color:#A8A29E;text-align:center;margin-top:2px">Feb</div></div>
        <div style="flex:1"><div style="height:40px;background:#4F46E5;border-radius:2px;position:relative"><span style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:6px;font-weight:700;color:#4F46E5;white-space:nowrap">$52k</span></div><div style="font-size:5.5px;color:#4F46E5;font-weight:600;text-align:center;margin-top:2px">Mar</div></div>
        <div style="flex:1"><div style="height:37px;background:#E4E0D8;border-radius:2px"></div><div style="font-size:5.5px;color:#A8A29E;text-align:center;margin-top:2px">Apr</div></div>
        <div style="flex:1"><div style="height:43px;background:#E4E0D8;border-radius:2px;opacity:.4"></div><div style="font-size:5.5px;color:#A8A29E;text-align:center;margin-top:2px">May</div></div>
      </div>
      <div class="row" style="justify-content:space-between"><span style="flex:1">Invoice payments</span><span style="font-weight:600;color:#059669">+$21,600</span></div>
      <div class="row" style="justify-content:space-between"><span style="flex:1">Retainer (Pellucid)</span><span style="font-weight:600;color:#059669">+$3,000</span></div>
      <div class="row" style="justify-content:space-between"><span style="flex:1">SaaS subscriptions</span><span style="font-weight:600;color:#E11D48">−$840</span></div>
      <div class="row" style="justify-content:space-between"><span style="flex:1">Contract staff</span><span style="font-weight:600;color:#E11D48">−$4,200</span></div>
      <div style="background:var(--bg);border-radius:6px;padding:5px 7px;margin-top:4px;display:flex;justify-content:space-between;font-size:8px">
        <span style="color:#78716C">Projected April</span>
        <span style="font-weight:700;color:#4F46E5">$48,000</span>
      </div>
    </div>
  </div>

  <!-- Clients -->
  <div class="phone">
    <h4>Client Hub</h4>
    <div class="art">
      <div style="font-size:11px;font-weight:700;margin-bottom:5px">Clients</div>
      <!-- Client cards with health bars -->
      <div style="background:white;border-radius:8px;padding:7px;margin-bottom:4px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <div style="width:26px;height:26px;background:#EEF2FF;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#4F46E5;flex-shrink:0">VS</div>
          <div style="flex:1"><div style="font-weight:600;font-size:9px">Volta Systems</div><div style="font-size:6.5px;color:#78716C">Product Startup</div></div>
          <div style="text-align:right"><div style="font-weight:700;font-size:9px">$38.2k</div><div style="font-size:6px;color:#A8A29E">LTM</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          <div style="flex:1;height:3px;background:#E4E0D8;border-radius:2px"><div style="width:94%;height:100%;background:#059669;border-radius:2px"></div></div>
          <span style="background:#ECFDF5;color:#059669;font-size:6px;font-weight:600;padding:1px 4px;border-radius:4px">Excellent</span>
        </div>
      </div>
      <div style="background:white;border-radius:8px;padding:7px;margin-bottom:4px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <div style="width:26px;height:26px;background:#FEF9C3;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#D97706;flex-shrink:0">HC</div>
          <div style="flex:1"><div style="font-weight:600;font-size:9px">Horizon Creative</div><div style="font-size:6.5px;color:#78716C">Agency</div></div>
          <div style="text-align:right"><div style="font-weight:700;font-size:9px">$14.6k</div><div style="font-size:6px;color:#A8A29E">LTM</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          <div style="flex:1;height:3px;background:#E4E0D8;border-radius:2px"><div style="width:62%;height:100%;background:#E11D48;border-radius:2px"></div></div>
          <span style="background:#FFF1F2;color:#E11D48;font-size:6px;font-weight:600;padding:1px 4px;border-radius:4px">At Risk</span>
        </div>
      </div>
      <div style="background:white;border-radius:8px;padding:7px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <div style="width:26px;height:26px;background:#E0F2FE;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#0284C7;flex-shrink:0">PL</div>
          <div style="flex:1"><div style="font-weight:600;font-size:9px">Pellucid Labs</div><div style="font-size:6.5px;color:#78716C">Enterprise · Retainer</div></div>
          <div style="text-align:right"><div style="font-weight:700;font-size:9px">$36k</div><div style="font-size:6px;color:#A8A29E">LTM</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          <div style="flex:1;height:3px;background:#E4E0D8;border-radius:2px"><div style="width:88%;height:100%;background:#0284C7;border-radius:2px"></div></div>
          <span style="background:#F0F9FF;color:#0284C7;font-size:6px;font-weight:600;padding:1px 4px;border-radius:4px">Good</span>
        </div>
      </div>
    </div>
  </div>

  <!-- New Invoice -->
  <div class="phone">
    <h4>New Invoice</h4>
    <div class="art">
      <div class="ai-box" style="margin-bottom:6px"><div class="lbl">✦ AI pre-filled</div>Volta Systems · Milestone 2 · NET 14</div>
      <div style="font-size:8px;color:#78716C;margin-bottom:2px">Client</div>
      <div style="background:white;border-radius:6px;padding:5px 7px;margin-bottom:5px;font-size:9px;font-weight:600;border:1.5px solid #4F46E5">Volta Systems</div>
      <div style="display:flex;gap:4px;margin-bottom:5px">
        <div style="flex:1">
          <div style="font-size:7px;color:#78716C;margin-bottom:2px">Issue date</div>
          <div style="background:white;border-radius:6px;padding:4px 6px;font-size:8px">Mar 28, 2026</div>
        </div>
        <div style="flex:1">
          <div style="font-size:7px;color:#78716C;margin-bottom:2px">Due date</div>
          <div style="background:white;border-radius:6px;padding:4px 6px;font-size:8px">Apr 11, 2026</div>
        </div>
      </div>
      <div style="font-size:8px;font-weight:600;margin-bottom:4px">Line Items</div>
      <div class="row" style="justify-content:space-between"><div><div style="font-weight:600">Website Build — Milestone 2</div><div style="font-size:6.5px;color:#78716C">Qty 1 · Rate $7,000</div></div><span style="font-weight:700;font-size:9px">$7,000</span></div>
      <div class="row" style="justify-content:space-between"><div><div style="font-weight:600">Hosting setup</div><div style="font-size:6.5px;color:#78716C">Qty 1 · Rate $400</div></div><span style="font-weight:700;font-size:9px">$400</span></div>
      <div style="border-top:1px solid #E4E0D8;margin:6px 0 4px"></div>
      <div style="display:flex;justify-content:space-between;font-size:9px;font-weight:700">
        <span>Total Due</span><span style="color:#4F46E5">$7,400</span>
      </div>
      <div style="background:#4F46E5;color:white;border-radius:8px;padding:7px;text-align:center;font-size:8.5px;font-weight:600;margin-top:6px">Send Invoice →</div>
    </div>
  </div>
</div>

<!-- Features -->
<section class="features">
  <div class="fc">
    <div class="ico">📄</div>
    <h3>Smart Contracts</h3>
    <p>Track every contract from proposal to signed. Expiry alerts, renewal prompts, and status at a glance — with left-accent visual hierarchy inspired by editorial design.</p>
  </div>
  <div class="fc">
    <div class="ico">⚡</div>
    <h3>AI-Assisted Invoicing</h3>
    <p>Create invoices in seconds with AI pre-fill from your contracts. Line items, due dates, and NET terms suggested automatically — you just review and send.</p>
  </div>
  <div class="fc">
    <div class="ico">◈</div>
    <h3>Relationship Health</h3>
    <p>Every client gets a health score. Overdue invoices, stalled contracts, and engagement signals combine into a single pulse — so you know who needs attention.</p>
  </div>
</section>

<div class="band">
  <h2>✦ Inspired by a site of the day</h2>
  <p>SEAM's multi-state navigation pattern was directly inspired by SUTÉRA — Awwwards SOTD March 28 2026 — and the tab-anchored feature architecture of midday.ai. Each screen is a distinct "view" of your business, unified by warm paper tones and sharp financial data.</p>
</div>

<section class="pal">
  <h2>Design palette</h2>
  <div class="swatches">
    <div class="sw"><div class="swc" style="background:#F5F3EF"></div><div class="swi"><div class="n">Paper</div><div class="h">#F5F3EF</div></div></div>
    <div class="sw"><div class="swc" style="background:#4F46E5"></div><div class="swi"><div class="n">Indigo</div><div class="h">#4F46E5</div></div></div>
    <div class="sw"><div class="swc" style="background:#059669"></div><div class="swi"><div class="n">Emerald</div><div class="h">#059669</div></div></div>
    <div class="sw"><div class="swc" style="background:#D97706"></div><div class="swi"><div class="n">Amber</div><div class="h">#D97706</div></div></div>
    <div class="sw"><div class="swc" style="background:#E11D48"></div><div class="swi"><div class="n">Rose</div><div class="h">#E11D48</div></div></div>
    <div class="sw"><div class="swc" style="background:#0284C7"></div><div class="swi"><div class="n">Sky</div><div class="h">#0284C7</div></div></div>
  </div>
</section>

<footer>
  <p>SEAM — RAM Design Heartbeat &nbsp;·&nbsp; <a href="/seam-viewer">View pen file</a> &nbsp;·&nbsp; <a href="/seam-mock">Interactive mock ☀◑</a></p>
</footer>
</body>
</html>`;

async function main() {
  console.log('Publishing SEAM…');

  // a) Hero
  let res = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero ${SLUG}: HTTP ${res.status}`);

  // b) Viewer
  const penJson = fs.readFileSync(path.join(__dirname, 'seam.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${APP_NAME} — Pen Viewer</title>
  ${injection}
  <style>body{margin:0;background:#F5F3EF;font-family:Inter,sans-serif;display:flex;flex-direction:column;align-items:center;padding:40px 20px;min-height:100vh}
  h1{font-size:22px;font-weight:700;color:#1C1917;margin-bottom:4px}
  .sub{font-size:13px;color:#78716C;margin-bottom:28px}
  pre{background:white;border:1px solid #E4E0D8;border-radius:12px;padding:24px;max-width:900px;width:100%;overflow:auto;font-size:10px;max-height:600px;color:#1C1917;white-space:pre-wrap;word-break:break-all}
  a{color:#4F46E5;text-decoration:none;margin-top:20px;display:inline-block}</style>
  </head><body>
  <h1>SEAM — Pen File</h1>
  <div class="sub">pencil.dev v2.8 · 6 screens · LIGHT theme</div>
  <pre id="out">Loading...</pre>
  <a href="/seam">← Back to hero</a> &nbsp; <a href="/seam-mock">Interactive mock →</a>
  <script>
    try{
      const pen=JSON.parse(window.EMBEDDED_PEN);
      document.getElementById('out').textContent=JSON.stringify(pen,null,2);
    }catch(e){document.getElementById('out').textContent='Error: '+e.message;}
  </script>
  </body></html>`;

  res = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
  console.log(`  Viewer ${SLUG}-viewer: HTTP ${res.status}`);

  // d) Gallery queue
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
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
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:  new Date().toISOString(),
    published_at:  new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 6,
    source: 'heartbeat',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await ghReq({
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
  console.log(`  Gallery queue: HTTP ${putRes.status === 200 ? '200 OK' : putRes.body.slice(0, 80)}`);

  console.log('\n✓ All published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
