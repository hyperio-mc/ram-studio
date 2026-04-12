'use strict';
// quasar-publish.js — Design Discovery pipeline for QUASAR
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'quasar';
const APP_NAME  = 'QUASAR';
const TAGLINE   = 'Watch your agents think';
const ARCHETYPE = 'devtools-agent-monitoring';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Dark-mode AI agent fleet observatory — DARK theme. Inspired by relace.ai (via lapa.ninja): scientific model naming FIG-003, "10,000 tok/s" infrastructure metric displays, dark technical aesthetic treating AI models as precision instruments. Also linear.app (via darkmodedesign.com): "built for the AI era", minimal dark chrome, status-aware colour coding. And godly.website: Evervault / Twingate deep charcoal + neon accent infra SaaS. Palette: near-black #0A0C12, violet #8B6FEE, mint #2CE5A8.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'quasar.pen'), 'utf8');

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

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0A0C12',
  surface:  '#111420',
  surface2: '#181D2E',
  border:   '#222840',
  muted:    '#5A6180',
  fg:       '#E8EAEF',
  violet:   '#8B6FEE',
  violetLt: '#B09FF5',
  mint:     '#2CE5A8',
  mintBg:   '#0D2B20',
  red:      '#F25C5C',
};

// ── HERO PAGE ──────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>QUASAR — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="QUASAR is a dark-mode AI agent fleet observatory — monitor throughput, latency, cost and task health across autonomous coding agents in real time.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${P.bg};--surface:${P.surface};--surface2:${P.surface2};
  --border:${P.border};--fg:${P.fg};--muted:${P.muted};
  --violet:${P.violet};--violet-lt:${P.violetLt};
  --mint:${P.mint};--mint-bg:${P.mintBg};--red:${P.red};
}
html{background:var(--bg);color:var(--fg);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;overflow-x:hidden}

/* Nav */
nav{position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 32px;height:60px;
  background:rgba(10,12,18,0.92);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--border)}
.logo{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;
  color:var(--fg);letter-spacing:3px}
.logo span{color:var(--violet)}
nav-links{display:flex;gap:28px}
nav a{font-size:13px;color:var(--muted);text-decoration:none;transition:color .2s}
nav a:hover{color:var(--fg)}
.nav-cta{
  padding:8px 20px;border-radius:8px;
  background:var(--violet);color:#fff;
  font-size:13px;font-weight:600;text-decoration:none;
  transition:opacity .2s}
.nav-cta:hover{opacity:.85}

/* Hero */
.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:80px 24px 60px;text-align:center;
  position:relative;overflow:hidden}
.hero::before{
  content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);
  width:800px;height:800px;border-radius:50%;
  background:radial-gradient(circle,rgba(139,111,238,0.12) 0%,transparent 70%);
  pointer-events:none}
.badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:6px 16px;border-radius:20px;
  background:var(--mint-bg);border:1px solid var(--mint);
  font-size:11px;font-weight:700;color:var(--mint);letter-spacing:0.8px;
  margin-bottom:28px}
.badge::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--mint)}
h1{font-size:clamp(48px,8vw,80px);font-weight:800;line-height:1.08;
  letter-spacing:-2px;max-width:800px;margin-bottom:20px}
h1 em{font-style:normal;color:var(--violet)}
.sub{font-size:18px;color:var(--muted);max-width:520px;line-height:1.65;margin-bottom:40px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:64px}
.btn-primary{
  padding:14px 32px;border-radius:10px;
  background:var(--violet);color:#fff;
  font-size:15px;font-weight:600;text-decoration:none;
  transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-ghost{
  padding:14px 32px;border-radius:10px;
  border:1px solid var(--border);color:var(--fg);
  font-size:15px;font-weight:500;text-decoration:none;
  transition:border-color .2s}
.btn-ghost:hover{border-color:var(--violet)}

/* Metrics strip */
.metrics{
  display:flex;gap:0;flex-wrap:wrap;justify-content:center;
  border:1px solid var(--border);border-radius:14px;
  overflow:hidden;max-width:700px;width:100%;margin:0 auto}
.metric{
  flex:1;min-width:140px;padding:24px 20px;
  border-right:1px solid var(--border);text-align:center}
.metric:last-child{border-right:none}
.metric-val{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;
  color:var(--fg);margin-bottom:4px}
.metric-val.v{color:var(--violet-lt)}
.metric-val.m{color:var(--mint)}
.metric-label{font-size:10px;font-weight:600;color:var(--muted);letter-spacing:0.8px}

/* Screens section */
.screens-section{padding:80px 24px;max-width:1200px;margin:0 auto}
.screens-section h2{font-size:36px;font-weight:700;text-align:center;margin-bottom:10px}
.screens-section .tagline{text-align:center;color:var(--muted);font-size:15px;margin-bottom:48px}
.screens-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px}
.screen-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:14px;padding:20px;transition:border-color .2s}
.screen-card:hover{border-color:var(--violet)}
.screen-card h3{font-size:13px;font-weight:700;color:var(--fg);margin-bottom:6px;letter-spacing:0.5px}
.screen-card p{font-size:12px;color:var(--muted);line-height:1.55}

/* Features */
.features{padding:60px 24px;max-width:900px;margin:0 auto}
.features h2{font-size:32px;font-weight:700;text-align:center;margin-bottom:40px}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
.feat{
  background:var(--surface);border:1px solid var(--border);
  border-radius:12px;padding:24px}
.feat-icon{font-size:22px;margin-bottom:12px}
.feat h3{font-size:14px;font-weight:700;color:var(--fg);margin-bottom:8px}
.feat p{font-size:13px;color:var(--muted);line-height:1.6}

/* Inspiration */
.inspo{
  padding:60px 24px;max-width:800px;margin:0 auto;
  text-align:center}
.inspo h2{font-size:28px;font-weight:700;margin-bottom:16px}
.inspo p{font-size:14px;color:var(--muted);line-height:1.75;margin-bottom:24px}
.inspo cite{
  display:block;font-style:normal;
  font-family:'JetBrains Mono',monospace;font-size:12px;
  color:var(--violet-lt);letter-spacing:0.3px;line-height:2}

/* Palette */
.palette-section{padding:40px 24px;max-width:600px;margin:0 auto;text-align:center}
.palette-section h2{font-size:22px;font-weight:700;margin-bottom:24px}
.swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.swatch{width:56px;text-align:center}
.swatch-box{width:56px;height:56px;border-radius:10px;margin-bottom:6px;border:1px solid rgba(255,255,255,0.08)}
.swatch label{font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace}

/* Viewer link */
.viewer-cta{
  padding:60px 24px;text-align:center}
.viewer-cta a{
  display:inline-block;padding:16px 40px;border-radius:12px;
  background:var(--surface);border:1px solid var(--border);
  color:var(--violet-lt);font-size:15px;font-weight:600;text-decoration:none;
  transition:border-color .2s}
.viewer-cta a:hover{border-color:var(--violet)}

/* Footer */
footer{padding:32px 24px;text-align:center;
  border-top:1px solid var(--border);
  font-size:12px;color:var(--muted)}
footer a{color:var(--violet-lt);text-decoration:none}

@media(max-width:600px){
  .metrics{flex-direction:column}
  .metric{border-right:none;border-bottom:1px solid var(--border)}
  .metric:last-child{border-bottom:none}
}
</style>
</head>
<body>

<nav>
  <div class="logo">QUAS<span>A</span>R</div>
  <a class="nav-cta" href="/${SLUG}-viewer">View Design →</a>
</nav>

<section class="hero">
  <div class="badge">NEW · DARK THEME · RAM DESIGN STUDIO</div>
  <h1>Watch your<br><em>agents</em> think</h1>
  <p class="sub">QUASAR is a real-time observatory for AI agent fleets — throughput, latency, cost, and health across every autonomous coder running in your stack.</p>
  <div class="cta-row">
    <a class="btn-primary" href="/${SLUG}-viewer">Explore Design</a>
    <a class="btn-ghost" href="/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
  <div class="metrics">
    <div class="metric"><div class="metric-val v">FIG-003</div><div class="metric-label">MODEL ID</div></div>
    <div class="metric"><div class="metric-val">9.2k</div><div class="metric-label">TOK / SEC</div></div>
    <div class="metric"><div class="metric-val m">148ms</div><div class="metric-label">P50 LATENCY</div></div>
    <div class="metric"><div class="metric-val">$0.83</div><div class="metric-label">TODAY'S COST</div></div>
  </div>
</section>

<section class="screens-section">
  <h2>Five screens</h2>
  <p class="tagline">A complete agent operations flow</p>
  <div class="screens-grid">
    <div class="screen-card"><h3>⬡ FLEET</h3><p>All agents at a glance — status, throughput, latency, cost per agent with mini sparklines.</p></div>
    <div class="screen-card"><h3>◎ OBSERVE</h3><p>Single-agent deep dive — throughput histogram, 4 metric cards, model info, latest task.</p></div>
    <div class="screen-card"><h3>≡ TASKS</h3><p>Real-time task stream across all agents — filterable by status, duration, token count.</p></div>
    <div class="screen-card"><h3>◈ BUDGET</h3><p>Token spend tracking — daily bar chart, monthly projection, per-agent cost breakdown.</p></div>
    <div class="screen-card"><h3>⚐ ALERTS</h3><p>Anomaly monitor — critical, warning, info, resolved with actionable CTAs.</p></div>
  </div>
</section>

<section class="features">
  <h2>Design decisions</h2>
  <div class="feat-grid">
    <div class="feat">
      <div class="feat-icon">◎</div>
      <h3>Scientific instrument aesthetic</h3>
      <p>Model names like FIG-003, monospace readouts, observatory-metaphor navigation — treating AI agents like precision instruments, inspired by relace.ai's infrastructure-first framing.</p>
    </div>
    <div class="feat">
      <div class="feat-icon">⬡</div>
      <h3>Status-aware colour system</h3>
      <p>Mint for active/healthy, amber for warning/idle, red for error. Consistent across pills, sparklines, metric callouts — always legible on the near-black surface.</p>
    </div>
    <div class="feat">
      <div class="feat-icon">▯</div>
      <h3>Dual-type typography</h3>
      <p>Inter for labels and body; JetBrains Mono for all values, IDs, and metrics. The contrast signals "human-readable label vs. machine-readable datum" without extra colour.</p>
    </div>
  </div>
</section>

<section class="inspo">
  <h2>What inspired it</h2>
  <p>Browsing lapa.ninja surfaced <strong>Relace</strong> — "Models built for coding agents" — with its FIG-001/FIG-003 naming and <em>10,000 tok/s</em> metric displays. That scientific precision paired with Linear's dark chrome from darkmodedesign.com sparked the question: what does a <em>fleet dashboard</em> look like when your developers are autonomous agents rather than humans?</p>
  <cite>
    1. relace.ai — "Models built for coding agents" (via lapa.ninja)<br>
    2. linear.app — "The product development system for teams and agents" (via darkmodedesign.com)<br>
    3. Evervault / Twingate — security infra SaaS (via godly.website)
  </cite>
</section>

<section class="palette-section">
  <h2>Colour palette</h2>
  <div class="swatches">
    <div class="swatch"><div class="swatch-box" style="background:#0A0C12"></div><label>#0A0C12</label></div>
    <div class="swatch"><div class="swatch-box" style="background:#111420"></div><label>#111420</label></div>
    <div class="swatch"><div class="swatch-box" style="background:#222840"></div><label>#222840</label></div>
    <div class="swatch"><div class="swatch-box" style="background:#8B6FEE"></div><label>#8B6FEE</label></div>
    <div class="swatch"><div class="swatch-box" style="background:#B09FF5"></div><label>#B09FF5</label></div>
    <div class="swatch"><div class="swatch-box" style="background:#2CE5A8"></div><label>#2CE5A8</label></div>
    <div class="swatch"><div class="swatch-box" style="background:#F5A623"></div><label>#F5A623</label></div>
    <div class="swatch"><div class="swatch-box" style="background:#F25C5C"></div><label>#F25C5C</label></div>
  </div>
</section>

<section class="viewer-cta">
  <a href="/${SLUG}-viewer">Open in Pencil viewer →</a>
</section>

<footer>
  <p>Designed by RAM · <a href="https://ram.zenbin.org">ram.zenbin.org</a> · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
</footer>

</body>
</html>`;
}

// ── VIEWER PAGE ────────────────────────────────────────────────────────────────
function buildViewer() {
  let html = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

async function main() {
  console.log('Publishing QUASAR design...\n');

  // Hero
  console.log('1/4  Publishing hero page...');
  const heroRes = await zenPut(SLUG, `QUASAR — ${TAGLINE}`, buildHero());
  console.log('     Status:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0,80));

  // Viewer
  console.log('2/4  Publishing viewer...');
  let viewerHtml;
  try {
    viewerHtml = buildViewer();
  } catch(e) {
    viewerHtml = `<html><body style="background:#0A0C12;color:#E8EAEF;font-family:monospace;padding:40px"><h1>QUASAR Viewer</h1><p>Embedded pen: ${penJson.length} chars</p></body></html>`;
  }
  const viewerRes = await zenPut(SLUG + '-viewer', `QUASAR Viewer`, viewerHtml);
  console.log('     Status:', viewerRes.status, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0,80));

  // Gallery queue
  console.log('3/4  Updating gallery queue...');
  const getRes = await (async () => {
    return new Promise((resolve, reject) => {
      const r = https.request({
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_REPO}/contents/queue.json`,
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
      }, res => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      r.on('error', reject);
      r.end();
    });
  })();

  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
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
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await (async () => {
    return new Promise((resolve, reject) => {
      const r = https.request({
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_REPO}/contents/queue.json`,
        method: 'PUT',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
      }, res => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      r.on('error', reject);
      r.write(putBody);
      r.end();
    });
  })();
  console.log('     Status:', putRes.status, (putRes.status === 200 || putRes.status === 201) ? '✓' : putRes.body.slice(0,100));

  // Design DB
  console.log('4/4  Indexing in design DB...');
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, { ...newEntry });
    rebuildEmbeddings(db);
    console.log('     ✓ indexed');
  } catch(e) {
    console.log('     DB index skipped:', e.message);
  }

  console.log('\n✓ QUASAR live at https://ram.zenbin.org/quasar');
  console.log('  Viewer: https://ram.zenbin.org/quasar-viewer');
  console.log('  Mock:   https://ram.zenbin.org/quasar-mock');

  return newEntry;
}

main().catch(e => { console.error(e); process.exit(1); });
