'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'orion';
const NAME    = 'ORION';
const TAGLINE = 'See every signal. Miss nothing.';

// Palette
const BG   = '#080B10';
const SURF = '#0D1117';
const CARD = '#141B24';
const ACC  = '#0ED9C7';
const ACC2 = '#F4A228';
const RED  = '#F43F5E';
const GRN  = '#10B981';
const TEXT = '#E2E8F0';
const MUT  = '#94A3B8';

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

// ── Build screen SVG thumbnails ───────────────────────────────────────────────
function screenThumb(name, idx) {
  const colours = [
    { bg: CARD, accent: ACC },
    { bg: CARD, accent: GRN },
    { bg: CARD, accent: RED },
    { bg: CARD, accent: ACC2 },
    { bg: CARD, accent: GRN },
    { bg: CARD, accent: ACC },
  ];
  const c = colours[idx % colours.length];
  return `
  <div class="screen-thumb">
    <div class="thumb-device">
      <div class="thumb-bar" style="background:${c.accent}"></div>
      <div class="thumb-header">
        <span class="t-mono" style="color:${c.accent};font-size:10px">◈ ORION</span>
        <span class="t-dot" style="background:${c.accent}"></span>
      </div>
      <div class="thumb-content">
        ${Array.from({length: 4}, (_, j) => `
          <div class="thumb-card" style="height:${20 + j * 8}px;opacity:${0.4 + j * 0.15}">
            <div class="thumb-stripe" style="background:${c.accent}"></div>
            <div class="thumb-lines">
              <div class="thumb-line" style="width:${60 + j*10}%"></div>
              <div class="thumb-line short" style="width:${35 + j*5}%"></div>
            </div>
          </div>`).join('')}
      </div>
      <div class="thumb-nav">
        ${['◈','⊞','△','〰','↑'].map((ic, j) => `<span style="color:${j===idx%5 ? c.accent : MUT}">${ic}</span>`).join('')}
      </div>
    </div>
    <p class="screen-label">${name}</p>
  </div>`;
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ORION — See every signal. Miss nothing.</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:${BG};--surf:${SURF};--card:${CARD};--acc:${ACC};--acc2:${ACC2};--red:${RED};--grn:${GRN};--text:${TEXT};--mut:${MUT}}
html{scroll-behavior:smooth}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.6;overflow-x:hidden}
a{color:var(--acc);text-decoration:none}

/* Ambient glows */
.glow-teal{position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(14,217,199,0.06) 0%,transparent 70%);pointer-events:none;z-index:0}
.glow-amber{position:fixed;bottom:-200px;right:-100px;width:500px;height:400px;background:radial-gradient(ellipse,rgba(244,162,40,0.05) 0%,transparent 70%);pointer-events:none;z-index:0}

/* Nav */
nav{position:sticky;top:0;z-index:100;background:rgba(8,11,16,0.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.06);padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between}
.nav-brand{font-family:'JetBrains Mono','Fira Code','Courier New',monospace;font-size:16px;font-weight:700;color:var(--acc);letter-spacing:0.05em}
.nav-links{display:flex;gap:24px;font-size:13px;color:var(--mut)}
.nav-cta{background:var(--acc);color:#000;font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;transition:opacity .2s}
.nav-cta:hover{opacity:.85}

/* Hero */
.hero{position:relative;z-index:1;padding:100px 24px 80px;text-align:center;max-width:960px;margin:0 auto}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border:1px solid rgba(14,217,199,0.25);border-radius:20px;font-size:11px;color:var(--acc);font-family:monospace;margin-bottom:28px;letter-spacing:0.06em}
.hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--acc);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
h1{font-size:clamp(40px,7vw,72px);font-weight:800;line-height:1.06;letter-spacing:-0.03em;margin-bottom:24px}
h1 span{color:var(--acc)}
.hero-sub{font-size:18px;color:var(--mut);max-width:520px;margin:0 auto 40px}
.hero-ctas{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.btn-primary{background:var(--acc);color:#000;font-weight:700;font-size:14px;padding:13px 28px;border-radius:10px;transition:all .2s}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px)}
.btn-secondary{background:transparent;color:var(--text);font-size:14px;padding:13px 28px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);transition:all .2s}
.btn-secondary:hover{border-color:var(--acc);color:var(--acc)}

/* Stats strip */
.stats{display:flex;justify-content:center;gap:40px;margin-top:64px;flex-wrap:wrap}
.stat{text-align:center}
.stat-val{font-size:28px;font-weight:700;font-family:monospace;color:var(--acc)}
.stat-label{font-size:11px;color:var(--mut);margin-top:4px;letter-spacing:0.06em}

/* Divider */
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(14,217,199,0.2),transparent);margin:72px 0}

/* Screens section */
.section{max-width:1100px;margin:0 auto;padding:0 24px}
.section-label{font-size:11px;font-weight:600;letter-spacing:0.12em;color:var(--acc);margin-bottom:12px}
.section-title{font-size:clamp(26px,4vw,40px);font-weight:700;letter-spacing:-0.02em;margin-bottom:12px}
.section-sub{font-size:16px;color:var(--mut);margin-bottom:48px}

.screens-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:20px;margin-bottom:72px}
.screen-thumb{text-align:center}
.thumb-device{background:${SURF};border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;height:240px;padding:0;position:relative;transition:transform .2s,border-color .2s}
.screen-thumb:hover .thumb-device{transform:translateY(-4px);border-color:rgba(14,217,199,0.3)}
.thumb-bar{height:2px;width:100%}
.thumb-header{display:flex;justify-content:space-between;align-items:center;padding:8px 10px}
.t-mono{font-family:monospace}
.t-dot{width:6px;height:6px;border-radius:50%}
.thumb-content{padding:0 8px;display:flex;flex-direction:column;gap:5px}
.thumb-card{background:${CARD};border-radius:6px;display:flex;align-items:center;gap:5px;padding:4px 6px;flex-shrink:0}
.thumb-stripe{width:2px;border-radius:1px;align-self:stretch}
.thumb-lines{flex:1;display:flex;flex-direction:column;gap:3px}
.thumb-line{height:3px;background:rgba(148,163,184,0.2);border-radius:2px}
.thumb-line.short{height:2px}
.thumb-nav{position:absolute;bottom:0;left:0;right:0;height:36px;background:${SURF};display:flex;justify-content:space-around;align-items:center;border-top:1px solid rgba(255,255,255,0.07);font-size:12px}
.screen-label{margin-top:10px;font-size:11px;color:var(--mut)}

/* Features bento */
.features-bento{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:72px}
.feat-card{background:${SURF};border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px}
.feat-card.wide{grid-column:1/-1}
.feat-card.accent-teal{border-color:rgba(14,217,199,0.2);background:linear-gradient(135deg,rgba(14,217,199,0.04),${SURF})}
.feat-card.accent-amber{border-color:rgba(244,162,40,0.15)}
.feat-icon{font-size:24px;margin-bottom:16px}
.feat-title{font-size:16px;font-weight:600;margin-bottom:8px}
.feat-desc{font-size:14px;color:var(--mut);line-height:1.7}

/* Palette swatches */
.palette{display:flex;gap:12px;margin-bottom:72px;flex-wrap:wrap;align-items:center}
.swatch{display:flex;flex-direction:column;align-items:center;gap:6px}
.swatch-block{width:48px;height:48px;border-radius:10px;border:1px solid rgba(255,255,255,0.08)}
.swatch-hex{font-size:10px;color:var(--mut);font-family:monospace}

/* CTA section */
.cta-section{text-align:center;padding:80px 24px 100px;position:relative;z-index:1}
.cta-title{font-size:clamp(28px,4vw,46px);font-weight:700;letter-spacing:-0.02em;margin-bottom:16px}
.cta-sub{font-size:16px;color:var(--mut);margin-bottom:36px}

/* Footer */
footer{border-top:1px solid rgba(255,255,255,0.06);padding:28px 24px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--mut);max-width:1100px;margin:0 auto}

@media(max-width:600px){
  .features-bento{grid-template-columns:1fr}
  .feat-card.wide{grid-column:1}
  .stats{gap:24px}
  nav .nav-links{display:none}
}
</style>
</head>
<body>
<div class="glow-teal"></div>
<div class="glow-amber"></div>

<nav>
  <div class="nav-brand">◈ ORION</div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/${SLUG}-mock">Open Mock ↗</a>
</nav>

<section class="hero">
  <div class="hero-badge">◉ RAM HEARTBEAT #44 · DARK THEME</div>
  <h1>See every<br><span>signal</span>.<br>Miss nothing.</h1>
  <p class="hero-sub">Infrastructure observability and alerting for engineering teams who ship fast and sleep well.</p>
  <div class="hero-ctas">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-viewer">View .pen file</a>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-val">${pen.screens.length}</div>
      <div class="stat-label">SCREENS</div>
    </div>
    <div class="stat">
      <div class="stat-val">${pen.metadata.elements}</div>
      <div class="stat-label">ELEMENTS</div>
    </div>
    <div class="stat">
      <div class="stat-val">DARK</div>
      <div class="stat-label">THEME</div>
    </div>
    <div class="stat">
      <div class="stat-val">#44</div>
      <div class="stat-label">HEARTBEAT</div>
    </div>
  </div>
</section>

<div class="divider"></div>

<section class="section" id="screens">
  <div class="section-label">ALL SCREENS</div>
  <div class="section-title">6 views, one system</div>
  <p class="section-sub">From mission control to on-call handoffs — every screen your SRE team needs.</p>
  <div class="screens-grid">
    ${pen.screens.map((s, i) => screenThumb(s.name, i)).join('')}
  </div>
</section>

<div class="divider"></div>

<section class="section" id="features">
  <div class="section-label">DESIGN DECISIONS</div>
  <div class="section-title">Built for the way engineers work</div>
  <p class="section-sub">Three choices that define this interface.</p>

  <div class="features-bento">
    <div class="feat-card accent-teal wide">
      <div class="feat-icon">⊞</div>
      <div class="feat-title">Bento Grid Services Board</div>
      <div class="feat-desc">Directly inspired by the bento-grid trend on Saaspo — asymmetric cards of varying heights give each service the visual weight it deserves. Critical services dominate; healthy ones compress. The layout communicates status before you read a single label.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⬛</div>
      <div class="feat-title">Engineering-First Dark</div>
      <div class="feat-desc">Not dark-mode as an afterthought — three calibrated off-black layers (#080B10 → #0D1117 → #141B24) following the Linear/daytona.io approach. Surfaces are defined by 7–14 luminance steps, never CSS inversion.</div>
    </div>
    <div class="feat-card accent-amber">
      <div class="feat-icon">⌗</div>
      <div class="feat-title">Monospace as Identity</div>
      <div class="feat-desc">All metrics, hashes, service names, and timers use a monospace font. Inspired by greptile.com's monospace-throughout aesthetic — it signals precision and makes data scannable at a glance in high-stress incident situations.</div>
    </div>
  </div>
</section>

<div class="divider"></div>

<section class="section">
  <div class="section-label">PALETTE</div>
  <div class="section-title">Deep space, calibrated</div>
  <p class="section-sub">Bio-synthetic accents on an engineering-grade dark foundation.</p>

  <div class="palette">
    ${[
      { hex: BG,   name: 'Void' },
      { hex: SURF, name: 'Surface' },
      { hex: CARD, name: 'Card' },
      { hex: ACC,  name: 'Teal' },
      { hex: ACC2, name: 'Amber' },
      { hex: RED,  name: 'Critical' },
      { hex: GRN,  name: 'Healthy' },
      { hex: TEXT, name: 'Text' },
    ].map(s => `
      <div class="swatch">
        <div class="swatch-block" style="background:${s.hex}"></div>
        <div class="swatch-hex">${s.hex}</div>
        <div class="swatch-hex" style="color:#64748b">${s.name}</div>
      </div>`).join('')}
  </div>
</section>

<div class="divider"></div>

<section class="cta-section">
  <div class="cta-title">Ready to explore?</div>
  <p class="cta-sub">Open the interactive Svelte mock with built-in light/dark toggle.</p>
  <div class="hero-ctas">
    <a class="btn-primary" href="https://ram.zenbin.org/${SLUG}-mock">Open Interactive Mock ☀◑</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a>
  </div>
</section>

<footer>
  <span>◈ ORION — RAM Design Heartbeat #44 · ${new Date().toISOString().split('T')[0]}</span>
  <span>ram.zenbin.org/${SLUG}</span>
</footer>
</body>
</html>`;

// ── Viewer (with embedded pen) ────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
