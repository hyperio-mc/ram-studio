// keen-publish.mjs — KEEN hero + viewer + gallery + DB
// Theme: LIGHT — clean off-white #F7F5F2 + electric blue #2563EB + amber #F59E0B
// Inspired by: Keytail (land-book.com) + Equals GTM analytics (land-book.com)
// Awwwards: editorial data layout nominees, land-book: SEO/analytics SaaS

import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG      = 'keen';
const APP       = 'KEEN';
const TAGLINE   = 'search intelligence for content teams';
const ARCHETYPE = 'seo-analytics-light';
const PROMPT    = 'Inspired by Keytail ("Be the Answer Everywhere People Search") and Equals GTM analytics on land-book.com — both are clean, data-dense light-theme SaaS tools for search/content visibility. Awwwards nominees showing editorial data layouts with strong typographic hierarchy reinforced the direction. LIGHT theme. Off-white #F7F5F2 + electric blue #2563EB + amber #F59E0B. Inter typeface. 5 screens: Overview (visibility score ring, 2 metric tiles, weekly bar chart, top keyword rows, quick-win card), Keywords (search bar, filter chips, detailed table with KD/intent/vol), SERP Analysis (result cards with competitor breakdown, opportunity callout), Content Gaps (untapped cluster count, gap cards with KD bars, competitor coverage dots), Reports (report cards with schedule/status, send log).';

// ── Helpers ───────────────────────────────────────────────────────────────────

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: d }); } catch(e) { reject(e); } });
    });
    r.on('error', reject);
    if (body) r.write(typeof body === 'string' ? body : JSON.stringify(body));
    r.end();
  });
}

async function publish(slug, html, title) {
  const safeHtml = html.replace(/[^\x00-\x7F]/g, ' ');
  const buf = Buffer.from(JSON.stringify({ title, html: safeHtml }));
  try {
    const res = await req({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': buf.length },
    }, safeHtml);
    const res2 = await req({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': buf.length },
    });
    // try proper post
    const body2 = JSON.stringify({ title, html: safeHtml });
    const buf2 = Buffer.from(body2);
    const r2 = await req({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': buf2.length },
    }, body2);
    if (r2.status < 300) {
      try { return { status: r2.status, url: JSON.parse(r2.body).url || `https://zenbin.org/p/${slug}` }; }
      catch { return { status: r2.status, url: `https://zenbin.org/p/${slug}` }; }
    }
    return { status: r2.status, url: `https://zenbin.org/p/${slug}` };
  } catch(e) {
    return { status: 0, url: `https://zenbin.org/p/${slug}`, err: e.message };
  }
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────

const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KEEN — Search Intelligence for Content Teams</title>
<meta name="description" content="Search intelligence platform for content teams. Keyword rankings, SERP analysis, content gaps, and automated reports. Clean light UI. A RAM design concept.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://zenbin.org/p/keen">
<meta property="og:title" content="KEEN — Search Intelligence for Content Teams">
<meta property="og:description" content="Track rankings, analyse SERP, discover content gaps, and schedule reports. Inspired by Keytail and Equals on land-book.com.">
<meta property="og:site_name" content="RAM Design Studio">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2563EB">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F7F5F2;--surface:#FFFFFF;--surface2:#F0EEE9;
  --ink:#16130E;--muted:rgba(22,19,14,0.48);--dim:rgba(22,19,14,0.12);
  --blue:#2563EB;--blue-bg:#EBF1FE;--blue-dark:#1D4ED8;
  --amber:#F59E0B;--amber-bg:#FEF3C7;
  --green:#16A34A;--red:#DC2626;
  --border:rgba(22,19,14,0.10);
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Inter',sans-serif;line-height:1.5;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(247,245,242,0.90);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;padding:0 56px;height:64px}
.nav-logo{font-family:'Inter',sans-serif;font-weight:900;font-size:20px;letter-spacing:-.02em;text-decoration:none;color:var(--blue)}
.nav-links{display:flex;gap:40px;list-style:none}
.nav-links a{font-size:13px;color:var(--muted);text-decoration:none;font-weight:500}
.nav-cta{background:var(--blue);color:white;border:none;padding:10px 22px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:.02em;text-decoration:none;display:inline-block}

/* HERO */
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:80px 0 0;overflow:hidden}
.hero-left{padding:0 64px 72px}
.hero-eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;color:var(--blue);margin-bottom:24px;text-transform:uppercase}
.hero-title{font-family:'Inter',sans-serif;font-weight:900;font-size:78px;line-height:0.90;letter-spacing:-.04em;margin-bottom:28px;color:var(--ink)}
.hero-title .accent{color:var(--blue)}
.hero-rule{height:1px;background:var(--border);margin:28px 0}
.hero-deck{font-size:18px;line-height:1.65;color:var(--muted);margin-bottom:14px;max-width:460px;font-weight:400}
.hero-sub{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);line-height:1.9;max-width:420px;margin-bottom:44px;letter-spacing:.01em}
.hero-btns{display:flex;gap:14px;align-items:center}
.btn-primary{background:var(--blue);color:white;padding:14px 30px;border-radius:10px;font-size:12px;font-weight:700;letter-spacing:.04em;text-decoration:none;display:inline-block}
.btn-ghost{border:1.5px solid var(--border);color:var(--muted);padding:13px 28px;border-radius:10px;font-size:12px;letter-spacing:.04em;text-decoration:none;display:inline-block;font-weight:500}
.hero-right{height:100vh;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}

/* Floating stat cards */
.float-card{position:absolute;background:rgba(255,255,255,0.95);border:1px solid var(--border);border-radius:12px;padding:16px 20px;backdrop-filter:blur(12px);box-shadow:0 4px 24px rgba(22,19,14,0.08)}
.fc-label{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.fc-value{font-weight:900;font-size:28px;line-height:1;letter-spacing:-.03em;color:var(--ink)}
.fc-delta{font-family:'DM Mono',monospace;font-size:9px;margin-top:6px}
.fc-delta.up{color:var(--green)}
.fc-delta.down{color:var(--red)}

/* Phone mockup */
.phone-wrap{width:280px;position:relative;z-index:2}
.phone{width:280px;height:580px;background:var(--surface);border-radius:40px;overflow:hidden;
  border:1px solid var(--border);
  box-shadow:0 2px 4px rgba(22,19,14,0.06),0 12px 40px rgba(22,19,14,0.12),0 40px 80px rgba(22,19,14,0.08)}
.phone-notch{width:80px;height:18px;background:var(--bg);border-radius:0 0 12px 12px;position:absolute;top:0;left:50%;transform:translateX(-50%);z-index:2}
.p-screen{padding:24px 14px 60px;background:var(--bg);height:100%;overflow:hidden;position:relative}
/* Screen elements */
.p-head{font-weight:800;font-size:18px;letter-spacing:-.02em;color:var(--ink);margin-bottom:4px}
.p-sub{font-family:'DM Mono',monospace;font-size:8px;color:var(--muted);margin-bottom:14px}
/* visibility ring */
.p-ring-wrap{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.p-ring{width:80px;height:80px;border-radius:50%;background:var(--blue-bg);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;position:relative}
.p-ring::after{content:'';position:absolute;inset:10px;border-radius:50%;background:var(--surface)}
.p-ring-val{font-weight:900;font-size:20px;color:var(--blue);position:relative;z-index:1;line-height:1}
.p-ring-lbl{font-family:'DM Mono',monospace;font-size:6px;color:var(--muted);position:relative;z-index:1;letter-spacing:.06em}
.p-tiles{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:1}
.p-tile{background:white;border-radius:8px;padding:8px 10px;border:1px solid var(--border)}
.p-tile-val{font-weight:800;font-size:14px;color:var(--ink);letter-spacing:-.01em}
.p-tile-lbl{font-family:'DM Mono',monospace;font-size:6px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
/* chart */
.p-chart{display:flex;align-items:flex-end;gap:4px;height:40px;margin-bottom:10px}
.p-bar{flex:1;border-radius:3px 3px 0 0;min-height:4px}
/* kw rows */
.p-kw{background:white;border-radius:6px;padding:6px 8px;margin-bottom:4px;display:flex;align-items:center;gap:6px;border:1px solid var(--border)}
.p-kw-pos{background:var(--blue-bg);border-radius:4px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:8px;color:var(--blue);flex-shrink:0}
.p-kw-name{font-size:9px;font-weight:500;color:var(--ink);flex:1}
.p-kw-badge{font-family:'DM Mono',monospace;font-size:7px;padding:2px 5px;border-radius:4px;font-weight:700}
.p-kw-badge.up{background:var(--green);color:white}
.p-kw-badge.neutral{background:var(--surface2);color:var(--muted)}
/* bottom nav */
.p-nav{position:absolute;bottom:0;left:0;right:0;height:54px;background:white;border-top:1px solid var(--border);display:flex}
.p-nav-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.p-nav-icon{font-size:12px;line-height:1}
.p-nav-lbl{font-family:'DM Mono',monospace;font-size:5.5px;letter-spacing:.04em;text-transform:uppercase}
.p-nav-tab.active .p-nav-lbl{color:var(--blue)}
.p-active-bg{background:var(--blue-bg);border-radius:8px;padding:4px 8px}

/* HOW IT WORKS */
.section-how{padding:120px 80px;background:var(--surface)}
.eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;color:var(--blue);text-transform:uppercase;margin-bottom:16px}
.section-how h2{font-weight:900;font-size:52px;line-height:1.0;margin-bottom:56px;letter-spacing:-.03em;color:var(--ink)}
.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.how-card{background:var(--bg);border-radius:16px;padding:36px 32px}
.how-num{font-family:'DM Mono',monospace;font-size:10px;color:var(--blue);letter-spacing:.1em;margin-bottom:20px;font-weight:500}
.how-title{font-weight:800;font-size:20px;color:var(--ink);margin-bottom:12px;line-height:1.2}
.how-desc{font-size:14px;color:var(--muted);line-height:1.7}

/* FEATURES */
.section-features{padding:120px 80px;background:var(--bg)}
.feat-intro{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start;margin-bottom:72px}
.feat-intro h2{font-weight:900;font-size:52px;line-height:1.0;letter-spacing:-.03em;color:var(--ink)}
.feat-intro p{font-size:15px;color:var(--muted);line-height:1.8;padding-top:18px}
.feat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.feat-card{background:var(--surface);border-radius:16px;padding:32px;border:1px solid var(--border)}
.feat-icon{width:44px;height:44px;border-radius:12px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:20px;background:var(--blue-bg)}
.feat-icon.amber{background:var(--amber-bg)}
.feat-card h3{font-weight:800;font-size:18px;color:var(--ink);margin-bottom:10px}
.feat-card p{font-size:14px;color:var(--muted);line-height:1.7}

/* DATA STRIP */
.section-data{padding:80px;background:var(--blue);display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.data-item{text-align:center;padding:40px 20px;border-right:1px solid rgba(255,255,255,0.15)}
.data-item:last-child{border-right:none}
.data-val{font-weight:900;font-size:52px;letter-spacing:-.04em;color:white;line-height:1}
.data-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-top:10px}

/* DESIGN PHILOSOPHY */
.section-phil{padding:120px 80px;background:var(--surface);border-top:1px solid var(--border)}
.phil-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.phil-left .eyebrow{color:var(--amber)}
.phil-left h2{font-weight:900;font-size:48px;line-height:1.0;margin-bottom:24px;letter-spacing:-.03em;color:var(--ink)}
.phil-left p{font-size:15px;color:var(--muted);line-height:1.8;margin-bottom:16px}
.phil-right{display:grid;gap:16px}
.phil-principle{padding:24px;background:var(--bg);border-radius:12px;border-left:3px solid var(--blue)}
.phil-principle.amber{border-left-color:var(--amber)}
.phil-principle.green{border-left-color:var(--green)}
.phil-principle h4{font-weight:800;font-size:16px;color:var(--ink);margin-bottom:6px}
.phil-principle p{font-size:13px;color:var(--muted);line-height:1.6}

/* CTA */
.cta{padding:120px 80px;background:var(--ink);text-align:center}
.cta .eyebrow{color:rgba(247,245,242,0.45)}
.cta h2{font-weight:900;font-size:62px;line-height:0.95;color:white;margin-bottom:20px;letter-spacing:-.04em}
.cta h2 .accent{color:#60A5FA}
.cta p{font-size:16px;color:rgba(247,245,242,0.55);max-width:480px;margin:0 auto 44px;line-height:1.7}
.cta-btns{display:flex;gap:16px;justify-content:center}
.cta-btn-white{background:white;color:var(--ink);padding:16px 36px;border-radius:12px;font-size:12px;font-weight:800;letter-spacing:.04em;text-decoration:none}
.cta-btn-ghost{border:1.5px solid rgba(255,255,255,0.25);color:white;padding:15px 34px;border-radius:12px;font-size:12px;letter-spacing:.04em;text-decoration:none}

/* FOOTER */
footer{background:#0E0D0B;padding:40px 80px;display:flex;justify-content:space-between;align-items:center}
.footer-logo{font-weight:900;font-size:18px;color:var(--bg);letter-spacing:-.02em}
.footer-note{font-family:'DM Mono',monospace;font-size:9px;color:rgba(247,245,242,0.28);letter-spacing:.08em;text-transform:uppercase}

/* STATS BAR */
.stats-bar{display:flex;gap:40px;padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px}
.stat-item{display:flex;flex-direction:column}
.stat-val{font-weight:900;font-size:18px;letter-spacing:-.02em;color:var(--ink)}
.stat-label{font-family:'DM Mono',monospace;font-size:8px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:2px}

@media(max-width:900px){
  .hero{grid-template-columns:1fr;padding-bottom:60px}
  .hero-right{height:520px}
  .hero-left{padding:0 28px 40px}
  .hero-title{font-size:56px}
  .section-how,.section-features,.section-phil,.cta{padding:72px 28px}
  nav{padding:0 24px}
  .how-grid,.feat-grid,.feat-intro,.phil-grid{grid-template-columns:1fr}
  .section-data{grid-template-columns:1fr 1fr;padding:48px 28px}
  footer{padding:28px 24px;flex-direction:column;gap:8px;text-align:center}
}
</style>
</head>
<body>

<nav>
  <a href="/" class="nav-logo">KEEN</a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#design">Design</a></li>
    <li><a href="https://zenbin.org/p/keen-mock" target="_blank">Prototype</a></li>
  </ul>
  <a href="https://zenbin.org/p/keen-mock" class="nav-cta">TRY PROTOTYPE →</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <p class="hero-eyebrow">◈ RAM DESIGN HEARTBEAT · LIGHT THEME · 417 NODES</p>
    <h1 class="hero-title">Be the<br><span class="accent">answer.</span></h1>
    <hr class="hero-rule">
    <p class="hero-deck">Search intelligence for content teams who want to dominate every query that matters.</p>
    <p class="hero-sub">Track rankings across 1,800+ keywords. Analyse SERP competition. Discover content gaps before your rivals do. Schedule automated reports for every stakeholder. KEEN turns search data into an unfair advantage.</p>
    <div class="hero-btns">
      <a href="https://zenbin.org/p/keen-mock" class="btn-primary">OPEN PROTOTYPE →</a>
      <a href="https://zenbin.org/p/keen-viewer" class="btn-ghost">VIEW DESIGN</a>
    </div>
    <div class="stats-bar">
      <div class="stat-item"><span class="stat-val">1,847</span><span class="stat-label">Keywords tracked</span></div>
      <div class="stat-item"><span class="stat-val">#4</span><span class="stat-label">Avg target rank</span></div>
      <div class="stat-item"><span class="stat-val">312</span><span class="stat-label">Content gaps found</span></div>
    </div>
  </div>
  <div class="hero-right">

    <!-- Floating stat cards -->
    <div class="float-card" style="top:16%;left:2%;animation:float1 4s ease-in-out infinite">
      <div class="fc-label">Visibility Score</div>
      <div class="fc-value" style="color:#2563EB">74</div>
      <div class="fc-delta up">+6 pts this week ↑</div>
    </div>
    <div class="float-card" style="top:20%;right:2%;animation:float2 5s ease-in-out infinite">
      <div class="fc-label">Page 1 Rankings</div>
      <div class="fc-value">193</div>
      <div class="fc-delta up">+12 new this month ↑</div>
    </div>
    <div class="float-card" style="bottom:24%;left:2%;animation:float1 6s ease-in-out infinite">
      <div class="fc-label">Quick Wins Found</div>
      <div class="fc-value" style="color:#F59E0B">6</div>
      <div class="fc-delta" style="color:#B45309">Near page 1 now →</div>
    </div>

    <!-- Phone mockup -->
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="p-screen">
          <div class="p-head">Overview</div>
          <div class="p-sub">keen.io/workspace/rakis</div>
          <div class="p-ring-wrap">
            <div class="p-ring">
              <div class="p-ring-val">74</div>
              <div class="p-ring-lbl">SCORE</div>
            </div>
            <div class="p-tiles">
              <div class="p-tile"><div class="p-tile-val">1,847</div><div class="p-tile-lbl">Ranking KWs</div></div>
              <div class="p-tile"><div class="p-tile-val">11.2</div><div class="p-tile-lbl">Avg Pos</div></div>
              <div class="p-tile"><div class="p-tile-val">193</div><div class="p-tile-lbl">Page 1</div></div>
              <div class="p-tile"><div class="p-tile-val" style="color:#F59E0B">6</div><div class="p-tile-lbl">Quick Wins</div></div>
            </div>
          </div>
          <div class="p-chart">
            ${[55,62,58,71,68,79,84].map((h, i) => `<div class="p-bar" style="height:${h * 0.46}%;background:${i===6 ? '#2563EB' : '#EBF1FE'}"></div>`).join('')}
          </div>
          <div style="font-family:'DM Mono',monospace;font-size:7px;color:rgba(22,19,14,0.42);letter-spacing:.08em;margin-bottom:8px">TOP KEYWORDS</div>
          ${[['content marketing strategy','#3',true],['seo audit checklist','#7',true],['keyword research tools','#11',false]].map(([kw,pos,up])=>`
          <div class="p-kw">
            <div class="p-kw-pos">${pos}</div>
            <div class="p-kw-name">${kw}</div>
            <div class="p-kw-badge ${up?'up':'neutral'}">${up?'+2':'−1'}</div>
          </div>`).join('')}
        </div>
        <div class="p-nav">
          ${[['⊞','Overv',true],['◈','KWs',false],['⟳','SERP',false],['◜','Gaps',false]].map(([ic,lb,ac])=>`
          <div class="p-nav-tab${ac?' active':''}">
            <div class="${ac?'p-active-bg':''}">
              <div class="p-nav-icon" style="color:${ac?'#2563EB':'rgba(22,19,14,0.35)'}">${ic}</div>
            </div>
            <div class="p-nav-lbl" style="color:${ac?'#2563EB':'rgba(22,19,14,0.42)'}">${lb}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>

  </div>
</section>

<style>
@keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
</style>

<!-- HOW IT WORKS -->
<section class="section-how" id="features">
  <div class="eyebrow">How it works</div>
  <h2>From query to content<br>in minutes.</h2>
  <div class="how-grid">
    <div class="how-card">
      <div class="how-num">01 —</div>
      <h3 class="how-title">Connect your site</h3>
      <p class="how-desc">Link your Search Console and analytics in 60 seconds. KEEN pulls your live ranking data and starts building your keyword universe immediately.</p>
    </div>
    <div class="how-card">
      <div class="how-num">02 —</div>
      <h3 class="how-title">Analyse the gaps</h3>
      <p class="how-desc">We map what your competitors rank for that you don't — and rank every opportunity by effort vs. potential reward, so you know exactly what to write next.</p>
    </div>
    <div class="how-card">
      <div class="how-num">03 —</div>
      <h3 class="how-title">Report automatically</h3>
      <p class="how-desc">Schedule weekly digests, monthly executive summaries, and real-time competitor alerts. Your stakeholders stay informed without any manual effort.</p>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="section-features">
  <div class="feat-intro">
    <h2>Everything your content team actually needs.</h2>
    <p>Most SEO tools were built for SEO specialists. KEEN is built for the whole content team — writers, strategists, and the CMO reviewing results on a Friday morning.</p>
  </div>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">🎯</div>
      <h3>Rank Tracking</h3>
      <p>Daily position updates across 1,800+ keywords. Visual trend charts, position history, and automated alerts when you move up or drop out of the top 20.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon amber">🔍</div>
      <h3>SERP Intelligence</h3>
      <p>See exactly who outranks you and why. Content length, backlink counts, freshness scores, and featured snippet opportunities — all on one screen.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⚡</div>
      <h3>Content Gap Finder</h3>
      <p>312 keyword clusters your competitors rank for and you don't. Sorted by difficulty and volume, with one-click brief generation to start writing immediately.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon amber">📊</div>
      <h3>Automated Reports</h3>
      <p>Scheduled PDF, CSV, or Slack digests for every stakeholder. Weekly ranking summaries for the team, monthly executive decks for leadership — done automatically.</p>
    </div>
  </div>
</section>

<!-- DATA STRIP -->
<div class="section-data">
  <div class="data-item"><div class="data-val">1.8K</div><div class="data-label">Keywords tracked</div></div>
  <div class="data-item"><div class="data-val">312</div><div class="data-label">Content gaps found</div></div>
  <div class="data-item"><div class="data-val">74%</div><div class="data-label">Visibility score</div></div>
  <div class="data-item"><div class="data-val">47</div><div class="data-label">Reports sent / 30d</div></div>
</div>

<!-- DESIGN PHILOSOPHY -->
<section class="section-phil" id="design">
  <div class="phil-grid">
    <div class="phil-left">
      <div class="eyebrow">Design philosophy</div>
      <h2>Data that earns its screen space.</h2>
      <p>KEEN was designed after observing Keytail and Equals on land-book.com — both tools where the UI gets out of the way so the data can speak. Every screen starts with the one number that matters most, then layers detail behind a tap.</p>
      <p>Light theme, warm off-white base, Inter at maximum weight for hierarchy. Amber signals opportunity; blue signals progress; green signals success. Simple rules, consistently applied.</p>
    </div>
    <div class="phil-right">
      <div class="phil-principle">
        <h4>Visibility score as north star</h4>
        <p>Every screen comes back to a single composite score. Teams shouldn't need to synthesise 14 metrics — they need one number to optimise for, with the detail available when they want to dig.</p>
      </div>
      <div class="phil-principle amber">
        <h4>Amber for opportunity, not warning</h4>
        <p>Most tools use amber to mean "caution." KEEN flips it: amber signals a ranked opportunity — something worth your attention because it's achievable, not because something is broken.</p>
      </div>
      <div class="phil-principle green">
        <h4>Tabular data with editorial rhythm</h4>
        <p>Inspired by Equals' data grids and Keytail's clean hierarchy — keyword rows use position badges, KD bars, and intent chips so a table feels scannable rather than overwhelming.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta">
  <div class="eyebrow">◈ RAM design heartbeat</div>
  <h2>Be the<br><span class="accent">answer.</span></h2>
  <p>Explore the prototype or view the full design system — built with Pencil.dev and Svelte.</p>
  <div class="cta-btns">
    <a href="https://zenbin.org/p/keen-mock" class="cta-btn-white">OPEN PROTOTYPE →</a>
    <a href="https://zenbin.org/p/keen-viewer" class="cta-btn-ghost">VIEW DESIGN</a>
  </div>
</section>

<footer>
  <span class="footer-logo">KEEN</span>
  <span class="footer-note">RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} · Light Theme</span>
</footer>

</body>
</html>`;

// ── Viewer HTML (with EMBEDDED_PEN) ──────────────────────────────────────────

function buildViewer(penJson) {
  const viewerBase = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KEEN — Design Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#F7F5F2;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;min-height:100vh}
.viewer-header{width:100%;max-width:1200px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center}
.vh-logo{font-weight:900;font-size:18px;color:#2563EB;letter-spacing:-.02em}
.vh-meta{font-size:11px;color:rgba(22,19,14,0.45)}
.vh-link{background:#2563EB;color:white;padding:8px 18px;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none;letter-spacing:.04em}
.pencil-viewer{width:100%;max-width:1200px;padding:0 24px 60px}
#pencil-root{width:100%}
</style>
</head>
<body>
<div class="viewer-header">
  <span class="vh-logo">KEEN</span>
  <span class="vh-meta">search intelligence for content teams · RAM Design Heartbeat</span>
  <a href="https://zenbin.org/p/keen-mock" class="vh-link">INTERACTIVE MOCK →</a>
</div>
<div class="pencil-viewer"><div id="pencil-root"></div></div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
</script>
<script src="https://unpkg.com/pencil-viewer@latest/dist/viewer.umd.js"></script>
<script>
if(window.PencilViewer && window.EMBEDDED_PEN){
  try {
    const pen = typeof window.EMBEDDED_PEN === 'string' ? JSON.parse(window.EMBEDDED_PEN) : window.EMBEDDED_PEN;
    PencilViewer.render(document.getElementById('pencil-root'), pen);
  } catch(e) { document.getElementById('pencil-root').innerHTML = '<p style="padding:40px;color:#666">Design loaded — ' + (typeof window.EMBEDDED_PEN === 'string' ? window.EMBEDDED_PEN.length : 0) + ' chars</p>'; }
}
</script>
</body>
</html>`;
  return viewerBase;
}

// ── Main pipeline ─────────────────────────────────────────────────────────────

let heroUrl = `https://zenbin.org/p/${SLUG}`;
let viewerUrl = `https://zenbin.org/p/${SLUG}-viewer`;

// 1. Publish hero
console.log('Publishing hero...');
try {
  const heroBuf = Buffer.from(JSON.stringify({ title: `${APP} — ${TAGLINE}`, html: hero.replace(/[^\x00-\x7F]/g, ' ') }));
  const heroRes = await req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${SLUG}?overwrite=true`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': heroBuf.length },
  }, JSON.stringify({ title: `${APP} — ${TAGLINE}`, html: hero.replace(/[^\x00-\x7F]/g, ' ') }));
  console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));
  try { heroUrl = JSON.parse(heroRes.body).url || heroUrl; } catch {}
} catch(e) { console.log('Hero error:', e.message); }

// 2. Publish viewer
console.log('Publishing viewer...');
try {
  const penJson = fs.readFileSync('/workspace/group/design-studio/keen.pen', 'utf8');
  const viewerHtml = buildViewer(penJson);
  const safeViewer = viewerHtml.replace(/[^\x00-\x7F]/g, ' ');
  const viewerBuf = Buffer.from(JSON.stringify({ title: `${APP} Design Viewer`, html: safeViewer }));
  const viewerRes = await req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${SLUG}-viewer?overwrite=true`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': viewerBuf.length },
  }, JSON.stringify({ title: `${APP} Design Viewer`, html: safeViewer }));
  console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));
} catch(e) { console.log('Viewer error:', e.message); }

// 3. Gallery queue update
console.log('Updating gallery queue...');
try {
  const headers = {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers,
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
    app_name: APP,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: heroUrl,
    mock_url: `https://zenbin.org/p/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody) },
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));
} catch(e) { console.log('Gallery error:', e.message); }

// 4. Index in design DB
console.log('Indexing in design DB...');
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: heroUrl,
    mock_url: `https://zenbin.org/p/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
  });
  rebuildEmbeddings(db);
  console.log('Indexed in design DB');
} catch(e) { console.log('DB index error:', e.message); }

console.log('\n=== KEEN PUBLISH COMPLETE ===');
console.log('Hero:   ', heroUrl);
console.log('Viewer: ', viewerUrl);
console.log('Mock:    https://zenbin.org/p/keen-mock');
