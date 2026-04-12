// SPOOL — publish hero page + viewer
// SPOOL: Project Thread Manager for Creative Studios
// Palette: warm cream #F4F1EC · rust #C84A00 · electric indigo #2952E3
'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG        = 'spool';
const VIEWER_SLUG = 'spool-viewer';
const APP_NAME    = 'SPOOL';
const TAGLINE     = 'Project Threads for Creative Studios';

const penJson = fs.readFileSync(path.join(__dirname, 'spool.pen'), 'utf8');

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.end(body || undefined);
  });
}

async function publishToZenbin(slug, html) {
  const body = JSON.stringify({ html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
      'User-Agent': 'ram-heartbeat/1.0',
    },
  }, body);
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<meta name="description" content="SPOOL keeps every creative project on one thread. Task boards, client briefs, time tracking, and file reviews — all connected. Inspired by Midday.ai.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:      #F4F1EC;
    --surface: #FFFFFF;
    --border:  #E5E0D8;
    --fg:      #1A1614;
    --muted:   #9B948A;
    --faint:   #C8C2BC;
    --accent:  #C84A00;
    --accent2: #2952E3;
    --green:   #1A9B5E;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--fg); }
  a { color: var(--accent); text-decoration: none; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 0 24px; }

  /* Nav */
  nav { border-bottom: 1px solid var(--border); padding: 16px 0; background: var(--surface); }
  nav .inner { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
  .wordmark { font-size: 16px; font-weight: 800; letter-spacing: -0.03em; color: var(--fg); }
  .wordmark span { color: var(--accent); }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--muted); }
  .nav-cta { background: var(--accent); color: #fff !important; padding: 8px 18px; border-radius: 8px; }

  /* Hero */
  .hero { padding: 96px 0 80px; }
  .hero-label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
  .hero-display { font-size: 64px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.0; color: var(--fg); margin-bottom: 20px; }
  .hero-display .accent { color: var(--accent); }
  .hero-display .accent2 { color: var(--accent2); }
  .hero-sub { font-size: 17px; color: var(--muted); max-width: 520px; line-height: 1.65; margin-bottom: 40px; }
  .hero-actions { display: flex; gap: 12px; }
  .btn-primary { background: var(--accent); color: #fff; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; }
  .btn-ghost { background: var(--surface); color: var(--fg); border: 1px solid var(--border); padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 500; }

  /* Feature tabs */
  .tabs { display: flex; gap: 4px; margin: 60px 0 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 6px; width: fit-content; }
  .tab { padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: default; color: var(--muted); }
  .tab.active { background: var(--accent); color: #fff; }

  /* Cards */
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px; }
  .card-icon { font-size: 20px; margin-bottom: 12px; }
  .card h3 { font-size: 14px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 6px; }
  .card p { font-size: 13px; color: var(--muted); line-height: 1.5; }
  .card-accent { border-left: 3px solid var(--accent); }
  .card-accent2 { border-left: 3px solid var(--accent2); }
  .card-green { border-left: 3px solid var(--green); }

  /* Stats */
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 48px 0; }
  .stat { text-align: center; }
  .stat-num { font-size: 36px; font-weight: 900; letter-spacing: -0.04em; }
  .stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }

  /* Palette */
  .palette { display: flex; gap: 10px; margin: 40px 0; flex-wrap: wrap; }
  .swatch { border-radius: 10px; padding: 12px 18px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; }

  /* Footer */
  footer { border-top: 1px solid var(--border); padding: 28px 0; margin-top: 80px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  footer p { font-size: 12px; color: var(--faint); }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 12px; color: var(--muted); }

  @media (max-width: 700px) { .cards { grid-template-columns: 1fr; } .stats { grid-template-columns: repeat(2,1fr); } .hero-display { font-size: 42px; } }
</style>
</head>
<body>

<nav>
  <div class="inner">
    <span class="wordmark">SPO<span>OL</span></span>
    <div class="nav-links">
      <a href="https://ram.zenbin.org/spool-viewer">View Design</a>
      <a href="https://ram.zenbin.org/spool-mock">Mock ↗</a>
      <a href="https://ram.zenbin.org" class="nav-cta">Gallery</a>
    </div>
  </div>
</nav>

<div class="wrap">
  <div class="hero">
    <div class="hero-label">RAM Design Heartbeat — Concept No. 45</div>
    <h1 class="hero-display">Every project<br><span class="accent">on one</span> <span class="accent2">thread.</span></h1>
    <p class="hero-sub">SPOOL gives creative studios a single workspace for tasks, briefs, time tracking, and client feedback — without the chaos of juggling 5 tools.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/spool-mock" class="btn-primary">Interactive Mock ✦</a>
      <a href="https://ram.zenbin.org/spool-viewer" class="btn-ghost">Pen Viewer →</a>
    </div>
  </div>

  <div class="tabs">
    <div class="tab active">Tasks</div>
    <div class="tab">Briefs</div>
    <div class="tab">Time</div>
    <div class="tab">Files</div>
    <div class="tab">Clients</div>
  </div>

  <div class="cards">
    <div class="card card-accent">
      <div class="card-icon">◈</div>
      <h3>Thread Board</h3>
      <p>Kanban-style threads per project. Each card holds context, files, and comments — not just a task name.</p>
    </div>
    <div class="card card-accent2">
      <div class="card-icon">⌘</div>
      <h3>Brief Hub</h3>
      <p>Client briefs live alongside tasks. No more hunting through email for the latest version.</p>
    </div>
    <div class="card card-green">
      <div class="card-icon">◷</div>
      <h3>Time Tracker</h3>
      <p>One-tap timers tied directly to threads. Invoicing data built in — no manual entry.</p>
    </div>
    <div class="card" style="border-left:3px solid var(--muted)">
      <div class="card-icon">✦</div>
      <h3>File Review</h3>
      <p>Upload deliverables, get client annotations in-thread. Version history auto-tracked.</p>
    </div>
    <div class="card card-accent">
      <div class="card-icon">◎</div>
      <h3>Studio Dashboard</h3>
      <p>At-a-glance view of all active projects, upcoming deadlines, and team capacity.</p>
    </div>
    <div class="card card-accent2">
      <div class="card-icon">↗</div>
      <h3>Client Portal</h3>
      <p>Lightweight external view for clients to approve work, leave feedback, and track progress.</p>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-num" style="color:var(--accent)">5</div>
      <div class="stat-label">Screens</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:var(--accent2)">3</div>
      <div class="stat-label">Accent Colors</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:var(--green)">Light</div>
      <div class="stat-label">Theme</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:var(--fg)">v2.8</div>
      <div class="stat-label">Pen Format</div>
    </div>
  </div>

  <div class="palette">
    <div class="swatch" style="background:#F4F1EC;border:1px solid #E5E0D8;color:#9B948A">Cream #F4F1EC</div>
    <div class="swatch" style="background:#C84A00;color:#fff">Rust #C84A00</div>
    <div class="swatch" style="background:#2952E3;color:#fff">Indigo #2952E3</div>
    <div class="swatch" style="background:#1A9B5E;color:#fff">Green #1A9B5E</div>
    <div class="swatch" style="background:#1A1614;color:#fff">Near-Black #1A1614</div>
  </div>

  <footer>
    <p>SPOOL concept by <a href="https://ram.zenbin.org">RAM Design Studio</a> · March 2026 · Inspired by Midday.ai (darkmodedesign), Cernel/Cardless (land-book), Awwwards editorial typography</p>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/spool-viewer">View .pen ↗</a>
      <a href="https://ram.zenbin.org/spool-mock">Mock ↗</a>
      <a href="https://ram.zenbin.org">All Designs</a>
    </div>
  </footer>
</div>

</body>
</html>`;

const viewerHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>SPOOL — Pen Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,sans-serif;background:#F4F1EC;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;color:#1A1614}
.card{background:#fff;border:1px solid #E5E0D8;border-radius:20px;padding:48px;text-align:center;max-width:480px;box-shadow:0 8px 32px rgba(0,0,0,0.06)}
h2{font-size:32px;font-weight:900;letter-spacing:-0.04em;margin-bottom:8px;color:#C84A00}
p{font-size:14px;color:#9B948A;line-height:1.6;margin-bottom:24px}
a{color:#C84A00;font-weight:700;text-decoration:none;background:#C84A0015;padding:12px 24px;border-radius:10px;display:inline-block}
</style>
</head>
<body>
<div class="card">
  <h2>SPOOL</h2>
  <p>Project Threads for Creative Studios<br>5 screens · Light theme · Rust + Electric Indigo</p>
  <a href="https://ram.zenbin.org/spool">View Hero Page ↗</a>
</div>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
</body></html>`;

(async () => {
  console.log('Publishing SPOOL hero…');
  const r1 = await publishToZenbin(SLUG, heroHtml);
  console.log(`  Hero: HTTP ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing SPOOL viewer…');
  const r2 = await publishToZenbin(VIEWER_SLUG, viewerHtml);
  console.log(`  Viewer: HTTP ${r2.status} → https://ram.zenbin.org/${VIEWER_SLUG}`);

  if (r1.status === 200 || r1.status === 201) {
    console.log('\n✓ SPOOL published to ram.zenbin.org');
  }
})().catch(console.error);
