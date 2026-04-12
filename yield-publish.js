'use strict';
// yield-publish.js — Full Design Discovery pipeline for YIELD
// YIELD — Revenue Intelligence for Indie Makers
// Theme: DARK · Slug: yield

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'yield';
const APP_NAME  = 'Yield';
const TAGLINE   = 'Know exactly where your money comes from';
const ARCHETYPE = 'finance-analytics-dashboard';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Revenue intelligence dashboard for indie makers — dark theme. Inspired by Midday.ai (darkmodedesign.com) + Equals GTM analytics (land-book.com) + Mixpanel (godly.website). "Quiet Clarity": monospace number typography, electric violet/mint accent system, floating cards on near-black deep space background.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'yield.pen'), 'utf8');

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

// Dark palette
const P = {
  bg:        '#07070F',
  surface:   '#0F0F1C',
  surface2:  '#161628',
  surface3:  '#1E1E35',
  text:      '#E6E3FF',
  textMuted: 'rgba(230,227,255,0.38)',
  accent:    '#7C6FFF',
  accentDim: 'rgba(124,111,255,0.12)',
  accent2:   '#3DFFC0',
  accent2Dim:'rgba(61,255,192,0.12)',
  accent3:   '#FF6B6B',
  accent4:   '#FFD166',
  border:    'rgba(124,111,255,0.12)',
};

function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yield — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="Yield is a revenue intelligence dashboard for indie makers. Track MRR, audience growth, and milestones — all in one minimal dark interface.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:-apple-system,'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;
  background:rgba(7,7,15,0.85);
  backdrop-filter:blur(20px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-size:13px;font-weight:800;color:${P.text};letter-spacing:3px;font-family:'JetBrains Mono',monospace}
.nav-logo span{color:${P.accent}}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${P.text}}
.nav-cta{
  background:${P.accent};color:#fff;
  padding:8px 18px;border-radius:20px;
  font-size:13px;font-weight:600;text-decoration:none;
  transition:opacity .2s;
}
.nav-cta:hover{opacity:0.85}

.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:80px 24px 60px;
  position:relative;overflow:hidden;
}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  background:${P.accentDim};border:1px solid rgba(124,111,255,0.25);
  color:${P.accent};border-radius:20px;
  padding:6px 16px;font-size:11px;font-weight:700;
  letter-spacing:1.5px;margin-bottom:28px;
  font-family:'JetBrains Mono',monospace;
}
.hero-badge::before{content:'◈';font-size:13px}
h1{
  font-size:clamp(42px,7vw,88px);font-weight:800;
  line-height:1.0;letter-spacing:-3px;
  color:${P.text};margin-bottom:20px;max-width:900px;
}
h1 .hi-violet{color:${P.accent}}
h1 .hi-mint{color:${P.accent2}}
.hero-sub{
  font-size:clamp(15px,2vw,19px);color:${P.textMuted};
  max-width:500px;line-height:1.65;margin-bottom:44px;
}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:64px}
.btn-primary{
  background:${P.accent};color:#fff;
  padding:14px 32px;border-radius:28px;
  font-size:15px;font-weight:700;text-decoration:none;
  transition:transform .15s,box-shadow .15s;display:inline-flex;align-items:center;gap:8px;
  box-shadow:0 0 32px rgba(124,111,255,0.3);
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 48px rgba(124,111,255,0.45)}
.btn-secondary{
  background:${P.surface2};color:${P.text};
  border:1px solid ${P.border};
  padding:14px 28px;border-radius:28px;
  font-size:15px;font-weight:600;text-decoration:none;
  transition:border-color .2s,background .2s;
}
.btn-secondary:hover{border-color:${P.accent};background:${P.accentDim}}

/* Hero metrics strip */
.hero-metrics{
  display:flex;gap:32px;flex-wrap:wrap;justify-content:center;margin-bottom:56px;
  padding:20px 32px;
  background:${P.surface2};border:1px solid ${P.border};border-radius:20px;
}
.hero-metric{text-align:center}
.hero-metric-val{
  font-family:'JetBrains Mono',monospace;
  font-size:26px;font-weight:700;color:${P.text};line-height:1;
}
.hero-metric-val.green{color:${P.accent2}}
.hero-metric-val.violet{color:${P.accent}}
.hero-metric-label{font-size:11px;color:${P.textMuted};margin-top:4px;letter-spacing:0.5px}
.hero-metric-divider{width:1px;background:${P.border};align-self:stretch}

/* Phone mockup */
.phone-wrap{position:relative;margin:0 auto}
.phone-mockup{
  position:relative;margin:0 auto;
  width:260px;height:530px;
  background:${P.surface};border-radius:40px;
  box-shadow:0 0 80px rgba(124,111,255,0.2),0 40px 100px rgba(0,0,0,0.6),0 0 0 1px ${P.border};
  overflow:hidden;
}
.phone-notch{
  position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:90px;height:24px;background:${P.bg};
  border-radius:0 0 14px 14px;z-index:10;
}
.phone-screen{width:100%;height:100%;background:${P.bg};overflow:hidden}

/* Screen showcase */
.screens-showcase{
  display:flex;gap:16px;overflow-x:auto;padding:0 40px 20px;
  scrollbar-width:none;max-width:1200px;margin:0 auto;
}
.screens-showcase::-webkit-scrollbar{display:none}
.screen-card{
  flex:0 0 185px;height:360px;
  background:${P.surface2};border-radius:28px;
  border:1px solid ${P.border};
  overflow:hidden;position:relative;
  box-shadow:0 8px 32px rgba(0,0,0,0.4);
  transition:transform .2s,box-shadow .2s,border-color .2s;
}
.screen-card:hover{transform:translateY(-6px);box-shadow:0 0 32px rgba(124,111,255,0.2),0 16px 48px rgba(0,0,0,0.5);border-color:${P.accent}}
.screen-label{
  position:absolute;bottom:0;left:0;right:0;
  padding:10px 14px;
  background:linear-gradient(transparent,rgba(7,7,15,0.96));
  font-size:11px;font-weight:600;color:${P.text};
}

section{padding:80px 40px;max-width:1100px;margin:0 auto}
.section-label{
  font-size:10px;font-weight:700;letter-spacing:2.5px;
  color:${P.accent};margin-bottom:16px;text-transform:uppercase;
  font-family:'JetBrains Mono',monospace;
}
.section-title{
  font-size:clamp(28px,4vw,46px);font-weight:800;
  color:${P.text};line-height:1.1;margin-bottom:16px;letter-spacing:-1.5px;
}
.section-sub{font-size:16px;color:${P.textMuted};line-height:1.65;max-width:480px}

.features-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:16px;margin-top:48px;
}
.feature-card{
  background:${P.surface2};border:1px solid ${P.border};
  border-radius:24px;padding:28px;
  transition:border-color .2s,box-shadow .2s;
}
.feature-card:hover{border-color:${P.accent};box-shadow:0 0 24px ${P.accentDim}}
.feature-icon{
  width:44px;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;margin-bottom:16px;
}
.fi-violet{background:${P.accentDim}}
.fi-mint{background:${P.accent2Dim}}
.fi-amber{background:rgba(255,209,102,0.12)}
.feature-title{font-size:15px;font-weight:700;color:${P.text};margin-bottom:8px}
.feature-desc{font-size:13px;color:${P.textMuted};line-height:1.6}

.metrics-row{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:16px;margin-top:48px;
}
.metric-block{
  background:${P.surface2};border:1px solid ${P.border};
  border-radius:20px;padding:28px 24px;text-align:center;
}
.metric-val{font-size:38px;font-weight:800;color:${P.text};line-height:1;font-family:'JetBrains Mono',monospace}
.metric-val.violet{color:${P.accent}}
.metric-val.mint{color:${P.accent2}}
.metric-val.amber{color:${P.accent4}}
.metric-val span{font-size:16px;color:${P.textMuted}}
.metric-label{font-size:12px;color:${P.textMuted};margin-top:8px;letter-spacing:0.5px}

.palette-row{display:flex;gap:10px;margin-top:32px;flex-wrap:wrap}
.swatch{
  display:flex;flex-direction:column;align-items:center;gap:8px;
}
.swatch-color{
  width:52px;height:52px;border-radius:14px;
  border:1px solid rgba(255,255,255,0.08);
}
.swatch-label{font-size:9px;color:${P.textMuted};font-family:'JetBrains Mono',monospace}

.inspiration-block{
  background:${P.surface2};border:1px solid ${P.border};
  border-radius:24px;padding:32px;margin-top:40px;
  display:flex;gap:24px;align-items:flex-start;
}
.insp-icon{font-size:30px;flex-shrink:0}
.insp-label{font-size:10px;font-weight:700;color:${P.accent};letter-spacing:2px;margin-bottom:8px;font-family:'JetBrains Mono',monospace}
.insp-text{font-size:14px;color:${P.text};line-height:1.65;color:${P.textMuted}}
.insp-text strong{color:${P.text}}

.cta-band{
  background:linear-gradient(135deg,${P.surface2} 0%,rgba(124,111,255,0.15) 100%);
  border:1px solid ${P.border};border-radius:32px;
  padding:64px 48px;text-align:center;
  margin:0 40px 80px;
  position:relative;overflow:hidden;
}
.cta-band::before{
  content:'';position:absolute;top:-40%;left:-10%;
  width:400px;height:400px;border-radius:50%;
  background:${P.accent};filter:blur(120px);opacity:0.12;
  pointer-events:none;
}
.cta-band h2{font-size:clamp(26px,4vw,42px);font-weight:800;color:${P.text};margin-bottom:14px;letter-spacing:-1.5px}
.cta-band p{font-size:16px;color:${P.textMuted};margin-bottom:32px}
.btn-cta{
  background:${P.accent};color:#fff;
  padding:14px 36px;border-radius:28px;
  font-size:15px;font-weight:700;text-decoration:none;
  transition:transform .15s,box-shadow .15s;display:inline-block;
  box-shadow:0 0 32px rgba(124,111,255,0.35);
}
.btn-cta:hover{transform:translateY(-2px);box-shadow:0 0 48px rgba(124,111,255,0.5)}

footer{
  border-top:1px solid ${P.border};
  padding:32px 40px;
  display:flex;align-items:center;justify-content:space-between;
  font-size:12px;color:${P.textMuted};
}
.footer-logo{font-weight:800;color:${P.text};letter-spacing:3px;font-family:'JetBrains Mono',monospace}
.footer-logo span{color:${P.accent}}

/* Glow blobs */
.blob{position:absolute;border-radius:50%;filter:blur(100px);opacity:0.12;pointer-events:none}
.blob-1{width:500px;height:500px;background:${P.accent};top:-150px;right:-150px}
.blob-2{width:350px;height:350px;background:${P.accent2};bottom:50px;left:-120px}
.blob-3{width:200px;height:200px;background:${P.accent4};bottom:200px;right:100px}

/* Trend bar viz */
.trend-bars{display:flex;align-items:flex-end;gap:4px;height:60px;margin-top:20px}
.trend-bar{flex:1;border-radius:4px 4px 0 0;transition:height .3s}

@media(max-width:768px){
  nav{padding:0 20px}
  .hero{padding:80px 20px 40px}
  section{padding:60px 20px}
  .metrics-row{grid-template-columns:1fr}
  .cta-band{margin:0 20px 60px;padding:40px 24px}
  footer{flex-direction:column;gap:12px;text-align:center}
  .hero-metrics{gap:20px;padding:16px 20px}
  .inspiration-block{flex-direction:column}
}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">Y<span>I</span>ELD</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#design">Design</a>
    <a href="#inspiration">Inspiration</a>
    <a href="/yield-mock" class="nav-cta">Try Mock →</a>
  </div>
</nav>

<div class="hero">
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="blob blob-3"></div>

  <div class="hero-badge">REVENUE INTELLIGENCE</div>
  <h1>Know exactly<br>where your<br><span class="hi-mint">money</span> comes from</h1>
  <p class="hero-sub">MRR tracking, audience growth, and revenue milestones — all in one quiet, focused dashboard built for indie makers.</p>

  <div class="hero-metrics">
    <div class="hero-metric">
      <div class="hero-metric-val violet">$12.8K</div>
      <div class="hero-metric-label">MRR tracked</div>
    </div>
    <div class="hero-metric-divider"></div>
    <div class="hero-metric">
      <div class="hero-metric-val green">+18.4%</div>
      <div class="hero-metric-label">MoM growth</div>
    </div>
    <div class="hero-metric-divider"></div>
    <div class="hero-metric">
      <div class="hero-metric-val">47.8K</div>
      <div class="hero-metric-label">Audience reached</div>
    </div>
    <div class="hero-metric-divider"></div>
    <div class="hero-metric">
      <div class="hero-metric-val green">42.7%</div>
      <div class="hero-metric-label">Newsletter open rate</div>
    </div>
  </div>

  <div class="hero-actions">
    <a href="/yield-viewer" class="btn-primary">◈ View Design</a>
    <a href="/yield-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</div>

<div style="background:${P.bg};padding:0 0 80px">
  <div style="max-width:1100px;margin:0 auto;padding:0 40px">
    <div class="section-label" style="margin-bottom:24px">5 Screens</div>
    <div class="section-title">The full flow</div>
  </div>
  <div class="screens-showcase">
    ${['Revenue', 'Sources', 'Audience', 'Ledger', 'Goals'].map((name, i) => `
    <div class="screen-card">
      <div style="width:100%;height:100%;background:${P.surface2};display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px">
        <div style="font-size:28px;opacity:0.5">${['◈','◉','◎','≡','◇'][i]}</div>
        <div style="font-size:11px;color:${P.textMuted};font-family:'JetBrains Mono',monospace">${String(i+1).padStart(2,'0')}</div>
      </div>
      <div class="screen-label">${name}</div>
    </div>`).join('')}
  </div>
</div>

<section id="features">
  <div class="section-label">Core Features</div>
  <div class="section-title">Revenue clarity,<br>finally.</div>
  <p class="section-sub">Every number that matters to a solo maker — consolidated, clean, and always up to date.</p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon fi-violet">◈</div>
      <div class="feature-title">MRR Dashboard</div>
      <div class="feature-desc">Live monthly recurring revenue with sparkline history, new MRR vs churned, and annual run rate — all in one card.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-mint">◉</div>
      <div class="feature-title">Revenue Sources</div>
      <div class="feature-desc">See exactly how much each product, course, or consulting stream contributes. Donut chart + horizontal bar breakdown.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-mint">◎</div>
      <div class="feature-title">Audience Growth</div>
      <div class="feature-desc">Newsletter, Twitter, YouTube, LinkedIn — track all your platforms in one place with monthly growth deltas.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-violet">≡</div>
      <div class="feature-title">Transaction Ledger</div>
      <div class="feature-desc">Every payment in, every fee out. Filterable by type. Clean chronological feed across Gumroad, Lemon Squeezy, Stripe.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-amber">◇</div>
      <div class="feature-title">Milestone Goals</div>
      <div class="feature-desc">Set your MRR targets and track progress on a visual milestone trail with circular progress and countdown days.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-violet">⬡</div>
      <div class="feature-title">Quiet Interface</div>
      <div class="feature-desc">Deep dark background, monospace number typography, subtle violet glow accents — designed to never distract from the work.</div>
    </div>
  </div>
</section>

<section id="design">
  <div class="section-label">Design System</div>
  <div class="section-title">Numbers deserve<br>their own voice</div>
  <p class="section-sub">Yield uses a strict typographic hierarchy: JetBrains Mono for all numbers, system UI for supporting copy. The data always leads.</p>

  <div class="metrics-row">
    <div class="metric-block">
      <div class="metric-val violet">$12.8<span>K</span></div>
      <div class="metric-label">MRR — Electric Violet</div>
      <div class="trend-bars">
        ${[52,61,58,70,78,88,94,100].map((v,i,a) => `<div class="trend-bar" style="height:${v}%;background:${P.accent};opacity:${0.4 + (i/a.length)*0.6}"></div>`).join('')}
      </div>
    </div>
    <div class="metric-block">
      <div class="metric-val mint">+18.4<span>%</span></div>
      <div class="metric-label">Growth — Mint Green</div>
      <div class="trend-bars">
        ${[40,55,60,58,70,80,90,100].map((v,i,a) => `<div class="trend-bar" style="height:${v}%;background:${P.accent2};opacity:${0.4 + (i/a.length)*0.6}"></div>`).join('')}
      </div>
    </div>
    <div class="metric-block">
      <div class="metric-val amber">64<span>%</span></div>
      <div class="metric-label">Goal Progress — Amber</div>
      <div style="margin-top:20px;background:${P.surface3};border-radius:8px;height:8px;overflow:hidden">
        <div style="width:64%;height:100%;background:${P.accent4};border-radius:8px"></div>
      </div>
    </div>
  </div>

  <p class="section-label" style="margin-top:48px">Palette</p>
  <div class="palette-row">
    ${[
      { hex: '#07070F', label: 'Space' },
      { hex: '#0F0F1C', label: 'Surface' },
      { hex: '#161628', label: 'Card' },
      { hex: '#7C6FFF', label: 'Violet' },
      { hex: '#3DFFC0', label: 'Mint' },
      { hex: '#FF6B6B', label: 'Coral' },
      { hex: '#FFD166', label: 'Amber' },
      { hex: '#E6E3FF', label: 'Text' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-label">${s.label}</div>
    </div>`).join('')}
  </div>
</section>

<section id="inspiration">
  <div class="section-label">What Inspired This</div>
  <div class="section-title">Research → Design</div>

  <div class="inspiration-block">
    <div class="insp-icon">🌑</div>
    <div>
      <div class="insp-label">MIDDAY.AI — DARKMODEDESIGN.COM</div>
      <div class="insp-text"><strong>Dark minimal finance for solopreneurs.</strong> Midday.ai's approach to deep dark backgrounds with restrained accent lighting directly shaped Yield's "Quiet Clarity" aesthetic — the idea that financial data feels more serious and trustworthy when it's not surrounded by noise.</div>
    </div>
  </div>

  <div class="inspiration-block" style="margin-top:16px">
    <div class="insp-icon">📊</div>
    <div>
      <div class="insp-label">EQUALS GTM ANALYTICS — LAND-BOOK.COM</div>
      <div class="insp-text"><strong>Data-forward SaaS layout patterns.</strong> Equals' clean card hierarchy and progressive data disclosure — hero metric leading into breakdown views — defined the screen flow structure Yield follows across all 5 screens.</div>
    </div>
  </div>

  <div class="inspiration-block" style="margin-top:16px">
    <div class="insp-icon">🔬</div>
    <div>
      <div class="insp-label">MIXPANEL — GODLY.WEBSITE</div>
      <div class="insp-text"><strong>Product analytics card density.</strong> Mixpanel's multi-metric cards with supporting context text inspired Yield's approach to packing meaningful data without visual clutter — letting color and typography weight carry the hierarchy instead of lines and dividers.</div>
    </div>
  </div>
</section>

<div class="cta-band">
  <h2>Every dollar, accounted for</h2>
  <p>Stop cobbling together revenue data from five different dashboards.</p>
  <a href="/yield-mock" class="btn-cta">Try the Interactive Mock →</a>
</div>

<footer>
  <div class="footer-logo">Y<span>I</span>ELD</div>
  <div>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
  <div>ram.zenbin.org/${SLUG}</div>
</footer>

</body>
</html>`;
}

function buildViewer() {
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

async function updateGithubQueue() {
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

  return putRes.status === 200 ? 'OK' : putRes.body.slice(0, 200);
}

(async () => {
  console.log('── Yield Design Discovery Pipeline ──\n');

  // a) Hero
  console.log('Publishing hero page…');
  const heroHtml = buildHero();
  const heroRes = await zenPut(SLUG, `Yield — ${TAGLINE}`, heroHtml);
  console.log(`  hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  // b) Viewer
  console.log('Publishing viewer…');
  let viewerOk = false;
  try {
    const viewerHtml = buildViewer();
    const viewerRes = await zenPut(`${SLUG}-viewer`, `Yield — Design Viewer`, viewerHtml);
    console.log(`  viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);
    viewerOk = true;
  } catch(e) {
    console.log('  viewer: skipped (viewer.html not found) —', e.message);
  }

  // c) GitHub queue
  console.log('Updating GitHub gallery queue…');
  try {
    const queueResult = await updateGithubQueue();
    console.log('  queue:', queueResult);
  } catch(e) {
    console.log('  queue error:', e.message);
  }

  console.log('\n✓ Pipeline complete');
  console.log(`  Design: https://ram.zenbin.org/${SLUG}`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
