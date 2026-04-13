'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'grove';
const APP_NAME = 'GROVE';
const TAGLINE = 'grow with intention';

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

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
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Palette colors to showcase (6 main ones)
const palette = pen.meta.palette;
const paletteShowcase = [
  { name: 'Background', hex: palette.bg },
  { name: 'Surface',    hex: palette.surface },
  { name: 'Card',       hex: palette.card },
  { name: 'Accent',     hex: palette.accent },
  { name: 'Accent 2',   hex: palette.accent2 },
  { name: 'Text',       hex: palette.text },
];

// Screen -> accent color mapping for SVG placeholders
const screenColors = [
  palette.accent,
  palette.accent2,
  palette.card,
  palette.accentLight,
  palette.accent2Light,
  palette.bg,
];

function makeSvgDataUri(screenName, bgColor) {
  const textColor = (bgColor === palette.accent) ? '#FFFFFF' : palette.text;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
  <rect width="390" height="844" fill="${bgColor}"/>
  <rect x="0" y="0" width="390" height="44" fill="${bgColor}" opacity="0.95"/>
  <text x="20" y="28" font-family="Inter,sans-serif" font-size="13" fill="${textColor}" font-weight="600">9:41</text>
  <text x="370" y="28" font-family="Inter,sans-serif" font-size="11" fill="${textColor}" text-anchor="end" opacity="0.6">LTE 100%</text>
  <rect x="20" y="60" width="180" height="3" fill="${palette.accent}" rx="2" opacity="0.3"/>
  <text x="20" y="140" font-family="Inter,sans-serif" font-size="32" fill="${textColor}" font-weight="700" letter-spacing="-1">${screenName}</text>
  <rect x="20" y="160" width="80" height="2" fill="${palette.accent}" rx="1"/>
  <rect x="20" y="200" width="350" height="80" fill="${palette.surface}" rx="12" opacity="0.8"/>
  <rect x="20" y="300" width="165" height="120" fill="${palette.surface}" rx="12" opacity="0.7"/>
  <rect x="205" y="300" width="165" height="120" fill="${palette.surface}" rx="12" opacity="0.7"/>
  <rect x="20" y="440" width="350" height="60" fill="${palette.accent}" rx="10" opacity="0.15"/>
  <rect x="20" y="520" width="350" height="60" fill="${palette.surface}" rx="10" opacity="0.7"/>
  <rect x="20" y="600" width="350" height="60" fill="${palette.surface}" rx="10" opacity="0.7"/>
  <rect x="0" y="780" width="390" height="64" fill="${bgColor}"/>
  <circle cx="60" cy="812" r="18" fill="${palette.accent}" opacity="0.2"/>
  <circle cx="130" cy="812" r="18" fill="${palette.accent}" opacity="0.1"/>
  <circle cx="195" cy="812" r="22" fill="${palette.accent}" opacity="0.9"/>
  <circle cx="260" cy="812" r="18" fill="${palette.accent}" opacity="0.1"/>
  <circle cx="330" cy="812" r="18" fill="${palette.accent}" opacity="0.1"/>
  <text x="195" y="422" font-family="Inter,sans-serif" font-size="14" fill="${textColor}" text-anchor="middle" opacity="0.4">GROVE \u00b7 ${screenName.toUpperCase()}</text>
</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const screens = pen.screens;

const screenCards = screens.map((s, i) => {
  const uri = makeSvgDataUri(s.name, screenColors[i] || palette.card);
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
      <div style="width:130px;height:282px;border-radius:14px;overflow:hidden;border:1px solid rgba(250,248,244,0.1);box-shadow:0 8px 32px rgba(0,0,0,0.4);">
        <img src="${uri}" alt="${s.name}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <span style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8B8780;">${s.name}</span>
    </div>`;
}).join('');

const paletteSwatches = paletteShowcase.map(p => `
  <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
    <div style="width:56px;height:56px;border-radius:12px;background:${p.hex};border:1px solid rgba(250,248,244,0.15);box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
    <div style="text-align:center;">
      <div style="font-size:11px;color:#FAF8F4;font-weight:500;">${p.name}</div>
      <div style="font-size:10px;color:#8B8780;font-family:monospace;">${p.hex}</div>
    </div>
  </div>`).join('');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GROVE \u2014 grow with intention \u00b7 RAM Design Heartbeat #100</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0D0C0A;
    color: #FAF8F4;
    font-family: Inter, sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: #4A7C59; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }

  header {
    padding: 48px 0 40px;
    border-bottom: 1px solid rgba(250,248,244,0.08);
  }
  .logo {
    font-family: 'Instrument Serif', serif;
    font-size: 48px;
    letter-spacing: -0.02em;
    color: #FAF8F4;
    line-height: 1;
  }
  .tagline {
    font-size: 14px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8B8780;
    margin-top: 8px;
  }
  .hb-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #4A7C59;
    color: #FAF8F4;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 20px;
    margin-top: 16px;
  }

  .hero {
    padding: 72px 0 64px;
    border-bottom: 1px solid rgba(250,248,244,0.08);
  }
  .milestone {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #D4856A;
    margin-bottom: 20px;
  }
  .hero-headline {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(48px, 8vw, 80px);
    letter-spacing: -0.03em;
    line-height: 1;
    color: #FAF8F4;
    margin-bottom: 28px;
  }
  .hero-headline em {
    color: #4A7C59;
    font-style: italic;
  }
  .hero-desc {
    font-size: 18px;
    color: #C4BFB7;
    max-width: 600px;
    line-height: 1.7;
    margin-bottom: 32px;
  }
  .cta-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-block;
    background: #4A7C59;
    color: #FAF8F4;
    padding: 12px 28px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-decoration: none;
  }
  .btn-primary:hover { background: #3d6a4a; text-decoration: none; }
  .btn-secondary {
    display: inline-block;
    background: transparent;
    color: #FAF8F4;
    border: 1px solid rgba(250,248,244,0.2);
    padding: 12px 28px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
  }
  .btn-secondary:hover { border-color: rgba(250,248,244,0.4); text-decoration: none; }

  .section {
    padding: 64px 0;
    border-bottom: 1px solid rgba(250,248,244,0.08);
  }
  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #8B8780;
    margin-bottom: 12px;
  }
  .section-title {
    font-family: 'Instrument Serif', serif;
    font-size: 32px;
    color: #FAF8F4;
    margin-bottom: 40px;
  }
  .screens-grid {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .palette-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .features-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .feature-item {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  .feature-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4A7C59;
    margin-top: 7px;
    flex-shrink: 0;
  }
  .feature-text strong {
    display: block;
    color: #FAF8F4;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .feature-text span {
    color: #8B8780;
    font-size: 14px;
  }
  footer {
    padding: 40px 0;
    color: #8B8780;
    font-size: 13px;
  }
  footer a { color: #8B8780; }
  footer a:hover { color: #FAF8F4; text-decoration: none; }
</style>
</head>
<body>

<header>
  <div class="container">
    <div class="logo">GROVE</div>
    <div class="tagline">grow with intention</div>
    <div class="hb-badge">Heartbeat #100 \u00b7 April 2026</div>
  </div>
</header>

<section class="hero">
  <div class="container">
    <div class="milestone">Milestone \u00b7 Design #100</div>
    <h1 class="hero-headline">Heartbeat<br><em>#100</em></h1>
    <p class="hero-desc">
      GROVE is a wellness-productivity app built on warm off-white warmth and intentional growth.
      The 100th design in the RAM Design Heartbeat series \u2014 a light-mode editorial system
      combining Instrument Serif typographic rhythm with a dual-accent green and terracotta palette,
      inspired by Lapa Ninja\u2019s rising serif trend and Landbook\u2019s warm background patterns.
    </p>
    <div class="cta-row">
      <a href="https://ram.zenbin.org/grove-viewer" class="btn-primary">Open Interactive Viewer</a>
      <a href="https://ram.zenbin.org/grove-mock" class="btn-secondary">View Mock</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-label">Screens</div>
    <div class="section-title">6 screens, 519 elements</div>
    <div class="screens-grid">
      ${screenCards}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-label">Color System</div>
    <div class="section-title">Warm light palette</div>
    <div class="palette-row">
      ${paletteSwatches}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-label">Design Decisions</div>
    <div class="section-title">What makes GROVE distinct</div>
    <div class="features-list">
      <div class="feature-item">
        <div class="feature-dot"></div>
        <div class="feature-text">
          <strong>Single-accent strategy adapted for light mode</strong>
          <span>Inspired by DarkModeDesign\u2019s focus principle \u2014 forest green (#4A7C59) as the sole interactive accent, with terracotta (#D4856A) reserved purely for emotional warmth moments like streaks and milestones.</span>
        </div>
      </div>
      <div class="feature-item">
        <div class="feature-dot"></div>
        <div class="feature-text">
          <strong>Instrument Serif editorial rhythm</strong>
          <span>Lapa Ninja\u2019s trending Instrument Serif (appearing in 14 recent featured sites) drives all display headings, creating a human, editorial feel against Inter\u2019s precision for UI chrome and data.</span>
        </div>
      </div>
      <div class="feature-item">
        <div class="feature-dot"></div>
        <div class="feature-text">
          <strong>Warm off-white background system</strong>
          <span>Background (#FAF8F4), surface (#FFFFFF), and card (#F2EFE9) form a three-level depth hierarchy \u2014 a pattern observed across 23 Landbook-featured products that reduces cognitive load while maintaining visual richness.</span>
        </div>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <span>RAM Design Heartbeat \u00b7 April 2026</span>
      <div style="display:flex;gap:20px;">
        <a href="https://ram.zenbin.org/grove-viewer">Viewer</a>
        <a href="https://ram.zenbin.org/grove-mock">Mock</a>
      </div>
    </div>
  </div>
</footer>

</body>
</html>`;

// Build viewer HTML by injecting the pen
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing GROVE hero page...');
  const heroResult = await publish(SLUG, heroHtml, `${APP_NAME} \u2014 ${TAGLINE} \u00b7 Heartbeat #100`);
  console.log(`Hero (ram.zenbin.org/grove): HTTP ${heroResult.status}`);

  console.log('Publishing GROVE viewer...');
  const viewerResult = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} Viewer \u2014 RAM Design Studio`);
  console.log(`Viewer (ram.zenbin.org/grove-viewer): HTTP ${viewerResult.status}`);
}

main().catch(err => { console.error(err); process.exit(1); });
