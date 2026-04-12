#!/usr/bin/env node
// RAFT — Publish hero + viewer using correct zenbin.org API

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'raft';
const SUBDOMAIN = 'ram';
const APP_NAME  = 'RAFT';
const TAGLINE   = 'Sprint intelligence for healthy teams';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

const penData    = fs.readFileSync(path.join(__dirname, 'raft.pen'), 'utf8');
const viewerTpl  = fs.readFileSync(path.join(__dirname, 'penviewer-app.html'), 'utf8');
const injection  = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penData)};</script>`;
const viewerHtml = viewerTpl.replace('<script>', injection + '\n<script>');

// We'll use a bundled hero
const HERO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RAFT — Sprint intelligence for healthy teams</title>
<meta name="description" content="RAFT brings sprint health, team pulse, velocity trends and retrospective actions into one calm AI-powered view.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
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
    --tag-tc:  #2D6A4F;
  }
  body { background:var(--bg); color:var(--text); font-family:'Inter',system-ui,sans-serif; }
  nav { display:flex; justify-content:space-between; align-items:center; padding:18px 48px;
        border-bottom:1px solid var(--light); background:var(--surface); position:sticky; top:0; z-index:10; }
  .logo { font-family:'Lora',Georgia,serif; font-size:20px; font-weight:700; }
  .nav-links { display:flex; gap:32px; }
  .nav-links a { font-size:13px; color:var(--muted); text-decoration:none; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta { background:var(--accent); color:#fff; padding:10px 22px; border-radius:20px;
             font-size:13px; font-weight:600; text-decoration:none; }

  /* Hero */
  .hero { max-width:1120px; margin:0 auto; padding:90px 48px 60px;
          display:grid; grid-template-columns:1fr 440px; gap:70px; align-items:center; }
  .eyebrow { display:inline-flex; align-items:center; gap:8px; background:var(--tag-bg);
             color:var(--accent); font-size:11px; font-weight:600; padding:5px 14px;
             border-radius:20px; margin-bottom:22px; letter-spacing:.04em; }
  h1 { font-family:'Lora',Georgia,serif; font-size:clamp(36px,4.5vw,58px); line-height:1.1;
       margin-bottom:20px; }
  h1 em { color:var(--accent); font-style:normal; }
  .hero-sub { font-size:16px; color:var(--muted); line-height:1.7; margin-bottom:36px; max-width:480px; }
  .btn-row { display:flex; gap:12px; flex-wrap:wrap; }
  .btn-p { background:var(--accent); color:#fff; padding:13px 28px; border-radius:24px;
           font-size:14px; font-weight:600; text-decoration:none; }
  .btn-g { border:1.5px solid var(--light); color:var(--text); padding:12px 24px;
           border-radius:24px; font-size:14px; text-decoration:none; transition:.15s; }
  .btn-g:hover { border-color:var(--accent); color:var(--accent); }

  /* Mock phone */
  .phone-wrap { position:relative; display:flex; justify-content:center; }
  .phone { width:288px; background:var(--surface); border-radius:38px; padding:14px;
           box-shadow:0 32px 64px rgba(28,26,23,.1), 0 0 0 1px var(--light); }
  .screen { border-radius:26px; overflow:hidden; background:var(--bg); padding:14px; }
  .s-header { font-family:'Lora',serif; font-size:13px; font-weight:700; margin-bottom:8px; }
  .s-label { font-size:9px; color:var(--muted); margin-bottom:3px; font-weight:500; }
  .s-score { font-family:'Lora',serif; font-size:40px; font-weight:700; color:var(--accent); line-height:1; }
  .s-delta { font-size:9px; color:var(--success); margin:4px 0 8px; }
  .s-track { height:4px; background:#E8E4DC; border-radius:2px; margin-bottom:12px; }
  .s-fill  { height:100%; background:var(--accent); border-radius:2px; }
  .s-sh { font-size:9px; font-weight:600; margin-bottom:6px; }
  .task-card { background:#fff; border:1px solid #DDD8CF; border-radius:6px; padding:6px 8px; margin-bottom:4px; }
  .task-row { display:flex; align-items:center; gap:5px; margin-bottom:3px; }
  .avatar { width:15px; height:15px; border-radius:50%; display:flex; align-items:center;
            justify-content:center; font-size:6px; font-weight:700; color:#fff; flex-shrink:0; }
  .task-name { font-size:9px; font-weight:600; flex:1; }
  .blocked-tag { font-size:7px; background:#FFEDEB; color:#C1440E; padding:1px 4px; border-radius:3px; }
  .bar-track { height:3px; background:#E8E4DC; border-radius:2px; }
  .bar-fill  { height:100%; border-radius:2px; }
  .ai-card { background:#F0FAF4; border:1px solid var(--success); border-radius:6px;
             padding:5px 8px; margin-top:6px; font-size:8px; color:var(--text); }
  .ai-card strong { color:var(--accent); }

  /* Metrics */
  .metrics-strip { max-width:1120px; margin:0 auto; padding:0 48px 64px;
                   display:grid; grid-template-columns:repeat(4,1fr); gap:2px; }
  .metric { background:var(--surface); border:1px solid var(--light); border-radius:14px; padding:18px; }
  .m-val   { font-family:'Lora',serif; font-size:30px; font-weight:700; }
  .m-label { font-size:11px; color:var(--muted); margin-top:2px; }
  .m-delta { font-size:11px; color:var(--success); margin-top:6px; }

  /* Features */
  .features { background:var(--surface); border-top:1px solid var(--light); border-bottom:1px solid var(--light); padding:72px 48px; }
  .f-inner  { max-width:1120px; margin:0 auto; }
  .f-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; margin-top:44px; }
  .f-card   { background:var(--bg); border:1px solid var(--light); border-radius:14px; padding:24px; }
  .f-icon   { font-size:22px; margin-bottom:12px; }
  .f-title  { font-size:14px; font-weight:600; margin-bottom:8px; }
  .f-desc   { font-size:12.5px; color:var(--muted); line-height:1.65; }
  .sect-eye { font-size:11px; font-weight:600; color:var(--muted); letter-spacing:.06em;
              text-transform:uppercase; margin-bottom:10px; }
  .sect-h   { font-family:'Lora',serif; font-size:clamp(24px,3vw,38px); max-width:540px; }

  /* Quote */
  .quote-wrap { max-width:1120px; margin:56px auto; padding:0 48px; }
  .quote-card { background:var(--surface); border:1px solid var(--light); border-radius:18px;
                padding:40px 48px; display:flex; gap:32px; align-items:center; }
  .q-text { font-family:'Lora',serif; font-size:19px; line-height:1.55; flex:1; }
  .q-text em { color:var(--accent); font-style:normal; }
  .q-meta { text-align:center; min-width:100px; }
  .q-av   { width:48px; height:48px; border-radius:50%; background:var(--accent2); display:flex;
            align-items:center; justify-content:center; font-weight:700; color:#fff;
            font-size:15px; margin:0 auto 10px; }
  .q-name { font-size:13px; font-weight:600; }
  .q-role { font-size:11px; color:var(--muted); margin-top:2px; }

  /* CTA */
  .cta { background:var(--accent); padding:80px 48px; text-align:center; }
  .cta h2 { font-family:'Lora',serif; font-size:clamp(26px,4vw,44px); color:#fff; margin-bottom:14px; }
  .cta p  { font-size:15px; color:rgba(255,255,255,.7); margin-bottom:28px; }
  .btn-cta-w { background:#fff; color:var(--accent); padding:14px 32px; border-radius:24px;
               font-size:15px; font-weight:700; text-decoration:none; }

  /* Footer */
  .footer-wrap { max-width:1120px; margin:0 auto; }
  footer { padding:28px 48px; border-top:1px solid var(--light); display:flex;
           justify-content:space-between; align-items:center; }
  .f-logo { font-family:'Lora',serif; font-size:15px; font-weight:700; }
  .f-note { font-size:12px; color:var(--muted); }

  @media(max-width:900px) {
    .hero { grid-template-columns:1fr; padding:50px 24px 40px; }
    .metrics-strip { grid-template-columns:1fr 1fr; padding:0 24px 40px; }
    .f-grid { grid-template-columns:1fr; }
    .quote-card { flex-direction:column; }
    nav { padding:16px 24px; }
    .nav-links { display:none; }
    .features { padding:48px 24px; }
    .quote-wrap { padding:0 24px; }
    .cta { padding:56px 24px; }
    footer { padding:24px; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">RAFT</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="/raft-viewer">Prototype</a>
    <a href="/raft-mock">Mock ☀◑</a>
  </div>
  <a class="nav-cta" href="/raft-viewer">View Design →</a>
</nav>

<section class="hero">
  <div>
    <div class="eyebrow">✦ AI-powered Sprint Intelligence</div>
    <h1>Navigate sprints<br>as <em>one team.</em></h1>
    <p class="hero-sub">RAFT gives engineering and product teams a single calm view of sprint health, team sentiment, velocity trends, and retro action tracking — powered by AI pattern detection.</p>
    <div class="btn-row">
      <a class="btn-p" href="/raft-viewer">View Prototype</a>
      <a class="btn-g" href="/raft-mock">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="screen">
        <div class="s-header">RAFT</div>
        <div class="s-label">Sprint Health</div>
        <div class="s-score">78</div>
        <div class="s-delta">↑ 6 pts from last sprint</div>
        <div class="s-track"><div class="s-fill" style="width:78%;"></div></div>
        <div class="s-sh">In Progress</div>
        <div class="task-card">
          <div class="task-row">
            <div class="avatar" style="background:#4A7CC9;">JL</div>
            <span class="task-name">Redesign onboarding flow</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:70%;background:#2D6A4F;"></div></div>
        </div>
        <div class="task-card">
          <div class="task-row">
            <div class="avatar" style="background:#52B788;">MK</div>
            <span class="task-name">API rate limiting v2</span>
            <span class="blocked-tag">BLOCKED</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:45%;background:#C1440E;"></div></div>
        </div>
        <div class="task-card">
          <div class="task-row">
            <div class="avatar" style="background:#F4A261;">RK</div>
            <span class="task-name">Write Q2 OKR brief</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:90%;background:#2D6A4F;"></div></div>
        </div>
        <div class="ai-card"><strong>✦ AI Insight</strong> — Blocker pattern mirrors Sprint 21 slowdown.</div>
      </div>
    </div>
  </div>
</section>

<div class="metrics-strip">
  <div class="metric"><div class="m-val">42</div><div class="m-label">Velocity pts</div><div class="m-delta">↑ 8% this sprint</div></div>
  <div class="metric"><div class="m-val">18</div><div class="m-label">Tasks done</div><div class="m-delta">76% completion rate</div></div>
  <div class="metric"><div class="m-val" style="color:#C1440E;">3</div><div class="m-label">Active blockers</div><div class="m-delta" style="color:#C1440E;">-1 from last sprint</div></div>
  <div class="metric"><div class="m-val">4.2</div><div class="m-label">Team mood</div><div class="m-delta">Energized ↑</div></div>
</div>

<section class="features" id="features">
  <div class="f-inner">
    <p class="sect-eye">What RAFT does</p>
    <h2 class="sect-h">Everything your team needs to reflect, align, and improve.</h2>
    <div class="f-grid">
      <div class="f-card">
        <div class="f-icon">◈</div>
        <div class="f-title">Sprint Health Score</div>
        <div class="f-desc">A composite score from velocity, sentiment, blocker count, and action close rate. Trended across sprints for long-term visibility.</div>
      </div>
      <div class="f-card">
        <div class="f-icon">♡</div>
        <div class="f-title">Team Pulse</div>
        <div class="f-desc">Anonymous mood check-ins with category scoring — collaboration, workload, clarity, support — synthesized by AI each sprint.</div>
      </div>
      <div class="f-card">
        <div class="f-icon">↗</div>
        <div class="f-title">Velocity Trends</div>
        <div class="f-desc">6-sprint rolling chart broken down by type. AI predicts your next sprint's range based on capacity and historical momentum.</div>
      </div>
      <div class="f-card">
        <div class="f-icon">✦</div>
        <div class="f-title">Retro Action Tracking</div>
        <div class="f-desc">Capture, assign, and close retro actions with owner, priority, and sprint tag. Never lose a commitment again.</div>
      </div>
      <div class="f-card">
        <div class="f-icon">⊕</div>
        <div class="f-title">Individual Wellbeing</div>
        <div class="f-desc">Per-member health scores with AI recommendations — flag declining trends and get notified before burnout sets in.</div>
      </div>
      <div class="f-card">
        <div class="f-icon">⟳</div>
        <div class="f-title">Pattern Detection</div>
        <div class="f-desc">RAFT spots recurring blockers, mood dips, and velocity patterns across sprints so you fix root causes, not symptoms.</div>
      </div>
    </div>
  </div>
</section>

<div class="quote-wrap">
  <div class="quote-card">
    <div class="q-text">"We used to dread retros. RAFT made them the most <em>valuable 30 minutes</em> of our sprint — we actually close actions now."</div>
    <div class="q-meta">
      <div class="q-av">JL</div>
      <div class="q-name">Jordan Lee</div>
      <div class="q-role">Design Lead</div>
    </div>
  </div>
</div>

<section class="cta">
  <h2>Ready to build a healthier team?</h2>
  <p>Start your first sprint health check in minutes.</p>
  <a class="btn-cta-w" href="/raft-viewer">Explore the Design →</a>
</section>

<div class="footer-wrap">
  <footer>
    <div class="f-logo">RAFT</div>
    <p class="f-note">RAM Design Heartbeat · ram.zenbin.org · ${new Date().toISOString().slice(0,10)}</p>
  </footer>
</div>

</body>
</html>`;

async function main() {
  console.log('Publishing hero page...');
  const r1 = await post('zenbin.org', `/v1/pages/${SLUG}`, { 'X-Subdomain': SUBDOMAIN },
    { html: HERO_HTML, title: `${APP_NAME} — ${TAGLINE}` });
  console.log('Hero:', r1.status, [200,201].includes(r1.status) ? 'OK ✓' : r1.body.slice(0,120));

  console.log('Publishing viewer...');
  const r2 = await post('zenbin.org', `/v1/pages/${SLUG}-viewer`, { 'X-Subdomain': SUBDOMAIN },
    { html: viewerHtml, title: `${APP_NAME} — Prototype Viewer` });
  console.log('Viewer:', r2.status, [200,201].includes(r2.status) ? 'OK ✓' : r2.body.slice(0,120));

  console.log(`\n✓ Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
