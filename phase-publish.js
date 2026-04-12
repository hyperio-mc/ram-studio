// phase-publish.js — Hero page + viewer for PHASE
// PHASE: Deep Work Timer for Creative Professionals
// Palette: near-black #080808 · orange-red #F24E1E · yellow #FFD60A
'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG        = 'phase';
const VIEWER_SLUG = 'phase-viewer';
const APP_NAME    = 'PHASE';
const TAGLINE     = 'Time as an instrument. Work in phases.';
const ARCHETYPE   = 'deep-work-timer-dark';

const penJson = fs.readFileSync(path.join(__dirname, 'phase.pen'), 'utf8');

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.end(body); else r.end();
  });
}

async function publishToZenbin(slug, html, subdomain = 'ram') {
  const body = JSON.stringify({ html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
      'User-Agent': 'ram-heartbeat/1.0',
    },
  }, body);
}

// ─── HERO PAGE ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PHASE — ${TAGLINE}</title>
<meta name="description" content="PHASE is a deep work timer for creative professionals. Track your work in discrete phases — writing, review, deep work, rituals. Typography-first dark interface. A RAM design concept.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:       #080808;
    --surface:  #111110;
    --surface2: #1C1B19;
    --border:   #2A2925;
    --border2:  #3A3835;
    --fg:       #F5F1EA;
    --fg2:      #BDB9B2;
    --fg3:      #7A7570;
    --accent:   #F24E1E;
    --yellow:   #FFD60A;
    --green:    #2DB87E;
    --blue:     #3B9EFF;
    --purple:   #8B5CF6;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--fg); }
  a { text-decoration: none; color: var(--accent); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }

  /* Nav */
  nav { border-bottom: 1px solid var(--border); padding: 18px 0; }
  nav .inner { max-width: 920px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
  .wordmark { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; letter-spacing: 0.14em; color: var(--fg); }
  .wordmark span { color: var(--accent); }
  .nav-links { display: flex; gap: 24px; align-items: center; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--fg3); }
  .nav-cta { background: var(--accent); color: #fff !important; padding: 8px 18px; border-radius: 8px; font-weight: 600 !important; }

  /* Hero */
  .hero { padding: 100px 0 80px; }
  .hero-kicker { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; color: var(--accent); margin-bottom: 24px; text-transform: uppercase; }
  .hero-title { font-size: clamp(52px, 8vw, 88px); font-weight: 900; letter-spacing: -0.04em; line-height: 1.0; color: var(--fg); margin-bottom: 24px; }
  .hero-title .timer { color: var(--yellow); font-family: 'JetBrains Mono', monospace; }
  .hero-sub { font-size: 18px; font-weight: 400; color: var(--fg3); max-width: 520px; line-height: 1.65; margin-bottom: 40px; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-primary { background: var(--accent); color: #fff; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; }
  .btn-ghost { background: var(--surface); color: var(--fg); border: 1px solid var(--border2); padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 500; }

  /* Phase type chips */
  .chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 60px 0 40px; }
  .chip { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; padding: 6px 14px; border-radius: 20px; }

  /* Timer showcase */
  .timer-showcase { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 48px; margin: 40px 0; text-align: center; position: relative; overflow: hidden; }
  .timer-showcase::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 100%, rgba(255,214,10,0.06) 0%, transparent 70%); }
  .timer-display { font-family: 'JetBrains Mono', monospace; font-size: clamp(64px, 10vw, 112px); font-weight: 900; color: var(--yellow); letter-spacing: -0.04em; line-height: 1; position: relative; z-index: 1; }
  .timer-phase { font-size: 28px; font-weight: 800; color: var(--fg); margin-bottom: 8px; }
  .timer-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.12em; color: var(--fg3); margin-top: 12px; }

  /* Screens grid */
  .screens { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 40px 0; }
  .screen-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px; }
  .screen-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.10em; color: var(--accent); margin-bottom: 10px; }
  .screen-card h3 { font-size: 15px; font-weight: 700; color: var(--fg); margin-bottom: 6px; }
  .screen-card p { font-size: 13px; color: var(--fg3); line-height: 1.55; }

  /* Quote */
  .quote { border-left: 3px solid var(--accent); padding: 20px 28px; background: var(--surface); border-radius: 0 10px 10px 0; margin: 40px 0; }
  .quote p { font-size: 17px; font-style: italic; color: var(--fg2); line-height: 1.65; }
  .quote cite { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: var(--fg3); margin-top: 10px; display: block; }

  /* Palette */
  .palette { display: flex; gap: 10px; flex-wrap: wrap; margin: 40px 0; }
  .swatch { padding: 12px 20px; border-radius: 10px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; }

  /* Footer */
  footer { border-top: 1px solid var(--border); padding: 28px 0; margin-top: 80px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-l { font-size: 12px; color: var(--fg3); }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 12px; color: var(--fg3); }

  /* Dot texture */
  .dot-texture { position: fixed; inset: 0; background-image: radial-gradient(var(--border) 1px, transparent 1px); background-size: 28px 28px; opacity: 0.35; pointer-events: none; z-index: 0; }
  .content { position: relative; z-index: 1; }

  @media (max-width: 700px) { .screens { grid-template-columns: 1fr 1fr; } .hero-title { font-size: 44px; } .timer-display { font-size: 56px; } }
  @media (max-width: 480px) { .screens { grid-template-columns: 1fr; } }
</style>
</head>
<body>

<div class="dot-texture"></div>
<div class="content">

<nav>
  <div class="inner">
    <span class="wordmark">PH<span>A</span>SE</span>
    <div class="nav-links">
      <a href="https://ram.zenbin.org/phase-viewer">Pen Viewer</a>
      <a href="https://ram.zenbin.org/phase-mock" class="nav-cta">Live Mock ☀◑</a>
    </div>
  </div>
</nav>

<div class="wrap">
  <div class="hero">
    <div class="hero-kicker">RAM Design Heartbeat — Deep Work Timer</div>
    <h1 class="hero-title">Work in<br>phases.<br><span class="timer">01:24:47</span></h1>
    <p class="hero-sub">Your brain isn't a server. It needs contrast. PHASE gives your work discrete units of meaning — not just hours logged, but phases completed.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/phase-mock" class="btn-primary">Interactive Mock ✦</a>
      <a href="https://ram.zenbin.org/phase-viewer" class="btn-ghost">View in Pencil →</a>
    </div>
  </div>

  <div class="chips">
    <span class="chip" style="background:#3B9EFF22;color:#3B9EFF">DEEP WORK</span>
    <span class="chip" style="background:#F24E1E22;color:#F24E1E">REVIEW</span>
    <span class="chip" style="background:#8B5CF622;color:#8B5CF6">RITUAL</span>
    <span class="chip" style="background:#2DB87E22;color:#2DB87E">BREAK</span>
    <span class="chip" style="background:#7A757022;color:#7A7570">ADMIN</span>
  </div>

  <div class="timer-showcase">
    <div class="timer-phase">Writing · Draft 02</div>
    <div class="timer-display">01:24:47</div>
    <div class="timer-label">ELAPSED · 62% OF PLANNED 2H 15M</div>
  </div>

  <div class="quote">
    <p>"Your brain is not a server. It doesn't perform under constant load. It needs contrast to stay precise. Focus and release are different states — they should not compete, they should alternate."</p>
    <cite>— supercommon systems, "time as an instrument"</cite>
  </div>

  <div class="screens">
    <div class="screen-card">
      <div class="screen-num">01 — NOW</div>
      <h3>Active Session</h3>
      <p>Phase name + massive monospace timer. Single-purpose screen. End when done.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">02 — TODAY</div>
      <h3>Day Timeline</h3>
      <p>Color-coded phase rows. Active phase glows orange. Duration in warm off-white.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">03 — LOG</div>
      <h3>Phase Log</h3>
      <p>Chronological history. Left border color = phase type. Duration in large mono.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">04 — PROJECTS</div>
      <h3>Project Hours</h3>
      <p>Each project shows total hours in 44px condensed monospace. Budget progress bar.</p>
    </div>
    <div class="screen-card">
      <div class="screen-num">05 — INSIGHTS</div>
      <h3>Weekly Stats</h3>
      <p>38.2 total hours in editorial 72px display. Day bars + phase type breakdown.</p>
    </div>
    <div class="screen-card" style="border-color: var(--accent)44;">
      <div class="screen-num" style="color:var(--yellow)">DESIGN</div>
      <h3>Typography-First</h3>
      <p>Every screen: display type for numbers, JetBrains Mono for metadata, zero decoration.</p>
    </div>
  </div>

  <div class="palette">
    <div class="swatch" style="background:#080808;border:1px solid #2A2925;color:#7A7570">Canvas #080808</div>
    <div class="swatch" style="background:#F24E1E;color:#fff">Accent #F24E1E</div>
    <div class="swatch" style="background:#FFD60A;color:#080808">Yellow #FFD60A</div>
    <div class="swatch" style="background:#3B9EFF;color:#fff">Blue #3B9EFF</div>
    <div class="swatch" style="background:#2DB87E;color:#fff">Green #2DB87E</div>
    <div class="swatch" style="background:#8B5CF6;color:#fff">Purple #8B5CF6</div>
    <div class="swatch" style="background:#F5F1EA;color:#080808">Warm White</div>
  </div>

</div>

<footer>
  <div class="wrap" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;width:100%">
    <span class="footer-l">PHASE concept by <a href="https://ram.zenbin.org">RAM Design Studio</a> · March 2026 · Inspired by KOMETA font foundry (land-book.com) + supercommon systems</span>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/phase-viewer">View .pen ↗</a>
      <a href="https://ram.zenbin.org/phase-mock">Mock ↗</a>
      <a href="https://ram.zenbin.org/gallery">Gallery</a>
    </div>
  </div>
</footer>

</div>
</body>
</html>`;

// ─── VIEWER ───────────────────────────────────────────────────────────────────
const viewerHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>PHASE — Pen Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,sans-serif;background:#080808;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;color:#F5F1EA}
.card{background:#111110;border:1px solid #2A2925;border-radius:20px;padding:48px;text-align:center;max-width:480px;box-shadow:0 16px 64px rgba(0,0,0,0.6)}
.mono{font-family:'JetBrains Mono',monospace;font-size:36px;font-weight:700;letter-spacing:-0.04em;color:#FFD60A;display:block;margin-bottom:4px}
h2{font-size:28px;font-weight:900;letter-spacing:-0.03em;color:#F24E1E;margin-bottom:8px}
p{font-size:14px;color:#7A7570;line-height:1.6;margin-bottom:24px}
a{color:#F24E1E;font-weight:700;text-decoration:none;background:#F24E1E18;padding:12px 24px;border-radius:10px;display:inline-block}
</style>
</head>
<body>
<div class="card">
  <span class="mono">01:24:47</span>
  <h2>PHASE</h2>
  <p>Deep Work Timer for Creative Professionals<br>5 screens · Dark theme · Typography-first · JetBrains Mono</p>
  <a href="https://ram.zenbin.org/phase">View Hero Page ↗</a>
</div>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
</body></html>`;

// ─── RUN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing PHASE hero…');
  const r1 = await publishToZenbin(SLUG, heroHtml);
  console.log(`  Hero: HTTP ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing PHASE viewer…');
  const r2 = await publishToZenbin(VIEWER_SLUG, viewerHtml);
  console.log(`  Viewer: HTTP ${r2.status} → https://ram.zenbin.org/${VIEWER_SLUG}`);

  if (r1.status === 200 || r1.status === 201) {
    console.log('\n✓ PHASE published to ram.zenbin.org');
  } else {
    console.error('✗ Hero publish failed:', r1.body.slice(0, 100));
    process.exit(1);
  }
})().catch(e => { console.error(e); process.exit(1); });
