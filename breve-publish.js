'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'breve';
const NAME    = 'BREVE';
const TAGLINE = 'Creative briefs, client sign-off, done.';

// ─── Palette (warm cream light) ───────────────────────────────────────────────
const BG     = '#FAF7F2';
const SURF   = '#FFFFFF';
const CARD   = '#F2EDE5';
const BORDER = '#E0D8CE';
const TEXT   = '#1C1714';
const DIM    = '#8A7E74';
const ACC    = '#C05A2A';   // burnt orange
const ACC2   = '#4A7C6F';   // sage green
const ACC3   = '#7B6FAB';   // muted purple

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

// ─── Load pen ─────────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ─── Build screen SVG previews ────────────────────────────────────────────────
function buildScreenSvg(screen, index) {
  const W = 390, H = 844;
  const els = screen.elements || [];
  let svgEls = '';
  for (const el of els) {
    if (el.type === 'rect') {
      svgEls += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      svgEls += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter,sans-serif'}" text-anchor="${anchor}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity||1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      svgEls += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'line') {
      svgEls += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${svgEls}</svg>`;
}

const screenSvgs = pen.screens.map((s, i) => buildScreenSvg(s, i));
const svgDataUris = screenSvgs.map(svg => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG}; --surf: ${SURF}; --card: ${CARD}; --border: ${BORDER};
    --text: ${TEXT}; --dim: ${DIM}; --acc: ${ACC}; --acc2: ${ACC2}; --acc3: ${ACC3};
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }

  /* NAV */
  nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; position: sticky; top: 0; background: ${BG}e8; backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); z-index: 100; }
  .nav-logo { font-size: 20px; font-weight: 900; letter-spacing: 3px; color: var(--text); }
  .nav-logo span { color: var(--acc); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--dim); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--acc); }
  .nav-cta { background: var(--acc); color: white; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 10px; text-decoration: none; transition: opacity .2s; }
  .nav-cta:hover { opacity: .85; }

  /* HERO */
  .hero { max-width: 1200px; margin: 0 auto; padding: 100px 40px 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--acc)18; color: var(--acc); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 20px; margin-bottom: 24px; border: 1px solid var(--acc)40; }
  .hero-badge::before { content: ''; width: 6px; height: 6px; background: var(--acc); border-radius: 50%; }
  .hero-title { font-size: 64px; font-weight: 900; line-height: 1.0; letter-spacing: -2px; color: var(--text); margin-bottom: 20px; }
  .hero-title em { color: var(--acc); font-style: normal; }
  .hero-sub { font-size: 18px; font-weight: 400; color: var(--dim); line-height: 1.65; margin-bottom: 36px; max-width: 420px; }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary { background: var(--acc); color: white; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none; display: inline-block; transition: transform .15s, opacity .2s; }
  .btn-primary:hover { opacity: .9; transform: translateY(-1px); }
  .btn-secondary { background: var(--card); color: var(--text); font-size: 15px; font-weight: 500; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; border: 1px solid var(--border); transition: border-color .2s; }
  .btn-secondary:hover { border-color: var(--acc); }

  .hero-stats { display: flex; gap: 28px; margin-top: 36px; padding-top: 28px; border-top: 1px solid var(--border); }
  .hero-stat-val { font-size: 24px; font-weight: 800; color: var(--text); }
  .hero-stat-label { font-size: 11px; font-weight: 500; color: var(--dim); letter-spacing: 0.5px; margin-top: 2px; }

  /* SCREEN CAROUSEL */
  .screen-showcase { display: flex; gap: 16px; align-items: flex-start; }
  .screen-card { border-radius: 20px; overflow: hidden; border: 1px solid var(--border); background: var(--surf); box-shadow: 0 8px 32px rgba(28,23,20,0.08); transition: transform .3s; flex-shrink: 0; }
  .screen-card:first-child { width: 220px; transform: rotate(-1deg); }
  .screen-card:nth-child(2) { width: 200px; margin-top: 30px; transform: rotate(1deg); }
  .screen-card img { width: 100%; display: block; }

  /* BENTO FEATURE GRID */
  .features { padding: 80px 40px; max-width: 1200px; margin: 0 auto; }
  .features-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--acc); margin-bottom: 16px; }
  .features-title { font-size: 42px; font-weight: 800; color: var(--text); margin-bottom: 60px; line-height: 1.1; }
  .bento { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: auto auto; gap: 16px; }
  .bento-card { background: var(--surf); border: 1px solid var(--border); border-radius: 20px; padding: 28px; }
  .bento-card.wide { grid-column: span 2; }
  .bento-card.accent { background: var(--acc); border-color: var(--acc); }
  .bento-card.accent .bc-title, .bento-card.accent .bc-body { color: white; }
  .bento-card.accent .bc-icon { background: rgba(255,255,255,0.15); color: white; }
  .bento-card.green { background: var(--acc2)10; border-color: var(--acc2)40; }
  .bc-icon { width: 44px; height: 44px; background: var(--acc)12; color: var(--acc); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
  .bc-title { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .bc-body { font-size: 14px; color: var(--dim); line-height: 1.6; }
  .bento-stat { font-size: 48px; font-weight: 900; color: var(--acc); line-height: 1; margin-bottom: 8px; }
  .bento-stat-label { font-size: 13px; color: var(--dim); }

  /* PALETTE */
  .palette-section { padding: 60px 40px; max-width: 1200px; margin: 0 auto; }
  .palette-section h3 { font-size: 13px; font-weight: 700; letter-spacing: 2px; color: var(--dim); margin-bottom: 20px; }
  .swatches { display: flex; gap: 12px; flex-wrap: wrap; }
  .swatch { display: flex; flex-direction: column; gap: 6px; }
  .swatch-block { width: 72px; height: 72px; border-radius: 14px; border: 1px solid var(--border); }
  .swatch-hex { font-size: 10px; font-weight: 600; color: var(--dim); font-family: 'SF Mono', monospace; }
  .swatch-name { font-size: 10px; color: var(--dim); }

  /* ALL SCREENS */
  .all-screens { padding: 60px 40px; max-width: 1200px; margin: 0 auto; }
  .all-screens h3 { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--acc); margin-bottom: 16px; }
  .all-screens h2 { font-size: 36px; font-weight: 800; color: var(--text); margin-bottom: 40px; }
  .screens-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
  .screen-thumb { border-radius: 16px; overflow: hidden; border: 1px solid var(--border); background: var(--surf); }
  .screen-thumb img { width: 100%; display: block; }
  .screen-thumb-label { padding: 10px 12px; font-size: 11px; font-weight: 600; color: var(--dim); border-top: 1px solid var(--border); }

  /* FOOTER */
  footer { border-top: 1px solid var(--border); padding: 40px; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
  .footer-brand { font-size: 16px; font-weight: 900; letter-spacing: 3px; }
  .footer-brand span { color: var(--acc); }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 13px; color: var(--dim); text-decoration: none; font-weight: 500; }
  .footer-links a:hover { color: var(--acc); }
  .footer-meta { font-size: 11px; color: var(--dim); text-align: right; line-height: 1.8; }

  @media (max-width: 800px) {
    .hero { grid-template-columns: 1fr; padding: 60px 20px 40px; }
    .bento { grid-template-columns: 1fr; }
    .bento-card.wide { grid-column: span 1; }
    .screens-grid { grid-template-columns: repeat(3, 1fr); }
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">BR<span>E</span>VE</div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="#">Templates</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">View Design</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">Try Mock ☀◑</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-badge">HEARTBEAT #467 · LIGHT THEME</div>
    <h1 class="hero-title">Briefs that<br>get <em>signed.</em></h1>
    <p class="hero-sub">BREVE is the creative brief platform where your ideas get written, reviewed, and approved — without the email chaos.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ↗</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-viewer">View in Pencil ↗</a>
    </div>
    <div class="hero-stats">
      <div>
        <div class="hero-stat-val">4</div>
        <div class="hero-stat-label">ACTIVE BRIEFS</div>
      </div>
      <div>
        <div class="hero-stat-val">98%</div>
        <div class="hero-stat-label">CLIENT SAT.</div>
      </div>
      <div>
        <div class="hero-stat-val">2.4d</div>
        <div class="hero-stat-label">AVG TURNAROUND</div>
      </div>
    </div>
  </div>
  <div class="hero-right">
    <div class="screen-showcase">
      <div class="screen-card">
        <img src="${svgDataUris[0]}" alt="Dashboard">
      </div>
      <div class="screen-card">
        <img src="${svgDataUris[2]}" alt="Client Review">
      </div>
    </div>
  </div>
</section>

<section class="features">
  <div class="features-label">WHAT BREVE DOES</div>
  <h2 class="features-title">Everything between<br>brief and billable.</h2>
  <div class="bento">
    <div class="bento-card wide accent">
      <div class="bc-icon">◧</div>
      <div class="bc-title">Bento Dashboard</div>
      <div class="bc-body">Inspired by land-book.com's 2026 bento-grid trend — asymmetric cards surface the metrics that matter: pending briefs, approvals, satisfaction score, turnaround time — all at a glance.</div>
    </div>
    <div class="bento-card">
      <div class="bc-icon">✦</div>
      <div class="bc-title">Client Review Thread</div>
      <div class="bc-body">Comment threads anchored to brief sections. Clients reply, designers respond. Every revision is traceable.</div>
    </div>
    <div class="bento-card">
      <div class="bento-stat">12</div>
      <div class="bento-stat-label">Briefs approved this month</div>
    </div>
    <div class="bento-card green">
      <div class="bc-icon" style="background:${ACC2}18;color:${ACC2}">◈</div>
      <div class="bc-title">Asset Library</div>
      <div class="bc-body">Logos, photos, type files, and docs — stored per project with bento-grid browsing.</div>
    </div>
    <div class="bento-card">
      <div class="bc-icon" style="background:${ACC3}18;color:${ACC3}">⧖</div>
      <div class="bc-title">Visual Timeline</div>
      <div class="bc-body">Milestone tracking with a compact calendar strip and colour-coded status nodes.</div>
    </div>
    <div class="bento-card">
      <div class="bc-icon">◻</div>
      <div class="bc-title">Brief Builder</div>
      <div class="bc-body">Guided step form — name, goals, deliverables, deadline. 4 steps, no friction.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <h3>COLOUR PALETTE — WARM CREAM EDITORIAL</h3>
  <p style="font-size:13px;color:var(--dim);margin-bottom:24px;max-width:600px;">Inspired by siteinspire.com's 2026 Mocha Mousse / Warm Cream trend — a shift from clinical whites toward organic warmth. Burnt orange accent cuts through without aggression.</p>
  <div class="swatches">
    ${[
      { hex: BG,     name: 'Warm Cream' },
      { hex: SURF,   name: 'White' },
      { hex: CARD,   name: 'Warm Card' },
      { hex: BORDER, name: 'Warm Border' },
      { hex: TEXT,   name: 'Near-Black' },
      { hex: DIM,    name: 'Warm Muted' },
      { hex: ACC,    name: 'Burnt Orange' },
      { hex: ACC2,   name: 'Sage Green' },
      { hex: ACC3,   name: 'Muted Purple' },
    ].map(s => `<div class="swatch"><div class="swatch-block" style="background:${s.hex}"></div><div class="swatch-hex">${s.hex}</div><div class="swatch-name">${s.name}</div></div>`).join('')}
  </div>
</section>

<section class="all-screens">
  <h3>ALL SCREENS</h3>
  <h2>6 screens, 361 elements</h2>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => `
    <div class="screen-thumb">
      <img src="${svgDataUris[i]}" alt="${s.name}">
      <div class="screen-thumb-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div>
    <div class="footer-brand">BR<span>E</span>VE</div>
    <div style="font-size:12px;color:var(--dim);margin-top:4px;">Creative briefs, client sign-off, done.</div>
  </div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
  <div class="footer-meta">
    RAM Design Heartbeat #467<br>
    April 12, 2026 · Light Theme<br>
    Warm Cream / Mocha Mousse
  </div>
</footer>

</body>
</html>`;

// ─── Viewer with embedded pen ─────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}  →  https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}  →  https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
