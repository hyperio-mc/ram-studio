'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'mono';
const APP_NAME = 'MONO';
const TAGLINE = 'numbers stripped bare';

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

// ── PALETTE ────────────────────────────────────────────────────────────────
const P = {
  bg:     '#080808',
  surf:   '#0F0F0F',
  card:   '#181818',
  border: '#262626',
  t1:     '#FFFFFF',
  t2:     'rgba(255,255,255,0.65)',
  t3:     'rgba(255,255,255,0.38)',
  t4:     'rgba(255,255,255,0.18)',
};

// ── SVG SCREEN THUMBNAILS ──────────────────────────────────────────────────
function buildScreenSvg(screen) {
  const W = screen.width || 390;
  const H = screen.height || 844;
  const scale = 200 / W;
  const sh = Math.round(H * scale);

  let svgEls = '';
  (screen.elements || []).forEach(el => {
    const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    if (el.type === 'rect') {
      const stroke = (el.stroke && el.stroke !== 'none') ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 0}"` : '';
      svgEls += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill || 'none'}" rx="${el.rx || 0}"${stroke}${op}/>`;
    } else if (el.type === 'text') {
      const strokeAttr = (el.stroke && el.stroke !== 'none') ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 0}" paint-order="stroke"` : '';
      svgEls += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill || '#fff'}" font-weight="${el.fontWeight || 400}" font-family="${el.fontFamily || 'monospace'}" text-anchor="${el.textAnchor || 'start'}" letter-spacing="${el.letterSpacing || 0}"${strokeAttr}${op}>${String(el.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'line') {
      svgEls += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"${op}/>`;
    } else if (el.type === 'circle') {
      const strokeAttr = (el.stroke && el.stroke !== 'none') ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 0}"` : '';
      svgEls += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill || 'none'}"${strokeAttr}${op}/>`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="${sh}" viewBox="0 0 ${W} ${H}" style="display:block">${svgEls}</svg>`;
}

// ── HERO PAGE ──────────────────────────────────────────────────────────────
const screenSvgs = pen.screens.map(s => buildScreenSvg(s));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MONO — numbers stripped bare</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#080808;--surf:#0F0F0F;--card:#181818;
    --b:#262626;--t1:#FFFFFF;--t2:rgba(255,255,255,.65);
    --t3:rgba(255,255,255,.38);--t4:rgba(255,255,255,.18);
  }
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap');
  body{background:var(--bg);color:var(--t1);font-family:'JetBrains Mono',monospace;min-height:100vh;overflow-x:hidden}

  /* Grid lines — Uptec-style geometric scaffolding */
  body::before{
    content:'';position:fixed;inset:0;
    background-image:
      repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 1px,transparent 1px 100%),
      repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,transparent 1px 100%);
    background-size:78px 100px;
    pointer-events:none;z-index:0;
  }

  header{
    position:relative;z-index:1;
    border-bottom:0.5px solid var(--b);
    padding:20px 32px;
    display:flex;align-items:center;justify-content:space-between;
  }
  .logo{font-size:13px;font-weight:700;letter-spacing:4px;color:var(--t1)}
  .logo span{font-weight:300;color:var(--t3)}
  nav{display:flex;gap:32px}
  nav a{font-size:9px;letter-spacing:2.5px;color:var(--t3);text-decoration:none;transition:color .2s}
  nav a:hover{color:var(--t1)}

  .hero{
    position:relative;z-index:1;
    padding:80px 32px 60px;
    max-width:1100px;margin:0 auto;
  }
  .tag{font-size:9px;letter-spacing:3px;color:var(--t3);margin-bottom:28px}
  h1{
    font-size:clamp(48px,10vw,96px);font-weight:800;line-height:1;
    letter-spacing:-2px;margin-bottom:16px;
  }
  h1 .hollow{
    -webkit-text-stroke:1px rgba(255,255,255,.55);
    color:transparent;
  }
  .tagline{font-size:14px;color:var(--t2);font-weight:300;letter-spacing:1px;margin-bottom:40px}
  .cta-row{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:80px}
  .btn-solid{
    padding:12px 28px;font-size:10px;letter-spacing:2.5px;font-weight:600;font-family:inherit;
    background:var(--t1);color:var(--bg);border:none;cursor:pointer;
    text-decoration:none;display:inline-block;
  }
  .btn-hollow{
    padding:12px 28px;font-size:10px;letter-spacing:2.5px;font-weight:600;font-family:inherit;
    background:transparent;color:var(--t2);border:0.7px solid var(--b);cursor:pointer;
    text-decoration:none;display:inline-block;transition:border-color .2s,color .2s;
  }
  .btn-hollow:hover{border-color:rgba(255,255,255,.5);color:var(--t1)}

  /* Screen showcase */
  .screens-section{
    position:relative;z-index:1;
    background:var(--surf);border-top:0.5px solid var(--b);border-bottom:0.5px solid var(--b);
    padding:60px 0;
    overflow:hidden;
  }
  .screens-track{
    display:flex;gap:24px;padding:0 32px;
    overflow-x:auto;scrollbar-width:none;
  }
  .screens-track::-webkit-scrollbar{display:none}
  .screen-card{
    flex-shrink:0;
    border:0.5px solid var(--b);
    overflow:hidden;
    background:var(--bg);
    transition:border-color .2s;
  }
  .screen-card:hover{border-color:rgba(255,255,255,.35)}
  .screen-label{
    font-size:8px;letter-spacing:2.5px;color:var(--t3);
    padding:10px 14px;border-top:0.5px solid var(--b);
    background:var(--surf);
  }

  /* Feature list */
  .features{
    position:relative;z-index:1;
    max-width:1100px;margin:0 auto;
    padding:80px 32px;
    display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:0;
  }
  .feat{
    padding:32px;
    border-right:0.5px solid var(--b);
    border-bottom:0.5px solid var(--b);
  }
  .feat:nth-child(3n){border-right:none}
  .feat-icon{font-size:16px;margin-bottom:16px;opacity:.5}
  .feat-title{font-size:10px;letter-spacing:2px;font-weight:700;margin-bottom:10px;color:var(--t1)}
  .feat-desc{font-size:11px;color:var(--t2);line-height:1.7;font-weight:300}

  /* Palette swatches */
  .palette-section{
    position:relative;z-index:1;
    border-top:0.5px solid var(--b);
    padding:60px 32px;
    max-width:1100px;margin:0 auto;
  }
  .palette-label{font-size:9px;letter-spacing:3px;color:var(--t3);margin-bottom:28px}
  .swatches{display:flex;gap:2px;flex-wrap:wrap}
  .swatch{
    width:64px;height:48px;display:flex;align-items:flex-end;padding:6px;
    font-size:7px;letter-spacing:.5px;
  }

  /* Principles */
  .principles{
    position:relative;z-index:1;
    border-top:0.5px solid var(--b);
    padding:80px 32px;
    max-width:1100px;margin:0 auto;
  }
  .principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:48px;margin-top:40px}
  @media(max-width:700px){.principles-grid{grid-template-columns:1fr}}
  .principle-num{font-size:9px;letter-spacing:2px;color:var(--t4);margin-bottom:8px}
  .principle-title{
    font-size:20px;font-weight:700;margin-bottom:12px;line-height:1.1;
  }
  .principle-title.hollow{
    -webkit-text-stroke:0.6px rgba(255,255,255,.6);
    color:transparent;
  }
  .principle-desc{font-size:11px;color:var(--t2);line-height:1.7;font-weight:300}

  footer{
    position:relative;z-index:1;
    border-top:0.5px solid var(--b);
    padding:32px;
    display:flex;align-items:center;justify-content:space-between;flex-wrap:gap;
    font-size:9px;letter-spacing:1.5px;color:var(--t4);
  }
  footer a{color:var(--t3);text-decoration:none}
  footer a:hover{color:var(--t1)}
</style>
</head>
<body>

<header>
  <div class="logo">MONO <span>finance</span></div>
  <nav>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">VIEWER</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">MOCK ☀◑</a>
    <a href="https://ram.zenbin.org">RAM</a>
  </nav>
</header>

<div class="hero">
  <p class="tag">RAM DESIGN HEARTBEAT · APRIL 2026 · DARK · MONO</p>
  <h1>NUM<br><span class="hollow">BERS</span><br>BARE</h1>
  <p class="tagline">A personal finance tracker with zero color. Only black, white, and the space between.</p>
  <div class="cta-row">
    <a class="btn-solid" href="https://ram.zenbin.org/${SLUG}-viewer">Open in Viewer →</a>
    <a class="btn-hollow" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
</div>

<div class="screens-section">
  <div class="screens-track">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      ${screenSvgs[i]}
      <div class="screen-label">${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</div>

<div class="features">
  <div class="feat">
    <div class="feat-icon">◎</div>
    <div class="feat-title">ZERO COLOR</div>
    <div class="feat-desc">No hex accent colors. Hierarchy built entirely from white at varying opacities over near-black. Inspired by Uptec on DarkModeDesign.com.</div>
  </div>
  <div class="feat">
    <div class="feat-icon">◈</div>
    <div class="feat-title">HOLLOW TYPE</div>
    <div class="feat-desc">Alternating solid and stroke-only (hollow) text as the primary visual rhythm. Every other label renders as an outline letterform.</div>
  </div>
  <div class="feat">
    <div class="feat-icon">≡</div>
    <div class="feat-title">GEOMETRIC GRID</div>
    <div class="feat-desc">Structural grid lines at fixed intervals form the background scaffolding, visible but never dominant — a quiet technical presence.</div>
  </div>
  <div class="feat">
    <div class="feat-icon">○</div>
    <div class="feat-title">GHOST NUMBERS</div>
    <div class="feat-desc">Oversized hollow numbers float behind each screen as background texture, collapsing typography and decoration into a single element.</div>
  </div>
  <div class="feat">
    <div class="feat-icon">▲</div>
    <div class="feat-title">OPACITY BARS</div>
    <div class="feat-desc">Progress bars use white opacity as the only data variable — higher value = higher opacity. Color is never used to encode information.</div>
  </div>
  <div class="feat">
    <div class="feat-icon">◉</div>
    <div class="feat-title">MONOSPACE ONLY</div>
    <div class="feat-desc">JetBrains Mono is the single typeface. Every glyph advances identically — a financial register's precision embedded in the interface itself.</div>
  </div>
</div>

<div class="palette-section">
  <p class="palette-label">PALETTE — MONOCHROME BLACK</p>
  <div class="swatches">
    <div class="swatch" style="background:#080808;color:rgba(255,255,255,.35)">#080808</div>
    <div class="swatch" style="background:#0F0F0F;color:rgba(255,255,255,.35)">#0F0F0F</div>
    <div class="swatch" style="background:#181818;color:rgba(255,255,255,.35)">#181818</div>
    <div class="swatch" style="background:#262626;color:rgba(255,255,255,.35)">#262626</div>
    <div class="swatch" style="background:rgba(255,255,255,.18);color:rgba(255,255,255,.6)">18%</div>
    <div class="swatch" style="background:rgba(255,255,255,.38);color:rgba(255,255,255,.7)">38%</div>
    <div class="swatch" style="background:rgba(255,255,255,.65);color:#080808">65%</div>
    <div class="swatch" style="background:#FFFFFF;color:#080808">#FFFFFF</div>
  </div>
</div>

<div class="principles">
  <p class="palette-label">DESIGN PRINCIPLES</p>
  <div class="principles-grid">
    <div>
      <p class="principle-num">01</p>
      <p class="principle-title">SOLID</p>
      <p class="principle-desc">Primary content is full white. No softening, no gradients — the most important number on screen is stark white at full opacity.</p>
    </div>
    <div>
      <p class="principle-num">02</p>
      <p class="principle-title hollow">HOLLOW</p>
      <p class="principle-desc">Secondary content is stroke-only: the letterforms exist as outlines. Reading takes slightly more effort, which communicates hierarchy through cognitive weight.</p>
    </div>
    <div>
      <p class="principle-num">03</p>
      <p class="principle-title">GHOST</p>
      <p class="principle-desc">Tertiary decoration is near-invisible — 6% opacity, hollow strokes at 0.4px. Present only for those who look, invisible to those who don't.</p>
    </div>
  </div>
</div>

<footer>
  <span>RAM DESIGN · HEARTBEAT #14 · APRIL 2026</span>
  <span>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">VIEWER</a> &nbsp;·&nbsp;
    <a href="https://ram.zenbin.org/${SLUG}-mock">MOCK</a> &nbsp;·&nbsp;
    <a href="https://ram.zenbin.org">RAM.ZENBIN.ORG</a>
  </span>
</footer>

</body>
</html>`;

// ── VIEWER ─────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ── PUBLISH ────────────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}  ${r1.status === 201 ? '✓' : r1.body.slice(0, 80)}`);

  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}  ${r2.status === 201 ? '✓' : r2.body.slice(0, 80)}`);
}
main().catch(console.error);
