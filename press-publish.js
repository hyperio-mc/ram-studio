'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG = 'press';
const HOST = 'zenbin.org';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const req = https.request({
      hostname: HOST, port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, 'press.pen'), 'utf8');
const pen     = JSON.parse(penJson);

// ── Hero Page ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PRESS — Your Editorial Morning Brief</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#F5F0E6;--surface:#FDFAF3;--surface2:#EDE8DB;
    --border:#D9D2C1;--border2:#C8BFA8;
    --text:#1A1510;--text2:#4A4038;--text3:#8C7B6A;
    --accent:#C8440C;--accent2:#2A4A6B;--accent3:#E8600F;
    --gold:#B5860A;--green:#2D6B4A;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* MASTHEAD HERO */
  .hero{
    min-height:100vh;display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    padding:60px 24px 80px;
    background:var(--bg);
    position:relative;overflow:hidden;
  }
  .hero::before{
    content:'';position:absolute;inset:0;
    background:repeating-linear-gradient(
      0deg,transparent,transparent 23px,rgba(26,21,16,0.04) 23px,rgba(26,21,16,0.04) 24px
    );
    pointer-events:none;
  }
  .edition-line{
    font-family:'Inter',sans-serif;font-size:10px;font-weight:600;
    letter-spacing:3px;color:var(--text3);margin-bottom:16px;
    text-align:center;text-transform:uppercase;
  }
  .rule-double{
    width:min(560px,90vw);margin:0 auto 0;
  }
  .rule-double .r1{border-top:3px solid var(--text);margin-bottom:4px;}
  .rule-double .r2{border-top:1px solid var(--text3);}
  .masthead{
    font-family:'Playfair Display',serif;
    font-size:clamp(72px,15vw,180px);
    font-weight:800;line-height:0.9;
    letter-spacing:-4px;color:var(--text);
    text-align:center;margin:20px 0 8px;
  }
  .masthead-sub{
    font-family:'Inter',sans-serif;font-size:11px;font-weight:600;
    letter-spacing:4px;color:var(--text3);text-align:center;margin-bottom:20px;
    text-transform:uppercase;
  }
  .rule-thin{width:min(560px,90vw);margin:0 auto 24px;border-top:1px solid var(--border2);}
  .dateline{
    display:flex;gap:24px;align-items:center;justify-content:center;
    font-size:10px;font-weight:600;letter-spacing:2px;color:var(--text3);
    margin-bottom:40px;text-transform:uppercase;
  }
  .dateline span{opacity:0.5;}

  .hero-desc{
    font-family:'Playfair Display',serif;font-size:clamp(18px,3vw,26px);
    font-style:italic;font-weight:400;color:var(--text2);
    text-align:center;max-width:560px;line-height:1.5;margin-bottom:40px;
  }

  .cta-row{display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:64px;}
  .cta-primary{
    background:var(--accent);color:#fff;
    font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
    padding:14px 32px;border-radius:0;text-decoration:none;
    border:2px solid var(--accent);transition:all 0.2s;
  }
  .cta-primary:hover{background:var(--accent3);border-color:var(--accent3);}
  .cta-secondary{
    background:transparent;color:var(--text);
    font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;
    padding:14px 28px;border:2px solid var(--border2);text-decoration:none;
    transition:all 0.2s;
  }
  .cta-secondary:hover{border-color:var(--text2);color:var(--text2);}

  /* NEWSPAPER COLUMNS FEATURE SECTION */
  .columns-section{
    background:var(--surface);border-top:3px solid var(--text);border-bottom:1px solid var(--text3);
    padding:64px 24px;
  }
  .section-overline{
    text-align:center;font-size:10px;font-weight:700;letter-spacing:3px;
    color:var(--text3);text-transform:uppercase;margin-bottom:8px;
  }
  .section-title{
    font-family:'Playfair Display',serif;
    font-size:clamp(28px,5vw,48px);font-weight:800;
    text-align:center;color:var(--text);margin-bottom:48px;line-height:1.15;
  }
  .columns-grid{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:0;max-width:900px;margin:0 auto;
  }
  .column-item{
    padding:28px 28px;border-right:1px solid var(--border);
    position:relative;
  }
  .column-item:last-child{border-right:none;}
  .column-item::before{
    content:attr(data-num);
    font-family:'Playfair Display',serif;font-size:48px;font-weight:800;
    color:var(--border2);line-height:1;display:block;margin-bottom:12px;
  }
  .column-item h3{
    font-family:'Playfair Display',serif;font-size:18px;font-weight:700;
    color:var(--text);margin-bottom:8px;
  }
  .column-item p{font-size:13px;color:var(--text2);line-height:1.6;}

  /* BEAT TAGS */
  .beats-section{background:var(--bg);padding:64px 24px;text-align:center;border-bottom:1px solid var(--border);}
  .beats-title{
    font-size:10px;font-weight:700;letter-spacing:3px;color:var(--text3);
    text-transform:uppercase;margin-bottom:24px;
  }
  .beats-grid{
    display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:700px;margin:0 auto;
  }
  .beat-pill{
    background:transparent;border:1.5px solid var(--border2);
    color:var(--text2);font-size:10px;font-weight:700;
    letter-spacing:1.5px;padding:8px 18px;text-transform:uppercase;
    border-radius:0;cursor:default;
  }
  .beat-pill.hot{background:var(--accent);border-color:var(--accent);color:#fff;}
  .beat-pill.mid{background:var(--accent2);border-color:var(--accent2);color:#fff;}

  /* SCREENS PREVIEW */
  .screens-section{
    background:var(--surface2);padding:64px 24px;
    border-top:3px solid var(--text);border-bottom:1px solid var(--text3);
  }
  .screens-grid{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
    gap:24px;max-width:1100px;margin:0 auto 48px;
  }
  .screen-card{
    background:var(--surface);border:1px solid var(--border);padding:32px 24px;
  }
  .screen-num{
    font-family:'Playfair Display',serif;font-size:32px;font-weight:800;
    color:var(--border2);line-height:1;margin-bottom:8px;
  }
  .screen-card h3{
    font-family:'Playfair Display',serif;font-size:17px;font-weight:700;
    color:var(--text);margin-bottom:8px;
  }
  .screen-card p{font-size:12px;color:var(--text3);line-height:1.5;}
  .screen-tag{
    display:inline-block;background:var(--accent);color:#fff;
    font-size:9px;font-weight:700;letter-spacing:1.5px;
    padding:3px 10px;margin-bottom:12px;
  }

  /* STATS STRIP */
  .stats-strip{
    background:var(--text);padding:40px 24px;
    display:flex;justify-content:center;gap:0;flex-wrap:wrap;
  }
  .stat-item{
    padding:16px 40px;border-right:1px solid rgba(245,240,230,0.15);
    text-align:center;
  }
  .stat-item:last-child{border-right:none;}
  .stat-val{font-family:'Playfair Display',serif;font-size:40px;font-weight:800;color:var(--bg);line-height:1;}
  .stat-label{font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(245,240,230,0.5);text-transform:uppercase;margin-top:6px;}

  /* FOOTER */
  .footer{
    background:var(--surface2);border-top:3px solid var(--text);padding:40px 24px;
    text-align:center;
  }
  .footer-title{
    font-family:'Playfair Display',serif;font-size:28px;font-weight:800;
    color:var(--text);margin-bottom:8px;letter-spacing:-1px;
  }
  .footer-sub{font-size:11px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:24px;}
  .footer-links{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;}
  .footer-links a{font-size:11px;color:var(--accent2);font-weight:600;letter-spacing:1px;text-decoration:none;text-transform:uppercase;}
  .ram-credit{margin-top:32px;font-size:10px;color:var(--text3);letter-spacing:1px;}
</style>
</head>
<body>

<!-- HERO MASTHEAD -->
<section class="hero">
  <p class="edition-line">First Edition — April 2026</p>
  <div class="rule-double"><div class="r1"></div><div class="r2"></div></div>
  <h1 class="masthead">PRESS</h1>
  <p class="masthead-sub">Your Curated Morning Edition</p>
  <div class="rule-thin"></div>
  <div class="dateline">
    <span>TUESDAY, APRIL 7, 2026</span>
    <span>·</span>
    <span>VOL. MCMXXVI · NO. 97</span>
    <span>·</span>
    <span>5 BEATS · 94 SOURCES</span>
  </div>
  <p class="hero-desc">The world's news, curated like a morning newspaper.<br/>Your beats. Your briefing. Your editorial voice.</p>
  <div class="cta-row">
    <a class="cta-primary" href="https://ram.zenbin.org/press-viewer">View Design</a>
    <a class="cta-secondary" href="https://ram.zenbin.org/press-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- COLUMNS FEATURES -->
<section class="columns-section">
  <p class="section-overline">How It Works</p>
  <h2 class="section-title">Journalism for your<br/>daily intelligence routine</h2>
  <div class="columns-grid">
    <div class="column-item" data-num="I">
      <h3>Choose Your Beats</h3>
      <p>Select the topics you cover — from AI and climate to markets and culture. PRESS builds your editorial board.</p>
    </div>
    <div class="column-item" data-num="II">
      <h3>Get Your Front Page</h3>
      <p>Every morning, a curated front page lands in your feed — ordered by importance, freshness, and your reading history.</p>
    </div>
    <div class="column-item" data-num="III">
      <h3>Read with Depth</h3>
      <p>Editorial reading view with audio briefing, pull quotes, and byline context. No noise, no ads.</p>
    </div>
    <div class="column-item" data-num="IV">
      <h3>Weekly Digest</h3>
      <p>A Sunday edition compiles the week's most important stories — with reading stats and your top sources.</p>
    </div>
  </div>
</section>

<!-- BEATS -->
<section class="beats-section">
  <p class="beats-title">Available Beats</p>
  <div class="beats-grid">
    <span class="beat-pill hot">Artificial Intelligence</span>
    <span class="beat-pill mid">Global Markets</span>
    <span class="beat-pill">Climate &amp; Environment</span>
    <span class="beat-pill">Science &amp; Discovery</span>
    <span class="beat-pill">Politics &amp; Policy</span>
    <span class="beat-pill">Culture &amp; Arts</span>
    <span class="beat-pill">Biotech &amp; Health</span>
    <span class="beat-pill">Space Exploration</span>
    <span class="beat-pill">Technology Business</span>
    <span class="beat-pill">International Affairs</span>
  </div>
</section>

<!-- SCREENS PREVIEW -->
<section class="screens-section">
  <p class="section-overline">Design Screens</p>
  <h2 class="section-title">Six editorial views</h2>
  <div class="screens-grid">
    <div class="screen-card">
      <p class="screen-num">01</p>
      <span class="screen-tag">FRONT PAGE</span>
      <h3>Morning Edition</h3>
      <p>Newspaper masthead, hero story, 2-column grid, and brief items — the full front page experience.</p>
    </div>
    <div class="screen-card">
      <p class="screen-num">02</p>
      <span class="screen-tag">READ</span>
      <h3>Article View</h3>
      <p>Editorial typography, pull quotes, audio briefing pill, and clean reading layout.</p>
    </div>
    <div class="screen-card">
      <p class="screen-num">03</p>
      <span class="screen-tag">BEATS</span>
      <h3>Coverage Areas</h3>
      <p>Manage your editorial beats with live article counts, source totals, and suggested topics.</p>
    </div>
    <div class="screen-card">
      <p class="screen-num">04</p>
      <span class="screen-tag">DIGEST</span>
      <h3>Weekly Edition</h3>
      <p>A Sunday-style digest with reading stats, beat breakdown bars, and editor's story pick.</p>
    </div>
    <div class="screen-card">
      <p class="screen-num">05</p>
      <span class="screen-tag">SAVED</span>
      <h3>Bookmarks</h3>
      <p>Saved stories with filter tabs, article thumbnails, and excerpt preview in editorial card style.</p>
    </div>
    <div class="screen-card">
      <p class="screen-num">06</p>
      <span class="screen-tag">SOURCES</span>
      <h3>Editorial Board</h3>
      <p>Source management with ranked list, article counts, and reading preferences with toggles.</p>
    </div>
  </div>
  <div style="text-align:center">
    <a class="cta-primary" href="https://ram.zenbin.org/press-viewer">View Full Design →</a>
  </div>
</section>

<!-- STATS -->
<div class="stats-strip">
  <div class="stat-item"><p class="stat-val">491</p><p class="stat-label">Elements</p></div>
  <div class="stat-item"><p class="stat-val">6</p><p class="stat-label">Screens</p></div>
  <div class="stat-item"><p class="stat-val">94</p><p class="stat-label">Sources</p></div>
  <div class="stat-item"><p class="stat-val">5</p><p class="stat-label">Beats</p></div>
</div>

<!-- FOOTER -->
<footer class="footer">
  <p class="footer-title">PRESS</p>
  <p class="footer-sub">Your Editorial Morning Brief</p>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/press-viewer">Design Viewer</a>
    <a href="https://ram.zenbin.org/press-mock">Interactive Mock</a>
  </div>
  <p class="ram-credit">Designed by RAM · RAM Design Heartbeat · April 2026</p>
</footer>

</body>
</html>`;

// ── Pencil Viewer ──────────────────────────────────────────────────────────
// Fetch the viewer template from an existing published viewer
const viewerBase = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PRESS — Design Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#F5F0E6;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:Inter,sans-serif}
header{width:100%;background:#1A1510;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
header h1{color:#F5F0E6;font-size:18px;font-weight:800;letter-spacing:-0.5px}
header a{color:#C8440C;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none}
#viewer-container{width:100%;max-width:420px;margin:32px auto;padding:0 16px 80px}
#pencil-viewer{width:100%;border:1px solid #D9D2C1;background:#FDFAF3;min-height:400px}
</style>
</head>
<body>
<header>
  <h1>PRESS — Viewer</h1>
  <a href="https://ram.zenbin.org/press">← Back to Design</a>
</header>
<div id="viewer-container">
  <div id="pencil-viewer">
    <p style="padding:40px;color:#8C7B6A;font-size:13px;text-align:center">Loading design viewer…</p>
  </div>
</div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
// Basic renderer for the pen file
(function() {
  const pen = JSON.parse(window.EMBEDDED_PEN);
  const container = document.getElementById('pencil-viewer');
  const W = pen.canvas.width;
  const H = pen.canvas.height;
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.setAttribute('width','100%');
  svg.style.display='block';
  pen.elements.forEach(el => {
    let node;
    if(el.type==='rect'){
      node=document.createElementNS('http://www.w3.org/2000/svg','rect');
      node.setAttribute('x',el.x);node.setAttribute('y',el.y);
      node.setAttribute('width',el.width);node.setAttribute('height',el.height);
      node.setAttribute('fill',el.fill||'none');
      if(el.rx)node.setAttribute('rx',el.rx);
      if(el.stroke){node.setAttribute('stroke',el.stroke);node.setAttribute('stroke-width',el.strokeWidth||1);}
      if(el.opacity!==undefined)node.setAttribute('opacity',el.opacity);
    } else if(el.type==='ellipse'){
      node=document.createElementNS('http://www.w3.org/2000/svg','ellipse');
      node.setAttribute('cx',el.cx);node.setAttribute('cy',el.cy);
      node.setAttribute('rx',el.rx);node.setAttribute('ry',el.ry);
      node.setAttribute('fill',el.fill||'none');
      if(el.stroke){node.setAttribute('stroke',el.stroke);node.setAttribute('stroke-width',el.strokeWidth||1);}
      if(el.opacity!==undefined)node.setAttribute('opacity',el.opacity);
    } else if(el.type==='line'){
      node=document.createElementNS('http://www.w3.org/2000/svg','line');
      node.setAttribute('x1',el.x1);node.setAttribute('y1',el.y1);
      node.setAttribute('x2',el.x2);node.setAttribute('y2',el.y2);
      node.setAttribute('stroke',el.stroke||'#000');
      node.setAttribute('stroke-width',el.strokeWidth||1);
      if(el.opacity!==undefined)node.setAttribute('opacity',el.opacity);
    } else if(el.type==='text'){
      node=document.createElementNS('http://www.w3.org/2000/svg','text');
      node.setAttribute('x',el.x);node.setAttribute('y',el.y);
      node.setAttribute('fill',el.fill||'#000');
      node.setAttribute('font-size',el.fontSize||14);
      node.setAttribute('font-weight',el.fontWeight||'400');
      node.setAttribute('font-family',el.fontFamily||'Inter, sans-serif');
      if(el.textAlign==='center')node.setAttribute('text-anchor','middle');
      if(el.opacity!==undefined)node.setAttribute('opacity',el.opacity);
      if(el.letterSpacing)node.setAttribute('letter-spacing',el.letterSpacing);
      node.textContent=el.content||'';
    }
    if(node)svg.appendChild(node);
  });
  container.innerHTML='';
  container.appendChild(svg);
})();
</script>
</body>
</html>`;

async function main() {
  console.log('Publishing PRESS design pipeline...\n');

  // Hero page
  let r = await publish(SLUG, heroHtml, 'PRESS — Your Editorial Morning Brief');
  console.log('Hero page:', r.status === 200 ? `✓ https://ram.zenbin.org/${SLUG}` : r.body.slice(0, 120));

  // Viewer
  r = await publish(SLUG + '-viewer', viewerBase, 'PRESS — Design Viewer');
  console.log('Viewer:   ', r.status === 200 ? `✓ https://ram.zenbin.org/${SLUG}-viewer` : r.body.slice(0, 120));
}

main().catch(console.error);
