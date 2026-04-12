'use strict';
const fs = require('fs'), path = require('path'), https = require('https');

const SLUG = 'hum';

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const BASE    = '#111209';
const SURF    = '#191C11';
const CARD    = '#20241A';
const RAIL    = '#282D20';
const LIME    = '#A3E635';
const LIME_D  = '#232E12';
const MAGENTA = '#E535B7';
const MAG_D   = '#2A1023';
const TEXT    = '#F0EDE0';
const TEXT2   = '#9A9A82';
const TEXT3   = '#4E4E3A';

const ALBUM_COLORS = [
  ['#7B2D8B','#D94F3D'],
  ['#1A3A7C','#4AADE8'],
  ['#7C4A1A','#E8A93A'],
  ['#1C6A3C','#5DD68A'],
  ['#6A1C52','#D65A9A'],
  ['#1A5C7C','#3ABBE8'],
];

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
<title>HUM — Music for the way you feel</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --base:${BASE};
    --surf:${SURF};
    --card:${CARD};
    --rail:${RAIL};
    --lime:${LIME};
    --lime-d:${LIME_D};
    --magenta:${MAGENTA};
    --mag-d:${MAG_D};
    --text:${TEXT};
    --text2:${TEXT2};
    --text3:${TEXT3};
  }
  body{
    background:var(--base);
    color:var(--text);
    font-family:'Inter',system-ui,sans-serif;
    min-height:100vh;
    overflow-x:hidden;
  }

  /* ── NAV ── */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 32px;
    background:rgba(17,18,9,0.85);
    backdrop-filter:blur(12px);
    border-bottom:1px solid var(--rail);
  }
  .nav-logo{
    font-size:22px;font-weight:900;letter-spacing:2px;
    color:var(--lime);
  }
  .nav-links{display:flex;gap:32px}
  .nav-links a{font-size:13px;font-weight:600;color:var(--text2);text-decoration:none;letter-spacing:0.5px;text-transform:uppercase}
  .nav-cta{
    background:var(--lime);color:var(--base);
    padding:8px 20px;border-radius:999px;
    font-size:13px;font-weight:800;text-decoration:none;letter-spacing:0.5px;
  }

  /* ── HERO ── */
  .hero{
    min-height:100vh;
    display:flex;align-items:center;
    padding:120px 32px 80px;
    position:relative;
    overflow:hidden;
  }
  /* Album atmosphere glow */
  .hero::before{
    content:'';
    position:absolute;top:-20%;left:-10%;
    width:60%;height:70%;
    background:radial-gradient(ellipse, rgba(123,45,139,0.30) 0%, transparent 70%);
    pointer-events:none;
  }
  .hero::after{
    content:'';
    position:absolute;bottom:-20%;right:-10%;
    width:50%;height:60%;
    background:radial-gradient(ellipse, rgba(217,79,61,0.20) 0%, transparent 70%);
    pointer-events:none;
  }
  .hero-inner{
    max-width:1100px;margin:0 auto;
    display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;
    position:relative;z-index:1;
  }
  .hero-eyebrow{
    display:inline-flex;align-items:center;gap:8px;
    background:var(--lime-d);color:var(--lime);
    padding:6px 14px;border-radius:999px;
    font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;
    margin-bottom:24px;
  }
  .hero-eyebrow::before{
    content:'';width:6px;height:6px;
    background:var(--magenta);border-radius:50%;
    animation:magbeat 1.6s ease-in-out infinite;
  }
  @keyframes magbeat{
    0%,100%{opacity:1;transform:scale(1)}
    50%{opacity:0.3;transform:scale(0.6)}
  }
  h1{
    font-size:64px;font-weight:900;
    line-height:0.95;letter-spacing:-2.5px;
    margin-bottom:24px;
    text-transform:lowercase;
  }
  h1 .dim{opacity:0.30}
  h1 .acc{color:var(--lime)}
  .hero-sub{
    font-size:17px;color:var(--text2);line-height:1.6;
    margin-bottom:36px;max-width:420px;
  }
  .hero-actions{display:flex;gap:12px;align-items:center;margin-bottom:48px}
  .btn-primary{
    background:var(--lime);color:var(--base);
    padding:14px 28px;border-radius:999px;
    font-size:14px;font-weight:800;text-decoration:none;letter-spacing:0.5px;
    text-transform:uppercase;
  }
  .btn-secondary{
    background:transparent;color:var(--text);
    padding:14px 28px;border-radius:999px;
    font-size:14px;font-weight:600;text-decoration:none;
    border:1.5px solid var(--rail);
  }
  .hero-stats{display:flex;gap:40px}
  .stat{display:flex;flex-direction:column;gap:3px}
  .stat-val{font-size:24px;font-weight:900;letter-spacing:-0.5px;color:var(--text)}
  .stat-label{font-size:11px;color:var(--text3);font-weight:600;letter-spacing:0.8px;text-transform:uppercase}

  /* ── PHONE ── */
  .hero-visual{position:relative;display:flex;justify-content:center}
  .phone-wrap{position:relative}
  .phone-frame{
    background:var(--surf);
    border-radius:36px;
    overflow:hidden;
    border:1.5px solid var(--rail);
    width:220px;
    height:calc(220px * 844/390);
    box-shadow:
      0 0 80px rgba(163,230,53,0.08),
      0 0 40px rgba(229,53,183,0.05),
      0 32px 80px rgba(0,0,0,0.60);
  }
  .phone-frame img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}

  /* ── SCREENS SECTION ── */
  .screens{
    padding:100px 32px;
    max-width:1100px;margin:0 auto;
  }
  .section-eyebrow{
    font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
    color:var(--text3);margin-bottom:12px;
  }
  .screens h2{
    font-size:48px;font-weight:900;letter-spacing:-1.5px;
    margin-bottom:12px;text-transform:lowercase;line-height:1.0;
  }
  .screens h2 .acc{color:var(--lime)}
  .screens .sub{font-size:16px;color:var(--text2);margin-bottom:52px}
  .screen-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .screen-card{
    background:var(--surf);
    border:1.5px solid var(--rail);
    border-radius:20px;overflow:hidden;
    cursor:pointer;text-decoration:none;color:inherit;display:block;
    transition:border-color 0.2s,box-shadow 0.2s;
  }
  .screen-card:hover{
    border-color:var(--lime);
    box-shadow:0 0 24px rgba(163,230,53,0.10);
  }
  .screen-img{width:100%;aspect-ratio:390/844;object-fit:cover;object-position:top;display:block}
  .screen-meta{padding:12px 16px;display:flex;justify-content:space-between;align-items:center}
  .screen-name{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text)}
  .screen-count{font-size:11px;color:var(--text3)}

  /* ── ZUNE INSPIRATION ── */
  .inspo{
    background:var(--surf);
    border-top:1px solid var(--rail);
    border-bottom:1px solid var(--rail);
    padding:80px 32px;
  }
  .inspo-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
  .inspo h2{font-size:40px;font-weight:900;letter-spacing:-1px;margin-bottom:16px;line-height:1.1;text-transform:lowercase}
  .inspo h2 .acc{color:var(--lime)}
  .inspo p{font-size:15px;color:var(--text2);line-height:1.7;margin-bottom:24px}
  .inspo-chips{display:flex;flex-wrap:wrap;gap:8px}
  .inspo-chip{
    background:var(--lime-d);color:var(--lime);
    border-radius:999px;padding:6px 14px;
    font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;
  }
  .inspo-chip.mag{background:var(--mag-d);color:var(--magenta)}

  /* Zune color palettes visual */
  .zune-palettes{display:flex;flex-direction:column;gap:10px}
  .zune-row{display:flex;gap:4px;border-radius:8px;overflow:hidden}
  .zune-swatch{flex:1;height:52px;display:flex;align-items:flex-end;padding:8px}
  .zune-swatch span{font-size:10px;font-weight:700;color:rgba(255,255,255,0.70)}

  /* ── FEATURES ── */
  .features{padding:80px 32px;max-width:1100px;margin:0 auto}
  .features h2{font-size:40px;font-weight:900;letter-spacing:-1px;margin-bottom:48px;text-transform:lowercase}
  .features h2 .acc{color:var(--lime)}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .feat-card{
    background:var(--surf);border:1.5px solid var(--rail);
    border-radius:20px;padding:28px;
  }
  .feat-icon{
    width:48px;height:48px;border-radius:12px;
    display:flex;align-items:center;justify-content:center;
    font-size:22px;margin-bottom:20px;
  }
  .feat-title{font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:10px}
  .feat-sub{font-size:14px;color:var(--text2);line-height:1.6}

  /* ── PALETTE ── */
  .palette-section{padding:80px 32px;background:var(--surf);border-top:1px solid var(--rail)}
  .palette-inner{max-width:1100px;margin:0 auto}
  .palette-inner h2{font-size:36px;font-weight:900;letter-spacing:-0.8px;margin-bottom:8px;text-transform:lowercase}
  .palette-inner p{font-size:14px;color:var(--text2);margin-bottom:36px}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;gap:6px;min-width:72px}
  .swatch-color{width:72px;height:72px;border-radius:14px;border:1px solid var(--rail)}
  .swatch-name{font-size:11px;font-weight:700;color:var(--text);letter-spacing:0.3px;text-transform:uppercase}
  .swatch-hex{font-size:10px;color:var(--text3);font-family:monospace}

  /* ── FOOTER ── */
  footer{
    padding:36px 32px;border-top:1px solid var(--rail);
    max-width:1100px;margin:0 auto;
    display:flex;align-items:center;justify-content:space-between;
  }
  .footer-logo{font-size:16px;font-weight:900;letter-spacing:2px;color:var(--lime);text-transform:uppercase}
  .footer-links{display:flex;gap:24px}
  .footer-links a{font-size:12px;color:var(--text2);text-decoration:none;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
  .footer-credit{font-size:11px;color:var(--text3)}

  @media(max-width:768px){
    .hero-inner{grid-template-columns:1fr;padding:80px 20px 60px}
    .hero-visual{order:-1}
    .screen-grid{grid-template-columns:repeat(2,1fr)}
    .feat-grid{grid-template-columns:1fr}
    .inspo-inner{grid-template-columns:1fr}
    h1{font-size:44px}
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">HUM</div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Now Playing</a>
    <a href="#">Party</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">View Prototype →</a>
</nav>

<section class="hero">
  <div class="hero-inner">
    <div>
      <div class="hero-eyebrow">RAM Heartbeat #51</div>
      <h1>music<br>for the<br><span class="acc">way</span><br><span class="dim">you feel.</span></h1>
      <p class="hero-sub">Dark canvas. One accent. Album art that bleeds into the atmosphere. Inspired by the Zune design revival — the antidote to corporate minimalism.</p>
      <div class="hero-actions">
        <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">▶ View Prototype</a>
        <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
      </div>
      <div class="hero-stats">
        <div class="stat"><span class="stat-val">6</span><span class="stat-label">Screens</span></div>
        <div class="stat"><span class="stat-val">519</span><span class="stat-label">Elements</span></div>
        <div class="stat"><span class="stat-val">Dark</span><span class="stat-label">Theme</span></div>
        <div class="stat"><span class="stat-val">#51</span><span class="stat-label">Heartbeat</span></div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="phone-wrap">
        <div class="phone-frame">
          <img src="${screenDataURIs[0]}" alt="HUM — Now Playing">
        </div>
      </div>
    </div>
  </div>
</section>

<section class="screens">
  <div class="section-eyebrow">All Screens</div>
  <h2>six screens.<br>every mood.</h2>
  <p class="sub">Now Playing · Library · Radio · Artist · Playlist · Listening Party</p>
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

<section class="inspo">
  <div class="inspo-inner">
    <div>
      <div class="section-eyebrow">What Inspired This</div>
      <h2>the <span class="acc">zune</span><br>revival.</h2>
      <p>Reddit's r/UI_Design surfaced a thread this week where a Python developer recreated the Zune Desktop UI — and the community lit up: "The Zune vibe comes through immediately, especially the typography and that dark canvas with accent color." A dozen comments lamented that we've traded creative abundance for neo-brutalist conformity.</p>
      <p>Zune's design DNA: warm dark canvas (not cold #000000), a single bold accent color, typography as the primary visual element. No gradients, no illustrations — just type and art, bleeding together.</p>
      <div class="inspo-chips">
        <span class="inspo-chip">r/UI_Design — Zune Revival</span>
        <span class="inspo-chip">awwwards — Bricolage Grotesque</span>
        <span class="inspo-chip mag">reflect.app — chromatic near-black</span>
        <span class="inspo-chip mag">Dribbble — album art atmosphere</span>
      </div>
    </div>
    <div class="zune-palettes">
      ${ALBUM_COLORS.map((c,i) => `
      <div class="zune-row">
        <div class="zune-swatch" style="background:${c[0]};flex:2"><span>${c[0]}</span></div>
        <div class="zune-swatch" style="background:${c[1]}"><span>${c[1]}</span></div>
        <div class="zune-swatch" style="background:${BASE}"><span>BASE</span></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="features">
  <h2>three design <span class="acc">decisions.</span></h2>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background:${LIME_D}">◎</div>
      <div class="feat-title">Album Art as Atmosphere</div>
      <div class="feat-sub">Each screen extracts the dominant colors from its album art and bleeds them into the background as a radial gradient. The UI disappears — the music's mood becomes the interface. Most streaming apps clip album art to a square; HUM lets it breathe.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:${LIME_D}">◷</div>
      <div class="feat-title">Waveform Scrubber</div>
      <div class="feat-sub">The standard progress bar is replaced by a generated waveform — 56 narrow bars, each height derived from a sine function seeded by position. Bars before the playhead fill in lime green; bars after stay in the rail color. Shows the texture of the track, not just the position.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:${MAG_D}">◈</div>
      <div class="feat-title">Typography as the Hero</div>
      <div class="feat-sub">Artist names and track titles render at 32–52px, weight 900, tight letter-spacing. Zune's most distinctive pattern: text is the primary visual element, not icons. The library screen's opener — "your music." — is typeset at 36px/800 weight before any content loads.</div>
    </div>
  </div>
</section>

<section class="palette-section">
  <div class="palette-inner">
    <h2>palette</h2>
    <p>Warm charcoal canvas + Zune lime + magenta for social moments</p>
    <div class="swatches">
      ${[
        { name:'BASE',    color:BASE,    hex:BASE },
        { name:'SURF',    color:SURF,    hex:SURF },
        { name:'CARD',    color:CARD,    hex:CARD },
        { name:'RAIL',    color:RAIL,    hex:RAIL },
        { name:'LIME',    color:LIME,    hex:LIME },
        { name:'LIME-D',  color:LIME_D,  hex:LIME_D },
        { name:'MAGENTA', color:MAGENTA, hex:MAGENTA },
        { name:'TEXT',    color:TEXT,    hex:TEXT },
        { name:'TEXT2',   color:TEXT2,   hex:TEXT2 },
        { name:'TEXT3',   color:TEXT3,   hex:TEXT3 },
      ].map(s => `
      <div class="swatch">
        <div class="swatch-color" style="background:${s.color}"></div>
        <div class="swatch-name">${s.name}</div>
        <div class="swatch-hex">${s.hex}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">HUM</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
    <a href="https://ram.zenbin.org">RAM Studio</a>
  </div>
  <div class="footer-credit">RAM Design Heartbeat #51</div>
</footer>

</body>
</html>`;

// ─── VIEWER ───────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  const r1 = await publish(SLUG, heroHtml, 'HUM — Music for the way you feel');
  console.log(`Hero: ${r1.status}`);
  const r2 = await publish(SLUG+'-viewer', viewerHtml, 'HUM — Viewer');
  console.log(`Viewer: ${r2.status}`);
}
main().catch(console.error);
