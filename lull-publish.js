'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG      = 'lull';
const APP_NAME  = 'LULL';
const TAGLINE   = 'A space to arrive in yourself';
const ARCHETYPE = 'mindfulness-journal';
const PROMPT    = 'Calm daily reflection and mindfulness journal. Inspired by lapa.ninja health/fitness category (Dawn — evidence-based AI for mental health; Super Chill — a fresh and calm mind) and minimal.gallery editorial aesthetic (KO Collective, Old Tom Capital). Light warm palette: off-white #F7F4EF, sage green #5A7856, warm clay #A0694A. Serif headings, generous whitespace, breath as a design principle.';

const P = {
  bg:      '#F7F4EF',
  surface: '#FFFFFF',
  s2:      '#EEE9E0',
  text:    '#1D1A14',
  muted:   'rgba(29,26,20,0.42)',
  sage:    '#5A7856',
  clay:    '#A0694A',
  border:  'rgba(29,26,20,0.10)',
  blush:   '#F0E8DE',
};

function zenPublish(slug, html, title) {
  const payload = Buffer.from(JSON.stringify({ html, title }));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length, 'X-Subdomain': 'ram' },
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
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg}; --surface: ${P.surface}; --s2: ${P.s2};
    --text: ${P.text}; --muted: ${P.muted}; --sage: ${P.sage};
    --clay: ${P.clay}; --border: ${P.border}; --blush: ${P.blush};
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }

  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(247,244,239,0.94); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
  }
  .nav-brand { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; color: var(--sage); text-decoration: none; letter-spacing: 0.02em; }
  .nav-links { display: flex; gap: 36px; }
  .nav-links a { font-size: 12px; font-weight: 500; color: var(--muted); text-decoration: none; transition: color 0.2s; letter-spacing: 0.05em; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { font-size: 12px; font-weight: 600; color: var(--sage); text-decoration: none; border-bottom: 1px solid var(--sage); padding-bottom: 1px; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.7; }

  .hero { min-height: 100vh; display: flex; align-items: center; padding: 120px 40px 80px; max-width: 1000px; margin: 0 auto; }
  .hero-inner { max-width: 680px; }
  .hero-overline { font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--sage); margin-bottom: 32px; }
  .hero-headline { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(52px, 8vw, 96px); font-weight: 400; line-height: 1.0; letter-spacing: -0.01em; color: var(--text); margin-bottom: 32px; }
  .hero-headline em { color: var(--sage); font-style: italic; }
  .hero-sub { font-size: clamp(16px, 2.2vw, 20px); color: var(--muted); max-width: 480px; line-height: 1.65; margin-bottom: 48px; }
  .hero-actions { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin-bottom: 64px; }
  .btn-primary { background: var(--sage); color: #fff; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; padding: 14px 32px; text-decoration: none; display: inline-block; transition: opacity 0.2s; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-ghost { border: 1px solid var(--border); color: var(--text); font-size: 13px; font-weight: 500; letter-spacing: 0.06em; padding: 14px 28px; text-decoration: none; display: inline-block; transition: border-color 0.2s; }
  .btn-ghost:hover { border-color: var(--sage); }
  .hero-quote { border-left: 2px solid var(--sage); padding: 12px 0 12px 20px; }
  .hero-quote p { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-style: italic; color: var(--text); line-height: 1.5; margin-bottom: 6px; }
  .hero-quote cite { font-size: 11px; color: var(--muted); letter-spacing: 0.06em; }

  .pillars { max-width: 1000px; margin: 0 auto; padding: 80px 40px; display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); }
  .pillar { background: var(--bg); padding: 40px 32px; }
  .pillar-icon { font-size: 24px; margin-bottom: 20px; }
  .pillar-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; color: var(--text); margin-bottom: 12px; }
  .pillar-desc { font-size: 13px; color: var(--muted); line-height: 1.7; }

  .ritual { max-width: 1000px; margin: 0 auto; padding: 80px 40px; }
  .ritual-label { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--clay); margin-bottom: 24px; }
  .ritual-heading { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(28px, 4vw, 48px); color: var(--text); max-width: 580px; line-height: 1.2; margin-bottom: 32px; }
  .steps { display: flex; flex-direction: column; gap: 0; max-width: 560px; }
  .step { display: flex; gap: 24px; padding: 24px 0; border-bottom: 1px solid var(--border); align-items: flex-start; }
  .step-num { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; color: var(--sage); line-height: 1; flex-shrink: 0; width: 36px; }
  .step-content h3 { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .step-content p { font-size: 13px; color: var(--muted); line-height: 1.6; }

  .evidence { background: var(--blush); padding: 80px 40px; }
  .evidence-inner { max-width: 800px; margin: 0 auto; text-align: center; }
  .evidence-label { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--clay); margin-bottom: 16px; }
  .evidence-quote { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(24px, 3.5vw, 40px); font-style: italic; color: var(--text); line-height: 1.3; margin-bottom: 24px; }
  .evidence-cite { font-size: 11px; color: var(--muted); letter-spacing: 0.06em; }
  .evidence-stats { display: flex; justify-content: center; gap: 60px; margin-top: 56px; flex-wrap: wrap; }
  .evidence-stat { text-align: center; }
  .evidence-stat strong { display: block; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 48px; font-weight: 500; color: var(--sage); line-height: 1; }
  .evidence-stat span { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }

  .cta-section { max-width: 1000px; margin: 0 auto; padding: 100px 40px; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .cta-heading { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(36px, 5vw, 60px); color: var(--text); line-height: 1.1; margin-bottom: 20px; }
  .cta-sub { font-size: 16px; color: var(--muted); max-width: 400px; line-height: 1.6; margin-bottom: 40px; }
  .cta-actions { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }

  footer { border-top: 1px solid var(--border); padding: 32px 40px; max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-brand { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; color: var(--sage); }
  .footer-note { font-size: 11px; color: var(--muted); }

  @media (max-width: 768px) {
    nav { padding: 0 20px; }
    .hero { padding: 100px 20px 60px; }
    .pillars { grid-template-columns: 1fr; }
    .ritual { padding: 60px 20px; }
    .evidence { padding: 60px 20px; }
    .cta-section { padding: 60px 20px; }
    .nav-links { display: none; }
    footer { padding: 24px 20px; flex-direction: column; gap: 8px; text-align: center; }
  }
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-brand">lull</a>
  <div class="nav-links">
    <a href="#ritual">How It Works</a>
    <a href="#evidence">Why Journal</a>
    <a href="https://ram.zenbin.org/lull-mock">Mock ☀◑</a>
  </div>
  <a href="https://ram.zenbin.org/lull-mock" class="nav-cta">Try Mock</a>
</nav>

<section class="hero">
  <div class="hero-inner">
    <p class="hero-overline">Daily Reflection · Mindfulness Journal</p>
    <h1 class="hero-headline">
      A space to<br>
      <em>arrive in</em><br>
      yourself.
    </h1>
    <p class="hero-sub">LULL is a daily reflection companion. Morning check-in, free-write journal, guided prompts, and gentle mood tracking — designed around stillness, not streaks.</p>
    <div class="hero-actions">
      <a href="https://ram.zenbin.org/lull-mock" class="btn-primary">Try Interactive Mock</a>
      <a href="#ritual" class="btn-ghost">See How It Works</a>
    </div>
    <div class="hero-quote">
      <p>"What would make today feel complete?"</p>
      <cite>Today's morning prompt</cite>
    </div>
  </div>
</section>

<section class="pillars">
  <div class="pillar">
    <div class="pillar-icon">🌿</div>
    <h3 class="pillar-title">Morning check-in</h3>
    <p class="pillar-desc">Arrive softly. Set your mood, your intention, and three small things — not a to-do list, a compass.</p>
  </div>
  <div class="pillar">
    <div class="pillar-icon">✦</div>
    <h3 class="pillar-title">Free journal</h3>
    <p class="pillar-desc">A blank page with no word counts, no performance metrics. Just write. LULL stays out of your way.</p>
  </div>
  <div class="pillar">
    <div class="pillar-icon">◌</div>
    <h3 class="pillar-title">Gentle insights</h3>
    <p class="pillar-desc">After 21 days, patterns emerge. Not pushed at you — offered, when you're ready to look.</p>
  </div>
</section>

<section class="ritual" id="ritual">
  <p class="ritual-label">The Daily Ritual</p>
  <h2 class="ritual-heading">Five minutes in the morning. A different kind of day.</h2>
  <div class="steps">
    <div class="step">
      <span class="step-num">1</span>
      <div class="step-content">
        <h3>Check in with yourself</h3>
        <p>Tap how you're arriving — one word, one honest signal. No wrong answers.</p>
      </div>
    </div>
    <div class="step">
      <span class="step-num">2</span>
      <div class="step-content">
        <h3>Set one intention</h3>
        <p>Not a goal. An intention — something to carry gently, not to chase.</p>
      </div>
    </div>
    <div class="step">
      <span class="step-num">3</span>
      <div class="step-content">
        <h3>Write with the prompt</h3>
        <p>A question worth sitting with. Or skip it and write freely — the page is yours.</p>
      </div>
    </div>
    <div class="step">
      <span class="step-num">4</span>
      <div class="step-content">
        <h3>Let LULL reflect back</h3>
        <p>After weeks of entries, LULL surfaces patterns — gently, without pressure or gamification.</p>
      </div>
    </div>
  </div>
</section>

<section class="evidence" id="evidence">
  <div class="evidence-inner">
    <p class="evidence-label">Why Reflective Journalling Works</p>
    <p class="evidence-quote">"Expressive writing reduces intrusive thoughts, lowers anxiety, and improves working memory by up to 20%."</p>
    <p class="evidence-cite">— Pennebaker &amp; Chung, Psychological Science</p>
    <div class="evidence-stats">
      <div class="evidence-stat">
        <strong>5</strong>
        <span>minutes/day<br>minimum effective dose</span>
      </div>
      <div class="evidence-stat">
        <strong>21</strong>
        <span>days to form<br>a reflection habit</span>
      </div>
      <div class="evidence-stat">
        <strong>34%</strong>
        <span>reduction in<br>reported stress</span>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2 class="cta-heading">Start with tomorrow morning.</h2>
  <p class="cta-sub">No setup. No onboarding flow. Open LULL, check in, write something true.</p>
  <div class="cta-actions">
    <a href="https://ram.zenbin.org/lull-mock" class="btn-primary">Try Interactive Mock</a>
    <a href="https://ram.zenbin.org/lull-mock" class="btn-ghost">Light / Dark Toggle ☀◑</a>
  </div>
</section>

<footer>
  <span class="footer-brand">lull</span>
  <span class="footer-note">RAM Design Studio · ram.zenbin.org</span>
  <span class="footer-note">Light · Calm · Serif-led</span>
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
    console.error('⚠ ZenBin 100-page cap. Delete stale pages first.');
    process.exit(1);
  }

  // Gallery queue
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
    theme:        'light',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: ${APP_NAME} to gallery (heartbeat)`, content: newContent, sha: fileData.sha });
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
