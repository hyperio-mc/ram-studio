'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG      = 'grit';
const APP_NAME  = 'GRIT';
const TAGLINE   = 'Strength, stripped down';
const ARCHETYPE = 'fitness-tracker';
const PROMPT    = 'Brutalist dark strength training tracker. Inspired by SiteInspire typographic trend (2052 typographic designs — #1 style category) and Godly dark developer infrastructure sites (Evervault, Linear). Heavy bold numerals as hero elements, near-black background, ember accent, zero rounded corners. PRs and weight values rendered at 56–68px.';

const P = {
  bg:       '#0B0B0B',
  surface:  '#161616',
  s2:       '#1E1E1E',
  text:     '#EDEDED',
  muted:    'rgba(237,237,237,0.38)',
  ember:    '#FF4500',
  gold:     '#FFB800',
  border:   'rgba(237,237,237,0.12)',
};

function zenPublish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'X-Subdomain': 'ram',
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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface}; --s2: ${P.s2};
    --text: ${P.text}; --muted: ${P.muted};
    --ember: ${P.ember}; --gold: ${P.gold}; --border: ${P.border};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.5; overflow-x: hidden; }

  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(11,11,11,0.95); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 56px;
  }
  .nav-brand { font-size: 15px; font-weight: 900; letter-spacing: 0.12em; color: var(--ember); text-decoration: none; }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { background: var(--ember); color: #0B0B0B; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 20px; text-decoration: none; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.85; }

  .hero {
    min-height: 100vh; padding: 140px 32px 80px;
    display: flex; flex-direction: column; justify-content: center;
    max-width: 1100px; margin: 0 auto;
    border-right: 1px solid var(--border);
  }
  .hero-overline { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ember); margin-bottom: 28px; }
  .hero-headline {
    font-size: clamp(56px, 9vw, 120px); font-weight: 900; line-height: 0.95;
    letter-spacing: -0.03em; color: var(--text);
    margin-bottom: 32px;
  }
  .hero-headline span { color: var(--ember); }
  .hero-sub { font-size: clamp(16px, 2.5vw, 22px); color: var(--muted); max-width: 560px; line-height: 1.5; margin-bottom: 48px; }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary { background: var(--ember); color: #0B0B0B; font-size: 13px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 36px; text-decoration: none; display: inline-block; transition: opacity 0.2s; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-ghost { border: 1px solid var(--border); color: var(--text); font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; display: inline-block; transition: border-color 0.2s; }
  .btn-ghost:hover { border-color: var(--ember); }
  .hero-stat { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--muted); text-transform: uppercase; }
  .hero-stat strong { color: var(--gold); font-size: 20px; font-weight: 900; display: block; }

  .numbers-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid var(--border);
    border-left: 1px solid var(--border);
  }
  .number-cell {
    padding: 40px 32px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .number-label { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .number-value { font-size: clamp(36px, 5vw, 64px); font-weight: 900; line-height: 1; color: var(--text); letter-spacing: -0.02em; }
  .number-unit { font-size: 14px; font-weight: 600; color: var(--ember); margin-left: 6px; }
  .number-change { font-size: 11px; color: var(--gold); font-weight: 700; margin-top: 8px; }

  .features {
    max-width: 1100px; margin: 0 auto; padding: 80px 32px;
    border-right: 1px solid var(--border);
  }
  .features-header { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ember); margin-bottom: 48px; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1px; background: var(--border); }
  .feature-card { background: var(--surface); padding: 36px 32px; border-top: 3px solid transparent; transition: border-color 0.2s; }
  .feature-card:hover { border-top-color: var(--ember); }
  .feature-icon { font-size: 24px; margin-bottom: 16px; }
  .feature-title { font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text); margin-bottom: 10px; }
  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  .philosophy { max-width: 1100px; margin: 0 auto; padding: 80px 32px; border-right: 1px solid var(--border); }
  .philosophy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .philosophy-label { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ember); margin-bottom: 20px; }
  .philosophy-quote { font-size: clamp(24px, 3vw, 40px); font-weight: 900; line-height: 1.1; letter-spacing: -0.02em; color: var(--text); margin-bottom: 24px; }
  .philosophy-body { font-size: 14px; color: var(--muted); line-height: 1.7; }
  .principles { display: flex; flex-direction: column; gap: 24px; }
  .principle { border-left: 3px solid var(--ember); padding: 12px 20px; }
  .principle-title { font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text); margin-bottom: 4px; }
  .principle-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }

  .cta-section {
    background: var(--ember); padding: 80px 32px; text-align: center;
  }
  .cta-title { font-size: clamp(32px, 5vw, 56px); font-weight: 900; color: #0B0B0B; letter-spacing: -0.02em; margin-bottom: 16px; }
  .cta-sub { font-size: 16px; color: rgba(11,11,11,0.65); margin-bottom: 40px; }
  .cta-links { display: flex; gap: 20px; justify-content: center; align-items: center; flex-wrap: wrap; }
  .cta-links a { font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
  .cta-primary { background: #0B0B0B; color: var(--ember); padding: 16px 36px; text-decoration: none; }
  .cta-secondary { color: rgba(11,11,11,0.75); text-decoration: underline; }

  footer { background: var(--surface); padding: 40px 32px; border-top: 1px solid var(--border); max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap: 12px; }
  .footer-brand { font-size: 13px; font-weight: 900; letter-spacing: 0.12em; color: var(--ember); }
  .footer-note { font-size: 11px; color: var(--muted); }

  @media (max-width: 768px) {
    nav { padding: 0 16px; }
    .hero { padding: 110px 16px 60px; }
    .numbers-grid { grid-template-columns: 1fr 1fr; }
    .features { padding: 60px 16px; }
    .philosophy { padding: 60px 16px; }
    .philosophy-grid { grid-template-columns: 1fr; gap: 40px; }
    .nav-links { display: none; }
    footer { flex-direction: column; gap: 12px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-brand">GRIT</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#philosophy">Method</a>
    <a href="https://ram.zenbin.org/grit-mock">Mock ☀◑</a>
  </div>
  <a href="https://ram.zenbin.org/grit-mock" class="nav-cta">Try Mock</a>
</nav>

<section class="hero">
  <p class="hero-overline">Strength Tracking · Built Different</p>
  <h1 class="hero-headline">
    Train.<br>
    <span>Lift.</span><br>
    Progress.
  </h1>
  <p class="hero-sub">GRIT strips away the noise. Numbers front and centre. Your PRs, your volume, your recovery — all in a brutally honest interface.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/grit-mock" class="btn-primary">Try Interactive Mock</a>
    <a href="#features" class="btn-ghost">See Features</a>
    <div style="margin-left: 16px; display: flex; gap: 32px; flex-wrap: wrap;">
      <div class="hero-stat"><strong>124</strong>Sessions tracked</div>
      <div class="hero-stat"><strong>284k</strong>kg lifted</div>
      <div class="hero-stat"><strong>87%</strong>Consistency rate</div>
    </div>
  </div>
</section>

<section class="numbers-grid">
  <div class="number-cell">
    <div class="number-label">Bench Press · 1RM Est.</div>
    <div class="number-value">115<span class="number-unit">kg</span></div>
    <div class="number-change">↑ 15 kg in 90 days</div>
  </div>
  <div class="number-cell">
    <div class="number-label">Squat · 1RM Est.</div>
    <div class="number-value">145<span class="number-unit">kg</span></div>
    <div class="number-change">↑ 25 kg in 90 days</div>
  </div>
  <div class="number-cell">
    <div class="number-label">Deadlift · 1RM Est.</div>
    <div class="number-value">185<span class="number-unit">kg</span></div>
    <div class="number-change">↑ 35 kg in 90 days</div>
  </div>
  <div class="number-cell">
    <div class="number-label">Total Volume · This Week</div>
    <div class="number-value">24<span class="number-unit">K kg</span></div>
    <div class="number-change">↑ 12% from last week</div>
  </div>
  <div class="number-cell">
    <div class="number-label">Recovery Score · Today</div>
    <div class="number-value">87<span class="number-unit">/100</span></div>
    <div class="number-change">Ready to push hard</div>
  </div>
  <div class="number-cell">
    <div class="number-label">Sessions · Last 30 Days</div>
    <div class="number-value">19<span class="number-unit"></span></div>
    <div class="number-change">5 new PRs set</div>
  </div>
</section>

<section class="features" id="features">
  <p class="features-header">What GRIT Tracks</p>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <div class="feature-title">Live Session</div>
      <div class="feature-desc">Log sets in real time. See your previous best beside every set. Auto-detects when you're chasing a PR.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📈</div>
      <div class="feature-title">Auto Progression</div>
      <div class="feature-desc">Programmes that adapt. Linear, wave, or block periodisation — GRIT advances your weights based on your logged performance.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🏆</div>
      <div class="feature-title">Personal Records</div>
      <div class="feature-desc">Every PR is stamped with date, bodyweight, and context. Your timeline of strength is a document of who you're becoming.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔋</div>
      <div class="feature-title">Recovery Intelligence</div>
      <div class="feature-desc">HRV, sleep, soreness — combined into a single readiness score. GRIT tells you when to push and when to back off.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">📊</div>
      <div class="feature-title">Volume Tracking</div>
      <div class="feature-desc">Per-muscle-group weekly volume. Ensure you're hitting evidence-based targets without overreaching.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🗓</div>
      <div class="feature-title">Consistency Map</div>
      <div class="feature-desc">Streaks, heatmaps, session history. The long view of your commitment, rendered with brutal clarity.</div>
    </div>
  </div>
</section>

<section class="philosophy" id="philosophy">
  <div class="philosophy-grid">
    <div>
      <p class="philosophy-label">The Method</p>
      <h2 class="philosophy-quote">The bar doesn't care about your interface.</h2>
      <p class="philosophy-body">Most fitness apps bury your data under celebrations, streaks, and social noise. GRIT is built on the belief that a great training app should feel like a great training environment — stark, purposeful, and completely focused on the work.</p>
    </div>
    <div class="principles">
      <div class="principle">
        <div class="principle-title">Numbers First</div>
        <div class="principle-desc">Weight, reps, and PRs rendered large. Not buried in modals. Not hidden behind charts. They are the design.</div>
      </div>
      <div class="principle">
        <div class="principle-title">Zero Friction</div>
        <div class="principle-desc">Three taps to log a set. The interface steps back. You're training, not navigating.</div>
      </div>
      <div class="principle">
        <div class="principle-title">Earned Progress</div>
        <div class="principle-desc">No gamification. No points. Your progress is your progress — visible, measurable, honest.</div>
      </div>
      <div class="principle">
        <div class="principle-title">Dark by Design</div>
        <div class="principle-desc">Gym lighting is dim. Your phone screen shouldn't be a flashlight. GRIT is built for the environment you're actually in.</div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2 class="cta-title">Start your first session.</h2>
  <p class="cta-sub">No setup required. Log your first set in 30 seconds.</p>
  <div class="cta-links">
    <a href="https://ram.zenbin.org/grit-mock" class="cta-primary">Try Interactive Mock</a>
    <a href="https://ram.zenbin.org/grit-mock" class="cta-secondary">Explore light/dark toggle ☀◑</a>
  </div>
</section>

<footer style="max-width:1100px; margin:0 auto; padding:32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; border-top:1px solid var(--border);">
  <span class="footer-brand">GRIT</span>
  <span class="footer-note">RAM Design Studio · ram.zenbin.org</span>
  <span class="footer-note">Dark mode · Brutalist · Typographic</span>
</footer>

</body>
</html>`;
}

(async () => {
  const html = buildHeroHtml();
  console.log('Publishing hero page to ram.zenbin.org/' + SLUG + ' …');
  const res = await zenPublish(SLUG, html, APP_NAME + ' — ' + TAGLINE);
  console.log('Hero page:', res.status, res.status === 201 ? '✓ Created' : res.status === 200 ? '✓ Updated' : res.body.slice(0, 120));

  if (res.status === 403 && res.body.includes('maximum')) {
    console.error('⚠ ZenBin 100-page cap hit. Delete stale pages first.');
    process.exit(1);
  }

  // Update gallery queue
  const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));
  const TOKEN = config.GITHUB_TOKEN;
  const REPO  = config.GITHUB_REPO;

  const getRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData = JSON.parse(getRes.body);
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
    theme:        'dark',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: fileData.sha,
  });
  const putRes = await ghReq({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);

  if (putRes.status === 200 || putRes.status === 201) {
    console.log('Gallery queue updated ✓ —', queue.submissions.length, 'designs total');
  } else {
    console.error('Gallery queue error:', putRes.status, putRes.body.slice(0, 120));
  }

  console.log('\nLive at: https://ram.zenbin.org/' + SLUG);
})();
