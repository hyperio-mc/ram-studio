// char-publish.js — CHAR: Code analytics, distilled
// Publishes: hero page, viewer, gallery queue, design DB

'use strict';
const https = require('https');
const fs    = require('fs');

const SLUG      = 'char';
const APP_NAME  = 'CHAR';
const TAGLINE   = 'your codebase, distilled';
const ARCHETYPE = 'developer-analytics';
const ZENBIN_SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT  = [
  'Dark-theme code analytics dashboard for solo devs / small teams.',
  'Inspired by Corentin Bernadou Portfolio (Awwwards SOTD Mar 25 2026) — 2-color #FF4401 + near-black minimalism.',
  'And Midday.ai editorial dashboard approach (from darkmodedesign.com).',
  'Burnt orange #FF4401 single accent on #0C0D0D background.',
  'Five screens: Pulse (home dashboard with greeting + metric grid + AI prompt),',
  'Commits (heatmap + bar chart + file activity), Reviews (PR status + cycle time trend),',
  'Debt (score ring + breakdown bars + hotspot files), Insight (weekly AI digest + sprint recommendation).',
].join(' ');

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

// ═══════════════════════════════════════════════════════════════════════════════
// HERO PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CHAR — Your codebase, distilled.</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0C0D0D;
    --surface:   #161818;
    --raised:    #1F2121;
    --text:      #F2EDE6;
    --muted:     rgba(242,237,230,0.45);
    --dim:       rgba(242,237,230,0.22);
    --accent:    #FF4401;
    --accentDim: rgba(255,68,1,0.14);
    --green:     #3DCC8A;
    --border:    rgba(242,237,230,0.07);
    --borderMid: rgba(242,237,230,0.13);
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Nav ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(12,13,13,0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .nav-logo {
    font-size: 16px; font-weight: 800; letter-spacing: 0.06em;
    color: var(--text);
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; align-items: center; }
  .nav-links a {
    font-size: 13px; color: var(--muted); text-decoration: none;
    transition: color .2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff !important;
    padding: 7px 18px; border-radius: 6px;
    font-size: 13px; font-weight: 600;
    text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: .88; }

  /* ── Hero ── */
  .hero {
    max-width: 900px; margin: 0 auto;
    padding: 100px 40px 80px;
    text-align: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accentDim); border: 1px solid var(--accent);
    border-radius: 20px; padding: 4px 14px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
    color: var(--accent); text-transform: uppercase; margin-bottom: 28px;
  }
  .hero-eyebrow::before { content: '✦'; }
  .hero h1 {
    font-size: clamp(52px, 9vw, 96px);
    font-weight: 800;
    line-height: 1.0;
    letter-spacing: -0.03em;
    margin-bottom: 8px;
    color: var(--text);
  }
  .hero h1 em { color: var(--accent); font-style: normal; }
  .hero-sub {
    font-size: clamp(16px, 2.5vw, 22px);
    color: var(--muted);
    max-width: 520px; margin: 0 auto 40px;
    line-height: 1.55;
    font-weight: 400;
    margin-top: 20px;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 14px 28px; border-radius: 8px;
    font-size: 14px; font-weight: 600;
    text-decoration: none; display: inline-block; transition: opacity .2s;
  }
  .btn-primary:hover { opacity: .88; }
  .btn-secondary {
    background: var(--surface); color: var(--text);
    border: 1px solid var(--borderMid);
    padding: 14px 28px; border-radius: 8px;
    font-size: 14px; font-weight: 600;
    text-decoration: none; display: inline-block; transition: background .2s;
  }
  .btn-secondary:hover { background: var(--raised); }

  /* ── Mock preview strip ── */
  .preview-strip {
    padding: 0 40px 80px;
    max-width: 1100px; margin: 0 auto;
  }
  .preview-label {
    text-align: center; font-size: 10px; font-weight: 700;
    letter-spacing: 0.12em; color: var(--dim); text-transform: uppercase;
    margin-bottom: 32px;
  }
  .screens-row {
    display: flex; gap: 16px; justify-content: center;
    overflow-x: auto; padding: 0 20px 20px;
  }
  .screen-card {
    flex: 0 0 200px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden;
    padding: 16px 12px;
    transition: transform .25s, border-color .25s;
  }
  .screen-card:hover { transform: translateY(-6px); border-color: var(--accent); }
  .screen-name {
    font-size: 9px; font-weight: 700; letter-spacing: 0.12em;
    color: var(--accent); text-transform: uppercase; margin-bottom: 10px;
  }
  .screen-preview {
    background: var(--bg); border-radius: 12px;
    height: 300px; overflow: hidden; position: relative;
  }
  /* Mini mockup content per screen */
  .screen-preview .mini-header {
    padding: 8px 10px 4px;
    font-size: 10px; font-weight: 700; color: var(--text);
  }
  .screen-preview .mini-sub {
    padding: 0 10px 8px;
    font-size: 8px; color: var(--muted);
  }
  .mini-card {
    margin: 0 8px 6px;
    background: var(--surface); border-radius: 6px; padding: 6px 8px;
    border-left: 2px solid var(--accent);
  }
  .mini-card-text { font-size: 8px; color: var(--muted); line-height: 1.4; }
  .mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin: 0 8px 6px; }
  .mini-metric {
    background: var(--surface); border-radius: 5px; padding: 5px 6px;
  }
  .mini-metric-val { font-size: 12px; font-weight: 800; color: var(--text); }
  .mini-metric-lbl { font-size: 6px; color: var(--muted); margin-top: 1px; }
  .mini-bar-row { display: flex; align-items: center; gap: 4px; padding: 0 10px; margin-bottom: 4px; }
  .mini-bar-label { font-size: 7px; color: var(--muted); width: 50px; }
  .mini-bar-track { flex: 1; height: 4px; background: var(--raised); border-radius: 2px; }
  .mini-bar-fill { height: 4px; background: var(--accent); border-radius: 2px; }
  .mini-insight-chip {
    margin: 4px 8px;
    background: var(--accentDim); border-radius: 5px; padding: 5px 7px;
    font-size: 7px; color: var(--muted); line-height: 1.4;
    border-left: 2px solid var(--accent);
  }

  /* ── Features grid ── */
  .features {
    max-width: 900px; margin: 0 auto;
    padding: 80px 40px;
    border-top: 1px solid var(--border);
  }
  .features-eyebrow {
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
    color: var(--accent); text-transform: uppercase; margin-bottom: 16px;
  }
  .features h2 {
    font-size: 36px; font-weight: 800; margin-bottom: 52px;
    letter-spacing: -0.02em;
  }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
    transition: border-color .2s, transform .2s;
  }
  .feature-card:hover { border-color: var(--accent); transform: translateY(-3px); }
  .feature-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--accentDim); border: 1px solid var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 16px; color: var(--accent);
  }
  .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ── Metrics showcase ── */
  .metrics-section {
    max-width: 900px; margin: 0 auto;
    padding: 0 40px 80px;
    border-top: 1px solid var(--border);
  }
  .metrics-section h2 {
    font-size: 32px; font-weight: 800; margin: 60px 0 40px;
    letter-spacing: -0.02em;
  }
  .metrics-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .metric-big {
    flex: 1; min-width: 160px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px;
  }
  .metric-big-val {
    font-size: 48px; font-weight: 800; color: var(--text);
    letter-spacing: -0.03em; line-height: 1;
    margin-bottom: 4px;
  }
  .metric-big-val span { color: var(--accent); font-size: 24px; }
  .metric-big-delta { font-size: 11px; color: var(--green); font-weight: 600; margin-bottom: 8px; }
  .metric-big-label { font-size: 11px; color: var(--muted); }

  /* ── Inspiration note ── */
  .inspo-note {
    max-width: 700px; margin: 0 auto;
    padding: 0 40px 80px;
    border-top: 1px solid var(--border);
  }
  .inspo-note h3 {
    font-size: 13px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--accent); margin: 48px 0 16px;
  }
  .inspo-note p { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 12px; }
  .inspo-note strong { color: var(--text); }

  /* ── CTA bottom ── */
  .cta-section {
    background: var(--surface); border-top: 1px solid var(--border);
    text-align: center; padding: 80px 40px;
  }
  .cta-section h2 { font-size: 36px; font-weight: 800; margin-bottom: 16px; }
  .cta-section p { font-size: 15px; color: var(--muted); margin-bottom: 32px; }
  .cta-btn {
    background: var(--accent); color: #fff;
    padding: 16px 36px; border-radius: 8px;
    font-size: 15px; font-weight: 700;
    text-decoration: none; display: inline-block;
    transition: opacity .2s;
  }
  .cta-btn:hover { opacity: .88; }

  /* ── Footer ── */
  footer {
    background: var(--bg); border-top: 1px solid var(--border);
    padding: 32px 40px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
  }
  .footer-logo { font-size: 13px; font-weight: 800; letter-spacing: 0.06em; }
  .footer-logo span { color: var(--accent); }
  footer p { font-size: 12px; color: var(--dim); }
</style>
</head>
<body>
<nav>
  <div class="nav-logo">CH<span>▲</span>R</div>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="#">Docs</a>
    <a href="https://ram.zenbin.org/char-mock" class="nav-cta">Try Mock →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-eyebrow">Code Intelligence · Mar 2026</div>
  <h1>Your<br/><em>codebase,</em><br/>distilled.</h1>
  <p class="hero-sub">Commit velocity, review health, tech debt signals — unified in one living dashboard. Know your repo like your finances.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/char-mock" class="btn-primary">Explore prototype →</a>
    <a href="https://ram.zenbin.org/char-viewer" class="btn-secondary">View in Pencil ↗</a>
  </div>
</section>

<section class="preview-strip">
  <p class="preview-label">5 Screens — Pencil.dev v2.8 prototype</p>
  <div class="screens-row">

    <!-- Pulse screen -->
    <div class="screen-card">
      <div class="screen-name">Pulse</div>
      <div class="screen-preview">
        <div class="mini-header">Morning, Ryo.</div>
        <div class="mini-sub">Here's your codebase this week.</div>
        <div class="mini-card"><div class="mini-card-text">287 commits · 14 PRs merged · zero regressions. Strong week — velocity up 18%</div></div>
        <div class="mini-grid">
          <div class="mini-metric"><div class="mini-metric-val">41</div><div class="mini-metric-lbl">Commits/wk</div></div>
          <div class="mini-metric"><div class="mini-metric-val">4.2h</div><div class="mini-metric-lbl">Review cycle</div></div>
          <div class="mini-metric"><div class="mini-metric-val">78%</div><div class="mini-metric-lbl">Coverage</div></div>
          <div class="mini-metric"><div class="mini-metric-val">24</div><div class="mini-metric-lbl">Debt score</div></div>
        </div>
        <div class="mini-insight-chip">✦ Why did review time drop last Tuesday?</div>
      </div>
    </div>

    <!-- Commits screen -->
    <div class="screen-card">
      <div class="screen-name">Commits</div>
      <div class="screen-preview">
        <div class="mini-header">Commits</div>
        <div class="mini-sub">287 this week · 1,204 this month</div>
        <div style="padding:0 8px 6px">
          <div style="font-size:7px;color:var(--muted);margin-bottom:4px;font-weight:700;">CONTRIBUTION HEATMAP</div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">
            ${[0.08,0.3,0.6,0.8,0.5,0.15,0.08].map(o => `<div style="height:6px;background:var(--accent);border-radius:1px;opacity:${o}"></div>`).join('')}
            ${[0.2,0.6,1,0.8,0.6,0.2,0.08].map(o => `<div style="height:6px;background:var(--accent);border-radius:1px;opacity:${o}"></div>`).join('')}
            ${[0.4,0.8,1,1,0.8,0.4,0.2].map(o => `<div style="height:6px;background:var(--accent);border-radius:1px;opacity:${o}"></div>`).join('')}
          </div>
        </div>
        <div class="mini-bar-row"><div class="mini-bar-label">Mon</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:73%"></div></div></div>
        <div class="mini-bar-row"><div class="mini-bar-label">Tue</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:53%"></div></div></div>
        <div class="mini-bar-row"><div class="mini-bar-label">Wed</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:94%"></div></div></div>
        <div class="mini-bar-row"><div class="mini-bar-label">Thu</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:100%"></div></div></div>
        <div style="padding:4px 10px;font-size:7px;color:var(--muted)">src/auth/middleware.ts · 34 Δ</div>
        <div style="padding:0 10px 2px;font-size:7px;color:var(--muted)">src/api/webhooks.ts · 28 Δ</div>
      </div>
    </div>

    <!-- Reviews screen -->
    <div class="screen-card">
      <div class="screen-name">Reviews</div>
      <div class="screen-preview">
        <div class="mini-header">Reviews</div>
        <div class="mini-sub">14 merged · 3 open · 0 blocked</div>
        <div style="padding:0 8px 6px;display:flex;gap:4px;flex-wrap:wrap;">
          <span style="background:rgba(255,173,51,.15);color:#FFAD33;font-size:7px;font-weight:700;padding:2px 6px;border-radius:8px;">Open 3</span>
          <span style="background:rgba(255,68,1,.15);color:#FF4401;font-size:7px;font-weight:700;padding:2px 6px;border-radius:8px;">Review 5</span>
          <span style="background:rgba(61,204,138,.15);color:#3DCC8A;font-size:7px;font-weight:700;padding:2px 6px;border-radius:8px;">Merged 14</span>
        </div>
        <div style="margin:0 8px 5px;background:var(--surface);border-radius:6px;padding:6px 8px;">
          <div style="font-size:9px;font-weight:800;color:var(--text)">4.2 hrs</div>
          <div style="font-size:7px;color:#3DCC8A">↓ 12% vs last week</div>
        </div>
        <div style="margin:0 8px 4px;background:var(--surface);border-radius:6px;padding:5px 8px;border-left:2px solid var(--accent)">
          <div style="font-size:7px;color:var(--text);font-weight:600">feat: add real-time dashboard updates</div>
          <div style="font-size:6px;color:var(--muted)">6h ago · +142/-18</div>
        </div>
        <div style="margin:0 8px;background:var(--surface);border-radius:6px;padding:5px 8px;border-left:2px solid #FFAD33">
          <div style="font-size:7px;color:var(--text);font-weight:600">fix: memory leak in WebSocket handler</div>
          <div style="font-size:6px;color:var(--muted)">1d ago · +23/-67</div>
        </div>
      </div>
    </div>

    <!-- Debt screen -->
    <div class="screen-card">
      <div class="screen-name">Debt</div>
      <div class="screen-preview">
        <div class="mini-header">Tech Debt</div>
        <div class="mini-sub">Score 24 / 100 · Manageable</div>
        <div style="text-align:center;padding:8px 0;">
          <div style="font-size:32px;font-weight:800;color:var(--text);line-height:1">24</div>
          <div style="font-size:7px;color:var(--muted)">/100</div>
          <div style="font-size:7px;font-weight:700;color:#3DCC8A;margin-top:2px">MANAGEABLE</div>
        </div>
        <div class="mini-bar-row"><div class="mini-bar-label">Smells</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:27%;background:#FFAD33"></div></div></div>
        <div class="mini-bar-row"><div class="mini-bar-label">Complexity</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:23%"></div></div></div>
        <div class="mini-bar-row"><div class="mini-bar-label">Coverage</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:25%;background:#FF5448"></div></div></div>
        <div style="padding:4px 10px;font-size:7px;color:var(--muted)">globalState.ts · 7 issues · 90°</div>
      </div>
    </div>

    <!-- Insight screen -->
    <div class="screen-card">
      <div class="screen-name">Insight</div>
      <div class="screen-preview">
        <div style="padding:8px 10px 2px;font-size:8px;font-weight:700;color:var(--accent)">WK 13 INSIGHT</div>
        <div style="padding:2px 10px 6px;font-size:11px;font-weight:800;color:var(--text);line-height:1.3">Your best week in six months.</div>
        <div style="padding:0 10px 6px;font-size:7px;color:var(--muted);line-height:1.5">Auth shipped clean. One debt hotspot needs attention before Sprint 14.</div>
        <div class="mini-card"><div class="mini-card-text"><strong style="color:#3DCC8A">↑ Velocity:</strong> Commit rate +18%. Auth cluster, all tests passing.</div></div>
        <div style="margin:4px 8px;background:var(--surface);border-radius:6px;padding:5px 7px;border-left:2px solid #FFAD33">
          <div style="font-size:7px;color:var(--muted);line-height:1.4"><strong style="color:#FFAD33">◎ Debt Alert:</strong> globalState.ts — refactor before Sprint 14.</div>
        </div>
        <div class="mini-insight-chip">✦ Ask about this week...</div>
      </div>
    </div>

  </div>
</section>

<section class="features">
  <div class="features-eyebrow">What CHAR tracks</div>
  <h2>Intelligence your<br/>repo deserves.</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⬡</div>
      <div class="feature-title">Live Pulse</div>
      <div class="feature-desc">Personalized morning briefing. Commit velocity, PR health, coverage — all at a glance the moment you open it.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">↑</div>
      <div class="feature-title">Commit Intelligence</div>
      <div class="feature-desc">Heatmap calendar, daily velocity bars, and file-level change tracking. Know where your energy is actually going.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Review Health</div>
      <div class="feature-desc">Cycle time trends, open PR status at a glance, reviewer throughput. Spot bottlenecks before they become blockers.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Debt Radar</div>
      <div class="feature-desc">Quantified debt score with file-level hotspots. Color-coded by severity — not buried in reports nobody reads.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <div class="feature-title">AI Weekly Digest</div>
      <div class="feature-desc">One-paragraph narrative that explains what changed and why it matters. Ask follow-up questions in plain English.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▮</div>
      <div class="feature-title">Zero Config</div>
      <div class="feature-desc">Connect a repo, get insights in minutes. No YAML, no webhooks to maintain, no dashboard to configure.</div>
    </div>
  </div>
</section>

<section class="metrics-section">
  <h2>The numbers that actually matter.</h2>
  <div class="metrics-row">
    <div class="metric-big">
      <div class="metric-big-val">41<span>/wk</span></div>
      <div class="metric-big-delta">↑ 18% this sprint</div>
      <div class="metric-big-label">Commit Velocity</div>
    </div>
    <div class="metric-big">
      <div class="metric-big-val">4.2<span>h</span></div>
      <div class="metric-big-delta">↓ 12% vs last week</div>
      <div class="metric-big-label">Review Cycle</div>
    </div>
    <div class="metric-big">
      <div class="metric-big-val">78<span>%</span></div>
      <div class="metric-big-delta">↑ 3% this month</div>
      <div class="metric-big-label">Test Coverage</div>
    </div>
    <div class="metric-big">
      <div class="metric-big-val">24<span>/100</span></div>
      <div class="metric-big-delta">Manageable range</div>
      <div class="metric-big-label">Debt Score</div>
    </div>
  </div>
</section>

<section class="inspo-note">
  <h3>Design Notes — RAM Heartbeat</h3>
  <p><strong>Inspiration 1:</strong> Corentin Bernadou Portfolio was Awwwards Site of the Day on March 25, 2026 — the day this was built. Its radical 2-color palette (#FF4401 burnt orange + #070304 near-black) with no other decoration proved that extreme constraint creates extreme clarity. CHAR borrows that exact accent color.</p>
  <p><strong>Inspiration 2:</strong> Midday.ai (spotted via darkmodedesign.com) treats financial data with editorial warmth — the "Morning Viktor" personalized greeting, the grid of metric cards, the AI natural-language prompt embedded in the UI. CHAR ports this approach wholesale to code analytics.</p>
  <p><strong>Inspiration 3:</strong> land-book.com's "Codegen — OS for Code Agents" landing demonstrated that developer tools can have editorial landing pages without looking like a terminal emulator.</p>
  <p><strong>Design constraint:</strong> CHAR uses only typography weight + size hierarchy and a single accent color for all visual structure. No gradients, no colored backgrounds, no decorative shapes.</p>
</section>

<section class="cta-section">
  <h2>Your repo has vital signs.<br/>Start reading them.</h2>
  <p>Five screens. One accent color. Every signal that matters.</p>
  <a href="https://ram.zenbin.org/char-mock" class="cta-btn">Open prototype →</a>
</section>

<footer>
  <div class="footer-logo">CH<span>▲</span>R</div>
  <p>RAM Design Heartbeat · Mar 25, 2026 · Pencil.dev v2.8</p>
</footer>

</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// VIEWER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CHAR — Pencil Viewer</title>
<style>
  body { margin: 0; background: #0C0D0D; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Inter, sans-serif; }
  .viewer-wrap { text-align: center; }
  .viewer-title { color: rgba(242,237,230,0.5); font-size: 11px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 16px; }
  .viewer-title span { color: #FF4401; }
  #pencil-viewer-root { display: inline-block; }
</style>
</head>
<body>
<div class="viewer-wrap">
  <div class="viewer-title">CH<span>▲</span>R — Code analytics, distilled</div>
  <div id="pencil-viewer-root"></div>
</div>
<script src="https://unpkg.com/pencil-viewer@latest/dist/viewer.js"></script>
<script>
  // EMBEDDED_PEN injected below
</script>
<script>
  if (window.EMBEDDED_PEN && window.PencilViewer) {
    window.PencilViewer.init('#pencil-viewer-root', JSON.parse(window.EMBEDDED_PEN));
  }
</script>
</body>
</html>`;

// Inject the pen file
const penJson = fs.readFileSync('/workspace/group/design-studio/char.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>\n  // EMBEDDED_PEN injected below\n</script>', injection);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('🔥 CHAR — Publishing pipeline\n');

  // a) Hero
  console.log('▸ Publishing hero...');
  const heroRes = await zenPublish(SLUG, heroHtml, 'CHAR — Your codebase, distilled');
  console.log(`  Hero: ${heroRes.status <= 201 ? '✓' : '✗ '+heroRes.status+' '+heroRes.body.slice(0,80)} https://ram.zenbin.org/${SLUG}`);

  // b) Viewer
  console.log('▸ Publishing viewer...');
  const viewerRes = await zenPublish(`${SLUG}-viewer`, viewerHtml, 'CHAR — Pencil Viewer');
  console.log(`  Viewer: ${viewerRes.status <= 201 ? '✓' : '✗ '+viewerRes.status} https://ram.zenbin.org/${SLUG}-viewer`);

  // d) Gallery queue
  console.log('▸ Updating gallery queue...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`,
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
    id: `heartbeat-${SLUG}-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
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
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`  Queue: ${putRes.status === 200 ? '✓ OK' : '✗ ' + putRes.body.slice(0, 80)}`);

  console.log('\n✓ Done. URLs:');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(console.error);
