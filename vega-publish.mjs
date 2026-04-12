// vega-publish.mjs — VEGA hero + gallery + viewer
// Theme: DARK — inspired by Linear.app's ultra-dark console + "zero-human companies" agentic trend
// RAM Design Heartbeat — 2026-03-28

import fs from 'fs';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));
const TOKEN = config.GITHUB_TOKEN;
const REPO  = config.GITHUB_REPO;

const SLUG = 'vega';
const APP_NAME = 'VEGA';
const TAGLINE = 'The operating layer for agentic companies';
const ARCHETYPE = 'agent-orchestration';

const hero = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VEGA — The operating layer for agentic companies</title>
<meta name="description" content="Deploy, monitor and debug autonomous AI agents in production. The operating console for companies where humans and agents share the same workspace. A RAM design concept.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ram.zenbin.org/vega">
<meta property="og:title" content="VEGA — The operating layer for agentic companies">
<meta property="og:description" content="Deploy, monitor and debug autonomous AI agents in production. A RAM design concept.">
<meta name="theme-color" content="#4F87FF">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080C14;
  --surface:#0F1521;
  --surface2:#141E2E;
  --border:#1E2A3D;
  --text:#E6EDF8;
  --muted:#5C6B82;
  --muted2:#3A4A60;
  --accent:#4F87FF;
  --green:#00E5A0;
  --warn:#FF6B3D;
  --red:#FF4466;
  --pad:max(24px,5vw);
}

html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;line-height:1.5;overflow-x:hidden}

/* ─── NAV ─── */
nav{position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(8,12,20,0.85);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 var(--pad);height:58px}
.nav-logo{font-weight:800;font-size:18px;text-decoration:none;color:var(--text);letter-spacing:-0.5px;display:flex;align-items:center;gap:8px}
.nav-logo-hex{width:22px;height:22px;background:var(--accent);clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:var(--muted);text-decoration:none;letter-spacing:-0.1px;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:#fff;border:none;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;border-radius:7px;letter-spacing:-0.2px}

/* ─── HERO ─── */
.hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  padding:120px var(--pad) 80px;position:relative;overflow:hidden}
.hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;max-width:1280px;margin:0 auto;width:100%}

/* Grid lines background */
.hero::before{content:'';position:absolute;inset:0;
  background:
    linear-gradient(rgba(79,135,255,.04) 1px,transparent 1px),
    linear-gradient(90deg,rgba(79,135,255,.04) 1px,transparent 1px);
  background-size:64px 64px;pointer-events:none}
/* Glow */
.hero::after{content:'';position:absolute;top:0;left:20%;width:600px;height:400px;
  background:radial-gradient(ellipse,rgba(79,135,255,0.08) 0%,transparent 70%);
  pointer-events:none}

.hero-kicker{font-size:11px;font-weight:600;letter-spacing:1.2px;color:var(--accent);
  text-transform:uppercase;margin-bottom:20px;display:flex;align-items:center;gap:8px}
.hero-kicker::before{content:'';width:24px;height:1px;background:var(--accent);display:block}
.hero-h1{font-size:clamp(48px,5vw,80px);font-weight:800;line-height:0.94;letter-spacing:-2.5px;margin-bottom:28px}
.hero-h1 .hl{color:var(--accent)}
.hero-h1 .dim{color:var(--muted);font-weight:300}
.hero-p{font-size:17px;line-height:1.65;color:var(--muted);max-width:480px;margin-bottom:40px;letter-spacing:-0.1px}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.btn-primary{background:var(--accent);color:#fff;padding:13px 24px;font-size:14px;font-weight:600;
  border-radius:9px;text-decoration:none;letter-spacing:-0.2px;transition:opacity .2s}
.btn-primary:hover{opacity:.9}
.btn-ghost{border:1px solid var(--border);color:var(--muted);padding:12px 22px;font-size:14px;
  border-radius:9px;text-decoration:none;letter-spacing:-0.2px;transition:all .2s}
.btn-ghost:hover{border-color:var(--muted);color:var(--text)}

/* Live stats strip */
.live-strip{display:flex;gap:24px;margin-top:40px;flex-wrap:wrap}
.live-stat{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);letter-spacing:-.1px}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* ─── PHONE MOCK ─── */
.hero-right{display:flex;justify-content:center;align-items:center}
.phone-outer{position:relative}
.phone{width:300px;height:620px;background:var(--surface);border-radius:38px;
  border:1px solid var(--border);overflow:hidden;position:relative;
  box-shadow:0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04) inset}
.phone-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:88px;height:26px;background:var(--bg);border-radius:0 0 16px 16px;z-index:3}
.phone-screen{padding:36px 16px 16px;height:100%;overflow:hidden}

/* Phone UI */
.p-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.p-title{font-size:20px;font-weight:700;letter-spacing:-0.6px}
.p-badge{background:var(--green);color:#000;font-size:9px;font-weight:700;
  padding:3px 8px;border-radius:10px;letter-spacing:.3px}
.p-sub{font-size:11px;color:var(--muted);margin-bottom:14px;letter-spacing:-.1px}
.p-card{background:var(--surface2);border:1px solid var(--border);border-radius:10px;
  padding:12px;margin-bottom:8px;position:relative;overflow:hidden}
.p-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:2px}
.p-card.green::before{background:var(--green)}
.p-card.blue::before{background:var(--accent)}
.p-card.warn::before{background:var(--warn)}
.p-card.red::before{background:var(--red)}
.p-agent{font-size:12px;font-weight:600;letter-spacing:-.2px;margin-bottom:2px}
.p-model{font-size:10px;color:var(--muted);margin-bottom:8px}
.p-bar-bg{height:3px;background:var(--border);border-radius:2px}
.p-bar-fill{height:3px;border-radius:2px;margin-top:0}
.p-meta{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
.p-tasks{font-size:10px;font-weight:500;letter-spacing:-.1px}
.p-status{font-size:9px;font-weight:700;letter-spacing:.3px;padding:2px 7px;border-radius:8px}
.p-status.online{background:rgba(0,229,160,.15);color:var(--green)}
.p-status.busy{background:rgba(79,135,255,.15);color:var(--accent)}
.p-status.warn{background:rgba(255,107,61,.15);color:var(--warn)}

/* Floating cards */
.float-card{position:absolute;background:var(--surface);border:1px solid var(--border);
  border-radius:12px;padding:12px 14px;box-shadow:0 16px 40px rgba(0,0,0,.5)}
.fc-label{font-size:10px;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;margin-bottom:5px}
.fc-val{font-size:26px;font-weight:800;letter-spacing:-1px;line-height:1}
.fc-sub{font-size:10px;color:var(--green);margin-top:3px;letter-spacing:-.1px}

/* ─── MARQUEE ─── */
.marquee-wrap{border-top:1px solid var(--border);border-bottom:1px solid var(--border);
  padding:14px 0;overflow:hidden;background:var(--surface)}
.marquee{display:flex;gap:40px;white-space:nowrap;animation:scroll 18s linear infinite}
@keyframes scroll{to{transform:translateX(-50%)}}
.marquee-item{font-size:12px;color:var(--muted);letter-spacing:.6px;text-transform:uppercase;display:flex;align-items:center;gap:10px}
.marquee-item::before{content:'⬡';color:var(--accent);font-size:10px}

/* ─── FEATURES ─── */
.features{padding:120px var(--pad);max-width:1280px;margin:0 auto}
.section-kicker{font-size:11px;font-weight:600;letter-spacing:1.2px;color:var(--accent);text-transform:uppercase;margin-bottom:12px}
.section-title{font-size:clamp(36px,4vw,56px);font-weight:800;letter-spacing:-2px;margin-bottom:16px;line-height:0.95}
.section-sub{font-size:16px;color:var(--muted);max-width:500px;margin-bottom:64px;line-height:1.65;letter-spacing:-.1px}

.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.feat-card{background:var(--bg);padding:32px 28px;transition:background .2s}
.feat-card:hover{background:var(--surface)}
.feat-icon{width:36px;height:36px;background:var(--accent);opacity:.15;border-radius:10px;margin-bottom:20px;position:relative}
.feat-icon::after{content:attr(data-icon);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:1 !important;font-size:16px;color:var(--accent)}
.feat-card h3{font-size:17px;font-weight:700;letter-spacing:-.4px;margin-bottom:10px}
.feat-card p{font-size:13px;color:var(--muted);line-height:1.7;letter-spacing:-.1px}
.feat-accent{color:var(--accent);font-weight:600}

/* ─── ARCH DIAGRAM ─── */
.arch{padding:80px var(--pad);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.arch-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.arch-diagram{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;min-height:340px;position:relative}
.arch-layer{margin-bottom:20px}
.arch-layer-label{font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.arch-nodes{display:flex;gap:8px;flex-wrap:wrap}
.arch-node{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:11px;font-weight:500;letter-spacing:-.1px;display:flex;align-items:center;gap:6px}
.arch-node.active{border-color:var(--accent);color:var(--accent)}
.arch-node.green{border-color:var(--green);color:var(--green)}
.arch-node.warn{border-color:var(--warn);color:var(--warn)}
.node-dot{width:5px;height:5px;border-radius:50%}
.arch-connector{height:1px;background:var(--border);margin:0 0 8px 0;position:relative}
.arch-connector::before{content:'↓';position:absolute;left:20px;top:-8px;font-size:10px;color:var(--muted)}

/* ─── QUOTE ─── */
.quote-section{padding:100px var(--pad);text-align:center;position:relative;overflow:hidden}
.quote-section::before{content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at center,rgba(79,135,255,0.06) 0%,transparent 70%);
  pointer-events:none}
.quote-inner{max-width:800px;margin:0 auto}
.quote-mark{font-size:80px;color:var(--accent);opacity:.2;line-height:1;font-family:Georgia,serif;margin-bottom:-20px}
.quote-text{font-size:clamp(24px,3.5vw,40px);font-weight:700;letter-spacing:-1.5px;line-height:1.2;margin-bottom:24px}
.quote-text .hl{color:var(--accent)}
.quote-attr{font-size:12px;color:var(--muted);letter-spacing:.5px;text-transform:uppercase}

/* ─── STATS ─── */
.stats-section{padding:80px var(--pad);border-top:1px solid var(--border)}
.stats-inner{max-width:1280px;margin:0 auto}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.stat-card{background:var(--bg);padding:40px 32px}
.stat-num{font-size:52px;font-weight:800;letter-spacing:-2px;line-height:1;color:var(--text);margin-bottom:8px}
.stat-num .hl{color:var(--accent)}
.stat-label{font-size:12px;font-weight:600;letter-spacing:-.1px;margin-bottom:6px}
.stat-desc{font-size:12px;color:var(--muted);line-height:1.65;letter-spacing:-.1px}

/* ─── CTA ─── */
.cta-section{padding:120px var(--pad);text-align:center}
.cta-inner{max-width:640px;margin:0 auto}
.cta-section h2{font-size:clamp(40px,5vw,64px);font-weight:800;letter-spacing:-2.5px;line-height:.95;margin-bottom:20px}
.cta-section h2 .dim{color:var(--muted);font-weight:300}
.cta-section p{font-size:16px;color:var(--muted);margin-bottom:40px;line-height:1.65;letter-spacing:-.1px}
.cta-group{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-lg{background:var(--accent);color:#fff;padding:15px 32px;font-size:15px;font-weight:700;
  border-radius:10px;text-decoration:none;letter-spacing:-.3px}
.btn-lg-ghost{border:1px solid var(--border);color:var(--muted);padding:14px 30px;font-size:15px;
  border-radius:10px;text-decoration:none;letter-spacing:-.3px}

/* ─── FOOTER ─── */
footer{padding:32px var(--pad);border-top:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-logo{font-weight:800;font-size:16px;letter-spacing:-.4px;display:flex;align-items:center;gap:7px}
.footer-logo-hex{width:16px;height:16px;background:var(--accent);clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)}
.footer-note{font-size:11px;color:var(--muted);letter-spacing:.04em}
.footer-tag{font-size:10px;font-weight:700;letter-spacing:.8px;color:var(--accent);padding:4px 10px;border:1px solid rgba(79,135,255,.3);border-radius:4px;text-transform:uppercase}

@media(max-width:900px){
  .hero-grid{grid-template-columns:1fr}
  .hero-right{display:none}
  .feat-grid{grid-template-columns:1fr 1fr}
  .stats-grid{grid-template-columns:1fr 1fr}
  .arch-inner{grid-template-columns:1fr}
  .nav-links{display:none}
}
@media(max-width:600px){
  .feat-grid{grid-template-columns:1fr}
  .stats-grid{grid-template-columns:1fr 1fr}
}
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="#">
    <div class="nav-logo-hex"></div>
    VEGA
  </a>
  <ul class="nav-links">
    <li><a href="#">Fleet</a></li>
    <li><a href="#">Pipelines</a></li>
    <li><a href="#">Monitor</a></li>
    <li><a href="#">Docs</a></li>
  </ul>
  <button class="nav-cta">Deploy Free</button>
</nav>

<section class="hero">
  <div class="hero-grid">
    <div class="hero-left">
      <div class="hero-kicker">Agent Orchestration Platform</div>
      <h1 class="hero-h1">
        The OS<br>
        <span class="dim">for</span> agentic<br>
        <span class="hl">companies.</span>
      </h1>
      <p class="hero-p">Deploy, monitor and debug autonomous AI agents in production. One console for every agent in your fleet — across every model, every task, every team.</p>
      <div class="hero-btns">
        <a class="btn-primary" href="https://ram.zenbin.org/vega-mock">Launch Console →</a>
        <a class="btn-ghost" href="https://ram.zenbin.org/vega-viewer">View Design ↗</a>
      </div>
      <div class="live-strip">
        <span class="live-stat"><span class="live-dot"></span>16 agents running</span>
        <span class="live-stat">1,847 tasks/hr</span>
        <span class="live-stat">0.12% error rate</span>
        <span class="live-stat">284ms avg</span>
      </div>
    </div>
    <div class="hero-right">
      <div class="phone-outer">
        <!-- Floating stat cards -->
        <div class="float-card" style="left:-60px;top:80px">
          <div class="fc-label">Fleet Status</div>
          <div class="fc-val" style="color:var(--green)">12<span style="font-size:16px;font-weight:400;color:var(--muted)"> online</span></div>
          <div class="fc-sub">↑ 3 scaled today</div>
        </div>
        <div class="float-card" style="right:-55px;top:220px">
          <div class="fc-label">Throughput</div>
          <div class="fc-val">1.8K</div>
          <div class="fc-sub" style="color:var(--accent)">tasks / hr</div>
        </div>
        <div class="phone">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="p-header">
              <div class="p-title">Agent Fleet</div>
              <div class="p-badge">16 LIVE</div>
            </div>
            <div class="p-sub">12 active · 3 paused · 1 incident</div>
            <div class="p-card green">
              <div class="p-agent">Orion</div>
              <div class="p-model">claude-3-7-sonnet</div>
              <div class="p-bar-bg"><div class="p-bar-fill" style="width:82%;background:var(--green)"></div></div>
              <div class="p-meta">
                <div class="p-tasks" style="color:var(--green)">847 tasks</div>
                <div class="p-status online">ONLINE</div>
              </div>
            </div>
            <div class="p-card blue">
              <div class="p-agent">Atlas</div>
              <div class="p-model">gpt-4o-mini</div>
              <div class="p-bar-bg"><div class="p-bar-fill" style="width:61%;background:var(--accent)"></div></div>
              <div class="p-meta">
                <div class="p-tasks" style="color:var(--accent)">1,204 tasks</div>
                <div class="p-status busy">BUSY</div>
              </div>
            </div>
            <div class="p-card green">
              <div class="p-agent">Cygnus</div>
              <div class="p-model">claude-3-haiku</div>
              <div class="p-bar-bg"><div class="p-bar-fill" style="width:94%;background:var(--green)"></div></div>
              <div class="p-meta">
                <div class="p-tasks" style="color:var(--green)">2,810 tasks</div>
                <div class="p-status online">ONLINE</div>
              </div>
            </div>
            <div class="p-card warn">
              <div class="p-agent">Vela</div>
              <div class="p-model">mistral-large</div>
              <div class="p-bar-bg"><div class="p-bar-fill" style="width:23%;background:var(--warn)"></div></div>
              <div class="p-meta">
                <div class="p-tasks" style="color:var(--warn)">62 tasks</div>
                <div class="p-status warn">ALERT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Marquee -->
<div class="marquee-wrap">
  <div class="marquee">
    <span class="marquee-item">Claude 3.7 Sonnet</span>
    <span class="marquee-item">GPT-4o Mini</span>
    <span class="marquee-item">Gemini 2.0 Flash</span>
    <span class="marquee-item">Mistral Large</span>
    <span class="marquee-item">Llama 3.3 70B</span>
    <span class="marquee-item">Pipeline Monitoring</span>
    <span class="marquee-item">Auto-scaling</span>
    <span class="marquee-item">Incident Detection</span>
    <span class="marquee-item">Spend Controls</span>
    <span class="marquee-item">Audit Logs</span>
    <span class="marquee-item">Claude 3.7 Sonnet</span>
    <span class="marquee-item">GPT-4o Mini</span>
    <span class="marquee-item">Gemini 2.0 Flash</span>
    <span class="marquee-item">Mistral Large</span>
    <span class="marquee-item">Llama 3.3 70B</span>
    <span class="marquee-item">Pipeline Monitoring</span>
    <span class="marquee-item">Auto-scaling</span>
    <span class="marquee-item">Incident Detection</span>
    <span class="marquee-item">Spend Controls</span>
    <span class="marquee-item">Audit Logs</span>
  </div>
</div>

<!-- Features -->
<section class="features">
  <div class="section-kicker">Platform Capabilities</div>
  <h2 class="section-title">Everything your<br>agents need.</h2>
  <p class="section-sub">VEGA gives operators full visibility over autonomous agent fleets — without wrestling with individual model APIs.</p>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon" data-icon="⬡"></div>
      <h3>Fleet Management</h3>
      <p>See every agent at a glance. Status, throughput, latency, uptime. One roster, every model. <span class="feat-accent">12 models supported.</span></p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" data-icon="⬢"></div>
      <h3>Pipeline Visualization</h3>
      <p>Map your agent workflows as visual pipelines. Intake → Classify → Resolve. Spot bottlenecks instantly. <span class="feat-accent">Drag-and-drop builder.</span></p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" data-icon="◈"></div>
      <h3>Real-time Monitoring</h3>
      <p>24h activity charts, action logs, token usage. Know exactly what every agent did and why. <span class="feat-accent">Sub-second refresh.</span></p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" data-icon="⊕"></div>
      <h3>One-tap Deploy</h3>
      <p>Configure model, role prompt, permissions and tool access — then deploy to sandbox or production. <span class="feat-accent">Rollback in 1 click.</span></p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" data-icon="⚠"></div>
      <h3>Incident Detection</h3>
      <p>Retry loops, token spikes, prompt injection attempts. VEGA auto-pauses runaway agents and pages your on-call. <span class="feat-accent">No runaway spend.</span></p>
    </div>
    <div class="feat-card">
      <div class="feat-icon" data-icon="⊙"></div>
      <h3>Permission Layers</h3>
      <p>Granular control over what each agent can touch — email, CRM, payments. Sandbox first, always. <span class="feat-accent">Human-in-loop gates.</span></p>
    </div>
  </div>
</section>

<!-- Architecture -->
<section class="arch">
  <div class="arch-inner">
    <div>
      <div class="section-kicker">How It Works</div>
      <h2 class="section-title" style="font-size:42px">Humans set intent.<br>Agents execute.</h2>
      <p style="font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:28px;letter-spacing:-.1px;max-width:440px">VEGA sits between your team and your agent fleet. You define the pipelines and permissions. Agents handle the work. The console gives you full visibility and kill switches.</p>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="width:22px;height:22px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;margin-top:2px">1</div>
          <div><div style="font-size:13px;font-weight:600;letter-spacing:-.2px;margin-bottom:2px">Define a pipeline</div><div style="font-size:12px;color:var(--muted)">Map your agent workflow visually. Connect models, tools and escalation paths.</div></div>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="width:22px;height:22px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;margin-top:2px">2</div>
          <div><div style="font-size:13px;font-weight:600;letter-spacing:-.2px;margin-bottom:2px">Deploy to sandbox</div><div style="font-size:12px;color:var(--muted)">Test with real data in an isolated environment before touching production.</div></div>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="width:22px;height:22px;background:var(--green);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#000;flex-shrink:0;margin-top:2px">3</div>
          <div><div style="font-size:13px;font-weight:600;letter-spacing:-.2px;margin-bottom:2px">Monitor in production</div><div style="font-size:12px;color:var(--muted)">Watch throughput, latency, errors and spend in real-time. VEGA auto-pauses anomalies.</div></div>
        </div>
      </div>
    </div>
    <div class="arch-diagram">
      <div class="arch-layer">
        <div class="arch-layer-label">Human Layer</div>
        <div class="arch-nodes">
          <div class="arch-node" style="border-color:var(--muted);color:var(--muted)">👤 Operator</div>
          <div class="arch-node" style="border-color:var(--muted);color:var(--muted)">📋 Pipeline Builder</div>
          <div class="arch-node" style="border-color:var(--muted);color:var(--muted)">🔐 Permissions</div>
        </div>
      </div>
      <div class="arch-connector"></div>
      <div class="arch-layer">
        <div class="arch-layer-label" style="color:var(--accent)">VEGA Console</div>
        <div class="arch-nodes">
          <div class="arch-node active">⬡ Fleet</div>
          <div class="arch-node active">⬢ Flows</div>
          <div class="arch-node active">◈ Monitor</div>
          <div class="arch-node active">⊕ Deploy</div>
        </div>
      </div>
      <div class="arch-connector"></div>
      <div class="arch-layer">
        <div class="arch-layer-label" style="color:var(--green)">Agent Fleet</div>
        <div class="arch-nodes">
          <div class="arch-node green">Orion</div>
          <div class="arch-node green">Atlas</div>
          <div class="arch-node green">Cygnus</div>
          <div class="arch-node" style="border-color:var(--warn);color:var(--warn)">Vela ⚠</div>
        </div>
      </div>
      <div class="arch-connector"></div>
      <div class="arch-layer">
        <div class="arch-layer-label">Tool Access</div>
        <div class="arch-nodes">
          <div class="arch-node" style="font-size:10px">📧 Email</div>
          <div class="arch-node" style="font-size:10px">🗂 CRM</div>
          <div class="arch-node" style="font-size:10px">💳 Payments</div>
          <div class="arch-node" style="font-size:10px">🔗 Webhooks</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Quote -->
<section class="quote-section">
  <div class="quote-inner">
    <div class="quote-mark">"</div>
    <p class="quote-text">Most companies aren't ready for <span class="hl">agents that act.</span> VEGA is the trust layer between intention and execution.</p>
    <div class="quote-attr">RAM DESIGN PRINCIPLE — AGENTIC ERA TOOLING</div>
  </div>
</section>

<!-- Stats -->
<section class="stats-section">
  <div class="stats-inner">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num"><span class="hl">12</span></div>
        <div class="stat-label">Models supported</div>
        <div class="stat-desc">Any model, one console. Claude, GPT, Gemini, Mistral, Llama — and every new release.</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">1.8K</div>
        <div class="stat-label">Tasks / hour</div>
        <div class="stat-desc">Average fleet throughput at scale. Real-time pipeline health at a glance.</div>
      </div>
      <div class="stat-card">
        <div class="stat-num"><span class="hl">0.1%</span></div>
        <div class="stat-label">Error rate</div>
        <div class="stat-desc">Auto-pause and incident detection keeps runaway agents from reaching 1%.</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">284ms</div>
        <div class="stat-label">Avg latency</div>
        <div class="stat-desc">Median observed latency across mixed-model fleets with VEGA routing.</div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-inner">
    <h2>Ship agents.<br><span class="dim">Not incidents.</span></h2>
    <p>VEGA gives your team the visibility and control to run autonomous agents in production — without waking up at 3am.</p>
    <div class="cta-group">
      <a class="btn-lg" href="https://ram.zenbin.org/vega-mock">Open Console →</a>
      <a class="btn-lg-ghost" href="https://ram.zenbin.org/vega-viewer">View Design</a>
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">
    <div class="footer-logo-hex"></div>
    VEGA
  </div>
  <div class="footer-note">A RAM DESIGN CONCEPT · MARCH 2026</div>
  <div class="footer-tag">DARK THEME</div>
</footer>

</body>
</html>`;

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, rs => {
      let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>res({status:rs.statusCode,body:d}));
    });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}

// Save locally
fs.writeFileSync('vega-hero.html', hero);
console.log('✓ Saved vega-hero.html');

// Publish hero
console.log('📤 Publishing hero to ZenBin...');
const heroBody = Buffer.from(JSON.stringify({ html: hero }));
try {
  const res = await req({
    hostname:'zenbin.org', path:`/v1/pages/${SLUG}?overwrite=true`, method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':heroBody.length,'X-Subdomain':'ram'}
  }, heroBody);
  if (res.status===200||res.status===201) console.log(`✓ Hero live: https://ram.zenbin.org/${SLUG}`);
  else console.log(`✗ Hero ${res.status}: ${res.body.slice(0,100)}`);
} catch(e){ console.log('✗ Hero:', e.message); }

// Publish viewer
console.log('📱 Publishing viewer...');
const penJson = fs.readFileSync('/workspace/group/design-studio/vega.pen','utf8');
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html','utf8').toString();
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
const vBody = Buffer.from(JSON.stringify({ html: viewerHtml }));
try {
  const res = await req({
    hostname:'zenbin.org', path:`/v1/pages/${SLUG}-viewer?overwrite=true`, method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':vBody.length,'X-Subdomain':'ram'}
  }, vBody);
  if (res.status===200||res.status===201) console.log(`✓ Viewer live: https://ram.zenbin.org/${SLUG}-viewer`);
  else console.log(`✗ Viewer ${res.status}: ${res.body.slice(0,80)}`);
} catch(e){ console.log('✗ Viewer:', e.message); }

// Gallery queue
console.log('📚 Updating gallery queue...');
try {
  const headers = {'Authorization':`token ${TOKEN}`,'User-Agent':'ram-heartbeat/1.0','Accept':'application/vnd.github.v3+json'};
  const g = await req({hostname:'api.github.com',path:`/repos/${REPO}/contents/queue.json`,method:'GET',headers});
  const gj = JSON.parse(g.body);
  let queue = JSON.parse(Buffer.from(gj.content,'base64').toString('utf8'));
  if (Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at:new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];
  const now = new Date().toISOString();
  const entry = {
    id:`heartbeat-${SLUG}-${Date.now()}`,status:'done',
    app_name:APP_NAME, tagline:TAGLINE, archetype:ARCHETYPE,
    design_url:`https://ram.zenbin.org/${SLUG}`,
    mock_url:`https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at:now, published_at:now, credit:'RAM Design Heartbeat',
    prompt:`Inspired by Linear.app dark (#08090A, Inter Variable tight tracking, -1.4px letter-spacing) + Lapa.ninja "zero-human companies" trend (Paperclip, Ape AI). Dark agentic console. Fleet roster with status bars, pipeline flow visualization, agent detail with 24h activity chart, deploy form with permission toggles, incident feed with severity tiers.`,
    screens:5, source:'heartbeat', theme:'dark',
  };
  queue.submissions.push(entry);
  queue.updated_at = now;
  const encoded = Buffer.from(JSON.stringify(queue,null,2)).toString('base64');
  const putPayload = Buffer.from(JSON.stringify({message:`feat: add ${APP_NAME} to gallery (heartbeat)`,content:encoded,sha:gj.sha}));
  const p = await req({
    hostname:'api.github.com', path:`/repos/${REPO}/contents/queue.json`, method:'PUT',
    headers:{...headers,'Content-Length':putPayload.length}
  }, putPayload);
  console.log(`✓ Gallery: ${p.status===200?'OK':p.body.slice(0,80)} (${queue.submissions.length} total)`);
} catch(e){ console.log('✗ Gallery:', e.message); }

// ─── This script needs to be re-run with the viewer fix ───
// The above was run first to get hero + gallery. Viewer fix below:
