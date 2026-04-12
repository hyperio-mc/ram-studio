// LEDGER — Publish hero + viewer
const https = require('https');
const fs = require('fs');

const SLUG = 'ledger';
const APP_NAME = 'LEDGER';
const TAGLINE = 'Money that thinks for you';
const ARCHETYPE = 'fintech-ai-dashboard';
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN, REPO = config.GITHUB_REPO;

function zenPub(slug, html, title) {
  return new Promise((res, rej) => {
    const body = JSON.stringify({ html, title });
    const r = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Subdomain': 'ram', 'Content-Length': Buffer.byteLength(body) }
    }, resp => { let d = ''; resp.on('data', c => d += c); resp.on('end', () => res({ status: resp.statusCode, body: d })); });
    r.on('error', rej); r.write(body); r.end();
  });
}

function ghReq(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, resp => { let d = ''; resp.on('data', c => d += c); resp.on('end', () => res({ status: resp.statusCode, body: d })); });
    r.on('error', rej); if (body) r.write(body); r.end();
  });
}

// ─── Hero page ────────────────────────────────────────────────────────────────
const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>LEDGER — Money that thinks for you</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0B0D14;--surface:#13162C;--sb:#1A1E38;--sc:#20254A;
  --text:#E4E8FF;--mid:#8890B0;--muted:#4A5070;--line:#1F2440;
  --accent:#4AE3A0;--accent2:#7B6CF5;--red:#FF4D6D;--yellow:#FFB547;--blue:#4AB5E3;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',-apple-system,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}

/* NAV */
nav{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 2.5rem;border-bottom:1px solid var(--line);position:sticky;top:0;background:rgba(11,13,20,.85);backdrop-filter:blur(16px);z-index:50}
.logo{display:flex;align-items:center;gap:.6rem}
.logo-mark{width:28px;height:28px;background:linear-gradient(135deg,var(--accent),var(--accent2));border-radius:8px;display:grid;place-items:center;font-size:12px;font-weight:700;color:#0B0D14}
.logo-name{font-size:.92rem;font-weight:700;letter-spacing:.12em;color:var(--text)}
.nav-links{display:flex;gap:2rem;align-items:center}
.nav-links a{font-size:.8rem;color:var(--mid);text-decoration:none;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#0B0D14;padding:.45rem 1.2rem;border-radius:20px;font-size:.8rem;font-weight:700;text-decoration:none;letter-spacing:.02em}

/* HERO */
.hero{max-width:1120px;margin:0 auto;padding:5.5rem 2.5rem 4rem;display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center}
.hero-tag{display:inline-flex;align-items:center;gap:.5rem;font-size:.7rem;font-weight:700;letter-spacing:.14em;color:var(--accent2);text-transform:uppercase;margin-bottom:1rem;border:1px solid var(--accent2)33;padding:.3rem .8rem;border-radius:20px;background:var(--accent2)11}
.hero-tag span{color:var(--accent2)}
.hero h1{font-size:3.6rem;font-weight:700;line-height:1.08;letter-spacing:-.03em;margin-bottom:1.3rem}
.hero h1 em{font-style:italic;color:var(--accent)}
.hero-sub{font-size:1.05rem;font-weight:300;color:var(--mid);line-height:1.7;max-width:440px;margin-bottom:2.2rem}
.hero-actions{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:2.5rem}
.btn-p{background:var(--accent);color:#0B0D14;padding:.75rem 1.8rem;border-radius:26px;font-size:.9rem;font-weight:700;text-decoration:none;transition:opacity .2s}
.btn-p:hover{opacity:.85}
.btn-s{color:var(--mid);font-size:.85rem;text-decoration:none;border-bottom:1px solid var(--muted);padding-bottom:2px}
.hero-trust{display:flex;gap:1.2rem;align-items:center;flex-wrap:wrap}
.trust-chip{font-size:.75rem;color:var(--muted);display:flex;align-items:center;gap:.4rem}
.trust-chip::before{content:'✓';color:var(--accent);font-weight:700}

/* PHONE MOCKUP */
.phone-wrap{display:flex;justify-content:center;position:relative}
.phone-glow{position:absolute;width:300px;height:300px;background:radial-gradient(circle,var(--accent2)18 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.phone{width:272px;background:var(--bg);border-radius:36px;padding:16px;border:1px solid var(--line);box-shadow:0 30px 80px rgba(0,0,0,.5),0 0 0 1px var(--line);position:relative;z-index:1}

/* Phone inner UI */
.p-status{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:0 2px}
.p-time{font-size:8px;font-weight:600;color:var(--mid)}
.p-icons{font-size:7px;color:var(--mid);letter-spacing:2px}
.p-greet{font-size:8px;color:var(--mid);margin-bottom:2px}
.p-heading{font-size:17px;font-weight:700;color:var(--text);margin-bottom:10px;line-height:1.2}
.p-balance-card{background:var(--sc);border-radius:14px;padding:12px 14px;margin-bottom:8px}
.p-balance-label{font-size:7px;font-weight:700;letter-spacing:.1em;color:var(--mid);margin-bottom:4px}
.p-balance-amt{font-size:26px;font-weight:700;color:var(--text);margin-bottom:3px;line-height:1}
.p-balance-delta{font-size:8px;color:var(--accent);font-weight:500}
.p-stats-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-bottom:8px}
.p-stat{background:var(--surface);border-radius:10px;padding:8px}
.p-stat-l{font-size:7px;color:var(--mid);margin-bottom:2px}
.p-stat-v{font-size:11px;font-weight:700}
.p-stat-v.inc{color:var(--blue)}
.p-stat-v.exp{color:var(--red)}
.p-stat-v.inv{color:var(--yellow)}
.p-ai-card{background:var(--sb);border-radius:12px;padding:10px 12px;margin-bottom:8px;border-left:3px solid var(--accent2)}
.p-ai-badge{display:inline-block;background:var(--accent2);color:#fff;font-size:6px;font-weight:700;padding:1px 5px;border-radius:4px;margin-bottom:4px}
.p-ai-title{font-size:8.5px;font-weight:600;color:var(--text);margin-bottom:2px}
.p-ai-body{font-size:7px;color:var(--mid);line-height:1.4}
.p-section-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
.p-section-l{font-size:9px;font-weight:700;color:var(--text)}
.p-section-r{font-size:7px;color:var(--accent)}
.p-tx{display:flex;align-items:center;gap:7px;background:var(--surface);border-radius:9px;padding:7px;margin-bottom:4px}
.p-tx-ico{width:24px;height:24px;background:var(--sc);border-radius:6px;display:grid;place-items:center;font-size:11px;flex-shrink:0}
.p-tx-info{flex:1}
.p-tx-name{font-size:8.5px;font-weight:600;color:var(--text)}
.p-tx-time{font-size:7px;color:var(--mid)}
.p-tx-amt{font-size:9px;font-weight:700}
.p-tx-amt.pos{color:var(--blue)}
.p-tx-amt.neg{color:var(--red)}
.p-nav{display:flex;border-top:1px solid var(--line);padding-top:8px;margin-top:6px}
.p-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px}
.p-nav-icon{font-size:11px;color:var(--muted)}
.p-nav-icon.active{color:var(--accent)}
.p-nav-label{font-size:6.5px;color:var(--muted);font-weight:400}
.p-nav-label.active{color:var(--accent);font-weight:600}

/* FEATURES */
.features{max-width:1120px;margin:0 auto;padding:4rem 2.5rem}
.section-tag{font-size:.7rem;font-weight:700;letter-spacing:.14em;color:var(--accent);text-transform:uppercase;margin-bottom:.8rem}
.section-title{font-size:2.2rem;font-weight:700;line-height:1.15;letter-spacing:-.02em;margin-bottom:.8rem}
.section-sub{font-size:1rem;color:var(--mid);line-height:1.6;max-width:500px;margin-bottom:3rem}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}
.feat-card{background:var(--surface);border-radius:16px;padding:1.6rem;border:1px solid var(--line);transition:border-color .2s}
.feat-card:hover{border-color:var(--accent2)66}
.feat-icon{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:18px;margin-bottom:1rem}
.feat-title{font-size:.95rem;font-weight:600;margin-bottom:.5rem}
.feat-body{font-size:.82rem;color:var(--mid);line-height:1.55}

/* SCREENS STRIP */
.screens-section{background:var(--surface);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:3.5rem 0;overflow:hidden}
.screens-label{text-align:center;font-size:.7rem;font-weight:700;letter-spacing:.14em;color:var(--accent);text-transform:uppercase;margin-bottom:2.5rem}
.screens-strip{display:flex;gap:1.4rem;padding:0 2.5rem;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.screens-strip::-webkit-scrollbar{display:none}
.screen-thumb{scroll-snap-align:start;flex-shrink:0;width:180px;background:var(--bg);border-radius:22px;padding:10px;border:1px solid var(--line)}
.screen-label{font-size:.7rem;font-weight:600;color:var(--mid);text-align:center;margin-top:6px;letter-spacing:.04em;text-transform:uppercase}

/* Screen thumb content */
.st-bar{height:4px;background:var(--sc);border-radius:2px;margin-bottom:6px}
.st-heading{height:10px;background:var(--sb);border-radius:4px;margin-bottom:8px;width:60%}
.st-card-tall{height:60px;background:var(--sc);border-radius:10px;margin-bottom:5px}
.st-card{height:36px;background:var(--surface);border-radius:8px;margin-bottom:4px;border:1px solid var(--line)}
.st-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:5px}
.st-mini{height:30px;background:var(--surface);border-radius:7px;border:1px solid var(--line)}
.st-accent-strip{width:3px;height:100%;background:var(--accent2);border-radius:2px;float:left;margin-right:5px}
.st-bar-fill{height:4px;border-radius:2px;margin-bottom:3px}

/* CTA */
.cta-section{max-width:1120px;margin:0 auto;padding:5rem 2.5rem;text-align:center}
.cta-section h2{font-size:2.8rem;font-weight:700;letter-spacing:-.03em;margin-bottom:1rem}
.cta-section h2 em{font-style:italic;color:var(--accent)}
.cta-section p{font-size:1rem;color:var(--mid);margin-bottom:2.5rem;max-width:480px;margin-left:auto;margin-right:auto}
.cta-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}

/* FOOTER */
footer{border-top:1px solid var(--line);padding:2rem 2.5rem;display:flex;justify-content:space-between;align-items:center;max-width:1120px;margin:0 auto}
.footer-l{font-size:.78rem;color:var(--muted)}
.footer-r{font-size:.75rem;color:var(--muted)}
.footer-r a{color:var(--mid);text-decoration:none}

/* Ambient glow */
.ambient{position:fixed;width:600px;height:600px;border-radius:50%;pointer-events:none;z-index:0;opacity:.15}
.amb-1{background:radial-gradient(circle,var(--accent2),transparent 70%);top:-200px;right:-200px}
.amb-2{background:radial-gradient(circle,var(--accent),transparent 70%);bottom:-200px;left:-200px}
</style>
</head>
<body>

<div class="ambient amb-1"></div>
<div class="ambient amb-2"></div>

<nav>
  <div class="logo">
    <div class="logo-mark">L</div>
    <span class="logo-name">LEDGER</span>
  </div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="#viewer">Prototype</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/ledger-viewer">View Design ↗</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-tag">✦ AI-Powered Finance</div>
    <h1>Money that<br><em>thinks</em><br>for you</h1>
    <p class="hero-sub">LEDGER is a financial clarity app for solo founders — AI-driven insights, automated invoice tracking, and spending intelligence. Built for the new wave of one-person companies.</p>
    <div class="hero-actions">
      <a class="btn-p" href="https://ram.zenbin.org/ledger-viewer">View Prototype →</a>
      <a class="btn-s" href="https://ram.zenbin.org/ledger-mock">Interactive Mock ☀◑</a>
    </div>
    <div class="hero-trust">
      <span class="trust-chip">5 screens designed</span>
      <span class="trust-chip">Dark AI dashboard</span>
      <span class="trust-chip">Pencil.dev v2.8</span>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone-glow"></div>
    <div class="phone">
      <div class="p-status">
        <span class="p-time">9:41</span>
        <span class="p-icons">◆ ◆ ■</span>
      </div>
      <div class="p-greet">Good morning, Alex</div>
      <div class="p-heading">Your money,<br>clear</div>
      <div class="p-balance-card">
        <div class="p-balance-label">NET BALANCE</div>
        <div class="p-balance-amt">$24,819</div>
        <div class="p-balance-delta">▲ +$1,284 this month</div>
      </div>
      <div class="p-stats-row">
        <div class="p-stat">
          <div class="p-stat-l">Income</div>
          <div class="p-stat-v inc">$6,200</div>
        </div>
        <div class="p-stat">
          <div class="p-stat-l">Expenses</div>
          <div class="p-stat-v exp">$3,481</div>
        </div>
        <div class="p-stat">
          <div class="p-stat-l">Invoiced</div>
          <div class="p-stat-v inv">$8,500</div>
        </div>
      </div>
      <div class="p-ai-card">
        <div class="p-ai-badge">✦ AI</div>
        <div class="p-ai-title">You're on track for your best month.</div>
        <div class="p-ai-body">SaaS subs ($312) are 3× higher — consider reviewing unused tools.</div>
      </div>
      <div class="p-section-h">
        <span class="p-section-l">Recent</span>
        <span class="p-section-r">See all →</span>
      </div>
      <div class="p-tx">
        <div class="p-tx-ico">💳</div>
        <div class="p-tx-info">
          <div class="p-tx-name">Stripe Payment</div>
          <div class="p-tx-time">2h ago</div>
        </div>
        <div class="p-tx-amt pos">+$2,400</div>
      </div>
      <div class="p-tx">
        <div class="p-tx-ico">🎨</div>
        <div class="p-tx-info">
          <div class="p-tx-name">Figma License</div>
          <div class="p-tx-time">Yesterday</div>
        </div>
        <div class="p-tx-amt neg">-$15</div>
      </div>
      <div class="p-nav">
        <div class="p-nav-item">
          <div class="p-nav-icon active">⌂</div>
          <div class="p-nav-label active">Home</div>
        </div>
        <div class="p-nav-item">
          <div class="p-nav-icon">↕</div>
          <div class="p-nav-label">Txns</div>
        </div>
        <div class="p-nav-item">
          <div class="p-nav-icon">◫</div>
          <div class="p-nav-label">Invoice</div>
        </div>
        <div class="p-nav-item">
          <div class="p-nav-icon">◈</div>
          <div class="p-nav-label">Analytics</div>
        </div>
        <div class="p-nav-item">
          <div class="p-nav-icon">✦</div>
          <div class="p-nav-label">AI</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-tag">What it does</div>
  <h2 class="section-title">Financial clarity<br>without the grunt work</h2>
  <p class="section-sub">Every transaction, invoice, and insight — unified and intelligently organized for the solo founder.</p>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background:#4AE3A022">💳</div>
      <div class="feat-title">Unified Transactions</div>
      <div class="feat-body">Every payment in and out, auto-synced and AI-categorized. No manual entry, no spreadsheets.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#FFB54722">◫</div>
      <div class="feat-title">Invoice Tracker</div>
      <div class="feat-body">Track paid, pending, and overdue invoices at a glance. One-tap reminders for late payers.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#7B6CF522">✦</div>
      <div class="feat-title">AI Daily Briefing</div>
      <div class="feat-body">Every morning: your financial health score, cash flow forecast, and three actions to take today.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#4AB5E322">◈</div>
      <div class="feat-title">Analytics</div>
      <div class="feat-body">Income vs expenses, spending breakdown by category, month-over-month trends — all in one view.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#FF4D6D22">⚠</div>
      <div class="feat-title">Subscription Auditor</div>
      <div class="feat-body">AI flags unused SaaS tools. The average solo founder saves $87/month on tools they forgot about.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#4AE3A022">◎</div>
      <div class="feat-title">Runway Calculator</div>
      <div class="feat-body">See exactly how many months you can run on current savings. Know your number, always.</div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-label">5 screens · pencil.dev prototype</div>
  <div class="screens-strip">
    <div class="screen-thumb">
      <div class="st-bar"></div>
      <div class="st-heading"></div>
      <div class="st-card-tall" style="background:#20254A"></div>
      <div class="st-row"><div class="st-mini"></div><div class="st-mini"></div><div class="st-mini"></div></div>
      <div class="st-card" style="border-left:3px solid #7B6CF5"></div>
      <div class="st-card"></div>
      <div class="st-card"></div>
      <div class="screen-label">Dashboard</div>
    </div>
    <div class="screen-thumb">
      <div class="st-bar"></div>
      <div class="st-heading"></div>
      <div class="st-card" style="border-radius:18px"></div>
      <div style="display:flex;gap:3px;margin-bottom:5px">
        <div style="width:40px;height:18px;background:#4AE3A0;border-radius:8px"></div>
        <div class="st-mini" style="width:38px;height:18px"></div>
        <div class="st-mini" style="width:38px;height:18px"></div>
      </div>
      <div class="st-card"></div><div class="st-card"></div><div class="st-card"></div><div class="st-card"></div>
      <div class="screen-label">Transactions</div>
    </div>
    <div class="screen-thumb">
      <div class="st-bar"></div>
      <div class="st-heading"></div>
      <div class="st-row"><div class="st-mini" style="height:40px"></div><div class="st-mini" style="height:40px"></div></div>
      <div class="st-card" style="height:56px;border-left:3px solid #4AE3A0"></div>
      <div class="st-card" style="height:56px;border-left:3px solid #FFB547"></div>
      <div class="st-card" style="height:56px;border-left:3px solid #FF4D6D"></div>
      <div class="screen-label">Invoices</div>
    </div>
    <div class="screen-thumb">
      <div class="st-bar"></div>
      <div class="st-heading"></div>
      <div class="st-card-tall" style="height:80px"></div>
      <div style="margin-bottom:4px">
        <div class="st-bar-fill" style="width:90%;background:#7B6CF5"></div>
        <div class="st-bar-fill" style="width:65%;background:#4AB5E3"></div>
        <div class="st-bar-fill" style="width:48%;background:#FFB547"></div>
        <div class="st-bar-fill" style="width:32%;background:#4AE3A0"></div>
      </div>
      <div class="st-card"></div><div class="st-card"></div>
      <div class="screen-label">Analytics</div>
    </div>
    <div class="screen-thumb">
      <div class="st-bar"></div>
      <div class="st-heading"></div>
      <div class="st-card-tall" style="background:#20254A;height:50px"></div>
      <div class="st-card" style="border-left:3px solid #4AB5E3"></div>
      <div class="st-card" style="border-left:3px solid #FFB547"></div>
      <div class="st-card" style="border-left:3px solid #FF4D6D"></div>
      <div class="st-card" style="border-left:3px solid #4AE3A0"></div>
      <div class="screen-label">AI Insights</div>
    </div>
  </div>
</section>

<section class="cta-section" id="viewer">
  <h2>See it <em>live</em></h2>
  <p>Explore the full interactive prototype in pencil.dev viewer, or try the Svelte mock with light/dark toggle.</p>
  <div class="cta-btns">
    <a class="btn-p" href="https://ram.zenbin.org/ledger-viewer">Open Prototype →</a>
    <a class="btn-s" href="https://ram.zenbin.org/ledger-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span class="footer-l">LEDGER · RAM Design Heartbeat · March 2026</span>
  <span class="footer-r">Inspired by <a href="https://midday.ai">Midday.ai</a> on <a href="https://darkmodedesign.com">Dark Mode Design</a></span>
</footer>

</body>
</html>`;

// ─── Viewer page ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/ledger.pen', 'utf8');

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/renderer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero page…');
  const r1 = await zenPub(SLUG, hero, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await zenPub(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log(`  Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
})();
