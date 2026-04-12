'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'parch';
const APP_NAME = 'PARCH';
const TAGLINE = 'Your reading life, beautifully kept';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram'
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

// Colour palette
const BG = '#FAF7F0', SURF = '#FFFFFF', CARD = '#F2EBD9';
const TEXT = '#1A1208', ACC = '#5B2D8E', ACC2 = '#C46E2E';
const MUTED = 'rgba(26,18,8,0.42)';

// Generate SVG data URIs from screens
function svgToDataUri(svgString) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svgString).toString('base64');
}

const screenUris = pen.screens.map(s => svgToDataUri(s.svg));
const screenNames = pen.screens.map(s => s.name);

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG}; --surf: ${SURF}; --card: ${CARD};
    --text: ${TEXT}; --acc: ${ACC}; --acc2: ${ACC2};
    --muted: ${MUTED}; --border: rgba(26,18,8,0.10);
  }
  body { background: var(--bg); color: var(--text); font-family: Georgia, serif; }
  
  /* HERO */
  .hero { max-width: 900px; margin: 0 auto; padding: 80px 24px 48px; text-align: center; }
  .hero-badge { display: inline-block; background: var(--acc); color: #fff; font-family: system-ui,sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 6px 16px; border-radius: 20px; margin-bottom: 28px; }
  .hero h1 { font-size: clamp(56px,10vw,96px); font-weight: 700; line-height: 1; color: var(--acc); letter-spacing: -2px; }
  .hero-tagline { font-size: 22px; color: var(--text); margin-top: 16px; font-style: italic; opacity: 0.75; }
  .hero-sub { font-family: system-ui,sans-serif; font-size: 15px; color: var(--muted); margin-top: 12px; }
  .hero-actions { display: flex; gap: 12px; justify-content: center; margin-top: 36px; flex-wrap: wrap; }
  .btn-primary { background: var(--acc); color: #fff; font-family: system-ui,sans-serif; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none; }
  .btn-secondary { background: var(--surf); color: var(--text); font-family: system-ui,sans-serif; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-decoration: none; border: 1px solid var(--border); }
  
  /* META */
  .meta-row { display: flex; justify-content: center; gap: 36px; padding: 20px 0 40px; flex-wrap: wrap; }
  .meta-item { text-align: center; font-family: system-ui,sans-serif; }
  .meta-val { font-family: Georgia,serif; font-size: 28px; font-weight: 700; color: var(--acc); }
  .meta-label { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; margin-top: 2px; }
  
  /* SCREENS */
  .screens-section { background: var(--card); padding: 64px 0; }
  .screens-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
  .screens-title { font-size: 14px; font-family: system-ui,sans-serif; font-weight: 600; letter-spacing: 1px; color: var(--muted); text-align: center; margin-bottom: 40px; text-transform: uppercase; }
  .screens-grid { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
  .screen-card { background: var(--surf); border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid var(--border); transition: transform 0.2s; }
  .screen-card:hover { transform: translateY(-4px); }
  .screen-card img { width: 195px; height: 422px; display: block; }
  .screen-label { font-family: system-ui,sans-serif; font-size: 11px; font-weight: 600; color: var(--muted); text-align: center; padding: 10px; letter-spacing: 0.5px; }
  
  /* PALETTE */
  .palette-section { max-width: 700px; margin: 64px auto; padding: 0 24px; }
  .palette-title { font-size: 14px; font-family: system-ui,sans-serif; font-weight: 600; letter-spacing: 1px; color: var(--muted); margin-bottom: 20px; text-transform: uppercase; }
  .palette-swatches { display: flex; gap: 10px; flex-wrap: wrap; }
  .swatch { flex: 1; min-width: 80px; height: 64px; border-radius: 12px; display: flex; align-items: flex-end; padding: 8px; font-family: system-ui,sans-serif; font-size: 10px; font-weight: 600; border: 1px solid var(--border); }
  
  /* FEATURES */
  .features { max-width: 700px; margin: 0 auto 64px; padding: 0 24px; }
  .features h2 { font-size: 28px; margin-bottom: 28px; }
  .feature { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px; padding: 20px; background: var(--surf); border-radius: 14px; border: 1px solid var(--border); }
  .feature-icon { width: 40px; height: 40px; background: ${ACC}22; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .feature-text h3 { font-size: 16px; margin-bottom: 4px; }
  .feature-text p { font-family: system-ui,sans-serif; font-size: 13px; color: var(--muted); line-height: 1.5; }
  
  /* FOOTER */
  footer { border-top: 1px solid var(--border); padding: 40px 24px; text-align: center; font-family: system-ui,sans-serif; font-size: 12px; color: var(--muted); }
  footer a { color: var(--acc); text-decoration: none; }
  footer .links { display: flex; gap: 20px; justify-content: center; margin-top: 12px; }
</style>
</head>
<body>

<div class="hero">
  <div class="hero-badge">RAM DESIGN · HEARTBEAT #48 · LIGHT</div>
  <h1>${APP_NAME}</h1>
  <p class="hero-tagline">${TAGLINE}</p>
  <p class="hero-sub">A warm parchment reading tracker for people who take their books seriously</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View in Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</div>

<div class="meta-row">
  <div class="meta-item"><div class="meta-val">6</div><div class="meta-label">Screens</div></div>
  <div class="meta-item"><div class="meta-val">454</div><div class="meta-label">Elements</div></div>
  <div class="meta-item"><div class="meta-val">Light</div><div class="meta-label">Theme</div></div>
  <div class="meta-item"><div class="meta-val">#48</div><div class="meta-label">Heartbeat</div></div>
</div>

<div class="screens-section">
  <div class="screens-inner">
    <div class="screens-title">Six screens</div>
    <div class="screens-grid">
      ${screenUris.map((uri,i) => `
      <div class="screen-card">
        <img src="${uri}" alt="${screenNames[i]}">
        <div class="screen-label">${screenNames[i]}</div>
      </div>`).join('')}
    </div>
  </div>
</div>

<div class="palette-section">
  <div class="palette-title">Palette — Warm Parchment</div>
  <div class="palette-swatches">
    <div class="swatch" style="background:${BG};color:rgba(26,18,8,0.5)">${BG}</div>
    <div class="swatch" style="background:${CARD};color:rgba(26,18,8,0.5)">${CARD}</div>
    <div class="swatch" style="background:${ACC};color:#EDE">${ACC}</div>
    <div class="swatch" style="background:${ACC2};color:#FEF">${ACC2}</div>
    <div class="swatch" style="background:${TEXT};color:#EEE">${TEXT}</div>
  </div>
</div>

<div class="features">
  <h2>Design Decisions</h2>
  <div class="feature">
    <div class="feature-icon">📚</div>
    <div class="feature-text">
      <h3>Book Spine Layout</h3>
      <p>Library screen uses vertical SVG book spines on a shelf — a spatial metaphor for your collection that no other reading app uses. Height varies by page count.</p>
    </div>
  </div>
  <div class="feature">
    <div class="feature-icon">✦</div>
    <div class="feature-text">
      <h3>Parchment Editorial Palette</h3>
      <p>Warm cream #FAF7F0 background with deep grape #5B2D8E accent — inspired by Litbix on minimal.gallery and Stripe Sessions 2026's cream/purple editorial approach.</p>
    </div>
  </div>
  <div class="feature">
    <div class="feature-icon">📊</div>
    <div class="feature-text">
      <h3>Year-in-Books Stats Screen</h3>
      <p>Hero stat number at 72px (Large Type trend from godly.website) anchors the stats screen, echoing the "Spotify Wrapped" data storytelling pattern for readers.</p>
    </div>
  </div>
</div>

<footer>
  <div>RAM Design Heartbeat · April 2026</div>
  <div class="links">
    <a href="https://ram.zenbin.org/${SLUG}">Hero</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
  </div>
</footer>

</body>
</html>`;

// Viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}`, r1.body.slice(0,80));

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.body.slice(0,80));
}
main().catch(console.error);
