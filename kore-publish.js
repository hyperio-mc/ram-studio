'use strict';
// kore-publish.js — Full Design Discovery pipeline for KORE
// KORE — AI Business Command Center
// Theme: DARK · Slug: kore

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'kore';
const APP_NAME  = 'KORE';
const TAGLINE   = 'Your business signal, live';
const ARCHETYPE = 'ai-business-command-center';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Dark AI business command center — terminal aesthetics meets modern SaaS finance tool. Inspired by midday.ai (darkmodedesign.com) precision dark SaaS + traffic.productions bold editorial typography (godly.website). Near-black graphite bg, electric teal accent #00E5CC, amber signal colour, monospace data typography, live signal feed.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'kore.pen'), 'utf8');

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

// Palette
const P = {
  bg:        '#0B0C10',
  surface:   '#13151C',
  surface2:  '#1C1F2A',
  text:      '#E8EAF0',
  textMuted: 'rgba(232,234,240,0.45)',
  accent:    '#00E5CC',
  accentDim: 'rgba(0,229,204,0.1)',
  accent2:   '#FFB800',
  accent2Dim:'rgba(255,184,0,0.1)',
  danger:    '#FF4D6A',
  success:   '#00C896',
  border:    'rgba(0,229,204,0.1)',
};

function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="KORE is an AI business command center for founders. Track cash flow, runway, and AI-detected signals in a live terminal dashboard.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

/* noise texture overlay */
body::before{
  content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  opacity:0.4;
}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:58px;
  background:rgba(11,12,16,0.88);
  backdrop-filter:blur(20px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{
  font-family:'JetBrains Mono',monospace;
  font-size:15px;font-weight:800;color:${P.accent};letter-spacing:5px;
}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${P.text}}
.nav-live{
  display:flex;align-items:center;gap:7px;
  font-family:'JetBrains Mono',monospace;
  font-size:11px;font-weight:700;color:${P.success};letter-spacing:2px;
}
.nav-live::before{
  content:'';width:7px;height:7px;border-radius:50%;background:${P.success};
  box-shadow:0 0 8px ${P.success};animation:pulse 2s ease-in-out infinite;
}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}

.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:100px 24px 80px;
  position:relative;overflow:hidden;
}
/* glow orbs */
.hero::after{
  content:'';position:absolute;
  width:600px;height:600px;border-radius:50%;
  background:radial-gradient(circle, rgba(0,229,204,0.06) 0%, transparent 70%);
  top:50%;left:50%;transform:translate(-50%,-60%);pointer-events:none;
}

.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  background:${P.accentDim};border:1px solid rgba(0,229,204,0.2);
  color:${P.accent};border-radius:20px;
  padding:6px 16px;font-size:10px;font-weight:700;
  letter-spacing:2px;margin-bottom:32px;
  font-family:'JetBrains Mono',monospace;
}
h1{
  font-size:clamp(48px,8vw,96px);font-weight:900;
  line-height:0.95;letter-spacing:-4px;
  color:${P.text};margin-bottom:24px;max-width:900px;
}
h1 .hi-teal{color:${P.accent}}
h1 .hi-amber{color:${P.accent2}}
.hero-sub{
  font-size:clamp(16px,2vw,20px);color:${P.textMuted};
  max-width:480px;line-height:1.6;margin-bottom:48px;
}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:72px}
.btn-primary{
  background:${P.accent};color:#0B0C10;
  padding:14px 32px;border-radius:28px;
  font-size:15px;font-weight:800;text-decoration:none;
  letter-spacing:0.5px;
  transition:transform .15s,box-shadow .15s;
  box-shadow:0 0 32px rgba(0,229,204,0.3);
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 48px rgba(0,229,204,0.45)}
.btn-secondary{
  background:${P.surface};color:${P.text};
  border:1px solid ${P.border};
  padding:14px 28px;border-radius:28px;
  font-size:15px;font-weight:600;text-decoration:none;
  transition:border-color .2s;
}
.btn-secondary:hover{border-color:${P.accent}}

/* Live metrics strip */
.metrics-strip{
  display:flex;gap:0;flex-wrap:nowrap;justify-content:center;margin-bottom:72px;
  background:${P.surface};border:1px solid ${P.border};border-radius:16px;
  overflow:hidden;
}
.metric-item{
  text-align:center;padding:18px 28px;
  border-right:1px solid ${P.border};
  font-family:'JetBrains Mono',monospace;
}
.metric-item:last-child{border-right:none}
.metric-val{font-size:22px;font-weight:800;color:${P.text};line-height:1;margin-bottom:4px}
.metric-val.teal{color:${P.accent}}
.metric-val.amber{color:${P.accent2}}
.metric-val.green{color:${P.success}}
.metric-label{font-size:9px;color:${P.textMuted};letter-spacing:2.5px;text-transform:uppercase}

/* Phone mockup */
.phone-wrap{position:relative;margin:0 auto;width:280px}
.phone-mockup{
  width:280px;height:570px;
  background:${P.surface};border-radius:44px;
  box-shadow:0 0 0 1px ${P.border},0 0 80px rgba(0,229,204,0.12),0 40px 100px rgba(0,0,0,0.7);
  overflow:hidden;position:relative;
}
.phone-notch{
  position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:88px;height:22px;background:${P.bg};
  border-radius:0 0 12px 12px;z-index:10;
}
/* Animated teal top-bar on phone */
.phone-top-bar{
  position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,${P.accent},transparent);
  z-index:11;animation:scanline 3s ease-in-out infinite;
}
@keyframes scanline{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}}
.phone-screen{
  width:100%;height:100%;
  background:${P.bg};
  display:flex;flex-direction:column;
  padding:28px 16px 0;
}
/* Mock screen content */
.mock-header{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:16px;
}
.mock-logo{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;color:${P.accent};letter-spacing:4px}
.mock-live{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;color:${P.success};letter-spacing:2px}
.mock-divider{height:1px;background:rgba(0,229,204,0.12);margin-bottom:14px}
.mock-label{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;color:${P.textMuted};letter-spacing:2.5px;margin-bottom:6px}
.mock-hero-val{font-size:28px;font-weight:900;color:${P.text};letter-spacing:-1px;line-height:1;margin-bottom:4px}
.mock-sub{font-size:10px;color:${P.success};margin-bottom:14px}
.mock-kpis{display:flex;gap:6px;margin-bottom:14px}
.mock-kpi{flex:1;background:${P.surface2};border-radius:8px;padding:8px;text-align:center}
.mock-kpi-val{font-size:13px;font-weight:800;color:${P.text};margin-bottom:2px}
.mock-kpi-label{font-family:'JetBrains Mono',monospace;font-size:7px;color:${P.textMuted};letter-spacing:1.5px}
.mock-feed-label{font-family:'JetBrains Mono',monospace;font-size:8px;color:${P.textMuted};letter-spacing:2px;margin-bottom:8px}
.mock-item{
  background:${P.surface};border-radius:6px;
  padding:8px 10px;margin-bottom:5px;
  display:flex;align-items:center;gap:8px;
}
.mock-item-dot{width:3px;height:32px;border-radius:2px;flex-shrink:0}
.mock-item-body{flex:1}
.mock-item-title{font-size:10px;font-weight:600;color:${P.text};margin-bottom:2px}
.mock-item-sub{font-family:'JetBrains Mono',monospace;font-size:8px;color:${P.textMuted}}
.mock-item-val{font-size:10px;font-weight:700}

/* Screens section */
.screens-section{
  padding:100px 24px;
  background:linear-gradient(to bottom,transparent,${P.surface2}20,transparent);
}
.section-label{
  text-align:center;
  font-family:'JetBrains Mono',monospace;
  font-size:11px;font-weight:700;color:${P.accent};letter-spacing:3px;
  margin-bottom:16px;
}
.section-title{
  text-align:center;font-size:clamp(28px,4vw,44px);font-weight:800;
  color:${P.text};letter-spacing:-1.5px;margin-bottom:16px;
}
.section-sub{
  text-align:center;font-size:16px;color:${P.textMuted};max-width:500px;margin:0 auto 56px;
}
.screens-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:20px;max-width:1100px;margin:0 auto;
}
.screen-card{
  background:${P.surface};border:1px solid ${P.border};border-radius:16px;
  padding:24px;transition:border-color .2s,transform .2s;
  position:relative;overflow:hidden;
}
.screen-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,${P.accent},${P.accent2});
  transform:scaleX(0);transform-origin:left;
  transition:transform .3s;
}
.screen-card:hover{border-color:rgba(0,229,204,0.3);transform:translateY(-3px)}
.screen-card:hover::before{transform:scaleX(1)}
.screen-num{
  font-family:'JetBrains Mono',monospace;
  font-size:10px;font-weight:700;color:${P.accentDim};
  background:${P.accentDim};border:1px solid rgba(0,229,204,0.15);
  padding:3px 10px;border-radius:20px;letter-spacing:1px;
  display:inline-block;margin-bottom:14px;color:${P.accent};
}
.screen-name{font-size:18px;font-weight:700;color:${P.text};margin-bottom:8px}
.screen-desc{font-size:13px;color:${P.textMuted};line-height:1.5}

/* Features */
.features-section{padding:80px 24px;max-width:1100px;margin:0 auto}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-top:56px}
.feature-card{
  background:${P.surface};border:1px solid ${P.border};border-radius:14px;padding:28px;
}
.feature-icon{
  font-size:28px;margin-bottom:16px;
  filter:drop-shadow(0 0 8px rgba(0,229,204,0.4));
}
.feature-name{font-size:16px;font-weight:700;color:${P.text};margin-bottom:8px}
.feature-desc{font-size:13px;color:${P.textMuted};line-height:1.55}

/* Palette swatch */
.palette-section{
  padding:80px 24px;text-align:center;
  max-width:900px;margin:0 auto;
}
.swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:32px}
.swatch{
  width:72px;height:72px;border-radius:12px;
  box-shadow:0 4px 20px rgba(0,0,0,0.4);
  display:flex;align-items:flex-end;
  padding:6px;
}
.swatch-label{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.5);word-break:break-all}

/* Inspiration / process */
.process-section{
  padding:80px 24px;
  background:${P.surface}40;
  border-top:1px solid ${P.border};
  border-bottom:1px solid ${P.border};
}
.process-inner{max-width:800px;margin:0 auto;text-align:center}
.process-quote{
  font-size:clamp(18px,2.5vw,26px);
  color:${P.text};font-style:italic;
  line-height:1.5;margin:32px 0;
  border-left:3px solid ${P.accent};
  padding-left:24px;text-align:left;
}
.process-source{
  font-family:'JetBrains Mono',monospace;
  font-size:11px;color:${P.textMuted};letter-spacing:1px;
  text-align:left;padding-left:27px;
}

/* CTA */
.cta-section{
  padding:100px 24px;text-align:center;
}
.cta-title{
  font-size:clamp(32px,5vw,56px);font-weight:900;
  letter-spacing:-2px;color:${P.text};margin-bottom:16px;
}
.cta-sub{font-size:17px;color:${P.textMuted};margin-bottom:40px}

/* Footer */
footer{
  padding:40px;text-align:center;
  border-top:1px solid ${P.border};
  font-family:'JetBrains Mono',monospace;
  font-size:11px;color:${P.textMuted};letter-spacing:1px;
}
footer a{color:${P.accent};text-decoration:none}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">KORE</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
  </div>
  <div class="nav-live">LIVE</div>
</nav>

<section class="hero">
  <div class="hero-badge">RAM DESIGN STUDIO · HEARTBEAT</div>
  <h1>Business<br><span class="hi-teal">intelligence.</span><br><span class="hi-amber">Live.</span></h1>
  <p class="hero-sub">KORE is an AI command center for founders — monitoring cash, runway, and anomalies in real time, all in one terminal-dark interface.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>

  <div class="metrics-strip">
    <div class="metric-item">
      <div class="metric-val teal">+$48.3K</div>
      <div class="metric-label">Net Today</div>
    </div>
    <div class="metric-item">
      <div class="metric-val green">14.2 mo</div>
      <div class="metric-label">Runway</div>
    </div>
    <div class="metric-item">
      <div class="metric-val amber">3</div>
      <div class="metric-label">AI Signals</div>
    </div>
    <div class="metric-item">
      <div class="metric-val">24</div>
      <div class="metric-label">Streams Live</div>
    </div>
  </div>

  <div class="phone-wrap">
    <div class="phone-mockup">
      <div class="phone-notch"></div>
      <div class="phone-top-bar"></div>
      <div class="phone-screen">
        <div class="mock-header">
          <div class="mock-logo">KORE</div>
          <div class="mock-live">● LIVE</div>
        </div>
        <div class="mock-divider"></div>
        <div class="mock-label">NET CASH TODAY</div>
        <div class="mock-hero-val">+$48,320</div>
        <div class="mock-sub">↑ 12.4% vs yesterday</div>
        <div class="mock-kpis">
          <div class="mock-kpi">
            <div class="mock-kpi-val">$61.2K</div>
            <div class="mock-kpi-label">REVENUE</div>
          </div>
          <div class="mock-kpi">
            <div class="mock-kpi-val">$12.9K</div>
            <div class="mock-kpi-label">EXPENSES</div>
          </div>
          <div class="mock-kpi">
            <div class="mock-kpi-val">14 mo</div>
            <div class="mock-kpi-label">RUNWAY</div>
          </div>
        </div>
        <div class="mock-feed-label">SIGNAL FEED</div>
        <div class="mock-item">
          <div class="mock-item-dot" style="background:#00C896"></div>
          <div class="mock-item-body">
            <div class="mock-item-title">Stripe payout received</div>
            <div class="mock-item-sub">$22,400 · 2 min ago</div>
          </div>
          <div class="mock-item-val" style="color:#00C896">+$22.4K</div>
        </div>
        <div class="mock-item">
          <div class="mock-item-dot" style="background:#FFB800"></div>
          <div class="mock-item-body">
            <div class="mock-item-title">AWS invoice due soon</div>
            <div class="mock-item-sub">$3,840 · 3 days</div>
          </div>
          <div class="mock-item-val" style="color:#FFB800">-$3.8K</div>
        </div>
        <div class="mock-item">
          <div class="mock-item-dot" style="background:#FF4D6A"></div>
          <div class="mock-item-body">
            <div class="mock-item-title">AI anomaly detected</div>
            <div class="mock-item-sub">Ad spend +340%</div>
          </div>
          <div class="mock-item-val" style="color:#FF4D6A">!</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="section-label">5 SCREENS</div>
  <h2 class="section-title">Every view you need</h2>
  <p class="section-sub">From live cash feed to AI anomaly detection — designed to be read in seconds, acted on in one tap.</p>
  <div class="screens-grid">
    <div class="screen-card">
      <div class="screen-num">01</div>
      <div class="screen-name">Command</div>
      <div class="screen-desc">Hero net cash metric, three KPI tiles, live signal feed with colour-coded priority events.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">02</div>
      <div class="screen-name">Cash Flow</div>
      <div class="screen-desc">Weekly bar chart — revenue vs expenses — with period selector, summary row, and transaction list.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">03</div>
      <div class="screen-name">AI Signals</div>
      <div class="screen-desc">Four signal cards — critical, warning, positive, info — each with coloured severity strip and timestamp.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">04</div>
      <div class="screen-name">Runway</div>
      <div class="screen-desc">Projected runway gauge with three scenario models — base, growth push, worst case — plus burn breakdown.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">05</div>
      <div class="screen-name">Connect</div>
      <div class="screen-desc">Integration hub: Stripe and Mercury connected with live status, QuickBooks/Ads/HubSpot with one-tap linking.</div>
    </div>
  </div>
</section>

<section class="features-section" id="features">
  <div class="section-label">DESIGN DECISIONS</div>
  <h2 class="section-title" style="text-align:center">Built with intention</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⌨</div>
      <div class="feature-name">Terminal typography</div>
      <div class="feature-desc">JetBrains Mono for all data labels and timestamps — a deliberate nod to the command-line roots of financial tools, echoing traffic.productions' bold editorial typographic stance.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-name">Severity-coded signals</div>
      <div class="feature-desc">Each AI signal card uses a coloured top-strip and tinted background (red, amber, green, teal) to communicate severity before reading a word — zero-latency scanning.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊡</div>
      <div class="feature-name">Left-edge accent lines</div>
      <div class="feature-desc">Thin 3-4px coloured left-borders on feed items and scenario cards, inspired by midday.ai's precision dark SaaS aesthetic — adding hierarchy without visual noise.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◑</div>
      <div class="feature-name">Teal × Amber palette</div>
      <div class="feature-desc">#00E5CC electric teal as primary accent against #0B0C10 near-black — maximum contrast, minimal chromatic chaos. Amber #FFB800 reserved exclusively for warning-grade signals.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">COLOUR SYSTEM</div>
  <h2 class="section-title" style="letter-spacing:-1px">5 colours. Infinite signal.</h2>
  <div class="swatches">
    <div class="swatch" style="background:#0B0C10"><span class="swatch-label">#0B0C10 BG</span></div>
    <div class="swatch" style="background:#13151C"><span class="swatch-label">#13151C SURFACE</span></div>
    <div class="swatch" style="background:#00E5CC"><span class="swatch-label">#00E5CC TEAL</span></div>
    <div class="swatch" style="background:#FFB800"><span class="swatch-label">#FFB800 AMBER</span></div>
    <div class="swatch" style="background:#FF4D6A"><span class="swatch-label">#FF4D6A DANGER</span></div>
    <div class="swatch" style="background:#00C896"><span class="swatch-label">#00C896 SUCCESS</span></div>
    <div class="swatch" style="background:#E8EAF0"><span class="swatch-label">#E8EAF0 TEXT</span></div>
  </div>
</section>

<section class="process-section">
  <div class="process-inner">
    <div class="section-label">INSPIRATION</div>
    <h2 class="section-title" style="font-size:clamp(24px,3vw,36px)">Where this came from</h2>
    <div class="process-quote">
      "Midday is the business stack for modern founders — they deserve tools as precise as their decisions."
    </div>
    <div class="process-source">— midday.ai, featured on darkmodedesign.com · March 2025</div>
    <p style="font-size:14px;color:${P.textMuted};line-height:1.7;margin-top:28px;text-align:left">
      Browsing <strong style="color:${P.text}">darkmodedesign.com</strong> this session, midday.ai stood out for its dark charcoal treatment of financial data — precision instruments feel, not fintech dashboard clutter. At the same time, traffic.productions on <strong style="color:${P.text}">godly.website</strong> showed editorial all-caps typography with live motion — the idea of a "signal" metaphor came from combining both. KORE strips it further: one font for data (JetBrains Mono), one for prose (Inter), three accent colours only, all anchored to a near-black field that makes every number pop.
    </p>
  </div>
</section>

<section class="cta-section">
  <div class="cta-title">Run the signal.<br>Own the business.</div>
  <div class="cta-sub">Explore all five screens in the Pencil viewer or the interactive Svelte mock.</div>
  <div class="hero-actions" style="justify-content:center">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <p>KORE — designed by <a href="https://ram.zenbin.org">RAM Design Studio</a> · <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> · <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a></p>
  <p style="margin-top:8px;opacity:0.5">Inspired by midday.ai · traffic.productions · darkmodedesign.com · godly.website</p>
</footer>

</body>
</html>`;
}

function buildViewer() {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Design Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#0B0C10;color:#E8EAF0;font-family:system-ui,sans-serif}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px}
h1{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:#00E5CC;letter-spacing:4px;margin-bottom:8px}
p{font-size:13px;color:rgba(232,234,240,0.45);margin-bottom:20px}
#pencil-viewer{width:100%;max-width:900px;height:80vh;border:1px solid rgba(0,229,204,0.15);border-radius:16px;background:#13151C}
</style>
<script>
PLACEHOLDER_SCRIPT
</script>
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

  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>\nPLACEHOLDER_SCRIPT\n</script>', injection + '\n<script>\nPLACEHOLDER_SCRIPT\n</script>');
  return viewerHtml;
}

async function run() {
  console.log('Publishing KORE design...\n');

  // a) Hero page
  const heroHtml = buildHero();
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHtml);
  console.log(`Hero page: ${heroRes.status === 200 ? '✓' : '✗'} https://ram.zenbin.org/${SLUG}`);

  // b) Viewer
  const viewerHtml = buildViewer();
  const viewerRes = await zenPut(`${SLUG}-viewer`, `${APP_NAME} Viewer`, viewerHtml);
  console.log(`Viewer:    ${viewerRes.status === 200 ? '✓' : '✗'} https://ram.zenbin.org/${SLUG}-viewer`);

  // c) Gallery queue
  const ghGetRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileData = JSON.parse(ghGetRes.body);
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

  console.log('\n✓ Done — hero, viewer, gallery queued');
  console.log(`  https://ram.zenbin.org/${SLUG}`);
  console.log(`  https://ram.zenbin.org/${SLUG}-viewer`);

  // Save entry for DB indexing
  fs.writeFileSync('kore-entry.json', JSON.stringify(newEntry, null, 2));
}

run().catch(console.error);
