'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG = 'acta';
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

const penJson = fs.readFileSync(path.join(__dirname, 'acta.pen'), 'utf8');
const pen     = JSON.parse(penJson);
const screens = pen.artboards.map(a => a.name);

// ── HERO PAGE ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ACTA — Creative Sprint Velocity for Studios</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#070A10;
  --surface:#0F1420;
  --surface2:#161C2C;
  --surface3:#1D2438;
  --border:#1E2740;
  --border2:#2A3558;
  --text:#EEF0FF;
  --text2:#8B96B4;
  --text3:#4A5578;
  --accent:#4B6CF7;
  --accent2:#7C5AF7;
  --cyan:#00D2FF;
  --green:#22D3A8;
  --amber:#F59E0B;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

/* ── HERO ── */
.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:80px 24px 100px;
  position:relative;overflow:hidden;
}
/* electric grid background (Lusion-inspired) */
.hero::before{
  content:'';position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(75,108,247,0.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(75,108,247,0.06) 1px,transparent 1px);
  background-size:40px 40px;
  pointer-events:none;
}
/* deep vignette */
.hero::after{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 80% 60% at 50% 50%,transparent 40%,var(--bg) 100%);
  pointer-events:none;
}
.hero-inner{position:relative;z-index:1;text-align:center;max-width:900px;}

.act-label{
  font-size:11px;font-weight:600;letter-spacing:3px;
  color:var(--accent);text-transform:uppercase;margin-bottom:24px;
  display:inline-block;
}

.wordmark{
  font-size:clamp(80px,18vw,200px);
  font-weight:900;
  letter-spacing:-0.04em;
  line-height:0.9;
  color:var(--text);
  margin-bottom:0;
}

/* Electric cobalt underline (Lusion glow bar) */
.glow-rule{
  width:clamp(160px,25vw,320px);
  height:3px;
  background:var(--accent);
  margin:24px auto 32px;
  position:relative;
}
.glow-rule::after{
  content:'';position:absolute;inset:-4px;
  background:var(--accent);
  filter:blur(8px);opacity:0.4;
  border-radius:2px;
}

.tagline{
  font-size:clamp(16px,2.5vw,22px);
  font-weight:400;
  color:var(--text2);
  line-height:1.5;
  max-width:560px;
  margin:0 auto 48px;
}
.tagline em{color:var(--text);font-style:normal;font-weight:500;}

.hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
.btn-primary{
  background:var(--accent);color:#fff;
  padding:14px 32px;border-radius:12px;
  font-size:15px;font-weight:600;
  text-decoration:none;letter-spacing:0.01em;
  transition:opacity 0.2s;
}
.btn-primary:hover{opacity:0.85;}
.btn-ghost{
  border:1px solid var(--border2);color:var(--text2);
  padding:14px 32px;border-radius:12px;
  font-size:15px;font-weight:500;
  text-decoration:none;letter-spacing:0.01em;
  transition:border-color 0.2s,color 0.2s;
}
.btn-ghost:hover{border-color:var(--accent);color:var(--text);}

/* ── INSPIRATION CALLOUT ── */
.inspiration{
  max-width:760px;margin:0 auto 80px;
  padding:32px 40px;
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:20px;
  position:relative;
}
.inspiration-label{
  font-size:9px;font-weight:700;letter-spacing:2.5px;
  color:var(--text3);text-transform:uppercase;margin-bottom:12px;
}
.inspiration p{font-size:14px;color:var(--text2);line-height:1.7;}
.inspiration p strong{color:var(--accent);font-weight:600;}
.ins-accent{
  position:absolute;top:0;left:40px;right:40px;height:2px;
  background:linear-gradient(90deg,transparent,var(--accent),transparent);
}

/* ── SCREENS ── */
.screens-section{padding:0 24px 100px;max-width:1200px;margin:0 auto;}
.section-label{
  font-size:9px;font-weight:700;letter-spacing:2.5px;
  color:var(--text3);text-transform:uppercase;
  text-align:center;margin-bottom:48px;
}

.screens-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:24px;
}

.screen-card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:20px;
  overflow:hidden;
  transition:transform 0.3s,border-color 0.3s;
}
.screen-card:hover{
  transform:translateY(-4px);
  border-color:var(--accent);
}
.screen-preview{
  height:320px;
  background:var(--bg);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
  border-bottom:1px solid var(--border);
  position:relative;
}

/* mini phone mockup */
.phone-mock{
  width:160px;height:290px;
  background:var(--surface2);
  border-radius:24px;
  border:1px solid var(--border2);
  display:flex;flex-direction:column;
  align-items:center;justify-content:flex-start;
  padding:16px 10px 10px;
  position:relative;overflow:hidden;
}
/* Screen-specific gradient tops */
.sc-0 .phone-top{background:linear-gradient(135deg,var(--accent),var(--accent2));}
.sc-1 .phone-top{background:linear-gradient(135deg,var(--accent),#1a2ffb);}
.sc-2 .phone-top{background:linear-gradient(135deg,var(--accent2),var(--accent));}
.sc-3 .phone-top{background:linear-gradient(135deg,var(--cyan),var(--accent));}
.sc-4 .phone-top{background:linear-gradient(135deg,var(--green),var(--accent));}
.sc-5 .phone-top{background:linear-gradient(135deg,var(--green),var(--accent2));}

.phone-top{
  width:100%;height:80px;border-radius:14px;margin-bottom:10px;
  position:relative;overflow:hidden;flex-shrink:0;
}
.phone-top::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 60%);
}
.phone-lines{width:100%;flex:1;display:flex;flex-direction:column;gap:6px;padding:0 4px;}
.phone-line{background:var(--surface3);border-radius:3px;flex-shrink:0;}
.phone-line.full{height:8px;width:100%;}
.phone-line.half{height:8px;width:55%;}
.phone-line.third{height:8px;width:35%;}
.phone-line.accent{background:var(--accent);opacity:0.7;}
.phone-line.cyan{background:var(--cyan);opacity:0.6;width:40%;}
.phone-line.thin{height:4px;width:80%;}
.phone-line.mini{height:4px;width:50%;}
.phone-nav{
  width:100%;height:18px;
  background:var(--surface);
  border-radius:8px;margin-top:8px;
  display:flex;align-items:center;justify-content:space-around;
  flex-shrink:0;
  border-top:1px solid var(--border);
}
.phone-nav-dot{
  width:20px;height:4px;background:var(--surface3);border-radius:2px;
}
.phone-nav-dot.active{background:var(--accent);}

.screen-meta{padding:16px 20px;}
.screen-num{
  font-size:9px;font-weight:600;letter-spacing:2px;
  color:var(--accent);text-transform:uppercase;margin-bottom:4px;
}
.screen-name{font-size:15px;font-weight:600;color:var(--text);}

/* ── DESIGN DECISIONS ── */
.decisions{
  max-width:840px;margin:0 auto;
  padding:0 24px 100px;
}
.decisions-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
  gap:20px;
}
.decision-card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:16px;
  padding:28px;
}
.d-num{
  font-size:10px;font-weight:700;letter-spacing:2px;
  color:var(--accent);margin-bottom:12px;
}
.d-title{font-size:16px;font-weight:700;color:var(--text);margin-bottom:10px;}
.d-body{font-size:13px;color:var(--text2);line-height:1.65;}

/* ── PALETTE ── */
.palette-row{
  display:flex;gap:12px;justify-content:center;flex-wrap:wrap;
  max-width:800px;margin:0 auto 80px;padding:0 24px;
}
.swatch{
  display:flex;flex-direction:column;align-items:center;gap:8px;
}
.swatch-dot{
  width:48px;height:48px;border-radius:12px;
  border:1px solid rgba(255,255,255,0.08);
}
.swatch-label{font-size:10px;color:var(--text3);letter-spacing:0.5px;}

/* ── FOOTER ── */
footer{
  text-align:center;padding:40px 24px;
  border-top:1px solid var(--border);
  color:var(--text3);font-size:12px;
}
footer a{color:var(--accent);text-decoration:none;}

/* ── SECTIONS HEADER ── */
.section-header{text-align:center;padding:80px 24px 48px;}
.section-header h2{
  font-size:clamp(32px,5vw,56px);font-weight:800;
  color:var(--text);letter-spacing:-0.03em;margin-bottom:16px;
}
.section-header p{font-size:16px;color:var(--text2);max-width:480px;margin:0 auto;}
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <span class="act-label">RAM Design Studio · Act 09</span>
    <h1 class="wordmark">ACTA</h1>
    <div class="glow-rule"></div>
    <p class="tagline">
      Creative sprint velocity for studios.<br/>
      <em>Organize projects as acts. Move through them like chapters.</em>
    </p>
    <div class="hero-ctas">
      <a href="/acta-viewer" class="btn-primary">View Prototype →</a>
      <a href="/acta-mock" class="btn-ghost">Interactive Mock ☀◑</a>
    </div>
  </div>
</section>

<!-- INSPIRATION CALLOUT -->
<div style="max-width:760px;margin:0 auto 80px;padding:0 24px;">
  <div class="inspiration">
    <div class="ins-accent"></div>
    <p class="inspiration-label">Design Inspiration</p>
    <p>
      Directly inspired by <strong>Linear: Change</strong> (featured on godly.website, Apr 2026) — 
      pure black canvas, weight-590 Inter at 128px, "Redaction" serif chapter headers, 
      and the chapter-scroll architecture where complex work is broken into <em>acts</em> 
      with their own narrative arc. Combined with <strong>Lusion.co</strong>'s electric cobalt 
      #1A2FFB atmosphere, massive geometric type, and lavender-tinted surfaces (#F0F1FA) 
      to create a dark studio tool that feels like stepping into a project's story, not a spreadsheet.
    </p>
  </div>
</div>

<!-- SCREENS -->
<div class="screens-section">
  <p class="section-label">6 Screens · Dark UI</p>
  <div class="screens-grid">
    ${screens.map((name, i) => `
    <div class="screen-card sc-${i}">
      <div class="screen-preview">
        <div class="phone-mock">
          <div class="phone-top"></div>
          <div class="phone-lines">
            <div class="phone-line full"></div>
            <div class="phone-line half"></div>
            <div class="phone-line accent full"></div>
            <div class="phone-line thin"></div>
            <div class="phone-line full"></div>
            <div class="phone-line mini"></div>
            <div class="phone-line third ${i % 2 === 0 ? 'cyan' : 'accent'}"></div>
            <div class="phone-line full"></div>
            <div class="phone-line half"></div>
            <div class="phone-line thin"></div>
            <div class="phone-line full"></div>
          </div>
          <div class="phone-nav">
            <div class="phone-nav-dot ${i === 0 || i === 5 ? 'active' : ''}"></div>
            <div class="phone-nav-dot ${i === 1 || i === 2 || i === 4 ? 'active' : ''}"></div>
            <div class="phone-nav-dot ${i === 3 ? 'active' : ''}"></div>
            <div class="phone-nav-dot"></div>
          </div>
        </div>
      </div>
      <div class="screen-meta">
        <p class="screen-num">Screen ${String(i+1).padStart(2,'0')}</p>
        <p class="screen-name">${name}</p>
      </div>
    </div>`).join('')}
  </div>
</div>

<!-- PALETTE -->
<p class="section-label" style="padding-top:0;">Palette</p>
<div class="palette-row">
  ${[
    ['#070A10','BG'],['#0F1420','Surface'],['#161C2C','Card'],
    ['#4B6CF7','Cobalt'],['#7C5AF7','Violet'],['#00D2FF','Cyan'],
    ['#22D3A8','Green'],['#F59E0B','Amber'],['#EEF0FF','Text'],
  ].map(([hex,name]) => `
  <div class="swatch">
    <div class="swatch-dot" style="background:${hex};"></div>
    <span class="swatch-label">${name}</span>
  </div>`).join('')}
</div>

<!-- DESIGN DECISIONS -->
<div class="section-header">
  <h2>Design Decisions</h2>
  <p>Three choices that define ACTA's visual language.</p>
</div>
<div class="decisions">
  <div class="decisions-grid">
    <div class="decision-card">
      <p class="d-num">01</p>
      <h3 class="d-title">Acts, not lists</h3>
      <p class="d-body">Projects are organized as narrative "Acts" (Linear: Change's chapter metaphor). Each act card uses a massive 19–38px headline instead of a row label, making the project feel like a story beat rather than a record in a table. Sprint progress maps to chapters within each act.</p>
    </div>
    <div class="decision-card">
      <p class="d-num">02</p>
      <h3 class="d-title">Electric cobalt on deep space black</h3>
      <p class="d-body">Background #070A10 is darker than pure black — it has a subtle blue temperature that makes the cobalt accent #4B6CF7 feel electric rather than flat. Inspired by Lusion.co's #1A2FFB on near-black, blended with Linear's #5E6AD2 purple. The glow bar (3px accent + 4px opacity blur) adds depth without gradients.</p>
    </div>
    <div class="decision-card">
      <p class="d-num">03</p>
      <h3 class="d-title">Serif editorial in dark context</h3>
      <p class="d-body">The Creative Brief screen uses Georgia at weight-300 for act titles — a serif in a dark UI context is unexpected and creates the feeling of reading a document rather than operating software. Lifted from Linear's "Redaction" font choice for its chapter headers. Contrast between the 9px all-caps labels and 24px serif headlines creates strong typographic hierarchy.</p>
    </div>
  </div>
</div>

<footer>
  <p>ACTA — Built by <a href="/">RAM Design Studio</a> · Inspired by Linear: Change &amp; Lusion.co</p>
</footer>

</body>
</html>`;

// ── VIEWER PAGE ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer-template.html'), 'utf8')
  .replace(/PLACEHOLDER_TITLE/g, 'ACTA — Creative Sprint Velocity')
  .replace(/PLACEHOLDER_SLUG/g, SLUG);

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'ACTA — Creative Sprint Velocity for Studios');
  console.log('  hero:', r1.status, r1.body.slice(0,80));

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, 'ACTA — Viewer');
  console.log('  viewer:', r2.status, r2.body.slice(0,80));

  console.log(`✓ Live at https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer at https://ram.zenbin.org/${SLUG}-viewer`);
})();
