#!/usr/bin/env node
// CORTEX — Hero page + viewer publisher

const fs = require('fs');
const https = require('https');

const SLUG = 'cortex';
const APP_NAME = 'CORTEX';
const TAGLINE = 'Train your focus. Own your mind.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

// ─── HERO HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>CORTEX — Train your focus. Own your mind.</title>
  <meta name="description" content="CORTEX is a dark-mode mental performance tracker. Deep work sessions, focus analytics, habit matrix, and cognitive goal tracking in one elegant app.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #07070F; --surface: #0E0E1C; --surface-alt: #141426;
      --text: #EAE8FF; --muted: rgba(234,232,255,0.42);
      --accent: #7B61FF; --accent2: #00E5FF;
      --accent-soft: rgba(123,97,255,0.12); --accent2-soft: rgba(0,229,255,0.10);
      --border: rgba(234,232,255,0.07); --border-strong: rgba(234,232,255,0.13);
      --border-accent: rgba(123,97,255,0.28);
      --green: #00F0A0; --amber: #FFBB33; --red: #FF4D6A;
      --green-soft: rgba(0,240,160,0.10); --amber-soft: rgba(255,187,51,0.10);
      --grid: rgba(234,232,255,0.028);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', system-ui, sans-serif;
      line-height: 1.6; min-height: 100vh; overflow-x: hidden;
    }
    body::before {
      content: ''; position: fixed; inset: 0;
      background-image: linear-gradient(var(--grid) 1px, transparent 1px),
                        linear-gradient(90deg, var(--grid) 1px, transparent 1px);
      background-size: 36px 36px; pointer-events: none; z-index: 0;
    }
    .orb { position: fixed; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0; }
    .orb-1 { width: 700px; height: 700px; top: -200px; left: -150px; background: rgba(123,97,255,0.08); }
    .orb-2 { width: 500px; height: 500px; bottom: -100px; right: -50px; background: rgba(0,229,255,0.06); }
    .orb-3 { width: 400px; height: 400px; top: 60%; left: 40%; background: rgba(123,97,255,0.04); }
    a { color: var(--accent); text-decoration: none; }

    /* NAV */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(7,7,15,0.85); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 40px; height: 58px;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      font-weight: 800; font-size: 15px; letter-spacing: 0.12em; color: var(--text);
    }
    .nav-brand-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent); box-shadow: 0 0 10px var(--accent);
    }
    .nav-links { display: flex; gap: 32px; font-size: 13px; color: var(--muted); }
    .nav-cta {
      background: var(--accent); color: #fff; border: none; border-radius: 8px;
      padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
      letter-spacing: 0.02em;
      box-shadow: 0 0 20px rgba(123,97,255,0.35);
    }

    /* HERO */
    .hero {
      position: relative; z-index: 1; padding: 160px 40px 100px;
      max-width: 1100px; margin: 0 auto; text-align: center;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--accent-soft); border: 1px solid var(--border-accent);
      border-radius: 100px; padding: 6px 16px; font-size: 12px;
      font-weight: 600; color: var(--accent); letter-spacing: 0.06em;
      margin-bottom: 32px;
    }
    .hero-badge-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--accent); animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(123,97,255,0.4); }
      50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(123,97,255,0); }
    }
    h1 {
      font-size: clamp(44px, 7vw, 80px); font-weight: 900; line-height: 1.05;
      letter-spacing: -0.03em; color: var(--text);
      margin-bottom: 24px;
    }
    h1 span { color: var(--accent); }
    .hero-sub {
      font-size: clamp(16px, 2vw, 19px); color: var(--muted);
      max-width: 580px; margin: 0 auto 48px; line-height: 1.65;
    }
    .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      background: var(--accent); color: #fff; border: none;
      border-radius: 10px; padding: 14px 32px; font-size: 15px;
      font-weight: 700; cursor: pointer; letter-spacing: 0.01em;
      box-shadow: 0 0 32px rgba(123,97,255,0.4);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 48px rgba(123,97,255,0.55); }
    .btn-secondary {
      background: transparent; color: var(--text);
      border: 1px solid var(--border-strong);
      border-radius: 10px; padding: 14px 32px; font-size: 15px;
      font-weight: 600; cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .btn-secondary:hover { border-color: var(--accent); background: var(--accent-soft); }

    /* FOCUS SCORE DEMO */
    .score-demo {
      position: relative; z-index: 1;
      max-width: 380px; margin: 80px auto;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 24px; padding: 40px 32px; text-align: center;
      box-shadow: 0 0 80px rgba(123,97,255,0.12), inset 0 1px 0 rgba(234,232,255,0.04);
    }
    .score-ring-wrap {
      position: relative; width: 160px; height: 160px; margin: 0 auto 24px;
    }
    .score-ring-wrap svg { transform: rotate(-90deg); }
    .score-num {
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .score-num .big { font-size: 42px; font-weight: 900; color: var(--text); }
    .score-num .unit { font-size: 13px; color: var(--muted); margin-top: -4px; }
    .score-label { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 8px; }
    .score-sub { font-size: 13px; color: var(--muted); }
    .demo-stats {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 12px; margin-top: 24px;
    }
    .demo-stat {
      background: var(--surface-alt); border-radius: 10px;
      padding: 12px 8px; text-align: center;
    }
    .demo-stat .sv { font-size: 18px; font-weight: 800; color: var(--text); }
    .demo-stat .sl { font-size: 10px; font-weight: 600; color: var(--muted); letter-spacing: 0.06em; margin-top: 3px; }

    /* BAR VISUALIZER */
    .viz-section {
      position: relative; z-index: 1; max-width: 900px; margin: 0 auto 80px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 32px;
      box-shadow: 0 0 60px rgba(123,97,255,0.06);
    }
    .viz-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 20px; }
    .bar-row {
      display: flex; align-items: flex-end; gap: 4px; height: 80px;
    }
    .bar-col { flex: 1; min-width: 0; border-radius: 4px 4px 0 0; transition: height 0.3s; }

    /* FEATURES */
    .section { position: relative; z-index: 1; padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
    .section-eyebrow {
      font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
      color: var(--accent); margin-bottom: 16px; text-transform: uppercase;
    }
    .section-title { font-size: clamp(28px, 4vw, 40px); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 16px; }
    .section-sub { font-size: 16px; color: var(--muted); max-width: 520px; line-height: 1.65; }

    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px; margin-top: 48px;
    }
    .feature-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 28px;
      transition: border-color 0.2s, transform 0.2s;
    }
    .feature-card:hover { border-color: var(--border-accent); transform: translateY(-3px); }
    .feature-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: var(--accent-soft); display: flex; align-items: center;
      justify-content: center; font-size: 20px; margin-bottom: 20px;
      border: 1px solid var(--border-accent);
    }
    .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
    .feature-body { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* METRICS STRIP */
    .metrics-strip {
      position: relative; z-index: 1;
      border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
      background: var(--surface);
      display: grid; grid-template-columns: repeat(4, 1fr);
    }
    .metric-item {
      padding: 40px 32px; text-align: center;
      border-right: 1px solid var(--border);
    }
    .metric-item:last-child { border-right: none; }
    .metric-val {
      font-size: clamp(28px, 4vw, 40px); font-weight: 900;
      color: var(--accent); letter-spacing: -0.03em;
    }
    .metric-lbl { font-size: 12px; font-weight: 600; color: var(--muted); margin-top: 6px; letter-spacing: 0.05em; }

    /* HABIT MATRIX DEMO */
    .matrix-demo {
      position: relative; z-index: 1; max-width: 700px; margin: 80px auto;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 32px;
    }
    .matrix-title { font-size: 13px; font-weight: 700; color: var(--muted); letter-spacing: 0.08em; margin-bottom: 20px; }
    .habit-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .habit-name { font-size: 12px; color: var(--muted); width: 130px; flex-shrink: 0; }
    .habit-cells { display: flex; gap: 3px; flex: 1; }
    .habit-cell { flex: 1; height: 14px; border-radius: 3px; }

    /* CTA */
    .cta-section {
      position: relative; z-index: 1;
      text-align: center; padding: 100px 40px;
    }
    .cta-section h2 { font-size: clamp(28px, 4vw, 48px); font-weight: 900; letter-spacing: -0.02em; margin-bottom: 16px; }
    .cta-section p { font-size: 16px; color: var(--muted); margin-bottom: 40px; }

    /* FOOTER */
    footer {
      position: relative; z-index: 1;
      border-top: 1px solid var(--border);
      padding: 32px 40px; display: flex;
      align-items: center; justify-content: space-between;
      font-size: 12px; color: var(--muted);
    }
    .footer-brand { font-weight: 800; letter-spacing: 0.1em; color: var(--text); }

    @media (max-width: 640px) {
      nav { padding: 0 20px; }
      .hero { padding: 120px 20px 80px; }
      .metrics-strip { grid-template-columns: repeat(2, 1fr); }
      .section { padding: 60px 20px; }
    }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <nav>
    <div class="nav-brand">
      <div class="nav-brand-dot"></div>
      CORTEX
    </div>
    <div class="nav-links">
      <span>Features</span>
      <span>Insights</span>
      <span>Goals</span>
    </div>
    <button class="nav-cta">Get Started</button>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-badge">
      <div class="hero-badge-dot"></div>
      MENTAL PERFORMANCE TRACKER
    </div>
    <h1>Train your <span>focus.</span><br>Own your mind.</h1>
    <p class="hero-sub">
      CORTEX turns your cognitive energy into measurable progress.
      Deep work sessions, focus analytics, habit tracking — all in
      one precision-crafted dark interface.
    </p>
    <div class="hero-actions">
      <button class="btn-primary">Start Free Trial</button>
      <button class="btn-secondary">View the Design →</button>
    </div>
  </section>

  <!-- FOCUS SCORE CARD -->
  <div class="score-demo">
    <div class="score-label">FOCUS SCORE</div>
    <div class="score-ring-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(123,97,255,0.12)" stroke-width="12"/>
        <circle cx="80" cy="80" r="68" fill="none" stroke="#7B61FF" stroke-width="12"
          stroke-dasharray="${Math.round(2*Math.PI*68*0.84)} ${Math.round(2*Math.PI*68*(1-0.84))}"
          stroke-linecap="round" style="filter:drop-shadow(0 0 8px #7B61FF)"/>
      </svg>
      <div class="score-num"><span class="big">84</span><span class="unit">/100</span></div>
    </div>
    <div class="score-sub">Strong day — top 12% this week</div>
    <div class="demo-stats">
      <div class="demo-stat"><div class="sv">3h 24m</div><div class="sl">DEEP WORK</div></div>
      <div class="demo-stat"><div class="sv">5</div><div class="sl">SESSIONS</div></div>
      <div class="demo-stat"><div class="sv">14d</div><div class="sl">STREAK</div></div>
    </div>
  </div>

  <!-- BAR VISUALIZER -->
  <div class="viz-section">
    <div class="viz-label">FOCUS RHYTHM — LIVE SESSION VISUALIZER</div>
    <div class="bar-row" id="barViz"></div>
    <div style="font-size:11px;color:var(--muted);margin-top:12px;">
      Current session: <span style="color:var(--accent);font-weight:700">00:42:17</span> &nbsp;·&nbsp; Deep Work · Product Strategy
    </div>
  </div>

  <!-- METRICS STRIP -->
  <div class="metrics-strip">
    <div class="metric-item">
      <div class="metric-val">87.4h</div>
      <div class="metric-lbl">DEEP WORK THIS MONTH</div>
    </div>
    <div class="metric-item">
      <div class="metric-val">91%</div>
      <div class="metric-lbl">CONSISTENCY SCORE</div>
    </div>
    <div class="metric-item">
      <div class="metric-val">14d</div>
      <div class="metric-lbl">CURRENT STREAK</div>
    </div>
    <div class="metric-item">
      <div class="metric-val">9–11am</div>
      <div class="metric-lbl">PEAK FOCUS WINDOW</div>
    </div>
  </div>

  <!-- FEATURES -->
  <section class="section">
    <div class="section-eyebrow">Designed for Depth</div>
    <h2 class="section-title">Everything your mind needs to perform.</h2>
    <p class="section-sub">
      CORTEX is built around the science of deep work — not surface productivity theatre.
    </p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <div class="feature-title">Focus Sessions</div>
        <div class="feature-body">
          Timed deep work blocks with real-time bar visualizer showing your focus rhythm.
          Ambience modes: Rain, Lo-fi, Forest, Café, Silence.
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <div class="feature-title">Cognitive Insights</div>
        <div class="feature-body">
          30-day analytics with bar charts, peak hour heatmaps, and category breakdowns.
          Discover your optimal focus windows.
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <div class="feature-title">Goal Tracking</div>
        <div class="feature-body">
          Vertical daily progress bars, monthly targets, and a 31-day habit matrix.
          Visual streaks that make consistency compelling.
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🧠</div>
        <div class="feature-title">Cognitive Archetype</div>
        <div class="feature-body">
          CORTEX learns your patterns and labels your cognitive style — Deep Diver,
          Sprinter, Connector, or Flow State Creator.
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🌅</div>
        <div class="feature-title">Peak Hour Heatmap</div>
        <div class="feature-body">
          Hour-by-hour focus intensity map reveals your natural cognitive rhythms.
          Schedule your hardest work at your sharpest time.
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🏆</div>
        <div class="feature-title">Badges & Levels</div>
        <div class="feature-body">
          Earn focus badges: 28-Day Streak, 100h Club, Early Riser, Deep Thinker.
          Level up your cognitive profile from Apprentice to Focus Architect.
        </div>
      </div>
    </div>
  </section>

  <!-- HABIT MATRIX -->
  <div class="matrix-demo">
    <div class="matrix-title">HABIT TRACKER · APRIL 2026</div>
    <div class="habit-row">
      <div class="habit-name">Morning Focus</div>
      <div class="habit-cells" id="h1"></div>
    </div>
    <div class="habit-row">
      <div class="habit-name">No Phone AM</div>
      <div class="habit-cells" id="h2"></div>
    </div>
    <div class="habit-row">
      <div class="habit-name">Evening Wind-Down</div>
      <div class="habit-cells" id="h3"></div>
    </div>
  </div>

  <!-- CTA -->
  <section class="cta-section">
    <h2>Your mind is your most valuable asset.</h2>
    <p>Start training it like one. Free for your first 30 days.</p>
    <button class="btn-primary" style="font-size:16px;padding:16px 40px;">Begin Your Focus Journey →</button>
  </section>

  <footer>
    <div class="footer-brand">CORTEX</div>
    <div>Designed by RAM · ram.zenbin.org/cortex</div>
    <div>© 2026</div>
  </footer>

  <script>
    // Bar visualizer
    const bars = [62,71,84,91,88,79,92,86,74,68,82,95,89,77,83,91,78,66,88,94,85,72,80,88,91];
    const viz = document.getElementById('barViz');
    bars.forEach((v, i) => {
      const b = document.createElement('div');
      b.className = 'bar-col';
      b.style.height = v + '%';
      b.style.background = i === 12
        ? 'linear-gradient(to top, #7B61FF, #A893FF)'
        : i < 12
        ? 'rgba(123,97,255,0.55)'
        : 'rgba(123,97,255,0.18)';
      if (i === 12) b.style.boxShadow = '0 0 12px rgba(123,97,255,0.6)';
      viz.appendChild(b);
    });

    // Habit matrix
    const h1 = [1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1];
    const h2 = [1,1,0,0,1,1,1,0,0,1,1,1,0,1,1,1,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0];
    const h3 = [1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1];
    const colors = ['#7B61FF','#00E5FF','#00F0A0'];
    [[h1,'h1',0],[h2,'h2',1],[h3,'h3',2]].forEach(([data, id, ci]) => {
      const el = document.getElementById(id);
      data.forEach(v => {
        const c = document.createElement('div');
        c.className = 'habit-cell';
        c.style.background = v ? colors[ci] : 'rgba(234,232,255,0.06)';
        if (v) c.style.boxShadow = '0 0 4px ' + colors[ci] + '44';
        el.appendChild(c);
      });
    });
  </script>
</body>
</html>`;

// ─── VIEWER HTML ──────────────────────────────────────────────────────────────
let viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer.html', 'utf8');
const penJson = fs.readFileSync('/workspace/group/design-studio/cortex.pen', 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── PUBLISH ─────────────────────────────────────────────────────────────────
async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return post('zenbin.org', `/v1/pages/${slug}`, { 'X-Subdomain': SUBDOMAIN }, body);
}

(async () => {
  console.log('Publishing CORTEX hero page…');
  const r1 = await zenPut(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,120));

  console.log('Publishing CORTEX viewer…');
  const r2 = await zenPut(`${SLUG}-viewer`, `${APP_NAME} Viewer`, viewerHtml);
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,120));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})();
