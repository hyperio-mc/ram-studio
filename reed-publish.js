'use strict';
// reed-publish.js — Full Design Discovery pipeline for REED
// REED — Deep Reading Intelligence
// Theme: DARK · Slug: reed

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'reed';
const APP_NAME  = 'REED';
const TAGLINE   = 'Your river of long reads';
const ARCHETYPE = 'reading-intelligence';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Deep reading & annotation mobile app — dark theme. Inspired by "Current — A River of Reading" (Land-book, 10 saves, Mar 2026) and Obsidian on DarkModeDesign: near-black warm canvas #0D0F0C, sage green accent, amber highlights, editorial Lora serif typography, river/flow reading queue metaphor, immersive reading mode with inline annotation.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'reed.pen'), 'utf8');
const penJsonStr = JSON.stringify(penJson);

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
  return req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
}

function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>REED — Your river of long reads</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0D0F0C; --bg-alt: #131510; --surface: #181B14; --surface-el: #1F2318;
    --text: #E2DEC8; --muted: rgba(226,222,200,0.45); --dim: rgba(226,222,200,0.22);
    --accent: #7BBF76; --accent-soft: rgba(123,191,118,0.13);
    --amber: #D4A24C; --amber-soft: rgba(212,162,76,0.12);
    --border: rgba(222,218,198,0.09);
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; }
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(13,15,12,0.88); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; letter-spacing: .06em; }
  .nav-logo em { color: var(--accent); font-style: normal; }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: var(--bg); padding: 8px 20px;
    border-radius: 20px; font-size: 13px; font-weight: 700; text-decoration: none;
    transition: opacity .2s;
  }
  .nav-cta:hover { opacity: .85; }
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 100px 40px 60px;
    background: radial-gradient(ellipse 80% 60% at 50% 25%, rgba(123,191,118,0.055) 0%, transparent 70%);
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent-soft); border: 1px solid rgba(123,191,118,0.22);
    padding: 6px 16px; border-radius: 20px; font-size: 12px;
    color: var(--accent); font-weight: 500; margin-bottom: 32px; letter-spacing: .03em;
  }
  .hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
  h1 {
    font-family: 'Lora', serif; font-size: clamp(52px, 9vw, 96px); font-weight: 700;
    line-height: 1.02; margin-bottom: 24px; max-width: 760px;
  }
  h1 em { font-style: italic; color: var(--accent); }
  .hero-sub { font-size: clamp(16px,2vw,20px); color: var(--muted); max-width: 500px; line-height: 1.7; margin-bottom: 48px; }
  .btn-row { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
  .btn-p { background: var(--accent); color: var(--bg); padding: 14px 28px; border-radius: 28px; font-size: 15px; font-weight: 700; text-decoration: none; transition: transform .2s; }
  .btn-p:hover { transform: translateY(-2px); }
  .btn-s { color: var(--muted); border: 1px solid var(--border); padding: 14px 28px; border-radius: 28px; font-size: 15px; text-decoration: none; transition: border-color .2s, color .2s; }
  .btn-s:hover { border-color: var(--text); color: var(--text); }
  .meta-row { display: flex; gap: 28px; flex-wrap: wrap; justify-content: center; margin-top: 56px; }
  .meta-item { text-align: center; }
  .meta-item span { font-size: 11px; color: var(--dim); display: block; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
  .meta-item strong { font-size: 13px; color: var(--muted); font-weight: 500; }
  .stats-strip {
    background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    display: flex; justify-content: center; gap: 56px; padding: 44px 40px; flex-wrap: wrap;
  }
  .stat-value { font-family: 'Lora', serif; font-size: 40px; font-weight: 700; color: var(--text); }
  .stat-value em { color: var(--accent); font-style: normal; }
  .stat-label { font-size: 13px; color: var(--muted); margin-top: 6px; }
  .section { padding: 100px 40px; max-width: 1100px; margin: 0 auto; }
  .sec-label { font-size: 11px; font-weight: 600; letter-spacing: .12em; color: var(--accent); text-transform: uppercase; margin-bottom: 14px; }
  .section h2 { font-family: 'Lora', serif; font-size: clamp(32px,5vw,54px); font-weight: 700; line-height: 1.1; margin-bottom: 18px; }
  .section h2 em { color: var(--accent); font-style: italic; }
  .section-sub { font-size: 18px; color: var(--muted); max-width: 540px; line-height: 1.7; margin-bottom: 60px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; transition: border-color .2s, transform .25s; }
  .card:hover { border-color: rgba(123,191,118,0.28); transform: translateY(-4px); }
  .card-icon { font-size: 26px; margin-bottom: 14px; }
  .card h3 { font-size: 17px; font-weight: 600; margin-bottom: 10px; }
  .card p { font-size: 14px; color: var(--muted); line-height: 1.65; }
  .card p em { color: var(--amber); font-style: normal; }
  .quote-wrap { text-align: center; padding: 90px 40px; max-width: 720px; margin: 0 auto; }
  .quote-wrap blockquote { font-family: 'Lora', serif; font-size: clamp(20px,3vw,32px); font-style: italic; line-height: 1.55; color: var(--text); margin-bottom: 22px; }
  .quote-wrap blockquote em { color: var(--amber); font-style: normal; }
  .quote-wrap cite { font-size: 13px; color: var(--dim); }
  .screens-wrap { padding: 80px 0; }
  .screens-wrap h2 { text-align: center; font-family: 'Lora', serif; font-size: 40px; font-weight: 700; margin-bottom: 44px; }
  .screens-scroll { display: flex; gap: 20px; padding: 0 40px; overflow-x: auto; scrollbar-width: none; padding-bottom: 12px; }
  .screens-scroll::-webkit-scrollbar { display: none; }
  .sc-card { flex-shrink: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 18px; width: 170px; transition: border-color .2s; }
  .sc-card:hover { border-color: rgba(123,191,118,0.3); }
  .sc-thumb { width: 100%; aspect-ratio: 9/17; background: var(--bg); border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .sc-card h4 { font-size: 13px; font-weight: 600; }
  .sc-card p { font-size: 11px; color: var(--muted); margin-top: 4px; }
  .cta-section { text-align: center; padding: 120px 40px; background: radial-gradient(ellipse 70% 50% at 50% 100%, rgba(123,191,118,0.055) 0%, transparent 70%); }
  .cta-section h2 { font-family: 'Lora', serif; font-size: clamp(30px,5vw,52px); font-weight: 700; margin-bottom: 18px; }
  .cta-section p { font-size: 18px; color: var(--muted); margin-bottom: 40px; }
  footer { border-top: 1px solid var(--border); padding: 36px 40px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; max-width: 1100px; margin: 0 auto; }
  footer p { font-size: 13px; color: var(--dim); }
  .fl { display: flex; gap: 22px; }
  .fl a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
  .fl a:hover { color: var(--text); }
  @media (max-width: 640px) {
    nav { padding: 0 20px; } .nav-links { display: none; }
    .section { padding: 60px 20px; } .hero { padding: 100px 20px 40px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">RE<em>ED</em></div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="https://ram.zenbin.org/reed-mock">Mock</a></li>
    <li><a href="https://ram.zenbin.org/reed-viewer">Viewer</a></li>
  </ul>
  <a class="nav-cta" href="https://ram.zenbin.org/reed-mock">Try mock ☀◑</a>
</nav>

<section class="hero">
  <div class="hero-badge">RAM Design Heartbeat · Dark Theme · March 2026</div>
  <h1>Read deeper.<br><em>Think longer.</em></h1>
  <p class="hero-sub">REED turns your reading list into a curated river of thought — with highlights, annotations, and focus metrics that reward genuine depth.</p>
  <div class="btn-row">
    <a class="btn-p" href="https://ram.zenbin.org/reed-mock">Interactive mock ☀◑</a>
    <a class="btn-s" href="https://ram.zenbin.org/reed-viewer">View prototype →</a>
  </div>
  <div class="meta-row">
    <div class="meta-item"><span>Theme</span><strong>Dark</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>Reading Intelligence</strong></div>
    <div class="meta-item"><span>Screens</span><strong>6</strong></div>
    <div class="meta-item"><span>Accent</span><strong>#7BBF76 sage</strong></div>
    <div class="meta-item"><span>Inspired by</span><strong>Current — Land-book</strong></div>
    <div class="meta-item"><span>Format</span><strong>Pencil v2.8</strong></div>
  </div>
</section>

<div class="stats-strip">
  <div class="stat"><div class="stat-value">4h <em>23m</em></div><div class="stat-label">Reading this week</div></div>
  <div class="stat"><div class="stat-value">23<em>+</em></div><div class="stat-label">Highlights saved</div></div>
  <div class="stat"><div class="stat-value">12 <em>🔥</em></div><div class="stat-label">Day streak</div></div>
  <div class="stat"><div class="stat-value">91<em>%</em></div><div class="stat-label">Match accuracy</div></div>
</div>

<section class="section" id="features">
  <div class="sec-label">Why REED</div>
  <h2>Designed for the <em>long read.</em></h2>
  <p class="section-sub">Most reading apps are built for speed. REED is built for depth — every interaction rewards slowing down and thinking through what you read.</p>
  <div class="grid">
    <div class="card">
      <div class="card-icon">🌊</div>
      <h3>The River Queue</h3>
      <p>Articles arranged by depth and estimated reading time — not just recency. Your queue flows, never floods.</p>
    </div>
    <div class="card">
      <div class="card-icon">✏️</div>
      <h3>Inline Highlighting</h3>
      <p><em>Tap to mark. Long-press to annotate.</em> Every highlight links back to its article, building a personal knowledge layer over time.</p>
    </div>
    <div class="card">
      <div class="card-icon">📖</div>
      <h3>Immersive Reading Mode</h3>
      <p>Zero chrome. Adjustable font size. Progress tracked by time-in-text — not just scroll position — for honest metrics.</p>
    </div>
    <div class="card">
      <div class="card-icon">📊</div>
      <h3>Reading Intelligence</h3>
      <p>Weekly stats, topic breakdowns, streak tracking — data that reveals your intellectual habits, not just app usage.</p>
    </div>
    <div class="card">
      <div class="card-icon">🔍</div>
      <h3>Taste-Based Discovery</h3>
      <p>Articles surfaced by semantic match to your reading history. No algorithmic noise — just resonance scores and honest curation.</p>
    </div>
    <div class="card">
      <div class="card-icon">🌑</div>
      <h3>Dark by Design</h3>
      <p>REED's near-black canvas (#0D0F0C) and warm cream text were calibrated for long evening reading sessions. Eyes first.</p>
    </div>
  </div>
</section>

<div class="quote-wrap">
  <blockquote>"The ability to hold a long argument in mind — to read it whole — is not a feature. <em>It is a kind of freedom.</em>"</blockquote>
  <cite>— Design philosophy, REED</cite>
</div>

<section class="screens-wrap" id="screens">
  <h2>Six screens. One flow.</h2>
  <div class="screens-scroll">
    <div class="sc-card"><div class="sc-thumb">🌊</div><h4>Reading Queue</h4><p>Articles with time estimates and progress bars</p></div>
    <div class="sc-card"><div class="sc-thumb">📖</div><h4>Immersive Read</h4><p>Full-focus mode with inline highlights</p></div>
    <div class="sc-card"><div class="sc-thumb">✏️</div><h4>Highlights</h4><p>Annotated passages with linked notes</p></div>
    <div class="sc-card"><div class="sc-thumb">📚</div><h4>Library</h4><p>Saved articles with topic tags and filters</p></div>
    <div class="sc-card"><div class="sc-thumb">📊</div><h4>Reading Stats</h4><p>Weekly bar chart, topics, streaks</p></div>
    <div class="sc-card"><div class="sc-thumb">🔍</div><h4>Discover</h4><p>Taste-matched article recommendations</p></div>
  </div>
</section>

<section class="cta-section">
  <h2>Try the prototype</h2>
  <p>Fully interactive mock with light/dark toggle</p>
  <div class="btn-row">
    <a class="btn-p" href="https://ram.zenbin.org/reed-mock">Open interactive mock ☀◑</a>
    <a class="btn-s" href="https://ram.zenbin.org/reed-viewer">View pen prototype</a>
  </div>
</section>

<footer>
  <p>REED · Design concept by RAM · March 2026 · Pencil.dev v2.8</p>
  <div class="fl">
    <a href="https://ram.zenbin.org/reed-mock">Mock</a>
    <a href="https://ram.zenbin.org/reed-viewer">Viewer</a>
    <a href="https://ram.zenbin.org">Gallery</a>
  </div>
</footer>

</body>
</html>`;
}

function buildViewer() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>REED — Pen Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0F0C;color:#E2DEC8;font-family:-apple-system,'Inter',system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:20px}
h1{font-size:13px;font-weight:800;letter-spacing:5px;color:#7BBF76;text-transform:uppercase}
p{font-size:12px;color:rgba(226,222,200,0.4);text-align:center}
.links{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
a{color:#7BBF76;font-size:13px;font-weight:600;text-decoration:none;background:rgba(123,191,118,0.1);padding:10px 22px;border-radius:10px;border:1px solid rgba(123,191,118,0.22);transition:opacity .2s}
a:hover{opacity:0.8}
</style>
<script>window.EMBEDDED_PEN = ${penJsonStr};</script>
</head>
<body>
<h1>REED</h1>
<p>Your river of long reads &nbsp;·&nbsp; 6 screens &nbsp;·&nbsp; Dark theme</p>
<div class="links">
  <a href="https://ram.zenbin.org/reed">← Hero Page</a>
  <a href="https://ram.zenbin.org/reed-mock">Interactive Mock ☀◑</a>
</div>
<script>
console.log('REED pen loaded — screens:', window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN).screens.length : 0);
</script>
</body>
</html>`;
}

// ── GitHub queue update ────────────────────────────────────────────────────────
async function updateGalleryQueue() {
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

  queue.submissions.push({
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
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent, sha: currentSha,
  });
  return req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
}

(async () => {
  console.log('Publishing REED...\n');

  const heroRes = await zenPut(SLUG, `REED — ${TAGLINE}`, buildHero());
  console.log(`Hero  (${SLUG}):         ${heroRes.status === 200 ? '✓ OK' : heroRes.body.slice(0, 80)}`);

  const viewerRes = await zenPut(`${SLUG}-viewer`, `REED Viewer`, buildViewer());
  console.log(`Viewer (${SLUG}-viewer): ${viewerRes.status === 200 ? '✓ OK' : viewerRes.body.slice(0, 80)}`);

  console.log('\nUpdating GitHub gallery queue...');
  const queueRes = await updateGalleryQueue();
  console.log(`Queue: ${queueRes.status === 200 ? '✓ OK' : queueRes.body.slice(0, 100)}`);

  console.log('\nDone.');
  console.log(`Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`Mock   → https://ram.zenbin.org/${SLUG}-mock`);
})();
