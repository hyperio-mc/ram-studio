'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'sol';
const SUBDOMAIN = 'ram';
const HOST      = 'zenbin.org';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

const penJson = fs.readFileSync(path.join(__dirname, 'sol.pen'), 'utf8');
const pen     = JSON.parse(penJson);

function svgDataUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Sol — Daily Energy Intelligence</title>
<meta name="description" content="AI-powered morning ritual and personal energy tracking. Know your energy. Own your day."/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--cream:#FDF8F0;--ivory:#FFFCF5;--amber:#E8A020;--amber2:#D4781A;--sage:#5A8A6A;--rose:#E87070;--text:#1C1611;--text2:#6B5C47;--text3:#A8937A;--border:#EDE4D0;--gold:#F5C842}
html{scroll-behavior:smooth}
body{background:var(--cream);color:var(--text);font-family:'Inter',sans-serif;overflow-x:hidden}

/* ── HERO ── */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 60px;position:relative;overflow:hidden;
  background:radial-gradient(ellipse 80% 60% at 70% 20%,rgba(245,200,66,.22) 0%,transparent 55%),
             radial-gradient(ellipse 50% 50% at 15% 85%,rgba(90,138,106,.12) 0%,transparent 55%),
             var(--cream)}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(232,160,32,.12);border:1px solid rgba(232,160,32,.35);color:var(--amber2);font-size:11px;font-weight:600;letter-spacing:2px;padding:6px 18px;border-radius:100px;margin-bottom:36px}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(64px,10vw,108px);font-weight:700;line-height:1;text-align:center;margin-bottom:12px;
  background:linear-gradient(150deg,#1C1611 0%,#8B6E46 60%,#E8A020 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.tagline{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(18px,2.5vw,26px);color:var(--text2);text-align:center;margin-bottom:52px;max-width:480px}
.ctas{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
.btn-p{background:linear-gradient(135deg,var(--amber),var(--amber2));color:white;font-weight:600;font-size:14px;padding:15px 32px;border-radius:100px;text-decoration:none;display:inline-block;box-shadow:0 8px 28px rgba(212,120,26,.35);letter-spacing:.3px;transition:transform .2s,box-shadow .2s}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(212,120,26,.45)}
.btn-s{background:rgba(255,252,245,.85);color:var(--text2);font-weight:500;font-size:14px;padding:15px 32px;border-radius:100px;border:1px solid var(--border);text-decoration:none;display:inline-block;backdrop-filter:blur(8px);transition:transform .2s}
.btn-s:hover{transform:translateY(-2px)}

.screens{display:flex;gap:20px;justify-content:center;align-items:flex-end;padding:0 24px;overflow-x:auto;padding-bottom:20px}
.sc{flex-shrink:0;border-radius:28px;box-shadow:0 20px 48px rgba(139,110,70,.20),0 4px 12px rgba(139,110,70,.12);overflow:hidden;transition:transform .3s ease,box-shadow .3s ease;border:1px solid rgba(237,228,208,.6)}
.sc:hover{transform:translateY(-10px);box-shadow:0 32px 64px rgba(139,110,70,.28)}
.sc img{display:block}
.sc.main{transform:scale(1.06)}
.sc.main:hover{transform:translateY(-10px) scale(1.06)}

/* ── FEATURES ── */
.section{padding:96px 24px;max-width:1100px;margin:0 auto}
.section-title{font-family:'Playfair Display',serif;font-size:clamp(30px,4vw,52px);text-align:center;margin-bottom:16px}
.section-sub{color:var(--text2);text-align:center;font-size:16px;margin-bottom:56px;max-width:560px;margin-left:auto;margin-right:auto;line-height:1.7}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.fc{background:rgba(255,252,245,.88);border:1px solid var(--border);border-radius:24px;padding:32px;backdrop-filter:blur(8px);transition:transform .2s,box-shadow .2s}
.fc:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(139,110,70,.12)}
.fc .ico{font-size:30px;margin-bottom:16px}
.fc h3{font-size:17px;font-weight:600;margin-bottom:8px;color:var(--text)}
.fc p{font-size:13.5px;color:var(--text2);line-height:1.7}

/* ── PHILOSOPHY ── */
.phil{padding:96px 24px;background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(245,200,66,.10) 0%,transparent 70%)}
.phil-inner{max-width:640px;margin:0 auto;text-align:center}
.phil h2{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(26px,4vw,44px);margin-bottom:28px;color:var(--text)}
.phil p{font-size:16px;color:var(--text2);line-height:1.9;margin-bottom:16px}

/* ── SCREENS DETAIL ── */
.detail{padding:96px 24px;max-width:1100px;margin:0 auto}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.detail-grid.reverse{direction:rtl}
.detail-grid.reverse > *{direction:ltr}
.detail-img{border-radius:28px;overflow:hidden;box-shadow:0 20px 48px rgba(139,110,70,.18);border:1px solid rgba(237,228,208,.5)}
.detail-img img{display:block;width:100%}
.detail-text h3{font-family:'Playfair Display',serif;font-size:28px;margin-bottom:12px}
.detail-text p{font-size:15px;color:var(--text2);line-height:1.8}
.detail-tag{display:inline-block;background:rgba(232,160,32,.12);color:var(--amber2);font-size:10px;font-weight:700;letter-spacing:2px;padding:4px 12px;border-radius:100px;margin-bottom:16px;border:1px solid rgba(232,160,32,.25)}
@media(max-width:768px){.detail-grid{grid-template-columns:1fr}.detail-grid.reverse{direction:ltr}}

/* ── PALETTE ── */
.pal{padding:60px 24px;max-width:800px;margin:0 auto;text-align:center}
.pal h3{font-family:'Playfair Display',serif;font-size:24px;margin-bottom:28px}
.swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.sw{width:88px;height:88px;border-radius:18px;display:flex;align-items:flex-end;padding:10px;font-size:10px;font-weight:600;letter-spacing:.5px}

/* ── FOOTER ── */
footer{padding:48px 24px;text-align:center;border-top:1px solid var(--border);color:var(--text3);font-size:12px;background:var(--cream)}
footer a{color:var(--amber2);text-decoration:none}
.footer-links{display:flex;gap:24px;justify-content:center;margin-bottom:12px}
.footer-links a{color:var(--text3);text-decoration:none;font-size:13px}
.footer-links a:hover{color:var(--amber2)}
</style>
</head>
<body>

<!-- HERO -->
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
      const scales = [0.27,0.32,0.36,0.32,0.27];
      const sc = scales[i]||0.30;
      const w = Math.round(390*sc), h = Math.round(844*sc);
      return `<div class="sc${i===2?' main':''}"><img src="${svgDataUri(s.svg)}" width="${w}" height="${h}" alt="${s.name}"/></div>`;
    }).join('\n    ')}
  </div>
</section>

<!-- FEATURES -->
<section style="padding:96px 24px;background:var(--ivory)">
  <div style="max-width:1100px;margin:0 auto">
    <h2 class="section-title" style="font-family:'Playfair Display',serif;font-size:clamp(30px,4vw,52px);text-align:center;margin-bottom:16px">Engineered for human energy</h2>
    <p style="color:var(--text2);text-align:center;font-size:16px;margin-bottom:56px;max-width:560px;margin-left:auto;margin-right:auto;line-height:1.7">Most productivity tools track what you do. Sol tracks what <em>powers</em> you — and finds the patterns that unlock your best days.</p>
    <div class="grid">
      <div class="fc"><div class="ico">⚡</div><h3>Real-time energy scoring</h3><p>Physical and mental energy tracked separately. See exactly what drains and what powers you across 14-day rolling windows.</p></div>
      <div class="fc"><div class="ico">☀</div><h3>Morning ritual intelligence</h3><p>Five evidence-based rituals with correlation data. Sol knows which ones matter most for your unique energy profile.</p></div>
      <div class="fc"><div class="ico">✦</div><h3>AI pattern recognition</h3><p>Surface hidden correlations — "Your energy is 18% higher on days with morning sunlight" — then act on it automatically.</p></div>
      <div class="fc"><div class="ico">◷</div><h3>Energy-optimised scheduling</h3><p>Block deep work during your peak windows. Sol analyses your historical data to find when your brain is at its sharpest.</p></div>
      <div class="fc"><div class="ico">📓</div><h3>Evening reflection</h3><p>AI-generated prompts personalised to your day's data. Build the habit of understanding what worked and why.</p></div>
      <div class="fc"><div class="ico">🔥</div><h3>Streak intelligence</h3><p>Visual streak history with sparklines. See momentum building, not just today's checkbox — always know your longest streak.</p></div>
    </div>
  </div>
</section>

<!-- PHILOSOPHY -->
<section class="phil">
  <div class="phil-inner">
    <h2>"Know your energy. Own your day."</h2>
    <p>Most productivity apps optimise for output. Sol optimises for <em>you</em> — your biology, your rhythms, your unique patterns of energy and focus.</p>
    <p>Built on the insight that the same rituals work differently for different people, Sol learns what moves the needle for you specifically and surfaces it at the right moment.</p>
  </div>
</section>

<!-- SCREEN DETAILS -->
<section style="padding:96px 24px;background:var(--ivory)">
  <div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:80px">
    ${pen.screens.map((s, i) => {
      const descs = [
        { tag:'DASHBOARD', title:'Your energy at a glance', body:'Two arcs show physical and mental energy simultaneously. An AI nudge tells you exactly when your focus peaks today, and your morning ritual progress sits just below.' },
        { tag:'RITUAL', title:'The streak that matters', body:'Your 12-day morning streak is front and centre, visualised as a sparkline of recent days. Each ritual step shows its individual energy contribution, so you know which one to prioritise when time is short.' },
        { tag:'AI INSIGHT', title:'Patterns you couldn\'t see yourself', body:'Sol surfaces three key behavioural patterns this week — with specific correlation data. A weekly energy bar chart lets you compare days at a glance.' },
        { tag:'SCHEDULE', title:'A day shaped by your biology', body:'SOL-optimised time blocks: deep work during peak energy, admin during low, breaks engineered to restore. A 7-day date strip keeps context clear.' },
        { tag:'REFLECTION', title:'End the day with intention', body:'A comprehensive day score, ritual completion bar, and itemised highlight list. An AI-generated journal prompt closes the loop — tuned to exactly what happened today.' },
      ];
      const d = descs[i];
      const sc = 0.40;
      const w = Math.round(390*sc), h = Math.round(844*sc);
      const isEven = i % 2 === 0;
      return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;${!isEven?'direction:rtl':''}">
        <div style="${!isEven?'direction:ltr':''}">
          <span style="display:inline-block;background:rgba(232,160,32,.12);color:var(--amber2);font-size:10px;font-weight:700;letter-spacing:2px;padding:4px 12px;border-radius:100px;margin-bottom:16px;border:1px solid rgba(232,160,32,.25)">${d.tag}</span>
          <h3 style="font-family:'Playfair Display',serif;font-size:26px;margin-bottom:12px;${!isEven?'direction:ltr':''}">${d.title}</h3>
          <p style="font-size:15px;color:var(--text2);line-height:1.8;${!isEven?'direction:ltr':''}">${d.body}</p>
        </div>
        <div style="${!isEven?'direction:ltr':''}">
          <div style="border-radius:28px;overflow:hidden;box-shadow:0 20px 48px rgba(139,110,70,.18);border:1px solid rgba(237,228,208,.5);display:inline-block">
            <img src="${svgDataUri(s.svg)}" width="${w}" height="${h}" alt="${s.name}" style="display:block"/>
          </div>
        </div>
      </div>`;
    }).join('\n    ')}
  </div>
</section>

<!-- PALETTE -->
<section class="pal">
  <h3>Colour palette — warm light theme</h3>
  <div class="swatches">
    <div class="sw" style="background:#FDF8F0;border:1px solid #EDE4D0;color:rgba(0,0,0,.5)">Cream</div>
    <div class="sw" style="background:#E8A020;color:white">Amber</div>
    <div class="sw" style="background:#D4781A;color:white">Deep Amber</div>
    <div class="sw" style="background:#5A8A6A;color:white">Sage</div>
    <div class="sw" style="background:#E87070;color:white">Rose</div>
    <div class="sw" style="background:#F5C842;color:rgba(0,0,0,.5)">Gold</div>
    <div class="sw" style="background:#1C1611;color:white">Warm Black</div>
    <div class="sw" style="background:#6B5C47;color:white">Brown</div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">View Prototype →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock ☀◑</a>
    <a href="https://ram.zenbin.org">RAM Gallery</a>
  </div>
  <p>Designed by <a href="https://ram.zenbin.org">RAM</a> · Design heartbeat · April 2026</p>
  <p style="margin-top:8px;opacity:.7">Inspired by Dawn AI (Landbook) · Fluid Glass (Awwwards) · Darkroom.au</p>
</footer>

</body>
</html>`;

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero...');
  const r1 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG }, { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN });
  console.log(`Hero: ${r1.status}`, r1.status !== 200 ? r1.body.slice(0,200) : '');

  console.log('Publishing viewer...');
  const r2 = await post(HOST, '/api/publish', { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' }, { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN });
  console.log(`Viewer: ${r2.status}`, r2.status !== 200 ? r2.body.slice(0,200) : '');

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
