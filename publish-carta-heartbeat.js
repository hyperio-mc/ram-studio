// publish-carta-heartbeat.js
// Full Design Discovery pipeline for CARTA
// ─────────────────────────────────────────
'use strict';
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'carta';
const APP_NAME  = 'CARTA';
const TAGLINE   = 'Your Reading Life, Composed';
const ARCHETYPE = 'editorial-reader';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = `Inspired by Litbix (minimal.gallery) — warm minimal book curation grid with drag-drop collection interface, and Old Tom Capital (minimal.gallery) — editorial institutional design with large serif display numerals and modular "platform built to compound" framing. A personal reading tracker with warm parchment light theme, burnt-sienna accent, serif headings, and annual reading stats displayed in an editorial/institutional grid style. 5 screens: Shelf (book grid + streak), Reading (chapter progress tracker), Stats (editorial large-numeral data display), Discover (curated recommendations), Notes (pulled-quote highlights journal).`;

// ─── PALETTE ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F5F0E6',
  surface:  '#FFFDF8',
  surface2: '#EDE8DC',
  border:   '#D8D0BF',
  text:     '#1A1510',
  text2:    '#6B5E4A',
  accent:   '#8B3B1F',
  accent2:  '#2B5E3A',
  gold:     '#B8892A',
  muted:    'rgba(26,21,16,0.4)',
};
const T = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans:  "'Inter', 'Helvetica Neue', sans-serif",
  mono:  "'JetBrains Mono', 'Courier New', monospace",
};

// ─── ZENBIN HELPER ─────────────────────────────────────────────────────────────
function zenbin(slug, title, html, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, title, content: html });
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     '/api/create',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ url: `https://${subdomain}.zenbin.org/${slug}`, raw: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── STEP A: HERO PAGE ─────────────────────────────────────────────────────────
function buildHero() {
  const pen = fs.readFileSync('/workspace/group/design-studio/carta.pen', 'utf8');
  const penData = JSON.parse(pen);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CARTA — Your Reading Life, Composed · RAM Design Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Helvetica Neue',sans-serif;background:${P.bg};color:${P.text};min-height:100vh;overflow-x:hidden}

/* ── HERO ── */
.hero{padding:80px 32px 64px;max-width:900px;margin:0 auto;text-align:center}
.hero-kicker{font-family:'JetBrains Mono',monospace;font-size:11px;color:${P.text2};letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;opacity:0.8}
.hero-title{font-family:'EB Garamond',serif;font-size:clamp(52px,8vw,88px);color:${P.text};font-weight:400;line-height:1;margin-bottom:12px;letter-spacing:-1px}
.hero-title em{color:${P.accent};font-style:italic}
.hero-tagline{font-family:'Inter',sans-serif;font-size:16px;color:${P.text2};font-weight:300;line-height:1.6;max-width:480px;margin:0 auto 36px}
.hero-cta{display:inline-flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center}
.btn-primary{background:${P.accent};color:white;padding:12px 28px;border-radius:4px;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;letter-spacing:0.5px;text-decoration:none;transition:opacity 0.2s}
.btn-primary:hover{opacity:0.85}
.btn-ghost{color:${P.text2};font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;text-decoration:none;border-bottom:1px solid ${P.border};padding-bottom:2px;transition:color 0.2s}
.btn-ghost:hover{color:${P.accent}}

/* ── THEME STRIP ── */
.theme-strip{background:${P.text};color:${P.bg};padding:14px 32px;display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase}
.theme-strip .val{font-size:12px;font-weight:500}
.theme-badges{display:flex;gap:8px}
.tbadge{padding:4px 10px;border-radius:2px;font-size:9px;letter-spacing:1.5px}

/* ── STAT ROW (Old Tom Capital-inspired) ── */
.stat-section{padding:60px 32px;border-top:1px solid ${P.border};border-bottom:1px solid ${P.border};background:${P.surface}}
.stat-section-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:${P.text2};letter-spacing:2px;text-transform:uppercase;text-align:center;margin-bottom:40px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:${P.border};max-width:800px;margin:0 auto;border-radius:4px;overflow:hidden}
.stat-cell{background:${P.surface};padding:28px 20px;text-align:center}
.stat-num{font-family:'EB Garamond',serif;font-size:52px;font-weight:400;line-height:1;margin-bottom:8px}
.stat-label{font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:${P.text};margin-bottom:4px}
.stat-sub{font-family:'Inter',sans-serif;font-size:10px;color:${P.text2};line-height:1.4}
@media(max-width:640px){.stat-grid{grid-template-columns:1fr 1fr}}

/* ── INSPIRATION ── */
.inspo{padding:60px 32px;max-width:900px;margin:0 auto}
.section-title{font-family:'EB Garamond',serif;font-size:28px;color:${P.text};font-weight:400;font-style:italic;margin-bottom:8px}
.section-sub{font-family:'Inter',sans-serif;font-size:13px;color:${P.text2};margin-bottom:32px;line-height:1.6}
.inspo-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:600px){.inspo-grid{grid-template-columns:1fr}}
.inspo-card{background:${P.surface};border:1px solid ${P.border};border-radius:8px;padding:20px;position:relative}
.inspo-source{font-family:'JetBrains Mono',monospace;font-size:9px;color:${P.accent};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px}
.inspo-title{font-family:'EB Garamond',serif;font-size:18px;color:${P.text};font-style:italic;margin-bottom:6px}
.inspo-body{font-family:'Inter',sans-serif;font-size:12px;color:${P.text2};line-height:1.6}

/* ── SCREENS ── */
.screens-section{padding:60px 32px;background:${P.surface2};border-top:1px solid ${P.border};border-bottom:1px solid ${P.border}}
.screens-inner{max-width:900px;margin:0 auto}
.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:32px}
@media(max-width:700px){.screens-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:480px){.screens-grid{grid-template-columns:1fr 1fr}}
.screen-card{background:${P.surface};border:1px solid ${P.border};border-radius:8px;overflow:hidden;transition:transform 0.15s,box-shadow 0.15s}
.screen-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(26,21,16,0.12)}
.screen-preview{height:80px;background:${P.surface2};display:flex;align-items:center;justify-content:center;border-bottom:1px solid ${P.border}}
.screen-num{font-family:'EB Garamond',serif;font-size:28px;color:${P.accent};opacity:0.7;font-style:italic}
.screen-label{padding:10px 12px;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;color:${P.text};text-transform:uppercase;letter-spacing:0.8px}

/* ── PALETTE ── */
.palette-section{padding:60px 32px;max-width:900px;margin:0 auto}
.palette-grid{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.swatch{width:60px}
.swatch-block{height:56px;border-radius:6px;margin-bottom:6px;border:1px solid rgba(0,0,0,0.08)}
.swatch-hex{font-family:'JetBrains Mono',monospace;font-size:9px;color:${P.text2}}
.swatch-name{font-family:'Inter',sans-serif;font-size:9px;color:${P.text2};margin-top:2px}

/* ── DECISIONS ── */
.decisions{padding:60px 32px;max-width:900px;margin:0 auto}
.decision-item{display:flex;gap:20px;padding:20px 0;border-bottom:1px solid ${P.border}}
.decision-n{font-family:'EB Garamond',serif;font-size:32px;color:${P.accent};opacity:0.5;font-style:italic;flex-shrink:0;width:40px;line-height:1}
.decision-body dt{font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:${P.text};margin-bottom:4px}
.decision-body dd{font-family:'Inter',sans-serif;font-size:12px;color:${P.text2};line-height:1.6;margin:0}

/* ── FOOTER ── */
.footer{padding:32px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;color:${P.muted};letter-spacing:1px;border-top:1px solid ${P.border}}
.footer a{color:${P.accent};text-decoration:none}
</style>
</head>
<body>

<!-- THEME STRIP -->
<div class="theme-strip">
  <div>
    <div style="opacity:0.5;font-size:9px;margin-bottom:2px">DESIGN SYSTEM</div>
    <div class="val">${APP_NAME} · ${ARCHETYPE.toUpperCase()}</div>
  </div>
  <div class="theme-badges">
    <div class="tbadge" style="background:${P.accent}">LIGHT THEME</div>
    <div class="tbadge" style="background:${P.accent2}">EDITORIAL</div>
    <div class="tbadge" style="background:${P.gold}">SERIF</div>
  </div>
  <div style="opacity:0.6;font-size:9px">RAM DESIGN HEARTBEAT · ${new Date().toISOString().slice(0,10)}</div>
</div>

<!-- HERO -->
<div class="hero">
  <div class="hero-kicker">RAM Design Studio · Reading Tracker · 5 screens</div>
  <h1 class="hero-title"><em>Carta</em></h1>
  <p class="hero-tagline">${TAGLINE} — a personal reading companion with editorial warmth. Track your shelf, compound your reading life.</p>
  <div class="hero-cta">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Open Viewer →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
</div>

<!-- STAT ROW (Old Tom Capital style) -->
<div class="stat-section">
  <div class="stat-section-label">FIG. A — YOUR READING YEAR BUILT TO COMPOUND</div>
  <div class="stat-grid">
    <div class="stat-cell"><div class="stat-num" style="color:${P.accent}">34</div><div class="stat-label">Books Read</div><div class="stat-sub">on track for 48 this year</div></div>
    <div class="stat-cell"><div class="stat-num" style="color:${P.accent2}">8,412</div><div class="stat-label">Pages Turned</div><div class="stat-sub">avg 247 per book</div></div>
    <div class="stat-cell"><div class="stat-num" style="color:${P.gold}">62</div><div class="stat-label">Hours Reading</div><div class="stat-sub">~2.1 hours per week</div></div>
    <div class="stat-cell"><div class="stat-num" style="color:${P.text}">12</div><div class="stat-label">Day Streak</div><div class="stat-sub">personal best: 31 days</div></div>
  </div>
</div>

<!-- INSPIRATION -->
<div class="inspo">
  <h2 class="section-title">What Sparked This</h2>
  <p class="section-sub">Two sites from minimal.gallery shaped this design — one for the curation feel, one for the data language.</p>
  <div class="inspo-grid">
    <div class="inspo-card">
      <div class="inspo-source">minimal.gallery</div>
      <div class="inspo-title">Litbix — for book lovers</div>
      <p class="inspo-body">A delightful single-purpose tool where you drag-drop your books onto a warm canvas and export as JPG. The warmth, the collection-first thinking, and the personal curation ethos directly inspired Carta's Shelf screen and parchment palette.</p>
    </div>
    <div class="inspo-card">
      <div class="inspo-source">minimal.gallery</div>
      <div class="inspo-title">Old Tom Capital — Golf's Institutional Platform</div>
      <p class="inspo-body">"A Platform Built to Compound" — this site's editorial stat display (543M rounds played, 138M Americans engaged) showed how large serif numerals with brief supporting copy can feel both authoritative and beautiful. Directly adapted for Carta's Stats screen.</p>
    </div>
  </div>
</div>

<!-- SCREENS -->
<div class="screens-section">
  <div class="screens-inner">
    <div class="section-title">Five Screens</div>
    <div class="section-sub">Shelf · Reading · Stats · Discover · Notes</div>
    <div class="screens-grid">
      ${['Shelf', 'Reading', 'Stats', 'Discover', 'Notes'].map((s, i) => `
        <a href="https://ram.zenbin.org/${SLUG}-viewer" class="screen-card" style="text-decoration:none">
          <div class="screen-preview"><div class="screen-num">0${i+1}</div></div>
          <div class="screen-label">${s}</div>
        </a>
      `).join('')}
    </div>
  </div>
</div>

<!-- PALETTE -->
<div class="palette-section">
  <h2 class="section-title">Colour Palette</h2>
  <p class="section-sub" style="margin-bottom:0">Warm parchment grounds everything. Burnt sienna as the primary accent brings the feel of well-worn books. Forest green for growth/progress. Antique gold for ratings and warmth.</p>
  <div class="palette-grid">
    ${[
      { hex: P.bg,       name: 'Parchment' },
      { hex: P.surface,  name: 'Cream' },
      { hex: P.surface2, name: 'Stone' },
      { hex: P.border,   name: 'Dust' },
      { hex: P.text,     name: 'Ink' },
      { hex: P.text2,    name: 'Bark' },
      { hex: P.accent,   name: 'Sienna' },
      { hex: P.accent2,  name: 'Forest' },
      { hex: P.gold,     name: 'Gold' },
    ].map(s => `
      <div class="swatch">
        <div class="swatch-block" style="background:${s.hex}"></div>
        <div class="swatch-hex">${s.hex}</div>
        <div class="swatch-name">${s.name}</div>
      </div>
    `).join('')}
  </div>
</div>

<!-- DESIGN DECISIONS -->
<div class="decisions">
  <h2 class="section-title">Design Decisions</h2>
  <dl>
    <div class="decision-item">
      <div class="decision-n">1</div>
      <div class="decision-body">
        <dt>EB Garamond serif + JetBrains Mono for a warm-but-precise editorial register</dt>
        <dd>Serif headings (italic Garamond) give warmth and literary authority; monospace for labels and FIG. notation echoes Old Tom Capital's institutional data tagging. The combination feels like an annual report for your personal reading life.</dd>
      </div>
    </div>
    <div class="decision-item">
      <div class="decision-n">2</div>
      <div class="decision-body">
        <dt>Stats screen uses editorial grid cells (FIG. A, B, C) not data viz widgets</dt>
        <dd>Instead of charts, the primary stats are displayed as large isolated numerals in a four-cell grid — exactly how Old Tom Capital displays "543 Million U.S. rounds played." The FIG. labelling system gives the stats scientific authority without feeling sterile.</dd>
      </div>
    </div>
    <div class="decision-item">
      <div class="decision-n">3</div>
      <div class="decision-body">
        <dt>Book covers as abstract coloured rectangles with serif initials</dt>
        <dd>Rather than placeholder images, each book uses a distinctive colour block with initialised title glyphs. Inspired by Litbix's grid-first approach — the form follows the collection shape, not the cover art. The overall effect is a curated tonal mosaic.</dd>
      </div>
    </div>
  </dl>
</div>

<!-- FOOTER -->
<div class="footer">
  <div>Generated by <a href="https://ram.zenbin.org">RAM Design Studio</a> · Heartbeat run ${new Date().toISOString().slice(0,16).replace('T',' ')} UTC</div>
  <div style="margin-top:6px">Inspiration: Litbix · Old Tom Capital (both minimal.gallery) · Lapa Ninja / Dawn</div>
</div>

</body>
</html>`;
}

// ─── STEP B: VIEWER ────────────────────────────────────────────────────────────
function buildViewer() {
  const penJson  = fs.readFileSync('/workspace/group/design-studio/carta.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

  // Get base viewer from a recent pen publish or build our own
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CARTA — Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#1A1510;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:'Inter',sans-serif;padding:24px 16px}
.viewer-header{color:#6B5E4A;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;text-align:center}
.viewer-header a{color:#8B3B1F;text-decoration:none}
.phone{width:375px;min-height:720px;background:#F5F0E6;border-radius:40px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05);position:relative}
.nav-bar{position:sticky;bottom:0;background:#FFFDF8;border-top:1px solid #D8D0BF;display:flex;padding:8px 0 4px}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;cursor:pointer;transition:opacity 0.15s}
.nav-item.active .nav-label{color:#8B3B1F}
.nav-label{font-family:'Inter',sans-serif;font-size:9px;letter-spacing:0.5px;color:#6B5E4A;font-weight:500}
.screen-container{min-height:640px;overflow-y:auto;padding-bottom:16px}
.screen{display:none}
.screen.active{display:block}
.status-bar{height:44px;background:#F5F0E6;display:flex;align-items:center;justify-content:space-between;padding:0 20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#6B5E4A}
</style>
</head>
<body>
<div class="viewer-header">
  <a href="https://ram.zenbin.org/carta">← CARTA</a> · RAM DESIGN STUDIO · VIEWER
</div>
<div class="phone" id="phone">
  <div class="status-bar"><span>9:41</span><span>◉ 100%</span></div>
  <div class="screen-container" id="screenContainer"></div>
  <div class="nav-bar" id="navBar"></div>
</div>
<script>
// Viewer will be injected with EMBEDDED_PEN
<\/script>
</body>
</html>`;

  // Inject pen and runtime
  const runtime = `
(function() {
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if (!pen) { document.getElementById('screenContainer').innerHTML = '<div style="padding:40px;text-align:center;color:#6B5E4A;font-family:monospace">No pen data found</div>'; return; }

  const screens = pen.screens || [];
  const nav     = pen.nav     || [];
  let current   = 0;

  function renderNav() {
    const icons = {
      grid:   '⊞', book: '📖', chart: '◉', search: '⌕', star: '★',
      home:   '⌂', bell: '◉', user: '◎', list: '≡', settings: '⚙',
    };
    const bar = document.getElementById('navBar');
    bar.innerHTML = nav.map((n, i) => \`
      <div class="nav-item \${i===current?'active':''}" onclick="goTo(\${i})">
        <span style="font-size:16px">\${icons[n.icon]||'·'}</span>
        <span class="nav-label">\${n.label}</span>
      </div>
    \`).join('');
  }

  function renderScreen(idx) {
    const sc = screens[idx];
    if (!sc) return;
    const container = document.getElementById('screenContainer');
    let html = '';
    const layers = sc.layers || [];
    for (const layer of layers) {
      if (layer.type === 'frame') {
        const bg = layer.bg || '#F5F0E6';
        html += \`<div style="background:\${bg};min-height:620px">\`;
        for (const child of (layer.children || [])) {
          if (child.type === 'raw') html += child.html || '';
        }
        html += '</div>';
      } else if (layer.type === 'raw') {
        html += layer.html || '';
      }
    }
    container.innerHTML = html;
  }

  window.goTo = function(idx) {
    current = idx;
    renderScreen(idx);
    renderNav();
    document.getElementById('screenContainer').scrollTop = 0;
  };

  renderScreen(0);
  renderNav();
})();
`;

  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  viewerHtml = viewerHtml.replace('<\/script>\n</body>', runtime + '\n<\/script>\n</body>');
  return viewerHtml;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('── CARTA Design Discovery Pipeline ──\n');

  // A: Hero
  console.log('Step A: Building hero page...');
  const heroHtml = buildHero();
  const heroRes  = await zenbin(SLUG, `CARTA — ${TAGLINE} · RAM Design Studio`, heroHtml, SUBDOMAIN);
  console.log('  Hero:', heroRes.url || `https://${SUBDOMAIN}.zenbin.org/${SLUG}`);

  // B: Viewer
  console.log('Step B: Building viewer...');
  const viewerHtml = buildViewer();
  const viewRes    = await zenbin(`${SLUG}-viewer`, `CARTA — Viewer · RAM Design Studio`, viewerHtml, SUBDOMAIN);
  console.log('  Viewer:', viewRes.url || `https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);

  // C: Svelte mock — will be done in separate .mjs script
  console.log('Step C: Svelte mock → running carta-mock.mjs...');

  // D: Gallery queue
  console.log('Step D: Updating gallery queue...');
  try {
    const config   = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
    const TOKEN    = config.GITHUB_TOKEN;
    const REPO     = config.GITHUB_REPO;

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
      path:     `/repos/${REPO}/contents/queue.json`,
      method:   'GET',
      headers:  { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
    });
    const fileData = JSON.parse(getRes.body);
    const sha      = fileData.sha;
    let   queue    = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
    if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
    if (!queue.submissions) queue.submissions = [];

    const entry = {
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
      theme:        'light',
    };
    queue.submissions.push(entry);
    queue.updated_at = new Date().toISOString();

    const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const putBody    = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha });
    const putRes     = await ghReq({
      hostname: 'api.github.com',
      path:     `/repos/${REPO}/contents/queue.json`,
      method:   'PUT',
      headers:  {
        'Authorization':  `token ${TOKEN}`,
        'User-Agent':     'ram-heartbeat/1.0',
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(putBody),
        'Accept':         'application/vnd.github.v3+json',
      },
    }, putBody);
    console.log('  Queue updated:', putRes.status === 200 ? 'OK ✓' : `status ${putRes.status} — ${putRes.body.slice(0, 80)}`);
    fs.writeFileSync('/workspace/group/design-studio/carta-entry.json', JSON.stringify(entry, null, 2));
  } catch (e) {
    console.error('  Queue error:', e.message);
  }

  console.log('\n── Done (Svelte mock next) ──');
  console.log(`Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
