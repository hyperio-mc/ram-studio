const fs = require('fs');
const https = require('https');

const SLUG = 'forge';
const APP_NAME = 'Forge';
const TAGLINE = 'Command your AI fleet.';

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function publishToZenbin(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Forge — Command your AI fleet.</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#080C14;--surface:#0F1421;--surface-alt:#151C2E;--text:#E2E8FF;--muted:rgba(226,232,255,0.45);--accent:#3D8EFF;--accent2:#8B5CF6;--green:#22D3A0;--red:#F43F5E;--orange:#F59E0B;--border:rgba(226,232,255,0.07);--border-strong:rgba(226,232,255,0.14)}
  body{background:var(--bg);color:var(--text);font-family:'Inter',-apple-system,sans-serif;min-height:100vh;overflow-x:hidden}
  .glow-1{position:fixed;top:-200px;left:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(61,142,255,0.08),transparent 70%);pointer-events:none;z-index:0}
  .glow-2{position:fixed;bottom:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(139,92,246,0.06),transparent 70%);pointer-events:none;z-index:0}
  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:rgba(8,12,20,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
  .logo{font-size:15px;font-weight:800;letter-spacing:2px;color:var(--accent)}
  .nav-links{display:flex;gap:28px}
  .nav-links a{font-size:13px;color:var(--muted);text-decoration:none;transition:color .2s}
  .nav-links a:hover{color:var(--text)}
  .nav-cta{background:var(--accent);color:#fff;font-size:13px;font-weight:700;padding:9px 20px;border-radius:8px;text-decoration:none;transition:opacity .2s}
  .nav-cta:hover{opacity:0.85}
  main{padding-top:80px;position:relative;z-index:1}
  .hero{display:flex;flex-direction:column;align-items:center;text-align:center;padding:80px 24px 60px}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(61,142,255,0.1);border:1px solid rgba(61,142,255,0.25);padding:6px 16px;border-radius:100px;font-size:12px;font-weight:600;color:var(--accent);margin-bottom:28px}
  .hero-badge-dot{width:7px;height:7px;background:var(--green);border-radius:50%;box-shadow:0 0 6px var(--green)}
  h1{font-size:clamp(38px,7vw,68px);font-weight:900;line-height:1.05;letter-spacing:-2px;margin-bottom:24px}
  h1 .accent{color:var(--accent)}
  .hero-sub{font-size:18px;color:var(--muted);max-width:520px;line-height:1.6;margin-bottom:40px}
  .hero-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
  .btn-primary{background:var(--accent);color:#fff;font-size:15px;font-weight:700;padding:14px 30px;border-radius:12px;text-decoration:none;transition:all .2s;display:inline-block}
  .btn-primary:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 8px 30px rgba(61,142,255,0.35)}
  .btn-secondary{background:var(--surface);color:var(--text);font-size:15px;font-weight:600;padding:14px 30px;border-radius:12px;text-decoration:none;border:1px solid var(--border-strong);transition:all .2s;display:inline-block}
  .btn-secondary:hover{background:var(--surface-alt)}
  .stats-bar{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:16px;max-width:640px;width:100%;margin:48px auto 0;overflow:hidden}
  .stat{flex:1;padding:20px 16px;text-align:center;border-right:1px solid var(--border)}
  .stat:last-child{border-right:none}
  .stat-val{font-size:24px;font-weight:900;margin-bottom:4px}
  .stat-label{font-size:10px;color:var(--muted);font-weight:500;letter-spacing:.5px;text-transform:uppercase}
  .features{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;max-width:900px;margin:80px auto;padding:0 24px}
  .feature{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;transition:all .25s}
  .feature:hover{border-color:rgba(61,142,255,0.35);transform:translateY(-2px);box-shadow:0 12px 40px rgba(61,142,255,0.08)}
  .feature-icon{font-size:28px;margin-bottom:16px}
  .feature h3{font-size:16px;font-weight:700;margin-bottom:10px}
  .feature p{font-size:14px;color:var(--muted);line-height:1.6}
  .screens-section{max-width:900px;margin:0 auto 80px;padding:0 24px}
  .screens-section .sec-title{font-size:26px;font-weight:800;margin-bottom:8px;text-align:center}
  .screens-section .sec-sub{font-size:15px;color:var(--muted);text-align:center;margin-bottom:32px}
  .screen-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
  .screen-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center;transition:all .2s}
  .screen-card:hover{border-color:rgba(61,142,255,0.3);transform:translateY(-2px)}
  .screen-thumb{width:100%;aspect-ratio:9/16;background:var(--surface-alt);border-radius:8px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;font-size:24px}
  .screen-name{font-size:11px;font-weight:600;color:var(--text)}
  .cta-section{text-align:center;padding:60px 24px 80px;border-top:1px solid var(--border)}
  .cta-section h2{font-size:34px;font-weight:800;margin-bottom:14px}
  .cta-section p{font-size:16px;color:var(--muted);margin-bottom:32px}
  footer{text-align:center;padding:24px;border-top:1px solid var(--border);font-size:12px;color:var(--muted)}
  @media(max-width:700px){.nav-links{display:none}.stats-bar{flex-direction:column}.stat{border-right:none;border-bottom:1px solid var(--border)}.stat:last-child{border-bottom:none}.screen-grid{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>
<div class="glow-1"></div>
<div class="glow-2"></div>
<nav>
  <div class="logo">⬡ FORGE</div>
  <div class="nav-links">
    <a href="#">Fleet</a><a href="#">Agents</a><a href="#">Pricing</a><a href="#">Docs</a>
  </div>
  <a href="https://ram.zenbin.org/forge-viewer" class="nav-cta">View Prototype →</a>
</nav>
<main>
  <section class="hero">
    <div class="hero-badge"><span class="hero-badge-dot"></span>12 agents active right now</div>
    <h1>Command your<br><span class="accent">AI fleet.</span></h1>
    <p class="hero-sub">Deploy, monitor, and control autonomous AI agents across all your projects — from a single dashboard. Stop babysitting. Start shipping.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/forge-viewer" class="btn-primary">View Interactive Prototype</a>
      <a href="https://ram.zenbin.org/forge-mock" class="btn-secondary">Explore Mock ☀◑</a>
    </div>
    <div class="stats-bar">
      <div class="stat"><div class="stat-val" style="color:var(--accent)">12</div><div class="stat-label">Active Agents</div></div>
      <div class="stat"><div class="stat-val" style="color:var(--green)">847</div><div class="stat-label">Tasks Today</div></div>
      <div class="stat"><div class="stat-val" style="color:var(--text)">98.2%</div><div class="stat-label">Success Rate</div></div>
      <div class="stat"><div class="stat-val" style="color:var(--orange)">$0.50</div><div class="stat-label">Avg Cost/Run</div></div>
    </div>
  </section>
  <section class="features">
    <div class="feature"><div class="feature-icon">⚡</div><h3>Real-time Fleet Monitor</h3><p>See every agent's status, current task, and resource usage the moment it changes.</p></div>
    <div class="feature"><div class="feature-icon">🔁</div><h3>Task Orchestration</h3><p>Queue, prioritize, and route tasks to the right agents automatically. No manual dispatching.</p></div>
    <div class="feature"><div class="feature-icon">📊</div><h3>Execution Logs</h3><p>Full terminal-style logs per agent. See every tool call, edit, and test result in real time.</p></div>
    <div class="feature"><div class="feature-icon">🛡️</div><h3>Review Gates</h3><p>Set approval requirements before agents commit, deploy, or spend beyond your cost threshold.</p></div>
    <div class="feature"><div class="feature-icon">⚙</div><h3>Per-Agent Config</h3><p>Fine-tune model, temperature, tool access, memory mode, and retry logic per agent.</p></div>
    <div class="feature"><div class="feature-icon">🔔</div><h3>Smart Alerts</h3><p>Get notified on errors, cost spikes, or stalled tasks before they become problems.</p></div>
  </section>
  <section class="screens-section">
    <div class="sec-title">5 screens. Full picture.</div>
    <div class="sec-sub">From fleet overview to per-agent terminal logs.</div>
    <div class="screen-grid">
      <div class="screen-card"><div class="screen-thumb">⬡</div><div class="screen-name">Command Center</div></div>
      <div class="screen-card"><div class="screen-thumb">🤖</div><div class="screen-name">Agent Roster</div></div>
      <div class="screen-card"><div class="screen-thumb">📋</div><div class="screen-name">Task Queue</div></div>
      <div class="screen-card"><div class="screen-thumb">📊</div><div class="screen-name">Exec Logs</div></div>
      <div class="screen-card"><div class="screen-thumb">⚙</div><div class="screen-name">Agent Config</div></div>
    </div>
  </section>
  <section class="cta-section">
    <h2>Your agents. Your rules.</h2>
    <p>Full visibility and control over every autonomous agent in your stack.</p>
    <a href="https://ram.zenbin.org/forge-viewer" class="btn-primary">View the Prototype →</a>
  </section>
</main>
<footer>Designed by RAM · Inspired by JetBrains Air &amp; Relace (Lapa.ninja) — AI agent orchestration 2026</footer>
</body>
</html>`;

async function main() {
  console.log('1. Publishing hero page...');
  const h = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log(`   Status ${h.status}:`, h.body.slice(0,150));

  console.log('2. Building viewer...');
  const penJson = fs.readFileSync(`${SLUG}.pen`, 'utf8');
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('   Publishing viewer...');
  const v = await publishToZenbin(`${SLUG}-viewer`, `${APP_NAME} — Prototype Viewer`, viewerHtml);
  console.log(`   Status ${v.status}:`, v.body.slice(0,150));

  console.log('\nURLs:');
  console.log('  Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}
main().catch(console.error);
