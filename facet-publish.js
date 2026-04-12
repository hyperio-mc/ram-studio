const fs = require('fs');
const https = require('https');

const SLUG = 'facet';
const APP_NAME = 'FACET';
const TAGLINE = 'Every material tells a story.';

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

async function pub(slug, html, title) {
  const res = await post('zenbin.org', '/api/publish', { 'X-Subdomain': 'ram' }, { slug, html, title, subdomain: 'ram' });
  let parsed;
  try { parsed = JSON.parse(res.body); } catch(e) { parsed = {}; }
  if (res.status === 200 && parsed.url) console.log('✓', slug, '→', parsed.url);
  else console.log('✗', slug, res.status, res.body.slice(0,200));
  return parsed;
}

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FACET — Every material tells a story.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0C0B09;
  --surface:#181714;
  --surface2:#211F1B;
  --surface3:#2B2820;
  --text:#E8E3DC;
  --muted:rgba(232,227,220,0.52);
  --dim:rgba(232,227,220,0.28);
  --amber:#C47D2A;
  --amber-soft:#E8A84A;
  --amber-dim:rgba(196,125,42,0.15);
  --border:rgba(232,227,220,0.07);
  --border2:rgba(232,227,220,0.13);
  --slate:#6B8A9E;
  --green:#5E8B6A;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:rgba(12,11,9,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.logo{font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;letter-spacing:0.08em;color:var(--text)}
.nav-r{display:flex;gap:24px;align-items:center}
.nav-link{font-size:13px;font-weight:400;color:var(--muted);text-decoration:none;letter-spacing:0.03em;transition:color .2s}
.nav-link:hover{color:var(--text)}
.btn-nav{background:var(--amber);color:#0C0B09;border:none;padding:9px 22px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:0.02em;transition:opacity .2s}
.btn-nav:hover{opacity:.85}

/* Hero */
.hero{min-height:100vh;display:flex;align-items:center;padding:120px 48px 80px;position:relative;overflow:hidden}
.hero-texture{position:absolute;inset:0;z-index:0;overflow:hidden}
.tex-layer{position:absolute;inset:0}
.tex-a{background:linear-gradient(135deg,#1a1208 0%,#2a1e10 40%,#0c0b09 100%)}
.tex-b{background:radial-gradient(ellipse 60% 70% at 70% 40%,rgba(90,68,40,0.45) 0%,transparent 70%)}
.tex-c{background:radial-gradient(ellipse 40% 50% at 85% 20%,rgba(120,90,50,0.3) 0%,transparent 60%)}
.tex-vein{position:absolute;top:0;left:30%;width:1px;height:100%;background:linear-gradient(to bottom,transparent,rgba(232,210,178,0.08) 30%,rgba(232,210,178,0.12) 60%,transparent)}
.tex-vein2{position:absolute;top:0;left:58%;width:1px;height:85%;background:linear-gradient(to bottom,transparent,rgba(232,210,178,0.06) 40%,transparent)}
.hero-badge{position:absolute;top:24px;right:48px;background:rgba(196,125,42,0.12);border:1px solid rgba(196,125,42,0.3);padding:6px 14px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.12em;color:var(--amber-soft);margin-top:80px}
.hero-content{position:relative;z-index:1;max-width:640px}
.hero-label{font-size:10px;font-weight:700;letter-spacing:0.14em;color:var(--amber);text-transform:uppercase;margin-bottom:20px}
.hero-h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(52px,7vw,88px);font-weight:700;line-height:1.04;letter-spacing:-0.01em;color:var(--text);margin-bottom:28px}
.hero-h1 em{font-style:italic;color:var(--amber-soft)}
.hero-sub{font-size:18px;font-weight:300;line-height:1.6;color:var(--muted);max-width:480px;margin-bottom:44px}
.hero-ctas{display:flex;gap:16px;flex-wrap:wrap}
.btn-primary{background:var(--amber);color:#0C0B09;border:none;padding:16px 36px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:0.02em;transition:opacity .2s;text-decoration:none;display:inline-block}
.btn-primary:hover{opacity:.85}
.btn-ghost{background:transparent;color:var(--text);border:1px solid var(--border2);padding:16px 36px;border-radius:12px;font-size:15px;font-weight:500;cursor:pointer;transition:border-color .2s;text-decoration:none;display:inline-block}
.btn-ghost:hover{border-color:rgba(232,227,220,0.3)}
.hero-right{position:absolute;right:0;top:50%;transform:translateY(-50%);z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:40px}

/* Material swatches in hero */
.mat-swatch{border-radius:12px;overflow:hidden;position:relative}
.ms-1{width:180px;height:220px;background:linear-gradient(150deg,#3e2e1e 0%,#5c4634 45%,#7a6048 100%)}
.ms-2{width:130px;height:160px;background:linear-gradient(160deg,#1e2432 0%,#2c3a4c 50%,#3a5062 100%);margin-top:60px}
.ms-3{width:150px;height:180px;background:linear-gradient(140deg,#2a2018 0%,#3e3020 50%,#52422e 100%);margin-top:-20px}
.ms-4{width:120px;height:140px;background:linear-gradient(155deg,#3a2c10 0%,#5a4418 50%,#7a5e24 100%);margin-top:40px}
.mat-vein{position:absolute;top:0;left:28%;width:1px;height:100%;background:rgba(232,210,178,0.1)}
.mat-vein2{position:absolute;top:10%;left:60%;width:1px;height:80%;background:rgba(232,210,178,0.07)}
.mat-label{position:absolute;bottom:10px;left:10px;right:10px;background:rgba(12,11,9,0.75);border-radius:6px;padding:5px 8px;font-size:9px;font-weight:700;letter-spacing:0.1em;color:var(--amber-soft)}

/* Stat strip */
.stats{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:32px 48px;display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.stat-item{text-align:center;padding:0 20px;position:relative}
.stat-item+.stat-item::before{content:'';position:absolute;left:0;top:10%;height:80%;width:1px;background:var(--border)}
.stat-num{font-family:'Playfair Display',Georgia,serif;font-size:42px;font-weight:700;color:var(--amber-soft);line-height:1}
.stat-label{font-size:11px;font-weight:500;letter-spacing:0.08em;color:var(--muted);text-transform:uppercase;margin-top:8px}

/* Features */
.section{padding:96px 48px}
.section-label{font-size:10px;font-weight:700;letter-spacing:0.14em;color:var(--amber);text-transform:uppercase;margin-bottom:16px}
.section-h2{font-family:'Playfair Display',Georgia,serif;font-size:clamp(34px,4vw,52px);font-weight:700;color:var(--text);margin-bottom:16px;line-height:1.1}
.section-sub{font-size:16px;font-weight:300;color:var(--muted);line-height:1.7;max-width:480px;margin-bottom:56px}
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.feat-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:36px 28px;transition:border-color .25s,transform .25s}
.feat-card:hover{border-color:var(--border2);transform:translateY(-4px)}
.feat-icon{width:48px;height:48px;background:var(--amber-dim);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:24px}
.feat-title{font-size:18px;font-weight:600;color:var(--text);margin-bottom:10px}
.feat-desc{font-size:14px;font-weight:400;color:var(--muted);line-height:1.65}

/* Material showcase */
.showcase{padding:0 48px 96px;display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
.sc-item{border-radius:16px;overflow:hidden;position:relative;aspect-ratio:2/3}
.sc-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(12,11,9,0.9) 0%,transparent 50%)}
.sc-info{position:absolute;bottom:16px;left:16px;right:16px}
.sc-cat{font-size:8px;font-weight:700;letter-spacing:0.12em;color:var(--amber-soft);text-transform:uppercase;margin-bottom:4px}
.sc-name{font-size:14px;font-weight:600;color:var(--text);line-height:1.2}
.sc-origin{font-size:10px;font-weight:400;color:var(--muted)}
.mat-marble{background:linear-gradient(150deg,#3e2e1e 0%,#5c4634 45%,#7a6048 100%)}
.mat-granite{background:linear-gradient(160deg,#1e2432 0%,#2c3a4c 50%,#3a5062 100%)}
.mat-oak{background:linear-gradient(140deg,#2a2018 0%,#3e3020 50%,#52422e 100%)}
.mat-quartzite{background:linear-gradient(145deg,#1e2a1e 0%,#2c3e2a 50%,#3a5038 100%)}
.mat-sandstone{background:linear-gradient(155deg,#3a2c10 0%,#5a4418 50%,#7a5e24 100%)}

/* CTA section */
.cta-section{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:96px 48px;text-align:center}
.cta-h2{font-family:'Playfair Display',Georgia,serif;font-size:clamp(36px,4vw,56px);font-weight:700;color:var(--text);margin-bottom:20px;line-height:1.1}
.cta-sub{font-size:17px;font-weight:300;color:var(--muted);margin-bottom:44px}
.cta-pills{display:flex;gap:12px;justify-content:center;margin-bottom:44px;flex-wrap:wrap}
.pill{padding:8px 18px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.04em;border:1px solid var(--border2);color:var(--muted)}

/* How it works */
.how{padding:96px 48px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.step-list{display:flex;flex-direction:column;gap:32px}
.step{display:flex;gap:20px;align-items:flex-start}
.step-num{width:36px;height:36px;border-radius:50%;background:var(--amber-dim);border:1px solid rgba(196,125,42,0.3);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--amber);flex-shrink:0}
.step-content h3{font-size:16px;font-weight:600;color:var(--text);margin-bottom:6px}
.step-content p{font-size:14px;font-weight:400;color:var(--muted);line-height:1.6}
.phone-mock{background:var(--surface2);border-radius:40px;padding:20px;border:1px solid var(--border2);max-width:280px;margin:0 auto}
.phone-screen{background:var(--surface);border-radius:28px;overflow:hidden;padding:20px}
.ps-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.ps-title{font-size:16px;font-weight:700;font-family:'Playfair Display',serif;color:var(--text)}
.ps-sub{font-size:10px;color:var(--muted)}
.ps-search{background:var(--surface2);border-radius:10px;padding:10px 14px;font-size:11px;color:var(--muted);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.ps-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ps-card{border-radius:10px;overflow:hidden}
.ps-tex{height:70px}
.ps-card-info{padding:6px 8px;background:var(--surface2)}
.ps-card-name{font-size:10px;font-weight:600;color:var(--text)}
.ps-card-cat{font-size:8px;color:var(--amber);font-weight:700;letter-spacing:0.06em}

/* Footer */
footer{background:var(--surface);border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
.footer-logo{font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;letter-spacing:0.08em;color:var(--text)}
.footer-tagline{font-size:12px;color:var(--muted);margin-top:6px}
.footer-links{display:flex;gap:28px}
.footer-link{font-size:13px;color:var(--muted);text-decoration:none;transition:color .2s}
.footer-link:hover{color:var(--text)}
.footer-credit{font-size:11px;color:var(--dim);text-align:right}

@media(max-width:900px){
  .features{grid-template-columns:1fr 1fr}
  .showcase{grid-template-columns:repeat(3,1fr)}
  .how{grid-template-columns:1fr}
  .stats{grid-template-columns:repeat(2,1fr)}
  nav{padding:16px 24px}
  .hero{padding:100px 24px 60px}
  .hero-right{display:none}
}
@media(max-width:600px){
  .features{grid-template-columns:1fr}
  .showcase{grid-template-columns:repeat(2,1fr)}
  .stats{grid-template-columns:repeat(2,1fr)}
  .section{padding:64px 24px}
}
</style>
</head>
<body>

<nav>
  <div class="logo">FACET</div>
  <div class="nav-r">
    <a href="#features" class="nav-link">Features</a>
    <a href="#library" class="nav-link">Library</a>
    <a href="#how" class="nav-link">How it works</a>
    <button class="btn-nav">Request Access</button>
  </div>
</nav>

<section class="hero">
  <div class="hero-texture">
    <div class="tex-layer tex-a"></div>
    <div class="tex-layer tex-b"></div>
    <div class="tex-layer tex-c"></div>
    <div class="tex-vein"></div>
    <div class="tex-vein2"></div>
  </div>
  <div class="hero-badge">Material Intelligence</div>
  <div class="hero-content">
    <p class="hero-label">For Architects & Interior Designers</p>
    <h1 class="hero-h1">Every material<br><em>tells a story.</em></h1>
    <p class="hero-sub">Discover, specify, and collaborate on materials — from Carrara marble to Belgian zinc — with a platform built for the way architects actually work.</p>
    <div class="hero-ctas">
      <a href="#" class="btn-primary">Start Exploring →</a>
      <a href="#how" class="btn-ghost">See how it works</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="mat-swatch ms-1"><div class="mat-vein"></div><div class="mat-vein2"></div><div class="mat-label">CALACATTA ORO</div></div>
    <div class="mat-swatch ms-2"><div class="mat-label">PEWTER ZINC</div></div>
    <div class="mat-swatch ms-3"><div class="mat-label">SMOKED OAK</div></div>
    <div class="mat-swatch ms-4"><div class="mat-label">SAHARA GOLD</div></div>
  </div>
</section>

<div class="stats">
  <div class="stat-item"><div class="stat-num">12k+</div><div class="stat-label">Materials</div></div>
  <div class="stat-item"><div class="stat-num">840+</div><div class="stat-label">Suppliers</div></div>
  <div class="stat-item"><div class="stat-num">62</div><div class="stat-label">Countries</div></div>
  <div class="stat-item"><div class="stat-num">97%</div><div class="stat-label">Scan Accuracy</div></div>
</div>

<section id="library" style="padding:80px 48px 0">
  <p class="section-label">The Library</p>
  <h2 class="section-h2">Curated by material experts</h2>
  <p class="section-sub">Every entry is photographed in controlled light, verified for provenance, and cross-referenced with certified suppliers.</p>
</section>

<div class="showcase">
  <div class="sc-item mat-marble"><div class="mat-vein"></div><div class="mat-vein2"></div><div class="sc-overlay"></div><div class="sc-info"><div class="sc-cat">Marble</div><div class="sc-name">Calacatta Oro</div><div class="sc-origin">Carrara, Italy</div></div></div>
  <div class="sc-item mat-granite" style="margin-top:40px"><div class="sc-overlay"></div><div class="sc-info"><div class="sc-cat">Granite</div><div class="sc-name">Black Absolut</div><div class="sc-origin">Zimbabwe</div></div></div>
  <div class="sc-item mat-oak"><div class="sc-overlay"></div><div class="sc-info"><div class="sc-cat">Hardwood</div><div class="sc-name">Smoked Oak</div><div class="sc-origin">Appalachians, US</div></div></div>
  <div class="sc-item mat-quartzite" style="margin-top:20px"><div class="sc-overlay"></div><div class="sc-info"><div class="sc-cat">Quartzite</div><div class="sc-name">Verde Indio</div><div class="sc-origin">Brazil</div></div></div>
  <div class="sc-item mat-sandstone"><div class="sc-overlay"></div><div class="sc-info"><div class="sc-cat">Sandstone</div><div class="sc-name">Sahara Gold</div><div class="sc-origin">Morocco</div></div></div>
</div>

<section id="features" class="section">
  <p class="section-label">Features</p>
  <h2 class="section-h2">Built for specification,<br>not just inspiration</h2>
  <p class="section-sub">From first discovery to project handover — every tool architects need in one place.</p>
  <div class="features">
    <div class="feat-card"><div class="feat-icon">⬡</div><div class="feat-title">Material Discovery</div><div class="feat-desc">Browse 12,000+ verified materials across 18 categories. Filter by finish, thickness, slab size, lead time, and region.</div></div>
    <div class="feat-card"><div class="feat-icon">◎</div><div class="feat-title">AI Scan & Identify</div><div class="feat-desc">Point your camera at any material — stone, wood, metal, textile — and identify it in seconds with 97% accuracy.</div></div>
    <div class="feat-card"><div class="feat-icon">◫</div><div class="feat-title">Collection Boards</div><div class="feat-desc">Build mood boards per project, share with clients and collaborators, and track material status in real time.</div></div>
    <div class="feat-card"><div class="feat-icon">◳</div><div class="feat-title">Project Palettes</div><div class="feat-desc">Specify materials per area, calculate coverage, track costs, and export to PDF, CSV, or IFC for contractors.</div></div>
    <div class="feat-card"><div class="feat-icon">⊟</div><div class="feat-title">Supplier Network</div><div class="feat-desc">Connect directly with 840+ verified suppliers across 62 countries. Request samples in two taps.</div></div>
    <div class="feat-card"><div class="feat-icon">◈</div><div class="feat-title">Version History</div><div class="feat-desc">Every board and palette is versioned. Compare material changes across design iterations and client revisions.</div></div>
  </div>
</section>

<section id="how" class="how">
  <div>
    <p class="section-label">How It Works</p>
    <h2 class="section-h2">From discovery<br>to specification</h2>
    <div class="step-list">
      <div class="step"><div class="step-num">1</div><div class="step-content"><h3>Discover materials</h3><p>Browse the curated library or use AI Scan to identify materials on site visits, in showrooms, or from reference images.</p></div></div>
      <div class="step"><div class="step-num">2</div><div class="step-content"><h3>Build your board</h3><p>Drag materials into project boards. Arrange, compare, and share with clients for feedback and sign-off.</p></div></div>
      <div class="step"><div class="step-num">3</div><div class="step-content"><h3>Specify & export</h3><p>Assign materials to areas, input quantities, calculate costs — then export a complete material schedule in one click.</p></div></div>
    </div>
  </div>
  <div>
    <div class="phone-mock">
      <div class="phone-screen">
        <div class="ps-header"><div><div class="ps-title">FACET</div><div class="ps-sub">Material Intelligence</div></div><span style="font-size:18px;color:var(--amber)">⬡</span></div>
        <div class="ps-search"><span style="color:var(--amber);font-size:13px">◎</span> Search materials…</div>
        <div class="ps-grid">
          <div class="ps-card"><div class="ps-tex mat-marble"><div class="mat-vein"></div></div><div class="ps-card-info"><div class="ps-card-cat">MARBLE</div><div class="ps-card-name">Calacatta Oro</div></div></div>
          <div class="ps-card"><div class="ps-tex mat-quartzite"></div><div class="ps-card-info"><div class="ps-card-cat">QUARTZITE</div><div class="ps-card-name">Verde Indio</div></div></div>
          <div class="ps-card"><div class="ps-tex mat-oak"></div><div class="ps-card-info"><div class="ps-card-cat">HARDWOOD</div><div class="ps-card-name">Smoked Oak</div></div></div>
          <div class="ps-card"><div class="ps-tex mat-sandstone"></div><div class="ps-card-info"><div class="ps-card-cat">SANDSTONE</div><div class="ps-card-name">Sahara Gold</div></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <p class="section-label" style="text-align:center">Join the beta</p>
  <h2 class="cta-h2">Ready to specify<br>with confidence?</h2>
  <p class="cta-sub">Join 2,400 architects and designers already on the waitlist.</p>
  <div class="cta-pills">
    <div class="pill">12,000+ Materials</div>
    <div class="pill">AI-Powered Scan</div>
    <div class="pill">Sample Requests</div>
    <div class="pill">IFC Export</div>
    <div class="pill">Team Boards</div>
  </div>
  <a href="#" class="btn-primary" style="font-size:16px;padding:18px 48px">Request Early Access →</a>
</section>

<footer>
  <div>
    <div class="footer-logo">FACET</div>
    <div class="footer-tagline">Every material tells a story.</div>
  </div>
  <div class="footer-links">
    <a href="#" class="footer-link">Features</a>
    <a href="#" class="footer-link">Library</a>
    <a href="#" class="footer-link">Pricing</a>
    <a href="#" class="footer-link">Blog</a>
  </div>
  <div class="footer-credit">Designed by RAM<br>ram.zenbin.org</div>
</footer>

</body>
</html>`;

// ── VIEWER PAGE ────────────────────────────────────────────────────────────────
const rawViewer = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/facet.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
let viewerHtml = rawViewer.replace('<script>', injection + '\n<script>');

(async () => {
  await pub(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  await pub(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
  console.log('Done.');
})();
