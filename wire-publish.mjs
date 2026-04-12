// wire-publish.mjs — publish Wire to ram.zenbin.org
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ZENBIN_API = 'https://zenbin.org/v1/pages';
const SUBDOMAIN = 'ram';
const SLUG = 'wire';
const APP_NAME = 'Wire';
const TAGLINE = 'Wire your agents, automate your ops';

const penJson = fs.readFileSync(path.join(__dirname, 'wire.pen'), 'utf8');

async function publish(slug, html, title) {
  const res = await fetch(`${ZENBIN_API}/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Subdomain': SUBDOMAIN },
    body: JSON.stringify({ html, title })
  });
  const text = await res.text();
  console.log(`  ${slug}: ${res.status} — ${text.slice(0,100)}`);
  return res.status;
}

// ── Hero page ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wire — AI Workflow Orchestration</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#F7F4EE;--surface:#fff;--text:#1A1918;--text2:#6B6560;--accent:#00C97A;--accent2:#7B5CF6;--border:#E5E0D6}
  body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.5}
  nav{display:flex;align-items:center;justify-content:space-between;padding:18px 40px;border-bottom:1px solid var(--border);background:var(--surface)}
  .logo{font-size:20px;font-weight:900;letter-spacing:-0.5px}
  .logo em{font-style:normal;color:var(--accent)}
  nav a{text-decoration:none;color:var(--text2);font-size:13px;margin-left:20px}
  .cta{background:var(--text);color:var(--bg);padding:9px 20px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none}
  .hero{max-width:860px;margin:0 auto;padding:80px 40px 56px;text-align:center}
  .badge{display:inline-flex;align-items:center;gap:7px;background:#E6FAF1;color:#008F52;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:28px;letter-spacing:0.03em}
  .badge .pulse{width:7px;height:7px;border-radius:50%;background:var(--accent);animation:p 1.8s ease-in-out infinite}
  @keyframes p{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.8)}}
  h1{font-size:clamp(38px,7vw,68px);font-weight:900;letter-spacing:-2.5px;line-height:1.04;margin-bottom:24px}
  h1 em{font-style:normal;color:var(--accent)}
  .sub{font-size:17px;color:var(--text2);max-width:480px;margin:0 auto 40px;line-height:1.65}
  .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
  .btn-p{background:var(--text);color:var(--bg);padding:14px 28px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none}
  .btn-s{background:var(--surface);color:var(--text);border:1.5px solid var(--border);padding:13px 28px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none}
  .screens{display:flex;gap:14px;overflow-x:auto;padding:0 40px;max-width:1100px;margin:0 auto 80px;scrollbar-width:none}
  .screens::-webkit-scrollbar{display:none}
  .sc{flex:0 0 200px;background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:0 3px 20px rgba(0,0,0,0.07)}
  .sc-label{font-size:10px;font-weight:700;color:var(--text2);padding:8px 12px;border-bottom:1px solid var(--border);letter-spacing:0.07em}
  .sc-body{height:128px;background:var(--bg);padding:10px;display:flex;flex-direction:column;gap:5px}
  .mb{height:7px;border-radius:3px;background:var(--border)}
  .mb.a{background:var(--accent);width:38%}
  .mb.w60{width:60%}
  .mb.w80{width:78%}
  .mc{background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:6px;display:flex;gap:5px;align-items:center}
  .md{width:7px;height:7px;border-radius:50%}
  .md.g{background:var(--accent)}
  .md.r{background:#E5484D}
  .md.gr{background:#C0BAB0}
  .ml{flex:1;display:flex;flex-direction:column;gap:3px}
  .ml div{height:4px;border-radius:2px;background:var(--border)}
  .ml div.s{width:55%}
  .feats{max-width:860px;margin:0 auto 72px;padding:0 40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
  .feat{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:22px}
  .feat-i{font-size:22px;margin-bottom:10px}
  .feat h3{font-size:14px;font-weight:700;margin-bottom:5px}
  .feat p{font-size:12.5px;color:var(--text2);line-height:1.6}
  .pal{display:flex;gap:8px;justify-content:center;margin-bottom:72px}
  .sw{width:40px;height:40px;border-radius:7px;border:1px solid var(--border)}
  footer{border-top:1px solid var(--border);padding:22px 40px;text-align:center;font-size:12px;color:var(--text2)}
  .vbtn{display:inline-block;margin-top:10px;background:var(--accent);color:#000;padding:9px 20px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none}
</style>
</head>
<body>
<nav>
  <div class="logo">W<em>i</em>re</div>
  <div>
    <a href="wire-viewer">View Design</a>
    <a href="wire-mock" class="cta">Live Mock →</a>
  </div>
</nav>
<div class="hero">
  <div class="badge"><span class="pulse"></span>Design Exploration — April 2026</div>
  <h1>Wire your <em>agents</em>,<br>automate your ops</h1>
  <p class="sub">An AI workflow orchestration platform for engineering teams who run agents at scale.</p>
  <div class="btns">
    <a class="btn-p" href="wire-mock">Interactive Mock ☀◑</a>
    <a class="btn-s" href="wire-viewer">Pencil Viewer →</a>
  </div>
</div>
<div class="screens">
  ${['Flows','Agents','Run Log','Analytics','Config'].map(s => `
  <div class="sc">
    <div class="sc-label">${s.toUpperCase()}</div>
    <div class="sc-body">
      <div class="mb w80"></div><div class="mb w60"></div>
      <div class="mc"><div class="md g"></div><div class="ml"><div></div><div class="s"></div></div></div>
      <div class="mc"><div class="md gr"></div><div class="ml"><div></div><div class="s"></div></div></div>
      <div class="mc"><div class="md r"></div><div class="ml"><div></div><div class="s"></div></div></div>
    </div>
  </div>`).join('')}
</div>
<div class="feats">
  <div class="feat"><div class="feat-i">⚡</div><h3>Multi-agent Flows</h3><p>Chain Classifier → Router → Generator → QA agents into reliable pipelines with live status.</p></div>
  <div class="feat"><div class="feat-i">▶</div><h3>Live Run Log</h3><p>Terminal-style execution feed with per-agent output, latency, and inline diagnostics.</p></div>
  <div class="feat"><div class="feat-i">◉</div><h3>Analytics</h3><p>7-day run volume, success rates, and per-agent latency breakdowns.</p></div>
  <div class="feat"><div class="feat-i">◈</div><h3>Agent Roster</h3><p>Monitor uptime, queue depth, and model assignment across all agents.</p></div>
</div>
<div style="text-align:center;margin-bottom:40px">
  <p style="font-size:11px;font-weight:700;color:var(--text2);letter-spacing:0.08em;margin-bottom:14px">PALETTE</p>
  <div class="pal">
    <div class="sw" style="background:#F7F4EE" title="Warm Cream"></div>
    <div class="sw" style="background:#fff" title="Surface"></div>
    <div class="sw" style="background:#1A1918" title="Near-Black"></div>
    <div class="sw" style="background:#00C97A" title="Agent Green"></div>
    <div class="sw" style="background:#7B5CF6" title="Violet"></div>
    <div class="sw" style="background:#E5E0D6" title="Border"></div>
  </div>
</div>
<footer>
  <p>Wire — RAM Design Heartbeat · April 4, 2026</p>
  <p style="margin-top:4px">Inspired by Neon.com (agent-green, code-adjacent UX) + Midday.ai (editorial warmth)</p>
  <a class="vbtn" href="wire-mock">Open Interactive Mock →</a>
</footer>
</body>
</html>`;

// ── Viewer ────────────────────────────────────────────────────────────────────
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wire — Pencil Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#E8E4DA;font-family:system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column}
header{background:#fff;border-bottom:1px solid #E5E0D6;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
.logo{font-size:16px;font-weight:800;letter-spacing:-0.5px}
.logo em{font-style:normal;color:#00C97A}
header a{font-size:12px;color:#6B6560;text-decoration:none;font-weight:600}
.wrap{flex:1;padding:40px;display:flex;flex-wrap:wrap;gap:24px;justify-content:center;align-items:flex-start}
.sf{background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 6px 32px rgba(0,0,0,0.08)}
.sl{font-size:10px;font-weight:700;color:#6B6560;text-align:center;padding:7px;background:#F7F4EE;border-bottom:1px solid #E5E0D6;letter-spacing:0.07em}
.fb{width:390px;height:844px;background:#F7F4EE;padding:20px;display:flex;flex-direction:column;gap:8px;overflow:hidden}
.fbar{height:9px;border-radius:4px;background:#E5E0D6}
.fbar.a{background:#00C97A;width:42%}
.fcard{background:#fff;border:1px solid #E5E0D6;border-radius:8px;padding:14px;display:flex;flex-direction:column;gap:5px}
</style>
</head>
<body>
<header>
  <div class="logo">W<em>i</em>re</div>
  <a href="wire">← Back to hero</a>
</header>
<div class="wrap">
  ${['Flows','Agents','Run Log','Analytics','Config'].map(s=>`
  <div class="sf">
    <div class="sl">${s.toUpperCase()}</div>
    <div class="fb">
      <div class="fbar" style="width:72%"></div><div class="fbar" style="width:48%"></div>
      ${[0,1,2,3].map(()=>`<div class="fcard"><div class="fbar a"></div><div class="fbar" style="width:80%"></div><div class="fbar" style="width:60%"></div></div>`).join('')}
    </div>
  </div>`).join('')}
</div>
<script>
// Try to render embedded pen if viewer lib available
if(window.EMBEDDED_PEN && window.PencilViewer){
  try{PencilViewer.init(JSON.parse(window.EMBEDDED_PEN));}catch(e){console.warn(e);}
}
</script>
</body>
</html>`;

viewerHtml = injection + '\n' + viewerHtml;

console.log('Publishing Wire...');
await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
console.log('Done.');
