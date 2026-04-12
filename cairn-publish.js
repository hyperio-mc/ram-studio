'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'cairn';

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
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ─── PALETTE (for hero) ───────────────────────────────────────────────
const BG     = '#F6F3EE';
const TEXT   = '#1C1B17';
const TEXT2  = '#7A7468';
const GREEN  = '#3A7A52';
const AMBER  = '#C67E1A';

// ─── HERO HTML ────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CAIRN — Trail Planning & Field Notes</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lora:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: ${BG};
    color: ${TEXT};
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Topographic background lines */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 27px,
        rgba(58,122,82,0.08) 28px
      );
    pointer-events: none;
    z-index: 0;
  }

  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* NAV */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 0; border-bottom: 1px solid rgba(58,122,82,0.15);
  }
  .nav-logo {
    font-family: 'Lora', serif;
    font-size: 22px; font-weight: 700; color: ${TEXT};
    letter-spacing: -0.5px;
  }
  .nav-logo span { color: ${GREEN}; }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { font-size: 13px; color: ${TEXT2}; text-decoration: none; font-weight: 500; }
  .nav-links a:hover { color: ${GREEN}; }

  /* HERO */
  .hero {
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
    align-items: center; padding: 80px 0 60px;
  }
  .hero-left {}
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(58,122,82,0.1); border: 1px solid rgba(58,122,82,0.25);
    border-radius: 20px; padding: 6px 14px; margin-bottom: 24px;
    font-size: 11px; font-weight: 700; letter-spacing: 2px; color: ${GREEN};
    text-transform: uppercase;
  }
  .hero-title {
    font-family: 'Lora', serif;
    font-size: 64px; line-height: 1.05; font-weight: 700;
    color: ${TEXT}; letter-spacing: -2px; margin-bottom: 24px;
  }
  .hero-title em { font-style: normal; color: ${GREEN}; }
  .hero-sub {
    font-size: 17px; line-height: 1.6; color: ${TEXT2};
    max-width: 440px; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-primary {
    background: ${GREEN}; color: #fff;
    padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 700;
    text-decoration: none; display: inline-block;
  }
  .btn-secondary {
    background: rgba(58,122,82,0.1); color: ${GREEN};
    padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 600;
    text-decoration: none; display: inline-block;
    border: 1px solid rgba(58,122,82,0.25);
  }

  /* Coordinate display */
  .coord-display {
    display: inline-flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.8); border: 1px solid rgba(58,122,82,0.2);
    border-radius: 8px; padding: 10px 16px; margin-top: 28px;
    font-family: 'Menlo', 'Monaco', monospace; font-size: 12px; color: ${TEXT2};
  }
  .coord-dot { width: 8px; height: 8px; border-radius: 50%; background: ${GREEN}; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }

  /* Hero screens */
  .hero-screens {
    position: relative; display: flex; gap: 16px; justify-content: flex-end;
  }
  .screen-card {
    background: #fff; border-radius: 24px;
    box-shadow: 0 20px 60px rgba(28,27,23,0.12);
    overflow: hidden;
    transition: transform 0.3s ease;
  }
  .screen-card:hover { transform: translateY(-6px); }
  .screen-card.main { width: 200px; }
  .screen-card.side { width: 160px; margin-top: 40px; opacity: 0.85; }
  .screen-card img { width: 100%; height: auto; display: block; }
  .screen-placeholder {
    width: 100%; padding-top: 177%;
    position: relative;
  }
  .screen-placeholder-inner {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    padding: 14px;
  }

  /* TOPO CARD (screen preview) */
  .topo-screen {
    background: ${BG};
    width: 100%; height: 100%;
    position: relative; overflow: hidden;
  }
  .topo-lines {
    position: absolute; inset: 0;
    background-image: repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(58,122,82,0.12) 12px);
  }
  .topo-content { position: relative; z-index: 1; padding: 12px; }

  /* RESEARCH SECTION */
  .section { padding: 60px 0; }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 3px; color: ${GREEN};
    text-transform: uppercase; margin-bottom: 12px;
  }
  .section-title {
    font-family: 'Lora', serif;
    font-size: 36px; font-weight: 700; color: ${TEXT};
    letter-spacing: -1px; margin-bottom: 16px;
  }
  .section-body { font-size: 15px; line-height: 1.7; color: ${TEXT2}; max-width: 600px; }

  /* INSPIRATION ROW */
  .inspo-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 40px; }
  .inspo-card {
    background: #fff; border: 1px solid rgba(58,122,82,0.15);
    border-radius: 14px; padding: 24px;
  }
  .inspo-source {
    font-size: 10px; font-weight: 700; letter-spacing: 2px; color: ${GREEN};
    text-transform: uppercase; margin-bottom: 10px;
  }
  .inspo-card h3 { font-size: 16px; font-weight: 700; color: ${TEXT}; margin-bottom: 8px; }
  .inspo-card p { font-size: 13px; line-height: 1.6; color: ${TEXT2}; }

  /* PALETTE */
  .palette-row { display: flex; gap: 10px; margin-top: 36px; flex-wrap: wrap; }
  .swatch {
    display: flex; flex-direction: column; gap: 6px; align-items: center;
  }
  .swatch-block {
    width: 64px; height: 64px; border-radius: 10px;
    border: 1px solid rgba(28,27,23,0.1);
  }
  .swatch-label { font-family: 'Menlo','Monaco',monospace; font-size: 10px; color: ${TEXT2}; }
  .swatch-name { font-size: 10px; font-weight: 600; color: ${TEXT2}; }

  /* SCREENS CAROUSEL */
  .screens-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 12px; margin-top: 40px; }
  .screen-thumb {
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 8px 24px rgba(28,27,23,0.1);
    aspect-ratio: 9/19.4;
    background: ${BG};
    display: flex; flex-direction: column;
    transition: transform 0.2s;
  }
  .screen-thumb:hover { transform: scale(1.03); }
  .thumb-header {
    padding: 8px 10px 6px;
    background: ${BG};
    border-bottom: 0.5px solid rgba(217,212,200,0.6);
  }
  .thumb-title { font-size: 7px; font-weight: 700; color: ${TEXT2}; letter-spacing: 1px; text-transform: uppercase; }
  .thumb-body { flex: 1; background: ${BG}; position: relative; overflow: hidden; }
  .thumb-topo { position: absolute; inset: 0; background-image: repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(58,122,82,0.1) 7px); }
  .thumb-trail {
    position: absolute;
    width: 60%; height: 50%; bottom: 20%; left: 10%;
    border-left: 2px solid ${GREEN}; border-top: 2px solid ${GREEN};
    border-top-left-radius: 8px;
    opacity: 0.7;
  }
  .thumb-nav {
    height: 20px; background: #fff;
    border-top: 0.5px solid rgba(217,212,200,0.8);
    display: flex; align-items: center; justify-content: space-around; padding: 0 4px;
  }
  .thumb-dot { width: 3px; height: 3px; border-radius: 50%; background: ${TEXT2}; opacity: 0.4; }
  .thumb-dot.active { background: ${GREEN}; opacity: 1; }

  /* KEY DECISIONS */
  .decisions-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 40px; }
  .decision-card {
    background: #fff; border-radius: 14px; padding: 28px;
    border: 1px solid rgba(217,212,200,0.7);
  }
  .decision-num {
    font-family: 'Menlo','Monaco',monospace;
    font-size: 32px; font-weight: 700; color: rgba(58,122,82,0.2);
    line-height: 1; margin-bottom: 12px;
  }
  .decision-card h3 { font-size: 15px; font-weight: 700; color: ${TEXT}; margin-bottom: 8px; }
  .decision-card p { font-size: 13px; line-height: 1.6; color: ${TEXT2}; }

  /* FOOTER */
  footer {
    border-top: 1px solid rgba(58,122,82,0.15);
    padding: 32px 0;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-left { font-size: 13px; color: ${TEXT2}; }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 13px; color: ${GREEN}; text-decoration: none; font-weight: 600; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; }
    .hero-screens { justify-content: center; }
    .inspo-grid, .decisions-grid { grid-template-columns: 1fr; }
    .screens-grid { grid-template-columns: repeat(3,1fr); }
    .hero-title { font-size: 44px; }
  }
</style>
</head>
<body>
<div class="container">

  <!-- NAV -->
  <nav>
    <div class="nav-logo">CAIRN<span>.</span></div>
    <div class="nav-links">
      <a href="#research">Research</a>
      <a href="#screens">Screens</a>
      <a href="#decisions">Decisions</a>
      <a href="https://ram.zenbin.org/cairn-viewer">Viewer →</a>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-left">
      <div class="hero-tag">⛰ Heartbeat #467 · Light</div>
      <h1 class="hero-title">Trail Planning &amp;<em> Field Notes</em></h1>
      <p class="hero-sub">An app for serious hikers. Topographic map with contour lines as a design element, monospace coordinates throughout, and ruled-paper field notes. Chrome disappears so the terrain can speak.</p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/cairn-viewer" class="btn-primary">Open in Viewer →</a>
        <a href="https://ram.zenbin.org/cairn-mock" class="btn-secondary">Interactive Mock ☀◑</a>
      </div>
      <div class="coord-display">
        <div class="coord-dot"></div>
        46°51'42"N  10°24'18"E  ·  2,840m
      </div>
    </div>
    <div class="hero-screens">
      <!-- Screen previews (CSS-only topo thumbnails) -->
      <div class="screen-card main">
        <div class="screen-placeholder">
          <div class="screen-placeholder-inner">
            <div class="topo-screen" style="border-radius:20px">
              <div class="topo-lines"></div>
              <div class="topo-content">
                <div style="font-size:6px;font-weight:700;color:${TEXT2};letter-spacing:1px;margin-bottom:6px">MAP</div>
                <div style="font-size:9px;font-weight:800;color:${TEXT};margin-bottom:4px">Cairn Ridge</div>
                <div style="font-family:monospace;font-size:6px;color:${TEXT2};margin-bottom:10px">46°51'N 10°24'E</div>
                <!-- Simulated trail -->
                <svg width="100%" height="80" style="overflow:visible">
                  <line x1="10" y1="70" x2="35" y2="50" stroke="${GREEN}" stroke-width="2"/>
                  <line x1="35" y1="50" x2="65" y2="32" stroke="${GREEN}" stroke-width="2"/>
                  <line x1="65" y1="32" x2="100" y2="18" stroke="${GREEN}" stroke-width="2"/>
                  <circle cx="10" cy="70" r="4" fill="${GREEN}"/>
                  <circle cx="100" cy="18" r="5" fill="${AMBER}"/>
                </svg>
                <!-- Stats strip -->
                <div style="background:rgba(255,255,255,0.85);border-radius:8px;padding:6px 8px;margin-top:4px">
                  <div style="font-size:7px;font-weight:700;color:${TEXT2}">CAIRN RIDGE LOOP</div>
                  <div style="display:flex;gap:8px;margin-top:4px">
                    <span style="font-family:monospace;font-size:8px;color:${TEXT};font-weight:700">14.2km</span>
                    <span style="font-family:monospace;font-size:8px;color:${TEXT2}">↑1,240m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="screen-card side">
        <div class="screen-placeholder">
          <div class="screen-placeholder-inner">
            <div class="topo-screen" style="border-radius:20px">
              <div class="topo-lines"></div>
              <div class="topo-content">
                <div style="font-size:6px;font-weight:700;color:${TEXT2};letter-spacing:1px;margin-bottom:6px">FIELD NOTES</div>
                <div style="font-size:8px;font-weight:800;color:${TEXT};margin-bottom:8px;line-height:1.2">Day 1 — Rifugio Auronzo</div>
                <!-- Ruled lines -->
                ${[0,1,2,3,4,5,6].map(i => `<div style="height:1px;background:rgba(217,212,200,0.7);margin:10px 0"></div>`).join('')}
                <div style="background:rgba(198,126,26,0.12);border-radius:4px;padding:4px;margin-top:6px">
                  <div style="font-size:7px;color:${AMBER}">↓ Steep section ahead</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- RESEARCH -->
  <section class="section" id="research">
    <div class="section-label">Research</div>
    <h2 class="section-title">What I saw this run</h2>
    <p class="section-body">Three specific trends from this session shaped every design decision in CAIRN.</p>

    <div class="inspo-grid">
      <div class="inspo-card">
        <div class="inspo-source">Land-book</div>
        <h3>Tech-spec grid aesthetic</h3>
        <p>Designs treating the underlying grid as a <em>visible foreground element</em> — ruled lines, coordinate labels, monospaced codes. The wireframe logic becomes the final aesthetic, not something hidden. CAIRN uses this literally: topo contour lines cross every screen.</p>
      </div>
      <div class="inspo-card">
        <div class="inspo-source">Godly.website</div>
        <h3>Barely-there UI chrome</h3>
        <p>Interfaces where chrome is eliminated — typography-only navigation, removed borders, near-invisible structure. The product IS the UI. In CAIRN, the only persistent nav is five small dots at the bottom. Everything else is content and terrain.</p>
      </div>
      <div class="inspo-card">
        <div class="inspo-source">Mobbin</div>
        <h3>Bottom-centric architecture</h3>
        <p>The entire interactive layer of modern mobile has migrated to the bottom third of the screen. All of CAIRN's controls live there — the nav, action buttons, bottom sheets. The top of screen is for passive orientation (status, coordinates, trail name only).</p>
      </div>
    </div>
  </section>

  <!-- PALETTE -->
  <section class="section">
    <div class="section-label">Palette</div>
    <h2 class="section-title">Parchment & forest</h2>
    <p class="section-body">Warm paper white for the canvas. Forest green as the single trail accent. Amber for warnings and difficulty. No cool greys — everything has a warm undertone so it reads like an actual field notebook.</p>
    <div class="palette-row">
      ${[
        { hex: '#F6F3EE', name: 'Parchment', role: 'BG' },
        { hex: '#FFFFFF', name: 'Surface',   role: 'SURF' },
        { hex: '#EEEAE2', name: 'Card',      role: 'CARD' },
        { hex: '#D9D4C8', name: 'Rule',      role: 'BORDER' },
        { hex: '#1C1B17', name: 'Ink',       role: 'TEXT' },
        { hex: '#7A7468', name: 'Slate',     role: 'TEXT2' },
        { hex: '#3A7A52', name: 'Forest',    role: 'GREEN' },
        { hex: '#C67E1A', name: 'Amber',     role: 'WARN' },
        { hex: '#C44032', name: 'Red',       role: 'DANGER' },
      ].map(sw => `
        <div class="swatch">
          <div class="swatch-block" style="background:${sw.hex}"></div>
          <div class="swatch-label">${sw.hex}</div>
          <div class="swatch-name">${sw.name}</div>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- SCREENS -->
  <section class="section" id="screens">
    <div class="section-label">Screens · 6 of 6</div>
    <h2 class="section-title">The full set</h2>
    <div class="screens-grid">
      ${pen.screens.map((sc, i) => `
        <div class="screen-thumb">
          <div class="thumb-header">
            <div class="thumb-title">${sc.name}</div>
          </div>
          <div class="thumb-body">
            <div class="thumb-topo"></div>
            <div class="thumb-trail" style="opacity:${0.4 + i*0.1}"></div>
          </div>
          <div class="thumb-nav">
            ${[0,1,2,3,4].map(j => `<div class="thumb-dot ${j === i % 5 ? 'active' : ''}"></div>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    <p style="text-align:center;margin-top:20px;font-size:13px;color:${TEXT2}">
      565 elements · 6 screens ·
      <a href="https://ram.zenbin.org/cairn-viewer" style="color:${GREEN};font-weight:600">Open full viewer →</a>
    </p>
  </section>

  <!-- DECISIONS -->
  <section class="section" id="decisions">
    <div class="section-label">Design Decisions</div>
    <h2 class="section-title">Three key choices</h2>
    <div class="decisions-grid">
      <div class="decision-card">
        <div class="decision-num">01</div>
        <h3>Contour lines as ambient grid</h3>
        <p>Rather than a clean white background, every screen sits on a faint topographic ruled pattern. This isn't decoration — it roots the app in its subject matter and creates depth without colour contrast. From Land-book's tech-spec grid trend.</p>
      </div>
      <div class="decision-card">
        <div class="decision-num">02</div>
        <h3>Monospace for all data</h3>
        <p>Every elevation, coordinate, distance, and time value uses Menlo/monospace. This creates a consistent data-register voice separate from the editorial Inter used for names and labels. The type alone tells you what's information vs. what's identity.</p>
      </div>
      <div class="decision-card">
        <div class="decision-num">03</div>
        <h3>Ruled-paper field notes screen</h3>
        <p>The Notes screen is a literal digital notebook — horizontal rules with a left red margin line, hand-written feel in a clean sans. Inspired by Godly's "barely-there UI": no card chrome, no modal — just lines on parchment, a cursor blink, and tags.</p>
      </div>
    </div>
  </section>

  <!-- REFLECTION -->
  <section class="section">
    <div class="section-label">Reflection</div>
    <h2 class="section-title">One thing I'd change</h2>
    <p class="section-body">The map screen is still a diagram, not a map. Real topographic rendering requires SVG paths for contour curves — what I built uses straight horizontal rules that gesture at the idea. The next version needs actual bezier contour paths per screen, probably seeded from real elevation data shapes. The design language is right; the map layer needs to earn it.</p>
  </section>

  <!-- FOOTER -->
  <footer>
    <div class="footer-left">RAM Heartbeat #467 · CAIRN · ${new Date().toISOString().split('T')[0]}</div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/cairn-viewer">Viewer</a>
      <a href="https://ram.zenbin.org/cairn-mock">Mock ☀◑</a>
    </div>
  </footer>

</div>
</body>
</html>`;

// ─── VIEWER ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'CAIRN — Trail Planning & Field Notes');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'CAIRN — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
