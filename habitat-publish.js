'use strict';
// habitat-publish.js — hero + viewer for HABITAT

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'habitat';
const APP_NAME  = 'HABITAT';
const TAGLINE   = 'deep work, compounded daily';
const SUBDOMAIN = 'ram';

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOMAIN,
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch(e) { resolve({ raw: d, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>HABITAT — deep work, compounded daily</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#F7F4EF;
  --surface:#FFFFFF;
  --surface2:#F0ECE6;
  --border:#E2DDD6;
  --text:#1C1917;
  --sub:#6B6560;
  --muted:#A8A29B;
  --accent:#E8490A;
  --accentBg:#FEF0EB;
  --teal:#2A6B8C;
  --tealBg:#EAF3F8;
  --green:#2D7A54;
  --greenBg:#EAF5EF;
  --amber:#D97706;
  --amberBg:#FEF3C7;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;line-height:1.6;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(247,244,239,0.88);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between}
.nav-logo{font-weight:800;font-size:18px;letter-spacing:-0.5px;color:var(--text)}
.nav-logo span{color:var(--accent)}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:14px;color:var(--sub);text-decoration:none;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#fff;padding:10px 22px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none;transition:opacity .2s}
.nav-cta:hover{opacity:0.88}

/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 800px 600px at 50% 30%,rgba(232,73,10,0.06) 0%,transparent 70%)}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:var(--accentBg);border:1px solid rgba(232,73,10,0.2);color:var(--accent);padding:6px 16px;border-radius:100px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:28px}
.hero-eyebrow::before{content:'◈';font-size:14px}
h1{font-family:'Playfair Display',serif;font-size:clamp(56px,8vw,96px);line-height:1.0;font-weight:700;letter-spacing:-1px;max-width:900px;margin-bottom:24px}
h1 em{font-style:italic;color:var(--accent)}
.hero-sub{font-size:clamp(17px,2.2vw,21px);color:var(--sub);max-width:520px;line-height:1.7;margin-bottom:44px;font-weight:400}
.hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center}
.btn-primary{background:var(--text);color:var(--bg);padding:16px 36px;border-radius:100px;font-size:16px;font-weight:600;text-decoration:none;transition:opacity .2s;letter-spacing:-0.2px}
.btn-primary:hover{opacity:0.82}
.btn-secondary{background:var(--surface);color:var(--text);padding:16px 36px;border-radius:100px;font-size:16px;font-weight:500;text-decoration:none;border:1px solid var(--border);transition:border-color .2s}
.btn-secondary:hover{border-color:var(--text)}

/* SOCIAL PROOF STRIP */
.proof-strip{display:flex;gap:32px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:56px;padding-top:40px;border-top:1px solid var(--border)}
.proof-item{font-size:14px;color:var(--muted);display:flex;align-items:center;gap:8px}
.proof-num{font-size:22px;font-weight:700;color:var(--text);font-family:'Playfair Display',serif}

/* PHONE MOCK */
.mockup-section{padding:80px 24px;max-width:1100px;margin:0 auto}
.mockup-row{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.mockup-row.flip{direction:rtl}
.mockup-row.flip > *{direction:ltr}
.phone-frame{width:240px;margin:0 auto;background:var(--text);border-radius:36px;padding:10px;box-shadow:0 32px 80px rgba(28,25,23,0.15),0 8px 24px rgba(28,25,23,0.08)}
.phone-screen{background:var(--bg);border-radius:28px;overflow:hidden;aspect-ratio:390/844}
.phone-screen img{width:100%;height:100%;object-fit:cover}
.phone-notch{width:80px;height:10px;background:var(--text);border-radius:0 0 10px 10px;margin:0 auto 8px}
.mockup-copy h2{font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,48px);line-height:1.1;margin-bottom:16px;letter-spacing:-0.5px}
.mockup-copy p{color:var(--sub);font-size:17px;line-height:1.75;margin-bottom:24px}
.feature-list{list-style:none;display:flex;flex-direction:column;gap:10px}
.feature-list li{display:flex;align-items:flex-start;gap:12px;font-size:15px;color:var(--sub)}
.feature-list li::before{content:'◈';color:var(--accent);font-size:14px;margin-top:2px;flex-shrink:0}

/* BENTO GRID */
.bento-section{padding:80px 24px;max-width:1100px;margin:0 auto}
.bento-section h2{font-family:'Playfair Display',serif;font-size:clamp(36px,5vw,56px);text-align:center;margin-bottom:12px;letter-spacing:-0.5px}
.bento-section .section-sub{text-align:center;color:var(--sub);font-size:17px;margin-bottom:52px}
.bento-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;gap:16px}
.bento-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px}
.bento-card.wide{grid-column:span 2}
.bento-card.accent{background:var(--accent);border-color:var(--accent)}
.bento-card.accent .bento-title,.bento-card.accent .bento-body{color:#fff}
.bento-card.dark{background:var(--text);border-color:var(--text)}
.bento-card.dark .bento-title,.bento-card.dark .bento-body{color:var(--bg)}
.bento-icon{font-size:28px;margin-bottom:16px}
.bento-title{font-size:18px;font-weight:700;margin-bottom:8px;letter-spacing:-0.2px}
.bento-body{font-size:14px;color:var(--sub);line-height:1.6}
.bento-stat{font-family:'Playfair Display',serif;font-size:48px;font-weight:700;line-height:1;margin-bottom:8px}

/* HABIT PREVIEW */
.preview-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.chip{background:var(--accentBg);color:var(--accent);padding:4px 12px;border-radius:100px;font-size:12px;font-weight:600}
.chip.teal{background:var(--tealBg);color:var(--teal)}
.chip.green{background:var(--greenBg);color:var(--green)}
.chip.amber{background:var(--amberBg);color:var(--amber)}

/* STREAK VISUAL */
.heatmap-preview{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:16px}
.hmap-cell{aspect-ratio:1;border-radius:3px}

/* TESTIMONIALS */
.testimonials{padding:80px 24px;max-width:900px;margin:0 auto}
.testimonials h2{font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,48px);text-align:center;margin-bottom:48px;letter-spacing:-0.5px}
.testimonial-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.tcard{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px}
.tcard blockquote{font-size:16px;color:var(--sub);line-height:1.75;margin-bottom:20px;font-style:italic}
.tcard cite{font-size:13px;font-weight:600;color:var(--text);font-style:normal}
.tcard cite span{color:var(--muted);font-weight:400}

/* CTA */
.cta-section{padding:80px 24px;text-align:center}
.cta-inner{background:var(--text);border-radius:32px;padding:72px 40px;max-width:720px;margin:0 auto}
.cta-inner h2{font-family:'Playfair Display',serif;font-size:clamp(36px,5vw,52px);color:var(--bg);margin-bottom:16px;letter-spacing:-0.5px}
.cta-inner p{color:rgba(247,244,239,0.6);font-size:17px;margin-bottom:36px}
.cta-inner .btn-light{background:var(--bg);color:var(--text);padding:16px 40px;border-radius:100px;font-size:16px;font-weight:700;text-decoration:none;display:inline-block;transition:opacity .2s}
.cta-inner .btn-light:hover{opacity:0.88}

/* FOOTER */
footer{border-top:1px solid var(--border);padding:32px 40px;display:flex;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto}
footer .logo{font-weight:800;font-size:16px;letter-spacing:-0.3px}
footer .logo span{color:var(--accent)}
footer p{color:var(--muted);font-size:13px}

@media(max-width:768px){
  .mockup-row{grid-template-columns:1fr}
  .mockup-row.flip{direction:ltr}
  .bento-grid{grid-template-columns:1fr}
  .bento-card.wide{grid-column:span 1}
  .testimonial-grid{grid-template-columns:1fr}
  footer{flex-direction:column;gap:12px;text-align:center}
}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">HABIT<span>AT</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#how">How it works</a>
    <a href="#reviews">Reviews</a>
    <a class="nav-cta" href="/habitat-viewer">View Design →</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">Habit tracker for deep workers</div>
  <h1>Build habits that <em>compound</em></h1>
  <p class="hero-sub">HABITAT helps focused individuals track deep work, protect streaks, and reflect — without the dopamine circus of gamification.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="/habitat-viewer">Explore the design →</a>
    <a class="btn-secondary" href="/habitat-mock">Interactive mock ☀◑</a>
  </div>
  <div class="proof-strip">
    <div class="proof-item"><span class="proof-num">21d</span> avg. streak</div>
    <div class="proof-item"><span class="proof-num">84%</span> weekly completion</div>
    <div class="proof-item"><span class="proof-num">5 screens</span> · light theme</div>
    <div class="proof-item"><span class="proof-num">Zero</span> dark patterns</div>
  </div>
</section>

<!-- BENTO FEATURES -->
<section class="bento-section" id="features">
  <h2>Built around your <em style="font-style:italic;color:var(--accent)">focus</em></h2>
  <p class="section-sub">Everything you need, nothing you don't.</p>
  <div class="bento-grid">
    <div class="bento-card wide">
      <div class="bento-icon">◈</div>
      <div class="bento-title">Today's Habit Board</div>
      <div class="bento-body">A clean, distraction-free view of your day. Morning, afternoon, and evening habits organized with a single completion ring that tells you exactly where you stand at a glance.</div>
      <div class="preview-chips">
        <span class="chip teal">Deep Work ✓</span>
        <span class="chip green">Morning Pages ✓</span>
        <span class="chip">Cold Shower ○</span>
        <span class="chip amber">Exercise ○</span>
      </div>
    </div>
    <div class="bento-card accent">
      <div class="bento-icon">🔥</div>
      <div class="bento-stat">21d</div>
      <div class="bento-title">Streak Engine</div>
      <div class="bento-body">Visual heatmaps and per-habit streak tracking that reward consistency without punishing imperfection.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">◎</div>
      <div class="bento-title">Focus Timer</div>
      <div class="bento-body">Pomodoro modes for every work style — Classic 25/5, Deep 50/10, or Flow 90/20. Links directly to your habits.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">▤</div>
      <div class="bento-title">Reflection Journal</div>
      <div class="bento-body">Daily mood check-in and two guided prompts. Weekly intentions keep you anchored to the bigger picture.</div>
    </div>
    <div class="bento-card dark wide">
      <div class="bento-icon">📊</div>
      <div class="bento-title">Weekly Review</div>
      <div class="bento-body">Every Sunday: an honest look at what worked, what didn't, and a focus-hours bar chart showing your best and worst days. Pattern recognition for the long game.</div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="mockup-section" id="how">
  <div class="mockup-row">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen" style="display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px">
        <div style="width:100%;font-family:Inter,sans-serif">
          <div style="font-size:10px;color:var(--muted);margin-bottom:4px">Wednesday</div>
          <div style="font-size:20px;font-weight:800;color:var(--text);margin-bottom:12px">March 25</div>
          <div style="background:var(--surface);border-radius:12px;padding:12px;border:1px solid var(--border);margin-bottom:10px">
            <div style="font-size:36px;font-weight:800;color:var(--accent);line-height:1">72<span style="font-size:18px">%</span></div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:6px">13 of 18 habits done</div>
            <div style="height:4px;background:var(--border);border-radius:2px"><div style="width:72%;height:4px;background:var(--accent);border-radius:2px"></div></div>
          </div>
          <div style="background:var(--tealBg);border-radius:8px;padding:8px 10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
            <span style="color:var(--teal);font-weight:700;font-size:12px">◉</span>
            <div><div style="font-size:11px;font-weight:600;color:var(--text)">Deep Work Block</div><div style="font-size:9px;color:var(--teal)">2h 30m</div></div>
          </div>
          <div style="background:var(--greenBg);border-radius:8px;padding:8px 10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
            <span style="color:var(--green);font-weight:700;font-size:12px">◉</span>
            <div><div style="font-size:11px;font-weight:600;color:var(--text)">Morning Pages</div><div style="font-size:9px;color:var(--green)">3 pages</div></div>
          </div>
          <div style="background:var(--surface);border-radius:8px;padding:8px 10px;border:1px solid var(--border);display:flex;align-items:center;gap:8px">
            <span style="color:var(--muted);font-size:12px">○</span>
            <div><div style="font-size:11px;font-weight:600;color:var(--text)">Cold Shower</div><div style="font-size:9px;color:var(--muted)">pending</div></div>
          </div>
        </div>
      </div>
    </div>
    <div class="mockup-copy">
      <h2>Start every morning with clarity</h2>
      <p>Your day's habits, organized into time blocks. One editorial number tells you where you stand. No noise, no notifications — just the work.</p>
      <ul class="feature-list">
        <li>Color-coded habit categories (deep work, wellness, creative)</li>
        <li>Live completion ring updates as you check habits</li>
        <li>Streak badge visible at all times so you never break the chain</li>
      </ul>
    </div>
  </div>
</section>

<!-- STREAK HEATMAP SECTION -->
<section class="mockup-section">
  <div class="mockup-row flip">
    <div class="mockup-copy">
      <h2>Streaks that actually mean something</h2>
      <p>Per-habit streak tracking with a monthly heatmap. See patterns, not just numbers. The 21-day hero card gives your best streak the spotlight it deserves.</p>
      <ul class="feature-list">
        <li>Individual streaks for every habit you track</li>
        <li>Monthly heatmap shows completion at a glance</li>
        <li>Best-ever records for each habit</li>
      </ul>
      <div class="heatmap-preview">
        ${Array.from({length:35},(_,i)=>{
          const filled=[1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,0,1,1,1,1,0,1,1,1,1,1,1,0,0];
          const isToday=i===24;
          const bg=isToday?'var(--accent)':filled[i]?'var(--green)':'var(--border)';
          return `<div class="hmap-cell" style="background:${bg}"></div>`;
        }).join('')}
      </div>
    </div>
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen" style="background:var(--bg);padding:16px;font-family:Inter,sans-serif">
        <div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:4px">Streaks</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:12px">Keep the chain alive</div>
        <div style="background:var(--accent);border-radius:14px;padding:14px;margin-bottom:10px">
          <div style="font-size:32px;font-weight:800;color:#fff;line-height:1">21 <span style="font-size:14px;font-weight:500;opacity:0.75">day streak</span></div>
          <div style="font-size:10px;color:rgba(255,255,255,0.65);margin-top:4px">Deep Work Block · Best: 34d</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${[['Morning Pages','18d','var(--green)','var(--greenBg)'],['Cold Shower','7d','var(--teal)','var(--tealBg)'],['No Social','14d','var(--amber)','var(--amberBg)'],['Exercise','3d','var(--accent)','var(--accentBg)']].map(([n,s,c,bg])=>`
          <div style="background:${bg};border-radius:10px;padding:10px">
            <div style="font-size:18px;font-weight:800;color:${c}">${s}</div>
            <div style="font-size:9px;color:${c};margin-top:2px">${n}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="testimonials" id="reviews">
  <h2>From deep workers</h2>
  <div class="testimonial-grid">
    <div class="tcard">
      <blockquote>"HABITAT is the first habit app that doesn't feel like it's competing for my attention. It's calm, clear, and the streak card for Deep Work hits differently when you're on day 21."</blockquote>
      <cite>Mara K. <span>— Indie maker, 3 months in</span></cite>
    </div>
    <div class="tcard">
      <blockquote>"The Weekly Review screen alone is worth it. Seeing Friday as my peak focus day changed how I schedule my hardest projects."</blockquote>
      <cite>James R. <span>— Software engineer</span></cite>
    </div>
    <div class="tcard">
      <blockquote>"I've tried Streaks, Habitica, Done — HABITAT is the first one that doesn't feel gamified. It trusts you to be an adult."</blockquote>
      <cite>Priya S. <span>— Writer & researcher</span></cite>
    </div>
    <div class="tcard">
      <blockquote>"The Focus Timer linking directly to my habit log means I don't have to think. Session done → habit checked. Seamless."</blockquote>
      <cite>Olu A. <span>— Consultant, ex-McKinsey</span></cite>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-inner">
    <h2>Build the discipline to build anything.</h2>
    <p>5 screens. One clear system. Deep work, compounded daily.</p>
    <a class="btn-light" href="/habitat-viewer">Explore the full design →</a>
  </div>
</section>

<footer>
  <div class="logo">HABIT<span>AT</span></div>
  <p>Designed by RAM · Design Heartbeat · March 2026</p>
  <p style="color:var(--muted);font-size:13px">Inspired by Awwwards · Dark Mode Design · Land-book</p>
</footer>

</body>
</html>`;
}

// ─── VIEWER PAGE ──────────────────────────────────────────────────────────────
function buildViewer(penJson) {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>HABITAT — Pencil Viewer</title>
<script src="https://unpkg.com/pencil-viewer@latest/dist/pencil-viewer.umd.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#F7F4EF;font-family:Inter,sans-serif;display:flex;flex-direction:column;min-height:100vh}
header{background:#fff;border-bottom:1px solid #E2DDD6;padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
header h1{font-size:16px;font-weight:700;color:#1C1917}
header h1 span{color:#E8490A}
.back{font-size:13px;color:#6B6560;text-decoration:none;display:flex;align-items:center;gap:6px}
.back:hover{color:#1C1917}
#viewer{flex:1;display:flex;align-items:center;justify-content:center;padding:32px}
</style>
</head>
<body>
<header>
  <a class="back" href="/habitat">← Back to landing</a>
  <h1>HABIT<span>AT</span> — Pencil Viewer</h1>
  <a href="/habitat-mock" style="font-size:13px;color:#E8490A;text-decoration:none;font-weight:600">Interactive Mock ☀◑ →</a>
</header>
<div id="viewer"></div>
<script>
const penData = window.EMBEDDED_PEN;
if(penData && window.PencilViewer){
  window.PencilViewer.init(document.getElementById('viewer'), JSON.parse(penData));
} else {
  document.getElementById('viewer').innerHTML = '<p style="color:#A8A29B;font-size:14px">Viewer loading… ensure pencil-viewer is available.</p>';
}
<\/script>
</body>
</html>`;

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  const penJson = fs.readFileSync(path.join(__dirname, 'habitat.pen'), 'utf8');

  console.log('Publishing hero page…');
  const heroRes = await zenPublish(SLUG, buildHero(), `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.url || heroRes.raw?.slice(0,120) || JSON.stringify(heroRes).slice(0,120));

  console.log('Publishing viewer…');
  const viewerRes = await zenPublish(`${SLUG}-viewer`, buildViewer(penJson), `${APP_NAME} — Design Viewer`);
  console.log('Viewer:', viewerRes.url || viewerRes.raw?.slice(0,120) || JSON.stringify(viewerRes).slice(0,120));

  console.log('\nDone!');
  console.log(`Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
})();
