'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'opus';

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

// ─── Extract screen SVGs as data URIs for the hero ───────────────────────────
const screenSvgs = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
});

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG      = '#FAF8F4';
const TEXT    = '#1C1917';
const TEXT2   = '#4B4540';
const ACC     = '#B5673E';
const ACC2    = '#3D5A80';
const CARD    = '#F3EFE8';
const CARD2   = '#EDE8DF';
const BORDER  = 'rgba(28,25,23,0.1)';

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OPUS — Creative Portfolio Journal</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: ${BG}; --text: ${TEXT}; --text2: ${TEXT2};
    --acc: ${ACC}; --acc2: ${ACC2};
    --card: ${CARD}; --card2: ${CARD2};
    --border: ${BORDER};
    --serif: Georgia, 'Times New Roman', serif;
  }
  body { background: var(--bg); color: var(--text); font-family: Inter, system-ui, sans-serif;
         line-height: 1.6; }

  /* ── Masthead ── */
  .masthead {
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
    position: sticky; top: 0; background: var(--bg); z-index: 10;
    backdrop-filter: blur(8px);
  }
  .masthead .wordmark { font-size: 18px; font-weight: 700; letter-spacing: 0.1em; color: var(--text); }
  .masthead .beat { font-size: 11px; color: var(--text2); opacity: 0.6; letter-spacing: 0.05em; }
  .masthead .links { display: flex; gap: 24px; }
  .masthead .links a { font-size: 13px; color: var(--text2); text-decoration: none; opacity: 0.7; }
  .masthead .links a:hover { opacity: 1; color: var(--acc); }

  /* ── Hero ── */
  .hero {
    max-width: 960px; margin: 0 auto;
    padding: 80px 40px 60px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
  }
  .hero-text {}
  .hero-eyebrow {
    font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
    color: var(--acc); text-transform: uppercase; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .hero-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: var(--acc); }
  .hero h1 {
    font-family: var(--serif); font-size: 56px; font-weight: 300;
    line-height: 1.1; letter-spacing: -0.03em; color: var(--text);
    margin-bottom: 24px;
  }
  .hero h1 em { font-style: normal; color: var(--acc); }
  .hero-sub {
    font-size: 15px; color: var(--text2); opacity: 0.75;
    line-height: 1.7; max-width: 380px; margin-bottom: 32px;
  }
  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-primary {
    background: var(--text); color: var(--bg);
    padding: 12px 28px; border-radius: 4px;
    font-size: 14px; font-weight: 600; text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.8; }
  .btn-secondary {
    background: transparent; color: var(--text);
    padding: 12px 28px; border-radius: 4px;
    font-size: 14px; font-weight: 500; text-decoration: none;
    border: 1px solid var(--border);
    transition: border-color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--acc); color: var(--acc); }

  /* Screen carousel */
  .hero-screens {
    position: relative; display: flex; gap: 12px; align-items: flex-start;
  }
  .screen-thumb {
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 8px 32px rgba(28,25,23,0.08), 0 1px 4px rgba(28,25,23,0.06);
    border: 1px solid var(--border);
    flex-shrink: 0;
  }
  .screen-thumb img { display: block; }
  .screen-thumb:nth-child(1) { width: 160px; margin-top: 20px; }
  .screen-thumb:nth-child(2) { width: 160px; }
  .screen-thumb:nth-child(3) { width: 120px; margin-top: 40px; opacity: 0.7; }

  /* ── Divider ── */
  .divider { max-width: 960px; margin: 0 auto; padding: 0 40px; }
  .divider hr { border: none; border-top: 1px solid var(--border); }

  /* ── Features bento ── */
  .features { max-width: 960px; margin: 0 auto; padding: 64px 40px; }
  .features-eyebrow {
    font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text2); opacity: 0.55; margin-bottom: 40px;
  }
  .bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .bento-cell {
    background: var(--card); border-radius: 8px; padding: 28px 24px;
    border: 1px solid var(--border); position: relative; overflow: hidden;
  }
  .bento-cell.wide { grid-column: span 2; }
  .bento-cell.accent-bg { background: var(--text); color: var(--bg); }
  .bento-cell.accent-bg .bento-label { color: rgba(250,248,244,0.5); }
  .bento-icon { font-size: 22px; margin-bottom: 14px; }
  .bento-title { font-size: 16px; font-weight: 500; margin-bottom: 8px; }
  .bento-desc { font-size: 13px; color: var(--text2); opacity: 0.7; line-height: 1.5; }
  .bento-cell.accent-bg .bento-desc { color: rgba(250,248,244,0.65); opacity: 1; }
  .bento-label {
    position: absolute; bottom: 20px; right: 20px;
    font-size: 10px; color: var(--text2); letter-spacing: 0.08em; opacity: 0.45;
  }
  .bento-number {
    font-family: var(--serif); font-size: 52px; font-weight: 300;
    color: var(--acc); line-height: 1; margin-bottom: 8px;
  }

  /* ── Screens gallery ── */
  .screens-section { max-width: 960px; margin: 0 auto; padding: 0 40px 80px; }
  .screens-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    margin-top: 32px;
  }
  .screen-card { text-align: center; }
  .screen-card img {
    width: 100%; border-radius: 16px;
    border: 1px solid var(--border);
    box-shadow: 0 4px 16px rgba(28,25,23,0.07);
  }
  .screen-label { font-size: 11px; color: var(--text2); opacity: 0.55; margin-top: 8px; }

  /* ── Palette ── */
  .palette-section { background: var(--card2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .palette-inner { max-width: 960px; margin: 0 auto; padding: 48px 40px; }
  .palette-eyebrow { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text2); opacity: 0.55; margin-bottom: 28px; }
  .swatches { display: flex; gap: 16px; flex-wrap: wrap; }
  .swatch { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .swatch-blob { width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--border); }
  .swatch-name { font-size: 10px; color: var(--text2); opacity: 0.6; }
  .swatch-hex { font-size: 10px; font-family: monospace; color: var(--text); opacity: 0.75; }

  /* ── Inspiration ── */
  .inspiration { max-width: 960px; margin: 0 auto; padding: 64px 40px; }
  .insp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 28px; }
  .insp-card {
    padding: 20px; border-radius: 6px; border-left: 3px solid var(--acc);
    background: var(--card);
  }
  .insp-site { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .insp-note { font-size: 12px; color: var(--text2); opacity: 0.65; line-height: 1.5; }

  /* ── Links ── */
  .links-section { max-width: 960px; margin: 0 auto; padding: 48px 40px; display: flex; gap: 16px; flex-wrap: wrap; }
  .link-pill {
    padding: 10px 20px; border-radius: 100px;
    font-size: 13px; text-decoration: none; font-weight: 500;
    transition: all 0.2s;
  }
  .link-pill.dark { background: var(--text); color: var(--bg); }
  .link-pill.dark:hover { background: var(--acc); }
  .link-pill.outline { border: 1px solid var(--border); color: var(--text); }
  .link-pill.outline:hover { border-color: var(--acc); color: var(--acc); }

  /* ── Footer ── */
  footer {
    border-top: 1px solid var(--border); text-align: center;
    padding: 32px; font-size: 11px; color: var(--text2); opacity: 0.5;
    letter-spacing: 0.05em;
  }

  @media (max-width: 700px) {
    .hero { grid-template-columns: 1fr; }
    .hero-screens { display: none; }
    .bento { grid-template-columns: 1fr 1fr; }
    .bento-cell.wide { grid-column: span 2; }
    .screens-grid { grid-template-columns: repeat(2, 1fr); }
    .insp-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<!-- Masthead -->
<header class="masthead">
  <div class="wordmark">OPUS</div>
  <div class="links">
    <a href="https://ram.zenbin.org/opus-viewer">View Prototype →</a>
    <a href="https://ram.zenbin.org/opus-mock">Interactive Mock</a>
  </div>
  <div class="beat">Heartbeat #500</div>
</header>

<!-- Hero -->
<section class="hero">
  <div class="hero-text">
    <div class="hero-eyebrow">Design Heartbeat · April 2026</div>
    <h1>Your work,<br>beautifully<br><em>held.</em></h1>
    <p class="hero-sub">
      OPUS is a portfolio journal for designers who treat craft seriously —
      track projects, write about process, and share a curated public portfolio.
    </p>
    <div class="btn-row">
      <a class="btn-primary" href="https://ram.zenbin.org/opus-viewer">View Prototype</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/opus-mock">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="hero-screens">
    <div class="screen-thumb">
      <img src="${screenSvgs[0]}" width="160" alt="Onboarding">
    </div>
    <div class="screen-thumb">
      <img src="${screenSvgs[1]}" width="160" alt="Dashboard">
    </div>
    <div class="screen-thumb">
      <img src="${screenSvgs[4]}" width="120" alt="Gallery">
    </div>
  </div>
</section>

<div class="divider"><hr></div>

<!-- Features Bento -->
<section class="features">
  <div class="features-eyebrow">What OPUS does</div>
  <div class="bento">
    <div class="bento-cell wide accent-bg">
      <div class="bento-number">500</div>
      <div class="bento-title">Heartbeat milestone</div>
      <div class="bento-desc">This is RAM's 500th design heartbeat — an editorial portfolio journal inspired by the serif renaissance on minimal.gallery and Notion's warm cream aesthetic on Saaspo.</div>
      <div class="bento-label">MILESTONE</div>
    </div>
    <div class="bento-cell">
      <div class="bento-icon">◻</div>
      <div class="bento-title">Project Tracking</div>
      <div class="bento-desc">Track active client work with visual progress, deliverable checklists, and process notes.</div>
    </div>
    <div class="bento-cell">
      <div class="bento-icon">✍</div>
      <div class="bento-title">Design Journal</div>
      <div class="bento-desc">Write long-form process notes and design thinking — like a sketchbook, but searchable.</div>
    </div>
    <div class="bento-cell">
      <div class="bento-icon">⊞</div>
      <div class="bento-title">Curated Gallery</div>
      <div class="bento-desc">Asymmetric masonry grid for your work — echoing the editorial curation of minimal.gallery.</div>
    </div>
    <div class="bento-cell wide">
      <div class="bento-icon">↗</div>
      <div class="bento-title">Live Portfolio Page</div>
      <div class="bento-desc">One-tap publish to a clean public portfolio at opus.portfolio/yourname — with analytics, section controls, and referral invites.</div>
    </div>
  </div>
</section>

<!-- Screens grid -->
<section class="screens-section">
  <div class="divider"><hr></div>
  <div style="margin-top:40px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text2);opacity:0.55;">6 screens</div>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenSvgs[i]}" alt="${s.name}">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- Palette -->
<section class="palette-section">
  <div class="palette-inner">
    <div class="palette-eyebrow">Colour palette — Warm Cream Editorial</div>
    <div class="swatches">
      ${[
        { hex: '#FAF8F4', name: 'Warm Cream' },
        { hex: '#FFFFFF', name: 'Surface' },
        { hex: '#F3EFE8', name: 'Card' },
        { hex: '#1C1917', name: 'Ink' },
        { hex: '#B5673E', name: 'Terracotta' },
        { hex: '#3D5A80', name: 'Steel Blue' },
        { hex: '#4B4540', name: 'Warm Grey' },
      ].map(s => `<div class="swatch">
        <div class="swatch-blob" style="background:${s.hex}"></div>
        <div class="swatch-name">${s.name}</div>
        <div class="swatch-hex">${s.hex}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- Inspiration -->
<section class="inspiration">
  <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text2);opacity:0.55;margin-bottom:4px;">Research sources</div>
  <div class="insp-grid">
    ${pen.metadata.inspiration.map(s => {
      const [site, note] = s.split(': ');
      return `<div class="insp-card">
        <div class="insp-site">${site}</div>
        <div class="insp-note">${note}</div>
      </div>`;
    }).join('')}
    <div class="insp-card">
      <div class="insp-site">Saaspo: Notion landing page</div>
      <div class="insp-note">Warm off-white cream palette as primary background — a deliberate break from pure white</div>
    </div>
    <div class="insp-card">
      <div class="insp-site">Land-book: asymmetric minimalism trend</div>
      <div class="insp-note">Alternating card offsets and masonry layouts creating visual rhythm without decoration</div>
    </div>
  </div>
</section>

<!-- Links -->
<div class="divider"><hr></div>
<div class="links-section">
  <a class="link-pill dark" href="https://ram.zenbin.org/opus-viewer">View Prototype →</a>
  <a class="link-pill outline" href="https://ram.zenbin.org/opus-mock">Interactive Mock ☀◑</a>
  <a class="link-pill outline" href="https://ram.zenbin.org/opus">This page</a>
</div>

<!-- Footer -->
<footer>
  OPUS — RAM Design Heartbeat #500 · April 2026 · Light Theme · 6 screens · 669 elements
</footer>

</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── Publish ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'OPUS — Creative Portfolio Journal');
  console.log(`Hero: ${r1.status}  ${r1.status === 201 ? '✓' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'OPUS — Prototype Viewer');
  console.log(`Viewer: ${r2.status}  ${r2.status === 201 ? '✓' : r2.body.slice(0, 120)}`);
}

main().catch(console.error);
