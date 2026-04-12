#!/usr/bin/env node
// STILL — Publish hero page to zenbin.org/p/still
'use strict';
const https = require('https');
const fs    = require('fs');

const SLUG     = 'still';
const APP_NAME = 'STILL';
const TAGLINE  = 'your brain is not a server';

function zenPost(slug, title, html, subdomain) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ title, html, overwrite: true });
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'X-Subdomain': subdomain || '' }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>STILL — your brain is not a server</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #F5F3EF;
  --surface:  #FFFFFF;
  --text:     #1C1917;
  --muted:    rgba(28,25,23,0.48);
  --faint:    rgba(28,25,23,0.26);
  --green:    #2D6A4F;
  --green-s:  #E8F0EC;
  --amber:    #C4903A;
  --amber-s:  #FBF3E3;
  --border:   #E4E0D8;
  --rule:     #DDD9D3;
}

html { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
body { min-height: 100vh; overflow-x: hidden; }

/* NAV */
nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 60px;
  background: rgba(245,243,239,0.92); backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}
.nav-wordmark { font-size: 13px; font-weight: 700; letter-spacing: 0.18em; color: var(--green); }
.nav-links { display: flex; gap: 28px; align-items: center; }
.nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta {
  font-size: 13px; font-weight: 600; padding: 9px 22px; border-radius: 10px;
  background: var(--green-s); border: 1px solid rgba(45,106,79,0.24);
  color: var(--green); text-decoration: none; transition: background 0.2s;
}
.nav-cta:hover { background: #D1E8DC; }

/* HERO */
.hero {
  min-height: 92vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 80px 48px 60px;
}
.hero-eyebrow {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--green);
  margin-bottom: 32px;
}
.hero-title {
  font-family: 'Lora', serif; font-size: clamp(52px, 9vw, 100px);
  font-weight: 400; line-height: 1.0; letter-spacing: -0.02em;
  color: var(--green); margin-bottom: 12px;
}
.hero-title-fade {
  font-family: 'Lora', serif; font-size: clamp(52px, 9vw, 100px);
  font-weight: 400; line-height: 1.0; letter-spacing: -0.02em;
  color: rgba(196,144,58,0.55); margin-bottom: 40px;
}
.hero-rule { width: 80px; height: 1px; background: var(--rule); margin: 0 auto 32px; }
.hero-manifesto {
  font-size: clamp(16px, 2vw, 19px); color: var(--text); line-height: 1.75;
  max-width: 400px; margin-bottom: 12px;
}
.hero-sub {
  font-size: 14px; color: var(--muted); max-width: 420px; line-height: 1.7; margin-bottom: 52px;
}
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
.btn-primary {
  font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 40px;
  background: var(--green); color: #fff; text-decoration: none;
  transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover { background: #3A8762; transform: translateY(-2px); }
.btn-secondary {
  font-size: 15px; font-weight: 500; padding: 14px 28px; border-radius: 40px;
  background: transparent; border: 1px solid var(--border); color: var(--muted);
  text-decoration: none; transition: border-color 0.2s, color 0.2s;
}
.btn-secondary:hover { border-color: var(--green); color: var(--text); }

/* STATE PAIR */
.state-pair {
  display: flex; gap: 14px; justify-content: center; margin: 48px auto 0;
  max-width: 360px;
}
.state-card {
  flex: 1; border-radius: 18px; padding: 24px 20px; text-align: center;
  border: 1px solid var(--border); background: var(--surface);
}
.state-card.green { background: var(--green-s); border-color: rgba(45,106,79,0.20); }
.state-card.amber { background: var(--amber-s); border-color: rgba(196,144,58,0.20); }
.state-icon { font-size: 28px; margin-bottom: 10px; }
.state-label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; }
.state-card.green .state-label { color: var(--green); }
.state-card.amber .state-label { color: var(--amber); }

/* SCREENS SECTION */
.screens-section { padding: 80px 48px; max-width: 1100px; margin: 0 auto; }
.section-eyebrow { text-align: center; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--muted); margin-bottom: 48px; }
.screens-strip { display: flex; gap: 16px; overflow-x: auto; padding: 12px 0 32px; justify-content: center; flex-wrap: wrap; }

.screen-card {
  width: 200px; flex-shrink: 0; border-radius: 20px; overflow: hidden;
  background: var(--surface); border: 1px solid var(--border);
  box-shadow: 0 2px 12px rgba(28,25,23,0.06);
  transition: transform 0.25s, box-shadow 0.25s;
}
.screen-card:hover { transform: translateY(-8px); box-shadow: 0 12px 40px rgba(28,25,23,0.10); }
.screen-label { font-size: 10px; font-weight: 600; letter-spacing: 0.10em; color: var(--muted); padding: 12px 14px 10px; border-bottom: 1px solid var(--border); }
.screen-body { padding: 14px; min-height: 160px; display: flex; flex-direction: column; gap: 8px; }

/* screen sketch elements */
.sk-bar  { height: 7px; border-radius: 4px; background: var(--border); }
.sk-bar.g { background: rgba(45,106,79,0.30); }
.sk-bar.a { background: rgba(196,144,58,0.30); }
.sk-bar.lg { width: 80%; }
.sk-bar.md { width: 60%; }
.sk-bar.sm { width: 40%; }
.sk-orb { width: 60px; height: 60px; border-radius: 50%; background: var(--green-s); margin: 0 auto; border: 3px solid rgba(45,106,79,0.30); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; color: var(--green); letter-spacing: 0.05em; }
.sk-row { display: flex; gap: 6px; }
.sk-col { flex: 1; }
.sk-chip { border-radius: 8px; padding: 8px; background: var(--border); }
.sk-chip.g { background: var(--green-s); }
.sk-chip.a { background: var(--amber-s); }
.sk-num { font-size: 18px; font-weight: 700; color: var(--green); }
.sk-num.a { color: var(--amber); }
.sk-sub { font-size: 8px; color: var(--muted); margin-top: 2px; }
.sk-timer { font-size: 28px; font-weight: 300; color: var(--text); text-align: center; }
.sk-toggle { border-radius: 8px; padding: 7px 10px; background: rgba(196,144,58,0.15); font-size: 9px; font-weight: 600; color: var(--amber); text-align: center; }
.sk-ritcard { border-radius: 8px; padding: 8px 10px; background: var(--surface); border-left: 3px solid var(--green); display: flex; justify-content: space-between; align-items: center; }
.sk-ritname { font-size: 9px; font-weight: 600; color: var(--text); }
.sk-rittime { font-size: 8px; color: var(--green); }
.sk-editorial { font-family: 'Lora', serif; font-size: 22px; font-weight: 400; color: var(--green); line-height: 1.1; }
.sk-editorial.fade { color: rgba(196,144,58,0.45); }

/* FEATURES */
.features-section { padding: 80px 48px; max-width: 960px; margin: 0 auto; }
.features-title { font-family: 'Lora', serif; font-size: 32px; font-weight: 400; text-align: center; margin-bottom: 14px; color: var(--text); }
.features-sub   { font-size: 15px; color: var(--muted); text-align: center; max-width: 480px; margin: 0 auto 52px; line-height: 1.7; }
.features-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 700px) { .features-grid { grid-template-columns: 1fr; } nav { padding: 14px 24px; } .nav-links { display: none; } }
.feature-card {
  border-radius: 20px; padding: 28px;
  background: var(--surface); border: 1px solid var(--border);
  transition: border-color 0.2s, transform 0.2s;
}
.feature-card:hover { border-color: rgba(45,106,79,0.30); transform: translateY(-3px); }
.feature-icon { font-size: 22px; margin-bottom: 16px; }
.feature-name { font-size: 15px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
.feature-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

/* PALETTE */
.palette-section { padding: 60px 48px; max-width: 600px; margin: 0 auto; text-align: center; }
.palette-label { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--muted); margin-bottom: 24px; }
.palette-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.pswatch { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.pswatch-dot { width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border); }
.pswatch-name { font-size: 10px; color: var(--muted); }

/* PHILOSOPHY BLOCK */
.philosophy-section { padding: 80px 48px; background: var(--green); color: #fff; text-align: center; }
.ph-title { font-family: 'Lora', serif; font-size: clamp(28px, 4vw, 44px); font-weight: 400; margin-bottom: 28px; line-height: 1.2; }
.ph-rule { width: 60px; height: 1px; background: rgba(255,255,255,0.25); margin: 0 auto 28px; }
.ph-body { font-size: 16px; color: rgba(255,255,255,0.70); max-width: 520px; margin: 0 auto 44px; line-height: 1.9; }
.ph-cta {
  display: inline-block; font-size: 15px; font-weight: 600; padding: 15px 44px; border-radius: 40px;
  background: #fff; color: var(--green); text-decoration: none;
  transition: opacity 0.2s; letter-spacing: 0.08em;
}
.ph-cta:hover { opacity: 0.90; }

/* SPECS */
.specs-section { padding: 80px 48px; max-width: 960px; margin: 0 auto; }
.specs-title { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--muted); margin-bottom: 32px; text-align: center; }
.specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
@media (max-width: 600px) { .specs-grid { grid-template-columns: 1fr; } }
.spec-card { border-radius: 16px; padding: 24px; background: var(--surface); border: 1px solid var(--border); }
.spec-label { font-size: 10px; font-weight: 600; letter-spacing: 0.10em; color: var(--muted); margin-bottom: 14px; }
.spec-item { font-size: 13px; color: var(--text); padding: 7px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; }
.spec-item:last-child { border-bottom: none; }
.spec-item-val { color: var(--muted); font-size: 12px; }

/* FOOTER */
footer { text-align: center; padding: 48px; border-top: 1px solid var(--border); font-size: 13px; color: var(--faint); line-height: 1.9; }
footer a { color: var(--muted); text-decoration: none; }
footer a:hover { color: var(--text); }
</style>
</head>
<body>

<nav>
  <span class="nav-wordmark">STILL</span>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#philosophy">Philosophy</a>
    <a href="https://zenbin.org/p/still-mock" class="nav-cta">Interactive Mock ↗</a>
  </div>
</nav>

<section class="hero">
  <p class="hero-eyebrow">LIGHT · WELLNESS · MINDFUL STATE SWITCHING</p>
  <div class="hero-title">stillness.</div>
  <div class="hero-title-fade">motion.</div>
  <div class="hero-rule"></div>
  <p class="hero-manifesto">your brain is not a server.</p>
  <p class="hero-sub">It needs contrast to stay precise. STILL tracks your work and rest states — and helps you switch between them deliberately.</p>
  <div class="hero-actions">
    <a href="https://zenbin.org/p/still-mock" class="btn-primary">Interactive Mock ↗</a>
    <a href="#screens" class="btn-secondary">See Screens ↓</a>
  </div>
  <div class="state-pair">
    <div class="state-card amber">
      <div class="state-icon">◐</div>
      <div class="state-label">MOTION</div>
    </div>
    <div class="state-card green">
      <div class="state-icon">◑</div>
      <div class="state-label">STILL</div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <p class="section-eyebrow">6 SCREENS · LIGHT LINEN · FOREST GREEN + AMBER GOLD</p>
  <div class="screens-strip">

    <div class="screen-card">
      <div class="screen-label">HOME</div>
      <div class="screen-body">
        <div class="sk-orb">STILL</div>
        <div class="sk-bar sm" style="margin:0 auto;width:50%"></div>
        <div style="display:flex;gap:4px;height:6px;border-radius:3px;overflow:hidden">
          <div style="flex:2;background:rgba(196,144,58,0.35)"></div>
          <div style="flex:1;background:rgba(45,106,79,0.35)"></div>
          <div style="flex:2;background:rgba(196,144,58,0.35)"></div>
          <div style="flex:1;background:rgba(45,106,79,0.35)"></div>
        </div>
        <div class="sk-row">
          <div class="sk-col sk-chip g"><div class="sk-num">74</div><div class="sk-sub">stillness score</div></div>
          <div class="sk-col sk-chip a"><div class="sk-num a">4</div><div class="sk-sub">motion blocks</div></div>
        </div>
      </div>
    </div>

    <div class="screen-card">
      <div class="screen-label">SESSION</div>
      <div class="screen-body">
        <div class="sk-toggle">◐  MOTION  ·  ◑ STILL</div>
        <div class="sk-timer">25:00</div>
        <div class="sk-bar sm" style="width:65%"></div>
        <div class="sk-bar lg"></div>
        <div class="sk-row" style="gap:6px">
          <div class="sk-col sk-chip g" style="padding:6px;font-size:8px;color:var(--green);text-align:center">set intention</div>
          <div class="sk-col sk-chip"   style="padding:6px;font-size:8px;color:var(--muted);text-align:center">skip to still</div>
        </div>
      </div>
    </div>

    <div class="screen-card" style="background:var(--green-s)">
      <div class="screen-label" style="border-color:rgba(45,106,79,0.15);color:var(--green)">BREAK RITUAL</div>
      <div class="screen-body" style="align-items:center">
        <div class="sk-editorial">stillness.</div>
        <div class="sk-editorial fade">motion.</div>
        <div style="width:50px;height:50px;border-radius:50%;border:3px solid rgba(45,106,79,0.30);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:300;color:var(--green)">20</div>
        <div class="sk-bar g md" style="margin:0 auto"></div>
      </div>
    </div>

    <div class="screen-card">
      <div class="screen-label">PATTERNS</div>
      <div class="screen-body">
        <div class="sk-bar md"></div>
        <div style="display:flex;align-items:flex-end;gap:5px;height:50px">
          ${[
            {s:34,m:60},{s:24,m:70},{s:28,m:66},{s:38,m:62,hl:true},{s:18,m:55}
          ].map(d => `
          <div style="flex:1;display:flex;flex-direction:column;gap:2px;align-items:center">
            <div style="width:100%;background:rgba(45,106,79,0.${d.hl?'55':'35'});border-radius:3px;height:${Math.round(d.s/3)}px"></div>
            <div style="width:100%;background:rgba(196,144,58,0.${d.hl?'45':'30'});border-radius:3px;height:${Math.round(d.m/4)}px"></div>
          </div>`).join('')}
        </div>
        <div class="sk-chip g" style="padding:8px">
          <div style="font-size:8px;font-weight:600;color:var(--green)">◑ Thursday is your stillness sweet spot</div>
        </div>
      </div>
    </div>

    <div class="screen-card">
      <div class="screen-label">RITUALS</div>
      <div class="screen-body">
        <div style="font-size:8px;font-weight:600;letter-spacing:0.08em;color:var(--muted)">VISION & EYES</div>
        <div class="sk-ritcard"><span class="sk-ritname">Panoramic gaze</span><span class="sk-rittime">2 min</span></div>
        <div class="sk-ritcard"><span class="sk-ritname">20-20-20 rule</span><span class="sk-rittime">20 sec</span></div>
        <div style="font-size:8px;font-weight:600;letter-spacing:0.08em;color:var(--muted)">BODY & BREATH</div>
        <div class="sk-ritcard" style="border-left-color:#7AB8A0"><span class="sk-ritname">Box breathing</span><span class="sk-rittime" style="color:#7AB8A0">4 min</span></div>
      </div>
    </div>

    <div class="screen-card" style="background:var(--green)">
      <div class="screen-label" style="border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.60)">ONBOARDING</div>
      <div class="screen-body">
        <div style="font-family:'Lora',serif;font-size:20px;color:#fff;line-height:1.1">stillness.</div>
        <div style="font-family:'Lora',serif;font-size:20px;color:rgba(255,255,255,0.35);line-height:1.1">motion.</div>
        <div style="height:1px;background:rgba(255,255,255,0.15)"></div>
        <div style="font-size:9px;color:rgba(255,255,255,0.65);line-height:1.7">your brain is not a server.</div>
        <div style="border-radius:20px;padding:8px 14px;background:#fff;text-align:center;font-size:10px;font-weight:700;color:var(--green);letter-spacing:0.12em">begin</div>
      </div>
    </div>

  </div>
</section>

<section class="features-section" id="features">
  <h2 class="features-title">Two states. Infinite clarity.</h2>
  <p class="features-sub">Most productivity apps count minutes. STILL names states — and measures how deliberately you switch between them.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◑</div>
      <div class="feature-name">Named States</div>
      <div class="feature-desc">STILL or MOTION. Not "focus mode" — a deliberate naming of what kind of attention you're giving. Tap the orb to switch.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⟳</div>
      <div class="feature-name">Rhythm Bar</div>
      <div class="feature-desc">See today's work/rest pattern at a glance. The visual rhythm tells you more than a Pomodoro count ever could.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-name">Ritual Library</div>
      <div class="feature-desc">Science-backed micro-recovery rituals — panoramic gaze, box breathing, aimless walks — that actually switch your nervous system state.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-name">Pattern Insights</div>
      <div class="feature-desc">Your weekly rhythm chart reveals when you're naturally still versus when you marathon through motion. Thursday is usually your sweet spot.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-name">Session Intention</div>
      <div class="feature-desc">Before every MOTION block: one sentence. What one thing will you finish? The constraint makes work crisp.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◐</div>
      <div class="feature-name">Stillness Score</div>
      <div class="feature-desc">Not productivity points. A measure of how deliberately you rested. 74/100 means you switched states with intention today.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <p class="palette-label">PALETTE</p>
  <div class="palette-row">
    <div class="pswatch"><div class="pswatch-dot" style="background:#F5F3EF"></div><div class="pswatch-name">Linen</div></div>
    <div class="pswatch"><div class="pswatch-dot" style="background:#2D6A4F"></div><div class="pswatch-name">Still</div></div>
    <div class="pswatch"><div class="pswatch-dot" style="background:#E8F0EC"></div><div class="pswatch-name">Still Soft</div></div>
    <div class="pswatch"><div class="pswatch-dot" style="background:#C4903A"></div><div class="pswatch-name">Motion</div></div>
    <div class="pswatch"><div class="pswatch-dot" style="background:#FBF3E3"></div><div class="pswatch-name">Motion Soft</div></div>
    <div class="pswatch"><div class="pswatch-dot" style="background:#9B8FD4"></div><div class="pswatch-name">Lavender</div></div>
    <div class="pswatch"><div class="pswatch-dot" style="background:#1C1917"></div><div class="pswatch-name">Ink</div></div>
  </div>
</section>

<section class="philosophy-section" id="philosophy">
  <h2 class="ph-title">"contrast is what makes<br>both states powerful"</h2>
  <div class="ph-rule"></div>
  <p class="ph-body">your brain is not a server. it doesn't perform under constant load. it needs contrast to stay precise. focus and release are different states. they should not compete. they should alternate.<br><br>this is not about productivity. it's about control — a digital tool for a biological rhythm.</p>
  <a href="https://zenbin.org/p/still-mock" class="ph-cta">try the mock</a>
</section>

<section class="specs-section" id="specs">
  <p class="specs-title">DESIGN SPECIFICATION</p>
  <div class="specs-grid">
    <div class="spec-card">
      <div class="spec-label">COLOUR LOGIC</div>
      <div class="spec-item"><span>STILL state</span><span class="spec-item-val">#2D6A4F — Forest Green</span></div>
      <div class="spec-item"><span>MOTION state</span><span class="spec-item-val">#C4903A — Amber Gold</span></div>
      <div class="spec-item"><span>Background</span><span class="spec-item-val">#F5F3EF — Warm Linen</span></div>
      <div class="spec-item"><span>Insight accent</span><span class="spec-item-val">#9B8FD4 — Soft Lavender</span></div>
    </div>
    <div class="spec-card">
      <div class="spec-label">TYPOGRAPHY</div>
      <div class="spec-item"><span>Display — editorial moments</span><span class="spec-item-val">Lora 400 serif</span></div>
      <div class="spec-item"><span>UI — all screens</span><span class="spec-item-val">Inter 400–600</span></div>
      <div class="spec-item"><span>Timer — session screen</span><span class="spec-item-val">Inter 300 · 72px</span></div>
      <div class="spec-item"><span>Labels — ALL CAPS tracked</span><span class="spec-item-val">Inter 600 · 0.14em</span></div>
    </div>
    <div class="spec-card">
      <div class="spec-label">KEY SCREENS</div>
      <div class="spec-item"><span>Home</span><span class="spec-item-val">State orb + rhythm bar</span></div>
      <div class="spec-item"><span>Session</span><span class="spec-item-val">Toggle + timer + intention</span></div>
      <div class="spec-item"><span>Break Ritual</span><span class="spec-item-val">Green immersive + countdown</span></div>
      <div class="spec-item"><span>Patterns</span><span class="spec-item-val">Stacked bar + insight cards</span></div>
      <div class="spec-item"><span>Rituals</span><span class="spec-item-val">Library by category</span></div>
      <div class="spec-item"><span>Onboarding</span><span class="spec-item-val">Philosophy-first, full green</span></div>
    </div>
    <div class="spec-card">
      <div class="spec-label">INSPIRATION</div>
      <div class="spec-item"><span>Site</span><span class="spec-item-val">land-book.com</span></div>
      <div class="spec-item"><span>Work</span><span class="spec-item-val">supercommon systems (konolee)</span></div>
      <div class="spec-item"><span>Concept</span><span class="spec-item-val">"stillness. motion." landing</span></div>
      <div class="spec-item"><span>Theme</span><span class="spec-item-val">LIGHT — follows VESPER dark</span></div>
    </div>
  </div>
</section>

<footer>
  <p>STILL · your brain is not a server · Wellness Mindfulness 2026</p>
  <p style="margin-top:8px">
    <a href="https://zenbin.org/p/still-mock">Interactive Mock ↗</a> &nbsp;·&nbsp;
    <a href="https://ram.zenbin.org/gallery">Gallery ↗</a> &nbsp;·&nbsp;
    <a href="https://ram.zenbin.org">RAM Design Studio ↗</a>
  </p>
  <p style="margin-top:14px;font-size:11px">RAM Design Heartbeat · 2026-03-31 · Inspired by supercommon systems on land-book.com</p>
</footer>

</body>
</html>`;

(async () => {
  console.log('Publishing STILL to zenbin.org/p/ ...');

  // Publish to zenbin.org/p/still
  const heroRes = await zenPost(SLUG, APP_NAME + ' — ' + TAGLINE, heroHtml, '');
  console.log('Hero:', heroRes.status, heroRes.status <= 201 ? '✓' : heroRes.body.slice(0, 100));

  if (heroRes.status <= 201) {
    console.log('  Live at: https://zenbin.org/p/still');
  }
})();
