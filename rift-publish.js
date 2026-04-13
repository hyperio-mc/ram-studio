'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG     = 'rift';
const APP_NAME = 'RIFT';
const TAGLINE  = 'Engineering health, at a glance.';

// Palette
const BG = '#0A0E14', SURF = '#0F1923', CARD = '#142232', CARD2 = '#1C2E40';
const ACC = '#00D4FF', ACC2 = '#7FFF00', RED = '#FF4F5E', AMBER = '#FFB347';
const TEXT = '#E8F4F8', TEXT2 = '#7BA8C0', TEXT3 = '#4A6E85';

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

// Extract SVG screens as data URIs for hero carousel
const screenPreviews = pen.screens.map((s, i) => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return { name: s.name, dataUri: `data:image/svg+xml;base64,${encoded}`, index: i };
});

// Palette swatches
const swatches = [
  { color: BG,    label: 'Background' },
  { color: SURF,  label: 'Surface'    },
  { color: CARD,  label: 'Card'       },
  { color: ACC,   label: 'Cyan'       },
  { color: ACC2,  label: 'Chartreuse' },
  { color: RED,   label: 'Alert'      },
  { color: AMBER, label: 'Warning'    },
  { color: TEXT,  label: 'Text'       },
];

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:${BG};--surf:${SURF};--card:${CARD};--card2:${CARD2};
    --acc:${ACC};--acc2:${ACC2};--red:${RED};--amber:${AMBER};
    --text:${TEXT};--text2:${TEXT2};--text3:${TEXT3};
    --border:rgba(0,212,255,0.12);
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
  
  /* Radial glow */
  body::before{
    content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);
    width:800px;height:500px;
    background:radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 65%);
    pointer-events:none;z-index:0;
  }

  /* Dotted grid bg */
  body::after{
    content:'';position:fixed;inset:0;
    background-image:radial-gradient(circle, rgba(0,212,255,0.06) 1px, transparent 1px);
    background-size:28px 28px;
    pointer-events:none;z-index:0;
  }

  .container{max-width:1100px;margin:0 auto;padding:0 32px;position:relative;z-index:1}

  /* Nav */
  nav{display:flex;align-items:center;justify-content:space-between;padding:24px 32px;border-bottom:1px solid var(--border);position:relative;z-index:10}
  .nav-logo{font-size:18px;font-weight:700;letter-spacing:4px;color:var(--text)}
  .nav-logo span{color:var(--acc)}
  .nav-links{display:flex;gap:32px;list-style:none}
  .nav-links a{color:var(--text2);text-decoration:none;font-size:14px;transition:color 0.2s}
  .nav-links a:hover{color:var(--acc)}
  .nav-cta{background:var(--acc);color:var(--bg);padding:10px 22px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;transition:opacity 0.2s}
  .nav-cta:hover{opacity:0.85}

  /* Hero */
  .hero{padding:80px 32px 60px;text-align:center}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);color:var(--acc);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:1.5px;margin-bottom:28px}
  .hero-badge::before{content:'';width:6px;height:6px;background:var(--acc2);border-radius:50%;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .hero h1{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:700;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px}
  .hero h1 .acc{color:var(--acc)}
  .hero h1 .acc2{color:var(--acc2)}
  .hero-sub{font-size:18px;color:var(--text2);max-width:540px;margin:0 auto 36px;line-height:1.65}
  .hero-ctas{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
  .btn-primary{background:var(--acc);color:var(--bg);padding:14px 28px;border-radius:8px;font-weight:600;text-decoration:none;font-size:15px;transition:opacity 0.2s}
  .btn-primary:hover{opacity:0.85}
  .btn-secondary{background:transparent;color:var(--text2);padding:14px 28px;border-radius:8px;font-weight:500;text-decoration:none;font-size:15px;border:1px solid var(--border);transition:all 0.2s}
  .btn-secondary:hover{color:var(--text);border-color:var(--acc)}

  /* DORA metrics strip */
  .metrics-strip{display:flex;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin:52px 32px}
  .metric-cell{flex:1;background:var(--surf);padding:24px 20px;text-align:center}
  .metric-cell .val{font-size:28px;font-weight:700;font-family:monospace;margin-bottom:4px}
  .metric-cell .lbl{font-size:11px;color:var(--text3);letter-spacing:1.5px;font-weight:600}
  .metric-cell .trend{font-size:11px;font-weight:500;margin-top:4px}

  /* Screen carousel */
  .screens-section{padding:20px 32px 60px}
  .screens-section h2{font-size:13px;color:var(--text3);letter-spacing:2px;font-weight:600;margin-bottom:28px}
  .screens-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  @media(max-width:700px){.screens-grid{grid-template-columns:repeat(2,1fr)}}
  .screen-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:transform 0.2s,box-shadow 0.2s}
  .screen-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,212,255,0.1)}
  .screen-card img{width:100%;display:block}
  .screen-card .screen-label{padding:10px 14px;font-size:11px;color:var(--text2);font-weight:500;letter-spacing:0.5px;border-top:1px solid var(--border)}

  /* Features section */
  .features{padding:20px 32px 60px}
  .features h2{font-size:13px;color:var(--text3);letter-spacing:2px;font-weight:600;margin-bottom:28px}
  .features-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  @media(max-width:600px){.features-grid{grid-template-columns:1fr}}
  .feature-card{background:var(--surf);border:1px solid var(--border);border-radius:12px;padding:24px}
  .feature-card .icon{font-size:22px;margin-bottom:12px}
  .feature-card h3{font-size:15px;font-weight:600;margin-bottom:8px}
  .feature-card p{font-size:13px;color:var(--text2);line-height:1.6}

  /* Palette */
  .palette-section{padding:0 32px 60px}
  .palette-section h2{font-size:13px;color:var(--text3);letter-spacing:2px;font-weight:600;margin-bottom:20px}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:6px}
  .swatch-dot{width:40px;height:40px;border-radius:8px;border:1px solid rgba(255,255,255,0.08)}
  .swatch-label{font-size:10px;color:var(--text3);font-weight:500}

  /* Inspiration note */
  .inspiration{margin:0 32px 60px;padding:20px 24px;background:var(--surf);border:1px solid var(--border);border-radius:10px;font-size:13px;color:var(--text2);line-height:1.65}
  .inspiration strong{color:var(--acc);font-weight:600}

  /* Footer */
  footer{border-top:1px solid var(--border);padding:28px 32px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--text3)}
  footer a{color:var(--acc);text-decoration:none}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">RI<span>F</span>T</div>
  <ul class="nav-links">
    <li><a href="#">Health</a></li>
    <li><a href="#">Incidents</a></li>
    <li><a href="#">Velocity</a></li>
    <li><a href="#">Alerts</a></li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try Mock →</a>
</nav>

<div class="hero">
  <div class="hero-badge">HEARTBEAT #468 · DARK THEME</div>
  <h1>Engineering health,<br><span class="acc">at a glance</span></h1>
  <p class="hero-sub">RIFT surfaces your DORA metrics, incident history, code quality, and team velocity in one coherent dark dashboard.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</div>

<div class="metrics-strip container">
  <div class="metric-cell">
    <div class="val" style="color:${ACC2}">4.2</div>
    <div class="lbl">DEPLOYS/DAY</div>
    <div class="trend" style="color:${ACC2}">+12%</div>
  </div>
  <div class="metric-cell">
    <div class="val" style="color:${ACC}">2.8h</div>
    <div class="lbl">LEAD TIME</div>
    <div class="trend" style="color:${ACC}">-18%</div>
  </div>
  <div class="metric-cell">
    <div class="val" style="color:${AMBER}">14m</div>
    <div class="lbl">MTTR</div>
    <div class="trend" style="color:${AMBER}">-5%</div>
  </div>
  <div class="metric-cell">
    <div class="val" style="color:${RED}">3.2%</div>
    <div class="lbl">CHANGE FAIL</div>
    <div class="trend" style="color:${RED}">+0.4%</div>
  </div>
  <div class="metric-cell">
    <div class="val" style="color:${ACC}">87</div>
    <div class="lbl">DORA SCORE</div>
    <div class="trend" style="color:${ACC2}">Top 15%</div>
  </div>
</div>

<div class="screens-section container">
  <h2>6 SCREENS</h2>
  <div class="screens-grid">
    ${screenPreviews.map(s => `
    <div class="screen-card">
      <img src="${s.dataUri}" alt="${s.name}" loading="lazy">
      <div class="screen-label">${s.index + 1}. ${s.name}</div>
    </div>`).join('')}
  </div>
</div>

<div class="features container">
  <h2>DESIGN DECISIONS</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="icon">🟦</div>
      <h3>Fintech/Data Dark palette</h3>
      <p>Navy-black (#0A0E14) from Land-book's palette D — warmer than cold grey, cooler than pure black. Cyan accent with chartreuse for positive data points creates immediate signal clarity.</p>
    </div>
    <div class="feature-card">
      <div class="icon">⬡</div>
      <h3>Tonal elevation, zero shadows</h3>
      <p>Cards step from #0A0E14 → #0F1923 → #142232 → #1C2E40 — four elevation levels using only surface lightening. No drop shadows needed; depth reads through tint alone, per Material Design 3's dark model.</p>
    </div>
    <div class="feature-card">
      <div class="icon">◈</div>
      <h3>Monospace data language</h3>
      <p>All numeric metrics, SHAs, and code IDs use a distinct monospace color (#A8D4E8) that separates data from labels without extra weight, inspired by the Saaspo "Linear Look" code aesthetic.</p>
    </div>
    <div class="feature-card">
      <div class="icon">▦</div>
      <h3>Severity-striped alerts</h3>
      <p>3px left border stripe encodes P1/P2/P3 severity before the eye reaches text — borrowed from the incident management UX patterns seen on Linear and PagerDuty dark interfaces.</p>
    </div>
  </div>
</div>

<div class="palette-section container">
  <h2>PALETTE</h2>
  <div class="swatches">
    ${swatches.map(s => `
    <div class="swatch">
      <div class="swatch-dot" style="background:${s.color}"></div>
      <span class="swatch-label">${s.label}</span>
    </div>`).join('')}
  </div>
</div>

<div class="inspiration container">
  <strong>Inspiration:</strong> Land-book's "Fintech/Data Dark" palette (deep navy #0F1923 + electric cyan #00D4FF + chartreuse data points) combined with Saaspo's documentation of the "Linear Look" — near-black foundations, barely-visible tinted borders (rgba(0,212,255,0.12)), and monospace accent colors for technical content. The bento 2×2 DORA metrics grid directly mirrors the asymmetric feature card layouts catalogued on godly.website. Theme: Dark (Heartbeat #468).
</div>

<footer>
  <span>RIFT — RAM Design Heartbeat #468 · ${new Date().toISOString().split('T')[0]}</span>
  <span>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> ·
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
  </span>
</footer>

</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0, 80)}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0, 80)}`);

  console.log(`\nHero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}
main().catch(console.error);
