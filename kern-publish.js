'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'kern-crm';
const APP_NAME  = 'Kern CRM';
const TAGLINE   = 'Your work, in focus';
const ARCHETYPE = 'ai-native-crm';
const PROMPT    = 'Inspired by Folk CRM (minimal.gallery/saas) warm AI-first CRM approach + PostHog warm off-white palette. Light-theme AI-native CRM for indie founders: dashboard with AI brief, visual pipeline, client detail with AI intel, invoice tracker, and AI insights screen.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

function zenPublish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function ghReq(opts, body) {
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

const C = {
  bg:       '#F0EDE7',
  surface:  '#FFFFFF',
  surface3: '#EDE9E1',
  border:   '#E2DDD5',
  muted:    '#9E9690',
  fg:       '#1C1916',
  accent:   '#4B5FD8',
  accent2:  '#E8803A',
  green:    '#2EAF7D',
  red:      '#E04B4B',
  ai:       '#7C5CE8',
};

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kern CRM — Your work, in focus</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F0EDE7;--surface:#FFFFFF;--surface3:#EDE9E1;--border:#E2DDD5;
  --fg:#1C1916;--muted:#9E9690;--accent:#4B5FD8;--accent2:#E8803A;
  --green:#2EAF7D;--red:#E04B4B;--ai:#7C5CE8;
}
body{font-family:'Inter',-apple-system,sans-serif;background:var(--bg);color:var(--fg);line-height:1.5}
nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;background:var(--bg);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}
.logo{font-size:18px;font-weight:700;letter-spacing:-0.5px}
.logo span{color:var(--accent)}
nav a{font-size:14px;color:var(--muted);text-decoration:none;margin-left:28px}
.nav-cta{background:var(--accent);color:white;padding:8px 18px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;margin-left:28px}
.hero{max-width:960px;margin:0 auto;padding:80px 48px 60px;text-align:center}
.badge{display:inline-flex;align-items:center;gap:8px;background:#EEE9FF;color:var(--ai);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.5px;margin-bottom:28px}
.hero h1{font-size:clamp(38px,6vw,64px);font-weight:700;letter-spacing:-1.5px;line-height:1.1;margin-bottom:20px}
.hero h1 .ac{color:var(--accent)}
.hero p{font-size:18px;color:var(--muted);max-width:520px;margin:0 auto 40px}
.ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-p{background:var(--accent);color:white;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;text-decoration:none;display:inline-block}
.btn-s{background:var(--surface);color:var(--fg);padding:14px 32px;border-radius:10px;font-size:16px;font-weight:500;text-decoration:none;display:inline-block;border:1px solid var(--border)}
.screens{max-width:1200px;margin:60px auto;padding:0 48px;display:flex;gap:20px;overflow-x:auto;padding-bottom:20px;-webkit-overflow-scrolling:touch}
.phone{flex-shrink:0;width:210px;background:var(--surface);border-radius:28px;padding:14px;box-shadow:0 8px 40px rgba(0,0,0,0.10);border:1px solid var(--border)}
.phone h4{font-size:10px;font-weight:600;color:var(--muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;text-align:center}
.art{background:var(--bg);border-radius:16px;padding:10px;aspect-ratio:9/16;overflow:hidden}
.row{background:white;border-radius:6px;padding:5px 7px;margin:3px 0;font-size:8px;display:flex;align-items:center;gap:5px}
.dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.ai-box{background:#EEE9FF;border-radius:8px;padding:7px;margin:5px 0;font-size:7px;color:#4A38AA;line-height:1.5}
.ai-box .lbl{font-size:8px;font-weight:600;color:var(--ai);margin-bottom:2px}
.kpis{display:flex;gap:4px;margin:5px 0}
.kpi{flex:1;background:white;border-radius:6px;padding:5px}
.kpi .v{font-size:11px;font-weight:700}
.kpi .l{font-size:7px;color:var(--muted);margin-top:1px}
.features{max-width:960px;margin:0 auto 80px;padding:0 48px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.fc{background:var(--surface);border-radius:16px;padding:28px;border:1px solid var(--border)}
.fc .ico{font-size:28px;margin-bottom:14px}
.fc h3{font-size:16px;font-weight:600;margin-bottom:8px}
.fc p{font-size:14px;color:var(--muted)}
.ai-band{max-width:868px;margin:0 auto 80px;padding:36px 44px;background:#EEE9FF;border-radius:24px}
.ai-band h2{font-size:28px;font-weight:700;color:var(--ai);margin-bottom:12px}
.ai-band p{font-size:16px;color:#4A38AA;max-width:540px}
.pal{max-width:960px;margin:0 auto 80px;padding:0 48px}
.pal h2{font-size:22px;font-weight:700;margin-bottom:24px}
.swatches{display:flex;gap:16px;flex-wrap:wrap}
.sw{display:flex;align-items:center;gap:10px}
.swc{width:40px;height:40px;border-radius:10px;border:1px solid var(--border)}
.swi .n{font-size:13px;font-weight:600}
.swi .h{font-size:11px;color:var(--muted)}
footer{text-align:center;padding:40px 48px;border-top:1px solid var(--border);font-size:13px;color:var(--muted)}
footer a{color:var(--accent);text-decoration:none}
@media(max-width:768px){nav{padding:14px 20px}.hero,.features,.pal{padding:40px 20px}.hero h1{font-size:36px}.features{grid-template-columns:1fr}.screens{padding:0 20px 20px}.ai-band{margin:0 20px 60px}}
</style>
</head>
<body>

<nav>
  <div class="logo">K<span>ern</span></div>
  <div>
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="/kern-crm-mock" class="nav-cta">Try mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="badge">✦ AI-native since day one</div>
  <h1>Your work,<br><span class="ac">in focus.</span></h1>
  <p>A CRM built for indie founders. Smart follow-ups, deal intelligence, and clean invoicing — no noise.</p>
  <div class="ctas">
    <a href="/kern-crm-mock" class="btn-p">Explore interactive mock →</a>
    <a href="/kern-crm-viewer" class="btn-s">View pen file</a>
  </div>
</section>

<div class="screens">
  <!-- Dashboard -->
  <div class="phone">
    <h4>Dashboard</h4>
    <div class="art">
      <div style="font-size:12px;font-weight:700;margin-bottom:2px">Morning, Sam</div>
      <div style="font-size:8px;color:#9E9690;margin-bottom:6px">Thursday · 26 March 2026</div>
      <div class="ai-box"><div class="lbl">✦ AI Brief</div>3 follow-ups due today. Acme Corp invoice overdue 4 days.</div>
      <div class="kpis">
        <div class="kpi"><div class="v" style="color:#4B5FD8">12</div><div class="l">Deals</div></div>
        <div class="kpi"><div class="v" style="color:#2EAF7D">$8.4k</div><div class="l">MRR</div></div>
        <div class="kpi"><div class="v" style="color:#E04B4B">2</div><div class="l">Overdue</div></div>
      </div>
      <div style="font-size:9px;font-weight:600;margin:6px 0 3px">Activity</div>
      <div class="row"><span>💬</span><span style="flex:1">Lena (Acme) replied</span><div class="dot" style="background:#4B5FD8"></div></div>
      <div class="row"><span>📄</span><span style="flex:1">Invoice #0044 sent</span><div class="dot" style="background:#2EAF7D"></div></div>
      <div class="row"><span>🤝</span><span style="flex:1">Novo moved stage</span><div class="dot" style="background:#E8803A"></div></div>
      <div style="font-size:9px;font-weight:600;margin:6px 0 3px">Pipeline</div>
      <div style="display:flex;gap:4px">
        <div style="flex:1;background:white;border-radius:5px;padding:4px 5px;font-size:9px;font-weight:700;color:#9E9690">4<div style="font-size:7px;font-weight:400">Lead</div></div>
        <div style="flex:1;background:white;border-radius:5px;padding:4px 5px;font-size:9px;font-weight:700;color:#4B5FD8">3<div style="font-size:7px;font-weight:400">Prop</div></div>
        <div style="flex:1;background:white;border-radius:5px;padding:4px 5px;font-size:9px;font-weight:700;color:#E8803A">2<div style="font-size:7px;font-weight:400">Neg</div></div>
        <div style="flex:1;background:white;border-radius:5px;padding:4px 5px;font-size:9px;font-weight:700;color:#2EAF7D">7<div style="font-size:7px;font-weight:400">Won</div></div>
      </div>
    </div>
  </div>

  <!-- Pipeline -->
  <div class="phone">
    <h4>Pipeline</h4>
    <div class="art">
      <div style="font-size:12px;font-weight:700;margin-bottom:2px">Pipeline</div>
      <div style="font-size:8px;color:#9E9690;margin-bottom:6px">12 deals · $64k tracked</div>
      <div style="display:flex;gap:3px;margin-bottom:7px">
        <span style="background:#4B5FD8;color:white;padding:2px 7px;border-radius:9px;font-size:8px;font-weight:600">All</span>
        <span style="background:#EDE9E1;color:#9E9690;padding:2px 7px;border-radius:9px;font-size:8px">My deals</span>
        <span style="background:#EDE9E1;color:#9E9690;padding:2px 7px;border-radius:9px;font-size:8px">Stalled</span>
      </div>
      <div class="row" style="justify-content:space-between"><span style="font-weight:600">Acme Corp</span><span style="font-size:7px;background:#EDE9E1;color:#9E9690;padding:1px 4px;border-radius:4px">Proposal</span><span style="font-weight:700">$12k</span><div class="dot" style="background:#2EAF7D"></div></div>
      <div class="row" style="justify-content:space-between"><span style="font-weight:600">Novo Systems</span><span style="font-size:7px;background:#FFF3E8;color:#E8803A;padding:1px 4px;border-radius:4px">Negotiate</span><span style="font-weight:700">$28k</span><div class="dot" style="background:#E04B4B"></div></div>
      <div class="row" style="justify-content:space-between"><span style="font-weight:600">Greenfield</span><span style="font-size:7px;background:#EDE9E1;color:#9E9690;padding:1px 4px;border-radius:4px">Lead</span><span style="font-weight:700">$4.5k</span><div class="dot" style="background:#2EAF7D"></div></div>
      <div class="row" style="justify-content:space-between"><span style="font-weight:600">Brynox Inc</span><span style="font-size:7px;background:#EDE9E1;color:#9E9690;padding:1px 4px;border-radius:4px">Proposal</span><span style="font-weight:700">$9.2k</span><div class="dot" style="background:#E8803A"></div></div>
      <div class="ai-box" style="margin-top:6px"><div class="lbl">✦ AI nudge</div>Novo stalled 12d — send refreshed deck.</div>
    </div>
  </div>

  <!-- Client Detail -->
  <div class="phone">
    <h4>Client Detail</h4>
    <div class="art">
      <div style="font-size:9px;color:#4B5FD8;margin-bottom:6px">← Pipeline</div>
      <div style="background:white;border-radius:8px;padding:8px;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700">Chris Yuen</div>
        <div style="font-size:7px;color:#9E9690">Head of Ops · Novo Systems</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
          <span style="background:#FFF3E8;color:#E8803A;font-size:7px;padding:2px 5px;border-radius:4px">Negotiate</span>
          <span style="font-size:10px;font-weight:700">$28,000</span>
        </div>
      </div>
      <div class="ai-box"><div class="lbl">✦ AI Intel</div>Replies after 6pm. Novo raised Series A — budget may have expanded.</div>
      <div style="font-size:9px;font-weight:600;margin:6px 0 4px">Timeline</div>
      <div class="row"><span style="color:#4B5FD8;font-size:10px">●</span><span>Proposal v2 sent · 2d ago</span></div>
      <div class="row"><span style="color:#9E9690;font-size:10px">●</span><span>Call 38 min · 5d ago</span></div>
      <div class="row"><span style="color:#2EAF7D;font-size:10px">●</span><span>NDA signed · 10d ago</span></div>
      <div style="display:flex;gap:4px;margin-top:6px">
        <div style="flex:1;background:#4B5FD8;color:white;border-radius:6px;padding:5px;text-align:center;font-size:8px;font-weight:600">Email</div>
        <div style="flex:1;background:white;border-radius:6px;padding:5px;text-align:center;font-size:8px">Call</div>
        <div style="flex:1;background:#EEE9FF;border-radius:6px;padding:5px;text-align:center;font-size:8px;color:#7C5CE8">✦ AI</div>
      </div>
    </div>
  </div>

  <!-- Invoices -->
  <div class="phone">
    <h4>Invoices</h4>
    <div class="art">
      <div style="font-size:12px;font-weight:700;margin-bottom:6px">Invoices</div>
      <div style="display:flex;gap:3px;margin-bottom:6px">
        <div style="flex:1;background:white;border-radius:5px;padding:5px">
          <div style="font-size:9px;font-weight:700;color:#E8803A">$21.2k</div>
          <div style="font-size:6px;color:#9E9690">Outstanding</div>
        </div>
        <div style="flex:1;background:white;border-radius:5px;padding:5px">
          <div style="font-size:9px;font-weight:700;color:#2EAF7D">$14.8k</div>
          <div style="font-size:6px;color:#9E9690">Paid</div>
        </div>
        <div style="flex:1;background:white;border-radius:5px;padding:5px">
          <div style="font-size:9px;font-weight:700;color:#E04B4B">$6.4k</div>
          <div style="font-size:6px;color:#9E9690">Overdue</div>
        </div>
      </div>
      <div class="row" style="justify-content:space-between"><span style="font-weight:600">Acme Corp</span><span style="font-weight:700">$3.2k</span><span style="font-size:7px;background:#FFE8E8;color:#E04B4B;padding:1px 4px;border-radius:3px">Overdue</span></div>
      <div class="row" style="justify-content:space-between"><span style="font-weight:600">Novo Systems</span><span style="font-weight:700">$14k</span><span style="font-size:7px;background:#E8EDFF;color:#4B5FD8;padding:1px 4px;border-radius:3px">Sent</span></div>
      <div class="row" style="justify-content:space-between"><span style="font-weight:600">Greenfield</span><span style="font-weight:700">$4k</span><span style="font-size:7px;background:#E2F5EE;color:#2EAF7D;padding:1px 4px;border-radius:3px">Paid</span></div>
      <div class="row" style="justify-content:space-between"><span style="font-weight:600">Brynox Inc</span><span style="font-weight:700">$9.2k</span><span style="font-size:7px;background:#EDE9E1;color:#9E9690;padding:1px 4px;border-radius:3px">Draft</span></div>
      <div style="background:#4B5FD8;color:white;border-radius:8px;padding:7px;text-align:center;font-size:9px;font-weight:600;margin-top:6px">+ New Invoice</div>
    </div>
  </div>

  <!-- AI Insights -->
  <div class="phone">
    <h4>AI Insights</h4>
    <div class="art">
      <div style="font-size:12px;font-weight:700;margin-bottom:2px">Insights</div>
      <div style="font-size:8px;color:#9E9690;margin-bottom:6px">Week of 24–30 Mar 2026</div>
      <div class="ai-box"><div class="lbl">✦ Weekly wrap</div>Pipeline +18%. Watch Novo — 12d no movement. Best send: Tue/Thu 6–8pm.</div>
      <div style="font-size:9px;font-weight:600;margin:6px 0 4px">Key findings</div>
      <div class="row" style="gap:4px"><span>📈</span><span style="flex:1;font-size:7px">Pipeline +18%</span><span style="font-size:7px;background:#E2F5EE;color:#2EAF7D;padding:1px 4px;border-radius:3px">Growth</span></div>
      <div class="row" style="gap:4px"><span>⏱</span><span style="flex:1;font-size:7px">Deal cycle: 22d (−3d)</span><span style="font-size:7px;background:#E8EDFF;color:#4B5FD8;padding:1px 4px;border-radius:3px">Efficiency</span></div>
      <div class="row" style="gap:4px"><span>⚠️</span><span style="flex:1;font-size:7px">Acme: 4d no reply</span><span style="font-size:7px;background:#FFE8E8;color:#E04B4B;padding:1px 4px;border-radius:3px">At risk</span></div>
      <div class="row" style="gap:4px"><span>✉️</span><span style="flex:1;font-size:7px">Best: Tue/Thu 6–8pm</span><span style="font-size:7px;background:#EEE9FF;color:#7C5CE8;padding:1px 4px;border-radius:3px">Tip</span></div>
    </div>
  </div>
</div>

<!-- Features -->
<section class="features">
  <div class="fc">
    <div class="ico">✦</div>
    <h3>AI-Powered Intel</h3>
    <p>Daily briefs, deal risk scores, and optimal send-time recommendations — from your own data.</p>
  </div>
  <div class="fc">
    <div class="ico">◈</div>
    <h3>Visual Pipeline</h3>
    <p>Track every deal through stages with stall detection and one-tap AI nudges to unblock stuck deals.</p>
  </div>
  <div class="fc">
    <div class="ico">◻</div>
    <h3>Integrated Invoicing</h3>
    <p>Send, track, and reconcile invoices without leaving your CRM. Overdue alerts included.</p>
  </div>
</section>

<div class="ai-band">
  <h2>✦ Built for the AI-first era</h2>
  <p>Kern doesn't just store your contacts — it reasons about them. Inspired by how Folk, Linear, and Mixpanel are all weaving AI into the product core, not bolting it on after the fact.</p>
</div>

<section class="pal">
  <h2>Design palette</h2>
  <div class="swatches">
    <div class="sw"><div class="swc" style="background:#F0EDE7"></div><div class="swi"><div class="n">Cream</div><div class="h">#F0EDE7</div></div></div>
    <div class="sw"><div class="swc" style="background:#4B5FD8"></div><div class="swi"><div class="n">Indigo</div><div class="h">#4B5FD8</div></div></div>
    <div class="sw"><div class="swc" style="background:#E8803A"></div><div class="swi"><div class="n">Amber</div><div class="h">#E8803A</div></div></div>
    <div class="sw"><div class="swc" style="background:#7C5CE8"></div><div class="swi"><div class="n">AI Purple</div><div class="h">#7C5CE8</div></div></div>
    <div class="sw"><div class="swc" style="background:#2EAF7D"></div><div class="swi"><div class="n">Success</div><div class="h">#2EAF7D</div></div></div>
    <div class="sw"><div class="swc" style="background:#E04B4B"></div><div class="swi"><div class="n">Danger</div><div class="h">#E04B4B</div></div></div>
  </div>
</section>

<footer>
  <p>Kern CRM — RAM Design Heartbeat &nbsp;·&nbsp; <a href="/kern-crm-viewer">View pen file</a> &nbsp;·&nbsp; <a href="/kern-crm-mock">Interactive mock ☀◑</a></p>
</footer>
</body>
</html>`;

async function main() {
  console.log('Publishing Kern CRM…');

  // a) Hero
  let res = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero ${SLUG}: HTTP ${res.status}`);

  // b) Viewer with embedded pen
  const penJson = fs.readFileSync(path.join(__dirname, 'kern.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${APP_NAME} — Pen Viewer</title>
  ${injection}
  <style>body{margin:0;background:#F0EDE7;font-family:Inter,sans-serif;display:flex;flex-direction:column;align-items:center;padding:40px 20px;min-height:100vh}
  h1{font-size:22px;font-weight:700;color:#1C1916;margin-bottom:4px}
  .sub{font-size:13px;color:#9E9690;margin-bottom:28px}
  pre{background:white;border:1px solid #E2DDD5;border-radius:12px;padding:24px;max-width:900px;width:100%;overflow:auto;font-size:10px;max-height:600px;color:#1C1916;white-space:pre-wrap;word-break:break-all}
  a{color:#4B5FD8;text-decoration:none;margin-top:20px;display:inline-block}</style>
  </head><body>
  <h1>Kern CRM — Pen File</h1>
  <div class="sub">pencil.dev v2.8 · 5 screens · LIGHT theme</div>
  <pre id="out">Loading...</pre>
  <a href="/kern-crm">← Back to hero</a> &nbsp; <a href="/kern-crm-mock">Interactive mock →</a>
  <script>
    try{
      const pen=JSON.parse(window.EMBEDDED_PEN);
      document.getElementById('out').textContent=JSON.stringify(pen,null,2);
    }catch(e){document.getElementById('out').textContent='Error: '+e.message;}
  </script>
  </body></html>`;

  res = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
  console.log(`  Viewer ${SLUG}-viewer: HTTP ${res.status}`);

  // d) Gallery queue
  const getRes = await ghReq({
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
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:  new Date().toISOString(),
    published_at:  new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
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
  const putRes = await ghReq({
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
  console.log(`  Gallery queue: HTTP ${putRes.status === 200 ? '200 OK' : putRes.body.slice(0, 80)}`);

  console.log('\n✓ All published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock (pending)`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
