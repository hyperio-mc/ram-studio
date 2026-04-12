'use strict';
// publish-orbit2-heartbeat.js — Full Design Discovery pipeline for ORBIT (Mar 23 2026 run)

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'orbit';
const VIEWER_SLUG = 'orbit-viewer';
const APP_NAME    = 'ORBIT';
const TAGLINE     = 'Mission control for autonomous agents.';
const ARCHETYPE   = 'productivity';

// ── HTTP helper ─────────────────────────────────────────────────────────────
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

async function publishToZenbin(slug, title, html, subdomain) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain || 'ram',
    },
  }, body);
}

// ── SVG Thumbnail ───────────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const scaleX = tw / (screen.width || 390);
  const scaleY = th / (screen.height || 844);

  function renderNode(node, depth) {
    if (depth > 12) return '';
    const x = (node.x || 0) * scaleX;
    const y = (node.y || 0) * scaleY;
    const w = Math.max(0, (node.width || 0) * scaleX);
    const h = Math.max(0, (node.height || 0) * scaleY);
    const fill = node.fill || 'transparent';
    const r = node.cornerRadius ? node.cornerRadius * Math.min(scaleX, scaleY) : 0;
    let out = '';
    if (node.type === 'rect' || node.type === 'frame') {
      if (fill !== 'transparent') {
        out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + fill + '" rx="' + r.toFixed(1) + '"/>';
      }
    } else if (node.type === 'ellipse') {
      out += '<ellipse cx="' + (x+w/2).toFixed(1) + '" cy="' + (y+h/2).toFixed(1) + '" rx="' + (w/2).toFixed(1) + '" ry="' + (h/2).toFixed(1) + '" fill="' + fill + '"/>';
    } else if (node.type === 'text') {
      const fs = Math.max(4, (node.fontSize || 12) * Math.min(scaleX, scaleY));
      const c = node.color || fill;
      const safe = (node.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0, 40);
      out += '<text x="' + (x+1).toFixed(1) + '" y="' + (y+fs).toFixed(1) + '" font-size="' + fs.toFixed(1) + '" fill="' + c + '" font-family="system-ui,sans-serif" font-weight="' + (node.fontWeight||400) + '">' + safe + '</text>';
    }
    if (node.children) node.children.forEach(function(c){ out += renderNode(c, depth + 1); });
    return out;
  }

  const bg = screen.fill || '#0D0D10';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + tw + '" height="' + th + '" viewBox="0 0 ' + tw + ' ' + th + '"><rect width="' + tw + '" height="' + th + '" fill="' + bg + '"/>' + (screen.children||[]).map(function(c){ return renderNode(c, 0); }).join('') + '</svg>';
}

// ── Hero HTML ───────────────────────────────────────────────────────────────
function buildHeroHTML(penJson) {
  var screens = penJson.screens || [];
  var screenLabels = ['Command', 'Agents', 'Run Detail', 'Pipeline', 'Signals'];

  var thumbs = screens.map(function(sc, i) {
    var svg = screenThumbSVG(sc, 195, 422);
    var svgB64 = Buffer.from(svg).toString('base64');
    return '<div class="screen-card" style="animation-delay:' + (i*0.1) + 's"><div class="screen-label">' + (screenLabels[i]||'Screen '+(i+1)) + '</div><div class="screen-thumb"><img src="data:image/svg+xml;base64,' + svgB64 + '" width="195" height="422" alt="' + (screenLabels[i]) + '" loading="lazy"/></div></div>';
  }).join('');

  var heroThumbSVG = screens[0] ? screenThumbSVG(screens[0], 220, 478) : '';
  var heroThumbB64 = Buffer.from(heroThumbSVG).toString('base64');
  var shareText = encodeURIComponent('ORBIT — Mission control for autonomous agents. Dark AI ops dashboard by @ram_design_ai');

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ORBIT — Mission Control for Autonomous Agents · RAM Design Studio</title><meta name="description" content="Dark mode AI agent ops dashboard. Inspired by Linear UI discipline + JetBrains Air agent orchestration."><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0D0D10;color:#EEEAF8;font-family:Inter,system-ui,sans-serif;min-height:100vh}a{text-decoration:none;color:inherit}nav{display:flex;align-items:center;justify-content:space-between;padding:18px 32px;border-bottom:1px solid rgba(123,110,246,.12);background:#0D0D10;position:sticky;top:0;z-index:100}.nav-logo{font-size:18px;font-weight:800;letter-spacing:-.03em}.nav-logo span{color:#7B6EF6}.nav-meta{font-size:11px;color:#5E5A7A}.banner{background:linear-gradient(90deg,rgba(123,110,246,.18),rgba(52,200,160,.12));padding:10px 32px;text-align:center;border-bottom:1px solid rgba(123,110,246,.15)}.banner p{font-size:12px;font-weight:600;color:#A99EFA;letter-spacing:.06em}.hero{padding:72px 32px 56px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}.hero-label{font-size:11px;font-weight:700;letter-spacing:.12em;color:#7B6EF6;margin-bottom:14px;text-transform:uppercase}.hero-title{font-size:52px;font-weight:800;line-height:1.05;letter-spacing:-.04em;color:#EEEAF8;margin-bottom:20px}.hero-title span{color:#7B6EF6}.hero-sub{font-size:16px;line-height:1.65;color:#9994BB;margin-bottom:32px;max-width:420px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}.btn-p{background:#7B6EF6;color:#EEEAF8}.btn-p:hover{background:#9384F8}.btn-mock{background:#34C8A0;color:#0D0D10}.btn-mock:hover{background:#2EB892}.btn-s{background:transparent;color:#9994BB;border:1.5px solid rgba(123,110,246,.2)}.btn-s:hover{border-color:#7B6EF6}.btn-x{background:transparent;color:#9994BB;border:1.5px solid rgba(123,110,246,.2)}.hero-visual{display:flex;justify-content:center}.phone-wrap{position:relative;width:220px;height:478px}.phone-shell{width:220px;height:478px;border-radius:36px;background:#16161C;box-shadow:0 32px 80px rgba(0,0,0,.6),0 0 0 1px rgba(123,110,246,.18),0 2px 8px rgba(0,0,0,.4);overflow:hidden;border:2px solid rgba(123,110,246,.2)}.phone-screen{width:100%;height:100%;overflow:hidden}.phone-notch{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:70px;height:14px;background:#0D0D10;border-radius:8px;z-index:10}.inspiration{background:#16161C;border:1px solid rgba(123,110,246,.12);border-radius:14px;padding:28px;margin:0 32px 40px;max-width:1036px;margin-left:auto;margin-right:auto}.inspiration h3{font-size:11px;font-weight:700;letter-spacing:.1em;color:#5E5A7A;text-transform:uppercase;margin-bottom:16px}.insp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.insp-item{padding:16px;background:#1E1E28;border-radius:10px;border:1px solid rgba(123,110,246,.1)}.insp-site{font-size:11px;font-weight:700;color:#7B6EF6;margin-bottom:6px}.insp-text{font-size:12px;line-height:1.55;color:#9994BB}.screens-section{padding:0 32px 64px;max-width:1100px;margin:0 auto}.section-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5E5A7A;margin-bottom:24px}.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}.screen-card{opacity:0;animation:fadeUp .5s ease forwards}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.screen-label{font-size:11px;font-weight:600;color:#5E5A7A;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em}.screen-thumb{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.5);border:1px solid rgba(123,110,246,.12);background:#16161C}.screen-thumb img{display:block;width:100%;height:auto}.decisions{background:#16161C;border:1px solid rgba(123,110,246,.12);border-radius:14px;padding:32px;margin:0 32px 64px;max-width:1036px;margin-left:auto;margin-right:auto}.decisions h3{font-size:11px;font-weight:700;letter-spacing:.1em;color:#5E5A7A;text-transform:uppercase;margin-bottom:20px}.decision-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.decision-item{padding:20px;background:#1E1E28;border-radius:10px;border:1px solid rgba(123,110,246,.1)}.decision-num{font-size:11px;font-weight:700;color:#7B6EF6;margin-bottom:8px}.decision-title{font-size:14px;font-weight:600;color:#EEEAF8;margin-bottom:6px}.decision-body{font-size:12px;line-height:1.6;color:#9994BB}.palette-section{padding:0 32px 64px;max-width:1100px;margin:0 auto}.palette-row{display:flex;gap:12px;flex-wrap:wrap}.swatch{display:flex;flex-direction:column;align-items:center;gap:8px}.swatch-dot{width:56px;height:56px;border-radius:50%;border:1.5px solid rgba(255,255,255,.08)}.swatch-name{font-size:10px;font-weight:600;color:#5E5A7A}.swatch-hex{font-size:10px;color:#5E5A7A;font-family:monospace}.live-indicator{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;color:#34C8A0;letter-spacing:.08em}.live-dot{width:7px;height:7px;border-radius:50%;background:#34C8A0;animation:pulse 1.5s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}footer{padding:32px;text-align:center;border-top:1px solid rgba(123,110,246,.1);color:#5E5A7A;font-size:12px}footer span{color:#7B6EF6;font-weight:600}@media(max-width:768px){.hero{grid-template-columns:1fr;gap:32px;padding:40px 20px}.hero-title{font-size:36px}.screens-grid{grid-template-columns:repeat(2,1fr)}.insp-grid,.decision-grid{grid-template-columns:1fr}.hero-visual{display:none}}</style></head><body>'
    + '<nav><div class="nav-logo"><span>O</span>RBIT</div><div class="nav-meta">RAM Design Studio · March 2026 Heartbeat</div></nav>'
    + '<div class="banner"><p>◉ DARK THEME · AI AGENT MISSION CONTROL · INSPIRED BY LINEAR + JETBRAINS AIR + PAPERCLIP</p></div>'
    + '<div class="hero"><div class="hero-text"><div class="hero-label">RAM Design Heartbeat · Mar 2026</div><h1 class="hero-title">Mission control<br>for autonomous <span>agents</span>.</h1><p class="hero-sub">ORBIT monitors your entire AI agent fleet — live runs, task queues, anomaly signals — from a single dark command center. ORB-numbered operations. Electric indigo state coding. Zero chaos.</p><div class="hero-actions"><a class="btn btn-p" href="https://ram.zenbin.org/' + VIEWER_SLUG + '" target="_blank">◉ Open Viewer</a><a class="btn btn-mock" href="https://ram.zenbin.org/orbit-mock" target="_blank">✦ Interactive Mock ☀◑</a><a class="btn btn-x" href="https://x.com/intent/tweet?text=' + shareText + '&url=https://ram.zenbin.org/' + SLUG + '" target="_blank">𝕏 Share</a><a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a></div><div style="margin-top:20px"><span class="live-indicator"><span class="live-dot"></span>12 AGENTS ONLINE</span></div></div>'
    + '<div class="hero-visual"><div class="phone-wrap"><div class="phone-notch"></div><div class="phone-shell"><div class="phone-screen"><img src="data:image/svg+xml;base64,' + heroThumbB64 + '" width="220" height="478" alt="ORBIT Command" style="width:100%;height:100%;object-fit:cover"/></div></div></div></div></div>'
    + '<div class="inspiration"><h3>Inspiration Sources</h3><div class="insp-grid"><div class="insp-item"><div class="insp-site">Linear — darkmodedesign.com</div><div class="insp-text">Featured prominently on the dark mode showcase. Ultra-clean #0D0D10 near-black canvas, electric indigo sidebar accents, issue-tracker discipline with left-border color coding on every row. The benchmark for dark SaaS.</div></div><div class="insp-item"><div class="insp-site">JetBrains Air + Paperclip — lapa.ninja</div><div class="insp-text">"Multitask with agents, stay in control" (JetBrains Air) and "Open-source orchestration for zero-human companies" (Paperclip). Two new landing pages on Lapa signaling that agent fleet management UI is the emergent category right now.</div></div><div class="insp-item"><div class="insp-site">Evervault Customers — godly.website</div><div class="insp-text">Dark card grid with subtle borders, bold headings, technical/security aesthetic from godly.website. The compact row + left-accent-border pattern translated directly into ORBIT\'s agent roster and run cards.</div></div></div></div>'
    + '<div class="screens-section"><div class="section-label">5 Screens</div><div class="screens-grid">' + thumbs + '</div></div>'
    + '<div class="decisions"><h3>Design Decisions</h3><div class="decision-grid"><div class="decision-item"><div class="decision-num">01</div><div class="decision-title">Two-color signal system</div><div class="decision-body">Indigo (#7B6EF6) = active/in-progress. Teal (#34C8A0) = success/online. Amber = warning. Red = error. Borrowed from Linear\'s color semantics — each hue owns exactly one meaning across all 5 screens.</div></div><div class="decision-item"><div class="decision-num">02</div><div class="decision-title">ORB-XXXX run numbering</div><div class="decision-body">Each agent run gets a sequential ORB-numbered ID. Borrowed from Linear\'s issue numbering system and Silencio.es\'s reference-artifact concept. Makes every run feel tracked and accountable, not a fire-and-forget API call.</div></div><div class="decision-item"><div class="decision-num">03</div><div class="decision-title">Compact rows over card grids</div><div class="decision-body">Agent roster and pipeline use 56px rows with status dot + left-border coding. Maximizes information density — scan 10 agents without scrolling. Same logic Linear uses for issue lists: density is a feature when you\'re managing a fleet.</div></div></div></div>'
    + '<div class="palette-section"><div class="section-label">Color Palette</div><div class="palette-row">'
    + [['Near Black','#0D0D10'],['Surface','#16161C'],['Surface 2','#1E1E28'],['Text','#EEEAF8'],['Mid','#9994BB'],['Dim','#5E5A7A'],['Indigo','#7B6EF6'],['Indigo Lt','#A99EFA'],['Teal','#34C8A0'],['Amber','#F5A623'],['Red','#E5534B']].map(function(p){ return '<div class="swatch"><div class="swatch-dot" style="background:'+p[1]+'"></div><div class="swatch-name">'+p[0]+'</div><div class="swatch-hex">'+p[1]+'</div></div>'; }).join('')
    + '</div></div>'
    + '<footer><p>Designed by <span>RAM</span> · RAM Design Studio · March 2026</p><p style="margin-top:8px">Inspired by Linear · JetBrains Air · Paperclip · Evervault</p></footer></body></html>';
}

// ── Viewer HTML ─────────────────────────────────────────────────────────────
function buildViewerHTML(penJson) {
  var penJsonStr = JSON.stringify(JSON.stringify(penJson));
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ORBIT — Viewer</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0A0A0D;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;padding:24px}h1{color:#EEEAF8;font-size:18px;font-weight:700;margin-bottom:6px;letter-spacing:-.02em}h1 span{color:#7B6EF6}.sub{color:#5E5A7A;font-size:12px;margin-bottom:28px}.screens{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:1200px}.sc{display:flex;flex-direction:column;align-items:center;gap:8px}.sc-label{font-size:10px;font-weight:600;color:#5E5A7A;text-transform:uppercase;letter-spacing:.08em}.sc-frame{width:195px;height:422px;border-radius:24px;overflow:hidden;border:1.5px solid rgba(123,110,246,.2);background:#16161C;box-shadow:0 8px 32px rgba(0,0,0,.6)}footer{margin-top:32px;color:#5E5A7A;font-size:11px}</style>'
    + '<script>window.EMBEDDED_PEN = ' + penJsonStr + ';</script>'
    + '</head><body><h1><span>O</span>RBIT — Viewer</h1><p class="sub">Mission control for autonomous agents · RAM Design Heartbeat · March 2026</p><div class="screens" id="screens"></div><footer>RAM Design Studio · ram.zenbin.org/orbit</footer>'
    + '<script>(function(){try{var pen=JSON.parse(window.EMBEDDED_PEN);var screens=pen.screens||[];var labels=["Command","Agents","Run Detail","Pipeline","Signals"];var W=390,H=844,tw=195,th=422,sx=tw/W,sy=th/H;function rn(n,d){if(d>12)return "";var x=(n.x||0)*sx,y=(n.y||0)*sy,w=Math.max(0,(n.width||0)*sx),h=Math.max(0,(n.height||0)*sy),fill=n.fill||"transparent",r=n.cornerRadius?n.cornerRadius*Math.min(sx,sy):0,out="";if(n.type==="rect"||n.type==="frame"){if(fill!=="transparent")out+=\'<rect x="\'+x.toFixed(1)+\'" y="\'+y.toFixed(1)+\'" width="\'+w.toFixed(1)+\'" height="\'+h.toFixed(1)+\'" fill="\'+fill+\'" rx="\'+r.toFixed(1)+\'"/>\'}else if(n.type==="ellipse"){out+=\'<ellipse cx="\'+((x+w/2).toFixed(1))+\'" cy="\'+((y+h/2).toFixed(1))+\'" rx="\'+((w/2).toFixed(1))+\'" ry="\'+((h/2).toFixed(1))+\'" fill="\'+fill+\'"/>\'}else if(n.type==="text"){var fs=Math.max(4,(n.fontSize||12)*Math.min(sx,sy)),c=n.color||fill,safe=(n.content||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").slice(0,40);out+=\'<text x="\'+((x+1).toFixed(1))+\'" y="\'+((y+fs).toFixed(1))+\'" font-size="\'+fs.toFixed(1)+\'" fill="\'+c+\'" font-family="system-ui,sans-serif" font-weight="\'+((n.fontWeight||400))+\'">\'+safe+"</text>"}if(n.children)n.children.forEach(function(c){out+=rn(c,d+1)});return out}var cont=document.getElementById("screens");screens.forEach(function(sc,i){var bg=sc.fill||"#0D0D10",svgC=(sc.children||[]).map(function(c){return rn(c,0)}).join(""),svg=\'<svg xmlns="http://www.w3.org/2000/svg" width="\'+tw+\'" height="\'+th+\'" viewBox="0 0 \'+tw+" "+th+\'"><rect width="\'+tw+\'" height="\'+th+\'" fill="\'+bg+\'"/>\'+svgC+"</svg>",div=document.createElement("div");div.className="sc";div.innerHTML=\'<div class="sc-label">\'+((labels[i]||"Screen "+(i+1)))+\'</div><div class="sc-frame">\'+svg+"</div>";cont.appendChild(div)})}catch(e){document.body.innerHTML+="<p style=color:#E5534B;margin-top:20px>Render error: "+e.message+"</p>"}})();</script>'
    + '</body></html>';
}

// ── Main pipeline ────────────────────────────────────────────────────────────
(async function() {
  console.log('=== ORBIT Design Discovery Pipeline (Mar 23 2026) ===\n');

  var penPath = path.join(__dirname, 'orbit.pen');
  var penJson = JSON.parse(fs.readFileSync(penPath, 'utf8'));
  console.log('✓ Loaded orbit.pen (' + (fs.statSync(penPath).size / 1024).toFixed(1) + ' KB)');

  // 5a — Hero
  console.log('\n── 5a: Publishing hero page…');
  var heroHtml = buildHeroHTML(penJson);
  var heroRes = await publishToZenbin(SLUG, 'ORBIT — ' + TAGLINE + ' · RAM Design Studio', heroHtml, 'ram');
  console.log('   Status: ' + heroRes.status + '  → https://ram.zenbin.org/' + SLUG);

  // 5b — Viewer
  console.log('\n── 5b: Publishing viewer page…');
  var viewerHtml = buildViewerHTML(penJson);
  var viewerRes = await publishToZenbin(VIEWER_SLUG, 'ORBIT — Viewer', viewerHtml, 'ram');
  console.log('   Status: ' + viewerRes.status + '  → https://ram.zenbin.org/' + VIEWER_SLUG);

  // 5d — GitHub gallery queue
  console.log('\n── 5d: Updating GitHub gallery queue…');
  var getRes = await httpsReq({
    hostname: 'api.github.com',
    path: '/repos/' + GITHUB_REPO + '/contents/queue.json',
    method: 'GET',
    headers: {
      'Authorization': 'token ' + GITHUB_TOKEN,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (getRes.status !== 200) {
    console.error('   Failed to fetch queue.json:', getRes.body.slice(0, 200));
  } else {
    var fileData = JSON.parse(getRes.body);
    var currentSha = fileData.sha;
    var currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
    var queue = JSON.parse(currentContent);
    if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
    if (!queue.submissions) queue.submissions = [];

    var newEntry = {
      id: 'heartbeat-orbit2-' + Date.now(),
      status: 'done',
      app_name: APP_NAME,
      tagline: TAGLINE,
      archetype: ARCHETYPE,
      design_url: 'https://ram.zenbin.org/' + SLUG,
      viewer_url: 'https://ram.zenbin.org/' + VIEWER_SLUG,
      mock_url: 'https://ram.zenbin.org/orbit-mock',
      submitted_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      credit: 'RAM Design Heartbeat',
      prompt: 'Dark AI agent mission control. Linear dark mode + JetBrains Air agent orchestration category + Paperclip zero-human companies. #0D0D10 near-black, electric indigo #7B6EF6, teal #34C8A0. ORB-numbered runs. 5 screens: Command, Agents, Run Detail, Pipeline, Signals.',
      screens: 5,
      source: 'heartbeat',
      theme: 'dark',
    };

    queue.submissions.push(newEntry);
    queue.updated_at = new Date().toISOString();

    var newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    var putBody = JSON.stringify({
      message: 'add: ORBIT (dark) to gallery (heartbeat Mar 23)',
      content: newContent,
      sha: currentSha,
    });

    var putRes = await httpsReq({
      hostname: 'api.github.com',
      path: '/repos/' + GITHUB_REPO + '/contents/queue.json',
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + GITHUB_TOKEN,
        'User-Agent': 'ram-heartbeat/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putBody),
        'Accept': 'application/vnd.github.v3+json',
      },
    }, putBody);

    console.log('   Status: ' + (putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0, 100)));
  }

  console.log('\n=== Pipeline complete ===');
  console.log('  Hero:    https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer:  https://ram.zenbin.org/' + VIEWER_SLUG);
  console.log('  Mock:    https://ram.zenbin.org/orbit-mock (mock script runs separately)');
})().catch(function(err){ console.error('Pipeline error:', err); process.exit(1); });
