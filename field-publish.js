'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'field';

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
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);
const screens = pen.screens;
const meta = pen.metadata;

// Build SVG data URIs for carousel
function screenToDataUri(screen) {
  const svg = screen.svg;
  const encoded = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

const carouselItems = screens.map((s, i) => {
  const uri = screenToDataUri(s);
  return `
    <div class="carousel-item ${i===0?'active':''}" data-idx="${i}">
      <img src="${uri}" alt="${s.name}" loading="lazy"/>
      <div class="screen-label">${s.name}</div>
    </div>`;
}).join('');

// Palette swatches
const palette = meta.palette;
const swatches = Object.entries({
  'Warm Cream': '#FAF7F2',
  'Deep Brown': '#4A3728',
  'Sage Green': '#7B9B6B',
  'Warm Amber': '#C8821A',
  'Slate Blue': '#6B8FA8',
  'Near Black': '#1A1209',
}).map(([name, hex]) =>
  `<div class="swatch"><div class="swatch-color" style="background:${hex}"></div><div class="swatch-name">${name}</div><div class="swatch-hex">${hex}</div></div>`
).join('');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FIELD — Document everything. Forget nothing.</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#FAF7F2;--surface:#FFFFFF;--card:#F5F0E8;
    --accent:#4A3728;--accent2:#7B9B6B;--amber:#C8821A;
    --text:#1A1209;--textMid:#6B4F3A;--muted:rgba(74,55,40,0.45);
    --border:rgba(74,55,40,0.12);--borderMd:rgba(74,55,40,0.20);
    --sky:#6B8FA8;--green:#5A8A4E;
    --r:14px;--rLg:20px;
  }
  body{font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);line-height:1.5}
  a{color:var(--accent);text-decoration:none}
  a:hover{text-decoration:underline}

  /* — HERO — */
  .hero{max-width:1200px;margin:0 auto;padding:80px 48px 60px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
  .hero-text .eyebrow{font-size:11px;font-weight:700;letter-spacing:0.15em;color:var(--muted);text-transform:uppercase;margin-bottom:20px}
  .hero-text h1{font-family:Georgia,serif;font-size:62px;font-weight:300;line-height:1.1;letter-spacing:-0.025em;color:var(--text);margin-bottom:20px}
  .hero-text h1 em{font-style:normal;color:var(--accent2)}
  .hero-text .sub{font-size:17px;color:var(--textMid);line-height:1.65;margin-bottom:36px;max-width:400px}
  .cta-row{display:flex;gap:12px;align-items:center}
  .cta-primary{background:var(--accent);color:#FAF7F2;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;transition:opacity .2s}
  .cta-primary:hover{opacity:0.88;text-decoration:none}
  .cta-secondary{color:var(--textMid);font-size:14px;border-bottom:1px solid var(--borderMd)}
  .cta-secondary:hover{text-decoration:none;color:var(--accent)}
  .meta-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:28px}
  .meta-badge{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:5px 14px;font-size:11px;color:var(--textMid);font-weight:600}

  /* — PHONE STACK — */
  .hero-visual{display:flex;gap:16px;justify-content:center;align-items:flex-end}
  .phone-frame{width:180px;background:var(--surface);border-radius:28px;border:1.5px solid var(--border);overflow:hidden;box-shadow:0 8px 32px rgba(74,55,40,0.12);transition:transform .3s}
  .phone-frame:hover{transform:translateY(-6px)}
  .phone-frame img{width:100%;display:block}
  .phone-frame.featured{width:200px;border-color:var(--accent);box-shadow:0 16px 48px rgba(74,55,40,0.18)}

  /* — CAROUSEL — */
  .carousel-section{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:72px 48px;text-align:center}
  .carousel-section h2{font-family:Georgia,serif;font-size:36px;font-weight:300;color:var(--text);margin-bottom:10px;letter-spacing:-0.02em}
  .carousel-section .sub{color:var(--muted);font-size:14px;margin-bottom:44px}
  .carousel{position:relative;overflow:hidden}
  .carousel-track{display:flex;gap:20px;justify-content:center;flex-wrap:wrap}
  .carousel-item{flex:0 0 auto;text-align:center}
  .carousel-item img{height:400px;width:auto;border-radius:20px;border:1px solid var(--border);box-shadow:0 4px 20px rgba(74,55,40,0.09);transition:transform .3s}
  .carousel-item img:hover{transform:scale(1.02)}
  .screen-label{font-size:11px;color:var(--muted);margin-top:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase}

  /* — FEATURES — */
  .features{max-width:1100px;margin:0 auto;padding:80px 48px}
  .features h2{font-family:Georgia,serif;font-size:36px;font-weight:300;color:var(--text);margin-bottom:48px;letter-spacing:-0.02em}
  .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .feature-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--rLg);padding:28px;transition:box-shadow .2s}
  .feature-card:hover{box-shadow:0 4px 24px rgba(74,55,40,0.1)}
  .feature-icon{width:40px;height:40px;border-radius:12px;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px}
  .feature-card h3{font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px}
  .feature-card p{font-size:13px;color:var(--textMid);line-height:1.6}
  .accent-bar{display:block;width:32px;height:3px;border-radius:2px;margin-bottom:14px}

  /* — PALETTE — */
  .palette-section{background:var(--card);border-top:1px solid var(--border);padding:72px 48px}
  .palette-section h2{font-family:Georgia,serif;font-size:36px;font-weight:300;color:var(--text);max-width:1100px;margin:0 auto 36px;letter-spacing:-0.02em}
  .swatches{display:flex;gap:16px;max-width:1100px;margin:0 auto;flex-wrap:wrap}
  .swatch{flex:1;min-width:120px}
  .swatch-color{height:72px;border-radius:12px;border:1px solid var(--border);margin-bottom:10px}
  .swatch-name{font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px}
  .swatch-hex{font-size:11px;color:var(--muted);font-family:monospace}

  /* — QUOTE — */
  .quote-section{max-width:760px;margin:0 auto;padding:80px 48px;text-align:center}
  .quote-section blockquote{font-family:Georgia,serif;font-size:26px;font-weight:300;line-height:1.55;color:var(--text);letter-spacing:-0.01em;margin-bottom:24px}
  .quote-section cite{font-size:13px;color:var(--muted)}

  /* — LINKS — */
  .links-section{background:var(--surface);border-top:1px solid var(--border);padding:48px}
  .links-inner{max-width:1100px;margin:0 auto;display:flex;gap:16px;flex-wrap:wrap;align-items:center}
  .links-inner .label{font-size:13px;color:var(--muted);flex:1}
  .link-chip{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:10px 20px;font-size:13px;font-weight:600;color:var(--accent);transition:background .2s}
  .link-chip:hover{background:var(--accent);color:#FAF7F2;border-color:var(--accent);text-decoration:none}

  /* — FOOTER — */
  footer{border-top:1px solid var(--border);padding:28px 48px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--muted)}

  @media(max-width:768px){
    .hero{grid-template-columns:1fr;padding:48px 24px;gap:40px}
    .hero-text h1{font-size:44px}
    .hero-visual{display:none}
    .features-grid{grid-template-columns:1fr}
    .carousel-item img{height:300px}
    .features,.palette-section,.quote-section{padding:48px 24px}
  }
</style>
</head>
<body>

<!-- Nav -->
<nav style="border-bottom:1px solid var(--border);padding:16px 48px;display:flex;justify-content:space-between;align-items:center;background:var(--surface)">
  <span style="font-size:13px;font-weight:700;letter-spacing:0.12em;color:var(--accent)">FIELD</span>
  <div style="display:flex;gap:20px;font-size:13px;color:var(--textMid)">
    <a href="https://ram.zenbin.org/field-viewer" style="color:var(--textMid)">Viewer</a>
    <a href="https://ram.zenbin.org/field-mock" style="color:var(--textMid)">Mock</a>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-text">
    <div class="eyebrow">RAM Design Heartbeat · Light Theme</div>
    <h1>Document<br><em>everything</em>.<br>Forget nothing.</h1>
    <p class="sub">A field research journal for naturalists, ecologists, and anyone who observes the world closely. Log entries, photos, and locations wherever you are.</p>
    <div class="cta-row">
      <a class="cta-primary" href="https://ram.zenbin.org/field-viewer">View Design</a>
      <a class="cta-secondary" href="https://ram.zenbin.org/field-mock">Interactive Mock →</a>
    </div>
    <div class="meta-badges">
      <span class="meta-badge">6 Screens</span>
      <span class="meta-badge">${meta.elements} Elements</span>
      <span class="meta-badge">Light Theme</span>
      <span class="meta-badge">Fieldwork Journal</span>
      <span class="meta-badge">Biophilic Palette</span>
    </div>
  </div>
  <div class="hero-visual">
    ${screens.slice(0,3).map((s,i) => `
      <div class="phone-frame ${i===0?'featured':''}">
        <img src="${screenToDataUri(s)}" alt="${s.name}">
      </div>`).join('')}
  </div>
</section>

<!-- All screens carousel -->
<section class="carousel-section">
  <h2>All Six Screens</h2>
  <p class="sub">Today · Compose · Gallery · Detail · Map · Profile</p>
  <div class="carousel">
    <div class="carousel-track">
      ${carouselItems}
    </div>
  </div>
</section>

<!-- Features -->
<section class="features">
  <h2>Design Decisions</h2>
  <div class="features-grid">
    <div class="feature-card">
      <span class="accent-bar" style="background:var(--accent)"></span>
      <div class="feature-icon">✍</div>
      <h3>Big Serif Headlines</h3>
      <p>Inspired by Minimal Gallery's "barely-there UI" trend — typography does the visual heavy lifting. Georgia serif at 300 weight with tight tracking creates editorial warmth without decoration.</p>
    </div>
    <div class="feature-card">
      <span class="accent-bar" style="background:var(--accent2)"></span>
      <div class="feature-icon">🌿</div>
      <h3>Biophilic Palette</h3>
      <p>Warm cream backgrounds (#FAF7F2), sage greens, earthy browns and amber — a direct response to Land-book's "biophilic/organic countertrend". No bright SaaS blues here.</p>
    </div>
    <div class="feature-card">
      <span class="accent-bar" style="background:var(--amber)"></span>
      <div class="feature-icon">📋</div>
      <h3>Visible Structure</h3>
      <p>Subtle 1px border lines as dividers, left accent bars on entry cards, monochrome rule-based layout. Echoes Land-book's "Visible Borders" pattern category without going full brutalist.</p>
    </div>
    <div class="feature-card">
      <span class="accent-bar" style="background:var(--sky)"></span>
      <div class="feature-icon">⊞</div>
      <h3>Content-First Gallery</h3>
      <p>3-column photo grid with date headers rather than infinite scroll. Deliberate whitespace between groups echoes Minimal Gallery's radical restraint — each observation gets room to breathe.</p>
    </div>
    <div class="feature-card">
      <span class="accent-bar" style="background:var(--green)"></span>
      <div class="feature-icon">◎</div>
      <h3>Annotated Map</h3>
      <p>Hand-placed markers with halo glow instead of pin icons, compass rose, and scale bar. Location detail drawn from field research context rather than generic maps UX.</p>
    </div>
    <div class="feature-card">
      <span class="accent-bar" style="background:var(--accent)"></span>
      <div class="feature-icon">📊</div>
      <h3>Activity as Texture</h3>
      <p>30-day bar chart and contribution grid on the profile screen transform habit data into visual texture — inspired by GitHub's contribution graph but warmer, more personal.</p>
    </div>
  </div>
</section>

<!-- Palette -->
<section class="palette-section">
  <h2>Palette — Warm Biophilic Light</h2>
  <div class="swatches">${swatches}</div>
</section>

<!-- Quote -->
<section class="quote-section">
  <blockquote>"The clearest way into the Universe is through a forest wilderness."</blockquote>
  <cite>— John Muir · Inspiration for this design run</cite>
</section>

<!-- Links -->
<section class="links-section">
  <div class="links-inner">
    <span class="label">Explore this design</span>
    <a class="link-chip" href="https://ram.zenbin.org/field-viewer">Pen Viewer</a>
    <a class="link-chip" href="https://ram.zenbin.org/field-mock">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span>FIELD — RAM Design Heartbeat · April 2026</span>
  <span>ram.zenbin.org/field</span>
</footer>

</body>
</html>`;

// Viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'FIELD — Document everything. Forget nothing.');
  console.log(`Hero: ${r1.status} → https://ram.zenbin.org/${SLUG}`);
  
  console.log('Publishing viewer...');
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'FIELD — Viewer');
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
