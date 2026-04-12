// rune-publish.js — hero + viewer + gallery queue for RUNE
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'rune';
const APP_NAME  = 'Rune';
const TAGLINE   = 'Zero-config secret management for teams';
const ARCHETYPE = 'developer-security';
const SUBDOMAIN = 'ram';

const P = {
  bg:         '#06080F',
  surface:    '#0B1019',
  surface2:   '#101822',
  surface3:   '#162030',
  border:     '#1C2D3E',
  text:       '#E1E7F0',
  textSub:    '#4D6B80',
  textDim:    '#2D4A5E',
  accent:     '#34D399',
  accentDim:  '#0A2018',
  indigo:     '#818CF8',
  amber:      '#FBBF24',
  red:        '#F87171',
};

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'rune.pen'), 'utf8');
const penData = JSON.parse(penJson);
const screens = penData.screens || [];

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

function publish(slug, html, title) {
  const body = JSON.stringify({ html, title, overwrite: true });
  return req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    SUBDOMAIN,
    },
  }, body);
}

// ── Hero HTML ─────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<meta name="description" content="Developer secret management platform. Manage API keys and environment variables with zero-config, paranoid-level security.">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: ${P.bg}; --surface: ${P.surface}; --surface2: ${P.surface2};
  --surface3: ${P.surface3}; --border: ${P.border};
  --text: ${P.text}; --sub: ${P.textSub}; --dim: ${P.textDim};
  --accent: ${P.accent}; --accent-dim: ${P.accentDim};
  --indigo: ${P.indigo}; --amber: ${P.amber}; --red: ${P.red};
}
body { background: var(--bg); color: var(--text);
  font-family: -apple-system,'Inter',system-ui,sans-serif;
  min-height: 100vh; overflow-x: hidden; }
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(6,8,15,0.9); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; height: 56px;
}
.nav-logo { display:flex; align-items:center; gap:10px; font-size:16px; font-weight:700; letter-spacing:3.5px; color:var(--text); text-decoration:none; }
.nav-icon { width:30px; height:30px; background:var(--accent-dim); border:1px solid rgba(52,211,153,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; color:var(--accent); }
.nav-links { display:flex; gap:28px; }
.nav-links a { color:var(--sub); text-decoration:none; font-size:14px; transition:color .2s; }
.nav-links a:hover { color:var(--text); }
.btn-primary { background:var(--accent); color:#06080F; padding:9px 22px; border-radius:9px; font-size:13px; font-weight:700; text-decoration:none; transition:opacity .2s; letter-spacing:.3px; }
.btn-primary:hover { opacity:.88; }
.hero { padding:130px 32px 72px; text-align:center; position:relative; overflow:hidden; }
.hero::before { content:''; position:absolute; top:0; left:50%; transform:translateX(-50%); width:900px; height:700px; background:radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.10) 0%, transparent 65%); pointer-events:none; }
.badge { display:inline-flex; align-items:center; gap:8px; background:var(--accent-dim); border:1px solid rgba(52,211,153,.3); border-radius:100px; padding:6px 18px; font-size:11px; font-weight:700; color:var(--accent); letter-spacing:1.8px; margin-bottom:28px; }
.badge-dot { width:7px; height:7px; border-radius:50%; background:var(--accent); animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
h1 { font-size:clamp(40px,6.5vw,72px); font-weight:800; line-height:1.05; letter-spacing:-2.5px; margin-bottom:24px; }
h1 em { font-style:normal; background:linear-gradient(135deg,var(--accent),var(--indigo)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.hero-sub { font-size:18px; color:var(--sub); max-width:540px; margin:0 auto 48px; line-height:1.7; }
.hero-ctas { display:flex; gap:14px; justify-content:center; margin-bottom:72px; flex-wrap:wrap; }
.btn-outline { border:1px solid var(--border); color:var(--sub); padding:12px 28px; border-radius:9px; font-size:14px; font-weight:500; text-decoration:none; background:var(--surface); transition:border-color .2s,color .2s; }
.btn-outline:hover { border-color:var(--accent); color:var(--accent); }
.btn-hero { background:var(--accent); color:#06080F; padding:13px 32px; border-radius:9px; font-size:15px; font-weight:700; text-decoration:none; transition:opacity .2s,transform .15s; }
.btn-hero:hover { opacity:.9; transform:translateY(-1px); }
/* Screen previews */
.screens-row { display:flex; gap:12px; overflow-x:auto; max-width:1100px; margin:0 auto 72px; padding:0 24px; scrollbar-width:thin; scrollbar-color:var(--border) transparent; }
.screen-card { flex:0 0 200px; background:var(--surface2); border:1px solid var(--border); border-radius:14px; overflow:hidden; transition:transform .25s,border-color .25s; cursor:pointer; }
.screen-card:hover { transform:translateY(-4px); border-color:var(--accent); }
.screen-label { padding:8px 12px; font-size:10px; font-weight:700; letter-spacing:1.8px; color:var(--sub); border-bottom:1px solid var(--border); background:var(--surface); text-transform:uppercase; }
.sp { height:360px; padding:10px; display:flex; flex-direction:column; gap:5px; overflow:hidden; }
.sr { height:9px; border-radius:3px; background:var(--surface3); }
.sr.a { background:linear-gradient(90deg,var(--accent),rgba(52,211,153,.25)); }
.sr.i { background:linear-gradient(90deg,var(--indigo),rgba(129,140,248,.25)); }
.sr.am { background:linear-gradient(90deg,var(--amber),rgba(251,191,36,.25)); }
.sr.sm { width:55%; } .sr.md { width:78%; } .sr.lg { width:100%; }
.sc { background:var(--surface3); border:1px solid var(--border); border-radius:7px; padding:7px; margin-top:3px; }
.sc .sr { margin-top:4px; }
/* Features */
.section { max-width:1100px; margin:0 auto 80px; padding:0 32px; }
.section h2 { text-align:center; font-size:clamp(28px,4vw,40px); font-weight:800; letter-spacing:-1.2px; margin-bottom:48px; }
.section h2 em { font-style:normal; color:var(--accent); }
.feat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; }
.feat { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:26px; transition:border-color .2s,transform .2s; }
.feat:hover { border-color:var(--accent); transform:translateY(-2px); }
.feat-ic { width:38px; height:38px; border-radius:9px; background:var(--accent-dim); display:flex; align-items:center; justify-content:center; font-size:17px; margin-bottom:14px; }
.feat h3 { font-size:15px; font-weight:700; margin-bottom:7px; }
.feat p { font-size:13px; color:var(--sub); line-height:1.65; }
/* Stats */
.stats { display:flex; justify-content:center; gap:60px; flex-wrap:wrap; padding:44px 32px; background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border); margin-bottom:80px; }
.stat { text-align:center; }
.stat-v { font-size:42px; font-weight:800; color:var(--accent); font-family:'Roboto Mono',monospace; line-height:1; }
.stat-l { font-size:12px; color:var(--sub); margin-top:6px; letter-spacing:.8px; }
/* CTA */
.cta { max-width:600px; margin:0 auto 80px; padding:0 32px; text-align:center; }
.cta h2 { font-size:clamp(28px,4vw,38px); font-weight:800; letter-spacing:-1px; margin-bottom:16px; }
.cta p { font-size:16px; color:var(--sub); line-height:1.7; margin-bottom:32px; }
footer { border-top:1px solid var(--border); padding:28px 32px; text-align:center; color:var(--dim); font-size:12px; }
footer a { color:var(--accent); text-decoration:none; }
</style>
</head>
<body>
<nav>
  <a class="nav-logo" href="#">
    <span class="nav-icon">⬡</span>
    RUNE
  </a>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Docs</a>
    <a href="#">Pricing</a>
    <a href="#">Security</a>
  </div>
  <a href="${SLUG}-mock" class="btn-primary">Try Demo →</a>
</nav>

<div class="hero">
  <div class="badge"><span class="badge-dot"></span> DEVELOPER SECURITY</div>
  <h1>Secrets that stay <em>secret</em></h1>
  <p class="hero-sub">One place to manage every API key, database credential, and environment variable — across every team, app, and environment. No config files. No leaks.</p>
  <div class="hero-ctas">
    <a href="${SLUG}-mock" class="btn-hero">Try Interactive Mock →</a>
    <a href="${SLUG}-viewer" class="btn-outline">View Screens ☀◑</a>
  </div>
</div>

<div class="screens-row">
  ${screens.map((s,i) => {
    const labels = ['Overview','Environments','Secrets','Access Log','Integrations'];
    const pv = [
      ['a sm','','md','sm','','a md','sc','sc'],
      ['i sm','md','','sc','sm a','','md'],
      ['a sm','','md','sc','am sm','','sc','md'],
      ['sm','md am','','a sm','sc','md','sm'],
      ['i md','sm','','sc','a sm','sm',''],
    ][i]||['sm','md','','a sm','md'];
    return `<div class="screen-card">
  <div class="screen-label">${labels[i]||'Screen '+(i+1)}</div>
  <div class="sp">${pv.map(r=>r==='sc'?'<div class="sc"><div class="sr sm"></div><div class="sr md"></div></div>':`<div class="sr ${r}"></div>`).join('')}</div>
</div>`;
  }).join('\n  ')}
</div>

<div class="section">
  <h2>Your stack, <em>secured</em></h2>
  <div class="feat-grid">
    <div class="feat"><div class="feat-ic">⬡</div><h3>Vault Health Score</h3><p>Real-time scoring across all secrets. Spot expiring keys, weak credentials, and stale tokens before they cause outages.</p></div>
    <div class="feat"><div class="feat-ic">◉</div><h3>Environment Isolation</h3><p>Hard walls between production, staging, dev, and test. Secrets never bleed across environments without explicit promotion.</p></div>
    <div class="feat"><div class="feat-ic">≡</div><h3>Immutable Access Log</h3><p>Every read, write, and denied attempt is logged with timestamp, identity, and IP. Your auditors will love you.</p></div>
    <div class="feat"><div class="feat-ic">◈</div><h3>Auto-Rotation</h3><p>Schedule automatic key rotation for Stripe, OpenAI, AWS, and more — and never touch a .env file again.</p></div>
    <div class="feat"><div class="feat-ic">⌘</div><h3>Native Integrations</h3><p>Connect to GitHub Actions, Vercel, Railway, Kubernetes, and AWS Secrets Manager in one click.</p></div>
    <div class="feat"><div class="feat-ic">⚡</div><h3>Anomaly Alerts</h3><p>ML-powered spike detection sends Slack alerts when access patterns deviate from baseline — catch breaches early.</p></div>
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="stat-v">247</div><div class="stat-l">SECRETS MANAGED</div></div>
  <div class="stat"><div class="stat-v">98</div><div class="stat-l">VAULT HEALTH</div></div>
  <div class="stat"><div class="stat-v">1.4K</div><div class="stat-l">ACCESS EVENTS TODAY</div></div>
  <div class="stat"><div class="stat-v">0</div><div class="stat-l">SECURITY INCIDENTS</div></div>
</div>

<div class="cta">
  <h2>Start in under 60 seconds</h2>
  <p>Drop your first secret, connect your CI/CD pipeline, and sleep better tonight. No infra to manage.</p>
  <a href="${SLUG}-mock" class="btn-hero">Try the interactive demo →</a>
</div>

<footer>
  <p>RUNE — A design concept by <a href="https://ram.zenbin.org">RAM Design Studio</a> · RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB',{month:'long',year:'numeric'})} · Pencil v2.8</p>
  <p style="margin-top:6px;">Inspired by Twingate + Evervault (godly.website) · Midday.ai (darkmodedesign.com)</p>
</footer>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────
const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rune — Prototype Viewer</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${P.bg}; color: ${P.text}; font-family: system-ui, sans-serif; min-height: 100vh; }
.viewer-header {
  position:fixed; top:0; left:0; right:0; z-index:100;
  background: rgba(6,8,15,0.92); backdrop-filter:blur(16px);
  border-bottom: 1px solid ${P.border};
  height:56px; display:flex; align-items:center; justify-content:space-between; padding:0 24px;
}
.viewer-logo { font-size:.85rem; font-weight:800; letter-spacing:3px; color:${P.accent}; text-decoration:none; }
.screen-nav { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; }
.screen-btn {
  background: ${P.surface2}; border: 1px solid ${P.border}; color:${P.textSub};
  font-size:.7rem; font-weight:600; letter-spacing:.5px; text-transform:uppercase;
  padding:5px 12px; border-radius:100px; cursor:pointer; transition:.15s;
}
.screen-btn:hover, .screen-btn.active { background:${P.accent}; color:#06080F; border-color:${P.accent}; }
.viewer-back { font-size:.75rem; color:${P.textSub}; text-decoration:none; transition:color .2s; }
.viewer-back:hover { color:${P.text}; }
.phone-wrap { display:flex; justify-content:center; align-items:flex-start; padding:80px 24px 48px; min-height:100vh; }
.phone-frame {
  width:390px; height:844px;
  background:${P.bg}; border-radius:48px;
  border:2px solid ${P.border};
  box-shadow:0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.08);
  overflow:hidden; position:relative;
}
.phone-notch { position:absolute; top:12px; left:50%; transform:translateX(-50%); width:110px; height:30px; background:${P.surface3}; border-radius:20px; z-index:10; }
.phone-frame svg { position:absolute; top:0; left:0; width:100%; height:100%; display:block; }
</style>
</head>
<body>
<div class="viewer-header">
  <a class="viewer-logo" href="https://ram.zenbin.org/${SLUG}">RUNE</a>
  <div class="screen-nav" id="screenNav"></div>
  <a class="viewer-back" href="https://ram.zenbin.org/${SLUG}">← Hero</a>
</div>
<div class="phone-wrap">
  <div class="phone-frame" id="phoneFrame">
    <div class="phone-notch"></div>
    <div style="display:flex;align-items:center;justify-content:center;height:100%;color:${P.textSub}">Loading…</div>
  </div>
</div>
<script>
const pen = window.EMBEDDED_PEN || null;
function colorFromFills(fills) {
  if (!fills||!fills.length) return 'transparent';
  const f = fills[0];
  if (!f||!f.color) return 'transparent';
  const {r,g,b} = f.color;
  const a = f.opacity!==undefined?f.opacity:1;
  return \`rgba(\${Math.round(r*255)},\${Math.round(g*255)},\${Math.round(b*255)},\${a})\`;
}
function renderScreen(screen) {
  const W=390,H=844;
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  const parts=[\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${W} \${H}" width="\${W}" height="\${H}">\`];
  function renderNode(node,ox,oy){
    const x=(node.x||0)+ox,y=(node.y||0)+oy;
    const w=node.width||0,h=node.height||0;
    const fill=colorFromFills(node.fills);
    const op=node.opacity!==undefined?node.opacity:1;
    if(node.type==='RECTANGLE'){
      const rx=node.cornerRadius||0;
      let stroke='';
      if(node.strokes&&node.strokes.length){const sc=colorFromFills(node.strokes);stroke=\` stroke="\${esc(sc)}" stroke-width="\${node.strokeWeight||1}"\`;}
      if(op<0.01)return;
      parts.push(\`<rect x="\${x.toFixed(1)}" y="\${y.toFixed(1)}" width="\${Math.max(0,w)}" height="\${Math.max(0,h)}" rx="\${rx}" fill="\${esc(fill)}" opacity="\${op}"\${stroke}/>\`);
    } else if(node.type==='TEXT'){
      const fs=node.fontSize||12;
      const fw=node.fontName?.style?.includes('Bold')?700:node.fontName?.style?.includes('SemiBold')?600:node.fontName?.style?.includes('Medium')?500:400;
      const color=colorFromFills(node.fills);
      const align=node.textAlignHorizontal||'LEFT';
      const anchor=align==='CENTER'?'middle':align==='RIGHT'?'end':'start';
      const xPos=align==='CENTER'?x+(w/2):align==='RIGHT'?x+w:x;
      const ff=node.fontName?.family?.includes('Mono')?'monospace':'system-ui,sans-serif';
      if(op<0.01)return;
      parts.push(\`<text x="\${xPos.toFixed(1)}" y="\${(y+fs).toFixed(1)}" font-size="\${fs}" font-weight="\${fw}" fill="\${esc(color)}" opacity="\${op}" text-anchor="\${anchor}" font-family="\${ff}">\${esc(node.characters||'')}</text>\`);
    } else if(node.type==='FRAME'||node.type==='GROUP'){
      if(node.fills&&node.fills.length&&fill!=='transparent'){
        const rx=node.cornerRadius||0;
        parts.push(\`<rect x="\${x.toFixed(1)}" y="\${y.toFixed(1)}" width="\${Math.max(0,w)}" height="\${Math.max(0,h)}" rx="\${rx}" fill="\${esc(fill)}" opacity="\${op}"/>\`);
      }
      (node.children||[]).forEach(c=>renderNode(c,x,y));
    }
  }
  (screen.children||[]).forEach(c=>renderNode(c,0,0));
  parts.push('<\/svg>');
  return parts.join('');
}
if(pen){
  const data=typeof pen==='string'?JSON.parse(pen):pen;
  const screens=data.screens||[];
  const nav=document.getElementById('screenNav');
  const frame=document.getElementById('phoneFrame');
  function show(idx){
    frame.innerHTML=renderScreen(screens[idx]);
    const n=document.createElement('div');n.className='phone-notch';frame.appendChild(n);
    document.querySelectorAll('.screen-btn').forEach((b,i)=>b.classList.toggle('active',i===idx));
  }
  screens.forEach((s,i)=>{
    const btn=document.createElement('button');
    btn.className='screen-btn'+(i===0?' active':'');
    btn.textContent=s.name||s.label||('Screen '+(i+1));
    btn.onclick=()=>show(i);
    nav.appendChild(btn);
  });
  show(0);
}
<\/script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
const viewerHtml = viewerTemplate.replace('<script>', injection + '\n<script>');

// ── Gallery queue ─────────────────────────────────────────────────
async function updateGallery() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (getRes.status !== 200) { console.warn('Gallery GET failed:', getRes.status); return; }
  const fileData = JSON.parse(getRes.body);
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  queue.submissions.push({
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://${SUBDOMAIN}.zenbin.org/${SLUG}`,
    mock_url:   `https://${SUBDOMAIN}.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: 'Dark-mode developer secret management app. Inspired by Twingate zero-trust (godly.website) and Evervault encryption tooling + Midday.ai financial clarity UI (darkmodedesign.com).',
    screens: 5,
    source: 'heartbeat',
  });
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: fileData.sha });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`  Queue: ${putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 100)}`);
}

async function run() {
  let res;
  console.log('Publishing hero page...');
  res = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`  Hero: ${res.status} → https://${SUBDOMAIN}.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  res = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log(`  Viewer: ${res.status} → https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);

  console.log('Updating gallery queue...');
  await updateGallery();
}

run().catch(console.error);
