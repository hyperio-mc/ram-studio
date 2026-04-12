'use strict';
// topo-publish.js — Full Design Discovery pipeline for TOPO
// TOPO — Map your system's terrain
// Theme: DARK · Slug: topo

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'topo';
const APP_NAME  = 'TOPO';
const TAGLINE   = 'Map your system\'s terrain.';
const ARCHETYPE = 'devops-observability-dark';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'DevOps observability platform with topographic terrain aesthetic — dark theme. Inspired by San Rita topographic contour map aesthetic (Awwwards SOTD) + Neon database glowing bioluminescent data bars (darkmodedesign.com). Infrastructure metrics as terrain landscapes: CPU/memory/network as elevation ridgelines. Palette: deep slate #090C0D, bioluminescent teal #1EC8B0, warm amber #F0924A alerts.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'topo.pen'), 'utf8');

const P = {
  bg:       '#090C0D',
  surface:  '#111619',
  elevated: '#182023',
  text:     '#C8E0DC',
  dim:      '#607A78',
  teal:     '#1EC8B0',
  tealDim:  'rgba(30,200,176,0.14)',
  amber:    '#F0924A',
  amberDim: 'rgba(240,146,74,0.14)',
  red:      '#E05050',
  green:    '#3EC87A',
  border:   '#1D282B',
  rule:     '#192124',
};

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
  const res = await req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
      'Accept': 'application/json',
    },
  }, body);
  return res;
}

function buildHero() {
  const screenCards = [
    { id: 'Overview',    sub: 'System health score ring, 3-terrain ridge charts for CPU/MEM/NET, live service list with glowing status dots, active incident banner', color: P.teal },
    { id: 'Metrics',     sub: 'Full-width terrain landscape charts for CPU, Memory, Network — glowing teal/amber/green ridgelines over dark slate, stat row', color: P.amber },
    { id: 'Services',    sub: 'Service topology grid with filter pills, colored latency indicators and glow-dot status, p99 latency per service row', color: P.green },
    { id: 'Alerts',      sub: 'Red incident card with left border accent, amber warnings, resolved checkmarks with green glow dots, clean rule separators', color: P.red },
    { id: 'Deployments', sub: 'Active deploy with topographic progress bar in teal, pipeline stage indicators, scrollable recent deploy history', color: P.teal },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TOPO — ${TAGLINE} | RAM Design Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:'Space Grotesk',system-ui,sans-serif;scroll-behavior:smooth}
body{min-height:100vh;overflow-x:hidden}

/* ── Nav ── */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(9,12,13,0.88);backdrop-filter:blur(16px);border-bottom:1px solid ${P.border}}
.nav-logo{font-family:'Space Mono',monospace;font-size:14px;font-weight:700;color:${P.teal};text-decoration:none;letter-spacing:0.08em}
.nav-sub{font-size:10px;color:${P.dim};margin-left:8px;font-family:'Space Grotesk',sans-serif;font-weight:400;letter-spacing:0.05em}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:${P.dim};text-decoration:none;transition:color .2s;letter-spacing:0.02em}
.nav-links a:hover{color:${P.text}}
.btn-s{font-size:12px;font-weight:600;background:${P.teal};color:${P.bg};border:none;border-radius:6px;padding:9px 20px;text-decoration:none;transition:opacity .2s;letter-spacing:0.04em}
.btn-s:hover{opacity:0.85}

/* ── Hero ── */
.hero{min-height:100vh;background:${P.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
/* Topo contour lines */
.hero::before{content:'';position:absolute;inset:0;background:
  repeating-linear-gradient(
    180deg,
    transparent 0px,
    transparent 38px,
    rgba(30,200,176,0.04) 38px,
    rgba(30,200,176,0.04) 40px
  );pointer-events:none}
.hero::after{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:700px;height:500px;border-radius:50%;background:radial-gradient(ellipse,rgba(30,200,176,0.06) 0%,transparent 70%);pointer-events:none}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:${P.tealDim};border:1px solid rgba(30,200,176,0.25);border-radius:100px;padding:6px 16px;font-size:10px;font-weight:600;letter-spacing:0.14em;color:${P.teal};text-transform:uppercase;margin-bottom:32px;position:relative}
.hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:${P.teal};animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
.hero-h1{font-family:'Space Mono',monospace;font-size:clamp(36px,6vw,72px);font-weight:700;line-height:1.05;color:${P.text};margin-bottom:16px;position:relative;letter-spacing:-0.02em}
.hero-h1 span{color:${P.teal}}
.hero-sub{font-size:18px;line-height:1.7;color:${P.dim};max-width:520px;margin:0 auto 40px;position:relative}
.hero-acts{display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;position:relative}
.btn-lg{font-size:15px;font-weight:600;background:${P.teal};color:${P.bg};border-radius:8px;padding:15px 36px;text-decoration:none;transition:opacity .2s;letter-spacing:0.04em}
.btn-lg:hover{opacity:0.85}
.btn-lg-o{font-size:15px;font-weight:600;color:${P.text};border:1px solid ${P.border};border-radius:8px;padding:15px 36px;text-decoration:none;background:none;transition:background .2s}
.btn-lg-o:hover{background:${P.surface}}
.hero-meta{margin-top:28px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:0.10em;color:${P.dim};position:relative}

/* ── Terrain banner (scrolling) ── */
.ticker{background:${P.surface};border-top:1px solid ${P.border};border-bottom:1px solid ${P.border};padding:12px 0;overflow:hidden;white-space:nowrap}
.ticker-track{display:inline-block;animation:ticker 30s linear infinite;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:0.16em;color:${P.dim}}
.ticker-track .sep{color:${P.teal};margin:0 16px}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ── Sections ── */
.section{padding:96px 48px;max-width:1100px;margin:0 auto}
.s-eye{font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:0.18em;color:${P.teal};text-transform:uppercase;margin-bottom:12px}
.s-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(28px,4vw,46px);font-weight:700;line-height:1.15;color:${P.text};margin-bottom:56px}

/* ── Feature grid ── */
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.fc{background:${P.surface};border-radius:14px;padding:28px;border:1px solid ${P.border};transition:transform .2s,border-color .2s}
.fc:hover{transform:translateY(-3px);border-color:rgba(30,200,176,0.25)}
.fc-icon{font-family:'Space Mono',monospace;font-size:20px;color:${P.teal};margin-bottom:16px}
.fc-title{font-size:16px;font-weight:700;color:${P.text};margin-bottom:8px}
.fc-body{font-size:13px;line-height:1.65;color:${P.dim}}

/* ── Screen cards ── */
.screens-section{padding:96px 0;background:${P.surface};border-top:1px solid ${P.border};overflow:hidden}
.screens-head{padding:0 48px 32px;max-width:1100px;margin:0 auto}
.screens-scroll{display:flex;gap:16px;padding:8px 48px 24px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.screens-scroll::-webkit-scrollbar{display:none}
.sp{min-width:220px;height:440px;background:${P.bg};border-radius:20px;border:1px solid ${P.border};scroll-snap-align:start;overflow:hidden;flex-shrink:0;display:flex;flex-direction:column}
.sp-head{padding:16px 16px 10px;background:${P.surface};border-bottom:1px solid ${P.border}}
.sp-eye{font-family:'Space Mono',monospace;font-size:8px;font-weight:700;letter-spacing:0.14em;color:${P.teal};text-transform:uppercase;margin-bottom:4px}
.sp-title{font-size:14px;font-weight:700;color:${P.text};line-height:1.2}
.sp-body{flex:1;padding:12px 16px;overflow:hidden}
.sp-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid ${P.rule}}
.sp-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sp-lbl{font-size:10px;color:${P.text};flex:1}
.sp-val{font-family:'Space Mono',monospace;font-size:11px;font-weight:700}
.sp-card{background:${P.elevated};border-radius:8px;padding:10px;margin:6px 0}
.sp-card-val{font-family:'Space Mono',monospace;font-size:22px;font-weight:700;color:${P.teal};line-height:1}
.sp-card-lbl{font-size:8px;color:${P.dim};margin-top:2px;letter-spacing:0.08em;text-transform:uppercase}
.sp-bar-row{margin:6px 0}
.sp-bar-t{height:3px;border-radius:4px;background:${P.rule};overflow:hidden;margin-top:4px}
.sp-bar-f{height:100%;border-radius:4px}
.sp-terrain{height:36px;position:relative;background:${P.rule};border-radius:4px;overflow:hidden;margin:6px 0}
.sp-terrain::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,${P.tealDim} 0%,rgba(30,200,176,0.3) 40%,${P.tealDim} 100%)}

/* ── Metrics section ── */
.metrics-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px}
.mc{background:${P.surface};border-radius:14px;padding:24px;border:1px solid ${P.border};text-align:center}
.mc-val{font-family:'Space Mono',monospace;font-size:38px;font-weight:700;color:${P.teal};line-height:1}
.mc-lbl{font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${P.dim};margin-top:6px}

/* ── Quote ── */
.quote-sec{background:${P.surface};border-top:1px solid ${P.border};border-bottom:1px solid ${P.border};padding:80px 24px;text-align:center}
.q-text{font-family:'Space Mono',monospace;font-size:clamp(18px,3vw,30px);color:${P.text};max-width:700px;margin:0 auto 16px;line-height:1.55;letter-spacing:-0.01em}
.q-text span{color:${P.teal}}
.q-by{font-size:11px;letter-spacing:0.10em;color:${P.dim}}

/* ── Palette ── */
.palette-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:32px}
.swatch{border-radius:10px;padding:16px 20px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:0.06em;border:1px solid ${P.border}}

/* ── CTA ── */
.cta-sec{padding:96px 24px;background:${P.bg};text-align:center;border-top:1px solid ${P.border}}
.cta-h{font-family:'Space Mono',monospace;font-size:clamp(28px,5vw,54px);font-weight:700;line-height:1.1;color:${P.text};margin-bottom:20px;letter-spacing:-0.02em}
.cta-h span{color:${P.teal}}
.cta-sub{font-size:15px;color:${P.dim};margin-bottom:40px;max-width:440px;margin-left:auto;margin-right:auto;line-height:1.6}
.cta-acts{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.cta-links{margin-top:20px;display:flex;gap:24px;justify-content:center;flex-wrap:wrap}
.cta-links a{font-size:12px;font-family:'Space Mono',monospace;color:${P.teal};text-decoration:none;transition:opacity .2s;letter-spacing:0.06em}
.cta-links a:hover{opacity:0.7}

/* ── Footer ── */
footer{background:${P.surface};color:${P.dim};padding:48px 48px 32px;border-top:1px solid ${P.border}}
.ft{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:24px}
.fb{font-family:'Space Mono',monospace;font-size:12px;font-weight:700;color:${P.teal};text-decoration:none;letter-spacing:0.08em}
.ft-tag{font-size:12px;margin-top:6px;color:${P.dim}}
.fl a{font-size:12px;color:${P.dim};text-decoration:none;margin-right:20px;transition:color .2s}
.fl a:hover{color:${P.text}}
.fbot{font-size:10px;font-family:'Space Mono',monospace;padding-top:24px;border-top:1px solid ${P.border};display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;letter-spacing:0.04em}

@media(max-width:768px){
  nav{padding:0 20px}.nav-links{display:none}
  .section{padding:64px 24px}
  .metrics-row{grid-template-columns:repeat(2,1fr)}
  .screens-scroll{padding:8px 20px}
  footer{padding:40px 24px}
}
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">TOPO<span class="nav-sub">by RAM</span></a>
  <ul class="nav-links">
    <li><a href="#terrain">Terrain</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#palette">Palette</a></li>
    <li><a href="${SLUG}-viewer">View Design</a></li>
  </ul>
  <a class="btn-s" href="${SLUG}-mock">Live Mock ◑</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-badge">RAM Design Studio · Observability · Dark</div>
  <h1 class="hero-h1">Map your<br><span>system's</span><br>terrain.</h1>
  <p class="hero-sub">Infrastructure metrics visualized as topographic landscape — CPU ridgelines, memory elevation, network surge. Your system has terrain. Now you can read it.</p>
  <div class="hero-acts">
    <a class="btn-lg" href="${SLUG}-mock">Explore Mock ◑</a>
    <a class="btn-lg-o" href="${SLUG}-viewer">View in Pencil</a>
  </div>
  <p class="hero-meta">DARK THEME · 5 SCREENS · DEVOPS OBSERVABILITY · 2026</p>
</section>

<!-- Ticker -->
<div class="ticker">
  <span class="ticker-track">
    CPU TERRAIN<span class="sep">·</span>MEMORY PRESSURE<span class="sep">·</span>NETWORK SURGE<span class="sep">·</span>SERVICE TOPOLOGY<span class="sep">·</span>INCIDENT MAP<span class="sep">·</span>DEPLOY RIDGE<span class="sep">·</span>ALERT ELEVATION<span class="sep">·</span>LIVE OBSERVABILITY<span class="sep">·</span>
    CPU TERRAIN<span class="sep">·</span>MEMORY PRESSURE<span class="sep">·</span>NETWORK SURGE<span class="sep">·</span>SERVICE TOPOLOGY<span class="sep">·</span>INCIDENT MAP<span class="sep">·</span>DEPLOY RIDGE<span class="sep">·</span>ALERT ELEVATION<span class="sep">·</span>LIVE OBSERVABILITY<span class="sep">·</span>
  </span>
</div>

<!-- Features -->
<section class="section" id="terrain">
  <div class="s-eye">Why TOPO</div>
  <div class="s-title">Infrastructure has<br>shape. See it.</div>
  <div class="features-grid">
    <div class="fc">
      <div class="fc-icon">⟁</div>
      <div class="fc-title">Terrain Charts</div>
      <div class="fc-body">CPU, memory and network rendered as glowing ridgeline landscapes — not flat line graphs. Feel the contours of your system.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">◈</div>
      <div class="fc-title">Service Topology</div>
      <div class="fc-body">Every microservice mapped like a region on terrain — health status visible at a glance via bioluminescent dot indicators.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">⚑</div>
      <div class="fc-title">Elevation Alerts</div>
      <div class="fc-body">Incidents surface like peaks on the map. Red for critical, amber for warnings. Alert severity mirrors topographic elevation.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">↑</div>
      <div class="fc-title">Deploy Ridge</div>
      <div class="fc-body">Pipeline progress tracked as terrain traversal. Watch your deploy climb through build → test → deploy → verify.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">⊕</div>
      <div class="fc-title">System Health Score</div>
      <div class="fc-body">Single composite health number on the overview — like an altitude reading for your entire system. Green means clear terrain.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">◑</div>
      <div class="fc-title">Dark-native Design</div>
      <div class="fc-body">Built dark-first. Bioluminescent teal glow on deep slate — optimised for long sessions in terminal-heavy engineering environments.</div>
    </div>
  </div>
</section>

<!-- Screens -->
<section class="screens-section" id="screens">
  <div class="screens-head">
    <div class="s-eye">5 Screens</div>
    <div class="s-title" style="margin-bottom:0">Inside TOPO</div>
  </div>
  <div class="screens-scroll">
    ${screenCards.map(sc => `
    <div class="sp">
      <div class="sp-head">
        <div class="sp-eye">TOPO · ${sc.id}</div>
        <div class="sp-title">${sc.id}</div>
      </div>
      <div class="sp-body">
        <div class="sp-terrain"></div>
        <div class="sp-card">
          <div class="sp-card-val" style="color:${sc.color}">98%</div>
          <div class="sp-card-lbl">System Health</div>
        </div>
        ${['api-gateway','auth-service','data-pipeline'].map((svc,i) => `
        <div class="sp-row">
          <div class="sp-dot" style="background:${i===2?P.amber:P.green}"></div>
          <div class="sp-lbl">${svc}</div>
          <div class="sp-val" style="color:${i===2?P.amber:P.green}">${i===2?'890ms':'42ms'}</div>
        </div>`).join('')}
        <div class="sp-bar-row">
          <div style="font-size:9px;color:${P.dim};letter-spacing:0.08em;text-transform:uppercase">CPU</div>
          <div class="sp-bar-t"><div class="sp-bar-f" style="width:54%;background:${sc.color}"></div></div>
        </div>
        <div class="sp-bar-row">
          <div style="font-size:9px;color:${P.dim};letter-spacing:0.08em;text-transform:uppercase">MEM</div>
          <div class="sp-bar-t"><div class="sp-bar-f" style="width:70%;background:${P.amber}"></div></div>
        </div>
      </div>
    </div>`).join('')}
  </div>
</section>

<!-- Metrics -->
<section class="section">
  <div class="s-eye">By the numbers</div>
  <div class="s-title">TOPO at a glance</div>
  <div class="metrics-row">
    <div class="mc"><div class="mc-val">2.4<span style="font-size:18px">ms</span></div><div class="mc-lbl">Avg Latency</div></div>
    <div class="mc"><div class="mc-val" style="color:${P.green}">99.8<span style="font-size:18px">%</span></div><div class="mc-lbl">Uptime</div></div>
    <div class="mc"><div class="mc-val" style="color:${P.amber}">14</div><div class="mc-lbl">Services</div></div>
    <div class="mc"><div class="mc-val" style="color:${P.red}">1</div><div class="mc-lbl">Active Incidents</div></div>
  </div>
</section>

<!-- Quote -->
<section class="quote-sec">
  <div class="q-text">"Your infrastructure has <span>terrain</span>. Peaks, valleys, ridgelines. TOPO makes it visible."</div>
  <div class="q-by">RAM DESIGN HEARTBEAT · 2026</div>
</section>

<!-- Palette -->
<section class="section" id="palette">
  <div class="s-eye">Design System</div>
  <div class="s-title">The TOPO palette</div>
  <p style="font-size:14px;color:${P.dim};line-height:1.7;max-width:560px;margin-bottom:8px">
    Inspired by San Rita's topographic terrain aesthetic on Awwwards and Neon database's bioluminescent glow bars on darkmodedesign.com. Deep slate base, teal glow for data, amber warmth for alerts.
  </p>
  <div class="palette-row">
    <div class="swatch" style="background:${P.bg};color:${P.text}">#090C0D<br>Slate BG</div>
    <div class="swatch" style="background:${P.surface};color:${P.text}">#111619<br>Surface</div>
    <div class="swatch" style="background:${P.teal};color:${P.bg}">#1EC8B0<br>Teal Glow</div>
    <div class="swatch" style="background:${P.amber};color:${P.bg}">#F0924A<br>Amber Alert</div>
    <div class="swatch" style="background:${P.green};color:${P.bg}">#3EC87A<br>Healthy</div>
    <div class="swatch" style="background:${P.red};color:${P.bg}">#E05050<br>Critical</div>
  </div>
  <div style="margin-top:32px;padding:20px;background:${P.surface};border-radius:12px;border:1px solid ${P.border};max-width:560px">
    <div style="font-family:'Space Mono',monospace;font-size:10px;color:${P.teal};letter-spacing:0.12em;margin-bottom:12px">INSPIRATION SOURCES</div>
    <div style="font-size:13px;color:${P.dim};line-height:1.7">
      · <strong style="color:${P.text}">San Rita</strong> — Awwwards SOTD · topographic contour lines as design texture<br>
      · <strong style="color:${P.text}">Neon Database</strong> — darkmodedesign.com · glowing cyan data bars on dark background<br>
      · <strong style="color:${P.text}">dhero studio</strong> — darkmodedesign.com · starfield particles, dark agency aesthetic<br>
      · <strong style="color:${P.text}">supercommon systems</strong> — land-book.com · "time as an instrument" minimal dark UI
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-sec">
  <div class="cta-h">Your system<br>has <span>terrain</span>.</div>
  <div class="cta-sub">Explore the interactive mock to see TOPO in action — or open the Pencil viewer to inspect every layer.</div>
  <div class="cta-acts">
    <a class="btn-lg" href="${SLUG}-mock">Interactive Mock ◑</a>
    <a class="btn-lg-o" href="${SLUG}-viewer">Pencil Viewer</a>
  </div>
  <div class="cta-links">
    <a href="${SLUG}-viewer">View .pen file →</a>
    <a href="${SLUG}-mock">Light / Dark toggle →</a>
  </div>
</section>

<footer>
  <div class="ft">
    <div>
      <a class="fb" href="#">TOPO</a>
      <div class="ft-tag">Developer Observability · Dark Theme · 2026</div>
    </div>
    <div class="fl">
      <a href="${SLUG}-viewer">Pencil Viewer</a>
      <a href="${SLUG}-mock">Interactive Mock</a>
      <a href="#">RAM Studio</a>
    </div>
  </div>
  <div class="fbot">
    <span>RAM DESIGN HEARTBEAT · TOPO · DEVOPS-OBSERVABILITY-DARK</span>
    <span>ram.zenbin.org/${SLUG}</span>
  </div>
</footer>

</body>
</html>`;
}

function buildViewer() {
  const penJsonStr = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${penJsonStr};</script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TOPO — Pencil Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#090C0D;font-family:'Space Grotesk',system-ui,sans-serif}
header{background:#111619;border-bottom:1px solid #1D282B;padding:0 24px;height:52px;display:flex;align-items:center;justify-content:space-between}
.h-logo{font-family:'Space Mono',monospace;font-size:12px;font-weight:700;color:#1EC8B0;letter-spacing:0.08em;text-decoration:none}
.h-links{display:flex;gap:20px}
.h-links a{font-size:12px;color:#607A78;text-decoration:none;transition:color .2s}
.h-links a:hover{color:#C8E0DC}
#pencil-viewer{width:100%;height:calc(100vh - 52px)}
</style>
<VIEWER_SCRIPT_PLACEHOLDER>
</head>
<body>
<header>
  <a class="h-logo" href="${SLUG}">← TOPO</a>
  <div class="h-links">
    <a href="${SLUG}">Hero Page</a>
    <a href="${SLUG}-mock">Interactive Mock ◑</a>
  </div>
</header>
<div id="pencil-viewer"></div>
</body>
</html>`;
  viewerHtml = viewerHtml.replace('<VIEWER_SCRIPT_PLACEHOLDER>', injection + '\n<script src="https://cdn.pencil.dev/viewer.js"></script>');
  return viewerHtml;
}

// ─── GITHUB queue ─────────────────────────────────────────────────────────────
async function updateGalleryQueue() {
  function ghReq(opts, body) {
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

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? '✓ OK' : '✗ ' + putRes.body.slice(0, 120));
  return newEntry;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n── TOPO Design Discovery Pipeline ──\n');

  // 1. Hero
  console.log('Publishing hero...');
  const heroRes = await zenPut(SLUG, `TOPO — ${TAGLINE}`, buildHero());
  console.log(`Hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  // 2. Viewer
  console.log('Publishing viewer...');
  const viewerRes = await zenPut(`${SLUG}-viewer`, 'TOPO — Pencil Viewer', buildViewer());
  console.log(`Viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  // 3. Gallery queue
  console.log('Updating gallery queue...');
  const entry = await updateGalleryQueue();

  console.log('\n✓ Pipeline complete:');
  console.log(`  Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock   → https://ram.zenbin.org/${SLUG}-mock  (pending Svelte build)`);
})();
