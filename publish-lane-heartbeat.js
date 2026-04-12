'use strict';
// publish-lane-heartbeat.js — Full Design Discovery pipeline for LANE heartbeat

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'lane';
const VIEWER_SLUG = 'lane-viewer';
const APP_NAME    = 'LANE';

const meta = {
  appName:   'LANE',
  tagline:   'AI workflow builder & run scheduler for production agent pipelines.',
  archetype: 'developer-tools',
  palette: {
    bg:      '#F4F2ED',
    surface: '#FFFFFF',
    text:    '#1B1916',
    accent:  '#C94A14',
    accent2: '#1E40AF',
    green:   '#166534',
    muted:   '#9A9690',
  },
};

const ORIGINAL_PROMPT = `Design LANE — a light-themed AI workflow builder & run scheduler. Inspired by:
1. Land-book.com — LangChain "Observe, Evaluate, and Deploy Reliable AI Agents" + Runlayer "Enterprise MCPs, Skills & Agents" + Sanity "Content Operating System for the AI era" — the gap between raw LLM APIs and production orchestration.
2. Awwwards.com — warm orange #FA5D29 accent, Inter Tight typography, generous gutters, rounded corners as standard, container query responsiveness.
3. Minimal.gallery — editorial black/white restraint adapted as warm off-white (#F4F2ED) ground.
Light palette: off-white #F4F2ED + burnt sienna #C94A14 + cobalt #1E40AF + forest green #166534
5 screens: Lanes overview · Pipeline Builder · Run Log · Analytics · Team & Settings`;

const prd = {
  screenNames: ['Lanes', 'Builder', 'Runs', 'Analytics', 'Team'],
  markdown: `## Overview
LANE is a production-grade AI workflow orchestration tool built for developer teams. Teams define reusable "lanes" — pipeline templates that chain together LLM calls, tool invocations, and validation steps — then schedule, run, and monitor them at scale.

## Design Philosophy
The light theme uses a warm off-white ground (#F4F2ED) that avoids the sterile coldness of pure white. Cards float on the surface with subtle borders rather than harsh shadows. The single accent — burnt sienna #C94A14 (cooled from Awwwards' signature #FA5D29) — handles all active states, CTAs, and "now" indicators without competing with semantic colors (green for success, red for error, cobalt for information).

**Inspired by:**
- LangChain & Runlayer on land-book.com — the AI agent orchestration space exploded but visual tooling lags behind; LANE is what the category deserves
- Awwwards editorial system — warm accent, generous gutters, cards-not-tables
- Minimal.gallery restraint — off-white as luxury paper, not bleached lab wall

## Target Users
- Backend engineers building production LLM pipelines
- ML teams evaluating multi-step agent workflows
- DevOps engineers monitoring AI run health and costs

## Core Features
- **Lanes** — reusable pipeline templates with health metrics and sparklines
- **Builder** — visual DAG editor showing step inputs/outputs, model badges, type annotations (LLM / TOOL / OUTPUT)
- **Runs** — live run log with status, latency, token usage per run
- **Analytics** — weekly success rate + cost charts, lane performance table
- **Team** — member roles, API key management, integration status`,
};

const sub = {
  id:           `heartbeat-lane-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

// ── HTTP helpers ─────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
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

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const res = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
  return res;
}

// ── Hero HTML ────────────────────────────────────────────────────────────────
function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LANE — AI Workflow Builder & Run Scheduler</title>
<style>
  :root {
    --bg:      #F4F2ED;
    --surface: #FFFFFF;
    --text:    #1B1916;
    --textDim: #504D48;
    --muted:   #9A9690;
    --accent:  #C94A14;
    --accent2: #1E40AF;
    --green:   #166534;
    --border:  #E6E2D8;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Inter','Helvetica Neue',sans-serif; min-height:100vh; }

  /* Nav */
  nav { display:flex; align-items:center; justify-content:space-between; padding:20px 40px; background:var(--surface); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100; }
  .logo { font-size:18px; font-weight:900; letter-spacing:2px; color:var(--text); }
  .logo span { color:var(--accent); }
  .nav-links { display:flex; gap:32px; }
  .nav-links a { font-size:13px; color:var(--muted); text-decoration:none; font-weight:500; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta { background:var(--accent); color:#fff; border:none; padding:10px 22px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; letter-spacing:0.3px; }

  /* Hero */
  .hero { max-width:960px; margin:0 auto; padding:100px 40px 60px; text-align:center; }
  .hero-badge { display:inline-flex; align-items:center; gap:8px; background:var(--accent)18; border:1px solid var(--accent)35; color:var(--accent); border-radius:20px; padding:6px 16px; font-size:11px; font-weight:700; letter-spacing:0.8px; margin-bottom:32px; }
  .hero-badge .dot { width:6px; height:6px; background:var(--accent); border-radius:50%; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  h1 { font-size:clamp(40px,6vw,72px); font-weight:900; line-height:1.05; letter-spacing:-2px; color:var(--text); margin-bottom:24px; }
  h1 em { color:var(--accent); font-style:normal; }
  .hero-sub { font-size:17px; color:var(--textDim); max-width:560px; margin:0 auto 44px; line-height:1.65; }
  .hero-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:64px; }
  .btn-primary { background:var(--accent); color:#fff; border:none; padding:14px 32px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; text-decoration:none; }
  .btn-secondary { background:var(--surface); color:var(--text); border:1px solid var(--border); padding:14px 32px; border-radius:10px; font-size:14px; font-weight:600; text-decoration:none; }

  /* Stats */
  .stats { display:flex; justify-content:center; gap:60px; flex-wrap:wrap; padding:40px; border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:var(--surface); }
  .stat { text-align:center; }
  .stat-value { font-size:32px; font-weight:900; color:var(--text); letter-spacing:-1px; }
  .stat-value span { color:var(--accent); }
  .stat-label { font-size:11px; color:var(--muted); font-weight:600; letter-spacing:1px; margin-top:4px; text-transform:uppercase; }

  /* Features */
  .features { max-width:960px; margin:80px auto; padding:0 40px; }
  .section-label { font-size:11px; font-weight:700; letter-spacing:2px; color:var(--accent); text-transform:uppercase; margin-bottom:16px; }
  .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px; margin-top:48px; }
  .feature-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:28px; }
  .feature-icon { font-size:24px; margin-bottom:16px; }
  .feature-title { font-size:15px; font-weight:700; color:var(--text); margin-bottom:8px; }
  .feature-desc { font-size:13px; color:var(--textDim); line-height:1.65; }

  /* Screens preview */
  .preview { background:var(--surface); padding:80px 40px; border-top:1px solid var(--border); }
  .preview-inner { max-width:960px; margin:0 auto; }
  .screen-tags { display:flex; gap:10px; flex-wrap:wrap; margin-top:36px; justify-content:center; }
  .screen-tag { background:var(--bg); border:1px solid var(--border); border-radius:20px; padding:7px 18px; font-size:12px; font-weight:600; color:var(--textDim); }
  .screen-tag.active { background:var(--accent)15; border-color:var(--accent)40; color:var(--accent); }
  .viewer-cta { text-align:center; margin-top:40px; }
  .viewer-link { display:inline-flex; align-items:center; gap:10px; background:var(--accent); color:#fff; padding:14px 32px; border-radius:10px; text-decoration:none; font-weight:700; font-size:14px; }

  /* Pipeline vis */
  .pipeline { max-width:860px; margin:60px auto 0; display:flex; align-items:center; justify-content:center; gap:0; flex-wrap:nowrap; overflow-x:auto; padding:40px 40px; }
  .p-step { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px 20px; min-width:150px; text-align:center; flex-shrink:0; }
  .p-step-type { font-size:9px; font-weight:700; letter-spacing:1px; margin-bottom:8px; text-transform:uppercase; }
  .p-step-name { font-size:13px; font-weight:700; color:var(--text); }
  .p-step-model { font-size:10px; color:var(--muted); margin-top:4px; }
  .p-step.llm .p-step-type { color:#6D28D9; }
  .p-step.tool .p-step-type { color:var(--accent2); }
  .p-arrow { color:var(--muted); font-size:18px; padding:0 8px; flex-shrink:0; }

  /* Testimonials */
  .testimonials { max-width:960px; margin:80px auto; padding:0 40px; }
  .testimonial-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-top:48px; }
  .testimonial { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:28px; }
  .testimonial q { font-size:14px; line-height:1.7; color:var(--textDim); font-style:italic; }
  .testimonial-author { margin-top:20px; font-size:12px; font-weight:700; color:var(--text); }
  .testimonial-role { font-size:11px; color:var(--muted); margin-top:2px; }

  /* Footer */
  footer { background:var(--text); color:#fff; padding:40px; text-align:center; }
  footer .logo { color:#fff; }
  footer p { font-size:12px; color:rgba(255,255,255,0.4); margin-top:12px; }
</style>
</head>
<body>

<nav>
  <div class="logo">LANE<span>.</span></div>
  <div class="nav-links">
    <a href="#">Docs</a>
    <a href="#">Pricing</a>
    <a href="#">Changelog</a>
  </div>
  <button class="nav-cta">Start for free</button>
</nav>

<section class="hero">
  <div class="hero-badge"><div class="dot"></div> AI WORKFLOW PLATFORM</div>
  <h1>Build, run, and monitor<br><em>AI pipelines</em> that ship.</h1>
  <p class="hero-sub">Define reusable agent lanes, chain LLM calls with tools, schedule runs, and get full observability — without the infra headache.</p>
  <div class="hero-btns">
    <a href="https://ram.zenbin.org/lane-viewer" class="btn-primary">View interactive mock →</a>
    <a href="#features" class="btn-secondary">Explore features</a>
  </div>
</section>

<div class="stats">
  <div class="stat"><div class="stat-value">4<span>.</span>1ms</div><div class="stat-label">Avg step latency</div></div>
  <div class="stat"><div class="stat-value">99<span>%</span></div><div class="stat-label">Uptime SLA</div></div>
  <div class="stat"><div class="stat-value">12<span>+</span></div><div class="stat-label">Model providers</div></div>
  <div class="stat"><div class="stat-value">∞</div><div class="stat-label">Pipeline depth</div></div>
</div>

<section class="features" id="features">
  <div class="section-label">Capabilities</div>
  <h2 style="font-size:clamp(28px,4vw,44px);font-weight:900;letter-spacing:-1.5px;line-height:1.1;">Everything your AI pipeline<br>needs in production.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-title">Visual Lane Builder</div>
      <div class="feature-desc">Design pipelines with a visual DAG editor. Connect LLM steps, tool calls, validators, and outputs — see inputs and outputs per step.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Live Run Monitoring</div>
      <div class="feature-desc">Stream run status in real-time. Every step's latency, token count, and model are logged — with instant error drill-down.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◑</div>
      <div class="feature-title">Cost & Usage Analytics</div>
      <div class="feature-desc">Daily cost charts by lane, week-over-week trends, and per-model token breakdown. Budget alerts before you hit your limit.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◬</div>
      <div class="feature-title">Smart Alerting</div>
      <div class="feature-desc">Error rate spikes, p95 latency breaches, and cost anomalies surface automatically — with actionable resolution suggestions.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-title">Team Collaboration</div>
      <div class="feature-desc">Role-based access, API key management, and integration health — all in one team settings view. Built for engineering teams.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="color:#C94A14">→</div>
      <div class="feature-title">Multi-model Support</div>
      <div class="feature-desc">Claude, GPT-4o, Gemini, Mistral — mix and match models per step. Compare performance and cost across providers in one dashboard.</div>
    </div>
  </div>
</section>

<section class="preview">
  <div class="preview-inner">
    <div class="section-label" style="text-align:center">Pipeline Architecture</div>
    <h2 style="font-size:clamp(24px,3vw,38px);font-weight:900;letter-spacing:-1px;text-align:center;">What a lane looks like.</h2>
    <div class="pipeline">
      <div class="p-step llm"><div class="p-step-type">LLM</div><div class="p-step-name">research</div><div class="p-step-model">claude-3.5</div></div>
      <div class="p-arrow">→</div>
      <div class="p-step llm"><div class="p-step-type">LLM</div><div class="p-step-name">outline</div><div class="p-step-model">claude-3.5</div></div>
      <div class="p-arrow">→</div>
      <div class="p-step llm"><div class="p-step-type">LLM</div><div class="p-step-name">draft</div><div class="p-step-model">claude-3.5</div></div>
      <div class="p-arrow">→</div>
      <div class="p-step tool"><div class="p-step-type">Tool</div><div class="p-step-name">quality-check</div><div class="p-step-model">validator</div></div>
    </div>
    <div class="screen-tags">
      <div class="screen-tag active">Lanes overview</div>
      <div class="screen-tag">Pipeline Builder</div>
      <div class="screen-tag">Run Log</div>
      <div class="screen-tag">Analytics</div>
      <div class="screen-tag">Team & Settings</div>
    </div>
    <div class="viewer-cta">
      <a href="https://ram.zenbin.org/lane-viewer" class="viewer-link">
        Explore interactive mock ☀◑
      </a>
    </div>
  </div>
</section>

<section class="testimonials">
  <div class="section-label">Early Feedback</div>
  <h2 style="font-size:clamp(24px,3vw,38px);font-weight:900;letter-spacing:-1px;">Built for teams shipping AI.</h2>
  <div class="testimonial-grid">
    <div class="testimonial">
      <q>Finally a tool that treats AI pipelines like software — with proper observability, not just vibes-based logging.</q>
      <div class="testimonial-author">Priya Sharma</div>
      <div class="testimonial-role">ML Engineer, Acme Corp</div>
    </div>
    <div class="testimonial">
      <q>The cost analytics alone saved us $200/mo in the first week. We had no idea doc-ingestion was burning that much.</q>
      <div class="testimonial-author">Dani Reyes</div>
      <div class="testimonial-role">Backend Engineer, Kestrel Co.</div>
    </div>
    <div class="testimonial">
      <q>The lane builder is the first visual pipeline tool that actually maps to how I think about agent architecture.</q>
      <div class="testimonial-author">Ava Nakamura</div>
      <div class="testimonial-role">CTO, Midwinter App</div>
    </div>
  </div>
</section>

<footer>
  <div class="logo">LANE<span style="color:#C94A14">.</span></div>
  <p>Designed by RAM Design Heartbeat · ram.zenbin.org/lane</p>
</footer>

</body>
</html>`;
}

// ── Viewer HTML ──────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const escaped = JSON.stringify(penJson);
  const injection = `<script>window.EMBEDDED_PEN = ${escaped};<\/script>`;
  let html = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const penJson = fs.readFileSync(path.join(__dirname, 'lane.pen'), 'utf8');

  // 1. Hero page
  console.log('Publishing hero page…');
  const heroRes = await publishToZenbin(SLUG, 'LANE — AI Workflow Builder', buildHeroHtml());
  console.log(`  Hero: ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  // 2. Viewer
  console.log('Publishing viewer…');
  let viewerHtml;
  try {
    viewerHtml = buildViewerHtml(penJson);
  } catch (e) {
    console.warn('  viewer.html not found, using minimal fallback');
    viewerHtml = `<!DOCTYPE html><html><head><title>LANE Viewer</title><script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script></head><body style="margin:0;background:#F4F2ED;display:flex;align-items:center;justify-content:center;height:100vh"><p style="font-family:sans-serif;color:#9A9690">Pen viewer loading…</p></body></html>`;
  }
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'LANE — Viewer', viewerHtml);
  console.log(`  Viewer: ${viewerRes.status} → https://ram.zenbin.org/${VIEWER_SLUG}`);

  // 3. Gallery queue
  console.log('Updating gallery queue…');
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    ...sub,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await httpsReq({
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
  console.log('  Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));

  console.log('\n✓ Full pipeline done');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${VIEWER_SLUG}`);
})();
