const https = require('https');
const fs = require('fs');
const path = require('path');

const SLUG  = 'mint';
const TITLE = 'MINT — Freelance Finance, Clearly';

const penJson = fs.readFileSync(path.join(__dirname,'mint.pen'),'utf8');
const design  = JSON.parse(penJson);

function svgDataUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Build SVG representations of each screen
function screenToSVG(screen) {
  const { width:W, height:H, elements:els } = screen;
  let paths = '';
  els.forEach(el => {
    if (!el) return;
    switch(el.type) {
      case 'rect':
        paths += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"
          fill="${el.fill||'none'}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"
          rx="${el.rx||0}" ry="${el.ry||0}" opacity="${el.opacity||1}"/>`;
        break;
      case 'text':
        paths += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize||12}"
          fill="${el.fill||'#000'}" font-weight="${el.fontWeight||400}"
          text-anchor="${el.textAnchor||'start'}"
          font-family="${el.fontFamily||'Inter,sans-serif'}"
          letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity||1}">${String(el.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
        break;
      case 'line':
        paths += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"
          stroke="${el.stroke||'#000'}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
        break;
      case 'circle':
        paths += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}"
          fill="${el.fill||'none'}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}" opacity="${el.opacity||1}"/>`;
        break;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${paths}</svg>`;
}

const m = design.metadata;
const BG='#F5F0E8', ACCENT='#2A4D2A', GOLD='#C8973C', TEXT='#1C1A16', TEXT3='#9A9080', BORDER='#DDD5C5';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${TITLE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${BG}; --surface:#FEFCF7; --accent:${ACCENT}; --gold:${GOLD};
    --text:${TEXT}; --text2:#5A5448; --text3:${TEXT3}; --border:${BORDER};
    --shadow: 0 2px 8px rgba(28,26,22,.08), 0 8px 24px rgba(28,26,22,.06);
    --shadow-lg: 0 12px 40px rgba(28,26,22,.14);
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* MASTHEAD */
  .masthead{
    background:var(--accent);
    padding:20px 0 16px;
    text-align:center;
    letter-spacing:.2em;
    font-size:11px;font-weight:700;color:rgba(255,255,255,.6);
  }
  .masthead strong{color:#fff;font-size:28px;letter-spacing:.15em;font-family:'Playfair Display',serif;display:block;margin-bottom:4px;}

  /* HERO */
  .hero{
    max-width:960px;margin:0 auto;padding:64px 24px 48px;
    display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;
  }
  @media(max-width:680px){.hero{grid-template-columns:1fr;padding:40px 20px 32px}}
  .hero-editorial h1{
    font-family:'Inter',sans-serif;
    font-size:clamp(72px,14vw,120px);
    font-weight:700;
    line-height:1;
    letter-spacing:-4px;
    color:var(--accent);
    margin-bottom:8px;
  }
  .hero-editorial .hero-sub{
    font-family:'Playfair Display',serif;
    font-style:italic;
    font-size:clamp(18px,2.5vw,22px);
    color:var(--text2);
    margin-bottom:24px;
  }
  .hero-editorial .badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(42,77,42,.1);border:1px solid rgba(42,77,42,.25);
    color:var(--accent);padding:6px 16px;border-radius:100px;
    font-size:11px;font-weight:700;letter-spacing:.1em;margin-bottom:32px;
  }
  .hero-editorial p{font-size:15px;color:var(--text2);line-height:1.7;margin-bottom:32px;max-width:380px;}
  .cta-row{display:flex;gap:12px;flex-wrap:wrap;}
  .btn-primary{
    background:var(--accent);color:#fff;padding:12px 24px;border-radius:100px;
    font-size:13px;font-weight:700;text-decoration:none;letter-spacing:.03em;
    box-shadow:0 8px 24px rgba(42,77,42,.3);
  }
  .btn-secondary{
    background:var(--surface);color:var(--text2);padding:12px 24px;border-radius:100px;
    font-size:13px;font-weight:600;text-decoration:none;border:1.5px solid var(--border);
  }

  /* SCREENS */
  .screens-showcase{
    display:flex;align-items:flex-end;justify-content:center;gap:12px;
    overflow:hidden;
  }
  .phone-frame{
    flex-shrink:0;border-radius:32px;overflow:hidden;
    box-shadow:var(--shadow-lg);
    border:2px solid var(--border);
    transition:transform .3s ease;
  }
  .phone-frame:hover{transform:translateY(-8px);}
  .phone-frame.main{transform:scale(1.06);}
  .phone-frame.main:hover{transform:scale(1.06) translateY(-8px);}

  /* EDITORIAL DIVIDER */
  .editorial-divider{
    display:flex;align-items:center;gap:16px;
    max-width:960px;margin:0 auto;padding:0 24px 40px;
  }
  .editorial-divider .line{flex:1;height:1px;background:var(--border);}
  .editorial-divider .label{font-size:9px;font-weight:700;letter-spacing:.2em;color:var(--text3);}

  /* FEATURES */
  .features{max-width:960px;margin:0 auto;padding:0 24px 64px;}
  .features h2{
    font-family:'Playfair Display',serif;
    font-size:clamp(28px,4vw,44px);
    margin-bottom:8px;color:var(--text);
  }
  .features .intro{font-size:15px;color:var(--text2);margin-bottom:40px;font-style:italic;
    font-family:'Playfair Display',serif;}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;}
  .feature-card{
    background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:24px;
    transition:border-color .2s,transform .2s;
  }
  .feature-card:hover{border-color:var(--accent);transform:translateY(-3px);}
  .f-icon{font-size:28px;margin-bottom:14px;}
  .feature-card h3{font-size:15px;font-weight:700;margin-bottom:6px;}
  .feature-card p{font-size:13px;color:var(--text2);line-height:1.6;}

  /* PALETTE */
  .palette-section{max-width:960px;margin:0 auto;padding:0 24px 64px;text-align:center;}
  .palette-section h3{font-family:'Playfair Display',serif;font-size:22px;margin-bottom:24px;}
  .swatches{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
  .swatch{width:72px;height:72px;border-radius:12px;display:flex;align-items:flex-end;
    padding:6px;font-size:8px;font-weight:700;}

  /* STATS */
  .stat-strip{background:var(--accent);padding:40px 24px;}
  .stat-inner{max-width:960px;margin:0 auto;display:grid;
    grid-template-columns:repeat(3,1fr);gap:24px;text-align:center;}
  .stat-num{font-size:42px;font-weight:700;color:#fff;letter-spacing:-2px;
    font-family:'Inter',sans-serif;}
  .stat-label{font-size:10px;color:rgba(255,255,255,.6);font-weight:700;letter-spacing:.15em;margin-top:4px;}

  /* FOOTER */
  footer{padding:32px 24px;text-align:center;border-top:1px solid var(--border);
    color:var(--text3);font-size:12px;}
  footer a{color:var(--accent);text-decoration:none;}
</style>
</head>
<body>

<div class="masthead">
  <strong>MINT</strong>
  FREELANCE FINANCE · RAM DESIGN · HEARTBEAT 7 · APRIL 2026
</div>

<section class="hero">
  <div class="hero-editorial">
    <div class="badge">✦ LIGHT THEME · EDITORIAL</div>
    <h1>$14,820</h1>
    <div class="hero-sub">Your April, at a glance.</div>
    <p>Freelance finance designed like a magazine. Your income number IS the hero — not buried in a dashboard. Mint treats your money with editorial authority.</p>
    <div class="cta-row">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Interactive Mock ☀◑</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">View Screens →</a>
    </div>
  </div>
  <div class="screens-showcase">
    ${design.screens.slice(0,3).map((s,i)=>{
      const svg = screenToSVG(s);
      const scales=[.28,.34,.28];
      const sc = scales[i]||.3;
      const w=Math.round(390*sc), h=Math.round(844*sc);
      return `<div class="phone-frame${i===1?' main':''}">
        <img src="${svgDataUri(svg)}" width="${w}" height="${h}" alt="${s.name}"/>
      </div>`;
    }).join('\n    ')}
  </div>
</section>

<div class="editorial-divider">
  <div class="line"></div>
  <div class="label">6 SCREENS · 521 ELEMENTS · LIGHT THEME</div>
  <div class="line"></div>
</div>

<section class="features">
  <h2>Finance with editorial clarity</h2>
  <p class="intro">Inspired by QP &amp; PW Magazine editorial layouts on Siteinspire — where the number IS the design.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="f-icon">◉</div>
      <h3>Overview</h3>
      <p>Giant display numerals as the hero — your monthly revenue at 88px fills the screen like a magazine cover. Type as visual.</p>
    </div>
    <div class="feature-card">
      <div class="f-icon">◈</div>
      <h3>Invoices</h3>
      <p>Editorial table with dark green summary strip and status pills. Send, track, and chase payments without the anxiety.</p>
    </div>
    <div class="feature-card">
      <div class="f-icon">◎</div>
      <h3>Cash Flow</h3>
      <p>6-month dual-bar chart with annotated pull-quotes. Your best month gets a callout, not just a data point.</p>
    </div>
    <div class="feature-card">
      <div class="f-icon">◍</div>
      <h3>Clients</h3>
      <p>Editorial profile cards with heat-ring relationship indicators. See client health at a glance — not just revenue.</p>
    </div>
    <div class="feature-card">
      <div class="f-icon">◧</div>
      <h3>Expenses</h3>
      <p>Journal-style log with category colour bars. Feels like writing in a ledger, not filing a spreadsheet.</p>
    </div>
    <div class="feature-card">
      <div class="f-icon">◌</div>
      <h3>Profile</h3>
      <p>Editorial "about you" — YTD stats in a masthead strip, settings listed with journalistic economy.</p>
    </div>
  </div>
</section>

<div class="stat-strip">
  <div class="stat-inner">
    <div><div class="stat-num">521</div><div class="stat-label">ELEMENTS</div></div>
    <div><div class="stat-num">6</div><div class="stat-label">SCREENS</div></div>
    <div><div class="stat-num">#7</div><div class="stat-label">HEARTBEAT</div></div>
  </div>
</div>

<section class="palette-section">
  <h3>Colour palette</h3>
  <div class="swatches">
    <div class="swatch" style="background:#F5F0E8;border:1px solid #DDD5C5;color:rgba(0,0,0,.5)">Parchment</div>
    <div class="swatch" style="background:#2A4D2A;color:rgba(255,255,255,.8)">Forest</div>
    <div class="swatch" style="background:#C8973C;color:rgba(255,255,255,.85)">Gold</div>
    <div class="swatch" style="background:#1C1A16;color:rgba(255,255,255,.7)">Warm Black</div>
    <div class="swatch" style="background:#E3EEE3;border:1px solid #DDD5C5;color:#2A4D2A">Sage Tint</div>
    <div class="swatch" style="background:#C0392B;color:white">Red</div>
    <div class="swatch" style="background:#EDE8DE;border:1px solid #DDD5C5;color:rgba(0,0,0,.4)">Surf 2</div>
  </div>
</section>

<footer>
  <p>Designed by <a href="https://ram.zenbin.org">RAM</a> · Design heartbeat #7 · April 2026</p>
  <p style="margin-top:6px">Inspired by QP Magazine &amp; PW Magazine editorial layouts (Siteinspire) · Linear DESIGN.md (awesome-design-md)</p>
</footer>

</body>
</html>`;

function publish(slug, title, body) {
  return new Promise((resolve,reject) => {
    const b = JSON.stringify({html:body,title});
    const req = https.request({
      hostname:'zenbin.org', path:`/v1/pages/${slug}`, method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(b),'X-Subdomain':'ram'},
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
    req.on('error',reject); req.write(b); req.end();
  });
}

async function main() {
  console.log('Publishing MINT hero page…');
  const r = await publish(SLUG, TITLE, html);
  console.log(`${SLUG} → ${r.status} — https://ram.zenbin.org/${SLUG}`);

  // Viewer
  let viewer = fs.readFileSync(path.join(__dirname,'penviewer-app.html'),'utf8');
  const inject = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewer = viewer.replace('<script>', inject + '\n<script>');
  const rv = await publish(SLUG+'-viewer', TITLE+' — Viewer', viewer);
  console.log(`${SLUG}-viewer → ${rv.status}`);
}

main().catch(console.error);
