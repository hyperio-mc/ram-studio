#!/usr/bin/env node
// RAFT — Full publish pipeline
// Hero page + viewer → ram.zenbin.org

const fs   = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const SLUG = 'raft';
const HOST = 'ram.zenbin.org';
const TOKEN_FILE = path.join(__dirname, 'community-config.json');
const config = JSON.parse(fs.readFileSync(TOKEN_FILE,'utf8'));
const API_KEY = config.ZENBIN_API_KEY || config.API_KEY || config.PUBLISH_KEY;
const PEN_PATH = path.join(__dirname, 'raft.pen');

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: HOST,
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
        'X-API-Key': API_KEY,
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero page ────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RAFT — Sprint intelligence for healthy teams</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #F8F5EF;
    --surface: #FFFFFF;
    --text:    #1C1A17;
    --muted:   #8A8277;
    --light:   #DDD8CF;
    --accent:  #2D6A4F;
    --accent2: #F4A261;
    --success: #52B788;
    --tag-bg:  #E8F5EE;
  }
  body { background: var(--bg); color: var(--text); font-family: Inter, system-ui, sans-serif; }
  
  /* Nav */
  nav { display:flex; justify-content:space-between; align-items:center;
        padding:20px 40px; border-bottom:1px solid var(--light); background:var(--surface); }
  .nav-logo { font-family:Georgia,serif; font-size:20px; font-weight:700; color:var(--text); }
  .nav-logo span { color:var(--accent); }
  .nav-cta { background:var(--accent); color:#fff; padding:10px 22px; border-radius:20px;
             font-size:13px; font-weight:600; text-decoration:none; }

  /* Hero */
  .hero { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center;
          max-width:1100px; margin:0 auto; padding:80px 40px; }
  .hero-eyebrow { display:inline-block; background:var(--tag-bg); color:var(--accent);
                  font-size:11px; font-weight:600; padding:4px 12px; border-radius:10px;
                  margin-bottom:20px; letter-spacing:.05em; }
  .hero h1 { font-family:Georgia,serif; font-size:clamp(36px,5vw,58px); line-height:1.1;
             color:var(--text); margin-bottom:18px; }
  .hero h1 em { color:var(--accent); font-style:normal; }
  .hero-sub { font-size:16px; color:var(--muted); line-height:1.65; margin-bottom:36px; max-width:460px; }
  .hero-btns { display:flex; gap:12px; flex-wrap:wrap; }
  .btn-primary { background:var(--accent); color:#fff; padding:13px 28px; border-radius:24px;
                 font-size:14px; font-weight:600; text-decoration:none; }
  .btn-ghost { border:1.5px solid var(--light); color:var(--text); padding:12px 24px;
               border-radius:24px; font-size:14px; text-decoration:none; }
  .btn-ghost:hover { border-color:var(--accent); }

  /* Phone mock */
  .phone { position:relative; display:flex; justify-content:center; }
  .phone-shell { width:300px; background:var(--surface); border-radius:40px;
                 box-shadow:0 40px 80px rgba(44,70,50,.12), 0 0 0 1px var(--light);
                 padding:16px; overflow:hidden; }
  .phone-screen { border-radius:28px; background:var(--bg); overflow:hidden; }
  .phone-screen img { display:block; width:100%; }
  /* Animated score ring */
  .score-ring { position:absolute; top:-20px; right:-20px; width:88px; height:88px; }
  .score-ring circle { fill:none; stroke-width:6; }
  .score-ring .track { stroke:#E8E4DC; }
  .score-ring .fill  { stroke:var(--accent); stroke-linecap:round;
                       stroke-dasharray:220; stroke-dashoffset:48;
                       transform:rotate(-90deg); transform-origin:50% 50%; }
  .score-label { position:absolute; top:12px; right:12px; text-align:center;
                 font-size:22px; font-weight:700; color:var(--accent); line-height:1; }
  .score-label small { display:block; font-size:9px; color:var(--muted); font-weight:500; }

  /* Metrics strip */
  .metrics { display:flex; gap:2px; margin-top:24px; }
  .metric { flex:1; background:var(--surface); border:1px solid var(--light); border-radius:12px;
            padding:16px 14px; }
  .metric-val { font-size:28px; font-weight:700; color:var(--text); font-family:Georgia,serif; }
  .metric-label { font-size:11px; color:var(--muted); margin-top:2px; }
  .metric-delta { font-size:11px; color:var(--success); margin-top:4px; }
  .metrics-wrap { max-width:1100px; margin:0 auto; padding:0 40px 60px; }

  /* Features */
  .features { background:var(--surface); border-top:1px solid var(--light); border-bottom:1px solid var(--light); padding:70px 40px; }
  .features-inner { max-width:1100px; margin:0 auto; }
  .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; margin-top:48px; }
  .feature-card { padding:28px; border:1px solid var(--light); border-radius:16px; background:var(--bg); }
  .feature-icon { font-size:24px; margin-bottom:14px; }
  .feature-title { font-size:15px; font-weight:600; margin-bottom:8px; }
  .feature-desc { font-size:13px; color:var(--muted); line-height:1.6; }
  .section-label { font-size:11px; font-weight:600; color:var(--muted); letter-spacing:.08em;
                   text-transform:uppercase; margin-bottom:12px; }
  .section-h { font-family:Georgia,serif; font-size:clamp(26px,3.5vw,40px); color:var(--text); max-width:560px; }

  /* Testimonial */
  .testimonial { max-width:1100px; margin:60px auto; padding:0 40px; }
  .quote-card { background:var(--surface); border:1px solid var(--light); border-radius:20px;
                padding:40px 48px; display:flex; gap:32px; align-items:center; }
  .quote-text { font-family:Georgia,serif; font-size:20px; color:var(--text); line-height:1.5;
                flex:1; }
  .quote-text em { color:var(--accent); font-style:normal; }
  .quote-meta { min-width:120px; text-align:center; }
  .quote-avatar { width:52px; height:52px; border-radius:50%; background:var(--accent2);
                  display:flex; align-items:center; justify-content:center;
                  font-weight:700; font-size:16px; color:#fff; margin:0 auto 10px; }
  .quote-name { font-size:13px; font-weight:600; color:var(--text); }
  .quote-role { font-size:11px; color:var(--muted); margin-top:2px; }

  /* CTA */
  .cta-section { background:var(--accent); padding:80px 40px; text-align:center; }
  .cta-section h2 { font-family:Georgia,serif; font-size:clamp(28px,4vw,46px); color:#fff; margin-bottom:16px; }
  .cta-section p { font-size:15px; color:rgba(255,255,255,.75); margin-bottom:32px; }
  .btn-cta-white { background:#fff; color:var(--accent); padding:14px 32px; border-radius:24px;
                   font-size:15px; font-weight:700; text-decoration:none; }

  /* Footer */
  footer { padding:32px 40px; border-top:1px solid var(--light); display:flex;
           justify-content:space-between; align-items:center; max-width:1100px; margin:0 auto; }
  .footer-logo { font-family:Georgia,serif; font-size:16px; font-weight:700; color:var(--text); }
  footer p { font-size:12px; color:var(--muted); }

  @media(max-width:768px) {
    .hero { grid-template-columns:1fr; padding:40px 20px; }
    .features-grid { grid-template-columns:1fr; }
    .metrics { flex-direction:column; }
    .quote-card { flex-direction:column; }
    nav { padding:16px 20px; }
    .metrics-wrap { padding:0 20px 40px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">RAFT</div>
  <a class="nav-cta" href="/raft-viewer">View Design →</a>
</nav>

<section class="hero">
  <div>
    <span class="hero-eyebrow">✦ Sprint Intelligence</span>
    <h1>Navigate sprints<br>as <em>one team.</em></h1>
    <p class="hero-sub">RAFT brings together sprint health, team sentiment, velocity trends, and retrospective actions into one calm, clear view — powered by AI insights.</p>
    <div class="hero-btns">
      <a class="btn-primary" href="/raft-viewer">See the Design</a>
      <a class="btn-ghost" href="/raft-mock">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="phone">
    <div class="phone-shell">
      <div class="phone-screen" style="height:340px;background:#F8F5EF;padding:16px;position:relative;">
        <!-- Mini sprint card -->
        <div style="font-family:Georgia,serif;font-size:11px;font-weight:700;margin-bottom:10px;">RAFT</div>
        <div style="font-size:10px;color:#8A8277;margin-bottom:4px;">Sprint Health</div>
        <div style="font-family:Georgia,serif;font-size:44px;font-weight:700;color:#2D6A4F;line-height:1;">78</div>
        <div style="font-size:10px;color:#52B788;margin-bottom:10px;">↑ 6 pts from last sprint</div>
        <div style="height:5px;background:#E8E4DC;border-radius:3px;margin-bottom:14px;">
          <div style="width:78%;height:100%;background:#2D6A4F;border-radius:3px;"></div>
        </div>
        <div style="font-size:10px;font-weight:600;margin-bottom:8px;">In Progress</div>
        ${[
          {title:'Redesign onboarding',pct:70,initials:'JL',color:'#4A7CC9'},
          {title:'API rate limiting v2',pct:45,initials:'MK',color:'#52B788',blocked:true},
          {title:'Write Q2 OKR brief',pct:90,initials:'RK',color:'#F4A261'},
        ].map(t=>`
        <div style="background:#fff;border:1px solid #DDD8CF;border-radius:6px;padding:7px 8px;margin-bottom:5px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <div style="width:18px;height:18px;border-radius:50%;background:${t.color};display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#fff;">${t.initials}</div>
            <span style="font-size:10px;font-weight:600;">${t.title}</span>
            ${t.blocked?'<span style="font-size:8px;background:#FFEDEB;color:#C1440E;padding:1px 5px;border-radius:4px;margin-left:auto;">BLOCKED</span>':''}
          </div>
          <div style="height:3px;background:#E8E4DC;border-radius:2px;">
            <div style="width:${t.pct}%;height:100%;background:${t.blocked?'#C1440E':'#2D6A4F'};border-radius:2px;"></div>
          </div>
        </div>`).join('')}
        <div style="background:#F0FAF4;border:1px solid #52B788;border-radius:6px;padding:6px 8px;margin-top:6px;font-size:9px;color:#1C1A17;">
          <strong style="color:#2D6A4F;">✦ AI Insight</strong> — Blocker pattern mirrors Sprint 21 slowdown.
        </div>
      </div>
    </div>
    <div class="score-label">78<small>health</small></div>
  </div>
</section>

<div class="metrics-wrap">
  <div class="metrics">
    <div class="metric">
      <div class="metric-val">42</div>
      <div class="metric-label">Velocity pts</div>
      <div class="metric-delta">↑ 8% vs last sprint</div>
    </div>
    <div class="metric">
      <div class="metric-val">18</div>
      <div class="metric-label">Tasks done</div>
      <div class="metric-delta">76% completion</div>
    </div>
    <div class="metric">
      <div class="metric-val" style="color:#C1440E;">3</div>
      <div class="metric-label">Blockers</div>
      <div class="metric-delta" style="color:#C1440E;">-1 from last sprint</div>
    </div>
    <div class="metric">
      <div class="metric-val">4.2</div>
      <div class="metric-label">Team sentiment</div>
      <div class="metric-delta">Energized ↑</div>
    </div>
  </div>
</div>

<section class="features">
  <div class="features-inner">
    <p class="section-label">What RAFT does</p>
    <h2 class="section-h">Everything your team needs to reflect and improve.</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">◈</div>
        <div class="feature-title">Sprint Health Score</div>
        <div class="feature-desc">A single composite score derived from velocity, sentiment, blocker count, and action completion. Trend it across sprints.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">♡</div>
        <div class="feature-title">Team Pulse</div>
        <div class="feature-desc">Anonymous mood check-ins with category scoring — collaboration, workload, clarity, support — synthesized by AI each sprint.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">↗</div>
        <div class="feature-title">Velocity Trends</div>
        <div class="feature-desc">6-sprint rolling chart with breakdown by type. AI predicts next sprint's range based on capacity and historical patterns.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✦</div>
        <div class="feature-title">Retro Action Tracking</div>
        <div class="feature-desc">Capture and track actions from every retro with owner, due date, and priority. Close the loop sprint over sprint.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⊕</div>
        <div class="feature-title">Individual Health</div>
        <div class="feature-desc">Per-member wellbeing tracking with AI-generated recommendations — like flagging at-risk team members before burnout.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🗘</div>
        <div class="feature-title">Pattern Detection</div>
        <div class="feature-desc">RAFT spots recurring blockers, mood dips, and velocity patterns across sprints so you can fix root causes, not symptoms.</div>
      </div>
    </div>
  </div>
</section>

<div class="testimonial">
  <div class="quote-card">
    <div class="quote-text">
      "We used to dread retros. RAFT made them the most <em>valuable 30 minutes</em> of our sprint — we actually follow up on actions now."
    </div>
    <div class="quote-meta">
      <div class="quote-avatar">JL</div>
      <div class="quote-name">Jordan Lee</div>
      <div class="quote-role">Design Lead</div>
    </div>
  </div>
</div>

<section class="cta-section">
  <h2>Ready to build a healthier team?</h2>
  <p>Start your first sprint health check in minutes. No setup. No noise.</p>
  <a class="btn-cta-white" href="/raft-viewer">Explore the Design →</a>
</section>

<footer>
  <div class="footer-logo">RAFT</div>
  <p>A RAM Design Heartbeat — ram.zenbin.org</p>
</footer>

</body>
</html>`;

// ── Viewer page ──────────────────────────────────────────────────
const penJson = fs.readFileSync(PEN_PATH, 'utf8');
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer-template.html'), 'utf8')
  .catch?.() || '';

// Build viewer from scratch if template not found
const viewerHtmlBuilt = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RAFT — Design Viewer</title>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
<script src="https://ram.zenbin.org/pencil-viewer.js" defer></script>
<style>
  body { margin:0; background:#F8F5EF; font-family:Inter,system-ui,sans-serif; }
  #viewer-root { width:100%; min-height:100vh; }
  .viewer-header { background:#fff; border-bottom:1px solid #DDD8CF; padding:14px 24px;
                   display:flex; justify-content:space-between; align-items:center; }
  .viewer-logo { font-family:Georgia,serif; font-weight:700; font-size:17px; }
  .viewer-back { font-size:13px; color:#2D6A4F; text-decoration:none; }
</style>
</head>
<body>
<div class="viewer-header">
  <span class="viewer-logo">RAFT — Sprint Intelligence</span>
  <a class="viewer-back" href="/raft">← Back to overview</a>
</div>
<div id="viewer-root"></div>
</body>
</html>`;

async function main() {
  console.log('Publishing RAFT hero page...');
  const r1 = await publish(SLUG, heroHtml, 'RAFT — Sprint intelligence for healthy teams');
  console.log('Hero:', r1.status, typeof r1.body === 'object' ? r1.body.url || JSON.stringify(r1.body).slice(0,80) : r1.body.slice(0,80));

  console.log('Publishing RAFT viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtmlBuilt, 'RAFT — Design Viewer');
  console.log('Viewer:', r2.status, typeof r2.body === 'object' ? r2.body.url || JSON.stringify(r2.body).slice(0,80) : r2.body.slice(0,80));
  
  console.log('\n✓ Published:');
  console.log('  Hero   → https://ram.zenbin.org/'+SLUG);
  console.log('  Viewer → https://ram.zenbin.org/'+SLUG+'-viewer');
}

main().catch(console.error);
