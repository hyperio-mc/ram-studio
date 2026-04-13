'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'spline';
const NAME = 'SPLINE';
const TAGLINE = 'deployment intelligence, in real time';

// Palette
const BG    = '#080B10';
const SURF  = '#0D1018';
const CARD  = '#131922';
const BORD  = '#1E2535';
const ACC   = '#3B82F6';
const ACC2  = '#F59E0B';
const SUCC  = '#10B981';
const ERR   = '#EF4444';
const TEXT  = '#E2E8F0';
const MUTED = '#64748B';

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

// ── Build screen SVGs for hero carousel ───────────────────
function buildSvg(screen) {
  const W = 390, H = 844;
  let svgContent = '';

  // Background
  svgContent += `<rect width="${W}" height="${H}" fill="${BG}"/>`;

  (screen.elements || []).forEach(el => {
    if (!el || !el.type) return;

    if (el.type === 'rect') {
      const rx = el.rx || 0;
      const op = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke && el.stroke !== 'none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
      svgContent += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${rx}" opacity="${op}"${stroke}/>`;
    } else if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const fw = el.fontWeight || 400;
      const fs = el.fontSize || 12;
      const op = el.opacity !== undefined ? el.opacity : 1;
      const ls = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : '';
      const content = String(el.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgContent += `<text x="${el.x}" y="${el.y}" fill="${el.fill}" font-size="${fs}" font-weight="${fw}" text-anchor="${anchor}" opacity="${op}" font-family="Inter,system-ui,sans-serif"${ls}>${content}</text>`;
    } else if (el.type === 'circle') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      const stroke = el.stroke && el.stroke !== 'none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
      svgContent += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${op}"${stroke}/>`;
    } else if (el.type === 'line') {
      const op = el.opacity !== undefined ? el.opacity : 1;
      const sw = el.strokeWidth || 1;
      svgContent += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${sw}" opacity="${op}"/>`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${svgContent}</svg>`;
}

const screenSvgs = pen.screens.map(s => buildSvg(s));
const svgDataUris = screenSvgs.map(svg => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));

// ── Hero HTML ──────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:    ${BG};
    --surf:  ${SURF};
    --card:  ${CARD};
    --bord:  ${BORD};
    --acc:   ${ACC};
    --acc2:  ${ACC2};
    --succ:  ${SUCC};
    --err:   ${ERR};
    --text:  ${TEXT};
    --muted: ${MUTED};
  }
  html { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; }
  body { min-height: 100vh; }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 60px;
    background: rgba(8,11,16,0.85); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--bord);
  }
  .logo { font-size: 15px; font-weight: 700; letter-spacing: 0.12em; color: var(--text); }
  .logo span { color: var(--acc); }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    font-size: 12px; font-weight: 600; padding: 8px 18px; border-radius: 6px;
    background: var(--acc); color: #fff; border: none; cursor: pointer; text-decoration: none;
  }

  /* ── Hero ── */
  .hero {
    padding: 130px 24px 80px;
    text-align: center;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%);
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    color: var(--acc); text-transform: uppercase;
    border: 1px solid rgba(59,130,246,0.3); border-radius: 20px; padding: 4px 14px;
    margin-bottom: 28px;
  }
  .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--acc); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  h1 { font-size: clamp(36px, 7vw, 64px); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 20px; }
  h1 span { background: linear-gradient(135deg, ${ACC}, ${ACC2}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .hero-sub { font-size: 17px; color: var(--muted); max-width: 540px; margin: 0 auto 40px; line-height: 1.6; }
  .hero-actions { display: flex; gap: 12px; justify-content: center; margin-bottom: 60px; }
  .btn-primary {
    padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;
    background: var(--acc); color: #fff; border: none; cursor: pointer; text-decoration: none;
  }
  .btn-secondary {
    padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;
    background: transparent; color: var(--text); border: 1px solid var(--bord); cursor: pointer; text-decoration: none;
  }

  /* ── Stats strip ── */
  .stats {
    display: flex; justify-content: center; gap: 48px;
    border-top: 1px solid var(--bord); border-bottom: 1px solid var(--bord);
    padding: 24px; margin: 0 auto; max-width: 760px;
  }
  .stat { text-align: center; }
  .stat-val { font-size: 24px; font-weight: 700; color: var(--text); }
  .stat-lbl { font-size: 11px; color: var(--muted); margin-top: 4px; letter-spacing: 0.05em; }

  /* ── Carousel ── */
  .carousel-wrap {
    padding: 80px 24px 60px;
    max-width: 1100px; margin: 0 auto;
  }
  .carousel-label { font-size: 11px; letter-spacing: 0.1em; color: var(--muted); text-align: center; text-transform: uppercase; margin-bottom: 40px; }
  .carousel {
    display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory;
    padding-bottom: 16px; -webkit-overflow-scrolling: touch;
    scrollbar-width: thin; scrollbar-color: var(--bord) transparent;
  }
  .screen-card {
    flex: 0 0 195px; scroll-snap-align: start;
    border-radius: 22px; overflow: hidden;
    border: 1px solid var(--bord);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    transition: transform 0.3s, border-color 0.3s;
    cursor: pointer;
  }
  .screen-card:hover { transform: translateY(-6px) scale(1.02); border-color: var(--acc); }
  .screen-card img { width: 100%; display: block; }
  .screen-label { font-size: 10px; color: var(--muted); text-align: center; padding: 8px 0 4px; }

  /* ── Features ── */
  .features {
    padding: 80px 24px;
    max-width: 1100px; margin: 0 auto;
    border-top: 1px solid var(--bord);
  }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
  .feature-card {
    background: var(--surf); border: 1px solid var(--bord); border-radius: 12px;
    padding: 28px; transition: border-color 0.2s;
  }
  .feature-card:hover { border-color: rgba(59,130,246,0.4); }
  .feature-icon { font-size: 22px; margin-bottom: 14px; }
  .feature-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ── Palette ── */
  .palette-section {
    padding: 60px 24px;
    max-width: 760px; margin: 0 auto;
    border-top: 1px solid var(--bord);
    text-align: center;
  }
  .palette-title { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 24px; }
  .swatches { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .swatch { width: 48px; height: 48px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); }
  .swatch-label { font-size: 9px; color: var(--muted); margin-top: 6px; text-align: center; }

  /* ── Links ── */
  .links-section {
    padding: 60px 24px 80px;
    max-width: 760px; margin: 0 auto;
    text-align: center;
    border-top: 1px solid var(--bord);
  }
  .links-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
  .links-sub { font-size: 13px; color: var(--muted); margin-bottom: 32px; }
  .links-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .link-pill {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
    background: var(--surf); border: 1px solid var(--bord); color: var(--text);
    text-decoration: none; transition: border-color 0.2s;
  }
  .link-pill:hover { border-color: var(--acc); color: var(--acc); }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--bord); padding: 24px;
    text-align: center; font-size: 11px; color: var(--muted);
  }
</style>
</head>
<body>

<nav>
  <div class="logo">SP<span>L</span>INE</div>
  <div class="nav-links">
    <a href="#">Overview</a>
    <a href="#">Deployments</a>
    <a href="#">Performance</a>
    <a href="#">Alerts</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">Try Mock →</a>
</nav>

<section class="hero">
  <div class="hero-eyebrow">
    <span class="eyebrow-dot"></span>
    Developer Observability Platform
  </div>
  <h1>Deploy with<br><span>confidence</span></h1>
  <p class="hero-sub">
    Real-time deployment intelligence, error tracking, and performance monitoring — built for engineering teams who ship fast.
  </p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-viewer">View Prototype →</a>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-val">99.97%</div><div class="stat-lbl">Uptime tracked</div></div>
    <div class="stat"><div class="stat-val">&lt;200ms</div><div class="stat-lbl">Alert latency</div></div>
    <div class="stat"><div class="stat-val">14+</div><div class="stat-lbl">Deploys per day</div></div>
    <div class="stat"><div class="stat-val">p95 OK</div><div class="stat-lbl">Latency target</div></div>
  </div>
</section>

<div class="carousel-wrap">
  <div class="carousel-label">6 screens — prototype</div>
  <div class="carousel">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${svgDataUris[i]}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</div>

<section class="features">
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⬆</div>
      <div class="feature-title">Deployment Timeline</div>
      <div class="feature-desc">Visual history of every deploy with commit metadata, duration, author, and rollback triggers — all in one scroll.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Error Intelligence</div>
      <div class="feature-desc">Group, rank, and trace errors by frequency with mini-sparklines. Severity bands show what's critical vs. noise.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≋</div>
      <div class="feature-title">Percentile Metrics</div>
      <div class="feature-desc">Latency histograms and p50/75/95/99 breakdowns reveal tail behavior that averages always hide.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⌬</div>
      <div class="feature-title">Smart Alerting</div>
      <div class="feature-desc">Threshold rules with configurable windows. Active incidents get prominent banners — no more scanning logs.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Service Health Grid</div>
      <div class="feature-desc">At-a-glance service status with uptime percentages and live progress bars. Spot degradation before users do.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⬤</div>
      <div class="feature-title">Team Activity Feed</div>
      <div class="feature-desc">Live stream of who deployed what, who acknowledged which alert, and who changed what config — full team visibility.</div>
    </div>
  </div>
</section>

<div class="palette-section">
  <div class="palette-title">Color Palette</div>
  <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;">
    ${[
      { color: BG,   label: 'Background' },
      { color: SURF, label: 'Surface' },
      { color: CARD, label: 'Card' },
      { color: ACC,  label: 'Electric Blue' },
      { color: ACC2, label: 'Amber' },
      { color: SUCC, label: 'Success' },
      { color: ERR,  label: 'Error' },
    ].map(s => `<div><div class="swatch" style="background:${s.color}"></div><div class="swatch-label">${s.label}</div></div>`).join('')}
  </div>
</div>

<div class="links-section">
  <div class="links-title">Explore the design</div>
  <div class="links-sub">Browse the full prototype or try the interactive Svelte mock with light/dark toggle.</div>
  <div class="links-row">
    <a class="link-pill" href="https://ram.zenbin.org/${SLUG}-viewer">⬤ Prototype Viewer</a>
    <a class="link-pill" href="https://ram.zenbin.org/${SLUG}-mock">☀ Interactive Mock</a>
  </div>
</div>

<footer>
  RAM Design Heartbeat #475 · ${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})} · Inspired by Godly.website developer tools trend
</footer>

</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0,100)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Prototype Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0,100)}`);
}

main().catch(console.error);
