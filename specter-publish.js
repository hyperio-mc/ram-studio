'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'specter';
const NAME = 'SPECTER';
const TAGLINE = 'AI threat intelligence, real-time';

// ── Palette ──────────────────────────────────────────────────────────────────
const BG      = '#09090D';
const SURF    = '#0E0F15';
const CARD    = '#141620';
const ACC     = '#00FF88';
const ACC2    = '#3B82F6';
const ACC3    = '#F43F5E';
const ACC4    = '#A855F7';
const TEXT    = '#E2E8F4';
const SUB     = '#8892A0';

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

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// ── Build SVG previews ───────────────────────────────────────────────────────
function elemToSvg(el) {
  if (el.type === 'rect') {
    return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.rx||0}" fill="${el.fill}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
  }
  if (el.type === 'text') {
    const anchor = el.textAnchor || 'start';
    return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter'}" text-anchor="${anchor}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity??1}">${el.content}</text>`;
  }
  if (el.type === 'circle') {
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
  }
  if (el.type === 'line') {
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity??1}"/>`;
  }
  return '';
}

function screenToSvgDataUri(screen) {
  const svgContent = screen.elements.map(elemToSvg).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">${svgContent}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const svgPreviews = pen.screens.map(screenToSvgDataUri);

// ── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${BG}; --surf:${SURF}; --card:${CARD};
  --acc:${ACC}; --acc2:${ACC2}; --acc3:${ACC3}; --acc4:${ACC4};
  --text:${TEXT}; --sub:${SUB};
  --border:rgba(226,232,244,0.08);
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden;line-height:1.6}

/* ── Ambient glow layers ── */
.glow-1{position:fixed;top:-200px;left:-100px;width:600px;height:600px;background:radial-gradient(circle,rgba(0,255,136,0.06) 0%,transparent 70%);pointer-events:none;z-index:0}
.glow-2{position:fixed;bottom:-200px;right:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(59,130,246,0.06) 0%,transparent 70%);pointer-events:none;z-index:0}
.glow-3{position:fixed;top:40%;left:40%;width:400px;height:400px;background:radial-gradient(circle,rgba(168,85,247,0.04) 0%,transparent 70%);pointer-events:none;z-index:0}

/* ── Nav ── */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:rgba(9,9,13,0.85);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)}
.nav-logo{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;letter-spacing:4px;color:var(--acc)}
.nav-badge{font-size:8px;letter-spacing:3px;color:var(--sub);font-weight:600;background:rgba(226,232,244,0.05);padding:4px 10px;border-radius:20px;border:1px solid var(--border)}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:var(--sub);text-decoration:none;font-size:12px;letter-spacing:2px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--acc)}
.nav-cta{background:var(--acc);color:var(--bg);font-size:11px;font-weight:800;letter-spacing:2px;padding:8px 20px;border-radius:6px;text-decoration:none;transition:all .2s}
.nav-cta:hover{box-shadow:0 0 20px rgba(0,255,136,0.4);transform:translateY(-1px)}

/* ── Hero ── */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 40px 80px;position:relative;z-index:1}
.hero-eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:5px;color:var(--acc);font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:12px}
.hero-eyebrow::before,.hero-eyebrow::after{content:'';width:40px;height:1px;background:var(--acc);opacity:0.4}
.hero-title{font-size:clamp(64px,12vw,120px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:24px;background:linear-gradient(135deg,var(--text) 0%,rgba(226,232,244,0.5) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{font-size:18px;color:var(--sub);font-weight:400;max-width:480px;margin:0 auto 48px}
.hero-cta-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:80px}
.btn-primary{background:var(--acc);color:var(--bg);padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:2px;transition:all .3s;display:flex;align-items:center;gap:8px}
.btn-primary:hover{box-shadow:0 0 32px rgba(0,255,136,0.4);transform:translateY(-2px)}
.btn-secondary{border:1px solid var(--border);color:var(--sub);padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:500;font-size:13px;letter-spacing:2px;transition:all .3s}
.btn-secondary:hover{border-color:var(--acc);color:var(--acc);transform:translateY(-2px)}

/* Threat score live badge */
.live-badge{display:flex;align-items:center;gap:8px;background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.25);border-radius:20px;padding:6px 16px;margin-bottom:20px}
.live-dot{width:6px;height:6px;background:${ACC3};border-radius:50%;animation:pulse 1.5s ease infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0.6)}50%{box-shadow:0 0 0 6px rgba(244,63,94,0)}}
.live-text{font-size:11px;font-weight:700;letter-spacing:2px;color:${ACC3}}

/* ── Screen carousel ── */
.screens-section{padding:60px 40px 80px;position:relative;z-index:1}
.section-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--acc);font-weight:700;text-align:center;margin-bottom:48px}
.screens-carousel{display:flex;gap:24px;overflow-x:auto;padding:20px 0 40px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.screens-carousel::-webkit-scrollbar{display:none}
.screen-card{flex:0 0 auto;scroll-snap-align:center;position:relative}
.screen-card img{width:195px;height:422px;border-radius:16px;border:1px solid var(--border);display:block;transition:all .3s;box-shadow:0 0 0 0 transparent}
.screen-card:hover img{transform:translateY(-8px) scale(1.02);box-shadow:0 20px 60px rgba(0,255,136,0.1),0 0 0 1px rgba(0,255,136,0.2)}
.screen-label{font-size:9px;letter-spacing:2px;color:var(--sub);text-align:center;margin-top:12px;font-weight:600}

/* ── Bento feature grid ── */
.features{padding:0 40px 80px;position:relative;z-index:1}
.bento-grid{display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto auto;gap:16px;max-width:900px;margin:0 auto}
.bento-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:all .3s}
.bento-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--acc-color,var(--acc))}
.bento-card:hover{transform:translateY(-4px);border-color:rgba(0,255,136,0.15)}
.bento-card.wide{grid-column:span 2}
.bento-card.tall{grid-row:span 2}
.feat-icon{font-size:24px;margin-bottom:16px;display:block}
.feat-stat{font-size:36px;font-weight:900;color:var(--acc-color,var(--acc));line-height:1;margin-bottom:4px}
.feat-title{font-size:14px;font-weight:700;margin-bottom:8px;letter-spacing:0.5px}
.feat-body{font-size:12px;color:var(--sub);line-height:1.6}
.tag-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
.tag{font-size:9px;font-weight:700;letter-spacing:1.5px;padding:4px 10px;border-radius:20px;background:rgba(0,255,136,0.1);color:var(--acc)}
.tag.blue{background:rgba(59,130,246,0.1);color:${ACC2}}
.tag.red{background:rgba(244,63,94,0.1);color:${ACC3}}
.tag.purple{background:rgba(168,85,247,0.1);color:${ACC4}}

/* ── Palette strip ── */
.palette-section{padding:0 40px 80px;position:relative;z-index:1;max-width:900px;margin:0 auto}
.palette-strip{display:flex;gap:12px;flex-wrap:wrap}
.swatch{display:flex;flex-direction:column;gap:8px}
.swatch-color{width:56px;height:56px;border-radius:12px;border:1px solid var(--border)}
.swatch-hex{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--sub);letter-spacing:1px}
.swatch-name{font-size:9px;color:var(--sub);opacity:0.7}

/* ── Stats bar ── */
.stats-bar{display:flex;gap:0;border:1px solid var(--border);border-radius:12px;overflow:hidden;max-width:900px;margin:0 auto 80px;position:relative;z-index:1}
.stat-item{flex:1;padding:24px;text-align:center;border-right:1px solid var(--border)}
.stat-item:last-child{border-right:none}
.stat-num{font-size:28px;font-weight:900;color:var(--acc);display:block;line-height:1}
.stat-label{font-size:9px;letter-spacing:2px;color:var(--sub);font-weight:600;margin-top:6px;display:block}

/* ── Footer ── */
footer{border-top:1px solid var(--border);padding:40px;text-align:center;position:relative;z-index:1}
footer a{color:var(--acc);text-decoration:none}
.footer-links{display:flex;gap:32px;justify-content:center;margin-top:16px;flex-wrap:wrap}
.footer-links a{color:var(--sub);text-decoration:none;font-size:11px;letter-spacing:2px;transition:color .2s}
.footer-links a:hover{color:var(--acc)}
.footer-sig{font-size:9px;color:var(--sub);opacity:0.5;letter-spacing:2px;margin-top:16px;font-family:'JetBrains Mono',monospace}

@media(max-width:700px){
  .bento-grid{grid-template-columns:1fr}
  .bento-card.wide{grid-column:span 1}
  nav .nav-links{display:none}
  .stats-bar{flex-wrap:wrap}
}
</style>
</head>
<body>

<div class="glow-1"></div>
<div class="glow-2"></div>
<div class="glow-3"></div>

<!-- Nav -->
<nav>
  <span class="nav-logo">SPECTER</span>
  <span class="nav-badge">THREAT INTELLIGENCE</span>
  <ul class="nav-links">
    <li><a href="#features">FEATURES</a></li>
    <li><a href="#screens">SCREENS</a></li>
    <li><a href="#palette">PALETTE</a></li>
  </ul>
  <a href="https://ram.zenbin.org/specter-viewer" class="nav-cta">VIEW DESIGN →</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="live-badge">
    <div class="live-dot"></div>
    <span class="live-text">THREAT LEVEL: ELEVATED 8.4/10</span>
  </div>
  <div class="hero-eyebrow">HEARTBEAT · DARK THEME · SECOPS</div>
  <h1 class="hero-title">SPECTER</h1>
  <p class="hero-sub">AI-powered threat intelligence platform. Hunt adversaries in real-time before they reach your crown jewels.</p>
  <div class="hero-cta-row">
    <a href="https://ram.zenbin.org/specter-viewer" class="btn-primary">⬡ Open Viewer</a>
    <a href="https://ram.zenbin.org/specter-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<!-- Stats -->
<div style="padding:0 40px;position:relative;z-index:1">
<div class="stats-bar">
  <div class="stat-item"><span class="stat-num">6</span><span class="stat-label">SCREENS</span></div>
  <div class="stat-item"><span class="stat-num">553</span><span class="stat-label">ELEMENTS</span></div>
  <div class="stat-item"><span class="stat-num">180d</span><span class="stat-label">LOG CORPUS</span></div>
  <div class="stat-item"><span class="stat-num">12</span><span class="stat-label">INTEL SOURCES</span></div>
</div>
</div>

<!-- Screens carousel -->
<section class="screens-section" id="screens">
  <div class="section-label">— 6 SCREENS —</div>
  <div class="screens-carousel">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${svgPreviews[i]}" alt="${s.name}" loading="lazy"/>
      <div class="screen-label">${s.name.toUpperCase()}</div>
    </div>`).join('')}
  </div>
</section>

<!-- Bento features -->
<section class="features" id="features">
  <div class="section-label" style="text-align:center;margin-bottom:48px">— CAPABILITIES —</div>
  <div class="bento-grid">
    <div class="bento-card wide" style="--acc-color:${ACC}">
      <span class="feat-icon">⬡</span>
      <div class="feat-stat">8.4</div>
      <div class="feat-title">Live Threat Score</div>
      <div class="feat-body">Real-time global threat level calculated from 48M+ daily telemetry events across SIEM, EDR, and open-source intelligence feeds. Bento grid dashboard puts every key metric one glance away.</div>
      <div class="tag-row"><span class="tag">BENTO GRID</span><span class="tag blue">REAL-TIME</span><span class="tag red">ELEVATED</span></div>
    </div>
    <div class="bento-card" style="--acc-color:${ACC4}">
      <span class="feat-icon">◎</span>
      <div class="feat-stat">12+</div>
      <div class="feat-title">Nation-State Profiles</div>
      <div class="feat-body">Deep dossiers on tracked APT groups — TTPs, campaigns, IOCs. Inspired by analyst workflows.</div>
      <div class="tag-row"><span class="tag purple">APT TRACKING</span></div>
    </div>
    <div class="bento-card" style="--acc-color:${ACC3}">
      <span class="feat-icon">⊡</span>
      <div class="feat-stat">1.8K</div>
      <div class="feat-title">Blocked / Hour</div>
      <div class="feat-body">Automated blocking rules executing across firewall, EDR, and SOAR playbooks simultaneously.</div>
      <div class="tag-row"><span class="tag red">AUTO-BLOCK</span></div>
    </div>
    <div class="bento-card" style="--acc-color:${ACC2}">
      <span class="feat-icon">⊕</span>
      <div class="feat-stat">847</div>
      <div class="feat-title">Hunt Query Results</div>
      <div class="feat-body">KQL-style query interface across 180-day log corpus. MITRE ATT&amp;CK tagging built in. Find lateral movement before it becomes a breach.</div>
      <div class="tag-row"><span class="tag blue">MONOSPACE UI</span><span class="tag">MITRE</span></div>
    </div>
    <div class="bento-card" style="--acc-color:${ACC}">
      <span class="feat-icon">⊘</span>
      <div class="feat-stat">6</div>
      <div class="feat-title">Integration Sources</div>
      <div class="feat-body">CrowdStrike, Splunk, Sentinel, ThreatConnect, Recorded Future, XSOAR — all in one ops console with live health indicators.</div>
      <div class="tag-row"><span class="tag">OPS CONSOLE</span><span class="tag blue">SIEM · EDR · SOAR</span></div>
    </div>
  </div>
</section>

<!-- Palette -->
<section class="palette-section" id="palette">
  <div class="section-label" style="text-align:left;margin-bottom:24px">— DARK PALETTE —</div>
  <div class="palette-strip">
    ${[
      { hex: BG, name: 'Void' },
      { hex: SURF, name: 'Surface' },
      { hex: CARD, name: 'Card' },
      { hex: ACC, name: 'Neon' },
      { hex: ACC2, name: 'Signal' },
      { hex: ACC3, name: 'Alert' },
      { hex: ACC4, name: 'Intel' },
      { hex: TEXT, name: 'Text' },
      { hex: SUB, name: 'Muted' },
    ].map(s => `<div class="swatch"><div class="swatch-color" style="background:${s.hex}"></div><div class="swatch-hex">${s.hex}</div><div class="swatch-name">${s.name}</div></div>`).join('')}
  </div>
</section>

<!-- Footer -->
<footer>
  <p style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--sub);letter-spacing:3px">
    RAM DESIGN HEARTBEAT · BEAT 11 · 11 APR 2026
  </p>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/specter-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/specter-mock">Interactive Mock ☀◑</a>
    <a href="https://ram.zenbin.org">Gallery</a>
  </div>
  <p class="footer-sig">GENERATED BY RAM · ANTHROPIC CLAUDE</p>
</footer>

</body>
</html>`;

// ── Viewer HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace(
  '<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`,
);

// ── Publish ──────────────────────────────────────────────────────────────────
async function main() {
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero (${SLUG}): ${r1.status}`);
  if (r1.status !== 201) console.log('  →', r1.body.slice(0, 200));

  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer (${SLUG}-viewer): ${r2.status}`);
  if (r2.status !== 201) console.log('  →', r2.body.slice(0, 200));
}

main().catch(console.error);
