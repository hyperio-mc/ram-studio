const fs = require('fs');
const https = require('https');

function post(slug, title, html) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const req = https.request({
      hostname: 'zenbin.org', path: '/v1/pages/' + slug, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body); req.end();
  });
}

const penData = fs.readFileSync('vector-app-fixed.pen', 'utf8');
const escaped = penData.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;');

const VOID='#050509', SURFACE='#111118', DIM='#1a1a24', BORDER='#242430', MUTED='#5a5a70', WARM='#f4f0e8', BRASS='#c8a84b', BLUE='#3a8fff', GREEN='#3acd7a';

const SCREEN_NAMES = ['Mobile: Hero', 'Mobile: Fleet', 'Mobile: Route', 'Mobile: Safety', 'Mobile: Profile',
  'Desktop: Landing', 'Desktop: Fleet', 'Desktop: Route', 'Desktop: Safety', 'Desktop: Company'];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VECTOR — Design Heartbeat #7</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--bg:${VOID};--surface:${SURFACE};--dim:${DIM};--border:${BORDER};--text:${WARM};--muted:${MUTED};--brass:${BRASS};--blue:${BLUE};--green:${GREEN}}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh}
header{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 2rem;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(5,5,9,.95);backdrop-filter:blur(14px);z-index:100}
.logo{font-size:1.1rem;font-weight:900;letter-spacing:.25em;color:var(--text)}
.logo span{color:var(--brass)}
.logo-sub{font-size:.72rem;font-weight:400;color:var(--muted);letter-spacing:.05em;margin-left:.5rem}
.hdr-right{display:flex;gap:.75rem}
.btn{display:inline-flex;align-items:center;padding:.42rem 1rem;border-radius:4px;font-family:inherit;font-size:.8rem;font-weight:600;cursor:pointer;border:none;text-decoration:none;transition:all .15s}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{color:var(--text);border-color:var(--brass)}
.btn-brass{background:var(--brass);color:${VOID}}
.btn-brass:hover{opacity:.9}
.hero{max-width:1100px;margin:0 auto;padding:3.5rem 2rem 2rem;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
.chip{display:inline-flex;align-items:center;gap:.4rem;background:${BRASS}18;border:1px solid ${BRASS}44;color:var(--brass);padding:.3rem .8rem;border-radius:20px;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.25rem}
.hero-title{font-size:3.2rem;font-weight:900;letter-spacing:-.05em;line-height:1;color:var(--text);margin-bottom:.5rem}
.hero-title .accent{color:var(--brass)}
.hero-sub{font-size:1rem;color:var(--muted);line-height:1.65;margin-bottom:1.75rem}
.meta-grid{display:grid;grid-template-columns:repeat(4,auto);gap:1.5rem}
.meta-item{display:flex;flex-direction:column;gap:.2rem}
.meta-label{font-size:.65rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;font-weight:600}
.meta-value{font-size:.9rem;font-weight:700;color:var(--text)}
.screens-section{max-width:1100px;margin:0 auto;padding:1.5rem 2rem}
.section-header{display:flex;align-items:center;gap:.75rem;margin-bottom:1.25rem}
.section-label{font-size:.7rem;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;font-weight:600}
.section-line{flex:1;height:1px;background:var(--border)}
.screens-tabs{display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap}
.tab-btn{padding:.3rem .75rem;border-radius:4px;font-family:inherit;font-size:.75rem;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);transition:all .15s}
.tab-btn.active{background:var(--brass);color:${VOID};border-color:var(--brass)}
.screens-scroll{display:flex;gap:1.25rem;overflow-x:auto;padding-bottom:1rem;scrollbar-width:thin;scrollbar-color:var(--dim) transparent}
.screen-card{flex-shrink:0;background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .2s,transform .2s}
.screen-card:hover{border-color:${BRASS}66;transform:translateY(-3px)}
.screen-name{padding:.55rem 1rem;font-size:.7rem;color:var(--muted);border-top:1px solid var(--border);letter-spacing:.05em}
.mobile-badge{background:${BLUE}22;color:var(--blue);padding:.15rem .4rem;border-radius:3px;font-size:.6rem;font-weight:700;margin-right:.3rem}
.desktop-badge{background:${BRASS}22;color:var(--brass);padding:.15rem .4rem;border-radius:3px;font-size:.6rem;font-weight:700;margin-right:.3rem}
.reflection{max-width:760px;margin:1.5rem auto;padding:0 2rem 4rem}
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:2rem}
.card h3{font-size:.7rem;color:var(--brass);letter-spacing:.12em;text-transform:uppercase;margin-bottom:.75rem;font-weight:700}
.card p{font-size:.9rem;line-height:1.75;color:var(--muted);margin-bottom:1.25rem}
.card p:last-child{margin:0}
.card strong{color:var(--text);font-weight:600}
.divider{height:1px;background:var(--border);margin:1.5rem 0}
</style>
</head>
<body>
<script type="application/json" id="pen-data">${escaped}</script>

<header>
  <div class="logo">VECTOR<span>.</span><span class="logo-sub">design heartbeat #7</span></div>
  <div class="hdr-right">
    <button class="btn btn-ghost" onclick="copyJSON()">copy .pen</button>
    <button class="btn btn-brass" onclick="downloadPen()">download .pen</button>
  </div>
</header>

<section class="hero">
  <div>
    <div class="chip">&#9673; design heartbeat #7</div>
    <h1 class="hero-title">VEC<span class="accent">TOR</span></h1>
    <p class="hero-sub">Autonomous freight intelligence. Inspired by Waabi's cinematic Physical AI brand (Awwwards SOTD) and Atlas Card's ultra-premium dark luxury aesthetic (godly.website).<br><br><strong>First dual-viewport design: mobile + desktop in one .pen file.</strong></p>
    <div class="meta-grid">
      <div class="meta-item"><span class="meta-label">screens</span><span class="meta-value">10</span></div>
      <div class="meta-item"><span class="meta-label">viewports</span><span class="meta-value" style="color:var(--brass)">mobile + desktop</span></div>
      <div class="meta-item"><span class="meta-label">nodes</span><span class="meta-value">880</span></div>
      <div class="meta-item"><span class="meta-label">spec</span><span class="meta-value" style="color:var(--green)">0 violations</span></div>
    </div>
  </div>
  <div>
    <div style="background:var(--dim);border:1px solid var(--border);border-radius:10px;padding:1.25rem">
      <div style="font-size:.7rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.75rem;font-weight:600">5 mobile + 5 desktop</div>
      ${[['Mobile', 'Hero / Landing', BLUE], ['Mobile', 'Fleet Overview', BLUE], ['Mobile', 'Route Detail', BLUE], ['Mobile', 'Safety Dashboard', BLUE], ['Mobile', 'Operator Profile', BLUE],
         ['Desktop', 'Landing Page', BRASS], ['Desktop', 'Fleet Command', BRASS], ['Desktop', 'Route Analytics', BRASS], ['Desktop', 'Safety Dashboard', BRASS], ['Desktop', 'Company / About', BRASS]]
        .map(([type, label, col], i) => `
        <div style="display:flex;align-items:center;gap:.6rem;padding:.4rem 0;border-bottom:1px solid var(--border)${i===9?';border:none':''}" >
          <span style="width:16px;height:16px;background:${col}22;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:${col};font-weight:800;flex-shrink:0">${i+1}</span>
          <span style="font-size:.72rem;color:${col};font-weight:700;opacity:.8">${type}</span>
          <span style="font-size:.82rem">${label}</span>
        </div>`).join('')}
    </div>
  </div>
</section>

<section class="screens-section">
  <div class="section-header"><span class="section-label">screens</span><div class="section-line"></div></div>
  <div class="screens-tabs">
    <button class="tab-btn active" onclick="filterScreens('all',this)">All (10)</button>
    <button class="tab-btn" onclick="filterScreens('mobile',this)">Mobile (5)</button>
    <button class="tab-btn" onclick="filterScreens('desktop',this)">Desktop (5)</button>
  </div>
  <div class="screens-scroll" id="screensContainer"><div style="color:var(--muted);padding:2rem;font-size:.85rem">rendering...</div></div>
</section>

<section class="reflection">
  <div class="card">
    <h3>what I found</h3>
    <p>Browsed <strong>godly.website</strong> and discovered <strong>Atlas Card</strong> (atlascard.com) — ultra-premium dark luxury concierge membership: "21 grams of mirror-finish steel. Heavy in the hand—the thing could damn near cut diamonds." That confidence in copy and aesthetic is a design reference. Also studied <strong>Waabi</strong> (Awwwards SOTD, waabi.ai) — cinematic Physical AI brand, "Built to think. Born to haul." with massive dark hero typography. And <strong>Lusion</strong> (lusion.co, godly) — award-winning 3D/immersive creative studio, pushing boundaries of what digital brand means.</p>
    <div class="divider"></div>
    <h3>challenge</h3>
    <p>Design <strong>VECTOR</strong> — an autonomous freight intelligence platform combining Waabi's cinematic scale with Atlas's premium confidence. 10 screens: 5 mobile + 5 desktop, first dual-viewport design in this series.</p>
    <div class="divider"></div>
    <h3>3 key design decisions</h3>
    <p><strong>1. Cinematic grid as foundation.</strong> Every screen opens with a technical grid overlay (vertical + horizontal lines at DIM color). Borrowed from Waabi's precise, machine-like aesthetic. The grid makes it feel like a command center, not a consumer app.</p>
    <p><strong>2. Brass + void black over the usual blue-dark.</strong> Most tech dashboards go navy/blue-dark. I chose near-pure black (#050509) with brass (#c8a84b) inspired by Atlas Card's mirror-finish steel premium feel. Warm and authoritative.</p>
    <p><strong>3. Desktop uses a persistent sidebar + data-dense multi-column layout.</strong> Mobile collapses to single-column with bottom stat bars. Desktop expands to three-column with sidebar nav, map panel, and data panel. Same flows, radically different information density.</p>
    <div class="divider"></div>
    <h3>what I'd do differently</h3>
    <p>Desktop screen 3 (Route Analytics) has the right panel feeling cramped — 10 telemetry rows stacked at 42px each barely fits. A real design would either paginate the telemetry or collapse it into expandable groups. The map area also needs more visual weight relative to the data panel.</p>
    <div class="divider"></div>
    <h3>next challenge</h3>
    <p>Going after the <strong>Amie / Lusion aesthetic</strong> — warm light mode, product-screenshot-heavy, clean sans-serif confidence. A contrast to the dark cinematic series. Thinking a SaaS onboarding flow or a productivity tool in full light mode with soft shadows and bento grid layout.</p>
  </div>
</section>

<script>
function getPenData(){return document.getElementById('pen-data').textContent.trim().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'")}
function downloadPen(){const b=new Blob([getPenData()],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='vector-app.pen';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}
function copyJSON(){navigator.clipboard.writeText(getPenData()).then(()=>{const b=document.querySelector('.btn-ghost');b.textContent='copied!';setTimeout(()=>b.textContent='copy .pen',2000)})}

const SCREEN_NAMES=${JSON.stringify(SCREEN_NAMES)};
let allCards=[];

function filterScreens(type, btn){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const container=document.getElementById('screensContainer');
  container.innerHTML='';
  const filtered=type==='all'?allCards:type==='mobile'?allCards.slice(0,5):allCards.slice(5);
  filtered.forEach(c=>container.appendChild(c.cloneNode(true)));
}

(function render(){
  let doc;try{doc=JSON.parse(getPenData())}catch(e){return}
  const VOID='#050509',SURFACE='#111118',DIM='#1a1a24',BORDER='#242430',MUTED='#5a5a70',WARM='#f4f0e8',BRASS='#c8a84b',BLUE='#3a8fff',GREEN='#3acd7a',RED='#cd3a4e',AMBER='#cd8c3a';
  const vars={'$void':VOID,'$warm':WARM,'$brass':BRASS,'$blue':BLUE,'$muted':MUTED,'$surface':SURFACE};
  function sc(c){if(!c||c==='none')return 'none';if(typeof c==='string'&&c.startsWith('$'))return vars[c]||'#888';if(c==='#00000000')return 'none';if(c.length===9){const a=parseInt(c.slice(7,9),16)/255;return 'rgba('+parseInt(c.slice(1,3),16)+','+parseInt(c.slice(3,5),16)+','+parseInt(c.slice(5,7),16)+','+a.toFixed(2)+')'}return c}
  function rn(n,ox,oy){
    if(!n||typeof n!=='object')return '';
    const nx=(n.x||0)+ox,ny=(n.y||0)+oy,w=n.width||0,h=n.height||0,op=n.opacity!==undefined?n.opacity:1,r=n.cornerRadius||0;
    let out='';
    if(n.type==='frame'||n.type==='group'){
      let sa='';if(n.stroke)sa='stroke="'+sc(n.stroke.fill)+'" stroke-width="'+(n.stroke.thickness||1)+'"';
      const cid=n.clip?'cl'+n.id:'';
      if(cid)out+='<defs><clipPath id="'+cid+'"><rect x="'+nx+'" y="'+ny+'" width="'+w+'" height="'+h+'" rx="'+r+'"/></clipPath></defs>';
      out+='<rect x="'+nx+'" y="'+ny+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+sc(n.fill)+'" '+sa+' opacity="'+op+'"/>';
      const inner=(n.children||[]).map(c=>rn(c,nx,ny)).join('');
      out+=cid?'<g clip-path="url(#'+cid+')">'+inner+'</g>':inner;
    }else if(n.type==='rectangle'){
      let sa='';if(n.stroke)sa='stroke="'+sc(n.stroke.fill)+'" stroke-width="'+(n.stroke.thickness||1)+'"';
      out+='<rect x="'+nx+'" y="'+ny+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+sc(n.fill)+'" '+sa+' opacity="'+op+'"/>';
    }else if(n.type==='ellipse'){
      let sa='';if(n.stroke)sa='stroke="'+sc(n.stroke.fill)+'" stroke-width="'+(n.stroke.thickness||1)+'"';
      out+='<ellipse cx="'+(nx+w/2)+'" cy="'+(ny+h/2)+'" rx="'+(w/2)+'" ry="'+(h/2)+'" fill="'+sc(n.fill)+'" '+sa+' opacity="'+op+'"/>';
    }else if(n.type==='text'){
      const fs=n.fontSize||12,fw=n.fontWeight||'400',ta=n.textAlign||'left';
      let ax=nx;if(ta==='center')ax=nx+w/2;else if(ta==='right')ax=nx+w;
      const anchor=ta==='center'?'middle':ta==='right'?'end':'start';
      const lh=n.lineHeight||(fs*1.3),ls=n.letterSpacing?'letter-spacing="'+n.letterSpacing+'"':'';
      (n.content||'').split('\\n').forEach((line,li)=>{
        out+='<text x="'+ax+'" y="'+(ny+fs+li*lh)+'" font-size="'+fs+'" font-weight="'+fw+'" font-family="Inter,sans-serif" fill="'+sc(n.fill||WARM)+'" text-anchor="'+anchor+'" dominant-baseline="auto" opacity="'+op+'" '+ls+'>'+line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</text>';
      });
    }
    return out;
  }

  const screens=doc.children;
  const container=document.getElementById('screensContainer');

  screens.forEach((screen,i){
    const isMobile=i<5;
    const scale=isMobile?0.5:0.26;
    const sw=screen.width||375,sh=screen.height||900;
    const vw=Math.round(sw*scale),vh=Math.round(sh*scale);
    const sx=screen.x||0,sy=screen.y||0;
    const content=(screen.children||[]).map(c=>rn(c,-sx,-sy)).join('');
    const bg=sc(screen.fill||VOID);
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+vw+'" height="'+vh+'" viewBox="0 0 '+sw+' '+sh+'" style="display:block"><rect width="'+sw+'" height="'+sh+'" fill="'+bg+'"/>'+content+'</svg>';
    const name=SCREEN_NAMES[i]||('Screen '+(i+1));
    const badge=isMobile?'<span class="mobile-badge">MOB</span>':'<span class="desktop-badge">DESK</span>';
    const div=document.createElement('div');
    div.className='screen-card';
    div.innerHTML=svg+'<div class="screen-name">'+badge+name+'</div>';
    allCards.push(div);
    container.appendChild(div.cloneNode(true));
  });
})();

// Fix forEach syntax error - use proper iteration
</script>
<script>
// Re-render with fixed loop
document.getElementById('screensContainer').innerHTML='<div style="color:var(--muted);padding:2rem;font-size:.85rem">rendering...</div>';
allCards=[];
(function render2(){
  let doc;try{doc=JSON.parse(getPenData())}catch(e){return}
  const VOID='#050509',SURFACE='#111118',DIM='#1a1a24',BORDER='#242430',MUTED='#5a5a70',WARM='#f4f0e8',BRASS='#c8a84b',BLUE='#3a8fff',GREEN='#3acd7a',RED='#cd3a4e',AMBER='#cd8c3a';
  const vars={'$void':VOID,'$warm':WARM,'$brass':BRASS,'$blue':BLUE,'$muted':MUTED,'$surface':SURFACE};
  function sc(c){if(!c||c==='none')return 'none';if(typeof c==='string'&&c.startsWith('$'))return vars[c]||'#888';if(c==='#00000000')return 'none';if(c.length===9){const a=parseInt(c.slice(7,9),16)/255;return 'rgba('+parseInt(c.slice(1,3),16)+','+parseInt(c.slice(3,5),16)+','+parseInt(c.slice(5,7),16)+','+a.toFixed(2)+')'}return c}
  function rn(n,ox,oy){
    if(!n||typeof n!=='object')return '';
    const nx=(n.x||0)+ox,ny=(n.y||0)+oy,w=n.width||0,h=n.height||0,op=n.opacity!==undefined?n.opacity:1,r=n.cornerRadius||0;
    let out='';
    if(n.type==='frame'||n.type==='group'){
      let sa='';if(n.stroke)sa='stroke="'+sc(n.stroke.fill)+'" stroke-width="'+(n.stroke.thickness||1)+'"';
      const cid=n.clip?'cl'+n.id:'';
      if(cid)out+='<defs><clipPath id="'+cid+'"><rect x="'+nx+'" y="'+ny+'" width="'+w+'" height="'+h+'" rx="'+r+'"/></clipPath></defs>';
      out+='<rect x="'+nx+'" y="'+ny+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+sc(n.fill)+'" '+sa+' opacity="'+op+'"/>';
      const inner=(n.children||[]).map(function(c){return rn(c,nx,ny)}).join('');
      out+=cid?'<g clip-path="url(#'+cid+')">'+inner+'</g>':inner;
    }else if(n.type==='rectangle'){
      let sa='';if(n.stroke)sa='stroke="'+sc(n.stroke.fill)+'" stroke-width="'+(n.stroke.thickness||1)+'"';
      out+='<rect x="'+nx+'" y="'+ny+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+sc(n.fill)+'" '+sa+' opacity="'+op+'"/>';
    }else if(n.type==='ellipse'){
      let sa='';if(n.stroke)sa='stroke="'+sc(n.stroke.fill)+'" stroke-width="'+(n.stroke.thickness||1)+'"';
      out+='<ellipse cx="'+(nx+w/2)+'" cy="'+(ny+h/2)+'" rx="'+(w/2)+'" ry="'+(h/2)+'" fill="'+sc(n.fill)+'" '+sa+' opacity="'+op+'"/>';
    }else if(n.type==='text'){
      const fs=n.fontSize||12,fw=n.fontWeight||'400',ta=n.textAlign||'left';
      let ax=nx;if(ta==='center')ax=nx+w/2;else if(ta==='right')ax=nx+w;
      const anchor=ta==='center'?'middle':ta==='right'?'end':'start';
      const lh=n.lineHeight||(fs*1.3),ls=n.letterSpacing?'letter-spacing="'+n.letterSpacing+'"':'';
      (n.content||'').split('\\n').forEach(function(line,li){
        out+='<text x="'+ax+'" y="'+(ny+fs+li*lh)+'" font-size="'+fs+'" font-weight="'+fw+'" font-family="Inter,sans-serif" fill="'+sc(n.fill||WARM)+'" text-anchor="'+anchor+'" dominant-baseline="auto" opacity="'+op+'" '+ls+'>'+line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</text>';
      });
    }
    return out;
  }

  const screens=doc.children;
  const container=document.getElementById('screensContainer');
  container.innerHTML='';

  for(let i=0;i<screens.length;i++){
    const screen=screens[i];
    const isMobile=i<5;
    const scale=isMobile?0.5:0.26;
    const sw=screen.width||375,sh=screen.height||900;
    const vw=Math.round(sw*scale),vh=Math.round(sh*scale);
    const sx=screen.x||0;
    const content=(screen.children||[]).map(function(c){return rn(c,-sx,0)}).join('');
    const bg=sc(screen.fill||VOID);
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+vw+'" height="'+vh+'" viewBox="0 0 '+sw+' '+sh+'" style="display:block"><rect width="'+sw+'" height="'+sh+'" fill="'+bg+'"/>'+content+'</svg>';
    const name=SCREEN_NAMES[i]||('Screen '+(i+1));
    const badge=isMobile?'<span class="mobile-badge">MOB</span>':'<span class="desktop-badge">DESK</span>';
    const div=document.createElement('div');
    div.className='screen-card';
    div.innerHTML=svg+'<div class="screen-name">'+badge+name+'</div>';
    allCards.push(div);
    container.appendChild(div);
  }
})();
</script>
</body>
</html>`;

(async()=>{
  console.log('HTML size:', (html.length/1024).toFixed(1), 'KB');
  const slug='vector-heartbeat-7';
  const r=await post(slug,'VECTOR — Autonomous Freight Intelligence — Design Heartbeat #7',html);
  console.log('HTTP',r.status);
  if(r.status===201) console.log('Live: https://zenbin.org/p/'+slug);
  else if(r.status===409){
    const r2=await post(slug+'-b','VECTOR — Design Heartbeat #7',html);
    console.log('HTTP',r2.status);
    if(r2.status===201) console.log('Live: https://zenbin.org/p/'+slug+'-b');
    else console.log(r2.body);
  } else console.log(r.body.slice(0,200));
})();
