'use strict';
// strobe-publish.js — Full Design Discovery pipeline for STROBE
// STROBE — Live venue event analytics
// Theme: DARK · Slug: strobe

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'strobe';
const APP_NAME  = 'STROBE';
const TAGLINE   = 'Live venue analytics. Every show, every dollar, live.';
const ARCHETYPE = 'event-analytics';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT =
  'Live venue event analytics dashboard — dark, energetic. Inspired by Saaspo "gamified UI depth" trend ' +
  '(layered panels, glow effects, HUD energy) + Dark Mode Design featured sites mixed typography ' +
  '(editorial serif italic for hero numbers, tight geometric sans for labels).';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'strobe.pen'), 'utf8');

// ── utils ────────────────────────────────────────────────────────────────────
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

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:         '#070911',
  bgDeep:     '#040507',
  surface:    '#0E1322',
  surfaceAlt: '#141929',
  surfaceHi:  '#1A2135',
  border:     'rgba(255,51,102,0.14)',
  borderSub:  'rgba(255,255,255,0.07)',
  text:       '#EEF0FF',
  textMuted:  'rgba(238,240,255,0.42)',
  accent:     '#FF3366',
  accentDim:  'rgba(255,51,102,0.14)',
  purple:     '#8B5CF6',
  purpleDim:  'rgba(139,92,246,0.14)',
  teal:       '#2DD4BF',
  tealDim:    'rgba(45,212,191,0.12)',
  amber:      '#F59E0B',
  green:      '#10B981',
};

// ── HERO PAGE ────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="STROBE — live venue event analytics. Track capacity, revenue, crowd intel and setlists in real time.">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${P.bg};--bgg:${P.bgDeep};--sf:${P.surface};--sfa:${P.surfaceAlt};--sfh:${P.surfaceHi};
  --tx:${P.text};--mt:${P.textMuted};--ac:${P.accent};--acd:${P.accentDim};
  --pu:${P.purple};--tl:${P.teal};--am:${P.amber};--gn:${P.green};
  --bd:${P.border};--bds:${P.borderSub};
}
body{background:var(--bgg);color:var(--tx);font-family:'Inter',system-ui,sans-serif;min-height:100vh;line-height:1.4}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;background:rgba(4,5,7,0.88);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--bds)}
.nav-logo{font-size:13px;font-weight:900;letter-spacing:4px;color:var(--ac);text-transform:uppercase}
.nav-sub{font-size:9px;font-weight:700;letter-spacing:3px;color:var(--pu);text-transform:uppercase;margin-left:8px;opacity:.9}
.nav-links{display:flex;gap:28px}
.nav-links a{font-size:12px;color:var(--mt);text-decoration:none;letter-spacing:1px;transition:color .2s}
.nav-links a:hover{color:var(--tx)}
.nav-cta{background:var(--ac);color:#fff;border:none;padding:8px 20px;border-radius:8px;
  font-size:12px;font-weight:700;letter-spacing:1px;cursor:pointer;text-transform:uppercase;
  text-decoration:none;transition:opacity .2s}
.nav-cta:hover{opacity:.85}

/* HERO */
.hero{min-height:100vh;display:flex;align-items:center;padding:100px 40px 80px;
  background:radial-gradient(ellipse 800px 600px at 60% 40%, rgba(255,51,102,0.07) 0%, transparent 70%),
             radial-gradient(ellipse 600px 400px at 20% 80%, rgba(139,92,246,0.05) 0%, transparent 70%),
             var(--bgg)}
.hero-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 380px;gap:80px;align-items:center}
.hero-eyebrow{display:flex;align-items:center;gap:12px;margin-bottom:28px}
.hero-live-badge{background:var(--ac);color:#fff;font-size:9px;font-weight:800;letter-spacing:2px;
  padding:4px 12px;border-radius:20px;text-transform:uppercase;display:flex;align-items:center;gap:6px}
.hero-live-dot{width:6px;height:6px;border-radius:50%;background:#fff;animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.hero-label{font-size:11px;font-weight:600;color:var(--mt);letter-spacing:2px;text-transform:uppercase}
h1{font-size:clamp(48px,7vw,80px);font-weight:900;line-height:1;letter-spacing:-2px;margin-bottom:12px}
h1 em{font-style:italic;color:var(--ac)}
.hero-tagline{font-size:18px;font-weight:400;color:var(--mt);line-height:1.6;max-width:480px;margin-bottom:40px}
.hero-tagline strong{color:var(--tx);font-weight:600}
.hero-ctas{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:56px}
.btn-primary{background:var(--ac);color:#fff;padding:14px 28px;border-radius:10px;
  font-size:13px;font-weight:700;letter-spacing:1px;text-decoration:none;text-transform:uppercase;
  transition:opacity .2s;box-shadow:0 0 40px rgba(255,51,102,0.3)}
.btn-primary:hover{opacity:.85}
.btn-secondary{background:var(--sf);color:var(--tx);padding:14px 28px;border-radius:10px;
  font-size:13px;font-weight:700;letter-spacing:1px;text-decoration:none;text-transform:uppercase;
  border:1px solid var(--bds);transition:border-color .2s}
.btn-secondary:hover{border-color:var(--ac)}
.hero-stats{display:flex;gap:32px}
.hero-stat{}
.hero-stat .val{font-size:26px;font-weight:900;color:var(--tx);font-style:italic}
.hero-stat .lbl{font-size:10px;font-weight:600;color:var(--mt);letter-spacing:2px;text-transform:uppercase;margin-top:2px}

/* PHONE MOCKUP */
.phone-wrap{position:relative;display:flex;justify-content:center}
.phone-glow{position:absolute;width:300px;height:400px;
  background:radial-gradient(ellipse, rgba(255,51,102,0.2) 0%, transparent 70%);
  top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.phone-frame{width:300px;background:var(--sf);border-radius:40px;
  border:2px solid rgba(255,51,102,0.2);overflow:hidden;position:relative;z-index:1;
  box-shadow:0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04)}
.phone-notch{width:120px;height:28px;background:var(--bg);border-radius:0 0 20px 20px;
  margin:0 auto 0;position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:8px}
.notch-cam{width:10px;height:10px;border-radius:50%;background:#111}
.phone-screen{background:var(--bg);padding:0}
.phone-row{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;
  border-bottom:1px solid var(--bds)}
.prow-label{font-size:8px;font-weight:700;letter-spacing:2px;color:var(--mt);text-transform:uppercase}
.prow-val{font-size:16px;font-weight:900;color:var(--tx)}
.prow-val.accent{color:var(--ac)}
.prow-val.purple{color:var(--pu)}
.prow-val.teal{color:var(--tl)}
.phone-hero-card{padding:16px;background:var(--sf);margin:10px;border-radius:14px;
  border-left:3px solid var(--ac);position:relative}
.phc-live{display:inline-flex;align-items:center;gap:5px;font-size:8px;font-weight:800;
  color:var(--ac);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
.phc-dot{width:5px;height:5px;border-radius:50%;background:var(--ac);animation:pulse 1.4s infinite}
.phc-title{font-size:13px;font-weight:900;color:var(--tx);letter-spacing:.5px;text-transform:uppercase;margin-bottom:2px}
.phc-sub{font-size:10px;color:var(--mt)}
.cap-bar-wrap{margin-top:8px}
.cap-bar-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.cap-label{font-size:8px;font-weight:700;letter-spacing:1.5px;color:var(--mt);text-transform:uppercase}
.cap-pct{font-size:11px;font-weight:800;color:var(--ac)}
.cap-track{height:5px;background:var(--sfh);border-radius:3px;overflow:hidden}
.cap-fill{height:100%;background:var(--ac);border-radius:3px;width:87%}
.phone-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:6px 10px 10px}
.pgrid-cell{background:var(--sfa);border-radius:10px;padding:8px 8px;text-align:left}
.pgc-label{font-size:7px;font-weight:700;letter-spacing:1.5px;color:var(--mt);text-transform:uppercase;margin-bottom:3px}
.pgc-val{font-size:14px;font-weight:900}
.pgc-val.accent{color:var(--ac)}
.pgc-val.purple{color:var(--pu)}
.pgc-val.teal{color:var(--tl)}
.pgc-sub{font-size:7.5px;color:var(--mt)}
.phone-tab{display:flex;background:var(--sf);border-top:1px solid var(--bds)}
.ptab-item{flex:1;padding:8px 4px 10px;text-align:center;font-size:7px;font-weight:700;
  letter-spacing:1px;color:var(--mt);text-transform:uppercase;cursor:pointer}
.ptab-item.active{color:var(--ac)}

/* FEATURES */
.features{padding:100px 40px;max-width:1100px;margin:0 auto}
.section-eyebrow{font-size:10px;font-weight:800;letter-spacing:3px;color:var(--ac);
  text-transform:uppercase;margin-bottom:16px}
.section-title{font-size:clamp(32px,4vw,48px);font-weight:900;line-height:1.1;
  letter-spacing:-1px;margin-bottom:16px}
.section-title em{font-style:italic;color:var(--ac)}
.section-sub{font-size:16px;color:var(--mt);max-width:480px;margin-bottom:60px;line-height:1.6}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feat-card{background:var(--sf);border-radius:20px;padding:28px;border:1px solid var(--bds);
  transition:border-color .25s,transform .25s}
.feat-card:hover{border-color:var(--ac);transform:translateY(-4px)}
.feat-icon{width:44px;height:44px;border-radius:12px;background:var(--acd);
  display:flex;align-items:center;justify-content:center;margin-bottom:18px;font-size:22px}
.feat-title{font-size:16px;font-weight:700;color:var(--tx);margin-bottom:8px}
.feat-body{font-size:13px;color:var(--mt);line-height:1.6}

/* SCREENS SECTION */
.screens-section{padding:80px 40px;background:linear-gradient(180deg,var(--bgg) 0%,var(--sf) 100%)}
.screens-inner{max-width:1100px;margin:0 auto}
.screens-scroll{display:flex;gap:20px;overflow-x:auto;padding-bottom:20px;scrollbar-width:none}
.screens-scroll::-webkit-scrollbar{display:none}
.screen-preview{flex:0 0 200px;background:var(--bg);border-radius:24px;
  border:1px solid var(--bds);overflow:hidden;transition:border-color .25s,transform .25s}
.screen-preview:hover{border-color:var(--ac);transform:translateY(-6px)}
.sp-header{background:var(--sf);padding:10px 12px;border-bottom:1px solid var(--bds)}
.sp-dot-row{display:flex;gap:4px;margin-bottom:6px}
.sp-dot{width:8px;height:8px;border-radius:50%}
.sp-title{font-size:9px;font-weight:700;color:var(--mt);letter-spacing:1.5px;text-transform:uppercase}
.sp-body{padding:12px}
.sp-metric{font-size:22px;font-weight:900;color:var(--tx);font-style:italic;margin-bottom:4px}
.sp-sub{font-size:9px;color:var(--mt)}
.sp-bar-row{margin-top:8px}
.sp-bar-label{display:flex;justify-content:space-between;margin-bottom:3px}
.sp-bar-lbl{font-size:8px;color:var(--mt)}
.sp-bar-val{font-size:8px;font-weight:700}
.sp-bar-track{height:4px;background:var(--sfh);border-radius:2px;margin-bottom:5px}
.sp-bar-fill{height:100%;border-radius:2px}

/* STATS BAR */
.stats-bar{background:var(--sf);border-top:1px solid var(--bds);border-bottom:1px solid var(--bds)}
.stats-inner{max-width:1100px;margin:0 auto;display:flex;justify-content:space-around;padding:40px}
.stat-item{text-align:center}
.si-val{font-size:40px;font-weight:900;font-style:italic;color:var(--tx);line-height:1}
.si-lbl{font-size:10px;font-weight:600;color:var(--mt);letter-spacing:2px;text-transform:uppercase;margin-top:6px}

/* FOOTER */
footer{padding:60px 40px;text-align:center;border-top:1px solid var(--bds)}
.footer-logo{font-size:16px;font-weight:900;letter-spacing:4px;color:var(--ac);margin-bottom:12px}
.footer-by{font-size:12px;color:var(--mt);letter-spacing:1px}
.footer-by a{color:var(--tx);text-decoration:none}

@media(max-width:800px){
  .hero-inner{grid-template-columns:1fr;gap:40px}
  .phone-wrap{display:none}
  .features-grid{grid-template-columns:1fr}
  nav{padding:0 20px}
  .hero{padding:100px 20px 60px}
  .hero-stats{flex-wrap:wrap;gap:20px}
  .stats-inner{flex-wrap:wrap;gap:20px}
}
</style>
</head>
<body>

<nav>
  <div style="display:flex;align-items:baseline;gap:4px">
    <span class="nav-logo">STROBE</span>
    <span class="nav-sub">LIVE</span>
  </div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Screens</a>
    <a href="#">About</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock →</a>
</nav>

<section class="hero">
  <div class="hero-inner">
    <div>
      <div class="hero-eyebrow">
        <span class="hero-live-badge"><span class="hero-live-dot"></span>Live</span>
        <span class="hero-label">RAM Design Studio · Heartbeat</span>
      </div>
      <h1>Every show,<br><em>live.</em></h1>
      <p class="hero-tagline">
        STROBE gives venue operators <strong>real-time visibility</strong> into capacity, revenue, crowd flow, and setlist pacing — all in one high-energy dashboard.
      </p>
      <div class="hero-ctas">
        <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View Design ↗</a>
        <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ◑</a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="val">5</div>
          <div class="lbl">Screens</div>
        </div>
        <div class="hero-stat">
          <div class="val">283</div>
          <div class="lbl">Elements</div>
        </div>
        <div class="hero-stat">
          <div class="val">Dark</div>
          <div class="lbl">Theme</div>
        </div>
        <div class="hero-stat">
          <div class="val">'26</div>
          <div class="lbl">Mar 24</div>
        </div>
      </div>
    </div>

    <div class="phone-wrap">
      <div class="phone-glow"></div>
      <div class="phone-frame">
        <div class="phone-notch"><div class="notch-cam"></div></div>
        <div class="phone-screen">
          <div style="background:#070911;padding:8px 12px;display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:9px;font-weight:900;letter-spacing:3px;color:#FF3366;text-transform:uppercase">STROBE</span>
            <span style="font-size:8px;color:rgba(238,240,255,.42)">MON · MAR 24</span>
          </div>
          <div style="height:2px;background:rgba(255,51,102,0.35)"></div>
          <div class="phone-hero-card">
            <div class="phc-live"><span class="phc-dot"></span>NOW LIVE</div>
            <div class="phc-title">TAME IMPALA</div>
            <div class="phc-sub">Currents Tour · Main Stage · 8:00 PM</div>
            <div class="cap-bar-wrap">
              <div class="cap-bar-top">
                <span class="cap-label">CAPACITY</span>
                <span class="cap-pct">87%</span>
              </div>
              <div class="cap-track"><div class="cap-fill"></div></div>
              <div style="display:flex;justify-content:space-between;margin-top:4px">
                <span style="font-size:8px;color:rgba(238,240,255,.42)">2,436 / 2,800</span>
                <span style="font-size:8px;color:rgba(238,240,255,.42)">3:24 rem</span>
              </div>
            </div>
          </div>
          <div class="phone-grid">
            <div class="pgrid-cell">
              <div class="pgc-label">DOORS</div>
              <div class="pgc-val accent">$18.4K</div>
              <div class="pgc-sub">/ hr</div>
            </div>
            <div class="pgrid-cell">
              <div class="pgc-label">BAR</div>
              <div class="pgc-val purple">341</div>
              <div class="pgc-sub">drinks</div>
            </div>
            <div class="pgrid-cell">
              <div class="pgc-label">MERCH</div>
              <div class="pgc-val teal">$6.2K</div>
              <div class="pgc-sub">tonight</div>
            </div>
          </div>
          <div style="padding:6px 10px 4px">
            <div style="font-size:8px;font-weight:800;letter-spacing:2px;color:rgba(238,240,255,.42);text-transform:uppercase;margin-bottom:6px">UP NEXT TONIGHT</div>
            ${[
              ['10:30 PM','Bonobo DJ Set','68%','#8B5CF6'],
              ['11:45 PM','Close Night w/ Sable','41%','#2DD4BF'],
              ['01:00 AM','Afterparty (Members)','100%','#F59E0B'],
            ].map(([time,name,cap,color])=>`
              <div style="background:#0E1322;border-radius:8px;padding:7px 10px;margin-bottom:5px;border-left:2px solid ${color};display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-size:8px;color:rgba(238,240,255,.42)">${time}</div>
                  <div style="font-size:11px;font-weight:700;color:#EEF0FF">${name}</div>
                </div>
                <span style="font-size:11px;font-weight:800;color:${color}">${cap}</span>
              </div>
            `).join('')}
          </div>
          <div class="phone-tab">
            ${['Tonight','Show','Crowd','Revenue','History'].map((t,i)=>`<div class="ptab-item${i===0?' active':''}">${t}</div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="stats-bar">
  <div class="stats-inner">
    <div class="stat-item"><div class="si-val">$142K</div><div class="si-lbl">Live Revenue</div></div>
    <div class="stat-item"><div class="si-val">2,436</div><div class="si-lbl">In Venue Now</div></div>
    <div class="stat-item"><div class="si-val">87%</div><div class="si-lbl">Capacity</div></div>
    <div class="stat-item"><div class="si-val">9.1</div><div class="si-lbl">Crowd Energy</div></div>
    <div class="stat-item"><div class="si-val">341</div><div class="si-lbl">Bar Transactions</div></div>
  </div>
</div>

<section style="padding:100px 40px">
  <div class="features">
    <div class="section-eyebrow">Features</div>
    <h2 class="section-title">Built for <em>live</em> performance</h2>
    <p class="section-sub">Every number in STROBE updates in real time. No refreshing, no guessing — just signal.</p>
    <div class="features-grid">
      <div class="feat-card">
        <div class="feat-icon">⚡</div>
        <div class="feat-title">Live Capacity Bars</div>
        <div class="feat-body">Real-time entry tracking with animated progress bars. See exactly where you are against sell-out, by stage and zone.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon">💰</div>
        <div class="feat-title">Revenue Intelligence</div>
        <div class="feat-body">Tickets, bar, merch, and VIP upgrades broken out live with hourly run-rates and projected close totals.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon">🎵</div>
        <div class="feat-title">Setlist Tracker</div>
        <div class="feat-body">Follow the artist's setlist in real time. Know which songs have played, pacing relative to set length, and crowd energy peaks.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon">👥</div>
        <div class="feat-title">Crowd Intel</div>
        <div class="feat-body">Demographics, arrival heatmaps, check-in peaks, and entry method breakdowns — all synthesized without surveys.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon">📅</div>
        <div class="feat-title">Multi-Show Night</div>
        <div class="feat-body">Running multiple stages or back-to-back shows? STROBE handles the full night across all your rooms from one dashboard.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon">🏆</div>
        <div class="feat-title">Show History</div>
        <div class="feat-body">Every past show ranked by revenue, attendance, and crowd score. Find patterns, identify your best-performing acts, and book smarter.</div>
      </div>
    </div>
  </div>
</section>

<section class="screens-section">
  <div class="screens-inner">
    <div class="section-eyebrow" style="margin-bottom:12px">5 screens</div>
    <h2 class="section-title" style="margin-bottom:10px">The full <em>picture</em></h2>
    <p class="section-sub">From tonight's line-up to long-term show history — every view you need, nothing you don't.</p>
    <div class="screens-scroll">
      ${[
        { label:'Tonight', metric:'87%', sub:'Tame Impala · Main Stage', bars:[{l:'Capacity',p:87,c:'#FF3366'},{l:'Bar',p:62,c:'#8B5CF6'}] },
        { label:'Show', metric:'1h 48m', sub:'Elapsed · 2,436 in venue', bars:[{l:'Attendance',p:87,c:'#FF3366'},{l:'Energy',p:91,c:'#2DD4BF'}] },
        { label:'Crowd', metric:'9.1K', sub:'Checked in tonight', bars:[{l:'Age 25-34',p:44,c:'#FF3366'},{l:'Age 18-24',p:28,c:'#8B5CF6'}] },
        { label:'Revenue', metric:'$142K', sub:'Total · +22% vs avg', bars:[{l:'Tickets',p:63,c:'#FF3366'},{l:'Bar',p:22,c:'#8B5CF6'}] },
        { label:'History', metric:'$824K', sub:'30-day total · 12 shows', bars:[{l:'Avg capacity',p:91,c:'#2DD4BF'},{l:'Avg score',p:91,c:'#F59E0B'}] },
      ].map(s=>`
      <div class="screen-preview">
        <div class="sp-header">
          <div class="sp-dot-row">
            <div class="sp-dot" style="background:#FF3366;opacity:.8"></div>
            <div class="sp-dot" style="background:#F59E0B;opacity:.6"></div>
            <div class="sp-dot" style="background:#10B981;opacity:.6"></div>
          </div>
          <div class="sp-title">${s.label}</div>
        </div>
        <div class="sp-body">
          <div class="sp-metric">${s.metric}</div>
          <div class="sp-sub">${s.sub}</div>
          <div class="sp-bar-row">
            ${s.bars.map(b=>`
            <div class="sp-bar-label">
              <span class="sp-bar-lbl">${b.l}</span>
              <span class="sp-bar-val" style="color:${b.c}">${b.p}%</span>
            </div>
            <div class="sp-bar-track"><div class="sp-bar-fill" style="width:${b.p}%;background:${b.c}"></div></div>
            `).join('')}
          </div>
        </div>
      </div>
      `).join('')}
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">STROBE</div>
  <div class="footer-by">Designed by <a href="https://ram.zenbin.org">RAM Design Studio</a> · Design Heartbeat · 2026</div>
  <div style="margin-top:16px;display:flex;justify-content:center;gap:20px">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" style="color:var(--ac);font-size:12px;text-decoration:none">View .pen →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" style="color:var(--pu);font-size:12px;text-decoration:none">Interactive Mock ◑</a>
  </div>
</footer>

</body>
</html>`;
}

// ── VIEWER ─────────────────────────────────────────────────────────────────
function buildViewer() {
  const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>STROBE — Pen Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#070911;color:#EEF0FF;font-family:'Inter',system-ui,sans-serif;
  display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:40px 20px}
h1{font-size:13px;font-weight:900;letter-spacing:4px;color:#FF3366;text-transform:uppercase;margin-bottom:6px}
p{font-size:11px;color:rgba(238,240,255,.42);margin-bottom:30px;letter-spacing:1px}
#viewer{width:390px;min-height:844px;background:#0E1322;border-radius:24px;
  border:1px solid rgba(255,51,102,0.2);overflow:hidden}
</style>
</head>
<body>
<h1>STROBE</h1>
<p>LIVE VENUE EVENT ANALYTICS · RAM DESIGN STUDIO</p>
<div id="viewer"><p style="padding:40px;text-align:center;color:rgba(238,240,255,.4)">Loading pen viewer…</p></div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
// Minimal pen renderer
(function(){
  const pen = JSON.parse(window.EMBEDDED_PEN);
  const el = document.getElementById('viewer');
  if(!pen||!pen.screens){el.innerHTML='<p style="padding:20px">No screens found</p>';return;}
  const s = pen.screens[0];
  el.innerHTML = '<p style="padding:20px;font-size:12px;color:rgba(238,240,255,.6)">Screen: '+s.label+' · '+s.elements.length+' elements<br><br>Open the interactive mock for full navigation.</p>';
})();
</script>
</body>
</html>`;
  return viewerTemplate;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('── STROBE Full Design Discovery Pipeline ──');

  // 1. Hero
  console.log('\n[1] Publishing hero page…');
  const heroHtml = buildHero();
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log('  Hero:', heroRes.status, heroRes.status===200?'OK':heroRes.body.slice(0,120));

  // 2. Viewer
  console.log('\n[2] Publishing viewer…');
  const viewerHtml = buildViewer();
  const viewerRes = await zenPut(`${SLUG}-viewer`, `${APP_NAME} — Pen Viewer`, viewerHtml);
  console.log('  Viewer:', viewerRes.status, viewerRes.status===200?'OK':viewerRes.body.slice(0,120));

  // 3. GitHub queue
  console.log('\n[3] Updating gallery queue…');
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
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
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
  console.log('  Queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));

  console.log('\n── Done ──');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);

  // Save entry for DB indexing
  fs.writeFileSync('strobe-entry.json', JSON.stringify(newEntry, null, 2));
  console.log('\n  Entry saved to strobe-entry.json');
})();
