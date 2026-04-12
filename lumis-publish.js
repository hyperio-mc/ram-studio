#!/usr/bin/env node
// LUMIS publish — hero page + viewer
const fs   = require('fs');
const http = require('http');
const https= require('https');

const SLUG     = 'lumis';
const APP_NAME = 'LUMIS';
const TAGLINE  = 'See through your finances';
const SUBDOMAIN= 'ram';

// ── helpers ──────────────────────────────────────────────────────────────────
function zenPost(pageId, html, title) {
  const body = JSON.stringify({ html, title: title || pageId });
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${pageId}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'X-Subdomain':    SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── palette ──────────────────────────────────────────────────────────────────
const pal = {
  bg:          '#F3F0EC',
  bgGrad1:     '#EDE9FE',
  bgGrad2:     '#FFF0E8',
  bgGrad3:     '#E0F2FE',
  surface:     'rgba(255,255,255,0.62)',
  surfaceS:    'rgba(255,255,255,0.82)',
  glass:       'rgba(255,255,255,0.52)',
  glassBorder: 'rgba(255,255,255,0.80)',
  text:        '#1C1917',
  textMuted:   'rgba(28,25,23,0.42)',
  accent:      '#6B4FE9',
  accentSoft:  'rgba(107,79,233,0.10)',
  accentMid:   'rgba(107,79,233,0.22)',
  accent2:     '#F97316',
  green:       '#059669',
  greenSoft:   'rgba(5,150,105,0.10)',
  red:         '#DC2626',
  border:      'rgba(28,25,23,0.08)',
};

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${pal.bg};
  --bg1:${pal.bgGrad1};
  --bg2:${pal.bgGrad2};
  --bg3:${pal.bgGrad3};
  --surface:${pal.surface};
  --surfaceS:${pal.surfaceS};
  --glass:${pal.glass};
  --gb:${pal.glassBorder};
  --text:${pal.text};
  --muted:${pal.textMuted};
  --accent:${pal.accent};
  --asoft:${pal.accentSoft};
  --amid:${pal.accentMid};
  --a2:${pal.accent2};
  --green:${pal.green};
  --greenS:${pal.greenSoft};
  --border:${pal.border};
}
html{scroll-behavior:smooth}
body{
  font-family:'Inter',system-ui,sans-serif;
  background:var(--bg);
  color:var(--text);
  min-height:100vh;
  overflow-x:hidden;
}

/* ── gradient orbs ── */
.orbs{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.55}
.orb1{width:500px;height:500px;background:var(--bg1);top:-120px;left:-80px}
.orb2{width:420px;height:420px;background:var(--bg2);top:30%;right:-100px}
.orb3{width:350px;height:350px;background:var(--bg3);bottom:-80px;left:20%}

/* ── glass mixin ── */
.glass{
  background:var(--glass);
  backdrop-filter:blur(16px) saturate(1.4);
  -webkit-backdrop-filter:blur(16px) saturate(1.4);
  border:1px solid var(--gb);
  border-radius:20px;
}
.glass-strong{
  background:var(--surfaceS);
  backdrop-filter:blur(24px) saturate(1.6);
  -webkit-backdrop-filter:blur(24px) saturate(1.6);
  border:1px solid var(--gb);
  border-radius:20px;
}

/* ── layout ── */
.wrap{position:relative;z-index:1;max-width:1120px;margin:0 auto;padding:0 24px}

/* ── NAV ── */
nav{
  position:sticky;top:0;z-index:100;
  background:rgba(243,240,236,.72);
  backdrop-filter:blur(20px) saturate(1.5);
  -webkit-backdrop-filter:blur(20px) saturate(1.5);
  border-bottom:1px solid var(--gb);
}
.nav-inner{
  max-width:1120px;margin:0 auto;padding:0 24px;
  display:flex;align-items:center;justify-content:space-between;height:60px
}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.nav-logo-mark{
  width:34px;height:34px;border-radius:10px;
  background:linear-gradient(135deg,var(--accent),var(--a2));
  display:flex;align-items:center;justify-content:center;
  font-size:16px;color:#fff;font-weight:800;letter-spacing:-.5px;
}
.nav-logo-text{font-size:17px;font-weight:700;color:var(--text);letter-spacing:-.3px}
.nav-links{display:flex;gap:28px}
.nav-links a{font-size:13px;font-weight:500;color:var(--muted);text-decoration:none;transition:.2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 18px;border-radius:100px;
  background:var(--accent);color:#fff;
  font-size:13px;font-weight:600;text-decoration:none;
  transition:.2s;
}
.nav-cta:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(107,79,233,.35)}

/* ── HERO ── */
.hero{padding:100px 0 80px;text-align:center}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:6px 16px;border-radius:100px;
  background:var(--asoft);border:1px solid var(--amid);
  font-size:11px;font-weight:600;color:var(--accent);letter-spacing:.04em;
  text-transform:uppercase;margin-bottom:28px;
}
.hero-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)}}
h1{
  font-size:clamp(48px,6vw,80px);font-weight:800;letter-spacing:-.03em;
  line-height:1.08;margin-bottom:20px;
  background:linear-gradient(135deg,var(--text) 40%,var(--accent));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.hero-sub{
  font-size:clamp(17px,2vw,22px);color:var(--muted);
  max-width:540px;margin:0 auto 40px;line-height:1.5;font-weight:400;
}
.hero-ctas{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap}
.btn-primary{
  display:inline-flex;align-items:center;gap:8px;
  padding:14px 28px;border-radius:14px;
  background:var(--accent);color:#fff;
  font-size:15px;font-weight:600;text-decoration:none;
  transition:.2s;box-shadow:0 4px 20px rgba(107,79,233,.25);
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(107,79,233,.35)}
.btn-glass{
  display:inline-flex;align-items:center;gap:8px;
  padding:14px 24px;border-radius:14px;
  background:var(--glass);backdrop-filter:blur(12px);border:1px solid var(--gb);
  color:var(--text);font-size:15px;font-weight:600;text-decoration:none;
  transition:.2s;
}
.btn-glass:hover{transform:translateY(-2px);background:var(--surfaceS)}

/* ── MOCKUP ── */
.mockup-wrap{
  margin:60px auto 0;max-width:800px;
  position:relative;
}
.mockup-glow{
  position:absolute;inset:-40px;
  background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(107,79,233,.18) 0%,transparent 70%);
  pointer-events:none;
}
.phone-frame{
  width:300px;margin:0 auto;
  background:var(--glass);backdrop-filter:blur(20px);
  border:1px solid var(--gb);border-radius:40px;
  padding:16px;box-shadow:0 30px 80px rgba(28,25,23,.12),0 0 0 1px rgba(255,255,255,.6) inset;
  position:relative;
}
.phone-notch{
  width:90px;height:24px;background:rgba(28,25,23,.06);
  border-radius:100px;margin:0 auto 16px;
}
.phone-screen{border-radius:28px;overflow:hidden;background:var(--bg);min-height:500px;padding:16px}
.phone-screen-inner{display:flex;flex-direction:column;gap:12px}

/* ── screen preview ── */
.ps-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.ps-topbar .logo{font-size:15px;font-weight:700;letter-spacing:-.3px;color:var(--text)}
.ps-topbar .sub{font-size:10px;color:var(--muted)}
.ps-hero-card{
  border-radius:20px;padding:18px;
  background:linear-gradient(135deg,rgba(237,233,254,.8) 0%,rgba(224,242,254,.8) 100%);
  backdrop-filter:blur(12px);border:1px solid var(--gb);
}
.ps-hero-eyebrow{font-size:9px;font-weight:600;letter-spacing:.06em;color:var(--muted);text-transform:uppercase;margin-bottom:4px}
.ps-hero-value{font-size:26px;font-weight:800;letter-spacing:-.02em;color:var(--text);margin-bottom:6px}
.ps-hero-delta{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;color:var(--green);background:var(--greenS);padding:3px 8px;border-radius:100px}
.ps-metric-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ps-metric-chip{
  border-radius:14px;padding:10px 8px;text-align:center;
  background:var(--glass);backdrop-filter:blur(12px);border:1px solid var(--gb);
}
.ps-mc-val{font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px}
.ps-mc-lbl{font-size:9px;color:var(--muted)}
.ps-donut-card{
  border-radius:16px;padding:14px;
  background:var(--glass);backdrop-filter:blur(12px);border:1px solid var(--gb);
}
.ps-donut-title{font-size:10px;font-weight:600;color:var(--text);margin-bottom:10px}
.ps-donut-inner{display:flex;gap:10px;align-items:center}
.ps-donut-ring{width:64px;height:64px;flex-shrink:0}
.ps-donut-legend{flex:1;display:flex;flex-direction:column;gap:4px}
.ps-dl-item{display:flex;align-items:center;gap:5px;font-size:9px;color:var(--muted)}
.ps-dl-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.ps-insight{
  border-radius:14px;padding:10px 12px;
  background:var(--asoft);border:1px solid var(--amid);
  font-size:10px;color:var(--accent);line-height:1.4;
}
.ps-bottom-nav{
  display:flex;justify-content:space-around;
  padding:10px 0 4px;margin-top:4px;
  background:var(--glass);backdrop-filter:blur(12px);border:1px solid var(--gb);border-radius:20px;
}
.ps-nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer}
.ps-nav-dot{width:16px;height:16px;border-radius:50%;background:var(--border)}
.ps-nav-dot.active{background:var(--accent)}
.ps-nav-lbl{font-size:8px;color:var(--muted)}
.ps-nav-lbl.active{color:var(--accent);font-weight:600}

/* ── FLOATING SIDE CARDS ── */
.float-cards{
  position:absolute;top:50%;transform:translateY(-50%);
  display:flex;flex-direction:column;gap:14px;
}
.float-left{left:-200px}
.float-right{right:-200px}
.float-card{
  width:170px;padding:14px;
  background:var(--glass);backdrop-filter:blur(16px);
  border:1px solid var(--gb);border-radius:16px;
  box-shadow:0 8px 30px rgba(28,25,23,.08);
}
.fc-label{font-size:9px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.fc-value{font-size:20px;font-weight:700;color:var(--text);margin-bottom:4px}
.fc-delta{font-size:10px;font-weight:600;padding:2px 7px;border-radius:100px;display:inline-flex;align-items:center;gap:3px}
.fc-delta.up{color:var(--green);background:var(--greenS)}
.fc-delta.acc{color:var(--accent);background:var(--asoft)}
.fc-bar{height:4px;background:var(--border);border-radius:100px;margin-top:10px;overflow:hidden}
.fc-bar-fill{height:100%;border-radius:100px;background:var(--accent)}

/* ── STATS STRIP ── */
.stats-strip{padding:60px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:40px;text-align:center}
.stat-val{font-size:clamp(32px,4vw,48px);font-weight:800;letter-spacing:-.03em;color:var(--text)}
.stat-lbl{font-size:13px;color:var(--muted);margin-top:4px}

/* ── FEATURES ── */
.features{padding:80px 0}
.features-title{text-align:center;margin-bottom:60px}
.section-eyebrow{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.section-h2{font-size:clamp(30px,4vw,44px);font-weight:800;letter-spacing:-.025em;color:var(--text);line-height:1.12}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feat-card{padding:28px;border-radius:20px;position:relative;overflow:hidden}
.feat-card::before{
  content:'';position:absolute;inset:0;border-radius:20px;
  background:var(--glass);backdrop-filter:blur(14px);
  border:1px solid var(--gb);z-index:0;
}
.feat-card-inner{position:relative;z-index:1}
.feat-icon{
  width:44px;height:44px;border-radius:12px;margin-bottom:16px;
  background:var(--asoft);display:flex;align-items:center;justify-content:center;
  font-size:22px;
}
.feat-icon.a2{background:rgba(249,115,22,.10)}
.feat-icon.green{background:var(--greenS)}
.feat-h3{font-size:17px;font-weight:700;color:var(--text);margin-bottom:8px;letter-spacing:-.01em}
.feat-p{font-size:13px;color:var(--muted);line-height:1.55}

/* ── SCREENS PREVIEW STRIP ── */
.screens-section{padding:80px 0}
.screens-scroll{
  display:flex;gap:16px;overflow-x:auto;padding:20px 0 24px;
  scroll-snap-type:x mandatory;
  scrollbar-width:none;
}
.screens-scroll::-webkit-scrollbar{display:none}
.screen-pill{
  flex-shrink:0;width:200px;scroll-snap-align:start;
  border-radius:20px;overflow:hidden;
  background:var(--glass);backdrop-filter:blur(14px);border:1px solid var(--gb);
  box-shadow:0 8px 30px rgba(28,25,23,.08);
}
.sp-header{padding:14px 14px 10px;display:flex;align-items:center;gap:8px}
.sp-dot{width:8px;height:8px;border-radius:50%}
.sp-label{font-size:10px;font-weight:700;color:var(--text);letter-spacing:.02em;text-transform:uppercase}
.sp-body{padding:0 14px 14px;display:flex;flex-direction:column;gap:8px}
.sp-line{height:6px;border-radius:100px;background:var(--border)}
.sp-line.accent{background:linear-gradient(90deg,var(--accent),var(--a2))}
.sp-line.short{width:60%}
.sp-line.med{width:80%}
.sp-line.full{width:100%}
.sp-block{height:52px;border-radius:12px;background:var(--asoft)}
.sp-block.green{background:var(--greenS)}
.sp-block.a2{background:rgba(249,115,22,.10)}
.sp-mini-row{display:flex;gap:6px}
.sp-mini{flex:1;height:36px;border-radius:10px;background:var(--glass);border:1px solid var(--gb)}

/* ── FOOTER ── */
footer{padding:48px 0;border-top:1px solid var(--border);text-align:center}
.footer-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:gap-16px}
.footer-brand{font-size:14px;font-weight:700;color:var(--text)}
.footer-credit{font-size:12px;color:var(--muted)}
.footer-links{display:flex;gap:20px}
.footer-links a{font-size:12px;color:var(--muted);text-decoration:none}
.footer-links a:hover{color:var(--text)}

@media(max-width:900px){
  .float-cards{display:none}
  .features-grid{grid-template-columns:1fr}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .footer-inner{flex-direction:column;gap:16px;text-align:center}
}
</style>
</head>
<body>

<div class="orbs">
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>
</div>

<!-- NAV -->
<nav>
  <div class="nav-inner">
    <a class="nav-logo" href="#">
      <div class="nav-logo-mark">L</div>
      <span class="nav-logo-text">LUMIS</span>
    </a>
    <div class="nav-links">
      <a href="#">Features</a>
      <a href="#">Pricing</a>
      <a href="#">Blog</a>
    </div>
    <a class="nav-cta" href="#">Get early access →</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="wrap">
    <div class="hero-badge">
      <span class="hero-badge-dot"></span>
      Liquid glass · personal finance
    </div>
    <h1>See through<br/>your finances</h1>
    <p class="hero-sub">
      LUMIS uses translucent intelligence to surface what matters—
      net worth, spending clarity, and savings momentum—all at a glance.
    </p>
    <div class="hero-ctas">
      <a class="btn-primary" href="https://ram.zenbin.org/lumis-mock">
        ☀ Open interactive mock
      </a>
      <a class="btn-glass" href="https://ram.zenbin.org/lumis-viewer">
        ◈ View design system
      </a>
    </div>

    <!-- Phone mockup -->
    <div class="mockup-wrap">
      <div class="mockup-glow"></div>

      <!-- Left float cards -->
      <div class="float-cards float-left">
        <div class="float-card">
          <div class="fc-label">Net Worth</div>
          <div class="fc-value">$284,910</div>
          <div class="fc-delta up">↑ +$4,230 this month</div>
          <div class="fc-bar"><div class="fc-bar-fill" style="width:76%"></div></div>
        </div>
        <div class="float-card">
          <div class="fc-label">Monthly Saved</div>
          <div class="fc-value">$1,860</div>
          <div class="fc-delta acc">+22% vs avg</div>
        </div>
      </div>

      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="phone-screen-inner">
            <!-- topbar -->
            <div class="ps-topbar">
              <div>
                <div class="logo">LUMIS</div>
                <div class="sub">April 2026</div>
              </div>
              <div style="font-size:18px">🔔</div>
            </div>
            <!-- hero card -->
            <div class="ps-hero-card">
              <div class="ps-hero-eyebrow">Net Worth</div>
              <div class="ps-hero-value">$284,910</div>
              <span class="ps-hero-delta">↑ +$4,230 · +1.5%</span>
            </div>
            <!-- metrics row -->
            <div class="ps-metric-row">
              <div class="ps-metric-chip">
                <div class="ps-mc-val" style="color:#059669">$8.4K</div>
                <div class="ps-mc-lbl">Income</div>
              </div>
              <div class="ps-metric-chip">
                <div class="ps-mc-val" style="color:#6B4FE9">$3.2K</div>
                <div class="ps-mc-lbl">Spend</div>
              </div>
              <div class="ps-metric-chip">
                <div class="ps-mc-val" style="color:#F97316">$1.9K</div>
                <div class="ps-mc-lbl">Saved</div>
              </div>
            </div>
            <!-- donut -->
            <div class="ps-donut-card">
              <div class="ps-donut-title">Spending breakdown · March</div>
              <div class="ps-donut-inner">
                <svg class="ps-donut-ring" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#EDE9FE" stroke-width="10"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#6B4FE9" stroke-width="10"
                    stroke-dasharray="57.2 163" stroke-dashoffset="0" transform="rotate(-90 32 32)"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#F97316" stroke-width="10"
                    stroke-dasharray="35.9 163" stroke-dashoffset="-57.2" transform="rotate(-90 32 32)"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#059669" stroke-width="10"
                    stroke-dasharray="22.8 163" stroke-dashoffset="-93.1" transform="rotate(-90 32 32)"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#E879F9" stroke-width="10"
                    stroke-dasharray="19.6 163" stroke-dashoffset="-115.9" transform="rotate(-90 32 32)"/>
                </svg>
                <div class="ps-donut-legend">
                  <div class="ps-dl-item"><div class="ps-dl-dot" style="background:#6B4FE9"></div>Housing 35%</div>
                  <div class="ps-dl-item"><div class="ps-dl-dot" style="background:#F97316"></div>Food 22%</div>
                  <div class="ps-dl-item"><div class="ps-dl-dot" style="background:#059669"></div>Transport 14%</div>
                  <div class="ps-dl-item"><div class="ps-dl-dot" style="background:#E879F9"></div>Health 12%</div>
                </div>
              </div>
            </div>
            <!-- insight -->
            <div class="ps-insight">
              ⚡ You spent 18% less on food than last month. On track to hit your $500 savings goal.
            </div>
            <!-- bottom nav -->
            <div class="ps-bottom-nav">
              ${['🏠','🗂','📋','📊','👁'].map((ic,i)=>
                `<div class="ps-nav-item">
                  <div class="ps-nav-dot${i===0?' active':''}"></div>
                  <div class="ps-nav-lbl${i===0?' active':''}">${ic}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Right float cards -->
      <div class="float-cards float-right">
        <div class="float-card">
          <div class="fc-label">Japan Trip Goal</div>
          <div class="fc-value">56%</div>
          <div class="fc-delta acc">$2,800 / $5,000</div>
          <div class="fc-bar"><div class="fc-bar-fill" style="width:56%"></div></div>
        </div>
        <div class="float-card">
          <div class="fc-label">Investments</div>
          <div class="fc-value">$162K</div>
          <div class="fc-delta up">↑ +2.4% this week</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS STRIP -->
<section class="stats-strip">
  <div class="wrap">
    <div class="stats-grid">
      <div><div class="stat-val">6</div><div class="stat-lbl">Accounts in one view</div></div>
      <div><div class="stat-val">∞</div><div class="stat-lbl">Transaction history</div></div>
      <div><div class="stat-val">AI</div><div class="stat-lbl">Smart spending insights</div></div>
      <div><div class="stat-val">0ms</div><div class="stat-lbl">Balance refresh latency</div></div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features">
  <div class="wrap">
    <div class="features-title">
      <div class="section-eyebrow">What LUMIS does</div>
      <div class="section-h2">Glass-clear clarity,<br/>zero complexity</div>
    </div>
    <div class="features-grid">
      <div class="feat-card" style="background:linear-gradient(135deg,rgba(237,233,254,.5) 0%,rgba(224,242,254,.3) 100%)">
        <div class="feat-card-inner">
          <div class="feat-icon">💎</div>
          <div class="feat-h3">Liquid glass overview</div>
          <p class="feat-p">Frosted translucent cards float over soft gradient fields. Net worth, spending split, and savings momentum — all at a single glance.</p>
        </div>
      </div>
      <div class="feat-card" style="background:linear-gradient(135deg,rgba(255,240,232,.6) 0%,rgba(237,233,254,.3) 100%)">
        <div class="feat-card-inner">
          <div class="feat-icon a2">🏦</div>
          <div class="feat-h3">All accounts, one place</div>
          <p class="feat-p">Checking, savings, brokerage, crypto, and credit — unified in glass list cards with live balance sync and status indicators.</p>
        </div>
      </div>
      <div class="feat-card" style="background:linear-gradient(135deg,rgba(224,242,254,.5) 0%,rgba(237,233,254,.3) 100%)">
        <div class="feat-card-inner">
          <div class="feat-icon green">⚡</div>
          <div class="feat-h3">AI-powered insights</div>
          <p class="feat-p">Lumis surfaces unusual patterns, unused subscriptions, and savings opportunities — served as clear, actionable glass cards.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SCREENS STRIP -->
<section class="screens-section">
  <div class="wrap">
    <div class="section-eyebrow" style="margin-bottom:12px">5 screens</div>
    <div class="section-h2" style="margin-bottom:28px">Every view,<br/>designed with purpose</div>
  </div>
  <div style="padding:0 24px">
    <div class="screens-scroll">
      ${[
        { label:'Overview',     dot:'#6B4FE9', bg:'#EDE9FE' },
        { label:'Accounts',     dot:'#059669', bg:'#E0F2FE' },
        { label:'Activity',     dot:'#F97316', bg:'#FFF0E8' },
        { label:'Budget',       dot:'#E879F9', bg:'#EDE9FE' },
        { label:'Insights',     dot:'#6B4FE9', bg:'#E0F2FE' }
      ].map(s => `
        <div class="screen-pill">
          <div class="sp-header">
            <div class="sp-dot" style="background:${s.dot}"></div>
            <div class="sp-label">${s.label}</div>
          </div>
          <div class="sp-body" style="background:linear-gradient(180deg,${s.bg}55 0%,transparent 100%)">
            <div class="sp-block" style="background:${s.bg}BB"></div>
            <div class="sp-line accent full"></div>
            <div class="sp-line short"></div>
            <div class="sp-mini-row">
              <div class="sp-mini"></div>
              <div class="sp-mini"></div>
              <div class="sp-mini"></div>
            </div>
            <div class="sp-line med"></div>
          </div>
        </div>`).join('')}
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="wrap">
    <div class="footer-inner">
      <div class="footer-brand">LUMIS — See through your finances</div>
      <div class="footer-links">
        <a href="https://ram.zenbin.org/lumis-viewer">Design viewer</a>
        <a href="https://ram.zenbin.org/lumis-mock">Interactive mock</a>
      </div>
      <div class="footer-credit">RAM Design Heartbeat · April 2026</div>
    </div>
  </div>
</footer>

</body>
</html>`;

// ── VIEWER PAGE ───────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('lumis.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── PUBLISH ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page…');
  const heroRes = await zenPost(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${heroRes.status} ${heroRes.status===200?'✓':heroRes.body.slice(0,120)} → https://${SUBDOMAIN}.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const viewerRes = await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} Viewer`);
  console.log(`  Viewer: ${viewerRes.status} ${viewerRes.status===200?'✓':viewerRes.body.slice(0,120)} → https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);
})();
