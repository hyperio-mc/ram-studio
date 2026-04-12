// spire-publish.js — Hero page + viewer for SPIRE
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG     = 'spire';
const APP_NAME = 'SPIRE';
const TAGLINE  = 'Every signal, every sprint, in focus';

function publish(slug, html, title, subdomain='ram'){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({title,html,overwrite:true});
    const req=https.request({
      hostname:'zenbin.org',
      path:`/v1/pages/${slug}`,
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Content-Length':Buffer.byteLength(body),
        'X-Subdomain':subdomain,
      },
    },res=>{
      let d='';
      res.on('data',c=>d+=c);
      res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    req.on('error',reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ────────────────────────────────────────────────────────────────
const heroHtml=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0C0B0A;
  --surf:#181614;
  --surf2:#222019;
  --surf3:#2C2924;
  --text:#EDE9E2;
  --text2:rgba(237,233,226,0.58);
  --text3:rgba(237,233,226,0.34);
  --accent:#5468D4;
  --accent2:#D4723A;
  --green:#3DB88C;
  --red:#C9542A;
  --border:rgba(237,233,226,0.10);
}
html{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif}
body{max-width:1100px;margin:0 auto;padding:0 24px 80px}

nav{display:flex;align-items:center;justify-content:space-between;
    padding:22px 0;border-bottom:1px solid var(--border)}
.logo{font-size:13px;font-weight:700;letter-spacing:3px;color:var(--accent)}
.nav-links{display:flex;gap:32px}
.nav-links a{font-size:13px;color:var(--text2);text-decoration:none;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#fff;border:none;
         padding:9px 22px;border-radius:20px;font-size:13px;
         font-weight:600;cursor:pointer;font-family:inherit;
         transition:opacity .2s}
.nav-cta:hover{opacity:.85}

.hero{padding:96px 0 72px;max-width:760px}
.hero-eyebrow{font-size:11px;font-weight:600;letter-spacing:3px;
              color:var(--accent);margin-bottom:20px;
              display:flex;align-items:center;gap:8px}
.hero-eyebrow::before{content:'';display:block;width:20px;height:2px;background:var(--accent)}
h1{font-size:clamp(40px,6vw,72px);font-weight:700;line-height:1.08;
   letter-spacing:-1.5px;margin-bottom:28px}
h1 span{color:var(--accent)}
.hero-sub{font-size:18px;color:var(--text2);line-height:1.7;
          max-width:540px;margin-bottom:44px}
.hero-actions{display:flex;gap:16px;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#fff;border:none;
             padding:14px 32px;border-radius:24px;font-size:15px;
             font-weight:600;cursor:pointer;font-family:inherit;
             text-decoration:none;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-outline{background:transparent;color:var(--text);
             border:1px solid var(--border);
             padding:13px 28px;border-radius:24px;font-size:15px;
             font-weight:500;cursor:pointer;font-family:inherit;
             text-decoration:none;transition:border-color .2s}
.btn-outline:hover{border-color:var(--text2)}

.screens-preview{display:flex;gap:12px;padding:64px 0;
                 overflow-x:auto;scrollbar-width:none}
.screens-preview::-webkit-scrollbar{display:none}
.screen-frame{flex:0 0 240px;background:var(--surf);
              border:1px solid var(--border);border-radius:20px;
              padding:20px 16px;min-height:380px}
.screen-label{font-size:10px;font-weight:700;letter-spacing:2px;
              color:var(--text3);margin-bottom:16px}

/* Command screen mock */
.metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
.metric-card{background:var(--surf2);border:1px solid var(--border);
             border-radius:10px;padding:12px}
.metric-label{font-size:8px;font-weight:600;letter-spacing:1px;color:var(--text3)}
.metric-val{font-size:20px;font-weight:700;line-height:1.2;margin-top:2px}
.metric-sub{font-size:9px;color:var(--text2);margin-top:4px}

/* Agent row */
.agent-row{display:flex;align-items:center;gap:10px;
           background:var(--surf2);border:1px solid var(--border);
           border-radius:8px;padding:10px 12px;margin-bottom:6px}
.agent-icon{width:28px;height:28px;border-radius:50%;background:var(--surf3);
            display:flex;align-items:center;justify-content:center;
            font-size:12px;flex-shrink:0}
.agent-info{flex:1;min-width:0}
.agent-name{font-size:11px;font-weight:600;color:var(--text)}
.agent-proj{font-size:9px;color:var(--text3)}
.status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* Signal card */
.signal-card{border-radius:10px;padding:12px;margin-bottom:8px;
             border:1px solid var(--border)}
.signal-sev{font-size:8px;font-weight:700;letter-spacing:1px;
            padding:2px 8px;border-radius:4px;display:inline-block;margin-bottom:6px}
.signal-title{font-size:11px;font-weight:600;margin-bottom:4px}
.signal-body{font-size:9px;color:var(--text2);line-height:1.5}

/* Features section */
.section-label{font-size:11px;font-weight:700;letter-spacing:3px;
               color:var(--accent);margin-bottom:20px}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
          gap:2px;margin:64px 0}
.feature{background:var(--surf);border:1px solid var(--border);
         padding:36px;transition:border-color .2s}
.feature:first-child{border-radius:16px 0 0 16px}
.feature:last-child{border-radius:0 16px 16px 0}
.feature:hover{border-color:rgba(84,104,212,0.35)}
.feature-icon{font-size:24px;margin-bottom:20px}
.feature h3{font-size:16px;font-weight:700;margin-bottom:10px}
.feature p{font-size:13px;color:var(--text2);line-height:1.65}

/* Agent showcase */
.agents-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:48px 0}
.agent-card{background:var(--surf);border:1px solid var(--border);
            border-radius:14px;padding:24px;
            border-left:4px solid var(--agent-color)}
.agent-card h4{font-size:14px;font-weight:700;margin-bottom:6px}
.agent-card p{font-size:12px;color:var(--text2);line-height:1.6}
.agent-status-tag{font-size:10px;font-weight:600;margin-top:12px;
                  padding:4px 10px;border-radius:20px;display:inline-block}

/* Palette section */
.palette-row{display:flex;gap:10px;margin:48px 0}
.swatch{width:72px;height:72px;border-radius:14px;
        display:flex;align-items:flex-end;padding:8px;
        font-size:9px;font-weight:600;color:rgba(255,255,255,0.7)}

/* Stats */
.stats{display:grid;grid-template-columns:repeat(3,1fr);
       gap:2px;margin:64px 0}
.stat{background:var(--surf);border:1px solid var(--border);
      padding:40px;text-align:center}
.stat-val{font-size:48px;font-weight:700;color:var(--accent);line-height:1}
.stat-label{font-size:12px;color:var(--text2);margin-top:8px;line-height:1.5}

/* CTA */
.cta-block{background:var(--surf);border:1px solid var(--border);
           border-radius:24px;padding:72px 48px;text-align:center;margin-top:80px}
.cta-block h2{font-size:36px;font-weight:700;margin-bottom:16px}
.cta-block p{font-size:16px;color:var(--text2);margin-bottom:36px}

/* Footer */
footer{padding:40px 0;border-top:1px solid var(--border);
       display:flex;justify-content:space-between;align-items:center;
       color:var(--text3);font-size:12px;margin-top:80px}
.footer-logo{font-size:12px;font-weight:700;letter-spacing:2px;color:var(--accent)}

@media(max-width:600px){
  .features,.stats,.agents-grid{grid-template-columns:1fr}
  .feature:first-child,.feature:last-child{border-radius:14px}
  .screens-preview .screen-frame{flex:0 0 200px}
}
</style>
</head>
<body>

<nav>
  <div class="logo">SPIRE</div>
  <div class="nav-links">
    <a href="#">Agents</a>
    <a href="#">Projects</a>
    <a href="#">Signals</a>
    <a href="${SLUG}-viewer">View Design →</a>
  </div>
  <button class="nav-cta">Start free trial</button>
</nav>

<section class="hero">
  <div class="hero-eyebrow">AI Project Intelligence</div>
  <h1>Every signal,<br>every sprint,<br><span>in focus.</span></h1>
  <p class="hero-sub">SPIRE deploys AI agents across your engineering projects — surfacing risks, tracking velocity, and turning sprint data into actionable intelligence before things go wrong.</p>
  <div class="hero-actions">
    <a href="${SLUG}-viewer" class="btn-primary">View prototype →</a>
    <a href="${SLUG}-mock" class="btn-outline">Interactive mock</a>
  </div>
</section>

<!-- Live screen previews -->
<div class="screens-preview">

  <!-- Command -->
  <div class="screen-frame">
    <div class="screen-label">COMMAND</div>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">AGENTS</div>
        <div class="metric-val" style="color:#3DB88C">12</div>
        <div class="metric-sub">↑ 3 since Mon</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">SIGNALS</div>
        <div class="metric-val" style="color:#C9542A">7</div>
        <div class="metric-sub">2 high priority</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">ON TRACK</div>
        <div class="metric-val" style="color:#5468D4">84%</div>
        <div class="metric-sub">9 projects</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">VELOCITY</div>
        <div class="metric-val" style="color:#D4723A">↑22</div>
        <div class="metric-sub">pts this sprint</div>
      </div>
    </div>
    <div class="agent-row">
      <div class="agent-icon" style="color:#3DB88C">◈</div>
      <div class="agent-info"><div class="agent-name">Scope Tracker</div><div class="agent-proj">Atlas UI</div></div>
      <div class="status-dot" style="background:#3DB88C"></div>
    </div>
    <div class="agent-row">
      <div class="agent-icon" style="color:#C9542A">◈</div>
      <div class="agent-info"><div class="agent-name">Risk Detector</div><div class="agent-proj">API Platform</div></div>
      <div class="status-dot" style="background:#C9542A"></div>
    </div>
    <div class="agent-row">
      <div class="agent-icon" style="color:#D4723A">◈</div>
      <div class="agent-info"><div class="agent-name">PR Summariser</div><div class="agent-proj">Core Engine</div></div>
      <div class="status-dot" style="background:#D4723A"></div>
    </div>
  </div>

  <!-- Projects -->
  <div class="screen-frame">
    <div class="screen-label">PROJECTS</div>
    <div style="display:flex;gap:6px;margin-bottom:14px">
      <span style="background:#5468D4;color:#fff;padding:4px 10px;border-radius:5px;font-size:9px;font-weight:600">All</span>
      <span style="background:var(--surf2);color:var(--text2);padding:4px 10px;border-radius:5px;font-size:9px">Active</span>
      <span style="background:var(--surf2);color:var(--text2);padding:4px 10px;border-radius:5px;font-size:9px">At Risk</span>
    </div>
    ${[
      {name:'Atlas UI Redesign',pct:67,color:'#3DB88C',status:'On Track'},
      {name:'API Platform v2',  pct:42,color:'#C9542A',status:'At Risk'},
      {name:'Mobile App',       pct:81,color:'#3DB88C',status:'On Track'},
      {name:'Core Engine',      pct:28,color:'#D4723A',status:'Delayed'},
    ].map(p=>`
    <div style="background:var(--surf2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:10px;font-weight:600">${p.name}</span>
        <span style="font-size:9px;color:${p.color}">${p.status}</span>
      </div>
      <div style="background:var(--surf3);border-radius:3px;height:4px;margin-top:6px">
        <div style="background:${p.color};width:${p.pct}%;height:4px;border-radius:3px"></div>
      </div>
      <div style="font-size:9px;color:var(--text3);margin-top:4px">${p.pct}% complete</div>
    </div>`).join('')}
  </div>

  <!-- Signals -->
  <div class="screen-frame">
    <div class="screen-label">SIGNALS</div>
    <div class="signal-card" style="background:#1A0C0A;border-color:#C9542A44">
      <span class="signal-sev" style="background:#C9542A22;color:#C9542A">CRITICAL</span>
      <div class="signal-title">Dependency delay detected</div>
      <div class="signal-body">API Platform v2 blocked by auth-service. Est. 3-day impact.</div>
    </div>
    <div class="signal-card">
      <span class="signal-sev" style="background:#D4723A22;color:#D4723A">WARNING</span>
      <div class="signal-title">Scope creep flagged</div>
      <div class="signal-body">2 features added without story point allocation.</div>
    </div>
    <div class="signal-card">
      <span class="signal-sev" style="background:#5468D422;color:#5468D4">INFO</span>
      <div class="signal-title">Velocity above baseline</div>
      <div class="signal-body">Mobile App team at 108% of 4-sprint baseline.</div>
    </div>
  </div>

  <!-- Timeline -->
  <div class="screen-frame">
    <div class="screen-label">TIMELINE</div>
    <div style="margin-bottom:14px">
      ${['Atlas UI','API Platform','Mobile App','Core Engine','Data Pipeline'].map((name,i)=>{
        const colors=['#5468D4','#C9542A','#3DB88C','#D4723A','#5468D4'];
        const starts=[0,0,20,40,10];
        const widths=[55,85,75,60,62];
        return `<div style="margin-bottom:10px">
          <div style="font-size:9px;color:var(--text3);margin-bottom:3px">${name}</div>
          <div style="background:var(--surf2);height:16px;border-radius:4px;position:relative">
            <div style="position:absolute;left:${starts[i]}%;width:${widths[i]}%;height:100%;background:${colors[i]}66;border-radius:4px;border-left:3px solid ${colors[i]}"></div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="font-size:10px;font-weight:600;color:var(--text);margin-bottom:8px">Upcoming</div>
    ${[
      {label:'Design review',due:'Tomorrow',color:'#5468D4'},
      {label:'Auth unblock',  due:'Apr 8',  color:'#C9542A'},
    ].map(u=>`<div style="background:var(--surf2);border-left:3px solid ${u.color};border-radius:0 6px 6px 0;padding:8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:10px">${u.label}</span>
      <span style="font-size:9px;color:${u.color}">${u.due}</span>
    </div>`).join('')}
  </div>

</div>

<!-- Features -->
<div class="section-label">WHY SPIRE</div>
<div class="features">
  <div class="feature">
    <div class="feature-icon">◈</div>
    <h3>Autonomous AI Agents</h3>
    <p>Deploy specialist agents that continuously monitor your projects — scope drift, velocity drops, PR backlogs — without manual check-ins.</p>
  </div>
  <div class="feature">
    <div class="feature-icon">◉</div>
    <h3>Intelligent Signal Feed</h3>
    <p>Severity-ranked alerts surface only what matters. CRITICAL, WARNING, and INFO signals with full context, not just noise.</p>
  </div>
  <div class="feature">
    <div class="feature-icon">⊙</div>
    <h3>Gantt + Sprint View</h3>
    <p>Timeline and sprint pulse side-by-side. See how your sprints connect to quarterly delivery, with AI milestone predictions.</p>
  </div>
</div>

<!-- Agent showcase -->
<div class="section-label">THE AGENT ROSTER</div>
<div class="agents-grid">
  ${[
    {name:'Scope Tracker', desc:'Monitors feature additions against committed sprint scope.', status:'Monitoring', color:'#3DB88C'},
    {name:'Risk Detector', desc:'Cross-references velocity and dependency graph for blockers.', status:'Alerting', color:'#C9542A'},
    {name:'Velocity Coach',desc:'Tracks team output against 4-sprint rolling historical baseline.', status:'Running', color:'#5468D4'},
    {name:'PR Summariser', desc:'Distils merged pull requests into digestible weekly briefings.', status:'Running', color:'#D4723A'},
  ].map(a=>`
  <div class="agent-card" style="--agent-color:${a.color}">
    <div style="font-size:20px;margin-bottom:12px;color:${a.color}">◈</div>
    <h4>${a.name}</h4>
    <p>${a.desc}</p>
    <span class="agent-status-tag" style="background:${a.color}22;color:${a.color}">${a.status}</span>
  </div>`).join('')}
</div>

<!-- Stats -->
<div class="stats">
  <div class="stat">
    <div class="stat-val">84%</div>
    <div class="stat-label">Average on-track rate<br>across SPIRE teams</div>
  </div>
  <div class="stat">
    <div class="stat-val">3×</div>
    <div class="stat-label">Faster risk detection<br>vs manual standups</div>
  </div>
  <div class="stat">
    <div class="stat-val">12</div>
    <div class="stat-label">Specialist AI agents<br>ready to deploy</div>
  </div>
</div>

<!-- Palette -->
<div class="section-label">COLOUR PALETTE</div>
<div class="palette-row">
  <div class="swatch" style="background:#0C0B0A;border:1px solid rgba(255,255,255,0.1)">Base</div>
  <div class="swatch" style="background:#181614">Surface</div>
  <div class="swatch" style="background:#5468D4">Indigo</div>
  <div class="swatch" style="background:#D4723A">Terracotta</div>
  <div class="swatch" style="background:#3DB88C">Teal</div>
  <div class="swatch" style="background:#C9542A">Alert</div>
  <div class="swatch" style="background:#EDE9E2;color:#1a1816">Warm White</div>
</div>

<!-- CTA -->
<div class="cta-block">
  <h2>Ship projects with clarity.</h2>
  <p>Deploy your first AI agent in under 5 minutes. No credit card required.</p>
  <a href="${SLUG}-viewer" class="btn-primary" style="display:inline-block">View the prototype →</a>
</div>

<footer>
  <div class="footer-logo">SPIRE</div>
  <div>AI Project Intelligence · Design by RAM · ram.zenbin.org</div>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname,'spire.pen'),'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

let viewerBase = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Prototype Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0C0B0A;color:#EDE9E2;font-family:'Inter',sans-serif;min-height:100vh}
header{display:flex;align-items:center;justify-content:space-between;
       padding:16px 24px;border-bottom:1px solid rgba(237,233,226,0.08)}
.v-logo{font-size:13px;font-weight:700;letter-spacing:3px;color:#5468D4}
.v-back{font-size:13px;color:rgba(237,233,226,0.5);text-decoration:none}
.v-back:hover{color:#EDE9E2}
main{display:flex;flex-direction:column;align-items:center;padding:48px 24px 80px}
h2{font-size:28px;font-weight:700;margin-bottom:8px;letter-spacing:-0.5px}
p.sub{color:rgba(237,233,226,0.5);font-size:14px;margin-bottom:40px}
#pen-viewer{width:390px;height:844px;border:1px solid rgba(237,233,226,0.10);
            border-radius:40px;overflow:hidden;background:#181614;
            box-shadow:0 40px 120px rgba(0,0,0,0.8)}
.screen-tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;justify-content:center}
.screen-tab{padding:8px 16px;border-radius:20px;font-size:12px;font-weight:500;
            cursor:pointer;border:1px solid rgba(237,233,226,0.12);
            color:rgba(237,233,226,0.6);background:transparent;
            transition:all .2s;font-family:inherit}
.screen-tab.active,.screen-tab:hover{background:#5468D4;color:#fff;border-color:#5468D4}
canvas{display:block}
</style>
</head>
<body>
<header>
  <div class="v-logo">SPIRE</div>
  <a href="/spire" class="v-back">← Back to overview</a>
</header>
<main>
  <h2>${APP_NAME}</h2>
  <p class="sub">${TAGLINE}</p>
  <div class="screen-tabs" id="tabs"></div>
  <div id="pen-viewer"><canvas id="c" width="390" height="844"></canvas></div>
</main>
<script>
const screens=JSON.parse(window.EMBEDDED_PEN||'{}').screens||[];
let current=0;
const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
const tabs=document.getElementById('tabs');
screens.forEach((s,i)=>{
  const btn=document.createElement('button');
  btn.className='screen-tab'+(i===0?' active':'');
  btn.textContent=s.label;
  btn.onclick=()=>{current=i;[...tabs.children].forEach((b,j)=>b.className='screen-tab'+(j===i?' active':''));render();};
  tabs.appendChild(btn);
});
function hexToRgb(h){
  if(!h||h==='none')return null;
  h=h.trim();
  if(h.startsWith('rgba')){const m=h.match(/[\d.]+/g);return m?{r:+m[0],g:+m[1],b:+m[2],a:+m[3]}:null}
  if(h.startsWith('rgb')){const m=h.match(/[\d.]+/g);return m?{r:+m[0],g:+m[1],b:+m[2],a:1}:null}
  h=h.replace('#','');
  if(h.length===3)h=h.split('').map(c=>c+c).join('');
  const n=parseInt(h,16);
  return{r:(n>>16)&255,g:(n>>8)&255,b:n&255,a:1};
}
function setFill(c,color){
  if(!color||color==='none'){c.fillStyle='transparent';return;}
  const rgb=hexToRgb(color);
  if(rgb)c.fillStyle=\`rgba(\${rgb.r},\${rgb.g},\${rgb.b},\${rgb.a??1})\`;
  else c.fillStyle=color;
}
function setStroke(c,color){
  if(!color){c.strokeStyle='transparent';return;}
  const rgb=hexToRgb(color);
  if(rgb)c.strokeStyle=\`rgba(\${rgb.r},\${rgb.g},\${rgb.b},\${rgb.a??1})\`;
  else c.strokeStyle=color;
}
function render(){
  const s=screens[current];
  if(!s)return;
  ctx.clearRect(0,0,390,844);
  s.elements.forEach(el=>{
    ctx.save();
    ctx.globalAlpha=el.opacity??1;
    if(el.type==='rect'){
      const r=el.radius||0;
      ctx.beginPath();
      if(r>0){
        ctx.moveTo(el.x+r,el.y);
        ctx.lineTo(el.x+el.width-r,el.y);
        ctx.arcTo(el.x+el.width,el.y,el.x+el.width,el.y+r,r);
        ctx.lineTo(el.x+el.width,el.y+el.height-r);
        ctx.arcTo(el.x+el.width,el.y+el.height,el.x+el.width-r,el.y+el.height,r);
        ctx.lineTo(el.x+r,el.y+el.height);
        ctx.arcTo(el.x,el.y+el.height,el.x,el.y+el.height-r,r);
        ctx.lineTo(el.x,el.y+r);
        ctx.arcTo(el.x,el.y,el.x+r,el.y,r);
        ctx.closePath();
      } else {
        ctx.rect(el.x,el.y,el.width,el.height);
      }
      if(el.fill&&el.fill!=='none'){setFill(ctx,el.fill);ctx.fill();}
      if(el.stroke){ctx.lineWidth=el.strokeWidth||1;setStroke(ctx,el.stroke);ctx.stroke();}
    } else if(el.type==='ellipse'){
      ctx.beginPath();
      ctx.ellipse(el.x+el.width/2,el.y+el.height/2,el.width/2,el.height/2,0,0,Math.PI*2);
      if(el.fill&&el.fill!=='none'){setFill(ctx,el.fill);ctx.fill();}
      if(el.stroke){ctx.lineWidth=el.strokeWidth||1;setStroke(ctx,el.stroke);ctx.stroke();}
    } else if(el.type==='text'){
      const size=el.fontSize||12;
      const weight=el.fontWeight||'normal';
      ctx.font=\`\${weight} \${size}px \${el.fontFamily||'Inter'},sans-serif\`;
      setFill(ctx,el.fill);
      ctx.textAlign=el.align||'left';
      ctx.textBaseline='top';
      if(el.letterSpacing&&el.letterSpacing!==0){
        const chars=[...el.content];
        let cx2=el.x;
        if(el.align==='center'){
          let total=0;chars.forEach(ch=>total+=ctx.measureText(ch).width+el.letterSpacing);
          cx2=el.x-total/2;
        }
        chars.forEach(ch=>{ctx.fillText(ch,cx2,el.y);cx2+=ctx.measureText(ch).width+el.letterSpacing;});
      } else {
        ctx.fillText(el.content,el.x,el.y);
      }
    }
    ctx.restore();
  });
}
render();
<\/script>
</body>
</html>`;

viewerBase = viewerBase.replace('<script>', injection + '\n<script>');

(async()=>{
  console.log('Publishing SPIRE hero page...');
  const r1=await publish(SLUG,heroHtml,`${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2=await publish(`${SLUG}-viewer`,viewerBase,`${APP_NAME} — Prototype Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
})();
