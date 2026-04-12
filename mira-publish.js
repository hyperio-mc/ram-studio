'use strict';
// mira-publish.js — Full Design Discovery pipeline for MIRA
// MIRA — Cognitive Wellness Tracker
// Theme: LIGHT  · Slug: mira

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG      = 'mira';
const APP_NAME  = 'Mira';
const TAGLINE   = 'Think clearly, feel grounded';
const ARCHETYPE = 'wellness-productivity';
const SUBDOMAIN = 'ram';

const ORIGINAL_PROMPT = 'Cognitive wellness tracker mobile app — light theme. Inspired by Dawn (evidence-based AI for mental health, Lapa Ninja) + Amie calendar app (Godly.website). Computational warmth: clinical data precision meets human softness. Warm cream palette, sage green accent, terracotta highlights.';

const { GITHUB_TOKEN, GITHUB_REPO } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8')
);

const penJson = fs.readFileSync(path.join(__dirname, 'mira.pen'), 'utf8');

function req(opts, body) {
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

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  const res = await req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
  return res;
}

// Light palette
const P = {
  bg:         '#FAF8F4',
  surface:    '#FFFFFF',
  surface2:   '#F3F0EB',
  surface3:   '#EDE9E2',
  text:       '#1C1917',
  textMuted:  'rgba(28,25,23,0.5)',
  accent:     '#4A7C5A',
  accentDim:  'rgba(74,124,90,0.1)',
  accent2:    '#C4704A',
  accent2Dim: 'rgba(196,112,74,0.1)',
  accent3:    '#7B68AA',
  border:     '#E5E1D9',
};

function buildHero() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mira — ${TAGLINE} | RAM Design Studio</title>
<meta name="description" content="Mira is a cognitive wellness tracker for high-performers. Evidence-based mood logging, focus scoring, and pattern insights — wrapped in a warm, unhurried interface.">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{background:${P.bg};color:${P.text};font-family:-apple-system,'Inter',system-ui,sans-serif}
body{min-height:100vh;overflow-x:hidden}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;height:60px;
  background:rgba(250,248,244,0.85);
  backdrop-filter:blur(16px);
  border-bottom:1px solid ${P.border};
}
.nav-logo{font-size:14px;font-weight:800;color:${P.text};letter-spacing:2px}
.nav-logo span{color:${P.accent}}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{font-size:13px;color:${P.textMuted};text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${P.text}}
.nav-cta{
  background:${P.accent};color:#fff;
  padding:8px 18px;border-radius:20px;
  font-size:13px;font-weight:600;text-decoration:none;
  transition:opacity .2s;
}
.nav-cta:hover{opacity:0.85}

.hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:80px 24px 60px;
  position:relative;overflow:hidden;
}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  background:${P.accentDim};border:1px solid rgba(74,124,90,0.25);
  color:${P.accent};border-radius:20px;
  padding:6px 16px;font-size:12px;font-weight:700;
  letter-spacing:1px;margin-bottom:28px;
}
.hero-badge::before{content:'🌿';font-size:14px}
h1{
  font-size:clamp(42px,7vw,84px);font-weight:800;
  line-height:1.05;letter-spacing:-2px;
  color:${P.text};margin-bottom:20px;max-width:800px;
}
h1 .highlight{color:${P.accent}}
.hero-sub{
  font-size:clamp(15px,2vw,20px);color:${P.textMuted};
  max-width:520px;line-height:1.6;margin-bottom:40px;
}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:60px}
.btn-primary{
  background:${P.accent};color:#fff;
  padding:14px 32px;border-radius:28px;
  font-size:15px;font-weight:700;text-decoration:none;
  transition:transform .15s,opacity .15s;display:inline-flex;align-items:center;gap:8px;
}
.btn-primary:hover{transform:translateY(-1px);opacity:0.9}
.btn-secondary{
  background:${P.surface};color:${P.text};
  border:1.5px solid ${P.border};
  padding:14px 28px;border-radius:28px;
  font-size:15px;font-weight:600;text-decoration:none;
  transition:border-color .2s,background .2s;
}
.btn-secondary:hover{border-color:${P.accent};background:${P.accentDim}}

.phone-mockup{
  position:relative;margin:0 auto;
  width:280px;height:580px;
  background:#fff;border-radius:40px;
  box-shadow:0 40px 100px rgba(28,25,23,0.12),0 0 0 1px ${P.border};
  overflow:hidden;
}
.phone-notch{
  position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:100px;height:28px;background:${P.bg};
  border-radius:0 0 16px 16px;z-index:10;
}
.phone-screen{width:100%;height:100%;background:${P.bg};overflow:hidden}
.phone-screen iframe{width:100%;height:100%;border:none;pointer-events:none}

.screens-showcase{
  display:flex;gap:20px;overflow-x:auto;padding:0 40px 20px;
  scrollbar-width:none;max-width:1200px;margin:0 auto;
}
.screens-showcase::-webkit-scrollbar{display:none}
.screen-card{
  flex:0 0 200px;height:380px;
  background:${P.surface};border-radius:28px;
  border:1px solid ${P.border};
  overflow:hidden;position:relative;
  box-shadow:0 8px 32px rgba(28,25,23,0.06);
  transition:transform .2s,box-shadow .2s;
}
.screen-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(28,25,23,0.1)}
.screen-label{
  position:absolute;bottom:0;left:0;right:0;
  padding:12px 16px;
  background:linear-gradient(transparent,rgba(250,248,244,0.95));
  font-size:12px;font-weight:600;color:${P.text};
}

section{padding:80px 40px;max-width:1100px;margin:0 auto}
.section-label{
  font-size:11px;font-weight:700;letter-spacing:2px;
  color:${P.accent};margin-bottom:16px;text-transform:uppercase;
}
.section-title{
  font-size:clamp(28px,4vw,44px);font-weight:800;
  color:${P.text};line-height:1.15;margin-bottom:16px;
}
.section-sub{font-size:16px;color:${P.textMuted};line-height:1.6;max-width:480px}

.features-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:20px;margin-top:48px;
}
.feature-card{
  background:${P.surface};border:1px solid ${P.border};
  border-radius:24px;padding:28px;
  transition:border-color .2s,box-shadow .2s;
}
.feature-card:hover{border-color:${P.accent};box-shadow:0 8px 32px ${P.accentDim}}
.feature-icon{
  width:48px;height:48px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;
  font-size:22px;margin-bottom:16px;
}
.feature-icon.green{background:${P.accentDim}}
.feature-icon.terra{background:${P.accent2Dim}}
.feature-icon.violet{background:rgba(123,104,170,0.1)}
.feature-title{font-size:16px;font-weight:700;color:${P.text};margin-bottom:8px}
.feature-desc{font-size:13px;color:${P.textMuted};line-height:1.6}

.metrics-row{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:20px;margin-top:48px;
}
.metric-block{
  background:${P.surface};border:1px solid ${P.border};
  border-radius:20px;padding:28px 24px;text-align:center;
}
.metric-val{font-size:40px;font-weight:800;color:${P.text};line-height:1}
.metric-val span{font-size:18px;color:${P.textMuted}}
.metric-label{font-size:13px;color:${P.textMuted};margin-top:6px}

.palette-row{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.swatch{
  width:56px;height:56px;border-radius:14px;
  border:1px solid ${P.border};
  display:flex;align-items:flex-end;padding:6px;
}
.swatch span{font-size:9px;font-weight:600;opacity:0.7}

.inspiration-block{
  background:${P.surface2};border:1px solid ${P.border};
  border-radius:24px;padding:32px;margin-top:40px;
  display:flex;gap:24px;align-items:flex-start;
}
.insp-icon{font-size:32px}
.insp-label{font-size:11px;font-weight:700;color:${P.accent};letter-spacing:1.5px;margin-bottom:8px}
.insp-text{font-size:14px;color:${P.text};line-height:1.6}

.cta-band{
  background:${P.accent};border-radius:32px;
  padding:64px 48px;text-align:center;
  margin:0 40px 80px;
}
.cta-band h2{font-size:clamp(28px,4vw,44px);font-weight:800;color:#fff;margin-bottom:16px}
.cta-band p{font-size:16px;color:rgba(255,255,255,0.75);margin-bottom:32px}
.cta-band .btn-white{
  background:#fff;color:${P.accent};
  padding:14px 32px;border-radius:28px;
  font-size:15px;font-weight:700;text-decoration:none;
  transition:transform .15s;display:inline-block;
}
.cta-band .btn-white:hover{transform:translateY(-2px)}

footer{
  border-top:1px solid ${P.border};
  padding:32px 40px;
  display:flex;align-items:center;justify-content:space-between;
  font-size:12px;color:${P.textMuted};
}
.footer-logo{font-weight:800;color:${P.text};letter-spacing:2px}
.footer-logo span{color:${P.accent}}

/* Decorative blobs */
.blob{
  position:absolute;border-radius:50%;filter:blur(80px);opacity:0.3;pointer-events:none;
}
.blob-1{width:400px;height:400px;background:${P.accent};top:-100px;right:-100px}
.blob-2{width:300px;height:300px;background:${P.accent2};bottom:100px;left:-80px}

@media(max-width:768px){
  nav{padding:0 20px}
  .hero{padding:80px 20px 40px}
  section{padding:60px 20px}
  .metrics-row{grid-template-columns:1fr}
  .cta-band{margin:0 20px 60px;padding:40px 24px}
  footer{flex-direction:column;gap:12px;text-align:center}
}
</style>
</head>
<body>

<nav>
  <div class="nav-logo">M<span>I</span>RA</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#insights">Science</a>
    <a href="#design">Design</a>
    <a href="/mira-mock" class="nav-cta">Try Mock →</a>
  </div>
</nav>

<div class="hero">
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>

  <div class="hero-badge">COGNITIVE WELLNESS</div>
  <h1>Think <span class="highlight">clearly.</span><br>Feel grounded.</h1>
  <p class="hero-sub">Evidence-based mood logging, focus scoring, and AI-powered pattern insights — all in an interface designed to feel as calm as your best days.</p>
  <div class="hero-actions">
    <a href="/mira-viewer" class="btn-primary">🌿 View Design</a>
    <a href="/mira-mock" class="btn-secondary">Interactive Mock ☀◑</a>
  </div>
</div>

<section id="features">
  <div class="section-label">Core Features</div>
  <div class="section-title">Built around your natural rhythms</div>
  <p class="section-sub">Mira learns when you're at your best — then protects those moments.</p>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon green">🧠</div>
      <div class="feature-title">Clarity Score</div>
      <div class="feature-desc">A composite daily score synthesizing mood, sleep, energy and focus into one honest number. No gamification — just clarity.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon terra">🌊</div>
      <div class="feature-title">Flow Tracking</div>
      <div class="feature-desc">Log focus sessions and tag what you're working on. Mira detects your flow states and tells you what conditions created them.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon violet">📊</div>
      <div class="feature-title">Pattern Insights</div>
      <div class="feature-desc">Weekly AI-generated insights connecting your sleep, exercise, and mood data to your actual performance outputs.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon green">🌿</div>
      <div class="feature-title">Sustainable Pace</div>
      <div class="feature-desc">A weekly review score that tracks whether you're building momentum — or burning out. Honest, not flattering.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon terra">🔒</div>
      <div class="feature-title">Private Journal</div>
      <div class="feature-desc">Timestamped, encrypted notes linked to each check-in. Your mental model, for your eyes only.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon violet">🎯</div>
      <div class="feature-title">Weekly Intentions</div>
      <div class="feature-desc">Set one clear intention per week. Mira reflects it back in your daily view — a quiet anchor in a busy calendar.</div>
    </div>
  </div>
</section>

<section id="insights">
  <div class="section-label">Evidence-Based</div>
  <div class="section-title">Designed around the science</div>
  <p class="section-sub">Every metric in Mira is grounded in cognitive psychology and performance research.</p>

  <div class="metrics-row">
    <div class="metric-block">
      <div class="metric-val">34<span>%</span></div>
      <div class="metric-label">Higher clarity scores in peak morning windows (per user data)</div>
    </div>
    <div class="metric-block">
      <div class="metric-val">28<span>pt</span></div>
      <div class="metric-label">Average score difference between 6h vs 8h sleep nights</div>
    </div>
    <div class="metric-block">
      <div class="metric-val">22<span>%</span></div>
      <div class="metric-label">Afternoon focus boost on days with morning exercise</div>
    </div>
  </div>
</section>

<section id="design">
  <div class="section-label">Design Language</div>
  <div class="section-title">Computational warmth</div>
  <p class="section-sub">Clinical precision doesn't have to feel cold. Mira uses data-rich layouts wrapped in warm, unhurried visual design.</p>

  <div class="palette-row">
    <div class="swatch" style="background:#FAF8F4"><span style="color:#1C1917">#FAF8F4</span></div>
    <div class="swatch" style="background:#FFFFFF"><span style="color:#1C1917">#FFFFFF</span></div>
    <div class="swatch" style="background:#EDE9E2"><span style="color:#1C1917">#EDE9E2</span></div>
    <div class="swatch" style="background:#4A7C5A"><span style="color:#fff">#4A7C5A</span></div>
    <div class="swatch" style="background:#C4704A"><span style="color:#fff">#C4704A</span></div>
    <div class="swatch" style="background:#7B68AA"><span style="color:#fff">#7B68AA</span></div>
    <div class="swatch" style="background:#1C1917"><span style="color:#FAF8F4">#1C1917</span></div>
  </div>

  <div class="inspiration-block">
    <div class="insp-icon">💡</div>
    <div>
      <div class="insp-label">Trend Inspiration</div>
      <div class="insp-text">Spotted on <strong>Lapa Ninja</strong>: Dawn, an evidence-based AI for mental health ("private, science-backed, judgement-free"). Also influenced by <strong>Godly.website</strong>: Amie calendar app's minimal warmth. Both showed that serious data products can use human-scale typography and warm neutrals without sacrificing credibility. Mira takes that further — making the data feel like a conversation, not a report.</div>
    </div>
  </div>
</section>

<div class="cta-band">
  <h2>Your mind deserves good design</h2>
  <p>5 screens. One quiet interface. Built to help you understand yourself.</p>
  <a href="/mira-mock" class="btn-white">Explore Interactive Mock →</a>
</div>

<footer>
  <div class="footer-logo">M<span>I</span>RA — RAM Design Studio</div>
  <div>Heartbeat design · Mar 2026 · ram.zenbin.org</div>
</footer>

</body>
</html>`;
}

function buildViewer() {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mira — Design Viewer | RAM</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:${P.bg};font-family:-apple-system,system-ui,sans-serif;min-height:100vh}
.top-bar{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 24px;height:52px;
  background:rgba(250,248,244,0.9);backdrop-filter:blur(12px);
  border-bottom:1px solid ${P.border};
}
.top-logo{font-size:13px;font-weight:800;color:${P.text};letter-spacing:2px}
.top-logo span{color:${P.accent}}
.top-links{display:flex;gap:16px}
.top-links a{font-size:12px;color:${P.textMuted};text-decoration:none}
.top-links a:hover{color:${P.text}}

.viewer-wrap{
  padding-top:80px;display:flex;flex-direction:column;align-items:center;
  gap:40px;padding-bottom:60px;
}
.viewer-title{
  font-size:28px;font-weight:800;color:${P.text};
  letter-spacing:-0.5px;text-align:center;margin-top:12px;
}
.viewer-sub{font-size:14px;color:${P.textMuted};text-align:center;margin-top:4px}

#pencil-viewer{
  width:100%;max-width:900px;
  border-radius:24px;overflow:hidden;
  box-shadow:0 20px 60px rgba(28,25,23,0.1);
  border:1px solid ${P.border};
  min-height:600px;
}
</style>
</head>
<body>
<div class="top-bar">
  <div class="top-logo">M<span>I</span>RA — Viewer</div>
  <div class="top-links">
    <a href="/mira">← Hero</a>
    <a href="/mira-mock">Interactive Mock</a>
    <a href="https://ram.zenbin.org">RAM Studio</a>
  </div>
</div>
<div class="viewer-wrap">
  <div>
    <div class="viewer-title">Mira — Design Viewer</div>
    <div class="viewer-sub">5 screens · Light theme · Cognitive Wellness</div>
  </div>
  <div id="pencil-viewer">
    <p style="padding:40px;color:${P.textMuted};text-align:center">Loading Pencil viewer…</p>
  </div>
</div>
<script>
// Pencil.dev viewer bootstrap
(function(){
  var pv = document.getElementById('pencil-viewer');
  pv.innerHTML = '<iframe src="https://pencil.dev/embed?data='+encodeURIComponent(window.EMBEDDED_PEN)+'" style="width:100%;height:700px;border:none" allowfullscreen></iframe>';
})();
</script>
</body>
</html>`;
  // inject EMBEDDED_PEN before the first <script>
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

async function pushToGallery() {
  const getRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (getRes.status !== 200) {
    console.error('GitHub GET failed:', getRes.status, getRes.body.slice(0, 200));
    return false;
  }

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
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
    theme: 'light',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: ${APP_NAME} to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });

  const putRes = await req({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);

  return putRes.status === 200 || putRes.status === 201;
}

(async () => {
  console.log('Publishing MIRA…');

  // 1. Hero
  const heroHtml = buildHero();
  const heroRes = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE} | RAM Design Studio`, heroHtml);
  console.log(`Hero: ${heroRes.status === 200 ? '✓' : '✗'} (${heroRes.status})`);

  // 2. Viewer
  const viewerHtml = buildViewer();
  const viewerRes = await zenPut(`${SLUG}-viewer`, `${APP_NAME} — Design Viewer | RAM`, viewerHtml);
  console.log(`Viewer: ${viewerRes.status === 200 ? '✓' : '✗'} (${viewerRes.status})`);

  // 3. GitHub gallery
  const galleryOk = await pushToGallery();
  console.log(`Gallery: ${galleryOk ? '✓' : '✗'}`);

  console.log('\n→ https://ram.zenbin.org/mira');
  console.log('→ https://ram.zenbin.org/mira-viewer');
})();
