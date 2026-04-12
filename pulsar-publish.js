'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'pulsar';
const APP     = 'PULSAR';
const TAGLINE = 'Real-time API pulse monitor';

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
const pen     = JSON.parse(penJson);

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  black:   '#000000',
  surface: '#0A0A0C',
  card:    '#0F0F14',
  border:  '#1E1E2A',
  violet:  '#A855F7',
  cyan:    '#22D3EE',
  green:   '#10F58C',
  coral:   '#FF4757',
  amber:   '#F59E0B',
  text:    '#E2E8F0',
  textMid: '#94A3B8',
  textDim: '#475569',
};

// Convert pen screens to SVG-encoded data URIs for preview
function screenToSvg(screen) {
  const W = 390, H = 844;
  const eSvg = screen.elements.map(e => {
    if (e.type === 'rect') {
      const rx = e.rx !== undefined ? ` rx="${e.rx}"` : '';
      const opacity = e.opacity !== undefined ? ` opacity="${e.opacity}"` : '';
      const stroke = e.stroke ? ` stroke="${e.stroke}" stroke-width="${e.strokeWidth || 1}"` : '';
      return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}"${rx}${opacity}${stroke}/>`;
    }
    if (e.type === 'circle') {
      const opacity = e.opacity !== undefined ? ` opacity="${e.opacity}"` : '';
      const stroke = e.stroke ? ` stroke="${e.stroke}" stroke-width="${e.strokeWidth || 1}"` : '';
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}"${opacity}${stroke}/>`;
    }
    if (e.type === 'line') {
      const opacity = e.opacity !== undefined ? ` opacity="${e.opacity}"` : '';
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth || 1}"${opacity}/>`;
    }
    if (e.type === 'text') {
      const fw = e.fontWeight ? ` font-weight="${e.fontWeight}"` : '';
      const ff = e.fontFamily ? ` font-family="${e.fontFamily}"` : ' font-family="Inter, sans-serif"';
      const anchor = e.textAnchor ? ` text-anchor="${e.textAnchor}"` : '';
      const ls = e.letterSpacing ? ` letter-spacing="${e.letterSpacing}"` : '';
      const opacity = e.opacity !== undefined ? ` opacity="${e.opacity}"` : '';
      const content = String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}"${fw}${ff}${anchor}${ls}${opacity}>${content}</text>`;
    }
    return '';
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${eSvg}</svg>`;
}

const svgScreens = pen.screens.map(s => ({
  name: s.name,
  svg: screenToSvg(s),
}));

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP} — ${TAGLINE} | RAM Design Heartbeat #49</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black: ${C.black};
    --surface: ${C.surface};
    --card: ${C.card};
    --border: ${C.border};
    --violet: ${C.violet};
    --cyan: ${C.cyan};
    --green: ${C.green};
    --coral: ${C.coral};
    --amber: ${C.amber};
    --text: ${C.text};
    --textMid: ${C.textMid};
    --textDim: ${C.textDim};
  }
  html { background: var(--black); color: var(--text); font-family: Inter, -apple-system, sans-serif; }
  body { min-height: 100vh; overflow-x: hidden; }

  /* Aurora header strip */
  .aurora-strip {
    height: 3px;
    background: linear-gradient(90deg, #A855F7, #22D3EE, #10F58C, #F59E0B, #FF4757, #A855F7);
    background-size: 200% 100%;
    animation: aurora 6s linear infinite;
  }
  @keyframes aurora { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }

  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px; border-bottom: 1px solid var(--border);
    background: rgba(10,10,12,0.85); backdrop-filter: blur(12px);
    position: sticky; top: 3px; z-index: 100;
  }
  .wordmark { font-size: 18px; font-weight: 700; letter-spacing: -0.04em; font-family: 'Courier New', monospace; color: var(--text); }
  .wordmark span { color: var(--violet); }
  .beat-pill {
    font-size: 10px; letter-spacing: 0.1em; font-family: monospace;
    padding: 4px 12px; border-radius: 20px; border: 1px solid var(--violet);
    color: var(--violet); background: rgba(168,85,247,0.1);
  }
  .nav-links { display: flex; gap: 24px; align-items: center; }
  .nav-links a { color: var(--textMid); font-size: 13px; text-decoration: none; }
  .nav-links a:hover { color: var(--text); }

  /* Hero section */
  .hero {
    padding: 80px 32px 60px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(168,85,247,0.15), transparent 70%),
                radial-gradient(ellipse 40% 30% at 20% 60%, rgba(34,211,238,0.08), transparent 70%),
                radial-gradient(ellipse 40% 30% at 80% 40%, rgba(16,245,140,0.06), transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; letter-spacing: 0.12em; color: var(--green);
    font-family: monospace; margin-bottom: 20px;
    padding: 5px 14px; border-radius: 20px;
    border: 1px solid rgba(16,245,140,0.3); background: rgba(16,245,140,0.06);
  }
  .hero-eyebrow::before { content: '●'; font-size: 8px; animation: pulse 1.5s ease infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  h1 {
    font-size: clamp(48px, 8vw, 80px); font-weight: 800; line-height: 1;
    letter-spacing: -0.04em; color: var(--text);
    font-family: 'Courier New', monospace;
    margin-bottom: 16px;
  }
  h1 .accent {
    background: linear-gradient(135deg, var(--violet) 0%, var(--cyan) 50%, var(--green) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hero-sub {
    font-size: 18px; color: var(--textMid); max-width: 480px;
    margin: 0 auto 40px; line-height: 1.6;
  }
  .cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .cta-primary {
    padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 600;
    background: var(--violet); color: #fff; text-decoration: none;
    border: none; cursor: pointer;
    box-shadow: 0 0 24px rgba(168,85,247,0.35);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .cta-primary:hover { box-shadow: 0 0 40px rgba(168,85,247,0.5); transform: translateY(-1px); }
  .cta-secondary {
    padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 500;
    background: transparent; color: var(--text); text-decoration: none;
    border: 1px solid var(--border); cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .cta-secondary:hover { border-color: var(--violet); background: rgba(168,85,247,0.05); }

  /* Stats bar */
  .stats-bar {
    display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;
    padding: 28px 32px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .stat { text-align: center; }
  .stat-val { font-size: 26px; font-weight: 700; font-family: monospace; letter-spacing: -0.03em; }
  .stat-label { font-size: 10px; letter-spacing: 0.1em; color: var(--textDim); margin-top: 2px; }

  /* Screen gallery */
  .gallery-section { padding: 60px 32px; }
  .section-label { font-size: 10px; letter-spacing: 0.14em; color: var(--textDim); margin-bottom: 28px; text-align: center; }
  .screen-row {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px;
    max-width: 1200px; margin: 0 auto;
  }
  .screen-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px;
    overflow: hidden; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .screen-card:hover {
    transform: translateY(-4px);
    border-color: var(--violet);
    box-shadow: 0 8px 32px rgba(168,85,247,0.15);
  }
  .screen-thumb {
    width: 100%; aspect-ratio: 390/844;
    display: block; background: var(--black);
  }
  .screen-thumb svg { width: 100%; height: 100%; }
  .screen-label { padding: 10px 12px; font-size: 11px; color: var(--textMid); font-weight: 500; }

  /* Features — bento grid */
  .features { padding: 60px 32px; max-width: 900px; margin: 0 auto; }
  .bento { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .bento-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px;
    padding: 28px; position: relative; overflow: hidden;
  }
  .bento-card.wide { grid-column: span 2; }
  .bento-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
  }
  .bento-card.v::before { background: linear-gradient(90deg, transparent, var(--violet), transparent); }
  .bento-card.c::before { background: linear-gradient(90deg, transparent, var(--cyan), transparent); }
  .bento-card.g::before { background: linear-gradient(90deg, transparent, var(--green), transparent); }
  .bento-card.a::before { background: linear-gradient(90deg, transparent, var(--amber), transparent); }
  .bento-icon { font-size: 24px; margin-bottom: 12px; }
  .bento-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  .bento-desc { font-size: 13px; color: var(--textMid); line-height: 1.5; }

  /* Palette row */
  .palette-section { padding: 40px 32px; text-align: center; }
  .swatch-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
  .swatch {
    width: 56px; height: 56px; border-radius: 12px;
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 6px; font-size: 9px; font-family: monospace;
    color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.06);
  }

  /* Inspiration section */
  .inspiration { padding: 40px 32px; max-width: 700px; margin: 0 auto; text-align: center; }
  .inspiration p { font-size: 14px; color: var(--textMid); line-height: 1.7; }
  .insp-pill {
    display: inline-block; padding: 3px 10px; border-radius: 8px;
    background: rgba(168,85,247,0.12); color: var(--violet); font-size: 12px;
    border: 1px solid rgba(168,85,247,0.25); margin: 2px;
  }

  /* Footer */
  footer {
    padding: 32px; border-top: 1px solid var(--border);
    text-align: center; font-size: 12px; color: var(--textDim);
  }
  footer a { color: var(--violet); text-decoration: none; }

  @media (max-width: 600px) {
    nav { padding: 12px 16px; }
    .bento { grid-template-columns: 1fr; }
    .bento-card.wide { grid-column: span 1; }
    h1 { font-size: 42px; }
  }
</style>
</head>
<body>
<div class="aurora-strip"></div>

<nav>
  <div class="wordmark">PUL<span>SAR</span></div>
  <div class="nav-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
    <span class="beat-pill">HEARTBEAT #49</span>
  </div>
</nav>

<section class="hero">
  <div class="hero-eyebrow">LIVE API MONITORING</div>
  <h1>PUL<span class="accent">SAR</span></h1>
  <p class="hero-sub">Real-time pulse monitoring for every API endpoint. Detect failures, trace latency spikes, and alert the right people — instantly.</p>
  <div class="cta-row">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="cta-primary">Open in Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="cta-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<div class="stats-bar">
  <div class="stat"><div class="stat-val" style="color:${C.green}">99.8%</div><div class="stat-label">UPTIME</div></div>
  <div class="stat"><div class="stat-val" style="color:${C.cyan}">142ms</div><div class="stat-label">P95 LATENCY</div></div>
  <div class="stat"><div class="stat-val" style="color:${C.violet}">58.4K</div><div class="stat-label">REQ / MIN</div></div>
  <div class="stat"><div class="stat-val" style="color:${C.amber}">0.2%</div><div class="stat-label">ERROR RATE</div></div>
  <div class="stat"><div class="stat-val" style="color:${C.text}">6</div><div class="stat-label">SCREENS</div></div>
  <div class="stat"><div class="stat-val" style="color:${C.text}">711</div><div class="stat-label">ELEMENTS</div></div>
</div>

<section class="gallery-section">
  <div class="section-label">SCREENS — PENCIL.DEV V2.8 · 390×844</div>
  <div class="screen-row">
${svgScreens.map(sc => `    <div class="screen-card">
      <div class="screen-thumb">${sc.svg}</div>
      <div class="screen-label">${sc.name}</div>
    </div>`).join('\n')}
  </div>
</section>

<section class="features">
  <div class="section-label">DESIGN DECISIONS</div>
  <div class="bento">
    <div class="bento-card wide v">
      <div class="bento-icon">🌌</div>
      <div class="bento-title">Aurora Gradient on Pure Black</div>
      <div class="bento-desc">Inspired by Orbi on darkmodedesign.com — a multicolor light-streak gradient (violet → cyan → green → amber → coral) on an absolute #000000 base. The aurora strip animates across the top of every screen, providing a living pulse that mirrors the app's real-time nature. Pure black (not dark gray) signals luxury and premium focus.</div>
    </div>
    <div class="bento-card g">
      <div class="bento-icon">💚</div>
      <div class="bento-title">Terminal Green Log Stream</div>
      <div class="bento-desc">The Log Stream screen uses a full terminal aesthetic — monospace font, #10F58C green accents, color-coded log levels — directly inspired by Neon database's matrix scan-line look on darkmodedesign.com.</div>
    </div>
    <div class="bento-card c">
      <div class="bento-icon">⬡</div>
      <div class="bento-title">Bento Endpoint Grid</div>
      <div class="bento-desc">The dashboard health grid uses a 3-column bento layout — different-width cells per endpoint status — drawn from land-book's SaaS feature showcase pattern. Each tile has a mini sparkline bar graph in the corner.</div>
    </div>
    <div class="bento-card a">
      <div class="bento-icon">⚡</div>
      <div class="bento-title">Semantic Color Coding</div>
      <div class="bento-desc">Four-color semantic system: violet for primary UI chrome, cyan for info/latency, green for healthy/live, coral for errors. The same palette drives all status indicators, charts, and badges — no color is arbitrary.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-label">PALETTE</div>
  <div class="swatch-row">
    <div class="swatch" style="background:${C.black};">#000</div>
    <div class="swatch" style="background:${C.surface};">#0A0A0C</div>
    <div class="swatch" style="background:${C.card};">#0F0F14</div>
    <div class="swatch" style="background:${C.violet};">#A855F7</div>
    <div class="swatch" style="background:${C.cyan};">#22D3EE</div>
    <div class="swatch" style="background:${C.green};">#10F58C</div>
    <div class="swatch" style="background:${C.coral};">#FF4757</div>
    <div class="swatch" style="background:${C.amber};">#F59E0B</div>
  </div>
</section>

<section class="inspiration">
  <div class="section-label">RESEARCH TRAIL</div>
  <p>Spotted <span class="insp-pill">Orbi — darkmodedesign.com</span> using pure #000000 with a prismatic aurora light-streak gradient (blue/magenta/orange/yellow). Combined with <span class="insp-pill">Neon DB — darkmodedesign.com</span> terminal green scan-line aesthetic and <span class="insp-pill">land-book.com</span> bento-grid product showcases — PULSAR tries to use real-time data density as a design language, not just decoration.</p>
</section>

<footer>
  <p>RAM Design Heartbeat #49 · ${new Date().toISOString().slice(0,10)} · Dark theme</p>
  <p style="margin-top:8px;"><a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a> · <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a></p>
</footer>
</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}  ${r1.body.slice(0,80)}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status}  ${r2.body.slice(0,80)}`);
}
main().catch(console.error);
