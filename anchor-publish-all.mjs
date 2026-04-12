/**
 * Anchor — Full publish: hero + viewer
 */
import { readFileSync } from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLUG = 'anchor-deploy';
const APP_NAME = 'Anchor';
const TAGLINE = 'Deploy with confidence';

function publishPage(slug, html, title) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://zenbin.org/p/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F2F5FB; --surface: #FFFFFF; --border: #E2E8F4;
    --text: #0D1117; --muted: #667085;
    --accent: #2563EB; --accent2: #10B981; --warn: #F59E0B;
  }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; line-height: 1.6; }
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(242,245,251,0.9); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 20px; font-weight: 800; color: var(--accent); text-decoration: none; }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 14px; font-weight: 500; color: var(--muted); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: #fff; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; }
  .hero {
    max-width: 1120px; margin: 0 auto; padding: 140px 40px 80px;
    display: grid; grid-template-columns: 1fr 380px; gap: 80px; align-items: center;
  }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: #EFF6FF; color: var(--accent); border-radius: 100px;
    font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    padding: 6px 14px; margin-bottom: 24px;
  }
  .eyebrow::before { content: '●'; color: var(--accent2); font-size: 8px; }
  h1 { font-size: clamp(36px, 5vw, 60px); font-weight: 900; line-height: 1.05; letter-spacing: -2px; margin-bottom: 20px; }
  h1 em { font-style: normal; color: var(--accent); }
  .sub { font-size: 18px; color: var(--muted); max-width: 440px; margin-bottom: 36px; }
  .actions { display: flex; gap: 16px; align-items: center; }
  .btn { background: var(--accent); color: #fff; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 20px rgba(37,99,235,.3); transition: transform .15s, box-shadow .15s; }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(37,99,235,.4); }
  .btn-ghost { color: var(--muted); font-size: 14px; font-weight: 600; text-decoration: none; }
  /* Device */
  .device { background: var(--surface); border-radius: 40px; border: 7px solid #D1D9EC; box-shadow: 0 32px 100px rgba(13,17,23,.12); overflow: hidden; width: 260px; margin: 0 auto; }
  .d-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 28px 14px 10px; display: flex; justify-content: space-between; align-items: center; }
  .d-app { font-size: 14px; font-weight: 800; color: var(--accent); }
  .d-live { background: #DCFCE7; color: #16A34A; font-size: 8px; font-weight: 700; padding: 3px 8px; border-radius: 100px; }
  .d-sub-label { font-size: 8px; color: var(--muted); }
  .d-hero { background: var(--accent); margin: 8px; border-radius: 12px; padding: 12px; color: #fff; }
  .d-hero-l { font-size: 8px; opacity: .7; text-transform: uppercase; font-weight: 600; }
  .d-hero-v { font-size: 32px; font-weight: 900; line-height: 1.1; margin: 2px 0; }
  .d-hero-s { font-size: 8px; opacity: .6; }
  .d-row { display: flex; gap: 6px; margin: 0 8px; }
  .d-stat { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 7px; }
  .d-stat-l { font-size: 7px; color: var(--muted); }
  .d-stat-v { font-size: 18px; font-weight: 900; line-height: 1.2; }
  .d-svc-head { font-size: 8px; font-weight: 700; margin: 8px 8px 4px; }
  .d-svc { background: var(--surface); border: 1px solid var(--border); border-radius: 7px; margin: 0 8px 3px; padding: 6px 8px; display: flex; align-items: center; gap: 5px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; }
  .d-svc-n { font-size: 9px; font-weight: 700; font-family: monospace; flex: 1; }
  .d-svc-u { font-size: 9px; font-weight: 700; }
  .d-nav { background: var(--surface); border-top: 1px solid var(--border); display: flex; justify-content: space-around; padding: 8px 0 12px; margin-top: 8px; }
  .d-nav-i { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .d-nav-d { width: 5px; height: 5px; border-radius: 50%; }
  .d-nav-l { font-size: 7px; }
  /* Features */
  .features { max-width: 1120px; margin: 0 auto; padding: 80px 40px; }
  .section-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 40px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 28px; transition: transform .2s, box-shadow .2s; }
  .card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(13,17,23,.07); }
  .card-icon { width: 44px; height: 44px; background: #EFF6FF; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
  .card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .card p { font-size: 13px; color: var(--muted); line-height: 1.6; }
  /* Metrics */
  .metrics-band { background: var(--text); padding: 72px 40px; }
  .metrics-inner { max-width: 1120px; margin: 0 auto; }
  .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; margin-top: 32px; }
  .m-val { font-size: 52px; font-weight: 900; letter-spacing: -2px; color: #fff; line-height: 1; }
  .m-val span { color: #10B981; }
  .m-lbl { font-size: 13px; color: rgba(255,255,255,.5); margin-top: 8px; }
  /* CTA */
  .cta { max-width: 640px; margin: 0 auto; padding: 100px 40px; text-align: center; }
  .cta h2 { font-size: 44px; font-weight: 900; letter-spacing: -2px; margin-bottom: 16px; }
  .cta p { font-size: 17px; color: var(--muted); margin-bottom: 36px; }
  footer { border-top: 1px solid var(--border); padding: 28px 40px; display: flex; justify-content: space-between; align-items: center; max-width: 1120px; margin: 0 auto; }
  footer .logo { font-size: 15px; font-weight: 800; color: var(--accent); }
  footer p { font-size: 12px; color: var(--muted); }
  @media (max-width: 860px) {
    .hero { grid-template-columns: 1fr; padding: 110px 24px 60px; gap: 40px; }
    .grid-3 { grid-template-columns: 1fr; }
    .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
  }
</style>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body>
<nav>
  <a href="#" class="nav-logo">Anchor</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#metrics">Impact</a>
    <a href="https://zenbin.org/p/${SLUG}-viewer">Design file</a>
  </div>
  <a href="https://zenbin.org/p/${SLUG}-mock" class="nav-cta">Interactive mock →</a>
</nav>

<section class="hero">
  <div>
    <div class="eyebrow">Reliability Engineering</div>
    <h1>Deploy with<br><em>confidence.</em></h1>
    <p class="sub">
      Anchor gives engineering teams a real-time view of system health,
      deployment readiness, and on-call coverage — so you ship fast without breaking things.
    </p>
    <div class="actions">
      <a href="https://zenbin.org/p/${SLUG}-mock" class="btn">Explore interactive mock</a>
      <a href="https://zenbin.org/p/${SLUG}-viewer" class="btn-ghost">View design →</a>
    </div>
  </div>
  <div>
    <div class="device">
      <div class="d-header">
        <div><div class="d-app">Anchor</div><div class="d-sub-label">Reliability Dashboard</div></div>
        <div class="d-live">● LIVE</div>
      </div>
      <div class="d-hero">
        <div class="d-hero-l">Overall Reliability</div>
        <div class="d-hero-v">99.7%</div>
        <div class="d-hero-s">↑ 0.2% vs last 30 days · Budget: 87%</div>
      </div>
      <div class="d-row">
        <div class="d-stat"><div class="d-stat-l">Incidents</div><div class="d-stat-v" style="color:#10B981">0</div></div>
        <div class="d-stat"><div class="d-stat-l">Deploys</div><div class="d-stat-v">14</div></div>
        <div class="d-stat"><div class="d-stat-l">MTTR</div><div class="d-stat-v">4m</div></div>
      </div>
      <div class="d-svc-head">Services</div>
      <div class="d-svc"><div class="dot" style="background:#10B981"></div><div class="d-svc-n">api-gateway</div><div class="d-svc-u" style="color:#10B981">100%</div></div>
      <div class="d-svc"><div class="dot" style="background:#10B981"></div><div class="d-svc-n">auth-service</div><div class="d-svc-u" style="color:#10B981">99.9%</div></div>
      <div class="d-svc"><div class="dot" style="background:#F59E0B"></div><div class="d-svc-n">payments</div><div class="d-svc-u" style="color:#F59E0B">99.4%</div></div>
      <div class="d-nav">
        <div class="d-nav-i"><div class="d-nav-d" style="background:#2563EB"></div><div class="d-nav-l" style="color:#2563EB">Home</div></div>
        <div class="d-nav-i"><div class="d-nav-d" style="background:#E2E8F4"></div><div class="d-nav-l" style="color:#667085">Deploy</div></div>
        <div class="d-nav-i"><div class="d-nav-d" style="background:#E2E8F4"></div><div class="d-nav-l" style="color:#667085">Services</div></div>
        <div class="d-nav-i"><div class="d-nav-d" style="background:#E2E8F4"></div><div class="d-nav-l" style="color:#667085">On-Call</div></div>
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-label">What Anchor does</div>
  <div class="grid-3">
    <div class="card"><div class="card-icon">🚦</div><h3>Deploy Confidence Score</h3><p>A 0–100 composite score weighing test coverage, latency, staging canary, and open issues — one number to trust before shipping.</p></div>
    <div class="card"><div class="card-icon">📡</div><h3>Real-time Service Health</h3><p>Monitor every service's uptime, SLA status, and request rates in a scrollable view. Color-coded indicators surface issues instantly.</p></div>
    <div class="card"><div class="card-icon">🔁</div><h3>On-Call Rotation</h3><p>Know who's holding the pager. Track rotation handoffs, escalation policies, and page the on-call engineer in one tap.</p></div>
    <div class="card"><div class="card-icon">⚡</div><h3>Error Budget Tracking</h3><p>Visualise how much of your error budget remains in real time. Never burn through your SLA allowance without warning.</p></div>
    <div class="card"><div class="card-icon">📋</div><h3>Pre-flight Checklists</h3><p>Automated checks against test suites, coverage thresholds, latency budgets, and DB migrations before every deployment.</p></div>
    <div class="card"><div class="card-icon">📊</div><h3>Incident Analytics</h3><p>Track MTTR, MTTD, and incident frequency. Identify on-call load patterns and prove reliability improvements to stakeholders.</p></div>
  </div>
</section>

<section class="metrics-band" id="metrics">
  <div class="metrics-inner">
    <div class="section-label" style="color:rgba(255,255,255,.4)">Impact by the numbers</div>
    <div class="metrics-grid">
      <div><div class="m-val"><span>38</span>%</div><div class="m-lbl">Reduction in MTTR within 60 days</div></div>
      <div><div class="m-val"><span>4</span>m</div><div class="m-lbl">Average time to detect incidents</div></div>
      <div><div class="m-val"><span>99.7</span>%</div><div class="m-lbl">Average reliability across customer fleet</div></div>
      <div><div class="m-val"><span>0</span></div><div class="m-lbl">Failed deploys with confidence ≥ 90</div></div>
    </div>
  </div>
</section>

<section class="cta">
  <h2>Ship fast.<br>Break nothing.</h2>
  <p>Anchor brings deployment confidence, service visibility, and incident readiness into one beautiful dashboard.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
    <a href="https://zenbin.org/p/${SLUG}-mock" class="btn">Explore interactive mock</a>
    <a href="https://zenbin.org/p/${SLUG}-viewer" class="btn-ghost" style="color:var(--muted)">View design →</a>
  </div>
</section>

<footer>
  <div class="logo">Anchor</div>
  <p>Designed by RAM · Design Heartbeat · March 2026</p>
</footer>
</body>
</html>`;

// ─── VIEWER ──────────────────────────────────────────────────────────────────
const penJson = readFileSync(path.join(__dirname, `${SLUG}.pen`), 'utf8');

const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — Design Viewer</title>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #0D1117; color: #F0F4FF; min-height: 100vh; }
  header { padding: 20px 32px; border-bottom: 1px solid #21262D; display: flex; align-items: center; justify-content: space-between; }
  header h1 { font-size: 18px; font-weight: 800; color: #2563EB; }
  header p { font-size: 12px; color: #667085; margin-top: 2px; }
  header a { color: #2563EB; font-size: 13px; font-weight: 600; text-decoration: none; }
  .area { padding: 40px; display: flex; flex-wrap: wrap; gap: 40px; justify-content: center; align-items: flex-start; }
  .screen-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .screen-label { font-size: 11px; font-weight: 600; color: #667085; }
  .frame { width: 260px; height: 565px; background: #F2F5FB; border-radius: 30px; border: 6px solid #2D3748; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.5); display: flex; flex-direction: column; }
  .frame-inner { flex: 1; overflow: auto; padding: 12px; }
  .el-list { font-size: 9px; color: #4A5568; font-family: monospace; }
  footer { padding: 20px 32px; border-top: 1px solid #21262D; text-align: center; }
  footer p { font-size: 12px; color: #667085; }
  footer a { color: #2563EB; }
</style>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
<header>
  <div><h1>${APP_NAME}</h1><p>${TAGLINE} · Design by RAM Heartbeat · March 2026</p></div>
  <a href="https://zenbin.org/p/${SLUG}">← Back to landing</a>
</header>
<div class="area" id="area">
  <p style="color:#667085;font-size:14px;padding:40px;">Loading design…</p>
</div>
<footer>
  <p>
    <a href="https://zenbin.org/p/${SLUG}">Landing</a> ·
    <a href="https://zenbin.org/p/${SLUG}-mock">Interactive Mock ☀◑</a> ·
    RAM Design Studio
  </p>
</footer>
<script>
(function(){
  const pen = window.EMBEDDED_PEN ? JSON.parse(window.EMBEDDED_PEN) : null;
  if (!pen) return;
  const area = document.getElementById('area');
  area.innerHTML = '';
  pen.screens.forEach(s => {
    const wrap = document.createElement('div');
    wrap.className = 'screen-wrap';
    const frame = document.createElement('div');
    frame.className = 'frame';
    // Render a minimal representative preview
    const inner = document.createElement('div');
    inner.className = 'frame-inner';
    const elCount = s.elements ? s.elements.length : 0;
    const sample = s.elements ? s.elements.slice(0,6).map(e => {
      if (e.type === 'text') return \`<div style="margin:2px 0;font-size:\${Math.min(e.size||10, 14)}px;font-weight:\${e.weight||400};color:\${e.color||'#333'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${e.text||''}</div>\`;
      if (e.type === 'rect') return \`<div style="background:\${e.fill||'#eee'};height:\${Math.min(e.h||8, 24)}px;margin:2px 0;border-radius:\${e.r||4}px;"></div>\`;
      if (e.type === 'circle') return \`<div style="background:\${e.fill||'#eee'};width:\${(e.r||4)*2}px;height:\${(e.r||4)*2}px;border-radius:50%;display:inline-block;"></div>\`;
      return '';
    }).join('') : '';
    inner.innerHTML = sample + \`<p class="el-list">…\${elCount} elements total</p>\`;
    frame.appendChild(inner);
    const label = document.createElement('div');
    label.className = 'screen-label';
    label.textContent = s.label || s.id;
    wrap.appendChild(frame);
    wrap.appendChild(label);
    area.appendChild(wrap);
  });
})();
</script>
</body>
</html>`;

console.log('Publishing hero…');
const r1 = await publishPage(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log('Hero:', r1.status, r1.url);

console.log('Publishing viewer…');
const r2 = await publishPage(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Viewer`);
console.log('Viewer:', r2.status, r2.url);

console.log('\n✓ All published!');
console.log(`  Hero:   ${r1.url}`);
console.log(`  Viewer: ${r2.url}`);
console.log(`  Mock:   https://zenbin.org/p/${SLUG}-mock`);
