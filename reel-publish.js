// reel-publish.js — publish REEL hero page + viewer to ram.zenbin.org
const fs = require('fs');
const https = require('https');

const SLUG = 'reel';
const APP_NAME = 'REEL';
const TAGLINE = 'Shot lists, schedules, and wrap reports for indie filmmakers.';
const SUBDOMAIN = 'ram';

function deploy(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ raw: d, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero page ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>REEL — Shot lists, schedules, and wrap reports for indie filmmakers.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0D0D0D;
  --surf:#181818;
  --surf2:#222222;
  --surf3:#2A2A2A;
  --text:#F0EDE5;
  --text2:#8A8480;
  --text3:#5A5450;
  --accent:#D4A24F;
  --accent2:#E84545;
  --accent3:#4A9EFF;
  --accent-dim:rgba(212,162,79,0.12);
  --accent-med:rgba(212,162,79,0.22);
  --red-dim:rgba(232,69,69,0.14);
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Space Grotesk',system-ui,sans-serif;line-height:1.5;overflow-x:hidden}

nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;border-bottom:1px solid var(--surf2);position:sticky;top:0;background:rgba(13,13,13,0.92);backdrop-filter:blur(16px);z-index:100}
.logo{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;letter-spacing:0.15em;color:var(--text)}
.logo span{color:var(--accent)}
nav a{text-decoration:none;color:var(--text2);font-size:13px;margin-left:28px;letter-spacing:0.06em;text-transform:uppercase;transition:color 0.2s;font-weight:500}
nav a:hover{color:var(--text)}
.cta-btn{background:var(--accent);color:var(--bg);border:none;padding:9px 22px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;margin-left:32px;transition:opacity 0.2s;text-decoration:none;letter-spacing:0.1em;text-transform:uppercase;font-family:'Space Grotesk',sans-serif}
.cta-btn:hover{opacity:0.85}

/* Hero */
.hero{position:relative;overflow:hidden;padding:120px 48px 100px;text-align:center;border-bottom:1px solid var(--surf2)}
.hero-stripe{position:absolute;top:0;left:0;right:0;height:6px;background:repeating-linear-gradient(90deg,var(--accent2) 0,var(--accent2) 40px,var(--bg) 40px,var(--bg) 80px)}
.hero-stripe-b{position:absolute;bottom:0;left:0;right:0;height:3px;background:repeating-linear-gradient(90deg,var(--surf3) 0,var(--surf3) 20px,transparent 20px,transparent 40px)}

.badge{display:inline-flex;align-items:center;gap:8px;background:var(--red-dim);color:var(--accent2);padding:6px 18px;border-radius:3px;font-size:11px;font-weight:700;margin-bottom:48px;letter-spacing:0.1em;text-transform:uppercase;font-family:'Space Mono',monospace;border:1px solid rgba(232,69,69,0.2)}
.badge-dot{width:7px;height:7px;border-radius:50%;background:var(--accent2);animation:rec 1.4s ease-in-out infinite}
@keyframes rec{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.8)}}

h1{font-size:clamp(52px,8vw,112px);font-weight:700;line-height:0.9;letter-spacing:-0.02em;margin-bottom:32px;color:var(--text);text-transform:uppercase}
h1 .film{color:var(--accent);font-style:italic;font-family:'Space Mono',monospace;display:block}
.hero-sub{font-size:18px;color:var(--text2);max-width:540px;margin:0 auto 52px;line-height:1.65;font-weight:300}
.hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:var(--bg);padding:14px 36px;border-radius:4px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;transition:opacity 0.2s}
.btn-primary:hover{opacity:0.85}
.btn-outline{background:transparent;color:var(--text2);padding:14px 36px;border-radius:4px;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;border:1px solid var(--surf3);transition:all 0.2s}
.btn-outline:hover{border-color:var(--text3);color:var(--text)}

/* Clapperboard visual */
.clap-wrap{max-width:800px;margin:80px auto 0;border-radius:8px;overflow:hidden;border:1px solid var(--surf2)}
.clap-stripe{height:32px;background:repeating-linear-gradient(90deg,var(--bg) 0,var(--bg) 40px,var(--surf3) 40px,var(--surf3) 80px)}
.clap-body{background:var(--surf);padding:32px 40px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;border-top:3px solid var(--accent)}
.clap-field{border-right:1px solid var(--surf2);padding-right:24px}
.clap-field:last-child{border:none;padding:0}
.clap-label{font-family:'Space Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px}
.clap-value{font-family:'Space Mono',monospace;font-size:28px;font-weight:700;color:var(--text);letter-spacing:-0.01em}
.clap-value.gold{color:var(--accent)}
.clap-value.red{color:var(--accent2)}
.clap-bottom{background:var(--surf2);padding:12px 40px;font-family:'Space Mono',monospace;font-size:11px;color:var(--text3);letter-spacing:0.1em;display:flex;justify-content:space-between}

/* Section */
.section{max-width:960px;margin:0 auto;padding:80px 48px}
.section-label{font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.section-title{font-size:clamp(32px,5vw,56px);font-weight:700;line-height:1.05;letter-spacing:-0.02em;margin-bottom:56px;text-transform:uppercase}
.section-title span{color:var(--accent)}

/* Feature grid */
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
.feat-card{background:var(--surf);border-radius:8px;padding:28px 24px;border:1px solid var(--surf2);transition:border-color 0.2s}
.feat-card:hover{border-color:var(--surf3)}
.feat-icon{font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:var(--accent);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;padding:6px 14px;background:var(--accent-dim);border-radius:3px;display:inline-block}
.feat-title{font-size:16px;font-weight:700;letter-spacing:-0.01em;margin-bottom:10px}
.feat-body{font-size:14px;color:var(--text2);line-height:1.65;font-weight:300}

/* Shot list preview */
.shot-list{display:flex;flex-direction:column;gap:10px;margin-top:40px}
.shot-row{display:grid;grid-template-columns:56px 1fr auto;gap:0;background:var(--surf);border-radius:8px;overflow:hidden;border:1px solid var(--surf2)}
.shot-num{background:var(--surf2);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px 0;border-right:1px solid var(--surf3)}
.shot-num .sc{font-family:'Space Mono',monospace;font-size:8px;color:var(--text3);letter-spacing:0.1em;text-transform:uppercase}
.shot-num .letter{font-family:'Space Mono',monospace;font-size:22px;font-weight:700;color:var(--text);line-height:1}
.shot-num.done{background:var(--accent-dim)}
.shot-num.done .letter{color:var(--accent)}
.shot-content{padding:12px 16px}
.shot-type{font-size:12px;font-weight:700;letter-spacing:0.04em;margin-bottom:4px}
.shot-desc{font-size:12px;color:var(--text2);font-weight:300}
.shot-chips{display:flex;gap:6px;margin-top:8px}
.chip{font-family:'Space Mono',monospace;font-size:10px;color:var(--text3);background:var(--surf3);padding:3px 10px;border-radius:3px}
.shot-status{padding:12px 16px;display:flex;align-items:center;justify-content:center}
.check{width:24px;height:24px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--accent);font-weight:700}
.empty-check{width:24px;height:24px;border-radius:50%;border:1px solid var(--surf3)}

/* Stats */
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.stat-card{background:var(--surf);border-radius:8px;padding:32px 28px;border:1px solid var(--surf2);border-top:3px solid}
.stat-card:nth-child(1){border-top-color:var(--accent)}
.stat-card:nth-child(2){border-top-color:var(--accent2)}
.stat-card:nth-child(3){border-top-color:var(--accent3)}
.stat-num{font-family:'Space Mono',monospace;font-size:40px;font-weight:700;line-height:1;margin-bottom:12px}
.stat-label{font-size:13px;color:var(--text2);line-height:1.55;font-weight:300}

/* Scenes */
.scenes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-top:40px}
.sc-card{background:var(--surf);border-radius:6px;padding:16px;border:1px solid var(--surf2)}
.sc-num{font-family:'Space Mono',monospace;font-size:11px;color:var(--text3);margin-bottom:6px;letter-spacing:0.06em}
.sc-int{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px}
.sc-loc{font-size:12px;color:var(--text2);font-weight:300;margin-bottom:10px;line-height:1.4}
.sc-bar{height:3px;background:var(--surf3);border-radius:2px;margin-bottom:6px;overflow:hidden}
.sc-bar-fill{height:100%;border-radius:2px}
.sc-shots{font-family:'Space Mono',monospace;font-size:10px;color:var(--text3)}

/* Timeline */
.timeline-wrap{background:var(--surf);border-radius:8px;padding:32px;border:1px solid var(--surf2);margin-top:40px}
.tl-row{display:grid;grid-template-columns:60px 16px 1fr auto;gap:12px;align-items:center;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--surf2)}
.tl-row:last-child{border:none;margin:0;padding:0}
.tl-time{font-family:'Space Mono',monospace;font-size:12px;color:var(--text3)}
.tl-time.now{color:var(--accent2);font-weight:700}
.tl-dot{width:12px;height:12px;border-radius:50%;background:var(--surf3)}
.tl-dot.now{background:var(--accent2);box-shadow:0 0 0 3px rgba(232,69,69,0.2)}
.tl-dot.gold{background:var(--accent)}
.tl-dot.blue{background:var(--accent3)}
.tl-label{font-size:13px;font-weight:600;letter-spacing:-0.01em}
.tl-sub{font-size:12px;color:var(--text2);font-weight:300;margin-top:2px}
.tl-label.now-text{color:var(--text)}
.tl-dur{font-family:'Space Mono',monospace;font-size:11px;color:var(--text3);background:var(--surf2);padding:3px 8px;border-radius:3px}
.tl-dur.now{color:var(--accent2);background:rgba(232,69,69,0.12)}

/* CTA */
.cta-section{background:var(--surf);border-top:1px solid var(--surf2);border-bottom:1px solid var(--surf2);padding:80px 48px;text-align:center}
.cta-clap{font-family:'Space Mono',monospace;font-size:clamp(40px,8vw,96px);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text);margin-bottom:12px}
.cta-sub{font-size:16px;color:var(--text2);margin-bottom:40px;font-weight:300}
.cta-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-light{background:var(--accent);color:var(--bg);padding:14px 36px;border-radius:4px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;transition:opacity 0.2s}
.btn-light:hover{opacity:0.85}
.btn-dark{background:transparent;color:var(--text2);padding:14px 36px;border-radius:4px;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;border:1px solid var(--surf3);transition:all 0.2s}
.btn-dark:hover{color:var(--text);border-color:var(--surf3)}

footer{padding:32px 48px;border-top:1px solid var(--surf2);display:flex;justify-content:space-between;align-items:center;font-family:'Space Mono',monospace;font-size:11px;color:var(--text3);letter-spacing:0.06em;flex-wrap:wrap;gap:12px}
footer a{color:var(--accent);text-decoration:none}
footer a:hover{color:var(--text)}

@media(max-width:640px){
  nav{padding:16px 20px}
  .hero{padding:80px 20px 60px}
  .section{padding:56px 20px}
  .stats-row{grid-template-columns:1fr}
  .shot-list{gap:8px}
  footer{padding:24px 20px}
  .cta-section{padding:60px 20px}
}
</style>
</head>
<body>

<nav>
  <div class="logo">RE<span>EL</span></div>
  <div>
    <a href="#features">Features</a>
    <a href="#shots">Shot List</a>
    <a href="#schedule">Schedule</a>
    <a href="https://ram.zenbin.org/reel-viewer" class="cta-btn">View Prototype</a>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-stripe"></div>
  <div class="badge"><span class="badge-dot"></span> REC · Production Tool for Indie Filmmakers</div>
  <h1>Every<br><span class="film">Great Film</span><br>Starts Here.</h1>
  <p class="hero-sub">REEL keeps your shot list, scene breakdown, daily schedule, and wrap reports in one cinematic dark interface. Stop managing spreadsheets — start directing.</p>
  <div class="hero-btns">
    <a href="https://ram.zenbin.org/reel-viewer" class="btn-primary">View Prototype</a>
    <a href="https://ram.zenbin.org/reel-mock" class="btn-outline">Interactive Mock ◑</a>
  </div>

  <!-- Clapperboard visual -->
  <div class="clap-wrap">
    <div class="clap-stripe"></div>
    <div class="clap-body">
      <div class="clap-field">
        <div class="clap-label">Production</div>
        <div class="clap-value">DESERT<br>RUN</div>
      </div>
      <div class="clap-field">
        <div class="clap-label">Scene / Shot</div>
        <div class="clap-value gold">12 / D</div>
      </div>
      <div class="clap-field">
        <div class="clap-label">Status</div>
        <div class="clap-value red">FILMING</div>
      </div>
    </div>
    <div class="clap-bottom">
      <span>EXT · CANYON FLOOR · DAY</span>
      <span>AERIAL · DRONE · FLY DOWN · 0:08</span>
    </div>
  </div>
  <div class="hero-stripe-b"></div>
</section>

<!-- Features -->
<section class="section" id="features">
  <div class="section-label">Why REEL</div>
  <div class="section-title">Built for the<br><span>craft of cinema.</span></div>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">◧  Shot List</div>
      <div class="feat-title">Clapperboard Cards</div>
      <div class="feat-body">Each shot lives in a styled clapperboard card — scene number, shot type, lens, movement, duration. Approve shots on-set with a tap. Inspired by MICRODOT's editorial boldness.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">≡  Breakdown</div>
      <div class="feat-title">Scene by Scene</div>
      <div class="feat-body">Filter scenes by shoot day, location, or time of day. INT/EXT badges, progress bars per scene, and quick-jump to any shot list. No spreadsheet needed.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◷  Schedule</div>
      <div class="feat-title">Daily Call Sheet</div>
      <div class="feat-body">Timeline view with call times, location, crew blocks, and weather strip. Active block pulses red. Share call sheets to the team in one tap.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">✦  Wrap Report</div>
      <div class="feat-title">It's a Wrap</div>
      <div class="feat-body">End-of-day wrap report with scenes completed, shots approved, and notes for tomorrow. PRINT / MOVE status on each scene. Timestamped and shareable.</div>
    </div>
  </div>
</section>

<!-- Shot List Preview -->
<section class="section" id="shots">
  <div class="section-label">Shot List</div>
  <div class="section-title">Scene 12 —<br><span>Canyon Floor.</span></div>
  <div class="shot-list">
    <div class="shot-row">
      <div class="shot-num done"><div class="sc">SHOT</div><div class="letter">A</div></div>
      <div class="shot-content">
        <div class="shot-type">MASTER</div>
        <div class="shot-desc">Wide — car enters frame from left, canyon walls establish scale</div>
        <div class="shot-chips"><span class="chip">24mm</span><span class="chip">STATIC</span><span class="chip">0:04</span></div>
      </div>
      <div class="shot-status"><div class="check">✓</div></div>
    </div>
    <div class="shot-row">
      <div class="shot-num done"><div class="sc">SHOT</div><div class="letter">B</div></div>
      <div class="shot-content">
        <div class="shot-type">OTS HERO</div>
        <div class="shot-desc">Over shoulder, pursuers visible behind — tension established</div>
        <div class="shot-chips"><span class="chip">50mm</span><span class="chip">DOLLY IN</span><span class="chip">0:06</span></div>
      </div>
      <div class="shot-status"><div class="check">✓</div></div>
    </div>
    <div class="shot-row">
      <div class="shot-num done"><div class="sc">SHOT</div><div class="letter">C</div></div>
      <div class="shot-content">
        <div class="shot-type">CLOSE UP</div>
        <div class="shot-desc">Hero's face — reaction to engine sound, sweat on brow</div>
        <div class="shot-chips"><span class="chip">85mm</span><span class="chip">STATIC</span><span class="chip">0:03</span></div>
      </div>
      <div class="shot-status"><div class="check">✓</div></div>
    </div>
    <div class="shot-row">
      <div class="shot-num"><div class="sc">SHOT</div><div class="letter">D</div></div>
      <div class="shot-content">
        <div class="shot-type">AERIAL</div>
        <div class="shot-desc">Drone — canyon scale reveal, car tiny against walls. Confirming drone op.</div>
        <div class="shot-chips"><span class="chip">DRONE</span><span class="chip">FLY DOWN</span><span class="chip">0:08</span></div>
      </div>
      <div class="shot-status"><div class="empty-check"></div></div>
    </div>
    <div class="shot-row">
      <div class="shot-num"><div class="sc">SHOT</div><div class="letter">E</div></div>
      <div class="shot-content">
        <div class="shot-type">POV</div>
        <div class="shot-desc">Through windshield — canyon walls blur, speed conveyed</div>
        <div class="shot-chips"><span class="chip">35mm</span><span class="chip">HANDHELD</span><span class="chip">0:05</span></div>
      </div>
      <div class="shot-status"><div class="empty-check"></div></div>
    </div>
  </div>
</section>

<!-- Schedule -->
<section class="section" id="schedule">
  <div class="section-label">Daily Schedule</div>
  <div class="section-title">Day 3 —<br><span>Canyon Floor, Mojave.</span></div>
  <div class="timeline-wrap">
    <div class="tl-row">
      <div class="tl-time">6:30</div>
      <div class="tl-dot"></div>
      <div><div class="tl-label">Crew Call</div><div class="tl-sub">All departments · Canyon Floor</div></div>
      <div class="tl-dur">30m</div>
    </div>
    <div class="tl-row">
      <div class="tl-time">7:00</div>
      <div class="tl-dot blue"></div>
      <div><div class="tl-label">Lighting Setup</div><div class="tl-sub">Sc.12 wide — DOP + gaffer</div></div>
      <div class="tl-dur">1h</div>
    </div>
    <div class="tl-row">
      <div class="tl-time">8:00</div>
      <div class="tl-dot gold"></div>
      <div><div class="tl-label">Shoot Sc. 11 — Canyon Ridge</div><div class="tl-sub">6/6 shots complete · ✓ Done</div></div>
      <div class="tl-dur">1.5h</div>
    </div>
    <div class="tl-row">
      <div class="tl-time now">10:00</div>
      <div class="tl-dot now"></div>
      <div><div class="tl-label now-text">Shoot Sc. 12A–C → Hero Coverage</div><div class="tl-sub" style="color:var(--accent2)">● Active now — 3/9 shots approved</div></div>
      <div class="tl-dur now">2h</div>
    </div>
    <div class="tl-row">
      <div class="tl-time">12:00</div>
      <div class="tl-dot"></div>
      <div><div class="tl-label">Meal Break</div><div class="tl-sub">Catering on site · 30 min</div></div>
      <div class="tl-dur">30m</div>
    </div>
    <div class="tl-row">
      <div class="tl-time">12:30</div>
      <div class="tl-dot gold"></div>
      <div><div class="tl-label">Sc.12D–F + Sc.13 remaining shots</div><div class="tl-sub">Drone aerial + hero coverage</div></div>
      <div class="tl-dur">3h</div>
    </div>
  </div>
</section>

<!-- Stats -->
<section class="section">
  <div class="section-label">By the numbers</div>
  <div class="section-title">Built for<br><span>real productions.</span></div>
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-num" style="color:var(--accent)">34</div>
      <div class="stat-label">Scenes tracked in a single project. Shot list, location, crew, and status per scene — all in one place.</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color:var(--accent2)">9 shots</div>
      <div class="stat-label">Average per scene. Each shot card carries type, lens, movement, duration, and approval state.</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color:var(--accent3)">Day 3</div>
      <div class="stat-label">Of 12. REEL tracks progress through the entire shoot, wrapping scenes and flagging delays automatically.</div>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta-section">
  <div class="cta-clap">IT'S A WRAP.</div>
  <p class="cta-sub">Stop losing shots to spreadsheets. REEL keeps your production moving.</p>
  <div class="cta-btns">
    <a href="https://ram.zenbin.org/reel-viewer" class="btn-light">View Prototype →</a>
    <a href="https://ram.zenbin.org/reel-mock" class="btn-dark">Interactive Mock ◑</a>
  </div>
</div>

<footer>
  <span>REEL · Design by RAM · April 2026</span>
  <span>
    <a href="https://ram.zenbin.org/reel-viewer">Prototype</a> ·
    <a href="https://ram.zenbin.org/reel-mock">Mock</a> ·
    Inspired by MICRODOT.vision
  </span>
</footer>

</body>
</html>`;

// ── Viewer page ────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('reel.pen', 'utf8');
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Deploying hero page...');
  const h = await deploy(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', h.url || h.raw || JSON.stringify(h));

  console.log('Deploying viewer...');
  const v = await deploy(SLUG+'-viewer', viewerHtml, `${APP_NAME} Prototype Viewer`);
  console.log('Viewer:', v.url || v.raw || JSON.stringify(v));
}

main().catch(console.error);
