'use strict';
// publish-tempo-heartbeat.js — Full Design Discovery pipeline for TEMPO

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'tempo';
const VIEWER_SLUG = 'tempo-viewer';
const APP_NAME    = 'TEMPO';

const meta = {
  appName:   'TEMPO',
  tagline:   'Personal Energy OS for solopreneurs. Know your energy, own your day.',
  archetype: 'productivity-wellness',
  palette: {
    bg:      '#F6F2EB',
    surface: '#FFFFFF',
    text:    '#1C1916',
    accent:  '#B85434',
    accent2: '#4E7B5A',
    muted:   '#9A9080',
  },
};

const ORIGINAL_PROMPT = `Design TEMPO — a light-themed Personal Energy OS for solopreneurs. Inspired by:
1. midday.ai (darkmodedesign.com) — their clean transaction-table pattern (date/description/amount/category) reapplied as an "energy log". Also the feature-scroll interaction with animated section transitions.
2. Dawn (lapa.ninja) — "Evidence-based AI for mental health. Private, science-backed." Non-clinical warm approach to personal data.
3. Sanity (land-book.com) — "Content Operating System for the AI era." The "OS" framing applied to personal energy management.
Light palette: warm cream #F6F2EB + terracotta #B85434 + sage #4E7B5A + amber warning.
5 screens: Today overview · Energy Log (table) · Patterns (heatmap) · Focus timer · AI Insights`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
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

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const res = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
  return res;
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TEMPO — Personal Energy OS</title>
<style>
  :root {
    --bg:      #F6F2EB;
    --surface: #FFFFFF;
    --text:    #1C1916;
    --textDim: #52473C;
    --muted:   #9A9080;
    --terra:   #B85434;
    --sage:    #4E7B5A;
    --amber:   #9A6C1C;
    --blue:    #2A5E8A;
    --purple:  #6B4FA0;
    --high:    #4E9E6A;
    --med:     #D4A34A;
    --low:     #D4685A;
    --border:  #E8E3D8;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Inter','Helvetica Neue',sans-serif; min-height:100vh; }

  nav { display:flex; align-items:center; justify-content:space-between; padding:18px 40px; background:var(--surface); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100; }
  .logo { font-size:16px; font-weight:900; letter-spacing:3px; color:var(--text); }
  .logo span { color:var(--terra); }
  .nav-links { display:flex; gap:28px; }
  .nav-links a { font-size:13px; color:var(--muted); text-decoration:none; font-weight:500; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta { background:var(--terra); color:#fff; border:none; padding:10px 22px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; }

  .hero { max-width:920px; margin:0 auto; padding:96px 40px 64px; text-align:center; }
  .hero-eyebrow { display:inline-flex; align-items:center; gap:8px; background:color-mix(in srgb,var(--terra) 12%,transparent); border:1px solid color-mix(in srgb,var(--terra) 30%,transparent); color:var(--terra); border-radius:20px; padding:6px 18px; font-size:10.5px; font-weight:700; letter-spacing:1px; margin-bottom:28px; text-transform:uppercase; }
  .pulse { width:6px; height:6px; background:var(--terra); border-radius:50%; animation:pulse 2s infinite; }
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
  h1 { font-size:clamp(38px,5.5vw,68px); font-weight:900; line-height:1.05; letter-spacing:-2px; margin-bottom:24px; }
  h1 em { color:var(--terra); font-style:normal; }
  .hero-sub { font-size:17px; color:var(--textDim); max-width:520px; margin:0 auto 44px; line-height:1.7; }
  .hero-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:72px; }
  .btn-primary { background:var(--terra); color:#fff; padding:14px 32px; border-radius:10px; font-size:14px; font-weight:700; text-decoration:none; border:none; cursor:pointer; }
  .btn-ghost { background:var(--surface); color:var(--text); border:1.5px solid var(--border); padding:14px 32px; border-radius:10px; font-size:14px; font-weight:600; text-decoration:none; }

  /* Energy ring hero visual */
  .ring-visual { display:flex; justify-content:center; gap:48px; align-items:center; flex-wrap:wrap; margin-bottom:80px; }
  .ring-card { background:var(--surface); border:1.5px solid var(--border); border-radius:20px; padding:32px 40px; display:flex; align-items:center; gap:32px; }
  .ring { width:120px; height:120px; border-radius:50%; border:10px solid var(--border); position:relative; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:conic-gradient(var(--high) 0% 65%, var(--med) 65% 87%, var(--low) 87% 100%); }
  .ring-inner { width:90px; height:90px; border-radius:50%; background:var(--surface); display:flex; flex-direction:column; align-items:center; justify-content:center; position:absolute; }
  .ring-score { font-size:28px; font-weight:900; color:var(--text); line-height:1; }
  .ring-label { font-size:10px; color:var(--muted); font-weight:600; letter-spacing:0.5px; }
  .ring-stats { display:flex; flex-direction:column; gap:12px; }
  .ring-stat { display:flex; align-items:center; gap:10px; }
  .ring-bar { width:3px; height:24px; border-radius:2px; }
  .ring-stat-info .rs-label { font-size:11px; color:var(--muted); }
  .ring-stat-info .rs-val { font-size:14px; font-weight:700; color:var(--text); }

  /* Stats strip */
  .stats { display:flex; justify-content:center; gap:0; background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border); overflow:hidden; }
  .stat { flex:1; text-align:center; padding:32px 20px; border-right:1px solid var(--border); }
  .stat:last-child { border-right:none; }
  .stat-val { font-size:30px; font-weight:900; letter-spacing:-1px; }
  .stat-val .accent { color:var(--terra); }
  .stat-lbl { font-size:10.5px; color:var(--muted); font-weight:600; letter-spacing:0.8px; margin-top:4px; text-transform:uppercase; }

  /* Features */
  .section { max-width:920px; margin:80px auto; padding:0 40px; }
  .section-eyebrow { font-size:10.5px; font-weight:700; letter-spacing:2px; color:var(--terra); text-transform:uppercase; margin-bottom:12px; }
  .section-h2 { font-size:clamp(24px,3vw,36px); font-weight:900; letter-spacing:-0.5px; margin-bottom:8px; }
  .section-sub { font-size:14px; color:var(--textDim); line-height:1.6; max-width:480px; }
  .feature-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:18px; margin-top:44px; }
  .feat { background:var(--surface); border:1.5px solid var(--border); border-radius:16px; padding:28px; transition:border-color .2s; }
  .feat:hover { border-color:var(--terra); }
  .feat-icon { font-size:22px; margin-bottom:16px; }
  .feat-title { font-size:15px; font-weight:700; margin-bottom:8px; }
  .feat-desc { font-size:13px; color:var(--textDim); line-height:1.65; }

  /* Heatmap preview */
  .heatmap-preview { background:var(--surface); border:1.5px solid var(--border); border-radius:20px; padding:32px; margin-top:44px; }
  .heatmap-row { display:flex; gap:6px; margin-bottom:6px; align-items:center; }
  .heatmap-label { font-size:10px; color:var(--muted); width:28px; text-align:right; flex-shrink:0; }
  .heat-cell { width:38px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9px; color:rgba(28,25,22,0.65); font-weight:600; }
  .heatmap-days { display:flex; gap:6px; padding-left:34px; margin-bottom:8px; }
  .heatmap-day { width:38px; font-size:10px; color:var(--muted); text-align:center; font-weight:600; }

  /* Log table preview */
  .table-preview { background:var(--surface); border:1.5px solid var(--border); border-radius:16px; overflow:hidden; margin-top:44px; }
  .table-header { display:grid; grid-template-columns:60px 1fr 48px 52px 70px; gap:8px; padding:10px 20px; background:var(--bg); border-bottom:1px solid var(--border); }
  .th { font-size:9.5px; color:var(--muted); font-weight:700; letter-spacing:0.5px; text-transform:uppercase; }
  .table-row { display:grid; grid-template-columns:60px 1fr 48px 52px 70px; gap:8px; padding:12px 20px; border-bottom:1px solid var(--border); align-items:center; }
  .table-row:last-child { border-bottom:none; }
  .td { font-size:12px; color:var(--textDim); }
  .td.session { font-weight:600; color:var(--text); }
  .energy-dot { width:3px; height:16px; border-radius:2px; display:inline-block; margin-right:8px; vertical-align:middle; }
  .score-pill { display:inline-flex; align-items:center; justify-content:center; width:36px; height:22px; border-radius:11px; font-size:11px; font-weight:700; }
  .type-pill { display:inline-flex; align-items:center; justify-content:center; padding:3px 10px; border-radius:11px; font-size:10.5px; font-weight:600; }

  /* CTA */
  .cta { background:var(--terra); padding:80px 40px; text-align:center; }
  .cta h2 { font-size:clamp(28px,4vw,44px); font-weight:900; color:#fff; letter-spacing:-1px; margin-bottom:16px; }
  .cta p { color:rgba(255,255,255,0.75); font-size:16px; margin-bottom:40px; }
  .btn-white { background:#fff; color:var(--terra); padding:16px 36px; border-radius:12px; font-size:15px; font-weight:800; text-decoration:none; display:inline-block; }

  footer { background:var(--text); color:#fff; padding:36px 40px; text-align:center; }
  footer .fl { font-size:14px; font-weight:900; letter-spacing:3px; }
  footer .fl span { color:var(--terra); }
  footer p { font-size:11px; color:rgba(255,255,255,0.35); margin-top:10px; }
</style>
</head>
<body>

<nav>
  <div class="logo">TEM<span>PO</span></div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Patterns</a>
    <a href="#">Insights</a>
    <a href="https://ram.zenbin.org/tempo-viewer">View Design ↗</a>
  </div>
  <button class="nav-cta">Start Free Trial</button>
</nav>

<div class="hero">
  <div class="hero-eyebrow"><span class="pulse"></span>Personal Energy OS</div>
  <h1>Know your <em>energy</em>,<br>own your day.</h1>
  <p class="hero-sub">TEMPO tracks your focus sessions, maps your energy patterns, and helps you design a schedule that works with your biology — not against it.</p>
  <div class="hero-btns">
    <a href="https://ram.zenbin.org/tempo-viewer" class="btn-primary">View Interactive Design →</a>
    <a href="https://ram.zenbin.org/tempo-mock" class="btn-ghost">Live Mock ☀◑</a>
  </div>

  <!-- Energy ring visual -->
  <div class="ring-visual">
    <div class="ring-card">
      <div class="ring">
        <div class="ring-inner">
          <div class="ring-score">78</div>
          <div class="ring-label">score</div>
        </div>
      </div>
      <div class="ring-stats">
        <div class="ring-stat">
          <div class="ring-bar" style="background:#4E9E6A"></div>
          <div class="ring-stat-info">
            <div class="rs-label">Deep Work</div>
            <div class="rs-val">3h 40m</div>
          </div>
        </div>
        <div class="ring-stat">
          <div class="ring-bar" style="background:#D4A34A"></div>
          <div class="ring-stat-info">
            <div class="rs-label">Shallow</div>
            <div class="rs-val">1h 20m</div>
          </div>
        </div>
        <div class="ring-stat">
          <div class="ring-bar" style="background:#D4685A"></div>
          <div class="ring-stat-info">
            <div class="rs-label">Unfocused</div>
            <div class="rs-val">48m</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Stats -->
<div class="stats">
  <div class="stat"><div class="stat-val"><span class="accent">91</span></div><div class="stat-lbl">Peak Focus Score</div></div>
  <div class="stat"><div class="stat-val">18<span class="accent">h</span></div><div class="stat-lbl">Avg Logged / Week</div></div>
  <div class="stat"><div class="stat-val"><span class="accent">↑18%</span></div><div class="stat-lbl">Focus Improvement</div></div>
  <div class="stat"><div class="stat-val">5<span class="accent">×</span></div><div class="stat-lbl">Screens</div></div>
</div>

<!-- Features -->
<div class="section">
  <div class="section-eyebrow">Core Features</div>
  <h2 class="section-h2">Your energy, fully visible.</h2>
  <p class="section-sub">Five interconnected views that turn raw focus time into actionable intelligence.</p>
  <div class="feature-grid">
    <div class="feat">
      <div class="feat-icon">◉</div>
      <div class="feat-title">Today Overview</div>
      <div class="feat-desc">Live energy ring, daily timeline with color-coded blocks, and a quick-add session button.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">≡</div>
      <div class="feat-title">Energy Log</div>
      <div class="feat-desc">Transaction-table UI — inspired by midday.ai — shows every session with time, duration, energy score, and type tags.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">⊞</div>
      <div class="feat-title">Patterns Heatmap</div>
      <div class="feat-desc">4-week energy grid reveals peak hours and strongest days. Color-coded from low to high focus.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">◎</div>
      <div class="feat-title">Focus Mode</div>
      <div class="feat-desc">Live timer ring with session type selector (Deep / Flow / Pomodoro) and real-time energy bars.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">✦</div>
      <div class="feat-title">AI Insights</div>
      <div class="feat-desc">Weekly AI reflection, bar chart of daily scores, and actionable suggestions to protect peak windows.</div>
    </div>
    <div class="feat">
      <div class="feat-icon">∿</div>
      <div class="feat-title">Flow Detection</div>
      <div class="feat-desc">TEMPO learns your flow state signature and alerts you when you're in the zone — or heading out of it.</div>
    </div>
  </div>
</div>

<!-- Heatmap preview -->
<div class="section" style="margin-top:20px">
  <div class="section-eyebrow">Patterns Screen</div>
  <h2 class="section-h2">See when you're unstoppable.</h2>
  <div class="heatmap-preview">
    <div class="heatmap-days">
      <div class="heatmap-day">M</div>
      <div class="heatmap-day">T</div>
      <div class="heatmap-day">W</div>
      <div class="heatmap-day">T</div>
      <div class="heatmap-day">F</div>
    </div>
    ${[
      ['8a',[62,71,68,60,55]],
      ['9a',[85,91,88,84,78]],
      ['10a',[90,93,92,89,82]],
      ['11a',[80,85,84,76,72]],
      ['1p',[65,70,68,63,58]],
      ['2p',[72,76,74,70,64]],
      ['3p',[68,71,70,65,55]],
      ['4p',[55,60,57,52,48]],
    ].map(([h,row])=>`
    <div class="heatmap-row">
      <span class="heatmap-label">${h}</span>
      ${row.map(s=>{
        const alpha = 0.15+(s-40)/60*0.75;
        const color = s>=85?'#4E9E6A':s>=70?'#4E7B5A':s>=60?'#9A6C1C':'#D4685A';
        return `<div class="heat-cell" style="background:${color};opacity:${alpha.toFixed(2)}">${s}</div>`;
      }).join('')}
    </div>`).join('')}
    <p style="font-size:11px;color:#9A9080;margin-top:16px;text-align:center">Your 09:00–11:00 window scores consistently above 88 — protect it.</p>
  </div>
</div>

<!-- Log table preview -->
<div class="section">
  <div class="section-eyebrow">Energy Log Screen</div>
  <h2 class="section-h2">Every session, accounted for.</h2>
  <div class="table-preview">
    <div class="table-header">
      <span class="th">Time</span>
      <span class="th">Session</span>
      <span class="th">Dur</span>
      <span class="th">Score</span>
      <span class="th">Type</span>
    </div>
    ${[
      {t:'09:00',s:'UI Design — TEMPO flows',d:'2h',sc:93,type:'Deep',e:'high'},
      {t:'11:45',s:'Client branding call',d:'45m',sc:67,type:'Meeting',e:'med'},
      {t:'13:30',s:'Code review sprint',d:'1h',sc:81,type:'Deep',e:'high'},
      {t:'14:30',s:'Admin & email triage',d:'30m',sc:52,type:'Shallow',e:'low'},
    ].map(e=>{
      const sc=e.sc>=80?'#4E9E6A':e.sc>=65?'#D4A34A':'#D4685A';
      const ec={high:'#4E9E6A',med:'#D4A34A',low:'#D4685A'}[e.e];
      const tc={Deep:{f:'#2A5E8A',bg:'#E8F2FB'},Meeting:{f:'#B85434',bg:'#FBF0EB'},Shallow:{f:'#9A9080',bg:'#FAF8F4'}}[e.type];
      return `
    <div class="table-row">
      <span class="td">${e.t}</span>
      <span class="td session"><span class="energy-dot" style="background:${ec}"></span>${e.s}</span>
      <span class="td">${e.d}</span>
      <span class="score-pill" style="background:${sc}22;color:${sc}">${e.sc}</span>
      <span class="type-pill" style="background:${tc.bg};color:${tc.f}">${e.type}</span>
    </div>`;
    }).join('')}
  </div>
</div>

<!-- CTA -->
<div class="cta">
  <h2>Design your best days.</h2>
  <p>See the full 5-screen TEMPO prototype — light/dark interactive mock included.</p>
  <a href="https://ram.zenbin.org/tempo-mock" class="btn-white">Open Interactive Mock →</a>
</div>

<footer>
  <div class="fl">TEM<span>PO</span></div>
  <p>RAM Design Heartbeat · ram.zenbin.org/tempo · Built with pencil.dev</p>
</footer>

</body>
</html>`;
}

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TEMPO — Design Viewer</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#1A1714; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:'Inter',sans-serif; }
  .viewer-wrap { text-align:center; }
  .viewer-label { color:rgba(255,255,255,0.4); font-size:11px; letter-spacing:2px; text-transform:uppercase; margin-bottom:20px; }
  .viewer-label span { color:#B85434; }
  iframe { border:none; border-radius:20px; box-shadow:0 40px 80px rgba(0,0,0,0.6); }
  .viewer-links { margin-top:20px; display:flex; gap:16px; justify-content:center; }
  .viewer-links a { color:rgba(255,255,255,0.5); font-size:12px; text-decoration:none; }
  .viewer-links a:hover { color:#B85434; }
</style>
<script>
// Pencil viewer bootstrap
window.addEventListener('DOMContentLoaded', () => {
  const pre = document.getElementById('pen-data');
  if (pre && window.EMBEDDED_PEN) {
    pre.textContent = window.EMBEDDED_PEN;
  }
});
<\/script>
</head>
<body>
<div class="viewer-wrap">
  <div class="viewer-label"><span>TEMPO</span> — Personal Energy OS · 5 Screens</div>
  <div id="pencil-viewer">
    <pre id="pen-data" style="display:none"></pre>
    <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-top:40px">Pen data embedded. Open in Pencil.dev to view.</p>
  </div>
  <div class="viewer-links">
    <a href="https://ram.zenbin.org/tempo">← Hero Page</a>
    <a href="https://ram.zenbin.org/tempo-mock">Interactive Mock →</a>
  </div>
</div>
</body>
</html>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('━━ TEMPO Heartbeat Pipeline ━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // a) Hero page
  console.log('\n[1/4] Publishing hero page → ram.zenbin.org/tempo');
  const heroHtml = buildHeroHtml();
  const heroRes = await publishToZenbin(SLUG, 'TEMPO — Personal Energy OS', heroHtml);
  console.log(`     Status: ${heroRes.status} ${heroRes.status === 200 ? '✓' : heroRes.body.slice(0,80)}`);

  // b) Viewer
  console.log('\n[2/4] Publishing viewer → ram.zenbin.org/tempo-viewer');
  const penJson = fs.readFileSync(path.join(__dirname, 'tempo.pen'), 'utf8');
  const viewerHtml = buildViewerHtml(penJson);
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'TEMPO — Design Viewer', viewerHtml);
  console.log(`     Status: ${viewerRes.status} ${viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0,80)}`);

  // c) Gallery queue
  console.log('\n[3/4] Updating GitHub gallery queue');
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
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-tempo-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: meta.tagline,
    archetype: meta.archetype,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
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
    message: `add: TEMPO to gallery (heartbeat)`,
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
  console.log(`     Status: ${putRes.status} ${putRes.status === 200 ? '✓' : putRes.body.slice(0,100)}`);

  console.log('\n━━ Done ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Hero:   https://ram.zenbin.org/tempo`);
  console.log(`Viewer: https://ram.zenbin.org/tempo-viewer`);
  console.log(`Mock:   https://ram.zenbin.org/tempo-mock`);
}

main().catch(e => { console.error('ERROR:', e); process.exit(1); });
