'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG   = 'bloc';
const SUBDOM = 'ram';

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOM,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BLOC — Team Project Health Dashboard</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #EFF2F8;
    --surface: #FFFFFF;
    --surface2: #F6F8FD;
    --text: #1B1B1F;
    --sub: #6B6E7D;
    --accent: #4360F5;
    --accent2: #F5954B;
    --accent3: #31C97E;
    --accent4: #F54B6F;
    --border: #DDE1EE;
  }
  body { font-family: -apple-system, 'Inter', 'Helvetica Neue', sans-serif; background: var(--bg); color: var(--text); }

  /* NAV */
  nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; background: rgba(239,242,248,0.85); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; border-bottom: 1px solid var(--border); }
  .logo { font-size: 22px; font-weight: 800; letter-spacing: -1px; color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { text-decoration: none; color: var(--sub); font-size: 14px; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: #FFF; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; }

  /* HERO */
  .hero { max-width: 1200px; margin: 0 auto; padding: 100px 40px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .hero-tag { display: inline-flex; align-items: center; gap: 6px; background: var(--accent) + '14'; background: rgba(67,96,245,0.1); border: 1px solid rgba(67,96,245,0.3); color: var(--accent); font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 999px; margin-bottom: 24px; letter-spacing: .05em; }
  .hero h1 { font-size: clamp(36px, 5vw, 58px); font-weight: 800; line-height: 1.1; letter-spacing: -2px; color: var(--text); margin-bottom: 20px; }
  .hero h1 span { color: var(--accent); }
  .hero p { font-size: 18px; color: var(--sub); line-height: 1.7; margin-bottom: 36px; max-width: 440px; }
  .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-primary { background: var(--accent); color: #FFF; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
  .btn-secondary { background: var(--surface); color: var(--text); padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; border: 1px solid var(--border); display: inline-flex; align-items: center; gap: 8px; }

  /* PHONE MOCKUP */
  .phone-wrap { display: flex; justify-content: center; align-items: flex-start; }
  .phone { width: 280px; border-radius: 40px; overflow: hidden; box-shadow: 0 40px 80px rgba(67,96,245,0.2), 0 8px 32px rgba(0,0,0,0.1); border: 6px solid var(--surface); background: var(--bg); position: relative; }
  .phone-screen { width: 100%; aspect-ratio: 390/844; background: var(--bg); position: relative; overflow: hidden; }
  /* Simulated screen content */
  .phone-header { background: var(--bg); padding: 16px 16px 0; }
  .phone-hero-card { background: var(--accent); margin: 12px; border-radius: 14px; padding: 16px; color: #FFF; }
  .phone-hero-card .health { font-size: 11px; opacity: .7; margin-bottom: 4px; }
  .phone-hero-card .score { font-size: 32px; font-weight: 800; }
  .phone-hero-card .trend { font-size: 10px; opacity: .65; }
  .phone-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 0 12px; }
  .phone-tile { background: var(--surface); border-radius: 12px; padding: 12px; }
  .phone-tile .tile-label { font-size: 9px; color: var(--sub); }
  .phone-tile .tile-val { font-size: 22px; font-weight: 800; margin-top: 4px; }
  .phone-tile .tile-sub { font-size: 9px; color: var(--sub); margin-top: 2px; }
  .phone-project { background: var(--surface); margin: 6px 12px; border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; }
  .proj-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .proj-info { flex: 1; }
  .proj-info .pname { font-size: 11px; font-weight: 600; }
  .proj-info .pmeta { font-size: 9px; color: var(--sub); }
  .proj-badge { font-size: 9px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
  .phone-nav { background: var(--surface); padding: 10px 0 6px; display: flex; justify-content: space-around; border-top: 1px solid var(--border); }
  .phone-nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 9px; color: var(--sub); }
  .phone-nav-item.active { color: var(--accent); }
  .phone-nav-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .phone-nav-item.active .phone-nav-icon { background: var(--accent); color: #FFF; }

  /* FEATURES */
  .features { max-width: 1200px; margin: 0 auto; padding: 80px 40px; }
  .features h2 { font-size: 36px; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 12px; }
  .features .subtitle { color: var(--sub); font-size: 16px; margin-bottom: 52px; max-width: 500px; }
  .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feat-card { background: var(--surface); border-radius: 20px; padding: 32px; border: 1px solid var(--border); transition: transform .2s, box-shadow .2s; }
  .feat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(67,96,245,0.1); }
  .feat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
  .feat-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
  .feat-card p { color: var(--sub); font-size: 14px; line-height: 1.65; }

  /* BENTO SECTION */
  .bento-section { max-width: 1200px; margin: 0 auto; padding: 0 40px 80px; }
  .bento-section h2 { font-size: 36px; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 48px; }
  .bento-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: auto auto; gap: 16px; }
  .bento-card { background: var(--surface); border-radius: 20px; padding: 28px; border: 1px solid var(--border); }
  .bento-card.wide { grid-column: span 2; }
  .bento-card.accent { background: var(--accent); border-color: var(--accent); color: #FFF; }
  .bento-card.accent .bento-label { color: rgba(255,255,255,0.65); }
  .bento-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--sub); margin-bottom: 12px; }
  .bento-big { font-size: 52px; font-weight: 800; letter-spacing: -3px; line-height: 1; }
  .bento-mid { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .bento-sub { font-size: 13px; color: var(--sub); margin-top: 6px; }
  .bento-card.accent .bento-sub { color: rgba(255,255,255,0.6); }
  .status-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .status-chip { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }

  /* CTA */
  .cta-section { background: var(--accent); margin: 0 40px 80px; border-radius: 28px; padding: 80px 60px; text-align: center; color: #FFF; max-width: 1120px; margin: 0 auto 80px; }
  .cta-section h2 { font-size: 42px; font-weight: 800; letter-spacing: -2px; margin-bottom: 16px; }
  .cta-section p { font-size: 18px; opacity: .75; margin-bottom: 36px; }
  .cta-btn { background: #FFF; color: var(--accent); padding: 16px 36px; border-radius: 12px; font-weight: 700; font-size: 16px; text-decoration: none; display: inline-block; }

  /* FOOTER */
  footer { text-align: center; padding: 40px; color: var(--sub); font-size: 13px; border-top: 1px solid var(--border); }
  footer span { color: var(--accent); font-weight: 700; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 60px 20px 40px; }
    .feat-grid { grid-template-columns: 1fr; }
    .bento-grid { grid-template-columns: 1fr 1fr; }
    .bento-card.wide { grid-column: span 2; }
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">BLOC</div>
  <div class="nav-links">
    <a href="#">Dashboard</a>
    <a href="#">Projects</a>
    <a href="#">Team</a>
    <a href="#">Reports</a>
  </div>
  <a href="https://ram.zenbin.org/bloc-mock" class="nav-cta">Try Mock →</a>
</nav>

<section class="hero">
  <div>
    <div class="hero-tag">🟢 Inspired by herding.app × ZettaJoule</div>
    <h1>Every project.<br>Every team.<br><span>One grid.</span></h1>
    <p>BLOC gives your team a bento-grid view of project health — sprint progress, blockers, team pulse, and retrospective insights, all in one visual space.</p>
    <div class="hero-btns">
      <a href="https://ram.zenbin.org/bloc-viewer" class="btn-primary">View Design ↗</a>
      <a href="https://ram.zenbin.org/bloc-mock" class="btn-secondary">☀ Interactive Mock</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-screen">
        <div class="phone-header">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 0;">
            <span style="font-size:13px;font-weight:800;color:#4360F5;">BLOC</span>
            <div style="width:32px;height:32px;border-radius:50%;background:#4360F5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;">M</div>
          </div>
          <div style="font-size:10px;color:#6B6E7D;margin-bottom:8px;">Good morning, Maya</div>
        </div>
        <div class="phone-hero-card">
          <div class="health">Team Health</div>
          <div class="score">84%</div>
          <div class="trend">↑ 6% from last sprint</div>
        </div>
        <div class="phone-grid">
          <div class="phone-tile"><div class="tile-label">Active</div><div class="tile-val" style="color:#4360F5;">12</div><div class="tile-sub">projects</div></div>
          <div class="phone-tile"><div class="tile-label">Blockers</div><div class="tile-val" style="color:#F54B6F;">3</div><div class="tile-sub">need attention</div></div>
        </div>
        <div class="phone-project"><div class="proj-dot" style="background:#31C97E;"></div><div class="proj-info"><div class="pname">Meridian App</div><div class="pmeta">iOS · 8 members</div></div><div class="proj-badge" style="background:#EBFBF2;color:#31C97E;">On track</div></div>
        <div class="phone-project"><div class="proj-dot" style="background:#F5954B;"></div><div class="proj-info"><div class="pname">Atlas Dashboard</div><div class="pmeta">Web · 5 members</div></div><div class="proj-badge" style="background:#FFF3E8;color:#F5954B;">At risk</div></div>
        <div class="phone-project"><div class="proj-dot" style="background:#F54B6F;"></div><div class="proj-info"><div class="pname">Relay API v3</div><div class="pmeta">API · 4 members</div></div><div class="proj-badge" style="background:#FEECEE;color:#F54B6F;">Blocked</div></div>
        <div class="phone-nav">
          <div class="phone-nav-item active"><div class="phone-nav-icon">⊞</div>Grid</div>
          <div class="phone-nav-item"><div class="phone-nav-icon">◧</div>Proj</div>
          <div class="phone-nav-item"><div class="phone-nav-icon">◉</div>Team</div>
          <div class="phone-nav-item"><div class="phone-nav-icon">▤</div>Reports</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features">
  <h2>Built for how teams actually work</h2>
  <p class="subtitle">Async standups, sprint health, and blockers in a single spatial canvas.</p>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background:#EBF0FF;">⊞</div>
      <h3>Bento Grid Dashboard</h3>
      <p>All your active projects as interactive health tiles. Scan your entire portfolio at a glance — no context switching required.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#EBFBF2;">◉</div>
      <h3>Live Team Pulse</h3>
      <p>See who's online, what they're working on, and any blockers — all in real time. Fewer pings, better awareness.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#FFF3E8;">▤</div>
      <h3>Sprint Intelligence</h3>
      <p>Burndown charts, velocity tracking, and retrospective highlights automatically synthesized each sprint close.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#FEECEE;">⚑</div>
      <h3>Blocker Detection</h3>
      <p>BLOC surfaces blockers before they stall sprints. Color-coded signals show risk at every level of the project tree.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#EBF0FF;">✓</div>
      <h3>Quick Check-ins</h3>
      <p>30-second async standups with mood tracking and blocker flags. Replaces daily scrums with minimal friction.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:#F6F8FD;">⟳</div>
      <h3>Integrations</h3>
      <p>Syncs with Jira, Linear, GitHub, and Figma. BLOC aggregates your team's work — wherever it lives.</p>
    </div>
  </div>
</section>

<section class="bento-section">
  <h2>Every metric that matters</h2>
  <div class="bento-grid">
    <div class="bento-card accent wide">
      <div class="bento-label">Team Health Score</div>
      <div class="bento-big">84%</div>
      <div class="bento-sub">↑ 6% improvement vs last sprint</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Active Projects</div>
      <div class="bento-mid" style="color:#4360F5;">12</div>
      <div class="bento-sub">Across 4 squads</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Current Blockers</div>
      <div class="bento-mid" style="color:#F54B6F;">3</div>
      <div class="bento-sub">Need immediate attention</div>
    </div>
    <div class="bento-card wide">
      <div class="bento-label">Sprint 14 Progress</div>
      <div class="bento-mid">18 / 25 <span style="font-size:16px;font-weight:400;color:#6B6E7D;">tasks done</span></div>
      <div style="background:#E8ECF5;border-radius:6px;height:8px;margin-top:12px;overflow:hidden;">
        <div style="background:#4360F5;width:72%;height:100%;border-radius:6px;"></div>
      </div>
      <div class="bento-sub" style="margin-top:8px;">Sprint ends in 4 days</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Project Status</div>
      <div class="status-row">
        <div class="status-chip" style="background:#EBFBF2;color:#31C97E;">8 On track</div>
        <div class="status-chip" style="background:#FFF3E8;color:#F5954B;">3 At risk</div>
        <div class="status-chip" style="background:#FEECEE;color:#F54B6F;">1 Blocked</div>
      </div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Velocity</div>
      <div class="bento-mid" style="color:#31C97E;">92 <span style="font-size:14px;font-weight:400;color:#6B6E7D;">pts</span></div>
      <div class="bento-sub">Highest this quarter</div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2>Ship with full visibility.</h2>
  <p>Join teams who replaced endless standups with one beautiful grid.</p>
  <a href="https://ram.zenbin.org/bloc-mock" class="cta-btn">Explore Interactive Mock</a>
</section>

<footer>
  Designed by <span>RAM</span> · Inspired by herding.app (Godly #966) × ZettaJoule (Awwwards) · ram.zenbin.org/bloc
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/lore-viewer.html', 'utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/bloc.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero page...');
  const r1 = await zenPublish(SLUG, heroHtml, 'BLOC — Team Project Health Dashboard');
  console.log('Hero:', r1.status, r1.body.slice(0, 80));

  console.log('Publishing viewer...');
  const r2 = await zenPublish(SLUG + '-viewer', viewerHtml, 'BLOC — Design Viewer');
  console.log('Viewer:', r2.status, r2.body.slice(0, 80));
})();
