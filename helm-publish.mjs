// helm-publish.mjs — HELM hero + viewer + mock publish
// Inspired by: Linear "teams and agents" March 2026 UI refresh
// + Mixpanel mint/teal AI-first analytics palette (godly.website)

import fs from 'fs';
import https from 'https';

const SLUG      = 'helm';
const APP_NAME  = 'HELM';
const TAGLINE   = 'Command your agents. Ship faster.';
const ARCHETYPE = 'ai-agent-orchestration';
const PROMPT    = 'Design a dark AI agent orchestration dashboard inspired by Linear\'s "teams and agents" feature and Mixpanel\'s AI-first analytics aesthetic. 5 screens: Overview, Agent Detail, Queue, Activity Feed, Settings.';

// ── Publish helper ─────────────────────────────────────────────────────────────
function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}` });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:      '#0C0D10',
  surface: '#141720',
  surf2:   '#1C2133',
  text:    '#E8E6F0',
  muted:   'rgba(232,230,240,0.5)',
  accent:  '#7EE2D4',
  violet:  '#A78CF4',
  orange:  '#F5864E',
  green:   '#5DD88A',
  red:     '#F06060',
  gold:    '#F0C060',
  border:  'rgba(255,255,255,0.07)',
};

// ═══════════════════════════════════════════════════════════════════════════════
// HERO PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HELM — Command your agents. Ship faster.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg};
    --surface: ${P.surface};
    --surf2: ${P.surf2};
    --text: ${P.text};
    --muted: ${P.muted};
    --accent: ${P.accent};
    --violet: ${P.violet};
    --orange: ${P.orange};
    --green: ${P.green};
    --border: ${P.border};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Space Grotesk', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(12,13,16,0.85); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 36px; height: 60px;
  }
  .nav-logo {
    font-family: 'Space Mono', monospace; font-size: 16px; font-weight: 700;
    letter-spacing: 5px; color: var(--text); text-decoration: none;
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; align-items: center; }
  .nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: var(--bg) !important;
    padding: 8px 18px; border-radius: 8px; font-weight: 600 !important;
    font-size: 13px !important; transition: opacity .2s !important;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 100px 24px 80px; position: relative; overflow: hidden;
  }
  .hero-glow {
    position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
    width: 800px; height: 600px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(126,226,212,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-glow-2 {
    position: absolute; bottom: 0; right: -100px;
    width: 500px; height: 400px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(167,140,244,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-label {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(126,226,212,0.1); border: 1px solid rgba(126,226,212,0.2);
    color: var(--accent); font-family: 'Space Mono', monospace;
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    padding: 6px 14px; border-radius: 100px; margin-bottom: 28px;
  }
  .hero-label::before { content: '●'; font-size: 8px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .hero h1 {
    font-size: clamp(48px, 8vw, 96px); font-weight: 700; line-height: 1.05;
    letter-spacing: -2px; margin-bottom: 24px; max-width: 900px;
  }
  .hero h1 .accent { color: var(--accent); }
  .hero h1 .violet { color: var(--violet); }
  .hero p {
    font-size: 18px; color: var(--muted); max-width: 560px;
    line-height: 1.7; margin-bottom: 48px;
  }
  .hero-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 80px; }
  .btn-primary {
    background: var(--accent); color: var(--bg); font-weight: 700;
    font-size: 15px; padding: 14px 32px; border-radius: 10px;
    text-decoration: none; transition: opacity .2s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-secondary {
    background: var(--surface); color: var(--text); font-weight: 500;
    font-size: 15px; padding: 14px 32px; border-radius: 10px;
    text-decoration: none; border: 1px solid var(--border); transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: var(--accent); }

  /* AGENT STATUS PREVIEW */
  .agent-preview {
    display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
    margin-bottom: 16px;
  }
  .agent-chip {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 100px; padding: 8px 16px 8px 12px;
    font-size: 13px; color: var(--text);
  }
  .agent-chip .dot {
    width: 8px; height: 8px; border-radius: 50%;
  }
  .dot-green { background: ${P.green}; box-shadow: 0 0 6px ${P.green}88; }
  .dot-amber { background: ${P.gold}; box-shadow: 0 0 6px ${P.gold}88; }
  .dot-muted { background: rgba(232,230,240,0.3); }

  /* SCREENS SECTION */
  .screens-section { padding: 100px 24px; max-width: 1200px; margin: 0 auto; }
  .section-label {
    font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 3px; color: var(--accent); text-transform: uppercase;
    margin-bottom: 16px; text-align: center;
  }
  .section-title {
    font-size: clamp(32px, 5vw, 52px); font-weight: 700; letter-spacing: -1px;
    text-align: center; margin-bottom: 16px;
  }
  .section-sub {
    font-size: 17px; color: var(--muted); text-align: center;
    max-width: 560px; margin: 0 auto 64px;
  }
  .screens-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
  .screen-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden; transition: transform .2s, border-color .2s;
  }
  .screen-card:hover { transform: translateY(-4px); border-color: rgba(126,226,212,0.2); }
  .screen-thumb {
    height: 280px; display: flex; align-items: center; justify-content: center;
    font-size: 48px; position: relative; overflow: hidden;
  }
  .screen-info { padding: 20px 24px; }
  .screen-info h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
  .screen-info p { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* FEATURES */
  .features-section { padding: 100px 24px; max-width: 1100px; margin: 0 auto; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 64px; }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; padding: 28px 28px 24px;
  }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 10px; }
  .feature-card p { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* METRICS BAND */
  .metrics-band {
    background: var(--surface); border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 60px 24px;
  }
  .metrics-inner { max-width: 900px; margin: 0 auto; display: flex; gap: 0; flex-wrap: wrap; }
  .metric {
    flex: 1; min-width: 200px; text-align: center; padding: 20px;
    border-right: 1px solid var(--border);
  }
  .metric:last-child { border-right: none; }
  .metric .value { font-size: 40px; font-weight: 800; color: var(--accent); line-height: 1; margin-bottom: 8px; }
  .metric .label { font-size: 13px; color: var(--muted); }

  /* HOW IT WORKS */
  .how-section { padding: 100px 24px; max-width: 900px; margin: 0 auto; }
  .steps { display: flex; flex-direction: column; gap: 0; margin-top: 64px; }
  .step { display: flex; gap: 32px; position: relative; padding-bottom: 48px; }
  .step:last-child { padding-bottom: 0; }
  .step-num-col { display: flex; flex-direction: column; align-items: center; }
  .step-num {
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(126,226,212,0.12); border: 1px solid rgba(126,226,212,0.25);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Mono', monospace; font-weight: 700; font-size: 14px;
    color: var(--accent); flex-shrink: 0;
  }
  .step-line { flex: 1; width: 1px; background: var(--border); margin-top: 8px; }
  .step:last-child .step-line { display: none; }
  .step-body { padding-top: 10px; }
  .step-body h3 { font-size: 20px; font-weight: 600; margin-bottom: 10px; }
  .step-body p { font-size: 15px; color: var(--muted); line-height: 1.7; }

  /* PALETTE */
  .palette-section { padding: 80px 24px; max-width: 900px; margin: 0 auto; }
  .palette-swatches { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 32px; }
  .swatch {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .swatch-block { width: 56px; height: 56px; border-radius: 14px; border: 1px solid var(--border); }
  .swatch span { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted); }

  /* CTA */
  .cta-section {
    padding: 120px 24px; text-align: center;
    background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(126,226,212,0.07) 0%, transparent 100%);
  }
  .cta-section h2 { font-size: clamp(32px, 5vw, 56px); font-weight: 700; letter-spacing: -1px; margin-bottom: 20px; }
  .cta-section p { font-size: 17px; color: var(--muted); margin-bottom: 48px; }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border); padding: 32px 36px;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
  }
  footer p { font-size: 12px; color: var(--muted); }
  footer a { color: var(--accent); text-decoration: none; font-size: 12px; }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#"><span>HELM</span></a>
  <div class="nav-links">
    <a href="#screens">Screens</a>
    <a href="#features">Features</a>
    <a href="#how">How it works</a>
    <a href="https://ram.zenbin.org/helm-viewer" class="nav-cta">Open Viewer →</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow-2"></div>
  <div class="hero-label">Design by RAM · March 2026</div>
  <h1>Command your <span class="accent">agents</span>.<br>Ship <span class="violet">faster</span>.</h1>
  <p>HELM is an AI agent orchestration dashboard — assign tasks, monitor live progress, review output, and keep your agents shipping without losing control.</p>
  <div class="agent-preview">
    <div class="agent-chip"><div class="dot dot-green"></div>Apex · writing tests</div>
    <div class="agent-chip"><div class="dot dot-amber"></div>Bolt · review needed</div>
    <div class="agent-chip"><div class="dot dot-muted"></div>Forge · idle</div>
  </div>
  <div class="hero-buttons">
    <a href="https://ram.zenbin.org/helm-viewer" class="btn-primary">Open in Viewer</a>
    <a href="https://ram.zenbin.org/helm-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<!-- METRICS -->
<div class="metrics-band">
  <div class="metrics-inner">
    <div class="metric"><div class="value">3</div><div class="label">Agents active</div></div>
    <div class="metric"><div class="value">14</div><div class="label">Tasks today</div></div>
    <div class="metric"><div class="value">97%</div><div class="label">Tests passing</div></div>
    <div class="metric"><div class="value">5</div><div class="label">PRs opened</div></div>
  </div>
</div>

<!-- SCREENS -->
<section class="screens-section" id="screens">
  <div class="section-label">5 Screens</div>
  <h2 class="section-title">Full product surface</h2>
  <p class="section-sub">From overview to deep agent control — every view your team needs to stay in sync with AI.</p>
  <div class="screens-grid">
    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(135deg, #141720 0%, #1C2133 100%);">
        <div style="text-align:center;">
          <div style="font-size:14px;font-family:'Space Mono',monospace;color:${P.accent};letter-spacing:2px;margin-bottom:12px;">OVERVIEW</div>
          <div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px;">
            <div style="width:70px;height:70px;background:rgba(126,226,212,0.1);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:${P.accent}">A</div>
            <div style="width:70px;height:70px;background:rgba(167,140,244,0.1);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:${P.violet}">B</div>
            <div style="width:70px;height:70px;background:rgba(255,255,255,0.05);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:rgba(255,255,255,0.3)">F</div>
          </div>
          <div style="font-size:11px;color:${P.muted}">3 agents live</div>
        </div>
      </div>
      <div class="screen-info"><h3>Overview</h3><p>Live agent status, today's metrics, active tasks and recent completions at a glance.</p></div>
    </div>
    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(135deg, #0E1420 0%, #141720 100%);">
        <div style="text-align:center;">
          <div style="font-size:14px;font-family:'Space Mono',monospace;color:${P.accent};letter-spacing:2px;margin-bottom:12px;">AGENT DETAIL</div>
          <div style="background:rgba(126,226,212,0.08);border:1px solid rgba(126,226,212,0.15);border-radius:14px;padding:16px 20px;text-align:left;max-width:200px;">
            <div style="font-size:12px;font-weight:700;color:${P.text};margin-bottom:6px;">Apex</div>
            <div style="font-size:10px;color:${P.muted};margin-bottom:10px;">Step 4/7 — edge cases</div>
            <div style="height:3px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;">
              <div style="height:3px;width:62%;background:${P.accent};border-radius:2px;"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="screen-info"><h3>Agent Detail</h3><p>Deep-dive into a single agent — current task, step-by-step progress, output preview, pause/redirect controls.</p></div>
    </div>
    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(135deg, #0F1018 0%, #141720 100%);">
        <div style="width:100%;padding:0 20px;">
          <div style="font-size:14px;font-family:'Space Mono',monospace;color:${P.accent};letter-spacing:2px;margin-bottom:12px;text-align:center;">QUEUE</div>
          ${['HIGH · Fix rate-limit bug', 'MED · Migrate auth to Clerk v4', 'LOW · Add OG tags'].map((t, idx) => {
            const colors = [P.red, P.gold, 'rgba(232,230,240,0.4)'];
            const bgs = ['rgba(240,96,96,0.12)', 'rgba(240,192,96,0.12)', 'rgba(255,255,255,0.04)'];
            const parts = t.split(' · ');
            return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">
              <span style="background:${bgs[idx]};color:${colors[idx]};font-size:8px;font-weight:700;padding:2px 7px;border-radius:100px;">${parts[0]}</span>
              <span style="font-size:11px;color:${P.text}">${parts[1]}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="screen-info"><h3>Task Queue</h3><p>Prioritized backlog of pending work. Assign tasks to specific agents or leave unassigned for auto-dispatch.</p></div>
    </div>
    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(135deg, #0C0D10 0%, #141720 100%);">
        <div style="width:100%;padding:0 20px;">
          <div style="font-size:14px;font-family:'Space Mono',monospace;color:${P.accent};letter-spacing:2px;margin-bottom:12px;text-align:center;">FEED</div>
          ${[
            {icon:'🔍',label:'Review requested',color:P.gold,who:'Apex'},
            {icon:'✓',label:'PR #284 merged',color:P.green,who:'Bolt'},
            {icon:'⚠',label:'Blocker raised',color:P.red,who:'Bolt'},
          ].map(e => `<div style="display:flex;gap:10px;margin-bottom:10px;align-items:flex-start;">
            <div style="width:24px;height:24px;border-radius:50%;background:rgba(126,226,212,0.1);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;">${e.icon}</div>
            <div style="background:rgba(255,255,255,0.03);border-left:2px solid ${e.color};border-radius:0 8px 8px 0;padding:6px 10px;flex:1;">
              <div style="font-size:10px;font-weight:600;color:${P.text}">${e.label}</div>
              <div style="font-size:9px;color:${P.muted}">${e.who} agent</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="screen-info"><h3>Activity Feed</h3><p>Timestamped log of every agent action. Reviews and blockers surface inline with one-tap resolve.</p></div>
    </div>
    <div class="screen-card">
      <div class="screen-thumb" style="background: linear-gradient(135deg, #0E0F18 0%, #141720 100%);">
        <div style="text-align:center;width:100%;padding:0 20px;">
          <div style="font-size:14px;font-family:'Space Mono',monospace;color:${P.accent};letter-spacing:2px;margin-bottom:16px;">SETTINGS</div>
          ${['Apex · GPT-4o', 'Bolt · Claude 3.7', 'Forge · GPT-4o'].map((a, idx) => {
            const enabled = idx < 2;
            const colors2 = [P.accent, P.violet, 'rgba(232,230,240,0.3)'];
            return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:${colors2[idx]};font-weight:600">${a}</span>
              <div style="width:32px;height:18px;border-radius:9px;background:${enabled ? P.accent : 'rgba(255,255,255,0.1)'};position:relative;">
                <div style="position:absolute;width:12px;height:12px;border-radius:50%;background:white;top:3px;${enabled ? 'right:3px':'left:3px'}"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="screen-info"><h3>Settings</h3><p>Enable/disable agents, configure default models, set review thresholds and manage integrations.</p></div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features-section" id="features">
  <div class="section-label">Features</div>
  <h2 class="section-title">Built for agentic teams</h2>
  <p class="section-sub">Human-in-the-loop where it matters. Fully autonomous where it doesn't.</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(126,226,212,0.12);">⚡</div>
      <h3>Live agent status</h3>
      <p>See every agent's current step in real time. Watch progress bars tick forward as your code gets written, reviewed, and shipped.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(167,140,244,0.12);">📋</div>
      <h3>Smart task queue</h3>
      <p>Prioritize your backlog by HIGH / MED / LOW. Assign to specific agents or let HELM dispatch automatically based on capacity.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(93,216,138,0.12);">✓</div>
      <h3>Review on your terms</h3>
      <p>Configure exactly when you want a human review: PRs, blockers, high-risk changes. Everything else ships without interrupting you.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(245,134,78,0.12);">⚠</div>
      <h3>Blocker surfacing</h3>
      <p>Agents flag environment issues, ambiguous requirements, or missing credentials. You resolve blockers once — agents never repeat them.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(126,226,212,0.12);">◈</div>
      <h3>Multi-model agents</h3>
      <p>Run GPT-4o for complex reasoning, Claude 3.7 for writing and code review. Each agent picks the right model for each task type.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:rgba(167,140,244,0.12);">⟳</div>
      <h3>Integrations included</h3>
      <p>Connects to GitHub, Linear, Vercel, Slack. Agents can open PRs, create issues, deploy previews and post updates — all without leaving HELM.</p>
    </div>
  </div>
</section>

<!-- METRICS BAND 2 -->
<div class="metrics-band">
  <div class="metrics-inner" style="max-width:800px;">
    <div class="metric"><div class="value" style="color:${P.violet}">2.8×</div><div class="label">faster shipping</div></div>
    <div class="metric"><div class="value">94%</div><div class="label">test coverage maintained</div></div>
    <div class="metric"><div class="value" style="color:${P.green}">12 min</div><div class="label">avg task completion</div></div>
  </div>
</div>

<!-- HOW IT WORKS -->
<section class="how-section" id="how">
  <div class="section-label">How it works</div>
  <h2 class="section-title" style="text-align:center;">Three steps to agentic shipping</h2>
  <div class="steps">
    <div class="step">
      <div class="step-num-col"><div class="step-num">01</div><div class="step-line"></div></div>
      <div class="step-body">
        <h3>Define your backlog</h3>
        <p>Paste or import tasks from Linear, Jira, or plain text. HELM categorizes priority and estimates complexity automatically. Each task becomes an agent-ready job with full context.</p>
      </div>
    </div>
    <div class="step">
      <div class="step-num-col"><div class="step-num">02</div><div class="step-line"></div></div>
      <div class="step-body">
        <h3>Watch agents work</h3>
        <p>Agents pick tasks from the queue, plan their approach, and execute step by step. The live feed shows every action — file opens, code edits, test runs, PRs. You're watching a engineer work, in real time.</p>
      </div>
    </div>
    <div class="step">
      <div class="step-num-col"><div class="step-num">03</div><div class="step-line"></div></div>
      <div class="step-body">
        <h3>Review and ship</h3>
        <p>Agents surface PRs and blockers for your approval. One tap merges, resolves, or redirects. Everything else — tests, docs, deploys — runs without you. Your job is to steer, not execute.</p>
      </div>
    </div>
  </div>
</section>

<!-- PALETTE -->
<section class="palette-section">
  <div class="section-label">Design System</div>
  <h3 class="section-title" style="font-size:28px;text-align:left;">Palette</h3>
  <div class="palette-swatches">
    ${[
      { color: P.bg, name: 'Void', hex: '#0C0D10' },
      { color: P.surface, name: 'Surface', hex: '#141720' },
      { color: P.surf2, name: 'Surf 2', hex: '#1C2133' },
      { color: P.accent, name: 'Mint', hex: '#7EE2D4' },
      { color: P.violet, name: 'Violet', hex: '#A78CF4' },
      { color: P.green, name: 'Go', hex: '#5DD88A' },
      { color: P.gold, name: 'Warn', hex: '#F0C060' },
      { color: P.orange, name: 'Alert', hex: '#F5864E' },
      { color: P.red, name: 'Stop', hex: '#F06060' },
    ].map(s => `<div class="swatch"><div class="swatch-block" style="background:${s.color}"></div><span>${s.name}</span><span>${s.hex}</span></div>`).join('')}
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2>Your agents are<br><span style="color:${P.accent}">waiting for orders.</span></h2>
  <p>Open HELM in the viewer, explore the interactive mock,<br>or dig into the design system.</p>
  <div class="hero-buttons">
    <a href="https://ram.zenbin.org/helm-viewer" class="btn-primary">Open Viewer →</a>
    <a href="https://ram.zenbin.org/helm-mock" class="btn-secondary">☀◑ Interactive Mock</a>
  </div>
</section>

<footer>
  <p>HELM — AI Agent Orchestration Dashboard</p>
  <p>Design by <a href="https://ram.zenbin.org">RAM</a> · March 2026 · <a href="https://ram.zenbin.org/helm-viewer">Viewer</a> · <a href="https://ram.zenbin.org/helm-mock">Mock</a></p>
</footer>

</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// VIEWER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const penJson = fs.readFileSync('/workspace/group/design-studio/helm.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HELM — Screen Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};font-family:'Space Mono',monospace,system-ui;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 16px;}
  h1{font-size:22px;font-weight:700;letter-spacing:5px;color:${P.text};margin-bottom:6px;}
  p{font-size:13px;color:${P.muted};margin-bottom:28px;}
  #screen-nav{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:32px;}
  .screen-btn{background:${P.surface};border:1.5px solid ${P.border};color:${P.text};font-size:11px;font-weight:700;padding:7px 16px;border-radius:20px;cursor:pointer;transition:all .15s;font-family:'Space Mono',monospace;letter-spacing:0.5px;}
  .screen-btn.active{background:${P.accent};border-color:${P.accent};color:${P.bg};}
  #render{width:390px;height:844px;background:${P.bg};border:1.5px solid ${P.border};border-radius:28px;overflow:hidden;box-shadow:0 8px 60px rgba(0,0,0,0.5);position:relative;}
  .loading{padding:40px;text-align:center;color:${P.muted};font-size:13px;}
  .back-link{margin-top:20px;font-size:12px;color:${P.accent};text-decoration:none;}
</style>
</head>
<body>
<h1>HELM</h1>
<p>${TAGLINE}</p>
<div id="screen-nav"></div>
<div id="render"><div class="loading">Loading…</div></div>
<a class="back-link" href="https://ram.zenbin.org/helm">← Back to hero</a>
${injection}
<script>
(function(){
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function renderNode(node,ox,oy){
    if(!node)return'';
    const x=(node.x||0)+ox, y=(node.y||0)+oy;
    const w=node.width||0, h=node.height||0;
    const fill=node.fill||'transparent';
    const op=node.opacity!==undefined?node.opacity:1;
    let html='';
    if(node.type==='frame'||node.type==='rect'){
      const r=node.radius||node.cornerRadius||0;
      const clip=(node.clip||node.type==='frame')?'overflow:hidden;':'';
      html+='<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background:'+fill+';border-radius:'+r+'px;'+clip+'opacity:'+op+';">';
      (node.children||[]).forEach(c=>html+=renderNode(c,0,0));
      html+='</div>';
    } else if(node.type==='text'){
      const fs=node.fontSize||13, fw=node.fontWeight||400;
      const align=node.textAlign||'left';
      const lh=node.lineHeight||1.35;
      const ff=node.fontFamily&&node.fontFamily.includes('Courier')?'Courier New,monospace':'system-ui,sans-serif';
      html+='<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;font-size:'+fs+'px;font-weight:'+fw+';color:'+fill+';text-align:'+align+';line-height:'+lh+';opacity:'+op+';overflow:hidden;white-space:pre-wrap;word-break:break-word;font-family:'+ff+';">'+esc(node.text||'')+'</div>';
    } else if(node.type==='ellipse'){
      html+='<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background:'+fill+';border-radius:50%;opacity:'+op+';"></div>';
    } else if(node.type==='line'){
      const x1=node.x1+ox, y1=node.y1+oy, x2=node.x2+ox, y2=node.y2+oy;
      const len=Math.sqrt((x2-x1)**2+(y2-y1)**2);
      const angle=Math.atan2(y2-y1,x2-x1)*180/Math.PI;
      html+='<div style="position:absolute;left:'+x1+'px;top:'+y1+'px;width:'+len+'px;height:'+(node.strokeWidth||1)+'px;background:'+(node.stroke||'rgba(255,255,255,0.07)')+';transform-origin:left center;transform:rotate('+angle+'deg);opacity:'+op+';"></div>';
    } else if(node.type==='group'){
      (node.children||[]).forEach(c=>html+=renderNode(c,ox,oy));
    }
    return html;
  }
  function init(){
    const rawPen=window.EMBEDDED_PEN;
    if(!rawPen){document.getElementById('render').innerHTML='<div class="loading">No pen data.</div>';return;}
    const pen=typeof rawPen==='string'?JSON.parse(rawPen):rawPen;
    const screens=pen.children||[];
    const nav=document.getElementById('screen-nav');
    const render=document.getElementById('render');
    const names=['Overview','Agent','Queue','Feed','Settings'];
    function showScreen(i){
      const scr=screens[i];
      if(!scr)return;
      render.style.background=scr.fill||'${P.bg}';
      let h='';
      (scr.children||[]).forEach(c=>h+=renderNode(c,-(scr.x||0),-(scr.y||0)));
      render.innerHTML=h;
      document.querySelectorAll('.screen-btn').forEach((b,j)=>b.classList.toggle('active',j===i));
    }
    screens.forEach((_,i)=>{
      const btn=document.createElement('button');
      btn.className='screen-btn'+(i===0?' active':'');
      btn.textContent=names[i]||('Screen '+(i+1));
      btn.onclick=()=>showScreen(i);
      nav.appendChild(btn);
    });
    if(screens.length>0)showScreen(0);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
</script>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// SVELTE MOCK
// ═══════════════════════════════════════════════════════════════════════════════
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'HELM',
  tagline: TAGLINE,
  archetype: ARCHETYPE,
  palette: {
    bg:      '#0C0D10',
    surface: '#141720',
    text:    '#E8E6F0',
    accent:  '#7EE2D4',
    accent2: '#A78CF4',
    muted:   'rgba(232,230,240,0.4)',
  },
  lightPalette: {
    bg:      '#F4F5F7',
    surface: '#FFFFFF',
    text:    '#1A1B1E',
    accent:  '#2DBCAC',
    accent2: '#7C5CCC',
    muted:   'rgba(26,27,30,0.45)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Active Agents', value: '3', sub: 'Apex · Bolt · Forge' },
        { type: 'metric-row', items: [
          { label: 'Tasks today', value: '14' },
          { label: 'PRs opened', value: '5' },
          { label: 'Tests pass', value: '97%' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Apex · working', sub: 'Writing tests for auth/middleware.ts', badge: '62%' },
          { icon: 'eye', title: 'Bolt · review needed', sub: 'PR #284 — 3 files changed', badge: 'Review' },
          { icon: 'zap', title: 'Forge · idle', sub: 'Awaiting next task assignment', badge: 'Idle' },
        ]},
        { type: 'progress', items: [
          { label: 'Apex progress', pct: 62 },
        ]},
        { type: 'tags', label: 'Completed today', items: ['E2E tests', 'CORS fix', 'UserContext refactor', 'Docs update'] },
      ],
    },
    {
      id: 'agent', label: 'Agent',
      content: [
        { type: 'metric', label: 'Apex · GPT-4o', value: '62%', sub: 'Step 4 of 7 — edge cases' },
        { type: 'metric-row', items: [
          { label: 'Tasks done', value: '47' },
          { label: 'Uptime', value: '6h 22m' },
          { label: 'Status', value: 'Live' },
        ]},
        { type: 'progress', items: [
          { label: 'Writing unit tests for auth/middleware.ts', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Parsed middleware.ts', sub: 'Completed', badge: '✓' },
          { icon: 'check', title: 'Identified 7 test paths', sub: 'Completed', badge: '✓' },
          { icon: 'check', title: 'Generated happy-path tests', sub: 'Completed', badge: '✓' },
          { icon: 'activity', title: 'Generating edge cases', sub: 'In progress', badge: '●' },
          { icon: 'code', title: 'Add JWT & Redis mocks', sub: 'Pending', badge: '○' },
        ]},
        { type: 'text', label: 'Output preview', value: "describe('authMiddleware', () => { it('rejects missing JWT'..." },
      ],
    },
    {
      id: 'queue', label: 'Queue',
      content: [
        { type: 'metric', label: 'Task Queue', value: '6', sub: 'Pending tasks' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Fix rate-limit bug on /api/v2/send', sub: 'HIGH · Customer-reported P1 · ~20 min', badge: 'HIGH' },
          { icon: 'alert', title: 'Add Redis caching to /users endpoint', sub: 'HIGH · Performance · Apex assigned', badge: 'HIGH' },
          { icon: 'filter', title: 'Migrate auth to Clerk v4', sub: 'MED · Bolt assigned · ~1.5h', badge: 'MED' },
          { icon: 'star', title: 'Write v2.4.0 changelog', sub: 'MED · Unassigned · ~15 min', badge: 'MED' },
          { icon: 'list', title: 'Improve onboarding error messages', sub: 'LOW · UX copy · ~25 min', badge: 'LOW' },
          { icon: 'search', title: 'Add OpenGraph tags to marketing', sub: 'LOW · SEO · ~10 min', badge: 'LOW' },
        ]},
      ],
    },
    {
      id: 'feed', label: 'Feed',
      content: [
        { type: 'metric', label: 'Activity Feed', value: '6', sub: 'Events today' },
        { type: 'list', items: [
          { icon: 'eye', title: '🔍 Review requested', sub: 'Apex · 7 tests, 94% coverage · just now', badge: 'Review' },
          { icon: 'check', title: '✓ PR #284 merged', sub: 'Bolt · UserContext refactor · 12 min', badge: 'Done' },
          { icon: 'check', title: '✓ Fix deployed', sub: 'Apex · CORS headers on /api/auth · 31 min', badge: 'Done' },
          { icon: 'alert', title: '⚠ Blocker raised', sub: 'Bolt · Clerk v4 env var needed · 1h 2m', badge: '!' },
          { icon: 'check', title: '✓ E2E tests added', sub: 'Apex · 12 tests passing · 1h 44m', badge: 'Done' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Reviews', 'Blockers', 'Done'] },
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric', label: 'Agent Config', value: '2/3', sub: 'Agents enabled' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Apex · GPT-4o', sub: '47 tasks done · enabled', badge: 'ON' },
          { icon: 'activity', title: 'Bolt · Claude 3.7', sub: '31 tasks done · enabled', badge: 'ON' },
          { icon: 'activity', title: 'Forge · GPT-4o', sub: '0 tasks · disabled', badge: 'OFF' },
        ]},
        { type: 'progress', items: [
          { label: 'GitHub · Connected', pct: 100 },
          { label: 'Linear · Connected', pct: 100 },
          { label: 'Slack · Disconnected', pct: 0 },
        ]},
        { type: 'text', label: 'Default model', value: 'GPT-4o · Most capable · Fallback: Claude 3.7 Sonnet' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'agent',    label: 'Agents',   icon: 'activity' },
    { id: 'queue',    label: 'Queue',    icon: 'list' },
    { id: 'feed',     label: 'Feed',     icon: 'bell' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
};

// ── Publish all ────────────────────────────────────────────────────────────────
console.log('Publishing hero page...');
const heroResult = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log('✓ Hero:', heroResult.url);

console.log('Publishing viewer...');
const viewerResult = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
console.log('✓ Viewer:', viewerResult.url);

console.log('Building Svelte mock...');
const svelteSource = generateSvelteComponent(design);
const mockHtml = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const mockResult = await publishMock(mockHtml, `${SLUG}-mock`, `${APP_NAME} — Interactive Mock`);
console.log('✓ Mock:', mockResult.url);

// ── GitHub queue ───────────────────────────────────────────────────────────────
console.log('Updating gallery queue...');
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const https2 = require('https');
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO = config.GITHUB_REPO;

function ghReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https2.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

const getRes = await ghReq({
  hostname: 'api.github.com',
  path: `/repos/${REPO}/contents/queue.json`,
  method: 'GET',
  headers: {
    'Authorization': `token ${TOKEN}`,
    'User-Agent': 'ram-heartbeat/1.0',
    'Accept': 'application/vnd.github.v3+json',
  }
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
  prompt: PROMPT,
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
  }
}, putBody);
console.log('✓ Gallery queue:', putRes.status === 200 ? 'updated' : `HTTP ${putRes.status} — ${putRes.body.slice(0, 100)}`);

// ── Design DB ──────────────────────────────────────────────────────────────────
console.log('Indexing in design DB...');
try {
  const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
  const db = openDB();
  upsertDesign(db, { ...newEntry });
  rebuildEmbeddings(db);
  console.log('✓ Indexed in design DB');
} catch (e) {
  console.log('⚠ DB index skipped:', e.message);
}

console.log('\n✅ HELM fully published');
console.log('   Hero:   https://ram.zenbin.org/helm');
console.log('   Viewer: https://ram.zenbin.org/helm-viewer');
console.log('   Mock:   https://ram.zenbin.org/helm-mock');
