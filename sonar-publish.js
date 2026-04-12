'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'sonar';
const APP     = 'SONAR';
const TAGLINE = 'Voice intelligence, decoded';

// Palette
const BG   = '#080A0F';
const SURF  = '#0E1018';
const CARD  = '#131620';
const ACC  = '#06B6D4';
const ACC2 = '#F59E0B';
const WARN = '#EF4444';
const TEXT = '#E2E8F0';
const MUT  = 'rgba(226,232,240,0.45)';
const DIM  = 'rgba(226,232,240,0.18)';
const LINE = '#1E2230';

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

// ── SVG screen thumbnails ─────────────────────────────────────────────────────
function elementsToSVG(elements, w, h) {
  const shapes = elements.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    }
    if (el.type === 'text') {
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'IBM Plex Mono'}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity!==undefined?el.opacity:1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity!==undefined?el.opacity:1}"/>`;
    }
    return '';
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${shapes}</svg>`;
}

function svgToDataUri(svgStr) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svgStr).toString('base64');
}

// ── Hero page ─────────────────────────────────────────────────────────────────
function buildHero() {
  const screenPreviews = pen.screens.map((s, i) => {
    const svgStr = elementsToSVG(s.elements, 390, 844);
    const uri    = svgToDataUri(svgStr);
    return `
      <div class="screen-card">
        <div class="screen-label">${String(i + 1).padStart(2, '0')} / ${s.name.toUpperCase()}</div>
        <img class="screen-img" src="${uri}" alt="${s.name}" loading="lazy"/>
      </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>SONAR — Voice intelligence, decoded</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:${BG};color:${TEXT};font-family:'Inter',sans-serif;overflow-x:hidden}

/* Grid overlay */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:
    linear-gradient(rgba(6,182,212,0.04) 1px,transparent 1px),
    linear-gradient(90deg,rgba(6,182,212,0.04) 1px,transparent 1px);
  background-size:40px 40px;
}

/* Radial glow */
.glow-orb{
  position:fixed;top:-200px;left:50%;transform:translateX(-50%);
  width:600px;height:600px;
  background:radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%);
  pointer-events:none;z-index:0;
}

.container{max-width:1120px;margin:0 auto;padding:0 24px;position:relative;z-index:1}

/* Nav */
nav{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 24px;border-bottom:1px solid ${LINE};
  position:sticky;top:0;background:rgba(8,10,15,0.88);
  backdrop-filter:blur(12px);z-index:100;
}
.nav-logo{
  font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:700;
  color:${ACC};letter-spacing:4px;
}
.nav-logo span{color:${TEXT};font-weight:300}
.nav-links{display:flex;gap:32px}
.nav-links a{
  font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:2px;
  color:${MUT};text-decoration:none;transition:color 0.2s;
}
.nav-links a:hover{color:${ACC}}
.nav-cta{
  font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:700;letter-spacing:2px;
  color:${BG};background:${ACC};padding:8px 18px;
  border-radius:3px;text-decoration:none;transition:opacity 0.2s;
}
.nav-cta:hover{opacity:0.85}

/* Hero */
.hero{padding:120px 0 80px;text-align:center}
.hero-eyebrow{
  font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:4px;
  color:${ACC};margin-bottom:24px;display:flex;align-items:center;justify-content:center;gap:8px;
}
.hero-eyebrow::before,.hero-eyebrow::after{content:'';width:40px;height:1px;background:${ACC};opacity:0.4}
.hero-title{
  font-family:'IBM Plex Mono',monospace;font-size:clamp(48px,8vw,88px);
  font-weight:700;line-height:1;letter-spacing:-2px;
  color:${TEXT};margin-bottom:8px;
}
.hero-title em{color:${ACC};font-style:normal}
.hero-sub{
  font-family:'IBM Plex Mono',monospace;font-size:clamp(14px,2vw,18px);
  color:${MUT};margin-bottom:48px;letter-spacing:2px;font-weight:300;
}
.hero-actions{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap}
.btn-primary{
  font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:700;letter-spacing:2px;
  color:${BG};background:${ACC};padding:14px 32px;border-radius:3px;
  text-decoration:none;transition:all 0.2s;
}
.btn-primary:hover{background:#22D3EE}
.btn-secondary{
  font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;
  color:${ACC};border:1px solid rgba(6,182,212,0.4);padding:14px 32px;border-radius:3px;
  text-decoration:none;transition:all 0.2s;
}
.btn-secondary:hover{border-color:${ACC};background:rgba(6,182,212,0.06)}

/* Status bar */
.hero-status{
  margin-top:32px;display:flex;align-items:center;justify-content:center;gap:24px;
  font-family:'IBM Plex Mono',monospace;font-size:8px;letter-spacing:2px;color:${MUT};
}
.status-dot{width:6px;height:6px;border-radius:50%;background:${ACC};
  animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}

/* Metrics strip */
.metrics-strip{
  display:grid;grid-template-columns:repeat(4,1fr);
  border:1px solid ${LINE};border-radius:6px;
  background:${SURF};overflow:hidden;margin:64px 0;
}
.metric-cell{
  padding:28px 24px;border-right:1px solid ${LINE};
}
.metric-cell:last-child{border-right:none}
.metric-label{
  font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:3px;
  color:${MUT};margin-bottom:10px;
}
.metric-value{
  font-family:'IBM Plex Mono',monospace;font-size:32px;font-weight:700;color:${TEXT};
}
.metric-value span{color:${ACC};font-size:18px}
.metric-sub{font-size:10px;color:${MUT};margin-top:4px}

/* Screens carousel */
.screens-section{padding:64px 0}
.section-label{
  font-family:'IBM Plex Mono',monospace;font-size:8px;letter-spacing:4px;
  color:${ACC};margin-bottom:8px;display:flex;align-items:center;gap:12px;
}
.section-label::after{content:'';flex:1;height:1px;background:${LINE}}
.section-title{
  font-family:'IBM Plex Mono',monospace;font-size:28px;font-weight:700;
  color:${TEXT};margin-bottom:40px;
}
.screens-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:16px;
}
.screen-card{
  border:1px solid ${LINE};border-radius:6px;overflow:hidden;
  background:${CARD};transition:border-color 0.2s;
}
.screen-card:hover{border-color:rgba(6,182,212,0.4)}
.screen-label{
  font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:2px;
  color:${MUT};padding:10px 12px;border-bottom:1px solid ${LINE};
}
.screen-img{width:100%;display:block}

/* Features */
.features{padding:64px 0}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:${LINE}}
.feature{background:${SURF};padding:32px 28px}
.feature-icon{
  font-family:'IBM Plex Mono',monospace;font-size:10px;color:${ACC};
  margin-bottom:16px;letter-spacing:2px;
}
.feature-title{
  font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:700;
  color:${TEXT};margin-bottom:8px;
}
.feature-desc{font-size:13px;color:${MUT};line-height:1.6}

/* Palette */
.palette-section{padding:48px 0;border-top:1px solid ${LINE}}
.palette-swatches{display:flex;gap:8px;margin-top:20px}
.swatch{height:48px;border-radius:4px;flex:1;position:relative}
.swatch-label{
  font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:1px;
  color:${MUT};margin-top:6px;text-align:center;
}

/* Footer */
footer{
  border-top:1px solid ${LINE};padding:32px 24px;
  display:flex;align-items:center;justify-content:space-between;
}
.footer-mark{
  font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:2px;color:${DIM||MUT};
}
.footer-links{display:flex;gap:24px}
.footer-links a{
  font-family:'IBM Plex Mono',monospace;font-size:8px;letter-spacing:1.5px;
  color:${MUT};text-decoration:none;
}
.footer-links a:hover{color:${ACC}}

@media(max-width:768px){
  .screens-grid{grid-template-columns:repeat(2,1fr)}
  .features-grid{grid-template-columns:1fr}
  .metrics-strip{grid-template-columns:repeat(2,1fr)}
  .metric-cell:nth-child(2){border-right:none}
  .metric-cell:nth-child(3){border-top:1px solid ${LINE}}
  .metric-cell:nth-child(4){border-top:1px solid ${LINE};border-right:none}
}
</style>
</head>
<body>
<div class="glow-orb"></div>

<nav>
  <div class="nav-logo">SONAR<span> / RAM Design</span></div>
  <div class="nav-links">
    <a href="#screens">SCREENS</a>
    <a href="#features">FEATURES</a>
    <a href="https://ram.zenbin.org/sonar-viewer">VIEWER</a>
  </div>
  <a href="https://ram.zenbin.org/sonar-mock" class="nav-cta">LIVE MOCK →</a>
</nav>

<div class="container">
  <section class="hero">
    <div class="hero-eyebrow">RAM DESIGN HEARTBEAT · 21</div>
    <h1 class="hero-title"><em>SONAR</em></h1>
    <p class="hero-sub">Voice intelligence, decoded</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/sonar-viewer" class="btn-primary">VIEW IN PENCIL</a>
      <a href="https://ram.zenbin.org/sonar-mock" class="btn-secondary">☀◑ INTERACTIVE MOCK</a>
    </div>
    <div class="hero-status">
      <span class="status-dot"></span>
      <span>LIVE SYSTEM · 247 ACTIVE CALLS · 99.98% UPTIME</span>
    </div>
  </section>

  <div class="metrics-strip">
    <div class="metric-cell">
      <div class="metric-label">ACTIVE CALLS</div>
      <div class="metric-value">247<span>.3K</span></div>
      <div class="metric-sub">across 5 regions</div>
    </div>
    <div class="metric-cell">
      <div class="metric-label">AVG LATENCY</div>
      <div class="metric-value" style="color:${ACC}">82<span>ms</span></div>
      <div class="metric-sub">↓ 12ms vs. last hour</div>
    </div>
    <div class="metric-cell">
      <div class="metric-label">TRANSCRIPTION</div>
      <div class="metric-value">99<span>.2%</span></div>
      <div class="metric-sub">accuracy rate</div>
    </div>
    <div class="metric-cell">
      <div class="metric-label">AI AGENTS</div>
      <div class="metric-value" style="color:${ACC}">5</div>
      <div class="metric-sub">3 active · 2 standby</div>
    </div>
  </div>

  <section class="screens-section" id="screens">
    <div class="section-label">DESIGN SCREENS</div>
    <h2 class="section-title">6 screens. Every call in view.</h2>
    <div class="screens-grid">
      ${screenPreviews}
    </div>
  </section>

  <section class="features" id="features">
    <div class="section-label">FEATURES</div>
    <h2 class="section-title" style="margin-bottom:2px">Built for mission-critical voice ops</h2>
    <div class="features-grid">
      <div class="feature">
        <div class="feature-icon">◈ MISSION CTRL</div>
        <div class="feature-title">Real-time Control Room</div>
        <div class="feature-desc">Mission-control dashboard with live call volume, regional load distribution, and system health — all in one technical view.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">⊕ VOICE ANALYTICS</div>
        <div class="feature-title">Sentiment & Intent Intelligence</div>
        <div class="feature-desc">Analyze every call's sentiment arc, diarized speaker turns, and top intent distributions across rolling 24H windows.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">◎ AGENT LIBRARY</div>
        <div class="feature-title">AI Voice Agent Management</div>
        <div class="feature-desc">Configure, monitor, and deploy AI voice agents with per-agent accuracy scores, call volumes, and voice model specs.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">▷ LIVE TRANSCRIPT</div>
        <div class="feature-title">Real-time Transcription</div>
        <div class="feature-desc">Word-level timestamps, speaker diarization, and keyword extraction delivered with sub-100ms streaming latency.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">≋ SYSTEM CONFIG</div>
        <div class="feature-title">Technical Parameter Control</div>
        <div class="feature-desc">Monospace parameter interface for controlling transcription engines, voice synthesis providers, and regional failover routing.</div>
      </div>
      <div class="feature">
        <div class="feature-icon">⊞ STREAM VIEW</div>
        <div class="feature-title">Per-Stream Monitoring</div>
        <div class="feature-desc">Track every active call with live waveform previews, per-call sentiment scores, and instant flagging for escalation.</div>
      </div>
    </div>
  </section>

  <section class="palette-section">
    <div class="section-label">PALETTE — COCKPIT BLACK</div>
    <div class="palette-swatches">
      <div>
        <div class="swatch" style="background:#080A0F;border:1px solid ${LINE}"></div>
        <div class="swatch-label">#080A0F</div>
      </div>
      <div>
        <div class="swatch" style="background:#0E1018;border:1px solid ${LINE}"></div>
        <div class="swatch-label">#0E1018</div>
      </div>
      <div>
        <div class="swatch" style="background:#131620;border:1px solid ${LINE}"></div>
        <div class="swatch-label">#131620</div>
      </div>
      <div>
        <div class="swatch" style="background:#06B6D4"></div>
        <div class="swatch-label">#06B6D4</div>
      </div>
      <div>
        <div class="swatch" style="background:#F59E0B"></div>
        <div class="swatch-label">#F59E0B</div>
      </div>
      <div>
        <div class="swatch" style="background:#EF4444"></div>
        <div class="swatch-label">#EF4444</div>
      </div>
    </div>
  </section>
</div>

<footer>
  <div class="footer-mark">RAM DESIGN · HEARTBEAT 21 · ${new Date().toISOString().slice(0,10)}</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/sonar-viewer">PENCIL VIEWER</a>
    <a href="https://ram.zenbin.org/sonar-mock">INTERACTIVE MOCK</a>
  </div>
</footer>
</body>
</html>`;
}

// ── Viewer ────────────────────────────────────────────────────────────────────
function buildViewer() {
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

async function main() {
  console.log('Building hero…');
  const heroHtml = buildHero();
  console.log(`Hero size: ${(heroHtml.length / 1024).toFixed(0)} KB`);

  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 80)}`);

  console.log('Building viewer…');
  const viewerHtml = buildViewer();
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 80)}`);
}

main().catch(console.error);
