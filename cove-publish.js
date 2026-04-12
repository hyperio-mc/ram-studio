/**
 * COVE — Publish: hero page + viewer + gallery queue + design DB
 */
const fs   = require('fs');
const http  = require('http');
const https = require('https');
const path  = require('path');

const SLUG     = 'cove';
const APP_NAME = 'COVE';
const TAGLINE  = 'Private team documentation hub';
const ARCHETYPE = 'productivity-tools';
const PROMPT   = 'Inspired by "Chus Retro OS Portfolio" (minimal.gallery) — retro OS windowed panels trending as an aesthetic for dev/design tools — combined with Evervault dark tech UI (Godly). Dark theme: deep navy #040810, cyan #00D4FF, violet #9B59FF, monospace typography, OS-style window chrome with traffic lights.';

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
<title>COVE — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#040810;
  --surface:#0A1220;
  --surface2:#0F1A2E;
  --surface3:#141F38;
  --border:#1A2844;
  --border-hi:#243556;
  --text:#E8EEF8;
  --text-sub:#7A94C4;
  --text-muted:#3D5480;
  --cyan:#00D4FF;
  --cyan-dim:#005F7A;
  --cyan-bg:rgba(0,212,255,0.08);
  --violet:#9B59FF;
  --violet-bg:rgba(155,89,255,0.10);
  --green:#2DEB8A;
  --green-bg:rgba(45,235,138,0.09);
  --amber:#F5B731;
  --red:#FF4F6A;
}
html,body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

/* Scan line overlay */
body::before{
  content:'';position:fixed;inset:0;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,0.012) 2px,rgba(0,212,255,0.012) 4px);
  pointer-events:none;z-index:0;
}

.nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:60px;
  background:rgba(4,8,16,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-logo{font-size:18px;font-weight:900;letter-spacing:-.01em;color:var(--text);display:flex;align-items:center;gap:10px}
.nav-logo span{color:var(--cyan)}
.nav-dot{width:8px;height:8px;border-radius:50%;background:var(--cyan);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(0.8)}}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{font-size:13px;font-weight:500;color:var(--text-sub);text-decoration:none;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{font-size:12px;font-weight:700;padding:9px 24px;background:var(--cyan);color:var(--bg);border-radius:24px;text-decoration:none;letter-spacing:.03em;transition:all .2s}
.nav-cta:hover{background:#1ee0ff;box-shadow:0 0 24px rgba(0,212,255,.4)}

.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 24px 80px;text-align:center;position:relative;z-index:1}

/* Grid background */
.hero::before{
  content:'';position:absolute;inset:0;
  background-image:
    linear-gradient(var(--border) 1px,transparent 1px),
    linear-gradient(90deg,var(--border) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse 80% 80% at 50% 40%,black,transparent);
  opacity:.6;
}

.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 18px;background:var(--cyan-bg);border:1px solid rgba(0,212,255,.25);border-radius:24px;font-size:11px;font-weight:700;color:var(--cyan);letter-spacing:.1em;margin-bottom:40px;position:relative}
.hero-h1{font-size:clamp(52px,10vw,96px);font-weight:900;letter-spacing:-.04em;line-height:.96;margin-bottom:28px;position:relative}
.hero-h1 .accent{color:var(--cyan);text-shadow:0 0 60px rgba(0,212,255,.4)}
.hero-sub{font-size:clamp(16px,2vw,19px);color:var(--text-sub);max-width:520px;line-height:1.65;margin-bottom:44px;font-weight:400;position:relative}
.hero-actions{display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:center;position:relative;margin-bottom:70px}
.btn-primary{font-size:14px;font-weight:700;padding:15px 40px;background:var(--cyan);color:var(--bg);border-radius:32px;text-decoration:none;transition:all .2s;letter-spacing:.01em}
.btn-primary:hover{background:#1ee0ff;box-shadow:0 8px 40px rgba(0,212,255,.4);transform:translateY(-2px)}
.btn-ghost{font-size:14px;font-weight:500;padding:15px 32px;background:transparent;color:var(--text);border:1.5px solid var(--border-hi);border-radius:32px;text-decoration:none;transition:all .2s}
.btn-ghost:hover{border-color:var(--cyan);color:var(--cyan)}

/* OS window mockup */
.window-mock{
  width:100%;max-width:860px;border-radius:16px;overflow:hidden;
  border:1px solid var(--border-hi);position:relative;
  box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 1px rgba(0,212,255,.05),0 0 60px rgba(0,212,255,.08);
}
.window-bar{background:var(--surface2);padding:14px 20px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border)}
.traffic-light{width:12px;height:12px;border-radius:50%}
.tl-red{background:#FF4F6A}.tl-amb{background:#F5B731}.tl-grn{background:#2DEB8A}
.window-title{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-sub);margin-left:12px;flex:1}
.window-body{background:var(--surface);padding:32px}

.screen-preview{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:0 auto}
.screen-card{background:var(--surface2);border-radius:12px;padding:16px;border:1px solid var(--border);transition:all .3s;cursor:default}
.screen-card:hover{border-color:var(--cyan);transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,212,255,.12)}
.screen-card-title{font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:1px;margin-bottom:12px;font-family:'JetBrains Mono',monospace}
.screen-line{height:8px;border-radius:4px;background:var(--surface3);margin-bottom:7px}
.screen-line.hi{background:var(--cyan);opacity:.7}
.screen-line.vi{background:var(--violet);opacity:.6}
.screen-line.gr{background:var(--green);opacity:.6}

/* Features */
.features{max-width:1100px;margin:0 auto;padding:80px 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;position:relative;z-index:1}
.feat{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;transition:all .3s}
.feat:hover{border-color:var(--border-hi);transform:translateY(-2px)}
.feat-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:18px;line-height:1}
.feat h3{font-size:16px;font-weight:700;margin-bottom:8px}
.feat p{font-size:13px;color:var(--text-sub);line-height:1.6}

/* Stats */
.stats{max-width:900px;margin:0 auto 80px;padding:0 24px;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border-radius:20px;overflow:hidden;position:relative;z-index:1}
.stat{background:var(--surface);padding:32px 24px;text-align:center}
.stat-val{font-size:36px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--cyan);line-height:1;margin-bottom:8px}
.stat-label{font-size:12px;color:var(--text-sub);font-weight:500;letter-spacing:.04em}

/* CTA */
.cta-section{max-width:700px;margin:0 auto 100px;padding:60px 40px;text-align:center;background:var(--surface);border:1px solid var(--border-hi);border-radius:24px;position:relative;z-index:1}
.cta-section h2{font-size:36px;font-weight:800;margin-bottom:16px}
.cta-section p{font-size:15px;color:var(--text-sub);line-height:1.65;margin-bottom:32px}

footer{text-align:center;padding:32px;color:var(--text-muted);font-size:12px;font-family:'JetBrains Mono',monospace;border-top:1px solid var(--border);position:relative;z-index:1}

@media(max-width:640px){.stats{grid-template-columns:repeat(2,1fr)}.screen-preview{grid-template-columns:1fr 1fr}.nav-links,.nav-cta{display:none}}
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-logo"><div class="nav-dot"></div>CO<span>VE</span></div>
  <ul class="nav-links">
    <li><a href="#">Docs</a></li>
    <li><a href="#">Team</a></li>
    <li><a href="#">Pricing</a></li>
  </ul>
  <a href="#" class="nav-cta">Get Started</a>
</nav>

<section class="hero">
  <div class="hero-badge">✦ YOUR TEAM'S SECOND BRAIN</div>
  <h1 class="hero-h1">Where teams<br>find <span class="accent">clarity</span></h1>
  <p class="hero-sub">COVE brings all your team docs, decisions, and knowledge into a single, searchable, beautifully organised workspace. No more digging through Slack threads.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View Design →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>

  <div class="window-mock">
    <div class="window-bar">
      <div class="traffic-light tl-red"></div>
      <div class="traffic-light tl-amb"></div>
      <div class="traffic-light tl-grn"></div>
      <div class="window-title">COVE WORKSPACE.md · 3 teammates online</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--cyan);background:var(--cyan-bg);padding:4px 10px;border-radius:6px">● LIVE</div>
    </div>
    <div class="window-body">
      <div class="screen-preview">
        <div class="screen-card">
          <div class="screen-card-title">HOME · WORKSPACE</div>
          <div class="screen-line hi" style="width:60%"></div>
          <div class="screen-line" style="width:90%"></div>
          <div class="screen-line" style="width:75%"></div>
          <div class="screen-line" style="width:50%"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">
            <div style="height:32px;border-radius:8px;background:var(--surface3);border:1px solid var(--border)"></div>
            <div style="height:32px;border-radius:8px;background:var(--surface3);border:1px solid var(--border)"></div>
          </div>
        </div>
        <div class="screen-card">
          <div class="screen-card-title">DOCS · SPACES</div>
          <div class="screen-line vi" style="width:55%"></div>
          <div class="screen-line" style="width:80%"></div>
          <div class="screen-line" style="width:65%"></div>
          <div class="screen-line" style="width:90%"></div>
          <div class="screen-line" style="width:45%"></div>
        </div>
        <div class="screen-card">
          <div class="screen-card-title">DOCUMENT VIEWER</div>
          <div class="screen-line hi" style="width:80%"></div>
          <div style="height:28px;border-radius:6px;background:var(--cyan-bg);border:1px solid rgba(0,212,255,.2);margin:8px 0"></div>
          <div class="screen-line" style="width:90%"></div>
          <div class="screen-line" style="width:70%"></div>
          <div class="screen-line gr" style="width:60%"></div>
        </div>
        <div class="screen-card">
          <div class="screen-card-title">SEARCH · CMD+K</div>
          <div style="height:28px;border-radius:8px;background:var(--surface3);border:1px solid var(--cyan);margin-bottom:10px"></div>
          <div class="screen-line" style="width:75%"></div>
          <div class="screen-line" style="width:90%"></div>
          <div class="screen-line" style="width:60%"></div>
        </div>
        <div class="screen-card" style="grid-column:span 2">
          <div class="screen-card-title">TEAM · 8 MEMBERS · 3 ONLINE</div>
          <div style="display:flex;gap:8px;margin-bottom:10px">
            <div style="width:60px;height:24px;border-radius:6px;background:var(--green-bg);border:1px solid rgba(45,235,138,.2)"></div>
            <div style="width:60px;height:24px;border-radius:6px;background:var(--violet-bg);border:1px solid rgba(155,89,255,.2)"></div>
            <div style="width:60px;height:24px;border-radius:6px;background:var(--cyan-bg);border:1px solid rgba(0,212,255,.2)"></div>
          </div>
          <div class="screen-line" style="width:90%"></div>
          <div class="screen-line" style="width:70%"></div>
          <div class="screen-line" style="width:80%"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="stats">
  <div class="stat"><div class="stat-val">5s</div><div class="stat-label">TO FIND ANY DOC</div></div>
  <div class="stat"><div class="stat-val">∞</div><div class="stat-label">VERSION HISTORY</div></div>
  <div class="stat"><div class="stat-val">24/7</div><div class="stat-label">ALWAYS ONLINE</div></div>
  <div class="stat"><div class="stat-val">0</div><div class="stat-label">LOST DECISIONS</div></div>
</div>

<section class="features">
  <div class="feat">
    <div class="feat-icon" style="background:var(--cyan-bg)">⊞</div>
    <h3>Spaces, not folders</h3>
    <p>Organise docs into team spaces that mirror how your team actually works — not how a file system thinks you work.</p>
  </div>
  <div class="feat">
    <div class="feat-icon" style="background:var(--violet-bg)">⌘</div>
    <h3>CMD+K everything</h3>
    <p>Full-text search across every doc, comment, and version. Find that decision you made six months ago in under 5 seconds.</p>
  </div>
  <div class="feat">
    <div class="feat-icon" style="background:var(--green-bg)">◷</div>
    <h3>Live collaboration</h3>
    <p>See who's editing what in real-time. Presence indicators and cursor tracking keep your team aligned without meetings.</p>
  </div>
  <div class="feat">
    <div class="feat-icon" style="background:rgba(245,183,49,0.09)">◈</div>
    <h3>Rich doc blocks</h3>
    <p>Code blocks, callouts, inline data tables, decision records. Write docs that actually help people understand context.</p>
  </div>
  <div class="feat">
    <div class="feat-icon" style="background:var(--cyan-bg)">◫</div>
    <h3>Version timeline</h3>
    <p>Every save is a snapshot. Browse the full history of any document, see who changed what, and restore in one click.</p>
  </div>
  <div class="feat">
    <div class="feat-icon" style="background:var(--violet-bg)">↑</div>
    <h3>Import anywhere</h3>
    <p>Bring in Notion exports, Confluence pages, Google Docs, or plain Markdown. COVE cleans it up automatically.</p>
  </div>
</section>

<div class="cta-section">
  <h2>One place for everything<br>your team knows</h2>
  <p>Stop searching Slack. Stop asking "where's that doc?" COVE gives your knowledge a permanent home — dark, fast, and distraction-free.</p>
  <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Explore Design</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">☀◑ Try Mock</a>
  </div>
</div>

<footer>
  COVE · Design by RAM · ram.zenbin.org/${SLUG} · ${new Date().toISOString().slice(0,10)}<br>
  <span style="color:var(--text-muted);opacity:.5">Inspired by "Chus Retro OS Portfolio" (minimal.gallery) + Evervault (Godly)</span>
</footer>
</body>
</html>`;

// ─── VIEWER PAGE ─────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('cove.pen', 'utf8');

const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>COVE — Prototype Viewer</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:#040810;font-family:Inter,sans-serif;color:#E8EEF8}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:56px;background:rgba(4,8,16,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(26,40,68,0.8)}
  .logo{font-size:16px;font-weight:900;letter-spacing:-.02em;color:#E8EEF8}
  .logo span{color:#00D4FF}
  .tagline{font-size:12px;color:rgba(122,148,196,0.7);letter-spacing:.04em;font-family:'JetBrains Mono',monospace}
  .hero-btn{font-size:12px;font-weight:600;padding:7px 16px;background:#00D4FF;color:#040810;border-radius:20px;text-decoration:none}
  .viewer{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 56px);padding:32px;background:#040810}
  #pencil-viewer{width:100%;max-width:1200px;height:72vh;border-radius:20px;border:1px solid #1A2844;background:#0A1220}
</style>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
<div class="nav">
  <span class="logo">CO<span>VE</span></span>
  <span class="tagline">TEAM DOCUMENTATION HUB</span>
  <a class="hero-btn" href="https://ram.zenbin.org/cove">← Hero page</a>
</div>
<div class="viewer">
  <div id="pencil-viewer">Loading prototype…</div>
</div>
<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>
<script src="https://unpkg.com/pencil-viewer@latest/dist/pencil-viewer.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded',()=>{
    if(window.PencilViewer && window.EMBEDDED_PEN) {
      PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN), theme: 'dark' });
    }
  });
</script>
</body>
</html>`;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing COVE...');

  // Hero
  const heroRes = await zenReq(SLUG, heroHTML);
  console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));

  // Viewer
  const viewerRes = await zenReq(`${SLUG}-viewer`, viewerHtml);
  console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));

  // Gallery queue
  const config = JSON.parse(fs.readFileSync('community-config.json', 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  function ghReq(opts, body) {
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

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
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
    theme: 'dark',
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
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));

  console.log('\n✓ Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('✓ Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
  console.log('✓ Entry:  ', JSON.stringify(newEntry, null, 2));
}

main().catch(console.error);
