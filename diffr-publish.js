'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'diffr';
const NAME = 'DIFFR';
const TAGLINE = 'AI code review at terminal speed';
const ACC = '#C8FF00';
const BG = '#030303';
const SURF = '#0A0A0A';
const TEXT = '#E8E8E8';
const TEXT2 = '#909090';
const BORD = '#1E1E1E';
const ACC2 = '#00FF94';
const ACC3 = '#FF3621';

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

// ── Build screens preview ──────────────────────────────────────────
function makeSvgDataUri(screen) {
  const W = 390, H = 844;
  const els = screen.elements || [];
  let svgEls = '';
  for (const e of els) {
    if (e.type === 'rect') {
      const rx = e.rx || 0;
      svgEls += `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${rx}" opacity="${e.opacity||1}"/>`;
    } else if (e.type === 'circle') {
      const sw = e.strokeWidth || 0;
      const st = e.stroke ? `stroke="${e.stroke}" stroke-width="${sw}"` : '';
      svgEls += `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity||1}" ${st}/>`;
    } else if (e.type === 'line') {
      svgEls += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth||1}" opacity="${e.opacity||1}"/>`;
    } else if (e.type === 'text') {
      const anchor = e.textAnchor || 'start';
      const fw = e.fontWeight || 400;
      const ff = e.fontFamily || 'monospace';
      const ls = e.letterSpacing || 0;
      const content = String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgEls += `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" text-anchor="${anchor}" font-weight="${fw}" font-family="${ff}" letter-spacing="${ls}" opacity="${e.opacity||1}">${content}</text>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svgEls}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const screenUris = pen.screens.map(s => ({
  name: s.name,
  uri: makeSvgDataUri(s),
}));

// ── Hero page ──────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${BG};--surf:${SURF};--card:#101010;--card2:#161616;
    --acc:${ACC};--acc2:${ACC2};--acc3:${ACC3};
    --text:${TEXT};--text2:${TEXT2};--text3:#555;--bord:${BORD};
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'JetBrains Mono',monospace;line-height:1.6}
  a{color:var(--acc);text-decoration:none}

  /* NAV */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    background:rgba(3,3,3,0.92);backdrop-filter:blur(16px);
    border-bottom:1px solid var(--bord);
    display:flex;align-items:center;justify-content:space-between;
    padding:0 32px;height:56px;
  }
  .nav-logo{font-size:16px;font-weight:700;color:var(--acc);letter-spacing:4px}
  .nav-badge{font-size:8px;font-weight:700;letter-spacing:2px;color:var(--bg);background:var(--acc);padding:3px 8px;border-radius:2px}
  .nav-links{display:flex;gap:32px;font-size:11px;letter-spacing:1.5px;color:var(--text2)}
  .nav-cta{background:var(--acc);color:var(--bg);font-size:11px;font-weight:700;letter-spacing:2px;padding:8px 20px;border-radius:2px}

  /* HERO */
  .hero{
    min-height:100vh;padding:140px 32px 80px;
    display:flex;flex-direction:column;align-items:flex-start;
    position:relative;overflow:hidden;
  }
  .hero::before{
    content:'';position:absolute;inset:0;
    background:
      repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(200,255,0,0.03) 48px),
      repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(200,255,0,0.03) 48px);
    pointer-events:none;
  }
  .hero-prompt{font-size:11px;color:var(--acc);letter-spacing:3px;margin-bottom:24px}
  .hero-title{font-size:clamp(56px,10vw,100px);font-weight:700;letter-spacing:-3px;line-height:1;color:var(--acc);margin-bottom:8px}
  .hero-sub{font-size:clamp(14px,2vw,20px);color:var(--text2);letter-spacing:2px;margin-bottom:48px}
  .hero-stats{display:flex;gap:48px;margin-bottom:56px;flex-wrap:wrap}
  .hero-stat{display:flex;flex-direction:column;gap:4px}
  .hero-stat-val{font-size:28px;font-weight:700;color:var(--text)}
  .hero-stat-val span{color:var(--acc);font-size:16px}
  .hero-stat-lbl{font-size:9px;letter-spacing:2px;color:var(--text3)}
  .hero-btns{display:flex;gap:16px;flex-wrap:wrap}
  .btn-primary{background:var(--acc);color:var(--bg);font-family:inherit;font-size:12px;font-weight:700;letter-spacing:2px;padding:14px 32px;border:none;border-radius:2px;cursor:pointer}
  .btn-secondary{background:transparent;color:var(--text2);font-family:inherit;font-size:12px;font-weight:400;letter-spacing:2px;padding:14px 32px;border:1px solid var(--bord);border-radius:2px;cursor:pointer}

  /* SCREENS */
  .screens-section{padding:80px 32px;background:var(--surf);border-top:1px solid var(--bord)}
  .section-label{font-size:9px;letter-spacing:4px;color:var(--text3);margin-bottom:16px}
  .section-title{font-size:clamp(24px,4vw,36px);font-weight:700;letter-spacing:-1px;color:var(--text);margin-bottom:48px}
  .screens-scroll{display:flex;gap:24px;overflow-x:auto;padding-bottom:16px;scroll-snap-type:x mandatory}
  .screens-scroll::-webkit-scrollbar{height:2px}
  .screens-scroll::-webkit-scrollbar-track{background:var(--card)}
  .screens-scroll::-webkit-scrollbar-thumb{background:var(--acc)}
  .screen-card{
    flex:0 0 200px;scroll-snap-align:start;
    background:var(--card);border:1px solid var(--bord);border-radius:4px;
    overflow:hidden;position:relative;
  }
  .screen-card img{width:100%;display:block;border-radius:0}
  .screen-label{
    position:absolute;bottom:0;left:0;right:0;
    background:rgba(3,3,3,0.9);padding:8px 10px;
    font-size:9px;letter-spacing:2px;color:var(--acc);font-weight:700;
  }

  /* FEATURES */
  .features-section{padding:80px 32px;border-top:1px solid var(--bord)}
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1px;background:var(--bord);border:1px solid var(--bord)}
  .feature-card{background:var(--bg);padding:32px 28px}
  .feature-icon{font-size:20px;margin-bottom:16px;color:var(--acc)}
  .feature-title{font-size:12px;font-weight:700;letter-spacing:2px;color:var(--text);margin-bottom:8px}
  .feature-desc{font-size:11px;line-height:1.7;color:var(--text2)}

  /* PALETTE */
  .palette-section{padding:80px 32px;background:var(--surf);border-top:1px solid var(--bord)}
  .palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
  .swatch{display:flex;flex-direction:column;gap:8px;align-items:flex-start}
  .swatch-box{width:64px;height:64px;border-radius:3px;border:1px solid var(--bord)}
  .swatch-name{font-size:8px;letter-spacing:1px;color:var(--text3)}
  .swatch-hex{font-size:9px;font-weight:700;color:var(--text2)}

  /* LINKS */
  .links-section{padding:64px 32px;border-top:1px solid var(--bord);display:flex;gap:24px;flex-wrap:wrap;align-items:center;justify-content:space-between}
  .links-left{display:flex;flex-direction:column;gap:8px}
  .links-title{font-size:20px;font-weight:700;letter-spacing:2px;color:var(--acc)}
  .links-sub{font-size:11px;color:var(--text2)}
  .links-btns{display:flex;gap:16px;flex-wrap:wrap}
  .link-pill{padding:10px 24px;border:1px solid var(--acc);color:var(--acc);border-radius:2px;font-size:11px;letter-spacing:2px;font-weight:700}
  .link-pill.mock{border-color:var(--acc2);color:var(--acc2)}

  /* FOOTER */
  footer{padding:32px;background:var(--surf);border-top:1px solid var(--bord);display:flex;justify-content:space-between;align-items:center;font-size:9px;letter-spacing:2px;color:var(--text3)}
  .footer-logo{color:var(--acc);font-weight:700;font-size:13px;letter-spacing:4px}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">DIFFR</div>
  <div class="nav-links">
    <span>REVIEWS</span>
    <span>INSIGHTS</span>
    <span>TEAM</span>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">TRY MOCK</a>
</nav>

<section class="hero">
  <div class="hero-prompt">~/diffr · main · RAM DESIGN HB #393</div>
  <div class="hero-title">DIFFR</div>
  <div class="hero-sub">AI CODE REVIEW AT TERMINAL SPEED</div>
  <div class="hero-stats">
    <div class="hero-stat">
      <div class="hero-stat-val">94<span>%</span></div>
      <div class="hero-stat-lbl">AI CONFIDENCE</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-val">1.4<span>h</span></div>
      <div class="hero-stat-lbl">AVG_REVIEW_TIME</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-val">24</div>
      <div class="hero-stat-lbl">OPEN_REVIEWS</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-val">6</div>
      <div class="hero-stat-lbl">SCREENS</div>
    </div>
  </div>
  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">OPEN VIEWER</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">INTERACTIVE MOCK ☀◑</a>
  </div>
</section>

<section class="screens-section">
  <div class="section-label">DESIGN · 6 SCREENS · 597 ELEMENTS</div>
  <div class="section-title">Terminal-native UI at every screen</div>
  <div class="screens-scroll">
    ${screenUris.map(s => `
    <div class="screen-card" style="flex:0 0 200px;height:433px">
      <img src="${s.uri}" alt="${s.name}" style="width:200px;height:433px;object-fit:cover">
      <div class="screen-label">${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features-section">
  <div class="section-label">CAPABILITIES</div>
  <div class="section-title">Code review rebuilt for speed</div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">▲</div>
      <div class="feature-title">AI_ANALYSIS</div>
      <div class="feature-desc">94% confidence scoring on every PR. Semantic understanding of intent, not just syntax.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≡</div>
      <div class="feature-title">LIVE_DIFF</div>
      <div class="feature-desc">Inline AI annotations directly on the diff. Apply suggested fixes in one tap.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-title">TEAM_FEED</div>
      <div class="feature-desc">Real-time velocity tracking, activity stream, and 12-week sprint analytics.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚑</div>
      <div class="feature-title">BLOCK_DETECTION</div>
      <div class="feature-desc">Instantly flags security issues, logic errors, and breaking changes before merge.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">PALETTE · TERMINAL DARK</div>
  <div class="section-title">Two-color terminal philosophy</div>
  <div class="palette-row">
    ${[
      { name:'BG',      hex:BG,       label:'Pure Black' },
      { name:'SURFACE', hex:SURF,     label:'Terminal Dark' },
      { name:'CARD',    hex:'#101010',label:'Layer' },
      { name:'ACCENT',  hex:ACC,      label:'Chartreuse' },
      { name:'ACCENT2', hex:ACC2,     label:'Neon Mint' },
      { name:'ERROR',   hex:ACC3,     label:'Alert Red' },
      { name:'TEXT',    hex:TEXT,     label:'Off-White' },
      { name:'MUTED',   hex:TEXT2,    label:'Mid-Gray' },
    ].map(sw => `
    <div class="swatch">
      <div class="swatch-box" style="background:${sw.hex}"></div>
      <div class="swatch-name">${sw.name}</div>
      <div class="swatch-hex">${sw.hex}</div>
    </div>`).join('')}
  </div>
</section>

<section class="links-section">
  <div class="links-left">
    <div class="links-title">DIFFR</div>
    <div class="links-sub">Heartbeat #393 · RAM Design AI · ${new Date().toISOString().split('T')[0]}</div>
    <div class="links-sub">Inspired by Overrrides (Godly.website) + Neon.com (DarkModeDesign.com)</div>
  </div>
  <div class="links-btns">
    <a class="link-pill" href="https://ram.zenbin.org/${SLUG}-viewer">PEN VIEWER</a>
    <a class="link-pill mock" href="https://ram.zenbin.org/${SLUG}-mock">INTERACTIVE MOCK ☀◑</a>
  </div>
</section>

<footer>
  <div class="footer-logo">DIFFR</div>
  <div>RAM DESIGN HEARTBEAT #393 · ${new Date().getFullYear()}</div>
  <div>ram.zenbin.org/${SLUG}</div>
</footer>

</body>
</html>`;

// ── Viewer page ────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ── Publish ────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} → https://ram.zenbin.org/${SLUG}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
