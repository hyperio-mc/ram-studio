/**
 * LUX — publish pipeline
 * 1. Hero page → ram.zenbin.org/lux
 * 2. Viewer  → ram.zenbin.org/lux-viewer (with EMBEDDED_PEN)
 */

const fs   = require('fs');
const https = require('https');

const SLUG     = 'lux';
const APP_NAME = 'LUX';
const TAGLINE  = 'Your creative portfolio studio';
const SUBDOMAIN = 'ram';

// ── Zenbin publish helper ─────────────────────────────────────────────────────

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title, html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': SUBDOMAIN,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201)
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}` });
        else reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LUX — Creative Portfolio Studio</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#F3F0EA;
  --bg2:#EAE6DF;
  --surface:rgba(255,255,255,0.85);
  --border:rgba(24,20,32,0.09);
  --text:#17131D;
  --mid:#6A5F79;
  --dim:#B0A8BC;
  --violet:#6B5CE7;
  --violet-hi:#8B7DF0;
  --violet-lo:rgba(107,92,231,0.12);
  --pink:#E74C85;
  --pink-lo:rgba(231,76,133,0.11);
  --teal:#2ABFA3;
  --teal-lo:rgba(42,191,163,0.11);
  --gold:#D4A947;
  --gold-lo:rgba(212,169,71,0.11);
  --white:#FFFFFF;
}
html,body{min-height:100vh;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif}

/* HERO */
.hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;padding:80px 24px 60px}
.orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.orb1{width:600px;height:380px;background:rgba(107,92,231,0.13);top:-80px;right:-100px}
.orb2{width:400px;height:280px;background:rgba(231,76,133,0.09);bottom:-60px;left:-80px}
.orb3{width:300px;height:200px;background:rgba(42,191,163,0.08);top:50%;left:20%;transform:translateY(-50%)}

.badge{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(107,92,231,0.25);border-radius:20px;padding:6px 16px;font-size:11px;font-weight:700;letter-spacing:2px;color:var(--violet);margin-bottom:32px;background:rgba(107,92,231,0.06)}
.badge::before{content:'◈';font-size:12px}
h1{font-size:clamp(52px,10vw,100px);font-weight:900;letter-spacing:-4px;line-height:0.92;text-align:center;margin-bottom:14px;color:var(--text)}
h1 span{background:linear-gradient(135deg,var(--violet),var(--pink));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.tagline{font-size:clamp(16px,2.5vw,20px);font-weight:300;color:var(--mid);text-align:center;max-width:480px;margin-bottom:48px;line-height:1.5}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
.btn-primary{background:var(--violet);color:#fff;border:none;padding:16px 36px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;transition:background 0.2s,transform 0.15s}
.btn-primary:hover{background:var(--violet-hi);transform:translateY(-1px)}
.btn-secondary{background:var(--surface);color:var(--text);border:1px solid var(--border);padding:16px 36px;border-radius:14px;font-size:15px;font-weight:500;cursor:pointer;text-decoration:none;transition:border-color 0.2s}
.btn-secondary:hover{border-color:var(--violet);color:var(--violet)}

/* PHONE MOCKUPS */
.phone-wrap{display:flex;justify-content:center;gap:20px;perspective:1200px;margin-bottom:80px}
.phone{width:196px;height:400px;background:var(--surface);border-radius:32px;border:1px solid var(--border);overflow:hidden;flex-shrink:0;box-shadow:0 30px 80px rgba(107,92,231,0.12),0 8px 20px rgba(0,0,0,0.06)}
.phone.center{transform:rotateY(0deg) scale(1.1);z-index:2;border-color:rgba(107,92,231,0.3);box-shadow:0 40px 100px rgba(107,92,231,0.18),0 10px 30px rgba(0,0,0,0.08)}
.phone.left{transform:rotateY(12deg) translateX(16px) scale(0.91);opacity:0.65}
.phone.right{transform:rotateY(-12deg) translateX(-16px) scale(0.91);opacity:0.65}
.phone-screen{width:100%;height:100%;background:var(--bg);display:flex;flex-direction:column;padding:14px 12px 6px;position:relative;overflow:hidden}
.phone-notch{width:56px;height:5px;background:var(--border);border-radius:3px;margin:0 auto 10px;opacity:0.5}
.p-badge{font-size:7px;font-weight:700;letter-spacing:2px;color:var(--violet);margin-bottom:4px}
.p-heading{font-size:18px;font-weight:800;letter-spacing:-0.8px;color:var(--text);margin-bottom:10px}
.p-card{background:var(--surface);border-radius:14px;padding:10px;margin-bottom:8px;border:1px solid var(--border)}
.p-card-label{font-size:6px;font-weight:700;letter-spacing:1.5px;color:var(--violet)}
.p-card-title{font-size:12px;font-weight:700;color:var(--text)}
.p-thumb{height:52px;border-radius:10px;margin-bottom:8px;display:grid;grid-template-columns:3fr 2fr;grid-template-rows:1fr 1fr;gap:3px}
.p-thumb-a{background:var(--violet-lo);border-radius:6px;grid-row:span 2}
.p-thumb-b{background:var(--pink-lo);border-radius:6px}
.p-thumb-c{background:var(--teal-lo);border-radius:6px}
.p-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:6px}
.p-grid-item{background:var(--violet-lo);border-radius:8px;padding:6px;height:44px}
.p-grid-item:nth-child(2){background:var(--pink-lo)}
.p-grid-item:nth-child(3){background:var(--teal-lo)}
.p-grid-item:nth-child(4){background:var(--gold-lo)}
.p-grid-label{font-size:5px;font-weight:700;letter-spacing:1px;color:var(--mid);margin-bottom:2px}
.p-grid-val{font-size:13px;font-weight:800;color:var(--text)}
.p-nav{position:absolute;bottom:0;left:0;right:0;height:40px;background:var(--surface);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-around;padding:0 4px}
.p-nav-dot{width:6px;height:6px;border-radius:50%;background:var(--dim);transition:background 0.2s}
.p-nav-dot.active{background:var(--violet)}
.p-orb{position:absolute;border-radius:50%;filter:blur(30px);pointer-events:none;opacity:0.18}

/* FEATURES */
.section{padding:80px 24px;max-width:1100px;margin:0 auto;width:100%}
.section-label{font-size:10px;font-weight:700;letter-spacing:3px;color:var(--violet);margin-bottom:16px}
.section-title{font-size:clamp(30px,5vw,52px);font-weight:800;letter-spacing:-1.5px;line-height:1.05;margin-bottom:14px}
.section-title em{font-style:normal;background:linear-gradient(135deg,var(--violet),var(--pink));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.section-sub{font-size:16px;color:var(--mid);max-width:480px;line-height:1.6;margin-bottom:52px}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
.feat{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:30px;transition:border-color 0.2s,box-shadow 0.2s}
.feat:hover{border-color:rgba(107,92,231,0.25);box-shadow:0 8px 32px rgba(107,92,231,0.08)}
.feat-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:18px}
.feat h3{font-size:17px;font-weight:700;margin-bottom:8px;letter-spacing:-0.3px}
.feat p{font-size:13px;color:var(--mid);line-height:1.6}

/* PALETTE */
.palette-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px}
.swatch{display:flex;flex-direction:column;align-items:center;gap:6px}
.swatch-color{width:56px;height:56px;border-radius:14px;border:1px solid var(--border)}
.swatch-name{font-size:10px;color:var(--mid);font-weight:500}

/* FOOTER */
footer{border-top:1px solid var(--border);padding:40px 24px;text-align:center;color:var(--dim);font-size:12px}
footer a{color:var(--violet);text-decoration:none;font-weight:600}
</style>
</head>
<body>

<section class="hero">
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>

  <div class="badge">RAM DESIGN HEARTBEAT</div>
  <h1>LUX<br><span>Portfolio</span><br>Studio</h1>
  <p class="tagline">Your creative work, beautifully organised. Glass-light UI for visual creators.</p>
  <div class="cta-row">
    <a href="/lux-viewer" class="btn-primary">Open in Pencil Viewer →</a>
    <a href="/lux-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>

  <div class="phone-wrap">
    <!-- Left: Explore screen -->
    <div class="phone left">
      <div class="phone-screen">
        <div style="position:absolute;width:120px;height:80px;background:rgba(212,169,71,0.15);border-radius:50%;filter:blur(30px);top:-20px;right:-20px"></div>
        <div class="phone-notch"></div>
        <div class="p-badge">EXPLORE</div>
        <div class="p-heading" style="font-size:16px">Trending Now</div>
        <div class="p-card">
          <div class="p-thumb">
            <div class="p-thumb-a"></div>
            <div class="p-thumb-b"></div>
            <div class="p-thumb-c"></div>
          </div>
          <div class="p-card-label">UI DESIGN</div>
          <div class="p-card-title">Organic UI System</div>
        </div>
        <div class="p-card" style="background:rgba(42,191,163,0.08);border-color:rgba(42,191,163,0.15)">
          <div class="p-card-label" style="color:var(--teal)">MOTION</div>
          <div class="p-card-title">Type in Motion</div>
        </div>
        <div class="p-nav">
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot active"></div>
          <div class="p-nav-dot"></div>
        </div>
      </div>
    </div>

    <!-- Center: Home screen -->
    <div class="phone center">
      <div class="phone-screen">
        <div style="position:absolute;width:140px;height:100px;background:rgba(107,92,231,0.12);border-radius:50%;filter:blur(35px);top:-30px;right:-30px"></div>
        <div class="phone-notch"></div>
        <div class="p-badge">LUX</div>
        <div class="p-heading">Good morning,<br><span style="font-size:22px">Zara.</span></div>
        <div class="p-card" style="padding:0;overflow:hidden">
          <div style="height:60px;background:var(--bg2);display:grid;grid-template-columns:3fr 2fr;grid-template-rows:1fr 1fr;gap:3px;padding:8px">
            <div style="background:var(--violet-lo);border-radius:8px;grid-row:span 2"></div>
            <div style="background:var(--pink-lo);border-radius:6px"></div>
            <div style="background:var(--teal-lo);border-radius:6px"></div>
          </div>
          <div style="padding:8px 10px">
            <div class="p-card-label">BRAND IDENTITY · 2025</div>
            <div class="p-card-title">Nova Health Rebrand</div>
          </div>
        </div>
        <div class="p-grid">
          <div class="p-grid-item">
            <div class="p-grid-label">UI DESIGN</div>
            <div class="p-grid-val" style="font-size:11px">Pulse App</div>
          </div>
          <div class="p-grid-item">
            <div class="p-grid-label">MOTION</div>
            <div class="p-grid-val" style="font-size:11px">3D Titles</div>
          </div>
          <div class="p-grid-item">
            <div class="p-grid-label">BRANDING</div>
            <div class="p-grid-val" style="font-size:11px">Bloom Co.</div>
          </div>
          <div class="p-grid-item">
            <div class="p-grid-label">WEB</div>
            <div class="p-grid-val" style="font-size:11px">Folio v3</div>
          </div>
        </div>
        <div class="p-nav">
          <div class="p-nav-dot active"></div>
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot"></div>
        </div>
      </div>
    </div>

    <!-- Right: Profile screen -->
    <div class="phone right">
      <div class="phone-screen">
        <div style="position:absolute;width:160px;height:120px;background:rgba(231,76,133,0.10);border-radius:50%;filter:blur(35px);top:40px;left:50%;transform:translateX(-50%)"></div>
        <div class="phone-notch"></div>
        <div style="font-size:14px;font-weight:800;color:var(--text);text-align:center;margin-bottom:6px">Profile</div>
        <div style="width:56px;height:56px;border-radius:50%;background:var(--violet-lo);border:2px solid rgba(107,92,231,0.3);margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:var(--violet)">ZK</div>
        <div style="text-align:center;font-size:13px;font-weight:700;color:var(--text)">Zara Kim</div>
        <div style="text-align:center;font-size:8px;color:var(--mid);margin-bottom:8px">Visual Designer</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px">
          <div style="background:var(--surface);border-radius:10px;padding:5px;text-align:center;border:1px solid var(--border)"><div style="font-size:13px;font-weight:800;color:var(--violet)">48</div><div style="font-size:6px;color:var(--mid)">Projects</div></div>
          <div style="background:var(--surface);border-radius:10px;padding:5px;text-align:center;border:1px solid var(--border)"><div style="font-size:11px;font-weight:800;color:var(--violet)">12.4K</div><div style="font-size:6px;color:var(--mid)">Followers</div></div>
          <div style="background:var(--surface);border-radius:10px;padding:5px;text-align:center;border:1px solid var(--border)"><div style="font-size:11px;font-weight:800;color:var(--violet)">3.2K</div><div style="font-size:6px;color:var(--mid)">Following</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px">
          <div style="height:40px;background:var(--pink-lo);border-radius:8px"></div>
          <div style="height:40px;background:var(--violet-lo);border-radius:8px"></div>
          <div style="height:40px;background:var(--teal-lo);border-radius:8px"></div>
          <div style="height:40px;background:var(--gold-lo);border-radius:8px"></div>
          <div style="height:40px;background:var(--teal-lo);border-radius:8px"></div>
          <div style="height:40px;background:var(--pink-lo);border-radius:8px"></div>
        </div>
        <div class="p-nav">
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot"></div>
          <div class="p-nav-dot active"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-label">DESIGN DECISIONS</div>
  <h2 class="section-title">Glass <em>light</em>,<br>not glass dark.</h2>
  <p class="section-sub">Most glassmorphism goes dark. LUX flips it — frosted glass panels float above warm cream, lit from within by prismatic accent glows.</p>

  <div class="feat-grid">
    <div class="feat">
      <div class="feat-icon" style="background:var(--violet-lo)">🪟</div>
      <h3>Frosted Glass Cards</h3>
      <p>rgba(255,255,255,0.82) with 1px translucent border — depth without heaviness. Cards feel suspended, not flat.</p>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:var(--pink-lo)">🌈</div>
      <h3>Prismatic Accent System</h3>
      <p>Four accent hues — violet, pink, teal, gold — used contextually across content types. Each project gets its own spectrum identity.</p>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:var(--teal-lo)">✦</div>
      <h3>Ambient Orb Glows</h3>
      <p>Elliptical blur orbs position-shift per screen — alive, breathing background. Inspired by Fluid Glass (Awwwards 2025).</p>
    </div>
    <div class="feat">
      <div class="feat-icon" style="background:var(--gold-lo)">⬡</div>
      <h3>Warm Cream Base</h3>
      <p>#F3F0EA — not pure white. Warm paper tone softens the glass cards above it, giving natural depth instead of clinical flatness.</p>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="section-label">COLOUR PALETTE</div>
  <h2 class="section-title">The <em>Spectrum</em>.</h2>
  <p class="section-sub">Warm neutrals ground the space. Prismatic accents provide identity and hierarchy.</p>
  <div class="palette-row">
    <div class="swatch"><div class="swatch-color" style="background:#F3F0EA"></div><div class="swatch-name">Cream #F3F0EA</div></div>
    <div class="swatch"><div class="swatch-color" style="background:rgba(255,255,255,0.82);backdrop-filter:blur(10px)"></div><div class="swatch-name">Glass Surface</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#17131D"></div><div class="swatch-name">Ink #17131D</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#6B5CE7"></div><div class="swatch-name">Violet #6B5CE7</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#E74C85"></div><div class="swatch-name">Pink #E74C85</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#2ABFA3"></div><div class="swatch-name">Teal #2ABFA3</div></div>
    <div class="swatch"><div class="swatch-color" style="background:#D4A947"></div><div class="swatch-name">Gold #D4A947</div></div>
  </div>
</section>

<footer>
  <p>RAM Design Heartbeat · ram.zenbin.org/lux · <a href="/lux-viewer">Open Viewer</a> · <a href="/lux-mock">Interactive Mock</a></p>
  <p style="margin-top:8px;opacity:0.6">Inspired by Fluid Glass (Awwwards) + minimal.gallery · Built with Pencil.dev v2.8</p>
</footer>

</body>
</html>`;

// ── Viewer HTML (with EMBEDDED_PEN) ──────────────────────────────────────────

const penJson = fs.readFileSync('/workspace/group/design-studio/lux.pen', 'utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LUX — Pencil Viewer</title>
<script src="https://unpkg.com/@pencilapp/viewer@latest/dist/viewer.umd.js"><\/script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;background:#F3F0EA;font-family:'Inter',sans-serif}
  #viewer-header{padding:12px 20px;background:rgba(255,255,255,0.85);border-bottom:1px solid rgba(24,20,32,0.08);display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(12px)}
  .vh-brand{font-size:14px;font-weight:800;letter-spacing:3px;color:#6B5CE7}
  .vh-sub{font-size:11px;color:#6A5F79}
  .vh-back{font-size:12px;color:#6B5CE7;text-decoration:none;font-weight:600}
  #viewer-wrap{height:calc(100vh - 48px);display:flex;align-items:center;justify-content:center;padding:24px}
  #pencil-viewer{width:100%;max-width:420px;height:100%;max-height:860px}
</style>
</head>
<body>
<div id="viewer-header">
  <div><div class="vh-brand">LUX</div><div class="vh-sub">Creative Portfolio Studio</div></div>
  <a href="/lux" class="vh-back">← Back to Overview</a>
</div>
<div id="viewer-wrap">
  <div id="pencil-viewer"></div>
</div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
document.addEventListener('DOMContentLoaded', () => {
  if (window.PencilViewer && window.EMBEDDED_PEN) {
    try {
      const pen = JSON.parse(window.EMBEDDED_PEN);
      PencilViewer.init(document.getElementById('pencil-viewer'), pen);
    } catch(e) { document.getElementById('pencil-viewer').textContent = 'Viewer error: ' + e.message; }
  }
});
<\/script>
</body>
</html>`;

// ── Run publish ───────────────────────────────────────────────────────────────

(async () => {
  console.log('Publishing hero page…');
  const r1 = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('✓ Hero →', r1.url);

  console.log('Publishing viewer…');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pencil Viewer`);
  console.log('✓ Viewer →', r2.url);
})();
