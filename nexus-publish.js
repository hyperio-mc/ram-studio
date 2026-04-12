/**
 * NEXUS — Publish pipeline
 * Hero + viewer + mock + gallery queue + design DB
 * Theme: DARK — near-black, electric teal, soft violet
 * Inspired by: JetBrains Air (lapa.ninja), Darkroom/Midday (darkmodedesign.com)
 */
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'nexus';
const APP_NAME = 'NEXUS';
const TAGLINE  = 'Real-time AI agent operations';
const ARCHETYPE = 'ops-dashboard';
const PROMPT   = 'AI agent orchestration dashboard — dark theme, electric teal, real-time status indicators, tool call inspector';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

function zenPost(slug, html, title = '', subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NEXUS — Real-time AI Agent Operations</title>
<style>
  :root {
    --bg:#0B0B0E; --surface:#131318; --surface2:#1C1C24;
    --teal:#00E8C8; --violet:#8B72F8; --amber:#F5A623;
    --red:#F05A5A; --green:#3EE8A0;
    --text:#EEEEF2; --mid:#8888A2; --mute:rgba(238,238,242,.32);
    --border:rgba(255,255,255,.07); --border2:rgba(255,255,255,.11);
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:var(--bg);color:var(--text);font-family:"Inter","Helvetica Neue",sans-serif;overflow-x:hidden}
  body::before{content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);
    width:800px;height:400px;
    background:radial-gradient(ellipse,rgba(0,232,200,.055) 0%,transparent 70%);
    pointer-events:none;z-index:0}

  nav{position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 40px;height:64px;
    background:rgba(11,11,14,.88);backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border2)}
  .nav-logo{font-size:18px;font-weight:700;letter-spacing:-.5px;
    display:flex;align-items:center;gap:10px}
  .live-badge{font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
    font-family:"JetBrains Mono",monospace;color:var(--teal);
    background:rgba(0,232,200,.1);border:1px solid rgba(0,232,200,.3);
    padding:3px 8px;border-radius:20px;display:flex;align-items:center;gap:5px}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--teal);
    box-shadow:0 0 8px var(--teal);animation:blink 2s ease-in-out infinite}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
  .nav-btns{display:flex;gap:10px;align-items:center}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;
    border-radius:8px;font-size:13px;font-weight:500;text-decoration:none;
    cursor:pointer;transition:all .2s}
  .btn-ghost{color:var(--mid);border:1px solid var(--border2);background:transparent}
  .btn-ghost:hover{color:var(--text);background:var(--surface)}
  .btn-primary{color:var(--bg);background:var(--teal);border:none}
  .btn-primary:hover{background:#00d4b4;box-shadow:0 0 22px rgba(0,232,200,.3)}

  .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;
    text-align:center;padding:80px 24px 60px;position:relative;z-index:1}
  .hero-inner{max-width:740px}
  .eyebrow{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;
    font-family:"JetBrains Mono",monospace;color:var(--teal);margin-bottom:20px;
    display:flex;align-items:center;justify-content:center;gap:8px}
  .eyebrow::before,.eyebrow::after{content:'';flex:1;max-width:60px;height:1px;
    background:rgba(0,232,200,.3)}
  h1{font-size:clamp(42px,8vw,82px);font-weight:700;line-height:1.05;
    letter-spacing:-2.5px;margin-bottom:24px;
    background:linear-gradient(140deg,var(--text) 0%,rgba(238,238,242,.55) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent}
  h1 .ac{-webkit-text-fill-color:var(--teal)}
  .hero-sub{font-size:18px;line-height:1.65;color:var(--mid);
    max-width:520px;margin:0 auto 40px}
  .hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

  .stats-strip{display:flex;justify-content:center;
    border:1px solid var(--border2);border-radius:16px;overflow:hidden;
    margin:60px auto;max-width:640px;background:var(--surface)}
  .stat{flex:1;padding:28px 20px;text-align:center;border-right:1px solid var(--border2)}
  .stat:last-child{border-right:none}
  .stat-val{font-size:34px;font-weight:700;font-family:"JetBrains Mono",monospace;
    margin-bottom:4px;letter-spacing:-1px}
  .stat-label{font-size:11px;color:var(--mid);text-transform:uppercase;letter-spacing:1px}

  .agents-panel{background:var(--surface);border:1px solid var(--border2);
    border-radius:20px;padding:28px;margin:0 auto 60px;max-width:700px}
  .panel-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
  .panel-title{font-size:12px;font-weight:600;text-transform:uppercase;
    letter-spacing:1.5px;font-family:"JetBrains Mono",monospace;color:var(--mid)}
  .agent-row{display:flex;align-items:center;gap:12px;
    padding:12px 0;border-bottom:1px solid var(--border)}
  .agent-row:last-child{border-bottom:none}
  .ag-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  .ag-name{font-size:13px;font-weight:500;font-family:"JetBrains Mono",monospace;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ag-type{font-size:10px;padding:2px 7px;border-radius:4px;border:1px solid;white-space:nowrap;flex-shrink:0}
  .ag-prog{flex:1;max-width:120px}
  .prog-t{height:3px;background:var(--border2);border-radius:2px}
  .prog-f{height:3px;border-radius:2px;transition:width .8s ease}
  .ag-pct{font-size:11px;font-family:"JetBrains Mono",monospace;min-width:34px;text-align:right;flex-shrink:0}

  .screens-section{padding:80px 24px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
  .sec-label{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;
    font-family:"JetBrains Mono",monospace;color:var(--teal);margin-bottom:14px}
  .sec-title{font-size:clamp(28px,4vw,44px);font-weight:700;letter-spacing:-1px;margin-bottom:12px}
  .sec-sub{font-size:15px;color:var(--mid);line-height:1.6;max-width:500px;margin-bottom:48px}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
  .s-card{background:var(--surface);border:1px solid var(--border2);border-radius:16px;
    overflow:hidden;transition:transform .2s,box-shadow .2s}
  .s-card:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(0,0,0,.5)}
  .s-preview{height:200px;background:linear-gradient(135deg,#0B0B0E,#1C1C24);
    display:flex;align-items:center;justify-content:center;overflow:hidden}
  .s-mock{width:100px;background:var(--bg);border-radius:10px;
    border:1px solid var(--border2);overflow:hidden}
  .s-mock-h{height:24px;background:var(--surface);border-bottom:1px solid var(--border);
    display:flex;align-items:center;padding:0 7px;gap:3px}
  .md{width:4px;height:4px;border-radius:50%}
  .s-mock-b{padding:7px}
  .mb{height:5px;border-radius:3px;margin-bottom:4px}
  .mc{height:18px;background:var(--surface2);border-radius:4px;margin-bottom:4px;
    border:1px solid var(--border)}
  .s-info{padding:20px}
  .s-num{font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
    font-family:"JetBrains Mono",monospace;margin-bottom:6px}
  .s-name{font-size:16px;font-weight:600;margin-bottom:6px}
  .s-desc{font-size:13px;color:var(--mid);line-height:1.5}

  .feats{padding:80px 24px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
  .feats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:48px}
  .f-card{background:var(--surface);border:1px solid var(--border2);border-radius:16px;
    padding:28px;transition:border-color .2s}
  .f-card:hover{border-color:rgba(0,232,200,.2)}
  .f-icon{font-size:24px;margin-bottom:14px}
  .f-title{font-size:17px;font-weight:600;margin-bottom:8px}
  .f-desc{font-size:14px;color:var(--mid);line-height:1.6}

  .cta{padding:100px 24px;text-align:center;
    background:linear-gradient(180deg,transparent,rgba(0,232,200,.025));
    position:relative;z-index:1}
  .cta-title{font-size:clamp(30px,5vw,56px);font-weight:700;letter-spacing:-1.5px;margin-bottom:20px}
  .cta-sub{font-size:17px;color:var(--mid);margin-bottom:40px}
  .cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

  footer{border-top:1px solid var(--border);padding:32px 40px;
    display:flex;justify-content:space-between;align-items:center;
    color:var(--mid);font-size:12px;position:relative;z-index:1}

  @media(max-width:640px){
    nav{padding:0 20px}
    .stats-strip{flex-direction:column}
    .stat{border-right:none;border-bottom:1px solid var(--border2)}
    .stat:last-child{border-bottom:none}
    footer{flex-direction:column;gap:12px;text-align:center;padding:24px 20px}
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">
    NEXUS
    <span class="live-badge"><span class="live-dot"></span>LIVE</span>
  </div>
  <div class="nav-btns">
    <a href="https://ram.zenbin.org/nexus-viewer" class="btn btn-ghost">Prototype</a>
    <a href="https://ram.zenbin.org/nexus-mock" class="btn btn-primary">Try Mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-inner">
    <div class="eyebrow">AI Agent Operations Platform</div>
    <h1>Multitask with agents,<br><span class="ac">stay in control.</span></h1>
    <p class="hero-sub">Monitor, orchestrate, and inspect autonomous AI agents in real time. Status dots, task queues, tool call traces — all in one dark, focused dashboard.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/nexus-viewer" class="btn btn-primary">View Prototype →</a>
      <a href="https://ram.zenbin.org/nexus-mock" class="btn btn-ghost">Interactive Mock ☀◑</a>
    </div>
  </div>
</section>

<div style="padding:0 24px;position:relative;z-index:1">
  <div class="stats-strip">
    <div class="stat"><div class="stat-val" style="color:var(--teal)">8</div><div class="stat-label">Active Agents</div></div>
    <div class="stat"><div class="stat-val" style="color:var(--violet)">24</div><div class="stat-label">Tasks Queued</div></div>
    <div class="stat"><div class="stat-val" style="color:var(--green)">142</div><div class="stat-label">Completed</div></div>
    <div class="stat"><div class="stat-val" style="color:var(--amber)">99.1%</div><div class="stat-label">Uptime</div></div>
  </div>
</div>

<div style="padding:0 24px;position:relative;z-index:1">
  <div class="agents-panel">
    <div class="panel-header">
      <span class="panel-title">Running Agents</span>
      <span class="live-badge"><span class="live-dot"></span>LIVE</span>
    </div>
    ${[
      { name: 'code-gen-01', type: 'CODE', pct: 72, c: '#00E8C8' },
      { name: 'test-runner', type: 'TEST', pct: 89, c: '#3EE8A0' },
      { name: 'doc-parser', type: 'DATA', pct: 45, c: '#8B72F8' },
      { name: 'ml-trainer', type: 'ML', pct: 18, c: '#F05A5A' },
      { name: 'web-scraper', type: 'SCRAPE', pct: 30, c: '#F5A623' },
      { name: 'notify-svc', type: 'SVC', pct: 62, c: '#00E8C8' },
    ].map(a => `<div class="agent-row">
      <div class="ag-dot" style="background:${a.c};box-shadow:0 0 6px ${a.c}55"></div>
      <span class="ag-name">${a.name}</span>
      <span class="ag-type" style="color:${a.c};border-color:${a.c}44">${a.type}</span>
      <div class="ag-prog"><div class="prog-t"><div class="prog-f" style="width:${a.pct}%;background:${a.c}"></div></div></div>
      <span class="ag-pct" style="color:${a.c}">${a.pct}%</span>
    </div>`).join('')}
  </div>
</div>

<section class="screens-section">
  <p class="sec-label">Five Screens</p>
  <h2 class="sec-title">Everything you need to run agents at scale</h2>
  <p class="sec-sub">From system health overview to per-agent tool call traces — designed for clarity under operational pressure.</p>
  <div class="screens-grid">
    ${[
      { n:'01', name:'Overview', desc:'System health at a glance — active agents, queued tasks, errors, and live event feed.', c:'#00E8C8' },
      { n:'02', name:'Agents', desc:'Full agent roster with status, CPU usage, memory, uptime, and progress bars.', c:'#8B72F8' },
      { n:'03', name:'Activity Feed', desc:'Live stream of every agent event: writes, reads, tests, errors, and LLM calls.', c:'#3EE8A0' },
      { n:'04', name:'Tasks', desc:'Priority-sorted queue. P1/P2/P3 triage with real-time task completion tracking.', c:'#F5A623' },
      { n:'05', name:'Inspector', desc:'Deep dive into any agent: CPU sparkline, memory, uptime, and full tool call trace.', c:'#00E8C8' },
    ].map(s => `<div class="s-card">
      <div class="s-preview">
        <div class="s-mock">
          <div class="s-mock-h">
            <div class="md" style="background:#F05A5A"></div>
            <div class="md" style="background:#F5A623"></div>
            <div class="md" style="background:#3EE8A0"></div>
          </div>
          <div class="s-mock-b">
            <div class="mb" style="background:${s.c};width:55%"></div>
            <div class="mc"></div><div class="mc" style="width:85%"></div>
            <div class="mc" style="width:90%"></div>
            <div class="mb" style="background:${s.c};width:40%;margin-top:8px"></div>
            <div class="mc" style="width:75%"></div>
          </div>
        </div>
      </div>
      <div class="s-info">
        <div class="s-num" style="color:${s.c}">${s.n} / 05</div>
        <div class="s-name">${s.name}</div>
        <div class="s-desc">${s.desc}</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="feats">
  <p class="sec-label">Capabilities</p>
  <h2 class="sec-title">Built for the agentic era</h2>
  <div class="feats-grid">
    ${[
      { i:'⚡', t:'Real-time status', d:'Live polling every 2s — status dots, progress bars, and event feeds update continuously.' },
      { i:'🔍', t:'Tool call inspector', d:'See every read_file, write_file, run_tests, and call_llm your agent made with latency.' },
      { i:'⚠️', t:'Error surfacing', d:'P1 failures bubble to Overview immediately. OOMError, timeout, and crash states clearly marked.' },
      { i:'📊', t:'Resource tracking', d:'CPU sparklines, memory usage, and uptime — all per-agent, updated live.' },
      { i:'🎯', t:'Priority queue', d:'P1 critical through P3 normal task triage. Filter, reorder, assign across agents.' },
      { i:'🌙', t:'Dark-first design', d:'High-contrast electric teal on near-black. Readable at 2am when agents go wrong.' },
    ].map(f => `<div class="f-card">
      <div class="f-icon">${f.i}</div>
      <div class="f-title">${f.t}</div>
      <div class="f-desc">${f.d}</div>
    </div>`).join('')}
  </div>
</section>

<section class="cta">
  <h2 class="cta-title">Your agents are running.<br>Are you watching?</h2>
  <p class="cta-sub">NEXUS gives you the control layer that agentic AI systems were missing.</p>
  <div class="cta-btns">
    <a href="https://ram.zenbin.org/nexus-viewer" class="btn btn-primary" style="font-size:15px;padding:12px 28px">View Prototype →</a>
    <a href="https://ram.zenbin.org/nexus-mock" class="btn btn-ghost" style="font-size:15px;padding:12px 28px">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span>NEXUS — RAM Design Heartbeat · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
  <span>ram.zenbin.org/nexus</span>
</footer>
</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'nexus.pen'), 'utf8');
const embInject = 'window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';';
const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NEXUS — Design Viewer</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0B0B0E;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:system-ui,sans-serif}
  header{width:100%;background:#131318;border-bottom:1px solid rgba(255,255,255,.1);
    padding:14px 28px;display:flex;justify-content:space-between;align-items:center}
  .hb{font-size:18px;font-weight:700;color:#EEEEF2;letter-spacing:-.04em}
  .hs{font-size:11px;color:#8888A2;margin-top:3px}
  .hl{font-size:12px;color:#00E8C8;text-decoration:none;font-weight:600}
  #pencil-viewer{width:100%;flex:1;border:none;min-height:600px}
</style>
</head>
<body>
<header>
  <div>
    <div class="hb">NEXUS</div>
    <div class="hs">Real-time AI agent operations · 5 screens · Dark theme</div>
  </div>
  <a href="https://ram.zenbin.org/nexus" class="hl">← Overview</a>
</header>
<script>${embInject}</script>
<script src="https://pencil.dev/viewer.js"></script>
<div id="pencil-viewer"></div>
<script>
  if(window.PencilViewer && window.EMBEDDED_PEN){
    PencilViewer.init('#pencil-viewer',{pen:JSON.parse(window.EMBEDDED_PEN)});
  }
</script>
</body>
</html>`;

// ─── PUBLISH + QUEUE ──────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  let r = await zenPost(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', r.status, (r.status===200||r.status===201) ? '✓' : r.body.slice(0,120));

  console.log('Publishing viewer…');
  r = await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Viewer`);
  console.log('Viewer:', r.status, (r.status===200||r.status===201) ? '✓' : r.body.slice(0,120));

  // Gallery queue
  console.log('Updating gallery queue…');
  try {
    const headers = { Authorization:`token ${TOKEN}`, 'User-Agent':'ram-heartbeat/1.0', Accept:'application/vnd.github.v3+json' };
    const getRes = await new Promise((res,rej)=>{
      const req = https.request({ hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, headers }, r=>{
        let d=''; r.on('data',c=>d+=c); r.on('end',()=>res({status:r.statusCode,body:d}));
      });
      req.on('error',rej); req.end();
    });
    const fileData = JSON.parse(getRes.body);
    const currentSha = fileData.sha;
    const currentContent = Buffer.from(fileData.content,'base64').toString('utf8');
    let queue = JSON.parse(currentContent);
    if (Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at:new Date().toISOString() };
    if (!queue.submissions) queue.submissions = [];

    const newEntry = {
      id:`heartbeat-${SLUG}-${Date.now()}`,
      status:'done',
      app_name: APP_NAME,
      tagline: TAGLINE,
      archetype: ARCHETYPE,
      design_url:`https://ram.zenbin.org/${SLUG}`,
      viewer_url:`https://ram.zenbin.org/${SLUG}-viewer`,
      mock_url:`https://ram.zenbin.org/${SLUG}-mock`,
      submitted_at:new Date().toISOString(),
      published_at:new Date().toISOString(),
      credit:'RAM Design Heartbeat',
      prompt: PROMPT,
      screens:5,
      source:'heartbeat',
    };
    queue.submissions.push(newEntry);
    queue.updated_at = new Date().toISOString();

    const newContent = Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
    const putBody = JSON.stringify({ message:`add: ${APP_NAME} to gallery (heartbeat)`, content:newContent, sha:currentSha });
    const putRes = await new Promise((res,rej)=>{
      const buf = Buffer.from(putBody);
      const req = https.request({
        hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'PUT',
        headers:{ ...headers, 'Content-Type':'application/json', 'Content-Length':buf.length },
      }, r=>{
        let d=''; r.on('data',c=>d+=c); r.on('end',()=>res({status:r.statusCode,body:d}));
      });
      req.on('error',rej); req.write(buf); req.end();
    });
    console.log('Gallery queue:', putRes.status===200||putRes.status===201 ? '✓' : putRes.body.slice(0,100));
    console.log('Entry:', JSON.stringify(newEntry, null, 2));
  } catch(err) {
    console.error('Queue error:', err.message);
  }

  console.log('');
  console.log(`✓ Hero    → https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer  → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`✓ Mock    → https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(console.error);
