'use strict';
// float-app-publish.js — Full Design Discovery pipeline for FLOAT (Light theme v2)
// FLOAT — Financial nerve center for lean teams
// Theme: LIGHT · Slug: float-app

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'float-app';
const APP_NAME  = 'Float';
const TAGLINE   = 'Your money, self-managing';
const ARCHETYPE = 'fintech-ops-dashboard';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Light-theme financial nerve center for lean teams and indie founders. Tabular editorial aesthetic — thin-weight large numerals, small-caps labels, warm cream paper-like background. Inspired by: Cardless.com (land-book.com, Mar 2026); Midday.ai (Godly.website + darkmodedesign.com); Paperclip (Lapa Ninja, Mar 2026). 6 screens.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'float.pen'), 'utf8');

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

const P = {
  bg: '#F6F3EE', surface: '#FFFFFF', border: '#E5E0D8',
  text: '#151210', textSub: '#6B6560', muted: '#A09A93',
  accent: '#1B4ED8', accentBg: '#EEF2FF',
  amber: '#D97706', amberBg: '#FEF3C7',
  green: '#059669', greenBg: '#ECFDF5',
  red: '#DC2626', redBg: '#FEF2F2',
  purple: '#7C3AED', purpleBg: '#F5F3FF',
};

const SCREENS = [
  { name: 'Overview',       icon: '◈', desc: 'Cash balance, runway, and agent activity at a glance' },
  { name: 'Transactions',   icon: '↕', desc: 'Unified transaction feed, auto-categorized by agents' },
  { name: 'Invoices',       icon: '⊟', desc: 'Outstanding, sent, draft, and paid invoices with aging' },
  { name: 'Agent Log',      icon: '◎', desc: 'Real-time log of autonomous financial agents at work' },
  { name: 'Reports',        icon: '⊕', desc: 'Revenue vs expenses, expense breakdown, net cashflow' },
  { name: 'Invoice Detail', icon: '▤', desc: 'Line-item view with one-tap Send Reminder and Mark Paid' },
];

function buildHero() {
  const sparkData = [32,41,28,55,47,62,44,58,71,48,65,78,53,67,82];
  const maxSpark = Math.max(...sparkData);
  const sparkBars = sparkData.map(v => {
    const h = Math.max(4, Math.round(v / maxSpark * 40));
    const op = 0.4 + (v/maxSpark)*0.6;
    return `<div style="width:8px;height:${h}px;background:${P.accent};border-radius:2px;opacity:${op.toFixed(2)}"></div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Float — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="Float is a financial nerve center for lean teams. Transactions, invoices, and AI agents — all in one warm, minimal interface.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;
  background:rgba(246,243,238,0.88);backdrop-filter:blur(20px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-size:18px;font-weight:800;letter-spacing:-0.5px}
.nav-logo span{color:${P.accent}}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:13px;color:${P.textSub};text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${P.text}}
.nav-cta{background:${P.accent};color:#fff;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;text-decoration:none}
.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:80px 24px 60px;
  position:relative;overflow:hidden;
}
.hero::before{
  content:'';position:absolute;inset:0;
  background-image:linear-gradient(${P.border} 1px,transparent 1px),linear-gradient(90deg,${P.border} 1px,transparent 1px);
  background-size:48px 48px;opacity:0.3;
}
.hero-badge{
  position:relative;display:inline-flex;align-items:center;gap:8px;
  background:${P.accentBg};border:1px solid rgba(27,78,216,0.2);
  color:${P.accent};border-radius:20px;padding:6px 16px;
  font-size:11px;font-weight:700;letter-spacing:1.5px;margin-bottom:28px;
}
h1{
  position:relative;font-size:clamp(40px,7vw,86px);font-weight:800;
  line-height:1.0;letter-spacing:-3px;color:${P.text};margin-bottom:20px;max-width:900px;
}
h1 em{font-style:normal;color:${P.accent}}
.hero-sub{
  position:relative;font-size:clamp(15px,2.2vw,19px);color:${P.textSub};
  max-width:520px;line-height:1.6;margin-bottom:36px;
}
.hero-actions{position:relative;display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:48px}
.btn-primary{background:${P.accent};color:#fff;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none}
.btn-secondary{background:${P.surface};color:${P.text};padding:14px 28px;border-radius:12px;font-size:15px;font-weight:500;text-decoration:none;border:1px solid ${P.border}}
.balance-preview{
  position:relative;background:${P.accent};border-radius:20px;
  padding:28px 28px 22px;width:min(340px,90vw);
  box-shadow:0 24px 64px rgba(27,78,216,0.22),0 4px 16px rgba(27,78,216,0.14);
  margin-bottom:14px;text-align:left;color:#fff;
}
.bal-label{font-size:10px;font-weight:700;letter-spacing:1.2px;opacity:0.6;margin-bottom:4px}
.bal-amount{font-size:44px;font-weight:300;letter-spacing:-2px;line-height:1}
.bal-runway{position:absolute;top:28px;right:28px;background:rgba(255,255,255,0.12);border-radius:10px;padding:8px 14px;text-align:center}
.bal-runway-label{font-size:8px;font-weight:700;letter-spacing:0.8px;opacity:0.5}
.bal-runway-val{font-size:18px;font-weight:600;letter-spacing:-0.5px}
.spark-row{display:flex;align-items:flex-end;gap:3px;margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.15)}
.hero-stat{font-size:10px;opacity:0.65;margin-left:8px;align-self:center}
.metrics-row{display:flex;gap:10px;width:min(340px,90vw);position:relative}
.metric-mini{flex:1;background:${P.surface};border-radius:12px;padding:12px 14px;border:1px solid ${P.border}}
.mm-label{font-size:8px;font-weight:700;letter-spacing:0.8px;margin-bottom:4px;text-transform:uppercase}
.mm-val{font-size:17px;font-weight:600;letter-spacing:-0.4px}
section{max-width:900px;margin:0 auto;padding:80px 24px}
.section-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${P.accent};margin-bottom:12px}
.section-title{font-size:clamp(28px,4vw,48px);font-weight:800;letter-spacing:-1.5px;line-height:1.1;margin-bottom:16px}
.section-sub{font-size:17px;color:${P.textSub};line-height:1.6;max-width:520px;margin-bottom:48px}
.screens-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:32px}
@media(max-width:600px){.screens-grid{grid-template-columns:repeat(2,1fr)}}
.screen-card{background:${P.surface};border:1px solid ${P.border};border-radius:14px;padding:20px;cursor:pointer;transition:border-color .2s,box-shadow .2s}
.screen-card:hover{border-color:${P.accent};box-shadow:0 4px 16px rgba(27,78,216,0.08)}
.sc-icon{font-size:22px;margin-bottom:10px;color:${P.accent}}
.sc-name{font-size:13px;font-weight:600;margin-bottom:4px}
.sc-desc{font-size:11px;color:${P.muted};line-height:1.4}
.sc-num{font-size:9px;font-weight:700;color:${P.border};margin-bottom:8px;font-family:monospace}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
@media(max-width:640px){.features-grid{grid-template-columns:1fr 1fr}}
.feature-card{background:${P.surface};border:1px solid ${P.border};border-radius:14px;padding:24px 20px}
.fi{font-size:20px;margin-bottom:14px;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px}
.fi-blue{background:${P.accentBg};color:${P.accent}}
.fi-amber{background:${P.amberBg};color:${P.amber}}
.fi-green{background:${P.greenBg};color:${P.green}}
.fi-purple{background:${P.purpleBg};color:${P.purple}}
.feature-title{font-size:14px;font-weight:600;margin-bottom:6px}
.feature-desc{font-size:12px;color:${P.textSub};line-height:1.5}
.ds-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px}
.ds-block{background:${P.surface};border:1px solid ${P.border};border-radius:14px;padding:20px}
.ds-label{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${P.muted};margin-bottom:8px}
.ds-val{font-size:32px;font-weight:300;letter-spacing:-1px;margin-bottom:12px}
.palette-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.swatch{text-align:center}
.swatch-color{width:44px;height:44px;border-radius:10px;border:1px solid ${P.border};margin-bottom:4px}
.swatch-label{font-size:9px;color:${P.muted}}
.insp-block{background:${P.surface};border:1px solid ${P.border};border-radius:14px;padding:20px 24px;margin-bottom:12px;display:flex;gap:18px;align-items:flex-start}
.insp-icon{font-size:24px;flex-shrink:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center}
.insp-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${P.accent};margin-bottom:6px}
.insp-text{font-size:13px;color:${P.textSub};line-height:1.6}
.insp-text strong{color:${P.text}}
.cta-band{background:${P.accent};text-align:center;padding:64px 24px}
.cta-band h2{font-size:clamp(28px,4vw,42px);font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:12px}
.cta-band p{font-size:16px;color:rgba(255,255,255,0.7);margin-bottom:28px}
.btn-cta{display:inline-block;background:#fff;color:${P.accent};padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none}
footer{background:${P.text};color:rgba(255,255,255,0.4);text-align:center;padding:32px;font-size:12px;line-height:2}
.footer-logo{font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin-bottom:4px}
.footer-logo span{color:${P.accent}}
</style>
</head>
<body>
<nav>
  <div class="nav-logo">Fl<span>oat</span></div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#design">Design</a>
    <a href="#inspiration">Inspiration</a>
  </div>
  <a href="/float-app-mock" class="nav-cta">Try Mock →</a>
</nav>

<div class="hero">
  <div class="hero-badge">RAM DESIGN HEARTBEAT · MARCH 2026</div>
  <h1>Your money,<br><em>self-managing</em></h1>
  <p class="hero-sub">Float is a financial nerve center for lean teams. Transactions auto-reconciled, invoices tracked, agents handling the books — so you don't have to.</p>
  <div class="hero-actions">
    <a href="/float-app-mock" class="btn-primary">Try Interactive Mock →</a>
    <a href="/float-app-viewer" class="btn-secondary">View in Pencil ↗</a>
  </div>
  <div class="balance-preview">
    <div class="bal-runway">
      <div class="bal-runway-label">RUNWAY</div>
      <div class="bal-runway-val">8.2 mo</div>
    </div>
    <div class="bal-label">TOTAL CASH BALANCE</div>
    <div class="bal-amount">$48,320<span style="font-size:14px;opacity:0.55">.14</span></div>
    <div class="spark-row">${sparkBars}<span class="hero-stat">↑ 12.4% this month</span></div>
  </div>
  <div class="metrics-row">
    <div class="metric-mini">
      <div class="mm-label" style="color:${P.amber}">Income</div>
      <div class="mm-val" style="color:${P.amber}">$12.4K</div>
    </div>
    <div class="metric-mini">
      <div class="mm-label" style="color:${P.red}">Expenses</div>
      <div class="mm-val" style="color:${P.red}">$6.8K</div>
    </div>
    <div class="metric-mini">
      <div class="mm-label" style="color:${P.green}">Net Flow</div>
      <div class="mm-val" style="color:${P.green}">$5.6K</div>
    </div>
  </div>
</div>

<section id="screens">
  <div class="section-label">6 Screens</div>
  <div class="section-title">From overview<br>to every detail</div>
  <p class="section-sub">A complete financial ops flow — from the 10,000-foot cash view to individual invoice line items.</p>
  <div class="screens-grid">
    ${SCREENS.map((s, i) => `
    <div class="screen-card" onclick="location.href='/float-app-viewer'">
      <div class="sc-num">0${i+1}</div>
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-name">${s.name}</div>
      <div class="sc-desc">${s.desc}</div>
    </div>`).join('')}
  </div>
</section>

<section id="features">
  <div class="section-label">Core Features</div>
  <div class="section-title">The financial ops<br>stack for lean teams</div>
  <p class="section-sub">Everything a 1–5 person company needs to stay on top of money — without a CFO, an accountant, or five different SaaS tabs.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="fi fi-blue">◈</div>
      <div class="feature-title">Cash Runway Dashboard</div>
      <div class="feature-desc">Total balance, monthly runway projection, and a live cashflow sparkline — the full picture in one hero card.</div>
    </div>
    <div class="feature-card">
      <div class="fi fi-amber">↕</div>
      <div class="feature-title">Unified Transactions</div>
      <div class="feature-desc">Every payment in and out from all connected accounts — auto-categorized, tagged, and filterable by type.</div>
    </div>
    <div class="feature-card">
      <div class="fi fi-blue">⊟</div>
      <div class="feature-title">Invoice Lifecycle</div>
      <div class="feature-desc">Draft, send, track, and reconcile invoices. Aging indicators surface what needs attention before it's overdue.</div>
    </div>
    <div class="feature-card">
      <div class="fi fi-purple">◎</div>
      <div class="feature-title">Autonomous Agents</div>
      <div class="feature-desc">Reconciler, Invoice Tracker, Tax Prep, Cash Forecast — agents run 24/7 so your books stay current without touching them.</div>
    </div>
    <div class="feature-card">
      <div class="fi fi-green">⊕</div>
      <div class="feature-title">Monthly Reports</div>
      <div class="feature-desc">Revenue vs expenses bar chart, expense category breakdown, and net cashflow delta — all exportable to PDF.</div>
    </div>
    <div class="feature-card">
      <div class="fi fi-amber">▤</div>
      <div class="feature-title">Invoice Detail</div>
      <div class="feature-desc">Full line-item view with one-tap Send Reminder and Mark Paid — the complete billing workflow in a single screen.</div>
    </div>
  </div>
</section>

<section id="design">
  <div class="section-label">Design System</div>
  <div class="section-title">Tabular editorial —<br>finance as document</div>
  <p class="section-sub">Float introduces a "tabular editorial" aesthetic: thin-weight large numerals from the newspaper tradition, warm cream background like quality paper, cobalt blue for trust and authority.</p>
  <div class="ds-row">
    <div class="ds-block">
      <div class="ds-label">Cash Balance — Cobalt</div>
      <div class="ds-val" style="color:${P.accent}">$48.3<span style="font-size:20px">K</span></div>
      <div style="display:flex;align-items:flex-end;gap:3px;height:28px">
        ${[40,55,42,68,55,74,58,82,65,90,72,100].map((v,i) =>
          `<div style="width:10px;height:${v}%;background:${P.accent};border-radius:2px;opacity:${(0.3+(v/100)*0.7).toFixed(2)}"></div>`).join('')}
      </div>
    </div>
    <div class="ds-block">
      <div class="ds-label">Revenue — Amber Gold</div>
      <div class="ds-val" style="color:${P.amber}">$12.4<span style="font-size:20px">K</span></div>
      <div style="margin-top:12px;background:${P.border};border-radius:4px;height:5px">
        <div style="width:72%;height:100%;background:${P.amber};border-radius:4px"></div>
      </div>
      <div style="font-size:10px;color:${P.muted};margin-top:6px">72% of target</div>
    </div>
    <div class="ds-block">
      <div class="ds-label">Net Flow — Green</div>
      <div class="ds-val" style="color:${P.green}">+$5.6<span style="font-size:20px">K</span></div>
      <div style="margin-top:8px;font-size:10px;color:${P.green};background:${P.greenBg};border-radius:6px;padding:4px 8px;display:inline-block">↑ vs $4.4K last month</div>
    </div>
  </div>
  <p class="section-label" style="margin-top:8px">Palette — Warm Cream Light Theme</p>
  <div class="palette-row">
    ${[
      {hex:P.bg,label:'Cream Bg'},{hex:P.surface,label:'White Card'},
      {hex:P.accent,label:'Cobalt'},{hex:P.amber,label:'Amber'},
      {hex:P.green,label:'Positive'},{hex:P.red,label:'Negative'},
      {hex:P.purple,label:'Agent AI'},{hex:P.text,label:'Near-Black'},
    ].map(s=>`<div class="swatch"><div class="swatch-color" style="background:${s.hex}"></div><div class="swatch-label">${s.label}</div></div>`).join('')}
  </div>
</section>

<section id="inspiration">
  <div class="section-label">What Inspired This</div>
  <div class="section-title">Research → Design</div>
  <div class="insp-block">
    <div class="insp-icon">💳</div>
    <div>
      <div class="insp-label">Cardless.com — Land-book.com (Mar 2026)</div>
      <div class="insp-text"><strong>Embedded finance as modular infrastructure.</strong> Cardless's "Build credit in your world" landing page uses a crisp editorial layout — large headline weight, clean tabular components, professional document hierarchy. This directly shaped Float's "financial document meets web app" aesthetic and the invoice detail screen's formal layout.</div>
    </div>
  </div>
  <div class="insp-block">
    <div class="insp-icon">🤖</div>
    <div>
      <div class="insp-label">Midday.ai — Godly.website + darkmodedesign.com</div>
      <div class="insp-text"><strong>"Let agents run your business."</strong> Midday's agentic financial automation — transactions auto-reconciled, invoices auto-matched — gave Float its core premise. The agent log screen and auto-match labeling come directly from studying Midday's approach to "all your transactions, unified."</div>
    </div>
  </div>
  <div class="insp-block">
    <div class="insp-icon">⚡</div>
    <div>
      <div class="insp-label">Paperclip — Lapa Ninja (Mar 2026)</div>
      <div class="insp-text"><strong>"Open-source orchestration for zero-human companies."</strong> Paperclip's framing of entire companies running on autonomous agents pushed Float toward treating AI agents as first-class UI elements — a prominent screen where you watch agents work in real time, not a hidden backend feature.</div>
    </div>
  </div>
</section>

<div class="cta-band">
  <h2>Money that manages itself</h2>
  <p>For founders who'd rather ship than reconcile bank statements.</p>
  <a href="/float-app-mock" class="btn-cta">Open Interactive Mock →</a>
</div>

<footer>
  <div class="footer-logo">Fl<span>oat</span></div>
  <div>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
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
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
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
    screens: 6,
    source: 'heartbeat',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);
  return putRes.status === 200 ? 'OK' : putRes.body.slice(0, 200);
}

(async () => {
  console.log('── Float App Design Discovery Pipeline ──\n');
  console.log('Publishing hero page…');
  const heroHtml = buildHero();
  const heroRes = await zenPut(SLUG, `Float — ${TAGLINE}`, heroHtml);
  console.log(`  hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  try {
    const viewerHtml = buildViewer();
    const viewerRes = await zenPut(`${SLUG}-viewer`, `Float — Design Viewer`, viewerHtml);
    console.log(`  viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  } catch(e) { console.log('  viewer: skipped —', e.message); }

  console.log('Updating GitHub gallery queue…');
  try {
    const qr = await updateGithubQueue();
    console.log('  queue:', qr);
  } catch(e) { console.log('  queue error:', e.message); }

  console.log('\n✓ Pipeline complete');
  console.log(`  Design: https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
