'use strict';
// lucid-publish.js — Full Design Discovery pipeline for LUCID
// LUCID — Founder Clarity OS
// Theme: LIGHT · Slug: lucid

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'lucid';
const APP_NAME  = 'LUCID';
const TAGLINE   = 'Your founder clarity layer.';
const ARCHETYPE = 'founder-wellness-productivity-light';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Founder clarity OS — LIGHT theme. Inspired by Midday.ai "let agents run your business" clean financial SaaS on darkmodedesign.com, Dawn evidence-based mental health AI on lapa.ninja, and the Relace/Paperclip AI agent orchestration wave on lapa.ninja. App combines focus session tracking, cognitive clarity scoring, business metrics pulse, and habit streaks. Palette: warm ivory #F7F4EF, electric coral #E8502A, sage green #2FA86A, lavender AI #7B6EF6.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'lucid.pen'), 'utf8');

const P = {
  bg:      '#F7F4EF',
  surface: '#FFFFFF',
  text:    '#1A1714',
  dim:     '#8A8278',
  faint:   '#C4BEB6',
  coral:   '#E8502A',
  sage:    '#2FA86A',
  lav:     '#7B6EF6',
  amber:   '#E08A2A',
  border:  '#E8E4DE',
  rule:    '#F2EEE8',
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
  const screens = [
    { id: 'Clarity',  sub: 'Daily clarity score ring with energy/focus/recovery/mood sub-bars, 7-day bar chart, AI nudge, quick-action CTAs', color: P.coral },
    { id: 'Focus',    sub: 'Active Pomodoro timer circle, flow state indicator, session stats row, AI context card, completed sessions log', color: P.sage  },
    { id: 'Pulse',    sub: 'Business metrics grid (MRR, Runway, Users, Churn), 7-month MRR bar chart, conversion funnel, recent signals', color: P.lav   },
    { id: 'Habits',   sub: 'Weekly heatmap grid, habit rows with progress bars and streak counters, AI pattern card, top streaks leaderboard', color: P.amber },
    { id: 'Insights', sub: 'Clarity sparkline trend, AI weekly narrative, 4 pattern cards with insights, prioritised action recommendations', color: P.coral },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:'Plus Jakarta Sans',system-ui,sans-serif;scroll-behavior:smooth}
body{min-height:100vh;overflow-x:hidden}

nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(247,244,239,0.92);backdrop-filter:blur(16px);border-bottom:1px solid ${P.border}}
.nav-logo{font-family:'DM Mono',monospace;font-size:15px;font-weight:500;color:${P.coral};text-decoration:none;letter-spacing:0.06em}
.nav-sub{font-size:10px;color:${P.faint};margin-left:8px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:400}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:${P.dim};text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${P.text}}
.btn-s{font-size:12px;font-weight:600;background:${P.coral};color:#fff;border:none;border-radius:8px;padding:9px 20px;text-decoration:none;transition:opacity .2s}
.btn-s:hover{opacity:0.85}

.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden;background:${P.bg}}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 40%, rgba(232,80,42,0.07) 0%, transparent 70%);pointer-events:none}
.hero-badge{display:inline-block;font-size:11px;font-weight:600;color:${P.coral};background:rgba(232,80,42,0.10);border:1px solid rgba(232,80,42,0.18);border-radius:20px;padding:5px 16px;margin-bottom:32px;letter-spacing:0.06em;text-transform:uppercase}
.hero-h1{font-size:clamp(52px,8vw,92px);font-weight:800;line-height:1.05;letter-spacing:-0.03em;color:${P.text};margin-bottom:24px}
.hero-h1 span{color:${P.coral}}
.hero-sub{font-size:18px;color:${P.dim};max-width:540px;line-height:1.7;margin-bottom:40px;font-weight:400}
.hero-acts{display:flex;gap:16px;justify-content:center;margin-bottom:24px;flex-wrap:wrap}
.btn-lg{font-size:15px;font-weight:700;background:${P.coral};color:#fff;border:none;border-radius:12px;padding:16px 32px;text-decoration:none;transition:all .2s}
.btn-lg:hover{opacity:0.88;transform:translateY(-1px)}
.btn-lg-o{font-size:15px;font-weight:600;background:transparent;color:${P.text};border:1.5px solid ${P.border};border-radius:12px;padding:15px 32px;text-decoration:none;transition:all .2s}
.btn-lg-o:hover{border-color:${P.coral};color:${P.coral}}
.hero-meta{font-size:10px;font-weight:500;color:${P.faint};letter-spacing:0.12em;text-transform:uppercase}

.ticker{overflow:hidden;height:40px;background:${P.coral};display:flex;align-items:center}
.ticker-track{display:inline-flex;gap:0;white-space:nowrap;animation:ticker 24s linear infinite;font-size:11px;font-weight:600;color:#fff;letter-spacing:0.08em}
.sep{margin:0 20px;opacity:0.5}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

.section{padding:96px 48px;max-width:1200px;margin:0 auto}
.s-eye{font-size:11px;font-weight:600;color:${P.coral};letter-spacing:0.10em;text-transform:uppercase;margin-bottom:14px}
.s-title{font-size:clamp(32px,4vw,52px);font-weight:800;letter-spacing:-0.02em;line-height:1.1;margin-bottom:48px;color:${P.text}}

.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.fc{background:${P.surface};border:1px solid ${P.border};border-radius:20px;padding:32px;transition:transform .2s,box-shadow .2s}
.fc:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(232,80,42,0.08)}
.fc-icon{font-size:24px;margin-bottom:16px;color:${P.coral}}
.fc-title{font-size:16px;font-weight:700;margin-bottom:10px;color:${P.text}}
.fc-body{font-size:13px;color:${P.dim};line-height:1.7}

.screens-section{background:${P.surface};padding:80px 0;overflow:hidden}
.screens-head{text-align:center;padding:0 48px;margin-bottom:48px}
.screens-scroll{display:flex;gap:20px;padding:8px 48px;overflow-x:auto;scrollbar-width:thin;scrollbar-color:${P.border} transparent}
.sp{min-width:260px;background:${P.bg};border:1px solid ${P.border};border-radius:20px;overflow:hidden;flex-shrink:0}
.sp-head{padding:20px 20px 12px;border-bottom:1px solid ${P.border}}
.sp-eye{font-size:9px;font-weight:600;color:${P.coral};letter-spacing:0.10em;text-transform:uppercase;margin-bottom:4px}
.sp-title{font-size:16px;font-weight:700;color:${P.text}}
.sp-body{padding:16px 20px;display:flex;flex-direction:column;gap:10px}
.sp-score{display:flex;align-items:baseline;gap:6px;margin-bottom:4px}
.sp-score-val{font-size:32px;font-weight:800;color:${P.coral}}
.sp-score-sub{font-size:11px;color:${P.faint}}
.sp-bar-row{display:flex;align-items:center;gap:8px}
.sp-bar-label{font-size:9px;font-weight:600;color:${P.faint};width:64px;letter-spacing:0.05em;text-transform:uppercase}
.sp-bar-t{flex:1;height:5px;background:${P.rule};border-radius:3px;overflow:hidden}
.sp-bar-f{height:100%;border-radius:3px;transition:width .3s}
.sp-row{display:flex;align-items:center;gap:8px;font-size:11px}
.sp-dot{width:7px;height:7px;border-radius:50%}
.sp-lbl{color:${P.dim};flex:1}
.sp-val{font-weight:600;font-size:11px}
.sp-ai{background:rgba(123,110,246,0.10);border-left:2px solid ${P.lav};border-radius:4px;padding:8px 10px;font-size:10px;color:${P.lav};line-height:1.5}

.metrics-row{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.mc{background:${P.surface};border:1px solid ${P.border};border-radius:16px;padding:28px;text-align:center}
.mc-val{font-size:40px;font-weight:800;color:${P.coral};letter-spacing:-0.02em;line-height:1}
.mc-lbl{font-size:12px;color:${P.dim};margin-top:8px;font-weight:500;letter-spacing:0.03em}

.quote-sec{background:${P.coral};padding:80px 48px;text-align:center}
.q-text{font-size:clamp(24px,3.5vw,40px);font-weight:800;color:#fff;max-width:800px;margin:0 auto 20px;line-height:1.3;letter-spacing:-0.01em}
.q-text span{opacity:0.75;font-style:italic}
.q-by{font-size:10px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:0.14em;text-transform:uppercase}

.palette-row{display:flex;gap:12px;flex-wrap:wrap}
.swatch{width:120px;height:80px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:12px;font-size:10px;font-weight:600;letter-spacing:0.04em;border:1px solid ${P.border}}

footer{background:${P.text};color:rgba(247,244,239,0.5);padding:48px;display:flex;justify-content:space-between;align-items:center}
.f-brand{font-family:'DM Mono',monospace;font-size:13px;color:${P.coral};font-weight:500}
.f-links{display:flex;gap:24px}
.f-links a{font-size:12px;color:rgba(247,244,239,0.4);text-decoration:none;transition:color .2s}
.f-links a:hover{color:${P.coral}}

@media(max-width:768px){
  nav{padding:0 20px}.nav-links{display:none}
  .section{padding:64px 24px}
  .features-grid{grid-template-columns:1fr}
  .metrics-row{grid-template-columns:repeat(2,1fr)}
  .screens-scroll{padding:8px 20px}
  footer{padding:40px 24px;flex-direction:column;gap:20px;text-align:center}
}
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">LUCID<span class="nav-sub">by RAM</span></a>
  <ul class="nav-links">
    <li><a href="#clarity">Clarity</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#palette">Palette</a></li>
    <li><a href="${SLUG}-viewer">View Design</a></li>
  </ul>
  <a class="btn-s" href="${SLUG}-mock">Live Mock ☀◑</a>
</nav>

<section class="hero">
  <div class="hero-badge">RAM Design Studio · Founder OS · Light Theme</div>
  <h1 class="hero-h1">Your<br><span>clarity</span><br>layer.</h1>
  <p class="hero-sub">AI-powered focus sessions, cognitive clarity scoring, business pulse, and habit intelligence — the operating layer for founder performance.</p>
  <div class="hero-acts">
    <a class="btn-lg" href="${SLUG}-mock">Explore Mock ☀◑</a>
    <a class="btn-lg-o" href="${SLUG}-viewer">View in Pencil</a>
  </div>
  <p class="hero-meta">LIGHT THEME · 5 SCREENS · FOUNDER PRODUCTIVITY · 2026</p>
</section>

<div class="ticker">
  <span class="ticker-track">
    CLARITY SCORE<span class="sep">·</span>DEEP FOCUS<span class="sep">·</span>FLOW STATE<span class="sep">·</span>MRR GROWTH<span class="sep">·</span>HABIT STREAKS<span class="sep">·</span>AI SYNTHESIS<span class="sep">·</span>POMODORO ENGINE<span class="sep">·</span>BUSINESS PULSE<span class="sep">·</span>
    CLARITY SCORE<span class="sep">·</span>DEEP FOCUS<span class="sep">·</span>FLOW STATE<span class="sep">·</span>MRR GROWTH<span class="sep">·</span>HABIT STREAKS<span class="sep">·</span>AI SYNTHESIS<span class="sep">·</span>POMODORO ENGINE<span class="sep">·</span>BUSINESS PULSE<span class="sep">·</span>
  </span>
</div>

<section class="section" id="clarity">
  <div class="s-eye">Why LUCID</div>
  <div class="s-title">Founders need clarity,<br>not more noise.</div>
  <div class="features-grid">
    <div class="fc">
      <div class="fc-icon">◎</div>
      <div class="fc-title">Clarity Score</div>
      <div class="fc-body">A daily composite score built from energy, focus, recovery, and mood — synthesized by AI into one number you can act on.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">⊙</div>
      <div class="fc-title">Deep Focus Engine</div>
      <div class="fc-body">Structured Pomodoro sessions with live flow-state detection, distraction tracking, and real-time AI context cards.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">⟁</div>
      <div class="fc-title">Business Pulse</div>
      <div class="fc-body">MRR, runway, churn, and conversion funnel — live signals from your business woven into your daily cognitive context.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">◈</div>
      <div class="fc-title">Habit Intelligence</div>
      <div class="fc-body">Streak tracking with AI pattern detection — LUCID notices "you skip workouts when sleep is under 7h" before you do.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">✦</div>
      <div class="fc-title">Weekly AI Synthesis</div>
      <div class="fc-body">Every Monday, LUCID generates a narrative synthesis of your performance week — patterns, correlations, and specific recommendations.</div>
    </div>
    <div class="fc">
      <div class="fc-icon">◑</div>
      <div class="fc-title">Light-native Design</div>
      <div class="fc-body">Built light-first on warm ivory — not clinical white. Coral energy accents and lavender AI indicators create a warm, readable environment.</div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="screens-head">
    <div class="s-eye">5 Screens</div>
    <div class="s-title" style="margin-bottom:0">Inside LUCID</div>
  </div>
  <div class="screens-scroll">
    ${screens.map(sc => `
    <div class="sp">
      <div class="sp-head">
        <div class="sp-eye">LUCID · ${sc.id}</div>
        <div class="sp-title">${sc.id}</div>
      </div>
      <div class="sp-body">
        <div class="sp-score">
          <div class="sp-score-val" style="color:${sc.color}">91</div>
          <div class="sp-score-sub">/ 100 clarity</div>
        </div>
        <div class="sp-bar-row">
          <div class="sp-bar-label">Energy</div>
          <div class="sp-bar-t"><div class="sp-bar-f" style="width:88%;background:${P.coral}"></div></div>
        </div>
        <div class="sp-bar-row">
          <div class="sp-bar-label">Focus</div>
          <div class="sp-bar-t"><div class="sp-bar-f" style="width:94%;background:${P.sage}"></div></div>
        </div>
        <div class="sp-bar-row">
          <div class="sp-bar-label">Recovery</div>
          <div class="sp-bar-t"><div class="sp-bar-f" style="width:76%;background:${P.amber}"></div></div>
        </div>
        <div class="sp-ai">✦ AI: Your clearest hour is 10–11am. Block it now.</div>
        ${[
          { label: 'Deep Work', val: '90 min', col: P.sage  },
          { label: 'Team Sync',  val: 'Now',   col: P.coral },
          { label: 'Writing',    val: 'Later',  col: P.faint },
        ].map(r => `<div class="sp-row"><div class="sp-dot" style="background:${r.col}"></div><div class="sp-lbl">${r.label}</div><div class="sp-val" style="color:${r.col}">${r.val}</div></div>`).join('')}
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="section">
  <div class="s-eye">By the numbers</div>
  <div class="s-title">LUCID at a glance</div>
  <div class="metrics-row">
    <div class="mc"><div class="mc-val">91</div><div class="mc-lbl">Clarity Score</div></div>
    <div class="mc"><div class="mc-val" style="color:${P.sage}">3h 40m</div><div class="mc-lbl">Deep Focus Today</div></div>
    <div class="mc"><div class="mc-val" style="color:${P.lav}">48d</div><div class="mc-lbl">Reading Streak</div></div>
    <div class="mc"><div class="mc-val" style="color:${P.amber}">$18k</div><div class="mc-lbl">MRR Pulse</div></div>
  </div>
</section>

<section class="quote-sec">
  <div class="q-text">"Your best work happens when <span>clarity is high.</span> LUCID makes sure you know when that is."</div>
  <div class="q-by">RAM DESIGN HEARTBEAT · 2026</div>
</section>

<section class="section" id="palette">
  <div class="s-eye">Design System</div>
  <div class="s-title">The LUCID palette</div>
  <p style="font-size:14px;color:${P.dim};line-height:1.7;max-width:560px;margin-bottom:32px">
    Inspired by Midday.ai's warm-toned financial SaaS (darkmodedesign.com) and Dawn's evidence-based wellness aesthetic (lapa.ninja). Warm ivory ground, coral energy, lavender AI, sage health.
  </p>
  <div class="palette-row">
    <div class="swatch" style="background:${P.bg};color:${P.text}">#F7F4EF<br>Ivory BG</div>
    <div class="swatch" style="background:${P.surface};color:${P.text};border:1px solid ${P.border}">#FFFFFF<br>Surface</div>
    <div class="swatch" style="background:${P.coral};color:#fff">#E8502A<br>Coral</div>
    <div class="swatch" style="background:${P.sage};color:#fff">#2FA86A<br>Sage</div>
    <div class="swatch" style="background:${P.lav};color:#fff">#7B6EF6<br>Lavender AI</div>
    <div class="swatch" style="background:${P.amber};color:#fff">#E08A2A<br>Amber</div>
  </div>
</section>

<footer>
  <div class="f-brand">LUCID by RAM</div>
  <div class="f-links">
    <a href="${SLUG}-viewer">Pencil Viewer</a>
    <a href="${SLUG}-mock">Interactive Mock</a>
    <a href="https://ram.zenbin.org">RAM Design Studio</a>
  </div>
</footer>

</body></html>`;
}

function buildViewer() {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LUCID — Pencil Viewer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#F7F4EF;font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:80px 24px 40px}
.vhd{width:100%;max-width:1100px;display:flex;justify-content:space-between;align-items:center;margin-bottom:40px}
.vhd-title{font-size:20px;font-weight:700;color:#1A1714}
.vhd-sub{font-size:12px;color:#8A8278;margin-top:4px}
.btn-back{font-size:13px;font-weight:600;color:#E8502A;text-decoration:none;border:1.5px solid rgba(232,80,42,0.3);border-radius:8px;padding:8px 18px}
.screens-grid{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;width:100%;max-width:1100px}
.screen-wrap{display:flex;flex-direction:column;align-items:center;gap:10px}
.screen-label{font-size:10px;font-weight:600;color:#8A8278;letter-spacing:0.08em;text-transform:uppercase}
.phone-shell{width:390px;height:844px;border-radius:44px;overflow:hidden;border:6px solid #E8E4DE;box-shadow:0 20px 60px rgba(26,23,20,0.12);background:#F7F4EF;position:relative;flex-shrink:0}
canvas{display:block}
</style>
</head><body>
<div class="vhd">
  <div>
    <div class="vhd-title">LUCID — Founder Clarity OS</div>
    <div class="vhd-sub">Pencil Design Viewer · 5 screens · Light theme</div>
  </div>
  <a class="btn-back" href="lucid">← Back to Hero</a>
</div>
<div class="screens-grid" id="grid"></div>
<script>
SCREENS_PLACEHOLDER
const screens = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN).screens : [];
const grid = document.getElementById('grid');
screens.forEach(sc => {
  const wrap = document.createElement('div'); wrap.className='screen-wrap';
  const lbl = document.createElement('div'); lbl.className='screen-label'; lbl.textContent=sc.label; wrap.appendChild(lbl);
  const shell = document.createElement('div'); shell.className='phone-shell';
  const canvas = document.createElement('canvas'); canvas.width=390; canvas.height=844; canvas.style.width='390px'; canvas.style.height='844px';
  shell.appendChild(canvas); wrap.appendChild(shell); grid.appendChild(wrap);
  renderScreen(canvas, sc.elements);
});
function renderScreen(canvas, els) {
  const ctx = canvas.getContext('2d');
  (els||[]).forEach(el => {
    if (!el) return;
    ctx.save();
    if (el.type==='rect') {
      if (el.fill && el.fill!=='transparent') {
        ctx.fillStyle=el.fill;
        if (el.r>0) { roundRect(ctx,el.x,el.y,el.w,el.h,el.r); ctx.fill(); } else { ctx.fillRect(el.x,el.y,el.w,el.h); }
      }
    } else if (el.type==='circle') {
      ctx.fillStyle=el.fill; ctx.beginPath(); ctx.arc(el.cx,el.cy,el.r,0,Math.PI*2); ctx.fill();
    } else if (el.type==='line') {
      ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth||1; ctx.beginPath(); ctx.moveTo(el.x1,el.y1); ctx.lineTo(el.x2,el.y2); ctx.stroke();
    } else if (el.type==='text') {
      const w = el.weight||'regular';
      const fw = w==='bold'||w==='semibold'?'700':w==='medium'?'500':'400';
      ctx.font=fw+' '+el.size+'px '+(el.font==='mono'?'monospace':'system-ui,sans-serif');
      ctx.fillStyle=el.fill; ctx.textAlign=el.align||'left'; ctx.textBaseline='alphabetic';
      ctx.fillText(String(el.content||''),el.x,el.y);
    }
    ctx.restore();
  });
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}
</script>
</body></html>`;
  html = html.replace('SCREENS_PLACEHOLDER', injection);
  return html;
}

async function ghReq(opts, body) {
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

async function updateGalleryQueue() {
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
    sha: currentSha,
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
      'Accept': 'application/vnd.github.v3+json',
    }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));
  return newEntry;
}

(async () => {
  console.log('\n── LUCID Design Discovery Pipeline ──\n');

  console.log('Publishing hero...');
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE}`, buildHero());
  console.log(`Hero: ${heroRes.status} -> https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const viewerRes = await zenPut(`${SLUG}-viewer`, 'LUCID — Pencil Viewer', buildViewer());
  console.log(`Viewer: ${viewerRes.status} -> https://ram.zenbin.org/${SLUG}-viewer`);

  console.log('Updating gallery queue...');
  await updateGalleryQueue();

  console.log('\nPipeline complete:');
  console.log(`  Hero   -> https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer -> https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock   -> https://ram.zenbin.org/${SLUG}-mock`);
})();
