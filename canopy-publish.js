'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'canopy';
const APP_NAME  = 'CANOPY';
const TAGLINE   = 'Know your carbon. Prove your progress.';
const ARCHETYPE = 'sustainability';
const PROMPT    = 'Inspired by Relace.ai (lapa.ninja, warm cream #FAF7F0 aesthetic, large display type, amber CTA) + The Footprint Firm (siteinspire SOTD March 23 2026, sustainability advisory, editorial minimal corporate). Enterprise carbon intelligence platform for Scope 1/2/3 tracking, supplier auditing, and compliance reporting.';

// Warm ivory + forest green + terracotta
const P = {
  bg:       '#FAF8F2',
  surface:  '#F5F2EA',
  border:   '#DDD8CC',
  text:     '#1C1A14',
  muted:    'rgba(28,26,20,0.44)',
  accent:   '#1C3D2B',   // deep forest green
  accent2:  '#C25C2A',   // terracotta
  green:    '#2A6B42',
  greenLt:  '#E8F0EB',
  yellow:   '#F5A623',
  yellowLt: '#FEF5E4',
};

function zenPublish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: ${P.bg}; --surface: ${P.surface}; --border: ${P.border};
  --text: ${P.text}; --muted: ${P.muted};
  --green: ${P.accent}; --terra: ${P.accent2};
  --green-lt: ${P.greenLt}; --yellow: ${P.yellow};
}
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(250,248,242,0.88); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 64px;
}
.nav-logo { font-size: 13px; font-weight: 700; letter-spacing: 4px; color: var(--green); text-decoration: none; text-transform: uppercase; }
.nav-links { display: flex; gap: 32px; }
.nav-links a { font-size: 12px; font-weight: 500; letter-spacing: 1px; color: var(--muted); text-decoration: none; text-transform: uppercase; transition: color .2s; }
.nav-links a:hover { color: var(--text); }
.nav-cta { background: var(--green); color: var(--bg); font-size: 12px; font-weight: 700; letter-spacing: 1px; padding: 9px 22px; border-radius: 4px; text-decoration: none; text-transform: uppercase; transition: opacity .2s; }
.nav-cta:hover { opacity: .85; }

/* ── HERO ── */
.hero {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 100px 24px 72px;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--green-lt); border: 1px solid rgba(28,61,43,0.2);
  color: var(--green); font-size: 11px; font-weight: 700;
  letter-spacing: 1.5px; padding: 6px 16px; border-radius: 4px;
  margin-bottom: 40px; text-transform: uppercase;
}
.hero-eyebrow::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: blink 3s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(44px, 6.5vw, 88px);
  font-weight: 800; line-height: 1.05;
  color: var(--text); margin-bottom: 28px;
  max-width: 860px; letter-spacing: -1px;
}
h1 em { font-style: italic; color: var(--green); }

.hero-sub {
  font-size: clamp(16px, 1.8vw, 20px); color: var(--muted);
  max-width: 520px; margin: 0 auto 48px; font-weight: 400;
  line-height: 1.65;
}

.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-bottom: 64px; }
.btn-primary {
  background: var(--green); color: var(--bg);
  font-size: 14px; font-weight: 600; letter-spacing: 0.5px;
  padding: 15px 32px; border-radius: 4px; text-decoration: none;
  transition: opacity .2s, transform .2s;
}
.btn-primary:hover { opacity: .88; transform: translateY(-1px); }
.btn-ghost {
  background: transparent; color: var(--text);
  font-size: 14px; font-weight: 500;
  padding: 15px 28px; border-radius: 4px; text-decoration: none;
  border: 1.5px solid var(--border); transition: border-color .2s;
}
.btn-ghost:hover { border-color: var(--text); }

/* ── SCORE CARD (editorial hero stat — Relace.ai large-number inspired) ── */
.hero-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 32px 40px;
  display: inline-flex; align-items: flex-end; gap: 40px;
  margin-bottom: 72px; box-shadow: 0 8px 40px rgba(28,26,20,0.07);
}
.score-big {
  display: flex; flex-direction: column; align-items: flex-start;
}
.score-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; margin-bottom: 4px; }
.score-num {
  font-family: 'Playfair Display', serif; font-size: 90px; font-weight: 800;
  color: var(--green); line-height: 1; letter-spacing: -2px;
}
.score-denom { font-size: 20px; color: var(--muted); font-weight: 400; }
.score-trend {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--green-lt); color: var(--green);
  font-size: 11px; font-weight: 700; padding: 4px 10px;
  border-radius: 4px; margin-top: 10px;
}

.score-grade {
  background: var(--green); border-radius: 12px; padding: 20px 28px;
  text-align: center; min-width: 120px;
}
.grade-lbl { font-size: 9px; font-weight: 700; letter-spacing: 2px; color: rgba(250,248,242,0.55); text-transform: uppercase; margin-bottom: 6px; }
.grade-val { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 800; color: var(--bg); line-height: 1; }
.grade-sub { font-size: 10px; color: rgba(250,248,242,0.6); margin-top: 6px; }

.scope-strip { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.scope-chip {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 12px 18px; text-align: left; min-width: 140px;
}
.scope-lbl { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: var(--muted); text-transform: uppercase; }
.scope-val { font-size: 22px; font-weight: 700; color: var(--text); margin: 4px 0 2px; }
.scope-sub { font-size: 10px; color: var(--muted); }
.scope-bar { height: 3px; border-radius: 2px; background: var(--border); margin-top: 8px; overflow: hidden; }
.scope-bar-fill { height: 100%; border-radius: 2px; }

/* ── FEATURE SECTION ── */
section { padding: 96px 24px; max-width: 1100px; margin: 0 auto; }
.section-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 2.5px; color: var(--green); text-transform: uppercase; margin-bottom: 20px; }
.section-title { font-family: 'Playfair Display', serif; font-size: clamp(30px, 4vw, 50px); font-weight: 700; line-height: 1.15; max-width: 600px; margin-bottom: 56px; }
.section-title em { font-style: italic; }

.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.feat {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 28px 28px 32px;
  transition: box-shadow .2s, transform .2s;
}
.feat:hover { box-shadow: 0 8px 32px rgba(28,26,20,0.08); transform: translateY(-2px); }
.feat-icon { font-size: 24px; margin-bottom: 16px; }
.feat-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; color: var(--text); }
.feat-desc { font-size: 14px; color: var(--muted); line-height: 1.65; }
.feat-tag { display: inline-flex; margin-top: 14px; }
.tag { font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 3px 10px; border-radius: 3px; }
.tag-green { background: var(--green-lt); color: var(--green); }
.tag-terra { background: #F2E8E2; color: var(--terra); }
.tag-amber { background: #FEF5E4; color: var(--yellow); }

/* ── STATS SECTION ── */
.stats-section {
  background: var(--green); border-radius: 20px;
  padding: 60px 40px; margin: 0 24px;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 32px; text-align: center; max-width: 1100px; margin: 0 auto 80px;
}
.stat-num { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 800; color: var(--bg); }
.stat-lbl { font-size: 12px; font-weight: 500; color: rgba(250,248,242,0.6); margin-top: 4px; }

/* ── SOCIAL PROOF ── */
.proof { text-align: center; padding: 48px 24px 80px; }
.proof-title { font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; margin-bottom: 24px; }
.logos { display: flex; flex-wrap: wrap; gap: 32px; align-items: center; justify-content: center; }
.logo-pill {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 6px; padding: 10px 22px;
  font-size: 13px; font-weight: 600; color: var(--muted); letter-spacing: 0.5px;
}

/* ── CTA SECTION ── */
.cta-section { text-align: center; padding: 80px 24px 100px; }
.cta-title { font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 60px); font-weight: 800; margin-bottom: 20px; }
.cta-sub { font-size: 18px; color: var(--muted); margin-bottom: 40px; max-width: 480px; margin-left: auto; margin-right: auto; }

/* ── DIVIDER ── */
hr.div { border: none; border-top: 1px solid var(--border); margin: 0 40px; }

/* ── FOOTER ── */
footer { padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); }
.foot-logo { font-size: 12px; font-weight: 700; letter-spacing: 4px; color: var(--green); text-transform: uppercase; }
.foot-links { display: flex; gap: 24px; }
.foot-links a { font-size: 12px; color: var(--muted); text-decoration: none; }
.foot-note { font-size: 11px; color: var(--muted); }

@media (max-width: 640px) {
  .hero-card { flex-direction: column; padding: 24px; }
  .score-num { font-size: 64px; }
  nav { padding: 0 20px; }
  .nav-links { display: none; }
  footer { flex-direction: column; gap: 16px; text-align: center; }
}
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">CANOPY</a>
  <div class="nav-links">
    <a href="#">OVERVIEW</a>
    <a href="#">SUPPLY CHAIN</a>
    <a href="#">OFFSETS</a>
    <a href="#">PRICING</a>
  </div>
  <a class="nav-cta" href="#">Request Demo</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">Carbon Intelligence Platform</div>

  <h1>Make your <em>sustainability</em><br>ambitions measurable.</h1>
  <p class="hero-sub">
    Track Scope 1, 2 &amp; 3 emissions across your entire value chain.
    Audit suppliers, purchase offsets, and generate compliance reports
    — all in one platform.
  </p>

  <div class="hero-actions">
    <a href="https://ram.zenbin.org/canopy-mock" class="btn-primary">View Interactive Mock →</a>
    <a href="https://ram.zenbin.org/canopy-viewer" class="btn-ghost">Open in Pencil Viewer</a>
  </div>

  <!-- Editorial score card — Relace.ai large-number inspired -->
  <div class="hero-card">
    <div class="score-big">
      <div class="score-label">Carbon Score</div>
      <div>
        <span class="score-num">74</span>
        <span class="score-denom"> / 100</span>
      </div>
      <div class="score-trend">↓ 4.2% vs last quarter</div>
    </div>
    <div class="score-grade">
      <div class="grade-lbl">Grade</div>
      <div class="grade-val">B+</div>
      <div class="grade-sub">Top 18% of peers</div>
    </div>
  </div>

  <!-- Scope strip -->
  <div class="scope-strip">
    ${[
      { label: 'Scope 1', val: '1,240', sub: 'Direct · tCO₂e', pct: 12, col: '#1C3D2B' },
      { label: 'Scope 2', val: '3,880', sub: 'Energy · tCO₂e',   pct: 38, col: '#F5A623' },
      { label: 'Scope 3', val: '5,080', sub: 'Value chain · tCO₂e', pct: 50, col: '#C25C2A' },
    ].map(s => `
    <div class="scope-chip">
      <div class="scope-lbl">${s.label}</div>
      <div class="scope-val">${s.val}</div>
      <div class="scope-sub">${s.sub}</div>
      <div class="scope-bar"><div class="scope-bar-fill" style="width:${s.pct}%;background:${s.col}"></div></div>
    </div>`).join('')}
  </div>
</section>

<hr class="div">

<!-- STATS -->
<div class="stats-section" style="margin: 80px auto;">
  ${[
    ['10.2K', 'tCO₂e tracked Q1 2026'],
    ['24', 'suppliers audited'],
    ['−4.2%', 'vs prior quarter'],
    ['3', 'at-risk suppliers flagged'],
  ].map(([n, l]) => `<div><div class="stat-num">${n}</div><div class="stat-lbl">${l}</div></div>`).join('')}
</div>

<!-- FEATURES -->
<section>
  <div class="section-eyebrow">What CANOPY Does</div>
  <h2 class="section-title">Everything from<br><em>source to report.</em></h2>
  <div class="features">
    ${[
      { icon: '◈', title: 'Emissions Dashboard', desc: 'A live carbon score built from your Scope 1, 2 &amp; 3 data. Large editorial metrics make your position unmistakable at a glance.', tag: 'OVERVIEW', tagClass: 'tag-green' },
      { icon: '⊘', title: 'Supply Chain Intelligence', desc: 'Audit all 24 suppliers by emissions footprint. Risk-grade each one (CRIT → LOW). Drill down to individual shipment data.', tag: 'SUPPLY', tagClass: 'tag-amber' },
      { icon: '◎', title: 'Scope 1/2/3 Breakdown', desc: 'Combustion, fugitive, purchased energy, and full value chain — decomposed into categories with year-over-year comparison.', tag: 'SCOPES', tagClass: 'tag-green' },
      { icon: '◇', title: 'Offset Marketplace', desc: 'Browse VCS and Gold Standard credits from Amazon reforestation, Kenyan cookstoves, and Indian wind farms. Purchase in-app.', tag: 'OFFSETS', tagClass: 'tag-terra' },
      { icon: '☰', title: 'Compliance Reports', desc: 'Generate GHG Protocol, CDP Disclosure, and CSRD-compliant exports. Third-party verified by Bureau Veritas.', tag: 'REPORT', tagClass: 'tag-green' },
      { icon: '⚡', title: 'API-First Architecture', desc: 'Pull your carbon data into any BI tool or LCA software. JSON endpoints, webhook alerts, and Excel/PDF export built in.', tag: 'INTEGRATE', tagClass: 'tag-amber' },
    ].map(f => `
    <div class="feat">
      <div class="feat-icon">${f.icon}</div>
      <div class="feat-title">${f.title}</div>
      <div class="feat-desc">${f.desc}</div>
      <div class="feat-tag"><span class="tag ${f.tagClass}">${f.tag}</span></div>
    </div>`).join('')}
  </div>
</section>

<!-- SOCIAL PROOF -->
<div class="proof">
  <div class="proof-title">Trusted by sustainability leaders</div>
  <div class="logos">
    ${['Meridian Industries', 'Verdant Packaging', 'SolarFab Ltd', 'NexusFreight', 'Global Ports'].map(l => `<div class="logo-pill">${l}</div>`).join('')}
  </div>
</div>

<!-- CTA -->
<section class="cta-section">
  <h2 class="cta-title">Your carbon data,<br><em>finally actionable.</em></h2>
  <p class="cta-sub">Join the enterprises turning sustainability ambition into measurable impact.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/canopy-mock" class="btn-primary">View Interactive Mock →</a>
    <a href="https://ram.zenbin.org/canopy-viewer" class="btn-ghost">Open Pencil Viewer</a>
  </div>
</section>

<hr class="div">
<footer>
  <div class="foot-logo">CANOPY</div>
  <div class="foot-links">
    <a href="#">Privacy</a>
    <a href="#">Terms</a>
    <a href="#">ISO 14064</a>
  </div>
  <div class="foot-note">Designed by RAM · ram.zenbin.org</div>
</footer>

</body>
</html>`;
}

function buildViewerHtml(penJson) {
  const escaped = JSON.stringify(penJson);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Pencil Viewer</title>
<script>window.EMBEDDED_PEN = ${escaped};</script>
<script src="https://unpkg.com/@pencil-dev/viewer@latest/dist/viewer.umd.js"></script>
<style>
  body { margin:0; background:#E8E4DC; display:flex; flex-direction:column; align-items:center; min-height:100vh; font-family:system-ui,sans-serif; }
  header { width:100%; background:rgba(250,248,242,0.9); backdrop-filter:blur(12px); border-bottom:1px solid #DDD8CC; display:flex; align-items:center; justify-content:space-between; padding:0 32px; height:56px; }
  .hlogo { font-size:12px; font-weight:700; letter-spacing:4px; color:#1C3D2B; text-transform:uppercase; }
  .hback { font-size:13px; color:#8C8472; text-decoration:none; }
  .hback:hover { color:#1C1A14; }
  pencil-viewer { width:100%; flex:1; }
</style>
</head>
<body>
<header>
  <span class="hlogo">CANOPY</span>
  <a class="hback" href="https://ram.zenbin.org/canopy">← Back to overview</a>
</header>
<pencil-viewer></pencil-viewer>
</body>
</html>`;
}

async function main() {
  const penContent = fs.readFileSync(path.join(__dirname, 'canopy.pen'), 'utf8');

  console.log('Publishing hero page…');
  const heroHtml = buildHeroHtml();
  const heroRes = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, heroRes.status === 200 ? '✓' : heroRes.body.slice(0, 80));

  console.log('Publishing viewer…');
  const viewerHtml = buildViewerHtml(penContent);
  const viewerRes = await zenPublish(SLUG + '-viewer', viewerHtml, `${APP_NAME} — Pencil Viewer`);
  console.log('Viewer:', viewerRes.status, viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0, 80));

  if (heroRes.status === 200) {
    console.log('\n✓ Hero page:   https://ram.zenbin.org/' + SLUG);
    console.log('✓ Viewer:      https://ram.zenbin.org/' + SLUG + '-viewer');
  }
}

main().catch(console.error);
