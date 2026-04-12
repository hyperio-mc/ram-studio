'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG     = 'graph';
const APP_NAME = 'GRAPH';
const TAGLINE  = 'knowledge graph intelligence for developers';

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
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:'#080C16', surf:'#0D1425', card:'#121C36',
  acc:'#22D3EE', acc2:'#818CF8', acc3:'#34D399',
  text:'#E2E8F0', muted:'#64748B', border:'#1B2B4A',
};

// ── Screen SVG previews ───────────────────────────────────────────────────────
function screenToSvg(screen) {
  const W=390, H=844;
  const els = screen.elements.map(el => {
    if (el.type === 'rect') {
      const rx = el.rx || 0;
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"
        fill="${el.fill}" rx="${rx}" opacity="${el.opacity ?? 1}"
        stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}"/>`;
    }
    if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}"
        fill="${el.fill}" font-weight="${el.fontWeight || 400}"
        font-family="${el.fontFamily || 'Inter'}"
        text-anchor="${anchor}" opacity="${el.opacity ?? 1}"
        letter-spacing="${el.letterSpacing || 0}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}"
        fill="${el.fill}" opacity="${el.opacity ?? 1}"
        stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}"/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"
        stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"
        opacity="${el.opacity ?? 1}"/>`;
    }
    return '';
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${els}</svg>`;
}

const svgs = pen.screens.map(screenToSvg);
const dataUris = svgs.map(s => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`);

// ── Hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  :root{--bg:#080C16;--surf:#0D1425;--card:#121C36;--acc:#22D3EE;--acc2:#818CF8;--acc3:#34D399;--text:#E2E8F0;--muted:#64748B;--border:#1B2B4A;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden;}
  /* blueprint grid bg */
  body::before{content:'';position:fixed;inset:0;
    background-image:linear-gradient(var(--border) 1px,transparent 1px),
      linear-gradient(90deg,var(--border) 1px,transparent 1px);
    background-size:32px 32px;opacity:0.2;pointer-events:none;z-index:0;}

  .wrap{max-width:1200px;margin:0 auto;padding:0 24px;position:relative;z-index:1;}

  /* nav */
  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;position:relative;z-index:1;}
  .logo{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:var(--acc);letter-spacing:3px;}
  .logo span{color:var(--muted);font-weight:400;font-size:11px;margin-left:10px;letter-spacing:1px;}
  .nav-links{display:flex;gap:32px;list-style:none;}
  .nav-links a{color:var(--muted);text-decoration:none;font-size:13px;font-family:'JetBrains Mono',monospace;transition:color .2s;}
  .nav-links a:hover{color:var(--acc);}
  .nav-cta{background:var(--acc);color:var(--bg);padding:8px 20px;border-radius:20px;font-size:12px;font-weight:700;font-family:'JetBrains Mono',monospace;text-decoration:none;letter-spacing:1px;}

  /* blueprint corner marks */
  .bp-corner{position:absolute;width:20px;height:20px;}
  .bp-corner::before,.bp-corner::after{content:'';position:absolute;background:var(--acc);opacity:.4;}
  .bp-tl{top:20px;left:24px;} .bp-tl::before{width:2px;height:100%;} .bp-tl::after{height:2px;width:100%;top:0;}
  .bp-tr{top:20px;right:24px;} .bp-tr::before{width:2px;height:100%;right:0;} .bp-tr::after{height:2px;width:100%;top:0;}

  /* hero */
  .hero{padding:80px 24px 60px;text-align:center;position:relative;z-index:1;}
  .hero-badge{display:inline-block;background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.2);color:var(--acc);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;letter-spacing:2px;padding:5px 14px;border-radius:20px;margin-bottom:24px;}
  h1{font-size:clamp(52px,8vw,96px);font-weight:800;letter-spacing:-2px;line-height:1;margin-bottom:10px;}
  h1 .acc{color:var(--acc);}
  .sub{font-size:16px;color:var(--muted);margin:20px auto 0;max-width:520px;line-height:1.6;font-family:'JetBrains Mono',monospace;}
  .hero-actions{display:flex;gap:12px;justify-content:center;margin-top:36px;}
  .btn-primary{background:var(--acc);color:var(--bg);padding:12px 28px;border-radius:24px;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:1px;text-decoration:none;}
  .btn-secondary{border:1px solid var(--border);color:var(--text);padding:12px 28px;border-radius:24px;font-size:12px;font-family:'JetBrains Mono',monospace;text-decoration:none;}

  /* annotation line on hero */
  .hero-annotation{position:relative;display:inline-block;}
  .hero-annotation::after{content:'blueprint annotation aesthetic';position:absolute;left:calc(100% + 16px);top:50%;transform:translateY(-50%);font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(34,211,238,.5);white-space:nowrap;border-left:1px solid rgba(34,211,238,.3);padding-left:8px;}

  /* screens carousel */
  .screens{display:flex;gap:20px;justify-content:center;padding:20px 0 60px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
  .screens::-webkit-scrollbar{height:4px;}
  .screens::-webkit-scrollbar-track{background:var(--surf);}
  .screens::-webkit-scrollbar-thumb{background:var(--acc);border-radius:2px;}
  .screen-card{flex:0 0 200px;scroll-snap-align:center;background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:transform .2s,border-color .2s;}
  .screen-card:hover{transform:translateY(-4px);border-color:var(--acc);}
  .screen-card img{width:100%;display:block;}
  .screen-label{padding:8px 12px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}

  /* palette swatches */
  .palette-section{padding:40px 24px;position:relative;z-index:1;}
  .palette-title{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--acc);letter-spacing:2px;margin-bottom:16px;font-weight:600;}
  .swatches{display:flex;gap:12px;flex-wrap:wrap;}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:6px;}
  .swatch-color{width:48px;height:48px;border-radius:10px;border:1px solid var(--border);}
  .swatch-name{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);}

  /* features */
  .features{padding:40px 24px 60px;position:relative;z-index:1;}
  .features-title{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--acc);letter-spacing:2px;font-weight:600;margin-bottom:24px;}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;}
  .feature-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;}
  .feature-card .icon{font-size:20px;margin-bottom:12px;}
  .feature-card h3{font-size:14px;font-weight:600;margin-bottom:6px;}
  .feature-card p{font-size:12px;color:var(--muted);line-height:1.5;}
  .feature-card .tag{display:inline-block;margin-top:10px;background:rgba(34,211,238,.08);color:var(--acc);font-family:'JetBrains Mono',monospace;font-size:9px;padding:3px 8px;border-radius:6px;letter-spacing:1px;}

  /* links */
  .links-section{padding:40px 24px 60px;text-align:center;position:relative;z-index:1;}
  .links-section h2{font-size:28px;font-weight:700;margin-bottom:24px;}
  .links-grid{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
  .link-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px 28px;text-decoration:none;transition:border-color .2s;}
  .link-card:hover{border-color:var(--acc);}
  .link-card .link-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--acc);letter-spacing:2px;margin-bottom:4px;}
  .link-card .link-url{font-size:13px;color:var(--text);}

  /* footer */
  footer{text-align:center;padding:32px 24px;border-top:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);position:relative;z-index:1;}
  footer .bp-line{display:block;width:40px;height:1px;background:var(--acc);margin:12px auto 0;opacity:.4;}

  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
</style>
</head>
<body>

<div class="bp-corner bp-tl"></div>
<div class="bp-corner bp-tr"></div>

<nav>
  <div class="logo">GRAPH<span>v2.0</span></div>
  <ul class="nav-links">
    <li><a href="#">Explore</a></li>
    <li><a href="#">Query</a></li>
    <li><a href="#">Schema</a></li>
    <li><a href="#">Docs</a></li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">LIVE MOCK →</a>
</nav>

<section class="hero wrap">
  <div class="hero-badge">HEARTBEAT #${pen.metadata.heartbeat} · DARK</div>
  <h1><span class="hero-annotation acc">GRAPH</span></h1>
  <p class="sub">${TAGLINE}</p>
  <p style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);margin-top:14px;">
    Blueprint annotation aesthetic · Cypher query engine · 1.4M nodes · 8.7M edges
  </p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">VIEW PROTOTYPE →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ LIVE MOCK</a>
  </div>
</section>

<!-- Screen previews -->
<div style="position:relative;z-index:1;padding:0 24px;">
  <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--acc);letter-spacing:2px;font-weight:600;margin-bottom:16px;max-width:1200px;margin-left:auto;margin-right:auto;">SCREENS — 6 OF 6</div>
  <div class="screens">
    ${pen.screens.map((s,i) => `
    <div class="screen-card">
      <img src="${dataUris[i]}" alt="${s.name}" loading="lazy"/>
      <div class="screen-label">${String(i+1).padStart(2,'0')} · ${s.name}</div>
    </div>`).join('')}
  </div>
</div>

<!-- Palette -->
<div class="wrap palette-section">
  <div class="palette-title">COLOUR PALETTE — DEEP NAVY · BLUEPRINT CYAN</div>
  <div class="swatches">
    ${[
      {hex:'#080C16',name:'BG'},
      {hex:'#0D1425',name:'Surface'},
      {hex:'#121C36',name:'Card'},
      {hex:'#22D3EE',name:'Cyan'},
      {hex:'#818CF8',name:'Indigo'},
      {hex:'#34D399',name:'Emerald'},
      {hex:'#F59E0B',name:'Amber'},
      {hex:'#E2E8F0',name:'Text'},
      {hex:'#64748B',name:'Muted'},
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.hex};"></div>
      <div class="swatch-name">${s.hex}</div>
      <div class="swatch-name" style="color:var(--text)">${s.name}</div>
    </div>`).join('')}
  </div>
</div>

<!-- Features -->
<div class="wrap features">
  <div class="features-title">KEY DESIGN DECISIONS</div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="icon">◈</div>
      <h3>Blueprint Annotation Aesthetic</h3>
      <p>Thin cyan lines connecting nodes to callout labels, axis coordinates on the canvas, and corner bracket marks — treating the UI like a technical diagram.</p>
      <div class="tag">INSPIRED BY GODLY.WEBSITE</div>
    </div>
    <div class="feature-card">
      <div class="icon">▣</div>
      <h3>Monospace-First Typography</h3>
      <p>JetBrains Mono used not just for code but for all nav labels, section headers, and metric values — signalling developer credibility as a core identity.</p>
      <div class="tag">DEVELOPER IDENTITY</div>
    </div>
    <div class="feature-card">
      <div class="icon">◆</div>
      <h3>Deep Navy + Cyan Blueprint Palette</h3>
      <p>Emotionally tuned dark theme: cold #080C16 base with electric cyan #22D3EE accent, matching the "enterprise trust + developer precision" mood from DarkModeDesign.com.</p>
      <div class="tag">DARKMODEDESIGN.COM</div>
    </div>
    <div class="feature-card">
      <div class="icon">◎</div>
      <h3>Syntax-Highlighted Query Editor</h3>
      <p>Multi-colour Cypher syntax highlighting using the palette tokens directly — keywords in indigo, values in amber, identifiers in cyan — creating visual grammar.</p>
      <div class="tag">DEVELOPER TOOLING</div>
    </div>
    <div class="feature-card">
      <div class="icon">◉</div>
      <h3>Glow + Opacity Node Visualisation</h3>
      <p>Each node type gets a coloured ring and a faint radial glow layer, inspired by the "glow effects on dark surfaces" pattern observed on DarkModeDesign.com.</p>
      <div class="tag">GLOW ACCENTS</div>
    </div>
    <div class="feature-card">
      <div class="icon">⊙</div>
      <h3>Consistent Annotation System</h3>
      <p>Every screen has at least one blueprint callout: a thin line ending in a dot connecting an element to a label — creating a cohesive "technical drawing" language.</p>
      <div class="tag">CROSS-SCREEN SYSTEM</div>
    </div>
  </div>
</div>

<!-- Links -->
<div class="links-section wrap">
  <h2>Explore the Design</h2>
  <div class="links-grid">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-card">
      <div class="link-label">PENCIL VIEWER</div>
      <div class="link-url">ram.zenbin.org/${SLUG}-viewer</div>
    </a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-card">
      <div class="link-label">INTERACTIVE MOCK</div>
      <div class="link-url">ram.zenbin.org/${SLUG}-mock ☀◑</div>
    </a>
  </div>
</div>

<footer>
  RAM Design Heartbeat #${pen.metadata.heartbeat} · ${pen.screens.length} screens · ${pen.metadata.elements} elements · dark theme
  <span class="bp-line"></span>
</footer>

</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} ${r1.status===201?'✓':'— '+r1.body.slice(0,80)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status===201?'✓':'— '+r2.body.slice(0,80)}`);
}
main().catch(console.error);
