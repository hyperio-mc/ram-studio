'use strict';
// aurea-publish.js — Full Design Discovery pipeline for AUREA
// AUREA — Personal Wealth Intelligence, Editorial Clarity
// Theme: LIGHT · Slug: aurea

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'aurea';
const APP_NAME  = 'Aurea';
const TAGLINE   = 'Wealth, in plain sight';
const ARCHETYPE = 'finance-editorial';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Personal wealth intelligence dashboard — LIGHT editorial theme. Inspired by ISA De Burgh (minimal.gallery) editorial stacked typography on off-white, Old Tom Capital institutional prestige serif aesthetic, and Cardless financial platform (land-book.com). Warm newsprint cream #F4F0E6, brick red editorial accent, forest green gains, hairline dividers, uppercase spaced labels. "WSJ meets mobile fintech."';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'aurea.pen'), 'utf8');

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

// Light palette
const P = {
  bg:        '#F4F0E6',
  surface:   '#FEFCF8',
  surface2:  '#EDE9DE',
  text:      '#120E07',
  textMuted: 'rgba(18,14,7,0.40)',
  accent:    '#B8400E',
  accentDim: 'rgba(184,64,14,0.10)',
  green:     '#2D6B4E',
  greenDim:  'rgba(45,107,78,0.12)',
  gold:      '#A8822A',
  border:    'rgba(18,14,7,0.10)',
  borderMid: 'rgba(18,14,7,0.16)',
};

// ── a) Hero page ──────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aurea — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="Aurea is a personal wealth intelligence platform in an editorial newspaper aesthetic. Warm cream, brick red, forest green — portfolio tracking that reads like the WSJ.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;
  background:rgba(244,240,230,0.88);
  backdrop-filter:blur(20px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:800;color:${P.text};letter-spacing:0.5px}
.nav-logo span{color:${P.accent}}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;letter-spacing:0.3px;transition:color .2s}
.nav-links a:hover{color:${P.text}}
.nav-cta{
  background:${P.text};color:${P.bg};
  padding:9px 20px;border-radius:2px;
  font-size:12px;font-weight:700;text-decoration:none;
  letter-spacing:1px;text-transform:uppercase;
  transition:background .2s;
}
.nav-cta:hover{background:${P.accent}}

/* ── Hero ── */
.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:80px 24px 80px;
  position:relative;overflow:hidden;
}
.hero::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:${P.border};
}
.edition-badge{
  display:inline-flex;align-items:center;gap:8px;
  border:1px solid ${P.border};
  color:${P.textMuted};border-radius:2px;
  padding:5px 14px;font-size:10px;font-weight:600;
  letter-spacing:2px;margin-bottom:32px;text-transform:uppercase;
}
.edition-badge::before{content:'VOL. I';color:${P.accent};font-weight:800}
.hero-dateline{
  font-size:10px;letter-spacing:2px;text-transform:uppercase;
  color:${P.textMuted};margin-bottom:10px;font-weight:500;
}
h1{
  font-family:'Playfair Display',Georgia,serif;
  font-size:clamp(44px,8vw,96px);font-weight:800;
  line-height:1.0;letter-spacing:-2px;
  color:${P.text};margin-bottom:20px;max-width:960px;
}
h1 em{color:${P.accent};font-style:italic}
.hero-rule{
  width:60px;height:2px;background:${P.text};
  margin:0 auto 24px;
}
.hero-sub{
  font-size:clamp(14px,2vw,18px);color:${P.textMuted};
  max-width:480px;margin:0 auto 36px;line-height:1.7;
  font-weight:300;
}
.hero-btns{display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:60px}
.btn-primary{
  background:${P.text};color:${P.bg};
  padding:14px 32px;border-radius:2px;
  font-size:12px;font-weight:700;text-decoration:none;
  letter-spacing:1.5px;text-transform:uppercase;
  transition:background .2s,transform .2s;
}
.btn-primary:hover{background:${P.accent};transform:translateY(-1px)}
.btn-ghost{
  color:${P.text};padding:14px 28px;
  font-size:12px;font-weight:500;text-decoration:none;
  letter-spacing:0.5px;border-bottom:1px solid ${P.text};
  transition:color .2s,border-color .2s;
}
.btn-ghost:hover{color:${P.accent};border-color:${P.accent}}

/* ── Stats masthead ── */
.masthead{
  display:flex;gap:0;justify-content:center;
  border-top:2px solid ${P.text};border-bottom:1px solid ${P.border};
  max-width:800px;margin:0 auto 60px;width:100%;
}
.masthead-stat{
  flex:1;padding:20px 24px;text-align:center;
  border-right:1px solid ${P.border};
}
.masthead-stat:last-child{border-right:none}
.masthead-num{
  font-family:'Playfair Display',Georgia,serif;
  font-size:28px;font-weight:800;color:${P.text};line-height:1;
}
.masthead-label{
  font-size:9px;letter-spacing:1.5px;text-transform:uppercase;
  color:${P.textMuted};margin-top:6px;font-weight:600;
}

/* ── Screen feature ── */
.screens-section{
  padding:80px 24px;background:${P.surface};
  border-top:1px solid ${P.border};border-bottom:1px solid ${P.border};
}
.screens-section h2{
  font-family:'Playfair Display',Georgia,serif;
  font-size:clamp(28px,4vw,44px);font-weight:800;
  text-align:center;margin-bottom:8px;line-height:1.1;
}
.screens-kicker{
  text-align:center;font-size:10px;letter-spacing:2px;
  text-transform:uppercase;color:${P.textMuted};font-weight:600;
  margin-bottom:48px;
}

/* Five screens displayed horizontally with scroll */
.screens-scroll{
  display:flex;gap:20px;overflow-x:auto;
  max-width:1200px;margin:0 auto;padding-bottom:20px;
  -webkit-overflow-scrolling:touch;scrollbar-width:thin;
}
.screen-frame{
  flex-shrink:0;
  width:180px;background:${P.surface2};
  border-radius:20px;overflow:hidden;
  box-shadow:0 4px 24px rgba(18,14,7,0.12),0 1px 4px rgba(18,14,7,0.08);
  border:1px solid ${P.border};
  aspect-ratio:9/19.4;
  display:flex;align-items:center;justify-content:center;
  transition:transform .3s,box-shadow .3s;
}
.screen-frame:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 8px 40px rgba(18,14,7,0.16)}
.screen-inner{
  width:100%;height:100%;background:${P.bg};
  display:flex;flex-direction:column;padding:12px 10px 8px;
}
.sf-status{display:flex;justify-content:space-between;margin-bottom:8px}
.sf-time{font-size:7px;font-weight:700;color:${P.text}}
.sf-icons{font-size:6px;color:${P.textMuted}}
.sf-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:800;color:${P.text};margin-bottom:2px;letter-spacing:-0.3px}
.sf-sub{font-size:5px;color:${P.textMuted};letter-spacing:0.3px;text-transform:uppercase;margin-bottom:8px}
.sf-divider{height:0.5px;background:${P.border};margin-bottom:6px}
.sf-metric-big{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:${P.text};line-height:1;margin-bottom:2px}
.sf-chip{display:inline-flex;align-items:center;font-size:5px;font-weight:700;color:${P.green};background:${P.greenDim};padding:2px 5px;border-radius:2px;margin-bottom:6px}
.sf-row{display:flex;gap:0;border-top:0.5px solid ${P.border};border-bottom:0.5px solid ${P.border};margin-bottom:6px}
.sf-row-item{flex:1;padding:4px 3px;text-align:center;border-right:0.5px solid ${P.border}}
.sf-row-item:last-child{border-right:none}
.sf-ri-val{font-size:7px;font-weight:800;color:${P.text}}
.sf-ri-lbl{font-size:4px;color:${P.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-top:1px}
.sf-label{font-size:4.5px;letter-spacing:1px;text-transform:uppercase;color:${P.textMuted};font-weight:700;margin-bottom:4px}
.sf-list-item{display:flex;align-items:flex-start;gap:4px;margin-bottom:4px}
.sf-dot{width:8px;height:8px;border-radius:50%;margin-top:0.5px;flex-shrink:0}
.sf-li-name{font-size:5.5px;font-weight:700;color:${P.text};flex:1}
.sf-li-badge{font-size:5px;font-weight:700;color:${P.green}}
.sf-bar-row{margin-bottom:3px}
.sf-bar-lbl{font-size:4.5px;color:${P.textMuted};margin-bottom:1px}
.sf-bar-track{height:2px;background:${P.surface2};border-radius:1px}
.sf-bar-fill{height:2px;border-radius:1px;background:${P.accent}}

/* ── Editorial features ── */
.features{
  max-width:1100px;margin:0 auto;padding:80px 24px;
}
.features-kicker{
  font-size:10px;letter-spacing:2px;text-transform:uppercase;
  color:${P.textMuted};font-weight:600;margin-bottom:12px;
}
.features-head{
  font-family:'Playfair Display',Georgia,serif;
  font-size:clamp(28px,3.5vw,42px);font-weight:800;
  margin-bottom:48px;max-width:600px;line-height:1.1;
}
.features-head span{color:${P.accent}}
.features-grid{
  display:grid;grid-template-columns:1fr 1fr 1fr;
  gap:0;border-top:2px solid ${P.text};
}
@media(max-width:700px){.features-grid{grid-template-columns:1fr}}
.feature{
  padding:32px 28px;border-right:1px solid ${P.border};
  border-bottom:1px solid ${P.border};
}
.feature:nth-child(3n){border-right:none}
.feature-num{
  font-family:'Playfair Display',serif;
  font-size:36px;font-weight:800;color:${P.accent};
  opacity:0.3;line-height:1;margin-bottom:12px;
}
.feature h3{font-size:15px;font-weight:700;margin-bottom:8px;color:${P.text}}
.feature p{font-size:13px;color:${P.textMuted};line-height:1.7;font-weight:300}

/* ── Masthead footer ── */
.footer-masthead{
  border-top:3px double ${P.borderMid};
  border-bottom:1px solid ${P.border};
  padding:24px 40px;text-align:center;
  max-width:1200px;margin:0 auto;
}
.footer-name{
  font-family:'Playfair Display',serif;
  font-size:11px;letter-spacing:4px;text-transform:uppercase;
  color:${P.textMuted};
}
footer{
  padding:24px 40px;text-align:center;
  font-size:11px;color:${P.textMuted};
}
footer a{color:${P.accent};text-decoration:none;font-weight:600}
footer a:hover{text-decoration:underline}

/* ── CTA strip ── */
.cta-strip{
  background:${P.text};color:${P.bg};
  padding:60px 24px;text-align:center;
}
.cta-strip h2{
  font-family:'Playfair Display',serif;
  font-size:clamp(28px,4vw,48px);font-weight:800;margin-bottom:12px;
}
.cta-strip p{font-size:15px;opacity:0.65;margin-bottom:28px;font-weight:300}
.cta-strip a{
  background:${P.accent};color:#fff;
  padding:14px 36px;border-radius:2px;
  font-size:12px;font-weight:700;text-decoration:none;
  letter-spacing:1.5px;text-transform:uppercase;
  transition:opacity .2s;display:inline-block;
}
.cta-strip a:hover{opacity:0.85}

@media(max-width:768px){
  nav{padding:0 20px}
  .nav-links{display:none}
  .masthead{flex-wrap:wrap}
  .masthead-stat{min-width:45%}
}
</style>
</head>
<body>
<nav>
  <div class="nav-logo">AUREA<span>.</span></div>
  <div class="nav-links">
    <a href="#">Overview</a>
    <a href="#">Portfolio</a>
    <a href="#">Insights</a>
    <a href="#screens">Preview</a>
  </div>
  <a href="https://ram.zenbin.org/aurea-viewer" class="nav-cta">Open in Pencil</a>
</nav>

<section class="hero">
  <div class="edition-badge">&nbsp;RAM Design Studio — Issue No. 28&nbsp;</div>
  <div class="hero-dateline">March 2026 · Personal Finance · Editorial UI</div>
  <h1>Your wealth,<br><em>beautifully</em> reported</h1>
  <div class="hero-rule"></div>
  <p class="hero-sub">Aurea brings newspaper-grade clarity to personal finance. Track your portfolio like a financial journalist reads the market.</p>
  <div class="hero-btns">
    <a href="https://ram.zenbin.org/aurea-viewer" class="btn-primary">Open Design ↗</a>
    <a href="https://ram.zenbin.org/aurea-mock" class="btn-ghost">Interactive Mock</a>
  </div>

  <div class="masthead">
    <div class="masthead-stat">
      <div class="masthead-num">5</div>
      <div class="masthead-label">Screens</div>
    </div>
    <div class="masthead-stat">
      <div class="masthead-num">Light</div>
      <div class="masthead-label">Theme</div>
    </div>
    <div class="masthead-stat">
      <div class="masthead-num">74<span style="font-size:14px">kb</span></div>
      <div class="masthead-label">Pen File</div>
    </div>
    <div class="masthead-stat">
      <div class="masthead-num">2.8</div>
      <div class="masthead-label">Format</div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-kicker">Five Screens · Editorial Light Theme</div>
  <h2>The full design system</h2>
  <div class="screens-scroll">
    <!-- Screen 1: Overview -->
    <div class="screen-frame">
      <div class="screen-inner">
        <div class="sf-status"><span class="sf-time">9:41</span><span class="sf-icons">▶ ⣿</span></div>
        <div class="sf-title">AUREA</div>
        <div class="sf-sub">Total Net Worth</div>
        <div class="sf-divider"></div>
        <div class="sf-metric-big">$284,710</div>
        <div class="sf-chip">▲ +$1,204 · +0.43% today</div>
        <div class="sf-row">
          <div class="sf-row-item"><div class="sf-ri-val">$198K</div><div class="sf-ri-lbl">Invest.</div></div>
          <div class="sf-row-item"><div class="sf-ri-val">$54K</div><div class="sf-ri-lbl">Cash</div></div>
          <div class="sf-row-item"><div class="sf-ri-val">$32K</div><div class="sf-ri-lbl">RE</div></div>
        </div>
        <div class="sf-label">Top Holdings</div>
        ${['AAPL +1.2%','BTC +3.4%','VOO +0.6%','AMZN -0.8%'].map(h => `
        <div class="sf-list-item">
          <div class="sf-dot" style="background:${h.includes('-') ? P.accent : P.green}20;border:1px solid ${h.includes('-') ? P.accent : P.green}"></div>
          <span class="sf-li-name">${h.split(' ')[0]}</span>
          <span class="sf-li-badge" style="color:${h.includes('-') ? P.accent : P.green}">${h.split(' ')[1]}</span>
        </div>`).join('')}
      </div>
    </div>
    <!-- Screen 2: Portfolio -->
    <div class="screen-frame">
      <div class="screen-inner">
        <div class="sf-status"><span class="sf-time">9:41</span><span class="sf-icons">▶ ⣿</span></div>
        <div class="sf-title">Portfolio</div>
        <div class="sf-sub">12 Positions</div>
        <div class="sf-divider"></div>
        <div class="sf-label">Holdings</div>
        ${[['AAPL','$56,230','+18.4%',true],['BTC','$51,180','+84.2%',true],['VOO','$42,810','+24.1%',true],['AMZN','$31,350','+9.3%',false],['MSFT','$28,480','+22.7%',true]].map(([t,v,c,p]) => `
        <div class="sf-list-item" style="margin-bottom:5px;padding-bottom:3px;border-bottom:0.5px solid ${P.border}">
          <div class="sf-dot" style="background:${p ? P.greenDim : P.accentDim};border:1px solid ${p ? P.green : P.accent}"></div>
          <div style="flex:1"><span class="sf-li-name" style="font-size:6px">${t}</span><br><span style="font-size:4px;color:${P.textMuted}">${v}</span></div>
          <span class="sf-li-badge" style="color:${p ? P.green : P.accent}">${c}</span>
        </div>`).join('')}
        <div class="sf-label" style="margin-top:4px">Allocation</div>
        ${[['Stocks',43],['Cash',19],['Crypto',18]].map(([l,p]) => `
        <div class="sf-bar-row">
          <div class="sf-bar-lbl">${l} ${p}%</div>
          <div class="sf-bar-track"><div class="sf-bar-fill" style="width:${p}%;background:${l==='Cash'?P.gold:l==='Crypto'?P.accent:P.green}"></div></div>
        </div>`).join('')}
      </div>
    </div>
    <!-- Screen 3: Activity -->
    <div class="screen-frame">
      <div class="screen-inner">
        <div class="sf-status"><span class="sf-time">9:41</span><span class="sf-icons">▶ ⣿</span></div>
        <div class="sf-title">Activity</div>
        <div class="sf-sub">Recent Transactions</div>
        <div class="sf-divider"></div>
        <div style="background:${P.surface2};padding:3px 6px;border-radius:2px;margin-bottom:5px"><span style="font-size:5px;font-weight:700;color:${P.textMuted};letter-spacing:0.5px">MARCH 2026</span></div>
        ${[['BUY','AAPL','25 sh. @ $224','-$5,622',false],['DIVD','VOO','Dividend','+$84',true],['SELL','AMZN','5 sh. @ $192','+$962',true],['BUY','BTC','0.12 BTC','-$10,464',false]].map(([type,tick,desc,amt,pos]) => `
        <div style="background:${P.surface};border-radius:2px;padding:4px 5px;margin-bottom:3px;border-left:2px solid ${pos ? P.green : P.accent}">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:5px;font-weight:800;color:${P.text}">${tick}</span>
            <span style="font-size:5.5px;font-weight:700;color:${pos ? P.green : P.accent}">${amt}</span>
          </div>
          <div style="font-size:4px;color:${P.textMuted}">${desc}</div>
        </div>`).join('')}
      </div>
    </div>
    <!-- Screen 4: Insights -->
    <div class="screen-frame">
      <div class="screen-inner">
        <div class="sf-status"><span class="sf-time">9:41</span><span class="sf-icons">▶ ⣿</span></div>
        <div class="sf-title">Insights</div>
        <div class="sf-sub">Portfolio Intelligence</div>
        <div class="sf-divider"></div>
        <div class="sf-metric-big" style="font-size:20px;color:${P.green}">+14.2%</div>
        <div style="font-size:5px;color:${P.textMuted};margin-bottom:6px">YTD · vs. S&P +8.4%</div>
        <div class="sf-row">
          <div class="sf-row-item"><div class="sf-ri-val">+28.6%</div><div class="sf-ri-lbl">1-Year</div></div>
          <div class="sf-row-item"><div class="sf-ri-val">1.82</div><div class="sf-ri-lbl">Sharpe</div></div>
          <div class="sf-row-item"><div class="sf-ri-val">12.4%</div><div class="sf-ri-lbl">Vol.</div></div>
        </div>
        <div class="sf-label">Allocation</div>
        ${[['Stocks',43,P.green],['Cash',19,P.gold],['Crypto',18,P.accent],['ETFs',15,P.green],['RE',5,P.textMuted]].map(([l,p,c]) => `
        <div class="sf-bar-row">
          <div class="sf-bar-lbl">${l}</div>
          <div class="sf-bar-track"><div class="sf-bar-fill" style="width:${p}%;background:${c}"></div></div>
        </div>`).join('')}
        <div style="background:${P.accentDim};border-left:2px solid ${P.accent};padding:4px 5px;margin-top:4px;border-radius:0 2px 2px 0">
          <div style="font-size:4.5px;font-weight:700;color:${P.accent};margin-bottom:2px">MARKET INSIGHT</div>
          <div style="font-size:4px;color:${P.text};line-height:1.4">Crypto at 18% — near your 20% rebalance threshold.</div>
        </div>
      </div>
    </div>
    <!-- Screen 5: Goals -->
    <div class="screen-frame">
      <div class="screen-inner">
        <div class="sf-status"><span class="sf-time">9:41</span><span class="sf-icons">▶ ⣿</span></div>
        <div class="sf-title">Goals</div>
        <div class="sf-sub">4 Active Goals</div>
        <div class="sf-divider"></div>
        ${[[P.green,'House','$38,400','$60,000',64,'On track'],[P.accent,'Japan','$6,200','$8,000',78,'Ahead'],[P.gold,'Emergency','$12,500','$25,000',50,'Building'],[P.textMuted,'Roth IRA','$84,710','$200,000',42,'Long-term']].map(([c,n,s,t,p,st]) => `
        <div style="background:${P.surface};border-radius:3px;padding:5px 6px;margin-bottom:4px;border-top:1.5px solid ${c}">
          <div style="display:flex;justify-content:space-between;margin-bottom:2px">
            <span style="font-size:5.5px;font-weight:700;color:${P.text}">${n}</span>
            <span style="font-size:5px;font-weight:700;color:${c}">${p}%</span>
          </div>
          <div style="font-size:4px;color:${P.textMuted};margin-bottom:3px">${s} of ${t}</div>
          <div class="sf-bar-track"><div class="sf-bar-fill" style="width:${p}%;background:${c}"></div></div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="features">
  <div class="features-kicker">Design Decisions — Issue No. 28</div>
  <h2 class="features-head">Craft, <span>not</span> chrome</h2>
  <div class="features-grid">
    <div class="feature">
      <div class="feature-num">01</div>
      <h3>Newsprint Cream Foundation</h3>
      <p>Background is <strong>#F4F0E6</strong> — warm newsprint cream, not clinical white. Every digit feels printed, not displayed. Inspired by the off-white texture of ISA De Burgh's editorial portfolio.</p>
    </div>
    <div class="feature">
      <div class="feature-num">02</div>
      <h3>Brick Red × Forest Green</h3>
      <p>Instead of the generic red/green fintech palette, we use brick red <strong>#B8400E</strong> and forest green <strong>#2D6B4E</strong> — earthy, premium, editorial. The contrast is legible without being alarming.</p>
    </div>
    <div class="feature">
      <div class="feature-num">03</div>
      <h3>Hairline Dividers + Spaced Caps</h3>
      <p>Every section is separated by a 1px hairline at 10% opacity. Labels are 9px uppercase with 1.2px letter-spacing — like column headers in the Financial Times.</p>
    </div>
    <div class="feature">
      <div class="feature-num">04</div>
      <h3>Allocation Bars in Cards</h3>
      <p>Each portfolio holding card includes a 3px allocation bar at the bottom edge — showing portfolio weight at a glance without disrupting the editorial hierarchy.</p>
    </div>
    <div class="feature">
      <div class="feature-num">05</div>
      <h3>Pull Quote Insight Cards</h3>
      <p>AI insights are styled as editorial pull quotes — left accent bar, faint tinted background, bold kicker label. Information that feels curated, not generated.</p>
    </div>
    <div class="feature">
      <div class="feature-num">06</div>
      <h3>Goal Progress as Editorial Cards</h3>
      <p>Goals use top-edge color bars instead of icon blobs — a restrained, newspaper-column way to encode category. Progress bars are 6px, barely visible, intentionally quiet.</p>
    </div>
  </div>
</section>

<div class="cta-strip">
  <h2>Open in Pencil →</h2>
  <p>Explore all five screens in the Pencil.dev viewer</p>
  <a href="https://ram.zenbin.org/aurea-viewer">View Design</a>
</div>

<div style="max-width:1200px;margin:0 auto">
  <div class="footer-masthead">
    <div class="footer-name">Aurea — RAM Design Studio · March 2026</div>
  </div>
</div>
<footer>
  Designed by <a href="https://ram.zenbin.org">RAM</a> ·
  <a href="https://ram.zenbin.org/aurea-viewer">Pencil Viewer</a> ·
  <a href="https://ram.zenbin.org/aurea-mock">Interactive Mock ☀◑</a>
</footer>
</body>
</html>`;
}

// ── b) Viewer page ─────────────────────────────────────────────────────────────
function buildViewer() {
  // Fetch the viewer template from pencil.dev CDN approach
  // We'll use a self-hosted iframe approach that embeds the pen
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aurea — Design Viewer | RAM</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;background:#F4F0E6;font-family:system-ui,sans-serif}
.bar{height:48px;background:rgba(244,240,230,0.9);backdrop-filter:blur(12px);border-bottom:1px solid rgba(18,14,7,0.10);display:flex;align-items:center;padding:0 20px;gap:16px;position:fixed;top:0;left:0;right:0;z-index:10}
.bar-logo{font-size:15px;font-weight:800;letter-spacing:2px;color:#120E07}
.bar-sep{color:rgba(18,14,7,0.20)}
.bar-title{font-size:12px;color:rgba(18,14,7,0.55);font-weight:500}
.bar-links{margin-left:auto;display:flex;gap:12px}
.bar-links a{font-size:11px;color:#B8400E;text-decoration:none;font-weight:600;letter-spacing:0.5px}
iframe{position:fixed;top:48px;left:0;right:0;bottom:0;width:100%;height:calc(100% - 48px);border:none}
</style>
</head>
<body>
<div class="bar">
  <span class="bar-logo">AUREA</span>
  <span class="bar-sep">·</span>
  <span class="bar-title">Wealth, in plain sight</span>
  <div class="bar-links">
    <a href="https://ram.zenbin.org/aurea">Hero Page</a>
    <a href="https://ram.zenbin.org/aurea-mock">Mock ☀◑</a>
  </div>
</div>
<iframe src="https://pencil.dev/embed" id="pv"></iframe>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
document.getElementById('pv').addEventListener('load', function() {
  try { this.contentWindow.postMessage({ type: 'load-pen', pen: window.EMBEDDED_PEN }, '*'); } catch(e){}
});
</script>
</body>
</html>`;
  return viewerHtml;
}

async function run() {
  console.log('Publishing AUREA design pipeline...\n');

  // a) Hero
  console.log('a) Publishing hero page...');
  const heroRes = await zenPut(SLUG, `Aurea — ${TAGLINE} | RAM Design Studio`, buildHero());
  console.log('   Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 80));

  // b) Viewer
  console.log('b) Publishing viewer...');
  const viewRes = await zenPut(`${SLUG}-viewer`, `Aurea — Design Viewer`, buildViewer());
  console.log('   Viewer:', viewRes.status, viewRes.status === 200 ? '✓' : viewRes.body.slice(0, 80));

  // d) Gallery queue
  console.log('d) Updating gallery queue...');
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
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
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
  console.log('   Gallery queue:', putRes.status === 200 ? '✓ updated' : putRes.body.slice(0, 100));

  console.log('\n✓ Done. URLs:');
  console.log('  Hero:   https://ram.zenbin.org/aurea');
  console.log('  Viewer: https://ram.zenbin.org/aurea-viewer');
  console.log('  Mock:   https://ram.zenbin.org/aurea-mock');
}

run().catch(console.error);
