'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG      = 'weave';
const APP_NAME  = 'WEAVE';
const TAGLINE   = 'Pipeline for the creative solo';
const ARCHETYPE = 'creative-studio-tracker';
const PROMPT    = 'Inspired by minimal.gallery "Huehaus Studio" + "KOMETA Typefaces" editorial-meets-craft aesthetic, and Midday.ai one-person company tooling trend. Light-theme creative project pipeline tracker for independent freelancers: project health, Gantt timeline, client profiles, and revenue tracking.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const P = {
  bg:        '#F4F3F8',
  surface:   '#FFFFFF',
  text:      '#1A1830',
  textDim:   '#6B6890',
  muted:     'rgba(26,24,48,0.36)',
  violet:    '#5C52E8',
  violetLt:  '#7B73F2',
  violetBg:  '#EDECFB',
  amber:     '#ECA600',
  amberBg:   '#FFF6DC',
  jade:      '#1DB87A',
  jadeBg:    '#E6F9F0',
  coral:     '#F25C54',
  border:    '#E0DEEE',
};

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

function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface};
    --text: ${P.text}; --dim: ${P.textDim}; --muted: ${P.muted};
    --violet: ${P.violet}; --violetLt: ${P.violetLt}; --violetBg: ${P.violetBg};
    --amber: ${P.amber}; --amberBg: ${P.amberBg};
    --jade: ${P.jade}; --jadeBg: ${P.jadeBg};
    --coral: ${P.coral}; --border: ${P.border};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

  nav { position: fixed; top:0; left:0; right:0; z-index:100; background: rgba(244,243,248,0.88); backdrop-filter: blur(14px); border-bottom: 1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding: 0 36px; height:60px; }
  .nav-logo { font-family: 'Lora', Georgia, serif; font-size:18px; font-weight:700; letter-spacing:4px; color:var(--violet); text-decoration:none; }
  .nav-links { display:flex; gap:28px; align-items:center; }
  .nav-links a { font-size:14px; color:var(--dim); text-decoration:none; transition:color .2s; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta { background:var(--violet); color:#fff!important; padding:8px 18px; border-radius:8px; font-weight:600!important; font-size:13px!important; }

  .hero { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:100px 24px 60px; text-align:center; position:relative; overflow:hidden; }
  .hero-bg-grid { position:absolute; inset:0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size:48px 48px; opacity:0.5; }
  .hero-bg-glow { position:absolute; inset:0; background: radial-gradient(ellipse 60% 50% at 50% 40%, rgba(92,82,232,0.12) 0%, transparent 70%); }
  .hero-content { position:relative; z-index:2; max-width:720px; }
  .hero-badge { display:inline-flex; align-items:center; gap:8px; background:var(--violetBg); color:var(--violet); border:1px solid rgba(92,82,232,0.2); border-radius:20px; padding:6px 16px; font-size:12px; font-weight:600; letter-spacing:0.5px; margin-bottom:28px; }
  .hero-badge::before { content:'✦'; }
  h1 { font-family:'Lora', Georgia, serif; font-size:clamp(42px,8vw,72px); font-weight:700; line-height:1.1; color:var(--text); letter-spacing:-1.5px; margin-bottom:22px; }
  h1 span { color:var(--violet); }
  .hero-sub { font-size:18px; color:var(--dim); line-height:1.65; max-width:520px; margin:0 auto 36px; }
  .hero-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
  .btn-primary { background:var(--violet); color:#fff; padding:14px 28px; border-radius:10px; font-weight:700; font-size:15px; text-decoration:none; transition:all .2s; box-shadow:0 4px 20px rgba(92,82,232,0.28); }
  .btn-primary:hover { background:var(--violetLt); transform:translateY(-2px); box-shadow:0 8px 28px rgba(92,82,232,0.36); }
  .btn-ghost { background:var(--surface); color:var(--text); padding:14px 28px; border-radius:10px; font-weight:600; font-size:15px; text-decoration:none; border:1px solid var(--border); transition:all .2s; }
  .btn-ghost:hover { border-color:var(--violet); color:var(--violet); }

  .screens-preview { display:flex; gap:16px; justify-content:center; padding:60px 24px 80px; overflow-x:auto; -webkit-overflow-scrolling:touch; }
  .screen-card { flex-shrink:0; width:200px; background:var(--surface); border-radius:20px; border:1px solid var(--border); padding:16px; box-shadow:0 4px 20px rgba(26,24,48,0.07); }
  .screen-label { font-size:11px; font-weight:700; color:var(--dim); letter-spacing:1px; text-transform:uppercase; margin-bottom:12px; }
  .screen-mock { background:var(--bg); border-radius:12px; height:120px; display:flex; flex-direction:column; gap:6px; padding:10px; overflow:hidden; }
  .mock-bar { border-radius:4px; height:8px; }
  .mock-card { border-radius:6px; padding:6px 8px; }
  .mock-text { border-radius:3px; height:5px; }

  .features { padding:80px 24px; max-width:1100px; margin:0 auto; }
  .features-label { font-size:11px; font-weight:700; letter-spacing:2px; color:var(--violet); text-align:center; margin-bottom:14px; }
  .features-title { font-family:'Lora', Georgia, serif; font-size:clamp(28px,5vw,42px); font-weight:700; text-align:center; color:var(--text); letter-spacing:-0.5px; margin-bottom:56px; }
  .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; }
  .feature-card { background:var(--surface); border-radius:16px; padding:28px; border:1px solid var(--border); transition:all .2s; }
  .feature-card:hover { border-color:rgba(92,82,232,0.3); box-shadow:0 8px 32px rgba(92,82,232,0.1); transform:translateY(-3px); }
  .feature-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:16px; }
  .fi-violet { background:var(--violetBg); }
  .fi-amber  { background:var(--amberBg); }
  .fi-jade   { background:var(--jadeBg); }
  .fi-coral  { background:#FFF0EF; }
  .feature-card h3 { font-size:16px; font-weight:700; color:var(--text); margin-bottom:8px; }
  .feature-card p { font-size:14px; color:var(--dim); line-height:1.6; }

  .stat-band { background:var(--violet); padding:60px 24px; text-align:center; }
  .stat-band-inner { max-width:800px; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); gap:32px; }
  .stat-item { color:#fff; }
  .stat-val { font-size:40px; font-weight:800; letter-spacing:-1px; font-family:'Lora',Georgia,serif; }
  .stat-label { font-size:13px; opacity:0.7; margin-top:4px; }

  .how-section { padding:80px 24px; max-width:900px; margin:0 auto; }
  .how-title { font-family:'Lora', Georgia, serif; font-size:clamp(26px,4vw,38px); font-weight:700; color:var(--text); letter-spacing:-0.5px; text-align:center; margin-bottom:48px; }
  .how-steps { display:grid; gap:20px; }
  .how-step { display:flex; gap:20px; align-items:flex-start; background:var(--surface); border-radius:14px; padding:24px; border:1px solid var(--border); }
  .step-num { flex-shrink:0; width:36px; height:36px; border-radius:10px; background:var(--violetBg); color:var(--violet); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; }
  .step-content h4 { font-size:16px; font-weight:700; color:var(--text); margin-bottom:6px; }
  .step-content p { font-size:14px; color:var(--dim); line-height:1.6; }

  .cta-section { padding:80px 24px; text-align:center; }
  .cta-box { background:var(--surface); border:1px solid var(--border); border-radius:24px; padding:60px 40px; max-width:640px; margin:0 auto; box-shadow:0 8px 40px rgba(92,82,232,0.1); }
  .cta-box h2 { font-family:'Lora', Georgia, serif; font-size:clamp(24px,4vw,36px); font-weight:700; color:var(--text); letter-spacing:-0.5px; margin-bottom:14px; }
  .cta-box p { font-size:16px; color:var(--dim); margin-bottom:28px; }

  footer { border-top:1px solid var(--border); padding:32px 24px; text-align:center; font-size:13px; color:var(--dim); }
  footer a { color:var(--violet); text-decoration:none; }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">WEAVE</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#how">How it works</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">View Design</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Live Mock ✦</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-bg-grid"></div>
  <div class="hero-bg-glow"></div>
  <div class="hero-content">
    <div class="hero-badge">Design by RAM · March 2026</div>
    <h1>Your studio.<br><span>Perfectly threaded.</span></h1>
    <p class="hero-sub">WEAVE is the project pipeline built for independent creative directors, designers, and makers who run a lean studio solo.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Interactive Mock ☀◑</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-ghost">View in Pencil →</a>
    </div>
  </div>
</section>

<section class="screens-preview">
  <div class="screen-card">
    <div class="screen-label">Projects</div>
    <div class="screen-mock">
      <div class="mock-bar" style="background:${P.violet};width:60%"></div>
      <div class="mock-card" style="background:${P.violetBg}">
        <div class="mock-text" style="background:${P.violet};width:80%;margin-bottom:4px"></div>
        <div class="mock-text" style="background:${P.border};width:55%"></div>
      </div>
      <div class="mock-card" style="background:${P.amberBg}">
        <div class="mock-text" style="background:${P.amber};width:70%;margin-bottom:4px"></div>
        <div class="mock-text" style="background:${P.border};width:45%"></div>
      </div>
      <div class="mock-card" style="background:${P.jadeBg}">
        <div class="mock-text" style="background:${P.jade};width:60%;margin-bottom:4px"></div>
        <div class="mock-text" style="background:${P.border};width:40%"></div>
      </div>
    </div>
  </div>
  <div class="screen-card">
    <div class="screen-label">Timeline</div>
    <div class="screen-mock">
      <div class="mock-bar" style="background:${P.border};width:100%;margin-bottom:2px"></div>
      <div style="display:flex;gap:4px;align-items:center">
        <div style="width:40px;flex-shrink:0"><div class="mock-text" style="background:${P.border};width:100%"></div></div>
        <div class="mock-bar" style="background:${P.violet};width:68%;height:7px;border-radius:3px"></div>
      </div>
      <div style="display:flex;gap:4px;align-items:center">
        <div style="width:40px;flex-shrink:0"><div class="mock-text" style="background:${P.border};width:100%"></div></div>
        <div class="mock-bar" style="background:${P.amber};width:30%;height:7px;border-radius:3px"></div>
      </div>
      <div style="display:flex;gap:4px;align-items:center">
        <div style="width:40px;flex-shrink:0"><div class="mock-text" style="background:${P.border};width:100%"></div></div>
        <div style="margin-left:12px" ><div class="mock-bar" style="background:${P.jade};width:40%;height:7px;border-radius:3px"></div></div>
      </div>
    </div>
  </div>
  <div class="screen-card">
    <div class="screen-label">Client</div>
    <div class="screen-mock">
      <div class="mock-card" style="background:${P.violetBg}">
        <div class="mock-text" style="background:${P.violet};width:70%;margin-bottom:4px"></div>
        <div class="mock-text" style="background:${P.border};width:50%"></div>
      </div>
      <div class="mock-text" style="background:${P.border};width:90%"></div>
      <div style="display:flex;gap:6px">
        <div class="mock-bar" style="background:${P.jadeBg};flex:1;height:10px;border-radius:3px"></div>
        <div class="mock-bar" style="background:${P.amberBg};flex:1;height:10px;border-radius:3px"></div>
      </div>
    </div>
  </div>
  <div class="screen-card">
    <div class="screen-label">Revenue</div>
    <div class="screen-mock" style="flex-direction:row;align-items:flex-end;justify-content:space-around;padding:10px 8px 4px">
      <div style="width:14px;background:${P.violetBg};border-radius:3px 3px 0 0;height:30px"></div>
      <div style="width:14px;background:${P.violetBg};border-radius:3px 3px 0 0;height:46px"></div>
      <div style="width:14px;background:${P.violet};border-radius:3px 3px 0 0;height:72px"></div>
      <div style="width:14px;background:${P.violetBg};border-radius:3px 3px 0 0;height:52px"></div>
      <div style="width:14px;background:${P.border};border-radius:3px 3px 0 0;height:8px"></div>
      <div style="width:14px;background:${P.border};border-radius:3px 3px 0 0;height:8px"></div>
    </div>
  </div>
  <div class="screen-card">
    <div class="screen-label">Detail</div>
    <div class="screen-mock">
      <div class="mock-bar" style="background:${P.violet};width:100%;height:32px;border-radius:8px;margin-bottom:4px"></div>
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:10px;height:10px;border-radius:50%;background:${P.jade};flex-shrink:0"></div>
        <div class="mock-text" style="background:${P.border};flex:1"></div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:10px;height:10px;border-radius:50%;background:${P.amber};flex-shrink:0"></div>
        <div class="mock-text" style="background:${P.text};flex:1;opacity:0.7"></div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:10px;height:10px;border-radius:50%;background:${P.border};flex-shrink:0"></div>
        <div class="mock-text" style="background:${P.border};flex:1"></div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <p class="features-label">Features</p>
  <h2 class="features-title">Everything a solo studio needs</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon fi-violet">⊞</div>
      <h3>Project Dashboard</h3>
      <p>See every active project at a glance — health status, progress bars, and days-remaining before it becomes urgent.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-amber">▬</div>
      <h3>Visual Timeline</h3>
      <p>Gantt-style calendar spanning months. Spot overlaps before they become crises. Today's line always in view.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-jade">◎</div>
      <h3>Client Profiles</h3>
      <p>Each client gets a full dossier — active projects, invoice history, notes on how they like to work. No more digging through email.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-coral">◈</div>
      <h3>Revenue Tracking</h3>
      <p>Monthly bar chart, YTD earned vs. pending, and a live list of open invoices with due dates. Know exactly where you stand.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-violet">⊙</div>
      <h3>Task Threads</h3>
      <p>Per-project task lists with status badges — done, in review, upcoming. See exactly what's blocking each project.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon fi-amber">◷</div>
      <h3>Availability Signal</h3>
      <p>Tell the world (and yourself) when you have capacity. One toggle, broadcast to your profile and booking link.</p>
    </div>
  </div>
</section>

<div class="stat-band">
  <div class="stat-band-inner">
    <div class="stat-item">
      <div class="stat-val">6</div>
      <div class="stat-label">Screens designed</div>
    </div>
    <div class="stat-item">
      <div class="stat-val">Light</div>
      <div class="stat-label">Cool pearl theme</div>
    </div>
    <div class="stat-item">
      <div class="stat-val">✦</div>
      <div class="stat-label">Editorial + functional</div>
    </div>
  </div>
</div>

<section class="how-section" id="how">
  <h2 class="how-title">Designed for the maker who does it all</h2>
  <div class="how-steps">
    <div class="how-step">
      <div class="step-num">1</div>
      <div class="step-content">
        <h4>Add your projects</h4>
        <p>Each project gets a card with client, type, deadline, and progress. Color-coded status — on track, at risk, or new.</p>
      </div>
    </div>
    <div class="how-step">
      <div class="step-num">2</div>
      <div class="step-content">
        <h4>Thread the timeline</h4>
        <p>Projects land on a Gantt view. See which months are packed and which have space to take on new work.</p>
      </div>
    </div>
    <div class="how-step">
      <div class="step-num">3</div>
      <div class="step-content">
        <h4>Invoice with confidence</h4>
        <p>Draft, send, and track invoices per client. Revenue screen shows you total earned vs. pending so you always know your cash position.</p>
      </div>
    </div>
    <div class="how-step">
      <div class="step-num">4</div>
      <div class="step-content">
        <h4>Know your next move</h4>
        <p>Task threads on each project show the critical path. One screen tells you what's done, what's in review, and what needs to move today.</p>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="cta-box">
    <h2>See every thread clearly.</h2>
    <p>Explore the interactive mock — full light/dark toggle, all 6 screens.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Open Mock ☀◑</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-ghost">Pencil Viewer →</a>
    </div>
  </div>
</section>

<footer>
  <p>WEAVE concept by <a href="https://ram.zenbin.org">RAM Design Studio</a> · March 2026 · Inspired by minimal.gallery editorial aesthetic & one-person company tools</p>
</footer>

</body>
</html>`;
}

function buildViewerHtml(penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

  const viewerBase = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Pencil Viewer</title>
<script src="https://cdn.pencil.dev/viewer/v2.8/viewer.js"><\/script>
</head>
<body style="margin:0;background:#F4F3F8;">
<div id="pencil-viewer" style="width:100%;height:100vh;"></div>
<script>
  window.PencilViewer && window.PencilViewer.init({
    container: document.getElementById('pencil-viewer'),
    pen: window.EMBEDDED_PEN,
    theme: 'light',
  });
<\/script>
</body>
</html>`;

  return viewerBase.replace('<script>', injection + '\n<script>');
}

async function main() {
  const penJson = fs.readFileSync('/workspace/group/design-studio/weave.pen', 'utf8');

  // ── Hero page ──
  console.log('Publishing hero...');
  const heroRes = await zenPublish(SLUG, buildHeroHtml(), `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 80));

  // ── Viewer page ──
  console.log('Publishing viewer...');
  const viewerRes = await zenPublish(`${SLUG}-viewer`, buildViewerHtml(penJson), `${APP_NAME} Viewer`);
  console.log('Viewer:', viewerRes.status, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 80));

  // ── GitHub gallery queue ──
  console.log('Updating gallery queue...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      Accept: 'application/vnd.github.v3+json',
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
    prompt: PROMPT,
    screens: 6,
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
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      Accept: 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 100));

  // Save queue entry locally
  fs.writeFileSync('/workspace/group/design-studio/weave-queue-entry.json',
    JSON.stringify(newEntry, null, 2));

  console.log('\nDone!');
  console.log('Hero →   https://ram.zenbin.org/' + SLUG);
  console.log('Viewer → https://ram.zenbin.org/' + SLUG + '-viewer');
}

main().catch(console.error);
