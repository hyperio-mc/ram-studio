// conductor-hero.js — publishes hero page + viewer for Conductor
const fs = require('fs');
const https = require('https');

const SLUG = 'conductor';
const APP_NAME = 'Conductor';
const TAGLINE = 'Orchestrate your AI agents, effortlessly';

// ─── Publish helper ──────────────────────────────────────────────────────────
function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const opts = {
      hostname: 'ram.zenbin.org',
      path: `/${slug}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Hero HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #F5F4F1;
    --surface: #FFFFFF;
    --surf2:   #ECEAE5;
    --text:    #18181A;
    --sub:     #6B6A6E;
    --accent:  #5046E5;
    --accent2: #F59E0B;
    --accent3: #22C55E;
    --danger:  #EF4444;
    --border:  rgba(24,24,26,0.09);
    --shadow:  0 2px 16px rgba(80,70,229,0.10);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* NAV */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(245,244,241,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
  }
  .nav-logo { font-size: 15px; font-weight: 800; letter-spacing: 1.5px; color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 13px; color: var(--sub); text-decoration: none; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    font-size: 13px; font-weight: 700; color: #fff;
    background: var(--accent); border-radius: 10px;
    padding: 8px 20px; text-decoration: none;
    transition: opacity 0.15s;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* HERO */
  .hero {
    max-width: 1100px; margin: 0 auto;
    padding: 100px 40px 60px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(80,70,229,0.08); border: 1px solid rgba(80,70,229,0.15);
    border-radius: 100px; padding: 5px 14px;
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    color: var(--accent); text-transform: uppercase; margin-bottom: 24px;
  }
  .hero-eyebrow span { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:0.3 } }

  h1 {
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 900; line-height: 1.1;
    letter-spacing: -1.5px; margin-bottom: 20px;
  }
  h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: 18px; color: var(--sub); line-height: 1.7;
    max-width: 440px; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff;
    font-size: 15px; font-weight: 700;
    padding: 14px 28px; border-radius: 12px;
    text-decoration: none; transition: all 0.15s;
    box-shadow: 0 4px 20px rgba(80,70,229,0.3);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(80,70,229,0.4); }
  .btn-secondary {
    background: var(--surface); color: var(--text);
    font-size: 15px; font-weight: 600;
    padding: 14px 28px; border-radius: 12px;
    text-decoration: none; border: 1px solid var(--border);
    transition: border-color 0.15s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* HERO VISUAL */
  .hero-visual { position: relative; }
  .phone-frame {
    width: 260px; margin: 0 auto;
    background: var(--surface); border-radius: 38px;
    border: 2px solid var(--border);
    box-shadow: 0 24px 80px rgba(0,0,0,0.12), 0 4px 16px rgba(80,70,229,0.08);
    overflow: hidden; padding: 16px 14px 12px;
  }
  .phone-notch {
    width: 80px; height: 22px; background: var(--text);
    border-radius: 0 0 14px 14px; margin: 0 auto 16px;
  }
  /* mini dashboard preview */
  .mini-screen { background: var(--bg); border-radius: 20px; padding: 14px; }
  .mini-header { font-size: 9px; font-weight: 800; letter-spacing: 1px; color: var(--accent); margin-bottom: 8px; }
  .mini-title { font-size: 13px; font-weight: 800; margin-bottom: 2px; }
  .mini-sub { font-size: 9px; color: var(--sub); margin-bottom: 12px; }
  .mini-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px; }
  .mini-metric {
    background: var(--surface); border-radius: 8px;
    padding: 8px 6px; border: 1px solid var(--border);
  }
  .mini-metric-label { font-size: 7px; color: var(--sub); margin-bottom: 2px; }
  .mini-metric-value { font-size: 16px; font-weight: 900; }
  .mini-agents { display: flex; flex-direction: column; gap: 6px; }
  .mini-agent {
    background: var(--surface); border-radius: 8px;
    padding: 8px 10px; border: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
    border-left: 3px solid;
  }
  .mini-agent.running { border-left-color: var(--accent3); }
  .mini-agent.error   { border-left-color: var(--danger); }
  .mini-agent.idle    { border-left-color: var(--surf2); }
  .mini-agent-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .mini-agent-info { flex: 1; min-width: 0; }
  .mini-agent-name { font-size: 9px; font-weight: 700; }
  .mini-agent-task { font-size: 8px; color: var(--sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mini-agent-pct { font-size: 8px; font-weight: 700; }

  /* floating badge */
  .float-badge {
    position: absolute; bottom: 20px; right: -10px;
    background: var(--surface); border-radius: 14px;
    padding: 10px 16px; border: 1px solid var(--border);
    box-shadow: var(--shadow);
    font-size: 12px; white-space: nowrap;
  }
  .float-badge strong { color: var(--accent3); }

  /* FEATURES */
  .section { max-width: 1100px; margin: 0 auto; padding: 80px 40px; }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    color: var(--sub); text-transform: uppercase; margin-bottom: 12px;
  }
  .section-title { font-size: 36px; font-weight: 900; letter-spacing: -1px; margin-bottom: 16px; }
  .section-sub { font-size: 17px; color: var(--sub); max-width: 520px; line-height: 1.7; margin-bottom: 56px; }

  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .feature-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(80,70,229,0.08);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-title { font-size: 15px; font-weight: 800; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--sub); line-height: 1.65; }

  /* AGENT STATUS DEMO */
  .demo-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
  .agents-table {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden;
  }
  .table-header {
    display: grid; grid-template-columns: 2fr 3fr 1fr 1fr 100px;
    gap: 16px; padding: 14px 24px;
    border-bottom: 1px solid var(--border);
    font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
    color: var(--sub); text-transform: uppercase;
  }
  .agent-row {
    display: grid; grid-template-columns: 2fr 3fr 1fr 1fr 100px;
    gap: 16px; padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    align-items: center;
    transition: background 0.15s;
  }
  .agent-row:last-child { border-bottom: none; }
  .agent-row:hover { background: var(--bg); }
  .agent-name { font-weight: 700; font-size: 14px; }
  .agent-task { font-size: 13px; color: var(--sub); }
  .agent-speed { font-size: 13px; font-weight: 600; }
  .agent-done { font-size: 13px; font-weight: 700; color: var(--accent); }
  .status-pill {
    font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
    padding: 4px 10px; border-radius: 100px; display: inline-block;
  }
  .status-pill.running { background: rgba(34,197,94,0.12); color: var(--accent3); }
  .status-pill.idle    { background: var(--surf2); color: var(--sub); }
  .status-pill.error   { background: rgba(239,68,68,0.10); color: var(--danger); }

  /* SCREENS PREVIEW */
  .screens-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
  .screens-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .screen-thumb {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
    aspect-ratio: 9/16; display: flex; flex-direction: column;
  }
  .screen-thumb-top { flex: 1; background: var(--bg); display: flex; align-items: center; justify-content: center; }
  .screen-thumb-label {
    padding: 10px 12px; font-size: 11px; font-weight: 600;
    color: var(--sub); border-top: 1px solid var(--border);
  }
  .screen-icon { font-size: 28px; opacity: 0.4; }

  /* CTA BANNER */
  .cta-banner {
    max-width: 1100px; margin: 0 auto 80px;
    padding: 0 40px;
  }
  .cta-inner {
    background: var(--accent); border-radius: 24px;
    padding: 60px 60px; display: flex;
    align-items: center; justify-content: space-between;
    gap: 40px; flex-wrap: wrap;
  }
  .cta-inner h2 { font-size: 32px; font-weight: 900; color: #fff; letter-spacing: -0.5px; max-width: 400px; }
  .cta-inner p  { color: rgba(255,255,255,0.7); font-size: 16px; margin-top: 8px; }
  .btn-white {
    background: #fff; color: var(--accent);
    font-size: 15px; font-weight: 800;
    padding: 16px 32px; border-radius: 12px;
    text-decoration: none; white-space: nowrap;
    transition: transform 0.15s;
    flex-shrink: 0;
  }
  .btn-white:hover { transform: translateY(-2px); }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border);
    padding: 32px 40px;
    display: flex; justify-content: space-between; align-items: center;
    max-width: 1100px; margin: 0 auto;
    font-size: 12px; color: var(--sub);
  }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 60px 20px 40px; gap: 40px; }
    .features-grid { grid-template-columns: 1fr; }
    .screens-grid { grid-template-columns: repeat(3, 1fr); }
    .table-header, .agent-row { grid-template-columns: 1fr 1fr; gap: 8px; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    .cta-inner { padding: 40px 28px; }
  }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo">CONDUCTOR</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#agents">Agents</a>
    <a href="#screens">Screens</a>
  </div>
  <a href="/conductor-viewer" class="nav-cta">View Design ↗</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow"><span></span> AI Agent Orchestration</div>
    <h1>Multitask with agents,<br><em>stay in control</em></h1>
    <p class="hero-sub">Conductor gives you a clear view of every AI agent running in your stack — dispatch tasks, monitor progress, and debug errors without switching tabs.</p>
    <div class="hero-actions">
      <a href="/conductor-viewer" class="btn-primary">View Interactive Design →</a>
      <a href="/conductor-mock" class="btn-secondary">☀◑ Mock App</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="mini-screen">
        <div class="mini-header">CONDUCTOR</div>
        <div class="mini-title">Good morning, Rakis</div>
        <div class="mini-sub">3 agents active · 2 tasks queued</div>
        <div class="mini-metrics">
          <div class="mini-metric">
            <div class="mini-metric-label">Active</div>
            <div class="mini-metric-value" style="color:#22C55E">3</div>
          </div>
          <div class="mini-metric">
            <div class="mini-metric-label">Done</div>
            <div class="mini-metric-value" style="color:#5046E5">47</div>
          </div>
          <div class="mini-metric">
            <div class="mini-metric-label">Speed</div>
            <div class="mini-metric-value" style="color:#F59E0B">1.8s</div>
          </div>
        </div>
        <div class="mini-agents">
          <div class="mini-agent running">
            <div class="mini-agent-dot" style="background:#22C55E"></div>
            <div class="mini-agent-info">
              <div class="mini-agent-name">Researcher</div>
              <div class="mini-agent-task">Scanning tech papers · batch 4/12</div>
            </div>
            <div class="mini-agent-pct" style="color:#5046E5">67%</div>
          </div>
          <div class="mini-agent running">
            <div class="mini-agent-dot" style="background:#22C55E"></div>
            <div class="mini-agent-info">
              <div class="mini-agent-name">Codesmith</div>
              <div class="mini-agent-task">Refactoring auth module</div>
            </div>
            <div class="mini-agent-pct" style="color:#5046E5">34%</div>
          </div>
          <div class="mini-agent error">
            <div class="mini-agent-dot" style="background:#EF4444"></div>
            <div class="mini-agent-info">
              <div class="mini-agent-name">Validator</div>
              <div class="mini-agent-task">Schema lint failed · retry #2</div>
            </div>
            <div class="mini-agent-pct" style="color:#EF4444">ERR</div>
          </div>
          <div class="mini-agent idle">
            <div class="mini-agent-dot" style="background:#ECEAE5"></div>
            <div class="mini-agent-info">
              <div class="mini-agent-name">Summariser</div>
              <div class="mini-agent-task">Idle — awaiting task</div>
            </div>
            <div class="mini-agent-pct" style="color:#6B6A6E">—</div>
          </div>
        </div>
      </div>
    </div>
    <div class="float-badge">
      <strong>↑ 96%</strong> task success rate today
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="section" id="features">
  <div class="section-label">Why Conductor</div>
  <h2 class="section-title">Everything your agent fleet needs</h2>
  <p class="section-sub">Designed for builders running multiple AI agents in parallel — no more checking logs across five different terminals.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⬡</div>
      <div class="feature-title">Unified Dashboard</div>
      <div class="feature-desc">See all agents, their current tasks, and live progress at a glance. Color-coded status strips and real-time feed keep you in sync.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◫</div>
      <div class="feature-title">Task Queue</div>
      <div class="feature-desc">Manage your backlog across all agents. Prioritise, reassign, or cancel tasks in one tap. Queue items auto-assign to available agents.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◩</div>
      <div class="feature-title">Analytics</div>
      <div class="feature-desc">Heatmaps, per-agent task charts, efficiency scores, and error rates — all in one view. Spot bottlenecks before they slow you down.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <div class="feature-title">Instant Compose</div>
      <div class="feature-desc">Write task instructions, pick an agent, set priority and run mode. One screen, dispatched in seconds. No config files, no CLI.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔍</div>
      <div class="feature-title">Deep Agent View</div>
      <div class="feature-desc">Drill into any agent — full activity log, task-per-hour sparklines, accuracy metrics. Understand what's happening at every step.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🛡️</div>
      <div class="feature-title">Error Recovery</div>
      <div class="feature-desc">Errors surface immediately with retry context. Red status strips and the live feed highlight failures so nothing silently fails overnight.</div>
    </div>
  </div>
</section>

<!-- AGENT TABLE DEMO -->
<section class="demo-section" id="agents">
  <div class="section-label">Live Agent Fleet</div>
  <h2 class="section-title" style="font-size:28px; margin-bottom:24px;">All agents. One table.</h2>
  <div class="agents-table">
    <div class="table-header">
      <div>Agent</div>
      <div>Current Task</div>
      <div>Speed</div>
      <div>Done Today</div>
      <div>Status</div>
    </div>
    <div class="agent-row">
      <div class="agent-name">Researcher</div>
      <div class="agent-task">Scanning tech papers · batch 4 of 12</div>
      <div class="agent-speed">2.1s</div>
      <div class="agent-done">36</div>
      <div><span class="status-pill running">RUNNING</span></div>
    </div>
    <div class="agent-row">
      <div class="agent-name">Codesmith</div>
      <div class="agent-task">Refactoring auth module · pass 2</div>
      <div class="agent-speed">4.8s</div>
      <div class="agent-done">11</div>
      <div><span class="status-pill running">RUNNING</span></div>
    </div>
    <div class="agent-row">
      <div class="agent-name">Summariser</div>
      <div class="agent-task">Idle — awaiting task assignment</div>
      <div class="agent-speed">—</div>
      <div class="agent-done">22</div>
      <div><span class="status-pill idle">IDLE</span></div>
    </div>
    <div class="agent-row">
      <div class="agent-name">Validator</div>
      <div class="agent-task">Schema lint failed · retry #2</div>
      <div class="agent-speed">1.2s</div>
      <div class="agent-done">8</div>
      <div><span class="status-pill error">ERROR</span></div>
    </div>
  </div>
</section>

<!-- SCREENS PREVIEW -->
<section class="screens-section" id="screens">
  <div class="section-label">Design Screens</div>
  <h2 class="section-title" style="font-size:28px; margin-bottom: 24px;">5 screens. Every workflow covered.</h2>
  <div class="screens-grid">
    <div class="screen-thumb">
      <div class="screen-thumb-top"><div class="screen-icon">⬡</div></div>
      <div class="screen-thumb-label">Overview</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-thumb-top"><div class="screen-icon">◈</div></div>
      <div class="screen-thumb-label">Agent Detail</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-thumb-top"><div class="screen-icon">◫</div></div>
      <div class="screen-thumb-label">Task Queue</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-thumb-top"><div class="screen-icon">◩</div></div>
      <div class="screen-thumb-label">Analytics</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-thumb-top"><div class="screen-icon">+</div></div>
      <div class="screen-thumb-label">Compose</div>
    </div>
  </div>
  <div style="margin-top:24px; display:flex; gap:14px; flex-wrap:wrap;">
    <a href="/conductor-viewer" class="btn-primary" style="font-size:14px; padding:12px 24px;">Open Pencil Viewer →</a>
    <a href="/conductor-mock" class="btn-secondary" style="font-size:14px; padding:12px 24px;">Interactive Mock ☀◑</a>
  </div>
</section>

<!-- CTA -->
<div class="cta-banner">
  <div class="cta-inner">
    <div>
      <h2>Ready to orchestrate your agents?</h2>
      <p>Open the interactive mock to explore all 5 screens in light and dark mode.</p>
    </div>
    <a href="/conductor-mock" class="btn-white">Explore Mock →</a>
  </div>
</div>

<footer>
  <div>CONDUCTOR · RAM Design Heartbeat · March 2026</div>
  <div>Inspired by JetBrains Air on lapa.ninja · Midday.ai on darkmodedesign.com</div>
</footer>

</body>
</html>`;

// ─── Viewer HTML ─────────────────────────────────────────────────────────────
const viewerTemplate = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/conductor.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
let viewerHtml = viewerTemplate.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero page...');
  const heroRes = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));

  console.log('Publishing viewer...');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Pencil Viewer`);
  console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));
})();
