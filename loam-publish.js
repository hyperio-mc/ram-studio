'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'loam';
const APP_NAME = 'LOAM';
const TAGLINE = 'spend with the grain';
const HEARTBEAT = 392;

// Palette
const BG    = '#FAF7F1';
const ACC   = '#C4622D';
const ACC2  = '#7B9B6B';
const TEXT  = '#1C1814';
const CARD  = '#F2EDE4';
const BORD  = '#E5DDD0';

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
const screens = pen.screens;

// Build SVG thumbnails as data URIs
function svgDataUri(svgStr) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svgStr).toString('base64');
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:    ${BG};
    --surf:  #FFFFFF;
    --card:  ${CARD};
    --acc:   ${ACC};
    --acc2:  ${ACC2};
    --text:  ${TEXT};
    --muted: #9E9188;
    --bord:  ${BORD};
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  /* NAV */
  nav { position: sticky; top: 0; z-index: 100; background: rgba(250,247,241,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--bord); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 60px; }
  .nav-logo { font-weight: 700; font-size: 15px; letter-spacing: 3px; color: var(--acc); }
  .nav-tag  { font-size: 11px; color: var(--muted); letter-spacing: 1px; }
  .nav-cta  { background: var(--acc); color: #fff; border: none; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; letter-spacing: 0.5px; }

  /* HERO */
  .hero { padding: 80px 24px 60px; max-width: 900px; margin: 0 auto; text-align: center; }
  .hero-tag { font-size: 11px; font-weight: 700; letter-spacing: 3px; color: var(--acc); margin-bottom: 16px; }
  .hero-title { font-size: clamp(48px, 8vw, 88px); font-weight: 700; line-height: 1.0; color: var(--text); margin-bottom: 20px; }
  .hero-title span { color: var(--acc); }
  .hero-sub { font-size: 18px; color: var(--muted); max-width: 480px; margin: 0 auto 36px; line-height: 1.6; font-weight: 400; }
  .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary { background: var(--acc); color: #fff; padding: 13px 28px; border-radius: 24px; font-size: 14px; font-weight: 600; text-decoration: none; letter-spacing: 0.5px; }
  .btn-secondary { background: transparent; color: var(--acc); padding: 13px 28px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; border: 1.5px solid var(--bord); }

  /* PALETTE STRIP */
  .palette { display: flex; gap: 0; height: 6px; max-width: 200px; margin: 48px auto 0; border-radius: 3px; overflow: hidden; }
  .palette div { flex: 1; }

  /* SCREENS CAROUSEL */
  .screens-section { padding: 60px 24px; overflow: hidden; }
  .screens-title { font-size: 13px; font-weight: 600; letter-spacing: 2px; color: var(--muted); text-align: center; margin-bottom: 36px; }
  .screens-track { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
  .screen-card { background: var(--surf); border-radius: 20px; overflow: hidden; border: 1px solid var(--bord); box-shadow: 0 8px 32px rgba(28,24,20,0.06); transition: transform 0.2s; flex-shrink: 0; }
  .screen-card:hover { transform: translateY(-4px); }
  .screen-card img { width: 195px; height: auto; display: block; }
  .screen-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: var(--muted); text-align: center; padding: 10px 0 12px; }

  /* DETAILS GRID */
  .details { max-width: 900px; margin: 0 auto; padding: 40px 24px 60px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
  .detail-card { background: var(--surf); border-radius: 16px; padding: 24px; border: 1px solid var(--bord); }
  .detail-icon { font-size: 22px; margin-bottom: 12px; }
  .detail-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .detail-body  { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* STATS */
  .stats { background: var(--acc); padding: 40px 24px; }
  .stats-inner { max-width: 600px; margin: 0 auto; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 24px; }
  .stat { text-align: center; }
  .stat-val { font-size: 32px; font-weight: 700; color: #fff; }
  .stat-lbl { font-size: 11px; color: rgba(255,255,255,0.7); letter-spacing: 1.5px; margin-top: 4px; }

  /* LINKS */
  .links { padding: 40px 24px; text-align: center; }
  .links a { display: inline-block; margin: 6px 8px; font-size: 13px; color: var(--acc); text-decoration: none; border-bottom: 1px solid var(--bord); padding-bottom: 2px; }

  /* FOOTER */
  footer { background: var(--card); border-top: 1px solid var(--bord); padding: 24px; text-align: center; font-size: 12px; color: var(--muted); letter-spacing: 0.5px; }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">LOAM</span>
  <span class="nav-tag">DESIGN HEARTBEAT #${HEARTBEAT} · ${new Date().toISOString().slice(0,10)} · LIGHT THEME</span>
  <button class="nav-cta">View Mock</button>
</nav>

<section class="hero">
  <div class="hero-tag">HEARTBEAT #${HEARTBEAT} · PERSONAL FINANCE · LIGHT</div>
  <h1 class="hero-title">spend with<br/><span>the grain</span></h1>
  <p class="hero-sub">A mindful personal finance app designed around warm, grounded clarity — not anxiety.</p>
  <div class="hero-btns">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-viewer">Open Viewer →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
  </div>
  <div class="palette">
    <div style="background:#FAF7F1;"></div>
    <div style="background:#F2EDE4;"></div>
    <div style="background:#C4622D;"></div>
    <div style="background:#7B9B6B;"></div>
    <div style="background:#1C1814;"></div>
  </div>
</section>

<section class="screens-section">
  <div class="screens-title">6 SCREENS · 457 ELEMENTS</div>
  <div class="screens-track">
    ${screens.map(s => `
    <div class="screen-card">
      <img src="${svgDataUri(s.svg)}" width="195" height="422" alt="${s.name}"/>
      <div class="screen-label">${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<section class="stats">
  <div class="stats-inner">
    <div class="stat"><div class="stat-val">6</div><div class="stat-lbl">SCREENS</div></div>
    <div class="stat"><div class="stat-val">457</div><div class="stat-lbl">ELEMENTS</div></div>
    <div class="stat"><div class="stat-val">LIGHT</div><div class="stat-lbl">THEME</div></div>
    <div class="stat"><div class="stat-val">#${HEARTBEAT}</div><div class="stat-lbl">HEARTBEAT</div></div>
  </div>
</section>

<section class="details">
  <div class="detail-card">
    <div class="detail-icon">◫</div>
    <div class="detail-title">Bento Grid Dashboard</div>
    <div class="detail-body">Inspired by saaspo.com's bento layout trend — modular card tiles of varying sizes create visual hierarchy without heavy decoration.</div>
  </div>
  <div class="detail-card">
    <div class="detail-icon">⊞</div>
    <div class="detail-title">Earth Tone Differentiator</div>
    <div class="detail-body">Terracotta (#C4622D) + sage green on warm cream — a direct response to Saaspo's observation that earth tones cut through tech-blue noise.</div>
  </div>
  <div class="detail-card">
    <div class="detail-icon">✦</div>
    <div class="detail-title">Typography-as-Hero</div>
    <div class="detail-body">The insight banner and balance display use text alone as the primary visual element — borrowing Ramp's text-only hero approach for key stats.</div>
  </div>
</section>

<section class="links">
  <a href="https://ram.zenbin.org/${SLUG}-viewer">Pen Viewer</a>
  <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
  <a href="https://github.com/hyperio-mc/ram-designs">Archive</a>
</section>

<footer>
  RAM Design Heartbeat #${HEARTBEAT} · LOAM · ${new Date().toISOString().slice(0,10)} · Light Theme
</footer>

</body>
</html>`;

// Inject EMBEDDED_PEN into viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log(`Publishing ${SLUG}...`);
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
