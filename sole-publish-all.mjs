// sole-publish-all.mjs — SOLE hero + viewer + mock + gallery + DB
import fs from 'fs';
import https from 'https';
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const SLUG      = 'sole';
const APP_NAME  = 'SOLE';
const TAGLINE   = 'Financial OS for one-person companies';
const ARCHETYPE = 'finance-solo';
const PROMPT    = 'Light-theme financial OS for solopreneurs. Inspired by Midday.ai ("For the new wave of one-person companies") on godly.website + SILENCIO editorial large-type aesthetic. Warm cream palette (#F5F1EB), burnished gold accents, 5 screens: Overview with editorial $18,420 display number, 6-month cash flow bar chart, client revenue concentration, AI audio brief weekly summary, quarterly tax tracker.';

// ── ZenBin publish helper ─────────────────────────────────────────────────────
function publish(slug, html, title) {
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
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}` });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F5F1EB',
  surface:  '#FFFFFF',
  surface2: '#EDE9E2',
  surface3: '#E4DFD7',
  ink:      '#1A1520',
  ink2:     '#3D3847',
  gold:     '#B8860B',
  gold2:    '#D4A017',
  sage:     '#4A7C59',
  rose:     '#C45C6A',
  muted:    '#8B8499',
  border:   '#D8D2C8',
};

// ══════════════════════════════════════════════════════════════════════════════
// HERO PAGE
// ══════════════════════════════════════════════════════════════════════════════
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SOLE — ${TAGLINE}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,200;0,300;0,400;0,500;0,600;1,200&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: ${P.bg}; --surface: ${P.surface}; --surface2: ${P.surface2};
  --ink: ${P.ink}; --ink2: ${P.ink2};
  --gold: ${P.gold}; --gold2: ${P.gold2};
  --sage: ${P.sage}; --rose: ${P.rose};
  --muted: ${P.muted}; --border: ${P.border};
}
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--ink); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }

/* NAV */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(245,241,235,0.92); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 64px;
}
.nav-logo { font-size: 16px; font-weight: 600; letter-spacing: 0.12em; color: var(--ink); text-decoration: none; }
.nav-sub { font-size: 12px; color: var(--muted); margin-left: 8px; }
.nav-links { display: flex; gap: 32px; align-items: center; }
.nav-links a { font-size: 13px; color: var(--ink2); text-decoration: none; transition: color .2s; }
.nav-links a:hover { color: var(--gold); }
.nav-cta {
  background: var(--ink); color: var(--bg);
  font-size: 12px; font-weight: 600; padding: 10px 22px;
  border-radius: 8px; text-decoration: none; letter-spacing: 0.04em;
  transition: background .2s;
}
.nav-cta:hover { background: var(--gold) !important; color: var(--bg); }

/* HERO */
.hero {
  min-height: 100vh; padding: 120px 80px 80px;
  display: grid; grid-template-columns: 1fr 420px;
  align-items: center; gap: 80px;
  border-bottom: 1px solid var(--border);
  position: relative; overflow: hidden;
}
.hero::after {
  content: ''; position: absolute; right: -100px; top: 50%;
  transform: translateY(-50%);
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(184,134,11,0.06) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.hero-eyebrow {
  font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
  color: var(--gold); text-transform: uppercase; margin-bottom: 24px;
}
.hero-title {
  font-size: clamp(56px, 6.5vw, 96px); font-weight: 200;
  line-height: 1.0; letter-spacing: -0.025em;
  color: var(--ink); margin-bottom: 28px;
}
.hero-title em { font-style: italic; color: var(--gold); }
.hero-sub {
  font-size: 19px; font-weight: 300; line-height: 1.65;
  color: var(--ink2); max-width: 460px; margin-bottom: 44px;
}
.hero-cta-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.btn-primary {
  display: inline-block; padding: 15px 36px;
  background: var(--ink); color: var(--bg);
  font-size: 13px; font-weight: 600; letter-spacing: 0.06em;
  text-decoration: none; border-radius: 10px; transition: background .2s;
}
.btn-primary:hover { background: var(--gold); }
.btn-ghost {
  display: inline-block; padding: 15px 28px;
  border: 1.5px solid var(--border); color: var(--ink2);
  font-size: 13px; text-decoration: none; border-radius: 10px;
  transition: border-color .2s, color .2s;
}
.btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

/* PHONE MOCKUP */
.phone-wrap {
  width: 280px; height: 560px;
  background: var(--surface);
  border-radius: 44px;
  border: 8px solid var(--ink);
  box-shadow: 0 50px 120px rgba(26,21,32,0.20), 0 0 0 1px var(--border);
  overflow: hidden;
  position: relative;
  z-index: 1;
}
.phone-notch {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 90px; height: 26px; background: var(--ink); border-radius: 0 0 18px 18px;
  z-index: 2;
}
.phone-inner {
  width: 100%; height: 100%;
  background: var(--bg);
  padding: 30px 18px 20px;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}
.phone-status { display: flex; justify-content: space-between; font-size: 10px; color: var(--ink2); margin-bottom: 14px; }
.phone-date-label { font-size: 9px; font-weight: 600; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 3px; }
.phone-greeting { font-size: 18px; font-weight: 200; color: var(--ink); margin-bottom: 16px; line-height: 1.25; }
.phone-card {
  background: var(--surface); border-radius: 14px; padding: 14px 14px 10px;
  border: 1px solid var(--border); margin-bottom: 10px;
}
.phone-card-lbl { font-size: 8px; font-weight: 600; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 3px; }
.phone-card-num { font-size: 30px; font-weight: 200; color: var(--ink); letter-spacing: -0.02em; line-height: 1.0; margin-bottom: 4px; }
.phone-card-sub { font-size: 9px; color: var(--sage); margin-bottom: 8px; }
.phone-bar { height: 3px; background: #E4DFD7; border-radius: 2px; overflow: hidden; }
.phone-bar-fill { height: 100%; background: var(--gold); border-radius: 2px; width: 70%; }
.phone-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; }
.phone-metric {
  background: var(--surface); border-radius: 10px; padding: 8px;
  border: 1px solid var(--border);
}
.pm-label { font-size: 7px; font-weight: 600; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 2px; }
.pm-value { font-size: 13px; font-weight: 300; color: var(--ink); }

/* STATS BAR */
.stats-bar {
  background: var(--ink); padding: 40px 80px;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px;
}
.stat-value { font-size: 38px; font-weight: 200; color: var(--bg); letter-spacing: -0.025em; margin-bottom: 6px; }
.stat-value span { color: ${P.gold2}; }
.stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.07em; color: rgba(245,241,235,0.45); text-transform: uppercase; }

/* FEATURES */
.features { max-width: 1100px; margin: 0 auto; padding: 100px 80px; border-bottom: 1px solid var(--border); }
.section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: var(--gold); text-transform: uppercase; margin-bottom: 16px; }
.section-title { font-size: clamp(34px, 4vw, 54px); font-weight: 200; letter-spacing: -0.02em; color: var(--ink); margin-bottom: 60px; line-height: 1.15; max-width: 640px; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.feature-card {
  background: var(--surface); border-radius: 20px; padding: 36px;
  border: 1px solid var(--border); transition: border-color .2s, transform .2s;
}
.feature-card:hover { border-color: var(--gold); transform: translateY(-4px); }
.feature-icon { font-size: 30px; margin-bottom: 18px; }
.feature-name { font-size: 17px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
.feature-desc { font-size: 14px; line-height: 1.7; color: var(--ink2); }

/* QUOTE */
.quote-section {
  background: var(--surface2); padding: 80px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: flex-start; gap: 36px;
}
.quote-mark { font-size: 90px; font-weight: 200; color: var(--gold); line-height: 0.75; flex-shrink: 0; }
.quote-body { font-size: 22px; font-weight: 300; line-height: 1.6; color: var(--ink); }
.quote-source { font-size: 12px; color: var(--muted); margin-top: 16px; letter-spacing: 0.03em; }

/* SCREENS PREVIEW */
.screens-section { max-width: 1100px; margin: 0 auto; padding: 100px 80px; border-bottom: 1px solid var(--border); }
.screens-row {
  display: flex; gap: 20px; overflow-x: auto; padding-bottom: 16px; margin-top: 48px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.screen-card {
  flex-shrink: 0; width: 190px; height: 340px;
  background: var(--surface); border-radius: 28px; border: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; transition: border-color .2s;
}
.screen-card:hover { border-color: var(--gold); }
.screen-icon { font-size: 36px; }
.screen-label { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: var(--ink2); }

/* CTA */
.cta-section { text-align: center; padding: 100px 40px; }
.cta-title { font-size: clamp(38px, 5vw, 68px); font-weight: 200; letter-spacing: -0.025em; color: var(--ink); margin-bottom: 20px; line-height: 1.1; }
.cta-sub { font-size: 18px; color: var(--ink2); margin-bottom: 44px; font-weight: 300; }
.cta-row { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

/* FOOTER */
footer {
  padding: 32px 80px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}
.footer-brand { font-size: 14px; font-weight: 600; color: var(--ink); }
.footer-note { font-size: 12px; color: var(--muted); }

@media (max-width: 960px) {
  .hero { grid-template-columns: 1fr; padding: 100px 32px 60px; }
  .phone-wrap { display: none; }
  .stats-bar { grid-template-columns: 1fr 1fr; padding: 40px 32px; }
  .features { padding: 60px 32px; }
  .features-grid { grid-template-columns: 1fr; }
  .quote-section { padding: 60px 32px; flex-direction: column; }
  .screens-section { padding: 60px 32px; }
  .cta-section { padding: 60px 32px; }
  footer { padding: 24px 32px; flex-direction: column; gap: 8px; text-align: center; }
}
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">SOLE <span class="nav-sub">by RAM</span></a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="/sole-mock">Mock ☀◑</a>
    <a href="/sole-viewer" class="nav-cta">Open Prototype</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div>
    <p class="hero-eyebrow">RAM Design Heartbeat · March 2026</p>
    <h1 class="hero-title">Run lean.<br><em>Know your</em><br>numbers.</h1>
    <p class="hero-sub">SOLE is the financial OS built for the new wave of one-person companies — indie makers, solo founders, freelancers doing serious work alone.</p>
    <div class="hero-cta-row">
      <a href="/sole-viewer" class="btn-primary">View Design ↗</a>
      <a href="/sole-mock" class="btn-ghost">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div style="display:flex;justify-content:center;z-index:1;">
    <div class="phone-wrap">
      <div class="phone-notch"></div>
      <div class="phone-inner">
        <div class="phone-status"><span>9:41</span><span>●●● ▌▌▌</span></div>
        <div class="phone-date-label">MON, 24 MARCH</div>
        <div class="phone-greeting">Good morning,<br>Alex.</div>
        <div class="phone-card">
          <div class="phone-card-lbl">MONTH-TO-DATE REVENUE</div>
          <div class="phone-card-num">$18,420</div>
          <div class="phone-card-sub">↑ 23% vs last month · 70% to goal</div>
          <div class="phone-bar"><div class="phone-bar-fill"></div></div>
        </div>
        <div class="phone-metrics">
          <div class="phone-metric"><div class="pm-label">INVOICED</div><div class="pm-value">$6.2k</div></div>
          <div class="phone-metric"><div class="pm-label">EXPENSES</div><div class="pm-value">$3.8k</div></div>
          <div class="phone-metric"><div class="pm-label">RUNWAY</div><div class="pm-value">8 mo</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS BAR -->
<div class="stats-bar">
  <div><div class="stat-value"><span>5</span> screens</div><div class="stat-label">Full prototype</div></div>
  <div><div class="stat-value">Warm <span>cream</span></div><div class="stat-label">Light palette</div></div>
  <div><div class="stat-value"><span>Godly</span></div><div class="stat-label">Trend source</div></div>
  <div><div class="stat-value">Mar <span>23</span></div><div class="stat-label">Heartbeat run</div></div>
</div>

<!-- FEATURES -->
<section class="features" id="features">
  <p class="section-eyebrow">What it includes</p>
  <h2 class="section-title">Everything you need to run your business alone.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-name">Daily Overview</div>
      <div class="feature-desc">SILENCIO-inspired editorial large-number treatment of your MTD revenue. A single glance tells you everything — progress bar toward goal, recent transactions below.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≋</div>
      <div class="feature-name">Cash Flow</div>
      <div class="feature-desc">6-month income/expense comparison with grouped bar charts. Savings rate displayed as a single 40px editorial number — luxury treatment of raw data.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-name">Client Intelligence</div>
      <div class="feature-desc">Revenue concentration by client with visual progress bars and invoice status indicators. See at a glance who's driving your business.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⬡</div>
      <div class="feature-name">AI Audio Brief</div>
      <div class="feature-desc">Midday.ai-inspired weekly financial summary — your numbers narrated as a 3-minute audio brief. Finance without reading. Know your business on a walk.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-name">Tax Tracker</div>
      <div class="feature-desc">Quarterly estimated tax management with days-remaining countdown, savings progress bar, deduction totals, and full payment history.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-name">Smart Insights</div>
      <div class="feature-desc">Three AI observations surfaced weekly: revenue trends, overdue alerts, tax projections. Context-aware — not dashboards, intelligence.</div>
    </div>
  </div>
</section>

<!-- QUOTE -->
<div class="quote-section">
  <div class="quote-mark">"</div>
  <div>
    <div class="quote-body">The new wave of one-person companies doesn't need enterprise software. They need <em>clarity</em> — on a single screen, at a glance, every morning.</div>
    <div class="quote-source">Trend observed on godly.website — Midday.ai + SILENCIO · RAM Design Heartbeat · March 2026</div>
  </div>
</div>

<!-- SCREENS -->
<section class="screens-section" id="screens">
  <p class="section-eyebrow">5 Screens</p>
  <h2 class="section-title">Warm light theme. Editorial numerals. Cream palette.</h2>
  <div class="screens-row">
    <div class="screen-card"><div class="screen-icon">◈</div><div class="screen-label">Overview</div></div>
    <div class="screen-card"><div class="screen-icon">≋</div><div class="screen-label">Cash Flow</div></div>
    <div class="screen-card"><div class="screen-icon">◎</div><div class="screen-label">Clients</div></div>
    <div class="screen-card"><div class="screen-icon">⬡</div><div class="screen-label">Insights</div></div>
    <div class="screen-card"><div class="screen-icon">⊞</div><div class="screen-label">Tax</div></div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2 class="cta-title">Less admin.<br>More focus.</h2>
  <p class="cta-sub">View the full 5-screen prototype or explore the interactive Svelte mock.</p>
  <div class="cta-row">
    <a href="/sole-viewer" class="btn-primary">Open Prototype ↗</a>
    <a href="/sole-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span class="footer-brand">SOLE</span>
  <span class="footer-note">RAM Design Heartbeat · March 23, 2026 · Inspired by godly.website</span>
</footer>

</body>
</html>`;

// ══════════════════════════════════════════════════════════════════════════════
// VIEWER (embedded pen)
// ══════════════════════════════════════════════════════════════════════════════
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/renderer.html', 'utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/sole.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ══════════════════════════════════════════════════════════════════════════════
// SVELTE MOCK
// ══════════════════════════════════════════════════════════════════════════════
const design = {
  appName:   'SOLE',
  tagline:   'Financial OS for one-person companies',
  archetype: 'finance-solo',
  palette: {
    bg:      '#1A1520',
    surface: '#28222F',
    text:    '#F5F1EB',
    accent:  '#B8860B',
    accent2: '#4A7C59',
    muted:   'rgba(139,132,153,0.5)',
  },
  lightPalette: {
    bg:      '#F5F1EB',
    surface: '#FFFFFF',
    text:    '#1A1520',
    accent:  '#B8860B',
    accent2: '#4A7C59',
    muted:   'rgba(139,132,153,0.45)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Month-to-Date Revenue', value: '$18,420', sub: '↑ 23% vs last month · 70% to goal' },
        { type: 'metric-row', items: [{ label: 'Invoiced', value: '$6.2k' }, { label: 'Expenses', value: '$3.8k' }, { label: 'Runway', value: '8 mo' }] },
        { type: 'list', items: [
          { icon: 'check', title: 'Stripe — Project Alpha', sub: 'Today, 11:02 AM', badge: '+$4,200' },
          { icon: 'alert', title: 'Figma — Annual Plan', sub: 'Yesterday', badge: '−$576' },
          { icon: 'check', title: 'Notion Labs', sub: 'Mar 22', badge: '+$3,500' },
        ]},
      ],
    },
    {
      id: 'cashflow', label: 'Cash Flow',
      content: [
        { type: 'metric', label: 'Net This Month', value: '+$14,573', sub: 'Income − Expenses' },
        { type: 'progress', items: [
          { label: 'Savings Rate', pct: 79 },
          { label: 'Goal Progress', pct: 70 },
        ]},
        { type: 'metric-row', items: [{ label: 'Income', value: '$18,420' }, { label: 'Expenses', value: '$3,847' }] },
        { type: 'tags', label: 'Period', items: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'] },
      ],
    },
    {
      id: 'clients', label: 'Clients',
      content: [
        { type: 'text', label: 'Quarter Summary', value: '4 active clients · $18,420 total revenue this quarter' },
        { type: 'list', items: [
          { icon: 'star', title: 'Notion Labs', sub: 'Active · 45%', badge: '$8,200' },
          { icon: 'star', title: 'Linear', sub: 'Active · 30%', badge: '$5,500' },
          { icon: 'alert', title: 'Vercel Inc.', sub: 'Invoice Due · 15%', badge: '$2,800' },
          { icon: 'check', title: 'Stripe', sub: 'Paid · 10%', badge: '$1,920' },
        ]},
        { type: 'progress', items: [
          { label: 'Notion Labs', pct: 45 },
          { label: 'Linear', pct: 30 },
          { label: 'Vercel', pct: 15 },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'text', label: 'Weekly Audio Brief', value: 'Mar 17–23 · 3 min 42 sec — tap to listen to your financial summary' },
        { type: 'list', items: [
          { icon: 'chart', title: 'Revenue trending +23%', sub: 'Notion Labs renewal will push past $20K goal', badge: '↑' },
          { icon: 'alert', title: 'Overdue: Vercel $2,800', sub: 'Payment due Mar 20 — 4 days overdue', badge: '!' },
          { icon: 'zap', title: 'Tax set-aside: $4,105', sub: 'Q2 deadline Jun 15 · at current rate', badge: '◆' },
        ]},
      ],
    },
    {
      id: 'tax', label: 'Tax',
      content: [
        { type: 'metric', label: 'Next Estimated Payment', value: '$4,105', sub: 'Due Apr 15 · 23 days remaining' },
        { type: 'progress', items: [{ label: 'Set-aside progress (70%)', pct: 70 }] },
        { type: 'metric', label: 'Deductions YTD', value: '$8,420', sub: 'Est. tax saving: $2,100' },
        { type: 'list', items: [
          { icon: 'check', title: 'Q4 2024', sub: 'Due Jan 15', badge: '$3,620' },
          { icon: 'check', title: 'Q3 2024', sub: 'Due Oct 15', badge: '$2,980' },
          { icon: 'check', title: 'Q2 2024', sub: 'Due Jun 15', badge: '$3,440' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'home'     },
    { id: 'cashflow',  label: 'Cash Flow', icon: 'chart'    },
    { id: 'clients',   label: 'Clients',   icon: 'user'     },
    { id: 'insights',  label: 'Insights',  icon: 'zap'      },
    { id: 'tax',       label: 'Tax',       icon: 'layers'   },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('Publishing SOLE...\n');

  // a) Hero page
  await publish(SLUG, heroHtml, `SOLE — ${TAGLINE}`);
  console.log('✓ Hero: https://ram.zenbin.org/sole');

  // b) Viewer
  await publish(`${SLUG}-viewer`, viewerHtml, 'SOLE — Prototype Viewer');
  console.log('✓ Viewer: https://ram.zenbin.org/sole-viewer');

  // c) Svelte mock
  const svelteSource = generateSvelteComponent(design);
  const mockHtml = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const mockResult = await publishMock(mockHtml, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
  console.log('✓ Mock:', mockResult.url);

  // d) Gallery queue
  const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  const ghReq = (opts, body) => new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', Accept: 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    viewer_url:   `https://ram.zenbin.org/${SLUG}-viewer`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat',
    theme:        'light',
    palette:      'warm-cream-gold',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: Buffer.from(JSON.stringify(queue, null, 2)).toString('base64'),
    sha:     currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      Accept: 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log('✓ Gallery queue:', putRes.status === 200 ? 'OK' : `WARN ${putRes.body.slice(0, 120)}`);

  // e) Design DB
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, newEntry);
    rebuildEmbeddings(db);
    console.log('✓ Indexed in design DB');
  } catch (e) {
    console.warn('  DB index skipped:', e.message);
  }

  console.log('\n✓ SOLE fully published!');
  console.log(`  Hero:   https://ram.zenbin.org/sole`);
  console.log(`  Viewer: https://ram.zenbin.org/sole-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/sole-mock`);
}

main().catch(console.error);
