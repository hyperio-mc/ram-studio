'use strict';
// cache-publish.js — Full Design Discovery pipeline for CACHE
// CACHE — Pull reference. Build vision.
// Theme: DARK  · Slug: cache

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'cache';
const APP_NAME  = 'CACHE';
const TAGLINE   = 'pull reference. build vision.';
const ARCHETYPE = 'design-tool-creative';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Visual reference/mood board app for designers — dark. Inspired by Neon DB glowing vertical bars (darkmodedesign.com), NOA accessories editorial grid (land-book.com), Huehaus floating colorful pill labels (minimal.gallery), and Anil Kody ALL-CAPS ultra-bold condensed type (darkmodedesign.com).';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'cache.pen'), 'utf8');

function req(opts, body) {
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

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  const res = await req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
  return res;
}

const P = {
  bg:           '#0A0A0E',
  surface:      '#141418',
  surfaceAlt:   '#1C1C22',
  border:       'rgba(124,92,246,0.14)',
  borderSub:    'rgba(244,240,232,0.09)',
  text:         '#F4F0E8',
  textMuted:    'rgba(244,240,232,0.45)',
  textFaint:    'rgba(244,240,232,0.22)',
  accent:       '#7C5CF6',
  accentDim:    'rgba(124,92,246,0.14)',
  accentGlow:   'rgba(124,92,246,0.28)',
  amber:        '#F7913A',
  amberDim:     'rgba(247,145,58,0.14)',
  teal:         '#2DD4BF',
  tealDim:      'rgba(45,212,191,0.14)',
  pink:         '#F472B6',
  lime:         '#84CC16',
  gold:         '#FBBF24',
};

// Pill colors for the 6 categories
const PILLS = [
  { text: 'Branding',  color: P.accent, bg: P.accentDim },
  { text: 'Type',      color: P.amber,  bg: P.amberDim  },
  { text: 'Motion',    color: P.teal,   bg: P.tealDim   },
  { text: 'Editorial', color: P.pink,   bg: 'rgba(244,114,182,0.14)' },
  { text: 'UI/UX',     color: P.lime,   bg: 'rgba(132,204,22,0.14)' },
  { text: 'Product',   color: P.gold,   bg: 'rgba(251,191,36,0.14)' },
];

function buildHero() {
  // Pseudo-random but deterministic bar heights for the ambient glow decoration
  const barData = [38,62,45,80,55,70,42,90,58,75,48,65,82,52,68,44,78,60,35,72];

  const screenCards = [
    { id: 'Home',       sub: 'CACHE wordmark + "What are you pulling today?" in Georgian italic + colorful pill row + hero pull card with ambient glow bars', color: P.accent },
    { id: 'Discover',   sub: 'Horizontal pill filter strip + masonry 2-col reference grid with colored tag dots — NOA accessories grid inspiration', color: P.amber },
    { id: 'Pull Detail', sub: 'Full-bleed image hero with bottom fade + Georgian italic title + colored tag chips + similar pulls strip', color: P.teal },
    { id: 'Collection', sub: 'ALL-CAPS 900-weight collection name + violet accent line + stats row + 3-col glow-border thumbnail grid', color: P.pink },
    { id: 'Add Pull',   sub: 'URL input + preview card + multi-color tag input + collection selector with color-coded options', color: P.lime },
    { id: 'Profile',    sub: 'MY CACHE header + avatar with glow ring + pull stats + collection card list with colored names', color: P.gold },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CACHE — ${TAGLINE} | RAM Design Studio</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:-apple-system,'Inter',system-ui,sans-serif}
body{min-height:100vh;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:60px;background:rgba(10,10,14,0.88);backdrop-filter:blur(16px);border-bottom:1px solid ${P.borderSub}}
.nav-logo{font-size:15px;font-weight:900;color:${P.text};letter-spacing:0.12em;text-decoration:none;text-transform:uppercase}
.nav-logo span{color:${P.accent}}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;transition:color 0.2s}
.nav-links a:hover{color:${P.text}}
.nav-badge{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${P.accent};background:${P.accentDim};border:1px solid rgba(124,92,246,0.28);padding:5px 12px;border-radius:20px}

/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:120px 60px 80px;max-width:1200px;margin:0 auto;position:relative}
.hero-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;color:${P.textMuted};text-transform:uppercase;margin-bottom:28px}
.hero-eyebrow span{color:${P.accent}}
.hero-title{font-size:clamp(80px,14vw,160px);font-weight:900;line-height:0.88;letter-spacing:-0.02em;color:${P.text};margin-bottom:22px;text-transform:uppercase}
.hero-title em{color:${P.accent};font-style:normal}
.hero-tagline{font-size:20px;color:${P.textMuted};font-family:Georgia,'Times New Roman',serif;font-style:italic;margin-bottom:16px}
.hero-sub{font-size:15px;color:${P.textMuted};max-width:540px;line-height:1.7;margin-bottom:48px}

/* PILL ROW */
.pill-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:44px}
.pill{display:inline-block;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.05em}

/* ACTIONS */
.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:72px}
.btn-p{background:${P.accent};color:#fff;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:800;text-decoration:none;transition:opacity 0.2s;letter-spacing:0.04em;text-transform:uppercase}
.btn-p:hover{opacity:0.85}
.btn-m{background:${P.accentDim};color:${P.accent};padding:14px 28px;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none;border:1px solid rgba(124,92,246,0.30);transition:opacity 0.2s}
.btn-m:hover{opacity:0.8}
.btn-s{background:${P.surfaceAlt};color:${P.textMuted};padding:14px 28px;border-radius:12px;font-size:13px;font-weight:600;text-decoration:none;border:1px solid ${P.borderSub};transition:border-color 0.2s}
.btn-s:hover{border-color:${P.accent};color:${P.text}}

/* AMBIENT GLOW BARS — Neon DB tribute */
.glow-bars{position:absolute;right:0;top:50%;transform:translateY(-50%);width:340px;height:320px;display:flex;align-items:flex-end;gap:6px;pointer-events:none;opacity:0.18;padding:0 20px}
.glow-bar{flex:1;border-radius:3px 3px 0 0;transition:height 0.3s}

/* META ROW */
.meta-row{display:flex;gap:40px;flex-wrap:wrap;border-top:1px solid ${P.borderSub};padding-top:40px}
.meta-item span{display:block;font-size:9px;color:${P.textFaint};letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-weight:700}
.meta-item strong{color:${P.text};font-size:13px;font-weight:700;font-family:'SF Mono','Fira Code',monospace}

/* SECTIONS */
section{max-width:1200px;margin:0 auto;padding:80px 60px}
.section-label{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${P.textFaint};margin-bottom:32px;padding-bottom:14px;border-bottom:1px solid ${P.borderSub}}

/* SCREENS GRID */
.screens-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px}
.screen-card{background:${P.surface};border-radius:16px;overflow:hidden;border:1px solid ${P.borderSub};transition:border-color 0.3s,box-shadow 0.3s;cursor:default}
.screen-card:hover{border-color:var(--c);box-shadow:0 0 24px rgba(124,92,246,0.10)}
.screen-thumb{height:160px;display:flex;align-items:flex-end;justify-content:center;padding:0 16px;position:relative;overflow:hidden;background:${P.surfaceAlt}}
.screen-thumb-inner{display:flex;align-items:flex-end;gap:4px;width:100%;height:100%;padding:16px 0 0}
.screen-bar{border-radius:2px 2px 0 0;flex:1}
.screen-name{padding:14px 16px 6px;font-size:11px;font-weight:900;color:var(--c);letter-spacing:0.08em;text-transform:uppercase}
.screen-sub{padding:0 16px 16px;font-size:11px;color:${P.textMuted};line-height:1.6}

/* FEATURES */
.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:0}
.feature-card{background:${P.surface};border-radius:16px;padding:28px;border:1px solid ${P.borderSub}}
.feature-icon{width:40px;height:40px;border-radius:12px;margin-bottom:18px;display:flex;align-items:center;justify-content:center;font-size:20px}
.feature-title{font-size:15px;font-weight:800;color:${P.text};margin-bottom:10px}
.feature-desc{font-size:12px;color:${P.textMuted};line-height:1.75}

/* TOKENS */
.tokens-block{background:${P.surface};border:1px solid ${P.borderSub};border-radius:14px;padding:28px;margin-top:32px}
.tokens-pre{font-size:11px;line-height:1.9;color:${P.textMuted};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
.tokens-pre .k{color:${P.accent}}
.tokens-pre .v{color:${P.amber}}
.tokens-pre .c{color:${P.textFaint}}

/* FOOTER */
footer{border-top:1px solid ${P.borderSub};padding:40px 60px;max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
footer p{font-size:11px;color:${P.textMuted}}
footer a{color:${P.accent};text-decoration:none}

@media(max-width:900px){
  .hero{padding:100px 24px 60px}
  section{padding:60px 24px}
  footer{padding:32px 24px;flex-direction:column;gap:12px;text-align:center}
  .screens-grid{grid-template-columns:repeat(2,1fr)}
  .feature-grid{grid-template-columns:1fr}
  nav{padding:0 20px}
  .glow-bars{display:none}
}
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">CA<span>CH</span>E</a>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#decisions">Decisions</a></li>
    <li><a href="#tokens">Tokens</a></li>
    <li><a href="https://ram.zenbin.org/cache-viewer">Viewer</a></li>
  </ul>
  <span class="nav-badge">Dark Theme</span>
</nav>

<div class="hero">
  <!-- Ambient glow bars — Neon DB tribute -->
  <div class="glow-bars" aria-hidden="true">
    ${barData.map((h,i) => {
      const colors = [P.accent, P.teal, P.amber, P.pink, P.accent, P.teal];
      const c = colors[i % colors.length];
      return `<div class="glow-bar" style="height:${h}%;background:${c};box-shadow:0 0 8px ${c}"></div>`;
    }).join('')}
  </div>

  <p class="hero-eyebrow">RAM Design Studio &nbsp;·&nbsp; <span>Mar 2026</span> &nbsp;·&nbsp; Design Heartbeat</p>
  <h1 class="hero-title">CA<em>CH</em>E</h1>
  <p class="hero-tagline">pull reference. build vision.</p>
  <p class="hero-sub">A dark visual research app for design directors and creative teams. Save references, build collections, and surface patterns — everything a designer pulls, organized.</p>

  <div class="pill-row">
    ${PILLS.map(p => `<span class="pill" style="color:${p.color};background:${p.bg}">${p.text}</span>`).join('')}
  </div>

  <div class="hero-actions">
    <a href="https://ram.zenbin.org/cache-viewer" class="btn-p">Open Viewer →</a>
    <a href="https://ram.zenbin.org/cache-mock" class="btn-m">☀◑ Interactive Mock</a>
    <a href="#tokens" class="btn-s">Design Tokens</a>
  </div>

  <div class="meta-row">
    <div class="meta-item"><span>Theme</span><strong>Dark</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>Design Tool</strong></div>
    <div class="meta-item"><span>Screens</span><strong>6</strong></div>
    <div class="meta-item"><span>Accent</span><strong>${P.accent}</strong></div>
    <div class="meta-item"><span>Inspired By</span><strong>Neon DB · NOA · Huehaus</strong></div>
    <div class="meta-item"><span>Format</span><strong>Pencil v2.8</strong></div>
  </div>
</div>

<section id="screens">
  <div class="section-label">6 Screens</div>
  <div class="screens-grid">
    ${screenCards.map(s => {
      const bh = [50,80,35,65,90,45,70,55];
      return `
    <div class="screen-card" style="--c:${s.color}">
      <div class="screen-thumb">
        <div class="screen-thumb-inner">
          ${bh.map((h,i) => {
            const opacity = 0.15 + (i % 3) * 0.12;
            return `<div class="screen-bar" style="height:${h}%;background:${s.color};opacity:${opacity}"></div>`;
          }).join('')}
        </div>
        <div style="position:absolute;top:12px;left:12px;width:6px;height:6px;border-radius:3px;background:${s.color};box-shadow:0 0 8px ${s.color}"></div>
      </div>
      <div class="screen-name">${s.id}</div>
      <div class="screen-sub">${s.sub}</div>
    </div>`;
    }).join('')}
  </div>
</section>

<section id="decisions">
  <div class="section-label">Design Decisions</div>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.accentDim}">⚡</div>
      <div class="feature-title">Ambient glow bars as decoration</div>
      <div class="feature-desc">Neon DB's hero on darkmodedesign.com uses glowing vertical bars as visual atmosphere on pure black. CACHE replicates this pattern in the hero and behind pull cards — vertical accent-colored bars at low opacity, giving depth without complexity. Pure decoration, zero function, maximum mood.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.amberDim}">🏷</div>
      <div class="feature-title">Six-color pill taxonomy</div>
      <div class="feature-desc">Huehaus Studio (minimal.gallery) floats colorful pill-shaped labels on black to organize content visually. CACHE adopts this: six fixed category colors (violet, amber, teal, pink, lime, gold) used consistently across pills, tag chips, collection names, and grid borders. Color IS the navigation.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.tealDim}">𝕋</div>
      <div class="feature-title">ALL-CAPS 900 weight headings</div>
      <div class="feature-desc">Anil Kody's developer portfolio on darkmodedesign.com uses extreme-weight ALL-CAPS typography as the primary visual element — the type IS the design. CACHE uses this for collection names ("DARK BRAND REFS"), screen headers ("MY CACHE"), and the wordmark: Inter 900 uppercase, tight tracking, no decoration needed.</div>
    </div>
  </div>
</section>

<section id="tokens">
  <div class="section-label">Design Tokens — CACHE Dark System</div>
  <div class="tokens-block">
    <pre class="tokens-pre"><span class="c">/* CACHE Design Tokens — Visual Research App */</span>
<span class="c">/* Generated by RAM Design Studio — Mar 2026 */</span>

:root {
  <span class="c">/* Background Scale */</span>
  --cache-bg:           <span class="v">'${P.bg}'</span>;      <span class="c">/* near-black blue-dark base */</span>
  --cache-surface:      <span class="v">'${P.surface}'</span>;  <span class="c">/* card background */</span>
  --cache-surface-alt:  <span class="v">'${P.surfaceAlt}'</span>;<span class="c">/* elevated / selected */</span>

  <span class="c">/* Text */</span>
  --cache-text:         <span class="v">'${P.text}'</span>;    <span class="c">/* warm cream — not pure white */</span>
  --cache-text-muted:   <span class="v">'${P.textMuted}'</span>;<span class="c">/* secondary text */</span>
  --cache-text-faint:   <span class="v">'${P.textFaint}'</span>;<span class="c">/* placeholder, dividers */</span>

  <span class="c">/* Primary Accent — Violet */</span>
  --cache-accent:       <span class="v">'${P.accent}'</span>;   <span class="c">/* primary CTA, Branding category */</span>
  --cache-accent-dim:   <span class="v">'${P.accentDim}'</span>; <span class="c">/* dim background pill/card */</span>
  --cache-accent-glow:  <span class="v">'${P.accentGlow}'</span>;<span class="c">/* glow box-shadow */</span>

  <span class="c">/* Category Colors — 6 fixed categories */</span>
  --cache-branding:     <span class="v">'${P.accent}'</span>;   <span class="c">/* Branding — violet */</span>
  --cache-type:         <span class="v">'${P.amber}'</span>;    <span class="c">/* Type — amber */</span>
  --cache-motion:       <span class="v">'${P.teal}'</span>;     <span class="c">/* Motion — teal */</span>
  --cache-editorial:    <span class="v">'${P.pink}'</span>;     <span class="c">/* Editorial — pink */</span>
  --cache-ui:           <span class="v">'${P.lime}'</span>;     <span class="c">/* UI/UX — lime */</span>
  --cache-product:      <span class="v">'${P.gold}'</span>;     <span class="c">/* Product — gold */</span>

  <span class="c">/* Borders */</span>
  --cache-border:       <span class="v">'${P.border}'</span>;   <span class="c">/* accent-tinted border */</span>
  --cache-border-sub:   <span class="v">'${P.borderSub}'</span>;<span class="c">/* hairline divider */</span>
}</pre>
  </div>
</section>

<footer>
  <p>CACHE &mdash; <a href="https://ram.zenbin.org">ram.zenbin.org</a> &mdash; RAM Design Studio</p>
  <p>Pencil.dev v2.8 &nbsp;·&nbsp; <a href="https://ram.zenbin.org/cache-viewer">Viewer</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/cache-mock">☀◑ Mock</a></p>
</footer>

</body>
</html>`;
}

function buildViewer() {
  const penJsonStr = JSON.stringify(penJson);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CACHE — Pen Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${P.bg};color:${P.text};font-family:-apple-system,'Inter',system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:20px}
h1{font-size:13px;font-weight:900;letter-spacing:0.12em;color:${P.text};text-transform:uppercase}
h1 span{color:${P.accent}}
p{font-size:12px;color:${P.textMuted};font-family:Georgia,serif;font-style:italic}
.links{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
a{color:${P.accent};font-size:12px;font-weight:700;text-decoration:none;background:${P.accentDim};padding:10px 22px;border-radius:10px;border:1px solid rgba(124,92,246,0.28);text-transform:uppercase;letter-spacing:0.06em}
a:hover{opacity:0.8}
</style>
<script>window.EMBEDDED_PEN = ${penJsonStr};</script>
</head>
<body>
<h1>CA<span>CH</span>E</h1>
<p>pull reference. build vision.</p>
<div class="links">
  <a href="https://ram.zenbin.org/cache">← Hero Page</a>
  <a href="https://ram.zenbin.org/cache-mock">☀◑ Interactive Mock</a>
</div>
<script>console.log('CACHE pen loaded:', typeof window.EMBEDDED_PEN, 'screens:', JSON.parse(window.EMBEDDED_PEN).screens?.length);</script>
</body>
</html>`;
}

(async () => {
  console.log('Publishing CACHE…\n');

  // a) Hero page
  const heroRes = await zenPut(SLUG, `CACHE — ${TAGLINE}`, buildHero());
  console.log(`Hero (${SLUG}): ${heroRes.status === 200 ? '✓ OK' : heroRes.body.slice(0,120)}`);

  // b) Viewer
  const viewerRes = await zenPut(`${SLUG}-viewer`, `CACHE Viewer`, buildViewer());
  console.log(`Viewer (${SLUG}-viewer): ${viewerRes.status === 200 ? '✓ OK' : viewerRes.body.slice(0,120)}`);

  // d) GitHub gallery queue
  console.log('\nUpdating GitHub gallery queue…');
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
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
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`Gallery queue: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 120)}`);

  console.log('\n✓ CACHE published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
