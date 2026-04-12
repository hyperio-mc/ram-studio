'use strict';
// flock-publish.js — Full Design Discovery pipeline for FLOCK
// FLOCK — Founder OS for AI-Native Teams
// Theme: LIGHT · Slug: flock

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'flock';
const APP_NAME  = 'FLOCK';
const TAGLINE   = 'Your team + agents, one view';
const ARCHETYPE = 'founder-os-ai-native-teams';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Light-themed Founder OS for AI-native teams — dual human+agent workload view. Inspired by Linear "teams and agents" era (darkmodedesign.com), Equals GTM AI Analyst (land-book.com), and Dawn calm evidence-based UI (lapa.ninja). Warm parchment white #F7F5F1, indigo-violet accent #5B5EF0, amber agents #F97316. Shows today view, agent status, OKRs, finance, sprint with workload split between humans and AI agents.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'flock.pen'), 'utf8');

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
    },
  }, body);
  return res;
}

const P = {
  bg:         '#F7F5F1',
  surface:    '#FFFFFF',
  surface2:   '#EEEBE5',
  text:       '#18181B',
  textMuted:  'rgba(24,24,27,0.42)',
  accent:     '#5B5EF0',
  accentDim:  'rgba(91,94,240,0.10)',
  accent2:    '#F97316',
  accent2Dim: 'rgba(249,115,22,0.10)',
  success:    '#16A34A',
  danger:     '#DC2626',
  border:     'rgba(24,24,27,0.09)',
};

function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="FLOCK is a Founder OS for AI-native teams — track humans and AI agents in one warm, light dashboard.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;
  background:rgba(247,245,241,0.90);
  backdrop-filter:blur(20px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-size:16px;font-weight:900;color:${P.text};letter-spacing:-0.5px}
.nav-logo span{color:${P.accent}}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${P.text}}
.nav-badge{
  display:flex;align-items:center;gap:7px;
  background:${P.accentDim};border:1px solid rgba(91,94,240,0.2);
  color:${P.accent};border-radius:20px;
  padding:5px 14px;font-size:10px;font-weight:700;letter-spacing:0.5px;
}
.nav-badge::before{
  content:'';width:6px;height:6px;border-radius:50%;background:${P.success};
  box-shadow:0 0 6px ${P.success};animation:pulse 2s ease-in-out infinite;
}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}

.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:100px 24px 80px;
}
.hero-label{
  display:inline-flex;align-items:center;gap:8px;
  background:${P.accentDim};border:1px solid rgba(91,94,240,0.2);
  color:${P.accent};border-radius:20px;
  padding:6px 16px;font-size:10px;font-weight:700;
  letter-spacing:1.5px;margin-bottom:32px;
}
h1{
  font-size:clamp(52px,9vw,104px);font-weight:900;
  line-height:0.93;letter-spacing:-5px;
  color:${P.text};margin-bottom:28px;
}
h1 .hi{color:${P.accent}}
h1 .hi2{color:${P.accent2}}
.hero-sub{
  font-size:clamp(16px,2vw,20px);color:${P.textMuted};
  max-width:520px;line-height:1.65;margin-bottom:48px;
}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:72px}
.btn-primary{
  background:${P.accent};color:#FFFFFF;
  padding:14px 34px;border-radius:28px;
  font-size:15px;font-weight:800;text-decoration:none;
  box-shadow:0 4px 24px rgba(91,94,240,0.35);
  transition:transform .15s,box-shadow .15s;
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(91,94,240,0.45)}
.btn-secondary{
  background:${P.surface};color:${P.text};
  border:1.5px solid ${P.border};
  padding:14px 28px;border-radius:28px;
  font-size:15px;font-weight:600;text-decoration:none;
  transition:border-color .2s,box-shadow .2s;
}
.btn-secondary:hover{border-color:${P.accent};box-shadow:0 2px 12px rgba(91,94,240,0.12)}

/* Workforce pills */
.workforce{display:flex;gap:16px;justify-content:center;margin-bottom:64px;flex-wrap:wrap}
.w-pill{
  display:flex;align-items:center;gap:10px;
  background:${P.surface};border:1.5px solid ${P.border};
  border-radius:40px;padding:10px 22px;
  box-shadow:0 2px 12px rgba(0,0,0,0.05);
}
.w-pill-dot{width:10px;height:10px;border-radius:50%}
.w-pill-val{font-size:22px;font-weight:900;color:${P.text}}
.w-pill-info div:first-child{font-size:12px;font-weight:700;color:${P.text}}
.w-pill-info div:last-child{font-size:10px;color:${P.textMuted}}

/* Phone mockup */
.phone-wrap{width:300px;margin:0 auto}
.phone-mockup{
  width:300px;height:610px;
  background:${P.surface};border-radius:48px;
  box-shadow:0 0 0 1.5px ${P.border},0 32px 100px rgba(91,94,240,0.12),0 8px 32px rgba(0,0,0,0.08);
  overflow:hidden;position:relative;
}
.phone-notch{
  position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:88px;height:22px;background:${P.bg};
  border-radius:0 0 14px 14px;z-index:10;
}
.phone-stripe{
  position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,${P.accent},${P.accent2});z-index:11;
  opacity:0.7;
}
.phone-screen{
  width:100%;height:100%;background:${P.bg};
  padding:28px 16px 0;
}
.m-topbar{
  display:flex;align-items:center;justify-content:space-between;
  background:${P.surface};margin:-28px -16px 0;padding:12px 16px;
  border-bottom:1px solid ${P.border};margin-bottom:16px;
}
.m-title{font-size:16px;font-weight:800;color:${P.text}}
.m-sub{font-size:10px;color:${P.textMuted};margin-top:2px}
.m-cards{display:flex;gap:8px;margin-bottom:12px}
.m-card{flex:1;background:${P.surface};border:1.5px solid ${P.border};border-radius:12px;padding:10px}
.m-card-badge{font-size:8px;font-weight:700;padding:2px 8px;border-radius:10px;margin-bottom:6px;display:inline-block}
.m-card-val{font-size:22px;font-weight:900;color:${P.text};line-height:1}
.m-card-sub{font-size:9px;color:${P.textMuted};margin-top:2px}
.m-card-tasks{font-size:9px;font-weight:700;margin-top:4px}
.m-progress-wrap{background:${P.surface};border:1.5px solid ${P.border};border-radius:10px;padding:10px;margin-bottom:12px}
.m-progress-head{display:flex;justify-content:space-between;margin-bottom:6px}
.m-progress-label{font-size:9px;font-weight:700;color:${P.textMuted};letter-spacing:1px}
.m-progress-val{font-size:9px;font-weight:700;color:${P.accent}}
.m-bar-bg{height:5px;background:${P.surface2};border-radius:3px}
.m-bar-fg{height:5px;background:${P.accent};border-radius:3px;width:54%}
.m-progress-foot{display:flex;justify-content:space-between;margin-top:4px}
.m-progress-info{font-size:8px;color:${P.textMuted}}
.m-feed-label{font-size:9px;font-weight:700;color:${P.textMuted};letter-spacing:1.5px;margin-bottom:7px}
.m-item{background:${P.surface};border:1.5px solid ${P.border};border-radius:8px;padding:8px 10px;margin-bottom:6px;display:flex;align-items:center;gap:8px}
.m-item-icon{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.m-item-body{flex:1}
.m-item-title{font-size:10px;font-weight:700;color:${P.text}}
.m-item-sub{font-size:8px;color:${P.textMuted};margin-top:1px}
.m-item-badge{font-size:9px;font-weight:700;padding:1px 6px;border-radius:5px}

/* Screens section */
.screens-section{padding:100px 24px;background:${P.surface};}
.section-label{
  text-align:center;font-size:11px;font-weight:700;color:${P.accent};
  letter-spacing:2px;margin-bottom:14px;
}
.section-title{
  text-align:center;font-size:clamp(28px,4vw,44px);font-weight:800;
  color:${P.text};letter-spacing:-1.5px;margin-bottom:14px;
}
.section-sub{
  text-align:center;font-size:16px;color:${P.textMuted};
  max-width:500px;margin:0 auto 56px;line-height:1.6;
}
.screens-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:18px;max-width:1100px;margin:0 auto;
}
.screen-card{
  background:${P.bg};border:1.5px solid ${P.border};border-radius:16px;
  padding:24px;transition:border-color .2s,transform .2s,box-shadow .2s;
  position:relative;overflow:hidden;
}
.screen-card::after{
  content:'';position:absolute;bottom:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,${P.accent},${P.accent2});
  transform:scaleX(0);transform-origin:left;transition:transform .3s;
}
.screen-card:hover{border-color:rgba(91,94,240,0.3);transform:translateY(-3px);box-shadow:0 8px 32px rgba(91,94,240,0.1)}
.screen-card:hover::after{transform:scaleX(1)}
.screen-num{
  font-size:10px;font-weight:700;color:${P.accent};
  background:${P.accentDim};border:1px solid rgba(91,94,240,0.15);
  padding:3px 10px;border-radius:20px;letter-spacing:0.5px;
  display:inline-block;margin-bottom:14px;
}
.screen-name{font-size:17px;font-weight:700;color:${P.text};margin-bottom:8px}
.screen-desc{font-size:13px;color:${P.textMuted};line-height:1.55}

/* Features */
.features-section{padding:80px 24px;max-width:1100px;margin:0 auto}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:48px}
.feature-card{
  background:${P.surface};border:1.5px solid ${P.border};border-radius:14px;padding:26px;
}
.feature-icon{font-size:26px;margin-bottom:14px}
.feature-name{font-size:15px;font-weight:700;color:${P.text};margin-bottom:8px}
.feature-desc{font-size:13px;color:${P.textMuted};line-height:1.55}

/* Palette */
.palette-section{padding:80px 24px;text-align:center;max-width:900px;margin:0 auto}
.swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:32px}
.swatch{width:80px;height:80px;border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,0.08);display:flex;align-items:flex-end;padding:8px}
.swatch-label{font-size:7px;color:rgba(0,0,0,0.4);word-break:break-all;font-weight:600}
.swatch-light .swatch-label{color:rgba(0,0,0,0.4)}
.swatch-dark .swatch-label{color:rgba(255,255,255,0.5)}

/* Inspiration */
.process-section{
  padding:80px 24px;
  background:${P.surface};
  border-top:1.5px solid ${P.border};
  border-bottom:1.5px solid ${P.border};
}
.process-inner{max-width:800px;margin:0 auto}
.process-quote{
  font-size:clamp(17px,2.5vw,24px);color:${P.text};font-style:italic;
  line-height:1.55;margin:28px 0;
  border-left:3px solid ${P.accent};padding-left:22px;
}
.process-source{font-size:11px;color:${P.textMuted};padding-left:25px;letter-spacing:0.3px}

/* CTA */
.cta-section{padding:100px 24px;text-align:center;background:${P.bg}}
.cta-title{font-size:clamp(32px,5vw,56px);font-weight:900;letter-spacing:-2.5px;color:${P.text};margin-bottom:14px}
.cta-sub{font-size:16px;color:${P.textMuted};margin-bottom:40px}

footer{
  padding:36px;text-align:center;border-top:1.5px solid ${P.border};
  font-size:12px;color:${P.textMuted};
}
footer a{color:${P.accent};text-decoration:none}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">FL<span>O</span>CK</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Design</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
  </div>
  <div class="nav-badge">4 AGENTS LIVE</div>
</nav>

<section class="hero">
  <div class="hero-label">RAM DESIGN STUDIO · HEARTBEAT</div>
  <h1>Your<br><span class="hi">team</span> +<br><span class="hi2">agents,</span><br>one view</h1>
  <p class="hero-sub">FLOCK brings your human team and AI agents onto one calm, light dashboard. See who's working on what — human or machine — at a glance.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>

  <div class="workforce">
    <div class="w-pill">
      <div class="w-pill-dot" style="background:${P.accent}"></div>
      <div class="w-pill-val">3</div>
      <div class="w-pill-info">
        <div>Humans</div>
        <div>11 tasks active</div>
      </div>
    </div>
    <div class="w-pill">
      <div class="w-pill-dot" style="background:${P.accent2}"></div>
      <div class="w-pill-val">4</div>
      <div class="w-pill-info">
        <div>AI Agents</div>
        <div>13 tasks running</div>
      </div>
    </div>
    <div class="w-pill">
      <div class="w-pill-dot" style="background:${P.success}"></div>
      <div class="w-pill-val">54%</div>
      <div class="w-pill-info">
        <div>Day Complete</div>
        <div>13 / 24 tasks</div>
      </div>
    </div>
  </div>

  <div class="phone-wrap">
    <div class="phone-mockup">
      <div class="phone-notch"></div>
      <div class="phone-stripe"></div>
      <div class="phone-screen">
        <div class="m-topbar">
          <div>
            <div class="m-title">Today</div>
            <div class="m-sub">SAT 28 MAR · Q1 W13</div>
          </div>
          <div style="font-size:18px;color:${P.textMuted}">⋯</div>
        </div>

        <div style="font-size:15px;font-weight:700;color:${P.text};margin-bottom:4px">Good morning, Rakis</div>
        <div style="font-size:10px;color:${P.textMuted};margin-bottom:12px">4 agents + 3 humans · 24 tasks today</div>

        <div class="m-cards">
          <div class="m-card">
            <div class="m-card-badge" style="background:${P.accentDim};color:${P.accent}">HUMANS</div>
            <div class="m-card-val">3</div>
            <div class="m-card-sub">active now</div>
            <div class="m-card-tasks" style="color:${P.accent}">11 tasks</div>
          </div>
          <div class="m-card">
            <div class="m-card-badge" style="background:${P.accent2Dim};color:${P.accent2}">AGENTS</div>
            <div class="m-card-val">4</div>
            <div class="m-card-sub">running</div>
            <div class="m-card-tasks" style="color:${P.accent2}">13 tasks</div>
          </div>
        </div>

        <div class="m-progress-wrap">
          <div class="m-progress-head">
            <div class="m-progress-label">DAY COMPLETION</div>
            <div class="m-progress-val">54%</div>
          </div>
          <div class="m-bar-bg"><div class="m-bar-fg"></div></div>
          <div class="m-progress-foot">
            <div class="m-progress-info">13 / 24 tasks</div>
            <div class="m-progress-info">4h 20m left</div>
          </div>
        </div>

        <div class="m-feed-label">LIVE ACTIVITY</div>
        <div class="m-item">
          <div class="m-item-icon" style="background:${P.accent2Dim}">⚡</div>
          <div class="m-item-body">
            <div class="m-item-title">Analyst Agent</div>
            <div class="m-item-sub">Q1 analysis done · 2m ago</div>
          </div>
          <div class="m-item-badge" style="background:rgba(22,163,74,0.1);color:${P.success}">Done</div>
        </div>
        <div class="m-item">
          <div class="m-item-icon" style="background:${P.accentDim}">◉</div>
          <div class="m-item-body">
            <div class="m-item-title">Sarah K.</div>
            <div class="m-item-sub">Investor deck · In progress</div>
          </div>
          <div class="m-item-badge" style="background:${P.accentDim};color:${P.accent}">Active</div>
        </div>
        <div class="m-item">
          <div class="m-item-icon" style="background:rgba(220,38,38,0.08)">!</div>
          <div class="m-item-body">
            <div class="m-item-title">Pricing Agent</div>
            <div class="m-item-sub">Decision needed: $299 tier</div>
          </div>
          <div class="m-item-badge" style="background:rgba(220,38,38,0.08);color:${P.danger}">Review</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="section-label">5 SCREENS</div>
  <h2 class="section-title">Everything your team needs</h2>
  <p class="section-sub">From your dual workforce view to sprint velocity — designed to be beautiful, dense, and instantly readable.</p>
  <div class="screens-grid">
    <div class="screen-card">
      <div class="screen-num">01</div>
      <div class="screen-name">Today</div>
      <div class="screen-desc">Dual workforce cards (humans vs agents), day completion bar, and a live activity feed with agent status and human tasks.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">02</div>
      <div class="screen-name">Agents</div>
      <div class="screen-desc">Four live agent cards with progress bars, blocked states, and completion status. Plus idle agents ready to wake.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">03</div>
      <div class="screen-name">Goals</div>
      <div class="screen-desc">Q1 health score, four OKRs with colour-coded status strips, and AI forecast. Each goal tracks agent contributions.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">04</div>
      <div class="screen-name">Finance</div>
      <div class="screen-desc">ARR hero card in indigo, 6-month bar chart, MRR/burn/runway KPIs, and top expense breakdown with progress bars.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">05</div>
      <div class="screen-name">Sprint</div>
      <div class="screen-desc">Sprint velocity gauge with human vs agent workload split, and task list showing which agent is doing which work.</div>
    </div>
  </div>
</section>

<section class="features-section" id="features">
  <div class="section-label">DESIGN DECISIONS</div>
  <h2 class="section-title" style="text-align:center">Three things that matter</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <div class="feature-name">Dual workforce cards</div>
      <div class="feature-desc">The centrepiece of FLOCK — two side-by-side cards in matching height, one indigo (humans), one amber (agents). Directly inspired by Linear's framing of "teams and agents" as co-equal workers.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◼</div>
      <div class="feature-name">Colour-coded OKR strips</div>
      <div class="feature-desc">Each OKR card uses a 5px left-border strip in green/amber/indigo/red to communicate status before you read a word. A light-theme adaptation of the signal-strip pattern from midday.ai.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">☀</div>
      <div class="feature-name">Warm parchment light</div>
      <div class="feature-desc">#F7F5F1 instead of pure white — a subtle warm cast that makes this feel like a Sunday-morning productivity tool rather than a cold SaaS dashboard. Inspired by Dawn's calm, evidence-based UI tone (lapa.ninja).</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">■</div>
      <div class="feature-name">Agent attribution in sprint</div>
      <div class="feature-desc">Task items in the sprint screen show the assigned agent (e.g. "Analyst ⚡") alongside human names — making AI contribution visible without overwhelming. Directly echoes Equals' Analyst agent framing.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">COLOUR SYSTEM</div>
  <h2 class="section-title" style="letter-spacing:-1.5px">Warm light. Clear signal.</h2>
  <div class="swatches">
    <div class="swatch swatch-light" style="background:#F7F5F1;border:1.5px solid ${P.border}"><span class="swatch-label" style="color:rgba(0,0,0,0.4)">#F7F5F1 BG</span></div>
    <div class="swatch swatch-light" style="background:#FFFFFF;border:1.5px solid ${P.border}"><span class="swatch-label" style="color:rgba(0,0,0,0.4)">#FFFFFF SURFACE</span></div>
    <div class="swatch swatch-dark" style="background:#5B5EF0"><span class="swatch-label" style="color:rgba(255,255,255,0.6)">#5B5EF0 INDIGO</span></div>
    <div class="swatch swatch-dark" style="background:#F97316"><span class="swatch-label" style="color:rgba(255,255,255,0.6)">#F97316 AMBER</span></div>
    <div class="swatch swatch-dark" style="background:#16A34A"><span class="swatch-label" style="color:rgba(255,255,255,0.6)">#16A34A SUCCESS</span></div>
    <div class="swatch swatch-dark" style="background:#DC2626"><span class="swatch-label" style="color:rgba(255,255,255,0.6)">#DC2626 DANGER</span></div>
    <div class="swatch swatch-dark" style="background:#18181B"><span class="swatch-label" style="color:rgba(255,255,255,0.5)">#18181B TEXT</span></div>
  </div>
</section>

<section class="process-section">
  <div class="process-inner">
    <div class="section-label" style="text-align:left;margin-bottom:14px">INSPIRATION</div>
    <h2 class="section-title" style="text-align:left;font-size:clamp(22px,3vw,34px);margin-bottom:0">Where this came from</h2>
    <div class="process-quote">
      "The product development system for teams and agents — designed for the AI era."
    </div>
    <div class="process-source">— linear.app, featured on darkmodedesign.com · March 2025</div>
    <p style="font-size:14px;color:${P.textMuted};line-height:1.7;margin-top:28px">
      This run browsed <strong style="color:${P.text}">darkmodedesign.com</strong>, <strong style="color:${P.text}">land-book.com</strong>, and <strong style="color:${P.text}">lapa.ninja</strong>. Three things clicked together: Linear calling itself "the system for teams and agents" (not just teams), Equals launching an "AI Analyst agent" for GTM analytics, and Dawn's (lapa.ninja) warm, evidence-based calm UI. The pattern: AI-native products are dropping the dark-mode-only association and going light — confident, clear, daytime-productive. FLOCK is that idea applied to a Founder OS: your whole workforce, human and agent, in one warm parchment view.
    </p>
  </div>
</section>

<section class="cta-section">
  <div class="cta-title">Your whole team,<br>one screen.</div>
  <div class="cta-sub">Explore all five screens in the viewer or interact with the live Svelte mock.</div>
  <div class="hero-actions" style="justify-content:center">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <p>FLOCK — designed by <a href="https://ram.zenbin.org">RAM Design Studio</a> · <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> · <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a></p>
  <p style="margin-top:8px;opacity:0.5">Inspired by linear.app · land-book.com · lapa.ninja · darkmodedesign.com</p>
</footer>

</body>
</html>`;
}

function buildViewer() {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Design Viewer</title>
${injection}
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#F7F5F1;color:#18181B;font-family:'Inter',system-ui,sans-serif}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px}
h1{font-size:20px;font-weight:900;color:#18181B;letter-spacing:-0.5px;margin-bottom:6px}
p{font-size:13px;color:rgba(24,24,27,0.42);margin-bottom:20px}
#pencil-viewer{width:100%;max-width:900px;height:80vh;border:1.5px solid rgba(24,24,27,0.09);border-radius:16px;background:#fff;box-shadow:0 4px 32px rgba(91,94,240,0.08)}
</style>
</head>
<body>
<h1>${APP_NAME}</h1>
<p>${TAGLINE}</p>
<div id="pencil-viewer"></div>
<script>
if(window.PencilViewer && window.EMBEDDED_PEN){
  window.PencilViewer.init({container:'pencil-viewer',pen:JSON.parse(window.EMBEDDED_PEN)});
}
</script>
</body>
</html>`;
}

async function run() {
  console.log('Publishing FLOCK design...\n');

  const heroHtml = buildHero();
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHtml);
  console.log(`Hero page: ${heroRes.status === 200 ? '✓' : '✗ '+heroRes.body.slice(0,60)} https://ram.zenbin.org/${SLUG}`);

  const viewerHtml = buildViewer();
  const viewerRes = await zenPut(`${SLUG}-viewer`, `${APP_NAME} Viewer`, viewerHtml);
  console.log(`Viewer:    ${viewerRes.status === 200 ? '✓' : '✗ '+viewerRes.body.slice(0,60)} https://ram.zenbin.org/${SLUG}-viewer`);

  // Gallery queue
  const ghGetRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData = JSON.parse(ghGetRes.body);
  const currentSha = fileData.sha;
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at:new Date().toISOString() };
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
  const ghPutRes = await req({
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
  console.log(`Gallery:   ${ghPutRes.status === 200 ? '✓' : '✗ ' + ghPutRes.body.slice(0,80)}`);

  fs.writeFileSync(path.join(__dirname, 'flock-entry.json'), JSON.stringify(newEntry, null, 2));
  console.log('\n✓ Done');
  console.log(`  https://ram.zenbin.org/${SLUG}`);
  console.log(`  https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
