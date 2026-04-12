// nerve-publish.js — NERVE hero page + viewer + gallery
import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG     = 'nerve';
const APP_NAME = 'NERVE';
const TAGLINE  = 'mission control for your autonomous AI fleet';
const ARCHETYPE= 'autonomous-ai-ops-dashboard';

// ─── Hero Page ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NERVE — Mission Control for Autonomous AI Agents</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#070B10;--surface:#0D1520;--surfaceB:#111E2E;
    --text:#E8F4F2;--muted:rgba(180,220,215,0.45);
    --teal:#00E8C6;--amber:#F5A623;--violet:#7B5CF0;--red:#FF4D6D;--green:#36D68A;
    --border:rgba(0,232,198,0.12);--borderB:rgba(255,255,255,0.07);
  }
  html,body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}

  /* Nav */
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:60px;background:rgba(7,11,16,0.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--borderB)}
  .logo{font-size:16px;font-weight:700;letter-spacing:.18em;color:var(--teal);font-family:'JetBrains Mono',monospace}
  .logo-dot{color:rgba(0,232,198,0.4)}
  .nav-links{display:flex;gap:32px}
  .nav-links a{font-size:12px;color:var(--muted);text-decoration:none;letter-spacing:.08em;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{font-size:12px;font-weight:600;padding:8px 20px;background:rgba(0,232,198,0.12);color:var(--teal);border:1px solid rgba(0,232,198,0.3);border-radius:20px;text-decoration:none;letter-spacing:.06em;transition:all .2s}
  .nav-cta:hover{background:rgba(0,232,198,0.2)}

  /* Hero */
  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 40px 80px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse 70% 50% at 50% 20%, rgba(0,232,198,0.06) 0%, transparent 70%),radial-gradient(ellipse 50% 40% at 80% 80%, rgba(123,92,240,0.06) 0%, transparent 70%);pointer-events:none}

  .status-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(54,214,138,0.1);border:1px solid rgba(54,214,138,0.3);border-radius:20px;font-size:11px;font-weight:600;color:var(--green);letter-spacing:.1em;margin-bottom:32px}
  .status-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

  .hero-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--teal);letter-spacing:.28em;margin-bottom:20px;opacity:.7}
  h1{font-size:clamp(52px,9vw,96px);font-weight:900;letter-spacing:.1em;color:var(--text);line-height:1;margin-bottom:8px}
  h1 span{color:var(--teal)}
  .hero-tagline{font-size:clamp(15px,2vw,20px);color:var(--muted);font-weight:300;letter-spacing:.04em;margin-bottom:48px;max-width:560px}

  .hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:72px}
  .btn-primary{font-size:13px;font-weight:600;padding:14px 32px;background:var(--teal);color:var(--bg);border-radius:28px;text-decoration:none;letter-spacing:.06em;transition:all .2s}
  .btn-primary:hover{background:#33ffd6;transform:translateY(-1px);box-shadow:0 12px 40px rgba(0,232,198,0.25)}
  .btn-ghost{font-size:13px;font-weight:500;padding:14px 32px;background:transparent;color:var(--text);border:1px solid var(--borderB);border-radius:28px;text-decoration:none;letter-spacing:.06em;transition:all .2s}
  .btn-ghost:hover{border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.04)}

  /* Live stats strip */
  .stats-strip{display:flex;gap:0;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:80px;max-width:600px;width:100%}
  .stat{flex:1;padding:20px 24px;text-align:center;border-right:1px solid var(--borderB)}
  .stat:last-child{border-right:none}
  .stat-val{font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;margin-bottom:4px}
  .stat-lbl{font-size:10px;color:var(--muted);letter-spacing:.12em}
  .v-teal{color:var(--teal)} .v-amber{color:var(--amber)} .v-green{color:var(--green)} .v-violet{color:var(--violet)}

  /* Feature grid */
  .features{padding:80px 40px;max-width:1100px;margin:0 auto}
  .section-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--teal);letter-spacing:.28em;text-align:center;margin-bottom:16px;opacity:.7}
  .section-title{font-size:clamp(28px,4vw,40px);font-weight:700;text-align:center;margin-bottom:64px;letter-spacing:-.01em}
  .section-title em{font-style:normal;color:var(--teal)}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
  .card{background:var(--surface);border:1px solid var(--borderB);border-radius:20px;padding:32px;transition:border-color .2s,transform .2s}
  .card:hover{border-color:rgba(0,232,198,0.25);transform:translateY(-2px)}
  .card-icon{font-size:28px;margin-bottom:20px}
  .card-title{font-size:17px;font-weight:700;margin-bottom:10px;letter-spacing:-.01em}
  .card-body{font-size:14px;color:var(--muted);line-height:1.7}

  /* Screens section */
  .screens{padding:80px 40px;text-align:center;border-top:1px solid var(--borderB)}
  .screen-labels{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:40px}
  .chip{font-size:11px;font-weight:600;padding:6px 16px;border-radius:20px;letter-spacing:.06em}
  .chip-teal{background:rgba(0,232,198,0.12);color:var(--teal);border:1px solid rgba(0,232,198,0.2)}
  .chip-amber{background:rgba(245,166,35,0.12);color:var(--amber);border:1px solid rgba(245,166,35,0.2)}
  .chip-violet{background:rgba(123,92,240,0.12);color:var(--violet);border:1px solid rgba(123,92,240,0.2)}
  .chip-green{background:rgba(54,214,138,0.12);color:var(--green);border:1px solid rgba(54,214,138,0.2)}

  /* Terminal block */
  .terminal-section{padding:80px 40px;max-width:800px;margin:0 auto;text-align:center}
  .terminal{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px 32px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.9;color:var(--muted);text-align:left}
  .terminal .c-teal{color:var(--teal)} .terminal .c-amber{color:var(--amber)}
  .terminal .c-green{color:var(--green)} .terminal .c-violet{color:var(--violet)}
  .terminal .c-muted{color:rgba(180,220,215,0.3)}

  /* Footer */
  footer{padding:40px;text-align:center;border-top:1px solid var(--borderB);color:var(--muted);font-size:12px}
  footer a{color:var(--teal);text-decoration:none}
</style>
</head>
<body>

<nav class="nav">
  <span class="logo">NRV<span class="logo-dot">.</span></span>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/nerve-viewer">Viewer</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/nerve-mock">Try Mock ↗</a>
</nav>

<section class="hero">
  <div class="status-badge">6 AGENTS ACTIVE</div>
  <p class="hero-eyebrow">AUTONOMOUS AGENT CONTROL</p>
  <h1>NER<span>VE</span></h1>
  <p class="hero-tagline">Mission control for your autonomous AI fleet. Monitor, orchestrate and debug agents at scale.</p>

  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/nerve-mock">Interactive Mock ↗</a>
    <a class="btn-ghost"   href="https://ram.zenbin.org/nerve-viewer">View Prototype →</a>
  </div>

  <div class="stats-strip">
    <div class="stat"><div class="stat-val v-green">23</div><div class="stat-lbl">TASKS RUNNING</div></div>
    <div class="stat"><div class="stat-val v-teal">510K</div><div class="stat-lbl">TOKENS TODAY</div></div>
    <div class="stat"><div class="stat-val v-amber">99.8%</div><div class="stat-lbl">FLEET UPTIME</div></div>
    <div class="stat"><div class="stat-val v-violet">6</div><div class="stat-lbl">AGENTS</div></div>
  </div>
</section>

<section class="features" id="features">
  <p class="section-label">CAPABILITIES</p>
  <h2 class="section-title">Every agent, <em>in full view</em></h2>
  <div class="grid">
    <div class="card">
      <div class="card-icon">⬡</div>
      <div class="card-title">Fleet Overview</div>
      <div class="card-body">See all agents in one glance — status, task load, CPU, and token burn. Spot bottlenecks before they cascade.</div>
    </div>
    <div class="card">
      <div class="card-icon">◎</div>
      <div class="card-title">Agent Deep-Dive</div>
      <div class="card-body">Step inside any agent's session. Live CPU sparklines, token burn rate, full task queue, and context window health.</div>
    </div>
    <div class="card">
      <div class="card-icon">⚡</div>
      <div class="card-title">Mission Feed</div>
      <div class="card-body">Real-time chronological log of every tool call, API request, handoff, and decision your agents make.</div>
    </div>
    <div class="card">
      <div class="card-icon">⚠</div>
      <div class="card-title">Anomaly Alerts</div>
      <div class="card-body">Instant alerts for context overflow, CPU spikes, SSL failures, and unexpected delegation patterns.</div>
    </div>
    <div class="card">
      <div class="card-icon">⊞</div>
      <div class="card-title">Pipeline Builder</div>
      <div class="card-body">Visual orchestration graph. Design multi-agent task chains, set triggers, and review last-run stats at a glance.</div>
    </div>
    <div class="card">
      <div class="card-icon">⬡</div>
      <div class="card-title">Zero-Human Ready</div>
      <div class="card-body">Built for the era of autonomous companies. Your agents run the work — NERVE makes sure nothing breaks silently.</div>
    </div>
  </div>
</section>

<section class="screens" id="screens">
  <p class="section-label">5 SCREENS</p>
  <h2 class="section-title">Designed for <em>operational clarity</em></h2>
  <div class="screen-labels">
    <span class="chip chip-teal">Fleet Control</span>
    <span class="chip chip-amber">Agent Detail</span>
    <span class="chip chip-green">Mission Feed</span>
    <span class="chip chip-teal">Alert Centre</span>
    <span class="chip chip-violet">Orchestration</span>
  </div>
  <a class="btn-primary" href="https://ram.zenbin.org/nerve-viewer">View Full Prototype →</a>
</section>

<section class="terminal-section">
  <div class="terminal">
    <span class="c-muted">// live feed snapshot — 09:41:32</span><br>
    <span class="c-teal">Scout-7</span>  <span class="c-muted">TOOL_CALL</span>  web_search("AI agent frameworks 2026")<br>
    <span class="c-amber">Forge-2</span>  <span class="c-muted">THINKING </span>  Planning refactor approach for auth module…<br>
    <span class="c-violet">Drift-9</span>  <span class="c-muted">API_CALL </span>  POST /v1/pipelines/trigger → <span class="c-green">200 OK</span> (134ms)<br>
    <span class="c-green">Prism-4</span>  <span class="c-muted">RESULT   </span>  Anomaly score: 0.92 → flagging for review<br>
    <span class="c-teal">▌</span>
  </div>
</section>

<footer>
  <p>NERVE — Designed by <a href="https://ram.zenbin.org">RAM Design Studio</a> · Dark theme · 2026</p>
</footer>

</body>
</html>`;

// ─── Viewer HTML ─────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/nerve.pen','utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NERVE — Prototype Viewer</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:#070B10;font-family:'Inter',sans-serif;color:#E8F4F2}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:56px;background:rgba(7,11,16,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.07)}
  .logo{font-size:14px;font-weight:700;letter-spacing:.18em;color:#00E8C6;font-family:'JetBrains Mono',monospace}
  .tagline{font-size:12px;color:rgba(180,220,215,0.45);letter-spacing:.04em}
  .hero-btn{font-size:12px;font-weight:600;padding:7px 16px;background:rgba(0,232,198,0.12);color:#00E8C6;border:1px solid rgba(0,232,198,0.3);border-radius:20px;text-decoration:none}
  .viewer{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 56px);padding:32px;background:#040709}
  #pencil-viewer{width:100%;max-width:1200px;height:72vh;border-radius:20px;border:1px solid rgba(0,232,198,0.12);background:#070B10}
</style>
</head>
<body>
<div class="nav">
  <span class="logo">NERVE</span>
  <span class="tagline">Mission control for autonomous AI agents</span>
  <a class="hero-btn" href="https://ram.zenbin.org/nerve">← Hero page</a>
</div>
<div class="viewer">
  <div id="pencil-viewer">Loading prototype…</div>
</div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
</script>
<script src="https://unpkg.com/pencil-viewer@latest/dist/pencil-viewer.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded',()=>{
    if(window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN), theme: 'dark' });
    }
  });
</script>
</body>
</html>`;

function zenPost(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html, title: title || slug }));
    const r = https.request({
      hostname:'zenbin.org', path:`/v1/pages/${slug}?overwrite=true`, method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':body.length,'X-Subdomain':'ram'}
    }, res => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>{
        if(res.statusCode===200||res.statusCode===201) resolve({ok:true,url:`https://ram.zenbin.org/${slug}`});
        else reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0,200)}`));
      });
    });
    r.on('error',reject); r.write(body); r.end();
  });
}

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    r.on('error',reject); if(body) r.write(body); r.end();
  });
}

// ─── Publish hero ─────────────────────────────────────────────────────────────
console.log('📤 Publishing hero page...');
try {
  const hr = await zenPost(SLUG, heroHtml, 'NERVE — Mission Control for Autonomous AI Agents');
  console.log('✓ Hero:', hr.url);
} catch(e) { console.log('✗ Hero:', e.message); }

// ─── Publish viewer ───────────────────────────────────────────────────────────
console.log('📤 Publishing viewer...');
try {
  const vr = await zenPost(`${SLUG}-viewer`, viewerHtml, 'NERVE — Prototype Viewer');
  console.log('✓ Viewer:', vr.url);
} catch(e) { console.log('✗ Viewer:', e.message); }

// ─── Gallery queue update ─────────────────────────────────────────────────────
console.log('📚 Updating gallery queue...');
const now = new Date().toISOString();
const newEntry = {
  id:`heartbeat-nerve-${Date.now()}`,
  status:'done',
  app_name: APP_NAME,
  tagline: TAGLINE,
  archetype: ARCHETYPE,
  theme: 'dark',
  design_url: `https://ram.zenbin.org/${SLUG}`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: now,
  published_at: now,
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by Paperclip "open-source orchestration for zero-human companies" (lapa.ninja), Linear/Tracebit dark cinematic dashboards (darkmodedesign.com + land-book.com), Codegen "The OS for Code Agents" (land-book.com). DARK theme. Deep navy-black bg (#070B10), electric teal accent (#00E8C6), amber alerts (#F5A623), violet orchestration (#7B5CF0). 5 screens: Fleet overview with live agent grid + health summary + sparkline, Agent detail with CPU/token sparklines + task queue, Mission feed with real-time event log + timeline connector, Alert centre with severity triage, Orchestration pipeline visual graph.',
  screens: 5,
  source: 'heartbeat',
};

try {
  const headers = {'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'};
  const g = await ghReq({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
  const gj = JSON.parse(g.body);
  const raw = Buffer.from(gj.content,'base64').toString('utf8');
  let q = JSON.parse(raw);
  if(Array.isArray(q)) q = {version:1,submissions:q,updated_at:now};
  if(!q.submissions) q.submissions = [];
  q.submissions = q.submissions.filter(s=>s.app_name!==APP_NAME);
  q.submissions.push(newEntry);
  q.updated_at = now;
  const encoded = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
  const pb = Buffer.from(JSON.stringify({message:`feat: add ${APP_NAME} to gallery (heartbeat)`,content:encoded,sha:gj.sha}));
  const pr = await ghReq({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'PUT',
    headers:{...headers,'Content-Length':pb.length}},pb);
  console.log(`✓ Gallery updated (${pr.status}) — ${q.submissions.length} total`);
} catch(e) { console.log('✗ Gallery:', e.message); }

// ─── Design DB ───────────────────────────────────────────────────────────────
console.log('🗄  Indexing in design DB...');
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, newEntry);
  rebuildEmbeddings(db);
  console.log('✓ Indexed in design DB');
} catch(e) { console.log('✗ DB:', e.message); }

console.log('\n✦ NERVE publish complete');
console.log('  Hero    → https://ram.zenbin.org/nerve');
console.log('  Viewer  → https://ram.zenbin.org/nerve-viewer');
console.log('  Mock    → https://ram.zenbin.org/nerve-mock');
