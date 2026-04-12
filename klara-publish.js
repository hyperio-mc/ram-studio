'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'klara';
const APP = 'KLARA';
const TAGLINE = 'surface what you know';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ── Extract SVG data URIs from screens for carousel ──────────────────────────
function svgFromElements(elements, w = 390, h = 844) {
  const paths = elements.map(el => {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      let attrs = `x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${rx}"`;
      if (el.opacity !== undefined) attrs += ` opacity="${el.opacity}"`;
      if (el.stroke) attrs += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"`;
      return `<rect ${attrs}/>`;
    }
    if (el.type === 'text') {
      let attrs = `x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" text-anchor="${el.textAnchor || 'start'}"`;
      if (el.fontWeight) attrs += ` font-weight="${el.fontWeight}"`;
      if (el.fontFamily) attrs += ` font-family="${el.fontFamily}"`;
      if (el.letterSpacing) attrs += ` letter-spacing="${el.letterSpacing}"`;
      if (el.opacity !== undefined) attrs += ` opacity="${el.opacity}"`;
      return `<text ${attrs}>${el.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (el.type === 'circle') {
      let attrs = `cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"`;
      if (el.opacity !== undefined) attrs += ` opacity="${el.opacity}"`;
      if (el.stroke) attrs += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"`;
      return `<circle ${attrs}/>`;
    }
    if (el.type === 'line') {
      let attrs = `x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"`;
      if (el.opacity !== undefined) attrs += ` opacity="${el.opacity}"`;
      if (el.strokeDasharray) attrs += ` stroke-dasharray="${el.strokeDasharray}"`;
      return `<line ${attrs}/>`;
    }
    return '';
  }).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${paths}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const screenURIs = pen.screens.map(s => svgFromElements(s.elements));
const palette = pen.metadata.palette;

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#080A0D;--surf:#0D1117;--card:#131921;
    --acc:#39FF14;--acc2:#00C8FF;--txt:#E0E6ED;--txt2:#8B95A1;
    --border:rgba(57,255,20,0.15);--border2:rgba(0,200,255,0.12);
  }
  html,body{background:var(--bg);color:var(--txt);font-family:'Space Grotesk',sans-serif;min-height:100vh}
  body{overflow-x:hidden}

  /* grid overlay */
  body::before{
    content:'';position:fixed;inset:0;
    background-image:
      linear-gradient(rgba(57,255,20,0.03) 1px,transparent 1px),
      linear-gradient(90deg,rgba(57,255,20,0.03) 1px,transparent 1px);
    background-size:48px 48px;pointer-events:none;z-index:0;
  }

  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    padding:18px 32px;display:flex;align-items:center;justify-content:space-between;
    background:rgba(8,10,13,0.85);backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border);
  }
  .logo{font-family:'Space Mono',monospace;font-size:16px;font-weight:700;color:var(--acc);letter-spacing:3px}
  .logo span{color:var(--txt2);font-size:11px;letter-spacing:1.5px;margin-left:10px}
  .nav-links{display:flex;gap:28px;align-items:center}
  .nav-links a{font-family:'Space Mono',monospace;font-size:11px;color:var(--txt2);text-decoration:none;letter-spacing:1px;opacity:0.6;transition:opacity 0.2s}
  .nav-links a:hover{opacity:1;color:var(--acc2)}
  .cta-btn{
    font-family:'Space Mono',monospace;font-size:11px;font-weight:700;
    padding:10px 22px;background:var(--acc);color:var(--bg);
    border:none;cursor:pointer;letter-spacing:1.5px;
    clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
  }

  .hero{
    min-height:100vh;display:flex;align-items:center;
    padding:120px 32px 80px;max-width:1200px;margin:0 auto;
    position:relative;z-index:1;
  }
  .hero-left{flex:1;padding-right:64px}
  .hero-eyebrow{
    font-family:'Space Mono',monospace;font-size:11px;font-weight:700;
    color:var(--acc);letter-spacing:3px;margin-bottom:24px;
    display:flex;align-items:center;gap:10px;
  }
  .hero-eyebrow::before{content:'';width:32px;height:1px;background:var(--acc);opacity:0.6}
  .hero-title{font-size:clamp(48px,6vw,80px);font-weight:700;line-height:1.05;margin-bottom:24px;letter-spacing:-1px}
  .hero-title .acc{color:var(--acc)}
  .hero-title .acc2{color:var(--acc2)}
  .hero-sub{font-size:18px;color:var(--txt2);line-height:1.65;max-width:460px;margin-bottom:40px;font-weight:400}
  .hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  .btn-primary{
    font-family:'Space Mono',monospace;font-size:12px;font-weight:700;
    padding:14px 32px;background:var(--acc);color:var(--bg);
    text-decoration:none;letter-spacing:1.5px;
    clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);
    transition:opacity 0.2s;
  }
  .btn-primary:hover{opacity:0.85}
  .btn-secondary{
    font-family:'Space Mono',monospace;font-size:12px;font-weight:400;
    padding:13px 28px;color:var(--acc2);
    border:1px solid var(--border2);text-decoration:none;letter-spacing:1px;
    transition:background 0.2s;
  }
  .btn-secondary:hover{background:rgba(0,200,255,0.05)}
  .hero-right{flex:0 0 380px;position:relative}

  /* phone mockup */
  .phone-wrap{position:relative;width:300px;margin:0 auto}
  .phone{
    width:280px;border-radius:40px;overflow:hidden;
    border:2px solid rgba(57,255,20,0.25);
    box-shadow:0 0 60px rgba(57,255,20,0.08),0 0 120px rgba(0,200,255,0.04);
    position:relative;z-index:2;
  }
  .phone img{width:100%;display:block}
  /* corner brackets on phone */
  .phone-wrap::before,.phone-wrap::after{
    content:'';position:absolute;width:20px;height:20px;
    border-color:var(--acc);border-style:solid;opacity:0.5;z-index:3;
  }
  .phone-wrap::before{top:-6px;left:-6px;border-width:2px 0 0 2px}
  .phone-wrap::after{bottom:-6px;right:-6px;border-width:0 2px 2px 0}
  .screen-dots{display:flex;gap:8px;justify-content:center;margin-top:20px}
  .screen-dot{width:6px;height:6px;border-radius:50%;background:rgba(57,255,20,0.2);cursor:pointer;transition:background 0.2s}
  .screen-dot.active{background:var(--acc)}

  /* ambient orbs */
  .orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
  .orb1{width:400px;height:400px;background:rgba(57,255,20,0.06);top:-100px;right:-100px}
  .orb2{width:300px;height:300px;background:rgba(0,200,255,0.05);bottom:100px;left:-80px}

  /* reticle decoration */
  .reticle{position:absolute;width:60px;height:60px}
  .reticle circle{fill:none;stroke:var(--acc2);opacity:0.3}

  .stats-row{display:flex;gap:32px;margin-top:48px;padding-top:32px;border-top:1px solid var(--border)}
  .stat{text-align:left}
  .stat-val{font-family:'Space Mono',monospace;font-size:28px;font-weight:700;color:var(--txt)}
  .stat-val .acc{color:var(--acc)}
  .stat-label{font-family:'Space Mono',monospace;font-size:10px;color:var(--txt2);letter-spacing:1.5px;margin-top:4px;opacity:0.6}

  /* screens section */
  .screens-section{padding:80px 32px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
  .section-label{font-family:'Space Mono',monospace;font-size:11px;color:var(--acc2);letter-spacing:3px;margin-bottom:16px;opacity:0.7}
  .section-title{font-size:36px;font-weight:700;margin-bottom:48px;letter-spacing:-0.5px}
  .screens-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .screen-card{
    background:var(--card);border-radius:12px;overflow:hidden;
    border:1px solid rgba(57,255,20,0.08);
    transition:border-color 0.25s,transform 0.25s;position:relative;
  }
  .screen-card:hover{border-color:rgba(57,255,20,0.3);transform:translateY(-4px)}
  .screen-card::before,.screen-card::after{
    content:'';position:absolute;width:12px;height:12px;
    border-color:var(--acc);border-style:solid;opacity:0;
    transition:opacity 0.25s;z-index:2;
  }
  .screen-card::before{top:8px;left:8px;border-width:1px 0 0 1px}
  .screen-card::after{bottom:8px;right:8px;border-width:0 1px 1px 0}
  .screen-card:hover::before,.screen-card:hover::after{opacity:0.6}
  .screen-card img{width:100%;display:block;aspect-ratio:390/844;object-fit:cover}
  .screen-name{
    padding:10px 14px;font-family:'Space Mono',monospace;font-size:10px;
    color:var(--txt2);letter-spacing:1.5px;border-top:1px solid rgba(255,255,255,0.05);
  }

  /* features */
  .features-section{padding:80px 32px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
  .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}
  .feature-card{
    background:var(--card);border:1px solid rgba(57,255,20,0.08);padding:32px;
    border-radius:8px;position:relative;transition:border-color 0.2s;
  }
  .feature-card:hover{border-color:rgba(57,255,20,0.25)}
  .feature-icon{font-size:24px;margin-bottom:16px}
  .feature-title{font-size:16px;font-weight:700;margin-bottom:8px;color:var(--txt)}
  .feature-desc{font-size:14px;color:var(--txt2);line-height:1.6;opacity:0.7}
  /* bracket corner on first card */
  .feature-card.featured{border-color:rgba(57,255,20,0.2)}
  .feature-card.featured::before{
    content:'';position:absolute;top:12px;left:12px;
    width:16px;height:16px;
    border-top:1px solid var(--acc);border-left:1px solid var(--acc);opacity:0.5;
  }

  /* palette */
  .palette-section{padding:60px 32px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
  .palette-grid{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
  .swatch{
    display:flex;flex-direction:column;gap:8px;
    font-family:'Space Mono',monospace;font-size:10px;color:var(--txt2);letter-spacing:0.5px;
  }
  .swatch-block{width:60px;height:60px;border-radius:4px;border:1px solid rgba(255,255,255,0.08)}

  /* links row */
  .links-section{
    padding:48px 32px;max-width:1200px;margin:0 auto;
    display:flex;gap:20px;flex-wrap:wrap;align-items:center;
    border-top:1px solid var(--border);position:relative;z-index:1;
  }
  .links-section a{
    font-family:'Space Mono',monospace;font-size:12px;color:var(--acc2);
    text-decoration:none;padding:10px 20px;
    border:1px solid var(--border2);transition:background 0.2s;
  }
  .links-section a:hover{background:rgba(0,200,255,0.06)}
  .links-label{font-family:'Space Mono',monospace;font-size:11px;color:var(--txt2);letter-spacing:1px;opacity:0.5;margin-right:8px}

  footer{
    padding:32px;text-align:center;
    font-family:'Space Mono',monospace;font-size:11px;color:var(--txt2);
    border-top:1px solid rgba(255,255,255,0.04);opacity:0.4;
    position:relative;z-index:1;
  }

  @media(max-width:900px){
    .hero{flex-direction:column;padding-top:100px}
    .hero-left{padding-right:0;margin-bottom:48px}
    .hero-right{width:100%}
    .screens-grid{grid-template-columns:repeat(2,1fr)}
    .features-grid{grid-template-columns:1fr}
  }
</style>
</head>
<body>
<div class="orb orb1"></div>
<div class="orb orb2"></div>

<nav>
  <div class="logo">KLARA <span>KNOWLEDGE BASE</span></div>
  <div class="nav-links">
    <a href="#">Screens</a>
    <a href="#">Features</a>
    <a href="https://ram.zenbin.org/klara-viewer">Viewer</a>
    <a class="cta-btn" href="https://ram.zenbin.org/klara-mock">LIVE MOCK →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">HEARTBEAT #468  ·  DARK THEME</div>
    <h1 class="hero-title">
      Surface what<br>you <span class="acc">know</span>.<br>
      Build what <span class="acc2">matters</span>.
    </h1>
    <p class="hero-sub">
      A developer knowledge base built for how programmers actually think — 
      terminal aesthetic, HUD precision, zero friction between idea and index.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/klara-mock">INTERACTIVE MOCK</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/klara-viewer">VIEW IN PENCIL.DEV →</a>
    </div>
    <div class="stats-row">
      <div class="stat">
        <div class="stat-val"><span class="acc">6</span></div>
        <div class="stat-label">SCREENS</div>
      </div>
      <div class="stat">
        <div class="stat-val">810</div>
        <div class="stat-label">ELEMENTS</div>
      </div>
      <div class="stat">
        <div class="stat-val">DARK</div>
        <div class="stat-label">THEME</div>
      </div>
      <div class="stat">
        <div class="stat-val">#468</div>
        <div class="stat-label">HEARTBEAT</div>
      </div>
    </div>
  </div>
  <div class="hero-right">
    <div class="phone-wrap">
      <div class="phone" id="hero-phone">
        <img id="hero-screen" src="${screenURIs[0]}" alt="Dashboard screen">
      </div>
      <div class="screen-dots">
        ${pen.screens.map((s,i)=>`<div class="screen-dot${i===0?' active':''}" onclick="switchScreen(${i})" title="${s.name}"></div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="screens-section">
  <div class="section-label">SCREEN BREAKDOWN</div>
  <h2 class="section-title">6 screens. Zero bloat.</h2>
  <div class="screens-grid">
    ${pen.screens.map((s,i)=>`
    <div class="screen-card">
      <img src="${screenURIs[i]}" alt="${s.name}">
      <div class="screen-name">${String(i+1).padStart(2,'0')} · ${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features-section">
  <div class="section-label">DESIGN DECISIONS</div>
  <h2 class="section-title">Built from the terminal up.</h2>
  <div class="features-grid">
    <div class="feature-card featured">
      <div class="feature-icon">◱</div>
      <div class="feature-title">Corner Bracket System</div>
      <div class="feature-desc">Every card uses a surveillance-terminal corner bracket motif — 8 hairline strokes per card creating HUD authenticity without heavy chrome.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-title">Grid Topology View</div>
      <div class="feature-desc">Knowledge graph screen renders the connection web as a live node map — cluster filtering, depth slider, and selected-node detail panel.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Tracking Reticle Accents</div>
      <div class="feature-desc">Circular reticle motifs with crosshair arms appear at action entry points — reinforcing the surveillance aesthetic while guiding eye movement.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▣</div>
      <div class="feature-title">Monospace Metadata Layer</div>
      <div class="feature-desc">All labels, counts, timestamps, and system status use Space Mono — creating a visual distinction between data and prose at a glance.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Relevance Score Circles</div>
      <div class="feature-desc">Search results display a circular relevance score (0–100) with a colored ring — a data-dense pattern borrowed from security dashboards.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊕</div>
      <div class="feature-title">AI Assist Inline Bar</div>
      <div class="feature-desc">The capture screen surfaces an AI suggestion bar mid-entry — "Suggest 3 related entries to link?" — unobtrusive but immediately available.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">PALETTE</div>
  <h2 class="section-title" style="font-size:24px;margin-bottom:8px">Terminal Dark</h2>
  <p style="color:var(--txt2);font-size:14px;margin-bottom:24px;opacity:0.6">Near-black background keeps the neon green from overwhelming — the grid overlay adds depth without brightness cost.</p>
  <div class="palette-grid">
    ${[
      {hex:'#080A0D',name:'BG'},
      {hex:'#0D1117',name:'SURF'},
      {hex:'#131921',name:'CARD'},
      {hex:'#39FF14',name:'GREEN'},
      {hex:'#00C8FF',name:'CYAN'},
      {hex:'#E0E6ED',name:'TEXT'},
      {hex:'#8B95A1',name:'MUTED'},
    ].map(s=>`
    <div class="swatch">
      <div class="swatch-block" style="background:${s.hex}"></div>
      <div>${s.name}</div>
      <div style="opacity:0.5">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<div class="links-section">
  <span class="links-label">EXPLORE →</span>
  <a href="https://ram.zenbin.org/klara-viewer">Pencil.dev Viewer</a>
  <a href="https://ram.zenbin.org/klara-mock">Interactive Mock ☀◑</a>
</div>

<footer>RAM Design Heartbeat #468 · ${new Date().toISOString().slice(0,10)} · KLARA — surface what you know</footer>

<script>
const uris=${JSON.stringify(screenURIs)};
function switchScreen(i){
  document.getElementById('hero-screen').src=uris[i];
  document.querySelectorAll('.screen-dot').forEach((d,j)=>d.classList.toggle('active',j===i));
}
// auto-cycle
let cur=0;
setInterval(()=>{cur=(cur+1)%uris.length;switchScreen(cur);},2800);
</script>
</body>
</html>`;

// Build viewer with embedded pen
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
