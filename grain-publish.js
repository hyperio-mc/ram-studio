// grain-publish.js
// GRAIN — know what you wear
// Hero page + gallery update

import fs from 'fs';
import https from 'https';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config  = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const GITHUB_TOKEN    = config.GITHUB_TOKEN;
const GALLERY_OWNER   = 'rnbwpnt';
const GALLERY_REPO    = 'ram';
const GALLERY_PATH    = 'gallery-queue.json';

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GRAIN — know what you wear</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #F7F5F1;
    --surface: #FFFFFF;
    --linen:   #EDE9E2;
    --border:  #DDD8CF;
    --text:    #1C1916;
    --muted:   #8A8178;
    --sage:    #5E8A66;
    --terra:   #C4763A;
    --sky:     #5B7FA6;
    --cream:   #F0EBE1;
  }

  html { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }

  body { min-height: 100vh; }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 64px;
    background: rgba(247,245,241,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: 'Playfair Display', serif; font-size: 22px; letter-spacing: 0.18em;
    color: var(--text); text-decoration: none;
  }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; letter-spacing: 0.06em; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    font-size: 13px; font-weight: 500; letter-spacing: 0.06em;
    padding: 8px 20px; border-radius: 24px;
    background: var(--sage); color: #fff; text-decoration: none;
    transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── HERO ── */
  .hero {
    padding: 160px 48px 96px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
    max-width: 1280px; margin: 0 auto;
  }
  .hero-tag {
    display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--sage);
    border: 1px solid var(--sage); padding: 5px 12px; border-radius: 20px;
    margin-bottom: 28px;
  }
  .hero-title {
    font-family: 'Playfair Display', serif; font-size: 64px; line-height: 1.1;
    color: var(--text); margin-bottom: 24px;
  }
  .hero-title em { font-style: italic; color: var(--terra); }
  .hero-sub {
    font-size: 18px; line-height: 1.7; color: var(--muted);
    max-width: 440px; margin-bottom: 40px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    font-size: 14px; font-weight: 500; letter-spacing: 0.06em;
    padding: 14px 32px; border-radius: 32px;
    background: var(--sage); color: #fff; text-decoration: none;
    transition: transform 0.2s, opacity 0.2s;
  }
  .btn-primary:hover { transform: translateY(-1px); opacity: 0.9; }
  .btn-ghost {
    font-size: 14px; color: var(--muted); text-decoration: none;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { color: var(--text); }

  /* ── PHONE MOCKUP ── */
  .hero-visual { display: flex; justify-content: center; }
  .phone {
    width: 280px; height: 580px; border-radius: 40px;
    background: var(--surface); border: 1px solid var(--border);
    box-shadow: 0 32px 80px rgba(28,25,22,0.12), 0 4px 16px rgba(28,25,22,0.06);
    overflow: hidden; position: relative; padding: 0;
  }
  .phone-screen {
    width: 100%; height: 100%; background: var(--bg);
    display: flex; flex-direction: column;
  }
  .ps-bar {
    height: 44px; background: var(--surface); display: flex; align-items: center;
    padding: 0 16px; border-bottom: 1px solid var(--border);
    font-family: 'Playfair Display', serif; font-size: 15px; letter-spacing: 0.06em;
  }
  .ps-bar .back { color: var(--muted); font-size: 11px; font-family: 'Inter', sans-serif; margin-right: 8px; }
  .ps-garment-header {
    background: var(--surface); padding: 16px;
    display: flex; align-items: flex-start; gap: 12px; border-bottom: 1px solid var(--border);
  }
  .ps-swatch {
    width: 52px; height: 68px; border-radius: 8px;
    background: linear-gradient(135deg, #C9B99A 0%, #A89070 100%);
    flex-shrink: 0;
  }
  .ps-info { flex: 1; padding-top: 2px; }
  .ps-brand { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
  .ps-name { font-family: 'Playfair Display', serif; font-size: 14px; color: var(--text); margin: 2px 0 6px; }
  .ps-score {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 500; color: var(--sage);
    background: rgba(94,138,102,0.1); padding: 3px 8px; border-radius: 10px;
  }
  .ps-section { padding: 14px 16px; border-bottom: 1px solid var(--border); }
  .ps-section-label {
    font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 10px;
  }
  .ps-bar-row { margin-bottom: 8px; }
  .ps-bar-meta { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .ps-bar-name { font-size: 10px; color: var(--text); }
  .ps-bar-pct { font-size: 10px; color: var(--muted); }
  .ps-bar-track { height: 4px; background: var(--linen); border-radius: 2px; }
  .ps-bar-fill { height: 4px; border-radius: 2px; }
  .ps-care { display: flex; gap: 8px; flex-wrap: wrap; }
  .ps-care-chip {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    width: 44px; height: 44px; border-radius: 8px;
    background: var(--linen); justify-content: center;
    font-size: 14px;
  }
  .ps-care-chip span { font-size: 8px; color: var(--muted); }
  .ps-nav {
    margin-top: auto; height: 60px; background: var(--surface);
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-around;
    padding: 0 8px;
  }
  .ps-nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    font-size: 8px; color: var(--muted); padding: 6px 8px; border-radius: 8px;
  }
  .ps-nav-item.active { color: var(--sage); background: rgba(94,138,102,0.1); }
  .ps-nav-icon { font-size: 16px; line-height: 1; }

  /* ── STATS BAR ── */
  .stats {
    background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 40px 48px;
  }
  .stats-inner {
    max-width: 1280px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;
  }
  .stat-item { display: flex; flex-direction: column; gap: 6px; }
  .stat-n {
    font-family: 'Playfair Display', serif; font-size: 40px;
    color: var(--text); line-height: 1;
  }
  .stat-n em { font-style: italic; color: var(--terra); }
  .stat-label { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* ── FEATURES ── */
  .features { padding: 96px 48px; max-width: 1280px; margin: 0 auto; }
  .features-label {
    font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--terra); margin-bottom: 16px;
  }
  .features-title {
    font-family: 'Playfair Display', serif; font-size: 44px; line-height: 1.2;
    margin-bottom: 64px; max-width: 600px; color: var(--text);
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
    background: var(--border); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .feature-card {
    background: var(--surface); padding: 40px 32px;
  }
  .feat-icon {
    width: 48px; height: 48px; border-radius: 12px; margin-bottom: 24px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .feat-icon.sage { background: rgba(94,138,102,0.12); }
  .feat-icon.terra { background: rgba(196,118,58,0.12); }
  .feat-icon.sky { background: rgba(91,127,166,0.12); }
  .feat-title {
    font-family: 'Playfair Display', serif; font-size: 20px;
    margin-bottom: 10px; color: var(--text);
  }
  .feat-desc { font-size: 14px; line-height: 1.7; color: var(--muted); }

  /* ── EDITORIAL ── */
  .editorial {
    background: var(--linen); padding: 96px 48px;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  }
  .ed-inner { max-width: 1280px; margin: 0 auto; }
  .ed-label {
    font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 48px;
  }
  .ed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .ed-quote {
    font-family: 'Playfair Display', serif; font-size: 32px; line-height: 1.4;
    color: var(--text); font-style: italic;
  }
  .ed-quote cite {
    display: block; margin-top: 24px; font-size: 13px; font-style: normal;
    color: var(--muted); letter-spacing: 0.06em;
  }
  .ed-facts { display: flex; flex-direction: column; gap: 24px; }
  .ed-fact {
    padding: 24px; background: var(--surface); border-radius: 12px;
    border: 1px solid var(--border);
  }
  .ed-fact-n {
    font-family: 'Playfair Display', serif; font-size: 32px;
    color: var(--terra); margin-bottom: 6px;
  }
  .ed-fact-text { font-size: 14px; line-height: 1.6; color: var(--muted); }

  /* ── CTA ── */
  .cta-section {
    padding: 120px 48px; text-align: center;
    max-width: 800px; margin: 0 auto;
  }
  .cta-title {
    font-family: 'Playfair Display', serif; font-size: 52px; line-height: 1.15;
    color: var(--text); margin-bottom: 20px;
  }
  .cta-sub { font-size: 17px; color: var(--muted); line-height: 1.7; margin-bottom: 40px; }
  .cta-btns { display: flex; gap: 16px; justify-content: center; }

  /* ── FOOTER ── */
  footer {
    padding: 40px 48px; border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    max-width: 100%; background: var(--surface);
  }
  .footer-logo {
    font-family: 'Playfair Display', serif; font-size: 16px; letter-spacing: 0.14em;
    color: var(--text);
  }
  .footer-note { font-size: 12px; color: var(--muted); }
  .footer-tag {
    font-size: 11px; letter-spacing: 0.1em; color: var(--sage);
    padding: 5px 12px; border: 1px solid var(--sage); border-radius: 20px;
  }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 120px 24px 64px; }
    .hero-visual { display: none; }
    .stats-inner { grid-template-columns: 1fr 1fr; }
    .features-grid { grid-template-columns: 1fr; }
    .ed-grid { grid-template-columns: 1fr; }
    nav { padding: 0 24px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">GRAIN</a>
  <ul class="nav-links">
    <li><a href="#">Closet</a></li>
    <li><a href="#">Materials</a></li>
    <li><a href="#">Impact</a></li>
    <li><a href="#">Learn</a></li>
  </ul>
  <a class="nav-cta" href="#">Join Waitlist</a>
</nav>

<section class="hero">
  <div class="hero-copy">
    <span class="hero-tag">Fabric Transparency</span>
    <h1 class="hero-title">Know what<br>you <em>wear</em></h1>
    <p class="hero-sub">
      Scan the label. Understand the fabric. See how your closet adds up —
      fibre by fibre, wash by wash, year by year.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="#">Join the Waitlist</a>
      <a class="btn-ghost" href="#">See how it works →</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone">
      <div class="phone-screen">
        <div class="ps-bar">
          <span class="back">‹</span> Item Detail
        </div>
        <div class="ps-garment-header">
          <div class="ps-swatch"></div>
          <div class="ps-info">
            <div class="ps-brand">EVERLANE</div>
            <div class="ps-name">Linen Chore Coat</div>
            <div class="ps-score">🌿 84 / 100</div>
          </div>
        </div>
        <div class="ps-section">
          <div class="ps-section-label">Composition</div>
          <div class="ps-bar-row">
            <div class="ps-bar-meta">
              <span class="ps-bar-name">Linen (Flax)</span>
              <span class="ps-bar-pct">72%</span>
            </div>
            <div class="ps-bar-track">
              <div class="ps-bar-fill" style="width:72%; background:#5E8A66;"></div>
            </div>
          </div>
          <div class="ps-bar-row">
            <div class="ps-bar-meta">
              <span class="ps-bar-name">Cotton (Organic)</span>
              <span class="ps-bar-pct">22%</span>
            </div>
            <div class="ps-bar-track">
              <div class="ps-bar-fill" style="width:22%; background:#5B7FA6;"></div>
            </div>
          </div>
          <div class="ps-bar-row">
            <div class="ps-bar-meta">
              <span class="ps-bar-name">Elastane</span>
              <span class="ps-bar-pct">6%</span>
            </div>
            <div class="ps-bar-track">
              <div class="ps-bar-fill" style="width:6%; background:#C4763A;"></div>
            </div>
          </div>
        </div>
        <div class="ps-section">
          <div class="ps-section-label">Care</div>
          <div class="ps-care">
            <div class="ps-care-chip">🫧<span>30°</span></div>
            <div class="ps-care-chip">🚫🌀<span>no dry</span></div>
            <div class="ps-care-chip">🪨<span>iron lo</span></div>
            <div class="ps-care-chip">♻️<span>recycle</span></div>
          </div>
        </div>
        <div class="ps-nav">
          <div class="ps-nav-item"><span class="ps-nav-icon">👔</span>Closet</div>
          <div class="ps-nav-item active"><span class="ps-nav-icon">🔍</span>Detail</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">🌿</span>Impact</div>
          <div class="ps-nav-item"><span class="ps-nav-icon">📷</span>Scan</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="stats" style="background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border);">
  <div class="stats-inner">
    <div class="stat-item">
      <div class="stat-n">68<em>%</em></div>
      <div class="stat-label">of consumers don't know their garment's fibre content</div>
    </div>
    <div class="stat-item">
      <div class="stat-n">60<em>b</em></div>
      <div class="stat-label">garments produced globally each year — doubling since 2000</div>
    </div>
    <div class="stat-item">
      <div class="stat-n">3<em>×</em></div>
      <div class="stat-label">longer a garment lasts when care instructions are followed</div>
    </div>
    <div class="stat-item">
      <div class="stat-n">92<em>m</em></div>
      <div class="stat-label">tonnes of textile waste generated annually worldwide</div>
    </div>
  </div>
</section>

<section class="features">
  <div class="features-label">What GRAIN does</div>
  <h2 class="features-title">Transparency, at the fibre level</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feat-icon sage">🌿</div>
      <div class="feat-title">Composition Scan</div>
      <p class="feat-desc">Photograph or manually enter any care label. GRAIN decodes fibre percentages, certifications, and country of origin into clear, actionable information.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon terra">♻️</div>
      <div class="feat-title">Eco Impact Score</div>
      <p class="feat-desc">Each fabric blend gets a 0–100 score based on water usage, biodegradability, carbon footprint, and recyclability. See your full closet's footprint at a glance.</p>
    </div>
    <div class="feature-card">
      <div class="feat-icon sky">📚</div>
      <div class="feat-title">Material Library</div>
      <p class="feat-desc">From merino wool to Tencel to recycled nylon — browse 80+ fabrics with full ecological profiles, care guides, and end-of-life options.</p>
    </div>
  </div>
</section>

<section class="editorial">
  <div class="ed-inner">
    <div class="ed-label">Why it matters</div>
    <div class="ed-grid">
      <blockquote class="ed-quote">
        "The most sustainable garment is the one you already own —
        if you know how to care for it."
        <cite>— GRAIN Design Principle</cite>
      </blockquote>
      <div class="ed-facts">
        <div class="ed-fact">
          <div class="ed-fact-n">35%</div>
          <div class="ed-fact-text">of microplastics in the ocean come from synthetic textile washing. GRAIN flags microplastic-shedding fabrics and suggests washing bags.</div>
        </div>
        <div class="ed-fact">
          <div class="ed-fact-n">2,700 L</div>
          <div class="ed-fact-text">of water to grow cotton for a single T-shirt. Knowing your fabric mix helps you choose better, wash less, and waste nothing.</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2 class="cta-title">Your closet,<br>fully understood.</h2>
  <p class="cta-sub">Join the waitlist. Be first to know when GRAIN opens — early users get full access free for 6 months.</p>
  <div class="cta-btns">
    <a class="btn-primary" href="#">Join the Waitlist</a>
    <a class="btn-ghost" href="#">Learn about materials →</a>
  </div>
</section>

<footer>
  <div class="footer-logo">GRAIN</div>
  <div class="footer-note">A RAM design concept — March 2026</div>
  <div class="footer-tag">light theme</div>
</footer>

</body>
</html>`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function httpsRequest(url, opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ─── SAVE LOCALLY ────────────────────────────────────────────────────────────
fs.writeFileSync('grain-hero.html', hero);
console.log('✓ Saved grain-hero.html locally');

// ─── ZENBIN PUBLISH ──────────────────────────────────────────────────────────
async function publishHero() {
  const body = Buffer.from(JSON.stringify({ html: hero }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/v1/pages/grain?overwrite=true',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── GALLERY UPDATE ──────────────────────────────────────────────────────────
async function updateGallery() {
  const apiBase = `https://api.github.com/repos/${GALLERY_OWNER}/${GALLERY_REPO}/contents/${GALLERY_PATH}`;
  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ram-design-bot',
  };

  // GET current
  const getRes = await httpsRequest(apiBase, { method: 'GET', headers });
  const getJson = JSON.parse(getRes.body);
  const sha = getJson.sha;
  const current = JSON.parse(Buffer.from(getJson.content, 'base64').toString('utf8'));

  // Remove any existing GRAIN entries
  current.submissions = current.submissions.filter(s => s.app_name !== 'grain');

  // Append new entry
  const entry = {
    app_name:    'grain',
    title:       'GRAIN',
    tagline:     'know what you wear',
    description: 'Fabric transparency app for conscious fashion — scan labels, understand fibre composition, track eco impact across your full closet.',
    category:    'fashion-tech',
    theme:       'light',
    palette:     ['#F7F5F1', '#5E8A66', '#C4763A', '#5B7FA6', '#1C1916'],
    hero_url:    'https://ram.zenbin.org/grain',
    mock_url:    'https://ram.zenbin.org/grain-mock',
    pen_path:    'grain.pen',
    screens:     5,
    inspiration: 'How It Wears (land-book), editorial light mode, conscious fashion',
    submitted_at: new Date().toISOString(),
  };
  current.submissions.push(entry);
  current.updated_at = new Date().toISOString();

  // PUT back
  const encoded = Buffer.from(JSON.stringify(current, null, 2)).toString('base64');
  const putPayload = JSON.stringify({
    message: 'feat: add GRAIN to gallery queue',
    content: encoded,
    sha,
  });
  const putRes = await httpsRequest(apiBase, {
    method: 'PUT',
    headers: { ...headers, 'Content-Length': Buffer.byteLength(putPayload) }
  }, putPayload);

  return { status: putRes.status, total: current.submissions.length };
}

// ─── RUN ─────────────────────────────────────────────────────────────────────
try {
  console.log('📤 Publishing GRAIN hero to ZenBin...');
  const res = await publishHero();
  if (res.status === 200 || res.status === 201) {
    console.log(`✓ Hero live at: https://ram.zenbin.org/grain`);
  } else {
    console.log(`✗ ZenBin returned ${res.status}: ${res.body.slice(0, 120)}`);
    console.log('  grain-hero.html saved locally — will publish when quota resets Apr 23');
  }
} catch (e) {
  console.log('✗ ZenBin error:', e.message);
}

try {
  console.log('📚 Updating gallery...');
  const { status, total } = await updateGallery();
  if (status === 200 || status === 201) {
    console.log(`✓ Gallery updated — ${total} total entries`);
  } else {
    console.log(`✗ Gallery update returned HTTP ${status}`);
  }
} catch (e) {
  console.log('✗ Gallery error:', e.message);
}
