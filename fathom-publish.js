// fathom-publish.js — Hero page + Viewer for Fathom
const https = require('https');
const fs = require('fs');

const SLUG = 'fathom';
const APP_NAME = 'Fathom';
const TAGLINE = 'See your money with total clarity.';

function publish(slug, title, html) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': 'ram',
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ url: `https://ram.zenbin.org/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fathom — See your money with total clarity.</title>
<meta name="description" content="Fathom is a personal finance clarity app. Track net worth, visualise cash flow, hit your goals, and get AI-powered insights — all in one dark, beautiful interface.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:      #07090F;
  --bg2:     #0D1120;
  --surface: #121729;
  --surfaceGl: #1A2235;
  --text:    #EEF2FF;
  --sub:     #8892B0;
  --accent:  #7C6FF7;
  --accent2: #34D399;
  --accentR: #F87171;
  --accentY: #FBBF24;
  --border:  rgba(124,111,247,0.18);
  --borderD: rgba(238,242,255,0.08);
  --glass:   rgba(255,255,255,0.04);
  --glow:    rgba(124,111,247,0.35);
}
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Ambient glow blobs ── */
.glow-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.glow-1 { width: 500px; height: 500px; background: rgba(124,111,247,0.12); top: -100px; left: -100px; }
.glow-2 { width: 400px; height: 400px; background: rgba(52,211,153,0.08);  top: 200px; right: -80px; }
.glow-3 { width: 350px; height: 350px; background: rgba(251,191,36,0.05);  bottom: 100px; left: 40%; }

/* ── Nav ── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 64px;
  background: rgba(7,9,15,0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--borderD);
}
.nav-logo { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }
.nav-logo span { color: var(--accent); }
.nav-links { display: flex; gap: 36px; }
.nav-links a { text-decoration: none; color: var(--sub); font-size: 14px; font-weight: 500; transition: color 0.2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta {
  background: var(--accent); color: var(--text);
  padding: 10px 22px; border-radius: 100px;
  font-size: 14px; font-weight: 600; text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 0 24px rgba(124,111,247,0.40);
}
.nav-cta:hover { opacity: 0.9; transform: translateY(-1px); }

/* ── Hero ── */
.hero {
  position: relative; z-index: 1;
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(124,111,247,0.12);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 6px 16px;
  font-size: 12px; font-weight: 600; color: var(--accent);
  letter-spacing: 1px;
  margin-bottom: 32px;
  text-transform: uppercase;
}
.hero h1 {
  font-size: clamp(44px, 8vw, 88px);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -2px;
  color: var(--text);
  max-width: 900px;
  margin-bottom: 24px;
}
.hero h1 .gradient {
  background: linear-gradient(135deg, var(--accent) 0%, #A78BFA 40%, var(--accent2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero p {
  font-size: 20px; font-weight: 400; color: var(--sub);
  max-width: 540px; line-height: 1.6; margin-bottom: 48px;
}
.hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 72px; }
.btn-primary {
  background: var(--accent); color: var(--text);
  padding: 16px 36px; border-radius: 100px;
  font-size: 16px; font-weight: 700; text-decoration: none;
  box-shadow: 0 0 40px rgba(124,111,247,0.40);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 56px rgba(124,111,247,0.55); }
.btn-secondary {
  background: var(--glass); color: var(--text);
  border: 1px solid var(--borderD);
  padding: 16px 36px; border-radius: 100px;
  font-size: 16px; font-weight: 600; text-decoration: none;
  backdrop-filter: blur(8px);
  transition: background 0.2s;
}
.btn-secondary:hover { background: rgba(255,255,255,0.08); }

/* ── Phone mockup ── */
.phone-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 80px;
}
.phone-frame {
  width: 280px; height: 580px;
  background: var(--surfaceGl);
  border-radius: 44px;
  border: 1.5px solid var(--border);
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.4),
    0 40px 80px rgba(0,0,0,0.6),
    0 0 60px rgba(124,111,247,0.20);
  overflow: hidden;
  position: relative;
}
.phone-notch {
  width: 80px; height: 28px;
  background: var(--bg);
  border-radius: 0 0 16px 16px;
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  z-index: 2;
}
.phone-screen {
  width: 100%; height: 100%;
  background: linear-gradient(160deg, #0D1120 0%, #07090F 60%);
  display: flex; flex-direction: column;
  padding: 40px 20px 20px;
  position: relative;
  overflow: hidden;
}
.phone-glow-inner {
  position: absolute;
  width: 200px; height: 200px;
  border-radius: 50%;
  filter: blur(50px);
  background: rgba(124,111,247,0.18);
  top: -40px; left: -40px;
  pointer-events: none;
}
.phone-glow-inner-2 {
  position: absolute;
  width: 160px; height: 160px;
  border-radius: 50%;
  filter: blur(40px);
  background: rgba(52,211,153,0.12);
  top: 80px; right: -30px;
  pointer-events: none;
}
.p-label { font-size: 9px; font-weight: 600; color: var(--accent); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px; position: relative; z-index: 1; }
.p-amount { font-size: 32px; font-weight: 800; color: var(--text); letter-spacing: -1px; margin-bottom: 4px; position: relative; z-index: 1; }
.p-delta { font-size: 11px; font-weight: 600; color: var(--accent2); margin-bottom: 20px; position: relative; z-index: 1; }
.p-card {
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--borderD);
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 10px;
  position: relative; z-index: 1;
  backdrop-filter: blur(8px);
}
.p-card-row { display: flex; justify-content: space-between; align-items: center; }
.p-card-name { font-size: 11px; font-weight: 600; color: var(--text); }
.p-card-cat { font-size: 9px; color: var(--sub); margin-top: 2px; }
.p-card-amt-pos { font-size: 12px; font-weight: 700; color: var(--accent2); }
.p-card-amt-neg { font-size: 12px; font-weight: 700; color: var(--accentR); }
.p-card-amt-neu { font-size: 12px; font-weight: 700; color: var(--accentY); }
.p-stat-row { display: flex; gap: 8px; margin-bottom: 20px; position: relative; z-index: 1; }
.p-stat {
  flex: 1; background: rgba(255,255,255,0.04);
  border: 1px solid var(--borderD);
  border-radius: 10px; padding: 8px 10px;
}
.p-stat-val { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
.p-stat-lbl { font-size: 9px; color: var(--sub); }

/* ── Features ── */
.section { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 80px 24px; }
.section-eyebrow {
  font-size: 11px; font-weight: 700; letter-spacing: 2px;
  color: var(--accent); text-transform: uppercase; margin-bottom: 16px; text-align: center;
}
.section-title {
  font-size: clamp(32px, 5vw, 52px); font-weight: 800;
  letter-spacing: -1.5px; color: var(--text);
  text-align: center; margin-bottom: 16px; line-height: 1.1;
}
.section-sub {
  font-size: 18px; color: var(--sub); text-align: center;
  max-width: 520px; margin: 0 auto 64px; line-height: 1.6;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.feature-card {
  background: var(--surfaceGl);
  border: 1px solid var(--borderD);
  border-radius: 24px;
  padding: 36px 32px;
  transition: transform 0.25s, box-shadow 0.25s;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(124,111,247,0.15);
}
.feature-icon {
  width: 52px; height: 52px;
  background: rgba(124,111,247,0.12);
  border: 1px solid var(--border);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; margin-bottom: 20px;
}
.feature-icon.green  { background: rgba(52,211,153,0.12); border-color: rgba(52,211,153,0.30); }
.feature-icon.yellow { background: rgba(251,191,36,0.10); border-color: rgba(251,191,36,0.25); }
.feature-icon.red    { background: rgba(248,113,113,0.10); border-color: rgba(248,113,113,0.25); }
.feature-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
.feature-desc { font-size: 14px; color: var(--sub); line-height: 1.6; }

/* ── Stats ── */
.stats-row {
  display: flex; gap: 2px;
  background: var(--borderD);
  border-radius: 24px;
  overflow: hidden;
  margin: 80px auto;
  max-width: 900px;
}
.stat-block {
  flex: 1; padding: 48px 32px;
  background: var(--surfaceGl);
  text-align: center;
}
.stat-val {
  font-size: 48px; font-weight: 900; letter-spacing: -2px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin-bottom: 8px;
}
.stat-label { font-size: 14px; color: var(--sub); font-weight: 500; }

/* ── CTA Banner ── */
.cta-banner {
  position: relative; z-index: 1;
  background: linear-gradient(135deg, rgba(124,111,247,0.15) 0%, rgba(52,211,153,0.08) 100%);
  border: 1px solid var(--border);
  border-radius: 32px;
  padding: 80px 40px;
  text-align: center;
  max-width: 900px;
  margin: 0 auto 80px;
  overflow: hidden;
}
.cta-banner::before {
  content: '';
  position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
  width: 300px; height: 300px;
  background: rgba(124,111,247,0.20);
  border-radius: 50%; filter: blur(60px);
  pointer-events: none;
}
.cta-banner h2 {
  font-size: clamp(28px, 4vw, 46px); font-weight: 800;
  letter-spacing: -1.5px; color: var(--text);
  margin-bottom: 16px; position: relative;
}
.cta-banner p { font-size: 18px; color: var(--sub); margin-bottom: 40px; position: relative; }

/* ── Footer ── */
footer {
  position: relative; z-index: 1;
  border-top: 1px solid var(--borderD);
  padding: 40px 48px;
  display: flex; justify-content: space-between; align-items: center;
  max-width: 1100px; margin: 0 auto;
}
.footer-logo { font-size: 18px; font-weight: 800; color: var(--text); }
.footer-logo span { color: var(--accent); }
.footer-copy { font-size: 13px; color: var(--sub); }
.footer-link { font-size: 13px; color: var(--sub); text-decoration: none; }
.footer-link:hover { color: var(--text); }

/* ── Responsive ── */
@media (max-width: 640px) {
  nav { padding: 0 24px; }
  .nav-links { display: none; }
  footer { flex-direction: column; gap: 16px; text-align: center; }
  .stats-row { flex-direction: column; }
}
</style>
</head>
<body>

<div class="glow-blob glow-1"></div>
<div class="glow-blob glow-2"></div>
<div class="glow-blob glow-3"></div>

<nav>
  <div class="nav-logo">fathom<span>.</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#insights">Insights</a>
    <a href="#goals">Goals</a>
  </div>
  <a href="https://ram.zenbin.org/fathom-viewer" class="nav-cta">View Design →</a>
</nav>

<section class="hero">
  <div class="hero-badge">⚡ Powered by Fathom Intelligence</div>
  <h1>
    See your money<br>
    with <span class="gradient">total clarity.</span>
  </h1>
  <p>Net worth tracking, cash flow visualisation, goal planning, and AI-powered insights — beautifully unified in one dark, focused interface.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/fathom-viewer" class="btn-primary">Explore the Design</a>
    <a href="https://ram.zenbin.org/fathom-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>

  <!-- Phone mockup -->
  <div class="phone-wrap">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="phone-glow-inner"></div>
        <div class="phone-glow-inner-2"></div>
        <div class="p-label">NET WORTH</div>
        <div class="p-amount">$248,619</div>
        <div class="p-delta">↑ +2.4% this month</div>
        <div class="p-stat-row">
          <div class="p-stat">
            <div class="p-stat-val" style="color:#34D399">$312K</div>
            <div class="p-stat-lbl">Assets</div>
          </div>
          <div class="p-stat">
            <div class="p-stat-val" style="color:#F87171">$63K</div>
            <div class="p-stat-lbl">Debt</div>
          </div>
          <div class="p-stat">
            <div class="p-stat-val" style="color:#FBBF24">$18K</div>
            <div class="p-stat-lbl">Cash</div>
          </div>
        </div>
        <div class="p-card">
          <div class="p-card-row">
            <div>
              <div class="p-card-name">🏠 Rent Payment</div>
              <div class="p-card-cat">Housing · Apr 1</div>
            </div>
            <div class="p-card-amt-neg">–$2,200</div>
          </div>
        </div>
        <div class="p-card">
          <div class="p-card-row">
            <div>
              <div class="p-card-name">💼 Freelance Deposit</div>
              <div class="p-card-cat">Income · Mar 31</div>
            </div>
            <div class="p-card-amt-pos">+$3,500</div>
          </div>
        </div>
        <div class="p-card">
          <div class="p-card-row">
            <div>
              <div class="p-card-name">📈 AAPL Purchase</div>
              <div class="p-card-cat">Investing · Mar 29</div>
            </div>
            <div class="p-card-amt-neu">–$890</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="features">
  <div class="section-eyebrow">Everything you need</div>
  <h2 class="section-title">Finance, finally fathomable.</h2>
  <p class="section-sub">Six views, one unified truth about your financial life.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Net Worth Overview</div>
      <div class="feature-desc">Watch your total net worth grow in real time. Assets, debt, and cash — all at a glance with a 12-month sparkline and live deltas.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon green">◉</div>
      <div class="feature-title">Cash Flow Timeline</div>
      <div class="feature-desc">Weekly income vs spending bars with month-over-month comparisons. Know exactly where your money went before the month ends.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon yellow">◎</div>
      <div class="feature-title">Spending Breakdown</div>
      <div class="feature-desc">Elegant ring chart with category cards. See housing, food, transport, and more — with % changes vs last month.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊙</div>
      <div class="feature-title">Goals Tracker</div>
      <div class="feature-desc">Set savings goals with auto-save rules. Visual progress bars with month projections — Emergency Fund, travel, gadgets, investments.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon green">⚡</div>
      <div class="feature-title">AI Insights</div>
      <div class="feature-desc">Fathom Intelligence detects subscription creep, savings gaps, and spending patterns. Actionable, not just informational.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon red">🔔</div>
      <div class="feature-title">Bills & Subscriptions</div>
      <div class="feature-desc">Upcoming bills with 7-day alerts. Flags unused subscriptions draining your budget — with one-tap review actions.</div>
    </div>
  </div>
</section>

<div class="stats-row" style="position:relative;z-index:1;max-width:1100px;margin:0 auto 80px;padding:0 24px;">
  <div style="display:flex;gap:2px;background:rgba(238,242,255,0.06);border-radius:24px;overflow:hidden;width:100%;">
    <div class="stat-block">
      <div class="stat-val">$248K</div>
      <div class="stat-label">Average net worth tracked</div>
    </div>
    <div class="stat-block">
      <div class="stat-val">11</div>
      <div class="stat-label">Avg subscriptions detected</div>
    </div>
    <div class="stat-block">
      <div class="stat-val">4.8%</div>
      <div class="stat-label">HYSA yield identified</div>
    </div>
    <div class="stat-block">
      <div class="stat-val">3</div>
      <div class="stat-label">Active goals average</div>
    </div>
  </div>
</div>

<div style="position:relative;z-index:1;padding:0 24px;">
  <div class="cta-banner">
    <h2>Ready to fathom your finances?</h2>
    <p>Explore the full 6-screen design prototype or jump into the interactive mock.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
      <a href="https://ram.zenbin.org/fathom-viewer" class="btn-primary">View Full Design</a>
      <a href="https://ram.zenbin.org/fathom-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
  </div>
</div>

<footer>
  <div class="footer-logo">fathom<span>.</span></div>
  <div class="footer-copy">Designed by RAM Design AI · April 2026</div>
  <a href="https://ram.zenbin.org/fathom-viewer" class="footer-link">View Prototype →</a>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ────────────────────────────────────────────────────────────
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fathom — Design Viewer</title>
<script src="https://pencil.dev/viewer/v2.8/viewer.js"><\/script>
</head>
<body style="margin:0;background:#07090F;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div id="pencil-viewer" style="width:390px;height:844px;"></div>
<script>
  if (window.EMBEDDED_PEN) {
    PencilViewer.init({ container: '#pencil-viewer', pen: JSON.parse(window.EMBEDDED_PEN) });
  }
<\/script>
</body>
</html>`;

const penJson = fs.readFileSync('fathom.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing Fathom hero page...');
  const r1 = await publish(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log('✓ Hero:', r1.url);

  console.log('Publishing Fathom viewer...');
  const r2 = await publish(`${SLUG}-viewer`, `${APP_NAME} — Design Viewer`, viewerHtml);
  console.log('✓ Viewer:', r2.url);
}

main().catch(console.error);
