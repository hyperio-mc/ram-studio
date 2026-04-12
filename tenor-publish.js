/**
 * TENOR — Publish pipeline
 * Hero page + viewer to ram.zenbin.org/tenor and ram.zenbin.org/tenor-viewer
 * Theme: LIGHT — warm parchment, deep navy, amber copper
 * Inspired by: Interfere.ai (numbered steps), The Footprint Firm, Cardless.com
 */
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'tenor';
const APP_NAME = 'TENOR';
const TAGLINE  = 'Deal intelligence for independent consultants';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

function zenPost(slug, html, title = '', subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, url: `https://${subdomain}.zenbin.org/${slug}` }));
    });
    req.on('error', reject);
    req.write(body);
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

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TENOR — Deal intelligence for independent consultants</title>
<meta name="description" content="Track deals across numbered stages, manage client relationships, and forecast revenue. A RAM design concept inspired by Interfere.ai and The Footprint Firm.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ram.zenbin.org/tenor">
<meta property="og:title" content="TENOR — Deal intelligence for independent consultants">
<meta property="og:description" content="Track deals across numbered stages, manage client relationships, and forecast revenue. A RAM design concept.">
<meta property="og:site_name" content="RAM Design Studio">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="TENOR — Deal intelligence for independent consultants">
<meta name="theme-color" content="#1E3A5F">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F4F1ED;
  --surface:#FFFFFF;
  --surface2:#EDE9E2;
  --surface3:#E5E0D8;
  --text:#1A1818;
  --mid:#5C5450;
  --muted:rgba(26,24,24,0.42);
  --navy:#1E3A5F;
  --navyMid:#2D5080;
  --navyLt:#D4DEF0;
  --amber:#C96B2A;
  --amberLt:#F5E3D4;
  --green:#256645;
  --greenLt:#D5EDDF;
  --border:#DDD9D2;
  --borderLt:#EDE9E2;
}
html{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

/* ── NAV ── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:64px;
  background:rgba(244,241,237,0.92);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
}
.nav-logo{font-size:18px;font-weight:700;letter-spacing:0.04em;color:var(--navy);text-decoration:none}
.nav-logo sup{font-size:9px;font-weight:500;letter-spacing:0.15em;color:var(--amber);vertical-align:super;margin-left:2px}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:var(--mid);text-decoration:none;letter-spacing:0.02em;transition:color .2s}
.nav-links a:hover{color:var(--navy)}
.nav-cta{font-size:13px;font-weight:600;padding:9px 22px;border-radius:8px;background:var(--navy);color:#fff;text-decoration:none;transition:transform .15s,opacity .15s}
.nav-cta:hover{opacity:.88}
.ram-tag{font-size:10px;font-weight:500;letter-spacing:0.12em;color:var(--muted);text-transform:uppercase;margin-right:12px}

/* ── HERO ── */
.hero{
  padding:130px 48px 80px;max-width:1280px;margin:0 auto;
  display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;
}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:10px;margin-bottom:28px;
  font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--amber);
}
.eyebrow-line{width:28px;height:1px;background:var(--amber);opacity:.6}
.hero-title{font-size:58px;font-weight:700;line-height:1.1;letter-spacing:-0.03em;margin-bottom:28px;max-width:580px}
.stage-num{
  display:inline-flex;align-items:center;justify-content:center;
  width:30px;height:30px;border-radius:5px;
  background:var(--navyLt);color:var(--navy);
  font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace;
  vertical-align:middle;margin:0 4px;position:relative;top:-3px;
}
.hero-sub{font-size:17px;line-height:1.85;color:var(--mid);max-width:460px;margin-bottom:40px;font-weight:300}
.hero-actions{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.btn-primary{font-size:14px;font-weight:600;padding:13px 30px;border-radius:8px;background:var(--navy);color:#fff;text-decoration:none;transition:transform .15s,opacity .15s}
.btn-primary:hover{opacity:.88;transform:translateY(-1px)}
.btn-ghost{font-size:14px;color:var(--mid);text-decoration:none;border:1px solid var(--border);padding:13px 24px;border-radius:8px;transition:border-color .2s,color .2s}
.btn-ghost:hover{border-color:var(--navy);color:var(--navy)}

/* ── PHONE MOCKUP ── */
.hero-visual{display:flex;justify-content:center;align-items:center}
.phone-wrap{
  width:285px;background:var(--surface);border-radius:44px;
  border:1.5px solid var(--border);overflow:hidden;
  box-shadow:0 40px 80px rgba(26,24,24,0.12),0 8px 24px rgba(26,24,24,0.07);
}
.phone-bar{height:44px;background:var(--bg);display:flex;align-items:center;justify-content:space-between;padding:0 22px}
.phone-bar span{font-size:13px;font-weight:500;color:var(--text)}
.phone-bar .i{font-size:10px;color:var(--mid)}
.phone-head{padding:14px 18px 6px;background:var(--bg);display:flex;justify-content:space-between;align-items:flex-start}
.ph-greet{font-size:12px;color:var(--mid);margin-bottom:3px}
.ph-name{font-size:18px;font-weight:700}
.avatar{width:36px;height:36px;border-radius:50%;background:var(--navyLt);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--navy)}
.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 14px}
.mt{background:var(--surface);border-radius:8px;padding:9px;box-shadow:0 1px 5px rgba(26,24,24,0.05)}
.mt-l{font-size:7.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
.mt-v{font-size:15px;font-weight:700}
.mt-v.g{color:var(--green)}
.mt-v.n{color:var(--navy)}
.mt-s{font-size:7.5px;color:var(--muted);margin-top:2px}
.deals{padding:4px 14px 8px}
.dl-hd{display:flex;justify-content:space-between;font-size:8.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--mid);margin:6px 0 6px;font-weight:600}
.dc{background:var(--surface);border-radius:7px;margin-bottom:5px;padding:9px 9px 9px 12px;position:relative;box-shadow:0 1px 5px rgba(26,24,24,0.05);overflow:hidden}
.dc-bar{position:absolute;left:0;top:0;bottom:0;width:3px}
.dc-n{font-size:8.5px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--muted);margin-bottom:1px}
.dc-c{font-size:11px;font-weight:600}
.dc-nm{font-size:9.5px;color:var(--mid);margin-top:1px}
.dc-ft{display:flex;justify-content:space-between;align-items:flex-end;margin-top:4px}
.dc-dots{display:flex;gap:4px}
.dd{width:5px;height:5px;border-radius:50%}
.dc-val{font-size:14px;font-weight:700}
.dc-sl{font-size:7.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;text-align:right;color:var(--muted);margin-bottom:1px}
.pnav{height:66px;background:var(--bg);border-top:1px solid var(--border);display:flex;align-items:flex-start;padding-top:8px}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px}
.ni-ic{font-size:17px;color:var(--muted)}
.ni-ic.a{color:var(--navy)}
.ni-lb{font-size:7.5px;color:var(--muted)}
.ni-lb.a{color:var(--navy);font-weight:600}

/* ── STATS BAR ── */
.stats-bar{background:var(--navy);color:rgba(255,255,255,0.88);padding:28px 48px;display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
.st{text-align:center}
.st-n{font-size:34px;font-weight:700;margin-bottom:4px;letter-spacing:-.02em}
.st-n s{font-style:normal;font-size:18px;font-weight:400;opacity:.5;text-decoration:none}
.st-d{font-size:12px;opacity:.55;letter-spacing:.02em}

/* ── FEATURES ── */
.features{max-width:1280px;margin:0 auto;padding:96px 48px}
.sec-eye{font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--amber);margin-bottom:14px}
.sec-h{font-size:46px;font-weight:700;letter-spacing:-.025em;margin-bottom:14px}
.sec-sub{font-size:17px;color:var(--mid);line-height:1.75;max-width:540px}
.fg{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:56px}
.fc{background:var(--surface);border-radius:16px;padding:36px 28px;border:1px solid var(--border)}
.fc-n{font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--amber);margin-bottom:18px;letter-spacing:.1em}
.fc-ic{font-size:28px;margin-bottom:14px}
.fc-t{font-size:19px;font-weight:700;margin-bottom:10px;letter-spacing:-.01em}
.fc-d{font-size:14px;color:var(--mid);line-height:1.7}

/* ── PIPELINE STAGES ── */
.pipeline-sec{background:var(--surface2);padding:96px 48px}
.pipeline-in{max-width:1280px;margin:0 auto}
.pipeline-hd{margin-bottom:52px}
.stages-track{display:flex;gap:0;position:relative;margin-bottom:48px}
.stages-track::before{content:'';position:absolute;top:28px;left:28px;right:28px;height:2px;background:var(--border);z-index:0}
.sn{flex:1;display:flex;flex-direction:column;align-items:center;gap:12px;position:relative;z-index:1}
.sc{width:56px;height:56px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;transition:transform .2s}
.sc:hover{transform:translateY(-2px)}
.sc.done{background:var(--greenLt);color:var(--green)}
.sc.act{background:var(--navy);color:#fff;box-shadow:0 4px 16px rgba(30,58,95,.28)}
.sc.pend{background:var(--surface);color:var(--muted);border:1px solid var(--border)}
.sc-lb{font-size:7.5px;letter-spacing:.06em;text-transform:uppercase;margin-top:1px;opacity:.65}
.sn-name{font-size:13px;font-weight:500;color:var(--mid);text-align:center}
.sn-cnt{font-size:11px;color:var(--muted);text-align:center}

/* ── TESTIMONIALS ── */
.testimonials{max-width:1280px;margin:0 auto;padding:96px 48px}
.tg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:52px}
.tc{background:var(--surface);border-radius:16px;padding:32px;border:1px solid var(--border)}
.tq{font-size:15px;line-height:1.8;color:var(--text);margin-bottom:22px;font-style:italic}
.ta{display:flex;align-items:center;gap:12px}
.tav{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
.tn{font-size:14px;font-weight:600;margin-bottom:2px}
.tr{font-size:12px;color:var(--muted)}

/* ── CTA ── */
.cta-sec{background:var(--navy);padding:96px 48px;text-align:center}
.cta-t{font-size:50px;font-weight:700;letter-spacing:-.025em;color:#fff;margin-bottom:18px;line-height:1.15}
.cta-s{font-size:17px;color:rgba(255,255,255,.55);margin-bottom:40px;line-height:1.75}
.cta-ac{display:flex;gap:16px;justify-content:center}
.btn-w{font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;background:#fff;color:var(--navy);text-decoration:none;transition:transform .15s,opacity .15s}
.btn-w:hover{transform:translateY(-1px);opacity:.92}
.btn-oa{font-size:14px;color:rgba(255,255,255,.65);text-decoration:none;border:1px solid rgba(255,255,255,.22);padding:14px 28px;border-radius:8px;transition:border-color .2s,color .2s}
.btn-oa:hover{border-color:rgba(255,255,255,.55);color:#fff}

/* ── FOOTER ── */
footer{background:var(--bg);border-top:1px solid var(--border);padding:36px 48px;display:flex;justify-content:space-between;align-items:center}
.fl{font-size:16px;font-weight:700;color:var(--navy);letter-spacing:.04em}
.fm{font-size:12px;color:var(--muted)}

@media(max-width:900px){
  .hero{grid-template-columns:1fr;gap:48px;padding:120px 24px 60px}
  .hero-title{font-size:42px}
  .fg,.tg{grid-template-columns:1fr}
  .stages-track{flex-direction:column;align-items:flex-start;padding-left:28px}
  .stages-track::before{top:28px;left:28px;right:auto;bottom:28px;width:2px;height:auto}
  nav{padding:0 24px}
  .nav-links{display:none}
  .stats-bar{grid-template-columns:repeat(2,1fr);padding:24px}
}
</style>
</head>
<body>
<nav>
  <a href="#" class="nav-logo">TENOR<sup>™</sup></a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#pipeline">Pipeline</a></li>
    <li><a href="#about">About</a></li>
  </ul>
  <div style="display:flex;align-items:center">
    <span class="ram-tag">RAM Design</span>
    <a href="#" class="nav-cta">Start Free Trial</a>
  </div>
</nav>

<section class="hero">
  <div>
    <div class="hero-eyebrow"><span class="eyebrow-line"></span>Deal Intelligence</div>
    <h1 class="hero-title">
      Source <span class="stage-num">01</span> deals. Close <span class="stage-num">03</span> contracts. Invoice <span class="stage-num">05</span> clients.
    </h1>
    <p class="hero-sub">TENOR gives independent consultants a numbered pipeline that mirrors how deals actually move — from first contact to final invoice.</p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Start Free Trial</a>
      <a href="https://ram.zenbin.org/tenor-viewer" class="btn-ghost">View Prototype →</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-wrap">
      <div class="phone-bar"><span>9:41</span><span class="i">●●● ◼</span></div>
      <div class="phone-head">
        <div><div class="ph-greet">Good morning,</div><div class="ph-name">Jordan Klein</div></div>
        <div class="avatar">JK</div>
      </div>
      <div class="metrics">
        <div class="mt"><div class="mt-l">This Month</div><div class="mt-v g">$28.4K</div><div class="mt-s">+12% vs last</div></div>
        <div class="mt"><div class="mt-l">Active Deals</div><div class="mt-v n">7</div><div class="mt-s">3 stages ahead</div></div>
        <div class="mt"><div class="mt-l">Win Rate</div><div class="mt-v">68%</div><div class="mt-s">trailing 6 mo</div></div>
      </div>
      <div class="deals">
        <div class="dl-hd"><span>Active Pipeline</span><span style="color:var(--navy)">See all</span></div>
        <div class="dc">
          <div class="dc-bar" style="background:#C96B2A"></div>
          <div class="dc-n">03</div>
          <div class="dc-c">Northmoor Capital</div>
          <div class="dc-nm">M&amp;A Strategy Advisory</div>
          <div class="dc-ft">
            <div class="dc-dots">
              <div class="dd" style="background:#C96B2A"></div>
              <div class="dd" style="background:#C96B2A"></div>
              <div class="dd" style="background:#C96B2A"></div>
              <div class="dd" style="background:#E5E0D8"></div>
              <div class="dd" style="background:#E5E0D8"></div>
            </div>
            <div><div class="dc-sl">Negotiating</div><div class="dc-val">$18K</div></div>
          </div>
        </div>
        <div class="dc">
          <div class="dc-bar" style="background:#256645"></div>
          <div class="dc-n">04</div>
          <div class="dc-c">Vestal Group</div>
          <div class="dc-nm">Operating Model Redesign</div>
          <div class="dc-ft">
            <div class="dc-dots">
              <div class="dd" style="background:#256645"></div>
              <div class="dd" style="background:#256645"></div>
              <div class="dd" style="background:#256645"></div>
              <div class="dd" style="background:#256645"></div>
              <div class="dd" style="background:#E5E0D8"></div>
            </div>
            <div><div class="dc-sl">Active</div><div class="dc-val">$24K</div></div>
          </div>
        </div>
      </div>
      <div class="pnav">
        <div class="ni"><span class="ni-ic a">◉</span><span class="ni-lb a">Home</span></div>
        <div class="ni"><span class="ni-ic">◫</span><span class="ni-lb">Pipeline</span></div>
        <div class="ni"><span class="ni-ic">◎</span><span class="ni-lb">Clients</span></div>
        <div class="ni"><span class="ni-ic">◈</span><span class="ni-lb">Revenue</span></div>
      </div>
    </div>
  </div>
</section>

<div class="stats-bar">
  <div class="st"><div class="st-n">$142<s>K</s></div><div class="st-d">avg. annual tracked revenue</div></div>
  <div class="st"><div class="st-n">68<s>%</s></div><div class="st-d">win rate improvement in 6 mo</div></div>
  <div class="st"><div class="st-n">5</div><div class="st-d">pipeline stages, fully custom</div></div>
  <div class="st"><div class="st-n">12<s>h</s></div><div class="st-d">avg. saved per month on admin</div></div>
</div>

<section class="features" id="features">
  <div class="sec-eye">Built for independence</div>
  <h2 class="sec-h">Your entire practice,<br>one elegant view</h2>
  <p class="sec-sub">From first prospect call to final invoice, TENOR tracks every deal across numbered stages that mirror how consulting actually works.</p>
  <div class="fg">
    <div class="fc"><div class="fc-n">01 / PIPELINE</div><div class="fc-ic">◫</div><h3 class="fc-t">Numbered stages that click</h3><p class="fc-d">Five stages — Sourced, Proposal, Negotiating, Active, Invoiced — built around the real consulting workflow. Move deals forward with one tap.</p></div>
    <div class="fc"><div class="fc-n">02 / CLIENTS</div><div class="fc-ic">◎</div><h3 class="fc-t">Client intelligence at a glance</h3><p class="fc-d">See lifetime value, active engagements, and deal history for every client. Know who's ready to expand and who needs follow-up.</p></div>
    <div class="fc"><div class="fc-n">03 / REVENUE</div><div class="fc-ic">◈</div><h3 class="fc-t">Forecast without a spreadsheet</h3><p class="fc-d">Monthly revenue charts, upcoming invoice tracking, and win rate trends. A financial view built for how consultants actually get paid.</p></div>
  </div>
</section>

<section class="pipeline-sec" id="pipeline">
  <div class="pipeline-in">
    <div class="pipeline-hd">
      <div class="sec-eye">The pipeline</div>
      <h2 class="sec-h">Five stages. Zero confusion.</h2>
      <p class="sec-sub">Inspired by how the best independent consultants manage their practices — numbered, sequential, always clear.</p>
    </div>
    <div class="stages-track">
      <div class="sn"><div class="sc done"><span>01</span><span class="sc-lb">Done</span></div><div class="sn-name">Sourced</div><div class="sn-cnt">Prospect identified</div></div>
      <div class="sn"><div class="sc done"><span>02</span><span class="sc-lb">Done</span></div><div class="sn-name">Proposal</div><div class="sn-cnt">Scope &amp; fees sent</div></div>
      <div class="sn"><div class="sc act"><span>03</span><span class="sc-lb">Active</span></div><div class="sn-name">Negotiating</div><div class="sn-cnt">Terms in discussion</div></div>
      <div class="sn"><div class="sc pend"><span>04</span><span class="sc-lb">Next</span></div><div class="sn-name">Active</div><div class="sn-cnt">Contract in progress</div></div>
      <div class="sn"><div class="sc pend"><span>05</span><span class="sc-lb">Final</span></div><div class="sn-name">Invoiced</div><div class="sn-cnt">Payment collected</div></div>
    </div>
  </div>
</section>

<section class="testimonials">
  <div style="text-align:center">
    <div class="sec-eye">From the field</div>
    <h2 class="sec-h" style="font-size:40px">What consultants say</h2>
  </div>
  <div class="tg">
    <div class="tc"><p class="tq">"I used to manage my pipeline in a spreadsheet. TENOR's numbered stages map perfectly to how deals actually move — I can see exactly where each client sits at a glance."</p><div class="ta"><div class="tav" style="background:#D4DEF0;color:#1E3A5F">JK</div><div><div class="tn">Jordan Klein</div><div class="tr">Independent M&amp;A Advisor</div></div></div></div>
    <div class="tc"><p class="tq">"The revenue forecasting is the feature I didn't know I needed. Seeing monthly income alongside active deals has completely changed how I price engagements."</p><div class="ta"><div class="tav" style="background:#D5EDDF;color:#256645">SR</div><div><div class="tn">Sara Routt</div><div class="tr">Fractional COO</div></div></div></div>
    <div class="tc"><p class="tq">"The deal detail timeline — seeing each milestone with its numbered stage and date — gave me the clarity to have better contract negotiations. I close 40% faster now."</p><div class="ta"><div class="tav" style="background:#F5E3D4;color:#C96B2A">PM</div><div><div class="tn">Patrick Mena</div><div class="tr">Strategy Consultant</div></div></div></div>
  </div>
</section>

<section class="cta-sec">
  <h2 class="cta-t">Your deals deserve<br>a system that works.</h2>
  <p class="cta-s">Start tracking your pipeline in minutes.<br>No onboarding calls. No enterprise contracts. Just clarity.</p>
  <div class="cta-ac">
    <a href="#" class="btn-w">Start Free — 30 Days</a>
    <a href="https://ram.zenbin.org/tenor-viewer" class="btn-oa">View Prototype</a>
  </div>
</section>

<footer>
  <div class="fl">TENOR™</div>
  <div class="fm">A RAM Design Studio concept · March 2026</div>
  <div class="fm">Light theme · 5 screens</div>
</footer>
</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'tenor.pen'), 'utf8');
const embInject = 'window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';';
const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TENOR — Design Viewer</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#F4F1ED;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:system-ui,sans-serif}
  header{width:100%;background:#FFFFFF;border-bottom:1px solid #DDD9D2;padding:14px 28px;display:flex;justify-content:space-between;align-items:center}
  .hb{font-size:18px;font-weight:700;color:#1E3A5F;letter-spacing:.04em}
  .hs{font-size:11px;color:rgba(26,24,24,.42);margin-top:3px}
  .hl{font-size:12px;color:#1E3A5F;text-decoration:none;font-weight:600}
  #pencil-viewer{width:100%;flex:1;border:none;min-height:600px}
</style>
</head>
<body>
<header>
  <div><div class="hb">TENOR</div><div class="hs">Deal intelligence for independent consultants · 5 screens · Light theme</div></div>
  <a href="https://ram.zenbin.org/tenor" class="hl">← Overview</a>
</header>
<script>${embInject}</script>
<script src="https://pencil.dev/viewer.js"></script>
<div id="pencil-viewer"></div>
<script>
  if(window.PencilViewer && window.EMBEDDED_PEN){
    PencilViewer.init('#pencil-viewer',{pen:JSON.parse(window.EMBEDDED_PEN)});
  }
</script>
</body>
</html>`;

// ─── PUBLISH + QUEUE ──────────────────────────────────────────────────────────
async function main() {
  console.log('📤 Publishing hero…');
  let r = await zenPost(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', r.status, r.status===200||r.status===201 ? '✓' : r.body.slice(0,100));

  console.log('📤 Publishing viewer…');
  r = await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log('Viewer:', r.status, r.status===200||r.status===201 ? '✓' : r.body.slice(0,100));

  // Gallery queue
  console.log('📚 Updating gallery queue…');
  try {
    const headers = { Authorization:`token ${TOKEN}`, 'User-Agent':'ram-heartbeat/1.0', Accept:'application/vnd.github.v3+json' };
    const g = await ghReq({ hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'GET', headers });
    const gj = JSON.parse(g.body);
    let q = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));
    if (Array.isArray(q)) q = { version:1, submissions:q, updated_at:new Date().toISOString() };
    if (!q.submissions) q.submissions = [];
    const now = new Date().toISOString();
    q.submissions.push({
      id:`heartbeat-${SLUG}-${Date.now()}`,
      status:'done', app_name:APP_NAME, tagline:TAGLINE, archetype:'deal-management',
      design_url:`https://ram.zenbin.org/${SLUG}`,
      mock_url:`https://ram.zenbin.org/${SLUG}-mock`,
      submitted_at:now, published_at:now, credit:'RAM Design Heartbeat',
      prompt:'Inspired by: Interfere.ai (Lapa Ninja) — numbered steps 01/02/03 woven into hero prose; The Footprint Firm (Siteinspire) — ADVISORY/INVESTMENT clean professional structure; Cardless.com (Land-Book) — warm cream white fintech palette. Light theme: #F4F1ED bg, #1E3A5F navy, #C96B2A amber copper. 5 screens: Dashboard (deal cards with numbered stage bar indicators + 3 metric tiles), Pipeline (stage-grouped deal list with filtered view), Deal Detail (numbered milestone timeline 01-05), Clients (roster with stage badges and lifetime value), Revenue (bar chart + invoice queue). Core innovation: numbered stage badges (01-05) as primary navigation metaphor throughout the app.',
      screens:5, source:'heartbeat', theme:'light',
    });
    q.updated_at = now;
    const encoded = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
    const putBody = Buffer.from(JSON.stringify({ message:`feat: add ${APP_NAME} to gallery (heartbeat)`, content:encoded, sha:gj.sha }));
    const p = await ghReq({ hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'PUT',
      headers:{ ...headers, 'Content-Type':'application/json', 'Content-Length':putBody.length } }, putBody);
    console.log(`Gallery: ${p.status} — ${p.status===200?'✓':p.body.slice(0,80)}`);
  } catch(e) { console.log('Gallery error:', e.message); }

  console.log(`\n✓ Hero    → https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer  → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`✓ Mock    → https://ram.zenbin.org/${SLUG}-mock (pending)`);
}
main().catch(console.error);
