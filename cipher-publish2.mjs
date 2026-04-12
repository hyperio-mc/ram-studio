// cipher-publish2.mjs — hero + viewer for CIPHER
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLUG      = 'cipher';
const APP_NAME  = 'CIPHER';
const TAGLINE   = "your codebase's immune system";
const SUBDOMAIN = 'ram';

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

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:#0C0D14;--surface:#161825;--card:#1D1F33;--border:#2A2D47;--text:#FFFFFF;--muted:rgba(255,255,255,0.45);--accent:#64FFDA;--accent2:#FF4D6A;--amber:#FFB946;--accentDim:rgba(100,255,218,0.12);--redDim:rgba(255,77,106,0.12);--amberDim:rgba(255,185,70,0.10)}
  html,body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
  nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:rgba(12,13,20,0.92);backdrop-filter:blur(16px)}
  .nav-logo{font-weight:800;font-size:16px;letter-spacing:5px;color:var(--accent);font-family:'JetBrains Mono',monospace}
  .nav-sub{font-size:10px;color:var(--muted);margin-top:2px;font-family:'JetBrains Mono',monospace}
  .nav-links{display:flex;gap:32px}
  .nav-links a{color:var(--muted);text-decoration:none;font-size:13px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--accent);color:var(--bg);padding:8px 20px;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-decoration:none;font-family:'JetBrains Mono',monospace;transition:opacity .2s}
  .nav-cta:hover{opacity:.85}
  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
  .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% -5%,rgba(100,255,218,0.07) 0%,transparent 60%)}
  .hero-grid{position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:0.18}
  .hero-scan{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);animation:scan 4s ease-in-out infinite}
  @keyframes scan{0%{transform:translateY(0);opacity:0}10%{opacity:1}90%{opacity:.3}100%{transform:translateY(100vh)}}
  .live-badge{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--border);background:var(--card);border-radius:100px;padding:6px 16px 6px 10px;font-size:11px;font-weight:600;color:var(--muted);letter-spacing:1px;margin-bottom:32px;position:relative;font-family:'JetBrains Mono',monospace}
  .live-dot{width:8px;height:8px;border-radius:50%;background:var(--accent2);animation:blink 1.5s infinite}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  .live-badge span{color:var(--accent2)}
  h1{font-size:clamp(56px,9vw,100px);font-weight:800;letter-spacing:-3px;line-height:.95;margin-bottom:16px;position:relative;font-family:'JetBrains Mono',monospace}
  h1 .a{color:var(--accent)}
  .tagline{font-size:clamp(16px,2.5vw,20px);color:var(--muted);margin-bottom:48px;max-width:480px;position:relative;line-height:1.5}
  .hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative}
  .btn-p{background:var(--accent);color:var(--bg);padding:14px 32px;border-radius:10px;font-weight:700;font-size:13px;letter-spacing:2px;text-decoration:none;font-family:'JetBrains Mono',monospace;transition:all .2s}
  .btn-p:hover{opacity:.85;transform:translateY(-2px)}
  .btn-s{border:1px solid var(--border);color:var(--text);padding:14px 32px;border-radius:10px;font-size:13px;text-decoration:none;background:var(--card);transition:all .2s}
  .btn-s:hover{border-color:var(--accent);color:var(--accent)}
  .score-widget{display:flex;gap:12px;justify-content:center;margin-top:56px;flex-wrap:wrap;position:relative}
  .score-item{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px 28px;text-align:center;min-width:110px}
  .score-val{font-size:36px;font-weight:800;color:var(--accent);display:block;font-family:'JetBrains Mono',monospace;line-height:1}
  .score-val.warn{color:var(--amber)}.score-val.danger{color:var(--accent2)}
  .score-label{font-size:9px;color:var(--muted);letter-spacing:2px;margin-top:6px;display:block;font-family:'JetBrains Mono',monospace}
  .alert-strip{margin:32px auto 0;max-width:600px;background:var(--redDim);border:1px solid rgba(255,77,106,0.25);border-left:3px solid var(--accent2);border-radius:12px;padding:14px 20px;display:flex;align-items:flex-start;gap:12px;text-align:left;position:relative}
  .alert-icon{font-size:18px;color:var(--accent2);flex-shrink:0}
  .alert-title{font-size:13px;font-weight:600;margin-bottom:4px}
  .alert-detail{font-size:11px;color:var(--muted);font-family:'JetBrains Mono',monospace}
  .features{padding:80px 40px;max-width:1100px;margin:0 auto}
  .sec-label{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--accent);margin-bottom:16px;font-family:'JetBrains Mono',monospace}
  .sec-title{font-size:clamp(28px,4vw,44px);font-weight:700;margin-bottom:16px;letter-spacing:-1px}
  .sec-sub{font-size:15px;color:var(--muted);margin-bottom:56px;max-width:520px;line-height:1.6}
  .feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
  .feat-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;transition:border-color .2s}
  .feat-card:hover{border-color:rgba(100,255,218,0.3)}
  .feat-icon{font-size:22px;margin-bottom:16px;display:block;color:var(--accent);font-family:'JetBrains Mono',monospace}
  .feat-name{font-size:16px;font-weight:600;margin-bottom:8px}
  .feat-desc{font-size:13px;color:var(--muted);line-height:1.6}
  .term-section{padding:60px 40px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--surface)}
  .term-box{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:24px;max-width:680px;margin:40px auto 0;font-family:'JetBrains Mono',monospace}
  .term-head{display:flex;gap:8px;margin-bottom:18px}
  .td{width:10px;height:10px;border-radius:50%}
  .td.r{background:#FF5F57}.td.y{background:#FFBD2E}.td.g{background:#28CA41}
  .tl{font-size:12px;line-height:1.8;color:var(--muted)}
  .tl .cmd{color:var(--accent)}.tl .ok{color:#64FFDA}.tl .wn{color:var(--amber)}.tl .er{color:var(--accent2)}.tl .cm{color:rgba(255,255,255,0.2)}
  .screens-section{padding:80px 40px;max-width:900px;margin:0 auto;text-align:center}
  .screens-row{display:flex;gap:12px;justify-content:center;margin-top:40px;flex-wrap:wrap}
  .spill{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:8px 18px;font-size:12px;color:var(--muted);font-family:'JetBrains Mono',monospace;transition:all .2s}
  .spill:hover{border-color:var(--accent);color:var(--accent)}
  footer{padding:40px;border-top:1px solid var(--border);text-align:center}
  .flogo{font-weight:800;font-size:14px;letter-spacing:5px;color:var(--accent);font-family:'JetBrains Mono',monospace;margin-bottom:8px}
  .fsub{font-size:12px;color:var(--muted)}
  .flinks{display:flex;gap:24px;justify-content:center;margin-top:20px}
  .flinks a{color:var(--muted);text-decoration:none;font-size:12px;transition:color .2s}
  .flinks a:hover{color:var(--accent)}
  @media(max-width:640px){nav{padding:0 20px}.features,.screens-section{padding:60px 20px}.term-section{padding:40px 20px}}
</style>
</head>
<body>
<nav>
  <div>
    <div class="nav-logo">CIPHER</div>
    <div class="nav-sub">// code security intelligence</div>
  </div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#terminal">How it works</a>
    <a href="/cipher-viewer">Design</a>
  </div>
  <a href="/cipher-viewer" class="nav-cta">VIEW DESIGN →</a>
</nav>

<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-grid"></div>
  <div class="hero-scan"></div>
  <div class="live-badge"><div class="live-dot"></div><span>THREAT MONITORING</span>&nbsp;ACTIVE</div>
  <h1>CI<span class="a">PH</span>ER</h1>
  <p class="tagline">Your codebase's immune system. AI-powered security intelligence that catches vulnerabilities before they become incidents.</p>
  <div class="hero-btns">
    <a href="/cipher-viewer" class="btn-p">VIEW DESIGN</a>
    <a href="/cipher-mock" class="btn-s">☀◑ Interactive Mock</a>
  </div>
  <div class="score-widget">
    <div class="score-item"><span class="score-val">94</span><span class="score-label">THREAT SCORE</span></div>
    <div class="score-item"><span class="score-val warn">3</span><span class="score-label">OPEN VULNS</span></div>
    <div class="score-item"><span class="score-val">12</span><span class="score-label">SCANS / WEEK</span></div>
    <div class="score-item"><span class="score-val">24</span><span class="score-label">REPOS MONITORED</span></div>
  </div>
  <div class="alert-strip">
    <div class="alert-icon">⚠</div>
    <div>
      <div class="alert-title">Dependency risk in auth-service</div>
      <div class="alert-detail">lodash@4.17.15 — prototype pollution (CVE-2021-23337) · detected 2m ago</div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="sec-label">// CORE CAPABILITIES</div>
  <h2 class="sec-title">Security at the speed of your code</h2>
  <p class="sec-sub">CIPHER integrates into your CI/CD pipeline and monitors every commit, dependency, and configuration change in real time.</p>
  <div class="feat-grid">
    <div class="feat-card"><span class="feat-icon">◈</span><div class="feat-name">Continuous SAST</div><div class="feat-desc">Static analysis on every push. Catch injection vulnerabilities, unsafe patterns, and logic flaws before they ship.</div></div>
    <div class="feat-card"><span class="feat-icon">⌥</span><div class="feat-name">Dependency Intelligence</div><div class="feat-desc">Monitor all dependencies for known CVEs. Get pinpointed fix recommendations the moment a vulnerability drops.</div></div>
    <div class="feat-card"><span class="feat-icon">◉</span><div class="feat-name">Secret Detection</div><div class="feat-desc">Scan commit history and staged changes for leaked credentials, API keys, and tokens — real-time git hooks.</div></div>
    <div class="feat-card"><span class="feat-icon">◎</span><div class="feat-name">Live Threat Feed</div><div class="feat-desc">A live stream of security events scored by severity. Dismiss noise, triage signal, export to Jira or Slack.</div></div>
    <div class="feat-card"><span class="feat-icon">⊞</span><div class="feat-name">Zero-Config Integrations</div><div class="feat-desc">Works with GitHub, Actions, AWS, Datadog, Jira. Connect in 30 seconds — no YAML configuration required.</div></div>
    <div class="feat-card"><span class="feat-icon">∿</span><div class="feat-name">AI Fix Suggestions</div><div class="feat-desc">For each vulnerability, CIPHER provides a context-aware fix — from upgrade commands to targeted code patches.</div></div>
  </div>
</section>

<section class="term-section" id="terminal">
  <div style="text-align:center">
    <div class="sec-label" style="display:inline-block">// HOW IT WORKS</div>
    <h2 style="font-size:clamp(24px,3.5vw,38px);font-weight:700;margin-top:12px;letter-spacing:-1px">Security in your terminal</h2>
  </div>
  <div class="term-box">
    <div class="term-head"><div class="td r"></div><div class="td y"></div><div class="td g"></div></div>
    <div class="tl"><span class="cm">$ </span><span class="cmd">cipher scan --repo api-gateway</span></div>
    <div class="tl"><span class="cm">  Connecting to GitHub... done</span></div>
    <div class="tl"><span class="cm">  Analyzing 342 files...</span></div>
    <div class="tl">&nbsp;</div>
    <div class="tl"><span class="ok">  ✓ src/auth/jwt.ts — clean</span></div>
    <div class="tl"><span class="ok">  ✓ src/api/routes.ts — clean</span></div>
    <div class="tl"><span class="wn">  ! package.json — lodash@4.17.15 (CVE-2021-23337)</span></div>
    <div class="tl"><span class="ok">  ✓ src/db/queries.ts — clean</span></div>
    <div class="tl"><span class="er">  ⚑ src/utils/parser.ts — potential injection (line 47)</span></div>
    <div class="tl">&nbsp;</div>
    <div class="tl"><span class="cm">  ─────────────────────────────────────</span></div>
    <div class="tl"><span class="ok">  Score: 94/100 </span><span class="wn">  HIGH: 1 </span><span class="cm">  MEDIUM: 2</span></div>
    <div class="tl"><span class="cm">  Fix: upgrade lodash → 4.17.21</span></div>
  </div>
</section>

<section class="screens-section">
  <div class="sec-label">// 5 SCREENS DESIGNED</div>
  <h2 style="font-size:clamp(24px,3.5vw,38px);font-weight:700;margin-bottom:12px;letter-spacing:-1px">Explore the full design</h2>
  <p style="font-size:15px;color:var(--muted);max-width:440px;margin:0 auto">Designed in Pencil v2.8 — a complete mobile security ops experience for developer-first teams.</p>
  <div class="screens-row">
    <div class="spill">◈ Dashboard</div>
    <div class="spill">⌥ Live Scan</div>
    <div class="spill">◉ Vulnerabilities</div>
    <div class="spill">◎ Threat Feed</div>
    <div class="spill">⊞ Integrations</div>
  </div>
  <div style="margin-top:40px;display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="/cipher-viewer" class="btn-p" style="display:inline-block;text-decoration:none">OPEN VIEWER →</a>
    <a href="/cipher-mock" class="btn-s" style="display:inline-block;text-decoration:none">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <div class="flogo">CIPHER</div>
  <div class="fsub">${TAGLINE} · Designed by RAM · Pencil v2.8</div>
  <div class="flinks">
    <a href="/cipher-viewer">Viewer</a>
    <a href="/cipher-mock">Mock</a>
    <a href="https://ram.zenbin.org">Gallery</a>
  </div>
</footer>
</body>
</html>`;

function buildViewer() {
  const penJson = fs.readFileSync(path.join(__dirname, 'cipher.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CIPHER — Design Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0A0B12;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:'JetBrains Mono',monospace;color:#E2E8F3}
  header{padding:18px 40px;width:100%;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2A2D47;background:rgba(10,11,18,0.96)}
  .logo{font-weight:800;letter-spacing:5px;color:#64FFDA;font-size:15px}
  .sub{font-size:10px;color:rgba(255,255,255,0.3);margin-top:2px}
  .back{color:rgba(255,255,255,0.3);text-decoration:none;font-size:13px;transition:color .2s}
  .back:hover{color:#64FFDA}
  #pen-canvas{width:100%;overflow-x:auto;padding:40px 20px}
  .placeholder{text-align:center;padding:80px 40px;color:rgba(255,255,255,0.3)}
  .placeholder h2{font-size:18px;color:#64FFDA;margin-bottom:12px}
</style>
<script>
function renderPen(pen) {
  const canvas = document.getElementById('pen-canvas');
  const screens = pen.children || [];
  const totalW = screens.length * (pen.width + 40) - 40;
  const scale = Math.min(0.85, (window.innerWidth - 60) / (pen.width + 20));
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width', Math.round(totalW * scale));
  svg.setAttribute('height', Math.round(pen.height * scale + 60));
  svg.style.display='block'; svg.style.margin='0 auto';

  function node(n, parent, ox, oy) {
    const x=(n.x||0)+ox, y=(n.y||0)+oy, t=n.type||'';
    if(t==='frame') {
      const W=n.width||390, H=n.height||844;
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
      bg.setAttribute('x',x*scale); bg.setAttribute('y',y*scale);
      bg.setAttribute('width',W*scale); bg.setAttribute('height',H*scale);
      bg.setAttribute('fill',n.fill||'#0C0D14'); bg.setAttribute('rx',18*scale);
      if(n.clip){
        const cid='c'+n.id;
        let defs=svg.querySelector('defs');
        if(!defs){defs=document.createElementNS('http://www.w3.org/2000/svg','defs');svg.insertBefore(defs,svg.firstChild);}
        const cp=document.createElementNS('http://www.w3.org/2000/svg','clipPath');
        cp.setAttribute('id',cid);
        const cr=bg.cloneNode(); cr.setAttribute('rx',18*scale);
        cp.appendChild(cr); defs.appendChild(cp);
        g.setAttribute('clip-path','url(#'+cid+')');
      }
      parent.appendChild(bg); parent.appendChild(g);
      if(n.name){
        const lbl=document.createElementNS('http://www.w3.org/2000/svg','text');
        lbl.setAttribute('x',(x+W/2)*scale); lbl.setAttribute('y',(y+H+18)*scale);
        lbl.setAttribute('fill','rgba(255,255,255,0.25)'); lbl.setAttribute('font-size',10*scale);
        lbl.setAttribute('font-family','JetBrains Mono,monospace'); lbl.setAttribute('text-anchor','middle');
        lbl.textContent=n.name; parent.appendChild(lbl);
      }
      (n.children||[]).forEach(ch=>node(ch,g,x,y));
    } else if(t==='rectangle') {
      if(!n.fill||n.fill==='transparent'||n.fill==='none') return;
      const el=document.createElementNS('http://www.w3.org/2000/svg','rect');
      el.setAttribute('x',x*scale); el.setAttribute('y',y*scale);
      el.setAttribute('width',(n.width||0)*scale); el.setAttribute('height',(n.height||0)*scale);
      el.setAttribute('fill',n.fill||'#1D1F33');
      el.setAttribute('rx',(n.cornerRadius||0)*scale);
      el.setAttribute('opacity',n.opacity||1);
      parent.appendChild(el);
    } else if(t==='text') {
      const ff=n.fontFamily&&n.fontFamily.toLowerCase().includes('mono')?'JetBrains Mono,monospace':'Inter,sans-serif';
      const al=n.textAlign||'left'; const fw=n.width||200;
      const tx=al==='center'?x+fw/2:al==='right'?x+fw:x;
      const el=document.createElementNS('http://www.w3.org/2000/svg','text');
      el.setAttribute('x',tx*scale); el.setAttribute('y',(y+(n.fontSize||12)*0.85)*scale);
      el.setAttribute('fill',n.fill||'#FFFFFF');
      el.setAttribute('font-size',(n.fontSize||12)*scale);
      el.setAttribute('font-weight',n.fontWeight||400);
      el.setAttribute('font-family',ff);
      el.setAttribute('text-anchor',al==='center'?'middle':al==='right'?'end':'start');
      el.setAttribute('opacity',n.opacity||1);
      if(n.letterSpacing) el.setAttribute('letter-spacing',n.letterSpacing);
      el.textContent=n.content||''; parent.appendChild(el);
    } else if(t==='ellipse') {
      const el=document.createElementNS('http://www.w3.org/2000/svg','ellipse');
      el.setAttribute('cx',(x+(n.width||0)/2)*scale);
      el.setAttribute('cy',(y+(n.height||0)/2)*scale);
      el.setAttribute('rx',(n.width||0)/2*scale); el.setAttribute('ry',(n.height||0)/2*scale);
      el.setAttribute('fill',n.fill||'#64FFDA'); el.setAttribute('opacity',n.opacity||1);
      parent.appendChild(el);
    }
  }
  (pen.children||[]).forEach(s=>node(s,svg,0,0));
  canvas.innerHTML=''; canvas.appendChild(svg);
}
window.addEventListener('DOMContentLoaded',()=>{
  if(window.EMBEDDED_PEN){
    try{renderPen(JSON.parse(window.EMBEDDED_PEN));}
    catch(e){document.getElementById('pen-canvas').innerHTML='<div class="placeholder"><h2>Render error</h2><p>'+e.message+'</p></div>';}
  }
});
</script>
</head>
<body>
<header>
  <div><div class="logo">CIPHER</div><div class="sub">// your codebase's immune system · Pencil v2.8</div></div>
  <a href="/cipher" class="back">← Back to hero</a>
</header>
<div id="pen-canvas"><div class="placeholder"><h2>Loading...</h2><p>CIPHER — 5 screens</p></div></div>
</body>
</html>`;
  return viewerHtml.replace('<script>', injection + '\n<script>');
}

async function main() {
  console.log('Publishing CIPHER...\n');
  console.log('→ Hero...');
  const r1 = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log('  Status:', r1.status, r1.body.slice(0,100));

  console.log('→ Viewer...');
  const viewer = buildViewer();
  const r2 = await publishToZenbin(`${SLUG}-viewer`, `${APP_NAME} — Design Viewer`, viewer);
  console.log('  Status:', r2.status, r2.body.slice(0,100));

  console.log('\n✓ Published.');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
