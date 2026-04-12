'use strict';
// cipher-publish.js — Full discovery pipeline for CIPHER

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SLUG    = 'cipher';
const APP     = 'CIPHER';
const TAGLINE = 'Know who sees your data.';
const ARCH    = 'security-ai';
const PROMPT  = 'Design a dark-mode AI privacy posture dashboard inspired by Evervault Customers page on godly.website — encrypted data flows, electric green on near-black, systematic grid layout.';

const P = {
  bg:       '#070B12',
  bg2:      '#0D1421',
  surface:  '#111A2C',
  border:   '#1E2D44',
  text:     '#E2EBF8',
  text2:    '#7A93B8',
  green:    '#00FF94',
  indigo:   '#6366F1',
  amber:    '#F59E0B',
  red:      '#EF4444',
  teal:     '#06B6D4',
};

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function publish(subdomain, slugPath, html, title) {
  const body = JSON.stringify({ html, title });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slugPath}`,
    method: 'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    subdomain,
    },
  }, body);
}

// ── Hero Page ─────────────────────────────────────────────────────────────────
function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP} — ${TAGLINE}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${P.bg};--bg2:${P.bg2};--surf:${P.surface};--border:${P.border};
  --text:${P.text};--text2:${P.text2};
  --green:${P.green};--indigo:${P.indigo};--amber:${P.amber};--red:${P.red};--teal:${P.teal};
}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}

/* dot grid bg */
body::before{
  content:'';position:fixed;inset:0;
  background-image:radial-gradient(circle, #1E2D44 1px, transparent 1px);
  background-size:30px 30px;
  opacity:0.4;pointer-events:none;z-index:0;
}

nav{position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 40px;background:rgba(7,11,18,0.85);
  backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.logo{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;
  color:var(--green);letter-spacing:4px}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:var(--text2);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.cta-nav{background:var(--green);color:var(--bg);font-weight:700;font-size:13px;
  padding:8px 20px;border-radius:8px;text-decoration:none;letter-spacing:.5px;
  font-family:'JetBrains Mono',monospace}

main{position:relative;z-index:1}

/* Hero */
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;
  text-align:center;padding:120px 24px 80px;position:relative}
.hero-glow{position:absolute;top:10%;left:50%;transform:translateX(-50%);
  width:600px;height:400px;
  background:radial-gradient(ellipse, rgba(0,255,148,0.08) 0%, transparent 70%);
  pointer-events:none}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;
  color:var(--green);letter-spacing:4px;text-transform:uppercase;margin-bottom:24px}
h1{font-size:clamp(48px,6vw,80px);font-weight:700;line-height:1.06;
  max-width:900px;margin:0 auto 28px;
  background:linear-gradient(135deg,var(--text) 60%,var(--green));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-sub{font-size:18px;color:var(--text2);max-width:540px;margin:0 auto 48px;line-height:1.6}
.hero-cta{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-primary{background:var(--green);color:var(--bg);font-weight:700;font-size:14px;
  padding:14px 32px;border-radius:10px;text-decoration:none;
  font-family:'JetBrains Mono',monospace;letter-spacing:.5px;
  box-shadow:0 0 30px rgba(0,255,148,0.25);transition:all .2s}
.btn-primary:hover{box-shadow:0 0 50px rgba(0,255,148,0.4);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--text);font-size:14px;font-weight:500;
  padding:14px 32px;border-radius:10px;text-decoration:none;
  border:1px solid var(--border);transition:all .2s}
.btn-ghost:hover{border-color:var(--text2)}

/* Score badge */
.score-badge{display:inline-flex;align-items:center;gap:8px;
  background:var(--surf);border:1px solid var(--border);
  padding:6px 16px 6px 6px;border-radius:24px;margin-bottom:32px;font-size:13px}
.score-dot{width:24px;height:24px;border-radius:50%;background:var(--green);
  display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:var(--bg)}
.score-txt{color:var(--text2);font-size:12px}
.score-val{color:var(--green);font-weight:600;font-family:'JetBrains Mono',monospace}

/* Stats strip */
.stats{display:flex;justify-content:center;gap:0;padding:0 24px;margin-bottom:80px}
.stat{flex:1;max-width:220px;text-align:center;padding:32px 24px;
  border:1px solid var(--border);background:var(--surf);
  transition:border-color .2s}
.stat:first-child{border-radius:16px 0 0 16px}
.stat:last-child{border-radius:0 16px 16px 0}
.stat:not(:first-child){border-left:none}
.stat:hover{border-color:rgba(0,255,148,0.3)}
.stat-num{font-family:'JetBrains Mono',monospace;font-size:36px;font-weight:700;
  color:var(--green);margin-bottom:6px}
.stat-lbl{font-size:13px;color:var(--text2)}

/* Features */
.features{padding:0 24px 100px;max-width:1100px;margin:0 auto}
.section-label{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;
  color:var(--green);letter-spacing:4px;text-align:center;margin-bottom:16px}
.section-title{font-size:clamp(28px,4vw,42px);font-weight:700;text-align:center;
  margin-bottom:60px}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.feature{background:var(--surf);border:1px solid var(--border);border-radius:16px;
  padding:32px;transition:border-color .25s,transform .2s}
.feature:hover{border-color:rgba(99,102,241,0.4);transform:translateY(-2px)}
.f-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;
  justify-content:center;font-size:22px;margin-bottom:20px}
.f-title{font-size:17px;font-weight:600;margin-bottom:10px}
.f-desc{font-size:14px;color:var(--text2);line-height:1.6}
.f-tag{display:inline-block;margin-top:14px;font-family:'JetBrains Mono',monospace;
  font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:4px}

/* Screens preview */
.preview{padding:0 24px 100px;max-width:1100px;margin:0 auto;text-align:center}
.preview-inner{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-top:48px}
.screen-card{background:var(--surf);border:1px solid var(--border);border-radius:16px;
  width:180px;padding:20px 14px;text-align:left;transition:border-color .2s}
.screen-card:hover{border-color:rgba(0,255,148,0.3)}
.sc-label{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;
  color:var(--green);letter-spacing:2px;margin-bottom:10px}
.sc-title{font-size:14px;font-weight:600;margin-bottom:6px}
.sc-desc{font-size:12px;color:var(--text2);line-height:1.5}
.sc-num{font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;
  color:var(--border);margin-bottom:8px}

/* Encryption strip */
.enc-strip{background:rgba(0,68,51,0.3);border-top:1px solid rgba(0,255,148,0.15);
  border-bottom:1px solid rgba(0,255,148,0.15);
  padding:20px 40px;text-align:center;font-family:'JetBrains Mono',monospace;
  font-size:12px;color:var(--green);letter-spacing:3px;margin:0 0 80px}

/* CTA section */
.cta-section{text-align:center;padding:0 24px 120px;max-width:600px;margin:0 auto}
.cta-section h2{font-size:clamp(28px,4vw,44px);font-weight:700;margin-bottom:16px}
.cta-section p{color:var(--text2);font-size:16px;margin-bottom:40px;line-height:1.6}
.risk-label{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;
  letter-spacing:3px;color:var(--amber);margin-bottom:20px}

/* Footer */
footer{border-top:1px solid var(--border);padding:32px 40px;display:flex;
  align-items:center;justify-content:space-between;color:var(--text2);font-size:13px}
.footer-logo{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;
  color:var(--green);letter-spacing:3px}
</style>
</head>
<body>
<nav>
  <div class="logo">CIPHER</div>
  <ul class="nav-links">
    <li><a href="#">Features</a></li>
    <li><a href="#">Vault</a></li>
    <li><a href="#">Audit</a></li>
    <li><a href="#">Pricing</a></li>
  </ul>
  <a href="/cipher-mock" class="cta-nav">Try Mock →</a>
</nav>

<main>
<section class="hero">
  <div class="hero-glow"></div>
  <div>
    <div class="score-badge">
      <div class="score-dot">87</div>
      <span class="score-txt">Your Privacy Score:</span>
      <span class="score-val">SECURE</span>
    </div>
    <p class="eyebrow">AI Privacy Intelligence</p>
    <h1>Know exactly who<br>sees your data.</h1>
    <p class="hero-sub">CIPHER audits every app permission, encrypts your sensitive data, and blocks threats before they reach you. Real-time. Always on.</p>
    <div class="hero-cta">
      <a href="/cipher-viewer" class="btn-primary">View Design →</a>
      <a href="/cipher-mock" class="btn-ghost">Interactive Mock ☀◑</a>
    </div>
  </div>
</section>

<div class="stats">
  <div class="stat">
    <div class="stat-num">47</div>
    <div class="stat-lbl">Apps audited</div>
  </div>
  <div class="stat">
    <div class="stat-num">128</div>
    <div class="stat-lbl">Threats blocked this week</div>
  </div>
  <div class="stat">
    <div class="stat-num">6</div>
    <div class="stat-lbl">Encrypted vaults</div>
  </div>
  <div class="stat">
    <div class="stat-num">0</div>
    <div class="stat-lbl">Data leaks detected</div>
  </div>
</div>

<div class="enc-strip">■ AES-256 · ZERO KNOWLEDGE · END-TO-END ENCRYPTED · ALL VAULTS SEALED ■</div>

<section class="features">
  <p class="section-label">Core Features</p>
  <h2 class="section-title">Privacy, made visible.</h2>
  <div class="feature-grid">
    <div class="feature">
      <div class="f-icon" style="background:rgba(0,255,148,0.1)">⬡</div>
      <div class="f-title">Privacy Score</div>
      <p class="f-desc">AI-computed score across 12 privacy dimensions — updated in real time as apps request permissions or access your data.</p>
      <span class="f-tag" style="background:rgba(0,255,148,0.1);color:${P.green}">DASHBOARD</span>
    </div>
    <div class="feature">
      <div class="f-icon" style="background:rgba(99,102,241,0.1)">⊞</div>
      <div class="f-title">Permission Audit</div>
      <p class="f-desc">Every app on your device, ranked by risk. See exactly what Instagram accesses while you sleep — and revoke it in one tap.</p>
      <span class="f-tag" style="background:rgba(99,102,241,0.1);color:${P.indigo}">AUDIT</span>
    </div>
    <div class="feature">
      <div class="f-icon" style="background:rgba(0,255,148,0.08)">⊕</div>
      <div class="f-title">Encrypted Vault</div>
      <p class="f-desc">AES-256 zero-knowledge vault for passwords, health data, financial records, and identity documents. Only you hold the key.</p>
      <span class="f-tag" style="background:rgba(0,255,148,0.1);color:${P.green}">VAULT</span>
    </div>
    <div class="feature">
      <div class="f-icon" style="background:rgba(239,68,68,0.1)">◉</div>
      <div class="f-title">Threat Alerts</div>
      <p class="f-desc">Real-time security timeline. Know the moment an app reads your clipboard, samples your location in the background, or phones home.</p>
      <span class="f-tag" style="background:rgba(239,68,68,0.1);color:${P.red}">ALERTS</span>
    </div>
    <div class="feature">
      <div class="f-icon" style="background:rgba(6,182,212,0.1)">◎</div>
      <div class="f-title">VPN Integration</div>
      <p class="f-desc">One-tap VPN protection with automatic country selection. Monitors connection drops and flags unprotected windows.</p>
      <span class="f-tag" style="background:rgba(6,182,212,0.1);color:${P.teal}">NETWORK</span>
    </div>
    <div class="feature">
      <div class="f-icon" style="background:rgba(245,158,11,0.1)">◇</div>
      <div class="f-title">Data Broker Opt-out</div>
      <p class="f-desc">Automatically submits opt-out requests to 52+ data brokers. Tracks removal status and re-submits if your data reappears.</p>
      <span class="f-tag" style="background:rgba(245,158,11,0.1);color:${P.amber}">ERASURE</span>
    </div>
  </div>
</section>

<section class="preview">
  <p class="section-label">Design Preview</p>
  <h2 class="section-title">5 screens. Complete protection.</h2>
  <div class="preview-inner">
    ${[
      ['01', 'Dashboard', 'Privacy score ring, active monitors, threat overview'],
      ['02', 'Permissions', 'App risk audit with permission heatmap'],
      ['03', 'Vault', 'Encrypted data categories with lock visual'],
      ['04', 'Alerts', 'Security event timeline with severity filtering'],
      ['05', 'Profile', 'VPN status, privacy controls, data broker opt-outs'],
    ].map(([n, t, d]) => `
    <div class="screen-card">
      <div class="sc-num">${n}</div>
      <div class="sc-label">SCREEN ${n}</div>
      <div class="sc-title">${t}</div>
      <div class="sc-desc">${d}</div>
    </div>`).join('')}
  </div>
</section>

<section class="cta-section">
  <p class="risk-label">▲ 3 CRITICAL ISSUES FOUND ON YOUR DEVICE</p>
  <h2>Your data deserves<br>better.</h2>
  <p>Instagram read your clipboard 14 times this week. TikTok sampled your location while you slept. CIPHER sees everything they don't want you to see.</p>
  <div class="hero-cta">
    <a href="/cipher-viewer" class="btn-primary">Explore Design</a>
    <a href="/cipher-mock" class="btn-ghost">Interactive Mock</a>
  </div>
</section>
</main>

<footer>
  <div class="footer-logo">CIPHER</div>
  <div>Design by RAM · 2026</div>
  <div>AES-256 · Zero Knowledge</div>
</footer>
</body>
</html>`;
}

// ── Viewer Page ───────────────────────────────────────────────────────────────
function buildViewer() {
  const penJson = fs.readFileSync(path.join(__dirname, 'cipher.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${APP} — Pencil Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#070B12;display:flex;flex-direction:column;min-height:100vh;
  font-family:'Inter',system-ui,sans-serif;color:#E2EBF8}
.viewer-header{padding:16px 24px;background:rgba(7,11,18,0.9);
  border-bottom:1px solid #1E2D44;display:flex;align-items:center;gap:16px}
.viewer-logo{font-weight:700;font-size:14px;color:#00FF94;letter-spacing:3px}
.viewer-tag{font-size:12px;color:#7A93B8}
.viewer-link{margin-left:auto;font-size:12px;color:#6366F1;text-decoration:none}
#pencil-embed{flex:1;border:none;width:100%;min-height:calc(100vh - 56px);
  background:#070B12}
</style>
<script>
${injection.replace('<script>', '').replace('<\/script>', '')}
<\/script>
</head>
<body>
<div class="viewer-header">
  <span class="viewer-logo">CIPHER</span>
  <span class="viewer-tag">5 screens · Dark theme · pencil.dev v2.8</span>
  <a href="/cipher" class="viewer-link">← Back to overview</a>
</div>
<iframe id="pencil-embed"
  src="https://pencil.dev/embed/viewer"
  title="CIPHER design viewer">
</iframe>
<script>
const frame = document.getElementById('pencil-embed');
frame.addEventListener('load', () => {
  frame.contentWindow.postMessage({ type: 'LOAD_PEN', pen: window.EMBEDDED_PEN }, '*');
});
<\/script>
</body>
</html>`;

  return viewerHtml.replace('<script>', injection + '\n<script>');
}

// ── Run pipeline ──────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing CIPHER...\n');

  // a) Hero
  let r = await publish('ram', SLUG, buildHero(), `${APP} — ${TAGLINE}`);
  console.log(`Hero:   ${r.status} → https://ram.zenbin.org/${SLUG}`);

  // b) Viewer
  r = await publish('ram', `${SLUG}-viewer`, buildViewer(), `${APP} — Design Viewer`);
  console.log(`Viewer: ${r.status} → https://ram.zenbin.org/${SLUG}-viewer`);

  // c) Gallery queue
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  function ghReq(opts, body) {
    return new Promise((resolve, reject) => {
      const r2 = https.request(opts, res => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      r2.on('error', reject);
      if (body) r2.write(body);
      r2.end();
    });
  }

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
    app_name: APP,
    tagline: TAGLINE,
    archetype: ARCH,
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
    message: `add: ${APP} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);
  console.log(`Gallery: ${putRes.status === 200 ? 'OK' : putRes.body.slice(0,100)}`);

  console.log('\nDone! CIPHER published.');
  // expose newEntry for DB step
  global.__newEntry = newEntry;
})();
