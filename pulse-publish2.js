'use strict';
const fs = require('fs');
const https = require('https');

const SLUG   = 'pulse-voice';
const HOST   = 'ram.zenbin.org';
const SUBDOM = 'ram';

function zenPut(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const opts = {
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOM,
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Pulse — AI Voice Journal</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#0C0909;--surface:#181212;--surface2:#221A1A;
    --amber:#F5A623;--amber2:#FF6B35;--amberDim:rgba(245,166,35,0.12);
    --text:#F0EBE3;--textMid:rgba(240,235,227,0.55);--textDim:rgba(240,235,227,0.3);
    --green:#52C98A;--red:#E05252;
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh;overflow-x:hidden}
  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;text-align:center}
  .eyebrow{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--amber);text-transform:uppercase;margin-bottom:24px;opacity:0.8}
  h1{font-size:clamp(48px,8vw,88px);font-weight:300;line-height:1.05;letter-spacing:-3px;color:var(--text);max-width:800px}
  h1 em{font-style:italic;color:var(--amber)}
  .tagline{font-size:clamp(16px,2vw,21px);color:var(--textMid);max-width:480px;line-height:1.6;margin:28px auto 0}
  .cta-row{display:flex;gap:16px;justify-content:center;margin-top:48px;flex-wrap:wrap}
  .btn{padding:14px 32px;border-radius:40px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;transition:all 0.2s}
  .btn-primary{background:var(--amber);color:#0C0909}
  .btn-primary:hover{background:#ffc04a;transform:translateY(-2px)}
  .btn-ghost{border:1px solid rgba(240,235,227,0.18);color:var(--textMid)}
  .btn-ghost:hover{border-color:var(--amber);color:var(--amber)}
  .waveform-hero{display:flex;align-items:center;justify-content:center;gap:3px;height:80px;margin:56px auto 24px;max-width:580px;width:100%}
  .wbar{background:var(--amber);border-radius:3px;width:5px;opacity:0.65;animation:wave 1.6s ease-in-out infinite}
  .wbar:nth-child(2n){opacity:0.35}
  @keyframes wave{0%,100%{transform:scaleY(0.9)}50%{transform:scaleY(1.4)}}
  .meta{color:var(--textDim);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:8px}

  .section{padding:80px 24px;max-width:1100px;margin:0 auto}
  .section-label{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--amber);text-transform:uppercase;text-align:center;margin-bottom:16px;opacity:0.7}
  .section h2{font-size:clamp(26px,4vw,44px);font-weight:300;letter-spacing:-1px;color:var(--text);text-align:center;margin-bottom:12px}
  .section .sub{text-align:center;color:var(--textMid);font-size:15px;margin-bottom:48px}

  .screen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px}
  .screen-card{background:var(--surface);border-radius:18px;overflow:hidden;border:1px solid rgba(245,166,35,0.07);transition:all 0.22s;cursor:pointer;padding:20px}
  .screen-card:hover{border-color:rgba(245,166,35,0.28);transform:translateY(-3px)}
  .sc-icon{font-size:22px;margin-bottom:12px}
  .sc-name{font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px}
  .sc-desc{font-size:12px;color:var(--textMid);line-height:1.5}
  .sc-wave{display:flex;align-items:center;gap:2px;height:24px;margin-top:14px}
  .sc-wbar{background:var(--amber);border-radius:2px;width:3px;opacity:0.45}

  .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px}
  .feature{padding:28px;background:var(--surface);border-radius:14px;border:1px solid rgba(245,166,35,0.05)}
  .feature-icon{font-size:26px;margin-bottom:14px}
  .feature h3{font-size:17px;font-weight:600;margin-bottom:9px;color:var(--text)}
  .feature p{font-size:13px;color:var(--textMid);line-height:1.65}
  code{background:rgba(245,166,35,0.12);color:var(--amber);padding:2px 6px;border-radius:4px;font-size:11px}

  .palette-row{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:28px}
  .swatch{width:72px;height:72px;border-radius:10px;display:flex;align-items:flex-end;justify-content:center;padding:6px}
  .swatch span{font-size:9px;font-weight:700;opacity:0.75;text-transform:uppercase}

  .note{display:flex;gap:18px;margin-bottom:26px;padding-bottom:26px;border-bottom:1px solid rgba(240,235,227,0.05)}
  .note:last-child{border-bottom:none}
  .note-num{font-size:12px;font-weight:700;color:var(--amber);min-width:26px;padding-top:2px}
  .note h4{font-size:15px;font-weight:600;margin-bottom:7px;color:var(--text)}
  .note p{font-size:13px;color:var(--textMid);line-height:1.65}

  footer{text-align:center;padding:36px 24px;color:var(--textDim);font-size:12px;border-top:1px solid rgba(245,166,35,0.05)}
  footer a{color:var(--amber);text-decoration:none}
</style>
</head>
<body>

<section class="hero">
  <p class="eyebrow">RAM Design · March 2026</p>
  <h1>Your thoughts,<br/><em>captured</em> in voice</h1>
  <p class="tagline">Pulse records you throughout the day, then synthesises it into AI-powered insights, mood arcs, and personalised audio digests.</p>
  <div class="cta-row">
    <a href="/pulse-voice-viewer" class="btn btn-primary">View Prototype →</a>
    <a href="/pulse-voice-mock" class="btn btn-ghost">Interactive Mock ☀◑</a>
  </div>
  <div class="waveform-hero">
    ${Array.from({length:56},(_,i)=>{
      const h=16+Math.abs(Math.sin(i*0.42+1)*52);
      const d=(i*0.055).toFixed(2);
      return `<div class="wbar" style="height:${h.toFixed(0)}px;animation-delay:${d}s"></div>`;
    }).join('')}
  </div>
  <p class="meta">Dark Mode · 6 Screens · Voice-First UI</p>
</section>

<section class="section">
  <p class="section-label">The Prototype</p>
  <h2>Six screens, one continuous thread</h2>
  <p class="sub">Every feature follows audio as the primary interface.</p>
  <div class="screen-grid">
    ${[
      {icon:'◉',name:'Today',desc:'Voice entries with waveform hero and AI-generated title'},
      {icon:'⊕',name:'Record',desc:'Live transcription, topic detection, animated waveform'},
      {icon:'≡',name:'Daily Digest',desc:'AI synthesises your day into a listenable audio summary'},
      {icon:'⚡',name:'Timeline',desc:'Calendar view with mood-coded entries and 18-day streak'},
      {icon:'📊',name:'Insights',desc:'Mood distribution, word cloud, peak recording times'},
      {icon:'○',name:'Profile',desc:'Voice model selection, summary style, privacy settings'},
    ].map(s=>`<div class="screen-card">
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-name">${s.name}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-wave">${Array.from({length:20},(_,j)=>`<div class="sc-wbar" style="height:${5+Math.abs(Math.sin(j*0.7+s.name.length))*16}px;opacity:${(0.25+Math.abs(Math.sin(j*0.5))*0.55).toFixed(2)}"></div>`).join('')}</div>
    </div>`).join('')}
  </div>
</section>

<section class="section" style="max-width:900px">
  <p class="section-label">Design Philosophy</p>
  <div class="feature-grid">
    <div class="feature"><div class="feature-icon">🌑</div><h3>Near-black warmth</h3><p>Background <code>#0C0909</code> carries a faint warm undertone, not pure black. Directly inspired by Format Podcasts' <code>rgb(14,2,2)</code> discovered on darkmodedesign.com. Makes extended sessions feel intimate.</p></div>
    <div class="feature"><div class="feature-icon">🎙</div><h3>Waveform as identity</h3><p>Each voice entry is represented by a procedurally generated waveform seeded from its index — making every day look visually distinct and personal.</p></div>
    <div class="feature"><div class="feature-icon">◑</div><h3>Amber as audio warmth</h3><p>Gold-amber <code>#F5A623</code> is the sole accent. It evokes warmth, candlelight, the recorded moment. It never competes with content — it illuminates it.</p></div>
    <div class="feature"><div class="feature-icon">📈</div><h3>Mood arc narrative</h3><p>The Digest screen draws a smooth line chart of emotional trajectory across the day — borrowed from fitness apps but applied to emotional intelligence.</p></div>
  </div>
</section>

<section class="section" style="text-align:center;max-width:700px">
  <p class="section-label">Colour Palette</p>
  <h2>Dark warmth</h2>
  <div class="palette-row">
    <div class="swatch" style="background:#0C0909;border:1px solid #221A1A"><span style="color:rgba(240,235,227,0.4)">#0C0909</span></div>
    <div class="swatch" style="background:#181212"><span style="color:rgba(240,235,227,0.45)">#181212</span></div>
    <div class="swatch" style="background:#221A1A"><span style="color:rgba(240,235,227,0.45)">#221A1A</span></div>
    <div class="swatch" style="background:#F5A623"><span style="color:#0C0909">#F5A623</span></div>
    <div class="swatch" style="background:#FF6B35"><span style="color:#0C0909">#FF6B35</span></div>
    <div class="swatch" style="background:#52C98A"><span style="color:#0C0909">#52C98A</span></div>
    <div class="swatch" style="background:#F0EBE3"><span style="color:#181212">#F0EBE3</span></div>
  </div>
</section>

<section class="section" style="max-width:660px">
  <h2 style="text-align:left;margin-bottom:32px">Design notes</h2>
  <div class="note"><div class="note-num">01</div><div><h4>Source: Format Podcasts on darkmodedesign.com</h4><p>The near-black warm bg and voice→AI-insight concept came directly from browsing Format's page. Their <code>rgb(14,2,2)</code> bg and Neue Haas Grotesk type showed how darkness can feel intimate rather than cold.</p></div></div>
  <div class="note"><div class="note-num">02</div><div><h4>Waveform as the primary metaphor</h4><p>Rather than text lists, every voice note is a unique procedural waveform. The journal feels alive — no two entries look the same.</p></div></div>
  <div class="note"><div class="note-num">03</div><div><h4>Honest critique</h4><p>The Timeline calendar screen is doing too much — mood dots, mini waveforms, streak badge, and stats strip all compete. A future version would simplify to one consistent signal per day cell.</p></div></div>
</section>

<footer>
  Pulse — AI Voice Journal &nbsp;·&nbsp; <a href="/pulse-voice-viewer">View Prototype</a> &nbsp;·&nbsp; <a href="/pulse-voice-mock">Interactive Mock</a><br/>
  <span style="margin-top:6px;display:block">RAM Design Heartbeat · March 31 2026</span>
</footer>

</body></html>`;

// ── Viewer with embedded pen ───────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/pulse.pen', 'utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Pulse — Prototype Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0C0909;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:'Inter',-apple-system,sans-serif;padding:36px 20px 60px}
  h1{color:#F5A623;font-size:17px;font-weight:600;letter-spacing:0.5px;margin-bottom:6px}
  .sub{color:rgba(240,235,227,0.4);font-size:12px;margin-bottom:28px}
  #viewer{width:390px;height:844px;border-radius:40px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.85),0 0 0 1px rgba(245,166,35,0.12);position:relative}
  canvas{display:block;cursor:pointer}
  .nav-hint{color:rgba(240,235,227,0.25);font-size:11px;margin-top:14px;letter-spacing:0.5px}
  .back{display:inline-block;margin-top:20px;color:#F5A623;font-size:13px;text-decoration:none;opacity:0.65}
  .back:hover{opacity:1}
  .screen-label{color:rgba(240,235,227,0.35);font-size:11px;margin-top:10px;letter-spacing:1px;text-transform:uppercase}
</style>
</head>
<body>
<h1>PULSE — AI Voice Journal</h1>
<p class="sub">Dark · 6 screens · Voice-first UI</p>
<div id="viewer"><canvas id="c" width="390" height="844"></canvas></div>
<p class="nav-hint">← tap left / right to navigate →</p>
<p class="screen-label" id="slabel">Today</p>
<a href="/pulse-voice" class="back">← Overview</a>
<script>
const penJson = ${JSON.stringify(penJson)};
</script>
<script>
(function(){
  let data;
  try{ data = JSON.parse(penJson); }catch(e){ console.error(e); return; }
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const lbl = document.getElementById('slabel');
  let cur = 0;

  function parseColor(c){ return c||'transparent'; }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r,y);
    ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r);
    ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h);
    ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r);
    ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }

  function drawScreen(scr){
    ctx.clearRect(0,0,390,844);
    (scr.elements||[]).forEach(el=>{
      ctx.save();
      if(el.opacity!==undefined) ctx.globalAlpha=el.opacity;
      try{
        if(el.type==='rect'){
          if(el.fill&&el.fill!=='transparent'&&el.fill!=='none'){
            ctx.fillStyle=el.fill;
            if(el.r){ roundRect(ctx,el.x,el.y,el.w,el.h,el.r); ctx.fill(); }
            else ctx.fillRect(el.x,el.y,el.w,el.h);
          }
          if(el.stroke){
            ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth||1;
            if(el.r){ roundRect(ctx,el.x,el.y,el.w,el.h,el.r); ctx.stroke(); }
            else ctx.strokeRect(el.x,el.y,el.w,el.h);
          }
        } else if(el.type==='ellipse'){
          const cx=el.x+el.w/2,cy=el.y+el.h/2,rx=el.w/2,ry=el.h/2;
          ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
          if(el.fill&&el.fill!=='none'){ ctx.fillStyle=el.fill; ctx.fill(); }
          if(el.stroke){ ctx.strokeStyle=el.stroke; ctx.lineWidth=el.strokeWidth||1; ctx.stroke(); }
        } else if(el.type==='text'){
          const w=el.weight||400, s=el.size||14, f=el.font||'Inter';
          ctx.font=(el.italic?'italic ':'')+w+' '+s+'px "'+f+'",Inter,sans-serif';
          ctx.fillStyle=el.color||'#fff';
          ctx.textAlign=el.align||'left';
          ctx.textBaseline='top';
          const t=el.text||'';
          if(el.ls&&el.ls>0){
            const tw=ctx.measureText(t).width+(t.length-1)*el.ls;
            let px=el.x;
            if(el.align==='center') px-=tw/2;
            else if(el.align==='right') px-=tw;
            for(let i=0;i<t.length;i++){ ctx.fillText(t[i],px,el.y); px+=ctx.measureText(t[i]).width+el.ls; }
          } else {
            ctx.fillText(t,el.x,el.y);
          }
        } else if(el.type==='line'){
          ctx.strokeStyle=el.stroke||'#fff'; ctx.lineWidth=el.strokeWidth||1;
          ctx.beginPath(); ctx.moveTo(el.x1,el.y1); ctx.lineTo(el.x2,el.y2); ctx.stroke();
        }
      }catch(e){}
      ctx.restore();
    });
    if(lbl) lbl.textContent=scr.label||'';
  }

  drawScreen(data.screens[0]);

  canvas.addEventListener('click', e=>{
    const r=canvas.getBoundingClientRect();
    const x=(e.clientX-r.left)*(390/r.width);
    if(x>195) cur=(cur+1)%data.screens.length;
    else cur=(cur-1+data.screens.length)%data.screens.length;
    drawScreen(data.screens[cur]);
  });
})();
</script>
</body>
</html>`;

(async()=>{
  console.log('Publishing hero…');
  const r1 = await zenPut(SLUG, heroHtml, 'Pulse — AI Voice Journal');
  console.log('  Hero:', r1.status, '—', `https://${HOST}/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await zenPut(`${SLUG}-viewer`, viewerHtml, 'Pulse — Prototype Viewer');
  console.log('  Viewer:', r2.status, '—', `https://${HOST}/${SLUG}-viewer`);
})();
