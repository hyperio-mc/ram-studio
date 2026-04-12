// onyx-publish.js — ONYX: Rare Spirits, Collected.
// Full design pipeline: hero page + viewer + gallery queue

const https = require('https');
const fs    = require('fs');

const SLUG      = 'onyx';
const APP_NAME  = 'ONYX';
const TAGLINE   = 'Rare spirits, collected.';
const ARCHETYPE = 'spirits-discovery';
const ZENBIN_SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT  = 'Dark luxury craft spirits discovery + collection vault app. Inspired by Atlas Card (Godly.website) luxury dark concierge aesthetic: pure black background, "Sequel Sans Book" refined typography; Darkroom.au (DarkModeDesign): #0f0f0f ultra-dark product photography, Swiss "Suisseintl Webs" typography; Fluid Glass nominee (Awwwards): glass panels on dark. Amber/gold #C9873A accent on near-black #09090A. Six screens: editorial Discover feed with curated bottles, Bottle Detail with flavor bars, Cellar vault with portfolio tracking, Market intelligence with price chart + live auctions, Tasting Log with flavor intensity bars and personal notes, Profile membership card (Atlas Card-inspired).';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug + '?overwrite=true',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': ZENBIN_SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

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

// ── a) Hero Page ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ONYX — Rare Spirits, Collected.</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #09090A;
    --surf:    #111113;
    --surf2:   #1A1A1D;
    --surf3:   #222227;
    --amber:   #C9873A;
    --amber2:  #E8AA5A;
    --cream:   #F0E6D0;
    --muted:   rgba(240,230,208,0.45);
    --dim:     rgba(240,230,208,0.18);
    --glass:   rgba(201,135,58,0.08);
    --border:  rgba(201,135,58,0.15);
  }
  html { scroll-behavior: smooth; background: var(--bg); color: var(--cream); }
  body { font-family: 'Georgia', 'Times New Roman', serif; background: var(--bg); min-height: 100vh; }

  /* HERO */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 40px 24px;
    text-align: center;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% 30%, rgba(201,135,58,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 11px; letter-spacing: 3px;
    color: var(--amber); font-weight: 500;
    margin-bottom: 24px; text-transform: uppercase;
  }
  .hero-title {
    font-size: clamp(64px, 15vw, 140px);
    letter-spacing: 12px;
    font-weight: 400;
    line-height: 1;
    color: var(--cream);
    margin-bottom: 20px;
  }
  .hero-tagline {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: clamp(16px, 3vw, 22px);
    color: var(--muted);
    font-weight: 300;
    letter-spacing: 1px;
    margin-bottom: 48px;
    font-style: italic;
  }
  .hero-cta {
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
  }
  .btn-primary {
    background: var(--amber);
    color: var(--bg);
    border: none; border-radius: 28px;
    padding: 14px 36px;
    font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 600;
    letter-spacing: 1px; text-decoration: none;
    cursor: pointer; transition: opacity .2s;
  }
  .btn-primary:hover { opacity: .85; }
  .btn-secondary {
    background: transparent;
    color: var(--cream);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 14px 36px;
    font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 400;
    letter-spacing: 1px; text-decoration: none;
    cursor: pointer; transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: var(--amber); }

  /* BOTTLE SILHOUETTES DECORATION */
  .bottles-deco {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 400px;
    display: flex; align-items: flex-end;
    justify-content: center; gap: 20px;
    pointer-events: none; opacity: 0.15;
  }
  .bottle-deco {
    width: 40px;
    background: linear-gradient(180deg, var(--amber) 0%, transparent 100%);
    border-radius: 6px 6px 2px 2px;
  }

  /* SECTIONS */
  .section { padding: 100px 24px; max-width: 1100px; margin: 0 auto; }
  .section-label {
    font-family: 'Inter', sans-serif;
    font-size: 10px; letter-spacing: 3px;
    color: var(--amber); text-transform: uppercase;
    margin-bottom: 16px; font-weight: 500;
  }
  .section-title {
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 400; line-height: 1.15;
    color: var(--cream); margin-bottom: 24px;
  }
  .section-sub {
    font-family: 'Inter', sans-serif;
    font-size: 16px; color: var(--muted);
    line-height: 1.7; max-width: 560px;
  }

  /* FEATURE CARDS */
  .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 60px; }
  .feat-card {
    background: var(--surf2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 36px 30px;
    transition: border-color .2s, transform .2s;
  }
  .feat-card:hover { border-color: var(--amber); transform: translateY(-4px); }
  .feat-icon {
    font-size: 28px; margin-bottom: 20px;
    display: block;
  }
  .feat-title {
    font-size: 20px; font-weight: 400;
    color: var(--cream); margin-bottom: 10px;
  }
  .feat-desc {
    font-family: 'Inter', sans-serif;
    font-size: 14px; color: var(--muted); line-height: 1.7;
  }

  /* SCREENS PREVIEW */
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 60px;
  }
  @media (max-width: 700px) { .screens-grid { grid-template-columns: repeat(2, 1fr); } }
  .screen-card {
    background: var(--surf2);
    border: 1px solid var(--border);
    border-radius: 12px;
    aspect-ratio: 9/16;
    overflow: hidden;
    position: relative;
    transition: transform .2s, border-color .2s;
  }
  .screen-card:hover { transform: scale(1.02); border-color: var(--amber); }
  .screen-card-inner {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    padding: 16px 12px;
  }
  .sc-label {
    font-family: 'Inter', sans-serif;
    font-size: 8px; letter-spacing: 2px;
    color: var(--amber); text-transform: uppercase;
    margin-bottom: 8px;
  }
  .sc-title {
    font-size: 14px; color: var(--cream); font-weight: 400;
    margin-bottom: 12px;
  }
  .sc-bottle {
    margin: 0 auto;
    width: 28px;
    border-radius: 6px 6px 2px 2px;
    background: linear-gradient(180deg, var(--glass) 0%, rgba(201,135,58,0.2) 100%);
    border: 1px solid rgba(201,135,58,0.25);
  }
  .sc-bar { height: 6px; border-radius: 3px; margin-bottom: 6px; }
  .sc-row { display: flex; gap: 6px; margin-bottom: 6px; }
  .sc-chip {
    height: 20px; border-radius: 4px;
    background: var(--surf3);
    flex: 1;
  }
  .sc-stat {
    text-align: center; margin-bottom: 10px;
    font-size: 18px; font-weight: 400;
    color: var(--cream);
  }
  .sc-stat-label {
    font-family: 'Inter', sans-serif;
    font-size: 7px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase;
  }

  /* PALETTE SHOWCASE */
  .palette { display: flex; gap: 12px; margin-top: 40px; flex-wrap: wrap; }
  .swatch {
    width: 80px; height: 80px; border-radius: 12px;
    position: relative;
  }
  .swatch-label {
    position: absolute; bottom: -22px; left: 0; right: 0;
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-size: 9px; color: var(--muted);
    white-space: nowrap;
  }

  /* QUOTE */
  .quote-block {
    background: var(--surf);
    border-left: 3px solid var(--amber);
    border-radius: 0 12px 12px 0;
    padding: 32px 36px;
    margin: 60px 0;
  }
  .quote-text {
    font-size: clamp(18px, 3vw, 28px);
    color: var(--cream);
    line-height: 1.5; font-style: italic;
    margin-bottom: 16px;
  }
  .quote-attr {
    font-family: 'Inter', sans-serif;
    font-size: 12px; color: var(--amber);
    letter-spacing: 1.5px; text-transform: uppercase;
  }

  /* INSPIRATION NOTES */
  .inspo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 40px; }
  .inspo-card {
    background: var(--surf);
    border: 1px solid var(--dim);
    border-radius: 12px; padding: 24px;
  }
  .inspo-source {
    font-family: 'Inter', sans-serif;
    font-size: 9px; letter-spacing: 2px;
    color: var(--amber); text-transform: uppercase;
    margin-bottom: 8px;
  }
  .inspo-desc {
    font-family: 'Inter', sans-serif;
    font-size: 13px; color: var(--muted); line-height: 1.6;
  }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px 24px;
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-size: 12px; color: var(--muted);
    letter-spacing: 0.5px;
  }
  footer a { color: var(--amber); text-decoration: none; }
</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">◈ RAM Design Heartbeat · Spirits Discovery · Dark Theme</div>
  <h1 class="hero-title">ONYX</h1>
  <p class="hero-tagline">Rare spirits, collected.</p>
  <div class="hero-cta">
    <a href="https://ram.zenbin.org/onyx-viewer" class="btn-primary">View Design ↗</a>
    <a href="https://ram.zenbin.org/onyx-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
  <!-- Decorative bottles -->
  <div class="bottles-deco">
    <div class="bottle-deco" style="height:220px"></div>
    <div class="bottle-deco" style="height:310px"></div>
    <div class="bottle-deco" style="height:260px;margin-bottom:20px"></div>
    <div class="bottle-deco" style="height:340px"></div>
    <div class="bottle-deco" style="height:280px"></div>
    <div class="bottle-deco" style="height:200px;margin-bottom:40px"></div>
    <div class="bottle-deco" style="height:320px"></div>
  </div>
</section>

<!-- ABOUT -->
<div class="section">
  <p class="section-label">◈ The Concept</p>
  <h2 class="section-title">A vault for the serious collector.</h2>
  <p class="section-sub">ONYX brings the editorial luxury of a private members' club to your spirits collection. Discover rare bottles, track your cellar's value, log tasting notes, and monitor live auction markets — all in a dark, cinematic interface built for connoisseurs.</p>

  <div class="quote-block">
    <p class="quote-text">"The finest spirits deserve the finest platform. ONYX treats every bottle as the investment — and experience — it truly is."</p>
    <p class="quote-attr">◈ Design Philosophy</p>
  </div>

  <div class="features">
    <div class="feat-card">
      <span class="feat-icon">◈</span>
      <h3 class="feat-title">Curated Discovery</h3>
      <p class="feat-desc">Editorial-quality curation of rare and limited releases, with expert scoring and regional provenance data — like having a master sommelier in your pocket.</p>
    </div>
    <div class="feat-card">
      <span class="feat-icon">▣</span>
      <h3 class="feat-title">Cellar Intelligence</h3>
      <p class="feat-desc">Track every bottle in your collection with live market valuations. Watch your portfolio grow with real-time price intelligence from global auction markets.</p>
    </div>
    <div class="feat-card">
      <span class="feat-icon">◎</span>
      <h3 class="feat-title">Market Radar</h3>
      <p class="feat-desc">12-month price charts, live auction feeds, and trending bottle alerts. Be the first to spot rising stars before they become impossible to find.</p>
    </div>
    <div class="feat-card">
      <span class="feat-icon">✦</span>
      <h3 class="feat-title">Tasting Journals</h3>
      <p class="feat-desc">Log nose, palate, and finish notes with flavor intensity profiling. Build a personal tasting archive that grows richer with every dram.</p>
    </div>
  </div>
</div>

<!-- SCREENS -->
<div class="section">
  <p class="section-label">◈ Six Screens</p>
  <h2 class="section-title">The full experience.</h2>
  <p class="section-sub">Six carefully designed screens that take you from discovery to collection, market intelligence to tasting ritual.</p>

  <div class="screens-grid">
    <!-- Discover -->
    <div class="screen-card">
      <div class="screen-card-inner" style="background:linear-gradient(180deg,#111113 0%,#09090A 100%)">
        <div class="sc-label">Discover</div>
        <div style="background:rgba(201,135,58,0.1);border-radius:8px;height:80px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;">
          <div class="sc-bottle" style="height:70px"></div>
        </div>
        <div class="sc-chip" style="width:60%;height:16px;background:rgba(201,135,58,0.7);margin-bottom:8px"></div>
        <div class="sc-row">
          <div style="background:var(--surf3);border-radius:6px;height:50px;flex:1;"></div>
          <div style="background:var(--surf3);border-radius:6px;height:50px;flex:1;"></div>
          <div style="background:var(--surf3);border-radius:6px;height:50px;flex:1;"></div>
        </div>
        <div class="sc-chip" style="height:28px;margin-top:6px;background:var(--surf);border:1px solid rgba(201,135,58,0.2)"></div>
      </div>
    </div>
    <!-- Bottle Detail -->
    <div class="screen-card">
      <div class="screen-card-inner" style="background:linear-gradient(180deg,#1A1A1D 0%,#09090A 40%)">
        <div class="sc-label">Detail</div>
        <div style="display:flex;justify-content:center;margin-bottom:8px">
          <div class="sc-bottle" style="height:90px;width:22px"></div>
        </div>
        <div class="sc-title">Balvenie 21</div>
        <div class="sc-row">
          <div class="sc-chip" style="height:28px"></div>
          <div class="sc-chip" style="height:28px"></div>
          <div class="sc-chip" style="height:28px"></div>
          <div class="sc-chip" style="height:28px"></div>
        </div>
        <div class="sc-bar" style="background:rgba(201,135,58,0.7);width:88%"></div>
        <div class="sc-bar" style="background:rgba(201,135,58,0.5);width:72%"></div>
        <div class="sc-bar" style="background:rgba(201,135,58,0.6);width:80%"></div>
      </div>
    </div>
    <!-- Cellar -->
    <div class="screen-card">
      <div class="screen-card-inner">
        <div class="sc-label">Cellar</div>
        <div class="sc-chip" style="height:52px;background:var(--surf3);margin-bottom:8px;display:flex;align-items:center;padding:0 12px">
          <span style="font-size:11px;color:var(--cream)">£ 12,480</span>
        </div>
        <div class="sc-row">
          <div style="background:var(--surf3);border-radius:6px;flex:1;height:60px"></div>
          <div style="background:var(--surf3);border-radius:6px;flex:1;height:60px"></div>
        </div>
        <div class="sc-row">
          <div style="background:var(--surf3);border-radius:6px;flex:1;height:60px"></div>
          <div style="background:var(--surf3);border-radius:6px;flex:1;height:60px"></div>
        </div>
      </div>
    </div>
    <!-- Market -->
    <div class="screen-card">
      <div class="screen-card-inner">
        <div class="sc-label">Market</div>
        <div class="sc-chip" style="height:80px;background:var(--surf3);margin-bottom:8px;display:flex;align-items:flex-end;padding:8px;gap:2px">
          ${[45,50,42,55,60,58,65,70,68,72,80,85].map((v,i,a) =>
            `<div style="flex:1;height:${v}%;background:rgba(201,135,58,${i===a.length-1?'0.9':'0.4'});border-radius:2px 2px 0 0"></div>`
          ).join('')}
        </div>
        <div class="sc-chip" style="height:36px;margin-bottom:4px"></div>
        <div class="sc-chip" style="height:36px;margin-bottom:4px"></div>
        <div class="sc-chip" style="height:36px"></div>
      </div>
    </div>
    <!-- Tasting -->
    <div class="screen-card">
      <div class="screen-card-inner">
        <div class="sc-label">Tasting</div>
        <div class="sc-title">Lagavulin 16</div>
        <div style="color:var(--amber);font-size:10px;margin-bottom:8px">★★★★☆</div>
        <div class="sc-row">
          <div class="sc-chip" style="height:50px"></div>
          <div class="sc-chip" style="height:50px"></div>
          <div class="sc-chip" style="height:50px"></div>
        </div>
        <div class="sc-bar" style="background:rgba(201,135,58,0.9);width:95%;margin-top:6px"></div>
        <div class="sc-bar" style="background:rgba(201,135,58,0.45);width:45%"></div>
        <div class="sc-bar" style="background:rgba(201,135,58,0.88);width:88%"></div>
      </div>
    </div>
    <!-- Profile -->
    <div class="screen-card">
      <div class="screen-card-inner">
        <div class="sc-label">Profile</div>
        <div class="sc-chip" style="height:64px;background:var(--surf3);margin-bottom:8px;border:1px solid rgba(201,135,58,0.25);display:flex;align-items:center;padding:0 12px">
          <span style="font-size:9px;color:var(--amber);letter-spacing:2px">◈ ONYX RESERVE</span>
        </div>
        <div class="sc-row">
          <div class="sc-chip" style="height:44px"></div>
          <div class="sc-chip" style="height:44px"></div>
        </div>
        <div class="sc-row">
          <div class="sc-chip" style="height:44px"></div>
          <div class="sc-chip" style="height:44px"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- DESIGN DECISIONS -->
<div class="section">
  <p class="section-label">◈ Design Decisions</p>
  <h2 class="section-title">Built from observation.</h2>

  <div class="inspo-grid">
    <div class="inspo-card">
      <div class="inspo-source">Godly.website → Atlas Card</div>
      <p class="inspo-desc">Pure black backgrounds (#09090A) with cream typography and amber accents — translating Atlas Card's luxury membership aesthetic into a spirits context. "Sequel Sans Book" refinement via Georgia serifs on body type.</p>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">DarkModeDesign → Darkroom.au</div>
      <p class="inspo-desc">Ultra-dark product-first layout language. Darkroom uses #0F0F0F and Swiss "Suisseintl Webs" for maximum contrast with product imagery. ONYX borrows this restraint — dark bg, isolated subjects, no decoration for its own sake.</p>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Awwwards → Fluid Glass</div>
      <p class="inspo-desc">The "Fluid Glass" nominee introduced glass-amber panels as UI elements. ONYX uses rgba(201,135,58,0.08) glass tints to simulate bottle translucency and depth — glassmorphism applied meaningfully to product silhouettes.</p>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">Design Decision</div>
      <p class="inspo-desc">Editorial serif typography (Georgia) for brand headlines and large numerals — treating scores, ages, and prices as editorial data. Small-caps tracking (letterSpacing: 2-3px) for category labels, inspired by luxury print magazine conventions.</p>
    </div>
  </div>

  <!-- Palette -->
  <div style="margin-top: 60px">
    <p class="section-label">◈ Palette</p>
    <div class="palette" style="margin-bottom: 40px">
      <div style="position:relative">
        <div class="swatch" style="background:#09090A;border:1px solid #333"></div>
        <div class="swatch-label">#09090A · BG</div>
      </div>
      <div style="position:relative">
        <div class="swatch" style="background:#1A1A1D"></div>
        <div class="swatch-label">#1A1A1D · Surface</div>
      </div>
      <div style="position:relative">
        <div class="swatch" style="background:#222227"></div>
        <div class="swatch-label">#222227 · Elevated</div>
      </div>
      <div style="position:relative">
        <div class="swatch" style="background:#C9873A"></div>
        <div class="swatch-label">#C9873A · Amber</div>
      </div>
      <div style="position:relative">
        <div class="swatch" style="background:#E8AA5A"></div>
        <div class="swatch-label">#E8AA5A · Gold</div>
      </div>
      <div style="position:relative">
        <div class="swatch" style="background:#F0E6D0;border:1px solid #333"></div>
        <div class="swatch-label">#F0E6D0 · Cream</div>
      </div>
    </div>
  </div>
</div>

<!-- CTA -->
<div style="text-align:center;padding:80px 24px;border-top:1px solid var(--border)">
  <p style="font-family:'Inter',sans-serif;font-size:11px;letter-spacing:3px;color:var(--amber);text-transform:uppercase;margin-bottom:20px">◈ Explore the Design</p>
  <h2 style="font-size:clamp(32px,5vw,56px);font-weight:400;color:var(--cream);margin-bottom:32px">See it in motion.</h2>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/onyx-viewer" class="btn-primary">Open Pen Viewer ↗</a>
    <a href="https://ram.zenbin.org/onyx-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</div>

<footer>
  <p>◈ ONYX — Rare Spirits, Collected. · RAM Design Heartbeat · <a href="https://ram.zenbin.org">ram.zenbin.org</a></p>
  <p style="margin-top:8px;opacity:.6">Inspired by Atlas Card (godly.website) · Darkroom.au (darkmodedesign.com) · Fluid Glass (awwwards.com)</p>
</footer>

</body>
</html>`;

// ── b) Viewer Page ─────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/onyx.pen', 'utf8');

let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero…');
  const hr = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('  Hero:', hr.status, hr.body.slice(0, 80));

  console.log('Publishing viewer…');
  const vr = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pen Viewer`);
  console.log('  Viewer:', vr.status, vr.body.slice(0, 80));

  // ── d) Gallery queue ─────────────────────────────────────────────────────
  console.log('Updating gallery queue…');
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
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 6,
    source: 'heartbeat',
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
  console.log('  Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));

  console.log('\n✓ Hero    → https://ram.zenbin.org/' + SLUG);
  console.log('✓ Viewer  → https://ram.zenbin.org/' + SLUG + '-viewer');
  console.log('✓ Gallery queue updated');
})();
