'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'veld';
const APP_NAME = 'VELD';
const TAGLINE = 'Know your footprint. Own your future.';

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

const penJson = fs.readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');
const pen = JSON.parse(penJson);

// Palette
const BG = '#FAF8F3';
const SURF = '#FFFFFF';
const CARD = '#F2EDE0';
const CARD2 = '#EBF0E5';
const ACC = '#4E7A43';
const ACC2 = '#C07830';
const TEXT = '#1C1A17';
const TEXT2 = '#5A5650';
const TEXT3 = '#8A8580';
const CREAM2 = '#E8E2D0';

// Generate SVG thumbnail for a screen
function screenToSvgUri(screen, idx) {
  const W = 390, H = 844;
  let svgParts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${BG}"/>`];
  
  (screen.elements || []).forEach(el => {
    if (!el) return;
    const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    const stroke = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
    if (el.type === 'rect') {
      const rx = el.rx ? ` rx="${el.rx}"` : '';
      svgParts.push(`<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}"${rx}${op}${stroke}/>`);
    } else if (el.type === 'circle') {
      svgParts.push(`<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${op}${stroke}/>`);
    } else if (el.type === 'text') {
      const fw = el.fontWeight ? ` font-weight="${el.fontWeight}"` : '';
      const ff = el.font === 'serif' ? ' font-family="Georgia,serif"' : ' font-family="system-ui,sans-serif"';
      const ta = el.textAnchor ? ` text-anchor="${el.textAnchor}"` : '';
      const ls = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : '';
      svgParts.push(`<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}"${fw}${ff}${ta}${ls}${op}>${el.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`);
    } else if (el.type === 'line') {
      svgParts.push(`<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"${op}/>`);
    }
  });
  svgParts.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(svgParts.join('')).toString('base64');
}

const screenUris = pen.screens.map((s, i) => screenToSvgUri(s, i));

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
    --acc:${ACC};--acc2:${ACC2};--text:${TEXT};--text2:${TEXT2};--text3:${TEXT3};--border:${CREAM2};
  }
  html{background:var(--bg);color:var(--text);font-family:'Georgia',serif}
  body{max-width:1100px;margin:0 auto;padding:0 24px}
  
  /* NAV */
  nav{display:flex;align-items:center;justify-content:space-between;padding:24px 0;border-bottom:1px solid var(--border)}
  .logo{font-size:22px;font-weight:700;letter-spacing:-0.5px;color:var(--text)}
  .logo span{color:var(--acc)}
  .nav-links{display:flex;gap:32px;list-style:none}
  .nav-links a{text-decoration:none;color:var(--text2);font-family:system-ui,sans-serif;font-size:14px}
  .nav-cta{background:var(--acc);color:#fff;padding:10px 22px;border-radius:20px;font-size:14px;font-family:system-ui,sans-serif;font-weight:600;text-decoration:none}

  /* HERO */
  .hero{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;padding:80px 0 60px}
  .hero-text h1{font-size:clamp(42px,5vw,68px);line-height:1.08;letter-spacing:-1.5px;margin-bottom:24px;font-weight:700}
  .hero-text h1 em{font-style:italic;color:var(--acc)}
  .hero-text p{font-size:18px;line-height:1.6;color:var(--text2);font-family:system-ui,sans-serif;margin-bottom:36px;font-weight:400}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap}
  .btn-primary{background:var(--acc);color:#fff;padding:14px 28px;border-radius:24px;font-size:15px;font-family:system-ui,sans-serif;font-weight:600;text-decoration:none;display:inline-block}
  .btn-secondary{background:var(--card);color:var(--text);padding:14px 28px;border-radius:24px;font-size:15px;font-family:system-ui,sans-serif;font-weight:600;text-decoration:none;border:1px solid var(--border)}
  .hero-visual{position:relative;display:flex;justify-content:center}
  .hero-phone{width:200px;height:auto;border-radius:28px;box-shadow:0 32px 80px rgba(0,0,0,0.12),0 8px 24px rgba(0,0,0,0.06);border:6px solid var(--surf)}
  .hero-phone-2{position:absolute;right:0;top:60px;width:160px;height:auto;border-radius:24px;box-shadow:0 24px 60px rgba(0,0,0,0.1);border:5px solid var(--surf);opacity:0.9}
  
  /* STAT ROW */
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--border);border-radius:16px;overflow:hidden;margin:0 0 60px}
  .stat{background:var(--surf);padding:28px 24px;text-align:center}
  .stat-val{font-size:36px;font-weight:700;letter-spacing:-1px;color:var(--acc)}
  .stat-label{font-size:13px;color:var(--text2);font-family:system-ui,sans-serif;margin-top:6px}

  /* BENTO GRID */
  .section-label{font-size:11px;letter-spacing:3px;font-family:system-ui,sans-serif;font-weight:600;color:var(--acc);text-transform:uppercase;margin-bottom:16px}
  .section-title{font-size:clamp(28px,3.5vw,42px);letter-spacing:-0.8px;margin-bottom:48px;line-height:1.15}
  .bento{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;gap:12px;margin-bottom:60px}
  .bento-card{background:var(--surf);border-radius:20px;padding:28px;border:1px solid var(--border)}
  .bento-card.wide{grid-column:span 2}
  .bento-card.tall{grid-row:span 2}
  .bento-card.accent{background:var(--card2)}
  .bento-card.dark{background:var(--acc);color:#fff}
  .bento-card.dark .bento-val{color:#fff}
  .bento-card.dark .bento-sub{color:rgba(255,255,255,0.7)}
  .bento-icon{font-size:28px;margin-bottom:16px}
  .bento-val{font-size:32px;font-weight:700;letter-spacing:-1px;margin-bottom:6px}
  .bento-label{font-size:12px;font-family:system-ui,sans-serif;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:8px}
  .bento-sub{font-size:13px;font-family:system-ui,sans-serif;color:var(--text2);line-height:1.5}
  .mini-bar-row{margin-top:16px}
  .mini-bar-bg{height:6px;background:var(--border);border-radius:3px;margin-bottom:8px;overflow:hidden}
  .mini-bar-fill{height:100%;border-radius:3px;background:var(--acc)}
  
  /* SCREENS CAROUSEL */
  .screens-section{margin-bottom:80px}
  .screens-scroll{display:flex;gap:20px;overflow-x:auto;padding-bottom:16px;scrollbar-width:none}
  .screens-scroll::-webkit-scrollbar{display:none}
  .screen-frame{flex:0 0 200px}
  .screen-label{font-size:12px;font-family:system-ui,sans-serif;color:var(--text3);text-align:center;margin-top:12px}
  .screen-img{width:200px;height:auto;border-radius:22px;box-shadow:0 16px 48px rgba(0,0,0,0.1),0 4px 12px rgba(0,0,0,0.06);border:4px solid var(--surf)}
  
  /* PALETTE */
  .palette{display:flex;gap:8px;margin-bottom:60px;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px;font-family:system-ui,sans-serif}
  .swatch-circle{width:52px;height:52px;border-radius:50%;border:2px solid var(--border)}
  .swatch-name{font-size:11px;color:var(--text3)}

  /* QUOTE */
  .quote-section{text-align:center;padding:80px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:60px}
  .quote{font-size:clamp(22px,3vw,36px);line-height:1.4;letter-spacing:-0.5px;margin-bottom:24px;max-width:700px;margin-left:auto;margin-right:auto}
  .quote em{color:var(--acc);font-style:italic}
  .quote-attr{font-size:14px;font-family:system-ui,sans-serif;color:var(--text3)}

  /* FOOTER */
  footer{display:flex;justify-content:space-between;align-items:center;padding:32px 0;border-top:1px solid var(--border);margin-top:24px;font-family:system-ui,sans-serif;font-size:13px;color:var(--text3)}
  footer a{color:var(--acc);text-decoration:none}
  
  @media(max-width:768px){
    .hero{grid-template-columns:1fr}
    .hero-phone-2{display:none}
    .bento{grid-template-columns:1fr 1fr}
    .bento-card.wide{grid-column:span 2}
    .stats{grid-template-columns:1fr}
  }
</style>
</head>
<body>

<nav>
  <div class="logo">VE<span>LD</span></div>
  <ul class="nav-links">
    <li><a href="#">Features</a></li>
    <li><a href="#">Science</a></li>
    <li><a href="#">Community</a></li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">View Design</a>
</nav>

<section class="hero">
  <div class="hero-text">
    <h1>Know your<br><em>footprint.</em><br>Own your future.</h1>
    <p>VELD turns your daily choices into a clear carbon picture — so you can act with intention, not guilt.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Explore Prototype</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
  </div>
  <div class="hero-visual">
    <img class="hero-phone" src="${screenUris[0]}" alt="VELD Dashboard">
    <img class="hero-phone-2" src="${screenUris[2]}" alt="VELD Track">
  </div>
</section>

<div class="stats">
  <div class="stat"><div class="stat-val">12×</div><div class="stat-label">Average reduction after 90 days</div></div>
  <div class="stat"><div class="stat-val">4.2 kg</div><div class="stat-label">Average weekly CO₂ tracked</div></div>
  <div class="stat"><div class="stat-val">5 min</div><div class="stat-label">To log your entire week</div></div>
</div>

<section>
  <p class="section-label">Features</p>
  <h2 class="section-title">Everything you need<br>to live lighter</h2>
  <div class="bento">
    <div class="bento-card wide accent">
      <div class="bento-icon">🌿</div>
      <div class="bento-label">Bento Dashboard</div>
      <div class="bento-val">At a glance</div>
      <div class="bento-sub">Your weekly footprint broken into six categories — travel, food, energy, shopping, home, and other — arranged in an editorial bento grid. Everything visible, nothing hidden.</div>
    </div>
    <div class="bento-card dark">
      <div class="bento-icon">🎯</div>
      <div class="bento-label">Smart Goals</div>
      <div class="bento-val">Milestone tracking</div>
      <div class="bento-sub" style="color:rgba(255,255,255,0.75)">Set personal targets. Watch progress unfold on a visual timeline.</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Quick Log</div>
      <div class="bento-val" style="font-size:24px">8 categories</div>
      <div class="bento-sub">One tap to log any activity. Drive, fly, eat, shop — done in seconds.</div>
      <div class="mini-bar-row">
        ${[{l:'Travel',p:43},{l:'Food',p:26},{l:'Energy',p:19}].map(b=>`
        <div style="display:flex;justify-content:space-between;font-size:11px;font-family:system-ui,sans-serif;color:var(--text3);margin-bottom:4px"><span>${b.l}</span><span>${b.p}%</span></div>
        <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:${b.p}%"></div></div>
        `).join('')}
      </div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">📊</div>
      <div class="bento-label">Insights</div>
      <div class="bento-val">Compare & learn</div>
      <div class="bento-sub">See how you stack against the app average, your country, and the Paris Agreement target.</div>
    </div>
    <div class="bento-card accent">
      <div class="bento-icon">🔥</div>
      <div class="bento-label">Streaks</div>
      <div class="bento-val">Stay consistent</div>
      <div class="bento-sub">Daily tracking streaks keep you accountable without feeling like a chore.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">💡</div>
      <div class="bento-label">Recommendations</div>
      <div class="bento-val">Personalized tips</div>
      <div class="bento-sub">Curated actions based on your biggest impact categories.</div>
    </div>
  </div>
</section>

<section class="screens-section">
  <p class="section-label">All Screens</p>
  <h2 class="section-title" style="margin-bottom:32px">Six screens,<br>one clear story</h2>
  <div class="screens-scroll">
    ${pen.screens.map((s,i) => `
    <div class="screen-frame">
      <img class="screen-img" src="${screenUris[i]}" alt="${s.name}">
      <p class="screen-label">${s.name}</p>
    </div>`).join('')}
  </div>
</section>

<div class="palette">
  ${[
    {hex:BG,name:'Warm Cream'},
    {hex:CARD,name:'Sand'},
    {hex:CARD2,name:'Sage Tint'},
    {hex:ACC,name:'Forest Sage'},
    {hex:ACC2,name:'Warm Ochre'},
    {hex:TEXT,name:'Warm Black'},
    {hex:TEXT2,name:'Walnut'},
    {hex:CREAM2,name:'Parchment'},
  ].map(s=>`<div class="swatch"><div class="swatch-circle" style="background:${s.hex}"></div><div class="swatch-name">${s.name}</div></div>`).join('')}
</div>

<section class="quote-section">
  <p class="quote">"The most powerful thing you can do for the climate is <em>measure it first.</em>"</p>
  <p class="quote-attr">— Design rationale, VELD Heartbeat #46</p>
</section>

<footer>
  <span>RAM Design Heartbeat #46 · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
  <span><a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a> · <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a></span>
</footer>

</body>
</html>`;

// Inject pen into viewer
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero: ${r1.status} ${r1.status === 201 ? '✓' : r1.body.slice(0,100)}`);
  
  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer: ${r2.status} ${r2.status === 201 ? '✓' : r2.body.slice(0,100)}`);
}
main().catch(console.error);
