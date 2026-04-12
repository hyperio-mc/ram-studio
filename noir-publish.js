'use strict';
// noir-publish.js — Full Design Discovery pipeline for NOIR
// NOIR — Revenue intelligence for creative studios
// Theme: DARK · Slug: noir

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'noir';
const APP_NAME  = 'NOIR';
const TAGLINE   = 'Revenue intelligence for creative studios.';
const ARCHETYPE = 'studio-dashboard-finance-dark-editorial';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'Dark editorial studio revenue dashboard. Inspired by DARKROOM (darkmodedesign.com) massive condensed display typography on pure black, and Neon DB dense data-on-dark aesthetic. Near-black #080808 base, parchment cream #EDE8DC, electric chartreuse #D4FF47. Five screens: Dashboard, Pipeline, Project Detail, Clients, Invoices.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);
const penJson = fs.readFileSync(path.join(__dirname, 'noir.pen'), 'utf8');

// Palette
const P = {
  bg:       '#080808',
  surface:  '#111111',
  surface2: '#1A1A1A',
  text:     '#EDE8DC',
  dim:      '#8A8480',
  faint:    '#4A4845',
  accent:   '#D4FF47',
  accent2:  '#FF5533',
  accent3:  '#4DFFCE',
  border:   '#242424',
};

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
      'Accept': 'application/json',
    },
  }, body);
  return res;
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO PAGE
// ─────────────────────────────────────────────────────────────────────────────
function buildHero() {
  const screens = [
    { id: 'Dashboard',     sub: 'Giant editorial $84,200 revenue figure, 12-point sparkline with chartreuse accent, 3 KPI chips, 3 project cards with colored left-stripe', color: P.accent  },
    { id: 'Pipeline',      sub: 'Filter tabs: All / Active / Review / Hold / Done. 7 projects list with per-row progress bars, colored accent stripes, due-date warnings', color: P.accent2 },
    { id: 'Project Detail',sub: '$12,400 contract card with 75% parchment progress bar, 7-item checklist with chartreuse checkboxes, time logged + rate footer', color: P.accent3 },
    { id: 'Clients',       sub: 'Ring-border avatar initials, per-client revenue in accent color, search + filter chips, 6 clients from $9.6K–$29.8K', color: P.accent  },
    { id: 'Invoices',      sub: 'Three-column summary strip: Total Out / Overdue (orange) / Paid MTD (mint), 6 invoices with status pills and accent-color left rails', color: P.accent3 },
  ];

  const tickerText = [
    'DASHBOARD', '·', 'PIPELINE', '·', 'PROJECT DETAIL', '·', 'CLIENTS', '·', 'INVOICES', '·',
    'REVENUE INTELLIGENCE', '·', 'DARK EDITORIAL', '·', '$84,200', '·', 'CHARTREUSE', '·',
    'NEAR-BLACK', '·', 'PARCHMENT CREAM', '·', 'STUDIO FINANCE', '·',
  ].join('  ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:${P.bg};--surf:${P.surface};--surf2:${P.surface2};--text:${P.text};--dim:${P.dim};--faint:${P.faint};--acc:${P.accent};--acc2:${P.accent2};--acc3:${P.accent3};--bdr:${P.border}}
html{background:var(--bg);color:var(--text);font-family:'Space Grotesk',system-ui,sans-serif;scroll-behavior:smooth}
body{min-height:100vh;overflow-x:hidden}

/* ── NAV ── */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:60px;background:rgba(8,8,8,0.90);backdrop-filter:blur(20px);border-bottom:1px solid var(--bdr)}
.nav-logo{font-family:'DM Mono',monospace;font-size:16px;font-weight:500;color:var(--text);text-decoration:none;letter-spacing:0.1em}
.nav-logo span{color:var(--acc)}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{font-size:12px;color:var(--dim);text-decoration:none;transition:color .2s;letter-spacing:0.04em;font-weight:500}
.nav-links a:hover{color:var(--text)}
.btn-nav{font-size:12px;font-weight:600;background:var(--acc);color:var(--bg);border:none;border-radius:6px;padding:8px 18px;text-decoration:none;transition:opacity .2s;letter-spacing:0.02em}
.btn-nav:hover{opacity:0.85}

/* ── HERO ── */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 64px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 38%,rgba(212,255,71,0.06) 0%,transparent 70%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:1px;background:var(--bdr)}

/* Revenue figure — editorial giant type */
.hero-eyebrow{font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:var(--acc);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:20px;opacity:0.8}
.hero-revenue{font-size:clamp(80px,14vw,160px);font-weight:700;line-height:0.92;letter-spacing:-0.04em;color:var(--text);margin-bottom:12px}
.hero-rule{width:80px;height:3px;background:var(--acc);margin:0 auto 20px}
.hero-h1{font-size:clamp(20px,3.5vw,32px);font-weight:500;color:var(--dim);max-width:580px;line-height:1.5;margin:0 auto 32px;letter-spacing:-0.01em}
.hero-h1 strong{color:var(--text);font-weight:700}

.hero-acts{display:flex;gap:14px;justify-content:center;margin-bottom:16px;flex-wrap:wrap}
.btn-lg{font-size:14px;font-weight:700;background:var(--acc);color:var(--bg);border:none;border-radius:8px;padding:14px 30px;text-decoration:none;transition:all .2s;letter-spacing:0.01em}
.btn-lg:hover{opacity:0.88;transform:translateY(-1px)}
.btn-lg-o{font-size:14px;font-weight:600;background:transparent;color:var(--text);border:1.5px solid var(--bdr);border-radius:8px;padding:13px 30px;text-decoration:none;transition:all .2s}
.btn-lg-o:hover{border-color:var(--acc);color:var(--acc)}
.hero-meta{font-size:10px;color:var(--faint);letter-spacing:0.12em;text-transform:uppercase;font-family:'DM Mono',monospace}

/* Stat chips under hero */
.hero-chips{display:flex;gap:12px;justify-content:center;margin-top:40px;flex-wrap:wrap}
.hero-chip{display:flex;flex-direction:column;align-items:center;padding:14px 24px;background:var(--surf);border:1px solid var(--bdr);border-radius:10px;min-width:100px}
.chip-val{font-size:22px;font-weight:700;color:var(--text);line-height:1}
.chip-lab{font-size:9px;color:var(--dim);letter-spacing:0.10em;text-transform:uppercase;margin-top:4px;font-family:'DM Mono',monospace}
.chip-val.acc{color:var(--acc)}
.chip-val.acc2{color:var(--acc2)}
.chip-val.acc3{color:var(--acc3)}

/* ── TICKER ── */
.ticker{overflow:hidden;height:38px;background:var(--acc);display:flex;align-items:center}
.ticker-track{display:inline-flex;white-space:nowrap;animation:tick 32s linear infinite;font-size:10px;font-weight:700;color:var(--bg);letter-spacing:0.12em}
@keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* ── SCREENS SECTION ── */
.section{padding:96px 48px;max-width:1200px;margin:0 auto}
@media(max-width:640px){.section{padding:64px 20px}}
.s-eye{font-size:10px;font-weight:700;color:var(--acc);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:12px;font-family:'DM Mono',monospace}
.s-h2{font-size:clamp(32px,5vw,52px);font-weight:700;color:var(--text);line-height:1.08;letter-spacing:-0.02em;margin-bottom:12px}
.s-sub{font-size:16px;color:var(--dim);line-height:1.7;max-width:560px;margin-bottom:56px}

.screens-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px}
.screen-card{background:var(--surf);border:1px solid var(--bdr);border-radius:14px;overflow:hidden;transition:transform .25s,border-color .25s}
.screen-card:hover{transform:translateY(-3px);border-color:var(--acc)}
.screen-card-body{padding:20px}
.sc-num{font-family:'DM Mono',monospace;font-size:10px;color:var(--faint);margin-bottom:8px;letter-spacing:0.06em}
.sc-title{font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px}
.sc-sub{font-size:12px;color:var(--dim);line-height:1.6}
.sc-accent{display:inline-block;width:24px;height:3px;border-radius:2px;margin-top:14px}

/* ── TREND SECTION ── */
.trend-card{background:var(--surf);border:1px solid var(--bdr);border-radius:14px;padding:36px;margin-bottom:24px}
.trend-source{font-family:'DM Mono',monospace;font-size:10px;color:var(--acc);letter-spacing:0.10em;text-transform:uppercase;margin-bottom:10px}
.trend-h{font-size:22px;font-weight:700;color:var(--text);margin-bottom:8px;letter-spacing:-0.01em}
.trend-p{font-size:14px;color:var(--dim);line-height:1.75}
.trend-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px}
.trend-item{background:var(--surf2);border:1px solid var(--bdr);border-radius:8px;padding:16px}
.t-label{font-size:9px;font-weight:700;color:var(--faint);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;font-family:'DM Mono',monospace}
.t-val{font-size:14px;font-weight:600;color:var(--text)}
.t-val.acc{color:var(--acc)}
.t-val.acc2{color:var(--acc2)}
.t-val.acc3{color:var(--acc3)}

/* ── PALETTE STRIP ── */
.palette-row{display:flex;gap:0;border-radius:10px;overflow:hidden;height:56px;margin-top:16px;border:1px solid var(--bdr)}
.pal-swatch{flex:1;display:flex;align-items:flex-end;padding:6px 10px}
.pal-label{font-size:8px;font-weight:600;letter-spacing:0.08em;font-family:'DM Mono',monospace;opacity:0.8}

/* ── DECISIONS ── */
.decisions-list{display:flex;flex-direction:column;gap:16px;margin-top:24px}
.decision-item{display:flex;gap:16px;align-items:flex-start;padding:20px;background:var(--surf);border:1px solid var(--bdr);border-radius:12px}
.d-num{font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:var(--acc);min-width:36px;line-height:1}
.d-body h4{font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px}
.d-body p{font-size:13px;color:var(--dim);line-height:1.65}

/* ── CRITIQUE ── */
.critique-card{background:rgba(255,85,51,0.06);border:1px solid rgba(255,85,51,0.18);border-radius:12px;padding:24px;margin-top:16px}
.crit-eye{font-size:10px;font-weight:700;color:var(--acc2);letter-spacing:0.10em;text-transform:uppercase;margin-bottom:8px;font-family:'DM Mono',monospace}
.crit-p{font-size:14px;color:var(--text);line-height:1.7}

/* ── FOOTER ── */
footer{border-top:1px solid var(--bdr);padding:40px 48px;display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto}
.ft-logo{font-family:'DM Mono',monospace;font-size:14px;color:var(--acc);letter-spacing:0.08em;font-weight:500}
.ft-meta{font-size:11px;color:var(--faint);font-family:'DM Mono',monospace;letter-spacing:0.06em}
</style>
</head>
<body>
<nav>
  <a href="#" class="nav-logo">N<span>◉</span>IR</a>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#trend">Inspiration</a></li>
    <li><a href="#decisions">Decisions</a></li>
  </ul>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-nav">View Design ↗</a>
</nav>

<section class="hero">
  <p class="hero-eyebrow">RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
  <div class="hero-revenue">$84,200</div>
  <div class="hero-rule"></div>
  <h1 class="hero-h1"><strong>${APP_NAME}</strong> — ${TAGLINE}</h1>
  <div class="hero-acts">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-lg">View in Pencil Viewer ↗</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-lg-o">Interactive Mock ↗</a>
  </div>
  <p class="hero-meta">Dark theme · 5 screens · Near-black + parchment + chartreuse</p>

  <div class="hero-chips">
    <div class="hero-chip"><span class="chip-val acc">$84K</span><span class="chip-lab">Revenue</span></div>
    <div class="hero-chip"><span class="chip-val">12</span><span class="chip-lab">Projects</span></div>
    <div class="hero-chip"><span class="chip-val acc2">$8.4K</span><span class="chip-lab">Overdue</span></div>
    <div class="hero-chip"><span class="chip-val acc3">87%</span><span class="chip-lab">Utilisation</span></div>
    <div class="hero-chip"><span class="chip-val">5</span><span class="chip-lab">Screens</span></div>
  </div>
</section>

<div class="ticker" aria-hidden="true">
  <div class="ticker-track">
    &nbsp;&nbsp;${tickerText}&nbsp;&nbsp;&nbsp;&nbsp;${tickerText}&nbsp;&nbsp;
  </div>
</div>

<div id="screens" style="background:var(--bg,#080808);padding:0">
  <div class="section">
    <p class="s-eye">Five Screens</p>
    <h2 class="s-h2">Every surface of<br>your studio's finances.</h2>
    <p class="s-sub">From the editorial revenue hero to invoice tracking — all in near-black with electric chartreuse accents.</p>
    <div class="screens-grid">
      ${screens.map((s, i) => `
      <div class="screen-card">
        <div class="screen-card-body">
          <p class="sc-num">0${i+1} / 0${screens.length}</p>
          <h3 class="sc-title">${s.id}</h3>
          <p class="sc-sub">${s.sub}</p>
          <span class="sc-accent" style="background:${s.color}"></span>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>

<div id="trend" style="background:var(--bg,#080808);border-top:1px solid var(--bdr,#242424)">
  <div class="section">
    <p class="s-eye">Design Research</p>
    <h2 class="s-h2">What sparked this.</h2>
    <div class="trend-card">
      <p class="trend-source">Source → darkmodedesign.com</p>
      <h3 class="trend-h">DARKROOM: editorial condensed display on pure black</h3>
      <p class="trend-p">Browsing Dark Mode Design, the DARKROOM site stopped me cold — bold condensed cream type at massive scale against a true #000000 background. No gradients, no glow, just pure typographic force. The contrast is brutal and beautiful. I wanted to bring that editorial newspaper-headline energy into a functional finance dashboard — letting the revenue figure ($84,200 at 68px) do the same visual work as a magazine masthead.</p>
      <div class="trend-grid">
        <div class="trend-item"><p class="t-label">Also Seen</p><p class="t-val">Neon DB — data-dense dark mode with teal viz bars</p></div>
        <div class="trend-item"><p class="t-label">Pattern</p><p class="t-val acc">Massive condensed type as primary UI element</p></div>
        <div class="trend-item"><p class="t-label">Secondary Trend</p><p class="t-val">Single-color accent on near-black (Anil Kody, neon green)</p></div>
        <div class="trend-item"><p class="t-label">Avoided</p><p class="t-val acc2">Gradients, glows, glassmorphism — chose hard black</p></div>
      </div>
    </div>

    <p class="s-eye" style="margin-top:48px">Colour Palette</p>
    <div class="palette-row">
      <div class="pal-swatch" style="background:#080808;flex:2"><span class="pal-label" style="color:#EDE8DC">Near Black</span></div>
      <div class="pal-swatch" style="background:#111111"><span class="pal-label" style="color:#4A4845">Surface</span></div>
      <div class="pal-swatch" style="background:#EDE8DC;flex:1.5"><span class="pal-label" style="color:#080808">Parchment</span></div>
      <div class="pal-swatch" style="background:#D4FF47"><span class="pal-label" style="color:#080808">Chartreuse</span></div>
      <div class="pal-swatch" style="background:#FF5533"><span class="pal-label" style="color:#fff">Ember</span></div>
      <div class="pal-swatch" style="background:#4DFFCE"><span class="pal-label" style="color:#080808">Mint</span></div>
    </div>
  </div>
</div>

<div id="decisions" style="background:var(--bg,#080808);border-top:1px solid var(--bdr,#242424)">
  <div class="section">
    <p class="s-eye">Design Decisions</p>
    <h2 class="s-h2">Three choices that<br>define the design.</h2>
    <div class="decisions-list">
      <div class="decision-item">
        <span class="d-num">01</span>
        <div class="d-body">
          <h4>Revenue figure as editorial headline</h4>
          <p>The Dashboard opens with "$84,200" at 68px — the same scale logic as DARKROOM's page-width headlines. No charts as the first thing you see; the number commands the screen before context is layered below it. A 56px chartreuse underline rule replaces the usual subheading.</p>
        </div>
      </div>
      <div class="decision-item">
        <span class="d-num">02</span>
        <div class="d-body">
          <h4>Accent stripe = status at a glance</h4>
          <p>Every project/invoice card has a 3px left-rail stripe in the status color (chartreuse = active, ember = review/overdue, mint = done). This means status is readable without reading the pill label — important when scanning a list of 7 projects quickly.</p>
        </div>
      </div>
      <div class="decision-item">
        <span class="d-num">03</span>
        <div class="d-body">
          <h4>Three-accent system with strict role assignment</h4>
          <p>Chartreuse (#D4FF47) = positive/active, Ember (#FF5533) = warning/review/overdue, Mint (#4DFFCE) = complete/paid. This semantic color language runs across all five screens so the palette itself carries meaning rather than being decorative.</p>
        </div>
      </div>
    </div>

    <div class="critique-card">
      <p class="crit-eye">Honest Critique</p>
      <p class="crit-p">The Pipeline screen feels density-heavy — seven projects stacked at 86px each leaves no breathing room, and on a real device the last two items would be partially obscured before reaching the nav bar. A toggle between list and card-grid views would solve the space problem while giving users agency over density.</p>
    </div>
  </div>
</div>

<footer>
  <span class="ft-logo">N◉IR by RAM</span>
  <span class="ft-meta">Design heartbeat · ram.zenbin.org · ${new Date().getFullYear()}</span>
</footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWER PAGE (with embedded .pen)
// ─────────────────────────────────────────────────────────────────────────────
function buildViewer() {
  const baseViewerUrl = 'https://ram.zenbin.org/viewer';
  // Minimal viewer wrapper that injects the pen
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Pencil Viewer | RAM</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#080808}
.viewer-bar{position:fixed;top:0;left:0;right:0;height:48px;background:rgba(8,8,8,0.95);border-bottom:1px solid #242424;display:flex;align-items:center;justify-content:space-between;padding:0 20px;z-index:100;font-family:'DM Mono',monospace}
.vb-name{font-size:13px;font-weight:500;color:#EDE8DC;letter-spacing:0.06em}
.vb-acc{color:#D4FF47}
.vb-links{display:flex;gap:16px}
.vb-links a{font-size:11px;color:#8A8480;text-decoration:none;letter-spacing:0.04em;transition:color .2s}
.vb-links a:hover{color:#EDE8DC}
iframe{position:fixed;top:48px;left:0;right:0;bottom:0;width:100%;height:calc(100% - 48px);border:none;background:#080808}
</style>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
${injection}
</head>
<body>
<div class="viewer-bar">
  <span class="vb-name">N<span class="vb-acc">◉</span>IR — ${TAGLINE}</span>
  <div class="vb-links">
    <a href="https://ram.zenbin.org/${SLUG}">← Hero</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Interactive Mock</a>
  </div>
</div>
<iframe src="https://ram.zenbin.org/viewer" id="pencil-frame" allow="fullscreen"></iframe>
<script>
  // Post the embedded pen to the iframe once it loads
  const frame = document.getElementById('pencil-frame');
  frame.addEventListener('load', () => {
    if (window.EMBEDDED_PEN) {
      frame.contentWindow.postMessage({ type: 'LOAD_PEN', pen: window.EMBEDDED_PEN }, '*');
    }
  });
<\/script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub queue helper
// ─────────────────────────────────────────────────────────────────────────────
async function pushToQueue() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
  }, putBody);
  return { status: putRes.status, entry: newEntry };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  console.log('▶ Publishing NOIR Design Discovery pipeline…\n');

  // a) Hero
  process.stdout.write('  [1/4] Hero page… ');
  const heroHtml = buildHero();
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHtml);
  console.log(heroRes.status === 200 ? `✓ https://ram.zenbin.org/${SLUG}` : `✗ ${heroRes.status} ${heroRes.body.slice(0,80)}`);

  // b) Viewer
  process.stdout.write('  [2/4] Viewer page… ');
  const viewerHtml = buildViewer();
  const viewerRes = await zenPut(`${SLUG}-viewer`, `${APP_NAME} — Pencil Viewer | RAM`, viewerHtml);
  console.log(viewerRes.status === 200 ? `✓ https://ram.zenbin.org/${SLUG}-viewer` : `✗ ${viewerRes.status}`);

  // c) Gallery queue
  process.stdout.write('  [3/4] GitHub queue… ');
  try {
    const queueRes = await pushToQueue();
    console.log(queueRes.status === 200 ? '✓ pushed' : `✗ status ${queueRes.status}`);
  } catch(e) { console.log('✗', e.message); }

  console.log('\n✅ Pipeline complete (mock published separately via noir-mock.mjs)');
  console.log(`   Hero    → https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer  → https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`   Mock    → https://ram.zenbin.org/${SLUG}-mock`);
})();
