// gust-publish.js — Hero + Viewer for GUST
'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG     = 'gust';
const APP_NAME = 'Gust';
const TAGLINE  = 'Home Air & Climate Wellness';

function publish(slug, html, title, subdomain='ram'){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({title,html,overwrite:true});
    const req=https.request({
      hostname:'zenbin.org',
      path:`/v1/pages/${slug}`,
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Content-Length':Buffer.byteLength(body),
        'X-Subdomain':subdomain,
      },
    },res=>{
      let d='';
      res.on('data',c=>d+=c);
      res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    req.on('error',reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gust — Home Air & Climate Wellness</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,300;1,9..144,600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#F4F2EE;
  --bg2:#EDEAE3;
  --surf:#FFFFFF;
  --border:rgba(28,26,24,0.08);
  --text:#1C1A18;
  --text2:rgba(28,26,24,0.54);
  --text3:rgba(28,26,24,0.34);
  --green:#2E7D52;
  --green-l:#E8F5EE;
  --green-m:rgba(46,125,82,0.12);
  --amber:#E07B3C;
  --amber-l:#FDF0E8;
  --blue:#3B82C4;
  --blue-l:#EBF4FC;
  --shadow:rgba(28,26,24,0.07);
}
html{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh}
body{max-width:1100px;margin:0 auto;padding:0 24px 100px}

/* subtle organic blobs */
.blob-green{position:fixed;top:-160px;right:-80px;width:600px;height:600px;background:radial-gradient(ellipse,rgba(46,125,82,0.07) 0%,transparent 68%);pointer-events:none;z-index:0}
.blob-amber{position:fixed;bottom:-100px;left:-120px;width:500px;height:500px;background:radial-gradient(ellipse,rgba(224,123,60,0.06) 0%,transparent 68%);pointer-events:none;z-index:0}

/* nav */
nav{display:flex;align-items:center;justify-content:space-between;padding:28px 0;position:relative;z-index:10}
.logo{display:flex;align-items:center;gap:10px}
.logo-mark{width:34px;height:34px;background:var(--green);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px}
.logo-name{font-size:15px;font-weight:700;letter-spacing:-0.3px;color:var(--text)}
.nav-links{display:flex;gap:28px}
.nav-links a{color:var(--text2);text-decoration:none;font-size:14px;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.cta-pill{background:var(--green);color:#fff;padding:9px 22px;border-radius:100px;font-size:13px;font-weight:600;text-decoration:none;transition:opacity .2s}
.cta-pill:hover{opacity:.85}

/* hero */
.hero{padding:88px 0 72px;position:relative;z-index:1}
.hero-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:600;letter-spacing:2.5px;color:var(--green);margin-bottom:28px;background:var(--green-l);padding:6px 14px;border-radius:100px}
.hero-eyebrow-dot{width:6px;height:6px;background:var(--green);border-radius:50%;display:inline-block}
.hero h1{font-family:'Fraunces',serif;font-size:clamp(46px,6.5vw,76px);font-weight:300;line-height:1.08;letter-spacing:-2px;margin-bottom:24px;color:var(--text);max-width:760px}
.hero h1 em{font-style:italic;color:var(--green)}
.hero p{font-size:18px;font-weight:300;color:var(--text2);max-width:540px;margin-bottom:44px;line-height:1.65}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap}
.btn-primary{background:var(--green);color:#fff;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;text-decoration:none;transition:opacity .2s;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{opacity:.88}
.btn-ghost{background:transparent;border:1.5px solid var(--border);color:var(--text);padding:14px 28px;border-radius:100px;font-size:15px;font-weight:500;text-decoration:none;transition:all .2s}
.btn-ghost:hover{border-color:var(--green);color:var(--green)}

/* AQI pill strip */
.aqi-strip{display:flex;gap:10px;flex-wrap:wrap;margin:52px 0 0}
.aqi-pill{display:flex;align-items:center;gap:6px;background:var(--surf);border:1px solid var(--border);border-radius:100px;padding:8px 16px;font-size:13px;font-weight:500;color:var(--text);box-shadow:0 2px 8px var(--shadow)}
.aqi-dot{width:8px;height:8px;border-radius:50%;display:inline-block}

/* device preview */
.device-wrap{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin:80px 0 0;position:relative;z-index:1}
.device{background:var(--surf);border-radius:28px;overflow:hidden;box-shadow:0 20px 60px var(--shadow),0 4px 16px rgba(28,26,24,0.05);border:1px solid var(--border)}
.device-header{background:var(--bg);padding:14px 20px 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
.device-dot{width:10px;height:10px;border-radius:50%;display:inline-block}
.device-content{padding:24px 20px}
.screen-label{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--green);text-transform:uppercase;margin-bottom:6px}
.screen-title{font-family:'Fraunces',serif;font-size:22px;font-weight:300;margin-bottom:18px;letter-spacing:-0.5px}

/* AQI score card */
.aqi-card{background:var(--green-l);border-radius:20px;padding:20px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
.aqi-score{font-family:'Fraunces',serif;font-size:52px;font-weight:700;color:var(--green);line-height:1}
.aqi-label{font-size:12px;font-weight:700;letter-spacing:1.5px;color:var(--green);text-transform:uppercase;margin-bottom:4px}
.aqi-sub{font-size:12px;color:var(--text2)}

/* mini metric row */
.metric-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
.metric-chip{background:var(--surf);border-radius:12px;padding:10px 8px;text-align:center;border:1px solid var(--border)}
.metric-val{font-size:13px;font-weight:700;color:var(--text);display:block}
.metric-key{font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px}

/* room cards */
.rooms-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.room-card{background:var(--bg);border-radius:14px;padding:12px;border:1px solid var(--border)}
.room-icon{font-size:18px;margin-bottom:4px}
.room-name{font-size:11px;font-weight:700;color:var(--text)}
.room-aq{font-size:10px;font-weight:500}
.room-bar{height:4px;background:var(--border);border-radius:2px;margin-top:6px}
.room-fill{height:4px;border-radius:2px;background:var(--green)}

/* alert card */
.alert-card{background:var(--amber-l);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;margin-top:8px}
.alert-icon{font-size:16px}
.alert-text{font-size:11px;font-weight:600;color:var(--text)}
.alert-sub{font-size:10px;color:var(--text2);margin-top:1px}

/* second device — plants */
.plant-header-card{background:var(--green-l);border-radius:20px;padding:18px;margin-bottom:12px}
.plant-stat{font-size:11px;font-weight:600;color:var(--green);margin-bottom:4px}
.plant-sub{font-size:10px;color:var(--text2);margin-bottom:10px}
.plant-progress-track{height:6px;background:rgba(46,125,82,0.15);border-radius:3px}
.plant-progress-fill{height:6px;border-radius:3px;background:var(--green);width:60%}

.plant-list{display:flex;flex-direction:column;gap:8px}
.plant-item{background:var(--surf);border-radius:14px;padding:12px;display:flex;align-items:center;gap:10px;border:1px solid var(--border)}
.plant-emoji-bg{width:38px;height:38px;background:var(--green-l);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.plant-name{font-size:12px;font-weight:700;color:var(--text)}
.plant-sci{font-size:9px;color:var(--text3);margin-bottom:3px}
.plant-badge{display:inline-block;font-size:9px;font-weight:600;padding:2px 8px;border-radius:100px}
.badge-good{background:var(--green-l);color:var(--green)}
.badge-water{background:var(--blue-l);color:var(--blue)}
.badge-warn{background:var(--amber-l);color:var(--amber)}
.plant-health-ring{width:32px;height:32px;border-radius:50%;border:2.5px solid var(--green-l);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--green);margin-left:auto;flex-shrink:0}

/* features section */
.features{margin:96px 0 0;position:relative;z-index:1}
.features-label{font-size:11px;font-weight:700;letter-spacing:2.5px;color:var(--green);text-transform:uppercase;margin-bottom:14px}
.features h2{font-family:'Fraunces',serif;font-size:clamp(30px,4vw,46px);font-weight:300;letter-spacing:-1.2px;margin-bottom:14px;color:var(--text);max-width:640px}
.features-sub{font-size:16px;color:var(--text2);max-width:500px;line-height:1.6;margin-bottom:56px}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feature-card{background:var(--surf);border-radius:20px;padding:26px;border:1px solid var(--border);box-shadow:0 2px 10px var(--shadow);transition:transform .2s,box-shadow .2s}
.feature-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px var(--shadow)}
.feature-icon{width:44px;height:44px;border-radius:14px;background:var(--green-l);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px}
.feature-title{font-size:15px;font-weight:700;margin-bottom:7px;color:var(--text)}
.feature-body{font-size:13px;color:var(--text2);line-height:1.55}

/* trend section */
.trend-section{margin:80px 0 0;background:var(--surf);border-radius:28px;padding:48px 44px;border:1px solid var(--border);box-shadow:0 4px 20px var(--shadow);position:relative;z-index:1}
.trend-section h2{font-family:'Fraunces',serif;font-size:clamp(26px,3.5vw,40px);font-weight:300;letter-spacing:-1px;margin-bottom:12px;color:var(--text)}
.trend-body{font-size:15px;color:var(--text2);line-height:1.65;max-width:640px}
.trend-list{margin-top:24px;display:flex;flex-direction:column;gap:10px}
.trend-item{display:flex;align-items:flex-start;gap:12px;font-size:14px;color:var(--text2)}
.trend-dot{width:6px;height:6px;border-radius:50%;background:var(--green);flex-shrink:0;margin-top:6px}

/* stats bar */
.stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border-radius:20px;overflow:hidden;margin:72px 0 0;position:relative;z-index:1}
.stat-block{background:var(--surf);padding:28px 24px}
.stat-val{font-family:'Fraunces',serif;font-size:36px;font-weight:700;color:var(--green);letter-spacing:-1px;margin-bottom:4px}
.stat-label{font-size:12px;color:var(--text2)}

/* cta bottom */
.cta-bottom{text-align:center;margin:96px 0 0;position:relative;z-index:1}
.cta-bottom h2{font-family:'Fraunces',serif;font-size:clamp(30px,4vw,52px);font-weight:300;letter-spacing:-1.5px;margin-bottom:16px;color:var(--text)}
.cta-bottom p{font-size:16px;color:var(--text2);margin-bottom:36px;line-height:1.6}
.cta-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-outline{border:1.5px solid var(--green);color:var(--green);padding:13px 28px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s}
.btn-outline:hover{background:var(--green);color:#fff}

/* footer */
footer{margin-top:72px;padding-top:28px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1}
.footer-brand{display:flex;align-items:center;gap:8px}
.footer-brand span{font-size:13px;color:var(--text2)}
footer p{font-size:12px;color:var(--text3)}

@media(max-width:768px){
  .device-wrap{grid-template-columns:1fr}
  .features-grid{grid-template-columns:1fr}
  .stats-bar{grid-template-columns:1fr 1fr}
}
</style>
</head>
<body>
<div class="blob-green"></div>
<div class="blob-amber"></div>

<nav>
  <div class="logo">
    <div class="logo-mark">🌿</div>
    <div class="logo-name">Gust</div>
  </div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Rooms</a>
    <a href="#">Plants</a>
    <a href="/gust-viewer" style="color:var(--green);font-weight:600">View Design →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-eyebrow"><span class="hero-eyebrow-dot"></span>RAM Design Heartbeat · Light Theme</div>
  <h1>Breathe easy.<br><em>Know your home's air.</em></h1>
  <p>Gust monitors your indoor air quality room-by-room, connects to your plants, and gives you actionable insights for a healthier home environment.</p>
  <div class="hero-actions">
    <a href="/gust-viewer" class="btn-primary">→ View Design</a>
    <a href="/gust-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
  <div class="aqi-strip">
    <div class="aqi-pill"><span class="aqi-dot" style="background:#2E7D52"></span>AQI 42 · Good</div>
    <div class="aqi-pill"><span class="aqi-dot" style="background:#3B82C4"></span>PM2.5: 8 µg/m³</div>
    <div class="aqi-pill"><span class="aqi-dot" style="background:#E07B3C"></span>CO₂: 612 ppm</div>
    <div class="aqi-pill"><span class="aqi-dot" style="background:#2E7D52"></span>Humidity: 48%</div>
    <div class="aqi-pill">🌿 4 active plants</div>
  </div>
</section>

<!-- Device previews -->
<div class="device-wrap">
  <!-- Dashboard preview -->
  <div class="device">
    <div class="device-header">
      <div style="display:flex;gap:5px">
        <span class="device-dot" style="background:#ff5f57"></span>
        <span class="device-dot" style="background:#ffbd2e"></span>
        <span class="device-dot" style="background:#28c840"></span>
      </div>
      <span style="font-size:11px;color:var(--text3)">Dashboard</span>
      <span style="font-size:11px;color:var(--text3)">9:41</span>
    </div>
    <div class="device-content">
      <div class="screen-label">Overview</div>
      <div class="screen-title">Good morning, Alex</div>
      <div class="aqi-card">
        <div>
          <div class="aqi-label">Air Quality Index</div>
          <div class="aqi-sub" style="margin-bottom:6px">Living room · Real-time</div>
          <div style="font-size:11px;font-weight:600;color:var(--green);background:var(--surf);display:inline-block;padding:3px 10px;border-radius:100px">● Good</div>
        </div>
        <div class="aqi-score">42</div>
      </div>
      <div class="metric-row">
        <div class="metric-chip"><span class="metric-val">21°C</span><span class="metric-key">Temp</span></div>
        <div class="metric-chip"><span class="metric-val">48%</span><span class="metric-key">Humid</span></div>
        <div class="metric-chip"><span class="metric-val">612</span><span class="metric-key">CO₂ ppm</span></div>
        <div class="metric-chip"><span class="metric-val">8µg</span><span class="metric-key">PM2.5</span></div>
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--text);margin-bottom:8px">Rooms</div>
      <div class="rooms-grid">
        <div class="room-card">
          <div class="room-icon">🛋</div>
          <div class="room-name">Living</div>
          <div class="room-aq" style="color:var(--green)">Good · 42</div>
          <div class="room-bar"><div class="room-fill" style="width:42%"></div></div>
        </div>
        <div class="room-card">
          <div class="room-icon">🛏</div>
          <div class="room-name">Bedroom</div>
          <div class="room-aq" style="color:var(--amber)">Fair · 68</div>
          <div class="room-bar"><div class="room-fill" style="width:68%;background:var(--amber)"></div></div>
        </div>
        <div class="room-card">
          <div class="room-icon">🍳</div>
          <div class="room-name">Kitchen</div>
          <div class="room-aq" style="color:var(--green)">Good · 38</div>
          <div class="room-bar"><div class="room-fill" style="width:38%"></div></div>
        </div>
        <div class="room-card">
          <div class="room-icon">💻</div>
          <div class="room-name">Office</div>
          <div class="room-aq" style="color:#D94F3D">Mod · 82</div>
          <div class="room-bar"><div class="room-fill" style="width:82%;background:#D94F3D"></div></div>
        </div>
      </div>
      <div class="alert-card">
        <div class="alert-icon">⚠</div>
        <div>
          <div class="alert-text">Bedroom CO₂ rising</div>
          <div class="alert-sub">Open window to improve air quality</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Plants preview -->
  <div class="device" style="margin-top:36px">
    <div class="device-header">
      <div style="display:flex;gap:5px">
        <span class="device-dot" style="background:#ff5f57"></span>
        <span class="device-dot" style="background:#ffbd2e"></span>
        <span class="device-dot" style="background:#28c840"></span>
      </div>
      <span style="font-size:11px;color:var(--text3)">Plant Care</span>
      <span style="font-size:11px;color:var(--text3)">9:41</span>
    </div>
    <div class="device-content">
      <div class="screen-label">Plants</div>
      <div class="screen-title">Your Plant Family</div>
      <div class="plant-header-card">
        <div class="plant-stat">✿ Plants absorbing ~12% of indoor VOCs</div>
        <div class="plant-sub">Add 2 more for optimal air purification</div>
        <div class="plant-progress-track"><div class="plant-progress-fill"></div></div>
      </div>
      <div class="plant-list">
        <div class="plant-item">
          <div class="plant-emoji-bg">🌿</div>
          <div>
            <div class="plant-name">Peace Lily</div>
            <div class="plant-sci">Spathiphyllum</div>
            <span class="plant-badge badge-water">💧 Water today</span>
          </div>
          <div class="plant-health-ring">92</div>
        </div>
        <div class="plant-item">
          <div class="plant-emoji-bg">🌵</div>
          <div>
            <div class="plant-name">Snake Plant</div>
            <div class="plant-sci">Sansevieria</div>
            <span class="plant-badge badge-good">✓ Thriving</span>
          </div>
          <div class="plant-health-ring" style="border-color:var(--green);color:var(--green)">100</div>
        </div>
        <div class="plant-item">
          <div class="plant-emoji-bg">🍃</div>
          <div>
            <div class="plant-name">Pothos</div>
            <div class="plant-sci">Epipremnum</div>
            <span class="plant-badge badge-warn">☀ Needs light</span>
          </div>
          <div class="plant-health-ring" style="border-color:var(--amber);color:var(--amber)">78</div>
        </div>
        <div class="plant-item">
          <div class="plant-emoji-bg">🌱</div>
          <div>
            <div class="plant-name">Spider Plant</div>
            <div class="plant-sci">Chlorophytum</div>
            <span class="plant-badge badge-good">✓ Good</span>
          </div>
          <div class="plant-health-ring">88</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Features -->
<section class="features">
  <div class="features-label">What Gust Does</div>
  <h2>Your home, understood in depth.</h2>
  <p class="features-sub">Real-time sensors. Plant-care reminders. Weekly wellness reports. Everything your lungs deserve to know.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Real-time Air Monitoring</div>
      <p class="feature-body">Track CO₂, PM2.5, VOCs, temperature, and humidity across every room. Get alerts before air quality becomes a problem.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✿</div>
      <div class="feature-title">Plant Care Integration</div>
      <p class="feature-body">Gust knows which plants improve your air quality and tells you exactly when to water them. Your plants work harder, together.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Weekly Insights Report</div>
      <p class="feature-body">Every Sunday, get a personalised air quality report with room rankings, trend analysis, and actionable recommendations.</p>
    </div>
  </div>
</section>

<!-- Design Notes -->
<section class="trend-section">
  <h2>Design Notes</h2>
  <p class="trend-body">Inspired by two specific trends spotted on Awwwards this week — <em>Fluid Glass</em> by Exo Ape (Site of the Day) and <em>Gluwz — Household Harmony</em> (nominee). The design translates their tactile, layered aesthetic into a calm, biophilic light-theme product UI.</p>
  <div class="trend-list">
    <div class="trend-item"><span class="trend-dot"></span>Glass morphism card surfaces (rgba 72%) inspired by Fluid Glass's translucent layer stack</div>
    <div class="trend-item"><span class="trend-dot"></span>Warm bone cream (#F4F2EE) background — organic not sterile — echoing Gluwz's "harmony" palette</div>
    <div class="trend-item"><span class="trend-dot"></span>Large typographic AQI score with arc gauge — editorial data reads from minimal.gallery</div>
    <div class="trend-item"><span class="trend-dot"></span>Fraunces serif for headlines — humanist warmth against clean Inter body copy</div>
  </div>
</section>

<!-- Stats -->
<div class="stats-bar">
  <div class="stat-block"><div class="stat-val">6</div><div class="stat-label">Screens designed</div></div>
  <div class="stat-block"><div class="stat-val">434</div><div class="stat-label">Design elements</div></div>
  <div class="stat-block"><div class="stat-val">4</div><div class="stat-label">Pollutants tracked</div></div>
  <div class="stat-block"><div class="stat-val">100%</div><div class="stat-label">Light theme</div></div>
</div>

<!-- CTA -->
<div class="cta-bottom">
  <h2>See every screen in detail.</h2>
  <p>Explore all 6 screens in the viewer — or try the interactive Svelte mock with light/dark toggle.</p>
  <div class="cta-actions">
    <a href="/gust-viewer" class="btn-primary">→ Open Viewer</a>
    <a href="/gust-mock" class="btn-outline">Interactive Mock ☀◑</a>
  </div>
</div>

<footer>
  <div class="footer-brand">
    <div class="logo-mark" style="width:26px;height:26px;font-size:13px;border-radius:8px">🌿</div>
    <span>Gust by RAM</span>
  </div>
  <p>RAM Design Heartbeat · April 2026 · Light Theme Run</p>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/gust.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
(async()=>{
  console.log('Publishing hero page…');
  const h = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${h.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const v = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} Viewer`);
  console.log(`  Viewer: ${v.status} → https://ram.zenbin.org/${SLUG}-viewer`);
})();
