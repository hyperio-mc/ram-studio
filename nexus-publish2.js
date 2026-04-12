// NEXUS — Publish script v2 (correct zenbin API)
const fs = require('fs');
const https = require('https');

const SLUG = 'nexus';
const APP_NAME = 'Nexus';
const TAGLINE = 'Command your agents';
const ARCHETYPE = 'ai-agent-orchestration';
const ORIGINAL_PROMPT = 'AI agent orchestration dashboard inspired by Runlayer (land-book.com) and Linear UI refresh (darkmodedesign.com). Dark mode, enterprise MCP management, agent fleet monitoring, execution trace viewer.';

function httpsReq(opts, body) {
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

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
}

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nexus — Command your agents</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0A0B0F;
    --surface: #12141A;
    --surface-alt: #1A1D27;
    --border: #1F2230;
    --text: #E8EAF0;
    --muted: rgba(232,234,240,0.45);
    --accent: #4F6EF7;
    --accent-glow: rgba(79,110,247,0.18);
    --accent2: #00D4AA;
    --accent2-glow: rgba(0,212,170,0.12);
    --danger: #E8445A;
    --warning: #F5A623;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.6; overflow-x: hidden; }

  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; background: rgba(10,11,15,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
  .nav-brand { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
  .nav-logo { width: 28px; height: 28px; background: var(--accent); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; }
  .nav-links { display: flex; gap: 32px; font-size: 14px; }
  .nav-links a { color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { display: flex; gap: 12px; align-items: center; }
  .btn { padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; transition: all 0.2s; display: inline-block; }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); }
  .btn-primary { background: var(--accent); color: #fff; border: 1px solid transparent; }
  .btn-lg { padding: 13px 28px; font-size: 15px; border-radius: 10px; }

  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 40px 80px; text-align: center; position: relative; overflow: hidden; }
  .hero-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 800px; height: 500px; background: radial-gradient(ellipse at center top, rgba(79,110,247,0.1) 0%, transparent 70%); pointer-events: none; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; font-size: 13px; color: var(--muted); margin-bottom: 32px; }
  .badge-dot { width: 6px; height: 6px; background: var(--accent2); border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  h1 { font-size: clamp(42px, 6vw, 82px); font-weight: 700; letter-spacing: -0.04em; line-height: 1.05; margin-bottom: 24px; background: linear-gradient(160deg, #E8EAF0 40%, rgba(232,234,240,0.45)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-sub { font-size: 18px; color: var(--muted); max-width: 540px; margin: 0 auto 40px; line-height: 1.7; }
  .hero-ctas { display: flex; gap: 14px; justify-content: center; margin-bottom: 80px; flex-wrap: wrap; }

  /* Dashboard mockup */
  .db-wrap { width: 100%; max-width: 920px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: 0 50px 140px rgba(0,0,0,0.6), 0 0 80px rgba(79,110,247,0.07); }
  .db-bar { background: var(--surface-alt); border-bottom: 1px solid var(--border); padding: 12px 20px; display: flex; align-items: center; gap: 8px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .db-title-bar { margin-left: 8px; font-size: 12px; color: var(--muted); font-family: monospace; }
  .db-layout { display: grid; grid-template-columns: 185px 1fr; }
  .db-side { border-right: 1px solid var(--border); padding: 16px 0; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 18px; font-size: 12.5px; color: var(--muted); }
  .nav-item.active { color: var(--text); background: rgba(79,110,247,0.12); border-right: 2px solid var(--accent); }
  .db-content { padding: 22px; display: flex; flex-direction: column; gap: 16px; }
  .db-hdr { display: flex; justify-content: space-between; align-items: flex-start; }
  .db-htitle { font-size: 16px; font-weight: 600; letter-spacing: -0.02em; }
  .db-hsub { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .badge-green { display: inline-flex; align-items: center; gap: 5px; background: rgba(0,212,170,0.1); border: 1px solid rgba(0,212,170,0.2); color: var(--accent2); padding: 3px 9px; border-radius: 5px; font-size: 11px; }
  .metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
  .met { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 9px; padding: 12px; }
  .met-v { font-size: 20px; font-weight: 700; letter-spacing: -0.03em; }
  .met-l { font-size: 10px; color: var(--muted); margin-top: 2px; }
  .met-d { font-size: 10px; margin-top: 5px; }
  .c-green { color: var(--accent2); }
  .c-blue { color: var(--accent); }
  .c-red { color: var(--danger); }
  .slabel { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 6px; }
  .agents { display: flex; flex-direction: column; gap: 7px; }
  .ag { display: grid; grid-template-columns: 1fr 70px 36px; gap: 8px; align-items: center; background: var(--surface-alt); border: 1px solid var(--border); border-radius: 7px; padding: 10px 12px; }
  .ag-name { font-size: 12px; font-weight: 500; }
  .ag-task { font-size: 10px; color: var(--muted); }
  .sdot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 4px; }
  .s-run { background: var(--accent2); box-shadow: 0 0 5px var(--accent2); animation: pulse 1.5s infinite; }
  .s-err { background: var(--danger); }
  .s-idle { background: rgba(232,234,240,0.25); }
  .pbar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .pfill { height: 100%; border-radius: 2px; }
  .pct { font-size: 10px; text-align: right; }

  /* Sections */
  .section { padding: 90px 40px; max-width: 1100px; margin: 0 auto; }
  .sec-badge { font-size: 11px; color: var(--accent); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 14px; }
  .sec-title { font-size: clamp(28px, 3vw, 44px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.12; margin-bottom: 14px; }
  .sec-sub { color: var(--muted); font-size: 17px; max-width: 520px; line-height: 1.7; }
  .feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-top: 56px; }
  .feat { background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 26px; }
  .feat-ico { width: 40px; height: 40px; border-radius: 9px; background: rgba(79,110,247,0.12); border: 1px solid rgba(79,110,247,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 14px; }
  .feat-t { font-size: 15px; font-weight: 600; margin-bottom: 7px; }
  .feat-d { font-size: 13px; color: var(--muted); line-height: 1.6; }
  .divider { height: 1px; background: var(--border); max-width: 1100px; margin: 0 auto; }

  /* MCP section */
  .mcp-sect { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 90px 40px; }
  .mcp-in { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; }
  .pills { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 28px; }
  .pill { display: flex; align-items: center; gap: 7px; padding: 7px 13px; background: var(--surface-alt); border: 1px solid var(--border); border-radius: 7px; font-size: 12px; }
  .pdot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent2); }

  /* Trace box */
  .trace { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 12px; padding: 18px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11.5px; }
  .trow { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--border); }
  .trow:last-child { border-bottom: none; }
  .tico { width: 18px; height: 18px; border-radius: 50%; background: rgba(0,212,170,0.12); border: 1px solid rgba(0,212,170,0.25); display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; margin-top: 1px; }
  .tname { color: var(--accent2); font-weight: 600; }
  .tdetail { color: var(--muted); font-size: 10.5px; }
  .ttime { color: var(--accent); margin-left: auto; white-space: nowrap; font-size: 10.5px; }

  /* Eval row */
  .evals { display: flex; gap: 10px; margin-top: 14px; }
  .eval { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 7px; padding: 11px; text-align: center; }
  .eval-v { font-size: 17px; font-weight: 700; }
  .eval-l { font-size: 10px; color: var(--muted); margin-top: 2px; }

  /* CTA */
  .cta-sec { padding: 110px 40px; text-align: center; position: relative; overflow: hidden; }
  .cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 400px; background: radial-gradient(ellipse, rgba(79,110,247,0.08) 0%, transparent 70%); pointer-events: none; }
  .cta-title { font-size: clamp(30px, 4vw, 54px); font-weight: 700; letter-spacing: -0.04em; margin-bottom: 14px; }
  .cta-sub { color: var(--muted); font-size: 17px; margin-bottom: 38px; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

  footer { border-top: 1px solid var(--border); padding: 36px 40px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .foot-brand { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .foot-links { display: flex; gap: 24px; font-size: 13px; }
  .foot-links a { color: var(--muted); text-decoration: none; }
  .foot-copy { font-size: 12px; color: var(--muted); }
</style>
</head>
<body>

<nav>
  <div class="nav-brand">
    <div class="nav-logo">⬡</div>
    Nexus
  </div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#mcp">MCPs</a>
    <a href="#trace">Trace</a>
  </div>
  <div class="nav-cta">
    <a href="#" class="btn btn-ghost">Sign in</a>
    <a href="#" class="btn btn-primary">Get started →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-badge">
    <span class="badge-dot"></span>
    MCP 2.0 supported · 200+ integrations
  </div>
  <h1>Command your<br>AI agents</h1>
  <p class="hero-sub">A unified control plane for deploying, monitoring, and debugging AI agent workflows. Built for teams shipping at scale.</p>
  <div class="hero-ctas">
    <a href="nexus-viewer" class="btn btn-primary btn-lg">View design →</a>
    <a href="nexus-mock" class="btn btn-ghost btn-lg">Interactive mock ☀◑</a>
  </div>

  <!-- Dashboard mockup -->
  <div class="db-wrap">
    <div class="db-bar">
      <div class="dot" style="background:#E8445A"></div>
      <div class="dot" style="background:#F5A623"></div>
      <div class="dot" style="background:#00D4AA"></div>
      <span class="db-title-bar">nexus · Agent Control Center · 14:32 UTC</span>
    </div>
    <div class="db-layout">
      <div class="db-side">
        <div class="nav-item active">⬛ Overview</div>
        <div class="nav-item">◫ Fleet</div>
        <div class="nav-item">◈ Runs</div>
        <div class="nav-item">⚡ Agents</div>
        <div class="nav-item">⌘ MCPs</div>
      </div>
      <div class="db-content">
        <div class="db-hdr">
          <div>
            <div class="db-htitle">Agent Control Center</div>
            <div class="db-hsub">Sun, Mar 22 · 14:32 UTC</div>
          </div>
          <div class="badge-green">● 12 active</div>
        </div>
        <div class="metrics">
          <div class="met"><div class="met-v c-green">12</div><div class="met-l">Active Runs</div><div class="met-d c-green">↑ +3</div></div>
          <div class="met"><div class="met-v c-blue">47</div><div class="met-l">Queued</div><div class="met-d c-blue">↑ +12</div></div>
          <div class="met"><div class="met-v c-red">2</div><div class="met-l">Failed 24h</div><div class="met-d c-green">↓ −5</div></div>
          <div class="met"><div class="met-v c-blue">1.4s</div><div class="met-l">Avg Latency</div><div class="met-d c-green">↓ −0.2s</div></div>
        </div>
        <div class="slabel">Agent Fleet</div>
        <div class="agents">
          <div class="ag">
            <div><div class="ag-name"><span class="sdot s-run"></span>Analyst-01</div><div class="ag-task">Summarize Q1 reports · 2m 14s</div></div>
            <div class="pbar"><div class="pfill" style="width:72%;background:var(--accent)"></div></div>
            <div class="pct c-blue">72%</div>
          </div>
          <div class="ag">
            <div><div class="ag-name"><span class="sdot s-run"></span>Scraper-07</div><div class="ag-task">Web extraction · 5m 02s</div></div>
            <div class="pbar"><div class="pfill" style="width:48%;background:var(--accent)"></div></div>
            <div class="pct c-blue">48%</div>
          </div>
          <div class="ag">
            <div><div class="ag-name"><span class="sdot s-err"></span>Classifier-02</div><div class="ag-task">Token limit exceeded</div></div>
            <div class="pbar"><div class="pfill" style="width:8%;background:var(--danger)"></div></div>
            <div class="pct c-red">Err</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="features">
  <div class="sec-badge">Platform</div>
  <h2 class="sec-title">Everything your team needs<br>to ship with agents</h2>
  <p class="sec-sub">From rapid prototyping to production monitoring — Nexus handles the infrastructure.</p>
  <div class="feat-grid">
    <div class="feat"><div class="feat-ico">⬡</div><div class="feat-t">Fleet Management</div><div class="feat-d">Deploy, configure, and monitor dozens of agents from one control plane. Resource limits, retry policies, health checks.</div></div>
    <div class="feat"><div class="feat-ico">◈</div><div class="feat-t">Execution Trace Viewer</div><div class="feat-d">Step-by-step replay of every run. LLM calls, tool invocations, token counts, and latency to the millisecond.</div></div>
    <div class="feat"><div class="feat-ico">⌘</div><div class="feat-t">MCP Integration Hub</div><div class="feat-d">200+ tools via Model Context Protocol. Filesystem, databases, Slack, GitHub — per-agent permissions built in.</div></div>
    <div class="feat"><div class="feat-ico">◆</div><div class="feat-t">Auto Evaluations</div><div class="feat-d">Faithfulness, relevance, and completeness scores on every output. Catch regressions before production.</div></div>
    <div class="feat"><div class="feat-ico">◫</div><div class="feat-t">Cost & Token Tracking</div><div class="feat-d">Per-agent, per-run, per-team cost breakdowns. Budget alerts and model comparison reports.</div></div>
    <div class="feat"><div class="feat-ico">⊛</div><div class="feat-t">Teams & Permissions</div><div class="feat-d">RBAC across agents, MCP connections, and outputs. SSO, audit logs, SOC 2 compliance.</div></div>
  </div>
</section>

<div class="divider"></div>

<section class="mcp-sect" id="mcp">
  <div class="mcp-in">
    <div>
      <div class="sec-badge">MCP Integrations</div>
      <h2 class="sec-title">Connect everything<br>your agents need</h2>
      <p class="sec-sub">200+ Model Context Protocol integrations. Deploy in seconds, manage permissions per agent, monitor usage in real time.</p>
      <div class="pills">
        <div class="pill"><span class="pdot"></span>filesystem</div>
        <div class="pill"><span class="pdot"></span>web-search</div>
        <div class="pill"><span class="pdot"></span>github</div>
        <div class="pill"><span class="pdot"></span>postgres</div>
        <div class="pill"><span class="pdot"></span>slack</div>
        <div class="pill"><span class="pdot"></span>notion</div>
        <div class="pill"><span class="pdot"></span>stripe</div>
        <div class="pill"><span class="pdot" style="background:rgba(232,234,240,0.25)"></span>+193 more →</div>
      </div>
    </div>
    <div id="trace">
      <div style="margin-bottom:10px;font-size:11px;color:var(--muted);font-family:monospace">run-892 · Analyst-01 · Execution Trace</div>
      <div class="trace">
        <div class="trow"><div class="tico">✓</div><div><div><span class="tname">Init</span></div><div class="tdetail">Loaded context + 3 tools</div></div><div class="ttime" style="color:var(--accent2)">0.04s</div></div>
        <div class="trow"><div class="tico">✓</div><div><div><span class="tname">Retrieve</span></div><div class="tdetail">Fetched 12 document chunks</div></div><div class="ttime" style="color:var(--accent2)">0.31s</div></div>
        <div class="trow"><div class="tico">✓</div><div><div><span class="tname">Reason</span></div><div class="tdetail">LLM call · 8,342 tok</div></div><div class="ttime" style="color:var(--accent2)">52.4s</div></div>
        <div class="trow"><div class="tico">✓</div><div><div><span class="tname">Tool Use</span></div><div class="tdetail">calc_summary × 3</div></div><div class="ttime" style="color:var(--accent2)">14.2s</div></div>
        <div class="trow"><div class="tico">✓</div><div><div><span class="tname">Final LLM</span></div><div class="tdetail">4,098 tok · output ready</div></div><div class="ttime" style="color:var(--accent2)">41.8s</div></div>
        <div class="trow"><div class="tico">→</div><div><div><span class="tname" style="color:var(--accent2)">Output</span></div><div class="tdetail">Saved to /outputs/run-892</div></div><div class="ttime" style="color:var(--accent2)">0.02s</div></div>
      </div>
      <div class="evals">
        <div class="eval"><div class="eval-v c-green">0.94</div><div class="eval-l">Faithfulness</div></div>
        <div class="eval"><div class="eval-v c-green">0.98</div><div class="eval-l">Relevance</div></div>
        <div class="eval"><div class="eval-v c-blue">0.87</div><div class="eval-l">Completeness</div></div>
      </div>
    </div>
  </div>
</section>

<section class="cta-sec">
  <div class="cta-glow"></div>
  <h2 class="cta-title">Ready to command<br>your agents?</h2>
  <p class="cta-sub">Join 500+ engineering teams running AI at scale with Nexus.</p>
  <div class="cta-btns">
    <a href="nexus-viewer" class="btn btn-primary btn-lg">View design prototype →</a>
    <a href="nexus-mock" class="btn btn-ghost btn-lg">Interactive mock ☀◑</a>
  </div>
</section>

<footer>
  <div class="foot-brand"><div class="nav-logo">⬡</div>Nexus</div>
  <div class="foot-links"><a href="#">Docs</a><a href="#">Status</a><a href="#">Blog</a><a href="#">GitHub</a></div>
  <div class="foot-copy">Design by RAM · ram.zenbin.org</div>
</footer>

</body>
</html>`;

// Viewer
const penJson = fs.readFileSync('/workspace/group/design-studio/nexus.pen', 'utf8');
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nexus — Design Viewer</title>
<script>
window.VIEWER_READY = true;
</script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0B0F; color: #E8EAF0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
  header { padding: 16px 32px; border-bottom: 1px solid #1F2230; display: flex; align-items: center; justify-content: space-between; }
  .brand { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .logo { width: 22px; height: 22px; background: #4F6EF7; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; }
  a.back { font-size: 13px; color: rgba(232,234,240,0.5); text-decoration: none; }
  a.back:hover { color: #4F6EF7; }
  main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; gap: 24px; }
  .card { background: #12141A; border: 1px solid #1F2230; border-radius: 16px; padding: 36px; max-width: 720px; width: 100%; }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
  .sub { color: rgba(232,234,240,0.5); font-size: 14px; margin-bottom: 28px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
  .meta-cell { background: #1A1D27; border: 1px solid #1F2230; border-radius: 8px; padding: 12px; }
  .mk { font-size: 10px; color: rgba(232,234,240,0.4); text-transform: uppercase; letter-spacing: 0.08em; }
  .mv { font-size: 14px; font-weight: 500; margin-top: 4px; }
  pre { background: #1A1D27; border: 1px solid #1F2230; border-radius: 10px; padding: 18px; font-size: 11.5px; overflow: auto; max-height: 320px; color: #00D4AA; font-family: 'SF Mono', 'Fira Code', monospace; line-height: 1.5; }
  .links { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
  .link-btn { padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; border: 1px solid #1F2230; color: rgba(232,234,240,0.6); background: #1A1D27; }
  .link-btn.primary { background: #4F6EF7; border-color: transparent; color: white; }
</style>
</head>
<body>
<header>
  <div class="brand"><div class="logo">⬡</div>Nexus · Design Viewer</div>
  <a href="nexus" class="back">← Back to hero</a>
</header>
<main>
  <div class="card">
    <h1>Nexus.pen — Design Specification</h1>
    <p class="sub">Command your agents · 5 screens · Dark theme · v2.8</p>
    <div class="meta-grid">
      <div class="meta-cell"><div class="mk">Version</div><div class="mv">Pencil v2.8</div></div>
      <div class="meta-cell"><div class="mk">Theme</div><div class="mv">Dark</div></div>
      <div class="meta-cell"><div class="mk">Screens</div><div class="mv">Dashboard · Fleet · Run Log · Agent · MCPs</div></div>
      <div class="meta-cell"><div class="mk">Accent</div><div class="mv" style="color:#4F6EF7">#4F6EF7 Electric Blue + #00D4AA Teal</div></div>
    </div>
    <pre id="out">Loading design specification...</pre>
    <div class="links">
      <a href="nexus" class="link-btn">← Hero page</a>
      <a href="nexus-mock" class="link-btn primary">Interactive mock ☀◑ →</a>
    </div>
  </div>
</main>
<script>
const pen = window.EMBEDDED_PEN;
if (pen) {
  try {
    const p = JSON.parse(pen);
    document.getElementById('out').textContent = JSON.stringify({ meta: p.meta, screens: p.screens.map(s => ({ id: s.id, label: s.label, elements: s.elements.length })), nav: p.nav }, null, 2);
  } catch(e) {
    document.getElementById('out').textContent = 'Parse error: ' + e.message;
  }
} else {
  document.getElementById('out').textContent = '// No embedded pen found\\n// Visit nexus-mock for the interactive mock';
}
</script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing Nexus...\n');

  const heroRes = await publishToZenbin(SLUG, `${APP_NAME} — ${TAGLINE} · RAM Design Studio`, heroHtml);
  console.log(`Hero:   ${heroRes.status === 201 || heroRes.status === 200 ? '✓' : '✗ ' + heroRes.body.slice(0,80)} → ram.zenbin.org/${SLUG}`);

  const viewerRes = await publishToZenbin(`${SLUG}-viewer`, `${APP_NAME} — Design Viewer · RAM`, viewerHtml);
  console.log(`Viewer: ${viewerRes.status === 201 || viewerRes.status === 200 ? '✓' : '✗ ' + viewerRes.body.slice(0,80)} → ram.zenbin.org/${SLUG}-viewer`);

  console.log('\nDone ✓');
}

main().catch(console.error);
