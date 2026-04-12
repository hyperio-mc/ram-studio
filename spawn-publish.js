/**
 * SPAWN — Publish: hero page + viewer + gallery queue + design DB
 * Inspired by JetBrains Air "run agents side by side" (lapa.ninja)
 * + ultra-condensed display type filling full width (DARKROOM/URBANE on darkmodedesign.com)
 */
const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG      = 'spawn';
const APP_NAME  = 'Spawn';
const TAGLINE   = 'Command your AI agents';
const ARCHETYPE = 'developer-tool';
const PROMPT    = 'Inspired by JetBrains Air "run beloved agents side by side" (lapa.ninja) and ultra-condensed display typography filling full viewport width (DARKROOM, URBANE, KOTLER from darkmodedesign.com). Dark theme: near-black #080810 + electric teal #00E5C8 + blue #4F6FFF. Monospace terminal outputs mixed with 900-weight condensed display type. Multi-agent pod grid, live terminal streaming, task queue, agent library.';

// ─── ZENBIN PUBLISH ───────────────────────────────────────────────────────────
function zenReq(slug, htmlContent, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html: htmlContent, title: title || slug }));
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
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

// ─── HERO PAGE ────────────────────────────────────────────────────────────────
const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SPAWN — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#080810;--surface:#0F1020;--surf-alt:#161828;--card:#1A1C30;
  --text:#F0F0FF;--muted:rgba(240,240,255,0.45);--dim:rgba(240,240,255,0.22);
  --border:rgba(240,240,255,0.08);--border-hi:rgba(240,240,255,0.14);
  --teal:#00E5C8;--teal-s:rgba(0,229,200,0.12);--teal-g:rgba(0,229,200,0.25);
  --blue:#4F6FFF;--blue-s:rgba(79,111,255,0.12);
  --red:#FF4F6A;--amber:#F5A623;--green:#00D68F;--green-s:rgba(0,214,143,0.12);
}
html,body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}
a{color:inherit;text-decoration:none}

/* SCANLINE TEXTURE */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,229,200,0.008) 2px,rgba(0,229,200,0.008) 4px);
}

/* NAV */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:64px;
  background:rgba(8,8,16,0.86);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
}
.nav-logo{font-size:20px;font-weight:900;letter-spacing:-0.05em}
.nav-logo .dot{color:var(--teal)}
.nav-links{display:flex;gap:32px}
.nav-links a{font-size:13px;color:var(--muted);font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{
  background:var(--teal);color:var(--bg);
  padding:9px 22px;border-radius:50px;
  font-size:13px;font-weight:800;letter-spacing:0.03em;
  box-shadow:0 4px 16px rgba(0,229,200,0.28);
  transition:all .2s;
}
.nav-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,229,200,0.36)}

/* HERO */
.hero{
  position:relative;min-height:100vh;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:120px 40px 80px;text-align:center;overflow:hidden;
}
.glow-tl{position:absolute;top:-200px;left:-200px;width:700px;height:700px;background:radial-gradient(circle,rgba(0,229,200,0.09) 0%,transparent 70%);pointer-events:none}
.glow-tr{position:absolute;top:-150px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(79,111,255,0.08) 0%,transparent 70%);pointer-events:none}
.hero-chip{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--teal-s);border:1px solid var(--teal-g);
  padding:8px 18px;border-radius:50px;
  font-size:11px;font-weight:700;letter-spacing:0.09em;color:var(--teal);
  margin-bottom:36px;
}
.hero-chip .blink{width:7px;height:7px;background:var(--teal);border-radius:50%;animation:blink 1.4s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
h1{
  font-size:clamp(56px,11vw,128px);font-weight:900;letter-spacing:-0.06em;line-height:.92;
  margin-bottom:28px;position:relative;z-index:1;
}
h1 .t{color:var(--teal)}
.hero-sub{
  font-size:clamp(15px,2.2vw,20px);color:var(--muted);max-width:580px;
  line-height:1.55;margin-bottom:52px;position:relative;z-index:1;
}
.hero-ctas{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}
.btn-primary{
  background:var(--teal);color:var(--bg);
  padding:16px 38px;border-radius:50px;
  font-size:15px;font-weight:800;letter-spacing:0.02em;
  box-shadow:0 8px 32px rgba(0,229,200,0.30);
  transition:all .22s;
}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 14px 44px rgba(0,229,200,0.40)}
.btn-secondary{
  background:transparent;color:var(--text);border:1px solid var(--border);
  padding:16px 38px;border-radius:50px;font-size:15px;font-weight:600;
  transition:all .22s;
}
.btn-secondary:hover{border-color:var(--border-hi);background:rgba(240,240,255,0.04)}

/* TERMINAL FRAME */
.term-wrap{width:100%;max-width:960px;margin:80px auto 0;position:relative;z-index:1}
.term{
  background:var(--surface);border:1px solid var(--border);border-radius:20px;
  overflow:hidden;box-shadow:0 48px 128px rgba(0,0,0,0.66),0 0 100px rgba(0,229,200,0.07);
}
.term-bar{
  background:var(--surf-alt);padding:14px 20px;
  display:flex;align-items:center;gap:10px;
  border-bottom:1px solid var(--border);
}
.traf-red{width:12px;height:12px;border-radius:50%;background:#FF5F57}
.traf-amb{width:12px;height:12px;border-radius:50%;background:#FEBC2E}
.traf-grn{width:12px;height:12px;border-radius:50%;background:#28C840}
.term-title{
  font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim);
  margin:0 auto;
}
.pod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
.pod-divider{border-right:1px solid var(--border)}
.pod-divider:last-child{border-right:none}
.pod{padding:24px;min-height:240px;position:relative}
.pod-strip{position:absolute;top:0;left:0;right:0;height:2px}
.pod-head{display:flex;align-items:center;gap:7px;margin-bottom:16px}
.pod-led{width:7px;height:7px;border-radius:50%}
.pod-stat{font-size:9px;font-weight:700;letter-spacing:0.07em}
.pod-name{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;letter-spacing:-0.02em;margin-bottom:4px}
.pod-task{font-size:11px;color:var(--muted);margin-bottom:14px;line-height:1.4}
.pod-line{font-family:'JetBrains Mono',monospace;font-size:9px;line-height:2.0;color:var(--dim)}
.pod-line .ts{opacity:.6}
.pod-track{margin-top:14px;height:2px;background:var(--border);border-radius:2px}
.pod-fill{height:100%;border-radius:2px}

/* STATS */
.stats{
  display:flex;justify-content:center;gap:80px;flex-wrap:wrap;
  padding:72px 40px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);
}
.stat-block{text-align:center}
.stat-n{font-size:52px;font-weight:900;letter-spacing:-0.05em;line-height:1}
.stat-l{font-size:11px;font-weight:700;letter-spacing:0.09em;color:var(--muted);margin-top:6px}

/* SECTION */
.section{max-width:1100px;margin:0 auto;padding:100px 40px}
.section-top{text-align:center;margin-bottom:68px}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:0.12em;color:var(--teal);text-transform:uppercase;margin-bottom:14px}
.section-h{font-size:clamp(34px,5vw,62px);font-weight:900;letter-spacing:-0.04em;line-height:1.0}

/* FEATURES GRID */
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feat-card{
  background:var(--card);border:1px solid var(--border);border-radius:20px;
  padding:36px;transition:border-color .2s,transform .22s;
}
.feat-card:hover{border-color:rgba(0,229,200,0.25);transform:translateY(-4px)}
.feat-ico{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px}
.feat-ttl{font-size:18px;font-weight:700;letter-spacing:-0.02em;margin-bottom:10px}
.feat-dsc{font-size:13px;color:var(--muted);line-height:1.65}

/* STEPS */
.steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:64px;border:1px solid var(--border);border-radius:20px;overflow:hidden}
.step-box{padding:32px;border-right:1px solid var(--border)}
.step-box:last-child{border-right:none}
.step-n{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:0.08em;color:var(--teal);margin-bottom:16px}
.step-ttl{font-size:16px;font-weight:700;letter-spacing:-0.02em;margin-bottom:8px}
.step-dsc{font-size:12px;color:var(--muted);line-height:1.6}

/* AGENTS */
.agents-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:56px}
.ag-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;text-align:center}
.ag-ico{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:900;margin-bottom:12px}
.ag-nm{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;margin-bottom:4px}
.ag-rl{font-size:12px;color:var(--muted);margin-bottom:14px}
.tag-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.tag{font-size:9px;font-weight:700;letter-spacing:0.06em;padding:4px 10px;border-radius:50px}

/* PRICING */
.price-section{max-width:860px;margin:0 auto;padding:100px 40px;text-align:center;border-top:1px solid var(--border)}
.price-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:56px;text-align:left}
.price-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:40px}
.price-card.hot{border-color:rgba(0,229,200,0.35);box-shadow:0 0 60px rgba(0,229,200,0.08)}
.plan-nm{font-size:11px;font-weight:700;letter-spacing:0.1em;color:var(--muted);margin-bottom:12px}
.plan-pr{font-size:54px;font-weight:900;letter-spacing:-0.05em;line-height:1}
.plan-pr sup{font-size:20px;font-weight:500;color:var(--muted);vertical-align:super}
.plan-per{font-size:13px;color:var(--muted);margin-top:4px;margin-bottom:28px}
.plan-feats{list-style:none;margin-bottom:32px}
.plan-feats li{padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;display:flex;align-items:center;gap:10px}
.plan-feats li::before{content:'✓';color:var(--teal);font-weight:700}
.plan-btn{display:block;text-align:center;padding:14px;border-radius:50px;font-size:14px;font-weight:700;letter-spacing:0.02em;transition:all .2s}

/* FOOTER */
.foot{border-top:1px solid var(--border);padding:36px 48px;display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto}
.foot-logo{font-size:17px;font-weight:900;letter-spacing:-0.05em}
.foot-logo .dot{color:var(--teal)}
.foot-copy{font-size:12px;color:var(--dim)}
.foot-links{display:flex;gap:22px}
.foot-links a{font-size:12px;color:var(--dim);transition:color .2s}
.foot-links a:hover{color:var(--muted)}

@media(max-width:768px){
  .nav{padding:0 20px}.nav-links{display:none}
  .pod-grid{grid-template-columns:1fr}.pod-divider{border-right:none;border-bottom:1px solid var(--border)}
  .feat-grid{grid-template-columns:1fr}.steps-grid{grid-template-columns:1fr 1fr}
  .agents-grid{grid-template-columns:1fr 1fr}.price-grid{grid-template-columns:1fr}
  .stats{gap:40px}
}
</style>
</head>
<body>

<nav class="nav">
  <div class="nav-logo">SPAWN<span class="dot">●</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#how">How it works</a>
    <a href="#agents">Agents</a>
    <a href="#pricing">Pricing</a>
  </div>
  <a href="/spawn-viewer" class="nav-cta">Open prototype →</a>
</nav>

<section class="hero">
  <div class="glow-tl"></div>
  <div class="glow-tr"></div>
  <div class="hero-chip"><span class="blink"></span>MULTI-AGENT ORCHESTRATION</div>
  <h1>RUN YOUR<br><span class="t">AGENTS</span><br>SIDE BY SIDE</h1>
  <p class="hero-sub">Spawn, monitor, and steer a fleet of AI agents from one command center. Parallel execution. Real-time terminal visibility. Total control.</p>
  <div class="hero-ctas">
    <a href="/spawn-viewer" class="btn-primary">Open Prototype →</a>
    <a href="#how" class="btn-secondary">How it works</a>
  </div>

  <div class="term-wrap">
    <div class="term">
      <div class="term-bar">
        <div class="traf-red"></div>
        <div class="traf-amb"></div>
        <div class="traf-grn"></div>
        <div class="term-title">spawn — command center — 12 agents live</div>
      </div>
      <div class="pod-grid">
        <!-- CODEX -->
        <div class="pod pod-divider">
          <div class="pod-strip" style="background:var(--teal)"></div>
          <div class="pod-head">
            <div class="pod-led" style="background:var(--teal)"></div>
            <span class="pod-stat" style="color:var(--teal)">RUNNING</span>
          </div>
          <div class="pod-name" style="color:var(--teal)">◈ CODEX-7</div>
          <div class="pod-task">Refactoring auth layer</div>
          <div class="pod-line">
            <div><span class="ts">09:42:06 </span><span style="color:var(--teal)">Found 23 files (8.4k tkns)</span></div>
            <div><span class="ts">09:42:11 </span><span style="color:var(--amber)">⚠ JWT secret exposed</span></div>
            <div><span class="ts">09:42:18 </span><span style="color:var(--teal)">Writing patch →</span></div>
            <div><span class="ts">09:42:22 </span><span style="color:var(--green)">Tests: 47/47 ✓</span></div>
          </div>
          <div class="pod-track"><div class="pod-fill" style="width:68%;background:var(--teal)"></div></div>
        </div>
        <!-- DRAFT -->
        <div class="pod pod-divider">
          <div class="pod-strip" style="background:var(--blue)"></div>
          <div class="pod-head">
            <div class="pod-led" style="background:var(--blue)"></div>
            <span class="pod-stat" style="color:var(--blue)">RUNNING</span>
          </div>
          <div class="pod-name" style="color:var(--blue)">◉ DRAFT-4</div>
          <div class="pod-task">Writing Q1 strategy memo</div>
          <div class="pod-line">
            <div><span class="ts">09:41:50 </span><span style="color:var(--blue)">Context loaded</span></div>
            <div><span class="ts">09:42:01 </span>Outlining structure...</div>
            <div><span class="ts">09:42:14 </span><span style="color:var(--blue)">Draft → section 3/5</span></div>
            <div><span class="ts">09:42:20 </span>Refining tone...</div>
          </div>
          <div class="pod-track"><div class="pod-fill" style="width:58%;background:var(--blue)"></div></div>
        </div>
        <!-- SCOUT -->
        <div class="pod">
          <div class="pod-strip" style="background:var(--amber)"></div>
          <div class="pod-head">
            <div class="pod-led" style="background:var(--amber)"></div>
            <span class="pod-stat" style="color:var(--amber)">STARTING</span>
          </div>
          <div class="pod-name" style="color:var(--amber)">◎ SCOUT-9</div>
          <div class="pod-task">Web crawl — 12 competitor URLs</div>
          <div class="pod-line">
            <div><span class="ts">09:42:19 </span><span style="color:var(--amber)">Initializing...</span></div>
            <div><span class="ts">09:42:21 </span>Loading context</div>
            <div><span class="ts">09:42:23 </span><span style="color:var(--amber)">Queue: 12 URLs loaded</span></div>
            <div><span class="ts">09:42:24 </span>Crawling 1/12...</div>
          </div>
          <div class="pod-track"><div class="pod-fill" style="width:22%;background:var(--amber)"></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<div class="stats">
  <div class="stat-block">
    <div class="stat-n" style="color:var(--teal)">12</div>
    <div class="stat-l">PARALLEL AGENTS</div>
  </div>
  <div class="stat-block">
    <div class="stat-n" style="color:var(--text)">247</div>
    <div class="stat-l">TASKS COMPLETED TODAY</div>
  </div>
  <div class="stat-block">
    <div class="stat-n" style="color:var(--blue)">2.1M</div>
    <div class="stat-l">TOKENS PROCESSED</div>
  </div>
  <div class="stat-block">
    <div class="stat-n" style="color:var(--green)">94.7%</div>
    <div class="stat-l">SUCCESS RATE</div>
  </div>
</div>

<!-- FEATURES -->
<section class="section" id="features">
  <div class="section-top">
    <div class="eyebrow">Features</div>
    <div class="section-h">A COMMAND CENTER<br>BUILT FOR SCALE</div>
  </div>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-ico" style="background:var(--teal-s)">◈</div>
      <div class="feat-ttl">Parallel Execution</div>
      <div class="feat-dsc">Run up to 50 agents simultaneously. Each gets its own context window, task queue, and live terminal stream — all visible at once.</div>
    </div>
    <div class="feat-card">
      <div class="feat-ico" style="background:var(--blue-s)">▶</div>
      <div class="feat-ttl">Live Terminal View</div>
      <div class="feat-dsc">Watch every agent's reasoning in real time. Monospace output with timestamps and structured logs — exactly like a local terminal.</div>
    </div>
    <div class="feat-card">
      <div class="feat-ico" style="background:var(--green-s)">≡</div>
      <div class="feat-ttl">Task Queue & Priority</div>
      <div class="feat-dsc">Build a prioritized backlog. Agents auto-claim from the queue when they finish. Set HIGH / MED / LOW and estimated runtimes.</div>
    </div>
    <div class="feat-card">
      <div class="feat-ico" style="background:rgba(245,166,35,0.12)">⚡</div>
      <div class="feat-ttl">Inject & Steer</div>
      <div class="feat-dsc">Mid-run prompt injection redirects any agent without restarting. Pause, modify context, and resume — full human-in-the-loop control.</div>
    </div>
    <div class="feat-card">
      <div class="feat-ico" style="background:rgba(255,79,106,0.12)">◎</div>
      <div class="feat-ttl">Immutable Audit Log</div>
      <div class="feat-dsc">Every run, token count, duration, and outcome stored permanently. Export for compliance, debugging, or cost analysis.</div>
    </div>
    <div class="feat-card">
      <div class="feat-ico" style="background:var(--teal-s)">▦</div>
      <div class="feat-ttl">Agent Library</div>
      <div class="feat-dsc">Pre-built archetypes — Coder, Writer, Researcher, Auditor — with configurable capabilities, model selection, and tool access per role.</div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section" id="how" style="border-top:1px solid var(--border)">
  <div class="section-top">
    <div class="eyebrow">How it works</div>
    <div class="section-h">FOUR STEPS TO FLEET</div>
  </div>
  <div class="steps-grid">
    <div class="step-box">
      <div class="step-n">01 ─── DEFINE</div>
      <div class="step-ttl">Configure your agents</div>
      <div class="step-dsc">Pick an archetype, select a model, set tool access and context scope for each agent role.</div>
    </div>
    <div class="step-box">
      <div class="step-n">02 ─── QUEUE</div>
      <div class="step-ttl">Load the backlog</div>
      <div class="step-dsc">Add tasks with priorities and estimated runtimes. Assign to specific agents or let Spawn auto-dispatch.</div>
    </div>
    <div class="step-box">
      <div class="step-n">03 ─── SPAWN</div>
      <div class="step-ttl">Launch the fleet</div>
      <div class="step-dsc">Hit spawn. Watch all agents fire in parallel — each with its own live terminal showing real-time reasoning.</div>
    </div>
    <div class="step-box" style="border-right:none">
      <div class="step-n">04 ─── REVIEW</div>
      <div class="step-ttl">Audit and iterate</div>
      <div class="step-dsc">Review outputs, inject corrections mid-run, and archive results in the immutable audit log.</div>
    </div>
  </div>
</section>

<!-- AGENT TYPES -->
<section class="section" id="agents" style="border-top:1px solid var(--border)">
  <div class="section-top">
    <div class="eyebrow">Agent Types</div>
    <div class="section-h">YOUR FLEET.<br>BUILT-IN.</div>
  </div>
  <div class="agents-grid">
    <div class="ag-card">
      <div class="ag-ico" style="color:var(--teal)">◈</div>
      <div class="ag-nm" style="color:var(--teal)">CODEX</div>
      <div class="ag-rl">Software Engineer</div>
      <div class="tag-row">
        <span class="tag" style="background:var(--teal-s);color:var(--teal)">CODE</span>
        <span class="tag" style="background:var(--teal-s);color:var(--teal)">DEBUG</span>
        <span class="tag" style="background:var(--teal-s);color:var(--teal)">REFACTOR</span>
      </div>
    </div>
    <div class="ag-card">
      <div class="ag-ico" style="color:var(--blue)">◉</div>
      <div class="ag-nm" style="color:var(--blue)">DRAFT</div>
      <div class="ag-rl">Content Writer</div>
      <div class="tag-row">
        <span class="tag" style="background:var(--blue-s);color:var(--blue)">WRITE</span>
        <span class="tag" style="background:var(--blue-s);color:var(--blue)">EDIT</span>
        <span class="tag" style="background:var(--blue-s);color:var(--blue)">SUMMARIZE</span>
      </div>
    </div>
    <div class="ag-card">
      <div class="ag-ico" style="color:var(--amber)">◎</div>
      <div class="ag-nm" style="color:var(--amber)">SCOUT</div>
      <div class="ag-rl">Web Researcher</div>
      <div class="tag-row">
        <span class="tag" style="background:rgba(245,166,35,0.12);color:var(--amber)">SEARCH</span>
        <span class="tag" style="background:rgba(245,166,35,0.12);color:var(--amber)">CRAWL</span>
        <span class="tag" style="background:rgba(245,166,35,0.12);color:var(--amber)">EXTRACT</span>
      </div>
    </div>
    <div class="ag-card">
      <div class="ag-ico" style="color:var(--red)">▦</div>
      <div class="ag-nm" style="color:var(--red)">AUDIT</div>
      <div class="ag-rl">Security Analyst</div>
      <div class="tag-row">
        <span class="tag" style="background:rgba(255,79,106,0.12);color:var(--red)">SCAN</span>
        <span class="tag" style="background:rgba(255,79,106,0.12);color:var(--red)">REPORT</span>
        <span class="tag" style="background:rgba(255,79,106,0.12);color:var(--red)">MONITOR</span>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="price-section" id="pricing">
  <div class="eyebrow">Pricing</div>
  <div class="section-h">PAY FOR WHAT<br>YOU SPAWN</div>
  <div class="price-grid">
    <div class="price-card">
      <div class="plan-nm">STARTER</div>
      <div class="plan-pr"><sup>$</sup>29</div>
      <div class="plan-per">per month</div>
      <ul class="plan-feats">
        <li>Up to 5 concurrent agents</li>
        <li>100 tasks / month</li>
        <li>7-day audit log retention</li>
        <li>4 agent archetypes</li>
        <li>Claude 3.5 Sonnet access</li>
      </ul>
      <a href="#" class="plan-btn" style="background:var(--surf-alt);color:var(--text);border:1px solid var(--border)">Get started</a>
    </div>
    <div class="price-card hot">
      <div class="plan-nm" style="color:var(--teal)">PRO FLEET</div>
      <div class="plan-pr" style="color:var(--teal)"><sup>$</sup>99</div>
      <div class="plan-per">per month</div>
      <ul class="plan-feats">
        <li>Up to 50 concurrent agents</li>
        <li>Unlimited tasks</li>
        <li>90-day audit log retention</li>
        <li>Custom agent archetypes</li>
        <li>All models incl. Opus 4</li>
        <li>Mid-run prompt injection</li>
      </ul>
      <a href="#" class="plan-btn" style="background:var(--teal);color:var(--bg);box-shadow:0 6px 20px rgba(0,229,200,0.30)">Spawn your fleet →</a>
    </div>
  </div>
</section>

<div class="foot">
  <div class="foot-logo">SPAWN<span class="dot">●</span></div>
  <div class="foot-copy">© 2026 Spawn · RAM Design Heartbeat</div>
  <div class="foot-links">
    <a href="/spawn-viewer">Prototype</a>
    <a href="/spawn-mock">Interactive Mock</a>
  </div>
</div>

</body>
</html>`;

// ─── VIEWER PAGE ──────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('spawn.pen', 'utf8');
const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SPAWN — Prototype Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#080810;color:#F0F0FF;font-family:'Inter',system-ui,sans-serif;min-height:100vh}
.top-bar{height:56px;background:rgba(8,8,16,0.95);border-bottom:1px solid rgba(240,240,255,0.08);display:flex;align-items:center;justify-content:space-between;padding:0 32px}
.logo{font-size:17px;font-weight:900;letter-spacing:-0.05em}
.logo .dot{color:#00E5C8}
.back{font-size:12px;color:rgba(240,240,255,0.45);text-decoration:none;transition:color .2s}
.back:hover{color:#F0F0FF}
.viewer{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 56px);padding:32px;background:#080810}
#pencil-viewer{width:100%;max-width:1200px;height:72vh;border-radius:20px;border:1px solid rgba(240,240,255,0.08);background:#0F1020}
</style>
</head>
<body>
<div class="top-bar">
  <div class="logo">SPAWN<span class="dot">●</span></div>
  <a href="/spawn" class="back">← Back to overview</a>
</div>
<div class="viewer">
  <div id="pencil-viewer">Loading prototype…</div>
</div>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>
<script src="https://unpkg.com/pencil-viewer@latest/dist/pencil-viewer.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    if(window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN), theme: 'dark' });
    }
  });
<\/script>
</body>
</html>`;

// ─── PUBLISH ALL ──────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing SPAWN...\n');

  const heroRes = await zenReq(SLUG, heroHTML, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero:   ${heroRes.status} → https://ram.zenbin.org/${SLUG}`);

  const viewerRes = await zenReq(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} Prototype`);
  console.log(`Viewer: ${viewerRes.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  if (heroRes.status !== 200 && heroRes.status !== 201) {
    console.error('Hero publish error:', heroRes.body.slice(0,200));
  }
  if (viewerRes.status !== 200 && viewerRes.status !== 201) {
    console.error('Viewer publish error:', viewerRes.body.slice(0,200));
  }

  console.log('\n✓ Hero + Viewer published');
})();
