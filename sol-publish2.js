'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'sol';
const HOST = 'ram.zenbin.org';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: HOST,
      port:     443,
      path:     '/publish',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    subdomain,
      },
    };
    const req = https.request(opts, res => {
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

function svgDataUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const P = {
  amber: '#E8A020', amber2: '#D4781A', sage: '#5A8A6A',
  text: '#1C1611', text2: '#6B5C47', text3: '#A8937A',
  border: '#EDE4D0', cream: '#FDF8F0',
};

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Sol — Daily Energy Intelligence</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--cream:#FDF8F0;--amber:#E8A020;--amber2:#D4781A;--sage:#5A8A6A;--text:#1C1611;--text2:#6B5C47;--text3:#A8937A;--border:#EDE4D0}
body{background:var(--cream);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;position:relative;overflow:hidden;background:radial-gradient(ellipse 80% 60% at 70% 30%,rgba(245,200,66,.18) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 20% 80%,rgba(90,138,106,.10) 0%,transparent 60%),var(--cream)}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(232,160,32,.12);border:1px solid rgba(232,160,32,.3);color:var(--amber2);font-size:11px;font-weight:600;letter-spacing:2px;padding:6px 16px;border-radius:100px;margin-bottom:32px}
h1{font-family:'Playfair Display',serif;font-size:clamp(52px,8vw,96px);font-weight:700;line-height:1;text-align:center;margin-bottom:16px;background:linear-gradient(135deg,#1C1611 0%,#6B5C47 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.tagline{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(18px,2.5vw,24px);color:var(--text2);text-align:center;margin-bottom:48px;max-width:480px}
.ctas{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
.btn-p{background:linear-gradient(135deg,var(--amber),var(--amber2));color:white;font-weight:600;font-size:14px;padding:14px 28px;border-radius:100px;border:none;cursor:pointer;text-decoration:none;display:inline-block;box-shadow:0 8px 24px rgba(212,120,26,.3)}
.btn-s{background:rgba(255,252,245,.8);color:var(--text2);font-weight:500;font-size:14px;padding:14px 28px;border-radius:100px;border:1px solid var(--border);cursor:pointer;text-decoration:none;display:inline-block;backdrop-filter:blur(8px)}
.screens{display:flex;gap:20px;justify-content:center;align-items:flex-end;padding:0 24px;overflow-x:auto}
.sc{flex-shrink:0;border-radius:28px;box-shadow:0 24px 48px rgba(139,110,70,.18);overflow:hidden;transition:transform .3s ease}
.sc:hover{transform:translateY(-8px) scale(1.02)}
.sc img{display:block}
.sc.main{transform:scale(1.08)}
.sc.main:hover{transform:translateY(-8px) scale(1.10)}
.features{padding:80px 24px;max-width:1100px;margin:0 auto}
.features h2{font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,52px);text-align:center;margin-bottom:56px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.fc{background:rgba(255,252,245,.8);border:1px solid var(--border);border-radius:24px;padding:32px;backdrop-filter:blur(8px)}
.fc .ico{font-size:32px;margin-bottom:16px}
.fc h3{font-size:18px;font-weight:600;margin-bottom:8px}
.fc p{font-size:14px;color:var(--text2);line-height:1.6}
.phil{padding:80px 24px;background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(245,200,66,.10) 0%,transparent 70%)}
.phil-inner{max-width:640px;margin:0 auto;text-align:center}
.phil h2{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(28px,4vw,44px);margin-bottom:24px}
.phil p{font-size:16px;color:var(--text2);line-height:1.8;margin-bottom:16px}
.pal{padding:60px 24px;max-width:800px;margin:0 auto}
.pal h3{font-family:'Playfair Display',serif;font-size:24px;margin-bottom:24px;text-align:center}
.swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.sw{width:80px;height:80px;border-radius:16px;display:flex;align-items:flex-end;padding:8px;font-size:9px;font-weight:600;color:rgba(0,0,0,.5)}
footer{padding:40px 24px;text-align:center;border-top:1px solid var(--border);color:var(--text3);font-size:12px}
footer a{color:var(--amber2);text-decoration:none}
</style>
</head>
<body>
<section class="hero">
  <div class="badge">✦ RAM DESIGN · APR 2026 · LIGHT THEME</div>
  <h1>Sol</h1>
  <p class="tagline">Know your energy. Own your day.</p>
  <div class="ctas">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-p">View Design ↗</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-s">Interactive Mock ☀◑</a>
  </div>
  <div class="screens">
    ${pen.screens.map((s, i) => {
      const scales = [0.28,0.33,0.36,0.33,0.28];
      const sc = scales[i]||0.30;
      const w = Math.round(390*sc), h = Math.round(844*sc);
      return `<div class="sc${i===2?' main':''}"><img src="${svgDataUri(s.svg)}" width="${w}" height="${h}" alt="${s.name}"/></div>`;
    }).join('\n    ')}
  </div>
</section>
<section class="features">
  <h2>Engineered for human energy</h2>
  <div class="grid">
    <div class="fc"><div class="ico">⚡</div><h3>Real-time energy scoring</h3><p>Physical and mental energy tracked separately. See exactly what drains and what powers you across 14-day rolling windows.</p></div>
    <div class="fc"><div class="ico">☀</div><h3>Morning ritual intelligence</h3><p>Five evidence-based rituals with correlation data. Sol knows which ones matter most for your unique energy profile.</p></div>
    <div class="fc"><div class="ico">✦</div><h3>AI pattern recognition</h3><p>Surface hidden correlations — "Your energy is 18% higher on days with morning sunlight" — then act on it automatically.</p></div>
    <div class="fc"><div class="ico">◷</div><h3>Energy-optimised scheduling</h3><p>Block deep work during your peak windows. Sol analyses your historical data to find when your brain is at its sharpest.</p></div>
    <div class="fc"><div class="ico">📓</div><h3>Evening reflection</h3><p>AI-generated prompts personalised to your day's data. Build the habit of understanding what worked and why.</p></div>
    <div class="fc"><div class="ico">🔥</div><h3>Streak intelligence</h3><p>Visual streak history with sparklines. See momentum building, not just today's checkbox. Your longest streak is always visible.</p></div>
  </div>
</section>
<section class="phil">
  <div class="phil-inner">
    <h2>"Know your energy. Own your day."</h2>
    <p>Most productivity apps optimise for output. Sol optimises for <em>you</em> — your biology, your rhythms, your unique patterns of energy and focus.</p>
    <p>Built on the insight that the same rituals work differently for different people, Sol learns what moves the needle for you specifically and surfaces it at the right moment.</p>
  </div>
</section>
<section class="pal">
  <h3>Colour palette</h3>
  <div class="swatches">
    <div class="sw" style="background:#FDF8F0;border:1px solid #EDE4D0">Cream</div>
    <div class="sw" style="background:#E8A020;color:white">Amber</div>
    <div class="sw" style="background:#D4781A;color:white">Deep Amber</div>
    <div class="sw" style="background:#5A8A6A;color:white">Sage</div>
    <div class="sw" style="background:#E87070;color:white">Rose</div>
    <div class="sw" style="background:#1C1611;color:white">Warm Black</div>
    <div class="sw" style="background:#F5C842">Gold</div>
    <div class="sw" style="background:#6B5C47;color:white">Brown</div>
  </div>
</section>
<footer>
  <p>Designed by <a href="https://ram.zenbin.org">RAM</a> · Design heartbeat · April 2026</p>
  <p style="margin-top:8px">Inspired by Dawn AI (Landbook) · Fluid Glass (Awwwards) · Darkroom.au</p>
</footer>
</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, 'Sol — Daily Energy Intelligence');
  console.log(`Hero: ${r1.status} → https://${HOST}/${SLUG}`);
  if(r1.status !== 200) console.log(r1.body.slice(0,200));

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, 'Sol — Viewer');
  console.log(`Viewer: ${r2.status} → https://${HOST}/${SLUG}-viewer`);
  if(r2.status !== 200) console.log(r2.body.slice(0,200));
}

main().catch(console.error);
