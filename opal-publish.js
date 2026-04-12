#!/usr/bin/env node
// opal-publish.js — OPAL: Creative Vitals for Makers
// Hero page + viewer publisher

'use strict';
const fs   = require('fs');
const https = require('https');
const path  = require('path');

const SLUG    = 'opal-vitals';
const APP     = 'OPAL';
const TAGLINE = 'Creative vitals for makers';
const SUB     = 'ram';
const HOST    = 'zenbin.org';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: "/v1/pages/"+slug, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

async function publish(slug, html) {
  const res = await post(HOST, '/api/publish',
    { 'X-Subdomain': SUB, 'X-Slug': slug },
    { html, slug, subdomain: SUB }
  );
  console.log(`${slug}: HTTP ${res.status}`, res.status === 200 ? '✓' : res.body.slice(0,120));
  return res;
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OPAL — Creative Vitals for Makers</title>
<meta name="description" content="OPAL helps creative professionals track their output, build daily rituals, and understand when and how they do their best work.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F8F4EE;--surface:#FFFFFF;--surface2:#F2EDE4;
  --text:#1C1714;--muted:rgba(28,23,20,0.5);--muted2:rgba(28,23,20,0.35);
  --accent:#C85A0A;--accent2:#2A4BAB;
  --accent-soft:rgba(200,90,10,0.10);--accent2-soft:rgba(42,75,171,0.10);
  --accentl:#F4DFD0;--accent2l:#D6E0F7;
  --green:#2E7D57;--greenl:#D5EDDF;
  --border:rgba(28,23,20,0.09);--border2:rgba(28,23,20,0.15);
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;overflow-x:hidden}
a{color:var(--accent);text-decoration:none}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,244,238,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:58px}
.nav-brand{font-family:'Playfair Display',serif;font-weight:700;font-size:18px;letter-spacing:0.04em;color:var(--text)}
.nav-brand span{color:var(--accent)}
.nav-links{display:flex;gap:32px;font-size:13px;color:var(--muted);font-weight:500}
.nav-cta{background:var(--accent);color:#fff;font-size:13px;font-weight:700;padding:9px 22px;border-radius:8px;letter-spacing:0.04em;transition:all 0.2s}
.nav-cta:hover{background:#A8480A;transform:translateY(-1px)}

/* HERO */
.hero{min-height:100vh;display:flex;align-items:center;padding:100px 48px 80px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 70% 40%,rgba(200,90,10,0.07) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 10% 80%,rgba(42,75,171,0.06) 0%,transparent 60%);pointer-events:none}
.hero-inner{max-width:1140px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--accentl);border:1px solid rgba(200,90,10,0.22);border-radius:999px;padding:6px 16px;font-size:11px;font-weight:700;color:var(--accent);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:28px}
.badge-dot{width:6px;height:6px;background:var(--accent);border-radius:50%;animation:blink 2s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
h1{font-family:'Playfair Display',serif;font-size:clamp(42px,5.5vw,68px);font-weight:900;line-height:1.05;letter-spacing:-0.02em;margin-bottom:24px;color:var(--text)}
h1 em{font-style:italic;color:var(--accent)}
.hero-sub{font-size:17px;color:var(--muted);max-width:460px;margin-bottom:44px;line-height:1.75}
.hero-ctas{display:flex;gap:14px;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#fff;font-size:14px;font-weight:700;padding:14px 30px;border-radius:9px;display:inline-flex;align-items:center;gap:8px;letter-spacing:0.03em;transition:all 0.2s}
.btn-primary:hover{background:#A8480A;transform:translateY(-2px);box-shadow:0 16px 40px rgba(200,90,10,0.22)}
.btn-secondary{background:transparent;color:var(--text);font-size:14px;font-weight:600;padding:14px 30px;border-radius:9px;border:1.5px solid var(--border2);display:inline-flex;align-items:center;gap:8px;transition:all 0.2s}
.btn-secondary:hover{border-color:var(--accent2);color:var(--accent2)}
.hero-metrics{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:48px}
.hero-metric{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px}
.hero-metric .val{font-size:24px;font-weight:800;color:var(--text);line-height:1}
.hero-metric .label{font-size:11px;color:var(--muted);margin-top:4px;font-weight:500}
.hero-metric .delta{font-size:10px;font-weight:700;margin-top:6px}
.up{color:var(--green)} .down{color:#C02B2B}

/* PHONE MOCKUP */
.phone-wrap{display:flex;justify-content:center;align-items:center}
.phone{width:280px;height:580px;background:var(--surface);border-radius:40px;border:8px solid var(--text);box-shadow:0 40px 100px rgba(28,23,20,0.18),0 8px 24px rgba(28,23,20,0.10);position:relative;overflow:hidden}
.phone-notch{width:100px;height:22px;background:var(--text);border-radius:0 0 16px 16px;position:absolute;top:0;left:50%;transform:translateX(-50%);z-index:2}
.phone-screen{position:absolute;inset:0;background:var(--bg);padding:28px 14px 14px}
.phone-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.phone-app-name{font-size:8px;font-weight:800;color:var(--accent);letter-spacing:0.15em}
.phone-greeting{font-size:16px;font-weight:800;color:var(--text);line-height:1.2;margin-bottom:12px}
.phone-greeting small{font-size:11px;font-weight:400;color:var(--muted);display:block}
/* Bento */
.bento{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto auto;gap:6px}
.bento-score{grid-column:1/2;background:var(--accent);border-radius:10px;padding:10px 12px;color:#fff}
.bento-score .num{font-size:28px;font-weight:900;line-height:1}
.bento-score .lbl{font-size:7px;opacity:0.75;font-weight:600;letter-spacing:0.08em;margin-bottom:4px}
.bento-score .sub{font-size:7px;opacity:0.7;margin-top:6px}
.bento-streak{background:var(--surface2);border-radius:10px;padding:10px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.bento-streak .num{font-size:22px;font-weight:900;color:var(--text);line-height:1}
.bento-streak .lbl{font-size:7px;color:var(--muted);text-align:center;margin-top:2px}
.mini-metrics{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}
.mini-card{border-radius:8px;padding:7px 8px}
.mini-card .v{font-size:14px;font-weight:800;color:var(--text)}
.mini-card .l{font-size:7px;color:var(--muted);margin-top:1px}
.mini-card .s{font-size:7px;font-weight:700;margin-top:4px}
.activity-card{grid-column:1/-1;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px}
.activity-label{font-size:7px;font-weight:600;color:var(--muted);margin-bottom:5px}
.bars{display:flex;gap:2px;align-items:flex-end;height:28px}
.bar{width:13px;border-radius:2px;background:rgba(200,90,10,0.18)}
.bar.active{background:var(--accent)}
/* Phone nav */
.phone-nav{position:absolute;bottom:0;left:0;right:0;height:44px;background:var(--surface);border-top:1px solid var(--border);display:flex}
.phone-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:6px;color:var(--muted)}
.phone-nav-item.active{color:var(--accent)}
.phone-nav-item.active::after{content:'';position:absolute;top:0;width:20px;height:2px;background:var(--accent);border-radius:999px}

/* SECTIONS */
.section{padding:100px 48px;max-width:1140px;margin:0 auto}
.section-label{font-size:11px;font-weight:700;color:var(--accent);letter-spacing:0.16em;text-transform:uppercase;margin-bottom:16px}
h2{font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,52px);font-weight:800;line-height:1.1;letter-spacing:-0.02em;margin-bottom:20px}
h2 em{font-style:italic;color:var(--accent)}
.section-sub{font-size:17px;color:var(--muted);max-width:520px;line-height:1.75;margin-bottom:64px}

/* FEATURES BENTO GRID */
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;gap:16px}
.feat-card{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:32px 28px;transition:all 0.25s}
.feat-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(28,23,20,0.09);border-color:var(--border2)}
.feat-card.wide{grid-column:span 2}
.feat-card.accent-card{background:var(--accent);color:#fff;border-color:transparent}
.feat-card.accent-card .feat-label{color:rgba(255,255,255,0.7)}
.feat-card.accent-card .feat-title{color:#fff}
.feat-card.accent-card .feat-body{color:rgba(255,255,255,0.8)}
.feat-icon{width:44px;height:44px;background:var(--accentl);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:20px}
.feat-card.accent-card .feat-icon{background:rgba(255,255,255,0.18)}
.feat-label{font-size:11px;font-weight:700;color:var(--accent);letter-spacing:0.10em;text-transform:uppercase;margin-bottom:8px}
.feat-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:12px;color:var(--text);line-height:1.2}
.feat-body{font-size:14px;color:var(--muted);line-height:1.7}
.feat-metrics{display:flex;gap:24px;margin-top:24px}
.feat-metric-val{font-size:28px;font-weight:900;color:#fff}
.feat-metric-lbl{font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px}

/* QUOTE */
.quote-section{background:var(--surface2);border-radius:24px;padding:64px 80px;text-align:center;margin:0 48px}
blockquote{font-family:'Playfair Display',serif;font-size:clamp(20px,3vw,30px);font-weight:600;line-height:1.5;color:var(--text);font-style:italic;max-width:700px;margin:0 auto 24px}
.quote-attr{font-size:13px;color:var(--muted);font-weight:500}

/* DISCIPLINES */
.disciplines{padding:80px 48px;max-width:1140px;margin:0 auto}
.disc-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:40px}
.disc-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px 16px;text-align:center}
.disc-icon{font-size:24px;margin-bottom:10px}
.disc-name{font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px}
.disc-sub{font-size:11px;color:var(--muted)}
.disc-bar-wrap{height:4px;background:rgba(28,23,20,0.09);border-radius:999px;margin-top:12px}
.disc-bar{height:100%;border-radius:999px}

/* SOCIAL PROOF */
.social{padding:80px 48px 100px;max-width:1140px;margin:0 auto;text-align:center}
.social h2{margin-bottom:16px}
.social-sub{font-size:16px;color:var(--muted);margin-bottom:64px}
.testimonials{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.testi{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px 24px;text-align:left}
.testi-quote{font-size:14px;color:var(--text);line-height:1.7;margin-bottom:20px;font-style:italic}
.testi-author{display:flex;align-items:center;gap:12px}
.testi-avatar{width:36px;height:36px;border-radius:50%;background:var(--accentl);display:flex;align-items:center;justify-content:center;font-size:14px}
.testi-name{font-size:13px;font-weight:700;color:var(--text)}
.testi-role{font-size:11px;color:var(--muted)}

/* CTA FOOTER */
.cta-footer{background:var(--accent);padding:80px 48px;text-align:center;color:#fff}
.cta-footer h2{font-family:'Playfair Display',serif;font-size:clamp(30px,4vw,50px);font-weight:900;letter-spacing:-0.02em;color:#fff;margin-bottom:16px}
.cta-footer p{font-size:17px;color:rgba(255,255,255,0.8);margin-bottom:40px;max-width:480px;margin-left:auto;margin-right:auto}
.btn-white{background:#fff;color:var(--accent);font-size:14px;font-weight:800;padding:14px 32px;border-radius:9px;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s;letter-spacing:0.03em}
.btn-white:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(0,0,0,0.18)}

footer{background:var(--surface2);border-top:1px solid var(--border);padding:32px 48px;display:flex;align-items:center;justify-content:space-between}
.footer-brand{font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:var(--text)}
.footer-credit{font-size:12px;color:var(--muted)}

@media(max-width:900px){
  .hero-inner{grid-template-columns:1fr}
  nav{padding:0 24px}
  .features-grid{grid-template-columns:1fr}
  .feat-card.wide{grid-column:span 1}
  .disc-grid{grid-template-columns:repeat(2,1fr)}
  .testimonials{grid-template-columns:1fr}
}
</style>
</head>
<body>

<nav>
  <div class="nav-brand">O<span>P</span>AL</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#disciplines">Disciplines</a>
    <a href="#stories">Stories</a>
  </div>
  <a href="https://ram.zenbin.org/opal-vitals-mock" class="nav-cta">Try interactive mock →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-inner container">
    <div class="hero-content">
      <div class="hero-badge"><span class="badge-dot"></span>Creative Intelligence</div>
      <h1>Know your<br><em>creative health.</em></h1>
      <p class="hero-sub">OPAL tracks your writing, design, code, and focus — then shows you exactly when and how you do your best creative work.</p>
      <div class="hero-ctas">
        <a href="https://ram.zenbin.org/opal-vitals-mock" class="btn-primary">Try interactive mock →</a>
        <a href="https://ram.zenbin.org/opal-vitals-viewer" class="btn-secondary">View screens</a>
      </div>
      <div class="hero-metrics">
        <div class="hero-metric">
          <div class="val">9.2K</div>
          <div class="label">Words this week</div>
          <div class="delta up">↑ 18% vs last</div>
        </div>
        <div class="hero-metric">
          <div class="val">12</div>
          <div class="label">Day streak</div>
          <div class="delta up">Personal best: 21</div>
        </div>
        <div class="hero-metric">
          <div class="val">84</div>
          <div class="label">Creative score</div>
          <div class="delta up">↑ 6 pts this week</div>
        </div>
      </div>
    </div>
    <!-- Phone mockup -->
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="phone-header">
            <div>
              <div class="phone-app-name">OPAL</div>
            </div>
            <div style="font-size:8px;color:var(--muted)">Mon, 7 Apr</div>
          </div>
          <div class="phone-greeting">
            <small>Good morning,</small>Zara.
          </div>
          <div class="bento">
            <div class="bento-score">
              <div class="lbl">CREATIVE SCORE</div>
              <div class="num">84</div>
              <div style="font-size:8px;opacity:0.7;display:inline">/100</div>
              <div class="sub">↑ 6 pts this week</div>
            </div>
            <div class="bento-streak">
              <div class="num">12</div>
              <div class="lbl">day streak</div>
            </div>
            <div class="mini-metrics">
              <div class="mini-card" style="background:var(--accentl)">
                <div class="v">1,840</div><div class="l">Words</div><div class="s" style="color:var(--accent)">↑ 12%</div>
              </div>
              <div class="mini-card" style="background:var(--greenl)">
                <div class="v">3.5h</div><div class="l">Focus</div><div class="s" style="color:var(--green)">of 4h</div>
              </div>
              <div class="mini-card" style="background:var(--accent2l)">
                <div class="v">7</div><div class="l">Designs</div><div class="s" style="color:var(--accent2)">today</div>
              </div>
            </div>
            <div class="activity-card">
              <div class="activity-label">Today's activity</div>
              <div class="bars">
                ${[0.15,0.4,0.85,0.6,0.25,0.7,1.0,0.8,0.4,0.55,0.5,0.65].map((v,i)=>`<div class="bar${i===7?' active':''}" style="height:${Math.round(v*28)}px"></div>`).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="phone-nav">
          <div class="phone-nav-item active">◈<span>Vitals</span></div>
          <div class="phone-nav-item">◎<span>Output</span></div>
          <div class="phone-nav-item">⬡<span>Projects</span></div>
          <div class="phone-nav-item">▲<span>Streaks</span></div>
          <div class="phone-nav-item">✦<span>Insight</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="section" id="features">
  <div class="section-label">What OPAL does</div>
  <h2>Every facet of your<br><em>creative output</em>, unified.</h2>
  <p class="section-sub">OPAL is the first productivity tool built specifically for how creative professionals actually work — in cycles, rituals, and deep bursts.</p>
  <div class="features-grid">
    <div class="feat-card accent-card">
      <div class="feat-icon">◈</div>
      <div class="feat-label">Creative Score</div>
      <div class="feat-title">One number that tells you how creatively alive you are</div>
      <div class="feat-body">A composite score built from output volume, streak continuity, focus depth, and project momentum. At a glance, every morning.</div>
      <div class="feat-metrics">
        <div><div class="feat-metric-val">84</div><div class="feat-metric-lbl">Today's score</div></div>
        <div><div class="feat-metric-val">↑ 6</div><div class="feat-metric-lbl">vs last week</div></div>
      </div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◎</div>
      <div class="feat-label">Output Tracking</div>
      <div class="feat-title">Words, frames, lines, pages — tracked together</div>
      <div class="feat-body">Log writing, design, code, and reading in one place. Progress bars update in real time. Goals that flex with your schedule.</div>
    </div>
    <div class="feat-card wide">
      <div class="feat-icon">▲</div>
      <div class="feat-label">Creative Rituals</div>
      <div class="feat-title">Build the habits that build your work</div>
      <div class="feat-body">OPAL turns your best creative practices into trackable streaks. Morning write. Design review. Evening read. Deep work block. Watch the days stack up and feel the momentum compound. The 12-day streak view shows exactly which habits are firing and which need attention.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">✦</div>
      <div class="feat-label">Weekly Insight</div>
      <div class="feat-title">Understand <em>when</em> you create best</div>
      <div class="feat-body">OPAL's AI reflection surfaces patterns you'd never notice yourself. Peak hour. Best day. Highest-output conditions.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⬡</div>
      <div class="feat-label">Project Health</div>
      <div class="feat-title">5 projects. One clear view.</div>
      <div class="feat-body">Each project shows output, momentum, and deadline risk. At-risk projects surface in amber-red before they become crises.</div>
    </div>
  </div>
</section>

<!-- QUOTE -->
<div class="quote-section">
  <blockquote>"I always knew I worked in bursts — but I never knew <em>which</em> bursts were the ones that actually mattered."</blockquote>
  <div class="quote-attr">— Freelance designer, 4-week OPAL user</div>
</div>

<!-- DISCIPLINES -->
<section class="disciplines" id="disciplines">
  <div class="section-label">Creative disciplines</div>
  <h2>Built for the <em>full-stack</em> creative</h2>
  <div class="disc-grid">
    ${[
      {icon:'✍️',name:'Writing',sub:'Words, essays, scripts',pct:73,col:'#C85A0A'},
      {icon:'🎨',name:'Design',sub:'Frames, mockups, brand',pct:88,col:'#2A4BAB'},
      {icon:'💻',name:'Code',sub:'Lines, commits, deploys',pct:47,col:'#2E7D57'},
      {icon:'📚',name:'Reading',sub:'Books, articles, research',pct:56,col:'#7C3AED'},
      {icon:'🎯',name:'Deep focus',sub:'Uninterrupted work sessions',pct:87,col:'#C85A0A'},
    ].map(({icon,name,sub,pct,col})=>`
    <div class="disc-card">
      <div class="disc-icon">${icon}</div>
      <div class="disc-name">${name}</div>
      <div class="disc-sub">${sub}</div>
      <div class="disc-bar-wrap"><div class="disc-bar" style="width:${pct}%;background:${col}"></div></div>
    </div>`).join('')}
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="social" id="stories">
  <div class="section-label">Creator stories</div>
  <h2>Made for makers who <em>mean it</em></h2>
  <p class="social-sub">Writers, designers, and developers who track their creative vitals with OPAL.</p>
  <div class="testimonials">
    <div class="testi">
      <div class="testi-quote">"My 12-day streak of morning writing sessions has produced more usable work than the previous three months combined. OPAL made me see why."</div>
      <div class="testi-author"><div class="testi-avatar">📝</div><div><div class="testi-name">Mira Chen</div><div class="testi-role">Essayist & copywriter</div></div></div>
    </div>
    <div class="testi">
      <div class="testi-quote">"The insight that I peak between 9–11am completely changed how I schedule client work. I now protect that window religiously."</div>
      <div class="testi-author"><div class="testi-avatar">🎨</div><div><div class="testi-name">James Okafor</div><div class="testi-role">Brand designer, freelance</div></div></div>
    </div>
    <div class="testi">
      <div class="testi-quote">"Project health indicators caught that I was at risk on The Cartographer two weeks before the deadline. I made it."</div>
      <div class="testi-author"><div class="testi-avatar">✨</div><div><div class="testi-name">Lena Vasquez</div><div class="testi-role">Novelist & UX writer</div></div></div>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta-footer">
  <h2>Know your creative health.</h2>
  <p>Start tracking what matters — output, rituals, and your peak creative window.</p>
  <a href="https://ram.zenbin.org/opal-vitals-mock" class="btn-white">Explore the interactive mock →</a>
</div>

<footer>
  <div class="footer-brand">OPAL</div>
  <div class="footer-credit">Design by RAM · Inspired by Superpower (godly.website) · ${new Date().getFullYear()}</div>
</footer>

</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OPAL — Design Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#F8F4EE;font-family:Inter,sans-serif;min-height:100vh}
.viewer-nav{position:sticky;top:0;z-index:10;background:rgba(248,244,238,0.9);backdrop-filter:blur(12px);border-bottom:1px solid rgba(28,23,20,0.09);padding:0 32px;height:52px;display:flex;align-items:center;justify-content:space-between}
.viewer-brand{font-size:14px;font-weight:800;color:#1C1714;letter-spacing:0.06em}
.viewer-brand span{color:#C85A0A}
.viewer-back{font-size:13px;color:#7A6F68;display:flex;align-items:center;gap:6px}
.viewer-back a{color:#C85A0A;font-weight:600}
.screens-wrap{padding:40px 32px;display:flex;flex-wrap:wrap;gap:32px;justify-content:center}
.screen-card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(28,23,20,0.09);border:1px solid rgba(28,23,20,0.07)}
.screen-label{padding:12px 20px;font-size:12px;font-weight:600;color:#7A6F68;background:#F2EDE4;border-bottom:1px solid rgba(28,23,20,0.07)}
canvas{display:block}
</style>
</head>
<body>
<div class="viewer-nav">
  <div class="viewer-brand">O<span>P</span>AL — Design Viewer</div>
  <div class="viewer-back"><a href="https://ram.zenbin.org/opal-vitals">← Hero page</a> · <a href="https://ram.zenbin.org/opal-vitals-mock">Interactive mock</a></div>
</div>
<div class="screens-wrap" id="screens"></div>
<script>
${injection.replace('<script>','').replace('<\/script>','')}
function renderPen(pen) {
  const wrap = document.getElementById('screens');
  (pen.screens || []).forEach(screen => {
    const card = document.createElement('div');
    card.className = 'screen-card';
    const lbl = document.createElement('div');
    lbl.className = 'screen-label';
    lbl.textContent = screen.name || screen.id;
    card.appendChild(lbl);
    const canvas = document.createElement('canvas');
    const scale = 1.2;
    canvas.width = (pen.width || 390) * scale;
    canvas.height = (pen.height || 844) * scale;
    canvas.style.width = (pen.width || 390) + 'px';
    canvas.style.height = (pen.height || 844) + 'px';
    card.appendChild(canvas);
    wrap.appendChild(card);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    // Background
    ctx.fillStyle = pen.background || '#F8F4EE';
    ctx.fillRect(0, 0, pen.width, pen.height);
    const offsetX = (screen.elements && screen.elements.length > 0) ? (screen.elements[0].x || 0) * -1 : 0;
    (screen.elements || []).forEach(el => {
      const ex = (el.x || 0) + offsetX;
      const ey = el.y || 0;
      ctx.save();
      if (el.type === 'rect') {
        if (el.cornerRadius > 0) {
          const r = Math.min(el.cornerRadius, el.width/2, el.height/2);
          ctx.beginPath();
          ctx.moveTo(ex+r, ey);
          ctx.lineTo(ex+el.width-r, ey);
          ctx.arcTo(ex+el.width, ey, ex+el.width, ey+r, r);
          ctx.lineTo(ex+el.width, ey+el.height-r);
          ctx.arcTo(ex+el.width, ey+el.height, ex+el.width-r, ey+el.height, r);
          ctx.lineTo(ex+r, ey+el.height);
          ctx.arcTo(ex, ey+el.height, ex, ey+el.height-r, r);
          ctx.lineTo(ex, ey+r);
          ctx.arcTo(ex, ey, ex+r, ey, r);
          ctx.closePath();
          if (el.fill && el.fill !== 'none' && el.fill !== 'transparent') { ctx.fillStyle=el.fill; ctx.fill(); }
          if (el.stroke && el.stroke !== 'none') { ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth||1; ctx.stroke(); }
        } else {
          if (el.fill && el.fill !== 'none' && el.fill !== 'transparent') { ctx.fillStyle=el.fill; ctx.fillRect(ex,ey,el.width,el.height); }
          if (el.stroke && el.stroke !== 'none') { ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth||1; ctx.strokeRect(ex,ey,el.width,el.height); }
        }
      } else if (el.type === 'ellipse') {
        const cx = ex+el.width/2, cy = ey+el.height/2;
        ctx.beginPath();
        ctx.ellipse(cx,cy,el.width/2,el.height/2,0,0,Math.PI*2);
        if (el.fill && el.fill !== 'none') { ctx.fillStyle=el.fill; ctx.fill(); }
        if (el.stroke && el.stroke !== 'none') { ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth||1; ctx.stroke(); }
      } else if (el.type === 'line') {
        const lx1 = (el.x1||0)+offsetX, ly1 = el.y1||0;
        const lx2 = (el.x2||0)+offsetX, ly2 = el.y2||0;
        ctx.beginPath(); ctx.moveTo(lx1,ly1); ctx.lineTo(lx2,ly2);
        ctx.strokeStyle=el.stroke||'#ccc'; ctx.lineWidth=el.strokeWidth||0.5; ctx.stroke();
      } else if (el.type === 'text') {
        const fw = el.fontWeight==='bold'?'bold':el.fontWeight==='semibold'?'600':'400';
        const fs = el.fontStyle==='italic'?'italic ':'';
        ctx.font = fs+fw+' '+(el.fontSize||12)+'px Inter,sans-serif';
        ctx.fillStyle = el.fill || '#1C1714';
        ctx.textBaseline = 'top';
        if (el.textAlign === 'center' && el.width > 0) {
          ctx.textAlign = 'center';
          ctx.fillText(el.content||'', ex + el.width/2, ey);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(el.content||'', ex, ey);
        }
      }
      ctx.restore();
    });
  });
}
if (window.EMBEDDED_PEN) {
  const pen = typeof window.EMBEDDED_PEN === 'string' ? JSON.parse(window.EMBEDDED_PEN) : window.EMBEDDED_PEN;
  renderPen(pen);
}
<\/script>
</body>
</html>`;
  return viewerHtml;
}

async function main() {
  const penJson = fs.readFileSync(path.join(__dirname,'opal.pen'),'utf8');

  console.log('Publishing hero page...');
  await publish(SLUG, heroHtml);

  console.log('Publishing viewer...');
  const viewerHtml = buildViewerHtml(penJson);
  await publish(SLUG+'-viewer', viewerHtml);

  console.log('\nURLs:');
  console.log('  Hero:   https://ram.zenbin.org/'+SLUG);
  console.log('  Viewer: https://ram.zenbin.org/'+SLUG+'-viewer');
}

main().catch(console.error);
