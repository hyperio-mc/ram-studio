'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'kova';

const BG    = '#0F0D0A';
const SURF  = '#16130F';
const CARD  = '#1E1A14';
const GOLD  = '#D4A574';
const GOLD2 = '#E8C07D';
const TEXT  = '#F5EDE0';
const TEXT2 = '#C9B89A';
const MUTED = '#7A6B57';
const GREEN = '#6BBF7A';
const RED   = '#E05A4E';
const BORDER= '#2A2318';

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

// ── Build SVG data URIs for each screen ──────────────────────────────────────
function elToSvg(el) {
  if (!el) return '';
  switch (el.type) {
    case 'rect': {
      const attrs = [
        `x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"`,
        `fill="${el.fill}"`,
        el.rx ? `rx="${el.rx}"` : '',
        el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
        el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : '',
      ].filter(Boolean).join(' ');
      return `<rect ${attrs}/>`;
    }
    case 'text': {
      const attrs = [
        `x="${el.x}" y="${el.y}"`,
        `font-size="${el.fontSize}"`,
        `fill="${el.fill}"`,
        `font-family="${el.fontFamily || 'Inter, sans-serif'}"`,
        el.fontWeight !== 400 ? `font-weight="${el.fontWeight}"` : '',
        el.textAnchor && el.textAnchor !== 'start' ? `text-anchor="${el.textAnchor}"` : '',
        el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
        el.letterSpacing ? `letter-spacing="${el.letterSpacing}"` : '',
      ].filter(Boolean).join(' ');
      const safe = (el.content || '').toString()
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<text ${attrs}>${safe}</text>`;
    }
    case 'circle': {
      const attrs = [
        `cx="${el.cx}" cy="${el.cy}" r="${el.r}"`,
        `fill="${el.fill}"`,
        el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
        el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : '',
      ].filter(Boolean).join(' ');
      return `<circle ${attrs}/>`;
    }
    case 'line': {
      const attrs = [
        `x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"`,
        `stroke="${el.stroke}"`,
        `stroke-width="${el.strokeWidth}"`,
        el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
      ].filter(Boolean).join(' ');
      return `<line ${attrs}/>`;
    }
    default: return '';
  }
}

function screenToSvg(screen) {
  const W = screen.width || 390;
  const H = screen.height || 844;
  const body = (screen.elements || []).map(elToSvg).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${BG}"/>${body}</svg>`;
}

const svgScreens = pen.screens.map(s => ({
  name: s.name,
  svg: screenToSvg(s),
}));
const svgDataUris = svgScreens.map(s => ({
  name: s.name,
  uri: 'data:image/svg+xml;base64,' + Buffer.from(s.svg).toString('base64'),
}));

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>KOVA — Wealth Intelligence</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${BG};--surf:${SURF};--card:${CARD};
  --gold:${GOLD};--gold2:${GOLD2};--text:${TEXT};--text2:${TEXT2};
  --muted:${MUTED};--green:${GREEN};--red:${RED};--border:${BORDER};
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Ambient glow orbs */
.orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
.orb1{width:500px;height:500px;background:radial-gradient(circle,${GOLD}18 0%,transparent 70%);top:-200px;right:-100px}
.orb2{width:400px;height:400px;background:radial-gradient(circle,#6B4A2A22 0%,transparent 70%);bottom:200px;left:-150px}

/* Navigation */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:64px;background:${BG}ee;backdrop-filter:blur(20px);border-bottom:1px solid ${BORDER}}
.nav-logo{font-size:18px;font-weight:800;letter-spacing:2px;color:var(--gold)}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:var(--text2);text-decoration:none;font-size:13px;font-weight:500;letter-spacing:.5px;transition:color .2s}
.nav-links a:hover{color:var(--gold)}
.nav-cta{background:var(--gold);color:${BG};padding:8px 20px;border-radius:20px;font-size:13px;font-weight:700;letter-spacing:.5px;text-decoration:none;transition:opacity .2s}
.nav-cta:hover{opacity:.85}

/* Hero */
.hero{position:relative;z-index:1;min-height:100vh;display:flex;align-items:center;padding:80px 40px 60px;gap:60px;max-width:1200px;margin:0 auto}
.hero-text{flex:1;min-width:0}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:${GOLD}18;border:1px solid ${GOLD}44;border-radius:20px;padding:6px 16px;font-size:11px;font-weight:700;color:var(--gold);letter-spacing:1.5px;margin-bottom:28px}
.hero-badge::before{content:'✦';font-size:10px}
h1{font-size:clamp(42px,6vw,72px);font-weight:800;line-height:1.05;letter-spacing:-1.5px;margin-bottom:24px}
h1 span{color:var(--gold)}
.hero-sub{font-size:18px;color:var(--text2);line-height:1.7;max-width:480px;margin-bottom:40px}
.hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.btn-primary{background:var(--gold);color:${BG};padding:14px 32px;border-radius:28px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:.5px;transition:all .2s;display:inline-block}
.btn-primary:hover{opacity:.85;transform:translateY(-1px)}
.btn-secondary{border:1px solid ${BORDER};color:var(--text2);padding:14px 32px;border-radius:28px;font-size:14px;font-weight:500;text-decoration:none;transition:all .2s;display:inline-block}
.btn-secondary:hover{border-color:${GOLD}66;color:var(--text)}
.hero-proof{font-size:12px;color:var(--muted);margin-top:24px}
.hero-proof strong{color:var(--text2)}

/* Phone frame */
.hero-visual{flex-shrink:0}
.phone-frame{position:relative;width:280px}
.phone-outer{background:${SURF};border:2px solid ${BORDER};border-radius:48px;padding:10px;box-shadow:0 40px 80px ${BG},0 0 0 1px ${GOLD}22}
.phone-screen{border-radius:40px;overflow:hidden;display:block;width:100%}
.phone-notch{position:absolute;top:20px;left:50%;transform:translateX(-50%);width:100px;height:16px;background:${BG};border-radius:8px;z-index:2}

/* Stats strip */
.stats-strip{background:${SURF};border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};padding:32px 40px;display:flex;justify-content:center;gap:80px;margin-bottom:0;position:relative;z-index:1}
.stat-item{text-align:center}
.stat-val{font-size:32px;font-weight:800;color:var(--gold);margin-bottom:4px;letter-spacing:-1px}
.stat-label{font-size:12px;color:var(--muted);letter-spacing:1px;font-weight:500}

/* Sections */
section{position:relative;z-index:1;padding:80px 40px;max-width:1200px;margin:0 auto}
.section-label{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--gold);margin-bottom:16px;display:block}
h2{font-size:clamp(32px,4vw,52px);font-weight:800;line-height:1.1;letter-spacing:-1px;margin-bottom:20px}
.section-sub{font-size:17px;color:var(--text2);line-height:1.7;max-width:520px;margin-bottom:56px}

/* Screen carousel */
.carousel{display:flex;gap:24px;overflow-x:auto;padding-bottom:20px;scrollbar-width:none;-ms-overflow-style:none;scroll-snap-type:x mandatory}
.carousel::-webkit-scrollbar{display:none}
.carousel-item{flex-shrink:0;width:195px;scroll-snap-align:start}
.carousel-frame{background:${SURF};border:1px solid ${BORDER};border-radius:32px;padding:7px;margin-bottom:12px;box-shadow:0 8px 24px ${BG}}
.carousel-frame img{border-radius:27px;display:block;width:100%}
.carousel-name{font-size:12px;color:var(--text2);font-weight:500;text-align:center}

/* Bento features */
.bento{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto;gap:16px}
.bento-card{background:${CARD};border:1px solid ${BORDER};border-radius:20px;padding:28px;position:relative;overflow:hidden;transition:border-color .2s}
.bento-card:hover{border-color:${GOLD}44}
.bento-card.wide{grid-column:span 2}
.bento-card.tall{grid-row:span 2}
.bento-accent{position:absolute;top:0;left:0;right:0;height:3px;opacity:.6}
.bento-icon{width:40px;height:40px;border-radius:12px;background:${GOLD}18;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:20px}
.bento-title{font-size:16px;font-weight:700;margin-bottom:8px}
.bento-body{font-size:13px;color:var(--text2);line-height:1.6}
.bento-metric{font-size:36px;font-weight:800;color:var(--gold);letter-spacing:-1px;margin-bottom:4px}
.bento-metric-label{font-size:12px;color:var(--muted)}

/* Palette */
.palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:40px}
.swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
.swatch-circle{width:48px;height:48px;border-radius:50%;border:1px solid ${BORDER}}
.swatch-name{font-size:10px;color:var(--muted);letter-spacing:.5px}
.swatch-hex{font-size:10px;color:var(--text2);font-family:monospace}

/* CTA section */
.cta-section{background:${SURF};border:1px solid ${BORDER};border-radius:24px;padding:60px 40px;text-align:center;margin:0 40px 80px;position:relative;z-index:1;overflow:hidden}
.cta-section::before{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:300px;background:radial-gradient(ellipse,${GOLD}12 0%,transparent 70%);pointer-events:none}

/* Footer */
footer{border-top:1px solid ${BORDER};padding:24px 40px;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
.footer-logo{font-size:14px;font-weight:800;letter-spacing:2px;color:var(--gold)}
.footer-text{font-size:12px;color:var(--muted)}
.footer-links{display:flex;gap:24px}
.footer-links a{font-size:12px;color:var(--muted);text-decoration:none}
.footer-links a:hover{color:var(--text2)}

@media(max-width:768px){
  .hero{flex-direction:column;text-align:center;padding:80px 24px 40px}
  .hero-sub,.hero-actions,.hero-proof{margin-left:auto;margin-right:auto;max-width:100%}
  .hero-actions{justify-content:center}
  .phone-frame{width:220px}
  .stats-strip{gap:32px;padding:24px}
  .bento{grid-template-columns:1fr}
  .bento-card.wide{grid-column:span 1}
  nav{padding:0 20px}
  .nav-links{display:none}
  section{padding:60px 24px}
  footer{flex-direction:column;gap:16px;text-align:center}
}
</style>
</head>
<body>
<div class="orb orb1"></div>
<div class="orb orb2"></div>

<nav>
  <div class="nav-logo">✦ KOVA</div>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#palette">Palette</a></li>
  </ul>
  <a href="https://ram.zenbin.org/kova-mock" class="nav-cta">Interactive Mock →</a>
</nav>

<div class="hero">
  <div class="hero-text">
    <div class="hero-badge">RAM Design Heartbeat #447</div>
    <h1>Wealth that<br>thinks <span>with you.</span></h1>
    <p class="hero-sub">KOVA is a premium personal finance intelligence platform. AI-powered portfolio analysis, real-time market data, and proactive wealth insights — in a warm dark interface.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/kova-viewer" class="btn-primary">View in Pencil Viewer →</a>
      <a href="https://ram.zenbin.org/kova-mock" class="btn-secondary">☀◑ Interactive Mock</a>
    </div>
    <p class="hero-proof"><strong>Dark theme</strong> · <strong>6 screens</strong> · <strong>685 elements</strong> · Heartbeat #447</p>
  </div>
  <div class="hero-visual">
    <div class="phone-frame">
      <div class="phone-outer">
        <div class="phone-notch"></div>
        <img class="phone-screen" src="${svgDataUris[0].uri}" alt="Portfolio Overview">
      </div>
    </div>
  </div>
</div>

<div class="stats-strip">
  <div class="stat-item">
    <div class="stat-val">6</div>
    <div class="stat-label">SCREENS</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">685</div>
    <div class="stat-label">ELEMENTS</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">447</div>
    <div class="stat-label">HEARTBEAT</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">DARK</div>
    <div class="stat-label">THEME</div>
  </div>
</div>

<section id="screens">
  <span class="section-label">All Screens</span>
  <h2>Six scenes of<br>intelligence</h2>
  <p class="section-sub">From portfolio overview to deep equity analysis — KOVA gives wealth managers a complete picture at every level.</p>
  <div class="carousel">
    ${svgDataUris.map((s, i) => `
    <div class="carousel-item">
      <div class="carousel-frame">
        <img src="${s.uri}" alt="${s.name}" loading="lazy">
      </div>
      <div class="carousel-name">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section id="features">
  <span class="section-label">Design Decisions</span>
  <h2>Every choice is<br>deliberate</h2>
  <p class="section-sub">Inspired by DarkModeDesign.com's luxury dark palette and Saaspo's bento grid hegemony trend.</p>
  <div class="bento">
    <div class="bento-card wide">
      <div class="bento-accent" style="background:linear-gradient(90deg,${GOLD},${GOLD2})"></div>
      <div class="bento-icon">◈</div>
      <div class="bento-title">Warm Charcoal + Gold</div>
      <div class="bento-body">Inspired directly by DarkModeDesign.com's "Warm Charcoal + Gold" luxury dark palette. Background <code style="color:${GOLD2};font-size:11px">#0F0D0A</code>, surface <code style="color:${GOLD2};font-size:11px">#16130F</code>, accent gold <code style="color:${GOLD2};font-size:11px">#D4A574</code>. The warm near-black prevents eye strain in extended-use financial dashboards while gold reads as premium without feeling garish.</div>
    </div>
    <div class="bento-card">
      <div class="bento-accent" style="background:${GOLD}"></div>
      <div class="bento-icon">◉</div>
      <div class="bento-title">Bento Grid Allocation</div>
      <div class="bento-body">Saaspo research showed 67% of top ProductHunt SaaS use bento grids. Portfolio allocations rendered as equal-weight bento cards — scannable, proportional, and visually equal without pie charts.</div>
    </div>
    <div class="bento-card">
      <div class="bento-accent" style="background:${GREEN}"></div>
      <div class="bento-icon">◎</div>
      <div class="bento-metric">84</div>
      <div class="bento-metric-label">KOVA AI Score</div>
      <div class="bento-body">Single intelligence score replaces overwhelming metric overload.</div>
    </div>
    <div class="bento-card">
      <div class="bento-accent" style="background:#6AADCB"></div>
      <div class="bento-icon">◌</div>
      <div class="bento-title">Left Color Bars</div>
      <div class="bento-body">3px vertical accent bars on allocation cards encode asset class identity without requiring icons or text — reducing cognitive load in the most-scanned section.</div>
    </div>
    <div class="bento-card wide">
      <div class="bento-accent" style="background:linear-gradient(90deg,#A88BFA,${GOLD})"></div>
      <div class="bento-icon">◆</div>
      <div class="bento-title">Priority-Coded AI Insights</div>
      <div class="bento-body">Three-tier priority system (HIGH/MEDIUM/LOW) with color-coded left bars (red/gold/green) and badge chips allows wealth managers to triage AI recommendations at a glance. Each card ends with a direct action CTA — removing the need to navigate away.</div>
    </div>
  </div>
</section>

<section id="palette">
  <span class="section-label">Color Palette</span>
  <h2>Warm Charcoal<br><span style="color:${GOLD}">+ Gold</span></h2>
  <p class="section-sub">A luxury dark palette sourced from DarkModeDesign.com — warm near-blacks layered with amber-gold accents. Built for premium financial interfaces demanding trust and clarity.</p>
  <div class="palette-row">
    ${[
      { color: BG,    name: 'Deep Obsidian', hex: BG },
      { color: SURF,  name: 'Surface',       hex: SURF },
      { color: CARD,  name: 'Card',          hex: CARD },
      { color: GOLD,  name: 'Antique Gold',  hex: GOLD },
      { color: GOLD2, name: 'Warm Gold',     hex: GOLD2 },
      { color: TEXT,  name: 'Warm White',    hex: TEXT },
      { color: TEXT2, name: 'Parchment',     hex: TEXT2 },
      { color: MUTED, name: 'Umber',         hex: MUTED },
      { color: GREEN, name: 'Sage Growth',   hex: GREEN },
      { color: RED,   name: 'Signal Red',    hex: RED },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-circle" style="background:${s.color};${s.color===BG||s.color===SURF?'border-color:#2A2318':s.color===GOLD||s.color===GOLD2?'border-color:'+GOLD+'88':''}"></div>
      <span class="swatch-name">${s.name}</span>
      <span class="swatch-hex">${s.hex}</span>
    </div>`).join('')}
  </div>
</section>

<div class="cta-section">
  <span class="section-label" style="display:block;margin-bottom:16px">Explore KOVA</span>
  <h2 style="margin-bottom:20px;font-size:clamp(28px,4vw,48px)">See it in motion</h2>
  <p style="color:var(--text2);font-size:16px;margin-bottom:36px;max-width:400px;margin-left:auto;margin-right:auto">Open the interactive mock with light/dark toggle to experience KOVA as a live product.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/kova-viewer" class="btn-primary">Open Viewer →</a>
    <a href="https://ram.zenbin.org/kova-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</div>

<footer>
  <div class="footer-logo">✦ KOVA</div>
  <div class="footer-text">RAM Design Heartbeat #447 · 2026-04-11</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/kova-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/kova-mock">Mock</a>
  </div>
</footer>
</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'KOVA — Wealth Intelligence');
  console.log(`Hero: ${r1.status}${r1.status !== 201 ? ' — ' + r1.body.slice(0, 80) : ''}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'KOVA — Pencil Viewer');
  console.log(`Viewer: ${r2.status}${r2.status !== 201 ? ' — ' + r2.body.slice(0, 80) : ''}`);
}

main().catch(console.error);
