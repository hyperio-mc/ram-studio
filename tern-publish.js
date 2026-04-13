'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'tern';
const HB      = 491;
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
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

// ─── Palette ─────────────────────────────────────────────────────────────────
const P = {
  BG:   '#0A0B10',
  SURF: '#111320',
  CARD: '#181C30',
  ACC:  '#7C3AED',
  ACC2: '#06B6D4',
  WARM: '#F97316',
  TEXT: '#E2E8F0',
  MUTED:'rgba(148,163,184,0.6)',
};

// ─── Extract screen SVGs ──────────────────────────────────────────────────────
function renderElements(els) {
  return els.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'text') {
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter,sans-serif'}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity??1}">${el.content}</text>`;
    } else if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity??1}" stroke-linecap="round"/>`;
    }
    return '';
  }).join('\n');
}

const screenSVGs = pen.screens.map(s => {
  const inner = renderElements(s.elements);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${inner}</svg>`;
});

const screenNames = ['Dashboard','Discover','Stats','Artist','Sound Map','Profile'];
const screenThemes = [
  { accent: P.ACC, desc: 'Bento grid dashboard with ambient orbs' },
  { accent: P.ACC2, desc: 'Discovery with horizontal scroll cards' },
  { accent: P.WARM, desc: 'Deep listening analytics & charts' },
  { accent: P.ACC, desc: 'Artist deep-dive with timeline' },
  { accent: P.ACC2, desc: 'Mood cartography sound map' },
  { accent: P.ACC, desc: 'Profile & listener rank' },
];

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TERN — Know Your Sound</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${P.BG};--surf:${P.SURF};--card:${P.CARD};
    --acc:${P.ACC};--acc2:${P.ACC2};--warm:${P.WARM};
    --text:${P.TEXT};--muted:rgba(148,163,184,0.6);
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

  /* Ambient orbs */
  .orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0}
  .orb-1{width:500px;height:500px;background:var(--acc);opacity:0.07;top:-100px;right:-100px}
  .orb-2{width:400px;height:400px;background:var(--acc2);opacity:0.06;bottom:10%;left:-80px}
  .orb-3{width:300px;height:300px;background:var(--warm);opacity:0.04;top:40%;right:20%}

  /* Nav */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,11,16,0.8);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06)}
  .logo{font-size:18px;font-weight:900;letter-spacing:-0.5px;color:var(--text)}
  .logo span{color:var(--acc)}
  .nav-links{display:flex;gap:32px}
  .nav-links a{color:var(--muted);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--acc);color:#fff;border:none;padding:10px 24px;border-radius:20px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}

  /* Hero */
  .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;z-index:1}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;color:var(--acc);margin-bottom:32px;letter-spacing:0.5px}
  .hero-badge .dot{width:6px;height:6px;border-radius:50%;background:var(--acc);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
  h1{font-size:clamp(48px,8vw,88px);font-weight:900;letter-spacing:-2px;line-height:1.05;margin-bottom:24px}
  h1 .grad{background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .hero-sub{font-size:18px;color:var(--muted);max-width:480px;margin:0 auto 40px;line-height:1.6}
  .hero-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
  .btn-primary{background:var(--acc);color:#fff;padding:14px 32px;border-radius:28px;font-size:15px;font-weight:700;cursor:pointer;border:none;font-family:inherit;text-decoration:none;display:inline-block;box-shadow:0 0 32px rgba(124,58,237,0.4)}
  .btn-secondary{background:transparent;color:var(--text);padding:14px 32px;border-radius:28px;font-size:15px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.12);font-family:inherit;text-decoration:none;display:inline-block}
  .btn-secondary:hover{border-color:rgba(255,255,255,0.25);background:rgba(255,255,255,0.04)}

  /* Phone carousel */
  .phone-row{display:flex;gap:20px;justify-content:center;overflow:hidden;padding:20px 0 40px}
  .phone-wrap{flex-shrink:0;position:relative}
  .phone-wrap.center{transform:scale(1.05);z-index:2}
  .phone-wrap.side{transform:scale(0.88);opacity:0.65}
  .phone-frame{width:220px;height:476px;background:var(--surf);border-radius:32px;overflow:hidden;border:1px solid rgba(255,255,255,0.10);box-shadow:0 24px 80px rgba(0,0,0,0.6);position:relative}
  .phone-frame svg{width:100%;height:100%;display:block}
  .screen-label{position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);font-size:11px;color:var(--muted);font-weight:500;white-space:nowrap}

  /* Stats bar */
  .stats-bar{display:flex;justify-content:center;gap:0;margin:0 auto 80px;max-width:600px;background:var(--surf);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden}
  .stat-item{flex:1;padding:24px 16px;text-align:center;border-right:1px solid rgba(255,255,255,0.06)}
  .stat-item:last-child{border-right:none}
  .stat-val{font-size:28px;font-weight:800;letter-spacing:-0.5px;display:block;color:var(--text)}
  .stat-lbl{font-size:11px;color:var(--muted);font-weight:500;letter-spacing:0.5px;margin-top:4px;display:block}

  /* Trend tag */
  .trend-section{text-align:center;padding:0 24px 40px;position:relative;z-index:1}
  .trend-label{font-size:11px;font-weight:600;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase;margin-bottom:16px}
  .trend-tags{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .tag{padding:6px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;font-size:12px;color:var(--muted);font-weight:500}

  /* Features bento */
  .features{max-width:800px;margin:0 auto 80px;padding:0 24px;position:relative;z-index:1}
  .section-label{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--acc);text-transform:uppercase;margin-bottom:12px}
  .section-title{font-size:32px;font-weight:800;letter-spacing:-0.5px;margin-bottom:40px;line-height:1.2}
  .bento{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:12px}
  .bento-card{background:var(--card);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;position:relative;overflow:hidden}
  .bento-card.wide{grid-column:span 2}
  .bento-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc-local,var(--acc)),transparent);opacity:0.5}
  .bento-icon{font-size:28px;margin-bottom:16px}
  .bento-title{font-size:15px;font-weight:700;margin-bottom:8px}
  .bento-desc{font-size:13px;color:var(--muted);line-height:1.5}

  /* Palette */
  .palette-section{max-width:800px;margin:0 auto 80px;padding:0 24px;position:relative;z-index:1}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;gap:8px;align-items:center}
  .swatch-color{width:56px;height:56px;border-radius:14px;border:1px solid rgba(255,255,255,0.08)}
  .swatch-name{font-size:10px;color:var(--muted);font-weight:500}
  .swatch-hex{font-size:9px;color:var(--muted);font-family:monospace}

  /* Footer */
  footer{text-align:center;padding:40px 24px;border-top:1px solid rgba(255,255,255,0.06);position:relative;z-index:1}
  footer p{color:var(--muted);font-size:12px;margin-bottom:8px}
  footer a{color:var(--acc);text-decoration:none;font-weight:600}
  .hb-badge{display:inline-flex;gap:6px;align-items:center;background:rgba(255,255,255,0.04);padding:6px 14px;border-radius:20px;font-size:11px;color:var(--muted);border:1px solid rgba(255,255,255,0.06);margin-top:12px}
</style>
</head>
<body>

<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<div class="orb orb-3"></div>

<nav>
  <div class="logo">T<span>E</span>RN</div>
  <div class="nav-links">
    <a href="#">Discover</a>
    <a href="#">Stats</a>
    <a href="https://ram.zenbin.org/tern-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/tern-mock">Mock</a>
  </div>
  <button class="nav-cta">Get Early Access</button>
</nav>

<section class="hero">
  <div>
    <div class="hero-badge">
      <span class="dot"></span>
      MUSIC INTELLIGENCE · HEARTBEAT #${HB}
    </div>
    <h1>Know Your <span class="grad">Sound</span></h1>
    <p class="hero-sub">A music intelligence app that maps your listening landscape — bento grid dashboard, sound cartography, and deep artist analytics.</p>
    <div class="hero-buttons">
      <a href="https://ram.zenbin.org/tern-mock" class="btn-primary">☀◑ Try Interactive Mock</a>
      <a href="https://ram.zenbin.org/tern-viewer" class="btn-secondary">View Design File</a>
    </div>

    <div class="phone-row">
      ${pen.screens.map((s,i)=>{
        const svg = screenSVGs[i];
        const cls = i===0?'center':(i===1||i===5?'side':'side');
        if(i>=4) return '';
        return `<div class="phone-wrap ${i===0?'center':'side'}">
          <div class="phone-frame">${svg}</div>
          <span class="screen-label">${screenNames[i]}</span>
        </div>`;
      }).filter(Boolean).join('')}
    </div>
  </div>
</section>

<div class="stats-bar">
  <div class="stat-item"><span class="stat-val">6</span><span class="stat-lbl">SCREENS</span></div>
  <div class="stat-item"><span class="stat-val">637</span><span class="stat-lbl">ELEMENTS</span></div>
  <div class="stat-item"><span class="stat-val">Dark</span><span class="stat-lbl">THEME</span></div>
  <div class="stat-item"><span class="stat-val">#${HB}</span><span class="stat-lbl">HEARTBEAT</span></div>
</div>

<div class="trend-section">
  <p class="trend-label">Inspired by</p>
  <div class="trend-tags">
    <span class="tag">Bento Grid · Saaspo.com</span>
    <span class="tag">Ambient Glassmorphism · DarkModeDesign.com</span>
    <span class="tag">Neon Glow Accents · Godly.website</span>
    <span class="tag">Dense Dashboard · Godly.website</span>
    <span class="tag">Elevated Surface System · Material You Dark</span>
  </div>
</div>

<section class="features">
  <p class="section-label">Design System</p>
  <h2 class="section-title">Built on ambient darkness<br>and bento intelligence</h2>
  <div class="bento">
    <div class="bento-card wide" style="--acc-local:${P.ACC}">
      <div class="bento-icon">⬡</div>
      <div class="bento-title">Bento Grid Dashboard</div>
      <div class="bento-desc">Modular mixed-size cards — now playing (2x wide), streak (1x), genre donut (1x), top artist (1x), minutes sparkline (1x), weekly bar chart (3x). Directly inspired by the bento layouts trending across saaspo.com SaaS landing pages in 2026.</div>
    </div>
    <div class="bento-card" style="--acc-local:${P.ACC2}">
      <div class="bento-icon">◎</div>
      <div class="bento-title">Sound Map</div>
      <div class="bento-desc">A 2D emotional cartography of your music taste — energetic vs. calm, dark vs. bright — with bubble clusters sized by listening volume.</div>
    </div>
    <div class="bento-card" style="--acc-local:${P.WARM}">
      <div class="bento-icon">◈</div>
      <div class="bento-title">Ambient Orb Depth</div>
      <div class="bento-desc">Three positioned gradient orbs at 7–12% opacity behind frosted glass cards — evolved glassmorphism from godly.website's layered Z-axis trend.</div>
    </div>
    <div class="bento-card" style="--acc-local:#A78BFA">
      <div class="bento-icon">◉</div>
      <div class="bento-title">Luminance Hierarchy</div>
      <div class="bento-desc">Off-white text at #E2E8F0, secondary at 55% opacity, tertiary at 30% — a luminance-based hierarchy from DarkModeDesign.com's Material dark system.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <p class="section-label">Color Palette</p>
  <h2 class="section-title" style="font-size:24px;margin-bottom:24px">Dark · Electric Violet</h2>
  <div class="swatches">
    ${[
      {name:'Background',hex:P.BG},
      {name:'Surface',hex:P.SURF},
      {name:'Card',hex:P.CARD},
      {name:'Violet',hex:P.ACC},
      {name:'Cyan',hex:P.ACC2},
      {name:'Coral',hex:P.WARM},
      {name:'Text',hex:P.TEXT},
    ].map(s=>`<div class="swatch">
      <div class="swatch-color" style="background:${s.hex}"></div>
      <span class="swatch-name">${s.name}</span>
      <span class="swatch-hex">${s.hex}</span>
    </div>`).join('')}
  </div>
</section>

<footer>
  <p>Designed by <strong>RAM</strong> · Design AI</p>
  <p><a href="https://ram.zenbin.org/tern-viewer">View in Pencil.dev Viewer</a> · <a href="https://ram.zenbin.org/tern-mock">Interactive Mock ☀◑</a></p>
  <div class="hb-badge">RAM Design Heartbeat #${HB} · ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
</footer>

</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ─── Publish ──────────────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, 'TERN — Know Your Sound');
  console.log(`Hero: ${r1.status}  ${r1.body.slice(0,80)}`);

  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'TERN — Design Viewer');
  console.log(`Viewer: ${r2.status}  ${r2.body.slice(0,80)}`);
}
main().catch(console.error);
