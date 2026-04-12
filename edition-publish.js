// edition-publish.js — EDITION: Your Morning Edition
// Newsletter reader with editorial magazine aesthetics
// Inspired by QP Magazine & PW Magazine on Siteinspire + MUTI Daily Essentials on Dribbble

const https = require('https');
const fs    = require('fs');

const SLUG      = 'edition';
const APP_NAME  = 'EDITION';
const TAGLINE   = 'your morning edition.';
const ARCHETYPE = 'newsletter-reader';
const ZENBIN_SUBDOMAIN = 'ram';
const ORIGINAL_PROMPT  = 'Editorial newsletter reader app. Light warm parchment (#F6F2EB) + deep editorial green (#2C5F4E) + warm amber (#C17F2A). Inspired by QP Magazine and PW Magazine on Siteinspire (editorial type-led design, typographic grid) + MUTI Daily Essentials popular shot on Dribbble (warm approachable everyday quality). Serif typography as primary design element, magazine-style card layouts, five screens: Today (dated masthead + featured story card + inbox stories), Discover (category pills + editor picks cards + trending topics numbered list), Reading (article view with pull quote + progress bar + font controls), Library (subscriptions list with unread badges), Profile (stats + weekly reading bar chart + preferences).';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const TOKEN  = config.GITHUB_TOKEN;
const REPO   = config.GITHUB_REPO;

function zenPublish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug + '?overwrite=true',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Subdomain': ZENBIN_SUBDOMAIN,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

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

const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EDITION — Your Morning Edition</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:        #F6F2EB;
    --surface:   #FFFFFF;
    --accent:    #2C5F4E;
    --accent2:   #C17F2A;
    --text:      #1A1614;
    --muted:     #8A8178;
    --line:      #E2DDD5;
    --light-g:   #E4EDE9;
    --light-a:   #FAF0E0;
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Georgia', serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }
  /* ── Masthead ── */
  .masthead {
    width: 100%;
    background: var(--surface);
    border-bottom: 1px solid var(--line);
    padding: 0 40px;
  }
  .mast-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
  }
  .mast-brand { font-size: 13px; letter-spacing: 3.5px; font-weight: 700; color: var(--accent); font-family: 'Inter', sans-serif; }
  .mast-date { font-size: 13px; color: var(--muted); font-family: 'Inter', sans-serif; }
  .mast-cta {
    background: var(--accent); color: #FFF;
    font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 600;
    padding: 8px 20px; border-radius: 100px; text-decoration: none;
    letter-spacing: 0.3px;
  }
  /* ── Hero ── */
  .hero {
    max-width: 1100px; margin: 0 auto;
    padding: 80px 40px 60px;
    border-bottom: 2px solid var(--accent2);
  }
  .hero-kicker {
    font-size: 11px; letter-spacing: 3px; color: var(--accent2);
    font-family: 'Inter', sans-serif; font-weight: 700;
    text-transform: uppercase; margin-bottom: 20px;
  }
  .hero-headline {
    font-size: clamp(42px, 6vw, 72px);
    line-height: 1.05;
    font-weight: 700;
    color: var(--text);
    max-width: 780px;
    margin-bottom: 24px;
    letter-spacing: -1px;
  }
  .hero-headline em {
    font-style: italic; color: var(--accent);
  }
  .hero-sub {
    font-size: 18px; color: var(--muted);
    max-width: 560px; line-height: 1.65;
    font-family: 'Inter', sans-serif; margin-bottom: 40px;
  }
  .hero-ctas { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #FFF;
    padding: 14px 32px; border-radius: 100px;
    font-size: 14px; font-family: 'Inter', sans-serif; font-weight: 700;
    text-decoration: none; display: inline-block;
    letter-spacing: 0.2px;
  }
  .btn-secondary {
    color: var(--accent); border: 1.5px solid var(--accent);
    padding: 13px 28px; border-radius: 100px;
    font-size: 14px; font-family: 'Inter', sans-serif; font-weight: 600;
    text-decoration: none; display: inline-block;
  }
  /* ── Features bar ── */
  .features-bar {
    background: var(--accent);
    padding: 18px 40px;
  }
  .features-bar-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; gap: 40px; flex-wrap: wrap;
  }
  .feat-item { display: flex; align-items: center; gap: 10px; }
  .feat-item .icon { font-size: 16px; }
  .feat-item .label {
    font-size: 13px; color: rgba(255,255,255,0.85);
    font-family: 'Inter', sans-serif; font-weight: 500;
  }
  /* ── Screens section ── */
  .screens-section {
    max-width: 1100px; margin: 0 auto;
    padding: 80px 40px;
  }
  .section-kicker {
    font-size: 11px; letter-spacing: 3px; color: var(--muted);
    font-family: 'Inter', sans-serif; font-weight: 700;
    text-transform: uppercase; margin-bottom: 16px;
  }
  .section-title {
    font-size: clamp(28px, 4vw, 42px); font-weight: 700;
    margin-bottom: 10px; letter-spacing: -0.5px;
  }
  .section-sub {
    font-size: 16px; color: var(--muted);
    font-family: 'Inter', sans-serif;
    margin-bottom: 52px; max-width: 520px;
  }
  .screens-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }
  .screen-card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 28px 22px;
  }
  .screen-num {
    font-size: 11px; letter-spacing: 2px; color: var(--accent2);
    font-family: 'Inter', sans-serif; font-weight: 700;
    margin-bottom: 10px;
  }
  .screen-name {
    font-size: 18px; font-weight: 700; margin-bottom: 6px;
    color: var(--text);
  }
  .screen-desc {
    font-size: 13px; color: var(--muted);
    font-family: 'Inter', sans-serif; line-height: 1.5;
  }
  /* ── Editorial principles ── */
  .principles {
    background: var(--surface);
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    padding: 80px 40px;
  }
  .principles-inner { max-width: 1100px; margin: 0 auto; }
  .principles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 48px;
    margin-top: 48px;
  }
  .principle { border-top: 2px solid var(--line); padding-top: 20px; }
  .principle.featured { border-top-color: var(--accent2); }
  .principle-num {
    font-size: 11px; color: var(--accent2); font-weight: 700;
    letter-spacing: 2px; font-family: 'Inter', sans-serif;
    margin-bottom: 12px;
  }
  .principle-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
  .principle-body { font-size: 14px; color: var(--muted); font-family: 'Inter', sans-serif; line-height: 1.6; }
  /* ── Pull quote ── */
  .pull-quote {
    max-width: 1100px; margin: 0 auto;
    padding: 80px 40px;
    border-bottom: 1px solid var(--line);
  }
  .pull-quote-inner {
    background: var(--light-a);
    border-left: 4px solid var(--accent2);
    border-radius: 0 10px 10px 0;
    padding: 36px 40px;
    max-width: 700px;
  }
  .pull-quote blockquote {
    font-size: 22px; line-height: 1.4; font-style: italic;
    margin-bottom: 16px;
  }
  .pull-quote cite {
    font-size: 12px; color: var(--muted);
    font-family: 'Inter', sans-serif; font-style: normal;
    letter-spacing: 0.5px;
  }
  /* ── Palette ── */
  .palette-section {
    max-width: 1100px; margin: 0 auto;
    padding: 60px 40px 80px;
  }
  .palette-row {
    display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px;
  }
  .swatch {
    border-radius: 10px; overflow: hidden;
    width: 140px;
  }
  .swatch-color { height: 64px; }
  .swatch-label {
    padding: 10px 14px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-top: none;
    border-radius: 0 0 10px 10px;
  }
  .swatch-name {
    font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 600;
    color: var(--text);
  }
  .swatch-hex { font-size: 10px; color: var(--muted); font-family: monospace; margin-top: 2px; }
  /* ── Footer ── */
  footer {
    background: var(--accent);
    padding: 48px 40px;
  }
  .footer-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: gap;
  }
  .footer-brand { font-size: 20px; font-weight: 700; color: #FFF; letter-spacing: 2px; }
  .footer-brand span { display: block; font-size: 11px; color: rgba(255,255,255,0.5); font-family: 'Inter', sans-serif; font-weight: 400; letter-spacing: 0.5px; margin-top: 4px; }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { color: rgba(255,255,255,0.7); font-family: 'Inter', sans-serif; font-size: 13px; text-decoration: none; }
  .footer-links a:hover { color: #FFF; }
  .footer-credit { font-size: 11px; color: rgba(255,255,255,0.45); font-family: 'Inter', sans-serif; text-align: right; }
</style>
</head>
<body>

<div class="masthead">
  <div class="mast-inner">
    <div class="mast-brand">EDITION</div>
    <div class="mast-date">Saturday, April 4, 2026</div>
    <a href="https://ram.zenbin.org/edition-viewer" class="mast-cta">View Prototype →</a>
  </div>
</div>

<section class="hero">
  <div class="hero-kicker">Newsletter Reader · Editorial Design</div>
  <h1 class="hero-headline">Your <em>morning edition</em>,<br>beautifully curated.</h1>
  <p class="hero-sub">EDITION brings the pleasure of print journalism to your newsletter inbox. Editorial typography, curated discovery, distraction-free reading.</p>
  <div class="hero-ctas">
    <a href="https://ram.zenbin.org/edition-viewer" class="btn-primary">View Prototype</a>
    <a href="https://ram.zenbin.org/edition-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</section>

<div class="features-bar">
  <div class="features-bar-inner">
    <div class="feat-item"><span class="icon">📰</span><span class="label">Dated masthead — today's edition</span></div>
    <div class="feat-item"><span class="icon">✦</span><span class="label">Editorial serif typography</span></div>
    <div class="feat-item"><span class="icon">◈</span><span class="label">Pull-quote reading mode</span></div>
    <div class="feat-item"><span class="icon">↑</span><span class="label">47-day reading streak</span></div>
    <div class="feat-item"><span class="icon">⊕</span><span class="label">Curated discovery engine</span></div>
  </div>
</div>

<section class="screens-section">
  <div class="section-kicker">Five Screens</div>
  <h2 class="section-title">From inbox to insight.</h2>
  <p class="section-sub">A complete reading experience — from morning curation to deep-focus reading.</p>
  <div class="screens-grid">
    <div class="screen-card">
      <div class="screen-num">01</div>
      <div class="screen-name">Today</div>
      <div class="screen-desc">Dated masthead, featured story card, your inbox sorted by relevance.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">02</div>
      <div class="screen-name">Discover</div>
      <div class="screen-desc">Editor's picks, category browse, trending topics with story counts.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">03</div>
      <div class="screen-name">Reading</div>
      <div class="screen-desc">Article view with pull quotes, serif body type, progress bar, font controls.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">04</div>
      <div class="screen-name">Library</div>
      <div class="screen-desc">All subscriptions with unread counts, offline downloads, quick access.</div>
    </div>
    <div class="screen-card">
      <div class="screen-num">05</div>
      <div class="screen-name">Profile</div>
      <div class="screen-desc">47-day streak, weekly bar chart, 312 articles read, reading preferences.</div>
    </div>
  </div>
</section>

<section class="principles">
  <div class="principles-inner">
    <div class="section-kicker">Design Principles</div>
    <h2 class="section-title">Built for the serious reader.</h2>
    <div class="principles-grid">
      <div class="principle featured">
        <div class="principle-num">01</div>
        <div class="principle-title">Editorial First</div>
        <div class="principle-body">Georgia serif as the primary typeface — a first for this design series. Every headline commands attention without shouting.</div>
      </div>
      <div class="principle">
        <div class="principle-num">02</div>
        <div class="principle-title">Warm, Not White</div>
        <div class="principle-body">Parchment #F6F2EB instead of pure white. Reduces eye strain and evokes the warmth of printed paper.</div>
      </div>
      <div class="principle">
        <div class="principle-num">03</div>
        <div class="principle-title">Numbered Moments</div>
        <div class="principle-body">Amber rule lines, numbered trending topics, dated mastheads — each detail borrowed from print magazine grammar.</div>
      </div>
      <div class="principle">
        <div class="principle-num">04</div>
        <div class="principle-title">Pull Quotes</div>
        <div class="principle-body">The reading screen features a highlighted pull quote on amber background — turning long-form into skimmable without sacrificing depth.</div>
      </div>
    </div>
  </div>
</section>

<div class="pull-quote">
  <div class="pull-quote-inner">
    <blockquote>"Readers aren't fleeing journalism — they're fleeing noise."</blockquote>
    <cite>— EDITION Design Principle · RAM, April 2026</cite>
  </div>
</div>

<section class="palette-section">
  <div class="section-kicker">Palette</div>
  <h2 class="section-title">Parchment, forest, amber.</h2>
  <div class="palette-row">
    <div class="swatch">
      <div class="swatch-color" style="background:#F6F2EB"></div>
      <div class="swatch-label">
        <div class="swatch-name">Parchment</div>
        <div class="swatch-hex">#F6F2EB</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#2C5F4E"></div>
      <div class="swatch-label">
        <div class="swatch-name">Forest</div>
        <div class="swatch-hex">#2C5F4E</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#C17F2A"></div>
      <div class="swatch-label">
        <div class="swatch-name">Amber</div>
        <div class="swatch-hex">#C17F2A</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#FFFFFF; border: 1px solid #E2DDD5;"></div>
      <div class="swatch-label">
        <div class="swatch-name">Surface</div>
        <div class="swatch-hex">#FFFFFF</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background:#8A8178"></div>
      <div class="swatch-label">
        <div class="swatch-name">Warm Muted</div>
        <div class="swatch-hex">#8A8178</div>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="footer-inner">
    <div class="footer-brand">
      EDITION
      <span>Your Morning Edition</span>
    </div>
    <div class="footer-links">
      <a href="https://ram.zenbin.org/edition-viewer">Prototype</a>
      <a href="https://ram.zenbin.org/edition-mock">Interactive Mock</a>
    </div>
    <div class="footer-credit">
      RAM Design Heartbeat<br>
      April 4, 2026
    </div>
  </div>
</footer>

</body>
</html>`;

function buildViewer(penJson) {
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EDITION — Prototype Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F6F2EB; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: 'Inter', sans-serif; }
  header { width: 100%; background: #FFF; border-bottom: 1px solid #E2DDD5; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
  .hdr-brand { font-size: 13px; font-weight: 700; color: #2C5F4E; letter-spacing: 3px; font-family: 'Inter', sans-serif; }
  .hdr-sub { font-size: 10px; color: #8A8178; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; }
  .hdr-link { font-size: 12px; color: #2C5F4E; text-decoration: none; font-weight: 700; }
  #pencil-viewer { width: 100%; flex: 1; border: none; min-height: 600px; }
</style>
</head>
<body>
<header>
  <div>
    <div class="hdr-brand">EDITION</div>
    <div class="hdr-sub">Your Morning Edition</div>
  </div>
  <a href="https://ram.zenbin.org/edition" class="hdr-link">← Overview</a>
</header>
<script>EMBEDDED_PEN_PLACEHOLDER</script>
<script src="https://pencil.dev/viewer.js"></script>
<div id="pencil-viewer"></div>
<script>
  if (window.PencilViewer && window.EMBEDDED_PEN) {
    PencilViewer.init('#pencil-viewer', { pen: JSON.parse(window.EMBEDDED_PEN) });
  }
</script>
</body>
</html>`;
  const injection = 'window.EMBEDDED_PEN = ' + JSON.stringify(penJson) + ';';
  viewerHtml = viewerHtml.replace('EMBEDDED_PEN_PLACEHOLDER', injection);
  return viewerHtml;
}

(async () => {
  console.log('── EDITION Publish Pipeline ──');

  console.log('Publishing hero page...');
  const heroRes = await zenPublish(SLUG, heroHtml, 'EDITION — Your Morning Edition');
  console.log('Hero:', heroRes.status, heroRes.body.slice(0, 80));

  const penJson = fs.readFileSync('/workspace/group/design-studio/edition.pen', 'utf8');
  const viewerHtml = buildViewer(penJson);
  console.log('Publishing viewer...');
  const viewerRes = await zenPublish(SLUG + '-viewer', viewerHtml, 'EDITION — Prototype Viewer');
  console.log('Viewer:', viewerRes.status, viewerRes.body.slice(0, 80));

  console.log('Updating gallery queue...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: '/repos/' + REPO + '/contents/queue.json',
    method: 'GET',
    headers: { 'Authorization': 'token ' + TOKEN, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: 'heartbeat-' + SLUG + '-' + Date.now(),
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: 'https://ram.zenbin.org/' + SLUG,
    mock_url: 'https://ram.zenbin.org/' + SLUG + '-mock',
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: 'add: ' + APP_NAME + ' to gallery (heartbeat)',
    content: newContent,
    sha: currentSha
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: '/repos/' + REPO + '/contents/queue.json',
    method: 'PUT',
    headers: {
      'Authorization': 'token ' + TOKEN,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json'
    },
  }, putBody);
  console.log('Gallery queue:', putRes.status === 200 ? 'OK (' + queue.submissions.length + ' total)' : putRes.body.slice(0, 120));

  try {
    const { openDB, upsertDesign, rebuildEmbeddings } = await import('./design-db.mjs');
    const db = openDB();
    upsertDesign(db, newEntry);
    rebuildEmbeddings(db);
    console.log('Indexed in design DB');
  } catch (e) {
    console.log('Design DB skipped:', e.message);
  }

  console.log('');
  console.log('Hero:   https://ram.zenbin.org/edition');
  console.log('Viewer: https://ram.zenbin.org/edition-viewer');
  console.log('Mock:   https://ram.zenbin.org/edition-mock');
})();
