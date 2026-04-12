'use strict';
// SPINE — Hero + Viewer publish
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'spine';
const NAME    = 'SPINE';
const TAGLINE = 'your reading life, beautifully tracked';

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

// ─── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:      '#F5F0E4',
  surf:    '#FFFDF7',
  card:    '#EDE8DC',
  text:    '#1A1613',
  textSec: '#6B6258',
  accent:  '#C8901A',
  accent2: '#4A7C59',
  softGold:'#F2DBA0',
  border:  'rgba(26,22,19,0.1)',
};

// ─── Generate screen thumbnail SVGs ─────────────────────────────────────────
function screenToSvg(screen) {
  const W = 390, H = 844;
  function elToSvg(el) {
    switch (el.type) {
      case 'rect': {
        const attrs = [
          `x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"`,
          `fill="${el.fill}"`,
          el.rx ? `rx="${el.rx}"` : '',
          el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
          el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"` : '',
        ].filter(Boolean).join(' ');
        return `<rect ${attrs}/>`;
      }
      case 'text': {
        const attrs = [
          `x="${el.x}" y="${el.y}"`,
          `font-size="${el.fontSize}"`,
          `fill="${el.fill}"`,
          el.fontWeight && el.fontWeight !== 400 ? `font-weight="${el.fontWeight}"` : '',
          el.fontFamily ? `font-family="${el.fontFamily === 'serif' ? 'Georgia,serif' : 'system-ui,sans-serif'}"` : '',
          el.textAnchor && el.textAnchor !== 'start' ? `text-anchor="${el.textAnchor}"` : '',
          el.letterSpacing ? `letter-spacing="${el.letterSpacing}"` : '',
          el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
        ].filter(Boolean).join(' ');
        const safe = String(el.content)
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;');
        return `<text ${attrs}>${safe}</text>`;
      }
      case 'circle': {
        const attrs = [
          `cx="${el.cx}" cy="${el.cy}" r="${el.r}"`,
          `fill="${el.fill}"`,
          el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
          el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"` : '',
        ].filter(Boolean).join(' ');
        return `<circle ${attrs}/>`;
      }
      case 'line': {
        const attrs = [
          `x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"`,
          `stroke="${el.stroke}"`,
          `stroke-width="${el.strokeWidth||1}"`,
          el.opacity !== undefined && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
        ].filter(Boolean).join(' ');
        return `<line ${attrs}/>`;
      }
      default: return '';
    }
  }
  const svgEls = (screen.elements || []).map(elToSvg).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${svgEls}</svg>`;
}

const screenSVGs = pen.screens.map(s => screenToSvg(s));
const screenNames = pen.screens.map(s => s.name);

// ─── Hero page ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#F5F0E4;--surf:#FFFDF7;--card:#EDE8DC;
    --text:#1A1613;--sec:#6B6258;
    --accent:#C8901A;--accent2:#4A7C59;
    --gold:#F2DBA0;--border:rgba(26,22,19,0.1);
  }
  body{background:var(--bg);color:var(--text);font-family:'Georgia',serif;min-height:100vh}
  a{color:inherit;text-decoration:none}

  /* Nav */
  nav{display:flex;align-items:center;justify-content:space-between;
    padding:20px 48px;background:var(--surf);border-bottom:1px solid var(--border)}
  .nav-logo{font-size:22px;font-weight:800;letter-spacing:4px;color:var(--text)}
  .nav-logo span{color:var(--accent)}
  .nav-links{display:flex;gap:32px;font-family:system-ui,sans-serif;font-size:13px;color:var(--sec)}
  .nav-cta{background:var(--accent);color:#FFFDF7;padding:10px 24px;border-radius:8px;
    font-family:system-ui,sans-serif;font-size:13px;font-weight:600}

  /* Hero */
  .hero{max-width:1100px;margin:0 auto;padding:80px 48px 60px;
    display:flex;align-items:center;gap:80px}
  .hero-copy{flex:1}
  .hero-badge{display:inline-block;background:var(--gold);color:var(--accent);
    font-family:system-ui,sans-serif;font-size:11px;font-weight:700;
    letter-spacing:1.5px;padding:6px 16px;border-radius:20px;margin-bottom:24px;
    border:1px solid var(--accent)}
  .hero-title{font-size:clamp(52px,7vw,80px);font-weight:800;line-height:1.05;
    letter-spacing:-1px;color:var(--text);margin-bottom:20px}
  .hero-title em{color:var(--accent);font-style:normal}
  .hero-sub{font-family:system-ui,sans-serif;font-size:17px;color:var(--sec);
    line-height:1.65;margin-bottom:36px;max-width:420px}
  .hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  .btn-primary{background:var(--text);color:var(--surf);padding:14px 32px;
    border-radius:10px;font-family:system-ui,sans-serif;font-size:14px;font-weight:600}
  .btn-secondary{color:var(--accent);font-family:system-ui,sans-serif;
    font-size:14px;font-weight:500;border-bottom:1px solid var(--accent);padding-bottom:2px}
  .hero-visual{flex:0 0 260px}
  .phone-shell{background:var(--text);border-radius:36px;padding:6px;
    box-shadow:0 40px 80px rgba(26,22,19,0.18),0 8px 24px rgba(26,22,19,0.1)}
  .phone-screen{border-radius:30px;overflow:hidden;line-height:0}
  .phone-screen svg{display:block;width:100%}

  /* Inspiration */
  .section{max-width:1100px;margin:0 auto;padding:64px 48px}
  .section-label{font-family:system-ui,sans-serif;font-size:11px;font-weight:700;
    letter-spacing:2px;color:var(--accent);margin-bottom:12px}
  .section-title{font-size:clamp(28px,4vw,40px);font-weight:700;margin-bottom:16px}
  .inspo-card{background:var(--surf);border:1px solid var(--border);border-radius:14px;
    padding:28px 32px;margin-top:24px}
  .inspo-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .inspo-item{padding:16px;background:var(--card);border-radius:10px}
  .inspo-site{font-family:system-ui,sans-serif;font-size:11px;font-weight:700;
    color:var(--accent);letter-spacing:1px;margin-bottom:6px}
  .inspo-text{font-family:system-ui,sans-serif;font-size:13px;color:var(--sec);line-height:1.5}

  /* Screens carousel */
  .screens-section{background:var(--card);padding:72px 0}
  .screens-inner{max-width:1100px;margin:0 auto;padding:0 48px}
  .screens-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:16px;margin-top:36px;
    overflow-x:auto;padding-bottom:8px}
  .screen-card{background:var(--text);border-radius:20px;padding:4px;
    box-shadow:0 12px 32px rgba(26,22,19,0.12)}
  .screen-card svg{display:block;width:100%;border-radius:16px}
  .screen-label{text-align:center;font-family:system-ui,sans-serif;font-size:11px;
    color:var(--sec);margin-top:10px;font-weight:500}

  /* Palette */
  .palette-section{max-width:1100px;margin:0 auto;padding:64px 48px}
  .swatches{display:flex;gap:16px;flex-wrap:wrap;margin-top:24px}
  .swatch{display:flex;align-items:center;gap:12px}
  .swatch-dot{width:40px;height:40px;border-radius:50%;border:1px solid var(--border);flex-shrink:0}
  .swatch-info{font-family:system-ui,sans-serif}
  .swatch-name{font-size:12px;font-weight:600;color:var(--text)}
  .swatch-hex{font-size:11px;color:var(--sec);margin-top:2px}

  /* Decisions */
  .decisions{max-width:1100px;margin:0 auto;padding:0 48px 64px}
  .decision-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:24px}
  .decision-card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:24px}
  .decision-num{font-size:36px;font-weight:800;color:var(--gold);line-height:1;margin-bottom:8px}
  .decision-title{font-size:15px;font-weight:700;margin-bottom:8px}
  .decision-body{font-family:system-ui,sans-serif;font-size:13px;color:var(--sec);line-height:1.55}

  /* Links */
  .links-bar{background:var(--text);padding:48px}
  .links-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;
    justify-content:space-between;gap:24px;flex-wrap:wrap}
  .links-title{font-size:24px;font-weight:700;color:var(--surf)}
  .links-group{display:flex;gap:16px;flex-wrap:wrap}
  .link-btn{padding:12px 28px;border-radius:10px;font-family:system-ui,sans-serif;
    font-size:13px;font-weight:600}
  .link-btn.primary{background:var(--accent);color:var(--surf)}
  .link-btn.secondary{background:var(--surf);color:var(--text)}

  /* Dot cluster decoration */
  .dot-cluster{display:inline-block;position:relative;width:40px;height:32px}
  @media(max-width:768px){
    .hero{flex-direction:column;gap:40px;padding:48px 24px}
    .hero-visual{width:100%;max-width:300px;margin:0 auto}
    nav{padding:16px 24px}
    .screens-grid{grid-template-columns:repeat(3,140px)}
    .decision-grid,.inspo-grid{grid-template-columns:1fr}
    .section,.palette-section,.decisions{padding:40px 24px}
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">SPINE<span>.</span></div>
  <div class="nav-links">
    <span>Library</span><span>Discover</span><span>Stats</span>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">View Mock →</a>
</nav>

<div class="hero">
  <div class="hero-copy">
    <div class="hero-badge">✦ RAM HEARTBEAT #${pen.metadata.heartbeat} · LIGHT THEME</div>
    <h1 class="hero-title">Your reading<br>life, <em>beautifully</em><br>tracked.</h1>
    <p class="hero-sub">SPINE is a reading life tracker designed around warm editorial craft — every book, session, and insight, held in one quiet, beautiful place.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive mock ☀◑</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-shell">
      <div class="phone-screen">
        ${screenSVGs[0]}
      </div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-label">WHAT INSPIRED THIS</div>
  <h2 class="section-title">Trend Research</h2>
  <div class="inspo-card">
    <div class="inspo-grid">
      <div class="inspo-item">
        <div class="inspo-site">MINIMAL.GALLERY</div>
        <div class="inspo-text">Pellonium's repeated dot-cluster as sole graphic element — a signature micro-motif that acts as visual identity without illustration complexity. Adopted as SPINE's leitmotif throughout all 6 screens.</div>
      </div>
      <div class="inspo-item">
        <div class="inspo-site">LAPA.NINJA</div>
        <div class="inspo-text">Warm beige (#F5F0E4 range) replacing pure white as the default background — feels premium without effort. Also the serif comeback: editorial display serifs paired with clean sans-serif body text.</div>
      </div>
      <div class="inspo-item">
        <div class="inspo-site">SAASPO.COM</div>
        <div class="inspo-text">Bento grid feature cards — modular tiles of varied sizes for Stats screen. One strong accent rule (amber only, no colour dilution) applied throughout for clarity.</div>
      </div>
      <div class="inspo-item">
        <div class="inspo-site">LAND-BOOK.COM</div>
        <div class="inspo-text">Full-bleed typographic heroes at extreme weight contrast: 800-weight display serifs at large scale, with 300-400 weight body. Translated to "The Sentence" book hero card in the Library screen.</div>
      </div>
    </div>
  </div>
</div>

<div class="screens-section">
  <div class="screens-inner">
    <div class="section-label">ALL SCREENS</div>
    <h2 class="section-title">6 Screens · ${pen.metadata.elements} Elements</h2>
    <div class="screens-grid">
      ${screenSVGs.map((svg, i) => `
        <div>
          <div class="screen-card">${svg}</div>
          <div class="screen-label">${screenNames[i]}</div>
        </div>`).join('')}
    </div>
  </div>
</div>

<div class="palette-section">
  <div class="section-label">PALETTE</div>
  <h2 class="section-title">Warm Parchment · Light</h2>
  <div class="swatches">
    ${[
      {name:'Parchment BG',    hex:'#F5F0E4', border:true },
      {name:'Creamy Surface',  hex:'#FFFDF7', border:true },
      {name:'Warm Card',       hex:'#EDE8DC', border:true },
      {name:'Dark Ink',        hex:'#1A1613'              },
      {name:'Mid Ink',         hex:'#6B6258'              },
      {name:'Amber Gold',      hex:'#C8901A'              },
      {name:'Forest Green',    hex:'#4A7C59'              },
      {name:'Pale Gold',       hex:'#F2DBA0', border:true },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-dot" style="background:${s.hex};${s.border?'border-color:rgba(26,22,19,0.2)':''}"></div>
      <div class="swatch-info">
        <div class="swatch-name">${s.name}</div>
        <div class="swatch-hex">${s.hex}</div>
      </div>
    </div>`).join('')}
  </div>
</div>

<div class="decisions">
  <div class="section-label">DESIGN DECISIONS</div>
  <h2 class="section-title">Three Key Choices</h2>
  <div class="decision-grid">
    <div class="decision-card">
      <div class="decision-num">01</div>
      <div class="decision-title">Dot-cluster micro-motif</div>
      <div class="decision-body">Inspired by Pellonium on minimal.gallery — a repeating cluster of 6 scattered dots used as the sole decorative element across all screens. Acts as identity without illustration overhead, appearing in nav icons, screen headers, and accent positions.</div>
    </div>
    <div class="decision-card">
      <div class="decision-num">02</div>
      <div class="decision-title">Warm parchment over white</div>
      <div class="decision-body">Following lapa.ninja's trend of #F5F0E4-range backgrounds replacing pure white — the warmth mirrors aged paper and print heritage, making a reading app feel at home with the medium it tracks. Three parchment tones create hierarchy.</div>
    </div>
    <div class="decision-card">
      <div class="decision-num">03</div>
      <div class="decision-title">Single accent with semantic partners</div>
      <div class="decision-body">One amber gold (#C8901A) accent with strict discipline — only used for progress, active states, and CTAs. Forest green (#4A7C59) reserved exclusively for book covers. Warm coral and indigo appear only on cover art, not UI chrome.</div>
    </div>
  </div>
</div>

<div class="links-bar">
  <div class="links-inner">
    <div class="links-title">SPINE — Heartbeat #${pen.metadata.heartbeat}</div>
    <div class="links-group">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-btn secondary">Viewer</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-btn primary">Interactive Mock ☀◑</a>
    </div>
  </div>
</div>

</body>
</html>`;

// ─── Viewer ──────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0,120) : 'OK');

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0,120) : 'OK');
}
main().catch(console.error);
