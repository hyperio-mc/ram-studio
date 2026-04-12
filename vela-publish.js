'use strict';
const fs = require('fs'), path = require('path'), https = require('https');
const SLUG = 'vela2';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram'
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

const BG = '#111111', SURF = '#191818', TEXT = '#F6F4F1', ACC = '#00E599', MUTED = 'rgba(246,244,241,0.5)';

// Render each screen as an inline SVG thumbnail
function screenToSVG(screen, w=200, h=360) {
  const scaleX = w/390, scaleY = h/844;
  let svgContent = '';
  (screen.elements || []).forEach(el => {
    if (el.type === 'rect') {
      svgContent += `<rect x="${el.x*scaleX}" y="${el.y*scaleY}" width="${el.width*scaleX}" height="${el.height*scaleY}" fill="${el.fill}" rx="${(el.rx||0)*scaleX}" opacity="${el.opacity??1}" stroke="${el.stroke||'none'}" stroke-width="${(el.strokeWidth||0)*scaleX}"/>`;
    } else if (el.type === 'text' && (el.fontSize||12)*Math.min(scaleX,scaleY) > 4) {
      const fs = Math.max(4, (el.fontSize||12)*Math.min(scaleX,scaleY));
      svgContent += `<text x="${el.x*scaleX}" y="${el.y*scaleY}" font-size="${fs}" fill="${el.fill}" font-weight="${el.fontWeight||400}" opacity="${el.opacity??1}" text-anchor="${el.textAnchor||'start'}">${String(el.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      svgContent += `<circle cx="${el.cx*scaleX}" cy="${el.cy*scaleY}" r="${el.r*Math.min(scaleX,scaleY)}" fill="${el.fill}" opacity="${el.opacity??1}"/>`;
    } else if (el.type === 'line') {
      svgContent += `<line x1="${el.x1*scaleX}" y1="${el.y1*scaleY}" x2="${el.x2*scaleX}" y2="${el.y2*scaleY}" stroke="${el.stroke}" stroke-width="${(el.strokeWidth||1)*scaleX}" opacity="${el.opacity??1}"/>`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svgContent}</svg>`;
}

const screenCards = pen.screens.map((s, i) => {
  const svg = screenToSVG(s);
  const svgDataUri = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  return `
    <div style="flex:0 0 auto;width:160px;border-radius:14px;overflow:hidden;border:1px solid rgba(246,244,241,0.08);background:${SURF};">
      <img src="${svgDataUri}" width="160" height="288" style="display:block;" alt="${s.name}" />
      <div style="padding:8px 10px;font-size:11px;color:${MUTED};letter-spacing:0.03em;">${s.name}</div>
    </div>`;
}).join('');

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VELA — Edge Analytics for AI Applications</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${BG};color:${TEXT};font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
a{color:${ACC};text-decoration:none}
.hero{padding:80px 32px 64px;max-width:900px;margin:0 auto}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;letter-spacing:0.1em;color:${ACC};background:rgba(0,229,153,0.1);border:1px solid rgba(0,229,153,0.2);border-radius:20px;padding:4px 12px;margin-bottom:24px}
.badge-dot{width:6px;height:6px;border-radius:50%;background:${ACC};animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
h1{font-size:clamp(52px,10vw,88px);font-weight:800;letter-spacing:-0.04em;line-height:1;margin-bottom:16px;color:${TEXT}}
h1 span{color:${ACC}}
.sub{font-size:18px;color:${MUTED};max-width:480px;line-height:1.6;margin-bottom:40px}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:80px}
.btn-primary{background:${ACC};color:${BG};padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.02em}
.btn-secondary{background:rgba(246,244,241,0.06);color:${TEXT};padding:14px 28px;border-radius:10px;font-weight:500;font-size:14px;border:1px solid rgba(246,244,241,0.1)}
.screens-scroll{overflow-x:auto;padding:0 32px 32px;scrollbar-width:none}
.screens-scroll::-webkit-scrollbar{display:none}
.screens-row{display:flex;gap:16px;width:max-content;padding:4px}
.section{padding:64px 32px;max-width:900px;margin:0 auto}
.section-label{font-size:11px;letter-spacing:0.12em;color:${ACC};font-weight:600;margin-bottom:12px;text-transform:uppercase}
.section-title{font-size:clamp(28px,5vw,40px);font-weight:700;letter-spacing:-0.02em;margin-bottom:40px}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.feat{background:${SURF};border:1px solid rgba(246,244,241,0.08);border-radius:14px;padding:24px}
.feat-icon{font-size:24px;margin-bottom:12px}
.feat h3{font-size:14px;font-weight:600;margin-bottom:6px}
.feat p{font-size:12px;color:${MUTED};line-height:1.6}
.palette{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.swatch{width:48px;height:48px;border-radius:8px;border:1px solid rgba(246,244,241,0.1)}
.swatch-label{font-size:10px;color:${MUTED};margin-top:4px;font-family:monospace}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
.stat{text-align:center;padding:24px;background:${SURF};border-radius:14px;border:1px solid rgba(246,244,241,0.08)}
.stat-num{font-size:36px;font-weight:800;color:${ACC};letter-spacing:-0.03em}
.stat-label{font-size:11px;color:${MUTED};margin-top:4px}
footer{padding:40px 32px;text-align:center;border-top:1px solid rgba(246,244,241,0.06);font-size:12px;color:${MUTED}}
</style>
</head>
<body>
<div class="hero">
  <div class="badge"><span class="badge-dot"></span>Heartbeat #470 · April 11, 2026</div>
  <h1>VELA<br><span>Edge analytics.</span><br>Instantly.</h1>
  <p class="sub">Sub-millisecond query latency across 48 global edge regions. Built for AI applications that can't afford to wait.</p>
  <div class="actions">
    <a class="btn-primary" href="https://ram.zenbin.org/vela2-viewer">View in Pencil →</a>
    <a class="btn-secondary" href="https://ram.zenbin.org/vela2-mock">Interactive Mock ☀◑</a>
  </div>
</div>

<div class="screens-scroll">
  <div class="screens-row">${screenCards}</div>
</div>

<div class="section">
  <div class="section-label">Design language</div>
  <div class="section-title">Off-black. Single accent.<br>Text as texture.</div>
  <div class="features">
    <div class="feat"><div class="feat-icon">⚡</div><h3>Real-time Event Stream</h3><p>Sub-second ingestion with live filtering across all event types and regions.</p></div>
    <div class="feat"><div class="feat-icon">◈</div><h3>SQL Query Explorer</h3><p>Write and run queries directly on your edge data. Results in milliseconds.</p></div>
    <div class="feat"><div class="feat-icon">▲</div><h3>48-Region Edge Network</h3><p>Data lives close to your users. Queries execute at the edge, not the origin.</p></div>
    <div class="feat"><div class="feat-icon">◉</div><h3>Usage Transparency</h3><p>Real-time billing meters. Know exactly what you're consuming before the invoice.</p></div>
  </div>
</div>

<div class="section">
  <div class="section-label">Palette</div>
  <div class="section-title">Warm off-black + single<br>electric teal</div>
  <p style="color:${MUTED};font-size:13px;line-height:1.7">Inspired by Neon.com's restraint — one accent at full saturation against near-black. Off-black ${BG} (not pure #000) adds warmth. Warm off-white ${TEXT} as text instead of pure white.</p>
  <div class="palette">
    ${[['#111111','BG'],['#191818','Surf'],['#1E1E1E','Card'],['#00E599','Teal'],['#F6F4F1','Text']].map(([c,n])=>`<div><div class="swatch" style="background:${c}"></div><div class="swatch-label">${c}<br>${n}</div></div>`).join('')}
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-num">6</div><div class="stat-label">Screens</div></div>
    <div class="stat"><div class="stat-num">${pen.metadata.elements}</div><div class="stat-label">Elements</div></div>
    <div class="stat"><div class="stat-num">3</div><div class="stat-label">Colors</div></div>
  </div>
</div>

<footer>
  RAM Design Heartbeat #470 · <a href="https://ram.zenbin.org">ram.zenbin.org</a> · April 11, 2026
</footer>
</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'VELA — Edge Analytics for AI Applications');
  console.log(`Hero: ${r1.status}`);
  
  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'VELA — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
