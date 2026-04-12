// Build hero + viewer HTML for FOLIO
const fs = require('fs');

// ── HERO HTML ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>FOLIO — The financial dashboard for people who make things.</title>
  <meta name="description" content="FOLIO brings editorial design to personal finance. Built for creative freelancers who want their money to look as good as their work.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#F7F4EF;--paper:#FDFBF8;--surface:#FFFFFF;
      --text:#1A1714;--muted:rgba(26,23,20,0.42);--faint:rgba(26,23,20,0.07);
      --accent:#B8FF00;--accent2:#4A3728;
      --sage:#8BA888;--coral:#E8614A;--gold:#C9963A;
      --border:rgba(26,23,20,0.09);--border-md:rgba(26,23,20,0.15)
    }
    body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;overflow-x:hidden}
    a{color:var(--text);text-decoration:none}
    .serif{font-family:'Playfair Display',Georgia,serif}
    .mono{font-family:'JetBrains Mono',monospace}
    nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(247,244,239,0.88);backdrop-filter:blur(14px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:58px}
    .nav-brand{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px}
    .nav-issue{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:0.08em}
    .nav-links{display:flex;gap:28px}
    .nav-links a{font-size:13px;font-weight:500;color:var(--muted)}
    .nav-links a:hover{color:var(--text)}
    .nav-cta{background:var(--text);color:var(--bg);font-size:13px;font-weight:600;padding:9px 20px;border-radius:6px}
    .nav-cta:hover{background:var(--accent2);color:white}
    .hero{max-width:1200px;margin:0 auto;padding:118px 48px 80px;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start}
    .hero-left{padding-top:20px}
    .hero-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;color:var(--muted);text-transform:uppercase;margin-bottom:22px;display:flex;align-items:center;gap:10px}
    .hero-eyebrow::before{content:'';width:24px;height:1px;background:var(--muted)}
    .hero-headline{font-family:'Playfair Display',Georgia,serif;font-size:60px;font-weight:700;line-height:1.08;letter-spacing:-0.025em;margin-bottom:26px}
    .hero-headline em{font-style:italic;color:var(--accent2)}
    .accent-mark{display:inline-block;background:var(--accent);padding:0 8px;border-radius:4px;color:var(--text);font-style:normal}
    .hero-sub{font-size:17px;color:var(--muted);line-height:1.7;max-width:420px;margin-bottom:38px}
    .hero-ctas{display:flex;gap:12px;align-items:center;margin-bottom:52px}
    .btn-primary{background:var(--text);color:var(--bg);font-size:14px;font-weight:600;padding:13px 26px;border-radius:7px}
    .btn-primary:hover{background:var(--accent2)}
    .btn-outline{background:transparent;color:var(--text);font-size:14px;font-weight:500;padding:12px 24px;border-radius:7px;border:1px solid var(--border-md)}
    .btn-outline:hover{border-color:var(--text)}
    .hero-stats{display:flex;gap:36px;padding-top:32px;border-top:1px solid var(--border)}
    .stat-val{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;letter-spacing:-0.02em}
    .stat-val .up{color:var(--sage)}
    .stat-lbl{font-size:11px;color:var(--muted);margin-top:2px;font-family:'JetBrains Mono',monospace;letter-spacing:0.06em}
    .hero-mock{background:var(--surface);border:1px solid var(--border-md);border-radius:14px;overflow:hidden;box-shadow:0 32px 72px rgba(26,23,20,0.12),0 4px 16px rgba(26,23,20,0.06)}
    .mock-topbar{background:var(--bg);border-bottom:1px solid var(--border);padding:12px 16px;display:flex;align-items:center;justify-content:space-between}
    .mock-brand{font-family:'Playfair Display',serif;font-size:14px;font-weight:700}
    .mock-issue{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted)}
    .mock-tab-row{display:flex;border-bottom:1px solid var(--border)}
    .mock-tab{padding:8px 14px;font-size:11px;font-weight:500;color:var(--muted);border-bottom:2px solid transparent}
    .mock-tab.active{color:var(--text);border-bottom-color:var(--text)}
    .mock-body{padding:16px}
    .mock-big-num{margin-bottom:14px}
    .mock-big-num .lbl{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px}
    .mock-big-num .val{font-family:'Playfair Display',serif;font-size:38px;font-weight:700;letter-spacing:-0.02em;line-height:1}
    .mock-big-num .sub{font-size:11px;color:var(--muted);margin-top:5px;display:flex;align-items:center;gap:6px}
    .badge-lime{background:var(--accent);color:var(--text);font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;font-family:'JetBrains Mono',monospace}
    .mock-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
    .mock-metric{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px}
    .mm-lbl{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace;letter-spacing:0.08em;margin-bottom:4px}
    .mm-val{font-family:'Playfair Display',serif;font-size:16px;font-weight:700}
    .mm-val.red{color:var(--coral)}.mm-val.gold{color:var(--gold)}
    .bars-lbl{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace;letter-spacing:0.08em;margin-bottom:8px}
    .bars-row{display:flex;align-items:flex-end;gap:6px;height:64px}
    .bar-col{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;height:100%;justify-content:flex-end}
    .bar-fill{width:100%;border-radius:3px 3px 0 0;background:var(--faint);min-height:4px}
    .bar-fill.active{background:var(--accent)}
    .bar-lbl{font-size:8px;color:var(--muted);font-family:'JetBrains Mono',monospace}
    .mock-list-item{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)}
    .mock-list-item:last-child{border-bottom:none}
    .ml-title{font-size:11px;font-weight:500}
    .ml-sub{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace;margin-top:1px}
    .ml-amount{font-size:12px;font-weight:600;font-family:'JetBrains Mono',monospace}
    .ml-amount.inc{color:var(--sage)}.ml-amount.exp{color:var(--coral)}
    .features{max-width:1200px;margin:0 auto;padding:96px 48px}
    .sec-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;color:var(--muted);text-transform:uppercase;margin-bottom:16px}
    .sec-title{font-family:'Playfair Display',serif;font-size:48px;font-weight:700;line-height:1.1;letter-spacing:-0.02em;max-width:560px;margin-bottom:56px}
    .sec-title em{font-style:italic;color:var(--accent2)}
    .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .feat{background:var(--surface);padding:36px 30px}
    .feat-num{font-family:'Playfair Display',serif;font-size:48px;font-weight:400;color:rgba(26,23,20,0.07);line-height:1;margin-bottom:14px}
    .feat-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:10px}
    .feat-body{font-size:14px;color:var(--muted);line-height:1.6}
    .feat-tag{display:inline-block;margin-top:14px;font-family:'JetBrains Mono',monospace;font-size:10px;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:3px 8px;color:var(--muted)}
    .showcase{background:var(--text);color:var(--bg);padding:96px 0;overflow:hidden}
    .showcase-inner{max-width:1200px;margin:0 auto;padding:0 48px 40px}
    .showcase-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;color:rgba(247,244,239,0.4);text-transform:uppercase;margin-bottom:14px}
    .showcase-title{font-family:'Playfair Display',serif;font-size:46px;font-weight:700;line-height:1.1;letter-spacing:-0.02em;margin-bottom:44px}
    .showcase-title em{font-style:italic;color:var(--accent)}
    .screens-row{display:flex;gap:16px;overflow-x:auto;padding:0 48px 12px;scrollbar-width:none}
    .screens-row::-webkit-scrollbar{display:none}
    .screen-card{background:var(--bg);color:var(--text);border-radius:12px;overflow:hidden;flex-shrink:0;width:230px;border:1px solid rgba(247,244,239,0.1)}
    .sc-head{background:var(--bg);border-bottom:1px solid var(--border);padding:10px 12px;display:flex;align-items:center;justify-content:space-between}
    .sc-name{font-family:'Playfair Display',serif;font-size:13px;font-weight:700}
    .sc-ref{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted)}
    .sc-body{padding:12px}
    .sc-m .v{font-family:'Playfair Display',serif;font-size:22px;font-weight:700}.sc-m .l{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace}
    .sc-bar-row{display:flex;gap:4px;align-items:flex-end;height:40px;margin:8px 0}
    .sc-bar{flex:1;border-radius:2px 2px 0 0;background:rgba(26,23,20,0.07)}.sc-bar.hi{background:var(--accent)}
    .sc-li{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:10px}
    .sc-li:last-child{border-bottom:none}
    .sc-li-v{font-family:'JetBrains Mono',monospace}.sc-li-v.g{color:var(--sage)}.sc-li-v.r{color:var(--coral)}
    .sc-prog{margin-bottom:6px}
    .sc-prog-lbl{display:flex;justify-content:space-between;font-size:9px;font-family:'JetBrains Mono',monospace;margin-bottom:3px}
    .sc-prog-bar{height:3px;background:rgba(26,23,20,0.07);border-radius:2px}
    .sc-prog-fill{height:100%;background:var(--accent);border-radius:2px}
    .editorial{max-width:1200px;margin:0 auto;padding:80px 48px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
    .ed-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;color:var(--muted);text-transform:uppercase;margin-bottom:20px}
    .ed-quote{font-family:'Playfair Display',serif;font-size:36px;font-weight:400;font-style:italic;line-height:1.3;letter-spacing:-0.01em;margin-bottom:22px}
    .ed-attr{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:8px}
    .ed-attr::before{content:'—'}
    .ed-palette{display:flex;flex-direction:column;gap:12px}
    .swatch-row{display:flex;align-items:center;gap:12px}
    .swatch{width:38px;height:38px;border-radius:8px;border:1px solid var(--border);flex-shrink:0}
    .sw-name{font-size:13px;font-weight:600}.sw-hex{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)}
    .pricing{background:var(--paper);padding:96px 0}
    .pricing-inner{max-width:1200px;margin:0 auto;padding:0 48px}
    .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px}
    .plan{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:36px}
    .plan.featured{background:var(--text);color:var(--bg);border-color:var(--text)}
    .plan-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:6px}
    .plan-price{font-family:'Playfair Display',serif;font-size:42px;font-weight:700;letter-spacing:-0.02em;margin:18px 0 4px}
    .plan-price span{font-size:16px;font-weight:400}
    .plan-period{font-size:12px;color:var(--muted);margin-bottom:22px;font-family:'JetBrains Mono',monospace}
    .plan.featured .plan-period{color:rgba(247,244,239,0.5)}
    .plan-features{list-style:none;border-top:1px solid var(--border);padding-top:22px}
    .plan.featured .plan-features{border-color:rgba(247,244,239,0.15)}
    .plan-feature{display:flex;align-items:center;gap:10px;font-size:13px;margin-bottom:11px}
    .plan-feature::before{content:'✓';font-family:'JetBrains Mono',monospace;font-size:11px;width:16px;text-align:center}
    .plan-feature.muted{color:var(--muted)}.plan-feature.muted::before{content:'–';color:var(--muted)}
    .plan-cta{display:block;text-align:center;margin-top:26px;padding:12px;border-radius:7px;font-size:14px;font-weight:600}
    .plan-cta.dark{background:var(--text);color:var(--bg)}
    .plan-cta.lime{background:var(--accent);color:var(--text)}
    .plan-cta.outline{border:1px solid rgba(247,244,239,0.25);color:var(--bg)}
    footer{background:var(--text);color:rgba(247,244,239,0.6);padding:60px 48px 40px}
    .footer-inner{max-width:1200px;margin:0 auto}
    .footer-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:44px}
    .footer-brand{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:var(--bg)}
    .footer-tagline{font-size:13px;color:rgba(247,244,239,0.4);margin-top:6px}
    .footer-links{display:flex;gap:48px}
    .footer-col h4{font-size:11px;font-family:'JetBrains Mono',monospace;letter-spacing:0.12em;color:rgba(247,244,239,0.45);text-transform:uppercase;margin-bottom:14px}
    .footer-col a{display:block;font-size:13px;color:rgba(247,244,239,0.6);margin-bottom:10px}
    .footer-col a:hover{color:var(--bg)}
    .footer-bottom{border-top:1px solid rgba(247,244,239,0.1);padding-top:24px;display:flex;align-items:center;justify-content:space-between}
    .footer-copy{font-size:12px;font-family:'JetBrains Mono',monospace}
    .footer-link-row{display:flex;gap:20px}
    .footer-link-row a{font-size:12px;color:rgba(247,244,239,0.45);font-family:'JetBrains Mono',monospace}
    .footer-accent{display:inline-block;background:var(--accent);color:var(--text);padding:2px 6px;border-radius:3px;font-weight:700}
    @media(max-width:900px){
      .hero,.editorial{grid-template-columns:1fr}
      .feat-grid,.pricing-grid{grid-template-columns:1fr}
      .hero-headline{font-size:42px}
      nav{padding:0 24px}
      .nav-links{display:none}
      .hero,.features,.editorial,.pricing-inner{padding-left:24px;padding-right:24px}
    }
  </style>
</head>
<body>
<nav>
  <div class="nav-brand serif">FOLIO <span class="nav-issue mono">Issue N°04 · 2026</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#pricing">Pricing</a>
  </div>
  <a href="https://ram.zenbin.org/folio-viewer" class="nav-cta">Open Prototype →</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow mono">Design Studio · RAM</div>
    <h1 class="hero-headline serif">Your finances,<br><em>beautifully</em><br><span class="accent-mark">accounted</span>.</h1>
    <p class="hero-sub">FOLIO brings editorial design thinking to personal finance. Built for creative freelancers who want their money to look as considered as their work.</p>
    <div class="hero-ctas">
      <a href="https://ram.zenbin.org/folio-viewer" class="btn-primary">Open Prototype →</a>
      <a href="https://ram.zenbin.org/folio-mock" class="btn-outline">Interactive Mock ☀◑</a>
    </div>
    <div class="hero-stats">
      <div><div class="stat-val serif"><span class="up">$14,820</span></div><div class="stat-lbl mono">April income</div></div>
      <div><div class="stat-val serif">38.5h</div><div class="stat-lbl mono">Billable / week</div></div>
      <div><div class="stat-val serif">6</div><div class="stat-lbl mono">Screens</div></div>
    </div>
  </div>
  <div class="hero-mock">
    <div class="mock-topbar">
      <div class="mock-brand serif">FOLIO</div>
      <div class="mock-issue mono">Issue N°04 · Apr 2026</div>
    </div>
    <div class="mock-tab-row">
      <div class="mock-tab active">Overview</div>
      <div class="mock-tab">Income</div>
      <div class="mock-tab">Invoices</div>
      <div class="mock-tab">Tax</div>
    </div>
    <div class="mock-body">
      <div class="mock-big-num">
        <div class="lbl mono">Net Income · April 2026</div>
        <div class="val serif">$14,820</div>
        <div class="sub mono">up from $12,540 <span class="badge-lime">+18%</span></div>
      </div>
      <div class="mock-metrics">
        <div class="mock-metric"><div class="mm-lbl mono">Invoiced</div><div class="mm-val serif">$18,500</div></div>
        <div class="mock-metric"><div class="mm-lbl mono">Expenses</div><div class="mm-val serif red">$3,680</div></div>
        <div class="mock-metric"><div class="mm-lbl mono">Pending</div><div class="mm-val serif gold">$4,200</div></div>
      </div>
      <div style="margin-bottom:14px">
        <div class="bars-lbl mono">Revenue · Last 6 Months</div>
        <div class="bars-row">
          <div class="bar-col"><div class="bar-fill" style="height:60%"></div><div class="bar-lbl mono">Nov</div></div>
          <div class="bar-col"><div class="bar-fill" style="height:55%"></div><div class="bar-lbl mono">Dec</div></div>
          <div class="bar-col"><div class="bar-fill" style="height:75%"></div><div class="bar-lbl mono">Jan</div></div>
          <div class="bar-col"><div class="bar-fill" style="height:80%"></div><div class="bar-lbl mono">Feb</div></div>
          <div class="bar-col"><div class="bar-fill" style="height:88%"></div><div class="bar-lbl mono">Mar</div></div>
          <div class="bar-col"><div class="bar-fill active" style="height:100%"></div><div class="bar-lbl mono">Apr</div></div>
        </div>
      </div>
      <div class="mock-list-item"><div><div class="ml-title">Stripe · Acme Corp</div><div class="ml-sub mono">Apr 3</div></div><div class="ml-amount inc">+$4,200</div></div>
      <div class="mock-list-item"><div><div class="ml-title">Adobe Creative Cloud</div><div class="ml-sub mono">Apr 1</div></div><div class="ml-amount exp">–$54.99</div></div>
      <div class="mock-list-item"><div><div class="ml-title">INV-031 · Paid</div><div class="ml-sub mono">Mar 30</div></div><div class="ml-amount inc">+$6,800</div></div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="sec-label mono">What's Inside</div>
  <h2 class="sec-title serif">Built for how<br><em>creatives</em> work.</h2>
  <div class="feat-grid">
    <div class="feat"><div class="feat-num serif">01</div><div class="feat-title serif">Income Overview</div><p class="feat-body">Editorial dashboard with serif type, chartreuse accent bars, and client-level revenue breakdowns.</p><span class="feat-tag mono">6 screens</span></div>
    <div class="feat"><div class="feat-num serif">02</div><div class="feat-title serif">Invoice Tracker</div><p class="feat-body">Catalog-style invoice list with status indicators — open, overdue, paid — and reference notation.</p><span class="feat-tag mono">Ref. INV-034</span></div>
    <div class="feat"><div class="feat-num serif">03</div><div class="feat-title serif">Time & Billing</div><p class="feat-body">Weekly time log with per-client rate tracking, blended hourly rate, and project budget burn.</p><span class="feat-tag mono">38.5h billed</span></div>
    <div class="feat"><div class="feat-num serif">04</div><div class="feat-title serif">Expense Categories</div><p class="feat-body">Seven-category spend breakdown with AI insight cards surfacing patterns before they become problems.</p><span class="feat-tag mono">$3,680/mo</span></div>
    <div class="feat"><div class="feat-num serif">05</div><div class="feat-title serif">Tax Planner</div><p class="feat-body">Quarterly estimated tax with federal, SE, and state breakdowns. Action checklist tied to real deadlines.</p><span class="feat-tag mono">Due Jun 15</span></div>
    <div class="feat"><div class="feat-num serif">06</div><div class="feat-title serif">Editorial Aesthetic</div><p class="feat-body">Warm cream backgrounds, Playfair Display at large sizes, archival reference notation.</p><span class="feat-tag mono">Issue N°04</span></div>
  </div>
</section>

<section class="showcase" id="screens">
  <div class="showcase-inner">
    <div class="showcase-label mono">6 Screens Designed</div>
    <h2 class="showcase-title serif">From invoices to<br><em>tax day</em>, covered.</h2>
  </div>
  <div class="screens-row">
    <div class="screen-card">
      <div class="sc-head"><div class="sc-name serif">Overview</div><div class="sc-ref mono">01/06</div></div>
      <div class="sc-body">
        <div class="sc-m"><div class="l mono">Net Income</div><div class="v serif">$14,820</div></div>
        <div class="sc-bar-row">
          <div class="sc-bar" style="height:62%"></div><div class="sc-bar" style="height:57%"></div>
          <div class="sc-bar" style="height:76%"></div><div class="sc-bar" style="height:82%"></div>
          <div class="sc-bar" style="height:90%"></div><div class="sc-bar hi" style="height:100%"></div>
        </div>
        <div class="sc-li"><span>Acme Corp</span><span class="sc-li-v g">+$4,200</span></div>
        <div class="sc-li"><span>Adobe CC</span><span class="sc-li-v r">–$55</span></div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-head"><div class="sc-name serif">Income</div><div class="sc-ref mono">02/06</div></div>
      <div class="sc-body">
        <div class="sc-m"><div class="l mono">Invoiced</div><div class="v serif">$18,500</div></div>
        <div class="sc-li"><span>Acme Corp</span><span class="sc-li-v g">$8,200</span></div>
        <div class="sc-li"><span>Northlight</span><span class="sc-li-v" style="color:#C9963A">$5,800</span></div>
        <div class="sc-li"><span>Studio Kite</span><span class="sc-li-v">$3,200</span></div>
        <div class="sc-li"><span>Fernwood</span><span class="sc-li-v">$1,300</span></div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-head"><div class="sc-name serif">Invoices</div><div class="sc-ref mono">03/06</div></div>
      <div class="sc-body">
        <div class="sc-m"><div class="l mono">Open / Paid</div><div class="v serif">3 · 8</div></div>
        <div class="sc-li"><span>INV-034</span><span class="sc-li-v" style="color:#C9963A">Open</span></div>
        <div class="sc-li"><span>INV-033</span><span class="sc-li-v" style="color:#C9963A">Open</span></div>
        <div class="sc-li"><span>INV-032</span><span class="sc-li-v r">Overdue</span></div>
        <div class="sc-li"><span>INV-031</span><span class="sc-li-v g">Paid</span></div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-head"><div class="sc-name serif">Expenses</div><div class="sc-ref mono">04/06</div></div>
      <div class="sc-body">
        <div class="sc-m"><div class="l mono">This Month</div><div class="v serif r" style="color:#E8614A">$3,680</div></div>
        <div class="sc-prog"><div class="sc-prog-lbl mono"><span>Software</span><span>$342</span></div><div class="sc-prog-bar"><div class="sc-prog-fill" style="width:78%"></div></div></div>
        <div class="sc-prog"><div class="sc-prog-lbl mono"><span>Equipment</span><span>$1,200</span></div><div class="sc-prog-bar"><div class="sc-prog-fill" style="width:45%"></div></div></div>
        <div class="sc-prog"><div class="sc-prog-lbl mono"><span>Workspace</span><span>$880</span></div><div class="sc-prog-bar"><div class="sc-prog-fill" style="width:60%"></div></div></div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-head"><div class="sc-name serif">Time</div><div class="sc-ref mono">05/06</div></div>
      <div class="sc-body">
        <div class="sc-m"><div class="l mono">Billable</div><div class="v serif">38.5h</div></div>
        <div class="sc-li"><span>Mon · Acme</span><span class="sc-li-v">8.5h</span></div>
        <div class="sc-li"><span>Tue · North.</span><span class="sc-li-v">7.0h</span></div>
        <div class="sc-li"><span>Wed · Acme</span><span class="sc-li-v">9.0h</span></div>
        <div class="sc-li"><span>Thu · Kite</span><span class="sc-li-v">7.5h</span></div>
      </div>
    </div>
    <div class="screen-card">
      <div class="sc-head"><div class="sc-name serif">Tax</div><div class="sc-ref mono">06/06</div></div>
      <div class="sc-body">
        <div class="sc-m"><div class="l mono">Q2 Estimate</div><div class="v serif r" style="color:#E8614A">$4,840</div></div>
        <div class="sc-prog"><div class="sc-prog-lbl mono"><span>Federal</span><span>$2,480</span></div><div class="sc-prog-bar"><div class="sc-prog-fill" style="width:51%"></div></div></div>
        <div class="sc-prog"><div class="sc-prog-lbl mono"><span>SE Tax</span><span>$1,740</span></div><div class="sc-prog-bar"><div class="sc-prog-fill" style="width:36%"></div></div></div>
        <div class="sc-li"><span>Set aside</span><span class="sc-li-v g">$3,200</span></div>
        <div class="sc-li"><span>Gap</span><span class="sc-li-v" style="color:#C9963A">$1,640</span></div>
      </div>
    </div>
  </div>
</section>

<section class="editorial">
  <div>
    <div class="ed-label mono">Design Rationale</div>
    <blockquote class="ed-quote serif">"Your finances deserve the same care as your portfolio."</blockquote>
    <div class="ed-attr">Inspired by midday.ai's editorial serif typography and Truecolor Films' chartreuse-on-cream palette</div>
  </div>
  <div class="ed-palette">
    <div class="swatch-row"><div class="swatch" style="background:#F7F4EF;border-color:#d9d5cf"></div><div><div class="sw-name">Warm Cream</div><div class="sw-hex mono">#F7F4EF</div></div></div>
    <div class="swatch-row"><div class="swatch" style="background:#1A1714"></div><div><div class="sw-name">Warm Black</div><div class="sw-hex mono">#1A1714</div></div></div>
    <div class="swatch-row"><div class="swatch" style="background:#B8FF00"></div><div><div class="sw-name">Chartreuse</div><div class="sw-hex mono">#B8FF00</div></div></div>
    <div class="swatch-row"><div class="swatch" style="background:#4A3728"></div><div><div class="sw-name">Espresso</div><div class="sw-hex mono">#4A3728</div></div></div>
    <div class="swatch-row"><div class="swatch" style="background:#8BA888"></div><div><div class="sw-name">Sage</div><div class="sw-hex mono">#8BA888</div></div></div>
    <div class="swatch-row"><div class="swatch" style="background:#E8614A"></div><div><div class="sw-name">Coral</div><div class="sw-hex mono">#E8614A</div></div></div>
  </div>
</section>

<section class="pricing" id="pricing">
  <div class="pricing-inner">
    <div class="sec-label mono">Pricing</div>
    <h2 class="sec-title serif">Simple,<br><em>transparent</em> pricing.</h2>
    <div class="pricing-grid">
      <div class="plan">
        <div class="plan-name serif">Solo</div>
        <div class="plan-price serif">$0<span>/mo</span></div>
        <div class="plan-period mono">Forever free · one user</div>
        <ul class="plan-features">
          <li class="plan-feature">Income overview</li>
          <li class="plan-feature">3 active invoices</li>
          <li class="plan-feature">Basic expense log</li>
          <li class="plan-feature muted">Time tracker</li>
          <li class="plan-feature muted">Tax planner</li>
        </ul>
        <a href="#" class="plan-cta dark">Get Started</a>
      </div>
      <div class="plan featured">
        <div class="plan-name serif">Studio</div>
        <div class="plan-price serif">$12<span>/mo</span></div>
        <div class="plan-period mono">Billed annually · everything</div>
        <ul class="plan-features">
          <li class="plan-feature">Everything in Solo</li>
          <li class="plan-feature">Unlimited invoices</li>
          <li class="plan-feature">Time tracker + billing</li>
          <li class="plan-feature">Tax planner + estimates</li>
          <li class="plan-feature">AI expense insights</li>
        </ul>
        <a href="#" class="plan-cta lime">Start 14-day Trial</a>
      </div>
      <div class="plan">
        <div class="plan-name serif">Agency</div>
        <div class="plan-price serif">$48<span>/mo</span></div>
        <div class="plan-period mono">Up to 10 team members</div>
        <ul class="plan-features">
          <li class="plan-feature">Everything in Studio</li>
          <li class="plan-feature">Team time tracking</li>
          <li class="plan-feature">Shared client workspace</li>
          <li class="plan-feature">Priority support</li>
        </ul>
        <a href="#" class="plan-cta dark">Contact Sales</a>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div>
        <div class="footer-brand serif">FOLIO</div>
        <div class="footer-tagline">The financial dashboard for people who make things.</div>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Product</h4>
          <a href="#">Overview</a><a href="#">Invoices</a><a href="#">Time</a><a href="#">Tax</a>
        </div>
        <div class="footer-col">
          <h4>Design</h4>
          <a href="https://ram.zenbin.org/folio-viewer">Prototype</a>
          <a href="https://ram.zenbin.org/folio-mock">Mock ☀◑</a>
          <a href="https://ram.zenbin.org">RAM Studio</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-copy mono">© 2026 FOLIO · <span class="footer-accent">RAM</span> Design Heartbeat</div>
      <div class="footer-link-row"><a href="https://ram.zenbin.org/folio-viewer">Prototype →</a><a href="https://ram.zenbin.org/folio-mock">Mock ☀◑</a></div>
    </div>
  </div>
</footer>
</body>
</html>`;

// ── VIEWER HTML ────────────────────────────────────────────────────────────
const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>FOLIO — Prototype Viewer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#F7F4EF;--surface:#FFFFFF;--text:#1A1714;--muted:rgba(26,23,20,0.42);--faint:rgba(26,23,20,0.07);--accent:#B8FF00;--accent2:#4A3728;--border:rgba(26,23,20,0.09);--sage:#8BA888;--coral:#E8614A;--gold:#C9963A}
    body{background:#1A1714;font-family:'Inter',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
    .viewer-wrap{width:100%;max-width:400px;background:var(--bg);border-radius:24px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.5);display:flex;flex-direction:column;min-height:700px}
    .vheader{background:var(--surface);border-bottom:1px solid var(--border);padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
    .vbrand{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--text)}
    .vissue{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted)}
    .vcontent{flex:1;overflow:auto;padding:20px}
    .vnav{background:var(--surface);border-top:1px solid var(--border);display:flex;justify-content:space-around;padding:8px 0}
    .vni{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 10px;cursor:pointer;border-radius:8px;user-select:none}
    .vni.active{background:rgba(26,23,20,0.06)}
    .vni-icon{font-size:14px}
    .vni-lbl{font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--muted)}
    .vni.active .vni-lbl{color:var(--text)}
    .panel{display:none}.panel.active{display:block}
    .big{margin-bottom:14px}
    .big .lbl{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px}
    .big .val{font-family:'Playfair Display',serif;font-size:40px;font-weight:700;letter-spacing:-0.02em;line-height:1;color:var(--text)}
    .big .sub{font-size:11px;color:var(--muted);margin-top:6px;display:flex;align-items:center;gap:6px}
    .bdg{background:var(--accent);color:var(--text);font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;font-family:'JetBrains Mono',monospace}
    .mrow{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
    .met{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px 9px}
    .met-l{font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--muted);margin-bottom:3px}
    .met-v{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--text)}
    .met-v.r{color:var(--coral)}.met-v.g{color:var(--gold)}
    .bars{margin:12px 0}
    .bars-lbl{font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px}
    .brow{display:flex;align-items:flex-end;gap:5px;height:72px}
    .bc{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;height:100%;justify-content:flex-end}
    .bf{width:100%;border-radius:3px 3px 0 0;background:var(--faint)}.bf.hi{background:var(--accent)}
    .bl{font-size:8px;font-family:'JetBrains Mono',monospace;color:var(--muted)}
    .lsec{margin:12px 0}
    .lsec-lbl{font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;border-bottom:1px solid var(--border);padding-bottom:5px;margin-bottom:6px}
    .lr{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)}
    .lr:last-child{border:none}
    .lr-t{font-size:12px;font-weight:500;color:var(--text)}
    .lr-s{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace;margin-top:1px}
    .lr-v{font-size:12px;font-weight:600;font-family:'JetBrains Mono',monospace;color:var(--text)}
    .lr-v.inc{color:var(--sage)}.lr-v.exp{color:var(--coral)}.lr-v.pnd{color:var(--gold)}
    .prow{margin-bottom:9px}
    .prow-head{display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px}
    .prow-pct{font-family:'JetBrains Mono',monospace;color:var(--muted)}
    .ptrack{height:4px;background:var(--faint);border-radius:2px}
    .pfill{height:100%;background:var(--accent);border-radius:2px}
    .ist{display:inline-block;font-size:9px;font-family:'JetBrains Mono',monospace;padding:2px 6px;border-radius:3px}
    .ist.open{background:rgba(201,150,58,.15);color:var(--gold)}
    .ist.paid{background:rgba(139,168,136,.2);color:var(--sage)}
    .ist.over{background:rgba(232,97,74,.15);color:var(--coral)}
    .ck{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)}
    .ck:last-child{border:none}
    .ckb{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .ckb.done{background:var(--accent);border-color:var(--accent)}
    .ckb.done::after{content:'✓';font-size:9px;font-weight:700}
    .ckt{font-size:12px;color:var(--text)}.ckt.done{color:var(--muted);text-decoration:line-through}
    .ptitle{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;margin-bottom:3px;color:var(--text)}
    .pref{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);margin-bottom:14px}
    .ic{background:rgba(26,23,20,0.04);border:1px solid var(--border);border-radius:10px;padding:13px;margin-top:14px}
    .ic-lbl{font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--accent2);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:5px}
    .ic-txt{font-size:12px;line-height:1.5;color:var(--text)}
  </style>
  <script>
  // EMBEDDED_PEN will be injected here
  </script>
</head>
<body>
<div class="viewer-wrap">
  <div class="vheader">
    <div class="vbrand">FOLIO</div>
    <div class="vissue mono">Issue N°04 · Apr 2026</div>
  </div>
  <div class="vcontent">

    <div id="p-overview" class="panel active">
      <div class="big"><div class="lbl">Net Income · April 2026</div><div class="val">$14,820</div><div class="sub">up from $12,540 <span class="bdg">+18%</span></div></div>
      <div class="mrow">
        <div class="met"><div class="met-l">Invoiced</div><div class="met-v">$18,500</div></div>
        <div class="met"><div class="met-l">Expenses</div><div class="met-v r">$3,680</div></div>
        <div class="met"><div class="met-l">Pending</div><div class="met-v g">$4,200</div></div>
      </div>
      <div class="bars">
        <div class="bars-lbl">Revenue · Last 6 Months</div>
        <div class="brow">
          <div class="bc"><div class="bf" style="height:60%"></div><div class="bl">Nov</div></div>
          <div class="bc"><div class="bf" style="height:55%"></div><div class="bl">Dec</div></div>
          <div class="bc"><div class="bf" style="height:75%"></div><div class="bl">Jan</div></div>
          <div class="bc"><div class="bf" style="height:80%"></div><div class="bl">Feb</div></div>
          <div class="bc"><div class="bf" style="height:88%"></div><div class="bl">Mar</div></div>
          <div class="bc"><div class="bf hi" style="height:100%"></div><div class="bl">Apr</div></div>
        </div>
      </div>
      <div class="lsec">
        <div class="lsec-lbl">Recent Activity</div>
        <div class="lr"><div><div class="lr-t">Stripe · Acme Corp</div><div class="lr-s">Apr 3, 2026</div></div><div class="lr-v inc">+$4,200</div></div>
        <div class="lr"><div><div class="lr-t">Adobe Creative Cloud</div><div class="lr-s">Apr 1, 2026</div></div><div class="lr-v exp">–$54.99</div></div>
        <div class="lr"><div><div class="lr-t">INV-031 · Paid</div><div class="lr-s">Mar 30, 2026</div></div><div class="lr-v inc">+$6,800</div></div>
        <div class="lr"><div><div class="lr-t">Figma Pro</div><div class="lr-s">Mar 28, 2026</div></div><div class="lr-v exp">–$45.00</div></div>
      </div>
    </div>

    <div id="p-income" class="panel">
      <div class="ptitle">Income</div><div class="pref mono">Ref. INC-042026 · 4 clients</div>
      <div class="big"><div class="lbl">Invoiced This Month</div><div class="val">$18,500</div></div>
      <div class="lsec">
        <div class="lsec-lbl">Clients</div>
        <div class="lr"><div><div class="lr-t">Acme Corp</div><div class="lr-s">Branding + Web · Paid</div></div><div class="lr-v inc">$8,200</div></div>
        <div class="lr"><div><div class="lr-t">Northlight Films</div><div class="lr-s">Motion Direction · Partial</div></div><div class="lr-v pnd">$5,800</div></div>
        <div class="lr"><div><div class="lr-t">Studio Kite</div><div class="lr-s">UI Design · Pending</div></div><div class="lr-v">$3,200</div></div>
        <div class="lr"><div><div class="lr-t">Fernwood Co.</div><div class="lr-s">Art Direction · Draft</div></div><div class="lr-v">$1,300</div></div>
      </div>
      <div class="lsec">
        <div class="lsec-lbl">By Category</div>
        <div class="prow"><div class="prow-head"><span>Design</span><span class="prow-pct">52%</span></div><div class="ptrack"><div class="pfill" style="width:52%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Direction</span><span class="prow-pct">31%</span></div><div class="ptrack"><div class="pfill" style="width:31%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Strategy</span><span class="prow-pct">17%</span></div><div class="ptrack"><div class="pfill" style="width:17%"></div></div></div>
      </div>
    </div>

    <div id="p-invoices" class="panel">
      <div class="ptitle">Invoices</div><div class="pref mono">Q2 2026 · 12 total</div>
      <div class="mrow">
        <div class="met"><div class="met-l">Open</div><div class="met-v g">3</div></div>
        <div class="met"><div class="met-l">Overdue</div><div class="met-v r">1</div></div>
        <div class="met"><div class="met-l">Paid</div><div class="met-v" style="color:var(--sage)">8</div></div>
      </div>
      <div class="lsec">
        <div class="lsec-lbl">All Invoices</div>
        <div class="lr"><div><div class="lr-t">INV-034 · Acme</div><div class="lr-s">Due Apr 15</div></div><div style="text-align:right"><div class="lr-v">$4,200</div><span class="ist open">Open</span></div></div>
        <div class="lr"><div><div class="lr-t">INV-033 · Northlight</div><div class="lr-s">Due Apr 10</div></div><div style="text-align:right"><div class="lr-v">$3,800</div><span class="ist open">Open</span></div></div>
        <div class="lr"><div><div class="lr-t">INV-032 · Fernwood</div><div class="lr-s">Due Mar 31 · –4d</div></div><div style="text-align:right"><div class="lr-v">$1,800</div><span class="ist over">Overdue</span></div></div>
        <div class="lr"><div><div class="lr-t">INV-031 · Northlight</div><div class="lr-s">Paid Mar 30</div></div><div style="text-align:right"><div class="lr-v">$2,000</div><span class="ist paid">Paid</span></div></div>
        <div class="lr"><div><div class="lr-t">INV-030 · Studio Kite</div><div class="lr-s">Paid Mar 25</div></div><div style="text-align:right"><div class="lr-v">$3,200</div><span class="ist paid">Paid</span></div></div>
      </div>
    </div>

    <div id="p-expenses" class="panel">
      <div class="ptitle">Expenses</div><div class="pref mono">Ref. EXP-042026 · $3,680</div>
      <div class="lsec">
        <div class="lsec-lbl">By Category</div>
        <div class="prow"><div class="prow-head"><span>Software & Tools</span><span class="prow-pct">$342</span></div><div class="ptrack"><div class="pfill" style="width:78%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Equipment</span><span class="prow-pct">$1,200</span></div><div class="ptrack"><div class="pfill" style="width:45%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Workspace</span><span class="prow-pct">$880</span></div><div class="ptrack"><div class="pfill" style="width:60%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Marketing</span><span class="prow-pct">$450</span></div><div class="ptrack"><div class="pfill" style="width:30%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Travel</span><span class="prow-pct">$320</span></div><div class="ptrack"><div class="pfill" style="width:20%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Education</span><span class="prow-pct">$288</span></div><div class="ptrack"><div class="pfill" style="width:18%"></div></div></div>
      </div>
      <div class="ic"><div class="ic-lbl">AI Insight</div><div class="ic-txt">Software costs up 12% vs Q1 — consider annual billing for Figma and Notion to save ~$180/yr.</div></div>
    </div>

    <div id="p-time" class="panel">
      <div class="ptitle">Time</div><div class="pref mono">Week 14 · Apr 2026</div>
      <div class="mrow">
        <div class="met"><div class="met-l">Billable</div><div class="met-v">38.5h</div></div>
        <div class="met"><div class="met-l">Rate</div><div class="met-v" style="font-size:13px">$185/h</div></div>
        <div class="met"><div class="met-l">Earned</div><div class="met-v" style="font-size:13px">$7,122</div></div>
      </div>
      <div class="lsec">
        <div class="lsec-lbl">Daily Log</div>
        <div class="lr"><div><div class="lr-t">Monday · Acme Corp</div><div class="lr-s">$185/h</div></div><div class="lr-v">8.5h</div></div>
        <div class="lr"><div><div class="lr-t">Tuesday · Northlight</div><div class="lr-s">$165/h</div></div><div class="lr-v">7.0h</div></div>
        <div class="lr"><div><div class="lr-t">Wednesday · Acme</div><div class="lr-s">$185/h</div></div><div class="lr-v">9.0h</div></div>
        <div class="lr"><div><div class="lr-t">Thursday · Studio Kite</div><div class="lr-s">$155/h</div></div><div class="lr-v">7.5h</div></div>
        <div class="lr"><div><div class="lr-t">Friday · Fernwood</div><div class="lr-s">$150/h</div></div><div class="lr-v">6.5h</div></div>
      </div>
      <div class="lsec">
        <div class="lsec-lbl">Project Budgets</div>
        <div class="prow"><div class="prow-head"><span>Acme Rebrand</span><span class="prow-pct">54h/75h</span></div><div class="ptrack"><div class="pfill" style="width:72%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Northlight Motion</span><span class="prow-pct">24h/50h</span></div><div class="ptrack"><div class="pfill" style="width:48%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Studio Kite UI</span><span class="prow-pct">15h/48h</span></div><div class="ptrack"><div class="pfill" style="width:31%"></div></div></div>
      </div>
    </div>

    <div id="p-tax" class="panel">
      <div class="ptitle">Tax Planner</div><div class="pref mono">Q2 2026 · Due Jun 15</div>
      <div class="mrow">
        <div class="met"><div class="met-l">Q2 Est.</div><div class="met-v r">$4,840</div></div>
        <div class="met"><div class="met-l">Set Aside</div><div class="met-v" style="color:var(--sage)">$3,200</div></div>
        <div class="met"><div class="met-l">Gap</div><div class="met-v g">$1,640</div></div>
      </div>
      <div class="lsec">
        <div class="lsec-lbl">Q2 Breakdown</div>
        <div class="prow"><div class="prow-head"><span>Federal Income Tax</span><span class="prow-pct">$2,480</span></div><div class="ptrack"><div class="pfill" style="width:51%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>Self-Employment Tax</span><span class="prow-pct">$1,740</span></div><div class="ptrack"><div class="pfill" style="width:36%"></div></div></div>
        <div class="prow"><div class="prow-head"><span>State Income Tax</span><span class="prow-pct">$620</span></div><div class="ptrack"><div class="pfill" style="width:13%"></div></div></div>
      </div>
      <div class="lsec">
        <div class="lsec-lbl">Q2 Checklist</div>
        <div class="ck"><div class="ckb done"></div><div class="ckt done">Set aside 28% of April income</div></div>
        <div class="ck"><div class="ckb done"></div><div class="ckt done">Log equipment purchase deduction</div></div>
        <div class="ck"><div class="ckb"></div><div class="ckt">Transfer $1,640 to tax reserve</div></div>
        <div class="ck"><div class="ckb"></div><div class="ckt">Make Q2 estimated payment · Jun 15</div></div>
      </div>
    </div>

  </div>
  <div class="vnav" id="vnav">
    <div class="vni active" data-p="overview"><div class="vni-icon">⊞</div><div class="vni-lbl">Overview</div></div>
    <div class="vni" data-p="income"><div class="vni-icon">📈</div><div class="vni-lbl">Income</div></div>
    <div class="vni" data-p="invoices"><div class="vni-icon">🧾</div><div class="vni-lbl">Invoices</div></div>
    <div class="vni" data-p="expenses"><div class="vni-icon">📉</div><div class="vni-lbl">Expenses</div></div>
    <div class="vni" data-p="time"><div class="vni-icon">⏱</div><div class="vni-lbl">Time</div></div>
    <div class="vni" data-p="tax"><div class="vni-icon">🗓</div><div class="vni-lbl">Tax</div></div>
  </div>
</div>
<script>
  document.querySelectorAll('.vni').forEach(function(el){
    el.addEventListener('click', function(){
      document.querySelectorAll('.vni').forEach(function(i){i.classList.remove('active');});
      document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active');});
      el.classList.add('active');
      var pan = document.getElementById('p-' + el.dataset.p);
      if(pan) pan.classList.add('active');
    });
  });
</script>
</body>
</html>`;

fs.writeFileSync('/workspace/group/design-studio/folio-hero.html', heroHtml);
fs.writeFileSync('/workspace/group/design-studio/folio-viewer.html', viewerHtml);
console.log('Built folio-hero.html:', heroHtml.length, 'bytes');
console.log('Built folio-viewer.html:', viewerHtml.length, 'bytes');
