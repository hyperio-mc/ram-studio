const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ─── Config ──────────────────────────────────────────────────────────────────
const SLUG     = 'draft';
const APP_NAME = 'DRAFT';
const TAGLINE  = 'Your AI writing companion';
const ARCHETYPE = 'productivity-ai';

// Palette
const BG       = '#F8F5F1';
const SURFACE  = '#FFFFFF';
const SURF2    = '#F2EFE9';
const TEXT     = '#1A1612';
const TEXT2    = '#5C5449';
const ACCENT   = '#2A5BF5';
const ACCENT2  = '#F59E0B';
const ACCENT3  = '#0EA5E9';
const GREEN    = '#16A34A';
const BORDER   = 'rgba(26,22,18,0.10)';

// ─── HTTP helper ─────────────────────────────────────────────────────────────
function request(urlStr, opts = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const mod = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: opts.method || 'GET',
      headers: opts.headers || {},
    };
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);
    const req = mod.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function publish(slug, html, title) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    };
    const r = https.request(options, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

// ─── Hero Page HTML ───────────────────────────────────────────────────────────
function buildHeroHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${BG};
    --surface: ${SURFACE};
    --surf2: ${SURF2};
    --text: ${TEXT};
    --text2: ${TEXT2};
    --accent: ${ACCENT};
    --accent2: ${ACCENT2};
    --accent3: ${ACCENT3};
    --green: ${GREEN};
    --border: ${BORDER};
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', 'Inter Tight', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    min-height: 100vh;
  }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(248,245,241,0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo {
    font-size: 20px; font-weight: 800; color: var(--text);
    letter-spacing: -0.5px;
    display: flex; align-items: center; gap: 8px;
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a {
    font-size: 14px; color: var(--text2); text-decoration: none;
    font-weight: 500; transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--accent); color: #fff;
    padding: 9px 22px; border-radius: 24px;
    font-size: 14px; font-weight: 600; text-decoration: none;
    transition: opacity 0.2s; cursor: pointer; border: none;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* ── Hero ── */
  .hero {
    padding: 140px 32px 80px;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: #EFF6FF; border: 1px solid rgba(42,91,245,0.2);
    border-radius: 20px; padding: 6px 14px;
    font-size: 12px; font-weight: 600; color: var(--accent);
    letter-spacing: 0.5px; margin-bottom: 24px;
  }
  h1 {
    font-size: clamp(40px, 5vw, 60px);
    font-weight: 800; line-height: 1.1;
    letter-spacing: -1.5px; color: var(--text);
    margin-bottom: 20px;
  }
  h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    font-size: 18px; color: var(--text2); max-width: 440px;
    line-height: 1.65; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 14px 28px; border-radius: 28px;
    font-size: 15px; font-weight: 700; text-decoration: none;
    display: inline-flex; align-items: center; gap: 8px;
    transition: all 0.2s; box-shadow: 0 4px 16px rgba(42,91,245,0.3);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(42,91,245,0.38); }
  .btn-secondary {
    color: var(--text2); font-size: 14px; font-weight: 600;
    text-decoration: none; display: flex; align-items: center; gap: 6px;
    transition: color 0.2s;
  }
  .btn-secondary:hover { color: var(--accent); }

  /* ── Phone mockup ── */
  .hero-phone {
    display: flex; justify-content: center;
  }
  .phone-frame {
    width: 280px; height: 560px;
    background: var(--surface);
    border-radius: 36px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06),
                inset 0 0 0 1.5px rgba(0,0,0,0.08);
    overflow: hidden; position: relative;
    transform: perspective(1000px) rotateY(-6deg) rotateX(2deg);
  }
  .phone-notch {
    width: 80px; height: 24px;
    background: var(--text); border-radius: 0 0 14px 14px;
    margin: 0 auto 8px;
  }
  .phone-content { padding: 0 14px; }
  .phone-greeting { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 2px; margin-top: 4px; }
  .phone-date { font-size: 10px; color: var(--text2); margin-bottom: 10px; }
  .phone-cta-btn {
    background: var(--accent); border-radius: 12px;
    padding: 12px 14px; margin-bottom: 10px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .phone-cta-btn .label { font-size: 12px; font-weight: 700; color: #fff; }
  .phone-cta-btn .sub { font-size: 9px; color: rgba(255,255,255,0.72); }
  .phone-section-label { font-size: 8px; font-weight: 700; color: var(--text2); letter-spacing: 1px; margin-bottom: 6px; }
  .phone-card {
    background: var(--surf2); border-radius: 12px; padding: 10px 12px;
    margin-bottom: 8px; border-left: 3px solid var(--accent);
  }
  .phone-card .card-title { font-size: 11px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .phone-card .card-sub { font-size: 9px; color: var(--text2); margin-bottom: 6px; }
  .phone-progress { height: 3px; background: rgba(0,0,0,0.08); border-radius: 3px; overflow: hidden; }
  .phone-progress-fill { height: 100%; background: var(--accent); border-radius: 3px; }
  .phone-card-2 { border-left-color: var(--accent2); }
  .phone-ai-bar {
    background: #EFF6FF; border-radius: 10px; padding: 8px 10px;
    display: flex; align-items: center; gap: 8px; margin-top: 8px;
    font-size: 9px; color: var(--text2);
  }
  .phone-ai-icon { font-size: 14px; }

  /* ── Stats strip ── */
  .stats {
    background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 32px;
    display: flex; justify-content: center; gap: 0;
  }
  .stat {
    text-align: center; padding: 0 48px;
    border-right: 1px solid var(--border);
  }
  .stat:last-child { border-right: none; }
  .stat-value { font-size: 32px; font-weight: 800; color: var(--text); letter-spacing: -1px; }
  .stat-label { font-size: 13px; color: var(--text2); margin-top: 2px; }

  /* ── Features ── */
  .features {
    padding: 80px 32px;
    max-width: 1100px; margin: 0 auto;
  }
  .section-label {
    font-size: 11px; font-weight: 700; color: var(--accent);
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;
  }
  .section-title {
    font-size: 36px; font-weight: 800; letter-spacing: -1px;
    margin-bottom: 48px; max-width: 500px;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  .feature-card {
    background: var(--surface); border-radius: 20px; padding: 28px;
    border: 1px solid var(--border);
    transition: all 0.2s;
  }
  .feature-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.08);
    border-color: rgba(42,91,245,0.2);
  }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 16px;
  }
  .feature-icon-blue { background: #EFF6FF; }
  .feature-icon-amber { background: #FFF7ED; }
  .feature-icon-green { background: #F0FDF4; }
  .feature-icon-sky { background: #F0F9FF; }
  .feature-icon-pink { background: #FFF1F2; }
  .feature-icon-purple { background: #F5F3FF; }
  .feature-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: var(--text2); line-height: 1.6; }

  /* ── Canvas Preview ── */
  .canvas-preview {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 24px; padding: 32px; margin: 0 32px 80px;
    max-width: 1036px; margin-left: auto; margin-right: auto;
  }
  .canvas-topbar {
    display: flex; align-items: center; gap: 16px;
    padding-bottom: 16px; border-bottom: 1px solid var(--border); margin-bottom: 24px;
  }
  .traffic-lights { display: flex; gap: 6px; }
  .tl { width: 12px; height: 12px; border-radius: 50%; }
  .tl-red { background: #FF5F57; } .tl-yellow { background: #FEBC2E; } .tl-green { background: #28C840; }
  .canvas-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .canvas-focus-strip {
    display: flex; gap: 20px; align-items: center;
    background: var(--surf2); border-radius: 8px; padding: 8px 16px;
    font-size: 12px; color: var(--text2); margin-bottom: 24px;
  }
  .canvas-body {
    display: grid; grid-template-columns: 1fr 40px;
    gap: 16px;
  }
  .canvas-text { font-size: 16px; line-height: 1.8; color: var(--text); }
  .canvas-text p { margin-bottom: 16px; }
  .ghost-text { color: rgba(42,91,245,0.35); font-style: italic; }
  .canvas-sidebar {
    display: flex; flex-direction: column; gap: 12px; align-items: center;
    background: #F5F8FF; border-radius: 12px; padding: 12px 0;
    font-size: 16px;
  }
  .canvas-ai-bar {
    background: #EFF6FF; border-top: 1px solid rgba(42,91,245,0.12);
    border-radius: 12px; padding: 12px 20px;
    display: flex; align-items: center; gap: 12px; margin-top: 16px;
    font-size: 13px; color: var(--text2);
  }
  .canvas-ai-bar strong { color: var(--accent); cursor: pointer; margin-left: auto; }

  /* ── Screens section ── */
  .screens-section {
    padding: 80px 32px;
    max-width: 1100px; margin: 0 auto;
  }
  .screens-grid {
    display: flex; gap: 20px; overflow-x: auto; padding-bottom: 16px;
  }
  .screen-thumb {
    flex: 0 0 180px; background: var(--surf2); border-radius: 20px; padding: 16px;
    border: 1px solid var(--border); font-size: 12px;
  }
  .screen-thumb-title { font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .screen-thumb-sub { color: var(--text2); font-size: 11px; }
  .screen-thumb-preview {
    height: 100px; border-radius: 10px; margin-top: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
  }
  .screen-thumb-preview-1 { background: linear-gradient(135deg, #EFF6FF, #E0EEFF); }
  .screen-thumb-preview-2 { background: linear-gradient(135deg, #F8F5FF, #EDE8FF); }
  .screen-thumb-preview-3 { background: linear-gradient(135deg, #FFF7ED, #FFECD0); }
  .screen-thumb-preview-4 { background: linear-gradient(135deg, #F0FDF4, #DCFCE7); }
  .screen-thumb-preview-5 { background: linear-gradient(135deg, #F0F9FF, #E0F2FE); }

  /* ── CTA Section ── */
  .cta-section {
    background: var(--text); color: #fff;
    padding: 80px 32px; text-align: center;
  }
  .cta-section h2 { font-size: 40px; font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; }
  .cta-section p { font-size: 18px; color: rgba(255,255,255,0.65); margin-bottom: 36px; }
  .cta-btn {
    background: #fff; color: var(--text);
    padding: 16px 36px; border-radius: 32px;
    font-size: 16px; font-weight: 700; text-decoration: none;
    display: inline-block; transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.25); }

  /* ── Footer ── */
  footer {
    background: var(--bg); border-top: 1px solid var(--border);
    padding: 32px; text-align: center;
    font-size: 13px; color: var(--text2);
  }
  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 120px 20px 60px; gap: 40px; }
    .features-grid { grid-template-columns: 1fr; }
    .stats { flex-direction: column; gap: 24px; }
    .stat { border-right: none; border-bottom: 1px solid var(--border); padding: 16px 0; }
    .hero-phone { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">✎ <span>DRAFT</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#canvas">Canvas</a>
    <a href="#screens">Screens</a>
  </div>
  <a href="/draft-viewer" class="nav-cta">View Design →</a>
</nav>

<!-- ── HERO ── -->
<section class="hero">
  <div>
    <div class="hero-badge">⟡ AI-powered · Light theme</div>
    <h1>Write with an AI that <em>understands</em> your voice</h1>
    <p class="hero-sub">DRAFT is a minimalist writing OS built around your natural rhythm. Ghost text suggestions, tone analysis, session tracking — all in a clean, distraction-free canvas.</p>
    <div class="hero-actions">
      <a href="/draft-viewer" class="btn-primary">Open in Pencil Viewer ↗</a>
      <a href="/draft-mock" class="btn-secondary">Interactive mock →</a>
    </div>
  </div>
  <div class="hero-phone">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-content">
        <div class="phone-greeting">Good morning, Léa</div>
        <div class="phone-date">Tuesday, April 7 &nbsp;·&nbsp; 🔥 14d streak</div>
        <div class="phone-cta-btn">
          <div><div class="label">Start writing</div><div class="sub">New session · blank canvas</div></div>
          <div style="font-size:18px;color:#fff;">↗</div>
        </div>
        <div class="phone-section-label">IN PROGRESS</div>
        <div class="phone-card">
          <div class="card-title">Product Launch Essay</div>
          <div class="card-sub">1,240 words · 68% complete</div>
          <div class="phone-progress"><div class="phone-progress-fill" style="width:68%"></div></div>
        </div>
        <div class="phone-card phone-card-2">
          <div class="card-title">Quarterly Review Notes</div>
          <div class="card-sub">480 words · paused 2h ago</div>
        </div>
        <div class="phone-ai-bar">
          <span class="phone-ai-icon" style="color:${ACCENT3}">⟡</span>
          <span>AI: pick up where you left off</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── STATS ── -->
<div class="stats">
  <div class="stat">
    <div class="stat-value">14d</div>
    <div class="stat-label">Current streak</div>
  </div>
  <div class="stat">
    <div class="stat-value">8,060</div>
    <div class="stat-label">Words this week</div>
  </div>
  <div class="stat">
    <div class="stat-value">9:30am</div>
    <div class="stat-label">Peak writing time</div>
  </div>
  <div class="stat">
    <div class="stat-value">82%</div>
    <div class="stat-label">Reflective tone score</div>
  </div>
</div>

<!-- ── CANVAS PREVIEW ── -->
<section id="canvas" class="canvas-preview">
  <div class="canvas-topbar">
    <div class="traffic-lights">
      <div class="tl tl-red"></div>
      <div class="tl tl-yellow"></div>
      <div class="tl tl-green"></div>
    </div>
    <div class="canvas-title">Product Launch Essay &nbsp;·&nbsp; 1,240 words</div>
  </div>
  <div class="canvas-focus-strip">
    <span><strong>1,240 words</strong></span>
    <span>·</span>
    <span>~5 min read</span>
    <span>·</span>
    <span>Session: 24m</span>
    <span style="margin-left:auto;color:${ACCENT};font-weight:600;cursor:pointer;">⏸ Focus mode</span>
  </div>
  <div class="canvas-body">
    <div class="canvas-text">
      <p>The morning I decided to launch was a Thursday.</p>
      <p>Not because the product was ready — it wasn't, not really — but because I'd been waiting for <em>ready</em> my entire career and ready never came.</p>
      <p>The cursor blinked. I stared. Then I hit Publish.</p>
      <p class="ghost-text">And somehow, that was enough.</p>
    </div>
    <div class="canvas-sidebar">
      <span title="AI Suggestions" style="color:${ACCENT3}">⟡</span>
      <span title="Highlights" style="color:${ACCENT2}">✦</span>
      <span title="Outline">≡</span>
      <span title="Blocks">⊞</span>
    </div>
  </div>
  <div class="canvas-ai-bar">
    <span style="color:${ACCENT3};font-size:18px">⟡</span>
    <span>AI: "Consider expanding the emotion here — this is your strongest paragraph"</span>
    <strong>Accept</strong>
  </div>
</section>

<!-- ── FEATURES ── -->
<section id="features" class="features">
  <div class="section-label">✦ Features</div>
  <h2 class="section-title">Everything you need to write better</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon feature-icon-blue">✎</div>
      <div class="feature-title">Breathing canvas</div>
      <div class="feature-desc">Distraction-free writing with a focus strip that shows only what matters — word count, session time, reading estimate.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon feature-icon-sky">⟡</div>
      <div class="feature-title">Ghost text AI</div>
      <div class="feature-desc">Context-aware suggestions appear in translucent text. Accept with Tab, ignore by typing. Never interrupts your flow.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon feature-icon-amber">🔥</div>
      <div class="feature-title">Streak system</div>
      <div class="feature-desc">Daily writing goals with streak tracking. Set a word count target and watch your consistency compound over time.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon feature-icon-green">⟡</div>
      <div class="feature-title">Tone analysis</div>
      <div class="feature-desc">Real-time AI analysis of your writing voice across four dimensions: reflective, analytical, conversational, persuasive.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon feature-icon-purple">≡</div>
      <div class="feature-title">Session history</div>
      <div class="feature-desc">Every writing session tracked with duration, word count, and status. Resume exactly where you left off.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon feature-icon-pink">✦</div>
      <div class="feature-title">Insights dashboard</div>
      <div class="feature-desc">Weekly word count charts, peak writing time detection, and personalised AI insights to improve your habits.</div>
    </div>
  </div>
</section>

<!-- ── SCREENS ── -->
<section id="screens" class="screens-section">
  <div class="section-label">✦ Screens</div>
  <h2 class="section-title">5 carefully considered screens</h2>
  <div class="screens-grid">
    <div class="screen-thumb">
      <div class="screen-thumb-preview screen-thumb-preview-1">✦</div>
      <div class="screen-thumb-title">Today</div>
      <div class="screen-thumb-sub">Dashboard with streak, active drafts & AI prompt strip</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-thumb-preview screen-thumb-preview-2">✎</div>
      <div class="screen-thumb-title">Write Canvas</div>
      <div class="screen-thumb-sub">Focus mode with ghost text AI & sidebar tools</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-thumb-preview screen-thumb-preview-3">≡</div>
      <div class="screen-thumb-title">Sessions</div>
      <div class="screen-thumb-sub">Filterable history with status indicators</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-thumb-preview screen-thumb-preview-4">⟡</div>
      <div class="screen-thumb-title">Insights</div>
      <div class="screen-thumb-sub">Bar charts, tone analysis & AI weekly insight</div>
    </div>
    <div class="screen-thumb">
      <div class="screen-thumb-preview screen-thumb-preview-5">◎</div>
      <div class="screen-thumb-title">AI Companion</div>
      <div class="screen-thumb-sub">Voice, tone & behaviour configuration</div>
    </div>
  </div>
</section>

<!-- ── CTA ── -->
<section class="cta-section">
  <h2>Start writing today</h2>
  <p>No noise, no distractions. Just you, your words, and an AI that listens.</p>
  <a href="/draft-viewer" class="cta-btn">Open Design →</a>
</section>

<!-- ── FOOTER ── -->
<footer>
  <p>Designed by <strong>RAM</strong> · Built with <a href="https://pencil.dev">Pencil.dev</a> · 
  <a href="/draft-viewer">Viewer</a> · <a href="/draft-mock">Interactive Mock</a></p>
  <p style="margin-top:8px;font-size:11px;opacity:0.6;">Inspired by Cushion.so light layout + emerging AI productivity tool aesthetics seen on lapa.ninja</p>
</footer>

</body>
</html>`;
}

// ─── Viewer Page HTML ─────────────────────────────────────────────────────────
function buildViewerHTML() {
  const penJson = fs.readFileSync(path.join(__dirname, 'draft.pen'), 'utf8');
  const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Design Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1a1a1a; font-family: system-ui, sans-serif; min-height: 100vh; }
  .viewer-header {
    background: rgba(248,245,241,0.95); backdrop-filter: blur(12px);
    padding: 16px 24px; display: flex; align-items: center; gap: 16px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  .viewer-title { font-size: 15px; font-weight: 700; color: #1A1612; }
  .viewer-sub { font-size: 12px; color: #5C5449; }
  .back-link {
    color: ${ACCENT}; text-decoration: none; font-size: 13px; font-weight: 600;
    margin-left: auto;
  }
  #pencil-viewer { width: 100%; height: calc(100vh - 70px); border: none; }
  .fallback { 
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: calc(100vh - 70px); color: #fff; gap: 16px; text-align: center; padding: 32px;
  }
  .fallback h2 { font-size: 24px; }
  .fallback p { opacity: 0.65; }
</style>
</head>
<body>
<div class="viewer-header">
  <div>
    <div class="viewer-title">✎ DRAFT — AI Writing Companion</div>
    <div class="viewer-sub">5 screens · Light theme · Pencil.dev v2.8</div>
  </div>
  <a href="/draft" class="back-link">← Back to hero</a>
</div>
<script>
window.EMBEDDED_PEN = ${JSON.stringify(penJson)};
</script>
<script>
  (function() {
    const pen = window.EMBEDDED_PEN;
    if (!pen) {
      document.body.innerHTML += '<div class="fallback"><h2>⚠ No design loaded</h2><p>EMBEDDED_PEN not found.</p></div>';
      return;
    }
    // Build a simple viewer
    let data;
    try { data = JSON.parse(pen); } catch(e) {
      document.body.innerHTML += '<div class="fallback"><h2>Parse error</h2><p>' + e.message + '</p></div>';
      return;
    }
    const screens = data.screens || [];
    let current = 0;

    function renderWidget(w, scale) {
      const s = w.style || {};
      const el = document.createElement('div');
      el.style.position = 'absolute';
      if (w.x !== undefined) el.style.left = (w.x * scale) + 'px';
      if (w.y !== undefined) el.style.top = (w.y * scale) + 'px';
      if (w.width !== undefined) el.style.width = (w.width * scale) + 'px';
      if (w.height !== undefined) el.style.height = (w.height * scale) + 'px';

      if (w.type === 'text') {
        el.textContent = w.content || '';
        el.style.fontSize = ((s.fontSize || 14) * scale) + 'px';
        el.style.color = s.color || '#000';
        el.style.fontWeight = s.fontWeight || '400';
        el.style.fontStyle = s.fontStyle || 'normal';
        el.style.letterSpacing = s.letterSpacing ? (s.letterSpacing * scale) + 'px' : '';
        el.style.lineHeight = s.lineHeight || '1.5';
        el.style.textAlign = s.textAlign || 'left';
        if (w.width) el.style.width = (w.width * scale) + 'px';
        el.style.whiteSpace = 'pre-wrap';
        el.style.overflow = 'hidden';
        el.style.pointerEvents = 'none';
      } else if (w.type === 'rect') {
        el.style.background = s.background || 'transparent';
        el.style.borderRadius = s.borderRadius ? (typeof s.borderRadius === 'number' ? (s.borderRadius * scale) + 'px' : s.borderRadius) : '0';
        el.style.boxShadow = s.boxShadow || '';
        el.style.border = s.border || '';
        el.style.borderTop = s.borderTop || '';
        el.style.borderBottom = s.borderBottom || '';
        el.style.borderLeft = s.borderLeft || '';
        el.style.borderRight = s.borderRight || '';
      } else if (w.type === 'frame') {
        el.style.background = s.background || 'transparent';
        el.style.borderRadius = s.borderRadius ? (typeof s.borderRadius === 'number' ? (s.borderRadius * scale) + 'px' : s.borderRadius) : '0';
        el.style.overflow = 'hidden';
        (w.children || []).forEach(child => el.appendChild(renderWidget(child, scale)));
      }
      return el;
    }

    function renderScreen(idx) {
      const screen = screens[idx];
      if (!screen) return;
      const container = document.getElementById('screen-container');
      container.innerHTML = '';
      const viewW = container.offsetWidth;
      const scale = viewW / (screen.width || 390);
      const phoneH = (screen.height || 844) * scale;
      const phone = document.createElement('div');
      phone.style.cssText = \`
        width: \${viewW}px; height: \${phoneH}px;
        background: \${screen.background || '#F8F5F1'};
        position: relative; overflow: hidden;
        margin: 0 auto;
        border-radius: \${32 * scale}px;
        box-shadow: 0 32px 80px rgba(0,0,0,0.4);
      \`;
      (screen.children || []).forEach(child => {
        phone.appendChild(renderWidget(child, scale));
      });
      container.appendChild(phone);

      // Update nav
      document.querySelectorAll('.screen-nav-btn').forEach((btn, i) => {
        btn.style.background = i === idx ? '${ACCENT}' : 'rgba(255,255,255,0.15)';
        btn.style.color = i === idx ? '#fff' : 'rgba(255,255,255,0.7)';
      });
    }

    // Build viewer UI
    const viewer = document.createElement('div');
    viewer.style.cssText = 'display:flex;height:calc(100vh - 70px);';

    // Sidebar
    const sidebar = document.createElement('div');
    sidebar.style.cssText = 'width:200px;background:#111;padding:16px;overflow-y:auto;flex-shrink:0;';
    sidebar.innerHTML = '<div style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:1px;font-weight:700;margin-bottom:12px;text-transform:uppercase">Screens</div>';
    screens.forEach((sc, i) => {
      const btn = document.createElement('button');
      btn.className = 'screen-nav-btn';
      btn.textContent = sc.name || \`Screen \${i+1}\`;
      btn.style.cssText = \`
        display:block;width:100%;text-align:left;
        padding:8px 12px;margin-bottom:4px;border-radius:8px;
        border:none;cursor:pointer;font-size:12px;font-weight:600;
        transition:all 0.15s;
      \`;
      btn.onclick = () => { current = i; renderScreen(i); };
      sidebar.appendChild(btn);
    });

    // Main area
    const main = document.createElement('div');
    main.style.cssText = 'flex:1;overflow-y:auto;padding:32px;display:flex;justify-content:center;';
    const screenContainer = document.createElement('div');
    screenContainer.id = 'screen-container';
    screenContainer.style.cssText = 'width:320px;flex-shrink:0;';
    main.appendChild(screenContainer);

    viewer.appendChild(sidebar);
    viewer.appendChild(main);
    document.body.appendChild(viewer);

    renderScreen(0);
  })();
</script>
</body>
</html>`;
  return viewerTemplate;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing DRAFT — AI Writing Companion...\n');

  // 1. Hero page
  console.log('1. Publishing hero page...');
  const heroRes = await publish(SLUG, buildHeroHTML(), `${APP_NAME} — ${TAGLINE}`);
  console.log(`   ✓ Hero live at: ${heroRes.url || `https://ram.zenbin.org/${SLUG}`}`);

  // 2. Viewer page
  console.log('2. Publishing viewer...');
  const viewerRes = await publish(`${SLUG}-viewer`, buildViewerHTML(), `${APP_NAME} — Design Viewer`);
  console.log(`   ✓ Viewer live at: ${viewerRes.url || `https://ram.zenbin.org/${SLUG}-viewer`}`);

  console.log('\n✓ Publish complete!');
  console.log(`  Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
}

main().catch(console.error);
