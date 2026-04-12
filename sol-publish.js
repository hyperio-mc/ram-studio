'use strict';
const fs   = require('fs');
const path = require('path');
const http = require('http');

const SLUG = 'sol';
const HOST = 'ram.zenbin.org';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: HOST,
      port:     80,
      path:     '/publish',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    subdomain,
      },
    };
    const req = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const penJson  = fs.readFileSync(path.join(__dirname, 'sol.pen'), 'utf8');
const pen      = JSON.parse(penJson);

// ── Helper: SVG data URI ───────────────────────────────────────────────────────
function svgDataUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ── Hero page ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Sol — Daily Energy Intelligence</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --cream: #FDF8F0;
    --ivory: #FFFCF5;
    --amber: #E8A020;
    --amber2: #D4781A;
    --sage:  #5A8A6A;
    --text:  #1C1611;
    --text2: #6B5C47;
    --text3: #A8937A;
    --border:#EDE4D0;
    --shadow: rgba(139,110,70,0.12);
  }
  html{scroll-behavior:smooth}
  body{background:var(--cream);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}
  
  /* Hero */
  .hero{
    min-height:100vh;display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:80px 24px;position:relative;overflow:hidden;
    background:radial-gradient(ellipse 80% 60% at 70% 30%, rgba(245,200,66,0.18) 0%, transparent 60%),
               radial-gradient(ellipse 50% 50% at 20% 80%, rgba(90,138,106,0.10) 0%, transparent 60%),
               var(--cream);
  }
  .hero-badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(232,160,32,0.12);border:1px solid rgba(232,160,32,0.3);
    color:var(--amber2);font-size:11px;font-weight:600;letter-spacing:2px;
    padding:6px 16px;border-radius:100px;margin-bottom:32px;
  }
  .hero h1{
    font-family:'Playfair Display',serif;font-size:clamp(52px,8vw,96px);
    font-weight:700;line-height:1.0;text-align:center;margin-bottom:16px;
    background:linear-gradient(135deg,#1C1611 0%,#6B5C47 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  }
  .hero-tagline{
    font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(18px,2.5vw,24px);
    color:var(--text2);text-align:center;margin-bottom:48px;max-width:480px;
  }
  .hero-ctas{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
  .btn-primary{
    background:linear-gradient(135deg,var(--amber),var(--amber2));
    color:white;font-weight:600;font-size:14px;padding:14px 28px;
    border-radius:100px;border:none;cursor:pointer;letter-spacing:0.3px;
    box-shadow:0 8px 24px rgba(212,120,26,0.3);
    text-decoration:none;display:inline-block;
  }
  .btn-secondary{
    background:rgba(255,252,245,0.8);color:var(--text2);font-weight:500;font-size:14px;
    padding:14px 28px;border-radius:100px;border:1px solid var(--border);
    cursor:pointer;text-decoration:none;display:inline-block;
    backdrop-filter:blur(8px);
  }

  /* Screens showcase */
  .screens-row{
    display:flex;gap:20px;justify-content:center;align-items:flex-end;
    flex-wrap:nowrap;padding:0 24px;overflow-x:auto;
  }
  .screen-card{
    flex-shrink:0;position:relative;border-radius:28px;
    box-shadow:0 24px 48px rgba(139,110,70,0.18);
    overflow:hidden;transition:transform 0.3s ease;
  }
  .screen-card:hover{transform:translateY(-8px) scale(1.02)}
  .screen-card img{display:block}
  .screen-card.main{transform:scale(1.08)}
  .screen-card.main:hover{transform:translateY(-8px) scale(1.10)}

  /* Features */
  .features{padding:80px 24px;max-width:1100px;margin:0 auto}
  .features h2{
    font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,52px);
    text-align:center;margin-bottom:56px;
  }
  .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
  .feature-card{
    background:rgba(255,252,245,0.8);border:1px solid var(--border);
    border-radius:24px;padding:32px;
    backdrop-filter:blur(8px);
  }
  .feature-icon{font-size:32px;margin-bottom:16px}
  .feature-card h3{font-size:18px;font-weight:600;margin-bottom:8px;color:var(--text)}
  .feature-card p{font-size:14px;color:var(--text2);line-height:1.6}

  /* Philosophy section */
  .philosophy{
    padding:80px 24px;
    background:radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,200,66,0.10) 0%, transparent 70%);
  }
  .philosophy-inner{max-width:640px;margin:0 auto;text-align:center}
  .philosophy h2{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(28px,4vw,44px);margin-bottom:24px}
  .philosophy p{font-size:16px;color:var(--text2);line-height:1.8;margin-bottom:16px}

  /* Palette swatch */
  .palette-section{padding:60px 24px;max-width:800px;margin:0 auto}
  .palette-section h3{font-family:'Playfair Display',serif;font-size:24px;margin-bottom:24px;text-align:center}
  .swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .swatch{width:80px;height:80px;border-radius:16px;display:flex;align-items:flex-end;padding:8px;font-size:9px;font-weight:600;color:rgba(0,0,0,0.5)}
  
  /* Footer */
  footer{padding:40px 24px;text-align:center;border-top:1px solid var(--border);color:var(--text3);font-size:12px}
  footer a{color:var(--amber2);text-decoration:none}
</style>
</head>
<body>

<section class="hero">
  <div class="hero-badge">✦ RAM DESIGN · APR 2026 · LIGHT THEME</div>
  <h1>Sol</h1>
  <p class="hero-tagline">Know your energy. Own your day.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View Design ↗</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>

  <div class="screens-row">
    ${pen.screens.map((s, i) => {
      const scales = [0.28, 0.33, 0.36, 0.33, 0.28];
      const scale = scales[i] || 0.30;
      const w = Math.round(390 * scale);
      const h = Math.round(844 * scale);
      return `<div class="screen-card${i===2?' main':''}">
        <img src="${svgDataUri(s.svg)}" width="${w}" height="${h}" alt="${s.name}" loading="lazy"/>
      </div>`;
    }).join('\n    ')}
  </div>
</section>

<section class="features">
  <h2>Engineered for human energy</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <h3>Real-time energy scoring</h3>
      <p>Physical and mental energy tracked separately. See exactly what drains and what powers you across 14-day rolling windows.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">☀</div>
      <h3>Morning ritual intelligence</h3>
      <p>Five evidence-based rituals with correlation data. Sol knows which ones matter most for your unique energy profile.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <h3>AI pattern recognition</h3>
      <p>Surface hidden correlations. "Your energy is 18% higher on days with morning sunlight" — then act on it automatically.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◷</div>
      <h3>Energy-optimised scheduling</h3>
      <p>Block deep work during your peak windows. Sol analyses your historical data to find when your brain is at its sharpest.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📓</div>
      <h3>Evening reflection</h3>
      <p>AI-generated prompts personalised to your day's data. Build the habit of understanding what worked and why.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔥</div>
      <h3>Streak intelligence</h3>
      <p>Visual streak history with sparklines. See momentum building, not just today's checkbox. Your longest streak is always visible.</p>
    </div>
  </div>
</section>

<section class="philosophy">
  <div class="philosophy-inner">
    <h2>"Know your energy. Own your day."</h2>
    <p>Most productivity apps optimise for output. Sol optimises for <em>you</em> — your biology, your rhythms, your unique patterns of energy and focus.</p>
    <p>Built on the insight that the same rituals work differently for different people, Sol learns what moves the needle for you specifically and surfaces it at the right moment.</p>
  </div>
</section>

<section class="palette-section">
  <h3>Colour palette</h3>
  <div class="swatches">
    <div class="swatch" style="background:#FDF8F0;border:1px solid #EDE4D0">Cream</div>
    <div class="swatch" style="background:#E8A020;color:white">Amber</div>
    <div class="swatch" style="background:#D4781A;color:white">Deep Amber</div>
    <div class="swatch" style="background:#5A8A6A;color:white">Sage</div>
    <div class="swatch" style="background:#E87070;color:white">Rose</div>
    <div class="swatch" style="background:#1C1611;color:white">Warm Black</div>
    <div class="swatch" style="background:#F5C842">Gold</div>
    <div class="swatch" style="background:#6B5C47;color:white">Brown</div>
  </div>
</section>

<footer>
  <p>Designed by <a href="https://ram.zenbin.org">RAM</a> · Design heartbeat · April 2026</p>
  <p style="margin-top:8px">Inspired by Dawn AI (Landbook) · Fluid Glass (Awwwards) · Darkroom.au</p>
</footer>

</body>
</html>`;

// ── Viewer page ────────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero page...');
  const r1 = await publish(SLUG, heroHtml, 'Sol — Daily Energy Intelligence');
  console.log(`Hero: ${r1.status} → https://${HOST}/${SLUG}`);

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'Sol — Viewer');
  console.log(`Viewer: ${r2.status} → https://${HOST}/${SLUG}-viewer`);
}

main().catch(console.error);
