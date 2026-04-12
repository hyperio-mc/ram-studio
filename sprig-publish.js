// SPRIG — publish hero page + viewer
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG        = 'sprig';
const VIEWER_SLUG = 'sprig-viewer';

// Read pen file
const penJson = fs.readFileSync(path.join(__dirname, 'sprig.pen'), 'utf8');

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.end(body); else r.end();
  });
}

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': subdomain,
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0',
    },
  }, body);
}

// ─── HERO PAGE ──────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SPRIG — Revenue Intelligence for Indie Makers</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:      #F8F7F2;
    --surface: #FFFFFF;
    --border:  #E8E5DC;
    --text:    #1A1A18;
    --muted:   #8A8880;
    --accent:  #2D6A4F;
    --accent2: #52B788;
    --accentBg:#EAF4EE;
    --warn:    #C4472A;
    --gold:    #C97D20;
    --goldBg:  #FDF3E3;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg); color: var(--text);
    min-height: 100vh; -webkit-font-smoothing: antialiased;
  }

  /* NAV */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 64px;
    background: rgba(248,247,242,0.92); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
  }
  .logo {
    font-size: 17px; font-weight: 900; letter-spacing: -0.05em;
    color: var(--accent); display: flex; align-items: center; gap: 2px;
  }
  .logo-dot { color: var(--text); }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.18s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff; padding: 9px 20px;
    border-radius: 9px; font-weight: 700; font-size: 12.5px;
    text-decoration: none; letter-spacing: -0.01em;
    transition: opacity 0.18s, transform 0.18s;
    box-shadow: 0 2px 8px rgba(45,106,79,0.22);
  }
  .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }

  /* HERO */
  .hero {
    max-width: 1100px; margin: 0 auto;
    padding: 100px 48px 88px;
    display: grid; grid-template-columns: 1fr 440px; gap: 72px; align-items: center;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--accentBg); color: var(--accent);
    font-size: 10.5px; font-weight: 700; padding: 5px 13px;
    border-radius: 100px; margin-bottom: 22px; letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  h1 {
    font-size: 56px; font-weight: 900; line-height: 1.03;
    letter-spacing: -0.045em; margin-bottom: 22px;
  }
  h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: 17px; color: var(--muted); line-height: 1.68;
    max-width: 440px; margin-bottom: 40px; font-weight: 400;
  }
  .cta-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 15px 30px; border-radius: 11px; font-weight: 700;
    font-size: 14px; text-decoration: none; letter-spacing: -0.015em;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 18px rgba(45,106,79,0.3);
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(45,106,79,0.38); }
  .btn-ghost {
    color: var(--text); padding: 15px 24px; border-radius: 11px;
    font-weight: 600; font-size: 14px; text-decoration: none;
    border: 1.5px solid var(--border); background: var(--surface);
    transition: border-color 0.18s, color 0.18s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  /* PHONE MOCKUP */
  .hero-visual {
    position: relative; height: 560px;
    display: flex; align-items: center; justify-content: center;
  }
  .phone-bg {
    position: absolute;
    width: 280px; height: 524px;
    background: var(--accentBg);
    border-radius: 44px;
    transform: rotate(7deg) translateX(28px) translateY(14px);
    border: 1.5px solid rgba(82,183,136,0.25);
  }
  .phone-bg-2 {
    position: absolute;
    width: 280px; height: 524px;
    background: var(--surface);
    border-radius: 44px;
    transform: rotate(3deg) translateX(12px) translateY(6px);
    border: 1px solid var(--border);
    box-shadow: 0 16px 48px rgba(0,0,0,0.07);
  }
  .phone {
    position: relative; z-index: 3;
    width: 280px; height: 524px;
    background: var(--surface);
    border-radius: 44px; overflow: hidden;
    box-shadow: 0 36px 88px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(0,0,0,0.06);
    transform: rotate(-1.5deg);
  }
  .phone-content { width: 100%; height: 100%; background: var(--bg); padding: 22px 18px 0; }
  .pbar { display: flex; justify-content: space-between; margin-bottom: 14px; }
  .pbar-time { font-size: 11px; font-weight: 600; color: var(--text); }
  .pbar-icons { font-size: 8px; color: var(--text); opacity: 0.7; }
  .p-title { font-size: 16px; font-weight: 900; color: var(--text); letter-spacing: -0.04em; margin-bottom: 12px; }
  .p-lbl { font-size: 8px; color: var(--muted); font-weight: 500; letter-spacing: 0.02em; margin-bottom: 3px; }
  .p-mrr { font-size: 30px; font-weight: 900; color: var(--text); letter-spacing: -0.05em; line-height: 1; }
  .p-badge { display: inline-flex; padding: 3px 9px; background: var(--accentBg); color: var(--accent); font-size: 9px; font-weight: 700; border-radius: 100px; margin-top: 5px; }
  .p-bars { display: flex; gap: 5px; align-items: flex-end; height: 48px; margin: 14px 0 10px; }
  .p-bar { flex: 1; border-radius: 3px 3px 0 0; }
  .p-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .p-card { background: var(--surface); border-radius: 10px; padding: 9px 10px; border: 1px solid var(--border); }
  .p-card-l { font-size: 7px; color: var(--muted); font-weight: 500; margin-bottom: 3px; }
  .p-card-v { font-size: 14px; font-weight: 800; color: var(--text); letter-spacing: -0.04em; line-height: 1; }
  .p-nav { display: flex; justify-content: space-around; background: var(--surface); border-top: 1px solid var(--border); padding: 10px 0; margin-top: 16px; }
  .p-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .p-nav-icon { font-size: 13px; }
  .p-nav-lbl { font-size: 7px; font-weight: 500; }

  /* STATS */
  .stats {
    max-width: 1100px; margin: 0 auto 88px; padding: 0 48px;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
  }
  .stat-card {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 18px; padding: 28px 24px;
    transition: box-shadow 0.2s;
  }
  .stat-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.07); }
  .stat-num { font-size: 34px; font-weight: 900; letter-spacing: -0.05em; color: var(--text); }
  .stat-lbl { font-size: 12px; color: var(--muted); font-weight: 500; margin-top: 6px; }
  .stat-chg { font-size: 11px; font-weight: 700; color: var(--accent); margin-top: 10px; display: flex; align-items: center; gap: 3px; }

  /* FEATURES */
  .features {
    max-width: 1100px; margin: 0 auto 96px; padding: 0 48px;
  }
  .sec-tag { font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 14px; }
  .sec-title { font-size: 38px; font-weight: 900; letter-spacing: -0.04em; margin-bottom: 52px; max-width: 500px; line-height: 1.1; }
  .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feat-card {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 18px; padding: 28px 24px;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .feat-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); transform: translateY(-4px); }
  .feat-icon {
    width: 42px; height: 42px; border-radius: 12px;
    background: var(--accentBg); color: var(--accent);
    font-size: 18px; display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px; font-weight: 700;
  }
  .feat-t { font-size: 15px; font-weight: 700; letter-spacing: -0.025em; margin-bottom: 10px; }
  .feat-d { font-size: 13px; color: var(--muted); line-height: 1.62; }

  /* SCREENS PREVIEW */
  .screens-sec {
    max-width: 1100px; margin: 0 auto 96px; padding: 0 48px;
  }
  .screen-scroll { display: flex; gap: 18px; overflow-x: auto; padding-bottom: 16px; }
  .screen-scroll::-webkit-scrollbar { height: 4px; }
  .screen-scroll::-webkit-scrollbar-track { background: var(--border); border-radius: 2px; }
  .screen-scroll::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }
  .screen-item {
    min-width: 190px; background: var(--surface);
    border: 1.5px solid var(--border); border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 18px rgba(0,0,0,0.06); flex-shrink: 0;
  }
  .screen-hdr {
    padding: 12px 16px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .screen-hdr-name { font-size: 11px; font-weight: 700; color: var(--text); }
  .screen-hdr-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
  .screen-body {
    height: 260px; display: flex; align-items: center; justify-content: center;
    background: var(--bg); flex-direction: column; gap: 8px;
  }
  .screen-ico { font-size: 32px; color: var(--accent); }
  .screen-num { font-size: 10px; color: var(--muted); font-weight: 500; }

  /* PALETTE */
  .palette-sec {
    max-width: 1100px; margin: 0 auto 96px; padding: 0 48px;
  }
  .swatch-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 28px; }
  .swatch { width: 84px; }
  .swatch-c { width: 84px; height: 84px; border-radius: 14px; margin-bottom: 9px; border: 1px solid rgba(0,0,0,0.06); }
  .swatch-n { font-size: 10px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .swatch-h { font-size: 10px; color: var(--muted); font-family: 'Courier New', monospace; }

  /* INSPIRATION NOTE */
  .inspo {
    max-width: 1100px; margin: 0 auto 96px; padding: 0 48px;
  }
  .inspo-card {
    background: var(--accentBg); border: 1.5px solid rgba(45,106,79,0.18);
    border-radius: 20px; padding: 40px 44px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
  }
  .inspo-item-tag { font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
  .inspo-item-title { font-size: 18px; font-weight: 800; color: var(--text); letter-spacing: -0.03em; margin-bottom: 10px; }
  .inspo-item-body { font-size: 13px; color: var(--muted); line-height: 1.65; }

  /* FOOTER */
  .footer-wrap {
    border-top: 1px solid var(--border); padding: 36px 48px;
    max-width: 1100px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-l { font-size: 12px; color: var(--muted); }
  .footer-l strong { color: var(--text); font-weight: 700; }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.18s; }
  .footer-links a:hover { color: var(--accent); }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 56px; padding: 64px 24px 56px; }
    h1 { font-size: 40px; }
    .hero-visual { height: 420px; }
    .stats { grid-template-columns: repeat(2,1fr); padding: 0 24px; }
    .feat-grid { grid-template-columns: 1fr; }
    .inspo-card { grid-template-columns: 1fr; gap: 28px; }
    .features, .screens-sec, .palette-sec, .inspo { padding: 0 24px; }
    nav { padding: 0 24px; }
    .footer-wrap { padding: 28px 24px; flex-direction: column; gap: 16px; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">sprig<span class="logo-dot">.</span></div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="#">Docs</a>
  </div>
  <a href="https://ram.zenbin.org/sprig-mock" class="nav-cta">Try mock ↗</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-badge">✦ Revenue Intelligence</div>
    <h1>Know your <em>MRR</em><br>inside out.</h1>
    <p class="hero-sub">
      Sprig gives indie makers and bootstrapped SaaS founders a clear, calm view of revenue — new MRR, churn, expansion, and exactly what's coming next.
    </p>
    <div class="cta-row">
      <a href="https://ram.zenbin.org/sprig-viewer" class="btn-primary">View design ↗</a>
      <a href="https://ram.zenbin.org/sprig-mock" class="btn-ghost">Interactive mock ☀◑</a>
    </div>
  </div>

  <div class="hero-visual">
    <div class="phone-bg"></div>
    <div class="phone-bg-2"></div>
    <div class="phone">
      <div class="phone-content">
        <div class="pbar">
          <span class="pbar-time">9:41</span>
          <span class="pbar-icons">●●● WiFi ▌</span>
        </div>
        <div class="p-title">Overview</div>
        <div class="p-lbl">Monthly Recurring Revenue</div>
        <div class="p-mrr">$24,830</div>
        <div><span class="p-badge">↑ +12.4% vs last month</span></div>
        <div class="p-bars">
          ${[52,60,78,68,76,92].map((h, i) => `<div class="p-bar" style="height:${Math.round(h*0.48)}px;background:${i>=5?'#2D6A4F':'#2D6A4F55'};"></div>`).join('')}
        </div>
        <div class="p-cards">
          <div class="p-card"><div class="p-card-l">ARR</div><div class="p-card-v">$298K</div></div>
          <div class="p-card"><div class="p-card-l">Churn</div><div class="p-card-v">1.8%</div></div>
          <div class="p-card"><div class="p-card-l">New MRR</div><div class="p-card-v">$3,120</div></div>
          <div class="p-card"><div class="p-card-l">Net MRR</div><div class="p-card-v" style="color:#2D6A4F">+$1,840</div></div>
        </div>
        <div class="p-nav">
          ${[['▦','Over'],['↗','Rev'],['◉','Cust'],['⌃','Cast'],['✦','Intel']].map(([icon, lbl], i) =>
            `<div class="p-nav-item">
              <div class="p-nav-icon" style="color:${i===0?'#2D6A4F':'#8A8880'}">${icon}</div>
              <div class="p-nav-lbl" style="color:${i===0?'#2D6A4F':'#8A8880'}">${lbl}</div>
            </div>`
          ).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="stats">
  <div class="stat-card">
    <div class="stat-num">284</div>
    <div class="stat-lbl">Active customers</div>
    <div class="stat-chg">↑ +18 this month</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">1.8%</div>
    <div class="stat-lbl">Monthly churn rate</div>
    <div class="stat-chg">↓ Best ever recorded</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">63%</div>
    <div class="stat-lbl">M6 cohort retention</div>
    <div class="stat-chg">↑ +4pp vs prev cohort</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">$41K</div>
    <div class="stat-lbl">Projected MRR (Dec '26)</div>
    <div class="stat-chg">↑ +65.9% growth ahead</div>
  </div>
</section>

<section class="features">
  <div class="sec-tag">What's inside</div>
  <h2 class="sec-title">Everything to understand your revenue.</h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">▦</div>
      <div class="feat-t">Live Dashboard</div>
      <div class="feat-d">MRR, ARR, churn, and net revenue at a glance. Period selector with MTD / QTD / YTD comparisons.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">↗</div>
      <div class="feat-t">Revenue Breakdown</div>
      <div class="feat-d">New, expansion, contraction, and churned MRR — see exactly where every dollar comes from.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◉</div>
      <div class="feat-t">Customer Intelligence</div>
      <div class="feat-d">Health scores, cohort retention bars, LTV, and churn risk flags for every account.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⌃</div>
      <div class="feat-t">Revenue Forecast</div>
      <div class="feat-d">12-month projections with tunable assumptions. Base, optimistic, and conservative scenarios.</div>
    </div>
    <div class="feat-card" style="border-color:rgba(74,108,247,0.2)">
      <div class="feat-icon" style="background:#EEF1FF;color:#4A6CF7;">✦</div>
      <div class="feat-t">Sprig Intelligence</div>
      <div class="feat-d">AI-surfaced expansion opportunities, churn warnings, and milestone alerts without noise.</div>
    </div>
    <div class="feat-card" style="border-color:rgba(201,125,32,0.2)">
      <div class="feat-icon" style="background:#FDF3E3;color:#C97D20;">⌁</div>
      <div class="feat-t">Plan Segmentation</div>
      <div class="feat-d">Slice every metric by plan tier. Know which plan drives growth and which has leaky churn.</div>
    </div>
  </div>
</section>

<section class="screens-sec">
  <div class="sec-tag">5 screens</div>
  <h2 class="sec-title">Clean data, warm palette.</h2>
  <div class="screen-scroll">
    ${['Overview','Revenue','Customers','Forecast','Insights'].map((name, i) => `
    <div class="screen-item">
      <div class="screen-hdr">
        <span class="screen-hdr-name">${name}</span>
        <div class="screen-hdr-dot"></div>
      </div>
      <div class="screen-body">
        <div class="screen-ico">${['▦','↗','◉','⌃','✦'][i]}</div>
        <div class="screen-num">Screen ${i+1} of 5</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="palette-sec">
  <div class="sec-tag">Design Palette</div>
  <h2 class="sec-title">Warm off-white meets forest green.</h2>
  <div class="swatch-row">
    ${[
      ['#F8F7F2','Background','Warm Off-White'],
      ['#FFFFFF','Surface','Pure White'],
      ['#1A1A18','Text','Near-Black'],
      ['#2D6A4F','Accent','Forest Green'],
      ['#52B788','Accent 2','Sage Mint'],
      ['#EAF4EE','Accent Bg','Green Tint'],
      ['#8A8880','Muted','Warm Gray'],
      ['#C4472A','Warning','Soft Red'],
    ].map(([hex, name, desc]) => `
    <div class="swatch">
      <div class="swatch-c" style="background:${hex};"></div>
      <div class="swatch-n">${name}</div>
      <div class="swatch-h">${hex}</div>
    </div>`).join('')}
  </div>
</section>

<section class="inspo">
  <div class="sec-tag">Design Inspiration</div>
  <h2 class="sec-title">What influenced Sprig.</h2>
  <div class="inspo-card">
    <div>
      <div class="inspo-item-tag">Source 1</div>
      <div class="inspo-item-title">Cardless — Land-book.com</div>
      <div class="inspo-item-body">The "Embedded Credit Card Platform" featured on Land-book (built in Framer) showed how fintech can feel calm and editorial — cream backgrounds, large number display, generous card layouts. Sprig takes that same restraint and applies it to a full dashboard.</div>
    </div>
    <div>
      <div class="inspo-item-tag">Source 2</div>
      <div class="inspo-item-title">Tayte.co — Minimal Gallery</div>
      <div class="inspo-item-body">Tayte.co's "minimal intervention design & development" ethos informed Sprig's whitespace philosophy. The monochromatic discipline — letting data breathe rather than decorating it — is the north star of this design.</div>
    </div>
  </div>
</section>

<div style="max-width:1100px;margin:0 auto;padding:0 48px 80px;">
  <div style="border:1.5px solid var(--border);border-radius:20px;padding:36px 40px;display:flex;align-items:center;justify-content:space-between;background:var(--surface);">
    <div>
      <div style="font-size:18px;font-weight:800;letter-spacing:-0.03em;margin-bottom:6px;">Ready to explore?</div>
      <div style="font-size:13px;color:var(--muted);">Open the interactive mock or view the full .pen file in pencil.dev</div>
    </div>
    <div style="display:flex;gap:12px;flex-shrink:0;">
      <a href="https://ram.zenbin.org/sprig-viewer" style="background:var(--bg);border:1.5px solid var(--border);color:var(--text);padding:12px 22px;border-radius:10px;font-weight:600;font-size:13px;text-decoration:none;">View .pen ↗</a>
      <a href="https://ram.zenbin.org/sprig-mock" style="background:var(--accent);color:#fff;padding:12px 22px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;box-shadow:0 4px 14px rgba(45,106,79,0.25);">Interactive mock ☀◑</a>
    </div>
  </div>
</div>

<div style="border-top:1px solid var(--border);">
  <div class="footer-wrap">
    <div class="footer-l"><strong>RAM</strong> Design Heartbeat · March 2026 · Inspired by Land-book + Minimal Gallery</div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/sprig-viewer">View .pen ↗</a>
      <a href="https://ram.zenbin.org/sprig-mock">Mock ↗</a>
      <a href="https://ram.zenbin.org">Gallery</a>
    </div>
  </div>
</div>

</body>
</html>`;

// ─── VIEWER PAGE ─────────────────────────────────────────────────────────
const viewerTemplatePath = path.join(__dirname, 'pencil-viewer.html');
let viewerHtml;
try {
  viewerHtml = fs.readFileSync(viewerTemplatePath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  console.log('✓ Using pencil-viewer.html template');
} catch (e) {
  console.log('! pencil-viewer.html not found, using fallback viewer');
  viewerHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>SPRIG — Pen Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,sans-serif;background:#F8F7F2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;color:#1A1A18}
.card{background:#fff;border:1px solid #E8E5DC;border-radius:20px;padding:48px;text-align:center;max-width:480px;box-shadow:0 8px 32px rgba(0,0,0,0.06)}
.icon{font-size:40px;margin-bottom:20px}
h2{font-size:24px;font-weight:900;letter-spacing:-0.04em;margin-bottom:8px;color:#2D6A4F}
p{font-size:14px;color:#8A8880;line-height:1.6;margin-bottom:24px}
a{color:#2D6A4F;font-weight:700;text-decoration:none;background:#EAF4EE;padding:12px 24px;border-radius:10px;display:inline-block}
</style>
</head>
<body>
<div class="card">
  <div class="icon">▦</div>
  <h2>SPRIG — Pen Viewer</h2>
  <p>Revenue Intelligence for Indie Makers<br>5 screens · Light theme · Forest green palette</p>
  <a href="https://pencil.dev">Open in pencil.dev ↗</a>
</div>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
</body></html>`;
}

// ─── RUN ─────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing SPRIG hero page…');
  const r1 = await publishToZenbin(SLUG, 'SPRIG — Revenue Intelligence for Indie Makers · RAM Design Studio', heroHtml);
  console.log(`  Hero: HTTP ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing SPRIG viewer…');
  const r2 = await publishToZenbin(VIEWER_SLUG, 'SPRIG Viewer · RAM Design Studio', viewerHtml);
  console.log(`  Viewer: HTTP ${r2.status} → https://ram.zenbin.org/${VIEWER_SLUG}`);
})();
