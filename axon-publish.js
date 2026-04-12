'use strict';
// axon-publish.js — Full Design Discovery pipeline for AXON
// AXON — AI Workflow Router
// Theme: DARK  · Slug: axon

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'axon';
const APP_NAME  = 'Axon';
const TAGLINE   = 'Route your AI workflows';
const ARCHETYPE = 'ai-automation';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'AI workflow router mobile app — dark. Inspired by Codegen.com (OS for Code Agents) on darkmodedesign.com: deep near-black #13 13 15 bg, integration badge UX, neon teal accent, developer pipeline node layout.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'axon.pen'), 'utf8');

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
  bg:         '#0D0E12',
  surface:    '#13151C',
  surface2:   '#1A1D27',
  border:     '#252836',
  borderAlpha:'rgba(37,40,54,0.8)',
  text:       '#F0F1F5',
  textMuted:  'rgba(240,241,245,0.45)',
  accent:     '#00D4AA',
  accentDim:  'rgba(0,212,170,0.12)',
  violet:     '#7B61FF',
  violetDim:  'rgba(123,97,255,0.12)',
  danger:     '#FF4B6E',
  dangerDim:  'rgba(255,75,110,0.12)',
};

function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Axon — ${TAGLINE} | RAM Design Studio</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:-apple-system,'Inter',system-ui,sans-serif}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;
  background:rgba(13,14,18,0.9);
  backdrop-filter:blur(16px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-size:14px;font-weight:900;color:${P.accent};letter-spacing:4px;text-decoration:none;text-transform:uppercase}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;transition:color 0.2s}
.nav-links a:hover{color:${P.text}}
.nav-tag{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${P.accent};background:${P.accentDim};border:1px solid rgba(0,212,170,0.25);padding:5px 12px;border-radius:20px}

.hero{
  min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  padding:120px 60px 80px;max-width:1200px;margin:0 auto;
  position:relative;
}

/* Subtle grid bg */
.hero::before{
  content:'';position:absolute;inset:0;
  background-image:linear-gradient(rgba(0,212,170,0.03) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(0,212,170,0.03) 1px,transparent 1px);
  background-size:48px 48px;
  pointer-events:none;
}

.hero-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;color:${P.textMuted};text-transform:uppercase;margin-bottom:28px;position:relative}
.hero-eyebrow span{color:${P.accent}}
.hero-title{font-size:clamp(80px,12vw,148px);font-weight:900;line-height:0.9;letter-spacing:-5px;color:${P.text};margin-bottom:24px;position:relative}
.hero-title em{color:${P.accent};font-style:normal}
.hero-sub{font-size:18px;color:${P.textMuted};max-width:540px;line-height:1.65;margin-bottom:48px;position:relative}

/* Live indicator pill */
.live-pill{display:inline-flex;align-items:center;gap:8px;background:${P.accentDim};border:1px solid rgba(0,212,170,0.25);border-radius:20px;padding:6px 14px;font-size:11px;font-weight:700;color:${P.accent};letter-spacing:1px;text-transform:uppercase;margin-bottom:32px;position:relative}
.live-dot{width:6px;height:6px;border-radius:3px;background:${P.accent};animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}

.hero-actions{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:72px;position:relative}
.btn-p{background:${P.accent};color:#0D0E12;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;transition:opacity 0.2s;letter-spacing:0.3px}
.btn-p:hover{opacity:0.85}
.btn-s{background:${P.surface2};color:${P.text};padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid ${P.border};transition:border-color 0.2s}
.btn-s:hover{border-color:${P.accent}}
.btn-mock{background:${P.accentDim};color:${P.accent};padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;border:1px solid rgba(0,212,170,0.28);transition:opacity 0.2s}
.btn-mock:hover{opacity:0.8}

.meta-row{display:flex;gap:40px;flex-wrap:wrap;border-top:1px solid ${P.border};padding-top:40px;position:relative}
.meta-item span{display:block;font-size:9px;color:${P.textMuted};letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-weight:600}
.meta-item strong{color:${P.text};font-size:13px;font-weight:700;font-family:'SF Mono','Fira Code',monospace}

section{max-width:1200px;margin:0 auto;padding:80px 60px}
.section-label{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${P.textMuted};margin-bottom:32px;padding-bottom:14px;border-bottom:1px solid ${P.border}}

/* Workflow showcase */
.workflow-demo{background:${P.surface};border:1px solid ${P.border};border-radius:20px;padding:32px;margin-bottom:40px;overflow:hidden}
.wf-title{font-size:13px;font-weight:700;color:${P.text};margin-bottom:6px}
.wf-sub{font-size:11px;color:${P.textMuted};margin-bottom:28px}
.wf-nodes{display:flex;align-items:center;gap:0;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}
.wf-node{flex-shrink:0;background:${P.surface2};border:1px solid ${P.border};border-radius:12px;padding:14px 18px;min-width:110px;text-align:center;transition:border-color 0.2s}
.wf-node:hover{border-color:${P.accent}}
.wf-node.active{border-color:${P.accent};background:rgba(0,212,170,0.06)}
.wf-node-icon{font-size:20px;margin-bottom:6px}
.wf-node-name{font-size:11px;font-weight:700;color:${P.text}}
.wf-node-status{font-size:9px;color:${P.textMuted};margin-top:2px;text-transform:uppercase;letter-spacing:1px}
.wf-node.active .wf-node-status{color:${P.accent}}
.wf-arrow{flex-shrink:0;padding:0 10px;color:${P.textMuted};font-size:16px}
.wf-arrow.active{color:${P.accent}}

.screens-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px;margin-bottom:60px}
.screen-card{background:${P.surface};border-radius:16px;overflow:hidden;border:1px solid ${P.border};transition:border-color 0.25s;cursor:default}
.screen-card:hover{border-color:${P.accent}}
.screen-thumb{height:180px;display:flex;align-items:flex-start;padding:16px;flex-direction:column;gap:6px;position:relative;overflow:hidden}
.screen-thumb::after{content:'';position:absolute;bottom:0;left:0;right:0;height:40px;background:linear-gradient(transparent,${P.surface})}
.mini-row{display:flex;gap:6px;width:100%}
.mini-block{border-radius:4px;flex:1}
.screen-name{padding:12px 16px 4px;font-size:10px;font-weight:700;color:${P.text};letter-spacing:1.5px;text-transform:uppercase}
.screen-sub{padding:0 16px 14px;font-size:10px;color:${P.textMuted};line-height:1.5}

.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:60px}
.feature-card{background:${P.surface};border-radius:16px;padding:28px;border:1px solid ${P.border}}
.feature-icon{width:40px;height:40px;border-radius:10px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800}
.feature-title{font-size:14px;font-weight:700;color:${P.text};margin-bottom:8px}
.feature-desc{font-size:12px;color:${P.textMuted};line-height:1.7}

.integration-grid{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}
.int-badge{display:flex;align-items:center;gap:8px;background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:10px 16px;font-size:12px;font-weight:600;color:${P.text};transition:border-color 0.2s}
.int-badge:hover{border-color:${P.accent}}
.int-dot{width:8px;height:8px;border-radius:4px}

.tokens-block{background:${P.surface};border:1px solid ${P.border};border-radius:12px;padding:24px;margin-top:32px}
.tokens-label{font-size:8px;font-weight:700;color:${P.textMuted};letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}
.tokens-pre{font-size:10px;line-height:1.9;color:${P.textMuted};white-space:pre;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}
.tokens-pre strong{color:${P.accent}}
.tokens-pre em{color:${P.violet};font-style:normal}

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
  .hero-title{letter-spacing:-3px}
}
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-logo">AXON</a>
  <ul class="nav-links">
    <li><a href="#demo">Pipeline</a></li>
    <li><a href="#screens">Screens</a></li>
    <li><a href="#features">Decisions</a></li>
    <li><a href="https://ram.zenbin.org/axon-viewer">Viewer</a></li>
  </ul>
  <span class="nav-tag">Dark Theme</span>
</nav>

<div class="hero">
  <p class="hero-eyebrow">RAM Design Studio &nbsp;·&nbsp; <span>Heartbeat</span> &nbsp;·&nbsp; Mar 2026</p>
  <div class="live-pill"><span class="live-dot"></span> 3 workflows running</div>
  <h1 class="hero-title"><em>AX</em>ON</h1>
  <p class="hero-sub">${TAGLINE}. Orchestrate multi-step AI pipelines across GitHub, Claude, Linear, Slack — from your phone.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/axon-viewer" class="btn-p">Open Viewer →</a>
    <a href="https://ram.zenbin.org/axon-mock" class="btn-mock">☀◑ Interactive Mock</a>
    <a href="#features" class="btn-s">Design Decisions</a>
  </div>
  <div class="meta-row">
    <div class="meta-item"><span>Theme</span><strong>Dark</strong></div>
    <div class="meta-item"><span>Archetype</span><strong>AI Automation</strong></div>
    <div class="meta-item"><span>Screens</span><strong>5</strong></div>
    <div class="meta-item"><span>Accent</span><strong>#00D4AA</strong></div>
    <div class="meta-item"><span>Inspired by</span><strong>Codegen.com</strong></div>
    <div class="meta-item"><span>Format</span><strong>Pencil v2.8</strong></div>
  </div>
</div>

<section id="demo">
  <div class="section-label">Live Pipeline Demo</div>
  <div class="workflow-demo">
    <div class="wf-title">PR Review Assistant</div>
    <div class="wf-sub">github → claude → linear &nbsp;·&nbsp; Step 2/3 running</div>
    <div class="wf-nodes">
      <div class="wf-node">
        <div class="wf-node-icon">📡</div>
        <div class="wf-node-name">GitHub</div>
        <div class="wf-node-status">✓ done</div>
      </div>
      <div class="wf-arrow active">→</div>
      <div class="wf-node active">
        <div class="wf-node-icon">🧠</div>
        <div class="wf-node-name">Claude 3.5</div>
        <div class="wf-node-status">running…</div>
      </div>
      <div class="wf-arrow">→</div>
      <div class="wf-node">
        <div class="wf-node-icon">📋</div>
        <div class="wf-node-name">Linear</div>
        <div class="wf-node-status">pending</div>
      </div>
    </div>
  </div>
  <div style="margin-top:24px">
    <div class="section-label">Connected Integrations</div>
    <div class="integration-grid">
      ${[
        { name:'GitHub', color:'#E8E8E8' },
        { name:'Slack', color:'#E01E5A' },
        { name:'Claude 3.5', color:'#CC9B7A' },
        { name:'Linear', color:'#5E6AD2' },
        { name:'Notion', color:'#F0F0F0' },
        { name:'Sentry', color:'#7D4CDB' },
        { name:'Jira', color:'#0052CC' },
        { name:'GPT-4', color:'#10A37F' },
      ].map(i => `<div class="int-badge"><span class="int-dot" style="background:${i.color}"></span>${i.name}</div>`).join('')}
    </div>
  </div>
</section>

<section id="screens">
  <div class="section-label">Screens — 5 of 5</div>
  <div class="screens-grid">
    ${[
      { name:'Dashboard', sub:'Active workflows with live status, step chips, and quick stats', color: P.accent, rows: [[40,60,80],[30,50,70,40],[60,30]] },
      { name:'Workflow Detail', sub:'Node graph pipeline view with live streamed AI output', color: P.accent, rows: [[80,80,80],[60,80,100],[30,40,60,50]] },
      { name:'Integrations', sub:'2-col grid of connected tools with color-coded tops', color: P.violet, rows: [[50,50],[50,50],[50,50],[50,50]] },
      { name:'Build Workflow', sub:'Step-by-step builder with AI suggestions and dashed add-step', color: P.accent, rows: [[90],[70],[70],[70],[60]] },
      { name:'Activity Feed', sub:'Timeline of workflow events with dot-and-line connector', color: P.accent, rows: [[80,40],[80,40],[80,40],[80,40]] },
    ].map(s => {
      const blocks = s.rows.map(row =>
        `<div class="mini-row">${row.map(w => `<div class="mini-block" style="height:${w > 60 ? 10 : 6}px;background:${s.color};opacity:${w/200 + 0.1};flex:${w}"></div>`).join('')}</div>`
      ).join('');
      return `<div class="screen-card">
        <div class="screen-thumb" style="background:${P.surface2};border-bottom:2px solid ${s.color}30">
          ${blocks}
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
      <div class="feature-icon" style="background:${P.accentDim};color:${P.accent}">◈</div>
      <div class="feature-title">Left-border status stripe on cards</div>
      <div class="feature-desc">Each workflow card uses a 3px left-border in the state's status color — teal for running, violet for queued, red for failed. Inspired by Linear's issue status indicator pattern seen on darkmodedesign.com. Provides instant state scanning without reading any text.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.violetDim};color:${P.violet}">⊞</div>
      <div class="feature-title">Pipeline node graph on mobile</div>
      <div class="feature-desc">Horizontal node-and-arrow layout translates Codegen's integration badge UX into a mobile workflow detail. Completed nodes show solid teal borders; the active node uses a glow fill; pending nodes stay muted. A blinking cursor in the AI output card hints at live streaming.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.accentDim};color:${P.accent}">◉</div>
      <div class="feature-title">Electric teal on near-black deep dark</div>
      <div class="feature-desc">Codegen uses #13 13 15 (240 5% 8%) — almost identical to AXON's #0D0E12. The #00D4AA teal reads as "neural signal green" against the deep charcoal: high contrast without feeling harsh. The violet secondary (#7B61FF) provides a cooler counterpoint for queued/pending states.</div>
    </div>
  </div>
</section>

<section id="tokens">
  <div class="section-label">Design Tokens</div>
  <div class="tokens-block">
    <div class="tokens-label">Color System — AXON Dark</div>
    <pre class="tokens-pre"><strong>/* AXON Design Tokens — AI Workflow Router */</strong>
<strong>/* Generated by RAM Design Studio — Mar 2026 */</strong>

:root {
  <em>/* Background Scale */</em>
  --axon-bg:          <strong>${P.bg}</strong>;        /* deep near-black base */
  --axon-surface:     <strong>${P.surface}</strong>;   /* card background */
  --axon-surface-2:   <strong>${P.surface2}</strong>;  /* elevated / header bg */
  --axon-border:      <strong>${P.border}</strong>;    /* card border */

  <em>/* Text */</em>
  --axon-text:        <strong>${P.text}</strong>;     /* primary text */
  --axon-text-muted:  <strong>${P.textMuted}</strong>;/* secondary / labels */

  <em>/* Accent — Electric Teal */</em>
  --axon-accent:      <strong>${P.accent}</strong>;   /* running state, CTA, active */
  --axon-accent-dim:  <strong>${P.accentDim}</strong>;/* accent background fills */

  <em>/* Secondary — Violet */</em>
  --axon-violet:      <strong>${P.violet}</strong>;   /* queued state, secondary actions */
  --axon-violet-dim:  <strong>${P.violetDim}</strong>;/* violet bg fills */

  <em>/* Semantic */</em>
  --axon-danger:      <strong>${P.danger}</strong>;   /* failed state, errors */
  --axon-danger-dim:  <strong>${P.dangerDim}</strong>;/* danger bg fills */
}
</pre>
  </div>
</section>

<footer>
  <p>Axon &mdash; <a href="https://ram.zenbin.org">ram.zenbin.org</a> &mdash; RAM Design Studio</p>
  <p>Pencil.dev format v2.8 &nbsp;·&nbsp; <a href="https://ram.zenbin.org/axon-viewer">View in Pencil</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/axon-mock">Interactive Mock</a></p>
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
<title>Axon — Pen Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0E12;color:#F0F1F5;font-family:-apple-system,'Inter',system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px}
h1{font-size:14px;font-weight:900;letter-spacing:4px;color:#00D4AA;text-transform:uppercase;margin-bottom:8px}
p{font-size:12px;color:rgba(240,241,245,0.4);margin-bottom:32px}
.links{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
a{color:#00D4AA;font-size:13px;font-weight:600;text-decoration:none;background:rgba(0,212,170,0.1);padding:10px 24px;border-radius:10px;border:1px solid rgba(0,212,170,0.25)}
a:hover{opacity:0.85}
</style>
<script>window.EMBEDDED_PEN = ${penJsonStr};</script>
</head>
<body>
<h1>AXON</h1>
<p>AI Workflow Router — 5 screens</p>
<div class="links">
  <a href="https://ram.zenbin.org/axon">← Hero Page</a>
  <a href="https://ram.zenbin.org/axon-mock">Interactive Mock</a>
</div>
<script>
console.log('AXON pen loaded — screens:', window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN).screens.length : 0);
</script>
</body>
</html>`;
}

(async () => {
  console.log('Publishing AXON...\n');

  const heroRes = await zenPut(SLUG, `Axon — ${TAGLINE}`, buildHero());
  console.log(`Hero (${SLUG}): ${heroRes.status === 200 ? '✓ OK' : heroRes.body.slice(0,80)}`);

  const viewerRes = await zenPut(`${SLUG}-viewer`, `Axon Viewer`, buildViewer());
  console.log(`Viewer (${SLUG}-viewer): ${viewerRes.status === 200 ? '✓ OK' : viewerRes.body.slice(0,80)}`);

  // GitHub queue
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

  console.log('\n✓ AXON published!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
