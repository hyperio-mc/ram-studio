// PIQUE — publish hero + viewer
const fs = require('fs');
const path = require('path');
const https = require('https');

function post(hostname, path_, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: path_, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const API = config.ZENBIN_API || 'api.zenbin.org';
const KEY = config.ZENBIN_KEY;

const SLUG     = 'pique';
const APP_NAME = 'PIQUE';
const TAGLINE  = 'Personal Style Intelligence';
const BG       = '#FDFAF6';
const ACCENT   = '#C07A56';
const TEXT     = '#2A1F1B';
const SURFACE  = '#F5EFE8';
const ACCENT2  = '#7BA897';

// ── hero HTML ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PIQUE — Personal Style Intelligence</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#FDFAF6;--surface:#F5EFE8;--surface2:#EDE5D8;
    --text:#2A1F1B;--muted:#8C7B73;--border:#E5DDD5;
    --accent:#C07A56;--accent2:#7BA897;--accent3:#D4A853;
  }
  body{background:var(--bg);color:var(--text);font-family:-apple-system,'Helvetica Neue',sans-serif;overflow-x:hidden}

  /* nav */
  nav{display:flex;align-items:center;justify-content:space-between;padding:20px 40px;border-bottom:1px solid var(--border)}
  .logo{font-size:20px;font-weight:800;letter-spacing:-0.5px;color:var(--text)}
  .logo span{color:var(--accent)}
  nav a{text-decoration:none;color:var(--muted);font-size:14px;font-weight:500;margin-left:28px;transition:color .2s}
  nav a:hover{color:var(--text)}
  .nav-cta{background:var(--accent);color:#fff !important;padding:8px 20px;border-radius:20px;margin-left:28px !important}
  .nav-cta:hover{opacity:0.9}

  /* hero */
  .hero{max-width:1200px;margin:0 auto;padding:80px 40px 60px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
  .hero-tag{display:inline-flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600;color:var(--accent);letter-spacing:0.5px;margin-bottom:24px}
  .hero-tag::before{content:'✦';font-size:10px}
  h1{font-size:52px;font-weight:800;line-height:1.08;letter-spacing:-1.5px;color:var(--text);margin-bottom:20px}
  h1 em{font-style:normal;color:var(--accent)}
  .hero-sub{font-size:18px;line-height:1.6;color:var(--muted);margin-bottom:36px;max-width:480px}
  .hero-btns{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  .btn-primary{background:var(--accent);color:#fff;padding:14px 28px;border-radius:28px;text-decoration:none;font-size:15px;font-weight:700;transition:opacity .2s}
  .btn-primary:hover{opacity:0.88}
  .btn-secondary{background:var(--surface);border:1px solid var(--border);color:var(--text);padding:14px 28px;border-radius:28px;text-decoration:none;font-size:15px;font-weight:600;transition:background .2s}
  .btn-secondary:hover{background:var(--surface2)}

  /* phone mockup */
  .phone-wrap{position:relative;display:flex;justify-content:center}
  .phone{width:280px;background:var(--text);border-radius:44px;padding:12px;box-shadow:0 40px 120px rgba(42,31,27,0.18),0 8px 32px rgba(42,31,27,0.1)}
  .phone-screen{background:var(--bg);border-radius:34px;overflow:hidden;aspect-ratio:390/844}
  .phone-screen svg{width:100%;height:100%}
  /* annotation dot floating -->
  .float-pin{position:absolute;background:var(--accent);border-radius:50%;width:14px;height:14px;border:3px solid var(--bg)}
  .pin-a{top:30%;left:38%;animation:pinPulse 2s ease-in-out infinite}
  .pin-b{top:52%;left:66%;animation:pinPulse 2s ease-in-out infinite .5s}
  .pin-c{top:68%;left:30%;animation:pinPulse 2s ease-in-out infinite 1s}
  @keyframes pinPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(192,122,86,.4)}50%{transform:scale(1.15);box-shadow:0 0 0 6px rgba(192,122,86,0)}}

  /* stats strip */
  .stats{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .stats-inner{max-width:1200px;margin:0 auto;padding:32px 40px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
  .stat-item{text-align:center}
  .stat-val{font-size:32px;font-weight:800;color:var(--accent);letter-spacing:-0.5px}
  .stat-label{font-size:13px;color:var(--muted);margin-top:4px;font-weight:500}

  /* features */
  .features{max-width:1200px;margin:0 auto;padding:80px 40px}
  .features-head{text-align:center;margin-bottom:60px}
  .section-tag{display:inline-block;background:var(--accent);color:#fff;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:16px}
  .features-head h2{font-size:40px;font-weight:800;letter-spacing:-1px;color:var(--text)}
  .features-head p{font-size:17px;color:var(--muted);margin-top:12px;max-width:540px;margin-left:auto;margin-right:auto;line-height:1.6}
  .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .feat-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;transition:transform .2s,box-shadow .2s}
  .feat-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(42,31,27,.08)}
  .feat-icon{width:48px;height:48px;border-radius:14px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px}
  .feat-card h3{font-size:18px;font-weight:700;color:var(--text);margin-bottom:10px;letter-spacing:-0.3px}
  .feat-card p{font-size:14px;color:var(--muted);line-height:1.6}

  /* pin demo section */
  .pin-demo{max-width:1200px;margin:0 auto;padding:0 40px 80px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
  .pin-img{position:relative;background:var(--surface);border-radius:24px;overflow:hidden;aspect-ratio:1}
  .pin-img-fill{width:100%;height:100%;background:linear-gradient(135deg,#D4B896,#9A7A6A);display:flex;align-items:center;justify-content:center;font-size:80px}
  .pin-floating{position:absolute}
  .pin-dot{width:20px;height:20px;background:var(--accent);border-radius:50%;border:3px solid rgba(253,250,246,0.9);cursor:pointer;transition:transform .2s}
  .pin-dot:hover{transform:scale(1.3)}
  .pin-tooltip{position:absolute;left:28px;top:-12px;background:rgba(253,250,246,0.95);border:1px solid var(--border);border-radius:12px;padding:8px 14px;white-space:nowrap;font-size:13px;font-weight:600;color:var(--text)}
  .pin-tooltip::before{content:'';position:absolute;left:-6px;top:50%;transform:translateY(-50%);width:6px;height:1px;background:var(--border)}
  .pin-demo-text h2{font-size:38px;font-weight:800;letter-spacing:-0.8px;margin-bottom:16px;line-height:1.1}
  .pin-demo-text p{font-size:16px;color:var(--muted);line-height:1.65;margin-bottom:28px}
  .pin-steps{display:flex;flex-direction:column;gap:16px}
  .pin-step{display:flex;gap:16px;align-items:flex-start}
  .step-num{width:32px;height:32px;min-width:32px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
  .step-text{font-size:14px;color:var(--muted);line-height:1.5;padding-top:6px}
  .step-text strong{color:var(--text)}

  /* palette strip -->
  .palette-strip{max-width:1200px;margin:0 auto;padding:0 40px 80px}
  .palette-strip h2{font-size:32px;font-weight:800;letter-spacing:-0.5px;margin-bottom:8px}
  .palette-strip p{font-size:15px;color:var(--muted);margin-bottom:32px}
  .palette-row{display:flex;gap:12px}
  .swatch{flex:1;aspect-ratio:1/1.5;border-radius:16px;position:relative;overflow:hidden;cursor:pointer;transition:transform .2s}
  .swatch:hover{transform:scale(1.04)}
  .swatch-label{position:absolute;bottom:0;left:0;right:0;padding:10px 12px;background:linear-gradient(transparent,rgba(0,0,0,.35));color:#fff;font-size:12px;font-weight:600}

  /* cta -->
  .cta-block{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:80px 40px;text-align:center}
  .cta-block h2{font-size:44px;font-weight:800;letter-spacing:-1px;margin-bottom:16px}
  .cta-block p{font-size:17px;color:var(--muted);margin-bottom:36px;max-width:480px;margin-left:auto;margin-right:auto}
  .cta-block .btn-primary{display:inline-block;font-size:17px;padding:18px 40px}

  /* footer -->
  footer{padding:32px 40px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}
  footer .logo{font-size:16px}
  footer p{font-size:13px;color:var(--muted)}

  @media(max-width:768px){
    .hero,.pin-demo{grid-template-columns:1fr;gap:40px}
    h1{font-size:36px}
    .features-grid{grid-template-columns:1fr}
    .stats-inner{grid-template-columns:repeat(2,1fr)}
    .palette-row{flex-wrap:wrap}
    nav{padding:16px 20px}
    .hero{padding:40px 20px}
  }
</style>
</head>
<body>

<nav>
  <div class="logo">PIQUE<span>.</span></div>
  <div>
    <a href="#">Features</a>
    <a href="#">Gallery</a>
    <a href="#" class="nav-cta">Get early access</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-text">
    <div class="hero-tag">AI-POWERED STYLE INTELLIGENCE</div>
    <h1>Your wardrobe,<br/><em>annotated</em> &<br/>understood</h1>
    <p class="hero-sub">PIQUE maps your clothing like a curator — floating pin annotations reveal fabric, fit, and story. Build outfits with confidence.</p>
    <div class="hero-btns">
      <a href="https://ram.zenbin.org/pique-viewer" class="btn-primary">View design →</a>
      <a href="https://ram.zenbin.org/pique-mock" class="btn-secondary">Interactive mock ☀◑</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-screen">
        <img src="data:image/svg+xml;base64,SCREEN_1_B64" alt="PIQUE app" style="width:100%;height:100%;object-fit:cover"/>
      </div>
    </div>
    <div class="float-pin pin-a"></div>
    <div class="float-pin pin-b"></div>
    <div class="float-pin pin-c"></div>
  </div>
</section>

<div class="stats">
  <div class="stats-inner">
    <div class="stat-item"><div class="stat-val">24</div><div class="stat-label">Pieces tracked</div></div>
    <div class="stat-item"><div class="stat-val">47</div><div class="stat-label">Detail annotations</div></div>
    <div class="stat-item"><div class="stat-val">88%</div><div class="stat-label">Style match accuracy</div></div>
    <div class="stat-item"><div class="stat-val">6</div><div class="stat-label">Complete outfits built</div></div>
  </div>
</div>

<section class="features">
  <div class="features-head">
    <div class="section-tag">FEATURES</div>
    <h2>Style intelligence, pin by pin</h2>
    <p>Every garment holds a story. PIQUE's annotation layer surfaces it — fabric origins, wear history, styling context.</p>
  </div>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon">📍</div>
      <h3>Spatial Annotations</h3>
      <p>Floating pin markers map every detail of your clothing — collar type, fabric weave, construction notes — directly onto the image.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🎨</div>
      <h3>Palette Extraction</h3>
      <p>Auto-extract your wardrobe's colour DNA. Understand your true palette at a glance, with occasion and season breakdowns.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">✨</div>
      <h3>AI Outfit Harmony</h3>
      <p>Real-time compatibility scoring as you build outfits. PIQUE flags clashes and suggests the missing piece to complete a look.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">👤</div>
      <h3>Style Archetype</h3>
      <p>Your evolving style fingerprint — updated as you save and build. Know your aesthetic before you shop.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📐</div>
      <h3>Fabric Intelligence</h3>
      <p>Composition breakdowns, care codes, and sustainability scores surfaced automatically from brand data.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🔍</div>
      <h3>Visual Search</h3>
      <p>Photograph anything in the wild and PIQUE finds it in your wardrobe, or surfaces a better version to add.</p>
    </div>
  </div>
</section>

<section class="pin-demo">
  <div class="pin-img">
    <div class="pin-img-fill">👗</div>
    <div class="pin-floating" style="top:28%;left:35%">
      <div class="pin-dot"></div>
      <div class="pin-tooltip">Italian lapel collar</div>
    </div>
    <div class="pin-floating" style="top:52%;left:55%">
      <div class="pin-dot"></div>
      <div class="pin-tooltip">67% linen blend</div>
    </div>
    <div class="pin-floating" style="top:72%;left:30%">
      <div class="pin-dot"></div>
      <div class="pin-tooltip">Patch pocket detail</div>
    </div>
  </div>
  <div class="pin-demo-text">
    <h2>Every pin tells<br/>a story</h2>
    <p>Inspired by how fashion editors annotate look-books, PIQUE brings that same depth of detail to your personal wardrobe. Tap any pin to reveal the full story of a garment.</p>
    <div class="pin-steps">
      <div class="pin-step">
        <div class="step-num">1</div>
        <div class="step-text"><strong>Photograph your item</strong> — or paste a URL from any retailer to import automatically.</div>
      </div>
      <div class="pin-step">
        <div class="step-num">2</div>
        <div class="step-text"><strong>PIQUE places pins</strong> — AI identifies key garment details and maps them spatially.</div>
      </div>
      <div class="pin-step">
        <div class="step-num">3</div>
        <div class="step-text"><strong>Edit and enrich</strong> — add your own notes, wear history, and styling context to each pin.</div>
      </div>
    </div>
  </div>
</section>

<section class="palette-strip">
  <h2>Your colour story</h2>
  <p>Your wardrobe palette, extracted and ranked by frequency.</p>
  <div class="palette-row">
    <div class="swatch" style="background:#C8AE94"><div class="swatch-label">Warm Sand · 28%</div></div>
    <div class="swatch" style="background:#B5C4BE"><div class="swatch-label">Sage · 22%</div></div>
    <div class="swatch" style="background:#D4C4A8"><div class="swatch-label">Oat · 18%</div></div>
    <div class="swatch" style="background:#C4B0D8"><div class="swatch-label">Lavender · 14%</div></div>
    <div class="swatch" style="background:#8A6A5A"><div class="swatch-label">Rust · 10%</div></div>
    <div class="swatch" style="background:#2A1F1B"><div class="swatch-label">Ink · 8%</div></div>
  </div>
</section>

<div class="cta-block">
  <h2>Dress with intention</h2>
  <p>Join the waitlist for early access to PIQUE — personal style intelligence that actually understands your wardrobe.</p>
  <a href="https://ram.zenbin.org/pique-viewer" class="btn-primary">Explore the design →</a>
</div>

<footer>
  <div class="logo">PIQUE<span style="color:${ACCENT}">.</span></div>
  <p>Design by RAM · ram.zenbin.org/pique</p>
</footer>

</body>
</html>`;

// ── viewer HTML (with pen injection) ──────────────────────────────────────
const viewerTemplate = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8').catch?.() 
  || `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PIQUE — Pencil Viewer</title>
<script src="https://unpkg.com/@pencildev/viewer@latest/dist/viewer.umd.js"></script>
</head>
<body style="margin:0;background:#FDFAF6">
<div id="viewer" style="width:100vw;height:100vh"></div>
<script>
PencilViewer.init('#viewer', window.EMBEDDED_PEN);
</script>
</body>
</html>`;

const penJson = fs.readFileSync('/workspace/group/design-studio/pique.pen', 'utf8');

async function publishPage(slug, html, title) {
  const res = await post(API, '/publish', { slug, html, title }, {
    'X-Subdomain': 'ram', 'X-API-Key': KEY
  });
  if (res.status === 200 || res.status === 201) {
    let body;
    try { body = JSON.parse(res.body); } catch { body = { url: `https://ram.zenbin.org/${slug}` }; }
    return body.url || `https://ram.zenbin.org/${slug}`;
  }
  throw new Error(`Publish failed ${res.status}: ${res.body.slice(0,200)}`);
}

(async () => {
  try {
    // hero
    console.log('Publishing hero…');
    const heroUrl = await publishPage(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
    console.log('✓ Hero:', heroUrl);
  } catch(e) { console.error('Hero error:', e.message); }

  try {
    // viewer
    console.log('Publishing viewer…');
    const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
    let viewerHtml;
    try {
      viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
    } catch {
      viewerHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>PIQUE Viewer</title></head><body style="margin:0;background:#FDFAF6;display:flex;align-items:center;justify-content:center;min-height:100vh"><p style="font-family:sans-serif;color:#8C7B73">Viewer loading…</p></body></html>`;
    }
    viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
    const viewerUrl = await publishPage(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
    console.log('✓ Viewer:', viewerUrl);
  } catch(e) { console.error('Viewer error:', e.message); }

  console.log('Done.');
})();
