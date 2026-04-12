'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG      = 'flint';
const APP_NAME  = 'Flint';
const TAGLINE   = 'PR review load, made legible';
const ARCHETYPE = 'developer-tools';
const PROMPT    = 'Inspired by Factory (minimal.gallery SAAS, Mar 25 2026) — clean white developer tooling UI with structured tabular data — and Sort\'s left-rule status row pattern. Combined with editorial bold typography from Lucci Lambrusco (siteinspire.com). Light-theme PR review workload tracker for engineering leads: queue health, reviewer capacity, cycle time velocity, and blocker triage.';

const config       = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const P = {
  bg:         '#F6F4F0',
  surface:    '#FFFFFF',
  text:       '#141210',
  textSub:    '#7A7670',
  accent:     '#2C5EE8',
  accentLt:   '#EEF2FD',
  coral:      '#E05C3A',
  coralLt:    '#FDF0EC',
  green:      '#2BAD7B',
  greenLt:    '#E8F7F2',
  yellow:     '#D4870A',
  border:     '#E4E0DA',
};

function zenPublish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}?overwrite=true`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': payload.length,
        'X-Subdomain':    'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
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

function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface};
    --text: ${P.text}; --sub: ${P.textSub};
    --accent: ${P.accent}; --accentLt: ${P.accentLt};
    --coral: ${P.coral}; --coralLt: ${P.coralLt};
    --green: ${P.green}; --greenLt: ${P.greenLt};
    --yellow: ${P.yellow};
    --border: ${P.border};
  }
  html { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); scroll-behavior: smooth; }
  body { min-height: 100vh; }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(246,244,240,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
  }
  .nav-brand { font-size: 18px; font-weight: 900; letter-spacing: -0.02em; color: var(--text); }
  .nav-brand span { color: var(--accent); }
  .nav-links { display: flex; gap: 28px; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--sub); text-decoration: none; }
  .nav-cta {
    background: var(--accent); color: #fff; font-size: 13px; font-weight: 600;
    padding: 8px 20px; border-radius: 8px; text-decoration: none;
  }

  /* HERO */
  .hero {
    padding: 140px 40px 80px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accentLt); color: var(--accent);
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    padding: 6px 14px; border-radius: 100px;
    margin-bottom: 24px;
  }
  .hero-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
  h1 {
    font-size: clamp(36px, 5vw, 60px); font-weight: 900;
    line-height: 1.05; letter-spacing: -0.03em;
    margin-bottom: 20px;
  }
  h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: 17px; color: var(--sub); line-height: 1.6;
    max-width: 420px; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; }
  .btn-primary {
    background: var(--accent); color: #fff;
    font-size: 14px; font-weight: 700;
    padding: 14px 28px; border-radius: 10px; text-decoration: none;
    display: inline-block;
  }
  .btn-secondary {
    color: var(--text); font-size: 14px; font-weight: 600;
    text-decoration: none; display: flex; align-items: center; gap: 6px;
  }

  /* HERO DEVICE MOCKUP */
  .hero-device {
    background: var(--surface);
    border-radius: 20px;
    border: 1px solid var(--border);
    padding: 20px;
    box-shadow: 0 24px 80px rgba(20,18,16,0.10);
    position: relative;
  }
  .device-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .device-title { font-size: 15px; font-weight: 700; }
  .device-badge {
    background: var(--coralLt); color: var(--coral);
    font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 100px;
  }
  .pr-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid var(--border);
    position: relative; padding-left: 10px;
  }
  .pr-row::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; border-radius: 2px;
  }
  .pr-row.blocked::before { background: var(--coral); }
  .pr-row.review::before  { background: var(--accent); }
  .pr-row.approved::before { background: var(--green); }
  .pr-row.stale::before { background: var(--yellow); }
  .pr-info { flex: 1; }
  .pr-title { font-size: 12px; font-weight: 600; margin-bottom: 3px; }
  .pr-meta  { font-size: 10px; color: var(--sub); }
  .pr-chip {
    font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 100px;
    white-space: nowrap; margin-top: 4px; display: inline-block;
  }
  .pr-chip.blocked { background: var(--coralLt); color: var(--coral); }
  .pr-chip.review  { background: var(--accentLt); color: var(--accent); }
  .pr-chip.approved { background: var(--greenLt); color: var(--green); }
  .pr-chip.stale   { background: #FEF7E8; color: var(--yellow); }
  .pr-age { font-size: 10px; color: var(--sub); white-space: nowrap; }

  /* METRICS STRIP */
  .metrics {
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 48px 40px;
  }
  .metrics-inner {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
    background: var(--border);
  }
  .metric-cell {
    background: var(--surface);
    padding: 32px 28px;
  }
  .metric-num {
    font-size: 44px; font-weight: 900; letter-spacing: -0.03em;
    margin-bottom: 4px;
  }
  .metric-num.blue   { color: var(--accent); }
  .metric-num.coral  { color: var(--coral);  }
  .metric-num.green  { color: var(--green);  }
  .metric-num.yellow { color: var(--yellow); }
  .metric-label { font-size: 12px; color: var(--sub); font-weight: 500; }

  /* FEATURES */
  .features { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .features-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    color: var(--sub); margin-bottom: 40px;
  }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: var(--border); }
  .feature-card {
    background: var(--surface); padding: 32px;
  }
  .feature-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 20px;
  }
  .feature-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc  { font-size: 13px; color: var(--sub); line-height: 1.6; }

  /* CAPACITY VISUAL */
  .capacity-section { padding: 80px 40px; background: var(--text); color: #fff; }
  .capacity-inner { max-width: 900px; margin: 0 auto; }
  .cap-heading { font-size: 36px; font-weight: 900; margin-bottom: 8px; letter-spacing: -0.02em; }
  .cap-sub { font-size: 15px; color: rgba(255,255,255,0.5); margin-bottom: 48px; }
  .cap-bar-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .cap-name { font-size: 13px; font-weight: 600; width: 80px; color: rgba(255,255,255,0.85); }
  .cap-bar-bg { flex: 1; height: 20px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
  .cap-bar-fill { height: 100%; border-radius: 4px; }
  .cap-count { font-size: 12px; font-weight: 700; width: 30px; text-align: right; }
  .cap-bar-fill.over   { background: var(--coral); }
  .cap-bar-fill.high   { background: var(--yellow); }
  .cap-bar-fill.ok     { background: var(--accent); }

  /* CTA */
  .cta-section { padding: 100px 40px; text-align: center; }
  .cta-section h2 { font-size: 40px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 16px; }
  .cta-section p { font-size: 16px; color: var(--sub); margin-bottom: 36px; }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border); padding: 28px 40px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: var(--sub);
  }
  footer strong { color: var(--text); font-weight: 700; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 100px 20px 48px; }
    .metrics-inner { grid-template-columns: repeat(2, 1fr); }
    .features-grid { grid-template-columns: 1fr; }
    nav { padding: 0 20px; }
    .nav-links { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-brand">FLI<span>N</span>T</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#team">Team View</a>
    <a href="#velocity">Velocity</a>
  </div>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="nav-cta">See mock →</a>
</nav>

<section class="hero">
  <div class="hero-content">
    <div class="hero-tag">Developer Tooling</div>
    <h1>PR load,<br><em>made legible.</em></h1>
    <p class="hero-sub">
      Flint gives engineering leads a clear view of who's blocked, who's overloaded,
      and where cycle time is leaking — before it becomes a sprint retrospective agenda item.
    </p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/${SLUG}-viewer" class="btn-primary">View design</a>
      <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-secondary">Interactive mock ↗</a>
    </div>
  </div>

  <div class="hero-device">
    <div class="device-header">
      <div class="device-title">PR Queue · Today</div>
      <div class="device-badge">6 BLOCKED</div>
    </div>
    ${[
      { title: 'refactor: auth middleware cleanup', repo: 'api-core · priya', status: 'blocked', age: '4d' },
      { title: 'feat: webhook retry with backoff',  repo: 'events · carlos',  status: 'review',  age: '2d' },
      { title: 'fix: race condition in job queue',  repo: 'workers · mei',    status: 'stale',   age: '6d' },
      { title: 'feat: multi-tenant org switching',  repo: 'app · jordan',     status: 'review',  age: '1d' },
      { title: 'chore: update eslint to v9',        repo: 'shared · priya',   status: 'approved',age: '3d' },
    ].map(pr => `
    <div class="pr-row ${pr.status}">
      <div class="pr-info">
        <div class="pr-title">${pr.title}</div>
        <div class="pr-meta">${pr.repo}</div>
        <span class="pr-chip ${pr.status}">${pr.status.toUpperCase()}</span>
      </div>
      <div class="pr-age">${pr.age}</div>
    </div>`).join('')}
  </div>
</section>

<section class="metrics">
  <div class="metrics-inner">
    <div class="metric-cell">
      <div class="metric-num blue">34</div>
      <div class="metric-label">Open Pull Requests</div>
    </div>
    <div class="metric-cell">
      <div class="metric-num yellow">3.2d</div>
      <div class="metric-label">Avg. Cycle Time</div>
    </div>
    <div class="metric-cell">
      <div class="metric-num coral">6</div>
      <div class="metric-label">Blocked PRs</div>
    </div>
    <div class="metric-cell">
      <div class="metric-num green">↑24%</div>
      <div class="metric-label">Merge Rate (vs. last week)</div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="features-label">WHAT FLINT DOES</div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.accentLt}">📋</div>
      <div class="feature-title">Queue visibility</div>
      <div class="feature-desc">Every open PR with status, age, author, and repo at a glance. Left-rule color coding shows blocked vs reviewing vs approved instantly.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.greenLt}">👥</div>
      <div class="feature-title">Team capacity</div>
      <div class="feature-desc">Per-reviewer load bars show who's overloaded before they tell you. Utilisation alerts surface redistribution opportunities automatically.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.coralLt}">⚡</div>
      <div class="feature-title">Blocker triage</div>
      <div class="feature-desc">One screen, six blockers, one action. Notify all reviewers in a single tap. No digging through GitHub notification settings.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:#FEF7E8">📈</div>
      <div class="feature-title">Cycle time velocity</div>
      <div class="feature-desc">Scatter plot + weekly merge throughput reveals patterns in your pipeline. Median, p75, p95 cycle time tracked automatically.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.accentLt}">🔔</div>
      <div class="feature-title">Stale PR detection</div>
      <div class="feature-desc">PRs older than 7 days surface automatically. Configurable thresholds send Slack nudges before PRs become ancient history.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon" style="background:${P.greenLt}">⏱</div>
      <div class="feature-title">First-review time</div>
      <div class="feature-desc">Track time from PR open to first review comment. The single metric that correlates most strongly with developer satisfaction.</div>
    </div>
  </div>
</section>

<section class="capacity-section" id="team">
  <div class="capacity-inner">
    <div class="cap-heading">Know who's at capacity.<br>Before they are.</div>
    <div class="cap-sub">Real-time reviewer load across your team — updated as PRs open, merge, and get assigned.</div>

    ${[
      { name: 'Priya K.',  pct: 92, total: 12, cls: 'over' },
      { name: 'Carlos M.', pct: 84, total: 11, cls: 'high' },
      { name: 'Aisha R.',  pct: 62, total:  8, cls: 'ok'   },
      { name: 'Mei L.',    pct: 46, total:  6, cls: 'ok'   },
      { name: 'Jordan T.', pct: 38, total:  5, cls: 'ok'   },
      { name: 'Dev P.',    pct: 15, total:  2, cls: 'ok'   },
    ].map(r => `
    <div class="cap-bar-row">
      <div class="cap-name">${r.name}</div>
      <div class="cap-bar-bg">
        <div class="cap-bar-fill ${r.cls}" style="width:${r.pct}%"></div>
      </div>
      <div class="cap-count" style="color:${r.cls === 'over' ? P.coral : r.cls === 'high' ? P.yellow : P.green}">${r.total}</div>
    </div>`).join('')}
  </div>
</section>

<section class="cta-section">
  <h2>Ship faster. Unblock faster.</h2>
  <p>Designed for engineering leads who want fewer surprises in sprint reviews.</p>
  <a href="https://ram.zenbin.org/${SLUG}-mock" class="btn-primary" style="font-size:16px;padding:16px 36px">Explore interactive mock</a>
</section>

<footer>
  <div><strong>FLINT</strong> — ${TAGLINE}</div>
  <div>RAM Design Studio · ram.zenbin.org/${SLUG} · Mar 2026</div>
</footer>

</body>
</html>`;
}

function buildViewerHtml() {
  const penJson = fs.readFileSync('/workspace/group/design-studio/flint.pen', 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;

  return fetch('https://pencil.dev/viewer.html')
    .then(r => r.text())
    .catch(() => {
      // Fallback minimal viewer
      return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Flint — Viewer</title>
<style>
  body { margin:0; background:#E4E0DA; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:Inter,sans-serif; }
  .msg { text-align:center; color:#7A7670; }
  h2 { color:#141210; font-size:24px; margin-bottom:8px; }
</style></head><body>
<div class="msg"><h2>FLINT</h2><p>PR review load, made legible</p><p style="margin-top:16px;font-size:12px">Design viewer — pencil.dev format v2.8</p></div>
</body></html>`;
    })
    .then(html => {
      if (html.includes('<script>')) {
        return html.replace('<script>', injection + '\n<script>');
      }
      return injection + html;
    });
}

async function main() {
  console.log('Building hero page...');
  const heroHtml  = buildHeroHtml();
  const r1 = await zenPublish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log(`Hero → ${r1.status === 200 ? 'OK' : r1.body.slice(0,80)}`);

  console.log('Building viewer page...');
  const viewerHtml = await buildViewerHtml();
  const r2 = await zenPublish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Design Viewer`);
  console.log(`Viewer → ${r2.status === 200 ? 'OK' : r2.body.slice(0,80)}`);

  // GitHub gallery queue
  console.log('Updating gallery queue...');
  const getRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData     = JSON.parse(getRes.body);
  const currentSha   = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           `heartbeat-${SLUG}-${Date.now()}`,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      TAGLINE,
    archetype:    ARCHETYPE,
    design_url:   `https://ram.zenbin.org/${SLUG}`,
    mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit:       'RAM Design Heartbeat',
    prompt:       PROMPT,
    screens:      5,
    source:       'heartbeat',
    theme:        'light',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody    = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha:     currentSha,
  });

  const putRes = await ghReq({
    hostname: 'api.github.com',
    path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
    method:   'PUT',
    headers: {
      'Authorization':  `token ${GITHUB_TOKEN}`,
      'User-Agent':     'ram-heartbeat/1.0',
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept':         'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`Gallery queue → ${putRes.status === 200 ? 'OK' : putRes.body.slice(0,100)}`);

  console.log(`\n✓ Done`);
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`  Mock:   https://ram.zenbin.org/${SLUG}-mock`);
}

main().catch(console.error);
