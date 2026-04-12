const https = require('https');
const fs = require('fs');
const path = require('path');

const HOST = 'zenbin.org';
const SUBDOMAIN = 'ram';
const SLUG = 'drift';
const APP_NAME = 'Drift';
const TAGLINE = 'Market intelligence, without the noise';

function publish(slug, html) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
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
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function run() {
  const penJson = fs.readFileSync(path.join(__dirname, 'drift.pen'), 'utf8');

  // ── HERO HTML ──────────────────────────────────────────────────────────
  const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Drift — Market intelligence, without the noise</title>
<meta name="description" content="Track competitors, capture signals, and understand market trends — all in one clean, editorial dashboard.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F6F3EE; --surface: #FDFCFA; --card: #FFFFFF; --border: #E8E3DA;
    --text: #1B1918; --muted: #8C8278; --accent: #E8623A; --accent2: #3B7DD8;
    --green: #2D9D6E; --red: #D04040; --yellow: #D4933A;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; }

  nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid var(--border); background: var(--surface); position: sticky; top: 0; z-index: 100; }
  .logo { font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: var(--text); letter-spacing: -0.5px; }
  .logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { text-decoration: none; color: var(--muted); font-size: 14px; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--text); color: #FFF; padding: 10px 22px; border-radius: 20px; font-size: 14px; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.85; }

  .hero { max-width: 1100px; margin: 0 auto; padding: 80px 40px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: #FEF0E8; color: var(--accent); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 24px; }
  .hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  h1 { font-family: Georgia, serif; font-size: 48px; line-height: 1.15; font-weight: bold; letter-spacing: -1px; color: var(--text); margin-bottom: 20px; }
  h1 em { color: var(--accent); font-style: normal; }
  .hero-sub { font-size: 17px; color: var(--muted); line-height: 1.7; margin-bottom: 36px; }
  .hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .btn-primary { background: var(--accent); color: #FFF; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; transition: opacity 0.2s; }
  .btn-primary:hover { opacity: 0.9; }
  .btn-secondary { color: var(--text); font-size: 14px; text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 2px; }

  .phone-wrap { position: relative; }
  .phone { background: var(--text); border-radius: 44px; padding: 12px; box-shadow: 0 40px 80px rgba(27,25,24,0.18); max-width: 280px; margin: 0 auto; }
  .phone-screen { background: var(--bg); border-radius: 34px; overflow: hidden; }
  .phone-inner { padding: 18px 14px 14px; }
  .phone-status { display: flex; justify-content: space-between; font-size: 10px; color: var(--text); margin-bottom: 6px; font-weight: 600; }
  .phone-logo { font-family: Georgia, serif; font-size: 16px; font-weight: bold; margin-bottom: 3px; }
  .phone-sub { font-size: 9px; color: var(--muted); margin-bottom: 10px; }
  .phone-divider { height: 1px; background: var(--border); margin-bottom: 8px; }
  .phone-label { font-size: 7px; font-weight: 700; letter-spacing: 1.2px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; }
  .pulse-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-bottom: 10px; }
  .pulse-card { background: var(--card); border: 1px solid var(--border); border-radius: 7px; padding: 7px; }
  .pc-label { font-size: 7px; color: var(--muted); margin-bottom: 3px; }
  .pc-val { font-family: Georgia, serif; font-size: 12px; font-weight: bold; }
  .pc-val.up { color: var(--green); }
  .pc-val.down { color: var(--red); }
  .rival-row { display: flex; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border); gap: 7px; }
  .rival-row:last-child { border-bottom: none; }
  .rival-av { width: 24px; height: 24px; background: var(--border); border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; color: var(--muted); flex-shrink: 0; }
  .rival-info { flex: 1; }
  .rival-name { font-size: 10px; font-weight: 600; }
  .rival-sect { font-size: 8px; color: var(--muted); }
  .rival-badge { font-size: 8px; padding: 2px 5px; border-radius: 3px; font-weight: 600; white-space: nowrap; }
  .rb-up { background: #E8F5EF; color: var(--green); }
  .rb-new { background: #FEF0E8; color: var(--accent); }
  .rb-down { background: #FDEEEE; color: var(--red); }
  .rb-flat { background: #F0EDE8; color: var(--muted); }

  .features { max-width: 1100px; margin: 0 auto; padding: 60px 40px; }
  .section-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: var(--muted); text-transform: uppercase; text-align: center; margin-bottom: 12px; }
  h2 { font-family: Georgia, serif; font-size: 36px; text-align: center; margin-bottom: 48px; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feat { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 28px; transition: box-shadow 0.2s; }
  .feat:hover { box-shadow: 0 8px 24px rgba(27,25,24,0.08); }
  .feat-icon { font-size: 22px; margin-bottom: 12px; }
  .feat h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  .feat p { font-size: 13px; color: var(--muted); line-height: 1.65; }

  .signal-strip { background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 48px 40px; }
  .signal-inner { max-width: 1100px; margin: 0 auto; }
  .signal-inner h2 { text-align: left; margin-bottom: 24px; font-size: 28px; }
  .signal-item { display: flex; align-items: center; gap: 16px; padding: 13px 0; border-bottom: 1px solid var(--border); }
  .signal-item:last-child { border-bottom: none; }
  .sig-bar { width: 3px; height: 40px; border-radius: 2px; flex-shrink: 0; }
  .sig-source { font-size: 11px; font-weight: 600; color: var(--muted); width: 90px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.3px; }
  .sig-headline { font-size: 13px; font-weight: 500; flex: 1; }
  .sig-time { font-size: 11px; color: var(--muted); }

  .cta-section { max-width: 560px; margin: 60px auto; text-align: center; padding: 0 40px 80px; }
  .cta-section h2 { font-family: Georgia, serif; font-size: 32px; margin-bottom: 16px; }
  .cta-section p { font-size: 16px; color: var(--muted); margin-bottom: 32px; line-height: 1.7; }
  .cta-section .btn-primary { display: inline-block; font-size: 16px; padding: 16px 36px; }
  .cta-note { font-size: 13px; color: var(--muted); margin-top: 14px; }

  footer { border-top: 1px solid var(--border); padding: 28px 40px; display: flex; justify-content: space-between; align-items: center; background: var(--surface); }
  .footer-logo { font-family: Georgia, serif; font-size: 16px; font-weight: bold; }
  footer p { font-size: 13px; color: var(--muted); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 48px 20px 40px; }
    h1 { font-size: 32px; }
    .features-grid { grid-template-columns: 1fr; }
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
    .phone { max-width: 220px; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">drift<span>.</span></div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="#">Docs</a>
  </div>
  <a href="https://ram.zenbin.org/drift-mock" class="nav-cta">Try prototype →</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-badge">LIVE INTELLIGENCE</div>
    <h1>Know your market. <em>Before</em> it moves.</h1>
    <p class="hero-sub">Drift watches your competitors 24/7 — tracking pricing, features, reviews, and press — and surfaces the signals that matter to your strategy.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/drift-mock" class="btn-primary">Explore prototype ☀◑</a>
      <a href="https://ram.zenbin.org/drift-viewer" class="btn-secondary">View in Pencil →</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-screen">
        <div class="phone-inner">
          <div class="phone-status"><span>9:41</span><span>●●●</span></div>
          <div class="phone-logo">drift</div>
          <div class="phone-sub">Market intelligence</div>
          <div class="phone-divider"></div>
          <div class="phone-label">Market Pulse</div>
          <div class="pulse-row">
            <div class="pulse-card"><div class="pc-label">SaaS Index</div><div class="pc-val up">+4.2%</div></div>
            <div class="pulse-card"><div class="pc-label">AI Tools</div><div class="pc-val up">+11.7%</div></div>
            <div class="pulse-card"><div class="pc-label">DevOps</div><div class="pc-val down">-1.3%</div></div>
          </div>
          <div class="phone-label">Tracking</div>
          <div class="rival-row"><div class="rival-av">NO</div><div class="rival-info"><div class="rival-name">Notion</div><div class="rival-sect">Productivity</div></div><span class="rival-badge rb-up">↑ +3 updates</span></div>
          <div class="rival-row"><div class="rival-av">LI</div><div class="rival-info"><div class="rival-name">Linear</div><div class="rival-sect">Dev Tools</div></div><span class="rival-badge rb-new">New pricing</span></div>
          <div class="rival-row"><div class="rival-av">CO</div><div class="rival-info"><div class="rival-name">Coda</div><div class="rival-sect">Productivity</div></div><span class="rival-badge rb-down">↓ -2.1%</span></div>
          <div class="rival-row"><div class="rival-av">OB</div><div class="rival-info"><div class="rival-name">Obsidian</div><div class="rival-sect">Knowledge</div></div><span class="rival-badge rb-flat">→ No change</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features">
  <p class="section-label">Built for strategists</p>
  <h2>Everything you need to stay ahead</h2>
  <div class="features-grid">
    <div class="feat"><div class="feat-icon">◉</div><h3>Competitor Tracking</h3><p>Monitor pricing, feature releases, job posts, reviews, and press mentions across every rival in your market.</p></div>
    <div class="feat"><div class="feat-icon">◬</div><h3>Trend Analysis</h3><p>Visualise 6-month market share shifts, category momentum, and competitive velocity in clean editorial charts.</p></div>
    <div class="feat"><div class="feat-icon">◈</div><h3>Battle Cards</h3><p>One-click battle card generation for sales teams — current positioning, win/loss data, and recommended talk tracks.</p></div>
    <div class="feat"><div class="feat-icon">◯</div><h3>Smart Alerts</h3><p>Set thresholds on any metric — price changes, review score drops, new funding rounds — and get notified instantly.</p></div>
    <div class="feat"><div class="feat-icon">◆</div><h3>Signal Feed</h3><p>A real-time intelligence feed pulling from TechCrunch, Product Hunt, Hacker News, G2, and GitHub — filtered to your market.</p></div>
    <div class="feat"><div class="feat-icon">◎</div><h3>Weekly Digests</h3><p>Auto-generated reports every Monday — 12-page narrative summaries of everything that moved last week.</p></div>
  </div>
</section>

<section class="signal-strip">
  <div class="signal-inner">
    <h2>Live signal feed</h2>
    <div>
      <div class="signal-item"><div class="sig-bar" style="background:#D04040"></div><div class="sig-source">TechCrunch</div><div class="sig-headline">Notion acquires Clay CRM for undisclosed sum</div><div class="sig-time">2h ago</div></div>
      <div class="signal-item"><div class="sig-bar" style="background:#D4933A"></div><div class="sig-source">Product Hunt</div><div class="sig-headline">Linear launches Cycles 2.0 — sprint planning overhaul</div><div class="sig-time">4h ago</div></div>
      <div class="signal-item"><div class="sig-bar" style="background:#8C8278"></div><div class="sig-source">Hacker News</div><div class="sig-headline">Ask HN: Is Obsidian losing to Notion AI?</div><div class="sig-time">6h ago</div></div>
      <div class="signal-item"><div class="sig-bar" style="background:#D4933A"></div><div class="sig-source">G2 Reviews</div><div class="sig-headline">340 new reviews for Coda — avg 3.9★ (−0.2)</div><div class="sig-time">8h ago</div></div>
      <div class="signal-item"><div class="sig-bar" style="background:#8C8278"></div><div class="sig-source">GitHub</div><div class="sig-headline">Linear CLI hits 10K stars — fastest growing in Dev Tools</div><div class="sig-time">12h ago</div></div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2>Never be caught off guard again.</h2>
  <p>Join teams that use Drift to turn market chaos into clear, actionable intelligence.</p>
  <a href="https://ram.zenbin.org/drift-mock" class="btn-primary">Try the prototype</a>
  <p class="cta-note">No account needed · Interactive mock available</p>
</section>

<footer>
  <div class="footer-logo">drift.</div>
  <p>Designed by RAM · ram.zenbin.org/drift</p>
</footer>
</body>
</html>`;

  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml);
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0, 120));

  // Viewer
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8')
    .replace('<title>Pencil Viewer</title>', '<title>Drift — Prototype</title>');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml);
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0, 120));

  console.log('\nHero:   https://ram.zenbin.org/' + SLUG);
  console.log('Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}

run().catch(console.error);
