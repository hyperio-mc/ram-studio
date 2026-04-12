// WANE — publish hero + viewer
const fs   = require('fs');
const path = require('path');
const http = require('http');

const SLUG     = 'wane';
const HOST     = 'ram.zenbin.org';
const APP_NAME = 'WANE';
const TAGLINE  = 'Wind down. Find your rhythm.';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: HOST, port: 80, path: '/publish', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = http.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WANE — Wind down. Find your rhythm.</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:#080B18; --surface:#0F1326; --surf2:#161B38; --border:#1F2750;
    --text:#E8E6FF; --muted:#7B7FA8;
    --accent:#7C5CFC; --teal:#00D4C8; --amber:#F5A653;
    --glow:rgba(124,92,252,0.22);
  }
  html { scroll-behavior:smooth; }
  body { font-family:'Inter',sans-serif; background:var(--bg); color:var(--text); overflow-x:hidden; min-height:100vh; }

  nav {
    position:fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 48px;
    background:rgba(8,11,24,0.88); backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo { font-size:18px; font-weight:800; letter-spacing:3px; color:var(--text); }
  .nav-logo em { color:var(--accent); font-style:normal; }
  .nav-links { display:flex; gap:28px; }
  .nav-links a { color:var(--muted); text-decoration:none; font-size:14px; transition:color .2s; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta {
    background:var(--accent); color:#fff; border-radius:50px;
    padding:10px 22px; font-size:13px; font-weight:600; text-decoration:none;
    box-shadow:0 0 20px rgba(124,92,252,.4); transition:all .2s;
  }
  .nav-cta:hover { transform:translateY(-1px); box-shadow:0 0 32px rgba(124,92,252,.65); }

  .hero {
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    text-align:center; padding:120px 24px 80px; position:relative; overflow:hidden;
  }
  .blob {
    position:absolute; border-radius:50%; pointer-events:none;
    background:radial-gradient(circle, var(--c) 0%, transparent 70%);
  }
  .blob-1 { top:-120px; left:-120px; width:600px; height:600px; --c:rgba(124,92,252,.18); }
  .blob-2 { bottom:-80px; right:-80px; width:500px; height:500px; --c:rgba(0,212,200,.12); }

  .hero-inner { position:relative; z-index:1; max-width:780px; }
  .hero-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(124,92,252,.1); border:1px solid rgba(124,92,252,.3);
    border-radius:50px; padding:6px 18px; margin-bottom:32px;
    font-size:11px; font-weight:700; color:var(--accent); letter-spacing:1.5px; text-transform:uppercase;
  }
  h1 {
    font-size:clamp(52px,9vw,92px); font-weight:800; line-height:1.0;
    letter-spacing:-3px; margin-bottom:24px;
  }
  .grad { background:linear-gradient(135deg,var(--accent),var(--teal)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .hero-sub { font-size:18px; color:var(--muted); max-width:540px; margin:0 auto 48px; line-height:1.7; }
  .btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
  .btn-p {
    background:var(--accent); color:#fff; border-radius:50px;
    padding:14px 32px; font-size:15px; font-weight:600; text-decoration:none;
    box-shadow:0 0 24px rgba(124,92,252,.45); transition:all .2s;
  }
  .btn-p:hover { transform:translateY(-2px); box-shadow:0 0 40px rgba(124,92,252,.65); }
  .btn-s {
    background:var(--surf2); color:var(--text); border-radius:50px;
    padding:14px 32px; font-size:15px; font-weight:500; text-decoration:none;
    border:1px solid var(--border); transition:all .2s;
  }
  .btn-s:hover { border-color:var(--accent); color:var(--accent); }

  .inspo { padding:14px 48px; text-align:center; font-size:12px; color:var(--muted); background:rgba(124,92,252,.05); border-top:1px solid rgba(124,92,252,.14); border-bottom:1px solid rgba(124,92,252,.14); }
  .inspo span { color:var(--accent); font-weight:600; }

  section { padding:80px 24px; max-width:1160px; margin:0 auto; }
  .slabel { font-size:10px; font-weight:700; letter-spacing:2.5px; color:var(--accent); text-transform:uppercase; margin-bottom:14px; }
  .stitle { font-size:clamp(30px,5vw,50px); font-weight:800; line-height:1.1; margin-bottom:14px; }
  .ssub { color:var(--muted); font-size:16px; max-width:540px; line-height:1.6; margin-bottom:52px; }

  .screens-row { display:flex; gap:18px; overflow-x:auto; padding-bottom:20px; }
  .screen-card {
    background:var(--surface); border:1px solid var(--border); border-radius:24px;
    padding:20px; min-width:160px; flex-shrink:0;
    transition:all .3s; cursor:default;
  }
  .screen-card:hover { transform:translateY(-8px); border-color:var(--accent); box-shadow:0 16px 48px rgba(124,92,252,.18); }
  .screen-art {
    aspect-ratio:9/16; background:var(--surf2); border-radius:14px; margin-bottom:12px;
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  }
  .dot { width:48px; height:48px; border-radius:50%; }
  .screen-n { font-size:13px; font-weight:600; }
  .screen-d { font-size:11px; color:var(--muted); }

  .grid3 { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:22px; }
  .feat {
    background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:28px;
    transition:all .3s; position:relative; overflow:hidden;
  }
  .feat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--accent),transparent); opacity:0; transition:opacity .3s; }
  .feat:hover::before { opacity:1; }
  .feat:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(124,92,252,.1); }
  .feat-icon { width:44px; height:44px; border-radius:12px; background:rgba(124,92,252,.12); border:1px solid rgba(124,92,252,.2); display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:18px; }
  .feat h3 { font-size:17px; font-weight:700; margin-bottom:8px; }
  .feat p { font-size:13px; color:var(--muted); line-height:1.6; }

  .metrics-section { background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:72px 24px; text-align:center; }
  .m-grid { display:flex; justify-content:center; gap:56px; flex-wrap:wrap; margin-top:44px; }
  .m-val { font-size:52px; font-weight:800; background:linear-gradient(135deg,var(--accent),var(--teal)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .m-lbl { font-size:13px; color:var(--muted); margin-top:6px; }

  .decisions-list { max-width:880px; margin:0 auto; }
  .dec { display:flex; gap:24px; padding:28px 0; border-bottom:1px solid var(--border); }
  .dec-n { font-size:34px; font-weight:800; color:var(--border); flex-shrink:0; width:48px; line-height:1; }
  .dec-body h3 { font-size:17px; font-weight:700; margin-bottom:8px; }
  .dec-body p { font-size:13px; color:var(--muted); line-height:1.65; }

  .cta-section { padding:100px 24px; text-align:center; position:relative; overflow:hidden; }
  .cta-section::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at center,rgba(124,92,252,.1) 0%,transparent 70%); pointer-events:none; }
  .cta-title { font-size:clamp(38px,6vw,62px); font-weight:800; margin-bottom:14px; line-height:1.1; position:relative; }
  .cta-sub { font-size:17px; color:var(--muted); max-width:480px; margin:0 auto 38px; line-height:1.6; position:relative; }

  footer { padding:36px 48px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; border-top:1px solid var(--border); font-size:12px; color:var(--muted); }
  .f-logo { font-size:15px; font-weight:800; letter-spacing:2px; color:var(--text); }
  footer a { color:var(--muted); text-decoration:none; }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">W<em>A</em>NE</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#design">Design</a>
  </div>
  <a href="https://ram.zenbin.org/wane-viewer" class="nav-cta">View prototype →</a>
</nav>

<section class="hero">
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="hero-inner">
    <div class="hero-badge">✦ AI Circadian Rhythm Companion</div>
    <h1>WANE<br><span class="grad">Wind down.<br>Find your rhythm.</span></h1>
    <p class="hero-sub">An AI companion that moves with your natural energy cycle — from peak deep-work sessions to restorative, ritual sleep.</p>
    <div class="btns">
      <a href="https://ram.zenbin.org/wane-viewer" class="btn-p">View design prototype</a>
      <a href="https://ram.zenbin.org/wane-mock" class="btn-s">Interactive mock ☀◑</a>
    </div>
  </div>
</section>

<div class="inspo">
  Inspired by <span>land-book.com</span> #1 feature "Dawn: AI for Mental Health" + <span>darkmodedesign.com</span> neon-glow UI showcase · April 1, 2026
</div>

<section id="screens" style="text-align:center; max-width:none;">
  <div class="slabel">6 SCREENS</div>
  <h2 class="stitle" style="max-width:600px;margin:0 auto 12px;">Every phase of your day</h2>
  <p class="ssub" style="margin:0 auto 52px;">From morning focus check-in to evening wind-down ritual, WANE guides each energy state with intent.</p>
  <div class="screens-row" style="max-width:1100px;margin:0 auto;justify-content:center;">
    ${[
      ['Today','Dashboard overview','var(--accent)'],
      ['Focus','Active timer + ambient','var(--accent)',true],
      ['Reflect','Post-session log','var(--teal)'],
      ['Sleep','Ritual checklist','var(--amber)'],
      ['Insights','Weekly patterns','var(--teal)'],
      ['Mood','Check-in modal','var(--accent)'],
    ].map(([n,d,c,f])=>`
    <div class="screen-card"${f?' style="border-color:rgba(124,92,252,.4);box-shadow:0 0 40px rgba(124,92,252,.14);"':''}>
      <div class="screen-art">
        <div class="dot" style="background:radial-gradient(circle,${c} 0%,transparent 70%);"></div>
        <div style="font-size:10px;color:var(--muted);">${n}</div>
      </div>
      <div class="screen-n">${n}</div>
      <div class="screen-d">${d}</div>
    </div>`).join('')}
  </div>
</section>

<section id="features" style="text-align:center;">
  <div class="slabel">CORE FEATURES</div>
  <h2 class="stitle">Built around your biology</h2>
  <p class="ssub" style="margin:0 auto 52px;">WANE tracks the full arc of your day — energy in, energy out.</p>
  <div class="grid3" style="max-width:960px;margin:0 auto;text-align:left;">
    ${[
      ['◎','Focus Score','Real-time deep work quality. Session-by-session visibility into your cognitive performance arc.'],
      ['◐','Sleep Readiness','AI-scored readiness ring each evening. Wind-down checklists that adapt to your patterns.'],
      ['∿','Ambient Modes','Forest · Rain · Cosmos · Silence — soundscapes matched to your cognitive state.'],
      ['◍','Session Reflection','Quick mood, energy, and focus log after every session. AI-powered pattern recognition.'],
      ['⊹','Circadian Insights','Peak window, streak data, and weekly mood — all correlated into actionable nudges.'],
      ['✦','WANE AI','"Protect Wednesday 3–5 PM." "Screens off by 10 yields +18% sleep readiness."'],
    ].map(([i,t,d])=>`
    <div class="feat">
      <div class="feat-icon">${i}</div>
      <h3>${t}</h3>
      <p>${d}</p>
    </div>`).join('')}
  </div>
</section>

<div class="metrics-section">
  <div class="slabel">OUTCOMES</div>
  <h2 class="stitle">Results in two weeks</h2>
  <div class="m-grid">
    ${[
      ['+40%','Focus after ritual'],
      ['12d','Avg streak length'],
      ['81','Sleep readiness score'],
      ['94%','Users stay consistent'],
    ].map(([v,l])=>`<div><div class="m-val">${v}</div><div class="m-lbl">${l}</div></div>`).join('')}
  </div>
</div>

<section id="design">
  <div class="slabel">DESIGN DECISIONS</div>
  <h2 class="stitle">Three key choices</h2>
  <div class="decisions-list">
    ${[
      ['01','Ambient radial glow blobs as atmospheric depth layers',
        'Each screen uses large soft radial gradients (violet, teal, amber) as non-interactive atmosphere. Inspired by the neon-wellness dark sites on darkmodedesign.com — a technique not used in previous RAM designs. Creates immersion without animation.'],
      ['02','Colour-coded energy states across the app',
        'Violet (#7C5CFC) = focus/cognitive energy. Teal (#00D4C8) = clarity and reflection. Amber (#F5A653) = warmth and rest. Each tab shifts its accent to match the emotional register of that phase — focus sessions glow violet, sleep ritual glows amber.'],
      ['03','Neon CTA buttons with colour-matched glow shadows',
        'Primary actions cast a matching-colour shadow (e.g. violet pause button → violet box-shadow glow). This "charged" affordance, borrowed from darkmodedesign.com\'s Neon and Darkroom showcases, makes interactive elements feel energetically alive on dark backgrounds.'],
    ].map(([n,t,d])=>`
    <div class="dec">
      <div class="dec-n">${n}</div>
      <div class="dec-body"><h3>${t}</h3><p>${d}</p></div>
    </div>`).join('')}
  </div>
</section>

<section class="cta-section" style="max-width:none;">
  <h2 class="cta-title">Your energy has<br><span class="grad">a natural shape.</span></h2>
  <p class="cta-sub">Explore the 6-screen prototype or try the interactive Svelte mock with light/dark toggle.</p>
  <div class="btns">
    <a href="https://ram.zenbin.org/wane-viewer" class="btn-p">Open prototype viewer</a>
    <a href="https://ram.zenbin.org/wane-mock" class="btn-s">Interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <div class="f-logo">WANE</div>
  <div>Design by <a href="https://ram.zenbin.org">RAM</a> · Inspired by darkmodedesign.com neon-glow + land-book "Dawn: AI for Mental Health" · April 2026</div>
  <div>ram.zenbin.org/wane</div>
</footer>

</body>
</html>`;
}

async function main() {
  console.log('Publishing WANE...');

  const heroRes = await publish(SLUG, buildHeroHtml(), `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${heroRes.status} → https://${HOST}/${SLUG}`);

  let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8')
    .replace(/<title>.*?<\/title>/, `<title>${APP_NAME} — ${TAGLINE} | Viewer</title>`);
  const penJson = fs.readFileSync(path.join(__dirname, 'wane.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  const viewRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${viewRes.status} → https://${HOST}/${SLUG}-viewer`);
}

main().catch(e => { console.error(e); process.exit(1); });
