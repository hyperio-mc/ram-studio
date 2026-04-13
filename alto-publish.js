'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'alto';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
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

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);
const P = pen.metadata.palette;

// ── Hero page ────────────────────────────────────────────────────────────────
// Warm cream editorial design, inspired by minimal.gallery aesthetic.
// Features screen carousel + bento feature cards + palette swatches.

function buildScreenSVG(screen) {
  const W = 390, H = 844;
  const els = screen.elements || [];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  els.forEach(e => {
    if (e.type === 'rect') {
      const attrs = [
        `x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}"`,
        `fill="${e.fill}"`,
        e.rx ? `rx="${e.rx}"` : '',
        e.opacity !== 1 ? `opacity="${e.opacity}"` : '',
        e.stroke && e.stroke !== 'none' ? `stroke="${e.stroke}" stroke-width="${e.strokeWidth}"` : '',
      ].filter(Boolean).join(' ');
      svg += `<rect ${attrs}/>`;
    } else if (e.type === 'circle') {
      const attrs = [
        `cx="${e.cx}" cy="${e.cy}" r="${e.r}"`,
        `fill="${e.fill}"`,
        e.opacity !== 1 ? `opacity="${e.opacity}"` : '',
        e.stroke && e.stroke !== 'none' ? `stroke="${e.stroke}" stroke-width="${e.strokeWidth}"` : '',
      ].filter(Boolean).join(' ');
      svg += `<circle ${attrs}/>`;
    } else if (e.type === 'text') {
      const anchor = e.textAnchor || 'start';
      const attrs = [
        `x="${e.x}" y="${e.y}"`,
        `font-size="${e.size}"`,
        `fill="${e.fill}"`,
        `font-family="${e.fontFamily}"`,
        `font-weight="${e.fontWeight}"`,
        `text-anchor="${anchor}"`,
        e.letterSpacing ? `letter-spacing="${e.letterSpacing}"` : '',
        e.opacity !== 1 ? `opacity="${e.opacity}"` : '',
      ].filter(Boolean).join(' ');
      const safe = String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svg += `<text ${attrs}>${safe}</text>`;
    } else if (e.type === 'line') {
      const attrs = [
        `x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}"`,
        `stroke="${e.stroke}"`,
        `stroke-width="${e.strokeWidth}"`,
        e.opacity !== 1 ? `opacity="${e.opacity}"` : '',
      ].filter(Boolean).join(' ');
      svg += `<line ${attrs}/>`;
    }
  });
  svg += '</svg>';
  return svg;
}

const screens = pen.screens;
const screenSVGs = screens.map(s => buildScreenSVG(s));
const screenDataURIs = screenSVGs.map(svg => {
  const b64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
});

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ALTO — Wealth, clearly.</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#FAF7F2;
    --surf:#FFFFFF;
    --card:#F2EDE4;
    --card2:#EDE5D8;
    --border:#E0D8CC;
    --text:#1C1814;
    --sub:#7A6D60;
    --muted:#B4A898;
    --acc:#4A3728;
    --acc2:#7B9B6B;
    --acc3:#C8A26E;
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh}
  /* Top nav */
  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 40px;border-bottom:1px solid var(--border);background:var(--bg)}
  .nav-logo{font-size:20px;font-weight:700;letter-spacing:3px;color:var(--acc)}
  .nav-links{display:flex;gap:24px}
  .nav-links a{font-size:13px;color:var(--sub);text-decoration:none}
  .nav-cta{background:var(--acc);color:#fff;border:none;padding:10px 20px;border-radius:24px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none}

  /* Hero */
  .hero{padding:80px 40px 60px;max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
  .hero-text h1{font-family:'Georgia',serif;font-size:54px;font-weight:600;line-height:1.1;color:var(--text);margin-bottom:20px}
  .hero-text h1 em{font-style:normal;color:var(--acc2)}
  .hero-text p{font-size:17px;color:var(--sub);line-height:1.6;margin-bottom:32px;max-width:400px}
  .cta-row{display:flex;gap:12px;align-items:center}
  .btn-primary{background:var(--acc);color:#fff;border:none;padding:14px 28px;border-radius:28px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block}
  .btn-secondary{color:var(--acc);font-size:14px;font-weight:500;text-decoration:none;display:flex;align-items:center;gap:6px}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--card2);border:1px solid var(--border);border-radius:20px;padding:8px 16px;font-size:12px;color:var(--sub);margin-bottom:24px}
  .badge-dot{width:6px;height:6px;border-radius:50%;background:var(--acc2)}

  /* Screen carousel */
  .screens-wrap{display:flex;gap:16px;align-items:flex-end;position:relative}
  .screen-card{background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,55,40,0.08)}
  .screen-card.primary{width:200px;flex-shrink:0}
  .screen-card.secondary{width:160px;flex-shrink:0;opacity:0.7;transform:scale(0.92);transform-origin:bottom}
  .screen-card img,.screen-card svg,.screen-card object{width:100%;display:block}
  .screen-label{font-size:11px;color:var(--muted);text-align:center;padding:8px 0 4px;font-weight:500}

  /* Features section */
  .features{padding:60px 40px;max-width:1200px;margin:0 auto}
  .section-kicker{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--acc3);text-transform:uppercase;margin-bottom:12px}
  .section-title{font-family:'Georgia',serif;font-size:36px;font-weight:600;color:var(--text);margin-bottom:40px;max-width:500px;line-height:1.2}
  /* Bento grid */
  .bento{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;gap:16px}
  .bento-item{background:var(--surf);border:1px solid var(--border);border-radius:20px;padding:28px}
  .bento-item.wide{grid-column:span 2}
  .bento-item.tall{grid-row:span 2}
  .bento-item.accent-bg{background:var(--acc);color:#fff}
  .bento-item.accent-bg .bi-title,.bento-item.accent-bg .bi-body{color:rgba(255,255,255,0.9)}
  .bi-icon{font-size:24px;margin-bottom:16px;display:block}
  .bi-title{font-size:16px;font-weight:600;color:var(--text);margin-bottom:8px}
  .bi-body{font-size:13px;color:var(--sub);line-height:1.5}
  .bi-stat{font-family:'Georgia',serif;font-size:36px;font-weight:600;color:var(--acc);margin:12px 0 4px}
  .bi-stat-sub{font-size:12px;color:var(--sub)}

  /* Palette section */
  .palette-section{padding:40px 40px 0;max-width:1200px;margin:0 auto}
  .swatches{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
  .swatch{display:flex;align-items:center;gap:10px;background:var(--surf);border:1px solid var(--border);border-radius:12px;padding:10px 16px}
  .swatch-dot{width:28px;height:28px;border-radius:8px;border:1px solid rgba(0,0,0,0.06)}
  .swatch-info{display:flex;flex-direction:column}
  .swatch-name{font-size:11px;font-weight:600;color:var(--text)}
  .swatch-hex{font-size:10px;color:var(--muted);font-family:monospace}

  /* Screen gallery strip */
  .gallery{padding:40px;max-width:1200px;margin:0 auto}
  .gallery-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
  .gallery-item{background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden}
  .gallery-item img{width:100%;display:block}
  .gallery-name{font-size:9px;color:var(--muted);text-align:center;padding:6px 4px 4px}

  /* Links */
  .links-row{display:flex;gap:16px;padding:20px 40px 40px;max-width:1200px;margin:0 auto}
  .link-chip{display:inline-flex;align-items:center;gap:6px;background:var(--surf);border:1px solid var(--border);border-radius:20px;padding:10px 20px;font-size:13px;color:var(--acc);text-decoration:none;font-weight:500}
  .link-chip:hover{background:var(--card)}

  /* Footer */
  footer{border-top:1px solid var(--border);padding:24px 40px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--muted)}
</style>
</head>
<body>

<nav>
  <span class="nav-logo">ALTO</span>
  <div class="nav-links">
    <a href="#">Portfolio</a>
    <a href="#">Markets</a>
    <a href="#">Goals</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/alto-viewer">View in Pencil ↗</a>
</nav>

<section class="hero">
  <div class="hero-text">
    <div class="hero-badge"><span class="badge-dot"></span>Heartbeat #43 — Light Theme</div>
    <h1>Wealth, <em>clearly.</em></h1>
    <p>ALTO brings warm editorial clarity to personal finance — portfolio tracking, market pulse, and goal planning in one calm, considered app.</p>
    <div class="cta-row">
      <a class="btn-primary" href="https://ram.zenbin.org/alto-viewer">Open in Viewer</a>
      <a class="btn-secondary" href="https://ram.zenbin.org/alto-mock">Interactive Mock →</a>
    </div>
  </div>
  <div class="screens-wrap">
    <div class="screen-card primary">
      <img src="${screenDataURIs[0]}" alt="Portfolio Overview"/>
      <div class="screen-label">Portfolio Overview</div>
    </div>
    <div class="screen-card secondary">
      <img src="${screenDataURIs[1]}" alt="Performance"/>
      <div class="screen-label">Performance</div>
    </div>
    <div class="screen-card secondary" style="opacity:0.45;transform:scale(0.84)">
      <img src="${screenDataURIs[4]}" alt="Goals"/>
      <div class="screen-label">Goals</div>
    </div>
  </div>
</section>

<section class="features">
  <div class="section-kicker">Design Decisions</div>
  <div class="section-title">Warm minimalism meets financial clarity.</div>
  <div class="bento">
    <div class="bento-item accent-bg">
      <span class="bi-icon">◈</span>
      <div class="bi-title">Bento Dashboard</div>
      <div class="bi-body">Asymmetric tile grid for portfolio overview — saaspo.com's fastest-growing layout adapted for mobile finance.</div>
    </div>
    <div class="bento-item">
      <span class="bi-icon">𝔸</span>
      <div class="bi-title">Serif × Sans Editorial</div>
      <div class="bi-body">Georgia for figures and display, Inter for UI — lapa.ninja's "serif headline return" trend applied to numbers, not just headers.</div>
    </div>
    <div class="bento-item">
      <span class="bi-stat">+12.4%</span>
      <div class="bi-stat-sub">YTD return in warm cream</div>
    </div>
    <div class="bento-item wide">
      <span class="bi-icon">🌿</span>
      <div class="bi-title">Warm Cream Light Palette</div>
      <div class="bi-body">BG #FAF7F2, deep brown accent #4A3728, sage green #7B9B6B — minimal.gallery's "warm minimalism" counter-movement to sterile tech blues. Earthy tones signal premium trust without cold authority.</div>
    </div>
    <div class="bento-item">
      <span class="bi-icon">→</span>
      <div class="bi-title">Story-Driven Market Brief</div>
      <div class="bi-body">Hero editorial card on Market Pulse uses narrative framing — inspired by lapa.ninja's story-driven hero trend.</div>
    </div>
    <div class="bento-item">
      <span class="bi-stat" style="font-size:28px;color:#7B9B6B">3 Goals</span>
      <div class="bi-stat-sub">Progress-first planning screen</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="section-kicker">Palette</div>
  <div class="swatches">
    ${[
      ['Background','#FAF7F2'],['Surface','#FFFFFF'],['Card','#F2EDE4'],
      ['Deep Brown','#4A3728'],['Sage Green','#7B9B6B'],['Warm Gold','#C8A26E'],
      ['Terracotta','#B85C38'],['Forest','#5A8A5A'],['Text','#1C1814'],
    ].map(([name,hex]) => `
    <div class="swatch">
      <div class="swatch-dot" style="background:${hex}"></div>
      <div class="swatch-info">
        <span class="swatch-name">${name}</span>
        <span class="swatch-hex">${hex}</span>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="gallery">
  <div class="section-kicker" style="margin-bottom:16px">All Screens</div>
  <div class="gallery-grid">
    ${screens.map((s, i) => `
    <div class="gallery-item">
      <img src="${screenDataURIs[i]}" alt="${s.name}"/>
      <div class="gallery-name">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<div class="links-row">
  <a class="link-chip" href="https://ram.zenbin.org/alto-viewer">◈ Pencil Viewer</a>
  <a class="link-chip" href="https://ram.zenbin.org/alto-mock">☀◑ Interactive Mock</a>
</div>

<footer>
  <span>ALTO · RAM Design Heartbeat #43 · Apr 2026</span>
  <span>Inspired by minimal.gallery · lapa.ninja · saaspo.com</span>
</footer>

</body>
</html>`;

// ── Viewer page (with embedded pen) ─────────────────────────────────────────
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing ALTO hero page...');
  const r1 = await publish(SLUG, heroHtml, 'ALTO — Wealth, clearly.');
  console.log(`Hero: ${r1.status}`, r1.status >= 400 ? r1.body.slice(0,120) : 'OK');

  console.log('Publishing ALTO viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'ALTO — Pencil Viewer');
  console.log(`Viewer: ${r2.status}`, r2.status >= 400 ? r2.body.slice(0,120) : 'OK');
}
main().catch(console.error);
