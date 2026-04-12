// claro-publish.js — Full Design Discovery pipeline for CLARO
'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG     = 'claro';
const APP_NAME = 'Claro';
const TAGLINE  = 'Financial clarity for independent minds';
const ARCHETYPE = 'finance-productivity';

const ORIGINAL_PROMPT = `Design Claro — a light-themed financial intelligence app for independent consultants. Inspired by:

1. Midday.ai (featured on darkmodedesign.com) — "The business stack for modern founders." Clean white UI, Hedvig Letters Sans, functional financial design that avoids cold blue/teal clichés.
2. 108 Supply (darkmodedesign.com) — Deep editorial typography approach (Season Sans, #111111 bg, #F6F4F1 cream). Inverted here to warm cream light ground with near-black ink.
3. Lapa Ninja / JetBrains Air aesthetic — Professional tools with editorial confidence, large display numerics.

Trend challenge: "Editorial Light Fintech" — warm cream backgrounds (#F8F5F0), bold display numerics, editorial type scale, burnt sienna (#C4622D) replacing cold blues. 5 screens: Overview · Revenue · Clients · Invoices · Insights.`;

// ── HTTP helpers ────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function get_(host, path_) {
  return httpsReq({ hostname: host, path: path_, method: 'GET', headers: { 'User-Agent': 'ram/1.0' } });
}

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

// ── Build viewer HTML ────────────────────────────────────────────────────────
async function buildViewerHTML(penJson) {
  const r = await get_('ram.zenbin.org', '/viewer');
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${APP_NAME} Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue ─────────────────────────────────────────────────────────────
async function updateGalleryQueue(designUrl, mockUrl) {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const now = new Date().toISOString();
  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   designUrl,
    mock_url:     mockUrl,
    submitted_at: now,
    published_at: now,
    credit:       'RAM Design Heartbeat',
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = now;

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await httpsReq({
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

  return putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120);
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const P = {
  bg:      '#F8F5F0',
  surface: '#FFFFFF',
  surface2:'#F2EFE9',
  surface3:'#EBE6DE',
  text:    '#1A1210',
  muted:   'rgba(26,18,16,0.45)',
  accent:  '#C4622D',
  accentS: 'rgba(196,98,45,0.12)',
  green:   '#3D6B57',
  greenS:  'rgba(61,107,87,0.12)',
  rose:    '#B04A6E',
  border:  'rgba(26,18,16,0.08)',
  borderM: 'rgba(26,18,16,0.14)',
};

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${P.bg};--surface:${P.surface};--surface2:${P.surface2};--surface3:${P.surface3};
    --text:${P.text};--muted:${P.muted};--dim:rgba(26,18,16,0.22);
    --accent:${P.accent};--accent-s:${P.accentS};
    --green:${P.green};--green-s:${P.greenS};
    --rose:${P.rose};--rose-s:rgba(176,74,110,0.10);
    --border:${P.border};--border-m:${P.borderM};
  }
  html{background:var(--bg);color:var(--text);font-family:'DM Sans',system-ui,sans-serif}
  body{min-height:100vh;overflow-x:hidden}

  nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,245,240,0.90);
    backdrop-filter:blur(20px);border-bottom:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:60px}
  .logo{font-size:18px;font-weight:800;letter-spacing:-0.5px;color:var(--text);text-decoration:none}
  .logo em{color:var(--accent);font-style:normal}
  .nav-links{display:flex;gap:32px}
  .nav-links a{text-decoration:none;color:var(--muted);font-size:14px;font-weight:500;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--accent);color:#fff;border:none;padding:10px 22px;border-radius:10px;
    font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;transition:opacity .2s}
  .nav-cta:hover{opacity:.85}

  .hero{min-height:100vh;display:flex;align-items:center;padding:100px 40px 60px;
    max-width:1240px;margin:0 auto;gap:72px}
  .hero-left{flex:1}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--accent-s);
    border:1px solid rgba(196,98,45,0.20);color:var(--accent);padding:6px 16px;
    border-radius:20px;font-size:12px;font-weight:600;margin-bottom:28px;letter-spacing:0.2px}
  h1{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(44px,5.5vw,70px);
    line-height:1.05;font-weight:400;color:var(--text);letter-spacing:-0.5px;margin-bottom:22px}
  h1 em{color:var(--accent);font-style:italic}
  .hero-sub{font-size:18px;color:var(--muted);line-height:1.7;max-width:500px;margin-bottom:42px}
  .hero-actions{display:flex;gap:14px;flex-wrap:wrap}
  .btn-primary{background:var(--accent);color:#fff;text-decoration:none;padding:15px 30px;
    border-radius:14px;font-size:15px;font-weight:700;transition:opacity .2s;display:inline-block}
  .btn-primary:hover{opacity:.87}
  .btn-outline{background:transparent;color:var(--text);text-decoration:none;padding:15px 30px;
    border-radius:14px;font-size:15px;font-weight:600;border:1.5px solid var(--border-m);
    transition:border-color .2s;display:inline-block}
  .btn-outline:hover{border-color:var(--text)}
  .trust{display:flex;align-items:center;gap:10px;margin-top:44px;font-size:13px;color:var(--muted)}
  .avatars{display:flex}
  .av{width:30px;height:30px;border-radius:50%;background:var(--surface3);border:2px solid var(--bg);
    display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;
    color:var(--text);margin-left:-8px}
  .av:first-child{margin-left:0}

  .hero-right{flex:0 0 320px;display:flex;flex-direction:column;align-items:center;gap:16px}
  .phone{width:290px;background:var(--bg);border-radius:38px;overflow:hidden;
    border:2px solid var(--border-m);
    box-shadow:0 32px 80px rgba(26,18,16,0.10),0 4px 16px rgba(26,18,16,0.06);position:relative}
  .phone-top{background:var(--bg);padding:14px 20px 0;font-family:'DM Sans',sans-serif}
  .ph-status{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:var(--text);margin-bottom:14px}
  .ph-greeting{font-size:10px;color:var(--muted);margin-bottom:3px}
  .ph-name{font-size:21px;font-weight:800;color:var(--text);margin-bottom:14px;letter-spacing:-0.3px}
  .ph-card{background:var(--surface);border-radius:16px;padding:14px 16px;
    border:1px solid var(--border);margin-bottom:10px}
  .ph-lbl{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px}
  .ph-amt{font-size:28px;font-weight:800;color:var(--text);letter-spacing:-0.5px}
  .ph-up{font-size:10px;color:var(--green);font-weight:600;margin-top:3px}
  .ph-barBg{background:var(--surface3);border-radius:4px;height:5px;margin-top:12px}
  .ph-barFill{background:var(--green);border-radius:4px;height:5px;width:80%}
  .ph-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px}
  .ph-stat{background:var(--surface);border-radius:12px;padding:10px 6px;
    border:1px solid var(--border);text-align:center}
  .ph-sv{font-size:16px;font-weight:800;color:var(--text)}
  .ph-sl{font-size:8px;color:var(--muted)}
  .ph-row{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--border)}
  .ph-icon{width:28px;height:28px;border-radius:9px;background:var(--green-s);
    display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--green);font-weight:800}
  .ph-ri{flex:1}
  .ph-rt{font-size:11px;font-weight:600;color:var(--text)}
  .ph-rs{font-size:9px;color:var(--muted)}
  .ph-rv{font-size:12px;font-weight:700;color:var(--green)}
  .ph-nav{display:flex;justify-content:space-around;padding:12px 0 18px;border-top:1px solid var(--border-m)}
  .ph-ni{display:flex;flex-direction:column;align-items:center;gap:2px}
  .ph-nicon{font-size:14px;color:var(--muted)}
  .ph-nlbl{font-size:7px;color:var(--muted)}
  .ph-ni.active .ph-nicon,.ph-ni.active .ph-nlbl{color:var(--accent)}

  .stats-band{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:52px 40px}
  .stats-inner{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
  .si{text-align:center}
  .sn{font-family:'DM Serif Display',serif;font-size:48px;color:var(--text)}
  .sl{font-size:14px;color:var(--muted);margin-top:4px}

  .section{padding:80px 40px;max-width:1240px;margin:0 auto}
  .sec-badge{font-size:11px;font-weight:700;letter-spacing:2.5px;color:var(--accent);
    text-transform:uppercase;margin-bottom:14px}
  .sec-title{font-family:'DM Serif Display',serif;font-size:clamp(30px,3.8vw,48px);
    color:var(--text);margin-bottom:52px;max-width:500px;line-height:1.15}
  .fg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
  .fc{background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:30px;
    transition:box-shadow .2s,transform .2s}
  .fc:hover{box-shadow:0 14px 44px rgba(26,18,16,0.07);transform:translateY(-2px)}
  .fi{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;
    justify-content:center;font-size:19px;margin-bottom:18px}
  .fi.o{background:var(--accent-s)}
  .fi.g{background:var(--green-s)}
  .fi.w{background:rgba(139,115,85,0.12)}
  .ft{font-size:16px;font-weight:700;margin-bottom:8px;color:var(--text)}
  .fb{font-size:14px;color:var(--muted);line-height:1.65}

  .testimonial{padding:80px 40px;background:var(--surface2)}
  .ti{max-width:700px;margin:0 auto;text-align:center}
  .tq{font-family:'DM Serif Display',serif;font-size:clamp(22px,3vw,34px);
    line-height:1.4;color:var(--text);margin-bottom:28px;font-style:italic}
  .ta{font-size:14px;color:var(--muted);font-weight:600}

  .cta-sec{padding:80px 40px;max-width:1240px;margin:0 auto;text-align:center}
  .cta-card{background:var(--accent);border-radius:30px;padding:72px 40px}
  .cta-title{font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,50px);color:#fff;margin-bottom:14px}
  .cta-sub{font-size:18px;color:rgba(255,255,255,0.75);margin-bottom:38px}
  .btn-w{background:#fff;color:var(--accent);text-decoration:none;padding:16px 36px;
    border-radius:14px;font-size:15px;font-weight:800;display:inline-block}

  footer{border-top:1px solid var(--border);padding:36px 40px;text-align:center;
    font-size:13px;color:var(--muted)}
  footer a{color:var(--accent);text-decoration:none;font-weight:600}

  @media(max-width:900px){
    .hero{flex-direction:column;padding-top:90px}
    .hero-right{flex:none}
    .fg{grid-template-columns:1fr 1fr}
    .stats-inner{grid-template-columns:1fr 1fr}
  }
  @media(max-width:560px){
    .fg{grid-template-columns:1fr}
    nav{padding:0 20px}
    .nav-links{display:none}
  }
</style>
</head>
<body>

<nav>
  <a href="/${SLUG}" class="logo">Clar<em>o</em></a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#insights">AI Insights</a>
    <a href="/${SLUG}-viewer">Prototype →</a>
  </div>
  <a href="/${SLUG}-mock" class="nav-cta">Try Mock ☀◑</a>
</nav>

<div class="hero">
  <div class="hero-left">
    <div class="hero-badge">◎ AI-powered · Financial clarity</div>
    <h1>Know where your<br><em>money truly</em><br>comes from.</h1>
    <p class="hero-sub">Claro is the financial intelligence layer for independent consultants. Track invoices, understand revenue patterns, and get AI-powered clarity — all in one focused, warm app.</p>
    <div class="hero-actions">
      <a href="/${SLUG}-mock" class="btn-primary">Interactive mock ☀◑</a>
      <a href="/${SLUG}-viewer" class="btn-outline">View prototype →</a>
    </div>
    <div class="trust">
      <div class="avatars">
        <div class="av">JK</div><div class="av">AL</div><div class="av">MR</div><div class="av">+</div>
      </div>
      Trusted by 1,200+ independent consultants
    </div>
  </div>
  <div class="hero-right">
    <div class="phone">
      <div class="phone-top">
        <div class="ph-status"><span>9:41</span><span>▪▪▪</span></div>
        <div class="ph-greeting">Good morning,</div>
        <div class="ph-name">Jordan.</div>
        <div class="ph-card">
          <div class="ph-lbl">Total Earned · 2025</div>
          <div class="ph-amt">$84,320</div>
          <div class="ph-up">↑ 22% vs last year</div>
          <div class="ph-barBg"><div class="ph-barFill"></div></div>
        </div>
        <div class="ph-grid">
          <div class="ph-stat"><div class="ph-sv">12</div><div class="ph-sl">Clients</div></div>
          <div class="ph-stat"><div class="ph-sv" style="color:#B04A6E">$3.1K</div><div class="ph-sl">Outstanding</div></div>
          <div class="ph-stat"><div class="ph-sv">94%</div><div class="ph-sl">On-time</div></div>
        </div>
        <div class="ph-row">
          <div class="ph-icon">◈</div>
          <div class="ph-ri"><div class="ph-rt">Acme Corp</div><div class="ph-rs">Invoice paid · Mar 27</div></div>
          <div class="ph-rv">+$4,200</div>
        </div>
        <div class="ph-row" style="border:none">
          <div class="ph-icon" style="background:rgba(196,98,45,0.12);color:#C4622D">⏱</div>
          <div class="ph-ri"><div class="ph-rt">Bloom Studio</div><div class="ph-rs">Pending · $1,850</div></div>
          <div class="ph-rv" style="color:#C4622D">Apr 10</div>
        </div>
        <div class="ph-nav">
          <div class="ph-ni active"><div class="ph-nicon">⬡</div><div class="ph-nlbl">Overview</div></div>
          <div class="ph-ni"><div class="ph-nicon">◈</div><div class="ph-nlbl">Revenue</div></div>
          <div class="ph-ni"><div class="ph-nicon">◉</div><div class="ph-nlbl">Clients</div></div>
          <div class="ph-ni"><div class="ph-nicon">≡</div><div class="ph-nlbl">Invoices</div></div>
          <div class="ph-ni"><div class="ph-nicon">◎</div><div class="ph-nlbl">Insights</div></div>
        </div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--muted);text-align:center">
      <a href="/${SLUG}-mock" style="color:var(--accent);font-weight:600;text-decoration:none">Interactive mock ☀◑ →</a>
    </div>
  </div>
</div>

<div class="stats-band">
  <div class="stats-inner">
    <div class="si"><div class="sn">$2.4M</div><div class="sl">invoiced through Claro</div></div>
    <div class="si"><div class="sn">94%</div><div class="sl">on-time payment rate</div></div>
    <div class="si"><div class="sn">1,200+</div><div class="sl">independent consultants</div></div>
    <div class="si"><div class="sn">22%</div><div class="sl">average revenue increase</div></div>
  </div>
</div>

<section class="section" id="features">
  <div class="sec-badge">What Claro does</div>
  <div class="sec-title">Everything that matters, nothing that doesn't.</div>
  <div class="fg">
    <div class="fc"><div class="fi o">◈</div><div class="ft">Revenue clarity</div><div class="fb">See exactly where every pound and dollar comes from. Revenue by client, stream, and time — with beautiful year-on-year comparisons.</div></div>
    <div class="fc"><div class="fi g">◎</div><div class="ft">AI-powered insights</div><div class="fb">Claro learns your earning patterns and surfaces actionable insights — from rate recommendations to concentration risk alerts.</div></div>
    <div class="fc"><div class="fi w">≡</div><div class="ft">Invoice intelligence</div><div class="fb">Create, send, and track invoices. Know exactly who owes you, what's overdue, and get smart reminders before things get awkward.</div></div>
    <div class="fc"><div class="fi o">◉</div><div class="ft">Client health scores</div><div class="fb">Every client gets a score based on payment timing and growth. Know who's your best relationship at a glance.</div></div>
    <div class="fc"><div class="fi g">⬡</div><div class="ft">Goal tracking</div><div class="fb">Set monthly and annual revenue goals. Claro tracks progress in real time with simple, visual indicators — not overwhelming charts.</div></div>
    <div class="fc"><div class="fi w">↑</div><div class="ft">Runway forecasting</div><div class="fb">Know how long you can coast, when to find new clients, and what your next quarter looks like — before it surprises you.</div></div>
  </div>
</section>

<section class="testimonial">
  <div class="ti">
    <div class="tq">"I used to guess how much I was earning. Claro gave me the same financial clarity I had in corporate — but built for my independent practice."</div>
    <div class="ta">— Jordan K., Strategy Consultant · London</div>
  </div>
</section>

<div class="cta-sec">
  <div class="cta-card">
    <div class="cta-title">Ready for clarity?</div>
    <div class="cta-sub">Join 1,200+ consultants who know exactly where they stand.</div>
    <a href="/${SLUG}-mock" class="btn-w">Try the interactive mock →</a>
  </div>
</div>

<footer>
  <p>Claro — <em>Financial clarity for independent minds</em></p>
  <p style="margin-top:8px">
    Design by <a href="https://ram.zenbin.org">RAM</a> ·
    <a href="/${SLUG}-viewer">Prototype</a> ·
    <a href="/${SLUG}-mock">Interactive Mock ☀◑</a>
  </p>
</footer>
</body>
</html>`;

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const penJson = JSON.parse(fs.readFileSync('claro.pen', 'utf8'));
  console.log(`\n── CLARO publish pipeline ──\n`);

  // Hero
  console.log(`Publishing hero → ram.zenbin.org/${SLUG} …`);
  const heroRes = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML);
  console.log(`  ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  // Viewer
  console.log(`Publishing viewer → ram.zenbin.org/${SLUG}-viewer …`);
  const viewerHTML = await buildViewerHTML(penJson);
  const viewerRes  = await publishToZenbin(`${SLUG}-viewer`, `${APP_NAME} — Prototype Viewer`, viewerHTML);
  console.log(`  ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  // Gallery queue
  console.log(`Updating GitHub gallery queue …`);
  try {
    const qRes = await updateGalleryQueue(
      `https://ram.zenbin.org/${SLUG}`,
      `https://ram.zenbin.org/${SLUG}-mock`
    );
    console.log(`  queue: ${qRes}`);
  } catch(e) {
    console.log(`  queue error: ${e.message}`);
  }

  console.log(`\n✓ Done`);
})();
