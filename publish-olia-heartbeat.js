'use strict';
// publish-olia-heartbeat.js
// Full Design Discovery pipeline for OLIA
// Design Heartbeat — Mar 24, 2026
// Inspired by:
//   • lapa.ninja "The Future of Beauty is Automated" — scattered rotated photo card arc
//   • godly.website Superpower — warm amber health app, editorial portrait lighting
//   • awwwards.com — warm professional healthcare aesthetic

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'olia';
const VIEWER_SLUG = 'olia-viewer';
const DATE_STR    = 'March 24, 2026';
const APP_NAME    = 'OLIA';
const TAGLINE     = 'Skincare Intelligence & Ritual Companion';
const ARCHETYPE   = 'health-beauty';
const MOCK_URL    = 'https://ram.zenbin.org/olia-mock';

const ORIGINAL_PROMPT = `Inspired by Lapa Ninja's beauty AI landing page "The Future of Beauty is Automated" — scattered rotated product/photo card grid, warm cream-to-blush palette, editorial serif typography. A skincare ritual intelligence app that tracks morning/evening routines, logs skin condition with a photo diary, and surfaces ingredient coverage insights.`;

const P = {
  bg:      '#FAF7F4',
  surface: '#FFFFFF',
  surface2:'#F3EDE6',
  text:    '#2A1F1A',
  muted:   'rgba(42,31,26,0.42)',
  accent:  '#C4826A',
  accent2: '#8B6B5C',
  blush:   '#F0D9CF',
  rose:    '#D4A89A',
  sage:    '#8A9E8A',
  gold:    '#C8A96E',
  border:  'rgba(42,31,26,0.09)',
};

function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 300) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
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

function buildHeroHTML(pen) {
  const penEncoded = Buffer.from(JSON.stringify(pen)).toString('base64');
  const viewerURL  = `https://ram.zenbin.org/${VIEWER_SLUG}`;
  const shareText  = encodeURIComponent(`${APP_NAME} — ${TAGLINE} | RAM Design Studio`);
  const shareURL   = encodeURIComponent(`https://ram.zenbin.org/${SLUG}`);

  const swatches = [
    { color: P.bg,      label: 'Cream'   },
    { color: P.surface, label: 'White'   },
    { color: P.surface2,label: 'Parchment'},
    { color: P.accent,  label: 'Terracotta'},
    { color: P.rose,    label: 'Rose'    },
    { color: P.blush,   label: 'Blush'   },
    { color: P.sage,    label: 'Sage'    },
    { color: P.gold,    label: 'Gold'    },
  ].map(({ color, label }) =>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <div style="width:44px;height:44px;border-radius:10px;background:${color};border:1px solid ${P.border}"></div>
      <span style="font-size:9px;color:${P.muted};letter-spacing:0.5px">${label}</span>
      <span style="font-size:8px;color:${P.accent2};font-family:monospace">${color}</span>
    </div>`
  ).join('');

  const typeRows = [
    { size: '36px', weight: 400, label: 'Your skin. Understood.', family: 'Georgia', note: 'Display serif — 36 / 400 / Georgia' },
    { size: '22px', weight: 400, label: 'Good morning.', family: 'Georgia', note: 'Greeting serif — 22 / 400 / Georgia' },
    { size: '15px', weight: 400, label: 'Moisturise', family: 'Georgia', note: 'Step name — 15 / 400 / Georgia' },
    { size: '12px', weight: 600, label: 'TODAY\'S SKIN · HYDRATION 74%', family: 'Inter', note: 'Label sans — 12 / 600 / tracking 2px' },
    { size: '11px', weight: 400, label: 'Barrier slightly stressed — wind exposure noted', family: 'Inter', note: 'Body — 11 / 400 / Inter' },
  ].map(({ size, weight, label, family, note }) =>
    `<div style="padding:14px 0;border-bottom:1px solid ${P.border}">
      <div style="font-size:${size};font-weight:${weight};color:${P.text};font-family:'${family}',serif">${label}</div>
      <div style="font-size:10px;color:${P.muted};font-family:monospace;margin-top:4px">${note}</div>
    </div>`
  ).join('');

  const screenLabels = [
    { id: 1, title: 'Today\'s Ritual', desc: 'Morning routine steps, skin condition metrics, AI tip' },
    { id: 2, title: 'Skin Diary',      desc: 'Scattered rotated photo cards, weekly trend sparkline' },
    { id: 3, title: 'Product Lab',     desc: 'Angled product card grid with tag pills and ratings' },
    { id: 4, title: 'Insights',        desc: '30-day score chart, ingredient coverage analysis' },
    { id: 5, title: 'Routine Builder', desc: 'AM/PM toggle, ordered step sequence, drag handles' },
  ].map(s =>
    `<div style="padding:12px 0;border-bottom:1px solid ${P.border};display:flex;align-items:start;gap:12px">
      <div style="min-width:24px;height:24px;border-radius:50%;background:${P.accent};color:#fff;font-size:11px;font-weight:700;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center">${s.id}</div>
      <div>
        <div style="font-size:14px;font-weight:600;color:${P.text};font-family:'Georgia',serif">${s.title}</div>
        <div style="font-size:11px;color:${P.muted};font-family:Inter,sans-serif;margin-top:2px">${s.desc}</div>
      </div>
    </div>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
  <meta name="description" content="A skincare intelligence and ritual companion app. Tracks morning/evening routines, logs skin with a photo diary, and surfaces ingredient coverage insights. Warm cream and terracotta palette.">
  <meta property="og:title" content="${APP_NAME} — ${TAGLINE}">
  <meta property="og:description" content="Skincare ritual intelligence. Warm cream palette, scattered card diary, ingredient analysis. RAM Design Heartbeat.">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Georgia&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      ${P.bg};
      --surface: ${P.surface};
      --s2:      ${P.surface2};
      --text:    ${P.text};
      --muted:   ${P.muted};
      --accent:  ${P.accent};
      --a2:      ${P.accent2};
      --blush:   ${P.blush};
      --rose:    ${P.rose};
      --sage:    ${P.sage};
      --gold:    ${P.gold};
      --border:  ${P.border};
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }

    /* Hero */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -20%;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 800px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(196,130,106,0.12) 0%, transparent 65%);
      pointer-events: none;
    }
    .hero-eyebrow {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 3px;
      color: var(--accent);
      margin-bottom: 24px;
      text-transform: uppercase;
    }
    .hero-title {
      font-family: 'Georgia', serif;
      font-size: clamp(48px, 8vw, 96px);
      font-weight: 400;
      color: var(--text);
      text-align: center;
      line-height: 1.0;
      margin-bottom: 12px;
    }
    .hero-tagline {
      font-family: 'Georgia', serif;
      font-size: clamp(18px, 3vw, 26px);
      font-weight: 400;
      color: var(--muted);
      text-align: center;
      margin-bottom: 40px;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .btn-primary {
      padding: 14px 32px;
      background: var(--accent);
      color: white;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Georgia', serif;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: opacity .2s;
    }
    .btn-primary:hover { opacity: .85; }
    .btn-secondary {
      padding: 14px 32px;
      background: transparent;
      color: var(--accent);
      font-size: 14px;
      font-weight: 600;
      border: 1.5px solid var(--accent);
      cursor: pointer;
      text-decoration: none;
      transition: background .2s;
    }
    .btn-secondary:hover { background: var(--blush); }

    /* Preview strip */
    .preview-strip {
      width: 100%;
      overflow-x: auto;
      display: flex;
      gap: 0;
      padding-bottom: 8px;
      margin-top: 64px;
    }
    .preview-strip img,
    .preview-strip iframe { flex: 0 0 auto; }

    /* Section */
    .section {
      max-width: 900px;
      margin: 0 auto;
      padding: 80px 24px;
    }
    .section-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 3px;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .section-title {
      font-family: 'Georgia', serif;
      font-size: clamp(26px, 4vw, 40px);
      font-weight: 400;
      color: var(--text);
      margin-bottom: 16px;
    }
    .section-body {
      font-size: 15px;
      color: var(--muted);
      max-width: 600px;
      line-height: 1.7;
    }
    hr.divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: 0 24px;
    }

    /* Palette */
    .palette-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 32px;
    }

    /* Type specimen */
    .type-specimen {
      margin-top: 32px;
      border: 1px solid var(--border);
      padding: 0 24px;
    }

    /* Screen list */
    .screen-list { margin-top: 32px; }

    /* Design decisions */
    .decisions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }
    .decision-card {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 24px;
    }
    .decision-num {
      font-family: 'Georgia', serif;
      font-size: 36px;
      font-weight: 400;
      color: var(--accent);
      opacity: 0.4;
      line-height: 1;
    }
    .decision-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-top: 8px;
      margin-bottom: 8px;
    }
    .decision-body { font-size: 12px; color: var(--muted); line-height: 1.6; }

    /* Meta bar */
    .meta-bar {
      background: var(--surface);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 20px 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      justify-content: center;
    }
    .meta-item { text-align: center; }
    .meta-value { font-size: 22px; font-family: 'Georgia', serif; color: var(--accent); }
    .meta-label { font-size: 10px; letter-spacing: 1.5px; color: var(--muted); text-transform: uppercase; }

    /* Footer */
    footer {
      text-align: center;
      padding: 60px 24px;
      font-size: 11px;
      color: var(--muted);
      border-top: 1px solid var(--border);
    }
    footer a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-eyebrow">RAM Design Studio · ${DATE_STR}</div>
    <h1 class="hero-title">OLIA</h1>
    <p class="hero-tagline">Skincare Intelligence & Ritual Companion</p>
    <div class="hero-actions">
      <a href="${viewerURL}" class="btn-primary">View Design ↗</a>
      <a href="${MOCK_URL}" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
  </section>

  <!-- META BAR -->
  <div class="meta-bar">
    <div class="meta-item"><div class="meta-value">5</div><div class="meta-label">Screens</div></div>
    <div class="meta-item"><div class="meta-value">Light</div><div class="meta-label">Theme</div></div>
    <div class="meta-item"><div class="meta-value">Cream + Terracotta</div><div class="meta-label">Palette</div></div>
    <div class="meta-item"><div class="meta-value">Georgia + Inter</div><div class="meta-label">Typography</div></div>
    <div class="meta-item"><div class="meta-value">Skincare</div><div class="meta-label">Category</div></div>
  </div>

  <hr class="divider">

  <!-- ABOUT -->
  <section class="section">
    <div class="section-label">Concept</div>
    <h2 class="section-title">Where ritual meets intelligence</h2>
    <p class="section-body">
      OLIA is a skincare companion that transforms your daily routine from guesswork into
      understood ritual. Track morning and evening steps, photograph your skin over time,
      and get ingredient coverage analysis — all in a calm, editorial interface that feels
      like a warm notebook, not a clinical dashboard.
    </p>
    <p class="section-body" style="margin-top:16px">
      Inspired by the beauty-AI aesthetic emerging on Lapa Ninja in early 2026: scattered
      rotated product cards, soft warm gradients, and serif typography that positions
      personal care as something aspirational and intentional.
    </p>
  </section>

  <hr class="divider">

  <!-- PALETTE -->
  <section class="section">
    <div class="section-label">Colour Palette</div>
    <h2 class="section-title">Warm cream, blush & terracotta</h2>
    <div class="palette-grid">${swatches}</div>
  </section>

  <hr class="divider">

  <!-- TYPOGRAPHY -->
  <section class="section">
    <div class="section-label">Typography</div>
    <h2 class="section-title">Serif warmth, sans precision</h2>
    <div class="type-specimen">${typeRows}</div>
  </section>

  <hr class="divider">

  <!-- SCREENS -->
  <section class="section">
    <div class="section-label">Screens</div>
    <h2 class="section-title">Five moments in the ritual</h2>
    <div class="screen-list">${screenLabels}</div>
  </section>

  <hr class="divider">

  <!-- DESIGN DECISIONS -->
  <section class="section">
    <div class="section-label">Design Decisions</div>
    <h2 class="section-title">Three choices that define OLIA</h2>
    <div class="decisions">
      <div class="decision-card">
        <div class="decision-num">01</div>
        <div class="decision-title">Scattered rotated cards for the diary</div>
        <div class="decision-body">Directly borrowed from the Lapa beauty AI landing — photos at ±2–4° rotations evoke a physical photo album. The chaos-in-order creates delight without breaking the grid.</div>
      </div>
      <div class="decision-card">
        <div class="decision-num">02</div>
        <div class="decision-title">Georgia serif for all content text</div>
        <div class="decision-body">Using serif exclusively for content (names, headlines, CTAs) while reserving Inter for data labels. Creates warmth and signals this is a personal, not clinical, experience.</div>
      </div>
      <div class="decision-card">
        <div class="decision-num">03</div>
        <div class="decision-title">Progress shown as ritual, not achievement</div>
        <div class="decision-body">Bars and scores use soft tones — sage for good, gold for moderate — not red/green alarms. The goal is calm awareness, not anxious gamification.</div>
      </div>
    </div>
  </section>

  <hr class="divider">

  <!-- ACTIONS -->
  <section class="section" style="text-align:center">
    <div class="section-label">Explore</div>
    <h2 class="section-title">Open the prototype</h2>
    <div class="hero-actions">
      <a href="${viewerURL}" class="btn-primary">Open Viewer ↗</a>
      <a href="${MOCK_URL}" class="btn-secondary">Interactive Mock ☀◑</a>
    </div>
    <p style="font-size:11px;color:var(--muted);margin-top:24px">
      RAM Design Studio · Design Heartbeat · ${DATE_STR}
    </p>
  </section>

  <footer>
    <p>OLIA — <em>${TAGLINE}</em></p>
    <p style="margin-top:8px">
      <a href="https://ram.zenbin.org">RAM Design Studio</a> ·
      Design Heartbeat · ${DATE_STR}
    </p>
  </footer>

</body>
</html>`;
}

function buildViewerHTML(pen) {
  const penJson = JSON.stringify(pen);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'renderer.html'), 'utf8');
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

async function run() {
  console.log('─── OLIA Design Discovery Pipeline ───\n');

  const penPath = path.join(__dirname, 'olia.pen');
  if (!fs.existsSync(penPath)) {
    console.error('olia.pen not found — run node olia-app.js first');
    process.exit(1);
  }
  const pen = JSON.parse(fs.readFileSync(penPath, 'utf8'));

  // ── (a) Hero page ──────────────────────────────────────────────────────────
  console.log('Publishing hero page…');
  const heroHTML = buildHeroHTML(pen);
  const heroRes = await post(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHTML, 'ram');
  console.log(`  hero → ${heroRes.status}  ${heroRes.body.slice(0, 80)}`);

  // ── (b) Viewer page ────────────────────────────────────────────────────────
  console.log('Publishing viewer…');
  const viewerHTML = buildViewerHTML(pen);
  const viewerRes = await post(VIEWER_SLUG, `${APP_NAME} Viewer`, viewerHTML, 'ram');
  console.log(`  viewer → ${viewerRes.status}  ${viewerRes.body.slice(0, 80)}`);

  // ── (c) Gallery queue ─────────────────────────────────────────────────────
  console.log('Updating gallery queue…');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers:  { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
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
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`  queue → ${putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120)}`);

  // ── (d) Design DB ─────────────────────────────────────────────────────────
  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, { ...newEntry });
    rebuildEmbeddings(db);
    console.log('  design-db → indexed');
  } catch (e) {
    console.log(`  design-db → skipped (${e.message.slice(0, 60)})`);
  }

  console.log(`\n✓ OLIA published`);
  console.log(`  Hero   → https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer → https://ram.zenbin.org/${VIEWER_SLUG}`);
  console.log(`  Mock   → https://ram.zenbin.org/${SLUG}-mock`);
}

run().catch(console.error);
