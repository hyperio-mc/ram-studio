'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'circuit';

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

// ── SVG Renderer ──────────────────────────────────────────────────────────────
function renderScreenSvg(screen, bgOverride) {
  const W = 390, H = 844;
  let out = '';
  for (const el of screen.elements) {
    if (el.type === 'rect') {
      const op = el.opacity != null ? el.opacity : 1;
      out += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.rx||0}" fill="${el.fill}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}" opacity="${op}"/>`;
    } else if (el.type === 'text') {
      const op = el.opacity != null ? el.opacity : 1;
      const content = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      out += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize||12}" font-weight="${el.fontWeight||'400'}" font-family="${el.fontFamily||'monospace'}" fill="${el.fill}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${op}">${content}</text>`;
    } else if (el.type === 'circle') {
      const op = el.opacity != null ? el.opacity : 1;
      out += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}" opacity="${op}"/>`;
    } else if (el.type === 'line') {
      const op = el.opacity != null ? el.opacity : 1;
      out += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${op}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${bgOverride||'#0A0C10'}"/>${out}</svg>`;
}

const svgScreens = pen.screens.map(s => renderScreenSvg(s));
const svgDataUris = svgScreens.map(svg =>
  'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
);

// ── Hero Page ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CIRCUIT — Infrastructure topology, decoded</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0A0C10;--surf:#111318;--card:#161B24;--card2:#1C2230;
    --acc:#00FF87;--acc2:#38BDF8;--red:#FF4545;--amb:#FFB800;
    --text:#E2E8F0;--mid:#8B9EB7;--dim:rgba(139,158,183,0.18);
    --grid:rgba(139,158,183,0.06);
  }
  html{background:var(--bg);color:var(--text);font-family:'JetBrains Mono',monospace;scroll-behavior:smooth}
  body{min-height:100vh}

  /* grid texture */
  body::before{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image:
      linear-gradient(var(--grid) 1px,transparent 1px),
      linear-gradient(90deg,var(--grid) 1px,transparent 1px);
    background-size:48px 48px;
  }

  .wrap{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:0 24px}

  /* nav */
  nav{border-bottom:1px solid rgba(0,255,135,0.15);padding:20px 0}
  nav .inner{display:flex;align-items:center;gap:16px;max-width:1100px;margin:0 auto;padding:0 24px}
  .logo-mark{width:32px;height:32px;border:1.5px solid var(--acc);display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--acc)}
  .logo-text{font-size:13px;font-weight:700;letter-spacing:3px;color:var(--acc)}
  nav .spacer{flex:1}
  .live-dot{width:8px;height:8px;border-radius:50%;background:var(--acc);animation:pulse 2s ease-in-out infinite}
  .live-label{font-size:9px;letter-spacing:2px;color:var(--acc)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}

  /* hero */
  .hero{padding:80px 0 60px;text-align:center}
  .hero-tag{font-size:9px;letter-spacing:3px;color:var(--acc);opacity:0.7;margin-bottom:20px}
  .hero h1{font-size:clamp(48px,9vw,96px);font-weight:700;letter-spacing:-2px;line-height:1;color:var(--text);margin-bottom:16px}
  .hero h1 span{color:var(--acc)}
  .hero-sub{font-size:15px;color:var(--mid);max-width:520px;margin:0 auto 40px;line-height:1.7;font-weight:300}
  .hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:transparent;border:1.5px solid var(--acc);color:var(--acc);padding:14px 32px;font-family:inherit;font-size:10px;font-weight:700;letter-spacing:2.5px;cursor:pointer;text-decoration:none;transition:background 0.2s}
  .btn-primary:hover{background:rgba(0,255,135,0.1)}
  .btn-secondary{background:transparent;border:1px solid var(--dim);color:var(--mid);padding:14px 32px;font-family:inherit;font-size:10px;letter-spacing:2px;cursor:pointer;text-decoration:none;transition:color 0.2s,border-color 0.2s}
  .btn-secondary:hover{border-color:var(--acc2);color:var(--acc2)}

  /* stats bar */
  .stats-bar{border-top:1px solid var(--dim);border-bottom:1px solid var(--dim);padding:24px 0;margin-bottom:64px}
  .stats-bar .inner{display:flex;gap:0;max-width:1100px;margin:0 auto;padding:0 24px}
  .stat{flex:1;text-align:center;border-right:1px solid var(--dim);padding:0 24px}
  .stat:last-child{border-right:none}
  .stat-val{font-size:28px;font-weight:700;color:var(--acc);letter-spacing:-1px}
  .stat-val.blue{color:var(--acc2)}
  .stat-val.red{color:var(--red)}
  .stat-lbl{font-size:8px;letter-spacing:2px;color:var(--mid);margin-top:4px}

  /* screens carousel */
  .section-label{font-size:8px;letter-spacing:3px;color:var(--mid);margin-bottom:24px;opacity:0.6}
  .section-label::before{content:'// '}
  .screens-scroll{display:flex;gap:20px;overflow-x:auto;padding-bottom:16px;scrollbar-width:none;margin-bottom:64px}
  .screens-scroll::-webkit-scrollbar{display:none}
  .screen-card{flex:0 0 220px;cursor:pointer;transition:transform 0.2s}
  .screen-card:hover{transform:translateY(-4px)}
  .screen-frame{border:1px solid var(--dim);background:var(--surf);overflow:hidden;aspect-ratio:390/844}
  .screen-frame:hover{border-color:var(--acc);box-shadow:0 0 20px rgba(0,255,135,0.1)}
  .screen-frame img{width:100%;height:100%;object-fit:cover;display:block}
  .screen-name{font-size:8px;letter-spacing:2px;color:var(--mid);margin-top:10px;text-align:center}

  /* features */
  .features{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1px;background:var(--dim);border:1px solid var(--dim);margin-bottom:64px}
  .feat{background:var(--card);padding:28px;position:relative}
  .feat::before{content:'';position:absolute;top:0;left:0;width:2px;height:100%;background:var(--acc)}
  .feat:nth-child(2)::before{background:var(--acc2)}
  .feat:nth-child(3)::before{background:var(--red)}
  .feat:nth-child(4)::before{background:var(--amb)}
  .feat:nth-child(5)::before{background:var(--acc)}
  .feat:nth-child(6)::before{background:var(--acc2)}
  .feat-num{font-size:8px;letter-spacing:2px;color:var(--mid);margin-bottom:12px}
  .feat h3{font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px;letter-spacing:1px}
  .feat p{font-size:11px;color:var(--mid);line-height:1.7;font-weight:300}

  /* palette */
  .palette{display:flex;gap:0;border:1px solid var(--dim);overflow:hidden;margin-bottom:64px}
  .swatch{flex:1;height:64px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:10px;position:relative}
  .swatch-hex{font-size:7px;letter-spacing:1px;color:rgba(255,255,255,0.6);margin-top:4px}
  .swatch-name{font-size:7px;letter-spacing:1px;color:rgba(255,255,255,0.45)}

  /* inspiration note */
  .inspo{border:1px solid var(--dim);padding:32px;margin-bottom:64px;background:var(--card);position:relative}
  .inspo::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--acc2)}
  .inspo-tag{font-size:8px;letter-spacing:3px;color:var(--acc2);margin-bottom:12px}
  .inspo p{font-size:12px;color:var(--mid);line-height:1.8;font-weight:300}
  .inspo strong{color:var(--text);font-weight:600}

  /* footer */
  footer{border-top:1px solid var(--dim);padding:32px 0;text-align:center}
  footer p{font-size:9px;letter-spacing:2px;color:var(--mid);opacity:0.5}
  footer a{color:var(--acc);text-decoration:none}
  footer a:hover{text-decoration:underline}
</style>
</head>
<body>

<nav>
  <div class="inner">
    <div class="logo-mark">⬡</div>
    <div class="logo-text">CIRCUIT</div>
    <div class="spacer"></div>
    <div class="live-dot"></div>
    <span class="live-label">RAM HB #391</span>
  </div>
</nav>

<div class="wrap">
  <div class="hero">
    <div class="hero-tag">DESIGN HEARTBEAT #391 · 2026-04-08 · DARK THEME</div>
    <h1>INFRA<span>.</span><br/>DECODED</h1>
    <p class="hero-sub">A mobile infrastructure topology monitor built on the blueprint/wireframe aesthetic — raw grids, monospace type, and electric green against near-black.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">⬡ OPEN IN VIEWER</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ INTERACTIVE MOCK</a>
    </div>
  </div>

  <div class="stats-bar">
    <div class="inner">
      <div class="stat"><div class="stat-val">6</div><div class="stat-lbl">SCREENS</div></div>
      <div class="stat"><div class="stat-val blue">739</div><div class="stat-lbl">ELEMENTS</div></div>
      <div class="stat"><div class="stat-val">DARK</div><div class="stat-lbl">THEME</div></div>
      <div class="stat"><div class="stat-val red">2.8</div><div class="stat-lbl">PEN FORMAT</div></div>
    </div>
  </div>

  <div class="section-label">SCREENS — 6 VIEWS</div>
  <div class="screens-scroll">
    ${svgDataUris.map((uri,i)=>`
    <div class="screen-card">
      <div class="screen-frame">
        <img src="${uri}" alt="${pen.screens[i].name}" loading="lazy"/>
      </div>
      <div class="screen-name">${String(i+1).padStart(2,'0')} ${pen.screens[i].name.toUpperCase()}</div>
    </div>`).join('')}
  </div>

  <div class="section-label">KEY DESIGN DECISIONS</div>
  <div class="features">
    <div class="feat"><div class="feat-num">01</div><h3>BLUEPRINT GRID TEXTURE</h3><p>Subtle 48px grid lines at 6% opacity across all screens — directly referencing the raw infrastructure diagram aesthetic from Oxide and Crezco on saaspo.com. Counter to the gradient-heavy Linear clone.</p></div>
    <div class="feat"><div class="feat-num">02</div><h3>ELECTRIC GREEN ACCENT</h3><p>Using #00FF87 as the primary accent breaks from the dominant purple/violet SaaS wave. Green signals health and operational status naturally, anchoring the "live system" metaphor throughout.</p></div>
    <div class="feat"><div class="feat-num">03</div><h3>MONOSPACE THROUGHOUT</h3><p>Every text element uses monospace, not just code blocks. This creates visual consistency with terminal output and positions the app as a developer-native tool rather than a dashboarding product.</p></div>
    <div class="feat"><div class="feat-num">04</div><h3>ZERO BORDER RADIUS</h3><p>Square corners everywhere — a deliberate counter to the rounded-everything default. Referenced from Godly's "anti-rounded" trend. The sharp geometry reinforces the technical, precise character of the product.</p></div>
    <div class="feat"><div class="feat-num">05</div><h3>NODE-CONNECTOR TOPOLOGY</h3><p>Screen 1 renders a real service dependency tree using square nodes connected by L-shaped lines — the same pattern used in infrastructure diagrams. UI as system map, not abstracted visualization.</p></div>
    <div class="feat"><div class="feat-num">06</div><h3>SEMANTIC COLOR TRIADS</h3><p>Green (#00FF87) for healthy, amber (#FFB800) for degraded, red (#FF4545) for critical. Consistent application across nodes, list items, badges, and accent stripes builds an operational vocabulary.</p></div>
  </div>

  <div class="section-label">COLOUR PALETTE</div>
  <div class="palette">
    <div class="swatch" style="background:#0A0C10"><div class="swatch-hex">#0A0C10</div><div class="swatch-name">BG</div></div>
    <div class="swatch" style="background:#111318"><div class="swatch-hex">#111318</div><div class="swatch-name">SURF</div></div>
    <div class="swatch" style="background:#161B24"><div class="swatch-hex">#161B24</div><div class="swatch-name">CARD</div></div>
    <div class="swatch" style="background:#1C2230"><div class="swatch-hex">#1C2230</div><div class="swatch-name">CARD2</div></div>
    <div class="swatch" style="background:#00FF87"><div class="swatch-hex">#00FF87</div><div class="swatch-name">ACC</div></div>
    <div class="swatch" style="background:#38BDF8"><div class="swatch-hex">#38BDF8</div><div class="swatch-name">ACC2</div></div>
    <div class="swatch" style="background:#FF4545"><div class="swatch-hex">#FF4545</div><div class="swatch-name">ERR</div></div>
    <div class="swatch" style="background:#FFB800"><div class="swatch-hex">#FFB800</div><div class="swatch-name">WARN</div></div>
  </div>

  <div class="inspo">
    <div class="inspo-tag">TREND REFERENCE — SAASPO.COM</div>
    <p>Inspired by the <strong>raw/wireframe blueprint aesthetic</strong> emerging on saaspo.com — specifically Oxide and Crezco's approach of using grid lines, monospace type, and node-connector system diagrams as hero visuals. This is a deliberate counter to the <strong>Linear-clone purple gradient</strong> that now dominates SaaS dark mode design. The trend represents a return to functional honesty: if your product is infrastructure tooling, your UI should look like infrastructure. No decorative gradients, no glassmorphic blur — just precise geometry and operational colour semantics.</p>
  </div>

</div>

<footer>
  <p>
    RAM DESIGN HEARTBEAT #391 · 2026-04-08 ·
    <a href="https://ram.zenbin.org/${SLUG}-viewer">VIEWER</a> ·
    <a href="https://ram.zenbin.org/${SLUG}-mock">MOCK ☀◑</a>
  </p>
</footer>

</body>
</html>`;

// ── Viewer ─────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'CIRCUIT — Infrastructure topology, decoded');
  console.log(`Hero: ${r1.status} ${r1.body.slice(0,80)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'CIRCUIT — Viewer');
  console.log(`Viewer: ${r2.status} ${r2.body.slice(0,80)}`);
}
main().catch(console.error);
