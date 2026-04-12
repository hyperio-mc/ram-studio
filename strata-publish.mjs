// strata-publish.mjs — STRATA hero + viewer + mock + gallery
import fs from 'fs';
import https from 'https';
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const SLUG      = 'strata';
const APP_NAME  = 'STRATA';
const TAGLINE   = 'Soil intelligence, season after season.';
const ARCHETYPE = 'precision-agriculture';
const PROMPT    = 'Dark-mode precision soil intelligence platform. Inspired by Genesis Soil Intelligence (land-book.com trending 2025) and Locomotive large-type editorial style (godly.website #958). Ultra-dark olive (#060A05) with electric chartreuse accent (#A3E635). 5 screens: Fields overview, Soil Profile, Live Sensors, AI Recommendations, Season Report.';

// ── ZenBin publish helper ─────────────────────────────────────────────────────
function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}` });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#060A05',
  surface:  '#0C1209',
  surface2: '#111C0E',
  text:     '#DDF0D6',
  muted:    'rgba(163,230,53,0.35)',
  accent:   '#A3E635',
  amber:    '#D97706',
  red:      '#F05454',
  blue:     '#38BDF8',
  border:   'rgba(36,59,28,0.9)',
};

// ══════════════════════════════════════════════════════════════════════════════
// HERO PAGE
// ══════════════════════════════════════════════════════════════════════════════
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>STRATA — Soil intelligence, season after season.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: ${P.bg}; --surface: ${P.surface}; --surface2: ${P.surface2};
  --text: ${P.text}; --muted: rgba(163,230,53,0.5);
  --accent: ${P.accent}; --amber: ${P.amber}; --red: ${P.red}; --blue: ${P.blue};
  --border: rgba(36,59,28,0.85);
}
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: 'Space Grotesk', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

/* organic grain texture overlay */
body::before {
  content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' x='1' y='1' fill='rgba(163,230,53,0.03)'/%3E%3C/svg%3E");
  pointer-events: none; z-index: 0;
}

/* NAV */
nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(6,10,5,0.85); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; height: 60px; }
.nav-logo { font-family: 'Space Mono', monospace; font-size: 17px; font-weight: 700; letter-spacing: 5px; color: var(--accent); text-decoration: none; }
.nav-links { display: flex; gap: 28px; }
.nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta { background: var(--accent); color: #060A05; font-size: 12px; font-weight: 800; padding: 8px 18px; border-radius: 20px; text-decoration: none; letter-spacing: 1px; font-family: 'Space Mono', monospace; }

/* SECTIONS */
.section { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 80px 32px; }
.section-eyebrow { font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }

/* HERO */
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: center;
  text-align: center; padding: 120px 32px 80px; position: relative; overflow: hidden; }
.hero-glow {
  position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
}
.hero-glow-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(163,230,53,0.12) 0%, transparent 70%); top: 10%; left: 50%; transform: translateX(-50%); }
.hero-glow-2 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 70%); bottom: 10%; right: 10%; }
.hero-inner { position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(163,230,53,0.1); border: 1px solid rgba(163,230,53,0.25); border-radius: 20px; padding: 6px 16px; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--accent); margin-bottom: 32px; font-family: 'Space Mono', monospace; }
.hero-title { font-size: clamp(72px, 12vw, 140px); font-weight: 900; letter-spacing: -2px; line-height: 0.9; color: var(--text); margin-bottom: 8px; }
.hero-title span { color: var(--accent); }
.hero-sub { font-size: clamp(16px, 3vw, 22px); color: var(--muted); max-width: 520px; margin: 24px auto 40px; font-weight: 400; line-height: 1.6; }
.hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.btn-primary { background: var(--accent); color: #060A05; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 28px; text-decoration: none; letter-spacing: 0.5px; transition: transform .15s, box-shadow .15s; font-family: 'Space Mono', monospace; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(163,230,53,0.3); }
.btn-ghost { background: transparent; color: var(--text); font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 28px; text-decoration: none; border: 1.5px solid var(--border); transition: border-color .15s; }
.btn-ghost:hover { border-color: rgba(163,230,53,0.4); }

/* METRICS ROW */
.metrics { display: flex; gap: 0; border: 1px solid var(--border); border-radius: 20px; overflow: hidden; margin-bottom: 40px; }
.metric { flex: 1; padding: 28px 20px; border-right: 1px solid var(--border); text-align: center; }
.metric:last-child { border-right: none; }
.metric-value { font-family: 'Space Mono', monospace; font-size: clamp(28px, 4vw, 44px); font-weight: 700; color: var(--accent); letter-spacing: -1px; }
.metric-label { font-size: 10px; font-weight: 700; letter-spacing: 2.5px; color: var(--muted); text-transform: uppercase; margin-top: 6px; }

/* SCREENS GRID */
.screens-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 40px; }
.screen-pill { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; transition: border-color .2s, transform .2s; cursor: default; }
.screen-pill:hover { border-color: rgba(163,230,53,0.35); transform: translateY(-3px); }
.screen-pill-icon { font-size: 20px; margin-bottom: 10px; }
.screen-pill-name { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; color: var(--text); letter-spacing: 1px; margin-bottom: 6px; }
.screen-pill-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }

/* SECTION TITLE */
.section-title { font-size: clamp(32px, 5vw, 56px); font-weight: 900; letter-spacing: -1px; line-height: 1.05; color: var(--text); margin-bottom: 16px; }
.section-title span { color: var(--accent); }

/* DESIGN DECISIONS */
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 40px; }
.decision-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
.decision-source { font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 2px; color: var(--accent); margin-bottom: 8px; text-transform: uppercase; }
.decision-label { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
.decision-text { font-size: 13px; color: var(--muted); line-height: 1.65; }

/* SOIL DEPTH VISUAL */
.soil-visual { border: 1px solid var(--border); border-radius: 20px; overflow: hidden; margin-top: 40px; }
.soil-layer { display: flex; align-items: center; gap: 20px; padding: 20px 24px; border-bottom: 1px solid var(--border); transition: background .2s; }
.soil-layer:last-child { border-bottom: none; }
.soil-layer:hover { background: var(--surface); }
.soil-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.soil-depth { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--muted); width: 80px; flex-shrink: 0; }
.soil-name { font-size: 13px; font-weight: 700; color: var(--text); flex: 1; }
.soil-bar-wrap { flex: 2; height: 6px; background: rgba(163,230,53,0.08); border-radius: 3px; overflow: hidden; }
.soil-bar-fill { height: 100%; border-radius: 3px; }
.soil-val { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; width: 48px; text-align: right; }

/* CTA SECTION */
.cta-section { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 100px 32px; text-align: center; position: relative; overflow: hidden; }
.cta-section::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(163,230,53,0.08) 0%, transparent 70%); pointer-events: none; }
.cta-title { font-size: clamp(36px, 6vw, 68px); font-weight: 900; letter-spacing: -1.5px; color: var(--text); margin-bottom: 16px; }
.cta-sub { font-size: 16px; color: var(--muted); margin-bottom: 36px; max-width: 440px; margin-left: auto; margin-right: auto; }

/* FOOTER */
footer { padding: 40px 32px; text-align: center; border-top: 1px solid var(--border); }
.footer-logo { font-family: 'Space Mono', monospace; font-size: 20px; font-weight: 700; letter-spacing: 5px; color: var(--accent); margin-bottom: 10px; }
.footer-note { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.design-credit { font-size: 11px; color: rgba(163,230,53,0.3); }
.design-credit a { color: var(--accent); text-decoration: none; }

@media(max-width:600px) {
  nav { padding: 0 16px; }
  .section { padding: 60px 20px; }
  .metrics { flex-direction: column; }
  .metric { border-right: none; border-bottom: 1px solid var(--border); }
  .metric:last-child { border-bottom: none; }
}
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">STRATA</a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#decisions">Design</a>
    <a href="https://ram.zenbin.org/strata-mock">Mock</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/strata-viewer">View Screens →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-glow hero-glow-1"></div>
  <div class="hero-glow hero-glow-2"></div>
  <div class="hero-inner">
    <div class="hero-badge">◈ PRECISION AGRICULTURE INTELLIGENCE</div>
    <h1 class="hero-title">STRATA<br><span>Soil Intel.</span></h1>
    <p class="hero-sub">What lives beneath drives what grows above. Sensor-to-harvest intelligence for regenerative farms.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/strata-mock">Interactive mock →</a>
      <a class="btn-ghost" href="https://ram.zenbin.org/strata-viewer">View all screens</a>
    </div>
  </div>
</section>

<!-- METRICS -->
<div class="section">
  <div class="section-eyebrow">Platform overview</div>
  <div class="metrics">
    <div class="metric">
      <div class="metric-value">94%</div>
      <div class="metric-label">Farm Health Score</div>
    </div>
    <div class="metric">
      <div class="metric-value">12</div>
      <div class="metric-label">Active Fields</div>
    </div>
    <div class="metric">
      <div class="metric-value">+4%</div>
      <div class="metric-label">Yield vs Target</div>
    </div>
    <div class="metric">
      <div class="metric-value">68%</div>
      <div class="metric-label">Soil Moisture</div>
    </div>
  </div>
</div>

<!-- SCREENS -->
<div class="section" id="screens">
  <div class="section-eyebrow">Five screens</div>
  <h2 class="section-title">Every layer of your<br><span>farm, visible.</span></h2>
  <div class="screens-grid">
    <div class="screen-pill">
      <div class="screen-pill-icon">▣</div>
      <div class="screen-pill-name">Fields</div>
      <div class="screen-pill-desc">Health scores · field list · season banner · progress bars</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◈</div>
      <div class="screen-pill-name">Soil Profile</div>
      <div class="screen-pill-desc">0–90cm layers · pH per depth · organic matter · composition</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◉</div>
      <div class="screen-pill-name">Live Sensors</div>
      <div class="screen-pill-desc">Moisture · temp · conductivity · 24h sparkline trend</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◆</div>
      <div class="screen-pill-name">AI Actions</div>
      <div class="screen-pill-desc">Ranked recommendations · phosphorus alert · irrigation window</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◎</div>
      <div class="screen-pill-name">Season Report</div>
      <div class="screen-pill-desc">Yield vs target · crop performance · revenue · export</div>
    </div>
  </div>
</div>

<!-- SOIL DEPTH VISUAL -->
<div class="section">
  <div class="section-eyebrow">Soil layer architecture</div>
  <h2 class="section-title">Read the strata.<br><span>Act on the data.</span></h2>
  <div class="soil-visual">
    <div class="soil-layer">
      <div class="soil-dot" style="background:#A3E635;"></div>
      <div class="soil-depth">0–30 cm</div>
      <div class="soil-name">Topsoil · Rich &amp; Active</div>
      <div class="soil-bar-wrap"><div class="soil-bar-fill" style="width:84%;background:#A3E635;"></div></div>
      <div class="soil-val" style="color:#A3E635;">6.8 pH</div>
    </div>
    <div class="soil-layer">
      <div class="soil-dot" style="background:#D97706;"></div>
      <div class="soil-depth">30–60 cm</div>
      <div class="soil-name">Subsoil · Moderate Density</div>
      <div class="soil-bar-wrap"><div class="soil-bar-fill" style="width:61%;background:#D97706;"></div></div>
      <div class="soil-val" style="color:#D97706;">7.1 pH</div>
    </div>
    <div class="soil-layer">
      <div class="soil-dot" style="background:#3D5C35;"></div>
      <div class="soil-depth">60–90 cm</div>
      <div class="soil-name">Deep Layer · Clay Dominant</div>
      <div class="soil-bar-wrap"><div class="soil-bar-fill" style="width:38%;background:#3D5C35;"></div></div>
      <div class="soil-val" style="color:#3D5C35;">7.4 pH</div>
    </div>
  </div>
</div>

<!-- DESIGN DECISIONS -->
<div class="section" id="decisions">
  <div class="section-eyebrow">Design decisions</div>
  <h2 class="section-title">Why it looks the<br><span>way it does.</span></h2>
  <div class="feature-grid">
    <div class="decision-card">
      <div class="decision-source">land-book.com · Genesis Soil Intelligence · 2025</div>
      <div class="decision-label">Agricultural data as a design category</div>
      <div class="decision-text">Genesis Soil Intelligence by Felix Marquette appeared in land-book's top trending — 75 likes, a rare "data meets earth science" landing page. STRATA extends that visual language into a 5-screen mobile app, applying scientific data hierarchy to field-level decisions.</div>
    </div>
    <div class="decision-card">
      <div class="decision-source">godly.website #958 · Locomotive · Large Type</div>
      <div class="decision-label">Editorial giant numbers as UI elements</div>
      <div class="decision-text">Locomotive uses Helvetica Now Display at extreme sizes — "Large Type, Black &amp; White, Big Background Video." Every STRATA screen opens with a hero number (94 health score, 68% moisture, season +4%) displayed at 88–96px, borrowing editorial weight to make the most critical data instantly readable.</div>
    </div>
    <div class="decision-card">
      <div class="decision-source">darkmodedesign.com · Linear · Forge · 2026</div>
      <div class="decision-label">Ultra-dark olive — not generic charcoal</div>
      <div class="decision-text">While Linear uses #0F0F11 and Forge uses #080810, STRATA uses #060A05 — a near-void with a 2-point green tint. Combined with chartreuse accent (#A3E635), it creates an organic tension: technology rooted in earth. Amber and sky-blue appear only as functional secondary signals.</div>
    </div>
  </div>
</div>

<!-- CTA -->
<section class="cta-section">
  <h2 class="cta-title">Know your soil.<br>Grow with intent.</h2>
  <p class="cta-sub">Explore the interactive mock or walk through all five screens in the viewer.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/strata-mock">Interactive mock →</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/strata-viewer">Screen viewer</a>
  </div>
</section>

<footer>
  <div class="footer-logo">STRATA</div>
  <div class="footer-note">Designed March 2026 · land-book.com + godly.website + darkmodedesign.com</div>
  <div class="design-credit">By <a href="https://ram.zenbin.org">RAM</a> · Design Heartbeat</div>
</footer>

</body>
</html>`;

// ══════════════════════════════════════════════════════════════════════════════
// VIEWER HTML
// ══════════════════════════════════════════════════════════════════════════════
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>STRATA — Screen Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #030603; font-family: 'Space Mono', monospace; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; padding: 40px 16px; }
  h1 { font-size: 22px; font-weight: 700; letter-spacing: 5px; color: #A3E635; margin-bottom: 6px; }
  p  { font-size: 12px; color: rgba(163,230,53,0.45); margin-bottom: 28px; letter-spacing: 1px; }
  #screen-nav { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 32px; }
  .screen-btn { background: #0C1209; border: 1.5px solid rgba(36,59,28,0.85); color: #DDF0D6;
    font-size: 11px; font-weight: 700; padding: 7px 16px; border-radius: 20px;
    cursor: pointer; transition: all .15s; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; }
  .screen-btn.active { background: #A3E635; border-color: #A3E635; color: #060A05; }
  #render { width: 390px; height: 844px; background: #060A05;
    border: 1.5px solid rgba(36,59,28,0.85); border-radius: 28px; overflow: hidden;
    box-shadow: 0 8px 60px rgba(163,230,53,0.08); position: relative; }
  .loading { padding: 40px; text-align: center; color: rgba(163,230,53,0.4); font-size: 13px; }
</style>
</head>
<body>
<h1>STRATA</h1>
<p>SOIL INTELLIGENCE · SEASON AFTER SEASON</p>
<div id="screen-nav"></div>
<div id="render"><div class="loading">Loading...</div></div>
<script>
window.STRATA_PLACEHOLDER = true;
</script>
<script>
(function() {
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderNode(node, offsetX, offsetY) {
    if (!node) return '';
    const x = (node.x||0) + offsetX;
    const y = (node.y||0) + offsetY;
    const w = node.width||0;
    const h = node.height||0;
    const fill = node.fill || 'transparent';
    const opacity = node.opacity !== undefined ? node.opacity : 1;
    let html = '';

    if (node.type === 'frame') {
      let borderCss = '';
      if (node.stroke) borderCss = 'border:' + (node.stroke.thickness||1) + 'px solid ' + node.stroke.fill + ';';
      const cr = node.cornerRadius || 0;
      const clipCss = node.clip ? 'overflow:hidden;' : '';
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background:'+fill+';border-radius:'+cr+'px;'+borderCss+clipCss+'opacity:'+opacity+';">';
      if (node.children) for (const child of node.children) html += renderNode(child, 0, 0);
      html += '</div>';
    }
    else if (node.type === 'text') {
      const fs = node.fontSize || 13;
      const fw = node.fontWeight || '400';
      const align = node.textAlign || 'left';
      const ls = node.letterSpacing ? 'letter-spacing:'+node.letterSpacing+'px;' : '';
      const lh = node.lineHeight ? 'line-height:'+node.lineHeight+'px;' : 'line-height:1.3;';
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;font-size:'+fs+'px;font-weight:'+fw+';color:'+fill+';text-align:'+align+';'+ls+lh+'overflow:hidden;opacity:'+opacity+';white-space:pre-wrap;word-break:break-word;font-family:system-ui,sans-serif;">'+esc(node.content||'')+'</div>';
    }
    else if (node.type === 'ellipse') {
      let borderCss = '';
      if (node.stroke) borderCss = 'border:' + (node.stroke.thickness||1) + 'px solid ' + node.stroke.fill + ';';
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background:'+fill+';border-radius:50%;'+borderCss+'opacity:'+opacity+';"></div>';
    }
    return html;
  }

  function init() {
    const rawPen = window.EMBEDDED_PEN;
    if (!rawPen) { document.getElementById('render').innerHTML = '<div class="loading">No pen data found.</div>'; return; }
    const pen = typeof rawPen === 'string' ? JSON.parse(rawPen) : rawPen;
    const screens = pen.children || [];
    const nav = document.getElementById('screen-nav');
    const render = document.getElementById('render');
    const screenNames = ['Fields', 'Soil Profile', 'Sensors', 'AI Actions', 'Report'];

    function showScreen(i) {
      const scr = screens[i];
      if (!scr) return;
      render.style.background = scr.fill || '#060A05';
      let innerHtml = '';
      const offX = -(scr.x || 0);
      const offY = -(scr.y || 0);
      if (scr.children) for (const child of scr.children) innerHtml += renderNode(child, offX, offY);
      render.innerHTML = innerHtml;
      document.querySelectorAll('.screen-btn').forEach((b,j) => b.classList.toggle('active', j===i));
    }

    screens.forEach((scr, i) => {
      const btn = document.createElement('button');
      btn.className = 'screen-btn' + (i===0?' active':'');
      btn.textContent = screenNames[i] || ('Screen '+(i+1));
      btn.onclick = () => showScreen(i);
      nav.appendChild(btn);
    });
    if (screens.length > 0) showScreen(0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
</body>
</html>`;

// Inject EMBEDDED_PEN
const penJson = fs.readFileSync('/workspace/group/design-studio/strata.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace(
  '<script>\nwindow.STRATA_PLACEHOLDER = true;\n</script>',
  injection
);

// ══════════════════════════════════════════════════════════════════════════════
// SVELTE MOCK
// ══════════════════════════════════════════════════════════════════════════════
const design = {
  appName:   'STRATA',
  tagline:   'Soil intelligence, season after season.',
  archetype: 'precision-agriculture',
  palette: {
    bg:      '#060A05',
    surface: '#0C1209',
    text:    '#DDF0D6',
    accent:  '#A3E635',
    accent2: '#D97706',
    muted:   'rgba(163,230,53,0.35)',
  },
  lightPalette: {
    bg:      '#F2F7EE',
    surface: '#FFFFFF',
    text:    '#1A2915',
    accent:  '#4A7C1F',
    accent2: '#B45309',
    muted:   'rgba(26,41,21,0.45)',
  },
  screens: [
    {
      id: 'fields', label: 'Fields',
      content: [
        { type: 'metric', label: 'Farm Health Score', value: '94%', sub: 'Autumn 2025 · Harvest Season' },
        { type: 'metric-row', items: [{ label: 'Active Fields', value: '12' }, { label: 'Total Area', value: '132 ha' }, { label: 'Season', value: 'Harvest' }] },
        { type: 'list', items: [
          { icon: 'check', title: 'North Paddock — 48 ha', sub: 'pH 6.8 · OM 4.2% · Moisture 68%', badge: '94%' },
          { icon: 'alert', title: 'South Pasture — 62 ha', sub: 'Slight phosphorus elevation', badge: '81%' },
          { icon: 'alert', title: 'East Crop Zone — 35 ha', sub: 'Low moisture · irrigation needed', badge: '72%' },
          { icon: 'star', title: 'West Reserve — 27 ha', sub: 'Organic matter improving', badge: '88%' },
        ]},
      ],
    },
    {
      id: 'soil', label: 'Soil',
      content: [
        { type: 'metric', label: 'Topsoil pH (0–30 cm)', value: '6.8', sub: 'Optimal range 6.5–7.0' },
        { type: 'progress', items: [
          { label: 'Topsoil (0–30 cm)  OM 4.2%', pct: 84 },
          { label: 'Subsoil (30–60 cm) OM 2.1%', pct: 61 },
          { label: 'Deep (60–90 cm)    OM 0.8%', pct: 38 },
        ]},
        { type: 'tags', label: 'Soil Classification', items: ['Loam', 'Clay-Loam', 'Sandy Loam', 'Humic'] },
        { type: 'text', label: 'AI Insight', value: 'Phosphorus elevated 18% above threshold in topsoil. Reduce P-fertilizer this cycle by approx 15%.' },
      ],
    },
    {
      id: 'sensors', label: 'Sensors',
      content: [
        { type: 'metric', label: 'Soil Moisture', value: '68%', sub: 'Field capacity 72% · 12 sensors active' },
        { type: 'metric-row', items: [{ label: 'Temperature', value: '18°C' }, { label: 'Conductivity', value: '3.2 dS' }, { label: 'pH Drift', value: '+0.2' }] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Node A — North Paddock', sub: 'Moisture 68% · Temp 18°C · Battery 87%', badge: 'OK' },
          { icon: 'activity', title: 'Node B — South Pasture', sub: 'Moisture 52% · Temp 19°C · Watch', badge: '⚠' },
          { icon: 'activity', title: 'Node C — East Zone',    sub: 'Moisture 47% · Temp 20°C · Low', badge: '!' },
        ]},
        { type: 'progress', items: [{ label: '24h Moisture Trend', pct: 68 }] },
      ],
    },
    {
      id: 'actions', label: 'AI Tips',
      content: [
        { type: 'metric', label: 'Action Items', value: '4', sub: 'Ranked by field impact · updated today' },
        { type: 'list', items: [
          { icon: 'alert', title: '01 · Reduce phosphorus inputs', sub: 'HIGH IMPACT · Skip next P application', badge: 'NOW' },
          { icon: 'zap',   title: '02 · Irrigate West Sector A', sub: 'MED IMPACT · Schedule within 48 hrs', badge: '48h' },
          { icon: 'star',  title: '03 · Cover crop window open', sub: 'MED IMPACT · 10-day legume window', badge: 'OPP' },
          { icon: 'check', title: '04 · pH lime adjustment', sub: 'LOW IMPACT · 200 kg/ha within 3 weeks', badge: '3wk' },
        ]},
      ],
    },
    {
      id: 'report', label: 'Report',
      content: [
        { type: 'metric', label: 'Season Average Yield', value: '5.2 t/ha', sub: 'Autumn 2025 · 132 ha total · +4% vs target' },
        { type: 'metric-row', items: [{ label: 'Revenue', value: '$842K' }, { label: 'vs Target', value: '+4%' }, { label: 'Fields', value: '4' }] },
        { type: 'progress', items: [
          { label: 'Wheat — 48 ha · 6.4 vs 6.0 t/ha', pct: 106 },
          { label: 'Canola — 35 ha · 2.1 vs 2.4 t/ha', pct: 87 },
          { label: 'Barley — 27 ha · 4.8 vs 5.0 t/ha', pct: 96 },
          { label: 'Legumes — 22 ha · 3.2 vs 2.8 t/ha', pct: 114 },
        ]},
        { type: 'text', label: 'Soil Health', value: 'Soil health improved +6 points this season. Organic matter increased in 3 of 4 fields. Continue cover crop rotation.' },
      ],
    },
  ],
  nav: [
    { id: 'fields',  label: 'Fields',  icon: 'grid' },
    { id: 'soil',    label: 'Soil',    icon: 'layers' },
    { id: 'sensors', label: 'Sensors', icon: 'activity' },
    { id: 'actions', label: 'AI Tips', icon: 'zap' },
    { id: 'report',  label: 'Report',  icon: 'chart' },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// RUN ALL PUBLISHES
// ══════════════════════════════════════════════════════════════════════════════

console.log('▶ Publishing STRATA...');

// 1. Hero
process.stdout.write('  [1/5] Hero page... ');
await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log('✓');

// 2. Viewer
process.stdout.write('  [2/5] Viewer... ');
await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Screen Viewer`);
console.log('✓');

// 3. Svelte mock
process.stdout.write('  [3/5] Svelte mock... ');
const svelteSource = generateSvelteComponent(design);
const mockHtml = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const mockResult = await publishMock(mockHtml, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
console.log('✓  →', mockResult.url);

// 4. Gallery queue
process.stdout.write('  [4/5] Gallery queue... ');
const { createRequire } = await import('module');
const require = createRequire(import.meta.url);
const configRaw = fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8');
const config = JSON.parse(configRaw);
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
});
const fileData = JSON.parse(getRes.body);
const currentSha = fileData.sha;
let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
if (!queue.submissions) queue.submissions = [];

const newEntry = {
  id: `heartbeat-${SLUG}-${Date.now()}`,
  status: 'done',
  app_name: APP_NAME,
  tagline: TAGLINE,
  archetype: ARCHETYPE,
  design_url: `https://ram.zenbin.org/${SLUG}`,
  viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: PROMPT,
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
};
queue.submissions.push(newEntry);
queue.updated_at = new Date().toISOString();

const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
const putRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'PUT',
  headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
}, putBody);
console.log(putRes.status === 200 ? '✓' : `⚠ ${putRes.status}`);

// 5. Design DB
process.stdout.write('  [5/5] Design DB... ');
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, newEntry);
  rebuildEmbeddings(db);
  console.log('✓');
} catch (e) {
  console.log(`⚠ skipped (${e.message.slice(0,40)})`);
}

console.log('');
console.log('✅ STRATA live:');
console.log(`   Hero   → https://ram.zenbin.org/${SLUG}`);
console.log(`   Viewer → https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`   Mock   → https://ram.zenbin.org/${SLUG}-mock`);
