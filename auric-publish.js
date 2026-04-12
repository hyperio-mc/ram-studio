'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'auric';
const APP = 'AURIC';
const TAGLINE = 'Premium Wealth Intelligence';

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

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ─── HERO HTML ─────────────────────────────────────────────────────────────────
const BG = '#1C1917', SURF = '#262220', CARD = '#302C29';
const TEXT = '#FAFAF9', MUTED = '#A8A29E', GOLD = '#D4A574', TEAL = '#6DB89A';

// Build SVG data URIs from screens
function screenToSvg(screen) {
  const { width, height } = screen.svg;
  const els = screen.elements.map(e => {
    if (e.type === 'rect') {
      return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${e.rx||0}" opacity="${e.opacity!==undefined?e.opacity:1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    } else if (e.type === 'text') {
      const attrs = `x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight||400}" font-family="${e.fontFamily||'system-ui'}" text-anchor="${e.textAnchor||'start'}" letter-spacing="${e.letterSpacing||0}" opacity="${e.opacity!==undefined?e.opacity:1}"`;
      return `<text ${attrs}>${String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (e.type === 'circle') {
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity!==undefined?e.opacity:1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    } else if (e.type === 'line') {
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth||1}" opacity="${e.opacity!==undefined?e.opacity:1}"/>`;
    }
    return '';
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${els}</svg>`;
}

const svgScreens = pen.screens.map(s => {
  const svg = screenToSvg(s);
  const encoded = Buffer.from(svg).toString('base64');
  return { name: s.name, dataUri: `data:image/svg+xml;base64,${encoded}` };
});

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP} — ${TAGLINE}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${BG};--surf:${SURF};--card:${CARD};
    --text:${TEXT};--muted:${MUTED};--gold:${GOLD};--teal:${TEAL};
    --border:rgba(212,165,116,0.15);
  }
  body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;overflow-x:hidden}

  /* GRAIN TEXTURE */
  body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:0.6}

  /* NAV */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;background:rgba(28,25,23,0.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
  .nav-logo{font-size:18px;font-weight:800;letter-spacing:3px;color:var(--gold)}
  .nav-logo span{color:var(--text)}
  nav a{color:var(--muted);text-decoration:none;font-size:13px;letter-spacing:0.5px;transition:color .2s}
  nav a:hover{color:var(--gold)}
  .nav-links{display:flex;gap:28px}
  .nav-cta{background:var(--gold);color:var(--bg)!important;padding:8px 20px;border-radius:8px;font-weight:700!important;font-size:13px;letter-spacing:1px}

  /* HERO */
  .hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:80px 24px 60px;overflow:hidden;z-index:1}
  .hero-glow{position:absolute;top:20%;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse at center,rgba(212,165,116,0.08) 0%,transparent 70%);pointer-events:none}
  .hero-inner{max-width:1100px;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(212,165,116,0.1);border:1px solid rgba(212,165,116,0.3);border-radius:20px;padding:6px 14px;font-size:11px;font-weight:700;letter-spacing:2px;color:var(--gold);margin-bottom:24px}
  .hero-badge::before{content:'◆';font-size:8px}
  h1{font-size:clamp(40px,6vw,72px);font-weight:800;letter-spacing:-2px;line-height:1.05;margin-bottom:20px}
  h1 em{font-style:normal;color:var(--gold)}
  .hero-sub{font-size:17px;color:var(--muted);line-height:1.7;max-width:440px;margin-bottom:36px}
  .hero-actions{display:flex;gap:14px;flex-wrap:wrap}
  .btn-primary{background:var(--gold);color:var(--bg);padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:1.5px;text-decoration:none;transition:all .2s}
  .btn-primary:hover{background:#e8c99a;transform:translateY(-2px);box-shadow:0 8px 24px rgba(212,165,116,0.3)}
  .btn-secondary{background:transparent;color:var(--gold);padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:1.5px;text-decoration:none;border:1.5px solid var(--gold);transition:all .2s}
  .btn-secondary:hover{background:rgba(212,165,116,0.08)}

  /* PHONE MOCKUP */
  .phone-wrap{display:flex;justify-content:center;position:relative}
  .phone{width:240px;background:#0f0d0b;border-radius:32px;padding:10px;box-shadow:0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(212,165,116,0.2),inset 0 0 0 1px rgba(255,255,255,0.04);position:relative;z-index:2}
  .phone-inner{border-radius:24px;overflow:hidden;position:relative;height:420px}
  .phone-inner img{width:100%;height:100%;object-fit:cover;object-position:top}
  .phone-glow{position:absolute;inset:-40px;background:radial-gradient(ellipse at center,rgba(212,165,116,0.12) 0%,transparent 65%);z-index:1;pointer-events:none}

  /* SCREENS CAROUSEL */
  .screens-section{padding:80px 24px;max-width:1100px;margin:0 auto;position:relative;z-index:1}
  .section-label{font-size:11px;font-weight:700;letter-spacing:3px;color:var(--gold);margin-bottom:12px}
  .section-title{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-1px;margin-bottom:48px}
  .screens-grid{display:flex;gap:16px;overflow-x:auto;padding-bottom:16px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
  .screens-grid::-webkit-scrollbar{height:4px}
  .screens-grid::-webkit-scrollbar-track{background:var(--surf)}
  .screens-grid::-webkit-scrollbar-thumb{background:var(--gold);border-radius:2px}
  .screen-card{flex-shrink:0;width:180px;scroll-snap-align:start}
  .screen-card img{width:100%;border-radius:16px;border:1px solid var(--border);display:block;transition:transform .3s}
  .screen-card:hover img{transform:scale(1.02) translateY(-4px)}
  .screen-label{font-size:12px;color:var(--muted);text-align:center;margin-top:10px;letter-spacing:0.5px}

  /* FEATURES — BENTO GRID */
  .features{padding:80px 24px;max-width:1100px;margin:0 auto;position:relative;z-index:1}
  .bento{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .bento-card{background:var(--surf);border:1px solid var(--border);border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:border-color .3s,transform .3s}
  .bento-card:hover{border-color:rgba(212,165,116,0.35);transform:translateY(-3px)}
  .bento-card.wide{grid-column:span 2}
  .bento-card.tall{grid-row:span 2}
  .bento-icon{font-size:24px;margin-bottom:16px;display:block}
  .bento-title{font-size:16px;font-weight:700;margin-bottom:8px;color:var(--text)}
  .bento-desc{font-size:13px;color:var(--muted);line-height:1.6}
  .bento-accent{position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),transparent)}

  /* PALETTE */
  .palette-section{padding:60px 24px;max-width:1100px;margin:0 auto;position:relative;z-index:1}
  .swatches{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
  .swatch{width:80px}
  .swatch-color{height:56px;border-radius:10px;margin-bottom:8px;border:1px solid rgba(255,255,255,0.06)}
  .swatch-hex{font-size:11px;color:var(--muted);font-family:monospace}
  .swatch-name{font-size:11px;color:var(--text);font-weight:500}

  /* STATS */
  .stats{padding:60px 24px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;position:relative;z-index:1}
  .stat{text-align:center;padding:24px;background:var(--surf);border:1px solid var(--border);border-radius:14px}
  .stat-val{font-size:36px;font-weight:800;letter-spacing:-1px;color:var(--gold)}
  .stat-label{font-size:12px;color:var(--muted);letter-spacing:1px;margin-top:6px;font-weight:600}

  /* FOOTER */
  footer{border-top:1px solid var(--border);padding:40px 24px;text-align:center;color:var(--muted);font-size:13px;position:relative;z-index:1}
  footer a{color:var(--gold);text-decoration:none}

  @media(max-width:768px){
    .hero-inner{grid-template-columns:1fr;gap:40px}
    .phone-wrap{order:-1}
    .bento{grid-template-columns:1fr}
    .bento-card.wide{grid-column:span 1}
    .stats{grid-template-columns:repeat(2,1fr)}
    .nav-links{display:none}
  }
</style>
</head>
<body>
<nav>
  <div class="nav-logo">AURIC</div>
  <div class="nav-links">
    <a href="#">Portfolio</a>
    <a href="#">Markets</a>
    <a href="#">Insights</a>
    <a href="#" class="nav-cta">GET STARTED</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-inner">
    <div>
      <div class="hero-badge">WEALTH INTELLIGENCE PLATFORM</div>
      <h1>Where gold<br>meets <em>data</em></h1>
      <p class="hero-sub">AURIC brings institutional-grade portfolio intelligence to individual investors. Real-time analytics, AI insights, and a premium experience built around your wealth.</p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">VIEW DESIGN</a>
        <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">LIVE MOCK ☀◑</a>
      </div>
    </div>
    <div class="phone-wrap">
      <div class="phone-glow"></div>
      <div class="phone">
        <div class="phone-inner">
          <img src="${svgScreens[0].dataUri}" alt="AURIC Dashboard">
        </div>
      </div>
    </div>
  </div>
</section>

<section class="screens-section">
  <div class="section-label">ALL SCREENS</div>
  <div class="section-title">6 screens, 823 elements</div>
  <div class="screens-grid">
    ${svgScreens.map(s => `
    <div class="screen-card">
      <img src="${s.dataUri}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <div class="section-label">DESIGN DECISIONS</div>
  <div class="section-title">Built on three principles</div>
  <div class="bento">
    <div class="bento-card wide">
      <span class="bento-icon">◆</span>
      <div class="bento-title">Warm Charcoal + Gold System</div>
      <div class="bento-desc">Inspired by DarkModeDesign.com's premium dark palette trend: #1C1917 charcoal base with #D4A574 gold accents. Warm undertones replace cold blue-black for a more human, luxurious feel — distinguishing AURIC from typical fintech dark UI.</div>
      <div class="bento-accent"></div>
    </div>
    <div class="bento-card">
      <span class="bento-icon">⊞</span>
      <div class="bento-title">Bento Metric Grid</div>
      <div class="bento-desc">Land-book's emerging SaaS layout trend: modular bento-grid cards replacing flat feature lists for the dashboard overview.</div>
      <div class="bento-accent"></div>
    </div>
    <div class="bento-card">
      <span class="bento-icon">Tт</span>
      <div class="bento-title">Extreme Type Scale Contrast</div>
      <div class="bento-desc">56px portfolio value vs 10px label — a 5.6× ratio. Inspired by minimal.gallery's typography-first approach where the number IS the visual statement.</div>
      <div class="bento-accent"></div>
    </div>
    <div class="bento-card">
      <span class="bento-icon">◎</span>
      <div class="bento-title">Glassmorphism in Dark Context</div>
      <div class="bento-desc">From DarkModeDesign.com: frosted glass panels with rgba(212,165,116,0.07) backgrounds work dramatically better on dark than light surfaces.</div>
      <div class="bento-accent"></div>
    </div>
    <div class="bento-card wide">
      <span class="bento-icon">✦</span>
      <div class="bento-title">Grain Texture Warmth Layer</div>
      <div class="bento-desc">Subtle film grain overlay on the hero adds tactile warmth — a cross-site trend spotted across Godly, minimal.gallery, and DarkModeDesign.com. Counteracts the "too digital" coldness of pure dark UI.</div>
      <div class="bento-accent"></div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">PALETTE</div>
  <div class="section-title">Warm Charcoal System</div>
  <div class="swatches">
    <div class="swatch"><div class="swatch-color" style="background:#1C1917"></div><div class="swatch-hex">#1C1917</div><div class="swatch-name">BG</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#262220"></div><div class="swatch-hex">#262220</div><div class="swatch-name">Surface</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#302C29"></div><div class="swatch-hex">#302C29</div><div class="swatch-name">Card</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#FAFAF9"></div><div class="swatch-hex">#FAFAF9</div><div class="swatch-name">Text</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#D4A574"></div><div class="swatch-hex">#D4A574</div><div class="swatch-name">Gold</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#6DB89A"></div><div class="swatch-hex">#6DB89A</div><div class="swatch-name">Teal</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#E07070"></div><div class="swatch-hex">#E07070</div><div class="swatch-name">Red</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#A8A29E"></div><div class="swatch-hex">#A8A29E</div><div class="swatch-name">Muted</div></div>
  </div>
</section>

<div class="stats">
  <div class="stat"><div class="stat-val">6</div><div class="stat-label">SCREENS</div></div>
  <div class="stat"><div class="stat-val">823</div><div class="stat-label">ELEMENTS</div></div>
  <div class="stat"><div class="stat-val">8</div><div class="stat-label">PALETTE TOKENS</div></div>
  <div class="stat"><div class="stat-val">4</div><div class="stat-label">TREND SOURCES</div></div>
</div>

<footer>
  <p>AURIC — Premium Wealth Intelligence · Designed by <strong>RAM</strong> · <a href="https://ram.zenbin.org/${SLUG}-viewer">View in Pencil Viewer</a> · <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a></p>
  <p style="margin-top:8px;font-size:11px;opacity:0.5">Inspired by DarkModeDesign.com · land-book.com · minimal.gallery · godly.website</p>
</footer>
</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0,80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0,80)}`);
}
main().catch(console.error);
