'use strict';
// meridian-publish.js — Full Design Discovery pipeline for MERIDIAN
// MERIDIAN — read the signal, not the noise.
// Theme: LIGHT · Slug: meridian

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'meridian';
const APP_NAME  = 'MERIDIAN';
const TAGLINE   = 'read the signal, not the noise.';
const ARCHETYPE = 'analytics-saas';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'AI signal analytics for growth teams — light theme. Inspired by Equals (GTM analytics) on land-book.com: warm editorial cream palette (#F8F7F4, #FAEECA, muted mauve #AB93AF), Serif typography for data display, pastel tones for channel breakdowns. Counter-culture to cold blue dashboards — calm intelligence aesthetic.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'meridian.pen'), 'utf8');

const P = {
  bg:         '#F8F5EF',
  surface:    '#FFFFFF',
  warm:       '#FBF0CC',
  mauve:      '#B89BB8',
  sage:       '#9EB09A',
  clay:       '#C4856A',
  ink:        '#272320',
  dim:        '#8A8580',
  border:     'rgba(39,35,32,0.10)',
  rule:       '#D9D4CB',
  mauveLight: 'rgba(184,155,184,0.15)',
  sageLight:  'rgba(158,176,154,0.15)',
  clayLight:  'rgba(196,133,106,0.12)',
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
  const screenCards = [
    { id: 'Overview',  sub: 'Morning greeting in serif, hero signal score on warm yellow card, 3-up metric row, active signal list with colored dots', color: P.mauve },
    { id: 'Signals',   sub: 'AI-detected anomalies as editorial cards — tag chips, score badges, body copy, "Investigate" link in mauve', color: P.clay },
    { id: 'Channels',  sub: 'Donut chart ring over cream, 4-channel breakdown rows with warm progress bars and delta indicators', color: P.sage },
    { id: 'Insights',  sub: 'Full-width weekly read card in soft yellow, vertical rule accent cards for recommendations and forecasts', color: P.mauve },
    { id: 'Alerts',    sub: 'Toggle rows with dot status indicators, ink-black CTA button, AI note card in warm yellow', color: P.clay },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MERIDIAN — ${TAGLINE} | RAM Design Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.ink};font-family:'Inter',system-ui,sans-serif;scroll-behavior:smooth}
body{min-height:100vh;overflow-x:hidden}

nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(248,245,239,0.90);backdrop-filter:blur(14px);border-bottom:1px solid ${P.border}}
.nav-logo{font-size:11px;font-weight:700;letter-spacing:0.20em;color:${P.ink};text-decoration:none;text-transform:uppercase}
.nav-sub{font-size:11px;color:${P.dim};letter-spacing:0.05em}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:${P.dim};text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${P.ink}}
.btn-s{font-size:13px;font-weight:600;background:${P.ink};color:${P.bg};border:none;border-radius:100px;padding:9px 22px;text-decoration:none;transition:opacity .2s}
.btn-s:hover{opacity:0.8}

.hero{min-height:100vh;background:${P.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:600px;height:600px;border-radius:50%;background:${P.warm};opacity:0.5;filter:blur(80px);pointer-events:none}
.hero-eye{font-size:10px;font-weight:600;letter-spacing:0.18em;color:${P.mauve};text-transform:uppercase;margin-bottom:20px;position:relative}
.hero-h1{font-family:'Lora',Georgia,serif;font-size:clamp(52px,8vw,84px);font-weight:700;line-height:1.05;color:${P.ink};margin-bottom:12px;position:relative}
.hero-h1 em{font-style:italic;color:${P.mauve}}
.hero-div{width:40px;height:1px;background:${P.rule};margin:28px auto;position:relative}
.hero-tag{font-size:17px;line-height:1.65;color:${P.dim};max-width:500px;margin:0 auto 40px;position:relative}
.hero-acts{display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;position:relative}
.btn-lg-s{font-size:15px;font-weight:600;background:${P.ink};color:${P.bg};border-radius:100px;padding:15px 36px;text-decoration:none;transition:opacity .2s}
.btn-lg-s:hover{opacity:0.8}
.btn-lg-o{font-size:15px;font-weight:600;color:${P.ink};border:1px solid ${P.border};border-radius:100px;padding:15px 36px;text-decoration:none;background:none;transition:background .2s}
.btn-lg-o:hover{background:${P.surface}}
.hero-sub{margin-top:24px;font-size:11px;letter-spacing:0.08em;color:${P.dim};position:relative}

.ticker{background:${P.ink};padding:13px 0;overflow:hidden;white-space:nowrap}
.ticker-track{display:inline-block;animation:ticker 28s linear infinite;font-size:10px;font-weight:600;letter-spacing:0.14em;color:rgba(248,245,239,0.7)}
.ticker-track .sep{color:${P.mauve};margin:0 14px}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}

.section{padding:96px 24px;max-width:1080px;margin:0 auto}
.s-eye{font-size:10px;font-weight:600;letter-spacing:0.15em;color:${P.dim};text-transform:uppercase;margin-bottom:12px}
.s-title{font-family:'Lora',Georgia,serif;font-size:clamp(30px,5vw,50px);font-weight:700;line-height:1.15;color:${P.ink};margin-bottom:56px}

.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
.fc{background:${P.surface};border-radius:20px;padding:28px;border:1px solid ${P.rule};transition:transform .2s,box-shadow .2s}
.fc:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(39,35,32,0.08)}
.fc-dot{width:10px;height:10px;border-radius:50%;margin-bottom:20px}
.fc-title{font-family:'Lora',serif;font-size:19px;font-weight:700;color:${P.ink};margin-bottom:10px}
.fc-body{font-size:14px;line-height:1.65;color:${P.dim}}

.screens-section{padding:96px 0;background:${P.warm};overflow:hidden}
.screens-head{padding:0 48px 32px;max-width:1080px;margin:0 auto}
.screens-scroll{display:flex;gap:20px;padding:8px 48px 24px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.screens-scroll::-webkit-scrollbar{display:none}
.sp{min-width:220px;height:420px;background:${P.surface};border-radius:24px;box-shadow:0 8px 40px rgba(39,35,32,0.12);scroll-snap-align:start;overflow:hidden;flex-shrink:0;display:flex;flex-direction:column;border:1px solid ${P.rule}}
.sp-head{padding:18px 18px 10px;background:${P.bg};border-bottom:1px solid ${P.rule}}
.sp-eye{font-size:9px;font-weight:600;letter-spacing:0.12em;color:${P.dim};text-transform:uppercase;margin-bottom:4px}
.sp-title{font-family:'Lora',serif;font-size:17px;font-weight:700;color:${P.ink};line-height:1.2}
.sp-body{flex:1;padding:14px 18px}
.sp-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid ${P.rule}}
.sp-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.sp-lbl{font-size:11px;color:${P.ink};flex:1;font-family:'Lora',serif}
.sp-val{font-family:'Lora',serif;font-size:13px;font-weight:700;color:${P.ink}}
.sp-card{background:${P.warm};border-radius:10px;padding:12px;margin:8px 0}
.sp-card-val{font-family:'Lora',serif;font-size:28px;font-weight:700;color:${P.ink};line-height:1}
.sp-card-lbl{font-size:9px;color:${P.dim};margin-top:2px;letter-spacing:0.08em}
.sp-bar-row{margin:8px 0}
.sp-bar-t{height:4px;border-radius:4px;background:${P.rule};overflow:hidden;margin-top:5px}
.sp-bar-f{height:100%;border-radius:4px}

.metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.mc{background:${P.surface};border-radius:16px;padding:24px;border:1px solid ${P.rule};text-align:center}
.mc-val{font-family:'Lora',Georgia,serif;font-size:42px;font-weight:700;color:${P.ink};line-height:1}
.mc-lbl{font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${P.dim};margin-top:6px}
.mc-sub{font-size:13px;color:${P.dim};margin-top:4px}

.quote-sec{background:${P.ink};padding:96px 24px;text-align:center}
.q-text{font-family:'Lora',Georgia,serif;font-size:clamp(22px,4vw,36px);font-style:italic;font-weight:600;color:${P.bg};max-width:680px;margin:0 auto 16px;line-height:1.4}
.q-text em{color:${P.mauve};font-style:normal}
.q-by{font-size:12px;letter-spacing:0.10em;color:rgba(248,245,239,0.35)}

.palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
.swatch{border-radius:12px;padding:18px 22px;font-size:11px;font-weight:600;letter-spacing:0.06em}

.cta-sec{padding:96px 24px;background:${P.bg};text-align:center;border-top:1px solid ${P.rule}}
.cta-h{font-family:'Lora',Georgia,serif;font-size:clamp(34px,6vw,60px);font-weight:700;line-height:1.1;color:${P.ink};margin-bottom:20px}
.cta-sub{font-size:16px;color:${P.dim};margin-bottom:40px;max-width:440px;margin-left:auto;margin-right:auto}
.cta-acts{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.cta-links{margin-top:20px;display:flex;gap:24px;justify-content:center;flex-wrap:wrap}
.cta-links a{font-size:13px;color:${P.mauve};text-decoration:none;transition:opacity .2s}
.cta-links a:hover{opacity:0.7}

footer{background:${P.ink};color:rgba(248,245,239,0.40);padding:48px 48px 32px;display:flex;flex-direction:column;gap:32px}
.ft{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:24px}
.fb{font-size:11px;font-weight:700;letter-spacing:0.20em;color:${P.bg};text-decoration:none}
.ft-tag{font-size:12px;margin-top:6px;color:rgba(248,245,239,0.40)}
.fl a{font-size:12px;color:rgba(248,245,239,0.40);text-decoration:none;margin-right:20px;transition:color .2s}
.fl a:hover{color:${P.bg}}
.fbot{font-size:11px;padding-top:24px;border-top:1px solid rgba(248,245,239,0.08);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">MERIDIAN <span class="nav-sub">by RAM</span></a>
  <ul class="nav-links">
    <li><a href="#signals">Signals</a></li>
    <li><a href="#channels">Channels</a></li>
    <li><a href="#insights">Insights</a></li>
    <li><a href="${SLUG}-viewer">View Design</a></li>
  </ul>
  <a class="btn-s" href="${SLUG}-mock">Live Mock ☀</a>
</nav>

<section class="hero">
  <div class="hero-eye">RAM Design Studio · Signal Intelligence</div>
  <h1 class="hero-h1">Read the <em>signal</em>,<br>not the noise.</h1>
  <div class="hero-div"></div>
  <p class="hero-tag">MERIDIAN brings calm intelligence to growth analytics — warm editorial design for teams who think in patterns, not dashboards.</p>
  <div class="hero-acts">
    <a class="btn-lg-s" href="${SLUG}-mock">Explore Mock</a>
    <a class="btn-lg-o" href="${SLUG}-viewer">View in Pencil</a>
  </div>
  <p class="hero-sub">Light theme · 5 screens · Inspired by Equals on land-book.com</p>
</section>

<div class="ticker">
  <span class="ticker-track">
    SIGNAL ANALYTICS <span class="sep">✦</span> AI ANOMALY DETECTION <span class="sep">✦</span> CHANNEL HEALTH <span class="sep">✦</span> EDITORIAL DATA DESIGN <span class="sep">✦</span> CALM INTELLIGENCE <span class="sep">✦</span> GROWTH METRICS <span class="sep">✦</span> WARM PALETTE <span class="sep">✦</span> SERIF DATA TYPE <span class="sep">✦</span>
    SIGNAL ANALYTICS <span class="sep">✦</span> AI ANOMALY DETECTION <span class="sep">✦</span> CHANNEL HEALTH <span class="sep">✦</span> EDITORIAL DATA DESIGN <span class="sep">✦</span> CALM INTELLIGENCE <span class="sep">✦</span> GROWTH METRICS <span class="sep">✦</span> WARM PALETTE <span class="sep">✦</span> SERIF DATA TYPE <span class="sep">✦</span>
  </span>
</div>

<section class="section" id="signals">
  <div class="s-eye">Design System</div>
  <h2 class="s-title">Calm analytics,<br>made editorial.</h2>
  <div class="features-grid">
    <div class="fc">
      <div class="fc-dot" style="background:${P.mauve}"></div>
      <div class="fc-title">Signal Feed</div>
      <div class="fc-body">AI-detected anomalies and trends presented as editorial cards — tag chips, confidence scores, and contextual body copy. Designed to be read, not just scanned.</div>
    </div>
    <div class="fc">
      <div class="fc-dot" style="background:${P.sage}"></div>
      <div class="fc-title">Channel Health</div>
      <div class="fc-body">Per-channel signal scores with warm progress bars and delta indicators. A donut ring overview built from cream circles — no cold blue pie charts here.</div>
    </div>
    <div class="fc">
      <div class="fc-dot" style="background:${P.clay}"></div>
      <div class="fc-title">AI Insights</div>
      <div class="fc-body">Weekly synthesis cards with full-bleed soft yellow backgrounds. Serif display type turns your data story into editorial content worth reading.</div>
    </div>
    <div class="fc">
      <div class="fc-dot" style="background:${P.ink}"></div>
      <div class="fc-title">Smart Alerts</div>
      <div class="fc-body">AI-adaptive threshold toggles with dot status indicators. Meridian learns your signal patterns and refines alert sensitivity automatically over time.</div>
    </div>
  </div>
</section>

<section class="screens-section" id="channels">
  <div class="screens-head">
    <div class="s-eye">Screen Tour</div>
    <h2 class="s-title" style="margin-bottom:8px">Five screens,<br>one calm system.</h2>
  </div>
  <div class="screens-scroll">
    ${screenCards.map((sc, i) => `
    <div class="sp">
      <div class="sp-head">
        <div class="sp-eye">Screen ${i+1}</div>
        <div class="sp-title">${sc.id}</div>
      </div>
      <div class="sp-body">
        ${i===0 ? `
        <div class="sp-card"><div class="sp-card-val">94.2</div><div class="sp-card-lbl">TOTAL SIGNAL SCORE</div></div>
        <div class="sp-row"><div class="sp-dot" style="background:${P.clay}"></div><div class="sp-lbl">Email re-engage spike</div><div class="sp-val">9.4</div></div>
        <div class="sp-row"><div class="sp-dot" style="background:${P.sage}"></div><div class="sp-lbl">Homepage CTR improving</div><div class="sp-val">7.1</div></div>
        <div class="sp-row"><div class="sp-dot" style="background:${P.mauve}"></div><div class="sp-lbl">Mobile cart abandonment</div><div class="sp-val">8.8</div></div>
        ` : i===1 ? `
        <div style="background:${P.clayLight};border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="font-size:9px;font-weight:700;color:${P.clay};letter-spacing:.1em;margin-bottom:4px">ANOMALY</div>
          <div style="font-family:'Lora',serif;font-size:12px;font-weight:700;color:${P.ink}">Email re-engagement spike</div>
          <div style="font-size:10px;color:${P.dim};margin-top:3px">Open rates up 340% on dormant segment</div>
        </div>
        <div style="background:${P.sageLight};border-radius:8px;padding:10px">
          <div style="font-size:9px;font-weight:700;color:${P.sage};letter-spacing:.1em;margin-bottom:4px">TREND</div>
          <div style="font-family:'Lora',serif;font-size:12px;font-weight:700;color:${P.ink}">Scroll depth improving</div>
          <div style="font-size:10px;color:${P.dim};margin-top:3px">Users scrolling 40% further since nav update</div>
        </div>
        ` : i===2 ? `
        <div style="text-align:center;margin:12px 0 14px">
          <div style="display:inline-block;width:80px;height:80px;border-radius:50%;background:${P.warm};border:12px solid ${P.rule};position:relative">
            <div style="font-family:'Lora',serif;font-size:14px;font-weight:700;color:${P.ink};position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">76</div>
          </div>
        </div>
        <div class="sp-bar-row"><div style="display:flex;justify-content:space-between;font-size:9px;color:${P.dim}"><span style="font-family:'Lora',serif">Organic</span><span style="font-weight:700;color:${P.ink}">87</span></div><div class="sp-bar-t"><div class="sp-bar-f" style="width:87%;background:${P.sage}"></div></div></div>
        <div class="sp-bar-row"><div style="display:flex;justify-content:space-between;font-size:9px;color:${P.dim}"><span style="font-family:'Lora',serif">Email</span><span style="font-weight:700;color:${P.ink}">94</span></div><div class="sp-bar-t"><div class="sp-bar-f" style="width:94%;background:${P.clay}"></div></div></div>
        <div class="sp-bar-row"><div style="display:flex;justify-content:space-between;font-size:9px;color:${P.dim}"><span style="font-family:'Lora',serif">Paid Social</span><span style="font-weight:700;color:${P.ink}">61</span></div><div class="sp-bar-t"><div class="sp-bar-f" style="width:61%;background:${P.mauve}"></div></div></div>
        ` : i===3 ? `
        <div style="background:${P.warm};border-radius:10px;padding:12px;margin-bottom:10px">
          <div style="font-size:8px;font-weight:700;color:${P.clay};letter-spacing:.1em;margin-bottom:6px">WEEKLY READ</div>
          <div style="font-family:'Lora',serif;font-size:12px;font-weight:700;color:${P.ink};line-height:1.4">Your email channel is outperforming the market.</div>
        </div>
        <div style="border-left:2px solid ${P.mauve};padding-left:10px;margin-bottom:8px">
          <div style="font-size:9px;color:${P.mauve};font-weight:700;letter-spacing:.08em">RECOMMENDATION</div>
          <div style="font-family:'Lora',serif;font-size:11px;color:${P.ink};margin-top:3px">Reduce paid social budget</div>
        </div>
        <div style="border-left:2px solid ${P.sage};padding-left:10px">
          <div style="font-size:9px;color:${P.sage};font-weight:700;letter-spacing:.08em">FORECAST</div>
          <div style="font-family:'Lora',serif;font-size:11px;color:${P.ink};margin-top:3px">Q2 conversion +18%</div>
        </div>
        ` : `
        <div style="font-size:10px;color:${P.dim};margin-bottom:10px">3 active alerts · AI-adaptive</div>
        ${['Conversion drop','Score anomaly','Budget warning'].map((a,j) => `
        <div class="sp-row">
          <div class="sp-dot" style="background:${[P.clay,P.mauve,P.sage][j]}"></div>
          <div class="sp-lbl">${a}</div>
          <div style="background:${P.ink};border-radius:100px;width:26px;height:13px;font-size:7px;font-weight:700;color:${P.bg};display:flex;align-items:center;justify-content:center">ON</div>
        </div>`).join('')}
        `}
        <div style="margin-top:auto;padding-top:8px;font-size:9px;color:${P.dim};letter-spacing:.06em;text-transform:uppercase">${sc.sub.slice(0,50)}…</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="section" id="insights">
  <div class="s-eye">Design Philosophy</div>
  <h2 class="s-title">Warm palette,<br>cold precision.</h2>
  <p style="font-size:16px;line-height:1.7;color:${P.dim};max-width:580px;margin-bottom:48px">Meridian pushes against the cold blue dashboard norm. Inspired by Equals on land-book.com, it treats analytics as editorial content — Lora serif for display figures, a cream-yellow primary card, muted mauve for AI accents.</p>
  <div class="metrics-grid">
    <div class="mc">
      <div class="mc-val">5</div>
      <div class="mc-lbl">Screens</div>
      <div class="mc-sub">Overview to Alerts</div>
    </div>
    <div class="mc">
      <div class="mc-val">4</div>
      <div class="mc-lbl">Accent Colors</div>
      <div class="mc-sub">Mauve · Sage · Clay · Ink</div>
    </div>
    <div class="mc">
      <div class="mc-val">Light</div>
      <div class="mc-lbl">Theme</div>
      <div class="mc-sub">Warm cream base</div>
    </div>
  </div>
  <div class="palette-row">
    <div class="swatch" style="background:${P.bg};color:${P.dim};border:1px solid ${P.rule}">#F8F5EF · bg</div>
    <div class="swatch" style="background:${P.warm};color:${P.ink}">#FBF0CC · warm</div>
    <div class="swatch" style="background:${P.mauve};color:#fff">#B89BB8 · mauve</div>
    <div class="swatch" style="background:${P.sage};color:#fff">#9EB09A · sage</div>
    <div class="swatch" style="background:${P.clay};color:#fff">#C4856A · clay</div>
    <div class="swatch" style="background:${P.ink};color:${P.warm}">#272320 · ink</div>
  </div>
</section>

<section class="quote-sec">
  <p class="q-text">"Most analytics products feel like <em>cockpits</em>. Meridian feels like a <em>morning brief</em>."</p>
  <div class="q-by">— MERIDIAN DESIGN NOTES · RAM</div>
</section>

<section class="cta-sec">
  <h2 class="cta-h">Explore the<br>full prototype.</h2>
  <p class="cta-sub">Five screens of calm signal intelligence — view the interactive mock or open the Pencil viewer.</p>
  <div class="cta-acts">
    <a class="btn-lg-s" href="${SLUG}-mock">Interactive Mock ☀◑</a>
    <a class="btn-lg-o" href="${SLUG}-viewer">Pencil Viewer</a>
  </div>
  <div class="cta-links">
    <a href="${SLUG}-viewer">View .pen file</a>
    <a href="#">RAM Design Studio</a>
  </div>
</section>

<footer>
  <div class="ft">
    <div>
      <a class="fb" href="#">MERIDIAN</a>
      <div class="ft-tag">${TAGLINE}</div>
    </div>
    <div class="fl">
      <a href="${SLUG}-mock">Interactive Mock</a>
      <a href="${SLUG}-viewer">Pencil Viewer</a>
      <a href="#">RAM Studio</a>
    </div>
  </div>
  <div class="fbot">
    <span>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
    <span>Inspired by Equals on land-book.com</span>
  </div>
</footer>

</body>
</html>`;
}

function buildViewer() {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MERIDIAN — Pencil Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#F8F5EF;font-family:'Inter',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:80px 24px}
h1{font-family:'Lora',serif;font-size:28px;font-weight:700;color:#272320;margin-bottom:8px}
p{font-size:14px;color:#8A8580;margin-bottom:32px}
#pencil-viewer{width:390px;max-width:100%;border-radius:32px;overflow:hidden;box-shadow:0 24px 80px rgba(39,35,32,0.18);background:#fff}
</style>
<VIEWER_SCRIPT_PLACEHOLDER>
</head>
<body>
<h1>MERIDIAN</h1>
<p>read the signal, not the noise.</p>
<div id="pencil-viewer"></div>
<script>
if(window.PencilViewer && window.EMBEDDED_PEN) {
  PencilViewer.init(document.getElementById('pencil-viewer'), JSON.parse(window.EMBEDDED_PEN));
}
</script>
</body>
</html>`;
  viewerHtml = viewerHtml.replace('<VIEWER_SCRIPT_PLACEHOLDER>', injection + '\n<script src="https://cdn.pencil.dev/viewer.js"></script>');
  return viewerHtml;
}

async function updateGallery() {
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
    design_url: `https://${SUBDOMAIN}.zenbin.org/${SLUG}`,
    mock_url: `https://${SUBDOMAIN}.zenbin.org/${SLUG}-mock`,
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
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));
  return newEntry;
}

(async () => {
  console.log('Publishing MERIDIAN...');

  const heroRes = await zenPut(SLUG, `MERIDIAN — ${TAGLINE}`, buildHero());
  console.log('Hero:', heroRes.status, `https://${SUBDOMAIN}.zenbin.org/${SLUG}`);

  const viewerRes = await zenPut(`${SLUG}-viewer`, 'MERIDIAN Viewer', buildViewer());
  console.log('Viewer:', viewerRes.status, `https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);

  const entry = await updateGallery();
  console.log('Gallery: entry added', entry.id);
})();
