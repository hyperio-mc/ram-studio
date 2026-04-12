/**
 * ALLOY — Full Design Discovery Pipeline
 * Hero page + Viewer + Gallery queue
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG    = 'alloy';
const APP     = 'ALLOY';
const TAGLINE = 'Wealth composition, forged with precision';
const ARCHETYPE = 'fintech-dark';
const PROMPT  = 'Dark-mode personal wealth OS inspired by godly.website void-palette and darkmodedesign.com chromatic accent aesthetics. Metallurgy as finance metaphor — 5 screens.';

// ZenBin publisher
function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch(e) { resolve({ url: `https://${subdomain}.zenbin.org/${slug}`, raw: d.slice(0,200) }); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// ─── Hero page HTML ───────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ALLOY — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #0B0C10;
    --surface: #14162A;
    --surface2: #1C1E34;
    --text:    #E8E9F0;
    --accent:  #7C5CFC;
    --accent2: #FF6B6B;
    --green:   #48C778;
    --amber:   #FFB340;
    --muted:   rgba(232,233,240,0.4);
    --border:  rgba(124,92,252,0.2);
  }

  html { scroll-behavior: smooth; }
  body {
    font-family: 'Space Grotesk', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Noise texture overlay ─────────────────────── */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.4;
  }

  /* ── Nav ───────────────────────────────────────── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    background: rgba(11,12,16,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-size: 22px; font-weight: 800;
    letter-spacing: 4px;
    color: var(--accent);
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    color: var(--muted); text-decoration: none;
    font-size: 13px; font-weight: 500; letter-spacing: 1px;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 10px 22px; border-radius: 8px;
    font-weight: 700; font-size: 13px; letter-spacing: 0.5px;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── Hero ──────────────────────────────────────── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 120px 24px 80px;
    position: relative;
  }

  .hero-glow {
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(124,92,252,0.12);
    border: 1px solid rgba(124,92,252,0.3);
    border-radius: 24px;
    padding: 8px 18px; margin-bottom: 32px;
    font-size: 12px; font-weight: 600; letter-spacing: 1.5px;
    color: var(--accent);
  }
  .hero-badge::before {
    content: '⚗'; font-size: 14px;
  }

  .hero-title {
    font-size: clamp(64px, 12vw, 120px);
    font-weight: 900;
    letter-spacing: 8px;
    line-height: 1;
    text-align: center;
    background: linear-gradient(135deg, #E8E9F0 0%, #7C5CFC 60%, #FF6B6B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 24px;
  }

  .hero-sub {
    font-size: clamp(18px, 3vw, 24px);
    color: var(--muted);
    text-align: center;
    max-width: 560px;
    line-height: 1.5;
    margin-bottom: 48px;
  }

  .hero-actions {
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
  }
  .btn-primary {
    background: var(--accent);
    color: #fff;
    padding: 16px 36px; border-radius: 12px;
    font-size: 15px; font-weight: 700; letter-spacing: 0.5px;
    text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 40px rgba(124,92,252,0.35);
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 60px rgba(124,92,252,0.5);
  }
  .btn-ghost {
    background: transparent;
    color: var(--text);
    padding: 16px 36px; border-radius: 12px;
    font-size: 15px; font-weight: 600;
    text-decoration: none;
    border: 1px solid rgba(232,233,240,0.15);
    transition: border-color 0.2s;
  }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Stats strip ───────────────────────────────── */
  .stats-strip {
    display: flex; gap: 0; justify-content: center; flex-wrap: wrap;
    padding: 60px 40px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .stat {
    flex: 1; min-width: 160px; max-width: 240px;
    text-align: center; padding: 0 24px;
    border-right: 1px solid var(--border);
  }
  .stat:last-child { border-right: none; }
  .stat-val {
    font-size: 42px; font-weight: 800;
    font-family: 'Space Mono', monospace;
    background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1; margin-bottom: 8px;
  }
  .stat-label { font-size: 12px; color: var(--muted); letter-spacing: 1.5px; font-weight: 600; }

  /* ── Features ─────────────────────────────────── */
  .section { padding: 100px 40px; max-width: 1100px; margin: 0 auto; }
  .section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 3px;
    color: var(--accent); margin-bottom: 16px;
  }
  .section-title {
    font-size: clamp(32px, 5vw, 52px); font-weight: 800;
    line-height: 1.15; margin-bottom: 20px;
  }
  .section-sub { font-size: 17px; color: var(--muted); max-width: 520px; line-height: 1.6; margin-bottom: 64px; }

  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    transition: transform 0.2s, border-color 0.2s;
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--accent); opacity: 0;
    transition: opacity 0.2s;
  }
  .feature-card:hover { transform: translateY(-4px); border-color: rgba(124,92,252,0.4); }
  .feature-card:hover::before { opacity: 1; }
  .feature-icon { font-size: 28px; margin-bottom: 16px; display: block; }
  .feature-name { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* ── Alloy bar ────────────────────────────────── */
  .alloy-section {
    padding: 100px 40px; background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .alloy-inner { max-width: 1100px; margin: 0 auto; }
  .alloy-bar-wrap { margin-top: 40px; }
  .alloy-bar {
    height: 24px; border-radius: 12px; overflow: hidden;
    display: flex; margin-bottom: 16px;
  }
  .alloy-seg { height: 100%; transition: flex 0.8s ease; cursor: pointer; }
  .alloy-labels { display: flex; gap: 24px; flex-wrap: wrap; }
  .alloy-leg {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600; color: var(--muted);
  }
  .alloy-dot { width: 10px; height: 10px; border-radius: 50%; }

  /* ── Screens showcase ─────────────────────────── */
  .screens-section { padding: 100px 40px; max-width: 1100px; margin: 0 auto; }
  .screens-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px; margin-top: 48px;
  }
  .screen-pill {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px 24px;
    text-align: center;
    transition: transform 0.2s;
  }
  .screen-pill:hover { transform: translateY(-4px); }
  .screen-num {
    font-family: 'Space Mono', monospace;
    font-size: 32px; font-weight: 700;
    color: var(--accent); opacity: 0.3;
    margin-bottom: 8px;
  }
  .screen-name { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .screen-desc { font-size: 13px; color: var(--muted); }

  /* ── CTA section ─────────────────────────────── */
  .cta-section {
    padding: 120px 40px; text-align: center;
    background: radial-gradient(ellipse at 50% 100%, rgba(124,92,252,0.12) 0%, transparent 70%);
  }
  .cta-title { font-size: clamp(36px, 6vw, 64px); font-weight: 800; margin-bottom: 20px; }
  .cta-sub { font-size: 18px; color: var(--muted); margin-bottom: 48px; }

  /* ── Footer ──────────────────────────────────── */
  footer {
    padding: 40px; text-align: center;
    border-top: 1px solid var(--border);
    font-size: 12px; color: var(--muted);
    letter-spacing: 1px;
  }
  footer span { color: var(--accent); }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">ALLOY</div>
  <div class="nav-links">
    <a href="#elements">Elements</a>
    <a href="#cashflow">Cash Flow</a>
    <a href="#forge">Forge</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">View Design →</a>
</nav>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-badge">WEALTH COMPOSITION PLATFORM</div>
  <h1 class="hero-title">ALLOY</h1>
  <p class="hero-sub">${TAGLINE}. Your financial portfolio as a living alloy — forged from elements, refined through signals.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Explore Design →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="stats-strip">
  <div class="stat"><div class="stat-val">5</div><div class="stat-label">SCREENS</div></div>
  <div class="stat"><div class="stat-val">4</div><div class="stat-label">ASSET CLASSES</div></div>
  <div class="stat"><div class="stat-val">∞</div><div class="stat-label">SCENARIOS</div></div>
  <div class="stat"><div class="stat-val">01</div><div class="stat-label">ACCENT COLOR</div></div>
</div>

<section class="section" id="elements">
  <div class="section-label">CORE CONCEPT</div>
  <h2 class="section-title">Finance as metallurgy.</h2>
  <p class="section-sub">Like combining metals to create an alloy, your wealth is a composition of asset classes — each with its own properties, strengths, and ideal ratios.</p>
  <div class="features-grid">
    <div class="feature-card">
      <span class="feature-icon">⬡</span>
      <div class="feature-name">Portfolio Command</div>
      <div class="feature-desc">Total net worth at a glance with live composition bar and recent moves feed.</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">◈</span>
      <div class="feature-name">Elements View</div>
      <div class="feature-desc">Each asset class as an elemental card with performance, position list, and alloy percentage.</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">≋</span>
      <div class="feature-name">Cash Flow</div>
      <div class="feature-desc">6-month income vs spending history with category-level breakdown and savings rate.</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">⚡</span>
      <div class="feature-name">Signals</div>
      <div class="feature-desc">Prioritized alerts: rebalancing triggers, tax-loss harvesting windows, rate changes.</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">⚗</span>
      <div class="feature-name">Forge Lab</div>
      <div class="feature-desc">Drag-to-rebalance scenario planner with trade suggestions and tax impact estimates.</div>
    </div>
  </div>
</section>

<div class="alloy-section" id="cashflow">
  <div class="alloy-inner">
    <div class="section-label">YOUR ALLOY</div>
    <h2 class="section-title">Composition at a glance.</h2>
    <div class="alloy-bar-wrap">
      <div class="alloy-bar">
        <div class="alloy-seg" style="flex:50; background:#7C5CFC;"></div>
        <div class="alloy-seg" style="flex:20; background:#48C778;"></div>
        <div class="alloy-seg" style="flex:16; background:#FFB340;"></div>
        <div class="alloy-seg" style="flex:14; background:#FF6B6B;"></div>
      </div>
      <div class="alloy-labels">
        <div class="alloy-leg"><div class="alloy-dot" style="background:#7C5CFC;"></div>Equities 50%</div>
        <div class="alloy-leg"><div class="alloy-dot" style="background:#48C778;"></div>Bonds 20%</div>
        <div class="alloy-leg"><div class="alloy-dot" style="background:#FFB340;"></div>Real Estate 16%</div>
        <div class="alloy-leg"><div class="alloy-dot" style="background:#FF6B6B;"></div>Alternatives 14%</div>
      </div>
    </div>
  </div>
</div>

<section class="screens-section" id="forge">
  <div class="section-label">DESIGN SCREENS</div>
  <h2 class="section-title">5 screens, one system.</h2>
  <div class="screens-grid">
    <div class="screen-pill"><div class="screen-num">01</div><div class="screen-name">Portfolio</div><div class="screen-desc">Net worth + composition bar + recent moves</div></div>
    <div class="screen-pill"><div class="screen-num">02</div><div class="screen-name">Elements</div><div class="screen-desc">Asset class cards with performance + Forge CTA</div></div>
    <div class="screen-pill"><div class="screen-num">03</div><div class="screen-name">Cash Flow</div><div class="screen-desc">Income/expense bars + category breakdown</div></div>
    <div class="screen-pill"><div class="screen-num">04</div><div class="screen-name">Signals</div><div class="screen-desc">Priority alerts + market events</div></div>
    <div class="screen-pill"><div class="screen-num">05</div><div class="screen-name">Forge</div><div class="screen-desc">Drag-to-rebalance with trade summary</div></div>
  </div>
</section>

<section class="cta-section">
  <h2 class="cta-title">Forge your alloy.</h2>
  <p class="cta-sub">Explore the full interactive prototype.</p>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Open Interactive Mock ☀◑</a>
</section>

<footer>
  Designed by <span>RAM</span> · Design Heartbeat · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
</footer>

</body>
</html>`;

// ─── Viewer HTML ───────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'alloy.pen'), 'utf8');
const embInject = 'window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';';
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ALLOY — Design Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0B0C10; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: sans-serif; }
  header { width: 100%; background: #14162A; border-bottom: 1px solid rgba(124,92,252,0.2); padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; }
  .hdr-brand { font-size: 20px; font-weight: 800; color: #7C5CFC; letter-spacing: 4px; }
  .hdr-sub { font-size: 11px; color: rgba(232,233,240,0.4); letter-spacing: 0.5px; margin-top: 3px; }
  .hdr-link { font-size: 12px; color: #7C5CFC; text-decoration: none; font-weight: 700; }
  #pencil-viewer { width: 100%; flex: 1; border: none; min-height: 600px; }
</style>
</head>
<body>
<header>
  <div><div class="hdr-brand">ALLOY</div><div class="hdr-sub">Wealth Composition Platform</div></div>
  <a href="https://ram.zenbin.org/${SLUG}" class="hdr-link">← Overview</a>
</header>
<script>EMBED_PLACEHOLDER</script>
<script src="https://pencil.dev/viewer.js"></script>
<div id="pencil-viewer"></div>
<script>
  if (window.PencilViewer && window.EMBEDDED_PEN) {
    PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN) });
  }
</script>
</body>
</html>`;
viewerHtml = viewerHtml.replace('EMBED_PLACEHOLDER', embInject);

// ─── Run pipeline ──────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page…');
  const heroRes = await publish(SLUG, heroHtml, `ALLOY — ${TAGLINE}`);
  console.log('Hero:', heroRes.url || `https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `ALLOY Design Viewer`);
  console.log('Viewer:', viewerRes.url || `https://ram.zenbin.org/${SLUG}-viewer`);

  // ─── Gallery queue ─────────────────────────────────────────────────────
  console.log('Updating gallery queue…');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
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
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json'
    }
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
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'dark',
    palette: '#0B0C10,#7C5CFC,#FF6B6B,#48C778,#FFB340',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    }
  }, putBody);

  console.log('Gallery queue:', putRes.status === 200 ? 'OK' : putRes.body.slice(0, 120));
  console.log('\n✓ Pipeline complete');
  console.log(`  Hero:    https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer:  https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:    https://ram.zenbin.org/${SLUG}-mock`);
})();
