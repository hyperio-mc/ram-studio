'use strict';
// trove-publish.js — Full Design Discovery pipeline for TROVE
// TROVE — AI-powered Freelance Finance OS
// Theme: LIGHT · Slug: trove

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'trove';
const APP_NAME  = 'TROVE';
const TAGLINE   = 'Every dollar, found and understood.';
const ARCHETYPE = 'fintech-light-agent-first-freelance-finance';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Light-themed AI-powered freelance finance OS. Inspired by Midday.ai ("Let agents run your business") featured on darkmodedesign.com — agent-first financial automation trend; Evervault editorial customer story cards (godly.website); minimal.gallery SaaS tab warm off-white precision typography. Warm cream #F9F7F3, electric blue #2563EB accent, growth green #16A34A. Five screens: Dashboard with hero revenue card, Transactions with AI categorization, Projects with billable hours tracker, Invoice auto-drafted by agent, Insights with health score and forecast.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);
const penJson = fs.readFileSync(path.join(__dirname, 'trove.pen'), 'utf8');

const P = {
  bg:      '#F9F7F3',
  surface: '#FFFFFF',
  text:    '#1A1816',
  muted:   '#7C7872',
  border:  '#E8E5DF',
  accent:  '#2563EB',
  accent2: '#16A34A',
  warn:    '#DC2626',
  blueBg:  '#EFF6FF',
  greenBg: '#F0FDF4',
  amberBg: '#FFFBEB',
  amber:   '#D97706',
};

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
      'Accept': 'application/json',
    },
  }, body);
  return res;
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO PAGE
// ─────────────────────────────────────────────────────────────────────────────
function buildHero() {
  const screens = [
    { id:'Dashboard',    sub:'Hero revenue card ($18,420 net revenue, ↑23% MoM) with AI forecast chip. Agent status pill "reconciled 14 transactions." Outstanding/Paid dual stat cards. Live transaction feed with AI-categorized entries.',             color:P.accent  },
    { id:'Transactions', sub:'AI agent insight banner: "14 transactions categorized, 3 flagged for review." Month summary with income/expense totals. Filter chips: All / Income / Expenses / ⚑ Flagged. Full transaction rows with category tags.',      color:P.accent  },
    { id:'Projects',     sub:'Active project cards for Notion HQ, Acme Corp, Bloom Studio — each with progress bars, hourly rate, billed amount. Agent amber pill: "3 projects have unbilled hours." Daily time tracker with 8hr bar.',                color:P.accent2 },
    { id:'Invoice',      sub:'Agent-drafted invoice (#2026-031) for Notion HQ. From/To header, line items for 32+8+4 hrs at $180/hr. Subtotal $7,920 + tax $673 = Total $8,593. "Agent auto-reconciles on receipt" note.',                             color:P.accent  },
    { id:'Insights',     sub:'Financial health score 78/100 with animated bar (ACCENT2). 6-month revenue bar chart peaking at $18.4K with ACCENT bar. 2×2 metric grid: avg invoice size, days to pay, utilization rate, expense ratio. April forecast $22,400.', color:P.accent2 },
  ];

  const tickerText = [
    'DASHBOARD', '·', 'TRANSACTIONS', '·', 'PROJECTS', '·', 'INVOICE',
    '·', 'INSIGHTS', '·', '$18,420 NET', '·', 'AI AGENT',
    '·', '23% GROWTH', '·', 'HEALTH 78/100', '·', 'WARM CREAM',
    '·', 'ELECTRIC BLUE', '·', 'TABULAR NUMBERS', '·',
  ].join('  ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${P.bg};--surf:${P.surface};
  --text:${P.text};--muted:${P.muted};
  --acc:${P.accent};--acc2:${P.accent2};
  --warn:${P.warn};--bdr:${P.border};
  --bbg:${P.blueBg};--gbg:${P.greenBg};--abg:${P.amberBg};
  --amber:${P.amber};
}
html{background:var(--bg);color:var(--text);font-family:'Space Grotesk',system-ui,sans-serif;scroll-behavior:smooth}
body{min-height:100vh;overflow-x:hidden}

nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:60px;background:rgba(249,247,243,0.96);backdrop-filter:blur(20px);border-bottom:1px solid var(--bdr)}
.nav-logo{font-family:'Instrument Serif',serif;font-size:20px;color:var(--text);text-decoration:none;letter-spacing:-0.01em}
.nav-logo span{color:var(--acc)}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{font-size:12px;color:var(--muted);text-decoration:none;transition:color .2s;letter-spacing:0.04em;font-weight:500}
.nav-links a:hover{color:var(--text)}
.btn-nav{font-size:12px;font-weight:600;background:var(--acc);color:#fff;border:none;border-radius:6px;padding:8px 18px;text-decoration:none;transition:opacity .2s;letter-spacing:0.02em}
.btn-nav:hover{opacity:0.85}

/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 64px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 35%,rgba(37,99,235,0.06) 0%,transparent 70%);pointer-events:none}

/* Revenue display */
.revenue-display{position:relative;width:320px;height:88px;margin:0 auto 40px;background:var(--acc);border-radius:18px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 24px}
.rd-label{font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.08em;font-family:'DM Mono',monospace;margin-bottom:4px}
.rd-value{font-size:38px;font-weight:700;color:#fff;letter-spacing:-0.02em;font-variant-numeric:tabular-nums;line-height:1}
.rd-trend{position:absolute;right:20px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 10px;font-size:11px;color:#fff;font-weight:600;backdrop-filter:blur(8px)}
.rd-agent{position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);white-space:nowrap;background:var(--bbg);border:1px solid var(--acc);border-radius:20px;padding:4px 14px;font-size:10px;color:var(--acc);font-weight:600;font-family:'DM Mono',monospace;letter-spacing:0.06em}

.hero-eyebrow{font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:var(--acc);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:20px;opacity:0.75}
.hero-title{font-size:clamp(52px,10vw,96px);font-weight:700;line-height:0.92;letter-spacing:-0.04em;color:var(--text);margin-bottom:16px}
.hero-title em{font-family:'Instrument Serif',serif;font-style:italic;color:var(--acc);font-weight:400}
.hero-rule{width:60px;height:2px;background:var(--acc);margin:0 auto 20px;opacity:0.5}
.hero-sub{font-size:clamp(15px,2.2vw,19px);font-weight:400;color:var(--muted);max-width:500px;line-height:1.7;margin:0 auto 32px}
.hero-sub strong{color:var(--text);font-weight:600}

.hero-acts{display:flex;gap:14px;justify-content:center;margin-bottom:16px;flex-wrap:wrap}
.btn-lg{font-size:14px;font-weight:700;background:var(--acc);color:#fff;border:none;border-radius:8px;padding:14px 30px;text-decoration:none;transition:all .2s}
.btn-lg:hover{opacity:0.88;transform:translateY(-1px)}
.btn-lg-o{font-size:14px;font-weight:600;background:transparent;color:var(--text);border:1.5px solid var(--bdr);border-radius:8px;padding:13px 30px;text-decoration:none;transition:all .2s}
.btn-lg-o:hover{border-color:var(--acc);color:var(--acc)}
.hero-meta{font-size:10px;color:var(--muted);letter-spacing:0.12em;text-transform:uppercase;font-family:'DM Mono',monospace}

.hero-stats{display:flex;gap:12px;justify-content:center;margin-top:44px;flex-wrap:wrap}
.stat-pill{display:flex;flex-direction:column;align-items:center;padding:14px 20px;background:var(--surf);border:1px solid var(--bdr);border-radius:12px;min-width:88px;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
.sp-val{font-size:22px;font-weight:700;color:var(--text);line-height:1;font-variant-numeric:tabular-nums}
.sp-lab{font-size:9px;color:var(--muted);letter-spacing:0.10em;text-transform:uppercase;margin-top:4px;font-family:'DM Mono',monospace}
.sp-val.b{color:var(--acc)}
.sp-val.g{color:var(--acc2)}
.sp-val.r{color:var(--warn)}

/* TICKER */
.ticker{overflow:hidden;height:40px;background:var(--text);display:flex;align-items:center}
.ticker-track{display:inline-flex;white-space:nowrap;animation:tick 40s linear infinite;font-size:10px;font-weight:600;color:var(--bg);letter-spacing:0.12em;font-family:'DM Mono',monospace}
@keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

.section{padding:96px 48px;max-width:1200px;margin:0 auto}
@media(max-width:640px){.section{padding:64px 20px}}
.s-eye{font-size:10px;font-weight:700;color:var(--acc);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:12px;font-family:'DM Mono',monospace}
.s-h2{font-size:clamp(28px,4.5vw,46px);font-weight:700;color:var(--text);line-height:1.08;letter-spacing:-0.02em;margin-bottom:12px}
.s-h2 em{font-family:'Instrument Serif',serif;font-style:italic;color:var(--acc);font-weight:400}
.s-sub{font-size:15px;color:var(--muted);line-height:1.75;max-width:560px;margin-bottom:52px}

/* SCREENS GRID */
.screens-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
.screen-card{background:var(--surf);border:1px solid var(--bdr);border-radius:14px;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s}
.screen-card:hover{transform:translateY(-3px);border-color:var(--acc);box-shadow:0 8px 24px rgba(37,99,235,0.08)}
.screen-card-body{padding:22px}
.sc-num{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-bottom:10px;letter-spacing:0.06em;opacity:0.6}
.sc-title{font-size:16px;font-weight:700;color:var(--text);margin-bottom:8px}
.sc-sub{font-size:12px;color:var(--muted);line-height:1.65}
.sc-accent{display:inline-block;width:20px;height:3px;border-radius:2px;margin-top:16px}

/* TREND CARD */
.trend-card{background:var(--surf);border:1px solid var(--bdr);border-radius:16px;padding:36px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
.trend-source{font-family:'DM Mono',monospace;font-size:10px;color:var(--acc);letter-spacing:0.10em;text-transform:uppercase;margin-bottom:10px}
.trend-h{font-size:22px;font-weight:700;color:var(--text);margin-bottom:10px;letter-spacing:-0.01em}
.trend-p{font-size:14px;color:var(--muted);line-height:1.85}
.trend-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:24px}
.trend-item{background:var(--bg);border:1px solid var(--bdr);border-radius:10px;padding:16px}
.t-label{font-size:9px;font-weight:700;color:var(--muted);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;font-family:'DM Mono',monospace;opacity:0.7}
.t-val{font-size:13px;font-weight:500;color:var(--text);line-height:1.5}
.t-val.b{color:var(--acc)}
.t-val.g{color:var(--acc2)}

/* PALETTE */
.palette-row{display:flex;gap:0;border-radius:10px;overflow:hidden;height:60px;margin-top:16px;border:1px solid var(--bdr)}
.pal-sw{flex:1;display:flex;align-items:flex-end;padding:6px 10px}
.pal-lab{font-size:8px;font-weight:600;letter-spacing:0.06em;font-family:'DM Mono',monospace}

/* DECISIONS */
.decisions-list{display:flex;flex-direction:column;gap:16px;margin-top:24px}
.decision-item{display:flex;gap:18px;align-items:flex-start;padding:24px;background:var(--surf);border:1px solid var(--bdr);border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04)}
.d-num{font-family:'Instrument Serif',serif;font-size:28px;font-weight:400;font-style:italic;color:var(--acc);min-width:44px;line-height:1}
.d-body h4{font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px}
.d-body p{font-size:13px;color:var(--muted);line-height:1.75}

.critique-card{background:var(--bbg);border:1px solid rgba(37,99,235,0.2);border-radius:12px;padding:26px;margin-top:18px}
.crit-eye{font-size:10px;font-weight:700;color:var(--acc);letter-spacing:0.10em;text-transform:uppercase;margin-bottom:8px;font-family:'DM Mono',monospace}
.crit-p{font-size:14px;color:var(--text);line-height:1.8}

footer{border-top:1px solid var(--bdr);padding:40px 48px;display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto}
.ft-logo{font-family:'Instrument Serif',serif;font-size:18px;color:var(--acc);font-style:italic}
.ft-meta{font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;letter-spacing:0.06em}
</style>
</head>
<body>
<nav>
  <a href="#" class="nav-logo">T<span>r</span>ove</a>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#inspiration">Inspiration</a></li>
    <li><a href="#decisions">Decisions</a></li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-nav">View Design ↗</a>
</nav>

<section class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>

  <!-- Revenue display mock -->
  <div class="revenue-display">
    <span class="rd-label">NET REVENUE · APRIL 2026</span>
    <span class="rd-value">$18,420</span>
    <span class="rd-trend">↑ 23%</span>
    <span class="rd-agent">⚡ AGENT RECONCILED 14 TRANSACTIONS</span>
  </div>

  <div style="height:32px"></div>

  <div class="hero-title">TROVE</div>
  <div class="hero-rule"></div>
  <p class="hero-sub"><strong>AI-powered freelance finance OS.</strong> Every transaction found, categorized, and reconciled — so you can focus on the work, not the books.</p>
  <div class="hero-acts">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-lg">View in Pencil Viewer ↗</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-lg-o">Interactive Mock ↗</a>
  </div>
  <p class="hero-meta">Light theme · 5 screens · Warm cream + Electric blue + Growth green</p>

  <div class="hero-stats">
    <div class="stat-pill"><span class="sp-val b">$18K</span><span class="sp-lab">Net Rev</span></div>
    <div class="stat-pill"><span class="sp-val b">23%</span><span class="sp-lab">MoM Growth</span></div>
    <div class="stat-pill"><span class="sp-val g">78</span><span class="sp-lab">Health Score</span></div>
    <div class="stat-pill"><span class="sp-val r">$6.2K</span><span class="sp-lab">Outstanding</span></div>
    <div class="stat-pill"><span class="sp-val">5</span><span class="sp-lab">Screens</span></div>
  </div>
</section>

<div class="ticker" aria-hidden="true">
  <div class="ticker-track">
    &nbsp;&nbsp;${tickerText}&nbsp;&nbsp;&nbsp;&nbsp;${tickerText}&nbsp;&nbsp;
  </div>
</div>

<div id="screens" style="background:var(--bg);padding:0">
  <div class="section">
    <p class="s-eye">Five Screens</p>
    <h2 class="s-h2">Your whole financial life,<br><em>automatically understood.</em></h2>
    <p class="s-sub">From a single revenue dashboard to auto-drafted invoices — the agent does the reconciliation so you never lose a dollar.</p>
    <div class="screens-grid">
      ${screens.map((s, i) => `
      <div class="screen-card">
        <div class="screen-card-body">
          <p class="sc-num">0${i+1} / 0${screens.length}</p>
          <h3 class="sc-title">${s.id}</h3>
          <p class="sc-sub">${s.sub}</p>
          <span class="sc-accent" style="background:${s.color}"></span>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>

<div id="inspiration" style="background:var(--bg);border-top:1px solid var(--bdr)">
  <div class="section">
    <p class="s-eye">Design Research</p>
    <h2 class="s-h2">What I found, what <em>moved</em> me.</h2>

    <div class="trend-card">
      <p class="trend-source">Source → darkmodedesign.com → midday.ai</p>
      <h3 class="trend-h">Midday — "Let agents run your business"</h3>
      <p class="trend-p">Browsing darkmodedesign.com's current roster, <strong>Midday</strong> stopped me — not for being dark (it isn't), but for its framing: "The business stack for modern founders," with an AI agent badge prominently in the hero. "Let agents run your business." The homepage leads with an animated dashboard preview and immediately communicates financial automation: transactions unified, invoices reconciled, books clean. The agent isn't a buried feature — it's the headline. Separately, on <strong>godly.website</strong>, Evervault's customers page showed a precise editorial layout for financial/security SaaS — full-bleed customer story cards with large company names and a bold single-sentence thesis per story. And on <strong>minimal.gallery</strong>'s SaaS filter, warm off-white backgrounds (not pure white) with tabular-nums financial figures kept appearing — the design language of precision without sterility.</p>
      <div class="trend-grid">
        <div class="trend-item"><p class="t-label">Key Signal (Midday)</p><p class="t-val b">Agent-first framing — AI is the hero, not a feature flag</p></div>
        <div class="trend-item"><p class="t-label">Key Signal (Evervault)</p><p class="t-val">Editorial precision — single-sentence stories, bold client names, no fluff</p></div>
        <div class="trend-item"><p class="t-label">Palette Signal</p><p class="t-val g">Warm cream #F9F7F3 — financial trust without cold clinical white</p></div>
        <div class="trend-item"><p class="t-label">Typography Signal</p><p class="t-val">Tabular-nums for all financial figures — alignment creates instant trust</p></div>
      </div>
    </div>

    <p class="s-eye" style="margin-top:48px">Colour Palette</p>
    <div class="palette-row">
      <div class="pal-sw" style="background:${P.bg};flex:2"><span class="pal-lab" style="color:${P.muted}">#F9F7F3</span></div>
      <div class="pal-sw" style="background:${P.surface}"><span class="pal-lab" style="color:${P.muted}">#FFFFFF</span></div>
      <div class="pal-sw" style="background:${P.border}"><span class="pal-lab" style="color:${P.muted}">#E8E5DF</span></div>
      <div class="pal-sw" style="background:${P.accent}"><span class="pal-lab" style="color:#fff">#2563EB</span></div>
      <div class="pal-sw" style="background:${P.accent2}"><span class="pal-lab" style="color:#fff">#16A34A</span></div>
      <div class="pal-sw" style="background:${P.warn}"><span class="pal-lab" style="color:#fff">#DC2626</span></div>
    </div>
  </div>
</div>

<div id="decisions" style="background:var(--bg);border-top:1px solid var(--bdr)">
  <div class="section">
    <p class="s-eye">Design Decisions</p>
    <h2 class="s-h2">Three choices that <em>define</em> Trove.</h2>
    <div class="decisions-list">
      <div class="decision-item">
        <span class="d-num">01</span>
        <div class="d-body">
          <h4>Agent pill as persistent UI element across all screens</h4>
          <p>Every screen opens with a contextual agent status pill below the title — not a notification badge, not a chat bubble, but a single-line plain-language status: "Agent reconciled 14 transactions today," "3 projects have unbilled hours," "Agent drafted this from project data." This mirrors Midday's "Let agents run your business" positioning. The agent isn't hidden in a settings tab; its work is visible in the primary flow. The pill uses BLUE_BG + ACCENT border on most screens and switches to AMBER_BG when there's pending action — a subtle but persistent semantic system.</p>
        </div>
      </div>
      <div class="decision-item">
        <span class="d-num">02</span>
        <div class="d-body">
          <h4>Three-color semantic system: blue = navigation/active, green = positive, red = owed</h4>
          <p>Electric blue (#2563EB) marks active nav, links, and AI-related actions. Growth green (#16A34A) marks all positive financial events — incoming payments, healthy metrics, good news. Alert red (#DC2626) marks outstanding invoices and expenses — money leaving or owed. This maps directly to how freelancers think about money: blue is the interface you trust, green is money coming in, red is money out or overdue. The 6-month revenue bar chart uses blue for the current bar and muted BLUE_BG for past bars — so your eye immediately lands on the present moment.</p>
        </div>
      </div>
      <div class="decision-item">
        <span class="d-num">03</span>
        <div class="d-body">
          <h4>Warm cream background (#F9F7F3) instead of pure white</h4>
          <p>Pure white (#FFFFFF) financial apps feel clinical and cold — hospital or spreadsheet. Warm cream has a psychological association with physical paper, receipts, contracts — the tangible materials of money. It also makes the electric blue accent pop more vibrantly (higher chroma contrast on warm background than on neutral white). The SURFACE color IS pure white — used only for cards and the invoice — so the cream creates a natural visual hierarchy: background recedes, cards lift, invoice is the cleanest surface in the design.</p>
        </div>
      </div>
    </div>

    <div class="critique-card">
      <p class="crit-eye">One thing I'd change</p>
      <p class="crit-p">The invoice screen is the most content-dense and most important screen in the flow — but it uses the same font size as every other screen. A real implementation would give the total amount ($8,593) much more visual weight: 32-36px, possibly in Instrument Serif to signal "this is a document, not an app screen." Right now it reads like a form. It should read like a contract.</p>
    </div>
  </div>
</div>

<footer>
  <span class="ft-logo">Trove by RAM</span>
  <span class="ft-meta">Design heartbeat · ram.zenbin.org · ${new Date().getFullYear()}</span>
</footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWER PAGE
// ─────────────────────────────────────────────────────────────────────────────
function buildViewer() {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Pencil Viewer | RAM</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:${P.bg}}
.viewer-bar{position:fixed;top:0;left:0;right:0;height:48px;background:rgba(249,247,243,0.97);border-bottom:1px solid ${P.border};display:flex;align-items:center;justify-content:space-between;padding:0 20px;z-index:100;font-family:'Space Grotesk',system-ui,sans-serif}
.vb-name{font-size:13px;font-weight:600;color:${P.text};letter-spacing:-0.01em}
.vb-name span{color:${P.accent}}
.vb-links{display:flex;gap:16px}
.vb-links a{font-size:11px;color:${P.muted};text-decoration:none;letter-spacing:0.04em;transition:color .2s;font-weight:500}
.vb-links a:hover{color:${P.text}}
iframe{position:fixed;top:48px;left:0;right:0;bottom:0;width:100%;height:calc(100% - 48px);border:none;background:${P.bg}}
</style>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
${injection}
</head>
<body>
<div class="viewer-bar">
  <span class="vb-name">TROVE — <span>${TAGLINE}</span></span>
  <div class="vb-links">
    <a href="https://ram.zenbin.org/${SLUG}">← Hero</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
  </div>
</div>
<iframe src="https://ram.zenbin.org/viewer" id="pencil-frame" allow="fullscreen"></iframe>
<script>
  const frame = document.getElementById('pencil-frame');
  frame.addEventListener('load', () => {
    if (window.EMBEDDED_PEN) {
      frame.contentWindow.postMessage({ type: 'LOAD_PEN', pen: window.EMBEDDED_PEN }, '*');
    }
  });
<\/script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub Queue
// ─────────────────────────────────────────────────────────────────────────────
async function pushToQueue() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData = JSON.parse(getRes.body);
  const sha = fileData.sha;
  const current = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(current);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const entry = {
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

  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
  }, putBody);
  return { status: putRes.status, entry };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  console.log('▶ Publishing TROVE Design Discovery pipeline…\n');

  process.stdout.write('  [1/3] Hero page… ');
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, buildHero());
  console.log(heroRes.status === 200 ? `✓ https://ram.zenbin.org/${SLUG}` : `✗ ${heroRes.status} ${heroRes.body.slice(0,120)}`);

  process.stdout.write('  [2/3] Viewer page… ');
  const viewerRes = await zenPut(`${SLUG}-viewer`, `${APP_NAME} — Pencil Viewer | RAM`, buildViewer());
  console.log(viewerRes.status === 200 ? `✓ https://ram.zenbin.org/${SLUG}-viewer` : `✗ ${viewerRes.status} ${viewerRes.body.slice(0,120)}`);

  process.stdout.write('  [3/3] GitHub queue… ');
  try {
    const q = await pushToQueue();
    console.log(q.status === 200 ? '✓ pushed' : `✗ status ${q.status}`);
  } catch(e) { console.log('✗', e.message); }

  console.log(`\n✅ Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`✅ Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`⏳ Mock   → run trove-mock.mjs next`);
})();
