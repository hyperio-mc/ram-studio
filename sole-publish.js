// SOLE — Full publishing pipeline
const fs = require('fs');
const https = require('https');

const SLUG = 'sole';
const APP_NAME = 'SOLE';
const TAGLINE = 'Financial OS for one-person companies';
const ARCHETYPE = 'finance-solo';
const ORIGINAL_PROMPT = 'Inspired by Midday.ai\'s "one-person company" trend on godly.website + SILENCIO\'s editorial large-type aesthetic. Light theme finance dashboard for solopreneurs with warm cream palette, editorial display numbers, AI audio brief, cash flow chart, client revenue share, and tax tracker.';

const P = {
  bg:      '#F5F1EB',
  ink:     '#1A1520',
  ink2:    '#3D3847',
  gold:    '#B8860B',
  gold2:   '#D4A017',
  sage:    '#4A7C59',
  rose:    '#C45C6A',
  muted:   '#8B8499',
  border:  '#D8D2C8',
  surface: '#FFFFFF',
};

// ─── ZENBIN HELPER ─────────────────────────────────────────────────────────────
function zenbin(path, method, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'zenbin.org',
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': 'ram',
        ...extraHeaders,
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── HERO PAGE ─────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SOLE — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: ${P.bg};
    --ink: ${P.ink};
    --ink2: ${P.ink2};
    --gold: ${P.gold};
    --gold2: ${P.gold2};
    --sage: ${P.sage};
    --rose: ${P.rose};
    --muted: ${P.muted};
    --border: ${P.border};
    --surface: ${P.surface};
  }

  html { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--ink); }

  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 80px 80px 80px 80px;
    gap: 60px;
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    right: -200px; top: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .hero-left { z-index: 1; }
  .hero-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    color: var(--gold); text-transform: uppercase; margin-bottom: 24px;
  }
  .hero-title {
    font-size: clamp(52px, 6vw, 88px);
    font-weight: 200;
    line-height: 1.0;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 28px;
  }
  .hero-title em { font-style: normal; color: var(--gold); }
  .hero-sub {
    font-size: 18px; font-weight: 300; line-height: 1.6;
    color: var(--ink2); max-width: 420px; margin-bottom: 40px;
  }
  .hero-cta-row { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    display: inline-block; padding: 14px 32px;
    background: var(--ink); color: var(--bg);
    font-size: 13px; font-weight: 600; letter-spacing: 0.05em;
    text-decoration: none; border-radius: 8px;
    transition: background 0.2s;
  }
  .btn-primary:hover { background: var(--gold); }
  .btn-ghost {
    display: inline-block; padding: 14px 24px;
    border: 1px solid var(--border); color: var(--ink2);
    font-size: 13px; text-decoration: none; border-radius: 8px;
    transition: border-color 0.2s;
  }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

  /* ── PHONE MOCKUP ── */
  .hero-right { display: flex; justify-content: center; z-index: 1; }
  .phone-wrap {
    width: 280px; height: 560px;
    background: var(--surface);
    border-radius: 44px;
    border: 8px solid var(--ink);
    box-shadow: 0 40px 100px rgba(26,21,32,0.18), 0 0 0 1px var(--border);
    overflow: hidden;
    position: relative;
  }
  .phone-inner {
    width: 100%; height: 100%;
    background: var(--bg);
    display: flex; flex-direction: column;
    padding: 24px 20px 20px;
    font-size: 11px;
  }
  .phone-status { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 10px; color: var(--ink2); }
  .phone-greeting { font-size: 10px; color: var(--muted); letter-spacing: 0.05em; margin-bottom: 4px; }
  .phone-name { font-size: 22px; font-weight: 200; color: var(--ink); margin-bottom: 16px; }
  .phone-card {
    background: var(--surface); border-radius: 12px; padding: 14px;
    border: 1px solid var(--border); margin-bottom: 10px;
  }
  .phone-card-label { font-size: 8px; font-weight: 600; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 4px; }
  .phone-card-value { font-size: 28px; font-weight: 200; color: var(--ink); line-height: 1.1; }
  .phone-card-sub { font-size: 9px; color: var(--sage); margin-top: 4px; }
  .phone-bar { height: 3px; background: #E4DFD7; border-radius: 2px; margin-top: 8px; overflow: hidden; }
  .phone-bar-fill { height: 100%; background: var(--gold); border-radius: 2px; width: 70%; }
  .phone-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .phone-metric {
    background: var(--surface); border-radius: 10px; padding: 10px;
    border: 1px solid var(--border);
  }
  .phone-metric-label { font-size: 7px; font-weight: 600; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 3px; }
  .phone-metric-value { font-size: 14px; font-weight: 300; color: var(--ink); }

  /* ── STATS BAR ── */
  .stats-bar {
    background: var(--ink); color: var(--bg);
    padding: 32px 80px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 40px;
  }
  .stat-item {}
  .stat-value { font-size: 36px; font-weight: 200; letter-spacing: -0.02em; color: var(--bg); margin-bottom: 4px; }
  .stat-value span { color: var(--gold2); }
  .stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.07em; color: rgba(245,241,235,0.5); text-transform: uppercase; }

  /* ── FEATURES ── */
  .features {
    padding: 100px 80px;
    border-bottom: 1px solid var(--border);
  }
  .section-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    color: var(--gold); text-transform: uppercase; margin-bottom: 20px;
  }
  .section-title {
    font-size: clamp(32px, 4vw, 52px); font-weight: 200; letter-spacing: -0.02em;
    color: var(--ink); margin-bottom: 60px; max-width: 600px;
    line-height: 1.15;
  }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .feature-card {
    background: var(--surface); border-radius: 20px; padding: 36px;
    border: 1px solid var(--border);
    transition: border-color 0.2s, transform 0.2s;
  }
  .feature-card:hover { border-color: var(--gold); transform: translateY(-3px); }
  .feature-icon { font-size: 28px; margin-bottom: 20px; }
  .feature-name { font-size: 17px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
  .feature-desc { font-size: 14px; line-height: 1.65; color: var(--ink2); }

  /* ── QUOTE ── */
  .quote-section {
    padding: 80px;
    background: var(--surface2, ${P.bg});
    border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; gap: 40px;
  }
  .quote-mark { font-size: 80px; font-weight: 200; color: var(--gold); line-height: 0.8; flex-shrink: 0; }
  .quote-body { font-size: 22px; font-weight: 300; line-height: 1.5; color: var(--ink); }
  .quote-source { font-size: 13px; color: var(--muted); margin-top: 16px; }

  /* ── SCREENS PREVIEW ── */
  .screens-section { padding: 100px 80px; border-bottom: 1px solid var(--border); }
  .screens-row {
    display: flex; gap: 24px; overflow-x: auto;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
    padding-bottom: 16px; margin-top: 48px;
  }
  .screen-card {
    flex-shrink: 0; width: 200px; height: 360px;
    background: var(--surface); border-radius: 28px;
    border: 1px solid var(--border);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-size: 13px; color: var(--muted);
  }
  .screen-label { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: var(--ink2); margin-top: 12px; }

  /* ── CTA ── */
  .cta-section {
    padding: 100px 80px; text-align: center;
  }
  .cta-title { font-size: clamp(36px, 5vw, 64px); font-weight: 200; letter-spacing: -0.02em; color: var(--ink); margin-bottom: 20px; line-height: 1.1; }
  .cta-sub { font-size: 18px; color: var(--ink2); margin-bottom: 40px; }

  /* ── FOOTER ── */
  footer {
    padding: 32px 80px; border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: var(--muted);
  }
  .footer-brand { font-weight: 600; color: var(--ink); }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 60px 32px; }
    .hero-right { display: none; }
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

<!-- HERO -->
<section class="hero">
  <div class="hero-left">
    <p class="hero-eyebrow">RAM Design Studio · March 2026</p>
    <h1 class="hero-title">Run lean.<br><em>Know your</em><br>numbers.</h1>
    <p class="hero-sub">SOLE is the financial OS built for the new wave of one-person companies — indie makers, solo founders, freelancers doing serious work alone.</p>
    <div class="hero-cta-row">
      <a href="/sole-viewer" class="btn-primary">View Design ↗</a>
      <a href="/sole-mock" class="btn-ghost">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="phone-wrap">
      <div class="phone-inner">
        <div class="phone-status">
          <span>9:41</span>
          <span>●●● WiFi ▌▌▌</span>
        </div>
        <div class="phone-greeting">MON, 24 MARCH</div>
        <div class="phone-name">Good morning,<br>Alex.</div>
        <div class="phone-card">
          <div class="phone-card-label">MONTH-TO-DATE REVENUE</div>
          <div class="phone-card-value">$18,420</div>
          <div class="phone-card-sub">↑ 23% vs last month</div>
          <div class="phone-bar"><div class="phone-bar-fill"></div></div>
        </div>
        <div class="phone-metrics">
          <div class="phone-metric">
            <div class="phone-metric-label">INVOICED</div>
            <div class="phone-metric-value">$6.2k</div>
          </div>
          <div class="phone-metric">
            <div class="phone-metric-label">EXPENSES</div>
            <div class="phone-metric-value">$3.8k</div>
          </div>
          <div class="phone-metric">
            <div class="phone-metric-label">RUNWAY</div>
            <div class="phone-metric-value">8 mo</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="stat-item">
    <div class="stat-value"><span>5</span> screens</div>
    <div class="stat-label">Full prototype</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">Warm <span>light</span></div>
    <div class="stat-label">Cream palette</div>
  </div>
  <div class="stat-item">
    <div class="stat-value"><span>Godly</span></div>
    <div class="stat-label">Trend source</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">Mar <span>23</span></div>
    <div class="stat-label">Heartbeat run</div>
  </div>
</div>

<!-- FEATURES -->
<section class="features">
  <p class="section-eyebrow">What it includes</p>
  <h2 class="section-title">Everything you need to run your business alone.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-name">Daily Overview</div>
      <div class="feature-desc">Editorial large-number display of month-to-date revenue, with a progress bar toward your monthly goal. Recent transactions at a glance.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≋</div>
      <div class="feature-name">Cash Flow Chart</div>
      <div class="feature-desc">Six-month income vs. expense bar chart. Savings rate displayed as a single editorial number — luxury editorial treatment of raw financial data.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-name">Client Intelligence</div>
      <div class="feature-desc">Revenue concentration by client with progress bars, invoice status indicators, and at-a-glance relationship health.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⬡</div>
      <div class="feature-name">AI Audio Brief</div>
      <div class="feature-desc">Inspired by Midday.ai — your weekly financial summary narrated as audio. Tap play, listen while walking. Finance without reading.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-name">Tax Tracker</div>
      <div class="feature-desc">Quarterly estimated tax payment tracking with days-remaining countdown, deduction totals, and historical payment log.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-name">Smart Insights</div>
      <div class="feature-desc">AI-generated observations: revenue trends, overdue invoices, tax set-aside projections. Context-aware, not just raw data.</div>
    </div>
  </div>
</section>

<!-- QUOTE -->
<div class="quote-section">
  <div class="quote-mark">"</div>
  <div>
    <div class="quote-body">The new wave of one-person companies don't need enterprise software. They need clarity — on a single screen, at a glance, every morning.</div>
    <div class="quote-source">Trend observed on godly.website · March 2026 · RAM Design Heartbeat</div>
  </div>
</div>

<!-- SCREENS PREVIEW -->
<section class="screens-section">
  <p class="section-eyebrow">Design Screens</p>
  <h2 class="section-title">5-screen prototype, warm light theme.</h2>
  <div class="screens-row">
    ${['◈ Overview', '≋ Cash Flow', '◎ Clients', '⬡ Insights', '⊞ Tax'].map((s, i) => `
    <div class="screen-card">
      <span style="font-size:32px;color:var(--gold)">${s.split(' ')[0]}</span>
      <span class="screen-label">${s.split(' ').slice(1).join(' ')}</span>
    </div>`).join('')}
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2 class="cta-title">Less admin.<br>More focus.</h2>
  <p class="cta-sub">View the full prototype or explore the interactive Svelte mock.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="/sole-viewer" class="btn-primary">Open Prototype ↗</a>
    <a href="/sole-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span><span class="footer-brand">RAM</span> · Design Heartbeat · March 23, 2026</span>
  <span>Inspired by Midday.ai + godly.website</span>
</footer>

</body>
</html>`;
}

// ─── VIEWER PAGE ─────────────────────────────────────────────────────────────
function buildViewer(penJson) {
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/renderer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
async function publish(slug, html, title) {
  const res = await zenbin(`/api/pages/${slug}`, 'PUT', { html, title });
  if (res.status === 200 || res.status === 201) {
    console.log(`✓ Published: https://ram.zenbin.org/${slug}`);
    return `https://ram.zenbin.org/${slug}`;
  } else {
    console.error(`✗ Failed ${slug}: ${res.status}`, res.body.slice(0, 200));
    throw new Error(`Publish failed: ${slug}`);
  }
}

async function main() {
  const penJson = fs.readFileSync('sole.pen', 'utf8');

  // a) Hero page
  const heroHtml = buildHero();
  await publish(SLUG, heroHtml, `SOLE — ${TAGLINE}`);

  // b) Viewer
  const viewerHtml = buildViewer(penJson);
  await publish(`${SLUG}-viewer`, viewerHtml, `SOLE Prototype Viewer`);

  console.log('✓ Hero + Viewer published');
}

main().catch(console.error);
