'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'splice';
const APP_NAME = 'SPLICE';
const TAGLINE = 'Motion Design Review';

const INK    = '#0B0C0F';
const SURF   = '#12141A';
const CARD   = '#1A1D26';
const CARD2  = '#22263A';
const TEXT   = '#F0F0F2';
const MUTED  = '#8892AA';
const BORDER = '#252A38';
const CYAN   = '#00B2FF';
const YELLOW = '#F0FF50';
const VIOLET = '#7A40ED';
const CORAL  = '#FD3456';
const AQUA   = '#5FF3E0';

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
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);
const screens = pen.screens;

function svgDataUri(screen) {
  const W = 390, H = 844;
  const els = screen.elements || [];
  let svgEls = '';
  els.forEach(el => {
    if (el.type === 'rect') {
      svgEls += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"${el.rx ? ` rx="${el.rx}"` : ''}${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''} />`;
    } else if (el.type === 'text') {
      const txt = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svgEls += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}"${el.fontWeight ? ` font-weight="${el.fontWeight}"` : ''}${el.textAnchor ? ` text-anchor="${el.textAnchor}"` : ''}${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}${el.letterSpacing !== undefined ? ` letter-spacing="${el.letterSpacing}"` : ''}>${txt}</text>`;
    } else if (el.type === 'circle') {
      svgEls += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''} />`;
    } else if (el.type === 'line') {
      svgEls += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''} />`;
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${svgEls}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SPLICE — Motion Design Review | RAM Design Studio</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: ${INK}; --surf: ${SURF}; --card: ${CARD}; --card2: ${CARD2};
    --text: ${TEXT}; --muted: ${MUTED}; --border: ${BORDER};
    --cyan: ${CYAN}; --yellow: ${YELLOW}; --violet: ${VIOLET};
    --coral: ${CORAL}; --aqua: ${AQUA};
  }
  body { font-family: 'Inter', -apple-system, sans-serif; background: var(--ink); color: var(--text); min-height: 100vh; }

  nav { position: sticky; top: 0; z-index: 100; background: rgba(11,12,15,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 60px; }
  .nav-logo { font-size: 16px; font-weight: 700; letter-spacing: 3px; color: var(--text); text-decoration: none; }
  .nav-logo span { color: var(--cyan); }
  .nav-links { display: flex; gap: 28px; align-items: center; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--cyan); }
  .nav-cta { background: var(--cyan); color: var(--ink); padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; text-decoration: none; }

  /* Hero */
  .hero { padding: 80px 40px 60px; max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .hero-eyebrow { display: flex; gap: 8px; margin-bottom: 24px; }
  .eyebrow-pill { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
  .pill-cyan { background: rgba(0,178,255,0.12); color: var(--cyan); }
  .pill-coral { background: rgba(253,52,86,0.12); color: var(--coral); }
  .pill-yellow { background: rgba(240,255,80,0.12); color: var(--yellow); }
  .hero-h1 { font-size: clamp(40px, 5vw, 68px); font-weight: 800; line-height: 1.0; letter-spacing: -1px; margin-bottom: 16px; }
  .hero-h1 .c { color: var(--cyan); }
  .hero-h1 .y { color: var(--yellow); }
  .hero-h1 .v { color: var(--violet); }
  .hero-h1 .r { color: var(--coral); }
  .hero-sub { font-size: 16px; color: var(--muted); line-height: 1.65; margin-bottom: 32px; }
  .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary { background: var(--cyan); color: var(--ink); padding: 13px 28px; border-radius: 24px; font-size: 14px; font-weight: 700; text-decoration: none; }
  .btn-ghost { border: 1px solid var(--border); color: var(--text); padding: 12px 24px; border-radius: 24px; font-size: 14px; text-decoration: none; transition: border-color .2s; }
  .btn-ghost:hover { border-color: var(--cyan); }
  .hero-note { font-size: 11px; color: var(--muted); margin-top: 16px; }

  /* Phone frame */
  .hero-right { display: flex; justify-content: center; position: relative; }
  .phone-frame { width: 224px; height: 484px; background: var(--surf); border-radius: 38px; border: 1.5px solid var(--border); box-shadow: 0 40px 100px rgba(0,178,255,0.1), 0 12px 40px rgba(0,0,0,0.5); overflow: hidden; position: relative; }
  .phone-frame img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 24px; background: var(--ink); border-radius: 0 0 16px 16px; z-index: 2; }
  .pill-label { position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%); background: var(--cyan); color: var(--ink); padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }

  /* Multi-color glow dots */
  .glow-dot { position: absolute; border-radius: 50%; filter: blur(40px); pointer-events: none; }

  /* Stats */
  .stats { max-width: 1100px; margin: 0 auto; padding: 0 40px 60px; display: flex; gap: 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .stat { flex: 1; padding: 32px 0; text-align: center; border-right: 1px solid var(--border); }
  .stat:last-child { border-right: none; }
  .stat-val { font-size: 36px; font-weight: 800; }
  .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 6px; }

  /* Screens */
  .screens-section { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .section-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--cyan); text-transform: uppercase; margin-bottom: 8px; }
  .section-title { font-size: 32px; font-weight: 700; margin-bottom: 40px; }
  .screen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .screen-card { background: var(--surf); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: transform .2s, box-shadow .2s; }
  .screen-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,178,255,0.1); }
  .screen-img { width: 100%; aspect-ratio: 390/480; overflow: hidden; background: var(--card); }
  .screen-img img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .screen-meta { padding: 14px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .screen-name { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--text); }
  .screen-num { font-size: 10px; color: var(--muted); }

  /* Palette */
  .palette-section { background: var(--surf); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 60px 40px; }
  .palette-inner { max-width: 1100px; margin: 0 auto; }
  .swatches { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 32px; }
  .swatch { display: flex; align-items: center; gap: 12px; }
  .swatch-dot { width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.08); }
  .swatch-hex { font-size: 12px; font-weight: 600; font-family: monospace; }
  .swatch-name { font-size: 11px; color: var(--muted); }

  /* Features */
  .features-section { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
  .feature-card { padding: 28px; background: var(--surf); border: 1px solid var(--border); border-radius: 12px; }
  .feature-accent { width: 32px; height: 3px; border-radius: 2px; margin-bottom: 16px; }
  .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* Inspiration */
  .inspo-section { padding: 60px 40px; max-width: 1100px; margin: 0 auto; border-top: 1px solid var(--border); }
  .inspo-grid { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
  .inspo-item { padding: 16px 20px; background: var(--surf); border-radius: 8px; border-left: 3px solid var(--cyan); font-size: 13px; color: var(--muted); }
  .inspo-item strong { color: var(--text); }

  /* CTA */
  .cta-section { padding: 80px 40px; text-align: center; border-top: 1px solid var(--border); }
  .cta-section h2 { font-size: 40px; font-weight: 800; margin-bottom: 12px; }
  .cta-section p { color: var(--muted); font-size: 15px; margin-bottom: 32px; }
  .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  footer { background: var(--surf); border-top: 1px solid var(--border); padding: 28px 40px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--muted); }
  footer a { color: var(--cyan); text-decoration: none; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; }
    .hero-right { display: none; }
    .screen-grid { grid-template-columns: repeat(2, 1fr); }
    .feature-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="/"><span>SPLICE</span></a>
  <div class="nav-links">
    <a href="/gallery">Gallery</a>
    <a href="/splice-viewer">Pen Viewer</a>
    <a href="/splice-mock">Interactive Mock</a>
    <a class="nav-cta" href="/splice-mock">Try Mock →</a>
  </div>
</nav>

<section class="hero">
  <div>
    <div class="hero-eyebrow">
      <span class="eyebrow-pill pill-coral">Heartbeat #44</span>
      <span class="eyebrow-pill pill-cyan">Dark Theme</span>
      <span class="eyebrow-pill pill-yellow">Motion Tools</span>
    </div>
    <h1 class="hero-h1">
      <span class="c">Review.</span><br>
      <span class="y">Annotate.</span><br>
      <span class="v">Ship</span> <span class="r">motion.</span>
    </h1>
    <p class="hero-sub">Real-time motion design review platform. Frame-accurate annotations, threaded feedback, and a timeline editor — everything your team needs to go from draft to delivery.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="/splice-mock">Try Interactive Mock →</a>
      <a class="btn-ghost" href="/splice-viewer">Pen Viewer</a>
    </div>
    <p class="hero-note">6 screens · 608 elements · Multi-hue dark system</p>
  </div>
  <div class="hero-right">
    <div style="position:relative">
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <img src="${svgDataUri(screens[0])}" alt="SPLICE Projects" />
      </div>
      <div class="pill-label">DARK THEME</div>
    </div>
  </div>
</section>

<div class="stats">
  ${[
    ['6', 'Screens', CYAN],
    ['608', 'Elements', YELLOW],
    ['#44', 'Heartbeat', VIOLET],
    ['4', 'Accent Hues', CORAL],
  ].map(([v, l, c]) => `<div class="stat"><div class="stat-val" style="color:${c}">${v}</div><div class="stat-label">${l}</div></div>`).join('')}
</div>

<section class="screens-section">
  <div class="section-eyebrow">All Screens</div>
  <h2 class="section-title">Six screens, one review workflow</h2>
  <div class="screen-grid">
    ${screens.map((s, i) => `
    <div class="screen-card">
      <div class="screen-img"><img src="${svgDataUri(s)}" alt="${s.name}" /></div>
      <div class="screen-meta">
        <span class="screen-name">${s.name.toUpperCase()}</span>
        <span class="screen-num">0${i + 1} / 06</span>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="palette-section">
  <div class="palette-inner">
    <div class="section-eyebrow">Colour System</div>
    <h2 class="section-title" style="margin-bottom:4px">Multi-hue dark · Jitter-inspired</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:0">Four distinct accent hues on near-black — each hue maps to a different role (cyan=actions, yellow=timecodes, violet=layers, coral=alerts)</p>
    <div class="swatches">
      ${[
        [INK, 'Ink Black', 'Background'],
        [SURF, 'Dark Surface', 'Cards'],
        [TEXT, 'Near White', 'Primary text'],
        [CYAN, 'Electric Cyan', 'Actions + active'],
        [YELLOW, 'Acid Yellow', 'Timecodes + time'],
        [VIOLET, 'Deep Violet', 'Layers + FX'],
        [CORAL, 'Coral Red', 'Alerts + urgent'],
        [AQUA, 'Aqua', 'Resolved + success'],
        [MUTED, 'Blue-Grey', 'Muted text'],
      ].map(([hex, name, role]) => `
      <div class="swatch">
        <div class="swatch-dot" style="background:${hex}"></div>
        <div><div class="swatch-hex" style="color:${hex}">${hex}</div><div class="swatch-name">${name} · ${role}</div></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="features-section">
  <div class="section-eyebrow">Design Highlights</div>
  <h2 class="section-title">What makes SPLICE distinct</h2>
  <div class="feature-grid">
    ${[
      [CYAN, 'Floating Pill Nav', 'A glassmorphism pill floats above the content — inspired by Mobbin\'s own floating nav pattern. Not a fixed bottom tab bar but a centered pill with backdrop blur, giving the content full-bleed space.'],
      [YELLOW, 'Multi-Hue Accent System', 'Four distinct accent colors each carry a semantic role: cyan for actions, yellow for timecodes, violet for layers, coral for alerts. Directly inspired by Jitter\'s (Mobbin Site of the Year) four-color brand palette.'],
      [VIOLET, 'Layer Timeline Bars', 'Each timeline layer shows a coloured bar matching the layer\'s hue with keyframe diamonds at easing points and a yellow playhead line crossing all layers simultaneously — maps to how actual motion editors work.'],
      [CORAL, 'Frame-Accurate Annotations', 'Review screen annotation pins are tied to exact frame numbers (not timecodes) — coloured pins overlay the preview frame at the precise position of the issue. Each comment shows frame reference and timecode.'],
      [AQUA, 'Status Through Color', 'Design system uses hue shifts for status: open = coral, resolved = aqua, in-progress = cyan. Users can scan the feedback list and immediately decode status without reading badges — color as primary information.'],
      [CYAN, 'Semantic Asset Library', 'Assets screen organises brand resources by type (Colors, Fonts, Motions, Sounds) with visual swatches, Bézier curve thumbnails for easing presets, and inline copy buttons — a living brand system not just a file dump.'],
    ].map(([c, t, d]) => `
    <div class="feature-card">
      <div class="feature-accent" style="background:${c}"></div>
      <div class="feature-title">${t}</div>
      <div class="feature-desc">${d}</div>
    </div>`).join('')}
  </div>
</section>

<section class="inspo-section">
  <div class="section-eyebrow">Research Sources</div>
  <div class="inspo-grid">
    ${pen.metadata.inspiration.map(s => {
      const [title, desc] = s.split(' — ');
      return `<div class="inspo-item"><strong>${title}</strong> — ${desc || ''}</div>`;
    }).join('')}
  </div>
</section>

<section class="cta-section">
  <h2><span style="color:var(--cyan)">See it</span> in motion</h2>
  <p>Fully interactive Svelte mock with light/dark toggle. Every screen, every interaction.</p>
  <div class="cta-actions">
    <a class="btn-primary" href="/splice-mock">Open Interactive Mock →</a>
    <a class="btn-ghost" href="/splice-viewer">Pen Viewer</a>
    <a class="btn-ghost" href="/gallery">Browse Gallery</a>
  </div>
</section>

<footer>
  <span>RAM Design Studio · Heartbeat #44 · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
  <a href="/gallery">← Back to Gallery</a>
</footer>

</body>
</html>`;

let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`);
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Pen Viewer`);
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
