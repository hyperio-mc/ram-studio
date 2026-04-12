'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'drip';
const APP_NAME = 'DRIP';
const TAGLINE = 'Developer Release Intelligence Platform';

// ── Palette
const BG      = '#0E0F11';
const SURF    = '#171921';
const CARD    = '#20232D';
const BORDER  = '#2E3347';
const ACC     = '#5E6AD2';
const ACC2    = '#6EE7B7';
const WARN    = '#F59E0B';
const ERR     = '#F87171';
const TEXT    = '#F0F2F8';
const SUB     = '#8B92A8';
const MUTED   = '#4B5168';

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

// ── SVG helpers for screens
function screenToSvgDataUri(screen) {
  const svgEls = screen.elements.map(el => {
    if (el.type === 'rect') {
      const attrs = [
        `x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"`,
        `fill="${el.fill === 'transparent' ? 'none' : el.fill}"`,
        el.rx ? `rx="${el.rx}"` : '',
        el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
        el.stroke ? `stroke="${el.stroke}"` : '',
        el.strokeWidth ? `stroke-width="${el.strokeWidth}"` : '',
      ].filter(Boolean).join(' ');
      return `<rect ${attrs}/>`;
    }
    if (el.type === 'text') {
      const attrs = [
        `x="${el.x}" y="${el.y}"`,
        `font-size="${el.fontSize}"`,
        `fill="${el.fill}"`,
        el.fontWeight ? `font-weight="${el.fontWeight}"` : '',
        el.fontFamily ? `font-family="${el.fontFamily}"` : '',
        el.textAnchor ? `text-anchor="${el.textAnchor}"` : '',
        el.letterSpacing ? `letter-spacing="${el.letterSpacing}"` : '',
        el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
      ].filter(Boolean).join(' ');
      const safe = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text ${attrs}>${safe}</text>`;
    }
    if (el.type === 'circle') {
      const attrs = [
        `cx="${el.cx}" cy="${el.cy}" r="${el.r}"`,
        `fill="${el.fill}"`,
        el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
        el.stroke ? `stroke="${el.stroke}"` : '',
        el.strokeWidth ? `stroke-width="${el.strokeWidth}"` : '',
      ].filter(Boolean).join(' ');
      return `<circle ${attrs}/>`;
    }
    if (el.type === 'line') {
      const attrs = [
        `x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"`,
        `stroke="${el.stroke}"`,
        el.strokeWidth ? `stroke-width="${el.strokeWidth}"` : '',
        el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
      ].filter(Boolean).join(' ');
      return `<line ${attrs}/>`;
    }
    return '';
  }).join('\n    ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
  <rect width="390" height="844" fill="${BG}"/>
  ${svgEls}
</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// ── Build hero HTML
const screenUris = pen.screens.map(s => screenToSvgDataUri(s));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DRIP — Developer Release Intelligence Platform</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG}; --surf: ${SURF}; --card: ${CARD}; --border: ${BORDER};
    --acc: ${ACC}; --acc2: ${ACC2}; --warn: ${WARN}; --err: ${ERR};
    --text: ${TEXT}; --sub: ${SUB}; --muted: ${MUTED};
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  /* Dot grid background */
  .dot-bg {
    background-image: radial-gradient(circle, ${BORDER} 1px, transparent 1px);
    background-size: 20px 20px;
  }

  /* HERO */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 24px 64px; text-align: center; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(94,106,210,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .dot-bg-hero {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, ${BORDER} 1px, transparent 1px);
    background-size: 20px 20px; opacity: 0.5; pointer-events: none;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(94,106,210,0.12); border: 1px solid rgba(94,106,210,0.3);
    border-radius: 100px; padding: 6px 16px; margin-bottom: 32px;
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: var(--acc);
    text-transform: uppercase;
  }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--acc2); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .hero h1 {
    font-size: clamp(52px, 8vw, 88px); font-weight: 800; letter-spacing: -3px; line-height: 1.0;
    color: var(--text); margin-bottom: 24px; position: relative;
  }
  .hero h1 span { color: var(--acc); }
  .hero p {
    font-size: 18px; color: var(--sub); max-width: 520px; line-height: 1.65; margin-bottom: 48px;
  }
  .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
  .btn-primary {
    background: var(--acc); color: #fff; font-weight: 600; font-size: 14px;
    padding: 14px 32px; border-radius: 8px; text-decoration: none; border: none; cursor: pointer;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-ghost {
    background: transparent; color: var(--text); font-weight: 500; font-size: 14px;
    padding: 14px 32px; border-radius: 8px; text-decoration: none;
    border: 1px solid var(--border); cursor: pointer; transition: border-color 0.2s;
  }
  .btn-ghost:hover { border-color: var(--acc); }

  /* STATS BAR */
  .stats-bar {
    display: flex; justify-content: center; gap: 0; border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border); background: var(--surf);
  }
  .stat-item {
    flex: 1; max-width: 220px; padding: 28px 24px; text-align: center;
    border-right: 1px solid var(--border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-value { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
  .stat-label { font-size: 11px; color: var(--muted); font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }

  /* SCREENS CAROUSEL */
  .screens-section { padding: 80px 24px; }
  .section-label {
    text-align: center; font-size: 11px; font-weight: 600; letter-spacing: 2px;
    color: var(--muted); text-transform: uppercase; margin-bottom: 16px;
  }
  .section-title { text-align: center; font-size: 36px; font-weight: 700; margin-bottom: 48px; }
  .screens-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px; max-width: 1200px; margin: 0 auto;
  }
  .screen-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px;
    overflow: hidden; transition: border-color 0.2s, transform 0.2s;
  }
  .screen-card:hover { border-color: var(--acc); transform: translateY(-4px); }
  .screen-card img { width: 100%; display: block; }
  .screen-label {
    padding: 12px 16px; font-size: 12px; font-weight: 500; color: var(--sub);
    border-top: 1px solid var(--border);
  }

  /* FEATURES */
  .features-section { padding: 80px 24px; background: var(--surf); }
  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px; max-width: 1100px; margin: 0 auto;
  }
  .feature-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    padding: 28px; position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--acc), var(--acc2));
    opacity: 0;
    transition: opacity 0.3s;
  }
  .feature-card:hover::before { opacity: 1; }
  .feature-icon {
    width: 40px; height: 40px; border-radius: 8px; background: rgba(94,106,210,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 16px;
  }
  .feature-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: var(--sub); line-height: 1.6; }

  /* PALETTE */
  .palette-section { padding: 80px 24px; }
  .palette-grid { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 40px; }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .swatch-color {
    width: 64px; height: 64px; border-radius: 12px;
    border: 1px solid var(--border);
  }
  .swatch-label { font-size: 10px; color: var(--muted); font-weight: 500; }
  .swatch-hex { font-size: 11px; color: var(--sub); font-family: monospace; }

  /* FOOTER */
  footer {
    padding: 40px 24px; text-align: center; border-top: 1px solid var(--border);
    background: var(--surf);
  }
  .footer-logo { font-size: 20px; font-weight: 800; letter-spacing: 3px; color: var(--text); margin-bottom: 8px; }
  .footer-links { display: flex; gap: 24px; justify-content: center; margin-top: 20px; }
  .footer-links a { font-size: 13px; color: var(--sub); text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: var(--acc); }
  .footer-credit { font-size: 11px; color: var(--muted); margin-top: 20px; }

  @media (max-width: 600px) {
    .stats-bar { flex-direction: column; }
    .stat-item { border-right: none; border-bottom: 1px solid var(--border); max-width: none; }
  }
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="dot-bg-hero"></div>
  <div class="hero-badge">
    <span class="hero-badge-dot"></span>
    RAM Design Heartbeat
  </div>
  <h1>Ship with<br><span>precision.</span></h1>
  <p>DRIP gives engineering teams complete visibility into every pipeline, build, and deployment — in one obsessively precise interface.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="stat-item">
    <div class="stat-value" style="color:${ACC}">6</div>
    <div class="stat-label">Screens</div>
  </div>
  <div class="stat-item">
    <div class="stat-value" style="color:${ACC2}">867</div>
    <div class="stat-label">Elements</div>
  </div>
  <div class="stat-item">
    <div class="stat-value" style="color:${WARN}">Dark</div>
    <div class="stat-label">Theme</div>
  </div>
  <div class="stat-item">
    <div class="stat-value" style="color:${TEXT}">CI/CD</div>
    <div class="stat-label">Archetype</div>
  </div>
</div>

<!-- SCREENS -->
<section class="screens-section">
  <div class="section-label">Design Screens</div>
  <h2 class="section-title">6 screens. Every detail considered.</h2>
  <div class="screens-grid">
${pen.screens.map((s, i) => `    <div class="screen-card">
      <img src="${screenUris[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('\n')}
  </div>
</section>

<!-- FEATURES -->
<section class="features-section">
  <div class="section-label">Design Decisions</div>
  <h2 class="section-title" style="text-align:center;font-size:36px;font-weight:700;margin-bottom:48px;">Built on three principles.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Linear precision spacing</div>
      <div class="feature-desc">Every element follows an 8pt grid. No decoration exists for its own sake — spacing, weight, and scale carry all the semantic load, exactly like Linear's obsessive design system.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(110,231,183,0.12);">·</div>
      <div class="feature-title">Dot-grid signature motif</div>
      <div class="feature-desc">A subtle field of equidistant dots — inspired by Pellonium's clustered dot system on minimal.gallery — appears at screen transitions and headers as the only decorative element.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(94,106,210,0.12);">⊙</div>
      <div class="feature-title">Status through color, not icons</div>
      <div class="feature-desc">Running, success, failed, warning, and queued states are communicated through a tight 4-color system with micro progress fills — no emoji or heavy iconography needed.</div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section dot-bg">
  <div class="section-label" style="text-align:center;">Colour Palette</div>
  <h2 class="section-title">Near-black. Indigo precision.</h2>
  <div class="palette-grid">
    ${[
      { hex: BG, label: 'Background' },
      { hex: SURF, label: 'Surface' },
      { hex: CARD, label: 'Card' },
      { hex: ACC, label: 'Indigo' },
      { hex: ACC2, label: 'Emerald' },
      { hex: WARN, label: 'Amber' },
      { hex: ERR, label: 'Red' },
      { hex: TEXT, label: 'Text' },
      { hex: SUB, label: 'Subtle' },
      { hex: MUTED, label: 'Muted' },
    ].map(s => `<div class="swatch">
      <div class="swatch-color" style="background:${s.hex};"></div>
      <div class="swatch-label">${s.label}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>`).join('\n    ')}
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">DRIP</div>
  <div style="font-size:13px;color:var(--sub);">Developer Release Intelligence Platform</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Open in Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
    <a href="https://ram.zenbin.org">RAM Studio</a>
  </div>
  <div class="footer-credit">RAM Design Heartbeat · Inspired by Linear (Saaspo) + Pellonium (minimal.gallery)</div>
</footer>

</body>
</html>`;

// ── Viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 120)}`);
}
main().catch(console.error);
