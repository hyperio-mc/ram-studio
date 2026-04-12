// thread-publish.mjs — THREAD hero + viewer publish
import fs from 'fs';

const SLUG     = 'thread';
const APP_NAME = 'THREAD';
const TAGLINE  = 'Watch every agent think.';
const ARCHETYPE = 'observability';

import https from 'https';

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

const P = {
  bg:       '#F5F3EE',
  surface:  '#FFFFFF',
  surface2: '#EEF0FA',
  text:     '#1A1716',
  muted:    'rgba(26,23,22,0.44)',
  accent:   '#4339F2',
  acid:     '#C8FF00',
  green:    '#22B573',
  red:      '#E53935',
  amber:    '#F5A623',
  border:   'rgba(26,23,22,0.09)',
};

// ── Hero HTML ──────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface}; --surface2: ${P.surface2};
    --text: ${P.text}; --muted: ${P.muted}; --accent: ${P.accent};
    --acid: ${P.acid}; --green: ${P.green}; --red: ${P.red};
    --border: ${P.border};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Space Grotesk', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

  /* NAV */
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(245,243,238,0.9); backdrop-filter: blur(14px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 60px; }
  .nav-logo { font-family: 'Space Mono', monospace; font-size: 17px; font-weight: 700; letter-spacing: 4px; color: var(--text); text-decoration: none; }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: #fff; font-size: 13px; font-weight: 700; padding: 8px 20px; border-radius: 20px; text-decoration: none; transition: opacity .2s; }
  .nav-cta:hover { opacity: .85; }

  /* HERO */
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 100px 24px 60px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(67,57,242,0.1); border: 1px solid rgba(67,57,242,0.22); color: var(--accent); font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; margin-bottom: 36px; letter-spacing: 1.5px; font-family: 'Space Mono', monospace; }
  .hero-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--acid); display: inline-block; animation: pulse 1.8s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(0.85); } }

  h1 { font-family: 'Space Mono', monospace; font-size: clamp(44px, 6.5vw, 82px); font-weight: 700; line-height: 1.06; color: var(--text); margin-bottom: 24px; max-width: 860px; letter-spacing: -2px; }
  h1 .accent-word { color: var(--accent); }
  .hero-sub { font-size: clamp(17px, 2.2vw, 21px); color: var(--muted); max-width: 540px; margin: 0 auto 44px; line-height: 1.55; font-weight: 400; }
  .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 64px; }
  .btn-primary { background: var(--accent); color: #fff; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 28px; text-decoration: none; transition: all .2s; box-shadow: 0 4px 20px rgba(67,57,242,0.28); }
  .btn-primary:hover { opacity: .88; transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--text); font-size: 15px; font-weight: 500; padding: 14px 28px; border-radius: 28px; text-decoration: none; border: 1.5px solid var(--border); transition: all .2s; }
  .btn-ghost:hover { border-color: rgba(26,23,22,0.22); }

  /* PHONE MOCKUP */
  .phone-wrap { position: relative; display: inline-block; margin-bottom: 80px; }
  .phone-frame { width: 280px; height: 572px; background: var(--text); border-radius: 44px; padding: 13px; box-shadow: 0 32px 80px rgba(26,23,22,0.2), 0 4px 16px rgba(26,23,22,0.08); position: relative; }
  .phone-screen { width: 100%; height: 100%; background: var(--bg); border-radius: 32px; overflow: hidden; position: relative; }
  .phone-notch { position: absolute; top: 13px; left: 50%; transform: translateX(-50%); width: 88px; height: 24px; background: var(--text); border-radius: 12px; z-index: 10; }

  /* Phone interior preview */
  .ph { padding: 28px 14px 12px; height: 100%; }
  .ph-time { font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .ph-logo { font-family: 'Space Mono', monospace; font-size: 18px; font-weight: 700; letter-spacing: 4px; color: var(--text); margin-bottom: 2px; }
  .ph-sub { font-size: 7px; color: var(--muted); letter-spacing: 2px; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; }
  .ph-hero { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 12px; }
  .ph-num { font-family: 'Space Mono', monospace; font-size: 64px; font-weight: 700; color: var(--accent); line-height: 1; letter-spacing: -3px; }
  .ph-num-label { padding-bottom: 8px; }
  .ph-num-label div:first-child { font-size: 10px; font-weight: 700; color: var(--text); letter-spacing: 1.5px; }
  .ph-num-label div:last-child  { font-size: 8px; color: var(--muted); letter-spacing: 2px; }
  .ph-acid { display: inline-block; background: var(--acid); color: var(--text); font-size: 7px; font-weight: 700; padding: 2px 8px; border-radius: 6px; letter-spacing: 0.5px; margin-bottom: 10px; }
  .ph-strip { background: var(--surface); border-radius: 10px; padding: 8px 10px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin-bottom: 10px; border: 1px solid var(--border); }
  .ph-stat-label { font-size: 6.5px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 1.2px; }
  .ph-stat-val { font-family: 'Space Mono', monospace; font-size: 16px; font-weight: 700; }
  .ph-stat-val.run { color: var(--accent); }
  .ph-stat-val.done { color: #22B573; }
  .ph-stat-val.fail { color: #E53935; }
  .ph-row { background: var(--surface); border-radius: 8px; padding: 7px 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border: 1px solid var(--border); border-left: 3px solid var(--accent); }
  .ph-row:last-child { margin-bottom: 0; }
  .ph-row-name { font-size: 8px; font-weight: 600; color: var(--text); }
  .ph-row-model { font-size: 7px; color: var(--muted); }
  .ph-row-status { font-size: 7px; font-weight: 700; color: var(--accent); }

  /* STATS STRIP */
  .stats { display: flex; justify-content: center; gap: clamp(24px,5vw,80px); padding: 52px 24px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 0 24px 80px; flex-wrap: wrap; }
  .stat { text-align: center; }
  .stat-value { font-family: 'Space Mono', monospace; font-size: clamp(30px,4vw,46px); font-weight: 700; color: var(--text); line-height: 1; }
  .stat-value.accent { color: var(--accent); }
  .stat-label { font-size: 13px; color: var(--muted); margin-top: 6px; }

  /* FEATURES */
  .section { max-width: 1100px; margin: 0 auto; padding: 0 24px 100px; }
  .section-eyebrow { font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 2.5px; color: var(--accent); text-transform: uppercase; margin-bottom: 18px; }
  .section-title { font-family: 'Space Mono', monospace; font-size: clamp(28px,3.8vw,44px); font-weight: 700; line-height: 1.15; max-width: 620px; margin-bottom: 48px; letter-spacing: -1px; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
  .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; transition: box-shadow .2s, transform .2s; }
  .feature-card:hover { box-shadow: 0 8px 30px rgba(67,57,242,0.09); transform: translateY(-2px); }
  .feature-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(67,57,242,0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 18px; }
  .feature-icon.green { background: rgba(34,181,115,0.12); }
  .feature-icon.red { background: rgba(229,57,53,0.1); }
  .feature-icon.acid { background: rgba(200,255,0,0.15); }
  .feature-title { font-family: 'Space Mono', monospace; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 10px; letter-spacing: -0.5px; }
  .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* TRACE DEMO */
  .trace-demo { background: var(--surface); border: 1px solid var(--border); border-radius: 28px; padding: 40px 40px 32px; margin: 0 24px 80px; }
  .trace-demo h2 { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; letter-spacing: -1px; margin-bottom: 8px; }
  .trace-demo p { color: var(--muted); font-size: 15px; margin-bottom: 32px; }
  .trace-steps { display: flex; flex-direction: column; gap: 0; }
  .trace-step { display: flex; gap: 16px; align-items: flex-start; }
  .trace-dot-col { display: flex; flex-direction: column; align-items: center; width: 24px; flex-shrink: 0; }
  .trace-dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 14px; }
  .trace-dot.done { background: #22B573; }
  .trace-dot.active { background: transparent; border: 2px solid var(--accent); }
  .trace-dot.wait { background: transparent; border: 1.5px solid #DDDAD5; }
  .trace-line { width: 2px; flex: 1; min-height: 16px; background: #DDDAD5; border-radius: 1px; }
  .trace-card { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px; }
  .trace-card.active { background: #EEF0FA; border-color: #C5C2FF; }
  .trace-phase { font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 4px; }
  .trace-phase.done { color: #22B573; }
  .trace-phase.active { color: var(--accent); }
  .trace-phase.wait { color: #DDDAD5; }
  .trace-call { font-size: 13px; font-weight: 600; color: var(--text); font-family: 'Space Mono', monospace; margin-bottom: 4px; }
  .trace-meta { display: flex; gap: 12px; font-size: 11px; color: var(--muted); }
  .trace-badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 6px; margin-left: auto; font-family: 'Space Mono', monospace; }
  .trace-badge.done { background: rgba(34,181,115,0.14); color: #22B573; }
  .trace-badge.active { background: rgba(67,57,242,0.12); color: var(--accent); }

  /* SCREENS */
  .screens-section { background: var(--surface); border-radius: 28px; padding: 44px; margin: 0 24px 80px; border: 1px solid var(--border); }
  .screens-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 28px; }
  .screen-pill { background: var(--bg); border-radius: 14px; padding: 16px; text-align: center; border: 1px solid var(--border); transition: border-color .2s; }
  .screen-pill:hover { border-color: rgba(67,57,242,0.3); }
  .screen-pill-icon { font-size: 22px; margin-bottom: 8px; }
  .screen-pill-name { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .screen-pill-desc { font-size: 10px; color: var(--muted); line-height: 1.4; }

  /* DESIGN NOTES */
  .decision-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; }
  .decision-label { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; letter-spacing: -0.3px; }
  .decision-source { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: var(--accent); text-transform: uppercase; margin-bottom: 10px; font-family: 'Space Mono', monospace; }
  .decision-text { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* CTA */
  .cta-section { text-align: center; padding: 80px 24px 100px; }
  .cta-title { font-family: 'Space Mono', monospace; font-size: clamp(30px,4.5vw,54px); font-weight: 700; margin-bottom: 20px; letter-spacing: -2px; }
  .cta-sub { font-size: 18px; color: var(--muted); margin-bottom: 40px; }

  /* FOOTER */
  footer { border-top: 1px solid var(--border); padding: 36px 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .footer-logo { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; letter-spacing: 3px; color: var(--text); }
  .footer-note { font-size: 12px; color: var(--muted); }
  .design-credit { font-size: 12px; color: var(--muted); }
  .design-credit a { color: var(--accent); text-decoration: none; }

  @media (max-width: 680px) {
    .screens-grid { grid-template-columns: 1fr 1fr; }
    .stats { gap: 32px; }
    footer { flex-direction: column; text-align: center; }
    .nav-links { display: none; }
    .trace-demo { padding: 28px 20px; margin: 0 0 64px; }
  }
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">THREAD</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#trace">Trace</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/thread-mock">Interactive mock</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/thread-mock">Try mock →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-badge"><span class="hero-badge-dot"></span> Agent Observability · 2026</div>
  <h1>Watch every <span class="accent-word">agent</span> think.</h1>
  <p class="hero-sub">Full-trace visibility into your autonomous AI agent fleets — what they call, how long it takes, what breaks.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/thread-mock">Explore the mock →</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/thread-viewer">View screens</a>
  </div>

  <!-- Phone mockup -->
  <div class="phone-wrap">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="ph">
          <div class="ph-time">09:41</div>
          <div class="ph-logo">THREAD</div>
          <div class="ph-sub">Agent Observability</div>
          <div class="ph-hero">
            <div class="ph-num">24</div>
            <div class="ph-num-label">
              <div>ACTIVE</div>
              <div>AGENTS</div>
            </div>
          </div>
          <div class="ph-acid">● LIVE</div>
          <div class="ph-strip">
            <div>
              <div class="ph-stat-label">Running</div>
              <div class="ph-stat-val run">14</div>
            </div>
            <div>
              <div class="ph-stat-label">Done</div>
              <div class="ph-stat-val done">8</div>
            </div>
            <div>
              <div class="ph-stat-label">Failed</div>
              <div class="ph-stat-val fail">2</div>
            </div>
          </div>
          <div class="ph-row">
            <div>
              <div class="ph-row-name">agent/researcher</div>
              <div class="ph-row-model">gpt-4o</div>
            </div>
            <div class="ph-row-status">● RUNNING</div>
          </div>
          <div class="ph-row">
            <div>
              <div class="ph-row-name">agent/planner</div>
              <div class="ph-row-model">claude-opus-4</div>
            </div>
            <div class="ph-row-status">● RUNNING</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<div class="stats">
  <div class="stat"><div class="stat-value accent">24</div><div class="stat-label">Agents monitored</div></div>
  <div class="stat"><div class="stat-value">5</div><div class="stat-label">Screens designed</div></div>
  <div class="stat"><div class="stat-value accent">Light</div><div class="stat-label">Editorial parchment theme</div></div>
  <div class="stat"><div class="stat-value">AI</div><div class="stat-label">Real-time anomaly detection</div></div>
</div>

<!-- FEATURES -->
<div class="section" id="features">
  <div class="section-eyebrow">What THREAD does</div>
  <h2 class="section-title">Full visibility into every agent run.</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">⊡</div>
      <div class="feature-title">Fleet Overview</div>
      <div class="feature-desc">See all running, completed, and failed agents in one editorial overview. Giant hero numbers for instant status — inspired by shed.design's extreme typographic hierarchy.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">≋</div>
      <div class="feature-title">Step-by-Step Traces</div>
      <div class="feature-desc">Every tool call, every reasoning step, every token consumed — logged in real-time with timing and outcome. Know exactly where an agent succeeded or failed.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon acid">⚑</div>
      <div class="feature-title">Anomaly Detection</div>
      <div class="feature-desc">Loop detection, token spikes, slow steps, null outputs — flagged automatically with confidence scores and actionable remediation paths.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⊞</div>
      <div class="feature-title">Agent Roster</div>
      <div class="feature-desc">Every registered agent with model, run count, average duration, and success rate. Filter by status, search by name, drill into history.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon green">◉</div>
      <div class="feature-title">Token & Cost Spend</div>
      <div class="feature-desc">Daily spend tracked by model with budget progress and projected daily cost. Know which agents cost the most before the bill arrives.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">◈</div>
      <div class="feature-title">Live Status</div>
      <div class="feature-desc">Real-time state: running, done, failed, retrying. An acid chartreuse "LIVE" chip signals active runs — the only moment that color appears in the entire UI.</div>
    </div>
  </div>
</div>

<!-- TRACE DEMO -->
<div class="trace-demo" id="trace">
  <div class="section-eyebrow" style="margin-bottom:12px;">Execution trace</div>
  <h2>agent/researcher · Run #14</h2>
  <p>Step-by-step execution trace — gpt-4o · 2m 33s · 2,960 tokens · 4/6 steps complete</p>
  <div class="trace-steps">
    ${[
      ['PLAN',       'decompose_task()',          '120ms',  '412 tok',   'done',   'done'],
      ['SEARCH',     'web_search("2026 trends")', '1.2s',   '88 tok',    'done',   'done'],
      ['READ',       'read_url(awwwards.com)',     '890ms',  '1,840 tok', 'done',   'done'],
      ['ANALYZE',    'analyze_content()',          '340ms',  '620 tok',   'active', 'active'],
      ['SYNTHESIZE', 'draft_response()',           '—',      '—',         'wait',   'wait'],
      ['REVIEW',     'self_critique()',            '—',      '—',         'wait',   'wait'],
    ].map(([phase, call, dur, tok, dotCls, cardCls], i, arr) => `
    <div class="trace-step">
      <div class="trace-dot-col">
        <div class="trace-dot ${dotCls}"></div>
        ${i < arr.length - 1 ? '<div class="trace-line"></div>' : ''}
      </div>
      <div class="trace-card ${cardCls === 'active' ? 'active' : ''}">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="trace-phase ${dotCls}">${phase}</span>
          ${dotCls === 'done' ? '<span class="trace-badge done">✓ DONE</span>' : dotCls === 'active' ? '<span class="trace-badge active">● RUNNING</span>' : ''}
        </div>
        <div class="trace-call">${call}</div>
        ${dotCls !== 'wait' ? `<div class="trace-meta"><span>${dur}</span><span>${tok}</span></div>` : '<div class="trace-meta"><span style="opacity:0.35">Waiting…</span></div>'}
      </div>
    </div>`).join('')}
  </div>
</div>

<!-- SCREEN TOUR -->
<div class="screens-section" id="screens">
  <div class="section-eyebrow">5 screens</div>
  <h2 style="font-family:'Space Mono',monospace;font-size:28px;font-weight:700;letter-spacing:-1px;margin-bottom:8px;">A complete observability flow.</h2>
  <p style="color:var(--muted);font-size:15px;">Every screen designed for engineers who need clarity, not decoration.</p>
  <div class="screens-grid">
    <div class="screen-pill">
      <div class="screen-pill-icon">⊡</div>
      <div class="screen-pill-name">Overview</div>
      <div class="screen-pill-desc">Fleet state · hero metric · active runs list</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">⊞</div>
      <div class="screen-pill-name">Agents</div>
      <div class="screen-pill-desc">Roster · model · success rates · filter</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">≋</div>
      <div class="screen-pill-name">Trace</div>
      <div class="screen-pill-desc">Step-by-step execution · tool calls · tokens</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◈</div>
      <div class="screen-pill-name">Anomaly</div>
      <div class="screen-pill-desc">Loop · token spikes · slow steps · confidence</div>
    </div>
    <div class="screen-pill">
      <div class="screen-pill-icon">◉</div>
      <div class="screen-pill-name">Spend</div>
      <div class="screen-pill-desc">Token cost · by model · budget · projection</div>
    </div>
  </div>
  <div style="margin-top:24px;text-align:center;">
    <a href="https://ram.zenbin.org/thread-viewer" style="font-size:14px;color:var(--accent);font-weight:700;text-decoration:none;font-family:'Space Mono',monospace;">View all screens →</a>
  </div>
</div>

<!-- DESIGN NOTES -->
<div class="section">
  <div class="section-eyebrow">Design decisions</div>
  <h2 class="section-title">Why it looks the way it does.</h2>
  <div class="feature-grid">
    <div class="decision-card">
      <div class="decision-source">shed.design · Awwwards SOTD</div>
      <div class="decision-label">Editorial extreme type sizing</div>
      <div class="decision-text">Inspired by shed.design's 205px headlines vs 9px micro-labels. The "24 ACTIVE AGENTS" hero on Overview uses an 80px number flanked by 9px all-caps tracked labels — maximum hierarchy, zero noise.</div>
    </div>
    <div class="decision-card">
      <div class="decision-source">land-book.com trending · March 2026</div>
      <div class="decision-label">Agent observability as product category</div>
      <div class="decision-text">Runlayer ("Enterprise MCPs, Skills & Agents") and LangChain ("Observe, Evaluate, Deploy AI Agents") appeared side-by-side on land-book. The Trace screen directly translates this need: step-by-step tool call visibility with timing and token counts per step.</div>
    </div>
    <div class="decision-card">
      <div class="decision-source">evervault.com · godly.website featured</div>
      <div class="decision-label">Single accent on warm parchment</div>
      <div class="decision-text">Evervault uses one electric purple on deep navy for restrained B2B authority. THREAD translates this to light: electric indigo (#4339F2) on warm parchment (#F5F3EE). The acid chartreuse (#C8FF00) appears only once — the "● LIVE" chip — making it unmissable.</div>
    </div>
  </div>
</div>

<!-- CTA -->
<section class="cta-section">
  <h2 class="cta-title">Start watching your agents.</h2>
  <p class="cta-sub">Explore the interactive mock or view all five screens.</p>
  <div class="hero-actions">
    <a class="btn-primary" href="https://ram.zenbin.org/thread-mock">Interactive mock →</a>
    <a class="btn-ghost" href="https://ram.zenbin.org/thread-viewer">Screen viewer</a>
  </div>
</section>

<footer>
  <div class="footer-logo">THREAD</div>
  <div class="footer-note">Designed March 2026 · shed.design + land-book + godly.website</div>
  <div class="design-credit">By <a href="https://ram.zenbin.org">RAM</a> · Design Heartbeat</div>
</footer>
</body>
</html>`;

// ── Viewer HTML ────────────────────────────────────────────────────────────────
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Screen Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${P.bg}; font-family: 'Space Mono', monospace, system-ui; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 16px; }
  h1 { font-size: 22px; font-weight: 700; letter-spacing: 4px; color: ${P.text}; margin-bottom: 6px; }
  p  { font-size: 13px; color: ${P.muted}; margin-bottom: 28px; }
  #screen-nav { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 32px; }
  .screen-btn { background: ${P.surface}; border: 1.5px solid ${P.border}; color: ${P.text}; font-size: 12px; font-weight: 700; padding: 7px 16px; border-radius: 20px; cursor: pointer; transition: all .15s; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; }
  .screen-btn.active { background: ${P.accent}; border-color: ${P.accent}; color: #fff; }
  #render { width: 390px; height: 844px; background: ${P.bg}; border: 1.5px solid ${P.border}; border-radius: 28px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.1); position: relative; }
  .loading { padding: 40px; text-align: center; color: ${P.muted}; font-size: 13px; }
</style>
</head>
<body>
<h1>THREAD</h1>
<p>Watch every agent think.</p>
<div id="screen-nav"></div>
<div id="render"><div class="loading">Loading...</div></div>
<script>
window.THREAD_PLACEHOLDER = true;
</script>
<script>
(function() {
  function hexToRgb(hex) {
    if (!hex || hex[0] !== '#') return null;
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return isNaN(r) ? null : {r,g,b};
  }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderNode(node, offsetX=0, offsetY=0) {
    if (!node) return '';
    const x = (node.x||0) + offsetX;
    const y = (node.y||0) + offsetY;
    const w = node.width||0;
    const h = node.height||0;
    const fill = node.fill || 'transparent';
    const opacity = node.opacity !== undefined ? node.opacity : 1;
    let html = '';

    if (node.type === 'frame') {
      let borderCss = '';
      if (node.stroke) {
        borderCss = 'border:' + (node.stroke.thickness||1) + 'px solid ' + node.stroke.fill + ';';
      }
      const cr = node.cornerRadius || 0;
      const clipCss = node.clip ? 'overflow:hidden;' : '';
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background:'+fill+';border-radius:'+cr+'px;'+borderCss+clipCss+'opacity:'+opacity+';">';
      if (node.children) {
        for (const child of node.children) {
          html += renderNode(child, 0, 0);
        }
      }
      html += '</div>';
    }
    else if (node.type === 'text') {
      const fs = node.fontSize || 13;
      const fw = node.fontWeight || '400';
      const align = node.textAlign || 'left';
      const ls = node.letterSpacing ? 'letter-spacing:'+node.letterSpacing+'px;' : '';
      const lh = node.lineHeight ? 'line-height:'+node.lineHeight+';' : '';
      const overflow = 'overflow:hidden;';
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;font-size:'+fs+'px;font-weight:'+fw+';color:'+fill+';text-align:'+align+';'+ls+lh+overflow+'opacity:'+opacity+';line-height:'+(node.lineHeight||1.3)+';white-space:pre-wrap;word-break:break-word;font-family:system-ui,sans-serif;">'+esc(node.content||'')+'</div>';
    }
    else if (node.type === 'ellipse') {
      let borderCss = '';
      if (node.stroke) borderCss = 'border:' + (node.stroke.thickness||1) + 'px solid ' + node.stroke.fill + ';';
      html += '<div style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background:'+fill+';border-radius:50%;'+borderCss+'opacity:'+opacity+';"></div>';
    }
    return html;
  }

  function init() {
    const rawPen = window.EMBEDDED_PEN;
    if (!rawPen) { document.getElementById('render').innerHTML = '<div class="loading">No pen data found.</div>'; return; }
    const pen = typeof rawPen === 'string' ? JSON.parse(rawPen) : rawPen;
    const screens = pen.children || [];
    const nav = document.getElementById('screen-nav');
    const render = document.getElementById('render');
    const screenW = 390;
    const gap = 80;
    const screenNames = ['Overview','Agents','Trace','Anomaly','Spend'];
    let current = 0;

    function showScreen(i) {
      current = i;
      const scr = screens[i];
      if (!scr) return;
      const scrOffsetX = -(scr.x || 0);
      const scrOffsetY = -(scr.y || 0);
      render.style.background = scr.fill || '${P.bg}';
      let innerHtml = '';
      if (scr.children) {
        for (const child of scr.children) {
          innerHtml += renderNode(child, scrOffsetX, scrOffsetY);
        }
      }
      render.innerHTML = innerHtml;
      document.querySelectorAll('.screen-btn').forEach((b,j) => b.classList.toggle('active', j===i));
    }

    screens.forEach((scr, i) => {
      const btn = document.createElement('button');
      btn.className = 'screen-btn' + (i===0?' active':'');
      btn.textContent = screenNames[i] || ('Screen '+(i+1));
      btn.onclick = () => showScreen(i);
      nav.appendChild(btn);
    });
    if (screens.length > 0) showScreen(0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
</body>
</html>`;

// ── Inject EMBEDDED_PEN ────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/thread.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
viewerHtml = viewerHtml.replace(
  '<script>\nwindow.THREAD_PLACEHOLDER = true;\n</script>',
  injection
);

// ── Publish ────────────────────────────────────────────────────────────────────
console.log('Publishing THREAD hero page...');
const heroResult = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log('✅ Hero:', `https://ram.zenbin.org/${SLUG}`);

console.log('Publishing viewer...');
const viewerResult = await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Screen Viewer`);
console.log('✅ Viewer:', `https://ram.zenbin.org/${SLUG}-viewer`);

export { SLUG, APP_NAME, TAGLINE, ARCHETYPE };
