/**
 * SLATE — Full publish pipeline
 * Hero + viewer + gallery queue
 */
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'slate';
const APP_NAME  = 'Slate';
const TAGLINE   = 'Every surface, perfectly specified.';
const ARCHETYPE = 'material-design-tool';
const PROMPT    = 'Dark-theme material intelligence platform for product designers — inspired by Darkroom\'s monochromatic finish-selector UI (darkmodedesign.com), viewport-spanning bold display typography from GQ & AP Extraordinary Lab (awwwards SOTD Mar 26), and numbered feature sections from Veo Sports Cameras (land-book.com). Near-black palette with warm brass accents.';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

function zenPost(slug, html, title) {
  return new Promise(function(resolve, reject) {
    const payload = JSON.stringify({ title: title || slug, html: html });
    const body    = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug + '?overwrite=true',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': body.length,
        'X-Subdomain':    'ram',
      },
    }, function(res) {
      let d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve({ status: res.statusCode, body: d }); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function ghReq(opts, body) {
  return new Promise(function(resolve, reject) {
    const r = https.request(opts, function(res) {
      let d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve({ status: res.statusCode, body: d }); });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ─── HERO HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Slate — Every surface, perfectly specified.</title>
<meta name="description" content="A material intelligence platform for product designers. Specify finishes, explore surfaces, and collaborate on material boards — all in one dark, minimal workspace.">
<style>
  :root {
    --bg: #0A0A0A;
    --surface: #141414;
    --surface2: #1C1C1C;
    --text: #F2EDE8;
    --text2: rgba(242,237,232,0.55);
    --text3: rgba(242,237,232,0.30);
    --brass: #C9B99A;
    --brassdim: #8C7F70;
    --border: rgba(242,237,232,0.08);
    --border2: rgba(242,237,232,0.12);
    --green: #5CB87A;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Inter',system-ui,sans-serif; min-height:100vh; }

  /* ── NAV ── */
  nav {
    position:fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 40px;
    background:rgba(10,10,10,0.85); backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border);
  }
  .logo { font-size:18px; font-weight:800; letter-spacing:-0.5px; color:var(--text); }
  .logo span { color:var(--brass); }
  nav a { color:var(--text2); text-decoration:none; font-size:14px; margin-left:32px; transition:color 0.2s; }
  nav a:hover { color:var(--text); }
  .nav-cta {
    background:var(--brass); color:#0A0A0A; font-weight:700;
    padding:8px 20px; border-radius:8px; font-size:13px;
    text-decoration:none; margin-left:20px; transition:opacity 0.2s;
  }
  .nav-cta:hover { opacity:0.85; }

  /* ── HERO ── */
  .hero {
    min-height:100vh; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:120px 40px 80px;
    text-align:center; position:relative; overflow:hidden;
  }
  .hero::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,185,154,0.07) 0%, transparent 70%);
  }
  .hero-kicker {
    display:inline-block; font-size:11px; font-weight:700; letter-spacing:2px;
    color:var(--brass); background:rgba(201,185,154,0.10);
    padding:6px 14px; border-radius:20px; border:1px solid rgba(201,185,154,0.2);
    margin-bottom:32px; text-transform:uppercase;
  }
  /* MASSIVE display type — directly from awwwards SOTD GQ & AP Extraordinary Lab */
  .hero h1 {
    font-size:clamp(64px, 10vw, 120px);
    font-weight:800; line-height:1.0; letter-spacing:-3px;
    margin-bottom:24px;
  }
  .hero h1 .accent { color:var(--brass); }
  .hero-sub {
    font-size:18px; color:var(--text2); max-width:520px;
    line-height:1.65; margin-bottom:40px;
  }
  .hero-actions { display:flex; gap:16px; justify-content:center; }
  .btn-primary {
    background:var(--brass); color:#0A0A0A; font-weight:700;
    padding:14px 32px; border-radius:10px; font-size:15px;
    text-decoration:none; transition:opacity 0.2s; border:none; cursor:pointer;
  }
  .btn-primary:hover { opacity:0.85; }
  .btn-ghost {
    background:transparent; color:var(--text); font-weight:600;
    padding:14px 32px; border-radius:10px; font-size:15px;
    text-decoration:none; border:1px solid var(--border2);
    transition:border-color 0.2s, color 0.2s;
  }
  .btn-ghost:hover { border-color:var(--brassdim); color:var(--brass); }

  /* ── MATERIAL PREVIEW STRIP ── */
  .material-strip {
    display:flex; gap:0; overflow:hidden;
    width:100%; max-width:800px; margin:0 auto 80px;
    border-radius:20px; border:1px solid var(--border2);
  }
  .mat-swatch {
    flex:1; height:120px; position:relative;
    display:flex; align-items:flex-end; padding:12px 14px;
    font-size:10px; font-weight:700; letter-spacing:0.5px;
    color:rgba(242,237,232,0.5); text-transform:uppercase;
    transition:flex 0.4s ease;
  }
  .mat-swatch:hover { flex:2.5; }
  .mat-swatch.active { flex:2; }

  /* ── FINISH SELECTOR (Darkroom-inspired) ── */
  .section { padding:100px 40px; max-width:1100px; margin:0 auto; }
  .section-kicker { font-size:11px; font-weight:700; letter-spacing:2px; color:var(--brass); text-transform:uppercase; margin-bottom:16px; }
  .section h2 { font-size:clamp(36px, 5vw, 56px); font-weight:800; letter-spacing:-1.5px; line-height:1.1; margin-bottom:20px; }
  .section-sub { font-size:16px; color:var(--text2); line-height:1.65; max-width:480px; margin-bottom:56px; }

  .finish-panel {
    background:var(--surface2); border:1px solid var(--border2);
    border-radius:20px; padding:8px; display:inline-flex; gap:4px;
    margin-bottom:40px;
  }
  .finish-btn {
    padding:12px 28px; border-radius:14px; border:none;
    font-size:13px; font-weight:700; cursor:pointer; letter-spacing:0.5px;
    transition:all 0.2s; background:transparent; color:var(--text3);
  }
  .finish-btn.active { background:var(--surface); color:var(--brass); }
  .finish-btn:hover:not(.active) { color:var(--text2); }

  /* ── NUMBERED FEATURES (land-book Veo-inspired) ── */
  .features { padding:100px 40px; max-width:1100px; margin:0 auto; }
  .feature {
    display:grid; grid-template-columns:100px 1fr; gap:32px;
    padding:48px 0; border-bottom:1px solid var(--border);
    align-items:start;
  }
  .feature:last-child { border-bottom:none; }
  .feat-num { font-size:72px; font-weight:800; color:var(--brass); opacity:0.5; letter-spacing:-3px; line-height:1; }
  .feat-content {}
  .feat-tag { font-size:11px; font-weight:700; letter-spacing:2px; color:var(--brassdim); text-transform:uppercase; margin-bottom:10px; }
  .feat-title { font-size:28px; font-weight:700; letter-spacing:-0.5px; margin-bottom:12px; }
  .feat-desc { font-size:15px; color:var(--text2); line-height:1.7; max-width:560px; }

  /* ── SPECS GRID ── */
  .specs-grid {
    display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));
    gap:16px; margin-top:48px;
  }
  .spec-card {
    background:var(--surface); border:1px solid var(--border2);
    border-radius:16px; padding:28px 24px;
  }
  .spec-card .spec-val { font-size:40px; font-weight:800; color:var(--brass); letter-spacing:-2px; }
  .spec-card .spec-label { font-size:13px; color:var(--text2); margin-top:4px; }

  /* ── FOOTER ── */
  footer {
    border-top:1px solid var(--border); padding:48px 40px;
    text-align:center; color:var(--text3); font-size:13px;
  }
  footer .f-logo { font-size:22px; font-weight:800; letter-spacing:-0.5px; color:var(--text); margin-bottom:12px; }
  footer .f-logo span { color:var(--brass); }

  @media(max-width:640px) {
    nav { padding:16px 20px; }
    .hero { padding:100px 20px 60px; }
    .section, .features { padding:60px 20px; }
    .feature { grid-template-columns:60px 1fr; gap:20px; }
    .feat-num { font-size:48px; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">SL<span>A</span>TE</div>
  <div>
    <a href="#">Library</a>
    <a href="#">Explore</a>
    <a href="#">Pricing</a>
    <a href="https://ram.zenbin.org/slate-viewer" class="nav-cta">View Design →</a>
  </div>
</nav>

<!-- ── HERO ── -->
<section class="hero">
  <div class="hero-kicker">Material Intelligence Platform</div>
  <h1>Every<br><span class="accent">surface,</span><br>specified.</h1>
  <p class="hero-sub">
    Slate gives product teams a single source of truth for material specs —
    finish selectors, anodize tolerances, supplier links, and live collab boards.
  </p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/slate-viewer" class="btn-primary">View Prototype →</a>
    <a href="https://ram.zenbin.org/slate-mock" class="btn-ghost">Interactive Mock</a>
  </div>
</section>

<!-- ── MATERIAL SWATCH STRIP ── -->
<div style="padding:0 40px 80px; max-width:1100px; margin:0 auto;">
  <div class="material-strip">
    <div class="mat-swatch active" style="background:#1A1A1A;">Matte Black</div>
    <div class="mat-swatch" style="background:#6B6B6B;">Satin Gray</div>
    <div class="mat-swatch" style="background:#C4C4C4; color:rgba(10,10,10,0.5);">Mirror Silver</div>
    <div class="mat-swatch" style="background:#2A1F12;">Dark Bronze</div>
    <div class="mat-swatch" style="background:#C4A862; color:rgba(10,10,10,0.6);">Brass Gold</div>
    <div class="mat-swatch" style="background:#1A3A2A;">Forest Anodize</div>
  </div>
</div>

<!-- ── FINISH SELECTOR SECTION ── -->
<section class="section">
  <div class="section-kicker">Core Interaction</div>
  <h2>Choose a finish.<br>See everything change.</h2>
  <p class="section-sub">
    Inspired by Darkroom's material-selector panel — tap a finish type and watch
    every spec, preview, and supplier recommendation update instantly.
  </p>
  <div class="finish-panel">
    <button class="finish-btn active" onclick="selectFinish(this,'MATTE')">MATTE</button>
    <button class="finish-btn" onclick="selectFinish(this,'SATIN')">SATIN</button>
    <button class="finish-btn" onclick="selectFinish(this,'GLOSS')">GLOSS</button>
    <button class="finish-btn" onclick="selectFinish(this,'BRUSH')">BRUSH</button>
  </div>
  <div id="finish-detail" style="background:var(--surface2);border:1px solid var(--border2);border-radius:20px;padding:32px;max-width:600px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--brass);text-transform:uppercase;margin-bottom:12px;">MATTE ANODIZE</div>
    <div style="font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:8px;">Type II Sulphuric Acid</div>
    <div style="color:var(--text2);font-size:14px;line-height:1.65;">
      12–25 µm coating. 350–500 HV hardness. Hot DI water seal at 95°C.
      Meets MIL-A-8625F and ISO 7599:2018 Class C.
    </div>
  </div>
</section>

<!-- ── NUMBERED FEATURES ── -->
<section class="features">
  <div class="section-kicker">Features</div>
  <h2>From swatch to<br>spec sheet.</h2>

  <div class="feature">
    <div class="feat-num">01</div>
    <div class="feat-content">
      <div class="feat-tag">Material Library</div>
      <div class="feat-title">Every finish, catalogued.</div>
      <div class="feat-desc">Build a searchable library of approved materials — anodize, fabric, polymer, ceramic. Tag, filter, and version every swatch with full revision history.</div>
    </div>
  </div>

  <div class="feature">
    <div class="feat-num">02</div>
    <div class="feat-content">
      <div class="feat-tag">Finish Explorer</div>
      <div class="feat-title">Live surface selection.</div>
      <div class="feat-desc">Toggle between MATTE, SATIN, GLOSS, and BRUSH in real time. Each finish auto-fills roughness, reflectance, and UV-resistance specs from your database.</div>
    </div>
  </div>

  <div class="feature">
    <div class="feat-num">03</div>
    <div class="feat-content">
      <div class="feat-tag">Spec Export</div>
      <div class="feat-title">Supplier-ready in one tap.</div>
      <div class="feat-desc">Export a machine-readable spec sheet with tolerances, treatment standards, and RFQ-ready notes. Direct to PDF or structured JSON for your PLM.</div>
    </div>
  </div>

  <div class="feature">
    <div class="feat-num">04</div>
    <div class="feat-content">
      <div class="feat-tag">Collab Boards</div>
      <div class="feat-title">Review with your team.</div>
      <div class="feat-desc">Approve, reject, or comment on materials in context. Thread-based feedback tied to each swatch — no more chasing decisions across email chains.</div>
    </div>
  </div>
</section>

<!-- ── STATS ── -->
<section class="section" style="padding-top:0;">
  <div class="specs-grid">
    <div class="spec-card">
      <div class="spec-val">48</div>
      <div class="spec-label">Material standards supported</div>
    </div>
    <div class="spec-card">
      <div class="spec-val">4</div>
      <div class="spec-label">Finish types with live preview</div>
    </div>
    <div class="spec-card">
      <div class="spec-val">±5µm</div>
      <div class="spec-label">Coating tolerance tracking</div>
    </div>
    <div class="spec-card">
      <div class="spec-val">1-tap</div>
      <div class="spec-label">Supplier-ready spec export</div>
    </div>
  </div>
</section>

<!-- ── CTA ── -->
<section style="padding:100px 40px; text-align:center;">
  <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--brass);text-transform:uppercase;margin-bottom:24px;">Design Prototype</div>
  <h2 style="font-size:clamp(36px,5vw,64px);font-weight:800;letter-spacing:-2px;margin-bottom:20px;">See Slate in motion.</h2>
  <p style="font-size:16px;color:var(--text2);margin-bottom:40px;">5 screens. Dark mode. Every surface, specified.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
    <a href="https://ram.zenbin.org/slate-viewer" class="btn-primary">View .pen Prototype →</a>
    <a href="https://ram.zenbin.org/slate-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <div class="f-logo">SL<span>A</span>TE</div>
  <div>A RAM Design Heartbeat concept · <a href="https://ram.zenbin.org" style="color:var(--brassdim);text-decoration:none;">ram.zenbin.org</a></div>
</footer>

<script>
const finishData = {
  MATTE: { title:'Type II Sulphuric Acid', sub:'12–25 µm coating. 350–500 HV hardness. Hot DI water seal at 95°C. Meets MIL-A-8625F and ISO 7599:2018 Class C.' },
  SATIN: { title:'Mechanical Satin Finish', sub:'180–220 grit linear polish. Ra 0.8–1.6 µm. Apply before anodize or as standalone. Directional grain, minimal reflection.' },
  GLOSS: { title:'Electropolish + Bright Dip', sub:'Mirror finish. Ra < 0.1 µm. Requires aluminium alloy with < 0.5% silicon. Post-process passivation required.' },
  BRUSH: { title:'Rotary Brush Texture', sub:'Circular grain pattern. 80–100 grit. Apply after machining, before any anodize. Typically used for decorative panels.' },
};
function selectFinish(btn, type) {
  document.querySelectorAll('.finish-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const d = finishData[type];
  document.getElementById('finish-detail').innerHTML =
    '<div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--brass);text-transform:uppercase;margin-bottom:12px;">' + type + ' FINISH</div>' +
    '<div style="font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:8px;">' + d.title + '</div>' +
    '<div style="color:var(--text2);font-size:14px;line-height:1.65;">' + d.sub + '</div>';
}
</script>
</body>
</html>`;
}

// ─── VIEWER HTML ────────────────────────────────────────────────────────────────
function buildViewerHTML() {
  const penJson   = fs.readFileSync(path.join(__dirname, 'slate.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Slate — Viewer</title>
${injection}
<script src="https://pencil.zenbin.org/viewer.js"><\/script>
</head>
<body style="margin:0;background:#0A0A0A;display:flex;align-items:center;justify-content:center;min-height:100vh">
<div id="pencil-viewer"></div>
<script>
if(window.PencilViewer && window.EMBEDDED_PEN){
  PencilViewer.init({ container:'#pencil-viewer', pen:window.EMBEDDED_PEN });
}
<\/script>
</body>
</html>`;
}

// ─── MAIN ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing SLATE...\n');

  // 1. Hero
  const heroHtml = buildHeroHTML();
  const heroRes  = await zenPost(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero   → ${heroRes.status === 200 ? '✓' : '✗'} ram.zenbin.org/${SLUG} (${heroRes.status})`);

  // 2. Viewer
  const viewerHtml = buildViewerHTML();
  const viewerRes  = await zenPost(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`Viewer → ${viewerRes.status === 200 ? '✓' : '✗'} ram.zenbin.org/${SLUG}-viewer (${viewerRes.status})`);

  // 3. GitHub queue
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`Queue  → ${putRes.status === 200 ? '✓' : '✗'} GitHub queue updated (${putRes.status})`);

  console.log('\nDone!');
  return newEntry;
}

main().catch(console.error);
