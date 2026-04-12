// rally-publish.js — hero + viewer + gallery queue for RALLY
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG      = 'rally';
const APP_NAME  = 'Rally';
const TAGLINE   = 'Your humans and agents, in sync';
const ARCHETYPE = 'productivity-ai-light';
const SUBDOMAIN = 'ram';
const PROMPT    = 'Light-mode AI agent + human team orchestration dashboard, inspired by Linear\'s "teams and agents" era and Agent Insights feature discovered on godly.website.';

const P = {
  bg:        '#F4F3EF',
  surface:   '#FFFFFF',
  surface2:  '#F0EEE9',
  border:    '#E8E6E0',
  text:      '#1A1918',
  textSub:   '#6B6760',
  accent:    '#6D4AFF',
  accentSoft:'#EDE8FF',
  green:     '#1EA97C',
  greenSoft: '#E3F6EF',
  amber:     '#F59E0B',
  amberSoft: '#FEF3C7',
};

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson  = fs.readFileSync(path.join(__dirname, 'rally.pen'), 'utf8');
const penData  = JSON.parse(penJson);
const screens  = penData.screens || [];

// ── HTTP helpers ──────────────────────────────────────────────────────────────
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

function publish(slug, html, title) {
  const body = JSON.stringify({ html, title, overwrite: true });
  return req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    SUBDOMAIN,
    },
  }, body);
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP_NAME} — ${TAGLINE}</title>
<meta name="description" content="AI agent + human team coordination dashboard. Manage your AI fleet alongside your human team.">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg};
    --surface: ${P.surface};
    --surface2: ${P.surface2};
    --border: ${P.border};
    --text: ${P.text};
    --sub: ${P.textSub};
    --accent: ${P.accent};
    --accent-soft: ${P.accentSoft};
    --green: ${P.green};
    --green-soft: ${P.greenSoft};
    --amber: ${P.amber};
    --amber-soft: ${P.amberSoft};
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, 'Inter', system-ui, sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(244,243,239,0.88);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px;
  }
  .nav-logo {
    font-size: 1.05rem; font-weight: 800; letter-spacing: -0.3px;
    color: var(--text); display: flex; align-items: center; gap: 8px;
  }
  .nav-logo-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent); display: inline-block;
  }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a {
    font-size: 0.875rem; color: var(--sub); text-decoration: none; transition: color .2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    font-size: 0.85rem; font-weight: 600;
    padding: 9px 20px; border-radius: 10px; text-decoration: none;
    transition: opacity .2s;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* Hero */
  .hero {
    padding: 140px 40px 80px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1.1fr; gap: 64px;
    align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent-soft); color: var(--accent);
    font-size: 0.75rem; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; padding: 6px 14px; border-radius: 100px;
    margin-bottom: 24px;
  }
  .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
  h1 {
    font-size: clamp(2.4rem, 4vw, 3.4rem);
    font-weight: 800; line-height: 1.1; letter-spacing: -1.5px;
    color: var(--text); margin-bottom: 20px;
  }
  h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: 1.1rem; line-height: 1.6; color: var(--sub);
    max-width: 440px; margin-bottom: 40px;
  }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff;
    font-size: 0.95rem; font-weight: 700;
    padding: 14px 28px; border-radius: 12px; text-decoration: none;
    transition: opacity .2s; box-shadow: 0 4px 24px rgba(109,74,255,0.28);
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-secondary {
    background: var(--surface); color: var(--text);
    border: 1px solid var(--border);
    font-size: 0.95rem; font-weight: 600;
    padding: 14px 28px; border-radius: 12px; text-decoration: none;
    transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: var(--accent); }

  /* Hero illustration — agent stat cards */
  .hero-right {
    display: grid; gap: 14px; position: relative;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 20px 24px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  }
  .stat-card-row { display: flex; align-items: center; gap: 16px; }
  .agent-dot {
    width: 44px; height: 44px; border-radius: 14px;
    background: var(--accent-soft);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 1.1rem; color: var(--accent); flex-shrink: 0;
  }
  .agent-info { flex: 1; }
  .agent-name { font-weight: 700; font-size: 0.95rem; color: var(--text); }
  .agent-task { font-size: 0.8rem; color: var(--sub); margin-top: 2px; }
  .agent-badge {
    font-size: 0.7rem; font-weight: 700;
    padding: 4px 10px; border-radius: 100px;
  }
  .badge-active { background: var(--green-soft); color: var(--green); }
  .badge-review { background: var(--amber-soft); color: var(--amber); }
  .progress-wrap { margin-top: 12px; }
  .progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--sub); margin-bottom: 5px; }
  .progress-bar { height: 5px; background: var(--surface2); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; background: var(--accent); }
  .progress-fill.amber { background: var(--amber); }
  .metrics-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .metric-box { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px; text-align: center; }
  .metric-val { font-size: 1.6rem; font-weight: 800; color: var(--text); }
  .metric-val.accent { color: var(--accent); }
  .metric-val.green  { color: var(--green); }
  .metric-val.amber  { color: var(--amber); }
  .metric-lbl { font-size: 0.7rem; color: var(--sub); margin-top: 4px; }

  /* Features */
  .features {
    padding: 80px 40px;
    max-width: 1100px; margin: 0 auto;
  }
  .section-label {
    font-size: 0.7rem; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: var(--accent); margin-bottom: 10px;
  }
  .section-h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800;
    letter-spacing: -1px; color: var(--text); margin-bottom: 16px;
  }
  .section-sub { font-size: 1rem; color: var(--sub); max-width: 520px; margin-bottom: 56px; line-height: 1.6; }
  .feat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
  .feat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 28px;
    transition: box-shadow .2s, transform .2s;
  }
  .feat-card:hover { box-shadow: 0 8px 32px rgba(109,74,255,0.12); transform: translateY(-2px); }
  .feat-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--accent-soft); display: flex; align-items: center;
    justify-content: center; font-size: 1.3rem; margin-bottom: 16px;
  }
  .feat-title { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .feat-desc { font-size: 0.875rem; color: var(--sub); line-height: 1.55; }

  /* Screens showcase */
  .screens-section {
    padding: 80px 40px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .screens-wrap { max-width: 1100px; margin: 0 auto; }
  .screens-grid { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 16px; }
  .screen-thumb {
    flex-shrink: 0; width: 220px; height: 476px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 28px; overflow: hidden; position: relative;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px;
  }
  .screen-name { font-size: 0.8rem; font-weight: 600; color: var(--accent); }
  .screen-num { font-size: 2.5rem; font-weight: 900; color: var(--accent); opacity: 0.15; }

  /* How it works */
  .how {
    padding: 80px 40px;
    max-width: 1100px; margin: 0 auto;
  }
  .how-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 28px; margin-top: 48px; }
  .how-step { display: flex; flex-direction: column; gap: 12px; }
  .step-num {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--accent); color: #fff;
    font-weight: 800; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
  }
  .step-title { font-weight: 700; font-size: 0.95rem; color: var(--text); }
  .step-desc { font-size: 0.85rem; color: var(--sub); line-height: 1.55; }

  /* Footer */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
    max-width: 1100px; margin: 0 auto;
    font-size: 0.8rem; color: var(--sub);
  }
  .footer-logo { font-weight: 800; color: var(--text); font-size: 0.85rem; }

  /* Responsive */
  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; gap: 40px; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
    .features, .how { padding: 60px 24px; }
    .screens-section { padding: 60px 24px; }
    footer { padding: 32px 24px; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">
    <span class="nav-logo-dot"></span>
    Rally
  </div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock">Mock</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">Try the mock →</a>
</nav>

<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">
      <span class="hero-eyebrow-dot"></span>
      AI-Native Team Coordination
    </div>
    <h1>Where your <em>humans</em> and <em>agents</em> work as one</h1>
    <p class="hero-sub">
      Rally is the coordination layer between your team and your AI agents — assign tasks, track progress, review outputs, and measure the velocity your fleet creates.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Explore the prototype</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary">View screens</a>
    </div>
  </div>

  <div class="hero-right">
    <!-- Metrics row -->
    <div class="metrics-row">
      <div class="metric-box">
        <div class="metric-val green">5</div>
        <div class="metric-lbl">Agents Active</div>
      </div>
      <div class="metric-box">
        <div class="metric-val amber">12</div>
        <div class="metric-lbl">Pending Review</div>
      </div>
      <div class="metric-box">
        <div class="metric-val accent">47</div>
        <div class="metric-lbl">Done Today</div>
      </div>
    </div>

    <!-- Agent card: Aria -->
    <div class="stat-card">
      <div class="stat-card-row">
        <div class="agent-dot">A</div>
        <div class="agent-info">
          <div class="agent-name">Aria <span class="agent-badge badge-active">● Active</span></div>
          <div class="agent-task">Drafting Q1 release notes</div>
        </div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label"><span>Progress</span><span>73%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:73%"></div></div>
      </div>
    </div>

    <!-- Agent card: Nova -->
    <div class="stat-card">
      <div class="stat-card-row">
        <div class="agent-dot">N</div>
        <div class="agent-info">
          <div class="agent-name">Nova <span class="agent-badge badge-review">● Review</span></div>
          <div class="agent-task">PR #1047 — Auth Token Refresh Logic</div>
        </div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label"><span>Confidence</span><span>94%</span></div>
        <div class="progress-bar"><div class="progress-fill amber" style="width:94%"></div></div>
      </div>
    </div>
  </div>
</section>

<!-- Features -->
<section class="features" id="features">
  <div class="section-label">Features</div>
  <h2 class="section-h2">Everything your AI-augmented team needs</h2>
  <p class="section-sub">Designed for product teams in the AI era — where the boundary between human and agent work is fluid.</p>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">⟁</div>
      <div class="feat-title">Agent Fleet Management</div>
      <div class="feat-desc">Monitor every agent in real time. See what they're working on, how confident they are, and when they need you.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">≡</div>
      <div class="feat-title">Unified Task Queue</div>
      <div class="feat-desc">One queue for everything. AI-assigned and human tasks side by side, with priority and confidence signals baked in.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◎</div>
      <div class="feat-title">Structured Review</div>
      <div class="feat-desc">When agents complete work, it flows to Review. Approve, request changes, or route — all in one frictionless flow.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">↗</div>
      <div class="feat-title">Velocity Insights</div>
      <div class="feat-desc">Track hours saved, completion rates, and per-agent performance. Know exactly what your AI investment is returning.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⬡</div>
      <div class="feat-title">Confidence Scoring</div>
      <div class="feat-desc">Every agent output carries a confidence score. High-confidence work flies through; low-confidence work gets flagged early.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◑</div>
      <div class="feat-title">Intelligent Routing</div>
      <div class="feat-desc">Rally learns which agent performs best on which task type and routes automatically — humans stay in the loop for what matters.</div>
    </div>
  </div>
</section>

<!-- Screens -->
<section class="screens-section" id="screens">
  <div class="screens-wrap">
    <div class="section-label">Prototype</div>
    <h2 class="section-h2">${screens.length} screens designed</h2>
    <p class="section-sub">Explore the full interactive mock or browse the screen-by-screen viewer.</p>
    <div class="screens-grid">
      ${screens.map((s,i) => `
      <div class="screen-thumb">
        <div class="screen-num">${String(i+1).padStart(2,'0')}</div>
        <div class="screen-name">${s.name||s.label||'Screen '+(i+1)}</div>
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap;">
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary" style="font-size:0.9rem;padding:12px 24px;">Open Interactive Mock →</a>
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-secondary" style="font-size:0.9rem;padding:12px 24px;">Screen Viewer</a>
    </div>
  </div>
</section>

<!-- How it works -->
<section class="how">
  <div class="section-label">How it works</div>
  <h2 class="section-h2">From chaos to coordination in four steps</h2>
  <div class="how-grid">
    <div class="how-step">
      <div class="step-num">1</div>
      <div class="step-title">Connect your agents</div>
      <div class="step-desc">Plug in any LLM-powered agent via API. Rally wraps them with tracking, confidence scoring, and status reporting.</div>
    </div>
    <div class="how-step">
      <div class="step-num">2</div>
      <div class="step-title">Add tasks to the queue</div>
      <div class="step-desc">Drop tasks in manually, import from Jira/Linear, or let agents create subtasks automatically as they work.</div>
    </div>
    <div class="how-step">
      <div class="step-num">3</div>
      <div class="step-title">Agents work, you watch</div>
      <div class="step-desc">Real-time progress bars, confidence signals, and live status. Know what's happening without babysitting.</div>
    </div>
    <div class="how-step">
      <div class="step-num">4</div>
      <div class="step-title">Review and ship</div>
      <div class="step-desc">Completed work lands in Review with full context. One tap to approve, one tap to request changes, done.</div>
    </div>
  </div>
</section>

<footer>
  <span class="footer-logo">Rally</span>
  <span>RAM Design Heartbeat · ${new Date().toLocaleDateString('en-GB',{month:'long',year:'numeric'})} · Pencil v2.8</span>
  <span>Inspired by Linear "teams + agents" era · godly.website</span>
</footer>

</body>
</html>`;

// ── Viewer HTML ───────────────────────────────────────────────────────────────
const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rally — Prototype Viewer</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${P.bg}; color: ${P.text}; font-family: system-ui, sans-serif; min-height: 100vh; }
.viewer-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(244,243,239,0.92); backdrop-filter: blur(16px);
  border-bottom: 1px solid ${P.border};
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
}
.viewer-logo { font-size: 0.85rem; font-weight: 800; letter-spacing: -0.3px; color: ${P.text}; text-decoration: none; }
.screen-nav { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.screen-btn {
  background: ${P.surface}; border: 1px solid ${P.border}; color: ${P.textSub};
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
  padding: 5px 12px; border-radius: 100px; cursor: pointer; transition: .15s;
}
.screen-btn:hover, .screen-btn.active { background: ${P.accent}; color: #fff; border-color: ${P.accent}; }
.viewer-back { font-size: 0.75rem; color: ${P.textSub}; text-decoration: none; transition: color .2s; }
.viewer-back:hover { color: ${P.text}; }
.phone-wrap {
  display: flex; justify-content: center; align-items: flex-start;
  padding: 80px 24px 48px; min-height: 100vh;
}
.phone-frame {
  width: 390px; height: 844px;
  background: ${P.bg};
  border-radius: 48px;
  border: 2px solid ${P.border};
  box-shadow: 0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.6);
  overflow: hidden; position: relative;
}
.phone-notch {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  width: 110px; height: 30px; background: ${P.text}; border-radius: 20px; z-index: 10; opacity: 0.9;
}
.phone-frame svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; }
</style>
</head>
<body>
<div class="viewer-header">
  <a class="viewer-logo" href="https://ram.zenbin.org/${SLUG}">Rally</a>
  <div class="screen-nav" id="screenNav"></div>
  <a class="viewer-back" href="https://ram.zenbin.org/${SLUG}">← Hero</a>
</div>
<div class="phone-wrap">
  <div class="phone-frame" id="phoneFrame">
    <div class="phone-notch"></div>
    <div style="display:flex;align-items:center;justify-content:center;height:100%;color:${P.textSub}">Loading…</div>
  </div>
</div>
<script>
const pen = window.EMBEDDED_PEN || null;
function colorFromFills(fills) {
  if (!fills || !fills.length) return 'transparent';
  const f = fills[0];
  if (!f || !f.color) return 'transparent';
  const { r, g, b } = f.color;
  const a = f.opacity !== undefined ? f.opacity : 1;
  return \`rgba(\${Math.round(r*255)},\${Math.round(g*255)},\${Math.round(b*255)},\${a})\`;
}
function renderScreen(screen) {
  const W = 390, H = 844;
  const children = screen.children || [];
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  const parts = [\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${W} \${H}" width="\${W}" height="\${H}">\`];

  function renderNode(node, ox, oy) {
    const x = (node.x||0)+ox, y = (node.y||0)+oy;
    const w = node.width||0, h = node.height||0;
    const fill = colorFromFills(node.fills);
    const op = node.opacity !== undefined ? node.opacity : 1;

    if (node.type === 'RECTANGLE') {
      const rx = node.cornerRadius||0;
      let stroke = '';
      if (node.strokes && node.strokes.length) {
        const sc = colorFromFills(node.strokes);
        stroke = \` stroke="\${esc(sc)}" stroke-width="\${node.strokeWeight||1}"\`;
      }
      if (op < 0.01) return;
      parts.push(\`<rect x="\${x.toFixed(1)}" y="\${y.toFixed(1)}" width="\${w}" height="\${h}" rx="\${rx}" fill="\${esc(fill)}" opacity="\${op}"\${stroke}/>\`);
    } else if (node.type === 'TEXT') {
      const fs = node.fontSize||12;
      const fw = node.fontName?.style?.includes('Bold') ? 700 : node.fontName?.style?.includes('Medium') ? 500 : node.fontName?.style?.includes('SemiBold') ? 600 : 400;
      const color = colorFromFills(node.fills);
      const align = node.textAlignHorizontal||'LEFT';
      const anchor = align==='CENTER'?'middle':align==='RIGHT'?'end':'start';
      const xPos = align==='CENTER'?x+(w/2):align==='RIGHT'?x+w:x;
      if (op < 0.01) return;
      parts.push(\`<text x="\${xPos.toFixed(1)}" y="\${(y+fs).toFixed(1)}" font-size="\${fs}" font-weight="\${fw}" fill="\${esc(color)}" opacity="\${op}" text-anchor="\${anchor}" font-family="system-ui,sans-serif">\${esc(node.characters||'')}</text>\`);
    } else if (node.type === 'FRAME' || node.type === 'GROUP') {
      if (node.fills && node.fills.length && fill !== 'transparent') {
        const rx = node.cornerRadius||0;
        parts.push(\`<rect x="\${x.toFixed(1)}" y="\${y.toFixed(1)}" width="\${w}" height="\${h}" rx="\${rx}" fill="\${esc(fill)}" opacity="\${op}"/>\`);
      }
      (node.children||[]).forEach(c => renderNode(c, x, y));
    }
  }

  (screen.children||[]).forEach(c => renderNode(c, 0, 0));
  parts.push('</svg>');
  return parts.join('');
}

if (pen) {
  const data = typeof pen === 'string' ? JSON.parse(pen) : pen;
  const screens = data.screens || [];
  const nav = document.getElementById('screenNav');
  const frame = document.getElementById('phoneFrame');
  function show(idx) {
    frame.innerHTML = renderScreen(screens[idx]);
    const n = document.createElement('div'); n.className = 'phone-notch';
    frame.appendChild(n);
    document.querySelectorAll('.screen-btn').forEach((b,i)=>b.classList.toggle('active',i===idx));
  }
  screens.forEach((s,i)=>{
    const btn = document.createElement('button');
    btn.className = 'screen-btn' + (i===0?' active':'');
    btn.textContent = s.name||s.label||('Screen '+(i+1));
    btn.onclick = ()=>show(i);
    nav.appendChild(btn);
  });
  show(0);
}
<\/script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
const viewerHtml = viewerTemplate.replace('<script>', injection + '\n<script>');

// ── Gallery queue ─────────────────────────────────────────────────────────────
async function updateGallery() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
  });
  if (getRes.status !== 200) { console.warn('Gallery GET failed:', getRes.status); return null; }
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  let queue = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
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
    viewer_url: `https://ram.zenbin.org/${SLUG}-viewer`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: screens.length,
    source: 'heartbeat',
    theme: 'light',
    palette: P,
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? '✓ updated' : `✗ ${putRes.status} ${putRes.body.slice(0,80)}`);
  return newEntry;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Publishing ${APP_NAME}...`);

  const heroRes = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero (${SLUG}): ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log(`Viewer (${SLUG}-viewer): ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  const entry = await updateGallery();

  console.log('\n✓ Rally published:');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock  (Svelte build next)`);
})().catch(e => { console.error('Error:', e); process.exit(1); });
