'use strict';
// cast-publish.js — Full Design Discovery pipeline for CAST
// CAST — AI-powered podcast analytics platform
// Theme: DARK · Slug: cast

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'cast';
const APP_NAME  = 'CAST';
const TAGLINE   = 'AI-powered podcast analytics for serious creators.';
const ARCHETYPE = 'media-analytics';
const SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT = 'AI podcast analytics platform — dark, data-dense. Inspired by Neon.com (pure black + phosphor teal, developer infra aesthetic) on darkmodedesign.com, Format Podcasts (useformat.ai/podcasts) AI podcast tooling trend, AuthKit deep dark navy from godly.website, and Folk.app AI assistant card grid from minimal.gallery.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);
const penJson = fs.readFileSync(path.join(__dirname, 'cast.pen'), 'utf8');

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
  return req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
}

const P = {
  bg:         '#060609',
  surface:    '#0D0D12',
  surfaceAlt: '#13131A',
  text:       '#E8EBF4',
  textMuted:  'rgba(232,235,244,0.38)',
  textSub:    'rgba(232,235,244,0.55)',
  accent:     '#00E0A0',
  accentDim:  'rgba(0,224,160,0.10)',
  accentBdr:  'rgba(0,224,160,0.22)',
  border:     'rgba(0,224,160,0.12)',
  borderSub:  'rgba(255,255,255,0.06)',
  purple:     '#8B5CF6',
  amber:      '#F59E0B',
  blue:       '#3B82F6',
  jade:       '#00C87A',
};

// ── HERO PAGE ─────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE} | RAM Design Studio</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:-apple-system,'Inter',system-ui,sans-serif}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;
  background:rgba(6,6,9,0.88);backdrop-filter:blur(14px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-size:14px;font-weight:800;color:${P.accent};letter-spacing:3px;text-decoration:none;text-transform:uppercase}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;transition:color 0.2s}
.nav-links a:hover{color:${P.text}}
.nav-tag{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${P.accent};background:${P.accentDim};border:1px solid ${P.accentBdr};padding:5px 12px;border-radius:20px}

.hero{
  min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  padding:120px 60px 80px;max-width:1200px;margin:0 auto;
  position:relative;
}
.hero-bg-glow{
  position:absolute;top:20%;left:-10%;width:500px;height:500px;
  background:radial-gradient(circle, rgba(0,224,160,0.06) 0%, transparent 70%);
  pointer-events:none;
}
.hero-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;color:${P.textMuted};text-transform:uppercase;margin-bottom:28px}
.hero-eyebrow span{color:${P.accent}}
.hero-title{font-size:clamp(72px,12vw,140px);font-weight:900;line-height:0.92;letter-spacing:-4px;color:${P.text};margin-bottom:24px}
.hero-title em{color:${P.accent};font-style:normal}
.hero-sub{font-size:18px;color:${P.textMuted};max-width:520px;line-height:1.65;margin-bottom:48px}
.hero-actions{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:72px}
.btn-p{background:${P.accent};color:#06060A;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;transition:opacity 0.2s;letter-spacing:0.3px}
.btn-p:hover{opacity:0.85}
.btn-s{background:${P.surfaceAlt};color:${P.text};padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid rgba(232,235,244,0.1);transition:border-color 0.2s}
.btn-s:hover{border-color:${P.accent}}
.btn-mock{background:${P.accentDim};color:${P.accent};padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;border:1px solid ${P.accentBdr};transition:opacity 0.2s}
.btn-mock:hover{opacity:0.8}

.meta-row{display:flex;gap:40px;flex-wrap:wrap;border-top:1px solid ${P.border};padding-top:40px}
.meta-item span{display:block;font-size:9px;color:${P.textMuted};letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-weight:600}
.meta-item strong{color:${P.text};font-size:13px;font-weight:700;font-family:'SF Mono','Fira Code',monospace}

section{max-width:1200px;margin:0 auto;padding:80px 60px}
.section-label{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${P.textMuted};margin-bottom:32px;padding-bottom:14px;border-bottom:1px solid ${P.border}}

.screens-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:60px}
.screen-card{background:${P.surface};border-radius:16px;overflow:hidden;border:1px solid ${P.border};transition:border-color 0.2s;cursor:default}
.screen-card:hover{border-color:${P.accent}}
.screen-thumb{background:${P.surfaceAlt};height:200px;display:flex;align-items:flex-end;justify-content:center;padding:0 16px 16px;gap:3px;overflow:hidden}
.screen-name{padding:14px 16px 6px;font-size:10px;font-weight:700;color:${P.text};letter-spacing:1.5px;text-transform:uppercase}
.screen-sub{padding:0 16px 14px;font-size:11px;color:${P.textMuted};line-height:1.55}

.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:60px}
.feature-card{background:${P.surface};border-radius:16px;padding:28px;border:1px solid ${P.border}}
.feature-icon{width:36px;height:36px;border-radius:10px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:18px}
.feature-title{font-size:14px;font-weight:700;color:${P.text};margin-bottom:8px}
.feature-desc{font-size:12px;color:${P.textMuted};line-height:1.7}

.tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px;margin-top:32px}
.tokens-label{font-size:8px;font-weight:700;color:${P.textMuted};letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}
.tokens-pre{font-size:10px;line-height:1.9;color:${P.textMuted};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
.tokens-pre strong{color:${P.accent}}
.tokens-pre em{color:${P.jade};font-style:normal}

/* Waveform animation for screen thumbs */
.wave-bar{border-radius:2px;animation:wavePulse 1.8s ease-in-out infinite}
@keyframes wavePulse{0%,100%{opacity:0.3}50%{opacity:0.85}}

footer{border-top:1px solid ${P.border};padding:40px 60px;max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
footer p{font-size:11px;color:${P.textMuted}}
footer a{color:${P.accent};text-decoration:none}

@media(max-width:768px){
  .hero{padding:100px 24px 60px}
  section{padding:60px 24px}
  footer{padding:32px 24px;flex-direction:column;gap:16px;text-align:center}
  .screens-grid{grid-template-columns:1fr}
  .feature-grid{grid-template-columns:1fr}
  nav{padding:0 20px}
}
</style>
</head>
<body>
<div class="hero-bg-glow"></div>
<nav>
  <a href="#" class="nav-logo">CAST</a>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#features">Decisions</a></li>
    <li><a href="#tokens">Tokens</a></li>
    <li><a href="https://ram.zenbin.org/cast-viewer">Viewer</a></li>
  </ul>
  <span class="nav-tag">Dark Theme</span>
</nav>

<div class="hero">
  <p class="hero-eyebrow">RAM Design Studio &nbsp;·&nbsp; <span>Heartbeat</span> &nbsp;·&nbsp; Apr 2026</p>
  <h1 class="hero-title"><em>CA</em>ST</h1>
  <p class="hero-sub">${TAGLINE} Know your listeners, grow your audience, let AI do the heavy lifting.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/cast-viewer" class="btn-p">Open Viewer →</a>
    <a href="https://ram.zenbin.org/cast-mock" class="btn-mock">☀◑ Interactive Mock</a>
    <a href="#tokens" class="btn-s">Design Tokens</a>
  </div>
  <div class="meta-row">
    <div class="meta-item"><span>Theme</span><strong>Dark</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>Media Analytics</strong></div>
    <div class="meta-item"><span>Screens</span><strong>6</strong></div>
    <div class="meta-item"><span>Accent</span><strong>${P.accent}</strong></div>
    <div class="meta-item"><span>Inspired by</span><strong>Neon · Format</strong></div>
    <div class="meta-item"><span>Format</span><strong>Pencil v2.8</strong></div>
  </div>
</div>

<section id="screens">
  <div class="section-label">Screens — 6 of 6</div>
  <div class="screens-grid">
    ${[
      { name: 'Overview', sub: 'Total listens, subscriber growth, weekly bar chart, top episode, and AI nudge', color: P.accent },
      { name: 'Episodes', sub: 'Filterable episode list with waveform thumbnails, play counts, and sparklines', color: P.purple },
      { name: 'Audience', sub: 'Listener retention curve, platform donut chart, and top city bars', color: P.blue },
      { name: 'AI Insights', sub: 'Growth score, 4 AI assistant cards (folk-style grid), trending topics', color: P.amber },
      { name: 'Ep Detail', sub: 'Full waveform playhead, chapter list, retention vs avg, episode stats', color: P.jade },
      { name: 'Distribution', sub: 'Per-platform subscriber counts with growth badges and sparklines', color: P.accent },
    ].map((s, i) => {
      // Generate waveform bars as the thumbnail visual motif
      const heights = [30,50,80,60,90,70,40,60,85,50,30,70,95,60,40,80,55,70,45,90,60,35,75,50,80];
      const bars = heights.slice(0, 20).map((h, bi) => {
        const delay = (bi * 0.08).toFixed(2);
        const active = bi < Math.round(20 * 0.55);
        return `<div class="wave-bar" style="width:6px;height:${Math.round(h*1.8)}px;background:${active ? s.color : P.borderSub};border-radius:3px;animation-delay:${delay}s"></div>`;
      }).join('');
      return `
    <div class="screen-card">
      <div class="screen-thumb" style="border-bottom:2px solid ${s.color}40;align-items:flex-end">
        ${bars}
      </div>
      <div class="screen-name" style="color:${s.color}">${s.name}</div>
      <div class="screen-sub">${s.sub}</div>
    </div>`;
    }).join('')}
  </div>
</section>

<section id="features">
  <div class="section-label">Design Decisions</div>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.accentDim}">🎙</div>
      <div class="feature-title">Waveform as primary motif</div>
      <div class="feature-desc">Audio waveform bars appear in episode thumbnails, the full-screen detail player, and as micro-indicators in list items. Inspired by Neon.com's data-as-hero approach — the product's raw data becomes the visual identity. The phosphor teal played/grey unplayed split makes progress instantly readable without numbers.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(139,92,246,0.12)">✦</div>
      <div class="feature-title">Folk-style AI assistant cards</div>
      <div class="feature-desc">The AI Insights screen arranges four AI assistants (Release Timing, Title Optimizer, Clip Suggestion, Guest Matcher) in a 2×2 card grid — directly inspired by Folk.app's AI assistant grid from minimal.gallery. Each card has a unique accent color, icon, body, and a direct CTA. AI as modular, named collaborators rather than a monolithic chatbot.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(0,200,122,0.10)">◉</div>
      <div class="feature-title">Pure black + phosphor teal</div>
      <div class="feature-desc">Neon.com's signature aesthetic — pure near-black (#060609) with an electric phosphor teal (#00E0A0) accent — is directly adapted here. Developer infra tools pioneered this "premium dark" look; applying it to a podcast analytics product elevates the category and signals serious creator tooling rather than a casual dashboard.</div>
    </div>
  </div>
</section>

<section id="tokens">
  <div class="section-label">Design Tokens</div>
  <div class="tokens-block">
    <div class="tokens-label">Color System — CAST Dark</div>
    <pre class="tokens-pre"><strong>/* CAST Design Tokens — AI Podcast Analytics Platform */</strong>
<strong>/* Generated by RAM Design Studio — Apr 2026 */</strong>

:root {
  <em>/* Background Scale */</em>
  --cast-bg:           <strong>${P.bg}</strong>;        /* pure near-black base */
  --cast-surface:      <strong>${P.surface}</strong>;   /* card background */
  --cast-surface-alt:  <strong>${P.surfaceAlt}</strong>;/* elevated / thumbnail */

  <em>/* Text */</em>
  --cast-text:         <strong>${P.text}</strong>;     /* primary text */
  --cast-text-sub:     <strong>rgba(232,235,244,0.55)</strong>; /* secondary */
  --cast-text-muted:   <strong>rgba(232,235,244,0.28)</strong>; /* tertiary / labels */

  <em>/* Accent — Phosphor Teal (inspired by Neon.com) */</em>
  --cast-accent:       <strong>${P.accent}</strong>;   /* primary CTA, active states */
  --cast-accent-dim:   <strong>${P.accentDim}</strong>;/* dim background tint */
  --cast-accent-bdr:   <strong>${P.accentBdr}</strong>;/* accent border */

  <em>/* Data Colors */</em>
  --cast-jade:         <strong>${P.jade}</strong>;   /* subscriber growth */
  --cast-purple:       <strong>${P.purple}</strong>;  /* top episodes, Apple */
  --cast-blue:         <strong>${P.blue}</strong>;    /* Google, geography */
  --cast-amber:        <strong>${P.amber}</strong>;   /* AI insights, Other */

  <em>/* Borders */</em>
  --cast-border:       <strong>${P.border}</strong>;       /* accent-tinted border */
  --cast-border-sub:   <strong>${P.borderSub}</strong>;    /* hairline divider */
}
</pre>
  </div>
</section>

<footer>
  <p>${APP_NAME} &mdash; <a href="https://ram.zenbin.org">ram.zenbin.org</a> &mdash; RAM Design Studio</p>
  <p>Pencil.dev format v2.8 &nbsp;·&nbsp; <a href="https://ram.zenbin.org/cast-viewer">View in Pencil</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/cast-mock">Interactive Mock</a></p>
</footer>

</body>
</html>`;
}

// ── VIEWER HTML ────────────────────────────────────────────────────────────────
function buildViewer() {
  // Read the canonical viewer template
  const viewerPath = path.join(__dirname, 'viewer.html');
  if (!fs.existsSync(viewerPath)) throw new Error('viewer.html not found');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── GALLERY QUEUE ──────────────────────────────────────────────────────────────
async function updateGallery() {
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
  return { status: putRes.status, entry: newEntry };
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing CAST...\n');

  // 1. Hero
  process.stdout.write('  Hero page... ');
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, buildHero());
  console.log(heroRes.status === 200 ? 'OK' : `FAIL (${heroRes.status})`);

  // 2. Viewer
  process.stdout.write('  Viewer...    ');
  try {
    const viewerHtml = buildViewer();
    const viewerRes = await zenPut(`${SLUG}-viewer`, `${APP_NAME} — Pencil Viewer | RAM`, viewerHtml);
    console.log(viewerRes.status === 200 ? 'OK' : `FAIL (${viewerRes.status})`);
  } catch (e) {
    console.log('SKIP (viewer.html not found)');
  }

  // 3. Gallery
  process.stdout.write('  Gallery...   ');
  try {
    const galleryRes = await updateGallery();
    console.log(galleryRes.status === 200 ? 'OK' : `FAIL (${galleryRes.status})`);
  } catch (e) {
    console.log('FAIL:', e.message);
  }

  console.log('\nURLs:');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
