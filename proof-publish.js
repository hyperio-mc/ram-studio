'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG    = 'proof';
const HOST    = 'zenbin.org';
const SUB     = 'ram';

function publish(slug, html, title, subdomain = SUB) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const req = https.request({
      hostname: HOST, port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, 'proof.pen'), 'utf8');

// ── HERO HTML ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PROOF — Customer Impact Stories</title>
<meta name="description" content="A B2B case study platform where real customer outcomes do the talking. Light editorial design.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Georgia&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#FAFAF7;--surface:#FFFFFF;--surface2:#F2EEE8;--surface3:#E8E2D8;
  --border:#E3DDD6;--border2:#CCC6BC;
  --text:#0E1523;--text2:#364155;--text3:#7E8BA3;
  --accent:#1A4FDB;--accent2:#059669;--accent3:#7C3AED;--gold:#D97706;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;overflow-x:hidden;line-height:1.6}

/* NAV */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 32px;height:64px;
  background:rgba(250,250,247,0.92);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--border);
}
.nav-logo{display:flex;align-items:center;gap:10px;}
.logo-mark{
  width:36px;height:36px;border-radius:9px;
  background:var(--accent);display:flex;align-items:center;justify-content:center;
  color:white;font-weight:900;font-size:18px;
}
.logo-text{font-size:17px;font-weight:800;letter-spacing:1.5px;}
.nav-links{display:flex;gap:28px;}
.nav-links a{text-decoration:none;color:var(--text2);font-size:14px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--accent)}
.nav-cta{
  background:var(--accent);color:white;border:none;border-radius:20px;
  padding:10px 22px;font-size:14px;font-weight:600;cursor:pointer;
  text-decoration:none;transition:opacity .2s;
}
.nav-cta:hover{opacity:.85}

/* TICKER */
.ticker-wrap{background:var(--text);overflow:hidden;height:40px;display:flex;align-items:center;}
.ticker{display:flex;gap:64px;white-space:nowrap;animation:ticker 28s linear infinite;}
.ticker-item{font-size:13px;color:rgba(255,255,255,.85);font-weight:500;display:flex;align-items:center;gap:8px;}
.up{color:#34d399;font-size:11px;}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* HERO */
.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:140px 32px 80px;text-align:center;
}
.eyebrow{
  display:inline-block;background:var(--accent2);color:white;
  border-radius:20px;padding:6px 16px;
  font-size:12px;font-weight:700;letter-spacing:1.2px;margin-bottom:28px;
}
h1{
  font-family:Georgia,'Times New Roman',serif;
  font-size:clamp(42px,8vw,80px);font-weight:800;
  line-height:1.1;letter-spacing:-2px;max-width:820px;margin-bottom:28px;
}
h1 em{color:var(--accent);font-style:normal;}
.hero-sub{font-size:18px;color:var(--text2);max-width:540px;margin-bottom:44px;line-height:1.7;}
.hero-ctas{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;}
.btn-primary{
  background:var(--accent);color:white;border:none;border-radius:28px;
  padding:14px 32px;font-size:16px;font-weight:700;cursor:pointer;
  text-decoration:none;transition:transform .2s,opacity .2s;display:inline-flex;align-items:center;gap:8px;
}
.btn-primary:hover{transform:translateY(-2px);opacity:.9}
.btn-secondary{
  background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:28px;
  padding:14px 32px;font-size:16px;font-weight:600;cursor:pointer;
  text-decoration:none;transition:transform .2s,border-color .2s;display:inline-flex;align-items:center;gap:8px;
}
.btn-secondary:hover{transform:translateY(-2px);border-color:var(--accent);color:var(--accent)}

/* STATS BAR */
.stats-bar{
  background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);
  padding:40px 32px;display:flex;justify-content:center;gap:80px;flex-wrap:wrap;
}
.stat{text-align:center;}
.stat-val{font-size:40px;font-weight:800;color:var(--accent);font-family:Georgia,serif;line-height:1;}
.stat-label{font-size:13px;color:var(--text3);margin-top:6px;font-weight:500;}

/* SECTIONS */
.section{padding:80px 32px;max-width:1100px;margin:0 auto;}
.sec-eyebrow{font-size:11px;font-weight:700;letter-spacing:1.8px;color:var(--text3);margin-bottom:16px;text-transform:uppercase;}
h2{
  font-family:Georgia,serif;font-size:clamp(28px,4vw,42px);font-weight:800;
  line-height:1.2;letter-spacing:-1px;margin-bottom:40px;
}

/* FEATURED CARD */
.featured-card{
  background:var(--accent);border-radius:20px;padding:48px;
  display:grid;grid-template-columns:1fr auto;gap:40px;align-items:start;
  margin-bottom:32px;position:relative;overflow:hidden;
}
.featured-card::before{
  content:'';position:absolute;top:0;right:0;width:300px;height:100%;
  background:linear-gradient(135deg,transparent,rgba(255,255,255,.07));
  border-radius:0 20px 20px 0;
}
.fc-cat{
  display:inline-block;border:1px solid rgba(255,255,255,.4);border-radius:20px;
  padding:5px 14px;font-size:11px;font-weight:700;letter-spacing:1px;
  color:rgba(255,255,255,.85);margin-bottom:20px;
}
.fc-title{
  font-family:Georgia,serif;font-size:clamp(22px,3vw,32px);font-weight:800;
  color:white;line-height:1.3;margin-bottom:16px;
}
.fc-meta{font-size:13px;color:rgba(255,255,255,.65);}
.fc-metric{
  background:rgba(255,255,255,.15);border-radius:14px;padding:20px 28px;
  text-align:center;min-width:120px;
}
.fc-metric-val{font-size:42px;font-weight:900;color:white;line-height:1;}
.fc-metric-label{font-size:12px;color:rgba(255,255,255,.75);margin-top:6px;}

/* STORY GRID */
.story-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;}
.story-card{
  background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;
  transition:transform .25s,box-shadow .25s,border-color .25s;
}
.story-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(14,21,35,.1);border-color:var(--accent);}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.card-cat{font-size:11px;font-weight:700;letter-spacing:.8px;padding:4px 12px;border-radius:20px;border:1px solid currentColor;}
.card-logo{
  width:36px;height:36px;border-radius:8px;background:var(--surface2);
  border:1px solid var(--border);display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:14px;color:var(--text2);
}
.card-title{font-family:Georgia,serif;font-size:16px;font-weight:700;line-height:1.4;margin-bottom:16px;color:var(--text);}
.card-metric{font-size:26px;font-weight:900;margin-bottom:4px;}
.card-metric-label{font-size:12px;color:var(--text3);}
.card-footer{
  display:flex;justify-content:space-between;align-items:center;
  padding-top:14px;margin-top:14px;border-top:1px solid var(--border);
}
.card-company{font-size:12px;font-weight:600;color:var(--text2);}
.card-readtime{font-size:12px;color:var(--text3);}

/* PULL QUOTE */
.quote-section{
  padding:80px 32px;background:var(--surface);
  border-top:1px solid var(--border);border-bottom:1px solid var(--border);text-align:center;
}
.big-quote{
  font-family:Georgia,serif;font-size:clamp(20px,3vw,28px);font-weight:700;
  line-height:1.5;max-width:720px;margin:0 auto 24px;color:var(--text);
}
.big-quote::before{content:'"';color:var(--accent);font-size:3em;line-height:0;vertical-align:-.4em;}
.big-quote::after{content:'"';color:var(--accent);font-size:3em;line-height:0;vertical-align:-.4em;}
.quote-attr{font-size:14px;color:var(--text3);font-weight:500;}

/* BEFORE/AFTER */
.ba-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;}
.ba-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
.ba-header{padding:18px 20px 14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border);}
.ba-logo{
  width:32px;height:32px;border-radius:8px;background:var(--surface2);
  display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;
}
.ba-company{font-size:14px;font-weight:700;}
.ba-metric-label{font-size:11px;color:var(--text3);}
.ba-row{display:grid;grid-template-columns:1fr 1fr;}
.ba-col{padding:16px 20px;border-right:1px solid var(--border);}
.ba-col:last-child{border-right:none;}
.ba-col-label{font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:6px;}
.ba-val{font-size:22px;font-weight:900;}

/* CTA */
.cta-section{padding:100px 32px;text-align:center;}
.cta-section h2{margin-bottom:16px;}
.cta-section p{color:var(--text2);max-width:480px;margin:0 auto 40px;font-size:17px;}
.cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}

/* INSPIRATION */
.inspiration{
  max-width:760px;margin:0 auto 80px;padding:32px 40px;
  background:var(--surface);border:1px solid var(--border);border-radius:20px;position:relative;
}
.ins-top{position:absolute;top:0;left:40px;right:40px;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);}
.ins-label{font-size:9px;font-weight:700;letter-spacing:2.5px;color:var(--text3);text-transform:uppercase;margin-bottom:12px;}
.inspiration p{font-size:14px;color:var(--text2);line-height:1.7;}
.inspiration p strong{color:var(--accent);font-weight:600;}

/* PALETTE */
.palette-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;max-width:800px;margin:0 auto 80px;padding:0 24px;}
.swatch{display:flex;flex-direction:column;align-items:center;gap:8px;}
.swatch-dot{width:48px;height:48px;border-radius:12px;border:1px solid var(--border);}
.swatch-label{font-size:10px;color:var(--text3);}

/* FOOTER */
footer{background:var(--text);padding:40px 32px;text-align:center;color:rgba(255,255,255,.5);font-size:13px;}
footer a{color:rgba(255,255,255,.7);text-decoration:none;}
footer a:hover{color:white;}

@media(max-width:640px){
  nav .nav-links{display:none;}
  .featured-card{grid-template-columns:1fr;}
  .stats-bar{gap:40px;}
  .section{padding:60px 20px;}
  .inspiration{margin:0 20px 60px;padding:24px;}
}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">
    <div class="logo-mark">P</div>
    <span class="logo-text">PROOF</span>
  </div>
  <div class="nav-links">
    <a href="#stories">Stories</a>
    <a href="#metrics">Metrics</a>
    <a href="#compare">Compare</a>
  </div>
  <a href="/proof-viewer" class="nav-cta">View Design →</a>
</nav>

<!-- TICKER -->
<div class="ticker-wrap" style="margin-top:64px">
  <div class="ticker">
    <div class="ticker-item"><span class="up">↑</span> Ramp reduced fraud 94% in Q4 2025</div>
    <div class="ticker-item"><span class="up">↑</span> Notion grew self-serve ARR 340%</div>
    <div class="ticker-item"><span class="up">↑</span> FlightHub cut chargebacks 78%</div>
    <div class="ticker-item"><span class="up">↑</span> Linear scaled to 50K teams</div>
    <div class="ticker-item"><span class="up">↑</span> Tebex slashed fraud review time 94%</div>
    <div class="ticker-item"><span class="up">↑</span> Vercel deploys 500M functions/day</div>
    <div class="ticker-item"><span class="up">↑</span> Ramp reduced fraud 94% in Q4 2025</div>
    <div class="ticker-item"><span class="up">↑</span> Notion grew self-serve ARR 340%</div>
    <div class="ticker-item"><span class="up">↑</span> FlightHub cut chargebacks 78%</div>
    <div class="ticker-item"><span class="up">↑</span> Linear scaled to 50K teams</div>
    <div class="ticker-item"><span class="up">↑</span> Tebex slashed fraud review time 94%</div>
    <div class="ticker-item"><span class="up">↑</span> Vercel deploys 500M functions/day</div>
  </div>
</div>

<!-- HERO -->
<section class="hero">
  <div class="eyebrow">✦ 2,400+ VERIFIED CUSTOMER STORIES</div>
  <h1>Real outcomes. <em>Real proof.</em></h1>
  <p class="hero-sub">Browse 2,400 verified B2B customer stories. Find the exact case study that matches your industry, company size, and desired outcome — before you sign the contract.</p>
  <div class="hero-ctas">
    <a href="/proof-viewer" class="btn-primary">Explore the Design →</a>
    <a href="/proof-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- STATS -->
<div class="stats-bar">
  <div class="stat"><div class="stat-val">2,400+</div><div class="stat-label">Verified customer stories</div></div>
  <div class="stat"><div class="stat-val">−68%</div><div class="stat-label">Avg. fraud reduction, year 1</div></div>
  <div class="stat"><div class="stat-val">8.4×</div><div class="stat-label">Average ROI documented</div></div>
  <div class="stat"><div class="stat-val">340%</div><div class="stat-label">Top ARR growth story</div></div>
</div>

<!-- INSPIRATION -->
<div class="section" style="padding-bottom:0">
  <div class="inspiration">
    <div class="ins-top"></div>
    <p class="ins-label">Design Inspiration</p>
    <p>Directly inspired by <strong>Evervault's customer stories page</strong> (featured on godly.website, Apr 2026) — editorial layout with large serif display type, stacked company story cards, category labeling, and bold metric callouts embedded in prose. Combined with the impact-forward aesthetic of <strong>Champions For Good</strong> (Awwwards, Apr 2026) — cause-driven, outcomes-first storytelling translated into a B2B buyer research tool.</p>
  </div>
</div>

<!-- FEATURED STORY -->
<div class="section" id="stories">
  <div class="sec-eyebrow">Featured Story</div>
  <h2>Leading companies document their outcomes</h2>
  <div class="featured-card">
    <div>
      <div class="fc-cat">FRAUD PREVENTION</div>
      <div class="fc-title">How Ramp cut payment fraud by 94% using real-time vault isolation</div>
      <div class="fc-meta">Ramp · Revenue Operations · 8 min read · Updated March 2026</div>
    </div>
    <div class="fc-metric">
      <div class="fc-metric-val">94%</div>
      <div class="fc-metric-label">fraud ↓</div>
    </div>
  </div>
  <div class="story-grid">
    <div class="story-card">
      <div class="card-header">
        <span class="card-cat" style="color:#059669">REVENUE</span>
        <div class="card-logo">N</div>
      </div>
      <div class="card-title">Notion grew self-serve revenue 340% in 18 months without sales headcount</div>
      <div class="card-metric" style="color:#059669">+340%</div>
      <div class="card-metric-label">self-serve ARR</div>
      <div class="card-footer"><span class="card-company">Notion</span><span class="card-readtime">6 min read</span></div>
    </div>
    <div class="story-card">
      <div class="card-header">
        <span class="card-cat" style="color:#7C3AED">SECURITY</span>
        <div class="card-logo">F</div>
      </div>
      <div class="card-title">FlightHub uses 3D-Secure to cut fraud and expand safely into new markets</div>
      <div class="card-metric" style="color:#7C3AED">−78%</div>
      <div class="card-metric-label">chargeback rate</div>
      <div class="card-footer"><span class="card-company">FlightHub</span><span class="card-readtime">5 min read</span></div>
    </div>
    <div class="story-card">
      <div class="card-header">
        <span class="card-cat" style="color:#1A4FDB">SCALE</span>
        <div class="card-logo">L</div>
      </div>
      <div class="card-title">Linear scales to 50,000 engineering teams without adding DevOps headcount</div>
      <div class="card-metric" style="color:#1A4FDB">50K</div>
      <div class="card-metric-label">teams served</div>
      <div class="card-footer"><span class="card-company">Linear</span><span class="card-readtime">4 min read</span></div>
    </div>
  </div>
</div>

<!-- PULL QUOTE -->
<div class="quote-section">
  <div class="big-quote">We went from 2-day fraud review cycles to real-time decisions. The vault model changed everything.</div>
  <div class="quote-attr">Sarah Chen, CRO at Ramp</div>
</div>

<!-- BEFORE/AFTER -->
<div class="section" id="metrics">
  <div class="sec-eyebrow">Metrics Explorer</div>
  <h2>Before vs. After — real numbers</h2>
  <div class="ba-grid">
    <div class="ba-card">
      <div class="ba-header"><div class="ba-logo" style="color:#1A4FDB">R</div><div><div class="ba-company">Ramp</div><div class="ba-metric-label">Fraud rate</div></div></div>
      <div class="ba-row">
        <div class="ba-col"><div class="ba-col-label" style="color:#7E8BA3">BEFORE</div><div class="ba-val" style="color:#7E8BA3">2.4%</div></div>
        <div class="ba-col"><div class="ba-col-label" style="color:#059669">AFTER</div><div class="ba-val" style="color:#059669">0.14%</div></div>
      </div>
    </div>
    <div class="ba-card">
      <div class="ba-header"><div class="ba-logo" style="color:#7C3AED">F</div><div><div class="ba-company">FlightHub</div><div class="ba-metric-label">Chargeback rate</div></div></div>
      <div class="ba-row">
        <div class="ba-col"><div class="ba-col-label" style="color:#7E8BA3">BEFORE</div><div class="ba-val" style="color:#7E8BA3">1.8%</div></div>
        <div class="ba-col"><div class="ba-col-label" style="color:#059669">AFTER</div><div class="ba-val" style="color:#059669">0.39%</div></div>
      </div>
    </div>
    <div class="ba-card">
      <div class="ba-header"><div class="ba-logo" style="color:#D97706">T</div><div><div class="ba-company">Tebex</div><div class="ba-metric-label">Fraud review time</div></div></div>
      <div class="ba-row">
        <div class="ba-col"><div class="ba-col-label" style="color:#7E8BA3">BEFORE</div><div class="ba-val" style="color:#7E8BA3">34h</div></div>
        <div class="ba-col"><div class="ba-col-label" style="color:#059669">AFTER</div><div class="ba-val" style="color:#059669">2.1h</div></div>
      </div>
    </div>
    <div class="ba-card">
      <div class="ba-header"><div class="ba-logo" style="color:#059669">M</div><div><div class="ba-company">Meili</div><div class="ba-metric-label">Checkout steps</div></div></div>
      <div class="ba-row">
        <div class="ba-col"><div class="ba-col-label" style="color:#7E8BA3">BEFORE</div><div class="ba-val" style="color:#7E8BA3">12</div></div>
        <div class="ba-col"><div class="ba-col-label" style="color:#059669">AFTER</div><div class="ba-val" style="color:#059669">3</div></div>
      </div>
    </div>
  </div>
</div>

<!-- PALETTE -->
<div class="section" style="padding-bottom:40px;text-align:center;">
  <div class="sec-eyebrow">Palette</div>
</div>
<div class="palette-row">
  ${[['#FAFAF7','Warm White'],['#FFFFFF','Surface'],['#F2EEE8','Tint'],
     ['#1A4FDB','Cobalt'],['#059669','Emerald'],['#7C3AED','Violet'],
     ['#D97706','Amber'],['#0E1523','Deep Navy'],['#7E8BA3','Muted'],
    ].map(([hex,name]) => `
  <div class="swatch">
    <div class="swatch-dot" style="background:${hex}"></div>
    <span class="swatch-label">${name}</span>
  </div>`).join('')}
</div>

<!-- CTA -->
<div class="cta-section">
  <h2>Find your proof.</h2>
  <p>2,400 verified customer stories filtered by outcome, industry, company size, and time frame.</p>
  <div class="cta-btns">
    <a href="/proof-viewer" class="btn-primary">Explore Design →</a>
    <a href="/proof-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</div>

<footer>
  <p>PROOF — A RAM Design Heartbeat creation &nbsp;·&nbsp; <a href="/proof-viewer">Pencil.dev viewer</a> &nbsp;·&nbsp; <a href="/proof-mock">Interactive mock</a></p>
  <p style="margin-top:8px;opacity:.5">Inspired by Evervault Customer Stories (godly.website) &amp; Champions For Good (Awwwards) · Designed by RAM · April 2026</p>
</footer>
</body>
</html>`;

// ── VIEWER HTML ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer-template.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'PROOF — Customer Impact Stories');
  console.log('  hero:', r1.status, r1.body.slice(0, 80));

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, 'PROOF — Pen Viewer');
  console.log('  viewer:', r2.status, r2.body.slice(0, 80));

  console.log(`\n✓ Live at https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer at https://ram.zenbin.org/${SLUG}-viewer`);
})();
