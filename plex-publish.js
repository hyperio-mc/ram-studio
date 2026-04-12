'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'plex';
const NAME    = 'PLEX';
const TAGLINE = 'Developer team intelligence';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port:     443,
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
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

// ── Extract palette from script ─────────────────────────────────────────────
const palette = {
  bg:     '#07090F',
  surf:   '#0D1220',
  glass:  '#1A2540',
  border: '#1E2D4A',
  acc:    '#22D3EE',
  acc2:   '#6366F1',
  acc3:   '#F59E0B',
  acc4:   '#10B981',
  text:   '#E2E8F0',
  sub:    '#94A3B8',
};

// ── Convert pen elements to inline SVG for preview ──────────────────────────
function elementsToSVG(elements, w, h) {
  const svgParts = elements.slice(0, 120).map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}"/>`;
    } else if (el.type === 'text') {
      const anchor = el.anchor === 'middle' ? 'middle' : el.anchor === 'end' ? 'end' : 'start';
      return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw||400}" text-anchor="${anchor}" opacity="${el.opacity??1}" letter-spacing="${el.ls||0}" font-family="${el.font||'Inter'}, system-ui, sans-serif">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}"/>`;
    } else if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw||1}" opacity="${el.opacity??1}" stroke-linecap="round"/>`;
    }
    return '';
  }).join('\n');
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">${svgParts}</svg>`;
}

const screenSVGs = pen.screens.map(sc => elementsToSVG(sc.elements, 390, 844));

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${palette.bg};--surf:${palette.surf};--glass:${palette.glass};
  --border:${palette.border};--acc:${palette.acc};--acc2:${palette.acc2};
  --acc3:${palette.acc3};--acc4:${palette.acc4};
  --text:${palette.text};--sub:${palette.sub};
}
html{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;scroll-behavior:smooth}
body{min-height:100vh;overflow-x:hidden}

/* ── Nav ── */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;background:rgba(7,9,15,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.logo{font-size:20px;font-weight:900;letter-spacing:-1px;color:var(--acc);font-family:'JetBrains Mono',monospace}
.logo span{color:var(--text);opacity:0.4;font-size:11px;font-weight:400;margin-left:10px;letter-spacing:1px}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:var(--sub);text-decoration:none;font-size:13px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.3);color:var(--acc);padding:8px 20px;border-radius:20px;font-size:13px;font-weight:600;text-decoration:none;transition:all .2s}
.nav-cta:hover{background:rgba(34,211,238,0.2)}

/* ── Hero ── */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 40px 80px;text-align:center;position:relative;overflow:hidden}
.hero-glow{position:absolute;width:600px;height:600px;background:radial-gradient(ellipse,rgba(34,211,238,0.08) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.hero-glow2{position:absolute;width:400px;height:400px;background:radial-gradient(ellipse,rgba(99,102,241,0.06) 0%,transparent 70%);top:30%;left:30%;pointer-events:none}
.badge{display:inline-flex;align-items:center;gap:6px;background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.2);color:var(--acc);padding:6px 16px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:1px;margin-bottom:32px;font-family:'JetBrains Mono',monospace}
.badge::before{content:'';width:6px;height:6px;background:var(--acc);border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
h1{font-size:clamp(48px,7vw,88px);font-weight:900;letter-spacing:-3px;line-height:0.95;margin-bottom:28px}
h1 .line1{color:var(--text)}
h1 .line2{background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-sub{font-size:18px;color:var(--sub);max-width:560px;line-height:1.6;margin-bottom:48px;font-weight:400}
.hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:80px}
.btn-primary{background:var(--acc);color:#07090F;padding:14px 32px;border-radius:24px;font-size:15px;font-weight:700;text-decoration:none;transition:all .2s;letter-spacing:-0.3px}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(34,211,238,0.3)}
.btn-secondary{background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--text);padding:14px 32px;border-radius:24px;font-size:15px;font-weight:500;text-decoration:none;transition:all .2s}
.btn-secondary:hover{background:rgba(255,255,255,0.08)}

/* ── Screen carousel ── */
.screens-wrap{display:flex;gap:24px;overflow-x:auto;padding:0 40px 20px;scrollbar-width:none;-ms-overflow-style:none;max-width:1200px;margin:0 auto}
.screens-wrap::-webkit-scrollbar{display:none}
.screen-card{flex:0 0 200px;background:var(--glass);border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:transform .3s,box-shadow .3s;cursor:pointer}
.screen-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 20px 60px rgba(34,211,238,0.12)}
.screen-card .label{padding:10px 14px;font-size:10px;font-weight:600;color:var(--sub);letter-spacing:1px;text-transform:uppercase;font-family:'JetBrains Mono',monospace;border-bottom:1px solid var(--border)}
.screen-card svg{display:block;width:100%;aspect-ratio:390/844}
.screen-card.active{border-color:rgba(34,211,238,0.4);box-shadow:0 0 0 1px rgba(34,211,238,0.2),0 20px 60px rgba(34,211,238,0.1)}

/* ── Stats ── */
.stats-bar{display:flex;justify-content:center;gap:0;padding:60px 40px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:rgba(13,18,32,0.5);flex-wrap:wrap}
.stat{text-align:center;padding:20px 56px;border-right:1px solid var(--border)}
.stat:last-child{border-right:none}
.stat-val{font-size:36px;font-weight:900;color:var(--acc);font-family:'JetBrains Mono',monospace;letter-spacing:-1px}
.stat-label{font-size:11px;color:var(--sub);margin-top:4px;letter-spacing:0.5px}

/* ── Features bento ── */
.features{padding:100px 40px;max-width:1100px;margin:0 auto}
.features h2{font-size:clamp(32px,4vw,52px);font-weight:800;letter-spacing:-2px;margin-bottom:16px;text-align:center}
.features .sub{color:var(--sub);text-align:center;font-size:16px;margin-bottom:60px;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.6}
.bento{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;gap:16px}
.bento-card{background:var(--glass);border:1px solid var(--border);border-radius:20px;padding:32px;transition:border-color .3s,box-shadow .3s;position:relative;overflow:hidden}
.bento-card::before{content:'';position:absolute;top:0;left:24px;right:24px;height:2px;border-radius:0 0 2px 2px;transition:opacity .3s}
.bento-card:hover{border-color:rgba(34,211,238,0.2);box-shadow:0 8px 40px rgba(34,211,238,0.06)}
.bento-card:hover::before{opacity:1}
.bento-card.span2{grid-column:span 2}
.bento-card.tall{grid-row:span 2}
.card-icon{font-size:28px;margin-bottom:20px}
.card-title{font-size:18px;font-weight:700;margin-bottom:10px;letter-spacing:-0.5px}
.card-desc{font-size:14px;color:var(--sub);line-height:1.6}
.card-acc{color:var(--acc)}
.card-acc2{color:var(--acc2)}
.card-acc3{color:var(--acc3)}
.card-acc4{color:var(--acc4)}

/* ── Palette ── */
.palette-section{padding:80px 40px;max-width:800px;margin:0 auto;text-align:center}
.palette-section h3{font-size:22px;font-weight:700;margin-bottom:8px;letter-spacing:-0.5px}
.palette-section p{color:var(--sub);font-size:14px;margin-bottom:40px}
.swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.swatch{width:80px;text-align:center}
.swatch-dot{width:48px;height:48px;border-radius:12px;margin:0 auto 8px;border:1px solid rgba(255,255,255,0.08)}
.swatch-hex{font-size:10px;color:var(--sub);font-family:'JetBrains Mono',monospace}
.swatch-name{font-size:9px;color:var(--muted);margin-top:2px}

/* ── Links ── */
.links-section{padding:60px 40px;text-align:center}
.links-section h3{font-size:20px;font-weight:700;margin-bottom:24px;letter-spacing:-0.5px}
.link-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.link-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:16px;font-size:13px;font-weight:600;text-decoration:none;border:1px solid var(--border);color:var(--text);background:var(--glass);transition:all .2s}
.link-btn:hover{border-color:var(--acc);color:var(--acc)}

/* ── Footer ── */
footer{border-top:1px solid var(--border);padding:40px;text-align:center;color:var(--sub);font-size:12px}
footer strong{color:var(--acc);font-family:'JetBrains Mono',monospace}

/* Mobile */
@media(max-width:768px){
.bento{grid-template-columns:1fr}.bento-card.span2{grid-column:span 1}
.stat{padding:20px 28px}.nav-links{display:none}
}
</style>
</head>
<body>

<nav>
  <div class="logo">PLEX <span>DEVELOPER INTELLIGENCE</span></div>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#palette">Palette</a></li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Interactive Mock →</a>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>
  <div class="badge">RAM Design Heartbeat · Dark Mode</div>
  <h1>
    <div class="line1">Your team's code,</div>
    <div class="line2">fully visible.</div>
  </h1>
  <p class="hero-sub">PLEX gives engineering teams a unified intelligence layer — pull requests, deployments, code quality, and team velocity, in one bento-grid dashboard.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View in Pencil Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<div id="screens">
  <div class="screens-wrap">
    ${pen.screens.map((sc, i) => `
    <div class="screen-card ${i===0?'active':''}">
      <div class="label">${sc.name}</div>
      ${screenSVGs[i]}
    </div>`).join('')}
  </div>
</div>

<div class="stats-bar">
  <div class="stat"><div class="stat-val">6</div><div class="stat-label">Screens</div></div>
  <div class="stat"><div class="stat-val">707</div><div class="stat-label">Elements</div></div>
  <div class="stat"><div class="stat-val">Dark</div><div class="stat-label">Theme</div></div>
  <div class="stat"><div class="stat-val">v2.8</div><div class="stat-label">Pencil.dev</div></div>
</div>

<section class="features" id="features">
  <h2>Built for engineering teams</h2>
  <p class="sub">Inspired by DarkModeDesign.com's developer tool palettes and Saaspo's bento grid SaaS layouts — a pattern now used by 67% of top-tier SaaS products.</p>
  <div class="bento">
    <div class="bento-card span2" style="--card-acc:var(--acc)">
      <div class="card-icon">⚡</div>
      <div class="card-title card-acc">Bento Dashboard</div>
      <div class="card-desc">Inspired by Saaspo's observation that bento grid layouts achieve 23% higher click-through on feature pages. Each widget is a self-contained unit with its own data and visual rhythm, arranged like a Japanese lunchbox.</div>
    </div>
    <div class="bento-card" style="">
      <div class="card-icon">🟣</div>
      <div class="card-title card-acc2">Pull Request Intelligence</div>
      <div class="card-desc">Status, checks, additions, deletions, and reviewers at a glance. Color-coded by urgency.</div>
    </div>
    <div class="bento-card">
      <div class="card-icon">🟢</div>
      <div class="card-title card-acc4">Deployment Timeline</div>
      <div class="card-desc">Every deploy, every environment. Instant rollback access and diff comparison from history.</div>
    </div>
    <div class="bento-card">
      <div class="card-icon">🔵</div>
      <div class="card-title card-acc">Code Quality</div>
      <div class="card-desc">A+ scores with coverage, maintainability, security, and duplication tracked continuously against thresholds.</div>
    </div>
    <div class="bento-card">
      <div class="card-icon">🟡</div>
      <div class="card-title card-acc3">Team Presence</div>
      <div class="card-desc">Real-time team activity with commit frequency bars, PR counts, and live presence indicators for distributed teams.</div>
    </div>
  </div>
</section>

<section class="palette-section" id="palette">
  <h3>Deep Space Palette</h3>
  <p>Drawn from DarkModeDesign.com's canonical B2B SaaS/Developer toolkit — near-black backgrounds (not pure #000) with electric cyan and indigo accents boosted 15% for dark-mode contrast.</p>
  <div class="swatches">
    ${[
      { hex: palette.bg, name: 'Deep Space', label: 'BG' },
      { hex: palette.surf, name: 'Navy Surface', label: 'SURF' },
      { hex: palette.glass, name: 'Glass Card', label: 'GLASS' },
      { hex: palette.acc, name: 'Electric Cyan', label: 'ACC' },
      { hex: palette.acc2, name: 'Indigo', label: 'ACC2' },
      { hex: palette.acc3, name: 'Amber', label: 'ACC3' },
      { hex: palette.acc4, name: 'Emerald', label: 'ACC4' },
      { hex: palette.sub, name: 'Slate', label: 'SUB' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-dot" style="background:${s.hex}"></div>
      <div class="swatch-hex">${s.hex}</div>
      <div class="swatch-name">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<div class="links-section">
  <h3>Explore this design</h3>
  <div class="link-row">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-btn">🔍 Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-btn">☀◑ Interactive Mock</a>
    <a href="https://ram.zenbin.org" class="link-btn">🗂 RAM Gallery</a>
  </div>
</div>

<footer>
  Designed by <strong>RAM</strong> · Design Heartbeat · April 2026 ·
  Inspired by <a href="https://www.darkmodedesign.com" style="color:var(--acc);text-decoration:none">DarkModeDesign.com</a> &
  <a href="https://saaspo.com" style="color:var(--acc);text-decoration:none">Saaspo.com</a>
</footer>

</body>
</html>`;

// ── Viewer ──────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero page...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}  ${r1.status === 201 ? '✓' : r1.body.slice(0,80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}  ${r2.status === 201 ? '✓' : r2.body.slice(0,80)}`);

  console.log(`\nHero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
