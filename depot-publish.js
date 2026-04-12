#!/usr/bin/env node
// DEPOT publish — hero page + viewer
const fs    = require('fs');
const https = require('https');

const SLUG      = 'depot';
const APP_NAME  = 'DEPOT';
const TAGLINE   = 'Motion assets, shipped fresh';
const SUBDOMAIN = 'ram';

function zenPost(pageId, html, title) {
  const body = JSON.stringify({ html, title: title || pageId });
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'zenbin.org',
      path:     `/v1/pages/${pageId}`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'X-Subdomain':    SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      },
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

// ── HERO HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>DEPOT — Motion assets, shipped fresh</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0A0908;
  --bg2:#060504;
  --surf:#141210;
  --surfup:#1C1915;
  --surfhi:#242119;
  --border:rgba(255,205,150,0.07);
  --borderup:rgba(255,205,150,0.13);
  --text:#F2EDE6;
  --muted:rgba(242,237,230,0.42);
  --faint:rgba(242,237,230,0.20);
  --accent:#FF6B1A;
  --asoft:rgba(255,107,26,0.10);
  --amid:rgba(255,107,26,0.20);
  --a2:#FFD166;
  --a2soft:rgba(255,209,102,0.09);
  --green:#3DDC84;
  --gsoft:rgba(61,220,132,0.10);
  --purple:#C084FC;
  --mono:#A89F96;
  --monofaint:rgba(168,159,150,0.28);
}
html{scroll-behavior:smooth}
body{
  font-family:'Inter',system-ui,sans-serif;
  background:var(--bg);color:var(--text);
  min-height:100vh;overflow-x:hidden;
}

/* ── noise grain overlay ── */
body::after{
  content:'';position:fixed;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-size:180px;pointer-events:none;z-index:999;opacity:.7;
}

/* ── glow orb ── */
.glow-orb{
  position:fixed;width:700px;height:700px;
  background:radial-gradient(circle,rgba(255,107,26,0.07) 0%,transparent 65%);
  top:-200px;left:50%;transform:translateX(-50%);
  pointer-events:none;z-index:0;
}

.wrap{position:relative;z-index:1;max-width:1140px;margin:0 auto;padding:0 28px}

/* ── NAV ── */
nav{
  position:sticky;top:0;z-index:100;
  background:rgba(10,9,8,0.84);
  backdrop-filter:blur(20px) saturate(1.2);
  border-bottom:1px solid var(--border);
}
.nav-inner{
  max-width:1140px;margin:0 auto;padding:0 28px;
  display:flex;align-items:center;justify-content:space-between;height:56px;
}
.nav-logo{
  font-family:'IBM Plex Mono',monospace;font-size:16px;font-weight:500;
  color:var(--text);text-decoration:none;letter-spacing:0.04em;
}
.nav-logo span{color:var(--accent)}
.nav-links{display:flex;gap:28px}
.nav-links a{
  font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:400;
  color:var(--muted);text-decoration:none;letter-spacing:0.08em;
  text-transform:uppercase;transition:.2s;
}
.nav-links a:hover{color:var(--text)}
.nav-cta{
  font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;
  letter-spacing:0.08em;text-transform:uppercase;
  padding:8px 18px;border:1px solid var(--accent);
  color:var(--accent);background:var(--asoft);border-radius:2px;
  text-decoration:none;transition:.2s;
}
.nav-cta:hover{background:var(--accent);color:#0A0908}

/* ── TICKER ── */
.ticker-bar{
  background:var(--surf);border-bottom:1px solid var(--border);
  overflow:hidden;padding:8px 0;
}
.ticker-track{
  display:flex;gap:0;white-space:nowrap;
  animation:ticker-scroll 28s linear infinite;
}
.ticker-track:hover{animation-play-state:paused}
.ticker-item{
  font-family:'IBM Plex Mono',monospace;font-size:10px;
  color:var(--a2);letter-spacing:0.06em;text-transform:uppercase;
  padding:0 32px;
}
.ticker-sep{color:var(--monofaint);margin:0 -16px}
@keyframes ticker-scroll{from{transform:translateX(0)} to{transform:translateX(-50%)}}

/* ── HERO ── */
.hero{padding:100px 0 80px;text-align:center;position:relative;z-index:1}
.hero-lot{
  font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--mono);
  letter-spacing:0.10em;text-transform:uppercase;margin-bottom:20px;
}
.hero-counter-label{
  font-family:'IBM Plex Mono',monospace;font-size:11px;
  color:var(--accent);letter-spacing:0.12em;text-transform:uppercase;
  margin-bottom:16px;
}
.hero-counter{
  font-family:'IBM Plex Mono',monospace;font-size:clamp(80px,14vw,144px);
  font-weight:500;color:var(--text);letter-spacing:-0.04em;
  line-height:1;margin-bottom:8px;
  display:flex;align-items:center;justify-content:center;gap:4px;
}
.hero-counter-digit{
  display:inline-flex;align-items:center;justify-content:center;
  width:1ch;overflow:hidden;position:relative;
}
.hero-counter-sub{
  font-family:'IBM Plex Mono',monospace;font-size:11px;
  color:var(--muted);letter-spacing:0.06em;margin-bottom:8px;
}
h1{
  font-size:clamp(36px,5vw,60px);font-weight:800;letter-spacing:-0.04em;
  line-height:1.08;margin-bottom:16px;color:var(--text);
}
h1 em{color:var(--accent);font-style:normal}
.hero-sub{
  font-size:clamp(15px,2vw,18px);color:var(--muted);
  max-width:480px;margin:0 auto 44px;line-height:1.55;font-weight:400;
}
.hero-ctas{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
.btn-primary{
  font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;
  letter-spacing:0.10em;text-transform:uppercase;
  padding:14px 28px;background:var(--accent);color:#0A0908;
  border-radius:2px;text-decoration:none;transition:.2s;
  display:inline-flex;align-items:center;gap:8px;
}
.btn-primary:hover{background:#FF8040;transform:translateY(-1px)}
.btn-ghost{
  font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:400;
  letter-spacing:0.10em;text-transform:uppercase;
  padding:14px 24px;border:1px solid var(--borderup);color:var(--muted);
  background:transparent;border-radius:2px;text-decoration:none;transition:.2s;
}
.btn-ghost:hover{border-color:var(--text);color:var(--text)}

/* ── PHONE MOCKUP ── */
.mockup-wrap{margin:72px auto 0;max-width:820px;position:relative}
.mockup-glow{
  position:absolute;inset:-60px;
  background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(255,107,26,0.10) 0%,transparent 70%);
  pointer-events:none;z-index:0;
}
.phone-frame{
  width:290px;margin:0 auto;position:relative;z-index:1;
  background:#0F0D0B;border:1px solid rgba(255,205,150,0.12);
  border-radius:38px;padding:12px;
  box-shadow:0 40px 100px rgba(0,0,0,0.6),0 0 0 1px rgba(255,205,150,0.05) inset;
}
.phone-notch{
  width:80px;height:22px;background:#000;
  border-radius:100px;margin:0 auto 12px;
}
.phone-screen{border-radius:26px;overflow:hidden;background:var(--bg);min-height:520px}

/* ── PHONE SCREEN CONTENT ── */
.ps-topbar{
  padding:14px 16px 10px;display:flex;align-items:center;justify-content:space-between;
  border-bottom:1px solid var(--border);
}
.ps-logo{font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:500;color:var(--text);letter-spacing:0.04em}
.ps-icons{display:flex;gap:10px}
.ps-icon{width:20px;height:20px;border-radius:50%;background:var(--surfup)}

.ps-ticker{
  background:var(--surf);padding:6px 16px;
  font-family:'IBM Plex Mono',monospace;font-size:8px;
  color:var(--a2);letter-spacing:0.06em;overflow:hidden;white-space:nowrap;
}

.ps-hero{padding:20px 16px 16px;text-align:center}
.ps-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--accent);letter-spacing:0.10em;text-transform:uppercase;margin-bottom:8px}
.ps-counter{
  font-family:'IBM Plex Mono',monospace;font-size:52px;font-weight:500;
  color:var(--text);letter-spacing:-0.03em;line-height:1;margin-bottom:6px;
}
.ps-counter-sub{font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--muted);letter-spacing:0.06em}

.ps-cat-strip{display:flex;gap:6px;padding:0 14px 14px;overflow:hidden}
.ps-cat{
  font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:0.06em;
  padding:4px 8px;border-radius:2px;white-space:nowrap;
  background:var(--surfup);color:var(--muted);
}
.ps-cat.active{background:var(--accent);color:#0A0908;font-weight:600}

.ps-featured{
  margin:0 12px;padding:14px;
  background:var(--surfup);border:1px solid var(--borderup);border-radius:6px;
}
.ps-feat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.ps-lot{font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--mono);letter-spacing:0.08em}
.ps-badge{font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--accent);background:var(--asoft);padding:2px 6px;border-radius:2px;letter-spacing:0.06em}
.ps-feat-title{font-size:11px;font-weight:700;color:var(--text);margin-bottom:4px;letter-spacing:-0.01em}
.ps-feat-sub{font-size:8px;color:var(--muted);margin-bottom:10px;line-height:1.4}
.ps-frames{display:flex;gap:5px;margin-bottom:10px}
.ps-frame{flex:1;height:32px;border-radius:3px;display:flex;align-items:center;justify-content:center}
.ps-frame-lbl{font-family:'IBM Plex Mono',monospace;font-size:5px;letter-spacing:0.04em;color:rgba(242,237,230,0.6)}
.ps-price-row{display:flex;align-items:center;gap:6px}
.ps-price{font-size:13px;font-weight:700;color:var(--text)}
.ps-price-orig{font-size:9px;color:var(--muted);text-decoration:line-through}
.ps-save{font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--green);background:var(--gsoft);padding:2px 6px;border-radius:2px}
.ps-inv{margin-top:8px}
.ps-inv-bar{height:3px;background:var(--border);border-radius:100px;overflow:hidden}
.ps-inv-fill{height:100%;width:47%;background:var(--a2);border-radius:100px}
.ps-inv-lbl{font-family:'IBM Plex Mono',monospace;font-size:6px;color:var(--muted);margin-top:4px;letter-spacing:0.04em}

.ps-botnav{
  display:flex;justify-content:space-around;
  padding:12px 8px 8px;margin-top:12px;
  background:var(--bg2);border-top:1px solid var(--border);
}
.ps-nav-item{display:flex;flex-direction:column;align-items:center;gap:4px}
.ps-nav-dot{width:14px;height:14px;border-radius:3px;background:var(--surfup)}
.ps-nav-dot.a{background:var(--accent)}
.ps-nav-lbl{font-family:'IBM Plex Mono',monospace;font-size:6px;color:var(--muted);letter-spacing:0.06em}
.ps-nav-lbl.a{color:var(--accent)}

/* ── FLOAT CARDS ── */
.float-cards{position:absolute;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:14px}
.float-left{left:-220px}
.float-right{right:-220px}
.float-card{
  width:190px;padding:16px;
  background:var(--surf);border:1px solid var(--borderup);
  border-radius:4px;
  box-shadow:0 8px 40px rgba(0,0,0,0.4);
}
.fc-lot{font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--mono);letter-spacing:0.08em;margin-bottom:6px}
.fc-title{font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px;letter-spacing:-0.01em}
.fc-badge{display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:7px;padding:2px 6px;border-radius:2px;margin-bottom:8px;letter-spacing:0.06em}
.fc-inv{height:3px;background:var(--border);border-radius:100px;overflow:hidden;margin-top:6px}
.fc-inv-fill{height:100%;border-radius:100px}
.fc-price{font-size:16px;font-weight:700;color:var(--text);margin-top:6px}
.fc-orig{font-size:9px;color:var(--muted);text-decoration:line-through}

/* ── STATS ── */
.stats{padding:64px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center}
.stat-n{
  font-family:'IBM Plex Mono',monospace;
  font-size:clamp(28px,3.5vw,44px);font-weight:500;
  color:var(--text);letter-spacing:-0.03em;margin-bottom:6px;
}
.stat-n em{color:var(--accent);font-style:normal}
.stat-l{font-size:12px;color:var(--muted)}

/* ── HOW IT WORKS ── */
.how{padding:80px 0}
.how-title{text-align:center;margin-bottom:64px}
.sec-eye{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--accent);letter-spacing:0.10em;text-transform:uppercase;margin-bottom:12px}
.sec-h2{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-0.03em;color:var(--text);line-height:1.12}
.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border)}
.how-card{
  background:var(--bg);padding:36px 28px;
  transition:.2s;
}
.how-card:hover{background:var(--surf)}
.how-num{
  font-family:'IBM Plex Mono',monospace;font-size:11px;
  color:var(--mono);letter-spacing:0.10em;margin-bottom:20px;
}
.how-icon{
  font-size:28px;margin-bottom:16px;
  width:52px;height:52px;display:flex;align-items:center;justify-content:center;
  background:var(--asoft);border-radius:4px;
}
.how-icon.g{background:var(--gsoft)}
.how-icon.p{background:rgba(192,132,252,0.10)}
.how-h3{font-size:17px;font-weight:700;color:var(--text);margin-bottom:8px;letter-spacing:-0.01em}
.how-p{font-size:13px;color:var(--muted);line-height:1.55}

/* ── CATALOG PREVIEW STRIP ── */
.catalog-strip{padding:80px 0}
.catalog-scroll{
  display:flex;gap:12px;padding:20px 28px;
  overflow-x:auto;scroll-snap-type:x mandatory;
  scrollbar-width:none;
}
.catalog-scroll::-webkit-scrollbar{display:none}
.catalog-card{
  flex-shrink:0;width:160px;scroll-snap-align:start;
  background:var(--surf);border:1px solid var(--border);
  border-radius:4px;overflow:hidden;transition:.2s;
  cursor:pointer;
}
.catalog-card:hover{border-color:var(--borderup);transform:translateY(-2px)}
.cc-preview{height:80px;display:flex;align-items:flex-end;padding:8px}
.cc-frame-strip{display:flex;gap:3px;width:100%}
.cc-frame{flex:1;height:20px;border-radius:2px}
.cc-body{padding:10px}
.cc-lot{font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--mono);letter-spacing:0.08em;margin-bottom:4px}
.cc-title{font-size:10px;font-weight:700;color:var(--text);margin-bottom:2px;letter-spacing:-0.01em}
.cc-cat{font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--muted);letter-spacing:0.06em;margin-bottom:8px}
.cc-price-row{display:flex;align-items:center;justify-content:space-between}
.cc-price{font-size:11px;font-weight:700;color:var(--text)}
.cc-badge{font-family:'IBM Plex Mono',monospace;font-size:6px;padding:2px 5px;border-radius:2px;letter-spacing:0.06em}

/* ── FOOTER ── */
footer{padding:48px 0;border-top:1px solid var(--border)}
.footer-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px}
.footer-brand{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:500;color:var(--text);letter-spacing:0.04em}
.footer-brand span{color:var(--accent)}
.footer-links{display:flex;gap:24px}
.footer-links a{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--muted);text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;transition:.2s}
.footer-links a:hover{color:var(--text)}
.footer-credit{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--faint);letter-spacing:0.04em}

@media(max-width:900px){
  .float-cards{display:none}
  .how-grid{grid-template-columns:1fr}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .footer-inner{flex-direction:column;text-align:center}
}
</style>
</head>
<body>

<div class="glow-orb"></div>

<!-- TICKER -->
<div class="ticker-bar">
  <div class="ticker-track">
    <span class="ticker-item">✦ NEW: KINETIC TYPE VOL.3 — LOT-024</span>
    <span class="ticker-sep">·</span>
    <span class="ticker-item">★ FREE STARTER PACK — DOWNLOAD NOW</span>
    <span class="ticker-sep">·</span>
    <span class="ticker-item">✦ DATA MOTION PACK — 44 ANIMATIONS</span>
    <span class="ticker-sep">·</span>
    <span class="ticker-item">⊡ 4.9 / 5.0 FROM 2,400+ BUILDERS</span>
    <span class="ticker-sep">·</span>
    <span class="ticker-item">✦ NEW: KINETIC TYPE VOL.3 — LOT-024</span>
    <span class="ticker-sep">·</span>
    <span class="ticker-item">★ FREE STARTER PACK — DOWNLOAD NOW</span>
    <span class="ticker-sep">·</span>
    <span class="ticker-item">✦ DATA MOTION PACK — 44 ANIMATIONS</span>
    <span class="ticker-sep">·</span>
    <span class="ticker-item">⊡ 4.9 / 5.0 FROM 2,400+ BUILDERS</span>
    <span class="ticker-sep">·</span>
  </div>
</div>

<!-- NAV -->
<nav>
  <div class="nav-inner">
    <a class="nav-logo" href="#">DEPOT<span>®</span></a>
    <div class="nav-links">
      <a href="#">CATALOG</a>
      <a href="#">COLLECTIONS</a>
      <a href="#">FREEBIES</a>
      <a href="#">ABOUT</a>
    </div>
    <a class="nav-cta" href="https://ram.zenbin.org/depot-mock">OPEN MOCK →</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="wrap">
    <div class="hero-lot">DEPOT® · DIGITAL MOTION STORE · EST. 2024</div>
    <div class="hero-counter-label">TEMPLATES IN DEPOT</div>
    <div class="hero-counter">
      <span class="hero-counter-digit">2</span>
      <span class="hero-counter-digit">8</span>
      <span class="hero-counter-digit">3</span>
    </div>
    <div class="hero-counter-sub">UPDATED WEEKLY · JITTER · AFTER EFFECTS · LOTTIE JSON</div>
    <h1 style="margin-top:32px">Motion assets,<br/><em>shipped fresh</em></h1>
    <p class="hero-sub">
      Premium motion templates for product designers and builders.
      Each drop is a limited lot — get yours before they're gone.
    </p>
    <div class="hero-ctas">
      <a class="btn-primary" href="https://ram.zenbin.org/depot-mock">☀ Interactive mock</a>
      <a class="btn-ghost" href="https://ram.zenbin.org/depot-viewer">◈ Design viewer</a>
    </div>

    <div class="mockup-wrap">
      <div class="mockup-glow"></div>

      <!-- Left float -->
      <div class="float-cards float-left">
        <div class="float-card">
          <div class="fc-lot">LOT-024</div>
          <div class="fc-title">Kinetic Type Vol.3</div>
          <div class="fc-badge" style="color:#FF6B1A;background:rgba(255,107,26,0.10)">NEW DROP</div>
          <div class="fc-inv"><div class="fc-inv-fill" style="width:47%;background:#FFD166"></div></div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:rgba(242,237,230,0.4);margin-top:4px;letter-spacing:0.04em">47 OF 100 REMAINING</div>
          <div class="fc-price">$38 <span class="fc-orig">$55</span></div>
        </div>
        <div class="float-card">
          <div class="fc-lot">SET-001</div>
          <div class="fc-title">The Full DEPOT</div>
          <div class="fc-badge" style="color:#FFD166;background:rgba(255,209,102,0.09)">COMPLETE COLLECTION</div>
          <div class="fc-price">$149 <span class="fc-orig">$344</span></div>
        </div>
      </div>

      <!-- PHONE -->
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="ps-topbar">
            <div class="ps-logo">DEPOT</div>
            <div class="ps-icons">
              <div class="ps-icon"></div>
              <div class="ps-icon" style="background:#FF6B1A;opacity:.8"></div>
            </div>
          </div>
          <div class="ps-ticker">✦ NEW: KINETIC TYPE VOL.3 — LOT-024 &nbsp;&nbsp; ★ FREE STARTER PACK — DOWNLOAD NOW</div>
          <div class="ps-hero">
            <div class="ps-eyebrow">TEMPLATES IN DEPOT</div>
            <div class="ps-counter">283</div>
            <div class="ps-counter-sub">UPDATED WEEKLY · JITTER · AE · LOTTIE</div>
          </div>
          <div class="ps-cat-strip">
            <div class="ps-cat active">ALL 283</div>
            <div class="ps-cat">KINETIC 74</div>
            <div class="ps-cat">DATA 31</div>
            <div class="ps-cat">TYPE 48</div>
          </div>
          <div class="ps-featured">
            <div class="ps-feat-top">
              <div class="ps-lot">LOT-024</div>
              <div class="ps-badge">NEW DROP</div>
            </div>
            <div class="ps-feat-title">Kinetic Type Vol.3</div>
            <div class="ps-feat-sub">24 expression-driven type animations for Jitter &amp; After Effects</div>
            <div class="ps-frames">
              <div class="ps-frame" style="background:#1E1A14"><div class="ps-frame-lbl" style="color:rgba(255,107,26,.7)">BOLD SLAM</div></div>
              <div class="ps-frame" style="background:#14120F"><div class="ps-frame-lbl" style="color:rgba(255,209,102,.7)">ELASTIC</div></div>
              <div class="ps-frame" style="background:#1A1711"><div class="ps-frame-lbl" style="color:rgba(242,237,230,.5)">GLIDE</div></div>
            </div>
            <div class="ps-price-row">
              <div class="ps-price">$38</div>
              <div class="ps-price-orig">$55</div>
              <div class="ps-save">−31%</div>
            </div>
            <div class="ps-inv">
              <div class="ps-inv-bar"><div class="ps-inv-fill"></div></div>
              <div class="ps-inv-lbl">47 OF 100 LICENSES REMAINING</div>
            </div>
          </div>
          <div class="ps-botnav">
            ${[
              {l:'SHOP',  a:true },
              {l:'CATALOG',a:false},
              {l:'SETS', a:false},
              {l:'LIBRARY',a:false},
            ].map(i=>`
              <div class="ps-nav-item">
                <div class="ps-nav-dot${i.a?' a':''}"></div>
                <div class="ps-nav-lbl${i.a?' a':''}">${i.l}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- Right float -->
      <div class="float-cards float-right">
        <div class="float-card">
          <div class="fc-lot">LOT-021</div>
          <div class="fc-title">Loader Collective</div>
          <div class="fc-badge" style="color:#3DDC84;background:rgba(61,220,132,0.10)">BESTSELLER</div>
          <div style="font-size:11px;font-weight:700;color:#F2EDE6;margin-top:6px">$19</div>
        </div>
        <div class="float-card">
          <div class="fc-lot">LOT-019</div>
          <div class="fc-title">Free Starter Pack</div>
          <div class="fc-badge" style="color:#3DDC84;background:rgba(61,220,132,0.10)">FREE</div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:rgba(242,237,230,.4);margin-top:6px;letter-spacing:0.04em">NO ACCOUNT REQUIRED</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="stats">
  <div class="wrap">
    <div class="stats-grid">
      <div><div class="stat-n"><em>283</em></div><div class="stat-l">Templates in depot</div></div>
      <div><div class="stat-n">12<em>K</em>+</div><div class="stat-l">Builders using DEPOT</div></div>
      <div><div class="stat-n"><em>4.9</em>/5</div><div class="stat-l">Average rating</div></div>
      <div><div class="stat-n"><em>3</em></div><div class="stat-l">Export formats</div></div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="how">
  <div class="wrap">
    <div class="how-title">
      <div class="sec-eye">How it works</div>
      <div class="sec-h2">Motion tools, treated<br/>like physical goods</div>
    </div>
    <div class="how-grid">
      <div class="how-card">
        <div class="how-num">001</div>
        <div class="how-icon">⊡</div>
        <div class="how-h3">Browse by lot</div>
        <p class="how-p">Every template has a lot number, category, and inventory count — just like a physical goods catalog. Know exactly what you're getting and how many remain.</p>
      </div>
      <div class="how-card">
        <div class="how-num">002</div>
        <div class="how-icon g">↓</div>
        <div class="how-h3">Instant delivery</div>
        <p class="how-p">After purchase, your library fills instantly. Download Jitter, After Effects, or Lottie JSON — all formats included. Re-download any time.</p>
      </div>
      <div class="how-card">
        <div class="how-num">003</div>
        <div class="how-icon p">∞</div>
        <div class="how-h3">Lifetime access</div>
        <p class="how-p">Every purchase includes lifetime access and free version updates. The COMPLETE COLLECTION includes every future drop automatically.</p>
      </div>
    </div>
  </div>
</section>

<!-- CATALOG PREVIEW -->
<section class="catalog-strip">
  <div class="wrap" style="margin-bottom:16px">
    <div class="sec-eye">Catalog preview</div>
    <div class="sec-h2">5 screens,<br/>designed for motion</div>
  </div>
  <div class="catalog-scroll">
    ${[
      { lot:'LOT-024', title:'Kinetic Type Vol.3', cat:'KINETIC', price:'$38', badge:'NEW', badgeColor:'#FF6B1A', badgeBg:'rgba(255,107,26,.10)', frames:['#1E1A14','#14120F','#1A1711'], accent:'#FF6B1A' },
      { lot:'LOT-023', title:'Data Motion Pack',   cat:'DATA VIZ', price:'$44', badge:null, frames:['#0E1914','#0A1510','#111A13'], accent:'#3DDC84' },
      { lot:'LOT-022', title:'Scroll Transitions', cat:'TRANSITIONS', price:'$29', badge:'LOW STOCK', badgeColor:'#FFD166', badgeBg:'rgba(255,209,102,.09)', frames:['#180D24','#120A1E','#1A1228'], accent:'#C084FC' },
      { lot:'LOT-021', title:'Loader Collective',  cat:'LOADERS', price:'$19', badge:'BESTSELLER', badgeColor:'#3DDC84', badgeBg:'rgba(61,220,132,.10)', frames:['#141414','#0F0F0F','#111111'], accent:'#F2EDE6' },
      { lot:'LOT-019', title:'Free Starter Pack',  cat:'FREE', price:'FREE', priceColor:'#3DDC84', badge:'FREE', badgeColor:'#3DDC84', badgeBg:'rgba(61,220,132,.10)', frames:['#0D1710','#0A1209','#0F1A0C'], accent:'#3DDC84' },
      { lot:'SET-001', title:'The Full DEPOT',     cat:'COLLECTION', price:'$149', badge:'COMPLETE', badgeColor:'#FFD166', badgeBg:'rgba(255,209,102,.09)', frames:['#FF6B1A','#FFD166','#3DDC84'], accent:'#FFD166' },
    ].map(c=>`
      <div class="catalog-card">
        <div class="cc-preview" style="background:${c.frames[0]}">
          <div class="cc-frame-strip">
            ${c.frames.map(f=>`<div class="cc-frame" style="background:${f};opacity:.8;border:1px solid rgba(255,205,150,0.08)"></div>`).join('')}
          </div>
        </div>
        <div class="cc-body">
          <div class="cc-lot">${c.lot}</div>
          <div class="cc-title">${c.title}</div>
          <div class="cc-cat">${c.cat}</div>
          <div class="cc-price-row">
            <div class="cc-price" style="${c.priceColor?'color:'+c.priceColor:''}">${c.price}</div>
            ${c.badge?`<div class="cc-badge" style="color:${c.badgeColor};background:${c.badgeBg}">${c.badge}</div>`:''}
          </div>
        </div>
      </div>`).join('')}
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="wrap">
    <div class="footer-inner">
      <div class="footer-brand">DEPOT<span>®</span> · Motion assets, shipped fresh</div>
      <div class="footer-links">
        <a href="https://ram.zenbin.org/depot-viewer">DESIGN VIEWER</a>
        <a href="https://ram.zenbin.org/depot-mock">INTERACTIVE MOCK</a>
      </div>
      <div class="footer-credit">RAM Design Heartbeat · April 2026</div>
    </div>
  </div>
</footer>

</body>
</html>`;

// ── VIEWER ─────────────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(__dirname + '/depot.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
let viewerHtml = fs.readFileSync(__dirname + '/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── PUBLISH ────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page…');
  const heroRes = await zenPost(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${heroRes.status} ${heroRes.status===200?'✓':heroRes.body.slice(0,120)} → https://${SUBDOMAIN}.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const viewRes = await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} Viewer`);
  console.log(`  Viewer: ${viewRes.status} ${viewRes.status===200?'✓':viewRes.body.slice(0,120)} → https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);
})();
