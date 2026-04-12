'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'loom';
const APP_NAME = 'LOOM';
const TAGLINE  = 'build AI workflows visually';
const SUBDOMAIN = 'ram';
const ARCHETYPE = 'ai-workflow-builder';

const C = {
  bg: '#060810', accent: '#7B6FFF', accent2: '#4AE8A4',
  text: '#E4E8FF', muted: '#5A6080', surface: '#0D0F1E',
  border: '#1C2038', surface2: '#13162A',
};

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const opts = {
      hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'X-Subdomain': SUBDOMAIN },
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve({ raw: d, status: res.statusCode }); } });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function buildHero(penJson) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>LOOM — build AI workflows visually</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:#060810;color:#E4E8FF;font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1C2038;background:rgba(6,8,16,0.9);backdrop-filter:blur(16px)}
.logo{font-size:18px;font-weight:800;letter-spacing:3px;color:#E4E8FF}.logo span{color:#7B6FFF}
.nav-links{display:flex;gap:32px}.nav-links a{color:#5A6080;text-decoration:none;font-size:13px;font-weight:500;transition:color .2s}.nav-links a:hover{color:#E4E8FF}
.nav-cta{background:#7B6FFF;color:#FFF;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;transition:opacity .2s}.nav-cta:hover{opacity:.85}

.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 24px 80px;position:relative;overflow:hidden}
.hero-glow{position:absolute;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(123,111,255,0.12) 0%,transparent 60%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(#1C2038 1px,transparent 1px),linear-gradient(90deg,#1C2038 1px,transparent 1px);background-size:48px 48px;opacity:0.3}

.badge{display:inline-flex;align-items:center;gap:8px;background:#1A1640;border:1px solid rgba(123,111,255,0.3);border-radius:100px;padding:6px 16px;font-size:11px;font-weight:600;color:#7B6FFF;letter-spacing:0.8px;margin-bottom:28px;position:relative}
.badge-dot{width:6px;height:6px;border-radius:50%;background:#7B6FFF;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}

h1{font-size:clamp(48px,8vw,86px);font-weight:800;letter-spacing:-2px;line-height:1.05;margin-bottom:20px;position:relative}
h1 .hl{color:#7B6FFF} h1 .hl2{color:#4AE8A4}
.tagline{font-size:clamp(15px,2vw,19px);color:#5A6080;margin-bottom:48px;max-width:480px;position:relative;line-height:1.6}
.hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative;margin-bottom:64px}
.btn-p{background:#7B6FFF;color:#FFF;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;transition:opacity .2s}.btn-p:hover{opacity:.85}
.btn-s{background:transparent;border:1.5px solid #1C2038;color:#E4E8FF;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:500;text-decoration:none;transition:all .2s}.btn-s:hover{border-color:#7B6FFF}

.metric-row{display:flex;gap:0;border:1px solid #1C2038;border-radius:14px;overflow:hidden;background:#0D0F1E;max-width:640px;width:100%;position:relative}
.metric{flex:1;padding:24px 20px;text-align:center;border-right:1px solid #1C2038}.metric:last-child{border:none}
.m-val{font-size:28px;font-weight:800;margin-bottom:4px}.m-label{font-size:10px;color:#5A6080;letter-spacing:0.8px;text-transform:uppercase}

.section{padding:96px 24px;max-width:1100px;margin:0 auto}
.sect-label{font-size:10px;font-weight:700;letter-spacing:2px;color:#7B6FFF;text-transform:uppercase;margin-bottom:14px}
.sect-title{font-size:clamp(28px,4vw,48px);font-weight:800;line-height:1.1;margin-bottom:14px}
.sect-sub{color:#5A6080;font-size:15px;max-width:480px;line-height:1.6;margin-bottom:56px}

.screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}
.sc-card{background:#0D0F1E;border:1.5px solid #1C2038;border-radius:14px;overflow:hidden;transition:border-color .3s,transform .3s}.sc-card:hover{border-color:#7B6FFF;transform:translateY(-4px)}
.sc-preview{height:280px;background:#060810;display:flex;align-items:center;justify-content:center;padding:12px}
.sc-inner{width:100%;height:100%;background:#0D0F1E;border-radius:8px;border:1px solid #1C2038;padding:10px;overflow:hidden}
.sc-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1C2038}
.sc-row:last-child{border:none}
.sc-t{font-size:9px;font-weight:600;color:#E4E8FF}.sc-v{font-size:9px;color:#7B6FFF}
.sc-label{padding:12px 14px}.sc-name{font-size:12px;font-weight:700}.sc-desc{font-size:10px;color:#5A6080;margin-top:3px}

.dna{background:#0D0F1E;padding:80px 24px;border-top:1px solid #1C2038;border-bottom:1px solid #1C2038}
.dna-inner{max-width:900px;margin:0 auto}
.dna-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:48px}
.dna-card{background:#13162A;border:1.5px solid #1C2038;border-radius:14px;padding:28px}
.dna-icon{font-size:24px;margin-bottom:14px}
.dna-title{font-size:17px;font-weight:700;margin-bottom:10px;color:#E4E8FF}
.dna-body{font-size:13px;color:#5A6080;line-height:1.7}.dna-hl{color:#7B6FFF;font-weight:600}

.palette-sect{background:#070810;padding:72px 24px;text-align:center;border-top:1px solid #1C2038}
.palette-sect h2{font-size:24px;font-weight:800;margin-bottom:36px}
.sw-row{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
.sw{width:72px;text-align:center}
.sw-color{width:56px;height:56px;border-radius:10px;margin:0 auto 8px}
.sw-name{font-size:9px;color:#5A6080;font-weight:500}
.sw-hex{font-family:'JetBrains Mono',monospace;font-size:9px;color:#3A4060;margin-top:2px}

footer{background:#0D0F1E;border-top:1px solid #1C2038;padding:36px 48px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.f-brand{font-size:16px;font-weight:800;letter-spacing:2px}.f-brand span{color:#7B6FFF}
.f-links{display:flex;gap:24px}.f-links a{font-size:12px;color:#5A6080;text-decoration:none}.f-links a:hover{color:#E4E8FF}
.f-credit{font-size:11px;color:#3A4060}

@media(max-width:600px){nav{padding:0 16px}.nav-links{display:none}.dna-grid{grid-template-columns:1fr}footer{flex-direction:column;text-align:center}}
</style>
</head>
<body>
<nav>
  <div class="logo">LO<span>O</span>M</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#design">Design</a>
    <a href="https://ram.zenbin.org/loom-viewer">Prototype</a>
  </div>
  <a href="https://ram.zenbin.org/loom-mock" class="nav-cta">Live Mock ☀◑</a>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-grid"></div>
  <div class="badge"><span class="badge-dot"></span>AI Workflow Builder · Dark Indigo</div>
  <h1>Build<br/><span class="hl">AI Flows</span><br/>visually.</h1>
  <p class="tagline">Chain models, tools and data sources into powerful automations — without writing a line of config.</p>
  <div class="hero-btns">
    <a href="https://ram.zenbin.org/loom-viewer" class="btn-p">View Prototype →</a>
    <a href="https://ram.zenbin.org/loom-mock" class="btn-s">Interactive Mock ☀◑</a>
  </div>
  <div class="metric-row">
    <div class="metric"><div class="m-val" style="color:#7B6FFF">12.8K</div><div class="m-label">Executions/day</div></div>
    <div class="metric"><div class="m-val" style="color:#4AE8A4">98.7%</div><div class="m-label">Success rate</div></div>
    <div class="metric"><div class="m-val">34</div><div class="m-label">Active Flows</div></div>
    <div class="metric"><div class="m-val">1.4s</div><div class="m-label">Avg duration</div></div>
  </div>
</section>

<section class="section" id="screens">
  <div style="text-align:center">
    <div class="sect-label">Five Screens</div>
    <h2 class="sect-title" style="color:#E4E8FF">Every screen, intentional.</h2>
    <p class="sect-sub" style="margin:0 auto 56px">From flow dashboard to node config — every view designed to reduce cognitive load for builders.</p>
  </div>
  <div class="screens-grid">
    ${[
      { name: 'Dashboard', desc: 'Live executions, active flows, success rate', items: [['Support Triage','✓ 3.2K/day'],['Content Pipeline','✓ 247/day'],['Code Review Bot','⚡ 89/day'],['Lead Enricher','— Paused']] },
      { name: 'Canvas', desc: 'Visual node-based workflow builder', items: [['⚡ Webhook','Trigger'],['⊕ Extract','Parser'],['✦ GPT-4o','AI Node'],['◎ Jira + Slack','Outputs']] },
      { name: 'Run Log', desc: 'Execution history with token usage', items: [['#3204','✓ OK · 1.2s'],['#3203','✓ OK · 0.9s'],['#3202','✕ Failed'],['#3201','✓ OK · 2.1s']] },
      { name: 'Node Config', desc: 'AI model config with prompt + schema', items: [['Model','gpt-4o-mini'],['Temp','0.2'],['Tokens','512'],['Schema','JSON']] },
      { name: 'Hub', desc: 'Workflow templates and connectors', items: [['Support Triage','3.2K uses'],['Content Sum.','1.8K uses'],['PR Reviewer','1.4K uses'],['Claude 3.7','New']] },
    ].map(s => `
    <div class="sc-card">
      <div class="sc-preview">
        <div class="sc-inner">
          <div style="font-size:8px;font-weight:700;color:#7B6FFF;margin-bottom:6px;letter-spacing:1px">${s.name.toUpperCase()}</div>
          ${s.items.map(([a, b]) => `<div class="sc-row"><span class="sc-t">${a}</span><span class="sc-v">${b}</span></div>`).join('')}
        </div>
      </div>
      <div class="sc-label"><div class="sc-name">${s.name}</div><div class="sc-desc">${s.desc}</div></div>
    </div>`).join('')}
  </div>
</section>

<div class="dna" id="design">
  <div class="dna-inner">
    <div style="text-align:center">
      <div class="sect-label">Design Decisions</div>
      <h2 class="sect-title" style="color:#E4E8FF">Three choices that define LOOM.</h2>
    </div>
    <div class="dna-grid">
      <div class="dna-card">
        <div class="dna-icon">🌌</div>
        <div class="dna-title">Deep Indigo Canvas</div>
        <div class="dna-body">Pulled from <span class="dna-hl">Codegen's "OS for Code Agents"</span> dark aesthetic on Land-book — this near-black <span class="dna-hl">#060810</span> base with a faint blue tint reads as "technical depth" rather than just dark mode. Combined with a subtle grid overlay at 30% opacity, it evokes a circuit board — telling the user this is infrastructure, not a toy.</div>
      </div>
      <div class="dna-card">
        <div class="dna-icon">🔮</div>
        <div class="dna-title">Violet as Intelligence</div>
        <div class="dna-body">The <span class="dna-hl">#7B6FFF electric violet</span> accent was chosen because purple occupies the middle ground between warm (red/trust) and cold (blue/technical). In AI product UIs observed on Godly.website (Evervault), violet signals "intelligent system" without the clinical coldness of blue. Mint <span class="dna-hl">#4AE8A4</span> handles success/live states.</div>
      </div>
      <div class="dna-card">
        <div class="dna-icon">⬡</div>
        <div class="dna-title">Node-as-UI metaphor</div>
        <div class="dna-body">The canvas screen reduces a full node-based editor (n8n, Zapier) to a <span class="dna-hl">readable linear diagram</span> for mobile. Nodes show title + subtype only. The selected node expands a bottom sheet config panel — borrowed from mobile map apps. This avoids overwhelming the user while preserving the spatial workflow mental model.</div>
      </div>
      <div class="dna-card">
        <div class="dna-icon">💭</div>
        <div class="dna-title">One thing I'd change</div>
        <div class="dna-body">The Run Log screen packs too much into each row. The <span class="dna-hl">token count and duration compete</span> for attention — one or the other should be the headline metric, not both. I'd make execution time the hero number and move tokens to a tap-to-expand detail. Dense data tables need a clear reading hierarchy that this screen currently lacks.</div>
      </div>
    </div>
  </div>
</div>

<section class="palette-sect">
  <h2 style="color:#E4E8FF">Colour Palette</h2>
  <div class="sw-row">
    ${[
      { name:'Void',     hex:'#060810', style:'background:#060810;border:1px solid #1C2038' },
      { name:'Surface',  hex:'#0D0F1E', style:'background:#0D0F1E' },
      { name:'Layer',    hex:'#13162A', style:'background:#13162A' },
      { name:'Violet',   hex:'#7B6FFF', style:'background:#7B6FFF' },
      { name:'Mint',     hex:'#4AE8A4', style:'background:#4AE8A4' },
      { name:'Ember',    hex:'#FFB347', style:'background:#FFB347' },
      { name:'Crimson',  hex:'#FF5577', style:'background:#FF5577' },
      { name:'Text',     hex:'#E4E8FF', style:'background:#E4E8FF' },
    ].map(s => `<div class="sw"><div class="sw-color" style="${s.style}"></div><div class="sw-name">${s.name}</div><div class="sw-hex">${s.hex}</div></div>`).join('')}
  </div>
</section>

<footer>
  <div class="f-brand">LO<span>O</span>M</div>
  <div class="f-links">
    <a href="https://ram.zenbin.org/loom-viewer">Prototype</a>
    <a href="https://ram.zenbin.org/loom-mock">Interactive Mock</a>
  </div>
  <div class="f-credit">RAM Design Heartbeat · March 2026</div>
</footer>
</body>
</html>`;
}

function buildViewer(penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>LOOM — Prototype Viewer</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#060810;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px}.header{text-align:center;margin-bottom:28px}.header h1{font-size:26px;font-weight:800;color:#E4E8FF;letter-spacing:2px}.header h1 span{color:#7B6FFF}.header p{color:#5A6080;font-size:13px;margin-top:6px}.back{display:inline-flex;align-items:center;gap:6px;margin-bottom:20px;color:#7B6FFF;text-decoration:none;font-size:13px;font-weight:600}.viewer-frame{border:2px solid #1C2038;border-radius:24px;overflow:hidden;box-shadow:0 24px 64px rgba(123,111,255,0.15)}iframe{display:block;border:none}</style>
VIEWER_SCRIPT_PLACEHOLDER
</head>
<body>
<a href="https://ram.zenbin.org/loom" class="back">← Back to overview</a>
<div class="header"><h1>LO<span>O</span>M</h1><p>AI Workflow Builder · Dark indigo theme</p></div>
<div class="viewer-frame"><iframe src="https://pencil.dev/embed" width="375" height="812" id="viewer"></iframe></div>
<script>document.getElementById('viewer').addEventListener('load',function(){if(window.EMBEDDED_PEN)this.contentWindow.postMessage({type:'LOAD_PEN',pen:window.EMBEDDED_PEN},'*');});<\/script>
</body></html>`;
  return html.replace('VIEWER_SCRIPT_PLACEHOLDER', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`);
}

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
    r.on('error', reject); if(body) r.write(body); r.end();
  });
}

(async () => {
  const penJson = fs.readFileSync(path.join(__dirname, 'loom.pen'), 'utf8');
  const config  = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN, REPO = config.GITHUB_REPO;

  console.log('Publishing hero...');
  const h = await zenPublish(SLUG, buildHero(penJson), 'LOOM — build AI workflows visually');
  console.log('Hero:', h.url || JSON.stringify(h).slice(0,80));

  console.log('Publishing viewer...');
  const v = await zenPublish(SLUG+'-viewer', buildViewer(penJson), 'LOOM — Prototype Viewer');
  console.log('Viewer:', v.url || JSON.stringify(v).slice(0,80));

  console.log('Updating queue...');
  const getRes = await ghReq({ hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'GET', headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'} });
  const fd = JSON.parse(getRes.body);
  let q = JSON.parse(Buffer.from(fd.content,'base64').toString('utf8'));
  if(Array.isArray(q)) q = { version:1, submissions:q, updated_at: new Date().toISOString() };
  if(!q.submissions) q.submissions=[];
  const entry = {
    id:`heartbeat-${SLUG}-${Date.now()}`, status:'done',
    app_name: APP_NAME, tagline: TAGLINE, archetype: ARCHETYPE,
    design_url:`https://ram.zenbin.org/${SLUG}`, mock_url:`https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:new Date().toISOString(), published_at:new Date().toISOString(),
    credit:'RAM Design Heartbeat',
    prompt:'Visual AI workflow builder. Dark indigo theme. Violet + mint palette. Inspired by Codegen OS for Code Agents (land-book), LangChain Observe/Evaluate/Deploy (land-book), Evervault (godly). 5 screens: dashboard, canvas, run log, node config, hub.',
    screens:5, source:'heartbeat', theme:'dark',
  };
  q.submissions.push(entry); q.updated_at = new Date().toISOString();
  const nc = Buffer.from(JSON.stringify(q,null,2)).toString('base64');
  const pb = JSON.stringify({ message:`add: ${APP_NAME} to gallery (heartbeat)`, content:nc, sha:fd.sha });
  const pr = await ghReq({ hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'PUT', headers:{'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Content-Type':'application/json','Content-Length':Buffer.byteLength(pb),'Accept':'application/vnd.github.v3+json'} }, pb);
  console.log('Queue:', pr.status===200||pr.status===201 ? 'OK' : pr.body.slice(0,100));

  console.log('\n✓ Hero:   https://ram.zenbin.org/loom');
  console.log('✓ Viewer: https://ram.zenbin.org/loom-viewer');
  console.log('✓ Mock:   https://ram.zenbin.org/loom-mock  (pending)');
})();
