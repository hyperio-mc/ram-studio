const fs = require('fs');
const https = require('https');

const SLUG = 'haven';
const APP_NAME = 'HAVEN';
const TAGLINE = 'Your city, curated.';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

async function pub(slug, html, title) {
  const res = await post('zenbin.org', '/api/publish', { 'X-Subdomain': 'ram' }, { slug, html, title, subdomain: 'ram' });
  let parsed;
  try { parsed = JSON.parse(res.body); } catch(e) { parsed = {}; }
  if (res.status === 200 && parsed.url) console.log('✓', slug, '→', parsed.url);
  else console.log('✗', slug, res.status, res.body.slice(0,200));
  return parsed;
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HAVEN — Your city, curated.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F8F5EF;
  --surface:#FFFFFF;
  --surface2:#F2EEE8;
  --text:#1A1410;
  --muted:rgba(26,20,16,0.54);
  --dim:rgba(26,20,16,0.28);
  --forest:#2C5F3A;
  --forest-soft:#4A8B5A;
  --forest-dim:rgba(44,95,58,0.10);
  --gold:#B8922E;
  --gold-soft:#D4AA48;
  --gold-dim:rgba(184,146,46,0.12);
  --terra:#C4714A;
  --border:rgba(30,23,14,0.08);
  --border2:rgba(30,23,14,0.14);
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:rgba(248,245,239,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.logo{font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:600;letter-spacing:0.06em;color:var(--text)}
.logo span{color:var(--forest)}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-link{font-size:13px;color:var(--muted);text-decoration:none;letter-spacing:0.02em;transition:color .2s}
.nav-link:hover{color:var(--text)}
.btn-nav{background:var(--forest);color:#fff;border:none;padding:9px 22px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;letter-spacing:0.05em;transition:opacity .2s}
.btn-nav:hover{opacity:.85}

/* HERO */
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:center;padding:120px 48px 80px;position:relative;overflow:hidden;background:var(--bg)}
.hero-bg{position:absolute;inset:0;z-index:0}
.hero-bg-dot{position:absolute;border-radius:50%;background:var(--forest-dim);filter:blur(80px)}
.hero-content{position:relative;z-index:1;padding-right:48px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:var(--forest-dim);border-radius:20px;margin-bottom:28px}
.eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--forest)}
.eyebrow-text{font-size:11px;font-weight:600;color:var(--forest);letter-spacing:0.09em;text-transform:uppercase}
h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(42px,5vw,64px);font-weight:400;line-height:1.1;color:var(--text);margin-bottom:24px}
h1 em{font-style:italic;color:var(--forest)}
.hero-sub{font-size:17px;font-weight:400;color:var(--muted);line-height:1.65;max-width:440px;margin-bottom:40px}
.hero-actions{display:flex;gap:14px;align-items:center}
.btn-primary{background:var(--forest);color:#fff;border:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:0.03em;transition:all .2s;text-decoration:none}
.btn-primary:hover{opacity:.87;transform:translateY(-1px)}
.btn-secondary{background:transparent;color:var(--text);border:1.5px solid var(--border2);padding:13px 24px;border-radius:10px;font-size:14px;font-weight:400;cursor:pointer;letter-spacing:0.02em;transition:all .2s;text-decoration:none}
.btn-secondary:hover{border-color:var(--text)}
.hero-trust{margin-top:52px;display:flex;align-items:center;gap:16px}
.trust-avatars{display:flex}
.trust-av{width:28px;height:28px;border-radius:50%;background:var(--surface2);border:2px solid var(--bg);margin-left:-8px}
.trust-av:first-child{margin-left:0}
.trust-av-1{background:#8AA898}
.trust-av-2{background:#B8A07C}
.trust-av-3{background:#9AACBA}
.trust-av-4{background:#C4987A}
.trust-text{font-size:12px;color:var(--muted)}
.trust-text strong{color:var(--text)}

/* Phone mockup area */
.hero-visual{position:relative;z-index:1;display:flex;justify-content:center;align-items:center}
.phone-wrap{position:relative;width:280px}
.phone-shadow{position:absolute;bottom:-30px;left:50%;transform:translateX(-50%);width:180px;height:40px;background:rgba(44,95,58,0.15);border-radius:50%;filter:blur(20px)}
.phone-frame{width:280px;height:568px;background:var(--surface);border-radius:40px;border:2px solid var(--border2);overflow:hidden;box-shadow:0 32px 80px rgba(26,20,16,0.14),0 8px 24px rgba(26,20,16,0.08);position:relative}
.phone-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:100px;height:28px;background:var(--bg);border-radius:0 0 18px 18px;z-index:10}
.phone-inner{height:100%;display:flex;flex-direction:column}
/* Status bar */
.p-status{height:36px;background:var(--bg);display:flex;align-items:center;justify-content:space-between;padding:28px 18px 0;flex-shrink:0}
.p-time{font-size:11px;font-weight:600;color:var(--text)}
.p-icons{font-size:9px;color:var(--muted)}
/* Scroll area */
.p-scroll{flex:1;overflow:hidden;background:var(--bg);padding:8px 12px 0}
.p-greeting{font-size:8px;color:var(--muted);margin-bottom:2px}
.p-date{font-family:'Playfair Display',Georgia,serif;font-size:13px;color:var(--text);margin-bottom:10px}
/* Hero card */
.p-card{border-radius:10px;overflow:hidden;margin-bottom:10px;position:relative;height:106px}
.p-card-img{width:100%;height:100%;background:linear-gradient(135deg,#B8A07C,#8A7050)}
.p-card-overlay{position:absolute;bottom:0;left:0;right:0;height:50px;background:linear-gradient(to top,rgba(0,0,0,0.6),transparent);padding:8px}
.p-card-name{font-size:9px;font-weight:700;color:rgba(255,255,255,0.97)}
.p-card-sub{font-size:7px;color:rgba(255,255,255,0.72)}
.p-card-badge{position:absolute;top:7px;left:7px;background:var(--gold);color:#fff;font-size:6px;font-weight:700;padding:2px 6px;border-radius:6px;letter-spacing:0.06em}
.p-card-cta{position:absolute;top:7px;right:7px;background:rgba(255,255,255,0.2);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:7px;font-weight:600;padding:3px 8px;border-radius:8px}
/* Carousel row */
.p-label{font-size:7px;font-weight:700;color:var(--dim);letter-spacing:0.08em;margin-bottom:6px}
.p-carousel{display:flex;gap:6px;overflow:hidden;margin-bottom:10px}
.p-c-card{flex-shrink:0;width:88px;height:74px;border-radius:8px;overflow:hidden;position:relative}
.p-c-img-1{background:linear-gradient(135deg,#8AA898,#5A7A68)}
.p-c-img-2{background:linear-gradient(135deg,#9AACBA,#6A8A9A)}
.p-c-img-3{background:linear-gradient(135deg,#C4987A,#9A6A50)}
.p-c-overlay{position:absolute;bottom:0;left:0;right:0;padding:5px;background:linear-gradient(to top,rgba(0,0,0,0.5),transparent)}
.p-c-name{font-size:7px;font-weight:700;color:rgba(255,255,255,0.95)}
.p-c-sub{font-size:6px;color:rgba(255,255,255,0.7)}
.p-c-badge{position:absolute;top:4px;left:4px;background:rgba(255,255,255,0.9);color:var(--text);font-size:5.5px;font-weight:700;padding:1px 5px;border-radius:4px}
/* Upcoming */
.p-upcoming{background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:8px 10px;border-left:3px solid var(--forest)}
.p-up-label{font-size:6px;font-weight:700;color:var(--gold);letter-spacing:0.08em;margin-bottom:2px}
.p-up-venue{font-family:'Playfair Display',Georgia,serif;font-size:10px;color:var(--text)}
.p-up-detail{font-size:7px;color:var(--muted)}
/* Nav */
.p-nav{height:44px;background:var(--surface);border-top:1px solid var(--border);display:flex;flex-shrink:0}
.p-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.p-nav-icon{font-size:13px;color:var(--dim)}
.p-nav-icon.active{color:var(--forest)}
.p-nav-label{font-size:6px;color:var(--dim);letter-spacing:0.03em}
.p-nav-label.active{color:var(--forest);font-weight:700}
.p-nav-line{position:absolute;bottom:0;width:20px;height:1.5px;background:var(--forest);border-radius:1px}
.p-nav-item-wrap{position:relative;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}

/* PILLS */
.pills-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px}
.pill{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:20px;border:1px solid var(--border2);font-size:12px;color:var(--muted)}
.pill-dot{width:8px;height:8px;border-radius:50%}

/* FEATURES */
.features{padding:100px 48px;background:var(--surface)}
.features-eyebrow{font-size:11px;font-weight:600;color:var(--forest);letter-spacing:0.09em;text-transform:uppercase;text-align:center;margin-bottom:12px}
.features-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:400;text-align:center;margin-bottom:16px;color:var(--text)}
.features-sub{font-size:16px;color:var(--muted);text-align:center;max-width:520px;margin:0 auto 64px;line-height:1.65}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto}
.feature-card{background:var(--bg);border-radius:16px;padding:32px 28px;border:1px solid var(--border)}
.feat-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:20px}
.feat-icon-1{background:var(--forest-dim)}
.feat-icon-2{background:var(--gold-dim)}
.feat-icon-3{background:rgba(196,113,74,0.10)}
.feature-card h3{font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:400;margin-bottom:10px;color:var(--text)}
.feature-card p{font-size:14px;color:var(--muted);line-height:1.65}

/* EDITORIAL STRIP */
.editorial{padding:80px 48px;background:var(--bg);overflow:hidden}
.ed-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(28px,3.5vw,42px);font-weight:400;margin-bottom:32px;color:var(--text)}
.ed-title em{font-style:italic;color:var(--forest)}
.ed-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:16px;max-width:1100px}
.ed-card{border-radius:16px;overflow:hidden;position:relative}
.ed-img-1{height:280px;background:linear-gradient(135deg,#B8A07C 0%,#8A6040 100%)}
.ed-img-2{height:280px;background:linear-gradient(135deg,#8AA898 0%,#5A7A68 100%)}
.ed-img-3{height:280px;background:linear-gradient(135deg,#9AACBA 0%,#6A8A9A 100%)}
.ed-overlay{position:absolute;bottom:0;left:0;right:0;height:120px;background:linear-gradient(to top,rgba(0,0,0,0.65),transparent);padding:20px}
.ed-tag{display:inline-block;background:var(--gold);color:#fff;font-size:9px;font-weight:700;letter-spacing:0.08em;padding:3px 10px;border-radius:6px;margin-bottom:8px}
.ed-name{font-family:'Playfair Display',Georgia,serif;font-size:18px;color:rgba(255,255,255,0.97);margin-bottom:4px}
.ed-sub{font-size:11px;color:rgba(255,255,255,0.7)}

/* CONCIERGE */
.concierge{padding:100px 48px;background:var(--forest)}
.conc-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.conc-content .eyebrow-text{color:rgba(255,255,255,0.6)}
.conc-content .eyebrow{background:rgba(255,255,255,0.1)}
.conc-content .eyebrow-dot{background:rgba(255,255,255,0.6)}
.conc-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:400;color:#FFFFFF;margin-bottom:20px;line-height:1.15}
.conc-title em{font-style:italic;color:var(--gold-soft)}
.conc-sub{font-size:16px;color:rgba(255,255,255,0.65);line-height:1.65;margin-bottom:36px;max-width:440px}
.conc-btn{background:rgba(255,255,255,0.95);color:var(--forest);border:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:0.03em;text-decoration:none;display:inline-block}
/* Chat preview */
.chat-preview{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:20px}
.chat-msg{margin-bottom:14px}
.chat-msg.user{display:flex;justify-content:flex-end}
.chat-bubble{padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.5;max-width:78%}
.chat-bubble.user{background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.92)}
.chat-bubble.ai{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8);display:flex;align-items:flex-start;gap:10px}
.chat-avatar{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.chat-bubble-text{font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82)}
.chat-typing{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(255,255,255,0.08);border-radius:14px;width:fit-content;margin-top:8px}
.dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);animation:pulse 1.4s ease-in-out infinite}
.dot:nth-child(2){animation-delay:.2s}
.dot:nth-child(3){animation-delay:.4s}
@keyframes pulse{0%,80%,100%{opacity:.4}40%{opacity:1}}

/* MEMBERSHIP */
.membership{padding:80px 48px;background:var(--surface);text-align:center}
.mem-card{display:inline-block;background:var(--forest);border-radius:24px;padding:40px 48px;margin:40px auto;text-align:left;min-width:340px;position:relative;overflow:hidden}
.mem-bg-circle{position:absolute;right:-40px;top:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.06)}
.mem-brand{font-family:'Playfair Display',Georgia,serif;font-size:22px;color:rgba(255,255,255,0.9);margin-bottom:6px;letter-spacing:0.04em}
.mem-tier{display:inline-block;background:rgba(184,146,46,0.3);color:var(--gold-soft);font-size:9px;font-weight:700;letter-spacing:0.12em;padding:3px 10px;border-radius:6px;margin-bottom:28px}
.mem-name{font-family:'Playfair Display',Georgia,serif;font-size:16px;color:rgba(255,255,255,0.95);margin-bottom:4px}
.mem-since{font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:20px}
.mem-points-val{font-family:'Playfair Display',Georgia,serif;font-size:24px;color:var(--gold-soft)}
.mem-points-label{font-size:11px;color:rgba(255,255,255,0.5)}
.mem-pan{font-size:12px;color:rgba(255,255,255,0.35);letter-spacing:0.12em;margin-top:20px}

/* CTA */
.cta{padding:100px 48px;background:var(--bg);text-align:center}
.cta-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(36px,4.5vw,56px);font-weight:400;margin-bottom:20px;color:var(--text)}
.cta-title em{font-style:italic;color:var(--forest)}
.cta-sub{font-size:16px;color:var(--muted);margin-bottom:40px;max-width:440px;margin-left:auto;margin-right:auto;line-height:1.65}
.cta-actions{display:flex;gap:14px;justify-content:center;align-items:center}

/* FOOTER */
footer{padding:40px 48px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.footer-logo{font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:600;color:var(--text);letter-spacing:0.06em}
.footer-text{font-size:12px;color:var(--dim)}

@media(max-width:768px){
  .hero{grid-template-columns:1fr;padding:100px 24px 60px}
  .hero-content{padding-right:0}
  .hero-visual{margin-top:40px}
  .features-grid{grid-template-columns:1fr}
  .ed-grid{grid-template-columns:1fr}
  .conc-inner{grid-template-columns:1fr}
  footer{flex-direction:column;gap:12px;text-align:center}
}
</style>
</head>
<body>

<nav>
  <div class="logo">H<span>A</span>VEN</div>
  <div class="nav-links">
    <a href="#features" class="nav-link">Features</a>
    <a href="#concierge" class="nav-link">Concierge</a>
    <a href="#membership" class="nav-link">Membership</a>
  </div>
  <button class="btn-nav">Request Access</button>
</nav>

<section class="hero">
  <div class="hero-bg">
    <div class="hero-bg-dot" style="width:500px;height:500px;right:-100px;top:-100px;background:rgba(44,95,58,0.07)"></div>
    <div class="hero-bg-dot" style="width:300px;height:300px;left:10%;bottom:10%;background:rgba(184,146,46,0.06)"></div>
  </div>
  <div class="hero-content">
    <div class="eyebrow">
      <div class="eyebrow-dot"></div>
      <span class="eyebrow-text">Premium Urban Concierge</span>
    </div>
    <h1>Your city,<br><em>curated</em><br>just for you.</h1>
    <p class="hero-sub">Dining reservations at the impossible tables. Front-row experiences. AI concierge on call. HAVEN puts the full texture of city life at your fingertips.</p>
    <div class="pills-row">
      <div class="pill"><div class="pill-dot" style="background:var(--forest)"></div>Michelin dining</div>
      <div class="pill"><div class="pill-dot" style="background:var(--gold)"></div>Exclusive events</div>
      <div class="pill"><div class="pill-dot" style="background:var(--terra)"></div>AI concierge</div>
    </div>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Request Early Access</a>
      <a href="https://ram.zenbin.org/haven-mock" class="btn-secondary">View prototype →</a>
    </div>
    <div class="hero-trust">
      <div class="trust-avatars">
        <div class="trust-av trust-av-1"></div>
        <div class="trust-av trust-av-2"></div>
        <div class="trust-av trust-av-3"></div>
        <div class="trust-av trust-av-4"></div>
      </div>
      <div class="trust-text"><strong>2,800+</strong> founding members in NYC, London & LA</div>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-wrap">
      <div class="phone-shadow"></div>
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-inner">
          <div class="p-status">
            <span class="p-time">9:41</span>
            <span class="p-icons">◈ ◈ ◈</span>
          </div>
          <div class="p-scroll">
            <div class="p-greeting">Good morning, James.</div>
            <div class="p-date">Friday, April 3</div>
            <div class="p-card">
              <div class="p-card-img"></div>
              <div class="p-card-overlay">
                <div class="p-card-name">Eleven Madison Park</div>
                <div class="p-card-sub">Michelin ★★★ · Flatiron</div>
              </div>
              <div class="p-card-badge">DINING</div>
              <div class="p-card-cta">Reserve →</div>
            </div>
            <div class="p-label">CURATED FOR YOU</div>
            <div class="p-carousel">
              <div class="p-c-card">
                <div class="p-c-img-1" style="width:100%;height:100%"></div>
                <div class="p-c-overlay">
                  <div class="p-c-name">Sommelier Bar</div>
                  <div class="p-c-sub">Wine · SoHo</div>
                </div>
                <div class="p-c-badge">TONIGHT</div>
              </div>
              <div class="p-c-card">
                <div class="p-c-img-2" style="width:100%;height:100%"></div>
                <div class="p-c-overlay">
                  <div class="p-c-name">The Aviary</div>
                  <div class="p-c-sub">Cocktails</div>
                </div>
                <div class="p-c-badge">★ 4.9</div>
              </div>
              <div class="p-c-card" style="width:60px;overflow:hidden">
                <div class="p-c-img-3" style="width:88px;height:100%"></div>
              </div>
            </div>
            <div class="p-upcoming">
              <div class="p-up-label">TONIGHT · 8:00 PM</div>
              <div class="p-up-venue">Atomix</div>
              <div class="p-up-detail">Korean Fine Dining · 2 guests</div>
            </div>
          </div>
          <div class="p-nav">
            <div class="p-nav-item-wrap">
              <span class="p-nav-icon active">⌂</span>
              <span class="p-nav-label active">Today</span>
              <div class="p-nav-line"></div>
            </div>
            <div class="p-nav-item-wrap">
              <span class="p-nav-icon">⊞</span>
              <span class="p-nav-label">Discover</span>
            </div>
            <div class="p-nav-item-wrap">
              <span class="p-nav-icon">◫</span>
              <span class="p-nav-label">Reserve</span>
            </div>
            <div class="p-nav-item-wrap">
              <span class="p-nav-icon">⌭</span>
              <span class="p-nav-label">Concierge</span>
            </div>
            <div class="p-nav-item-wrap">
              <span class="p-nav-icon">◯</span>
              <span class="p-nav-label">Profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="features-eyebrow">What HAVEN does</div>
  <h2 class="features-title">Every layer of the city,<br>unlocked.</h2>
  <p class="features-sub">From the table that opens up at 9pm on a Friday to the backstage pass you never knew existed — HAVEN sees it all.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feat-icon feat-icon-1">🍽</div>
      <h3>Primetime Dining</h3>
      <p>Access to last-minute tables at the city's most sought-after restaurants, plus standing reservations at your regulars. Michelin to neighborhood gem.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon feat-icon-2">🎭</div>
      <h3>Exclusive Experiences</h3>
      <p>Backstage passes, front-row seats, private chef dinners, rooftop film screenings. Experiences you can't find on any ticketing platform.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon feat-icon-3">⌭</div>
      <h3>AI Concierge</h3>
      <p>Text your concierge anything — restaurant ideas for a birthday, a hotel for the weekend, the best spa before a big meeting. Done in seconds.</p>
    </div>
  </div>
</section>

<section class="editorial">
  <h2 class="ed-title">Curated by taste,<br>not by algorithm. <em>Yours.</em></h2>
  <div class="ed-grid">
    <div class="ed-card">
      <div class="ed-img-1"></div>
      <div class="ed-overlay">
        <div class="ed-tag">DINING</div>
        <div class="ed-name">Bâtard</div>
        <div class="ed-sub">French-American · Tribeca · ★★</div>
      </div>
    </div>
    <div class="ed-card">
      <div class="ed-img-2"></div>
      <div class="ed-overlay">
        <div class="ed-tag">EXPERIENCE</div>
        <div class="ed-name">Jazz at Lincoln Center</div>
        <div class="ed-sub">Tonight 8pm · Limited seats</div>
      </div>
    </div>
    <div class="ed-card">
      <div class="ed-img-3"></div>
      <div class="ed-overlay">
        <div class="ed-tag">WELLNESS</div>
        <div class="ed-name">Brooklyn Roof Garden</div>
        <div class="ed-sub">Sat morning · Guided tour</div>
      </div>
    </div>
  </div>
</section>

<section class="concierge" id="concierge">
  <div class="conc-inner">
    <div class="conc-content">
      <div class="eyebrow" style="margin-bottom:28px">
        <div class="eyebrow-dot"></div>
        <span class="eyebrow-text">AI Concierge</span>
      </div>
      <h2 class="conc-title">Ask anything.<br><em>Get it done.</em></h2>
      <p class="conc-sub">Your HAVEN concierge is always on — no phone trees, no hold music. Just type what you need. Reservations confirmed, experiences booked, recommendations delivered.</p>
      <a href="#" class="conc-btn">Try the concierge</a>
    </div>
    <div class="chat-preview">
      <div class="chat-msg user">
        <div class="chat-bubble user">Can you get me a table for two at Atomix this Saturday? Preferably 7:30.</div>
      </div>
      <div class="chat-msg">
        <div class="chat-bubble ai">
          <div class="chat-avatar">⌭</div>
          <div class="chat-bubble-text">On it, James. Atomix has availability at 7:30 PM for 2 guests this Saturday. Shall I confirm?</div>
        </div>
      </div>
      <div class="chat-msg user">
        <div class="chat-bubble user">Yes — it's a birthday dinner.</div>
      </div>
      <div class="chat-msg">
        <div class="chat-bubble ai">
          <div class="chat-avatar">⌭</div>
          <div class="chat-bubble-text">Done ✓ Atomix, Sat April 5 at 7:30 PM, 2 guests. Birthday noted. Confirmation sent to your email.</div>
        </div>
      </div>
      <div class="chat-typing">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
    </div>
  </div>
</section>

<section class="membership" id="membership">
  <div style="max-width:600px;margin:0 auto">
    <div class="features-eyebrow">Membership</div>
    <h2 class="features-title">One card.<br>The whole city.</h2>
    <p class="features-sub">HAVEN membership unlocks concierge access, dining privileges, exclusive event access, and a growing library of urban benefits.</p>
  </div>
  <div class="mem-card">
    <div class="mem-bg-circle"></div>
    <div class="mem-brand">HAVEN</div>
    <div class="mem-tier">OBSIDIAN</div><br>
    <div class="mem-name">James Whitfield</div>
    <div class="mem-since">Member since 2021 · Concierge Access</div>
    <div class="mem-points-val">4,720</div>
    <div class="mem-points-label">Haven Points</div>
    <div class="mem-pan">◉◉◉◉ ◉◉◉◉ ◉◉◉◉  8821</div>
  </div>
  <p class="features-sub" style="margin-top:16px">Starting at <strong style="color:var(--text)">$350/month</strong> · Invite only</p>
</section>

<section class="cta">
  <h2 class="cta-title">Ready to live<br>in <em>the city</em>?</h2>
  <p class="cta-sub">Join the waitlist. We're accepting founding members in New York, London, and Los Angeles.</p>
  <div class="cta-actions">
    <a href="#" class="btn-primary">Request Early Access</a>
    <a href="https://ram.zenbin.org/haven-mock" class="btn-secondary">See the prototype</a>
  </div>
</section>

<footer>
  <div class="footer-logo">HAVEN</div>
  <div class="footer-text">© 2026 HAVEN. By invitation only. · Designed by RAM</div>
</footer>

</body>
</html>`;

async function main() {
  console.log('Publishing HAVEN design…');

  // Hero page
  await pub(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);

  // Viewer
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const penJson = fs.readFileSync('/workspace/group/design-studio/haven.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  await pub(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);

  console.log('Done!');
}

main().catch(console.error);
