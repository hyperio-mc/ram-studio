'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'mark';

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const BG     = '#FAF9F6';
const SURF   = '#FFFFFF';
const CARD   = '#F4F2EC';
const BORDER = '#E8E5DC';
const TEXT   = '#1A2218';
const TEXT2  = '#6B7A6A';
const TEXT3  = '#B4BDB4';
const TEAL   = '#017C6E';
const TEAL_L = '#E8F4F2';
const AMBER  = '#D97C2A';
const AMB_L  = '#FBF0E6';
const RED    = '#C94040';
const PROJ_COLORS = ['#017C6E','#6366F1','#D97C2A','#C94040'];

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

// ─── SVG THUMBNAIL RENDERER ──────────────────────────────────────────────────
function renderSVG(screen, W, H) {
  const lines = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`];
  for (const el of screen.elements) {
    if (el.type === 'rect') {
      const attrs = [
        `x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}"`,
        `fill="${el.fill}"`,
        el.rx ? `rx="${el.rx}"` : '',
        el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.sw||1}"` : '',
        el.opacity != null && el.opacity !== 1 ? `opacity="${el.opacity}"` : '',
      ].filter(Boolean).join(' ');
      lines.push(`<rect ${attrs}/>`);
    } else if (el.type === 'text') {
      const anchor = el.anchor === 'middle' ? 'middle' : el.anchor === 'end' ? 'end' : 'start';
      const fw = el.fw || 400;
      const font = el.font || 'Inter,sans-serif';
      const opacity = el.opacity != null && el.opacity !== 1 ? ` opacity="${el.opacity}"` : '';
      const ls = el.ls ? ` letter-spacing="${el.ls}"` : '';
      lines.push(`<text x="${el.x}" y="${el.y}" fill="${el.fill}" font-size="${el.size}" font-weight="${fw}" font-family="${font}" text-anchor="${anchor}"${opacity}${ls}>${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`);
    } else if (el.type === 'circle') {
      const attrs = [
        `cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"`,
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

// ─── HERO PAGE ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MARK — Freelance Time & Billing</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${BG};
    --surf:${SURF};
    --card:${CARD};
    --border:${BORDER};
    --text:${TEXT};
    --text2:${TEXT2};
    --text3:${TEXT3};
    --teal:${TEAL};
    --teal-l:${TEAL_L};
    --amber:${AMBER};
    --amb-l:${AMB_L};
    --red:${RED};
  }
  body{
    background:var(--bg);
    color:var(--text);
    font-family:'Inter',system-ui,sans-serif;
    min-height:100vh;
  }

  /* ── NAV ── */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:16px 32px;
    background:rgba(250,249,246,0.88);
    backdrop-filter:blur(12px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo{font-size:18px;font-weight:800;letter-spacing:2px;color:var(--teal)}
  .nav-links{display:flex;gap:28px}
  .nav-links a{font-size:14px;font-weight:500;color:var(--text2);text-decoration:none}
  .nav-cta{
    background:var(--teal);color:#fff;
    padding:8px 20px;border-radius:999px;
    font-size:14px;font-weight:600;text-decoration:none;
  }

  /* ── HERO ── */
  .hero{
    padding:120px 32px 80px;
    max-width:1100px;margin:0 auto;
    display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;
  }
  .hero-eyebrow{
    display:inline-flex;align-items:center;gap:8px;
    background:var(--teal-l);color:var(--teal);
    padding:6px 14px;border-radius:999px;
    font-size:12px;font-weight:600;letter-spacing:0.5px;
    margin-bottom:24px;
  }
  .hero-eyebrow::before{
    content:'';width:6px;height:6px;
    background:var(--teal);border-radius:50%;
    animation:pulse 2s ease-in-out infinite;
  }
  @keyframes pulse{
    0%,100%{opacity:1;transform:scale(1)}
    50%{opacity:0.5;transform:scale(0.8)}
  }
  h1{font-size:52px;font-weight:800;line-height:1.1;letter-spacing:-1.5px;margin-bottom:20px}
  h1 span{color:var(--teal)}
  .hero-sub{font-size:18px;color:var(--text2);line-height:1.6;margin-bottom:36px;max-width:420px}
  .hero-actions{display:flex;gap:12px;align-items:center;margin-bottom:48px}
  .btn-primary{
    background:var(--teal);color:#fff;
    padding:14px 28px;border-radius:999px;
    font-size:15px;font-weight:600;text-decoration:none;
  }
  .btn-secondary{
    background:transparent;color:var(--text);
    padding:14px 28px;border-radius:999px;
    font-size:15px;font-weight:500;text-decoration:none;
    border:1.5px solid var(--border);
  }
  .hero-stats{display:flex;gap:32px}
  .stat{display:flex;flex-direction:column;gap:2px}
  .stat-val{font-size:22px;font-weight:800;color:var(--text);letter-spacing:-0.5px}
  .stat-label{font-size:12px;color:var(--text2);font-weight:500}

  /* ── FLOATING PILL PHONE ── */
  .hero-visual{display:flex;justify-content:center;align-items:center;position:relative}
  .phone-wrap{
    position:relative;
    width:220px;
    filter:drop-shadow(0 24px 48px rgba(1,124,110,0.12)) drop-shadow(0 8px 16px rgba(0,0,0,0.06));
  }
  .phone-frame{
    background:var(--surf);
    border-radius:36px;
    overflow:hidden;
    border:1.5px solid var(--border);
    width:220px;
    height:calc(220px * 844/390);
    position:relative;
  }
  .phone-frame img{width:100%;height:100%;object-fit:cover;object-position:top}
  /* Floating pill tab indicator — Mobbin pattern */
  .floating-pill{
    position:absolute;
    bottom:-16px;
    left:50%;
    transform:translateX(-50%);
    background:rgba(255,255,255,0.92);
    border:1px solid var(--border);
    border-radius:999px;
    padding:8px 20px;
    font-size:11px;
    font-weight:600;
    color:var(--teal);
    white-space:nowrap;
    backdrop-filter:blur(8px);
    box-shadow:0 4px 16px rgba(0,0,0,0.06);
  }

  /* ── SCREENS CAROUSEL ── */
  .screens{
    padding:80px 32px;
    max-width:1100px;margin:0 auto;
  }
  .screens-label{
    font-size:12px;font-weight:600;letter-spacing:0.5px;
    color:var(--text3);text-transform:uppercase;margin-bottom:12px;
  }
  .screens h2{font-size:36px;font-weight:800;letter-spacing:-0.8px;margin-bottom:48px}
  .screens h2 span{color:var(--teal)}
  .screen-grid{
    display:grid;grid-template-columns:repeat(3,1fr);gap:20px;
  }
  .screen-card{
    background:var(--surf);
    border:1.5px solid var(--border);
    border-radius:20px;overflow:hidden;
    transition:box-shadow 0.2s;cursor:pointer;
    text-decoration:none;color:inherit;
    display:block;
  }
  .screen-card:hover{box-shadow:0 8px 32px rgba(1,124,110,0.10);}
  .screen-img{
    width:100%;aspect-ratio:390/844;
    object-fit:cover;object-position:top;
    display:block;
  }
  .screen-meta{padding:12px 16px}
  .screen-name{font-size:14px;font-weight:600;color:var(--text)}
  .screen-count{font-size:12px;color:var(--text2);margin-top:2px}

  /* ── FEATURES ── */
  .features{
    padding:80px 32px;
    background:var(--card);
    border-top:1px solid var(--border);
    border-bottom:1px solid var(--border);
  }
  .features-inner{max-width:1100px;margin:0 auto}
  .features-label{font-size:12px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-transform:uppercase;margin-bottom:12px}
  .features h2{font-size:36px;font-weight:800;letter-spacing:-0.8px;margin-bottom:48px}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .feat-card{background:var(--surf);border-radius:20px;padding:28px;border:1.5px solid var(--border)}
  .feat-icon{
    width:48px;height:48px;border-radius:14px;
    display:flex;align-items:center;justify-content:center;
    font-size:22px;margin-bottom:20px;
  }
  .feat-title{font-size:17px;font-weight:700;margin-bottom:8px}
  .feat-sub{font-size:14px;color:var(--text2);line-height:1.6}

  /* ── PALETTE ── */
  .palette-section{
    padding:80px 32px;
    max-width:1100px;margin:0 auto;
  }
  .palette-section h2{font-size:36px;font-weight:800;letter-spacing:-0.8px;margin-bottom:8px}
  .palette-section p{font-size:15px;color:var(--text2);margin-bottom:40px}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{
    display:flex;flex-direction:column;gap:8px;
    min-width:80px;
  }
  .swatch-color{
    width:80px;height:80px;border-radius:16px;
    border:1px solid rgba(0,0,0,0.06);
  }
  .swatch-name{font-size:12px;font-weight:600;color:var(--text)}
  .swatch-hex{font-size:11px;color:var(--text2);font-family:monospace}

  /* ── FOOTER ── */
  footer{
    padding:40px 32px;
    border-top:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;
    max-width:1100px;margin:0 auto;
  }
  .footer-logo{font-size:14px;font-weight:800;letter-spacing:2px;color:var(--teal)}
  .footer-links{display:flex;gap:24px}
  .footer-links a{font-size:13px;color:var(--text2);text-decoration:none}

  /* ── INSPIRATION NOTE ── */
  .inspo{
    padding:60px 32px;
    background:var(--teal);
    color:#fff;
  }
  .inspo-inner{max-width:1100px;margin:0 auto}
  .inspo h3{font-size:28px;font-weight:800;letter-spacing:-0.5px;margin-bottom:16px}
  .inspo p{font-size:15px;line-height:1.7;opacity:0.85;max-width:620px}
  .inspo-sources{margin-top:24px;display:flex;flex-wrap:wrap;gap:10px}
  .inspo-chip{
    background:rgba(255,255,255,0.18);
    border-radius:999px;
    padding:6px 14px;
    font-size:12px;font-weight:600;
  }

  @media(max-width:768px){
    .hero{grid-template-columns:1fr;padding:100px 20px 60px}
    .hero-visual{order:-1}
    .screen-grid{grid-template-columns:repeat(2,1fr)}
    .feat-grid{grid-template-columns:1fr}
    .swatches{gap:10px}
    h1{font-size:36px}
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">MARK</div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="#">Designers</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">View in Viewer →</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">RAM Heartbeat #50</div>
    <h1>Freelance billing,<br><span>actually easy.</span></h1>
    <p class="hero-sub">Track time by project. Build invoices in seconds. Know exactly how much you've earned — before, during, and after every session.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View Prototype →</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
    <div class="hero-stats">
      <div class="stat">
        <span class="stat-val">6</span>
        <span class="stat-label">Screens</span>
      </div>
      <div class="stat">
        <span class="stat-val">500</span>
        <span class="stat-label">Elements</span>
      </div>
      <div class="stat">
        <span class="stat-val">Light</span>
        <span class="stat-label">Theme</span>
      </div>
      <div class="stat">
        <span class="stat-val">#50</span>
        <span class="stat-label">Heartbeat</span>
      </div>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-wrap">
      <div class="phone-frame">
        <img src="${screenDataURIs[0]}" alt="MARK — Today screen">
      </div>
      <div class="floating-pill">◉ Today · ◫ Projects · ◷ Timer</div>
    </div>
  </div>
</section>

<section class="screens">
  <div class="screens-label">All Screens</div>
  <h2>6 screens. Every <span>freelance</span> workflow.</h2>
  <div class="screen-grid">
    ${pen.screens.map((s, i) => `
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="screen-card">
      <img src="${screenDataURIs[i]}" alt="${s.name}" class="screen-img">
      <div class="screen-meta">
        <div class="screen-name">${s.name}</div>
        <div class="screen-count">${s.elements.length} elements</div>
      </div>
    </a>`).join('')}
  </div>
</section>

<section class="features">
  <div class="features-inner">
    <div class="features-label">Design Decisions</div>
    <h2>Three choices that define the feel.</h2>
    <div class="feat-grid">
      <div class="feat-card">
        <div class="feat-icon" style="background:${TEAL_L}">◷</div>
        <div class="feat-title">Floating Glassmorphic Nav</div>
        <div class="feat-sub">Pill tab bar floats 12px above the bottom edge — not anchored to the screen bottom. Inspired by Mobbin's floating nav pattern (2025). Creates space, reduces visual weight vs. solid full-width bars.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon" style="background:${TEAL_L}">◫</div>
        <div class="feat-title">Land-book Teal on Cream</div>
        <div class="feat-sub">Palette anchored to Land-book's exact brand teal (#017C6E) on warm off-white (#FAF9F6). Non-generic combination — deeper and more trustworthy than cyan or mint. Warm cream reads more expensive than pure white.</div>
      </div>
      <div class="feat-card">
        <div class="feat-icon" style="background:${TEAL_L}">◈</div>
        <div class="feat-title">Project Colour Left-Border</div>
        <div class="feat-sub">4px left border in each project's accent color (teal, indigo, amber, red) replaces category icons and avatars. Borrowed from Siteinspire's editorial card restraint — depth through background shifts, not shadows.</div>
      </div>
    </div>
  </div>
</section>

<section class="inspo">
  <div class="inspo-inner">
    <h3>What inspired this</h3>
    <p>Browsed Land-book, Mobbin, Siteinspire, and Lapa this run. Land-book's own brand teal (#017C6E) against their warm off-white background stood out as an unusually trustworthy palette for a productivity tool — not techy-cyan, not corporate-navy, just honest deep green. Mobbin's floating pill nav (frosted, detached from the bottom edge) is clearly the dominant mobile navigation trend for 2025. Siteinspire pushed editorial restraint: no drop shadows, no card borders — depth purely through background lightness shift.</p>
    <div class="inspo-sources">
      <span class="inspo-chip">Land-book — teal #017C6E palette</span>
      <span class="inspo-chip">Mobbin — floating glassmorphic pill nav</span>
      <span class="inspo-chip">Siteinspire — editorial restraint</span>
      <span class="inspo-chip">Lapa / Trade Suit — warm cream fintech</span>
    </div>
  </div>
</section>

<section class="palette-section">
  <h2>Palette</h2>
  <p>Land-book teal on warm cream — editorial without being cold.</p>
  <div class="swatches">
    ${[
      { name:'BG', color:BG, hex:BG },
      { name:'SURF', color:SURF, hex:SURF },
      { name:'CARD', color:CARD, hex:CARD },
      { name:'TEXT', color:TEXT, hex:TEXT },
      { name:'TEXT2', color:TEXT2, hex:TEXT2 },
      { name:'TEAL', color:TEAL, hex:TEAL },
      { name:'TEAL-L', color:TEAL_L, hex:TEAL_L },
      { name:'AMBER', color:AMBER, hex:AMBER },
      { name:'RED', color:RED, hex:RED },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.color}"></div>
      <div class="swatch-name">${s.name}</div>
      <div class="swatch-hex">${s.hex}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div class="footer-logo">MARK</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
    <a href="https://ram.zenbin.org">RAM Studio</a>
  </div>
  <div style="font-size:12px;color:var(--text3)">RAM Design Heartbeat #50</div>
</footer>

</body>
</html>`;

// ─── VIEWER ───────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'MARK — Freelance Time & Billing');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'MARK — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
