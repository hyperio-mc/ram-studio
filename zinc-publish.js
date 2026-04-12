'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'zinc';
const APP_NAME = 'ZINC';
const TAGLINE  = 'API health at a glance';

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      port: 443,
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
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

// ── palette ──────────────────────────────────────────────────────────────────
const BG    = '#0A0A09';
const SURF  = '#111110';
const CARD  = '#191917';
const TEXT  = '#E8E4DC';
const MUTED = '#7A7870';
const ACC   = '#F5A623';
const NEG   = '#FF5B4E';
const POS   = '#52C97A';

// ── SVG screen previews ───────────────────────────────────────────────────────
function screenToSvg(screen) {
  const els = screen.elements;
  const shapes = els.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"${el.rx ? ` rx="${el.rx}"` : ''}${el.opacity ? ` opacity="${el.opacity}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''}/>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${el.opacity ? ` opacity="${el.opacity}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''}/>`;
    }
    if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const fw = el.fontWeight || 400;
      const size = el.fontSize || 12;
      const fill = el.fill || TEXT;
      const ls = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : '';
      const op = el.opacity ? ` opacity="${el.opacity}"` : '';
      const content = String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text x="${el.x}" y="${el.y}" font-size="${size}" font-weight="${fw}" fill="${fill}" text-anchor="${anchor}"${ls}${op} font-family="monospace,sans-serif">${content}</text>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"${el.opacity ? ` opacity="${el.opacity}"` : ''}/>`;
    }
    return '';
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${shapes}</svg>`;
}

const svgs = pen.screens.map(s => screenToSvg(s));
const svgDataUris = svgs.map(s => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`);

// ── hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${BG};--surf:${SURF};--card:${CARD};
  --text:${TEXT};--muted:${MUTED};--acc:${ACC};
  --neg:${NEG};--pos:${POS};
  --border:#2A2A27;
}
body{background:var(--bg);color:var(--text);font-family:'JetBrains Mono',monospace,sans-serif;min-height:100vh}
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');

/* dot grid hero */
.hero{position:relative;padding:80px 40px 60px;overflow:hidden;border-bottom:1px solid var(--border)}
.dot-grid{position:absolute;inset:0;background-image:radial-gradient(circle,${MUTED}22 1px,transparent 1px);background-size:18px 18px;pointer-events:none}
.hero-inner{position:relative;z-index:1;max-width:900px;margin:0 auto}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:${ACC}22;border:1px solid ${ACC}44;border-radius:20px;margin-bottom:24px}
.hero-badge span{font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--acc);text-transform:uppercase}
.hero-badge .dot{width:6px;height:6px;border-radius:50%;background:var(--acc);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
h1{font-size:clamp(40px,7vw,72px);font-weight:800;line-height:1.05;letter-spacing:-2px;margin-bottom:16px}
h1 span{color:var(--acc)}
.sub{font-size:16px;color:var(--muted);max-width:480px;line-height:1.6;margin-bottom:36px}
.cta-row{display:flex;gap:12px;flex-wrap:wrap}
.cta-primary{padding:14px 28px;background:var(--acc);color:var(--bg);border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none}
.cta-secondary{padding:14px 28px;background:transparent;color:var(--text);border:1px solid var(--border);border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;text-decoration:none}
.meta-row{margin-top:32px;display:flex;gap:32px;flex-wrap:wrap}
.meta-item{display:flex;flex-direction:column;gap:4px}
.meta-val{font-size:20px;font-weight:700;color:var(--text)}
.meta-val.amber{color:var(--acc)}
.meta-val.green{color:var(--pos)}
.meta-val.red{color:var(--neg)}
.meta-label{font-size:9px;letter-spacing:1px;color:var(--muted);text-transform:uppercase}

/* screens carousel */
.screens-section{padding:60px 40px;max-width:900px;margin:0 auto}
.section-label{font-size:9px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:20px}
.carousel{display:flex;gap:16px;overflow-x:auto;padding-bottom:16px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
.screen-card{flex:0 0 195px;background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:border-color .2s,transform .2s}
.screen-card:hover{border-color:var(--acc);transform:translateY(-2px)}
.screen-card img{width:100%;display:block}
.screen-name{font-size:10px;font-weight:600;letter-spacing:.5px;color:var(--muted);padding:8px 12px;text-transform:uppercase}
.screen-card.active{border-color:var(--acc)}

/* feature grid */
.features{padding:0 40px 60px;max-width:900px;margin:0 auto}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.feat-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px}
.feat-icon{width:10px;height:10px;border-radius:50%;background:var(--acc);margin-bottom:16px}
.feat-title{font-size:14px;font-weight:700;margin-bottom:8px;color:var(--text)}
.feat-desc{font-size:12px;color:var(--muted);line-height:1.6}

/* palette swatches */
.palette-section{padding:0 40px 60px;max-width:900px;margin:0 auto}
.swatches{display:flex;gap:8px;flex-wrap:wrap}
.swatch{width:48px;height:48px;border-radius:8px;border:1px solid var(--border)}
.swatch-label{font-size:9px;color:var(--muted);margin-top:4px;text-align:center;letter-spacing:.3px}

/* inspiration */
.inspiration{background:var(--surf);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:40px;margin-bottom:60px}
.inspiration-inner{max-width:900px;margin:0 auto}
.inspo-item{display:flex;gap:12px;align-items:flex-start;margin-bottom:16px}
.inspo-dot{width:6px;height:6px;border-radius:50%;background:var(--acc);flex-shrink:0;margin-top:5px}
.inspo-text{font-size:12px;color:var(--muted);line-height:1.6}
.inspo-text strong{color:var(--text)}

/* links */
.links-section{padding:0 40px 80px;max-width:900px;margin:0 auto}
.link-row{display:flex;gap:12px;flex-wrap:wrap}
.link-pill{padding:10px 20px;border:1px solid var(--border);border-radius:20px;font-size:12px;color:var(--muted);text-decoration:none;font-family:inherit;transition:border-color .2s,color .2s}
.link-pill:hover{border-color:var(--acc);color:var(--acc)}

/* footer */
footer{border-top:1px solid var(--border);padding:24px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
footer span{font-size:10px;color:var(--muted);letter-spacing:.5px}
footer span.acc{color:var(--acc)}
</style>
</head>
<body>

<section class="hero">
  <div class="dot-grid"></div>
  <div class="hero-inner">
    <div class="hero-badge"><span class="dot"></span><span>API Monitor · Dark · Heartbeat #466</span></div>
    <h1>ZINC<span>·</span><br>Zero noise.<br>One signal.</h1>
    <p class="sub">API performance monitoring built for backend engineers. One color. One focus. Real-time latency, error rates, and anomaly detection — all in operational dark.</p>
    <div class="cta-row">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="cta-primary">View Prototype</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="cta-secondary">Interactive Mock ☀◑</a>
    </div>
    <div class="meta-row">
      <div class="meta-item"><span class="meta-val amber">99.98%</span><span class="meta-label">Uptime</span></div>
      <div class="meta-item"><span class="meta-val">142ms</span><span class="meta-label">P95 Latency</span></div>
      <div class="meta-item"><span class="meta-val green">8,432</span><span class="meta-label">Req/min</span></div>
      <div class="meta-item"><span class="meta-val">6</span><span class="meta-label">Screens</span></div>
      <div class="meta-item"><span class="meta-val">1,224</span><span class="meta-label">Elements</span></div>
    </div>
  </div>
</section>

<section class="screens-section">
  <p class="section-label">Screens</p>
  <div class="carousel">
    ${pen.screens.map((s, i) => `
    <div class="screen-card${i === 0 ? ' active' : ''}">
      <img src="${svgDataUris[i]}" alt="${s.name}">
      <div class="screen-name">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features">
  <p class="section-label">Design Features</p>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon"></div>
      <div class="feat-title">One-Color Maximum</div>
      <div class="feat-desc">Single amber accent (#F5A623) across all 6 screens. Every highlight, badge, and CTA uses the same hue — inspired by Alphamark's neon-on-black restraint from godly.website.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon"></div>
      <div class="feat-title">Dot-Grid Texture</div>
      <div class="feat-desc">Staggered dot-grid overlays at low opacity create ambient motion depth — directly borrowed from Linear's 5×5 animated grid with randomized opacity values.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon"></div>
      <div class="feat-title">Operational Dark</div>
      <div class="feat-desc">Dark mode as a productivity environment (Vercel/Linear style), not a theatrical statement. No gradients, no glass — just obsidian surfaces and maximum data legibility.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon"></div>
      <div class="feat-title">Status Semantics</div>
      <div class="feat-desc">Error red and OK green appear only as semantic signals, never as brand accents. The amber accent stays isolated — making every amber element feel instantly meaningful.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon"></div>
      <div class="feat-title">Live Log Stream</div>
      <div class="feat-desc">Left-edge colored bars act as severity rails — a terminal-inspired pattern that lets the eye scan 50+ log lines without reading each one.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon"></div>
      <div class="feat-title">Latency Histograms</div>
      <div class="feat-desc">Bar charts use a tri-color encoding (green/amber/red) keyed to the SLA threshold — the degraded /v2/search endpoint burns red at a glance without any text label.</div>
    </div>
  </div>
</section>

<section class="inspiration">
  <div class="inspiration-inner">
    <p class="section-label">Research Sources</p>
    ${[
      { site: 'godly.website — Alphamark', detail: 'Neon yellow on flat black — a single accent color as the entire personality. No gradients. No photography. Hierarchy from hue contrast alone (~20:1). Applied here as the one-amber-only rule.' },
      { site: 'godly.website — Linear', detail: '5×5 dot grid animation with staggered opacity transitions (0.3 → 1.0), looping at 3.2s. Hardware-responsive rendering. Semantic color token system for dark mode. The template for "operational dark" as a design philosophy.' },
      { site: 'darkmodedesign.com — Stella Petkova', detail: 'Single lavender accent on near-monochrome dark canvas. Restrained palette as a statement: the less you use a color, the more it carries. Confidence to leave negative space unfilled.' },
    ].map(i => `<div class="inspo-item"><div class="inspo-dot"></div><div class="inspo-text"><strong>${i.site}</strong> — ${i.detail}</div></div>`).join('')}
  </div>
</section>

<section class="palette-section">
  <p class="section-label">Palette</p>
  <div style="display:flex;gap:24px;flex-wrap:wrap">
    ${[
      { hex: BG,    name: 'Obsidian BG' },
      { hex: SURF,  name: 'Surface' },
      { hex: CARD,  name: 'Card' },
      { hex: TEXT,  name: 'Text' },
      { hex: MUTED, name: 'Muted' },
      { hex: ACC,   name: 'Amber ★' },
      { hex: POS,   name: 'OK' },
      { hex: NEG,   name: 'Error' },
    ].map(s => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <div class="swatch" style="background:${s.hex}"></div>
      <div class="swatch-label">${s.hex}</div>
      <div class="swatch-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="links-section">
  <p class="section-label">Links</p>
  <div class="link-row">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="link-pill">Prototype Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="link-pill">Interactive Mock ☀◑</a>
  </div>
</section>

<footer>
  <span>ZINC — ${TAGLINE}</span>
  <span class="acc">RAM Design Heartbeat #466 · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
</footer>

</body></html>`;

// ── viewer ────────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

// ── publish ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status}  https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log(`Viewer: ${r2.status}  https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
