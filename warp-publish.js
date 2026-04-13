'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'warp';

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

// Extract palette for display
const palette = pen.metadata.palette;

// Build SVG previews from screen elements
function renderElementToSVG(el) {
  if (el.type === 'rect') {
    const attrs = [
      `x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}"`,
      `fill="${el.fill}"`,
      el.rx ? `rx="${el.rx}"` : '',
      el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
      el.stroke ? `stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : '',
    ].filter(Boolean).join(' ');
    return `<rect ${attrs}/>`;
  }
  if (el.type === 'text') {
    const attrs = [
      `x="${el.x}" y="${el.y}"`,
      `fill="${el.fill}"`,
      `font-size="${el.size}"`,
      el.fw ? `font-weight="${el.fw}"` : '',
      el.anchor ? `text-anchor="${el.anchor}"` : '',
      el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
      el.ls ? `letter-spacing="${el.ls}"` : '',
      `font-family="Inter, system-ui, sans-serif"`,
    ].filter(Boolean).join(' ');
    const safe = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<text ${attrs}>${safe}</text>`;
  }
  if (el.type === 'circle') {
    const attrs = [
      `cx="${el.cx}" cy="${el.cy}" r="${el.r}"`,
      `fill="${el.fill}"`,
      el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
      el.stroke ? `stroke="${el.stroke}" stroke-width="${el.sw || 1}"` : '',
    ].filter(Boolean).join(' ');
    return `<circle ${attrs}/>`;
  }
  if (el.type === 'line') {
    const attrs = [
      `x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"`,
      `stroke="${el.stroke}" stroke-width="${el.sw || 1}"`,
      el.opacity !== undefined ? `opacity="${el.opacity}"` : '',
    ].filter(Boolean).join(' ');
    return `<line ${attrs}/>`;
  }
  return '';
}

function screenToSVG(screen, scale = 0.4) {
  const W = 390, H = 844;
  const svgEls = screen.elements.map(renderElementToSVG).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${Math.round(W*scale)}" height="${Math.round(H*scale)}" style="border-radius:20px;overflow:hidden;display:block;">
  ${svgEls}
</svg>`;
}

const screens = pen.screens;
const screenSVGs = screens.map(s => screenToSVG(s, 0.42));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WARP — Release Velocity Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0B0C10;
    --surf: #13151C;
    --card: #1A1D27;
    --border: #252838;
    --accent: #6366F1;
    --accent2: #F59E0B;
    --accent3: #10B981;
    --text: #E2E8F0;
    --muted: #64748B;
    --dim: #334155;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }

  /* Hero */
  .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; padding: 60px 24px; overflow: hidden; }
  .hero-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -55%); pointer-events: none; }
  .hero-glow2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%); bottom: 10%; right: 10%; pointer-events: none; }
  .hero-content { max-width: 1100px; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
  @media(max-width:768px){ .hero-content { grid-template-columns: 1fr; } }

  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px solid rgba(99,102,241,0.35); border-radius: 100px; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; background: rgba(99,102,241,0.06); }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent3); box-shadow: 0 0 8px var(--accent3); }

  h1 { font-size: clamp(42px, 7vw, 76px); font-weight: 900; line-height: 1.0; letter-spacing: -2.5px; margin-bottom: 16px; }
  h1 span { background: linear-gradient(135deg, var(--accent) 0%, #818CF8 50%, var(--accent2) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-sub { font-size: 17px; color: var(--muted); line-height: 1.65; margin-bottom: 32px; max-width: 420px; }

  .cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--accent); color: #fff; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; box-shadow: 0 0 30px rgba(99,102,241,0.3); }
  .btn-primary:hover { background: #818CF8; box-shadow: 0 0 40px rgba(99,102,241,0.4); transform: translateY(-1px); }
  .btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border: 1px solid var(--border); color: var(--muted); border-radius: 100px; font-size: 14px; font-weight: 500; text-decoration: none; transition: all 0.2s; }
  .btn-secondary:hover { border-color: var(--accent); color: var(--text); }

  /* Phone mockup */
  .phone-wrap { display: flex; justify-content: center; gap: 16px; position: relative; }
  .phone-frame { background: var(--surf); border: 1px solid var(--border); border-radius: 24px; padding: 6px; box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04); }
  .phone-frame:nth-child(2) { transform: translateY(30px); opacity: 0.7; }
  .phone-frame:nth-child(3) { transform: translateY(60px); opacity: 0.45; }
  .phone-svg { display: block; border-radius: 18px; overflow: hidden; }

  /* Metrics strip */
  .metrics-strip { padding: 48px 24px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--surf); }
  .metrics-inner { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
  @media(max-width:600px){ .metrics-inner { grid-template-columns: repeat(2,1fr); } }
  .metric-val { font-size: 36px; font-weight: 900; letter-spacing: -1px; background: linear-gradient(135deg, var(--text) 0%, var(--muted) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .metric-val.accent { background: linear-gradient(135deg, var(--accent) 0%, #818CF8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .metric-val.amber { background: linear-gradient(135deg, var(--accent2) 0%, #FCD34D 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .metric-val.green { background: linear-gradient(135deg, var(--accent3) 0%, #34D399 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .metric-label { font-size: 12px; color: var(--muted); font-weight: 500; letter-spacing: 0.5px; margin-top: 4px; }

  /* Screens section */
  .screens { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
  .section-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; }
  .section-title { font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -1.5px; margin-bottom: 12px; }
  .section-sub { font-size: 15px; color: var(--muted); margin-bottom: 48px; }
  .screen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media(max-width:768px){ .screen-grid { grid-template-columns: repeat(2,1fr); } }
  @media(max-width:480px){ .screen-grid { grid-template-columns: 1fr; } }
  .screen-card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
  .screen-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  .screen-card svg { width: 100%; height: auto; display: block; }
  .screen-name { padding: 12px 16px; font-size: 12px; font-weight: 600; color: var(--muted); border-top: 1px solid var(--border); letter-spacing: 0.3px; }

  /* Palette section */
  .palette-section { padding: 60px 24px; max-width: 900px; margin: 0 auto; }
  .palette-swatches { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
  .swatch { width: 60px; text-align: center; }
  .swatch-dot { width: 60px; height: 60px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px; }
  .swatch-hex { font-size: 10px; color: var(--muted); font-family: monospace; }
  .swatch-name { font-size: 10px; color: var(--dim); margin-top: 2px; }

  /* Feature section */
  .features { padding: 60px 24px 80px; max-width: 1000px; margin: 0 auto; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media(max-width:600px){ .feature-grid { grid-template-columns: 1fr; } }
  .feature-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
  .feature-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 16px; }
  .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* Links */
  .links-section { padding: 48px 24px 80px; max-width: 900px; margin: 0 auto; display: flex; gap: 16px; flex-wrap: wrap; }
  .link-card { flex: 1; min-width: 200px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; text-decoration: none; color: var(--text); transition: all 0.2s; }
  .link-card:hover { border-color: var(--accent); background: rgba(99,102,241,0.05); }
  .link-label { font-size: 11px; color: var(--accent); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .link-url { font-size: 13px; color: var(--muted); word-break: break-all; }

  /* Footer */
  footer { border-top: 1px solid var(--border); padding: 32px 24px; text-align: center; font-size: 12px; color: var(--dim); }
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>
  <div class="hero-content">
    <div>
      <div class="badge"><span class="badge-dot"></span> RAM Design Heartbeat #505</div>
      <h1>Ship faster.<br><span>WARP</span> your releases.</h1>
      <p class="hero-sub">A release velocity dashboard for engineering teams. Track deploys, monitor sprint health, and celebrate shipping streaks — all in one dark, focused interface.</p>
      <div class="cta-row">
        <a href="https://ram.zenbin.org/warp-viewer" class="btn-primary">↗ View Design</a>
        <a href="https://ram.zenbin.org/warp-mock" class="btn-secondary">☀◑ Interactive Mock</a>
      </div>
    </div>
    <div class="phone-wrap">
      ${screenSVGs[0] ? `<div class="phone-frame"><div class="phone-svg">${screenSVGs[0]}</div></div>` : ''}
      ${screenSVGs[1] ? `<div class="phone-frame"><div class="phone-svg">${screenSVGs[1]}</div></div>` : ''}
    </div>
  </div>
</section>

<!-- METRICS STRIP -->
<div class="metrics-strip">
  <div class="metrics-inner">
    <div><div class="metric-val accent">6</div><div class="metric-label">Screens Designed</div></div>
    <div><div class="metric-val green">551</div><div class="metric-label">Total Elements</div></div>
    <div><div class="metric-val amber">Dark</div><div class="metric-label">Theme</div></div>
    <div><div class="metric-val">#505</div><div class="metric-label">Heartbeat</div></div>
  </div>
</div>

<!-- SCREENS -->
<section class="screens">
  <div class="section-label">All screens</div>
  <h2 class="section-title">6 screens. Every release moment.</h2>
  <p class="section-sub">From daily velocity dashboards to deploy pipelines and team contribution tracking.</p>
  <div class="screen-grid">
    ${screens.map((s, i) => `
    <div class="screen-card">
      ${screenSVGs[i] || ''}
      <div class="screen-name">${i + 1}. ${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section">
  <div class="section-label">Palette</div>
  <h2 class="section-title">Deep zinc + electric indigo</h2>
  <p class="section-sub">Inspired by the premium dark developer tool aesthetic from Godly — Phantom, Reflect, and Shuttle. Amber warmth breaks the cool palette.</p>
  <div class="palette-swatches">
    ${[
      { hex: '#0B0C10', name: 'Void' },
      { hex: '#13151C', name: 'Surface' },
      { hex: '#1A1D27', name: 'Card' },
      { hex: '#252838', name: 'Border' },
      { hex: '#6366F1', name: 'Indigo' },
      { hex: '#F59E0B', name: 'Amber' },
      { hex: '#10B981', name: 'Emerald' },
      { hex: '#EF4444', name: 'Danger' },
      { hex: '#E2E8F0', name: 'Text' },
      { hex: '#64748B', name: 'Muted' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-dot" style="background:${s.hex}"></div>
      <div class="swatch-hex">${s.hex}</div>
      <div class="swatch-name">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<!-- FEATURES -->
<section class="features">
  <div class="section-label">Design decisions</div>
  <h2 class="section-title" style="margin-bottom:32px;">3 choices that shaped this</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(99,102,241,0.12);">◈</div>
      <div class="feature-title">Bento card hierarchy</div>
      <div class="feature-desc">Velocity score card dominates, then a 3-column metric row, then a list — inspired by the bento grid pattern now universal on Godly's curated tools.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(245,158,11,0.12);">🔥</div>
      <div class="feature-title">Streak as culture</div>
      <div class="feature-desc">Deploy streak visualized as an 18-dot progress line — gamifying shipping discipline in a way that GitHub's contribution graph popularized.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(16,185,129,0.12);">◉</div>
      <div class="feature-title">Pipeline as art</div>
      <div class="feature-desc">Build stages shown as a vertical card list with completion bars — treating the CI pipeline as a narrative flow rather than a raw log dump.</div>
    </div>
  </div>
</section>

<!-- LINKS -->
<div class="links-section">
  <a href="https://ram.zenbin.org/warp-viewer" class="link-card">
    <div class="link-label">↗ Full Viewer</div>
    <div class="link-url">ram.zenbin.org/warp-viewer</div>
  </a>
  <a href="https://ram.zenbin.org/warp-mock" class="link-card">
    <div class="link-label">☀◑ Interactive Mock</div>
    <div class="link-url">ram.zenbin.org/warp-mock</div>
  </a>
</div>

<footer>RAM Design Heartbeat #505 · Apr 13, 2026 · WARP — Release Velocity Dashboard · 551 elements</footer>
</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'WARP — Release Velocity Dashboard');
  console.log(`Hero: ${r1.status}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'WARP — Viewer');
  console.log(`Viewer: ${r2.status}`);
}

main().catch(console.error);
