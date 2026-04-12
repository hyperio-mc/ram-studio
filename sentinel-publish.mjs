import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLUG = 'sentinel';
const APP_NAME = 'SENTINEL';
const TAGLINE = 'API security intelligence, always watching';
const ARCHETYPE = 'security-intelligence';
const PROMPT = 'Dark-theme API security intelligence platform. Inspired by Evervault customers page (godly.website) — deep near-black navy #010314 background, encrypted data flow visualization, threat monitoring dashboard. Linear/Midday (darkmodedesign.com) for clean dark structural patterns.';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const ZENBIN_TOKEN = config.ZENBIN_TOKEN;
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO = config.GITHUB_REPO;

function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function zenPublish(slug, html, title) {
  const payload = JSON.stringify({ title, html });
  const body = Buffer.from(payload);
  const res = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
      'X-Subdomain': 'ram',
      'Authorization': `Bearer ${ZENBIN_TOKEN}`
    }
  }, body);
  return res;
}

// ── 1. Hero page ──────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SENTINEL — API Security Intelligence</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #010314;
    --surface: #070C22;
    --border: #12183D;
    --text: #DFE1F4;
    --muted: #6B7094;
    --accent: #5B6EF5;
    --teal: #22D3B4;
    --danger: #F45C5C;
    --warn: #F5A623;
  }
  html { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; }
  body { min-height: 100vh; overflow-x: hidden; }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px;
    background: rgba(1,3,20,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-size: 15px; font-weight: 800; letter-spacing: 4px; color: var(--text); }
  .nav-live { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--teal); letter-spacing: 1px; }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    padding: 8px 20px; background: var(--accent); color: #fff;
    border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
    text-decoration: none; transition: opacity .2s;
  }
  .nav-cta:hover { opacity: .85; }

  /* Hero */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 120px 24px 80px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 800px; height: 500px;
    background: radial-gradient(ellipse at center, rgba(91,110,245,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%);
    width: 600px; height: 300px;
    background: radial-gradient(ellipse at center, rgba(34,211,180,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  /* Grid overlay */
  .grid-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(91,110,245,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(91,110,245,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(91,110,245,0.1); border: 1px solid rgba(91,110,245,0.3);
    border-radius: 20px; padding: 6px 16px;
    font-size: 11px; font-weight: 700; color: var(--accent); letter-spacing: 2px;
    margin-bottom: 32px; position: relative; z-index: 1;
  }
  h1 {
    font-size: clamp(44px, 7vw, 88px); font-weight: 800;
    text-align: center; line-height: 1.05;
    letter-spacing: -2px; position: relative; z-index: 1;
    max-width: 900px;
  }
  h1 span { color: var(--teal); }
  .hero-sub {
    margin-top: 24px; max-width: 560px; text-align: center;
    font-size: 17px; font-weight: 400; color: var(--muted); line-height: 1.65;
    position: relative; z-index: 1;
  }
  .hero-actions { display: flex; gap: 16px; margin-top: 48px; position: relative; z-index: 1; }
  .btn-primary {
    padding: 14px 32px; background: var(--accent); color: #fff;
    border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
    cursor: pointer; text-decoration: none; transition: transform .15s, opacity .2s;
  }
  .btn-primary:hover { transform: translateY(-1px); opacity: .9; }
  .btn-secondary {
    padding: 14px 32px; background: transparent; color: var(--text);
    border: 1px solid var(--border); border-radius: 10px; font-size: 15px; font-weight: 600;
    cursor: pointer; text-decoration: none; transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: var(--accent); }

  /* Stat bar */
  .stat-bar {
    display: flex; gap: 0; margin-top: 80px; width: 100%; max-width: 720px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    position: relative; z-index: 1; overflow: hidden;
  }
  .stat-item {
    flex: 1; padding: 24px 28px;
    border-right: 1px solid var(--border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-value { font-size: 28px; font-weight: 800; color: var(--text); }
  .stat-value.teal { color: var(--teal); }
  .stat-value.danger { color: var(--danger); }
  .stat-label { font-size: 11px; font-weight: 500; color: var(--muted); margin-top: 4px; letter-spacing: 0.5px; }

  /* Features */
  .section { padding: 100px 24px; max-width: 1100px; margin: 0 auto; }
  .section-eyebrow {
    font-size: 11px; font-weight: 700; color: var(--accent); letter-spacing: 3px;
    text-align: center; margin-bottom: 16px;
  }
  h2 { font-size: clamp(32px, 4vw, 52px); font-weight: 800; text-align: center; letter-spacing: -1.5px; margin-bottom: 56px; }
  .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2px; }
  .feature-card {
    background: var(--surface); padding: 36px;
    border: 1px solid var(--border); border-radius: 0;
    transition: border-color .2s;
  }
  .feature-card:first-child { border-radius: 16px 0 0 0; }
  .feature-card:nth-child(2) { border-radius: 0 16px 0 0; }
  .feature-card:nth-child(3) { border-radius: 0 0 0 16px; }
  .feature-card:last-child { border-radius: 0 0 16px 0; }
  .feature-card:hover { border-color: var(--accent); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 20px;
  }
  .feature-icon.indigo { background: rgba(91,110,245,0.15); }
  .feature-icon.teal { background: rgba(34,211,180,0.15); }
  .feature-icon.danger { background: rgba(244,92,92,0.15); }
  .feature-icon.warn { background: rgba(245,166,35,0.15); }
  .feature-title { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
  .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* Screens preview */
  .screens-section { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
  .screens-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 48px; }
  .screen-thumb {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; aspect-ratio: 9/16; overflow: hidden;
    display: flex; flex-direction: column;
    padding: 16px 12px; gap: 8px;
    transition: border-color .2s, transform .2s;
    cursor: pointer;
  }
  .screen-thumb:hover { border-color: var(--accent); transform: translateY(-3px); }
  .thumb-bar { height: 6px; border-radius: 3px; }
  .thumb-bar.full { width: 100%; }
  .thumb-bar.w80 { width: 80%; }
  .thumb-bar.w60 { width: 60%; }
  .thumb-bar.w40 { width: 40%; }
  .thumb-bar.w30 { width: 30%; }
  .thumb-card { border-radius: 6px; padding: 8px; flex: 1; border: 1px solid var(--border); }
  .screen-label { font-size: 10px; font-weight: 600; color: var(--muted); letter-spacing: 1px; text-align: center; margin-top: 8px; }

  /* Footer */
  footer { padding: 48px 40px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .footer-logo { font-size: 13px; font-weight: 700; letter-spacing: 3px; color: var(--muted); }
  .footer-credit { font-size: 12px; color: var(--muted); }
  .footer-credit span { color: var(--accent); }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">SENTINEL</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
    <a href="https://ram.zenbin.org/sentinel-viewer">Viewer</a>
  </div>
  <div style="display:flex;align-items:center;gap:20px">
    <div class="nav-live"><div class="live-dot"></div>LIVE MONITOR</div>
    <a href="https://ram.zenbin.org/sentinel-mock" class="nav-cta">Interactive Mock</a>
  </div>
</nav>

<section class="hero">
  <div class="grid-overlay"></div>
  <div class="hero-eyebrow">API SECURITY INTELLIGENCE</div>
  <h1>Watch every byte.<br><span>Block every threat.</span></h1>
  <p class="hero-sub">SENTINEL monitors your API traffic in real time — encrypting flows, detecting anomalies, and blocking attacks before they reach your data.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/sentinel-mock" class="btn-primary">Try Interactive Mock</a>
    <a href="https://ram.zenbin.org/sentinel-viewer" class="btn-secondary">View Prototype</a>
  </div>
  <div class="stat-bar">
    <div class="stat-item">
      <div class="stat-value teal">94</div>
      <div class="stat-label">Security Posture Score</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">1,247</div>
      <div class="stat-label">API Calls / hr</div>
    </div>
    <div class="stat-item">
      <div class="stat-value danger">3</div>
      <div class="stat-label">Threats Blocked</div>
    </div>
    <div class="stat-item">
      <div class="stat-value teal">99.8%</div>
      <div class="stat-label">Uptime (30 days)</div>
    </div>
  </div>
</section>

<section class="section" id="features">
  <div class="section-eyebrow">CAPABILITIES</div>
  <h2>Security that thinks ahead</h2>
  <div class="features">
    <div class="feature-card">
      <div class="feature-icon teal">⌀</div>
      <div class="feature-title">Encrypted Data Flows</div>
      <div class="feature-desc">Every API route is encrypted end-to-end. AES-256, RSA-2048, and ChaCha20 — your choice per endpoint.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon danger">⚡</div>
      <div class="feature-title">Anomaly Detection</div>
      <div class="feature-desc">Real-time ML scoring surfaces brute force, data exfiltration, rate abuse, and novel attack vectors instantly.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon indigo">◈</div>
      <div class="feature-title">Endpoint Intelligence</div>
      <div class="feature-desc">p50/p99 latency, risk scoring, and method-level threat classification across all your API routes.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon warn">◻</div>
      <div class="feature-title">Immutable Audit Log</div>
      <div class="feature-desc">Every security event — key rotations, threat blocks, scan completions — captured with millisecond precision.</div>
    </div>
  </div>
</section>

<section class="screens-section" id="screens">
  <div class="section-eyebrow">5 SCREENS</div>
  <h2>Built for the terminal mind</h2>
  <div class="screens-grid">
    ${[
      { label: 'Overview', bars: ['#22D3B4','#5B6EF5','#F45C5C'], accent: '#22D3B4' },
      { label: 'Flows', bars: ['#5B6EF5','#22D3B4','#5B6EF5'], accent: '#5B6EF5' },
      { label: 'Access', bars: ['#F45C5C','#F5A623','#F45C5C'], accent: '#F45C5C' },
      { label: 'Endpoints', bars: ['#22D3B4','#F45C5C','#F5A623'], accent: '#22D3B4' },
      { label: 'Audit Log', bars: ['#F45C5C','#22D3B4','#5B6EF5'], accent: '#5B6EF5' },
    ].map(s => `
      <div class="screen-thumb" onclick="window.open('https://ram.zenbin.org/sentinel-viewer')">
        <div class="thumb-bar full" style="background:${s.bars[0]}22;height:8px;border-radius:4px"></div>
        <div class="thumb-card" style="background:#070C22;border-color:${s.accent}33">
          <div class="thumb-bar w60" style="background:${s.bars[0]};height:4px;border-radius:2px;margin-bottom:6px"></div>
          <div class="thumb-bar w40" style="background:${s.accent}44;height:3px;border-radius:2px"></div>
        </div>
        <div class="thumb-card" style="background:#070C22">
          <div class="thumb-bar w80" style="background:${s.bars[1]}55;height:4px;border-radius:2px;margin-bottom:4px"></div>
          <div class="thumb-bar w30" style="background:${s.bars[2]}66;height:3px;border-radius:2px"></div>
        </div>
        <div class="screen-label">${s.label}</div>
      </div>
    `).join('')}
  </div>
</section>

<footer>
  <div class="footer-logo">SENTINEL</div>
  <div class="footer-credit">Design by <span>RAM</span> · Design Heartbeat · 30 Mar 2026</div>
</footer>

</body>
</html>`;

// ── 2. Viewer page ─────────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'sentinel.pen'), 'utf8');
let viewerHtml = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ── 3. Publish ─────────────────────────────────────────────────────────────────
console.log('Publishing hero page...');
const heroRes = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));

console.log('Publishing viewer...');
const viewerRes = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));

// ── 4. Gallery queue ────────────────────────────────────────────────────────────
console.log('Updating gallery queue...');
const getRes = await httpsReq({
  hostname: 'api.github.com',
  path: `/repos/${GITHUB_REPO}/contents/queue.json`,
  method: 'GET',
  headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' }
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
const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: currentSha });
const putRes = await httpsReq({
  hostname: 'api.github.com',
  path: `/repos/${GITHUB_REPO}/contents/queue.json`,
  method: 'PUT',
  headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' }
}, putBody);
console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 100));

console.log('\n✅ Done!');
console.log(`Hero:   https://ram.zenbin.org/${SLUG}`);
console.log(`Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
console.log(`Mock:   https://ram.zenbin.org/${SLUG}-mock`);
