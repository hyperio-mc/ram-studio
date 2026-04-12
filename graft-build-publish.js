#!/usr/bin/env node
// GRAFT — Build HTML, save locally, and publish to zenbin.org

const fs = require('fs');
const https = require('https');

const SLUG = 'graft';
const SUBDOMAIN = 'ram';
const penJson = fs.readFileSync('graft.pen', 'utf8');

// ─── HERO HTML ────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GRAFT — Branch, test & trace AI workflows</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#F4F2EF;--surface:#FFFFFF;--surface-alt:#ECEAE6;
    --text:#1C1A17;--muted:rgba(28,26,23,0.45);
    --accent:#1ACA8A;--accent2:#6B48FF;
    --border:rgba(28,26,23,0.09);--border-strong:rgba(28,26,23,0.18);
    --green:#059669;--orange:#D97706;--red:#DC2626;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;}
  a{text-decoration:none;color:inherit;}
  nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:56px;background:rgba(244,242,239,0.92);backdrop-filter:blur(14px);border-bottom:1px solid var(--border);}
  .nav-logo{font-size:15px;font-weight:800;letter-spacing:.1em;}
  .nav-logo span{color:var(--accent);}
  .nav-links{display:flex;gap:28px;}
  .nav-links a{font-size:13px;color:var(--muted);transition:color .2s;}
  .nav-links a:hover{color:var(--text);}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;border:none;}
  .btn-ghost{background:transparent;border:1px solid var(--border-strong);color:var(--text);}
  .btn-ghost:hover{background:var(--surface-alt);}
  .btn-accent{background:var(--accent);color:#fff;}
  .btn-accent:hover{opacity:.9;transform:translateY(-1px);}
  .btn-dark{background:var(--text);color:var(--bg);}
  .btn-dark:hover{opacity:.85;}

  /* HERO */
  .hero{max-width:1100px;margin:0 auto;padding:90px 40px 70px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
  .hero-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:100px;background:rgba(26,202,138,0.10);border:1px solid rgba(26,202,138,0.25);font-size:11px;font-weight:600;letter-spacing:.08em;color:var(--green);margin-bottom:24px;text-transform:uppercase;}
  .dot-pulse{width:6px;height:6px;border-radius:50%;background:var(--green);animation:dp 2s ease-in-out infinite;}
  @keyframes dp{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.45;transform:scale(1.3);}}
  h1{font-size:clamp(34px,3.8vw,52px);font-weight:800;letter-spacing:-.025em;line-height:1.09;margin-bottom:20px;}
  h1 em{font-style:normal;color:var(--accent);}
  .hero-sub{font-size:17px;color:var(--muted);line-height:1.65;max-width:460px;margin-bottom:36px;}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap;}
  .hero-trust{margin-top:28px;font-size:12px;color:var(--muted);display:flex;gap:18px;flex-wrap:wrap;}
  .hero-trust span{display:flex;align-items:center;gap:5px;}

  /* MOCKUP */
  .hero-mockup{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px;box-shadow:0 4px 40px rgba(28,26,23,0.07);overflow:hidden;}
  .mock-topbar{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:16px;}
  .mock-brand{font-size:12px;font-weight:800;letter-spacing:.1em;}
  .mock-brand span{color:var(--accent);}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:600;}
  .badge-green{background:rgba(5,150,105,0.10);color:var(--green);}
  .badge-orange{background:rgba(217,119,6,0.10);color:var(--orange);}
  .badge-purple{background:rgba(107,72,255,0.09);color:var(--accent2);}
  .mock-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}
  .mock-stat{background:var(--bg);border-radius:8px;padding:11px 12px;border:1px solid var(--border);}
  .mock-stat-lbl{font-size:9px;color:var(--muted);font-weight:600;letter-spacing:.05em;margin-bottom:3px;text-transform:uppercase;}
  .mock-stat-val{font-size:17px;font-weight:800;line-height:1.1;}
  .mock-stat-dlt{font-size:10px;margin-top:2px;}
  .mock-sec-lbl{font-size:9px;font-weight:700;letter-spacing:.08em;color:var(--muted);margin-bottom:10px;text-transform:uppercase;}
  .mock-branch{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:7px;background:var(--bg);border:1px solid var(--border);margin-bottom:7px;}
  .mock-branch.is-main{border-color:rgba(26,202,138,0.30);}
  .branch-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
  .mock-branch-info{flex:1;min-width:0;}
  .mock-branch-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .mock-branch-sub{font-size:10px;color:var(--muted);}
  .mock-branch-rate{font-size:11px;font-weight:700;white-space:nowrap;}

  /* METRICS */
  .metrics-band{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:32px 0;}
  .metrics-inner{max-width:1100px;margin:0 auto;padding:0 40px;display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:24px;}
  .metric{text-align:center;}
  .metric-val{font-size:36px;font-weight:800;letter-spacing:-.02em;line-height:1;}
  .metric-val.g{color:var(--green);}
  .metric-val.p{color:var(--accent2);}
  .metric-val.a{color:var(--accent);}
  .metric-lbl{font-size:12px;color:var(--muted);margin-top:4px;}

  /* FEATURES */
  .features{max-width:1100px;margin:0 auto;padding:80px 40px;}
  .sec-eyebrow{font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--muted);text-transform:uppercase;margin-bottom:10px;}
  .sec-title{font-size:clamp(24px,2.6vw,34px);font-weight:800;letter-spacing:-.02em;margin-bottom:52px;max-width:480px;}
  .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
  .feat{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:26px;transition:transform .2s,box-shadow .2s;}
  .feat:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(28,26,23,0.07);}
  .feat-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;margin-bottom:14px;}
  .feat-icon.g{background:rgba(26,202,138,0.12);}
  .feat-icon.p{background:rgba(107,72,255,0.10);}
  .feat-icon.o{background:rgba(217,119,6,0.10);}
  .feat-title{font-size:14px;font-weight:700;margin-bottom:7px;}
  .feat-desc{font-size:13px;color:var(--muted);line-height:1.6;}

  /* WATERFALL */
  .wf-section{max-width:1100px;margin:0 auto;padding:0 40px 80px;}
  .wf-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px;}
  .wf-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);}
  .wf-run-id{font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace;}
  .wf-meta{font-size:12px;color:var(--muted);}
  .wf-step{display:flex;align-items:center;gap:12px;margin-bottom:9px;}
  .wf-lbl{font-size:12px;color:var(--muted);width:175px;flex-shrink:0;}
  .wf-lbl.bold{color:var(--text);font-weight:600;}
  .wf-track{flex:1;height:22px;background:var(--bg);border-radius:4px;position:relative;overflow:visible;}
  .wf-bar{height:100%;border-radius:4px;position:absolute;top:0;display:flex;align-items:center;padding:0 7px;}
  .wf-bar-lbl{font-size:9px;font-weight:700;color:#fff;white-space:nowrap;}
  .wf-dur{font-size:11px;color:var(--muted);width:48px;text-align:right;flex-shrink:0;}

  /* CTA */
  .cta-section{background:var(--text);padding:80px 40px;text-align:center;}
  .cta-section .sec-eyebrow{color:rgba(244,242,239,0.45);}
  .cta-section .sec-title{color:#F4F2EF;max-width:520px;margin:0 auto 36px;}
  .cta-section .sec-title em{font-style:normal;color:var(--accent);}
  .cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}

  footer{border-top:1px solid var(--border);padding:24px 40px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--muted);background:var(--bg);}
  footer a{color:var(--muted);transition:color .2s;}
  footer a:hover{color:var(--text);}

  @media(max-width:800px){
    .hero{grid-template-columns:1fr;padding:60px 24px 40px;}
    .features-grid{grid-template-columns:1fr;}
    nav{padding:0 20px;}
    .nav-links{display:none;}
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">GRAFT<span>.</span></div>
  <div class="nav-links">
    <a href="#">Features</a><a href="#">Docs</a><a href="#">Pricing</a><a href="#">Changelog</a>
  </div>
  <div style="display:flex;gap:10px">
    <a href="#" class="btn btn-ghost">Sign In</a>
    <a href="https://ram.zenbin.org/graft-mock" class="btn btn-accent">Try Interactive →</a>
  </div>
</nav>

<section class="hero">
  <div>
    <div class="hero-eyebrow"><div class="dot-pulse"></div> AI-era workflow tracing</div>
    <h1>Branch, test &<br><em>trace</em> every<br>agent run.</h1>
    <p class="hero-sub">
      Graft gives your AI workflows the developer tools they deserve.
      Branch prompts like code, compare outputs side-by-side, and trace
      every token from retrieval to response.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/graft-mock" class="btn btn-accent">Interactive Mock →</a>
      <a href="https://ram.zenbin.org/graft-viewer" class="btn btn-ghost">View Prototype</a>
    </div>
    <div class="hero-trust">
      <span>✦ Inspired by Neon.com branching</span>
      <span>✦ Editorial light theme</span>
    </div>
  </div>

  <div class="hero-mockup">
    <div class="mock-topbar">
      <span class="mock-brand">GRAFT<span>.</span></span>
      <span style="font-size:11px;color:var(--muted)">Overview</span>
      <span class="badge badge-green">● LIVE</span>
    </div>
    <div class="mock-stats">
      <div class="mock-stat">
        <div class="mock-stat-lbl">RUNS</div>
        <div class="mock-stat-val">2,841</div>
        <div class="mock-stat-dlt" style="color:var(--green)">↑ 18%</div>
      </div>
      <div class="mock-stat">
        <div class="mock-stat-lbl">SUCCESS</div>
        <div class="mock-stat-val">97.3%</div>
        <div class="mock-stat-dlt" style="color:var(--green)">+0.8%</div>
      </div>
      <div class="mock-stat">
        <div class="mock-stat-lbl">LATENCY</div>
        <div class="mock-stat-val">1.4s</div>
        <div class="mock-stat-dlt" style="color:var(--green)">−0.2s</div>
      </div>
      <div class="mock-stat">
        <div class="mock-stat-lbl">COST/WK</div>
        <div class="mock-stat-val">$24.80</div>
        <div class="mock-stat-dlt" style="color:var(--orange)">+$3.10</div>
      </div>
    </div>

    <div class="mock-sec-lbl">Active Branches</div>

    <div class="mock-branch is-main">
      <div class="branch-dot" style="background:#1ACA8A"></div>
      <div class="mock-branch-info">
        <div class="mock-branch-name">main</div>
        <div class="mock-branch-sub">GPT-4o — Production</div>
      </div>
      <div>
        <div class="mock-branch-rate" style="color:var(--green)">98.2%</div>
        <div style="font-size:10px;color:var(--muted)">2 min ago</div>
      </div>
    </div>

    <div class="mock-branch">
      <div class="branch-dot" style="background:#6B48FF"></div>
      <div class="mock-branch-info">
        <div class="mock-branch-name">exp/chain-of-thought</div>
        <div class="mock-branch-sub">GPT-4o — Testing CoT</div>
      </div>
      <div>
        <div class="mock-branch-rate" style="color:var(--accent2)">96.8%</div>
        <div style="font-size:10px;color:var(--muted)">14 min ago</div>
      </div>
    </div>

    <div class="mock-branch">
      <div class="branch-dot" style="background:#D97706"></div>
      <div class="mock-branch-info">
        <div class="mock-branch-name">exp/gemini-flash</div>
        <div class="mock-branch-sub">Gemini Flash — Benchmarking</div>
      </div>
      <div>
        <div class="mock-branch-rate" style="color:var(--orange)">95.1%</div>
        <div style="font-size:10px;color:var(--muted)">1 hr ago</div>
      </div>
    </div>
  </div>
</section>

<div class="metrics-band">
  <div class="metrics-inner">
    <div class="metric"><div class="metric-val g">97.3%</div><div class="metric-lbl">Average success rate</div></div>
    <div class="metric"><div class="metric-val a">1.4s</div><div class="metric-lbl">Median run latency</div></div>
    <div class="metric"><div class="metric-val g">18.6M</div><div class="metric-lbl">Tokens traced / week</div></div>
    <div class="metric"><div class="metric-val p">4</div><div class="metric-lbl">Live branches compared</div></div>
    <div class="metric"><div class="metric-val">$0.009</div><div class="metric-lbl">Avg cost per run</div></div>
  </div>
</div>

<section class="features">
  <div class="sec-eyebrow">Why Graft?</div>
  <h2 class="sec-title">Built for the AI engineering era.</h2>
  <div class="features-grid">
    <div class="feat"><div class="feat-icon g">🌿</div><div class="feat-title">Workflow Branching</div><div class="feat-desc">Branch any prompt or agent config. Run experiments in parallel without disrupting production. Merge when you're confident.</div></div>
    <div class="feat"><div class="feat-icon p">⚡</div><div class="feat-title">Waterfall Tracing</div><div class="feat-desc">See every millisecond — retrieval, assembly, inference, storage. Pin down the bottleneck and fix it fast.</div></div>
    <div class="feat"><div class="feat-icon o">⚖️</div><div class="feat-title">A/B Branch Compare</div><div class="feat-desc">Compare two branches across accuracy, latency, tokens, and cost. Get a clear verdict before promoting to production.</div></div>
    <div class="feat"><div class="feat-icon g">📊</div><div class="feat-title">Cost Analytics</div><div class="feat-desc">Track spend by model, branch, and day. Actionable tips — like switching to Gemini Flash for 3× savings at −2.7% accuracy.</div></div>
    <div class="feat"><div class="feat-icon p">🔍</div><div class="feat-title">LLM Eval Scoring</div><div class="feat-desc">GPT-4o as judge across your branches. Compare coherence, brevity, and accuracy in a clean benchmark table.</div></div>
    <div class="feat"><div class="feat-icon o">🔔</div><div class="feat-title">Budget Alerts</div><div class="feat-desc">Set monthly budgets per branch or globally. Never be surprised by a runaway experiment or a big invoice.</div></div>
  </div>
</section>

<section class="wf-section">
  <div class="sec-eyebrow">Execution Waterfall</div>
  <h2 class="sec-title">Every step. Every millisecond.</h2>
  <div class="wf-card">
    <div class="wf-header">
      <div class="wf-run-id">RUN-9041</div>
      <span class="badge badge-green">success</span>
      <div class="wf-meta">main · GPT-4o · 1,184ms · 1,420 tokens · $0.011</div>
    </div>
    <div class="wf-step"><div class="wf-lbl">Input validation</div><div class="wf-track"><div class="wf-bar" style="left:0%;width:1.1%;background:#6B48FF;opacity:.75"></div></div><div class="wf-dur">12ms</div></div>
    <div class="wf-step"><div class="wf-lbl">Context retrieval</div><div class="wf-track"><div class="wf-bar" style="left:1.1%;width:10%;background:#1ACA8A;opacity:.75"></div></div><div class="wf-dur">118ms</div></div>
    <div class="wf-step"><div class="wf-lbl">Prompt assembly</div><div class="wf-track"><div class="wf-bar" style="left:11.1%;width:1.9%;background:#6B48FF;opacity:.75"></div></div><div class="wf-dur">22ms</div></div>
    <div class="wf-step"><div class="wf-lbl bold">LLM inference</div><div class="wf-track"><div class="wf-bar" style="left:13%;width:75.3%;background:#059669"><span class="wf-bar-lbl">GPT-4o — 891ms</span></div></div><div class="wf-dur">891ms</div></div>
    <div class="wf-step"><div class="wf-lbl">Output parsing</div><div class="wf-track"><div class="wf-bar" style="left:88.3%;width:2.6%;background:#6B48FF;opacity:.75"></div></div><div class="wf-dur">31ms</div></div>
    <div class="wf-step"><div class="wf-lbl">Result storage</div><div class="wf-track"><div class="wf-bar" style="left:90.9%;width:5.7%;background:#D97706;opacity:.75"></div></div><div class="wf-dur">68ms</div></div>
    <div class="wf-step"><div class="wf-lbl">Webhook dispatch</div><div class="wf-track"><div class="wf-bar" style="left:96.6%;width:3.4%;background:#1ACA8A;opacity:.75"></div></div><div class="wf-dur">42ms</div></div>
  </div>
</section>

<section class="cta-section">
  <div class="sec-eyebrow">Get Started</div>
  <h2 class="sec-title">Ready to <em>branch</em> your AI workflows?</h2>
  <div class="cta-btns">
    <a href="https://ram.zenbin.org/graft-mock" class="btn btn-accent" style="font-size:15px;padding:13px 28px">Interactive Mock →</a>
    <a href="https://ram.zenbin.org/graft-viewer" class="btn" style="font-size:15px;padding:13px 28px;background:transparent;border:1px solid rgba(244,242,239,0.25);color:#F4F2EF">View .pen Prototype</a>
  </div>
</section>

<footer>
  <div>GRAFT — designed by RAM · April 2026</div>
  <div style="display:flex;gap:20px">
    <a href="https://ram.zenbin.org/graft-viewer">Pencil Viewer</a>
    <a href="https://ram.zenbin.org/graft-mock">Interactive Mock</a>
  </div>
</footer>
</body>
</html>`;

// ─── VIEWER HTML ─────────────────────────────────────────────────────────────
const penInjection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;

const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>GRAFT — Pencil.dev Prototype Viewer</title>
${penInjection}
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#F4F2EF;font-family:'Inter',system-ui,sans-serif;}
.viewer-header{background:#fff;border-bottom:1px solid rgba(28,26,23,0.09);padding:16px 28px;display:flex;align-items:center;justify-content:space-between;}
.viewer-brand{font-size:14px;font-weight:800;letter-spacing:.1em;}
.viewer-brand span{color:#1ACA8A;}
.viewer-links a{font-size:12px;color:rgba(28,26,23,0.55);text-decoration:none;margin-left:20px;transition:color .2s;}
.viewer-links a:hover{color:#1C1A17;}
#pencil-viewer{width:100%;height:calc(100vh - 57px);border:none;}
</style>
</head>
<body>
<div class="viewer-header">
  <div class="viewer-brand">GRAFT<span>.</span> — Pencil Prototype</div>
  <div class="viewer-links">
    <a href="https://ram.zenbin.org/graft">← Hero Page</a>
    <a href="https://ram.zenbin.org/graft-mock">Interactive Mock →</a>
  </div>
</div>
<iframe id="pencil-viewer" src="https://pencil.dev/embed/viewer" allow="fullscreen"></iframe>
<script>
const iframe = document.getElementById('pencil-viewer');
iframe.addEventListener('load', () => {
  if (window.EMBEDDED_PEN) {
    iframe.contentWindow.postMessage({ type: 'load-pen', data: window.EMBEDDED_PEN }, '*');
  }
});
</script>
</body>
</html>`;

// Save locally
fs.writeFileSync('graft-hero-built.html', heroHtml);
fs.writeFileSync('graft-viewer-built.html', viewerHtml);
console.log('✓ HTML files written');

// Publish
function post(pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'zenbin.org', path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

(async () => {
  console.log('Publishing hero…');
  const r1 = await post('/api/publish',
    { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG },
    { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN }
  );
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0, 150));

  console.log('Publishing viewer…');
  const r2 = await post('/api/publish',
    { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' },
    { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN }
  );
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0, 150));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
