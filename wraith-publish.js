'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'wraith';

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

// ─── Palette ─────────────────────────────────────────────────
const C = {
  bg:      '#080B10',
  surf:    '#0D1117',
  card:    '#161B24',
  card2:   '#1C2333',
  border:  '#21293A',
  accent:  '#39D353',
  accent2: '#58A6FF',
  accent3: '#F78166',
  accent4: '#E3B341',
  text:    '#CDD9E5',
  textDim: '#8B98A5',
  white:   '#E6EDF3',
  mutedTxt:'#7D8FA1',
};

// ─── Hero HTML ────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WRAITH — Network Intelligence Monitor</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      ${C.bg};
    --surf:    ${C.surf};
    --card:    ${C.card};
    --card2:   ${C.card2};
    --border:  ${C.border};
    --green:   ${C.accent};
    --blue:    ${C.accent2};
    --red:     ${C.accent3};
    --amber:   ${C.accent4};
    --text:    ${C.text};
    --dim:     ${C.textDim};
    --white:   ${C.white};
    --muted:   ${C.mutedTxt};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ─── Ambient glow ─────────────────────────── */
  .ambient {
    position: fixed; top: -20vh; left: 50%;
    transform: translateX(-50%);
    width: 800px; height: 400px;
    background: radial-gradient(ellipse, rgba(57,211,83,0.06) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .ambient-blue {
    position: fixed; bottom: -10vh; right: -10vw;
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(88,166,255,0.05) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  /* ─── Nav ──────────────────────────────────── */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    height: 52px;
    background: rgba(8,11,16,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 32px;
    z-index: 100;
    gap: 12px;
  }
  .nav-logo {
    font-size: 13px; font-weight: 700;
    color: var(--green); letter-spacing: 3px;
    display: flex; align-items: center; gap: 8px;
  }
  .nav-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .nav-live { font-size: 9px; color: var(--green); letter-spacing: 2px; font-weight: 600; }
  .nav-spacer { flex: 1; }
  .nav-time { font-size: 11px; color: var(--muted); letter-spacing: 2px; }
  .nav-hb { font-size: 9px; color: var(--border); letter-spacing: 1px; }

  /* ─── Hero ─────────────────────────────────── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 120px 24px 80px;
    position: relative; z-index: 1; text-align: center;
  }
  .hero-eyebrow {
    font-size: 9px; letter-spacing: 4px; font-weight: 600;
    color: var(--green);
    border: 1px solid rgba(57,211,83,0.25);
    padding: 6px 16px; border-radius: 20px;
    margin-bottom: 36px;
    display: inline-block;
    background: rgba(57,211,83,0.04);
  }
  .hero-title {
    font-size: clamp(52px, 10vw, 96px);
    font-weight: 800; letter-spacing: 8px;
    color: var(--white);
    line-height: 1;
    margin-bottom: 12px;
  }
  .hero-title span { color: var(--green); }
  .hero-tagline {
    font-size: 13px; letter-spacing: 3px; font-weight: 400;
    color: var(--dim); margin-bottom: 60px;
  }

  /* Threat level ticker */
  .threat-ticker {
    display: grid; grid-template-columns: repeat(5, 1fr);
    gap: 6px; margin-bottom: 64px;
    width: min(360px, 90vw);
  }
  .threat-segment {
    height: 6px; border-radius: 3px;
    background: var(--border);
  }
  .threat-segment.active-1 { background: var(--green); }
  .threat-segment.active-2 { background: var(--amber); }
  .threat-segment.active-3 { background: var(--amber); }
  .threat-segment.active-4 { background: var(--red); }

  /* Stats row */
  .stats-row {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px; border: 1px solid var(--border);
    border-radius: 8px; overflow: hidden;
    width: min(600px, 90vw); margin-bottom: 48px;
  }
  .stat-cell {
    padding: 20px 16px; background: var(--surf);
    text-align: center;
    border-right: 1px solid var(--border);
  }
  .stat-cell:last-child { border-right: none; }
  .stat-val { font-size: 20px; font-weight: 700; color: var(--white); display: block; }
  .stat-lbl { font-size: 8px; letter-spacing: 2px; color: var(--dim); margin-top: 4px; display: block; font-weight: 600; }

  .hero-cta {
    display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: center;
  }
  .btn-primary {
    padding: 12px 28px; border-radius: 6px;
    background: var(--green); color: var(--bg);
    font-family: inherit; font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-decoration: none;
    border: none; cursor: pointer;
    transition: opacity .2s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-ghost {
    padding: 12px 28px; border-radius: 6px;
    border: 1px solid var(--border);
    color: var(--dim); background: transparent;
    font-family: inherit; font-size: 10px; font-weight: 600;
    letter-spacing: 2px; text-decoration: none;
    transition: border-color .2s, color .2s;
  }
  .btn-ghost:hover { border-color: var(--blue); color: var(--blue); }

  /* ─── Screen carousel ──────────────────────── */
  .screens-section {
    padding: 80px 24px; position: relative; z-index: 1;
    max-width: 1200px; margin: 0 auto;
  }
  .section-header {
    display: flex; align-items: baseline; gap: 16px;
    margin-bottom: 32px;
  }
  .section-label {
    font-size: 9px; letter-spacing: 3px; font-weight: 700;
    color: var(--muted);
  }
  .section-line {
    flex: 1; height: 1px; background: var(--border);
  }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
  .screen-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px; overflow: hidden;
    transition: border-color .2s, transform .2s;
    cursor: pointer;
  }
  .screen-card:hover { border-color: var(--green); transform: translateY(-2px); }
  .screen-thumb {
    width: 100%; aspect-ratio: 390/844;
    background: var(--surf);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    position: relative;
  }
  .screen-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .screen-preview {
    padding: 12px 14px 14px;
    border-top: 1px solid var(--border);
  }
  .screen-name { font-size: 10px; font-weight: 700; color: var(--white); letter-spacing: 1px; }
  .screen-cnt { font-size: 8px; color: var(--dim); margin-top: 2px; }

  /* SVG preview frame */
  .frame-svg {
    width: 100%; height: 100%;
    background: ${C.bg};
  }

  /* ─── Features ─────────────────────────────── */
  .features-section {
    padding: 80px 24px; position: relative; z-index: 1;
    max-width: 900px; margin: 0 auto;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }
  .feature-card {
    padding: 24px; border-radius: 8px;
    background: var(--surf); border: 1px solid var(--border);
    transition: border-color .2s;
  }
  .feature-card:hover { border-color: rgba(88,166,255,0.3); }
  .feature-icon { font-size: 22px; margin-bottom: 14px; }
  .feature-title { font-size: 11px; font-weight: 700; color: var(--white); letter-spacing: 1.5px; margin-bottom: 8px; }
  .feature-desc { font-size: 10px; color: var(--dim); line-height: 1.7; }

  /* ─── Palette ──────────────────────────────── */
  .palette-section {
    padding: 60px 24px; position: relative; z-index: 1;
    max-width: 900px; margin: 0 auto;
  }
  .palette-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px; }
  .swatch {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px;
  }
  .swatch-block { width: 52px; height: 52px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.07); }
  .swatch-hex { font-size: 8px; color: var(--dim); letter-spacing: 1px; }

  /* ─── Inspiration ──────────────────────────── */
  .inspiration-section {
    padding: 60px 24px 80px; position: relative; z-index: 1;
    max-width: 700px; margin: 0 auto;
  }
  .inspo-card {
    padding: 28px; border-radius: 8px;
    background: var(--card); border: 1px solid var(--border);
    border-left: 3px solid var(--green);
  }
  .inspo-source { font-size: 9px; color: var(--green); letter-spacing: 2px; font-weight: 700; margin-bottom: 12px; }
  .inspo-text { font-size: 11px; color: var(--text); line-height: 1.8; }

  /* ─── Footer ───────────────────────────────── */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
    position: relative; z-index: 1;
  }
  .footer-brand { font-size: 11px; color: var(--dim); letter-spacing: 2px; }
  .footer-links { display: flex; gap: 20px; }
  .footer-link { font-size: 9px; color: var(--dim); text-decoration: none; letter-spacing: 1.5px; transition: color .2s; }
  .footer-link:hover { color: var(--green); }
  .footer-hb { font-size: 9px; color: var(--border); letter-spacing: 2px; }

  /* Terminal blink cursor */
  .blink { animation: blink 1.2s step-end infinite; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  /* Alert badge */
  .alert-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 4px;
    font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
    margin-bottom: 16px;
  }
  .badge-crit { background: rgba(247,129,102,0.12); color: var(--red); border: 1px solid rgba(247,129,102,0.3); }
  .badge-warn { background: rgba(227,179,65,0.12); color: var(--amber); border: 1px solid rgba(227,179,65,0.3); }
  .badge-ok   { background: rgba(57,211,83,0.10); color: var(--green); border: 1px solid rgba(57,211,83,0.25); }

  @media (max-width: 600px) {
    .hero-title { font-size: 48px; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 0 16px; }
    footer { flex-direction: column; align-items: flex-start; }
  }
</style>
</head>
<body>
<div class="ambient"></div>
<div class="ambient-blue"></div>

<!-- Nav -->
<nav>
  <div class="nav-logo">
    ⬡ WRAITH
    <div class="nav-dot"></div>
    <span class="nav-live">LIVE</span>
  </div>
  <div class="nav-spacer"></div>
  <span class="nav-time" id="clock">--:--:--</span>
  <span class="nav-hb">HB#53</span>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-eyebrow">RAM HEARTBEAT #53 — DARK</div>
  <h1 class="hero-title">W<span>R</span>AITH</h1>
  <p class="hero-tagline">NETWORK INTELLIGENCE MONITOR</p>

  <div class="threat-ticker" title="Current threat level: 2/5 — Elevated">
    <div class="threat-segment active-2"></div>
    <div class="threat-segment active-2"></div>
    <div class="threat-segment"></div>
    <div class="threat-segment"></div>
    <div class="threat-segment"></div>
  </div>
  <div style="font-size:9px; letter-spacing:3px; color:var(--amber); margin-top:-48px; margin-bottom:48px; font-weight:700;">THREAT LEVEL 2 / 5 — ELEVATED</div>

  <div class="stats-row">
    <div class="stat-cell">
      <span class="stat-val" style="color:var(--text)">247</span>
      <span class="stat-lbl">HOSTS</span>
    </div>
    <div class="stat-cell">
      <span class="stat-val" style="color:var(--blue)">14.2K</span>
      <span class="stat-lbl">EVENTS/MIN</span>
    </div>
    <div class="stat-cell">
      <span class="stat-val" style="color:var(--red)">12</span>
      <span class="stat-lbl">ALERTS</span>
    </div>
    <div class="stat-cell">
      <span class="stat-val" style="color:var(--green)">99.8%</span>
      <span class="stat-lbl">UPTIME</span>
    </div>
  </div>

  <div class="hero-cta">
    <a href="https://ram.zenbin.org/wraith-viewer" class="btn-primary">OPEN VIEWER</a>
    <a href="https://ram.zenbin.org/wraith-mock" class="btn-ghost">INTERACTIVE MOCK ☀◑</a>
  </div>
</section>

<!-- Screens -->
<section class="screens-section">
  <div class="section-header">
    <span class="section-label">6 SCREENS — 939 ELEMENTS</span>
    <div class="section-line"></div>
  </div>
  <div class="screens-grid">
${pen.screens.map((s, i) => `    <div class="screen-card">
      <div class="screen-thumb">
        <svg class="frame-svg" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
          <rect width="390" height="844" fill="${C.bg}"/>
          ${s.elements.slice(0, 60).map(el => {
            if (el.type === 'rect') return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
            if (el.type === 'text') return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" text-anchor="${el.textAnchor||'start'}" opacity="${el.opacity||1}" font-family="${el.fontFamily||'monospace'}">${String(el.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
            if (el.type === 'circle') return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
            if (el.type === 'line') return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
            return '';
          }).join('\n          ')}
        </svg>
      </div>
      <div class="screen-preview">
        <div class="screen-name">${s.name.toUpperCase()}</div>
        <div class="screen-cnt">${s.elementCount} elements</div>
      </div>
    </div>`).join('\n')}
  </div>
</section>

<!-- Features -->
<section class="features-section">
  <div class="section-header">
    <span class="section-label">CAPABILITIES</span>
    <div class="section-line"></div>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">COMMAND OVERVIEW</div>
      <div class="feature-desc">Live threat level indicator (1–5 scale), network heatmap grid, top active connections with anomaly flagging.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◉</div>
      <div class="feature-title">SIGNAL FEED</div>
      <div class="feature-desc">Real-time alert stream filtered by severity. CRIT/WARN/INFO classification with source attribution and timestamps.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▦</div>
      <div class="feature-title">HOST ROSTER</div>
      <div class="feature-desc">Full inventory of 247 monitored hosts. Status indicators, per-host CPU and memory utilisation at a glance.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◫</div>
      <div class="feature-title">TELEMETRY</div>
      <div class="feature-desc">Live sparklines for throughput, per-core CPU bars, memory breakdown. P99 latency and error rate tracked in real time.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≡</div>
      <div class="feature-title">LOG STREAM</div>
      <div class="feature-desc">Terminal-style monospace log viewer with ERR/WRN/INF/DBG classification, alternating row banding, pause/resume.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊕</div>
      <div class="feature-title">THREAT INTEL</div>
      <div class="feature-desc">Attack origin dot-map, flagged IPs with threat scores (0–100), OSINT feed status from AbuseIPDB, Shodan, GreyNoise.</div>
    </div>
  </div>
</section>

<!-- Palette -->
<section class="palette-section">
  <div class="section-header">
    <span class="section-label">PALETTE — SURVEILLANCE DARK</span>
    <div class="section-line"></div>
  </div>
  <div class="palette-row">
    ${[
      { color: C.bg,      label: 'BG' },
      { color: C.surf,    label: 'SURF' },
      { color: C.card,    label: 'CARD' },
      { color: C.card2,   label: 'CARD-2' },
      { color: C.border,  label: 'BORDER' },
      { color: C.accent,  label: 'GREEN' },
      { color: C.accent2, label: 'BLUE' },
      { color: C.accent3, label: 'RED' },
      { color: C.accent4, label: 'AMBER' },
      { color: C.text,    label: 'TEXT' },
    ].map(s => `<div class="swatch">
      <div class="swatch-block" style="background:${s.color}"></div>
      <span class="swatch-hex">${s.label}</span>
    </div>`).join('')}
  </div>
</section>

<!-- Inspiration -->
<section class="inspiration-section">
  <div class="section-header">
    <span class="section-label">INSPIRATION</span>
    <div class="section-line"></div>
  </div>
  <div class="inspo-card">
    <div class="inspo-source">↗ DARKMODEDESIGN.COM + GODLY.WEBSITE</div>
    <p class="inspo-text">
      Browsing DarkModeDesign revealed the craft of stepped elevation — base #080B10 / cards #161B24 —
      creating depth through darkness rather than shadows or borders.
      Godly's "Surveillance Aesthetic" trend (X-ray overlays, CCTV-grid compositions,
      brutalist data-display typography) became the structural metaphor:
      a network monitor that feels like a real ops console, not a polished SaaS dashboard.
      Terminal green (#39D353) desaturated just enough to avoid neon, paired with electric blue (#58A6FF)
      for secondary data — a colour language borrowed from classic terminal interfaces
      filtered through 2026 dark-mode craft standards.
    </p>
  </div>
</section>

<!-- Footer -->
<footer>
  <div class="footer-brand">⬡ WRAITH — RAM DESIGN SYSTEM</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/wraith-viewer" class="footer-link">VIEWER</a>
    <a href="https://ram.zenbin.org/wraith-mock" class="footer-link">MOCK</a>
  </div>
  <div class="footer-hb">RAM · HB#53 · ${new Date().toISOString().split('T')[0]}</div>
</footer>

<script>
  function tick() {
    const now = new Date();
    document.getElementById('clock').textContent =
      [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2,'0')).join(':');
  }
  tick();
  setInterval(tick, 1000);
</script>
</body>
</html>`;

// ─── Viewer page ──────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, 'WRAITH — Network Intelligence Monitor');
  console.log(`Hero:   ${r1.status}  ${r1.status === 201 ? '✓' : r1.body.slice(0,80)}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'WRAITH — Design Viewer');
  console.log(`Viewer: ${r2.status}  ${r2.status === 201 ? '✓' : r2.body.slice(0,80)}`);
}

main().catch(console.error);
