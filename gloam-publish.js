'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'gloam';
const NAME    = 'GLOAM';
const TAGLINE = 'sleep where the light goes soft';

const penJson  = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen      = JSON.parse(penJson);

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

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
// Color palette
const C = {
  bg:      '#090B12',
  surf:    '#0F1220',
  card:    '#141829',
  border:  '#1E2438',
  amber:   '#F59E0B',
  amber2:  '#D97706',
  teal:    '#2DD4BF',
  text:    '#EEF0F6',
  sub:     '#8090B4',
  muted:   '#3D4A6B',
};

// Build screen SVG previews as base64 data URIs
function buildScreenPreview(screen, index) {
  const W = 390, H = 844;
  function elToSvg(el) {
    if (!el || !el.type) return '';
    const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    switch (el.type) {
      case 'rect': {
        const rx = el.rx ? ` rx="${el.rx}"` : '';
        const stroke = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
        return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}"${rx}${stroke}${op}/>`;
      }
      case 'circle': {
        const stroke = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
        return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${stroke}${op}/>`;
      }
      case 'text': {
        const fw = el.fontWeight ? ` font-weight="${el.fontWeight}"` : '';
        const anchor = el.textAnchor ? ` text-anchor="${el.textAnchor}"` : '';
        const ls = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : '';
        const fill = el.fill || '#ffffff';
        return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${fill}"${fw}${anchor}${ls}${op} font-family="system-ui,sans-serif">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
      }
      case 'line': {
        const sw = el.strokeWidth ? ` stroke-width="${el.strokeWidth}"` : '';
        return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}"${sw}${op}/>`;
      }
      case 'path': {
        const sw = el.strokeWidth ? ` stroke-width="${el.strokeWidth}"` : '';
        const cap = el.strokeLinecap ? ` stroke-linecap="${el.strokeLinecap}"` : '';
        return `<path d="${el.d}" fill="${el.fill || 'none'}" stroke="${el.stroke || 'none'}"${sw}${cap}${op}/>`;
      }
      default: return '';
    }
  }
  const svgContent = (screen.elements || []).map(elToSvg).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n<rect width="${W}" height="${H}" fill="${C.bg}"/>\n${svgContent}\n</svg>`;
  return Buffer.from(svg).toString('base64');
}

const screens = pen.screens || [];
const previews = screens.map((s, i) => ({ name: s.name, b64: buildScreenPreview(s, i) }));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<style>
  :root {
    --bg: ${C.bg};
    --surf: ${C.surf};
    --card: ${C.card};
    --border: ${C.border};
    --amber: ${C.amber};
    --amber2: ${C.amber2};
    --teal: ${C.teal};
    --text: ${C.text};
    --sub: ${C.sub};
    --muted: ${C.muted};
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden; }

  /* Ambient glow layers */
  body::before {
    content:'';
    position: fixed; top: -200px; left: 50%;
    width: 600px; height: 600px;
    transform: translateX(-50%);
    background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  body::after {
    content:'';
    position: fixed; bottom: -200px; right: -100px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .container { max-width: 960px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* Nav */
  nav {
    padding: 20px 0;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid ${C.border};
    margin-bottom: 0;
  }
  .nav-logo { font-size: 18px; font-weight: 800; letter-spacing: 3px; color: var(--text); }
  .nav-logo span { color: var(--amber); }
  .nav-links { display:flex; gap: 20px; align-items: center; }
  .nav-links a { color: var(--sub); text-decoration: none; font-size: 13px; transition: color 0.2s; }
  .nav-links a:hover { color: var(--amber); }
  .nav-cta {
    background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3);
    color: var(--amber); padding: 8px 18px; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    text-decoration: none;
  }
  .nav-cta:hover { background: rgba(245,158,11,0.2); }

  /* Hero */
  .hero { padding: 80px 0 60px; text-align: center; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
    color: var(--amber); padding: 6px 16px; border-radius: 100px;
    font-size: 11px; font-weight: 700; letter-spacing: 2px; margin-bottom: 28px;
  }
  .hero-badge::before { content: '◑'; font-size: 13px; }
  .hero h1 {
    font-size: clamp(42px, 7vw, 72px); font-weight: 800; letter-spacing: -2px;
    line-height: 1.05; margin-bottom: 20px;
  }
  .hero h1 span {
    color: transparent;
    background: linear-gradient(135deg, var(--amber) 0%, var(--amber2) 50%, rgba(245,158,11,0.5) 100%);
    -webkit-background-clip: text; background-clip: text;
  }
  .hero-sub {
    font-size: 18px; color: var(--sub); max-width: 480px; margin: 0 auto 36px;
    line-height: 1.6; font-weight: 400;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--amber); color: ${C.bg}; padding: 14px 28px;
    border-radius: 12px; font-weight: 700; font-size: 15px;
    text-decoration: none; transition: all 0.2s;
    box-shadow: 0 0 30px rgba(245,158,11,0.3);
  }
  .btn-primary:hover { box-shadow: 0 0 50px rgba(245,158,11,0.5); transform: translateY(-1px); }
  .btn-secondary {
    background: var(--surf); border: 1px solid var(--border);
    color: var(--text); padding: 14px 28px; border-radius: 12px;
    font-weight: 600; font-size: 15px; text-decoration: none; transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: var(--muted); }

  /* Screen carousel */
  .screens-section { padding: 80px 0; }
  .section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
    color: var(--amber); text-align: center; margin-bottom: 12px;
  }
  .section-title {
    font-size: 32px; font-weight: 700; text-align: center;
    letter-spacing: -0.5px; margin-bottom: 48px;
  }
  .screens-scroll {
    display: flex; gap: 20px; overflow-x: auto; padding: 0 0 20px;
    scrollbar-width: none;
  }
  .screens-scroll::-webkit-scrollbar { display: none; }
  .screen-card {
    flex: 0 0 195px; border-radius: 20px; overflow: hidden;
    border: 1px solid var(--border); transition: all 0.3s;
    position: relative;
  }
  .screen-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(245,158,11,0.05) 0%, transparent 40%);
    pointer-events: none; z-index: 1;
  }
  .screen-card:hover { transform: translateY(-6px); border-color: rgba(245,158,11,0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(245,158,11,0.1); }
  .screen-card img { width: 100%; display: block; }
  .screen-name {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, rgba(9,11,18,0.95) 0%, transparent 100%);
    padding: 24px 12px 10px; font-size: 11px; font-weight: 600;
    color: var(--sub); text-align: center; z-index: 2;
  }

  /* Palette */
  .palette-section { padding: 60px 0; }
  .palette-grid { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .swatch {
    width: 64px; text-align: center;
  }
  .swatch-color { width: 64px; height: 64px; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.06); }
  .swatch-name { font-size: 9px; color: var(--sub); font-weight: 600; letter-spacing: 0.5px; }
  .swatch-hex { font-size: 9px; color: var(--muted); font-family: monospace; }

  /* Features */
  .features-section { padding: 60px 0; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
  .feature-card {
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px; transition: all 0.2s;
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--amber), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .feature-card:hover::before { opacity: 1; }
  .feature-card:hover { border-color: rgba(245,158,11,0.2); }
  .feature-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(245,158,11,0.1); display: flex; align-items: center;
    justify-content: center; font-size: 18px; margin-bottom: 14px;
  }
  .feature-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  .feature-desc { font-size: 13px; color: var(--sub); line-height: 1.6; }

  /* Stats */
  .stats-section { padding: 60px 0; }
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .stat-card {
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px 20px; text-align: center;
  }
  .stat-value { font-size: 36px; font-weight: 800; color: var(--amber); letter-spacing: -1px; }
  .stat-label { font-size: 12px; color: var(--sub); margin-top: 6px; }

  /* Footer */
  footer {
    border-top: 1px solid var(--border); padding: 40px 0;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .footer-left { font-size: 13px; color: var(--muted); }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 12px; color: var(--sub); text-decoration: none; }
  .footer-links a:hover { color: var(--amber); }

  @media (max-width: 600px) {
    .stats-grid { grid-template-columns: 1fr; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>
<div class="container">
  <nav>
    <div class="nav-logo">GL<span>◑</span>AM</div>
    <div class="nav-links">
      <a href="#screens">Screens</a>
      <a href="#features">Features</a>
      <a href="${SLUG}-viewer">Viewer</a>
      <a href="${SLUG}-mock" class="nav-cta">Interactive Mock ☀◑</a>
    </div>
  </nav>
</div>

<div class="container">
  <section class="hero">
    <div class="hero-badge">RAM DESIGN HEARTBEAT · DARK</div>
    <h1>Sleep where the<br><span>light goes soft</span></h1>
    <p class="hero-sub">A circadian rhythm & sleep tracking app built around the glow of amber light — because how you wind down matters as much as how long you sleep.</p>
    <div class="hero-actions">
      <a href="${SLUG}-viewer" class="btn-primary">View Design →</a>
      <a href="${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
  </section>
</div>

<div class="container">
  <section class="screens-section" id="screens">
    <p class="section-label">6 SCREENS</p>
    <h2 class="section-title">The full experience</h2>
    <div class="screens-scroll">
      ${previews.map(p => `
      <div class="screen-card">
        <img src="data:image/svg+xml;base64,${p.b64}" alt="${p.name}" loading="lazy"/>
        <div class="screen-name">${p.name}</div>
      </div>`).join('')}
    </div>
  </section>

  <section class="palette-section">
    <p class="section-label">PALETTE</p>
    <h2 class="section-title" style="margin-bottom:32px">Deep night + amber glow</h2>
    <div class="palette-grid">
      ${[
        { color: C.bg,     name: 'Void',    hex: C.bg     },
        { color: C.surf,   name: 'Surface', hex: C.surf   },
        { color: C.card,   name: 'Card',    hex: C.card   },
        { color: C.border, name: 'Border',  hex: C.border },
        { color: C.amber,  name: 'Amber',   hex: C.amber  },
        { color: C.amber2, name: 'Ember',   hex: C.amber2 },
        { color: C.teal,   name: 'Glow',    hex: C.teal   },
        { color: C.text,   name: 'Text',    hex: C.text   },
        { color: C.sub,    name: 'Sub',     hex: C.sub    },
        { color: C.muted,  name: 'Muted',   hex: C.muted  },
      ].map(s => `
      <div class="swatch">
        <div class="swatch-color" style="background:${s.color}"></div>
        <div class="swatch-name">${s.name}</div>
        <div class="swatch-hex">${s.hex}</div>
      </div>`).join('')}
    </div>
  </section>

  <section class="features-section" id="features">
    <p class="section-label">DESIGN DECISIONS</p>
    <h2 class="section-title">What makes GLOAM</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">◑</div>
        <div class="feature-title">Ambient glow over hard shadow</div>
        <div class="feature-desc">Inspired by darkmodedesign.com's emerging trend — components emit amber light outward rather than casting shadows inward. Depth through luminance.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚫</div>
        <div class="feature-title">Blue-tinted near-black base</div>
        <div class="feature-desc">Background is #090B12 — a subtle blue shift from neutral black. This cooler-than-neutral dark creates a night-sky atmosphere without feeling grey.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✦</div>
        <div class="feature-title">Component-level spotlight lighting</div>
        <div class="feature-desc">Each card has its own micro-glow: a 2px top border bar or rgba amber overlay that makes them feel internally lit, separating layers without borders.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⏱</div>
        <div class="feature-title">Circadian arc rings</div>
        <div class="feature-desc">Sleep score and progress rings use dual concentric arcs — amber outer for overall score, teal inner for REM quality. The endpoint dot glows to mark position.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◐</div>
        <div class="feature-title">Medium+ weights on dark</div>
        <div class="feature-desc">Following darkmodedesign.com's typography finding — body and label text uses 500–600 weight throughout to compensate for perceived thinning of light text on dark.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">❋</div>
        <div class="feature-title">Wind-down as primary UX</div>
        <div class="feature-desc">Most sleep apps track; GLOAM guides. The Wind Down screen treats the pre-sleep routine as the core product — with a dedicated progress ring and step coach.</div>
      </div>
    </div>
  </section>

  <section class="stats-section">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">6</div>
        <div class="stat-label">Screens designed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">530</div>
        <div class="stat-label">Design elements</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">Dark</div>
        <div class="stat-label">Theme</div>
      </div>
    </div>
  </section>

  <footer>
    <div class="footer-left">RAM Design Heartbeat · April 2026 · Inspired by darkmodedesign.com</div>
    <div class="footer-links">
      <a href="${SLUG}-viewer">Pencil Viewer</a>
      <a href="${SLUG}-mock">Interactive Mock</a>
    </div>
  </footer>
</div>
</body>
</html>`;

// ── VIEWER ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status}${r1.status !== 201 ? ' ' + r1.body.slice(0, 120) : ''}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Design Viewer`);
  console.log(`Viewer: ${r2.status}${r2.status !== 201 ? ' ' + r2.body.slice(0, 120) : ''}`);
}

main().catch(console.error);
