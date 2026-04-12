'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'relay';
const APP_NAME  = 'Relay';
const TAGLINE   = 'The OS for AI Agent Orchestration';
const ARCHETYPE = 'agent-orchestration-dashboard';
const PROMPT    = 'Dark-mode agent orchestration OS inspired by Codegen.com ultra-light weight-300 headlines on #131315 charcoal, and the "agent OS" trend spotted on land-book. Violet accent #7C6FFF, teal secondary #3ECFCF, lavender-gray muted text. 5 screens: Fleet dashboard, Pipelines, Agents catalog, Run history, Settings/permissions.';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

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

const C = {
  bg:'#111113', surface:'#1A1A1E', surface2:'#222228', border:'#2C2C35',
  text:'#F0F0F5', muted:'#9191A8', accent:'#7C6FFF', accent2:'#3ECFCF',
  red:'#FF5566', grn:'#3EDDA0', amb:'#FFB347', white:'#FFFFFF',
};

function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100vh; overflow-x: hidden;
  }
  body::before {
    content: ''; position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(124,111,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,111,255,0.04) 1px, transparent 1px);
    background-size: 48px 48px; pointer-events: none; z-index: 0;
  }
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 56px;
    background: rgba(17,17,19,0.85); backdrop-filter: blur(16px);
    border-bottom: 1px solid ${C.border};
  }
  .nav-logo { font-size: 14px; font-weight: 300; letter-spacing: 4px; color: ${C.text}; text-decoration: none; }
  .nav-badge { font-size: 9px; font-weight: 600; letter-spacing: 1.5px; color: ${C.accent}; background: rgba(124,111,255,0.12); border: 1px solid rgba(124,111,255,0.3); padding: 3px 8px; border-radius: 4px; }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { font-size: 13px; color: ${C.muted}; text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: ${C.text}; }
  .nav-cta { font-size: 13px; font-weight: 500; color: #fff; background: ${C.accent}; padding: 8px 20px; border-radius: 6px; text-decoration: none; }
  .hero {
    position: relative; z-index: 1; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 120px 24px 80px; text-align: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 10px; font-weight: 600; letter-spacing: 2px; color: ${C.accent};
    background: rgba(124,111,255,0.1); border: 1px solid rgba(124,111,255,0.25);
    padding: 5px 14px; border-radius: 20px; margin-bottom: 32px;
  }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.grn}; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
  .hero h1 { font-size: clamp(44px, 7vw, 84px); font-weight: 300; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 24px; max-width: 780px; }
  .hl { color: ${C.accent}; }
  .hl2 { color: ${C.accent2}; }
  .hero-sub { font-size: 18px; color: ${C.muted}; max-width: 500px; line-height: 1.7; margin-bottom: 40px; }
  .hero-actions { display: flex; gap: 12px; align-items: center; margin-bottom: 56px; }
  .btn-p { font-size: 14px; font-weight: 500; color: #fff; background: ${C.accent}; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 0 32px rgba(124,111,255,0.3); }
  .btn-g { font-size: 14px; color: ${C.muted}; padding: 12px 24px; border-radius: 8px; text-decoration: none; border: 1px solid ${C.border}; }
  .status-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-bottom: 64px; }
  .chip { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 500; padding: 5px 12px; border-radius: 20px; border: 1px solid; }
  .cd { width: 5px; height: 5px; border-radius: 50%; }
  .cg { color:${C.grn}; border-color:rgba(62,221,160,.3); background:rgba(62,221,160,.08); } .cg .cd{background:${C.grn}}
  .ca { color:${C.accent}; border-color:rgba(124,111,255,.3); background:rgba(124,111,255,.08); } .ca .cd{background:${C.accent}}
  .cm { color:${C.muted}; border-color:${C.border}; background:rgba(255,255,255,.03); } .cm .cd{background:${C.muted}}
  .cr { color:${C.red}; border-color:rgba(255,85,102,.3); background:rgba(255,85,102,.08); } .cr .cd{background:${C.red}}
  .mock-frame { width:100%; max-width:320px; border-radius:28px; overflow:hidden; border:1px solid ${C.border}; box-shadow:0 40px 100px rgba(0,0,0,.6),0 0 60px rgba(124,111,255,.15); margin:0 auto; background:${C.bg}; }
  .mock-inner { padding:18px 14px; background:linear-gradient(180deg,rgba(124,111,255,.06) 0%,transparent 50%); }
  .mock-bar { display:flex; justify-content:space-between; margin-bottom:10px; font-size:10px; color:${C.muted}; }
  .mock-title { font-size:20px; font-weight:300; margin-bottom:3px; }
  .mock-sub { font-size:10px; color:${C.muted}; margin-bottom:14px; }
  .mock-pills { display:flex; gap:5px; margin-bottom:14px; flex-wrap:wrap; }
  .mp { font-size:8px; font-weight:600; padding:3px 7px; border-radius:9px; border:1px solid; }
  .mpg{color:${C.grn};border-color:rgba(62,221,160,.4);background:rgba(62,221,160,.1)}
  .mpm{color:${C.muted};border-color:rgba(145,145,168,.3);background:rgba(145,145,168,.06)}
  .mpr{color:${C.red};border-color:rgba(255,85,102,.4);background:rgba(255,85,102,.1)}
  .mpa{color:${C.amb};border-color:rgba(255,179,71,.4);background:rgba(255,179,71,.1)}
  .mock-metrics { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-bottom:10px; }
  .mm { background:${C.surface}; border:1px solid ${C.border}; border-radius:7px; padding:9px 11px; }
  .mm-label { font-size:7px; font-weight:600; letter-spacing:1px; color:${C.muted}; margin-bottom:3px; }
  .mm-val { font-size:20px; font-weight:300; }
  .mm-sub { font-size:8px; color:${C.muted}; }
  .mock-agent { background:${C.surface}; border:1px solid ${C.border}; border-radius:7px; padding:9px 11px; margin-bottom:5px; display:flex; align-items:center; gap:9px; }
  .adot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .ainfo { flex:1; }
  .aname { font-size:10px; font-weight:500; }
  .amod { font-size:8px; color:${C.muted}; }
  .aload { font-size:8px; font-weight:600; color:${C.grn}; }
  .stats { position:relative; z-index:1; border-top:1px solid ${C.border}; border-bottom:1px solid ${C.border}; display:flex; justify-content:center; }
  .stats-inner { max-width:900px; width:100%; display:grid; grid-template-columns:repeat(4,1fr); padding:48px 24px; }
  @media(max-width:600px){.stats-inner{grid-template-columns:repeat(2,1fr);gap:32px}}
  .stat { text-align:center; }
  .stat-val { font-size:38px; font-weight:300; }
  .stat-val span { color:${C.accent}; }
  .stat-label { font-size:12px; color:${C.muted}; margin-top:4px; }
  .features { position:relative; z-index:1; max-width:1080px; margin:0 auto; padding:80px 24px; }
  .feat-label { font-size:10px; font-weight:600; letter-spacing:2px; color:${C.muted}; margin-bottom:16px; }
  .features h2 { font-size:42px; font-weight:300; margin-bottom:48px; max-width:500px; }
  .feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  @media(max-width:768px){.feat-grid{grid-template-columns:1fr}}
  .feat-card { background:${C.surface}; border:1px solid ${C.border}; border-radius:12px; padding:24px; }
  .feat-icon { width:36px; height:36px; border-radius:8px; background:rgba(124,111,255,.12); border:1px solid rgba(124,111,255,.2); display:flex; align-items:center; justify-content:center; font-size:16px; margin-bottom:16px; }
  .feat-name { font-size:15px; font-weight:500; margin-bottom:8px; }
  .feat-desc { font-size:13px; color:${C.muted}; line-height:1.6; }
  .viewer-cta { position:relative; z-index:1; text-align:center; padding:80px 24px; }
  .viewer-cta h2 { font-size:36px; font-weight:300; margin-bottom:12px; }
  .viewer-cta p { color:${C.muted}; margin-bottom:28px; font-size:15px; }
  .viewer-links { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  footer { position:relative; z-index:1; border-top:1px solid ${C.border}; padding:28px 32px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:${C.muted}; }
  .footer-brand { font-size:13px; font-weight:300; letter-spacing:3px; }
  .by-ram { color:${C.accent}; }
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">RELAY</a>
  <div class="nav-badge">AGENT OS</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try mock →</a>
</nav>

<section class="hero">
  <div class="hero-eyebrow"><span class="dot"></span>4 AGENTS RUNNING NOW</div>
  <h1>The <span class="hl">OS</span> for<br>AI Agent <span class="hl2">Orchestration</span></h1>
  <p class="hero-sub">Deploy, monitor, and control fleets of AI agents across multi-step pipelines. Full observability. Granular permissions. Zero babysitting.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-p">Explore mock ☀◑</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-g">View design →</a>
  </div>
  <div class="status-row">
    <div class="chip cg"><span class="cd"></span>4 Running</div>
    <div class="chip ca"><span class="cd"></span>1,847 Tasks Done</div>
    <div class="chip cm"><span class="cd"></span>6 Idle</div>
    <div class="chip cr"><span class="cd"></span>1 Error</div>
  </div>
  <div class="mock-frame">
    <div class="mock-inner">
      <div class="mock-bar"><span>9:41</span><span style="letter-spacing:2px;color:${C.muted}">relay</span></div>
      <div class="mock-title">Agent Fleet</div>
      <div class="mock-sub">12 agents across 4 pipelines</div>
      <div class="mock-pills">
        <span class="mp mpg">● 4 Running</span>
        <span class="mp mpm">● 6 Idle</span>
        <span class="mp mpr">● 1 Error</span>
        <span class="mp mpa">● 1 Queued</span>
      </div>
      <div class="mock-metrics">
        <div class="mm"><div class="mm-label">TASKS DONE</div><div class="mm-val" style="color:${C.grn}">1,847</div><div class="mm-sub">↑ 12% vs yesterday</div></div>
        <div class="mm"><div class="mm-label">AVG LATENCY</div><div class="mm-val" style="color:${C.accent2}">2.3s</div><div class="mm-sub">↓ 0.4s improved</div></div>
      </div>
      <div class="mock-agent"><span class="adot" style="background:${C.grn}"></span><div class="ainfo"><div class="aname">scraper-prime</div><div class="amod">GPT-4o · Fetcher</div></div><span class="aload">78%</span></div>
      <div class="mock-agent"><span class="adot" style="background:${C.grn}"></span><div class="ainfo"><div class="aname">analyst-v2</div><div class="amod">Claude 3.5 · Reasoner</div></div><span class="aload">55%</span></div>
      <div class="mock-agent"><span class="adot" style="background:${C.muted}"></span><div class="ainfo"><div class="aname">writer-core</div><div class="amod">Gemini Pro · Generator</div></div><span style="font-size:8px;color:${C.muted}">IDLE</span></div>
    </div>
  </div>
</section>

<section class="stats">
  <div class="stats-inner">
    <div class="stat"><div class="stat-val">1<span>K+</span></div><div class="stat-label">Agents deployed</div></div>
    <div class="stat"><div class="stat-val">99<span>.9%</span></div><div class="stat-label">Uptime SLA</div></div>
    <div class="stat"><div class="stat-val">2<span>.3s</span></div><div class="stat-label">Avg task latency</div></div>
    <div class="stat"><div class="stat-val">12<span>M+</span></div><div class="stat-label">Tasks orchestrated</div></div>
  </div>
</section>

<section class="features">
  <div class="feat-label">CAPABILITIES</div>
  <h2>Everything you need to<br>run agents <span class="hl">at scale</span></h2>
  <div class="feat-grid">
    <div class="feat-card"><div class="feat-icon">🔭</div><div class="feat-name">Fleet Monitor</div><div class="feat-desc">Real-time status, load metrics, and throughput charts across your entire agent fleet.</div></div>
    <div class="feat-card"><div class="feat-icon">⛓</div><div class="feat-name">Pipeline Builder</div><div class="feat-desc">Visual stage-by-stage orchestration — chain agents with conditional logic and retry rules.</div></div>
    <div class="feat-card"><div class="feat-icon">📋</div><div class="feat-name">Run Audit Log</div><div class="feat-desc">Full execution history with task counts, latency, and error traces for every run.</div></div>
    <div class="feat-card"><div class="feat-icon">🔑</div><div class="feat-name">Granular Permissions</div><div class="feat-desc">Control write access, API egress, human-in-the-loop triggers, and per-model rate limits.</div></div>
    <div class="feat-card"><div class="feat-icon">🤖</div><div class="feat-name">Multi-Model</div><div class="feat-desc">Deploy GPT-4o, Claude 3.5, and Gemini agents side by side with unified billing.</div></div>
    <div class="feat-card"><div class="feat-icon">💸</div><div class="feat-name">Cost Guard Rails</div><div class="feat-desc">Auto-pause pipelines when spend exceeds thresholds. Never wake up to a surprise bill.</div></div>
  </div>
</section>

<section class="viewer-cta">
  <h2>Explore the design</h2>
  <p>5 screens · dark-mode · interactive Svelte mock</p>
  <div class="viewer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-g">Pencil viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-p">Interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <span class="footer-brand">RELAY</span>
  <span>Design by <span class="by-ram">RAM</span> · March 2026 · Inspired by Codegen.com agent OS trend</span>
</footer>
</body>
</html>`;
}

function buildViewerHtml() {
  const penJson = fs.readFileSync(path.join(__dirname, 'relay.pen'), 'utf8');
  const pen = JSON.parse(penJson);

  // Simple but functional viewer - renders first screen as SVG
  const screen = pen.screens[0];
  const canvasW = pen.canvas.width;
  const canvasH = pen.canvas.height;

  function elToSvg(el) {
    if (!el || !el.type) return '';
    switch (el.type) {
      case 'rect': {
        let s = `<rect x="${el.x||0}" y="${el.y||0}" width="${el.w||0}" height="${el.h||0}" rx="${el.rx||0}" fill="${el.fill||'none'}" opacity="${el.opacity??1}"`;
        if (el.stroke) s += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`;
        return s + '/>';
      }
      case 'text': {
        const anchor = el.align === 'center' ? 'middle' : el.align === 'right' ? 'end' : 'start';
        const fs = el.fontSize||12;
        const fw = el.fontWeight||400;
        const ff = el.fontFamily || 'system-ui';
        const ls = el.letterSpacing ? `letter-spacing="${el.letterSpacing}"` : '';
        const op = el.opacity ?? 1;
        const content = String(el.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return `<text x="${el.x||0}" y="${(el.y||0)+fs}" text-anchor="${anchor}" font-size="${fs}" font-weight="${fw}" font-family="${ff}" fill="${el.fill||'#fff'}" opacity="${op}" ${ls}>${content}</text>`;
      }
      case 'circle': {
        let s = `<circle cx="${el.cx||0}" cy="${el.cy||0}" r="${el.r||5}" fill="${el.fill||'none'}" opacity="${el.opacity??1}"`;
        if (el.stroke) s += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`;
        return s + '/>';
      }
      case 'line': {
        return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke||'#fff'}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity??0.5}"/>`;
      }
      case 'polygon': {
        return `<polygon points="${el.points}" fill="${el.fill||'none'}"/>`;
      }
      default: return '';
    }
  }

  const svgScreens = pen.screens.map((sc, idx) => {
    const svgEls = sc.elements.map(elToSvg).filter(Boolean).join('\n    ');
    return `<div class="screen ${idx===0?'active':''}" data-id="${sc.id}">
  <svg viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">
    ${svgEls}
  </svg>
</div>`;
  }).join('\n');

  const navBtns = pen.screens.map((sc, idx) =>
    `<button class="nav-btn ${idx===0?'active':''}" data-idx="${idx}">${sc.label}</button>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Design Viewer</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0A0A0C;color:#F0F0F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:32px 16px;}
  h1{font-size:13px;font-weight:300;letter-spacing:4px;color:#9191A8;margin-bottom:8px;text-align:center}
  .subtitle{font-size:11px;color:#5A5A6E;margin-bottom:24px;text-align:center}
  .nav{display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;justify-content:center}
  .nav-btn{font-size:11px;padding:5px 14px;border-radius:6px;border:1px solid #2C2C35;background:#1A1A1E;color:#9191A8;cursor:pointer;transition:all .2s}
  .nav-btn.active{background:rgba(124,111,255,.15);border-color:#7C6FFF;color:#7C6FFF}
  .frame{width:390px;max-width:100%;border-radius:32px;overflow:hidden;border:1px solid #2C2C35;box-shadow:0 32px 80px rgba(0,0,0,.7),0 0 0 1px rgba(124,111,255,.08),0 0 60px rgba(124,111,255,.12)}
  .screen{display:none} .screen.active{display:block}
  .links{margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
  .links a{font-size:12px;color:#7C6FFF;text-decoration:none;border:1px solid rgba(124,111,255,.3);padding:6px 16px;border-radius:6px}
</style>
</head>
<body>
<h1>RELAY</h1>
<div class="subtitle">The OS for AI Agent Orchestration · 5 screens</div>
<div class="nav">${navBtns}</div>
<div class="frame">
${svgScreens}
</div>
<div class="links">
  <a href="https://ram.zenbin.org/${SLUG}">← Hero page</a>
  <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive mock ☀◑</a>
</div>
<script>
const btns = document.querySelectorAll('.nav-btn');
const screens = document.querySelectorAll('.screen');
btns.forEach(btn => btn.addEventListener('click', () => {
  const idx = parseInt(btn.dataset.idx);
  btns.forEach(b => b.classList.remove('active'));
  screens.forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  screens[idx].classList.add('active');
}));
</script>
</body>
</html>`;
}

async function main() {
  console.log('\nPublishing Relay to ram.zenbin.org...\n');

  const heroHtml = buildHeroHtml();
  const viewerHtml = buildViewerHtml();

  const r1 = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: HTTP ${r1.status} → https://ram.zenbin.org/${SLUG}`);
  if (r1.status >= 300) console.log('  ', r1.body.slice(0,150));

  const r2 = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} Design Viewer`);
  console.log(`Viewer: HTTP ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
  if (r2.status >= 300) console.log('  ', r2.body.slice(0,150));

  console.log('\nPublish complete.');
  return { heroOk: r1.status < 300, viewerOk: r2.status < 300 };
}

main().catch(console.error);
