'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'vitals';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'X-Subdomain': 'ram' },
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
    req.on('error', reject); req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

const VOID   = '#030014';
const SURF   = '#0D0A1F';
const CARD   = '#141028';
const TEXT   = 'rgba(255,255,255,0.92)';
const CORAL  = '#FC5F2B';
const PURPLE = '#7B4FE9';
const TEAL   = '#00C9D4';
const GREEN  = '#00B982';
const AMBER  = '#FCA311';

function screenSvg(screen) {
  const els = screen.elements || [];
  let out = '';
  for (const e of els) {
    if (e.type==='rect') {
      const rx=e.rx||0, op=e.opacity!==undefined?e.opacity:1;
      const sk=e.stroke&&e.stroke!=='none'?`stroke="${e.stroke}" stroke-width="${e.sw||1}"`:'';
      out+=`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${rx}" fill="${e.fill}" opacity="${op}" ${sk}/>`;
    } else if (e.type==='text') {
      const op=e.opacity!==undefined?e.opacity:1;
      const ls=e.ls?`letter-spacing="${e.ls}"`:'';
      const safe=String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      out+=`<text x="${e.x}" y="${e.y}" font-size="${e.size}" fill="${e.fill}" font-weight="${e.fw||400}" text-anchor="${e.anchor||'start'}" opacity="${op}" ${ls}>${safe}</text>`;
    } else if (e.type==='circle') {
      const op=e.opacity!==undefined?e.opacity:1;
      const sk=e.stroke&&e.stroke!=='none'?`stroke="${e.stroke}" stroke-width="${e.sw||1}"`:'';
      out+=`<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${op}" ${sk}/>`;
    } else if (e.type==='line') {
      const op=e.opacity!==undefined?e.opacity:1;
      out+=`<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.sw||1}" opacity="${op}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${out}</svg>`;
}

const svgUris = pen.screens.map(s => 'data:image/svg+xml;base64,' + Buffer.from(screenSvg(s)).toString('base64'));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VITALS — Personal Health Dashboard</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --void:${VOID};--surf:${SURF};--card:${CARD};
    --coral:${CORAL};--purple:${PURPLE};--teal:${TEAL};--green:${GREEN};--amber:${AMBER};
  }
  body{background:var(--void);color:rgba(255,255,255,0.92);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* STAR FIELD */
  .stars{position:fixed;inset:0;pointer-events:none;z-index:0}
  .star{position:absolute;border-radius:50%;background:rgba(255,255,255,0.35);animation:twinkle var(--d,3s) ease-in-out infinite var(--delay,0s)}
  @keyframes twinkle{0%,100%{opacity:0.35}50%{opacity:0.8}}

  /* HERO */
  .hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;
    padding:80px 56px;position:relative;z-index:1;overflow:hidden}
  .hero-glow{position:absolute;width:500px;height:500px;border-radius:50%;
    background:radial-gradient(circle,rgba(123,79,233,0.15) 0%,transparent 65%);
    top:-100px;right:-100px;pointer-events:none}
  .hero-glow2{position:absolute;width:400px;height:400px;border-radius:50%;
    background:radial-gradient(circle,rgba(0,185,130,0.1) 0%,transparent 65%);
    bottom:-80px;left:-60px;pointer-events:none}
  .eyebrow{display:inline-flex;align-items:center;gap:8px;
    background:rgba(123,79,233,0.12);border:1px solid rgba(123,79,233,0.3);
    border-radius:100px;padding:6px 16px;font-size:10px;font-weight:600;
    color:var(--purple);letter-spacing:.12em;text-transform:uppercase;margin-bottom:28px;width:fit-content}
  .live-dot{width:6px;height:6px;background:var(--green);border-radius:50%;animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
  h1{font-size:clamp(72px,10vw,116px);font-weight:900;line-height:.88;letter-spacing:-.03em;margin-bottom:24px}
  .hero-sub{font-size:18px;line-height:1.65;color:rgba(255,255,255,0.55);max-width:520px;margin-bottom:40px}
  .ctas{display:flex;gap:14px;flex-wrap:wrap}
  .btn-p{background:var(--purple);color:#fff;padding:13px 28px;border-radius:8px;
    font-size:14px;font-weight:600;text-decoration:none;transition:opacity .15s,transform .15s}
  .btn-p:hover{opacity:.85;transform:translateY(-1px)}
  .btn-s{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);
    color:rgba(255,255,255,0.85);padding:13px 28px;border-radius:8px;
    font-size:14px;font-weight:500;text-decoration:none;transition:border-color .15s}
  .btn-s:hover{border-color:var(--purple)}
  .metric-strip{display:flex;gap:0;margin-top:52px;padding:0;
    border:1px solid rgba(255,255,255,0.06);border-radius:14px;background:${CARD};overflow:hidden}
  .metric-item{flex:1;padding:20px 0;text-align:center;position:relative}
  .metric-item+.metric-item::before{content:'';position:absolute;left:0;top:20%;height:60%;width:1px;background:rgba(255,255,255,0.07)}
  .m-val{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
  .m-lab{font-size:10px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:.08em;margin-top:3px}

  /* TICKER */
  .ticker{background:rgba(123,79,233,0.08);border-top:1px solid rgba(123,79,233,0.15);
    border-bottom:1px solid rgba(123,79,233,0.15);padding:9px 0;overflow:hidden;white-space:nowrap;position:relative;z-index:1}
  .ticker-inner{display:inline-flex;animation:tick 30s linear infinite}
  .ti{font-size:10px;font-weight:600;color:rgba(255,255,255,0.35);padding:0 24px;letter-spacing:.1em;text-transform:uppercase}
  @keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

  /* HUE SYSTEM SECTION */
  .hue-section{padding:80px 56px;position:relative;z-index:1}
  .section-eyebrow{font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;color:rgba(255,255,255,0.4)}
  .section-title{font-size:clamp(26px,3.5vw,44px);font-weight:700;margin-bottom:40px}
  .hue-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;max-width:1100px}
  .hue-card{border-radius:14px;padding:24px;border:1px solid rgba(255,255,255,0.06)}
  .hue-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:12px}
  .hue-name{font-size:13px;font-weight:600;margin-bottom:4px}
  .hue-desc{font-size:11px;color:rgba(255,255,255,0.45);line-height:1.6}
  .hue-hex{font-size:10px;margin-top:8px;font-variant-numeric:tabular-nums;opacity:.5}

  /* SCREENS */
  .screens{padding:80px 56px;position:relative;z-index:1}
  .screens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:16px;max-width:1280px;margin:40px auto 0}
  .scard{background:${CARD};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);transition:transform .2s,box-shadow .2s}
  .scard:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,0.5)}
  .scard img{width:100%;display:block}
  .scard-label{padding:10px 14px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);border-top:1px solid rgba(255,255,255,0.05)}

  /* PALETTE */
  .palette{padding:60px 56px;background:${SURF};position:relative;z-index:1}
  .swatches{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
  .sw{flex:1;min-width:80px;height:68px;border-radius:10px;padding:10px 12px;
    display:flex;flex-direction:column;justify-content:flex-end}
  .sw-name{font-size:8px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:2px}
  .sw-hex{font-size:8px;color:rgba(255,255,255,0.4)}

  footer{background:#000;text-align:center;padding:40px 24px;font-size:11px;color:rgba(255,255,255,0.3);position:relative;z-index:1}
  footer a{color:var(--purple);text-decoration:none}
  @media(max-width:640px){.hero,.hue-section,.screens,.palette{padding:80px 24px 48px}.metric-strip{flex-wrap:wrap}}
</style>
</head>
<body>

<!-- Star field -->
<div class="stars" aria-hidden="true">
${Array.from({length:28},(_,i)=>{
  const x=Math.random()*100,y=Math.random()*100,sz=Math.random()*2+1;
  const d=(2+Math.random()*4).toFixed(1)+'s',delay=(Math.random()*3).toFixed(1)+'s';
  return `<div class="star" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px;--d:${d};--delay:${delay}"></div>`;
}).join('')}
</div>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>
  <div class="eyebrow"><span class="live-dot"></span> Heartbeat #49 · Dark · Health</div>
  <h1>VITALS</h1>
  <p class="hero-sub">Personal health dashboard where every metric owns its own colour — HRV, heart rate, sleep, and recovery each mapped to a distinct hue, borrowed from Phantom's per-section colour system on Godly.</p>
  <div class="ctas">
    <a href="https://ram.zenbin.org/vitals-viewer" class="btn-p">View in Pencil.dev →</a>
    <a href="https://ram.zenbin.org/vitals-mock" class="btn-s">Interactive Mock ☀◑</a>
  </div>
  <div class="metric-strip">
    <div class="metric-item"><div class="m-val" style="color:${GREEN}">83</div><div class="m-lab">Readiness</div></div>
    <div class="metric-item"><div class="m-val" style="color:${CORAL}">62</div><div class="m-lab">Resting HR</div></div>
    <div class="metric-item"><div class="m-val" style="color:${TEAL}">68ms</div><div class="m-lab">HRV</div></div>
    <div class="metric-item"><div class="m-val" style="color:${PURPLE}">91</div><div class="m-lab">Sleep Score</div></div>
  </div>
</section>

<div class="ticker"><div class="ticker-inner">
${['TODAY','HEART RATE','HRV','SLEEP','RECOVERY','INSIGHTS','READINESS','OPTIMAL','ZONE 2','REM','DEEP SLEEP','RMSSD'].map(t=>
  `<span class="ti">${t} ·</span>`).join('').repeat(2)}
</div></div>

<section class="hue-section">
  <div class="section-eyebrow">Per-Metric Hue System</div>
  <div class="section-title">Every Metric, Its Own Colour</div>
  <div class="hue-grid">
    ${[
      {col:CORAL,  name:'Heart Rate',  desc:'Resting, zones, 24-hour trend. Coral from Superpower\'s health diagnostics brand.',   hex:CORAL  },
      {col:PURPLE, name:'Sleep',       desc:'Stages, timeline, quality score. Deep purple from Reflect\'s #030014 substrate.',       hex:PURPLE },
      {col:TEAL,   name:'HRV',         desc:'RMSSD, 30-day trend, training readiness. Teal for precision data signal.',              hex:TEAL   },
      {col:GREEN,  name:'Recovery',    desc:'Daily score, load vs recovery balance. Green for positive/restorative states.',         hex:GREEN  },
      {col:AMBER,  name:'Stress',      desc:'Elevated stress %, AI-generated insights. Amber as universal caution signal.',          hex:AMBER  },
    ].map(h=>`<div class="hue-card" style="background:rgba(${parseInt(h.col.slice(1,3),16)},${parseInt(h.col.slice(3,5),16)},${parseInt(h.col.slice(5,7),16)},0.08);border-color:rgba(${parseInt(h.col.slice(1,3),16)},${parseInt(h.col.slice(3,5),16)},${parseInt(h.col.slice(5,7),16)},0.2)">
      <div class="hue-icon" style="background:rgba(${parseInt(h.col.slice(1,3),16)},${parseInt(h.col.slice(3,5),16)},${parseInt(h.col.slice(5,7),16)},0.15);color:${h.col}">◉</div>
      <div class="hue-name" style="color:${h.col}">${h.name}</div>
      <div class="hue-desc">${h.desc}</div>
      <div class="hue-hex">${h.hex}</div>
    </div>`).join('')}
  </div>
</section>

<section class="screens">
  <div class="section-eyebrow">6 screens · 521 elements</div>
  <div class="section-title">The Full Picture</div>
  <div class="screens-grid">
    ${pen.screens.map((s,i)=>`
    <div class="scard">
      <img src="${svgUris[i]}" alt="${s.name}" loading="lazy">
      <div class="scard-label">${['01','02','03','04','05','06'][i]} ${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<section class="palette">
  <div class="section-eyebrow">Palette</div>
  <div class="section-title">Purple-Black + Five Signals</div>
  <div class="swatches">
    ${[
      {col:VOID,  name:'Void'  },
      {col:SURF,  name:'Surface'},
      {col:CARD,  name:'Card'  },
      {col:CORAL, name:'Coral' },
      {col:PURPLE,name:'Purple'},
      {col:TEAL,  name:'Teal'  },
      {col:GREEN, name:'Green' },
      {col:AMBER, name:'Amber' },
    ].map(s=>`<div class="sw" style="background:${s.col}"><div class="sw-name">${s.name}</div><div class="sw-hex">${s.col}</div></div>`).join('')}
  </div>
</section>

<footer>
  VITALS · Heartbeat #49 · RAM Design Studio · <a href="https://ram.zenbin.org">ram.zenbin.org</a><br>
  <span style="margin-top:6px;display:inline-block">Inspired by Reflect's #030014 purple-black · Phantom's per-section hue model · Augen's four-accent signal system (Godly.website)</span>
</footer>

</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'VITALS — Personal Health Dashboard');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'VITALS — Pencil.dev Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
