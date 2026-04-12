'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'lobster';

const BG     = '#FAF8F5';
const SURF   = '#FFFFFF';
const CARD   = '#F5F0E8';
const BORDER = '#EAE4D8';
const TEXT   = '#1A140E';
const TEXT2  = '#6B5E4E';
const TEXT3  = '#B09C88';
const CORAL  = '#E85D2F';
const CORAL_L= '#FDF0EB';
const TEAL   = '#0D7377';
const TEAL_L = '#E8F4F4';
const AMBER  = '#D4820A';
const AMB_L  = '#FDF4E3';
const RED    = '#C94040';
const RED_L  = '#FAEAEA';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org', port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'X-Subdomain': 'ram' },
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

function renderSVG(screen, W, H) {
  const lines = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`];
  for (const el of screen.elements) {
    if (el.type === 'rect') {
      const attrs = [`x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}"`, `fill="${el.fill}"`,
        el.rx ? `rx="${el.rx}"` : '',
        el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.sw||1}"` : '',
        el.opacity != null && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
      ].filter(Boolean).join(' ');
      lines.push(`<rect ${attrs}/>`);
    } else if (el.type === 'text') {
      const anchor = el.anchor === 'middle' ? 'middle' : el.anchor === 'end' ? 'end' : 'start';
      const opacity = el.opacity != null && el.opacity !== 1 ? ` opacity="${el.opacity}"` : '';
      const ls = el.ls ? ` letter-spacing="${el.ls}"` : '';
      lines.push(`<text x="${el.x}" y="${el.y}" fill="${el.fill}" font-size="${el.size}" font-weight="${el.fw||400}" font-family="${el.font||'Inter,sans-serif'}" text-anchor="${anchor}"${opacity}${ls}>${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`);
    } else if (el.type === 'circle') {
      const attrs = [`cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"`,
        el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.sw||1}"` : '',
        el.opacity != null && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
      ].filter(Boolean).join(' ');
      lines.push(`<circle ${attrs}/>`);
    } else if (el.type === 'line') {
      const opacity = el.opacity != null && el.opacity !== 1 ? ` opacity="${el.opacity}"` : '';
      lines.push(`<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw||1}"${opacity}/>`);
    }
  }
  lines.push('</svg>');
  return lines.join('\n');
}

const screenSVGs = pen.screens.map(s => renderSVG(s, 390, 844));
const screenDataURIs = screenSVGs.map(svg => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LOBSTER — Agent Fleet Manager</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${BG};--surf:${SURF};--card:${CARD};--border:${BORDER};
    --text:${TEXT};--text2:${TEXT2};--text3:${TEXT3};
    --coral:${CORAL};--coral-l:${CORAL_L};
    --teal:${TEAL};--teal-l:${TEAL_L};
    --amber:${AMBER};--amb-l:${AMB_L};
    --red:${RED};--red-l:${RED_L};
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh}
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:16px 32px;
    background:rgba(250,248,245,0.90);backdrop-filter:blur(12px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo{font-size:18px;font-weight:900;letter-spacing:1.5px;color:var(--coral)}
  .nav-links{display:flex;gap:28px}
  .nav-links a{font-size:13px;font-weight:500;color:var(--text2);text-decoration:none}
  .nav-cta{background:var(--coral);color:#fff;padding:8px 20px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none}

  /* HERO */
  .hero{
    padding:120px 32px 80px;max-width:1100px;margin:0 auto;
    display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;
  }
  .eyebrow{
    display:inline-flex;align-items:center;gap:8px;
    background:var(--coral-l);color:var(--coral);
    padding:6px 14px;border-radius:999px;
    font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:24px;
  }
  .eyebrow::before{content:'🦞';font-size:14px}
  h1{font-size:56px;font-weight:900;line-height:1.0;letter-spacing:-1.8px;margin-bottom:20px}
  h1 .acc{color:var(--coral)}
  .hero-sub{font-size:17px;color:var(--text2);line-height:1.6;margin-bottom:36px;max-width:420px}
  .hero-actions{display:flex;gap:12px;align-items:center;margin-bottom:48px}
  .btn-primary{background:var(--coral);color:#fff;padding:14px 28px;border-radius:999px;font-size:14px;font-weight:700;text-decoration:none}
  .btn-secondary{background:transparent;color:var(--text);padding:14px 28px;border-radius:999px;font-size:14px;font-weight:500;text-decoration:none;border:1.5px solid var(--border)}
  .hero-stats{display:flex;gap:36px}
  .stat-val{font-size:22px;font-weight:900;letter-spacing:-0.4px}
  .stat-label{font-size:11px;color:var(--text3);font-weight:600;letter-spacing:0.8px;text-transform:uppercase;margin-top:2px}

  /* Status strip */
  .status-strip{
    display:flex;gap:0;border-radius:8px;overflow:hidden;
    margin-bottom:20px;height:8px;
  }
  .status-seg{height:8px}

  /* PHONE */
  .hero-visual{display:flex;justify-content:center}
  .phone-frame{
    background:var(--surf);border-radius:36px;overflow:hidden;
    border:1.5px solid var(--border);width:220px;
    height:calc(220px * 844/390);
    box-shadow:0 24px 60px rgba(232,93,47,0.10),0 8px 24px rgba(0,0,0,0.06);
  }
  .phone-frame img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}

  /* SCREENS */
  .screens{padding:80px 32px;max-width:1100px;margin:0 auto}
  .section-label{font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--text3);margin-bottom:12px}
  .screens h2{font-size:40px;font-weight:900;letter-spacing:-1px;margin-bottom:48px}
  .screens h2 .acc{color:var(--coral)}
  .screen-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .screen-card{background:var(--surf);border:1.5px solid var(--border);border-radius:20px;overflow:hidden;text-decoration:none;color:inherit;display:block;transition:border-color 0.2s,box-shadow 0.2s}
  .screen-card:hover{border-color:var(--coral);box-shadow:0 8px 32px rgba(232,93,47,0.08)}
  .screen-img{width:100%;aspect-ratio:390/844;object-fit:cover;object-position:top;display:block}
  .screen-meta{padding:12px 16px;display:flex;justify-content:space-between}
  .screen-name{font-size:13px;font-weight:700;color:var(--text)}
  .screen-count{font-size:11px;color:var(--text3)}

  /* STATUS SYSTEM */
  .status-section{padding:80px 32px;background:var(--card);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .status-inner{max-width:1100px;margin:0 auto}
  .status-inner h2{font-size:36px;font-weight:900;letter-spacing:-0.8px;margin-bottom:48px}
  .status-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .status-card{background:var(--surf);border-radius:16px;padding:24px;border:1.5px solid var(--border)}
  .status-dot{width:10px;height:10px;border-radius:50%;margin-bottom:14px}
  .status-name{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
  .status-desc{font-size:13px;color:var(--text2);line-height:1.5}

  /* PALETTE */
  .palette-section{padding:80px 32px;max-width:1100px;margin:0 auto}
  .palette-section h2{font-size:36px;font-weight:900;letter-spacing:-0.8px;margin-bottom:8px}
  .palette-section p{font-size:14px;color:var(--text2);margin-bottom:36px}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;gap:6px;min-width:72px}
  .swatch-color{width:72px;height:72px;border-radius:14px;border:1px solid rgba(0,0,0,0.06)}
  .swatch-name{font-size:11px;font-weight:700;color:var(--text);letter-spacing:0.3px}
  .swatch-hex{font-size:10px;color:var(--text3);font-family:monospace}

  footer{padding:36px 32px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;max-width:1100px;margin:0 auto}
  .footer-logo{font-size:14px;font-weight:900;color:var(--coral)}
  .footer-links{display:flex;gap:24px}
  .footer-links a{font-size:12px;color:var(--text2);text-decoration:none;font-weight:500}
  .footer-note{font-size:11px;color:var(--text3)}

  @media(max-width:768px){
    .hero{grid-template-columns:1fr;padding:100px 20px 60px}
    .hero-visual{order:-1}
    .screen-grid{grid-template-columns:repeat(2,1fr)}
    .status-grid{grid-template-columns:repeat(2,1fr)}
    h1{font-size:40px}
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">🦞 LOBSTER</div>
  <div class="nav-links">
    <a href="#">Fleet</a>
    <a href="#">Spawn</a>
    <a href="#">Logs</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">View Prototype →</a>
</nav>

<section class="hero">
  <div>
    <div class="eyebrow"> Agent Fleet Manager</div>
    <h1>All your<br><span class="acc">claws,</span><br>coordinated.</h1>
    <p class="hero-sub">Spawn agents, monitor their work, kill the ones that go sideways. LOBSTER gives your AI fleet a single control surface — Fleet, Spawn, Tasks, Logs, Config.</p>
    <div class="status-strip">
      <div class="status-seg" style="width:72%;background:${TEAL}"></div>
      <div class="status-seg" style="width:18%;background:${AMBER}"></div>
      <div class="status-seg" style="width:10%;background:${RED}"></div>
    </div>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View Prototype →</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-val">6</div><div class="stat-label">Screens</div></div>
      <div class="stat"><div class="stat-val">546</div><div class="stat-label">Elements</div></div>
      <div class="stat"><div class="stat-val">Light</div><div class="stat-label">Theme</div></div>
      <div class="stat"><div class="stat-val">#52</div><div class="stat-label">Heartbeat</div></div>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-frame">
      <img src="${screenDataURIs[0]}" alt="LOBSTER — Fleet">
    </div>
  </div>
</section>

<section class="screens">
  <div class="section-label">All Screens</div>
  <h2>Six screens. Full <span class="acc">fleet</span> control.</h2>
  <div class="screen-grid">
    ${pen.screens.map((s,i) => `
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="screen-card">
      <img src="${screenDataURIs[i]}" alt="${s.name}" class="screen-img">
      <div class="screen-meta">
        <span class="screen-name">${s.name}</span>
        <span class="screen-count">${s.elements.length} el</span>
      </div>
    </a>`).join('')}
  </div>
</section>

<section class="status-section">
  <div class="status-inner">
    <div class="section-label">Status System</div>
    <h2>Every claw has a state.</h2>
    <div class="status-grid">
      <div class="status-card">
        <div class="status-dot" style="background:${TEAL}"></div>
        <div class="status-name" style="color:${TEAL}">Running</div>
        <div class="status-desc">Agent is actively working. CPU and memory meters live. Can be stopped at any time.</div>
      </div>
      <div class="status-card">
        <div class="status-dot" style="background:${AMBER}"></div>
        <div class="status-name" style="color:${AMBER}">Queued</div>
        <div class="status-desc">Waiting for a dependency or resource slot. Will auto-start when unblocked.</div>
      </div>
      <div class="status-card">
        <div class="status-dot" style="background:${CORAL}"></div>
        <div class="status-name" style="color:${CORAL}">Spawning</div>
        <div class="status-desc">Agent initialising — loading tools, inheriting context, preparing first turn.</div>
      </div>
      <div class="status-card">
        <div class="status-dot" style="background:${RED}"></div>
        <div class="status-name" style="color:${RED}">Failed</div>
        <div class="status-desc">Context exceeded, tool error, or explicit stop. Retry available from the task queue.</div>
      </div>
    </div>
  </div>
</section>

<section class="palette-section">
  <h2>Palette</h2>
  <p>Lobster coral on warm cream — the accent earns its name.</p>
  <div class="swatches">
    ${[
      { name:'BG',      color:BG,      hex:BG },
      { name:'SURF',    color:SURF,    hex:SURF },
      { name:'CARD',    color:CARD,    hex:CARD },
      { name:'TEXT',    color:TEXT,    hex:TEXT },
      { name:'CORAL',   color:CORAL,   hex:CORAL },
      { name:'CORAL-L', color:CORAL_L, hex:CORAL_L },
      { name:'TEAL',    color:TEAL,    hex:TEAL },
      { name:'AMBER',   color:AMBER,   hex:AMBER },
      { name:'RED',     color:RED,     hex:RED },
    ].map(s => `<div class="swatch">
      <div class="swatch-color" style="background:${s.color}"></div>
      <div class="swatch-name">${s.name}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div class="footer-logo">🦞 LOBSTER</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
    <a href="https://ram.zenbin.org/journal">Journal</a>
  </div>
  <div class="footer-note">RAM Design Heartbeat #52 · Requested by Rakis</div>
</footer>

</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'LOBSTER — Agent Fleet Manager');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'LOBSTER — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
