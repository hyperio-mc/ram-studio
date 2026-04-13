'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG = 'loft';
const APP  = 'LOFT';
const TAG  = 'Studio project workspace for creative teams';

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
const P = pen.metadata.palette;

// Encode SVG screens as data URIs
const screenDataURIs = pen.screens.map(s => {
  const encoded = Buffer.from(s.svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
});

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${APP} — ${TAG}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#FAF7F2;--surf:#FFFFFF;--card:#F0EDE6;--card2:#E8E3DA;
    --text:#1C1917;--text2:#57534E;--muted:#A8A29E;
    --acc:#C2714A;--acc2:#4A7C6F;--accLt:#F0E0D6;--acc2Lt:#D4EAE6;
    --border:#E2DDD7;
  }
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh}

  /* NAV */
  nav{display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:64px;background:var(--surf);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
  .logo{font-family:Georgia,serif;font-size:20px;font-weight:700;color:var(--acc);letter-spacing:-0.02em}
  .logo span{color:var(--text);font-size:11px;font-family:Inter,sans-serif;font-weight:400;margin-left:8px;letter-spacing:.05em;opacity:.6}
  .nav-links{display:flex;gap:28px}
  .nav-links a{font-size:13px;color:var(--text2);text-decoration:none;transition:color .2s}
  .nav-links a:hover{color:var(--acc)}
  .nav-cta{background:var(--acc);color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;letter-spacing:.02em}
  .nav-cta:hover{background:#A85A36}

  /* HERO */
  .hero{padding:80px 40px 60px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
  .hero-eyebrow{font-size:11px;font-weight:600;letter-spacing:1.2px;color:var(--acc);margin-bottom:16px;text-transform:uppercase}
  .hero h1{font-family:Georgia,serif;font-size:52px;line-height:1.1;letter-spacing:-0.03em;color:var(--text);margin-bottom:22px}
  .hero h1 em{font-style:normal;color:var(--acc)}
  .hero p{font-size:16px;line-height:1.7;color:var(--text2);margin-bottom:36px;max-width:440px}
  .hero-btns{display:flex;gap:12px;align-items:center}
  .btn-primary{background:var(--acc);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;transition:background .2s,transform .15s}
  .btn-primary:hover{background:#A85A36;transform:translateY(-1px)}
  .btn-secondary{color:var(--acc);font-size:14px;text-decoration:none;font-weight:500;display:flex;align-items:center;gap:6px}
  .btn-secondary::after{content:'→';font-size:16px}

  /* PHONE HERO */
  .hero-visual{display:flex;gap:16px;justify-content:center;position:relative}
  .phone{width:160px;border-radius:24px;overflow:hidden;box-shadow:0 24px 64px rgba(28,25,23,.14);border:1px solid var(--border)}
  .phone img{width:100%;display:block}
  .phone.raised{transform:translateY(-20px)}

  /* STATS */
  .stats-strip{background:var(--surf);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:28px 40px}
  .stats-inner{max-width:1100px;margin:0 auto;display:flex;gap:0;justify-content:space-between}
  .stat{text-align:center;flex:1}
  .stat+.stat{border-left:1px solid var(--border)}
  .stat-val{font-family:Georgia,serif;font-size:32px;font-weight:700;color:var(--acc)}
  .stat-lbl{font-size:11px;color:var(--muted);margin-top:4px;letter-spacing:.5px}

  /* SCREENS CAROUSEL */
  .screens-section{padding:72px 0;overflow:hidden}
  .screens-label{text-align:center;font-size:11px;font-weight:600;letter-spacing:1.2px;color:var(--muted);margin-bottom:40px;text-transform:uppercase}
  .screens-track{display:flex;gap:24px;padding:0 40px;overflow-x:auto;scroll-snap-type:x mandatory;-ms-overflow-style:none;scrollbar-width:none}
  .screens-track::-webkit-scrollbar{display:none}
  .screen-card{flex:0 0 200px;scroll-snap-align:start}
  .screen-card img{width:200px;height:432px;border-radius:18px;box-shadow:0 12px 40px rgba(28,25,23,.1);border:1px solid var(--border);display:block;object-fit:cover}
  .screen-label{font-size:11px;color:var(--muted);margin-top:10px;text-align:center}

  /* FEATURES */
  .features{padding:80px 40px;max-width:1100px;margin:0 auto}
  .features-eyebrow{font-size:11px;font-weight:600;letter-spacing:1.2px;color:var(--muted);margin-bottom:40px;text-align:center;text-transform:uppercase}
  .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .feat{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:28px 24px}
  .feat-icon{width:40px;height:40px;background:var(--accLt);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:16px}
  .feat h3{font-size:15px;font-weight:600;color:var(--text);margin-bottom:8px}
  .feat p{font-size:13px;color:var(--text2);line-height:1.6}

  /* PALETTE */
  .palette{padding:60px 40px;max-width:1100px;margin:0 auto}
  .palette-label{font-size:11px;font-weight:600;letter-spacing:1.2px;color:var(--muted);margin-bottom:24px;text-transform:uppercase}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
  .swatch-dot{width:48px;height:48px;border-radius:50%;border:1px solid var(--border)}
  .swatch-hex{font-size:10px;color:var(--muted);font-family:monospace}

  /* FOOTER */
  footer{border-top:1px solid var(--border);padding:32px 40px;display:flex;justify-content:space-between;align-items:center;background:var(--surf)}
  .footer-logo{font-family:Georgia,serif;font-size:16px;font-weight:700;color:var(--acc)}
  .footer-links{display:flex;gap:24px}
  .footer-links a{font-size:12px;color:var(--muted);text-decoration:none}
  .footer-links a:hover{color:var(--acc)}
  .footer-badge{font-size:11px;color:var(--muted)}
  .footer-badge span{color:var(--acc)}

  @media(max-width:768px){
    .hero{grid-template-columns:1fr;padding:48px 20px 40px}
    .hero h1{font-size:36px}
    .hero-visual{display:none}
    .features-grid{grid-template-columns:1fr}
    .stats-inner{flex-wrap:wrap}
    .stat{flex:0 0 50%;padding:12px 0}
    .stat+.stat{border-left:none}
  }
</style>
</head>
<body>

<nav>
  <div class="logo">LOFT <span>HEARTBEAT #504</span></div>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock ☀◑</a>
  </div>
  <button class="nav-cta">Open Studio</button>
</nav>

<section class="hero">
  <div class="hero-text">
    <div class="hero-eyebrow">Studio Management · Light Theme</div>
    <h1>Where creative<br/><em>studios</em> run their work</h1>
    <p>Projects, briefs, assets, schedules, and insights — unified in one warm, minimal workspace built for design and brand studios.</p>
    <div class="hero-btns">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Explore Mock ☀◑</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">View in Pencil</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone raised">
      <img src="${screenDataURIs[0]}" alt="Home Dashboard"/>
    </div>
    <div class="phone">
      <img src="${screenDataURIs[2]}" alt="Project Brief"/>
    </div>
    <div class="phone raised" style="transform:translateY(-8px)">
      <img src="${screenDataURIs[5]}" alt="Insights"/>
    </div>
  </div>
</section>

<div class="stats-strip">
  <div class="stats-inner">
    <div class="stat"><div class="stat-val">6</div><div class="stat-lbl">Screens</div></div>
    <div class="stat"><div class="stat-val">458</div><div class="stat-lbl">Elements</div></div>
    <div class="stat"><div class="stat-val">#504</div><div class="stat-lbl">Heartbeat</div></div>
    <div class="stat"><div class="stat-val">Light</div><div class="stat-lbl">Theme</div></div>
  </div>
</div>

<section class="screens-section" id="screens">
  <div class="screens-label">All Screens</div>
  <div class="screens-track">
    ${pen.screens.map((s, i) => `
    <div class="screen-card">
      <img src="${screenDataURIs[i]}" alt="${s.name}"/>
      <div class="screen-label">${s.name}</div>
    </div>`).join('')}
  </div>
</section>

<section class="features" id="features">
  <div class="features-eyebrow">Design Decisions</div>
  <div class="features-grid">
    <div class="feat">
      <div class="feat-icon">🏺</div>
      <h3>Warm Cream Base</h3>
      <p>FAF7F2 — inspired by Land-Book's heritage craft aesthetic. Paper-like warmth that signals considered taste, not cold SaaS chrome.</p>
    </div>
    <div class="feat">
      <div class="feat-icon">𝑮</div>
      <h3>Serif Hero Type</h3>
      <p>Georgia for headlines throughout — the serif comeback trend from Lapa Ninja. Creates typographic personality where Inter would be invisible.</p>
    </div>
    <div class="feat">
      <div class="feat-icon">◫</div>
      <h3>Left-Border Card System</h3>
      <p>4px colored left borders on project cards encode status at a glance — no badges needed. One visual rule, six meanings.</p>
    </div>
    <div class="feat">
      <div class="feat-icon">◎</div>
      <h3>Terracotta Accent</h3>
      <p>C2714A — earthy, warm, premium. Positioned against achromatic surfaces to feel artisanal rather than techy.</p>
    </div>
    <div class="feat">
      <div class="feat-icon">⬡</div>
      <h3>Minimal Nav Chrome</h3>
      <p>Bottom nav icons at full opacity only when active — restraint borrowed from Minimal Gallery's SaaS minimalism counterculture.</p>
    </div>
    <div class="feat">
      <div class="feat-icon">≡</div>
      <h3>Structured Briefs</h3>
      <p>Screen 3 turns project briefs into legible editorial objects — sections with labels, bullet deliverables, and readable body copy.</p>
    </div>
  </div>
</section>

<section class="palette">
  <div class="palette-label">Colour Palette</div>
  <div class="swatches">
    ${[
      ['#FAF7F2','Warm Cream'],['#FFFFFF','Surface'],['#F0EDE6','Card'],
      ['#C2714A','Terracotta'],['#4A7C6F','Sage'],['#F0E0D6','Terracotta Lt'],
      ['#D4EAE6','Sage Lt'],['#1C1917','Ink'],['#A8A29E','Muted'],['#E2DDD7','Border']
    ].map(([hex, name]) => `
    <div class="swatch">
      <div class="swatch-dot" style="background:${hex}"></div>
      <div class="swatch-hex">${hex}</div>
      <div class="swatch-hex" style="color:#1C1917;font-size:10px">${name}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div class="footer-logo">LOFT</div>
  <div class="footer-links">
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
  </div>
  <div class="footer-badge">RAM Design Heartbeat <span>#504</span> · Apr 2026</div>
</footer>

</body>
</html>`;

// Build viewer HTML
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
viewerHtml = viewerHtml.replace('<script>', `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>\n<script>`);

async function main() {
  console.log('Publishing hero...');
  const r1 = await publish(SLUG, heroHtml, `${APP} — ${TAG}`);
  console.log(`Hero: ${r1.status}`, r1.status !== 201 ? r1.body.slice(0, 120) : '✓');

  console.log('Publishing viewer...');
  const r2 = await publish(SLUG + '-viewer', viewerHtml, `${APP} — Pencil Viewer`);
  console.log(`Viewer: ${r2.status}`, r2.status !== 201 ? r2.body.slice(0, 120) : '✓');
}

main().catch(console.error);
