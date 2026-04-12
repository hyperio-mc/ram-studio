// pulse-publish.js — hero page + viewer for Pulse
const fs = require('fs');
const https = require('https');

const SLUG = 'pulse-voice';
const APP_NAME = 'Pulse';
const TAGLINE = 'Your day, in your voice';

function zenReq(path, method, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'ram.zenbin.org',
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': 'ram',
        ...headers,
      },
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

const heroHTML = `<!DOCTYPE html>
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
  /* Noise texture overlay */
  body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:0.35}

  .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;position:relative;text-align:center}
  .eyebrow{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--amber);text-transform:uppercase;margin-bottom:24px;opacity:0.8}
  h1{font-size:clamp(52px,8vw,96px);font-weight:300;line-height:1.05;letter-spacing:-3px;color:var(--text);max-width:800px}
  h1 em{font-style:italic;color:var(--amber);font-weight:300}
  .tagline{font-size:clamp(16px,2.5vw,22px);color:var(--textMid);max-width:500px;line-height:1.6;margin:28px auto 0}
  .cta-row{display:flex;gap:16px;justify-content:center;margin-top:48px;flex-wrap:wrap}
  .btn{padding:14px 32px;border-radius:40px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;transition:all 0.2s}
  .btn-primary{background:var(--amber);color:#0C0909}
  .btn-primary:hover{background:#ffc04a;transform:translateY(-1px)}
  .btn-ghost{border:1px solid rgba(240,235,227,0.2);color:var(--textMid)}
  .btn-ghost:hover{border-color:var(--amber);color:var(--amber)}

  /* Waveform hero viz */
  .waveform-hero{display:flex;align-items:center;justify-content:center;gap:3px;height:80px;margin:60px auto;max-width:600px}
  .wbar{background:var(--amber);border-radius:3px;width:5px;opacity:0.7;animation:wave 1.6s ease-in-out infinite}
  .wbar:nth-child(2n){opacity:0.4}
  @keyframes wave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.5)}}

  /* Screens showcase */
  .screens{padding:80px 24px;max-width:1200px;margin:0 auto}
  .screens h2{font-size:clamp(28px,4vw,48px);font-weight:300;letter-spacing:-1px;color:var(--text);margin-bottom:16px;text-align:center}
  .screens p{text-align:center;color:var(--textMid);font-size:16px;margin-bottom:60px}
  .screen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}
  .screen-card{background:var(--surface);border-radius:20px;overflow:hidden;border:1px solid rgba(245,166,35,0.08);transition:border-color 0.2s,transform 0.2s;cursor:pointer}
  .screen-card:hover{border-color:rgba(245,166,35,0.3);transform:translateY(-4px)}
  .screen-card-header{padding:20px 20px 12px;display:flex;align-items:center;gap:12px}
  .screen-icon{width:36px;height:36px;border-radius:10px;background:var(--amberDim);display:flex;align-items:center;justify-content:center;font-size:16px}
  .screen-name{font-size:14px;font-weight:600;color:var(--text)}
  .screen-desc{font-size:12px;color:var(--textMid)}
  .screen-preview{height:120px;padding:0 20px 20px;display:flex;flex-direction:column;gap:6px}
  .mini-bar{height:6px;border-radius:3px;background:var(--surface2)}
  .mini-bar.accent{background:var(--amber);opacity:0.7}
  .mini-wave{display:flex;align-items:center;gap:2px;height:30px;margin:4px 0}
  .mini-wbar{background:var(--amber);border-radius:2px;width:3px;opacity:0.5}

  /* Features */
  .features{padding:80px 24px;max-width:1000px;margin:0 auto}
  .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-top:48px}
  .feature{padding:32px;background:var(--surface);border-radius:16px;border:1px solid rgba(245,166,35,0.06)}
  .feature-icon{font-size:28px;margin-bottom:16px}
  .feature h3{font-size:18px;font-weight:600;margin-bottom:10px;color:var(--text)}
  .feature p{font-size:14px;color:var(--textMid);line-height:1.6}

  /* Palette */
  .palette-section{padding:60px 24px;max-width:800px;margin:0 auto;text-align:center}
  .palette-row{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:32px}
  .swatch{width:80px;height:80px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:8px}
  .swatch span{font-size:9px;font-weight:700;opacity:0.7;text-transform:uppercase}

  /* Design notes */
  .notes{padding:60px 24px;max-width:700px;margin:0 auto}
  .notes h2{font-size:28px;font-weight:300;letter-spacing:-0.5px;margin-bottom:32px;color:var(--text)}
  .note{display:flex;gap:20px;margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid rgba(240,235,227,0.06)}
  .note:last-child{border-bottom:none}
  .note-num{font-size:13px;font-weight:700;color:var(--amber);min-width:28px;padding-top:2px}
  .note-content h4{font-size:15px;font-weight:600;margin-bottom:6px;color:var(--text)}
  .note-content p{font-size:14px;color:var(--textMid);line-height:1.6}

  /* Footer */
  footer{text-align:center;padding:40px 24px;color:var(--textDim);font-size:13px}
  footer a{color:var(--amber);text-decoration:none}

  .section-label{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--amber);text-transform:uppercase;text-align:center;margin-bottom:20px;opacity:0.7}
</style>
</head>
<body>
<section class="hero">
  <p class="eyebrow">RAM Design · March 2026</p>
  <h1>Your thoughts,<br/><em>captured</em> in voice</h1>
  <p class="tagline">Pulse records your voice throughout the day and synthesizes it into AI-powered insight, mood arcs, and daily digests.</p>
  <div class="cta-row">
    <a href="/pulse-voice-viewer" class="btn btn-primary">View Prototype →</a>
    <a href="/pulse-voice-mock" class="btn btn-ghost">Interactive Mock ☀◑</a>
  </div>
  <div class="waveform-hero">
    ${Array.from({length:60},(_,i)=>{
      const h=20+Math.abs(Math.sin(i*0.4+1)*55);
      const d=(i*0.06).toFixed(2);
      return `<div class="wbar" style="height:${h}px;animation-delay:${d}s"></div>`;
    }).join('')}
  </div>
  <p style="color:var(--textDim);font-size:12px;letter-spacing:1px">DARK MODE · 6 SCREENS · VOICE-FIRST</p>
</section>

<section class="screens">
  <p class="section-label">The Prototype</p>
  <h2>Six screens, one continuous thread</h2>
  <p>Every feature in Pulse follows audio as the primary interface.</p>
  <div class="screen-grid">
    ${[
      {icon:'◉',name:'Today',desc:'Voice entries with waveform hero'},
      {icon:'⊕',name:'Record',desc:'Live transcription + topic detection'},
      {icon:'≡',name:'Daily Digest',desc:'AI synthesizes your day into audio'},
      {icon:'⚡',name:'Timeline',desc:'Calendar with mood-coded entries'},
      {icon:'📊',name:'Insights',desc:'Mood trends, peak recording times'},
      {icon:'○',name:'Profile',desc:'Voice model, summary style prefs'},
    ].map(s=>`
    <div class="screen-card">
      <div class="screen-card-header">
        <div class="screen-icon">${s.icon}</div>
        <div><div class="screen-name">${s.name}</div><div class="screen-desc">${s.desc}</div></div>
      </div>
      <div class="screen-preview">
        <div class="mini-wave">${Array.from({length:22},(_,i)=>`<div class="mini-wbar" style="height:${6+Math.abs(Math.sin(i*0.7))*18}px;opacity:${0.3+Math.abs(Math.sin(i*0.5))*0.5}"></div>`).join('')}</div>
        <div class="mini-bar accent" style="width:70%"></div>
        <div class="mini-bar" style="width:50%"></div>
        <div class="mini-bar" style="width:85%"></div>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <p class="section-label">Design Philosophy</p>
  <div class="feature-grid">
    <div class="feature">
      <div class="feature-icon">🌑</div>
      <h3>Near-black warmth</h3>
      <p>Background is <code style="color:var(--amber);font-size:12px">#0C0909</code> — not pure black, but carrying a faint warm undertone. Inspired by Format Podcasts' <code style="color:var(--amber);font-size:12px">rgb(14,2,2)</code> seen on darkmodedesign.com. The warmth makes long sessions feel less harsh.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">🎙</div>
      <h3>Waveform as identity</h3>
      <p>The waveform visualiser is used throughout — hero cards, entry previews, the record screen — making audio tangible. Each instance is procedurally generated from a seed so every entry looks distinct.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">◑</div>
      <h3>Amber as audio warmth</h3>
      <p>Gold-amber <code style="color:var(--amber);font-size:12px">#F5A623</code> is the sole accent. It evokes warmth, voice, candlelight — the "recorded moment" feeling. It never competes with content; it illuminates it.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">📈</div>
      <h3>Mood arc narrative</h3>
      <p>The Digest screen uses a simple line chart to show emotional trajectory across the day — a pattern borrowed from fitness apps but applied to emotional intelligence. Dots, not bars, keep it gentle.</p>
    </div>
  </div>
</section>

<section class="palette-section">
  <p class="section-label">Colour Palette</p>
  <h2 style="font-size:28px;font-weight:300;letter-spacing:-0.5px;color:var(--text)">Dark warmth</h2>
  <div class="palette-row">
    <div class="swatch" style="background:#0C0909"><span style="color:rgba(240,235,227,0.5)">#0C0909</span></div>
    <div class="swatch" style="background:#181212"><span style="color:rgba(240,235,227,0.5)">#181212</span></div>
    <div class="swatch" style="background:#221A1A"><span style="color:rgba(240,235,227,0.5)">#221A1A</span></div>
    <div class="swatch" style="background:#F5A623"><span style="color:#0C0909">#F5A623</span></div>
    <div class="swatch" style="background:#FF6B35"><span style="color:#0C0909">#FF6B35</span></div>
    <div class="swatch" style="background:#52C98A"><span style="color:#0C0909">#52C98A</span></div>
    <div class="swatch" style="background:#F0EBE3"><span style="color:#181212">#F0EBE3</span></div>
  </div>
</section>

<section class="notes">
  <h2>Design notes</h2>
  <div class="note"><div class="note-num">01</div><div class="note-content"><h4>Inspired by: Format Podcasts on darkmodedesign.com</h4><p>The near-black warm background and "voice recordings → AI insight" concept came directly from browsing Format's landing page. Their bg <code style="color:var(--amber)">rgb(14,2,2)</code> and "Neue Haas Grotesk" type system showed me how darkness can feel intimate rather than cold.</p></div></div>
  <div class="note"><div class="note-num">02</div><div class="note-content"><h4>Waveform as the primary UI metaphor</h4><p>Rather than lists of text entries, every voice note is represented by a unique procedural waveform. This makes the journal feel alive and personal — no two days look the same.</p></div></div>
  <div class="note"><div class="note-num">03</div><div class="note-content"><h4>One honest critique</h4><p>The Timeline calendar screen is doing too much — mood dots, mini waveforms, streak badge, and stats strip compete visually. A future version would simplify to a single consistent signal per day cell.</p></div></div>
</section>

<footer>
  <p>Pulse — AI Voice Journal · <a href="/pulse-voice-viewer">View Prototype</a> · <a href="/pulse-voice-mock">Interactive Mock</a></p>
  <p style="margin-top:8px">RAM Design Heartbeat · March 31 2026</p>
</footer>
</body>
</html>`;

const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Pulse — Prototype Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0C0909;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;min-height:100vh;font-family:'Inter',sans-serif;padding:40px 20px}
  h1{color:#F5A623;font-size:18px;font-weight:600;letter-spacing:1px;margin-bottom:8px}
  p{color:rgba(240,235,227,0.5);font-size:13px;margin-bottom:32px}
  #viewer{width:390px;height:844px;border-radius:44px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.8),0 0 0 1px rgba(245,166,35,0.1);background:#0C0909}
  canvas{display:block}
  .back{margin-top:24px;color:#F5A623;font-size:13px;text-decoration:none;opacity:0.7}
  .back:hover{opacity:1}
</style>
</head>
<body>
<h1>PULSE — AI Voice Journal</h1>
<p>Dark · 6 screens · Audio-first UI</p>
<div id="viewer"><canvas id="c" width="390" height="844"></canvas></div>
<a href="/pulse-voice" class="back">← Back to overview</a>
<script>
window.EMBEDDED_PEN = PLACEHOLDER;
</script>
<script>
(function(){
  const pen = window.EMBEDDED_PEN;
  if(!pen) return;
  let data;
  try{ data = typeof pen === 'string' ? JSON.parse(pen) : pen; }catch(e){ console.error(e); return; }
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let currentScreen = 0;
  function drawScreen(scr){
    ctx.clearRect(0,0,390,844);
    (scr.elements||[]).forEach(el=>{
      ctx.save();
      if(el.opacity!==undefined) ctx.globalAlpha=el.opacity;
      if(el.type==='rect'){
        ctx.fillStyle=el.fill||'transparent';
        if(el.r){
          const r=el.r;
          ctx.beginPath();
          ctx.moveTo(el.x+r,el.y);
          ctx.lineTo(el.x+el.w-r,el.y);
          ctx.arcTo(el.x+el.w,el.y,el.x+el.w,el.y+r,r);
          ctx.lineTo(el.x+el.w,el.y+el.h-r);
          ctx.arcTo(el.x+el.w,el.y+el.h,el.x+el.w-r,el.y+el.h,r);
          ctx.lineTo(el.x+r,el.y+el.h);
          ctx.arcTo(el.x,el.y+el.h,el.x,el.y+el.h-r,r);
          ctx.lineTo(el.x,el.y+r);
          ctx.arcTo(el.x,el.y,el.x+r,el.y,r);
          ctx.closePath();
          ctx.fill();
          if(el.stroke){ctx.strokeStyle=el.stroke;ctx.lineWidth=el.strokeWidth||1;ctx.stroke();}
        } else {
          ctx.fillRect(el.x,el.y,el.w,el.h);
          if(el.stroke){ctx.strokeStyle=el.stroke;ctx.lineWidth=el.strokeWidth||1;ctx.strokeRect(el.x,el.y,el.w,el.h);}
        }
      } else if(el.type==='ellipse'){
        const cx=el.x+el.w/2, cy=el.y+el.h/2, rx=el.w/2, ry=el.h/2;
        ctx.beginPath();
        ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
        if(el.fill&&el.fill!=='none'){ctx.fillStyle=el.fill;ctx.fill();}
        if(el.stroke){ctx.strokeStyle=el.stroke;ctx.lineWidth=el.strokeWidth||1;ctx.stroke();}
      } else if(el.type==='text'){
        const align = el.align||'left';
        const style = (el.italic?'italic ':'') + (el.weight||400) + ' ' + (el.size||14) + 'px ' + (el.font||'Inter');
        ctx.font=style;
        ctx.fillStyle=el.color||'#fff';
        ctx.textAlign=align;
        ctx.textBaseline='top';
        if(el.ls&&el.ls>0){
          let px=el.x;
          const txt=el.text||'';
          const totalW=ctx.measureText(txt).width+(txt.length-1)*el.ls;
          if(align==='center') px-=totalW/2;
          else if(align==='right') px-=totalW;
          for(let ci=0;ci<txt.length;ci++){
            ctx.fillText(txt[ci],px,el.y);
            px+=ctx.measureText(txt[ci]).width+el.ls;
          }
        } else {
          ctx.fillText(el.text||'',el.x,el.y);
        }
      } else if(el.type==='line'){
        ctx.strokeStyle=el.stroke||'#fff';
        ctx.lineWidth=el.strokeWidth||1;
        ctx.beginPath();
        ctx.moveTo(el.x1,el.y1);
        ctx.lineTo(el.x2,el.y2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }
  drawScreen(data.screens[0]);
  canvas.addEventListener('click', e=>{
    const rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)*(390/rect.width);
    const y=(e.clientY-rect.top)*(844/rect.height);
    // tap right half = next, left half = prev
    if(x>195) currentScreen=(currentScreen+1)%data.screens.length;
    else currentScreen=(currentScreen-1+data.screens.length)%data.screens.length;
    drawScreen(data.screens[currentScreen]);
  });
})();
</script>
</body>
</html>`;

async function run() {
  // 1. Publish hero page
  const heroBody = JSON.stringify({ slug: SLUG, html: heroHTML, title: `${APP_NAME} — ${TAGLINE}` });
  const heroRes = await zenReq('/publish', 'POST', heroBody);
  console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));

  // 2. Publish viewer with embedded pen
  const penJson = fs.readFileSync('/workspace/group/design-studio/pulse.pen', 'utf8');
  let viewerHtml = viewerTemplate.replace('PLACEHOLDER', JSON.stringify(penJson));
  const viewerBody = JSON.stringify({ slug: `${SLUG}-viewer`, html: viewerHtml, title: `${APP_NAME} — Prototype Viewer` });
  const viewerRes = await zenReq('/publish', 'POST', viewerBody);
  console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));

  console.log(`\nHero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

run().catch(console.error);
