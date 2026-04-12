'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG   = 'arca';
const SUBDOM = 'ram';

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOM,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ARCA — Agent Run Control & Analytics</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #F4F1EC;
  --surface: #FFFFFF;
  --surface2: #FAF8F4;
  --text: #1A1714;
  --sub: #888070;
  --muted: #B0A898;
  --accent: #2254C8;
  --accent2: #2B8A3E;
  --warn: #B45309;
  --danger: #C0392B;
  --border: #E8E4DC;
}
body { font-family: -apple-system, 'Inter', 'Helvetica Neue', sans-serif; background: var(--bg); color: var(--text); }

/* ─ NAV ─ */
nav {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 48px; background: rgba(244,241,236,0.85);
  backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100;
  border-bottom: 1px solid var(--border);
}
.logo { font-size: 18px; font-weight: 800; letter-spacing: 4px; color: var(--text); }
.logo span { color: var(--accent); }
.nav-tag { font-size: 10px; font-weight: 600; color: var(--sub); letter-spacing: 2px; margin-top: 2px; }
.nav-right { display: flex; gap: 24px; align-items: center; }
.nav-right a { text-decoration: none; color: var(--sub); font-size: 13px; font-weight: 500; transition: color .2s; }
.nav-right a:hover { color: var(--text); }
.btn-accent { background: var(--accent); color: #FFF; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; }

/* ─ HERO ─ */
.hero {
  max-width: 1160px; margin: 0 auto; padding: 100px 48px 80px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(34,84,200,0.08); border: 1px solid rgba(34,84,200,0.2);
  color: var(--accent); font-size: 11px; font-weight: 700; padding: 6px 14px;
  border-radius: 999px; margin-bottom: 24px; letter-spacing: .1em;
}
.hero h1 {
  font-size: clamp(38px, 5vw, 60px); font-weight: 800; line-height: 1.08;
  letter-spacing: -2px; margin-bottom: 20px;
}
.hero h1 em { font-style: normal; color: var(--accent); }
.hero p { font-size: 17px; color: var(--sub); line-height: 1.75; margin-bottom: 36px; max-width: 460px; }
.hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-primary { background: var(--accent); color: #FFF; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: opacity .2s; }
.btn-primary:hover { opacity: .88; }
.btn-secondary { background: var(--surface); color: var(--text); padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; border: 1px solid var(--border); display: inline-flex; align-items: center; gap: 8px; transition: border-color .2s; }
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

/* ─ PHONE MOCK ─ */
.phone-wrap { display: flex; justify-content: center; position: relative; }
.phone-wrap::before {
  content: '';
  position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
  width: 320px; height: 320px; background: radial-gradient(circle, rgba(34,84,200,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.phone {
  width: 260px; border-radius: 38px; overflow: hidden;
  box-shadow: 0 32px 80px rgba(34,84,200,0.18), 0 8px 24px rgba(26,23,20,0.08);
  border: 6px solid #F0EDE8; background: #F4F1EC; position: relative;
}
.pscreen {
  background: #F4F1EC; padding: 16px 12px 8px;
  font-family: -apple-system, sans-serif;
}
.p-header { margin-bottom: 10px; }
.p-eyebrow { font-size: 8px; font-weight: 600; color: var(--sub); letter-spacing: 3px; }
.p-title { font-size: 16px; font-weight: 800; color: var(--text); margin-top: 2px; }
.p-tiles { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 8px; }
.p-tile {
  background: var(--surface); border-radius: 10px; padding: 8px;
  box-shadow: 0 2px 8px rgba(26,23,20,0.05);
}
.p-tile .tl { font-size: 7px; font-weight: 600; color: var(--sub); letter-spacing: 0.8px; }
.p-tile .tv { font-size: 18px; font-weight: 800; color: var(--text); margin-top: 2px; }
.p-tile .tv.blue { color: var(--accent); }
.p-tile .ts { font-size: 7px; color: var(--accent2); margin-top: 1px; }
.p-chart {
  background: var(--surface); border-radius: 12px; padding: 10px;
  box-shadow: 0 2px 8px rgba(26,23,20,0.05); margin-bottom: 8px;
}
.p-chart-title { font-size: 8px; font-weight: 700; color: var(--sub); letter-spacing: 1.5px; margin-bottom: 6px; }
.bars { display: flex; align-items: flex-end; gap: 3px; height: 36px; }
.bars span { flex: 1; border-radius: 2px; background: #E8E4DC; }
.bars span.hi { background: var(--accent); }
.p-run {
  background: var(--surface); border-radius: 10px; padding: 8px 10px;
  margin-bottom: 5px; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 1px 6px rgba(26,23,20,0.04);
}
.run-info { flex: 1; }
.run-name { font-size: 10px; font-weight: 700; color: var(--text); }
.run-ref { font-size: 7px; color: var(--sub); letter-spacing: 1px; }
.run-badge {
  font-size: 7px; font-weight: 700; padding: 2px 7px; border-radius: 8px;
}
.badge-done { background: #D8F3D8; color: #1E7A1E; }
.badge-run { background: #DCE9FF; color: var(--accent); }
.badge-err { background: #FDDEDE; color: var(--danger); }
.p-nav {
  display: flex; justify-content: space-around;
  background: var(--surface); padding: 6px 0 4px;
  border-top: 1px solid var(--border); margin: 0 -12px; margin-top: 8px;
}
.p-nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 7px; color: var(--muted); }
.p-nav-item.active { color: var(--accent); }
.p-nav-dot { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.p-nav-item.active .p-nav-dot { background: var(--accent); color: #FFF; font-size: 11px; }

/* ─ STAT BAR ─ */
.stat-bar {
  background: var(--surface); border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.stat-bar-inner { max-width: 1160px; margin: 0 auto; padding: 32px 48px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.stat-item { text-align: center; }
.stat-value { font-size: 36px; font-weight: 800; color: var(--accent); letter-spacing: -1px; display: block; }
.stat-label { font-size: 11px; font-weight: 600; color: var(--sub); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }

/* ─ FEATURES ─ */
.features { max-width: 1160px; margin: 0 auto; padding: 80px 48px; }
.section-tag { font-size: 11px; font-weight: 700; color: var(--accent); letter-spacing: 3px; margin-bottom: 12px; }
.section-title { font-size: 36px; font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; }
.section-sub { font-size: 16px; color: var(--sub); line-height: 1.6; max-width: 520px; margin-bottom: 56px; }
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.feature-card {
  background: var(--surface); border-radius: 20px; padding: 32px;
  border: 1px solid var(--border); transition: transform .2s, box-shadow .2s;
}
.feature-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(26,23,20,0.08); }
.feature-icon { font-size: 28px; margin-bottom: 16px; }
.feature-title { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
.feature-desc { font-size: 14px; color: var(--sub); line-height: 1.6; }

/* ─ TABLE SECTION (Silencio-inspired) ─ */
.table-section { background: var(--text); padding: 80px 48px; }
.table-section-inner { max-width: 1160px; margin: 0 auto; }
.table-eyebrow { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 4px; margin-bottom: 8px; }
.table-heading { font-size: 40px; font-weight: 800; color: #FFFFFF; letter-spacing: -1.5px; margin-bottom: 40px; }
.spec-table { width: 100%; border-collapse: collapse; }
.spec-table th { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); letter-spacing: 2px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; }
.spec-table td { font-size: 14px; color: rgba(255,255,255,0.75); padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.spec-table td:first-child { font-weight: 600; color: #FFFFFF; width: 40%; }
.spec-table td:last-child { font-weight: 700; color: #7CB8FF; text-align: right; }

/* ─ CTA ─ */
.cta { max-width: 1160px; margin: 0 auto; padding: 80px 48px; text-align: center; }
.cta-inner { background: var(--accent); border-radius: 24px; padding: 64px 48px; }
.cta h2 { font-size: 40px; font-weight: 800; color: #FFFFFF; letter-spacing: -1.5px; margin-bottom: 16px; }
.cta p { font-size: 16px; color: rgba(255,255,255,0.75); max-width: 440px; margin: 0 auto 36px; line-height: 1.6; }
.btn-white { background: #FFFFFF; color: var(--accent); padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: opacity .2s; }
.btn-white:hover { opacity: .9; }

/* ─ FOOTER ─ */
footer { border-top: 1px solid var(--border); padding: 24px 48px; }
.footer-inner { max-width: 1160px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.footer-inner p { font-size: 12px; color: var(--muted); }

@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; gap: 48px; padding: 60px 24px 40px; }
  .phone-wrap { display: none; }
  .stat-bar-inner { grid-template-columns: 1fr 1fr; }
  .feature-grid { grid-template-columns: 1fr; }
  .table-section { padding: 60px 24px; }
  nav { padding: 16px 24px; }
}
</style>
</head>
<body>

<nav>
  <div>
    <div class="logo"><span>A</span>RCA</div>
    <div class="nav-tag">AGENT RUN CONTROL & ANALYTICS</div>
  </div>
  <div class="nav-right">
    <a href="#">Pipeline</a>
    <a href="#">Tools</a>
    <a href="#">Docs</a>
    <a href="https://ram.zenbin.org/arca-viewer" class="btn-accent">View Design ↗</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">⎇ AGENT OBSERVABILITY</div>
    <h1>Your agents.<br><em>Fully visible.</em></h1>
    <p>ARCA monitors every step of every AI agent pipeline — from tool calls to latency spikes — giving teams the visibility they need to ship reliably.</p>
    <div class="hero-btns">
      <a href="https://ram.zenbin.org/arca-mock" class="btn-primary">Try Interactive Mock ↗</a>
      <a href="https://ram.zenbin.org/arca-viewer" class="btn-secondary">View Prototype</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="pscreen">
        <div class="p-header">
          <div class="p-eyebrow">ARCA</div>
          <div class="p-title">Agent Control</div>
        </div>
        <div class="p-tiles">
          <div class="p-tile"><div class="tl">ACTIVE</div><div class="tv">12</div><div class="ts">↑ 3</div></div>
          <div class="p-tile"><div class="tl">LATENCY</div><div class="tv">1.4s</div><div class="ts">→ stable</div></div>
          <div class="p-tile"><div class="tl">SUCCESS</div><div class="tv blue">97%</div><div class="ts">↑ 2%</div></div>
        </div>
        <div class="p-chart">
          <div class="p-chart-title">PIPELINE ACTIVITY</div>
          <div class="bars">
            <span style="height:60%"></span><span style="height:45%"></span><span style="height:75%"></span>
            <span style="height:55%"></span><span style="height:82%"></span><span style="height:66%"></span>
            <span style="height:78%"></span><span style="height:50%"></span><span style="height:90%"></span>
            <span style="height:70%"></span><span style="height:85%"></span><span style="height:60%"></span>
            <span style="height:74%"></span><span style="height:80%"></span><span class="hi" style="height:58%"></span>
          </div>
        </div>
        <div class="p-run">
          <div class="run-info"><div class="run-ref">ARK-00841</div><div class="run-name">ResearchBot</div></div>
          <div class="run-badge badge-done">DONE</div>
        </div>
        <div class="p-run">
          <div class="run-info"><div class="run-ref">ARK-00840</div><div class="run-name">CodeReview</div></div>
          <div class="run-badge badge-run">RUNNING</div>
        </div>
        <div class="p-run">
          <div class="run-info"><div class="run-ref">ARK-00839</div><div class="run-name">DataSync</div></div>
          <div class="run-badge badge-err">ERROR</div>
        </div>
        <div class="p-nav">
          <div class="p-nav-item active"><div class="p-nav-dot">◈</div><div>Home</div></div>
          <div class="p-nav-item"><div class="p-nav-dot">⎇</div><div>Flows</div></div>
          <div class="p-nav-item"><div class="p-nav-dot">⊕</div><div>Runs</div></div>
          <div class="p-nav-item"><div class="p-nav-dot">⚙</div><div>Config</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="stat-bar">
  <div class="stat-bar-inner">
    <div class="stat-item"><span class="stat-value">14.8K</span><div class="stat-label">Tool Calls Today</div></div>
    <div class="stat-item"><span class="stat-value">97%</span><div class="stat-label">Success Rate</div></div>
    <div class="stat-item"><span class="stat-value">1.4s</span><div class="stat-label">Avg Latency</div></div>
    <div class="stat-item"><span class="stat-value">481</span><div class="stat-label">Runs Today</div></div>
  </div>
</div>

<section class="features">
  <div class="section-tag">CAPABILITIES</div>
  <h2 class="section-title">Built for agent-first teams</h2>
  <p class="section-sub">ARCA gives engineering teams full observability into their AI agent pipelines, without adding boilerplate or instrumentation overhead.</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">⎇</div>
      <div class="feature-title">Pipeline Replay</div>
      <div class="feature-desc">Step through every agent run — see exactly which tools fired, in what order, with full latency breakdowns per step.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-title">Tool Inventory</div>
      <div class="feature-desc">Track usage, success rates, and error patterns for every tool across all your agents — ranked by volume and reliability.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◎</div>
      <div class="feature-title">Anomaly Alerts</div>
      <div class="feature-desc">Rate limit violations, latency spikes, token budget warnings — surfaced immediately, with full context for rapid triage.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">▦</div>
      <div class="feature-title">Agent Profiles</div>
      <div class="feature-desc">Detailed performance sheets per agent — runs, success rates, P95 latency, and top tools — inspired by technical spec docs.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◑</div>
      <div class="feature-title">Live Dashboard</div>
      <div class="feature-desc">Real-time visibility into active runs, queue depth, and overall system health — no refresh required.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⌁</div>
      <div class="feature-title">Zero-Config SDK</div>
      <div class="feature-desc">Drop in two lines, start seeing data immediately. Works with any agentic framework — LangChain, CrewAI, custom.</div>
    </div>
  </div>
</section>

<section class="table-section">
  <div class="table-section-inner">
    <div class="table-eyebrow">PERFORMANCE BASELINE</div>
    <h2 class="table-heading">What you can expect</h2>
    <table class="spec-table">
      <thead>
        <tr>
          <th>METRIC</th>
          <th>DESCRIPTION</th>
          <th>TARGET</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Ingestion latency</td><td>Time from tool call to dashboard visibility</td><td>&lt; 200ms</td></tr>
        <tr><td>Trace retention</td><td>Full run traces stored per plan</td><td>90 days</td></tr>
        <tr><td>Alert response</td><td>Time from anomaly to notification</td><td>&lt; 30s</td></tr>
        <tr><td>Data volume</td><td>Tool calls tracked per month (base plan)</td><td>1M calls</td></tr>
        <tr><td>Agents supported</td><td>Concurrent agents per workspace</td><td>Unlimited</td></tr>
        <tr><td>SDK overhead</td><td>Latency added to each tool call</td><td>&lt; 1ms</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="cta">
  <div class="cta-inner">
    <h2>Start seeing your agents clearly.</h2>
    <p>Set up in under 5 minutes. No infra changes required. Works with every major agent framework.</p>
    <a href="https://ram.zenbin.org/arca-mock" class="btn-white">Try the Interactive Mock →</a>
  </div>
</section>

<footer>
  <div class="footer-inner">
    <p>ARCA — Agent Run Control & Analytics · RAM Design Studio · 2026</p>
    <p>Inspired by Composio.dev & Silencio.es</p>
  </div>
</footer>

</body>
</html>`;

// ─── VIEWER ─────────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const penData = JSON.parse(penJson);
  const screens = penData.screens || [];

  function renderElement(el) {
    const style = [
      `position:absolute`,
      `left:${el.x}px`,
      `top:${el.y}px`,
      `width:${el.width}px`,
      `height:${el.height}px`,
    ];
    if (el.type === 'rectangle' || el.type === 'ellipse') {
      if (el.fill) style.push(`background:${el.fill}`);
      if (el.cornerRadius) {
        if (typeof el.cornerRadius === 'number') style.push(`border-radius:${el.cornerRadius}px`);
      }
      if (el.type === 'ellipse') style.push(`border-radius:50%`);
      if (el.opacity !== undefined && el.opacity < 1) style.push(`opacity:${el.opacity}`);
      if (el.shadow) {
        const s = el.shadow;
        style.push(`box-shadow:${s.x||0}px ${s.y||0}px ${s.blur||0}px ${s.color||'rgba(0,0,0,0.1)'}`);
      }
    }
    if (el.type === 'text') {
      style.push(`color:${el.color||'#000'}`);
      style.push(`font-size:${el.fontSize||12}px`);
      style.push(`font-weight:${el.fontWeight||'400'}`);
      style.push(`line-height:${el.lineHeight||1.2}`);
      if (el.letterSpacing) style.push(`letter-spacing:${el.letterSpacing}px`);
      if (el.textAlign) style.push(`text-align:${el.textAlign}`);
      style.push(`overflow:hidden`);
      style.push(`white-space:pre-wrap`);
      style.push(`font-family:-apple-system,'Inter',sans-serif`);
    }
    const tag = el.type === 'text' ? 'div' : 'div';
    const inner = el.type === 'text' ? (el.content || '') : '';
    return `<${tag} style="${style.join(';')}">${inner}</${tag}>`;
  }

  const screenHtml = screens.map((sc, idx) => `
    <div class="screen-wrap">
      <div class="screen-label">${(sc.name||sc.id||`SCREEN ${idx+1}`).toUpperCase()}</div>
      <div class="screen-frame" style="background:${sc.backgroundColor||'#F4F1EC'};position:relative;width:390px;height:844px;border-radius:28px;overflow:hidden;box-shadow:0 24px 64px rgba(34,84,200,0.15),0 4px 16px rgba(26,23,20,0.08);flex-shrink:0;">
        ${(sc.elements||[]).map(renderElement).join('\n')}
      </div>
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ARCA — Design Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#F0EDE8;min-height:100vh;font-family:-apple-system,'Inter',sans-serif;padding:32px 24px}
header{max-width:1600px;margin:0 auto 40px;display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:1px solid #E8E4DC}
.vlogo{font-size:13px;font-weight:900;letter-spacing:5px;color:#1A1714}
.vlogo span{color:#2254C8}
.back{font-size:11px;color:#888070;text-decoration:none;letter-spacing:1.5px;border:1px solid #E8E4DC;padding:8px 16px;border-radius:8px;transition:all .15s}
.back:hover{color:#2254C8;border-color:#2254C8}
.screens{max-width:1600px;margin:0 auto;display:flex;flex-wrap:wrap;gap:32px;justify-content:center}
.screen-wrap{display:flex;flex-direction:column;align-items:center}
.screen-label{font-size:9px;color:#888070;letter-spacing:3px;font-weight:700;margin-bottom:12px;font-family:monospace}
.links{max-width:1600px;margin:32px auto 0;display:flex;gap:16px;justify-content:center}
.links a{color:#888070;font-size:12px;text-decoration:none;padding:10px 20px;border:1px solid #E8E4DC;border-radius:8px;letter-spacing:.5px;transition:all .15s}
.links a:hover{border-color:#2254C8;color:#2254C8}
</style>
</head>
<body>
<header>
  <div class="vlogo"><span>A</span>RCA</div>
  <a class="back" href="https://ram.zenbin.org/arca">← Hero Page</a>
</header>
<div class="screens">${screenHtml}</div>
<div class="links">
  <a href="https://ram.zenbin.org/arca-mock">Interactive Mock ☀◑</a>
  <a href="https://ram.zenbin.org/arca">Hero Page</a>
</div>
</body>
</html>`;
}

(async () => {
  console.log('Publishing ARCA hero page...');
  const r1 = await zenPublish(SLUG, heroHtml, 'ARCA — Agent Run Control & Analytics');
  console.log(`Hero: ${r1.status} — https://ram.zenbin.org/${SLUG}`);

  const penJson = fs.readFileSync('/workspace/group/design-studio/arca.pen', 'utf8');
  const viewerHtml = buildViewerHtml(penJson);
  console.log('Publishing ARCA viewer...');
  const r2 = await zenPublish(SLUG + '-viewer', viewerHtml, 'ARCA — Design Viewer');
  console.log(`Viewer: ${r2.status} — https://ram.zenbin.org/${SLUG}-viewer`);
})();
