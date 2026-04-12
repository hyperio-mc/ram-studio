/**
 * QUILL — Full Design Discovery Pipeline
 * Hero page + Viewer + Gallery queue
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SLUG      = 'quill';
const APP       = 'QUILL';
const TAGLINE   = 'Write quietly, think deeply';
const ARCHETYPE = 'journal-light';
const PROMPT    = "Light-mode personal journal app. Inspired by minimal.gallery's 'Retro OS Portfolio' niche trend (retro-terminal aesthetics returning to modern minimal) + Linear/Obsidian productivity minimalism from darkmodedesign.com. Warm parchment canvas, terminal-green accents, monospace timestamps. 5 screens.";

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html });
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
        'User-Agent': 'ram-heartbeat/1.0',
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        const ok = res.statusCode === 200 || res.statusCode === 201;
        resolve({ url: ok ? `https://${subdomain}.zenbin.org/${slug}` : null, status: res.statusCode, ok });
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// ─── Hero HTML ────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>QUILL — ${TAGLINE}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #F4EFE4;
    --surface:  #FDFAF3;
    --surface2: #EDE8D8;
    --text:     #1C1810;
    --muted:    #8A8070;
    --accent:   #2E7D52;
    --accent2:  #C44B2B;
    --border:   rgba(28,24,16,0.1);
    --border2:  rgba(46,125,82,0.2);
  }

  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Subtle paper grain */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 9999; opacity: 0.6;
  }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 48px;
    background: rgba(244,239,228,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-size: 20px; font-weight: 900; letter-spacing: 5px;
    color: var(--text);
  }
  .nav-logo span { color: var(--accent); }
  .nav-mono {
    font-family: 'Courier Prime', monospace;
    font-size: 11px; color: var(--muted);
  }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a {
    color: var(--muted); text-decoration: none;
    font-size: 13px; font-weight: 500;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 10px 22px; border-radius: 100px;
    font-size: 13px; font-weight: 700;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ── Hero ── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 140px 24px 100px;
    text-align: center; position: relative;
  }

  .hero-mono {
    font-family: 'Courier Prime', monospace;
    font-size: 11px; color: var(--muted);
    letter-spacing: 2px; margin-bottom: 28px;
    display: flex; align-items: center; gap: 16px;
  }
  .hero-mono::before, .hero-mono::after {
    content: ''; flex: 1; max-width: 80px;
    height: 1px; background: var(--border);
  }

  .hero-title {
    font-size: clamp(72px, 14vw, 140px);
    font-weight: 900; letter-spacing: 10px;
    line-height: 0.95; color: var(--text);
    margin-bottom: 12px; position: relative;
  }
  .hero-title .cursor {
    display: inline-block;
    width: 6px; height: 0.85em;
    background: var(--accent);
    vertical-align: middle;
    margin-left: 4px;
    animation: blink 1.1s step-end infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  .hero-tagline {
    font-family: 'Courier Prime', monospace;
    font-size: clamp(16px, 2.5vw, 22px);
    color: var(--muted); margin-bottom: 52px;
    font-style: italic;
  }

  .hero-actions {
    display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;
    margin-bottom: 64px;
  }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 16px 38px; border-radius: 100px;
    font-size: 15px; font-weight: 700;
    text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(46,125,82,0.25);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(46,125,82,0.35); }
  .btn-ghost {
    background: transparent; color: var(--text);
    padding: 16px 38px; border-radius: 100px;
    font-size: 15px; font-weight: 600; text-decoration: none;
    border: 1.5px solid var(--border); transition: border-color 0.2s, color 0.2s;
  }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  /* Featured quote */
  .hero-quote {
    max-width: 500px;
    font-family: 'Courier Prime', monospace;
    font-style: italic; font-size: 15px;
    color: var(--muted); line-height: 1.7;
    padding: 24px 32px;
    border-left: 3px solid var(--accent);
    text-align: left;
    background: var(--surface);
    border-radius: 0 12px 12px 0;
  }
  .hero-quote cite {
    display: block; font-style: normal;
    font-size: 11px; letter-spacing: 1.5px;
    color: var(--accent); margin-top: 12px;
  }

  /* ── Stats strip ── */
  .stats-strip {
    display: flex; gap: 0; justify-content: center;
    padding: 60px 40px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .stat {
    flex: 1; min-width: 140px; max-width: 220px;
    text-align: center; padding: 0 32px;
    border-right: 1px solid var(--border);
  }
  .stat:last-child { border-right: none; }
  .stat-val {
    font-family: 'Courier Prime', monospace;
    font-size: 42px; font-weight: 700;
    color: var(--accent); line-height: 1; margin-bottom: 8px;
  }
  .stat-label {
    font-size: 10px; color: var(--muted);
    letter-spacing: 2px; font-weight: 700;
    text-transform: uppercase;
  }

  /* ── Features ── */
  .section { padding: 100px 40px; max-width: 1080px; margin: 0 auto; }
  .section-label {
    font-family: 'Courier Prime', monospace;
    font-size: 10px; font-weight: 700; letter-spacing: 3px;
    color: var(--accent); margin-bottom: 16px; text-transform: uppercase;
  }
  .section-title {
    font-size: clamp(30px, 5vw, 50px); font-weight: 800;
    line-height: 1.1; margin-bottom: 16px;
  }
  .section-sub {
    font-size: 17px; color: var(--muted); max-width: 500px;
    line-height: 1.7; margin-bottom: 60px;
  }

  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
    gap: 20px;
  }
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 28px;
    transition: transform 0.2s, border-color 0.2s;
    position: relative; overflow: hidden;
  }
  .feature-card:hover { transform: translateY(-3px); border-color: var(--border2); }
  .feature-card::after {
    content: ''; position: absolute;
    left: 0; top: 0; bottom: 0; width: 3px;
    background: var(--accent); opacity: 0;
    transition: opacity 0.2s;
  }
  .feature-card:hover::after { opacity: 1; }
  .feature-icon { font-size: 24px; margin-bottom: 14px; display: block; }
  .feature-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

  /* ── Streak section ── */
  .streak-section {
    padding: 80px 40px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .streak-inner { max-width: 1080px; margin: 0 auto; }
  .streak-grid { display: flex; gap: 8px; margin-top: 32px; flex-wrap: wrap; }
  .streak-dot {
    width: 40px; height: 40px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    font-family: 'Courier Prime', monospace;
  }
  .streak-dot.done { background: var(--accent); color: #fff; }
  .streak-dot.miss { background: var(--surface2); color: var(--muted); }

  /* ── Screens ── */
  .screens-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px; margin-top: 48px;
  }
  .screen-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 24px 20px;
    transition: transform 0.2s;
  }
  .screen-card:hover { transform: translateY(-3px); }
  .screen-num {
    font-family: 'Courier Prime', monospace;
    font-size: 28px; font-weight: 700; color: var(--accent);
    opacity: 0.3; margin-bottom: 8px;
  }
  .screen-name { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .screen-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }

  /* ── CTA ── */
  .cta-section {
    padding: 120px 40px; text-align: center;
    background: radial-gradient(ellipse at 50% 100%, rgba(46,125,82,0.08) 0%, transparent 60%);
  }
  .cta-title { font-size: clamp(32px, 5vw, 58px); font-weight: 800; margin-bottom: 16px; }
  .cta-sub {
    font-family: 'Courier Prime', monospace;
    font-style: italic; font-size: 17px;
    color: var(--muted); margin-bottom: 44px;
  }

  /* ── Footer ── */
  footer {
    padding: 36px; text-align: center;
    border-top: 1px solid var(--border);
    font-family: 'Courier Prime', monospace;
    font-size: 11px; color: var(--muted); letter-spacing: 1px;
  }
  footer span { color: var(--accent); }
</style>
</head>
<body>

<nav>
  <div>
    <div class="nav-logo">Q<span>U</span>ILL</div>
    <div class="nav-mono">QUIET WRITING COMPANION</div>
  </div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#streak">Streak</a>
    <a href="#screens">Screens</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-viewer" class="nav-cta">View Design →</a>
</nav>

<section class="hero">
  <div class="hero-mono">JOURNAL APP · LIGHT THEME · 5 SCREENS</div>
  <h1 class="hero-title">QUILL<span class="cursor"></span></h1>
  <p class="hero-tagline">"${TAGLINE}"</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">Explore Design →</a>
    <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-ghost">Interactive Mock ☀◑</a>
  </div>
  <div class="hero-quote">
    "There is a particular discomfort in the space before clarity arrives. But some thoughts need to be sat with. Maybe that is what a journal is for: to practise not finishing."
    <cite>— QUILL MORNING PROMPT</cite>
  </div>
</section>

<div class="stats-strip">
  <div class="stat"><div class="stat-val">5</div><div class="stat-label">Screens</div></div>
  <div class="stat"><div class="stat-val">14</div><div class="stat-label">Day Streak</div></div>
  <div class="stat"><div class="stat-val">284</div><div class="stat-label">Avg Words</div></div>
  <div class="stat"><div class="stat-val">01</div><div class="stat-label">Accent Color</div></div>
</div>

<section class="section" id="features">
  <div class="section-label">Core Design</div>
  <h2 class="section-title">Warm, quiet, intentional.</h2>
  <p class="section-sub">QUILL strips everything back to the page. Warm parchment, terminal-green accents, monospace timestamps — a writing tool that feels like it was always there.</p>
  <div class="features-grid">
    <div class="feature-card">
      <span class="feature-icon">◉</span>
      <div class="feature-name">Daily Prompt</div>
      <div class="feature-desc">A single reflective question each morning, presented in the card's left-accent format. Tap to write.</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">✦</span>
      <div class="feature-name">Distraction-Free Editor</div>
      <div class="feature-desc">Full-screen prose editor with monospace timestamps, minimal toolbar, and a blinking terminal cursor.</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">⊞</span>
      <div class="feature-name">Tagged Archive</div>
      <div class="feature-desc">Pill-filtered tag system with horizontal scroll, month-grouped entries, and collapsed older batches.</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">◈</span>
      <div class="feature-name">Writing Stats</div>
      <div class="feature-desc">Monthly activity bar chart, streak tracker, and top-tag progress bars — writing made visible.</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">◎</span>
      <div class="feature-name">Warm Minimalism</div>
      <div class="feature-desc">Parchment #F4EFE4 background, forest green #2E7D52 accent, terracotta #C44B2B for emphasis. No cold grays.</div>
    </div>
  </div>
</section>

<div class="streak-section" id="streak">
  <div class="streak-inner">
    <div class="section-label">Habit Tracking</div>
    <h2 class="section-title">14-day streak.</h2>
    <div class="streak-grid">
      ${['M','T','W','T','F','S','S','M','T','W','T','F','S','S','S','S'].map((d,i) =>
        `<div class="streak-dot ${i < 14 ? 'done' : 'miss'}">${d}</div>`).join('')}
    </div>
  </div>
</div>

<section class="section" id="screens">
  <div class="section-label">Design Screens</div>
  <h2 class="section-title">5 screens, one rhythm.</h2>
  <div class="screens-grid">
    <div class="screen-card"><div class="screen-num">01</div><div class="screen-name">Today</div><div class="screen-desc">Morning prompt + 7-day streak + 3 recent entries with tags</div></div>
    <div class="screen-card"><div class="screen-num">02</div><div class="screen-name">Write</div><div class="screen-desc">Full-screen prose editor, mono timestamp, blinking cursor, formatting bar</div></div>
    <div class="screen-card"><div class="screen-num">03</div><div class="screen-name">Archive</div><div class="screen-desc">Search + horizontal pill filter + month-grouped entry list</div></div>
    <div class="screen-card"><div class="screen-num">04</div><div class="screen-name">Stats</div><div class="screen-desc">Streak card, metric pair, 26-bar activity chart, tag progress bars</div></div>
    <div class="screen-card"><div class="screen-num">05</div><div class="screen-name">Profile</div><div class="screen-desc">Avatar, Pro badge, stats row, settings list with monospace values</div></div>
  </div>
</section>

<section class="cta-section">
  <h2 class="cta-title">Start writing quietly.</h2>
  <p class="cta-sub">"The page is patient. So is QUILL."</p>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary">Open Interactive Mock ☀◑</a>
</section>

<footer>
  Designed by <span>RAM</span> · Design Heartbeat · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
</footer>
</body>
</html>`;

// ─── Viewer HTML ──────────────────────────────────────────────────────────
const penJson = fs.readFileSync(path.join(__dirname, 'quill.pen'), 'utf8');
const embInject = `window.EMBEDDED_PEN = ${JSON.stringify(penJson)};`;
let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QUILL — Design Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F4EFE4; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: 'Inter', sans-serif; }
  header { width: 100%; background: #FDFAF3; border-bottom: 1px solid rgba(28,24,16,0.1); padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; }
  .hdr-brand { font-size: 18px; font-weight: 900; color: #1C1810; letter-spacing: 5px; }
  .hdr-brand span { color: #2E7D52; }
  .hdr-sub { font-size: 10px; color: #8A8070; letter-spacing: 1px; margin-top: 3px; font-family: monospace; }
  .hdr-link { font-size: 12px; color: #2E7D52; text-decoration: none; font-weight: 700; }
  #pencil-viewer { width: 100%; flex: 1; border: none; min-height: 600px; }
</style>
</head>
<body>
<header>
  <div><div class="hdr-brand">Q<span>U</span>ILL</div><div class="hdr-sub">QUIET WRITING COMPANION</div></div>
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

// ─── Pipeline ─────────────────────────────────────────────────────────────
(async () => {
  console.log('Publishing hero page…');
  const heroRes = await publish(SLUG, heroHtml, `QUILL — ${TAGLINE}`);
  console.log('Hero:', heroRes.url || `https://ram.zenbin.org/${SLUG}`);

  console.log('Publishing viewer…');
  const viewerRes = await publish(`${SLUG}-viewer`, viewerHtml, `QUILL Design Viewer`);
  console.log('Viewer:', viewerRes.url || `https://ram.zenbin.org/${SLUG}-viewer`);

  // Gallery queue
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
  const sha = fileData.sha;
  const raw = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(raw);
  if (Array.isArray(queue)) queue = { version:1, submissions:queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const entry = {
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
    theme: 'light',
    palette: '#F4EFE4,#2E7D52,#C44B2B,#FDFAF3,#1C1810',
  };

  queue.submissions.push(entry);
  queue.updated_at = new Date().toISOString();

  const encoded = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP} to gallery (heartbeat)`,
    content: encoded,
    sha,
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

  console.log('Gallery queue:', putRes.status === 200 ? 'OK ✓' : putRes.body.slice(0,120));
  console.log('\n✓ Pipeline complete');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
})();
