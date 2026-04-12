// form-publish.js — FORM hero + gallery
// Theme: DARK — near-black + electric lime
// Inspired by Equinox (equinox.com) — pure black, all-caps grotesque confidence
// + Guarding Your Dawns / Qream (Awwwards SOTD) — dark drama + bold type

import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FORM — train with intention</title>
  <meta name="description" content="Premium personal training app. Near-black + electric lime. Coach messaging, live session tracking, 12-week program view. A RAM design concept.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ram.zenbin.org/form">
  <meta property="og:title" content="FORM — train with intention">
  <meta property="og:description" content="Premium personal training app. Near-black + electric lime. Coach messaging, live session tracking, 12-week program view. A RAM design concept.">
  <meta property="og:site_name" content="RAM Design Studio">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="FORM — train with intention">
  <meta name="twitter:description" content="Premium personal training app. Near-black + electric lime. Coach messaging, live session tracking, 12-week program view. A RAM design concept.">
  <meta name="twitter:site" content="@ram_design">
  <meta name="theme-color" content="#C8F044">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#080808;--surface:#131313;--card:#1A1A1A;
    --lime:#C8F044;--bone:#F0EAE0;--grey:#8A8A8A;
    --coal:#2A2A2A;--gold:#E8B830;--red:#FF3D2E;
    --muted:rgba(240,234,224,0.38);--border:rgba(240,234,224,0.08);
  }

  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--bone);font-family:'Syne',sans-serif;line-height:1.4;overflow-x:hidden}

  /* ─── NAV ─── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;background:var(--bg);border-bottom:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px}
  .nav-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:.06em;text-decoration:none;color:var(--bone)}
  .nav-links{display:flex;gap:36px;list-style:none}
  .nav-links a{font-size:12px;color:var(--grey);text-decoration:none;font-family:'DM Mono',monospace;letter-spacing:.08em}
  .nav-cta{background:var(--lime);color:var(--bg);border:none;padding:10px 22px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Mono',monospace;letter-spacing:.06em}

  /* ─── HERO ─── */
  .hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:80px 0 0;overflow:hidden}
  .hero-left{padding:0 72px 72px}
  .hero-eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.18em;color:var(--lime);margin-bottom:24px;text-transform:uppercase}
  .hero-title{font-family:'Syne',sans-serif;font-weight:800;font-size:80px;line-height:0.90;letter-spacing:-.02em;margin-bottom:36px;text-transform:uppercase}
  .hero-title em{color:var(--lime);font-style:normal}
  .hero-sub{font-family:'DM Mono',monospace;font-size:14px;color:var(--muted);line-height:1.85;max-width:420px;margin-bottom:52px;letter-spacing:.02em}
  .hero-btns{display:flex;gap:14px;align-items:center}
  .btn-lime{background:var(--lime);color:var(--bg);padding:14px 30px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:.08em;text-decoration:none;display:inline-block;font-family:'DM Mono',monospace;text-transform:uppercase}
  .btn-outline{border:1px solid var(--border);color:var(--grey);padding:13px 28px;border-radius:4px;font-size:12px;letter-spacing:.08em;text-decoration:none;display:inline-block;font-family:'DM Mono',monospace;text-transform:uppercase}
  .hero-right{height:100vh;position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:center;padding-bottom:0}

  /* Phone */
  .phone-wrap{width:300px;transform:translateY(36px)}
  .phone{width:300px;height:620px;background:var(--surface);border-radius:40px;overflow:hidden;border:5px solid #1E1E1E;box-shadow:0 60px 120px rgba(0,0,0,0.8),0 0 0 1px rgba(240,234,224,0.04);position:relative}
  .phone-notch{width:90px;height:22px;background:var(--bg);border-radius:0 0 14px 14px;position:absolute;top:0;left:50%;transform:translateX(-50%);z-index:2}
  .p-screen{padding:30px 16px 16px;height:100%;background:var(--bg);overflow:hidden}

  /* Screen UI */
  .p-day{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.14em;color:var(--grey);text-transform:uppercase;margin-bottom:8px}
  .p-title{font-family:'Syne',sans-serif;font-weight:800;font-size:34px;line-height:0.92;letter-spacing:-.01em;text-transform:uppercase;margin-bottom:12px}
  .p-accent{width:36px;height:2px;background:var(--lime);border-radius:1px;margin-bottom:16px}
  .p-card{background:var(--surface);border-radius:6px;overflow:hidden;margin-bottom:10px;position:relative}
  .p-card-lime{width:3px;height:100%;background:var(--lime);position:absolute;left:0;top:0}
  .p-card-body{padding:10px 10px 10px 18px}
  .p-card-label{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.12em;color:var(--grey);margin-bottom:4px}
  .p-card-name{font-family:'Syne',sans-serif;font-weight:800;font-size:16px;text-transform:uppercase;line-height:1.1}
  .p-card-meta{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);margin-top:6px}
  .p-start{background:var(--lime);color:var(--bg);border:none;padding:6px 14px;border-radius:3px;font-family:'DM Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-top:8px}
  .p-ex{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(240,234,224,0.05)}
  .p-ex-dot{width:12px;height:12px;border-radius:6px;flex-shrink:0}
  .p-ex-dot.done{background:var(--lime)}
  .p-ex-dot.todo{background:var(--coal)}
  .p-ex-name{font-family:'Syne',sans-serif;font-size:11px;font-weight:700}
  .p-ex-sets{font-family:'DM Mono',monospace;font-size:9px;color:var(--grey);margin-left:auto}
  .p-coach{background:var(--card);border-radius:5px;padding:8px 12px;margin-top:8px}
  .p-coach-txt{font-family:'DM Mono',monospace;font-size:9px;color:var(--lime);line-height:1.55}

  /* Floating stats */
  .float-stat{position:absolute;background:var(--surface);border-radius:10px;padding:12px 16px;border:1px solid var(--border)}
  .fs-val{font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:var(--lime)}
  .fs-label{font-family:'DM Mono',monospace;font-size:9px;color:var(--grey);margin-top:2px;letter-spacing:.06em;text-transform:uppercase}

  /* ─── MANIFESTO ─── */
  .manifesto{padding:120px 72px;background:var(--lime)}
  .manifesto-inner{max-width:1240px;margin:0 auto}
  .m-title{font-family:'Syne',sans-serif;font-weight:800;font-size:80px;line-height:0.88;letter-spacing:-.02em;text-transform:uppercase;color:var(--bg);max-width:900px}
  .m-sub{font-family:'DM Mono',monospace;font-size:14px;color:rgba(8,8,8,0.55);margin-top:32px;max-width:480px;line-height:1.9;letter-spacing:.02em}

  /* ─── FEATURES ─── */
  .features{padding:96px 72px;background:var(--bg);border-top:1px solid var(--border)}
  .features-inner{max-width:1240px;margin:0 auto}
  .feat-eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;color:var(--lime);margin-bottom:16px;text-transform:uppercase}
  .feat-title{font-family:'Syne',sans-serif;font-weight:800;font-size:48px;line-height:0.95;text-transform:uppercase;letter-spacing:-.02em;margin-bottom:64px;max-width:560px}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:8px;overflow:hidden}
  .feat-card{background:var(--bg);padding:36px 28px}
  .feat-num{font-family:'DM Mono',monospace;font-size:11px;color:var(--lime);letter-spacing:.1em;margin-bottom:20px}
  .feat-card h3{font-family:'Syne',sans-serif;font-weight:800;font-size:18px;text-transform:uppercase;margin-bottom:12px;letter-spacing:.02em}
  .feat-card p{font-family:'DM Mono',monospace;font-size:12px;line-height:1.8;color:var(--muted);letter-spacing:.01em}

  /* ─── STATS ─── */
  .stats{padding:80px 72px;background:var(--surface);border-top:1px solid var(--border)}
  .stats-inner{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:8px;overflow:hidden}
  .stat-card{background:var(--surface);padding:40px 32px}
  .stat-n{font-family:'Syne',sans-serif;font-weight:800;font-size:54px;color:var(--lime);line-height:1}
  .stat-t{font-family:'Syne',sans-serif;font-size:14px;margin:10px 0 6px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
  .stat-d{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);line-height:1.75;letter-spacing:.01em}

  /* ─── CTA ─── */
  .cta{padding:140px 72px;text-align:center;background:var(--bg)}
  .cta-inner{max-width:720px;margin:0 auto}
  .cta h2{font-family:'Syne',sans-serif;font-weight:800;font-size:72px;line-height:0.90;letter-spacing:-.02em;text-transform:uppercase;margin-bottom:28px}
  .cta h2 em{color:var(--lime);font-style:normal}
  .cta p{font-family:'DM Mono',monospace;font-size:14px;color:var(--muted);line-height:1.9;margin-bottom:52px;letter-spacing:.02em}

  footer{padding:36px 72px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
  .footer-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:16px;letter-spacing:.06em}
  .footer-note{font-family:'DM Mono',monospace;font-size:11px;color:var(--grey);letter-spacing:.04em}
  .footer-tag{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.12em;color:var(--lime);padding:5px 12px;border:1px solid rgba(200,240,68,.3);border-radius:3px;text-transform:uppercase}

  @media(max-width:900px){
    .hero{grid-template-columns:1fr;padding:100px 24px 64px}
    .hero-right{height:520px}
    .feat-grid{grid-template-columns:1fr}
    .stats-inner{grid-template-columns:1fr 1fr}
    nav{padding:0 24px}
    .nav-links{display:none}
    .hero-left{padding:0 0 48px}
    .hero-title{font-size:52px}
    .manifesto{padding:72px 24px}
    .m-title{font-size:48px}
    .features,.stats,.cta{padding:72px 24px}
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">FORM</a>
  <ul class="nav-links">
    <li><a href="#">TODAY</a></li>
    <li><a href="#">PROGRAM</a></li>
    <li><a href="#">COACHES</a></li>
    <li><a href="#">PRICING</a></li>
  </ul>
  <button class="nav-cta">START TRAINING</button>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">Premium Personal Training · 2026</div>
    <h1 class="hero-title">TRAIN<br>WITH<br><em>INTEN-<br>TION.</em></h1>
    <p class="hero-sub">Your coach. Your program. Your data. FORM connects you with elite strength coaches and gives you the precision tools to train like it matters — because it does.</p>
    <div class="hero-btns">
      <a class="btn-lime" href="#">GET STARTED</a>
      <a class="btn-outline" href="#">SEE HOW IT WORKS →</a>
    </div>
  </div>

  <div class="hero-right">
    <!-- Floating stats -->
    <div class="float-stat" style="left:2%;top:20%">
      <div class="fs-val">+18%</div>
      <div class="fs-label">BENCH PRESS</div>
    </div>
    <div class="float-stat" style="right:1%;top:38%;max-width:150px">
      <div class="fs-val">89%</div>
      <div class="fs-label">ADHERENCE RATE</div>
    </div>

    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="p-screen">
          <div class="p-day">MARCH 27 · WEEK 4 OF 12</div>
          <div class="p-title">WEDNES-<br>DAY.<br>PUSH.</div>
          <div class="p-accent"></div>
          <div class="p-card">
            <div class="p-card-lime"></div>
            <div class="p-card-body">
              <div class="p-card-label">TODAY'S SESSION</div>
              <div class="p-card-name">UPPER<br>STRENGTH</div>
              <div class="p-card-meta">5 exercises · ~52 min · Coach: Dara</div>
              <button class="p-start">START SESSION →</button>
            </div>
          </div>
          <div class="p-ex">
            <div class="p-ex-dot done"></div>
            <div class="p-ex-name">Bench Press</div>
            <div class="p-ex-sets">4×6 · 85kg ✓</div>
          </div>
          <div class="p-ex">
            <div class="p-ex-dot done"></div>
            <div class="p-ex-name">Incline DB Press</div>
            <div class="p-ex-sets">3×10 · 30kg ✓</div>
          </div>
          <div class="p-ex">
            <div class="p-ex-dot todo"></div>
            <div class="p-ex-name">Cable Fly</div>
            <div class="p-ex-sets">3×12 · 15kg</div>
          </div>
          <div class="p-coach">
            <div class="p-coach-txt">↑ Dara: "Push bench to 90kg — your form looked solid Tuesday."</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Manifesto -->
<section class="manifesto">
  <div class="manifesto-inner">
    <h2 class="m-title">YOU'VE LEFT YOUR COMFORT ZONE.</h2>
    <p class="m-sub">Most people exercise. A few people train. FORM is built for the ones who know the difference — and want a coach who does too.</p>
  </div>
</section>

<!-- Features -->
<section class="features">
  <div class="features-inner">
    <div class="feat-eyebrow">HOW FORM WORKS</div>
    <h2 class="feat-title">PRECISION.<br>PROGRAM.<br>PROGRESS.</h2>
    <div class="feat-grid">
      <div class="feat-card">
        <div class="feat-num">01 —</div>
        <h3>Coach match</h3>
        <p>Matched to an elite strength coach based on your goals, history and schedule. Not an algorithm. A person who knows your name and your lifts.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">02 —</div>
        <h3>Live sessions</h3>
        <p>Exercise-by-exercise guidance. Set counters, rest timers, load progressions and real-time coach notes. Train with precision.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">03 —</div>
        <h3>12-week programs</h3>
        <p>Structured periodisation — hypertrophy, strength, peak. Your coach writes it. FORM tracks it. You execute it.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">04 —</div>
        <h3>Progress data</h3>
        <p>Personal records, volume tracking, key lift trends. Tabular clarity — no vanity charts, just the numbers that matter to your performance.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">05 —</div>
        <h3>Coach messaging</h3>
        <p>Direct line to your coach. Weekly check-ins, form notes, load adjustments, programming changes. The relationship that makes the difference.</p>
      </div>
      <div class="feat-card">
        <div class="feat-num">06 —</div>
        <h3>Weekly check-ins</h3>
        <p>Video check-ins every Friday. Your coach reviews your week, adjusts the program and pushes you to the next level. Accountability, built in.</p>
      </div>
    </div>
  </div>
</section>

<!-- Stats -->
<section class="stats">
  <div class="stats-inner">
    <div class="stat-card">
      <div class="stat-n">+22%</div>
      <div class="stat-t">Average strength gain</div>
      <div class="stat-d">In the first 12-week block, across bench, squat and deadlift.</div>
    </div>
    <div class="stat-card">
      <div class="stat-n">89%</div>
      <div class="stat-t">Session adherence</div>
      <div class="stat-d">FORM athletes complete 89% of programmed sessions vs 58% solo average.</div>
    </div>
    <div class="stat-card">
      <div class="stat-n">4.9★</div>
      <div class="stat-t">Coach satisfaction</div>
      <div class="stat-d">Rated across communication, programming quality and outcome delivery.</div>
    </div>
    <div class="stat-card">
      <div class="stat-n">3×</div>
      <div class="stat-t">Faster progress</div>
      <div class="stat-d">Athletes with coaches progress 3× faster than those training alone, across all skill levels.</div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta">
  <div class="cta-inner">
    <h2>TRAIN<br>LIKE IT<br><em>MATTERS.</em></h2>
    <p>Match with a coach in 48 hours. Start your first program this week.</p>
    <a class="btn-lime" href="#">GET STARTED →</a>
  </div>
</section>

<footer>
  <div class="footer-logo">FORM</div>
  <div class="footer-note">A RAM DESIGN CONCEPT · MARCH 2026</div>
  <div class="footer-tag">DARK THEME</div>
</footer>

</body>
</html>`;

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, rs => {
      let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>res({status:rs.statusCode,body:d}));
    });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}

fs.writeFileSync('form-hero.html', hero);
console.log('✓ Saved form-hero.html locally');

console.log('📤 Publishing to ZenBin...');
const body = Buffer.from(JSON.stringify({ html: hero }));
try {
  const res = await req({ hostname:'zenbin.org', path:'/v1/pages/form?overwrite=true', method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':body.length,'X-Subdomain':'ram'} }, body);
  if (res.status===200||res.status===201) console.log('✓ Hero live at: https://ram.zenbin.org/form');
  else console.log(`✗ ZenBin ${res.status}: ${res.body.slice(0,120)}`);
} catch(e) { console.log('✗ ZenBin:', e.message); }

console.log('📚 Updating gallery...');
try {
  const headers = {'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'};
  const g = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
  const gj = JSON.parse(g.body);
  const q = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));
  if (Array.isArray(q)) { q.submissions = q; }
  q.submissions = (q.submissions||[]).filter(s=>s.app_name!=='FORM');
  const now = new Date().toISOString();
  q.submissions.push({
    id:`heartbeat-form-${Date.now()}`,status:'done',app_name:'FORM',
    tagline:'train with intention',archetype:'fitness-training',
    design_url:'https://ram.zenbin.org/form',mock_url:'https://ram.zenbin.org/form-mock',
    submitted_at:now,published_at:now,credit:'RAM Design Heartbeat',
    prompt:'Inspired by Equinox (equinox.com) — pure black background, enormous all-caps Syne grotesque type, "YOU\'VE LEFT YOUR COMFORT ZONE" typographic confidence, zero decoration; Guarding Your Dawns by Qream (Awwwards SOTD) — dark drama, bold red/dark silhouette aesthetic; DVTK ASCII art (Siteinspire) — monospace-as-design, DM Mono texture. Dark theme. Near-black #080808 + electric lime #C8F044 accent (premium athletic, like a racing stripe). Syne 800 all-caps for UI + DM Mono for all data/labels. 5 screens: Today (push day session card + exercise checklist + coach message), Live Session (huge exercise name, set counter, rest timer, tabular set log), Program (12-week grid blocks, phase card, weekly day list), Progress (personal records, volume bar chart, key lifts table with % gains), Coach (avatar + notes with tags + message thread + send input).',
    screens:5,source:'heartbeat',theme:'dark',
  });
  q.updated_at = now;
  const encoded = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
  const putBody = Buffer.from(JSON.stringify({message:'feat: add FORM to gallery (heartbeat)',content:encoded,sha:gj.sha}));
  const p = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
    headers:{...headers,'Content-Length':putBody.length}},putBody);
  console.log(`✓ Gallery updated (${p.status}) — ${q.submissions.length} total entries`);
} catch(e) { console.log('✗ Gallery:', e.message); }
