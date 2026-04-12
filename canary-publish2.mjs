// canary-publish2.mjs — publish hero + viewer for CANARY
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = __dirname;

const SLUG = 'canary';
const APP_NAME = 'CANARY';
const TAGLINE  = "know when they're inside";

// ─── HTTP helper ──────────────────────────────────────────────────────────────
function httpsPost(slug, html) {
  const body = Buffer.from(JSON.stringify({ html }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
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

// ─── HERO ─────────────────────────────────────────────────────────────────────
const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CANARY — know when they're inside</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#070B14;--surface:#0D1220;--surface2:#131825;
    --border:#1E2D45;--text:#E2E8F3;--muted:#6B7E9A;
    --yellow:#F5C842;--yellow2:#FADA6B;--blue:#3B82F6;
    --red:#EF4444;--green:#22C55E;--orange:#F59E0B;
  }
  html,body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
  nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 40px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:rgba(7,11,20,0.9);backdrop-filter:blur(12px)}
  .nav-logo{font-weight:700;font-size:18px;letter-spacing:4px;color:var(--yellow)}
  .nav-links{display:flex;gap:28px}
  .nav-links a{color:var(--muted);text-decoration:none;font-size:13px;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--yellow);color:#070B14;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:1px;text-decoration:none}

  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
  .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(245,200,66,0.08) 0%,transparent 60%)}
  .grid{position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:48px 48px;opacity:0.22}
  .badge{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(245,200,66,0.35);border-radius:100px;padding:6px 16px;font-size:12px;font-weight:600;color:var(--yellow);letter-spacing:1.5px;margin-bottom:28px;position:relative;background:rgba(245,200,66,0.06)}
  .pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--red);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}
  h1{font-size:clamp(52px,10vw,96px);font-weight:700;letter-spacing:-2px;line-height:1;margin-bottom:10px;position:relative}
  h1 em{color:var(--yellow);font-style:normal}
  .tagline{font-size:clamp(15px,3vw,20px);color:var(--muted);margin-bottom:16px;letter-spacing:0.3px;position:relative}
  .desc{font-size:15px;color:var(--muted);max-width:480px;line-height:1.7;margin-bottom:36px;position:relative}
  .desc strong{color:var(--yellow)}
  .btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative}
  .btn-y{background:var(--yellow);color:#070B14;padding:13px 30px;border-radius:10px;font-weight:700;font-size:13px;letter-spacing:1.5px;text-decoration:none;transition:opacity .2s}
  .btn-y:hover{opacity:.85}
  .btn-o{border:1px solid var(--border);color:var(--text);padding:13px 30px;border-radius:10px;font-size:13px;text-decoration:none;transition:border-color .2s,color .2s}
  .btn-o:hover{border-color:var(--yellow);color:var(--yellow)}
  .stats{display:flex;gap:48px;justify-content:center;margin-top:60px;padding-top:36px;border-top:1px solid var(--border);position:relative;flex-wrap:wrap}
  .stat-val{font-size:32px;font-weight:700;color:var(--yellow);display:block}
  .stat-lbl{font-size:11px;color:var(--muted);letter-spacing:1.5px;margin-top:4px}

  .pulse-strip{padding:48px 40px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--surface);text-align:center}
  .strip-label{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--muted);margin-bottom:20px}
  .dots{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
  .d{width:12px;height:12px;border-radius:50%}
  .d-g{background:var(--green);opacity:.55}
  .d-r{background:var(--red);animation:blink 1.4s infinite}
  .d-o{background:var(--orange)}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}

  section.how{padding:72px 40px;max-width:1100px;margin:0 auto}
  .sec-label{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--muted);margin-bottom:36px;text-align:center}
  .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
  .step{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;transition:border-color .2s}
  .step:hover{border-color:rgba(245,200,66,.4)}
  .step-n{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--yellow);margin-bottom:10px;letter-spacing:1px}
  .step h3{font-size:15px;font-weight:600;margin-bottom:8px}
  .step p{font-size:12px;color:var(--muted);line-height:1.6}

  section.screens{padding:52px 0;background:var(--surface);overflow:hidden}
  .screens-inner{padding:0 40px;max-width:1200px;margin:0 auto}
  .row{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
  .sc{flex:0 0 190px;background:var(--bg);border:1px solid var(--border);border-radius:16px;padding:18px;transition:transform .2s,border-color .2s}
  .sc:hover{transform:translateY(-4px);border-color:rgba(245,200,66,.4)}
  .sc-ic{font-size:26px;margin-bottom:10px}
  .sc h4{font-size:12px;font-weight:600;margin-bottom:5px}
  .sc p{font-size:11px;color:var(--muted);line-height:1.5}

  .alerts-demo{padding:72px 40px;max-width:680px;margin:0 auto}
  .alert-row{display:flex;align-items:flex-start;gap:14px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:10px;border-left:3px solid var(--red)}
  .alert-row.h{border-left-color:var(--orange)}
  .alert-row.m{border-left-color:var(--yellow)}
  .ai{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:17px;background:rgba(239,68,68,.15)}
  .h .ai{background:rgba(245,158,11,.15)}
  .m .ai{background:rgba(245,200,66,.15)}
  .ab{flex:1}
  .an{font-size:13px;font-weight:600;margin-bottom:2px}
  .am{font-size:11px;color:var(--muted)}
  .at{font-size:11px;color:var(--muted);font-family:'JetBrains Mono',monospace;flex-shrink:0}
  .sb{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1px;padding:2px 8px;border-radius:100px;margin-top:5px}
  .sb-c{color:var(--red);background:rgba(239,68,68,.15)}
  .sb-h{color:var(--orange);background:rgba(245,158,11,.15)}
  .sb-m{color:var(--yellow);background:rgba(245,200,66,.15)}

  .phil{padding:72px 40px;text-align:center;max-width:680px;margin:0 auto;border-top:1px solid var(--border)}
  .phil h2{font-size:clamp(26px,5vw,44px);font-weight:700;margin-bottom:18px;letter-spacing:-0.5px}
  .phil p{font-size:15px;color:var(--muted);line-height:1.7}
  blockquote{margin:28px 0;padding:22px 28px;background:var(--surface);border-left:3px solid var(--yellow);border-radius:0 12px 12px 0;text-align:left;font-size:14px;line-height:1.7;color:var(--text)}
  blockquote em{color:var(--yellow);font-style:normal;font-weight:600}

  .cta{padding:72px 40px;text-align:center;border-top:1px solid var(--border)}
  .cta h2{font-size:34px;font-weight:700;margin-bottom:14px;letter-spacing:-0.5px}
  .cta p{color:var(--muted);margin-bottom:32px;font-size:14px}
  footer{padding:28px 40px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  footer .brand{font-weight:700;letter-spacing:3px;color:var(--yellow);font-size:14px}
  footer .copy{font-size:11px;color:var(--muted)}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">CANARY</div>
  <div class="nav-links">
    <a href="#how">How it works</a>
    <a href="#screens">Screens</a>
    <a href="/canary-viewer">Viewer</a>
  </div>
  <a href="/canary-mock" class="nav-cta">MOCK →</a>
</nav>

<div class="hero">
  <div class="hero-bg"></div>
  <div class="grid"></div>
  <div class="badge"><div class="pulse-dot"></div>LIVE THREAT DETECTION</div>
  <h1>CAN<em>ARY</em></h1>
  <p class="tagline">know when they're inside</p>
  <p class="desc">Deploy invisible decoy assets across your network. The moment an attacker touches a canary — you know. Not after the breach. <strong>During it.</strong></p>
  <div class="btns">
    <a href="/canary-mock" class="btn-y">INTERACTIVE MOCK →</a>
    <a href="/canary-viewer" class="btn-o">View .pen file</a>
  </div>
  <div class="stats">
    <div><span class="stat-val">24</span><div class="stat-lbl">CANARIES DEPLOYED</div></div>
    <div><span class="stat-val" style="color:var(--red)">3</span><div class="stat-lbl">ALERTS TODAY</div></div>
    <div><span class="stat-val" style="color:var(--green)">87%</span><div class="stat-lbl">COVERAGE SCORE</div></div>
    <div><span class="stat-val">30s</span><div class="stat-lbl">TIME TO DEPLOY</div></div>
  </div>
</div>

<div class="pulse-strip">
  <div class="strip-label">CANARY PULSE — 24 DEPLOYED</div>
  <div class="dots">
    <div class="d d-g"></div><div class="d d-g"></div><div class="d d-g"></div><div class="d d-g"></div>
    <div class="d d-g"></div><div class="d d-g"></div><div class="d d-g"></div><div class="d d-g"></div>
    <div class="d d-g"></div><div class="d d-g"></div><div class="d d-g"></div><div class="d d-o"></div>
    <div class="d d-g"></div><div class="d d-g"></div><div class="d d-g"></div><div class="d d-g"></div>
    <div class="d d-r"></div><div class="d d-g"></div><div class="d d-g"></div><div class="d d-g"></div>
    <div class="d d-g"></div><div class="d d-o"></div><div class="d d-g"></div><div class="d d-g"></div>
  </div>
</div>

<section class="how" id="how">
  <div class="sec-label">HOW IT WORKS</div>
  <div class="steps">
    <div class="step"><div class="step-n">01 / PLANT</div><h3>Deploy Decoy Assets</h3><p>Place fake AWS keys, SQL dumps, SSH keys, and documents wherever an attacker would look.</p></div>
    <div class="step"><div class="step-n">02 / WAIT</div><h3>Attacker Takes the Bait</h3><p>Real users ignore decoys. Attackers don't. The moment a canary is touched — the trap fires.</p></div>
    <div class="step"><div class="step-n">03 / DETECT</div><h3>Zero-False-Positive Alert</h3><p>No ML tuning. No alert fatigue. If a canary fires, something is wrong. Instant fingerprint capture.</p></div>
    <div class="step"><div class="step-n">04 / RESPOND</div><h3>Contain & Attribute</h3><p>One-tap actions: rotate credentials, block IPs, create tickets. IOCs mapped to MITRE ATT&CK.</p></div>
  </div>
</section>

<section class="screens" id="screens">
  <div class="screens-inner">
    <div class="sec-label" style="text-align:left;margin-bottom:16px">5 SCREENS DESIGNED</div>
    <div class="row">
      <div class="sc"><div class="sc-ic">⌂</div><h4>Nest Overview</h4><p>Live canary count, today's alerts, coverage score, alert feed</p></div>
      <div class="sc"><div class="sc-ic">◈</div><h4>Alert Detail</h4><p>Attacker fingerprint, timeline, one-tap response actions</p></div>
      <div class="sc"><div class="sc-ic">◎</div><h4>Canary Map</h4><p>Network topology showing live, triggered, warning canaries</p></div>
      <div class="sc"><div class="sc-ic">◉</div><h4>Threat Intel</h4><p>Actor profile, MITRE ATT&CK coverage, IOCs, activity chart</p></div>
      <div class="sc"><div class="sc-ic">+</div><h4>Deploy Canary</h4><p>Token type selector, zone picker, lure quality, alert channels</p></div>
    </div>
  </div>
</section>

<section class="alerts-demo">
  <div class="sec-label">RECENT ALERTS</div>
  <div class="alert-row"><div class="ai">☁</div><div class="ab"><div class="an">AWS Credentials Token</div><div class="am">Cloud / IAM · 185.220.101.47 · Russia</div><span class="sb sb-c">CRITICAL</span></div><div class="at">4m ago</div></div>
  <div class="alert-row h"><div class="ai">🗄</div><div class="ab"><div class="an">SQL Dump Canary File</div><div class="am">DB Server / prod-db-1 · Internal</div><span class="sb sb-h">HIGH</span></div><div class="at">31m ago</div></div>
  <div class="alert-row m"><div class="ai">📄</div><div class="ab"><div class="an">HR Directory Document</div><div class="am">File Share / \\\\corp · Lateral move</div><span class="sb sb-m">MEDIUM</span></div><div class="at">2h ago</div></div>
</section>

<div class="phil">
  <h2>The <span style="color:var(--yellow)">Assume Breach</span> philosophy</h2>
  <p>Traditional security asks: <em style="color:var(--text)">"Did they get in?"</em> CANARY asks: <em style="color:var(--yellow)">"What are they touching?"</em></p>
  <blockquote>It's not <em>if</em> an attacker will breach your perimeter — it's <em>when</em>. Deception tech forces them to reveal themselves the moment they move laterally. Every canary trip is a perfect signal: no noise, no tuning, no false positives.</blockquote>
  <p>Inspired by <em style="color:var(--text)">Tracebit</em> ("The answer to Assume Breach") on land-book.com and the Darknode dark AI aesthetic (Awwwards nominee).</p>
</div>

<div class="cta">
  <h2>Deploy your first canary.</h2>
  <p>30 seconds. Zero false positives. Know the moment they're inside.</p>
  <a href="/canary-mock" class="btn-y">OPEN INTERACTIVE MOCK →</a>
</div>

<footer>
  <div class="brand">CANARY</div>
  <div class="copy">Designed by RAM · Design Heartbeat · ram.zenbin.org</div>
</footer>

</body>
</html>`;

// ─── VIEWER ───────────────────────────────────────────────────────────────────
function buildViewer() {
  const penJson = fs.readFileSync(path.join(DIR, 'canary.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

  const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CANARY — Pencil Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#050810;font-family:Inter,sans-serif;color:#E2E8F3;min-height:100vh}
  header{padding:18px 36px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1E2D45}
  .logo{font-weight:700;letter-spacing:4px;color:#F5C842;font-size:15px}
  .sub{font-size:11px;color:#6B7E9A;margin-top:3px}
  a.back{color:#6B7E9A;text-decoration:none;font-size:12px}
  a.back:hover{color:#F5C842}
  #canvas{padding:40px;overflow-x:auto;text-align:center}
</style>
<script>
function renderPen(pen){
  const scale=0.88;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width',pen.canvas.w*scale);
  svg.setAttribute('height',pen.canvas.h*scale);
  svg.style.cssText='background:'+pen.canvas.bg+';border-radius:18px;display:block;margin:0 auto';
  function rNode(node,parent,ox,oy){
    const x=(node.x||0)+ox, y=(node.y||0)+oy;
    if(node.type==='FRAME'){
      const clipId='c'+node.id;
      const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
      const cp=document.createElementNS('http://www.w3.org/2000/svg','clipPath');
      cp.id=clipId;
      const cr=document.createElementNS('http://www.w3.org/2000/svg','rect');
      cr.setAttribute('x',x*scale);cr.setAttribute('y',y*scale);
      cr.setAttribute('width',(node.w||375)*scale);cr.setAttribute('height',(node.h||812)*scale);
      cr.setAttribute('rx',20*scale);
      cp.appendChild(cr);defs.appendChild(cp);svg.appendChild(defs);
      const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
      bg.setAttribute('x',x*scale);bg.setAttribute('y',y*scale);
      bg.setAttribute('width',(node.w||375)*scale);bg.setAttribute('height',(node.h||812)*scale);
      bg.setAttribute('fill',node.fill||'#070B14');bg.setAttribute('rx',20*scale);
      parent.appendChild(bg);
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('clip-path','url(#'+clipId+')');
      parent.appendChild(g);
      if(node.name){const lbl=document.createElementNS('http://www.w3.org/2000/svg','text');lbl.setAttribute('x',x*scale);lbl.setAttribute('y',(y-10)*scale);lbl.setAttribute('fill','#6B7E9A');lbl.setAttribute('font-size',10*scale);lbl.setAttribute('font-family','Inter,sans-serif');lbl.textContent=node.name;parent.appendChild(lbl);}
      (node.children||[]).forEach(c=>rNode(c,g,x,y));
    } else if(node.type==='RECTANGLE'){
      const el=document.createElementNS('http://www.w3.org/2000/svg','rect');
      el.setAttribute('x',x*scale);el.setAttribute('y',y*scale);
      el.setAttribute('width',(node.w||0)*scale);el.setAttribute('height',(node.h||0)*scale);
      el.setAttribute('fill',node.fill==='transparent'?'none':node.fill||'#000');
      el.setAttribute('rx',(node.cornerRadius||0)*scale);
      el.setAttribute('opacity',node.opacity||1);
      if(node.stroke){el.setAttribute('stroke',node.stroke);el.setAttribute('stroke-width',(node.strokeWidth||1)*scale);}
      parent.appendChild(el);
    } else if(node.type==='TEXT'){
      const ta=node.textAlign==='center'?'middle':node.textAlign==='right'?'end':'start';
      const xOff=node.textAlign==='center'?(node.w||0)/2:node.textAlign==='right'?(node.w||0):0;
      const el=document.createElementNS('http://www.w3.org/2000/svg','text');
      el.setAttribute('x',(x+xOff)*scale);el.setAttribute('y',(y+(node.fontSize||12)*0.88)*scale);
      el.setAttribute('fill',node.color||'#fff');el.setAttribute('font-size',(node.fontSize||12)*scale);
      el.setAttribute('font-weight',node.fontWeight||400);
      el.setAttribute('font-family',node.fontFamily==='monospace'?'JetBrains Mono,monospace':'Inter,sans-serif');
      el.setAttribute('text-anchor',ta);el.setAttribute('opacity',node.opacity||1);
      if(node.letterSpacing)el.setAttribute('letter-spacing',node.letterSpacing*scale);
      el.textContent=node.content||'';
      parent.appendChild(el);
    } else if(node.type==='ELLIPSE'){
      const el=document.createElementNS('http://www.w3.org/2000/svg','ellipse');
      el.setAttribute('cx',(x+(node.w||0)/2)*scale);el.setAttribute('cy',(y+(node.h||0)/2)*scale);
      el.setAttribute('rx',(node.w||0)/2*scale);el.setAttribute('ry',(node.h||0)/2*scale);
      el.setAttribute('fill',node.fill||'#fff');el.setAttribute('opacity',node.opacity||1);
      if(node.stroke){el.setAttribute('stroke',node.stroke);el.setAttribute('stroke-width',(node.strokeWidth||1)*scale);}
      parent.appendChild(el);
    } else if(node.type==='LINE'){
      const el=document.createElementNS('http://www.w3.org/2000/svg','line');
      el.setAttribute('x1',x*scale);el.setAttribute('y1',y*scale);
      el.setAttribute('x2',(node.x2||x)*scale);el.setAttribute('y2',(node.y2||y)*scale);
      el.setAttribute('stroke',node.stroke||'#fff');el.setAttribute('stroke-width',(node.strokeWidth||1)*scale);
      el.setAttribute('opacity',node.opacity||1);
      parent.appendChild(el);
    }
  }
  pen.frames.forEach(f=>rNode(f,svg,0,0));
  document.getElementById('canvas').appendChild(svg);
}
window.addEventListener('DOMContentLoaded',()=>{
  if(window.EMBEDDED_PEN){try{renderPen(JSON.parse(window.EMBEDDED_PEN));}catch(e){document.getElementById('canvas').innerHTML='<p style="color:#EF4444;padding:40px">Render error: '+e.message+'</p>';}}
});
<\/script>
</head>
<body>
<header>
  <div><div class="logo">CANARY</div><div class="sub">know when they're inside · Pencil v2.8 · 5 screens</div></div>
  <a href="/canary" class="back">← Hero page</a>
</header>
<div id="canvas"></div>
</body>
</html>`;

  return viewerHtml.replace('<script>', injection + '\n<script>');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🐦 Publishing CANARY...\n');

  console.log('→ Hero...');
  const r1 = await httpsPost(SLUG, hero);
  console.log('  Status:', r1.status, r1.body.slice(0,120));

  console.log('→ Viewer...');
  const viewer = buildViewer();
  const r2 = await httpsPost(`${SLUG}-viewer`, viewer);
  console.log('  Status:', r2.status, r2.body.slice(0,120));

  console.log('\n✓ Published.');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
