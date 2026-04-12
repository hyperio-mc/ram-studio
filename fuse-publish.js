/**
 * FUSE — Publish pipeline
 * Hero page + viewer to ram.zenbin.org/fuse and ram.zenbin.org/fuse-viewer
 */
const fs = require('fs');
const https = require('https');

const SLUG = 'fuse';
const APP_NAME = 'FUSE';
const TAGLINE = 'Motion templates for obsessive creators';

const path = require('path');

function zenPost(slug, html, title = '', subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, url: `https://${subdomain}.zenbin.org/${slug}` }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FUSE — Motion templates for obsessive creators</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #090909;
    --surface: #111111;
    --surface2: #181818;
    --text: #F0EBE2;
    --muted: #888077;
    --lime: #CDFF47;
    --purple: #8B6EFF;
    --coral: #FF6B5B;
    --amber: #FFB84D;
    --mint: #47FFCC;
    --border: rgba(205,255,71,0.08);
    --borderDim: rgba(240,235,226,0.07);
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* NAV */
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid var(--borderDim);
    position: sticky;
    top: 0;
    background: var(--bg);
    z-index: 100;
  }
  .logo {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 3px;
    color: var(--text);
  }
  .logo span { color: var(--lime); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 13px;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--lime);
    color: var(--bg);
    padding: 10px 22px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    max-width: 1200px;
    margin: 0 auto;
    padding: 100px 40px 80px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  .hero-left {}
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(205,255,71,0.08);
    border: 1px solid rgba(205,255,71,0.2);
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 11px;
    font-weight: 700;
    color: var(--lime);
    letter-spacing: 1px;
    margin-bottom: 28px;
  }
  .eyebrow::before { content: '⚡'; }
  h1 {
    font-size: clamp(52px, 7vw, 80px);
    font-weight: 900;
    line-height: 0.92;
    letter-spacing: -3px;
    margin-bottom: 24px;
  }
  h1 em {
    color: var(--lime);
    font-style: normal;
  }
  .hero-sub {
    font-size: 17px;
    color: var(--muted);
    line-height: 1.6;
    max-width: 440px;
    margin-bottom: 40px;
  }
  .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--lime);
    color: var(--bg);
    padding: 14px 28px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-secondary {
    background: var(--surface2);
    color: var(--text);
    padding: 14px 28px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid var(--borderDim);
    transition: border-color 0.2s;
  }
  .btn-secondary:hover { border-color: rgba(240,235,226,0.2); }
  .hero-meta {
    margin-top: 36px;
    font-size: 12px;
    color: var(--muted);
    display: flex;
    gap: 24px;
    align-items: center;
  }
  .hero-meta strong { color: var(--lime); }

  /* PHONE MOCKUP */
  .hero-right {
    display: flex;
    justify-content: center;
    position: relative;
  }
  .phone-frame {
    width: 280px;
    height: 580px;
    background: var(--surface);
    border-radius: 40px;
    border: 1px solid var(--borderDim);
    overflow: hidden;
    position: relative;
    box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
  }
  .phone-screen {
    width: 100%;
    height: 100%;
    padding: 16px;
    overflow: hidden;
  }
  .phone-status {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: var(--text);
    font-weight: 600;
    margin-bottom: 12px;
    padding: 0 4px;
  }
  .phone-logo {
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 2px;
    color: var(--text);
    margin-bottom: 4px;
  }
  .phone-sub {
    font-size: 8px;
    color: var(--muted);
    margin-bottom: 10px;
  }
  .phone-pills {
    display: flex;
    gap: 5px;
    margin-bottom: 10px;
    flex-wrap: nowrap;
    overflow: hidden;
  }
  .phone-pill {
    padding: 3px 9px;
    border-radius: 9px;
    font-size: 7.5px;
    font-weight: 600;
    white-space: nowrap;
  }
  .phone-pill.active {
    background: rgba(205,255,71,0.15);
    border: 1px solid rgba(205,255,71,0.4);
    color: var(--lime);
  }
  .phone-pill.inactive {
    background: var(--surface2);
    border: 1px solid var(--borderDim);
    color: var(--muted);
  }
  .template-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .template-card {
    background: var(--surface2);
    border: 1px solid var(--borderDim);
    border-radius: 8px;
    overflow: hidden;
  }
  .template-card:nth-child(1) { grid-row: span 2; }
  .template-preview {
    background: var(--surface);
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border-bottom: 1px solid var(--borderDim);
    position: relative;
    overflow: hidden;
  }
  .template-preview::before {
    content: '';
    position: absolute;
    width: 30px; height: 30px;
    border-radius: 50%;
    background: var(--lime);
    opacity: 0.08;
    top: 12px; left: 12px;
  }
  .template-preview::after {
    content: '';
    position: absolute;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--purple);
    opacity: 0.2;
    bottom: 8px; right: 10px;
  }
  .tc-tall .template-preview { height: 120px; }
  .tc-info { padding: 6px 7px; }
  .tc-type { font-size: 7px; font-weight: 700; color: var(--lime); margin-bottom: 2px; }
  .tc-name { font-size: 9px; font-weight: 600; color: var(--text); }

  /* FEATURES SECTION */
  .features {
    max-width: 1200px;
    margin: 0 auto;
    padding: 80px 40px;
    border-top: 1px solid var(--borderDim);
  }
  .features-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--lime);
    letter-spacing: 2px;
    margin-bottom: 48px;
    text-align: center;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--borderDim);
    border-radius: 16px;
    padding: 32px;
    transition: border-color 0.2s;
  }
  .feature-card:hover { border-color: rgba(205,255,71,0.2); }
  .feature-icon {
    width: 44px; height: 44px;
    background: rgba(205,255,71,0.08);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 20px;
  }
  .feature-card h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 10px;
    color: var(--text);
  }
  .feature-card p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.65;
  }

  /* CATEGORIES */
  .categories {
    max-width: 1200px;
    margin: 0 auto;
    padding: 60px 40px;
    border-top: 1px solid var(--borderDim);
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 28px;
  }
  .section-header h2 {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .section-header a {
    font-size: 12px;
    color: var(--lime);
    text-decoration: none;
    font-weight: 600;
  }
  .category-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .cat-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface2);
    border: 1px solid var(--borderDim);
    border-radius: 12px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    text-decoration: none;
  }
  .cat-pill:hover {
    border-color: rgba(205,255,71,0.25);
    background: rgba(205,255,71,0.05);
    color: var(--lime);
  }
  .cat-count { font-size: 11px; color: var(--muted); font-weight: 400; }

  /* CTA SECTION */
  .cta-section {
    max-width: 1200px;
    margin: 40px auto 80px;
    padding: 0 40px;
  }
  .cta-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 64px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cta-box::before {
    content: '';
    position: absolute;
    top: -60px; left: 50%;
    transform: translateX(-50%);
    width: 400px; height: 200px;
    background: radial-gradient(ellipse, rgba(205,255,71,0.08) 0%, transparent 70%);
  }
  .cta-box h2 {
    font-size: 40px;
    font-weight: 900;
    letter-spacing: -1.5px;
    line-height: 1.05;
    margin-bottom: 16px;
    position: relative;
  }
  .cta-box p {
    font-size: 15px;
    color: var(--muted);
    margin-bottom: 32px;
    position: relative;
  }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--borderDim);
    padding: 32px 40px;
    text-align: center;
    font-size: 12px;
    color: var(--muted);
  }
  footer strong { color: var(--lime); }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 60px 20px; gap: 48px; }
    .hero-right { display: none; }
    h1 { font-size: 52px; }
    .features-grid { grid-template-columns: 1fr; }
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">FU<span>SE</span></div>
  <div class="nav-links">
    <a href="#">Browse</a>
    <a href="#">Categories</a>
    <a href="#">Creators</a>
    <a href="#">Pricing</a>
  </div>
  <a href="/fuse-viewer" class="nav-cta">Browse Templates →</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="eyebrow">New releases daily</div>
    <h1>Motion for<br>obsessive<br><em>creators.</em></h1>
    <p class="hero-sub">Premium Jitter, Framer, and After Effects templates built by obsessive creators. Unnecessarily precise. Unreasonably good.</p>
    <div class="hero-actions">
      <a href="/fuse-viewer" class="btn-primary">Browse Templates</a>
      <a href="/fuse-mock" class="btn-secondary">☀◑ Interactive Preview</a>
    </div>
    <div class="hero-meta">
      <span><strong>247</strong> templates</span>
      <span><strong>84</strong> creators</span>
      <span><strong>12K+</strong> downloads</span>
    </div>
  </div>
  <div class="hero-right">
    <div class="phone-frame">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>◆ ▲ ■</span></div>
        <div class="phone-logo">FUSE</div>
        <div class="phone-sub">Motion templates for obsessive creators</div>
        <div class="phone-pills">
          <span class="phone-pill active">All</span>
          <span class="phone-pill inactive">Carousel</span>
          <span class="phone-pill inactive">Stack</span>
          <span class="phone-pill inactive">Grid</span>
        </div>
        <div class="template-grid">
          <div class="template-card tc-tall">
            <div class="template-preview"></div>
            <div class="tc-info">
              <div class="tc-type">CAROUSEL</div>
              <div class="tc-name">Depth Carousel</div>
            </div>
          </div>
          <div class="template-card">
            <div class="template-preview" style="--accent: var(--purple)"></div>
            <div class="tc-info">
              <div class="tc-type" style="color: var(--purple)">STACK</div>
              <div class="tc-name">Magnetic Stack</div>
            </div>
          </div>
          <div class="template-card">
            <div class="template-preview" style="--accent: var(--coral)"></div>
            <div class="tc-info">
              <div class="tc-type" style="color: var(--coral)">SEQUENCE</div>
              <div class="tc-name">Reveal Seq.</div>
            </div>
          </div>
          <div class="template-card">
            <div class="template-preview" style="--accent: var(--mint)"></div>
            <div class="tc-info">
              <div class="tc-type" style="color: var(--mint)">GRID</div>
              <div class="tc-name">Noise Grid</div>
            </div>
          </div>
          <div class="template-card">
            <div class="template-preview" style="--accent: var(--amber)"></div>
            <div class="tc-info">
              <div class="tc-type" style="color: var(--amber)">LOOP</div>
              <div class="tc-name">Liquid Loop</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="features">
  <p class="features-label">WHY FUSE</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <h3>Obsessively Precise</h3>
      <p>Every template is built by creators who care too much. Spring physics, easing curves, frame-perfect timing. No compromises.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▦</div>
      <h3>Multi-Tool Ready</h3>
      <p>Jitter, Framer, After Effects, Rive. One purchase, all formats. Edit source files or drop-in ready builds.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <h3>Creator Community</h3>
      <p>84 independent motion designers publishing weekly. Rate, remix, and collaborate. The best templates rise naturally.</p>
    </div>
  </div>
</section>

<section class="categories">
  <div class="section-header">
    <h2>Browse by Category</h2>
    <a href="#">View all →</a>
  </div>
  <div class="category-row">
    <a class="cat-pill" href="#">Carousel <span class="cat-count">48</span></a>
    <a class="cat-pill" href="#">Stack <span class="cat-count">31</span></a>
    <a class="cat-pill" href="#">Sequence <span class="cat-count">29</span></a>
    <a class="cat-pill" href="#">Grid <span class="cat-count">42</span></a>
    <a class="cat-pill" href="#">Reveal <span class="cat-count">38</span></a>
    <a class="cat-pill" href="#">Loop <span class="cat-count">24</span></a>
    <a class="cat-pill" href="#">Scroll <span class="cat-count">19</span></a>
    <a class="cat-pill" href="#">Experiment <span class="cat-count">16</span></a>
  </div>
</section>

<section class="cta-section">
  <div class="cta-box">
    <h2>Build something<br><em style="color:var(--lime)">obsessively good.</em></h2>
    <p>Start with a template. End with a masterpiece.</p>
    <a href="/fuse-viewer" class="btn-primary">Browse 247 Templates →</a>
  </div>
</section>

<footer>
  <strong>FUSE</strong> — Motion templates for obsessive creators · RAM Design Studio · 2026
</footer>

</body>
</html>`;

// ── VIEWER PAGE ────────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'fuse.pen'), 'utf8');
const embInject = 'window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';';
const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FUSE — Design Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #090909; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: sans-serif; }
  header { width: 100%; background: #111111; border-bottom: 1px solid rgba(205,255,71,0.1); padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; }
  .hdr-brand { font-size: 18px; font-weight: 900; color: #CDFF47; letter-spacing: 4px; }
  .hdr-sub { font-size: 11px; color: rgba(240,235,226,0.4); letter-spacing: 0.5px; margin-top: 3px; }
  .hdr-link { font-size: 12px; color: #CDFF47; text-decoration: none; font-weight: 700; }
  #pencil-viewer { width: 100%; flex: 1; border: none; min-height: 600px; }
</style>
</head>
<body>
<header>
  <div><div class="hdr-brand">FUSE</div><div class="hdr-sub">Motion templates for obsessive creators</div></div>
  <a href="https://ram.zenbin.org/fuse" class="hdr-link">← Overview</a>
</header>
<script>${embInject}</script>
<script src="https://pencil.dev/viewer.js"></script>
<div id="pencil-viewer"></div>
<script>
  if (window.PencilViewer && window.EMBEDDED_PEN) {
    PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN) });
  }
</script>
</body>
</html>`;

// ── GALLERY QUEUE ─────────────────────────────────────────────────────────────
async function updateGalleryQueue() {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  function ghReq(opts, body) {
    return new Promise((resolve, reject) => {
      const r = https.request(opts, res => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      r.on('error', reject);
      if (body) r.write(body);
      r.end();
    });
  }

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });

  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: 'creative-marketplace-dark',
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: 'Dark editorial motion template marketplace. Masonry browse grid inspired by DarkModeDesign.com "108 Supply". ALL-CAPS trending screen from "Muradov". Near-black + chartreuse palette. 5 screens.',
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
    palette: '#090909,#CDFF47,#8B6EFF,#FF6B5B,#47FFCC',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
  }, putBody);

  return putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120);
}

async function run() {
  console.log('Publishing hero page...');
  const heroRes = await zenPost(SLUG, heroHtml, `FUSE — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, heroRes.url);

  console.log('Publishing viewer...');
  const viewerRes = await zenPost(`${SLUG}-viewer`, viewerHtml, 'FUSE Design Viewer');
  console.log('Viewer:', viewerRes.status, viewerRes.url);

  console.log('Updating gallery queue...');
  const queueResult = await updateGalleryQueue();
  console.log('Gallery queue:', queueResult);

  console.log('\n✓ Pipeline complete');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
}
run().catch(console.error);
