// shore-publish.js — Hero page + viewer for SHORE
const fs = require('fs');
const https = require('https');

const SLUG = 'shore';
const APP_NAME = 'SHORE';
const TAGLINE = 'Every meeting, turned into momentum';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Hero page ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#F5F2ED;--surf:#FFFFFF;--text:#1A1917;
    --accent:#1B6B5A;--accent2:#D4613A;
    --muted:rgba(26,25,23,0.45);
    --teal-light:#EAF4F1;--rust-light:#FBF0EA;
  }
  html{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif}
  body{max-width:1100px;margin:0 auto;padding:0 24px 80px}

  /* Nav */
  nav{display:flex;align-items:center;justify-content:space-between;
      padding:20px 0;border-bottom:1px solid rgba(26,25,23,0.08)}
  .logo{font-size:14px;font-weight:700;letter-spacing:2px;color:var(--accent)}
  .nav-links{display:flex;gap:28px}
  .nav-links a{font-size:13px;color:var(--muted);text-decoration:none}
  .nav-cta{background:var(--accent);color:#fff;border:none;
            padding:8px 18px;border-radius:20px;font-size:13px;
            font-weight:600;cursor:pointer;font-family:inherit}

  /* Hero */
  .hero{padding:80px 0 60px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
  .hero-eyebrow{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--accent);
                text-transform:uppercase;margin-bottom:16px}
  .hero h1{font-size:clamp(36px,5vw,58px);font-weight:700;line-height:1.1;
           color:var(--text);margin-bottom:20px}
  .hero h1 em{color:var(--accent);font-style:normal}
  .hero-desc{font-size:17px;line-height:1.6;color:var(--muted);margin-bottom:32px}
  .hero-actions{display:flex;gap:12px;align-items:center}
  .btn-primary{background:var(--accent);color:#fff;padding:13px 28px;border-radius:24px;
               font-weight:600;font-size:15px;text-decoration:none;display:inline-block}
  .btn-ghost{color:var(--accent);font-size:15px;font-weight:500;text-decoration:none}
  .btn-ghost::after{content:' →'}

  /* Phone mock */
  .phone-wrap{position:relative;display:flex;justify-content:center}
  .phone{width:280px;height:606px;background:#1A1917;border-radius:40px;
         position:relative;box-shadow:0 40px 80px rgba(26,25,23,0.18),
         0 0 0 8px rgba(26,25,23,0.06);overflow:hidden}
  .phone-screen{
    position:absolute;inset:0;background:var(--bg);border-radius:38px;
    display:flex;flex-direction:column;padding:20px 16px 16px;font-size:8.5px;
    overflow:hidden;
  }
  .ps-status{display:flex;justify-content:space-between;font-size:8px;
             color:var(--muted);margin-bottom:10px}
  .ps-title{font-size:14px;font-weight:700;color:var(--text);margin-bottom:2px}
  .ps-sub{font-size:8px;color:var(--muted);margin-bottom:10px}
  .ps-pill{display:inline-flex;align-items:center;gap:4px;
           background:var(--teal-light);border-radius:12px;padding:4px 10px;
           font-size:8px;color:var(--accent);font-weight:600;margin-bottom:10px}
  .ps-row{background:#fff;border-radius:8px;padding:8px 10px;margin-bottom:6px;
          border-left:2.5px solid transparent}
  .ps-row.live{border-left-color:var(--accent)}
  .ps-row.done{border-left-color:rgba(26,25,23,0.1)}
  .ps-row.upcoming{border-left-color:rgba(26,25,23,0.06)}
  .ps-row-time{font-size:7px;color:var(--muted);margin-bottom:2px}
  .ps-row-name{font-size:10px;font-weight:600;color:var(--text);margin-bottom:1px}
  .ps-row-meta{font-size:7px;color:var(--muted)}
  .ps-row-meta.live-meta{color:var(--accent)}
  .ps-nav{margin-top:auto;display:flex;justify-content:space-around;
          border-top:1px solid rgba(26,25,23,0.07);padding-top:8px}
  .ps-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:6px}
  .ps-nav-item.active{color:var(--accent)}
  .ps-nav-item:not(.active){color:var(--muted)}
  .ps-nav-icon{font-size:12px}

  /* Stats row */
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;
         padding:40px 0;border-top:1px solid rgba(26,25,23,0.08);
         border-bottom:1px solid rgba(26,25,23,0.08);margin-bottom:60px}
  .stat-val{font-size:32px;font-weight:700;color:var(--text);line-height:1}
  .stat-label{font-size:13px;color:var(--muted);margin-top:4px}

  /* Features */
  .features{margin-bottom:60px}
  .features h2{font-size:32px;font-weight:700;margin-bottom:8px}
  .features-sub{font-size:16px;color:var(--muted);margin-bottom:40px}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .feat-card{background:var(--surf);border-radius:16px;padding:28px 24px}
  .feat-icon{width:36px;height:36px;border-radius:10px;background:var(--teal-light);
             display:flex;align-items:center;justify-content:center;
             font-size:18px;margin-bottom:16px}
  .feat-card h3{font-size:17px;font-weight:600;margin-bottom:8px}
  .feat-card p{font-size:14px;line-height:1.6;color:var(--muted)}

  /* Insight strip */
  .insight-strip{background:var(--teal-light);border-radius:20px;padding:40px 48px;
                  display:flex;align-items:center;gap:40px;margin-bottom:60px}
  .insight-big{font-size:64px;font-weight:700;color:var(--accent);line-height:1}
  .insight-text h3{font-size:20px;font-weight:600;margin-bottom:6px}
  .insight-text p{font-size:15px;color:var(--muted);line-height:1.5}

  /* CTA footer */
  .cta-block{text-align:center;padding:60px 40px;background:var(--surf);border-radius:24px}
  .cta-block h2{font-size:36px;font-weight:700;margin-bottom:12px}
  .cta-block p{font-size:17px;color:var(--muted);margin-bottom:28px}
  .cta-block a{background:var(--accent);color:#fff;padding:14px 36px;
               border-radius:28px;font-weight:600;font-size:16px;
               text-decoration:none;display:inline-block}

  /* Footer */
  footer{display:flex;justify-content:space-between;align-items:center;
         padding:32px 0;border-top:1px solid rgba(26,25,23,0.08);margin-top:60px;
         font-size:13px;color:var(--muted)}
  .footer-logo{font-weight:700;letter-spacing:2px;color:var(--accent);font-size:12px}

  @media(max-width:700px){
    .hero{grid-template-columns:1fr;gap:40px}
    .feat-grid{grid-template-columns:1fr}
    .stats{grid-template-columns:repeat(2,1fr)}
    .insight-strip{flex-direction:column;gap:20px}
    .phone-wrap{display:none}
  }
</style>
</head>
<body>

<nav>
  <span class="logo">SHORE</span>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="#">Teams</a>
  </div>
  <button class="nav-cta">Get started free</button>
</nav>

<section class="hero">
  <div>
    <p class="hero-eyebrow">AI Meeting Intelligence</p>
    <h1>Every meeting,<br>turned into <em>momentum</em></h1>
    <p class="hero-desc">Shore listens to your meetings and extracts what matters — decisions, actions, blockers, and patterns — so your team never loses signal in the noise.</p>
    <div class="hero-actions">
      <a href="/shore-viewer" class="btn-primary">View prototype →</a>
      <a href="/shore-mock" class="btn-ghost">Interactive mock</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-screen">
        <div class="ps-status"><span>9:41</span><span>●●● ■</span></div>
        <div style="font-size:8px;font-weight:700;letter-spacing:2px;color:#1B6B5A;margin-bottom:6px">SHORE</div>
        <div class="ps-title">Tuesday, April 5</div>
        <div class="ps-sub">3 meetings · 12 actions open</div>
        <div class="ps-pill">↑ Focus score: 82</div>
        <div style="font-size:7px;font-weight:700;letter-spacing:1.5px;color:rgba(26,25,23,0.4);margin-bottom:6px">TODAY'S MEETINGS</div>
        <div class="ps-row done">
          <div class="ps-row-time">9:00 AM · 30 min</div>
          <div class="ps-row-name">Weekly Standup</div>
          <div class="ps-row-meta">4 decisions · 6 actions</div>
        </div>
        <div class="ps-row live">
          <div class="ps-row-time">10:30 AM · 45 min</div>
          <div class="ps-row-name">Product Sync</div>
          <div class="ps-row-meta live-meta">● Recording · 18 min in</div>
        </div>
        <div class="ps-row upcoming">
          <div class="ps-row-time">2:00 PM · 60 min</div>
          <div class="ps-row-name">Design Review</div>
          <div class="ps-row-meta">Alice, Ben, +3</div>
        </div>
        <div class="ps-nav">
          <div class="ps-nav-item active"><div class="ps-nav-icon">⌂</div>Today</div>
          <div class="ps-nav-item"><div class="ps-nav-icon">◉</div>Meetings</div>
          <div class="ps-nav-item"><div class="ps-nav-icon">⟳</div>Patterns</div>
          <div class="ps-nav-item"><div class="ps-nav-icon">◻</div>Actions</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="stats">
  <div><div class="stat-val">94%</div><div class="stat-label">Actions captured per meeting</div></div>
  <div><div class="stat-val">38<span style="font-size:18px;font-weight:400">min</span></div><div class="stat-label">Average meeting duration saved</div></div>
  <div><div class="stat-val">23</div><div class="stat-label">Decisions tracked this week</div></div>
  <div><div class="stat-val">82</div><div class="stat-label">Team meeting health score</div></div>
</div>

<section class="features">
  <h2>Outcome-oriented by design</h2>
  <p class="features-sub">Shore doesn't just record — it extracts the signals that drive your team forward.</p>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">✦</div>
      <h3>AI Summaries</h3>
      <p>Get a structured brief of every meeting: context, decisions made, and the reasoning behind them.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◻</div>
      <h3>Action Capture</h3>
      <p>Every commitment spoken in a meeting becomes a tracked action item, assigned and deadline-aware.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⟳</div>
      <h3>Pattern Detection</h3>
      <p>Shore surfaces recurring blockers, rising topics, and unresolved signals before they become crises.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">↑</div>
      <h3>Decision Log</h3>
      <p>A searchable, chronological record of every decision your team has made — with full context.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◉</div>
      <h3>Team Pulse</h3>
      <p>Participation metrics, meeting health scores, and focus indicators help you run leaner syncs.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⌁</div>
      <h3>Integrations</h3>
      <p>Connect Slack, Notion, Jira and Linear — actions flow directly into the tools your team lives in.</p>
    </div>
  </div>
</section>

<div class="insight-strip">
  <div class="insight-big">71%</div>
  <div class="insight-text">
    <h3>of actions are completed on time</h3>
    <p>Teams using Shore close 71% of meeting actions within the agreed deadline — vs. 38% on average without structured tracking.</p>
  </div>
</div>

<div class="cta-block">
  <h2>Meetings should move things forward.</h2>
  <p>Start with Shore free — no credit card required.</p>
  <a href="/shore-viewer">View the prototype</a>
</div>

<footer>
  <span class="footer-logo">SHORE</span>
  <span>Designed by RAM · April 2026</span>
  <span>ram.zenbin.org/shore</span>
</footer>

</body>
</html>`;

// ─── Viewer page ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/shore.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

// Base viewer template
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Prototype Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#E8E5E0;display:flex;flex-direction:column;align-items:center;
       justify-content:center;min-height:100vh;font-family:Inter,sans-serif;padding:20px}
  h1{font-size:13px;font-weight:700;letter-spacing:2px;color:#1B6B5A;margin-bottom:4px;text-transform:uppercase}
  p{font-size:13px;color:rgba(26,25,23,0.5);margin-bottom:24px}
  #viewer{width:390px;height:844px;border-radius:48px;overflow:hidden;
          box-shadow:0 32px 64px rgba(26,25,23,0.2), 0 0 0 8px rgba(26,25,23,0.05);
          background:#F5F2ED}
  canvas{border-radius:48px}
</style>
<script>
(function(){
  // EMBEDDED_PEN will be injected here
})();
</script>
</head>
<body>
<h1>${APP_NAME}</h1>
<p>${TAGLINE}</p>
<div id="viewer">
  <canvas id="c" width="390" height="844"></canvas>
</div>
<script>
const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
if (!pen) { document.getElementById('viewer').innerHTML = '<p style="padding:20px;color:#666">No pen data</p>'; }
else { renderPen(pen); }

function renderPen(pen) {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let current = 0;

  function draw(screenIdx) {
    const s = pen.screens[screenIdx];
    if (!s) return;
    ctx.clearRect(0,0,390,844);
    s.elements.forEach(el => {
      ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;
      if (el.type === 'rect') {
        ctx.fillStyle = el.fill || '#eee';
        if (el.radius > 0) {
          roundRect(ctx, el.x, el.y, el.width, el.height, el.radius);
          ctx.fill();
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
        }
      } else if (el.type === 'circle') {
        ctx.fillStyle = el.fill || '#eee';
        ctx.beginPath();
        ctx.arc(el.x + el.width/2, el.y + el.height/2, el.width/2, 0, Math.PI*2);
        ctx.fill();
      } else if (el.type === 'text') {
        ctx.fillStyle = el.fill || '#000';
        const weight = el.fontWeight === '700' || el.fontWeight === 'bold' ? 'bold' : el.fontWeight === '600' ? '600' : el.fontWeight === '500' ? '500' : 'normal';
        ctx.font = weight + ' ' + el.fontSize + 'px ' + (el.fontFamily || 'Inter') + ', system-ui, sans-serif';
        ctx.textAlign = el.align || 'left';
        if (el.letterSpacing && el.letterSpacing > 0) {
          drawTracked(ctx, el.content, el.x, el.y + el.fontSize * 0.75, el.letterSpacing);
        } else {
          ctx.fillText(el.content, el.x, el.y + el.fontSize * 0.75);
        }
      }
    });
    ctx.globalAlpha = 1;
    // Screen indicator
    const totalScreens = pen.screens.length;
    const dotSpacing = 14;
    const totalWidth = (totalScreens - 1) * dotSpacing;
    const startX = 195 - totalWidth / 2;
    for (let i = 0; i < totalScreens; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * dotSpacing, 820, i === screenIdx ? 3.5 : 2.5, 0, Math.PI*2);
      ctx.fillStyle = i === screenIdx ? '#1B6B5A' : 'rgba(26,25,23,0.2)';
      ctx.fill();
    }
  }

  function drawTracked(ctx, text, x, y, spacing) {
    let cx = x;
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], cx, y);
      cx += ctx.measureText(text[i]).width + spacing;
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.arcTo(x+w, y, x+w, y+r, r);
    ctx.lineTo(x+w, y+h-r);
    ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
    ctx.lineTo(x+r, y+h);
    ctx.arcTo(x, y+h, x, y+h-r, r);
    ctx.lineTo(x, y+r);
    ctx.arcTo(x, y, x+r, y, r);
    ctx.closePath();
  }

  draw(current);
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (390 / rect.width);
    if (x > 200) current = (current + 1) % pen.screens.length;
    else current = (current - 1 + pen.screens.length) % pen.screens.length;
    draw(current);
  });
}
</script>
</body>
</html>`;

viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function run() {
  console.log('Publishing hero page...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', r1.status, r1.body.slice(0,80));

  console.log('Publishing viewer...');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log('Viewer:', r2.status, r2.body.slice(0,80));

  console.log(`\n✓ Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
