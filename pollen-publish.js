'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'pollen';
const APP     = 'POLLEN';
const TAGLINE = 'Freelance Studio OS';

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

// ── PALETTE ───────────────────────────────────────────────────────────────────
const P = {
  bg:      '#FAF7EC',
  surf:    '#FFFFFF',
  card:    '#F9EAA9',
  accent:  '#E84B3A',
  accent2: '#6B4CFF',
  text:    '#1A1510',
  muted:   '#6B6050',
  border:  '#1A1510',
  sage:    '#C8DFC8',
  pink:    '#E4CCCC',
  lavender:'#D4CCEE',
};

// ── Build screen thumbnails (SVG data URIs) ───────────────────────────────────
const screenThumbs = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return { name: s.name, uri: `data:image/svg+xml;base64,${encoded}` };
});

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP} — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg};
    --surf: ${P.surf};
    --card: ${P.card};
    --accent: ${P.accent};
    --a2: ${P.accent2};
    --text: ${P.text};
    --muted: ${P.muted};
    --border: ${P.border};
    --sage: ${P.sage};
    --pink: ${P.pink};
    --lav: ${P.lavender};
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; overflow-x: hidden; }

  /* NEO-BRUTALIST UTILS */
  .neo { border: 2px solid var(--border); box-shadow: 4px 4px 0 var(--border); }
  .neo-sm { border: 2px solid var(--border); box-shadow: 3px 3px 0 var(--border); }
  .neo-btn { border: 2px solid var(--border); box-shadow: 4px 4px 0 var(--border); cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; display: inline-block; padding: 12px 28px; font-weight: 800; font-size: 15px; text-decoration: none; }
  .neo-btn:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--border); }
  .neo-btn:active { transform: translate(4px, 4px); box-shadow: none; }
  .tag { border: 1.5px solid var(--border); box-shadow: 2px 2px 0 var(--border); font-size: 12px; font-weight: 800; padding: 3px 12px; display: inline-block; border-radius: 3px; }

  /* HEADER */
  header { background: var(--text); border-bottom: 3px solid var(--border); padding: 0 32px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .logo { color: var(--card); font-size: 20px; font-weight: 900; letter-spacing: 0.08em; }
  .logo span { color: var(--accent); }
  .hnav { display: flex; gap: 24px; align-items: center; }
  .hnav a { color: #aaa; font-size: 13px; font-weight: 600; text-decoration: none; transition: color 0.2s; }
  .hnav a:hover { color: var(--card); }

  /* HERO */
  .hero { max-width: 1200px; margin: 0 auto; padding: 80px 32px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .hero-kicker { font-size: 12px; font-weight: 800; letter-spacing: 0.14em; color: var(--muted); margin-bottom: 20px; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(52px, 7vw, 80px); font-weight: 900; line-height: 1; letter-spacing: -0.02em; margin-bottom: 24px; }
  .hero-title .accent { color: var(--accent); }
  .hero-sub { font-size: 18px; color: var(--muted); font-weight: 400; line-height: 1.6; margin-bottom: 36px; max-width: 440px; }
  .hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; }
  .cta-primary { background: var(--accent); color: white; }
  .cta-secondary { background: var(--card); color: var(--text); }
  .hero-img-wrap { position: relative; }
  .hero-img-wrap img { width: 280px; border: 3px solid var(--border); box-shadow: 8px 8px 0 var(--border); display: block; border-radius: 12px; }
  .hero-img-wrap .badge { position: absolute; top: -20px; right: -20px; background: var(--sage); padding: 10px 16px; font-weight: 800; font-size: 13px; transform: rotate(6deg); }

  /* TREND NOTE */
  .trend-strip { background: var(--text); color: var(--card); padding: 14px 32px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-align: center; border-top: 2px solid var(--border); border-bottom: 2px solid var(--border); }

  /* SCREENS SECTION */
  .screens-section { max-width: 1200px; margin: 80px auto; padding: 0 32px; }
  .section-heading { font-size: 11px; font-weight: 800; letter-spacing: 0.14em; color: var(--muted); margin-bottom: 8px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; margin-bottom: 48px; line-height: 1.1; }
  .screens-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .screen-card { position: relative; }
  .screen-card img { width: 100%; border-radius: 10px; display: block; }
  .screen-label { margin-top: 12px; font-size: 13px; font-weight: 700; color: var(--text); }
  .screen-label span { color: var(--muted); font-weight: 400; font-size: 12px; margin-left: 6px; }

  /* PALETTE */
  .palette-section { max-width: 1200px; margin: 80px auto; padding: 0 32px; }
  .palette-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 32px; }
  .swatch { width: 80px; height: 80px; border-radius: 6px; }
  .swatch-info { margin-top: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; }

  /* FEATURES */
  .features-section { max-width: 1200px; margin: 80px auto; padding: 0 32px; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
  .feat { padding: 28px; border-radius: 6px; }
  .feat-icon { font-size: 28px; margin-bottom: 14px; }
  .feat-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
  .feat-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* FOOTER */
  footer { background: var(--text); color: var(--muted); border-top: 3px solid var(--border); padding: 40px 32px; margin-top: 80px; display: flex; justify-content: space-between; align-items: center; }
  footer .logo { font-size: 16px; }
  footer .links { display: flex; gap: 24px; }
  footer .links a { color: var(--lav); font-size: 13px; font-weight: 600; text-decoration: none; }
  footer .links a:hover { color: var(--card); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; }
    .hero-img-wrap { display: flex; justify-content: center; }
    .screens-grid { grid-template-columns: repeat(2, 1fr); }
    .features-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<header>
  <div class="logo">● P<span>O</span>LLEN</div>
  <nav class="hnav">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="neo-btn cta-primary" style="padding:8px 18px;font-size:12px;">Try Mock →</a>
  </nav>
</header>

<div class="trend-strip">
  ✦ INSPIRED BY SITEINSPIRE.COM UNUSUAL LAYOUTS &amp; NEOBRUTALISM TREND &nbsp;·&nbsp; LIGHT THEME &nbsp;·&nbsp; RAM DESIGN HEARTBEAT &nbsp;·&nbsp; APR 2026
</div>

<section class="hero">
  <div>
    <div class="hero-kicker">RAM DESIGN HEARTBEAT &nbsp;·&nbsp; NEUBRUTALIST UI</div>
    <h1 class="hero-title">Brief it.<br>Track it.<br><span class="accent">Bill it.</span></h1>
    <p class="hero-sub">POLLEN is a freelance studio OS built for creative professionals. Manage briefs, track time, and send invoices — all in one place with a bold, no-nonsense interface.</p>
    <div class="hero-ctas">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="neo-btn cta-primary">View in Pencil →</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="neo-btn cta-secondary">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="hero-img-wrap">
    <img src="${screenThumbs[1].uri}" alt="Dashboard screen" />
    <div class="badge neo-sm">LIGHT THEME</div>
  </div>
</section>

<section class="screens-section">
  <div class="section-heading">6 SCREENS · 510 ELEMENTS</div>
  <h2 class="section-title">Every view, crafted.</h2>
  <div class="screens-grid">
    ${screenThumbs.map((s, i) => `
    <div class="screen-card neo-sm" style="background:${P.surf};padding:12px;border-radius:8px;">
      <img src="${s.uri}" alt="${s.name}" style="border-radius:6px;" />
      <div class="screen-label">${s.name}<span>Screen ${i + 1}</span></div>
    </div>`).join('')}
  </div>
</section>

<section class="palette-section">
  <div class="section-heading">PALETTE</div>
  <h2 class="section-title">Earthy & direct.</h2>
  <div class="palette-row">
    ${[
      { c: P.bg,      n: 'Warm Cream' },
      { c: P.card,    n: 'Butter Yellow' },
      { c: P.pink,    n: 'Blush Pink' },
      { c: P.sage,    n: 'Sage Green' },
      { c: P.lavender,n: 'Soft Lavender' },
      { c: P.accent,  n: 'Tomato Red' },
      { c: P.accent2, n: 'Electric Violet' },
      { c: P.text,    n: 'Near Black' },
    ].map(s => `<div><div class="swatch neo-sm" style="background:${s.c}"></div><div class="swatch-info">${s.c}<br><span style="color:${P.muted};font-weight:400">${s.n}</span></div></div>`).join('')}
  </div>
</section>

<section class="features-section">
  <div class="section-heading">WHY POLLEN</div>
  <h2 class="section-title">The whole studio,<br>in your pocket.</h2>
  <div class="features-grid">
    <div class="feat neo" style="background:${P.card}">
      <div class="feat-icon">📋</div>
      <div class="feat-title">Smart Briefs</div>
      <div class="feat-desc">Capture every deliverable, deadline, and rate. No more chasing emails for project scope.</div>
    </div>
    <div class="feat neo" style="background:${P.sage}">
      <div class="feat-icon">⏱</div>
      <div class="feat-title">Time Tracking</div>
      <div class="feat-desc">Log hours to any brief with one tap. See exactly where your time goes each month.</div>
    </div>
    <div class="feat neo" style="background:${P.pink}">
      <div class="feat-icon">💵</div>
      <div class="feat-title">One-Tap Invoices</div>
      <div class="feat-desc">Turn completed briefs into professional invoices instantly. Get paid faster.</div>
    </div>
    <div class="feat neo" style="background:${P.lavender}">
      <div class="feat-icon">📊</div>
      <div class="feat-title">Earnings Dashboard</div>
      <div class="feat-desc">See monthly earnings, outstanding amounts, and growth at a glance.</div>
    </div>
    <div class="feat neo" style="background:${P.card}">
      <div class="feat-icon">🏷</div>
      <div class="feat-title">Category Tags</div>
      <div class="feat-desc">Design, copy, dev, strategy — filter and sort your work by type in seconds.</div>
    </div>
    <div class="feat neo" style="background:${P.surf}">
      <div class="feat-icon">📅</div>
      <div class="feat-title">Deadline View</div>
      <div class="feat-desc">Never miss a due date. Urgent briefs surface automatically with smart alerts.</div>
    </div>
  </div>
</section>

<footer>
  <div class="logo" style="color:${P.card}">● POLLEN</div>
  <div class="links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
    <a href="https://ram.zenbin.org">RAM Gallery</a>
  </div>
  <div style="font-size:11px;letter-spacing:0.06em;color:#555">RAM DESIGN HEARTBEAT · APR 2026</div>
</footer>

</body>
</html>`;

// ── VIEWER ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ── PUBLISH ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}  ${r1.status === 201 ? '✓' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status}  ${r2.status === 201 ? '✓' : r2.body.slice(0, 120)}`);
}
main().catch(console.error);
