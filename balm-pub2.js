'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'balm';
const APP_NAME  = 'BALM';
const TAGLINE   = 'Calm clarity for creative freelancers';
const HOST      = 'zenbin.org';
const SUBDOMAIN = 'ram';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const req = https.request({
      hostname: HOST, port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOMAIN,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, 'balm.pen'), 'utf8');
const pen     = JSON.parse(penJson);
const screens = pen.artboards.map(a => ({ name: a.name, svg: a.layers[0].content }));

const BG      = '#F7F3EE';
const SURFACE = '#FFFFFF';
const BORDER  = '#E2DDD6';
const TEXT    = '#1C1917';
const MUTED   = '#9B918A';
const ACCENT  = '#C85A2A';
const GREEN   = '#4A7B6F';
const AMBER   = '#B07828';

const screenThumbs = screens.map(s => `
  <div class="scn-thumb">
    ${s.svg}
    <div class="scn-label">${s.name.toUpperCase()}</div>
  </div>
`).join('');

const heroSvg = screens[0].svg;

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>BALM — Calm clarity for creative freelancers</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:${BG};color:${TEXT};font-family:'DM Sans',system-ui,sans-serif;overflow-x:hidden}
a{color:inherit;text-decoration:none}
nav{display:flex;align-items:center;justify-content:space-between;padding:20px 56px;border-bottom:1px solid ${BORDER};position:sticky;top:0;background:rgba(247,243,238,0.92);backdrop-filter:blur(12px);z-index:100}
.nav-brand{font-family:'DM Serif Display',Georgia,serif;font-size:22px;letter-spacing:2px}
.nav-links{display:flex;gap:30px;font-size:12px;letter-spacing:1px;color:${MUTED}}
.nav-links a:hover{color:${TEXT}}
.nav-cta{font-size:11px;font-weight:700;letter-spacing:1.5px;padding:9px 22px;background:${ACCENT};color:white;border-radius:6px;transition:opacity .2s}
.nav-cta:hover{opacity:.85}
.hero{min-height:100vh;display:flex;align-items:center;padding:80px 56px 100px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 20% 50%,rgba(200,90,42,0.05) 0%,transparent 70%);pointer-events:none}
.hero-grid{display:grid;grid-template-columns:1fr 400px;gap:80px;align-items:center;max-width:1200px;margin:0 auto;width:100%}
.eyebrow{font-size:10px;letter-spacing:3px;color:${ACCENT};margin-bottom:18px;display:flex;align-items:center;gap:10px;text-transform:uppercase}
.eyebrow::before{content:'';display:block;width:28px;height:1px;background:${ACCENT}}
.ghost{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(80px,12vw,160px);color:${BORDER};opacity:0.6;line-height:1;margin-bottom:-32px;display:block}
h1{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(52px,7vw,88px);letter-spacing:-2px;line-height:1;margin-bottom:10px;font-weight:400}
.tagline{font-size:clamp(14px,2vw,20px);font-weight:300;color:${MUTED};font-style:italic;font-family:'DM Serif Display',Georgia,serif;margin-bottom:28px}
.desc{font-size:16px;line-height:1.75;color:${MUTED};max-width:480px;margin-bottom:44px}
.actions{display:flex;gap:14px;flex-wrap:wrap}
.btn-p{padding:13px 30px;background:${ACCENT};color:white;font-size:12px;font-weight:700;letter-spacing:1.5px;border-radius:6px;cursor:pointer;transition:opacity .2s;text-transform:uppercase}
.btn-p:hover{opacity:.85}
.btn-s{padding:13px 30px;border:1px solid ${BORDER};color:${MUTED};font-size:12px;letter-spacing:1.5px;border-radius:6px;cursor:pointer;transition:all .2s;text-transform:uppercase}
.btn-s:hover{border-color:${TEXT};color:${TEXT}}
.phone-wrap{display:flex;justify-content:center;position:relative}
.phone{width:248px;background:${SURFACE};border-radius:36px;padding:12px;border:1px solid ${BORDER};box-shadow:0 24px 80px rgba(28,25,23,0.12),0 4px 16px rgba(28,25,23,0.06)}
.phone-inner{border-radius:26px;overflow:hidden;width:100%;aspect-ratio:390/844}
.phone-inner svg{display:block;width:100%;height:auto}
.stats{padding:80px 56px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};background:${SURFACE}}
.stats-inner{max-width:1200px;margin:0 auto}
.stats-lbl{font-size:9px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;margin-bottom:44px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:${BORDER}}
.stat{background:${SURFACE};padding:44px 36px}
.stat-num{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(40px,4vw,56px);line-height:1;margin-bottom:6px}
.accent-c{color:${ACCENT}}.green-c{color:${GREEN}}.amber-c{color:${AMBER}}.dark-c{color:${TEXT}}
.stat-unit{font-size:18px;color:${MUTED}}
.stat-label{font-size:9px;letter-spacing:2px;color:${MUTED};text-transform:uppercase;margin-top:8px}
.features{padding:100px 56px}
.features-inner{max-width:1200px;margin:0 auto}
.features-hd{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:56px}
.features-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(32px,3.5vw,52px);font-weight:400;letter-spacing:-1px;line-height:1.1}
.features-title em{color:${ACCENT};font-style:italic}
.features-sub{font-size:10px;letter-spacing:2px;color:${MUTED};text-transform:uppercase}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:${BORDER}}
.feat{background:${SURFACE};padding:40px 32px;transition:background .2s}
.feat:hover{background:#F0EDE8}
.feat-icon{font-size:24px;margin-bottom:20px}
.feat-name{font-size:13px;font-weight:700;letter-spacing:1px;margin-bottom:10px;text-transform:uppercase}
.feat-desc{font-size:13px;line-height:1.75;color:${MUTED}}
.feat-tag{display:inline-block;margin-top:20px;font-size:8px;letter-spacing:2px;color:${ACCENT};border:1px solid rgba(200,90,42,0.3);padding:4px 10px;border-radius:3px;text-transform:uppercase}
.scns{padding:100px 56px;border-top:1px solid ${BORDER}}
.scns-inner{max-width:1200px;margin:0 auto}
.scns-lbl{font-size:9px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;margin-bottom:10px}
.scns-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(28px,3vw,44px);font-weight:400;margin-bottom:48px;letter-spacing:-1px}
.scns-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.scn-thumb{background:${SURFACE};border:1px solid ${BORDER};border-radius:14px;overflow:hidden;aspect-ratio:390/844;position:relative;cursor:pointer;transition:border-color .2s,transform .25s,box-shadow .25s}
.scn-thumb:hover{border-color:${ACCENT};transform:translateY(-6px);box-shadow:0 20px 40px rgba(28,25,23,0.1)}
.scn-thumb svg{width:100%;height:100%;display:block}
.scn-label{position:absolute;bottom:10px;left:0;right:0;text-align:center;font-size:8px;letter-spacing:1.5px;color:${MUTED};pointer-events:none;text-transform:uppercase}
.process{padding:100px 56px;background:${SURFACE};border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER}}
.process-inner{max-width:1200px;margin:0 auto}
.process-lbl{font-size:9px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;margin-bottom:10px}
.process-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(28px,3vw,44px);font-weight:400;margin-bottom:48px;letter-spacing:-1px}
.process-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.proc-num{font-family:'DM Serif Display',Georgia,serif;font-size:64px;color:${BORDER};line-height:1;margin-bottom:12px}
.proc-title{font-size:16px;font-weight:700;margin-bottom:10px}
.proc-desc{font-size:13px;line-height:1.75;color:${MUTED}}
.cta{padding:120px 56px;text-align:center}
.cta-ghost{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(60px,10vw,120px);color:${BORDER};opacity:0.4;margin-bottom:-36px;line-height:1}
.cta-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(32px,4vw,56px);font-weight:400;letter-spacing:-1.5px;margin-bottom:16px}
.cta-sub{font-size:15px;color:${MUTED};margin-bottom:48px;max-width:420px;margin-left:auto;margin-right:auto;font-style:italic;font-family:'DM Serif Display',Georgia,serif}
.cta-actions{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
footer{padding:40px 56px;border-top:1px solid ${BORDER};display:flex;justify-content:space-between;align-items:center;font-size:10px;color:${MUTED};letter-spacing:1.5px;text-transform:uppercase}
footer a{color:${MUTED}} footer a:hover{color:${ACCENT}}
@media(max-width:900px){
  nav,footer{padding:14px 20px}
  .hero{padding:60px 20px 80px}
  .hero-grid{grid-template-columns:1fr;gap:40px}
  .phone-wrap{order:-1}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .feat-grid{grid-template-columns:1fr}
  .process-grid{grid-template-columns:1fr;gap:28px}
  .scns-grid{grid-template-columns:repeat(3,1fr)}
  .features,.scns,.stats,.cta,.process{padding:60px 20px}
}
</style>
</head>
<body>
<nav>
  <div class="nav-brand">BALM</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="/balm-viewer">View design</a>
    <a href="/balm-mock">Mock ☀◑</a>
  </div>
  <a class="nav-cta" href="/balm-mock">Interactive mock ☀◑</a>
</nav>
<section class="hero">
  <div class="hero-grid">
    <div>
      <div class="eyebrow">Freelance Studio OS</div>
      <span class="ghost">07</span>
      <h1>BALM</h1>
      <div class="tagline">Calm clarity for creative freelancers.</div>
      <p class="desc">Know your numbers, protect your time, and deliver your best work. BALM brings together project tracking, invoicing, earnings, and deep focus into one warm, distraction-free space.</p>
      <div class="actions">
        <a href="/balm-viewer" class="btn-p">View design →</a>
        <a href="/balm-mock" class="btn-s">Interactive mock ☀◑</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="phone"><div class="phone-inner">${heroSvg}</div></div>
    </div>
  </div>
</section>
<section class="stats">
  <div class="stats-inner">
    <div class="stats-lbl">What BALM tracks for you</div>
    <div class="stats-grid">
      <div class="stat"><div class="stat-num accent-c">3<span class="stat-unit"> active</span></div><div class="stat-label">Projects on time</div></div>
      <div class="stat"><div class="stat-num green-c">$12<span class="stat-unit">.4k</span></div><div class="stat-label">Earned this April</div></div>
      <div class="stat"><div class="stat-num amber-c">78<span class="stat-unit">%</span></div><div class="stat-label">Of monthly goal hit</div></div>
      <div class="stat"><div class="stat-num dark-c">3h<span class="stat-unit"> 15m</span></div><div class="stat-label">Deep focus today</div></div>
    </div>
  </div>
</section>
<section class="features" id="features">
  <div class="features-inner">
    <div class="features-hd">
      <h2 class="features-title">Built for<br><em>the solo creator.</em></h2>
      <div class="features-sub">5 Screens · Light theme · Earthy palette</div>
    </div>
    <div class="feat-grid">
      <div class="feat"><div class="feat-icon">◉</div><div class="feat-name">Today</div><p class="feat-desc">A ghost editorial "07" date at 130px anchors the daily view. Inspired by Awwwards nominees using large editorial typography as visual hierarchy. Tasks, earnings, and focus stats at a glance.</p><span class="feat-tag">Screen 1 · Awwwards editorial trend</span></div>
      <div class="feat"><div class="feat-icon">⊞</div><div class="feat-name">Projects</div><p class="feat-desc">Three active client projects with terracotta / sage / amber colour coding, progress bars, and deadline chips. A ghost "3" echoes the editorial anchor pattern across screens.</p><span class="feat-tag">Screen 2</span></div>
      <div class="feat"><div class="feat-icon">◫</div><div class="feat-name">Invoices</div><p class="feat-desc">Collected vs. outstanding at a glance with soft green/amber badge pairs. Filter pills, client names, and a ghost arrow glyph tie the invoice screen to the broader editorial system.</p><span class="feat-tag">Screen 3</span></div>
      <div class="feat"><div class="feat-icon">◴</div><div class="feat-name">Earnings</div><p class="feat-desc">Monthly bar chart with serif "$12,400" as the hero number. Goal progress bar, 7-month bar overview, and client-work vs. licensing breakdown — directly inspired by Cushion App's financial clarity.</p><span class="feat-tag">Screen 4 · Inspired by Cushion App</span></div>
      <div class="feat"><div class="feat-icon">◎</div><div class="feat-name">Focus</div><p class="feat-desc">A minimal pomodoro timer with a clean arc progress ring in terracotta. Session pills show completed vs. active runs. Single-action design removes all friction from entering deep work.</p><span class="feat-tag">Screen 5</span></div>
      <div class="feat"><div class="feat-icon">▧</div><div class="feat-name">Warm palette</div><p class="feat-desc">#F7F3EE cream background with terracotta (#C85A2A) and sage green (#4A7B6F) accents. Georgia serif for headlines creates editorial warmth — a deliberate counterpoint to cold blue-grey SaaS defaults.</p><span class="feat-tag">Light · Earthy · Editorial</span></div>
    </div>
  </div>
</section>
<section class="process" id="process">
  <div class="process-inner">
    <div class="process-lbl">Design Decisions</div>
    <h2 class="process-title">Three choices that define BALM.</h2>
    <div class="process-grid">
      <div><div class="proc-num">01</div><div class="proc-title">Ghost editorial numbers</div><p class="proc-desc">Oversized ghost numbers (the date "07", project count "3") sit behind content at 40% opacity. This editorial technique — seen across multiple Awwwards nominees this week — creates depth and visual hierarchy without adding UI noise.</p></div>
      <div><div class="proc-num">02</div><div class="proc-title">Serif + sans-serif pairing</div><p class="proc-desc">Georgia / DM Serif Display for hero figures and headlines creates warmth and gravitas. System UI sans-serif for data and navigation keeps readability tight. The dual-font system signals "crafted by a human, for a human."</p></div>
      <div><div class="proc-num">03</div><div class="proc-title">Colour as project language</div><p class="proc-desc">Each project type gets a consistent colour — terracotta for branding, sage for web, amber for illustration. That colour runs from the project card to its invoice badge to the earnings bar, creating a visual thread across the entire app.</p></div>
    </div>
  </div>
</section>
<section class="scns" id="screens">
  <div class="scns-inner">
    <div class="scns-lbl">Design Screens</div>
    <h2 class="scns-title">5 screens, one calm system.</h2>
    <div class="scns-grid">${screenThumbs}</div>
  </div>
</section>
<section class="cta">
  <div class="cta-ghost">✦</div>
  <h2 class="cta-title">Ready to explore BALM?</h2>
  <p class="cta-sub">Browse all 5 screens in the viewer, or try the interactive mock with light/dark toggle.</p>
  <div class="cta-actions">
    <a href="/balm-viewer" class="btn-p">Open viewer →</a>
    <a href="/balm-mock" class="btn-s">Interactive mock ☀◑</a>
  </div>
</section>
<footer>
  <div>BALM — Calm clarity for creative freelancers · RAM Design Heartbeat</div>
  <div style="display:flex;gap:20px"><a href="/balm-viewer">Viewer</a><a href="/balm-mock">Mock</a><a href="https://ram.zenbin.org">Gallery</a></div>
  <div>2026</div>
</footer>
</body>
</html>`;

const viewerBase = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>BALM — Design Viewer</title>
<script>
// EMBEDDED_PEN_PLACEHOLDER
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:${BG};font-family:'DM Sans',system-ui,sans-serif;color:${TEXT};min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:2.5rem 1rem}
h1{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(22px,4vw,34px);font-weight:400;letter-spacing:-0.5px;margin-bottom:.4rem}
h1 em{color:${ACCENT};font-style:italic}
.sub{font-size:13px;color:${MUTED};margin-bottom:2rem;font-style:italic;font-family:'DM Serif Display',Georgia,serif}
.viewer-wrap{width:100%;max-width:420px}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1.5rem;justify-content:center}
.tab{padding:7px 18px;border-radius:20px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid ${BORDER};background:${SURFACE};color:${MUTED};transition:all .2s;font-family:'DM Sans',system-ui,sans-serif}
.tab.active{background:${ACCENT};color:white;border-color:${ACCENT};font-weight:700}
.display{width:390px;max-width:100%;border-radius:22px;overflow:hidden;border:1px solid ${BORDER};box-shadow:0 20px 60px rgba(28,25,23,0.12)}
.display svg{display:block;width:100%;height:auto}
.back{margin-top:2rem;font-size:12px;color:${MUTED};font-style:italic;font-family:'DM Serif Display',Georgia,serif}
.back a{color:${ACCENT};text-decoration:none}
</style>
</head>
<body>
<h1><em>BALM</em> — Calm clarity for creative freelancers</h1>
<p class="sub">5 Screens · Light Mode · Freelance Studio OS</p>
<div class="viewer-wrap">
  <div class="tabs" id="tabs"></div>
  <div class="display" id="display"></div>
</div>
<p class="back"><a href="https://ram.zenbin.org/balm">← Hero page</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/balm-mock">Interactive Mock ☀◑</a></p>
<script>
(function(){
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if(!pen){document.body.innerHTML+='<p style="color:red;margin-top:2rem">No pen data.</p>';return;}
  const screens = pen.artboards||[];
  const tabs=document.getElementById('tabs'), display=document.getElementById('display');
  function show(i){
    display.innerHTML=screens[i].layers[0].content;
    document.querySelectorAll('.tab').forEach((t,j)=>t.classList.toggle('active',j===i));
  }
  screens.forEach((s,i)=>{
    const b=document.createElement('button');
    b.className='tab'+(i===0?' active':'');
    b.textContent=s.name;
    b.onclick=()=>show(i);
    tabs.appendChild(b);
  });
  show(0);
})();
</script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
const viewerHtml = viewerBase.replace('<script>\n// EMBEDDED_PEN_PLACEHOLDER\n</script>', injection);

async function run() {
  console.log('Publishing BALM hero page...');
  let r = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${r.status} -> https://ram.zenbin.org/${SLUG}`);
  if (r.status >= 400) console.log('  Error:', r.body.slice(0, 300));

  console.log('Publishing BALM viewer...');
  r = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`  Viewer: ${r.status} -> https://ram.zenbin.org/${SLUG}-viewer`);
  if (r.status >= 400) console.log('  Error:', r.body.slice(0, 300));
}

run().catch(console.error);
