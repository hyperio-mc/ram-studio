/**
 * mill-publish.js  —  hero page + viewer for MILL
 */
'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG = 'mill';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
      },
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(body); r.end();
  });
}

// ── Hero page ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MILL — set tasks in motion</title>
<meta name="description" content="Personal AI task orchestrator. Delegate to agents, stay in control. Inspired by JetBrains Air and Old Tom Capital's paper aesthetic.">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #F5F1EB;
    --card:    #FFFFFF;
    --ink:     #1A1715;
    --ink2:    #4A4540;
    --muted:   #9E9690;
    --divider: #E4DFD8;
    --green:   #2D6A4F;
    --green-lt:#D8EDE3;
    --amber:   #C4741A;
    --amber-lt:#FBF0E0;
  }

  html { background: var(--bg); color: var(--ink); }

  body {
    font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
    background: var(--bg);
    min-height: 100vh;
  }

  /* ── NAV ── */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid var(--divider);
    background: var(--bg);
    position: sticky; top: 0; z-index: 10;
  }
  .logo {
    font-family: Georgia, serif; font-size: 22px; font-weight: 700;
    letter-spacing: 0.05em; color: var(--ink);
    text-decoration: none;
  }
  .logo span { color: var(--green); }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a {
    font-size: 13px; color: var(--muted); text-decoration: none;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--ink); }
  .nav-cta {
    background: var(--green); color: #fff; border: none;
    padding: 9px 20px; border-radius: 8px; font-size: 13px;
    font-weight: 600; cursor: pointer; text-decoration: none;
  }

  /* ── HERO ── */
  .hero {
    max-width: 960px; margin: 0 auto;
    padding: 80px 40px 60px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
    align-items: center;
  }
  .hero-copy h1 {
    font-family: Georgia, serif; font-size: 52px; line-height: 1.1;
    font-weight: 700; color: var(--ink); margin-bottom: 16px;
  }
  .hero-copy h1 em { color: var(--green); font-style: normal; }
  .hero-copy p {
    font-size: 17px; color: var(--ink2); line-height: 1.65;
    margin-bottom: 28px; max-width: 420px;
  }
  .hero-actions { display: flex; gap: 12px; align-items: center; }
  .btn-primary {
    background: var(--green); color: #fff;
    padding: 13px 28px; border-radius: 10px;
    font-size: 15px; font-weight: 600;
    text-decoration: none; display: inline-block;
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.9; }
  .btn-secondary {
    color: var(--ink2); font-size: 14px; text-decoration: none;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-secondary:hover { color: var(--ink); }

  /* ── Phone mock ── */
  .phone-wrap {
    display: flex; justify-content: center;
  }
  .phone {
    width: 240px; height: 490px;
    background: var(--card);
    border-radius: 36px;
    box-shadow: 0 24px 80px rgba(26,23,21,0.14), 0 4px 16px rgba(26,23,21,0.06);
    overflow: hidden; position: relative;
    border: 1px solid var(--divider);
  }
  .phone-screen {
    width: 100%; height: 100%; padding: 0;
    display: flex; flex-direction: column;
    background: var(--bg);
  }
  .phone-status {
    background: var(--bg); padding: 10px 14px 4px;
    display: flex; justify-content: space-between;
    font-size: 9px; font-family: monospace; color: var(--ink2);
  }
  .phone-header { padding: 8px 14px 6px; }
  .phone-header .greeting {
    font-family: Georgia, serif; font-size: 15px; font-weight: 700; color: var(--ink);
  }
  .phone-header .date { font-size: 9px; color: var(--muted); margin-top: 2px; }

  .metrics-row {
    display: flex; gap: 6px; padding: 0 10px 8px;
  }
  .metric-card {
    flex: 1; background: var(--card); border-radius: 8px; padding: 8px;
  }
  .metric-card .num {
    font-family: monospace; font-size: 18px; font-weight: 700; color: var(--ink);
  }
  .metric-card .num.green { color: var(--green); }
  .metric-card .lbl { font-size: 8px; color: var(--muted); margin-top: 2px; }

  .section-label {
    font-size: 8px; color: var(--muted); font-weight: 600;
    letter-spacing: 0.08em; padding: 4px 14px 2px;
    border-top: 1px solid var(--divider);
  }

  .task-item {
    margin: 4px 10px; background: var(--card); border-radius: 6px;
    padding: 7px 8px 7px 12px; display: flex; align-items: flex-start;
    gap: 8px; border-left: 3px solid var(--green); position: relative;
  }
  .task-item.amber { border-color: var(--amber); }
  .task-item.red   { border-color: #c0392b; }

  .task-body { flex: 1; }
  .task-title { font-size: 9px; font-weight: 600; color: var(--ink); }
  .task-sub   { font-size: 8px; color: var(--muted); margin-top: 2px; }
  .task-tag {
    font-size: 7px; padding: 1px 6px; border-radius: 8px;
    background: var(--green-lt); color: var(--green); font-weight: 600;
    display: inline-block; margin-top: 3px;
  }
  .task-tag.amber { background: var(--amber-lt); color: var(--amber); }

  .phone-nav {
    margin-top: auto;
    background: var(--card);
    border-top: 1px solid var(--divider);
    padding: 6px 0;
    display: flex; justify-content: space-around;
  }
  .nav-item { text-align: center; }
  .nav-icon { font-size: 12px; color: var(--muted); }
  .nav-icon.active { color: var(--green); }
  .nav-text { font-size: 7px; color: var(--muted); margin-top: 2px; }
  .nav-text.active { color: var(--green); font-weight: 600; }

  /* ── FEATURES ── */
  .features {
    max-width: 960px; margin: 0 auto;
    padding: 40px 40px 80px;
    border-top: 1px solid var(--divider);
  }
  .features h2 {
    font-family: Georgia, serif; font-size: 30px; color: var(--ink);
    margin-bottom: 40px; text-align: center;
  }
  .feature-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  .feature-card {
    background: var(--card); border-radius: 12px; padding: 24px;
    border: 1px solid var(--divider);
  }
  .feature-icon { font-size: 24px; margin-bottom: 12px; }
  .feature-card h3 { font-size: 15px; color: var(--ink); margin-bottom: 8px; font-weight: 600; }
  .feature-card p  { font-size: 13px; color: var(--ink2); line-height: 1.6; }

  /* ── INSPIRATION CALLOUT ── */
  .inspiration {
    max-width: 960px; margin: 0 auto 60px;
    padding: 24px 40px;
    background: var(--card); border-radius: 12px;
    border: 1px solid var(--divider);
    display: flex; gap: 20px; align-items: flex-start;
  }
  .insp-icon { font-size: 28px; flex-shrink: 0; }
  .insp-content h4 { font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; letter-spacing: 0.06em; }
  .insp-content p  { font-size: 13px; color: var(--ink2); line-height: 1.6; }
  .insp-content strong { color: var(--ink); }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--divider);
    padding: 24px 40px;
    display: flex; justify-content: space-between; align-items: center;
    max-width: 960px; margin: 0 auto;
  }
  footer p { font-size: 12px; color: var(--muted); }
  footer a { color: var(--green); text-decoration: none; font-size: 12px; }

  @media (max-width: 700px) {
    .hero { grid-template-columns: 1fr; padding: 40px 20px; gap: 40px; }
    .hero-copy h1 { font-size: 36px; }
    .feature-grid { grid-template-columns: 1fr; }
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
    footer { flex-direction: column; gap: 12px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <a class="logo" href="#">M<span>I</span>LL</a>
  <div class="nav-links">
    <a href="#">Features</a>
    <a href="#">Agents</a>
    <a href="#">Pricing</a>
  </div>
  <a class="nav-cta" href="/mill-mock">View Mock →</a>
</nav>

<section class="hero">
  <div class="hero-copy">
    <h1>Set tasks<br><em>in motion.</em></h1>
    <p>Delegate to specialised agents in plain language. Mill assigns the right agent, tracks progress, and reports back — so you stay in control without micromanaging.</p>
    <div class="hero-actions">
      <a class="btn-primary" href="/mill-mock">Explore Interactive Mock →</a>
      <a class="btn-secondary" href="/mill-viewer">View Design ↗</a>
    </div>
  </div>
  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status">
          <span>9:41</span><span>●●● ✦ 87%</span>
        </div>
        <div class="phone-header">
          <div class="greeting">Good morning, Alex.</div>
          <div class="date">Saturday, March 28</div>
        </div>
        <div class="metrics-row">
          <div class="metric-card"><div class="num">12</div><div class="lbl">Active</div></div>
          <div class="metric-card"><div class="num">7</div><div class="lbl">Done today</div></div>
          <div class="metric-card"><div class="num green">3/5</div><div class="lbl">Agents on</div></div>
        </div>
        <div class="section-label">IN PROGRESS</div>
        <div class="task-item">
          <div class="task-body">
            <div class="task-title">Research competitors for Q2</div>
            <div class="task-sub">Researcher · 80% done</div>
            <span class="task-tag">Research</span>
          </div>
        </div>
        <div class="task-item amber">
          <div class="task-body">
            <div class="task-title">Draft onboarding emails (5x)</div>
            <div class="task-sub">Writer · 45% done</div>
            <span class="task-tag amber">Writing</span>
          </div>
        </div>
        <div class="section-label">AGENT ACTIVITY</div>
        <div style="padding:4px 10px">
          <div style="display:flex;align-items:center;gap:8px;background:var(--card);border-radius:14px;padding:5px 10px;margin-bottom:4px">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--green)"></div>
            <div>
              <div style="font-size:9px;font-weight:600;color:var(--ink)">Researcher</div>
              <div style="font-size:8px;color:var(--muted)">Writing report…</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;background:var(--card);border-radius:14px;padding:5px 10px">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--amber)"></div>
            <div>
              <div style="font-size:9px;font-weight:600;color:var(--ink)">Writer</div>
              <div style="font-size:8px;color:var(--muted)">Drafting email 3/5…</div>
            </div>
          </div>
        </div>
        <div class="phone-nav">
          <div class="nav-item"><div class="nav-icon active">⊞</div><div class="nav-text active">Home</div></div>
          <div class="nav-item"><div class="nav-icon">✓</div><div class="nav-text">Tasks</div></div>
          <div class="nav-item"><div class="nav-icon">◈</div><div class="nav-text">Agents</div></div>
          <div class="nav-item"><div class="nav-icon">+</div><div class="nav-text">New</div></div>
          <div class="nav-item"><div class="nav-icon">〜</div><div class="nav-text">Insights</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<div style="max-width:960px;margin:0 auto;padding:0 40px 20px">
  <div class="inspiration">
    <div class="insp-icon">✦</div>
    <div class="insp-content">
      <h4>DESIGN RESEARCH — MARCH 28, 2026</h4>
      <p>Inspired by <strong>JetBrains Air</strong> on lapa.ninja — "Multitask with agents, stay in control" — a light, functional, airy interface for developer agent tooling. Paired with <strong>Old Tom Capital</strong> on minimal.gallery, whose warm parchment + editorial serif aesthetic translated beautifully into a paper-ledger feel for an AI task tool.</p>
    </div>
  </div>
</div>

<section class="features">
  <h2>Everything you need to delegate well.</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">✦</div>
      <h3>Natural language input</h3>
      <p>Just describe what you need. Mill parses your intent and suggests the best agent for the job — no templates, no structure required.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <h3>Specialised agents</h3>
      <p>Five purpose-built agents: Researcher, Writer, Dev, Scheduler, Analyst. Each with its own capability set and load tracking.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">〜</div>
      <h3>Live insights</h3>
      <p>See completion rates, time saved, and agent performance trends at a glance. Know which agents are working hardest and where to optimise.</p>
    </div>
  </div>
</section>

<footer>
  <p>MILL — set tasks in motion · RAM Design Heartbeat · March 28, 2026</p>
  <a href="/mill-viewer">View .pen file →</a>
</footer>

</body>
</html>`;

// ── Viewer page ────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/renderer.html', 'utf8');
const penJson  = fs.readFileSync('mill.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero page…');
  const h = await publish(SLUG, heroHtml, 'MILL — set tasks in motion');
  console.log('Hero:', h.status, h.body.slice(0, 80));

  console.log('Publishing viewer…');
  const v = await publish(SLUG + '-viewer', viewerHtml, 'MILL — Design Viewer');
  console.log('Viewer:', v.status, v.body.slice(0, 80));

  console.log('\nURLs:');
  console.log('  Hero   → https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer → https://ram.zenbin.org/' + SLUG + '-viewer');
})();
