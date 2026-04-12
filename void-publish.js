#!/usr/bin/env node
// VOID — Full publish pipeline (hero page + viewer)
const fs = require('fs');
const https = require('https');

const SLUG = 'void';
const APP_NAME = 'VOID';
const TAGLINE = 'Infrastructure topology for the dark web of services';
const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));

function deploy(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title: title || slug, html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://zenbin.org/p/${slug}`, status: res.statusCode });
        } else {
          resolve({ ok: false, status: res.statusCode, body: d.slice(0, 120) });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VOID — Infrastructure Topology</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#050505;--surface:#0D0D0D;--surface2:#131313;
  --border:#1C1C1C;--border-lit:#2A2A2A;
  --text:#F0EEE8;--muted:rgba(240,238,232,0.38);
  --cyan:#00E5FF;--cyan-dim:rgba(0,229,255,0.08);
  --violet:#7B61FF;--amber:#FFB020;--red:#FF4444;--green:#00D084;
  --mono:'JetBrains Mono',monospace;--sans:'Inter',system-ui,sans-serif;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--sans);overflow-x:hidden;min-height:100vh}

/* ── NAV ── */
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(5,5,5,0.9);border-bottom:1px solid var(--border-lit);backdrop-filter:blur(16px);padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:52px}
.nav-logo{font-family:var(--mono);font-weight:700;font-size:18px;letter-spacing:.12em;color:var(--text)}
.nav-live{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;color:var(--cyan);letter-spacing:.1em;font-weight:600}
.nav-dot{width:7px;height:7px;border-radius:50%;background:var(--cyan);animation:pulse 2s ease-in-out infinite;box-shadow:0 0 8px var(--cyan)}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.9)}}
.nav-links{display:flex;gap:24px}
.nav-links a{font-family:var(--mono);font-size:10px;color:var(--muted);text-decoration:none;letter-spacing:.08em;text-transform:uppercase;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;background:var(--cyan);color:#000;padding:8px 18px;border-radius:6px;text-decoration:none;transition:opacity .2s}
.nav-cta:hover{opacity:.85}

/* ── HERO ── */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 60px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 800px 500px at 50% 40%,rgba(0,229,255,0.04) 0%,transparent 70%)}
.hero-eyebrow{font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.2em;color:var(--cyan);text-transform:uppercase;margin-bottom:24px;opacity:.8}
.hero-title{font-family:var(--mono);font-size:clamp(48px,10vw,96px);font-weight:700;letter-spacing:.06em;line-height:1;color:var(--text);margin-bottom:24px}
.hero-title span{color:var(--cyan)}
.hero-sub{font-size:16px;color:var(--muted);max-width:480px;line-height:1.6;margin-bottom:48px}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.btn-primary{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.1em;background:var(--cyan);color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;transition:all .2s}
.btn-primary:hover{box-shadow:0 0 24px rgba(0,229,255,0.4);transform:translateY(-1px)}
.btn-ghost{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.08em;color:var(--text);border:1px solid var(--border-lit);padding:14px 28px;border-radius:8px;text-decoration:none;transition:all .2s}
.btn-ghost:hover{border-color:var(--cyan);color:var(--cyan)}

/* ── TOPOLOGY PREVIEW ── */
.topology-preview{width:100%;max-width:540px;margin:56px auto 0;position:relative}
.topology-svg{width:100%;height:320px}

/* ── STATS ROW ── */
.stats{display:flex;justify-content:center;gap:0;margin:60px 0;border:1px solid var(--border-lit);border-radius:12px;overflow:hidden;max-width:540px;margin-left:auto;margin-right:auto}
.stat{flex:1;padding:24px 20px;text-align:center;border-right:1px solid var(--border-lit)}
.stat:last-child{border-right:none}
.stat-val{font-family:var(--mono);font-size:28px;font-weight:700;color:var(--cyan);display:block;margin-bottom:6px}
.stat-label{font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:.12em;text-transform:uppercase}

/* ── FEATURES ── */
.features{max-width:720px;margin:0 auto;padding:60px 24px}
.features-title{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.15em;text-align:center;margin-bottom:40px;text-transform:uppercase}
.feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:500px){.feature-grid{grid-template-columns:1fr}}
.feature-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;transition:border-color .2s}
.feature-card:hover{border-color:var(--border-lit)}
.feature-icon{font-size:20px;margin-bottom:12px;display:block}
.feature-name{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px;letter-spacing:.04em}
.feature-desc{font-size:12px;color:var(--muted);line-height:1.6}

/* ── SCREENS SECTION ── */
.screens-section{max-width:900px;margin:0 auto;padding:40px 24px 80px}
.screens-title{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.15em;text-align:center;margin-bottom:40px;text-transform:uppercase}
.screens-scroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:16px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
.screen-chip{flex-shrink:0;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 20px;font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:.08em;cursor:default;white-space:nowrap}
.screen-chip.active{border-color:var(--cyan);color:var(--cyan)}

/* ── FOOTER ── */
footer{border-top:1px solid var(--border);padding:32px 24px;text-align:center}
.footer-logo{font-family:var(--mono);font-size:22px;font-weight:700;letter-spacing:.12em;color:var(--text);margin-bottom:8px}
.footer-by{font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:.1em}
.footer-by span{color:var(--cyan)}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">VOID</div>
  <div class="nav-live"><span class="nav-dot"></span>LIVE</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#screens">Screens</a>
  </div>
  <a class="nav-cta" href="/void-viewer">View Design →</a>
</nav>

<section class="hero">
  <div class="hero-eyebrow">Infrastructure Topology</div>
  <h1 class="hero-title">V<span>O</span>ID</h1>
  <p class="hero-sub">See every node. Every connection. Every failure. Real-time distributed systems topology for the engineers who shipped it.</p>
  <div class="hero-btns">
    <a class="btn-primary" href="/void-viewer">View Prototype</a>
    <a class="btn-ghost" href="/void-mock">Interactive Mock ◑</a>
  </div>

  <!-- SVG Topology Preview -->
  <div class="topology-preview">
    <svg class="topology-svg" viewBox="0 0 540 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Connection lines -->
      <line x1="270" y1="80"  x2="155" y2="170" stroke="#00E5FF" stroke-width="1" stroke-opacity=".35"/>
      <line x1="270" y1="80"  x2="385" y2="170" stroke="#00E5FF" stroke-width="1" stroke-opacity=".35"/>
      <line x1="155" y1="170" x2="100" y2="260" stroke="#00E5FF" stroke-width="1" stroke-opacity=".25"/>
      <line x1="155" y1="170" x2="270" y2="260" stroke="#00E5FF" stroke-width="1" stroke-opacity=".25"/>
      <line x1="385" y1="170" x2="440" y2="260" stroke="#00E5FF" stroke-width="1" stroke-opacity=".25"/>
      <line x1="385" y1="170" x2="270" y2="260" stroke="#FFB020" stroke-width="1" stroke-opacity=".3"/>
      <!-- Gateway node (large) -->
      <circle cx="270" cy="80" r="32" fill="#0D0D0D" stroke="#00E5FF" stroke-width="1.5"/>
      <circle cx="270" cy="80" r="40" fill="rgba(0,229,255,0.05)"/>
      <circle cx="258" cy="68" r="9" fill="rgba(255,255,255,0.04)"/>
      <circle cx="270" cy="80" r="4" fill="#00E5FF"/>
      <text x="270" y="126" text-anchor="middle" fill="#F0EEE8" font-family="'JetBrains Mono',monospace" font-size="10" font-weight="600" letter-spacing="2">GATEWAY</text>
      <!-- AUTH node -->
      <circle cx="155" cy="170" r="22" fill="#0D0D0D" stroke="#00E5FF" stroke-width="1.5"/>
      <circle cx="155" cy="170" r="28" fill="rgba(0,229,255,0.04)"/>
      <circle cx="155" cy="170" r="3" fill="#00E5FF"/>
      <text x="155" y="206" text-anchor="middle" fill="#F0EEE8" font-family="'JetBrains Mono',monospace" font-size="9" font-weight="600" letter-spacing="1.5">AUTH</text>
      <!-- API node -->
      <circle cx="385" cy="170" r="22" fill="#0D0D0D" stroke="#00E5FF" stroke-width="1.5"/>
      <circle cx="385" cy="170" r="28" fill="rgba(0,229,255,0.04)"/>
      <circle cx="385" cy="170" r="3" fill="#00E5FF"/>
      <text x="385" y="206" text-anchor="middle" fill="#F0EEE8" font-family="'JetBrains Mono',monospace" font-size="9" font-weight="600" letter-spacing="1.5">API</text>
      <!-- CACHE node (warning) -->
      <circle cx="100" cy="260" r="18" fill="#0D0D0D" stroke="#FFB020" stroke-width="1.5"/>
      <circle cx="100" cy="260" r="24" fill="rgba(255,176,32,0.06)"/>
      <circle cx="100" cy="260" r="3" fill="#FFB020"/>
      <text x="100" y="290" text-anchor="middle" fill="#F0EEE8" font-family="'JetBrains Mono',monospace" font-size="8" font-weight="600" letter-spacing="1">CACHE</text>
      <!-- DB-01 node -->
      <circle cx="270" cy="260" r="18" fill="#0D0D0D" stroke="#00E5FF" stroke-width="1.5"/>
      <circle cx="270" cy="260" r="3" fill="#00E5FF"/>
      <text x="270" y="290" text-anchor="middle" fill="#F0EEE8" font-family="'JetBrains Mono',monospace" font-size="8" font-weight="600" letter-spacing="1">DB-01</text>
      <!-- DB-02 node -->
      <circle cx="440" cy="260" r="18" fill="#0D0D0D" stroke="#00E5FF" stroke-width="1.5"/>
      <circle cx="440" cy="260" r="3" fill="#00E5FF"/>
      <text x="440" y="290" text-anchor="middle" fill="#F0EEE8" font-family="'JetBrains Mono',monospace" font-size="8" font-weight="600" letter-spacing="1">DB-02</text>
    </svg>
  </div>
</section>

<!-- Stats -->
<div class="stats">
  <div class="stat"><span class="stat-val">8/9</span><span class="stat-label">Nodes Live</span></div>
  <div class="stat"><span class="stat-val">2.4ms</span><span class="stat-label">Avg Latency</span></div>
  <div class="stat"><span class="stat-val">4.2K</span><span class="stat-label">Req/sec</span></div>
</div>

<!-- Features -->
<section class="features" id="features">
  <div class="features-title">What VOID sees</div>
  <div class="feature-grid">
    <div class="feature-card">
      <span class="feature-icon">⬡</span>
      <div class="feature-name">TOPOLOGY MAP</div>
      <p class="feature-desc">Live cluster graph. Nodes as metallic orbs, connections as data-flow lines. See your infra as a living molecular structure.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">◉</span>
      <div class="feature-name">NODE DRILL-DOWN</div>
      <p class="feature-desc">CPU, memory, latency, error rate — all in one glance. Real-time sparklines with threshold markers.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">⚡</span>
      <div class="feature-name">ALERT FEED</div>
      <p class="feature-desc">Severity-ranked incident stream. Critical, warn, info — colour-coded with left-border severity stripes.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">↔</span>
      <div class="feature-name">TRACE WATERFALL</div>
      <p class="feature-desc">Full distributed trace view. See the exact path of any request through your cluster, span by span.</p>
    </div>
  </div>
</section>

<!-- Screens section -->
<section class="screens-section" id="screens">
  <div class="screens-title">5 Screens</div>
  <div class="screens-scroll">
    <div class="screen-chip active">01 — Topology</div>
    <div class="screen-chip">02 — Node Detail</div>
    <div class="screen-chip">03 — Alert Feed</div>
    <div class="screen-chip">04 — Trace View</div>
    <div class="screen-chip">05 — Cluster Config</div>
  </div>
</section>

<footer>
  <div class="footer-logo">VOID</div>
  <div class="footer-by">Designed by <span>RAM</span> · Design Heartbeat · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
  <div style="margin-top:16px;display:flex;gap:12px;justify-content:center">
    <a href="/void-viewer" style="font-family:var(--mono);font-size:10px;color:var(--cyan);text-decoration:none;letter-spacing:.08em">VIEWER →</a>
    <a href="/void-mock" style="font-family:var(--mono);font-size:10px;color:var(--muted);text-decoration:none;letter-spacing:.08em">MOCK ◑</a>
  </div>
</footer>

</body>
</html>`;

// ─── VIEWER PAGE ──────────────────────────────────────────────────────────────
function buildViewer(penJson) {
  let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

async function main() {
  console.log('Publishing VOID...\n');

  // 1. Hero
  console.log('→ Publishing hero page...');
  const heroResult = await deploy(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('  Hero:', heroResult.url || heroResult.raw?.slice(0,80) || JSON.stringify(heroResult).slice(0,80));

  // 2. Viewer
  console.log('→ Publishing viewer...');
  const penJson = fs.readFileSync('/workspace/group/design-studio/void.pen', 'utf8');
  const viewerHtml = buildViewer(penJson);
  const viewerResult = await deploy(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Prototype Viewer`);
  console.log('  Viewer:', viewerResult.url || viewerResult.raw?.slice(0,80) || JSON.stringify(viewerResult).slice(0,80));

  console.log('\n✓ Done publishing VOID');
}

main().catch(e => { console.error(e); process.exit(1); });
