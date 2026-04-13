'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'loop';
const NAME = 'LOOP';
const TAGLINE = 'close the feedback loop';

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

// Color palette
const C = {
  bg:     '#09090B',
  surf:   '#111113',
  card:   '#19191F',
  border: '#2A2A35',
  text:   '#F4F4F5',
  muted:  '#71717A',
  acc:    '#F97316',
  acc2:   '#8B5CF6',
  acc3:   '#06B6D4',
  pos:    '#22C55E',
};

// Build screen SVG thumbnails
function screenToSvg(screen) {
  const W = screen.width || 390;
  const H = screen.height || 844;
  let shapes = '';
  for (const el of screen.elements) {
    if (el.type === 'rect') {
      shapes += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill || 'none'}" rx="${el.rx || 0}"${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''}/>`;
    } else if (el.type === 'text') {
      shapes += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}"${el.fontWeight ? ` font-weight="${el.fontWeight}"` : ''}${el.fontFamily ? ` font-family="${el.fontFamily}"` : ''}${el.textAnchor ? ` text-anchor="${el.textAnchor}"` : ''}${el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : ''}${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}>${String(el.content || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      shapes += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''}/>`;
    } else if (el.type === 'line') {
      shapes += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}/>`;
    } else if (el.type === 'polygon') {
      shapes += `<polygon points="${el.points}" fill="${el.fill}"${el.opacity !== undefined ? ` opacity="${el.opacity}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''}/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${shapes}</svg>`;
}

const screenSvgs = pen.screens.map(screenToSvg);

// ─── Hero page ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${NAME} — ${TAGLINE}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: ${C.bg};
    --surf: ${C.surf};
    --card: ${C.card};
    --border: ${C.border};
    --text: ${C.text};
    --muted: ${C.muted};
    --acc: ${C.acc};
    --acc2: ${C.acc2};
    --acc3: ${C.acc3};
    --pos: ${C.pos};
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }
  /* Ambient glow background */
  body::before {
    content: '';
    position: fixed;
    top: -30%;
    left: -20%;
    width: 70%;
    height: 70%;
    background: radial-gradient(ellipse, ${C.acc}18 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }
  body::after {
    content: '';
    position: fixed;
    bottom: -20%;
    right: -20%;
    width: 60%;
    height: 60%;
    background: radial-gradient(ellipse, ${C.acc2}15 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }
  .wrap { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 24px; }

  /* Nav */
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    background: var(--surf);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 3px;
    color: var(--text);
  }
  .logo-dot {
    width: 12px; height: 12px;
    background: var(--acc);
    border-radius: 3px;
  }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-family: monospace; letter-spacing: 0.5px; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--acc);
    color: #fff;
    border: none;
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: monospace;
    letter-spacing: 0.5px;
  }

  /* Hero */
  .hero {
    text-align: center;
    padding: 100px 24px 80px;
    position: relative;
  }
  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${C.acc}18;
    border: 1px solid ${C.acc}44;
    border-radius: 100px;
    padding: 6px 16px;
    font-size: 11px;
    font-family: monospace;
    letter-spacing: 1.5px;
    color: var(--acc);
    margin-bottom: 28px;
    font-weight: 600;
  }
  .hero-eyebrow span { width: 6px; height: 6px; background: var(--acc); border-radius: 50%; display: inline-block; }
  h1 {
    font-size: clamp(52px, 8vw, 96px);
    font-weight: 800;
    line-height: 1.0;
    letter-spacing: -2px;
    margin-bottom: 24px;
  }
  h1 em {
    font-style: normal;
    color: var(--acc);
  }
  .hero-sub {
    font-size: 18px;
    color: var(--muted);
    max-width: 560px;
    margin: 0 auto 40px;
    line-height: 1.6;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--acc);
    color: #fff;
    padding: 14px 32px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    transition: opacity .2s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-secondary {
    background: var(--card);
    color: var(--text);
    padding: 14px 32px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;
    border: 1px solid var(--border);
    transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: var(--muted); }

  /* Ruler annotation — spaceship UI */
  .ruler-annotation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 56px 0 20px;
    opacity: 0.5;
  }
  .ruler-line { flex: 1; max-width: 180px; height: 1px; background: var(--border); position: relative; }
  .ruler-line::before, .ruler-line::after {
    content: '';
    position: absolute;
    top: -4px;
    width: 1px;
    height: 8px;
    background: var(--border);
  }
  .ruler-line::before { left: 0; }
  .ruler-line::after { right: 0; }
  .ruler-label { font-family: monospace; font-size: 9px; letter-spacing: 2px; color: var(--muted); }

  /* Screen carousel */
  .screens-section { padding: 20px 0 80px; }
  .screens-scroll {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding: 20px 32px;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
  }
  .screens-scroll::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 auto;
    width: 260px;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    scroll-snap-align: start;
    background: var(--card);
    transition: transform .2s, border-color .2s;
  }
  .screen-card:hover { transform: translateY(-4px); border-color: var(--acc); }
  .screen-card svg { width: 100%; height: auto; display: block; }
  .screen-label {
    padding: 10px 14px;
    font-family: monospace;
    font-size: 9px;
    letter-spacing: 1.5px;
    color: var(--muted);
    border-top: 1px solid var(--border);
    text-transform: uppercase;
  }

  /* Features bento */
  .bento { padding: 40px 0 80px; }
  .bento-head { text-align: center; margin-bottom: 48px; }
  .bento-head h2 { font-size: 36px; font-weight: 700; letter-spacing: -1px; margin-bottom: 12px; }
  .bento-head p { color: var(--muted); font-size: 16px; }
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: 12px;
  }
  .bento-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
    position: relative;
    overflow: hidden;
    transition: border-color .2s;
  }
  .bento-card:hover { border-color: var(--acc); }
  .bento-card.wide { grid-column: span 2; }
  .bento-card.tall { grid-row: span 2; }
  .bento-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--acc) 0%, transparent 100%);
    opacity: 0;
    transition: opacity .2s;
  }
  .bento-card:hover::after { opacity: 1; }
  .bento-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    margin-bottom: 16px;
  }
  .bento-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
  .bento-card p { color: var(--muted); font-size: 13px; line-height: 1.6; }
  .metric-big { font-size: 48px; font-weight: 800; color: var(--acc); font-family: monospace; margin: 12px 0 4px; }
  .metric-label { font-family: monospace; font-size: 10px; letter-spacing: 1.5px; color: var(--muted); }

  /* Palette section */
  .palette-section { padding: 40px 0; text-align: center; }
  .palette-section h3 { font-size: 13px; font-family: monospace; letter-spacing: 2px; color: var(--muted); margin-bottom: 20px; }
  .swatches { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .swatch { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .swatch-color { width: 44px; height: 44px; border-radius: 8px; border: 1px solid var(--border); }
  .swatch-hex { font-family: monospace; font-size: 9px; color: var(--muted); letter-spacing: 0.5px; }

  /* Footer */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--muted);
    font-family: monospace;
  }
  footer a { color: var(--muted); text-decoration: none; }
  footer a:hover { color: var(--text); }

  /* Heartbeat badge */
  .hb-badge {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 14px;
    font-family: monospace;
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 1px;
    z-index: 100;
  }
  .hb-badge span { color: var(--acc); }
</style>
</head>
<body>

<nav>
  <div class="logo"><div class="logo-dot"></div>LOOP</div>
  <div class="nav-links">
    <a href="#">SESSIONS</a>
    <a href="#">FUNNELS</a>
    <a href="#">INSIGHTS</a>
    <a href="#">REPORTS</a>
  </div>
  <button class="nav-cta">START FREE</button>
</nav>

<section class="hero">
  <div class="wrap">
    <div class="hero-eyebrow"><span></span> HEARTBEAT #503 · AI ANALYTICS · DARK THEME</div>
    <h1>Close the<br><em>feedback loop</em></h1>
    <p class="hero-sub">AI-powered user behavior analytics that surfaces what's broken, what's working, and why — across every session, funnel, and cohort.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/loop-viewer" class="btn-primary">Open in Viewer</a>
      <a href="https://ram.zenbin.org/loop-mock" class="btn-secondary">☀◑ Interactive Mock</a>
    </div>
  </div>
</section>

<div class="ruler-annotation">
  <div class="ruler-line"></div>
  <span class="ruler-label">// 6 SCREENS · 507 ELEMENTS · PENCIL.DEV V2.8</span>
  <div class="ruler-line"></div>
</div>

<section class="screens-section">
  <div class="wrap">
    <div class="screens-scroll">
      ${screenSvgs.map((svg, i) => `
      <div class="screen-card">
        ${svg}
        <div class="screen-label">// ${pen.screens[i].name.toUpperCase()}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="bento">
  <div class="wrap">
    <div class="bento-head">
      <h2>Everything in the loop</h2>
      <p>From raw session replay to AI-generated recommendations — all in one place.</p>
    </div>
    <div class="bento-grid">
      <div class="bento-card wide">
        <div class="bento-icon" style="background:${C.acc}22;">📹</div>
        <h3>Session Replay + Health Score</h3>
        <p>Every session scored 0–100 using AI pattern recognition. Rage clicks, dead ends, and exit signals are tagged automatically so you don't have to watch every recording.</p>
        <div class="metric-big">24,891</div>
        <div class="metric-label">SESSIONS INDEXED THIS WEEK</div>
      </div>
      <div class="bento-card">
        <div class="bento-icon" style="background:${C.acc2}22;">⚡</div>
        <h3>AI Insights</h3>
        <p>Surface critical patterns across thousands of sessions — instantly. No dashboards to build.</p>
      </div>
      <div class="bento-card">
        <div class="bento-icon" style="background:${C.pos}22;">↘</div>
        <h3>Funnel Analysis</h3>
        <p>Step-by-step conversion tracking with AI drop-off tagging. Know exactly where users leave and why.</p>
        <div class="metric-big" style="color:${C.pos}">68.3%</div>
        <div class="metric-label">OVERALL COMPLETION RATE</div>
      </div>
      <div class="bento-card">
        <div class="bento-icon" style="background:${C.acc3}22;">📊</div>
        <h3>Reports & Sharing</h3>
        <p>Scheduled reports, real-time alerts, and one-click share links — built for cross-functional teams.</p>
      </div>
      <div class="bento-card wide">
        <div class="bento-icon" style="background:${C.acc}22;">◎</div>
        <h3>Precision Analytics — Inspired by the "Spaceship UI" aesthetic</h3>
        <p>Every metric is annotated with monospace precision labels, hairline measurement rules, and structured technical notation. Designed for engineering and product teams who want data density without visual noise — inspired by the technical documentation aesthetic seen on Godly.website.</p>
      </div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="wrap">
    <h3>// PALETTE · ZINC-DARK + ORANGE + VIOLET</h3>
    <div class="swatches">
      ${[
        { hex: C.bg,    name: 'BG'      },
        { hex: C.surf,  name: 'SURFACE' },
        { hex: C.card,  name: 'CARD'    },
        { hex: C.border,name: 'BORDER'  },
        { hex: C.text,  name: 'TEXT'    },
        { hex: C.muted, name: 'MUTED'   },
        { hex: C.acc,   name: 'ORANGE'  },
        { hex: C.acc2,  name: 'VIOLET'  },
        { hex: C.acc3,  name: 'CYAN'    },
        { hex: C.pos,   name: 'POS'     },
      ].map(s => `
      <div class="swatch">
        <div class="swatch-color" style="background:${s.hex}"></div>
        <div class="swatch-hex">${s.hex}</div>
        <div class="swatch-hex" style="letter-spacing:1px">${s.name}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<footer>
  <span>RAM Design Heartbeat #503 · ${new Date().toISOString().split('T')[0]} · LOOP</span>
  <span>
    <a href="https://ram.zenbin.org/loop-viewer">Viewer</a> &nbsp;·&nbsp;
    <a href="https://ram.zenbin.org/loop-mock">Mock ☀◑</a>
  </span>
</footer>

<div class="hb-badge">RAM · HB <span>#503</span> · DARK</div>

</body>
</html>`;

// ─── Inject pen into viewer ───────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 120)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 120)}`);
}

main().catch(console.error);
