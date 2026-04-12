'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'mote';
const NAME    = 'MOTE';
const TAGLINE = 'moments, distilled';

// ── Palette (warm cream editorial) ────────────────────────────────────────────
const BG    = '#FAF8F4';
const SURF  = '#FFFFFF';
const CARD  = '#F4F0E8';
const TEXT  = '#1C1917';
const TEXT2 = '#78716C';
const TEXT3 = '#A8A29E';
const ACC   = '#C2410C';
const ACC2  = '#4D7C5C';
const ACC_L = '#FFF1EC';
const ACC2L = '#EEF5F1';
const BORD  = '#E7E1D8';
const MOOD1 = '#E57373';
const MOOD4 = '#81C784';
const MOOD5 = '#4D7C5C';

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

// ── Load pen ──────────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen     = JSON.parse(penJson);

// Extract SVG data URIs for thumbnails
const thumbs = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
});

// ── Build hero HTML ───────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${NAME} — ${TAGLINE}</title>
<meta name="description" content="A micro-journaling app designed with editorial minimalism. Capture moments as they happen — tiny, honest, lasting.">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:${BG};--surf:${SURF};--card:${CARD};
    --text:${TEXT};--text2:${TEXT2};--text3:${TEXT3};
    --acc:${ACC};--acc2:${ACC2};--bord:${BORD};
  }
  html{background:var(--bg);color:var(--text);font-family:'Georgia','Times New Roman',serif}
  body{min-height:100vh;overflow-x:hidden}

  /* ── Header ── */
  nav{
    position:fixed;top:0;left:0;right:0;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 32px;height:64px;
    background:rgba(250,248,244,0.88);
    backdrop-filter:blur(12px);
    border-bottom:1px solid var(--bord);
    z-index:100;
  }
  .nav-logo{font-size:20px;font-weight:700;letter-spacing:-0.01em;color:var(--text)}
  .nav-links{display:flex;gap:28px;list-style:none}
  .nav-links a{font-size:13px;color:var(--text2);text-decoration:none;font-family:system-ui,sans-serif;letter-spacing:0.04em;text-transform:uppercase}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{
    font-size:13px;font-family:system-ui,sans-serif;
    background:var(--acc);color:#fff;border:none;
    padding:10px 22px;border-radius:100px;cursor:pointer;
    font-weight:600;letter-spacing:0.04em;
  }

  /* ── Hero ── */
  .hero{
    min-height:100vh;display:flex;align-items:center;
    justify-content:center;flex-direction:column;
    padding:120px 32px 80px;text-align:center;position:relative;
  }
  .hero-label{
    font-size:11px;font-family:system-ui,sans-serif;
    letter-spacing:0.18em;text-transform:uppercase;
    color:var(--acc);font-weight:600;margin-bottom:24px;
    display:flex;align-items:center;gap:10px;
  }
  .hero-label::before,.hero-label::after{
    content:'';width:32px;height:1px;background:var(--acc);opacity:0.5;
  }
  h1{
    font-size:clamp(56px,10vw,104px);font-weight:700;
    letter-spacing:-0.03em;line-height:1;
    color:var(--text);margin-bottom:12px;
  }
  .hero-sub{
    font-size:clamp(18px,3vw,26px);color:var(--text2);
    font-style:italic;margin-bottom:40px;font-weight:400;
  }
  .hero-body{
    font-size:17px;font-family:system-ui,sans-serif;
    color:var(--text2);max-width:480px;line-height:1.7;
    margin-bottom:48px;
  }
  .hero-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center;margin-bottom:64px}
  .btn-primary{
    background:var(--acc);color:#fff;
    padding:16px 36px;border-radius:100px;
    font-family:system-ui,sans-serif;font-size:15px;font-weight:600;
    letter-spacing:0.04em;text-decoration:none;
    transition:transform 0.2s,box-shadow 0.2s;
  }
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(194,65,12,0.25)}
  .btn-secondary{
    color:var(--text2);padding:16px 28px;
    font-family:system-ui,sans-serif;font-size:15px;
    text-decoration:none;border-bottom:1px solid var(--bord);
    transition:color 0.2s,border-color 0.2s;
  }
  .btn-secondary:hover{color:var(--text);border-color:var(--text2)}

  /* ── Screen carousel ── */
  .screens-wrap{
    display:flex;gap:20px;padding:0 16px;
    overflow-x:auto;scroll-snap-type:x mandatory;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;max-width:1100px;margin:0 auto;
  }
  .screens-wrap::-webkit-scrollbar{display:none}
  .screen-card{
    flex:0 0 auto;scroll-snap-align:start;
    border-radius:28px;overflow:hidden;
    box-shadow:0 20px 60px rgba(28,25,23,0.12);
    border:1px solid var(--bord);
    transition:transform 0.3s;cursor:pointer;
  }
  .screen-card:hover{transform:translateY(-4px)}
  .screen-card img{display:block;width:220px;height:auto}
  .screen-label{
    text-align:center;padding:10px 0 6px;
    font-size:10px;font-family:system-ui,sans-serif;
    letter-spacing:0.1em;text-transform:uppercase;
    color:var(--text3);background:var(--surf);
  }

  /* ── Divider ── */
  .divider{
    width:1px;height:80px;background:var(--bord);
    margin:80px auto;
  }

  /* ── Features bento ── */
  .features{max-width:900px;margin:0 auto;padding:0 24px 80px}
  .feat-header{text-align:center;margin-bottom:48px}
  .feat-header h2{font-size:clamp(32px,5vw,52px);color:var(--text);margin-bottom:12px;font-weight:600}
  .feat-header p{font-size:16px;color:var(--text2);font-family:system-ui,sans-serif;line-height:1.6}
  .bento{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px}
  .bento-card{
    background:var(--surf);border:1px solid var(--bord);
    border-radius:18px;padding:28px;
    transition:transform 0.2s,border-color 0.2s;
  }
  .bento-card:hover{transform:translateY(-2px);border-color:var(--text3)}
  .bento-card.wide{grid-column:span 2}
  .bento-card.accent{background:${ACC_L}}
  .bento-card.sage{background:${ACC2L}}
  .bento-icon{
    width:40px;height:40px;border-radius:12px;
    display:flex;align-items:center;justify-content:center;
    margin-bottom:16px;font-size:18px;
  }
  .bento-icon.rust{background:${ACC_L};color:var(--acc)}
  .bento-icon.sage{background:${ACC2L};color:var(--acc2)}
  .bento-icon.warm{background:var(--card);color:var(--text2)}
  .bento-card h3{font-size:17px;color:var(--text);margin-bottom:8px;font-weight:600}
  .bento-card p{font-size:14px;color:var(--text2);font-family:system-ui,sans-serif;line-height:1.6}
  .bento-stat{margin-top:16px}
  .bento-stat .num{font-size:42px;font-weight:700;color:var(--acc)}
  .bento-stat .label{font-size:12px;color:var(--text3);font-family:system-ui,sans-serif;letter-spacing:0.08em;text-transform:uppercase}

  /* ── Palette section ── */
  .palette-sec{max-width:900px;margin:0 auto 80px;padding:0 24px}
  .palette-sec h2{font-size:28px;color:var(--text);margin-bottom:8px;font-weight:600}
  .palette-sec p{font-size:14px;color:var(--text2);font-family:system-ui,sans-serif;margin-bottom:24px}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{
    width:56px;height:56px;border-radius:14px;
    border:1px solid rgba(28,25,23,0.08);
    display:flex;align-items:flex-end;padding:4px;
    cursor:default;
  }
  .swatch span{font-size:8px;font-family:system-ui,sans-serif;opacity:0.6;color:#000;word-break:break-all;line-height:1.1}
  .swatch.light-text span{color:#fff;opacity:0.8}

  /* ── Quote ── */
  .quote-sec{
    max-width:660px;margin:0 auto 80px;padding:0 24px;
    text-align:center;
  }
  blockquote{
    font-size:clamp(20px,3vw,28px);line-height:1.5;
    color:var(--text);font-style:italic;
    border-left:3px solid var(--acc);
    padding-left:28px;text-align:left;
    margin-bottom:16px;
  }
  cite{font-size:13px;font-family:system-ui,sans-serif;color:var(--text3)}

  /* ── Footer ── */
  footer{
    background:var(--surf);border-top:1px solid var(--bord);
    padding:40px 32px;display:flex;
    align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:16px;
  }
  .footer-brand{font-size:18px;font-weight:700;color:var(--text)}
  .footer-links{display:flex;gap:24px}
  .footer-links a{font-size:13px;color:var(--text3);text-decoration:none;font-family:system-ui,sans-serif}
  .footer-links a:hover{color:var(--text2)}
  .footer-note{font-size:11px;color:var(--text3);font-family:system-ui,sans-serif;letter-spacing:0.04em}

  /* mood bar decoration */
  .mood-bar{display:flex;gap:4px;justify-content:center;margin:40px 0}
  .mood-dot{width:12px;height:12px;border-radius:50%}

  @media(max-width:768px){
    .bento{grid-template-columns:1fr}
    .bento-card.wide{grid-column:span 1}
    .nav-links{display:none}
  }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">mote</span>
  <ul class="nav-links">
    <li><a href="#screens">screens</a></li>
    <li><a href="#features">features</a></li>
    <li><a href="https://ram.zenbin.org/mote-viewer">viewer</a></li>
  </ul>
  <button class="nav-cta">try the mock →</button>
</nav>

<section class="hero">
  <div class="hero-label">RAM Design Heartbeat #421</div>
  <h1>MOTE</h1>
  <p class="hero-sub">moments, distilled</p>
  <p class="hero-body">
    A micro-journaling app built on the principle that the smallest observations
    carry the most weight. Capture a sentence. Tag a feeling. Come back in a year.
  </p>

  <div class="mood-bar">
    <div class="mood-dot" style="background:${MOOD1}"></div>
    <div class="mood-dot" style="background:${MOOD1};opacity:.5"></div>
    <div class="mood-dot" style="background:${MOOD4}"></div>
    <div class="mood-dot" style="background:${MOOD5}"></div>
    <div class="mood-dot" style="background:${MOOD4}"></div>
    <div class="mood-dot" style="background:${MOOD4};opacity:.5"></div>
    <div class="mood-dot" style="background:${MOOD5}"></div>
  </div>

  <div class="hero-actions">
    <a href="https://ram.zenbin.org/mote-mock" class="btn-primary">open interactive mock</a>
    <a href="https://ram.zenbin.org/mote-viewer" class="btn-secondary">view in pencil.dev</a>
  </div>

  <!-- Screen carousel -->
  <div class="screens-wrap" id="screens">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${thumbs[i]}" alt="${s.name}" width="220" loading="${i<2?'eager':'lazy'}">
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<div class="divider"></div>

<!-- Features bento -->
<section class="features" id="features">
  <div class="feat-header">
    <h2>Designed for brevity.</h2>
    <p>Every screen earns its place. No onboarding odyssey, no gamified streaks screen — just the moment and the mood.</p>
  </div>

  <div class="bento">
    <div class="bento-card wide accent">
      <div class="bento-icon rust">✦</div>
      <h3>Editorial minimalism</h3>
      <p>Inspired by minimal.gallery's "barely-there UI" trend — Georgia serif for display, structural whitespace instead of decorative elements, warm cream palette that feels like aged paper.</p>
      <div class="bento-stat">
        <div class="num">539</div>
        <div class="label">elements across 6 screens</div>
      </div>
    </div>
    <div class="bento-card sage">
      <div class="bento-icon sage">▦</div>
      <h3>Bento grid layout</h3>
      <p>Card hierarchy from lapa.ninja — large hero mood card + two 1×1 stat cards encode importance through size alone.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon warm">◐</div>
      <h3>Mood as colour</h3>
      <p>Five states mapped to a perceptually ordered palette — warm red through sage green. The left edge of every card carries the mood.</p>
    </div>
    <div class="bento-card">
      <div class="bento-icon rust">≡</div>
      <h3>Micro-journaling</h3>
      <p>One to three sentences. Capture before the moment dissolves. The serif writing area slows you down just enough.</p>
    </div>
    <div class="bento-card wide">
      <div class="bento-icon warm">↗</div>
      <h3>Insights that feel earned</h3>
      <p>A weekly mood bar chart, top-theme tracking, and a writing streak — all within a single bento card grid. No dashboard sprawl.</p>
    </div>
  </div>
</section>

<!-- Palette section -->
<section class="palette-sec">
  <h2>Palette</h2>
  <p>Warm cream editorial — influenced by Notion's warmth and Robinhood Market's restraint.</p>
  <div class="swatches">
    <div class="swatch" style="background:${BG}"><span>${BG}</span></div>
    <div class="swatch" style="background:${SURF};border-color:${BORD}"><span>${SURF}</span></div>
    <div class="swatch" style="background:${CARD}"><span>${CARD}</span></div>
    <div class="swatch" style="background:${TEXT}" class="light-text"><span style="color:#fff;opacity:.7">${TEXT}</span></div>
    <div class="swatch" style="background:${TEXT2}"><span style="color:#fff;opacity:.7">${TEXT2}</span></div>
    <div class="swatch" style="background:${TEXT3}"><span>${TEXT3}</span></div>
    <div class="swatch" style="background:${ACC}"><span style="color:#fff;opacity:.8">${ACC}</span></div>
    <div class="swatch" style="background:${ACC2}"><span style="color:#fff;opacity:.8">${ACC2}</span></div>
    <div class="swatch" style="background:${MOOD1}"><span>${MOOD1}</span></div>
    <div class="swatch" style="background:${MOOD4}"><span>${MOOD4}</span></div>
    <div class="swatch" style="background:${MOOD5}"><span style="color:#fff;opacity:.8">${MOOD5}</span></div>
  </div>
</section>

<!-- Quote -->
<section class="quote-sec">
  <blockquote>
    "The afternoon light came through sideways, turning the dust gold.
    I noticed it for once instead of walking through it."
  </blockquote>
  <cite>— a mote moment, Thursday 3:47 PM</cite>
</section>

<footer>
  <span class="footer-brand">mote</span>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/mote-viewer">pencil viewer</a>
    <a href="https://ram.zenbin.org/mote-mock">interactive mock</a>
  </div>
  <span class="footer-note">RAM Design Heartbeat #421 · April 10, 2026</span>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── Publish ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${r1.status} → https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} → https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);

