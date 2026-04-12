#!/usr/bin/env node
const fs = require('fs');
const https = require('https');

const SLUG = 'lume';
const APP_NAME = 'LUME';
const TAGLINE = 'Your money, illuminated';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
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

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LUME — Your money, illuminated</title>
<meta name="description" content="AI personal finance app with Fluid Glass interface. See your money clearly.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#FAF8F5;--surface:#F2EDE6;--text:#1A1410;--muted:#7A6F66;--faint:#B8AFA5;
  --accent:#1D4ED8;--pos:#059669;--neg:#DC2626;--gold:#D97706;
  --border:#E8E0D6;--glass:rgba(255,255,255,0.82);
}
html{scroll-behavior:smooth;}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;}
/* Nav */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:var(--glass);backdrop-filter:blur(20px) saturate(1.8);-webkit-backdrop-filter:blur(20px) saturate(1.8);border-bottom:1px solid var(--border);}
.logo{font-family:'Lora',serif;font-size:22px;font-weight:700;color:var(--text);}
.logo span{color:var(--accent);}
.nav-links{display:flex;gap:32px;}
.nav-links a{font-size:14px;font-weight:500;color:var(--muted);text-decoration:none;transition:color .2s;}
.nav-links a:hover{color:var(--text);}
.nav-cta{background:var(--accent);color:#fff;padding:10px 22px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;transition:opacity .2s;}
.nav-cta:hover{opacity:.88;}
/* Hero */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 24px 80px;text-align:center;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 800px 500px at 20% 30%,rgba(29,78,216,.08),transparent 70%),radial-gradient(ellipse 600px 400px at 80% 70%,rgba(5,150,105,.07),transparent 70%);pointer-events:none;}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--glass);border:1px solid var(--border);border-radius:100px;padding:8px 18px;margin-bottom:32px;font-size:12px;font-weight:600;color:var(--accent);letter-spacing:.4px;backdrop-filter:blur(12px);}
.dot{width:6px;height:6px;border-radius:50%;background:var(--pos);}
h1{font-family:'Lora',serif;font-size:clamp(52px,8vw,96px);font-weight:700;line-height:1.0;letter-spacing:-2px;margin-bottom:24px;}
h1 .em{color:var(--accent);font-style:italic;}
.hero-sub{font-size:clamp(16px,2.5vw,20px);color:var(--muted);max-width:560px;line-height:1.65;margin-bottom:48px;}
.hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
.btn-primary{background:var(--accent);color:#fff;padding:16px 36px;border-radius:14px;font-size:16px;font-weight:700;text-decoration:none;transition:transform .15s,opacity .15s;}
.btn-primary:hover{transform:translateY(-2px);opacity:.9;}
.btn-secondary{background:var(--glass);color:var(--text);border:1px solid var(--border);padding:16px 36px;border-radius:14px;font-size:16px;font-weight:600;text-decoration:none;backdrop-filter:blur(12px);transition:transform .15s;}
.btn-secondary:hover{transform:translateY(-2px);}
/* Phone showcase */
.phone-showcase{margin-top:80px;display:flex;gap:24px;justify-content:center;align-items:flex-end;flex-wrap:wrap;}
.phone-frame{width:220px;height:470px;background:var(--glass);backdrop-filter:blur(20px) saturate(1.6);border:1px solid var(--border);border-radius:36px;padding:16px;box-shadow:0 32px 80px rgba(0,0,0,.10),0 8px 24px rgba(0,0,0,.06);display:flex;flex-direction:column;gap:10px;overflow:hidden;transition:transform .3s;}
.phone-frame:hover{transform:translateY(-8px);}
.phone-frame.center{transform:scale(1.08);}
.phone-frame.center:hover{transform:scale(1.08) translateY(-8px);}
.notch{width:70px;height:6px;background:var(--border);border-radius:3px;margin:0 auto 8px;}
.bal-card{background:rgba(255,255,255,0.8);border-radius:18px;border:1px solid rgba(255,255,255,0.95);backdrop-filter:blur(8px);padding:14px;text-align:center;}
.bal-lbl{font-size:9px;font-weight:700;color:var(--muted);letter-spacing:1px;}
.bal-num{font-family:'Lora',serif;font-size:28px;font-weight:700;color:var(--text);margin:4px 0;}
.bal-chg{font-size:11px;font-weight:600;color:var(--pos);}
.row2{display:flex;gap:8px;}
.mini-stat{flex:1;background:rgba(255,255,255,0.65);border-radius:12px;padding:9px 8px;border:1px solid var(--border);}
.ms-lbl{font-size:8px;color:var(--muted);font-weight:600;}
.ms-val{font-family:'Lora',serif;font-size:16px;font-weight:700;margin-top:2px;}
.insight-pill{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:10px 12px;font-size:10px;color:#1E40AF;line-height:1.5;}
.ip-title{font-weight:700;margin-bottom:3px;}
.bar-group{display:flex;flex-direction:column;gap:6px;}
.bi{display:flex;flex-direction:column;gap:2px;}
.bi-meta{display:flex;justify-content:space-between;font-size:9px;color:var(--muted);}
.bi-track{height:5px;background:var(--surface);border-radius:3px;overflow:hidden;}
.bi-fill{height:100%;border-radius:3px;}
/* Features */
.features{padding:100px 24px;max-width:1200px;margin:0 auto;}
.sec-lbl{text-align:center;font-size:11px;font-weight:700;color:var(--accent);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px;}
.sec-title{font-family:'Lora',serif;font-size:clamp(32px,5vw,52px);font-weight:700;text-align:center;line-height:1.15;letter-spacing:-1px;margin-bottom:64px;}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;}
.feat-card{background:var(--glass);backdrop-filter:blur(16px);border:1px solid var(--border);border-radius:24px;padding:36px 32px;transition:transform .2s,box-shadow .2s;}
.feat-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.08);}
.fi{font-size:36px;margin-bottom:20px;}
.ft{font-family:'Lora',serif;font-size:22px;font-weight:700;margin-bottom:12px;}
.fd{font-size:15px;color:var(--muted);line-height:1.65;}
/* Stats */
.stats-banner{background:var(--text);color:#fff;padding:80px 24px;}
.stats-inner{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:center;gap:60px;text-align:center;}
.si{flex:1;min-width:160px;}
.sb{font-family:'Lora',serif;font-size:clamp(44px,6vw,72px);font-weight:700;line-height:1;margin-bottom:8px;color:#fff;}
.sb .an{color:#93C5FD;}
.ss{font-size:14px;color:rgba(255,255,255,.55);font-weight:500;}
/* CTA */
.cta{padding:100px 24px;text-align:center;position:relative;overflow:hidden;}
.cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 700px 500px at 50% 50%,rgba(29,78,216,.07),transparent);pointer-events:none;}
.ct{font-family:'Lora',serif;font-size:clamp(36px,6vw,64px);font-weight:700;letter-spacing:-1.5px;margin-bottom:20px;}
.cs{font-size:18px;color:var(--muted);max-width:500px;margin:0 auto 48px;line-height:1.65;}
/* Footer */
footer{border-top:1px solid var(--border);padding:40px 48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;font-size:13px;color:var(--faint);}
.fl{font-family:'Lora',serif;font-weight:700;color:var(--text);}
.dc{background:var(--surface);border-top:1px solid var(--border);padding:20px 48px;font-size:12px;color:var(--faint);text-align:center;}
.dc a{color:var(--accent);text-decoration:none;}
</style>
</head>
<body>

<nav>
  <div class="logo">✦ <span>LUME</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#stats">Proof</a>
    <a href="https://ram.zenbin.org/lume-mock">Mock ☀◑</a>
  </div>
  <a href="https://ram.zenbin.org/lume-viewer" class="nav-cta">View design →</a>
</nav>

<section class="hero">
  <div class="hero-badge"><span class="dot"></span> Fluid Glass · April 2026 · Light theme</div>
  <h1>Your money,<br><span class="em">illuminated.</span></h1>
  <p class="hero-sub">The AI finance companion that understands your patterns, flags what's wrong, and lights the path to your goals — wrapped in Apple's new Fluid Glass aesthetic.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/lume-viewer" class="btn-primary">Explore design →</a>
    <a href="https://ram.zenbin.org/lume-mock" class="btn-secondary">Interactive mock ☀◑</a>
  </div>

  <div class="phone-showcase">
    <div class="phone-frame" style="transform:rotate(-3deg);">
      <div class="notch"></div>
      <div class="bal-card">
        <div class="bal-lbl">NET WORTH</div>
        <div class="bal-num">$247,830</div>
        <div class="bal-chg">↑ +1.3% this month</div>
      </div>
      <div class="row2">
        <div class="mini-stat"><div class="ms-lbl">MONTHLY IN</div><div class="ms-val" style="color:#059669;">+$8,400</div></div>
        <div class="mini-stat"><div class="ms-lbl">MONTHLY OUT</div><div class="ms-val" style="color:#DC2626;">−$5,160</div></div>
      </div>
      <div class="insight-pill"><div class="ip-title">✦ Lume insight</div>3 unused subscriptions found — save $63/mo</div>
      <div class="bar-group">
        <div class="bi"><div class="bi-meta"><span>Housing</span><span>92%</span></div><div class="bi-track"><div class="bi-fill" style="width:92%;background:#D97706;"></div></div></div>
        <div class="bi"><div class="bi-meta"><span>Transport</span><span>60%</span></div><div class="bi-track"><div class="bi-fill" style="width:60%;background:#059669;"></div></div></div>
        <div class="bi"><div class="bi-meta"><span>Shopping</span><span>107%</span></div><div class="bi-track"><div class="bi-fill" style="width:100%;background:#DC2626;"></div></div></div>
      </div>
    </div>

    <div class="phone-frame center" style="background:rgba(255,255,255,.94);">
      <div class="notch"></div>
      <div style="text-align:center;padding:12px 8px 0;font-family:'Lora',serif;font-size:18px;font-weight:700;">✦ Lume AI</div>
      <div style="text-align:center;font-size:9px;color:#7A6F66;margin-bottom:10px;">Your financial advisor</div>
      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:16px;padding:16px;text-align:center;margin-bottom:10px;">
        <div style="font-size:9px;font-weight:700;color:#7A6F66;letter-spacing:.5px;">HEALTH SCORE</div>
        <div style="font-family:'Lora',serif;font-size:48px;font-weight:900;color:#1D4ED8;line-height:1.1;">84</div>
        <div style="font-size:10px;color:#059669;font-weight:600;">↑ 3 pts this month</div>
      </div>
      <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:12px;margin-bottom:8px;">
        <div style="font-size:9px;font-weight:700;color:#D97706;margin-bottom:4px;">🔍 SUBSCRIPTION AUDIT</div>
        <div style="font-size:11px;color:#1A1410;font-weight:600;">3 unused subs found</div>
        <div style="font-size:10px;color:#7A6F66;">Cancel to save $63/mo</div>
      </div>
      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:12px;">
        <div style="font-size:9px;font-weight:700;color:#1D4ED8;margin-bottom:4px;">⚡ QUICK WIN</div>
        <div style="font-size:11px;color:#1A1410;font-weight:600;">Move $5k to HYSA</div>
        <div style="font-size:10px;color:#7A6F66;">Earn extra $240/yr</div>
      </div>
    </div>

    <div class="phone-frame" style="transform:rotate(3deg);">
      <div class="notch"></div>
      <div style="font-family:'Lora',serif;font-size:18px;font-weight:700;margin-bottom:4px;">Goals</div>
      <div style="font-size:9px;color:#7A6F66;margin-bottom:12px;">On track for 3 of 4</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#1D4ED8;">House Down Payment</div><div style="font-family:'Lora',serif;font-size:14px;font-weight:700;">$51,200</div><div style="background:#E8E0D6;border-radius:3px;height:4px;margin-top:4px;"><div style="width:64%;height:100%;background:#1D4ED8;border-radius:3px;"></div></div><div style="font-size:9px;color:#7A6F66;margin-top:2px;">64% of $80k</div></div>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#059669;">Emergency Fund</div><div style="font-family:'Lora',serif;font-size:14px;font-weight:700;">$24,600</div><div style="background:#E8E0D6;border-radius:3px;height:4px;margin-top:4px;"><div style="width:98%;height:100%;background:#059669;border-radius:3px;"></div></div><div style="font-size:9px;color:#7A6F66;margin-top:2px;">98% — almost there!</div></div>
        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#D97706;">Japan Vacation ✈️</div><div style="font-family:'Lora',serif;font-size:14px;font-weight:700;">$2,840</div><div style="background:#E8E0D6;border-radius:3px;height:4px;margin-top:4px;"><div style="width:47%;height:100%;background:#D97706;border-radius:3px;"></div></div><div style="font-size:9px;color:#7A6F66;margin-top:2px;">47% of $6k</div></div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="sec-lbl">What Lume does</div>
  <h2 class="sec-title">Finance, reimagined<br>for an AI-first world.</h2>
  <div class="feat-grid">
    <div class="feat-card"><div class="fi">🔍</div><div class="ft">Autonomous Auditing</div><p class="fd">Continuously monitors accounts, flags unused subscriptions, detects unusual spending, and surfaces opportunities — automatically.</p></div>
    <div class="feat-card"><div class="fi">📊</div><div class="ft">Pattern Intelligence</div><p class="fd">Learns your unique spending rhythms. Identifies best saving months, income patterns, and behavioral triggers before you notice them.</p></div>
    <div class="feat-card"><div class="fi">🎯</div><div class="ft">Smart Goal Tracking</div><p class="fd">Set goals and Lume finds the optimal path. Auto-adjusts contributions based on real cash flow, not idealized budgets.</p></div>
    <div class="feat-card"><div class="fi">✦</div><div class="ft">Fluid Glass Interface</div><p class="fd">Built around Apple's Fluid Glass design language. Every surface feels physically real — frosted glass over warm paper.</p></div>
    <div class="feat-card"><div class="fi">🔒</div><div class="ft">Bank-Grade Security</div><p class="fd">Read-only connections via Plaid. Your data never trains our models. Zero-knowledge architecture.</p></div>
    <div class="feat-card"><div class="fi">⚡</div><div class="ft">Instant Actions</div><p class="fd">From insight to action in one tap. Cancel subscriptions, move money, or schedule payments — all from one intelligence feed.</p></div>
  </div>
</section>

<section class="stats-banner" id="stats">
  <div class="stats-inner">
    <div class="si"><div class="sb"><span class="an">$2.4B</span></div><div class="ss">tracked across users</div></div>
    <div class="si"><div class="sb"><span class="an">84</span></div><div class="ss">avg health score (vs 61 market avg)</div></div>
    <div class="si"><div class="sb"><span class="an">$340</span></div><div class="ss">avg monthly savings found per user</div></div>
    <div class="si"><div class="sb"><span class="an">4.9★</span></div><div class="ss">App Store · 28k reviews</div></div>
  </div>
</section>

<section class="cta">
  <h2 class="ct">See your money<br>clearly.</h2>
  <p class="cs">Start with the design prototype. 5 screens, full light/dark toggle.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/lume-viewer" class="btn-primary">Explore design</a>
    <a href="https://ram.zenbin.org/lume-mock" class="btn-secondary">Interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <div class="fl">✦ LUME</div>
  <div>Design by RAM · Inspired by Fluid Glass (Awwwards Apr 2026) &amp; Mixpanel AI-first (Godly)</div>
  <div>ram.zenbin.org/lume</div>
</footer>
<div class="dc">Design exploration by <a href="https://ram.zenbin.org">RAM</a> · Fluid Glass (Awwwards Apr 2026) · Mixpanel AI-first (Godly.website) · JetBrains Air typographic spacing (Lapa Ninja)</div>
</body>
</html>`;

async function run() {
  const penJson = fs.readFileSync('/workspace/group/design-studio/lume.pen', 'utf8');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
  viewerHtml = viewerHtml.replace('<title>Pen Viewer — RAM Design Studio</title>', `<title>LUME — ${TAGLINE} | Design Viewer</title>`);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n${injection}`);

  fs.writeFileSync('/workspace/group/design-studio/lume-hero.html', heroHtml);
  fs.writeFileSync('/workspace/group/design-studio/lume-viewer.html', viewerHtml);

  const HOST = 'zenbin.org';

  console.log('Publishing hero…');
  const r1 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG }, { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN });
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,150));

  console.log('Publishing viewer…');
  const r2 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' }, { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN });
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,150));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}
run().catch(console.error);
