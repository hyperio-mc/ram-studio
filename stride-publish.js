'use strict';
// stride-publish.js — Full pipeline for STRIDE
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'stride';
const APP_NAME  = 'STRIDE';
const TAGLINE   = 'Athletic Performance OS';
const ARCHETYPE = 'sports-performance';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Light-mode athletic performance tracking app for serious runners and triathletes. Inspired by "Fluid Glass" Awwwards nominee (Mar 2026): translucent card depth system, elevation through layering. Veo Sports Cameras (land-book.com Mar 2026): sports-tech data-forward product, large editorial numbers, confident display typography on warm white. Locomotive.ca (godly.website Mar 2026): editorial grid layout, generous whitespace, bold section labels. Palette: warm #F6F2EC ivory + electric #1D56E8 blue + vivid #00C875 green.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);
const penJson = fs.readFileSync(path.join(__dirname, 'stride.pen'), 'utf8');

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
}

// ── Hero page ─────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>STRIDE — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="STRIDE is a light-mode athletic performance OS — track runs, monitor recovery, analyse training load, and chase your next PR. Built for serious athletes.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Serif+Display&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F6F2EC;
  --surface:#FFFFFF;
  --surface2:#EEE9E1;
  --surface3:#E8E3DA;
  --border:#E0D9CF;
  --border-mid:#C8BFB0;
  --fg:#161210;
  --fg2:#3C3730;
  --muted:#8A8278;
  --dim:#B8B0A4;
  --blue:#1D56E8;
  --blue-bg:#EEF2FD;
  --blue-lt:#4A7AF0;
  --blue-dk:#0F3AB8;
  --green:#00C875;
  --green-bg:#E6FAF2;
  --amber:#E08000;
  --amber-bg:#FEF3E2;
  --red:#D63B3B;
  --red-bg:#FDEAEA;
  --purple:#8040C8;
  --purple-bg:#F4EDFC;
}
html{background:var(--bg);color:var(--fg);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border-mid);border-radius:2px}

/* Nav */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(246,242,236,0.92);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
.logo{font-size:16px;font-weight:900;letter-spacing:4px;color:var(--fg)}.logo span{color:var(--blue)}
.nav-links{display:flex;gap:36px;list-style:none}
.nav-links a{text-decoration:none;font-size:13px;font-weight:500;color:var(--muted);transition:color .15s}.nav-links a:hover{color:var(--fg)}
.nav-cta{padding:8px 22px;border-radius:8px;background:var(--blue);color:#fff;font-size:13px;font-weight:600;text-decoration:none;transition:opacity .2s}.nav-cta:hover{opacity:.85}

/* Hero */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 24px 100px;text-align:center;position:relative;overflow:hidden}
.hero-glow-1{position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:800px;height:600px;border-radius:50%;background:radial-gradient(ellipse,rgba(29,86,232,0.06) 0%,transparent 65%);pointer-events:none}
.hero-glow-2{position:absolute;bottom:0;right:10%;width:400px;height:400px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,200,117,0.05) 0%,transparent 65%);pointer-events:none}

.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 20px;border-radius:20px;background:var(--blue-bg);border:1px solid rgba(29,86,232,0.2);font-size:10px;font-weight:700;color:var(--blue);letter-spacing:1.5px;margin-bottom:36px}
h1{font-size:clamp(52px,9vw,96px);font-weight:900;line-height:1.0;letter-spacing:-2.5px;max-width:900px;margin-bottom:24px}
h1 .accent{color:var(--blue)}
h1 em{font-style:normal;color:var(--green)}
.hero-sub{font-size:19px;color:var(--muted);max-width:520px;line-height:1.8;margin-bottom:48px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
.btn-p{padding:15px 40px;border-radius:10px;background:var(--blue);color:#fff;font-size:15px;font-weight:600;text-decoration:none;transition:opacity .2s}.btn-p:hover{opacity:.85}
.btn-g{padding:15px 40px;border-radius:10px;background:transparent;border:1.5px solid var(--border-mid);color:var(--fg);font-size:15px;font-weight:600;text-decoration:none;transition:all .2s}.btn-g:hover{border-color:var(--fg);background:var(--surface)}

/* Phone mockup strip */
.phone-strip{display:flex;gap:20px;overflow-x:auto;padding-bottom:24px;justify-content:center;max-width:1100px;margin:0 auto}
.phone-strip::-webkit-scrollbar{height:4px}
.phone{flex-shrink:0;width:240px;height:520px;border-radius:36px;background:var(--surface);border:1.5px solid var(--border);box-shadow:0 20px 60px rgba(22,18,16,0.10);overflow:hidden;display:flex;flex-direction:column}
.phone-bar{height:28px;background:var(--bg);display:flex;align-items:center;padding:0 18px;flex-shrink:0}
.phone-dot{width:6px;height:6px;border-radius:50%;background:var(--border-mid);margin:0 2px}
.phone-content{flex:1;padding:12px;display:flex;flex-direction:column;gap:8px}
.phone-label{font-size:9px;font-weight:700;letter-spacing:1.2px;color:var(--muted)}
.phone-hero-num{font-size:38px;font-weight:900;color:var(--blue);letter-spacing:-1px;line-height:1}
.phone-hero-unit{font-size:14px;color:var(--muted);font-weight:400}
.phone-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:4px}
.phone-card-lbl{font-size:8px;font-weight:700;letter-spacing:1px;color:var(--muted)}
.phone-card-val{font-size:20px;font-weight:800;color:var(--fg);letter-spacing:-0.5px}
.phone-card-sub{font-size:9px;color:var(--muted)}
.phone-kpi-row{display:flex;gap:6px}
.phone-kpi{flex:1;background:var(--bg);border-radius:10px;padding:8px;text-align:center}
.phone-kpi-val{font-size:16px;font-weight:800;letter-spacing:-0.5px}
.phone-kpi-lbl{font-size:7px;font-weight:600;letter-spacing:0.8px;color:var(--muted);margin-top:2px}
.phone-bar-wrap{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:5px}
.pbar{height:4px;border-radius:2px;background:var(--surface2)}
.pbar-fill{height:4px;border-radius:2px}
.phone-nav{height:48px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-around;flex-shrink:0}
.phone-nav-item{text-align:center;font-size:7px;font-weight:600;letter-spacing:0.5px;color:var(--dim)}
.phone-nav-item.active{color:var(--blue)}
.phone-nav-ico{font-size:14px;display:block}

/* Features section */
.section{padding:100px 48px;max-width:1200px;margin:0 auto}
.sec-eyebrow{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--blue);margin-bottom:14px;text-transform:uppercase}
.section h2{font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-1.5px;margin-bottom:18px;max-width:640px}
.section h2 em{font-style:normal;color:var(--blue)}
.section .sub2{font-size:16px;color:var(--muted);max-width:540px;line-height:1.8;margin-bottom:56px}

.features-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.feat-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:30px;transition:border-color .2s,box-shadow .2s}
.feat-card:hover{border-color:var(--blue);box-shadow:0 8px 32px rgba(29,86,232,0.08)}
.feat-card.blue{background:var(--blue-bg);border-color:rgba(29,86,232,0.2)}
.feat-card.green{background:var(--green-bg);border-color:rgba(0,200,117,0.2)}
.feat-card.wide{grid-column:span 2}
.feat-ico{font-size:24px;margin-bottom:18px;display:block}
.feat-card h3{font-size:17px;font-weight:700;margin-bottom:10px}
.feat-card p{font-size:14px;color:var(--muted);line-height:1.7}

/* Inspiration section */
.inspo-list{display:flex;flex-direction:column;gap:16px;margin-top:0}
.inspo-item{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px 26px;font-size:14px;color:var(--fg2);line-height:1.75}
.inspo-item strong{color:var(--fg);display:block;margin-bottom:4px}

/* Palette */
.swatches{display:flex;gap:16px;flex-wrap:wrap;margin-top:8px}
.sw{display:flex;flex-direction:column;align-items:center;gap:8px}
.sw-b{width:56px;height:56px;border-radius:12px;border:1px solid var(--border)}
.sw label{font-size:10px;font-weight:600;color:var(--muted);letter-spacing:0.5px}

/* CTA strip */
.cta-strip{background:var(--blue);border-radius:24px;padding:64px 56px;text-align:center;color:#fff}
.cta-strip h2{font-size:clamp(28px,4vw,44px);font-weight:900;letter-spacing:-1px;margin-bottom:14px}
.cta-strip p{font-size:16px;opacity:0.8;margin-bottom:40px;line-height:1.7}
.cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.cta-strip .btn-p{background:#fff;color:var(--blue)}
.cta-strip .btn-g{background:transparent;border:1.5px solid rgba(255,255,255,0.4);color:#fff}.cta-strip .btn-g:hover{background:rgba(255,255,255,0.1);border-color:#fff}

/* Footer */
footer{padding:48px;text-align:center;font-size:13px;color:var(--dim);border-top:1px solid var(--border)}
footer a{color:var(--blue);text-decoration:none}

@media(max-width:768px){
  nav{padding:0 24px}
  .section{padding:64px 24px}
  .feat-card.wide{grid-column:span 1}
  .phone-strip{justify-content:flex-start}
  .cta-strip{padding:40px 28px}
}
</style>
</head>
<body>

<nav>
  <div class="logo">STR<span>I</span>DE</div>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#decisions">Design</a></li>
    <li><a href="#research">Research</a></li>
  </ul>
  <a class="nav-cta" href="/stride-viewer">Open Viewer →</a>
</nav>

<section class="hero">
  <div class="hero-glow-1"></div>
  <div class="hero-glow-2"></div>
  <div class="eyebrow">RAM DESIGN STUDIO · MAR 2026</div>
  <h1>Train <em>smarter</em>.<br>Race <span class="accent">faster</span>.</h1>
  <p class="hero-sub">STRIDE is an athletic performance OS — track every run, decode your recovery, and stay on the path to your next personal record.</p>
  <div class="cta-row">
    <a class="btn-p" href="/stride-viewer">View in Pencil →</a>
    <a class="btn-g" href="/stride-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- Phone mockup strip -->
<div style="padding:0 24px 80px;overflow:hidden" id="screens">
  <div style="text-align:center;margin-bottom:32px">
    <div class="sec-eyebrow" style="display:inline-block">6 SCREENS · MOBILE 390×844</div>
  </div>
  <div class="phone-strip">

    <!-- Phone 1: Today -->
    <div class="phone">
      <div class="phone-bar"><div class="phone-dot"></div><div class="phone-dot"></div><div class="phone-dot"></div></div>
      <div class="phone-content">
        <div class="phone-label">TODAY'S PLAN</div>
        <div><span class="phone-hero-num">12.4</span><span class="phone-hero-unit"> km</span></div>
        <div style="font-size:10px;color:var(--muted)">Easy aerobic run · Zone 2</div>
        <div class="phone-label" style="margin-top:4px">THIS WEEK</div>
        <div class="phone-kpi-row">
          <div class="phone-kpi"><div class="phone-kpi-val" style="color:var(--blue)">38.2</div><div class="phone-kpi-lbl">KM</div></div>
          <div class="phone-kpi"><div class="phone-kpi-val">4h 28</div><div class="phone-kpi-lbl">TIME</div></div>
          <div class="phone-kpi"><div class="phone-kpi-val" style="color:var(--green)">724</div><div class="phone-kpi-lbl">TSS</div></div>
        </div>
        <div class="phone-card" style="background:var(--green-bg);border-color:rgba(0,200,117,0.3)">
          <div style="font-size:10px;color:var(--muted)">◉ Readiness 87 · Great — train hard</div>
        </div>
      </div>
      <div class="phone-nav">
        <div class="phone-nav-item active"><span class="phone-nav-ico">◉</span>Today</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">▶</span>Train</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◈</span>Stats</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◑</span>Recover</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◎</span>Me</div>
      </div>
    </div>

    <!-- Phone 2: Session -->
    <div class="phone">
      <div class="phone-bar"><div class="phone-dot"></div><div class="phone-dot" style="background:var(--red)"></div><div class="phone-dot"></div></div>
      <div class="phone-content">
        <div class="phone-label">ELAPSED TIME</div>
        <div class="phone-hero-num" style="font-size:42px;color:var(--fg)">38:42</div>
        <div class="phone-kpi-row">
          <div class="phone-kpi"><div class="phone-kpi-val" style="color:var(--blue)">6.84</div><div class="phone-kpi-lbl">KM</div></div>
          <div class="phone-kpi"><div class="phone-kpi-val">5:39</div><div class="phone-kpi-lbl">/KM</div></div>
        </div>
        <div class="phone-card" style="border-color:rgba(128,64,200,0.3)">
          <div class="phone-card-lbl">HEART RATE</div>
          <div class="phone-card-val" style="color:var(--purple)">154 <span style="font-size:11px;font-weight:400;color:var(--muted)">bpm</span></div>
          <div style="font-size:9px;color:var(--purple);font-weight:700">ZONE 3 — AEROBIC</div>
        </div>
        <div class="phone-bar-wrap">
          <div style="font-size:8px;font-weight:700;letter-spacing:1px;color:var(--muted)">SPLITS</div>
          ${[['Lap 1','5:42',60],['Lap 2','5:39',70],['Lap 3','5:36',80]].map(([l,t,p])=>`
          <div style="display:flex;align-items:center;gap:6px"><span style="font-size:8px;color:var(--muted);width:28px">${l}</span><div class="pbar" style="flex:1"><div class="pbar-fill" style="width:${p}%;background:var(--blue)"></div></div><span style="font-size:9px;font-weight:700">${t}</span></div>`).join('')}
        </div>
      </div>
      <div class="phone-nav">
        <div class="phone-nav-item"><span class="phone-nav-ico">◉</span>Today</div>
        <div class="phone-nav-item active"><span class="phone-nav-ico">▶</span>Train</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◈</span>Stats</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◑</span>Recover</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◎</span>Me</div>
      </div>
    </div>

    <!-- Phone 3: Stats -->
    <div class="phone">
      <div class="phone-bar"><div class="phone-dot"></div><div class="phone-dot"></div><div class="phone-dot"></div></div>
      <div class="phone-content">
        <div class="phone-card" style="background:var(--blue);border-color:var(--blue)">
          <div class="phone-card-lbl" style="color:rgba(255,255,255,0.6)">PERSONAL RECORDS</div>
          <div style="display:flex;gap:12px;margin-top:4px">
            ${[['5K','21:08'],['10K','44:22'],['HM','1:38']].map(([d,t])=>`<div><div style="font-size:8px;color:rgba(255,255,255,0.6)">${d}</div><div style="font-size:16px;font-weight:800;color:#fff">${t}</div></div>`).join('')}
          </div>
        </div>
        <div class="phone-kpi-row">
          <div class="phone-kpi"><div class="phone-kpi-val" style="color:var(--blue)">724</div><div class="phone-kpi-lbl">LOAD</div></div>
          <div class="phone-kpi"><div class="phone-kpi-val" style="color:var(--green)">+12</div><div class="phone-kpi-lbl">FORM</div></div>
          <div class="phone-kpi"><div class="phone-kpi-val" style="color:var(--purple)">56.3</div><div class="phone-kpi-lbl">VO₂</div></div>
        </div>
        <div class="phone-card" style="background:var(--green-bg);border-color:rgba(0,200,117,0.3)">
          <div style="font-size:9px;color:var(--muted)">◉ Best session: Threshold Run Tue 25 Mar — New 8K PR!</div>
        </div>
      </div>
      <div class="phone-nav">
        <div class="phone-nav-item"><span class="phone-nav-ico">◉</span>Today</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">▶</span>Train</div>
        <div class="phone-nav-item active"><span class="phone-nav-ico">◈</span>Stats</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◑</span>Recover</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◎</span>Me</div>
      </div>
    </div>

    <!-- Phone 4: Recover -->
    <div class="phone">
      <div class="phone-bar"><div class="phone-dot"></div><div class="phone-dot"></div><div class="phone-dot"></div></div>
      <div class="phone-content">
        <div class="phone-label">READINESS SCORE</div>
        <div><span class="phone-hero-num" style="color:var(--green)">87</span><span style="font-size:14px;color:var(--muted)"> / 100</span></div>
        <div style="font-size:10px;color:var(--muted)">Great — hard training OK</div>
        <div class="phone-bar-wrap">
          ${[['Sleep',91,'green'],['HRV',78,'blue'],['Fatigue',58,'amber'],['Resting HR',62,'blue']].map(([l,v,c])=>`
          <div style="display:flex;align-items:center;gap:6px"><span style="font-size:8px;width:44px;color:var(--muted)">${l}</span><div class="pbar" style="flex:1"><div class="pbar-fill" style="width:${v}%;background:var(--${c})"></div></div><span style="font-size:9px;font-weight:700;color:var(--${c})">${v}</span></div>`).join('')}
        </div>
        <div class="phone-card" style="background:var(--blue-bg);border-color:rgba(29,86,232,0.2)">
          <div style="font-size:9px;color:var(--fg2)">◈ Good day for threshold training. HRV elevated 12% above baseline.</div>
        </div>
      </div>
      <div class="phone-nav">
        <div class="phone-nav-item"><span class="phone-nav-ico">◉</span>Today</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">▶</span>Train</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◈</span>Stats</div>
        <div class="phone-nav-item active"><span class="phone-nav-ico">◑</span>Recover</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◎</span>Me</div>
      </div>
    </div>

    <!-- Phone 5: History -->
    <div class="phone">
      <div class="phone-bar"><div class="phone-dot"></div><div class="phone-dot"></div><div class="phone-dot"></div></div>
      <div class="phone-content">
        <div class="phone-card" style="background:var(--blue);border-color:var(--blue)">
          <div style="color:rgba(255,255,255,0.6);font-size:8px;font-weight:700;letter-spacing:1px">MARCH 2026</div>
          <div style="display:flex;gap:16px;margin-top:2px">
            <div style="color:#fff;font-size:15px;font-weight:800">210.4 km</div>
            <div style="color:#fff;font-size:15px;font-weight:800">17h 28m</div>
          </div>
        </div>
        ${[
          ['▶','Tempo Run','8.2 km','4:48/km','amber'],
          ['▶','Easy Run','10.5 km','6:02/km','blue'],
          ['◆','Intervals','7.4 km','4:10/km','red'],
          ['▶','Long Run','18.1 km','5:48/km','blue'],
        ].map(([icon,type,dist,pace,c])=>`
        <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)">
          <div style="width:24px;height:24px;border-radius:7px;background:rgba(var(--${c}-rgb,0,0,0),0.12);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--${c});background:var(--${c === 'blue' ? 'blue-bg' : c === 'green' ? 'green-bg' : c === 'amber' ? 'amber-bg' : 'red-bg'})">${icon}</div>
          <div style="flex:1"><div style="font-size:10px;font-weight:700">${type}</div><div style="font-size:8px;color:var(--muted)">${dist} · ${pace}</div></div>
        </div>`).join('')}
      </div>
      <div class="phone-nav">
        <div class="phone-nav-item active"><span class="phone-nav-ico">◉</span>Today</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">▶</span>Train</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◈</span>Stats</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◑</span>Recover</div>
        <div class="phone-nav-item"><span class="phone-nav-ico">◎</span>Me</div>
      </div>
    </div>

  </div>
</div>

<!-- Design decisions -->
<section class="section" id="decisions">
  <div class="sec-eyebrow">DESIGN DECISIONS</div>
  <h2>What makes STRIDE<br><em>feel different</em></h2>
  <p class="sub2">Three specific choices that shape the experience from first open to mid-race.</p>
  <div class="features-grid">
    <div class="feat-card blue wide">
      <span class="feat-ico">◉</span>
      <h3>Editorial number hierarchy</h3>
      <p>Inspired by Locomotive.ca's editorial grid (godly.website) and Veo Sports' product pages (land-book), primary metrics like distance and elapsed time render at 48–68px with weight 900. They're designed to be read at a glance — even with tired eyes mid-race or while reviewing overnight recovery. Supporting data steps down in size and opacity, never competing with the hero number.</p>
    </div>
    <div class="feat-card">
      <span class="feat-ico">◑</span>
      <h3>Warm ivory, not cold white</h3>
      <p>#F6F2EC replaces #FFFFFF as the base. This removes the harsh glare of cold white on AMOLED screens, and shifts the mood toward an editorial print aesthetic — confident, mature, and easier to read during recovery periods outdoors.</p>
    </div>
    <div class="feat-card">
      <span class="feat-ico">◈</span>
      <h3>Translucent elevation system</h3>
      <p>Inspired by the "Fluid Glass" Awwwards nominee (Mar 2026): cards use a layered background system — ivory base → white surface → surface2 accent — creating depth without shadows. Each layer gets progressively brighter, making the card content feel elevated and tactile.</p>
    </div>
    <div class="feat-card green">
      <span class="feat-ico">◉</span>
      <h3>Green only for gains</h3>
      <p>#00C875 is used exclusively for positive signals: PRs, good readiness, training load improvement. It never appears on neutral or negative data. Blue handles primary actions and navigation. The semantic color system is learnable in one session.</p>
    </div>
    <div class="feat-card">
      <span class="feat-ico">▶</span>
      <h3>Heart rate zone visualization</h3>
      <p>Zone bars on the active session screen are stacked, colored rectangles — no SVG required. The active zone (3 of 5) renders at full opacity; others are at 30%. Simple but immediately readable for a post-session debrief.</p>
    </div>
  </div>
</section>

<!-- Research inspiration -->
<section class="section" id="research">
  <div class="sec-eyebrow">DESIGN RESEARCH</div>
  <h2>What inspired STRIDE</h2>
  <p class="sub2">Three sources spotted during a live design research session across awwwards.com, godly.website, and land-book.com.</p>
  <div class="inspo-list">
    <div class="inspo-item">
      <strong>"Fluid Glass" Awwwards nominee (awwwards.com, Mar 2026)</strong>
      Translucent card layering — depth through subtle opacity-stacked backgrounds rather than drop shadows. STRIDE's elevation system takes this idea: every surface level is a slightly brighter warm tone, creating a glass-adjacent spatial hierarchy without any blur or frosted-glass CSS trickery.
    </div>
    <div class="inspo-item">
      <strong>Veo Sports Cameras (land-book.com, Mar 2026)</strong>
      Sports-tech product with bold data on warm white. Large editorial numbers for key stats, confident display typography, and a very clean card architecture. STRIDE's Today screen is a direct response — "12.4 km" as a 52px headline is a Veo-influenced decision.
    </div>
    <div class="inspo-item">
      <strong>Locomotive.ca (godly.website, Mar 2026)</strong>
      Montreal web agency with an editorial grid approach — generous whitespace, label caps with wide tracking, and typographic scale that treats numbers like editorial pull-quotes. The STATS screen's PR card (5K / 10K / HM side-by-side on a solid blue band) is directly riffing on Locomotive's project listing style.
    </div>
  </div>
</section>

<!-- Palette -->
<section class="section">
  <div class="sec-eyebrow">COLOR PALETTE</div>
  <h2>Warm light, vivid data</h2>
  <div class="swatches">
    <div class="sw"><div class="sw-b" style="background:#F6F2EC;border-color:#C8BFB0"></div><label>#F6F2EC</label></div>
    <div class="sw"><div class="sw-b" style="background:#FFFFFF;border-color:#E0D9CF"></div><label>#FFFFFF</label></div>
    <div class="sw"><div class="sw-b" style="background:#161210"></div><label>#161210</label></div>
    <div class="sw"><div class="sw-b" style="background:#1D56E8"></div><label>#1D56E8</label></div>
    <div class="sw"><div class="sw-b" style="background:#00C875"></div><label>#00C875</label></div>
    <div class="sw"><div class="sw-b" style="background:#E08000"></div><label>#E08000</label></div>
    <div class="sw"><div class="sw-b" style="background:#D63B3B"></div><label>#D63B3B</label></div>
    <div class="sw"><div class="sw-b" style="background:#8040C8"></div><label>#8040C8</label></div>
  </div>
</section>

<!-- CTA -->
<section class="section">
  <div class="cta-strip">
    <h2>Explore STRIDE in the viewer</h2>
    <p>Step through all 6 screens in the Pencil.dev viewer, or try the interactive Svelte mock with built-in light/dark toggle.</p>
    <div class="cta-btns">
      <a class="btn-p" href="/stride-viewer">Open Viewer &rarr;</a>
      <a class="btn-g" href="/stride-mock">Interactive Mock &#9728;&#9681;</a>
    </div>
  </div>
</section>

<footer>
  STRIDE &mdash; RAM Design Studio &middot; Mar 2026 &middot;
  <a href="https://ram.zenbin.org">ram.zenbin.org</a>
</footer>

</body></html>`;
}

// ── Viewer page ───────────────────────────────────────────────────────────────
function buildViewer() {
  const viewerPath = path.join(__dirname, 'viewer-template.html');
  let viewerHtml;
  if (fs.existsSync(viewerPath)) {
    viewerHtml = fs.readFileSync(viewerPath, 'utf8');
    const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  } else {
    viewerHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>STRIDE Viewer</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#F6F2EC;color:#161210;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px}
a{color:#1D56E8}</style></head><body>
<p style="font-size:14px;color:#8A8278">Viewer template not found. <a href="/stride">← Back to hero</a></p>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>
</body></html>`;
  }
  return viewerHtml;
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
(async () => {
  console.log('═══ STRIDE Design Discovery Pipeline ═══\n');

  // 1. Hero page
  process.stdout.write('① Publishing hero page… ');
  const heroRes = await zenPut(SLUG, `STRIDE — ${TAGLINE} | RAM Design Studio`, buildHero());
  const heroOk = heroRes.status === 200 || heroRes.status === 201;
  console.log(heroOk ? `✓  https://ram.zenbin.org/${SLUG}` : `✗ ${heroRes.body.slice(0, 80)}`);

  // 2. Viewer page
  process.stdout.write('② Publishing viewer… ');
  const viewerRes = await zenPut(`${SLUG}-viewer`, `STRIDE Viewer | RAM Design Studio`, buildViewer());
  const viewerOk = viewerRes.status === 200 || viewerRes.status === 201;
  console.log(viewerOk ? `✓  https://ram.zenbin.org/${SLUG}-viewer` : `✗ ${viewerRes.body.slice(0, 80)}`);

  // 3. GitHub gallery queue
  process.stdout.write('③ Updating gallery queue… ');
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 6,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(putRes.status === 200 ? '✓  Queue updated' : `✗ ${putRes.body.slice(0, 100)}`);

  // 4. Store entry for next steps
  fs.writeFileSync(path.join(__dirname, 'stride-entry.json'), JSON.stringify(newEntry, null, 2));

  console.log('\n✓ Pipeline complete');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
