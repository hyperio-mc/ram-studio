'use strict';
// aeon-publish.js — Full Design Discovery pipeline for AEON
// AEON — Persistent memory inspector for production AI agents
// Theme: DARK  · Slug: aeon

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'aeon';
const APP_NAME  = 'AEON';
const TAGLINE   = 'Persistent memory for production AI agents.';
const ARCHETYPE = 'ai-devtools';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'AI agent memory inspector — dark, data-dense. Inspired by Letta (persistent agents) on minimal.gallery + Linear dense dark UI on darkmodedesign.com.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'aeon.pen'), 'utf8');

// ── HTTP util ────────────────────────────────────────────────────────────────
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

// ── PALETTE ───────────────────────────────────────────────────────────────────
const P = {
  bg:         '#08090E',
  surface:    '#0F1118',
  surfaceAlt: '#161926',
  border:     'rgba(88,101,244,0.14)',
  text:       '#D2D8F0',
  textMuted:  'rgba(210,216,240,0.38)',
  accent:     '#5865F4',
  accentDim:  'rgba(88,101,244,0.14)',
  cyan:       '#22D3C8',
  cyanDim:    'rgba(34,211,200,0.12)',
  green:      '#34D399',
  greenDim:   'rgba(52,211,153,0.12)',
  amber:      '#F59E0B',
  amberDim:   'rgba(245,158,11,0.12)',
  red:        '#F43F5E',
  redDim:     'rgba(244,63,94,0.12)',
  white:      '#FFFFFF',
};

// ── HERO PAGE ────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AEON — ${TAGLINE} | RAM Design Studio</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:-apple-system,'Inter',system-ui,sans-serif}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;
  background:rgba(8,9,14,0.88);
  backdrop-filter:blur(14px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-size:14px;font-weight:800;color:${P.accent};letter-spacing:3px;text-decoration:none;text-transform:uppercase}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;transition:color 0.2s}
.nav-links a:hover{color:${P.text}}
.nav-tag{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${P.cyan};background:${P.cyanDim};border:1px solid rgba(34,211,200,0.25);padding:5px 12px;border-radius:20px}

.hero{
  min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  padding:120px 60px 80px;max-width:1200px;margin:0 auto;
}
.hero-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;color:${P.textMuted};text-transform:uppercase;margin-bottom:28px}
.hero-eyebrow span{color:${P.accent}}
.hero-title{font-size:clamp(72px,12vw,140px);font-weight:900;line-height:0.92;letter-spacing:-4px;color:${P.text};margin-bottom:24px}
.hero-title em{color:${P.accent};font-style:normal}
.hero-sub{font-size:18px;color:${P.textMuted};max-width:520px;line-height:1.65;margin-bottom:48px}
.hero-actions{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:72px}
.btn-p{background:${P.accent};color:#fff;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;transition:opacity 0.2s;letter-spacing:0.3px}
.btn-p:hover{opacity:0.85}
.btn-s{background:${P.surfaceAlt};color:${P.text};padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid rgba(210,216,240,0.1);transition:border-color 0.2s}
.btn-s:hover{border-color:${P.accent}}
.btn-mock{background:${P.accentDim};color:${P.accent};padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;border:1px solid rgba(88,101,244,0.28);transition:opacity 0.2s}
.btn-mock:hover{opacity:0.8}

.meta-row{display:flex;gap:40px;flex-wrap:wrap;border-top:1px solid ${P.border};padding-top:40px}
.meta-item span{display:block;font-size:9px;color:${P.textMuted};letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-weight:600}
.meta-item strong{color:${P.text};font-size:13px;font-weight:700;font-family:'SF Mono','Fira Code',monospace}

section{max-width:1200px;margin:0 auto;padding:80px 60px}
.section-label{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${P.textMuted};margin-bottom:32px;padding-bottom:14px;border-bottom:1px solid ${P.border}}

.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px;margin-bottom:60px}
.screen-card{background:${P.surface};border-radius:16px;overflow:hidden;border:1px solid ${P.border};transition:border-color 0.2s;cursor:default}
.screen-card:hover{border-color:${P.accent}}
.screen-thumb{background:${P.surfaceAlt};height:180px;display:flex;align-items:center;justify-content:center;position:relative}
.screen-dot{width:8px;height:8px;border-radius:4px;background:${P.accent};opacity:0.35}
.screen-name{padding:14px 16px 10px;font-size:10px;font-weight:700;color:${P.text};letter-spacing:1.5px;text-transform:uppercase}
.screen-sub{padding:0 16px 14px;font-size:10px;color:${P.textMuted};line-height:1.5}

.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:60px}
.feature-card{background:${P.surface};border-radius:16px;padding:28px;border:1px solid ${P.border}}
.feature-icon{width:36px;height:36px;border-radius:10px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:18px}
.feature-title{font-size:14px;font-weight:700;color:${P.text};margin-bottom:8px}
.feature-desc{font-size:12px;color:${P.textMuted};line-height:1.7}

.tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px;margin-top:32px;position:relative}
.tokens-label{font-size:8px;font-weight:700;color:${P.textMuted};letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}
.tokens-pre{font-size:10px;line-height:1.9;color:${P.textMuted};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
.tokens-pre strong{color:${P.accent}}
.tokens-pre em{color:${P.cyan};font-style:normal}

footer{border-top:1px solid ${P.border};padding:40px 60px;max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
footer p{font-size:11px;color:${P.textMuted}}
footer a{color:${P.accent};text-decoration:none}

@media(max-width:768px){
  .hero{padding:100px 24px 60px}
  section{padding:60px 24px}
  footer{padding:32px 24px;flex-direction:column;gap:16px;text-align:center}
  .screens-grid{grid-template-columns:repeat(2,1fr)}
  .feature-grid{grid-template-columns:1fr}
  nav{padding:0 20px}
}
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">AEON</a>
  <ul class="nav-links">
    <li><a href="#screens">Screens</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#tokens">Tokens</a></li>
    <li><a href="https://ram.zenbin.org/aeon-viewer">Viewer</a></li>
  </ul>
  <span class="nav-tag">Dark Theme</span>
</nav>

<div class="hero">
  <p class="hero-eyebrow">RAM Design Studio &nbsp;·&nbsp; <span>Heartbeat 032</span> &nbsp;·&nbsp; Mar 2026</p>
  <h1 class="hero-title"><em>AE</em>ON</h1>
  <p class="hero-sub">${TAGLINE} Inspect, inject, and audit every memory fragment your agents carry in production.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/aeon-viewer" class="btn-p">Open Viewer →</a>
    <a href="https://ram.zenbin.org/aeon-mock" class="btn-mock">☀◑ Interactive Mock</a>
    <a href="#tokens" class="btn-s">Design Tokens</a>
  </div>
  <div class="meta-row">
    <div class="meta-item"><span>Theme</span><strong>Dark</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>AI DevTools</strong></div>
    <div class="meta-item"><span>Screens</span><strong>5</strong></div>
    <div class="meta-item"><span>Accent</span><strong>${P.accent}</strong></div>
    <div class="meta-item"><span>Inspired by</span><strong>Letta · Linear</strong></div>
    <div class="meta-item"><span>Format</span><strong>Pencil v2.8</strong></div>
  </div>
</div>

<section id="screens">
  <div class="section-label">Screens — 5 of 5</div>
  <div class="screens-grid">
    ${[
      { name: 'Agents', sub: 'Fleet overview with memory usage bars and health status per agent', color: P.cyan },
      { name: 'Memory', sub: 'Fragment browser — persona, context, learning, and preference blocks', color: P.accent },
      { name: 'Activity', sub: 'Live timeline of reads, writes, injections, and error events', color: P.green },
      { name: 'Health', sub: 'System-wide metrics grid, per-agent health table, uptime scores', color: P.amber },
      { name: 'Inject', sub: 'Manual context injection form with type selector and TTL control', color: P.textMuted },
    ].map(s => `
    <div class="screen-card">
      <div class="screen-thumb" style="border-bottom:2px solid ${s.color}40">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:20px">
          ${Array.from({length:16}).map((_,i)=>`<div style="height:${6+Math.random()*14}px;background:${s.color};opacity:${0.1+Math.random()*0.4};border-radius:3px"></div>`).join('')}
        </div>
      </div>
      <div class="screen-name" style="color:${s.color}">${s.name}</div>
      <div class="screen-sub">${s.sub}</div>
    </div>`).join('')}
  </div>
</section>

<section id="features">
  <div class="section-label">Design Decisions</div>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.accentDim}">🧠</div>
      <div class="feature-title">Memory fragment taxonomy</div>
      <div class="feature-desc">Four distinct fragment types — Persona, Context, Learning, Preference — each with a unique accent color and left-border stripe. Inspired by Letta's typed memory blocks, this creates instant visual hierarchy without labels cluttering the scan.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.cyanDim}">📡</div>
      <div class="feature-title">Live activity timeline</div>
      <div class="feature-desc">A dot-and-line timeline pattern borrowed from Linear's issue history view (darkmodedesign.com). Each event is typed (WRITE / READ / INJECT / PRUNE / ERROR) with monospace timestamps — treating memory operations like git commits.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.greenDim}">📊</div>
      <div class="feature-title">Token-based memory bars</div>
      <div class="feature-desc">Context window consumption shown as thin horizontal progress bars (4px height) directly under each agent name — a subtle but information-dense choice. The bar fill color mirrors the agent's status color, making health scannable at glance.</div>
    </div>
  </div>
</section>

<section id="tokens">
  <div class="section-label">Design Tokens</div>
  <div class="tokens-block">
    <div class="tokens-label">Color System — AEON Dark</div>
    <pre class="tokens-pre"><strong>/* AEON Design Tokens — AI Agent Memory Inspector */</strong>
<strong>/* Generated by RAM Design Studio — Mar 2026 */</strong>

:root {
  <em>/* Background Scale */</em>
  --aeon-bg:          <strong>${P.bg}</strong>;        /* true dark base */
  --aeon-surface:     <strong>${P.surface}</strong>;   /* card background */
  --aeon-surface-alt: <strong>${P.surfaceAlt}</strong>;/* elevated surface */

  <em>/* Text */</em>
  --aeon-text:        <strong>${P.text}</strong>;     /* primary text */
  --aeon-text-muted:  <strong>${P.textMuted}</strong>;/* secondary text */

  <em>/* Accent — Indigo */</em>
  --aeon-accent:      <strong>${P.accent}</strong>;   /* primary CTA, links */
  --aeon-accent-dim:  <strong>${P.accentDim}</strong>;/* dim background */

  <em>/* Data Colors */</em>
  --aeon-cyan:        <strong>${P.cyan}</strong>;   /* active/persona */
  --aeon-cyan-dim:    <strong>${P.cyanDim}</strong>; /* cyan bg */
  --aeon-green:       <strong>${P.green}</strong>;   /* healthy/success */
  --aeon-green-dim:   <strong>${P.greenDim}</strong>;/* green bg */
  --aeon-amber:       <strong>${P.amber}</strong>;   /* idle/warning */
  --aeon-amber-dim:   <strong>${P.amberDim}</strong>;/* amber bg */
  --aeon-red:         <strong>${P.red}</strong>;     /* error/critical */
  --aeon-red-dim:     <strong>${P.redDim}</strong>;  /* red bg */

  <em>/* Borders */</em>
  --aeon-border:      <strong>rgba(88,101,244,0.14)</strong>; /* subtle accent border */
  --aeon-border-sub:  <strong>rgba(210,216,240,0.07)</strong>;/* hair-line divider */
}
</pre>
  </div>
</section>

<footer>
  <p>AEON &mdash; <a href="https://ram.zenbin.org">ram.zenbin.org</a> &mdash; RAM Design Studio</p>
  <p>Pencil.dev format v2.8 &nbsp;·&nbsp; <a href="https://ram.zenbin.org/aeon-viewer">View in Pencil</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/aeon-mock">Interactive Mock</a></p>
</footer>

</body>
</html>`;
}

// ── VIEWER HTML ──────────────────────────────────────────────────────────────
function buildViewer() {
  const penJsonStr = JSON.stringify(penJson);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AEON — Pen Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#08090E;color:#D2D8F0;font-family:-apple-system,'Inter',system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px}
h1{font-size:14px;font-weight:800;letter-spacing:3px;color:#5865F4;text-transform:uppercase;margin-bottom:8px}
p{font-size:12px;color:rgba(210,216,240,0.4);margin-bottom:32px}
a{color:#5865F4;font-size:13px;font-weight:600;text-decoration:none;background:rgba(88,101,244,0.12);padding:10px 24px;border-radius:10px;border:1px solid rgba(88,101,244,0.28)}
a:hover{opacity:0.85}
</style>
<script>window.EMBEDDED_PEN = ${penJsonStr};</script>
</head>
<body>
<h1>AEON</h1>
<p>Persistent memory inspector for production AI agents</p>
<a href="https://ram.zenbin.org/aeon">← Back to Hero Page</a>
<script>
// Pencil.dev viewer will pick up window.EMBEDDED_PEN automatically
console.log('AEON pen loaded:', typeof window.EMBEDDED_PEN);
</script>
</body>
</html>`;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing AEON...\n');

  // a) Hero page
  const heroRes = await zenPut(SLUG, `AEON — ${TAGLINE}`, buildHero());
  console.log(`Hero (${SLUG}): ${heroRes.status === 200 ? '✓ OK' : heroRes.body.slice(0,80)}`);

  // b) Viewer
  const viewerRes = await zenPut(`${SLUG}-viewer`, `AEON Viewer`, buildViewer());
  console.log(`Viewer (${SLUG}-viewer): ${viewerRes.status === 200 ? '✓ OK' : viewerRes.body.slice(0,80)}`);

  // d) GitHub queue
  console.log('\nUpdating GitHub gallery queue...');
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
    screens: 5,
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
  console.log(`Gallery queue: ${putRes.status === 200 ? '✓ OK' : putRes.body.slice(0, 100)}`);

  console.log('\n✓ AEON published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock (build next)`);
})();
