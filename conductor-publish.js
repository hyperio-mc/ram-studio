'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG      = 'conductor';
const APP_NAME  = 'Conductor';
const TAGLINE   = 'Orchestrate your AI agents, effortlessly';
const ARCHETYPE = 'ai-ops-dashboard';
const PROMPT    = 'Inspired by JetBrains Air "Multitask with agents, stay in control" seen on lapa.ninja, and Midday.ai clean tabbed dashboard from darkmodedesign.com. Light-theme AI agent orchestration dashboard: unified overview, agent drilldown with sparklines, task queue management, heatmap analytics, and quick-compose screen.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const P = {
  bg:      '#F5F4F1',
  surface: '#FFFFFF',
  surf2:   '#ECEAE5',
  text:    '#18181A',
  sub:     '#6B6A6E',
  accent:  '#5046E5',
  accent2: '#F59E0B',
  accent3: '#22C55E',
  danger:  '#EF4444',
  border:  'rgba(24,24,26,0.09)',
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

// ─── Hero HTML ───────────────────────────────────────────────────────────────
function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:${P.bg}; --surface:${P.surface}; --surf2:${P.surf2};
    --text:${P.text}; --sub:${P.sub}; --accent:${P.accent};
    --accent2:${P.accent2}; --accent3:${P.accent3}; --danger:${P.danger};
    --border:${P.border};
  }
  body { background:var(--bg); color:var(--text);
    font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;
    -webkit-font-smoothing:antialiased; }
  nav {
    position:sticky; top:0; z-index:100;
    background:rgba(245,244,241,0.85); backdrop-filter:blur(12px);
    border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 40px; height:60px;
  }
  .logo { font-size:14px; font-weight:900; letter-spacing:1.5px; color:var(--accent); }
  .nav-links { display:flex; gap:28px; }
  .nav-links a { font-size:13px; color:var(--sub); text-decoration:none; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta { font-size:13px; font-weight:700; color:#fff; background:var(--accent);
    border-radius:10px; padding:8px 18px; text-decoration:none; }
  .hero { max-width:1080px; margin:0 auto; padding:90px 40px 60px;
    display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; }
  .eyebrow {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(80,70,229,0.08); border:1px solid rgba(80,70,229,0.15);
    border-radius:100px; padding:5px 14px;
    font-size:11px; font-weight:700; letter-spacing:1px;
    color:var(--accent); text-transform:uppercase; margin-bottom:22px;
  }
  .eyebrow-dot { width:6px; height:6px; border-radius:50%; background:var(--accent);
    animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  h1 { font-size:clamp(34px,4.5vw,52px); font-weight:900; line-height:1.1;
    letter-spacing:-1.5px; margin-bottom:18px; }
  h1 em { font-style:normal; color:var(--accent); }
  .hero-sub { font-size:17px; color:var(--sub); line-height:1.7;
    max-width:420px; margin-bottom:34px; }
  .actions { display:flex; gap:12px; flex-wrap:wrap; }
  .btn-primary { background:var(--accent); color:#fff; font-size:14px; font-weight:700;
    padding:13px 26px; border-radius:12px; text-decoration:none;
    box-shadow:0 4px 20px rgba(80,70,229,0.3); }
  .btn-ghost { background:var(--surface); color:var(--text); font-size:14px; font-weight:600;
    padding:13px 26px; border-radius:12px; text-decoration:none;
    border:1px solid var(--border); }
  /* phone */
  .phone { width:250px; margin:0 auto; background:var(--surface);
    border-radius:36px; border:2px solid var(--border);
    box-shadow:0 20px 70px rgba(0,0,0,0.11); overflow:hidden; padding:14px 12px 10px; }
  .notch { width:76px; height:20px; background:var(--text);
    border-radius:0 0 12px 12px; margin:0 auto 14px; }
  .mini { background:var(--bg); border-radius:18px; padding:12px; }
  .mini-head { font-size:8px; font-weight:900; letter-spacing:1.2px;
    color:var(--accent); margin-bottom:8px; }
  .mini-title { font-size:12px; font-weight:800; margin-bottom:2px; }
  .mini-sub2 { font-size:8px; color:var(--sub); margin-bottom:10px; }
  .metrics-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; margin-bottom:10px; }
  .m-card { background:var(--surface); border-radius:7px; padding:6px 5px;
    border:1px solid var(--border); }
  .m-label { font-size:6px; color:var(--sub); }
  .m-val { font-size:14px; font-weight:900; }
  .agents-mini { display:flex; flex-direction:column; gap:5px; }
  .a-row { background:var(--surface); border-radius:7px; padding:6px 8px;
    display:flex; align-items:center; gap:6px;
    border-left:3px solid; border-top:1px solid var(--border);
    border-right:1px solid var(--border); border-bottom:1px solid var(--border); }
  .dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
  .a-info { flex:1; min-width:0; }
  .a-name { font-size:8px; font-weight:700; }
  .a-task { font-size:7px; color:var(--sub); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .a-pct { font-size:7px; font-weight:700; }
  /* sections */
  .section { max-width:1080px; margin:0 auto; padding:70px 40px; }
  .s-label { font-size:11px; font-weight:700; letter-spacing:1.5px;
    color:var(--sub); text-transform:uppercase; margin-bottom:10px; }
  .s-title { font-size:34px; font-weight:900; letter-spacing:-1px; margin-bottom:14px; }
  .s-sub { font-size:16px; color:var(--sub); max-width:500px; line-height:1.7; margin-bottom:48px; }
  .feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
  .feat-card { background:var(--surface); border:1px solid var(--border);
    border-radius:16px; padding:26px; }
  .feat-icon { width:42px; height:42px; border-radius:11px;
    background:rgba(80,70,229,0.08); display:flex; align-items:center;
    justify-content:center; font-size:19px; margin-bottom:14px; }
  .feat-title { font-size:14px; font-weight:800; margin-bottom:7px; }
  .feat-desc { font-size:12px; color:var(--sub); line-height:1.65; }
  /* table */
  .tbl-wrap { background:var(--surface); border:1px solid var(--border);
    border-radius:18px; overflow:hidden; margin-bottom:60px; }
  .tbl-hd, .tbl-row {
    display:grid; grid-template-columns:2fr 3fr 1fr 1fr 100px;
    gap:14px; padding:13px 22px; }
  .tbl-hd { border-bottom:1px solid var(--border); font-size:10px;
    font-weight:700; letter-spacing:0.5px; color:var(--sub); text-transform:uppercase; }
  .tbl-row { border-bottom:1px solid var(--border); align-items:center; font-size:13px; }
  .tbl-row:last-child { border-bottom:none; }
  .agent-nm { font-weight:700; }
  .agent-tsk { color:var(--sub); }
  .agent-spd { font-weight:600; }
  .agent-dn { font-weight:700; color:var(--accent); }
  .pill { font-size:10px; font-weight:700; padding:3px 9px;
    border-radius:100px; display:inline-block; }
  .pill.run { background:rgba(34,197,94,0.12); color:var(--accent3); }
  .pill.idl { background:var(--surf2); color:var(--sub); }
  .pill.err { background:rgba(239,68,68,0.10); color:var(--danger); }
  /* screens */
  .scr-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:28px; }
  .scr-card { background:var(--surface); border:1px solid var(--border);
    border-radius:12px; overflow:hidden; aspect-ratio:9/16;
    display:flex; flex-direction:column; }
  .scr-top { flex:1; background:var(--bg); display:flex;
    align-items:center; justify-content:center; font-size:26px; opacity:0.35; }
  .scr-lbl { padding:8px 10px; font-size:10px; font-weight:600;
    color:var(--sub); border-top:1px solid var(--border); }
  /* cta */
  .cta-wrap { max-width:1080px; margin:0 auto 70px; padding:0 40px; }
  .cta-box { background:var(--accent); border-radius:22px; padding:50px 52px;
    display:flex; align-items:center; justify-content:space-between; gap:36px; flex-wrap:wrap; }
  .cta-box h2 { font-size:28px; font-weight:900; color:#fff; max-width:380px; }
  .cta-box p { color:rgba(255,255,255,0.7); font-size:15px; margin-top:7px; }
  .btn-wht { background:#fff; color:var(--accent); font-size:14px; font-weight:800;
    padding:14px 28px; border-radius:12px; text-decoration:none; flex-shrink:0; }
  footer { border-top:1px solid var(--border); padding:28px 40px;
    display:flex; justify-content:space-between; max-width:1080px; margin:0 auto;
    font-size:11px; color:var(--sub); }
  @media(max-width:768px){
    .hero{grid-template-columns:1fr;padding:60px 20px 36px;gap:36px;}
    .feat-grid{grid-template-columns:1fr;}
    .scr-grid{grid-template-columns:repeat(3,1fr);}
    .tbl-hd,.tbl-row{grid-template-columns:1fr 1fr;}
    nav{padding:0 20px;}
    .nav-links{display:none;}
  }
</style>
</head>
<body>
<nav>
  <div class="logo">CONDUCTOR</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#fleet">Agent Fleet</a>
    <a href="#screens">Screens</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Live Mock ✦</a>
</nav>

<section class="hero">
  <div>
    <div class="eyebrow"><div class="eyebrow-dot"></div>AI Agent Orchestration</div>
    <h1>Multitask with agents,<br><em>stay in control</em></h1>
    <p class="hero-sub">Conductor gives you a clear, unified view of every AI agent running in your stack — dispatch tasks, monitor progress, and debug errors from one lightweight dashboard.</p>
    <div class="actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Pencil Viewer →</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">☀◑ Interactive Mock</a>
    </div>
  </div>
  <div style="position:relative">
    <div class="phone">
      <div class="notch"></div>
      <div class="mini">
        <div class="mini-head">CONDUCTOR</div>
        <div class="mini-title">Good morning, Rakis</div>
        <div class="mini-sub2">3 agents active · 2 tasks queued</div>
        <div class="metrics-row">
          <div class="m-card"><div class="m-label">Active</div><div class="m-val" style="color:#22C55E">3</div></div>
          <div class="m-card"><div class="m-label">Done</div><div class="m-val" style="color:#5046E5">47</div></div>
          <div class="m-card"><div class="m-label">Speed</div><div class="m-val" style="color:#F59E0B">1.8s</div></div>
        </div>
        <div class="agents-mini">
          <div class="a-row" style="border-left-color:#22C55E">
            <div class="dot" style="background:#22C55E"></div>
            <div class="a-info"><div class="a-name">Researcher</div><div class="a-task">Scanning tech papers · batch 4/12</div></div>
            <div class="a-pct" style="color:#5046E5">67%</div>
          </div>
          <div class="a-row" style="border-left-color:#22C55E">
            <div class="dot" style="background:#22C55E"></div>
            <div class="a-info"><div class="a-name">Codesmith</div><div class="a-task">Refactoring auth module</div></div>
            <div class="a-pct" style="color:#5046E5">34%</div>
          </div>
          <div class="a-row" style="border-left-color:#EF4444">
            <div class="dot" style="background:#EF4444"></div>
            <div class="a-info"><div class="a-name">Validator</div><div class="a-task">Schema lint failed · retry #2</div></div>
            <div class="a-pct" style="color:#EF4444">ERR</div>
          </div>
          <div class="a-row" style="border-left-color:#ECEAE5">
            <div class="dot" style="background:#ECEAE5"></div>
            <div class="a-info"><div class="a-name">Summariser</div><div class="a-task">Idle — awaiting task</div></div>
            <div class="a-pct" style="color:#6B6A6E">—</div>
          </div>
        </div>
      </div>
    </div>
    <div style="position:absolute;bottom:16px;right:-14px;background:var(--surface);
      border-radius:12px;padding:9px 14px;border:1px solid var(--border);
      box-shadow:0 4px 20px rgba(80,70,229,0.10);font-size:12px;white-space:nowrap;">
      <strong style="color:#22C55E">↑ 96%</strong> task success rate today
    </div>
  </div>
</section>

<section class="section" id="features">
  <div class="s-label">Why Conductor</div>
  <div class="s-title">Every agent. One screen.</div>
  <p class="s-sub">Designed for builders running parallel AI agents — no more juggling terminals, log files, and ad-hoc dashboards.</p>
  <div class="feat-grid">
    <div class="feat-card"><div class="feat-icon">⬡</div><div class="feat-title">Unified Overview</div><div class="feat-desc">All agents, live progress, and activity feed in one glanceable screen. Color-coded status strips signal health instantly.</div></div>
    <div class="feat-card"><div class="feat-icon">◫</div><div class="feat-title">Task Queue</div><div class="feat-desc">Manage the full task backlog across agents. Prioritise, reassign, or cancel in one tap. High/medium/low priority bars at a glance.</div></div>
    <div class="feat-card"><div class="feat-icon">◩</div><div class="feat-title">Analytics</div><div class="feat-desc">Per-agent bar charts, activity heatmaps by hour, and efficiency scores. Spot slowdowns before they become blockers.</div></div>
    <div class="feat-card"><div class="feat-icon">◈</div><div class="feat-title">Agent Detail</div><div class="feat-desc">Drill into any agent: task-per-hour sparklines, accuracy metrics, batch progress, and full timestamped activity log.</div></div>
    <div class="feat-card"><div class="feat-icon">+</div><div class="feat-title">Quick Compose</div><div class="feat-desc">Write instructions, pick an agent, set priority and run mode — dispatch tasks in one screen. No config files, no CLI flags.</div></div>
    <div class="feat-card"><div class="feat-icon">🛡</div><div class="feat-title">Error Visibility</div><div class="feat-desc">Errors surface immediately via red status strips and the live feed. Nothing fails silently while you sleep.</div></div>
  </div>
</section>

<section class="section" id="fleet" style="padding-top:0">
  <div class="s-label">Live Fleet View</div>
  <div class="s-title" style="font-size:26px;margin-bottom:20px">All agents. One table.</div>
  <div class="tbl-wrap">
    <div class="tbl-hd"><div>Agent</div><div>Current Task</div><div>Speed</div><div>Done Today</div><div>Status</div></div>
    <div class="tbl-row"><div class="agent-nm">Researcher</div><div class="agent-tsk">Scanning tech papers · batch 4 of 12</div><div class="agent-spd">2.1s</div><div class="agent-dn">36</div><div><span class="pill run">RUNNING</span></div></div>
    <div class="tbl-row"><div class="agent-nm">Codesmith</div><div class="agent-tsk">Refactoring auth module · pass 2</div><div class="agent-spd">4.8s</div><div class="agent-dn">11</div><div><span class="pill run">RUNNING</span></div></div>
    <div class="tbl-row"><div class="agent-nm">Summariser</div><div class="agent-tsk">Idle — awaiting task assignment</div><div class="agent-spd">—</div><div class="agent-dn">22</div><div><span class="pill idl">IDLE</span></div></div>
    <div class="tbl-row"><div class="agent-nm">Validator</div><div class="agent-tsk">Schema lint failed · retry #2</div><div class="agent-spd">1.2s</div><div class="agent-dn">8</div><div><span class="pill err">ERROR</span></div></div>
  </div>
</section>

<section class="section" id="screens" style="padding-top:0">
  <div class="s-label">Design Screens</div>
  <div class="s-title" style="font-size:26px;margin-bottom:20px">5 screens. Every workflow.</div>
  <div class="scr-grid">
    <div class="scr-card"><div class="scr-top">⬡</div><div class="scr-lbl">Overview</div></div>
    <div class="scr-card"><div class="scr-top">◈</div><div class="scr-lbl">Agent Detail</div></div>
    <div class="scr-card"><div class="scr-top">◫</div><div class="scr-lbl">Task Queue</div></div>
    <div class="scr-card"><div class="scr-top">◩</div><div class="scr-lbl">Analytics</div></div>
    <div class="scr-card"><div class="scr-top">+</div><div class="scr-lbl">Compose</div></div>
  </div>
  <div style="display:flex;gap:12px;flex-wrap:wrap;">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary" style="font-size:13px;padding:11px 22px">Open Pencil Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost" style="font-size:13px;padding:11px 22px">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="cta-wrap">
  <div class="cta-box">
    <div><h2>Ready to orchestrate your agents?</h2><p>Explore all 5 screens in the interactive mock — light and dark mode included.</p></div>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-wht">Explore Mock →</a>
  </div>
</div>

<footer>
  <div>CONDUCTOR · RAM Design Heartbeat · March 2026</div>
  <div>Inspired by JetBrains Air (lapa.ninja) + Midday.ai (darkmodedesign.com)</div>
</footer>
</body>
</html>`;
}

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
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
<body style="margin:0;background:#F5F4F1;">
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

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const penJson = fs.readFileSync('/workspace/group/design-studio/conductor.pen', 'utf8');

  console.log('Publishing hero page...');
  const heroRes = await zenPublish(SLUG, buildHeroHtml(), `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 120));

  console.log('Publishing viewer...');
  const viewerRes = await zenPublish(`${SLUG}-viewer`, buildViewerHtml(penJson), `${APP_NAME} — Pencil Viewer`);
  console.log('Viewer:', viewerRes.status, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 120));

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
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      Accept: 'application/vnd.github.v3+json',
    },
  }, putBody);

  console.log('Gallery queue:', putRes.status === 200 ? '✓ updated' : putRes.body.slice(0, 100));

  console.log('\n✓ All publishing complete.');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(console.error);
